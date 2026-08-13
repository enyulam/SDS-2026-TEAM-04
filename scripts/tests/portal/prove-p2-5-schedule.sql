-- =====================================================================
-- PORTAL PHASE P2-5 -- screen `25` Management Schedule.
-- =====================================================================
-- ⛔ THIS PHASE SHIPS NO MIGRATION, NO RPC, NO POLICY AND NO GRANT, and
--    that is precisely what needs proving. The screen is a DIRECT
--    RLS-SCOPED READ, and it is only allowed to be one because every table
--    it touches already carries a management policy AND a matching client
--    grant. ▶ If either ever stops being true, this surface silently reads
--    NOTHING and renders an empty academy. `P25-4` is the leg that fails
--    the day that changes -- the same job migration assertion `V-7` does
--    for screen `13`, which needed the opposite conclusion.
--
-- ⚠️ AND EVERY MEASUREMENT RUNS AS OWNER unless a leg is explicitly about
--    RLS, because a count taken under the caller's own role measures
--    VISIBILITY rather than EXISTENCE.
--
-- Proves, in order:
--   P25-1  NON-VACUITY FIRST. The centre exists, really has sessions
--          spanning MORE THAN ONE MONTH, and really has an active trainer
--          assignment. ⛔ Every leg below is trivially true of nothing --
--          and a one-month fixture could not exercise the month control at
--          all.
--   P25-2  ⛔ NO CALENDAR OR EVENT ENTITY EXISTS (`A-016`, `GC-13`). With a
--          PLANTED control table, because "none found" is equally true of a
--          query that matches nothing.
--   P25-3  ⛔ NO SESSION-TYPE COLUMN EXISTS ANYWHERE -- the `Showcase` bar
--          made structural. With a PLANTED control column.
--   P25-4  ⚠️ THE JUSTIFICATION CANNOT ROT SILENTLY. All six projection
--          tables carry a management SELECT policy AND an `authenticated`
--          SELECT grant. Control: `reports` carries NEITHER, so the
--          detector is shown to distinguish the two cases.
--   P25-5  ⚠️ THE PERMIT AND REFUSE LEGS, under real RLS. Management reads
--          the centre's sessions; an UNIDENTIFIED caller reads ZERO. Both
--          directions, because a refusal alone proves nothing about access.
--   P25-6  ⛔ AN ASSISTANT IS INEXPRESSIBLE, not merely deferred.
--          `class_session_assignments.trainer_role` IS `centre_membership_role`
--          and that enum holds EXACTLY `management`/`trainer`/`parent`.
--          This is the structural half of the `Assist.` omission (`A-014`,
--          `G-7`).
--   P25-7  ⛔ THIS PHASE MOVED NOTHING. Zero write policies and zero
--          non-SELECT client grants across the projection family, and the
--          audit registry is UNMOVED at 21 -- a read is not a governed
--          action (`A-029`).
--
-- ⚠️ TRANSACTION-SCOPED, ending in ROLLBACK.
-- =====================================================================

BEGIN;

CREATE FUNCTION pg_temp.as_management() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims',
  '{"sub":"d0000000-0000-4000-8000-000000000001","role":"authenticated"}', true); END $$;

CREATE FUNCTION pg_temp.as_nobody() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims', '', true); END $$;

DO $suite$
DECLARE
  v_centre   uuid;
  v_sessions integer;
  v_months   integer;
  v_assigned integer;
  v_n        integer;
  v_m        integer;
  v_hits     text;
  v_missing  text;
  v_vals     text;
BEGIN
  SELECT id INTO v_centre FROM public.centres WHERE code = 'ispeak';
  SELECT pg_catalog.count(*) INTO v_sessions
    FROM public.class_sessions WHERE centre_id = v_centre;
  SELECT pg_catalog.count(DISTINCT pg_catalog.to_char(session_date, 'YYYY-MM')) INTO v_months
    FROM public.class_sessions WHERE centre_id = v_centre;
  SELECT pg_catalog.count(*) INTO v_assigned
    FROM public.class_session_assignments WHERE centre_id = v_centre AND is_active;

  -- =================================================================
  -- P25-1  NON-VACUITY
  -- =================================================================
  -- ⚠️ MORE THAN ONE MONTH IS REQUIRED, not merely more than zero sessions.
  --    The month control offers the months that HAVE sessions; a fixture
  --    confined to one month would give it a single entry and the leg
  --    would report a working control that can go nowhere.
  IF v_centre IS NOT NULL AND v_sessions > 0 AND v_months > 1 AND v_assigned > 0
     AND pg_catalog.array_length(public.audit_action_registry(), 1) = 21 THEN
    RAISE NOTICE 'PASS P25-1  NON-VACUITY: % session(s) across % distinct month(s), % active assignment(s), registry 21 -- there is a real calendar for every leg below to measure', v_sessions, v_months, v_assigned;
  ELSE
    RAISE NOTICE 'FAIL P25-1  centre=% sessions=% months=% assigned=% registry=%', v_centre, v_sessions, v_months, v_assigned, pg_catalog.array_length(public.audit_action_registry(), 1);
  END IF;

  -- =================================================================
  -- P25-2  ⛔ NO CALENDAR OR EVENT ENTITY (`A-016`, `GC-13`)
  -- =================================================================
  -- ⚠️ `audit_events` / `audit_event_targets` are EXCLUDED BY NAME, not by a
  --    looser pattern. They are the Step 7H audit chain and have nothing to
  --    do with a calendar; excluding them with a wildcard would also excuse
  --    a future `audit_calendar_events`.
  SELECT coalesce(pg_catalog.string_agg(table_name, ', ' ORDER BY table_name), 'none') INTO v_hits
    FROM information_schema.tables
   WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
     AND (table_name ILIKE '%event%' OR table_name ILIKE '%calendar%' OR table_name ILIKE '%showcase%')
     AND table_name NOT IN ('audit_events', 'audit_event_targets');

  -- ⛔ THE CONTROL. A table the detector MUST see, created and dropped
  --    inside this transaction, so "none found" cannot also be true of a
  --    query that matches nothing.
  CREATE TABLE public.zz_control_calendar_events (id uuid);
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.tables
   WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
     AND (table_name ILIKE '%event%' OR table_name ILIKE '%calendar%' OR table_name ILIKE '%showcase%')
     AND table_name NOT IN ('audit_events', 'audit_event_targets');
  DROP TABLE public.zz_control_calendar_events;

  IF v_hits = 'none' AND v_n = 1 THEN
    RAISE NOTICE 'PASS P25-2  ⛔ ZERO calendar/event/showcase tables exist -- and the CONTROL proves the detector fires: a planted `zz_control_calendar_events` was seen (1 hit) and dropped';
  ELSE
    RAISE NOTICE 'FAIL P25-2  found [%] and the planted control returned % hit(s) (expected exactly 1)', v_hits, v_n;
  END IF;

  -- =================================================================
  -- P25-3  ⛔ NO SESSION-TYPE COLUMN -- the `Showcase` bar, structural
  -- =================================================================
  SELECT coalesce(pg_catalog.string_agg(table_name || '.' || column_name, ', ' ORDER BY table_name), 'none')
    INTO v_hits
    FROM information_schema.columns
   WHERE table_schema = 'public'
     AND (column_name ILIKE '%showcase%' OR column_name ILIKE '%event_type%'
          OR column_name ILIKE '%session_type%' OR column_name ILIKE '%session_kind%');

  ALTER TABLE public.class_sessions ADD COLUMN zz_control_session_type text;
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.columns
   WHERE table_schema = 'public'
     AND (column_name ILIKE '%showcase%' OR column_name ILIKE '%event_type%'
          OR column_name ILIKE '%session_type%' OR column_name ILIKE '%session_kind%');
  ALTER TABLE public.class_sessions DROP COLUMN zz_control_session_type;

  IF v_hits = 'none' AND v_n = 1 THEN
    RAISE NOTICE 'PASS P25-3  ⛔ ZERO session-type columns exist anywhere in the schema, so `Showcase` has nowhere to live -- CONTROL: a planted `zz_control_session_type` was seen (1 hit) and dropped';
  ELSE
    RAISE NOTICE 'FAIL P25-3  found [%] and the planted control returned % hit(s) (expected exactly 1)', v_hits, v_n;
  END IF;

  -- =================================================================
  -- P25-4  ⚠️ THE JUSTIFICATION CANNOT ROT SILENTLY
  -- =================================================================
  -- ⛔ THIS IS THE MOST IMPORTANT LEG IN THE SUITE. Screen `25` is a direct
  --    RLS-scoped read ONLY because both layers are present on all six
  --    tables. Lose either and the surface does not error -- it renders an
  --    empty calendar, which reads as an academy with nothing scheduled.
  --
  -- ⚠️ MEASURED BEHAVIOURALLY, AND THE FIRST DRAFT WAS NOT. It required each
  --    table to carry a policy whose NAME contained `management`, and it
  --    FAILED ON A CORRECT PRODUCT: `class_grades_select_active_member` is
  --    deliberately an ACTIVE-MEMBER policy, exactly like `terms`, because
  --    other screens render a grade to a non-management reader. ▶ A NAME IS
  --    NOT A PERMISSION. Reading the row as a management caller is, and it
  --    is also STRICTLY STRONGER: a policy named `..._management` that
  --    excluded management would have passed the name test.
  --    (Same defect class as the `SC-1` assertion written against an
  --    AUTHORED value rather than the COMPUTED one.)
  SET LOCAL ROLE authenticated;
  PERFORM pg_temp.as_management();
  SELECT coalesce(pg_catalog.string_agg(t.name, ', ' ORDER BY t.name), 'none') INTO v_missing
    FROM (VALUES ('class_sessions'), ('class_modules'), ('class_grades'),
                 ('class_session_assignments'), ('centre_memberships'), ('accounts')) AS t(name)
   WHERE NOT EXISTS (
           SELECT 1 FROM information_schema.role_table_grants g
            WHERE g.table_schema = 'public' AND g.table_name = t.name
              AND g.grantee = 'authenticated' AND g.privilege_type = 'SELECT');
  -- Each read separately, because `string_agg` over a dynamic count is not
  -- expressible here without EXECUTE and the six are a closed, ratified set.
  SELECT pg_catalog.count(*) INTO v_n FROM public.class_sessions;
  IF v_n = 0 THEN v_missing := v_missing || ' class_sessions(0 rows)'; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.class_modules;
  IF v_n = 0 THEN v_missing := v_missing || ' class_modules(0 rows)'; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.class_grades;
  IF v_n = 0 THEN v_missing := v_missing || ' class_grades(0 rows)'; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.class_session_assignments;
  IF v_n = 0 THEN v_missing := v_missing || ' class_session_assignments(0 rows)'; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.centre_memberships;
  IF v_n = 0 THEN v_missing := v_missing || ' centre_memberships(0 rows)'; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.accounts;
  IF v_n = 0 THEN v_missing := v_missing || ' accounts(0 rows)'; END IF;

  -- ⛔ THE CONTROL, and it is a REAL table rather than a planted one:
  --    `reports` carries zero policies and zero client grants, which is
  --    exactly why screen `13` needed two `SECURITY DEFINER` reads. The same
  --    management caller must read ZERO from it, or this leg is not
  --    distinguishing "readable" from "exists".
  --
  -- ⚠️ THE CONTROL RAISES RATHER THAN RETURNING ZERO, AND THAT IS A SHARPER
  --    RESULT THAN THE ONE FIRST WRITTEN FOR. `reports` carries no client
  --    GRANT at all, so the read is refused at the PRIVILEGE layer and never
  --    reaches RLS -- `permission denied for table reports`, which aborted
  --    this block on the first run and was correctly reported as 3 of 7 legs
  --    executed rather than as a pass. ▶ `CLAUDE.md` §6.1: privilege and
  --    policy are TWO SEPARATE LAYERS and a missing grant must never be
  --    misdiagnosed as an RLS failure. Both refusals count; they are
  --    distinguished in the message so a later reader knows which one held.
  BEGIN
    SELECT pg_catalog.count(*) INTO v_n FROM public.reports;
  EXCEPTION WHEN insufficient_privilege THEN
    v_n := -1;
  END;
  RESET ROLE;
  SELECT pg_catalog.count(*) INTO v_m FROM public.reports;

  IF v_missing = 'none' AND v_n <= 0 AND v_m > 0 THEN
    RAISE NOTICE 'PASS P25-4  ⚠️ a MANAGEMENT caller actually READS all six projection tables under RLS, and each carries the `authenticated` SELECT grant -- CONTROL: the same caller reaches NONE of the % `reports` row(s) that demonstrably exist (%), so this measures READABILITY and not merely EXISTENCE',
      v_m, CASE WHEN v_n = -1 THEN 'refused at the PRIVILEGE layer -- no client grant' ELSE 'zero rows under RLS' END;
  ELSE
    RAISE NOTICE 'FAIL P25-4  unreadable or ungranted: [%]; management reached % reports row(s) (expected 0 or a privilege refusal) out of % that exist (expected > 0)', v_missing, v_n, v_m;
  END IF;

  -- =================================================================
  -- P25-5  ⚠️ PERMIT **AND** REFUSE, under real RLS
  -- =================================================================
  SET LOCAL ROLE authenticated;
  PERFORM pg_temp.as_management();
  SELECT pg_catalog.count(*) INTO v_n FROM public.class_sessions;
  PERFORM pg_temp.as_nobody();
  SELECT pg_catalog.count(*) INTO v_m FROM public.class_sessions;
  RESET ROLE;

  -- ⚠️ THE PERMIT LEG IS WHAT MAKES THE REFUSAL MEAN ANYTHING. A suite that
  --    only proved zero rows for an anonymous caller would pass identically
  --    against a table nobody can read at all.
  IF v_n = v_sessions AND v_m = 0 THEN
    RAISE NOTICE 'PASS P25-5  ⚠️ MANAGEMENT reads all % session(s) under RLS and an UNIDENTIFIED caller reads ZERO -- both directions measured', v_n;
  ELSE
    RAISE NOTICE 'FAIL P25-5  management read % of % session(s); unidentified read %', v_n, v_sessions, v_m;
  END IF;

  -- =================================================================
  -- P25-6  ⛔ AN ASSISTANT IS INEXPRESSIBLE
  -- =================================================================
  SELECT pg_catalog.format_type(a.atttypid, a.atttypmod) INTO v_hits
    FROM pg_attribute a
   WHERE a.attrelid = 'public.class_session_assignments'::regclass AND a.attname = 'trainer_role';
  SELECT pg_catalog.string_agg(e.enumlabel, '/' ORDER BY e.enumsortorder) INTO v_vals
    FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
   WHERE t.typname = 'centre_membership_role';

  IF v_hits = 'centre_membership_role' AND v_vals = 'management/trainer/parent' THEN
    RAISE NOTICE 'PASS P25-6  ⛔ `trainer_role` IS `centre_membership_role` and that enum holds EXACTLY [%] -- an assistant is INEXPRESSIBLE, not merely deferred (`A-014`, `G-7`)', v_vals;
  ELSE
    RAISE NOTICE 'FAIL P25-6  trainer_role type=[%] enum=[%]', v_hits, v_vals;
  END IF;

  -- =================================================================
  -- P25-7  ⛔ THIS PHASE MOVED NOTHING
  -- =================================================================
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_policies
   WHERE schemaname = 'public'
     AND tablename IN ('class_sessions', 'class_modules', 'class_grades',
                       'class_session_assignments', 'centre_memberships', 'accounts')
     AND cmd <> 'SELECT';
  SELECT pg_catalog.count(*) INTO v_m
    FROM information_schema.role_table_grants
   WHERE table_schema = 'public'
     AND table_name IN ('class_sessions', 'class_modules', 'class_grades',
                        'class_session_assignments', 'centre_memberships', 'accounts')
     AND grantee IN ('authenticated', 'anon', 'PUBLIC')
     AND privilege_type <> 'SELECT';

  IF v_n = 0 AND v_m = 0 AND pg_catalog.array_length(public.audit_action_registry(), 1) = 21 THEN
    RAISE NOTICE 'PASS P25-7  ⛔ ZERO write policies and ZERO non-SELECT client grants across the projection family; registry UNMOVED at 21 -- a read is not a governed action (`A-029`)';
  ELSE
    RAISE NOTICE 'FAIL P25-7  write policies=% non-SELECT client grants=% registry=%', v_n, v_m, pg_catalog.array_length(public.audit_action_registry(), 1);
  END IF;
END
$suite$;

ROLLBACK;
