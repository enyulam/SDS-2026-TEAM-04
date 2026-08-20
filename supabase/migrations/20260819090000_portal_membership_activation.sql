-- =====================================================================
-- MANAGEMENT MEMBERSHIP ACTIVATION -- the dead end closed.
-- =====================================================================
-- ⛔ WHAT THIS ADDS, NAMED AND NOT COUNTED:
--      audit string : 'membership.activated'          registry 24 -> 25
--      function     : public.admin_activate_membership(uuid)
--      grant        : EXECUTE to `authenticated`
--    NOTHING ELSE. No table, column, enum, policy, client table grant,
--    index or bucket. `centre_memberships` already carries `status`,
--    `activated_at` and `updated_at`, measured at HEAD.
--
-- ---------------------------------------------------------------------
-- ⛔ WHY THE STRING IS NEW, AND WHY NEITHER EXISTING NAME WOULD DO
-- ---------------------------------------------------------------------
-- Operator ruling, 2026-08-19, stated in advance and authorized before this
-- file was written. Both candidates were measured and rejected:
--
--   `membership.role_changed` names a ROLE change, and `A-025` is explicit:
--     *"a role change deactivates the old membership and creates a new one;
--     it never overwrites a live row."* ▶ That is a TWO-ROW operation on a
--     DIFFERENT ATTRIBUTE. Activation is a ONE-ROW `pending -> active`
--     status transition with the role unchanged.
--
--   `membership.bootstrap` is the reserved system-origin action -- Step 7H
--     §5.4 makes it *"the only system-actor-allowed action"* and it is
--     REJECTED ON THE AUTHENTICATED PATH, which is the only path a manager
--     can call on. Its design is additionally "name reserved only,
--     deferred with N-4".
--
-- ▶ Reusing either would run the `evidence.uploaded` / `evidence.attached`
--   lesson BACKWARDS: **`A-029` forbids ONE NAME FOR TWO ACTIONS exactly as
--   firmly as it forbids two names for one.**
--
-- ⛔ THE PROHIBITION RE-ARMS. A further membership action is a fresh
--    `CLAUDE.md` §12 stop-and-ask. This is not a standing licence.
--
-- ---------------------------------------------------------------------
-- ⛔ ROLE-AGNOSTIC, BY RULING AND BY CONSTRUCTION
-- ---------------------------------------------------------------------
-- Operator: *"Build it over `centre_memberships` without a role condition …
-- restricting to trainers is the added condition rather than widening being
-- the added reach, and the hole is identical for parents."*
--
-- ⚠️ Both live pending rows -- one trainer, one parent -- were created during
--    an Operator walk on 2026-08-18. The dead end was hit twice, in one pass,
--    by the person who ruled on it.
--
-- ---------------------------------------------------------------------
-- ⛔ WHAT THIS IS NOT
-- ---------------------------------------------------------------------
-- No invitation delivery, no acceptance-by-recipient, no token flow. Those
-- stay deferred under `G-04`. **This is a manager activating a record they
-- created, not a recipient accepting an invitation** -- so no `invitations`
-- row is read, written or consulted here, and the invitation lifecycle
-- (`pending`/`accepted`/`expired`/`revoked`) is untouched.
--
-- ⚠️ THE FINDING THIS CLOSES, recorded because it is larger than the fix:
--    the fixture's `active` memberships were INSERTED DIRECTLY as `active`
--    and never travelled a workflow. ▶ The absence was not under-tested, it
--    was UNOBSERVABLE -- no state existed in which a correct system and a
--    broken one would have differed. **A FIXTURE THAT BEGINS IN THE END
--    STATE CANNOT EXERCISE THE PATH TO IT.**
-- =====================================================================

BEGIN;

-- ===========================================================================
-- 1 . The registry, 24 -> 25. ONE DECLARATION SITE (`P1-2` consolidated it).
-- ===========================================================================
CREATE OR REPLACE FUNCTION public.audit_action_registry()
 RETURNS text[]
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$
  SELECT ARRAY[
    'report.created',
    'report_version.created',
    'report.state_changed',
    'attendance.changed',
    'admin.module_created',
    'admin.session_created',
    'admin.trainer_assigned',
    'admin.student_created',
    'admin.enrolment_changed',
    'admin.parent_link_changed',
    'admin.profile_created',
    'invitation.created',
    'invitation.revoked',
    'invitation.reissued',
    'membership.role_changed',
    'membership.bootstrap',
    -- A-057 as amended by C-4 and its collapse ruling, 2026-08-11. 16 -> 19.
    -- ⛔ The prohibition RE-ARMS AT THREE: a fourth evidence action is a fresh
    --    CLAUDE.md §12 stop-and-ask. evidence.uploaded was COLLAPSED into
    --    evidence.attached and must not be reintroduced -- a second name for
    --    one action is the defect the collapse closed.
    'evidence.attached',
    'evidence.accessed',
    'evidence.removed',
    -- A-057 as further amended by the Operator ruling of 2026-08-13, in the
    -- C-4 shape. 19 -> 21.
    'admin.module_updated',
    'admin.session_updated',
    -- A-057 as further amended by the Operator ruling of 2026-08-13/14, same
    -- shape. 21 -> 23. Both strings and the count were STATED IN ADVANCE and
    -- approved before that migration was written.
    --
    -- ⛔ EXACTLY TWO. `material.attached` collapses upload-and-attach for the
    --    reason C-4 gave for evidence: no authorized workflow leaves an
    --    object unattached, and A-029 binds one event per governed ACTION.
    --    ⛔ Do NOT introduce `material.uploaded`.
    --
    -- ⛔ `material.accessed` IS DELIBERATELY ABSENT AND ITS ABSENCE IS RULED,
    --    not overlooked. A slide deck carries no child's data, and A-029 plus
    --    the P2-4 precedent hold that a READ IS NOT A GOVERNED ACTION. A
    --    download here emits nothing.
    --
    -- ⛔ This ruling is not a standing licence. A third material action is a
    --    fresh CLAUDE.md §12 stop-and-ask.
    'material.attached',
    'material.removed',
    -- A-057 as further amended by the Operator ruling of 2026-08-16, in the
    -- C-4 shape. 23 -> 24. The string and the count were STATED IN ADVANCE
    -- and authorized before this file was written.
    --
    -- ⛔ EXACTLY ONE, AND THE WITHDRAWAL SHARES IT. A withdrawal is a student
    --    STATE CHANGE plus one `admin.enrolment_changed` per class; both of
    --    those actions already have names, and A-029 counts ACTIONS. Minting
    --    `admin.student_withdrawn` would be a SECOND NAME for something
    --    already named -- the defect the `evidence.uploaded` collapse closed.
    --
    -- ⛔ THE PROHIBITION RE-ARMS. A further student action is a fresh
    --    CLAUDE.md §12 stop-and-ask; this is not a standing licence.
    'admin.student_updated',
    -- A-057 as further amended by the Operator ruling of 2026-08-19, in the
    -- C-4 shape. 24 -> 25. The string and the count were STATED IN ADVANCE
    -- and authorized before this file was written.
    --
    -- ⛔ EXACTLY ONE, AND IT NAMES A STATUS TRANSITION, NOT A ROLE CHANGE.
    --    `membership.role_changed` is a TWO-ROW operation on a DIFFERENT
    --    attribute (A-025 deactivates and re-creates; it never overwrites a
    --    live row). `membership.bootstrap` is system-origin and is rejected
    --    on the authenticated path a manager must use. ▶ Reusing either is
    --    the evidence.uploaded/attached lesson backwards: A-029 forbids ONE
    --    NAME FOR TWO ACTIONS as firmly as two names for one.
    --
    -- ⛔ DEACTIVATION IS NOT ADDED AND MUST NOT BE INFERRED FROM THIS. The
    --    column exists; the action does not, and no workflow is authorized.
    --
    -- ⛔ THE PROHIBITION RE-ARMS. A further membership action is a fresh
    --    CLAUDE.md §12 stop-and-ask.
    'membership.activated'
  ];
$function$;

-- ===========================================================================
-- 2 . The activation path.
-- ===========================================================================
CREATE OR REPLACE FUNCTION public.admin_activate_membership(
  p_membership_id uuid,
  OUT o_reason    text,
  OUT o_activated boolean
)
RETURNS record
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_account_id     uuid;
  v_membership_id  uuid;
  v_centre_id      uuid;
  v_target_role    public.centre_membership_role;
  v_target_status  public.centre_membership_status;
BEGIN
  o_reason := 'not_permitted';
  o_activated := false;

  v_account_id := (SELECT a.id FROM public.accounts a
                    WHERE a.auth_user_id = pg_catalog.nullif(
                            pg_catalog.current_setting('request.jwt.claims', true)::jsonb ->> 'sub', '')::uuid
                      AND a.status = 'active');
  IF v_account_id IS NULL THEN RETURN; END IF;

  -- ⛔ AUTHORIZATION IS RE-RESOLVED LIVE, never taken from a claim (`ADR-4`).
  --    `HAVING count(*) = 1` is deliberate and matches `P2-11`: an account
  --    holding two active management memberships is an ambiguity, and this
  --    refuses rather than picking one.
  SELECT (pg_catalog.array_agg(m.id))[1], (pg_catalog.array_agg(m.centre_id))[1]
    INTO v_membership_id, v_centre_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.role = 'management' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN RETURN; END IF;

  -- ⛔ CENTRE-SCOPED. The target must be in the caller's OWN centre. A
  --    membership elsewhere is indistinguishable from one that does not
  --    exist, which is the correct disclosure: `not_permitted`, not
  --    `not_found`.
  SELECT m.role, m.status INTO v_target_role, v_target_status
    FROM public.centre_memberships m
   WHERE m.id = p_membership_id AND m.centre_id = v_centre_id;
  IF v_target_role IS NULL THEN RETURN; END IF;

  -- ── Authorization has succeeded. From here a reason is a diagnostic for
  --    someone the database has proved is active management.
  --
  -- ⛔ NO ROLE CONDITION, BY RULING. The hole is identical for a parent, and
  --    restricting to trainers would be the ADDED condition. A management
  --    membership is reachable too and that is deliberate: it is already
  --    active in every real case, so the guard below refuses it as a no-op
  --    rather than a special case.
  IF v_target_status <> 'pending' THEN
    -- ⚠️ A COMPARE-AND-SET, AND A REFUSAL RATHER THAN A SILENT NO-OP. An
    --    already-active membership returns a reason and writes nothing: the
    --    caller learns the transition did not happen, and no audit event
    --    records an action that never occurred.
    o_reason := 'not_pending';
    RETURN;
  END IF;

  UPDATE public.centre_memberships
     SET status       = 'active',
         activated_at = pg_catalog.now(),
         updated_at   = pg_catalog.now()
   WHERE id = p_membership_id
     AND centre_id = v_centre_id
     AND status = 'pending';
  IF NOT FOUND THEN
    -- ⛔ THE GUARD IS ON THE UPDATE ITSELF, not only on the read above. Two
    --    managers activating the same row concurrently: the second matches
    --    zero rows and refuses, rather than emitting a second event for one
    --    transition.
    o_reason := 'not_pending';
    RETURN;
  END IF;

  -- ── Audit. ONE event for ONE governed action (`A-029`), in the same
  --    transaction as the transition (`CLAUDE.md` §4 non-negotiable 2).
  --
  -- ⛔ NO NAME, EMAIL OR PHONE APPEARS IN THE LABEL OR THE PAYLOAD. `A-029`
  --    data minimization, and `CLAUDE.md` §12 makes putting an account name
  --    or email into an audit label or payload a STOP-AND-ASK. The label is
  --    a TYPE label; identity is recoverable by id from an access-controlled
  --    row.
  --
  -- ⚠️ THE GENERIC STATE TRIPLE IS WHAT CARRIES THE MEANING (`A-029`):
  --    domain `centre_membership`, from `pending`, to `active`. A reader
  --    reconstructs the transition without the payload having to describe it.
  PERFORM public.audit_append_event(
    v_centre_id, v_account_id, v_membership_id, 'management',
    'membership.activated',
    'centre_membership', 'pending', 'active',
    'centre_membership', p_membership_id, 'Centre membership',
    NULL,
    pg_catalog.jsonb_build_object('role', v_target_role::text)
  );

  o_reason := 'activated';
  o_activated := true;
END;
$fn$;

REVOKE ALL ON FUNCTION public.admin_activate_membership(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_activate_membership(uuid) TO authenticated;

-- =====================================================================
-- ASSERTIONS. Every one fails the migration outright.
-- =====================================================================
DO $assert$
DECLARE
  v_count  bigint;
  v_grants text[];
  v_rec    record;
  v_chain  record;
BEGIN
  -- AC-1: ⛔ THE REGISTRY IS EXACTLY 25 AND THE NEW STRING IS THE AUTHORIZED
  -- ONE. Both the count and the name were stated in advance.
  SELECT pg_catalog.array_length(public.audit_action_registry(), 1) INTO v_count;
  IF v_count <> 25 THEN
    RAISE EXCEPTION 'AC-1 FAILED: registry is % (expected exactly 25)', v_count;
  END IF;
  IF NOT (public.audit_action_registry() @> ARRAY['membership.activated']) THEN
    RAISE EXCEPTION 'AC-1 FAILED: membership.activated is not in the registry';
  END IF;
  IF public.audit_action_registry() @> ARRAY['membership.deactivated']
     OR public.audit_action_registry() @> ARRAY['invitation.accepted'] THEN
    RAISE EXCEPTION 'AC-1 FAILED: a SECOND string was added -- exactly one was authorized';
  END IF;
  IF (SELECT pg_catalog.count(*) FROM pg_catalog.unnest(public.audit_action_registry()) AS t(a)) <>
     (SELECT pg_catalog.count(DISTINCT a) FROM pg_catalog.unnest(public.audit_action_registry()) AS t(a)) THEN
    RAISE EXCEPTION 'AC-1 FAILED: the registry contains a duplicate string';
  END IF;
  RAISE NOTICE 'AC-1 PASS  registry 24 -> 25, exactly one string, no deactivation and no acceptance name';

  -- AC-2: the function's security posture.
  -- ⚠️ `SET search_path = ''` is stored by this PostgreSQL as `search_path=""`
  --    WITH the quotes. Measured at P2-18, where the unquoted form aborted a
  --    correct migration.
  SELECT pg_catalog.count(*) INTO v_count
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'admin_activate_membership'
     AND p.prosecdef AND p.provolatile = 'v'
     AND (p.proconfig @> ARRAY['search_path=""'] OR p.proconfig @> ARRAY['search_path=']);
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'AC-2 FAILED: posture is not SECURITY DEFINER + VOLATILE + empty search_path';
  END IF;
  RAISE NOTICE 'AC-2 PASS  SECURITY DEFINER, VOLATILE, search_path pinned empty';

  -- AC-3: ⛔ THE GRANT SET IS EXACT, NOT MERELY PRESENT. PostgreSQL grants
  -- EXECUTE to PUBLIC by default, so a presence check passes with PUBLIC
  -- sitting beside `authenticated`.
  SELECT pg_catalog.coalesce(pg_catalog.array_agg(DISTINCT grantee::text ORDER BY grantee::text), ARRAY[]::text[])
    INTO v_grants
    FROM information_schema.routine_privileges
   WHERE specific_schema = 'public' AND routine_name = 'admin_activate_membership'
     AND privilege_type = 'EXECUTE';
  IF v_grants <> ARRAY['authenticated', 'postgres'] AND v_grants <> ARRAY['authenticated'] THEN
    RAISE EXCEPTION 'AC-3 FAILED: EXECUTE grant set is %, expected authenticated (owner aside)', v_grants;
  END IF;
  RAISE NOTICE 'AC-3 PASS  EXECUTE granted to authenticated only (owner aside) -- %', v_grants;

  -- AC-4: ⛔ NOTHING ELSE CHANGED. No table, enum, policy or client table
  -- grant moved; this migration adds a STRING and a FUNCTION.
  SELECT (SELECT pg_catalog.count(*) FROM information_schema.tables
           WHERE table_schema = 'public' AND table_type = 'BASE TABLE')
    INTO v_count;
  IF v_count <> 30 THEN
    RAISE EXCEPTION 'AC-4 FAILED: table count is % (expected 30)', v_count;
  END IF;
  SELECT pg_catalog.count(*) INTO v_count FROM pg_catalog.pg_policies WHERE schemaname = 'public';
  IF v_count <> 30 THEN
    RAISE EXCEPTION 'AC-4 FAILED: policy count is % (expected 30)', v_count;
  END IF;
  SELECT pg_catalog.count(DISTINCT t.typname) INTO v_count
    FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname = 'public' AND t.typtype = 'e';
  IF v_count <> 12 THEN
    RAISE EXCEPTION 'AC-4 FAILED: enum count is % (expected 12)', v_count;
  END IF;
  RAISE NOTICE 'AC-4 PASS  30 tables, 30 policies, 12 enums -- unmoved';

  -- AC-5: ⛔ THE BODY IS EXECUTED, NOT MERELY DECLARED (`CLAUDE.md` §12).
  -- `plpgsql` defers name resolution to first execution, so every assertion
  -- above is TRUE of a body that raises on its first statement.
  -- ⚠️ A REFUSAL IS THE IDEAL CALL: as OWNER there is no JWT claim, so the
  --    caller resolves to nothing and the first gate refuses -- traversing
  --    the body and writing nothing.
  SELECT * INTO v_rec FROM public.admin_activate_membership('00000000-0000-4000-8000-000000000000'::uuid);
  IF v_rec.o_reason <> 'not_permitted' OR v_rec.o_activated IS NOT FALSE THEN
    RAISE EXCEPTION 'AC-5 FAILED: owner probe returned reason=% activated=%', v_rec.o_reason, v_rec.o_activated;
  END IF;
  RAISE NOTICE 'AC-5 PASS  the body EXECUTED and the owner probe was refused -- ⚠️ GATE 1 ONLY; the suite reaches the transition';

  -- AC-6: ⛔ THE HASH CHAIN STILL VERIFIES, WITH A NON-VACUITY LEG.
  -- ⚠️ REQUIRED BY THE RULING, and it is what makes this mean anything:
  --    `audit_verify_chain` over ZERO events returns `ok = true`, so a green
  --    with `events_checked = 0` proves NOTHING about whether the chain is
  --    intact after extending the registry.
  SELECT * INTO v_chain FROM public.audit_verify_chain() LIMIT 1;
  IF v_chain.ok IS NOT TRUE THEN
    RAISE EXCEPTION 'AC-6 FAILED: chain verification returned ok=% at seq %', v_chain.ok, v_chain.first_failed_seq;
  END IF;
  IF v_chain.events_checked IS NULL OR v_chain.events_checked < 100 THEN
    RAISE EXCEPTION 'AC-6 FAILED: only % events checked -- a green over an empty chain is not evidence', v_chain.events_checked;
  END IF;
  RAISE NOTICE 'AC-6 PASS  chain verifies over % events (ok=%), and the count is asserted so an EMPTY chain cannot report green',
    v_chain.events_checked, v_chain.ok;
END
$assert$;

COMMIT;
