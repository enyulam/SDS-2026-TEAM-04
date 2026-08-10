-- =====================================================================
-- HERO PHASE 7 -- `F-S6-REVIEW-1`: the governed FOLLOW-UP NOTE save
-- =====================================================================
-- ⛔ THIS SUITE AND THE PHASE 6a CARRY-OVER PROOF ARE DIFFERENT CLAIMS AND
-- NEITHER MAY STAND IN FOR THE OTHER (plan §9.3 rules 2 and 4).
--   * `npm run test:continuity` proves a note SAVED ON SCREEN `07` APPEARS
--     AS THE NEXT SESSION'S PREVIOUS FOCUS -- `CLAUDE.md` §10 Phase 1 exit
--     condition (c). It was re-run and PASSED at `459be14`, BEFORE this
--     write path existed.
--   * THIS suite proves the REVIEW SURFACE'S SAVE PATH writes that same
--     column, under the trainer's own credential, and writes NOTHING ELSE.
-- Proving one says nothing about the other. Two verdicts, recorded apart.
--
-- ⚠️ TRANSACTION-SCOPED, ENDING IN `ROLLBACK` -- the accepted pattern. A
-- report is constructed here because the fixture holds none, and the
-- runner re-measures the governed counts afterwards.
--
-- ⚠️ NON-VACUITY FIRST (P7-1): every refusal leg below is meaningless if
-- the permit leg never wrote anything.
--
-- Run by scripts/tests/hero/prove-7-follow-up-save.mjs
-- =====================================================================
\set ON_ERROR_STOP on
\pset pager off
\pset footer off

BEGIN;

CREATE FUNCTION pg_temp.as_trainer() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims',
  '{"sub":"d0000000-0000-4000-8000-000000000002","role":"authenticated"}', true); END $$;

CREATE FUNCTION pg_temp.as_management() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims',
  '{"sub":"d0000000-0000-4000-8000-000000000001","role":"authenticated"}', true); END $$;

CREATE FUNCTION pg_temp.as_parent() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims',
  '{"sub":"d0000000-0000-4000-8000-000000000003","role":"authenticated"}', true); END $$;

CREATE FUNCTION pg_temp.as_nobody() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims', '', true); END $$;

DO $suite$
DECLARE
  v_session    uuid;
  v_student    uuid;
  v_centre     uuid;
  v_module     uuid;
  v_enrolment  uuid;
  v_obs        uuid;
  v_report     uuid;
  v_other_rep  uuid;
  v_other_obs  bigint;
  v_after_obs  bigint;
  v_lock_before  integer;
  v_lock_after   integer;
  v_ratings_before bigint;
  v_ratings_after  bigint;
  v_status_before  public.report_status;
  v_status_after   public.report_status;
  v_audit_before   bigint;
  v_audit_after    bigint;
  v_note       text;
  v_n          bigint;
  v_pass       int := 0;
  v_fail       int := 0;
BEGIN
  -- ---------------------------------------------------------------
  -- Set up: a report for a session/student pair that ALREADY has an
  -- observation, since this function never creates one.
  -- ---------------------------------------------------------------
  -- ⛔ THE PAIR IS MINTED, NOT BORROWED (Operator ruling 2026-08-11). Taking a
  -- fixture pair with `ORDER BY … LIMIT 1` made this suite collide the moment
  -- the Operator's own walkthrough created a report for that pair. A session
  -- minted a statement ago cannot already have one.
  SELECT m.centre_id, m.class_module_id, m.class_session_id, m.student_id,
         m.enrolment_id, m.observation_id
    INTO v_centre, v_module, v_session, v_student, v_enrolment, v_obs
    FROM pg_temp.mint_isolated_pair('P7') m;

  INSERT INTO public.reports (centre_id, class_session_id, class_module_id, student_id,
                              enrolment_id, observation_id, status, lock_version)
       VALUES (v_centre, v_session, v_module, v_student, v_enrolment, v_obs, 'draft_ready', 3)
    RETURNING id INTO v_report;

  -- ⚠️ The governed counts WHILE the minted rows exist. The runner asserts
  -- this DIFFERS from its own before-reading, which is what turns
  -- "before = after" from a tautology into a measured restoration.
  RAISE NOTICE 'DURING-COUNTS %', pg_temp.governed_counts();

  SELECT o.lock_version INTO v_lock_before FROM public.observations o WHERE o.id = v_obs;
  SELECT pg_catalog.count(*) INTO v_ratings_before
    FROM public.observation_ratings r WHERE r.observation_id = v_obs;
  SELECT r.status INTO v_status_before FROM public.reports r WHERE r.id = v_report;
  SELECT pg_catalog.count(*) INTO v_audit_before FROM public.audit_events;

  RAISE NOTICE 'P7-SETUP  -- a draft_ready report exists IN THIS TRANSACTION ONLY';

  -- ---------------------------------------------------------------
  -- P7-1 -- ⚠️ NON-VACUITY / THE PERMIT LEG. The assigned trainer saves a
  -- new note through the governed path, and it lands.
  -- ---------------------------------------------------------------
  PERFORM pg_temp.as_trainer();
  SELECT f.follow_up_notes INTO v_note
    FROM public.assessment_save_follow_up_notes(v_report, 'Next session: open with the hook, then check pacing.') f;
  IF v_note = 'Next session: open with the hook, then check pacing.' THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P7-1 -- NON-VACUOUS: the assigned trainer saved the note and the function returned it';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P7-1 -- the note did not save (got %)', COALESCE(v_note, '(null)');
  END IF;

  -- P7-2 -- it landed on the COLUMN, not merely in the return value.
  SELECT o.follow_up_notes INTO v_note FROM public.observations o WHERE o.id = v_obs;
  IF v_note = 'Next session: open with the hook, then check pacing.' THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P7-2 -- observations.follow_up_notes holds the saved value -- the SAME column the B.E.S.T Form writes';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P7-2 -- the column does not hold the saved value';
  END IF;

  -- ---------------------------------------------------------------
  -- P7-3 -- ⛔ IT WROTE NOTHING ELSE. Measured, not asserted: the
  -- observation's lock_version, its nine rating rows, the report's status
  -- and the audit-event count are all compared across the write.
  -- ---------------------------------------------------------------
  SELECT o.lock_version INTO v_lock_after FROM public.observations o WHERE o.id = v_obs;
  SELECT pg_catalog.count(*) INTO v_ratings_after
    FROM public.observation_ratings r WHERE r.observation_id = v_obs;
  SELECT r.status INTO v_status_after FROM public.reports r WHERE r.id = v_report;
  SELECT pg_catalog.count(*) INTO v_audit_after FROM public.audit_events;
  IF v_lock_after = v_lock_before
     AND v_ratings_after = v_ratings_before
     AND v_status_after = v_status_before
     AND v_audit_after = v_audit_before
  THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P7-3 -- lock_version %, % rating row(s), status %, audit_events % -- ALL UNMOVED across the write',
      v_lock_after, v_ratings_after, v_status_after, v_audit_after;
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P7-3 -- something else moved: lock %->%, ratings %->%, status %->%, audit %->%',
      v_lock_before, v_lock_after, v_ratings_before, v_ratings_after,
      v_status_before, v_status_after, v_audit_before, v_audit_after;
  END IF;

  -- ---------------------------------------------------------------
  -- P7-4 -- ⛔ MANAGEMENT AND PARENT ARE REFUSED. The note is INTERNAL
  -- (never parent-visible) and management never writes assessment
  -- substance (A-034). Both must hit the identical BC101 denial.
  -- ---------------------------------------------------------------
  v_n := 0;
  BEGIN
    PERFORM pg_temp.as_management();
    PERFORM public.assessment_save_follow_up_notes(v_report, 'management attempt');
  EXCEPTION WHEN SQLSTATE 'BC101' THEN v_n := v_n + 1;
  END;
  BEGIN
    PERFORM pg_temp.as_parent();
    PERFORM public.assessment_save_follow_up_notes(v_report, 'parent attempt');
  EXCEPTION WHEN SQLSTATE 'BC101' THEN v_n := v_n + 1;
  END;
  BEGIN
    PERFORM pg_temp.as_nobody();
    PERFORM public.assessment_save_follow_up_notes(v_report, 'anonymous attempt');
  EXCEPTION WHEN SQLSTATE 'BC101' THEN v_n := v_n + 1;
  END;
  IF v_n = 3 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P7-4 -- management, parent and unauthenticated are ALL refused with the identical BC101';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P7-4 -- only % of 3 non-trainer callers were refused', v_n;
  END IF;

  -- P7-5 -- the refusals CHANGED NOTHING. A denial that still wrote would
  -- be the worst possible outcome, so it is measured rather than assumed.
  SELECT o.follow_up_notes INTO v_note FROM public.observations o WHERE o.id = v_obs;
  IF v_note = 'Next session: open with the hook, then check pacing.' THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P7-5 -- the three refused attempts left the column byte-unchanged';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P7-5 -- a refused caller altered the column';
  END IF;

  -- ---------------------------------------------------------------
  -- P7-6 -- ⛔ IT NEVER CREATES AN OBSERVATION. A report whose pair has no
  -- observation is refused with the same BC101 -- so a caller cannot use
  -- this path to manufacture assessment substance, and cannot probe which
  -- reports have been assessed.
  -- ---------------------------------------------------------------
  SELECT e.student_id, e.id INTO v_student, v_enrolment
    FROM public.enrolments e
    LEFT JOIN public.observations o
      ON o.student_id = e.student_id AND o.class_session_id = v_session
   WHERE e.class_module_id = v_module AND e.is_active AND o.id IS NULL
   LIMIT 1;
  IF v_student IS NULL THEN
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P7-6 -- NOT-RUN: no enrolled learner without an observation exists to test with';
  ELSE
    INSERT INTO public.reports (centre_id, class_session_id, class_module_id, student_id,
                                enrolment_id, status, lock_version)
         VALUES (v_centre, v_session, v_module, v_student, v_enrolment, 'incomplete', 1)
      RETURNING id INTO v_other_rep;
    SELECT pg_catalog.count(*) INTO v_other_obs
      FROM public.observations o
     WHERE o.class_session_id = v_session AND o.student_id = v_student;
    v_n := 0;
    BEGIN
      PERFORM pg_temp.as_trainer();
      PERFORM public.assessment_save_follow_up_notes(v_other_rep, 'should not create an observation');
    EXCEPTION WHEN SQLSTATE 'BC101' THEN v_n := 1;
    END;
    SELECT pg_catalog.count(*) INTO v_after_obs FROM public.observations o
     WHERE o.class_session_id = v_session AND o.student_id = v_student;
    IF v_n = 1 AND v_after_obs = 0 THEN
      v_pass := v_pass + 1;
      RAISE NOTICE 'PASS P7-6 -- a report with no observation is refused, and NO observation was created';
    ELSE
      v_fail := v_fail + 1;
      RAISE WARNING 'FAIL P7-6 -- refusal=% observations now=%', v_n, v_after_obs;
    END IF;
  END IF;

  RAISE NOTICE '--- Phase 7 follow-up-save suite: % passed, % failed ---', v_pass, v_fail;
  IF v_fail > 0 THEN
    RAISE EXCEPTION 'Phase 7 follow-up-save suite FAILED with % failure(s)', v_fail;
  END IF;
  IF v_pass <> 6 THEN
    RAISE EXCEPTION 'Phase 7 suite is INCOMPLETE: % of 6 legs ran; an unrun leg is NOT-RUN, never PASS', v_pass;
  END IF;
END;
$suite$;

-- ⚠️ NOTHING ABOVE IS KEPT.
ROLLBACK;
