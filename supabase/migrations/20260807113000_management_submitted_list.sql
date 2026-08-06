-- =====================================================================
-- B.E.S.T Coach -- Management submitted-report list (C2C-004)
-- =====================================================================
-- Governing authority (highest first):
--   Specification v3 -> Amendment 001 -> Amendment 002 -> Amendment 003
--   -> Amendment 004 (A-033 ... A-040) -> Amendment 005 -> Amendment 006
--   -> CLAUDE.md -> Implementation Plan
--   -> docs/plan/STEP_7I_REPORT_LIFECYCLE_BASELINE.md
--   -> UI_REFERENCE_FINAL_MVP/RUN_C2_UI_ARCHITECTURE_RECONCILIATION.md (C2C-004)
--
-- WHAT THIS MIGRATION CREATES -- exactly one bounded read boundary:
--   * 1 function ..... public.report_list_management_submitted()
--   * 1 COMMENT ON FUNCTION statement
--   * 1 REVOKE line and 1 GRANT line
--   * its authored post-apply assertions
--
-- WHAT IT DELIBERATELY DOES NOT CREATE:
--   no ALTER TYPE, no CREATE TABLE, no CREATE TYPE, no column, no
--   constraint, no index, no CREATE POLICY, no table GRANT, no ALTER
--   DEFAULT PRIVILEGES, no ownership change, no trigger, no view, no
--   extension, no schema, no audit action, and NO `CREATE OR REPLACE` of
--   any existing function. Every previously applied migration is
--   byte-untouched, so the Step 7H B20 registry equality, the Step 7I
--   T7I-30 purity scan, assessment assertion C9 and correction-tracking
--   assertion M10 all continue to hold.
--
-- ---------------------------------------------------------------------
-- THE LIFECYCLE CONTRACT THIS FUNCTION IS BUILT ON -- established from
-- the migrations themselves, not assumed from the finding's wording.
-- ---------------------------------------------------------------------
-- `public.report_status` carries EXACTLY EIGHT labels (A-036, and the
-- assertion below re-derives them from the catalogue rather than trusting
-- this comment): incomplete, observation_saved, drafting, draft_ready,
-- needs_edit, trainer_approved, approved, submitted.
--
-- OF THOSE EIGHT, `approved` NEVER COMMITS. That is not a reading of the
-- amendment text -- it is what the applied code does.
-- `public.report_management_approve_and_submit` (Step 7I RPC-11,
-- 20260805090500_step_7i_report_lifecycle.sql) is a single VOLATILE
-- plpgsql function with NO exception block and NO savepoint. Inside ONE
-- transaction it performs `UPDATE public.reports SET status = 'approved'`,
-- emits the first ordered `report.state_changed` event
-- (trainer_approved -> approved), then performs the second UPDATE to
-- `submitted` and emits the second event (approved -> submitted). No
-- COMMIT sits between them and no code path returns while the row still
-- reads `approved`, so no reader outside that transaction can ever observe
-- it. The migration's own comment states the same conclusion: "NO
-- OPERATION EVER COMMITS WITH status = 'approved'".
--
-- THEREFORE "Approved", as the Management Reports filter names it, has
-- exactly one governed referent: `submitted`. A filter over the literal
-- `approved` label would return the empty set on every database, forever,
-- and would look like "nothing has been published" rather than like a
-- defect -- which is precisely the failure mode this migration exists to
-- avoid. Assertion S6 below pins that reasoning to the catalogue: it fails
-- if any committed report ever holds `approved`.
--
-- ---------------------------------------------------------------------
-- THE PREAPPROVAL BOUNDARY IS ENFORCED IN SQL, NOT BY NOT-RENDERING.
-- ---------------------------------------------------------------------
-- A-038 permits Management to read exactly two things: the final-review
-- candidate while the report is `trainer_approved`, and the canonical
-- submitted version. This function is the ENUMERATION half of the second,
-- and it is bounded twice over:
--
--   1. BY THE WHERE CLAUSE. `r.status = 'submitted'` AND
--      `r.latest_submitted_version_id IS NOT NULL`. A report at
--      incomplete, observation_saved, drafting, draft_ready, needs_edit or
--      trainer_approved is not a row of this result at all -- it is not
--      filtered out of a rendered list, it never exists as a row.
--   2. BY THE SIGNATURE. The RETURNS TABLE carries NO column for any of
--      the four parent-facing panels, a rating, an observation, an
--      attendance value, an evidence object, a trainer note, a checklist
--      field, an approval field, a report version id, a content hash, a
--      wording hash, a revision number, an AI prompt or response, or an
--      audit row. None of those can leak because no column exists to carry
--      them -- they are UNREPRESENTABLE, not filtered. Assertions S5 and
--      S7 state that from the catalogue and from the applied body.
--
-- `submitted_at` IS PUBLICATION METADATA, NOT CONTENT. It is read from the
-- version `latest_submitted_version_id` names -- the canonical published
-- version, the same one the parent reads -- and it is `submitted_at`, the
-- write-once publication timestamp, and nothing else from that row.
--
-- NO CONTENT HASH IS RETURNED, TO ANYONE. A-038: the content hash covers
-- the four panels plus the nine ratings, so a reader holding the panels and
-- the hash recovers the rating grid in 4^9 trials. This function returns
-- neither hash and neither panel.
--
-- ---------------------------------------------------------------------
-- WHY RLS DOES NO WORK INSIDE THIS FUNCTION -- the accurate mechanism, as
-- stated in Step 7I and repeated in the assessment and correction-tracking
-- migrations. It is NOT that SECURITY DEFINER bypasses RLS; it does not.
-- This function executes as `postgres`, which OWNS every table it reads,
-- and no table carries FORCE ROW LEVEL SECURITY. A table owner bypasses
-- RLS unless RLS is forced. Because RLS is inert here, EVERY authorization
-- fact below is explicit, live and fail-closed.
--
-- ---------------------------------------------------------------------
-- NO AUTHORED ERROR CODES, AND THAT IS DELIBERATE. This is a LIST read.
-- Every denial -- unauthenticated, unlinked, deactivated, ambiguous
-- identity, trainer, parent, or management of a different centre -- is the
-- SAME ZERO-ROW outcome, byte-indistinguishable from "this centre has
-- published nothing yet". That is the identical non-disclosing posture
-- RPC-13/14/15 and report_list_management_corrections already use, and it
-- is why the function is independently safe when called directly by any
-- authenticated session of any role. It raises nothing, so no message can
-- interpolate row content, a name, a credential or an environment value.
-- =====================================================================

-- ---------------------------------------------------------------------
-- P-1 execution-role guard (fail closed, before any change)
-- ---------------------------------------------------------------------
DO $guard$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION
      'Management submitted-list migration aborted before any change: this migration must run as postgres, not "%". '
      'Objects created by supabase_admin in schema public would inherit its default ACL '
      '(ALL to anon/authenticated/service_role) -- the exact hazard P-1 exists to prevent.',
      current_user;
  END IF;
END;
$guard$;

-- ---------------------------------------------------------------------
-- Preconditions: the posture this migration was written against must still
-- hold. Abort before any change rather than create a function over a
-- schema that has drifted.
-- ---------------------------------------------------------------------
DO $precondition$
DECLARE
  v_n      bigint;
  v_labels text[];
BEGIN
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public';
  IF v_n <> 33 THEN
    RAISE EXCEPTION
      'Management submitted-list migration aborted before any change: public holds % function(s); expected the accepted post-C2-A census of 33.', v_n;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 24 THEN
    RAISE EXCEPTION
      'Management submitted-list migration aborted before any change: % function(s) hold authenticated EXECUTE; expected the accepted post-C2-A census of 24.', v_n;
  END IF;

  -- The eight-label lifecycle this function reasons about must be the one
  -- on this database. If a ninth label had appeared, "Approved means
  -- submitted" would no longer be a complete reading of the enum.
  SELECT pg_catalog.array_agg(e.enumlabel::text ORDER BY e.enumsortorder) INTO v_labels
    FROM pg_catalog.pg_enum e
    JOIN pg_catalog.pg_type t  ON t.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace ns ON ns.oid = t.typnamespace
   WHERE ns.nspname = 'public' AND t.typname = 'report_status';
  IF v_labels IS DISTINCT FROM ARRAY[
       'incomplete', 'observation_saved', 'drafting', 'draft_ready',
       'needs_edit', 'trainer_approved', 'approved', 'submitted'] THEN
    RAISE EXCEPTION
      'Management submitted-list migration aborted before any change: report_status is % ; expected the eight ratified labels in A-036 order.', v_labels;
  END IF;

  -- RPC-11's two-transition-in-one-transaction shape is the evidence that
  -- `approved` never commits, which is the whole basis for reading
  -- "Approved" as `submitted`. Prove it is still there rather than cite it.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND p.proname = 'report_management_approve_and_submit'
     AND p.prosrc LIKE '%SET status = ''approved''%'
     AND p.prosrc LIKE '%SET status = ''submitted''%'
     -- No EXCEPTION HANDLER. `RAISE EXCEPTION` appears throughout the body
     -- and is a gate, not a handler; what would break the argument is a
     -- `BEGIN ... EXCEPTION WHEN ...` block, because that establishes an
     -- implicit savepoint and could let the first transition survive while
     -- the second was rolled back -- committing `approved` after all.
     AND p.prosrc NOT LIKE '%EXCEPTION WHEN%';
  IF v_n <> 1 THEN
    RAISE EXCEPTION
      'Management submitted-list migration aborted before any change: report_management_approve_and_submit is missing, or no longer performs both transitions in one exception-free transaction. "Approved means submitted" would then be unproven.';
  END IF;

  -- RPC-15's status gate must still be the one that governs the DETAIL
  -- read this list's rows lead to. This migration widens nothing there.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND p.proname = 'report_get_management_review'
     AND p.prosrc LIKE '%v_r.status = ''trainer_approved''%'
     AND p.prosrc LIKE '%v_r.status = ''submitted''%';
  IF v_n <> 1 THEN
    RAISE EXCEPTION
      'Management submitted-list migration aborted before any change: report_get_management_review is missing or its status gate has changed.';
  END IF;
END;
$precondition$;

-- =====================================================================
-- public.report_list_management_submitted
-- =====================================================================
-- The Management "Approved" queue: every report in the CALLER'S OWN CENTRE
-- that has been PUBLISHED -- that is, has committed at `submitted` with a
-- canonical version pointer.
--
-- NAMING follows the committed convention exactly --
-- `<owning aggregate>_<verb>_<qualified object>` -- and mirrors its
-- sibling `report_list_management_corrections`.
--
-- NO PARAMETERS, AND THAT IS THE POINT. There is no centre parameter, no
-- report parameter, no membership parameter, no status parameter and no
-- date window. The centre is DERIVED from the caller's live membership and
-- can never be supplied, so a cross-centre read is not rejected at runtime
-- -- it is UNREPRESENTABLE. The scope of the answer is a property of who
-- is asking. The status is likewise fixed in the body, so no caller can
-- ask this function for a preapproval row.
--
-- STABLE, not VOLATILE: it reads only, and PostgreSQL itself rejects any
-- mutation attempt in a non-volatile function -- so "this read cannot
-- write, and cannot append to the audit chain" is an ENGINE guarantee
-- rather than a review finding. It emits no audit event and, being STABLE,
-- structurally cannot: `audit_append_event` is VOLATILE. This read is
-- deliberately NON-AUDITING -- Step 7H's registry is a closed 16-action
-- constant and none of its actions denotes a read; extending it is a
-- CLAUDE.md section 12 stop-and-ask.
--
-- ORDERING is newest publication first, then report id, so the queue is
-- deterministic and the server never re-sorts and disagrees with the
-- boundary about what "latest" means.
CREATE FUNCTION public.report_list_management_submitted()
RETURNS TABLE (
  report_id            uuid,
  student_id           uuid,
  student_display_name text,
  class_session_id     uuid,
  session_date         date,
  report_status        public.report_status,
  submitted_at         timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_account_id uuid;
  v_centre_id  uuid;
BEGIN
  -- 1. Identity. NULL for unauthenticated, unlinked, deactivated, or an
  --    ambiguous multi-account match -- the helper treats ambiguity as no
  --    identity, and so does this function.
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN
    RETURN;
  END IF;

  -- 2. Live authority AND centre scope, resolved together from the same
  --    row. The caller must hold EXACTLY ONE active management membership;
  --    zero (a trainer, a parent, a pending or deactivated management
  --    member) and two-or-more (an ambiguity A-015's partial unique index
  --    should make impossible) both resolve to NULL and deny. Because the
  --    centre COMES FROM this row, there is no code path that reads a
  --    centre the caller does not currently manage.
  SELECT (pg_catalog.array_agg(m.centre_id))[1]
    INTO v_centre_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id
     AND m.role       = 'management'
     AND m.status     = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_centre_id IS NULL THEN
    RETURN;
  END IF;

  -- 3. The bounded projection.
  --
  --    `r.status = 'submitted'` is the governance boundary, stated in SQL.
  --    A preapproval report is not a row here at any time, for any caller,
  --    under any parameter -- there is no parameter.
  --
  --    The join to `report_versions` is CONSTRAINED to the version the
  --    aggregate's own `latest_submitted_version_id` names: the canonical
  --    published version, the same one the parent reads. It is an INNER
  --    join, so a report claiming `submitted` with no canonical pointer --
  --    a state the lifecycle does not produce -- is omitted rather than
  --    reported with a NULL publication time. ONE COLUMN of that row is
  --    read, `submitted_at`, which is write-once publication metadata; no
  --    panel, no hash and no revision number is touched.
  RETURN QUERY
  SELECT
    r.id,
    r.student_id,
    st.full_name,
    r.class_session_id,
    cs.session_date,
    r.status,
    rv.submitted_at
  FROM public.reports r
  JOIN public.report_versions rv ON rv.id = r.latest_submitted_version_id
  JOIN public.class_sessions  cs ON cs.id = r.class_session_id
  JOIN public.students        st ON st.id = r.student_id
 WHERE r.centre_id = v_centre_id
   AND r.status    = 'submitted'
 ORDER BY rv.submitted_at DESC NULLS LAST, r.id;
END;
$fn$;

COMMENT ON FUNCTION public.report_list_management_submitted() IS
  'C2C-004: the Management "Approved" queue. Returns every PUBLISHED report in the CALLER''S OWN CENTRE -- status `submitted` with a canonical latest_submitted_version_id -- as bounded metadata only: report id, student id and display name, class session id and date, the report status, and the write-once publication timestamp of the canonical submitted version. "Approved" resolves to `submitted` because under A-036 `approved` is transient-in-transaction: report_management_approve_and_submit performs trainer_approved -> approved -> submitted inside one exception-free transaction, so no reader outside it can ever observe `approved`. It returns NO version content: no parent-facing panel, no rating, no observation, no attendance, no evidence, no trainer note, no checklist or approval field, no version id, no content or wording hash, no revision number, no AI history and no audit row. A preapproval report is not a row of this result at all -- the status boundary is in the WHERE clause, not in a renderer. Centre scope is DERIVED from the caller''s single live active management membership and cannot be supplied, so cross-centre access is unrepresentable rather than rejected. Every denial is the same zero-row outcome. STABLE, so the engine itself forbids it writing or auditing. It widens report_get_management_review in no respect and adds no policy and no table privilege.';

-- ---------------------------------------------------------------------
-- EXECUTE posture -- the committed Step 7G block form, signature-qualified.
-- ---------------------------------------------------------------------
-- NOTHING IS GRANTED TO service_role, EVER. It carries BYPASSRLS, so the
-- ONLY control that constrains it is the ABSENCE of a privilege.
--
-- `authenticated` EXECUTE is REQUIRED, not a convenience: the request-scoped
-- client carries the caller's own session and therefore the `authenticated`
-- database role, which is what makes auth.uid() resolve inside the
-- function. The database role follows the CREDENTIAL, not the code location
-- (A-030). It is SAFE because the function is written to be invoked
-- directly by any authenticated caller of any role, with no reliance on the
-- UI, the route, a query parameter, a role tab or a token claim: role and
-- centre are re-derived live from auth.uid() on every call. ROLE IS A
-- PREDICATE INSIDE THE FUNCTION, NEVER A PROPERTY OF THE GRANT.
REVOKE ALL ON FUNCTION public.report_list_management_submitted() FROM PUBLIC, anon, service_role, authenticator;

GRANT EXECUTE ON FUNCTION public.report_list_management_submitted() TO authenticated;

-- ---------------------------------------------------------------------
-- End-of-migration posture assertions (7E/7G/7H/7I/assessment style)
-- ---------------------------------------------------------------------
DO $assert$
DECLARE
  v_new CONSTANT text := 'report_list_management_submitted';
  v_7i_zero_exec CONSTANT text[] := ARRAY[
    'report_store_draft', 'report_content_hash_v1', 'report_wording_hash_v1',
    'app_parent_reaches_student'
  ];
  v_7h_zero_exec CONSTANT text[] := ARRAY[
    'audit_append_event', 'audit_verify_chain', 'audit_canonical_json',
    'audit_block_mutation'
  ];
  v_forbidden CONSTANT text[] := ARRAY[
    'todays_strength', 'next_focus', 'practice_suggestion', 'session_takeaway',
    'content_hash', 'wording_hash', 'revision_number', 'rating',
    'checklist', 'approval', 'attendance', 'evidence', 'notes', 'version_id'
  ];
  v_cols text[];
  v_n    bigint;
  v_m    bigint;
  v_name text;
BEGIN
  -- S1: exactly 34 functions in public (33 + 1). No other function was
  --     created, and none was dropped or replaced.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public';
  IF v_n <> 34 THEN
    RAISE EXCEPTION 'Management submitted-list assertion S1 failed: % function(s) in public; expected 34 (33 + 1)', v_n;
  END IF;

  -- S2: the object inventory is UNCHANGED beyond the one function.
  --     NO NEW TABLE, NO NEW ENUM, NO NEW POLICY.
  SELECT pg_catalog.count(*) FILTER (WHERE NOT c.relrowsecurity),
         pg_catalog.count(*) FILTER (WHERE c.relforcerowsecurity)
    INTO v_m, v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace ns ON ns.oid = c.relnamespace
   WHERE ns.nspname = 'public' AND c.relkind = 'r';
  IF v_m <> 0 OR v_n <> 0 THEN
    RAISE EXCEPTION 'Management submitted-list assertion S2 failed: % table(s) without RLS, % table(s) with FORCE RLS; expected 0 and 0', v_m, v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace ns ON ns.oid = c.relnamespace
   WHERE ns.nspname = 'public' AND c.relkind = 'r';
  IF v_n <> 26 THEN
    RAISE EXCEPTION 'Management submitted-list assertion S2 failed: % table(s) in public; expected 26 (unchanged)', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_type t
    JOIN pg_catalog.pg_namespace ns ON ns.oid = t.typnamespace
   WHERE ns.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN
    RAISE EXCEPTION 'Management submitted-list assertion S2 failed: % enum type(s) in public; expected 12 (unchanged)', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_policies WHERE schemaname = 'public';
  IF v_n <> 29 THEN
    RAISE EXCEPTION 'Management submitted-list assertion S2 failed: % policy/policies in public; expected 29 (unchanged)', v_n;
  END IF;

  -- S3: the new function is postgres-owned plpgsql, SECURITY DEFINER, with
  --     a pinned empty search_path, non-STRICT and taking ZERO arguments --
  --     the last of which is what makes cross-centre access and a
  --     caller-chosen status unrepresentable.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
    JOIN pg_catalog.pg_language l   ON l.oid = p.prolang
   WHERE ns.nspname = 'public'
     AND p.proname = v_new
     AND pg_catalog.pg_get_userbyid(p.proowner) = 'postgres'
     AND l.lanname = 'plpgsql'
     AND p.prosecdef
     AND NOT p.proisstrict
     AND p.pronargs = 0
     AND p.proconfig IS NOT NULL
     AND p.proconfig::text LIKE '%search_path=%';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Management submitted-list assertion S3 failed: public.% is not exactly one postgres-owned, SECURITY DEFINER, non-STRICT, zero-argument plpgsql function with a pinned search_path (found %)', v_new, v_n;
  END IF;

  -- S4: STABLE. This is what makes "this read cannot write and cannot
  --     append to the audit chain" an ENGINE guarantee.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_new AND p.provolatile = 's';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Management submitted-list assertion S4 failed: % is not STABLE', v_new;
  END IF;

  -- S5: the EXACT output column list, asserted from the APPLIED signature
  --     rather than from the file, so any future widening of the shape
  --     fails this migration's own assertion first.
  SELECT pg_catalog.array_agg(a.name ORDER BY a.ord) INTO v_cols
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
    CROSS JOIN LATERAL pg_catalog.unnest(p.proargnames)
      WITH ORDINALITY AS a(name, ord)
   WHERE ns.nspname = 'public' AND p.proname = v_new;
  IF v_cols IS DISTINCT FROM ARRAY[
       'report_id', 'student_id', 'student_display_name', 'class_session_id',
       'session_date', 'report_status', 'submitted_at'] THEN
    RAISE EXCEPTION 'Management submitted-list assertion S5 failed: the projection is % ; expected exactly the seven bounded publication columns', v_cols;
  END IF;

  -- S6: no forbidden field name appears anywhere in the output column list.
  --     S5 already pins the list exactly; this states the PROHIBITION in
  --     its own terms so the reason a column is absent survives a future
  --     edit of S5's literal.
  FOREACH v_name IN ARRAY v_forbidden LOOP
    IF EXISTS (SELECT 1 FROM pg_catalog.unnest(v_cols) c(n) WHERE c.n LIKE '%' || v_name || '%') THEN
      RAISE EXCEPTION 'Management submitted-list assertion S6 failed: the projection exposes a forbidden field matching "%"', v_name;
    END IF;
  END LOOP;

  -- S7: the STATUS BOUNDARY is in the applied body, and it is the ONLY
  --     status the body names. `--` comments are stripped FIRST: the body
  --     discusses these rules in prose, and a prose mention is not a
  --     statement. This is the same comment-stripping discipline the Step
  --     7I purity scan and correction-tracking assertion M12 use.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_new
     AND pg_catalog.regexp_replace(p.prosrc, '--[^\n]*', '', 'g') LIKE '%r.status    = ''submitted''%';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Management submitted-list assertion S7 failed: the applied body does not restrict rows to status = submitted';
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_new
     AND pg_catalog.regexp_replace(p.prosrc, '--[^\n]*', '', 'g') ~
         '''(incomplete|observation_saved|drafting|draft_ready|needs_edit|trainer_approved|approved)''';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Management submitted-list assertion S7 failed: the applied body names a report status other than submitted';
  END IF;

  -- S8: the body reads NO version-content column, NO assessment or
  --     attendance table and NO audit object. `report_versions` IS joined
  --     -- to the canonical pointer, for `submitted_at` alone -- so the
  --     scan is of the CONTENT COLUMN NAMES rather than the table name.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_new
     AND pg_catalog.regexp_replace(p.prosrc, '--[^\n]*', '', 'g') ~
         '(todays_strength|next_focus|practice_suggestion|session_takeaway|content_hash|wording_hash|revision_number|public\.report_version_ratings|public\.report_version_checklist_progress|public\.report_version_approvals|public\.observations|public\.observation_ratings|public\.attendance|audit_append_event|public\.audit_)';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Management submitted-list assertion S8 failed: the new function reads a version-content, assessment, attendance or audit object';
  END IF;

  -- S9: the join to report_versions is CONSTRAINED to the aggregate's own
  --     canonical pointer. An unconstrained join would make every version
  --     of the report reachable, which is the leak the pointer exists to
  --     prevent.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_new
     AND pg_catalog.regexp_replace(p.prosrc, '--[^\n]*', '', 'g') LIKE '%rv.id = r.latest_submitted_version_id%';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Management submitted-list assertion S9 failed: the version join is not pinned to latest_submitted_version_id';
  END IF;

  -- S10: no dynamic SQL, and no mutating statement in the body. STABLE
  --      already makes a write impossible at run time; this makes the
  --      absence visible to a static reviewer too.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_new
     AND pg_catalog.regexp_replace(p.prosrc, '--[^\n]*', '', 'g') ~* '\mEXECUTE\s+(format|''|"|\$|v_|p_)';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Management submitted-list assertion S10 failed: the new function contains dynamic SQL';
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_new
     AND pg_catalog.regexp_replace(p.prosrc, '--[^\n]*', '', 'g') ~* '\m(INSERT\s+INTO|UPDATE\s+public\.|DELETE\s+FROM|TRUNCATE|CREATE\s|ALTER\s|DROP\s)';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Management submitted-list assertion S10 failed: the new function contains a mutating statement';
  END IF;

  -- S11: EXECUTE census rises by exactly one, to 25, and the new function
  --      is unreachable by anon, service_role, authenticator and PUBLIC.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 25 THEN
    RAISE EXCEPTION 'Management submitted-list assertion S11 failed: % function(s) hold authenticated EXECUTE; expected 25 (24 + 1)', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_new
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE')
     AND NOT pg_catalog.has_function_privilege('anon',          p.oid, 'EXECUTE')
     AND NOT pg_catalog.has_function_privilege('service_role',  p.oid, 'EXECUTE')
     AND NOT pg_catalog.has_function_privilege('authenticator', p.oid, 'EXECUTE')
     AND p.proacl IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_catalog.aclexplode(p.proacl) ae WHERE ae.grantee = 0);
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Management submitted-list assertion S11 failed: % does not hold authenticated EXECUTE exclusively', v_new;
  END IF;

  -- S12: the Step 7I zero-EXECUTE four and the Step 7H four are UNCHANGED.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND p.proname = ANY (v_7i_zero_exec || v_7h_zero_exec)
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Management submitted-list assertion S12 failed: % owner-only function(s) acquired authenticated EXECUTE', v_n;
  END IF;

  -- S13: RPC-15's status gate is byte-unchanged, and the Step 7H 16-action
  --      registry is byte-identical in BOTH applied audit functions. This
  --      migration widens no ratified read and extends no audit action.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND p.proname = 'report_get_management_review'
     AND p.prosrc LIKE '%v_r.status = ''trainer_approved''%'
     AND p.prosrc LIKE '%v_r.status = ''submitted''%';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Management submitted-list assertion S13 failed: report_get_management_review''s status gate changed';
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc a
    JOIN pg_catalog.pg_namespace ns ON ns.oid = a.pronamespace
   WHERE ns.nspname = 'public' AND a.proname = 'audit_append_event'
     AND pg_catalog.substring(a.prosrc, 'v_registry CONSTANT text\[\] :=[^;]+;') =
         (SELECT pg_catalog.substring(b.prosrc, 'v_registry CONSTANT text\[\] :=[^;]+;')
            FROM pg_catalog.pg_proc b
            JOIN pg_catalog.pg_namespace ns2 ON ns2.oid = b.pronamespace
           WHERE ns2.nspname = 'public' AND b.proname = 'audit_verify_chain')
     AND pg_catalog.substring(a.prosrc, 'v_registry CONSTANT text\[\] :=[^;]+;') IS NOT NULL;
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Management submitted-list assertion S13 failed: the Step 7H action registry is not byte-identical in audit_append_event and audit_verify_chain';
  END IF;

  -- S14: THE LIFECYCLE PREMISE, asserted against the DATA. `approved` is
  --      transient-in-transaction, so no committed report may hold it. If
  --      one ever did, "Approved means submitted" would be an incomplete
  --      reading and this list would silently omit a real published state.
  SELECT pg_catalog.count(*) INTO v_n FROM public.reports WHERE status = 'approved';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Management submitted-list assertion S14 failed: % report(s) are committed at status approved, which A-036 says can never happen', v_n;
  END IF;

  -- S15: applying this migration wrote no data of any kind.
  SELECT pg_catalog.count(*) INTO v_n FROM public.reports;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Management submitted-list assertion S15 failed: reports holds % row(s) after applying this migration', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.audit_events;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Management submitted-list assertion S15 failed: audit_events holds % row(s) after applying this migration', v_n;
  END IF;

  RAISE NOTICE 'Management submitted-list migration: all posture assertions passed (34 functions, 26 tables, 12 enums, 29 policies, 25 authenticated EXECUTE; no new table, enum, label, policy or table privilege, and no data written).';
END;
$assert$;
