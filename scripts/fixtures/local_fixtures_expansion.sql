-- =====================================================================
-- P1-T09a — ADDITIVE FIXTURE EXPANSION
-- =====================================================================
-- Authority: CLAUDE.md §11, verbatim — the broader fixture shape
-- ("2 trainers, 2 class modules, 3-4 enrolled students per module,
-- 2 parent accounts, and a second Class Session for previous-focus
-- continuity") is "deferred, not deleted ... required as a later ADDITIVE
-- FIXTURE EXPANSION before the Phase 1 grounding-validation contradiction
-- proof ... and the session-to-session continuity proof can be
-- demonstrated. Do not treat the Step 7F minimum as the final fixture."
-- Plan task: FINAL_MVP_EXECUTION_PLAN.md P1-T09a.
--
-- ---------------------------------------------------------------------
-- WHY THIS IS A SEPARATE FILE AND NOT AN EDIT TO local_fixtures.sql
-- ---------------------------------------------------------------------
-- local_fixtures.sql is the RATIFIED Step 7F minimum
-- (docs/plan/STEP_7F_SYNTHETIC_FIXTURE_BASELINE.md). Its load path is
-- ONE transaction inserting exactly 25 rows, it contains no ON CONFLICT
-- anywhere, and its own load guard asserts "expected exactly 25 fixture
-- domain rows". Growing that file in place would (a) mutate a ratified
-- artefact whose exact inventory is a §12 stop-and-ask, and (b) make the
-- expansion unappliable to an ALREADY-LOADED database without a full
-- reload, which needs the Operator's three interactive no-echo passwords.
--
-- This file is therefore strictly additive and independently appliable.
--
-- ---------------------------------------------------------------------
-- THE UUID FAMILY IS DELIBERATELY DISJOINT — THIS IS THE WHOLE DESIGN
-- ---------------------------------------------------------------------
-- The canonical fixture checksum is PREFIX-SCOPED, not whole-table: every
-- branch of the digest in verify-local-fixtures.sql filters on
-- `id::text LIKE 'cN000000-%'` (ords 1-13) or on the three reserved
-- fixture emails (ord 0). Rows outside those prefixes are INVISIBLE to it.
--
-- So this file uses a disjoint family — e2 students · e4 modules ·
-- e5 sessions · e6 enrolments · e7 assignments · e8 attendance ·
-- e9 observations · ea ratings — and the
-- consequence is that the canonical 28-row region and its three pinned
-- checksums (run-canonical.mjs, disposable-stack.mjs, run-f17.mjs) are
-- BYTE-UNCHANGED by this expansion. That is not a happy accident; it is
-- why the family was chosen. `ce%` is deliberately avoided: the verifier's
-- Section C negative tests own that prefix and D2 asserts none survives.
--
-- ---------------------------------------------------------------------
-- NO ACCOUNT, MEMBERSHIP OR PROFILE ROW IS CREATED — AND THAT LIMIT IS
-- DELIBERATE, MEASURED, AND NOT A SHORTCUT
-- ---------------------------------------------------------------------
-- CLAUDE.md §11 is absolute: a fixture password may be entered ONLY
-- through no-echo interactive stdin at an Operator-controlled terminal.
-- There is no environment-variable path, no file path and no chat path,
-- so an unattended session CANNOT create a fourth or fifth Auth identity.
--
-- The obvious workaround — a second trainer/parent `accounts` row with
-- `auth_user_id = NULL` — is schema-legal (the column is nullable by
-- design, Amendment 003 A-025, and asm-suite.sql already builds exactly
-- such a trainer inside its own scaffold). IT WAS BUILT, APPLIED, AND
-- THEN DELIBERATELY REVERTED, because measuring the result showed it
-- broke something that must not be broken:
--
--   scripts/physical-test/disposable-stack.mjs:1278-1291 requires the
--   stack to hold EXACTLY `DISPOSABLE_IDENTITIES.length` accounts and
--   asserts `accountsWithoutAuthId === 0`. Two NULL-auth accounts in the
--   canonical fixture propagate into every disposable clone and fail
--   both checks — which would have silently disarmed
--   prove-disposable-identity-linkage.mjs.
--
-- That proof is Operator-owned and credential-gated: its real
-- `signInWithPassword` leg is NOT-RUN in every autonomous run, and the
-- standing instruction is that it stays NOT-RUN and must NOT be weakened
-- or worked around. Re-scoping its checks to tolerate extra accounts
-- would have removed a genuine property ("no account exists without an
-- Auth identity") to make an unrelated fixture change fit. That is the
-- wrong trade, so the fixture change gave way instead.
--
-- ⚠️ CONSEQUENCE, RECORDED HONESTLY AND NOT PAPERED OVER: this file does
-- NOT deliver the "2 trainers" and "2 parent accounts" limbs of
-- CLAUDE.md §11's shape. Those two limbs are meaningful only with real
-- Auth identities behind them, and creating those is OPERATOR-GATED
-- work. They remain DEFERRED, NOT DELETED — exactly the status §11
-- itself assigns them — and are recorded as outstanding rather than
-- quietly marked done. Every other limb of the §11 shape (2 class
-- modules, 3 enrolled students per module, a second Class Session for
-- previous-focus continuity) IS delivered here.
--
-- All three sessions below are therefore assigned to the RATIFIED
-- trainer membership, which is the only trainer with an Auth identity
-- and so the only one a governed run can act as.
--
-- Keeping auth.users at exactly 3 and the account set untouched is also
-- what preserves lifecycle-canonical.sql's `auth.users <> 3` assertion,
-- run-f17.mjs's identity preflight, and disposable-stack.mjs's
-- `authUsers !== 3` and identity-linkage checks.
--
-- ---------------------------------------------------------------------
-- WHAT THIS EXPANSION MAKES DEMONSTRABLE
-- ---------------------------------------------------------------------
--   * CLAUDE.md §10 Phase 1 EXIT CONDITION (c) — "a session's follow-up
--     note appears as the next session's previous focus". Sessions
--     e5…-01 and e5…-02 are the SAME module and the SAME enrolled
--     students, in date order, and e9…-01 on the earlier session carries
--     a non-null `follow_up_notes`. The ratified minimum could not
--     demonstrate this: it holds ONE session, and its single observation
--     has `follow_up_notes = NULL`.
--   * PARENT ISOLATION with a real negative subject. The ratified parent
--     is linked to exactly one student and is linked to NONE of the six
--     students here, so "a parent cannot read an unlinked learner's
--     report" is provable against a learner that actually exists rather
--     than against an absence.
--   * MULTI-STUDENT ROSTER and MULTI-MODULE breadth — six students
--     across two modules, three per module, so roster, enrolment and
--     attendance logic is exercised against more than a single row.
--
-- NOT delivered here, and deliberately so: second-TRAINER and
-- second-PARENT breadth. Both need a real Auth identity to mean
-- anything, and creating one is Operator-gated. See the section above.
--
-- Determinism: every UUID and every timestamp below is a FIXED LITERAL,
-- exactly as the ratified fixture requires, so two loads separated by a
-- clean reset produce byte-identical rows.
--
-- Synthetic data only (ADR-6). No real name, no real child, no
-- credential of any kind appears in this file.
--
-- Apply:
--   psql --set=do_expand_cleanup=false --set=do_expand=true  -f this file
--   psql --set=do_expand_cleanup=true  --set=do_expand=false -f this file
-- =====================================================================

\set ON_ERROR_STOP on

\if :{?do_expand}
\else
\set do_expand false
\endif
\if :{?do_expand_cleanup}
\else
\set do_expand_cleanup false
\endif

-- Mode guard. This is deliberately psql `\if` logic and NOT a DO block:
-- psql performs NO variable interpolation inside a dollar-quoted string,
-- so `:'do_expand'` written inside `DO $$ … $$` would reach the server
-- verbatim and fail with a syntax error rather than guarding anything.
-- The DO block below contains no variable reference, so it is safe.
--
-- Both flags true is legal and means "reload": cleanup runs first, then
-- load. Neither flag set is an error, because a silent no-op is exactly
-- the failure mode a fixture script must not have.
\if :do_expand
\else
  \if :do_expand_cleanup
  \else
DO $mode_guard$
BEGIN
  RAISE EXCEPTION 'Expansion aborted: set exactly one of do_expand or do_expand_cleanup to true.';
END
$mode_guard$;
  \endif
\endif

-- =====================================================================
-- OPERATION 1 — CLEANUP
--
-- Deletes ONLY the expansion family. It must run BEFORE the ratified
-- fixture's own cleanup, because assignments here reference the ratified
-- trainer membership c1000000-…-02 and would otherwise block its
-- deletion. Child-to-parent order throughout.
-- =====================================================================
\if :do_expand_cleanup

BEGIN;

DELETE FROM public.observation_ratings WHERE id::text LIKE 'ea000000-%';
DELETE FROM public.observations        WHERE id::text LIKE 'e9000000-%';
DELETE FROM public.attendance          WHERE id::text LIKE 'e8000000-%';
DELETE FROM public.class_session_assignments WHERE id::text LIKE 'e7000000-%';
DELETE FROM public.enrolments          WHERE id::text LIKE 'e6000000-%';
DELETE FROM public.class_sessions      WHERE id::text LIKE 'e5000000-%';
DELETE FROM public.class_modules       WHERE id::text LIKE 'e4000000-%';
DELETE FROM public.students            WHERE id::text LIKE 'e2000000-%';

DO $cleanup_guard$
DECLARE
  v_left integer;
BEGIN
  SELECT
      (SELECT count(*) FROM public.students               WHERE id::text LIKE 'e2000000-%')
    + (SELECT count(*) FROM public.class_modules          WHERE id::text LIKE 'e4000000-%')
    + (SELECT count(*) FROM public.class_sessions         WHERE id::text LIKE 'e5000000-%')
    + (SELECT count(*) FROM public.enrolments             WHERE id::text LIKE 'e6000000-%')
    + (SELECT count(*) FROM public.class_session_assignments WHERE id::text LIKE 'e7000000-%')
    + (SELECT count(*) FROM public.attendance             WHERE id::text LIKE 'e8000000-%')
    + (SELECT count(*) FROM public.observations           WHERE id::text LIKE 'e9000000-%')
    + (SELECT count(*) FROM public.observation_ratings    WHERE id::text LIKE 'ea000000-%')
    INTO v_left;

  IF v_left <> 0 THEN
    RAISE EXCEPTION 'Expansion cleanup aborted: % expansion rows survive.', v_left;
  END IF;
  RAISE NOTICE 'Expansion cleanup complete: 0 expansion rows remain.';
END
$cleanup_guard$;

COMMIT;

\endif

-- =====================================================================
-- OPERATION 2 — LOAD
-- =====================================================================
\if :do_expand

BEGIN;

-- Preconditions. The expansion is additive ON TOP OF the ratified
-- minimum: it references the seeded centre and class grades and the
-- ratified trainer membership, so it fails closed rather than silently
-- producing a half-populated fixture if the base is absent.
DO $pre$
DECLARE
  v_existing integer;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.centres WHERE id = 'b0000000-0000-4000-8000-000000000001') THEN
    RAISE EXCEPTION 'Expansion aborted: the seeded centre is absent. Load the ratified fixture first.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.centre_memberships
    WHERE id = 'c1000000-0000-4000-8000-000000000002' AND role = 'trainer' AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Expansion aborted: the ratified active trainer membership is absent.';
  END IF;

  SELECT
      (SELECT count(*) FROM public.students      WHERE id::text LIKE 'e2000000-%')
    + (SELECT count(*) FROM public.class_modules WHERE id::text LIKE 'e4000000-%')
    + (SELECT count(*) FROM public.class_sessions WHERE id::text LIKE 'e5000000-%')
    INTO v_existing;
  IF v_existing <> 0 THEN
    RAISE EXCEPTION 'Expansion aborted: % expansion rows already exist. Run the cleanup first.', v_existing;
  END IF;
END
$pre$;

-- --- students -------------------------------------------------------
INSERT INTO public.students (id, centre_id, full_name, is_active, created_at, updated_at) VALUES
  ('e2000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'Fixture Student Two',   true, '2026-02-01 00:00:00+00', '2026-02-01 00:00:00+00'),
  ('e2000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'Fixture Student Three', true, '2026-02-01 00:00:00+00', '2026-02-01 00:00:00+00'),
  ('e2000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 'Fixture Student Four',  true, '2026-02-01 00:00:00+00', '2026-02-01 00:00:00+00'),
  ('e2000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', 'Fixture Student Five',  true, '2026-02-01 00:00:00+00', '2026-02-01 00:00:00+00'),
  ('e2000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', 'Fixture Student Six',   true, '2026-02-01 00:00:00+00', '2026-02-01 00:00:00+00'),
  ('e2000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000001', 'Fixture Student Seven', true, '2026-02-01 00:00:00+00', '2026-02-01 00:00:00+00');

-- NO parent_student_links row is created here. The RATIFIED parent stays
-- linked to exactly its one ratified child and to NONE of these six, and
-- that absence is the point: it makes "a parent cannot read an unlinked
-- learner's report" provable against six learners that actually exist,
-- rather than against an empty table.

-- --- modules --------------------------------------------------------
INSERT INTO public.class_modules (id, centre_id, class_grade_id, title, is_active, created_at, updated_at) VALUES
  ('e4000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'Beginner Public Speaking — Fixture Module B', true, '2026-02-01 00:00:00+00', '2026-02-01 00:00:00+00'),
  ('e4000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000002', 'Intermediate Storytelling — Fixture Module C', true, '2026-02-01 00:00:00+00', '2026-02-01 00:00:00+00');

-- --- sessions -------------------------------------------------------
-- e5…-01 and e5…-02 are the CONTINUITY PAIR: same module, same enrolled
-- students, one week apart, both in the past relative to the fixture's
-- own timeline so neither trips the future-session lock.
INSERT INTO public.class_sessions (id, centre_id, class_module_id, session_date, starts_at, ends_at, created_at, updated_at) VALUES
  ('e5000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'e4000000-0000-4000-8000-000000000001', '2026-02-10', '10:00:00', '11:00:00', '2026-02-01 00:00:00+00', '2026-02-01 00:00:00+00'),
  ('e5000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'e4000000-0000-4000-8000-000000000001', '2026-02-17', '10:00:00', '11:00:00', '2026-02-01 00:00:00+00', '2026-02-01 00:00:00+00'),
  ('e5000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 'e4000000-0000-4000-8000-000000000002', '2026-02-12', '14:00:00', '15:00:00', '2026-02-01 00:00:00+00', '2026-02-01 00:00:00+00');

-- --- enrolments (3 per module) --------------------------------------
INSERT INTO public.enrolments (id, centre_id, class_module_id, student_id, is_active, enrolled_at, created_at) VALUES
  ('e6000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'e4000000-0000-4000-8000-000000000001', 'e2000000-0000-4000-8000-000000000001', true, '2026-02-01 00:00:00+00', '2026-02-01 00:00:00+00'),
  ('e6000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'e4000000-0000-4000-8000-000000000001', 'e2000000-0000-4000-8000-000000000002', true, '2026-02-01 00:00:00+00', '2026-02-01 00:00:00+00'),
  ('e6000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 'e4000000-0000-4000-8000-000000000001', 'e2000000-0000-4000-8000-000000000003', true, '2026-02-01 00:00:00+00', '2026-02-01 00:00:00+00'),
  ('e6000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', 'e4000000-0000-4000-8000-000000000002', 'e2000000-0000-4000-8000-000000000004', true, '2026-02-01 00:00:00+00', '2026-02-01 00:00:00+00'),
  ('e6000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', 'e4000000-0000-4000-8000-000000000002', 'e2000000-0000-4000-8000-000000000005', true, '2026-02-01 00:00:00+00', '2026-02-01 00:00:00+00'),
  ('e6000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000001', 'e4000000-0000-4000-8000-000000000002', 'e2000000-0000-4000-8000-000000000006', true, '2026-02-01 00:00:00+00', '2026-02-01 00:00:00+00');

-- --- trainer assignment ---------------------------------------------
-- The RATIFIED trainer (c1…-02) takes both continuity sessions, because
-- that trainer is the only one with an Auth identity and therefore the
-- only one a governed run can act as. Trainer Two takes Module C, which
-- is what gives the fixture a genuine second trainer without pretending
-- that trainer can sign in.
INSERT INTO public.class_session_assignments (id, centre_id, class_session_id, trainer_membership_id, trainer_role, is_active, assigned_at, created_at) VALUES
  ('e7000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'e5000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002', 'trainer', true, '2026-02-01 00:00:00+00', '2026-02-01 00:00:00+00'),
  ('e7000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'e5000000-0000-4000-8000-000000000002', 'c1000000-0000-4000-8000-000000000002', 'trainer', true, '2026-02-01 00:00:00+00', '2026-02-01 00:00:00+00'),
  ('e7000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 'e5000000-0000-4000-8000-000000000003', 'c1000000-0000-4000-8000-000000000002', 'trainer', true, '2026-02-01 00:00:00+00', '2026-02-01 00:00:00+00');

-- --- attendance (Present by default — A-018) -------------------------
INSERT INTO public.attendance (id, centre_id, class_session_id, class_module_id, student_id, enrolment_id, status, recorded_by_membership_id, recorded_by_role, created_at, updated_at) VALUES
  ('e8000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'e5000000-0000-4000-8000-000000000001', 'e4000000-0000-4000-8000-000000000001', 'e2000000-0000-4000-8000-000000000001', 'e6000000-0000-4000-8000-000000000001', 'present', 'c1000000-0000-4000-8000-000000000002', 'trainer', '2026-02-10 10:00:00+00', '2026-02-10 10:00:00+00'),
  ('e8000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'e5000000-0000-4000-8000-000000000001', 'e4000000-0000-4000-8000-000000000001', 'e2000000-0000-4000-8000-000000000002', 'e6000000-0000-4000-8000-000000000002', 'present', 'c1000000-0000-4000-8000-000000000002', 'trainer', '2026-02-10 10:00:00+00', '2026-02-10 10:00:00+00'),
  ('e8000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 'e5000000-0000-4000-8000-000000000001', 'e4000000-0000-4000-8000-000000000001', 'e2000000-0000-4000-8000-000000000003', 'e6000000-0000-4000-8000-000000000003', 'present', 'c1000000-0000-4000-8000-000000000002', 'trainer', '2026-02-10 10:00:00+00', '2026-02-10 10:00:00+00'),
  ('e8000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', 'e5000000-0000-4000-8000-000000000002', 'e4000000-0000-4000-8000-000000000001', 'e2000000-0000-4000-8000-000000000001', 'e6000000-0000-4000-8000-000000000001', 'present', 'c1000000-0000-4000-8000-000000000002', 'trainer', '2026-02-17 10:00:00+00', '2026-02-17 10:00:00+00'),
  ('e8000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', 'e5000000-0000-4000-8000-000000000002', 'e4000000-0000-4000-8000-000000000001', 'e2000000-0000-4000-8000-000000000002', 'e6000000-0000-4000-8000-000000000002', 'present', 'c1000000-0000-4000-8000-000000000002', 'trainer', '2026-02-17 10:00:00+00', '2026-02-17 10:00:00+00'),
  ('e8000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000001', 'e5000000-0000-4000-8000-000000000002', 'e4000000-0000-4000-8000-000000000001', 'e2000000-0000-4000-8000-000000000003', 'e6000000-0000-4000-8000-000000000003', 'present', 'c1000000-0000-4000-8000-000000000002', 'trainer', '2026-02-17 10:00:00+00', '2026-02-17 10:00:00+00');

-- --- the CONTINUITY observation, on the EARLIER session --------------
-- `follow_up_notes` is the whole point: CLAUDE.md §10 exit condition (c)
-- requires this note to surface as the NEXT session's previous focus.
-- The ratified minimum cannot demonstrate it — it has one session, and
-- its observation's follow_up_notes is NULL.
INSERT INTO public.observations (
  id, centre_id, class_session_id, class_module_id, student_id, enrolment_id,
  trainer_membership_id, trainer_role, strength_chips, focus_chips,
  observation_notes, follow_up_notes, term_evidence_notes, lock_version, created_at, updated_at
) VALUES (
  'e9000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000001',
  'e5000000-0000-4000-8000-000000000001',
  'e4000000-0000-4000-8000-000000000001',
  'e2000000-0000-4000-8000-000000000001',
  'e6000000-0000-4000-8000-000000000001',
  'c1000000-0000-4000-8000-000000000002',
  'trainer',
  ARRAY['Confident posture', 'Clear structure'],
  ARRAY['Eye contact', 'Vocal projection'],
  'Delivered the practice talk from memory and held an open stance throughout. Looked at the floor during the opening and the voice dropped at the back of the room.',
  'Next session: rebuild the opening hook with the audience in view, and start with the projection warm-up before the first speaker.',
  NULL,
  1,
  '2026-02-10 10:45:00+00',
  '2026-02-10 10:45:00+00'
);

-- Nine ratings, deliberately MIXED — two `beginning` (needs_support),
-- so the grounding-contradiction proof has real non-positive dimensions
-- to contradict, and the polarity bands are not uniform.
INSERT INTO public.observation_ratings (id, observation_id, dimension_code, rating, created_at, updated_at) VALUES
  ('ea000000-0000-4000-8000-000000000001', 'e9000000-0000-4000-8000-000000000001', 'body',                 'mastered',   '2026-02-10 10:45:00+00', '2026-02-10 10:45:00+00'),
  ('ea000000-0000-4000-8000-000000000002', 'e9000000-0000-4000-8000-000000000001', 'emotion',              'developing', '2026-02-10 10:45:00+00', '2026-02-10 10:45:00+00'),
  ('ea000000-0000-4000-8000-000000000003', 'e9000000-0000-4000-8000-000000000001', 'speech',               'mastering',  '2026-02-10 10:45:00+00', '2026-02-10 10:45:00+00'),
  ('ea000000-0000-4000-8000-000000000004', 'e9000000-0000-4000-8000-000000000001', 'tonality',             'developing', '2026-02-10 10:45:00+00', '2026-02-10 10:45:00+00'),
  ('ea000000-0000-4000-8000-000000000005', 'e9000000-0000-4000-8000-000000000001', 'eye_contact',          'beginning',  '2026-02-10 10:45:00+00', '2026-02-10 10:45:00+00'),
  ('ea000000-0000-4000-8000-000000000006', 'e9000000-0000-4000-8000-000000000001', 'vocal_projection',     'beginning',  '2026-02-10 10:45:00+00', '2026-02-10 10:45:00+00'),
  ('ea000000-0000-4000-8000-000000000007', 'e9000000-0000-4000-8000-000000000001', 'emotional_expression', 'mastering',  '2026-02-10 10:45:00+00', '2026-02-10 10:45:00+00'),
  ('ea000000-0000-4000-8000-000000000008', 'e9000000-0000-4000-8000-000000000001', 'sentence_flow',        'developing', '2026-02-10 10:45:00+00', '2026-02-10 10:45:00+00'),
  ('ea000000-0000-4000-8000-000000000009', 'e9000000-0000-4000-8000-000000000001', 'audience_awareness',   'mastered',   '2026-02-10 10:45:00+00', '2026-02-10 10:45:00+00');

-- --- load guard: assert the exact expansion inventory ----------------
DO $post$
DECLARE
  v_total integer;
  v_auth  integer;
  v_ratified_parent_links integer;
BEGIN
  SELECT
      (SELECT count(*) FROM public.students               WHERE id::text LIKE 'e2000000-%')
    + (SELECT count(*) FROM public.class_modules          WHERE id::text LIKE 'e4000000-%')
    + (SELECT count(*) FROM public.class_sessions         WHERE id::text LIKE 'e5000000-%')
    + (SELECT count(*) FROM public.enrolments             WHERE id::text LIKE 'e6000000-%')
    + (SELECT count(*) FROM public.class_session_assignments WHERE id::text LIKE 'e7000000-%')
    + (SELECT count(*) FROM public.attendance             WHERE id::text LIKE 'e8000000-%')
    + (SELECT count(*) FROM public.observations           WHERE id::text LIKE 'e9000000-%')
    + (SELECT count(*) FROM public.observation_ratings    WHERE id::text LIKE 'ea000000-%')
    INTO v_total;

  IF v_total <> 36 THEN
    RAISE EXCEPTION 'Expansion aborted: expected exactly 36 expansion rows, found %.', v_total;
  END IF;

  -- The Auth boundary is asserted, not merely intended: this file must
  -- never have created a fourth identity.
  SELECT count(*) INTO v_auth FROM auth.users;
  IF v_auth <> 3 THEN
    RAISE EXCEPTION 'Expansion aborted: auth.users is %, expected exactly 3. This file must create no Auth identity.', v_auth;
  END IF;

  -- The parent-isolation negative control depends on this being true.
  SELECT count(*) INTO v_ratified_parent_links
    FROM public.parent_student_links
   WHERE parent_membership_id = 'c1000000-0000-4000-8000-000000000003'
     AND student_id::text LIKE 'e2000000-%';
  IF v_ratified_parent_links <> 0 THEN
    RAISE EXCEPTION 'Expansion aborted: the ratified parent is linked to % expansion student(s); it must be linked to none.', v_ratified_parent_links;
  END IF;

  RAISE NOTICE 'Expansion load complete: 36 rows, auth.users still 3, ratified parent linked to 0 expansion students.';
END
$post$;

COMMIT;

\endif
