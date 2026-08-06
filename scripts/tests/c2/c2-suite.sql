-- =====================================================================
-- B.E.S.T Coach -- Round C2 Phase C2-A behavioural suite (T-C2-1 .. T-C2-8)
-- =====================================================================
-- LOCAL DISPOSABLE DEVELOPMENT DATABASE ONLY. NEVER `postgres`.
--
-- Every case here drives the REAL governed composer
-- `public.assessment_save_complete_and_open_report` and COMMITS. The
-- creation path appends TWO audit events per report shell
-- (`report.created` then `report.state_changed`), and `audit_events` is
-- UPDATE/DELETE-blocked by trigger with no owner exemption -- so a single
-- execution against the canonical fixture database would be PERMANENT and
-- UNREPAIRABLE. `scripts/tests/c2/run-c2.mjs` is the only supported entry
-- point: it clones a disposable database, runs this file there, destroys
-- it, and measures the canonical database before and after.
--
-- What R-C2-1 requires, and what each case proves:
--   T-C2-1  an INCOMPLETE save creates ZERO reports and ZERO audit events
--   T-C2-2  the first COMPLETE save creates EXACTLY ONE shell, at
--           `observation_saved`, lock_version 2, and returns its REAL id
--   T-C2-3  a REPEATED complete save returns the SAME id, creates no
--           duplicate, bumps nothing, and leaves an advanced report alone
--   T-C2-5  NO report version, rating snapshot, checklist row, approval
--           row or correction request is created, and neither version
--           pointer is set
--   T-C2-6  the shell is invisible to a PARENT, and the MANAGEMENT
--           posture is unchanged (zero review panels at observation_saved)
--   T-C2-7  unauthenticated / management / parent / other-centre /
--           non-existent all fail with the IDENTICAL code AND the
--           IDENTICAL message, and none creates a shell
--   T-C2-8  stale and malformed CAS pairs are refused, changing nothing
--
-- T-C2-4 (two-actor concurrency) is NOT here: it needs two coordinated
-- sessions and lives in the runner.
-- =====================================================================

\set ON_ERROR_STOP on
\set QUIET on

-- ---------------------------------------------------------------------
-- Fixture constants (Step 7F baseline) and local helpers.
-- ---------------------------------------------------------------------
CREATE FUNCTION pg_temp.c2_centre()    RETURNS uuid LANGUAGE sql IMMUTABLE AS $$ SELECT 'b0000000-0000-4000-8000-000000000001'::uuid $$;
CREATE FUNCTION pg_temp.c2_student()   RETURNS uuid LANGUAGE sql IMMUTABLE AS $$ SELECT 'c2000000-0000-4000-8000-000000000001'::uuid $$;
CREATE FUNCTION pg_temp.c2_module()    RETURNS uuid LANGUAGE sql IMMUTABLE AS $$ SELECT 'c4000000-0000-4000-8000-000000000001'::uuid $$;
CREATE FUNCTION pg_temp.c2_enrolment() RETURNS uuid LANGUAGE sql IMMUTABLE AS $$ SELECT 'c6000000-0000-4000-8000-000000000001'::uuid $$;
CREATE FUNCTION pg_temp.c2_trainer_m() RETURNS uuid LANGUAGE sql IMMUTABLE AS $$ SELECT 'c1000000-0000-4000-8000-000000000002'::uuid $$;

CREATE FUNCTION pg_temp.c2_jwt(p_who text) RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE p_who
    WHEN 'trainer'    THEN '{"sub":"d0000000-0000-4000-8000-000000000002","role":"authenticated"}'
    WHEN 'management' THEN '{"sub":"d0000000-0000-4000-8000-000000000001","role":"authenticated"}'
    WHEN 'parent'     THEN '{"sub":"d0000000-0000-4000-8000-000000000003","role":"authenticated"}'
    ELSE ''
  END
$$;

CREATE FUNCTION pg_temp.c2_be(p_who text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM pg_catalog.set_config('request.jwt.claims', pg_temp.c2_jwt(p_who), false);
END $$;

-- The nine governed ratings, deliberately mixed (A-049/A-051) so the
-- payload is the same shape the real surface sends.
CREATE FUNCTION pg_temp.c2_nine() RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
  SELECT '[{"dimension_code":"body","rating":"mastered"},
           {"dimension_code":"emotion","rating":"developing"},
           {"dimension_code":"speech","rating":"mastering"},
           {"dimension_code":"tonality","rating":"developing"},
           {"dimension_code":"eye_contact","rating":"beginning"},
           {"dimension_code":"vocal_projection","rating":"mastered"},
           {"dimension_code":"emotional_expression","rating":"developing"},
           {"dimension_code":"sentence_flow","rating":"mastering"},
           {"dimension_code":"audience_awareness","rating":"mastering"}]'::jsonb
$$;

-- A PAST-DATED class session with its trainer assignment and a `present`
-- attendance row. Past-dating is mandatory: BC104/BC017 reject a session
-- whose scheduled start has not been reached in 'Asia/Singapore'.
CREATE FUNCTION pg_temp.c2_scenario(p_n integer) RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE v_s uuid;
BEGIN
  v_s := ('c5000000-0000-4000-8000-0000000' || lpad((9100 + p_n)::text, 5, '0'))::uuid;
  INSERT INTO public.class_sessions (id, centre_id, class_module_id, session_date, starts_at, ends_at)
  VALUES (v_s, pg_temp.c2_centre(), pg_temp.c2_module(),
          (pg_catalog.now() AT TIME ZONE 'Asia/Singapore')::date - 1, '10:00', '11:00');
  INSERT INTO public.class_session_assignments (centre_id, class_session_id, trainer_membership_id)
  VALUES (pg_temp.c2_centre(), v_s, pg_temp.c2_trainer_m());
  INSERT INTO public.attendance (centre_id, class_session_id, class_module_id, student_id, enrolment_id, status)
  VALUES (pg_temp.c2_centre(), v_s, pg_temp.c2_module(), pg_temp.c2_student(), pg_temp.c2_enrolment(), 'present');
  RETURN v_s;
END $$;

-- Call the composer and report `SQLSTATE|MESSAGE`, or `OK|` on success.
-- Used only by the negative cases; the positive cases call it directly so
-- an unexpected failure aborts the suite rather than being swallowed.
CREATE FUNCTION pg_temp.c2_try(p_sess uuid, p_obs uuid, p_lock integer, p_ratings jsonb)
RETURNS text LANGUAGE plpgsql AS $$
DECLARE v_state text; v_msg text;
BEGIN
  BEGIN
    PERFORM public.assessment_save_complete_and_open_report(
      p_sess, pg_temp.c2_student(), p_obs, p_lock,
      ARRAY['confident-opening']::text[], ARRAY['pacing']::text[],
      'Worked on a short prepared speech.', 'Reinforce eye contact drills.', '', p_ratings);
    RETURN 'OK|';
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_state = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    RETURN v_state || '|' || v_msg;
  END;
END $$;

-- =====================================================================
-- T-C2-1  An INCOMPLETE assessment save creates ZERO reports.
-- =====================================================================
-- R-C2-1 permits an incomplete save to remain without a report. This
-- proves the stronger property actually delivered: an incomplete payload
-- is REFUSED outright by the composed assessment function, so neither an
-- observation nor a shell nor an audit event survives. Three distinct
-- malformed payloads are exercised, because "incomplete" has three
-- different authored shapes.
DO $t1$
DECLARE
  v_s uuid; v_r text; v_events bigint; v_events0 bigint; v_reports bigint;
BEGIN
  PERFORM pg_temp.c2_be('trainer');
  v_s := pg_temp.c2_scenario(1);
  SELECT pg_catalog.count(*) INTO v_events0 FROM public.audit_events;

  -- (a) eight of nine dimensions.
  v_r := pg_temp.c2_try(v_s, NULL, NULL, pg_temp.c2_nine() - 8);
  IF pg_catalog.split_part(v_r, '|', 1) <> 'BC106' THEN
    RAISE EXCEPTION 'FAIL T-C2-1(a): an eight-dimension payload gave %, expected BC106', v_r;
  END IF;

  -- (b) a duplicated dimension code.
  v_r := pg_temp.c2_try(v_s, NULL, NULL,
           pg_catalog.jsonb_set(pg_temp.c2_nine(), '{1,dimension_code}', '"body"'));
  IF pg_catalog.split_part(v_r, '|', 1) <> 'BC108' THEN
    RAISE EXCEPTION 'FAIL T-C2-1(b): a duplicated dimension gave %, expected BC108', v_r;
  END IF;

  -- (c) a rating value outside the four governed labels.
  v_r := pg_temp.c2_try(v_s, NULL, NULL,
           pg_catalog.jsonb_set(pg_temp.c2_nine(), '{0,rating}', '"superb"'));
  IF pg_catalog.split_part(v_r, '|', 1) <> 'BC110' THEN
    RAISE EXCEPTION 'FAIL T-C2-1(c): an unknown rating label gave %, expected BC110', v_r;
  END IF;

  SELECT pg_catalog.count(*) INTO v_reports FROM public.reports
   WHERE class_session_id = v_s AND student_id = pg_temp.c2_student();
  IF v_reports <> 0 THEN
    RAISE EXCEPTION 'FAIL T-C2-1: % report(s) exist after three refused incomplete saves; expected 0', v_reports;
  END IF;
  IF EXISTS (SELECT 1 FROM public.observations WHERE class_session_id = v_s) THEN
    RAISE EXCEPTION 'FAIL T-C2-1: a refused incomplete save left an observation behind';
  END IF;
  SELECT pg_catalog.count(*) INTO v_events FROM public.audit_events;
  IF v_events <> v_events0 THEN
    RAISE EXCEPTION 'FAIL T-C2-1: the audit chain grew by % event(s) during three refused saves', v_events - v_events0;
  END IF;

  RAISE NOTICE 'PASS T-C2-1: three incomplete payloads (BC106/BC108/BC110) each left zero reports, zero observations and zero audit events';
END $t1$;

-- =====================================================================
-- T-C2-2  The first COMPLETE save creates EXACTLY ONE shell and returns
--         its REAL identifier.
-- =====================================================================
-- The required post-state of R-C2-1, asserted against the database rather
-- than against the return value alone: status `observation_saved`, no
-- version, no draft, no approval, no parent pointer -- and lock_version 2,
-- because the composer walks the two ratified arcs T0 then T1 rather than
-- inserting directly at `observation_saved`.
DO $t2$
DECLARE
  v_s uuid; v_events0 bigint; v_n bigint;
  v_obs uuid; v_obs_lock integer; v_rep uuid; v_st public.report_status;
  v_lock integer; v_created boolean;
  v_row record;
BEGIN
  PERFORM pg_temp.c2_be('trainer');
  v_s := pg_temp.c2_scenario(2);
  SELECT pg_catalog.count(*) INTO v_events0 FROM public.audit_events;

  SELECT x.observation_id, x.observation_lock_version, x.report_id, x.report_status,
         x.report_lock_version, x.report_created
    INTO v_obs, v_obs_lock, v_rep, v_st, v_lock, v_created
    FROM public.assessment_save_complete_and_open_report(
           v_s, pg_temp.c2_student(), NULL, NULL,
           ARRAY['confident-opening']::text[], ARRAY['pacing']::text[],
           'Worked on a short prepared speech.', 'Reinforce eye contact drills.', '',
           pg_temp.c2_nine()) AS x;

  IF v_rep IS NULL THEN RAISE EXCEPTION 'FAIL T-C2-2: the composer returned a NULL report identifier'; END IF;
  IF v_created IS NOT TRUE THEN RAISE EXCEPTION 'FAIL T-C2-2: report_created was %, expected true', v_created; END IF;
  IF v_st <> 'observation_saved' THEN RAISE EXCEPTION 'FAIL T-C2-2: the returned status is %, expected observation_saved', v_st; END IF;
  IF v_lock <> 2 THEN RAISE EXCEPTION 'FAIL T-C2-2: the returned lock_version is %, expected 2 (T0 then T1)', v_lock; END IF;
  IF v_obs IS NULL OR v_obs_lock <> 1 THEN
    RAISE EXCEPTION 'FAIL T-C2-2: the observation came back %/%; expected a real id at lock_version 1', v_obs, v_obs_lock;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM public.reports
   WHERE class_session_id = v_s AND student_id = pg_temp.c2_student();
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T-C2-2: % report(s) exist for the pair, expected exactly 1', v_n; END IF;

  SELECT r.id, r.status, r.lock_version, r.observation_id,
         r.current_cycle_version_id, r.latest_submitted_version_id
    INTO v_row
    FROM public.reports r WHERE r.id = v_rep;
  IF v_row.id IS NULL THEN RAISE EXCEPTION 'FAIL T-C2-2: the returned identifier names no committed row'; END IF;
  IF v_row.status <> 'observation_saved' OR v_row.lock_version <> 2 THEN
    RAISE EXCEPTION 'FAIL T-C2-2: the committed shell is %/%; expected observation_saved/2', v_row.status, v_row.lock_version;
  END IF;
  IF v_row.observation_id IS DISTINCT FROM v_obs THEN
    RAISE EXCEPTION 'FAIL T-C2-2: the shell points at observation %, not the one the same call wrote (%)', v_row.observation_id, v_obs;
  END IF;
  IF v_row.current_cycle_version_id IS NOT NULL OR v_row.latest_submitted_version_id IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL T-C2-2: a version pointer was set by the save';
  END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM public.observation_ratings WHERE observation_id = v_obs;
  IF v_n <> 9 THEN RAISE EXCEPTION 'FAIL T-C2-2: % rating row(s) committed, expected 9', v_n; END IF;

  -- EXACTLY the two events the two ratified arcs already emit -- no new
  -- audit action, and nothing emitted by the composer itself.
  SELECT pg_catalog.count(*) INTO v_n FROM public.audit_events;
  IF v_n <> v_events0 + 2 THEN
    RAISE EXCEPTION 'FAIL T-C2-2: the save appended % audit event(s), expected exactly 2', v_n - v_events0;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM (SELECT ae.action FROM public.audit_events ae ORDER BY ae.seq_no DESC LIMIT 2) t
   WHERE t.action IN ('report.created', 'report.state_changed');
  IF v_n <> 2 THEN
    RAISE EXCEPTION 'FAIL T-C2-2: the two new events are not report.created and report.state_changed';
  END IF;
  IF NOT (SELECT pg_catalog.bool_and(ok) FROM public.audit_verify_chain(NULL, NULL, NULL)) THEN
    RAISE EXCEPTION 'FAIL T-C2-2: the audit chain does not verify after the save';
  END IF;

  RAISE NOTICE 'PASS T-C2-2: the first complete save opened exactly one shell at observation_saved/2, returned its real id, wrote nine ratings and appended exactly the two ratified events';
END $t2$;

-- =====================================================================
-- T-C2-3  A REPEATED complete save returns the SAME id and no duplicate.
-- =====================================================================
DO $t3$
DECLARE
  v_s uuid; v_first uuid; v_again uuid; v_third uuid;
  v_obs uuid; v_st public.report_status; v_lock integer; v_created boolean;
  v_events0 bigint; v_n bigint; v_adv uuid; v_adv_lock integer; v_adv_st public.report_status;
  v_vid uuid; v_olock integer;
BEGIN
  PERFORM pg_temp.c2_be('trainer');
  v_s := pg_temp.c2_scenario(3);

  SELECT x.observation_id, x.report_id INTO v_obs, v_first
    FROM public.assessment_save_complete_and_open_report(
           v_s, pg_temp.c2_student(), NULL, NULL,
           ARRAY['confident-opening']::text[], ARRAY['pacing']::text[],
           'First save.', 'Follow up.', '', pg_temp.c2_nine()) AS x;
  SELECT pg_catalog.count(*) INTO v_events0 FROM public.audit_events;

  -- Second call, carrying the CAS pair the first returned.
  SELECT x.report_id, x.report_status, x.report_lock_version, x.report_created, x.observation_lock_version
    INTO v_again, v_st, v_lock, v_created, v_olock
    FROM public.assessment_save_complete_and_open_report(
           v_s, pg_temp.c2_student(), v_obs, 1,
           ARRAY['confident-opening']::text[], ARRAY['pacing']::text[],
           'Second save.', 'Follow up again.', '', pg_temp.c2_nine()) AS x;

  IF v_again IS DISTINCT FROM v_first THEN
    RAISE EXCEPTION 'FAIL T-C2-3: the repeat returned % but the first returned %', v_again, v_first;
  END IF;
  IF v_created IS NOT FALSE THEN RAISE EXCEPTION 'FAIL T-C2-3: report_created was % on a repeat, expected false', v_created; END IF;
  IF v_st <> 'observation_saved' THEN RAISE EXCEPTION 'FAIL T-C2-3: the repeat moved the status to %', v_st; END IF;
  IF v_lock <> 2 THEN RAISE EXCEPTION 'FAIL T-C2-3: the repeat bumped lock_version to %, expected a still-2 aggregate', v_lock; END IF;

  -- Third call, to prove the property is stable rather than a one-off.
  SELECT x.report_id INTO v_third
    FROM public.assessment_save_complete_and_open_report(
           v_s, pg_temp.c2_student(), v_obs, v_olock,
           ARRAY['confident-opening']::text[], ARRAY['pacing']::text[],
           'Third save.', 'Follow up once more.', '', pg_temp.c2_nine()) AS x;
  IF v_third IS DISTINCT FROM v_first THEN
    RAISE EXCEPTION 'FAIL T-C2-3: the third save returned %, not the original %', v_third, v_first;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM public.reports
   WHERE class_session_id = v_s AND student_id = pg_temp.c2_student();
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T-C2-3: three complete saves produced % report(s)', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_versions WHERE report_id = v_first;
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T-C2-3: % version(s) exist after repeated saves', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.audit_events;
  IF v_n <> v_events0 THEN
    RAISE EXCEPTION 'FAIL T-C2-3: two repeat saves appended % audit event(s), expected 0', v_n - v_events0;
  END IF;

  -- A report already PAST `incomplete` is returned untouched. Drive a
  -- separate scenario to draft_ready, then save over it: the T1 advance is
  -- gated on `incomplete`, so nothing may move.
  v_s := pg_temp.c2_scenario(4);
  SELECT x.observation_id, x.report_id, x.report_lock_version INTO v_obs, v_adv, v_adv_lock
    FROM public.assessment_save_complete_and_open_report(
           v_s, pg_temp.c2_student(), NULL, NULL,
           ARRAY['confident-opening']::text[], ARRAY['pacing']::text[],
           'Save.', 'Follow up.', '', pg_temp.c2_nine()) AS x;
  SELECT y.status, y.lock_version, y.observation_lock_version INTO v_adv_st, v_adv_lock, v_olock
    FROM public.report_request_draft(v_adv, v_adv_lock) AS y;
  SELECT z.status, z.lock_version, z.report_version_id INTO v_adv_st, v_adv_lock, v_vid
    FROM public.report_store_draft(v_adv, v_adv_lock, v_olock,
           'Panel one', 'Panel two', 'Panel three', 'Panel four') AS z;
  IF v_adv_st <> 'draft_ready' THEN RAISE EXCEPTION 'FAIL T-C2-3: the scaffold reached % not draft_ready', v_adv_st; END IF;
  SELECT pg_catalog.count(*) INTO v_events0 FROM public.audit_events;

  SELECT x.report_id, x.report_status, x.report_lock_version, x.report_created
    INTO v_again, v_st, v_lock, v_created
    FROM public.assessment_save_complete_and_open_report(
           v_s, pg_temp.c2_student(), v_obs, 1,
           ARRAY['confident-opening']::text[], ARRAY['pacing']::text[],
           'A later save.', 'Follow up.', '', pg_temp.c2_nine()) AS x;
  IF v_again IS DISTINCT FROM v_adv THEN RAISE EXCEPTION 'FAIL T-C2-3: the advanced report''s id changed'; END IF;
  IF v_created IS NOT FALSE THEN RAISE EXCEPTION 'FAIL T-C2-3: report_created was true against an existing advanced report'; END IF;
  IF v_st <> 'draft_ready' OR v_lock <> v_adv_lock THEN
    RAISE EXCEPTION 'FAIL T-C2-3: an advanced report was moved to %/% (was draft_ready/%)', v_st, v_lock, v_adv_lock;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.audit_events;
  IF v_n <> v_events0 THEN
    RAISE EXCEPTION 'FAIL T-C2-3: saving over an advanced report appended % audit event(s), expected 0', v_n - v_events0;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_versions WHERE report_id = v_adv;
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T-C2-3: the advanced report now holds % version(s), expected its original 1', v_n; END IF;

  RAISE NOTICE 'PASS T-C2-3: repeated complete saves return the SAME id with no duplicate, no bump and no audit event; a draft_ready report is returned untouched';
END $t3$;

-- =====================================================================
-- T-C2-5  NO report version, snapshot, checklist, approval or correction
--         is created by the save path.
-- =====================================================================
-- Scoped to the shells T-C2-2 and T-C2-3's first leg created, so the
-- deliberate draft_ready scaffold in T-C2-3 does not mask the property.
DO $t5$
DECLARE v_n bigint; v_shells uuid[];
BEGIN
  SELECT pg_catalog.array_agg(r.id) INTO v_shells
    FROM public.reports r
   WHERE r.class_session_id IN ('c5000000-0000-4000-8000-000000009102'::uuid,
                                'c5000000-0000-4000-8000-000000009103'::uuid);
  IF pg_catalog.array_length(v_shells, 1) <> 2 THEN
    RAISE EXCEPTION 'FAIL T-C2-5: expected the 2 save-only shells, found %', pg_catalog.array_length(v_shells, 1);
  END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM public.report_versions WHERE report_id = ANY (v_shells);
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T-C2-5: % report version(s) exist', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_ratings vr
    JOIN public.report_versions v ON v.id = vr.report_version_id WHERE v.report_id = ANY (v_shells);
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T-C2-5: % version rating snapshot(s) exist', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_checklist_progress cp
    JOIN public.report_versions v ON v.id = cp.report_version_id WHERE v.report_id = ANY (v_shells);
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T-C2-5: % checklist row(s) exist', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_approvals WHERE report_id = ANY (v_shells);
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T-C2-5: % approval row(s) exist', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_correction_requests WHERE report_id = ANY (v_shells);
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T-C2-5: % correction request(s) exist', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.reports
   WHERE id = ANY (v_shells)
     AND (current_cycle_version_id IS NOT NULL OR latest_submitted_version_id IS NOT NULL);
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T-C2-5: % shell(s) carry a version pointer', v_n; END IF;

  -- The composer's own body, read back from the catalogue: assertion X9
  -- re-proved outside the migration that authored it.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = 'assessment_save_complete_and_open_report'
     AND pg_catalog.regexp_replace(p.prosrc, '--[^\n]*', '', 'g') ~
         '(report_versions|report_version_ratings|report_request_draft|report_store_draft)';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL T-C2-5: the composer body reaches a version or drafting object';
  END IF;

  RAISE NOTICE 'PASS T-C2-5: the save path created no version, snapshot, checklist, approval, correction or version pointer, and the composer body names none';
END $t5$;

-- =====================================================================
-- T-C2-6  NO parent visibility; the management posture is UNCHANGED.
-- =====================================================================
DO $t6$
DECLARE v_rep uuid; v_n bigint;
BEGIN
  SELECT r.id INTO v_rep FROM public.reports r
   WHERE r.class_session_id = 'c5000000-0000-4000-8000-000000009102'::uuid;
  IF v_rep IS NULL THEN RAISE EXCEPTION 'FAIL T-C2-6: the T-C2-2 shell is missing'; END IF;

  -- Parent: the byte-identical zero-row denial. Nothing is done to make
  -- this true -- it IS true because no version was written, so
  -- latest_submitted_version_id is NULL.
  PERFORM pg_temp.c2_be('parent');
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_resolve_context(v_rep);
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T-C2-6: report_resolve_context returned % row(s) to a parent', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.report_get_canonical('c5000000-0000-4000-8000-000000009102'::uuid, pg_temp.c2_student());
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T-C2-6: report_get_canonical returned % row(s) to a parent', v_n; END IF;

  PERFORM pg_temp.c2_be('trainer');
  SELECT pg_catalog.count(*) INTO v_n FROM public.reports
   WHERE id = v_rep AND latest_submitted_version_id IS NULL;
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL T-C2-6: the shell carries a submitted version pointer'; END IF;

  -- Management: the ALREADY-RATIFIED posture, neither widened nor
  -- narrowed. The review read is gated to trainer_approved/submitted, so
  -- at observation_saved it yields zero panels and no version id.
  PERFORM pg_temp.c2_be('management');
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.report_get_management_review('c5000000-0000-4000-8000-000000009102'::uuid, pg_temp.c2_student());
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL T-C2-6: report_get_management_review exposed % row(s) at observation_saved', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.report_get_canonical('c5000000-0000-4000-8000-000000009102'::uuid, pg_temp.c2_student());
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL T-C2-6: report_get_canonical exposed % row(s) to management', v_n; END IF;
  -- report_resolve_context's management branch is deliberately not
  -- status-gated by PRIOR ratification. Asserting it still resolves the
  -- pair is how this suite proves the change NARROWED nothing either.
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_resolve_context(v_rep);
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'FAIL T-C2-6: the ratified management key translation changed (% row(s), expected the unchanged 1)', v_n;
  END IF;

  PERFORM pg_temp.c2_be('trainer');
  RAISE NOTICE 'PASS T-C2-6: the shell is invisible to a parent (zero rows, no submitted pointer) and the management posture is unchanged -- zero review panels at observation_saved, the ratified key translation intact';
END $t6$;

-- =====================================================================
-- T-C2-7  Denial is fail-closed and NON-DISCLOSING.
-- =====================================================================
-- Five callers who must all be refused, each asserting the IDENTICAL
-- SQLSTATE and the IDENTICAL message text -- so "does not exist" and
-- "not permitted" are one answer and the RPC is not an existence oracle
-- over the (session, student) space, even though every authenticated
-- caller of every role may invoke it.
DO $t7$
DECLARE
  v_s uuid; v_other_s uuid; v_r text; v_ref text;
  v_reports0 bigint; v_reports1 bigint; v_events0 bigint; v_events1 bigint;
BEGIN
  PERFORM pg_temp.c2_be('trainer');
  v_s := pg_temp.c2_scenario(7);

  -- A second centre with its own past-dated session. The fixture trainer
  -- holds NO membership there, which is exactly the wrong-centre case.
  -- No Auth identity is created: authentication secrets are Supabase
  -- Auth's alone and no test may manufacture one.
  INSERT INTO public.centres (id, code, display_name)
  VALUES ('b0000000-0000-4000-8000-0000000000c2', 'c2other', 'C2 Other Centre');
  INSERT INTO public.class_grades (id, centre_id, code, display_name, sort_order)
  VALUES ('b1000000-0000-4000-8000-0000000000c2', 'b0000000-0000-4000-8000-0000000000c2', 'beginner', 'Beginner', 1);
  INSERT INTO public.class_modules (id, centre_id, class_grade_id, title)
  VALUES ('c4000000-0000-4000-8000-0000000000c2', 'b0000000-0000-4000-8000-0000000000c2',
          'b1000000-0000-4000-8000-0000000000c2', 'C2 Other Module');
  INSERT INTO public.class_sessions (id, centre_id, class_module_id, session_date, starts_at, ends_at)
  VALUES ('c5000000-0000-4000-8000-0000000000c2', 'b0000000-0000-4000-8000-0000000000c2',
          'c4000000-0000-4000-8000-0000000000c2',
          (pg_catalog.now() AT TIME ZONE 'Asia/Singapore')::date - 1, '10:00', '11:00');
  v_other_s := 'c5000000-0000-4000-8000-0000000000c2'::uuid;

  SELECT pg_catalog.count(*) INTO v_reports0 FROM public.reports;
  SELECT pg_catalog.count(*) INTO v_events0 FROM public.audit_events;

  -- (a) no JWT claim at all.
  PERFORM pg_temp.c2_be('none');
  v_ref := pg_temp.c2_try(v_s, NULL, NULL, pg_temp.c2_nine());
  IF pg_catalog.split_part(v_ref, '|', 1) <> 'BC101' THEN
    RAISE EXCEPTION 'FAIL T-C2-7(a): an unauthenticated call gave %, expected BC101', v_ref;
  END IF;

  -- (b) management.
  PERFORM pg_temp.c2_be('management');
  v_r := pg_temp.c2_try(v_s, NULL, NULL, pg_temp.c2_nine());
  IF v_r IS DISTINCT FROM v_ref THEN
    RAISE EXCEPTION 'FAIL T-C2-7(b): management got "%", which is distinguishable from "%"', v_r, v_ref;
  END IF;

  -- (c) parent.
  PERFORM pg_temp.c2_be('parent');
  v_r := pg_temp.c2_try(v_s, NULL, NULL, pg_temp.c2_nine());
  IF v_r IS DISTINCT FROM v_ref THEN
    RAISE EXCEPTION 'FAIL T-C2-7(c): a parent got "%", which is distinguishable from "%"', v_r, v_ref;
  END IF;

  -- (d) a trainer of ANOTHER centre's session.
  PERFORM pg_temp.c2_be('trainer');
  v_r := pg_temp.c2_try(v_other_s, NULL, NULL, pg_temp.c2_nine());
  IF v_r IS DISTINCT FROM v_ref THEN
    RAISE EXCEPTION 'FAIL T-C2-7(d): the wrong-centre call got "%", which is distinguishable from "%"', v_r, v_ref;
  END IF;

  -- (e) a session that does not exist. Byte-identical to (d), so the
  --     answer discloses nothing about which pairs are real.
  v_r := pg_temp.c2_try('c5000000-0000-4000-8000-00000000dead'::uuid, NULL, NULL, pg_temp.c2_nine());
  IF v_r IS DISTINCT FROM v_ref THEN
    RAISE EXCEPTION 'FAIL T-C2-7(e): a non-existent session got "%", which is distinguishable from "%"', v_r, v_ref;
  END IF;

  SELECT pg_catalog.count(*) INTO v_reports1 FROM public.reports;
  SELECT pg_catalog.count(*) INTO v_events1 FROM public.audit_events;
  IF v_reports1 <> v_reports0 THEN
    RAISE EXCEPTION 'FAIL T-C2-7: the five refused calls created % report(s)', v_reports1 - v_reports0;
  END IF;
  IF v_events1 <> v_events0 THEN
    RAISE EXCEPTION 'FAIL T-C2-7: the five refused calls appended % audit event(s)', v_events1 - v_events0;
  END IF;

  PERFORM pg_temp.c2_be('trainer');
  RAISE NOTICE 'PASS T-C2-7: unauthenticated, management, parent, wrong-centre and non-existent all returned the IDENTICAL BC101 and the IDENTICAL message, creating no report and no audit event';
END $t7$;

-- =====================================================================
-- T-C2-8  Stale and malformed CAS pairs are refused, changing nothing.
-- =====================================================================
DO $t8$
DECLARE
  v_s uuid; v_obs uuid; v_rep uuid; v_lock integer; v_r text;
  v_events0 bigint; v_n bigint; v_st public.report_status;
BEGIN
  PERFORM pg_temp.c2_be('trainer');
  v_s := pg_temp.c2_scenario(8);
  SELECT x.observation_id, x.report_id, x.observation_lock_version INTO v_obs, v_rep, v_lock
    FROM public.assessment_save_complete_and_open_report(
           v_s, pg_temp.c2_student(), NULL, NULL,
           ARRAY['confident-opening']::text[], ARRAY['pacing']::text[],
           'Save.', 'Follow up.', '', pg_temp.c2_nine()) AS x;
  SELECT pg_catalog.count(*) INTO v_events0 FROM public.audit_events;

  -- (a) a STALE observation lock version.
  v_r := pg_temp.c2_try(v_s, v_obs, v_lock - 1, pg_temp.c2_nine());
  IF pg_catalog.split_part(v_r, '|', 1) <> 'BC112' THEN
    RAISE EXCEPTION 'FAIL T-C2-8(a): a stale CAS gave %, expected BC112', v_r;
  END IF;

  -- (b) MIXED CAS nullability -- an id without its lock version.
  v_r := pg_temp.c2_try(v_s, v_obs, NULL, pg_temp.c2_nine());
  IF pg_catalog.split_part(v_r, '|', 1) <> 'BC111' THEN
    RAISE EXCEPTION 'FAIL T-C2-8(b): a mixed CAS pair gave %, expected BC111', v_r;
  END IF;

  -- (c) CREATE mode against a pair that already holds an observation.
  v_r := pg_temp.c2_try(v_s, NULL, NULL, pg_temp.c2_nine());
  IF pg_catalog.split_part(v_r, '|', 1) <> 'BC113' THEN
    RAISE EXCEPTION 'FAIL T-C2-8(c): a duplicate create gave %, expected BC113', v_r;
  END IF;

  SELECT r.status, pg_catalog.count(*) OVER () INTO v_st, v_n
    FROM public.reports r WHERE r.class_session_id = v_s;
  IF v_n <> 1 OR v_st <> 'observation_saved' THEN
    RAISE EXCEPTION 'FAIL T-C2-8: the aggregate is % row(s) at %, expected 1 at observation_saved', v_n, v_st;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.audit_events;
  IF v_n <> v_events0 THEN
    RAISE EXCEPTION 'FAIL T-C2-8: three refused CAS calls appended % audit event(s)', v_n - v_events0;
  END IF;

  RAISE NOTICE 'PASS T-C2-8: stale (BC112), mixed-nullability (BC111) and duplicate-create (BC113) CAS pairs were each refused, leaving the aggregate and the audit chain unchanged';
END $t8$;

-- ---------------------------------------------------------------------
-- Final posture: the audit chain still verifies end to end.
-- ---------------------------------------------------------------------
DO $final$
BEGIN
  IF NOT (SELECT pg_catalog.bool_and(ok) FROM public.audit_verify_chain(NULL, NULL, NULL)) THEN
    RAISE EXCEPTION 'FAIL T-C2: the audit chain does not verify at the end of the suite';
  END IF;
  RAISE NOTICE 'PASS T-C2-CHAIN: the hash-chained audit log verifies end to end after the whole suite';
END $final$;

SELECT 'C2_SUITE_COMPLETE';
