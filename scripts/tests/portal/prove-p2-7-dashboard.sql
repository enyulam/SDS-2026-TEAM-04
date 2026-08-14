-- =====================================================================
-- P2-7 -- MANAGEMENT DASHBOARD (screen `11`). The SQL half.
-- =====================================================================
-- ⛔ LEGS ARE PREFIXED `PDS-`. `prove-p2-4-class-overview.sql` owns `P26-`
--    and `prove-p2-6-lesson-materials.sql` owns `PLM-`; runners count legs BY
--    PREFIX, so a collision makes each suite's leg count meaningless the
--    moment both outputs meet. (Learned at `P2-6`, which had to rename.)
--
-- Legs:
--   PDS-1  NON-VACUITY -- real learners, real observations and real reports
--          exist, so every count below has something to measure. ⚠️ Registry
--          asserted as a FLOOR (>= 23), never an equality: pinning the global
--          total is §12.8's phase-scoped-claim defect and it broke six suites
--          one phase ago.
--   PDS-2  ⛔ THE READ ANSWERS MANAGEMENT AND REFUSES EVERYONE ELSE -- both
--          directions, and the refusal is NULLS rather than zeroes.
--   PDS-3  ⛔ IT AGREES WITH THE DATABASE. Every one of the four integers is
--          re-derived independently and compared. A summary that returns
--          plausible numbers nobody checked is the vacuity class.
--   PDS-4  ⛔ `submitted`, NOT `approved` (`A-036`). Proved by BEHAVIOUR, not
--          by reading the source: zero rows can ever be at `approved`.
--   PDS-5  ⛔ THE `V-4`-CLASS BARS, re-asserted on the LIVE catalogue with a
--          CONTROL requiring every detector to fire.
--   PDS-6  ⛔ IT EMITS NOTHING. A read is not a governed action (`A-029`).
--   PDS-7  ⛔ ZERO CLIENT GRANTS on `reports`/`observations`/`report_versions`
--          -- the whole reason this function exists -- with a CONTROL.
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

CREATE FUNCTION pg_temp.as_parent() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims',
  '{"sub":"d0000000-0000-4000-8000-000000000003","role":"authenticated"}', true); END $$;

CREATE FUNCTION pg_temp.as_nobody() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims', '', true); END $$;

DO $suite$
DECLARE
  v_centre   uuid;
  v_students integer;
  v_pending  integer;
  v_subm     integer;
  v_n        integer;
  v_m        integer;
  v_reg      integer;
  v_def      text;
  v_ev0      integer;
  v_ev1      integer;
  v_t        integer;
  v_p        integer;
  v_ok       boolean;
BEGIN
  SELECT c.id INTO v_centre FROM public.centres c LIMIT 1;

  -- =================================================================
  -- PDS-1  NON-VACUITY
  -- =================================================================
  SELECT pg_catalog.count(*) INTO v_n FROM public.students;
  SELECT pg_catalog.count(*) INTO v_m FROM public.observations;
  SELECT pg_catalog.count(*) INTO v_t FROM public.reports;
  SELECT pg_catalog.array_length(public.audit_action_registry(), 1) INTO v_reg;

  IF v_centre IS NOT NULL AND v_n > 0 AND v_m > 0 AND v_t > 0 AND v_reg >= 23 THEN
    RAISE NOTICE 'PASS PDS-1  NON-VACUITY: % learner(s), % observation(s), % report(s), registry % (>= 23) -- every count below has something real to measure', v_n, v_m, v_t, v_reg;
  ELSE
    RAISE NOTICE 'FAIL PDS-1  centre=% students=% observations=% reports=% registry=%', v_centre, v_n, v_m, v_t, v_reg;
  END IF;

  -- =================================================================
  -- PDS-2  ⛔ BOTH DIRECTIONS, AND THE REFUSAL IS NULLS
  -- =================================================================
  SET LOCAL ROLE authenticated;
  PERFORM pg_temp.as_management();
  -- ⚠️ THREE COLUMNS SINCE `Ruling A` (2026-08-15), not four.
  --    `o_assessed_students` was dropped by forward migration under `R-1`, and
  --    this leg would otherwise fail to COMPILE -- which is the good failure
  --    mode: a dropped OUT parameter cannot be silently ignored by a SQL
  --    consumer the way an unused field can be by a TypeScript one.
  SELECT o_total_students, o_pending_approval, o_submitted_reports
    INTO v_students, v_pending, v_subm
    FROM public.report_centre_dashboard_summary();

  -- ⛔ THREE REFUSED CALLERS, not one. A single refusal could be an accident
  --    of that identity; three make it the rule.
  PERFORM pg_temp.as_trainer();
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.report_centre_dashboard_summary() s WHERE s.o_total_students IS NOT NULL;
  PERFORM pg_temp.as_parent();
  SELECT pg_catalog.count(*) INTO v_m
    FROM public.report_centre_dashboard_summary() s WHERE s.o_total_students IS NOT NULL;
  PERFORM pg_temp.as_nobody();
  SELECT pg_catalog.count(*) INTO v_t
    FROM public.report_centre_dashboard_summary() s WHERE s.o_total_students IS NOT NULL;
  RESET ROLE;

  IF v_students IS NOT NULL AND v_pending IS NOT NULL
     AND v_subm IS NOT NULL AND v_n = 0 AND v_m = 0 AND v_t = 0 THEN
    RAISE NOTICE 'PASS PDS-2  ⛔ BOTH DIRECTIONS: MANAGEMENT reads all THREE integers (%|%|%), while a TRAINER, a PARENT and an UNIDENTIFIED caller each get NULLS -- ⚠️ NULLS, not zeroes, so a refusal can never be painted as a centre with no learners (`Q-7`). ⚠️ THREE since `Ruling A`; it read FOUR until 2026-08-15', v_students, v_pending, v_subm;
  ELSE
    RAISE NOTICE 'FAIL PDS-2  mgmt=%|%|% trainer_rows=% parent_rows=% anon_rows=%', v_students, v_pending, v_subm, v_n, v_m, v_t;
  END IF;

  -- =================================================================
  -- PDS-3  ⛔ IT AGREES WITH THE DATABASE
  -- =================================================================
  -- ⚠️ EVERY FIGURE RE-DERIVED INDEPENDENTLY. Without this the suite would
  --    prove only that three integers came back, which is equally true of three
  --    wrong ones.
  --
  -- ⛔ `Ruling A` (2026-08-15): TOTAL STUDENTS RE-DERIVES FROM `enrolments`,
  --    NOT FROM `students`. ▶ THIS IS THE LEG THAT WOULD HAVE MISSED IT: both
  --    readings were 13, so the OLD re-derivation would have AGREED with the
  --    NEW function and passed while proving the opposite of what it says.
  --    `RAa-2` in `prove:ruling-a` closes that by CONSTRUCTING the divergence --
  --    withdrawing a learner and requiring the tile to follow ENROLLED.
  SELECT pg_catalog.count(DISTINCT e.student_id) INTO v_t
    FROM public.enrolments e WHERE e.centre_id = v_centre AND e.is_active;
  SELECT pg_catalog.count(*) INTO v_p
    FROM public.reports r WHERE r.centre_id = v_centre AND r.status = 'trainer_approved';
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.reports r WHERE r.centre_id = v_centre AND r.status = 'submitted';

  IF v_students = v_t AND v_pending = v_p AND v_subm = v_n THEN
    RAISE NOTICE 'PASS PDS-3  all THREE figures AGREE with an independent re-derivation (%|%|%) -- ⛔ total students re-derived from ACTIVE ENROLMENTS since `Ruling A`, never from centre-resident `students` rows, so a withdrawn learner is excluded on both sides of the comparison', v_t, v_p, v_n;
  ELSE
    RAISE NOTICE 'FAIL PDS-3  rpc=%|%|% derived=%|%|%', v_students, v_pending, v_subm, v_t, v_p, v_n;
  END IF;

  -- =================================================================
  -- PDS-4  ⛔ `submitted`, NOT `approved` -- PROVED BY BEHAVIOUR
  -- =================================================================
  -- ⚠️ The point is not that the source says `submitted`; it is that
  --    `approved` NEVER COMMITS (`A-036`), so a tile counting it would read
  --    ZERO FOREVER. That is measured here rather than argued.
  SELECT pg_catalog.count(*) INTO v_n FROM public.reports r WHERE r.status = 'approved';
  SELECT 'approved' = ANY (pg_catalog.enum_range(NULL::public.report_status)::text[]) INTO v_ok;

  IF v_n = 0 AND v_ok AND v_subm >= 0 THEN
    RAISE NOTICE 'PASS PDS-4  ⛔ `approved` IS A LEGAL ENUM LABEL AND ZERO ROWS HOLD IT -- it is TRANSIENT-IN-TRANSACTION (`A-036`), so the frame''s `Approved` KPI has an EMPTY REFERENT and would read zero forever. The tile counts `submitted` (% at present) by Operator ruling -- the THIRD sighting of the Step 7I1D-R2 defect', v_subm;
  ELSE
    RAISE NOTICE 'FAIL PDS-4  approved_rows=% label_exists=% submitted=%', v_n, v_ok, v_subm;
  END IF;

  -- =================================================================
  -- PDS-5  ⛔ THE `V-4`-CLASS BARS, ON THE LIVE CATALOGUE, WITH A CONTROL
  -- =================================================================
  SELECT pg_catalog.pg_get_functiondef(p.oid) INTO v_def
    FROM pg_proc p JOIN pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = 'report_centre_dashboard_summary';

  v_ok := v_def IS NOT NULL
      AND v_def !~* '(rating|beginning|developing|mastering|mastered|overall_grade)'
      AND v_def !~* '(overview|strengths|areas_for_development|remarks)'
      AND v_def !~* '(follow_up_notes|observation_notes|strength_chips|focus_chips|term_evidence_notes)'
      AND v_def !~* '(checklist|content_hash|wording_hash|entry_hash)';

  -- ⚠️ THE CONTROL. Four absences are equally true of four patterns that can
  --    never match anything.
  IF NOT ('competency_rating mastering' ~* '(rating|beginning|developing|mastering|mastered|overall_grade)'
      AND 'v.areas_for_development' ~* '(overview|strengths|areas_for_development|remarks)'
      AND 'o.follow_up_notes' ~* '(follow_up_notes|observation_notes|strength_chips|focus_chips|term_evidence_notes)'
      AND 'rv.content_hash' ~* '(checklist|content_hash|wording_hash|entry_hash)')
  THEN
    RAISE NOTICE 'FAIL PDS-5  a bar detector does NOT match its planted sample -- every absence would be meaningless';
  ELSIF v_ok THEN
    RAISE NOTICE 'PASS PDS-5  ⛔ the live function body names NO rating, panel field, trainer note/chip, checklist value or hash -- and all FOUR detectors MATCH a planted sample, so these are measurements (`C-9`, `G-2`, `A-038`)';
  ELSE
    RAISE NOTICE 'FAIL PDS-5  the function names a barred term';
  END IF;

  -- =================================================================
  -- PDS-6  ⛔ A READ EMITS NOTHING (`A-029`)
  -- =================================================================
  SELECT pg_catalog.count(*) INTO v_ev0 FROM public.audit_events;
  SET LOCAL ROLE authenticated;
  PERFORM pg_temp.as_management();
  PERFORM public.report_centre_dashboard_summary();
  PERFORM public.report_centre_dashboard_summary();
  RESET ROLE;
  SELECT pg_catalog.count(*) INTO v_ev1 FROM public.audit_events;

  IF v_ev1 = v_ev0 THEN
    RAISE NOTICE 'PASS PDS-6  ⛔ TWO calls moved the audit count by ZERO (% -> %) -- a read is not a governed action (`A-029`), and the registry stays UNMOVED at %', v_ev0, v_ev1, v_reg;
  ELSE
    RAISE NOTICE 'FAIL PDS-6  audit % -> %', v_ev0, v_ev1;
  END IF;

  -- =================================================================
  -- PDS-7  ⛔ ZERO CLIENT GRANTS -- THE REASON THIS FUNCTION EXISTS
  -- =================================================================
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.role_table_grants
   WHERE table_schema = 'public'
     AND table_name IN ('reports', 'observations', 'report_versions')
     AND grantee IN ('authenticated', 'anon', 'PUBLIC', 'service_role');

  -- ⚠️ CONTROL -- planted, measured, revoked inside the transaction.
  GRANT SELECT ON public.observations TO authenticated;
  SELECT pg_catalog.count(*) INTO v_m
    FROM information_schema.role_table_grants
   WHERE table_schema = 'public' AND table_name = 'observations' AND grantee = 'authenticated';
  REVOKE SELECT ON public.observations FROM authenticated;

  IF v_n = 0 AND v_m > 0 THEN
    RAISE NOTICE 'PASS PDS-7  ⛔ ZERO client grants on `reports`/`observations`/`report_versions` -- which is WHY this read exists rather than a direct query. CONTROL: a planted `authenticated` SELECT on `observations` WAS seen (%) and revoked', v_m;
  ELSE
    RAISE NOTICE 'FAIL PDS-7  client_grants=% control_hits=%', v_n, v_m;
  END IF;
END
$suite$;

ROLLBACK;
