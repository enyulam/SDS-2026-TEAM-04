-- =====================================================================
-- M14 -- OD-4 REOPEN ENVELOPE-VERSION FORWARD FIX
-- =====================================================================
--
-- Forward fix for ONE defect in M13 (20260809120000_od4_report_contract.sql).
-- M13 is committed and applied; per FINAL_MVP_EXECUTION_PLAN.md section 11
-- R-1, "Committed migrations are corrected by a new forward migration, never
-- by editing an applied file." M13 is therefore NOT edited, and neither is
-- any of the 12 historical migrations.
--
-- THE DEFECT. M13 re-pinned three of the FOUR version-creating paths from
-- content_hash_version = 1 to 2 (report_store_draft, report_save_edit,
-- report_management_edit_wording) but left the fourth,
-- report_reopen_submitted, writing the literal 1. That path clones the
-- latest submitted version and copies its content_hash verbatim -- a hash
-- the V2 serializer produced -- so the stored row claimed V1 provenance for
-- a digest no V1 call can produce. The two envelopes are provably distinct
-- (report_content_hash_v1(...) <> report_content_hash_v2(...) on identical
-- input), so the label was false, not merely redundant.
--
-- WHY IT WAS SILENT. M13's own A2 widened
-- report_versions_content_hash_version_chk from = 1 to IN (1, 2), so the
-- constraint that would previously have rejected this literal now permits
-- it, and no assertion anywhere in the corpus pinned the value a creating
-- path writes. It was caught by adversarial review, not by a test.
--
-- THE FIX. Propagate v_src.content_hash_version instead of a literal.
-- Signature, arguments, OUT columns, volatility, security posture,
-- search_path, owner, ACL and COMMENT are all unchanged, so CREATE OR
-- REPLACE preserves the grants and the comment and no REVOKE/GRANT
-- re-emission is required (section 6.5 item 3 is satisfied vacuously --
-- no signature changes).
--
-- This migration writes NO data and changes NO census figure.
-- =====================================================================

-- ---------------------------------------------------------------------
-- P-1 ownership guard (section 6.5 item 2).
-- ---------------------------------------------------------------------
DO $guard$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION
      'M14 must be applied as postgres, not as %. Applying as another role '
      'would create or alter objects under the wrong owner and silently '
      'change the governed ACL posture.', current_user;
  END IF;
END;
$guard$;

-- ---------------------------------------------------------------------
-- Fail-closed precondition: the defect must actually be present, and the
-- function must be the one M13 shipped. If a prior run already fixed it,
-- or the body is not what this migration was derived from, STOP rather
-- than silently re-emitting a body built from a different baseline.
-- ---------------------------------------------------------------------
DO $pre$
DECLARE
  v_src_text text;
BEGIN
  SELECT p.prosrc INTO v_src_text
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_reopen_submitted';

  IF v_src_text IS NULL THEN
    RAISE EXCEPTION 'M14 precondition failed: report_reopen_submitted does not exist';
  END IF;
  -- strpos(haystack, needle), NOT position(needle IN haystack): the IN form
  -- is special SQL grammar and is a syntax error when the call is
  -- schema-qualified, which it must be under SET search_path = ''.
  IF pg_catalog.strpos(v_src_text, 'v_src.content_hash, 1') = 0 THEN
    RAISE EXCEPTION
      'M14 precondition failed: the expected M13 defect literal is absent. '
      'This migration was derived from the M13 body and must not be applied '
      'to a different baseline.';
  END IF;
END;
$pre$;

CREATE OR REPLACE FUNCTION public.report_reopen_submitted(p_report_id uuid, p_expected_lock_version integer, OUT status report_status, OUT lock_version integer, OUT report_version_id uuid, OUT revision_number integer)
 RETURNS record
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_r             public.reports%ROWTYPE;
  v_src           public.report_versions%ROWTYPE;
  v_version_id    uuid;
  v_rev           integer;
BEGIN
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;
  SELECT r.* INTO v_r FROM public.reports r WHERE r.id = p_report_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;
  SELECT (pg_catalog.array_agg(m.id))[1] INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id
     AND m.role = 'trainer' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL OR NOT public.app_trainer_reaches_session(v_r.class_session_id) THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  IF v_r.status <> 'submitted' THEN
    RAISE EXCEPTION USING ERRCODE = 'BC004', MESSAGE = 'report: this transition is not legal from the report''s current state';
  END IF;
  IF v_r.lock_version IS DISTINCT FROM p_expected_lock_version THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  SELECT rv.* INTO v_src FROM public.report_versions rv WHERE rv.id = v_r.latest_submitted_version_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  SELECT COALESCE(pg_catalog.max(rv.revision_number), 0) + 1 INTO v_rev
    FROM public.report_versions rv WHERE rv.report_id = p_report_id;

  -- The clone carries the SOURCE's hash initially -- legitimately, because
  -- content_hash is a content identity and carries no uniqueness constraint.
  -- The clone is TRAINER-authored and holds no approval row and no
  -- submission metadata, which is what makes it the one version for which
  -- needs_edit -> trainer_approved (T8) is reachable.
  INSERT INTO public.report_versions (
    report_id, centre_id, revision_number,
    overview, strengths, areas_for_development, remarks,
    authored_by_membership_id, authored_by_role, derived_from_version_id,
    content_hash, content_hash_version
  ) VALUES (
    p_report_id, v_r.centre_id, v_rev,
    v_src.overview, v_src.strengths, v_src.areas_for_development, v_src.remarks,
    v_membership_id, 'trainer', v_src.id,
  -- M14 -- ENVELOPE-VERSION PROVENANCE FIX.
  -- This site previously wrote the LITERAL 1 while copying a hash that the
  -- V2 serializer produced, asserting V1 provenance about a digest no V1
  -- call can yield. content_hash_version exists so the algorithm that
  -- produced a stored hash stays recoverable from the row, so the envelope
  -- version must travel WITH the hash it labels. Propagating
  -- v_src.content_hash_version is correct for every source: every
  -- post-OD-4 creating path stamps 2 (G-05a item 4), and a hypothetical
  -- V1-envelope source stays truthfully 1 rather than being silently
  -- relabelled (G-05a item 7). A literal 2 would satisfy item 4 while
  -- reintroducing item 7's exact hazard in the other direction.
    v_src.content_hash, v_src.content_hash_version
  )
  RETURNING public.report_versions.id INTO v_version_id;

  INSERT INTO public.report_version_ratings (report_version_id, report_id, dimension_code, rating)
  SELECT v_version_id, p_report_id, rvr.dimension_code, rvr.rating
    FROM public.report_version_ratings rvr
   WHERE rvr.report_version_id = v_src.id;

  INSERT INTO public.report_version_checklist_progress (report_version_id, report_id)
  VALUES (v_version_id, p_report_id);

  UPDATE public.reports r
     SET status = 'needs_edit',
         lock_version = r.lock_version + 1,
         current_cycle_version_id = v_version_id,
         updated_at = pg_catalog.now()
   WHERE r.id = p_report_id;

  PERFORM public.audit_append_event(
    v_r.centre_id, v_account_id, v_membership_id, 'trainer'::public.centre_membership_role,
    'report_version.created', NULL, NULL, NULL,
    'report_version', v_version_id, 'Report version',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('target_type', 'report',         'target_id', v_r.id::text,  'target_label', 'Report'),
      pg_catalog.jsonb_build_object('target_type', 'report_version', 'target_id', v_src.id::text, 'target_label', 'Report version')
    ),
    pg_catalog.jsonb_build_object(
      'report_version_id',       v_version_id::text,
      'revision_number',         v_rev,
      'content_hash',            v_src.content_hash,
      'authored_by_role',        'trainer',
      'derived_from_version_id', v_src.id::text
    )
  );
  PERFORM public.audit_append_event(
    v_r.centre_id, v_account_id, v_membership_id, 'trainer'::public.centre_membership_role,
    'report.state_changed', 'report', 'submitted', 'needs_edit',
    'report', v_r.id, 'Report',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('target_type', 'report_version', 'target_id', v_version_id::text, 'target_label', 'Report version')
    ),
    pg_catalog.jsonb_build_object(
      'report_id',         v_r.id::text,
      'report_version_id', v_version_id::text,
      'content_hash',      v_src.content_hash
    )
  );

  status            := 'needs_edit';
  lock_version      := v_r.lock_version + 1;
  report_version_id := v_version_id;
  revision_number   := v_rev;
END;
$function$;

-- ---------------------------------------------------------------------
-- End-of-migration catalogue assertions (section 6.5 item 5).
-- ---------------------------------------------------------------------
DO $assert$
DECLARE
  v_n    bigint;
  v_txt  text;
  v_zero CONSTANT text[] := ARRAY[
    'report_store_draft', 'app_parent_reaches_student',
    'report_content_hash_v1', 'report_wording_hash_v1',
    'report_content_hash_v2', 'report_wording_hash_v2'
  ];
  v_name text;
BEGIN
  -- B1: the defect is GONE and the propagation is present.
  SELECT p.prosrc INTO v_txt FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_reopen_submitted';
  IF pg_catalog.strpos(v_txt, 'v_src.content_hash, 1') <> 0 THEN
    RAISE EXCEPTION 'M14 assertion B1 failed: report_reopen_submitted still writes the literal 1';
  END IF;
  IF pg_catalog.strpos(v_txt, 'v_src.content_hash, v_src.content_hash_version') = 0 THEN
    RAISE EXCEPTION 'M14 assertion B1 failed: the envelope version is not propagated';
  END IF;

  -- B2: NO version-creating path writes a hard-coded envelope version of 1.
  -- This is the assertion whose absence let the defect ship. It is derived
  -- from the live catalogue rather than a hard-coded function list, so a
  -- NEW creating path added later is covered without editing this test.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.prosrc LIKE '%INSERT INTO public.report_versions%'
     AND p.prosrc ~ '(?n)content_hash,\s*1\s*$';
  IF v_n <> 0 THEN
    RAISE EXCEPTION
      'M14 assertion B2 failed: % version-creating path(s) still stamp content_hash_version = 1', v_n;
  END IF;

  -- B3: all four version-creating paths are accounted for, so B2 cannot
  -- pass by the paths having disappeared.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.prosrc LIKE '%INSERT INTO public.report_versions%';
  IF v_n <> 4 THEN
    RAISE EXCEPTION 'M14 assertion B3 failed: % version-creating path(s), expected 4', v_n;
  END IF;

  -- B4: the envelope constraint, pinned by EXACT definition rather than by
  -- a substring probe. M13's A2 used "definition contains a 1 and a 2",
  -- which also passes for IN (1,2,3) and for ARRAY[12, 3].
  SELECT pg_catalog.pg_get_constraintdef(oid) INTO v_txt
    FROM pg_catalog.pg_constraint
   WHERE conrelid = 'public.report_versions'::regclass
     AND conname = 'report_versions_content_hash_version_chk';
  IF v_txt IS NULL THEN
    RAISE EXCEPTION 'M14 assertion B4 failed: report_versions_content_hash_version_chk is gone -- the NAME is load-bearing';
  END IF;
  IF v_txt <> 'CHECK ((content_hash_version = ANY (ARRAY[1, 2])))' THEN
    RAISE EXCEPTION 'M14 assertion B4 failed: constraint definition is %, expected the governed 1-or-2 form', v_txt;
  END IF;

  -- B5: report_reopen_submitted kept its posture and privileges across
  -- CREATE OR REPLACE.
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_reopen_submitted'
     AND p.prosecdef = true
     AND p.proconfig::text = '{"search_path=\"\""}'
     AND pg_catalog.pg_get_userbyid(p.proowner) = 'postgres'
     AND p.proacl::text = '{postgres=X/postgres,authenticated=X/postgres}'
     AND pg_catalog.obj_description(p.oid, 'pg_proc') IS NOT NULL;
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'M14 assertion B5 failed: report_reopen_submitted posture, owner, ACL or COMMENT changed';
  END IF;

  -- B6: the six owner-only functions still hold ZERO client EXECUTE.
  FOREACH v_name IN ARRAY v_zero LOOP
    SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public' AND p.proname = v_name;
    IF v_n < 1 THEN RAISE EXCEPTION 'M14 assertion B6 failed: % does not exist', v_name; END IF;

    SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public' AND p.proname = v_name
       AND (pg_catalog.has_function_privilege('anon', p.oid, 'EXECUTE')
         OR pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE')
         OR pg_catalog.has_function_privilege('service_role', p.oid, 'EXECUTE')
         OR pg_catalog.has_function_privilege('authenticator', p.oid, 'EXECUTE')
         OR p.proacl IS NULL
         OR EXISTS (SELECT 1 FROM pg_catalog.aclexplode(p.proacl) x WHERE x.grantee = 0));
    IF v_n <> 0 THEN
      RAISE EXCEPTION 'M14 assertion B6 failed: % is client-executable or has a NULL/PUBLIC-bearing proacl', v_name;
    END IF;
  END LOOP;

  -- B7: V1 remains frozen (G-05a items 1-2).
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname IN ('report_content_hash_v1','report_wording_hash_v1')
     AND p.proacl::text = '{postgres=X/postgres}'
     AND p.provolatile = 'i' AND p.proparallel = 's' AND p.prosecdef = false
     AND p.proconfig::text = '{"search_path=\"\""}'
     AND pg_catalog.obj_description(p.oid,'pg_proc') IS NOT NULL;
  IF v_n <> 2 THEN
    RAISE EXCEPTION 'M14 assertion B7 failed: V1 serializer posture changed (% of 2 intact)', v_n;
  END IF;

  -- B8: census is UNMOVED. CREATE OR REPLACE adds no object.
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public';
  IF v_n <> 36 THEN RAISE EXCEPTION 'M14 assertion B8 failed: % functions, expected 36', v_n; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r';
  IF v_n <> 26 THEN RAISE EXCEPTION 'M14 assertion B8 failed: % tables, expected 26', v_n; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_type t
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN RAISE EXCEPTION 'M14 assertion B8 failed: % enums, expected 12', v_n; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_policies WHERE schemaname = 'public';
  IF v_n <> 29 THEN RAISE EXCEPTION 'M14 assertion B8 failed: % policies, expected 29', v_n; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 25 THEN
    RAISE EXCEPTION 'M14 assertion B8 failed: % authenticated EXECUTE, expected 25', v_n;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND (pg_catalog.has_function_privilege('service_role', p.oid, 'EXECUTE')
       OR pg_catalog.has_function_privilege('anon', p.oid, 'EXECUTE')
       OR pg_catalog.has_function_privilege('authenticator', p.oid, 'EXECUTE'));
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'M14 assertion B8 failed: % function(s) reachable by service_role/anon/authenticator, expected 0', v_n;
  END IF;

  -- B9: applying this migration wrote no report data.
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_versions;
  IF v_n <> 0 THEN RAISE EXCEPTION 'M14 assertion B9 failed: report_versions holds % row(s)', v_n; END IF;

  RAISE NOTICE 'M14: envelope-version provenance fixed (report_reopen_submitted now propagates v_src.content_hash_version); no creating path stamps 1; four creating paths present; constraint pinned by exact definition; posture, ACL, COMMENT, V1 freeze and census all unchanged (36 functions, 26 tables, 12 enums, 29 policies, 25 authenticated EXECUTE, 0 other client EXECUTE).';
END;
$assert$;
