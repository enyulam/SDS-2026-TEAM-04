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
-- =====================================================================

\set ON_ERROR_STOP on

-- =====================================================================
-- SECTION A -- Positive assertions
-- =====================================================================
DO $verify_positive$
DECLARE
  v_n        integer;
  v_expected text;
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
       WHERE observation_id = 'c9000000-0000-4000-8000-000000000001' AND rating = 'emerging') < 1
  OR (SELECT count(*) FROM public.observation_ratings
       WHERE observation_id = 'c9000000-0000-4000-8000-000000000001' AND rating = 'advanced') < 1 THEN
    RAISE EXCEPTION 'FAIL A24: the mixed rating set must include at least one emerging and one advanced rating';
  END IF;

  -- Exact ratified UUID / dimension / rating triples.
  SELECT count(*) INTO v_n FROM public.observation_ratings r
   WHERE (r.id, r.dimension_code, r.rating) IN (
     ('ca000000-0000-4000-8000-000000000001'::uuid, 'body'::public.dimension_code,                 'secure'::public.competency_rating),
     ('ca000000-0000-4000-8000-000000000002'::uuid, 'emotion'::public.dimension_code,              'developing'::public.competency_rating),
     ('ca000000-0000-4000-8000-000000000003'::uuid, 'speech'::public.dimension_code,               'emerging'::public.competency_rating),
     ('ca000000-0000-4000-8000-000000000004'::uuid, 'tonality'::public.dimension_code,             'secure'::public.competency_rating),
     ('ca000000-0000-4000-8000-000000000005'::uuid, 'eye_contact'::public.dimension_code,          'advanced'::public.competency_rating),
     ('ca000000-0000-4000-8000-000000000006'::uuid, 'vocal_projection'::public.dimension_code,     'developing'::public.competency_rating),
     ('ca000000-0000-4000-8000-000000000007'::uuid, 'emotional_expression'::public.dimension_code, 'emerging'::public.competency_rating),
     ('ca000000-0000-4000-8000-000000000008'::uuid, 'sentence_flow'::public.dimension_code,        'secure'::public.competency_rating),
     ('ca000000-0000-4000-8000-000000000009'::uuid, 'audience_awareness'::public.dimension_code,   'advanced'::public.competency_rating));
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

  -- --- Access posture is unchanged from Step 7E ----------------------
  SELECT count(*) INTO v_n
    FROM pg_policies
   WHERE schemaname = 'public'
     AND tablename IN (
       'centres','assessment_dimensions','accounts','centre_memberships','trainer_profiles',
       'parent_profiles','students','parent_student_links','class_grades','class_modules',
       'class_sessions','enrolments','class_session_assignments','attendance','invitations',
       'observations','observation_ratings','reports','report_versions','report_version_ratings',
       'report_version_checklist_progress','report_version_approvals');
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL A32: expected 0 RLS policies on the 22 Step 7E tables, found %', v_n; END IF;

  SELECT count(*) INTO v_n
    FROM (
      SELECT t.tablename, r.rolname, p.priv
        FROM (VALUES
          ('centres'),('assessment_dimensions'),('accounts'),('centre_memberships'),('trainer_profiles'),
          ('parent_profiles'),('students'),('parent_student_links'),('class_grades'),('class_modules'),
          ('class_sessions'),('enrolments'),('class_session_assignments'),('attendance'),('invitations'),
          ('observations'),('observation_ratings'),('reports'),('report_versions'),('report_version_ratings'),
          ('report_version_checklist_progress'),('report_version_approvals')) AS t(tablename)
        CROSS JOIN (VALUES ('anon'),('authenticated'),('service_role'),('public')) AS r(rolname)
        CROSS JOIN (VALUES ('SELECT'),('INSERT'),('UPDATE'),('DELETE'),('TRUNCATE'),('REFERENCES'),('TRIGGER')) AS p(priv)
       WHERE has_table_privilege(r.rolname, ('public.' || t.tablename)::regclass, p.priv)
    ) AS granted;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'FAIL A33: expected 0 effective client table privileges, found % grant(s)', v_n;
  END IF;

  -- --- Migration history and Step 7E seed boundary --------------------
  SELECT count(*) INTO v_n FROM supabase_migrations.schema_migrations;
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL A34: expected exactly 1 applied migration, found %', v_n; END IF;

  SELECT version INTO v_expected FROM supabase_migrations.schema_migrations LIMIT 1;
  IF v_expected <> '20260803034500' THEN
    RAISE EXCEPTION 'FAIL A35: expected migration version 20260803034500, found %', v_expected;
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
  OR (SELECT count(*) FROM public.invitations) <> 0 THEN
    RAISE EXCEPTION 'FAIL D3: the Option B zero-row boundary was violated by the negative suite';
  END IF;

  IF (SELECT count(*) FROM public.centres) <> 1
  OR (SELECT count(*) FROM public.class_grades) <> 3
  OR (SELECT count(*) FROM public.assessment_dimensions) <> 9 THEN
    RAISE EXCEPTION 'FAIL D4: the Step 7E seed boundary diverged during the negative suite';
  END IF;

  -- Access posture unchanged.
  SELECT count(*) INTO v_n FROM pg_policies WHERE schemaname = 'public';
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL D5: % RLS policy/policies exist after the negative suite', v_n; END IF;

  RAISE NOTICE 'SECTION D: rollback left no residue; fixture, Option B and seed boundaries all intact.';
END;
$verify_residue$;
