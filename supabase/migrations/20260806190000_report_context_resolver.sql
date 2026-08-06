-- =====================================================================
-- B.E.S.T Coach -- Governed report-context resolver (R-22)
-- =====================================================================
-- Governing authority (highest first):
--   Specification v3 -> Amendment 001 -> Amendment 002 -> Amendment 003
--   -> Amendment 004 -> Amendment 006 -> CLAUDE.md -> Implementation Plan
--   -> docs/plan/STEP_7I_REPORT_LIFECYCLE_BASELINE.md
--   -> docs/plan/PHYSICAL_TEST_SLICE_48H.md
--
-- WHAT THIS MIGRATION CREATES -- exactly one bounded read boundary:
--   * 1 function ..... public.report_resolve_context(uuid)
--   * 1 COMMENT ON FUNCTION statement
--   * 1 REVOKE line and 1 GRANT line
--   * its authored post-apply assertions
--
-- WHAT IT DELIBERATELY DOES NOT CREATE:
--   no CREATE TABLE, no CREATE TYPE, no ALTER TYPE, no column, no
--   constraint, no index, no CREATE POLICY, no trigger, no view, no
--   extension, no schema, no table GRANT, no ALTER DEFAULT PRIVILEGES, no
--   ownership change, no audit action, no fixture row, and NO
--   `CREATE OR REPLACE` of any existing function. Every ratified report
--   lifecycle transition, status, policy, table, enum and column is
--   byte-untouched.
--
-- ---------------------------------------------------------------------
-- WHY THIS FUNCTION EXISTS -- the exact gap it closes (Run B R-22)
-- ---------------------------------------------------------------------
-- The frontend port declares three report-shaped reads keyed by a REPORT
-- IDENTIFIER: getTrainerWorkingReport(reportId),
-- getDraftGenerationContext(reportId) and getManagementReview(reportId).
-- The governed reads they must resolve through -- `report_get_working`
-- (RPC-14) and `report_get_management_review` (RPC-15) -- are keyed by the
-- pair (p_class_session_id, p_student_id), because the report aggregate's
-- natural key is that pair.
--
-- No server-side resolver from a report identifier to that pair existed, so
-- the real adapter could not be composed at all without the CLIENT
-- supplying a session id and a student id alongside the report id. That is
-- prohibited: a client-supplied key is an unverified assertion about which
-- report is meant, and it would let a caller pair a report id it may read
-- with a session/student pair it may not, or probe the pair space for
-- existence. Authority in this system is re-derived by the database from
-- auth.uid() on every call and is never carried in a parameter.
--
-- This function therefore performs the resolution SERVER-SIDE, under the
-- caller's own credential, and returns the pair ONLY when the caller was
-- already entitled to reach that report through the governed read the pair
-- feeds. It is a KEY TRANSLATION, not a new grant of reach: every predicate
-- it applies is one of the predicates RPC-13/14/15 already apply, and the
-- downstream RPC re-proves all of them independently on the next call. If
-- this function were removed, no caller would lose access to any fact it is
-- entitled to; it would only lose the ability to name the fact by report id.
--
-- ---------------------------------------------------------------------
-- THE PROJECTION IS THE SIGNATURE (the Step 7I section 6.2 discipline)
-- ---------------------------------------------------------------------
-- RETURNS TABLE carries EXACTLY TWO uuid columns: class_session_id and
-- student_id. There is no column for a status, a lock_version, a version
-- id, a content or wording hash, a revision number, a submitted timestamp,
-- a rating, an observation, a checklist or approval field, a correction
-- request, a correction reason, a centre id, or any of the four
-- parent-facing panels. None of those can leak because NO COLUMN EXISTS TO
-- CARRY THEM -- they are unrepresentable, not filtered.
--
-- The centre id is deliberately absent even though the body resolves one:
-- it is a workflow-internal fact the caller has no need of, and the whole
-- point of this boundary is to be STRICTLY LESS DISCLOSING than every
-- existing projection. Two identifiers the caller may already obtain from
-- the enumeration surfaces is the entire answer.
--
-- ---------------------------------------------------------------------
-- EVERY DENIAL IS A BARE `RETURN` PRODUCING ZERO ROWS. It never RAISEs.
-- "No such report", "that report is in another centre", "you are a parent
-- and it has never been submitted" and "your membership is not active" are
-- all the SAME byte-identical zero-row answer, so a caller cannot use this
-- function as an existence oracle over report identifiers. A raised error,
-- even a generic one, would distinguish "exists but denied" from "does not
-- exist" by the mere fact that a code path was reached.
--
-- STABLE, not VOLATILE: it reads only, and PostgreSQL itself refuses any
-- mutation inside a non-volatile function -- so "this cannot write and
-- cannot append to the audit chain" is an ENGINE guarantee rather than a
-- review finding (`audit_append_event` is VOLATILE and therefore not
-- callable from here). This read is deliberately NON-AUDITING: the Step 7H
-- registry is a closed 16-action constant and none of its actions denotes a
-- read.
-- =====================================================================

-- ---------------------------------------------------------------------
-- P-1 guard: objects created by supabase_admin in schema public would
-- inherit its default ACL (ALL to anon/authenticated/service_role).
-- ---------------------------------------------------------------------
DO $guard$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION
      'Report-context-resolver migration aborted before any change: this migration must run as postgres, not "%".',
      current_user;
  END IF;
END;
$guard$;

-- ---------------------------------------------------------------------
-- Precondition: the objects this function binds to must already exist and
-- the schema must still hold the posture this migration was written
-- against. Abort before any change rather than create a resolver over a
-- schema that has drifted.
-- ---------------------------------------------------------------------
DO $precondition$
DECLARE
  v_n bigint;
BEGIN
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public';
  IF v_n <> 31 THEN
    RAISE EXCEPTION
      'Report-context-resolver migration aborted before any change: public holds % function(s); expected the accepted post-correction-tracking census of 31.', v_n;
  END IF;

  -- The three predicates this function reuses must exist unchanged. If any
  -- were missing, the dispatch below would not be the SAME authority the
  -- governed reads apply, and the resolver would become a widening.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND p.proname IN ('app_current_account_id', 'app_trainer_reaches_session', 'app_parent_reaches_student');
  IF v_n <> 3 THEN
    RAISE EXCEPTION
      'Report-context-resolver migration aborted before any change: % of the 3 required authorization helpers exist.', v_n;
  END IF;

  -- The pair-keyed reads this resolver feeds must still be pair-keyed.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND p.proname IN ('report_get_working', 'report_get_management_review', 'report_get_canonical')
     AND pg_catalog.pg_get_function_identity_arguments(p.oid) = 'p_class_session_id uuid, p_student_id uuid';
  IF v_n <> 3 THEN
    RAISE EXCEPTION
      'Report-context-resolver migration aborted before any change: the pair-keyed governed reads are not all present with the (class_session_id, student_id) signature.';
  END IF;

  -- The name must be free: this migration creates, it never replaces.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = 'report_resolve_context';
  IF v_n <> 0 THEN
    RAISE EXCEPTION
      'Report-context-resolver migration aborted before any change: public.report_resolve_context already exists.';
  END IF;
END;
$precondition$;

-- =====================================================================
-- R-22 -- public.report_resolve_context
-- =====================================================================
-- NAMING follows the committed convention `<owning aggregate>_<verb>_<
-- qualified object>`, as in `report_get_canonical`, `report_get_working`
-- and `report_list_management_corrections`. `report_` names the aggregate
-- whose table it reads, `resolve` is the verb, `context` is the object.
--
-- THE ONLY PARAMETER IS THE GOVERNED REPORT IDENTIFIER. There is no centre
-- parameter, no session parameter, no student parameter and no role
-- parameter, so a caller cannot assert any part of the answer: the pair is
-- read from the report row, and the authority to receive it is derived from
-- auth.uid() alone. ROLE IS A PREDICATE INSIDE THE FUNCTION, NEVER A
-- PROPERTY OF THE GRANT OR OF A PARAMETER.
--
-- THE ROLE DISPATCH MIRRORS `report_get_canonical` EXACTLY, with one
-- deliberate, recorded difference:
--
--   trainer     -> app_trainer_reaches_session(the report's session).
--                  Identical to RPC-13 and to RPC-14's live reach test.
--
--   management  -> permitted. The caller's SINGLE ACTIVE MANAGEMENT
--                  MEMBERSHIP OF THAT REPORT'S CENTRE *is* the predicate
--                  (A-015 guarantees at most one per centre). There is NO
--                  STATUS GATE HERE, and that is intentional: management
--                  correction tracking (R-7) legitimately surfaces reports
--                  at `draft_ready` and `needs_edit`, and those rows carry
--                  a report id that must be resolvable. Resolving the pair
--                  discloses nothing gated -- RPC-15's zero-row posture at
--                  those statuses (A-038, pinned by T7I-63) is untouched,
--                  so a management caller that resolves a needs_edit report
--                  and then calls RPC-15 still receives zero rows. The gate
--                  lives where it always lived: on the CONTENT read.
--
--   parent      -> app_parent_reaches_student(the report's student) AND
--                  latest_submitted_version_id IS NOT NULL. The second
--                  conjunct is not decoration: RPC-13 resolves content
--                  exclusively through that pointer, so without it a parent
--                  could resolve -- and therefore learn the existence and
--                  session of -- a report that has never been submitted.
--                  Nothing about an unsubmitted report is parent-facing.
--
--   any other   -> RETURN. NO BRANCH DEFAULTS TO PERMIT.
CREATE FUNCTION public.report_resolve_context(
  p_report_id uuid
)
RETURNS TABLE (
  class_session_id uuid,
  student_id       uuid
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_account_id uuid;
  v_r          public.reports%ROWTYPE;
  v_role       public.centre_membership_role;
BEGIN
  -- 1. Identity. NULL for unauthenticated, unlinked, deactivated, or an
  --    ambiguous multi-account match -- the helper treats ambiguity as no
  --    identity, and so does this function.
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN
    RETURN;
  END IF;

  -- 2. The report row, by primary key. A report id that does not exist and
  --    a report id the caller may not reach leave through the SAME exit.
  SELECT r.* INTO v_r
    FROM public.reports r
   WHERE r.id = p_report_id;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- 3. The caller's SINGLE active membership in THAT report's centre,
  --    resolved live and fail-closed on zero or on more than one -- the
  --    same array_agg + HAVING count(*) = 1 idiom RPC-13 uses. The centre
  --    comes from the REPORT, never from the caller's request, so there is
  --    no code path that answers about a centre the caller is not in.
  SELECT (pg_catalog.array_agg(m.role))[1] INTO v_role
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id
     AND m.centre_id  = v_r.centre_id
     AND m.status     = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_role IS NULL THEN
    RETURN;
  END IF;

  -- 4. Role dispatch. Every branch has a named live predicate.
  IF v_role = 'trainer' THEN
    IF NOT public.app_trainer_reaches_session(v_r.class_session_id) THEN
      RETURN;
    END IF;
  ELSIF v_role = 'management' THEN
    NULL;  -- the single active management membership of this centre is the predicate
  ELSIF v_role = 'parent' THEN
    IF NOT public.app_parent_reaches_student(v_r.student_id) THEN
      RETURN;
    END IF;
    IF v_r.latest_submitted_version_id IS NULL THEN
      RETURN;
    END IF;
  ELSE
    RETURN;
  END IF;

  -- 5. The answer: exactly the two identifiers, and nothing else.
  RETURN QUERY SELECT v_r.class_session_id, v_r.student_id;
END;
$fn$;

COMMENT ON FUNCTION public.report_resolve_context(uuid) IS
  'R-22: the governed report-context resolver. Translates a REPORT IDENTIFIER into the (class_session_id, student_id) pair that keys the governed report reads, under the CALLER''S OWN live authority -- trainer: app_trainer_reaches_session; management: a single active management membership of the report''s centre (deliberately NOT status-gated, so correction-tracking rows at draft_ready and needs_edit remain resolvable, while report_get_management_review''s zero-row posture at those statuses is untouched); parent: app_parent_reaches_student AND a non-NULL latest_submitted_version_id, so an unsubmitted report is never resolvable by a parent. Returns EXACTLY two uuid columns and nothing else -- no status, lock_version, version id, hash, revision number, timestamp, rating, observation, correction metadata, panel or centre id. Every denial, and an unknown report id, are the SAME byte-identical zero-row outcome, so it cannot be used as an existence oracle. It grants no reach: every predicate it applies is one the downstream read re-proves independently. STABLE, so the engine itself forbids it writing or auditing.';

-- ---------------------------------------------------------------------
-- EXECUTE posture -- the committed signature-qualified form. Never an
-- aggregate or unqualified statement, which would be ambiguous under any
-- future overload.
-- ---------------------------------------------------------------------
-- NOTHING IS GRANTED TO service_role, EVER. It carries BYPASSRLS, so the
-- ONLY control that constrains it is the ABSENCE of a privilege.
--
-- `authenticated` EXECUTE is REQUIRED, not a convenience: the
-- request-scoped client carries the caller's own session and therefore the
-- `authenticated` database role, which is what makes auth.uid() resolve
-- inside the function (A-030). It is SAFE because the function is written
-- to be invoked directly by any authenticated caller of any role, with no
-- reliance on the UI, the route, a query parameter or a token claim.
--
-- NO TABLE PRIVILEGE AND NO RLS POLICY IS ADDED ANYWHERE. EXECUTE on this
-- one function is the entire new client-reachable surface.
REVOKE ALL ON FUNCTION public.report_resolve_context(uuid) FROM PUBLIC, anon, service_role, authenticator;

GRANT EXECUTE ON FUNCTION public.report_resolve_context(uuid) TO authenticated;

-- ---------------------------------------------------------------------
-- End-of-migration posture assertions (7E/7G/7H/7I/assessment style)
-- ---------------------------------------------------------------------
DO $assert$
DECLARE
  v_new CONSTANT text := 'report_resolve_context';
  v_forbidden CONSTANT text[] := ARRAY[
    'todays_strength', 'next_focus', 'practice_suggestion', 'session_takeaway',
    'content_hash', 'wording_hash', 'revision_number', 'rating', 'status',
    'lock_version', 'version', 'checklist', 'approval', 'centre', 'reason',
    'correction', 'submitted', 'notes', 'evidence', 'attendance'
  ];
  v_cols text[];
  v_n    bigint;
  v_m    bigint;
  v_name text;
BEGIN
  -- X1: exactly 32 functions in public (31 + 1). No other function was
  --     created, and none was dropped or replaced.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public';
  IF v_n <> 32 THEN
    RAISE EXCEPTION 'Report-context-resolver assertion X1 failed: % function(s) in public; expected 32 (6 Step 7G + 4 Step 7H + 18 Step 7I + 2 assessment + 1 correction tracking + 1 context resolver)', v_n;
  END IF;

  -- X2: the object inventory is UNCHANGED beyond the one function --
  --     26 tables, 12 enums, 29 policies, RLS everywhere, FORCE nowhere.
  SELECT pg_catalog.count(*) FILTER (WHERE NOT c.relrowsecurity),
         pg_catalog.count(*) FILTER (WHERE c.relforcerowsecurity)
    INTO v_m, v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace ns ON ns.oid = c.relnamespace
   WHERE ns.nspname = 'public' AND c.relkind = 'r';
  IF v_m <> 0 OR v_n <> 0 THEN
    RAISE EXCEPTION 'Report-context-resolver assertion X2 failed: % table(s) without RLS, % table(s) with FORCE RLS; expected 0 and 0', v_m, v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace ns ON ns.oid = c.relnamespace
   WHERE ns.nspname = 'public' AND c.relkind = 'r';
  IF v_n <> 26 THEN
    RAISE EXCEPTION 'Report-context-resolver assertion X2 failed: % table(s) in public; expected 26 (unchanged -- no new table)', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_type t
    JOIN pg_catalog.pg_namespace ns ON ns.oid = t.typnamespace
   WHERE ns.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN
    RAISE EXCEPTION 'Report-context-resolver assertion X2 failed: % enum type(s) in public; expected 12 (unchanged -- no new enum)', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_policies WHERE schemaname = 'public';
  IF v_n <> 29 THEN
    RAISE EXCEPTION 'Report-context-resolver assertion X2 failed: % policy/policies in public; expected 29 (unchanged)', v_n;
  END IF;

  -- X3: the new function is postgres-owned plpgsql, SECURITY DEFINER, with
  --     a pinned EMPTY search_path, non-STRICT, STABLE and taking exactly
  --     ONE argument -- the governed report identifier and nothing else.
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
     AND p.provolatile = 's'
     AND p.pronargs = 1
     AND p.proconfig IS NOT NULL
     AND 'search_path=""' = ANY (p.proconfig);
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Report-context-resolver assertion X3 failed: public.% is not exactly one postgres-owned, SECURITY DEFINER, STABLE, non-STRICT, single-argument plpgsql function with a pinned EMPTY search_path (found %)', v_new, v_n;
  END IF;

  -- X4: the EXACT output column list -- two uuid columns, asserted from the
  --     catalogue so it holds against the APPLIED signature rather than the
  --     file. Any future widening fails the migration's own assertion first.
  SELECT pg_catalog.array_agg(a.name ORDER BY a.ord) INTO v_cols
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
    CROSS JOIN LATERAL pg_catalog.unnest(p.proargnames)
      WITH ORDINALITY AS a(name, ord)
   WHERE ns.nspname = 'public' AND p.proname = v_new;
  IF v_cols IS DISTINCT FROM ARRAY['p_report_id', 'class_session_id', 'student_id'] THEN
    RAISE EXCEPTION 'Report-context-resolver assertion X4 failed: the argument/column list is % ; expected exactly p_report_id in and (class_session_id, student_id) out', v_cols;
  END IF;
  IF pg_catalog.pg_get_function_result(
       (SELECT p.oid FROM pg_catalog.pg_proc p
          JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
         WHERE ns.nspname = 'public' AND p.proname = v_new))
     <> 'TABLE(class_session_id uuid, student_id uuid)' THEN
    RAISE EXCEPTION 'Report-context-resolver assertion X4 failed: the result type is not TABLE(class_session_id uuid, student_id uuid)';
  END IF;

  -- X5: no forbidden field name appears anywhere in the OUT column list.
  --     X4 already pins the list exactly; this states the PROHIBITION in its
  --     own terms so the reason a column is absent survives a future edit.
  FOREACH v_name IN ARRAY v_forbidden LOOP
    IF EXISTS (
      SELECT 1 FROM pg_catalog.unnest(v_cols) c(n)
       WHERE c.n <> 'p_report_id' AND c.n LIKE '%' || v_name || '%'
    ) THEN
      RAISE EXCEPTION 'Report-context-resolver assertion X5 failed: the projection exposes a forbidden field matching "%"', v_name;
    END IF;
  END LOOP;

  -- X6: EXECUTE census rises by exactly one, to 24, and the new function is
  --     unreachable by anon, service_role, authenticator and PUBLIC.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 24 THEN
    RAISE EXCEPTION 'Report-context-resolver assertion X6 failed: % function(s) hold authenticated EXECUTE; expected 24 (6 Step 7G + 14 Step 7I + 2 assessment + 1 correction tracking + 1 context resolver)', v_n;
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
    RAISE EXCEPTION 'Report-context-resolver assertion X6 failed: % does not hold authenticated EXECUTE exclusively', v_new;
  END IF;

  -- X7: the body never RAISEs, contains no dynamic SQL and no mutating
  --     statement. STABLE already makes a write impossible at run time; this
  --     makes the absence visible to a static reviewer, and the no-RAISE leg
  --     is what guarantees every denial is the same zero-row answer.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_new
     AND pg_catalog.regexp_replace(p.prosrc, '--[^\n]*', '', 'g') ~* '\m(RAISE|EXECUTE\s+format|INSERT\s+INTO|UPDATE\s+public\.|DELETE\s+FROM|TRUNCATE|CREATE\s|ALTER\s|DROP\s)';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Report-context-resolver assertion X7 failed: the resolver body contains a RAISE, dynamic SQL or a mutating statement';
  END IF;

  -- X8: the resolver reads NO version-content, assessment, attendance or
  --     audit object. It touches exactly reports and centre_memberships,
  --     plus the three authorization helpers.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_new
     AND pg_catalog.regexp_replace(p.prosrc, '--[^\n]*', '', 'g') ~
         '(public\.report_versions|public\.report_version_ratings|public\.report_version_checklist_progress|public\.report_version_approvals|public\.report_correction_requests|public\.observations|public\.observation_ratings|public\.attendance|public\.audit_)';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Report-context-resolver assertion X8 failed: the resolver reads a version-content, correction, assessment, attendance or audit object';
  END IF;

  -- X9: RPC-15's status gate and RPC-13/14's pair signature are UNTOUCHED.
  --     This migration adds a key translation; it reopens no read decision.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND p.proname = 'report_get_management_review'
     AND p.prosrc LIKE '%v_r.status = ''trainer_approved''%'
     AND p.prosrc LIKE '%v_r.status = ''submitted''%';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Report-context-resolver assertion X9 failed: report_get_management_review is missing or its status gate has changed';
  END IF;

  -- X10: the TABLE-privilege posture is untouched. This migration writes no
  --      data at all -- it contains not one DML statement, which is what
  --      keeps the canonical fixture checksum unmoved -- and it adds no
  --      table reach: PUBLIC, anon, service_role and authenticator still
  --      hold ZERO privileges on every table in public, and the accepted
  --      `authenticated` table-privilege census is unchanged at 13.
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.role_table_grants g
   WHERE g.table_schema = 'public'
     AND g.grantee IN ('PUBLIC', 'anon', 'service_role', 'authenticator');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Report-context-resolver assertion X10 failed: % non-authenticated client table privilege(s) exist in public; expected 0', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.role_table_grants g
   WHERE g.table_schema = 'public' AND g.grantee = 'authenticated';
  IF v_n <> 13 THEN
    RAISE EXCEPTION 'Report-context-resolver assertion X10 failed: % authenticated table privilege(s) in public; expected the accepted census of 13 (unchanged)', v_n;
  END IF;

  RAISE NOTICE 'Report-context-resolver migration: all posture assertions passed (32 functions, 26 tables, 12 enums, 29 policies, 24 authenticated EXECUTE; no new table, enum, policy or table privilege, and no data written).';
END;
$assert$;
