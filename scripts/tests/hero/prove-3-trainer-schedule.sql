-- =====================================================================
-- HERO PHASE 3 -- `05` Trainer Schedule: ROOM and the `Main:` TRAINER
-- =====================================================================
-- Phase 3 adds NO database object. Its two deliverables come from work
-- already shipped -- `room` from the Phase 0B migration, the assigned
-- trainer from Phase 0A's `class_session_staff_identity`. What is NOT yet
-- proven, and what this suite exists for, is that the TRAINER'S OWN
-- CREDENTIAL can actually read them.
--
-- ⚠️ THIS RUNS UNDER `SET LOCAL ROLE authenticated`, NOT AS THE OWNER.
-- That is the whole point of leg P3-2. `class_sessions` is owned by
-- `postgres` and is NOT `FORCE ROW LEVEL SECURITY`, so a suite that read
-- it as the owner would bypass RLS entirely and prove nothing about what a
-- trainer can see. `room` was added by Phase 0B AFTER
-- `class_sessions_select_trainer` was written, and although RLS is
-- row-level rather than column-level, "the policy predates the column" is
-- exactly the kind of assumption this project has been wrong about before.
-- It is measured, not reasoned about.
--
-- ⚠️ TRANSACTION-SCOPED, ENDING IN `ROLLBACK` -- the pattern accepted at
-- Phase 1. The runner re-measures the governed counts and fails if any
-- moved.
--
-- ⚠️ NON-VACUITY FIRST (P3-1), for the reason recorded as the S-8 finding:
-- with no assigned session, every later leg would pass because there was
-- nothing to read, not because the read is correct.
--
-- Run by scripts/tests/hero/prove-3-trainer-schedule.mjs
-- =====================================================================
\set ON_ERROR_STOP on
\pset pager off
\pset footer off

BEGIN;

DO $suite$
DECLARE
  v_session  uuid;
  v_room     text;
  v_name     text;
  v_n        bigint;
  v_dupes    bigint;
  v_pass     int := 0;
  v_fail     int := 0;
BEGIN
  -- Owner-side setup: give the trainer's first assigned session a room.
  -- Done BEFORE the role switch, because `authenticated` holds no write
  -- grant on `class_sessions` and must not be given one to make a test pass.
  SELECT cs.id INTO v_session
    FROM public.class_sessions cs
    JOIN public.class_session_assignments a
      ON a.class_session_id = cs.id AND a.is_active
    JOIN public.centre_memberships m
      ON m.id = a.trainer_membership_id
     AND m.account_id = (SELECT ac.id FROM public.accounts ac
                          WHERE ac.auth_user_id = 'd0000000-0000-4000-8000-000000000002'::uuid)
   ORDER BY cs.session_date
   LIMIT 1;

  IF v_session IS NULL THEN
    RAISE EXCEPTION 'P3-SETUP failed: the fixture trainer has no active session assignment';
  END IF;

  UPDATE public.class_sessions SET room = 'Studio 2' WHERE id = v_session;

  -- ---------------------------------------------------------------
  -- Everything below runs AS THE TRAINER, under RLS.
  -- ---------------------------------------------------------------
  PERFORM pg_catalog.set_config('request.jwt.claims',
    '{"sub":"d0000000-0000-4000-8000-000000000002","role":"authenticated"}', true);
  EXECUTE 'SET LOCAL ROLE authenticated';

  -- P3-1 -- ⚠️ NON-VACUITY, FIRST. The trainer's own scoped select over
  -- `class_sessions` returns something. Every leg below is meaningless
  -- otherwise.
  SELECT pg_catalog.count(*) INTO v_n FROM public.class_sessions;
  IF v_n > 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P3-1 -- NON-VACUOUS: the trainer''s RLS-scoped schedule returns % session(s)', v_n;
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P3-1 -- the trainer sees ZERO sessions; every later leg would pass for the wrong reason';
  END IF;

  -- P3-2 -- the Phase 0B `room` column is READABLE over the trainer's own
  -- credential, under RLS, from the row the schedule projection selects.
  SELECT cs.room INTO v_room FROM public.class_sessions cs WHERE cs.id = v_session;
  IF v_room = 'Studio 2' THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P3-2 -- `room` reaches the trainer under RLS: %', v_room;
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P3-2 -- `room` did not reach the trainer (got %)', COALESCE(v_room, '(null)');
  END IF;

  -- P3-3 -- the `Main:` name. Read through the SHARED Phase 0A path, which
  -- is what the projection calls -- not a join re-derived in this suite.
  SELECT s.trainer_display_name INTO v_name
    FROM public.class_session_staff_identity(v_session) s;
  IF v_name IS NOT NULL AND pg_catalog.length(v_name) > 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P3-3 -- the `Main:` assigned trainer reaches the schedule: %', v_name;
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P3-3 -- no assigned-trainer name reached the schedule';
  END IF;

  -- P3-4 -- ⛔ G-7 STRUCTURALLY: there is no SECOND staff row to render.
  -- The `Assist.` omission is not a rendering choice -- the read path
  -- cannot produce a second name. Measured two ways: the function returns
  -- at most one row, and NO session anywhere holds two active assignments.
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.class_session_staff_identity(v_session);
  EXECUTE 'RESET ROLE';
  SELECT pg_catalog.count(*) INTO v_dupes FROM (
    SELECT a.class_session_id
      FROM public.class_session_assignments a
     WHERE a.is_active
     GROUP BY a.class_session_id
    HAVING pg_catalog.count(*) > 1
  ) d;
  IF v_n <= 1 AND v_dupes = 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P3-4 -- G-7 holds structurally: the identity read returns % row, and 0 session(s) carry a second active assignment', v_n;
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P3-4 -- identity returned % row(s) and % session(s) carry two active assignments', v_n, v_dupes;
  END IF;

  -- P3-5 -- ⛔ G-6: `room` CARRIES NO AUTHORIZATION MEANING. Asserted where
  -- it would actually be violated -- the policy catalogue. If `room` ever
  -- appeared in a USING or WITH CHECK expression, a descriptive label would
  -- have become an access-control input, which the ruling forbids outright.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_policies p
   WHERE p.schemaname = 'public'
     AND (COALESCE(p.qual, '') ~ '\mroom\M' OR COALESCE(p.with_check, '') ~ '\mroom\M');
  IF v_n = 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P3-5 -- `room` appears in NO policy expression; it scopes nothing';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P3-5 -- `room` appears in % policy expression(s); it has become an authorization input', v_n;
  END IF;

  -- P3-6 -- an unauthenticated caller gets no staff identity, so the
  -- `Main:` row is not reachable without a live session.
  PERFORM pg_catalog.set_config('request.jwt.claims', '', true);
  SELECT pg_catalog.count(*) INTO v_n FROM public.class_session_staff_identity(v_session);
  IF v_n = 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P3-6 -- an unauthenticated caller receives no staff identity';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P3-6 -- an unauthenticated caller received % staff row(s)', v_n;
  END IF;

  RAISE NOTICE '--- Phase 3 trainer-schedule suite: % passed, % failed ---', v_pass, v_fail;
  IF v_fail > 0 THEN
    RAISE EXCEPTION 'Phase 3 trainer-schedule suite FAILED with % failure(s)', v_fail;
  END IF;
  IF v_pass <> 6 THEN
    RAISE EXCEPTION 'Phase 3 trainer-schedule suite is INCOMPLETE: % of 6 legs ran; an unrun leg is NOT-RUN, never PASS', v_pass;
  END IF;
END;
$suite$;

-- ⚠️ NOTHING ABOVE IS KEPT. The `room` write is rolled back with everything else.
ROLLBACK;
