-- =====================================================================
-- C2C-004 — the governed Management "Approved" (`submitted`) projection
-- =====================================================================
-- LOCAL DISPOSABLE DATABASE ONLY. This file drives the REAL governed RPCs
-- and COMMITS: it creates reports, report versions and audit events. One
-- stray committed audit event on the canonical database is PERMANENT and
-- UNREPAIRABLE (Step 7H forbids repair, and `audit_events` is
-- UPDATE/DELETE-blocked by trigger with no owner exemption). The runner
-- clones a disposable database, runs this there, and destroys it.
--
-- WHAT IS PROVEN HERE
--
--   MA-2  THE GOVERNED ROW SET. Management sees EXACTLY the reports of its
--         OWN centre that have committed at `submitted` — no more and no
--         fewer — compared against an independently computed expected set
--         rather than against a hand-written number.
--   MA-3  NO PREAPPROVAL ROW, AT ALL. Reports left at `trainer_approved`
--         and at `needs_edit` in the SAME centre are absent from the
--         result. They are not filtered out of a rendered list: the SQL
--         boundary admits no other status, so they were never rows.
--   MA-4  NO PREAPPROVAL TRAINER DRAFT CONTENT. Every column of the
--         result is compared against the trainer's own draft text and
--         against the published panels; not one of them carries either.
--         The check is by VALUE, not by column name, so a column renamed
--         to look innocuous would still fail.
--   MA-5  CENTRE ISOLATION. A report published in ANOTHER centre is
--         absent from this centre's management result.
--   MA-6  ROLE ISOLATION, NON-DISCLOSING. Trainer, parent and
--         unauthenticated callers each receive the SAME zero rows — the
--         result is byte-indistinguishable from "this centre has
--         published nothing", so the function is safe when invoked
--         directly by any authenticated caller of any role.
--   MA-7  THE LIFECYCLE PREMISE. No report anywhere commits at
--         `approved`, which is why "Approved" reads `submitted`.
--
-- Every failure RAISES, so a silent pass is impossible.
-- =====================================================================

\set ON_ERROR_STOP on
\set QUIET on

BEGIN;

-- ---------------------------------------------------------------------
-- Identity helpers — the same shape scripts/tests/c2/c2-suite.sql and the
-- G-14 isolation seed use. No credential is involved: a JWT CLAIM is set
-- on the session, exactly as PostgREST would, and nothing is created in
-- `auth.users`.
-- ---------------------------------------------------------------------
CREATE FUNCTION pg_temp.ma_be(p_who text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM pg_catalog.set_config('request.jwt.claims', CASE p_who
    WHEN 'trainer'    THEN '{"sub":"d0000000-0000-4000-8000-000000000002","role":"authenticated"}'
    WHEN 'management' THEN '{"sub":"d0000000-0000-4000-8000-000000000001","role":"authenticated"}'
    WHEN 'parent'     THEN '{"sub":"d0000000-0000-4000-8000-000000000003","role":"authenticated"}'
    ELSE ''
  END, false);
END $$;

CREATE FUNCTION pg_temp.ma_nine() RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
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

CREATE FUNCTION pg_temp.ma_whash(p_version uuid) RETURNS text LANGUAGE plpgsql AS $$
DECLARE v public.report_versions; BEGIN
  SELECT * INTO v FROM public.report_versions WHERE id = p_version;
  RETURN public.report_wording_hash_v2(v.overview, v.strengths,
                                       v.areas_for_development, v.remarks);
END $$;

-- The DISTINCT trainer draft text each pair is given. MA-4 searches every
-- column of the projection for these strings: if any of them ever reached
-- the Approved queue, that would be preapproval Trainer draft content on a
-- Management surface.
CREATE FUNCTION pg_temp.ma_draft(p_tag text) RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT 'MA-DRAFT-SECRET-' || p_tag
$$;

/*
 * Drive one (session, student) pair through the governed RPCs to a chosen
 * stopping point. Nothing is inserted into `reports`, `report_versions` or
 * a version pointer directly — a "submitted" report that skipped the
 * workflow would prove nothing about what the workflow publishes.
 *
 *   p_stop = 'trainer_approved'  stop after the trainer's approval
 *   p_stop = 'needs_edit'        stop after a management return
 *   p_stop = 'submitted'         run the full path to publication
 */
CREATE FUNCTION pg_temp.ma_drive(p_sess uuid, p_student uuid, p_stop text, p_tag text)
RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE
  v_rep uuid; v_lv integer; v_obs_lv integer; v_st public.report_status;
  v_ver uuid; v_hash text;
BEGIN
  PERFORM pg_temp.ma_be('trainer');
  SELECT x.report_id, x.report_lock_version, x.observation_lock_version
    INTO v_rep, v_lv, v_obs_lv
    FROM public.assessment_save_complete_and_open_report(
           p_sess, p_student, NULL, NULL,
           ARRAY['confident-opening']::text[], ARRAY['pacing']::text[],
           pg_temp.ma_draft(p_tag || '-notes'), pg_temp.ma_draft(p_tag || '-followup'), '',
           pg_temp.ma_nine()) AS x;

  SELECT x.status, x.lock_version, x.observation_lock_version INTO v_st, v_lv, v_obs_lv
    FROM public.report_request_draft(v_rep, v_lv) x;
  SELECT x.status, x.lock_version, x.report_version_id, x.content_hash
    INTO v_st, v_lv, v_ver, v_hash
    FROM public.report_store_draft(v_rep, v_lv, v_obs_lv,
      pg_temp.ma_draft(p_tag || '-strength'), pg_temp.ma_draft(p_tag || '-focus'),
      pg_temp.ma_draft(p_tag || '-practice'), pg_temp.ma_draft(p_tag || '-takeaway')) x;
  PERFORM public.report_update_checklist(v_rep, v_lv, v_ver, true, true, true);
  SELECT x.status, x.lock_version INTO v_st, v_lv
    FROM public.report_trainer_approve(v_rep, v_st, v_lv, v_ver, v_hash) x;

  IF p_stop = 'trainer_approved' THEN
    RETURN v_rep;
  END IF;

  PERFORM pg_temp.ma_be('management');
  IF p_stop = 'needs_edit' THEN
    PERFORM public.report_management_return_to_trainer(
      v_rep, v_lv, v_ver, 'assessment_fact', NULL,
      'MA suite: returned so this report stays preapproval.');
    PERFORM pg_temp.ma_be('trainer');
    RETURN v_rep;
  END IF;

  PERFORM public.report_management_approve_and_submit(v_rep, v_lv, v_ver, pg_temp.ma_whash(v_ver));
  PERFORM pg_temp.ma_be('trainer');
  RETURN v_rep;
END $$;

-- ---------------------------------------------------------------------
-- Scaffolding and the five governed lifecycles.
-- ---------------------------------------------------------------------
DO $seed$
DECLARE
  v_centre     CONSTANT uuid := 'b0000000-0000-4000-8000-000000000001';
  v_module     CONSTANT uuid := 'c4000000-0000-4000-8000-000000000001';
  v_student    CONSTANT uuid := 'c2000000-0000-4000-8000-000000000001';
  v_enrolment  CONSTANT uuid := 'c6000000-0000-4000-8000-000000000001';
  v_trainer_m  CONSTANT uuid := 'c1000000-0000-4000-8000-000000000002';
  v_yesterday  date := (pg_catalog.now() AT TIME ZONE 'Asia/Singapore')::date - 1;

  -- Own centre: two PUBLISHED, one stopped at trainer_approved, one returned.
  v_pub1  CONSTANT uuid := 'c5000000-0000-4000-8000-0000000000a1';
  v_pub2  CONSTANT uuid := 'c5000000-0000-4000-8000-0000000000a2';
  v_ta    CONSTANT uuid := 'c5000000-0000-4000-8000-0000000000a3';
  v_ne    CONSTANT uuid := 'c5000000-0000-4000-8000-0000000000a4';
  -- One extra learner per session keeps every (session, student) pair unique.
  v_stud2 CONSTANT uuid := 'c2000000-0000-4000-8000-0000000000a2';
  v_enr2  CONSTANT uuid := 'c6000000-0000-4000-8000-0000000000a2';

  -- Another centre: one PUBLISHED report this centre's management must not see.
  v_o_centre  CONSTANT uuid := 'b0000000-0000-4000-8000-0000000000b1';
  v_o_grade   CONSTANT uuid := 'b1000000-0000-4000-8000-0000000000b1';
  v_o_module  CONSTANT uuid := 'c4000000-0000-4000-8000-0000000000b1';
  v_o_stud    CONSTANT uuid := 'c2000000-0000-4000-8000-0000000000b1';
  v_o_enrol   CONSTANT uuid := 'c6000000-0000-4000-8000-0000000000b1';
  v_o_sess    CONSTANT uuid := 'c5000000-0000-4000-8000-0000000000b1';
  v_o_train_m CONSTANT uuid := 'c1000000-0000-4000-8000-0000000000b1';
  v_o_mgmt_m  CONSTANT uuid := 'c1000000-0000-4000-8000-0000000000b2';
  v_active    bigint;
  v_sess      uuid;
BEGIN
  PERFORM pg_temp.ma_be('trainer');

  -- A second learner in the same module, so four same-centre sessions can
  -- each carry a distinct pair.
  INSERT INTO public.students (id, centre_id, full_name, is_active)
  VALUES (v_stud2, v_centre, 'MA Second Learner', true);
  INSERT INTO public.enrolments (id, centre_id, class_module_id, student_id, is_active)
  VALUES (v_enr2, v_centre, v_module, v_stud2, true);

  FOREACH v_sess IN ARRAY ARRAY[v_pub1, v_pub2, v_ta, v_ne] LOOP
    INSERT INTO public.class_sessions (id, centre_id, class_module_id, session_date, starts_at, ends_at)
    VALUES (v_sess, v_centre, v_module, v_yesterday, '10:00', '11:00');
    INSERT INTO public.class_session_assignments (centre_id, class_session_id, trainer_membership_id)
    VALUES (v_centre, v_sess, v_trainer_m);
    INSERT INTO public.attendance (centre_id, class_session_id, class_module_id, student_id, enrolment_id, status)
    VALUES (v_centre, v_sess, v_module, v_student, v_enrolment, 'present'),
           (v_centre, v_sess, v_module, v_stud2,   v_enr2,      'present');
  END LOOP;

  -- The other centre. New memberships for EXISTING accounts; no Auth
  -- identity is created and no credential is written.
  INSERT INTO public.centres (id, code, display_name)
  VALUES (v_o_centre, 'maother', 'MA Other Centre');
  INSERT INTO public.centre_memberships (id, account_id, centre_id, role, status, activated_at)
  VALUES (v_o_train_m, 'c0000000-0000-4000-8000-000000000002', v_o_centre, 'trainer',    'active', pg_catalog.now()),
         (v_o_mgmt_m,  'c0000000-0000-4000-8000-000000000001', v_o_centre, 'management', 'active', pg_catalog.now());
  INSERT INTO public.trainer_profiles (membership_id, centre_id) VALUES (v_o_train_m, v_o_centre);
  INSERT INTO public.class_grades (id, centre_id, code, display_name, sort_order)
  VALUES (v_o_grade, v_o_centre, 'beginner', 'Beginner', 1);
  INSERT INTO public.class_modules (id, centre_id, class_grade_id, title)
  VALUES (v_o_module, v_o_centre, v_o_grade, 'MA Other Module');
  INSERT INTO public.students (id, centre_id, full_name, is_active)
  VALUES (v_o_stud, v_o_centre, 'MA Other Centre Child', true);
  INSERT INTO public.enrolments (id, centre_id, class_module_id, student_id, is_active)
  VALUES (v_o_enrol, v_o_centre, v_o_module, v_o_stud, true);
  INSERT INTO public.class_sessions (id, centre_id, class_module_id, session_date, starts_at, ends_at)
  VALUES (v_o_sess, v_o_centre, v_o_module, v_yesterday, '10:00', '11:00');
  INSERT INTO public.class_session_assignments (centre_id, class_session_id, trainer_membership_id)
  VALUES (v_o_centre, v_o_sess, v_o_train_m);
  INSERT INTO public.attendance (centre_id, class_session_id, class_module_id, student_id, enrolment_id, status)
  VALUES (v_o_centre, v_o_sess, v_o_module, v_o_stud, v_o_enrol, 'present');

  -- The OTHER-CENTRE lifecycle runs FIRST, while its memberships are still
  -- active; they are deactivated immediately afterwards so the two shared
  -- accounts are back to exactly one active membership each and identity
  -- resolution is unambiguous for everything that follows.
  PERFORM pg_temp.ma_drive(v_o_sess, v_o_stud, 'submitted', 'other');
  UPDATE public.centre_memberships
     SET status = 'deactivated', deactivated_at = pg_catalog.now()
   WHERE id IN (v_o_train_m, v_o_mgmt_m);

  PERFORM pg_temp.ma_drive(v_pub1, v_student, 'submitted',        'pub1');
  PERFORM pg_temp.ma_drive(v_pub2, v_stud2,   'submitted',        'pub2');
  PERFORM pg_temp.ma_drive(v_ta,   v_student, 'trainer_approved', 'ta');
  PERFORM pg_temp.ma_drive(v_ne,   v_stud2,   'needs_edit',       'ne');

  SELECT pg_catalog.count(*) INTO v_active
    FROM public.centre_memberships m
   WHERE m.status = 'active'
     AND m.account_id IN ('c0000000-0000-4000-8000-000000000001',
                          'c0000000-0000-4000-8000-000000000002',
                          'c0000000-0000-4000-8000-000000000003');
  IF v_active <> 3 THEN
    RAISE EXCEPTION 'MA suite: % active membership(s) across the three fixture accounts, expected exactly 3', v_active;
  END IF;
END $seed$;

COMMIT;

-- =====================================================================
-- The assertions. Each RAISEs on failure; the last statement prints the
-- verification line the runner requires.
-- =====================================================================
DO $assert$
DECLARE
  v_centre    CONSTANT uuid := 'b0000000-0000-4000-8000-000000000001';
  v_o_centre  CONSTANT uuid := 'b0000000-0000-4000-8000-0000000000b1';
  v_expected  uuid[];
  v_actual    uuid[];
  v_n         bigint;
  v_row       record;
  v_text      text;
BEGIN
  PERFORM pg_temp.ma_be('management');

  -- MA-2: the governed row set, compared against an INDEPENDENTLY computed
  -- expectation rather than a literal count. `reports` is read directly
  -- here as the oracle; the function under test never does.
  SELECT pg_catalog.array_agg(r.id ORDER BY r.id) INTO v_expected
    FROM public.reports r
   WHERE r.centre_id = v_centre AND r.status = 'submitted'
     AND r.latest_submitted_version_id IS NOT NULL;
  SELECT pg_catalog.array_agg(x.report_id ORDER BY x.report_id) INTO v_actual
    FROM public.report_list_management_submitted() x;
  IF v_actual IS DISTINCT FROM v_expected THEN
    RAISE EXCEPTION 'FAIL MA-2: the Approved projection returned % ; the centre''s published reports are %',
      v_actual, v_expected;
  END IF;
  IF pg_catalog.array_length(v_expected, 1) <> 2 THEN
    RAISE EXCEPTION 'FAIL MA-2: the scenario built % published report(s) in this centre; the suite needs exactly 2, or the comparison above could be satisfied by an empty set',
      pg_catalog.coalesce(pg_catalog.array_length(v_expected, 1), 0);
  END IF;

  -- MA-2b: every returned row really is `submitted` and carries a
  -- publication timestamp. A row that reported another status would be a
  -- preapproval report wearing an Approved badge.
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.report_list_management_submitted() x
   WHERE x.report_status <> 'submitted' OR x.submitted_at IS NULL;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL MA-2: % returned row(s) are not submitted-with-a-publication-time', v_n;
  END IF;

  -- MA-3: NO PREAPPROVAL ROW. The two same-centre reports parked at
  -- `trainer_approved` and `needs_edit` must be absent.
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.report_list_management_submitted() x
    JOIN public.reports r ON r.id = x.report_id
   WHERE r.status <> 'submitted';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL MA-3: % preapproval report(s) appear in the Approved projection', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.reports r
   WHERE r.centre_id = v_centre AND r.status IN ('trainer_approved', 'needs_edit');
  IF v_n <> 2 THEN
    RAISE EXCEPTION 'FAIL MA-3: the scenario left % preapproval report(s) in this centre; the suite needs exactly 2, or their absence above proves nothing', v_n;
  END IF;

  -- MA-4: NO PREAPPROVAL TRAINER DRAFT CONTENT, checked BY VALUE across
  -- every column of every row. The draft text, the follow-up note and the
  -- four panels were all given distinctive markers by the driver, so a
  -- column renamed to look innocuous would still be caught.
  FOR v_row IN SELECT * FROM public.report_list_management_submitted() LOOP
    v_text := v_row::text;
    IF v_text LIKE '%MA-DRAFT-SECRET-%' THEN
      RAISE EXCEPTION 'FAIL MA-4: a row of the Approved projection carries trainer draft or panel content';
    END IF;
  END LOOP;

  -- MA-5: CENTRE ISOLATION — the other centre's published report is absent.
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.report_list_management_submitted() x
    JOIN public.reports r ON r.id = x.report_id
   WHERE r.centre_id <> v_centre;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL MA-5: % row(s) from another centre appear in this centre''s Approved projection', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.reports r
   WHERE r.centre_id = v_o_centre AND r.status = 'submitted';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'FAIL MA-5: the scenario published % report(s) in the other centre; the suite needs exactly 1, or its absence above proves nothing', v_n;
  END IF;

  -- MA-6: ROLE ISOLATION, non-disclosing and identical for every denied
  -- caller. Trainer, parent and unauthenticated all receive ZERO rows.
  PERFORM pg_temp.ma_be('trainer');
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_list_management_submitted();
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL MA-6: a trainer received % row(s)', v_n; END IF;

  PERFORM pg_temp.ma_be('parent');
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_list_management_submitted();
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL MA-6: a parent received % row(s)', v_n; END IF;

  PERFORM pg_temp.ma_be('none');
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_list_management_submitted();
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL MA-6: an unauthenticated caller received % row(s)', v_n; END IF;

  -- MA-7: THE LIFECYCLE PREMISE. `approved` is transient-in-transaction, so
  -- nothing commits holding it. This is why "Approved" reads `submitted`.
  SELECT pg_catalog.count(*) INTO v_n FROM public.reports WHERE status = 'approved';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL MA-7: % report(s) committed at status approved after five governed lifecycles', v_n;
  END IF;

  PERFORM pg_temp.ma_be('management');
  RAISE NOTICE 'PASS MA-2 -- the Approved projection returns EXACTLY this centre''s published reports (2), each submitted with a publication time';
  RAISE NOTICE 'PASS MA-3 -- the two same-centre preapproval reports (trainer_approved, needs_edit) are absent';
  RAISE NOTICE 'PASS MA-4 -- no trainer draft, follow-up note or parent-facing panel value appears in any column of any row';
  RAISE NOTICE 'PASS MA-5 -- the other centre''s published report is absent';
  RAISE NOTICE 'PASS MA-6 -- trainer, parent and unauthenticated callers each receive the SAME zero rows';
  RAISE NOTICE 'PASS MA-7 -- no report committed at approved across five governed lifecycles';
END
$assert$;

\pset tuples_only on
\pset format unaligned
SELECT 'MA_SUITE_OK|' || pg_catalog.count(*)::text
  FROM public.report_list_management_submitted();
