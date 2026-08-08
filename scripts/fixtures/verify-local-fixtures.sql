-- =====================================================================
-- B.E.S.T Coach — Step 7F: fixture verification and negative tests
-- =====================================================================
-- LOCAL DISPOSABLE DEVELOPMENT DATABASE ONLY.
--
-- This file is READ-ONLY except for the deliberately-rejected negative
-- test rows in SECTION C, which live inside one explicit transaction that
-- ALWAYS ends in ROLLBACK. Nothing it writes can ever commit.
--
-- It emits exactly one machine-readable region:
--
--   <<<BEST_COACH_FIXTURE_CANONICAL_BEGIN>>>
--   ... canonical lines ...
--   <<<BEST_COACH_FIXTURE_CANONICAL_END>>>
--
-- The Node loader hashes that region with SHA-256 using Node's built-in
-- `crypto` module. No database extension is required and no hash is
-- computed in SQL.
--
-- Sections:
--   A  positive assertions (read-only)
--   B  canonical representation for the checksum (read-only)
--   C  negative tests inside BEGIN ... ROLLBACK
--   D  post-rollback residue proof (read-only)
--
-- Reconciled at Step 7G1F: this file originally asserted the Step 7F-era
-- access posture (zero policies, zero client grants, one applied
-- migration). The committed Step 7G relationship-authorization migration
-- superseded that posture, so A32-A35 and D5 now pin the ACCEPTED Step 7G
-- posture instead. Every fixture-data assertion, negative test and the
-- canonical checksum region are unchanged.
--
-- Reconciled again at Backend Round B1 (Step 7I): the two committed Step 7I
-- migrations move four censuses this file hard-pins, and it is knowingly RED
-- from the moment migration file 1 applies until this reconciliation lands --
-- which is why the reconciliation is committed TOGETHER WITH the migration,
-- not after it. The four labels and their movements:
--   A32  25 -> 26 project tables, all with RLS enabled;
--        report_correction_requests joins the zero-policy list
--   A33  the 25-table zero-privilege sweeps become 26-table sweeps
--   A34  3 -> 5 applied migrations, adding 20260805090000 and 20260805090500
--   A35  10 -> 28 public functions (6 Step 7G + 4 Step 7H + 18 Step 7I), with
--        per-function contract checks for the new eighteen
--   D5   the same 28-function and 26-table figures, post-negative-suite
-- The 29 Step 7G policies, the 13-table authenticated SELECT set, the Step 7H
-- audit guards, every fixture-data assertion, every negative test and the
-- canonical checksum region are UNCHANGED -- Step 7I adds no policy, no table
-- grant and no fixture row.
--
-- Reconciled again at Backend Round B2 (governed assessment persistence,
-- CP-2/CP-4). The assessment migration adds exactly two functions and moves
-- three censuses this file hard-pins, so -- for the same reason as above --
-- the reconciliation is committed TOGETHER WITH that migration:
--   A34  5 -> 6 applied migrations, adding 20260806090000
--   A35  28 -> 30 public functions (6 Step 7G + 4 Step 7H + 18 Step 7I
--        + 2 assessment), with per-function contract checks for the new two
--   D5   the same 30-function figure, post-negative-suite
-- A32 (26 tables), A33 (the 26-table zero-privilege sweeps), the 29
-- policies, the 13-table authenticated SELECT set, the Step 7H audit guards,
-- every fixture-data assertion, every negative test and the canonical
-- checksum region are UNCHANGED -- the assessment migration adds no table,
-- enum, column, constraint, index, policy, table grant or fixture row.
--
-- Reconciled again at Backend Round B2.1 (management correction tracking,
-- U-B2-1). That migration adds exactly ONE read-only function and ONE
-- authenticated EXECUTE grant, and moves three censuses this file hard-pins,
-- so -- for the same reason as above -- the reconciliation is committed
-- TOGETHER WITH that migration:
--   A34  6 -> 7 applied migrations, adding 20260806103000
--   A35  30 -> 31 public functions (6 Step 7G + 4 Step 7H + 18 Step 7I
--        + 2 assessment + 1 correction tracking), with a per-function
--        contract check for the new one
--   D5   the same 31-function figure, post-negative-suite
-- A32 (26 tables), A33, the 29 policies, the 13-table authenticated SELECT
-- set, the Step 7H audit guards, every fixture-data assertion, every
-- negative test and the canonical checksum region are UNCHANGED -- the
-- correction-tracking migration adds NO table, enum, column, constraint,
-- index, policy, table grant or fixture row.
--
-- Reconciled again at Backend V2 (competency vocabulary, Amendment 006
-- A-049/A-053). The enum-rename migration renames exactly three
-- `public.competency_rating` labels behind a fail-closed zero-row guard. It
-- moves ONE census this file hard-pins and changes the fixture rating
-- literals this file asserts, so -- for the same reason as above -- the
-- reconciliation is committed TOGETHER WITH that migration:
--   A34  7 -> 8 applied migrations, adding 20260806160000
--   A24  the mixed-set assertion re-keys `emerging`/`advanced` to the
--        ratified `beginning`/`mastered`
--   A25  the nine ratified rating triples re-key `secure`->`mastering`,
--        `emerging`->`beginning`, `advanced`->`mastered`; `developing` is
--        unchanged (A-049 renames exactly three labels)
-- A32 (26 tables), A33, the 29 policies, A35's 31 functions and 12 enums,
-- the Step 7H audit guards, the Option B report-table ZERO-ROW guards
-- (A26-A31, D3) and every negative test are UNCHANGED -- a label rename
-- adds no table, enum, column, constraint, index, policy, grant, function
-- or fixture row, and the report tables must still be empty (A-053's
-- zero-row precondition is exactly why the rename is safe).
--
-- Reconciled again at Backend Round C2 (the R-22 governed report-context
-- resolver). That migration adds exactly ONE read-only function and ONE
-- authenticated EXECUTE grant, and moves three censuses this file hard-pins,
-- so -- for the same reason as above -- the reconciliation is committed
-- TOGETHER WITH that migration:
--   A34  8 -> 9 applied migrations, adding 20260806190000
--   A35  31 -> 32 public functions (6 Step 7G + 4 Step 7H + 18 Step 7I
--        + 2 assessment + 1 correction tracking + 1 context resolver), with
--        a per-function contract check for the new one and an exact
--        projection check pinning it to two uuid identifiers
--   D5   the same 32-function figure, post-negative-suite
-- A32 (26 tables), A33, the 29 policies, the 12 enums, the 13-table
-- authenticated SELECT set, the Step 7H audit guards, every fixture-data
-- assertion, every negative test and the canonical checksum region are
-- UNCHANGED -- the resolver migration adds NO table, enum, column,
-- constraint, index, policy, table grant or fixture row, and writes no data
-- at all.
--
-- CLASS GRADE IS NOT TOUCHED (A-054). `class_grade_code`, the three seeded
-- Class Grades and the `beginner` grade assertions below are competency-
-- unrelated and stay byte-identical.
-- =====================================================================

\set ON_ERROR_STOP on

-- =====================================================================
-- SECTION A -- Positive assertions
-- =====================================================================
DO $verify_positive$
DECLARE
  v_n integer;
  v_m integer;
  v_oid oid;
BEGIN
  -- --- Auth identity projection (read-only) -------------------------
  -- Exactly three local Auth users, matched by the three reserved emails.
  SELECT count(*) INTO v_n
    FROM auth.users
   WHERE lower(btrim(email)) IN (
     'management.fixture@example.test',
     'trainer.fixture@example.test',
     'parent.fixture@example.test');
  IF v_n <> 3 THEN
    RAISE EXCEPTION 'FAIL A1: expected exactly 3 fixture Auth users, found %', v_n;
  END IF;

  -- Their ids are exactly the ratified deterministic literals.
  SELECT count(*) INTO v_n
    FROM auth.users
   WHERE (id, lower(btrim(email))) IN (
     ('d0000000-0000-4000-8000-000000000001'::uuid, 'management.fixture@example.test'),
     ('d0000000-0000-4000-8000-000000000002'::uuid, 'trainer.fixture@example.test'),
     ('d0000000-0000-4000-8000-000000000003'::uuid, 'parent.fixture@example.test'));
  IF v_n <> 3 THEN
    RAISE EXCEPTION 'FAIL A2: fixture Auth id/email pairs do not match the ratified deterministic values (matched %)', v_n;
  END IF;

  -- --- Accounts and memberships -------------------------------------
  SELECT count(*) INTO v_n FROM public.accounts WHERE id::text LIKE 'c0000000-%';
  IF v_n <> 3 THEN RAISE EXCEPTION 'FAIL A3: expected 3 fixture accounts, found %', v_n; END IF;

  SELECT count(*) INTO v_n
    FROM public.accounts a JOIN auth.users u ON u.id = a.auth_user_id
   WHERE a.id::text LIKE 'c0000000-%' AND a.status = 'active';
  IF v_n <> 3 THEN RAISE EXCEPTION 'FAIL A4: expected 3 active accounts linked to Auth users, found %', v_n; END IF;

  SELECT count(*) INTO v_n
    FROM public.centre_memberships
   WHERE id::text LIKE 'c1000000-%' AND status = 'active'
     AND centre_id = 'b0000000-0000-4000-8000-000000000001'
     AND activated_at IS NOT NULL AND deactivated_at IS NULL;
  IF v_n <> 3 THEN RAISE EXCEPTION 'FAIL A5: expected 3 active fixture memberships, found %', v_n; END IF;

  SELECT count(DISTINCT role) INTO v_n
    FROM public.centre_memberships WHERE id::text LIKE 'c1000000-%';
  IF v_n <> 3 THEN RAISE EXCEPTION 'FAIL A6: expected exactly one membership per role, found % distinct roles', v_n; END IF;

  IF NOT EXISTS (SELECT 1 FROM public.centre_memberships WHERE id = 'c1000000-0000-4000-8000-000000000001' AND role = 'management')
  OR NOT EXISTS (SELECT 1 FROM public.centre_memberships WHERE id = 'c1000000-0000-4000-8000-000000000002' AND role = 'trainer')
  OR NOT EXISTS (SELECT 1 FROM public.centre_memberships WHERE id = 'c1000000-0000-4000-8000-000000000003' AND role = 'parent') THEN
    RAISE EXCEPTION 'FAIL A7: membership-to-role assignment does not match the ratified design';
  END IF;

  SELECT count(*) INTO v_n
    FROM public.centre_memberships
   WHERE centre_id = 'b0000000-0000-4000-8000-000000000001'
     AND role = 'management' AND status = 'active';
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL A8: expected exactly 1 active management membership, found %', v_n; END IF;

  -- --- Role profiles -------------------------------------------------
  SELECT count(*) INTO v_n FROM public.trainer_profiles WHERE membership_id = 'c1000000-0000-4000-8000-000000000002';
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL A9: expected 1 trainer profile, found %', v_n; END IF;

  SELECT count(*) INTO v_n FROM public.parent_profiles WHERE membership_id = 'c1000000-0000-4000-8000-000000000003';
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL A10: expected 1 parent profile, found %', v_n; END IF;

  -- No management profile relation exists at all.
  SELECT count(*) INTO v_n
    FROM information_schema.tables
   WHERE table_schema = 'public' AND table_name = 'management_profiles';
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL A11: a management_profiles relation exists; A-025 requires none'; END IF;

  -- --- Students carry NO authentication relationship -----------------
  SELECT count(*) INTO v_n
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'students'
     AND column_name IN ('auth_user_id', 'account_id');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL A12: students carries % auth/account linkage column(s); a student login must be structurally impossible', v_n;
  END IF;

  -- --- Hierarchy, relationship and attendance rows -------------------
  SELECT count(*) INTO v_n FROM public.students WHERE id = 'c2000000-0000-4000-8000-000000000001' AND is_active AND full_name = 'Fixture Student One';
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL A13: expected 1 active fixture student, found %', v_n; END IF;

  SELECT count(*) INTO v_n FROM public.parent_student_links WHERE id = 'c3000000-0000-4000-8000-000000000001' AND is_active;
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL A14: expected 1 active parent-student link, found %', v_n; END IF;

  SELECT count(*) INTO v_n FROM public.class_modules WHERE id = 'c4000000-0000-4000-8000-000000000001' AND is_active
     AND class_grade_id = 'b1000000-0000-4000-8000-000000000001';
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL A15: expected 1 active fixture class module under the beginner grade, found %', v_n; END IF;

  SELECT count(*) INTO v_n FROM public.class_sessions
   WHERE id = 'c5000000-0000-4000-8000-000000000001'
     AND session_date = DATE '2026-02-03' AND starts_at = TIME '10:00' AND ends_at = TIME '11:00';
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL A16: expected 1 fixture class session dated 2026-02-03 10:00-11:00, found %', v_n; END IF;

  SELECT count(*) INTO v_n FROM public.enrolments WHERE id = 'c6000000-0000-4000-8000-000000000001' AND is_active;
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL A17: expected 1 active fixture enrolment, found %', v_n; END IF;

  SELECT count(*) INTO v_n FROM public.class_session_assignments
   WHERE id = 'c7000000-0000-4000-8000-000000000001' AND is_active
     AND trainer_membership_id = 'c1000000-0000-4000-8000-000000000002';
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL A18: expected 1 active fixture trainer assignment, found %', v_n; END IF;

  SELECT count(*) INTO v_n FROM public.attendance
   WHERE id = 'c8000000-0000-4000-8000-000000000001' AND status = 'present'
     AND recorded_by_membership_id IS NULL AND recorded_by_role IS NULL;
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL A19: expected 1 Present attendance row with both recorder fields NULL, found %', v_n; END IF;

  -- --- Observation and its nine mixed ratings ------------------------
  SELECT count(*) INTO v_n FROM public.observations
   WHERE id = 'c9000000-0000-4000-8000-000000000001' AND lock_version = 1;
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL A20: expected 1 observation at lock_version 1, found %', v_n; END IF;

  SELECT count(*) INTO v_n FROM public.observation_ratings
   WHERE observation_id = 'c9000000-0000-4000-8000-000000000001';
  IF v_n <> 9 THEN RAISE EXCEPTION 'FAIL A21: expected 9 observation ratings, found %', v_n; END IF;

  SELECT count(DISTINCT dimension_code) INTO v_n FROM public.observation_ratings
   WHERE observation_id = 'c9000000-0000-4000-8000-000000000001';
  IF v_n <> 9 THEN RAISE EXCEPTION 'FAIL A22: expected 9 distinct dimensions, found %', v_n; END IF;

  SELECT count(DISTINCT rating) INTO v_n FROM public.observation_ratings
   WHERE observation_id = 'c9000000-0000-4000-8000-000000000001';
  IF v_n <> 4 THEN RAISE EXCEPTION 'FAIL A23: expected all four rating levels represented, found %', v_n; END IF;

  IF (SELECT count(*) FROM public.observation_ratings
       WHERE observation_id = 'c9000000-0000-4000-8000-000000000001' AND rating = 'beginning') < 1
  OR (SELECT count(*) FROM public.observation_ratings
       WHERE observation_id = 'c9000000-0000-4000-8000-000000000001' AND rating = 'mastered') < 1 THEN
    RAISE EXCEPTION 'FAIL A24: the mixed rating set must include at least one beginning and one mastered rating';
  END IF;

  -- Exact ratified UUID / dimension / rating triples.
  SELECT count(*) INTO v_n FROM public.observation_ratings r
   WHERE (r.id, r.dimension_code, r.rating) IN (
     ('ca000000-0000-4000-8000-000000000001'::uuid, 'body'::public.dimension_code,                 'mastering'::public.competency_rating),
     ('ca000000-0000-4000-8000-000000000002'::uuid, 'emotion'::public.dimension_code,              'developing'::public.competency_rating),
     ('ca000000-0000-4000-8000-000000000003'::uuid, 'speech'::public.dimension_code,               'beginning'::public.competency_rating),
     ('ca000000-0000-4000-8000-000000000004'::uuid, 'tonality'::public.dimension_code,             'mastering'::public.competency_rating),
     ('ca000000-0000-4000-8000-000000000005'::uuid, 'eye_contact'::public.dimension_code,          'mastered'::public.competency_rating),
     ('ca000000-0000-4000-8000-000000000006'::uuid, 'vocal_projection'::public.dimension_code,     'developing'::public.competency_rating),
     ('ca000000-0000-4000-8000-000000000007'::uuid, 'emotional_expression'::public.dimension_code, 'beginning'::public.competency_rating),
     ('ca000000-0000-4000-8000-000000000008'::uuid, 'sentence_flow'::public.dimension_code,        'mastering'::public.competency_rating),
     ('ca000000-0000-4000-8000-000000000009'::uuid, 'audience_awareness'::public.dimension_code,   'mastered'::public.competency_rating));
  IF v_n <> 9 THEN
    RAISE EXCEPTION 'FAIL A25: the nine rating UUID/dimension/rating triples do not match the ratified values exactly (matched %)', v_n;
  END IF;

  -- --- Option B zero-row boundary ------------------------------------
  IF (SELECT count(*) FROM public.reports) <> 0                            THEN RAISE EXCEPTION 'FAIL A26: reports must be empty'; END IF;
  IF (SELECT count(*) FROM public.report_versions) <> 0                    THEN RAISE EXCEPTION 'FAIL A27: report_versions must be empty'; END IF;
  IF (SELECT count(*) FROM public.report_version_ratings) <> 0             THEN RAISE EXCEPTION 'FAIL A28: report_version_ratings must be empty'; END IF;
  IF (SELECT count(*) FROM public.report_version_checklist_progress) <> 0  THEN RAISE EXCEPTION 'FAIL A29: report_version_checklist_progress must be empty'; END IF;
  IF (SELECT count(*) FROM public.report_version_approvals) <> 0           THEN RAISE EXCEPTION 'FAIL A30: report_version_approvals must be empty'; END IF;
  IF (SELECT count(*) FROM public.invitations) <> 0                        THEN RAISE EXCEPTION 'FAIL A31: invitations must be empty'; END IF;

  -- --- Access posture matches the COMMITTED Step 7G migration ---------
  -- (Reconciled at Step 7G1F. Checks are scoped to the 22 project tables
  -- and the 6 project helpers so unrelated platform objects can never
  -- cause a false failure.)

  -- A32: RLS and policy posture. Exactly 26 project tables (22 Step 7E +
  -- 3 Step 7H audit + 1 Step 7I correction-request table); RLS enabled on
  -- all and forced on none; exactly the 29 accepted SELECT policies, all
  -- permissive and scoped to authenticated, distributed exactly as
  -- committed; zero policies on the nine out-of-scope tables, the three
  -- audit tables and the correction-request table (thirteen total).
  -- ZERO GRANTS IS NOT THE SAME AS RLS ENABLED: this count is exactly why
  -- report_correction_requests had to ship with RLS enabled -- a table
  -- without it would fail here indistinguishably from a real regression.
  SELECT count(*), count(*) FILTER (WHERE NOT c.relrowsecurity) INTO v_n, v_m
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r';
  IF v_n <> 26 OR v_m <> 0 THEN
    RAISE EXCEPTION 'FAIL A32: expected 26 public tables with RLS enabled on all; found % table(s), % without RLS', v_n, v_m;
  END IF;
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relforcerowsecurity;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL A32: FORCE ROW LEVEL SECURITY is enabled on % table(s); expected 0', v_n;
  END IF;

  SELECT count(*) INTO v_n FROM pg_catalog.pg_policies WHERE schemaname = 'public';
  IF v_n <> 29 THEN
    RAISE EXCEPTION 'FAIL A32: expected exactly the 29 Step 7G policies, found %', v_n;
  END IF;

  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_policies
   WHERE schemaname = 'public'
     AND (permissive <> 'PERMISSIVE' OR cmd <> 'SELECT' OR roles <> ARRAY['authenticated']::name[]);
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL A32: % policy(ies) are not permissive SELECT policies for authenticated', v_n;
  END IF;

  SELECT count(*) INTO v_n
    FROM (VALUES
      ('centres', 1), ('accounts', 2), ('centre_memberships', 2), ('trainer_profiles', 2),
      ('parent_profiles', 2), ('students', 3), ('parent_student_links', 2), ('class_grades', 1),
      ('class_modules', 3), ('class_sessions', 3), ('enrolments', 3),
      ('class_session_assignments', 2), ('attendance', 3)) AS expected(tbl, cnt)
   WHERE (SELECT count(*) FROM pg_catalog.pg_policies p
           WHERE p.schemaname = 'public' AND p.tablename = expected.tbl) <> expected.cnt;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL A32: % table(s) deviate from the accepted Step 7G policy distribution', v_n;
  END IF;

  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_policies
   WHERE schemaname = 'public'
     AND tablename IN ('invitations','assessment_dimensions','observations','observation_ratings',
                       'reports','report_versions','report_version_ratings',
                       'report_version_checklist_progress','report_version_approvals',
                       'audit_events','audit_event_targets','audit_chain_heads',
                       'report_correction_requests');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL A32: % policy(ies) exist on out-of-scope, audit or correction tables; expected 0', v_n;
  END IF;

  -- A33: table privileges. authenticated holds SELECT on exactly the 13
  -- relationship tables and no write-side privilege anywhere; anon,
  -- service_role, authenticator and PUBLIC hold nothing at all on any of
  -- the 25 project tables (22 Step 7E + 3 Step 7H audit). (service_role
  -- carries BYPASSRLS, so this zero is the only boundary that constrains
  -- it.)
  SELECT count(*) INTO v_n
    FROM (VALUES
      ('centres'),('accounts'),('centre_memberships'),('trainer_profiles'),('parent_profiles'),
      ('students'),('parent_student_links'),('class_grades'),('class_modules'),('class_sessions'),
      ('enrolments'),('class_session_assignments'),('attendance')) AS t(tablename)
   WHERE has_table_privilege('authenticated', ('public.' || t.tablename)::regclass, 'SELECT');
  IF v_n <> 13 THEN
    RAISE EXCEPTION 'FAIL A33: authenticated must hold SELECT on exactly the 13 relationship tables, matched %', v_n;
  END IF;

  SELECT count(*) INTO v_n
    FROM (VALUES
      ('invitations'),('assessment_dimensions'),('observations'),('observation_ratings'),
      ('reports'),('report_versions'),('report_version_ratings'),
      ('report_version_checklist_progress'),('report_version_approvals'),
      ('audit_events'),('audit_event_targets'),('audit_chain_heads'),
      ('report_correction_requests')) AS t(tablename)
   WHERE has_table_privilege('authenticated', ('public.' || t.tablename)::regclass, 'SELECT');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL A33: authenticated holds SELECT on % out-of-scope, audit or correction table(s); expected 0', v_n;
  END IF;

  SELECT count(*) INTO v_n
    FROM (VALUES
      ('centres'),('assessment_dimensions'),('accounts'),('centre_memberships'),('trainer_profiles'),
      ('parent_profiles'),('students'),('parent_student_links'),('class_grades'),('class_modules'),
      ('class_sessions'),('enrolments'),('class_session_assignments'),('attendance'),('invitations'),
      ('observations'),('observation_ratings'),('reports'),('report_versions'),('report_version_ratings'),
      ('report_version_checklist_progress'),('report_version_approvals'),
      ('audit_events'),('audit_event_targets'),('audit_chain_heads'),
      ('report_correction_requests')) AS t(tablename)
    CROSS JOIN (VALUES ('INSERT'),('UPDATE'),('DELETE'),('TRUNCATE'),('REFERENCES'),('TRIGGER')) AS p(priv)
   WHERE has_table_privilege('authenticated', ('public.' || t.tablename)::regclass, p.priv);
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL A33: authenticated holds % write-side table privilege(s); expected 0', v_n;
  END IF;

  SELECT count(*) INTO v_n
    FROM (VALUES
      ('centres'),('assessment_dimensions'),('accounts'),('centre_memberships'),('trainer_profiles'),
      ('parent_profiles'),('students'),('parent_student_links'),('class_grades'),('class_modules'),
      ('class_sessions'),('enrolments'),('class_session_assignments'),('attendance'),('invitations'),
      ('observations'),('observation_ratings'),('reports'),('report_versions'),('report_version_ratings'),
      ('report_version_checklist_progress'),('report_version_approvals'),
      ('audit_events'),('audit_event_targets'),('audit_chain_heads'),
      ('report_correction_requests')) AS t(tablename)
    CROSS JOIN (VALUES ('anon'),('service_role'),('authenticator'),('public')) AS r(rolname)
    CROSS JOIN (VALUES ('SELECT'),('INSERT'),('UPDATE'),('DELETE'),('TRUNCATE'),('REFERENCES'),('TRIGGER')) AS p(priv)
   WHERE has_table_privilege(r.rolname, ('public.' || t.tablename)::regclass, p.priv);
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL A33: anon/service_role/authenticator/PUBLIC hold % table privilege(s); expected 0', v_n;
  END IF;

  -- --- Migration history and Step 7E seed boundary --------------------
  -- A34: exactly the nine accepted project migrations are applied. Step 7I
  -- ships TWO files by mandate (U-7I-18), not one: the `trainer_approved`
  -- enum label must be added and COMMITTED before any object may reference
  -- it. Backend Round B2 adds the assessment-persistence migration
  -- (CP-2/CP-4), moving the count 5 -> 6; Round B2.1 adds the
  -- correction-tracking migration (U-B2-1), moving it 6 -> 7; Backend V2
  -- adds the competency-vocabulary rename (A-053), moving it 7 -> 8; and
  -- Round C2 adds the report-context resolver (R-22), moving it 8 -> 9; and
  -- Round C2 Phase C2-A adds the atomic complete-save composer (R-C2-1),
  -- moving it 9 -> 10; and Run C3-A Phase 1 adds the single-entry-point
  -- closure (one REVOKE, no object), moving it 10 -> 11; and Run C3-A
  -- Phase 2b adds the governed Management submitted-report list (C2C-004 --
  -- one STABLE read function and one authenticated EXECUTE grant, no table,
  -- enum, label, policy or row), moving it 11 -> 12.
  SELECT count(*) INTO v_n FROM supabase_migrations.schema_migrations;
  IF v_n <> 13 THEN RAISE EXCEPTION 'FAIL A34: expected exactly 13 applied migrations, found %', v_n; END IF;

  SELECT count(*) INTO v_n
    FROM supabase_migrations.schema_migrations
   WHERE version IN ('20260803034500', '20260803154500', '20260804213000',
                     '20260805090000', '20260805090500', '20260806090000',
                     '20260806103000', '20260806160000', '20260806190000',
                     '20260806220000', '20260807090000', '20260807113000',
                     '20260809120000');
  IF v_n <> 13 THEN
    RAISE EXCEPTION 'FAIL A34: the applied versions are not exactly 20260803034500, 20260803154500, 20260804213000, 20260805090000, 20260805090500, 20260806090000, 20260806103000, 20260806160000, 20260806190000, 20260806220000, 20260807090000, 20260807113000 and 20260809120000';
  END IF;

  -- A35: exactly the thirty-one public project functions exist -- the six
  -- Step 7G authorization helpers, the four Step 7H audit functions, the
  -- eighteen Step 7I lifecycle functions, the two assessment functions and
  -- the one correction-tracking read.
  -- The six helpers stay STABLE, SECURITY DEFINER, search-path pinned and
  -- authenticated-only executable; each Step 7H function is checked
  -- against the exact contract derived from the committed migration,
  -- including zero EXECUTE for every client role and for PUBLIC.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public';
  IF v_n <> 36 THEN
    RAISE EXCEPTION 'FAIL A35: expected exactly 36 functions in schema public (6 Step 7G + 4 Step 7H + 18 Step 7I + 2 assessment + 1 correction tracking + 1 report-context resolver + 1 atomic complete-save composer + 1 Management submitted-report list + 2 OD-4 V2 hash serializers), found %', v_n;
  END IF;

  -- A35 (report-context resolver, R-22): the one governed key translation.
  -- postgres-owned SECURITY DEFINER plpgsql with a pinned EMPTY search_path,
  -- non-STRICT, STABLE (so the engine itself forbids it writing or appending
  -- to the audit chain), taking EXACTLY ONE argument -- the governed report
  -- identifier, and no caller-supplied centre, session or student.
  -- authenticated EXECUTE and nothing else.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    JOIN pg_catalog.pg_language l ON l.oid = p.prolang
   WHERE n.nspname = 'public'
     AND p.proname = 'report_resolve_context'
     AND pg_catalog.pg_get_userbyid(p.proowner) = 'postgres'
     AND l.lanname = 'plpgsql'
     AND p.prosecdef
     AND NOT p.proisstrict
     AND p.pronargs = 1
     AND p.provolatile = 's'
     AND p.proconfig IS NOT NULL
     AND 'search_path=""' = ANY (p.proconfig)
     AND has_function_privilege('authenticated', p.oid, 'EXECUTE')
     AND NOT has_function_privilege('anon',          p.oid, 'EXECUTE')
     AND NOT has_function_privilege('service_role',  p.oid, 'EXECUTE')
     AND NOT has_function_privilege('authenticator', p.oid, 'EXECUTE')
     AND NOT EXISTS (SELECT 1 FROM pg_catalog.aclexplode(p.proacl) ae WHERE ae.grantee = 0);
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'FAIL A35: report_resolve_context does not satisfy its full ratified contract';
  END IF;

  -- A35 (report-context resolver): the EXACT projection -- one uuid in, two
  -- uuid identifiers out, and NOTHING else. Asserted from the catalogue so a
  -- later widening fails the canonical verifier and not only the migration
  -- that introduced it.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname = 'report_resolve_context'
     AND p.proargnames = ARRAY['p_report_id', 'class_session_id', 'student_id']
     AND pg_catalog.pg_get_function_result(p.oid) = 'TABLE(class_session_id uuid, student_id uuid)';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'FAIL A35: report_resolve_context does not return exactly the two governed identifiers';
  END IF;

  -- A35 (correction tracking, U-B2-1): the one governed R-7 read. It is
  -- postgres-owned SECURITY DEFINER plpgsql with a pinned search_path,
  -- non-STRICT, ZERO-ARGUMENT (which is what makes a caller-supplied centre
  -- unrepresentable) and STABLE (so the engine itself forbids it writing or
  -- appending to the audit chain). authenticated EXECUTE and nothing else.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    JOIN pg_catalog.pg_language l ON l.oid = p.prolang
   WHERE n.nspname = 'public'
     AND p.proname = 'report_list_management_corrections'
     AND pg_catalog.pg_get_userbyid(p.proowner) = 'postgres'
     AND l.lanname = 'plpgsql'
     AND p.prosecdef
     AND NOT p.proisstrict
     AND p.pronargs = 0
     AND p.provolatile = 's'
     AND p.proconfig IS NOT NULL
     AND p.proconfig::text LIKE '%search_path=%'
     AND has_function_privilege('authenticated', p.oid, 'EXECUTE')
     AND NOT has_function_privilege('anon',          p.oid, 'EXECUTE')
     AND NOT has_function_privilege('service_role',  p.oid, 'EXECUTE')
     AND NOT has_function_privilege('authenticator', p.oid, 'EXECUTE')
     AND NOT EXISTS (SELECT 1 FROM pg_catalog.aclexplode(p.proacl) ae WHERE ae.grantee = 0);
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'FAIL A35: report_list_management_corrections does not satisfy its full ratified contract';
  END IF;

  -- A35 (correction tracking): the EXACT bounded projection. Asserted from
  -- the catalogue so it holds against the APPLIED signature, and stated
  -- here as well as in the migration so a later widening fails the
  -- canonical verifier and not only the migration that introduced it.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname = 'report_list_management_corrections'
     AND p.proargnames = ARRAY[
       'report_id', 'student_id', 'student_display_name', 'class_session_id',
       'session_date', 'report_status', 'correction_request_id', 'issue_scope',
       'correction_reason', 'correction_status', 'returned_at',
       'trainer_correction_submitted', 'tracking_updated_at'];
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'FAIL A35: report_list_management_corrections does not return exactly the thirteen bounded tracking columns';
  END IF;

  -- A35 (assessment, CP-2/CP-4): the two governed assessment functions.
  -- Both postgres-owned SECURITY DEFINER plpgsql with a pinned search_path
  -- and non-STRICT; the save VOLATILE, the read STABLE (so the engine itself
  -- forbids it writing); and NO client role but `authenticated` reaches
  -- either, with no PUBLIC entry in the ACL.
  --
  -- (Reconciled at Run C3-A Phase 1. `assessment_save_observation` no longer
  --  holds `authenticated` EXECUTE: keeping it made the R-C2-1 atomicity a
  --  property of ONE ROUTE rather than of the database, because any
  --  authenticated caller could commit a COMPLETE nine-rating assessment
  --  through PostgREST with no report shell. The client entry point for a
  --  complete save is now the composer alone. The assertion is SPLIT rather
  --  than relaxed: the READ still requires the grant, the SAVE now requires
  --  its ABSENCE, and both still require zero reach for every other role.)
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    JOIN pg_catalog.pg_language l ON l.oid = p.prolang
   WHERE n.nspname = 'public'
     AND p.proname IN ('assessment_save_observation', 'assessment_get_trainer_observation')
     AND pg_catalog.pg_get_userbyid(p.proowner) = 'postgres'
     AND l.lanname = 'plpgsql'
     AND p.prosecdef
     AND NOT p.proisstrict
     AND p.proconfig IS NOT NULL
     AND p.proconfig::text LIKE '%search_path=%'
     AND ((p.proname = 'assessment_save_observation'         AND p.provolatile = 'v')
       OR (p.proname = 'assessment_get_trainer_observation'  AND p.provolatile = 's'))
     AND ((p.proname = 'assessment_get_trainer_observation'
           AND has_function_privilege('authenticated', p.oid, 'EXECUTE'))
       OR (p.proname = 'assessment_save_observation'
           AND NOT has_function_privilege('authenticated', p.oid, 'EXECUTE')))
     AND NOT has_function_privilege('anon',          p.oid, 'EXECUTE')
     AND NOT has_function_privilege('service_role',  p.oid, 'EXECUTE')
     AND NOT has_function_privilege('authenticator', p.oid, 'EXECUTE')
     AND NOT EXISTS (SELECT 1 FROM pg_catalog.aclexplode(p.proacl) ae WHERE ae.grantee = 0);
  IF v_n <> 2 THEN
    RAISE EXCEPTION 'FAIL A35: expected the 2 assessment functions to satisfy their full ratified contract, matched %', v_n;
  END IF;

  -- A35 (Run C3-A Phase 1): THE CLOSURE, stated as a canonical-verifier
  -- property rather than only as a migration assertion. Of every function a
  -- client may execute, EXACTLY ONE reaches the observation write, and it
  -- is the composer -- whose body also walks T0 and T1. So a complete
  -- nine-rating observation cannot commit through any client-reachable
  -- object without a report shell committing in the same transaction.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND has_function_privilege('authenticated', p.oid, 'EXECUTE')
     AND p.prosrc LIKE '%assessment_save_observation%';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'FAIL A35: % client-reachable function(s) reach the observation write, expected exactly 1 (the R-C2-1 composer)', v_n;
  END IF;
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND has_function_privilege('authenticated', p.oid, 'EXECUTE')
     AND p.proname = 'assessment_save_complete_and_open_report'
     AND p.prosrc LIKE '%public.assessment_save_observation(%'
     AND p.prosrc LIKE '%public.report_create(%'
     AND p.prosrc LIKE '%public.report_mark_observation_saved(%';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'FAIL A35: the single client-reachable observation-write route is not the composer, or no longer opens the report shell in the same body';
  END IF;

  -- A35 (Step 7I): all eighteen new functions exist, exactly once each, are
  -- owned by postgres, are LANGUAGE plpgsql (section 5.1 pins the language
  -- so no `LANGUAGE sql` body can reintroduce the enum parse-analysis
  -- hazard) and pin an empty search_path.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    JOIN pg_catalog.pg_language l ON l.oid = p.prolang
   WHERE n.nspname = 'public'
     AND p.proname IN ('report_create','report_mark_observation_saved','report_request_draft',
                       'report_store_draft','report_cancel_draft','report_save_edit',
                       'report_update_checklist','report_trainer_approve',
                       'report_management_edit_wording','report_management_return_to_trainer',
                       'report_management_approve_and_submit','report_reopen_submitted',
                       'report_get_canonical','report_get_working','report_get_management_review',
                       'app_parent_reaches_student','report_content_hash_v1','report_wording_hash_v1')
     AND pg_catalog.pg_get_userbyid(p.proowner) = 'postgres'
     AND l.lanname = 'plpgsql'
     AND p.proconfig IS NOT NULL
     AND p.proconfig::text LIKE '%search_path=%';
  IF v_n <> 18 THEN
    RAISE EXCEPTION 'FAIL A35: expected the 18 Step 7I functions to be postgres-owned plpgsql with a pinned search_path, matched %', v_n;
  END IF;

  -- A35 (Step 7I): the EXECUTE census. EXACTLY fourteen Step 7I functions
  -- hold `authenticated` EXECUTE -- the fourteen client-callable RPCs and
  -- nothing else.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname IN ('report_create','report_mark_observation_saved','report_request_draft',
                       'report_cancel_draft','report_save_edit','report_update_checklist',
                       'report_trainer_approve','report_management_edit_wording',
                       'report_management_return_to_trainer','report_management_approve_and_submit',
                       'report_reopen_submitted','report_get_canonical','report_get_working',
                       'report_get_management_review')
     AND has_function_privilege('authenticated', p.oid, 'EXECUTE')
     AND NOT has_function_privilege('anon',          p.oid, 'EXECUTE')
     AND NOT has_function_privilege('service_role',  p.oid, 'EXECUTE')
     AND NOT has_function_privilege('authenticator', p.oid, 'EXECUTE');
  IF v_n <> 14 THEN
    RAISE EXCEPTION 'FAIL A35: expected exactly 14 authenticated-callable Step 7I RPCs, matched %', v_n;
  END IF;

  -- A35 (Step 7I): the FOUR zero-EXECUTE functions. report_store_draft and
  -- both serializers are zero-EXECUTE by GOVERNANCE PROHIBITION (R-27,
  -- R-26); app_parent_reaches_student is zero-EXECUTE by MINIMUM PRIVILEGE
  -- (R-31) and may be granted later, but only together with the policy or
  -- client consumer that needs it.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname IN ('report_store_draft','report_content_hash_v1',
                       'report_wording_hash_v1','app_parent_reaches_student',
                       'report_content_hash_v2','report_wording_hash_v2')
     AND NOT has_function_privilege('authenticated', p.oid, 'EXECUTE')
     AND NOT has_function_privilege('anon',          p.oid, 'EXECUTE')
     AND NOT has_function_privilege('service_role',  p.oid, 'EXECUTE')
     AND NOT has_function_privilege('authenticator', p.oid, 'EXECUTE')
     AND p.proacl IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_catalog.aclexplode(p.proacl) ae WHERE ae.grantee = 0);
  IF v_n <> 6 THEN
    RAISE EXCEPTION 'FAIL A35: expected exactly 6 Step 7I/OD-4 functions with zero client EXECUTE including PUBLIC, matched %', v_n;
  END IF;

  -- A35 (Step 7I): both serializers are IMMUTABLE, NOT STRICT (a NULL panel
  -- is a legal, meaningful value serialized as the `N` tag), PARALLEL SAFE
  -- and SECURITY INVOKER -- invoker rights are safe precisely because their
  -- only legitimate callers already run as postgres.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname IN ('report_content_hash_v1','report_wording_hash_v1')
     AND p.provolatile = 'i'
     AND NOT p.proisstrict
     AND p.proparallel = 's'
     AND NOT p.prosecdef;
  IF v_n <> 2 THEN
    RAISE EXCEPTION 'FAIL A35: the two Step 7I serializers must be IMMUTABLE, not STRICT, PARALLEL SAFE and SECURITY INVOKER, matched %', v_n;
  END IF;

  -- A35 (Step 7I): the fifteen RPCs and the parent helper are all
  -- SECURITY DEFINER; the three reads and the helper are STABLE and the
  -- twelve mutations are VOLATILE.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname IN ('report_create','report_mark_observation_saved','report_request_draft',
                       'report_store_draft','report_cancel_draft','report_save_edit',
                       'report_update_checklist','report_trainer_approve',
                       'report_management_edit_wording','report_management_return_to_trainer',
                       'report_management_approve_and_submit','report_reopen_submitted')
     AND p.prosecdef AND p.provolatile = 'v';
  IF v_n <> 12 THEN
    RAISE EXCEPTION 'FAIL A35: expected 12 VOLATILE SECURITY DEFINER Step 7I mutation RPCs, matched %', v_n;
  END IF;
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname IN ('report_get_canonical','report_get_working',
                       'report_get_management_review','app_parent_reaches_student')
     AND p.prosecdef AND p.provolatile = 's';
  IF v_n <> 4 THEN
    RAISE EXCEPTION 'FAIL A35: expected 4 STABLE SECURITY DEFINER Step 7I read/helper functions, matched %', v_n;
  END IF;

  -- A35 (Step 7I): the eight ordered report_status labels. The physical
  -- pg_enum sort order must equal A-036, CLAUDE.md section 6 and the Step 7I
  -- baseline -- a bare ADD VALUE would have appended `trainer_approved`
  -- eighth and silently disagreed with all three.
  IF (SELECT array_agg(e.enumlabel::text ORDER BY e.enumsortorder)
        FROM pg_catalog.pg_enum e
        JOIN pg_catalog.pg_type t ON t.oid = e.enumtypid
        JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
       WHERE n.nspname = 'public' AND t.typname = 'report_status')
     IS DISTINCT FROM ARRAY['incomplete','observation_saved','drafting','draft_ready',
                            'needs_edit','trainer_approved','approved','submitted'] THEN
    RAISE EXCEPTION 'FAIL A35: report_status labels or their physical order do not match the ratified eight';
  END IF;

  -- A35 (Backend V2): the four ratified competency_rating labels and their
  -- physical sort order (A-049). RENAME VALUE leaves pg_enum.enumsortorder
  -- untouched, so this also proves the ordinal semantics survived the rename
  -- -- an assertion pinned to the superseded labels would instead pass while
  -- checking for values that no longer exist (A-052's named failure mode).
  -- This is the competency scale, NOT Class Grade: class_grade_code is
  -- asserted separately and is unchanged (A-054).
  IF (SELECT array_agg(e.enumlabel::text ORDER BY e.enumsortorder)
        FROM pg_catalog.pg_enum e
        JOIN pg_catalog.pg_type t ON t.oid = e.enumtypid
        JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
       WHERE n.nspname = 'public' AND t.typname = 'competency_rating')
     IS DISTINCT FROM ARRAY['beginning','developing','mastering','mastered'] THEN
    RAISE EXCEPTION 'FAIL A35: competency_rating labels or their physical order do not match the ratified four (A-049)';
  END IF;

  -- A35 (A-054): the Class Grade vocabulary is a DIFFERENT closed set and is
  -- expressly unchanged by Amendment 006. Pinned here so a future vocabulary
  -- edit that strays into class_grade_code fails loudly.
  IF (SELECT array_agg(e.enumlabel::text ORDER BY e.enumsortorder)
        FROM pg_catalog.pg_enum e
        JOIN pg_catalog.pg_type t ON t.oid = e.enumtypid
        JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
       WHERE n.nspname = 'public' AND t.typname = 'class_grade_code')
     IS DISTINCT FROM ARRAY['beginner','intermediate','advanced'] THEN
    RAISE EXCEPTION 'FAIL A35: class_grade_code must remain beginner/intermediate/advanced, unchanged (A-054)';
  END IF;

  -- A35 (Step 7I): exactly 12 enums, and the approvals default drop.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_type t
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN
    RAISE EXCEPTION 'FAIL A35: expected exactly 12 enum types in public, found %', v_n;
  END IF;
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_attrdef d
    JOIN pg_catalog.pg_attribute a ON a.attrelid = d.adrelid AND a.attnum = d.adnum
   WHERE d.adrelid = 'public.report_version_approvals'::regclass AND a.attname = 'approver_role';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL A35: report_version_approvals.approver_role still carries a DEFAULT (A-040 item 5)';
  END IF;

  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname IN ('app_current_account_id','app_has_active_membership','app_is_own_membership',
                       'app_is_own_active_membership','app_trainer_reaches_session','app_trainer_reaches_module')
     AND p.provolatile = 's'
     AND p.prosecdef
     AND p.proconfig IS NOT NULL
     AND p.proconfig::text LIKE '%search_path=%'
     AND has_function_privilege('authenticated', p.oid, 'EXECUTE')
     AND NOT has_function_privilege('anon',          p.oid, 'EXECUTE')
     AND NOT has_function_privilege('service_role',  p.oid, 'EXECUTE')
     AND NOT has_function_privilege('authenticator', p.oid, 'EXECUTE');
  IF v_n <> 6 THEN
    RAISE EXCEPTION 'FAIL A35: the 6 Step 7G helpers must all be STABLE SECURITY DEFINER, search-path pinned and authenticated-only (matched %)', v_n;
  END IF;

  -- audit_canonical_json(jsonb): IMMUTABLE, STRICT, PARALLEL SAFE,
  -- SECURITY INVOKER, search-path pinned, zero client EXECUTE (incl.
  -- PUBLIC). The regprocedure signature is the same form the committed
  -- migration itself uses to REVOKE, so its successful resolution here is
  -- also proof the applied function matches the ratified identity.
  BEGIN
    v_oid := 'public.audit_canonical_json(jsonb)'::regprocedure::oid;
  EXCEPTION WHEN undefined_function THEN
    RAISE EXCEPTION 'FAIL A35: public.audit_canonical_json(jsonb) does not exist with the expected signature';
  END;
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p
   WHERE p.oid = v_oid
     AND pg_catalog.pg_get_userbyid(p.proowner) = 'postgres'
     AND p.provolatile = 'i' AND p.proisstrict AND p.proparallel = 's' AND NOT p.prosecdef
     AND p.proconfig IS NOT NULL AND p.proconfig::text LIKE '%search_path=%'
     AND NOT has_function_privilege('authenticated', p.oid, 'EXECUTE')
     AND NOT has_function_privilege('anon',          p.oid, 'EXECUTE')
     AND NOT has_function_privilege('service_role',  p.oid, 'EXECUTE')
     AND NOT has_function_privilege('authenticator', p.oid, 'EXECUTE')
     AND NOT (p.proacl IS NOT NULL AND (p.proacl::text LIKE '{=%' OR p.proacl::text LIKE '%,=%'));
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'FAIL A35: audit_canonical_json must be owner postgres, IMMUTABLE, STRICT, PARALLEL SAFE, SECURITY INVOKER, search-path pinned, with zero client EXECUTE (including PUBLIC)';
  END IF;

  -- audit_append_event(...): VOLATILE, SECURITY DEFINER, not STRICT
  -- (several parameters are legitimately nullable), search-path pinned,
  -- zero client EXECUTE. The 13-type identity list matches only the IN
  -- parameters; the two OUT parameters are excluded from the identity
  -- signature by PostgreSQL itself.
  BEGIN
    v_oid := 'public.audit_append_event(uuid, uuid, uuid, public.centre_membership_role, text, text, text, text, text, uuid, text, jsonb, jsonb)'::regprocedure::oid;
  EXCEPTION WHEN undefined_function THEN
    RAISE EXCEPTION 'FAIL A35: public.audit_append_event(...) does not exist with the expected 13-argument signature';
  END;
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p
   WHERE p.oid = v_oid
     AND pg_catalog.pg_get_userbyid(p.proowner) = 'postgres'
     AND p.provolatile = 'v' AND NOT p.proisstrict AND p.prosecdef
     AND p.proconfig IS NOT NULL AND p.proconfig::text LIKE '%search_path=%'
     AND NOT has_function_privilege('authenticated', p.oid, 'EXECUTE')
     AND NOT has_function_privilege('anon',          p.oid, 'EXECUTE')
     AND NOT has_function_privilege('service_role',  p.oid, 'EXECUTE')
     AND NOT has_function_privilege('authenticator', p.oid, 'EXECUTE')
     AND NOT (p.proacl IS NOT NULL AND (p.proacl::text LIKE '{=%' OR p.proacl::text LIKE '%,=%'));
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'FAIL A35: audit_append_event must be owner postgres, VOLATILE, SECURITY DEFINER, not STRICT, search-path pinned, with zero client EXECUTE (including PUBLIC)';
  END IF;

  -- audit_verify_chain(uuid, bigint, bigint): STABLE, SECURITY DEFINER,
  -- not STRICT (all three parameters default to NULL), search-path
  -- pinned, zero client EXECUTE. RETURNS TABLE columns are OUT parameters
  -- and are likewise excluded from the identity signature.
  BEGIN
    v_oid := 'public.audit_verify_chain(uuid, bigint, bigint)'::regprocedure::oid;
  EXCEPTION WHEN undefined_function THEN
    RAISE EXCEPTION 'FAIL A35: public.audit_verify_chain(uuid, bigint, bigint) does not exist with the expected signature';
  END;
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p
   WHERE p.oid = v_oid
     AND pg_catalog.pg_get_userbyid(p.proowner) = 'postgres'
     AND p.provolatile = 's' AND NOT p.proisstrict AND p.prosecdef
     AND p.proconfig IS NOT NULL AND p.proconfig::text LIKE '%search_path=%'
     AND NOT has_function_privilege('authenticated', p.oid, 'EXECUTE')
     AND NOT has_function_privilege('anon',          p.oid, 'EXECUTE')
     AND NOT has_function_privilege('service_role',  p.oid, 'EXECUTE')
     AND NOT has_function_privilege('authenticator', p.oid, 'EXECUTE')
     AND NOT (p.proacl IS NOT NULL AND (p.proacl::text LIKE '{=%' OR p.proacl::text LIKE '%,=%'));
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'FAIL A35: audit_verify_chain must be owner postgres, STABLE, SECURITY DEFINER, not STRICT, search-path pinned, with zero client EXECUTE (including PUBLIC)';
  END IF;

  -- audit_block_mutation(): the shared trigger-guard helper. VOLATILE
  -- (the plpgsql default; never declared otherwise), SECURITY INVOKER
  -- (never declared SECURITY DEFINER), not STRICT, search-path pinned,
  -- zero client EXECUTE -- it is implementation support for the three
  -- guard triggers, not a fourth audit API.
  BEGIN
    v_oid := 'public.audit_block_mutation()'::regprocedure::oid;
  EXCEPTION WHEN undefined_function THEN
    RAISE EXCEPTION 'FAIL A35: public.audit_block_mutation() does not exist with the expected signature';
  END;
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p
   WHERE p.oid = v_oid
     AND pg_catalog.pg_get_userbyid(p.proowner) = 'postgres'
     AND p.provolatile = 'v' AND NOT p.proisstrict AND NOT p.prosecdef
     AND p.proconfig IS NOT NULL AND p.proconfig::text LIKE '%search_path=%'
     AND NOT has_function_privilege('authenticated', p.oid, 'EXECUTE')
     AND NOT has_function_privilege('anon',          p.oid, 'EXECUTE')
     AND NOT has_function_privilege('service_role',  p.oid, 'EXECUTE')
     AND NOT has_function_privilege('authenticator', p.oid, 'EXECUTE')
     AND NOT (p.proacl IS NOT NULL AND (p.proacl::text LIKE '{=%' OR p.proacl::text LIKE '%,=%'));
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'FAIL A35: audit_block_mutation must be owner postgres, VOLATILE, SECURITY INVOKER, not STRICT, search-path pinned, with zero client EXECUTE (including PUBLIC)';
  END IF;

  IF (SELECT count(*) FROM public.centres) <> 1
  OR (SELECT count(*) FROM public.class_grades) <> 3
  OR (SELECT count(*) FROM public.assessment_dimensions) <> 9 THEN
    RAISE EXCEPTION 'FAIL A36: the Step 7E seed boundary (1 centre, 3 grades, 9 dimensions) diverged';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.centres
     WHERE id = 'b0000000-0000-4000-8000-000000000001'
       AND code = 'ispeak' AND display_name = 'iSpeak Academy') THEN
    RAISE EXCEPTION 'FAIL A37: the ratified seed centre is missing or altered';
  END IF;

  -- A38: zero project views and materialized views; exactly the three
  -- enabled Step 7H append-only audit guards. This file no longer asserts
  -- zero user triggers -- three are now ratified -- so the check is split
  -- into an independent view/matview census and an exact guard-trigger
  -- inventory (name, owning table, trigger function, enabled state,
  -- statement-level posture and event scope, all checked together).
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'v';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL A38: % view(s) exist in public; expected 0', v_n;
  END IF;

  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'm';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL A38: % materialized view(s) exist in public; expected 0', v_n;
  END IF;

  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_trigger t
    JOIN pg_catalog.pg_class c ON c.oid = t.tgrelid
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND NOT t.tgisinternal;
  IF v_n <> 3 THEN
    RAISE EXCEPTION 'FAIL A38: expected exactly 3 non-internal triggers in public (the Step 7H audit guards), found %', v_n;
  END IF;

  -- tgtype 26 = BEFORE(2) + UPDATE(16) + DELETE(8), statement-level (ROW
  -- bit 1 absent); tgtype 10 = BEFORE(2) + DELETE(8) only. Both values are
  -- the same encoding the committed migration's own end-of-migration
  -- assertions (B15) proved against these exact triggers.
  SELECT count(*) INTO v_n
    FROM (VALUES
      ('audit_events_block_update_delete_trg',        'audit_events',        26),
      ('audit_event_targets_block_update_delete_trg', 'audit_event_targets', 26),
      ('audit_chain_heads_block_delete_trg',          'audit_chain_heads',   10)
    ) AS expected(trgname, tblname, tgtype)
   WHERE NOT EXISTS (
     SELECT 1
       FROM pg_catalog.pg_trigger t
       JOIN pg_catalog.pg_class c ON c.oid = t.tgrelid
       JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
       JOIN pg_catalog.pg_proc p ON p.oid = t.tgfoid
      WHERE n.nspname = 'public'
        AND NOT t.tgisinternal
        AND t.tgname = expected.trgname
        AND c.relname = expected.tblname
        AND t.tgtype = expected.tgtype
        AND t.tgenabled = 'O'
        AND p.proname = 'audit_block_mutation');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL A38: % Step 7H audit guard trigger(s) are missing, misscoped, disabled or misbound', v_n;
  END IF;

  RAISE NOTICE 'SECTION A: all positive assertions passed.';
END;
$verify_positive$;

-- =====================================================================
-- SECTION B -- Canonical representation for the SHA-256 checksum
-- =====================================================================
-- Deterministic by construction: explicit table order (the `ord` column),
-- explicit row order, explicit column order, a stable NULL token and a
-- stable timestamp format. The loader hashes exactly the lines between
-- the two markers.
--
-- The Auth contribution is the canonical identity projection only -- the
-- fixed Auth id and the normalized email. Provider-managed volatile
-- internals (Auth created/updated timestamps, sessions, refresh tokens,
-- unratified provider metadata) are deliberately EXCLUDED, because they
-- are not fixture identity and would make a deterministic checksum
-- impossible. This excludes volatility; it introduces no runtime-generated
-- fixture identity -- every fixture id below is a ratified fixed literal.

-- Tuples-only, unaligned, no footer: the hashed region must contain the
-- canonical rows and nothing else -- no column header, no rule line and
-- no "(N rows)" footer.
\pset tuples_only on
\pset format unaligned
\pset footer off

\echo '<<<BEST_COACH_FIXTURE_CANONICAL_BEGIN>>>'

-- `n` is the stable NULL token; `tsfmt` renders every timestamptz as a
-- UTC instant with an explicit literal Z, so the representation is
-- unambiguous and independent of the session TimeZone setting.
WITH cfg AS (SELECT 'NULL'::text AS n, 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'::text AS tsfmt)
SELECT line FROM (
  SELECT 0 AS ord, row_number() OVER (ORDER BY u.id) AS seq,
         'auth_identity|' || u.id::text || '|' || lower(btrim(u.email)) AS line
    FROM auth.users u, cfg
   WHERE lower(btrim(u.email)) IN ('management.fixture@example.test','trainer.fixture@example.test','parent.fixture@example.test')

  UNION ALL
  SELECT 1, row_number() OVER (ORDER BY a.id),
         'accounts|' || a.id::text
           || '|' || coalesce(a.auth_user_id::text, cfg.n)
           || '|' || a.display_name
           || '|' || a.normalized_email
           || '|' || a.status::text
           || '|' || to_char(a.created_at AT TIME ZONE 'UTC', cfg.tsfmt)
           || '|' || to_char(a.updated_at AT TIME ZONE 'UTC', cfg.tsfmt)
           || '|' || coalesce(to_char(a.deactivated_at AT TIME ZONE 'UTC', cfg.tsfmt), cfg.n)
    FROM public.accounts a, cfg WHERE a.id::text LIKE 'c0000000-%'

  UNION ALL
  SELECT 2, row_number() OVER (ORDER BY m.id),
         'centre_memberships|' || m.id::text
           || '|' || m.account_id::text || '|' || m.centre_id::text
           || '|' || m.role::text || '|' || m.status::text
           || '|' || to_char(m.created_at AT TIME ZONE 'UTC', cfg.tsfmt)
           || '|' || to_char(m.updated_at AT TIME ZONE 'UTC', cfg.tsfmt)
           || '|' || coalesce(to_char(m.activated_at AT TIME ZONE 'UTC', cfg.tsfmt), cfg.n)
           || '|' || coalesce(to_char(m.deactivated_at AT TIME ZONE 'UTC', cfg.tsfmt), cfg.n)
    FROM public.centre_memberships m, cfg WHERE m.id::text LIKE 'c1000000-%'

  UNION ALL
  SELECT 3, row_number() OVER (ORDER BY t.membership_id),
         'trainer_profiles|' || t.membership_id::text || '|' || t.centre_id::text
           || '|' || t.membership_role::text
           || '|' || to_char(t.created_at AT TIME ZONE 'UTC', cfg.tsfmt)
           || '|' || to_char(t.updated_at AT TIME ZONE 'UTC', cfg.tsfmt)
    FROM public.trainer_profiles t, cfg WHERE t.membership_id::text LIKE 'c1000000-%'

  UNION ALL
  SELECT 4, row_number() OVER (ORDER BY p.membership_id),
         'parent_profiles|' || p.membership_id::text || '|' || p.centre_id::text
           || '|' || p.membership_role::text
           || '|' || to_char(p.created_at AT TIME ZONE 'UTC', cfg.tsfmt)
           || '|' || to_char(p.updated_at AT TIME ZONE 'UTC', cfg.tsfmt)
    FROM public.parent_profiles p, cfg WHERE p.membership_id::text LIKE 'c1000000-%'

  UNION ALL
  SELECT 5, row_number() OVER (ORDER BY s.id),
         'students|' || s.id::text || '|' || s.centre_id::text || '|' || s.full_name
           || '|' || s.is_active::text
           || '|' || to_char(s.created_at AT TIME ZONE 'UTC', cfg.tsfmt)
           || '|' || to_char(s.updated_at AT TIME ZONE 'UTC', cfg.tsfmt)
           || '|' || coalesce(to_char(s.deactivated_at AT TIME ZONE 'UTC', cfg.tsfmt), cfg.n)
    FROM public.students s, cfg WHERE s.id::text LIKE 'c2000000-%'

  UNION ALL
  SELECT 6, row_number() OVER (ORDER BY l.id),
         'parent_student_links|' || l.id::text || '|' || l.centre_id::text
           || '|' || l.parent_membership_id::text || '|' || l.parent_role::text
           || '|' || l.student_id::text || '|' || l.is_active::text
           || '|' || to_char(l.linked_at AT TIME ZONE 'UTC', cfg.tsfmt)
           || '|' || coalesce(to_char(l.unlinked_at AT TIME ZONE 'UTC', cfg.tsfmt), cfg.n)
           || '|' || to_char(l.created_at AT TIME ZONE 'UTC', cfg.tsfmt)
    FROM public.parent_student_links l, cfg WHERE l.id::text LIKE 'c3000000-%'

  UNION ALL
  SELECT 7, row_number() OVER (ORDER BY cm.id),
         'class_modules|' || cm.id::text || '|' || cm.centre_id::text
           || '|' || cm.class_grade_id::text || '|' || cm.title
           || '|' || cm.is_active::text
           || '|' || to_char(cm.created_at AT TIME ZONE 'UTC', cfg.tsfmt)
           || '|' || to_char(cm.updated_at AT TIME ZONE 'UTC', cfg.tsfmt)
           || '|' || coalesce(to_char(cm.deactivated_at AT TIME ZONE 'UTC', cfg.tsfmt), cfg.n)
    FROM public.class_modules cm, cfg WHERE cm.id::text LIKE 'c4000000-%'

  UNION ALL
  SELECT 8, row_number() OVER (ORDER BY cs.id),
         'class_sessions|' || cs.id::text || '|' || cs.centre_id::text
           || '|' || cs.class_module_id::text
           || '|' || to_char(cs.session_date, 'YYYY-MM-DD')
           || '|' || coalesce(to_char(cs.starts_at, 'HH24:MI:SS'), cfg.n)
           || '|' || coalesce(to_char(cs.ends_at, 'HH24:MI:SS'), cfg.n)
           || '|' || to_char(cs.created_at AT TIME ZONE 'UTC', cfg.tsfmt)
           || '|' || to_char(cs.updated_at AT TIME ZONE 'UTC', cfg.tsfmt)
    FROM public.class_sessions cs, cfg WHERE cs.id::text LIKE 'c5000000-%'

  UNION ALL
  SELECT 9, row_number() OVER (ORDER BY e.id),
         'enrolments|' || e.id::text || '|' || e.centre_id::text
           || '|' || e.class_module_id::text || '|' || e.student_id::text
           || '|' || e.is_active::text
           || '|' || to_char(e.enrolled_at AT TIME ZONE 'UTC', cfg.tsfmt)
           || '|' || coalesce(to_char(e.withdrawn_at AT TIME ZONE 'UTC', cfg.tsfmt), cfg.n)
           || '|' || to_char(e.created_at AT TIME ZONE 'UTC', cfg.tsfmt)
    FROM public.enrolments e, cfg WHERE e.id::text LIKE 'c6000000-%'

  UNION ALL
  SELECT 10, row_number() OVER (ORDER BY sa.id),
         'class_session_assignments|' || sa.id::text || '|' || sa.centre_id::text
           || '|' || sa.class_session_id::text || '|' || sa.trainer_membership_id::text
           || '|' || sa.trainer_role::text || '|' || sa.is_active::text
           || '|' || to_char(sa.assigned_at AT TIME ZONE 'UTC', cfg.tsfmt)
           || '|' || coalesce(to_char(sa.unassigned_at AT TIME ZONE 'UTC', cfg.tsfmt), cfg.n)
           || '|' || to_char(sa.created_at AT TIME ZONE 'UTC', cfg.tsfmt)
    FROM public.class_session_assignments sa, cfg WHERE sa.id::text LIKE 'c7000000-%'

  UNION ALL
  SELECT 11, row_number() OVER (ORDER BY at.id),
         'attendance|' || at.id::text || '|' || at.centre_id::text
           || '|' || at.class_session_id::text || '|' || at.class_module_id::text
           || '|' || at.student_id::text || '|' || at.enrolment_id::text
           || '|' || at.status::text
           || '|' || coalesce(at.recorded_by_membership_id::text, cfg.n)
           || '|' || coalesce(at.recorded_by_role::text, cfg.n)
           || '|' || to_char(at.created_at AT TIME ZONE 'UTC', cfg.tsfmt)
           || '|' || to_char(at.updated_at AT TIME ZONE 'UTC', cfg.tsfmt)
    FROM public.attendance at, cfg WHERE at.id::text LIKE 'c8000000-%'

  UNION ALL
  SELECT 12, row_number() OVER (ORDER BY o.id),
         'observations|' || o.id::text || '|' || o.centre_id::text
           || '|' || o.class_session_id::text || '|' || o.class_module_id::text
           || '|' || o.student_id::text || '|' || o.enrolment_id::text
           || '|' || o.trainer_membership_id::text || '|' || o.trainer_role::text
           || '|' || o.strength_chips::text
           || '|' || o.focus_chips::text
           || '|' || coalesce(o.observation_notes, cfg.n)
           || '|' || coalesce(o.follow_up_notes, cfg.n)
           || '|' || coalesce(o.term_evidence_notes, cfg.n)
           || '|' || o.lock_version::text
           || '|' || to_char(o.created_at AT TIME ZONE 'UTC', cfg.tsfmt)
           || '|' || to_char(o.updated_at AT TIME ZONE 'UTC', cfg.tsfmt)
    FROM public.observations o, cfg WHERE o.id::text LIKE 'c9000000-%'

  UNION ALL
  SELECT 13, row_number() OVER (ORDER BY r.id),
         'observation_ratings|' || r.id::text || '|' || r.observation_id::text
           || '|' || r.dimension_code::text || '|' || r.rating::text
           || '|' || to_char(r.created_at AT TIME ZONE 'UTC', cfg.tsfmt)
           || '|' || to_char(r.updated_at AT TIME ZONE 'UTC', cfg.tsfmt)
    FROM public.observation_ratings r, cfg WHERE r.id::text LIKE 'ca000000-%'
) AS canonical
ORDER BY ord, seq;

\echo '<<<BEST_COACH_FIXTURE_CANONICAL_END>>>'

\pset tuples_only off
\pset format aligned
\pset footer on

-- =====================================================================
-- SECTION C -- Negative tests (always rolled back)
-- =====================================================================
-- Each attempt MUST fail. The pass condition is inverted: the exception
-- handler records a pass, and falling through without an exception raises,
-- because an attempt that unexpectedly SUCCEEDS is the real defect.
--
-- Each attempt lives in its own PL/pgSQL BEGIN ... EXCEPTION block, which
-- is an implicit savepoint, so a caught failure does not poison the
-- surrounding transaction. Only the expected SQLSTATE is caught.

BEGIN;

-- Each handler additionally asserts the EXACT constraint or index name that
-- rejected the statement, via GET STACKED DIAGNOSTICS. Without this a test
-- could "pass" because of an unrelated primary-key collision or a different
-- constraint entirely, which would prove nothing.
DO $verify_negative$
DECLARE
  v_passed integer := 0;
  v_col_exists boolean;
  v_constraint text;
BEGIN
  -- N1 -- duplicate ACTIVE normalized account email
  --       rejected by accounts_one_active_per_normalized_email_idx (23505)
  BEGIN
    INSERT INTO public.accounts (id, auth_user_id, display_name, normalized_email, status, created_at, updated_at)
    VALUES ('ce000000-0000-4000-8000-000000000001', NULL, 'Negative Test One',
            'management.fixture@example.test', 'active', '2026-01-05 09:00:00+08', '2026-01-05 09:00:00+08');
    RAISE EXCEPTION 'FAIL N1: a duplicate ACTIVE account email was accepted; the partial unique index did not reject it';
  EXCEPTION
    WHEN unique_violation THEN
      GET STACKED DIAGNOSTICS v_constraint = CONSTRAINT_NAME;
      IF v_constraint <> 'accounts_one_active_per_normalized_email_idx' THEN
        RAISE EXCEPTION 'FAIL N1: rejected by "%" rather than accounts_one_active_per_normalized_email_idx', v_constraint;
      END IF;
      v_passed := v_passed + 1;
  END;

  -- N2 -- second ACTIVE management membership in the same centre
  --       rejected by centre_memberships_one_active_management_per_centre_idx (23505)
  --
  -- The account used here must hold NO active membership in the centre.
  -- All three fixture accounts already do, so re-using one would ALSO breach
  -- centre_memberships_one_active_per_account_centre_idx -- two partial
  -- unique indexes covering the same candidate row -- and PostgreSQL reports
  -- whichever index it reaches first, which is the account-centre one. This
  -- test would then "pass" on the wrong invariant, or fail spuriously.
  -- A scratch account is therefore inserted first, inside this block, so
  -- that exactly ONE invariant can fire. The caught exception rolls this
  -- block's implicit subtransaction back, so neither row survives even
  -- before Section C's outer ROLLBACK.
  BEGIN
    INSERT INTO public.accounts (id, auth_user_id, display_name, normalized_email, status, created_at, updated_at)
    VALUES ('ce200000-0000-4000-8000-000000000002', NULL, 'Negative Test Two',
            'negative.two@example.test', 'active', '2026-01-05 09:00:00+08', '2026-01-05 09:00:00+08');
    INSERT INTO public.centre_memberships (id, account_id, centre_id, role, status, created_at, updated_at, activated_at)
    VALUES ('ce100000-0000-4000-8000-000000000002', 'ce200000-0000-4000-8000-000000000002',
            'b0000000-0000-4000-8000-000000000001', 'management', 'active',
            '2026-01-05 09:00:00+08', '2026-01-05 09:00:00+08', '2026-01-05 09:00:00+08');
    RAISE EXCEPTION 'FAIL N2: a second ACTIVE management membership was accepted for the centre';
  EXCEPTION
    WHEN unique_violation THEN
      GET STACKED DIAGNOSTICS v_constraint = CONSTRAINT_NAME;
      IF v_constraint <> 'centre_memberships_one_active_management_per_centre_idx' THEN
        RAISE EXCEPTION 'FAIL N2: rejected by "%" rather than centre_memberships_one_active_management_per_centre_idx', v_constraint;
      END IF;
      v_passed := v_passed + 1;
  END;

  -- N3 -- cross-centre parent-student relationship
  --       rejected by a same-centre composite foreign key (23503)
  --
  -- The link is written INACTIVE on purpose. An active row would repeat the
  -- fixture's own (parent_membership_id, student_id) pair and breach the
  -- partial unique index parent_student_links_one_active_idx, which is
  -- checked during the index insert -- before any foreign key trigger fires
  -- at end of statement -- so the wrong invariant would be proved.
  -- `unlinked_at` is mandatory once is_active is false
  -- (parent_student_links_active_timestamp_chk).
  BEGIN
    INSERT INTO public.parent_student_links
      (id, centre_id, parent_membership_id, parent_role, student_id, is_active, linked_at, unlinked_at, created_at)
    VALUES ('ce300000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-0000000000ff',
            'c1000000-0000-4000-8000-000000000003', 'parent',
            'c2000000-0000-4000-8000-000000000001', false,
            '2026-01-12 09:00:00+08', '2026-01-12 09:00:00+08', '2026-01-12 09:00:00+08');
    RAISE EXCEPTION 'FAIL N3: a cross-centre parent-student link was accepted';
  EXCEPTION
    WHEN foreign_key_violation THEN
      GET STACKED DIAGNOSTICS v_constraint = CONSTRAINT_NAME;
      IF v_constraint NOT IN ('parent_student_links_student_fk', 'parent_student_links_parent_fk') THEN
        RAISE EXCEPTION 'FAIL N3: rejected by "%" rather than a same-centre composite foreign key', v_constraint;
      END IF;
      v_passed := v_passed + 1;
  END;

  -- N4 -- PARENT membership used as a TRAINER on a session assignment
  --       rejected by class_session_assignments_trainer_fk (id, centre_id, role) (23503)
  --
  -- The assignment is INACTIVE so it cannot collide with the fixture's own
  -- active assignment on this session. `unassigned_at` is then mandatory
  -- (class_session_assignments_active_timestamp_chk), and a CHECK is
  -- evaluated before the row is ever inserted -- so omitting it would raise
  -- 23514 and never reach the role-pinned foreign key this test exists for.
  BEGIN
    INSERT INTO public.class_session_assignments
      (id, centre_id, class_session_id, trainer_membership_id, trainer_role, is_active, assigned_at, unassigned_at, created_at)
    VALUES ('ce700000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001',
            'c5000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000003', 'trainer',
            false, '2026-01-12 09:00:00+08', '2026-01-12 09:00:00+08', '2026-01-12 09:00:00+08');
    RAISE EXCEPTION 'FAIL N4: a PARENT membership was accepted as a session trainer';
  EXCEPTION
    WHEN foreign_key_violation THEN
      GET STACKED DIAGNOSTICS v_constraint = CONSTRAINT_NAME;
      IF v_constraint <> 'class_session_assignments_trainer_fk' THEN
        RAISE EXCEPTION 'FAIL N4: rejected by "%" rather than the role-pinned class_session_assignments_trainer_fk', v_constraint;
      END IF;
      v_passed := v_passed + 1;
  END;

  -- N5 -- trainer profile attached to a PARENT membership
  --       rejected by trainer_profiles_membership_fk (id, centre_id, role) (23503)
  BEGIN
    INSERT INTO public.trainer_profiles (membership_id, centre_id, membership_role, created_at, updated_at)
    VALUES ('c1000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 'trainer',
            '2026-01-05 09:00:00+08', '2026-01-05 09:00:00+08');
    RAISE EXCEPTION 'FAIL N5: a trainer profile was accepted on a PARENT membership';
  EXCEPTION
    WHEN foreign_key_violation THEN
      GET STACKED DIAGNOSTICS v_constraint = CONSTRAINT_NAME;
      IF v_constraint <> 'trainer_profiles_membership_fk' THEN
        RAISE EXCEPTION 'FAIL N5: rejected by "%" rather than the role-pinned trainer_profiles_membership_fk', v_constraint;
      END IF;
      v_passed := v_passed + 1;
    WHEN unique_violation     THEN
      RAISE EXCEPTION 'FAIL N5: rejected by primary-key collision rather than by the role-pinned composite foreign key';
  END;

  -- N6 -- Student Auth linkage. This proves the rule is UNREPRESENTABLE
  --       rather than merely enforced: the column does not exist (42703).
  --       Dynamic SQL is required because a static reference to a
  --       nonexistent column would fail to parse the whole block.
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'auth_user_id'
  ) INTO v_col_exists;
  IF v_col_exists THEN
    RAISE EXCEPTION 'FAIL N6: students.auth_user_id exists; a student login must be structurally impossible';
  END IF;
  BEGIN
    EXECUTE 'UPDATE public.students SET auth_user_id = ''d0000000-0000-4000-8000-000000000003''
              WHERE id = ''c2000000-0000-4000-8000-000000000001''';
    RAISE EXCEPTION 'FAIL N6: an update to students.auth_user_id was accepted';
  EXCEPTION
    WHEN undefined_column THEN v_passed := v_passed + 1;
  END;

  -- N7 -- second ACTIVE trainer assignment for the same session
  --       rejected by class_session_assignments_one_active_per_session_idx (23505)
  BEGIN
    INSERT INTO public.class_session_assignments
      (id, centre_id, class_session_id, trainer_membership_id, trainer_role, is_active, assigned_at, created_at)
    VALUES ('ce700000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000001',
            'c5000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002', 'trainer',
            true, '2026-01-12 09:00:00+08', '2026-01-12 09:00:00+08');
    RAISE EXCEPTION 'FAIL N7: a second ACTIVE trainer assignment was accepted for the same session';
  EXCEPTION
    WHEN unique_violation THEN
      GET STACKED DIAGNOSTICS v_constraint = CONSTRAINT_NAME;
      IF v_constraint <> 'class_session_assignments_one_active_per_session_idx' THEN
        RAISE EXCEPTION 'FAIL N7: rejected by "%" rather than class_session_assignments_one_active_per_session_idx', v_constraint;
      END IF;
      v_passed := v_passed + 1;
  END;

  IF v_passed <> 7 THEN
    RAISE EXCEPTION 'FAIL: expected all 7 negative tests to be rejected, % passed', v_passed;
  END IF;

  RAISE NOTICE 'SECTION C: all 7 negative tests were correctly rejected.';
END;
$verify_negative$;

ROLLBACK;

-- =====================================================================
-- SECTION D -- Post-rollback residue proof
-- =====================================================================
-- The proof of zero residue is that the counts are unchanged AFTER the
-- rollback -- not the intention to roll back. Access posture is
-- re-confirmed so the negative suite is proven not to have widened it.
DO $verify_residue$
DECLARE
  v_total integer;
  v_n     integer;
BEGIN
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
    RAISE EXCEPTION 'FAIL D1: after rollback the fixture must still hold exactly 25 rows, found %', v_total;
  END IF;

  -- No negative-test row survived.
  SELECT
      (SELECT count(*) FROM public.accounts                  WHERE id::text LIKE 'ce%')
    + (SELECT count(*) FROM public.centre_memberships        WHERE id::text LIKE 'ce%')
    + (SELECT count(*) FROM public.parent_student_links      WHERE id::text LIKE 'ce%')
    + (SELECT count(*) FROM public.class_session_assignments WHERE id::text LIKE 'ce%')
    INTO v_n;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL D2: % negative-test row(s) survived the rollback', v_n;
  END IF;

  -- Option B boundary and Step 7E seed boundary still hold.
  IF (SELECT count(*) FROM public.reports) <> 0
  OR (SELECT count(*) FROM public.report_versions) <> 0
  OR (SELECT count(*) FROM public.report_version_ratings) <> 0
  OR (SELECT count(*) FROM public.report_version_checklist_progress) <> 0
  OR (SELECT count(*) FROM public.report_version_approvals) <> 0
  OR (SELECT count(*) FROM public.report_correction_requests) <> 0
  OR (SELECT count(*) FROM public.invitations) <> 0 THEN
    RAISE EXCEPTION 'FAIL D3: the Option B zero-row boundary was violated by the negative suite';
  END IF;

  IF (SELECT count(*) FROM public.centres) <> 1
  OR (SELECT count(*) FROM public.class_grades) <> 3
  OR (SELECT count(*) FROM public.assessment_dimensions) <> 9 THEN
    RAISE EXCEPTION 'FAIL D4: the Step 7E seed boundary diverged during the negative suite';
  END IF;

  -- Access posture identical after the rollback: the negative suite must
  -- neither widen nor shrink the committed Step 7G/7H posture, and the
  -- three Step 7H append-only guards must remain enabled. (Reconciled at
  -- Step 7G1F from the superseded zero-policy expectation; extended for
  -- the Step 7H audit chain.)
  SELECT count(*) INTO v_n FROM pg_catalog.pg_policies WHERE schemaname = 'public';
  IF v_n <> 29 THEN
    RAISE EXCEPTION 'FAIL D5: expected the 29 Step 7G policies after the negative suite, found %', v_n;
  END IF;

  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public';
  IF v_n <> 36 THEN
    RAISE EXCEPTION 'FAIL D5: expected the 34 Step 7G/7H/7I/assessment/correction-tracking/context-resolver/complete-save/submitted-list functions after the negative suite, found %', v_n;
  END IF;

  SELECT count(*) INTO v_n
    FROM (VALUES
      ('centres'),('accounts'),('centre_memberships'),('trainer_profiles'),('parent_profiles'),
      ('students'),('parent_student_links'),('class_grades'),('class_modules'),('class_sessions'),
      ('enrolments'),('class_session_assignments'),('attendance')) AS t(tablename)
   WHERE has_table_privilege('authenticated', ('public.' || t.tablename)::regclass, 'SELECT');
  IF v_n <> 13 THEN
    RAISE EXCEPTION 'FAIL D5: the authenticated SELECT posture changed during the negative suite (matched %)', v_n;
  END IF;

  SELECT count(*) INTO v_n
    FROM (VALUES
      ('centres'),('assessment_dimensions'),('accounts'),('centre_memberships'),('trainer_profiles'),
      ('parent_profiles'),('students'),('parent_student_links'),('class_grades'),('class_modules'),
      ('class_sessions'),('enrolments'),('class_session_assignments'),('attendance'),('invitations'),
      ('observations'),('observation_ratings'),('reports'),('report_versions'),('report_version_ratings'),
      ('report_version_checklist_progress'),('report_version_approvals'),
      ('audit_events'),('audit_event_targets'),('audit_chain_heads'),
      ('report_correction_requests')) AS t(tablename)
    CROSS JOIN (VALUES ('anon'),('service_role'),('authenticator'),('public')) AS r(rolname)
    CROSS JOIN (VALUES ('SELECT'),('INSERT'),('UPDATE'),('DELETE'),('TRUNCATE'),('REFERENCES'),('TRIGGER')) AS p(priv)
   WHERE has_table_privilege(r.rolname, ('public.' || t.tablename)::regclass, p.priv);
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL D5: a zero-privilege role gained % table privilege(s) during the negative suite', v_n;
  END IF;

  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_trigger t
    JOIN pg_catalog.pg_class c ON c.oid = t.tgrelid
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND NOT t.tgisinternal AND t.tgenabled = 'O';
  IF v_n <> 3 THEN
    RAISE EXCEPTION 'FAIL D5: expected all 3 Step 7H audit guard triggers enabled after the negative suite, found %', v_n;
  END IF;

  RAISE NOTICE 'SECTION D: rollback left no residue; fixture, Option B, seed and audit-guard boundaries all intact.';
END;
$verify_residue$;
