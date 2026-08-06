-- =====================================================================
-- B.E.S.T Coach -- Atomic complete-assessment save that opens the report
-- shell (Operator ruling R-C2-1)
-- =====================================================================
-- Governing authority (highest first):
--   Specification v3 -> Amendment 001 -> Amendment 002 -> Amendment 003
--   -> Amendment 004 -> Amendment 006 -> Operator ruling R-C2-1
--   -> CLAUDE.md -> Implementation Plan
--   -> docs/plan/STEP_7I_REPORT_LIFECYCLE_BASELINE.md
--   -> docs/plan/PHYSICAL_TEST_ASSESSMENT_WRITE_BASELINE.md
--
-- WHAT THIS MIGRATION CREATES -- exactly one bounded write boundary:
--   * 1 function ..... public.assessment_save_complete_and_open_report(
--                        uuid, uuid, uuid, integer, text[], text[],
--                        text, text, text, jsonb)
--   * 1 COMMENT ON FUNCTION statement
--   * 1 REVOKE line and 1 GRANT line
--   * its authored post-apply assertions
--
-- WHAT IT DELIBERATELY DOES NOT CREATE:
--   no CREATE TABLE, no CREATE TYPE, no ALTER TYPE, no new enum label, no
--   column, no constraint, no index, no CREATE POLICY, no trigger, no
--   view, no extension, no schema, no table GRANT, no ALTER DEFAULT
--   PRIVILEGES, no ownership change, no new audit action, no fixture row,
--   not one DML statement, and NO `CREATE OR REPLACE` of any existing
--   function. Every ratified transition, status, projection, policy,
--   table, enum, column and grant is byte-untouched.
--
-- ---------------------------------------------------------------------
-- WHY THIS FUNCTION EXISTS -- the exact gap it closes (R-C2-1)
-- ---------------------------------------------------------------------
-- When a trainer saved the first COMPLETE assessment for a student in a
-- class session, no report existed. `saveObservation` therefore returned
-- no report identifier, and the assessment surface -- correctly refusing
-- to invent one -- rendered no route onward. The entire downstream
-- lifecycle was unreachable for a first assessment.
--
-- Report creation lived in `requestDraft`, which composed
-- `report_create` -> `report_mark_observation_saved` ->
-- `report_request_draft` as THREE SEPARATE PostgREST calls, i.e. three
-- separate transactions. A crash between the first and the second
-- committed a report stranded at `incomplete`; the code carried an
-- explicit recovery branch for exactly that, which is direct evidence
-- that the boundary did not hold.
--
-- R-C2-1 requires the authoritative server-side complete-assessment save
-- to ATOMICALLY ensure exactly ONE report shell exists and to return its
-- REAL identifier, with post-state `observation_saved`, no version, no
-- draft, no approval and no parent visibility.
--
-- ---------------------------------------------------------------------
-- IT IS A COMPOSER, NOT A NEW AUTHORITY
-- ---------------------------------------------------------------------
-- This function re-implements NOTHING. It calls, in one transaction, the
-- three already-ratified functions that own each step:
--
--   public.assessment_save_observation      -- the ONLY observation write
--   public.report_create                    -- transition T0, EMPTY -> incomplete
--   public.report_mark_observation_saved    -- transition T1, incomplete -> observation_saved
--
-- Both arcs it walks are already in the ratified fourteen-pair legal
-- (from, to) set. It introduces NO new arc: in particular it does NOT
-- insert a report directly at `observation_saved`, which -- though legal
-- at the DDL level, since no CHECK and no trigger constrains
-- `reports.status` -- is not a ratified transition. The committed shell
-- therefore lands at lock_version = 2, because R-14 bumps the aggregate
-- by exactly one per committed mutation and this walks two arcs.
--
-- Every authorization predicate, every write gate (attendance `present`
-- with a MISSING ROW FAILING CLOSED, ACTIVE enrolment, the scheduled
-- session start in the pinned 'Asia/Singapore' literal) and every
-- authored error code is the composed functions' own, re-derived from
-- auth.uid() on each of the three calls. This body adds not one new
-- predicate and not one new privilege. If it were removed, no caller
-- would lose access to anything it is entitled to; the operation would
-- merely stop being atomic again.
--
-- The three gates are IDENTICAL in the assessment function (BC102 / BC103
-- / BC104) and in report_create (BC015 / BC016 / BC017). It is therefore
-- not possible for the report step to fail for a reason the observation
-- step did not already fail for -- the composite has no realistic partial
-- outcome, and where one is theoretically reachable the transaction
-- rolls back whole, leaving neither an observation nor a report.
--
-- ---------------------------------------------------------------------
-- IDEMPOTENCE AND CONCURRENCY ARE THE DATABASE'S, NOT THE CALLER'S
-- ---------------------------------------------------------------------
-- `reports_session_student_key UNIQUE (class_session_id, student_id)`
-- ALREADY EXISTS. This migration adds no constraint; it USES the one that
-- is there. Two concurrent complete saves for the same pair cannot both
-- insert: the loser blocks on the unique index, wakes on the winner's
-- commit, and its `report_create` raises BC014. That is caught here and
-- resolved into the WINNER'S row, returned as an ordinary success. There
-- is no read-then-write window anywhere in this body: the row is either
-- created by our own INSERT or read under FOR UPDATE after a real index
-- conflict has already proven it exists.
--
-- Catching BC014 is SAFE because report_create performs ALL of its
-- authorization and ALL three write gates BEFORE its INSERT. Reaching the
-- conflict handler at all is proof the caller was entitled to this exact
-- (session, student). An unauthorized caller is rejected with BC001 many
-- statements earlier and never observes a conflict.
--
-- ---------------------------------------------------------------------
-- WHAT IT DOES NOT DO TO AN EXISTING REPORT
-- ---------------------------------------------------------------------
-- The T1 advance fires ONLY when the resolved report is at `incomplete`.
-- A report already at observation_saved, drafting, draft_ready,
-- needs_edit, trainer_approved, approved or submitted is returned
-- EXACTLY AS IT STANDS: not advanced, not reset, not versioned, not
-- re-audited. A repeated complete save is a no-op on the aggregate that
-- returns the existing identifier -- which is precisely what R-C2-1
-- requires -- and a correction save against a `needs_edit` report leaves
-- the ratified correction workflow untouched.
--
-- It creates NO report version, requests NO draft, records NO trainer
-- approval, and sets NEITHER version pointer. `latest_submitted_version_id`
-- remains NULL, so `report_resolve_context` returns zero rows to a parent
-- and `report_get_management_review` -- gated to `trainer_approved` and
-- `submitted` -- returns its authored "not available" outcome with zero
-- panels. No visibility work is needed or performed.
--
-- ---------------------------------------------------------------------
-- AUDIT
-- ---------------------------------------------------------------------
-- No new audit action is introduced. The closed 16-action registry,
-- duplicated byte-identically inside audit_append_event and
-- audit_verify_chain, is untouched. On the creation path this function
-- emits exactly the two events its two arcs already emit --
-- `report.created` then `report.state_changed` (report, incomplete,
-- observation_saved) -- both from report_create and
-- report_mark_observation_saved themselves. On the idempotent repeat path
-- it emits NONE, because it performs no transition.
-- =====================================================================

-- ---------------------------------------------------------------------
-- P-1 guard: objects created by supabase_admin in schema public would
-- inherit its default ACL (ALL to anon/authenticated/service_role).
-- ---------------------------------------------------------------------
DO $guard$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION
      'Atomic complete-save migration aborted before any change: this migration must run as postgres, not "%".',
      current_user;
  END IF;
END;
$guard$;

-- ---------------------------------------------------------------------
-- Precondition: abort before any change if the schema has drifted from
-- the posture this composer was written against.
-- ---------------------------------------------------------------------
DO $precondition$
DECLARE
  v_n bigint;
BEGIN
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public';
  IF v_n <> 32 THEN
    RAISE EXCEPTION
      'Atomic complete-save migration aborted before any change: public holds % function(s); expected the accepted post-context-resolver census of 32.', v_n;
  END IF;

  -- The three composed functions must exist. If any were missing or
  -- renamed, this composer would not be composing the ratified steps.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND p.proname IN ('assessment_save_observation', 'report_create', 'report_mark_observation_saved');
  IF v_n <> 3 THEN
    RAISE EXCEPTION
      'Atomic complete-save migration aborted before any change: % of the 3 composed functions exist.', v_n;
  END IF;

  -- The concurrency mechanism this body RELIES ON must already be in
  -- place. This migration adds no constraint; it would be unsound
  -- without this one.
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
     WHERE conrelid = 'public.reports'::pg_catalog.regclass
       AND conname  = 'reports_session_student_key'
       AND contype  = 'u'
  ) THEN
    RAISE EXCEPTION
      'Atomic complete-save migration aborted before any change: reports_session_student_key is missing; the exactly-one-report guarantee has no mechanism.';
  END IF;

  -- The T0/T1 arcs must still be the arcs this composer walks.
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
     WHERE ns.nspname = 'public' AND p.proname = 'report_create'
       AND p.prosrc LIKE '%''incomplete'', 1%'
  ) THEN
    RAISE EXCEPTION
      'Atomic complete-save migration aborted before any change: report_create no longer inserts at incomplete/1.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
     WHERE ns.nspname = 'public' AND p.proname = 'report_mark_observation_saved'
       AND p.prosrc LIKE '%v_r.status <> ''incomplete''%'
       AND p.prosrc LIKE '%''BC018''%'
  ) THEN
    RAISE EXCEPTION
      'Atomic complete-save migration aborted before any change: report_mark_observation_saved has lost its single-origin gate or its nine-rating gate.';
  END IF;
END;
$precondition$;

-- ---------------------------------------------------------------------
-- The composer.
--
-- plpgsql is MANDATORY, not stylistic: a LANGUAGE sql or BEGIN ATOMIC
-- body is parse-analyzed at CREATE FUNCTION under check_function_bodies,
-- which is the hazard the Step 7I two-file enum split exists to remove.
-- Every project function is plpgsql and this one is no exception.
-- ---------------------------------------------------------------------
CREATE FUNCTION public.assessment_save_complete_and_open_report(
  p_class_session_id        uuid,
  p_student_id              uuid,
  p_expected_observation_id uuid,
  p_expected_lock_version   integer,
  p_strength_chips          text[],
  p_focus_chips             text[],
  p_observation_notes       text,
  p_follow_up_notes         text,
  p_term_evidence_notes     text,
  p_ratings                 jsonb,
  OUT observation_id           uuid,
  OUT observation_lock_version integer,
  OUT report_id                uuid,
  OUT report_status            public.report_status,
  OUT report_lock_version      integer,
  OUT report_created           boolean
)
RETURNS record
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_obs_id     uuid;
  v_obs_lock   integer;
  v_dims       smallint;
  v_complete   boolean;
  v_was_new    boolean;
  v_rep_id     uuid;
  v_rep_status public.report_status;
  v_rep_lock   integer;
BEGIN
  -- 1. THE ASSESSMENT WRITE, delegated verbatim. Every parameter is passed
  --    straight through; nothing is added, defaulted or re-interpreted.
  --    All ten authored assessment errors (BC101..BC114) and all three
  --    write gates are raised by that function and propagate unchanged.
  SELECT s.observation_id, s.lock_version, s.dimension_count, s.is_complete, s.was_created
    INTO v_obs_id, v_obs_lock, v_dims, v_complete, v_was_new
    FROM public.assessment_save_observation(
           p_class_session_id,
           p_student_id,
           p_expected_observation_id,
           p_expected_lock_version,
           p_strength_chips,
           p_focus_chips,
           p_observation_notes,
           p_follow_up_notes,
           p_term_evidence_notes,
           p_ratings
         ) AS s;

  -- Belt and braces over the delegate's own BC114 post-condition. An
  -- incomplete assessment must NEVER open a report shell (R-C2-1).
  IF v_obs_id IS NULL OR v_complete IS NOT TRUE OR v_dims <> 9 THEN
    RAISE EXCEPTION USING ERRCODE = 'BC114',
      MESSAGE = 'assessment: the saved assessment is not complete and has been discarded';
  END IF;

  -- 2. ENSURE EXACTLY ONE REPORT SHELL -- transition T0, or resolve the
  --    row a concurrent or earlier caller already committed. The
  --    exclusion is performed by reports_session_student_key, not by a
  --    prior read.
  BEGIN
    SELECT c.report_id, c.status, c.lock_version
      INTO v_rep_id, v_rep_status, v_rep_lock
      FROM public.report_create(p_class_session_id, p_student_id, v_obs_id) AS c;
    report_created := true;
  EXCEPTION WHEN SQLSTATE 'BC014' THEN
    -- report_create authorizes and gates BEFORE it inserts, so arriving
    -- here is proof the caller was entitled to this exact pair. Re-read
    -- the committed winner under a row lock, in this same transaction.
    report_created := false;
    SELECT r.id, r.status, r.lock_version
      INTO v_rep_id, v_rep_status, v_rep_lock
      FROM public.reports r
     WHERE r.class_session_id = p_class_session_id
       AND r.student_id       = p_student_id
     FOR UPDATE;
    IF v_rep_id IS NULL THEN
      -- A duplicate was reported and then no row was found: the aggregate
      -- moved under us. Non-disclosing stale-state, never a fabricated id.
      RAISE EXCEPTION USING ERRCODE = 'BC003',
        MESSAGE = 'report: the expected state no longer matches; re-read and retry';
    END IF;
  END;

  -- 3. TRANSITION T1 -- and ONLY from `incomplete`. A report already past
  --    that point is returned exactly as it stands: never advanced,
  --    never reset, never re-audited.
  IF v_rep_status = 'incomplete' THEN
    SELECT m.status, m.lock_version
      INTO v_rep_status, v_rep_lock
      FROM public.report_mark_observation_saved(v_rep_id, v_rep_lock) AS m;
  END IF;

  -- 4. NO report version is written. NO draft is requested. NO approval is
  --    recorded. NEITHER version pointer is set. NO audit event is emitted
  --    by this body itself.
  observation_id           := v_obs_id;
  observation_lock_version := v_obs_lock;
  report_id                := v_rep_id;
  report_status            := v_rep_status;
  report_lock_version      := v_rep_lock;
END;
$fn$;

COMMENT ON FUNCTION public.assessment_save_complete_and_open_report(uuid, uuid, uuid, integer, text[], text[], text, text, text, jsonb) IS
  'R-C2-1: the authoritative complete-assessment save. In ONE transaction it delegates the observation write to assessment_save_observation, then ensures EXACTLY ONE report shell for (class_session_id, student_id) by walking the ratified arcs T0 (report_create) and -- only from `incomplete` -- T1 (report_mark_observation_saved), and returns the REAL report identifier. Idempotence and concurrency safety come from the pre-existing reports_session_student_key unique constraint: a duplicate INSERT raises BC014, which is caught and resolved into the winner''s row under FOR UPDATE, so repeated and concurrent complete saves both yield exactly one report and the SAME identifier. It re-implements nothing: every authorization predicate, every write gate and every authored error code belongs to the three composed functions and is re-derived from auth.uid() on each of them. It creates no report version, requests no draft, records no approval, sets neither version pointer and introduces no audit action -- so the shell is invisible to parents (latest_submitted_version_id stays NULL) and yields zero panels to management review. A report already past `incomplete` is returned untouched.';

-- ---------------------------------------------------------------------
-- EXECUTE posture -- the committed signature-qualified form.
--
-- NOTHING IS GRANTED TO service_role, EVER. It carries BYPASSRLS, so the
-- ONLY control that constrains it is the ABSENCE of a privilege.
--
-- `authenticated` EXECUTE is REQUIRED, not a convenience: the
-- request-scoped client carries the caller's own session and therefore
-- the `authenticated` database role, which is what makes auth.uid()
-- resolve inside the function (A-030). It is SAFE because the function is
-- written to be invoked directly by any authenticated caller of any role,
-- with no reliance on the UI, the route, a query parameter or a token
-- claim -- a non-trainer, or a trainer of another centre, is refused by
-- the composed functions' own fail-closed BC101/BC001 checks.
--
-- NO TABLE PRIVILEGE AND NO RLS POLICY IS ADDED ANYWHERE. EXECUTE on this
-- one function is the entire new client-reachable surface.
REVOKE ALL ON FUNCTION public.assessment_save_complete_and_open_report(uuid, uuid, uuid, integer, text[], text[], text, text, text, jsonb) FROM PUBLIC, anon, service_role, authenticator;

GRANT EXECUTE ON FUNCTION public.assessment_save_complete_and_open_report(uuid, uuid, uuid, integer, text[], text[], text, text, text, jsonb) TO authenticated;

-- ---------------------------------------------------------------------
-- End-of-migration posture assertions (7E/7G/7H/7I/assessment/resolver style)
-- ---------------------------------------------------------------------
DO $assert$
DECLARE
  v_new CONSTANT text := 'assessment_save_complete_and_open_report';
  v_args text[];
  v_n    bigint;
  v_m    bigint;
BEGIN
  -- X1: exactly 33 functions in public (32 + 1). None dropped, none replaced.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public';
  IF v_n <> 33 THEN
    RAISE EXCEPTION 'Atomic complete-save assertion X1 failed: % function(s) in public; expected 33 (6 Step 7G + 4 Step 7H + 18 Step 7I + 2 assessment + 1 correction tracking + 1 context resolver + 1 atomic complete save)', v_n;
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
    RAISE EXCEPTION 'Atomic complete-save assertion X2 failed: % table(s) without RLS, % table(s) with FORCE RLS; expected 0 and 0', v_m, v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace ns ON ns.oid = c.relnamespace
   WHERE ns.nspname = 'public' AND c.relkind = 'r';
  IF v_n <> 26 THEN
    RAISE EXCEPTION 'Atomic complete-save assertion X2 failed: % table(s) in public; expected 26 (unchanged -- no new table)', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_type t
    JOIN pg_catalog.pg_namespace ns ON ns.oid = t.typnamespace
   WHERE ns.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN
    RAISE EXCEPTION 'Atomic complete-save assertion X2 failed: % enum type(s) in public; expected 12 (unchanged -- no new enum)', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_policies WHERE schemaname = 'public';
  IF v_n <> 29 THEN
    RAISE EXCEPTION 'Atomic complete-save assertion X2 failed: % policy/policies in public; expected 29 (unchanged)', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_enum e JOIN pg_catalog.pg_type t ON t.oid = e.enumtypid
   WHERE t.typname = 'report_status';
  IF v_n <> 8 THEN
    RAISE EXCEPTION 'Atomic complete-save assertion X2 failed: report_status holds % label(s); expected the ratified 8', v_n;
  END IF;

  -- X3: the new function is postgres-owned plpgsql, SECURITY DEFINER,
  --     VOLATILE, non-STRICT, ten input arguments, pinned EMPTY search_path.
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
     AND p.provolatile = 'v'
     AND p.pronargs = 10
     AND p.proconfig IS NOT NULL
     AND 'search_path=""' = ANY (p.proconfig);
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Atomic complete-save assertion X3 failed: public.% is not exactly one postgres-owned, SECURITY DEFINER, VOLATILE, non-STRICT, ten-argument plpgsql function with a pinned EMPTY search_path (found %)', v_new, v_n;
  END IF;

  -- X4: THE ALLOW-LIST IS THE SIGNATURE. The ten inputs are exactly the
  --     ten ratified assessment parameters -- no centre, module, enrolment,
  --     membership, attendance, status, report id, version, checklist or
  --     approval value is suppliable. The six outputs are exactly the two
  --     observation facts and the four report facts and nothing else.
  SELECT pg_catalog.array_agg(a.name ORDER BY a.ord) INTO v_args
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
    CROSS JOIN LATERAL pg_catalog.unnest(p.proargnames)
      WITH ORDINALITY AS a(name, ord)
   WHERE ns.nspname = 'public' AND p.proname = v_new;
  IF v_args IS DISTINCT FROM ARRAY[
       'p_class_session_id', 'p_student_id', 'p_expected_observation_id',
       'p_expected_lock_version', 'p_strength_chips', 'p_focus_chips',
       'p_observation_notes', 'p_follow_up_notes', 'p_term_evidence_notes',
       'p_ratings',
       'observation_id', 'observation_lock_version',
       'report_id', 'report_status', 'report_lock_version', 'report_created']
  THEN
    RAISE EXCEPTION 'Atomic complete-save assertion X4 failed: the argument/column list is %', v_args;
  END IF;

  -- X5: the input signature is IDENTICAL to assessment_save_observation's
  --     ten ratified inputs, in order. The composer widens nothing.
  IF (SELECT pg_catalog.array_agg(a.name ORDER BY a.ord)
        FROM pg_catalog.pg_proc p
        JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
        CROSS JOIN LATERAL pg_catalog.unnest(p.proargnames)
          WITH ORDINALITY AS a(name, ord)
       WHERE ns.nspname = 'public' AND p.proname = 'assessment_save_observation'
         AND a.ord <= 10)
     IS DISTINCT FROM v_args[1:10]
  THEN
    RAISE EXCEPTION 'Atomic complete-save assertion X5 failed: the composer input signature diverges from assessment_save_observation';
  END IF;

  -- X6: EXECUTE census rises by exactly one, to 25, and the new function
  --     is unreachable by anon, service_role, authenticator and PUBLIC.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 25 THEN
    RAISE EXCEPTION 'Atomic complete-save assertion X6 failed: % function(s) hold authenticated EXECUTE; expected 25', v_n;
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
    RAISE EXCEPTION 'Atomic complete-save assertion X6 failed: % does not hold authenticated EXECUTE exclusively', v_new;
  END IF;

  -- X7: no dynamic SQL anywhere in the body.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_new
     AND pg_catalog.regexp_replace(p.prosrc, '--[^\n]*', '', 'g') ~* '\m(EXECUTE\s+format|EXECUTE\s+''|CREATE\s|ALTER\s|DROP\s|TRUNCATE)';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Atomic complete-save assertion X7 failed: the composer body contains dynamic SQL or DDL';
  END IF;

  -- X8: the composer writes NOTHING of its own. It contains no INSERT, no
  --     UPDATE, no DELETE and no direct audit call: every durable effect
  --     belongs to one of the three composed functions.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_new
     AND pg_catalog.regexp_replace(p.prosrc, '--[^\n]*', '', 'g') ~* '\m(INSERT\s+INTO|UPDATE\s+public\.|DELETE\s+FROM|audit_append_event)';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Atomic complete-save assertion X8 failed: the composer performs a write or an audit append of its own';
  END IF;

  -- X9: the composer touches NO version-content, approval, checklist or
  --     correction object, and no parent- or management-facing read.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_new
     AND pg_catalog.regexp_replace(p.prosrc, '--[^\n]*', '', 'g') ~
         '(public\.report_versions|public\.report_version_ratings|public\.report_version_checklist_progress|public\.report_version_approvals|public\.report_correction_requests|public\.report_request_draft|public\.report_store_draft|public\.report_get_management_review|public\.report_get_canonical|public\.report_trainer_approve|public\.report_submit)';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Atomic complete-save assertion X9 failed: the composer reaches a version, approval, correction, drafting or downstream-read object';
  END IF;

  -- X10: the TABLE-privilege posture is untouched, and this migration
  --      writes no data at all -- which is what keeps the canonical
  --      fixture checksum unmoved.
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.role_table_grants g
   WHERE g.table_schema = 'public'
     AND g.grantee IN ('PUBLIC', 'anon', 'service_role', 'authenticator');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Atomic complete-save assertion X10 failed: % non-authenticated client table privilege(s) exist in public; expected 0', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.role_table_grants g
   WHERE g.table_schema = 'public' AND g.grantee = 'authenticated';
  IF v_n <> 13 THEN
    RAISE EXCEPTION 'Atomic complete-save assertion X10 failed: % authenticated table privilege(s) in public; expected the accepted census of 13 (unchanged)', v_n;
  END IF;

  -- X11: the composer calls EXACTLY the three ratified steps, and the
  --      T1 advance is conditioned on `incomplete` -- so a report past
  --      that point can never be advanced or reset by this path.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_new
     AND p.prosrc LIKE '%public.assessment_save_observation(%'
     AND p.prosrc LIKE '%public.report_create(%'
     AND p.prosrc LIKE '%public.report_mark_observation_saved(%'
     AND p.prosrc LIKE '%v_rep_status = ''incomplete''%';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Atomic complete-save assertion X11 failed: the composer does not call exactly the three ratified steps with the incomplete-only T1 gate';
  END IF;

  -- X12: the three composed functions are UNTOUCHED -- this migration
  --      contains no CREATE OR REPLACE and their gates still stand.
  --      The assessment leg strips `--` comments before asserting that no
  --      reference to public.reports exists, because the ratified body
  --      DOCUMENTS that absence in a comment (T-ASM-32's own property is
  --      "no STATEMENT referencing public.reports"). Matching the raw
  --      source here would assert the opposite of the intended property.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND ((p.proname = 'assessment_save_observation'   AND p.prosrc LIKE '%''BC114''%' AND pg_catalog.regexp_replace(p.prosrc, '--[^\n]*', '', 'g') NOT LIKE '%public.reports%')
       OR (p.proname = 'report_create'                 AND p.prosrc LIKE '%''BC014''%')
       OR (p.proname = 'report_mark_observation_saved' AND p.prosrc LIKE '%''observation_saved''%'));
  IF v_n <> 3 THEN
    RAISE EXCEPTION 'Atomic complete-save assertion X12 failed: one of the three composed functions has been altered (found %)', v_n;
  END IF;

  -- X13: the concurrency mechanism is STILL the pre-existing unique
  --      constraint, and no duplicate constraint or index was added.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_constraint
   WHERE conrelid = 'public.reports'::pg_catalog.regclass AND contype = 'u';
  IF v_n <> 3 THEN
    RAISE EXCEPTION 'Atomic complete-save assertion X13 failed: public.reports carries % unique constraint(s); expected the unchanged 3 (id+centre, observation, session+student)', v_n;
  END IF;

  RAISE NOTICE 'Atomic complete-save migration: all posture assertions passed (33 functions, 26 tables, 12 enums, 29 policies, 25 authenticated EXECUTE; no new table, enum, label, constraint, index, policy or table privilege, no CREATE OR REPLACE, and no data written).';
END;
$assert$;
