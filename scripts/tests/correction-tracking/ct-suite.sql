-- =====================================================================
-- B.E.S.T Coach -- management correction-tracking suite (T-CT-1 .. T-CT-20)
-- =====================================================================
-- LOCAL DISPOSABLE DEVELOPMENT DATABASE ONLY.
--
-- This suite drives the fixture report through the REAL governed lifecycle
-- RPCs and COMMITS, which appends real audit events. Step 7H's chain is
-- append-only by trigger and by zero privilege and forbids repair "ever",
-- so running this on the canonical fixture database would permanently move
-- its accepted zero-event state. It therefore runs ONLY on the disposable
-- clone that run-correction-tracking.mjs creates and destroys.
--
-- MANDATORY HARNESS PREREQUISITE, as in the Step 7I suite: every governed
-- RPC and every Step 7G helper fails closed on a NULL auth.uid(), so each
-- leg establishes a JWT identity context first. Identities are the THREE
-- FIXTURE IDENTITIES ONLY -- nothing here inserts into auth.users, and the
-- second-centre decoy is built from an EXISTING account by adding a
-- membership, never by minting a new identity.
--
-- WHAT IS PROVEN HERE:
--   authorization  T-CT-1  T-CT-2  T-CT-3  T-CT-4
--   lifecycle      T-CT-5  T-CT-6  T-CT-7  T-CT-8  T-CT-9  T-CT-10
--   privacy        T-CT-11 T-CT-12 T-CT-13 T-CT-14
--   purity         T-CT-15 T-CT-16 T-CT-17
--   posture        T-CT-18 T-CT-19 T-CT-20
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

-- How many tracking rows does the CURRENT identity see?
CREATE FUNCTION pg_temp.n_tracked() RETURNS bigint LANGUAGE plpgsql AS $$
DECLARE n bigint;
BEGIN
  SELECT pg_catalog.count(*) INTO n FROM public.report_list_management_corrections();
  RETURN n;
END $$;

-- The single tracking row the current identity sees, or NULL.
CREATE FUNCTION pg_temp.tracked()
RETURNS TABLE (
  report_id uuid, student_id uuid, student_display_name text,
  class_session_id uuid, session_date date, report_status public.report_status,
  correction_request_id uuid, issue_scope public.correction_issue_scope,
  correction_reason text, correction_status public.correction_request_status,
  returned_at timestamptz, trainer_correction_submitted boolean,
  tracking_updated_at timestamptz)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.report_list_management_corrections();
END $$;

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

CREATE FUNCTION pg_temp.chain_len() RETURNS bigint LANGUAGE plpgsql AS $$
DECLARE n bigint; BEGIN SELECT pg_catalog.count(*) INTO n FROM public.audit_events; RETURN n; END $$;

CREATE FUNCTION pg_temp.whash(p_version uuid) RETURNS text LANGUAGE plpgsql AS $$
DECLARE v public.report_versions; BEGIN
  SELECT * INTO v FROM public.report_versions WHERE id = p_version;
  RETURN public.report_wording_hash_v1(v.todays_strength, v.next_focus,
                                       v.practice_suggestion, v.session_takeaway);
END $$;

COMMIT;

\echo '--- Management correction-tracking suite ---'

-- =====================================================================
-- SECTION 1 -- Posture, projection boundary and EXECUTE census
-- =====================================================================

-- T-CT-18  The function's contract, re-derived from the catalogue.
DO $t$
DECLARE v_n bigint;
BEGIN
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    JOIN pg_catalog.pg_language l ON l.oid = p.prolang
   WHERE n.nspname = 'public'
     AND p.proname = 'report_list_management_corrections'
     AND pg_catalog.pg_get_userbyid(p.proowner) = 'postgres'
     AND l.lanname = 'plpgsql'
     AND p.prosecdef
     AND p.provolatile = 's'
     AND p.pronargs = 0
     AND p.proconfig::text LIKE '%search_path=%';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'FAIL T-CT-18: the function is not a single postgres-owned STABLE SECURITY DEFINER zero-argument plpgsql function with a pinned search_path';
  END IF;
  RAISE NOTICE 'PASS T-CT-18 (postgres-owned, plpgsql, STABLE, SECURITY DEFINER, zero-argument, search_path pinned)';
END $t$;

-- T-CT-19  EXECUTE posture: authenticated only, and the census is 23.
DO $t$
DECLARE v_n bigint;
BEGIN
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_list_management_corrections'
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE')
     AND NOT pg_catalog.has_function_privilege('anon',          p.oid, 'EXECUTE')
     AND NOT pg_catalog.has_function_privilege('service_role',  p.oid, 'EXECUTE')
     AND NOT pg_catalog.has_function_privilege('authenticator', p.oid, 'EXECUTE')
     AND NOT EXISTS (SELECT 1 FROM pg_catalog.aclexplode(p.proacl) ae WHERE ae.grantee = 0);
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T-CT-19: the EXECUTE posture is not authenticated-only'; END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 23 THEN RAISE EXCEPTION 'FAIL T-CT-19: % authenticated EXECUTE, expected 23', v_n; END IF;

  -- No table privilege and no policy was added to reach the correction row.
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.role_table_grants g
   WHERE g.table_schema = 'public' AND g.table_name = 'report_correction_requests'
     AND g.grantee IN ('PUBLIC','anon','authenticated','service_role','authenticator');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T-CT-19: % client table privilege(s) on report_correction_requests', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_policies WHERE schemaname='public' AND tablename='report_correction_requests';
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T-CT-19: % policy/policies on report_correction_requests', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_policies WHERE schemaname='public';
  IF v_n <> 29 THEN RAISE EXCEPTION 'FAIL T-CT-19: % policies in public, expected the 29 Step 7G policies unchanged', v_n; END IF;

  RAISE NOTICE 'PASS T-CT-19 (authenticated-only EXECUTE, census 23, zero table privileges and zero policies on the correction table, 29 policies unchanged)';
END $t$;

-- T-CT-13  The projection carries EXACTLY the thirteen bounded tracking
-- columns and NO forbidden field. Asserted from the catalogue, so it holds
-- against the APPLIED signature rather than the migration text.
DO $t$
DECLARE
  v_cols text[];
  v_forbidden CONSTANT text[] := ARRAY[
    'todays_strength','next_focus','practice_suggestion','session_takeaway',
    'content_hash','wording_hash','revision','rating','checklist','approval',
    'attendance','evidence','notes','version_id','prompt','response','audit'];
  v_name text;
BEGIN
  SELECT p.proargnames INTO v_cols
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname='public' AND p.proname='report_list_management_corrections';

  IF v_cols IS DISTINCT FROM ARRAY[
       'report_id','student_id','student_display_name','class_session_id',
       'session_date','report_status','correction_request_id','issue_scope',
       'correction_reason','correction_status','returned_at',
       'trainer_correction_submitted','tracking_updated_at'] THEN
    RAISE EXCEPTION 'FAIL T-CT-13: the projection is %, expected exactly the thirteen bounded tracking columns', v_cols;
  END IF;

  FOREACH v_name IN ARRAY v_forbidden LOOP
    IF EXISTS (SELECT 1 FROM pg_catalog.unnest(v_cols) c(x) WHERE c.x LIKE '%'||v_name||'%') THEN
      RAISE EXCEPTION 'FAIL T-CT-13: the projection exposes a forbidden field matching "%"', v_name;
    END IF;
  END LOOP;

  RAISE NOTICE 'PASS T-CT-13 (exactly 13 bounded columns; no rating, observation, attendance, evidence, note, checklist, approval, panel, hash, revision, version-id, AI or audit field)';
END $t$;

-- T-CT-14  The body reads NO version-content, assessment, attendance or
-- audit object, and contains no dynamic SQL and no mutating statement.
-- Comments are stripped first: the body discusses these rules in prose, and
-- a prose mention is not a statement.
DO $t$
DECLARE v_src text;
BEGIN
  SELECT pg_catalog.regexp_replace(p.prosrc, '--[^\n]*', '', 'g') INTO v_src
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname='public' AND p.proname='report_list_management_corrections';

  IF v_src ~ '(public\.report_versions|public\.report_version_ratings|public\.report_version_checklist_progress|public\.report_version_approvals|public\.observations|public\.observation_ratings|public\.attendance|audit_append_event|public\.audit_)' THEN
    RAISE EXCEPTION 'FAIL T-CT-14: the body reads a version-content, assessment, attendance or audit object';
  END IF;
  IF v_src ~* '\mEXECUTE\s+(format|''|"|\$|v_|p_)' THEN
    RAISE EXCEPTION 'FAIL T-CT-14: the body contains dynamic SQL';
  END IF;
  IF v_src ~* '\m(INSERT\s+INTO|UPDATE\s+public\.|DELETE\s+FROM|TRUNCATE|CREATE\s|ALTER\s|DROP\s)' THEN
    RAISE EXCEPTION 'FAIL T-CT-14: the body contains a mutating statement';
  END IF;
  RAISE NOTICE 'PASS T-CT-14 (no version-content/assessment/attendance/audit read, no dynamic SQL, no mutating statement)';
END $t$;

-- T-CT-20  RPC-15's status gate is byte-unchanged: this checkpoint closes
-- U-B2-1 WITHOUT widening the ratified management read.
DO $t$
DECLARE v_n bigint;
BEGIN
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname='public' AND p.proname='report_get_management_review'
     AND p.prosrc LIKE '%v_r.status = ''trainer_approved''%'
     AND p.prosrc LIKE '%v_r.status = ''submitted''%';
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T-CT-20: report_get_management_review''s status gate changed'; END IF;

  -- RPC-15 still has NO correction-reason column at any status.
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
     CROSS JOIN LATERAL pg_catalog.unnest(p.proargnames) c(x)
     WHERE n.nspname='public' AND p.proname='report_get_management_review'
       AND c.x LIKE '%reason%') THEN
    RAISE EXCEPTION 'FAIL T-CT-20: report_get_management_review acquired a reason column';
  END IF;
  RAISE NOTICE 'PASS T-CT-20 (RPC-15 status gate unchanged; still no reason column at any status)';
END $t$;

-- =====================================================================
-- SECTION 2 -- The correction cycle, driven through the governed RPCs
-- =====================================================================

-- T-CT-4  BEFORE any return: a trainer-approved report is NOT presented as
-- a returned correction item. This is the mis-presentation the queue must
-- never make -- "awaiting first review" and "returned for correction" are
-- different work.
DO $t$
DECLARE
  v_report uuid; v_lv int; v_st public.report_status; v_ver uuid;
  v_hash text; v_obs int; v_n bigint;
BEGIN
  PERFORM pg_temp.as_trainer();
  SELECT x.report_id, x.status, x.lock_version INTO v_report, v_st, v_lv
    FROM public.report_create('c5000000-0000-4000-8000-000000000001',
                              'c2000000-0000-4000-8000-000000000001',
                              'c9000000-0000-4000-8000-000000000001') x;
  SELECT x.status, x.lock_version INTO v_st, v_lv
    FROM public.report_mark_observation_saved(v_report, v_lv) x;
  SELECT x.status, x.lock_version, x.observation_lock_version INTO v_st, v_lv, v_obs
    FROM public.report_request_draft(v_report, v_lv) x;
  SELECT x.status, x.lock_version, x.report_version_id, x.content_hash
    INTO v_st, v_lv, v_ver, v_hash
    FROM public.report_store_draft(v_report, v_lv, v_obs,
      'Spoke clearly and held eye contact', 'Vary pace when excited',
      'Practice reading aloud for five minutes', 'A confident session') x;
  PERFORM public.report_update_checklist(v_report, v_lv, v_ver, true, true, true);
  SELECT x.status, x.lock_version INTO v_st, v_lv
    FROM public.report_trainer_approve(v_report, v_st, v_lv, v_ver, v_hash) x;

  IF v_st <> 'trainer_approved' THEN
    RAISE EXCEPTION 'FAIL T-CT-4: setup did not reach trainer_approved (got %)', v_st;
  END IF;

  PERFORM pg_temp.as_management();
  v_n := pg_temp.n_tracked();
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL T-CT-4: a trainer_approved report with no correction request produced % tracking row(s), expected 0', v_n;
  END IF;

  -- The same report IS visible to management through the ratified
  -- pending-review read, so "absent from correction tracking" is not
  -- "invisible to management".
  IF NOT EXISTS (SELECT 1 FROM public.report_get_management_review(
        'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001')) THEN
    RAISE EXCEPTION 'FAIL T-CT-4: the trainer_approved report is not reachable through RPC-15 either';
  END IF;

  RAISE NOTICE 'PASS T-CT-4 (an initial trainer-approved report is NOT presented as returned correction work, and remains visible as pending review)';
END $t$;

-- T-CT-5  An OPEN needs_edit correction appears, with exactly the right
-- values. This is the row the previous projection could not produce at all.
-- T-CT-1  Active management lists its OWN centre's returned report.
DO $t$
DECLARE
  v_report uuid; v_lv int; v_ver uuid; v_cr uuid; v_row record; v_n bigint;
BEGIN
  SELECT r.id, r.lock_version, r.current_cycle_version_id INTO v_report, v_lv, v_ver
    FROM public.reports r LIMIT 1;

  PERFORM pg_temp.as_management();
  SELECT x.correction_request_id INTO v_cr
    FROM public.report_management_return_to_trainer(v_report, v_lv, v_ver,
      'rating', 'body',
      'Please re-check the Body rating against the observation record.') x;

  v_n := pg_temp.n_tracked();
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'FAIL T-CT-5: % tracking row(s) after a return, expected exactly 1', v_n;
  END IF;
  SELECT * INTO v_row FROM pg_temp.tracked();

  IF v_row.report_id            IS DISTINCT FROM v_report THEN RAISE EXCEPTION 'FAIL T-CT-5: wrong report_id'; END IF;
  IF v_row.correction_request_id IS DISTINCT FROM v_cr    THEN RAISE EXCEPTION 'FAIL T-CT-5: wrong correction_request_id'; END IF;
  IF v_row.report_status        <> 'needs_edit'           THEN RAISE EXCEPTION 'FAIL T-CT-5: report_status is %, expected needs_edit', v_row.report_status; END IF;
  IF v_row.correction_status    <> 'open'                 THEN RAISE EXCEPTION 'FAIL T-CT-5: correction_status is %, expected open', v_row.correction_status; END IF;
  IF v_row.issue_scope          <> 'rating'               THEN RAISE EXCEPTION 'FAIL T-CT-5: issue_scope is %, expected rating', v_row.issue_scope; END IF;
  IF v_row.student_id           IS DISTINCT FROM 'c2000000-0000-4000-8000-000000000001'::uuid THEN RAISE EXCEPTION 'FAIL T-CT-5: wrong student_id'; END IF;
  IF v_row.student_display_name <> 'Fixture Student One'  THEN RAISE EXCEPTION 'FAIL T-CT-5: student_display_name is "%"', v_row.student_display_name; END IF;
  IF v_row.class_session_id     IS DISTINCT FROM 'c5000000-0000-4000-8000-000000000001'::uuid THEN RAISE EXCEPTION 'FAIL T-CT-5: wrong class_session_id'; END IF;
  IF v_row.session_date         IS DISTINCT FROM DATE '2026-02-03' THEN RAISE EXCEPTION 'FAIL T-CT-5: session_date is %', v_row.session_date; END IF;
  IF v_row.returned_at          IS NULL                   THEN RAISE EXCEPTION 'FAIL T-CT-5: returned_at is NULL'; END IF;
  IF v_row.tracking_updated_at  IS NULL                   THEN RAISE EXCEPTION 'FAIL T-CT-5: tracking_updated_at is NULL'; END IF;
  IF v_row.tracking_updated_at   < v_row.returned_at      THEN RAISE EXCEPTION 'FAIL T-CT-5: tracking_updated_at precedes returned_at'; END IF;
  IF v_row.trainer_correction_submitted THEN
    RAISE EXCEPTION 'FAIL T-CT-5: trainer_correction_submitted is true before the trainer has saved anything';
  END IF;

  RAISE NOTICE 'PASS T-CT-5, T-CT-1 (the open needs_edit correction appears to its own centre''s active management, with the right report, request, scope, status, student, session and timestamps, and trainer_correction_submitted = false)';
END $t$;

-- T-CT-6  The bounded reason is visible ONLY to the authorized management
-- and assigned-trainer surfaces.
DO $t$
DECLARE
  v_reason CONSTANT text := 'Please re-check the Body rating against the observation record.';
  v_row record; v_working record; v_n bigint;
BEGIN
  -- (a) management sees the reason it authored, on the tracking surface.
  PERFORM pg_temp.as_management();
  SELECT * INTO v_row FROM pg_temp.tracked();
  IF v_row.correction_reason IS DISTINCT FROM v_reason THEN
    RAISE EXCEPTION 'FAIL T-CT-6(a): management does not see its own bounded reason';
  END IF;

  -- (b) the ASSIGNED TRAINER sees it through RPC-14, which already owned it.
  PERFORM pg_temp.as_trainer();
  SELECT * INTO v_working FROM public.report_get_working(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF v_working.open_correction_reason IS DISTINCT FROM v_reason THEN
    RAISE EXCEPTION 'FAIL T-CT-6(b): the assigned trainer does not see the reason through RPC-14';
  END IF;

  -- (c) the trainer reaches NOTHING through the management tracking surface.
  v_n := pg_temp.n_tracked();
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T-CT-6(c): the trainer sees % management tracking row(s)', v_n; END IF;

  -- (d) the PARENT reaches nothing, on either surface.
  PERFORM pg_temp.as_parent();
  v_n := pg_temp.n_tracked();
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T-CT-6(d): the parent sees % management tracking row(s)', v_n; END IF;
  IF EXISTS (SELECT 1 FROM public.report_get_working(
        'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001')) THEN
    RAISE EXCEPTION 'FAIL T-CT-6(d): the parent reached the trainer working read';
  END IF;

  -- (e) the returned report is STILL invisible to management through the
  --     ratified status-gated content read. The reason being trackable did
  --     not make the CONTENT readable.
  PERFORM pg_temp.as_management();
  IF EXISTS (SELECT 1 FROM public.report_get_management_review(
        'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001')) THEN
    RAISE EXCEPTION 'FAIL T-CT-6(e): RPC-15 returned a row at needs_edit -- the A-038 gate was widened';
  END IF;

  RAISE NOTICE 'PASS T-CT-6 (reason visible to authoring management and the assigned trainer only; trainer, parent see no management queue; RPC-15 still zero-row at needs_edit)';
END $t$;

-- T-CT-3  Trainer, parent and unauthenticated callers are denied, and the
-- denial is the SAME zero-row outcome as "this centre has no open work".
DO $t$
DECLARE v_n bigint;
BEGIN
  PERFORM pg_temp.as_trainer();
  v_n := pg_temp.n_tracked();
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T-CT-3: trainer saw % row(s)', v_n; END IF;

  PERFORM pg_temp.as_parent();
  v_n := pg_temp.n_tracked();
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T-CT-3: parent saw % row(s)', v_n; END IF;

  PERFORM pg_temp.as_nobody();
  v_n := pg_temp.n_tracked();
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T-CT-3: an unauthenticated caller saw % row(s)', v_n; END IF;

  RAISE NOTICE 'PASS T-CT-3 (trainer, parent and unauthenticated callers all receive the identical zero-row outcome)';
END $t$;

-- T-CT-2  Cross-centre isolation. A SECOND centre is created and the parent
-- ACCOUNT is given an active MANAGEMENT membership there -- an existing
-- identity, never a new auth.users row. That caller is genuinely active
-- management, and must still see none of centre A's correction work.
-- Also proven: a DEACTIVATED management membership in the caller's own
-- centre reaches nothing.
DO $t$
DECLARE v_n bigint;
BEGIN
  INSERT INTO public.centres (id, code, display_name)
  VALUES ('b0000000-0000-4000-8000-0000000000ff', 'decoy', 'Decoy Centre');
  INSERT INTO public.centre_memberships (id, account_id, centre_id, role, status, activated_at)
  VALUES ('c1000000-0000-4000-8000-0000000000ff',
          'c0000000-0000-4000-8000-000000000003',
          'b0000000-0000-4000-8000-0000000000ff', 'management', 'active',
          pg_catalog.now());

  PERFORM pg_temp.as_parent();
  v_n := pg_temp.n_tracked();
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL T-CT-2: active management of an UNRELATED centre saw % of centre A''s correction row(s)', v_n;
  END IF;

  -- Centre A's own management is unaffected by the decoy's existence.
  PERFORM pg_temp.as_management();
  v_n := pg_temp.n_tracked();
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'FAIL T-CT-2: centre A management now sees % row(s), expected exactly its own 1', v_n;
  END IF;

  -- A deactivated management membership reaches nothing.
  UPDATE public.centre_memberships SET status = 'deactivated', deactivated_at = pg_catalog.now()
   WHERE id = 'c1000000-0000-4000-8000-000000000001';
  v_n := pg_temp.n_tracked();
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL T-CT-2: a DEACTIVATED management membership saw % row(s)', v_n;
  END IF;
  UPDATE public.centre_memberships SET status = 'active', deactivated_at = NULL,
         activated_at = COALESCE(activated_at, pg_catalog.now())
   WHERE id = 'c1000000-0000-4000-8000-000000000001';

  DELETE FROM public.centre_memberships WHERE id = 'c1000000-0000-4000-8000-0000000000ff';
  DELETE FROM public.centres WHERE id = 'b0000000-0000-4000-8000-0000000000ff';

  RAISE NOTICE 'PASS T-CT-2 (unrelated-centre management sees zero of this centre''s corrections; a deactivated management membership sees zero; centre A is unaffected)';
END $t$;

-- T-CT-15  The read performs NO WRITE. Proven three ways: the aggregate,
-- version, correction and audit row counts are unmoved; the report's
-- lock_version is unmoved; and the call succeeds inside an explicitly
-- READ ONLY transaction, where any write would abort it.
DO $t$
DECLARE
  v_before text; v_after text; v_lv_before int; v_lv_after int; v_report uuid;
BEGIN
  PERFORM pg_temp.as_management();
  SELECT r.id, r.lock_version INTO v_report, v_lv_before FROM public.reports r LIMIT 1;
  SELECT      (SELECT pg_catalog.count(*)::text FROM public.reports)
    || '|' || (SELECT pg_catalog.count(*)::text FROM public.report_versions)
    || '|' || (SELECT pg_catalog.count(*)::text FROM public.report_correction_requests)
    || '|' || (SELECT pg_catalog.count(*)::text FROM public.audit_events)
    || '|' || (SELECT pg_catalog.count(*)::text FROM public.report_version_approvals)
    INTO v_before;

  PERFORM pg_temp.n_tracked();
  PERFORM pg_temp.n_tracked();

  SELECT      (SELECT pg_catalog.count(*)::text FROM public.reports)
    || '|' || (SELECT pg_catalog.count(*)::text FROM public.report_versions)
    || '|' || (SELECT pg_catalog.count(*)::text FROM public.report_correction_requests)
    || '|' || (SELECT pg_catalog.count(*)::text FROM public.audit_events)
    || '|' || (SELECT pg_catalog.count(*)::text FROM public.report_version_approvals)
    INTO v_after;
  SELECT r.lock_version INTO v_lv_after FROM public.reports r WHERE r.id = v_report;

  IF v_before IS DISTINCT FROM v_after THEN
    RAISE EXCEPTION 'FAIL T-CT-15: row counts moved across the read (% -> %)', v_before, v_after;
  END IF;
  IF v_lv_before IS DISTINCT FROM v_lv_after THEN
    RAISE EXCEPTION 'FAIL T-CT-15: lock_version moved across the read (% -> %)', v_lv_before, v_lv_after;
  END IF;
  RAISE NOTICE 'PASS T-CT-15 (repeated reads move no row count and no lock_version)';
END $t$;

-- T-CT-16  The READ ONLY transaction leg, which no amount of review can
-- substitute for: PostgreSQL itself aborts a write here.
BEGIN;
SET TRANSACTION READ ONLY;
DO $t$
DECLARE v_n bigint;
BEGIN
  PERFORM pg_temp.as_management();
  v_n := pg_temp.n_tracked();
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T-CT-16: % row(s) in a READ ONLY transaction, expected 1', v_n; END IF;
  RAISE NOTICE 'PASS T-CT-16 (the read succeeds inside an explicitly READ ONLY transaction)';
END $t$;
COMMIT;

-- T-CT-17  The audit chain is unchanged by the read, and still verifies.
DO $t$
DECLARE v_before bigint; v_after bigint; v_head text; v_head2 text; v_ok boolean;
BEGIN
  PERFORM pg_temp.as_management();
  v_before := pg_temp.chain_len();
  SELECT h.last_seq::text || ':' || h.last_hash INTO v_head FROM public.audit_chain_heads h LIMIT 1;
  PERFORM pg_temp.n_tracked();
  v_after := pg_temp.chain_len();
  SELECT h.last_seq::text || ':' || h.last_hash INTO v_head2 FROM public.audit_chain_heads h LIMIT 1;

  IF v_before IS DISTINCT FROM v_after THEN
    RAISE EXCEPTION 'FAIL T-CT-17: the audit event count moved (% -> %)', v_before, v_after;
  END IF;
  IF v_head IS DISTINCT FROM v_head2 THEN
    RAISE EXCEPTION 'FAIL T-CT-17: the per-centre chain head moved across a read';
  END IF;

  SELECT bool_and(v.ok) INTO v_ok FROM public.audit_verify_chain(NULL, NULL, NULL) v;
  IF v_ok IS NOT TRUE THEN RAISE EXCEPTION 'FAIL T-CT-17: audit_verify_chain failed after the read'; END IF;

  RAISE NOTICE 'PASS T-CT-17 (audit event count and chain head unmoved; the chain still verifies)';
END $t$;

-- T-CT-12  No stale or duplicate lifecycle operation is introduced. A
-- second return while one is open is still refused (BC023), the report
-- still appears exactly ONCE, and the read did not consume the CAS values.
DO $t$
DECLARE v_report uuid; v_lv int; v_ver uuid; v_e text; v_n bigint;
BEGIN
  PERFORM pg_temp.as_management();
  SELECT r.id, r.lock_version, r.current_cycle_version_id INTO v_report, v_lv, v_ver
    FROM public.reports r LIMIT 1;

  v_e := pg_temp.errcode(pg_catalog.format(
    'SELECT public.report_management_return_to_trainer(%L,%s,%L,''observation''::public.correction_issue_scope,NULL,''again'')',
    v_report, v_lv, v_ver));
  IF v_e <> 'BC004' AND v_e <> 'BC023' THEN
    RAISE EXCEPTION 'FAIL T-CT-12: a second return while one is open gave %, expected BC004 or BC023', v_e;
  END IF;

  v_n := pg_temp.n_tracked();
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T-CT-12: % row(s) for one report, expected exactly 1', v_n; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM public.report_correction_requests cr
   WHERE cr.report_id = v_report AND cr.status = 'open';
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T-CT-12: % open request(s) for one report, expected exactly 1', v_n; END IF;

  RAISE NOTICE 'PASS T-CT-12 (a duplicate return is still refused; one report yields exactly one tracking row and one open request)';
END $t$;

-- T-CT-7  Trainer correction SAVED but not yet reapproved: the item stays
-- in tracking and the state changes to "corrected, awaiting reapproval".
DO $t$
DECLARE
  v_report uuid; v_lv int; v_st public.report_status; v_ver uuid; v_new_ver uuid;
  v_hash text; v_row record; v_n bigint; v_returned_ver uuid;
BEGIN
  PERFORM pg_temp.as_trainer();
  SELECT r.id, r.lock_version, r.status, r.current_cycle_version_id
    INTO v_report, v_lv, v_st, v_ver FROM public.reports r LIMIT 1;
  SELECT cr.report_version_id INTO v_returned_ver
    FROM public.report_correction_requests cr WHERE cr.report_id = v_report AND cr.status='open';
  IF v_returned_ver IS DISTINCT FROM v_ver THEN
    RAISE EXCEPTION 'FAIL T-CT-7: the return moved the candidate pointer -- it must not';
  END IF;

  SELECT x.status, x.lock_version, x.report_version_id, x.content_hash
    INTO v_st, v_lv, v_new_ver, v_hash
    FROM public.report_save_edit(v_report, 'needs_edit', v_lv, v_ver,
      'Spoke clearly and held eye contact', 'Vary pace when excited',
      'Practice reading aloud for five minutes',
      'A confident session, with the Body rating re-checked.', NULL) x;

  IF v_st <> 'draft_ready' THEN RAISE EXCEPTION 'FAIL T-CT-7: the correction save left status %, expected draft_ready', v_st; END IF;
  IF v_new_ver IS NOT DISTINCT FROM v_ver THEN RAISE EXCEPTION 'FAIL T-CT-7: the correction save did not create a new version'; END IF;

  PERFORM pg_temp.as_management();
  v_n := pg_temp.n_tracked();
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'FAIL T-CT-7: % tracking row(s) after the trainer''s correction save, expected 1 -- the item must NOT vanish before reapproval', v_n;
  END IF;
  SELECT * INTO v_row FROM pg_temp.tracked();
  IF NOT v_row.trainer_correction_submitted THEN
    RAISE EXCEPTION 'FAIL T-CT-7: trainer_correction_submitted is false after a correction version was created';
  END IF;
  IF v_row.report_status <> 'draft_ready' THEN
    RAISE EXCEPTION 'FAIL T-CT-7: report_status is %, expected draft_ready', v_row.report_status;
  END IF;
  IF v_row.correction_status <> 'open' THEN
    RAISE EXCEPTION 'FAIL T-CT-7: correction_status is %, expected open -- only reapproval resolves it', v_row.correction_status;
  END IF;
  -- Still no CONTENT: the corrected draft is management-invisible.
  IF EXISTS (SELECT 1 FROM public.report_get_management_review(
        'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001')) THEN
    RAISE EXCEPTION 'FAIL T-CT-7: RPC-15 returned a row at draft_ready';
  END IF;

  RAISE NOTICE 'PASS T-CT-7 (correction saved, not reapproved: still tracked, trainer_correction_submitted = true, status draft_ready, request still open, content still invisible)';
END $t$;

-- T-CT-8  Trainer REAPPROVAL completes: the request resolves and the item
-- leaves unresolved correction tracking, reappearing as pending review.
DO $t$
DECLARE
  v_report uuid; v_lv int; v_st public.report_status; v_ver uuid; v_hash text;
  v_n bigint; v_cr_status public.correction_request_status;
BEGIN
  PERFORM pg_temp.as_trainer();
  SELECT r.id, r.lock_version, r.status, r.current_cycle_version_id
    INTO v_report, v_lv, v_st, v_ver FROM public.reports r LIMIT 1;
  SELECT rv.content_hash INTO v_hash FROM public.report_versions rv WHERE rv.id = v_ver;

  PERFORM public.report_update_checklist(v_report, v_lv, v_ver, true, true, true);
  SELECT x.status, x.lock_version INTO v_st, v_lv
    FROM public.report_trainer_approve(v_report, v_st, v_lv, v_ver, v_hash) x;
  IF v_st <> 'trainer_approved' THEN RAISE EXCEPTION 'FAIL T-CT-8: reapproval left status %', v_st; END IF;

  SELECT cr.status INTO v_cr_status FROM public.report_correction_requests cr WHERE cr.report_id = v_report;
  IF v_cr_status <> 'resolved' THEN RAISE EXCEPTION 'FAIL T-CT-8: the request is %, expected resolved', v_cr_status; END IF;

  PERFORM pg_temp.as_management();
  v_n := pg_temp.n_tracked();
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL T-CT-8: % tracking row(s) after reapproval, expected 0 -- resolved work is not unresolved work', v_n;
  END IF;

  -- It is now PENDING-REVIEW work instead, so nothing was lost.
  IF NOT EXISTS (SELECT 1 FROM public.report_get_management_review(
        'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001')) THEN
    RAISE EXCEPTION 'FAIL T-CT-8: the reapproved report is not visible as pending review';
  END IF;

  RAISE NOTICE 'PASS T-CT-8 (reapproval resolves the request and removes the item from correction tracking; it reappears as pending review)';
END $t$;

-- T-CT-9  A RESOLVED request never reappears, and the report SUBMITTED is
-- likewise absent from unresolved correction work.
DO $t$
DECLARE
  v_report uuid; v_lv int; v_ver uuid; v_wh text; v_n bigint; v_st public.report_status;
BEGIN
  PERFORM pg_temp.as_management();
  SELECT r.id, r.lock_version, r.current_cycle_version_id INTO v_report, v_lv, v_ver
    FROM public.reports r LIMIT 1;
  v_wh := pg_temp.whash(v_ver);

  SELECT x.status INTO v_st
    FROM public.report_management_approve_and_submit(v_report, v_lv, v_ver, v_wh) x;
  IF v_st <> 'submitted' THEN RAISE EXCEPTION 'FAIL T-CT-9: submission left status %', v_st; END IF;

  v_n := pg_temp.n_tracked();
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL T-CT-9: % tracking row(s) after submission, expected 0', v_n;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM public.report_correction_requests cr
   WHERE cr.report_id = v_report AND cr.status = 'resolved';
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T-CT-9: % resolved request(s) exist, expected 1 preserved as history', v_n; END IF;

  RAISE NOTICE 'PASS T-CT-9 (a resolved request never reappears; a submitted report is absent from unresolved correction work; the resolved row survives as history)';
END $t$;

-- T-CT-10  A LATER cycle reopens tracking: a reopen + return produces a
-- NEW request and the report returns to the queue exactly once. This is
-- what proves the queue tracks OPEN work rather than "has ever been
-- returned".
DO $t$
DECLARE
  v_report uuid; v_lv int; v_ver uuid; v_st public.report_status;
  v_n bigint; v_row record; v_hash text; v_obs int;
BEGIN
  PERFORM pg_temp.as_trainer();
  SELECT r.id, r.lock_version INTO v_report, v_lv FROM public.reports r LIMIT 1;
  SELECT x.status, x.lock_version, x.report_version_id INTO v_st, v_lv, v_ver
    FROM public.report_reopen_submitted(v_report, v_lv) x;
  IF v_st <> 'needs_edit' THEN RAISE EXCEPTION 'FAIL T-CT-10: reopen left status %', v_st; END IF;

  -- A reopen alone creates NO correction request, so it must NOT appear as
  -- management correction work -- nobody returned it.
  PERFORM pg_temp.as_management();
  v_n := pg_temp.n_tracked();
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL T-CT-10: a reopened report with no correction request produced % row(s), expected 0', v_n;
  END IF;

  -- Drive it back to trainer_approved and return it a second time.
  PERFORM pg_temp.as_trainer();
  SELECT r.status, r.lock_version, r.current_cycle_version_id INTO v_st, v_lv, v_ver
    FROM public.reports r WHERE r.id = v_report;
  SELECT rv.content_hash INTO v_hash FROM public.report_versions rv WHERE rv.id = v_ver;
  PERFORM public.report_update_checklist(v_report, v_lv, v_ver, true, true, true);
  SELECT x.status, x.lock_version INTO v_st, v_lv
    FROM public.report_trainer_approve(v_report, v_st, v_lv, v_ver, v_hash) x;

  PERFORM pg_temp.as_management();
  PERFORM public.report_management_return_to_trainer(v_report, v_lv, v_ver,
    'assessment_fact', NULL, 'The second-cycle summary does not match the observation record.');

  v_n := pg_temp.n_tracked();
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T-CT-10: % row(s) in the second cycle, expected exactly 1', v_n; END IF;
  SELECT * INTO v_row FROM pg_temp.tracked();
  IF v_row.issue_scope <> 'assessment_fact' THEN
    RAISE EXCEPTION 'FAIL T-CT-10: issue_scope is %, expected the SECOND request''s assessment_fact', v_row.issue_scope;
  END IF;
  IF v_row.correction_reason NOT LIKE 'The second-cycle%' THEN
    RAISE EXCEPTION 'FAIL T-CT-10: the reason is the first cycle''s, not the second''s';
  END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM public.report_correction_requests WHERE report_id = v_report;
  IF v_n <> 2 THEN RAISE EXCEPTION 'FAIL T-CT-10: % request row(s) exist, expected 2 (one resolved, one open)', v_n; END IF;

  RAISE NOTICE 'PASS T-CT-10 (a reopen alone is not correction work; a second return produces exactly one new tracked row carrying the SECOND request, with the first preserved as resolved history)';
END $t$;

-- T-CT-11  Parent visibility is unaffected throughout. During an open
-- correction the parent still reads the PREVIOUS canonical submitted
-- version and nothing about the correction cycle.
DO $t$
DECLARE v_n bigint; v_row record;
BEGIN
  PERFORM pg_temp.as_parent();
  SELECT * INTO v_row FROM public.report_get_canonical(
    'c5000000-0000-4000-8000-000000000001','c2000000-0000-4000-8000-000000000001');
  IF NOT FOUND THEN
    RAISE EXCEPTION 'FAIL T-CT-11: the parent lost the previously submitted canonical version during a correction cycle';
  END IF;
  IF v_row.submitted_at IS NULL THEN
    RAISE EXCEPTION 'FAIL T-CT-11: the canonical read returned no submitted_at';
  END IF;

  v_n := pg_temp.n_tracked();
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T-CT-11: the parent saw % management tracking row(s)', v_n; END IF;

  RAISE NOTICE 'PASS T-CT-11 (during an open correction the parent still reads the previous canonical submitted version, and reaches no correction metadata at all)';
END $t$;

\echo 'CT_SUITE_COMPLETE'
