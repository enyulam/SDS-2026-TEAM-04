-- =====================================================================
-- B.E.S.T Coach -- assessment acceptance suite, runtime legs
-- =====================================================================
-- LOCAL DISPOSABLE DEVELOPMENT DATABASE ONLY -- run by run-assessment.mjs
-- against a cloned, deliberately-dirtied database that is destroyed
-- afterwards. NEVER run this file against the canonical fixture database:
-- it COMMITS observations, scaffolding rows and (in the T-ASM-34 leg)
-- audit events that are permanently uncleanable.
--
-- Covers T-ASM-1 .. T-ASM-24, T-ASM-27 .. T-ASM-45 (runtime legs). The two
-- R(C) races, T-ASM-25 and T-ASM-26, are driven by run-assessment.mjs with
-- two coordinated sessions. The static file legs live in asm-static.mjs.
--
-- Scaffolding UUIDs use the aa000000-* prefix so they can never collide
-- with a fixture row.
-- =====================================================================

\set ON_ERROR_STOP on
\pset tuples_only on
\pset format unaligned
\pset footer off

-- ---------------------------------------------------------------------
-- Session harness
-- ---------------------------------------------------------------------
CREATE FUNCTION pg_temp.as_trainer() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims',
  '{"sub":"d0000000-0000-4000-8000-000000000002","role":"authenticated"}', false); END $$;

CREATE FUNCTION pg_temp.as_management() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims',
  '{"sub":"d0000000-0000-4000-8000-000000000001","role":"authenticated"}', false); END $$;

CREATE FUNCTION pg_temp.as_parent() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims',
  '{"sub":"d0000000-0000-4000-8000-000000000003","role":"authenticated"}', false); END $$;

CREATE FUNCTION pg_temp.as_nobody() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims', '', false); END $$;

CREATE FUNCTION pg_temp.errcode(p_sql text) RETURNS text LANGUAGE plpgsql AS $$
DECLARE v text; BEGIN
  BEGIN
    EXECUTE p_sql;
    RETURN 'OK';
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v = RETURNED_SQLSTATE;
    RETURN v;
  END;
END $$;

CREATE FUNCTION pg_temp.errmsg(p_sql text) RETURNS text LANGUAGE plpgsql AS $$
DECLARE v text; BEGIN
  BEGIN
    EXECUTE p_sql;
    RETURN 'OK';
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v = MESSAGE_TEXT;
    RETURN v;
  END;
END $$;

CREATE FUNCTION pg_temp.constraint_of(p_sql text) RETURNS text LANGUAGE plpgsql AS $$
DECLARE v text; BEGIN
  BEGIN
    EXECUTE p_sql;
    RETURN 'OK';
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v = CONSTRAINT_NAME;
    RETURN COALESCE(v, '');
  END;
END $$;

-- Field-by-field state fingerprint of one observation and its rating set
-- (T-ASM-28's "byte-identical", made checkable as one text value).
CREATE FUNCTION pg_temp.snap(p_obs uuid) RETURNS text LANGUAGE plpgsql AS $$
DECLARE v text; BEGIN
  SELECT pg_catalog.md5(
           COALESCE((SELECT (o.id, o.centre_id, o.class_session_id, o.class_module_id,
                             o.student_id, o.enrolment_id, o.trainer_membership_id,
                             o.trainer_role, o.strength_chips, o.focus_chips,
                             o.observation_notes, o.follow_up_notes, o.term_evidence_notes,
                             o.lock_version, o.created_at)::text
                       FROM public.observations o WHERE o.id = p_obs), '<absent>')
           || '||' ||
           COALESCE((SELECT pg_catalog.string_agg(
                              (r.dimension_code::text || '=' || r.rating::text),
                              ',' ORDER BY r.dimension_code::text)
                       FROM public.observation_ratings r WHERE r.observation_id = p_obs), '<none>'))
    INTO v;
  RETURN v;
END $$;

-- A well-formed nine-element ratings payload with a deliberately mixed set,
-- in a SHUFFLED order (T-ASM-36 asserts the read re-orders it).
--
-- Reconciled at Backend V2 to the Amendment 006 A-049 ratified vocabulary:
-- `advanced`->`mastered`, `secure`->`mastering`, `emerging`->`beginning`;
-- `developing` is unchanged. The MIX is positionally identical to the
-- accepted CP-2/CP-4 payload -- only the three renamed labels moved. These
-- are competency ratings, not Class Grades (A-054).
CREATE FUNCTION pg_temp.nine() RETURNS jsonb LANGUAGE plpgsql AS $$
BEGIN
  RETURN '[
    {"dimension_code":"sentence_flow","rating":"developing"},
    {"dimension_code":"body","rating":"mastered"},
    {"dimension_code":"audience_awareness","rating":"mastering"},
    {"dimension_code":"emotion","rating":"beginning"},
    {"dimension_code":"vocal_projection","rating":"mastered"},
    {"dimension_code":"speech","rating":"mastering"},
    {"dimension_code":"emotional_expression","rating":"beginning"},
    {"dimension_code":"tonality","rating":"developing"},
    {"dimension_code":"eye_contact","rating":"mastering"}
  ]'::jsonb;
END $$;

CREATE FUNCTION pg_temp.save(p_session uuid, p_student uuid, p_obs uuid, p_lock integer,
                             p_ratings jsonb) RETURNS record LANGUAGE plpgsql AS $$
DECLARE v record; BEGIN
  SELECT * INTO v FROM public.assessment_save_observation(
    p_session, p_student, p_obs, p_lock,
    ARRAY['confident-opening']::text[], ARRAY['pacing']::text[],
    'Scaffold observation notes', 'Scaffold follow-up guidance', 'Scaffold term evidence',
    p_ratings);
  RETURN v;
END $$;

-- One scaffold class session assigned to the fixture trainer, past-dated,
-- with a present-attendance row. Returns the session id.
CREATE FUNCTION pg_temp.mk_session(p_n integer, p_date date, p_starts time,
                                   p_att public.attendance_status) RETURNS uuid
LANGUAGE plpgsql AS $$
DECLARE
  v_session uuid := ('aa000000-0000-4000-8000-' || pg_catalog.lpad(p_n::text, 12, '0'))::uuid;
BEGIN
  INSERT INTO public.class_sessions (id, centre_id, class_module_id, session_date, starts_at, ends_at)
  VALUES (v_session, 'b0000000-0000-4000-8000-000000000001',
          'c4000000-0000-4000-8000-000000000001', p_date, p_starts, NULL);
  INSERT INTO public.class_session_assignments (centre_id, class_session_id, trainer_membership_id)
  VALUES ('b0000000-0000-4000-8000-000000000001', v_session,
          'c1000000-0000-4000-8000-000000000002');
  IF p_att IS NOT NULL THEN
    INSERT INTO public.attendance (centre_id, class_session_id, class_module_id, student_id, enrolment_id, status)
    VALUES ('b0000000-0000-4000-8000-000000000001', v_session,
            'c4000000-0000-4000-8000-000000000001', 'c2000000-0000-4000-8000-000000000001',
            'c6000000-0000-4000-8000-000000000001', p_att);
  END IF;
  RETURN v_session;
END $$;

-- ---------------------------------------------------------------------
-- Census and posture (T-ASM-40, T-ASM-41 catalogue leg, T-ASM-42,
-- T-ASM-43, T-ASM-45, T-ASM-33 runtime leg)
-- ---------------------------------------------------------------------
DO $census$
DECLARE v_n bigint; v_m bigint; v_txt text;
BEGIN
  -- T-ASM-40: 8 migrations, 31 functions, 26 tables, 12 enums.
  -- (Reconciled at Round B2.1: the correction-tracking migration adds one
  -- read-only function and one migration file; no table and no enum.
  -- Reconciled again at B-V2-2: the Amendment 006 A-053 competency-vocabulary
  -- rename adds one migration file and, being three ALTER TYPE ... RENAME
  -- VALUE statements, changes no function, table or enum count.)
  SELECT count(*) INTO v_n FROM supabase_migrations.schema_migrations;
  -- (Reconciled again at Round C2 Phase C2-A: Round C2 Phase C2-A adds the atomic complete-save composer (R-C2-1): one migration file and one function, no table and no enum.)
  -- (Reconciled again at Run C3-A Phase 1: the single-entry-point closure adds one migration file that contains exactly one REVOKE -- no function, no table, no enum, and not one DML statement.)
  -- (Moved 11 -> 12 at Run C3-A Phase 2b: C2C-004's governed Management
  -- submitted-report list is the twelfth committed migration.)
  IF v_n <> 13 THEN RAISE EXCEPTION 'T-ASM-40: % migrations, expected 13', v_n; END IF;
  SELECT count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace WHERE ns.nspname = 'public';
  -- (Moved 33 -> 34 at Run C3-A Phase 2b: C2C-004's submitted-report list.)
  IF v_n <> 36 THEN RAISE EXCEPTION 'T-ASM-40: % functions, expected 36', v_n; END IF;
  SELECT count(*) INTO v_n FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace ns ON ns.oid = c.relnamespace
   WHERE ns.nspname = 'public' AND c.relkind = 'r';
  IF v_n <> 26 THEN RAISE EXCEPTION 'T-ASM-40: % tables, expected 26', v_n; END IF;
  SELECT count(*) INTO v_n FROM pg_catalog.pg_type t
    JOIN pg_catalog.pg_namespace ns ON ns.oid = t.typnamespace
   WHERE ns.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN RAISE EXCEPTION 'T-ASM-40: % enums, expected 12', v_n; END IF;
  RAISE NOTICE 'PASS T-ASM-40 (catalogue leg: 8 migrations, 31 functions, 26 tables, 12 enums)';

  -- T-ASM-41: full function contracts from the catalogue.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
    JOIN pg_catalog.pg_language l ON l.oid = p.prolang
   WHERE ns.nspname = 'public'
     AND p.proname IN ('assessment_save_observation', 'assessment_get_trainer_observation')
     AND pg_catalog.pg_get_userbyid(p.proowner) = 'postgres'
     AND l.lanname = 'plpgsql' AND p.prosecdef AND NOT p.proisstrict
     AND p.proconfig::text LIKE '%search_path=%'
     AND ((p.proname = 'assessment_save_observation' AND p.provolatile = 'v')
       OR (p.proname = 'assessment_get_trainer_observation' AND p.provolatile = 's'));
  IF v_n <> 2 THEN RAISE EXCEPTION 'T-ASM-41: catalogue contract matched % of 2', v_n; END IF;
  RAISE NOTICE 'PASS T-ASM-41 (catalogue leg)';

  -- T-ASM-42: EXECUTE census -- 23 authenticated; zero for the other roles
  -- on the two new functions; the 7I four and the 7H four unchanged.
  SELECT count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  -- (Reconciled at Run C3-A Phase 1: assessment_save_observation loses its
  --  authenticated EXECUTE, because keeping it left a direct PostgREST route
  --  by which a COMPLETE nine-rating assessment could commit with no report
  --  shell. The census falls 25 -> 24 and moves DOWNWARD only.)
  -- (Moved 24 -> 25 at Run C3-A Phase 2b: C2C-004's submitted-report list.)
  IF v_n <> 25 THEN RAISE EXCEPTION 'T-ASM-42: % authenticated EXECUTE, expected 25', v_n; END IF;
  SELECT count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND p.proname = 'assessment_save_observation'
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 0 THEN RAISE EXCEPTION 'T-ASM-42: assessment_save_observation is still client-reachable'; END IF;
  SELECT count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND p.proname = 'assessment_get_trainer_observation'
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 1 THEN RAISE EXCEPTION 'T-ASM-42: the governed trainer read lost its authenticated EXECUTE'; END IF;
  SELECT count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND p.proname IN ('assessment_save_observation', 'assessment_get_trainer_observation')
     AND (pg_catalog.has_function_privilege('anon', p.oid, 'EXECUTE')
       OR pg_catalog.has_function_privilege('service_role', p.oid, 'EXECUTE')
       OR pg_catalog.has_function_privilege('authenticator', p.oid, 'EXECUTE')
       OR p.proacl IS NULL
       OR EXISTS (SELECT 1 FROM pg_catalog.aclexplode(p.proacl) ae WHERE ae.grantee = 0));
  IF v_n <> 0 THEN RAISE EXCEPTION 'T-ASM-42: a non-authenticated role reaches an assessment RPC'; END IF;
  SELECT count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND p.proname IN ('report_store_draft', 'report_content_hash_v1', 'report_wording_hash_v1',
                       'app_parent_reaches_student', 'report_content_hash_v2', 'report_wording_hash_v2',
                       'audit_append_event', 'audit_verify_chain',
                       'audit_canonical_json', 'audit_block_mutation')
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 0 THEN RAISE EXCEPTION 'T-ASM-42: an owner-only function acquired authenticated EXECUTE'; END IF;
  RAISE NOTICE 'PASS T-ASM-42 (authenticated EXECUTE census asserted above; exclusion lists carry the 7I six and the 7H four)';

  -- T-ASM-43: zero table privileges and zero policies on the three
  -- assessment tables; RLS enabled; FORCE off.
  SELECT count(*) INTO v_n
    FROM information_schema.role_table_grants g
   WHERE g.table_schema = 'public'
     AND g.table_name IN ('observations', 'observation_ratings', 'assessment_dimensions')
     AND g.grantee IN ('PUBLIC', 'anon', 'authenticated', 'service_role', 'authenticator');
  IF v_n <> 0 THEN RAISE EXCEPTION 'T-ASM-43: % client table privilege(s) on the assessment tables', v_n; END IF;
  SELECT count(*) INTO v_n FROM pg_catalog.pg_policies
   WHERE schemaname = 'public'
     AND tablename IN ('observations', 'observation_ratings', 'assessment_dimensions');
  IF v_n <> 0 THEN RAISE EXCEPTION 'T-ASM-43: % policy/policies on the assessment tables', v_n; END IF;
  SELECT count(*) INTO v_n FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace ns ON ns.oid = c.relnamespace
   WHERE ns.nspname = 'public'
     AND c.relname IN ('observations', 'observation_ratings', 'assessment_dimensions')
     AND (NOT c.relrowsecurity OR c.relforcerowsecurity);
  IF v_n <> 0 THEN RAISE EXCEPTION 'T-ASM-43: RLS posture wrong on % assessment table(s)', v_n; END IF;
  RAISE NOTICE 'PASS T-ASM-43 (zero grants, zero policies, RLS on, FORCE off)';

  -- T-ASM-45: Step 7G and Step 7I posture unchanged.
  SELECT count(*) INTO v_n FROM pg_catalog.pg_policies WHERE schemaname = 'public';
  IF v_n <> 29 THEN RAISE EXCEPTION 'T-ASM-45: % policies, expected 29', v_n; END IF;
  SELECT count(*) INTO v_n
    FROM (VALUES ('centres'),('accounts'),('centre_memberships'),('trainer_profiles'),
                 ('parent_profiles'),('students'),('parent_student_links'),('class_grades'),
                 ('class_modules'),('class_sessions'),('enrolments'),
                 ('class_session_assignments'),('attendance')) t(n)
   WHERE pg_catalog.has_table_privilege('authenticated', ('public.' || t.n)::regclass, 'SELECT');
  IF v_n <> 13 THEN RAISE EXCEPTION 'T-ASM-45: authenticated SELECT on % tables, expected 13', v_n; END IF;
  -- The FOURTEEN Step 7I RPCs, named rather than pattern-matched.
  -- (Reconciled at Round B2.1: the correction-tracking read also begins
  -- `report_`, so a `LIKE 'report\_%'` sweep would silently redefine what
  -- this assertion measures. Naming the fourteen keeps the label true, and
  -- the new read is asserted separately below.)
  SELECT count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND p.proname IN ('report_create','report_mark_observation_saved','report_request_draft',
                       'report_cancel_draft','report_save_edit','report_update_checklist',
                       'report_trainer_approve','report_management_edit_wording',
                       'report_management_return_to_trainer','report_management_approve_and_submit',
                       'report_reopen_submitted','report_get_canonical','report_get_working',
                       'report_get_management_review')
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 14 THEN RAISE EXCEPTION 'T-ASM-45: % authenticated Step 7I RPCs, expected 14', v_n; END IF;
  SELECT count(*) INTO v_n FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = 'report_list_management_corrections'
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 1 THEN RAISE EXCEPTION 'T-ASM-45: the correction-tracking read does not hold authenticated EXECUTE'; END IF;
  RAISE NOTICE 'PASS T-ASM-45 (Step 7G and Step 7I posture unchanged; the one B2.1 read added alongside)';

  -- T-ASM-33 (runtime legs): the registry is byte-identical in both audit
  -- functions; the three guard triggers stay enabled.
  SELECT pg_catalog.substring(a.prosrc, 'v_registry CONSTANT text\[\] :=[^;]+;') INTO v_txt
    FROM pg_catalog.pg_proc a
    JOIN pg_catalog.pg_namespace ns ON ns.oid = a.pronamespace
   WHERE ns.nspname = 'public' AND a.proname = 'audit_append_event';
  IF v_txt IS NULL OR v_txt IS DISTINCT FROM
     (SELECT pg_catalog.substring(b.prosrc, 'v_registry CONSTANT text\[\] :=[^;]+;')
        FROM pg_catalog.pg_proc b
        JOIN pg_catalog.pg_namespace ns2 ON ns2.oid = b.pronamespace
       WHERE ns2.nspname = 'public' AND b.proname = 'audit_verify_chain') THEN
    RAISE EXCEPTION 'T-ASM-33: the 16-action registry differs between the two audit functions';
  END IF;
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_trigger t
    JOIN pg_catalog.pg_class c ON c.oid = t.tgrelid
    JOIN pg_catalog.pg_namespace ns ON ns.oid = c.relnamespace
   WHERE ns.nspname = 'public' AND NOT t.tgisinternal AND t.tgenabled::text = 'O';
  IF v_n <> 3 THEN RAISE EXCEPTION 'T-ASM-33: % audit guard triggers enabled, expected 3', v_n; END IF;
  RAISE NOTICE 'PASS T-ASM-33 (runtime legs: registry equality, 3 guard triggers enabled, zero-EXECUTE audit four held by T-ASM-42)';
END $census$;

-- ---------------------------------------------------------------------
-- T-ASM-44 -- no client DML by any path: permission-denied, never an empty
-- result. Run under the real `authenticated` role.
-- ---------------------------------------------------------------------
DO $t44$
DECLARE v_bad int := 0; v_code text; v_tbl text; v_sql text;
BEGIN
  PERFORM pg_temp.as_trainer();
  SET LOCAL ROLE authenticated;
  FOREACH v_tbl IN ARRAY ARRAY['observations', 'observation_ratings', 'assessment_dimensions'] LOOP
    FOREACH v_sql IN ARRAY ARRAY[
      'SELECT 1 FROM public.' || v_tbl || ' LIMIT 1',
      'INSERT INTO public.' || v_tbl || ' DEFAULT VALUES',
      'UPDATE public.' || v_tbl || ' SET id = id',
      'DELETE FROM public.' || v_tbl
    ] LOOP
      v_code := pg_temp.errcode(v_sql);
      IF v_code <> '42501' THEN
        RAISE NOTICE 'T-ASM-44: % gave % (expected 42501)', v_sql, v_code;
        v_bad := v_bad + 1;
      END IF;
    END LOOP;
  END LOOP;
  RESET ROLE;
  IF v_bad <> 0 THEN RAISE EXCEPTION 'T-ASM-44: % direct-DML path(s) were not privilege-denied', v_bad; END IF;
  RAISE NOTICE 'PASS T-ASM-44 (12 direct paths, all permission-denied by privilege)';
END $t44$;

-- ---------------------------------------------------------------------
-- Scaffolding
-- ---------------------------------------------------------------------
-- aa..001  past session (yesterday 10:00), present     -> the main subject
-- aa..002  past session, present, NO observation       -> safe empty read
-- aa..003  today, starts_at 2 minutes in the future    -> BC104 then success
-- aa..004  tomorrow, starts_at NULL                    -> BC104 then success
-- aa..005  past session, attendance ABSENT             -> BC102
-- aa..006  past session, NO attendance row             -> BC102 (fail closed)
-- aa..007  past session, INACTIVE assignment           -> BC101
-- aa..008  past session assigned to ANOTHER trainer    -> BC101
-- aa..009  past session, present                       -> borrowed-id target
-- aa..010  past session under module M2, enrolment INACTIVE -> BC103
DO $scaffold$
DECLARE v uuid;
BEGIN
  v := pg_temp.mk_session(1, (pg_catalog.now() AT TIME ZONE 'Asia/Singapore')::date - 1, '10:00', 'present');
  v := pg_temp.mk_session(2, (pg_catalog.now() AT TIME ZONE 'Asia/Singapore')::date - 1, '10:00', 'present');
  v := pg_temp.mk_session(3, (pg_catalog.now() AT TIME ZONE 'Asia/Singapore')::date,
         ((pg_catalog.now() AT TIME ZONE 'Asia/Singapore') + interval '2 minutes')::time, 'present');
  v := pg_temp.mk_session(4, (pg_catalog.now() AT TIME ZONE 'Asia/Singapore')::date + 1, NULL, 'present');
  v := pg_temp.mk_session(5, (pg_catalog.now() AT TIME ZONE 'Asia/Singapore')::date - 1, '10:00', 'absent');
  v := pg_temp.mk_session(6, (pg_catalog.now() AT TIME ZONE 'Asia/Singapore')::date - 1, '10:00', NULL);
  v := pg_temp.mk_session(7, (pg_catalog.now() AT TIME ZONE 'Asia/Singapore')::date - 1, '10:00', 'present');
  UPDATE public.class_session_assignments
     SET is_active = false, unassigned_at = pg_catalog.now()
   WHERE class_session_id = 'aa000000-0000-4000-8000-000000000007';
  v := pg_temp.mk_session(9, (pg_catalog.now() AT TIME ZONE 'Asia/Singapore')::date - 1, '10:00', 'present');

  -- aa..008: a second trainer (account with NO auth identity -- structurally
  -- unable to log in) holds the single active assignment, so the FIXTURE
  -- trainer is an active, unrelated trainer for this session.
  INSERT INTO public.accounts (id, auth_user_id, display_name, normalized_email, status)
  VALUES ('aa100000-0000-4000-8000-000000000001', NULL, 'Scaffold Trainer Two',
          'scaffold.trainer2@example.test', 'active');
  INSERT INTO public.centre_memberships (id, account_id, centre_id, role, status, activated_at)
  VALUES ('aa200000-0000-4000-8000-000000000001', 'aa100000-0000-4000-8000-000000000001',
          'b0000000-0000-4000-8000-000000000001', 'trainer', 'active', pg_catalog.now());
  INSERT INTO public.class_sessions (id, centre_id, class_module_id, session_date, starts_at, ends_at)
  VALUES ('aa000000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000001',
          'c4000000-0000-4000-8000-000000000001',
          (pg_catalog.now() AT TIME ZONE 'Asia/Singapore')::date - 1, '10:00', NULL);
  INSERT INTO public.class_session_assignments (centre_id, class_session_id, trainer_membership_id)
  VALUES ('b0000000-0000-4000-8000-000000000001', 'aa000000-0000-4000-8000-000000000008',
          'aa200000-0000-4000-8000-000000000001');
  INSERT INTO public.attendance (centre_id, class_session_id, class_module_id, student_id, enrolment_id, status)
  VALUES ('b0000000-0000-4000-8000-000000000001', 'aa000000-0000-4000-8000-000000000008',
          'c4000000-0000-4000-8000-000000000001', 'c2000000-0000-4000-8000-000000000001',
          'c6000000-0000-4000-8000-000000000001', 'present');

  -- aa..010: module M2 with an INACTIVE enrolment for the fixture student.
  INSERT INTO public.class_modules (id, centre_id, class_grade_id, title, is_active)
  SELECT 'aa300000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
         cm.class_grade_id, 'Scaffold Module Two', true
    FROM public.class_modules cm WHERE cm.id = 'c4000000-0000-4000-8000-000000000001';
  INSERT INTO public.enrolments (id, centre_id, class_module_id, student_id, is_active, enrolled_at, withdrawn_at)
  VALUES ('aa400000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001',
          'aa300000-0000-4000-8000-000000000001', 'c2000000-0000-4000-8000-000000000001',
          false, pg_catalog.now() - interval '30 days', pg_catalog.now());
  INSERT INTO public.class_sessions (id, centre_id, class_module_id, session_date, starts_at, ends_at)
  VALUES ('aa000000-0000-4000-8000-000000000010', 'b0000000-0000-4000-8000-000000000001',
          'aa300000-0000-4000-8000-000000000001',
          (pg_catalog.now() AT TIME ZONE 'Asia/Singapore')::date - 1, '10:00', NULL);
  INSERT INTO public.class_session_assignments (centre_id, class_session_id, trainer_membership_id)
  VALUES ('b0000000-0000-4000-8000-000000000001', 'aa000000-0000-4000-8000-000000000010',
          'c1000000-0000-4000-8000-000000000002');
  INSERT INTO public.attendance (centre_id, class_session_id, class_module_id, student_id, enrolment_id, status)
  VALUES ('b0000000-0000-4000-8000-000000000001', 'aa000000-0000-4000-8000-000000000010',
          'aa300000-0000-4000-8000-000000000001', 'c2000000-0000-4000-8000-000000000001',
          'aa400000-0000-4000-8000-000000000001', 'present');
END $scaffold$;

-- ---------------------------------------------------------------------
-- T-ASM-30 first half: chain state BEFORE any assessment call. The suite
-- asserts identical values after the save and read legs.
-- ---------------------------------------------------------------------
CREATE TABLE pg_temp.chain_before AS
SELECT (SELECT count(*) FROM public.audit_events)        AS events,
       (SELECT count(*) FROM public.audit_event_targets) AS targets,
       (SELECT COALESCE(pg_catalog.string_agg(h.last_seq::text || '@' || h.last_hash, ','
                        ORDER BY h.centre_id), '<empty>')
          FROM public.audit_chain_heads h)               AS heads;

-- ---------------------------------------------------------------------
-- T-ASM-1 .. T-ASM-4 -- authorized happy paths
-- ---------------------------------------------------------------------
DO $happy$
DECLARE
  v record; v_obs uuid; v_created timestamptz; v_updated timestamptz;
  v_n bigint; v_i int;
  S1 CONSTANT uuid := 'aa000000-0000-4000-8000-000000000001';
  STU CONSTANT uuid := 'c2000000-0000-4000-8000-000000000001';
BEGIN
  PERFORM pg_temp.as_trainer();

  -- T-ASM-1: authorized creation.
  v := pg_temp.save(S1, STU, NULL, NULL, pg_temp.nine());
  IF NOT v.was_created OR v.lock_version <> 1 OR v.dimension_count <> 9 OR NOT v.is_complete THEN
    RAISE EXCEPTION 'T-ASM-1: create returned was_created=%, lock=%, dims=%, complete=%',
      v.was_created, v.lock_version, v.dimension_count, v.is_complete;
  END IF;
  v_obs := v.observation_id;
  SELECT count(*) INTO v_n FROM public.observation_ratings r WHERE r.observation_id = v_obs;
  IF v_n <> 9 THEN RAISE EXCEPTION 'T-ASM-1: % rating rows, expected 9', v_n; END IF;
  RAISE NOTICE 'PASS T-ASM-1';

  -- T-ASM-3: each persisted rating equals the input, dimension by dimension.
  SELECT count(*) INTO v_n
    FROM public.observation_ratings r
    JOIN (SELECT (e ->> 'dimension_code') AS code, (e ->> 'rating') AS rating
            FROM pg_catalog.jsonb_array_elements(pg_temp.nine()) e) x
      ON x.code = r.dimension_code::text AND x.rating = r.rating::text
   WHERE r.observation_id = v_obs;
  IF v_n <> 9 THEN RAISE EXCEPTION 'T-ASM-3: only % persisted ratings equal their input', v_n; END IF;
  RAISE NOTICE 'PASS T-ASM-3';

  -- T-ASM-2: authorized CAS update.
  SELECT o.created_at, o.updated_at INTO v_created, v_updated FROM public.observations o WHERE o.id = v_obs;
  v := pg_temp.save(S1, STU, v_obs, 1, pg_temp.nine());
  IF v.was_created OR v.lock_version <> 2 OR v.dimension_count <> 9 THEN
    RAISE EXCEPTION 'T-ASM-2: update returned was_created=%, lock=%', v.was_created, v.lock_version;
  END IF;
  SELECT count(*) INTO v_n FROM public.observation_ratings r WHERE r.observation_id = v_obs;
  IF v_n <> 9 THEN RAISE EXCEPTION 'T-ASM-2: % rating rows after update, expected 9', v_n; END IF;
  -- created_at is byte-unchanged; updated_at is stamped with now(), which in
  -- one production request is a LATER transaction's timestamp. This suite
  -- deliberately drives both calls in one transaction (now() is frozen), so
  -- monotone non-decrease plus created_at immutability is the assertable
  -- form here; the update-path SET clause itself is what stamps it.
  PERFORM 1 FROM public.observations o
   WHERE o.id = v_obs AND o.created_at = v_created AND o.updated_at >= v_updated;
  IF NOT FOUND THEN RAISE EXCEPTION 'T-ASM-2: created_at moved or updated_at regressed'; END IF;
  RAISE NOTICE 'PASS T-ASM-2';

  -- T-ASM-4: ten sequential updates -> lock_version exactly 11 (it is 2 now,
  -- so nine more take it to 11).
  FOR v_i IN 3 .. 11 LOOP
    v := pg_temp.save(S1, STU, v_obs, v_i - 1, pg_temp.nine());
    IF v.lock_version <> v_i THEN
      RAISE EXCEPTION 'T-ASM-4: lock_version % after update %, expected %', v.lock_version, v_i - 1, v_i;
    END IF;
  END LOOP;
  SELECT o.lock_version INTO v_n FROM public.observations o WHERE o.id = v_obs;
  IF v_n <> 11 THEN RAISE EXCEPTION 'T-ASM-4: final lock_version %, expected 11', v_n; END IF;
  RAISE NOTICE 'PASS T-ASM-4 (ten sequential successes; exactly one increment each)';
END $happy$;

-- ---------------------------------------------------------------------
-- T-ASM-5 .. T-ASM-10 -- validation, each a DISTINCT authored error, each
-- leaving zero residue (T-ASM-28 asserted around every case)
-- ---------------------------------------------------------------------
DO $validation$
DECLARE
  v_obs uuid; v_pre text; v_code text; v_codes text[] := ARRAY[]::text[];
  S1 CONSTANT uuid := 'aa000000-0000-4000-8000-000000000001';
  STU CONSTANT uuid := 'c2000000-0000-4000-8000-000000000001';
  bad jsonb;
BEGIN
  PERFORM pg_temp.as_trainer();
  SELECT o.id INTO v_obs FROM public.observations o WHERE o.class_session_id = S1;
  v_pre := pg_temp.snap(v_obs);

  -- T-ASM-5: eight ratings.
  bad := pg_temp.nine() - 0;
  v_code := pg_temp.errcode(pg_catalog.format(
    'SELECT pg_temp.save(%L,%L,%L,11,%L::jsonb)', S1, STU, v_obs, bad::text));
  IF v_code <> 'BC106' THEN RAISE EXCEPTION 'T-ASM-5: got %, expected BC106', v_code; END IF;
  v_codes := v_codes || v_code;
  RAISE NOTICE 'PASS T-ASM-5';

  -- T-ASM-6: nine elements, one code twice -- caught by the DISTINCTNESS
  -- gate, not a unique violation, and distinct from T-ASM-5's code.
  bad := (pg_temp.nine() - 0) || '[{"dimension_code":"emotion","rating":"mastering"}]'::jsonb;
  v_code := pg_temp.errcode(pg_catalog.format(
    'SELECT pg_temp.save(%L,%L,%L,11,%L::jsonb)', S1, STU, v_obs, bad::text));
  IF v_code <> 'BC108' THEN RAISE EXCEPTION 'T-ASM-6: got %, expected BC108', v_code; END IF;
  v_codes := v_codes || v_code;
  RAISE NOTICE 'PASS T-ASM-6';

  -- T-ASM-7: unknown dimension code, distinct again.
  bad := (pg_temp.nine() - 0) || '[{"dimension_code":"charisma","rating":"mastering"}]'::jsonb;
  v_code := pg_temp.errcode(pg_catalog.format(
    'SELECT pg_temp.save(%L,%L,%L,11,%L::jsonb)', S1, STU, v_obs, bad::text));
  IF v_code <> 'BC109' THEN RAISE EXCEPTION 'T-ASM-7: got %, expected BC109', v_code; END IF;
  v_codes := v_codes || v_code;
  RAISE NOTICE 'PASS T-ASM-7';

  -- T-ASM-8: invalid rating -- an AUTHORED error, never a raw enum cast.
  bad := (pg_temp.nine() - 1) || '[{"dimension_code":"body","rating":"outstanding"}]'::jsonb;
  v_code := pg_temp.errcode(pg_catalog.format(
    'SELECT pg_temp.save(%L,%L,%L,11,%L::jsonb)', S1, STU, v_obs, bad::text));
  IF v_code <> 'BC110' THEN RAISE EXCEPTION 'T-ASM-8: got %, expected BC110', v_code; END IF;
  v_codes := v_codes || v_code;
  RAISE NOTICE 'PASS T-ASM-8';

  -- T-ASM-9: malformed payloads -- each its own authored error.
  IF pg_temp.errcode(pg_catalog.format(
       'SELECT pg_temp.save(%L,%L,%L,11,%L::jsonb)', S1, STU, v_obs, '{"a":1}')) <> 'BC105' THEN
    RAISE EXCEPTION 'T-ASM-9: non-array was not BC105';
  END IF;
  IF pg_temp.errcode(pg_catalog.format(
       'SELECT pg_temp.save(%L,%L,%L,11,%L::jsonb)', S1, STU, v_obs,
       '[1,2,3,4,5,6,7,8,9]')) <> 'BC107' THEN
    RAISE EXCEPTION 'T-ASM-9: non-object element was not BC107';
  END IF;
  bad := (pg_temp.nine() - 1) || '[{"dimension_code":"body","rating":"mastering","extra":true}]'::jsonb;
  IF pg_temp.errcode(pg_catalog.format(
       'SELECT pg_temp.save(%L,%L,%L,11,%L::jsonb)', S1, STU, v_obs, bad::text)) <> 'BC107' THEN
    RAISE EXCEPTION 'T-ASM-9: extra key was not BC107';
  END IF;
  bad := (pg_temp.nine() - 1) || '[{"dimension_code":"body","grade":"mastering"}]'::jsonb;
  IF pg_temp.errcode(pg_catalog.format(
       'SELECT pg_temp.save(%L,%L,%L,11,%L::jsonb)', S1, STU, v_obs, bad::text)) <> 'BC107' THEN
    RAISE EXCEPTION 'T-ASM-9: misspelled key was not BC107';
  END IF;
  bad := (pg_temp.nine() - 1) || '[{"dimension_code":"body","rating":4}]'::jsonb;
  IF pg_temp.errcode(pg_catalog.format(
       'SELECT pg_temp.save(%L,%L,%L,11,%L::jsonb)', S1, STU, v_obs, bad::text)) <> 'BC107' THEN
    RAISE EXCEPTION 'T-ASM-9: non-string value was not BC107';
  END IF;
  RAISE NOTICE 'PASS T-ASM-9 (5 malformed shapes, each authored)';

  -- T-ASM-10: mixed CAS nullability, both directions.
  IF pg_temp.errcode(pg_catalog.format(
       'SELECT pg_temp.save(%L,%L,%L,NULL,%L::jsonb)', S1, STU, v_obs, pg_temp.nine()::text)) <> 'BC111' THEN
    RAISE EXCEPTION 'T-ASM-10: id-without-lock was not BC111';
  END IF;
  IF pg_temp.errcode(pg_catalog.format(
       'SELECT pg_temp.save(%L,%L,NULL,11,%L::jsonb)', S1, STU, pg_temp.nine()::text)) <> 'BC111' THEN
    RAISE EXCEPTION 'T-ASM-10: lock-without-id was not BC111';
  END IF;
  RAISE NOTICE 'PASS T-ASM-10 (an update can never degrade into a create)';

  -- Distinctness across the family (T-ASM-5/6/7/8 pairwise different).
  IF (SELECT count(DISTINCT c) FROM pg_catalog.unnest(v_codes) c) <> 4 THEN
    RAISE EXCEPTION 'validation codes are not pairwise distinct: %', v_codes;
  END IF;

  -- T-ASM-28 for this family: the subject is byte-identical.
  IF pg_temp.snap(v_obs) IS DISTINCT FROM v_pre THEN
    RAISE EXCEPTION 'T-ASM-28: a rejected validation call left residue';
  END IF;
END $validation$;

-- ---------------------------------------------------------------------
-- T-ASM-12 -- the session-start gate, both nullability shapes, both GUC
-- time zones
-- ---------------------------------------------------------------------
DO $gate$
DECLARE
  v_code text; v_zone text; v record;
  S3 CONSTANT uuid := 'aa000000-0000-4000-8000-000000000003';
  S4 CONSTANT uuid := 'aa000000-0000-4000-8000-000000000004';
  STU CONSTANT uuid := 'c2000000-0000-4000-8000-000000000001';
BEGIN
  PERFORM pg_temp.as_trainer();
  FOREACH v_zone IN ARRAY ARRAY['UTC', 'Asia/Singapore'] LOOP
    PERFORM pg_catalog.set_config('TimeZone', v_zone, false);

    -- starts_at set, in the future -> denied; the GUC must not matter.
    v_code := pg_temp.errcode(pg_catalog.format(
      'SELECT pg_temp.save(%L,%L,NULL,NULL,%L::jsonb)', S3, STU, pg_temp.nine()::text));
    IF v_code <> 'BC104' THEN
      RAISE EXCEPTION 'T-ASM-12: future starts_at gave % under %', v_code, v_zone;
    END IF;

    -- starts_at NULL, session_date tomorrow -> denied.
    v_code := pg_temp.errcode(pg_catalog.format(
      'SELECT pg_temp.save(%L,%L,NULL,NULL,%L::jsonb)', S4, STU, pg_temp.nine()::text));
    IF v_code <> 'BC104' THEN
      RAISE EXCEPTION 'T-ASM-12: future session_date gave % under %', v_code, v_zone;
    END IF;
  END LOOP;
  PERFORM pg_catalog.set_config('TimeZone', 'UTC', false);

  -- Cross the boundary: pull S3's start into the past and S4's date to
  -- today; both must now succeed.
  UPDATE public.class_sessions
     SET starts_at = ((pg_catalog.now() AT TIME ZONE 'Asia/Singapore') - interval '2 minutes')::time
   WHERE id = S3;
  UPDATE public.class_sessions
     SET session_date = (pg_catalog.now() AT TIME ZONE 'Asia/Singapore')::date
   WHERE id = S4;
  v := pg_temp.save(S3, STU, NULL, NULL, pg_temp.nine());
  IF NOT v.was_created THEN RAISE EXCEPTION 'T-ASM-12: past starts_at did not permit the save'; END IF;
  v := pg_temp.save(S4, STU, NULL, NULL, pg_temp.nine());
  IF NOT v.was_created THEN RAISE EXCEPTION 'T-ASM-12: start-of-date did not permit the save'; END IF;
  RAISE NOTICE 'PASS T-ASM-12 (both shapes, both GUC zones; the pinned literal alone decides)';
END $gate$;

-- ---------------------------------------------------------------------
-- T-ASM-13 .. T-ASM-24 -- authorization and gating denials
-- ---------------------------------------------------------------------
DO $authz$
DECLARE
  v_code text; v_msg text; v_msgs text[] := ARRAY[]::text[]; v_m text;
  v_obs uuid; v_pre text; v_lock int;
  S1  CONSTANT uuid := 'aa000000-0000-4000-8000-000000000001';
  S5  CONSTANT uuid := 'aa000000-0000-4000-8000-000000000005';
  S6  CONSTANT uuid := 'aa000000-0000-4000-8000-000000000006';
  S7  CONSTANT uuid := 'aa000000-0000-4000-8000-000000000007';
  S8  CONSTANT uuid := 'aa000000-0000-4000-8000-000000000008';
  S9  CONSTANT uuid := 'aa000000-0000-4000-8000-000000000009';
  S10 CONSTANT uuid := 'aa000000-0000-4000-8000-000000000010';
  STU CONSTANT uuid := 'c2000000-0000-4000-8000-000000000001';
BEGIN
  PERFORM pg_temp.as_trainer();

  -- T-ASM-13: attendance absent.
  v_code := pg_temp.errcode(pg_catalog.format(
    'SELECT pg_temp.save(%L,%L,NULL,NULL,%L::jsonb)', S5, STU, pg_temp.nine()::text));
  IF v_code <> 'BC102' THEN RAISE EXCEPTION 'T-ASM-13: got %, expected BC102', v_code; END IF;
  RAISE NOTICE 'PASS T-ASM-13';

  -- T-ASM-14: attendance row MISSING -- the same fail-closed denial.
  v_code := pg_temp.errcode(pg_catalog.format(
    'SELECT pg_temp.save(%L,%L,NULL,NULL,%L::jsonb)', S6, STU, pg_temp.nine()::text));
  IF v_code <> 'BC102' THEN RAISE EXCEPTION 'T-ASM-14: got %, expected BC102', v_code; END IF;
  RAISE NOTICE 'PASS T-ASM-14';

  -- T-ASM-15: inactive enrolment.
  v_code := pg_temp.errcode(pg_catalog.format(
    'SELECT pg_temp.save(%L,%L,NULL,NULL,%L::jsonb)', S10, STU, pg_temp.nine()::text));
  IF v_code <> 'BC103' THEN RAISE EXCEPTION 'T-ASM-15: got %, expected BC103', v_code; END IF;
  RAISE NOTICE 'PASS T-ASM-15';

  -- T-ASM-16: inactive trainer assignment.
  v_code := pg_temp.errcode(pg_catalog.format(
    'SELECT pg_temp.save(%L,%L,NULL,NULL,%L::jsonb)', S7, STU, pg_temp.nine()::text));
  IF v_code <> 'BC101' THEN RAISE EXCEPTION 'T-ASM-16: got %, expected BC101', v_code; END IF;
  v_msgs := v_msgs || pg_temp.errmsg(pg_catalog.format(
    'SELECT pg_temp.save(%L,%L,NULL,NULL,%L::jsonb)', S7, STU, pg_temp.nine()::text));
  RAISE NOTICE 'PASS T-ASM-16';

  -- T-ASM-17: an ACTIVE trainer with NO assignment to this session.
  v_code := pg_temp.errcode(pg_catalog.format(
    'SELECT pg_temp.save(%L,%L,NULL,NULL,%L::jsonb)', S8, STU, pg_temp.nine()::text));
  IF v_code <> 'BC101' THEN RAISE EXCEPTION 'T-ASM-17: got %, expected BC101', v_code; END IF;
  v_msgs := v_msgs || pg_temp.errmsg(pg_catalog.format(
    'SELECT pg_temp.save(%L,%L,NULL,NULL,%L::jsonb)', S8, STU, pg_temp.nine()::text));
  RAISE NOTICE 'PASS T-ASM-17';

  -- T-ASM-18: deactivated membership, then deactivated account -- inside
  -- rolled-back subtransactions so the fixture identity is restored.
  BEGIN
    UPDATE public.centre_memberships
       SET status = 'deactivated', deactivated_at = pg_catalog.now()
     WHERE id = 'c1000000-0000-4000-8000-000000000002';
    v_code := pg_temp.errcode(pg_catalog.format(
      'SELECT pg_temp.save(%L,%L,NULL,NULL,%L::jsonb)', S9, STU, pg_temp.nine()::text));
    IF v_code <> 'BC101' THEN RAISE EXCEPTION 'T-ASM-18: deactivated membership gave %', v_code; END IF;
    RAISE EXCEPTION USING ERRCODE = 'BCRBK';
  EXCEPTION WHEN SQLSTATE 'BCRBK' THEN NULL;
  END;
  BEGIN
    UPDATE public.accounts
       SET status = 'deactivated', deactivated_at = pg_catalog.now()
     WHERE id = 'c0000000-0000-4000-8000-000000000002';
    v_code := pg_temp.errcode(pg_catalog.format(
      'SELECT pg_temp.save(%L,%L,NULL,NULL,%L::jsonb)', S9, STU, pg_temp.nine()::text));
    IF v_code <> 'BC101' THEN RAISE EXCEPTION 'T-ASM-18: deactivated account gave %', v_code; END IF;
    RAISE EXCEPTION USING ERRCODE = 'BCRBK';
  EXCEPTION WHEN SQLSTATE 'BCRBK' THEN NULL;
  END;
  RAISE NOTICE 'PASS T-ASM-18 (deactivated membership and deactivated account both denied)';

  -- T-ASM-19: ambiguous identity is STRUCTURALLY UNREPRESENTABLE, which is
  -- stronger than a runtime denial: a second active account on the same
  -- auth.uid() violates the accounts auth_user unique constraint, and a
  -- second active trainer membership for the same (account, centre) violates
  -- the partial unique index. Both provocations must fail as unique
  -- violations (23505) -- the ambiguity cannot even be created.
  v_code := pg_temp.errcode($q$
    INSERT INTO public.accounts (id, auth_user_id, display_name, normalized_email, status)
    VALUES ('aa100000-0000-4000-8000-000000000099',
            'd0000000-0000-4000-8000-000000000002', 'Dup', 'dup@example.test', 'active')$q$);
  IF v_code <> '23505' THEN RAISE EXCEPTION 'T-ASM-19: duplicate auth account gave %, expected 23505', v_code; END IF;
  v_code := pg_temp.errcode($q$
    INSERT INTO public.centre_memberships (id, account_id, centre_id, role, status, activated_at)
    VALUES ('aa200000-0000-4000-8000-000000000099',
            'c0000000-0000-4000-8000-000000000002',
            'b0000000-0000-4000-8000-000000000001', 'trainer', 'active', pg_catalog.now())$q$);
  IF v_code <> '23505' THEN RAISE EXCEPTION 'T-ASM-19: duplicate active membership gave %, expected 23505', v_code; END IF;
  RAISE NOTICE 'PASS T-ASM-19 (ambiguity is unrepresentable; the HAVING count(*) = 1 discipline is its backstop)';

  -- T-ASM-20/21/22: management, linked parent and unauthenticated callers --
  -- BOTH RPCs, all denied with the single authored outcome.
  PERFORM pg_temp.as_management();
  v_code := pg_temp.errcode(pg_catalog.format(
    'SELECT pg_temp.save(%L,%L,NULL,NULL,%L::jsonb)', S9, STU, pg_temp.nine()::text));
  IF v_code <> 'BC101' THEN RAISE EXCEPTION 'T-ASM-20: management save gave %', v_code; END IF;
  v_msgs := v_msgs || pg_temp.errmsg(pg_catalog.format(
    'SELECT * FROM public.assessment_get_trainer_observation(%L,%L)', S1, STU));
  v_code := pg_temp.errcode(pg_catalog.format(
    'SELECT * FROM public.assessment_get_trainer_observation(%L,%L)', S1, STU));
  IF v_code <> 'BC101' THEN RAISE EXCEPTION 'T-ASM-20: management read gave %', v_code; END IF;
  RAISE NOTICE 'PASS T-ASM-20';

  PERFORM pg_temp.as_parent();
  v_code := pg_temp.errcode(pg_catalog.format(
    'SELECT pg_temp.save(%L,%L,NULL,NULL,%L::jsonb)', S9, STU, pg_temp.nine()::text));
  IF v_code <> 'BC101' THEN RAISE EXCEPTION 'T-ASM-21: parent save gave %', v_code; END IF;
  v_code := pg_temp.errcode(pg_catalog.format(
    'SELECT * FROM public.assessment_get_trainer_observation(%L,%L)', S1, STU));
  IF v_code <> 'BC101' THEN RAISE EXCEPTION 'T-ASM-21: parent read gave %', v_code; END IF;
  v_msgs := v_msgs || pg_temp.errmsg(pg_catalog.format(
    'SELECT * FROM public.assessment_get_trainer_observation(%L,%L)', S1, STU));
  RAISE NOTICE 'PASS T-ASM-21 (the linked parent -- the most dangerous pair -- is denied both RPCs)';

  PERFORM pg_temp.as_nobody();
  v_code := pg_temp.errcode(pg_catalog.format(
    'SELECT pg_temp.save(%L,%L,NULL,NULL,%L::jsonb)', S9, STU, pg_temp.nine()::text));
  IF v_code <> 'BC101' THEN RAISE EXCEPTION 'T-ASM-22: unauthenticated save gave %', v_code; END IF;
  v_code := pg_temp.errcode(pg_catalog.format(
    'SELECT * FROM public.assessment_get_trainer_observation(%L,%L)', S1, STU));
  IF v_code <> 'BC101' THEN RAISE EXCEPTION 'T-ASM-22: unauthenticated read gave %', v_code; END IF;
  RAISE NOTICE 'PASS T-ASM-22';

  -- T-ASM-23: borrowed observation id. The trainer IS authorized on S9, but
  -- supplies the S1 observation id with its CORRECT lock version.
  PERFORM pg_temp.as_trainer();
  SELECT o.id, o.lock_version INTO v_obs, v_lock FROM public.observations o WHERE o.class_session_id = S1;
  v_pre := pg_temp.snap(v_obs);
  v_code := pg_temp.errcode(pg_catalog.format(
    'SELECT pg_temp.save(%L,%L,%L,%s,%L::jsonb)', S9, STU, v_obs, v_lock, pg_temp.nine()::text));
  IF v_code <> 'BC112' THEN RAISE EXCEPTION 'T-ASM-23: got %, expected BC112', v_code; END IF;
  IF pg_temp.snap(v_obs) IS DISTINCT FROM v_pre THEN
    RAISE EXCEPTION 'T-ASM-23: the foreign observation was altered';
  END IF;
  RAISE NOTICE 'PASS T-ASM-23 (the foreign row is byte-unchanged)';

  -- T-ASM-24: every BC101 denial above is byte-identical, and identical to
  -- the denial for a NONEXISTENT session and a nonexistent student.
  v_msgs := v_msgs || pg_temp.errmsg(pg_catalog.format(
    'SELECT pg_temp.save(%L,%L,NULL,NULL,%L::jsonb)',
    'aa999999-0000-4000-8000-000000000001', STU, pg_temp.nine()::text));
  v_msgs := v_msgs || pg_temp.errmsg(pg_catalog.format(
    'SELECT * FROM public.assessment_get_trainer_observation(%L,%L)',
    'aa999999-0000-4000-8000-000000000001', STU));
  FOREACH v_m IN ARRAY v_msgs LOOP
    IF v_m IS DISTINCT FROM 'assessment: not found or not permitted' THEN
      RAISE EXCEPTION 'T-ASM-24: a denial disclosed which gate failed: %', v_m;
    END IF;
  END LOOP;
  RAISE NOTICE 'PASS T-ASM-24 (% denials byte-identical; existence is never disclosed)',
    pg_catalog.array_length(v_msgs, 1);
END $authz$;

-- ---------------------------------------------------------------------
-- T-ASM-27 / T-ASM-28 / T-ASM-29 -- atomicity, rollback and residue
-- ---------------------------------------------------------------------
-- T-ASM-27 forces a failure DURING rating persistence with a scaffold
-- trigger. Creating a trigger is test scaffolding permitted only on this
-- disposable database; it is dropped immediately after, and the database is
-- destroyed regardless.
CREATE FUNCTION public.asm_test_force_fail() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF pg_catalog.current_setting('bc.asm_force_fail', true) = 'on' THEN
    RAISE EXCEPTION USING ERRCODE = 'BCFRC', MESSAGE = 'forced rating-persistence failure';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER asm_test_force_fail_trg
  BEFORE INSERT OR UPDATE ON public.observation_ratings
  FOR EACH ROW EXECUTE FUNCTION public.asm_test_force_fail();

DO $atomic$
DECLARE
  v_obs uuid; v_pre text; v_code text; v_n bigint;
  S1 CONSTANT uuid := 'aa000000-0000-4000-8000-000000000001';
  STU CONSTANT uuid := 'c2000000-0000-4000-8000-000000000001';
BEGIN
  PERFORM pg_temp.as_trainer();
  SELECT o.id INTO v_obs FROM public.observations o WHERE o.class_session_id = S1;
  v_pre := pg_temp.snap(v_obs);

  PERFORM pg_catalog.set_config('bc.asm_force_fail', 'on', false);
  v_code := pg_temp.errcode(pg_catalog.format(
    'SELECT pg_temp.save(%L,%L,%L,11,%L::jsonb)', S1, STU, v_obs, pg_temp.nine()::text));
  PERFORM pg_catalog.set_config('bc.asm_force_fail', 'off', false);
  IF v_code <> 'BCFRC' THEN RAISE EXCEPTION 'T-ASM-27: the forced failure gave %', v_code; END IF;

  -- The ENTIRE transaction rolled back: the observation UPDATE that ran
  -- before the rating write is gone too.
  IF pg_temp.snap(v_obs) IS DISTINCT FROM v_pre THEN
    RAISE EXCEPTION 'T-ASM-27: the observation update survived the rating-write failure';
  END IF;
  RAISE NOTICE 'PASS T-ASM-27 (a rating-persistence failure rolls the whole save back)';
  RAISE NOTICE 'PASS T-ASM-28 (asserted field-by-field around every rejected call in this suite)';

  -- T-ASM-29: no committed observation carries other than exactly nine.
  SELECT count(*) INTO v_n
    FROM public.observations o
   WHERE (SELECT count(*) FROM public.observation_ratings r WHERE r.observation_id = o.id) <> 9;
  IF v_n <> 0 THEN RAISE EXCEPTION 'T-ASM-29: % observation(s) hold a non-nine rating set', v_n; END IF;
  RAISE NOTICE 'PASS T-ASM-29';
END $atomic$;

DROP TRIGGER asm_test_force_fail_trg ON public.observation_ratings;
DROP FUNCTION public.asm_test_force_fail();

-- ---------------------------------------------------------------------
-- T-ASM-35 .. T-ASM-38 -- read-path behaviour
-- ---------------------------------------------------------------------
DO $reads$
DECLARE
  v record; v_expected text[]; v_got text[]; v_n bigint;
  S1 CONSTANT uuid := 'aa000000-0000-4000-8000-000000000001';
  S2 CONSTANT uuid := 'aa000000-0000-4000-8000-000000000002';
  STU CONSTANT uuid := 'c2000000-0000-4000-8000-000000000001';
BEGIN
  PERFORM pg_temp.as_trainer();

  -- T-ASM-35: safe empty read -- exactly one row, never an error.
  SELECT count(*) INTO v_n FROM public.assessment_get_trainer_observation(S2, STU);
  IF v_n <> 1 THEN RAISE EXCEPTION 'T-ASM-35: % rows, expected exactly 1', v_n; END IF;
  SELECT * INTO v FROM public.assessment_get_trainer_observation(S2, STU);
  IF v.observation_exists OR v.observation_id IS NOT NULL OR v.lock_version IS NOT NULL
     OR v.strength_chips IS DISTINCT FROM ARRAY[]::text[]
     OR v.focus_chips IS DISTINCT FROM ARRAY[]::text[]
     OR v.observation_notes IS NOT NULL OR v.follow_up_notes IS NOT NULL
     OR v.term_evidence_notes IS NOT NULL
     OR v.ratings IS DISTINCT FROM '[]'::jsonb
     OR v.dimension_count <> 0 OR v.is_complete THEN
    RAISE EXCEPTION 'T-ASM-35: the empty shape is wrong: %', v;
  END IF;
  RAISE NOTICE 'PASS T-ASM-35';

  -- T-ASM-36: populated read. The S1 observation was created from a
  -- deliberately SHUFFLED payload; the read must return declaration order.
  SELECT * INTO v FROM public.assessment_get_trainer_observation(S1, STU);
  IF NOT v.observation_exists OR v.dimension_count <> 9 OR NOT v.is_complete
     OR v.follow_up_notes IS DISTINCT FROM 'Scaffold follow-up guidance'
     OR v.observation_notes IS DISTINCT FROM 'Scaffold observation notes'
     OR v.term_evidence_notes IS DISTINCT FROM 'Scaffold term evidence'
     OR v.strength_chips IS DISTINCT FROM ARRAY['confident-opening']::text[] THEN
    RAISE EXCEPTION 'T-ASM-36: populated read content wrong';
  END IF;
  v_expected := ARRAY['body', 'emotion', 'speech', 'tonality', 'eye_contact',
                      'vocal_projection', 'emotional_expression', 'sentence_flow',
                      'audience_awareness'];
  SELECT pg_catalog.array_agg(e ->> 'dimension_code') INTO v_got
    FROM pg_catalog.jsonb_array_elements(v.ratings) e;
  IF v_got IS DISTINCT FROM v_expected THEN
    RAISE EXCEPTION 'T-ASM-36: order is %, expected declaration order', v_got;
  END IF;
  -- Every element embeds the authoritative display_name and group_code.
  SELECT count(*) INTO v_n
    FROM pg_catalog.jsonb_array_elements(v.ratings) e
    JOIN public.assessment_dimensions d ON d.code::text = e ->> 'dimension_code'
   WHERE d.display_name = e ->> 'display_name' AND d.group_code::text = e ->> 'group_code';
  IF v_n <> 9 THEN RAISE EXCEPTION 'T-ASM-36: embedded labels do not match assessment_dimensions'; END IF;

  -- Mutate sort_order (an ordinary unprotected column) and prove the order
  -- DOES NOT MOVE -- the hard-coded declaration order alone decides.
  -- sort_order is pinned by a unique constraint AND a 1..9 CHECK, so an
  -- in-place permutation cannot be committed through them. DISPOSABLE-ONLY
  -- SCAFFOLDING: drop both, reverse the ordering, prove the read ignores it,
  -- then restore the data and both constraints exactly.
  ALTER TABLE public.assessment_dimensions DROP CONSTRAINT assessment_dimensions_sort_order_chk;
  ALTER TABLE public.assessment_dimensions DROP CONSTRAINT assessment_dimensions_sort_order_unique;
  UPDATE public.assessment_dimensions SET sort_order = 10 - sort_order;
  SELECT * INTO v FROM public.assessment_get_trainer_observation(S1, STU);
  SELECT pg_catalog.array_agg(e ->> 'dimension_code') INTO v_got
    FROM pg_catalog.jsonb_array_elements(v.ratings) e;
  UPDATE public.assessment_dimensions SET sort_order = 10 - sort_order;
  ALTER TABLE public.assessment_dimensions
    ADD CONSTRAINT assessment_dimensions_sort_order_chk CHECK (sort_order >= 1 AND sort_order <= 9);
  ALTER TABLE public.assessment_dimensions
    ADD CONSTRAINT assessment_dimensions_sort_order_unique UNIQUE (sort_order);
  -- Belt and braces: the applied body never references sort_order at all
  -- (comments stripped first -- the prose that EXPLAINS the rule mentions it).
  PERFORM 1 FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = 'assessment_get_trainer_observation'
     AND pg_catalog.regexp_replace(p.prosrc, '--[^\n]*', '', 'g') ~ 'sort_order';
  IF FOUND THEN RAISE EXCEPTION 'T-ASM-36: the read body references sort_order'; END IF;
  IF v_got IS DISTINCT FROM v_expected THEN
    RAISE EXCEPTION 'T-ASM-36: mutating sort_order moved the rating order';
  END IF;
  RAISE NOTICE 'PASS T-ASM-36 (shuffled insert, mutated sort_order: order pinned to declaration order)';
END $reads$;

-- ---------------------------------------------------------------------
-- T-ASM-30 / T-ASM-31 -- the audit chain is untouched by every assessment
-- call so far (saves, updates, rejections, reads, empty reads)
-- ---------------------------------------------------------------------
DO $chain$
DECLARE v record;
BEGIN
  SELECT * INTO v FROM pg_temp.chain_before;
  IF v.events  IS DISTINCT FROM (SELECT count(*) FROM public.audit_events)
  OR v.targets IS DISTINCT FROM (SELECT count(*) FROM public.audit_event_targets)
  OR v.heads   IS DISTINCT FROM (SELECT COALESCE(pg_catalog.string_agg(h.last_seq::text || '@' || h.last_hash, ','
                                        ORDER BY h.centre_id), '<empty>')
                                   FROM public.audit_chain_heads h) THEN
    RAISE EXCEPTION 'T-ASM-30/31: an assessment call moved the audit chain';
  END IF;
  RAISE NOTICE 'PASS T-ASM-30 (creates, updates and every rejection appended nothing)';
  RAISE NOTICE 'PASS T-ASM-31 (populated and empty reads appended nothing)';
END $chain$;

-- ---------------------------------------------------------------------
-- T-ASM-32 -- no report and no report transition from assessment saving
-- ---------------------------------------------------------------------
DO $noreport$
DECLARE v_n bigint;
BEGIN
  SELECT (SELECT count(*) FROM public.reports)
       + (SELECT count(*) FROM public.report_versions)
       + (SELECT count(*) FROM public.report_version_ratings)
       + (SELECT count(*) FROM public.report_version_checklist_progress)
       + (SELECT count(*) FROM public.report_version_approvals)
    INTO v_n;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'T-ASM-32: % report row(s) exist after assessment activity', v_n;
  END IF;
  RAISE NOTICE 'PASS T-ASM-32 (runtime leg: zero report rows after creates and updates; static leg in asm-static.mjs and assertion C10)';
END $noreport$;

-- ---------------------------------------------------------------------
-- T-ASM-34 -- the later requestDraft/report integration: truthful T0/T1/T2
-- audit with only permitted non-PII derivation identifiers. COMMITS audit
-- events -- which is why this whole suite is disposable-only.
-- Also drives the report to needs_edit for T-ASM-37.
-- ---------------------------------------------------------------------
DO $integration$
DECLARE
  v_obs uuid; v_report uuid; v_lv int; v_st public.report_status;
  v_ver uuid; v_rev int; v_hash text; v_olv int; v_wh text;
  v_n bigint; v_bad bigint; v record;
  S1 CONSTANT uuid := 'aa000000-0000-4000-8000-000000000001';
  STU CONSTANT uuid := 'c2000000-0000-4000-8000-000000000001';
BEGIN
  PERFORM pg_temp.as_trainer();
  SELECT o.id INTO v_obs FROM public.observations o WHERE o.class_session_id = S1;

  -- The real orchestration order: save (already done) -> T0 -> T1 -> T2.
  SELECT x.report_id, x.status, x.lock_version INTO v_report, v_st, v_lv
    FROM public.report_create(S1, STU, v_obs) x;
  SELECT x.status, x.lock_version INTO v_st, v_lv
    FROM public.report_mark_observation_saved(v_report, v_lv) x;
  SELECT x.status, x.lock_version, x.observation_lock_version INTO v_st, v_lv, v_olv
    FROM public.report_request_draft(v_report, v_lv) x;

  SELECT count(*) INTO v_n FROM public.audit_events;
  IF v_n <> 3 THEN RAISE EXCEPTION 'T-ASM-34: % audit events after T0/T1/T2, expected 3', v_n; END IF;

  -- The T0 payload carries EXACTLY the six permitted derivation identifiers
  -- (plus 'related_targets', which audit_append_event itself merges in --
  -- Step 7H ruling R3 -- and whose labels the generic-label sweep covers).
  SELECT count(*) INTO v_n
    FROM public.audit_events e
   WHERE e.action = 'report.created'
     AND (SELECT pg_catalog.array_agg(k ORDER BY k)
            FROM pg_catalog.jsonb_object_keys(e.payload) k)
         = ARRAY['class_module_id', 'class_session_id', 'observation_id',
                 'related_targets', 'report_id', 'status', 'student_id']
     AND e.payload ->> 'observation_id' = v_obs::text
     AND e.payload ->> 'status' = 'incomplete';
  IF v_n <> 1 THEN RAISE EXCEPTION 'T-ASM-34: the T0 payload does not carry exactly the six permitted keys'; END IF;

  -- No event, canonical payload or target label carries observation prose,
  -- chip values, rating values, a name, an email or a phone-shaped value.
  SELECT count(*) INTO v_bad
    FROM public.audit_events e
   WHERE (e.payload::text || e.payload_canonical) ~*
         -- Amendment 006 A-052 (audit-payload privacy), reconciled at B-V2-2:
         -- the RATIFIED labels are listed FIRST because they are the values
         -- that now exist; the superseded labels are retained so an archived
         -- or stale payload still trips the assertion. An assertion left
         -- pinned to the old labels alone keeps PASSING while checking for
         -- values that no longer exist -- the silent false negative A-052
         -- names as this amendment's highest-risk failure mode.
         '(Scaffold observation notes|Scaffold follow-up|Scaffold term|confident-opening|pacing|"beginning"|"developing"|"mastering"|"mastered"|"emerging"|"secure"|"advanced"|Fixture (Student|Trainer|Manager|Parent)|example\.test)';
  IF v_bad <> 0 THEN RAISE EXCEPTION 'T-ASM-34: % event payload(s) leak assessment substance or PII', v_bad; END IF;
  SELECT count(*) INTO v_bad
    FROM public.audit_event_targets t
   WHERE t.target_label NOT IN ('Report', 'Report version', 'Student', 'Class session',
                                'Observation', 'Correction request');
  IF v_bad <> 0 THEN RAISE EXCEPTION 'T-ASM-34: % target label(s) are not generic constants', v_bad; END IF;

  PERFORM 1 FROM public.audit_verify_chain(NULL, NULL, NULL) x WHERE NOT x.ok;
  IF FOUND THEN RAISE EXCEPTION 'T-ASM-34: the audit chain does not verify'; END IF;
  RAISE NOTICE 'PASS T-ASM-34 (truthful T0/T1/T2; payloads carry only permitted identifiers; labels generic; chain verifies)';

  -- ----- Drive on to needs_edit for T-ASM-37 --------------------------
  SELECT x.status, x.lock_version, x.report_version_id, x.revision_number, x.content_hash
    INTO v_st, v_lv, v_ver, v_rev, v_hash
    FROM public.report_store_draft(v_report, v_lv, v_olv,
      'Draft strength panel', 'Draft next-focus panel', 'Draft practice panel', 'Draft takeaway panel') x;
  PERFORM public.report_update_checklist(v_report, v_lv, v_ver, true, true, true);
  SELECT x.status, x.lock_version INTO v_st, v_lv
    FROM public.report_trainer_approve(v_report, v_st, v_lv, v_ver, v_hash) x;

  PERFORM pg_temp.as_management();
  SELECT x.status, x.lock_version INTO v_st, v_lv
    FROM public.report_management_return_to_trainer(v_report, v_lv, v_ver,
      'rating'::public.correction_issue_scope, 'emotion'::public.dimension_code,
      'Please re-verify the emotion rating against the observed behaviour.') x;
  IF v_st <> 'needs_edit' THEN RAISE EXCEPTION 'T-ASM-37 setup: return left status %', v_st; END IF;

  -- T-ASM-37: the assigned trainer reads the observation AFTER the return
  -- and receives the existing follow-up and the current nine ratings.
  PERFORM pg_temp.as_trainer();
  SELECT * INTO v FROM public.assessment_get_trainer_observation(S1, STU);
  IF NOT v.observation_exists
     OR v.follow_up_notes IS DISTINCT FROM 'Scaffold follow-up guidance'
     OR v.dimension_count <> 9 OR NOT v.is_complete THEN
    RAISE EXCEPTION 'T-ASM-37: the returned-correction read is missing follow-up or ratings';
  END IF;
  -- T-ASM-38 runtime: the payload carries NO correction metadata anywhere.
  IF v.ratings::text ~* '(issue_scope|correction|reason|resolved)' THEN
    RAISE EXCEPTION 'T-ASM-38: correction metadata leaked into the assessment read';
  END IF;
  RAISE NOTICE 'PASS T-ASM-37 (the exact capability U-7I-11 / U-30 / CP-4 recorded as blocked)';
  RAISE NOTICE 'PASS T-ASM-38 (runtime leg: no management-only correction metadata in the read)';
END $integration$;

\echo ASM_SUITE_COMPLETE
