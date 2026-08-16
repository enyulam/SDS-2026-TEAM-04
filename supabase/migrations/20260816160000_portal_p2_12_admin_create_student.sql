-- =====================================================================
-- PORTAL PHASE P2-12 -- screen `20` Register Student.
-- =====================================================================
-- ⛔ WHAT THIS FILE ADDS, NAMED NOT COUNTED:
--      · function  public.admin_create_student(text, text, uuid[])
--      · grant     EXECUTE ON that function TO authenticated
--    NOTHING ELSE. No table, column, enum, policy, client table grant.
--
-- ⛔ ZERO NEW AUDIT STRINGS, AND THAT IS A MEASURED CLAIM, NOT A CHOICE.
--    `admin.student_created` and `admin.enrolment_changed` are BOTH already in
--    the ratified 23-string registry (Step 7H, `20260804213000`). ▶ `A-029`
--    is one event per governed ACTION: adding a second name for an action that
--    already has one would itself be a `CLAUDE.md` §12 stop-and-ask.
--    Assertion `PM-6` measures the registry UNMOVED at 23.
--
-- ⚠️ FIRST EMISSION OF EITHER STRING. Both were ratified at Step 7H and have
--    never been written by any code path. `PM-8` executes the refusal leg and
--    the suite executes the accepting leg, so neither is registered-but-untested.
--
-- ---------------------------------------------------------------------
-- ⛔ THE FIELDS THIS FUNCTION DOES NOT TAKE, AND WHY
-- ---------------------------------------------------------------------
--   The frame draws nine profile fields. `students` holds, measured:
--   `id · centre_id · full_name · is_active · created_at · updated_at ·
--   deactivated_at`. **Nothing else.** Under the Operator ruling of
--   2026-08-16 every field with no column **stays out and is CITED, not
--   disabled**:
--
--     · Date of birth · Gender · Student ID  -- 1 column / 1 enum+column /
--       1 column + unique index + a GENERATION RULE. Each is a product
--       decision that has not been taken.
--     · Guardian name · contact · email · home address -- ⛔ **REFUSED BY
--       RULING.** Screen `21` already creates the guardian properly, as an
--       `accounts` row linked through `parent_student_links`. Four columns
--       here would be **a second, unlinked copy of the guardian that nothing
--       keeps in step** -- *"a data defect, not four columns."*
--     · Photo -- deferred by `C-15`; it is a bucket, its policies, an upload
--       transport and a column.
--
--   ✅ WHAT IS BUILT: first and last name **joined into `full_name`** -- costing
--   nothing, exactly as `P2-11` joined into `accounts.display_name` -- and the
--   `Assign Classes` multi-select, which is `enrolments` and already exists.
--
-- ---------------------------------------------------------------------
-- ⚠️ ONE `admin.enrolment_changed` EVENT PER MODULE, DELIBERATELY
-- ---------------------------------------------------------------------
--   `A-029` counts ACTIONS, and each enrolment is a SEPARATELY MUTABLE
--   governed fact: a student can be withdrawn from one module while staying
--   in another, and `A-029`'s correction-by-new-event needs a prior event to
--   correct. ▶ One collapsed event covering three modules could not be
--   corrected per module afterwards without inventing a second vocabulary.
-- =====================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.admin_create_student(
  p_first_name       text,
  p_last_name        text,
  p_class_module_ids uuid[],
  OUT o_student_id uuid,
  OUT o_enrolments integer,
  OUT o_reason     text
)
RETURNS record
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_centre_id     uuid;
  v_first         text;
  v_last          text;
  v_full          text;
  v_ids           uuid[];
  v_module        uuid;
  v_enrolment_id  uuid;
BEGIN
  -- ⛔ FAIL CLOSED FIRST. Every early return leaves the id NULL and a reason
  --    set, so a refusal is never mistaken for a creation that produced
  --    nothing (`Q-7`).
  o_student_id := NULL;
  o_enrolments := 0;
  o_reason     := 'not_permitted';

  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  -- ⛔ AUTHORIZATION RE-RESOLVED LIVE, never from a claim (`ADR-4`).
  --    `HAVING count(*) = 1` refuses an account holding two active management
  --    memberships rather than picking one.
  SELECT (pg_catalog.array_agg(m.id))[1], (pg_catalog.array_agg(m.centre_id))[1]
    INTO v_membership_id, v_centre_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.role = 'management' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN RETURN; END IF;

  -- ── Validation.
  v_first := pg_catalog.btrim(coalesce(p_first_name, ''));
  v_last  := pg_catalog.btrim(coalesce(p_last_name, ''));
  IF pg_catalog.length(v_first) = 0 OR pg_catalog.length(v_last) = 0 THEN
    o_reason := 'invalid_name';
    RETURN;
  END IF;
  -- ⚠️ THE JOIN IS DONE HERE, ONCE, so the two halves cannot be stored apart
  --    and re-joined differently by a later caller.
  v_full := v_first || ' ' || v_last;
  IF pg_catalog.length(v_full) > 120 THEN
    o_reason := 'invalid_name';
    RETURN;
  END IF;

  -- ⛔ AT LEAST ONE MODULE. A student with no enrolment appears on no roster
  --    and can be assessed by nobody; creating one silently would be a row
  --    that looks like a registration and is not.
  --    ⚠️ `coalesce` is SQL GRAMMAR and must NEVER be schema-qualified.
  SELECT pg_catalog.array_agg(DISTINCT id) INTO v_ids
    FROM pg_catalog.unnest(coalesce(p_class_module_ids, ARRAY[]::uuid[])) AS t(id)
   WHERE id IS NOT NULL;
  IF v_ids IS NULL OR pg_catalog.array_length(v_ids, 1) IS NULL THEN
    o_reason := 'no_classes';
    RETURN;
  END IF;

  -- ⛔ EVERY MODULE MUST BE THIS CENTRE'S. A module id from another centre is
  --    a refusal, not a silently-skipped row: enrolling into three of four
  --    requested classes and reporting success would be a lie the caller
  --    cannot see.
  IF EXISTS (
    SELECT 1 FROM pg_catalog.unnest(v_ids) AS t(id)
     WHERE NOT EXISTS (
       SELECT 1 FROM public.class_modules cm
        WHERE cm.id = t.id AND cm.centre_id = v_centre_id
     )
  ) THEN
    o_reason := 'unknown_class';
    RETURN;
  END IF;

  -- ── The rows. ONE transaction.
  INSERT INTO public.students (centre_id, full_name)
  VALUES (v_centre_id, v_full)
  RETURNING id INTO o_student_id;

  -- ⛔ NEITHER THE NAME NOR ANY IDENTIFYING TEXT APPEARS IN A LABEL OR
  --    PAYLOAD. `A-029` data minimization, and `CLAUDE.md` §12 makes putting a
  --    child's name into an audit label a STOP-AND-ASK. The label is a TYPE
  --    label; identity is recoverable by id from an access-controlled row.
  PERFORM public.audit_append_event(
    v_centre_id, v_account_id, v_membership_id, 'management',
    'admin.student_created', NULL, NULL, NULL,
    'student', o_student_id, 'Student',
    NULL,
    pg_catalog.jsonb_build_object('enrolment_count', pg_catalog.array_length(v_ids, 1))
  );

  FOREACH v_module IN ARRAY v_ids LOOP
    INSERT INTO public.enrolments (centre_id, class_module_id, student_id)
    VALUES (v_centre_id, v_module, o_student_id)
    RETURNING id INTO v_enrolment_id;

    PERFORM public.audit_append_event(
      v_centre_id, v_account_id, v_membership_id, 'management',
      'admin.enrolment_changed', NULL, NULL, NULL,
      'enrolment', v_enrolment_id, 'Enrolment',
      pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object(
          'target_type', 'student', 'target_id', o_student_id::text,
          'target_label', 'Student'),
        pg_catalog.jsonb_build_object(
          'target_type', 'class_module', 'target_id', v_module::text,
          'target_label', 'Class module')
      ),
      pg_catalog.jsonb_build_object('change', 'enrolled')
    );

    o_enrolments := o_enrolments + 1;
  END LOOP;

  o_reason := 'created';
END;
$fn$;

REVOKE ALL ON FUNCTION public.admin_create_student(text, text, uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_create_student(text, text, uuid[]) TO authenticated;

-- =====================================================================
-- APPLY-TIME ASSERTIONS
-- =====================================================================
DO $assert$
DECLARE
  v_count integer;
  v_text  text;
  v_rec   record;
BEGIN
  -- PM-1: posture. ⚠️ NOT `STABLE` — this one writes.
  SELECT pg_catalog.count(*) INTO v_count
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'admin_create_student'
     AND p.prosecdef AND p.provolatile = 'v'
     AND p.proconfig @> ARRAY['search_path=""'];
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'PM-1 FAILED: expected 1 VOLATILE SECURITY DEFINER function with empty search_path, found %', v_count;
  END IF;
  RAISE NOTICE 'PM-1 PASS  SECURITY DEFINER + VOLATILE + search_path = '''' ';

  -- PM-2: exactly one grant, to `authenticated`.
  SELECT pg_catalog.count(*) INTO v_count
    FROM information_schema.role_routine_grants g
   WHERE g.routine_schema = 'public' AND g.routine_name = 'admin_create_student'
     AND g.grantee <> 'postgres';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'PM-2 FAILED: expected 1 non-owner grant, found %', v_count;
  END IF;
  SELECT g.grantee INTO v_text FROM information_schema.role_routine_grants g
   WHERE g.routine_schema = 'public' AND g.routine_name = 'admin_create_student' AND g.grantee <> 'postgres';
  IF v_text <> 'authenticated' THEN
    RAISE EXCEPTION 'PM-2 FAILED: grantee is %', v_text;
  END IF;
  RAISE NOTICE 'PM-2 PASS  one EXECUTE grant, to authenticated';

  -- PM-3: the result shape is pinned.
  SELECT pg_catalog.pg_get_function_result(p.oid) INTO v_text
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'admin_create_student';
  IF v_text <> 'record' THEN
    RAISE EXCEPTION 'PM-3 FAILED: result is %', v_text;
  END IF;
  RAISE NOTICE 'PM-3 PASS  OUT-parameter record shape';

  -- PM-4: ⛔ NO COLUMN THE FRAME WANTS AND THE SCHEMA LACKS IS REFERENCED.
  SELECT p.prosrc INTO v_text
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'admin_create_student' AND p.prokind = 'f';
  IF v_text ~* '\mdate_of_birth\M|\mgender\M|\mguardian|\mhome_address\M|\mphoto\M|\mstudent_code\M' THEN
    RAISE EXCEPTION 'PM-4 FAILED: the body names a field with no column';
  END IF;
  RAISE NOTICE 'PM-4 PASS  no DOB, gender, guardian, address, photo or student code';

  -- PM-5: ⛔ NO IDENTIFYING TEXT IN ANY AUDIT LABEL OR PAYLOAD.
  IF v_text ~* 'jsonb_build_object\s*\(\s*''(name|full_name|email|phone)''' OR v_text ~* '''Student''\s*\|\|' THEN
    RAISE EXCEPTION 'PM-5 FAILED: an audit label or payload carries identifying text';
  END IF;
  IF v_text !~ 'v_full' THEN
    RAISE EXCEPTION 'PM-5 FAILED: the name variable is absent, so this assertion is vacuous';
  END IF;
  RAISE NOTICE 'PM-5 PASS  audit labels are TYPE labels; the name exists in the body and reaches no label or payload';

  -- PM-6: ⛔ THE REGISTRY IS UNMOVED AT 23, and both strings this function
  -- emits are ALREADY in it.
  SELECT (SELECT pg_catalog.count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE')::text
      || '|' || (SELECT pg_catalog.count(DISTINCT t.typname) FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public' AND t.typtype = 'e')::text
      || '|' || (SELECT pg_catalog.count(*) FROM pg_catalog.pg_policies WHERE schemaname = 'public')::text
      || '|' || (SELECT pg_catalog.array_length(public.audit_action_registry(), 1))::text
    INTO v_text;
  IF v_text <> '30|12|30|23' THEN
    RAISE EXCEPTION 'PM-6 FAILED: census moved to % (expected 30|12|30|23)', v_text;
  END IF;
  IF NOT (public.audit_action_registry() @> ARRAY['admin.student_created', 'admin.enrolment_changed']) THEN
    RAISE EXCEPTION 'PM-6 FAILED: a string this function emits is not in the registry';
  END IF;
  RAISE NOTICE 'PM-6 PASS  census unmoved at % and BOTH emitted strings were already ratified', v_text;

  -- PM-7: ⛔ NOTHING WAS CREATED BY APPLYING THIS FILE.
  SELECT pg_catalog.count(*) INTO v_count FROM public.students;
  IF v_count <> 13 THEN
    RAISE EXCEPTION 'PM-7 FAILED: students moved to % (expected 13)', v_count;
  END IF;
  RAISE NOTICE 'PM-7 PASS  students unmoved at 13 -- declaring a write path writes nothing';

  -- PM-8: ⚠️ EXECUTE IT, ON THE REFUSAL PATH. As `postgres` there is no
  -- application account, so this returns `not_permitted` at GATE 1 having
  -- written nothing. ▶ It proves NAME RESOLUTION to that point and NOTHING
  -- about the inserts or the audit calls -- the suite reaches those, as a
  -- real management caller. §26.1's ceiling, restated because it keeps
  -- being true.
  SELECT * INTO v_rec FROM public.admin_create_student('x', 'y', ARRAY[]::uuid[]);
  IF v_rec.o_reason <> 'not_permitted' OR v_rec.o_student_id IS NOT NULL THEN
    RAISE EXCEPTION 'PM-8 FAILED: owner probe returned % / %', v_rec.o_reason, v_rec.o_student_id;
  END IF;
  RAISE NOTICE 'PM-8 PASS  executed as owner -> not_permitted, no row -- ⚠️ GATE 1 ONLY';

  SELECT pg_catalog.count(*) INTO v_count FROM public.students;
  IF v_count <> 13 THEN
    RAISE EXCEPTION 'PM-8b FAILED: the refusal probe created a student';
  END IF;
  RAISE NOTICE 'PM-8b PASS  and the refusal wrote nothing (students still 13)';
END;
$assert$;

COMMIT;
