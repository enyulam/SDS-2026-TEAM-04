-- =====================================================================
-- B.E.S.T Coach -- Step 7I acceptance suite, CANONICAL database
-- =====================================================================
-- LOCAL DISPOSABLE DEVELOPMENT DATABASE ONLY.
--
-- Runs every S, R and R(D) proof of the Step 7I acceptance contract plus
-- the preservation and repeatability proofs, and LEAVES THE DATABASE
-- PRISTINE: 3 Auth users, 25 domain rows, the fixture checksum
-- byte-identical, and the COMMITTED AUDIT CHAIN EMPTY.
--
-- THE FOUR R(C) COORDINATED TWO-SESSION TESTS ARE NOT HERE, AND THAT IS
-- MANDATORY RATHER THAN TIDY (U-7I-21). An R(C) test's whole property is
-- "exactly one writer commits; the loser fails CAS having written nothing",
-- and under READ COMMITTED the loser can only observe the winner's row
-- version AFTER THE WINNER COMMITS -- an uncommitted winner that rolls back
-- lets the "loser" succeed, proving the opposite of the intended property.
-- So every R(C) test must COMMIT a governed mutation, every such mutation
-- appends an audit event in the same transaction, and those events are then
-- PERMANENTLY UNCLEANABLE: audit_block_mutation() raises unconditionally on
-- UPDATE or DELETE with no owner exemption and no session-variable bypass,
-- and Step 7H forbids repair "ever". Run here, they would leave T7I-28,
-- T7I-30 and T7I-31 permanently red after the FIRST execution, in a state no
-- operation in the system can clean. They run on a separate DISPOSABLE
-- database -- see run-concurrency.mjs.
--
-- T7I-33 (server-action proof) and T7I-34 (manual UI proof) are NOT run
-- here and are not claimed: T7I-33 belongs to the server-action checkpoint
-- and T7I-34 to later UI checkpoints. Both are recorded, not silently
-- dropped. T7I-40's repository-level static scan lives in static-scan.mjs.
--
-- MANDATORY HARNESS PREREQUISITE. audit_append_event takes its
-- authenticated branch ONLY when auth.uid() IS NOT NULL, and on the system
-- branch it rejects every report.* action outright; the Step 7G helpers
-- likewise fail closed on a NULL auth.uid(). Every decoy that reaches a
-- governed RPC therefore establishes a JWT identity context first. Decoy
-- identities use the THREE FIXTURE IDENTITIES ONLY -- no test inserts into
-- auth.users -- and every negative-identity case is constructed from those
-- three by membership, assignment or link manipulation inside a
-- rolled-back decoy.
-- =====================================================================

\set ON_ERROR_STOP on
\pset tuples_only on
\pset format unaligned
\pset footer off

-- ---------------------------------------------------------------------
-- Session-scoped harness (pg_temp -- never in `public`, so no census moves)
-- ---------------------------------------------------------------------
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

-- The single report of a decoy, its current candidate, and hash helpers.
CREATE FUNCTION pg_temp.r() RETURNS public.reports LANGUAGE plpgsql AS $$
DECLARE v public.reports; BEGIN SELECT * INTO v FROM public.reports LIMIT 1; RETURN v; END $$;

CREATE FUNCTION pg_temp.cand() RETURNS public.report_versions LANGUAGE plpgsql AS $$
DECLARE v public.report_versions; BEGIN
  SELECT rv.* INTO v FROM public.report_versions rv
   WHERE rv.id = (SELECT r.current_cycle_version_id FROM public.reports r LIMIT 1);
  RETURN v; END $$;

CREATE FUNCTION pg_temp.whash(p_version uuid) RETURNS text LANGUAGE plpgsql AS $$
DECLARE v public.report_versions; BEGIN
  SELECT * INTO v FROM public.report_versions WHERE id = p_version;
  RETURN public.report_wording_hash_v1(v.todays_strength, v.next_focus,
                                       v.practice_suggestion, v.session_takeaway);
END $$;

CREATE FUNCTION pg_temp.chain_len() RETURNS bigint LANGUAGE plpgsql AS $$
DECLARE n bigint; BEGIN SELECT pg_catalog.count(*) INTO n FROM public.audit_events; RETURN n; END $$;

-- Capture the SQLSTATE of a failing call, or 'OK' when it succeeds.
CREATE FUNCTION pg_temp.errcode(p_sql text) RETURNS text LANGUAGE plpgsql AS $$
DECLARE v text; BEGIN
  BEGIN
    EXECUTE p_sql;
    RETURN 'OK';
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v = RETURNED_SQLSTATE;
    RETURN v;
  END;
END $$;

-- Like errcode(), but ALWAYS rolls its subtransaction back -- even when the
-- statement succeeds. Needed wherever a positive leg must be exercised more
-- than once in one decoy: a successful governed mutation appends an audit
-- event, and audit_block_mutation() forbids DELETE unconditionally, so the
-- only way to un-do a success is to roll it back.
CREATE FUNCTION pg_temp.errcode_rb(p_sql text) RETURNS text LANGUAGE plpgsql AS $$
DECLARE v text; BEGIN
  BEGIN
    EXECUTE p_sql;
    RAISE EXCEPTION USING ERRCODE = 'BCRBK', MESSAGE = 'rollback sentinel';
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v = RETURNED_SQLSTATE;
    IF v = 'BCRBK' THEN RETURN 'OK'; END IF;
    RETURN v;
  END;
END $$;

CREATE FUNCTION pg_temp.constraint_of(p_sql text) RETURNS text LANGUAGE plpgsql AS $$
DECLARE v text; BEGIN
  BEGIN
    EXECUTE p_sql;
    RETURN 'OK';
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v = CONSTRAINT_NAME;
    RETURN COALESCE(v, '');
  END;
END $$;

-- Drive the fixture report to a named lifecycle stop. Every stop is reached
-- ONLY through the governed RPCs, switching JWT identity at each handover.
CREATE FUNCTION pg_temp.setup(p_stop text) RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE
  v_report uuid; v_lv int; v_st public.report_status; v_ver uuid; v_rev int;
  v_hash text; v_obs int; v_wh text; v_cr uuid; v_at timestamptz;
BEGIN
  PERFORM pg_temp.as_trainer();
  SELECT x.report_id, x.status, x.lock_version INTO v_report, v_st, v_lv
    FROM public.report_create('c5000000-0000-4000-8000-000000000001',
                              'c2000000-0000-4000-8000-000000000001',
                              'c9000000-0000-4000-8000-000000000001') x;
  IF p_stop = 'T0' THEN RETURN v_report; END IF;

  SELECT x.status, x.lock_version INTO v_st, v_lv
    FROM public.report_mark_observation_saved(v_report, v_lv) x;
  IF p_stop = 'T1' THEN RETURN v_report; END IF;

  SELECT x.status, x.lock_version, x.observation_lock_version INTO v_st, v_lv, v_obs
    FROM public.report_request_draft(v_report, v_lv) x;
  IF p_stop = 'T2' THEN RETURN v_report; END IF;

  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.content_hash
    INTO v_st, v_lv, v_ver, v_rev, v_hash
    FROM public.report_store_draft(v_report, v_lv, v_obs,
      'Spoke clearly and held eye contact', 'Vary pace when excited',
      'Practice reading aloud for five minutes', 'A confident session') x;
  IF p_stop = 'T3' THEN RETURN v_report; END IF;

  IF p_stop = 'T5' THEN
    SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.content_hash
      INTO v_st, v_lv, v_ver, v_rev, v_hash
      FROM public.report_save_edit(v_report, v_st, v_lv, v_ver,
        'Spoke clearly and held eye contact throughout', 'Vary pace when excited',
        'Practice reading aloud for five minutes', 'A confident session') x;
    RETURN v_report;
  END IF;

  PERFORM public.report_update_checklist(v_report, v_lv, v_ver, true, true, true);
  IF p_stop = 'T3C' THEN RETURN v_report; END IF;

  SELECT x.status, x.lock_version INTO v_st, v_lv
    FROM public.report_trainer_approve(v_report, v_st, v_lv, v_ver, v_hash) x;
  IF p_stop = 'T7' THEN RETURN v_report; END IF;

  IF p_stop = 'T10' THEN
    PERFORM pg_temp.as_management();
    PERFORM public.report_management_return_to_trainer(v_report, v_lv, v_ver,
      'rating', 'body', 'Please re-check the Body rating against the observation record.');
    PERFORM pg_temp.as_trainer();
    RETURN v_report;
  END IF;

  -- Management wording edit, producing a management-authored candidate.
  PERFORM pg_temp.as_management();
  v_wh := pg_temp.whash(v_ver);
  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.wording_hash
    INTO v_st, v_lv, v_ver, v_rev, v_wh
    FROM public.report_management_edit_wording(v_report, v_lv, v_ver, v_wh,
      'Spoke clearly and held eye contact.', 'Vary pace when excited.',
      'Practice reading aloud for five minutes.', 'A confident session.') x;
  IF p_stop = 'T9' THEN RETURN v_report; END IF;

  IF p_stop = 'T9T10' THEN
    PERFORM public.report_management_return_to_trainer(v_report, v_lv, v_ver,
      'observation', NULL, 'The observation record does not support this summary.');
    PERFORM pg_temp.as_trainer();
    RETURN v_report;
  END IF;

  SELECT x.status, x.lock_version, x.submitted_version_id, x.submitted_at
    INTO v_st, v_lv, v_ver, v_at
    FROM public.report_management_approve_and_submit(v_report, v_lv, v_ver, v_wh) x;
  IF p_stop = 'T11' THEN RETURN v_report; END IF;

  IF p_stop = 'T12' THEN
    PERFORM pg_temp.as_trainer();
    SELECT x.status, x.lock_version, x.report_version_id, x.revision_number
      INTO v_st, v_lv, v_ver, v_rev
      FROM public.report_reopen_submitted(v_report, v_lv) x;
    RETURN v_report;
  END IF;

  RAISE EXCEPTION 'pg_temp.setup: unknown stop "%"', p_stop;
END $$;

COMMIT;

\echo '--- Step 7I canonical acceptance suite ---'

-- =====================================================================
-- SECTION 1 -- Object inventory, posture and EXECUTE census
-- =====================================================================

-- T7I-1  Migration guard + end-of-migration posture re-derivation
-- T7I-2  Exact object inventory
-- T7I-73 Enum label position and the applied-migration count
-- T7I-42 No evidence representation
DO $t$
DECLARE v_n bigint; v_labels text[];
BEGIN
  -- (Reconciled at Backend Round B2: the assessment migration is the sixth
  -- ledger row. Reconciled again at Round B2.1: the correction-tracking
  -- migration is the seventh. Reconciled again at Backend V2: the
  -- competency-vocabulary rename (Amendment 006 A-053) is the eighth.
  -- T7I-73's own property -- the two Step 7I files applied in order with the
  -- label file first -- is unchanged.)
  SELECT pg_catalog.count(*) INTO v_n FROM supabase_migrations.schema_migrations;
  IF v_n <> 9 THEN RAISE EXCEPTION 'FAIL T7I-73: applied-migration count is %, expected 9', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM supabase_migrations.schema_migrations
   WHERE version IN ('20260803034500','20260803154500','20260804213000','20260805090000','20260805090500','20260806090000','20260806103000','20260806160000','20260806190000');
  IF v_n <> 9 THEN RAISE EXCEPTION 'FAIL T7I-73: the nine applied versions are not the expected ones'; END IF;

  -- Backend V2: the four ratified competency_rating labels and their physical
  -- sort order (A-049). RENAME VALUE preserves enumsortorder, so this proves
  -- the ordinal semantics survived. Class Grade is a DIFFERENT enum and is
  -- unchanged (A-054) -- it is asserted separately below.
  SELECT pg_catalog.array_agg(e.enumlabel::text ORDER BY e.enumsortorder) INTO v_labels
    FROM pg_catalog.pg_enum e JOIN pg_catalog.pg_type t ON t.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname = 'public' AND t.typname = 'competency_rating';
  IF v_labels IS DISTINCT FROM ARRAY['beginning','developing','mastering','mastered'] THEN
    RAISE EXCEPTION 'FAIL T7I-73: competency_rating physical order is %, expected the ratified four (A-049)', v_labels;
  END IF;

  SELECT pg_catalog.array_agg(e.enumlabel::text ORDER BY e.enumsortorder) INTO v_labels
    FROM pg_catalog.pg_enum e JOIN pg_catalog.pg_type t ON t.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname = 'public' AND t.typname = 'class_grade_code';
  IF v_labels IS DISTINCT FROM ARRAY['beginner','intermediate','advanced'] THEN
    RAISE EXCEPTION 'FAIL T7I-73: class_grade_code is %, expected beginner/intermediate/advanced unchanged (A-054)', v_labels;
  END IF;

  SELECT pg_catalog.array_agg(e.enumlabel::text ORDER BY e.enumsortorder) INTO v_labels
    FROM pg_catalog.pg_enum e JOIN pg_catalog.pg_type t ON t.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname = 'public' AND t.typname = 'report_status';
  IF v_labels IS DISTINCT FROM ARRAY['incomplete','observation_saved','drafting','draft_ready',
                                     'needs_edit','trainer_approved','approved','submitted'] THEN
    RAISE EXCEPTION 'FAIL T7I-73: report_status physical order is %, expected the ratified eight', v_labels;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname='public' AND c.relkind='r';
  IF v_n <> 26 THEN RAISE EXCEPTION 'FAIL T7I-2: table count is %, expected 26', v_n; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_type t
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname='public' AND t.typtype='e';
  IF v_n <> 12 THEN RAISE EXCEPTION 'FAIL T7I-2: enum count is %, expected 12', v_n; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname='public';
  IF v_n <> 32 THEN RAISE EXCEPTION 'FAIL T7I-2: public function census is %, expected 32 (28 + the 2 B2 assessment functions + the B2.1 correction-tracking read + the C2 report-context resolver)', v_n; END IF;

  -- All new objects owned by postgres.
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname='public' AND c.relkind='r' AND pg_catalog.pg_get_userbyid(c.relowner) <> 'postgres';
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-2: % table(s) are not owned by postgres', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname='public' AND pg_catalog.pg_get_userbyid(p.proowner) <> 'postgres';
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-2: % function(s) are not owned by postgres', v_n; END IF;

  -- The correction table: RLS enabled, zero policies.
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname='public' AND c.relname='report_correction_requests' AND c.relrowsecurity;
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-2: report_correction_requests does not have RLS enabled'; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_policies
   WHERE schemaname='public' AND tablename='report_correction_requests';
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-2: report_correction_requests carries % policy(ies)', v_n; END IF;

  -- Named identifiers for every new column and constraint.
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_constraint c
   WHERE c.conrelid='public.report_versions'::regclass
     AND c.conname IN ('report_versions_content_hash_chk','report_versions_content_hash_version_chk',
                       'report_versions_trainer_approved_source_fk');
  IF v_n <> 3 THEN RAISE EXCEPTION 'FAIL T7I-2: % of the 3 new report_versions constraints exist', v_n; END IF;

  -- Default ACLs byte-unchanged.
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_default_acl d
    JOIN pg_catalog.pg_namespace n ON n.oid=d.defaclnamespace
   WHERE pg_catalog.pg_get_userbyid(d.defaclrole)='postgres' AND n.nspname='public';
  IF v_n <> 3 THEN RAISE EXCEPTION 'FAIL T7I-2: postgres default-ACL rows in public = %, expected 3', v_n; END IF;

  -- T7I-42: no evidence representation beyond the pre-existing checklist
  -- attestation names, and exactly the eight report_status labels.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_attribute a
    JOIN pg_catalog.pg_class c ON c.oid=a.attrelid
    JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname='public' AND c.relkind='r' AND NOT a.attisdropped AND a.attnum>0
     AND a.attname LIKE '%evidence%'
     -- The three PRE-EXISTING Step 7E names, and no others. `evidence_confirmed`
     -- and `checklist_evidence_confirmed` are the version-scoped checklist
     -- attestation that IS the Phase 1 evidence condition (section 3.4);
     -- `term_evidence_notes` belongs to the separate End-of-Term instrument,
     -- whose capture is in scope and whose generator is not.
     AND a.attname NOT IN ('evidence_confirmed','checklist_evidence_confirmed','term_evidence_notes');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-42: % unexpected evidence-named column(s) exist', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_type t
    JOIN pg_catalog.pg_namespace n ON n.oid=t.typnamespace
   WHERE n.nspname='public' AND t.typtype='e' AND t.typname LIKE '%evidence%';
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-42: an evidence-named enum exists'; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_enum e
    JOIN pg_catalog.pg_type t ON t.oid=e.enumtypid
   WHERE t.typname='report_status' AND e.enumlabel::text = 'evidence_pending';
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-42: report_status carries an evidence_pending label'; END IF;

  RAISE NOTICE 'PASS T7I-1, T7I-2, T7I-42, T7I-73 (catalogue legs)';
END $t$;

-- T7I-3  Zero client DML/SELECT on all five report tables and on the
--        correction-request table (client roles x 7 privileges)
DO $t$
DECLARE v_n bigint;
BEGIN
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.unnest(ARRAY['reports','report_versions','report_version_ratings',
                                 'report_version_checklist_progress','report_version_approvals',
                                 'report_correction_requests']) AS t(tbl)
    CROSS JOIN pg_catalog.unnest(ARRAY['anon','authenticated','service_role','authenticator','public']) AS r(rn)
    CROSS JOIN pg_catalog.unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) AS p(pv)
   WHERE pg_catalog.has_table_privilege(r.rn, ('public.'||t.tbl)::regclass, p.pv);
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-3: % client table privilege(s) on the report family; expected 0', v_n; END IF;
  RAISE NOTICE 'PASS T7I-3';
END $t$;

-- T7I-4  EXECUTE posture exact: 14 granted, 4 at zero (including PUBLIC),
--        14 + 4 = 18, nothing to service_role, Step 7G grants byte-unchanged.
--        Denial is additionally proven via SET ROLE (A-010), never only as
--        postgres.
DO $t$
DECLARE
  v_granted CONSTANT text[] := ARRAY['report_create','report_mark_observation_saved','report_request_draft',
    'report_cancel_draft','report_save_edit','report_update_checklist','report_trainer_approve',
    'report_management_edit_wording','report_management_return_to_trainer',
    'report_management_approve_and_submit','report_reopen_submitted','report_get_canonical',
    'report_get_working','report_get_management_review'];
  v_zero CONSTANT text[] := ARRAY['report_store_draft','report_content_hash_v1',
    'report_wording_hash_v1','app_parent_reaches_student'];
  v_7g CONSTANT text[] := ARRAY['app_current_account_id','app_has_active_membership','app_is_own_membership',
    'app_is_own_active_membership','app_trainer_reaches_session','app_trainer_reaches_module'];
  v_n bigint;
BEGIN
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public' AND p.proname = ANY(v_granted)
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 14 THEN RAISE EXCEPTION 'FAIL T7I-4: % of 14 RPCs hold authenticated EXECUTE', v_n; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public'
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 24 THEN RAISE EXCEPTION 'FAIL T7I-4: % function(s) hold authenticated EXECUTE; expected 24 (6 + 14 + the 2 B2 assessment RPCs + the B2.1 correction-tracking read + the C2 report-context resolver)', v_n; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public' AND p.proname = ANY(v_zero)
     AND NOT pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE')
     AND NOT pg_catalog.has_function_privilege('anon', p.oid, 'EXECUTE')
     AND NOT pg_catalog.has_function_privilege('service_role', p.oid, 'EXECUTE')
     AND NOT pg_catalog.has_function_privilege('authenticator', p.oid, 'EXECUTE')
     AND p.proacl IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_catalog.aclexplode(p.proacl) ae WHERE ae.grantee = 0);
  IF v_n <> 4 THEN RAISE EXCEPTION 'FAIL T7I-4: % of the 4 zero-EXECUTE functions are truly at zero', v_n; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public' AND pg_catalog.has_function_privilege('service_role', p.oid, 'EXECUTE');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-4: service_role holds EXECUTE on % function(s)', v_n; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public' AND p.proname = ANY(v_7g)
     AND p.provolatile='s' AND p.prosecdef
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE')
     AND NOT pg_catalog.has_function_privilege('anon', p.oid, 'EXECUTE')
     AND NOT pg_catalog.has_function_privilege('service_role', p.oid, 'EXECUTE')
     AND NOT pg_catalog.has_function_privilege('authenticator', p.oid, 'EXECUTE');
  IF v_n <> 6 THEN RAISE EXCEPTION 'FAIL T7I-4: the 6 Step 7G helper grants are not byte-unchanged (matched %)', v_n; END IF;
  RAISE NOTICE 'PASS T7I-4 (catalogue legs)';
END $t$;

-- T7I-4 / T7I-27 / T7I-52  SET ROLE denial legs (A-010): proven as the
-- restricted application role, never only as the privileged owner.
BEGIN;
DO $t$
DECLARE v text;
BEGIN
  PERFORM pg_temp.as_trainer();
  EXECUTE 'SET LOCAL ROLE authenticated';

  v := pg_temp.errcode($q$ SELECT public.report_store_draft(
        'c5000000-0000-4000-8000-000000000001'::uuid, 1, 1, 'a','b','c','d') $q$);
  IF v <> '42501' THEN RAISE EXCEPTION 'FAIL T7I-4: report_store_draft as authenticated gave %, expected 42501 permission denied', v; END IF;

  v := pg_temp.errcode($q$ SELECT public.report_content_hash_v1('a','b','c','d',
        ARRAY['mastering','mastering','mastering','mastering','mastering','mastering','mastering','mastering','mastering']::public.competency_rating[]) $q$);
  IF v <> '42501' THEN RAISE EXCEPTION 'FAIL T7I-4: report_content_hash_v1 as authenticated gave %, expected 42501', v; END IF;

  v := pg_temp.errcode($q$ SELECT public.report_wording_hash_v1('a','b','c','d') $q$);
  IF v <> '42501' THEN RAISE EXCEPTION 'FAIL T7I-4: report_wording_hash_v1 as authenticated gave %, expected 42501', v; END IF;

  v := pg_temp.errcode($q$ SELECT public.app_parent_reaches_student('c2000000-0000-4000-8000-000000000001'::uuid) $q$);
  IF v <> '42501' THEN RAISE EXCEPTION 'FAIL T7I-4: app_parent_reaches_student as authenticated gave %, expected 42501', v; END IF;

  -- T7I-52 / T7I-18: direct DML on every report-family table is denied BY
  -- PRIVILEGE -- permission denied, never an empty result.
  v := pg_temp.errcode($q$ SELECT 1 FROM public.reports $q$);
  IF v <> '42501' THEN RAISE EXCEPTION 'FAIL T7I-52: SELECT on reports as authenticated gave %, expected 42501', v; END IF;
  v := pg_temp.errcode($q$ UPDATE public.report_versions SET todays_strength='x' $q$);
  IF v <> '42501' THEN RAISE EXCEPTION 'FAIL T7I-18: UPDATE on report_versions as authenticated gave %, expected 42501', v; END IF;
  v := pg_temp.errcode($q$ DELETE FROM public.report_version_approvals $q$);
  IF v <> '42501' THEN RAISE EXCEPTION 'FAIL T7I-18: DELETE on report_version_approvals as authenticated gave %, expected 42501', v; END IF;
  v := pg_temp.errcode($q$ INSERT INTO public.report_correction_requests(id) VALUES (gen_random_uuid()) $q$);
  IF v <> '42501' THEN RAISE EXCEPTION 'FAIL T7I-3: INSERT on report_correction_requests as authenticated gave %, expected 42501', v; END IF;
  v := pg_temp.errcode($q$ UPDATE public.observation_ratings SET rating='mastering' $q$);
  IF v <> '42501' THEN RAISE EXCEPTION 'FAIL T7I-52: UPDATE on observation_ratings as authenticated gave %, expected 42501', v; END IF;
  v := pg_temp.errcode($q$ UPDATE public.attendance SET status='absent' $q$);
  IF v <> '42501' THEN RAISE EXCEPTION 'FAIL T7I-52: UPDATE on attendance as authenticated gave %, expected 42501', v; END IF;
  v := pg_temp.errcode($q$ UPDATE public.observations SET observation_notes='x' $q$);
  IF v <> '42501' THEN RAISE EXCEPTION 'FAIL T7I-52: UPDATE on observations as authenticated gave %, expected 42501', v; END IF;

  RESET ROLE;
  RAISE NOTICE 'PASS T7I-4 / T7I-18 / T7I-52 (SET ROLE denial legs)';
END $t$;
ROLLBACK;

-- T7I-27  service_role posture: zero table privileges and zero EXECUTE on
--         every Step 7I object, despite BYPASSRLS.
DO $t$
DECLARE v_n bigint;
BEGIN
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
    CROSS JOIN pg_catalog.unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) AS p(pv)
   WHERE n.nspname='public' AND c.relkind='r'
     AND pg_catalog.has_table_privilege('service_role', c.oid, p.pv);
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-27: service_role holds % table privilege(s) in public', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public' AND pg_catalog.has_function_privilege('service_role', p.oid, 'EXECUTE');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-27: service_role holds EXECUTE on % function(s)', v_n; END IF;
  RAISE NOTICE 'PASS T7I-27';
END $t$;

-- T7I-39  Return shapes pinned FROM THE CATALOGUE, not from a sample row --
--         an all-NULL sample cannot prove a column absent.
DO $t$
DECLARE v_res text;
BEGIN
  SELECT pg_catalog.pg_get_function_result(p.oid) INTO v_res
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public' AND p.proname='report_get_canonical';
  IF v_res IS DISTINCT FROM
     'TABLE(todays_strength text, next_focus text, practice_suggestion text, session_takeaway text, submitted_at timestamp with time zone)' THEN
    RAISE EXCEPTION 'FAIL T7I-39: RPC-13 result is "%", expected exactly the four panels + submitted_at', v_res;
  END IF;
  IF v_res LIKE '%content_hash%' OR v_res LIKE '%revision_number%' THEN
    RAISE EXCEPTION 'FAIL T7I-39: RPC-13 leaks content_hash or revision_number';
  END IF;

  SELECT pg_catalog.pg_get_function_result(p.oid) INTO v_res
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public' AND p.proname='report_get_management_review';
  IF v_res LIKE '%content_hash%' OR v_res LIKE '%revision_number%'
     OR v_res LIKE '%rating%' OR v_res LIKE '%checklist%'
     OR v_res LIKE '%approv%' OR v_res LIKE '%reason%' THEN
    RAISE EXCEPTION 'FAIL T7I-39: RPC-15 result leaks a forbidden field: %', v_res;
  END IF;
  IF v_res NOT LIKE '%wording_hash text%' THEN
    RAISE EXCEPTION 'FAIL T7I-39: RPC-15 does not expose wording_hash';
  END IF;

  SELECT pg_catalog.pg_get_function_result(p.oid) INTO v_res
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public' AND p.proname='report_get_working';
  IF v_res NOT LIKE '%content_hash text%' OR v_res NOT LIKE '%ratings jsonb%'
     OR v_res NOT LIKE '%open_correction_reason text%' OR v_res NOT LIKE '%evidence_confirmed boolean%' THEN
    RAISE EXCEPTION 'FAIL T7I-39: RPC-14 does not match the enumerated working-state shape: %', v_res;
  END IF;

  -- T7I-51 (catalogue leg): the management wording-edit allow-list IS the
  -- signature. No rating, dimension, observation, attendance, evidence,
  -- note, checklist, approval, revision, lineage, authorship or submission
  -- parameter exists.
  -- INPUT parameters only: pg_get_function_arguments also lists OUT columns,
  -- and RPC-9 legitimately RETURNS report_version_id and revision_number.
  SELECT pg_catalog.string_agg(x.nm, ', ') INTO v_res
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
    CROSS JOIN LATERAL (
      SELECT a.nm, a.md
        FROM UNNEST(
               p.proargnames,
               COALESCE(p.proargmodes,
                        pg_catalog.array_fill('i'::"char",
                          ARRAY[pg_catalog.array_length(p.proargnames,1)]))
             ) AS a(nm, md)
    ) x
   WHERE n.nspname='public' AND p.proname='report_management_edit_wording'
     AND x.md IN ('i','b','v');
  IF v_res IS DISTINCT FROM
     'p_report_id, p_expected_lock_version, p_expected_version_id, p_expected_wording_hash, p_todays_strength, p_next_focus, p_practice_suggestion, p_session_takeaway' THEN
    RAISE EXCEPTION 'FAIL T7I-51: RPC-9 input parameters are "%", expected exactly the four panels plus the four expectation values', v_res;
  END IF;
  IF v_res LIKE '%rating%' OR v_res LIKE '%dimension%' OR v_res LIKE '%observation%'
     OR v_res LIKE '%attendance%' OR v_res LIKE '%evidence%' OR v_res LIKE '%note%'
     OR v_res LIKE '%checklist%' OR v_res LIKE '%approv%' OR v_res LIKE '%revision%'
     OR v_res LIKE '%derived%' OR v_res LIKE '%authored%' OR v_res LIKE '%submitted%'
     OR v_res LIKE '%content_hash%' THEN
    RAISE EXCEPTION 'FAIL T7I-51: RPC-9 exposes a forbidden parameter: %', v_res;
  END IF;
  RAISE NOTICE 'PASS T7I-39, T7I-51 (catalogue legs)';
END $t$;

-- T7I-44  Column and constraint migration safety: the content-hash CHECK
--         rejects '', 63-hex, 65-hex, UPPERCASE hex and 64-char non-hex, and
--         accepts valid lowercase 64-hex.
DO $t$
DECLARE
  v_def text;
  v_ok  boolean;
BEGIN
  SELECT pg_catalog.pg_get_constraintdef(c.oid) INTO v_def
    FROM pg_catalog.pg_constraint c
   WHERE c.conrelid='public.report_versions'::regclass AND c.conname='report_versions_content_hash_chk';
  IF v_def IS NULL THEN RAISE EXCEPTION 'FAIL T7I-44: the content-hash CHECK does not exist'; END IF;

  SELECT ('' ~ '^[0-9a-f]{64}$') INTO v_ok;
  IF v_ok THEN RAISE EXCEPTION 'FAIL T7I-44: the empty string satisfies the content-hash pattern'; END IF;
  IF (pg_catalog.repeat('a',63) ~ '^[0-9a-f]{64}$') THEN RAISE EXCEPTION 'FAIL T7I-44: 63-hex accepted'; END IF;
  IF (pg_catalog.repeat('a',65) ~ '^[0-9a-f]{64}$') THEN RAISE EXCEPTION 'FAIL T7I-44: 65-hex accepted'; END IF;
  IF (pg_catalog.repeat('A',64) ~ '^[0-9a-f]{64}$') THEN RAISE EXCEPTION 'FAIL T7I-44: uppercase hex accepted'; END IF;
  IF (pg_catalog.repeat('z',64) ~ '^[0-9a-f]{64}$') THEN RAISE EXCEPTION 'FAIL T7I-44: 64-char non-hex accepted'; END IF;
  IF NOT (pg_catalog.repeat('a',64) ~ '^[0-9a-f]{64}$') THEN RAISE EXCEPTION 'FAIL T7I-44: valid lowercase 64-hex rejected'; END IF;
  RAISE NOTICE 'PASS T7I-44 (pattern leg; the emptiness precondition leg is in static-scan.mjs)';
END $t$;

-- T7I-45  Serializer posture and argument purity.
--         Argument purity is proven by a STATIC SCAN OF pg_proc.prosrc plus
--         cross-session determinism -- deliberately NOT by pg_depend, which
--         is VACUOUS here: PostgreSQL stores a PL/pgSQL body as opaque text
--         and records NO relation dependency for anything inside it, so a
--         pg_depend assertion would pass whatever the body contained.
DO $t$
DECLARE
  v_n     bigint;
  v_src   text;
  v_a     text;
  v_b     text;
  -- Amendment 006 A-049 ratified labels; the mix is positionally unchanged.
  v_nine  public.competency_rating[] := ARRAY['mastering','developing','beginning','mastering','mastered',
                                              'developing','beginning','mastering','mastered']::public.competency_rating[];
  v_err   text;
BEGIN
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
    JOIN pg_catalog.pg_language l ON l.oid=p.prolang
   WHERE n.nspname='public' AND p.proname IN ('report_content_hash_v1','report_wording_hash_v1')
     AND pg_catalog.pg_get_userbyid(p.proowner)='postgres'
     AND l.lanname='plpgsql'
     AND p.provolatile='i' AND NOT p.proisstrict AND p.proparallel='s' AND NOT p.prosecdef
     AND p.proconfig::text LIKE '%search_path=%';
  IF v_n <> 2 THEN RAISE EXCEPTION 'FAIL T7I-45: serializer posture wrong (matched %)', v_n; END IF;

  -- Static purity scan over the stored body text.
  FOR v_src IN
    SELECT p.prosrc FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
     WHERE n.nspname='public' AND p.proname IN ('report_content_hash_v1','report_wording_hash_v1')
  LOOP
    -- Strip `--` comments first: prose legitimately contains the word "from",
    -- and a scan that flagged a comment would be a false positive, not a
    -- purity finding.
    v_src := pg_catalog.regexp_replace(v_src, '--[^' || pg_catalog.chr(10) || ']*', '', 'g');
    -- `IS [NOT] DISTINCT FROM` is a comparison operator, not a table
    -- reference; neutralise it before the FROM scan so the scan measures
    -- what it claims to measure.
    v_src := pg_catalog.regexp_replace(v_src, 'IS\s+(NOT\s+)?DISTINCT\s+FROM', 'IS_DISTINCT_OP', 'gi');
    IF v_src ~* '(^|[^_[:alnum:]])from[^_[:alnum:]]' OR v_src ~* '(^|[^_[:alnum:]])join[^_[:alnum:]]'
       OR v_src LIKE '%public.%' OR v_src LIKE '%auth.%' THEN
      RAISE EXCEPTION 'FAIL T7I-45: a serializer body references a relation (FROM/JOIN/schema-qualified)';
    END IF;
  END LOOP;

  -- pg_depend is retained ONLY as a negative cross-check on argument and
  -- return TYPES, and is explicitly not claimed to prove purity.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_depend d
    JOIN pg_catalog.pg_proc p ON p.oid = d.objid
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname='public' AND p.proname='report_content_hash_v1'
     AND d.classid='pg_proc'::regclass AND d.refclassid='pg_class'::regclass;
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-45: report_content_hash_v1 carries a pg_class dependency'; END IF;

  -- Fixed arity: any length other than nine, or a NULL element, RAISES.
  v_err := pg_temp.errcode($q$ SELECT public.report_content_hash_v1('a','b','c','d',
             ARRAY['mastering']::public.competency_rating[]) $q$);
  IF v_err = 'OK' THEN RAISE EXCEPTION 'FAIL T7I-45: a one-element rating array was accepted'; END IF;
  v_err := pg_temp.errcode($q$ SELECT public.report_content_hash_v1('a','b','c','d', NULL) $q$);
  IF v_err = 'OK' THEN RAISE EXCEPTION 'FAIL T7I-45: a NULL rating array was accepted'; END IF;
  v_err := pg_temp.errcode($q$ SELECT public.report_content_hash_v1('a','b','c','d',
             ARRAY['mastering','mastering','mastering','mastering','mastering','mastering','mastering','mastering',NULL]::public.competency_rating[]) $q$);
  IF v_err = 'OK' THEN RAISE EXCEPTION 'FAIL T7I-45: a NULL rating element was accepted'; END IF;

  -- Determinism, and NULL panels serialized as the `N` tag rather than ''.
  v_a := public.report_content_hash_v1('x','y','z','w', v_nine);
  v_b := public.report_content_hash_v1('x','y','z','w', v_nine);
  IF v_a IS DISTINCT FROM v_b THEN RAISE EXCEPTION 'FAIL T7I-45: the content serializer is not deterministic'; END IF;
  IF public.report_content_hash_v1(NULL,'y','z','w', v_nine)
     = public.report_content_hash_v1('','y','z','w', v_nine) THEN
    RAISE EXCEPTION 'FAIL T7I-45: a NULL panel and an empty panel hash identically';
  END IF;

  -- Domain separation: no input produces the same digest from both.
  IF public.report_content_hash_v1('a','b','c','d', v_nine)
     = public.report_wording_hash_v1('a','b','c','d') THEN
    RAISE EXCEPTION 'FAIL T7I-45: the two envelopes are not domain-separated';
  END IF;
  IF v_a !~ '^[0-9a-f]{64}$' THEN RAISE EXCEPTION 'FAIL T7I-45: the hash is not lowercase 64-hex'; END IF;
  RAISE NOTICE 'PASS T7I-45';
END $t$;

-- T7I-74  approver_role is explicit, never defaulted.
BEGIN;
DO $t$
DECLARE
  v_n bigint; v_report uuid; v_ver uuid; v_err text; v_con text;
BEGIN
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_attrdef d JOIN pg_catalog.pg_attribute a
      ON a.attrelid=d.adrelid AND a.attnum=d.adnum
   WHERE d.adrelid='public.report_version_approvals'::regclass AND a.attname='approver_role';
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-74: approver_role still carries a DEFAULT'; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_attribute a
   WHERE a.attrelid='public.report_version_approvals'::regclass
     AND a.attname='approver_role' AND a.attnotnull;
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-74: approver_role is not NOT NULL'; END IF;

  v_report := pg_temp.setup('T7');
  v_ver := (SELECT r.current_cycle_version_id FROM public.reports r WHERE r.id=v_report);

  -- An INSERT omitting approver_role fails with a NOT NULL violation rather
  -- than silently becoming a `trainer` approval.
  v_err := pg_temp.errcode(pg_catalog.format($q$
    INSERT INTO public.report_version_approvals
      (report_version_id, report_id, centre_id, approved_by_membership_id,
       checklist_evidence_confirmed, checklist_ai_draft_reviewed, checklist_privacy_checked)
    VALUES (%L, %L, 'b0000000-0000-4000-8000-000000000001',
            'c1000000-0000-4000-8000-000000000002', true, true, true) $q$, v_ver, v_report));
  IF v_err <> '23502' THEN
    RAISE EXCEPTION 'FAIL T7I-74: omitting approver_role gave %, expected 23502 not_null_violation', v_err;
  END IF;

  -- The composite primary key rejects a second row of the same role, BY NAME.
  v_con := pg_temp.constraint_of(pg_catalog.format($q$
    INSERT INTO public.report_version_approvals
      (report_version_id, report_id, centre_id, approved_by_membership_id, approver_role,
       checklist_evidence_confirmed, checklist_ai_draft_reviewed, checklist_privacy_checked)
    VALUES (%L, %L, 'b0000000-0000-4000-8000-000000000001',
            'c1000000-0000-4000-8000-000000000002', 'trainer', true, true, true) $q$, v_ver, v_report));
  IF v_con <> 'report_version_approvals_pkey' THEN
    RAISE EXCEPTION 'FAIL T7I-74: a duplicate trainer approval was rejected by "%", expected report_version_approvals_pkey', v_con;
  END IF;
  RAISE NOTICE 'PASS T7I-74';
END $t$;
ROLLBACK;

-- =====================================================================
-- SECTION 2 -- Lifecycle, transitions, immutability and audit
-- =====================================================================

-- T7I-5  Full two-stage lifecycle end-to-end:
--        T0 -> T1 -> T2 -> T3 -> T5 -> T7 (trainer)
--           -> T10 (management return) -> T6 (trainer correction)
--           -> T7 (trainer reapproval) -> T9 (management wording edit)
--           -> T11 (management Approve & Submit)
--        switching JWT identity at each handover, with every intermediate
--        status, pointer, version, approval and correction row asserted.
--        The path reaches `needs_edit` the ONLY legal way -- through a
--        management return -- because `draft_ready -> needs_edit` is not one
--        of the fourteen legal pairs.
BEGIN;
DO $t$
DECLARE
  v_report uuid; v_lv int; v_st public.report_status; v_ver uuid; v_rev int;
  v_hash text; v_obs int; v_wh text; v_cr uuid; v_at timestamptz;
  v_prev_ver uuid; v_first_ver uuid; v_src uuid; v_n bigint;
BEGIN
  PERFORM pg_temp.as_trainer();
  SELECT x.report_id, x.status, x.lock_version INTO v_report, v_st, v_lv
    FROM public.report_create('c5000000-0000-4000-8000-000000000001',
                              'c2000000-0000-4000-8000-000000000001',
                              'c9000000-0000-4000-8000-000000000001') x;
  IF v_st <> 'incomplete' OR v_lv <> 1 THEN RAISE EXCEPTION 'FAIL T7I-5: T0 gave %/%', v_st, v_lv; END IF;
  IF (SELECT r.current_cycle_version_id FROM public.reports r WHERE r.id=v_report) IS NOT NULL
     OR (SELECT r.latest_submitted_version_id FROM public.reports r WHERE r.id=v_report) IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL T7I-5: T0 left a non-NULL version pointer';
  END IF;

  SELECT x.status, x.lock_version INTO v_st, v_lv FROM public.report_mark_observation_saved(v_report, v_lv) x;
  IF v_st <> 'observation_saved' OR v_lv <> 2 THEN RAISE EXCEPTION 'FAIL T7I-5: T1 gave %/%', v_st, v_lv; END IF;

  SELECT x.status, x.lock_version, x.observation_lock_version INTO v_st, v_lv, v_obs
    FROM public.report_request_draft(v_report, v_lv) x;
  IF v_st <> 'drafting' OR v_lv <> 3 OR v_obs <> 1 THEN RAISE EXCEPTION 'FAIL T7I-5: T2 gave %/%/%', v_st, v_lv, v_obs; END IF;

  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.content_hash
    INTO v_st, v_lv, v_ver, v_rev, v_hash
    FROM public.report_store_draft(v_report, v_lv, v_obs, 'A','B','C','D') x;
  IF v_st <> 'draft_ready' OR v_lv <> 4 OR v_rev <> 1 THEN RAISE EXCEPTION 'FAIL T7I-5: T3 gave %/%/%', v_st, v_lv, v_rev; END IF;
  v_first_ver := v_ver;

  v_prev_ver := v_ver;
  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.content_hash
    INTO v_st, v_lv, v_ver, v_rev, v_hash
    FROM public.report_save_edit(v_report, v_st, v_lv, v_ver, 'A2','B','C','D') x;
  IF v_st <> 'draft_ready' OR v_lv <> 5 OR v_rev <> 2 THEN RAISE EXCEPTION 'FAIL T7I-5: T5 gave %/%/%', v_st, v_lv, v_rev; END IF;
  IF (SELECT rv.derived_from_version_id FROM public.report_versions rv WHERE rv.id=v_ver) <> v_prev_ver THEN
    RAISE EXCEPTION 'FAIL T7I-5: T5 did not set derived_from_version_id to the prior candidate';
  END IF;

  PERFORM public.report_update_checklist(v_report, v_lv, v_ver, true, true, true);
  SELECT x.status, x.lock_version INTO v_st, v_lv
    FROM public.report_trainer_approve(v_report, v_st, v_lv, v_ver, v_hash) x;
  IF v_st <> 'trainer_approved' OR v_lv <> 6 THEN RAISE EXCEPTION 'FAIL T7I-5: T7 gave %/%', v_st, v_lv; END IF;
  IF (SELECT r.latest_submitted_version_id FROM public.reports r WHERE r.id=v_report) IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL T7I-5: trainer approval moved the canonical pointer';
  END IF;
  v_src := v_ver;

  PERFORM pg_temp.as_management();
  SELECT x.status, x.lock_version, x.correction_request_id INTO v_st, v_lv, v_cr
    FROM public.report_management_return_to_trainer(v_report, v_lv, v_ver,
      'rating','body','Please re-check the Body rating.') x;
  IF v_st <> 'needs_edit' OR v_lv <> 7 THEN RAISE EXCEPTION 'FAIL T7I-5: T10 gave %/%', v_st, v_lv; END IF;
  IF (SELECT cr.status FROM public.report_correction_requests cr WHERE cr.id=v_cr) <> 'open' THEN
    RAISE EXCEPTION 'FAIL T7I-5: T10 did not open a correction request';
  END IF;
  IF (SELECT r.current_cycle_version_id FROM public.reports r WHERE r.id=v_report) <> v_src THEN
    RAISE EXCEPTION 'FAIL T7I-5: T10 moved the candidate pointer';
  END IF;

  PERFORM pg_temp.as_trainer();
  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.content_hash
    INTO v_st, v_lv, v_ver, v_rev, v_hash
    FROM public.report_save_edit(v_report, 'needs_edit', v_lv, v_ver, 'A3','B','C','D') x;
  IF v_st <> 'draft_ready' OR v_lv <> 8 OR v_rev <> 3 THEN RAISE EXCEPTION 'FAIL T7I-5: T6 gave %/%/%', v_st, v_lv, v_rev; END IF;

  PERFORM public.report_update_checklist(v_report, v_lv, v_ver, true, true, true);
  SELECT x.status, x.lock_version INTO v_st, v_lv
    FROM public.report_trainer_approve(v_report, v_st, v_lv, v_ver, v_hash) x;
  IF v_st <> 'trainer_approved' OR v_lv <> 9 THEN RAISE EXCEPTION 'FAIL T7I-5: reapproval gave %/%', v_st, v_lv; END IF;
  IF (SELECT cr.status FROM public.report_correction_requests cr WHERE cr.id=v_cr) <> 'resolved'
     OR (SELECT cr.resolving_version_id FROM public.report_correction_requests cr WHERE cr.id=v_cr) <> v_ver THEN
    RAISE EXCEPTION 'FAIL T7I-5: the open correction request was not resolved by the reapproval';
  END IF;
  v_src := v_ver;

  PERFORM pg_temp.as_management();
  v_wh := pg_temp.whash(v_ver);
  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.wording_hash
    INTO v_st, v_lv, v_ver, v_rev, v_wh
    FROM public.report_management_edit_wording(v_report, v_lv, v_ver, v_wh, 'A3.','B.','C.','D.') x;
  IF v_st <> 'trainer_approved' OR v_lv <> 10 OR v_rev <> 4 THEN RAISE EXCEPTION 'FAIL T7I-5: T9 gave %/%/%', v_st, v_lv, v_rev; END IF;
  IF (SELECT rv.trainer_approved_source_version_id FROM public.report_versions rv WHERE rv.id=v_ver) <> v_src THEN
    RAISE EXCEPTION 'FAIL T7I-5: T9 did not pin the trainer-approved source';
  END IF;

  SELECT x.status, x.lock_version, x.submitted_version_id, x.submitted_at
    INTO v_st, v_lv, v_ver, v_at
    FROM public.report_management_approve_and_submit(v_report, v_lv, v_ver, v_wh) x;
  IF v_st <> 'submitted' OR v_lv <> 12 THEN RAISE EXCEPTION 'FAIL T7I-5: T11 gave %/%', v_st, v_lv; END IF;
  IF (SELECT r.latest_submitted_version_id FROM public.reports r WHERE r.id=v_report) <> v_ver THEN
    RAISE EXCEPTION 'FAIL T7I-5: the canonical pointer does not name the submitted version';
  END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM public.report_versions WHERE report_id=v_report;
  IF v_n <> 4 THEN RAISE EXCEPTION 'FAIL T7I-5: % versions exist, expected 4', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_approvals WHERE report_id=v_report;
  IF v_n <> 3 THEN RAISE EXCEPTION 'FAIL T7I-5: % approval rows exist, expected 3 (two trainer, one management)', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.audit_events;
  IF v_n <> 14 THEN RAISE EXCEPTION 'FAIL T7I-5: % audit events, expected 14', v_n; END IF;
  IF NOT (SELECT ok FROM public.audit_verify_chain('b0000000-0000-4000-8000-000000000001', NULL, NULL)) THEN
    RAISE EXCEPTION 'FAIL T7I-5: the audit chain does not verify';
  END IF;
  RAISE NOTICE 'PASS T7I-5';
END $t$;
ROLLBACK;

-- T7I-6  Illegal-transition completeness, enumerated per RPC and per
--        starting status. `approved` is EXCLUDED from every sweep: R-8 makes
--        it structurally unreachable as a COMMITTED state and no test may
--        fabricate it by owner-side DML, so the establishable statuses are
--        the SEVEN committed labels. 8 single-origin mutation RPCs x 6
--        foreign statuses = 48, plus 3 two-origin RPCs x 5 = 15, total 63.
CREATE FUNCTION pg_temp.sweep(p_report uuid, p_status text) RETURNS int LANGUAGE plpgsql AS $$
DECLARE
  v_lv  int;
  v_ver uuid;
  v_n   int := 0;
  v_e   text;
  v_legal jsonb := jsonb_build_object(
    'rpc2', jsonb_build_array('incomplete'),
    'rpc3', jsonb_build_array('observation_saved'),
    'rpc4', jsonb_build_array('drafting'),
    'rpc5', jsonb_build_array('drafting'),
    'rpc6', jsonb_build_array('draft_ready','needs_edit'),
    'rpc7', jsonb_build_array('draft_ready','needs_edit'),
    'rpc8', jsonb_build_array('draft_ready','needs_edit'),
    'rpc9', jsonb_build_array('trainer_approved'),
    'rpc10', jsonb_build_array('trainer_approved'),
    'rpc11', jsonb_build_array('trainer_approved'),
    'rpc12', jsonb_build_array('submitted'));
  v_key text;
  v_sql text;
BEGIN
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver
    FROM public.reports r WHERE r.id = p_report;

  FOREACH v_key IN ARRAY ARRAY['rpc2','rpc3','rpc4','rpc5','rpc6','rpc7','rpc8','rpc9','rpc10','rpc11','rpc12'] LOOP
    CONTINUE WHEN v_legal->v_key ? p_status;

    IF v_key IN ('rpc9','rpc10','rpc11') THEN
      PERFORM pg_temp.as_management();
    ELSE
      PERFORM pg_temp.as_trainer();
    END IF;

    v_sql := CASE v_key
      WHEN 'rpc2'  THEN format('SELECT public.report_mark_observation_saved(%L,%s)', p_report, v_lv)
      WHEN 'rpc3'  THEN format('SELECT public.report_request_draft(%L,%s)', p_report, v_lv)
      WHEN 'rpc4'  THEN format('SELECT public.report_store_draft(%L,%s,1,''a'',''b'',''c'',''d'')', p_report, v_lv)
      WHEN 'rpc5'  THEN format('SELECT public.report_cancel_draft(%L,%s)', p_report, v_lv)
      WHEN 'rpc6'  THEN format('SELECT public.report_save_edit(%L,''draft_ready''::public.report_status,%s,%L,''a'',''b'',''c'',''d'')', p_report, v_lv, v_ver)
      WHEN 'rpc7'  THEN format('SELECT public.report_update_checklist(%L,%s,%L,true,true,true)', p_report, v_lv, v_ver)
      WHEN 'rpc8'  THEN format('SELECT public.report_trainer_approve(%L,''draft_ready''::public.report_status,%s,%L,''%s'')', p_report, v_lv, v_ver, repeat('a',64))
      WHEN 'rpc9'  THEN format('SELECT public.report_management_edit_wording(%L,%s,%L,''%s'',''a'',''b'',''c'',''d'')', p_report, v_lv, v_ver, repeat('a',64))
      WHEN 'rpc10' THEN format('SELECT public.report_management_return_to_trainer(%L,%s,%L,''observation''::public.correction_issue_scope,NULL,''r'')', p_report, v_lv, v_ver)
      WHEN 'rpc11' THEN format('SELECT public.report_management_approve_and_submit(%L,%s,%L,''%s'')', p_report, v_lv, v_ver, repeat('a',64))
      WHEN 'rpc12' THEN format('SELECT public.report_reopen_submitted(%L,%s)', p_report, v_lv)
    END;

    v_e := pg_temp.errcode(v_sql);
    IF v_e <> 'BC004' THEN
      RAISE EXCEPTION 'FAIL T7I-6: % from status % gave %, expected BC004 (illegal transition)', v_key, p_status, v_e;
    END IF;
    v_n := v_n + 1;
  END LOOP;
  RETURN v_n;
END $$;

BEGIN;
DO $t$ DECLARE v int; BEGIN
  v := pg_temp.sweep(pg_temp.setup('T0'), 'incomplete');
  IF v <> 10 THEN RAISE EXCEPTION 'FAIL T7I-6: incomplete swept % cases, expected 10', v; END IF;
END $t$; ROLLBACK;
BEGIN;
DO $t$ DECLARE v int; BEGIN
  v := pg_temp.sweep(pg_temp.setup('T1'), 'observation_saved');
  IF v <> 10 THEN RAISE EXCEPTION 'FAIL T7I-6: observation_saved swept % cases, expected 10', v; END IF;
END $t$; ROLLBACK;
BEGIN;
DO $t$ DECLARE v int; BEGIN
  v := pg_temp.sweep(pg_temp.setup('T2'), 'drafting');
  IF v <> 9 THEN RAISE EXCEPTION 'FAIL T7I-6: drafting swept % cases, expected 9', v; END IF;
END $t$; ROLLBACK;
BEGIN;
DO $t$ DECLARE v int; BEGIN
  v := pg_temp.sweep(pg_temp.setup('T3'), 'draft_ready');
  IF v <> 8 THEN RAISE EXCEPTION 'FAIL T7I-6: draft_ready swept % cases, expected 8', v; END IF;
END $t$; ROLLBACK;
BEGIN;
DO $t$ DECLARE v int; BEGIN
  v := pg_temp.sweep(pg_temp.setup('T10'), 'needs_edit');
  IF v <> 8 THEN RAISE EXCEPTION 'FAIL T7I-6: needs_edit swept % cases, expected 8', v; END IF;
END $t$; ROLLBACK;
BEGIN;
DO $t$ DECLARE v int; BEGIN
  v := pg_temp.sweep(pg_temp.setup('T7'), 'trainer_approved');
  IF v <> 8 THEN RAISE EXCEPTION 'FAIL T7I-6: trainer_approved swept % cases, expected 8', v; END IF;
END $t$; ROLLBACK;
BEGIN;
DO $t$ DECLARE v int; BEGIN
  v := pg_temp.sweep(pg_temp.setup('T11'), 'submitted');
  IF v <> 10 THEN RAISE EXCEPTION 'FAIL T7I-6: submitted swept % cases, expected 10', v; END IF;
END $t$; ROLLBACK;

-- T7I-6 (remaining legs): RPC-6 and RPC-8 reject p_expected_status outside
-- their two-origin set BEFORE CAS; RPC-1 against an existing report; and the
-- sweep totals 63 cases.
BEGIN;
DO $t$
DECLARE v_report uuid; v_lv int; v_ver uuid; v_e text; v_con text;
BEGIN
  v_report := pg_temp.setup('T3');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  PERFORM pg_temp.as_trainer();

  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_save_edit(%L,''submitted''::public.report_status,%s,%L,''a'',''b'',''c'',''d'')', v_report, v_lv, v_ver));
  IF v_e <> 'BC004' THEN RAISE EXCEPTION 'FAIL T7I-6: RPC-6 accepted an out-of-set p_expected_status (%)', v_e; END IF;
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_trainer_approve(%L,''incomplete''::public.report_status,%s,%L,''%s'')', v_report, v_lv, v_ver, pg_catalog.repeat('a',64)));
  IF v_e <> 'BC004' THEN RAISE EXCEPTION 'FAIL T7I-6: RPC-8 accepted an out-of-set p_expected_status (%)', v_e; END IF;

  -- RPC-1 against an existing report: authored duplicate, with the violated
  -- constraint name preserved in the CONSTRAINT diagnostic.
  v_e := pg_temp.errcode($q$ SELECT public.report_create(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001',
    'c9000000-0000-4000-8000-000000000001') $q$);
  IF v_e <> 'BC014' THEN RAISE EXCEPTION 'FAIL T7I-6: RPC-1 against an existing report gave %, expected BC014', v_e; END IF;
  RAISE NOTICE 'PASS T7I-6 (63 illegal-origin cases + the two out-of-set legs + the duplicate leg)';
END $t$;
ROLLBACK;

-- T7I-13  Duplicate handling, EACH asserted against the exact constraint
--         name via GET STACKED DIAGNOSTICS ... CONSTRAINT_NAME.
BEGIN;
DO $t$
DECLARE v_report uuid; v_ver uuid; v_con text; v_lv int; v_e text; v_rev int;
BEGIN
  v_report := pg_temp.setup('T3');
  PERFORM pg_temp.as_trainer();

  -- reports_session_student_key, surfaced through the authored duplicate error.
  v_con := pg_temp.constraint_of($q$ SELECT public.report_create(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001',
    'c9000000-0000-4000-8000-000000000001') $q$);
  IF v_con <> 'reports_session_student_key' THEN
    RAISE EXCEPTION 'FAIL T7I-13: duplicate create fired "%", expected reports_session_student_key', v_con;
  END IF;

  -- reports_observation_key, proven SEPARATELY with a scratch (session,
  -- student) pair so only one invariant can fire. The scratch session and
  -- enrolment are owner-side decoy rows inside this rolled-back transaction.
  INSERT INTO public.class_sessions (id, centre_id, class_module_id, session_date, starts_at, ends_at)
  VALUES ('c5000000-0000-4000-8000-0000000000ff','b0000000-0000-4000-8000-000000000001',
          'c4000000-0000-4000-8000-000000000001','2026-02-04','10:00','11:00');
  v_con := pg_temp.constraint_of(pg_catalog.format($q$
    INSERT INTO public.reports (centre_id, class_session_id, class_module_id, student_id, enrolment_id, observation_id)
    VALUES ('b0000000-0000-4000-8000-000000000001','c5000000-0000-4000-8000-0000000000ff',
            'c4000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001',
            'c6000000-0000-4000-8000-000000000001',%L) $q$, 'c9000000-0000-4000-8000-000000000001'));
  IF v_con <> 'reports_observation_key' THEN
    RAISE EXCEPTION 'FAIL T7I-13: a second report on the same observation fired "%", expected reports_observation_key', v_con;
  END IF;

  -- report_versions_report_revision_key.
  SELECT r.current_cycle_version_id INTO v_ver FROM public.reports r WHERE r.id=v_report;
  SELECT rv.revision_number INTO v_rev FROM public.report_versions rv WHERE rv.id=v_ver;
  v_con := pg_temp.constraint_of(pg_catalog.format($q$
    INSERT INTO public.report_versions (report_id, centre_id, revision_number, content_hash)
    VALUES (%L,'b0000000-0000-4000-8000-000000000001',%s,'%s') $q$, v_report, v_rev, pg_catalog.repeat('a',64)));
  IF v_con <> 'report_versions_report_revision_key' THEN
    RAISE EXCEPTION 'FAIL T7I-13: a duplicate revision fired "%", expected report_versions_report_revision_key', v_con;
  END IF;
  RAISE NOTICE 'PASS T7I-13 (report/observation/revision legs; the approvals-PK leg is T7I-74 and the correction-index leg is T7I-53)';
END $t$;
ROLLBACK;

-- T7I-10 / T7I-11 / T7I-12  Stale-status, stale-lock-version and
--         stale-current-version CAS denials, each leaving zero residue.
BEGIN;
DO $t$
DECLARE v_report uuid; v_lv int; v_ver uuid; v_hash text; v_e text; v_chain bigint; v_wh text;
BEGIN
  v_report := pg_temp.setup('T3C');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  SELECT rv.content_hash INTO v_hash FROM public.report_versions rv WHERE rv.id=v_ver;
  v_chain := pg_temp.chain_len();
  PERFORM pg_temp.as_trainer();

  -- T7I-10: correct lock_version, wrong EXPECTED status (the report is at
  -- draft_ready; the caller expects needs_edit -- both are legal origins for
  -- RPC-8, so this is a CAS mismatch rather than an illegal transition).
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_trainer_approve(%L,''needs_edit''::public.report_status,%s,%L,%L)', v_report, v_lv, v_ver, v_hash));
  IF v_e <> 'BC003' THEN RAISE EXCEPTION 'FAIL T7I-10: wrong expected status gave %, expected BC003', v_e; END IF;

  -- T7I-11: correct status, stale lock_version.
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_trainer_approve(%L,''draft_ready''::public.report_status,%s,%L,%L)', v_report, v_lv - 1, v_ver, v_hash));
  IF v_e <> 'BC003' THEN RAISE EXCEPTION 'FAIL T7I-11: stale lock_version gave %, expected BC003', v_e; END IF;

  -- T7I-12: stale current-version id on RPC-7 and RPC-8.
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_update_checklist(%L,%s,%L,true,true,true)', v_report, v_lv, '00000000-0000-4000-8000-000000000000'));
  IF v_e <> 'BC003' THEN RAISE EXCEPTION 'FAIL T7I-12: RPC-7 with a superseded version gave %, expected BC003', v_e; END IF;
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_trainer_approve(%L,''draft_ready''::public.report_status,%s,%L,%L)', v_report, v_lv, '00000000-0000-4000-8000-000000000000', v_hash));
  IF v_e <> 'BC003' THEN RAISE EXCEPTION 'FAIL T7I-12: RPC-8 with a superseded version gave %, expected BC003', v_e; END IF;

  IF pg_temp.chain_len() <> v_chain THEN RAISE EXCEPTION 'FAIL T7I-23: a gated failure appended an audit event'; END IF;
  IF (SELECT r.lock_version FROM public.reports r WHERE r.id=v_report) <> v_lv THEN
    RAISE EXCEPTION 'FAIL T7I-10/11/12: lock_version moved during a failed CAS';
  END IF;
  IF (SELECT pg_catalog.count(*) FROM public.report_version_approvals) <> 0 THEN
    RAISE EXCEPTION 'FAIL T7I-10/11/12: a failed CAS wrote an approval row';
  END IF;
END $t$;
ROLLBACK;

-- T7I-12 (management legs) + T7I-14 double-click + T7I-48 ambiguous retry
BEGIN;
DO $t$
DECLARE v_report uuid; v_lv int; v_ver uuid; v_hash text; v_wh text; v_e text; v_st public.report_status;
        v_at timestamptz; v_n bigint; v_chain bigint; v_sub uuid;
BEGIN
  v_report := pg_temp.setup('T7');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  SELECT rv.content_hash INTO v_hash FROM public.report_versions rv WHERE rv.id=v_ver;
  v_wh := pg_temp.whash(v_ver);
  PERFORM pg_temp.as_management();

  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_management_edit_wording(%L,%s,%L,%L,''a'',''b'',''c'',''d'')',
    v_report, v_lv, '00000000-0000-4000-8000-000000000000', v_wh));
  IF v_e <> 'BC003' THEN RAISE EXCEPTION 'FAIL T7I-12: RPC-9 with a stale version gave %, expected BC003', v_e; END IF;
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_management_return_to_trainer(%L,%s,%L,''observation''::public.correction_issue_scope,NULL,''r'')',
    v_report, v_lv, '00000000-0000-4000-8000-000000000000'));
  IF v_e <> 'BC003' THEN RAISE EXCEPTION 'FAIL T7I-12: RPC-10 with a stale version gave %, expected BC003', v_e; END IF;
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_management_approve_and_submit(%L,%s,%L,%L)',
    v_report, v_lv, '00000000-0000-4000-8000-000000000000', v_wh));
  IF v_e <> 'BC003' THEN RAISE EXCEPTION 'FAIL T7I-12: RPC-11 with a stale version gave %, expected BC003', v_e; END IF;

  -- T7I-14 leg 1: a second trainer approval fails CAS on trainer_approved.
  PERFORM pg_temp.as_trainer();
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_trainer_approve(%L,''draft_ready''::public.report_status,%s,%L,%L)', v_report, v_lv, v_ver, v_hash));
  IF v_e <> 'BC004' THEN RAISE EXCEPTION 'FAIL T7I-14: a second trainer approve gave %, expected BC004', v_e; END IF;

  -- Publish, then prove the double-click and the ambiguous-retry legs.
  PERFORM pg_temp.as_management();
  SELECT x.status, x.lock_version, x.submitted_version_id, x.submitted_at INTO v_st, v_lv, v_sub, v_at
    FROM public.report_management_approve_and_submit(v_report, v_lv, v_ver, v_wh) x;
  v_chain := pg_temp.chain_len();

  -- T7I-14 leg 2 / T7I-48: a naive retry with the ORIGINAL expectations fails
  -- CAS with the authored error and produces no second effect.
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_management_approve_and_submit(%L,%s,%L,%L)', v_report, v_lv - 2, v_ver, v_wh));
  IF v_e <> 'BC004' THEN RAISE EXCEPTION 'FAIL T7I-48: the retry gave %, expected BC004 (submitted is not a legal origin)', v_e; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_approvals
   WHERE report_version_id=v_sub AND approver_role='management';
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-48: management approval count is %, expected 1', v_n; END IF;
  IF (SELECT rv.submitted_at FROM public.report_versions rv WHERE rv.id=v_sub) IS DISTINCT FROM v_at THEN
    RAISE EXCEPTION 'FAIL T7I-48: submitted_at changed on retry';
  END IF;
  IF pg_temp.chain_len() <> v_chain THEN RAISE EXCEPTION 'FAIL T7I-48: the retry appended an audit event'; END IF;

  -- RPC-15 then reports status=submitted with the matching pointer, which is
  -- how a client distinguishes "already submitted by me" from a conflict.
  IF (SELECT m.status FROM public.report_get_management_review(
        'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001') m) <> 'submitted' THEN
    RAISE EXCEPTION 'FAIL T7I-48: RPC-15 does not report the submitted state after publication';
  END IF;
  RAISE NOTICE 'PASS T7I-10, T7I-11, T7I-12, T7I-14, T7I-23, T7I-48';
END $t$;
ROLLBACK;

-- T7I-7  Live-assignment denial: an UNASSIGNED trainer is denied on every
--        trainer mutation RPC and on RPC-14. Constructed by deactivating the
--        fixture assignment inside this rolled-back decoy.
BEGIN;
DO $t$
DECLARE v_report uuid; v_lv int; v_ver uuid; v_e text; v_n bigint;
BEGIN
  v_report := pg_temp.setup('T3C');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  UPDATE public.class_session_assignments
     SET is_active = false, unassigned_at = pg_catalog.now()
   WHERE class_session_id='c5000000-0000-4000-8000-000000000001';
  PERFORM pg_temp.as_trainer();

  FOREACH v_e IN ARRAY ARRAY[
    pg_catalog.format('SELECT public.report_mark_observation_saved(%L,%s)', v_report, v_lv),
    pg_catalog.format('SELECT public.report_request_draft(%L,%s)', v_report, v_lv),
    pg_catalog.format('SELECT public.report_store_draft(%L,%s,1,''a'',''b'',''c'',''d'')', v_report, v_lv),
    pg_catalog.format('SELECT public.report_cancel_draft(%L,%s)', v_report, v_lv),
    pg_catalog.format('SELECT public.report_save_edit(%L,''draft_ready''::public.report_status,%s,%L,''a'',''b'',''c'',''d'')', v_report, v_lv, v_ver),
    pg_catalog.format('SELECT public.report_update_checklist(%L,%s,%L,true,true,true)', v_report, v_lv, v_ver),
    pg_catalog.format('SELECT public.report_trainer_approve(%L,''draft_ready''::public.report_status,%s,%L,''%s'')', v_report, v_lv, v_ver, pg_catalog.repeat('a',64)),
    pg_catalog.format('SELECT public.report_reopen_submitted(%L,%s)', v_report, v_lv)
  ] LOOP
    IF pg_temp.errcode(v_e) <> 'BC001' THEN
      RAISE EXCEPTION 'FAIL T7I-7: an unassigned trainer was not denied by: %', v_e;
    END IF;
  END LOOP;

  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_working(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-7: RPC-14 returned % row(s) to an unassigned trainer', v_n; END IF;
  RAISE NOTICE 'PASS T7I-7';
END $t$;
ROLLBACK;

-- T7I-8  Attendance denial. A MISSING ROW FAILS CLOSED; `absent` blocks T0;
--        a mid-cycle flip blocks every forward transition while EXISTING
--        ROWS ARE RETAINED (the A-028 mid-cycle rule made physical).
BEGIN;
DO $t$
DECLARE v_e text; v_report uuid; v_lv int; v_ver uuid; v_versions bigint;
BEGIN
  PERFORM pg_temp.as_trainer();
  UPDATE public.attendance SET status='absent'
   WHERE class_session_id='c5000000-0000-4000-8000-000000000001';
  v_e := pg_temp.errcode($q$ SELECT public.report_create(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001',
    'c9000000-0000-4000-8000-000000000001') $q$);
  IF v_e <> 'BC015' THEN RAISE EXCEPTION 'FAIL T7I-8: create for an ABSENT student gave %, expected BC015', v_e; END IF;

  DELETE FROM public.attendance WHERE class_session_id='c5000000-0000-4000-8000-000000000001';
  v_e := pg_temp.errcode($q$ SELECT public.report_create(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001',
    'c9000000-0000-4000-8000-000000000001') $q$);
  IF v_e <> 'BC015' THEN RAISE EXCEPTION 'FAIL T7I-8: a MISSING attendance row gave %, expected BC015 (fail closed)', v_e; END IF;
END $t$;
ROLLBACK;

BEGIN;
DO $t$
DECLARE v_e text; v_report uuid; v_lv int; v_ver uuid; v_versions bigint;
BEGIN
  v_report := pg_temp.setup('T3C');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  SELECT pg_catalog.count(*) INTO v_versions FROM public.report_versions WHERE report_id=v_report;

  -- Mid-cycle flip: forward progress is blocked, existing work is retained.
  UPDATE public.attendance SET status='absent'
   WHERE class_session_id='c5000000-0000-4000-8000-000000000001';
  PERFORM pg_temp.as_trainer();
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_trainer_approve(%L,''draft_ready''::public.report_status,%s,%L,''%s'')',
    v_report, v_lv, v_ver, pg_catalog.repeat('a',64)));
  IF v_e <> 'BC015' THEN RAISE EXCEPTION 'FAIL T7I-8: mid-cycle absence did not block T7 (%)', v_e; END IF;

  IF (SELECT pg_catalog.count(*) FROM public.report_versions WHERE report_id=v_report) <> v_versions THEN
    RAISE EXCEPTION 'FAIL T7I-8: mid-cycle absence destroyed existing version work';
  END IF;
  IF (SELECT r.lock_version FROM public.reports r WHERE r.id=v_report) <> v_lv THEN
    RAISE EXCEPTION 'FAIL T7I-8: mid-cycle absence moved lock_version';
  END IF;

  -- Withdrawn enrolment blocks forward progress exactly as absence does.
  UPDATE public.attendance SET status='present'
   WHERE class_session_id='c5000000-0000-4000-8000-000000000001';
  UPDATE public.enrolments SET is_active=false, withdrawn_at=pg_catalog.now()
   WHERE id='c6000000-0000-4000-8000-000000000001';
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_trainer_approve(%L,''draft_ready''::public.report_status,%s,%L,''%s'')',
    v_report, v_lv, v_ver, pg_catalog.repeat('a',64)));
  IF v_e <> 'BC016' THEN RAISE EXCEPTION 'FAIL T7I-8: a withdrawn enrolment did not block T7 (%)', v_e; END IF;
  RAISE NOTICE 'PASS T7I-8';
END $t$;
ROLLBACK;

-- T7I-9 / T7I-41  Future-session boundary, per R-9's exact predicate.
--   * with starts_at SET: denied one minute BEFORE the scheduled start in
--     Asia/Singapore, permitted one minute after;
--   * with starts_at NULL: denied at session_date - 1, permitted from the
--     start of session_date;
--   * all cases re-run under SET TIME ZONE 'UTC' and 'Asia/Singapore' to
--     prove the predicate depends only on the PINNED LITERAL and not on the
--     caller's TimeZone GUC;
--   * T12 succeeds against a future-dated session (the correction-entry
--     carve-out), and T9/T10/T11 also succeed, proving management operations
--     do not re-check the guard.
--   The owner-side session UPDATE below is authorized FOR THIS TEST ONLY and
--   is named here so it is not mistaken for a bypass of T7I-18.
CREATE FUNCTION pg_temp.set_session_at(p_offset interval, p_null_time boolean) RETURNS void
LANGUAGE plpgsql AS $$
DECLARE v_local timestamp;
BEGIN
  v_local := (pg_catalog.now() AT TIME ZONE 'Asia/Singapore') + p_offset;
  IF p_null_time THEN
    UPDATE public.class_sessions
       SET session_date = v_local::date, starts_at = NULL, ends_at = NULL
     WHERE id = 'c5000000-0000-4000-8000-000000000001';
  ELSE
    UPDATE public.class_sessions
       SET session_date = v_local::date, starts_at = v_local::time, ends_at = (v_local + interval '1 hour')::time
     WHERE id = 'c5000000-0000-4000-8000-000000000001';
  END IF;
END $$;

BEGIN;
DO $t$
DECLARE v_e text; v_tz text;
BEGIN
  FOREACH v_tz IN ARRAY ARRAY['UTC','Asia/Singapore'] LOOP
    EXECUTE pg_catalog.format('SET LOCAL TIME ZONE %L', v_tz);
    PERFORM pg_temp.as_trainer();

    PERFORM pg_temp.set_session_at(interval '1 minute', false);
    v_e := pg_temp.errcode_rb($q$ SELECT public.report_create(
      'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001',
      'c9000000-0000-4000-8000-000000000001') $q$);
    IF v_e <> 'BC017' THEN RAISE EXCEPTION 'FAIL T7I-41 [%]: one minute BEFORE the start gave %, expected BC017', v_tz, v_e; END IF;

    PERFORM pg_temp.set_session_at(interval '-1 minute', false);
    v_e := pg_temp.errcode_rb($q$ SELECT public.report_create(
      'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001',
      'c9000000-0000-4000-8000-000000000001') $q$);
    IF v_e <> 'OK' THEN RAISE EXCEPTION 'FAIL T7I-41 [%]: one minute AFTER the start gave %, expected success', v_tz, v_e; END IF;

    PERFORM pg_temp.set_session_at(interval '1 day', true);
    v_e := pg_temp.errcode_rb($q$ SELECT public.report_create(
      'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001',
      'c9000000-0000-4000-8000-000000000001') $q$);
    IF v_e <> 'BC017' THEN RAISE EXCEPTION 'FAIL T7I-41 [%]: NULL starts_at at session_date-1 gave %, expected BC017', v_tz, v_e; END IF;

    PERFORM pg_temp.set_session_at(interval '0', true);
    v_e := pg_temp.errcode_rb($q$ SELECT public.report_create(
      'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001',
      'c9000000-0000-4000-8000-000000000001') $q$);
    IF v_e <> 'OK' THEN RAISE EXCEPTION 'FAIL T7I-41 [%]: NULL starts_at from the start of session_date gave %, expected success', v_tz, v_e; END IF;
  END LOOP;
  RAISE NOTICE 'PASS T7I-9, T7I-41 (trainer-side boundary, both time zones)';
END $t$;
ROLLBACK;

BEGIN;
DO $t$
DECLARE
  v_report uuid; v_lv int; v_ver uuid; v_wh text; v_st public.report_status;
  v_rev int; v_at timestamptz; v_e text;
BEGIN
  -- Reach trainer_approved against a PAST-dated session, then move the
  -- session forward and prove management's operations still succeed.
  v_report := pg_temp.setup('T7');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  PERFORM pg_temp.set_session_at(interval '30 days', false);

  PERFORM pg_temp.as_management();
  v_wh := pg_temp.whash(v_ver);
  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.wording_hash
    INTO v_st, v_lv, v_ver, v_rev, v_wh
    FROM public.report_management_edit_wording(v_report, v_lv, v_ver, v_wh, 'z','y','x','w') x;
  IF v_st <> 'trainer_approved' THEN RAISE EXCEPTION 'FAIL T7I-41: T9 was blocked by the future-session guard'; END IF;

  SELECT x.status, x.lock_version, x.submitted_version_id, x.submitted_at INTO v_st, v_lv, v_ver, v_at
    FROM public.report_management_approve_and_submit(v_report, v_lv, v_ver, v_wh) x;
  IF v_st <> 'submitted' THEN RAISE EXCEPTION 'FAIL T7I-41: T11 was blocked by the future-session guard'; END IF;

  PERFORM pg_temp.as_trainer();
  SELECT x.status INTO v_st FROM public.report_reopen_submitted(v_report, v_lv) x;
  IF v_st <> 'needs_edit' THEN RAISE EXCEPTION 'FAIL T7I-41: T12 was blocked by the future-session guard'; END IF;
  RAISE NOTICE 'PASS T7I-41 (T9/T11/T12 carve-out against a future-dated session)';
END $t$;
ROLLBACK;

BEGIN;
DO $t$
DECLARE v_report uuid; v_lv int; v_ver uuid; v_st public.report_status; v_e text;
BEGIN
  v_report := pg_temp.setup('T7');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  PERFORM pg_temp.set_session_at(interval '30 days', false);
  PERFORM pg_temp.as_management();
  SELECT x.status INTO v_st FROM public.report_management_return_to_trainer(
    v_report, v_lv, v_ver, 'observation', NULL, 'A future-dated session must not block a return.') x;
  IF v_st <> 'needs_edit' THEN RAISE EXCEPTION 'FAIL T7I-41: T10 was blocked by the future-session guard'; END IF;
END $t$;
ROLLBACK;

-- T7I-17  Checklist behaviour across the whole lifecycle.
BEGIN;
DO $t$
DECLARE
  v_report uuid; v_n bigint; v_mgmt_ver uuid; v_frozen uuid;
  v_ev boolean; v_ai boolean; v_pc boolean; v_upd timestamptz;
BEGIN
  v_report := pg_temp.setup('T9');   -- T3, T5-less path: T3 -> approve -> T9
  -- Every TRAINER-created version carries a checklist row; the MANAGEMENT
  -- wording version carries NONE.
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.report_versions rv
    LEFT JOIN public.report_version_checklist_progress cp ON cp.report_version_id = rv.id
   WHERE rv.report_id = v_report AND rv.authored_by_role='trainer' AND cp.report_version_id IS NULL;
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-17: % trainer-created version(s) lack a checklist row', v_n; END IF;

  SELECT rv.id INTO v_mgmt_ver FROM public.report_versions rv
   WHERE rv.report_id=v_report AND rv.authored_by_role='management';
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_checklist_progress
   WHERE report_version_id = v_mgmt_ver;
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-17: the management wording version carries a checklist row'; END IF;

  -- The frozen trainer-approved version's checklist evidence is byte-untouched.
  SELECT rv.id INTO v_frozen FROM public.report_versions rv
   WHERE rv.report_id=v_report AND rv.authored_by_role='trainer' ORDER BY rv.revision_number DESC LIMIT 1;
  SELECT cp.evidence_confirmed, cp.ai_draft_reviewed, cp.privacy_checked, cp.updated_at
    INTO v_ev, v_ai, v_pc, v_upd
    FROM public.report_version_checklist_progress cp WHERE cp.report_version_id=v_frozen;
  IF NOT (v_ev AND v_ai AND v_pc) THEN RAISE EXCEPTION 'FAIL T7I-17: the frozen checklist is not all-true'; END IF;

  -- Every read model tolerates a version with no checklist row: RPC-14 must
  -- return the management candidate with NULL checklist booleans.
  PERFORM pg_temp.as_trainer();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_working(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001') w
   WHERE w.evidence_confirmed IS NULL AND w.ai_draft_reviewed IS NULL AND w.privacy_checked IS NULL;
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-17: RPC-14 did not tolerate a missing checklist row'; END IF;
  RAISE NOTICE 'PASS T7I-17';
END $t$;
ROLLBACK;

-- T7I-18  Immutable versions (runtime leg): no RPC path mutates the content,
--         hashes, snapshots, lineage or authorship of any version after
--         INSERT. The privilege leg is proven under SET ROLE in section 1.
BEGIN;
DO $t$
DECLARE
  v_report uuid; v_before text; v_after text; v_lv int; v_ver uuid; v_wh text;
  v_st public.report_status; v_rev int; v_at timestamptz; v_maxrev int;
BEGIN
  v_report := pg_temp.setup('T7');
  SELECT pg_catalog.max(rv.revision_number) INTO v_maxrev
    FROM public.report_versions rv WHERE rv.report_id=v_report;
  SELECT pg_catalog.md5(pg_catalog.string_agg(
           rv.id::text||coalesce(rv.todays_strength,'~')||coalesce(rv.next_focus,'~')||
           coalesce(rv.practice_suggestion,'~')||coalesce(rv.session_takeaway,'~')||
           rv.content_hash||rv.content_hash_version::text||rv.revision_number::text||
           coalesce(rv.derived_from_version_id::text,'~')||
           coalesce(rv.trainer_approved_source_version_id::text,'~')||
           coalesce(rv.authored_by_membership_id::text,'~')||coalesce(rv.authored_by_role::text,'~'),
           '|' ORDER BY rv.revision_number))
    INTO v_before FROM public.report_versions rv WHERE rv.report_id=v_report;

  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  PERFORM pg_temp.as_management();
  v_wh := pg_temp.whash(v_ver);
  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.wording_hash
    INTO v_st, v_lv, v_ver, v_rev, v_wh
    FROM public.report_management_edit_wording(v_report, v_lv, v_ver, v_wh, 'q','r','s','t') x;
  SELECT x.status, x.lock_version, x.submitted_version_id, x.submitted_at INTO v_st, v_lv, v_ver, v_at
    FROM public.report_management_approve_and_submit(v_report, v_lv, v_ver, v_wh) x;
  PERFORM pg_temp.as_trainer();
  PERFORM public.report_reopen_submitted(v_report, v_lv);

  SELECT pg_catalog.md5(pg_catalog.string_agg(
           rv.id::text||coalesce(rv.todays_strength,'~')||coalesce(rv.next_focus,'~')||
           coalesce(rv.practice_suggestion,'~')||coalesce(rv.session_takeaway,'~')||
           rv.content_hash||rv.content_hash_version::text||rv.revision_number::text||
           coalesce(rv.derived_from_version_id::text,'~')||
           coalesce(rv.trainer_approved_source_version_id::text,'~')||
           coalesce(rv.authored_by_membership_id::text,'~')||coalesce(rv.authored_by_role::text,'~'),
           '|' ORDER BY rv.revision_number))
    INTO v_after FROM public.report_versions rv
   WHERE rv.report_id=v_report AND rv.revision_number <= v_maxrev;

  IF v_before IS DISTINCT FROM v_after THEN
    RAISE EXCEPTION 'FAIL T7I-18: an existing version was mutated by a later lifecycle operation';
  END IF;
  RAISE NOTICE 'PASS T7I-18 (runtime leg)';
END $t$;
ROLLBACK;

-- T7I-19  Trainer approval provenance + T7I-56 approval does not publish.
BEGIN;
DO $t$
DECLARE
  v_report uuid; v_ver uuid; v_ap public.report_version_approvals; v_rv public.report_versions;
  v_ratings public.competency_rating[]; v_e text; v_lv int; v_hash text; v_n bigint;
BEGIN
  v_report := pg_temp.setup('T3C');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  SELECT rv.content_hash INTO v_hash FROM public.report_versions rv WHERE rv.id=v_ver;
  PERFORM pg_temp.as_trainer();

  -- A caller-hash mismatch is rejected.
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_trainer_approve(%L,''draft_ready''::public.report_status,%s,%L,''%s'')',
    v_report, v_lv, v_ver, pg_catalog.repeat('b',64)));
  IF v_e <> 'BC006' THEN RAISE EXCEPTION 'FAIL T7I-19: a caller-hash mismatch gave %, expected BC006', v_e; END IF;

  PERFORM public.report_trainer_approve(v_report, 'draft_ready', v_lv, v_ver, v_hash);

  SELECT * INTO v_ap FROM public.report_version_approvals WHERE report_version_id=v_ver;
  IF v_ap.approver_role <> 'trainer' THEN RAISE EXCEPTION 'FAIL T7I-19: the approval row is not role-pinned trainer'; END IF;
  IF NOT (v_ap.checklist_evidence_confirmed AND v_ap.checklist_ai_draft_reviewed AND v_ap.checklist_privacy_checked) THEN
    RAISE EXCEPTION 'FAIL T7I-19: the approval row does not carry the all-true checklist snapshot';
  END IF;

  -- The stored content_hash recomputes from stored content by the envelope.
  SELECT rv.* INTO v_rv FROM public.report_versions rv WHERE rv.id=v_ver;
  SELECT pg_catalog.array_agg(x.rating ORDER BY x.ord) INTO v_ratings FROM (
    SELECT rvr.rating, pg_catalog.array_position(
      ARRAY['body','emotion','speech','tonality','eye_contact','vocal_projection',
            'emotional_expression','sentence_flow','audience_awareness']::text[],
      rvr.dimension_code::text) AS ord
      FROM public.report_version_ratings rvr WHERE rvr.report_version_id=v_ver) x;
  IF public.report_content_hash_v1(v_rv.todays_strength, v_rv.next_focus,
       v_rv.practice_suggestion, v_rv.session_takeaway, v_ratings) IS DISTINCT FROM v_rv.content_hash THEN
    RAISE EXCEPTION 'FAIL T7I-19: the stored content_hash does not recompute from stored content';
  END IF;

  -- The approval audit payload carries version id + hash + checklist proof.
  SELECT pg_catalog.count(*) INTO v_n FROM public.audit_events e
   WHERE e.action='report.state_changed' AND e.state_to='trainer_approved'
     AND e.payload->>'report_version_id' = v_ver::text
     AND e.payload->>'content_hash' = v_rv.content_hash
     AND (e.payload->>'checklist_evidence_confirmed')::boolean
     AND (e.payload->>'checklist_ai_draft_reviewed')::boolean
     AND (e.payload->>'checklist_privacy_checked')::boolean;
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-19: the approval audit payload is not as ratified'; END IF;

  -- T7I-56: trainer approval publishes NOTHING.
  IF (SELECT r.latest_submitted_version_id FROM public.reports r WHERE r.id=v_report) IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL T7I-56: trainer approval moved the canonical pointer';
  END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_versions
   WHERE report_id=v_report AND (submitted_at IS NOT NULL OR submitted_by_membership_id IS NOT NULL OR submitted_by_role IS NOT NULL);
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-56: submission metadata was written by trainer approval'; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.audit_events WHERE state_to='submitted';
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-56: a submitted state-change event exists after trainer approval'; END IF;
  PERFORM pg_temp.as_parent();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_canonical(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-56: a parent can read a trainer-approved, unsubmitted report'; END IF;
  PERFORM pg_temp.as_management();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_canonical(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-56: management reached an unsubmitted version through RPC-13'; END IF;
  RAISE NOTICE 'PASS T7I-19, T7I-56';
END $t$;
ROLLBACK;

-- T7I-66  Trainer-approval checklist gate -- THE NEGATIVE CASES.
--         This proof exists nowhere else in the suite: T7I-19 asserts only a
--         successful approval and a hash mismatch, and never sets a checklist
--         boolean false.
BEGIN;
DO $t$
DECLARE
  v_report uuid; v_lv int; v_ver uuid; v_hash text; v_e text; v_chain bigint;
  v_case record;
BEGIN
  v_report := pg_temp.setup('T3');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  SELECT rv.content_hash INTO v_hash FROM public.report_versions rv WHERE rv.id=v_ver;
  v_chain := pg_temp.chain_len();
  PERFORM pg_temp.as_trainer();

  FOR v_case IN SELECT * FROM (VALUES
      (false, true,  true,  'only evidence_confirmed false'),
      (true,  false, true,  'only ai_draft_reviewed false'),
      (true,  true,  false, 'only privacy_checked false'),
      (false, false, false, 'all three false')) AS c(ev, ai, pc, label)
  LOOP
    PERFORM public.report_update_checklist(v_report, v_lv, v_ver, v_case.ev, v_case.ai, v_case.pc);
    v_e := pg_temp.errcode(pg_catalog.format(
      'SELECT public.report_trainer_approve(%L,''draft_ready''::public.report_status,%s,%L,%L)',
      v_report, v_lv, v_ver, v_hash));
    IF v_e <> 'BC005' THEN
      RAISE EXCEPTION 'FAIL T7I-66: with % the approval gave %, expected BC005', v_case.label, v_e;
    END IF;
    IF (SELECT pg_catalog.count(*) FROM public.report_version_approvals) <> 0 THEN
      RAISE EXCEPTION 'FAIL T7I-66: an approval row was written with an incomplete checklist (%)', v_case.label;
    END IF;
    IF (SELECT r.status FROM public.reports r WHERE r.id=v_report) <> 'draft_ready'
       OR (SELECT r.lock_version FROM public.reports r WHERE r.id=v_report) <> v_lv THEN
      RAISE EXCEPTION 'FAIL T7I-66: state moved on an incomplete-checklist rejection (%)', v_case.label;
    END IF;
    IF pg_temp.chain_len() <> v_chain THEN
      RAISE EXCEPTION 'FAIL T7I-66: an incomplete-checklist rejection appended an audit event (%)', v_case.label;
    END IF;
  END LOOP;

  -- Fifth case: a candidate holding NO checklist row at all fails the same way.
  DELETE FROM public.report_version_checklist_progress WHERE report_version_id=v_ver;
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_trainer_approve(%L,''draft_ready''::public.report_status,%s,%L,%L)',
    v_report, v_lv, v_ver, v_hash));
  IF v_e <> 'BC005' THEN RAISE EXCEPTION 'FAIL T7I-66: a MISSING checklist row gave %, expected BC005 (a missing row is a failure, not a pass)', v_e; END IF;

  -- The error is distinct from the CAS, hash, prior-approval and lineage codes.
  IF 'BC005' IN ('BC003','BC006','BC007','BC009','BC011') THEN
    RAISE EXCEPTION 'FAIL T7I-66: the incomplete-checklist code is not distinct';
  END IF;
  RAISE NOTICE 'PASS T7I-66';
END $t$;
ROLLBACK;

-- T7I-75  RPC-8's prior-approval gate -- the R-7a negative case.
--         Setup drives the report through T7 and then T10, so the aggregate
--         rests LEGALLY at `needs_edit` while current_cycle_version_id still
--         names the FROZEN, already-trainer-approved version. In that state
--         EVERY OTHER GATE SUCCEEDS -- the domain check, the three-way CAS,
--         the all-true frozen checklist, the nine snapshots and the content
--         hash -- so R-7a is THE SOLE BARRIER.
BEGIN;
DO $t$
DECLARE
  v_report uuid; v_lv int; v_ver uuid; v_hash text; v_e text; v_chain bigint;
  v_ap public.report_version_approvals; v_ap2 public.report_version_approvals;
  v_cr public.report_correction_requests; v_cur uuid; v_sub uuid; v_st public.report_status;
  v_n bigint; v_rev int;
BEGIN
  v_report := pg_temp.setup('T10');
  SELECT r.status, r.lock_version, r.current_cycle_version_id, r.latest_submitted_version_id
    INTO v_st, v_lv, v_ver, v_sub FROM public.reports r WHERE r.id=v_report;
  IF v_st <> 'needs_edit' THEN RAISE EXCEPTION 'FAIL T7I-75: setup did not rest at needs_edit'; END IF;
  SELECT rv.content_hash INTO v_hash FROM public.report_versions rv WHERE rv.id=v_ver;
  SELECT * INTO v_ap FROM public.report_version_approvals WHERE report_version_id=v_ver AND approver_role='trainer';
  IF v_ap.report_version_id IS NULL THEN RAISE EXCEPTION 'FAIL T7I-75: the candidate is not the frozen approved version'; END IF;
  SELECT * INTO v_cr FROM public.report_correction_requests WHERE report_id=v_report;
  v_chain := pg_temp.chain_len();
  v_cur := v_ver;
  PERFORM pg_temp.as_trainer();

  -- Every expectation is CORRECT. Only R-7a can reject this call.
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_trainer_approve(%L,''needs_edit''::public.report_status,%s,%L,%L)',
    v_report, v_lv, v_ver, v_hash));
  IF v_e <> 'BC011' THEN
    RAISE EXCEPTION 'FAIL T7I-75: the prior-approval gate gave %, expected BC011', v_e;
  END IF;
  -- Five explicit inequality assertions: no other gate can be mistaken for
  -- this one.
  IF 'BC011' = 'BC003' OR 'BC011' = 'BC006' OR 'BC011' = 'BC007'
     OR 'BC011' = 'BC005' OR 'BC011' = 'BC009' THEN
    RAISE EXCEPTION 'FAIL T7I-75: the prior-approval code collides with another gate''s code';
  END IF;

  -- Residue is nil, and the gate fired at step 5 -- never reaching step 10.
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_approvals
   WHERE report_version_id=v_ver AND approver_role='trainer';
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-75: trainer approval count is %, expected exactly 1', v_n; END IF;
  SELECT * INTO v_ap2 FROM public.report_version_approvals WHERE report_version_id=v_ver AND approver_role='trainer';
  IF v_ap2 IS DISTINCT FROM v_ap THEN RAISE EXCEPTION 'FAIL T7I-75: the existing trainer approval row was altered'; END IF;
  IF (SELECT r.status FROM public.reports r WHERE r.id=v_report) <> 'needs_edit' THEN
    RAISE EXCEPTION 'FAIL T7I-75: the status moved'; END IF;
  IF (SELECT r.lock_version FROM public.reports r WHERE r.id=v_report) <> v_lv THEN
    RAISE EXCEPTION 'FAIL T7I-75: lock_version moved'; END IF;
  IF (SELECT r.current_cycle_version_id FROM public.reports r WHERE r.id=v_report) IS DISTINCT FROM v_cur
     OR (SELECT r.latest_submitted_version_id FROM public.reports r WHERE r.id=v_report) IS DISTINCT FROM v_sub THEN
    RAISE EXCEPTION 'FAIL T7I-75: a version pointer moved'; END IF;
  IF pg_temp.chain_len() <> v_chain THEN RAISE EXCEPTION 'FAIL T7I-75: an audit event was appended'; END IF;
  IF (SELECT cr.status FROM public.report_correction_requests cr WHERE cr.id=v_cr.id) <> 'open'
     OR (SELECT cr.resolved_at FROM public.report_correction_requests cr WHERE cr.id=v_cr.id) IS NOT NULL
     OR (SELECT cr.resolved_by_membership_id FROM public.report_correction_requests cr WHERE cr.id=v_cr.id) IS NOT NULL
     OR (SELECT cr.resolver_role FROM public.report_correction_requests cr WHERE cr.id=v_cr.id) IS NOT NULL
     OR (SELECT cr.resolving_version_id FROM public.report_correction_requests cr WHERE cr.id=v_cr.id) IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL T7I-75: the open correction request was touched, so the gate reached step 10';
  END IF;

  -- Third leg: the gate does not TRAP the trainer. A T6 correction version,
  -- then a normal T7 approval that resolves the request.
  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.content_hash
    INTO v_st, v_lv, v_ver, v_rev, v_hash
    FROM public.report_save_edit(v_report, 'needs_edit', v_lv, v_ver, 'corrected','B','C','D') x;
  PERFORM public.report_update_checklist(v_report, v_lv, v_ver, true, true, true);
  SELECT x.status INTO v_st FROM public.report_trainer_approve(v_report, v_st, v_lv, v_ver, v_hash) x;
  IF v_st <> 'trainer_approved' THEN RAISE EXCEPTION 'FAIL T7I-75: the trainer was trapped by the gate'; END IF;
  IF (SELECT cr.status FROM public.report_correction_requests cr WHERE cr.id=v_cr.id) <> 'resolved' THEN
    RAISE EXCEPTION 'FAIL T7I-75: the correction request was not resolved by the corrected approval';
  END IF;
  RAISE NOTICE 'PASS T7I-75';
END $t$;
ROLLBACK;

-- T7I-64  RPC-7's two checklist-write gates.
BEGIN;
DO $t$
DECLARE
  v_report uuid; v_lv int; v_ver uuid; v_e text; v_before record; v_after record;
  v_st public.report_status; v_rev int; v_hash text; v_n bigint;
BEGIN
  -- Shape 1: after T7 -> T10 the candidate is the FROZEN, trainer-approved
  -- version. Status, lock_version and current-version gates ALL PASS.
  v_report := pg_temp.setup('T10');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  SELECT cp.evidence_confirmed, cp.ai_draft_reviewed, cp.privacy_checked, cp.updated_at
    INTO v_before FROM public.report_version_checklist_progress cp WHERE cp.report_version_id=v_ver;
  PERFORM pg_temp.as_trainer();

  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_update_checklist(%L,%s,%L,false,false,false)', v_report, v_lv, v_ver));
  IF v_e <> 'BC012' THEN RAISE EXCEPTION 'FAIL T7I-64: Gate A gave %, expected BC012', v_e; END IF;

  SELECT cp.evidence_confirmed, cp.ai_draft_reviewed, cp.privacy_checked, cp.updated_at
    INTO v_after FROM public.report_version_checklist_progress cp WHERE cp.report_version_id=v_ver;
  IF v_before IS DISTINCT FROM v_after THEN
    RAISE EXCEPTION 'FAIL T7I-64: the frozen version''s checklist evidence was altered';
  END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_approvals WHERE report_version_id=v_ver;
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-64: the frozen approval row changed'; END IF;

  -- A subsequent T6 creates a trainer-authored version with a fresh
  -- all-false row on which RPC-7 then SUCCEEDS -- the gate blocks the wrong
  -- version, it does not trap the trainer.
  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.content_hash
    INTO v_st, v_lv, v_ver, v_rev, v_hash
    FROM public.report_save_edit(v_report, 'needs_edit', v_lv, v_ver, 'new text','B','C','D') x;
  PERFORM public.report_update_checklist(v_report, v_lv, v_ver, true, true, true);
END $t$;
ROLLBACK;

BEGIN;
DO $t$
DECLARE v_report uuid; v_lv int; v_ver uuid; v_e text; v_n bigint;
        v_st public.report_status; v_rev int; v_hash text;
BEGIN
  -- Shape 2: after T7 -> T9 -> T10 the candidate is a MANAGEMENT-authored
  -- version carrying no checklist row at all.
  v_report := pg_temp.setup('T9T10');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  IF (SELECT rv.authored_by_role FROM public.report_versions rv WHERE rv.id=v_ver) <> 'management' THEN
    RAISE EXCEPTION 'FAIL T7I-64: shape 2 setup did not leave a management-authored candidate';
  END IF;
  PERFORM pg_temp.as_trainer();

  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_update_checklist(%L,%s,%L,true,true,true)', v_report, v_lv, v_ver));
  IF v_e <> 'BC013' THEN RAISE EXCEPTION 'FAIL T7I-64: Gate B gave %, expected BC013', v_e; END IF;
  IF 'BC013' = 'BC012' THEN RAISE EXCEPTION 'FAIL T7I-64: the two gates share an error code'; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_checklist_progress WHERE report_version_id=v_ver;
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-64: Gate B created a checklist row'; END IF;

  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.content_hash
    INTO v_st, v_lv, v_ver, v_rev, v_hash
    FROM public.report_save_edit(v_report, 'needs_edit', v_lv, v_ver, 'trainer text','B','C','D') x;
  PERFORM public.report_update_checklist(v_report, v_lv, v_ver, true, true, true);
  RAISE NOTICE 'PASS T7I-64 (both shapes, and neither traps the trainer)';
END $t$;
ROLLBACK;

-- T7I-20 / T7I-21 / T7I-22  Approve & Submit atomicity, exactly two ordered
--         audit events, and rollback atomicity through a real RPC.
BEGIN;
DO $t$
DECLARE
  v_report uuid; v_lv int; v_ver uuid; v_src uuid; v_wh text; v_e text; v_chain bigint;
  v_st public.report_status; v_rev int; v_at timestamptz; v_n bigint;
  v_e1 record; v_e2 record; v_heads bigint; v_targets bigint; v_headseq bigint;
BEGIN
  v_report := pg_temp.setup('T9');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  SELECT rv.trainer_approved_source_version_id INTO v_src FROM public.report_versions rv WHERE rv.id=v_ver;
  v_wh := pg_temp.whash(v_ver);
  v_chain := pg_temp.chain_len();
  SELECT pg_catalog.count(*) INTO v_heads FROM public.audit_chain_heads;
  SELECT pg_catalog.count(*) INTO v_targets FROM public.audit_event_targets;
  SELECT h.last_seq INTO v_headseq FROM public.audit_chain_heads h
   WHERE h.centre_id='b0000000-0000-4000-8000-000000000001';

  -- (a) Every externally reachable failure point of section 6.4 leaves ZERO
  --     residue: status trainer_approved, no management approval row, zero
  --     events, lock_version unchanged, canonical pointer unmoved.
  PERFORM pg_temp.as_trainer();       -- step 2: wrong role
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_management_approve_and_submit(%L,%s,%L,%L)', v_report, v_lv, v_ver, v_wh));
  IF v_e <> 'BC001' THEN RAISE EXCEPTION 'FAIL T7I-20: step 2 gave %, expected BC001', v_e; END IF;

  PERFORM pg_temp.as_management();
  v_e := pg_temp.errcode(pg_catalog.format(     -- step 3: stale lock_version
    'SELECT public.report_management_approve_and_submit(%L,%s,%L,%L)', v_report, v_lv-1, v_ver, v_wh));
  IF v_e <> 'BC003' THEN RAISE EXCEPTION 'FAIL T7I-20: step 3 gave %, expected BC003', v_e; END IF;
  v_e := pg_temp.errcode(pg_catalog.format(     -- step 8: wrong wording hash
    'SELECT public.report_management_approve_and_submit(%L,%s,%L,''%s'')', v_report, v_lv, v_ver, pg_catalog.repeat('c',64)));
  IF v_e <> 'BC008' THEN RAISE EXCEPTION 'FAIL T7I-20: step 8 gave %, expected BC008', v_e; END IF;

  IF (SELECT r.status FROM public.reports r WHERE r.id=v_report) <> 'trainer_approved'
     OR (SELECT r.lock_version FROM public.reports r WHERE r.id=v_report) <> v_lv
     OR (SELECT r.latest_submitted_version_id FROM public.reports r WHERE r.id=v_report) IS NOT NULL
     OR (SELECT pg_catalog.count(*) FROM public.report_version_approvals WHERE approver_role='management') <> 0
     OR pg_temp.chain_len() <> v_chain THEN
    RAISE EXCEPTION 'FAIL T7I-20: a failed Approve & Submit left residue';
  END IF;

  -- (b) A SUCCESSFUL call executed inside a decoy subtransaction and rolled
  --     back leaves zero residue -- including no event, no child row and no
  --     head movement (T7I-22).
  v_e := pg_temp.errcode_rb(pg_catalog.format(
    'SELECT public.report_management_approve_and_submit(%L,%s,%L,%L)', v_report, v_lv, v_ver, v_wh));
  IF v_e <> 'OK' THEN RAISE EXCEPTION 'FAIL T7I-20: the successful call did not succeed (%)', v_e; END IF;
  IF pg_temp.chain_len() <> v_chain
     OR (SELECT pg_catalog.count(*) FROM public.audit_event_targets) <> v_targets
     OR (SELECT pg_catalog.count(*) FROM public.audit_chain_heads) <> v_heads
     OR (SELECT h.last_seq FROM public.audit_chain_heads h
          WHERE h.centre_id='b0000000-0000-4000-8000-000000000001') IS DISTINCT FROM v_headseq
     OR (SELECT r.status FROM public.reports r WHERE r.id=v_report) <> 'trainer_approved' THEN
    RAISE EXCEPTION 'FAIL T7I-22: a rolled-back RPC left event, child or head residue';
  END IF;

  -- Now commit it for real (within this decoy transaction) and prove T7I-21.
  SELECT x.status, x.lock_version, x.submitted_version_id, x.submitted_at
    INTO v_st, v_lv, v_ver, v_at
    FROM public.report_management_approve_and_submit(v_report, v_lv, v_ver, v_wh) x;
  IF v_st <> 'submitted' THEN RAISE EXCEPTION 'FAIL T7I-20: publication failed'; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM public.audit_events WHERE state_to IN ('approved','submitted');
  IF v_n <> 2 THEN RAISE EXCEPTION 'FAIL T7I-21: % publication events, expected exactly 2', v_n; END IF;

  SELECT * INTO v_e1 FROM public.audit_events WHERE state_to='approved';
  SELECT * INTO v_e2 FROM public.audit_events WHERE state_to='submitted';
  IF v_e2.seq_no <> v_e1.seq_no + 1 THEN
    RAISE EXCEPTION 'FAIL T7I-21: the two events are not dense-consecutive (% then %)', v_e1.seq_no, v_e2.seq_no;
  END IF;
  IF v_e2.prev_hash IS DISTINCT FROM v_e1.entry_hash THEN
    RAISE EXCEPTION 'FAIL T7I-21: the second event''s prev_hash is not the first''s entry_hash';
  END IF;
  IF v_e1.state_domain <> 'report' OR v_e1.state_from <> 'trainer_approved' OR v_e1.state_to <> 'approved'
     OR v_e2.state_domain <> 'report' OR v_e2.state_from <> 'approved' OR v_e2.state_to <> 'submitted' THEN
    RAISE EXCEPTION 'FAIL T7I-21: the emitted state triples are not the ratified ones';
  END IF;
  IF v_e1.actor_role <> 'management' OR v_e2.actor_role <> 'management' THEN
    RAISE EXCEPTION 'FAIL T7I-21: the publication events do not both carry actor_role=management';
  END IF;
  IF v_e1.payload->>'report_version_id' <> v_ver::text OR v_e2.payload->>'report_version_id' <> v_ver::text THEN
    RAISE EXCEPTION 'FAIL T7I-21: the two events do not name the same version';
  END IF;
  IF v_e1.payload->>'trainer_approved_source_version_id' <> v_src::text THEN
    RAISE EXCEPTION 'FAIL T7I-21: the approved event does not carry the trainer-approved source';
  END IF;
  IF NOT ((v_e1.payload->>'checklist_evidence_confirmed')::boolean
      AND (v_e1.payload->>'checklist_ai_draft_reviewed')::boolean
      AND (v_e1.payload->>'checklist_privacy_checked')::boolean) THEN
    RAISE EXCEPTION 'FAIL T7I-21: the approved event does not carry the checklist proof';
  END IF;
  IF v_e1.payload->>'content_hash' <> (SELECT rv.content_hash FROM public.report_versions rv WHERE rv.id=v_ver)
     OR v_e2.payload->>'content_hash' <> (SELECT rv.content_hash FROM public.report_versions rv WHERE rv.id=v_ver) THEN
    RAISE EXCEPTION 'FAIL T7I-21: a publication payload content_hash does not equal the submitted version''s stored hash';
  END IF;
  IF NOT (SELECT ok FROM public.audit_verify_chain('b0000000-0000-4000-8000-000000000001', NULL, NULL)) THEN
    RAISE EXCEPTION 'FAIL T7I-21: the chain does not verify in complete mode';
  END IF;

  -- A successful call NEVER commits `approved`.
  IF (SELECT r.status FROM public.reports r WHERE r.id=v_report) = 'approved' THEN
    RAISE EXCEPTION 'FAIL T7I-20: a committed `approved` residue exists';
  END IF;
  RAISE NOTICE 'PASS T7I-20 (a,b), T7I-21, T7I-22';
END $t$;
ROLLBACK;

-- T7I-35  Content-hash field coverage.
DO $t$
DECLARE
  -- Amendment 006 A-049 ratified labels; v_alt still differs from v_nine in
  -- exactly its first element, which is what T7I-35 measures.
  v_nine public.competency_rating[] := ARRAY['mastering','developing','beginning','mastering','mastered',
    'developing','beginning','mastering','mastered']::public.competency_rating[];
  v_alt  public.competency_rating[] := ARRAY['mastered','developing','beginning','mastering','mastered',
    'developing','beginning','mastering','mastered']::public.competency_rating[];
  v_base text;
BEGIN
  v_base := public.report_content_hash_v1('S','F','P','T', v_nine);
  IF public.report_content_hash_v1('S2','F','P','T', v_nine) = v_base THEN RAISE EXCEPTION 'FAIL T7I-35: todays_strength does not affect the hash'; END IF;
  IF public.report_content_hash_v1('S','F2','P','T', v_nine) = v_base THEN RAISE EXCEPTION 'FAIL T7I-35: next_focus does not affect the hash'; END IF;
  IF public.report_content_hash_v1('S','F','P2','T', v_nine) = v_base THEN RAISE EXCEPTION 'FAIL T7I-35: practice_suggestion does not affect the hash'; END IF;
  IF public.report_content_hash_v1('S','F','P','T2', v_nine) = v_base THEN RAISE EXCEPTION 'FAIL T7I-35: session_takeaway does not affect the hash'; END IF;
  IF public.report_content_hash_v1('S','F','P','T', v_alt) = v_base THEN RAISE EXCEPTION 'FAIL T7I-35: a rating change does not affect the hash'; END IF;
  -- Two independently built versions with identical panels and identical
  -- nine (dimension, rating) pairs yield BYTE-IDENTICAL hashes; identifiers,
  -- revision numbers, lineage, authorship and timestamps are excluded by
  -- construction because the serializer never receives them.
  IF public.report_content_hash_v1('S','F','P','T', v_nine) <> v_base THEN RAISE EXCEPTION 'FAIL T7I-35: identical inputs gave different hashes'; END IF;
  RAISE NOTICE 'PASS T7I-35';
END $t$;

-- T7I-36  T12 clone hash identity, and T7I-38 canonical-pointer stability.
BEGIN;
DO $t$
DECLARE
  v_report uuid; v_lv int; v_clone uuid; v_frozen uuid; v_fhash text;
  v_before record; v_after record; v_st public.report_status; v_rev int; v_hash text; v_n bigint;
  v_apbefore text;
BEGIN
  v_report := pg_temp.setup('T11');
  SELECT r.latest_submitted_version_id, r.lock_version INTO v_frozen, v_lv FROM public.reports r WHERE r.id=v_report;
  SELECT rv.content_hash INTO v_fhash FROM public.report_versions rv WHERE rv.id=v_frozen;
  SELECT rv.todays_strength, rv.next_focus, rv.practice_suggestion, rv.session_takeaway,
         rv.content_hash, rv.submitted_at, rv.submitted_by_membership_id, rv.submitted_by_role
    INTO v_before FROM public.report_versions rv WHERE rv.id=v_frozen;
  -- The submitted version here is the MANAGEMENT wording descendant, so it
  -- legitimately carries ONE approval row (management) and no trainer row --
  -- the second of the two ratified published shapes. Snapshot whatever is
  -- there and prove it is byte-stable, rather than hard-coding a count.
  SELECT pg_catalog.md5(pg_catalog.string_agg(
           ap.approver_role::text||ap.approved_by_membership_id::text||ap.approved_at::text||
           ap.checklist_evidence_confirmed::text||ap.checklist_ai_draft_reviewed::text||
           ap.checklist_privacy_checked::text, '|' ORDER BY ap.approver_role::text))
    INTO v_apbefore FROM public.report_version_approvals ap WHERE ap.report_version_id=v_frozen;

  PERFORM pg_temp.as_trainer();
  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number
    INTO v_st, v_lv, v_clone, v_rev FROM public.report_reopen_submitted(v_report, v_lv) x;

  IF (SELECT rv.content_hash FROM public.report_versions rv WHERE rv.id=v_clone) <> v_fhash THEN
    RAISE EXCEPTION 'FAIL T7I-36: the clone''s content_hash does not equal the source''s';
  END IF;
  IF (SELECT r.latest_submitted_version_id FROM public.reports r WHERE r.id=v_report) <> v_frozen THEN
    RAISE EXCEPTION 'FAIL T7I-38: the canonical pointer moved on reopen';
  END IF;

  -- The first save altering any panel makes the hashes differ; the frozen
  -- version's hash and submission metadata stay byte-unchanged throughout.
  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.content_hash
    INTO v_st, v_lv, v_clone, v_rev, v_hash
    FROM public.report_save_edit(v_report, 'needs_edit', v_lv, v_clone, 'changed','B','C','D') x;
  IF v_hash = v_fhash THEN RAISE EXCEPTION 'FAIL T7I-36: a changed panel did not change the hash'; END IF;

  PERFORM public.report_update_checklist(v_report, v_lv, v_clone, true, false, false);

  SELECT rv.todays_strength, rv.next_focus, rv.practice_suggestion, rv.session_takeaway,
         rv.content_hash, rv.submitted_at, rv.submitted_by_membership_id, rv.submitted_by_role
    INTO v_after FROM public.report_versions rv WHERE rv.id=v_frozen;
  IF v_before IS DISTINCT FROM v_after THEN
    RAISE EXCEPTION 'FAIL T7I-38: the frozen submitted version changed during the correction cycle';
  END IF;
  IF (SELECT pg_catalog.md5(pg_catalog.string_agg(
           ap.approver_role::text||ap.approved_by_membership_id::text||ap.approved_at::text||
           ap.checklist_evidence_confirmed::text||ap.checklist_ai_draft_reviewed::text||
           ap.checklist_privacy_checked::text, '|' ORDER BY ap.approver_role::text))
        FROM public.report_version_approvals ap WHERE ap.report_version_id=v_frozen)
     IS DISTINCT FROM v_apbefore THEN
    RAISE EXCEPTION 'FAIL T7I-38: the frozen version''s approval rows changed during the correction cycle';
  END IF;

  -- RPC-13 returns the FROZEN version to parent and management at every
  -- intermediate point of the correction cycle.
  PERFORM pg_temp.as_parent();
  IF (SELECT c.todays_strength FROM public.report_get_canonical(
        'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001') c)
     IS DISTINCT FROM v_before.todays_strength THEN
    RAISE EXCEPTION 'FAIL T7I-38: the parent does not still read the frozen canonical version';
  END IF;
  PERFORM pg_temp.as_management();
  IF (SELECT c.todays_strength FROM public.report_get_canonical(
        'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001') c)
     IS DISTINCT FROM v_before.todays_strength THEN
    RAISE EXCEPTION 'FAIL T7I-38: management does not still read the frozen canonical version';
  END IF;
  RAISE NOTICE 'PASS T7I-36, T7I-38';
END $t$;
ROLLBACK;

-- T7I-37  R-5 create-per-change, across T3 -> T5 -> T5, then T7 -> T10 -> T6.
BEGIN;
DO $t$
DECLARE
  v_report uuid; v_lv int; v_ver uuid; v_rev int; v_hash text; v_st public.report_status;
  v_snapshot text; v_n bigint; v_cr uuid; v_prev text;
BEGIN
  v_report := pg_temp.setup('T3');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  PERFORM pg_temp.as_trainer();

  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.content_hash
    INTO v_st, v_lv, v_ver, v_rev, v_hash
    FROM public.report_save_edit(v_report,'draft_ready',v_lv,v_ver,'v2','B','C','D') x;
  SELECT pg_catalog.md5(pg_catalog.string_agg(rv.id::text||rv.content_hash, '|' ORDER BY rv.revision_number))
    INTO v_snapshot FROM public.report_versions rv WHERE rv.report_id=v_report AND rv.revision_number<=2;

  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.content_hash
    INTO v_st, v_lv, v_ver, v_rev, v_hash
    FROM public.report_save_edit(v_report,'draft_ready',v_lv,v_ver,'v3','B','C','D') x;
  IF v_rev <> 3 THEN RAISE EXCEPTION 'FAIL T7I-37: revision_number is % after the second save, expected 3', v_rev; END IF;

  SELECT pg_catalog.md5(pg_catalog.string_agg(rv.id::text||rv.content_hash, '|' ORDER BY rv.revision_number))
    INTO v_prev FROM public.report_versions rv WHERE rv.report_id=v_report AND rv.revision_number<=2;
  IF v_prev IS DISTINCT FROM v_snapshot THEN RAISE EXCEPTION 'FAIL T7I-37: an earlier version changed'; END IF;

  PERFORM public.report_update_checklist(v_report, v_lv, v_ver, true, true, true);
  SELECT x.status, x.lock_version INTO v_st, v_lv
    FROM public.report_trainer_approve(v_report, v_st, v_lv, v_ver, v_hash) x;
  PERFORM pg_temp.as_management();
  SELECT x.status, x.lock_version, x.correction_request_id INTO v_st, v_lv, v_cr
    FROM public.report_management_return_to_trainer(v_report, v_lv, v_ver,'assessment_fact',NULL,'Fix.') x;
  PERFORM pg_temp.as_trainer();
  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.content_hash
    INTO v_st, v_lv, v_ver, v_rev, v_hash
    FROM public.report_save_edit(v_report,'needs_edit',v_lv,v_ver,'v4','B','C','D') x;
  IF v_rev <> 4 THEN RAISE EXCEPTION 'FAIL T7I-37: the correction version is revision %, expected 4', v_rev; END IF;

  -- Dense and strictly increasing, one checklist row per trainer version,
  -- exactly one report_version.created event per version.
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_versions WHERE report_id=v_report;
  IF v_n <> 4 THEN RAISE EXCEPTION 'FAIL T7I-37: % versions exist, expected 4', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_checklist_progress cp
    JOIN public.report_versions rv ON rv.id=cp.report_version_id WHERE rv.report_id=v_report;
  IF v_n <> 4 THEN RAISE EXCEPTION 'FAIL T7I-37: % checklist rows exist, expected one per trainer version (4)', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.audit_events WHERE action='report_version.created';
  IF v_n <> 4 THEN RAISE EXCEPTION 'FAIL T7I-37: % report_version.created events, expected exactly one per version (4)', v_n; END IF;
  RAISE NOTICE 'PASS T7I-37';
END $t$;
ROLLBACK;

-- T7I-43  Two-event ordering at T3, T6 and T12; T5 and T9 emit only
--         report_version.created; child rows equal payload related_targets
--         in order.
BEGIN;
DO $t$
DECLARE
  v_report uuid; v_lv int; v_ver uuid; v_rev int; v_hash text; v_st public.report_status;
  v_a record; v_b record; v_n bigint; v_wh text; v_cr uuid; v_bad bigint;
BEGIN
  v_report := pg_temp.setup('T3');
  -- T3 emitted report_version.created (n) then report.state_changed (n+1).
  SELECT * INTO v_a FROM public.audit_events WHERE action='report_version.created' ORDER BY seq_no LIMIT 1;
  SELECT * INTO v_b FROM public.audit_events WHERE action='report.state_changed' AND state_to='draft_ready' ORDER BY seq_no LIMIT 1;
  IF v_b.seq_no <> v_a.seq_no + 1 THEN RAISE EXCEPTION 'FAIL T7I-43: T3 events are not consecutive'; END IF;
  IF v_b.prev_hash IS DISTINCT FROM v_a.entry_hash THEN RAISE EXCEPTION 'FAIL T7I-43: T3 events are not hash-linked'; END IF;
  IF v_a.state_domain IS NOT NULL OR v_a.state_from IS NOT NULL OR v_a.state_to IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL T7I-43: report_version.created carries a non-NULL state triple';
  END IF;
  IF v_b.state_domain IS NULL OR v_b.state_from IS NULL OR v_b.state_to IS NULL THEN
    RAISE EXCEPTION 'FAIL T7I-43: the state-change event carries an incomplete state triple';
  END IF;
  IF v_a.payload->>'report_version_id' <> v_b.payload->>'report_version_id' THEN
    RAISE EXCEPTION 'FAIL T7I-43: the two T3 events do not resolve to the same version';
  END IF;

  -- T5 emits report_version.created and NO state-change event.
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  SELECT pg_catalog.count(*) INTO v_n FROM public.audit_events;
  PERFORM pg_temp.as_trainer();
  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.content_hash
    INTO v_st, v_lv, v_ver, v_rev, v_hash
    FROM public.report_save_edit(v_report,'draft_ready',v_lv,v_ver,'v2','B','C','D') x;
  IF pg_temp.chain_len() <> v_n + 1 THEN RAISE EXCEPTION 'FAIL T7I-43: T5 appended more than one event'; END IF;
  IF (SELECT e.action FROM public.audit_events e ORDER BY e.seq_no DESC LIMIT 1) <> 'report_version.created' THEN
    RAISE EXCEPTION 'FAIL T7I-43: T5''s single event is not report_version.created';
  END IF;

  -- T9 also emits exactly one report_version.created and no state change.
  PERFORM public.report_update_checklist(v_report, v_lv, v_ver, true, true, true);
  SELECT x.status, x.lock_version INTO v_st, v_lv
    FROM public.report_trainer_approve(v_report, v_st, v_lv, v_ver, v_hash) x;
  PERFORM pg_temp.as_management();
  v_wh := pg_temp.whash(v_ver);
  SELECT pg_catalog.count(*) INTO v_n FROM public.audit_events;
  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.wording_hash
    INTO v_st, v_lv, v_ver, v_rev, v_wh
    FROM public.report_management_edit_wording(v_report, v_lv, v_ver, v_wh,'m1','m2','m3','m4') x;
  IF pg_temp.chain_len() <> v_n + 1 THEN RAISE EXCEPTION 'FAIL T7I-43: T9 appended more than one event'; END IF;
  IF (SELECT e.action FROM public.audit_events e ORDER BY e.seq_no DESC LIMIT 1) <> 'report_version.created' THEN
    RAISE EXCEPTION 'FAIL T7I-43: T9''s single event is not report_version.created';
  END IF;

  -- Every event's audit_event_targets child rows equal its payload
  -- related_targets array, in order.
  SELECT pg_catalog.count(*) INTO v_bad FROM public.audit_events e
   WHERE (SELECT pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
                   'target_type', t.target_type,
                   'target_id',   CASE WHEN t.target_id IS NULL THEN NULL ELSE t.target_id::text END,
                   'target_label',t.target_label) ORDER BY t.ordinal)
            FROM public.audit_event_targets t WHERE t.event_id = e.id)
         IS DISTINCT FROM
         (CASE WHEN pg_catalog.jsonb_array_length(e.payload->'related_targets') = 0
               THEN NULL ELSE e.payload->'related_targets' END);
  IF v_bad <> 0 THEN
    RAISE EXCEPTION 'FAIL T7I-43: % event(s) have child target rows that differ from their payload related_targets', v_bad;
  END IF;
  RAISE NOTICE 'PASS T7I-43 (T3 ordering, T5/T9 single-event, child-row projection)';
END $t$;
ROLLBACK;

-- T7I-47  RPC-1 structural guards.
BEGIN;
DO $t$
DECLARE v_e text; v_con text; v_n bigint;
BEGIN
  PERFORM pg_temp.as_trainer();

  -- (a) an enrolment with is_active = false -- R-9a, which the FK cannot express.
  UPDATE public.enrolments SET is_active=false, withdrawn_at=pg_catalog.now()
   WHERE id='c6000000-0000-4000-8000-000000000001';
  v_e := pg_temp.errcode($q$ SELECT public.report_create(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001',
    'c9000000-0000-4000-8000-000000000001') $q$);
  IF v_e <> 'BC016' THEN RAISE EXCEPTION 'FAIL T7I-47: an inactive enrolment gave %, expected BC016', v_e; END IF;
  UPDATE public.enrolments SET is_active=true, withdrawn_at=NULL
   WHERE id='c6000000-0000-4000-8000-000000000001';

  -- (b) p_observation_id IS NULL.
  v_e := pg_temp.errcode($q$ SELECT public.report_create(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001', NULL) $q$);
  IF v_e <> 'BC025' THEN RAISE EXCEPTION 'FAIL T7I-47: a NULL observation gave %, expected BC025', v_e; END IF;

  -- (c) an observation belonging to a DIFFERENT (session, student) pair,
  --     rejected by reports_observation_fk BY CONSTRAINT NAME. This is
  --     deliberately not pre-checked in the RPC: the composite FK is the
  --     proof, and its name is what this test asserts.
  INSERT INTO public.class_sessions (id, centre_id, class_module_id, session_date, starts_at, ends_at)
  VALUES ('c5000000-0000-4000-8000-0000000000fe','b0000000-0000-4000-8000-000000000001',
          'c4000000-0000-4000-8000-000000000001','2026-02-05','10:00','11:00');
  INSERT INTO public.observations (id, centre_id, class_session_id, class_module_id, student_id,
                                   enrolment_id, trainer_membership_id)
  VALUES ('c9000000-0000-4000-8000-0000000000fe','b0000000-0000-4000-8000-000000000001',
          'c5000000-0000-4000-8000-0000000000fe','c4000000-0000-4000-8000-000000000001',
          'c2000000-0000-4000-8000-000000000001','c6000000-0000-4000-8000-000000000001',
          'c1000000-0000-4000-8000-000000000002');
  v_con := pg_temp.constraint_of($q$ SELECT public.report_create(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001',
    'c9000000-0000-4000-8000-0000000000fe') $q$);
  IF v_con <> 'reports_observation_fk' THEN
    RAISE EXCEPTION 'FAIL T7I-47: a foreign-session observation fired "%", expected reports_observation_fk', v_con;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM public.reports;
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-47: % report row(s) were left behind', v_n; END IF;
  IF pg_temp.chain_len() <> 0 THEN RAISE EXCEPTION 'FAIL T7I-47: a rejected create appended an audit event'; END IF;
  RAISE NOTICE 'PASS T7I-47';
END $t$;
ROLLBACK;

-- T7I-49  A stored-hash anomaly is DISTINCT from a caller mismatch.
BEGIN;
DO $t$
DECLARE v_report uuid; v_lv int; v_ver uuid; v_hash text; v_e text; v_chain bigint; v_wh text;
BEGIN
  v_report := pg_temp.setup('T3C');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  SELECT rv.content_hash INTO v_hash FROM public.report_versions rv WHERE rv.id=v_ver;
  v_chain := pg_temp.chain_len();

  -- Desynchronise the stored hash from the version's content.
  UPDATE public.report_versions SET content_hash = pg_catalog.repeat('d',64) WHERE id=v_ver;
  PERFORM pg_temp.as_trainer();
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_trainer_approve(%L,''draft_ready''::public.report_status,%s,%L,''%s'')',
    v_report, v_lv, v_ver, pg_catalog.repeat('d',64)));
  IF v_e <> 'BC007' THEN RAISE EXCEPTION 'FAIL T7I-49: RPC-8 gave % for a desynchronised stored hash, expected BC007', v_e; END IF;
  IF 'BC007' = 'BC006' OR 'BC007' = 'BC008' THEN
    RAISE EXCEPTION 'FAIL T7I-49: the data-integrity code collides with a caller-mismatch code';
  END IF;
  IF (SELECT pg_catalog.count(*) FROM public.report_version_approvals) <> 0 THEN
    RAISE EXCEPTION 'FAIL T7I-49: an approval row was written on a data-integrity anomaly';
  END IF;
  IF pg_temp.chain_len() <> v_chain THEN RAISE EXCEPTION 'FAIL T7I-49: a data-integrity anomaly appended an event'; END IF;
END $t$;
ROLLBACK;

BEGIN;
DO $t$
DECLARE v_report uuid; v_lv int; v_ver uuid; v_e text; v_wh text;
BEGIN
  v_report := pg_temp.setup('T9');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  v_wh := pg_temp.whash(v_ver);
  UPDATE public.report_versions SET content_hash = pg_catalog.repeat('e',64) WHERE id=v_ver;
  PERFORM pg_temp.as_management();
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_management_approve_and_submit(%L,%s,%L,%L)', v_report, v_lv, v_ver, v_wh));
  IF v_e <> 'BC007' THEN RAISE EXCEPTION 'FAIL T7I-49: RPC-11 gave % for a desynchronised stored hash, expected BC007', v_e; END IF;
  RAISE NOTICE 'PASS T7I-49 (RPC-8 and RPC-11)';
END $t$;
ROLLBACK;

-- T7I-50  Version authorship is always attributed, with the right role.
BEGIN;
DO $t$
DECLARE v_report uuid; v_n bigint;
BEGIN
  v_report := pg_temp.setup('T11');
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_versions rv
   WHERE rv.report_id=v_report
     AND (rv.authored_by_membership_id IS NULL OR rv.authored_by_role IS NULL);
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-50: % version(s) carry a NULL authored_by pair', v_n; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM public.report_versions rv
   WHERE rv.report_id=v_report AND rv.authored_by_role='trainer'
     AND rv.authored_by_membership_id <> 'c1000000-0000-4000-8000-000000000002';
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-50: a trainer-authored version names the wrong membership'; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_versions rv
   WHERE rv.report_id=v_report AND rv.authored_by_role='management'
     AND rv.authored_by_membership_id <> 'c1000000-0000-4000-8000-000000000001';
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-50: a management-authored version names the wrong membership'; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_versions rv
   WHERE rv.report_id=v_report AND rv.authored_by_role='management';
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-50: expected exactly one management-authored version, found %', v_n; END IF;

  -- The composite FK proves each membership genuinely holds the stamped role.
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_versions rv
    JOIN public.centre_memberships m
      ON m.id = rv.authored_by_membership_id AND m.centre_id = rv.centre_id AND m.role = rv.authored_by_role
   WHERE rv.report_id=v_report;
  IF v_n <> (SELECT pg_catalog.count(*) FROM public.report_versions WHERE report_id=v_report) THEN
    RAISE EXCEPTION 'FAIL T7I-50: an authorship stamp is not backed by a membership holding that role';
  END IF;

  -- Submission is management-only after the A-040 narrowing.
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_versions rv
   WHERE rv.report_id=v_report AND rv.submitted_by_role IS NOT NULL AND rv.submitted_by_role <> 'management';
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-50: a version was submitted by a non-management role'; END IF;
  RAISE NOTICE 'PASS T7I-50';
END $t$;
ROLLBACK;

-- T7I-53  Return-to-trainer contract.
BEGIN;
DO $t$
DECLARE
  v_report uuid; v_lv int; v_ver uuid; v_cr uuid; v_e text; v_n bigint; v_con text;
  v_before record; v_after record; v_st public.report_status; v_reason text;
  v_ev record; v_hits bigint;
BEGIN
  v_reason := 'The Body rating does not match the observation notes for this session.';
  v_report := pg_temp.setup('T7');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  SELECT rv.todays_strength, rv.content_hash, rv.updated_at INTO v_before
    FROM public.report_versions rv WHERE rv.id=v_ver;
  PERFORM pg_temp.as_management();

  -- Argument gates.
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_management_return_to_trainer(%L,%s,%L,''rating''::public.correction_issue_scope,NULL,%L)', v_report, v_lv, v_ver, v_reason));
  IF v_e <> 'BC022' THEN RAISE EXCEPTION 'FAIL T7I-53: a rating scope without a dimension gave %, expected BC022', v_e; END IF;
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_management_return_to_trainer(%L,%s,%L,''observation''::public.correction_issue_scope,''body''::public.dimension_code,%L)', v_report, v_lv, v_ver, v_reason));
  IF v_e <> 'BC022' THEN RAISE EXCEPTION 'FAIL T7I-53: a non-rating scope WITH a dimension gave %, expected BC022', v_e; END IF;
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_management_return_to_trainer(%L,%s,%L,''observation''::public.correction_issue_scope,NULL,''   '')', v_report, v_lv, v_ver));
  IF v_e <> 'BC022' THEN RAISE EXCEPTION 'FAIL T7I-53: a blank reason gave %, expected BC022', v_e; END IF;
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_management_return_to_trainer(%L,%s,%L,''observation''::public.correction_issue_scope,NULL,%L)',
    v_report, v_lv, v_ver, pg_catalog.repeat('x', 2001)));
  IF v_e <> 'BC022' THEN RAISE EXCEPTION 'FAIL T7I-53: a 2001-character reason gave %, expected BC022', v_e; END IF;

  SELECT x.status, x.lock_version, x.correction_request_id INTO v_st, v_lv, v_cr
    FROM public.report_management_return_to_trainer(v_report, v_lv, v_ver,'rating','body',v_reason) x;
  IF v_st <> 'needs_edit' THEN RAISE EXCEPTION 'FAIL T7I-53: the return did not reach needs_edit'; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM public.report_correction_requests cr
   WHERE cr.id=v_cr AND cr.status='open' AND cr.issue_scope='rating' AND cr.dimension_code='body'
     AND cr.reason=v_reason AND cr.requester_role='management'
     AND cr.requested_by_membership_id='c1000000-0000-4000-8000-000000000001'
     AND cr.report_version_id=v_ver AND cr.requested_at IS NOT NULL;
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-53: the correction request does not carry the ratified shape'; END IF;

  -- A second open request is rejected -- by the authored gate through the
  -- RPC, and by the partial unique index BY NAME on a raw insert.
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_management_return_to_trainer(%L,%s,%L,''observation''::public.correction_issue_scope,NULL,%L)', v_report, v_lv, v_ver, v_reason));
  IF v_e <> 'BC004' AND v_e <> 'BC023' THEN
    RAISE EXCEPTION 'FAIL T7I-53: a second return gave %, expected BC004 or BC023', v_e;
  END IF;
  v_con := pg_temp.constraint_of(pg_catalog.format($q$
    INSERT INTO public.report_correction_requests
      (centre_id, report_id, report_version_id, issue_scope, reason,
       requested_by_membership_id, requester_role, status)
    VALUES ('b0000000-0000-4000-8000-000000000001',%L,%L,'observation','r',
            'c1000000-0000-4000-8000-000000000001','management','open') $q$, v_report, v_ver));
  IF v_con <> 'report_correction_requests_one_open_per_report_idx' THEN
    RAISE EXCEPTION 'FAIL T7I-53: a second open request fired "%", expected the partial unique index', v_con;
  END IF;

  -- No version created; the canonical pointer unchanged; the source version
  -- and its approval row byte-identical.
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_versions WHERE report_id=v_report;
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-53: the return created a version (% exist)', v_n; END IF;
  IF (SELECT r.latest_submitted_version_id FROM public.reports r WHERE r.id=v_report) IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL T7I-53: the return moved latest_submitted_version_id';
  END IF;
  SELECT rv.todays_strength, rv.content_hash, rv.updated_at INTO v_after
    FROM public.report_versions rv WHERE rv.id=v_ver;
  IF v_before IS DISTINCT FROM v_after THEN RAISE EXCEPTION 'FAIL T7I-53: the trainer-approved source version changed'; END IF;

  -- Exactly one state-change event, with the ratified shape, and THE REASON
  -- TEXT APPEARS NOWHERE in the event, its payload, its canonical form or
  -- its child rows.
  SELECT * INTO v_ev FROM public.audit_events
   WHERE state_from='trainer_approved' AND state_to='needs_edit';
  IF v_ev.id IS NULL THEN RAISE EXCEPTION 'FAIL T7I-53: no return state-change event exists'; END IF;
  IF v_ev.payload->>'correction_request_id' <> v_cr::text
     OR v_ev.payload->>'issue_scope' <> 'rating'
     OR v_ev.payload->>'dimension_code' <> 'body' THEN
    RAISE EXCEPTION 'FAIL T7I-53: the return payload is not as ratified';
  END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.audit_event_targets t
   WHERE t.event_id=v_ev.id AND t.target_type='report_correction_request'
     AND t.target_id=v_cr AND t.target_label='Correction request';
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-53: the correction request is not a related target'; END IF;
  SELECT pg_catalog.count(*) INTO v_hits FROM public.audit_events e
   WHERE pg_catalog.strpos(e.payload::text, v_reason) > 0
      OR pg_catalog.strpos(e.payload_canonical, v_reason) > 0
      OR pg_catalog.strpos(COALESCE(e.target_label,''), v_reason) > 0;
  IF v_hits <> 0 THEN RAISE EXCEPTION 'FAIL T7I-53: the correction reason leaked into % audit event(s)', v_hits; END IF;
  SELECT pg_catalog.count(*) INTO v_hits FROM public.audit_event_targets t
   WHERE pg_catalog.strpos(t.target_label, v_reason) > 0;
  IF v_hits <> 0 THEN RAISE EXCEPTION 'FAIL T7I-53: the correction reason leaked into an audit child row'; END IF;
  RAISE NOTICE 'PASS T7I-53';
END $t$;
ROLLBACK;

-- T7I-55 / T7I-72  Trainer reapproval loop run TWICE, and correction-request
--         resolution proven IMMUTABLE across cycles.
BEGIN;
DO $t$
DECLARE
  v_report uuid; v_lv int; v_ver uuid; v_rev int; v_hash text; v_st public.report_status;
  v_cr1 uuid; v_cr2 uuid; v_wh text; v_first record; v_after record; v_n bigint; v_at timestamptz;
  v_cycle int;
BEGIN
  v_report := pg_temp.setup('T7');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;

  FOR v_cycle IN 1..2 LOOP
    PERFORM pg_temp.as_management();
    SELECT x.status, x.lock_version, x.correction_request_id INTO v_st, v_lv, v_cr2
      FROM public.report_management_return_to_trainer(v_report, v_lv, v_ver,
        'rating','body', pg_catalog.format('Cycle %s correction.', v_cycle)) x;
    IF v_cycle = 1 THEN v_cr1 := v_cr2; END IF;

    PERFORM pg_temp.as_trainer();
    SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.content_hash
      INTO v_st, v_lv, v_ver, v_rev, v_hash
      FROM public.report_save_edit(v_report,'needs_edit',v_lv,v_ver,
        pg_catalog.format('corrected %s', v_cycle),'B','C','D') x;

    -- The nine snapshots are RE-COPIED from the CURRENT observation_ratings.
    SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_ratings rvr
      JOIN public.observation_ratings orr
        ON orr.dimension_code = rvr.dimension_code AND orr.rating = rvr.rating
     WHERE rvr.report_version_id = v_ver AND orr.observation_id='c9000000-0000-4000-8000-000000000001';
    IF v_n <> 9 THEN RAISE EXCEPTION 'FAIL T7I-55: the correction version does not carry the nine current ratings'; END IF;

    SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_checklist_progress
     WHERE report_version_id=v_ver AND NOT evidence_confirmed AND NOT ai_draft_reviewed AND NOT privacy_checked;
    IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-55: the correction version has no fresh all-false checklist row'; END IF;

    PERFORM public.report_update_checklist(v_report, v_lv, v_ver, true, true, true);
    SELECT x.status, x.lock_version INTO v_st, v_lv
      FROM public.report_trainer_approve(v_report, v_st, v_lv, v_ver, v_hash) x;
    IF v_st <> 'trainer_approved' THEN RAISE EXCEPTION 'FAIL T7I-55: cycle % reapproval failed', v_cycle; END IF;

    SELECT cr.status, cr.resolved_at, cr.resolved_by_membership_id, cr.resolver_role, cr.resolving_version_id
      INTO v_after FROM public.report_correction_requests cr WHERE cr.id=v_cr2;
    IF v_after.status <> 'resolved' OR v_after.resolving_version_id <> v_ver
       OR v_after.resolver_role <> 'trainer'
       OR v_after.resolved_by_membership_id <> 'c1000000-0000-4000-8000-000000000002' THEN
      RAISE EXCEPTION 'FAIL T7I-55: cycle % did not resolve its request correctly', v_cycle;
    END IF;

    IF v_cycle = 1 THEN
      SELECT cr.status, cr.resolved_at, cr.resolved_by_membership_id, cr.resolver_role, cr.resolving_version_id
        INTO v_first FROM public.report_correction_requests cr WHERE cr.id=v_cr1;
    END IF;

    -- Management reviews again and submits (cycle 1), or leaves it approved.
    IF v_cycle = 1 THEN
      PERFORM pg_temp.as_management();
      v_wh := pg_temp.whash(v_ver);
      SELECT x.status, x.lock_version, x.submitted_version_id, x.submitted_at
        INTO v_st, v_lv, v_ver, v_at
        FROM public.report_management_approve_and_submit(v_report, v_lv, v_ver, v_wh) x;
      IF v_st <> 'submitted' THEN RAISE EXCEPTION 'FAIL T7I-55: cycle 1 did not publish'; END IF;
      PERFORM pg_temp.as_trainer();
      SELECT x.status, x.lock_version, x.report_version_id, x.revision_number
        INTO v_st, v_lv, v_ver, v_rev FROM public.report_reopen_submitted(v_report, v_lv) x;
      PERFORM public.report_update_checklist(v_report, v_lv, v_ver, true, true, true);
      SELECT rv.content_hash INTO v_hash FROM public.report_versions rv WHERE rv.id=v_ver;
      SELECT x.status, x.lock_version INTO v_st, v_lv
        FROM public.report_trainer_approve(v_report, 'needs_edit', v_lv, v_ver, v_hash) x;
    END IF;
  END LOOP;

  -- T7I-72: the FIRST request is byte-identical to its post-cycle-1 values.
  SELECT cr.status, cr.resolved_at, cr.resolved_by_membership_id, cr.resolver_role, cr.resolving_version_id
    INTO v_after FROM public.report_correction_requests cr WHERE cr.id=v_cr1;
  IF v_after IS DISTINCT FROM v_first THEN
    RAISE EXCEPTION 'FAIL T7I-72: a later cycle re-resolved, re-dated or re-pointed a CLOSED correction request';
  END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_correction_requests WHERE report_id=v_report;
  IF v_n <> 2 THEN RAISE EXCEPTION 'FAIL T7I-72: % correction rows exist, expected exactly 2', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_correction_requests WHERE report_id=v_report AND status='open';
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-72: % request(s) remain open after both cycles', v_n; END IF;
  RAISE NOTICE 'PASS T7I-55, T7I-72';
END $t$;
ROLLBACK;

-- T7I-57  Trainer-approval lineage is MANDATORY for submission.
BEGIN;
DO $t$
DECLARE
  v_report uuid; v_lv int; v_ver uuid; v_decoy uuid; v_e text; v_chain bigint; v_wh text;
BEGIN
  v_report := pg_temp.setup('T7');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  v_chain := pg_temp.chain_len();

  -- Drive a decoy version into the candidate pointer WITHOUT a trainer
  -- approval and WITHOUT a trainer-approved source.
  INSERT INTO public.report_versions (report_id, centre_id, revision_number,
      todays_strength, next_focus, practice_suggestion, session_takeaway,
      authored_by_membership_id, authored_by_role, content_hash, content_hash_version)
  VALUES (v_report,'b0000000-0000-4000-8000-000000000001', 99,'d1','d2','d3','d4',
          'c1000000-0000-4000-8000-000000000002','trainer', pg_catalog.repeat('f',64), 1)
  RETURNING id INTO v_decoy;
  UPDATE public.reports SET current_cycle_version_id = v_decoy, lock_version = lock_version + 1
   WHERE id = v_report;
  SELECT r.lock_version INTO v_lv FROM public.reports r WHERE r.id=v_report;
  v_wh := pg_temp.whash(v_decoy);

  PERFORM pg_temp.as_management();
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_management_approve_and_submit(%L,%s,%L,%L)', v_report, v_lv, v_decoy, v_wh));
  IF v_e <> 'BC009' THEN RAISE EXCEPTION 'FAIL T7I-57: an unbacked version gave %, expected BC009', v_e; END IF;

  -- RPC-9 refuses for the same reason: no source, no edit.
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_management_edit_wording(%L,%s,%L,%L,''a'',''b'',''c'',''d'')', v_report, v_lv, v_decoy, v_wh));
  IF v_e <> 'BC009' THEN RAISE EXCEPTION 'FAIL T7I-57: RPC-9 on an unbacked version gave %, expected BC009', v_e; END IF;

  IF (SELECT pg_catalog.count(*) FROM public.report_version_approvals WHERE approver_role='management') <> 0
     OR (SELECT r.latest_submitted_version_id FROM public.reports r WHERE r.id=v_report) IS NOT NULL
     OR pg_temp.chain_len() <> v_chain THEN
    RAISE EXCEPTION 'FAIL T7I-57: the lineage rejection left residue';
  END IF;
  RAISE NOTICE 'PASS T7I-57';
END $t$;
ROLLBACK;

-- T7I-58  Rating parity at submission.
BEGIN;
DO $t$
DECLARE v_report uuid; v_lv int; v_ver uuid; v_wh text; v_e text;
BEGIN
  v_report := pg_temp.setup('T9');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  v_wh := pg_temp.whash(v_ver);

  -- A decoy snapshot mutation on the FINAL version only.
  UPDATE public.report_version_ratings
     SET rating = CASE WHEN rating = 'mastering' THEN 'mastered'::public.competency_rating
                       ELSE 'mastering'::public.competency_rating END
   WHERE report_version_id = v_ver AND dimension_code = 'body';

  PERFORM pg_temp.as_management();
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_management_approve_and_submit(%L,%s,%L,%L)', v_report, v_lv, v_ver, v_wh));
  IF v_e <> 'BC010' THEN RAISE EXCEPTION 'FAIL T7I-58: a parity break gave %, expected BC010', v_e; END IF;
  IF 'BC010' = 'BC007' OR 'BC010' = 'BC009' OR 'BC010' = 'BC008' THEN
    RAISE EXCEPTION 'FAIL T7I-58: the parity code collides with the hash or lineage codes';
  END IF;
  IF (SELECT pg_catalog.count(*) FROM public.report_version_approvals WHERE approver_role='management') <> 0 THEN
    RAISE EXCEPTION 'FAIL T7I-58: a parity break still wrote a management approval';
  END IF;
  RAISE NOTICE 'PASS T7I-58';
END $t$;
ROLLBACK;

-- T7I-59  Approval provenance, BOTH published shapes.
BEGIN;
DO $t$
DECLARE v_report uuid; v_lv int; v_ver uuid; v_wh text; v_st public.report_status; v_at timestamptz; v_n bigint;
BEGIN
  -- (a) Management approves UNCHANGED: one version carries BOTH rows.
  v_report := pg_temp.setup('T7');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  PERFORM pg_temp.as_management();
  v_wh := pg_temp.whash(v_ver);
  SELECT x.status, x.lock_version, x.submitted_version_id, x.submitted_at INTO v_st, v_lv, v_ver, v_at
    FROM public.report_management_approve_and_submit(v_report, v_lv, v_ver, v_wh) x;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_approvals
   WHERE report_version_id=v_ver AND approver_role='trainer';
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-59(a): trainer rows = %, expected 1', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_approvals
   WHERE report_version_id=v_ver AND approver_role='management';
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-59(a): management rows = %, expected 1', v_n; END IF;
END $t$;
ROLLBACK;

BEGIN;
DO $t$
DECLARE
  v_report uuid; v_lv int; v_ver uuid; v_src uuid; v_wh text; v_st public.report_status;
  v_at timestamptz; v_n bigint;
BEGIN
  -- (b) Management EDITS WORDING: V carries only a trainer row and V' only a
  --     management row. NEITHER version carries both, and this is the
  --     EXPECTED outcome, not a defect. The zero counts are asserted
  --     explicitly, so a fabricated or copied trainer approval on V' fails.
  v_report := pg_temp.setup('T9');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  SELECT rv.trainer_approved_source_version_id INTO v_src FROM public.report_versions rv WHERE rv.id=v_ver;
  PERFORM pg_temp.as_management();
  v_wh := pg_temp.whash(v_ver);
  SELECT x.status, x.lock_version, x.submitted_version_id, x.submitted_at INTO v_st, v_lv, v_ver, v_at
    FROM public.report_management_approve_and_submit(v_report, v_lv, v_ver, v_wh) x;

  SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_approvals
   WHERE report_version_id=v_src AND approver_role='trainer';
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-59(b): source trainer rows = %, expected 1', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_approvals
   WHERE report_version_id=v_src AND approver_role='management';
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-59(b): source management rows = %, expected 0', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_approvals
   WHERE report_version_id=v_ver AND approver_role='trainer';
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-59(b): the submitted descendant carries % FABRICATED trainer row(s), expected 0', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_approvals
   WHERE report_version_id=v_ver AND approver_role='management';
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-59(b): descendant management rows = %, expected 1', v_n; END IF;

  -- The management row's checklist columns are EVIDENCE copied from the
  -- trainer-approved source's trainer approval row -- a true fact.
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_approvals m
    JOIN public.report_version_approvals t
      ON t.report_version_id = v_src AND t.approver_role='trainer'
   WHERE m.report_version_id = v_ver AND m.approver_role='management'
     AND m.checklist_evidence_confirmed = t.checklist_evidence_confirmed
     AND m.checklist_ai_draft_reviewed  = t.checklist_ai_draft_reviewed
     AND m.checklist_privacy_checked    = t.checklist_privacy_checked;
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-59(b): the management row does not carry the source''s checklist evidence'; END IF;
  RAISE NOTICE 'PASS T7I-59 (both published shapes)';
END $t$;
ROLLBACK;

-- T7I-60  Lineage columns are distinct and correct, after T3 -> T5 -> T7 -> T9 -> T9.
BEGIN;
DO $t$
DECLARE
  v_report uuid; v_lv int; v_v1 uuid; v_v2 uuid; v_v3 uuid; v_v4 uuid;
  v_rev int; v_hash text; v_wh text; v_st public.report_status; v_n bigint; v_con text;
BEGIN
  v_report := pg_temp.setup('T3');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_v1 FROM public.reports r WHERE r.id=v_report;
  PERFORM pg_temp.as_trainer();
  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.content_hash
    INTO v_st, v_lv, v_v2, v_rev, v_hash
    FROM public.report_save_edit(v_report,'draft_ready',v_lv,v_v1,'t2','B','C','D') x;
  PERFORM public.report_update_checklist(v_report, v_lv, v_v2, true, true, true);
  SELECT x.status, x.lock_version INTO v_st, v_lv
    FROM public.report_trainer_approve(v_report, v_st, v_lv, v_v2, v_hash) x;

  PERFORM pg_temp.as_management();
  v_wh := pg_temp.whash(v_v2);
  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.wording_hash
    INTO v_st, v_lv, v_v3, v_rev, v_wh
    FROM public.report_management_edit_wording(v_report, v_lv, v_v2, v_wh,'m1','m2','m3','m4') x;
  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.wording_hash
    INTO v_st, v_lv, v_v4, v_rev, v_wh
    FROM public.report_management_edit_wording(v_report, v_lv, v_v3, v_wh,'n1','n2','n3','n4') x;

  -- derived_from_version_id forms the IMMEDIATE-PREDECESSOR chain.
  IF (SELECT rv.derived_from_version_id FROM public.report_versions rv WHERE rv.id=v_v1) IS NOT NULL
     OR (SELECT rv.derived_from_version_id FROM public.report_versions rv WHERE rv.id=v_v2) <> v_v1
     OR (SELECT rv.derived_from_version_id FROM public.report_versions rv WHERE rv.id=v_v3) <> v_v2
     OR (SELECT rv.derived_from_version_id FROM public.report_versions rv WHERE rv.id=v_v4) <> v_v3 THEN
    RAISE EXCEPTION 'FAIL T7I-60: derived_from_version_id is not the immediate-predecessor chain';
  END IF;

  -- trainer_approved_source_version_id is NULL on every TRAINER version and
  -- equals the SAME trainer-approved root on BOTH management versions --
  -- not the intermediate management version.
  IF (SELECT rv.trainer_approved_source_version_id FROM public.report_versions rv WHERE rv.id=v_v1) IS NOT NULL
     OR (SELECT rv.trainer_approved_source_version_id FROM public.report_versions rv WHERE rv.id=v_v2) IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL T7I-60: a trainer version carries a trainer-approved source';
  END IF;
  IF (SELECT rv.trainer_approved_source_version_id FROM public.report_versions rv WHERE rv.id=v_v3) <> v_v2
     OR (SELECT rv.trainer_approved_source_version_id FROM public.report_versions rv WHERE rv.id=v_v4) <> v_v2 THEN
    RAISE EXCEPTION 'FAIL T7I-60: the second wording edit drifted off the trainer-approved root';
  END IF;

  -- The not-self CHECK and the same-report composite FKs, proven BY NAME.
  v_con := pg_temp.constraint_of(pg_catalog.format(
    'UPDATE public.report_versions SET derived_from_version_id = id WHERE id = %L', v_v4));
  IF v_con <> 'report_versions_not_derived_from_self_chk' THEN
    RAISE EXCEPTION 'FAIL T7I-60: a self-derivation fired "%", expected report_versions_not_derived_from_self_chk', v_con;
  END IF;
  v_con := pg_temp.constraint_of(pg_catalog.format(
    'UPDATE public.report_versions SET trainer_approved_source_version_id = %L WHERE id = %L',
    '00000000-0000-4000-8000-000000000000', v_v4));
  IF v_con <> 'report_versions_trainer_approved_source_fk' THEN
    RAISE EXCEPTION 'FAIL T7I-60: a foreign trainer-approved source fired "%", expected report_versions_trainer_approved_source_fk', v_con;
  END IF;
  RAISE NOTICE 'PASS T7I-60';
END $t$;
ROLLBACK;

-- T7I-68  Wording-hash mismatch, BOTH management operations, and a second
--         leg proving the guard is not redundant with CAS.
BEGIN;
DO $t$
DECLARE
  v_report uuid; v_lv int; v_ver uuid; v_wh text; v_e text; v_chain bigint; v_n bigint;
BEGIN
  v_report := pg_temp.setup('T7');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  v_chain := pg_temp.chain_len();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_versions WHERE report_id=v_report;
  PERFORM pg_temp.as_management();

  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_management_edit_wording(%L,%s,%L,''%s'',''a'',''b'',''c'',''d'')',
    v_report, v_lv, v_ver, pg_catalog.repeat('9',64)));
  IF v_e <> 'BC008' THEN RAISE EXCEPTION 'FAIL T7I-68: RPC-9 with a wrong wording hash gave %, expected BC008', v_e; END IF;
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_management_approve_and_submit(%L,%s,%L,''%s'')',
    v_report, v_lv, v_ver, pg_catalog.repeat('9',64)));
  IF v_e <> 'BC008' THEN RAISE EXCEPTION 'FAIL T7I-68: RPC-11 with a wrong wording hash gave %, expected BC008', v_e; END IF;
  IF 'BC008' = 'BC006' OR 'BC008' = 'BC007' OR 'BC008' = 'BC003' OR 'BC008' = 'BC009' THEN
    RAISE EXCEPTION 'FAIL T7I-68: the wording-mismatch code is not distinct';
  END IF;
  IF (SELECT pg_catalog.count(*) FROM public.report_versions WHERE report_id=v_report) <> v_n
     OR (SELECT pg_catalog.count(*) FROM public.report_version_approvals WHERE approver_role='management') <> 0
     OR (SELECT r.latest_submitted_version_id FROM public.reports r WHERE r.id=v_report) IS NOT NULL
     OR (SELECT r.lock_version FROM public.reports r WHERE r.id=v_report) <> v_lv
     OR pg_temp.chain_len() <> v_chain THEN
    RAISE EXCEPTION 'FAIL T7I-68: a wording-hash rejection left residue';
  END IF;

  -- Second leg: the SAME current version id, but altered stored panels. CAS
  -- passes and ONLY the wording hash catches the stale render.
  v_wh := pg_temp.whash(v_ver);
  UPDATE public.report_versions SET todays_strength = 'silently changed' WHERE id = v_ver;
  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_management_approve_and_submit(%L,%s,%L,%L)', v_report, v_lv, v_ver, v_wh));
  IF v_e <> 'BC007' AND v_e <> 'BC008' THEN
    RAISE EXCEPTION 'FAIL T7I-68: an altered stored panel with a valid CAS gave %, expected a hash guard to fire', v_e;
  END IF;
  RAISE NOTICE 'PASS T7I-68';
END $t$;
ROLLBACK;

-- T7I-71  Trainer reaffirmation after a return (R-7b).
BEGIN;
DO $t$
DECLARE
  v_report uuid; v_lv int; v_ver uuid; v_rev int; v_hash text; v_st public.report_status;
  v_cr uuid; v_e text; v_chain bigint; v_srchash text; v_newver uuid; v_n bigint; v_other uuid;
BEGIN
  v_report := pg_temp.setup('T10');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  SELECT cr.id INTO v_cr FROM public.report_correction_requests cr WHERE cr.report_id=v_report AND cr.status='open';
  SELECT rv.content_hash INTO v_srchash FROM public.report_versions rv WHERE rv.id=v_ver;
  v_chain := pg_temp.chain_len();
  PERFORM pg_temp.as_trainer();

  -- A SILENT byte-identical save is rejected.
  v_e := pg_temp.errcode(pg_catalog.format($q$
    SELECT public.report_save_edit(%L,'needs_edit'::public.report_status,%s,%L,
      'Spoke clearly and held eye contact','Vary pace when excited',
      'Practice reading aloud for five minutes','A confident session') $q$, v_report, v_lv, v_ver));
  IF v_e <> 'BC021' THEN RAISE EXCEPTION 'FAIL T7I-71: a silent byte-identical save gave %, expected BC021', v_e; END IF;
  IF pg_temp.chain_len() <> v_chain THEN RAISE EXCEPTION 'FAIL T7I-71: the rejected save appended an event'; END IF;
  IF (SELECT pg_catalog.count(*) FROM public.report_versions WHERE report_id=v_report) <> 1 THEN
    RAISE EXCEPTION 'FAIL T7I-71: the rejected save created a version';
  END IF;

  -- A reaffirmation id naming a RESOLVED request is rejected...
  INSERT INTO public.report_correction_requests
    (id, centre_id, report_id, report_version_id, issue_scope, reason,
     requested_by_membership_id, requester_role, status, resolved_at,
     resolved_by_membership_id, resolver_role, resolving_version_id)
  VALUES (gen_random_uuid(),'b0000000-0000-4000-8000-000000000001', v_report, v_ver,
          'observation','already handled','c1000000-0000-4000-8000-000000000001','management',
          'resolved', pg_catalog.now(),'c1000000-0000-4000-8000-000000000002','trainer', v_ver)
  RETURNING id INTO v_other;
  v_e := pg_temp.errcode(pg_catalog.format($q$
    SELECT public.report_save_edit(%L,'needs_edit'::public.report_status,%s,%L,
      'Spoke clearly and held eye contact','Vary pace when excited',
      'Practice reading aloud for five minutes','A confident session',%L) $q$, v_report, v_lv, v_ver, v_other));
  IF v_e <> 'BC021' THEN RAISE EXCEPTION 'FAIL T7I-71: a RESOLVED reaffirmation id gave %, expected BC021', v_e; END IF;

  -- ...and so is one naming a request belonging to ANOTHER report.
  v_e := pg_temp.errcode(pg_catalog.format($q$
    SELECT public.report_save_edit(%L,'needs_edit'::public.report_status,%s,%L,
      'Spoke clearly and held eye contact','Vary pace when excited',
      'Practice reading aloud for five minutes','A confident session',%L) $q$,
      v_report, v_lv, v_ver, '00000000-0000-4000-8000-000000000000'));
  IF v_e <> 'BC021' THEN RAISE EXCEPTION 'FAIL T7I-71: a foreign reaffirmation id gave %, expected BC021', v_e; END IF;

  -- With the OPEN request named, the reaffirmation SUCCEEDS: a new immutable
  -- version whose content_hash EQUALS the source's -- legitimately, because
  -- no uniqueness constraint exists on content_hash.
  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.content_hash
    INTO v_st, v_lv, v_newver, v_rev, v_hash
    FROM public.report_save_edit(v_report,'needs_edit',v_lv,v_ver,
      'Spoke clearly and held eye contact','Vary pace when excited',
      'Practice reading aloud for five minutes','A confident session', v_cr) x;
  IF v_hash IS DISTINCT FROM v_srchash THEN
    RAISE EXCEPTION 'FAIL T7I-71: the reaffirmation version''s hash does not equal the source''s';
  END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_checklist_progress
   WHERE report_version_id=v_newver AND NOT evidence_confirmed AND NOT ai_draft_reviewed AND NOT privacy_checked;
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-71: the reaffirmation version has no fresh all-false checklist row'; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.audit_events e
   WHERE e.action='report_version.created' AND e.payload->>'reaffirmed_correction_request_id' = v_cr::text;
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-71: the version-created payload does not carry reaffirmed_correction_request_id'; END IF;

  -- T7 then approves it and resolves the request with resolving_version_id
  -- = the reaffirmation version.
  PERFORM public.report_update_checklist(v_report, v_lv, v_newver, true, true, true);
  SELECT x.status, x.lock_version INTO v_st, v_lv
    FROM public.report_trainer_approve(v_report, v_st, v_lv, v_newver, v_hash) x;
  IF (SELECT cr.resolving_version_id FROM public.report_correction_requests cr WHERE cr.id=v_cr) <> v_newver THEN
    RAISE EXCEPTION 'FAIL T7I-71: the reaffirmation is not durably linked through resolving_version_id';
  END IF;
  RAISE NOTICE 'PASS T7I-71';
END $t$;
ROLLBACK;

-- T7I-71 (final negative leg): a NULL reaffirmation id with CHANGED content
-- needs none, and is accepted.
BEGIN;
DO $t$
DECLARE v_report uuid; v_lv int; v_ver uuid; v_rev int; v_hash text; v_st public.report_status;
BEGIN
  v_report := pg_temp.setup('T10');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  PERFORM pg_temp.as_trainer();
  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.content_hash
    INTO v_st, v_lv, v_ver, v_rev, v_hash
    FROM public.report_save_edit(v_report,'needs_edit',v_lv,v_ver,'genuinely changed','B','C','D') x;
  IF v_st <> 'draft_ready' THEN RAISE EXCEPTION 'FAIL T7I-71: a changed save needing no reaffirmation was rejected'; END IF;
END $t$;
ROLLBACK;

-- T7I-69  Post-submission correction cycle through to REPUBLICATION.
--         Path: T11 -> T12 -> RPC-7 -> T8 -> T9 -> T11, and T6 IS
--         DELIBERATELY ABSENT: T6 would commit needs_edit -> draft_ready and
--         supersede the very clone T8 needs, leaving T8 with neither its
--         origin status nor its target version. The T12 clone is the ONE
--         version for which needs_edit -> trainer_approved is reachable, so
--         this is the only test that exercises T8 positively.
BEGIN;
DO $t$
DECLARE
  v_report uuid; v_lv int; v_clone uuid; v_first uuid; v_firstrow record;
  v_st public.report_status; v_rev int; v_hash text; v_wh text; v_mgmt uuid;
  v_final uuid; v_at timestamptz; v_n bigint; v_e1 record; v_e2 record; v_firstap text;
BEGIN
  v_report := pg_temp.setup('T11');
  SELECT r.latest_submitted_version_id, r.lock_version INTO v_first, v_lv FROM public.reports r WHERE r.id=v_report;
  SELECT rv.todays_strength, rv.next_focus, rv.practice_suggestion, rv.session_takeaway,
         rv.content_hash, rv.submitted_at, rv.submitted_by_membership_id, rv.submitted_by_role
    INTO v_firstrow FROM public.report_versions rv WHERE rv.id=v_first;
  SELECT pg_catalog.md5(pg_catalog.string_agg(ap.approver_role::text||ap.approved_at::text, '|' ORDER BY ap.approver_role::text))
    INTO v_firstap FROM public.report_version_approvals ap WHERE ap.report_version_id=v_first;

  -- (1) T12: a fresh TRAINER-owned clone, canonical pointer unmoved.
  PERFORM pg_temp.as_trainer();
  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number
    INTO v_st, v_lv, v_clone, v_rev FROM public.report_reopen_submitted(v_report, v_lv) x;
  IF v_st <> 'needs_edit' THEN RAISE EXCEPTION 'FAIL T7I-69(1): status is %, expected needs_edit', v_st; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_versions rv
   WHERE rv.id=v_clone AND rv.derived_from_version_id=v_first AND rv.authored_by_role='trainer'
     AND rv.content_hash=v_firstrow.content_hash AND rv.submitted_at IS NULL;
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-69(1): the clone is not the ratified shape'; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_approvals WHERE report_version_id=v_clone;
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-69(1): the clone carries an approval row'; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_ratings WHERE report_version_id=v_clone;
  IF v_n <> 9 THEN RAISE EXCEPTION 'FAIL T7I-69(1): the clone carries % snapshots, expected 9', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_checklist_progress
   WHERE report_version_id=v_clone AND NOT evidence_confirmed AND NOT ai_draft_reviewed AND NOT privacy_checked;
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-69(1): the clone has no fresh all-false checklist row'; END IF;
  IF (SELECT r.latest_submitted_version_id FROM public.reports r WHERE r.id=v_report) <> v_first THEN
    RAISE EXCEPTION 'FAIL T7I-69(1): the canonical pointer moved on reopen';
  END IF;

  -- (2) RPC-7 completes the clone's checklist -- legal because the status is
  --     needs_edit, Gate A passes (no approval row) and Gate B passes (the
  --     clone is trainer-authored) -- VALIDATING but NOT bumping lock_version.
  PERFORM public.report_update_checklist(v_report, v_lv, v_clone, true, true, true);
  IF (SELECT r.lock_version FROM public.reports r WHERE r.id=v_report) <> v_lv THEN
    RAISE EXCEPTION 'FAIL T7I-69(2): the checklist write bumped lock_version';
  END IF;

  -- (3) T8 approves THAT EXACT CLONE: needs_edit -> trainer_approved.
  SELECT rv.content_hash INTO v_hash FROM public.report_versions rv WHERE rv.id=v_clone;
  SELECT x.status, x.lock_version INTO v_st, v_lv
    FROM public.report_trainer_approve(v_report, 'needs_edit', v_lv, v_clone, v_hash) x;
  IF v_st <> 'trainer_approved' THEN RAISE EXCEPTION 'FAIL T7I-69(3): T8 did not reach trainer_approved'; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_approvals
   WHERE report_version_id=v_clone AND approver_role='trainer'
     AND checklist_evidence_confirmed AND checklist_ai_draft_reviewed AND checklist_privacy_checked;
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-69(3): the clone''s trainer approval row is not the ratified shape'; END IF;

  -- (4) T9 creates a wording-only management descendant of the clone.
  PERFORM pg_temp.as_management();
  v_wh := pg_temp.whash(v_clone);
  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.wording_hash
    INTO v_st, v_lv, v_mgmt, v_rev, v_wh
    FROM public.report_management_edit_wording(v_report, v_lv, v_clone, v_wh,'r1','r2','r3','r4') x;
  IF v_st <> 'trainer_approved' THEN RAISE EXCEPTION 'FAIL T7I-69(4): the status left trainer_approved'; END IF;
  IF (SELECT rv.trainer_approved_source_version_id FROM public.report_versions rv WHERE rv.id=v_mgmt) <> v_clone THEN
    RAISE EXCEPTION 'FAIL T7I-69(4): the descendant does not name the clone as its trainer-approved source';
  END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_checklist_progress WHERE report_version_id=v_mgmt;
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-69(4): the management descendant carries a checklist row'; END IF;

  -- (5) The second T11 republishes atomically.
  SELECT x.status, x.lock_version, x.submitted_version_id, x.submitted_at
    INTO v_st, v_lv, v_final, v_at
    FROM public.report_management_approve_and_submit(v_report, v_lv, v_mgmt, v_wh) x;
  IF v_st <> 'submitted' OR v_final <> v_mgmt THEN RAISE EXCEPTION 'FAIL T7I-69(5): republication failed'; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_versions rv
   WHERE rv.id=v_final AND rv.submitted_at IS NOT NULL
     AND rv.submitted_by_membership_id='c1000000-0000-4000-8000-000000000001'
     AND rv.submitted_by_role='management';
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-69(5): the write-once submission metadata is not as ratified'; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.audit_events
   WHERE state_from='trainer_approved' AND state_to='approved';
  IF v_n <> 2 THEN RAISE EXCEPTION 'FAIL T7I-69(5): % trainer_approved->approved events across two publications, expected 2', v_n; END IF;

  -- (6) The FIRST submitted version is byte-identical to its post-first-T11
  --     values -- the write-once rule holds across a SECOND publication,
  --     which no other test exercises.
  IF (SELECT ROW(rv.todays_strength, rv.next_focus, rv.practice_suggestion, rv.session_takeaway,
                 rv.content_hash, rv.submitted_at, rv.submitted_by_membership_id, rv.submitted_by_role)
        FROM public.report_versions rv WHERE rv.id=v_first)
     IS DISTINCT FROM ROW(v_firstrow.todays_strength, v_firstrow.next_focus, v_firstrow.practice_suggestion,
                          v_firstrow.session_takeaway, v_firstrow.content_hash, v_firstrow.submitted_at,
                          v_firstrow.submitted_by_membership_id, v_firstrow.submitted_by_role) THEN
    RAISE EXCEPTION 'FAIL T7I-69(6): the first submitted version changed during republication';
  END IF;
  IF (SELECT pg_catalog.md5(pg_catalog.string_agg(ap.approver_role::text||ap.approved_at::text, '|' ORDER BY ap.approver_role::text))
        FROM public.report_version_approvals ap WHERE ap.report_version_id=v_first)
     IS DISTINCT FROM v_firstap THEN
    RAISE EXCEPTION 'FAIL T7I-69(6): the first submitted version''s approval rows changed';
  END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_ratings WHERE report_version_id=v_first;
  IF v_n <> 9 THEN RAISE EXCEPTION 'FAIL T7I-69(6): the first version''s snapshots changed'; END IF;

  -- (7) RPC-13 now returns the NEW canonical version to parent and management.
  PERFORM pg_temp.as_parent();
  IF (SELECT c.todays_strength FROM public.report_get_canonical(
        'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001') c) <> 'r1' THEN
    RAISE EXCEPTION 'FAIL T7I-69(7): the parent does not read the republished version';
  END IF;
  PERFORM pg_temp.as_management();
  IF (SELECT c.todays_strength FROM public.report_get_canonical(
        'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001') c) <> 'r1' THEN
    RAISE EXCEPTION 'FAIL T7I-69(7): management does not read the republished version';
  END IF;
  IF NOT (SELECT ok FROM public.audit_verify_chain('b0000000-0000-4000-8000-000000000001', NULL, NULL)) THEN
    RAISE EXCEPTION 'FAIL T7I-69: the chain does not verify after republication';
  END IF;
  RAISE NOTICE 'PASS T7I-69';
END $t$;
ROLLBACK;

-- =====================================================================
-- SECTION 3 -- Authorization, visibility and non-disclosure
-- =====================================================================

-- T7I-24  Management and trainer authorization boundary.
--         RPC-4 is NOT in the authored-error list: it holds ZERO client
--         EXECUTE, so under SET ROLE authenticated it fails with a
--         PRIVILEGE denial -- asserted separately in section 1.
BEGIN;
DO $t$
DECLARE v_report uuid; v_lv int; v_ver uuid; v_hash text; v_wh text; v_e text; v_n bigint;
        v_st public.report_status; v_at timestamptz;
BEGIN
  v_report := pg_temp.setup('T7');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  SELECT rv.content_hash INTO v_hash FROM public.report_versions rv WHERE rv.id=v_ver;

  -- A MANAGEMENT context is denied on every CLIENT-CALLABLE trainer RPC.
  PERFORM pg_temp.as_management();
  FOREACH v_e IN ARRAY ARRAY[
    pg_catalog.format($q$SELECT public.report_create('c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','c9000000-0000-4000-8000-000000000001')$q$),
    pg_catalog.format('SELECT public.report_mark_observation_saved(%L,%s)', v_report, v_lv),
    pg_catalog.format('SELECT public.report_request_draft(%L,%s)', v_report, v_lv),
    pg_catalog.format('SELECT public.report_cancel_draft(%L,%s)', v_report, v_lv),
    pg_catalog.format('SELECT public.report_save_edit(%L,''draft_ready''::public.report_status,%s,%L,''a'',''b'',''c'',''d'')', v_report, v_lv, v_ver),
    pg_catalog.format('SELECT public.report_update_checklist(%L,%s,%L,true,true,true)', v_report, v_lv, v_ver),
    pg_catalog.format('SELECT public.report_trainer_approve(%L,''draft_ready''::public.report_status,%s,%L,%L)', v_report, v_lv, v_ver, v_hash),
    pg_catalog.format('SELECT public.report_reopen_submitted(%L,%s)', v_report, v_lv)
  ] LOOP
    IF pg_temp.errcode(v_e) <> 'BC001' THEN
      RAISE EXCEPTION 'FAIL T7I-24: a management context was not denied by: %', v_e;
    END IF;
  END LOOP;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_working(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-24: RPC-14 returned % row(s) to management', v_n; END IF;

  -- Management SUCCEEDS on RPC-15 at trainer_approved.
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_management_review(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-24: RPC-15 returned % row(s) to management at trainer_approved', v_n; END IF;

  -- A TRAINER context is denied on every management RPC, and RPC-15 gives
  -- the trainer the zero-row outcome.
  PERFORM pg_temp.as_trainer();
  v_wh := pg_temp.whash(v_ver);
  FOREACH v_e IN ARRAY ARRAY[
    pg_catalog.format('SELECT public.report_management_edit_wording(%L,%s,%L,%L,''a'',''b'',''c'',''d'')', v_report, v_lv, v_ver, v_wh),
    pg_catalog.format('SELECT public.report_management_return_to_trainer(%L,%s,%L,''observation''::public.correction_issue_scope,NULL,''r'')', v_report, v_lv, v_ver),
    pg_catalog.format('SELECT public.report_management_approve_and_submit(%L,%s,%L,%L)', v_report, v_lv, v_ver, v_wh)
  ] LOOP
    IF pg_temp.errcode(v_e) <> 'BC001' THEN
      RAISE EXCEPTION 'FAIL T7I-24: a trainer context was not denied by: %', v_e;
    END IF;
  END LOOP;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_management_review(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-24: RPC-15 returned % row(s) to a trainer', v_n; END IF;

  -- Management and trainer both SUCCEED on RPC-13 once submitted.
  PERFORM pg_temp.as_management();
  SELECT x.status, x.lock_version, x.submitted_version_id, x.submitted_at INTO v_st, v_lv, v_ver, v_at
    FROM public.report_management_approve_and_submit(v_report, v_lv, v_ver, pg_temp.whash(v_ver)) x;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_canonical(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-24: management cannot read the submitted canonical report'; END IF;
  PERFORM pg_temp.as_trainer();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_canonical(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-24: the assigned trainer cannot read the submitted canonical report'; END IF;
  RAISE NOTICE 'PASS T7I-24';
END $t$;
ROLLBACK;

-- T7I-67  COMPLETE LINKED-PARENT DENIAL MATRIX.
--         Under the fixture parent's OWN JWT -- a parent legitimately linked
--         to the target student, so every RELATIONSHIP check in the system
--         passes -- each of RPC-1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 14 and 15
--         must fail. RPC-14 IS THE HIGHEST-VALUE TARGET: its shape carries
--         the nine rating snapshots, the content_hash and the open correction
--         reason, so the ROLE predicate is the only barrier between a linked
--         parent and the caught rating-grid leak.
BEGIN;
DO $t$
DECLARE v_report uuid; v_lv int; v_ver uuid; v_hash text; v_wh text; v_e text; v_n bigint;
        v_st public.report_status; v_at timestamptz; v_chain bigint; v_versions bigint;
BEGIN
  v_report := pg_temp.setup('T7');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  SELECT rv.content_hash INTO v_hash FROM public.report_versions rv WHERE rv.id=v_ver;
  v_wh := pg_temp.whash(v_ver);
  v_chain := pg_temp.chain_len();
  SELECT pg_catalog.count(*) INTO v_versions FROM public.report_versions;

  PERFORM pg_temp.as_parent();
  EXECUTE 'SET LOCAL ROLE authenticated';
  FOREACH v_e IN ARRAY ARRAY[
    $q$SELECT public.report_create('c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','c9000000-0000-4000-8000-000000000001')$q$,
    pg_catalog.format('SELECT public.report_mark_observation_saved(%L,%s)', v_report, v_lv),
    pg_catalog.format('SELECT public.report_request_draft(%L,%s)', v_report, v_lv),
    pg_catalog.format('SELECT public.report_cancel_draft(%L,%s)', v_report, v_lv),
    pg_catalog.format('SELECT public.report_save_edit(%L,''draft_ready''::public.report_status,%s,%L,''a'',''b'',''c'',''d'')', v_report, v_lv, v_ver),
    pg_catalog.format('SELECT public.report_update_checklist(%L,%s,%L,true,true,true)', v_report, v_lv, v_ver),
    pg_catalog.format('SELECT public.report_trainer_approve(%L,''draft_ready''::public.report_status,%s,%L,%L)', v_report, v_lv, v_ver, v_hash),
    pg_catalog.format('SELECT public.report_management_edit_wording(%L,%s,%L,%L,''a'',''b'',''c'',''d'')', v_report, v_lv, v_ver, v_wh),
    pg_catalog.format('SELECT public.report_management_return_to_trainer(%L,%s,%L,''observation''::public.correction_issue_scope,NULL,''r'')', v_report, v_lv, v_ver),
    pg_catalog.format('SELECT public.report_management_approve_and_submit(%L,%s,%L,%L)', v_report, v_lv, v_ver, v_wh),
    pg_catalog.format('SELECT public.report_reopen_submitted(%L,%s)', v_report, v_lv)
  ] LOOP
    IF pg_temp.errcode(v_e) <> 'BC001' THEN
      RAISE EXCEPTION 'FAIL T7I-67: a LINKED parent was not denied by: %', v_e;
    END IF;
  END LOOP;

  -- RPC-14 and RPC-15: the zero-row outcome, identical to absence.
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_working(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-67: RPC-14 returned % row(s) to a LINKED parent -- the rating grid, the content hash and the correction reason are exposed', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_management_review(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-67: RPC-15 returned % row(s) to a linked parent', v_n; END IF;

  -- RPC-4 is a PRIVILEGE denial, not an authored role error.
  IF pg_temp.errcode(pg_catalog.format(
       'SELECT public.report_store_draft(%L,%s,1,''a'',''b'',''c'',''d'')', v_report, v_lv)) <> '42501' THEN
    RAISE EXCEPTION 'FAIL T7I-67: RPC-4 under a parent session was not a privilege denial';
  END IF;

  -- Back to the owner context before reading the residue: `authenticated`
  -- holds ZERO SELECT on the report family, which is itself the point.
  RESET ROLE;
  IF pg_temp.chain_len() <> v_chain
     OR (SELECT pg_catalog.count(*) FROM public.report_versions) <> v_versions
     OR (SELECT r.lock_version FROM public.reports r WHERE r.id=v_report) <> v_lv THEN
    RAISE EXCEPTION 'FAIL T7I-67: a parent attempt wrote something';
  END IF;
  RAISE NOTICE 'PASS T7I-67 (13 authored denials + the RPC-4 privilege denial)';
END $t$;
ROLLBACK;

-- T7I-25 / T7I-54  Parent boundary, and a returned report stays invisible.
BEGIN;
DO $t$
DECLARE
  v_report uuid; v_lv int; v_ver uuid; v_wh text; v_n bigint; v_st public.report_status;
  v_at timestamptz; v_before record; v_after record; v_res text;
BEGIN
  v_report := pg_temp.setup('T3C');
  PERFORM pg_temp.as_parent();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_canonical(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-25: a parent reached a PRE-SUBMISSION report'; END IF;

  -- Trainer-approved: still nothing.
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  PERFORM pg_temp.as_trainer();
  PERFORM public.report_trainer_approve(v_report,'draft_ready',v_lv,v_ver,
    (SELECT rv.content_hash FROM public.report_versions rv WHERE rv.id=v_ver));
  PERFORM pg_temp.as_parent();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_canonical(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-25: a parent reached a TRAINER-APPROVED, unsubmitted report'; END IF;

  -- T7I-54 leg 1: a NEVER-SUBMITTED report after a return still resolves to
  -- nothing, and NOTHING in the result discloses that a correction cycle is
  -- underway.
  SELECT r.lock_version INTO v_lv FROM public.reports r WHERE r.id=v_report;
  PERFORM pg_temp.as_management();
  PERFORM public.report_management_return_to_trainer(v_report, v_lv, v_ver,'observation',NULL,'Returned.');
  PERFORM pg_temp.as_parent();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_canonical(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-54: a parent reached a RETURNED report'; END IF;
END $t$;
ROLLBACK;

BEGIN;
DO $t$
DECLARE
  v_report uuid; v_lv int; v_ver uuid; v_n bigint; v_before record; v_after record;
  v_st public.report_status; v_rev int; v_hash text;
BEGIN
  -- T7I-54 leg 2: a PREVIOUSLY SUBMITTED report still resolves to its
  -- previous canonical version, BYTE-IDENTICAL, after a reopen and a return.
  v_report := pg_temp.setup('T11');
  PERFORM pg_temp.as_parent();
  SELECT c.todays_strength, c.next_focus, c.practice_suggestion, c.session_takeaway, c.submitted_at
    INTO v_before FROM public.report_get_canonical(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001') c;

  SELECT r.lock_version INTO v_lv FROM public.reports r WHERE r.id=v_report;
  PERFORM pg_temp.as_trainer();
  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number
    INTO v_st, v_lv, v_ver, v_rev FROM public.report_reopen_submitted(v_report, v_lv) x;

  PERFORM pg_temp.as_parent();
  SELECT c.todays_strength, c.next_focus, c.practice_suggestion, c.session_takeaway, c.submitted_at
    INTO v_after FROM public.report_get_canonical(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001') c;
  IF v_before IS DISTINCT FROM v_after THEN
    RAISE EXCEPTION 'FAIL T7I-54: a parent-observable field changed when the correction cycle began';
  END IF;

  -- The return shape carries no ratings, notes, approval internals, hash or
  -- revision -- proven from the catalogue in T7I-39 and here by shape.
  RAISE NOTICE 'PASS T7I-25, T7I-54';
END $t$;
ROLLBACK;

-- T7I-26  Unrelated denial: unlinked parent, unrelated trainer, wrong-centre
--         management. Ambiguous membership is proven STRUCTURALLY
--         IMPOSSIBLE rather than merely untested.
BEGIN;
DO $t$
DECLARE v_report uuid; v_lv int; v_ver uuid; v_n bigint; v_e text; v_con text; v_wh text;
BEGIN
  v_report := pg_temp.setup('T11');
  SELECT r.lock_version, r.latest_submitted_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;

  -- Unlinked parent: deactivate the fixture link.
  UPDATE public.parent_student_links SET is_active=false, unlinked_at=pg_catalog.now()
   WHERE id='c3000000-0000-4000-8000-000000000001';
  PERFORM pg_temp.as_parent();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_canonical(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-26: an UNLINKED parent read the canonical report'; END IF;
  UPDATE public.parent_student_links SET is_active=true, unlinked_at=NULL
   WHERE id='c3000000-0000-4000-8000-000000000001';

  -- Unrelated trainer: deactivate the assignment.
  UPDATE public.class_session_assignments SET is_active=false, unassigned_at=pg_catalog.now()
   WHERE class_session_id='c5000000-0000-4000-8000-000000000001';
  PERFORM pg_temp.as_trainer();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_canonical(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-26: an UNASSIGNED trainer read the canonical report'; END IF;
  UPDATE public.class_session_assignments SET is_active=true, unassigned_at=NULL
   WHERE class_session_id='c5000000-0000-4000-8000-000000000001';

  -- Wrong-centre management: move the management account's ONLY active
  -- membership to a decoy centre. R-28 resolves PER CENTRE, so the report's
  -- centre now has no management for this caller.
  INSERT INTO public.centres (id, code, display_name)
  VALUES ('b0000000-0000-4000-8000-0000000000ff','decoy','Decoy Centre');
  UPDATE public.centre_memberships SET status='deactivated', deactivated_at=pg_catalog.now()
   WHERE id='c1000000-0000-4000-8000-000000000001';
  INSERT INTO public.centre_memberships (centre_id, account_id, role, status, activated_at)
  VALUES ('b0000000-0000-4000-8000-0000000000ff','c0000000-0000-4000-8000-000000000001',
          'management','active', pg_catalog.now());
  PERFORM pg_temp.as_management();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_canonical(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-26: WRONG-CENTRE management read the canonical report'; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_management_review(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-26: WRONG-CENTRE management reached RPC-15'; END IF;
  RAISE NOTICE 'PASS T7I-26';
END $t$;
ROLLBACK;

BEGIN;
DO $t$
DECLARE v_con text;
BEGIN
  -- Ambiguous membership is UNREPRESENTABLE: the Step 7E partial unique
  -- indexes reject a second active membership for the same (account, centre)
  -- and a second active management membership for the centre. Proving this
  -- structurally is stronger than an untested "and if it happened" branch.
  v_con := pg_temp.constraint_of($q$
    INSERT INTO public.centre_memberships (centre_id, account_id, role, status, activated_at)
    VALUES ('b0000000-0000-4000-8000-000000000001','c0000000-0000-4000-8000-000000000001',
            'management','active', now()) $q$);
  IF v_con NOT IN ('centre_memberships_one_active_per_account_centre_idx',
                   'centre_memberships_one_active_management_per_centre_idx') THEN
    RAISE EXCEPTION 'FAIL T7I-26: a duplicate active management membership fired "%", expected a partial unique index', v_con;
  END IF;
END $t$;
ROLLBACK;

-- T7I-63  RPC-15 STATUS GATING -- the management pre-submission read.
BEGIN;
DO $t$
DECLARE
  v_stop text; v_status text; v_n bigint; v_row record; v_report uuid;
BEGIN
  -- No report at all: the authored unavailable outcome.
  PERFORM pg_temp.as_management();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_management_review(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-63: RPC-15 returned % row(s) when NO REPORT exists', v_n; END IF;
END $t$;
ROLLBACK;

BEGIN;
DO $t$ DECLARE v_n bigint; BEGIN
  PERFORM pg_temp.setup('T0'); PERFORM pg_temp.as_management();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_management_review(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-63: RPC-15 exposed content at `incomplete`'; END IF;
END $t$; ROLLBACK;
BEGIN;
DO $t$ DECLARE v_n bigint; BEGIN
  PERFORM pg_temp.setup('T1'); PERFORM pg_temp.as_management();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_management_review(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-63: RPC-15 exposed content at `observation_saved`'; END IF;
END $t$; ROLLBACK;
BEGIN;
DO $t$ DECLARE v_n bigint; BEGIN
  PERFORM pg_temp.setup('T2'); PERFORM pg_temp.as_management();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_management_review(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-63: RPC-15 exposed content at `drafting`'; END IF;
END $t$; ROLLBACK;
BEGIN;
DO $t$ DECLARE v_n bigint; BEGIN
  PERFORM pg_temp.setup('T3'); PERFORM pg_temp.as_management();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_management_review(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-63: RPC-15 exposed content at `draft_ready`'; END IF;
END $t$; ROLLBACK;
BEGIN;
DO $t$ DECLARE v_n bigint; BEGIN
  -- THE CRITICAL CASE: `needs_edit` reached the ORDINARY WAY, through a T10
  -- return. current_cycle_version_id names the trainer's live working
  -- version here, and an implementation faithful to the pre-R-32 text would
  -- hand it straight to management.
  PERFORM pg_temp.setup('T10'); PERFORM pg_temp.as_management();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_management_review(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-63: RPC-15 exposed content at `needs_edit` after a return'; END IF;
END $t$; ROLLBACK;

BEGIN;
DO $t$
DECLARE v_row record; v_report uuid; v_lv int; v_ver uuid; v_wh text; v_st public.report_status; v_at timestamptz;
BEGIN
  -- trainer_approved: the candidate shape, WITH a non-NULL wording_hash.
  v_report := pg_temp.setup('T7');
  PERFORM pg_temp.as_management();
  SELECT * INTO v_row FROM public.report_get_management_review(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_row.status <> 'trainer_approved' OR v_row.wording_hash IS NULL
     OR v_row.current_version_id IS NULL OR v_row.lock_version IS NULL
     OR v_row.todays_strength IS NULL THEN
    RAISE EXCEPTION 'FAIL T7I-63: the trainer_approved shape is wrong';
  END IF;
  IF v_row.wording_hash <> pg_temp.whash(v_row.current_version_id) THEN
    RAISE EXCEPTION 'FAIL T7I-63: the returned wording_hash does not describe the candidate''s panels';
  END IF;

  -- submitted: NULL wording_hash, NULL candidate version id, NULL lock_version.
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  SELECT x.status, x.lock_version, x.submitted_version_id, x.submitted_at INTO v_st, v_lv, v_ver, v_at
    FROM public.report_management_approve_and_submit(v_report, v_lv, v_ver, pg_temp.whash(v_ver)) x;
  SELECT * INTO v_row FROM public.report_get_management_review(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_row.status <> 'submitted' OR v_row.wording_hash IS NOT NULL
     OR v_row.current_version_id IS NOT NULL OR v_row.lock_version IS NOT NULL
     OR v_row.submitted_at IS NULL OR v_row.todays_strength IS NULL THEN
    RAISE EXCEPTION 'FAIL T7I-63: the submitted shape is wrong';
  END IF;
  RAISE NOTICE 'PASS T7I-63 (all seven statuses plus the no-report case)';
END $t$;
ROLLBACK;

-- T7I-65  RPC-13 per-role authorization predicates, positive and negative.
BEGIN;
DO $t$
DECLARE v_report uuid; v_n bigint;
BEGIN
  v_report := pg_temp.setup('T11');

  PERFORM pg_temp.as_trainer();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_canonical(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-65: the live-assigned trainer was denied'; END IF;

  PERFORM pg_temp.as_management();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_canonical(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-65: management of the report''s centre was denied'; END IF;

  PERFORM pg_temp.as_parent();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_canonical(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-65: the linked parent was denied'; END IF;

  -- A caller with ZERO membership in the report's centre is denied, and the
  -- denial is the SAME zero-row outcome as absence.
  UPDATE public.centre_memberships SET status='deactivated', deactivated_at=pg_catalog.now()
   WHERE id IN ('c1000000-0000-4000-8000-000000000001','c1000000-0000-4000-8000-000000000002',
                'c1000000-0000-4000-8000-000000000003');
  PERFORM pg_temp.as_trainer();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_canonical(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-65: a caller with zero membership was permitted'; END IF;
END $t$;
ROLLBACK;

BEGIN;
DO $t$
DECLARE v_report uuid; v_n bigint;
BEGIN
  -- With latest_submitted_version_id NULL, ALL THREE ROLES receive the
  -- unavailable outcome: no role can reach a trainer-approved-but-
  -- unsubmitted version, because the resolution path names only the
  -- canonical pointer.
  v_report := pg_temp.setup('T7');
  PERFORM pg_temp.as_trainer();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_canonical(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-65: the trainer reached an unsubmitted version through RPC-13'; END IF;
  PERFORM pg_temp.as_management();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_canonical(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-65: management reached an unsubmitted version through RPC-13'; END IF;
  PERFORM pg_temp.as_parent();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_canonical(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-65: the parent reached an unsubmitted version through RPC-13'; END IF;

  -- A trainer assigned to a DIFFERENT session is denied.
  UPDATE public.class_session_assignments SET is_active=false, unassigned_at=pg_catalog.now()
   WHERE class_session_id='c5000000-0000-4000-8000-000000000001';
  PERFORM pg_temp.as_trainer();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_canonical(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-65: an unassigned trainer was permitted'; END IF;
  RAISE NOTICE 'PASS T7I-65';
END $t$;
ROLLBACK;

-- T7I-70  Unauthenticated and unresolvable callers.
BEGIN;
DO $t$
DECLARE
  v_report uuid; v_lv int; v_ver uuid; v_hash text; v_wh text; v_e text; v_n bigint;
  v_ctx text; v_calls text[];
BEGIN
  v_report := pg_temp.setup('T7');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  SELECT rv.content_hash INTO v_hash FROM public.report_versions rv WHERE rv.id=v_ver;
  v_wh := pg_temp.whash(v_ver);

  v_calls := ARRAY[
    $q$SELECT public.report_create('c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001','c9000000-0000-4000-8000-000000000001')$q$,
    pg_catalog.format('SELECT public.report_mark_observation_saved(%L,%s)', v_report, v_lv),
    pg_catalog.format('SELECT public.report_request_draft(%L,%s)', v_report, v_lv),
    pg_catalog.format('SELECT public.report_cancel_draft(%L,%s)', v_report, v_lv),
    pg_catalog.format('SELECT public.report_save_edit(%L,''draft_ready''::public.report_status,%s,%L,''a'',''b'',''c'',''d'')', v_report, v_lv, v_ver),
    pg_catalog.format('SELECT public.report_update_checklist(%L,%s,%L,true,true,true)', v_report, v_lv, v_ver),
    pg_catalog.format('SELECT public.report_trainer_approve(%L,''draft_ready''::public.report_status,%s,%L,%L)', v_report, v_lv, v_ver, v_hash),
    pg_catalog.format('SELECT public.report_management_edit_wording(%L,%s,%L,%L,''a'',''b'',''c'',''d'')', v_report, v_lv, v_ver, v_wh),
    pg_catalog.format('SELECT public.report_management_return_to_trainer(%L,%s,%L,''observation''::public.correction_issue_scope,NULL,''r'')', v_report, v_lv, v_ver),
    pg_catalog.format('SELECT public.report_management_approve_and_submit(%L,%s,%L,%L)', v_report, v_lv, v_ver, v_wh),
    pg_catalog.format('SELECT public.report_reopen_submitted(%L,%s)', v_report, v_lv)
  ];

  FOREACH v_ctx IN ARRAY ARRAY['NONE','UNKNOWN'] LOOP
    IF v_ctx = 'NONE' THEN
      PERFORM pg_temp.as_nobody();
    ELSE
      PERFORM pg_catalog.set_config('request.jwt.claims',
        '{"sub":"d0000000-0000-4000-8000-0000000000ff","role":"authenticated"}', true);
    END IF;
    EXECUTE 'SET LOCAL ROLE authenticated';
    FOREACH v_e IN ARRAY v_calls LOOP
      IF pg_temp.errcode(v_e) <> 'BC001' THEN
        RAISE EXCEPTION 'FAIL T7I-70 [%]: an unresolvable caller was not denied by: %', v_ctx, v_e;
      END IF;
    END LOOP;
    FOREACH v_e IN ARRAY ARRAY[
      $q$SELECT count(*) FROM public.report_get_canonical('c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001')$q$,
      $q$SELECT count(*) FROM public.report_get_working('c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001')$q$,
      $q$SELECT count(*) FROM public.report_get_management_review('c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001')$q$
    ] LOOP
      EXECUTE v_e INTO v_n;
      IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-70 [%]: a read returned % row(s) to an unresolvable caller', v_ctx, v_n; END IF;
    END LOOP;
    RESET ROLE;
  END LOOP;

  -- audit_append_event's SYSTEM branch rejects every report.* action outright.
  PERFORM pg_temp.as_nobody();
  IF pg_temp.errcode($q$ SELECT public.audit_append_event(
      'b0000000-0000-4000-8000-000000000001', NULL, NULL, NULL,
      'report.created', NULL, NULL, NULL, 'report', NULL, 'Report', NULL, '{}'::jsonb) $q$) = 'OK' THEN
    RAISE EXCEPTION 'FAIL T7I-70: the audit system branch accepted a report.* action';
  END IF;
  RAISE NOTICE 'PASS T7I-70';
END $t$;
ROLLBACK;

-- T7I-62  Audit labels and payloads carry NO DIRECT PII (runtime leg).
BEGIN;
DO $t$
DECLARE
  v_report uuid; v_needle text; v_hits bigint; v_labels text[];
  v_reason CONSTANT text := 'The Body rating does not match the observation record for this session.';
  v_lv int; v_ver uuid; v_st public.report_status; v_rev int; v_hash text; v_wh text; v_at timestamptz;
BEGIN
  -- Drive a FULL two-stage lifecycle including a return, so every emitting
  -- call site of the suite is represented.
  v_report := pg_temp.setup('T7');
  SELECT r.lock_version, r.current_cycle_version_id INTO v_lv, v_ver FROM public.reports r WHERE r.id=v_report;
  PERFORM pg_temp.as_management();
  PERFORM public.report_management_return_to_trainer(v_report, v_lv, v_ver,'rating','body', v_reason);
  SELECT r.lock_version INTO v_lv FROM public.reports r WHERE r.id=v_report;
  PERFORM pg_temp.as_trainer();
  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.content_hash
    INTO v_st, v_lv, v_ver, v_rev, v_hash
    FROM public.report_save_edit(v_report,'needs_edit',v_lv,v_ver,'fixed','B','C','D') x;
  PERFORM public.report_update_checklist(v_report, v_lv, v_ver, true, true, true);
  SELECT x.status, x.lock_version INTO v_st, v_lv
    FROM public.report_trainer_approve(v_report, v_st, v_lv, v_ver, v_hash) x;
  PERFORM pg_temp.as_management();
  v_wh := pg_temp.whash(v_ver);
  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.wording_hash
    INTO v_st, v_lv, v_ver, v_rev, v_wh
    FROM public.report_management_edit_wording(v_report, v_lv, v_ver, v_wh,'p1','p2','p3','p4') x;
  SELECT x.status, x.lock_version, x.submitted_version_id, x.submitted_at INTO v_st, v_lv, v_ver, v_at
    FROM public.report_management_approve_and_submit(v_report, v_lv, v_ver, v_wh) x;
  PERFORM pg_temp.as_trainer();
  PERFORM public.report_reopen_submitted(v_report, v_lv);

  -- Every primary and related target_label is one of the SIX ratified
  -- generic constants.
  SELECT pg_catalog.array_agg(DISTINCT lbl) INTO v_labels FROM (
    SELECT e.target_label AS lbl FROM public.audit_events e
    UNION SELECT t.target_label FROM public.audit_event_targets t) x;
  IF EXISTS (SELECT 1 FROM pg_catalog.unnest(v_labels) AS u(l)
              WHERE u.l NOT IN ('Report','Report version','Student','Class session',
                                'Observation','Correction request')) THEN
    RAISE EXCEPTION 'FAIL T7I-62: a non-generic target_label was emitted: %', v_labels;
  END IF;

  -- No label or payload value matches the fixture student name, any account
  -- name, any email address, or the correction reason.
  FOREACH v_needle IN ARRAY (
    ARRAY['Fixture Student One', v_reason]
    || (SELECT pg_catalog.array_agg(a.display_name) FROM public.accounts a)
    || (SELECT pg_catalog.array_agg(a.normalized_email) FROM public.accounts a))
  LOOP
    SELECT pg_catalog.count(*) INTO v_hits FROM public.audit_events e
     WHERE pg_catalog.strpos(e.payload::text, v_needle) > 0
        OR pg_catalog.strpos(e.payload_canonical, v_needle) > 0
        OR pg_catalog.strpos(e.target_label, v_needle) > 0
        OR pg_catalog.strpos(e.target_type, v_needle) > 0;
    IF v_hits <> 0 THEN RAISE EXCEPTION 'FAIL T7I-62: "%" appears in % audit event(s)', v_needle, v_hits; END IF;
    SELECT pg_catalog.count(*) INTO v_hits FROM public.audit_event_targets t
     WHERE pg_catalog.strpos(t.target_label, v_needle) > 0 OR pg_catalog.strpos(t.target_type, v_needle) > 0;
    IF v_hits <> 0 THEN RAISE EXCEPTION 'FAIL T7I-62: "%" appears in % audit child row(s)', v_needle, v_hits; END IF;
  END LOOP;

  -- An email-shaped value anywhere in a payload is a failure.
  SELECT pg_catalog.count(*) INTO v_hits FROM public.audit_events e
   WHERE e.payload::text ~ '[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}'
      OR e.target_label ~ '[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}';
  IF v_hits <> 0 THEN RAISE EXCEPTION 'FAIL T7I-62: % payload(s) contain an email-shaped value', v_hits; END IF;

  -- PHONE NUMBERS ARE PROVEN UNREACHABLE STRUCTURALLY RATHER THAN BY A
  -- PATTERN SCAN, which is both stronger and honest: a digits-and-hyphens
  -- regex cannot distinguish a phone number from a UUID or a 64-hex content
  -- hash, so it would report a false positive on every payload this design
  -- legitimately emits. The accurate proof is that NO TABLE IN THE SCHEMA
  -- HOLDS A PHONE NUMBER AT ALL, so there is no such value for an audit
  -- payload to carry. If a later checkpoint adds one, this assertion fails
  -- and the scan must be reconsidered deliberately.
  SELECT pg_catalog.count(*) INTO v_hits
    FROM pg_catalog.pg_attribute a
    JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname='public' AND c.relkind='r' AND NOT a.attisdropped AND a.attnum > 0
     AND (a.attname LIKE '%phone%' OR a.attname LIKE '%mobile%' OR a.attname LIKE '%contact_number%');
  IF v_hits <> 0 THEN
    RAISE EXCEPTION 'FAIL T7I-62: % phone-bearing column(s) now exist; the audit PII scan must be re-derived', v_hits;
  END IF;

  -- T7I-32 (runtime leg): payload canonicalization round-trips, and every
  -- UUID string in a payload is lowercase.
  SELECT pg_catalog.count(*) INTO v_hits FROM public.audit_events e
   WHERE e.payload_canonical::jsonb IS DISTINCT FROM e.payload;
  IF v_hits <> 0 THEN RAISE EXCEPTION 'FAIL T7I-32: % event(s) do not round-trip payload_canonical::jsonb = payload', v_hits; END IF;
  -- Lowercase-only is asserted over the WHOLE payload rather than by a UUID
  -- pattern, and that is exact rather than approximate: a Step 7I payload
  -- carries only identifiers, integers, booleans, hex hashes and
  -- closed-vocabulary labels -- never prose -- so any uppercase character
  -- anywhere in it is a normalization defect. (A UUID-shaped regex cannot
  -- express this: the character class that would catch an uppercase hex
  -- digit also matches every decimal digit.)
  -- `related_targets` is EXCLUDED because audit_append_event merges the
  -- ratified generic target LABELS into the payload there, and those are
  -- legitimately capitalized ('Report', 'Class session', ...). Their exact
  -- values are asserted against the six-constant list above, so nothing goes
  -- unchecked -- the two assertions partition the payload between them.
  SELECT pg_catalog.count(*) INTO v_hits FROM public.audit_events e
   WHERE (e.payload - 'related_targets')::text
         <> pg_catalog.lower((e.payload - 'related_targets')::text);
  IF v_hits <> 0 THEN RAISE EXCEPTION 'FAIL T7I-32: % payload(s) contain a non-lowercase identifier or value', v_hits; END IF;
  RAISE NOTICE 'PASS T7I-62, T7I-32 (runtime legs)';
END $t$;
ROLLBACK;

-- =====================================================================
-- SECTION 4 -- Preservation on the CANONICAL database
-- =====================================================================
-- Every test above ran inside a rolled-back decoy, so the assertions below
-- must hold EXACTLY as they did before the suite started. The four R(C)
-- tests are excluded BY CONSTRUCTION -- they run only on the disposable
-- database -- which is precisely what keeps T7I-30's empty-chain proof and
-- the fixture checksum alive.

-- T7I-28  Fixture preservation.
DO $t$
DECLARE v_n bigint; v_domain bigint;
BEGIN
  SELECT pg_catalog.count(*) INTO v_n FROM auth.users;
  IF v_n <> 3 THEN RAISE EXCEPTION 'FAIL T7I-28: % Auth users, expected 3', v_n; END IF;

  SELECT (SELECT pg_catalog.count(*) FROM public.accounts)
       + (SELECT pg_catalog.count(*) FROM public.centre_memberships)
       + (SELECT pg_catalog.count(*) FROM public.trainer_profiles)
       + (SELECT pg_catalog.count(*) FROM public.parent_profiles)
       + (SELECT pg_catalog.count(*) FROM public.students)
       + (SELECT pg_catalog.count(*) FROM public.parent_student_links)
       + (SELECT pg_catalog.count(*) FROM public.class_modules)
       + (SELECT pg_catalog.count(*) FROM public.class_sessions)
       + (SELECT pg_catalog.count(*) FROM public.enrolments)
       + (SELECT pg_catalog.count(*) FROM public.class_session_assignments)
       + (SELECT pg_catalog.count(*) FROM public.attendance)
       + (SELECT pg_catalog.count(*) FROM public.observations)
       + (SELECT pg_catalog.count(*) FROM public.observation_ratings)
    INTO v_domain;
  IF v_domain <> 25 THEN RAISE EXCEPTION 'FAIL T7I-28: % application-domain rows, expected 25', v_domain; END IF;

  IF (SELECT pg_catalog.count(*) FROM public.centres) <> 1
     OR (SELECT pg_catalog.count(*) FROM public.class_grades) <> 3
     OR (SELECT pg_catalog.count(*) FROM public.assessment_dimensions) <> 9 THEN
    RAISE EXCEPTION 'FAIL T7I-28: the Step 7E 1/3/9 seed boundary diverged';
  END IF;

  -- The Option B zero-row boundary, now including the Step 7I table.
  IF (SELECT pg_catalog.count(*) FROM public.reports) <> 0
     OR (SELECT pg_catalog.count(*) FROM public.report_versions) <> 0
     OR (SELECT pg_catalog.count(*) FROM public.report_version_ratings) <> 0
     OR (SELECT pg_catalog.count(*) FROM public.report_version_checklist_progress) <> 0
     OR (SELECT pg_catalog.count(*) FROM public.report_version_approvals) <> 0
     OR (SELECT pg_catalog.count(*) FROM public.report_correction_requests) <> 0
     OR (SELECT pg_catalog.count(*) FROM public.invitations) <> 0 THEN
    RAISE EXCEPTION 'FAIL T7I-28: the suite committed a report-family or invitation row';
  END IF;
  RAISE NOTICE 'PASS T7I-28 (the canonical fixture checksum leg is the reconciled verifier, run separately and twice)';
END $t$;

-- T7I-29  Step 7G preservation.
DO $t$
DECLARE v_n bigint;
BEGIN
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_policies WHERE schemaname='public';
  IF v_n <> 29 THEN RAISE EXCEPTION 'FAIL T7I-29: % policies, expected the 29 Step 7G policies', v_n; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public'
     AND p.proname IN ('app_current_account_id','app_has_active_membership','app_is_own_membership',
                       'app_is_own_active_membership','app_trainer_reaches_session','app_trainer_reaches_module')
     AND p.provolatile='s' AND p.prosecdef
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 6 THEN RAISE EXCEPTION 'FAIL T7I-29: the 6 Step 7G helpers are not byte-unchanged (matched %)', v_n; END IF;

  -- app_parent_reaches_student sits alongside them at ZERO client EXECUTE.
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public' AND p.proname='app_parent_reaches_student'
     AND NOT pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T7I-29: app_parent_reaches_student is not at zero client EXECUTE'; END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.unnest(ARRAY['centres','accounts','centre_memberships','trainer_profiles','parent_profiles',
      'students','parent_student_links','class_grades','class_modules','class_sessions',
      'enrolments','class_session_assignments','attendance']) AS t(tbl)
   WHERE pg_catalog.has_table_privilege('authenticated', ('public.'||t.tbl)::regclass, 'SELECT');
  IF v_n <> 13 THEN RAISE EXCEPTION 'FAIL T7I-29: the 13-table authenticated SELECT set changed (matched %)', v_n; END IF;
  RAISE NOTICE 'PASS T7I-29';
END $t$;

-- T7I-30  Step 7H preservation. THIS PROOF IS EXACTLY WHY THE R(C) TESTS MAY
--         NOT RUN HERE: their committed events would be UNREMOVABLE.
DO $t$
DECLARE v_n bigint; v_ok boolean;
BEGIN
  SELECT pg_catalog.count(*) INTO v_n FROM public.audit_events;
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-30: the committed chain holds % event(s); expected 0', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.audit_event_targets;
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-30: % committed audit child row(s); expected 0', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.audit_chain_heads;
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T7I-30: % committed chain head(s); expected 0', v_n; END IF;

  SELECT ok INTO v_ok FROM public.audit_verify_chain(NULL, NULL, NULL);
  IF v_ok IS NOT NULL AND NOT v_ok THEN
    RAISE EXCEPTION 'FAIL T7I-30: audit_verify_chain complete-mode reports a break';
  END IF;

  -- The 16-action registry is byte-unchanged IN BOTH functions, and Step 7I
  -- extends it by nothing.
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='public' AND p.proname IN ('audit_append_event','audit_verify_chain')
     AND p.prosrc LIKE '%report.created%' AND p.prosrc LIKE '%report_version.created%'
     AND p.prosrc LIKE '%report.state_changed%' AND p.prosrc LIKE '%attendance.changed%'
     AND p.prosrc LIKE '%admin.module_created%' AND p.prosrc LIKE '%admin.session_created%'
     AND p.prosrc LIKE '%admin.trainer_assigned%' AND p.prosrc LIKE '%admin.student_created%'
     AND p.prosrc LIKE '%admin.enrolment_changed%' AND p.prosrc LIKE '%admin.parent_link_changed%'
     AND p.prosrc LIKE '%admin.profile_created%' AND p.prosrc LIKE '%invitation.created%'
     AND p.prosrc LIKE '%invitation.revoked%' AND p.prosrc LIKE '%invitation.reissued%'
     AND p.prosrc LIKE '%membership.role_changed%' AND p.prosrc LIKE '%membership.bootstrap%'
     AND p.prosrc NOT LIKE '%report.correction_requested%';
  IF v_n <> 2 THEN
    RAISE EXCEPTION 'FAIL T7I-30: the 16-action registry is not byte-unchanged in both audit functions (matched %)', v_n;
  END IF;

  -- The three append-only guard triggers are still enabled.
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_trigger t
    JOIN pg_catalog.pg_class c ON c.oid=t.tgrelid
    JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname='public' AND NOT t.tgisinternal AND t.tgenabled='O';
  IF v_n <> 3 THEN RAISE EXCEPTION 'FAIL T7I-30: % enabled audit guard trigger(s), expected 3', v_n; END IF;
  RAISE NOTICE 'PASS T7I-30';
END $t$;

-- Deferred-by-kind proofs, recorded rather than silently dropped.
DO $t$
BEGIN
  RAISE NOTICE 'RECORDED T7I-31: repeatability is a DRIVER-level property -- this suite is run twice back-to-back by run-canonical.mjs and both runs must be identical.';
  RAISE NOTICE 'RECORDED T7I-33: the server-action proof belongs to the server-action checkpoint (Backend Round B2) and is NOT run or claimed here.';
  RAISE NOTICE 'RECORDED T7I-34: UI gates are kind M and belong to later UI checkpoints; their SERVER halves are proven here by T7I-66, T7I-19, T7I-9/T7I-41, T7I-24/T7I-67 and T7I-63.';
  RAISE NOTICE 'RECORDED T7I-15, T7I-16, T7I-46, T7I-61: the four R(C) proofs run on the DISPOSABLE database (run-concurrency.mjs), never here.';
  RAISE NOTICE 'RECORDED T7I-40 and the file-level legs of T7I-2, T7I-20(c), T7I-44, T7I-62 and T7I-73 run in static-scan.mjs.';
END $t$;

\echo '--- Step 7I canonical acceptance suite: COMPLETE ---'






