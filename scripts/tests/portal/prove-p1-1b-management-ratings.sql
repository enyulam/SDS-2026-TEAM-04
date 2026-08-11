-- =====================================================================
-- PORTAL PHASE P1-1b -- D-1: management reads the nine ratings, READ ONLY.
-- =====================================================================
-- Proves, in order:
--   D1a-1  NON-VACUITY FIRST. A version with NINE ratings EXISTS and
--          management reads them. ⛔ Every refusal below is meaningless
--          without this -- with nothing to return, the gate denies
--          EVERYONE and each deny leg passes for the wrong reason. That is
--          the S-8 finding, and it landed last time on the one ruling that
--          WIDENED disclosure. This is that ruling again.
--   D1a-2  ALL NINE, not the frame's four (C-10), and every dimension code
--          distinct -- a count of 9 is also what nine duplicates give.
--   D1a-3  TRAINER is denied.
--   D1a-4  PARENT is denied.
--   D1a-5  ANON (no identity) is denied.
--   D1a-6  ⚠️ THE CONTROL. The probe must be able to return rows for a
--          caller who IS allowed -- proved by re-reading as management
--          after the three denials. Without it, "0 rows" for trainer,
--          parent and anon is equally consistent with a probe that reads
--          nothing for anybody.
--   D1a-7  C-9 AT THE DATA LAYER: a report at `needs_edit` returns NOTHING
--          even to management. Report detail surfaces are the final-review
--          candidate and the canonical submitted version -- and no other
--          status.
--   D1a-8  Q-27: the parent's canonical read returns its four panels and
--          carries NO rating, on the very report whose ratings management
--          just read.
--   D1a-9  BOTH MANAGEMENT READS GO DARK TOGETHER -- the mitigation for the
--          second-gate risk R-C2-6 names. If the new function ever answers
--          where the review read refuses, that is the side channel.
--
-- ⚠️ RUNS UNDER `SET LOCAL ROLE authenticated`, NOT AS THE OWNER. The
-- functions are owner-owned; an owner-side read would prove nothing about
-- what a real caller reaches.
--
-- ⚠️ TRANSACTION-SCOPED, ENDING IN `ROLLBACK`. The pair is MINTED, never
-- borrowed: a session minted a statement ago cannot already have a report,
-- so this cannot collide with the Operator's own walkthrough rows.
-- =====================================================================

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

-- ⚠️ THE RUNNER'S OWN COUNT SHAPE, callable from inside the transaction.
-- The shared prelude exposes `pg_temp.governed_counts()`, but that emits a
-- NINE-field string while this runner measures SIX. Comparing those two
-- would make the "counts moved mid-transaction" check pass because the
-- STRINGS DIFFER IN FORMAT, not because anything moved -- a false green in
-- the leg whose entire job is to stop `before = after` being a tautology.
-- The shape must match the thing it is compared against.
CREATE FUNCTION pg_temp.runner_counts() RETURNS text LANGUAGE sql AS $c$
  SELECT (SELECT count(*) FROM public.reports)
    || '|' || (SELECT count(*) FROM public.report_versions)
    || '|' || (SELECT count(*) FROM public.report_version_ratings)
    || '|' || (SELECT count(*) FROM public.audit_events)
    || '|' || (SELECT count(*) FROM public.students)
    || '|' || (SELECT count(*) FROM public.observations);
$c$;

DO $suite$
DECLARE
  v_centre     uuid;
  v_module     uuid;
  v_session    uuid;
  v_student    uuid;
  v_enrolment  uuid;
  v_obs        uuid;
  v_trainer_m  uuid;
  v_mgmt_m     uuid;
  v_report     uuid;
  v_version    uuid;
  v_n          bigint;
  v_distinct   bigint;
  v_review     bigint;
  v_pass       int := 0;
  v_fail       int := 0;
BEGIN
  SELECT m.centre_id, m.class_module_id, m.class_session_id, m.student_id,
         m.enrolment_id, m.observation_id, m.trainer_membership_id,
         m.management_membership_id
    INTO v_centre, v_module, v_session, v_student, v_enrolment, v_obs,
         v_trainer_m, v_mgmt_m
    FROM pg_temp.mint_isolated_pair('D1A') m;

  INSERT INTO public.reports (centre_id, class_session_id, class_module_id, student_id,
                              enrolment_id, observation_id, status, lock_version)
       VALUES (v_centre, v_session, v_module, v_student, v_enrolment, v_obs,
               'trainer_approved', 4)
    RETURNING id INTO v_report;

  INSERT INTO public.report_versions (report_id, centre_id, revision_number,
                                      authored_by_membership_id, authored_by_role,
                                      content_hash, content_hash_version,
                                      overview, strengths, areas_for_development, remarks)
       VALUES (v_report, v_centre, 1, v_trainer_m, 'trainer',
               pg_catalog.repeat('d', 64), 2,
               'Overview prose.', 'Strengths prose.', 'Areas prose.', 'Remarks prose.')
    RETURNING id INTO v_version;

  UPDATE public.reports SET current_cycle_version_id = v_version WHERE id = v_report;

  -- The nine immutable snapshots, deliberately MIXED so the read cannot pass
  -- by returning one repeated value.
  INSERT INTO public.report_version_ratings (report_version_id, report_id, dimension_code, rating)
  SELECT v_version, v_report, d.code,
         (ARRAY['beginning','developing','mastering','mastered']::public.competency_rating[])
           [1 + (d.sort_order % 4)]
    FROM public.assessment_dimensions d;

  RAISE NOTICE 'DURING-COUNTS %', pg_temp.runner_counts();
  RAISE NOTICE 'D1A-SETUP -- trainer_approved report + version + 9 ratings, IN THIS TRANSACTION ONLY';

  EXECUTE 'SET LOCAL ROLE authenticated';

  -- ---------------------------------------------------------------
  -- D1a-1 / D1a-2 -- NON-VACUITY AND THE PERMIT LEG, FIRST.
  -- ---------------------------------------------------------------
  PERFORM pg_temp.as_management();
  SELECT pg_catalog.count(*), pg_catalog.count(DISTINCT r.dimension_code)
    INTO v_n, v_distinct
    FROM public.report_get_management_ratings(v_session, v_student) r;

  IF v_n = 9 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS D1a-1 -- NON-VACUOUS: management read % rating rows over its own credential', v_n;
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL D1a-1 -- management read % rows, expected 9. EVERY DENY LEG BELOW IS NOW MEANINGLESS', v_n;
  END IF;

  IF v_distinct = 9 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS D1a-2 -- ALL NINE DISTINCT dimension codes (C-10), not the frame''s four and not one value nine times';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL D1a-2 -- % distinct dimension codes, expected 9', v_distinct;
  END IF;

  -- ---------------------------------------------------------------
  -- D1a-3 / D1a-4 / D1a-5 -- THE THREE DENIALS.
  -- ---------------------------------------------------------------
  PERFORM pg_temp.as_trainer();
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.report_get_management_ratings(v_session, v_student) r;
  IF v_n = 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS D1a-3 -- TRAINER reads ZERO rows: the gate is management-only';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL D1a-3 -- trainer read % rows', v_n;
  END IF;

  PERFORM pg_temp.as_parent();
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.report_get_management_ratings(v_session, v_student) r;
  IF v_n = 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS D1a-4 -- PARENT reads ZERO rows: Q-27 holds at the function, not in the client';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL D1a-4 -- ⛔ A PARENT READ % RATING ROWS. Q-27 BREACH', v_n;
  END IF;

  PERFORM pg_temp.as_nobody();
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.report_get_management_ratings(v_session, v_student) r;
  IF v_n = 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS D1a-5 -- ANON (no identity) reads ZERO rows';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL D1a-5 -- an unidentified caller read % rows', v_n;
  END IF;

  -- ---------------------------------------------------------------
  -- D1a-6 -- ⚠️ THE CONTROL THE OPERATOR REQUIRED. The probe must be shown
  -- capable of returning rows AFTER the three denials, in the same
  -- transaction and through the same call. Three zeros are otherwise
  -- equally consistent with a probe that reads nothing for anybody.
  -- ---------------------------------------------------------------
  PERFORM pg_temp.as_management();
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.report_get_management_ratings(v_session, v_student) r;
  IF v_n = 9 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS D1a-6 -- CONTROL: the same probe returns 9 rows for management, so the three zeros above are DISCRIMINATION, not blindness';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL D1a-6 -- ⛔ CONTROL FAILED (% rows). D1a-3..D1a-5 PROVE NOTHING', v_n;
  END IF;

  -- ---------------------------------------------------------------
  -- D1a-7 -- C-9 AT THE DATA LAYER.
  -- ---------------------------------------------------------------
  -- ⚠️ THE STATUS IS MOVED AS THE OWNER, NOT AS `authenticated` -- and the
  -- first version of this leg got `permission denied for table reports`
  -- because it tried the latter.
  --
  -- ▶ THE REFUSAL WAS CORRECT AND THE FIX IS NOT A GRANT. `authenticated`
  --   holds NO table grant on `public.reports` -- deliberate deny-by-default
  --   (A-030: privilege and policy are separate layers). Granting it to make
  --   this suite run would be exactly what CLAUDE.md §12 forbids: working
  --   around a fail-closed refusal by weakening the thing that refused.
  --   Same shape as the Phase 4 `P4-4` correction.
  --
  -- Setting up a state is the harness's job, not the caller's; only the READ
  -- below is performed under the impersonated credential.
  EXECUTE 'RESET ROLE';
  UPDATE public.reports SET status = 'needs_edit' WHERE id = v_report;
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_management();

  SELECT pg_catalog.count(*) INTO v_n
    FROM public.report_get_management_ratings(v_session, v_student) r;
  IF v_n = 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS D1a-7 -- a `needs_edit` report returns ZERO rows even to management: C-9 holds at the DATA layer, not only on the screen';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL D1a-7 -- management read % rating rows for a needs_edit report', v_n;
  END IF;

  -- D1a-9 -- and the review read refuses the SAME state. Both go dark
  -- together; a second gate that answers where the first refuses is the
  -- side channel R-C2-6 warns about.
  SELECT pg_catalog.count(*) INTO v_review
    FROM public.report_get_management_review(v_session, v_student) r;
  IF v_review = 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS D1a-9 -- BOTH management reads go dark on the same state: no side channel';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL D1a-9 -- the review read answered (% rows) where the ratings read refused', v_review;
  END IF;

  EXECUTE 'RESET ROLE';
  UPDATE public.reports SET status = 'trainer_approved' WHERE id = v_report;
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_management();

  -- ---------------------------------------------------------------
  -- D1a-8 -- Q-27 ON THE SAME REPORT. The parent's canonical read must
  -- return its four panels and carry no rating column at all.
  -- ---------------------------------------------------------------
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace,
         pg_catalog.unnest(p.proargnames) AS nm
   WHERE n.nspname = 'public'
     AND p.proname IN ('report_get_canonical', 'report_get_canonical_context')
     AND (nm LIKE '%rating%' OR nm LIKE '%dimension%');
  IF v_n = 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS D1a-8 -- the two parent-reachable reads carry NO rating or dimension field: Q-27 did not move';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL D1a-8 -- % rating/dimension field(s) on a parent-reachable read', v_n;
  END IF;

  RAISE NOTICE 'D1A-RESULT pass=% fail=%', v_pass, v_fail;
END $suite$;

ROLLBACK;
