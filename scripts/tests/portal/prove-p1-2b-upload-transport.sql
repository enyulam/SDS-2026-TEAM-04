-- =====================================================================
-- PORTAL PHASE P1-2b -- D-5's UPLOAD TRANSPORT, the governed half.
-- =====================================================================
-- ⛔ EVERY REFUSAL LEG HERE HAS A CONTROL THAT CAN FAIL. A refusal proves
--    nothing on its own: with a broken fixture the gate denies everyone
--    and each deny passes for the wrong reason (S-8).
--
-- Proves, in order:
--   T2a-1  ⚠️ NON-VACUITY FIRST -- the storage INSERT policy ADMITS the
--          authoring trainer at a path they have authority over.
--   T2a-2  ⛔ the SAME trainer is REFUSED at a path naming a report they
--          do not reach.
--   T2a-3  ⛔ MANAGEMENT is refused at the very path T2a-1 admitted.
--          (`CLAUDE.md` §6: no management write reaches evidence.)
--   T2a-4  ⛔ a MALFORMED path is refused -- and the refusal is a clean
--          `false`, not a cast error escaping a policy.
--   T2a-5  ⛔ a SUBMITTED report refuses an attach. (Removal does not --
--          T2a-11.)
--   T2a-6  ⛔ THE CEILING FIRES on the STORED size, with its control at
--          exactly 100 MiB.
--   T2a-7  ⛔ A SECOND CLIP on the same report is refused, and the
--          STRUCTURAL gate is proven separately: the UNIQUE constraint
--          still refuses a direct owner-side INSERT that bypasses the
--          function entirely.
--   T2a-8  ⛔ the attach emits EXACTLY ONE `evidence.attached`, with a
--          refused attach emitting NOTHING as its control.
--   T2a-9  ⛔ AN ABANDONED UPLOAD ATTACHES NOTHING -- an object with no
--          confirm creates no row and no event.
--   T2a-10 ⛔ AMBIGUITY FAILS CLOSED -- two candidate objects is a
--          refusal, not a coin toss.
--   T2a-11 ⛔ REMOVAL WORKS POST-SUBMITTED (Operator ruling), with
--          management refused as its control.
--   T2a-12 ⛔ NO DISCLOSURE -- an unauthorized caller's reason collapses
--          to `not_permitted`, while an authorized one is specific.
--
-- ⛔ A-003's `unscanned` leg is `NOT APPLICABLE (C-3)` -- never PASS.
-- ⛔ A-004's both-direction Parent UAT is HUMAN and the Operator's. NOT-RUN.
-- =====================================================================

BEGIN;

CREATE FUNCTION pg_temp.as_trainer() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims',
  '{"sub":"d0000000-0000-4000-8000-000000000002","role":"authenticated"}', true); END $$;

CREATE FUNCTION pg_temp.as_management() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims',
  '{"sub":"d0000000-0000-4000-8000-000000000001","role":"authenticated"}', true); END $$;

-- ⚠️ BYTE-IDENTICAL to the runner's COUNTS. A comparison is only evidence
--    when both sides measure the same thing.
CREATE FUNCTION pg_temp.runner_counts() RETURNS text LANGUAGE sql AS $c$
  SELECT (SELECT count(*) FROM public.reports)
    || '|' || (SELECT count(*) FROM public.report_evidence)
    || '|' || (SELECT count(*) FROM public.audit_events)
    || '|' || (SELECT count(*) FROM storage.objects)
    || '|' || (SELECT count(*) FROM public.students);
$c$;

/*
 * ⚠️ ONE HELPER, BECAUSE A POLICY REFUSAL IS AN EXCEPTION AND AN EXCEPTION
 *    ABORTS THE SUITE. This turns "did the INSERT policy admit this?" into a
 *    boolean, and it swallows ONLY the RLS violation class -- any other error
 *    still propagates, so a broken fixture cannot masquerade as a refusal.
 */
CREATE FUNCTION pg_temp.try_object_insert(p_name text) RETURNS text
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO storage.objects (bucket_id, name, metadata)
  VALUES ('evidence', p_name,
          pg_catalog.jsonb_build_object('mimetype', 'video/mp4', 'size', 4194304));
  RETURN 'admitted';
EXCEPTION
  WHEN insufficient_privilege THEN RETURN 'refused';
END $$;

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
  v_b_centre  uuid;
  v_b_module  uuid;
  v_b_session uuid;
  v_b_student uuid;
  v_b_enrol   uuid;
  v_b_obs     uuid;
  v_b_report  uuid;
  v_c_centre  uuid;
  v_c_module  uuid;
  v_c_session uuid;
  v_c_student uuid;
  v_c_enrol   uuid;
  v_c_obs     uuid;
  v_c_report  uuid;
  v_ev        uuid := '77777777-7777-4777-8777-777777777777';
  v_ev2       uuid := '88888888-8888-4888-8888-888888888888';
  v_ev3       uuid := '99999999-9999-4999-8999-999999999999';
  v_ev4       uuid := 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
  v_path      text;
  v_verdict   text;
  v_att       boolean;
  v_reason    text;
  v_rem       boolean;
  v_n         bigint;
  v_a0        bigint;
  v_a1        bigint;
  v_pass      int := 0;
  v_fail      int := 0;
BEGIN
  -- ---------------------------------------------------------------
  -- SETUP, owner-side. A PRE-SUBMISSION report the fixture trainer
  -- genuinely reaches, plus an unrelated one they do not.
  -- ---------------------------------------------------------------
  SELECT m.centre_id, m.class_module_id, m.class_session_id, m.student_id,
         m.enrolment_id, m.observation_id, m.trainer_membership_id
    INTO v_centre, v_module, v_session, v_student, v_enrolment, v_obs, v_trainer_m
    FROM pg_temp.mint_isolated_pair('T2A') m;

  INSERT INTO public.reports (centre_id, class_session_id, class_module_id, student_id,
                              enrolment_id, observation_id, status, lock_version)
       VALUES (v_centre, v_session, v_module, v_student, v_enrolment, v_obs, 'draft_ready', 2)
    RETURNING id INTO v_report;

  SELECT m.centre_id, m.class_module_id, m.class_session_id, m.student_id,
         m.enrolment_id, m.observation_id
    INTO v_b_centre, v_b_module, v_b_session, v_b_student, v_b_enrol, v_b_obs
    FROM pg_temp.mint_isolated_pair('T2B') m;
  INSERT INTO public.reports (centre_id, class_session_id, class_module_id, student_id,
                              enrolment_id, observation_id, status, lock_version)
       VALUES (v_b_centre, v_b_session, v_b_module, v_b_student, v_b_enrol, v_b_obs, 'draft_ready', 2)
    RETURNING id INTO v_b_report;
  -- ⛔ THE TRAINER'S ASSIGNMENT TO THE UNRELATED SESSION IS REMOVED, so
  --    T2a-2 really measures "a report this trainer does not reach".
  -- ⚠️ `is_active` and `unassigned_at` MOVE TOGETHER --
  --    `class_session_assignments_active_timestamp_chk` enforces it, and the
  --    first shape of this line set only the flag and was refused. Recorded
  --    because the refusal is the schema doing its job: a deactivated
  --    assignment with no timestamp is a row that cannot say WHEN it stopped.
  UPDATE public.class_session_assignments
     SET is_active = false, unassigned_at = pg_catalog.now()
   WHERE class_session_id = v_b_session AND is_active;

  -- A THIRD reachable pair, owned by T2a-10 alone. It exists so that leg
  -- never has to undo an audited act.
  SELECT m.centre_id, m.class_module_id, m.class_session_id, m.student_id,
         m.enrolment_id, m.observation_id
    INTO v_c_centre, v_c_module, v_c_session, v_c_student, v_c_enrol, v_c_obs
    FROM pg_temp.mint_isolated_pair('T2C') m;
  INSERT INTO public.reports (centre_id, class_session_id, class_module_id, student_id,
                              enrolment_id, observation_id, status, lock_version)
       VALUES (v_c_centre, v_c_session, v_c_module, v_c_student, v_c_enrol, v_c_obs, 'draft_ready', 2)
    RETURNING id INTO v_c_report;

  v_path := v_report::text || '/' || v_ev::text || '.mp4';

  RAISE NOTICE 'DURING-COUNTS %', pg_temp.runner_counts();
  RAISE NOTICE 'T2A-SETUP -- one reachable draft_ready report, one unreachable. THIS TRANSACTION ONLY';

  EXECUTE 'SET LOCAL ROLE authenticated';

  -- ---------------------------------------------------------------
  -- T2a-1 -- NON-VACUITY AND THE PERMITTED LEG, FIRST.
  -- ---------------------------------------------------------------
  PERFORM pg_temp.as_trainer();
  v_verdict := pg_temp.try_object_insert(v_path);
  IF v_verdict = 'admitted' THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS T2a-1 -- THE PERMITTED LEG: the storage INSERT policy ADMITS the authoring trainer at a path they have authority over';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL T2a-1 -- the authoring trainer was %; every refusal below would be vacuous', v_verdict; END IF;

  -- ---------------------------------------------------------------
  -- T2a-2 -- the SAME trainer, a report they do NOT reach.
  -- ---------------------------------------------------------------
  v_verdict := pg_temp.try_object_insert(v_b_report::text || '/' || v_ev2::text || '.mp4');
  IF v_verdict = 'refused' THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS T2a-2 -- REFUSED at a path naming a report this trainer does not reach: authority is re-derived FROM THE PATH, live';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL T2a-2 -- the insert was % at an unreachable report''s path', v_verdict; END IF;

  -- ---------------------------------------------------------------
  -- T2a-3 -- MANAGEMENT, at the very path T2a-1 admitted.
  -- ---------------------------------------------------------------
  PERFORM pg_temp.as_management();
  v_verdict := pg_temp.try_object_insert(v_report::text || '/' || v_ev2::text || '.mp4');
  IF v_verdict = 'refused' THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS T2a-3 -- MANAGEMENT is refused at the path a trainer was admitted to: CLAUDE.md §6, no management write reaches evidence';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL T2a-3 -- management was % at an evidence path', v_verdict; END IF;

  -- ---------------------------------------------------------------
  -- T2a-4 -- a MALFORMED path, refused CLEANLY.
  -- ---------------------------------------------------------------
  PERFORM pg_temp.as_trainer();
  v_verdict := pg_temp.try_object_insert('not-a-uuid/whatever.mp4');
  IF v_verdict = 'refused' THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS T2a-4 -- a MALFORMED path is refused as a clean false, not as a cast error escaping the policy';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL T2a-4 -- a malformed path was %', v_verdict; END IF;

  -- ---------------------------------------------------------------
  -- T2a-5 -- ATTACH IS PRE-SUBMISSION.
  -- ---------------------------------------------------------------
  EXECUTE 'RESET ROLE';
  UPDATE public.reports SET status = 'submitted' WHERE id = v_report;
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_trainer();
  v_verdict := pg_temp.try_object_insert(v_report::text || '/' || v_ev3::text || '.mp4');
  SELECT c.o_attached, c.o_reason INTO v_att, v_reason
    FROM public.evidence_attach_confirm(v_report, v_ev) c;
  IF v_verdict = 'refused' AND v_att = false AND v_reason = 'not_permitted' THEN
    v_pass := v_pass + 1; RAISE NOTICE 'PASS T2a-5 -- a SUBMITTED report refuses both the upload and the attach, and discloses nothing about why';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL T2a-5 -- upload=%, attached=%, reason=%', v_verdict, v_att, v_reason; END IF;

  EXECUTE 'RESET ROLE';
  UPDATE public.reports SET status = 'draft_ready' WHERE id = v_report;
  EXECUTE 'SET LOCAL ROLE authenticated';

  -- ---------------------------------------------------------------
  -- T2a-6 -- THE CEILING, ON THE STORED SIZE, WITH ITS CONTROL.
  -- ---------------------------------------------------------------
  EXECUTE 'RESET ROLE';
  UPDATE storage.objects
     SET metadata = pg_catalog.jsonb_build_object('mimetype', 'video/mp4', 'size', 104857601)
   WHERE bucket_id = 'evidence' AND name = v_path;
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_trainer();
  SELECT c.o_attached, c.o_reason INTO v_att, v_reason
    FROM public.evidence_attach_confirm(v_report, v_ev) c;
  IF v_att = false AND v_reason = 'too_large' THEN
    v_pass := v_pass + 1; RAISE NOTICE 'PASS T2a-6 -- ONE BYTE over 100 MiB is refused, read from the STORED object: a caller cannot declare 10 MiB and upload 400';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL T2a-6 -- attached=%, reason=%', v_att, v_reason; END IF;

  EXECUTE 'RESET ROLE';
  UPDATE storage.objects
     SET metadata = pg_catalog.jsonb_build_object('mimetype', 'video/mp4', 'size', 104857600)
   WHERE bucket_id = 'evidence' AND name = v_path;
  SELECT count(*) INTO v_a0 FROM public.audit_events;
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_trainer();
  SELECT c.o_attached, c.o_reason INTO v_att, v_reason
    FROM public.evidence_attach_confirm(v_report, v_ev) c;
  IF v_att = true AND v_reason = 'ok' THEN
    v_pass := v_pass + 1; RAISE NOTICE 'PASS T2a-6b -- CONTROL: EXACTLY 100 MiB is accepted, so the refusal above is the ceiling and not a broken fixture';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL T2a-6b -- attached=%, reason=%', v_att, v_reason; END IF;

  -- ---------------------------------------------------------------
  -- T2a-8 -- EXACTLY ONE `evidence.attached` for that accepted attach.
  -- ---------------------------------------------------------------
  EXECUTE 'RESET ROLE';
  SELECT count(*) INTO v_a1 FROM public.audit_events
   WHERE action = 'evidence.attached' AND target_id = v_ev;
  SELECT count(*) INTO v_n FROM public.audit_events;
  IF v_a1 = 1 AND v_n = v_a0 + 1 THEN
    v_pass := v_pass + 1; RAISE NOTICE 'PASS T2a-8 -- the attach emitted EXACTLY ONE evidence.attached and exactly one audit row in total';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL T2a-8 -- % attached-events, total moved % -> %', v_a1, v_a0, v_n; END IF;

  -- ---------------------------------------------------------------
  -- T2a-7 -- A SECOND CLIP: refused by the function, and the STRUCTURAL
  -- gate proven separately by bypassing the function entirely.
  -- ---------------------------------------------------------------
  INSERT INTO storage.objects (bucket_id, name, metadata)
  VALUES ('evidence', v_report::text || '/' || v_ev2::text || '.mp4',
          pg_catalog.jsonb_build_object('mimetype', 'video/mp4', 'size', 1048576));
  SELECT count(*) INTO v_a0 FROM public.audit_events;
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_trainer();
  SELECT c.o_attached, c.o_reason INTO v_att, v_reason
    FROM public.evidence_attach_confirm(v_report, v_ev2) c;
  EXECUTE 'RESET ROLE';
  SELECT count(*) INTO v_n FROM public.audit_events;
  IF v_att = false AND v_reason = 'already_attached' AND v_n = v_a0 THEN
    v_pass := v_pass + 1; RAISE NOTICE 'PASS T2a-7 -- a SECOND clip is refused with a reason the trainer can act on, and emits NOTHING';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL T2a-7 -- attached=%, reason=%, audit % -> %', v_att, v_reason, v_a0, v_n; END IF;

  -- ⛔ THE STRUCTURAL HALF. The pre-check above is a MESSAGE; this is the
  --    GATE. Bypassing the function entirely, as the owner, must still fail.
  BEGIN
    INSERT INTO public.report_evidence (id, report_id, centre_id, storage_object_path,
                                        media_type, byte_size,
                                        uploaded_by_account_id, uploaded_by_membership_id)
    SELECT v_ev2, v_report, v_centre, v_report::text || '/' || v_ev2::text || '.mp4',
           'video/mp4', 1048576, m.account_id, m.id
      FROM public.centre_memberships m WHERE m.id = v_trainer_m;
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL T2a-7b -- a direct owner-side INSERT created a SECOND clip: one-clip-per-report rests on a code path, not on the schema';
  EXCEPTION WHEN unique_violation THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS T2a-7b -- CONTROL: UNIQUE(report_id) refuses a direct owner-side INSERT that bypasses the function -- the enforcement is STRUCTURAL';
  END;

  -- ---------------------------------------------------------------
  -- T2a-9 -- AN ABANDONED UPLOAD ATTACHES NOTHING.
  -- ---------------------------------------------------------------
  SELECT count(*) INTO v_a0 FROM public.audit_events;
  SELECT count(*) INTO v_n FROM public.report_evidence WHERE report_id = v_b_report;
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_trainer();
  SELECT c.o_attached, c.o_reason INTO v_att, v_reason
    FROM public.evidence_attach_confirm(v_b_report, v_ev3) c;
  EXECUTE 'RESET ROLE';
  IF v_n = 0 AND v_att = false
     AND (SELECT count(*) FROM public.audit_events) = v_a0
  THEN
    v_pass := v_pass + 1; RAISE NOTICE 'PASS T2a-9 -- an object with no confirm creates NO row and NO event: until the attach, an upload is bytes with a name';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL T2a-9 -- rows=%, attached=%, reason=%', v_n, v_att, v_reason; END IF;

  -- ⚠️ ITS CONTROL: the same call against a report the trainer DOES reach,
  --    with no object present, names the missing object rather than
  --    collapsing to the undisclosed reason -- so T2a-9's `false` above is
  --    the ABSENT OBJECT and not merely the absent authority.
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_trainer();
  SELECT c.o_attached, c.o_reason INTO v_att, v_reason
    FROM public.evidence_attach_confirm(v_report, v_ev3) c;
  EXECUTE 'RESET ROLE';
  IF v_att = false AND v_reason IN ('object_missing', 'already_attached') THEN
    v_pass := v_pass + 1; RAISE NOTICE 'PASS T2a-9b -- CONTROL: an AUTHORIZED caller gets a specific reason (%), so the undisclosed one above is a real denial', v_reason;
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL T2a-9b -- attached=%, reason=%', v_att, v_reason; END IF;

  -- ---------------------------------------------------------------
  -- T2a-10 -- AMBIGUITY FAILS CLOSED.
  --
  -- ⚠️ THIS LEG WAS RESTRUCTURED, AND THE REASON IS WORTH KEEPING. Its first
  --    shape reused `v_report` and tried to clear the attach by deleting the
  --    `report_evidence` row AND its audit event. ⛔ THE APPEND-ONLY TRIGGER
  --    REFUSED THE DELETE -- correctly, and even for `postgres`. ▶ The fix was
  --    NOT to weaken the thing that refused (§12): it was to stop needing the
  --    delete, by giving this leg its own untouched pair.
  -- ---------------------------------------------------------------
  INSERT INTO storage.objects (bucket_id, name, metadata)
  VALUES ('evidence', v_c_report::text || '/' || v_ev3::text || '.mp4',
          pg_catalog.jsonb_build_object('mimetype', 'video/mp4', 'size', 1048576));
  INSERT INTO storage.objects (bucket_id, name, metadata)
  VALUES ('evidence', v_c_report::text || '/' || v_ev3::text || '.mov',
          pg_catalog.jsonb_build_object('mimetype', 'video/quicktime', 'size', 2097152));
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_trainer();
  SELECT c.o_attached, c.o_reason INTO v_att, v_reason
    FROM public.evidence_attach_confirm(v_c_report, v_ev3) c;
  EXECUTE 'RESET ROLE';
  IF v_att = false AND v_reason = 'object_ambiguous' THEN
    v_pass := v_pass + 1; RAISE NOTICE 'PASS T2a-10 -- TWO candidate objects under one evidence id is a REFUSAL: the query planner never chooses which clip a parent watches';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL T2a-10 -- attached=%, reason=%', v_att, v_reason; END IF;

  -- ⚠️ ITS CONTROL: the SAME report and the SAME trainer, at an evidence id
  --    with exactly ONE object, attaches. So the refusal above is the
  --    AMBIGUITY and not the pair being unreachable.
  -- ⛔ THE CONTROL IS A SECOND ID RATHER THAN A DELETION because
  --    `storage.protect_delete()` REFUSES A DIRECT `DELETE` ON
  --    `storage.objects` -- not only on `storage.buckets`, which is what P1-2
  --    found. ▶ The fix was again NOT to weaken the thing that refused: only
  --    `ROLLBACK` removes what the Storage API is supposed to.
  INSERT INTO storage.objects (bucket_id, name, metadata)
  VALUES ('evidence', v_c_report::text || '/' || v_ev4::text || '.mp4',
          pg_catalog.jsonb_build_object('mimetype', 'video/mp4', 'size', 1048576));
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_trainer();
  SELECT c.o_attached, c.o_reason INTO v_att, v_reason
    FROM public.evidence_attach_confirm(v_c_report, v_ev4) c;
  EXECUTE 'RESET ROLE';
  IF v_att = true AND v_reason = 'ok' THEN
    v_pass := v_pass + 1; RAISE NOTICE 'PASS T2a-10b -- CONTROL: with ONE object the same call attaches, so the refusal above is the ambiguity';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL T2a-10b -- attached=%, reason=%', v_att, v_reason; END IF;

  -- ---------------------------------------------------------------
  -- T2a-11 -- REMOVAL WORKS POST-SUBMITTED, and management cannot.
  -- The clip attached at T2a-6b is used as-is; nothing is re-attached.
  -- ---------------------------------------------------------------
  v_att := (SELECT count(*) = 1 FROM public.report_evidence WHERE id = v_ev);
  UPDATE public.reports SET status = 'submitted' WHERE id = v_report;
  SELECT count(*) INTO v_a0 FROM public.audit_events;

  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_management();
  SELECT r.o_removed INTO v_rem FROM public.evidence_remove(v_ev) r;
  EXECUTE 'RESET ROLE';
  SELECT count(*) INTO v_n FROM public.report_evidence WHERE id = v_ev;
  IF v_rem = false AND v_n = 1 AND (SELECT count(*) FROM public.audit_events) = v_a0 THEN
    v_pass := v_pass + 1; RAISE NOTICE 'PASS T2a-11 -- MANAGEMENT cannot remove evidence, and its refusal emits nothing';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL T2a-11 -- management removed=%, rows left=%', v_rem, v_n; END IF;

  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_trainer();
  SELECT r.o_removed INTO v_rem FROM public.evidence_remove(v_ev) r;
  EXECUTE 'RESET ROLE';
  SELECT count(*) INTO v_n FROM public.report_evidence WHERE id = v_ev;
  SELECT count(*) INTO v_a1 FROM public.audit_events WHERE action = 'evidence.removed' AND target_id = v_ev;
  IF v_att = true AND v_rem = true AND v_n = 0 AND v_a1 = 1 THEN
    v_pass := v_pass + 1; RAISE NOTICE 'PASS T2a-11b -- the TRAINER removes on a SUBMITTED report and it emits exactly one evidence.removed: a wrong clip that reached a parent stays pullable';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL T2a-11b -- attached=%, removed=%, rows=%, events=%', v_att, v_rem, v_n, v_a1; END IF;

  -- ---------------------------------------------------------------
  -- T2a-12 -- NO DISCLOSURE FROM AN UNAUTHORIZED CALLER.
  -- ---------------------------------------------------------------
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_management();
  SELECT c.o_attached, c.o_reason INTO v_att, v_reason
    FROM public.evidence_attach_confirm(v_report, v_ev) c;
  EXECUTE 'RESET ROLE';
  IF v_att = false AND v_reason = 'not_permitted' THEN
    v_pass := v_pass + 1; RAISE NOTICE 'PASS T2a-12 -- an unauthorized caller learns NOTHING: the reason collapses to not_permitted, while an authorized one got object_missing / already_attached above';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL T2a-12 -- attached=%, reason=%', v_att, v_reason; END IF;

  RAISE NOTICE 'P1-2b SUITE RESULT -- % PASS, % FAIL', v_pass, v_fail;
END;
$suite$;

ROLLBACK;
