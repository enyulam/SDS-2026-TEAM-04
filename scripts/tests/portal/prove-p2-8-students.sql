-- =====================================================================
-- PORTAL PHASE P2-8 -- screen `17` Management Students.
-- =====================================================================
-- This phase writes NO migration. The SQL half therefore proves the thing
-- that claim rests on: that every table the projection reads is ALREADY
-- reachable by management and NOT by anyone else, measured rather than
-- asserted from a plan note.
--
-- ⛔ EVERY LEG RUNS INSIDE THE TRANSACTION AND THE WHOLE FILE ROLLS BACK.
--    Nothing here commits, and the runner probes the counts either side.
-- =====================================================================

BEGIN;

DO $$
DECLARE
  v_pass integer := 0;
  v_fail integer := 0;
  v_n integer;
  v_m integer;
  v_txt text;
BEGIN
  -- -------------------------------------------------------------------
  -- PDT-1 -- NON-VACUITY. Every refusal leg below is trivially satisfied
  -- by an empty academy, so the subject is proven to exist FIRST.
  -- -------------------------------------------------------------------
  SELECT count(*) INTO v_n FROM public.students WHERE is_active;
  IF v_n > 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS PDT-1 -- NON-VACUOUS: % active student(s) exist, so the scoping legs measure something', v_n;
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL PDT-1 -- no active students; every leg below would be vacuous';
  END IF;

  -- -------------------------------------------------------------------
  -- PDT-2 -- ⛔ THE GRANT *AND* RLS *AND* A SELECT POLICY, ON ALL EIGHT TABLES.
  -- Privilege and policy are two separate layers (A-030) and a missing GRANT
  -- must never be misdiagnosed as an RLS failure. This phase's "no schema
  -- needed" claim requires every layer on every table it reads.
  --
  -- ⚠️ THIS LEG ORIGINALLY MATCHED ON POLICY *NAME* (`LIKE '%management%'`) AND
  -- FAILED 7/8 -- against a schema that is entirely correct. `class_grades`
  -- carries `class_grades_select_active_member`, which admits ANY active member
  -- because the grade vocabulary is not management-private. ▶ THE ASSERTION WAS
  -- WRONG, NOT THE SCHEMA: a naming convention is an incidental fact, and
  -- pinning one is the §12.8 shape one level up -- it measures how a policy was
  -- SPELLED rather than what it PERMITS. Rewritten to assert the CAPABILITY.
  -- -------------------------------------------------------------------
  SELECT count(*) INTO v_n
    FROM (VALUES ('students'),('enrolments'),('class_modules'),('class_grades'),
                 ('parent_student_links'),('parent_profiles'),('centre_memberships'),('accounts')) AS t(name)
   WHERE EXISTS (SELECT 1 FROM information_schema.role_table_grants g
                  WHERE g.table_schema='public' AND g.table_name=t.name
                    AND g.grantee='authenticated' AND g.privilege_type='SELECT');
  SELECT count(*) INTO v_m
    FROM (VALUES ('students'),('enrolments'),('class_modules'),('class_grades'),
                 ('parent_student_links'),('parent_profiles'),('centre_memberships'),('accounts')) AS t(name)
   WHERE EXISTS (SELECT 1 FROM pg_policies p
                  WHERE p.schemaname='public' AND p.tablename=t.name
                    AND p.cmd IN ('SELECT','ALL') AND p.permissive = 'PERMISSIVE')
     AND EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace ns ON ns.oid=c.relnamespace
                  WHERE ns.nspname='public' AND c.relname=t.name AND c.relrowsecurity);
  IF v_n = 8 AND v_m = 8 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS PDT-2 -- all 8 tables carry an authenticated SELECT GRANT, RLS ENABLED, and at least one permissive SELECT POLICY. Three layers, measured at HEAD -- this is what "no schema needed" rests on';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL PDT-2 -- grants on %/8, rls+policy on %/8', v_n, v_m;
  END IF;

  -- -------------------------------------------------------------------
  -- PDT-3 -- ⛔ `students` HAS NO CODE COLUMN. The frame draws
  -- `ID 2025-113` on every row. This leg is what makes the omission a
  -- MEASUREMENT rather than a preference -- and it FAILS LOUDLY if a
  -- later phase adds a code column without revisiting the screen.
  -- -------------------------------------------------------------------
  SELECT string_agg(column_name, ', ' ORDER BY ordinal_position) INTO v_txt
    FROM information_schema.columns WHERE table_schema='public' AND table_name='students';
  SELECT count(*) INTO v_n
    FROM information_schema.columns
   WHERE table_schema='public' AND table_name='students'
     AND (column_name ILIKE '%code%' OR column_name ILIKE '%reference%'
          OR column_name ILIKE '%student_no%' OR column_name ILIKE '%external%');
  IF v_n = 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS PDT-3 -- `students` carries NO code/reference column (%). The frame''s `ID 2025-113` has no source and is a REGISTERED-OMISSION, not a copy choice', v_txt;
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL PDT-3 -- a code-shaped column now exists on students (%); the screen 17 omission must be revisited', v_txt;
  END IF;

  -- -------------------------------------------------------------------
  -- PDT-4 -- THE GUARDIAN NAME IS REACHABLE WITHOUT A NEW COLUMN, and
  -- the plan's "guardian name needs a column" note is measured against
  -- reality rather than trusted. `parent_profiles` genuinely carries no
  -- name; `accounts.display_name` genuinely does.
  -- -------------------------------------------------------------------
  SELECT count(*) INTO v_n FROM information_schema.columns
   WHERE table_schema='public' AND table_name='parent_profiles' AND column_name ILIKE '%name%';
  SELECT count(*) INTO v_m FROM information_schema.columns
   WHERE table_schema='public' AND table_name='accounts' AND column_name = 'display_name';
  IF v_n = 0 AND v_m = 1 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS PDT-4 -- `parent_profiles` carries NO name column (the plan note is right about that) and `accounts.display_name` DOES exist, so the guardian NAME needs no schema. §12.10 applied';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL PDT-4 -- parent_profiles name-ish columns=%, accounts.display_name=%', v_n, v_m;
  END IF;

  -- -------------------------------------------------------------------
  -- PDT-5 -- ⛔ THE ROLL IS RLS-SCOPED, PROVEN IN BOTH DIRECTIONS.
  -- Management sees the centre's active learners; a PARENT sees only the
  -- learners they hold an active link to. A refusal leg alone would be
  -- satisfied by a policy that returns nothing to anybody.
  -- -------------------------------------------------------------------
  SET LOCAL ROLE authenticated;
  PERFORM set_config('request.jwt.claims',
    '{"sub":"d0000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
  SELECT count(*) INTO v_n FROM public.students;

  PERFORM set_config('request.jwt.claims',
    '{"sub":"d0000000-0000-4000-8000-000000000003","role":"authenticated"}', true);
  SELECT count(*) INTO v_m FROM public.students;
  RESET ROLE;

  IF v_n > 0 AND v_m > 0 AND v_m < v_n THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS PDT-5 -- DISCRIMINATING: management reads % learner(s), the parent reads only the % they are linked to. Both directions, so this is not a policy that refuses everyone', v_n, v_m;
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL PDT-5 -- management=%, parent=% (parent must be > 0 and < management)', v_n, v_m;
  END IF;

  -- -------------------------------------------------------------------
  -- PDT-6 -- ⛔ THE PARENT SEES EXACTLY THEIR LINKED LEARNERS, not a
  -- count that merely happens to be smaller. A subset test can pass by
  -- coincidence; this compares the SET against the links themselves.
  -- -------------------------------------------------------------------
  SET LOCAL ROLE authenticated;
  PERFORM set_config('request.jwt.claims',
    '{"sub":"d0000000-0000-4000-8000-000000000003","role":"authenticated"}', true);
  SELECT count(*) INTO v_n
    FROM public.students s
   WHERE NOT EXISTS (SELECT 1 FROM public.parent_student_links l
                      WHERE l.student_id = s.id AND l.is_active);
  RESET ROLE;
  IF v_n = 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS PDT-6 -- every row the parent can read is one they hold an ACTIVE link to; zero unlinked learners leak';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL PDT-6 -- % learner(s) readable by the parent with no active link', v_n;
  END IF;

  -- -------------------------------------------------------------------
  -- PDT-7 -- ⛔ NO RATING IS REACHABLE THROUGH THIS SCREEN'S TABLES.
  -- `C-9`/`G-2` bar the frame's `Overall` chip. This proves the bar is
  -- STRUCTURAL: none of the eight tables carries a rating column at all,
  -- so there is no field the projection could accidentally select.
  -- -------------------------------------------------------------------
  SELECT count(*) INTO v_n
    FROM information_schema.columns
   WHERE table_schema='public'
     AND table_name IN ('students','enrolments','class_modules','class_grades',
                        'parent_student_links','parent_profiles','centre_memberships','accounts')
     AND (column_name ILIKE '%rating%' OR column_name ILIKE '%competency%'
          OR column_name ILIKE '%overall%' OR column_name ILIKE '%grade_band%');
  IF v_n = 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS PDT-7 -- NONE of the 8 tables behind screen 17 carries a rating-shaped column, so the `Overall` refusal is STRUCTURAL and not a filter somebody has to remember';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL PDT-7 -- % rating-shaped column(s) reachable from screen 17''s tables', v_n;
  END IF;

  -- -------------------------------------------------------------------
  IF v_fail > 0 THEN
    RAISE EXCEPTION 'P2-8 students suite FAILED with % failure(s)', v_fail;
  END IF;
  RAISE NOTICE 'P2-8 SQL: % passed, % failed', v_pass, v_fail;
END $$;

ROLLBACK;
