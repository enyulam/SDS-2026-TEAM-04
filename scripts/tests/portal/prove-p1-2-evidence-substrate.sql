-- =====================================================================
-- PORTAL PHASE P1-2 -- D-5: the per-child evidence substrate.
-- =====================================================================
-- Proves, in order:
--   P2a-1   NON-VACUITY FIRST. An evidence object EXISTS and the AUTHORING
--           TRAINER attaches it. ⛔ Every refusal below is meaningless
--           without this -- with nothing attachable the gate denies
--           EVERYONE and each deny passes for the wrong reason (the S-8
--           finding).
--   P2a-2   The trainer LISTS it, and the read carries NO storage path
--           (A-001 gate 7).
--   P2a-3   MANAGEMENT lists it -- D-5 requires management to VIEW it
--           before Approve & Submit.
--   P2a-4   DENY: management cannot ATTACH. Upload is the Trainer's.
--   P2a-5   DENY: parent reads nothing. A-002 is UNRULED and no parent arm
--           was built.
--   P2a-6   DENY: anon reads nothing.
--   P2a-7   ⚠️ THE CONTROL. The trainer re-reads AFTER the three denials,
--           so the zeros are DISCRIMINATION, not blindness.
--   P2a-8   UNRELATED REPORT: a second minted pair returns zero even to a
--           caller authorized for it -- no cross-report leak.
--   P2a-9   ⚠️ THE 100 MiB CHECK FIRES, MEASURED. 104857601 raises 23514;
--           104857600 is accepted. A CHECK nobody has seen refuse anything
--           is a CHECK nobody has tested.
--   P2a-10  SERVER-SIDE RE-VALIDATION, MEASURED: an object whose STORED
--           size exceeds the ceiling is refused by the RPC and creates no
--           row -- the caller declares neither size nor media type.
--   P2a-11  ⚠️ THE BUCKET INVARIANT FIRES when a bucket lacks a limit --
--           with a control proving it reads 0 first. This is the check
--           that must bind on the DEFERRED photo and materials buckets.
--   P2a-12  ALL THREE NEW STRINGS are emitted and AUDIT VERIFICATION
--           ACCEPTS THE CHAIN -- plus both declaration sites now resolve
--           through the single-source registry.
--   P2a-13  A DENIED access emits NOTHING (A-057, success only).
--
-- ⚠️ RUNS UNDER `SET LOCAL ROLE authenticated` for every gate leg. The
-- functions are owner-owned; an owner-side call proves nothing about what
-- a real caller reaches. Owner-side SETUP is done with `RESET ROLE`,
-- because `authenticated` holds no table grant on `reports` and must not
-- be given one to make a suite run.
--
-- ⚠️ TRANSACTION-SCOPED, ENDING IN `ROLLBACK`. Pairs are MINTED, never
-- borrowed.
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

-- ⚠️ THE RUNNER'S OWN COUNT SHAPE. The shared prelude emits NINE fields and
-- this runner measures SIX; comparing those makes "counts moved" pass
-- because THE FORMATS DIFFER, not because anything moved. That defect was
-- found in P1-1b and is not repeated here.
-- ▶ A comparison is only evidence when both sides measure the same thing.
CREATE FUNCTION pg_temp.runner_counts() RETURNS text LANGUAGE sql AS $c$
  SELECT (SELECT count(*) FROM public.reports)
    || '|' || (SELECT count(*) FROM public.report_evidence)
    || '|' || (SELECT count(*) FROM public.audit_events)
    || '|' || (SELECT count(*) FROM storage.objects)
    || '|' || (SELECT count(*) FROM storage.buckets)
    || '|' || (SELECT count(*) FROM public.students);
$c$;

-- The bucket invariant, written ONCE and used by both the migration and the
-- proof. Over the WHOLE table -- a check naming only `evidence` would be
-- silent on the day the deferred photo bucket is added.
CREATE FUNCTION pg_temp.buckets_without_limit() RETURNS bigint LANGUAGE sql AS $c$
  SELECT count(*) FROM storage.buckets b
   WHERE b.file_size_limit IS NULL OR b.public IS NOT FALSE;
$c$;

DO $suite$
DECLARE
  v_centre    uuid;
  v_module    uuid;
  v_session   uuid;
  v_student   uuid;
  v_enrolment uuid;
  v_obs       uuid;
  v_trainer_m uuid;
  v_report    uuid;
  v_ev        uuid := '11111111-1111-4111-8111-111111111111';
  v_ev2       uuid := '22222222-2222-4222-8222-222222222222';
  v_path      text;
  v_b_centre  uuid;
  v_b_session uuid;
  v_b_student uuid;
  v_b_report  uuid;
  v_b_module  uuid;
  v_b_enrol   uuid;
  v_b_obs     uuid;
  v_b_tm      uuid;
  v_ok        boolean;
  v_n         bigint;
  v_audit0    bigint;
  v_audit1    bigint;
  v_sqlstate  text;
  v_src       text;
  v_pass      int := 0;
  v_fail      int := 0;
BEGIN
  -- ---------------------------------------------------------------
  -- SETUP, owner-side.
  -- ---------------------------------------------------------------
  SELECT m.centre_id, m.class_module_id, m.class_session_id, m.student_id,
         m.enrolment_id, m.observation_id, m.trainer_membership_id
    INTO v_centre, v_module, v_session, v_student, v_enrolment, v_obs, v_trainer_m
    FROM pg_temp.mint_isolated_pair('P2A') m;

  INSERT INTO public.reports (centre_id, class_session_id, class_module_id, student_id,
                              enrolment_id, observation_id, status, lock_version)
       VALUES (v_centre, v_session, v_module, v_student, v_enrolment, v_obs,
               'draft_ready', 2)
    RETURNING id INTO v_report;

  v_path := v_report::text || '/' || v_ev::text || '.mp4';

  -- The uploaded object. In production the client TUS-uploads this under the
  -- one storage policy; here it is placed owner-side so the RPC gate is what
  -- is being measured, not the policy's transport.
  INSERT INTO storage.objects (bucket_id, name, metadata)
  VALUES ('evidence', v_path,
          pg_catalog.jsonb_build_object('mimetype', 'video/mp4', 'size', 5242880));

  -- The unrelated pair for P2a-8.
  SELECT m.centre_id, m.class_module_id, m.class_session_id, m.student_id,
         m.enrolment_id, m.observation_id, m.trainer_membership_id
    INTO v_b_centre, v_b_module, v_b_session, v_b_student, v_b_enrol, v_b_obs, v_b_tm
    FROM pg_temp.mint_isolated_pair('P2B') m;
  INSERT INTO public.reports (centre_id, class_session_id, class_module_id, student_id,
                              enrolment_id, observation_id, status, lock_version)
       VALUES (v_b_centre, v_b_session, v_b_module, v_b_student, v_b_enrol, v_b_obs,
               'draft_ready', 2)
    RETURNING id INTO v_b_report;

  RAISE NOTICE 'DURING-COUNTS %', pg_temp.runner_counts();
  RAISE NOTICE 'P2A-SETUP -- two minted pairs, one uploaded object, IN THIS TRANSACTION ONLY';

  EXECUTE 'SET LOCAL ROLE authenticated';

  -- ---------------------------------------------------------------
  -- P2a-1 -- NON-VACUITY AND THE PERMIT LEG, FIRST.
  -- ---------------------------------------------------------------
  PERFORM pg_temp.as_trainer();
  SELECT o_attached INTO v_ok FROM public.evidence_attach_confirm(v_report, v_ev);
  IF v_ok THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P2a-1 -- the AUTHORING TRAINER attached the object (non-vacuity)';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P2a-1 -- the authoring trainer could not attach; every deny below would be vacuous'; END IF;

  -- ---------------------------------------------------------------
  -- P2a-2 -- the trainer lists it, and NO storage path comes back.
  -- ---------------------------------------------------------------
  SELECT count(*) INTO v_n FROM public.evidence_list_for_report(v_session, v_student);
  IF v_n = 1 THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P2a-2 -- trainer lists exactly 1 evidence row';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P2a-2 -- trainer listed % rows, expected 1', v_n; END IF;

  EXECUTE 'RESET ROLE';
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   CROSS JOIN LATERAL pg_catalog.unnest(p.proargnames) AS a(nm)
   WHERE n.nspname = 'public' AND p.proname = 'evidence_list_for_report'
     AND (a.nm ILIKE '%path%' OR a.nm ILIKE '%object%' OR a.nm ILIKE '%url%');
  IF v_n = 0 THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P2a-2b -- the list read exposes NO path/object/url field (A-001 gate 7)';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P2a-2b -- the list read exposes % path-like field(s)', v_n; END IF;
  EXECUTE 'SET LOCAL ROLE authenticated';

  -- ---------------------------------------------------------------
  -- P2a-3 -- MANAGEMENT lists it. D-5: visual verification is part of
  -- approval, so this is a PERMIT, not a leak.
  -- ---------------------------------------------------------------
  PERFORM pg_temp.as_management();
  SELECT count(*) INTO v_n FROM public.evidence_list_for_report(v_session, v_student);
  IF v_n = 1 THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P2a-3 -- management lists it (D-5: views it before Approve & Submit)';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P2a-3 -- management listed % rows, expected 1', v_n; END IF;

  -- ---------------------------------------------------------------
  -- P2a-4 -- DENY: management cannot ATTACH.
  -- ---------------------------------------------------------------
  EXECUTE 'RESET ROLE';
  INSERT INTO storage.objects (bucket_id, name, metadata)
  VALUES ('evidence', v_b_report::text || '/' || v_ev2::text || '.mp4',
          pg_catalog.jsonb_build_object('mimetype', 'video/mp4', 'size', 1048576));
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_management();
  SELECT o_attached INTO v_ok FROM public.evidence_attach_confirm(v_b_report, v_ev2);
  IF NOT v_ok THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P2a-4 -- management CANNOT attach; upload is the Trainer''s (D-5)';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P2a-4 -- management attached evidence'; END IF;

  -- ---------------------------------------------------------------
  -- P2a-5 / P2a-6 -- DENY: parent, then anon.
  -- ---------------------------------------------------------------
  PERFORM pg_temp.as_parent();
  SELECT count(*) INTO v_n FROM public.evidence_list_for_report(v_session, v_student);
  IF v_n = 0 THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P2a-5 -- PARENT reads nothing; A-002 is unruled and no parent arm exists';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P2a-5 -- parent read % rows', v_n; END IF;

  PERFORM pg_temp.as_nobody();
  SELECT count(*) INTO v_n FROM public.evidence_list_for_report(v_session, v_student);
  IF v_n = 0 THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P2a-6 -- ANON reads nothing';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P2a-6 -- anon read % rows', v_n; END IF;

  -- ---------------------------------------------------------------
  -- P2a-7 -- ⚠️ THE CONTROL, AFTER the denials.
  -- ---------------------------------------------------------------
  PERFORM pg_temp.as_trainer();
  SELECT count(*) INTO v_n FROM public.evidence_list_for_report(v_session, v_student);
  IF v_n = 1 THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P2a-7 -- CONTROL: the probe still returns for a permitted caller; the zeros are DISCRIMINATION';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P2a-7 -- the control read % rows; every deny above is uninterpretable', v_n; END IF;

  -- ---------------------------------------------------------------
  -- P2a-8 -- UNRELATED REPORT. Same caller, different child.
  -- ---------------------------------------------------------------
  SELECT count(*) INTO v_n FROM public.evidence_list_for_report(v_b_session, v_b_student);
  IF v_n = 0 THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P2a-8 -- an unrelated report returns ZERO even to an authorized caller';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P2a-8 -- an unrelated report leaked % rows', v_n; END IF;

  EXECUTE 'RESET ROLE';

  -- ---------------------------------------------------------------
  -- P2a-9 -- ⚠️ THE 100 MiB CHECK FIRES, MEASURED.
  -- ---------------------------------------------------------------
  BEGIN
    INSERT INTO public.report_evidence (report_id, centre_id, storage_object_path,
                                        media_type, byte_size,
                                        uploaded_by_account_id, uploaded_by_membership_id)
    SELECT v_b_report, v_b_centre, 'oversize/probe.mp4', 'video/mp4', 104857601,
           m.account_id, m.id FROM public.centre_memberships m WHERE m.id = v_b_tm;
    v_sqlstate := 'NONE';
  EXCEPTION WHEN OTHERS THEN
    v_sqlstate := SQLSTATE;
  END;
  IF v_sqlstate = '23514' THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P2a-9 -- 104857601 bytes REFUSED by CHECK (23514), measured not asserted';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P2a-9 -- oversize insert returned SQLSTATE %, expected 23514', v_sqlstate; END IF;

  BEGIN
    INSERT INTO public.report_evidence (report_id, centre_id, storage_object_path,
                                        media_type, byte_size,
                                        uploaded_by_account_id, uploaded_by_membership_id)
    SELECT v_b_report, v_b_centre, 'atlimit/probe.mp4', 'video/mp4', 104857600,
           m.account_id, m.id FROM public.centre_memberships m WHERE m.id = v_b_tm;
    v_sqlstate := 'NONE';
  EXCEPTION WHEN OTHERS THEN
    v_sqlstate := SQLSTATE;
  END;
  IF v_sqlstate = 'NONE' THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P2a-9b -- CONTROL: exactly 104857600 is ACCEPTED, so the CHECK is a ceiling and not a blanket refusal';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P2a-9b -- the at-limit insert failed with %', v_sqlstate; END IF;
  DELETE FROM public.report_evidence WHERE storage_object_path = 'atlimit/probe.mp4';

  -- ---------------------------------------------------------------
  -- P2a-10 -- SERVER-SIDE RE-VALIDATION against the STORED bytes.
  -- ---------------------------------------------------------------
  UPDATE storage.objects
     SET metadata = pg_catalog.jsonb_build_object('mimetype', 'video/mp4', 'size', 209715200)
   WHERE bucket_id = 'evidence' AND name = v_b_report::text || '/' || v_ev2::text || '.mp4';
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_trainer();
  SELECT o_attached INTO v_ok FROM public.evidence_attach_confirm(v_b_report, v_ev2);
  EXECUTE 'RESET ROLE';
  SELECT count(*) INTO v_n FROM public.report_evidence WHERE report_id = v_b_report;
  IF (NOT v_ok) AND v_n = 0 THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P2a-10 -- a 200 MiB STORED object is refused and creates NO row; the caller declares no size';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P2a-10 -- attached=% rows=%', v_ok, v_n; END IF;

  -- ---------------------------------------------------------------
  -- P2a-11 -- ⚠️ THE BUCKET INVARIANT FIRES, with its control first.
  -- ---------------------------------------------------------------
  IF pg_temp.buckets_without_limit() = 0 THEN
    v_pass := v_pass + 1; RAISE NOTICE 'PASS P2a-11a -- CONTROL: every existing bucket is private and carries a limit';
  ELSE
    v_fail := v_fail + 1; RAISE WARNING 'FAIL P2a-11a -- % bucket(s) already violate the invariant', pg_temp.buckets_without_limit();
  END IF;
  -- The deferred photo bucket, created the WRONG way, exactly as C-16 warns.
  INSERT INTO storage.buckets (id, name, public, file_size_limit)
  VALUES ('probe-deferred-photo', 'probe-deferred-photo', false, NULL);
  IF pg_temp.buckets_without_limit() = 1 THEN
    v_pass := v_pass + 1; RAISE NOTICE 'PASS P2a-11b -- the invariant FIRES on a bucket created without a limit -- the deferred-bucket case C-16 names';
  ELSE
    v_fail := v_fail + 1; RAISE WARNING 'FAIL P2a-11b -- the invariant did not fire; it would be silent on the photo and materials buckets';
  END IF;
  -- ⚠️ NOT deleted here: storage.protect_delete() refuses direct DELETE from
  -- storage.buckets. The ROLLBACK is what removes it, which is another reason
  -- this suite is transaction-scoped.

  -- ---------------------------------------------------------------
  -- P2a-12 -- ALL THREE STRINGS, AND CHAIN VERIFICATION ACCEPTS THEM.
  -- ---------------------------------------------------------------
  SELECT count(*) INTO v_audit0 FROM public.audit_events;
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_trainer();
  PERFORM public.evidence_record_access(v_ev);
  PERFORM public.evidence_remove(v_ev);
  EXECUTE 'RESET ROLE';

  -- ⚠️ SCOPED TO **THIS SUITE'S OWN CLIP**, AND IT WAS NOT BEFORE.
  --
  -- The original counted every `evidence.*` row in the table. That was
  -- correct while the canonical database held none — and it went red the
  -- moment the Operator's walkthrough attached two real clips, reporting
  -- "5 written, expected 3" about events this suite never wrote.
  -- ▶ **A leg that counts globally is measuring the world, not the thing it
  --   is asserting about.** Same family as the before/after comparison whose
  --   two sides were built by different code: the count was real, it just
  --   wasn't a count of what the sentence claimed.
  -- ⛔ Narrowed, NOT loosened: it still demands exactly three, and all three
  --   must belong to this transaction's own evidence id.
  SELECT count(*) INTO v_n FROM public.audit_events
   WHERE action IN ('evidence.attached', 'evidence.accessed', 'evidence.removed')
     AND target_id = v_ev;
  IF v_n = 3 THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P2a-12a -- all THREE new strings were accepted and written FOR THIS SUITE''S OWN CLIP (non-vacuity for the verify leg)';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P2a-12a -- % evidence events written for this clip, expected 3', v_n; END IF;

  SELECT v.ok INTO v_ok FROM public.audit_verify_chain(v_centre) v;
  IF v_ok THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P2a-12b -- audit_verify_chain ACCEPTS a chain containing all three new actions';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P2a-12b -- chain verification REJECTED the new strings; this is the one-sided-extension corruption'; END IF;

  v_n := 0;
  FOREACH v_src IN ARRAY ARRAY['audit_append_event','audit_verify_chain'] LOOP
    IF (SELECT p.prosrc FROM pg_catalog.pg_proc p
          JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
         WHERE n.nspname = 'public' AND p.proname = v_src) LIKE '%audit_action_registry()%'
    THEN v_n := v_n + 1; END IF;
  END LOOP;
  IF v_n = 2 THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P2a-12c -- BOTH declaration sites resolve through the single-source registry';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P2a-12c -- only % of 2 sites read the single-source registry', v_n; END IF;

  -- ---------------------------------------------------------------
  -- P2a-13 -- A DENIED access emits NOTHING (A-057, success only).
  -- ---------------------------------------------------------------
  SELECT count(*) INTO v_audit0 FROM public.audit_events;
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_parent();
  PERFORM public.evidence_record_access(v_ev2);
  PERFORM pg_temp.as_nobody();
  PERFORM public.evidence_record_access(v_ev2);
  EXECUTE 'RESET ROLE';
  SELECT count(*) INTO v_audit1 FROM public.audit_events;
  IF v_audit1 = v_audit0 THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P2a-13 -- two DENIED access attempts emitted NOTHING (A-057: success only)';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P2a-13 -- a denied access wrote % audit row(s)', v_audit1 - v_audit0; END IF;

  RAISE NOTICE 'P1-2 SUITE RESULT -- % PASS, % FAIL', v_pass, v_fail;
  IF v_fail > 0 THEN
    RAISE EXCEPTION 'P1-2 suite FAILED with % failing leg(s)', v_fail;
  END IF;
END;
$suite$;

ROLLBACK;
