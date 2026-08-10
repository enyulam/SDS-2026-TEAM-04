-- =====================================================================
-- HERO PHASE 9 -- `29` Management Reports: Class, Lesson, Trainer, filter
-- =====================================================================
-- ⚠️ THE CLAIM THIS SUITE EXISTS TO PROVE IS A DESIGN DECISION, NOT A
-- FEATURE. Phase 9 needed the academic context of a class session on a
-- queue whose rows are mostly `trainer_approved` and `needs_edit`. The
-- obvious reuse was the Phase 0B RPC `report_get_canonical_context`, which
-- returns exactly the right four fields -- and which is gated on
-- `latest_submitted_version_id IS NOT NULL`, because it exists to describe
-- a SUBMITTED report.
--
-- ⛔ THE FIX WAS NOT TO WIDEN THAT GATE. `P9-2` measures that the RPC
-- returns ZERO ROWS for a `trainer_approved` pair, and `P9-3` measures that
-- its submitted-version precondition is STILL THERE -- i.e. that the
-- problem was solved by choosing a different read, not by removing the
-- thing that refused (`CLAUDE.md` §12).
--
-- ⚠️ RUNS UNDER `SET LOCAL ROLE authenticated`, NOT AS THE OWNER. The whole
-- point is that RLS decides. `FORCE ROW LEVEL SECURITY` is off, so the
-- owner would sail through every policy and every leg below would pass for
-- the wrong reason -- the `bool_and`-over-zero-rows shape this project has
-- now been bitten by three times.
--
-- ⚠️ TRANSACTION-SCOPED, ENDING IN `ROLLBACK`. A `trainer_approved` report
-- is constructed here because the fixture holds none; the runner
-- re-measures the governed counts afterwards and FAILS if any moved.
--
-- Run by scripts/tests/hero/prove-9-management-reports.mjs
-- =====================================================================
\set ON_ERROR_STOP on
\pset pager off
\pset footer off

BEGIN;

CREATE FUNCTION pg_temp.as_management() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims',
  '{"sub":"d0000000-0000-4000-8000-000000000001","role":"authenticated"}', true); END $$;

CREATE FUNCTION pg_temp.as_nobody() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims', '', true); END $$;

DO $suite$
DECLARE
  v_session   uuid;
  v_student   uuid;
  v_centre    uuid;
  v_module    uuid;
  v_enrolment uuid;
  v_obs       uuid;
  v_report    uuid;
  v_grade     text;
  v_title     text;
  v_lesson    smallint;
  v_trainer   text;
  v_src       text;
  v_n         bigint;
  v_pass      int := 0;
  v_fail      int := 0;
BEGIN
  -- ---------------------------------------------------------------
  -- Set up: a report sitting at `trainer_approved` -- the queue's
  -- primary mode, and a state with NO submitted version by definition.
  -- ---------------------------------------------------------------
  SELECT o.class_session_id, o.student_id, o.id
    INTO v_session, v_student, v_obs
    FROM public.observations o
    JOIN public.class_sessions cs ON cs.id = o.class_session_id
   ORDER BY cs.session_date
   LIMIT 1;
  IF v_obs IS NULL THEN
    RAISE EXCEPTION 'P9-SETUP failed: no observation to build a report on';
  END IF;

  SELECT cs.centre_id, cs.class_module_id INTO v_centre, v_module
    FROM public.class_sessions cs WHERE cs.id = v_session;
  SELECT e.id INTO v_enrolment FROM public.enrolments e
   WHERE e.class_module_id = v_module AND e.student_id = v_student AND e.is_active;

  INSERT INTO public.reports (centre_id, class_session_id, class_module_id, student_id,
                              enrolment_id, observation_id, status, lock_version)
       VALUES (v_centre, v_session, v_module, v_student, v_enrolment, v_obs,
               'trainer_approved', 4)
    RETURNING id INTO v_report;

  RAISE NOTICE 'P9-SETUP  -- a trainer_approved report with NO submitted version, IN THIS TRANSACTION ONLY';

  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_management();

  -- ---------------------------------------------------------------
  -- P9-1 -- ⚠️ NON-VACUITY / THE PERMIT LEG. Management's OWN Step 7G
  -- scope returns the class and lesson context of that session. Every
  -- refusal below is meaningless if this read returns nothing.
  -- ---------------------------------------------------------------
  SELECT cg.display_name, cm.title, cs.lesson_number
    INTO v_grade, v_title, v_lesson
    FROM public.class_sessions cs
    JOIN public.class_modules cm ON cm.id = cs.class_module_id
    JOIN public.class_grades  cg ON cg.id = cm.class_grade_id
   WHERE cs.id = v_session;
  IF v_grade IS NOT NULL AND v_title IS NOT NULL THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P9-1 -- NON-VACUOUS: management read the context over its own credential (% / % / lesson %)',
      v_grade, v_title, COALESCE(v_lesson::text, 'not recorded');
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P9-1 -- management could not read the session context under RLS';
  END IF;

  -- ---------------------------------------------------------------
  -- P9-2 -- ⚠️ THE DESIGN JUSTIFICATION. The SAME management caller gets
  -- ZERO ROWS from the Phase 0B RPC for this pair, because the report has
  -- no submitted version. The RPC could NOT have served this screen.
  -- ---------------------------------------------------------------
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.report_get_canonical_context(v_session, v_student);
  IF v_n = 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P9-2 -- report_get_canonical_context returns ZERO rows for the trainer_approved pair: reuse was impossible, not merely inconvenient';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P9-2 -- the RPC returned % row(s) for a report with no submitted version', v_n;
  END IF;

  -- ---------------------------------------------------------------
  -- P9-3 -- ⛔ AND THE GATE THAT REFUSED IS STILL THERE. §12 forbids
  -- working around a fail-closed refusal by weakening the thing that
  -- refused; this leg is what makes that check mechanical rather than a
  -- promise in a comment.
  -- ---------------------------------------------------------------
  SELECT p.prosrc INTO v_src FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_get_canonical_context';
  IF v_src IS NOT NULL AND pg_catalog.strpos(v_src, 'latest_submitted_version_id IS NULL') > 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P9-3 -- the RPC still refuses a report with no submitted version: Phase 9 changed no gate';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P9-3 -- the submitted-version precondition is missing from report_get_canonical_context';
  END IF;

  -- ---------------------------------------------------------------
  -- P9-4 -- the Trainer column has a real source: the SHARED Phase 0A
  -- identity path serves management too, so `29` does not carry a second
  -- copy of that join.
  -- ---------------------------------------------------------------
  SELECT s.trainer_display_name INTO v_trainer
    FROM public.class_session_staff_identity(v_session) s;
  IF v_trainer IS NOT NULL THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P9-4 -- the shared staff-identity path returns the assigned trainer for management (%)', v_trainer;
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P9-4 -- no trainer identity for a session that has an active assignment';
  END IF;

  -- ---------------------------------------------------------------
  -- P9-5 -- ⛔ THE REFUSAL LEG, and the one that proves P9-1 measured RLS
  -- rather than ownership: the SAME statement, same role, NO identity,
  -- returns nothing.
  -- ---------------------------------------------------------------
  PERFORM pg_temp.as_nobody();
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.class_sessions cs
    JOIN public.class_modules cm ON cm.id = cs.class_module_id
    JOIN public.class_grades  cg ON cg.id = cm.class_grade_id
   WHERE cs.id = v_session;
  IF v_n = 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P9-5 -- an authenticated caller with no identity reads ZERO rows: RLS decided P9-1, not owner privilege';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P9-5 -- an unidentified caller read % context row(s)', v_n;
  END IF;

  EXECUTE 'RESET ROLE';

  -- ---------------------------------------------------------------
  -- P9-6 -- ⛔ G-4 IS STRUCTURAL, NOT JUST ABSENT FROM THE SCREEN. No
  -- term table, column or enum exists anywhere in `public`. The frame's
  -- "All terms" filter has no substrate to be built on, which is exactly
  -- the reason G-4 gave for refusing it.
  -- ---------------------------------------------------------------
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.columns c
   WHERE c.table_schema = 'public'
     AND (c.table_name = 'terms' OR c.column_name IN ('term', 'term_id', 'term_label'));
  IF v_n = 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P9-6 -- no term table and no term column exists: G-4 held at the schema, not only at the screen';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P9-6 -- % term-shaped column(s) exist -- the §8-deferred substrate G-4 refused', v_n;
  END IF;

  RAISE NOTICE '---- P9 SQL: % passed, % failed ----', v_pass, v_fail;
  IF v_fail > 0 THEN
    RAISE EXCEPTION 'P9 SQL suite FAILED with % failing leg(s)', v_fail;
  END IF;
END
$suite$;

ROLLBACK;
