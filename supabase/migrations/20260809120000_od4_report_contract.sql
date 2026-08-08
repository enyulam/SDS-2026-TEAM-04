-- =====================================================================
-- B.E.S.T Coach -- M13: the OD-4 four-panel report contract
-- =====================================================================
-- Authority: OD-4 report-semantics ruling; G-05a (Operator, 2026-08-08);
-- A-040 (bounded additive schema exception); Authority Lock 15.1;
-- FINAL_MVP_EXECUTION_PLAN.md P1-T02 design (committed) and 6.5 protocol.
--
-- WHAT THIS DOES
--   1. Replaces the four superseded narrative columns on report_versions with
--      the canonical OD-4 four: overview, strengths, areas_for_development,
--      remarks.
--   2. Widens report_versions_content_hash_version_chk from = 1 to IN (1, 2),
--      PRESERVING THE CONSTRAINT NAME (it is asserted by name at
--      20260805090500_...:3229 and re-checked by verify-fresh-apply.mjs).
--   3. Adds PARALLEL V2 hash serializers for the OD-4 panels. V1 IS FROZEN.
--   4. Recreates the six RPCs that carry panel columns, and re-emits their
--      signature-qualified privileges.
--
-- DROP + ADD, NOT RENAME -- and this is the one real design decision here.
-- A positional rename would write a SEMANTICALLY FALSE correspondence into the
-- permanent record: "Today's Strength" is a positive demonstrated capability,
-- so it belongs to STRENGTHS, not overview; "Next Focus" is developmental, so
-- it belongs to AREAS_FOR_DEVELOPMENT, not strengths. The mapping is neither
-- positional nor 1:1 -- which is precisely why the ruling insists this is
-- "a semantic-model change, not a relabel". report_versions is EMPTY, so a
-- rename would carry no data anyway; it would only leave a misleading artefact
-- a later reader could mistake for a ratified mapping.
--
-- WHY NO CREATE OR REPLACE FOR THE SIX RPCs
-- PostgreSQL rejects BOTH a changed RETURNS TABLE row type AND a renamed IN
-- parameter with 42P13 ("cannot change name of input parameter"). Three of the
-- six only rename IN parameters, and they need the DROP just as much as the
-- three readers do. Verified before writing: all six have ZERO non-internal
-- pg_depend dependents and ZERO other function bodies referencing them, so no
-- CASCADE is required -- and per the governing ruling, if one ever were, that
-- is a STOP, never a licence to force the migration through.
--
-- WHY THE V2 SERIALIZERS CARRY EXPLICIT REVOKEs
-- A new postgres-owned function in schema public has proacl IS NULL, which is
-- the DEFAULT PUBLIC EXECUTE -- probed live: authenticated = t, anon = t. The
-- ALTER DEFAULT PRIVILEGES hardening at 20260803034500_...:52-53 does NOT
-- produce a stored owner-only ACL at creation. Relying on a NULL proacl would
-- have shipped both serializers client-executable, which CLAUDE.md 12 makes a
-- stop-and-ask. They are revoked explicitly, immediately after creation.
--
-- HISTORICAL MIGRATION ASSERTIONS ARE NOT TOUCHED (operator ruling PD-1).
-- The four migration-resident zero-EXECUTE blocks assert their own point in
-- history, where only four such functions existed. That is correct, and naming
-- V2 there would break the fresh-apply proof, because those blocks run BEFORE
-- this migration creates V2. The post-M13 set of SIX is proved by this
-- migration's own end-of-migration assertion and by the current reusable
-- carriers.
-- =====================================================================

-- ---------------------------------------------------------------------
-- P-1 ownership guard (6.5 item 2). Objects created by supabase_admin in
-- schema public inherit its default ACL (ALL to anon/authenticated/
-- service_role) -- the exact hazard P-1 exists to prevent.
-- ---------------------------------------------------------------------
DO $guard$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION
      'OD-4 migration aborted before any change: this migration must run as postgres, not "%". '
      'Objects created by supabase_admin in schema public would inherit its default ACL '
      '(ALL to anon/authenticated/service_role) -- the exact hazard P-1 exists to prevent.',
      current_user;
  END IF;
END;
$guard$;

-- ---------------------------------------------------------------------
-- FAIL-CLOSED PRECONDITION. This is the single control that makes DROP
-- COLUMN safe, and it must NEVER be relaxed to make the migration run.
-- Same shape as the ratified zero-row guard in the competency-vocabulary
-- rename (20260806160000).
-- ---------------------------------------------------------------------
DO $precondition$
DECLARE v_n bigint;
BEGIN
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_versions;
  IF v_n <> 0 THEN
    RAISE EXCEPTION
      'OD-4 migration aborted: report_versions holds % row(s). The four narrative columns are '
      'DROPPED and re-ADDED because the superseded concepts do not map positionally onto the OD-4 '
      'model, so this is only safe on an empty table. Do not relax this guard.', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_version_ratings;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'OD-4 migration aborted: report_version_ratings holds % row(s)', v_n;
  END IF;
  RAISE NOTICE 'OD-4 precondition proved in-transaction: report_versions=0, report_version_ratings=0.';
END;
$precondition$;

-- ---------------------------------------------------------------------
-- 1. The four canonical OD-4 narrative columns.
-- ---------------------------------------------------------------------
ALTER TABLE public.report_versions
  DROP COLUMN todays_strength,
  DROP COLUMN next_focus,
  DROP COLUMN practice_suggestion,
  DROP COLUMN session_takeaway,
  ADD  COLUMN overview              text,
  ADD  COLUMN strengths             text,
  ADD  COLUMN areas_for_development text,
  ADD  COLUMN remarks               text;

COMMENT ON COLUMN public.report_versions.overview IS
  'OD-4 canonical panel 1. A general narrative summary of the learner''s performance for the '
  'session. MAY synthesize strengths, overall performance and developmental context, and is '
  'expressly NOT restricted to positive observations.';
COMMENT ON COLUMN public.report_versions.strengths IS
  'OD-4 canonical panel 2. Positive demonstrated capabilities, behaviours, progress or '
  'performance, supported by the Trainer''s governed assessment facts.';
COMMENT ON COLUMN public.report_versions.areas_for_development IS
  'OD-4 canonical panel 3. Specific capabilities, behaviours or performance areas that would '
  'benefit from continued development or support.';
COMMENT ON COLUMN public.report_versions.remarks IS
  'OD-4 canonical panel 4. Additional relevant commentary that does not belong in the other '
  'three panels. NEVER an unrestricted place for unsupported claims.';

-- ---------------------------------------------------------------------
-- 2. Content-hash envelope version. NAME PRESERVED DELIBERATELY.
-- G-05a item 5: widen to 1 or 2. Item 6: no historical-row backmigration.
-- Item 7 (a future real production V1 row is never silently relabelled or
-- mutated) is untouched and remains binding.
-- ---------------------------------------------------------------------
ALTER TABLE public.report_versions
  DROP CONSTRAINT report_versions_content_hash_version_chk;
ALTER TABLE public.report_versions
  ADD CONSTRAINT report_versions_content_hash_version_chk
  CHECK (content_hash_version IN (1, 2));

-- ---------------------------------------------------------------------
-- 3. PARALLEL V2 serializers. V1 is frozen and is not referenced here.
-- Identical envelope grammar, identical hard-coded nine-dimension order,
-- identical nine-non-NULL arity raise. Only the domain string, the
-- content_version value and the field-name array change.
-- ---------------------------------------------------------------------
CREATE FUNCTION public.report_content_hash_v2(
  p_overview              text,
  p_strengths             text,
  p_areas_for_development text,
  p_remarks               text,
  p_ratings               public.competency_rating[]
) RETURNS text
LANGUAGE plpgsql
IMMUTABLE PARALLEL SAFE
SET search_path = ''
AS $fn$
DECLARE
  -- Pinned to this HARD-CODED nine-element list, in dimension_code enum
  -- declaration order -- deliberately NOT keyed to assessment_dimensions.
  -- sort_order, an ordinary mutable column protected by no trigger, because a
  -- future display-ordering change would otherwise silently invalidate every
  -- historical hash. Identical to V1 by design.
  v_dims CONSTANT text[] := ARRAY[
    'body', 'emotion', 'speech', 'tonality', 'eye_contact',
    'vocal_projection', 'emotional_expression', 'sentence_flow',
    'audience_awareness'
  ];
  v_names CONSTANT text[] := ARRAY[
    'content_version', 'overview', 'strengths',
    'areas_for_development', 'remarks'
  ];
  v_vals   text[];
  v_lf     CONSTANT text := pg_catalog.chr(10);
  v_pre    text;
  v_i      integer;
BEGIN
  IF p_ratings IS NULL OR pg_catalog.array_length(p_ratings, 1) IS DISTINCT FROM 9 THEN
    RAISE EXCEPTION
      'report_content_hash_v2: p_ratings must be a nine-element array (fixed arity, section 4.6)';
  END IF;
  FOR v_i IN 1..9 LOOP
    IF p_ratings[v_i] IS NULL THEN
      RAISE EXCEPTION
        'report_content_hash_v2: p_ratings element % is NULL; nine non-NULL ratings are required', v_i;
    END IF;
  END LOOP;

  v_vals := ARRAY[
    '2',
    p_overview,
    p_strengths,
    p_areas_for_development,
    p_remarks
  ];

  v_pre := 'BESTCOACH-REPORT-CONTENT-V2' || v_lf;
  FOR v_i IN 1..5 LOOP
    IF v_vals[v_i] IS NULL THEN
      v_pre := v_pre || v_names[v_i] || ':N' || v_lf;
    ELSE
      v_pre := v_pre || v_names[v_i] || ':V:'
        || pg_catalog.octet_length(v_vals[v_i])::text || ':' || v_vals[v_i] || v_lf;
    END IF;
  END LOOP;
  FOR v_i IN 1..9 LOOP
    v_pre := v_pre || v_dims[v_i] || ':V:'
      || pg_catalog.octet_length(p_ratings[v_i]::text)::text || ':'
      || p_ratings[v_i]::text || v_lf;
  END LOOP;

  RETURN pg_catalog.encode(
    pg_catalog.sha256(pg_catalog.convert_to(v_pre, 'UTF8')), 'hex');
END;
$fn$;

CREATE FUNCTION public.report_wording_hash_v2(
  p_overview              text,
  p_strengths             text,
  p_areas_for_development text,
  p_remarks               text
) RETURNS text
LANGUAGE plpgsql
IMMUTABLE PARALLEL SAFE
SET search_path = ''
AS $fn$
DECLARE
  v_names CONSTANT text[] := ARRAY[
    'content_version', 'overview', 'strengths',
    'areas_for_development', 'remarks'
  ];
  v_vals  text[];
  v_lf    CONSTANT text := pg_catalog.chr(10);
  v_pre   text;
  v_i     integer;
BEGIN
  v_vals := ARRAY[
    '2',
    p_overview,
    p_strengths,
    p_areas_for_development,
    p_remarks
  ];

  -- Domain-separated from the content envelope AND from both V1 envelopes.
  -- Four distinct preimages now exist; none can be substituted for another.
  v_pre := 'BESTCOACH-REPORT-WORDING-V2' || v_lf;
  FOR v_i IN 1..5 LOOP
    IF v_vals[v_i] IS NULL THEN
      v_pre := v_pre || v_names[v_i] || ':N' || v_lf;
    ELSE
      v_pre := v_pre || v_names[v_i] || ':V:'
        || pg_catalog.octet_length(v_vals[v_i])::text || ':' || v_vals[v_i] || v_lf;
    END IF;
  END LOOP;

  RETURN pg_catalog.encode(
    pg_catalog.sha256(pg_catalog.convert_to(v_pre, 'UTF8')), 'hex');
END;
$fn$;

-- ZERO CLIENT EXECUTE, established explicitly rather than inherited.
REVOKE ALL ON FUNCTION public.report_content_hash_v2(text, text, text, text, public.competency_rating[])
  FROM PUBLIC, anon, authenticated, service_role, authenticator;
REVOKE ALL ON FUNCTION public.report_wording_hash_v2(text, text, text, text)
  FROM PUBLIC, anon, authenticated, service_role, authenticator;

COMMENT ON FUNCTION public.report_content_hash_v2(text, text, text, text, public.competency_rating[]) IS
  'OD-4 (G-05a): the FULL CONTENT IDENTITY of a report version -- SHA-256 over the '
  'BESTCOACH-REPORT-CONTENT-V2 length-prefixed envelope covering the four OD-4 panels AND the nine '
  'ratings, in a hard-coded dimension order. Argument-pure: reads no table. Raises unless p_ratings '
  'is exactly nine non-NULL elements. TRAINER-ONLY by policy: the value it produces must never reach '
  'management or a parent, because panels + this hash recover the exact per-dimension rating grid in '
  '4^9 trials (R-26). Zero client EXECUTE. Parallel to report_content_hash_v1, which is frozen.';
COMMENT ON FUNCTION public.report_wording_hash_v2(text, text, text, text) IS
  'OD-4 (G-05a): the PARENT-FACING WORDING IDENTITY -- SHA-256 over the BESTCOACH-REPORT-WORDING-V2 '
  'envelope covering the four OD-4 panels ONLY. NEVER STORED: computed on demand by the management '
  'read and re-verified by both management mutations, so it cannot drift from the content it '
  'describes. Leaks nothing, because it checksums data the reader already holds in full. Zero client '
  'EXECUTE. Parallel to report_wording_hash_v1, which is frozen.';

-- ---------------------------------------------------------------------
-- 4. The six panel-carrying RPCs: DROP, recreate natively on OD-4, then
-- re-emit COMMENTs and signature-qualified privileges. Dropping a function
-- destroys its ACL and its COMMENT, which is why both are re-emitted.
-- ---------------------------------------------------------------------
DROP FUNCTION public.report_get_canonical(uuid,uuid);
DROP FUNCTION public.report_get_management_review(uuid,uuid);
DROP FUNCTION public.report_get_working(uuid,uuid);
DROP FUNCTION public.report_management_edit_wording(uuid,integer,uuid,text,text,text,text,text);
DROP FUNCTION public.report_save_edit(uuid,report_status,integer,uuid,text,text,text,text,uuid);
DROP FUNCTION public.report_store_draft(uuid,integer,integer,text,text,text,text);

CREATE OR REPLACE FUNCTION public.report_get_canonical(p_class_session_id uuid, p_student_id uuid)
 RETURNS TABLE(overview text, strengths text, areas_for_development text, remarks text, submitted_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_account_id uuid;
  v_r          public.reports%ROWTYPE;
  v_role       public.centre_membership_role;
BEGIN
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  SELECT r.* INTO v_r
    FROM public.reports r
   WHERE r.class_session_id = p_class_session_id AND r.student_id = p_student_id;
  IF NOT FOUND THEN RETURN; END IF;

  -- Dispatch on the caller's SINGLE active membership in the report's
  -- centre, resolved live and fail-closed on zero or more than one. Every
  -- branch has a named live predicate; NO BRANCH DEFAULTS TO PERMIT.
  SELECT (pg_catalog.array_agg(m.role))[1] INTO v_role
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_role IS NULL THEN RETURN; END IF;

  IF v_role = 'trainer' THEN
    IF NOT public.app_trainer_reaches_session(v_r.class_session_id) THEN RETURN; END IF;
  ELSIF v_role = 'management' THEN
    NULL;  -- the single active management membership of this centre is the predicate
  ELSIF v_role = 'parent' THEN
    IF NOT public.app_parent_reaches_student(p_student_id) THEN RETURN; END IF;
  ELSE
    RETURN;
  END IF;

  IF v_r.latest_submitted_version_id IS NULL THEN RETURN; END IF;

  RETURN QUERY
  SELECT rv.overview, rv.strengths, rv.areas_for_development,
         rv.remarks, rv.submitted_at
    FROM public.report_versions rv
   WHERE rv.id = v_r.latest_submitted_version_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.report_get_management_review(p_class_session_id uuid, p_student_id uuid)
 RETURNS TABLE(report_id uuid, status report_status, lock_version integer, current_version_id uuid, overview text, strengths text, areas_for_development text, remarks text, wording_hash text, submitted_at timestamp with time zone, open_correction_issue_scope correction_issue_scope, open_correction_status correction_request_status)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_r             public.reports%ROWTYPE;
  v_v             public.report_versions%ROWTYPE;
  v_cr            public.report_correction_requests%ROWTYPE;
  v_submitted_at  timestamptz;
BEGIN
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  SELECT r.* INTO v_r
    FROM public.reports r
   WHERE r.class_session_id = p_class_session_id AND r.student_id = p_student_id;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT (pg_catalog.array_agg(m.id))[1] INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id
     AND m.role = 'management' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN RETURN; END IF;

  IF v_r.status = 'trainer_approved' THEN
    SELECT rv.* INTO v_v FROM public.report_versions rv WHERE rv.id = v_r.current_cycle_version_id;
    IF NOT FOUND THEN RETURN; END IF;
    IF v_r.latest_submitted_version_id IS NOT NULL THEN
      SELECT rv.submitted_at INTO v_submitted_at
        FROM public.report_versions rv WHERE rv.id = v_r.latest_submitted_version_id;
    END IF;
    SELECT cr.* INTO v_cr
      FROM public.report_correction_requests cr
     WHERE cr.report_id = v_r.id AND cr.status = 'open';

    RETURN QUERY SELECT
      v_r.id, v_r.status, v_r.lock_version, v_v.id,
      v_v.overview, v_v.strengths, v_v.areas_for_development, v_v.remarks,
      public.report_wording_hash_v2(v_v.overview, v_v.strengths,
                                    v_v.areas_for_development, v_v.remarks),
      v_submitted_at,
      v_cr.issue_scope, v_cr.status;
    RETURN;
  END IF;

  IF v_r.status = 'submitted' THEN
    SELECT rv.* INTO v_v FROM public.report_versions rv WHERE rv.id = v_r.latest_submitted_version_id;
    IF NOT FOUND THEN RETURN; END IF;
    -- NULL lock_version, NULL candidate version id and NULL wording_hash:
    -- there is no candidate to prove a render against, and management has no
    -- operation to perform on a published report.
    RETURN QUERY SELECT
      v_r.id, v_r.status, NULL::integer, NULL::uuid,
      v_v.overview, v_v.strengths, v_v.areas_for_development, v_v.remarks,
      NULL::text,
      v_v.submitted_at,
      NULL::public.correction_issue_scope, NULL::public.correction_request_status;
    RETURN;
  END IF;

  -- incomplete | observation_saved | drafting | draft_ready | needs_edit --
  -- the five statuses A-038 names as exposing NO report content to
  -- management. The `needs_edit` case is the one the ordinary return cycle
  -- produces, and it is exactly where the leak used to be.
  RETURN;
END;
$function$;

CREATE OR REPLACE FUNCTION public.report_get_working(p_class_session_id uuid, p_student_id uuid)
 RETURNS TABLE(report_id uuid, status report_status, lock_version integer, current_version_id uuid, revision_number integer, overview text, strengths text, areas_for_development text, remarks text, content_hash text, evidence_confirmed boolean, ai_draft_reviewed boolean, privacy_checked boolean, ratings jsonb, latest_submitted_version_id uuid, submitted_at timestamp with time zone, open_correction_request_id uuid, open_correction_issue_scope correction_issue_scope, open_correction_dimension_code dimension_code, open_correction_reason text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_r             public.reports%ROWTYPE;
  v_cand          public.report_versions%ROWTYPE;
  v_cp            public.report_version_checklist_progress%ROWTYPE;
  v_cr            public.report_correction_requests%ROWTYPE;
  v_ratings       jsonb;
  v_submitted_at  timestamptz;
BEGIN
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  SELECT r.* INTO v_r
    FROM public.reports r
   WHERE r.class_session_id = p_class_session_id AND r.student_id = p_student_id;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT (pg_catalog.array_agg(m.id))[1] INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id
     AND m.role = 'trainer' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN RETURN; END IF;
  IF NOT public.app_trainer_reaches_session(v_r.class_session_id) THEN RETURN; END IF;

  IF v_r.current_cycle_version_id IS NOT NULL THEN
    SELECT rv.* INTO v_cand FROM public.report_versions rv WHERE rv.id = v_r.current_cycle_version_id;
    -- Every read model must TOLERATE A VERSION WITH NO CHECKLIST ROW: a
    -- management wording-edit version has none, by design.
    SELECT cp.* INTO v_cp
      FROM public.report_version_checklist_progress cp
     WHERE cp.report_version_id = v_r.current_cycle_version_id;
    SELECT pg_catalog.jsonb_agg(
             pg_catalog.jsonb_build_object(
               'dimension_code', rvr.dimension_code::text,
               'display_name',   d.display_name,
               'group_code',     d.group_code::text,
               'rating',         rvr.rating::text)
             ORDER BY d.sort_order)
      INTO v_ratings
      FROM public.report_version_ratings rvr
      JOIN public.assessment_dimensions d ON d.code = rvr.dimension_code
     WHERE rvr.report_version_id = v_r.current_cycle_version_id;
  END IF;

  IF v_r.latest_submitted_version_id IS NOT NULL THEN
    SELECT rv.submitted_at INTO v_submitted_at
      FROM public.report_versions rv WHERE rv.id = v_r.latest_submitted_version_id;
  END IF;

  -- The trainer -- and only the trainer -- reads the correction REASON. The
  -- trainer must see what to fix.
  SELECT cr.* INTO v_cr
    FROM public.report_correction_requests cr
   WHERE cr.report_id = v_r.id AND cr.status = 'open';

  RETURN QUERY SELECT
    v_r.id, v_r.status, v_r.lock_version,
    v_cand.id, v_cand.revision_number,
    v_cand.overview, v_cand.strengths, v_cand.areas_for_development, v_cand.remarks,
    v_cand.content_hash,
    v_cp.evidence_confirmed, v_cp.ai_draft_reviewed, v_cp.privacy_checked,
    v_ratings,
    v_r.latest_submitted_version_id, v_submitted_at,
    v_cr.id, v_cr.issue_scope, v_cr.dimension_code, v_cr.reason;
END;
$function$;

CREATE OR REPLACE FUNCTION public.report_management_edit_wording(p_report_id uuid, p_expected_lock_version integer, p_expected_version_id uuid, p_expected_wording_hash text, p_overview text, p_strengths text, p_areas_for_development text, p_remarks text, OUT status report_status, OUT lock_version integer, OUT report_version_id uuid, OUT revision_number integer, OUT wording_hash text)
 RETURNS record
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_r             public.reports%ROWTYPE;
  v_cand          public.report_versions%ROWTYPE;
  v_source_id     uuid;
  v_ratings       public.competency_rating[];
  v_version_id    uuid;
  v_rev           integer;
  v_content_hash  text;
  v_wording       text;
BEGIN
  -- 1-2. Lock, then revalidate a SINGLE ACTIVE management membership of the
  --      report's centre. A trainer or parent context finds none and is
  --      rejected with the authored role error.
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
     AND m.role = 'management' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  -- 3. CAS. Single legal origin, so a wrong current status is an illegal
  --    transition rather than a stale expectation (R-18b).
  IF v_r.status <> 'trainer_approved' THEN
    RAISE EXCEPTION USING ERRCODE = 'BC004', MESSAGE = 'report: this transition is not legal from the report''s current state';
  END IF;
  IF v_r.lock_version IS DISTINCT FROM p_expected_lock_version
     OR v_r.current_cycle_version_id IS DISTINCT FROM p_expected_version_id THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  SELECT rv.* INTO v_cand FROM public.report_versions rv WHERE rv.id = p_expected_version_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  -- 4. Lineage gate. The trainer-approved source of V is V itself when V
  --    carries a trainer approval row, otherwise V.trainer_approved_source_
  --    version_id. If neither resolves, the version has no trainer approval
  --    behind it. NO SOURCE, NO EDIT. This rule is inlined here and in
  --    RPC-11 rather than shared, and is proven at BOTH call sites.
  PERFORM 1 FROM public.report_version_approvals ap
   WHERE ap.report_version_id = v_cand.id AND ap.approver_role = 'trainer';
  IF FOUND THEN
    v_source_id := v_cand.id;
  ELSE
    v_source_id := v_cand.trainer_approved_source_version_id;
  END IF;
  IF v_source_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC009', MESSAGE = 'report: no trainer approval stands behind this version';
  END IF;
  PERFORM 1 FROM public.report_version_approvals ap
   WHERE ap.report_version_id = v_source_id AND ap.approver_role = 'trainer';
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC009', MESSAGE = 'report: no trainer approval stands behind this version';
  END IF;

  -- 5. Wording-hash verification: management edits THE TEXT IT WAS SHOWN.
  --    The CONTENT hash is never returned to, nor accepted from, management.
  IF public.report_wording_hash_v2(
       v_cand.overview, v_cand.strengths,
       v_cand.areas_for_development, v_cand.remarks)
     IS DISTINCT FROM p_expected_wording_hash THEN
    RAISE EXCEPTION USING ERRCODE = 'BC008',
      MESSAGE = 'report: the wording you reviewed is no longer current; re-read and retry';
  END IF;

  -- 7. The nine snapshots, copied VERBATIM from the trainer-approved source.
  SELECT pg_catalog.array_agg(x.rating ORDER BY x.ord) INTO v_ratings
    FROM (
      SELECT rvr.rating,
             pg_catalog.array_position(
               ARRAY['body','emotion','speech','tonality','eye_contact',
                     'vocal_projection','emotional_expression','sentence_flow',
                     'audience_awareness']::text[],
               rvr.dimension_code::text) AS ord
        FROM public.report_version_ratings rvr
       WHERE rvr.report_version_id = v_source_id
    ) x;

  v_content_hash := public.report_content_hash_v2(
    p_overview, p_strengths, p_areas_for_development, p_remarks, v_ratings);
  v_wording := public.report_wording_hash_v2(
    p_overview, p_strengths, p_areas_for_development, p_remarks);

  SELECT COALESCE(pg_catalog.max(rv.revision_number), 0) + 1 INTO v_rev
    FROM public.report_versions rv WHERE rv.report_id = p_report_id;

  INSERT INTO public.report_versions (
    report_id, centre_id, revision_number,
    overview, strengths, areas_for_development, remarks,
    authored_by_membership_id, authored_by_role,
    derived_from_version_id, trainer_approved_source_version_id,
    content_hash, content_hash_version
  ) VALUES (
    p_report_id, v_r.centre_id, v_rev,
    p_overview, p_strengths, p_areas_for_development, p_remarks,
    v_membership_id, 'management',
    v_cand.id, v_source_id,
    v_content_hash, 2
  )
  RETURNING public.report_versions.id INTO v_version_id;

  INSERT INTO public.report_version_ratings (report_version_id, report_id, dimension_code, rating)
  SELECT v_version_id, p_report_id, rvr.dimension_code, rvr.rating
    FROM public.report_version_ratings rvr
   WHERE rvr.report_version_id = v_source_id;

  -- 8. Status is UNCHANGED at trainer_approved; only the candidate pointer
  --    moves. No report.state_changed is appended, because no state changed.
  UPDATE public.reports r
     SET lock_version = r.lock_version + 1,
         current_cycle_version_id = v_version_id,
         updated_at = pg_catalog.now()
   WHERE r.id = p_report_id;

  PERFORM public.audit_append_event(
    v_r.centre_id, v_account_id, v_membership_id, 'management'::public.centre_membership_role,
    'report_version.created', NULL, NULL, NULL,
    'report_version', v_version_id, 'Report version',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('target_type', 'report',         'target_id', v_r.id::text,      'target_label', 'Report'),
      pg_catalog.jsonb_build_object('target_type', 'report_version', 'target_id', v_cand.id::text,   'target_label', 'Report version'),
      pg_catalog.jsonb_build_object('target_type', 'report_version', 'target_id', v_source_id::text, 'target_label', 'Report version')
    ),
    pg_catalog.jsonb_build_object(
      'report_version_id',                  v_version_id::text,
      'revision_number',                    v_rev,
      'content_hash',                       v_content_hash,
      'authored_by_role',                   'management',
      'derived_from_version_id',            v_cand.id::text,
      'trainer_approved_source_version_id', v_source_id::text
    )
  );

  status            := 'trainer_approved';
  lock_version      := v_r.lock_version + 1;
  report_version_id := v_version_id;
  revision_number   := v_rev;
  wording_hash      := v_wording;
END;
$function$;

CREATE OR REPLACE FUNCTION public.report_save_edit(p_report_id uuid, p_expected_status report_status, p_expected_lock_version integer, p_expected_version_id uuid, p_overview text, p_strengths text, p_areas_for_development text, p_remarks text, p_reaffirm_correction_request_id uuid DEFAULT NULL::uuid, OUT status report_status, OUT lock_version integer, OUT report_version_id uuid, OUT revision_number integer, OUT content_hash text)
 RETURNS record
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_r             public.reports%ROWTYPE;
  v_cand          public.report_versions%ROWTYPE;
  v_start         timestamptz;
  v_n             bigint;
  v_ratings       public.competency_rating[];
  v_version_id    uuid;
  v_rev           integer;
  v_hash          text;
  v_identical     boolean;
  v_new_status    public.report_status;
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

  -- Domain check BEFORE CAS (R-18b): the parameter's type admits all eight
  -- labels, and without this a caller could satisfy CAS against a state the
  -- transition does not serve and die on a constraint rather than on a
  -- transition guard.
  IF p_expected_status IS NULL OR p_expected_status NOT IN ('draft_ready', 'needs_edit') THEN
    RAISE EXCEPTION USING ERRCODE = 'BC004', MESSAGE = 'report: this transition is not legal from the requested state';
  END IF;
  IF v_r.status NOT IN ('draft_ready', 'needs_edit') THEN
    RAISE EXCEPTION USING ERRCODE = 'BC004', MESSAGE = 'report: this transition is not legal from the report''s current state';
  END IF;
  IF v_r.status IS DISTINCT FROM p_expected_status
     OR v_r.lock_version IS DISTINCT FROM p_expected_lock_version
     OR v_r.current_cycle_version_id IS DISTINCT FROM p_expected_version_id THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  -- Only T6 is forward progress. T5 is a self-transition and re-checks
  -- neither the attendance nor the session-start guard.
  IF v_r.status = 'needs_edit' THEN
    PERFORM 1 FROM public.enrolments e WHERE e.id = v_r.enrolment_id AND e.is_active;
    IF NOT FOUND THEN
      RAISE EXCEPTION USING ERRCODE = 'BC016', MESSAGE = 'report: no active enrolment for this student and module';
    END IF;
    PERFORM 1 FROM public.attendance a
     WHERE a.class_session_id = v_r.class_session_id AND a.student_id = v_r.student_id
       AND a.status = 'present';
    IF NOT FOUND THEN
      RAISE EXCEPTION USING ERRCODE = 'BC015', MESSAGE = 'report: the student is not recorded present for this session';
    END IF;
    SELECT ((cs.session_date + COALESCE(cs.starts_at, TIME '00:00')) AT TIME ZONE 'Asia/Singapore')
      INTO v_start FROM public.class_sessions cs WHERE cs.id = v_r.class_session_id;
    IF v_start IS NULL OR pg_catalog.now() < v_start THEN
      RAISE EXCEPTION USING ERRCODE = 'BC017', MESSAGE = 'report: the scheduled session start has not been reached';
    END IF;
  END IF;

  IF COALESCE(pg_catalog.length(pg_catalog.btrim(COALESCE(p_overview, ''))), 0)
   + COALESCE(pg_catalog.length(pg_catalog.btrim(COALESCE(p_strengths, ''))), 0)
   + COALESCE(pg_catalog.length(pg_catalog.btrim(COALESCE(p_areas_for_development, ''))), 0)
   + COALESCE(pg_catalog.length(pg_catalog.btrim(COALESCE(p_remarks, ''))), 0) = 0 THEN
    RAISE EXCEPTION USING ERRCODE = 'BC020', MESSAGE = 'report: the supplied content is degenerate';
  END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM public.observation_ratings orr WHERE orr.observation_id = v_r.observation_id;
  IF v_n <> 9 THEN
    RAISE EXCEPTION USING ERRCODE = 'BC018', MESSAGE = 'report: the observation does not carry exactly nine ratings';
  END IF;

  SELECT rv.* INTO v_cand
    FROM public.report_versions rv WHERE rv.id = v_r.current_cycle_version_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  -- Any supplied reaffirmation id must name THIS report's OPEN request.
  IF p_reaffirm_correction_request_id IS NOT NULL THEN
    PERFORM 1 FROM public.report_correction_requests cr
     WHERE cr.id = p_reaffirm_correction_request_id
       AND cr.report_id = p_report_id
       AND cr.status = 'open';
    IF NOT FOUND THEN
      RAISE EXCEPTION USING ERRCODE = 'BC021',
        MESSAGE = 'report: the reaffirmation must name this report''s open correction request';
    END IF;
  END IF;

  v_identical := (v_cand.overview     IS NOT DISTINCT FROM p_overview)
             AND (v_cand.strengths          IS NOT DISTINCT FROM p_strengths)
             AND (v_cand.areas_for_development IS NOT DISTINCT FROM p_areas_for_development)
             AND (v_cand.remarks    IS NOT DISTINCT FROM p_remarks);
  IF v_r.status = 'needs_edit' AND v_identical AND p_reaffirm_correction_request_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC021',
      MESSAGE = 'report: an unchanged correction must be submitted as an explicit reaffirmation naming the open correction request';
  END IF;

  SELECT pg_catalog.array_agg(x.rating ORDER BY x.ord) INTO v_ratings
    FROM (
      SELECT orr.rating,
             pg_catalog.array_position(
               ARRAY['body','emotion','speech','tonality','eye_contact',
                     'vocal_projection','emotional_expression','sentence_flow',
                     'audience_awareness']::text[],
               orr.dimension_code::text) AS ord
        FROM public.observation_ratings orr
       WHERE orr.observation_id = v_r.observation_id
    ) x;

  v_hash := public.report_content_hash_v2(
    p_overview, p_strengths, p_areas_for_development, p_remarks, v_ratings);

  -- Allocation is serialized by the aggregate row lock taken above, so a
  -- concurrent pair fails with an authored error rather than a raw unique
  -- violation on report_versions_report_revision_key.
  SELECT COALESCE(pg_catalog.max(rv.revision_number), 0) + 1 INTO v_rev
    FROM public.report_versions rv WHERE rv.report_id = p_report_id;

  INSERT INTO public.report_versions (
    report_id, centre_id, revision_number,
    overview, strengths, areas_for_development, remarks,
    authored_by_membership_id, authored_by_role, derived_from_version_id,
    content_hash, content_hash_version
  ) VALUES (
    p_report_id, v_r.centre_id, v_rev,
    p_overview, p_strengths, p_areas_for_development, p_remarks,
    v_membership_id, 'trainer', v_cand.id,
    v_hash, 2
  )
  RETURNING public.report_versions.id INTO v_version_id;

  INSERT INTO public.report_version_ratings (report_version_id, report_id, dimension_code, rating)
  SELECT v_version_id, p_report_id, orr.dimension_code, orr.rating
    FROM public.observation_ratings orr
   WHERE orr.observation_id = v_r.observation_id;

  -- Every TRAINER-created version gets a fresh all-false checklist row. The
  -- PRIOR version's row is left untouched: a frozen version's checklist and
  -- approval evidence are immutable and must never be cleared.
  INSERT INTO public.report_version_checklist_progress (report_version_id, report_id)
  VALUES (v_version_id, p_report_id);

  v_new_status := 'draft_ready';

  UPDATE public.reports r
     SET status = v_new_status,
         lock_version = r.lock_version + 1,
         current_cycle_version_id = v_version_id,
         updated_at = pg_catalog.now()
   WHERE r.id = p_report_id;

  PERFORM public.audit_append_event(
    v_r.centre_id, v_account_id, v_membership_id, 'trainer'::public.centre_membership_role,
    'report_version.created', NULL, NULL, NULL,
    'report_version', v_version_id, 'Report version',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('target_type', 'report',         'target_id', v_r.id::text,   'target_label', 'Report'),
      pg_catalog.jsonb_build_object('target_type', 'report_version', 'target_id', v_cand.id::text, 'target_label', 'Report version')
    ),
    pg_catalog.jsonb_build_object(
      'report_version_id',        v_version_id::text,
      'revision_number',          v_rev,
      'content_hash',             v_hash,
      'authored_by_role',         'trainer',
      'derived_from_version_id',  v_cand.id::text,
      'observation_id',           v_r.observation_id::text
    )
    || CASE WHEN p_reaffirm_correction_request_id IS NULL THEN '{}'::jsonb
            ELSE pg_catalog.jsonb_build_object(
                   'reaffirmed_correction_request_id', p_reaffirm_correction_request_id::text)
       END
  );

  -- T5 emits report_version.created ONLY -- the persisted status does not
  -- change, so no state-change event is appended. T6 additionally emits the
  -- state change.
  IF v_r.status = 'needs_edit' THEN
    PERFORM public.audit_append_event(
      v_r.centre_id, v_account_id, v_membership_id, 'trainer'::public.centre_membership_role,
      'report.state_changed', 'report', 'needs_edit', 'draft_ready',
      'report', v_r.id, 'Report',
      pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object('target_type', 'report_version', 'target_id', v_version_id::text, 'target_label', 'Report version')
      ),
      pg_catalog.jsonb_build_object(
        'report_id',         v_r.id::text,
        'report_version_id', v_version_id::text,
        'content_hash',      v_hash
      )
    );
  END IF;

  status            := v_new_status;
  lock_version      := v_r.lock_version + 1;
  report_version_id := v_version_id;
  revision_number   := v_rev;
  content_hash      := v_hash;
END;
$function$;

CREATE OR REPLACE FUNCTION public.report_store_draft(p_report_id uuid, p_expected_lock_version integer, p_observation_lock_version integer, p_overview text, p_strengths text, p_areas_for_development text, p_remarks text, OUT status report_status, OUT lock_version integer, OUT report_version_id uuid, OUT revision_number integer, OUT content_hash text)
 RETURNS record
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_r             public.reports%ROWTYPE;
  v_start         timestamptz;
  v_ratings       public.competency_rating[];
  v_n             bigint;
  v_obs_lock      integer;
  v_version_id    uuid;
  v_hash          text;
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

  PERFORM 1 FROM public.enrolments e WHERE e.id = v_r.enrolment_id AND e.is_active;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC016', MESSAGE = 'report: no active enrolment for this student and module';
  END IF;
  PERFORM 1 FROM public.attendance a
   WHERE a.class_session_id = v_r.class_session_id AND a.student_id = v_r.student_id
     AND a.status = 'present';
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC015', MESSAGE = 'report: the student is not recorded present for this session';
  END IF;
  SELECT ((cs.session_date + COALESCE(cs.starts_at, TIME '00:00')) AT TIME ZONE 'Asia/Singapore')
    INTO v_start FROM public.class_sessions cs WHERE cs.id = v_r.class_session_id;
  IF v_start IS NULL OR pg_catalog.now() < v_start THEN
    RAISE EXCEPTION USING ERRCODE = 'BC017', MESSAGE = 'report: the scheduled session start has not been reached';
  END IF;

  IF v_r.status <> 'drafting' THEN
    RAISE EXCEPTION USING ERRCODE = 'BC004', MESSAGE = 'report: this transition is not legal from the report''s current state';
  END IF;
  IF v_r.lock_version IS DISTINCT FROM p_expected_lock_version THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  IF COALESCE(pg_catalog.length(pg_catalog.btrim(COALESCE(p_overview, ''))), 0)
   + COALESCE(pg_catalog.length(pg_catalog.btrim(COALESCE(p_strengths, ''))), 0)
   + COALESCE(pg_catalog.length(pg_catalog.btrim(COALESCE(p_areas_for_development, ''))), 0)
   + COALESCE(pg_catalog.length(pg_catalog.btrim(COALESCE(p_remarks, ''))), 0) = 0 THEN
    RAISE EXCEPTION USING ERRCODE = 'BC020', MESSAGE = 'report: the supplied content is degenerate';
  END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM public.observation_ratings orr WHERE orr.observation_id = v_r.observation_id;
  IF v_n <> 9 THEN
    RAISE EXCEPTION USING ERRCODE = 'BC018', MESSAGE = 'report: the observation does not carry exactly nine ratings';
  END IF;

  SELECT o.lock_version INTO v_obs_lock FROM public.observations o WHERE o.id = v_r.observation_id;
  IF v_obs_lock IS DISTINCT FROM p_observation_lock_version THEN
    RAISE EXCEPTION USING ERRCODE = 'BC019', MESSAGE = 'report: the observation changed after the draft was requested';
  END IF;

  IF v_r.current_cycle_version_id IS NOT NULL
     OR EXISTS (SELECT 1 FROM public.report_versions rv WHERE rv.report_id = p_report_id) THEN
    RAISE EXCEPTION USING ERRCODE = 'BC024', MESSAGE = 'report: this report already holds a version';
  END IF;

  -- The nine ratings, ordered by the SAME hard-coded dimension list the
  -- content serializer pins. Deliberately not ordered by
  -- assessment_dimensions.sort_order, which is mutable.
  SELECT pg_catalog.array_agg(x.rating ORDER BY x.ord)
    INTO v_ratings
    FROM (
      SELECT orr.rating,
             pg_catalog.array_position(
               ARRAY['body','emotion','speech','tonality','eye_contact',
                     'vocal_projection','emotional_expression','sentence_flow',
                     'audience_awareness']::text[],
               orr.dimension_code::text) AS ord
        FROM public.observation_ratings orr
       WHERE orr.observation_id = v_r.observation_id
    ) x;

  v_hash := public.report_content_hash_v2(
    p_overview, p_strengths, p_areas_for_development, p_remarks, v_ratings);

  -- Ratified statement order for every version-creating path: compute both
  -- hashes from the arguments, INSERT the version row with the hash already
  -- populated, THEN insert the nine FK-child rating rows, THEN the
  -- all-false checklist row where the creating operation is a trainer one.
  INSERT INTO public.report_versions (
    report_id, centre_id, revision_number,
    overview, strengths, areas_for_development, remarks,
    authored_by_membership_id, authored_by_role,
    content_hash, content_hash_version
  ) VALUES (
    p_report_id, v_r.centre_id, 1,
    p_overview, p_strengths, p_areas_for_development, p_remarks,
    v_membership_id, 'trainer',
    v_hash, 2
  )
  RETURNING public.report_versions.id INTO v_version_id;

  INSERT INTO public.report_version_ratings (report_version_id, report_id, dimension_code, rating)
  SELECT v_version_id, p_report_id, orr.dimension_code, orr.rating
    FROM public.observation_ratings orr
   WHERE orr.observation_id = v_r.observation_id;

  INSERT INTO public.report_version_checklist_progress (report_version_id, report_id)
  VALUES (v_version_id, p_report_id);

  UPDATE public.reports r
     SET status = 'draft_ready',
         lock_version = r.lock_version + 1,
         current_cycle_version_id = v_version_id,
         updated_at = pg_catalog.now()
   WHERE r.id = p_report_id;

  -- Ordering is ratified, not incidental: the version must exist before the
  -- transition that references it is recorded. seq_no is dense and the two
  -- events are hash-linked, so the order is frozen in tamper-evident
  -- evidence.
  PERFORM public.audit_append_event(
    v_r.centre_id, v_account_id, v_membership_id, 'trainer'::public.centre_membership_role,
    'report_version.created', NULL, NULL, NULL,
    'report_version', v_version_id, 'Report version',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('target_type', 'report', 'target_id', v_r.id::text, 'target_label', 'Report')
    ),
    pg_catalog.jsonb_build_object(
      'report_version_id',        v_version_id::text,
      'revision_number',          1,
      'content_hash',             v_hash,
      'authored_by_role',         'trainer',
      'observation_id',           v_r.observation_id::text,
      'observation_lock_version', v_obs_lock
    )
  );
  PERFORM public.audit_append_event(
    v_r.centre_id, v_account_id, v_membership_id, 'trainer'::public.centre_membership_role,
    'report.state_changed', 'report', 'drafting', 'draft_ready',
    'report', v_r.id, 'Report',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('target_type', 'report_version', 'target_id', v_version_id::text, 'target_label', 'Report version')
    ),
    pg_catalog.jsonb_build_object(
      'report_id',         v_r.id::text,
      'report_version_id', v_version_id::text,
      'content_hash',      v_hash
    )
  );

  status            := 'draft_ready';
  lock_version      := v_r.lock_version + 1;
  report_version_id := v_version_id;
  revision_number   := 1;
  content_hash      := v_hash;
END;
$function$;

CREATE OR REPLACE FUNCTION public.report_management_approve_and_submit(p_report_id uuid, p_expected_lock_version integer, p_expected_version_id uuid, p_expected_wording_hash text, OUT status report_status, OUT lock_version integer, OUT submitted_version_id uuid, OUT submitted_at timestamp with time zone)
 RETURNS record
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_r             public.reports%ROWTYPE;
  v_final         public.report_versions%ROWTYPE;
  v_source_id     uuid;
  v_n             bigint;
  v_mismatch      bigint;
  v_ratings       public.competency_rating[];
  v_recomputed    text;
  v_ev            boolean;
  v_ai            boolean;
  v_pc            boolean;
  v_now           timestamptz;
BEGIN
  -- 1. Re-read authoritative state under the aggregate row lock.
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;
  SELECT r.* INTO v_r FROM public.reports r WHERE r.id = p_report_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  -- 2. The LIVE centre authorization A-037 requires -- never a token claim,
  --    never UI state.
  SELECT (pg_catalog.array_agg(m.id))[1] INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id
     AND m.role = 'management' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  -- 3. THE OBSOLETE-VERSION GATE: a management approval of anything other
  --    than the report's current candidate cannot pass.
  IF v_r.status <> 'trainer_approved' THEN
    RAISE EXCEPTION USING ERRCODE = 'BC004', MESSAGE = 'report: this transition is not legal from the report''s current state';
  END IF;
  IF v_r.lock_version IS DISTINCT FROM p_expected_lock_version
     OR v_r.current_cycle_version_id IS DISTINCT FROM p_expected_version_id THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  SELECT rv.* INTO v_final FROM public.report_versions rv WHERE rv.id = p_expected_version_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  -- 4. TRAINER-APPROVAL LINEAGE GATE -- the structural implementation of
  --    "management submission without trainer approval must be prevented".
  --    Step 3 already proved the final version is the report's CURRENT
  --    candidate, so the resolved source is the current lineage root by
  --    construction: a stale or superseded source cannot reach this gate.
  --    This READS an existing trainer approval; it never creates, copies or
  --    infers one.
  PERFORM 1 FROM public.report_version_approvals ap
   WHERE ap.report_version_id = v_final.id AND ap.approver_role = 'trainer';
  IF FOUND THEN
    v_source_id := v_final.id;
  ELSE
    v_source_id := v_final.trainer_approved_source_version_id;
  END IF;
  IF v_source_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC009', MESSAGE = 'report: no trainer approval stands behind this version';
  END IF;
  SELECT ap.checklist_evidence_confirmed, ap.checklist_ai_draft_reviewed, ap.checklist_privacy_checked
    INTO v_ev, v_ai, v_pc
    FROM public.report_version_approvals ap
   WHERE ap.report_version_id = v_source_id AND ap.approver_role = 'trainer';
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC009', MESSAGE = 'report: no trainer approval stands behind this version';
  END IF;

  -- 5. RATING-PARITY GATE. Independently re-proves that no wording edit
  --    mutated or impersonated a rating, even if an implementation error
  --    occurred upstream.
  SELECT pg_catalog.count(*) INTO v_mismatch
    FROM (
      (SELECT rvr.dimension_code, rvr.rating FROM public.report_version_ratings rvr
        WHERE rvr.report_version_id = v_final.id
       EXCEPT ALL
       SELECT rvr.dimension_code, rvr.rating FROM public.report_version_ratings rvr
        WHERE rvr.report_version_id = v_source_id)
      UNION ALL
      (SELECT rvr.dimension_code, rvr.rating FROM public.report_version_ratings rvr
        WHERE rvr.report_version_id = v_source_id
       EXCEPT ALL
       SELECT rvr.dimension_code, rvr.rating FROM public.report_version_ratings rvr
        WHERE rvr.report_version_id = v_final.id)
    ) d;
  IF v_mismatch <> 0 THEN
    RAISE EXCEPTION USING ERRCODE = 'BC010',
      MESSAGE = 'report: the assessment ratings of this version do not match its trainer-approved source';
  END IF;

  -- 6. Snapshot completeness for the final version.
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.report_version_ratings rvr WHERE rvr.report_version_id = v_final.id;
  IF v_n <> 9 THEN
    RAISE EXCEPTION USING ERRCODE = 'BC018', MESSAGE = 'report: this version does not carry exactly nine rating snapshots';
  END IF;

  -- 7. Content-hash integrity. A mismatch here is a DATA-INTEGRITY ANOMALY,
  --    distinct in code and shape from a caller mismatch.
  SELECT pg_catalog.array_agg(x.rating ORDER BY x.ord) INTO v_ratings
    FROM (
      SELECT rvr.rating,
             pg_catalog.array_position(
               ARRAY['body','emotion','speech','tonality','eye_contact',
                     'vocal_projection','emotional_expression','sentence_flow',
                     'audience_awareness']::text[],
               rvr.dimension_code::text) AS ord
        FROM public.report_version_ratings rvr
       WHERE rvr.report_version_id = v_final.id
    ) x;
  v_recomputed := public.report_content_hash_v2(
    v_final.overview, v_final.strengths, v_final.areas_for_development,
    v_final.remarks, v_ratings);
  IF v_recomputed IS DISTINCT FROM v_final.content_hash THEN
    RAISE EXCEPTION USING ERRCODE = 'BC007', MESSAGE = 'report: stored content integrity check failed';
  END IF;

  -- 8. Wording-hash proof: management submits THE EXACT TEXT IT REVIEWED.
  --    The content hash is never returned to, nor accepted from, management.
  IF public.report_wording_hash_v2(
       v_final.overview, v_final.strengths,
       v_final.areas_for_development, v_final.remarks)
     IS DISTINCT FROM p_expected_wording_hash THEN
    RAISE EXCEPTION USING ERRCODE = 'BC008',
      MESSAGE = 'report: the wording you reviewed is no longer current; re-read and retry';
  END IF;

  v_now := pg_catalog.now();

  -- 9. Management approval provenance. The three checklist columns are
  --    EVIDENCE, NOT AN APPROVAL: they record that the TRAINER's gate was
  --    satisfied for the lineage source, copied from that source's trainer
  --    approval row so the all-true CHECK is satisfied by a TRUE FACT. They
  --    do not create a trainer approval and never make this row count as
  --    one. approver_role is supplied literally, never defaulted.
  INSERT INTO public.report_version_approvals (
    report_version_id, report_id, centre_id,
    approved_by_membership_id, approver_role, approved_at,
    checklist_evidence_confirmed, checklist_ai_draft_reviewed, checklist_privacy_checked
  ) VALUES (
    v_final.id, p_report_id, v_r.centre_id,
    v_membership_id, 'management', v_now,
    v_ev, v_ai, v_pc
  );

  -- 10. TRANSITION 1: trainer_approved -> approved (transient).
  UPDATE public.reports r
     SET status = 'approved', lock_version = r.lock_version + 1, updated_at = v_now
   WHERE r.id = p_report_id;

  PERFORM public.audit_append_event(
    v_r.centre_id, v_account_id, v_membership_id, 'management'::public.centre_membership_role,
    'report.state_changed', 'report', 'trainer_approved', 'approved',
    'report', v_r.id, 'Report',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('target_type', 'report_version', 'target_id', v_final.id::text,  'target_label', 'Report version'),
      pg_catalog.jsonb_build_object('target_type', 'report_version', 'target_id', v_source_id::text, 'target_label', 'Report version')
    ),
    pg_catalog.jsonb_build_object(
      'report_id',                          v_r.id::text,
      'report_version_id',                  v_final.id::text,
      'content_hash',                       v_final.content_hash,
      'trainer_approved_source_version_id', v_source_id::text,
      'checklist_evidence_confirmed',       v_ev,
      'checklist_ai_draft_reviewed',        v_ai,
      'checklist_privacy_checked',          v_pc
    )
  );

  -- 11. TRANSITION 2: approved -> submitted, with the WRITE-ONCE publication
  --     metadata on the version row. This is the ONLY permitted post-approval
  --     write to a version, and only where all three fields are NULL.
  UPDATE public.report_versions rv
     SET submitted_at = v_now,
         submitted_by_membership_id = v_membership_id,
         submitted_by_role = 'management',
         updated_at = v_now
   WHERE rv.id = v_final.id
     AND rv.submitted_at IS NULL
     AND rv.submitted_by_membership_id IS NULL
     AND rv.submitted_by_role IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  UPDATE public.reports r
     SET status = 'submitted',
         lock_version = r.lock_version + 1,
         latest_submitted_version_id = v_final.id,
         updated_at = v_now
   WHERE r.id = p_report_id;

  PERFORM public.audit_append_event(
    v_r.centre_id, v_account_id, v_membership_id, 'management'::public.centre_membership_role,
    'report.state_changed', 'report', 'approved', 'submitted',
    'report', v_r.id, 'Report',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('target_type', 'report_version', 'target_id', v_final.id::text,  'target_label', 'Report version'),
      pg_catalog.jsonb_build_object('target_type', 'report_version', 'target_id', v_source_id::text, 'target_label', 'Report version')
    ),
    pg_catalog.jsonb_build_object(
      'report_id',                          v_r.id::text,
      'report_version_id',                  v_final.id::text,
      'content_hash',                       v_final.content_hash,
      'trainer_approved_source_version_id', v_source_id::text,
      'checklist_evidence_confirmed',       v_ev,
      'checklist_ai_draft_reviewed',        v_ai,
      'checklist_privacy_checked',          v_pc
    )
  );

  -- 12. OUTBOX INSERTION POINT (A-039 trigger 3). Linked parents are owed a
  --     notification. The outbox row belongs HERE, inside this transaction;
  --     the notification RECORD and its delivery are created AFTER commit by
  --     a separately driven worker reading committed outbox rows, so a
  --     delivery failure never rolls back a committed publication.
  --     Step 7I creates no notification object, no outbox table and no row.

  status              := 'submitted';
  lock_version        := v_r.lock_version + 2;
  submitted_version_id := v_final.id;
  submitted_at        := v_now;
END;
$function$;

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
    v_src.content_hash, 1
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

CREATE OR REPLACE FUNCTION public.report_trainer_approve(p_report_id uuid, p_expected_status report_status, p_expected_lock_version integer, p_expected_version_id uuid, p_expected_content_hash text, OUT status report_status, OUT lock_version integer, OUT trainer_approved_version_id uuid)
 RETURNS record
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_r             public.reports%ROWTYPE;
  v_cand          public.report_versions%ROWTYPE;
  v_start         timestamptz;
  v_ev            boolean;
  v_ai            boolean;
  v_pc            boolean;
  v_n             bigint;
  v_ratings       public.competency_rating[];
  v_recomputed    text;
  v_open_id       uuid;
BEGIN
  -- 1. Re-read authoritative state under the aggregate row lock.
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;
  SELECT r.* INTO v_r FROM public.reports r WHERE r.id = p_report_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  -- 2. Revalidate LIVE authorization (never a token claim, never UI state).
  SELECT (pg_catalog.array_agg(m.id))[1] INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id
     AND m.role = 'trainer' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL OR NOT public.app_trainer_reaches_session(v_r.class_session_id) THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;
  PERFORM 1 FROM public.enrolments e WHERE e.id = v_r.enrolment_id AND e.is_active;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC016', MESSAGE = 'report: no active enrolment for this student and module';
  END IF;
  PERFORM 1 FROM public.attendance a
   WHERE a.class_session_id = v_r.class_session_id AND a.student_id = v_r.student_id
     AND a.status = 'present';
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC015', MESSAGE = 'report: the student is not recorded present for this session';
  END IF;
  SELECT ((cs.session_date + COALESCE(cs.starts_at, TIME '00:00')) AT TIME ZONE 'Asia/Singapore')
    INTO v_start FROM public.class_sessions cs WHERE cs.id = v_r.class_session_id;
  IF v_start IS NULL OR pg_catalog.now() < v_start THEN
    RAISE EXCEPTION USING ERRCODE = 'BC017', MESSAGE = 'report: the scheduled session start has not been reached';
  END IF;

  -- 3. Domain check, BEFORE CAS.
  IF p_expected_status IS NULL OR p_expected_status NOT IN ('draft_ready', 'needs_edit') THEN
    RAISE EXCEPTION USING ERRCODE = 'BC004', MESSAGE = 'report: this transition is not legal from the requested state';
  END IF;
  IF v_r.status NOT IN ('draft_ready', 'needs_edit') THEN
    RAISE EXCEPTION USING ERRCODE = 'BC004', MESSAGE = 'report: this transition is not legal from the report''s current state';
  END IF;

  -- 4. CAS on status + lock_version + current-version id, all compared with
  --    IS DISTINCT FROM so a NULL expectation can never read as a match.
  IF v_r.status IS DISTINCT FROM p_expected_status
     OR v_r.lock_version IS DISTINCT FROM p_expected_lock_version
     OR v_r.current_cycle_version_id IS DISTINCT FROM p_expected_version_id THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  -- 5. Prior-approval gate (R-7a). Fires BEFORE any INSERT is attempted, so
  --    the failure is a transition guard and never a primary-key violation.
  PERFORM 1 FROM public.report_version_approvals ap
   WHERE ap.report_version_id = p_expected_version_id AND ap.approver_role = 'trainer';
  IF FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC011',
      MESSAGE = 'report: this version already carries a trainer approval; a correction requires a new version';
  END IF;

  -- 6. Checklist gate for EXACTLY this version. A missing row is a FAILURE,
  --    not a pass: it means the candidate is management-authored, which can
  --    never be trainer-approved.
  SELECT cp.evidence_confirmed, cp.ai_draft_reviewed, cp.privacy_checked
    INTO v_ev, v_ai, v_pc
    FROM public.report_version_checklist_progress cp
   WHERE cp.report_version_id = p_expected_version_id;
  IF NOT FOUND OR NOT (v_ev AND v_ai AND v_pc) THEN
    RAISE EXCEPTION USING ERRCODE = 'BC005',
      MESSAGE = 'report: every quality-checklist item must be satisfied for this exact version before approval';
  END IF;

  -- 7. Snapshot completeness.
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.report_version_ratings rvr WHERE rvr.report_version_id = p_expected_version_id;
  IF v_n <> 9 THEN
    RAISE EXCEPTION USING ERRCODE = 'BC018', MESSAGE = 'report: this version does not carry exactly nine rating snapshots';
  END IF;

  SELECT rv.* INTO v_cand FROM public.report_versions rv WHERE rv.id = p_expected_version_id;

  -- 8. Content-hash verification. The STORED-vs-RECOMPUTED check is a
  --    data-integrity anomaly and is deliberately distinct in code and shape
  --    from the caller mismatch, which is an ordinary stale render.
  SELECT pg_catalog.array_agg(x.rating ORDER BY x.ord) INTO v_ratings
    FROM (
      SELECT rvr.rating,
             pg_catalog.array_position(
               ARRAY['body','emotion','speech','tonality','eye_contact',
                     'vocal_projection','emotional_expression','sentence_flow',
                     'audience_awareness']::text[],
               rvr.dimension_code::text) AS ord
        FROM public.report_version_ratings rvr
       WHERE rvr.report_version_id = p_expected_version_id
    ) x;
  v_recomputed := public.report_content_hash_v2(
    v_cand.overview, v_cand.strengths, v_cand.areas_for_development,
    v_cand.remarks, v_ratings);
  IF v_recomputed IS DISTINCT FROM v_cand.content_hash THEN
    RAISE EXCEPTION USING ERRCODE = 'BC007',
      MESSAGE = 'report: stored content integrity check failed';
  END IF;
  IF p_expected_content_hash IS DISTINCT FROM v_cand.content_hash THEN
    RAISE EXCEPTION USING ERRCODE = 'BC006',
      MESSAGE = 'report: the content you reviewed is no longer current; re-read and retry';
  END IF;

  -- 9. Trainer approval provenance. approver_role is supplied LITERALLY --
  --    A-040 dropped the column default precisely so an omission fails
  --    loudly instead of silently manufacturing a trainer approval.
  INSERT INTO public.report_version_approvals (
    report_version_id, report_id, centre_id,
    approved_by_membership_id, approver_role, approved_at,
    checklist_evidence_confirmed, checklist_ai_draft_reviewed, checklist_privacy_checked
  ) VALUES (
    p_expected_version_id, p_report_id, v_r.centre_id,
    v_membership_id, 'trainer', pg_catalog.now(),
    v_ev, v_ai, v_pc
  );

  -- 10. Correction-request resolution. ONLY an `open` row is ever touched:
  --     a previously resolved row is immutable and is never re-resolved,
  --     re-dated or re-pointed by a later cycle.
  UPDATE public.report_correction_requests cr
     SET status = 'resolved',
         resolved_at = pg_catalog.now(),
         resolved_by_membership_id = v_membership_id,
         resolver_role = 'trainer',
         resolving_version_id = p_expected_version_id
   WHERE cr.report_id = p_report_id AND cr.status = 'open'
  RETURNING cr.id INTO v_open_id;

  -- 11. Transition + audit, in the same transaction.
  UPDATE public.reports r
     SET status = 'trainer_approved',
         lock_version = r.lock_version + 1,
         updated_at = pg_catalog.now()
   WHERE r.id = p_report_id;

  PERFORM public.audit_append_event(
    v_r.centre_id, v_account_id, v_membership_id, 'trainer'::public.centre_membership_role,
    'report.state_changed', 'report', v_r.status::text, 'trainer_approved',
    'report', v_r.id, 'Report',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('target_type', 'report_version', 'target_id', p_expected_version_id::text, 'target_label', 'Report version')
    )
    || CASE WHEN v_open_id IS NULL THEN '[]'::jsonb
            ELSE pg_catalog.jsonb_build_array(
                   pg_catalog.jsonb_build_object('target_type', 'report_correction_request', 'target_id', v_open_id::text, 'target_label', 'Correction request'))
       END,
    pg_catalog.jsonb_build_object(
      'report_id',                    v_r.id::text,
      'report_version_id',            p_expected_version_id::text,
      'content_hash',                 v_cand.content_hash,
      'checklist_evidence_confirmed', v_ev,
      'checklist_ai_draft_reviewed',  v_ai,
      'checklist_privacy_checked',    v_pc
    )
    || CASE WHEN v_open_id IS NULL THEN '{}'::jsonb
            ELSE pg_catalog.jsonb_build_object('resolved_correction_request_id', v_open_id::text)
       END
  );

  -- 12. OUTBOX INSERTION POINT (A-039 trigger 1). A management notification
  --     is owed. The outbox row belongs HERE, INSIDE this transaction, so it
  --     commits with the transition or not at all -- a post-commit hook with
  --     no in-transaction outbox row is PROHIBITED, because it would satisfy
  --     "only after success" while violating "never lost". Step 7I creates no
  --     notification object, no outbox table and no outbox row; the
  --     notifications checkpoint will CREATE OR REPLACE this function to add
  --     that single INSERT at this clearly-marked location.

  status                      := 'trainer_approved';
  lock_version                := v_r.lock_version + 1;
  trainer_approved_version_id := p_expected_version_id;
END;
$function$;

COMMENT ON FUNCTION public.report_get_canonical(uuid,uuid) IS
  'Step 7I RPC-13 (A-030/A-021): the ONE canonical submitted-report read, shared by trainer, management and parent. Per-role live predicates -- trainer: app_trainer_reaches_session; management: a single active management membership of the report''s centre; parent: app_parent_reaches_student. Resolves EXCLUSIVELY through latest_submitted_version_id, so no role can reach an unsubmitted version. Returns exactly the four panels and submitted_at -- never a content hash, revision number, rating, note, checklist or approval field. Every denial and every unavailability is the same ZERO-ROW outcome.';

COMMENT ON FUNCTION public.report_get_management_review(uuid,uuid) IS
  'Step 7I RPC-15 (R-32/A-038): the STATUS-GATED management pre-submission read. At trainer_approved it returns the final-review candidate -- the four parent-facing panels, the computed WORDING hash and the CAS values management genuinely needs. At submitted it returns the published panels with a NULL wording_hash and no candidate version id. At incomplete, observation_saved, drafting, draft_ready and needs_edit -- and where no report exists -- it returns the ZERO-ROW unavailable outcome. It never returns a rating, content hash, revision number, checklist field, approval field or correction reason at any status.';

COMMENT ON FUNCTION public.report_get_working(uuid,uuid) IS
  'Step 7I RPC-14: the TRAINER-ONLY working-state read. Carries status, lock_version, the current candidate''s id/revision/content/content_hash, the version-scoped checklist booleans (NULL where no row exists -- a management wording version has none), the nine rating snapshots with authoritative labels, the canonical pointer metadata, and any OPEN correction request including its REASON. Denied to management and to parents by a fail-closed trainer-membership predicate; the denial is the same zero-row outcome as absence.';

COMMENT ON FUNCTION public.report_management_edit_wording(uuid,integer,uuid,text,text,text,text,text) IS
  'Step 7I RPC-9 (T9, status-preserving): management''s PARENT-FACING WORDING-ONLY edit. The allow-list is the SIGNATURE -- there is no rating, observation, attendance, evidence, note, checklist, approval, revision, lineage, authorship or submission parameter. Creates a new immutable version whose nine snapshots are copied VERBATIM from the resolved trainer-approved source, so a rating can never change. Requires the caller-supplied WORDING hash (never the content hash, R-26). Creates no checklist row. Emits report_version.created only.';

COMMENT ON FUNCTION public.report_save_edit(uuid,report_status,integer,uuid,text,text,text,text,uuid) IS
  'Step 7I RPC-6 (T5 draft_ready -> draft_ready; T6 needs_edit -> draft_ready): the governed trainer save. Creates a NEW IMMUTABLE version every time (R-5), re-copying the nine current observation_ratings so a trainer rating correction propagates. Carries the R-7b reaffirmation gate on the T6 arc: a SILENT byte-identical save is rejected; a reaffirmation must name the report''s open correction request. Emits report_version.created always, plus report.state_changed on T6 only.';

COMMENT ON FUNCTION public.report_store_draft(uuid,integer,integer,text,text,text,text) IS
  'Step 7I RPC-4 (T3, drafting -> draft_ready): INTERNAL/SERVER-ONLY draft storage with ZERO client EXECUTE (R-27). Granting it would create a permanent browser-reachable path that writes report content from four arbitrary text fields -- exactly the grounding-bypass surface CLAUDE.md section 4 non-negotiable 1 forbids. The AI checkpoint owns the trusted generation-completion channel that invokes it. Creates revision 1 with nine snapshots, both hashes and an all-false checklist row; emits report_version.created then report.state_changed.';

REVOKE ALL ON FUNCTION public.report_get_canonical(uuid,uuid)
  FROM PUBLIC, anon, authenticated, service_role, authenticator;
GRANT EXECUTE ON FUNCTION public.report_get_canonical(uuid,uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.report_get_management_review(uuid,uuid)
  FROM PUBLIC, anon, authenticated, service_role, authenticator;
GRANT EXECUTE ON FUNCTION public.report_get_management_review(uuid,uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.report_get_working(uuid,uuid)
  FROM PUBLIC, anon, authenticated, service_role, authenticator;
GRANT EXECUTE ON FUNCTION public.report_get_working(uuid,uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.report_management_edit_wording(uuid,integer,uuid,text,text,text,text,text)
  FROM PUBLIC, anon, authenticated, service_role, authenticator;
GRANT EXECUTE ON FUNCTION public.report_management_edit_wording(uuid,integer,uuid,text,text,text,text,text) TO authenticated;

REVOKE ALL ON FUNCTION public.report_save_edit(uuid,report_status,integer,uuid,text,text,text,text,uuid)
  FROM PUBLIC, anon, authenticated, service_role, authenticator;
GRANT EXECUTE ON FUNCTION public.report_save_edit(uuid,report_status,integer,uuid,text,text,text,text,uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.report_store_draft(uuid,integer,integer,text,text,text,text)
  FROM PUBLIC, anon, authenticated, service_role, authenticator;


-- ---------------------------------------------------------------------
-- End-of-migration catalogue assertions (6.5 item 5).
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
  -- A1: the four OD-4 columns exist and the four superseded ones do not.
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_attribute a
    JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relname = 'report_versions'
     AND NOT a.attisdropped AND a.attnum > 0
     AND a.attname IN ('overview','strengths','areas_for_development','remarks');
  IF v_n <> 4 THEN RAISE EXCEPTION 'OD-4 assertion A1 failed: % of 4 OD-4 columns present', v_n; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_attribute a
    JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relname = 'report_versions'
     AND NOT a.attisdropped AND a.attnum > 0
     AND a.attname IN ('todays_strength','next_focus','practice_suggestion','session_takeaway');
  IF v_n <> 0 THEN RAISE EXCEPTION 'OD-4 assertion A1 failed: % superseded column(s) survive', v_n; END IF;

  -- A2: the envelope constraint kept its NAME and now admits 1 and 2.
  SELECT pg_catalog.pg_get_constraintdef(oid) INTO v_txt FROM pg_catalog.pg_constraint
   WHERE conrelid = 'public.report_versions'::regclass
     AND conname = 'report_versions_content_hash_version_chk';
  IF v_txt IS NULL THEN
    RAISE EXCEPTION 'OD-4 assertion A2 failed: report_versions_content_hash_version_chk is gone -- the NAME is load-bearing';
  END IF;
  IF v_txt !~ '1' OR v_txt !~ '2' THEN
    RAISE EXCEPTION 'OD-4 assertion A2 failed: constraint does not admit 1 and 2: %', v_txt;
  END IF;

  -- A3: CURRENT zero-client-EXECUTE set is exactly these SIX, for every
  -- client role. This is the post-M13 current-state proof PD-1 requires the
  -- new migration to carry itself; the historical migration-resident blocks
  -- are point-in-time and are deliberately NOT touched.
  FOREACH v_name IN ARRAY v_zero LOOP
    SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public' AND p.proname = v_name;
    IF v_n < 1 THEN RAISE EXCEPTION 'OD-4 assertion A3 failed: % does not exist', v_name; END IF;

    SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public' AND p.proname = v_name
       AND (pg_catalog.has_function_privilege('anon', p.oid, 'EXECUTE')
         OR pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE')
         OR pg_catalog.has_function_privilege('service_role', p.oid, 'EXECUTE')
         OR pg_catalog.has_function_privilege('authenticator', p.oid, 'EXECUTE'));
    IF v_n <> 0 THEN
      RAISE EXCEPTION 'OD-4 assertion A3 failed: % is client-executable', v_name;
    END IF;

    -- proacl must be a CONCRETE owner-only ACL. A NULL proacl means the
    -- DEFAULT PUBLIC EXECUTE, which is the trap the explicit REVOKEs exist
    -- to close; grantee 0 is PUBLIC.
    SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public' AND p.proname = v_name
       AND (p.proacl IS NULL
         OR EXISTS (SELECT 1 FROM pg_catalog.aclexplode(p.proacl) x WHERE x.grantee = 0));
    IF v_n <> 0 THEN
      RAISE EXCEPTION 'OD-4 assertion A3 failed: % has a NULL or PUBLIC-bearing proacl', v_name;
    END IF;
  END LOOP;

  -- A4: V1 is untouched -- signature, ACL and COMMENT included. A body-only
  -- check would miss all three (see prove-v1-freeze.mjs).
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname IN ('report_content_hash_v1','report_wording_hash_v1')
     AND p.proacl::text = '{postgres=X/postgres}'
     AND p.provolatile = 'i' AND p.proparallel = 's' AND p.prosecdef = false
     AND pg_catalog.obj_description(p.oid,'pg_proc') IS NOT NULL;
  IF v_n <> 2 THEN
    RAISE EXCEPTION 'OD-4 assertion A4 failed: V1 serializer posture changed (% of 2 intact)', v_n;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_content_hash_v1'
     AND pg_catalog.pg_get_function_identity_arguments(p.oid) =
         'p_todays_strength text, p_next_focus text, p_practice_suggestion text, p_session_takeaway text, p_ratings competency_rating[]';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'OD-4 assertion A4 failed: report_content_hash_v1 signature changed';
  END IF;

  -- A5: the six recreated RPCs exist, carry OD-4 parameters, and no stale
  -- old-signature overload survives the DROP + CREATE.
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname IN ('report_store_draft','report_save_edit','report_management_edit_wording',
                       'report_get_canonical','report_get_working','report_get_management_review');
  IF v_n <> 6 THEN
    RAISE EXCEPTION 'OD-4 assertion A5 failed: % panel RPC overload(s) exist, expected exactly 6', v_n;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND (p.prosrc LIKE '%todays_strength%' OR p.prosrc LIKE '%next_focus%'
       OR p.prosrc LIKE '%practice_suggestion%' OR p.prosrc LIKE '%session_takeaway%')
     AND p.proname NOT IN ('report_content_hash_v1','report_wording_hash_v1');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'OD-4 assertion A5 failed: % non-V1 function(s) still reference a superseded panel', v_n;
  END IF;

  -- A6: report_store_draft keeps ZERO client EXECUTE (R-27, G-05a item 8).
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_store_draft'
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'OD-4 assertion A6 failed: report_store_draft gained client EXECUTE';
  END IF;

  -- A7: census. Functions 34 -> 36; tables, enums and policies unchanged, so
  -- A-031's ceiling is untouched. authenticated EXECUTE unchanged at 25.
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public';
  IF v_n <> 36 THEN RAISE EXCEPTION 'OD-4 assertion A7 failed: % functions, expected 36', v_n; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r';
  IF v_n <> 26 THEN RAISE EXCEPTION 'OD-4 assertion A7 failed: % tables, expected 26', v_n; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_type t
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN RAISE EXCEPTION 'OD-4 assertion A7 failed: % enums, expected 12', v_n; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_policies WHERE schemaname = 'public';
  IF v_n <> 29 THEN RAISE EXCEPTION 'OD-4 assertion A7 failed: % policies, expected 29', v_n; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 25 THEN
    RAISE EXCEPTION 'OD-4 assertion A7 failed: % authenticated EXECUTE, expected 25', v_n;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND pg_catalog.has_function_privilege('service_role', p.oid, 'EXECUTE');
  IF v_n <> 0 THEN RAISE EXCEPTION 'OD-4 assertion A7 failed: % service_role EXECUTE, expected 0', v_n; END IF;

  -- A8: applying this migration wrote no data.
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_versions;
  IF v_n <> 0 THEN RAISE EXCEPTION 'OD-4 assertion A8 failed: report_versions holds % row(s)', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.audit_events;
  IF v_n <> 0 THEN RAISE EXCEPTION 'OD-4 assertion A8 failed: audit_events holds % row(s)', v_n; END IF;

  RAISE NOTICE 'OD-4 migration: all posture assertions passed (36 functions, 26 tables, 12 enums, 29 policies, 25 authenticated EXECUTE, 0 service_role; four OD-4 columns present and four superseded columns gone; constraint name preserved admitting 1 or 2; six owner-only functions with concrete non-PUBLIC ACLs; V1 frozen; no data written).';
END;
$assert$;
