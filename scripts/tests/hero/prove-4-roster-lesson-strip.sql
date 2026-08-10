-- =====================================================================
-- HERO PHASE 4 -- `06` Trainer Student Roster: the LESSON STRIP, and the
-- G-3 BOUNDARY it must not cross
-- =====================================================================
-- Phase 4 adds NO database object. Its deliverables are the lesson number
-- and title (Phase 0B columns), the room, and the assigned trainer in the
-- banner (Phase 0A + Phase 3).
--
-- ⚠️ THE POINT OF THIS SUITE IS NOT THAT THE LESSON RENDERS. It is that
-- LESSON IDENTITY AND THE GOVERNED CARRIED-OVER FOCUS ARE DIFFERENT
-- FIELDS AND STAY THAT WAY (G-3, FINAL_MVP_HERO_CHAIN_RULINGS §3.2).
--
-- The frame draws KEY FOCUS chips -- lesson-plan INTENT -- in exactly the
-- visual position the roster already uses for the trainer's own
-- carried-over previous-session focus, which comes from
-- `observations.follow_up_notes` on the PREVIOUS session of the same
-- module. Conflating them would SILENTLY REPLACE A GOVERNED FIELD WITH AN
-- UNGOVERNED ONE, and the strip would still look correct. That is why the
-- prohibition is asserted here rather than trusted to a comment, and why
-- `CLAUDE.md` §10 Phase 1 exit condition (c) depends on it.
--
-- ⚠️ TRANSACTION-SCOPED, ENDING IN `ROLLBACK` -- the accepted pattern.
-- ⚠️ NON-VACUITY FIRST (P4-1): a carry-over that does not exist cannot be
-- proven undisturbed, and the S-8 finding is that such a leg passes for
-- the wrong reason.
--
-- Run by scripts/tests/hero/prove-4-roster-lesson-strip.mjs
-- =====================================================================
\set ON_ERROR_STOP on
\pset pager off
\pset footer off

BEGIN;

DO $suite$
DECLARE
  v_module    uuid;
  v_prev      uuid;
  v_curr      uuid;
  v_student   uuid;
  v_focus     text;
  v_focus2    text;
  v_lesson    text;
  v_room      text;
  v_num       smallint;
  v_name      text;
  v_n         bigint;
  v_chips     bigint;
  v_pass      int := 0;
  v_fail      int := 0;
BEGIN
  -- ---------------------------------------------------------------
  -- Find a module with TWO sessions where the EARLIER one carries a
  -- trainer follow-up note -- i.e. a real carry-over pair. This is the
  -- fixture breadth the plan's §7.2 step 5 expansion supplies.
  -- ---------------------------------------------------------------
  SELECT cs.class_module_id, cs.id, o.student_id, o.follow_up_notes
    INTO v_module, v_prev, v_student, v_focus
    FROM public.class_sessions cs
    JOIN public.observations o ON o.class_session_id = cs.id
   WHERE o.follow_up_notes IS NOT NULL AND pg_catalog.length(o.follow_up_notes) > 0
   ORDER BY cs.session_date
   LIMIT 1;

  SELECT cs.id INTO v_curr
    FROM public.class_sessions cs
   WHERE cs.class_module_id = v_module AND cs.session_date > (
           SELECT p.session_date FROM public.class_sessions p WHERE p.id = v_prev)
   ORDER BY cs.session_date
   LIMIT 1;

  -- P4-1 -- ⚠️ NON-VACUITY, FIRST. There is a genuine carry-over pair: a
  -- later session of the same module, and a real follow-up note on the
  -- earlier one. Every leg below is about not disturbing it.
  IF v_curr IS NOT NULL AND v_focus IS NOT NULL THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P4-1 -- NON-VACUOUS: a real carry-over pair exists (prev % -> curr %), note length %',
      v_prev, v_curr, pg_catalog.length(v_focus);
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P4-1 -- no carry-over pair in the fixture; the G-3 legs below would pass for the wrong reason';
    RAISE EXCEPTION 'Phase 4 suite cannot proceed without a carry-over pair';
  END IF;

  -- Give the CURRENT session lesson identity and a room, with values
  -- chosen to be OBVIOUSLY DIFFERENT from the carried-over note.
  UPDATE public.class_sessions
     SET lesson_number = 3, lesson_title = 'Voice & Projection', room = 'Studio 2'
   WHERE id = v_curr;

  -- ---------------------------------------------------------------
  -- As the trainer, under RLS.
  -- ---------------------------------------------------------------
  PERFORM pg_catalog.set_config('request.jwt.claims',
    '{"sub":"d0000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
  EXECUTE 'SET LOCAL ROLE authenticated';

  -- P4-2 -- lesson number, title and room reach the trainer under RLS.
  SELECT cs.lesson_number, cs.lesson_title, cs.room
    INTO v_num, v_lesson, v_room
    FROM public.class_sessions cs WHERE cs.id = v_curr;
  IF v_num = 3 AND v_lesson = 'Voice & Projection' AND v_room = 'Studio 2' THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P4-2 -- the lesson strip''s three fields reach the trainer: Lesson % · % / %', v_num, v_lesson, v_room;
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P4-2 -- lesson/room did not reach the trainer (% / % / %)', v_num, v_lesson, v_room;
  END IF;

  -- P4-3 -- the banner's `Trainer:` name, via the shared Phase 0A path.
  SELECT s.trainer_display_name INTO v_name
    FROM public.class_session_staff_identity(v_curr) s;
  IF v_name IS NOT NULL AND pg_catalog.length(v_name) > 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P4-3 -- the banner''s assigned trainer reaches the roster: %', v_name;
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P4-3 -- no assigned-trainer name reached the roster';
  END IF;

  -- ---------------------------------------------------------------
  -- P4-4 -- ⛔ THE G-3 BOUNDARY. Writing lesson identity onto the
  -- CURRENT session left the PREVIOUS session's governed follow-up note
  -- byte-identical, and the two values are not even similar. They are
  -- different columns on different tables with different authority, and
  -- this measures that rather than asserting it.
  --
  -- ⚠️ READ THROUGH THE RPC, NOT THE TABLE, and that is not a workaround.
  -- An earlier revision of this leg selected `observations.follow_up_notes`
  -- directly and was refused: `authenticated` holds NO table grant on
  -- `observations`, by deliberate deny-by-default design (A-030 -- privilege
  -- and policy are separate layers). The refusal was CORRECT and the leg was
  -- wrong. `getSessionRosterCore` reads the carry-over through
  -- `assessment_get_trainer_observation`, so reading it the same way here
  -- proves the boundary ON THE PATH THE ROSTER ACTUALLY USES rather than on a
  -- table the application never touches -- strictly better evidence.
  -- ---------------------------------------------------------------
  SELECT o.follow_up_notes INTO v_focus2
    FROM public.assessment_get_trainer_observation(v_prev, v_student) o;
  IF v_focus2 = v_focus AND v_focus2 <> v_lesson AND pg_catalog.strpos(v_focus2, v_lesson) = 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P4-4 -- G-3 holds: the carried-over governed focus is BYTE-UNCHANGED and contains no lesson value';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P4-4 -- the governed carried-over focus was disturbed by, or now echoes, lesson identity';
  END IF;

  EXECUTE 'RESET ROLE';

  -- ---------------------------------------------------------------
  -- P4-5 -- ⛔ NO KEY FOCUS COLUMN EXISTS, and the GOVERNED chips still
  -- do. Both halves matter: the first is the G-3 prohibition, the second
  -- is the thing the prohibition protects. Asserting only the absence
  -- would pass just as well on a schema that had lost `focus_chips`.
  -- ---------------------------------------------------------------
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.columns c
   WHERE c.table_schema = 'public' AND c.table_name = 'class_sessions'
     AND (c.column_name LIKE '%focus%' OR c.column_name LIKE '%slide%'
          OR c.column_name LIKE '%lesson_plan%' OR c.column_name LIKE '%material%');
  SELECT pg_catalog.count(*) INTO v_chips
    FROM information_schema.columns c
   WHERE c.table_schema = 'public' AND c.table_name = 'observations'
     AND c.column_name = 'focus_chips';
  IF v_n = 0 AND v_chips = 1 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P4-5 -- no KEY FOCUS / slides / lesson-plan column on class_sessions, and observations.focus_chips is PRESERVED';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P4-5 -- % lesson-plan-shaped column(s) on class_sessions, and focus_chips present = %', v_n, v_chips;
  END IF;

  -- P4-6 -- an unauthenticated caller reaches neither the session nor the
  -- staff identity, so nothing on this strip is readable without a live
  -- assignment.
  PERFORM pg_catalog.set_config('request.jwt.claims', '', true);
  EXECUTE 'SET LOCAL ROLE authenticated';
  SELECT pg_catalog.count(*) INTO v_n FROM public.class_sessions WHERE id = v_curr;
  SELECT pg_catalog.count(*) INTO v_chips FROM public.class_session_staff_identity(v_curr);
  EXECUTE 'RESET ROLE';
  IF v_n = 0 AND v_chips = 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P4-6 -- an unauthenticated caller reaches neither the session row nor the staff identity';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P4-6 -- unauthenticated reached % session row(s) and % staff row(s)', v_n, v_chips;
  END IF;

  RAISE NOTICE '--- Phase 4 roster lesson-strip suite: % passed, % failed ---', v_pass, v_fail;
  IF v_fail > 0 THEN
    RAISE EXCEPTION 'Phase 4 roster lesson-strip suite FAILED with % failure(s)', v_fail;
  END IF;
  IF v_pass <> 6 THEN
    RAISE EXCEPTION 'Phase 4 suite is INCOMPLETE: % of 6 legs ran; an unrun leg is NOT-RUN, never PASS', v_pass;
  END IF;
END;
$suite$;

-- ⚠️ NOTHING ABOVE IS KEPT. The lesson/room write is rolled back with everything else.
ROLLBACK;
