-- =====================================================================
-- B.E.S.T Coach -- Hero chain Phase 7: `F-S6-REVIEW-1`
-- the governed FOLLOW-UP NOTE save
-- =====================================================================
-- Governing authority (highest first):
--   Specification v3 -> Amendments 001 ... 008 -> FINAL_MVP_AUTHORITY_LOCK
--   -> FINAL_MVP_HERO_CHAIN_RULINGS.md
--   -> CLAUDE.md §6 (the follow-up clause, AMENDED 2026-08-10: D-2 ruled
--      EDITABLE WITH A SAVE PATH, bound to the Review & Approve WORKFLOW
--      SURFACE rather than to a screen name)
--   -> docs/plan/HERO_CHAIN_COMPLETION_PLAN.md §9
--
-- WHAT THIS MIGRATION CREATES:
--   * 1 function ..... public.assessment_save_follow_up_notes(uuid, text)
--   * 1 COMMENT ON FUNCTION statement
--   * 1 REVOKE line and 1 GRANT line
--   * its authored post-apply assertions
--
-- WHAT IT DELIBERATELY DOES NOT CREATE OR TOUCH:
--   no table, column, enum, label, policy, table grant, index, trigger,
--   view or seed row; NO audit action string; and NO `CREATE OR REPLACE`
--   of any existing function. `assessment_save_observation` is
--   BYTE-UNTOUCHED.
--
-- ---------------------------------------------------------------------
-- WHY A NARROW SECOND WRITE RATHER THAN REUSING THE ASSESSMENT SAVE
-- ---------------------------------------------------------------------
-- Operator ruling, 2026-08-10, option (b). Reusing
-- `assessment_save_observation` from the review surface would make the
-- CLIENT ECHO NINE GOVERNED RATINGS BACK TO THE SERVER on what is
-- nominally a note save -- a needless surface on which a tampered client
-- could alter a rating -- and would bump `lock_version` and rewrite the
-- rating rows for a note edit, MISREPRESENTING WHAT CHANGED.
--
-- This function therefore reads the observation SERVER-SIDE and updates
-- exactly one column. NO RATING EVER ROUND-TRIPS THROUGH THE CLIENT.
--
-- ---------------------------------------------------------------------
-- ⚠️ THE GATE IS A DELIBERATE MIRROR OF `assessment_save_observation`'s
-- STEPS 1-5, NOT A RE-DERIVATION
-- ---------------------------------------------------------------------
-- Same reason Phase 1 mirrored RPC-13: a looser gate here would become a
-- SECOND, WEAKER WAY INTO THE SAME COLUMN. Every denial raises the
-- BYTE-IDENTICAL `BC101` message that function uses, so a caller can
-- never distinguish "no such report" from "not your report".
--
-- ⛔ STEP 5 -- THE SESSION-START GATE -- IS DELIBERATELY *NOT* MIRRORED.
-- Operator instruction: measure what it would refuse, then keep or drop
-- it, and never decide silently. MEASURED 2026-08-11 against this
-- database:
--   * `assessment_save_observation` is the ONLY function that INSERTs
--     into `public.observations` (1 of 41), and it carries the start gate
--     (`BC104`) -- which is also the ONLY `BC104` site in the schema;
--   * `observations` has ZERO client INSERT/UPDATE grants and ZERO RLS
--     policies, so no other creation path exists;
--   * 0 of 2 observations belong to a session whose start is in the
--     future -- and that is STRUCTURAL, not fixture luck.
-- Therefore the start gate here would be UNREACHABLE: this function
-- requires the observation to ALREADY EXIST, and its existence proves the
-- start gate passed at creation. The one case where it could ever fire is
-- a session RESCHEDULED FORWARD after the observation was written, where
-- it would refuse a trainer correcting THEIR OWN note -- exactly what the
-- Operator's decision 2 protects, and the same shape as A-026's rule that
-- an attendance correction must not destroy existing work.
-- ▶ WHAT REPLACES IT IS STRONGER, NOT WEAKER: the observation-must-exist
-- precondition proves the start gate PASSED AT CREATION, rather than
-- re-testing a clock that can move underneath a committed row.
--
-- ⛔ ENROLMENT (step 6) AND ATTENDANCE-PRESENT (step 7) ARE NOT RE-CHECKED,
-- for the same reason and by Operator decision 1: the observation's
-- existence proves both were satisfied when it was created, and
-- re-checking attendance would BLOCK A TRAINER FROM FIXING THEIR OWN NOTE
-- for a learner later marked absent -- which A-026 protects against.
--
-- ⛔ NO REPORT-STATUS GATE (Operator decision 2). `follow_up_notes` is in
-- NO frozen `report_versions` row and under NO content hash, so editing it
-- alters no approved or submitted artefact. It feeds the NEXT session's
-- carried-over focus, which must stay correctable -- that is the field's
-- purpose (§10 Phase 1 exit condition (c)).
--
-- ⛔ NO AUDIT EVENT, AND THE REGISTRY STAYS AT 16. The standing CP-2 / CP-4
-- boundary: standalone observation persistence emits no Step 7H event. A
-- note save MUST NEVER silently advance the report lifecycle -- and
-- structurally it cannot, because this function touches only
-- `observations.follow_up_notes`.
--
-- ⛔ NO `lock_version` BUMP (Operator-accepted). One trainer is assigned
-- per session, so last-write-wins is the honest posture; bumping the lock
-- would misrepresent what changed AND would invalidate a concurrently-open
-- assessment form.
-- =====================================================================

CREATE FUNCTION public.assessment_save_follow_up_notes(
  p_report_id        uuid,
  p_follow_up_notes  text
)
RETURNS TABLE (
  follow_up_notes text
)
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_centre_id     uuid;
  v_session_id    uuid;
  v_student_id    uuid;
  v_obs_id        uuid;
BEGIN
  -- 1. SESSION IDENTITY. No parameter, claim or header substitutes for it.
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC101', MESSAGE = 'assessment: not found or not permitted';
  END IF;

  -- 2. CALLER ACCOUNT -- the app_current_account_id() discipline. Zero AND
  --    two-or-more both yield the same authored outcome: ambiguous identity
  --    is treated as no identity, never as an arbitrary pick.
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC101', MESSAGE = 'assessment: not found or not permitted';
  END IF;

  -- 3. REPORT RESOLUTION. ⚠️ THE SESSION, THE STUDENT AND THE CENTRE ARE
  --    DERIVED FROM THE REPORT, NEVER SUPPLIED. The client provides the
  --    note and the report identity and NOTHING else, so it cannot aim this
  --    write at a session or a learner of its choosing.
  SELECT r.centre_id, r.class_session_id, r.student_id
    INTO v_centre_id, v_session_id, v_student_id
    FROM public.reports r
   WHERE r.id = p_report_id;
  IF v_centre_id IS NULL THEN
    -- Byte-identical to every other denial.
    RAISE EXCEPTION USING ERRCODE = 'BC101', MESSAGE = 'assessment: not found or not permitted';
  END IF;

  -- 4. LIVE TRAINER/SESSION AUTHORIZATION. This single step denies
  --    management, parents, unassigned trainers, unrelated trainers,
  --    deactivated memberships and deactivated accounts IDENTICALLY.
  SELECT (pg_catalog.array_agg(m.id))[1]
    INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id
     AND m.centre_id  = v_centre_id
     AND m.role       = 'trainer'
     AND m.status     = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL OR NOT public.app_trainer_reaches_session(v_session_id) THEN
    RAISE EXCEPTION USING ERRCODE = 'BC101', MESSAGE = 'assessment: not found or not permitted';
  END IF;

  -- 5. THE OBSERVATION MUST ALREADY EXIST. ⚠️ THIS FUNCTION NEVER CREATES
  --    ONE -- creation belongs to `assessment_save_observation` and to it
  --    alone, with the full nine-rating validation (A-017), the enrolment
  --    check and the fail-closed attendance-present check behind it. An
  --    absent observation is the same non-disclosing denial as everything
  --    above, so a caller cannot probe for which reports have been assessed.
  SELECT o.id INTO v_obs_id
    FROM public.observations o
   WHERE o.class_session_id = v_session_id
     AND o.student_id       = v_student_id;
  IF v_obs_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC101', MESSAGE = 'assessment: not found or not permitted';
  END IF;

  -- 6. THE WRITE -- ONE COLUMN. No lock_version, no rating row, no status,
  --    no timestamp, no audit event. `observations` carries no non-internal
  --    trigger, so nothing moves behind this statement either.
  UPDATE public.observations o
     SET follow_up_notes = p_follow_up_notes
   WHERE o.id = v_obs_id;

  RETURN QUERY
  SELECT o.follow_up_notes FROM public.observations o WHERE o.id = v_obs_id;
END;
$fn$;

COMMENT ON FUNCTION public.assessment_save_follow_up_notes(uuid, text) IS
  'Hero Phase 7 / F-S6-REVIEW-1. The governed save for observations.follow_up_notes from the '
  'Review & Approve WORKFLOW SURFACE (CLAUDE.md §6 as amended 2026-08-10, D-2 = EDITABLE). '
  'Writes that ONE column and nothing else: no lock_version bump, no rating row, no status, '
  'no audit event, and the Step 7H registry stays at 16 (the CP-2/CP-4 boundary). The client '
  'supplies the note and the report identity only; session, student and centre are DERIVED. '
  'Its gate MIRRORS assessment_save_observation steps 1-4 with the byte-identical BC101 denial, '
  'and requires the observation to ALREADY EXIST -- it never creates one. The session-start gate '
  'is deliberately NOT mirrored: it would be unreachable here, and could only ever fire for a '
  'session rescheduled forward, refusing a trainer correcting their own note.';

-- Same privilege posture as every governed write: `authenticated` may call
-- it; what it may do is decided per call by the caller's live reach.
-- service_role is never granted -- it carries BYPASSRLS.
REVOKE ALL ON FUNCTION public.assessment_save_follow_up_notes(uuid, text) FROM PUBLIC, anon, service_role, authenticator;

GRANT EXECUTE ON FUNCTION public.assessment_save_follow_up_notes(uuid, text) TO authenticated;

-- =====================================================================
-- POST-APPLY ASSERTIONS -- same transaction as the DDL above.
-- =====================================================================
DO $assert$
DECLARE
  v_n   bigint;
  v_b   boolean;
  v_src text;
BEGIN
  -- H7-1: exactly one function added. 41 before, 42 now.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public';
  IF v_n <> 42 THEN
    RAISE EXCEPTION 'Phase 7 assertion H7-1 failed: % function(s) in public; expected 42 (41 + 1)', v_n;
  END IF;

  -- H7-2: census otherwise unmoved. ⚠️ Asserted as RELATIONSHIPS on schema
  -- state, never on fixture rows -- the H0B-3 lesson.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r';
  IF v_n <> 27 THEN
    RAISE EXCEPTION 'Phase 7 assertion H7-2 failed: % table(s); expected 27 (unchanged)', v_n;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN
    RAISE EXCEPTION 'Phase 7 assertion H7-2 failed: % enum type(s); expected 12 (unchanged)', v_n;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_policies WHERE schemaname = 'public';
  IF v_n <> 29 THEN
    RAISE EXCEPTION 'Phase 7 assertion H7-2 failed: % policy/policies; expected 29 (unchanged)', v_n;
  END IF;

  -- H7-3: security properties.
  SELECT p.prosecdef INTO v_b
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'assessment_save_follow_up_notes';
  IF v_b IS NOT TRUE THEN
    RAISE EXCEPTION 'Phase 7 assertion H7-3 failed: not SECURITY DEFINER';
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'assessment_save_follow_up_notes'
     AND p.proconfig @> ARRAY['search_path=""'];
  IF v_n <> 1 THEN
    -- ⚠️ The catalogue stores `SET search_path = ''` as `search_path=""`,
    -- WITH quotes. Matching the authored form reports a false failure --
    -- the H0A-4 lesson, and the same class as the minifier's rewrites.
    RAISE EXCEPTION 'Phase 7 assertion H7-3 failed: search_path is not pinned to the empty string';
  END IF;

  -- H7-4: ACL is exactly one non-owner grant, EXECUTE to authenticated,
  -- and nothing reached PUBLIC, anon or service_role.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace,
         pg_catalog.aclexplode(p.proacl) ae
   WHERE n.nspname = 'public' AND p.proname = 'assessment_save_follow_up_notes'
     AND ae.grantee <> p.proowner;
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Phase 7 assertion H7-4 failed: % non-owner grant(s); expected exactly 1', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace,
         pg_catalog.aclexplode(p.proacl) ae
   WHERE n.nspname = 'public' AND p.proname = 'assessment_save_follow_up_notes'
     AND (ae.grantee = 0 OR ae.grantee = 'anon'::regrole::oid OR ae.grantee = 'service_role'::regrole::oid);
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Phase 7 assertion H7-4 failed: % grant(s) reached PUBLIC, anon or service_role', v_n;
  END IF;

  -- ⚠️ COMMENTS ARE STRIPPED BEFORE THE TOKEN SCANS BELOW, AND THIS IS NOT
  -- cosmetic: `pg_proc.prosrc` STORES THE FUNCTION'S COMMENTS. The first
  -- revision of H7-6 failed against this function's OWN comment saying
  -- "No lock_version, no rating row, no status, no audit event" -- the code
  -- was correct and the scan was reading the sentence that documents why.
  -- Third time today that a search matched its own documentation (after the
  -- Phase 6 checker, which strips comments for exactly this reason, and the
  -- `/Overall Grade/i` false violation). ▶ ANY absence scan over source must
  -- state whether it reads comments, and must say so where it strips them.
  SELECT pg_catalog.regexp_replace(p.prosrc, '--[^' || pg_catalog.chr(10) || ']*', '', 'g')
    INTO v_src
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'assessment_save_follow_up_notes';

  -- H7-5: ⚠️ THE GATE IS STILL A MIRROR. If a later edit dropped one of
  -- these, this function would become a SECOND, WEAKER WAY INTO THE SAME
  -- COLUMN -- which is the whole reason it mirrors rather than re-derives.
  IF v_src IS NULL
     OR pg_catalog.strpos(v_src, 'auth.uid()') = 0
     OR pg_catalog.strpos(v_src, 'app_current_account_id') = 0
     OR pg_catalog.strpos(v_src, 'app_trainer_reaches_session') = 0
     OR pg_catalog.strpos(v_src, 'HAVING pg_catalog.count(*) = 1') = 0
     OR pg_catalog.strpos(v_src, 'BC101') = 0
  THEN
    RAISE EXCEPTION 'Phase 7 assertion H7-5 failed: the mirrored gate is incomplete';
  END IF;

  -- H7-6: ⛔ IT WRITES ONE COLUMN. Asserted on the SOURCE, because that is
  -- where a second SET would appear. The function must contain exactly one
  -- UPDATE, it must target `observations`, and it must not name
  -- lock_version, a rating, a status or an audit table anywhere.
  SELECT (pg_catalog.length(v_src) - pg_catalog.length(pg_catalog.replace(v_src, 'UPDATE ', '')))
         / pg_catalog.length('UPDATE ')
    INTO v_n;
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Phase 7 assertion H7-6 failed: % UPDATE statement(s); expected exactly 1', v_n;
  END IF;
  IF pg_catalog.strpos(v_src, 'SET follow_up_notes') = 0 THEN
    RAISE EXCEPTION 'Phase 7 assertion H7-6 failed: the single UPDATE does not set follow_up_notes';
  END IF;
  -- ⚠️ EACH PATTERN NAMES THE SHAPE OF A VIOLATION, NOT A BARE WORD. An
  -- earlier revision of this block tested `strpos(v_src,'status') > 0` and
  -- would have failed the migration against step 4's LEGITIMATE
  -- `m.status = 'active'` membership predicate. That is the same over-broad
  -- match that made `/Overall Grade/i` reject a sentence saying the grade is
  -- NOT shown, and the reason A-052 prohibits a bare rating-word regex.
  -- Caught by reading, before it ran.
  IF pg_catalog.strpos(v_src, 'lock_version') > 0
     OR pg_catalog.strpos(v_src, 'observation_ratings') > 0
     OR pg_catalog.strpos(v_src, 'report_versions') > 0
     OR pg_catalog.strpos(v_src, 'audit_events') > 0
     OR pg_catalog.strpos(v_src, 'audit_append_event') > 0
     OR pg_catalog.strpos(v_src, 'SET status') > 0
     OR pg_catalog.strpos(v_src, 'report_status') > 0
  THEN
    RAISE EXCEPTION 'Phase 7 assertion H7-6 failed: the function names a governed object outside follow_up_notes';
  END IF;

  -- H7-7: ⛔ THE STEP 7H AUDIT REGISTRY IS UNTOUCHED, and this is asserted
  -- as what is actually true rather than as a count.
  --
  -- ⚠️ A COUNT WAS THE FIRST ATTEMPT AND WAS ABANDONED DELIBERATELY. The 16
  -- ratified action strings live inside `audit_append_event`'s body; a
  -- regex over that body returned SEVENTEEN matches, so asserting `= 16`
  -- against a counting method this migration invented would have been
  -- pinning MY parser rather than the registry. A test that measures
  -- something other than the thing it names is worse than no test.
  --
  -- What IS true, and is sufficient: this migration contains no
  -- `CREATE OR REPLACE`, so `audit_append_event` is byte-untouched -- and
  -- H7-6 above proves this function never reaches the audit path at all, so
  -- it cannot emit an event under any action string, registered or not.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'audit_append_event';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Phase 7 assertion H7-7 failed: audit_append_event is absent or duplicated (%)', v_n;
  END IF;

  -- H7-8: `assessment_save_observation` is UNTOUCHED -- still present, still
  -- SECURITY DEFINER, and still carrying its own session-start gate, which
  -- this function deliberately does not mirror.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'assessment_save_observation'
     AND p.prosecdef AND p.prosrc LIKE '%BC104%';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Phase 7 assertion H7-8 failed: assessment_save_observation is absent or altered';
  END IF;

  RAISE NOTICE 'Phase 7: follow-up note save applied; assertions H7-1..H7-8 passed.';
END;
$assert$;
