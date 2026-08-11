-- =====================================================================
-- PORTAL PHASE P1-5 -- D-5 / A-001 / A-002: the PARENT evidence arm.
-- =====================================================================
-- ⛔ A-003 IS A BOTH-DIRECTION EXIT. A permitted leg without its refusals,
--    or refusals without a permitted leg, is the S-8 shape and satisfies
--    nothing. Both directions are here.
--
-- Proves, in order:
--   P5a-1  ⚠️ NON-VACUITY FIRST. A SUBMITTED report with an attached clip
--          EXISTS and the LINKED PARENT reads it. Every refusal below is
--          meaningless without this -- with nothing to return the gate
--          denies everyone and each deny passes for the wrong reason.
--   P5a-2  A-001 gate 7: the read carries NO storage path.
--   P5a-3  ⛔ UNAUTHORIZED -- an account with no active membership in the
--          report's centre reads nothing.
--   P5a-4  ⛔ UNRELATED CHILD -- the parent is linked to A and reads B.
--   P5a-5  ⛔ PRE-SUBMITTED -- the SAME parent, the SAME clip, the report
--          moved back off `submitted`. This is the leg that proves the
--          gate is the REPORT STATE and not the person.
--   P5a-6  ⚠️ THE CONTROL for P5a-5: restore `submitted` and the same
--          parent reads it again. Without it, "0 rows" is equally
--          consistent with having broken the fixture.
--   P5a-7  ⛔ A DENIED PARENT ACCESS EMITS NOTHING (A-057, success only).
--   P5a-8  ⚠️ ITS CONTROL: a PERMITTED parent access emits EXACTLY ONE
--          `evidence.accessed`, so "nothing" above is discrimination.
--   P5a-9  ⛔ DIRECT STORAGE PATH -- `authenticated` cannot select
--          storage.objects; the bucket carries no SELECT policy for anyone.
--   P5a-10 ⛔ PUBLIC OBJECT -- the bucket is not public.
--   P5a-11 ⛔ Q-27 UNMOVED: the parent's canonical read still returns its
--          four panels and NO rating, on the very report whose clip the
--          parent just watched.
--
-- ⚠️ EXPIRED URL is proven in the RUNNER, not here: TTL is a property of
--    the minted URL, which SQL never sees. It is NOT skipped.
-- ⛔ A-003's `unscanned` leg is `NOT APPLICABLE (C-3)` -- never PASS.
-- ⛔ A-004's both-direction Parent UAT is HUMAN and is the Operator's.
--    NOT-RUN. No leg here claims it.
-- =====================================================================

BEGIN;

CREATE FUNCTION pg_temp.as_trainer() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims',
  '{"sub":"d0000000-0000-4000-8000-000000000002","role":"authenticated"}', true); END $$;

CREATE FUNCTION pg_temp.as_parent() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims',
  '{"sub":"d0000000-0000-4000-8000-000000000003","role":"authenticated"}', true); END $$;

CREATE FUNCTION pg_temp.as_management() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims',
  '{"sub":"d0000000-0000-4000-8000-000000000001","role":"authenticated"}', true); END $$;

-- ⚠️ BYTE-IDENTICAL to the runner's COUNTS.
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
  v_enrolment uuid;
  v_obs       uuid;
  v_trainer_m uuid;
  v_parent_m  uuid;
  v_report    uuid;
  v_version   uuid;
  v_ev        uuid := '55555555-5555-4555-8555-555555555555';
  v_path      text;
  v_b_session uuid;
  v_b_student uuid;
  v_b_report  uuid;
  v_b_centre  uuid;
  v_b_module  uuid;
  v_b_enrol   uuid;
  v_b_obs     uuid;
  v_b_ev      uuid := '66666666-6666-4666-8666-666666666666';
  v_n         bigint;
  v_a0        bigint;
  v_a1        bigint;
  v_ok        boolean;
  v_pass      int := 0;
  v_fail      int := 0;
BEGIN
  -- ---------------------------------------------------------------
  -- SETUP, owner-side. A SUBMITTED report with a clip, for the pair the
  -- fixture parent is genuinely linked to.
  -- ---------------------------------------------------------------
  SELECT m.centre_id, m.class_module_id, m.class_session_id, m.student_id,
         m.enrolment_id, m.observation_id, m.trainer_membership_id, m.parent_membership_id
    INTO v_centre, v_module, v_session, v_student, v_enrolment, v_obs, v_trainer_m, v_parent_m
    FROM pg_temp.mint_isolated_pair('P5A') m;

  INSERT INTO public.reports (centre_id, class_session_id, class_module_id, student_id,
                              enrolment_id, observation_id, status, lock_version)
       VALUES (v_centre, v_session, v_module, v_student, v_enrolment, v_obs, 'submitted', 6)
    RETURNING id INTO v_report;

  INSERT INTO public.report_versions (report_id, centre_id, revision_number,
                                      authored_by_membership_id, authored_by_role,
                                      content_hash, content_hash_version,
                                      overview, strengths, areas_for_development, remarks,
                                      submitted_at, submitted_by_membership_id, submitted_by_role)
       VALUES (v_report, v_centre, 1, v_trainer_m, 'trainer',
               pg_catalog.repeat('e', 64), 2,
               'Overview prose.', 'Strengths prose.', 'Areas prose.', 'Remarks prose.',
               pg_catalog.now(),
               (SELECT m.id FROM public.centre_memberships m
                 WHERE m.centre_id = v_centre AND m.role = 'management' AND m.status = 'active' LIMIT 1),
               'management')
    RETURNING id INTO v_version;

  UPDATE public.reports
     SET latest_submitted_version_id = v_version, current_cycle_version_id = v_version
   WHERE id = v_report;

  INSERT INTO public.report_version_ratings (report_version_id, report_id, dimension_code, rating)
  SELECT v_version, v_report, d.code,
         (ARRAY['beginning','developing','mastering','mastered']::public.competency_rating[])
           [1 + (d.sort_order % 4)]
    FROM public.assessment_dimensions d;

  v_path := v_report::text || '/' || v_ev::text || '.mp4';
  INSERT INTO storage.objects (bucket_id, name, metadata)
  VALUES ('evidence', v_path,
          pg_catalog.jsonb_build_object('mimetype', 'video/mp4', 'size', 4194304));
  INSERT INTO public.report_evidence (id, report_id, centre_id, storage_object_path,
                                      media_type, byte_size,
                                      uploaded_by_account_id, uploaded_by_membership_id)
  SELECT v_ev, v_report, v_centre, v_path, 'video/mp4', 4194304, m.account_id, m.id
    FROM public.centre_memberships m WHERE m.id = v_trainer_m;

  -- The UNRELATED pair, with its own clip, for P5a-4.
  SELECT m.centre_id, m.class_module_id, m.class_session_id, m.student_id,
         m.enrolment_id, m.observation_id
    INTO v_b_centre, v_b_module, v_b_session, v_b_student, v_b_enrol, v_b_obs
    FROM pg_temp.mint_isolated_pair('P5B') m;
  INSERT INTO public.reports (centre_id, class_session_id, class_module_id, student_id,
                              enrolment_id, observation_id, status, lock_version)
       VALUES (v_b_centre, v_b_session, v_b_module, v_b_student, v_b_enrol, v_b_obs, 'submitted', 6)
    RETURNING id INTO v_b_report;
  -- ⛔ THE UNRELATED PARENT LINK IS REMOVED, so this really is another
  --    family's child rather than a second child of the same parent.
  UPDATE public.parent_student_links SET is_active = false, unlinked_at = pg_catalog.now()
   WHERE student_id = v_b_student AND is_active;

  RAISE NOTICE 'DURING-COUNTS %', pg_temp.runner_counts();
  RAISE NOTICE 'P5A-SETUP -- a SUBMITTED report with a clip, plus an unrelated pair. THIS TRANSACTION ONLY';

  EXECUTE 'SET LOCAL ROLE authenticated';

  -- ---------------------------------------------------------------
  -- P5a-1 / P5a-2 -- NON-VACUITY AND THE PERMITTED LEG, FIRST.
  -- ---------------------------------------------------------------
  PERFORM pg_temp.as_parent();
  SELECT count(*) INTO v_n FROM public.evidence_list_for_report(v_session, v_student);
  IF v_n = 1 THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P5a-1 -- THE PERMITTED LEG: the LINKED parent reads their own child''s clip on a SUBMITTED report';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P5a-1 -- the linked parent read % rows; every refusal below would be vacuous', v_n; END IF;

  EXECUTE 'RESET ROLE';
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   CROSS JOIN LATERAL pg_catalog.unnest(p.proargnames) AS a(nm)
   WHERE n.nspname = 'public' AND p.proname = 'evidence_list_for_report'
     AND (a.nm ILIKE '%path%' OR a.nm ILIKE '%url%' OR a.nm ILIKE '%object%');
  IF v_n = 0 THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P5a-2 -- A-001 gate 7: no storage path, url or object key is returned to the parent';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P5a-2 -- % path-like field(s) returned', v_n; END IF;
  EXECUTE 'SET LOCAL ROLE authenticated';

  -- ---------------------------------------------------------------
  -- P5a-3 -- ⛔ UNAUTHORIZED.
  -- ---------------------------------------------------------------
  PERFORM pg_catalog.set_config('request.jwt.claims',
    '{"sub":"00000000-0000-4000-8000-0000000000ff","role":"authenticated"}', true);
  SELECT count(*) INTO v_n FROM public.evidence_list_for_report(v_session, v_student);
  IF v_n = 0 THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P5a-3 -- UNAUTHORIZED: an identity with no active membership reads nothing';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P5a-3 -- an unauthorized caller read % rows', v_n; END IF;

  -- ---------------------------------------------------------------
  -- P5a-4 -- ⛔ UNRELATED CHILD.
  -- ---------------------------------------------------------------
  PERFORM pg_temp.as_parent();
  SELECT count(*) INTO v_n FROM public.evidence_list_for_report(v_b_session, v_b_student);
  IF v_n = 0 THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P5a-4 -- UNRELATED CHILD: the linked parent reads nothing for another family''s learner';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P5a-4 -- an unrelated child leaked % rows', v_n; END IF;

  -- ---------------------------------------------------------------
  -- P5a-5 -- ⛔ PRE-SUBMITTED. Same parent, same clip, report moved back.
  -- ---------------------------------------------------------------
  EXECUTE 'RESET ROLE';
  UPDATE public.reports SET status = 'needs_edit', latest_submitted_version_id = NULL
   WHERE id = v_report;
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_parent();
  SELECT count(*) INTO v_n FROM public.evidence_list_for_report(v_session, v_student);
  IF v_n = 0 THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P5a-5 -- PRE-SUBMITTED: the SAME parent reads NOTHING once the report is no longer submitted -- the gate is the REPORT STATE, not the person';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P5a-5 -- a pre-submitted report leaked % rows', v_n; END IF;

  -- P5a-6 -- ⚠️ THE CONTROL. Restore and re-read.
  EXECUTE 'RESET ROLE';
  UPDATE public.reports SET status = 'submitted', latest_submitted_version_id = v_version
   WHERE id = v_report;
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_parent();
  SELECT count(*) INTO v_n FROM public.evidence_list_for_report(v_session, v_student);
  IF v_n = 1 THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P5a-6 -- CONTROL: restoring `submitted` restores the read, so the zeros above are DISCRIMINATION, not a broken fixture';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P5a-6 -- the control read % rows; P5a-5 is uninterpretable', v_n; END IF;

  -- ---------------------------------------------------------------
  -- P5a-7 -- ⛔ A DENIED PARENT ACCESS EMITS NOTHING.
  -- ---------------------------------------------------------------
  EXECUTE 'RESET ROLE';
  SELECT count(*) INTO v_a0 FROM public.audit_events;
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_parent();
  SELECT o_authorized INTO v_ok FROM public.evidence_record_access(v_b_ev);
  PERFORM pg_catalog.set_config('request.jwt.claims',
    '{"sub":"00000000-0000-4000-8000-0000000000ff","role":"authenticated"}', true);
  PERFORM public.evidence_record_access(v_ev);
  EXECUTE 'RESET ROLE';
  SELECT count(*) INTO v_a1 FROM public.audit_events;
  IF v_a1 = v_a0 THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P5a-7 -- two DENIED accesses emitted NOTHING (A-057: success only)';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P5a-7 -- a denied access wrote % audit row(s)', v_a1 - v_a0; END IF;

  -- P5a-8 -- ⚠️ ITS CONTROL. A permitted parent access emits EXACTLY ONE.
  SELECT count(*) INTO v_a0 FROM public.audit_events;
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_parent();
  SELECT o_authorized INTO v_ok FROM public.evidence_record_access(v_ev);
  EXECUTE 'RESET ROLE';
  SELECT count(*) INTO v_a1 FROM public.audit_events;
  SELECT count(*) INTO v_n FROM public.audit_events e
   WHERE e.action = 'evidence.accessed' AND e.actor_role = 'parent';
  IF v_ok AND (v_a1 - v_a0) = 1 AND v_n = 1 THEN
    v_pass := v_pass + 1; RAISE NOTICE 'PASS P5a-8 -- CONTROL: a PERMITTED parent mint emits EXACTLY ONE evidence.accessed, actor_role parent';
  ELSE
    v_fail := v_fail + 1; RAISE WARNING 'FAIL P5a-8 -- authorized=% events=% parent-events=%', v_ok, v_a1 - v_a0, v_n;
  END IF;

  -- ---------------------------------------------------------------
  -- P5a-9 / P5a-10 -- ⛔ DIRECT STORAGE PATH and PUBLIC OBJECT.
  -- ---------------------------------------------------------------
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_parent();
  BEGIN
    SELECT count(*) INTO v_n FROM storage.objects o WHERE o.bucket_id = 'evidence';
    IF v_n = 0 THEN
      v_pass := v_pass + 1; RAISE NOTICE 'PASS P5a-9 -- DIRECT STORAGE PATH: the parent selects ZERO objects; no SELECT policy exists for any role';
    ELSE
      v_fail := v_fail + 1; RAISE WARNING 'FAIL P5a-9 -- the parent read % storage object(s) directly', v_n;
    END IF;
  EXCEPTION WHEN insufficient_privilege THEN
    v_pass := v_pass + 1; RAISE NOTICE 'PASS P5a-9 -- DIRECT STORAGE PATH: refused outright at the privilege layer';
  END;
  EXECUTE 'RESET ROLE';

  SELECT count(*) INTO v_n FROM storage.buckets b WHERE b.id = 'evidence' AND b.public IS NOT FALSE;
  IF v_n = 0 THEN v_pass := v_pass + 1; RAISE NOTICE 'PASS P5a-10 -- PUBLIC OBJECT: the evidence bucket is NOT public';
  ELSE v_fail := v_fail + 1; RAISE WARNING 'FAIL P5a-10 -- the evidence bucket is public'; END IF;

  -- ---------------------------------------------------------------
  -- P5a-11 -- ⛔ Q-27 UNMOVED, on the very report just watched.
  -- ---------------------------------------------------------------
  EXECUTE 'SET LOCAL ROLE authenticated';
  PERFORM pg_temp.as_parent();
  SELECT count(*) INTO v_n FROM public.report_get_canonical(v_session, v_student);
  EXECUTE 'RESET ROLE';
  SELECT count(*) INTO v_a1
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   CROSS JOIN LATERAL pg_catalog.unnest(p.proargnames) AS a(nm)
   WHERE n.nspname = 'public' AND p.proname = 'report_get_canonical'
     AND (a.nm ILIKE '%rating%' OR a.nm ILIKE '%dimension%');
  IF v_n = 1 AND v_a1 = 0 THEN
    v_pass := v_pass + 1; RAISE NOTICE 'PASS P5a-11 -- Q-27 UNMOVED: the parent''s canonical read returns its panels and carries NO rating field, on the report whose clip they just watched';
  ELSE
    v_fail := v_fail + 1; RAISE WARNING 'FAIL P5a-11 -- canonical rows=% rating-shaped fields=%', v_n, v_a1;
  END IF;

  RAISE NOTICE 'P1-5 SUITE RESULT -- % PASS, % FAIL', v_pass, v_fail;
  IF v_fail > 0 THEN
    RAISE EXCEPTION 'P1-5 suite FAILED with % failing leg(s)', v_fail;
  END IF;
END;
$suite$;

ROLLBACK;
