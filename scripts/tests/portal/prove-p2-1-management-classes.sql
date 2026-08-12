-- =====================================================================
-- PORTAL PHASE P2-1 -- screen `12` Management Classes.
-- =====================================================================
-- ⚠️ THIS PHASE ADDS NO MIGRATION, AND THAT CLAIM IS ITSELF A LEG. The
-- delta was classified NEEDS NEW PROJECTION + NEEDS NEW SERVER ACTION on a
-- MEASUREMENT of the policies and grants that already exist, not on a
-- reading of the frame. If that measurement were wrong the screen would
-- either need schema or would silently render an empty academy, so P21-3
-- re-measures both layers here rather than citing the earlier session.
--
-- Proves, in order:
--   P21-1  NON-VACUITY FIRST. Active class modules, active enrolments and
--          active assignments EXIST. ⛔ Without this every count leg below
--          is equally consistent with an empty database, and a screen that
--          renders nothing passes a suite that asserts nothing is wrong.
--   P21-2  THE VOCABULARY DIVERGENCE, MEASURED. `class_grades` holds
--          EXACTLY `beginner` / `intermediate` / `advanced`, and `junior`
--          -- the frame's tab -- is absent. A-016 / A-054.
--   P21-3  BOTH LAYERS, SEPARATELY. A management SELECT policy AND a
--          matching `authenticated` GRANT exist on all eight relations the
--          projection reads. ⚠️ A present policy with no grant reads as an
--          RLS failure (A-030), so measuring one is not measuring the other.
--   P21-4  ANON reads ZERO class modules.
--   P21-5  ⚠️ THE CONTROL, AFTER the denial. MANAGEMENT reads more than
--          zero through the SAME impersonation harness -- without it, the
--          zero above is equally consistent with a probe that reads
--          nothing for anybody.
--   P21-6  Management sees EVERY active module of its own centre -- the
--          count matches the owner-side count exactly, so the card list is
--          the academy's classes and not a silently shortened subset.
--   P21-7  Every remaining relation the projection reads answers for
--          management: grades, enrolments, sessions, assignments,
--          memberships, accounts.
--   P21-8  ⛔ NO RATING RELATION IS CLIENT-READABLE AT ALL. C-9 keeps
--          per-dimension ratings off a LIST surface; at HEAD the rating
--          tables carry NO grant to any client role, so this screen could
--          not read one even if a later edit asked it to.
--   P21-9  The report relations are equally unreachable -- `12` shows no
--          report status, and no direct read could give it one.
--
-- ⚠️ RUNS UNDER `SET LOCAL ROLE authenticated` for every caller leg, NOT as
-- the owner: an owner-side read proves nothing about what a real caller
-- reaches.
--
-- ⚠️ READ-ONLY AND TRANSACTION-SCOPED, ending in ROLLBACK. It mints
-- nothing and writes nothing -- it measures the academy that is there.
-- =====================================================================

BEGIN;

CREATE FUNCTION pg_temp.as_management() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims',
  '{"sub":"d0000000-0000-4000-8000-000000000001","role":"authenticated"}', true); END $$;

CREATE FUNCTION pg_temp.as_nobody() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims', '', true); END $$;

DO $suite$
DECLARE
  v_modules_owner   integer;
  v_enrolments      integer;
  v_assignments     integer;
  v_grade_codes     text;
  v_missing         text;
  v_seen            integer;
  v_ok              boolean;
BEGIN
  -- -----------------------------------------------------------------
  -- P21-1 -- NON-VACUITY.
  -- -----------------------------------------------------------------
  SELECT count(*) INTO v_modules_owner FROM public.class_modules WHERE is_active;
  SELECT count(*) INTO v_enrolments FROM public.enrolments WHERE is_active;
  SELECT count(*) INTO v_assignments FROM public.class_session_assignments WHERE is_active;
  IF v_modules_owner > 0 AND v_enrolments > 0 AND v_assignments > 0 THEN
    RAISE NOTICE 'PASS P21-1  NON-VACUITY: % active module(s), % active enrolment(s), % active assignment(s) EXIST -- the legs below are not vacuous',
      v_modules_owner, v_enrolments, v_assignments;
  ELSE
    RAISE NOTICE 'FAIL P21-1  the database holds no class to list (modules=%, enrolments=%, assignments=%)',
      v_modules_owner, v_enrolments, v_assignments;
  END IF;

  -- -----------------------------------------------------------------
  -- P21-2 -- THE RATIFIED CLASS GRADE VOCABULARY, AND THE FRAME'S IS NOT IT.
  -- -----------------------------------------------------------------
  SELECT string_agg(code::text, ',' ORDER BY sort_order) INTO v_grade_codes FROM public.class_grades;
  IF v_grade_codes = 'beginner,intermediate,advanced'
     AND NOT EXISTS (SELECT 1 FROM public.class_grades WHERE code::text = 'junior') THEN
    RAISE NOTICE 'PASS P21-2  class_grades is EXACTLY [%] and `junior` is absent -- the frame''s tab is a vocabulary divergence, not a synonym (A-016, A-054)', v_grade_codes;
  ELSE
    RAISE NOTICE 'FAIL P21-2  class_grades reads [%]', v_grade_codes;
  END IF;

  -- -----------------------------------------------------------------
  -- P21-3 -- POLICY *AND* GRANT, MEASURED SEPARATELY, ON ALL EIGHT.
  -- -----------------------------------------------------------------
  SELECT string_agg(t.name, ', ') INTO v_missing
  FROM (VALUES ('class_grades'),('class_modules'),('class_sessions'),('enrolments'),
               ('students'),('centre_memberships'),('class_session_assignments'),('accounts')) AS t(name)
  WHERE NOT EXISTS (
      SELECT 1 FROM pg_policies p
      WHERE p.schemaname = 'public' AND p.tablename = t.name AND p.cmd = 'SELECT'
    )
     OR NOT EXISTS (
      SELECT 1 FROM information_schema.role_table_grants g
      WHERE g.table_schema = 'public' AND g.table_name = t.name
        AND g.grantee = 'authenticated' AND g.privilege_type = 'SELECT'
    );
  IF v_missing IS NULL THEN
    RAISE NOTICE 'PASS P21-3  all EIGHT relations carry a SELECT policy AND a matching `authenticated` SELECT grant -- BOTH layers measured, which is why this phase needs no migration';
  ELSE
    RAISE NOTICE 'FAIL P21-3  missing a policy or a grant on: %', v_missing;
  END IF;

  -- -----------------------------------------------------------------
  -- P21-4 -- ANON READS NOTHING.
  -- -----------------------------------------------------------------
  SET LOCAL ROLE authenticated;
  PERFORM pg_temp.as_nobody();
  SELECT count(*) INTO v_seen FROM public.class_modules;
  IF v_seen = 0 THEN
    RAISE NOTICE 'PASS P21-4  an UNIDENTIFIED caller reads ZERO class modules';
  ELSE
    RAISE NOTICE 'FAIL P21-4  an unidentified caller read % class module(s)', v_seen;
  END IF;

  -- -----------------------------------------------------------------
  -- P21-5 -- THE CONTROL. The same probe CAN return rows.
  -- -----------------------------------------------------------------
  PERFORM pg_temp.as_management();
  SELECT count(*) INTO v_seen FROM public.class_modules WHERE is_active;
  IF v_seen > 0 THEN
    RAISE NOTICE 'PASS P21-5  CONTROL: MANAGEMENT reads % active module(s) through the SAME harness -- the zero above is DISCRIMINATION, not blindness', v_seen;
  ELSE
    RAISE NOTICE 'FAIL P21-5  management read zero modules -- every denial leg above is meaningless';
  END IF;

  -- -----------------------------------------------------------------
  -- P21-6 -- MANAGEMENT SEES THE WHOLE CENTRE, not a shortened list.
  -- -----------------------------------------------------------------
  IF v_seen = v_modules_owner THEN
    RAISE NOTICE 'PASS P21-6  management reads EVERY active module of its centre (% = %) -- the card list is the academy''s classes, not a subset', v_seen, v_modules_owner;
  ELSE
    RAISE NOTICE 'FAIL P21-6  management reads % of % active modules', v_seen, v_modules_owner;
  END IF;

  -- -----------------------------------------------------------------
  -- P21-7 -- EVERY OTHER RELATION THE PROJECTION READS ANSWERS.
  -- -----------------------------------------------------------------
  SELECT (SELECT count(*) FROM public.class_grades) = 3
     AND (SELECT count(*) FROM public.enrolments WHERE is_active) > 0
     AND (SELECT count(*) FROM public.class_sessions) > 0
     AND (SELECT count(*) FROM public.class_session_assignments WHERE is_active) > 0
     AND (SELECT count(*) FROM public.centre_memberships) > 0
     AND (SELECT count(*) FROM public.accounts) > 0
    INTO v_ok;
  IF v_ok THEN
    RAISE NOTICE 'PASS P21-7  grades, enrolments, sessions, assignments, memberships and accounts all answer for MANAGEMENT over its own credential';
  ELSE
    RAISE NOTICE 'FAIL P21-7  one of the projection''s relations returned nothing for management';
  END IF;

  -- -----------------------------------------------------------------
  -- P21-8 -- NO RATING RELATION IS CLIENT-READABLE.
  -- -----------------------------------------------------------------
  RESET ROLE;
  SELECT count(*) INTO v_seen
  FROM information_schema.role_table_grants
  WHERE table_schema = 'public'
    AND table_name IN ('observation_ratings','report_version_ratings')
    AND grantee IN ('anon','authenticated','service_role');
  IF v_seen = 0 THEN
    RAISE NOTICE 'PASS P21-8  the rating relations carry ZERO client grants -- C-9 holds structurally here: no direct read on this surface could reach a per-dimension rating';
  ELSE
    RAISE NOTICE 'FAIL P21-8  % client grant(s) exist on a rating relation', v_seen;
  END IF;

  -- -----------------------------------------------------------------
  -- P21-9 -- AND NEITHER IS A REPORT.
  -- -----------------------------------------------------------------
  SELECT count(*) INTO v_seen
  FROM information_schema.role_table_grants
  WHERE table_schema = 'public'
    AND table_name IN ('reports','report_versions')
    AND grantee IN ('anon','authenticated','service_role');
  IF v_seen = 0 THEN
    RAISE NOTICE 'PASS P21-9  `reports` and `report_versions` carry ZERO client grants -- screen `12` shows no report status and no direct read could give it one';
  ELSE
    RAISE NOTICE 'FAIL P21-9  % client grant(s) exist on a report relation', v_seen;
  END IF;
END
$suite$;

ROLLBACK;
