-- =====================================================================
-- B.E.S.T Coach — Step 7F: local synthetic domain fixtures
-- =====================================================================
-- LOCAL DISPOSABLE DEVELOPMENT DATABASE ONLY. Never applied to a hosted
-- or shared database. Synthetic data only (ADR-6): no real child, parent,
-- trainer, academy, name or contact detail appears anywhere in this file.
--
-- Governing authority (highest first):
--   Specification v3 -> Amendment 001 -> Amendment 002 -> Amendment 003
--   -> CLAUDE.md -> Implementation Plan
--     -> docs/plan/STEP_7F_SYNTHETIC_FIXTURE_BASELINE.md (ratified 2026-08-03)
--
-- This file is STATIC. It is never generated, templated or concatenated
-- from user input, a password or a credential. The loader selects one of
-- two operations by setting two psql booleans:
--
--   -v do_cleanup=true  -v do_load=false   -> bounded fixture-domain cleanup
--   -v do_cleanup=false -v do_load=true    -> fixture-domain load
--
-- The loader always defines BOTH variables, so no \if sees an undefined
-- variable.
--
-- Ratified footprint: 25 application-domain rows (15 core + 10 assessment).
-- Auth users are created ONLY through the local Auth Admin API by the
-- loader. This file NEVER writes to auth.users -- it only references the
-- three ratified Auth UUIDs through accounts.auth_user_id.
--
-- Deliberately NOT created here (A-032 owners in brackets):
--   reports, report_versions, report_version_ratings,
--   report_version_checklist_progress, report_version_approvals  [7I]
--   invitations [7I]  ·  audit rows [7H]  ·  evidence rows  ·  AI rows
-- =====================================================================

\set ON_ERROR_STOP on

-- ---------------------------------------------------------------------
-- Operation-selection guard
-- ---------------------------------------------------------------------
-- Exactly ONE operation must be selected. Selecting both, or neither,
-- aborts before any statement runs -- so cleanup and load can never run
-- together by accident, only by a deliberate two-step invocation from the
-- loader (which is what `--reload` does, as two separate psql runs).
--
-- The combination is tested with psql \if meta-commands, exactly as the two
-- operation bodies below are. This is not a style choice: psql does NOT
-- substitute :variables inside a dollar-quoted string, so a `:'do_cleanup'`
-- written inside a DO block reaches the server verbatim and fails as a
-- syntax error at the leading colon. The DO blocks here therefore contain
-- no variable reference at all -- psql decides the combination is invalid,
-- and the block it reaches does nothing but raise.

\if :do_cleanup
\if :do_load
DO $operation_guard$
BEGIN
  RAISE EXCEPTION 'Step 7F: cleanup and load must not be selected in the same invocation';
END;
$operation_guard$;
\endif
\else
\if :do_load
\else
DO $operation_guard$
BEGIN
  RAISE EXCEPTION 'Step 7F: no operation was selected (set exactly one of do_cleanup / do_load to true)';
END;
$operation_guard$;
\endif
\endif

-- =====================================================================
-- OPERATION 1 -- Bounded fixture-domain cleanup
-- =====================================================================
-- Deletes EXACTLY the ratified fixture UUIDs, in reverse foreign-key
-- order. Every inter-table FK in the fixture graph is ON DELETE RESTRICT,
-- so this order is mandatory rather than stylistic.
--
-- There is no TRUNCATE, no CASCADE, no centre-wide predicate and no broad
-- predicate anywhere below: every statement enumerates fixed literal ids.
-- The Step 7E seed tables (centres, class_grades, assessment_dimensions)
-- appear in NO delete statement at all, and their exact boundary is
-- re-asserted before COMMIT.

\if :do_cleanup

BEGIN;

DELETE FROM public.observation_ratings WHERE id IN (
  'ca000000-0000-4000-8000-000000000001',
  'ca000000-0000-4000-8000-000000000002',
  'ca000000-0000-4000-8000-000000000003',
  'ca000000-0000-4000-8000-000000000004',
  'ca000000-0000-4000-8000-000000000005',
  'ca000000-0000-4000-8000-000000000006',
  'ca000000-0000-4000-8000-000000000007',
  'ca000000-0000-4000-8000-000000000008',
  'ca000000-0000-4000-8000-000000000009'
);

DELETE FROM public.observations               WHERE id = 'c9000000-0000-4000-8000-000000000001';
DELETE FROM public.attendance                 WHERE id = 'c8000000-0000-4000-8000-000000000001';
DELETE FROM public.class_session_assignments  WHERE id = 'c7000000-0000-4000-8000-000000000001';
DELETE FROM public.enrolments                 WHERE id = 'c6000000-0000-4000-8000-000000000001';
DELETE FROM public.class_sessions             WHERE id = 'c5000000-0000-4000-8000-000000000001';
DELETE FROM public.class_modules              WHERE id = 'c4000000-0000-4000-8000-000000000001';
DELETE FROM public.parent_student_links       WHERE id = 'c3000000-0000-4000-8000-000000000001';
DELETE FROM public.students                   WHERE id = 'c2000000-0000-4000-8000-000000000001';
DELETE FROM public.parent_profiles            WHERE membership_id = 'c1000000-0000-4000-8000-000000000003';
DELETE FROM public.trainer_profiles           WHERE membership_id = 'c1000000-0000-4000-8000-000000000002';

DELETE FROM public.centre_memberships WHERE id IN (
  'c1000000-0000-4000-8000-000000000001',
  'c1000000-0000-4000-8000-000000000002',
  'c1000000-0000-4000-8000-000000000003'
);

DELETE FROM public.accounts WHERE id IN (
  'c0000000-0000-4000-8000-000000000001',
  'c0000000-0000-4000-8000-000000000002',
  'c0000000-0000-4000-8000-000000000003'
);

-- Step 7E seed boundary must survive the cleanup exactly. Any divergence
-- aborts the transaction rather than being silently accepted.
DO $cleanup_seed_guard$
DECLARE
  v_centres    integer;
  v_grades     integer;
  v_dimensions integer;
  v_fixture    integer;
BEGIN
  SELECT count(*) INTO v_centres    FROM public.centres;
  SELECT count(*) INTO v_grades     FROM public.class_grades;
  SELECT count(*) INTO v_dimensions FROM public.assessment_dimensions;

  IF v_centres <> 1 OR v_grades <> 3 OR v_dimensions <> 9 THEN
    RAISE EXCEPTION
      'Step 7F cleanup aborted: Step 7E seed boundary diverged (centres=%, class_grades=%, assessment_dimensions=%; expected 1/3/9)',
      v_centres, v_grades, v_dimensions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.centres
    WHERE id = 'b0000000-0000-4000-8000-000000000001'
      AND code = 'ispeak'
      AND display_name = 'iSpeak Academy'
  ) THEN
    RAISE EXCEPTION 'Step 7F cleanup aborted: the ratified seed centre (ispeak / iSpeak Academy) is missing or altered';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.class_grades
    WHERE id = 'b1000000-0000-4000-8000-000000000001'
      AND centre_id = 'b0000000-0000-4000-8000-000000000001'
      AND code = 'beginner'
  ) THEN
    RAISE EXCEPTION 'Step 7F cleanup aborted: the ratified seed Class Grade (beginner) is missing or altered';
  END IF;

  -- Every fixture row must now be gone.
  SELECT
      (SELECT count(*) FROM public.accounts                  WHERE id::text LIKE 'c0000000-%')
    + (SELECT count(*) FROM public.centre_memberships        WHERE id::text LIKE 'c1000000-%')
    + (SELECT count(*) FROM public.students                  WHERE id::text LIKE 'c2000000-%')
    + (SELECT count(*) FROM public.parent_student_links      WHERE id::text LIKE 'c3000000-%')
    + (SELECT count(*) FROM public.class_modules             WHERE id::text LIKE 'c4000000-%')
    + (SELECT count(*) FROM public.class_sessions            WHERE id::text LIKE 'c5000000-%')
    + (SELECT count(*) FROM public.enrolments                WHERE id::text LIKE 'c6000000-%')
    + (SELECT count(*) FROM public.class_session_assignments WHERE id::text LIKE 'c7000000-%')
    + (SELECT count(*) FROM public.attendance                WHERE id::text LIKE 'c8000000-%')
    + (SELECT count(*) FROM public.observations              WHERE id::text LIKE 'c9000000-%')
    + (SELECT count(*) FROM public.observation_ratings       WHERE id::text LIKE 'ca000000-%')
    + (SELECT count(*) FROM public.trainer_profiles          WHERE membership_id::text LIKE 'c1000000-%')
    + (SELECT count(*) FROM public.parent_profiles           WHERE membership_id::text LIKE 'c1000000-%')
    INTO v_fixture;

  IF v_fixture <> 0 THEN
    RAISE EXCEPTION 'Step 7F cleanup aborted: % fixture row(s) still present after deletion', v_fixture;
  END IF;

  RAISE NOTICE 'Step 7F cleanup: fixture rows removed; Step 7E seed boundary intact (1 centre, 3 grades, 9 dimensions).';
END;
$cleanup_seed_guard$;

COMMIT;

\endif

-- =====================================================================
-- OPERATION 2 -- Fixture-domain load (exactly 25 rows)
-- =====================================================================
-- Every UUID and every timestamp is a FIXED LITERAL, so two loads
-- separated by a clean reset produce byte-identical rows.
--
-- Timestamp bands (chronologically ordered so every lifecycle CHECK is
-- satisfied without reference to now()):
--   T1 2026-01-05 09:00:00+08  identities, memberships, profiles, student
--   T2 2026-01-12 09:00:00+08  link, module, session, enrolment, assignment
--   T3 2026-02-03 10:00:00+08  attendance (roster initialisation)
--   T4 2026-02-03 11:05:00+08  observation and its nine ratings

\if :do_load

BEGIN;

-- ---------------------------------------------------------------------
-- 1/13 -- accounts (3)
-- ---------------------------------------------------------------------
-- auth_user_id is populated INLINE with the ratified Auth UUIDs, which the
-- loader has already created through the local Auth Admin API. This file
-- never inserts into auth.users.
INSERT INTO public.accounts
  (id, auth_user_id, display_name, normalized_email, status, created_at, updated_at, deactivated_at)
VALUES
  ('c0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001',
   'Fixture Manager One', 'management.fixture@example.test', 'active',
   '2026-01-05 09:00:00+08', '2026-01-05 09:00:00+08', NULL),
  ('c0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000002',
   'Fixture Trainer One', 'trainer.fixture@example.test', 'active',
   '2026-01-05 09:00:00+08', '2026-01-05 09:00:00+08', NULL),
  ('c0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000003',
   'Fixture Parent One', 'parent.fixture@example.test', 'active',
   '2026-01-05 09:00:00+08', '2026-01-05 09:00:00+08', NULL);

-- ---------------------------------------------------------------------
-- 2/13 -- centre_memberships (3) -- the SOLE authority for role
-- ---------------------------------------------------------------------
INSERT INTO public.centre_memberships
  (id, account_id, centre_id, role, status, created_at, updated_at, activated_at, deactivated_at)
VALUES
  ('c1000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001',
   'b0000000-0000-4000-8000-000000000001', 'management', 'active',
   '2026-01-05 09:00:00+08', '2026-01-05 09:00:00+08', '2026-01-05 09:00:00+08', NULL),
  ('c1000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000002',
   'b0000000-0000-4000-8000-000000000001', 'trainer', 'active',
   '2026-01-05 09:00:00+08', '2026-01-05 09:00:00+08', '2026-01-05 09:00:00+08', NULL),
  ('c1000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000003',
   'b0000000-0000-4000-8000-000000000001', 'parent', 'active',
   '2026-01-05 09:00:00+08', '2026-01-05 09:00:00+08', '2026-01-05 09:00:00+08', NULL);

-- ---------------------------------------------------------------------
-- 3/13 -- trainer_profiles (1) -- role-pinned by composite FK
-- ---------------------------------------------------------------------
INSERT INTO public.trainer_profiles
  (membership_id, centre_id, membership_role, created_at, updated_at)
VALUES
  ('c1000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'trainer',
   '2026-01-05 09:00:00+08', '2026-01-05 09:00:00+08');

-- ---------------------------------------------------------------------
-- 4/13 -- parent_profiles (1)
-- ---------------------------------------------------------------------
-- There is deliberately NO management profile row: no management_profiles
-- table exists (A-025 places role authority on the membership itself).
INSERT INTO public.parent_profiles
  (membership_id, centre_id, membership_role, created_at, updated_at)
VALUES
  ('c1000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 'parent',
   '2026-01-05 09:00:00+08', '2026-01-05 09:00:00+08');

-- ---------------------------------------------------------------------
-- 5/13 -- students (1) -- a domain subject, never a login
-- ---------------------------------------------------------------------
INSERT INTO public.students
  (id, centre_id, full_name, is_active, created_at, updated_at, deactivated_at)
VALUES
  ('c2000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
   'Fixture Student One', true,
   '2026-01-05 09:00:00+08', '2026-01-05 09:00:00+08', NULL);

-- ---------------------------------------------------------------------
-- 6/13 -- parent_student_links (1) -- the live source of parent access
-- ---------------------------------------------------------------------
INSERT INTO public.parent_student_links
  (id, centre_id, parent_membership_id, parent_role, student_id, is_active, linked_at, unlinked_at, created_at)
VALUES
  ('c3000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
   'c1000000-0000-4000-8000-000000000003', 'parent',
   'c2000000-0000-4000-8000-000000000001', true,
   '2026-01-12 09:00:00+08', NULL, '2026-01-12 09:00:00+08');

-- ---------------------------------------------------------------------
-- 7/13 -- class_modules (1) -- under the seeded `beginner` Class Grade
-- ---------------------------------------------------------------------
INSERT INTO public.class_modules
  (id, centre_id, class_grade_id, title, is_active, created_at, updated_at, deactivated_at)
VALUES
  ('c4000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
   'b1000000-0000-4000-8000-000000000001',
   'Beginner Public Speaking — Fixture Module A', true,
   '2026-01-12 09:00:00+08', '2026-01-12 09:00:00+08', NULL);

-- ---------------------------------------------------------------------
-- 8/13 -- class_sessions (1) -- the only calendar source
-- ---------------------------------------------------------------------
-- The date is a fixed literal in the past, never derived from now(): a
-- future-dated session would be blocked by the Step 7I future-session lock.
INSERT INTO public.class_sessions
  (id, centre_id, class_module_id, session_date, starts_at, ends_at, created_at, updated_at)
VALUES
  ('c5000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
   'c4000000-0000-4000-8000-000000000001',
   DATE '2026-02-03', TIME '10:00', TIME '11:00',
   '2026-01-12 09:00:00+08', '2026-01-12 09:00:00+08');

-- ---------------------------------------------------------------------
-- 9/13 -- enrolments (1) -- students enrol at CLASS MODULE level (A-016)
-- ---------------------------------------------------------------------
INSERT INTO public.enrolments
  (id, centre_id, class_module_id, student_id, is_active, enrolled_at, withdrawn_at, created_at)
VALUES
  ('c6000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
   'c4000000-0000-4000-8000-000000000001', 'c2000000-0000-4000-8000-000000000001',
   true, '2026-01-12 09:00:00+08', NULL, '2026-01-12 09:00:00+08');

-- ---------------------------------------------------------------------
-- 10/13 -- class_session_assignments (1) -- authoritative at SESSION level
-- ---------------------------------------------------------------------
INSERT INTO public.class_session_assignments
  (id, centre_id, class_session_id, trainer_membership_id, trainer_role,
   is_active, assigned_at, unassigned_at, created_at)
VALUES
  ('c7000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
   'c5000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002', 'trainer',
   true, '2026-01-12 09:00:00+08', NULL, '2026-01-12 09:00:00+08');

-- ---------------------------------------------------------------------
-- 11/13 -- attendance (1) -- Present by default (A-018)
-- ---------------------------------------------------------------------
-- recorded_by_membership_id and recorded_by_role are BOTH NULL because
-- this row represents default roster initialisation, not a trainer action.
-- Naming a trainer here would fabricate an action that never occurred.
INSERT INTO public.attendance
  (id, centre_id, class_session_id, class_module_id, student_id, enrolment_id,
   status, recorded_by_membership_id, recorded_by_role, created_at, updated_at)
VALUES
  ('c8000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
   'c5000000-0000-4000-8000-000000000001', 'c4000000-0000-4000-8000-000000000001',
   'c2000000-0000-4000-8000-000000000001', 'c6000000-0000-4000-8000-000000000001',
   'present', NULL, NULL,
   '2026-02-03 10:00:00+08', '2026-02-03 10:00:00+08');

-- ---------------------------------------------------------------------
-- 12/13 -- observations (1) -- captured factual data, no status of any kind
-- ---------------------------------------------------------------------
-- lock_version stays at 1: no governed compare-and-set has been performed.
-- Chips are empty defaults and every free-text field is NULL, because no
-- proof requires them and inventing trainer prose would be fabrication.
INSERT INTO public.observations
  (id, centre_id, class_session_id, class_module_id, student_id, enrolment_id,
   trainer_membership_id, trainer_role,
   strength_chips, focus_chips, observation_notes, follow_up_notes, term_evidence_notes,
   lock_version, created_at, updated_at)
VALUES
  ('c9000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
   'c5000000-0000-4000-8000-000000000001', 'c4000000-0000-4000-8000-000000000001',
   'c2000000-0000-4000-8000-000000000001', 'c6000000-0000-4000-8000-000000000001',
   'c1000000-0000-4000-8000-000000000002', 'trainer',
   '{}', '{}', NULL, NULL, NULL,
   1, '2026-02-03 11:05:00+08', '2026-02-03 11:05:00+08');

-- ---------------------------------------------------------------------
-- 13/13 -- observation_ratings (9) -- all nine dimensions, deliberately mixed
-- ---------------------------------------------------------------------
-- Spans all four levels and includes exactly two `emerging` and two
-- `advanced`, so the Phase 1 grounding-validation contradiction test
-- (CLAUDE.md 11, persona 3.4) has a genuine contradiction available.
INSERT INTO public.observation_ratings
  (id, observation_id, dimension_code, rating, created_at, updated_at)
VALUES
  ('ca000000-0000-4000-8000-000000000001', 'c9000000-0000-4000-8000-000000000001',
   'body',                 'secure',     '2026-02-03 11:05:00+08', '2026-02-03 11:05:00+08'),
  ('ca000000-0000-4000-8000-000000000002', 'c9000000-0000-4000-8000-000000000001',
   'emotion',              'developing', '2026-02-03 11:05:00+08', '2026-02-03 11:05:00+08'),
  ('ca000000-0000-4000-8000-000000000003', 'c9000000-0000-4000-8000-000000000001',
   'speech',               'emerging',   '2026-02-03 11:05:00+08', '2026-02-03 11:05:00+08'),
  ('ca000000-0000-4000-8000-000000000004', 'c9000000-0000-4000-8000-000000000001',
   'tonality',             'secure',     '2026-02-03 11:05:00+08', '2026-02-03 11:05:00+08'),
  ('ca000000-0000-4000-8000-000000000005', 'c9000000-0000-4000-8000-000000000001',
   'eye_contact',          'advanced',   '2026-02-03 11:05:00+08', '2026-02-03 11:05:00+08'),
  ('ca000000-0000-4000-8000-000000000006', 'c9000000-0000-4000-8000-000000000001',
   'vocal_projection',     'developing', '2026-02-03 11:05:00+08', '2026-02-03 11:05:00+08'),
  ('ca000000-0000-4000-8000-000000000007', 'c9000000-0000-4000-8000-000000000001',
   'emotional_expression', 'emerging',   '2026-02-03 11:05:00+08', '2026-02-03 11:05:00+08'),
  ('ca000000-0000-4000-8000-000000000008', 'c9000000-0000-4000-8000-000000000001',
   'sentence_flow',        'secure',     '2026-02-03 11:05:00+08', '2026-02-03 11:05:00+08'),
  ('ca000000-0000-4000-8000-000000000009', 'c9000000-0000-4000-8000-000000000001',
   'audience_awareness',   'advanced',   '2026-02-03 11:05:00+08', '2026-02-03 11:05:00+08');

-- ---------------------------------------------------------------------
-- Pre-commit assertions -- exact counts, exact relationships, exact
-- absences. Any mismatch aborts the transaction.
-- ---------------------------------------------------------------------
DO $load_guard$
DECLARE
  v_total   integer;
  v_ratings integer;
  v_levels  integer;
BEGIN
  -- Exactly 25 fixture domain rows across the 13 target tables.
  SELECT
      (SELECT count(*) FROM public.accounts                  WHERE id::text LIKE 'c0000000-%')
    + (SELECT count(*) FROM public.centre_memberships        WHERE id::text LIKE 'c1000000-%')
    + (SELECT count(*) FROM public.trainer_profiles          WHERE membership_id::text LIKE 'c1000000-%')
    + (SELECT count(*) FROM public.parent_profiles           WHERE membership_id::text LIKE 'c1000000-%')
    + (SELECT count(*) FROM public.students                  WHERE id::text LIKE 'c2000000-%')
    + (SELECT count(*) FROM public.parent_student_links      WHERE id::text LIKE 'c3000000-%')
    + (SELECT count(*) FROM public.class_modules             WHERE id::text LIKE 'c4000000-%')
    + (SELECT count(*) FROM public.class_sessions            WHERE id::text LIKE 'c5000000-%')
    + (SELECT count(*) FROM public.enrolments                WHERE id::text LIKE 'c6000000-%')
    + (SELECT count(*) FROM public.class_session_assignments WHERE id::text LIKE 'c7000000-%')
    + (SELECT count(*) FROM public.attendance                WHERE id::text LIKE 'c8000000-%')
    + (SELECT count(*) FROM public.observations              WHERE id::text LIKE 'c9000000-%')
    + (SELECT count(*) FROM public.observation_ratings       WHERE id::text LIKE 'ca000000-%')
    INTO v_total;

  IF v_total <> 25 THEN
    RAISE EXCEPTION 'Step 7F load aborted: expected exactly 25 fixture domain rows, found %', v_total;
  END IF;

  -- Exactly nine ratings, one per dimension, spanning all four levels.
  SELECT count(*), count(DISTINCT rating)
    INTO v_ratings, v_levels
    FROM public.observation_ratings
   WHERE observation_id = 'c9000000-0000-4000-8000-000000000001';

  IF v_ratings <> 9 THEN
    RAISE EXCEPTION 'Step 7F load aborted: expected exactly 9 observation ratings, found %', v_ratings;
  END IF;

  IF v_levels <> 4 THEN
    RAISE EXCEPTION 'Step 7F load aborted: expected all four rating levels represented, found % distinct', v_levels;
  END IF;

  IF (SELECT count(*) FROM public.observation_ratings
       WHERE observation_id = 'c9000000-0000-4000-8000-000000000001'
         AND rating = 'emerging') < 1
     OR (SELECT count(*) FROM public.observation_ratings
          WHERE observation_id = 'c9000000-0000-4000-8000-000000000001'
            AND rating = 'advanced') < 1 THEN
    RAISE EXCEPTION 'Step 7F load aborted: the mixed rating set must include at least one emerging and one advanced rating';
  END IF;

  IF (SELECT count(DISTINCT dimension_code) FROM public.observation_ratings
       WHERE observation_id = 'c9000000-0000-4000-8000-000000000001') <> 9 THEN
    RAISE EXCEPTION 'Step 7F load aborted: the nine ratings must cover nine distinct dimensions';
  END IF;

  -- Every fixture row belongs to the single seeded centre.
  IF EXISTS (SELECT 1 FROM public.centre_memberships        WHERE id::text LIKE 'c1000000-%' AND centre_id <> 'b0000000-0000-4000-8000-000000000001')
  OR EXISTS (SELECT 1 FROM public.students                  WHERE id::text LIKE 'c2000000-%' AND centre_id <> 'b0000000-0000-4000-8000-000000000001')
  OR EXISTS (SELECT 1 FROM public.parent_student_links      WHERE id::text LIKE 'c3000000-%' AND centre_id <> 'b0000000-0000-4000-8000-000000000001')
  OR EXISTS (SELECT 1 FROM public.class_modules             WHERE id::text LIKE 'c4000000-%' AND centre_id <> 'b0000000-0000-4000-8000-000000000001')
  OR EXISTS (SELECT 1 FROM public.class_sessions            WHERE id::text LIKE 'c5000000-%' AND centre_id <> 'b0000000-0000-4000-8000-000000000001')
  OR EXISTS (SELECT 1 FROM public.enrolments                WHERE id::text LIKE 'c6000000-%' AND centre_id <> 'b0000000-0000-4000-8000-000000000001')
  OR EXISTS (SELECT 1 FROM public.class_session_assignments WHERE id::text LIKE 'c7000000-%' AND centre_id <> 'b0000000-0000-4000-8000-000000000001')
  OR EXISTS (SELECT 1 FROM public.attendance                WHERE id::text LIKE 'c8000000-%' AND centre_id <> 'b0000000-0000-4000-8000-000000000001')
  OR EXISTS (SELECT 1 FROM public.observations              WHERE id::text LIKE 'c9000000-%' AND centre_id <> 'b0000000-0000-4000-8000-000000000001') THEN
    RAISE EXCEPTION 'Step 7F load aborted: a fixture row references a centre other than the seeded centre';
  END IF;

  -- Exactly one active management membership, and one active membership
  -- per (account, centre).
  IF (SELECT count(*) FROM public.centre_memberships
       WHERE centre_id = 'b0000000-0000-4000-8000-000000000001'
         AND role = 'management' AND status = 'active') <> 1 THEN
    RAISE EXCEPTION 'Step 7F load aborted: exactly one active management membership is required';
  END IF;

  -- All three accounts must be linked to their ratified Auth UUIDs.
  IF (SELECT count(*) FROM public.accounts
       WHERE id::text LIKE 'c0000000-%' AND auth_user_id IS NOT NULL) <> 3 THEN
    RAISE EXCEPTION 'Step 7F load aborted: all three fixture accounts must carry a linked auth_user_id';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE id = 'c0000000-0000-4000-8000-000000000001' AND auth_user_id = 'd0000000-0000-4000-8000-000000000001')
  OR NOT EXISTS (SELECT 1 FROM public.accounts WHERE id = 'c0000000-0000-4000-8000-000000000002' AND auth_user_id = 'd0000000-0000-4000-8000-000000000002')
  OR NOT EXISTS (SELECT 1 FROM public.accounts WHERE id = 'c0000000-0000-4000-8000-000000000003' AND auth_user_id = 'd0000000-0000-4000-8000-000000000003') THEN
    RAISE EXCEPTION 'Step 7F load aborted: account-to-Auth linkage does not match the ratified deterministic UUIDs';
  END IF;

  -- Attendance is default-initialised Present, with no recorded actor.
  IF NOT EXISTS (
    SELECT 1 FROM public.attendance
    WHERE id = 'c8000000-0000-4000-8000-000000000001'
      AND status = 'present'
      AND recorded_by_membership_id IS NULL
      AND recorded_by_role IS NULL
  ) THEN
    RAISE EXCEPTION 'Step 7F load aborted: attendance must be present with both recorder fields NULL';
  END IF;

  -- The observation must be untouched by any governed transition.
  IF NOT EXISTS (
    SELECT 1 FROM public.observations
    WHERE id = 'c9000000-0000-4000-8000-000000000001'
      AND lock_version = 1
      AND observation_notes IS NULL
      AND follow_up_notes IS NULL
      AND term_evidence_notes IS NULL
      AND cardinality(strength_chips) = 0
      AND cardinality(focus_chips) = 0
  ) THEN
    RAISE EXCEPTION 'Step 7F load aborted: the observation must be at lock_version 1 with empty chips and NULL notes';
  END IF;

  -- Option B boundary: the governed report lifecycle is NOT entered, and
  -- no invitation is fabricated.
  IF (SELECT count(*) FROM public.reports) <> 0
  OR (SELECT count(*) FROM public.report_versions) <> 0
  OR (SELECT count(*) FROM public.report_version_ratings) <> 0
  OR (SELECT count(*) FROM public.report_version_checklist_progress) <> 0
  OR (SELECT count(*) FROM public.report_version_approvals) <> 0
  OR (SELECT count(*) FROM public.invitations) <> 0 THEN
    RAISE EXCEPTION 'Step 7F load aborted: Option B requires reports, report versions, ratings, checklist progress, approvals and invitations to remain empty';
  END IF;

  -- The Step 7E seed boundary is untouched by the load.
  IF (SELECT count(*) FROM public.centres) <> 1
  OR (SELECT count(*) FROM public.class_grades) <> 3
  OR (SELECT count(*) FROM public.assessment_dimensions) <> 9 THEN
    RAISE EXCEPTION 'Step 7F load aborted: the Step 7E seed boundary (1 centre, 3 grades, 9 dimensions) diverged';
  END IF;

  RAISE NOTICE 'Step 7F load: 25 fixture domain rows inserted; Option B boundary and Step 7E seed boundary both intact.';
END;
$load_guard$;

COMMIT;

\endif
