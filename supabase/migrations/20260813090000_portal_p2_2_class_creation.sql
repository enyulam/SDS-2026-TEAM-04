-- =====================================================================
-- PORTAL PHASE P2-2 -- screen `26` Add Class: THE GOVERNED CREATE PATH.
-- =====================================================================
-- Authorized by the Operator on 2026-08-12, READING B, after their own
-- ruling was found internally inconsistent and held rather than applied:
--
--     "READING B. My ruling was ambiguous and your stop was right. The
--      enumerated zeros scoped the TERMS family... I wrote 'NO WRITE PATH
--      ANYWHERE' thinking about terms and then said 'BUILD P2-2 COMPLETE'
--      without registering that P2-2 is a create form."
--
--     "BUILD P2-2 -- screen 26 Add Class -- on the already-ratified
--      admin.module_created and admin.session_created."
--
-- ▶ THE CONSISTENCY POINT THAT SETTLED IT, recorded because it is what
--   makes this file compatible with the terms ruling rather than an
--   exception to it: A `SECURITY DEFINER` RPC NEEDS NO WRITE POLICY AND NO
--   WRITE GRANT. The owner writes; the caller holds only EXECUTE. So
--   "zero write policies, zero write grants" is satisfied here exactly as
--   it is on `terms`, and assertion `C-7` below re-proves it.
--
-- ---------------------------------------------------------------------
-- ⛔ WHAT THIS FILE DELIBERATELY DOES NOT DO -- AND IT IS A STOP, NOT A GAP
-- ---------------------------------------------------------------------
-- The Operator named EXACTLY TWO strings and added: "If class creation
-- needs anything beyond those two strings and the existing tables, state
-- it and stop."
--
-- ⛔ ASSIGNING A TRAINER AT CREATION TIME NEEDS A THIRD, `admin.trainer_assigned`.
--    It is already in the registry -- and it is NOT among the two named, so
--    it is "beyond those two strings" and it is STOPPED, not inferred.
--
-- ▶ The frame's `Assigned Trainer` section is therefore NOT built by this
--   phase. **A session created without an assignment is a REAL GOVERNED
--   STATE, not a broken one** -- `staff-projections.ts` already documents
--   "a session created but not yet assigned" and returns a null name for
--   it, so nothing downstream breaks.
--
-- ⛔ Assertion `C-8` FAILS THIS MIGRATION if it ever writes
--    `class_session_assignments` or names `admin.trainer_assigned`. A stop
--    recorded only in prose is a stop the next phase edits away.
--
-- ---------------------------------------------------------------------
-- ⛔ THE FRAME'S FIELDS THAT ARE NOT BUILT, AND WHY
-- ---------------------------------------------------------------------
-- `Class code` · `Capacity` -- ⛔ OMITTED by `C-14`, which ruled all six
--   recommended omissions out. No column, no parameter.
-- `Program`   -- ⛔ "programme has no entity" (`C-14`) and it must never
--   become a hidden `classes` entity between Class Grade and Class Module
--   (`A-016`). The class name IS `class_modules.title`.
-- `Trainer Assistant (TA)` -- ⛔ PROHIBITED (`A-014`, `G-7`).
--   `centre_membership_role` is not extended. REGISTERED-OMISSION, never ends.
-- Lesson number / title -- ⚠️ NOT parameters here. The `26` frame does not
--   draw them; they are per-session identity (`G-3`) captured elsewhere, and
--   a parameter no surface supplies is a field invented from nothing.
--   A session created here carries NULL lesson identity, which is the
--   correct NOT RECORDED state (hero 0B).
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- RPC 1 -- create a Class Module under a Class Grade.
-- ---------------------------------------------------------------------
-- ⚠️ THE REASON CODE DISCLOSES ONLY AFTER AUTHORIZATION SUCCEEDS -- the
-- pattern `T2a-12` proved on the evidence transport. EVERY authorization
-- failure collapses to one `not_permitted`; a specific reason is a
-- diagnostic for someone already proven to be active management of this
-- centre, and is therefore not a probe.
CREATE FUNCTION public.admin_create_class_module(
  p_class_grade_id uuid,
  p_title          text,
  OUT o_module_id  uuid,
  OUT o_reason     text
)
 RETURNS record
 LANGUAGE plpgsql
 VOLATILE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_centre_id     uuid;
  v_title         text;
BEGIN
  o_module_id := NULL;
  o_reason    := 'not_permitted';

  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  -- EXACTLY ONE ACTIVE management membership. `HAVING count(*) = 1` fails
  -- closed on zero AND on more than one -- the same predicate every other
  -- management gate in this codebase uses.
  SELECT (pg_catalog.array_agg(m.id))[1], (pg_catalog.array_agg(m.centre_id))[1]
    INTO v_membership_id, v_centre_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.role = 'management' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN RETURN; END IF;

  -- ⛔ THE GRADE MUST BE THIS CENTRE'S. Re-resolved server-side, so a caller
  -- cannot aim a create at another centre's grade -- centre drift is made
  -- unrepresentable rather than merely checked.
  IF NOT EXISTS (
    SELECT 1 FROM public.class_grades g
     WHERE g.id = p_class_grade_id AND g.centre_id = v_centre_id
  ) THEN RETURN; END IF;

  -- Authorization has succeeded. From here a reason is a diagnostic.
  -- ⚠️ `coalesce` and `nullif` are SQL GRAMMAR CONSTRUCTS, not schema
  -- members, so they CANNOT be written `pg_catalog.coalesce`. The first
  -- draft of this file did, and the migration APPLIED CLEANLY WITH ALL NINE
  -- ASSERTIONS GREEN -- PL/pgSQL resolves identifiers at CALL time, not at
  -- `CREATE FUNCTION`. ▶ It was caught by EXECUTING the RPC, which is why
  -- `P23` calls both of them rather than only inspecting the catalogue:
  -- a structural assertion cannot prove a function RUNS.
  v_title := pg_catalog.btrim(coalesce(p_title, ''));
  IF v_title = '' THEN o_reason := 'invalid_title'; RETURN; END IF;
  IF pg_catalog.length(v_title) > 120 THEN o_reason := 'title_too_long'; RETURN; END IF;

  IF EXISTS (
    SELECT 1 FROM public.class_modules m
     WHERE m.centre_id = v_centre_id AND m.class_grade_id = p_class_grade_id
       AND pg_catalog.lower(pg_catalog.btrim(m.title)) = pg_catalog.lower(v_title)
       AND m.is_active
  ) THEN o_reason := 'already_exists'; RETURN; END IF;

  INSERT INTO public.class_modules (centre_id, class_grade_id, title)
  VALUES (v_centre_id, p_class_grade_id, v_title)
  RETURNING id INTO o_module_id;

  -- ⛔ THE AUDIT WRITE IS IN THE SAME TRANSACTION AS THE INSERT (§4, §9
  -- rule 4). `admin.module_created` is ALREADY RATIFIED -- Step 7H put it
  -- in the registry and it has simply never had a writer until now.
  PERFORM public.audit_append_event(
    v_centre_id, v_account_id, v_membership_id, 'management',
    'admin.module_created', NULL, NULL, NULL,
    'class_module', o_module_id, 'Class Module',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'target_type', 'class_grade', 'target_id', p_class_grade_id::text,
        'target_label', 'Class Grade')
    ),
    -- ⚠️ DATA MINIMIZATION (A-029). The title is the module's own name and
    -- carries no personal datum; no child name, account name, email or
    -- phone number reaches an audit payload.
    pg_catalog.jsonb_build_object('title', v_title)
  );

  o_reason := 'created';
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_create_class_module(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_create_class_module(uuid, text) TO authenticated;

-- ---------------------------------------------------------------------
-- RPC 2 -- create ONE dated Class Session under a module.
-- ---------------------------------------------------------------------
-- ⛔ ONE CALL CREATES ONE DATED SESSION. The frame's Sun-Sat day selectors
-- are a GENERATOR, not a stored schedule (`C-14`): the client expands the
-- chosen days across the term and calls this N times.
--
-- ▶ NO RECURRENCE RULE IS STORED and NO DUPLICATED CALENDAR RECORD IS
--   CREATED (`A-016`, `A-047`) -- calendars are projections of these rows.
--   N calls means N audit events, which is the honest shape: each session
--   really is a separate governed record.
CREATE FUNCTION public.admin_create_class_session(
  p_class_module_id uuid,
  p_session_date    date,
  p_starts_at       time,
  p_ends_at         time,
  p_room            text,
  p_term_id         uuid,
  OUT o_session_id  uuid,
  OUT o_reason      text
)
 RETURNS record
 LANGUAGE plpgsql
 VOLATILE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_centre_id     uuid;
  v_room          text;
BEGIN
  o_session_id := NULL;
  o_reason     := 'not_permitted';

  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  SELECT (pg_catalog.array_agg(m.id))[1], (pg_catalog.array_agg(m.centre_id))[1]
    INTO v_membership_id, v_centre_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.role = 'management' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN RETURN; END IF;

  -- The module must be this centre's, and ACTIVE.
  IF NOT EXISTS (
    SELECT 1 FROM public.class_modules m
     WHERE m.id = p_class_module_id AND m.centre_id = v_centre_id AND m.is_active
  ) THEN RETURN; END IF;

  -- ⛔ AND SO MUST THE TERM, WHEN ONE IS SUPPLIED. This is where the terms
  -- migration's decision not to carry a composite `(term_id, centre_id)` FK
  -- is paid for: centre agreement is enforced HERE, by the only thing that
  -- writes the column, rather than by a third structural path to the same
  -- centre that could disagree with the other two.
  IF p_term_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.terms t
     WHERE t.id = p_term_id AND t.centre_id = v_centre_id AND t.is_active
  ) THEN RETURN; END IF;

  -- Authorization has succeeded. From here a reason is a diagnostic.
  IF p_session_date IS NULL THEN o_reason := 'invalid_date'; RETURN; END IF;
  IF p_starts_at IS NOT NULL AND p_ends_at IS NOT NULL AND p_ends_at <= p_starts_at THEN
    o_reason := 'invalid_times'; RETURN;
  END IF;

  -- ⚠️ An empty room is NULL, never an empty string. `NULL` means NOT
  -- RECORDED and the surface OMITS the element (hero 0B); '' would render
  -- as a recorded blank, and the table's own CHECK refuses it anyway.
  v_room := nullif(pg_catalog.btrim(coalesce(p_room, '')), '');

  INSERT INTO public.class_sessions
    (centre_id, class_module_id, session_date, starts_at, ends_at, room, term_id)
  VALUES
    (v_centre_id, p_class_module_id, p_session_date, p_starts_at, p_ends_at, v_room, p_term_id)
  RETURNING id INTO o_session_id;

  PERFORM public.audit_append_event(
    v_centre_id, v_account_id, v_membership_id, 'management',
    'admin.session_created', NULL, NULL, NULL,
    'class_session', o_session_id, 'Class Session',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'target_type', 'class_module', 'target_id', p_class_module_id::text,
        'target_label', 'Class Module')
    ),
    pg_catalog.jsonb_build_object('session_date', p_session_date::text)
  );

  o_reason := 'created';
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_create_class_session(uuid, date, time, time, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_create_class_session(uuid, date, time, time, text, uuid) TO authenticated;

-- ---------------------------------------------------------------------
-- ASSERTIONS. Each FAILS THE MIGRATION.
-- ---------------------------------------------------------------------
DO $assert$
DECLARE
  v_n integer;
BEGIN
  -- C-1 -- exactly the two authorized functions, both SECURITY DEFINER,
  -- both VOLATILE, both with `search_path` pinned to the empty string.
  -- ⚠️ Asserted against the catalogue's own `search_path=""` form WITH the
  -- quotes -- the `H0A-4` lesson.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname IN ('admin_create_class_module','admin_create_class_session')
     AND p.prosecdef AND p.provolatile = 'v'
     AND pg_catalog.array_to_string(p.proconfig, ',') = 'search_path=""';
  IF v_n <> 2 THEN
    RAISE EXCEPTION 'P2-2 assertion C-1 failed: % of 2 create RPCs are SECURITY DEFINER/VOLATILE with search_path pinned', v_n;
  END IF;

  -- C-2 -- exactly one `authenticated` EXECUTE each, and NOTHING for
  -- `anon` or `PUBLIC`.
  SELECT count(*) INTO v_n
    FROM information_schema.role_routine_grants
   WHERE routine_schema = 'public'
     AND routine_name IN ('admin_create_class_module','admin_create_class_session')
     AND grantee = 'authenticated' AND privilege_type = 'EXECUTE';
  IF v_n <> 2 THEN
    RAISE EXCEPTION 'P2-2 assertion C-2 failed: % of 2 authenticated EXECUTE grants', v_n;
  END IF;

  SELECT count(*) INTO v_n
    FROM information_schema.role_routine_grants
   WHERE routine_schema = 'public'
     AND routine_name IN ('admin_create_class_module','admin_create_class_session')
     AND grantee IN ('anon','PUBLIC');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-2 assertion C-2 failed: % anon/PUBLIC grant(s) on a create RPC', v_n;
  END IF;

  -- C-3 -- ⛔ THE AUDIT REGISTRY IS UNMOVED AT 19 AND NO NEW STRING WAS
  -- ADDED. Both RPCs fire strings Step 7H already ratified.
  IF pg_catalog.array_length(public.audit_action_registry(), 1) <> 19 THEN
    RAISE EXCEPTION 'P2-2 assertion C-3 failed: the audit registry is no longer 19';
  END IF;

  -- C-4 -- and the two they DO fire are the two the Operator named.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND ((p.proname = 'admin_create_class_module'  AND p.prosrc LIKE '%admin.module_created%')
       OR (p.proname = 'admin_create_class_session' AND p.prosrc LIKE '%admin.session_created%'));
  IF v_n <> 2 THEN
    RAISE EXCEPTION 'P2-2 assertion C-4 failed: % of 2 create RPCs emit the named audit string', v_n;
  END IF;

  -- C-5 -- NO TABLE, COLUMN OR ENUM was added by this migration.
  SELECT count(*) INTO v_n
    FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  IF v_n <> 29 THEN
    RAISE EXCEPTION 'P2-2 assertion C-5 failed: % tables, expected 29', v_n;
  END IF;

  SELECT count(DISTINCT t.typname) INTO v_n
    FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN
    RAISE EXCEPTION 'P2-2 assertion C-5 failed: % enums, expected 12', v_n;
  END IF;

  -- C-6 -- NO POLICY was added anywhere. The create path is a
  -- `SECURITY DEFINER` RPC, which is precisely why it needs none.
  SELECT count(*) INTO v_n FROM pg_policies WHERE schemaname = 'public';
  IF v_n <> 30 THEN
    RAISE EXCEPTION 'P2-2 assertion C-6 failed: % policies, expected 30', v_n;
  END IF;

  -- C-7 -- ⛔ THE TERMS WRITE GUARD STILL HOLDS. Re-asserted HERE, in the
  -- migration that introduces the product's first administrative write
  -- path, because that is exactly the moment someone would be tempted to
  -- open one on `terms` too.
  SELECT count(*) INTO v_n
    FROM (
      SELECT 1 FROM pg_policies
       WHERE schemaname = 'public' AND tablename = 'terms' AND cmd <> 'SELECT'
      UNION ALL
      SELECT 1 FROM information_schema.role_table_grants
       WHERE table_schema = 'public' AND table_name = 'terms'
         AND grantee IN ('anon','authenticated','service_role')
         AND privilege_type <> 'SELECT'
    ) s;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-2 assertion C-7 failed: a write path appeared on terms -- NO WRITE PATH ANYWHERE (Operator, 2026-08-12)';
  END IF;

  -- C-8 -- ⛔ THE STOP, MADE STRUCTURAL. Trainer assignment needs
  -- `admin.trainer_assigned`, which is NOT one of the two strings the
  -- Operator named. Neither RPC may write `class_session_assignments` or
  -- name that string.
  -- ▶ A stop recorded only in prose is a stop the next phase edits away.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname IN ('admin_create_class_module','admin_create_class_session')
     AND (p.prosrc LIKE '%class_session_assignments%' OR p.prosrc LIKE '%trainer_assigned%');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-2 assertion C-8 failed: a create RPC reaches trainer assignment -- BEYOND the two authorized strings, and STOPPED';
  END IF;

  -- C-9 -- ⛔ NEITHER RPC TOUCHES A REPORT, A RATING OR AN OBSERVATION.
  -- Class creation is administrative; it has no business near assessment
  -- substance, and this is the guard that keeps it that way.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname IN ('admin_create_class_module','admin_create_class_session')
     AND (p.prosrc LIKE '%report%' OR p.prosrc LIKE '%rating%' OR p.prosrc LIKE '%observation%');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-2 assertion C-9 failed: a create RPC reaches report/assessment data';
  END IF;

  RAISE NOTICE 'P2-2 assertions C-1..C-9 PASSED: two create RPCs, two ratified audit strings, registry 19, no table/enum/policy, terms still read-only, trainer assignment STOPPED';
END
$assert$;

COMMIT;
