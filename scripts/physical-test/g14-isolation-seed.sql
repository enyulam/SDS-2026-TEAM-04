-- =====================================================================
-- G-14 ISOLATION SEED — for the DISPOSABLE stack ONLY (operator ruling
-- R-C2-6 item 9, closing the reviewers' MEDIUM finding).
-- =====================================================================
-- WHY THIS FILE EXISTS.
--
-- G-14 asks whether the Parent-facing canonical report path is an
-- EXISTENCE ORACLE. Until now it compared two documents that were BOTH
-- the "nothing exists" case: the disposable database held ZERO report
-- rows at the moment both were captured, so the ISOLATION half — an
-- existing report belonging to another family — was never exercised at
-- all. Two byte-identical denials proved only that the same code path had
-- been taken twice.
--
-- This file seeds the missing arms, so the gate compares FOUR genuinely
-- different situations:
--
--   POSITIVE CONTROL   a SUBMITTED report for the parent's OWN linked
--                      child, on a second session — the parent MUST be
--                      able to read it;
--   FOREIGN SAME-CENTRE a SUBMITTED report for ANOTHER CHILD of the
--                      parent's OWN centre, to whom the parent holds no
--                      `parent_student_links` row;
--   FOREIGN OTHER-CENTRE a SUBMITTED report in a centre the parent holds
--                      no membership in at all;
--   NON-EXISTENT       a pair that exists nowhere (the harness's own
--                      opaque identifiers; nothing is seeded for it).
--
-- WHAT IT IS ALLOWED TO DO, AND WHAT IT IS NOT.
--
--  * It runs ONLY against the disposable database (`bc-f17-disposable`).
--    `prove-disposable-app.mjs` executes it through
--    `DISPOSABLE_DB_CONTAINER` and nothing else, and the disposable
--    container name can never resolve to the canonical stack.
--  * Every REPORT is produced BY THE GOVERNED RPCs, in order, under a
--    real JWT identity claim — never by inserting a `reports` row, a
--    `report_versions` row or a version pointer directly. A seeded
--    "submitted" report that skipped the workflow would prove nothing
--    about what the workflow actually publishes.
--  * It manufactures NO authentication secret. The second centre reuses
--    the EXISTING disposable trainer and management ACCOUNTS through NEW
--    `centre_memberships` rows. A membership is a domain fact; it is not
--    a credential, and no `auth.users` row is written here.
--  * It touches NOTHING belonging to the pair the live screen 07 -> 08
--    transition drives (`c5000000-…0001` / `c2000000-…0001`), so A-14 and
--    A-15 still observe a first-ever save.
--
-- It prints one verification line, `G14_SEED_OK|<n>`, where n is the
-- number of SUBMITTED reports it created. The harness refuses to decide
-- G-14 unless that number is exactly 3.
-- =====================================================================

\set ON_ERROR_STOP on
\set QUIET on

BEGIN;

-- ---------------------------------------------------------------------
-- Identity helpers. Same shape as scripts/tests/c2/c2-suite.sql.
-- ---------------------------------------------------------------------
CREATE FUNCTION pg_temp.g14_be(p_who text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM pg_catalog.set_config('request.jwt.claims', CASE p_who
    WHEN 'trainer'    THEN '{"sub":"d0000000-0000-4000-8000-000000000002","role":"authenticated"}'
    WHEN 'management' THEN '{"sub":"d0000000-0000-4000-8000-000000000001","role":"authenticated"}'
    WHEN 'parent'     THEN '{"sub":"d0000000-0000-4000-8000-000000000003","role":"authenticated"}'
    ELSE ''
  END, false);
END $$;

CREATE FUNCTION pg_temp.g14_nine() RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
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

-- MIGRATED TO OD-4 at P1-T10.
--
-- This read the four SUPERSEDED panel columns and therefore raised 42703
-- (undefined_column) from the moment M13 replaced them by DROP+ADD. It was
-- recorded as broken and carried forward; this is the repair.
--
-- ⚠️ THE SERIALIZER CHANGES TOO, AND THAT IS THE POINT — it is NOT a
-- column rename. `report_wording_hash_v1` is FROZEN by G-05a and still
-- takes the four superseded parameter names; feeding OD-4 panels into it
-- would compute a hash under the V1 domain separation and label V2 data
-- with a V1 envelope, which is exactly the false-provenance defect the
-- M13 review caught once already. The V2 serializer is the correct
-- counterpart, and V1 is left untouched.
CREATE FUNCTION pg_temp.g14_whash(p_version uuid) RETURNS text LANGUAGE plpgsql AS $$
DECLARE v public.report_versions; BEGIN
  SELECT * INTO v FROM public.report_versions WHERE id = p_version;
  RETURN public.report_wording_hash_v2(v.overview, v.strengths,
                                       v.areas_for_development, v.remarks);
END $$;

-- Drive one (session, student) pair from nothing to `submitted`, through
-- the governed RPCs only. The trainer identity is assumed on entry.
CREATE FUNCTION pg_temp.g14_submit(p_sess uuid, p_student uuid) RETURNS uuid
LANGUAGE plpgsql AS $$
DECLARE
  v_rep uuid; v_lv integer; v_obs_lv integer; v_st public.report_status;
  v_ver uuid; v_hash text;
BEGIN
  SELECT x.report_id, x.report_lock_version, x.observation_lock_version
    INTO v_rep, v_lv, v_obs_lv
    FROM public.assessment_save_complete_and_open_report(
           p_sess, p_student, NULL, NULL,
           ARRAY['confident-opening']::text[], ARRAY['pacing']::text[],
           'G-14 isolation seed observation.', 'G-14 isolation seed follow-up.', '',
           pg_temp.g14_nine()) AS x;

  SELECT x.status, x.lock_version, x.observation_lock_version INTO v_st, v_lv, v_obs_lv
    FROM public.report_request_draft(v_rep, v_lv) x;
  SELECT x.status, x.lock_version, x.report_version_id, x.content_hash
    INTO v_st, v_lv, v_ver, v_hash
    FROM public.report_store_draft(v_rep, v_lv, v_obs_lv,
      'Spoke clearly and held eye contact', 'Vary pace when excited',
      'Practice reading aloud for five minutes', 'A confident session') x;
  PERFORM public.report_update_checklist(v_rep, v_lv, v_ver, true, true, true);
  SELECT x.status, x.lock_version INTO v_st, v_lv
    FROM public.report_trainer_approve(v_rep, v_st, v_lv, v_ver, v_hash) x;

  PERFORM pg_temp.g14_be('management');
  PERFORM public.report_management_approve_and_submit(v_rep, v_lv, v_ver, pg_temp.g14_whash(v_ver));
  PERFORM pg_temp.g14_be('trainer');
  RETURN v_rep;
END $$;

-- ---------------------------------------------------------------------
-- Domain scaffolding. Sessions are past-dated: the governed create path
-- refuses a session whose scheduled start has not been reached, in the
-- pinned Asia/Singapore literal.
-- ---------------------------------------------------------------------
DO $seed$
DECLARE
  v_centre     CONSTANT uuid := 'b0000000-0000-4000-8000-000000000001';
  v_module     CONSTANT uuid := 'c4000000-0000-4000-8000-000000000001';
  v_student    CONSTANT uuid := 'c2000000-0000-4000-8000-000000000001';
  v_enrolment  CONSTANT uuid := 'c6000000-0000-4000-8000-000000000001';
  v_trainer_m  CONSTANT uuid := 'c1000000-0000-4000-8000-000000000002';
  -- POSITIVE CONTROL: the parent's OWN child, a second session.
  v_pos_sess   CONSTANT uuid := 'c5000000-0000-4000-8000-0000000000e1';
  -- FOREIGN, SAME CENTRE: another child the parent is not linked to.
  v_f1_stud    CONSTANT uuid := 'c2000000-0000-4000-8000-0000000000e3';
  v_f1_enrol   CONSTANT uuid := 'c6000000-0000-4000-8000-0000000000e3';
  v_f1_sess    CONSTANT uuid := 'c5000000-0000-4000-8000-0000000000e3';
  -- FOREIGN, OTHER CENTRE: the parent holds no membership at all there.
  v_f2_centre  CONSTANT uuid := 'b0000000-0000-4000-8000-0000000000e2';
  v_f2_grade   CONSTANT uuid := 'b1000000-0000-4000-8000-0000000000e2';
  v_f2_module  CONSTANT uuid := 'c4000000-0000-4000-8000-0000000000e2';
  v_f2_stud    CONSTANT uuid := 'c2000000-0000-4000-8000-0000000000e2';
  v_f2_enrol   CONSTANT uuid := 'c6000000-0000-4000-8000-0000000000e2';
  v_f2_sess    CONSTANT uuid := 'c5000000-0000-4000-8000-0000000000e2';
  v_f2_train_m CONSTANT uuid := 'c1000000-0000-4000-8000-0000000000e2';
  v_f2_mgmt_m  CONSTANT uuid := 'c1000000-0000-4000-8000-0000000000e3';
  v_yesterday  date := (pg_catalog.now() AT TIME ZONE 'Asia/Singapore')::date - 1;
  v_active     bigint;
BEGIN
  PERFORM pg_temp.g14_be('trainer');

  -- POSITIVE CONTROL session, same module, same enrolment, same child.
  INSERT INTO public.class_sessions (id, centre_id, class_module_id, session_date, starts_at, ends_at)
  VALUES (v_pos_sess, v_centre, v_module, v_yesterday, '10:00', '11:00');
  INSERT INTO public.class_session_assignments (centre_id, class_session_id, trainer_membership_id)
  VALUES (v_centre, v_pos_sess, v_trainer_m);
  INSERT INTO public.attendance (centre_id, class_session_id, class_module_id, student_id, enrolment_id, status)
  VALUES (v_centre, v_pos_sess, v_module, v_student, v_enrolment, 'present');

  -- FOREIGN, SAME CENTRE.
  INSERT INTO public.students (id, centre_id, full_name, is_active)
  VALUES (v_f1_stud, v_centre, 'G14 Unlinked Child', true);
  INSERT INTO public.enrolments (id, centre_id, class_module_id, student_id, is_active)
  VALUES (v_f1_enrol, v_centre, v_module, v_f1_stud, true);
  INSERT INTO public.class_sessions (id, centre_id, class_module_id, session_date, starts_at, ends_at)
  VALUES (v_f1_sess, v_centre, v_module, v_yesterday, '10:00', '11:00');
  INSERT INTO public.class_session_assignments (centre_id, class_session_id, trainer_membership_id)
  VALUES (v_centre, v_f1_sess, v_trainer_m);
  INSERT INTO public.attendance (centre_id, class_session_id, class_module_id, student_id, enrolment_id, status)
  VALUES (v_centre, v_f1_sess, v_module, v_f1_stud, v_f1_enrol, 'present');

  -- FOREIGN, OTHER CENTRE. New memberships for the EXISTING accounts; no
  -- Auth identity is created and no credential is written.
  INSERT INTO public.centres (id, code, display_name)
  VALUES (v_f2_centre, 'g14other', 'G14 Other Centre');
  INSERT INTO public.centre_memberships (id, account_id, centre_id, role, status, activated_at)
  VALUES (v_f2_train_m, 'c0000000-0000-4000-8000-000000000002', v_f2_centre, 'trainer',    'active', pg_catalog.now()),
         (v_f2_mgmt_m,  'c0000000-0000-4000-8000-000000000001', v_f2_centre, 'management', 'active', pg_catalog.now());
  INSERT INTO public.trainer_profiles (membership_id, centre_id) VALUES (v_f2_train_m, v_f2_centre);
  INSERT INTO public.class_grades (id, centre_id, code, display_name, sort_order)
  VALUES (v_f2_grade, v_f2_centre, 'beginner', 'Beginner', 1);
  INSERT INTO public.class_modules (id, centre_id, class_grade_id, title)
  VALUES (v_f2_module, v_f2_centre, v_f2_grade, 'G14 Other Module');
  INSERT INTO public.students (id, centre_id, full_name, is_active)
  VALUES (v_f2_stud, v_f2_centre, 'G14 Other Centre Child', true);
  INSERT INTO public.enrolments (id, centre_id, class_module_id, student_id, is_active)
  VALUES (v_f2_enrol, v_f2_centre, v_f2_module, v_f2_stud, true);
  INSERT INTO public.class_sessions (id, centre_id, class_module_id, session_date, starts_at, ends_at)
  VALUES (v_f2_sess, v_f2_centre, v_f2_module, v_yesterday, '10:00', '11:00');
  INSERT INTO public.class_session_assignments (centre_id, class_session_id, trainer_membership_id)
  VALUES (v_f2_centre, v_f2_sess, v_f2_train_m);
  INSERT INTO public.attendance (centre_id, class_session_id, class_module_id, student_id, enrolment_id, status)
  VALUES (v_f2_centre, v_f2_sess, v_f2_module, v_f2_stud, v_f2_enrol, 'present');

  -- The three governed lifecycles, each ending at `submitted`.
  PERFORM pg_temp.g14_submit(v_pos_sess, v_student);
  PERFORM pg_temp.g14_submit(v_f1_sess,  v_f1_stud);
  PERFORM pg_temp.g14_submit(v_f2_sess,  v_f2_stud);

  -- THE SECOND CENTRE'S MEMBERSHIPS ARE DEACTIVATED AGAIN, and this matters.
  -- They existed only so the governed workflow could be driven there, and
  -- while they are ACTIVE the trainer and management accounts each hold TWO
  -- active memberships — which `resolveSessionIdentity` correctly refuses as
  -- ambiguous. Leaving them active would make this seed change the served
  -- application's behaviour for two identities that have nothing to do with
  -- G-14, and would make the gate depend on the ORDER in which the harness
  -- happens to visit surfaces. Deactivating them here removes that coupling
  -- entirely: the submitted reports remain exactly as the workflow published
  -- them, and every account is back to exactly one active membership.
  --
  -- It also makes the other-centre arm STRICTLY STRONGER: nobody at all can
  -- reach that report now, so the parent's denial cannot be an artefact of a
  -- membership this seed created.
  UPDATE public.centre_memberships
     SET status = 'deactivated', deactivated_at = pg_catalog.now()
   WHERE id IN (v_f2_train_m, v_f2_mgmt_m);

  SELECT pg_catalog.count(*) INTO v_active
    FROM public.centre_memberships m
   WHERE m.status = 'active'
     AND m.account_id IN ('c0000000-0000-4000-8000-000000000001',
                          'c0000000-0000-4000-8000-000000000002',
                          'c0000000-0000-4000-8000-000000000003');
  IF v_active <> 3 THEN
    RAISE EXCEPTION 'g14-isolation-seed: % active membership(s) across the three disposable accounts, expected exactly 3 (one each). The seed would be changing identity resolution for identities it has nothing to do with.', v_active;
  END IF;
END $seed$;

COMMIT;

-- ---------------------------------------------------------------------
-- Verification, read back independently. Exactly three of the seeded
-- pairs must hold a report with a NON-NULL `latest_submitted_version_id`
-- — anything less and the isolation half would silently degenerate into
-- the "nothing exists" case the reviewers caught.
-- ---------------------------------------------------------------------
\pset tuples_only on
\pset format unaligned
SELECT 'G14_SEED_OK|' || pg_catalog.count(*)::text
  FROM public.reports r
 WHERE r.latest_submitted_version_id IS NOT NULL
   AND r.class_session_id IN ('c5000000-0000-4000-8000-0000000000e1',
                              'c5000000-0000-4000-8000-0000000000e3',
                              'c5000000-0000-4000-8000-0000000000e2');
