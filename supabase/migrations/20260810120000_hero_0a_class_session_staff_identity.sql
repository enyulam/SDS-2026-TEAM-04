-- =====================================================================
-- B.E.S.T Coach -- Hero chain Phase 0A: the staff-identity read path
-- =====================================================================
-- Governing authority (highest first):
--   Specification v3 -> Amendments 001 ... 008 -> FINAL_MVP_AUTHORITY_LOCK
--   -> FINAL_MVP_HERO_CHAIN_RULINGS.md (G-1 ... G-8)
--   -> CLAUDE.md -> docs/plan/HERO_CHAIN_COMPLETION_PLAN.md Phase 0A
--
-- Operator authorization: Plan Phases 0A and 0B, granted 2026-08-10.
--
-- WHAT THIS MIGRATION CREATES -- exactly one bounded read boundary:
--   * 1 function ..... public.class_session_staff_identity(uuid)
--   * 1 COMMENT ON FUNCTION statement
--   * 1 REVOKE line and 1 GRANT line
--   * its authored post-apply assertions
--
-- WHAT IT DELIBERATELY DOES NOT CREATE:
--   no ALTER TYPE, no CREATE TABLE, no CREATE TYPE, no column, no
--   constraint, no index, no CREATE POLICY, no table GRANT, no ALTER
--   DEFAULT PRIVILEGES, no ownership change, no trigger, no view, no
--   extension, no schema, no audit action, and NO `CREATE OR REPLACE` of
--   any existing function. Every previously applied migration is
--   byte-untouched.
--
-- ---------------------------------------------------------------------
-- WHY A FUNCTION AND NOT AN RLS POLICY -- the measured reason
-- ---------------------------------------------------------------------
-- G-5 permits the assigned trainer's display name on a PARENT surface.
-- Step 7G's accepted policy set gives a parent NO path to either table
-- this datum lives behind:
--
--   * `accounts` is readable by `accounts_select_own` (the caller's own
--     identity row) and `accounts_select_management` (accounts holding a
--     membership in an ACTIVELY MANAGED centre). A parent is neither.
--   * `class_session_assignments` is readable by management centre-wide
--     and by a trainer for their OWN active assignments. Step 7G's own
--     comment states it: "Parents receive no assignment path in this
--     checkpoint."
--
-- Serving G-5 by RLS would therefore mean WIDENING A TABLE POLICY on
-- `accounts` to admit parents -- a far larger blast radius than the one
-- field the ruling permits, and it would expose account rows generally
-- rather than one display name for one session. A reviewed SECURITY
-- DEFINER read path is the narrower instrument and is what A-030
-- prescribes for exactly this shape.
--
-- ⚠️ THE PLAN ANTICIPATED "policy + its minimum matching grant". THIS
-- SHIPS NEITHER A POLICY NOR A TABLE GRANT -- it is strictly narrower
-- than the authorization contemplated, which is the safe direction.
--
-- ---------------------------------------------------------------------
-- WHAT IS DELIBERATELY NOT RETURNED
-- ---------------------------------------------------------------------
-- ⛔ G-7: the `Assist.` staff slot is NOT built and NO second slot is
--    modelled. `class_session_assignments.trainer_role` is typed
--    `centre_membership_role`, and extending that enum is a CLAUDE.md
--    §12 stop-and-ask that would also reintroduce the A-014-deferred TA
--    persona. This function returns AT MOST ONE row per session.
-- ⛔ G-2: no rating, no roll-up, no derived assessment fact.
-- ⛔ G-3: no lesson-plan focus of any kind. This function is staff
--    identity only and must never be joined into the roster's governed
--    carried-over previous-session focus.
--
-- No email, no normalized_email, no account status, no auth_user_id and
-- no centre id leaves this function. Display name and the membership id
-- that produced it, and nothing else.
-- =====================================================================

CREATE FUNCTION public.class_session_staff_identity(p_session_id uuid)
RETURNS TABLE (
  class_session_id      uuid,
  trainer_membership_id uuid,
  trainer_display_name  text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_account_id uuid;
  v_centre_id  uuid;
  v_allowed    boolean := false;
BEGIN
  -- 1. Identity. NULL for unauthenticated, unlinked, deactivated, or an
  --    ambiguous multi-account match -- the helper treats ambiguity as no
  --    identity, and so does this function.
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN
    RETURN;
  END IF;

  -- 2. The session must exist. Resolving its centre here means every
  --    authorization test below is made against the centre the SESSION
  --    belongs to, never against one supplied by the caller.
  SELECT cs.centre_id
    INTO v_centre_id
    FROM public.class_sessions cs
   WHERE cs.id = p_session_id;
  IF v_centre_id IS NULL THEN
    RETURN;
  END IF;

  -- 3. Live authority, re-derived per call. Three disjoint grounds; the
  --    caller needs exactly one. Every one of them is a DATABASE fact
  --    about the caller, never a claim, a parameter or a UI state.

  --    (a) TRAINER -- an active assignment to this very session.
  IF public.app_trainer_reaches_session(p_session_id) THEN
    v_allowed := true;
  END IF;

  --    (b) MANAGEMENT -- an active management membership in the centre
  --        that owns the session (ADR-7, A-015: centre-scoped, one tier).
  IF NOT v_allowed
     AND public.app_has_active_membership(v_centre_id, 'management'::public.centre_membership_role)
  THEN
    v_allowed := true;
  END IF;

  --    (c) PARENT -- G-5, and deliberately the NARROWEST of the three.
  --        A parent reaches this name only where a report for THIS
  --        session, for a student THEY reach through a live
  --        parent_student_link, has actually been PUBLISHED.
  --
  --        ⚠️ Gating on `submitted` is not decoration. Without it a
  --        parent could confirm which trainer is assigned to a session
  --        whose report is still a draft, or was never started -- which
  --        is pre-publication information about a governed workflow, and
  --        the parent boundary admits only the canonical submitted
  --        version. `latest_submitted_version_id IS NOT NULL` is checked
  --        alongside the status so a report claiming `submitted` with no
  --        canonical pointer -- a state the lifecycle does not produce --
  --        denies rather than leaks.
  IF NOT v_allowed
     AND EXISTS (
       SELECT 1
         FROM public.reports r
        WHERE r.class_session_id = p_session_id
          AND r.status = 'submitted'::public.report_status
          AND r.latest_submitted_version_id IS NOT NULL
          AND public.app_parent_reaches_student(r.student_id)
     )
  THEN
    v_allowed := true;
  END IF;

  IF NOT v_allowed THEN
    RETURN;
  END IF;

  -- 4. The bounded projection.
  --
  --    `csa.is_active` is what makes this the CURRENTLY assigned trainer.
  --    `class_session_assignments_one_active_per_session_idx` is a UNIQUE
  --    partial index on (class_session_id) WHERE is_active, so the schema
  --    itself guarantees at most one row here -- this cannot silently
  --    become a two-trainer surface, which is the shape `Assist.` would
  --    have needed and which G-7 prohibits.
  --
  --    The membership's own lifecycle status is deliberately NOT filtered:
  --    who was assigned to a session is a historical fact, and a trainer
  --    later deactivated must still be nameable on the sessions they
  --    actually taught. The ASSIGNMENT's `is_active` governs currency;
  --    the account's status governs login, which is a different question.
  RETURN QUERY
  SELECT cs.id,
         csa.trainer_membership_id,
         a.display_name
    FROM public.class_sessions cs
    JOIN public.class_session_assignments csa
      ON csa.class_session_id = cs.id
     AND csa.is_active
    JOIN public.centre_memberships m
      ON m.id = csa.trainer_membership_id
    JOIN public.accounts a
      ON a.id = m.account_id
   WHERE cs.id = p_session_id;
END;
$fn$;

COMMENT ON FUNCTION public.class_session_staff_identity(uuid) IS
  'Hero Phase 0A. Returns the CURRENTLY assigned trainer''s display name for one '
  'class session, at most one row. Authorized per call by one of three live '
  'database facts: an active trainer assignment to the session, an active '
  'management membership in the session''s centre, or -- G-5 -- a parent link to '
  'a student whose report for this session has reached `submitted` with a '
  'canonical version. Returns no email, status, auth id or centre id. Builds no '
  '`Assist.` slot (G-7), no rating (G-2) and no lesson-plan focus (G-3).';

-- ---------------------------------------------------------------------
-- PRIVILEGE. NOTHING IS GRANTED TO service_role, EVER -- it carries
-- BYPASSRLS, and a SECURITY DEFINER function reached by a BYPASSRLS role
-- would be authorization theatre. `anon` gets nothing: every ground above
-- requires an account, and an anonymous caller has none.
--
-- THE BOUNDARY IS THE PREDICATE INSIDE THE FUNCTION, NEVER A PROPERTY OF
-- THE GRANT. `authenticated` may CALL it; what it returns is decided row
-- by row by the caller's live reach.
-- ---------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.class_session_staff_identity(uuid) FROM PUBLIC, anon, service_role, authenticator;

GRANT EXECUTE ON FUNCTION public.class_session_staff_identity(uuid) TO authenticated;

-- =====================================================================
-- POST-APPLY ASSERTIONS -- in the same transaction as the DDL above.
-- Every count is re-derived from the catalogue, never restated from a
-- comment. A failure here rolls the whole migration back.
-- =====================================================================
DO $assert$
DECLARE
  v_n bigint;
  v_m bigint;
  v_b boolean;
  v_t text;
BEGIN
  -- H0A-1: exactly one function was added. 39 before, 40 now.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public';
  IF v_n <> 40 THEN
    RAISE EXCEPTION 'Phase 0A assertion H0A-1 failed: % function(s) in public; expected 40 (39 + 1)', v_n;
  END IF;

  -- H0A-2: the census is otherwise UNMOVED. Tables, enums and policies
  -- are re-counted, not assumed -- this migration must add none of them.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r';
  IF v_n <> 27 THEN
    RAISE EXCEPTION 'Phase 0A assertion H0A-2 failed: % table(s) in public; expected 27 (unchanged)', v_n;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_type t
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN
    RAISE EXCEPTION 'Phase 0A assertion H0A-2 failed: % enum type(s) in public; expected 12 (unchanged)', v_n;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_policies WHERE schemaname = 'public';
  IF v_n <> 29 THEN
    RAISE EXCEPTION 'Phase 0A assertion H0A-2 failed: % policy/policies in public; expected 29 (unchanged)', v_n;
  END IF;

  -- H0A-3: RLS posture untouched -- every table still has RLS enabled and
  -- none has been switched to FORCE.
  SELECT pg_catalog.count(*) FILTER (WHERE NOT c.relrowsecurity),
         pg_catalog.count(*) FILTER (WHERE c.relforcerowsecurity)
    INTO v_n, v_m
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r';
  IF v_n <> 0 OR v_m <> 0 THEN
    RAISE EXCEPTION 'Phase 0A assertion H0A-3 failed: % table(s) without RLS, % with FORCE RLS; expected 0 and 0', v_n, v_m;
  END IF;

  -- H0A-4: the function's own security properties, read from the
  -- catalogue. SECURITY DEFINER without a pinned search_path is the
  -- classic privilege-escalation shape, so both are asserted together.
  SELECT p.prosecdef, p.provolatile
    INTO v_b, v_t
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'class_session_staff_identity';
  IF v_b IS NOT TRUE THEN
    RAISE EXCEPTION 'Phase 0A assertion H0A-4 failed: the function is not SECURITY DEFINER';
  END IF;
  IF v_t <> 's' THEN
    RAISE EXCEPTION 'Phase 0A assertion H0A-4 failed: the function is not STABLE (provolatile=%)', v_t;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname = 'class_session_staff_identity'
     -- ⚠️ The catalogue stores `SET search_path = ''` as the literal
     --    `search_path=""` -- with the quotes -- not as `search_path=`.
     --    Asserted against the stored representation, verified against the
     --    already-applied ratified functions, never against how the DDL
     --    was written.
     AND p.proconfig @> ARRAY['search_path=""'];
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Phase 0A assertion H0A-4 failed: search_path is not pinned to the empty string';
  END IF;

  -- H0A-5: the ACL is exactly one non-owner grant, and it is EXECUTE to
  -- `authenticated`. Asserted by enumerating the ACL rather than by
  -- trusting the GRANT statement above to have been the only one.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace,
         pg_catalog.aclexplode(p.proacl) ae
   WHERE n.nspname = 'public'
     AND p.proname = 'class_session_staff_identity'
     AND ae.grantee <> p.proowner;
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Phase 0A assertion H0A-5 failed: % non-owner grant(s); expected exactly 1', v_n;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace,
         pg_catalog.aclexplode(p.proacl) ae
   WHERE n.nspname = 'public'
     AND p.proname = 'class_session_staff_identity'
     AND ae.grantee = 'authenticated'::regrole::oid
     AND ae.privilege_type = 'EXECUTE';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Phase 0A assertion H0A-5 failed: authenticated does not hold exactly one EXECUTE grant';
  END IF;

  -- H0A-6: nothing reached anon, service_role or PUBLIC. Stated as its
  -- own assertion because "exactly one grant" above would still pass if
  -- that one grant were the wrong grantee.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace,
         pg_catalog.aclexplode(p.proacl) ae
   WHERE n.nspname = 'public'
     AND p.proname = 'class_session_staff_identity'
     AND (ae.grantee = 0
          OR ae.grantee = 'anon'::regrole::oid
          OR ae.grantee = 'service_role'::regrole::oid);
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Phase 0A assertion H0A-6 failed: % grant(s) reached PUBLIC, anon or service_role; expected 0', v_n;
  END IF;

  -- H0A-7: G-7 STRUCTURALLY. The unique partial index that makes a second
  -- concurrent staff slot impossible must still exist -- if it were ever
  -- dropped, this function could silently start returning two rows and
  -- become the `Assist.` surface the ruling prohibits.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_indexes
   WHERE schemaname = 'public'
     AND tablename  = 'class_session_assignments'
     AND indexname  = 'class_session_assignments_one_active_per_session_idx';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Phase 0A assertion H0A-7 failed: the one-active-assignment-per-session unique index is absent';
  END IF;

  RAISE NOTICE 'Phase 0A: staff-identity read path applied; assertions H0A-1..H0A-7 passed.';
END;
$assert$;
