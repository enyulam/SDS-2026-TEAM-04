-- =====================================================================
-- P2-11 CORRECTION -- `admin_create_trainer` RAISED AT RUNTIME. FORWARD FIX.
-- =====================================================================
--
-- ⛔ THE DEFECT, STATED PLAINLY. `20260815120000` APPLIED CLEANLY, PASSED ALL
--    NINE OF ITS OWN ASSERTIONS, AND SHIPPED A FUNCTION THAT COULD NOT RUN.
--
--      ERROR:  function pg_catalog.coalesce(text, unknown) does not exist
--      LINE 1: v_name := pg_catalog.btrim(pg_catalog.coalesce(p_display_nam...
--
--    `coalesce` is **SQL GRAMMAR, not a callable function** — the same class as
--    `position(… IN …)`, which this file's predecessor already hit and fixed at
--    authoring time. ▶ It cannot be schema-qualified, and under
--    `search_path = ''` the qualified form resolves to nothing.
--
-- ⚠️ WHY EVERY EXISTING GATE MISSED IT, WHICH IS THE PART WORTH KEEPING.
--    · **`plpgsql` does not resolve function names at `CREATE` time.** It
--      syntax-checks the body and defers name resolution to first execution, so
--      `CREATE FUNCTION` succeeded on a body that was already broken. The
--      earlier `position(… IN …)` fault WAS caught at create time only because
--      it was a SYNTAX error rather than a RESOLUTION one — a distinction that
--      is invisible while writing and decisive at runtime.
--    · **The nine apply-time assertions were all STRUCTURAL.** They proved the
--      signature, the security posture, the grant, the privilege sets and the
--      census. ▶ **Not one of them ever CALLED the function**, so all nine were
--      true of a function that raises on its first statement.
--
-- ▶ THE LESSON, AND IT GENERALISES BEYOND THIS FILE: *a migration that verifies
--   its own SHAPE has not verified that it WORKS.* `PC-10` below is the missing
--   kind of assertion — it EXECUTES the function and requires a governed answer.
--
-- ⛔ A NEW FORWARD MIGRATION, NEVER AN EDIT (`R-1`). `20260815120000` is
--    committed and applied; editing it would make the file disagree with every
--    database that already ran it, while `schema_migrations` still records the
--    old hash as applied.
--
-- ⛔ BOUNDARY UNCHANGED. Same authorization as its predecessor: ONE function,
--    ONE grant, no table, column, enum, policy or audit string, registry
--    unmoved. `CREATE OR REPLACE` on an identical signature preserves the
--    existing grant, so nothing is re-issued and nothing widens — `PC-12`
--    re-asserts the exact privilege sets anyway.
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
  -- ⚠️ THE ONE PLACE THE INVITATION LIFETIME LIVES. No instrument names a
  --    duration (`A-027` makes expiry a mechanism, not a value), so 7 days is
  --    this build's DISCLOSED default and a ruling changes exactly this line.
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
  --
  -- ⛔ `coalesce` AND `position(… IN …)` ARE BOTH SQL GRAMMAR AND NEITHER MAY
  --    BE SCHEMA-QUALIFIED. `btrim`, `lower`, `length`, `strpos` and
  --    `split_part` are ordinary functions and stay qualified, because under
  --    `search_path = ''` an unqualified one would not resolve at all. ▶ The
  --    two categories look identical in source and behave oppositely.
  v_name := pg_catalog.btrim(coalesce(p_display_name, ''));
  IF pg_catalog.length(v_name) = 0 OR pg_catalog.length(v_name) > 120 THEN
    o_reason := 'invalid_name';
    RETURN;
  END IF;

  -- ⚠️ NORMALIZED HERE, ONCE. Both `accounts_normalized_email_chk` and
  --    `invitations_email_normalized_chk` require lower(btrim(...)) with an
  --    `@` past position 1. Normalizing in the function means the two rows
  --    cannot disagree about which address was invited.
  v_email := pg_catalog.lower(pg_catalog.btrim(coalesce(p_email, '')));
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
  --    duplicate can have is that this person already exists here.
  --    `accounts_one_active_per_normalized_email_idx` would refuse it anyway;
  --    this turns a raised unique violation into a governed reason.
  IF EXISTS (
    SELECT 1 FROM public.accounts a
     WHERE a.normalized_email = v_email AND a.status = 'active'
  ) THEN
    o_reason := 'email_in_use';
    RETURN;
  END IF;

  -- ⛔ A PENDING INVITATION MUST BE REVOKED OR SUPERSEDED FIRST (`A-027`).
  --    ⚠️ Unreachable while the check above stands, and kept anyway: the two
  --    rules protect different things, and a later ruling permitting account
  --    reuse would leave this one carrying the whole weight.
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
  -- ⛔ The Auth linkage column is left UNWRITTEN — a profile is not a login
  --    (`A-020`/`A-025`), and no credential of any kind is stored (`A-027`).
  INSERT INTO public.accounts (display_name, normalized_email)
  VALUES (v_name, v_email)
  RETURNING id INTO v_new_account;

  -- ⛔ `pending`, NOT `active`. `centre_memberships_pending_chk` also requires
  --    `activated_at` and `deactivated_at` to stay NULL, which the defaults
  --    give. Activation is the RECIPIENT's act, never management's.
  INSERT INTO public.centre_memberships (account_id, centre_id, role, status)
  VALUES (v_new_account, v_centre_id, 'trainer', 'pending')
  RETURNING id INTO o_membership_id;

  -- ⚠️ `membership_role` is pinned by `trainer_profiles_role_pinned_chk` and by
  --    the composite FK; writing it is what lets that FK verify the membership
  --    really is a trainer of this centre.
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
  --    issued against it. Collapsing them would lose the second — the one that
  --    has an expiry and can be revoked or reissued.
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
    -- ⚠️ THE TTL, NOT THE ADDRESS. How long the invitation lives is governance;
    --    who it went to would be the disclosure §12 bars.
    pg_catalog.jsonb_build_object('ttl', c_invitation_ttl::text)
  );

  o_reason := 'created';
END;
$fn$;

-- =====================================================================
-- APPLY-TIME ASSERTIONS. ⛔ THE FIRST ONE IS THE POINT OF THIS FILE.
-- =====================================================================
DO $assert$
DECLARE
  v_reason text;
  v_privs  text;
  v_row    record;
  v_n      bigint;
  v_src    text;
BEGIN
  -- ⛔ PC-10 -- IT ACTUALLY EXECUTES. The assertion the original file lacked.
  --
  -- ⚠️ THIS BLOCK RUNS AS THE OWNER, so `app_current_account_id()` resolves to
  --    NULL and the function returns at its first gate with `not_permitted`.
  --    ▶ That is EXACTLY the coverage needed and no more: the failing statement
  --    was `v_name := btrim(coalesce(...))`, three lines past that gate, so a
  --    resolution error anywhere in the body would raise here rather than
  --    return a reason. **A structural assertion could never have caught it;
  --    this one cannot miss it.**
  --
  -- ⚠️ AND IT IS A REFUSAL, NOT A CREATION — nothing is written by this check.
  SELECT o_reason INTO v_reason FROM public.admin_create_trainer('Assert Probe', 'assert@example.test');
  IF v_reason IS DISTINCT FROM 'not_permitted' THEN
    RAISE EXCEPTION 'PC-10 FAILED: the function executed but answered "%" instead of the fail-closed not_permitted expected of an ownerless caller', v_reason;
  END IF;
  RAISE NOTICE 'PASS PC-10 the function EXECUTES END TO END and fails closed (%) -- the runtime leg the original migration did not have', v_reason;

  -- PC-11 -- NO QUALIFIED SQL-GRAMMAR CONSTRUCT SURVIVES ANYWHERE IN THE BODY.
  --          ⚠️ A CLASS CHECK, not a spot fix: `coalesce`, `position(… IN …)`,
  --          `extract`, `overlay`, `substring(… FROM …)` and `trim(… FROM …)`
  --          are all grammar, and qualifying any of them fails the same way.
  SELECT p.prosrc INTO v_src
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'admin_create_trainer';
  IF v_src ~ 'pg_catalog\.(coalesce|position|extract|overlay|nullif)\s*\(' THEN
    RAISE EXCEPTION 'PC-11 FAILED: the body still schema-qualifies a SQL-grammar construct -- it will raise at runtime, not at CREATE';
  END IF;
  RAISE NOTICE 'PASS PC-11 no SQL-grammar construct is schema-qualified anywhere in the body';

  -- PC-12 -- THE BOUNDARY IS STILL EXACTLY WHERE IT WAS.
  --          `CREATE OR REPLACE` on an identical signature preserves the grant,
  --          so this is a re-assertion rather than a restoration.
  IF NOT pg_catalog.has_function_privilege('authenticated', 'public.admin_create_trainer(text, text)', 'EXECUTE')
     OR pg_catalog.has_function_privilege('anon', 'public.admin_create_trainer(text, text)', 'EXECUTE') THEN
    RAISE EXCEPTION 'PC-12 FAILED: the EXECUTE grant moved -- expected authenticated only';
  END IF;
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
      RAISE EXCEPTION 'PC-12 FAILED: authenticated holds "%" on public.% (expected "%")', v_privs, v_row.tbl, v_row.expected;
    END IF;
  END LOOP;

  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  IF v_n <> 30 THEN RAISE EXCEPTION 'PC-12 FAILED: table count moved to %', v_n; END IF;
  SELECT pg_catalog.array_length(public.audit_action_registry(), 1) INTO v_n;
  IF v_n <> 23 THEN RAISE EXCEPTION 'PC-12 FAILED: the audit registry moved to %', v_n; END IF;

  RAISE NOTICE 'PASS PC-12 the grant, the four exact privilege sets, the table count and the registry are all UNMOVED';
END
$assert$;
