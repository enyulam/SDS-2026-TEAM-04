-- =====================================================================
-- PORTAL PHASES P1-3 + P1-4 -- the TRAINER and MANAGEMENT evidence view.
-- =====================================================================
-- `PRESENTATION-ONLY` over P1-2's read path: no new RPC, no schema, no
-- policy. So the governed half proves the READ discriminates, and proves
-- the one thing `C-5` insists on being able to say later.
--
-- Proves, in order:
--   P34-1  ⚠️ NON-VACUITY FIRST -- the AUTHORING TRAINER reads the clip.
--   P34-2  ⛔ a trainer with NO LIVE ASSIGNMENT to that session reads
--          nothing. The gate is the assignment, not the role.
--   P34-3  ⛔ MANAGEMENT reads the clip on a `trainer_approved` pair --
--          the permitted leg `C-5` requires, and the arm `C-7` authorized.
--   P34-4  ⛔ MANAGEMENT CANNOT REMOVE IT. The row survives and the
--          refusal emits nothing (`CLAUDE.md` §6).
--   P34-5  ⛔⛔ THE NON-GATE, AND THIS IS THE LEG THAT MATTERS MOST.
--          Approve & Submit SUCCEEDS on a report whose clip has NEVER
--          been accessed. `C-5`: visibility is required, attestation is
--          absent, and it is ENFORCED BY NOTHING. ▶ An unasserted
--          non-gate is how a phantom gate gets built later.
--   P34-6  ⚠️ ITS CONTROL -- zero `evidence.accessed` rows existed for
--          that clip at the moment of submission, so P34-5 really did
--          publish an unviewed clip rather than one viewed in passing.
--   P34-7  ⛔ the approve RPC's BODY carries no evidence precondition and
--          no management checklist column. `A-036`'s checklist is a
--          TRAINER instrument and stays trainer-only.
--   P34-8  ⛔ NO MANAGEMENT CHECKLIST COLUMN EXISTS ANYWHERE in the
--          schema -- the structural half of P34-7.
--
-- ⛔ A-004's both-direction Parent UAT is HUMAN and the Operator's. NOT-RUN.
-- =====================================================================

BEGIN;

CREATE FUNCTION pg_temp.be(p_role text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM pg_catalog.set_config('request.jwt.claims',
    pg_catalog.format('{"sub":"d0000000-0000-4000-8000-00000000000%s","role":"authenticated"}',
      CASE p_role WHEN 'management' THEN '1' WHEN 'trainer' THEN '2' ELSE '3' END), true);
END $$;

CREATE FUNCTION pg_temp.nine() RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
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

CREATE FUNCTION pg_temp.runner_counts() RETURNS text LANGUAGE sql AS $c$
  SELECT (SELECT count(*) FROM public.reports)
    || '|' || (SELECT count(*) FROM public.report_evidence)
    || '|' || (SELECT count(*) FROM public.audit_events)
    || '|' || (SELECT count(*) FROM storage.objects)
    || '|' || (SELECT count(*) FROM public.students);
$c$;

DO $suite$
DECLARE
  v_centre    uuid;
  v_module    uuid;
  v_session   uuid;
  v_student   uuid;
  v_trainer_m uuid;
  v_obs       uuid;
  v_report    uuid;
  v_lv        integer;
  v_obs_lv    integer;
  v_st        public.report_status;
  v_ver       uuid;
  v_hash      text;
  v_ev        uuid := 'c1c1c1c1-c1c1-4c1c-8c1c-c1c1c1c1c1c1';
  v_path      text;
  v_n         bigint;
  v_a0        bigint;
  v_rem       boolean;
  v_src       text;
  v_pass      int := 0;
  v_fail      int := 0;
BEGIN
  SELECT m.centre_id, m.class_module_id, m.class_session_id, m.student_id,
         m.trainer_membership_id, m.observation_id
    INTO v_centre, v_module, v_session, v_student, v_trainer_m, v_obs
    FROM pg_temp.mint_isolated_pair('P34') m;

  -- ⚠️ THE SHARED MINT SEEDS AN OBSERVATION, and the governed save refuses a
  --    second one for the same pair. It is removed so the lifecycle below is
  --    driven END TO END through the governed RPCs rather than started from a
  --    hand-seeded halfway point — the same reason `FA-0` exists.
  DELETE FROM public.observation_ratings WHERE observation_id = v_obs;
  DELETE FROM public.observations WHERE id = v_obs;

  -- ⛔ THE REPORT IS DRIVEN THROUGH THE GOVERNED RPCs, never inserted. A
  --    hand-built `trainer_approved` row would prove nothing about what the
  --    workflow actually admits.
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.be('trainer');
  -- ⚠️ ATTENDANCE FIRST, AND THE SUITE HIT `F-ATTENDANCE-INIT-1` LEARNING IT.
  --    The isolated pair carries no attendance row, and the governed save
  --    fails closed on a learner who is not recorded present. That refusal is
  --    the defect's own path working exactly as designed — so the fix's
  --    governed initialize is called here rather than a row being inserted.
  PERFORM public.attendance_set_status(v_session, v_student, NULL, 'present');
  SELECT x.report_id, x.report_lock_version, x.observation_lock_version
    INTO v_report, v_lv, v_obs_lv
    FROM public.assessment_save_complete_and_open_report(
           v_session, v_student, NULL, NULL,
           ARRAY['confident-opening']::text[], ARRAY['pacing']::text[],
           'P34 notes', 'P34 follow-up', '', pg_temp.nine()) AS x;
  SELECT x.status, x.lock_version, x.observation_lock_version INTO v_st, v_lv, v_obs_lv
    FROM public.report_request_draft(v_report, v_lv) x;
  -- ⛔ `report_store_draft` IS OWNER-ONLY BY RATIFIED DESIGN and the suite hit
  --    `permission denied` learning it. `CLAUDE.md` §12 names it among the four
  --    functions the client must never hold `EXECUTE` on: the AI store path is
  --    reached from the server, never from a session. ▶ The refusal was right
  --    and the fix was NOT a grant — the call runs as OWNER, exactly as the
  --    server action does.
  EXECUTE 'RESET ROLE';
  SELECT x.status, x.lock_version, x.report_version_id, x.content_hash
    INTO v_st, v_lv, v_ver, v_hash
    FROM public.report_store_draft(v_report, v_lv, v_obs_lv,
      'P34 overview', 'P34 strengths', 'P34 areas', 'P34 remarks') x;
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.be('trainer');
  PERFORM public.report_update_checklist(v_report, v_lv, v_ver, true, true, true);
  SELECT x.status, x.lock_version INTO v_st, v_lv
    FROM public.report_trainer_approve(v_report, v_st, v_lv, v_ver, v_hash) x;

  -- The clip, attached owner-side because the upload transport is HTTP and
  -- SQL cannot drive it. `prove:portal-2b` proves the governed attach.
  EXECUTE 'RESET ROLE';
  v_path := v_report::text || '/' || v_ev::text || '.mp4';
  INSERT INTO storage.objects (bucket_id, name, metadata)
  VALUES ('evidence', v_path,
          pg_catalog.jsonb_build_object('mimetype', 'video/mp4', 'size', 2097152));
  INSERT INTO public.report_evidence (id, report_id, centre_id, storage_object_path,
                                      media_type, byte_size,
                                      uploaded_by_account_id, uploaded_by_membership_id)
  SELECT v_ev, v_report, v_centre, v_path, 'video/mp4', 2097152, m.account_id, m.id
    FROM public.centre_memberships m WHERE m.id = v_trainer_m;

  RAISE NOTICE 'DURING-COUNTS %', pg_temp.runner_counts();
  RAISE NOTICE 'P34-SETUP -- a trainer_approved report with a clip, driven through the governed RPCs. THIS TRANSACTION ONLY';

  EXECUTE 'SET LOCAL ROLE authenticated';

  -- ---------------------------------------------------------------
  -- P34-1 / P34-2 -- P1-4.
  -- ---------------------------------------------------------------
  PERFORM pg_temp.be('trainer');
  SELECT count(*) INTO v_n FROM public.evidence_list_for_report(v_session, v_student);
  IF v_n = 1 THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P34-1 -- THE PERMITTED LEG: the AUTHORING TRAINER reads the attached clip';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P34-1 -- the authoring trainer read % rows; every refusal below would be vacuous', v_n; END IF;

  EXECUTE 'RESET ROLE';
  UPDATE public.class_session_assignments
     SET is_active = false, unassigned_at = pg_catalog.now()
   WHERE class_session_id = v_session AND is_active;
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.be('trainer');
  SELECT count(*) INTO v_n FROM public.evidence_list_for_report(v_session, v_student);
  IF v_n = 0 THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P34-2 -- a trainer with NO LIVE ASSIGNMENT reads nothing: the gate is the assignment, not the role';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P34-2 -- an unassigned trainer read % rows', v_n; END IF;

  EXECUTE 'RESET ROLE';
  UPDATE public.class_session_assignments
     SET is_active = true, unassigned_at = NULL
   WHERE class_session_id = v_session AND NOT is_active;
  EXECUTE 'SET LOCAL ROLE authenticated';

  -- ---------------------------------------------------------------
  -- P34-3 / P34-4 -- P1-3.
  -- ---------------------------------------------------------------
  PERFORM pg_temp.be('management');
  SELECT count(*) INTO v_n FROM public.evidence_list_for_report(v_session, v_student);
  IF v_n = 1 THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P34-3 -- MANAGEMENT reads the clip on a trainer_approved pair -- the arm C-7 authorized, for the visibility C-5 requires';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P34-3 -- management read % rows', v_n; END IF;

  EXECUTE 'RESET ROLE';
  SELECT count(*) INTO v_a0 FROM public.audit_events;
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.be('management');
  SELECT r.o_removed INTO v_rem FROM public.evidence_remove(v_ev) r;
  EXECUTE 'RESET ROLE';
  SELECT count(*) INTO v_n FROM public.report_evidence WHERE id = v_ev;
  IF v_rem = false AND v_n = 1 AND (SELECT count(*) FROM public.audit_events) = v_a0 THEN
    v_pass := v_pass + 1; RAISE NOTICE 'PASS P34-4 -- MANAGEMENT CANNOT REMOVE: the row survives and the refusal emits nothing. View only (CLAUDE.md §6)';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P34-4 -- removed=%, rows left=%', v_rem, v_n; END IF;

  -- ---------------------------------------------------------------
  -- P34-5 / P34-6 -- ⛔⛔ THE NON-GATE.
  -- ---------------------------------------------------------------
  SELECT count(*) INTO v_n FROM public.audit_events
   WHERE action = 'evidence.accessed' AND target_id = v_ev;
  IF v_n = 0 THEN
    v_pass := v_pass + 1; RAISE NOTICE 'PASS P34-6 -- CONTROL: ZERO evidence.accessed rows exist for this clip, so the submission below really does publish an UNVIEWED clip';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P34-6 -- % access event(s) already exist; P34-5 would prove nothing', v_n; END IF;

  -- ⛔ THE WORDING SERIALIZER IS OWNER-ONLY TOO (`CLAUDE.md` §12 names it
  --    alongside `report_store_draft`). The proof computes the hash as OWNER
  --    and hands the RESULT to the management call, exactly as the server
  --    action does — the caller supplies the proof, it does not mint it.
  EXECUTE 'RESET ROLE';
  SELECT public.report_wording_hash_v2('P34 overview', 'P34 strengths', 'P34 areas', 'P34 remarks')
    INTO v_hash;
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.be('management');
  PERFORM public.report_management_approve_and_submit(v_report, v_lv, v_ver, v_hash);
  EXECUTE 'RESET ROLE';
  SELECT r.status INTO v_st FROM public.reports r WHERE r.id = v_report;
  IF v_st = 'submitted' THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P34-5 -- ⛔ APPROVE & SUBMIT IS **NOT** GATED ON VIEWING. It succeeded on a report whose clip was never accessed. C-5: visibility required, attestation absent, ENFORCED BY NOTHING';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P34-5 -- the report is at % rather than submitted: a viewing gate may have been introduced, which C-5 forbids', v_st;
  END IF;

  -- ---------------------------------------------------------------
  -- P34-7 / P34-8 -- the structural half.
  -- ---------------------------------------------------------------
  SELECT p.prosrc INTO v_src
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_management_approve_and_submit';
  IF pg_catalog.strpos(v_src, 'report_evidence') = 0
     AND pg_catalog.strpos(v_src, 'evidence.accessed') = 0
     AND pg_catalog.strpos(v_src, 'evidence_list_for_report') = 0
  THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P34-7 -- the approve RPC body reads NO evidence table, mints NO access and checks NO viewing. Its only `evidence` references are the TRAINER checklist snapshot it carries forward';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P34-7 -- the approve RPC references evidence state; C-5 forbids a viewing precondition';
  END IF;

  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_attribute a
    JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND a.attnum > 0 AND NOT a.attisdropped
     AND a.attname LIKE '%management%checklist%';
  IF v_n = 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P34-8 -- NO management checklist column exists anywhere in the schema. A-036 checklist stays a TRAINER instrument';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P34-8 -- % management-checklist column(s) exist', v_n;
  END IF;

  RAISE NOTICE 'P1-34 SUITE RESULT -- % PASS, % FAIL', v_pass, v_fail;
END;
$suite$;

ROLLBACK;
