-- =====================================================================
-- PORTAL PHASE P2-11 -- `admin_create_trainer`: the trainer invitation path
-- =====================================================================
--
-- ⛔ OPERATOR AUTHORIZATION, 2026-08-15, quoted because it is also the exact
--    BOUNDARY of this file:
--
--      *"P2-11 SCHEMA — AUTHORIZED as stated: **one `SECURITY DEFINER`
--       function, one `EXECUTE` grant, no table, column, enum, policy or audit
--       string. Registry unmoved**, since both strings exist. ⚠️ **Assert the
--       boundary:** the function must not widen anything beyond the invitation
--       it creates. **No grant to `authenticated` on `invitations`, `accounts`
--       or `centre_memberships` — they stay SELECT-only.**"*
--
--    ▶ It needs nothing beyond that. Assertions `PC-4` … `PC-9` fail this
--    migration outright if any of it moved, and `PC-5` asserts the three
--    named tables' privilege sets as EXACT SETS rather than as a floor.
--
-- ⚠️ WHY A FUNCTION AND NOT A POLICY. `ADR-3`: governed mutations go through
--    reviewed, constrained `SECURITY DEFINER` RPCs, and **no governed direct
--    client DML exists anywhere**. A policy admitting an `INSERT` would let a
--    caller compose the four rows in any combination they liked — including a
--    membership with no invitation, or an invitation naming a membership that
--    was never created. ▶ The four inserts are ONE governed action, and only a
--    function can make them atomic and inseparable.
--
-- ⛔ WHAT THIS FUNCTION DOES NOT DO, AND MUST NEVER DO.
--    It creates **NO Auth user** and stores **NO credential**. `A-027` is
--    absolute: no application table may hold a token, OTP, password, access or
--    refresh token, or secret hash — enforced by the ABSENCE of any column
--    capable of holding one, which is why this file adds none. Supabase Auth
--    owns the credential; the recipient establishes their own on acceptance.
--    ▶ `accounts.auth_user_id` is written **NULL**: a profile is not a login
--    (`A-020`/`A-025`), and the membership is `pending`, so it is not an
--    active login identity either.
--
-- ⛔ NO ROLE PARAMETER. `GC-11` (pack `24`, ruling `Q-24`) bars the frame's
--    `Role` dropdown, on grounds re-attributed in 2026-08-08 Phase A2 S-53 and
--    NOT re-derived here: `Assistant Trainer` is **not a member of the
--    `centre_membership_role` enum**, so the option cannot be persisted at
--    all. The role is pinned to `trainer` inside this function and cannot be
--    chosen by a caller. TA remains a deferred persona (`A-014`, `G-7`).
--
-- ⚠️ THE INVITATION LIFETIME IS A CHOSEN DEFAULT, DISCLOSED, NOT RULED.
--    `A-027` makes application-invitation expiry a real mechanism and makes it
--    SEPARATE from Auth-link expiry, but no instrument names a duration and no
--    duration exists anywhere in the tree — measured before writing. **7 days
--    is this file's choice**, held in ONE named constant so a ruling changes
--    one line. ▶ Recorded as an open default in `STATUS.md` rather than
--    presented as settled.
--
-- ⚠️ TRANSACTIONAL. `supabase migration up` applies this in one transaction.
-- =====================================================================

CREATE OR REPLACE FUNCTION public.admin_create_trainer(
  p_display_name text,
  p_email        text,
  OUT o_membership_id uuid,
  OUT o_invitation_id uuid,
  OUT o_reason        text
)
RETURNS record
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  -- ⚠️ THE ONE PLACE THE LIFETIME LIVES. See the header.
  c_invitation_ttl CONSTANT interval := '7 days';

  v_account_id    uuid;
  v_membership_id uuid;
  v_centre_id     uuid;
  v_name          text;
  v_email         text;
  v_new_account   uuid;
BEGIN
  -- ⛔ FAIL CLOSED FIRST. Every early return leaves both ids NULL and the
  --    reason `not_permitted`, so a refusal is never mistaken for a creation
  --    that produced nothing (`Q-7`: a refusal is not an empty result).
  o_membership_id := NULL;
  o_invitation_id := NULL;
  o_reason        := 'not_permitted';

  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  -- ⛔ AUTHORIZATION IS RE-RESOLVED LIVE, never taken from a claim (`ADR-4`).
  --    `HAVING count(*) = 1` is deliberate: an account holding two active
  --    management memberships is an ambiguity, and this refuses rather than
  --    picking one.
  SELECT (pg_catalog.array_agg(m.id))[1], (pg_catalog.array_agg(m.centre_id))[1]
    INTO v_membership_id, v_centre_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.role = 'management' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN RETURN; END IF;

  -- ── Validation. Authorization has already succeeded, so from here a reason
  --    is a diagnostic for someone the database proved is active management.
  v_name := pg_catalog.btrim(pg_catalog.coalesce(p_display_name, ''));
  IF pg_catalog.length(v_name) = 0 OR pg_catalog.length(v_name) > 120 THEN
    o_reason := 'invalid_name';
    RETURN;
  END IF;

  -- ⚠️ NORMALIZED HERE, ONCE. Both `accounts_normalized_email_chk` and
  --    `invitations_email_normalized_chk` require lower(btrim(...)) with an
  --    `@` past position 1. Normalizing in the function means the two rows
  --    cannot disagree about which address was invited.
  --    ⚠️ `pg_catalog.strpos(h, n)`, NOT `position(n IN h)`. `position(… IN …)`
  --    is SQL GRAMMAR rather than a callable function, so it cannot be
  --    schema-qualified and is a syntax error under `search_path = ''`. The
  --    two are otherwise the same function.
  v_email := pg_catalog.lower(pg_catalog.btrim(pg_catalog.coalesce(p_email, '')));
  IF pg_catalog.length(v_email) < 3
     OR pg_catalog.strpos(v_email, '@') < 2
     OR pg_catalog.strpos(pg_catalog.split_part(v_email, '@', 2), '.') < 2
     OR v_email ~ '\s' THEN
    o_reason := 'invalid_email';
    RETURN;
  END IF;

  -- ⛔ AN EXISTING ACTIVE ACCOUNT IS A REFUSAL, NOT A SECOND IDENTITY.
  --    `A-027`: an existing account is REUSED when the same person is invited
  --    to a later centre — never a second identity. ▶ This MVP is ONE centre
  --    (`A-015`), so "a later centre" cannot arise and the only meaning a
  --    duplicate can have is that this person already exists here. Refusing
  --    is the honest answer; `accounts_one_active_per_normalized_email_idx`
  --    would refuse it anyway, and this turns a raised unique violation into
  --    a governed reason.
  IF EXISTS (
    SELECT 1 FROM public.accounts a
     WHERE a.normalized_email = v_email AND a.status = 'active'
  ) THEN
    o_reason := 'email_in_use';
    RETURN;
  END IF;

  -- ⛔ A PENDING INVITATION MUST BE REVOKED OR SUPERSEDED FIRST (`A-027`).
  --    `invitations_one_pending_per_centre_email_idx` enforces it; this
  --    reports it as a governed reason instead of a constraint error.
  --    ⚠️ Unreachable in practice while the check above stands, and kept
  --    anyway: the two rules protect different things and a later ruling that
  --    permits account reuse would leave this one carrying the whole weight.
  IF EXISTS (
    SELECT 1 FROM public.invitations i
     WHERE i.centre_id = v_centre_id AND i.email_normalized = v_email
       AND i.status = 'pending'
  ) THEN
    o_reason := 'invitation_pending';
    RETURN;
  END IF;

  -- ── The four rows. ONE governed action, one transaction.
  --
  -- ⛔ `auth_user_id` NULL — see the header. A profile is not a login.
  INSERT INTO public.accounts (display_name, normalized_email)
  VALUES (v_name, v_email)
  RETURNING id INTO v_new_account;

  -- ⛔ `pending`, NOT `active`. `centre_memberships_pending_chk` also requires
  --    `activated_at` and `deactivated_at` to stay NULL, which the defaults
  --    give. Activation is the RECIPIENT's act, never management's.
  INSERT INTO public.centre_memberships (account_id, centre_id, role, status)
  VALUES (v_new_account, v_centre_id, 'trainer', 'pending')
  RETURNING id INTO o_membership_id;

  -- ⚠️ `membership_role` is pinned by `trainer_profiles_role_pinned_chk` and
  --    by the composite FK; writing it here is what lets that FK verify the
  --    membership really is a trainer of this centre.
  INSERT INTO public.trainer_profiles (membership_id, centre_id, membership_role)
  VALUES (o_membership_id, v_centre_id, 'trainer');

  INSERT INTO public.invitations
    (centre_id, membership_id, invited_by_membership_id, invited_by_role,
     email_normalized, status, expires_at)
  VALUES
    (v_centre_id, o_membership_id, v_membership_id, 'management',
     v_email, 'pending', pg_catalog.now() + c_invitation_ttl)
  RETURNING id INTO o_invitation_id;

  -- ── Audit. TWO events, because there are TWO governed actions (`A-029`
  --    counts ACTIONS): a profile came into existence, and an invitation was
  --    issued against it. Collapsing them would lose the second, which is the
  --    one that has an expiry and can be revoked or reissued.
  --
  -- ⛔ NEITHER THE NAME NOR THE EMAIL APPEARS IN ANY LABEL OR PAYLOAD.
  --    `A-029` data minimization, and `CLAUDE.md` §12 makes putting an account
  --    name or email into an audit label or payload a STOP-AND-ASK. The labels
  --    are TYPE labels; the identity is recoverable by id, from a row that is
  --    itself access-controlled.
  PERFORM public.audit_append_event(
    v_centre_id, v_account_id, v_membership_id, 'management',
    'admin.profile_created', NULL, NULL, NULL,
    'centre_membership', o_membership_id, 'Trainer membership',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'target_type', 'account', 'target_id', v_new_account::text,
        'target_label', 'Account')
    ),
    pg_catalog.jsonb_build_object('membership_role', 'trainer', 'membership_status', 'pending')
  );

  PERFORM public.audit_append_event(
    v_centre_id, v_account_id, v_membership_id, 'management',
    'invitation.created', NULL, NULL, NULL,
    'invitation', o_invitation_id, 'Invitation',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'target_type', 'centre_membership', 'target_id', o_membership_id::text,
        'target_label', 'Trainer membership')
    ),
    -- ⚠️ THE TTL, NOT THE ADDRESS. Recording how long the invitation lives is
    --    governance; recording who it went to would be the disclosure §12 bars.
    pg_catalog.jsonb_build_object('ttl', c_invitation_ttl::text)
  );

  o_reason := 'created';
END;
$fn$;

COMMENT ON FUNCTION public.admin_create_trainer(text, text) IS
  'P2-11. Management creates a trainer profile and its invitation as one governed action. '
  'Creates no Auth user and stores no credential (A-027). Membership is pending; role is pinned '
  'to trainer and is not a caller parameter (GC-11). Emits admin.profile_created and '
  'invitation.created; the registry is not extended.';

-- ⛔ THE ONE GRANT. `authenticated` only — never `anon`, never `PUBLIC`.
REVOKE ALL ON FUNCTION public.admin_create_trainer(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_create_trainer(text, text) TO authenticated;

-- =====================================================================
-- APPLY-TIME ASSERTIONS. A migration that does not verify itself is a
-- migration that ran, not a migration that worked.
-- =====================================================================
DO $assert$
DECLARE
  v_n     bigint;
  v_src   text;
  v_privs text;
  v_row   record;
BEGIN
  -- PC-1 -- THE FUNCTION EXISTS with the authorized signature and posture.
  --         ⚠️ `search_path=""` IS THE STORED FORM, measured in `pg_proc`
  --         rather than assumed from the `SET search_path = ''` that produced
  --         it. ⚠️ And `pg_get_function_identity_arguments` INCLUDES the `OUT`
  --         parameters here, which is why the expected string carries all five
  --         — pinning it is what makes an added or reordered parameter fail
  --         this migration instead of silently changing the PostgREST shape.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'admin_create_trainer'
     AND p.prosecdef
     AND p.proconfig @> ARRAY['search_path=""']
     AND pg_catalog.pg_get_function_identity_arguments(p.oid) =
         'p_display_name text, p_email text, OUT o_membership_id uuid, OUT o_invitation_id uuid, OUT o_reason text';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'PC-1 FAILED: expected exactly one SECURITY DEFINER admin_create_trainer with the authorized signature and search_path pinned, found %', v_n;
  END IF;
  RAISE NOTICE 'PASS PC-1  admin_create_trainer exists with the authorized two-in/three-out signature, SECURITY DEFINER, search_path pinned';

  SELECT p.prosrc INTO v_src
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'admin_create_trainer';

  -- PC-2 -- IT FAILS CLOSED and pins the role rather than accepting one.
  IF pg_catalog.strpos(v_src, 'o_reason        := ''not_permitted''') = 0 THEN
    RAISE EXCEPTION 'PC-2 FAILED: the fail-closed default reason is gone';
  END IF;
  IF pg_catalog.strpos(v_src, '''trainer'', ''pending''') = 0 THEN
    RAISE EXCEPTION 'PC-2 FAILED: the membership is not created as a PINNED trainer at PENDING -- GC-11 bars a caller-chosen role and A-027 bars an active one';
  END IF;
  RAISE NOTICE 'PASS PC-2  fail-closed default intact; the membership is pinned trainer/pending and the role is not a parameter';

  -- PC-3 -- NO CREDENTIAL, NO AUTH USER, NO NAME OR EMAIL IN THE AUDIT.
  --         ⚠️ ASSERTED OVER THE INSERT'S COLUMN LIST, NOT OVER THE TOKEN
  --         `auth_user_id`. `prosrc` INCLUDES COMMENTS, so a token scan would
  --         be tripped by the comment that EXPLAINS the rule — the detector
  --         firing on its own documentation, which this project has already
  --         caught once. ▶ The column list is the stronger property anyway:
  --         it proves the Auth linkage is not written, whatever the prose says.
  IF pg_catalog.strpos(v_src, 'INSERT INTO public.accounts (display_name, normalized_email)') = 0 THEN
    RAISE EXCEPTION 'PC-3 FAILED: the accounts insert does not write EXACTLY (display_name, normalized_email) -- A-020/A-027: this function creates a PROFILE, never a login';
  END IF;
  IF pg_catalog.strpos(v_src, 'auth.users') > 0 THEN
    RAISE EXCEPTION 'PC-3 FAILED: the body reaches into auth.users -- Supabase Auth owns the credential and this function must never touch it';
  END IF;
  IF pg_catalog.strpos(v_src, '''target_label'', v_name') > 0
     OR pg_catalog.strpos(v_src, '''email'', v_email') > 0
     OR pg_catalog.strpos(v_src, 'jsonb_build_object(''display_name''') > 0 THEN
    RAISE EXCEPTION 'PC-3 FAILED: the name or email reaches an audit label or payload -- CLAUDE.md §12 makes that a stop-and-ask, not a style point';
  END IF;
  RAISE NOTICE 'PASS PC-3  no Auth user, no credential column, and neither the name nor the email reaches an audit label or payload (A-029)';

  -- PC-4 -- THE ONE GRANT, AND ONLY THE ONE.
  IF NOT pg_catalog.has_function_privilege('authenticated', 'public.admin_create_trainer(text, text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'PC-4 FAILED: authenticated holds no EXECUTE -- the function is unreachable';
  END IF;
  IF pg_catalog.has_function_privilege('anon', 'public.admin_create_trainer(text, text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'PC-4 FAILED: anon holds EXECUTE -- an unauthenticated caller could create staff';
  END IF;
  RAISE NOTICE 'PASS PC-4  EXECUTE granted to authenticated and to nobody else';

  -- PC-5 -- ⛔ THE BOUNDARY THE OPERATOR NAMED, ASSERTED AS AN EXACT SET.
  --         *"No grant to authenticated on invitations, accounts or
  --          centre_memberships -- they stay SELECT-only."*
  --         ⚠️ An EXACT SET, not a floor: a `<> 'SELECT'` test would pass a
  --         table that ALSO carries INSERT, which is precisely the widening
  --         this assertion exists to refuse.
  --
  --         ⛔ AND THE EXPECTED VALUES ARE MEASURED, NOT ASSUMED FROM THE
  --         AUTHORIZATION'S WORDING. The Operator wrote *"they stay
  --         SELECT-only"*; `invitations` in fact holds **NO grant to
  --         `authenticated` at all**, which is NARROWER still. Pinning the
  --         real value rather than the paraphrase is what makes this leg able
  --         to fail: expecting `SELECT` on a table that has none would have
  --         reported a violation on a correct schema, and expecting a floor
  --         would have missed the widening entirely.
  FOR v_row IN
    SELECT * FROM (VALUES
      ('invitations',        '(none)'),
      ('accounts',           'SELECT'),
      ('centre_memberships', 'SELECT'),
      ('trainer_profiles',   'SELECT')
    ) AS e(tbl, expected)
  LOOP
    SELECT coalesce(
             pg_catalog.string_agg(DISTINCT g.privilege_type::text, ',' ORDER BY g.privilege_type::text),
             '(none)')
      INTO v_privs
      FROM information_schema.role_table_grants g
     WHERE g.table_schema = 'public' AND g.table_name::text = v_row.tbl AND g.grantee = 'authenticated';
    IF v_privs <> v_row.expected THEN
      RAISE EXCEPTION 'PC-5 FAILED: authenticated holds "%" on public.% (expected "%") -- this function widens NOTHING beyond the invitation it creates',
        v_privs, v_row.tbl, v_row.expected;
    END IF;
  END LOOP;
  RAISE NOTICE 'PASS PC-5  authenticated holds EXACTLY: none on invitations, SELECT on accounts, centre_memberships and trainer_profiles -- pinned per table, so an added INSERT anywhere fails this migration';

  -- PC-6 .. PC-9 -- THE REST OF THE AUTHORIZATION'S BOUNDARY, as equalities.
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  IF v_n <> 30 THEN RAISE EXCEPTION 'PC-6 FAILED: table count moved to % (expected 30) -- "no table" was explicit', v_n; END IF;

  SELECT pg_catalog.count(DISTINCT t.typname) INTO v_n
    FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN RAISE EXCEPTION 'PC-7 FAILED: enum count moved to % (expected 12) -- "no enum" was explicit', v_n; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_policies WHERE schemaname = 'public';
  IF v_n <> 30 THEN RAISE EXCEPTION 'PC-8 FAILED: policy count moved to % (expected 30) -- "no policy" was explicit', v_n; END IF;

  SELECT pg_catalog.array_length(public.audit_action_registry(), 1) INTO v_n;
  IF v_n <> 23 THEN RAISE EXCEPTION 'PC-9 FAILED: the audit registry moved to % (expected 23) -- "Registry unmoved, since both strings exist" was explicit', v_n; END IF;

  RAISE NOTICE 'PASS PC-6..PC-9  tables 30, enums 12, policies 30, registry 23 -- ALL UNMOVED';
END
$assert$;
