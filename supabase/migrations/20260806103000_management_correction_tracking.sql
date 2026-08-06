-- =====================================================================
-- B.E.S.T Coach -- Management correction tracking (U-B2-1)
-- =====================================================================
-- Governing authority (highest first):
--   Specification v3 -> Amendment 001 -> Amendment 002 -> Amendment 003
--   -> Amendment 004 (A-033 ... A-040) -> CLAUDE.md -> Implementation Plan
--   -> docs/plan/STEP_7H_AUDIT_CHAIN_BASELINE.md
--   -> docs/plan/STEP_7I_REPORT_LIFECYCLE_BASELINE.md
--   -> docs/plan/PHYSICAL_TEST_SLICE_48H.md (R-7, section 5.3, section 5.5)
--
-- WHAT THIS MIGRATION CREATES -- exactly one bounded read boundary:
--   * 1 function ..... public.report_list_management_corrections()  (R-7)
--   * 1 COMMENT ON FUNCTION statement
--   * 1 REVOKE line and 1 GRANT line
--   * its authored post-apply assertions
--
-- WHAT IT DELIBERATELY DOES NOT CREATE:
--   no ALTER TYPE, no CREATE TABLE, no CREATE TYPE, no column, no
--   constraint, no index, no CREATE POLICY, no table GRANT, no ALTER
--   DEFAULT PRIVILEGES, no ownership change, no trigger, no view, no
--   extension, no schema, no audit action, and NO `CREATE OR REPLACE` of
--   any existing function. Step 7I's fifteen RPCs, Step 7H's four audit
--   functions and Step 7G's six helpers are byte-untouched, so Step 7H
--   assertion B20, Step 7I test T7I-30 and assessment assertion C9 all
--   continue to hold.
--
-- ---------------------------------------------------------------------
-- WHY THIS FUNCTION EXISTS -- the exact gap it closes (U-B2-1)
-- ---------------------------------------------------------------------
-- The committed 48-hour contract requires R-7, a Management
-- correction-tracking queue: "reports at `needs_edit` with an open
-- correction request -- scope and status; reason only where section 5.5
-- permits". Backend Round B2 could not build it from the ratified Step 7I
-- read inventory, and that was a correct reading of the inventory rather
-- than an implementation shortfall:
--
--   * RPC-15 (`report_get_management_review`) is STATUS-GATED and returns
--     ZERO ROWS at `needs_edit` and at `draft_ready`. That gate is the
--     whole point of A-038 and is pinned by T7I-63 -- widening it would
--     hand management the trainer's live un-approved working version,
--     which is the exact leak the gate was built to close;
--   * `report_correction_requests` carries RLS with zero policies and zero
--     client table privileges, so no client credential can read it;
--   * `report_get_working` (RPC-14) does carry the correction record --
--     including its reason -- but is trainer-only by a fail-closed trainer
--     membership predicate, and management is denied there by design.
--
-- The consequence was that the moment management RETURNED a report, the
-- report left every management-reachable surface entirely: management could
-- not see that its own outstanding correction request existed. Round B2
-- therefore shipped R-7 bounded to what remained lawful (reports whose
-- gated read still returns a row) and recorded the residual honestly as
-- U-B2-1 rather than improvising a widening.
--
-- THIS MIGRATION CLOSES THAT GAP WITHOUT REOPENING EITHER DECISION.
-- RPC-15's zero-row posture is untouched; the correction table gains no
-- policy and no privilege. Instead a SEPARATE, NARROWER read boundary is
-- added that returns tracking METADATA ONLY and NO VERSION CONTENT AT ALL
-- -- not one of the four parent-facing panels, not a rating, not a hash.
-- A-038 forbids exposing REPORT CONTENT to management before trainer
-- approval; it does not require management to be blind to the existence and
-- state of a correction request MANAGEMENT ITSELF RAISED.
--
-- THE REASON TEXT IS RETURNED, AND THAT IS RATIFIED, NOT A WIDENING.
-- Contract section 5.5 carves it out in terms: "The correction-tracking
-- surface (R-7) may display a reason ONLY where the backend projection
-- supplies it for a request that management itself raised in the managed
-- centre. It is never carried on `ManagementReviewDto`, and never on any
-- parent surface." Both conditions are structural here: every row of
-- `report_correction_requests` is management-authored (CHECK-pinned
-- `requester_role = 'management'` plus a composite FK proving the
-- membership genuinely holds that role), and this function is centre-scoped
-- to the caller's own live management membership. Management is being shown
-- prose management wrote. RPC-15 still returns no reason at any status.
--
-- ---------------------------------------------------------------------
-- WHY RLS DOES NO WORK INSIDE THIS FUNCTION -- the accurate mechanism, as
-- stated in Step 7I and repeated in the assessment migration. It is NOT
-- that SECURITY DEFINER bypasses RLS; it does not. This function executes
-- as `postgres`, which OWNS every table it reads, and no table carries
-- FORCE ROW LEVEL SECURITY. A table owner bypasses RLS unless RLS is
-- forced. Because RLS is inert here, EVERY authorization fact below is
-- explicit, live and fail-closed.
--
-- ---------------------------------------------------------------------
-- NO AUTHORED ERROR CODES, AND THAT IS DELIBERATE. This is a LIST read.
-- Every denial -- unauthenticated, unlinked, deactivated, ambiguous
-- identity, trainer, parent, or management of a different centre -- is the
-- SAME ZERO-ROW outcome, byte-indistinguishable from "this centre has no
-- open correction work". That is the identical non-disclosing posture
-- RPC-13/14/15 already use, and it is why the function is independently
-- safe when called directly by any authenticated session of any role. It
-- raises nothing, so no message can interpolate row content, a name, a
-- correction reason, a credential or an environment value.
-- =====================================================================

-- ---------------------------------------------------------------------
-- P-1 execution-role guard (fail closed, before any change)
-- ---------------------------------------------------------------------
DO $guard$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION
      'Correction-tracking migration aborted before any change: this migration must run as postgres, not "%". '
      'Objects created by supabase_admin in schema public would inherit its default ACL '
      '(ALL to anon/authenticated/service_role) -- the exact hazard P-1 exists to prevent.',
      current_user;
  END IF;
END;
$guard$;

-- ---------------------------------------------------------------------
-- Precondition: the objects this migration binds to must already exist and
-- must still hold the posture it was written against. Abort before any
-- change rather than create a function over a schema that has drifted.
-- ---------------------------------------------------------------------
DO $precondition$
DECLARE
  v_n bigint;
BEGIN
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public';
  IF v_n <> 30 THEN
    RAISE EXCEPTION
      'Correction-tracking migration aborted before any change: public holds % function(s); expected the accepted post-assessment census of 30.', v_n;
  END IF;

  -- The correction table must still be at ZERO client reach. If a policy or
  -- a table grant had appeared, this function would no longer be the ONLY
  -- management path to a correction row, and its bounded projection would
  -- be a false guarantee.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_policies pol
   WHERE pol.schemaname = 'public' AND pol.tablename = 'report_correction_requests';
  IF v_n <> 0 THEN
    RAISE EXCEPTION
      'Correction-tracking migration aborted before any change: report_correction_requests carries % policy(ies); expected 0.', v_n;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.role_table_grants g
   WHERE g.table_schema = 'public'
     AND g.table_name = 'report_correction_requests'
     AND g.grantee IN ('PUBLIC', 'anon', 'authenticated', 'service_role', 'authenticator');
  IF v_n <> 0 THEN
    RAISE EXCEPTION
      'Correction-tracking migration aborted before any change: % client privilege(s) exist on report_correction_requests; expected 0.', v_n;
  END IF;

  -- RPC-15's zero-row posture at needs_edit is the decision this migration
  -- must not reopen. Prove the function is still present and unchanged in
  -- the one respect that matters: it still has no branch returning content
  -- for a status outside trainer_approved / submitted.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND p.proname = 'report_get_management_review'
     AND p.prosrc LIKE '%v_r.status = ''trainer_approved''%'
     AND p.prosrc LIKE '%v_r.status = ''submitted''%';
  IF v_n <> 1 THEN
    RAISE EXCEPTION
      'Correction-tracking migration aborted before any change: report_get_management_review is missing or its status gate has changed.';
  END IF;
END;
$precondition$;

-- =====================================================================
-- R-7 -- public.report_list_management_corrections
-- =====================================================================
-- The Management correction-tracking queue: every report in the CALLER'S
-- OWN CENTRE that currently carries an OPEN correction request.
--
-- NAMING. `report_list_management_corrections` follows the committed
-- convention exactly: `<owning aggregate>_<verb>_<qualified object>`, as in
-- `report_get_management_review`, `report_get_working`,
-- `report_management_return_to_trainer` and
-- `assessment_get_trainer_observation`. `report_` names the aggregate whose
-- tables it reads, `list` is the verb, and `management_corrections` is the
-- qualified object. No more precise existing convention applies.
--
-- NO PARAMETERS, AND THAT IS THE POINT. There is no centre parameter, no
-- report parameter, no membership parameter, no status parameter and no
-- "include resolved" flag. The centre is DERIVED from the caller's live
-- membership and can never be supplied, so a cross-centre read is not
-- rejected at runtime -- it is UNREPRESENTABLE. The scope of the answer is
-- a property of who is asking.
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
-- ---------------------------------------------------------------------
-- THE PROJECTION IS THE SIGNATURE, NOT A RUNTIME FILTER (the Step 7I
-- section 6.2 discipline). This function's RETURNS TABLE carries no column
-- for a rating, an observation, an attendance value, an evidence object, a
-- trainer note, an assessment payload, a checklist field, an approval
-- field, a report VERSION ID, any of the four parent-facing panels, a
-- content hash, a wording hash, a revision number, an AI prompt or
-- response, or an audit row. None of those can leak because no column
-- exists to carry them -- they are UNREPRESENTABLE, not filtered.
--
-- `dimension_code` is likewise ABSENT. It is permitted metadata and it is
-- management-authored, but no field of the committed `ManagementQueueRowDto`
-- consumes it, and the minimum boundary is the correct one. It reaches the
-- TRAINER through RPC-14, which already owns it.
--
-- ---------------------------------------------------------------------
-- EXACT BEHAVIOUR ACROSS THE CORRECTION CYCLE. The filter is `status =
-- 'open'` and nothing else, because under Step 7I an open request is
-- EXACTLY unresolved correction work: resolution is a side effect of the
-- trainer approval that does the corrective work (RPC-8 step 10), never a
-- standalone operation, and `correction_request_status` has exactly two
-- values by ratified design.
--
--   1. Open return, trainer has not yet corrected
--        reports.status = 'needs_edit', request `open`, and
--        current_cycle_version_id STILL EQUALS the returned version --
--        RPC-10 creates no version and moves no pointer.
--        -> LISTED, trainer_correction_submitted = false
--
--   2. Trainer correction saved, not yet reapproved
--        the governed trainer save (T6) creates a NEW immutable version and
--        advances needs_edit -> draft_ready, so the pointer now differs
--        from the returned version while the request is still `open`.
--        -> LISTED, trainer_correction_submitted = true
--        This row is the one the old projection lost entirely, and losing
--        it is precisely what made the queue unusable for tracking.
--
--   3. Trainer reapproval completed (T8)
--        RPC-8 resolves the open request and moves the report to
--        trainer_approved in the same transaction.
--        -> NOT LISTED. The item is no longer correction work; it is now
--           R-6 pending-review work, and listing it in both queues would
--           state one fact two ways.
--
--   4. Correction request resolved
--        Same row, stated from the request's side. A resolved request is
--        immutable and is never re-resolved or re-pointed by a later cycle.
--        -> NOT LISTED.
--
--   5. Report submitted / no longer requiring correction tracking
--        Submission (T11) can only run from trainer_approved, which case 3
--        already emptied.
--        -> NOT LISTED.
--
-- A LATER cycle -- a second return (T10) or a reopen (T12) followed by a
-- return -- inserts a NEW request and the report reappears. The partial
-- unique index guarantees at most one open request per report, so a report
-- can never appear twice, and no duplicate or stale lifecycle operation is
-- introduced by this read.
--
-- ---------------------------------------------------------------------
-- "ACTIVE MANAGEMENT" IS APPLIED TO THE CALLER, AND THIS IS A DELIBERATE
-- READING, RECORDED RATHER THAN GLOSSED. The security boundary is the
-- caller's LIVE authority, re-derived on every call. The REQUESTER is
-- pinned to management structurally -- `report_correction_requests` CHECKs
-- `requester_role = 'management'` and proves it by composite FK against a
-- membership genuinely holding that role in that centre -- and the WHERE
-- clause states that rule again rather than relying on it silently. What
-- this function does NOT do is require the REQUESTER'S membership to still
-- be active today. Under A-015 a centre has at most one active management
-- membership, and a role change DEACTIVATES the old membership and creates
-- a new one; requiring requester-active would therefore make every
-- outstanding correction vanish from tracking the moment the management
-- account was replaced. That is silent loss of real outstanding work, not
-- a privacy control -- the reader is still a live active management member
-- of the same centre either way.
CREATE FUNCTION public.report_list_management_corrections()
RETURNS TABLE (
  report_id                    uuid,
  student_id                   uuid,
  student_display_name         text,
  class_session_id             uuid,
  session_date                 date,
  report_status                public.report_status,
  correction_request_id        uuid,
  issue_scope                  public.correction_issue_scope,
  correction_reason            text,
  correction_status            public.correction_request_status,
  returned_at                  timestamptz,
  trainer_correction_submitted boolean,
  tracking_updated_at          timestamptz
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

  -- 3. The bounded projection. `cr.centre_id = v_centre_id` is the
  --    cross-centre boundary, and the join to `reports` re-proves centre
  --    agreement against the shipped reports_id_centre_key candidate key,
  --    so a row whose two centre columns disagreed could not be
  --    represented, let alone returned.
  RETURN QUERY
  SELECT
    r.id,
    r.student_id,
    st.full_name,
    r.class_session_id,
    cs.session_date,
    r.status,
    cr.id,
    cr.issue_scope,
    cr.reason,
    cr.status,
    cr.requested_at,
    -- The trainer's corrective work is proven by the POINTER, not by the
    -- aggregate status: RPC-10 leaves current_cycle_version_id on the
    -- returned version, and only the governed trainer save (T6) moves it.
    -- This is therefore true exactly when a new immutable correction
    -- version exists, and it cannot be spoofed by a status alone.
    (r.current_cycle_version_id IS DISTINCT FROM cr.report_version_id),
    -- The latest permitted tracking timestamp. Both inputs are
    -- non-content: the aggregate's own updated_at and the return time.
    -- No version timestamp is read, so this can never date content the
    -- caller may not see.
    -- GREATEST is a SQL syntactic construct, not a pg_catalog function, so
    -- it needs no schema qualification and none is possible.
    GREATEST(r.updated_at, cr.requested_at)
  FROM public.report_correction_requests cr
  JOIN public.reports       r  ON r.id  = cr.report_id AND r.centre_id = cr.centre_id
  JOIN public.class_sessions cs ON cs.id = r.class_session_id
  JOIN public.students      st ON st.id = r.student_id
 WHERE cr.centre_id     = v_centre_id
   AND cr.status        = 'open'
   AND cr.requester_role = 'management'
 ORDER BY cr.requested_at, r.id;
END;
$fn$;

COMMENT ON FUNCTION public.report_list_management_corrections() IS
  'R-7 (U-B2-1): the Management correction-tracking queue. Returns every report in the CALLER''S OWN CENTRE carrying an OPEN correction request, as bounded tracking METADATA ONLY -- report id, student id and display name, class session id and date, current report status, the open request''s id, issue scope, management-authored reason and status, the returned timestamp, whether the trainer has produced a correction version, and the latest tracking timestamp. It returns NO version content: no parent-facing panel, no rating, no observation, no attendance, no evidence, no trainer note, no checklist or approval field, no version id, no content or wording hash, no revision number, no AI history and no audit row. Centre scope is DERIVED from the caller''s single live active management membership and cannot be supplied, so cross-centre access is unrepresentable rather than rejected. Every denial is the same zero-row outcome. STABLE, so the engine itself forbids it writing or auditing. It does NOT widen report_get_management_review, whose zero-row posture at needs_edit (A-038 / T7I-63) is untouched, and adds no policy and no table privilege. The reason is supplied under the 48-hour contract section 5.5 carve-out: every row is management-authored by CHECK and composite FK, and the reader is live active management of that same centre.';

-- ---------------------------------------------------------------------
-- EXECUTE posture -- the committed Step 7G block form, signature-qualified.
-- Never an aggregate or unqualified statement, which would be ambiguous
-- under any future overload.
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
--
-- NO TABLE PRIVILEGE AND NO RLS POLICY IS ADDED ANYWHERE. EXECUTE on this
-- one function is the entire new client-reachable surface.
REVOKE ALL ON FUNCTION public.report_list_management_corrections() FROM PUBLIC, anon, service_role, authenticator;

GRANT EXECUTE ON FUNCTION public.report_list_management_corrections() TO authenticated;

-- ---------------------------------------------------------------------
-- End-of-migration posture assertions (7E/7G/7H/7I/assessment style)
-- ---------------------------------------------------------------------
-- These re-derive the FULL posture from the catalogue rather than trusting
-- that the statements above did what they say.
DO $assert$
DECLARE
  v_new CONSTANT text  := 'report_list_management_corrections';
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
    'checklist', 'approval', 'attendance', 'evidence', 'notes'
  ];
  v_cols text[];
  v_n    bigint;
  v_m    bigint;
  v_name text;
BEGIN
  -- M1: exactly 31 functions in public (30 + 1). No other function was
  --     created, and none was dropped or replaced.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public';
  IF v_n <> 31 THEN
    RAISE EXCEPTION 'Correction-tracking assertion M1 failed: % function(s) in public; expected 31 (6 Step 7G + 4 Step 7H + 18 Step 7I + 2 assessment + 1 correction tracking)', v_n;
  END IF;

  -- M2: the object inventory is UNCHANGED beyond the one function --
  --     26 tables, 12 enums, 29 policies, RLS everywhere, FORCE nowhere.
  --     NO NEW TABLE AND NO NEW ENUM, as the census requires.
  SELECT pg_catalog.count(*) FILTER (WHERE NOT c.relrowsecurity),
         pg_catalog.count(*) FILTER (WHERE c.relforcerowsecurity)
    INTO v_m, v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace ns ON ns.oid = c.relnamespace
   WHERE ns.nspname = 'public' AND c.relkind = 'r';
  IF v_m <> 0 OR v_n <> 0 THEN
    RAISE EXCEPTION 'Correction-tracking assertion M2 failed: % table(s) without RLS, % table(s) with FORCE RLS; expected 0 and 0', v_m, v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace ns ON ns.oid = c.relnamespace
   WHERE ns.nspname = 'public' AND c.relkind = 'r';
  IF v_n <> 26 THEN
    RAISE EXCEPTION 'Correction-tracking assertion M2 failed: % table(s) in public; expected 26 (unchanged -- no new table)', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_type t
    JOIN pg_catalog.pg_namespace ns ON ns.oid = t.typnamespace
   WHERE ns.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN
    RAISE EXCEPTION 'Correction-tracking assertion M2 failed: % enum type(s) in public; expected 12 (unchanged -- no new enum)', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_policies WHERE schemaname = 'public';
  IF v_n <> 29 THEN
    RAISE EXCEPTION 'Correction-tracking assertion M2 failed: % policy/policies in public; expected 29 (unchanged)', v_n;
  END IF;

  -- M3: the new function is postgres-owned plpgsql, SECURITY DEFINER, with
  --     a pinned empty search_path, non-STRICT and taking ZERO arguments --
  --     the last of which is what makes cross-centre access unrepresentable.
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
    RAISE EXCEPTION 'Correction-tracking assertion M3 failed: public.% is not exactly one postgres-owned, SECURITY DEFINER, non-STRICT, zero-argument plpgsql function with a pinned search_path (found %)', v_new, v_n;
  END IF;

  -- M4: STABLE. This is what makes "this read cannot write and cannot
  --     append to the audit chain" an ENGINE guarantee rather than a
  --     review finding -- audit_append_event is VOLATILE and is therefore
  --     not callable from here at all.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_new AND p.provolatile = 's';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Correction-tracking assertion M4 failed: % is not STABLE', v_new;
  END IF;

  -- M5: the EXACT output column list. This is the projection boundary
  --     asserted from the catalogue, so it holds against the APPLIED
  --     signature rather than the file, and any future widening of the
  --     shape fails the migration's own assertion first.
  SELECT pg_catalog.array_agg(a.name ORDER BY a.ord) INTO v_cols
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
    CROSS JOIN LATERAL pg_catalog.unnest(p.proargnames)
      WITH ORDINALITY AS a(name, ord)
   WHERE ns.nspname = 'public' AND p.proname = v_new;
  IF v_cols IS DISTINCT FROM ARRAY[
       'report_id', 'student_id', 'student_display_name', 'class_session_id',
       'session_date', 'report_status', 'correction_request_id', 'issue_scope',
       'correction_reason', 'correction_status', 'returned_at',
       'trainer_correction_submitted', 'tracking_updated_at'] THEN
    RAISE EXCEPTION 'Correction-tracking assertion M5 failed: the projection is % ; expected exactly the thirteen bounded tracking columns', v_cols;
  END IF;

  -- M6: no forbidden field name appears anywhere in the output column list.
  --     M5 already pins the list exactly; this states the PROHIBITION in
  --     its own terms so the reason a column is absent survives a future
  --     edit of M5's literal.
  FOREACH v_name IN ARRAY v_forbidden LOOP
    IF EXISTS (SELECT 1 FROM pg_catalog.unnest(v_cols) c(n) WHERE c.n LIKE '%' || v_name || '%') THEN
      RAISE EXCEPTION 'Correction-tracking assertion M6 failed: the projection exposes a forbidden field matching "%"', v_name;
    END IF;
  END LOOP;

  -- M7: EXECUTE census rises by exactly one, to 23, and the new function is
  --     unreachable by anon, service_role, authenticator and PUBLIC.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 23 THEN
    RAISE EXCEPTION 'Correction-tracking assertion M7 failed: % function(s) hold authenticated EXECUTE; expected 23 (6 Step 7G + 14 Step 7I + 2 assessment + 1 correction tracking)', v_n;
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
    RAISE EXCEPTION 'Correction-tracking assertion M7 failed: % does not hold authenticated EXECUTE exclusively', v_new;
  END IF;

  -- M8: the Step 7I zero-EXECUTE four and the Step 7H four are UNCHANGED --
  --     this migration adds none to either exclusion list and removes none.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND p.proname = ANY (v_7i_zero_exec || v_7h_zero_exec)
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Correction-tracking assertion M8 failed: % owner-only function(s) acquired authenticated EXECUTE', v_n;
  END IF;

  -- M9: ZERO client table privileges and ZERO policies on the correction
  --     table are UNCHANGED. The RPC is the only reach, which is the whole
  --     basis of the bounded projection guarantee.
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.role_table_grants g
   WHERE g.table_schema = 'public'
     AND g.table_name = 'report_correction_requests'
     AND g.grantee IN ('PUBLIC', 'anon', 'authenticated', 'service_role', 'authenticator');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Correction-tracking assertion M9 failed: % client table privilege(s) exist on report_correction_requests; expected 0', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_policies
   WHERE schemaname = 'public' AND tablename = 'report_correction_requests';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Correction-tracking assertion M9 failed: % policy/policies exist on report_correction_requests; expected 0', v_n;
  END IF;

  -- M10: RPC-15's status gate is byte-unchanged. The migration's premise is
  --      that it closes U-B2-1 WITHOUT widening the ratified management
  --      read; assert that rather than assert it in prose only.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND p.proname = 'report_get_management_review'
     AND p.prosrc LIKE '%v_r.status = ''trainer_approved''%'
     AND p.prosrc LIKE '%v_r.status = ''submitted''%';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Correction-tracking assertion M10 failed: report_get_management_review''s status gate changed';
  END IF;

  -- M11: the Step 7H 16-action registry is byte-identical in BOTH applied
  --      functions -- the Step 7H B20 equality this migration must not
  --      break. This read is non-auditing and extends no action.
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
    RAISE EXCEPTION 'Correction-tracking assertion M11 failed: the Step 7H action registry is not byte-identical in audit_append_event and audit_verify_chain';
  END IF;

  -- M12: the new body references NO version-content table and NO audit
  --      object. `--` comments are stripped FIRST: the body discusses these
  --      rules in prose, and a prose mention is not a statement. This is
  --      the same comment-stripping discipline the Step 7I purity scan and
  --      assessment assertion C10 use.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_new
     AND pg_catalog.regexp_replace(p.prosrc, '--[^\n]*', '', 'g') ~
         '(public\.report_versions|public\.report_version_ratings|public\.report_version_checklist_progress|public\.report_version_approvals|public\.observations|public\.observation_ratings|public\.attendance|audit_append_event|public\.audit_)';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Correction-tracking assertion M12 failed: the new function reads a version-content, assessment, attendance or audit object';
  END IF;

  -- M13: no dynamic SQL, and no mutating statement in the body. STABLE
  --      already makes a write impossible at run time; this makes the
  --      absence visible to a static reviewer too.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_new
     AND pg_catalog.regexp_replace(p.prosrc, '--[^\n]*', '', 'g') ~* '\mEXECUTE\s+(format|''|"|\$|v_|p_)';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Correction-tracking assertion M13 failed: the new function contains dynamic SQL';
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_new
     AND pg_catalog.regexp_replace(p.prosrc, '--[^\n]*', '', 'g') ~* '\m(INSERT\s+INTO|UPDATE\s+public\.|DELETE\s+FROM|TRUNCATE|CREATE\s|ALTER\s|DROP\s)';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Correction-tracking assertion M13 failed: the new function contains a mutating statement';
  END IF;

  -- M14: applying this migration created no report, no correction request
  --      and no audit event.
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_correction_requests;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Correction-tracking assertion M14 failed: report_correction_requests holds % row(s) after applying this migration', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.audit_events;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Correction-tracking assertion M14 failed: audit_events holds % row(s) after applying this migration', v_n;
  END IF;

  RAISE NOTICE 'Correction-tracking migration: all posture assertions passed (31 functions, 26 tables, 12 enums, 29 policies, 23 authenticated EXECUTE; no new table, enum, policy or table privilege).';
END;
$assert$;
