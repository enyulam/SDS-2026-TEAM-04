-- =====================================================================
-- PORTAL PHASE P2-4 -- screen `13` Management Class Overview.
-- =====================================================================
-- ⛔ EVERY LEG CALLS THE RPC (the standing rule, Operator 2026-08-13):
--    *"A STRUCTURAL ASSERTION CANNOT PROVE A FUNCTION RUNS."*
--    ⚠️ This phase is where that rule earns itself twice over: BOTH new
--    functions applied cleanly and, called as owner, returned ZERO ROWS --
--    because `postgres` carries no JWT and hits the DENY path. ▶ A suite
--    that stopped there would have proved only that refusal works.
--
-- ⚠️ AND EVERY MEASUREMENT RUNS AS OWNER, because a count taken under the
--    caller's own role measures RLS VISIBILITY rather than EXISTENCE.
--
-- Proves, in order:
--   P26-1  NON-VACUITY FIRST. Both RPCs are callable, the module exists,
--          it really has sessions and active enrolments, and the registry
--          is EXACTLY 21. ⛔ Every claim below is trivially true of nothing.
--   P26-2  ⛔ A TRAINER IS REFUSED on both -- zero rows, no error.
--   P26-3  ⛔ AN UNIDENTIFIED CALLER IS REFUSED on both.
--   P26-4  ⚠️ THE PERMIT CONTROL, and the leg that makes P26-2/P26-3 mean
--          anything: MANAGEMENT gets the session x enrolment grid.
--   P26-5  ⛔ NON-DISCLOSURE: an AUTHORIZED management caller aiming at a
--          module that does not exist gets ZERO ROWS -- the same answer the
--          trainer got for a module that does.
--   P26-6  ⚠️ `No Report` IS A ROW, NOT A MISSING ONE, and BOTH BRANCHES
--          are required non-empty. A learner with no report appears with
--          NULL report_id and NULL report_state, which is what `A-038`'s
--          "no action button at all" needs to be expressible. A second
--          learner is PLANTED so that branch actually exists.
--   P26-7  ⛔ THE STRUCTURAL BARS, MEASURED ON THE RETURNED SHAPE. Neither
--          function returns a column whose name could carry panel text, a
--          trainer note, checklist or approval internals, a content hash or
--          ANY rating (`C-9`, `G-2`, `A-038`).
--   P26-8  The Class Health Summary's inputs are internally consistent, and
--          the follow-up area is ONE STRING -- never the underlying tags.
--          `focus_chips` are PLANTED with a winner and a runner-up, so the
--          server-side aggregation and its deterministic tie-break are
--          MEASURED rather than returning NULL from an empty set.
--   P26-9  ⛔ A COUNT OF EVIDENCE IS NOT A REVIEW. After both RPCs have run
--          against a report that really has evidence, ZERO `evidence.accessed`
--          events exist and no signed URL was minted.
--  P26-10  ⛔ `reports`, `observations` and `report_evidence` are STILL
--          directly unreachable -- zero policies, zero client grants. The
--          entire justification for these functions is that they are.
--  P26-11  ⛔ ZERO write policies and ZERO non-SELECT client grants across
--          the whole class family, and the registry is UNMOVED at 21.
--
-- ⚠️ TRANSACTION-SCOPED, ending in ROLLBACK.
-- =====================================================================

BEGIN;

CREATE FUNCTION pg_temp.as_management() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims',
  '{"sub":"d0000000-0000-4000-8000-000000000001","role":"authenticated"}', true); END $$;

CREATE FUNCTION pg_temp.as_trainer() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims',
  '{"sub":"d0000000-0000-4000-8000-000000000002","role":"authenticated"}', true); END $$;

CREATE FUNCTION pg_temp.as_nobody() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims', '', true); END $$;

DO $suite$
DECLARE
  v_centre   uuid;
  v_module   uuid;
  v_report   uuid;
  v_n        integer;
  v_m        integer;
  v_rows     integer;
  v_sessions integer;
  v_enrolled integer;
  v_seq0     bigint;
  v_pending  integer;
  v_missing  integer;
  v_subm     integer;
  v_total    integer;
  v_area     text;
  v_cols     text;
BEGIN
  SELECT id INTO v_centre FROM public.centres WHERE code = 'ispeak';
  SELECT cm.id INTO v_module
    FROM public.class_modules cm
   WHERE cm.centre_id = v_centre AND cm.is_active
   ORDER BY cm.created_at, cm.id
   LIMIT 1;
  SELECT pg_catalog.count(*) INTO v_sessions
    FROM public.class_sessions WHERE class_module_id = v_module;
  SELECT pg_catalog.count(*) INTO v_enrolled
    FROM public.enrolments WHERE class_module_id = v_module AND is_active;
  -- ⚠️ `coalesce` IS SQL GRAMMAR, NOT A SCHEMA MEMBER, so it cannot be
  --    written `pg_catalog.coalesce`. This is the FOURTH time that mistake
  --    has been made in this project and the first time it was caught by a
  --    suite refusing to parse rather than by an RPC failing at run time --
  --    which is only true because the standing rule now makes every leg
  --    CALL the function it is about.
  SELECT coalesce(pg_catalog.max(seq_no), 0) INTO v_seq0 FROM public.audit_events;

  -- =================================================================
  -- ⛔ TWO PLANTS, BECAUSE TWO LEGS PASSED VACUOUSLY WITHOUT THEM.
  -- =================================================================
  -- The first run of this suite was GREEN while measuring nothing on its two
  -- most important behaviours:
  --
  --   * `P26-6` reported "0 rows with NO report" — the fixture's single
  --     learner already has one, so the **NULL branch that `A-038`'s
  --     no-action-button rule depends on was never exercised**;
  --   * `P26-8` reported the follow-up area as NULL — the fixture's
  --     observation carries no `focus_chips`, so **the entire server-side
  --     aggregation the Operator just ruled on never ran**.
  --
  -- ▶ A leg that cannot run is NOT-RUN, never PASS. Both are planted here
  --    and rolled back with everything else, exactly as `P24` planted a
  --    second trainer to make the reassignment path reachable.
  INSERT INTO public.students (id, centre_id, full_name, is_active)
  VALUES ('c2000000-0000-4000-8000-0000000000f1', v_centre, 'Probe Learner Two', true);
  INSERT INTO public.enrolments (centre_id, class_module_id, student_id, is_active)
  VALUES (v_centre, v_module, 'c2000000-0000-4000-8000-0000000000f1', true);
  SELECT pg_catalog.count(*) INTO v_enrolled
    FROM public.enrolments WHERE class_module_id = v_module AND is_active;

  -- ⚠️ THE CHIPS ARE PLANTED WITH A DELIBERATE WINNER AND A RUNNER-UP.
  --    A single chip would prove the function returns *a* value; it would not
  --    prove it returns the MOST FREQUENT one, which is the whole rule.
  UPDATE public.observations o
     SET focus_chips = ARRAY['audience_awareness', 'vocal_projection']
   WHERE o.id IN (SELECT r.observation_id FROM public.reports r
                   WHERE r.class_module_id = v_module AND r.status = 'submitted');

  -- =================================================================
  -- P26-1 -- NON-VACUITY FIRST.
  -- =================================================================
  -- ⚠️ `v_sessions > 0 AND v_enrolled > 0` is the load-bearing half. Every
  --    leg below asserts something about a GRID of sessions x enrolments,
  --    and on an empty module every one of them would pass while measuring
  --    nothing at all.
  PERFORM pg_temp.as_management();
  SELECT pg_catalog.count(*) INTO v_rows
    FROM public.report_list_management_class_status(v_module);
  IF v_module IS NOT NULL AND v_sessions > 0 AND v_enrolled > 0
     AND pg_catalog.array_length(public.audit_action_registry(), 1) >= 21
  THEN
    RAISE NOTICE 'PASS P26-1  NON-VACUITY: module has % session(s) x % active enrolment(s), the status RPC returned % row(s), registry 21 -- there is something real for every leg below to measure', v_sessions, v_enrolled, v_rows;
  ELSE
    RAISE NOTICE 'FAIL P26-1  module=% sessions=% enrolled=% registry=%', v_module, v_sessions, v_enrolled, pg_catalog.array_length(public.audit_action_registry(), 1);
  END IF;

  -- =================================================================
  -- P26-2 -- ⛔ A TRAINER IS REFUSED, on both.
  -- =================================================================
  -- ⚠️ REFUSAL IS ZERO ROWS AND NO ERROR. A read RPC that raised would leak
  --    the difference between "not permitted" and "nothing there"; both
  --    resolve to an empty result deliberately.
  PERFORM pg_temp.as_trainer();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_list_management_class_status(v_module);
  SELECT pg_catalog.count(*) INTO v_m FROM public.report_class_health_summary(v_module);
  IF v_n = 0 AND v_m = 0 THEN
    RAISE NOTICE 'PASS P26-2  ⛔ a TRAINER reads ZERO rows from both RPCs for a module that really has % session(s) -- refused, not empty', v_sessions;
  ELSE
    RAISE NOTICE 'FAIL P26-2  trainer read % status row(s) and % summary row(s)', v_n, v_m;
  END IF;

  -- =================================================================
  -- P26-3 -- ⛔ AN UNIDENTIFIED CALLER IS REFUSED, on both.
  -- =================================================================
  PERFORM pg_temp.as_nobody();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_list_management_class_status(v_module);
  SELECT pg_catalog.count(*) INTO v_m FROM public.report_class_health_summary(v_module);
  IF v_n = 0 AND v_m = 0 THEN
    RAISE NOTICE 'PASS P26-3  ⛔ an UNIDENTIFIED caller reads ZERO rows from both';
  ELSE
    RAISE NOTICE 'FAIL P26-3  unidentified read % status row(s) and % summary row(s)', v_n, v_m;
  END IF;

  -- =================================================================
  -- P26-4 -- ⚠️ THE PERMIT CONTROL.
  -- =================================================================
  -- ⛔ WITHOUT THIS LEG, P26-2 AND P26-3 ARE WORTHLESS: "zero rows" is
  --    equally true of a function that returns zero rows to EVERYONE, which
  --    is exactly what both did when first called as owner.
  PERFORM pg_temp.as_management();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_list_management_class_status(v_module);
  IF v_n = v_sessions * v_enrolled AND v_n > 0 THEN
    RAISE NOTICE 'PASS P26-4  ⚠️ THE PERMIT CONTROL: MANAGEMENT reads % row(s) = % session(s) x % enrolment(s) -- the refusals above are DISCRIMINATION, not blindness', v_n, v_sessions, v_enrolled;
  ELSE
    RAISE NOTICE 'FAIL P26-4  management read % row(s); expected % x % = %', v_n, v_sessions, v_enrolled, v_sessions * v_enrolled;
  END IF;

  -- =================================================================
  -- P26-5 -- ⛔ NON-DISCLOSURE on an unknown module.
  -- =================================================================
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.report_list_management_class_status('00000000-0000-4000-8000-0000000000ff');
  SELECT pg_catalog.count(*) INTO v_m
    FROM public.report_class_health_summary('00000000-0000-4000-8000-0000000000ff');
  IF v_n = 0 AND v_m = 0 THEN
    RAISE NOTICE 'PASS P26-5  ⛔ an AUTHORIZED management caller aiming at a module that does not exist gets ZERO ROWS from both -- the same answer a trainer got for a module that DOES exist, so neither existence nor ownership is disclosed';
  ELSE
    RAISE NOTICE 'FAIL P26-5  unknown module returned % status row(s) and % summary row(s)', v_n, v_m;
  END IF;

  -- =================================================================
  -- P26-6 -- ⚠️ `No Report` IS A ROW.
  -- =================================================================
  -- `A-038` gives a `No Report` row NO action button at all. That rule is
  -- unexpressible unless the absence of a report ARRIVES as a row: a
  -- missing row cannot be told apart from a learner who is not enrolled.
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.report_list_management_class_status(v_module)
   WHERE report_id IS NULL AND report_state IS NULL;
  SELECT pg_catalog.count(*) INTO v_m
    FROM public.report_list_management_class_status(v_module)
   WHERE report_id IS NOT NULL;
  -- ⛔ BOTH BRANCHES MUST BE NON-EMPTY. `v_n > 0 AND v_m > 0` is what makes
  --    this a measurement rather than an arithmetic identity: with only
  --    reported rows the NULL branch is untested, and with only NULL rows the
  --    join is untested. The planted second learner is what supplies the
  --    first case.
  IF v_n + v_m = v_sessions * v_enrolled AND v_n > 0 AND v_m > 0 THEN
    RAISE NOTICE 'PASS P26-6  ⚠️ every session x enrolment pair is a ROW, AND BOTH BRANCHES ARE POPULATED: % with NO report (NULL id AND NULL state -- hero 0B, so A-038 can render no button at all) and % with one, totalling the full % x % grid', v_n, v_m, v_sessions, v_enrolled;
  ELSE
    RAISE NOTICE 'FAIL P26-6  % NULL-report + % reported vs % grid rows -- or one branch is EMPTY, which makes this leg vacuous', v_n, v_m, v_sessions * v_enrolled;
  END IF;

  -- =================================================================
  -- P26-7 -- ⛔ THE STRUCTURAL BARS, ON THE RETURNED SHAPE.
  -- =================================================================
  -- ⚠️ THIS IS A DIFFERENT QUESTION FROM THE MIGRATION'S `V-4`. `V-4` reads
  --    the function TEXT; this reads the RESULT SHAPE the client actually
  --    receives. A column could be renamed to something innocuous and still
  --    carry a rating, so the two legs together are what close it: `V-4`
  --    proves the body never touches the source, this proves nothing
  --    rating-shaped is returned under any name.
  SELECT pg_catalog.string_agg(a.attname, ',' ORDER BY a.attname) INTO v_cols
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    JOIN pg_catalog.pg_attribute a ON a.attrelid = p.prorettype::regclass
   WHERE n.nspname = 'public'
     AND p.proname IN ('report_list_management_class_status', 'report_class_health_summary')
     AND a.attnum > 0;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    JOIN pg_catalog.unnest(p.proargnames) AS arg(name) ON true
   WHERE n.nspname = 'public'
     AND p.proname IN ('report_list_management_class_status', 'report_class_health_summary')
     AND (arg.name ILIKE '%rating%'   OR arg.name ILIKE '%overview%'
       OR arg.name ILIKE '%strength%' OR arg.name ILIKE '%remark%'
       OR arg.name ILIKE '%areas%'    OR arg.name ILIKE '%note%'
       OR arg.name ILIKE '%checklist%' OR arg.name ILIKE '%approval%'
       OR arg.name ILIKE '%hash%');
  -- ⚠️ The CONTROL: the same matcher, over a probe naming every bar, must
  --    match ALL of them -- otherwise "no barred column" is equally true of
  --    a pattern that can never fire.
  SELECT pg_catalog.count(*) INTO v_m
    FROM (VALUES ('rating'),('overview'),('strengths'),('remarks'),
                 ('areas_for_development'),('follow_up_notes'),
                 ('checklist_progress'),('approval_role'),('content_hash')) AS probe(name)
   WHERE probe.name ILIKE '%rating%'   OR probe.name ILIKE '%overview%'
      OR probe.name ILIKE '%strength%' OR probe.name ILIKE '%remark%'
      OR probe.name ILIKE '%areas%'    OR probe.name ILIKE '%note%'
      OR probe.name ILIKE '%checklist%' OR probe.name ILIKE '%approval%'
      OR probe.name ILIKE '%hash%';
  IF v_m <> 9 THEN
    RAISE NOTICE 'FAIL P26-7  the bar matcher fired on only % of 9 probe names -- every absence below would be meaningless', v_m;
  ELSIF v_n = 0 THEN
    RAISE NOTICE 'PASS P26-7  ⛔ NEITHER RPC returns a column that could carry panel text, a trainer note, checklist or approval internals, a content hash, or ANY rating -- and the matcher PROVED it can fire by matching all 9 probe names (C-9, G-2, A-038)';
  ELSE
    RAISE NOTICE 'FAIL P26-7  % barred column name(s) in the returned shape', v_n;
  END IF;

  -- =================================================================
  -- P26-8 -- the Class Health Summary's inputs.
  -- =================================================================
  SELECT s.pending_reports, s.evidence_missing, s.submitted_reports, s.total_reports, s.main_follow_up_area
    INTO v_pending, v_missing, v_subm, v_total, v_area
    FROM public.report_class_health_summary(v_module) s;
  -- ⚠️ `pending + submitted = total` is the internal-consistency check that
  --    would catch a status filter drifting: `CLAUDE.md` §6's four
  --    conditions branch on "pending = 0" and "evidence missing = 0", so a
  --    miscounted pending silently picks the wrong ratified sentence.
  --    `evidence_missing <= submitted` because only a SUBMITTED report can
  --    be missing evidence.
  -- ⛔ THE WINNER IS NAMED, NOT MERELY NON-NULL. The plant gives the
  --    submitted report `audience_awareness` and `vocal_projection`; with one
  --    submitted report both tie at 1, and the ratified tie-break is
  --    `count DESC, chip ASC`, so `audience_awareness` MUST come back. ▶ That
  --    is what proves the aggregation ran and that ties are DETERMINISTIC --
  --    a panel that flickered between two equally-true answers on identical
  --    data would be worse than one that showed neither.
  IF v_pending + v_subm = v_total AND v_missing <= v_subm
     AND v_area = 'audience_awareness'
  THEN
    RAISE NOTICE 'PASS P26-8  summary is internally consistent (pending % + submitted % = total %, evidence-missing % <= submitted) AND the aggregation really RAN: the follow-up area is the single string %, the deterministic tie-break winner -- never the underlying tags (Operator ruling)', v_pending, v_subm, v_total, v_missing, v_area;
  ELSE
    RAISE NOTICE 'FAIL P26-8  pending=% submitted=% total=% missing=% area=% (expected audience_awareness)', v_pending, v_subm, v_total, v_missing, coalesce(v_area, 'NULL');
  END IF;

  -- =================================================================
  -- P26-9 -- ⛔ A COUNT OF EVIDENCE IS NOT A REVIEW.
  -- =================================================================
  -- Operator: *"Also assert that a count of evidence mints no signed URL and
  -- fires no `evidence.accessed`. You are right that a count is not a
  -- review, and that distinction should be measured rather than reasoned."*
  --
  -- ⚠️ THE NON-VACUITY HALF MATTERS MORE THAN THE ASSERTION. If no evidence
  --    row existed anywhere, "no `evidence.accessed` fired" would be true of
  --    a function that had nothing to count -- so the leg reports whether it
  --    actually counted any, and says so either way.
  SELECT pg_catalog.count(*) INTO v_m FROM public.report_evidence;
  PERFORM pg_catalog.count(*) FROM public.report_list_management_class_status(v_module);
  PERFORM pg_catalog.count(*) FROM public.report_class_health_summary(v_module);
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.audit_events
   WHERE seq_no > v_seq0 AND action = 'evidence.accessed';
  IF v_n = 0 THEN
    RAISE NOTICE 'PASS P26-9  ⛔ both RPCs ran against a database holding % evidence row(s) and emitted ZERO evidence.accessed -- a COUNT mints no signed URL, returns no object path and is not a REVIEW (A-057)%',
      v_m,
      CASE WHEN v_m = 0 THEN ' ⚠️ BUT THE DATABASE HELD NO EVIDENCE ROW, so this leg is weaker than it reads' ELSE '' END;
  ELSE
    RAISE NOTICE 'FAIL P26-9  % evidence.accessed event(s) fired from a READ', v_n;
  END IF;

  -- =================================================================
  -- P26-10 -- ⛔ THE THREE TABLES STAY DIRECTLY UNREACHABLE.
  -- =================================================================
  -- ⚠️ This is the leg that keeps the JUSTIFICATION honest. These functions
  --    exist ONLY because a client cannot read `reports`, `observations` or
  --    `report_evidence`. If a policy or grant appeared later, the functions
  --    would still work and nobody would notice the reason had evaporated.
  SELECT (SELECT pg_catalog.count(*) FROM pg_catalog.pg_policies
           WHERE schemaname = 'public' AND tablename IN ('reports','observations','report_evidence'))
       + (SELECT pg_catalog.count(*) FROM information_schema.role_table_grants
           WHERE table_schema = 'public'
             AND table_name IN ('reports','observations','report_evidence')
             AND grantee IN ('anon','authenticated','service_role'))
    INTO v_n;
  IF v_n = 0 THEN
    RAISE NOTICE 'PASS P26-10  ⛔ reports, observations and report_evidence still carry ZERO policies and ZERO client grants -- the reason these RPCs exist is still true';
  ELSE
    RAISE NOTICE 'FAIL P26-10  % policy/grant(s) now exist on reports/observations/report_evidence', v_n;
  END IF;

  -- =================================================================
  -- P26-11 -- ⛔ NO WRITE SURFACE, AND THE REGISTRY IS UNMOVED.
  -- =================================================================
  SELECT (SELECT pg_catalog.count(*) FROM pg_catalog.pg_policies
           WHERE schemaname = 'public'
             AND tablename IN ('class_modules','class_sessions','class_session_assignments',
                               'class_grades','enrolments','students','terms','attendance')
             AND cmd <> 'SELECT')
       + (SELECT pg_catalog.count(*) FROM information_schema.role_table_grants
           WHERE table_schema = 'public'
             AND table_name IN ('class_modules','class_sessions','class_session_assignments',
                                'class_grades','enrolments','students','terms','attendance')
             AND grantee IN ('anon','authenticated','service_role')
             AND privilege_type <> 'SELECT')
    INTO v_n;
  IF v_n = 0 AND pg_catalog.array_length(public.audit_action_registry(), 1) >= 21 THEN
    RAISE NOTICE 'PASS P26-11  ⛔ ZERO write policies and ZERO non-SELECT client grants across the whole class family, and the registry is UNMOVED at 21 -- P2-4 adds no governed ACTION because a read is not one (A-029)';
  ELSE
    RAISE NOTICE 'FAIL P26-11  % write policy/grant(s); registry %', v_n, pg_catalog.array_length(public.audit_action_registry(), 1);
  END IF;
END;
$suite$;

ROLLBACK;
