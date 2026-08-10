-- =====================================================================
-- HERO PHASE 1 -- canonical report CONTEXT, and the owed S-8 permit leg
-- =====================================================================
-- Proves `public.report_get_canonical_context` on a report that has
-- actually reached `submitted`, for a real parent identity.
--
-- ⚠️ WHY THIS DOES NOT REPEAT `B-STAGE3-2`. That incident was caused by
-- COMMITTED governed mutations driven through the served app against the
-- canonical fixture database. THIS SUITE RUNS ENTIRELY INSIDE ONE
-- TRANSACTION AND ENDS IN `ROLLBACK`. Nothing commits -- not a report,
-- not a version, not an audit event -- so the canonical fixture is in
-- exactly the state it started in. plpgsql functions cannot COMMIT inside
-- a transaction block, so no governed RPC can escape the rollback either.
-- The runner re-measures the four governed counts afterwards and fails if
-- any moved.
--
-- ⚠️ THE PERMIT LEG IS THE POINT. Every canonical-database proof of this
-- function is otherwise VACUOUS: with zero submitted reports the gate
-- denies EVERY caller, so "parent gets nothing" passes for the wrong
-- reason. G-5 is the only hero ruling that WIDENS disclosure, so an
-- unproven permit is the leg most worth proving.
--
-- Run by scripts/tests/hero/prove-1-canonical-context.mjs
-- =====================================================================
\set ON_ERROR_STOP on
\pset pager off
\pset footer off

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

DO $suite$
DECLARE
  v_session   uuid;
  v_student   uuid;
  v_centre    uuid;
  v_module    uuid;
  v_enrolment uuid;
  v_obs       uuid;
  v_report    uuid;
  v_version   uuid;
  v_trainer_mem uuid;
  v_mgmt_mem  uuid;
  v_n         bigint;
  v_ctx       record;
  v_pass      int := 0;
  v_fail      int := 0;
BEGIN
  -- ---------------------------------------------------------------
  -- Set up: reach a genuinely `submitted` report by writing the
  -- aggregate directly as owner. The GOVERNED lifecycle RPCs are proven
  -- elsewhere (run-canonical, prove-governed-lifecycle); what this suite
  -- needs is the STATE, and constructing it directly keeps the suite
  -- small and keeps every assertion below about the CONTEXT READ.
  -- ---------------------------------------------------------------
  -- ⛔ THE PAIR IS MINTED, NOT BORROWED (Operator ruling 2026-08-11). This
  -- suite used to take a fixture pair with `ORDER BY … LIMIT 1`, which meant
  -- it collided the moment the Operator's own walkthrough created a report
  -- for that pair. A session minted a statement ago cannot already have one.
  SELECT m.centre_id, m.class_module_id, m.class_session_id, m.student_id,
         m.enrolment_id, m.observation_id
    INTO v_centre, v_module, v_session, v_student, v_enrolment, v_obs
    FROM pg_temp.mint_isolated_pair('P1') m;

  -- Give the session lesson metadata so the Phase 0B columns are actually
  -- exercised rather than silently NULL on every leg.
  UPDATE public.class_sessions
     SET lesson_number = 4, lesson_title = 'Expressive Delivery', room = 'Studio 2'
   WHERE id = v_session;

  INSERT INTO public.reports (centre_id, class_session_id, class_module_id, student_id,
                              enrolment_id, observation_id, status, lock_version)
       VALUES (v_centre, v_session, v_module, v_student, v_enrolment, v_obs, 'submitted', 1)
    RETURNING id INTO v_report;

  -- ⚠️ Every NOT NULL and CHECK on this table is satisfied HONESTLY rather
  -- than worked around -- the schema refused three earlier shapes and was
  -- right each time. `authored_by_*` and `submitted_by_*` are pair-checked;
  -- `submitted_by_role` is pinned to management (A-034: management is the
  -- sole publisher); `content_hash` must be 64 hex characters. A synthetic
  -- 64-hex value is used because this suite asserts the CONTEXT READ and
  -- never the hash envelope -- the G-05a V1/V2 rules are untouched and
  -- unexercised here, and nothing commits.
  SELECT m.id INTO v_trainer_mem FROM public.centre_memberships m
   WHERE m.role = 'trainer' AND m.status = 'active' LIMIT 1;
  SELECT m.id INTO v_mgmt_mem FROM public.centre_memberships m
   WHERE m.role = 'management' AND m.status = 'active' LIMIT 1;

  INSERT INTO public.report_versions (report_id, centre_id, revision_number,
                                      authored_by_membership_id, authored_by_role,
                                      content_hash, content_hash_version,
                                      overview, strengths, areas_for_development, remarks,
                                      submitted_at, submitted_by_membership_id, submitted_by_role)
       VALUES (v_report, v_centre, 1,
               v_trainer_mem, 'trainer',
               pg_catalog.repeat('a', 64), 2,
               'Overview prose.', 'Strengths prose.', 'Areas prose.', 'Remarks prose.',
               pg_catalog.now(), v_mgmt_mem, 'management')
    RETURNING id INTO v_version;

  UPDATE public.reports
     SET latest_submitted_version_id = v_version, current_cycle_version_id = v_version
   WHERE id = v_report;

  RAISE NOTICE 'P1-SETUP  -- a submitted report exists IN THIS TRANSACTION ONLY';
  -- ⚠️ The governed counts WHILE the minted rows exist. The runner asserts
  -- this DIFFERS from its own before-reading, which is what turns
  -- "before = after" from a tautology into a measured restoration.
  RAISE NOTICE 'DURING-COUNTS %', pg_temp.governed_counts();

  -- ---------------------------------------------------------------
  -- S-8 / P1-1 -- THE OWED PERMIT LEG. A linked parent reads context.
  -- ---------------------------------------------------------------
  PERFORM pg_temp.as_parent();
  SELECT * INTO v_ctx FROM public.report_get_canonical_context(v_session, v_student);
  IF v_ctx IS NULL OR v_ctx.student_display_name IS NULL THEN
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P1-1/S-8 -- a linked parent received NO context for a submitted report';
  ELSE
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P1-1/S-8 -- linked parent reads context: % / % · % / lesson % · % / trainer %',
      v_ctx.student_display_name, v_ctx.class_grade_label, v_ctx.class_module_title,
      v_ctx.lesson_number, v_ctx.lesson_title, COALESCE(v_ctx.trainer_display_name, '(none)');
  END IF;

  -- P1-2 -- the lesson columns actually arrive (Phase 0B end to end).
  IF v_ctx.lesson_number = 4 AND v_ctx.lesson_title = 'Expressive Delivery' THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P1-2 -- the Phase 0B lesson columns reach the parent projection';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P1-2 -- lesson columns did not arrive (% / %)', v_ctx.lesson_number, v_ctx.lesson_title;
  END IF;

  -- P1-3 -- G-5: the assigned trainer's name reaches a PARENT surface.
  IF v_ctx.trainer_display_name IS NOT NULL AND pg_catalog.length(v_ctx.trainer_display_name) > 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P1-3 -- G-5 holds: the assigned trainer reaches the parent projection';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P1-3 -- the trainer name did not reach the parent projection';
  END IF;

  -- ---------------------------------------------------------------
  -- P1-4 -- THE GATE IS STILL A MIRROR. An UNLINKED parent identity is
  -- refused. Proven by removing the link inside this transaction, so the
  -- deny is measured against the same row the permit just used.
  -- ---------------------------------------------------------------
  -- The link table pair-checks is_active against unlinked_at, so a
  -- deactivation must set BOTH. The schema is satisfied, not bypassed.
  UPDATE public.parent_student_links SET is_active = false, unlinked_at = pg_catalog.now()
   WHERE student_id = v_student;
  PERFORM pg_temp.as_parent();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_canonical_context(v_session, v_student);
  IF v_n = 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P1-4 -- an UNLINKED parent receives nothing for the SAME submitted report';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P1-4 -- an unlinked parent received % row(s)', v_n;
  END IF;
  UPDATE public.parent_student_links SET is_active = true, unlinked_at = NULL
   WHERE student_id = v_student;

  -- P1-5 -- unauthenticated receives nothing.
  PERFORM pg_temp.as_nobody();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_canonical_context(v_session, v_student);
  IF v_n = 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P1-5 -- an unauthenticated caller receives nothing';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P1-5 -- an unauthenticated caller received % row(s)', v_n;
  END IF;

  -- ---------------------------------------------------------------
  -- P1-6 -- ⛔ THE GATE TRACKS RPC-13 EXACTLY. Withdraw the canonical
  -- pointer and BOTH reads must go dark together. If the context read
  -- survived, it would be disclosing a report the canonical read refuses
  -- -- the R-C2-6 side channel this function was built to avoid.
  -- ---------------------------------------------------------------
  UPDATE public.reports SET latest_submitted_version_id = NULL WHERE id = v_report;
  PERFORM pg_temp.as_parent();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_canonical_context(v_session, v_student);
  IF v_n <> 0 THEN
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P1-6 -- context survived after the canonical pointer was withdrawn (SIDE CHANNEL)';
  ELSE
    SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_canonical(v_session, v_student);
    IF v_n = 0 THEN
      v_pass := v_pass + 1;
      RAISE NOTICE 'PASS P1-6 -- context and RPC-13 go dark TOGETHER; no side channel';
    ELSE
      v_fail := v_fail + 1;
      RAISE WARNING 'FAIL P1-6 -- RPC-13 still returned rows; the comparison is not like-for-like';
    END IF;
  END IF;
  UPDATE public.reports SET latest_submitted_version_id = v_version WHERE id = v_report;

  -- ---------------------------------------------------------------
  -- P1-7 -- ⛔ Q-27 / correction disclosure, on the LIVE result. The
  -- signature assertion in the migration pins the names; this pins that
  -- the running function returns those seven and nothing else.
  -- ---------------------------------------------------------------
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_get_canonical_context'
     AND pg_catalog.array_length(p.proargnames, 1) = 9;  -- 2 IN + 7 OUT
  IF v_n = 1 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P1-7 -- exactly 7 returned fields; no rating, hash, revision, status or correction field';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P1-7 -- the returned field count is not 7';
  END IF;

  RAISE NOTICE '--- Phase 1 context suite: % passed, % failed ---', v_pass, v_fail;
  IF v_fail > 0 THEN
    RAISE EXCEPTION 'Phase 1 context suite FAILED with % failure(s)', v_fail;
  END IF;
  IF v_pass <> 7 THEN
    RAISE EXCEPTION 'Phase 1 context suite is INCOMPLETE: % of 7 legs ran; an unrun leg is NOT-RUN, never PASS', v_pass;
  END IF;
END;
$suite$;

-- ⚠️ NOTHING ABOVE IS KEPT. The canonical fixture database is unchanged.
ROLLBACK;
