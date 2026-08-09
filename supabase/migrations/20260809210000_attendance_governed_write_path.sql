-- =====================================================================
-- B.E.S.T Coach -- the governed Trainer attendance write path
-- =====================================================================
-- Governing authority (highest first):
--   Specification v3 -> Amendment 001 -> Amendment 002 (A-018)
--   -> Amendment 003 (A-026, A-028, A-030) -> Amendment 004 (A-034)
--   -> Operator ruling G-04 item 3 (attendance control =
--      GOVERNED FUNCTIONAL INSERTION) -> CLAUDE.md -> Implementation Plan
--   -> docs/plan/HERO_V3_EXECUTION_OVERLAY.md (Stage 1)
--
-- WHAT THIS MIGRATION CREATES -- exactly one bounded write boundary:
--   * 1 function ..... public.attendance_set_status(uuid, uuid,
--                        public.attendance_status, public.attendance_status)
--   * 1 COMMENT ON FUNCTION statement
--   * 1 REVOKE line and 1 GRANT line
--   * its authored precondition and post-apply assertions
--
-- WHAT IT DELIBERATELY DOES NOT CREATE:
--   no CREATE TABLE, no CREATE TYPE, no ALTER TYPE, no new enum label, no
--   column, no constraint, no index, no CREATE POLICY, no trigger, no
--   view, no extension, no schema, no table GRANT, no ALTER DEFAULT
--   PRIVILEGES, no ownership change, NO NEW AUDIT ACTION, no fixture row,
--   and NO `CREATE OR REPLACE` of any existing function. Every ratified
--   transition, status, projection, policy, table, enum, column and
--   existing grant is byte-untouched. The Step 7H action registry stays at
--   SIXTEEN strings: `attendance.changed` is already E4 of that ratified
--   registry, so this write path needs no extension and gets none.
--
-- ---------------------------------------------------------------------
-- THE GAP THIS CLOSES
-- ---------------------------------------------------------------------
-- A-018 requires that when a valid class-session roster is initialized
-- every enrolled student is `Present` by default, that the TRAINER may
-- toggle an individual student to `Absent`, that the final state persists
-- for that exact (student, class session) pair, and that every attendance
-- change is AUDITABLE.
--
-- None of that had a write path. `public.attendance` carried three SELECT
-- policies (management / trainer / parent) and NO INSERT or UPDATE policy,
-- and no attendance function existed. Under A-030's deny-by-default
-- posture that is correct as far as it goes -- there is no governed direct
-- client DML anywhere -- but it left the table WRITABLE BY NOBODY. The
-- fixture inserted the one row the assessment gate needs, so the hero
-- chain ran on a hand-seeded row rather than on a governed action.
--
-- That mattered beyond attendance itself. `report_create` fails closed on
-- a MISSING attendance row (BC015), so attendance is the FIRST governed
-- write of the whole report lifecycle -- the assessment save cannot open a
-- report for a student who is not recorded present. A lifecycle whose
-- entry condition is satisfied only by a fixture INSERT is not a proven
-- lifecycle.
--
-- ---------------------------------------------------------------------
-- ONE ENTRY POINT, AND WHY INITIALIZATION IS NOT A SECOND ONE
-- ---------------------------------------------------------------------
-- Roster initialization and the Present/Absent toggle are ONE function,
-- not two. A separate `attendance_initialize_roster` would be a second
-- client-callable write boundary that must repeat every authorization
-- predicate and every gate, and -- worse -- it would emit one
-- `attendance.changed` event per enrolled student for a state nobody
-- chose, burying the trainer's real decisions in default noise.
--
-- Instead the DEFAULT IS MATERIALIZED LAZILY, by the same call that
-- carries the trainer's intent:
--
--   * no row exists  -> this call INSERTS at `present` (the column
--                       default, which is A-018's rule made physical) and
--                       then applies p_new_status to it;
--   * a row exists   -> this call applies p_new_status under
--                       compare-and-set.
--
-- Exactly ONE audit event is emitted per governed action, whose
-- state_from is NULL when this call created the record and the prior
-- status otherwise, and whose state_to is the FINAL committed status. The
-- payload carries `initialized` so a reader can tell the two apart
-- without a second event. A-029's one-event-per-action rule is therefore
-- satisfied by construction rather than by hoping the caller batches.
--
-- ---------------------------------------------------------------------
-- COMPARE-AND-SET, WITH NO THIRD NULLABILITY CASE
-- ---------------------------------------------------------------------
-- p_expected_status is the caller's belief about the CURRENT record:
--
--   row exists, p_expected_status matches      -> proceed
--   row exists, p_expected_status differs      -> BC203 stale
--   row exists, p_expected_status IS NULL      -> BC203 stale (the caller
--                                                 believed no record
--                                                 existed; one does)
--   no row,     p_expected_status IS NULL      -> proceed, initializing
--   no row,     p_expected_status IS NOT NULL  -> BC203 stale (the caller
--                                                 believed a record
--                                                 existed; none does)
--
-- NULL therefore means exactly "I believe there is no record yet", and
-- every disagreement between the caller's belief and the committed row is
-- the SAME stale answer. There is no "force" mode and no upsert-on-
-- mismatch: a client whose view has drifted must re-read.
--
-- The INSERT races on `attendance_session_student_key UNIQUE
-- (class_session_id, student_id)`, which ALREADY EXISTS -- this migration
-- adds no constraint, it USES the one that is there. Two concurrent
-- initializing calls cannot both insert: the loser blocks on the unique
-- index, wakes on the winner's commit, and is answered BC203 stale,
-- because by then its "no record exists" belief is provably false. The
-- row is then SELECT ... FOR UPDATE'd before the toggle, so there is no
-- read-then-write window on the existing-row path either.
--
-- ---------------------------------------------------------------------
-- THE ONE GOVERNED REFUSAL (A-026)
-- ---------------------------------------------------------------------
-- "Attendance for a submitted report cannot be changed to `Absent`" --
-- that correction path is governed, never a silent status flip. BC204
-- refuses it, keyed on `reports.latest_submitted_version_id IS NOT NULL`
-- for this exact pair, which is the same pointer that decides parent
-- visibility. Marking a student absent is refused ONLY at `submitted`:
-- A-026's "mid-cycle absence retains existing work but blocks
-- progression" is deliberately preserved, so absence at
-- observation_saved, drafting, draft_ready, needs_edit or
-- trainer_approved is ACCEPTED and DESTROYS NOTHING. This body issues no
-- DELETE and no UPDATE against observations, observation_ratings,
-- report_versions or any report row: the trainer's work survives an
-- attendance correction, and progression is blocked by report_create's
-- own pre-existing BC015 gate rather than by deleting anything.
--
-- Setting a student back to `present` is never refused by BC204 -- the
-- rule is directional, and un-marking an accidental absence must not
-- require a governed correction.
--
-- ---------------------------------------------------------------------
-- MANAGEMENT AND PARENT CANNOT REACH THIS AT ALL
-- ---------------------------------------------------------------------
-- A-034 forbids management from modifying attendance, and the parent
-- boundary is read-only and absolute. Both are closed by the SAME
-- predicate that authorizes the trainer, not by a separate deny branch:
-- the actor is resolved as THE SINGLE active `trainer` membership of the
-- caller's account in the SESSION'S OWN centre (R-28's
-- HAVING count(*) = 1 discipline, so zero and ambiguous both mean no
-- identity), and live reach is re-derived per call through
-- `app_trainer_reaches_session`. A management or parent caller resolves no
-- trainer membership and receives BC201 -- byte-identical to the answer a
-- non-existent session gets, so the error discloses nothing about which
-- of the two it was. `attendance_recorded_by_role_pinned_chk` already
-- refuses any recorded_by_role other than `trainer` at the DDL level, so
-- even a future defect in this body could not attribute an attendance
-- write to management.
--
-- ---------------------------------------------------------------------
-- WHAT IS NOT HERE, ON PURPOSE
-- ---------------------------------------------------------------------
-- No third attendance state (G-04 item 3, A-026: the enum is two-valued
-- and stays that way). No bulk endpoint. No reason/notes column -- a
-- reason would be free text about a named child in a row no erasure
-- mechanism reaches. No evidence coupling of any kind (H-5: evidence
-- media is OUT of this window). No notification (G-04 item 4:
-- notifications are OUT of Final MVP). No UI -- this is Stage 1, server
-- side only.
-- =====================================================================

-- ---------------------------------------------------------------------
-- P-1 guard: objects created by supabase_admin in schema public would
-- inherit its default ACL (ALL to anon/authenticated/service_role).
-- ---------------------------------------------------------------------
DO $guard$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION
      'Attendance write-path migration aborted before any change: this migration must run as postgres, not "%".',
      current_user;
  END IF;
END;
$guard$;

-- ---------------------------------------------------------------------
-- Precondition: abort before any change if the posture this function was
-- written against has drifted.
-- ---------------------------------------------------------------------
DO $precondition$
DECLARE
  v_n bigint;
BEGIN
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public';
  IF v_n <> 36 THEN
    RAISE EXCEPTION
      'Attendance write-path migration aborted before any change: public holds % function(s); expected the accepted census of 36.', v_n;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
     WHERE ns.nspname = 'public' AND p.proname LIKE 'attendance%'
  ) THEN
    RAISE EXCEPTION
      'Attendance write-path migration aborted before any change: an attendance function already exists.';
  END IF;

  -- The concurrency mechanism this body RELIES ON must already be in
  -- place. This migration adds no constraint; it would be unsound
  -- without this one.
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
     WHERE conrelid = 'public.attendance'::pg_catalog.regclass
       AND conname  = 'attendance_session_student_key'
       AND contype  = 'u'
  ) THEN
    RAISE EXCEPTION
      'Attendance write-path migration aborted before any change: attendance_session_student_key is missing; the one-record-per-pair guarantee has no mechanism.';
  END IF;

  -- The DDL-level trainer pin this body relies on for defence in depth.
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_constraint
     WHERE conrelid = 'public.attendance'::pg_catalog.regclass
       AND conname  = 'attendance_recorded_by_role_pinned_chk'
  ) THEN
    RAISE EXCEPTION
      'Attendance write-path migration aborted before any change: attendance_recorded_by_role_pinned_chk is missing.';
  END IF;

  -- `present` must still be the column default: the lazy-initialization
  -- branch below writes A-018's default by RELYING on it, not by
  -- restating it, so a changed default must abort rather than silently
  -- change what "initialized" means.
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_attrdef d
      JOIN pg_catalog.pg_attribute a ON a.attrelid = d.adrelid AND a.attnum = d.adnum
     WHERE d.adrelid = 'public.attendance'::pg_catalog.regclass
       AND a.attname = 'status'
       AND pg_catalog.pg_get_expr(d.adbin, d.adrelid) LIKE '%present%'
  ) THEN
    RAISE EXCEPTION
      'Attendance write-path migration aborted before any change: attendance.status no longer defaults to present.';
  END IF;

  -- `attendance.changed` must already be in the ratified registry. If it
  -- were not, this migration would be silently requiring an extension of
  -- the Step 7H registry, which it is expressly not authorized to make.
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
     WHERE ns.nspname = 'public' AND p.proname = 'audit_append_event'
       AND p.prosrc LIKE '%''attendance.changed''%'
  ) THEN
    RAISE EXCEPTION
      'Attendance write-path migration aborted before any change: attendance.changed is not in audit_append_event''s registry.';
  END IF;

  -- There must still be NO writing policy on attendance. If one had been
  -- added, this function would not be the only write path and the claim
  -- made in its comment would be false.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_policy
   WHERE polrelid = 'public.attendance'::pg_catalog.regclass
     AND polcmd <> 'r';
  IF v_n <> 0 THEN
    RAISE EXCEPTION
      'Attendance write-path migration aborted before any change: % non-SELECT policy(ies) exist on attendance.', v_n;
  END IF;
END;
$precondition$;

-- =====================================================================
-- attendance_set_status -- the ONLY attendance write path
-- =====================================================================
-- Authored error codes:
--   BC201  not found / not permitted -- byte-identical whether the
--          session, the student or the pair exists, or the caller simply
--          has no trainer authority over it
--   BC202  no active enrolment for this student and the session's module
--   BC203  stale state -- p_expected_status disagrees with the committed
--          record (in either direction, including its existence)
--   BC204  absent refused -- a SUBMITTED report exists for this pair;
--          A-026 makes that a governed correction, never a status flip
--   BC205  p_new_status was omitted -- there is no "leave it alone" call,
--          because a no-intent write is not an action
CREATE FUNCTION public.attendance_set_status(
  p_class_session_id uuid,
  p_student_id       uuid,
  p_expected_status  public.attendance_status,
  p_new_status       public.attendance_status,
  OUT attendance_id  uuid,
  OUT status         public.attendance_status,
  OUT initialized    boolean,
  OUT changed        boolean
)
RETURNS record
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_centre_id     uuid;
  v_module_id     uuid;
  v_enrolment_id  uuid;
  v_row_id        uuid;
  v_current       public.attendance_status;
  v_from          text;
BEGIN
  IF p_new_status IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC205',
      MESSAGE = 'attendance: a new status is required';
  END IF;

  -- 1. Identity.
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC201', MESSAGE = 'attendance: not found or not permitted';
  END IF;

  -- 2. The centre and module come from the SESSION ROW, never from the
  --    caller's request.
  SELECT cs.centre_id, cs.class_module_id
    INTO v_centre_id, v_module_id
    FROM public.class_sessions cs
   WHERE cs.id = p_class_session_id;
  IF v_centre_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC201', MESSAGE = 'attendance: not found or not permitted';
  END IF;

  -- 3. THE SINGLE active trainer membership in that centre (R-28), plus
  --    live session reach re-derived on this call. This is the one
  --    predicate that also closes management and parent.
  SELECT (pg_catalog.array_agg(m.id))[1]
    INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id
     AND m.centre_id  = v_centre_id
     AND m.role       = 'trainer'
     AND m.status     = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL OR NOT public.app_trainer_reaches_session(p_class_session_id) THEN
    RAISE EXCEPTION USING ERRCODE = 'BC201', MESSAGE = 'attendance: not found or not permitted';
  END IF;

  -- 4. The ACTIVE enrolment, resolved (never supplied). A student who is
  --    not actively enrolled in this session's module has no roster row
  --    to hold, so there is nothing to initialize and nothing to toggle.
  SELECT e.id INTO v_enrolment_id
    FROM public.enrolments e
   WHERE e.class_module_id = v_module_id
     AND e.student_id      = p_student_id
     AND e.is_active;
  IF v_enrolment_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC202',
      MESSAGE = 'attendance: no active enrolment for this student and module';
  END IF;

  -- 5. The committed record, locked. FOR UPDATE closes the read-then-
  --    write window on the existing-row path.
  SELECT a.id, a.status
    INTO v_row_id, v_current
    FROM public.attendance a
   WHERE a.class_session_id = p_class_session_id
     AND a.student_id       = p_student_id
     FOR UPDATE;

  -- 6. Compare-and-set, in both directions including existence.
  IF v_row_id IS NULL THEN
    IF p_expected_status IS NOT NULL THEN
      RAISE EXCEPTION USING ERRCODE = 'BC203', MESSAGE = 'attendance: stale state';
    END IF;
  ELSE
    IF p_expected_status IS NULL OR p_expected_status <> v_current THEN
      RAISE EXCEPTION USING ERRCODE = 'BC203', MESSAGE = 'attendance: stale state';
    END IF;
  END IF;

  -- 7. The one governed refusal (A-026). Directional: only a move TO
  --    absent is refused, and only once a version has been submitted.
  IF p_new_status = 'absent' AND EXISTS (
    SELECT 1 FROM public.reports r
     WHERE r.class_session_id = p_class_session_id
       AND r.student_id       = p_student_id
       AND r.latest_submitted_version_id IS NOT NULL
  ) THEN
    RAISE EXCEPTION USING ERRCODE = 'BC204',
      MESSAGE = 'attendance: a submitted report exists for this student and session; changing attendance to absent is a governed correction';
  END IF;

  -- 8. Materialize the A-018 default lazily, then apply the intent.
  IF v_row_id IS NULL THEN
    BEGIN
      -- `status` is deliberately OMITTED so the COLUMN DEFAULT supplies
      -- `present`: A-018's rule is enforced by the schema, and this body
      -- must not be able to drift from it.
      INSERT INTO public.attendance (
        centre_id, class_session_id, class_module_id, student_id,
        enrolment_id, recorded_by_membership_id, recorded_by_role
      ) VALUES (
        v_centre_id, p_class_session_id, v_module_id, p_student_id,
        v_enrolment_id, v_membership_id, 'trainer'
      )
      RETURNING public.attendance.id, public.attendance.status
           INTO v_row_id, v_current;
    EXCEPTION WHEN unique_violation THEN
      -- A concurrent initializing call committed first, so this caller's
      -- "no record exists" belief is now provably false. That is the
      -- SAME answer a drifted belief gets anywhere else.
      RAISE EXCEPTION USING ERRCODE = 'BC203', MESSAGE = 'attendance: stale state';
    END;
    initialized := true;
    v_from      := NULL;
  ELSE
    initialized := false;
    v_from      := v_current::text;
  END IF;

  IF v_current <> p_new_status THEN
    UPDATE public.attendance a
       SET status                    = p_new_status,
           recorded_by_membership_id = v_membership_id,
           recorded_by_role          = 'trainer',
           updated_at                = pg_catalog.now()
     WHERE a.id = v_row_id;
    v_current := p_new_status;
  END IF;

  attendance_id := v_row_id;
  status        := v_current;
  -- A call that neither created the record nor moved its status changed
  -- nothing. It is authorized, answered, and NOT audited -- A-029 records
  -- governed ACTIONS, and a confirmed no-op is not one.
  changed       := initialized OR (v_from IS DISTINCT FROM v_current::text);

  IF changed THEN
    -- Same transaction as the write, after every guard and the write
    -- itself. state_domain is the literal 'attendance'; state_from is
    -- NULL exactly when this call created the record; state_to is the
    -- FINAL committed status. Labels are generic constants -- no child
    -- name, initial, account name, email or phone number reaches a row
    -- no erasure mechanism can touch (R-30).
    PERFORM public.audit_append_event(
      v_centre_id, v_account_id, v_membership_id, 'trainer'::public.centre_membership_role,
      'attendance.changed', 'attendance', v_from, v_current::text,
      'attendance', v_row_id, 'Attendance record',
      pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object('target_type', 'student',       'target_id', p_student_id::text,       'target_label', 'Student'),
        pg_catalog.jsonb_build_object('target_type', 'class_session', 'target_id', p_class_session_id::text, 'target_label', 'Class session')
      ),
      pg_catalog.jsonb_build_object(
        'attendance_id',    v_row_id::text,
        'student_id',       p_student_id::text,
        'class_session_id', p_class_session_id::text,
        'class_module_id',  v_module_id::text,
        'enrolment_id',     v_enrolment_id::text,
        'initialized',      initialized,
        'status',           v_current::text
      )
    );
  END IF;
END;
$fn$;

COMMENT ON FUNCTION public.attendance_set_status(uuid, uuid, public.attendance_status, public.attendance_status) IS
'The ONLY attendance write path (A-018, A-026, G-04 item 3). Trainer-only: the actor is THE SINGLE active trainer membership of the caller''s account in the session''s own centre, and live reach is re-derived per call -- management (A-034) and parent are closed by that same predicate, not by a deny branch, and both receive the byte-identical BC201. Materializes A-018''s Present default LAZILY by omitting `status` from the INSERT so the column default supplies it, then applies the trainer''s intent, in one transaction, emitting EXACTLY ONE `attendance.changed` event (registry E4 -- the Step 7H registry is NOT extended) whose state_from is NULL only when this call created the record. Compare-and-set covers existence in both directions and answers every drifted belief BC203, including the loser of a concurrent initialization race on attendance_session_student_key. BC204 refuses a move to `absent` once a version has been submitted (A-026''s governed correction), directionally and only then: absence mid-cycle is ACCEPTED and this body DELETES AND UPDATES NOTHING in observations, observation_ratings, report_versions or reports, so a trainer''s work survives an attendance correction and progression is blocked by report_create''s own BC015 gate. A confirmed no-op is authorized, answered and deliberately NOT audited.';

-- ---------------------------------------------------------------------
-- Privileges. The trainer roster surface is a client caller, so this one
-- gets `authenticated` EXECUTE; every other grantee is removed first.
-- ---------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.attendance_set_status(uuid, uuid, public.attendance_status, public.attendance_status)
  FROM PUBLIC, anon, authenticated, authenticator, service_role;
GRANT EXECUTE ON FUNCTION public.attendance_set_status(uuid, uuid, public.attendance_status, public.attendance_status)
  TO authenticated;

-- ---------------------------------------------------------------------
-- Post-apply assertions.
-- ---------------------------------------------------------------------
DO $post$
DECLARE
  v_n   bigint;
  v_oid oid;
BEGIN
  SELECT p.oid INTO v_oid
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = 'attendance_set_status';
  IF v_oid IS NULL THEN
    RAISE EXCEPTION 'Attendance assertion A1 failed: attendance_set_status was not created.';
  END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public';
  IF v_n <> 37 THEN
    RAISE EXCEPTION 'Attendance assertion A2 failed: public holds % function(s); expected exactly 37 (36 + this one).', v_n;
  END IF;

  IF NOT pg_catalog.has_function_privilege('authenticated', v_oid, 'EXECUTE') THEN
    RAISE EXCEPTION 'Attendance assertion A3 failed: authenticated cannot execute attendance_set_status.';
  END IF;
  IF pg_catalog.has_function_privilege('anon', v_oid, 'EXECUTE')
     OR pg_catalog.has_function_privilege('service_role', v_oid, 'EXECUTE') THEN
    RAISE EXCEPTION 'Attendance assertion A4 failed: anon or service_role can execute attendance_set_status.';
  END IF;

  -- SECURITY DEFINER with a pinned EMPTY search_path, owned by postgres.
  -- The element is `search_path=""`, with the two quote characters --
  -- MEASURED from the live catalogue against an existing pinned function,
  -- not assumed. `search_path=` without them matches nothing and would
  -- have failed here on a correct database. This is deliberately stricter
  -- than the house `proconfig::text LIKE '%search_path=%'` idiom, which
  -- would also accept a non-empty pin such as `search_path=public`.
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
     WHERE p.oid = v_oid AND p.prosecdef
       AND p.proconfig @> ARRAY['search_path=""']
       AND pg_catalog.pg_get_userbyid(p.proowner) = 'postgres'
  ) THEN
    RAISE EXCEPTION 'Attendance assertion A5 failed: attendance_set_status is not a postgres-owned SECURITY DEFINER with search_path pinned empty.';
  END IF;

  -- The audit call is in the body, and the registry was NOT extended.
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
     WHERE p.oid = v_oid AND p.prosrc LIKE '%audit_append_event%'
       AND p.prosrc LIKE '%''attendance.changed''%'
  ) THEN
    RAISE EXCEPTION 'Attendance assertion A6 failed: the body does not append attendance.changed.';
  END IF;
  -- DISTINCT, and the value is RE-DERIVED FROM THE LIVE CATALOGUE rather
  -- than transcribed: `membership.bootstrap` legitimately appears TWICE in
  -- that body (once in v_registry, once in v_system_only), so the raw
  -- match count is 17 and only the distinct count is 16. Asserting the raw
  -- count would have aborted this migration on a correct database -- which
  -- is exactly why it was measured before being asserted.
  SELECT pg_catalog.count(DISTINCT m[1]) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace,
    LATERAL pg_catalog.regexp_matches(p.prosrc, '''[a-z_]+\.[a-z_]+''', 'g') AS m
   WHERE ns.nspname = 'public' AND p.proname = 'audit_append_event';
  IF v_n <> 16 THEN
    RAISE EXCEPTION 'Attendance assertion A7 failed: the Step 7H action registry now reads % distinct action string(s); it must remain exactly 16.', v_n;
  END IF;

  -- This body must not be able to destroy a trainer's work.
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
     WHERE p.oid = v_oid
       AND p.prosrc ~ '(?i)(delete\s+from|truncate)'
  ) THEN
    RAISE EXCEPTION 'Attendance assertion A8 failed: the body contains a DELETE or TRUNCATE.';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
     WHERE p.oid = v_oid
       AND p.prosrc ~ '(?i)update\s+public\.(observations|observation_ratings|report_versions|report_version_ratings|reports)'
  ) THEN
    RAISE EXCEPTION 'Attendance assertion A9 failed: the body writes to an assessment or report table.';
  END IF;

  -- Attendance still has no writing policy: this really is the only path.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_policy
   WHERE polrelid = 'public.attendance'::pg_catalog.regclass
     AND polcmd <> 'r';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Attendance assertion A10 failed: % non-SELECT policy(ies) exist on attendance.', v_n;
  END IF;

  -- No table privilege was granted to any client role by this migration.
  IF pg_catalog.has_table_privilege('authenticated', 'public.attendance', 'INSERT')
     OR pg_catalog.has_table_privilege('authenticated', 'public.attendance', 'UPDATE')
     OR pg_catalog.has_table_privilege('authenticated', 'public.attendance', 'DELETE') THEN
    RAISE EXCEPTION 'Attendance assertion A11 failed: authenticated holds DML privilege on attendance.';
  END IF;

  -- The two-value enum is untouched: no third attendance state.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_enum e
    JOIN pg_catalog.pg_type t ON t.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace ns ON ns.oid = t.typnamespace
   WHERE ns.nspname = 'public' AND t.typname = 'attendance_status';
  IF v_n <> 2 THEN
    RAISE EXCEPTION 'Attendance assertion A12 failed: attendance_status holds % label(s); expected exactly 2.', v_n;
  END IF;

  RAISE NOTICE 'Attendance write path: A1-A12 asserted. 1 function, 1 grant, registry still 16, no policy, no DML privilege, no third state.';
END;
$post$;
