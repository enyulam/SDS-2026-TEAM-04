-- =====================================================================
-- F-ATTENDANCE-INIT-1 -- a learner with no attendance row can never be
-- assessed. Regression proof for fixes A and B.
-- =====================================================================
-- ⛔ THE DEFECT, MEASURED RATHER THAN DESCRIBED. Three defensible decisions
-- broke in combination:
--   . the governed save requires an EXISTING attendance row at `present` and
--     fails closed on a missing one (BC102, step 7);
--   . A-018's Present default is materialized LAZILY, so "no row" is a real
--     committed state;
--   . the roster's toggle sent the OPPOSITE of the EFFECTIVE state, so for an
--     unrecorded learner it could only ever send `absent`.
-- ▶ No route in the product could write `present` to a learner who had never
--   been touched. Every learner enrolled through the application was
--   unassessable until a trainer marked them absent and back.
--
-- Proves, in order:
--   FA-1  ⚠️ THE DEFECT REPRODUCES. A minted learner has NO attendance row,
--         and the governed save refuses with EXACTLY BC102.
--   FA-2  ⚠️ ITS CONTROL. The SAME save succeeds once the row exists at
--         `present` -- so FA-1 is the attendance guard refusing, not the save
--         being broken for some other reason.
--   FA-3  THE FIX'S CALL SHAPE WORKS: newStatus `present` with expectedStatus
--         OMITTED materializes the row and returns `initialized: true`.
--   FA-4  ⚠️ ITS CONTROL. The same call against an ALREADY-RECORDED learner
--         returns `initialized: false` -- so `true` is a measurement, not a
--         constant.
--   FA-5  THE INITIALIZE IS AUDITED EXACTLY ONCE, and the event carries
--         state_from NULL and `initialized: true`.
--   FA-6  ⚠️ ITS CONTROL. A confirmed NO-OP on the same learner emits
--         NOTHING -- so "exactly once" is discrimination, not a floor.
--   FA-7  ⛔ THE STANDING PROHIBITION (fix D), AT THE DATA LAYER: a refused
--         save creates NO attendance row. The assessment must never
--         materialize its own precondition.
--   FA-8  ⚠️ ITS CONTROL. The refusal really was reached -- the learner still
--         has no observation either, so nothing partial was committed.
--
-- ⚠️ RUNS UNDER `SET LOCAL ROLE authenticated` for every governed call.
-- ⚠️ TRANSACTION-SCOPED, ENDING IN `ROLLBACK`. Pairs are MINTED, never
-- borrowed.
-- =====================================================================

BEGIN;

CREATE FUNCTION pg_temp.as_trainer() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims',
  '{"sub":"d0000000-0000-4000-8000-000000000002","role":"authenticated"}', true); END $$;

-- ⚠️ BYTE-IDENTICAL to the runner's COUNTS. A comparison is only evidence when
-- both sides measure the same thing.
CREATE FUNCTION pg_temp.runner_counts() RETURNS text LANGUAGE sql AS $c$
  SELECT (SELECT count(*) FROM public.attendance)
    || '|' || (SELECT count(*) FROM public.observations)
    || '|' || (SELECT count(*) FROM public.audit_events)
    || '|' || (SELECT count(*) FROM public.students);
$c$;

DO $suite$
DECLARE
  v_centre    uuid;
  v_module    uuid;
  v_session   uuid;
  v_student   uuid;
  v_obs       uuid;
  v_b_session uuid;
  v_b_student uuid;
  v_n         bigint;
  v_a0        bigint;
  v_a1        bigint;
  v_sqlstate  text;
  v_init      boolean;
  v_changed   boolean;
  v_from      text;
  v_payload   jsonb;
  v_ratings   jsonb;
  v_pass      int := 0;
  v_fail      int := 0;
BEGIN
  SELECT m.centre_id, m.class_module_id, m.class_session_id, m.student_id, m.observation_id
    INTO v_centre, v_module, v_session, v_student, v_obs
    FROM pg_temp.mint_isolated_pair('FA1') m;

  -- ⛔ THE MINT SEEDS AN ATTENDANCE ROW AND AN OBSERVATION. Both are removed
  -- here so this suite starts from the state a REAL newly enrolled learner is
  -- in: enrolled, with nothing recorded. Without this the defect could not
  -- reproduce, and FA-1 would pass for the wrong reason.
  DELETE FROM public.observation_ratings WHERE observation_id = v_obs;
  DELETE FROM public.observations        WHERE id = v_obs;
  DELETE FROM public.attendance
   WHERE class_session_id = v_session AND student_id = v_student;

  SELECT count(*) INTO v_n FROM public.attendance
   WHERE class_session_id = v_session AND student_id = v_student;
  IF v_n = 0 THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS FA-0 -- SETUP: the learner is enrolled with NO attendance row, the real newly-enrolled state';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL FA-0 -- % attendance row(s) survive; the defect cannot reproduce', v_n; END IF;

  -- ⚠️ THE RATINGS PAYLOAD IS BUILT OWNER-SIDE, DELIBERATELY.
  -- `assessment_dimensions` carries NO `authenticated` SELECT (it is not one of
  -- the 13 granted tables), so building it under impersonation fails 42501 --
  -- which is a REAL refusal, and one that would have masked the BC102 this
  -- suite exists to measure. In the product the nine codes come from a
  -- frontend constant, not from a client read of that table.
  SELECT pg_catalog.jsonb_agg(
           pg_catalog.jsonb_build_object('dimension_code', d.code::text, 'rating', 'developing'))
    INTO v_ratings FROM public.assessment_dimensions d;

  RAISE NOTICE 'DURING-COUNTS %', pg_temp.runner_counts();

  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_trainer();

  -- ---------------------------------------------------------------
  -- FA-1 -- THE DEFECT REPRODUCES.
  -- ---------------------------------------------------------------
  BEGIN
    PERFORM public.assessment_save_complete_and_open_report(
      v_session, v_student, NULL, NULL, NULL, NULL, NULL, NULL, NULL, v_ratings);
    v_sqlstate := 'NONE';
  EXCEPTION WHEN OTHERS THEN
    v_sqlstate := SQLSTATE;
  END;
  IF v_sqlstate = 'BC102' THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS FA-1 -- the governed save REFUSES a learner with no attendance row, with exactly BC102';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL FA-1 -- the save returned SQLSTATE %, expected BC102', v_sqlstate; END IF;

  -- ---------------------------------------------------------------
  -- FA-7 -- ⛔ THE STANDING PROHIBITION AT THE DATA LAYER.
  -- ---------------------------------------------------------------
  EXECUTE 'RESET ROLE';
  SELECT count(*) INTO v_n FROM public.attendance
   WHERE class_session_id = v_session AND student_id = v_student;
  IF v_n = 0 THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS FA-7 -- the REFUSED save created NO attendance row; the assessment never materializes its own precondition (fix D, standing)';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL FA-7 -- the refused save created % attendance row(s)', v_n; END IF;

  -- FA-8 -- its control: the refusal really was reached, nothing partial.
  SELECT count(*) INTO v_n FROM public.observations
   WHERE class_session_id = v_session AND student_id = v_student;
  IF v_n = 0 THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS FA-8 -- CONTROL: no observation was written either, so the refusal was reached and nothing partial committed';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL FA-8 -- % observation(s) exist after a refused save', v_n; END IF;

  -- ---------------------------------------------------------------
  -- FA-3 / FA-5 -- THE FIX'S CALL SHAPE, AND ITS AUDIT.
  -- ---------------------------------------------------------------
  SELECT count(*) INTO v_a0 FROM public.audit_events;
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_trainer();
  SELECT s.initialized, s.changed INTO v_init, v_changed
    FROM public.attendance_set_status(v_session, v_student, NULL, 'present') s;
  EXECUTE 'RESET ROLE';

  IF v_init THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS FA-3 -- newStatus present with expectedStatus OMITTED materialized the row and returned initialized: true';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL FA-3 -- initialized was %, expected true', v_init; END IF;

  SELECT count(*) INTO v_a1 FROM public.audit_events;
  SELECT e.state_from, e.payload INTO v_from, v_payload
    FROM public.audit_events e
   WHERE e.action = 'attendance.changed'
   ORDER BY e.seq_no DESC LIMIT 1;
  IF (v_a1 - v_a0) = 1 AND v_from IS NULL AND (v_payload->>'initialized')::boolean THEN
    v_pass := v_pass + 1; RAISE NOTICE 'PASS FA-5 -- the initialize is audited EXACTLY ONCE, state_from NULL, initialized: true';
  ELSE
    v_fail := v_fail + 1; RAISE WARNING 'FAIL FA-5 -- % event(s), state_from %, initialized %', v_a1 - v_a0, v_from, v_payload->>'initialized';
  END IF;

  -- ---------------------------------------------------------------
  -- FA-6 -- ⚠️ ITS CONTROL. A confirmed no-op emits NOTHING.
  -- ---------------------------------------------------------------
  SELECT count(*) INTO v_a0 FROM public.audit_events;
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_trainer();
  PERFORM public.attendance_set_status(v_session, v_student, 'present', 'present');
  EXECUTE 'RESET ROLE';
  SELECT count(*) INTO v_a1 FROM public.audit_events;
  IF v_a1 = v_a0 THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS FA-6 -- CONTROL: a confirmed NO-OP emits nothing, so "exactly once" above is discrimination, not a floor';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL FA-6 -- a no-op wrote % audit row(s)', v_a1 - v_a0; END IF;

  -- ---------------------------------------------------------------
  -- FA-2 -- ⚠️ THE CONTROL FOR FA-1. The SAME save now succeeds.
  -- ---------------------------------------------------------------
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_trainer();
  BEGIN
    PERFORM public.assessment_save_complete_and_open_report(
      v_session, v_student, NULL, NULL, NULL, NULL, NULL, NULL, NULL, v_ratings);
    v_sqlstate := 'NONE';
  EXCEPTION WHEN OTHERS THEN
    v_sqlstate := SQLSTATE;
  END;
  EXECUTE 'RESET ROLE';
  IF v_sqlstate = 'NONE' THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS FA-2 -- CONTROL: the SAME save SUCCEEDS once the row exists, so FA-1 was the attendance guard and nothing else';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL FA-2 -- the save still failed with %; FA-1 is uninterpretable', v_sqlstate; END IF;

  -- ---------------------------------------------------------------
  -- FA-4 -- ⚠️ initialized: true is a MEASUREMENT, not a constant.
  -- ---------------------------------------------------------------
  -- ⚠️ REUSES THE SAME LEARNER, WHO NOW PROVABLY HAS A ROW because FA-3 just
  -- created it. A second minted pair was tried first and answered `stale state`:
  -- its attendance state was an ASSUMPTION about what the mint seeds, and this
  -- control must not rest on one. The row this leg needs is the row FA-3 is
  -- measured to have made.
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_trainer();
  SELECT s.initialized INTO v_init
    FROM public.attendance_set_status(v_session, v_student, 'present', 'absent') s;
  EXECUTE 'RESET ROLE';
  IF NOT v_init THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS FA-4 -- CONTROL: an ALREADY-RECORDED learner returns initialized: false';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL FA-4 -- initialized was true for a learner who already had a row'; END IF;

  RAISE NOTICE 'F-ATTENDANCE-INIT-1 SUITE RESULT -- % PASS, % FAIL', v_pass, v_fail;
  IF v_fail > 0 THEN
    RAISE EXCEPTION 'F-ATTENDANCE-INIT-1 suite FAILED with % failing leg(s)', v_fail;
  END IF;
END;
$suite$;

ROLLBACK;
