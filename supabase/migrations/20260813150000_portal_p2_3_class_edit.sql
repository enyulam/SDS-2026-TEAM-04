-- =====================================================================
-- PORTAL PHASE P2-3 -- screen `27` Management Edit Class.
-- =====================================================================
-- Authorized by the Operator on 2026-08-13, with the strings and the count
-- stated in advance and approved before this file was written:
--
--     "APPROVED -- two strings, registry 19 -> 21, exactly as stated. Your
--      scoping is right: every field the Edit frame draws in the session
--      group is a session column, so admin.session_updated is needed rather
--      than convenient."
--
--     "AUTHORIZED: add it, plus admin.session_updated if editing a session
--      is in scope for 27... Amend A-057 the way C-4 was amended, extend
--      BOTH declaration sites in one migration, and prove chain verification
--      accepts the new strings with a non-vacuity leg."
--
-- ---------------------------------------------------------------------
-- ⚠️ ONE PREMISE OF THAT INSTRUCTION HAD LAPSED, AND IT IS RECORDED HERE
--    RATHER THAN QUIETLY HALF-SATISFIED
-- ---------------------------------------------------------------------
-- **"Extend BOTH declaration sites" was true at Step 7H**, which declared the
-- 16-string registry TWICE. ▶ **`P1-2` CLOSED THAT.** Measured before this
-- file was written: there is exactly ONE site,
-- `public.audit_action_registry()`, and both `audit_append_event` and
-- `audit_verify_chain` READ it. `P1-2`'s assertion `E5` already fails any
-- migration that reintroduces a literal.
--
-- ✅ **The single site is extended, and assertion `U-3` below re-proves that
-- no second declaration exists** -- which is what the instruction was
-- protecting: a one-sided extension writes events verification then rejects.
--
-- ⛔ **Operator ruling: record it as an operator-supplied premise refuted by
-- measurement. That is now the THIRD.**
--
-- ---------------------------------------------------------------------
-- ⛔ THE REGISTRY EXTENSION -- EXACTLY TWO STRINGS, 19 -> 21
-- ---------------------------------------------------------------------
--   `admin.module_updated`  -- a Class Module's OWN fields changed:
--                              `title`, `class_grade_id`.
--   `admin.session_updated` -- an existing Class Session's OWN fields
--                              changed: `session_date`, `starts_at`,
--                              `ends_at`, `room`, `term_id`.
--
-- ⚠️ `A-057` is amended in the `C-4` shape: the amendment is recorded IN the
-- registry function, beside the strings it adds, so a reader of the list is
-- reading its provenance at the same time.
--
-- ---------------------------------------------------------------------
-- ⛔ THREE THINGS THIS PHASE REFUSES, AND THE REFUSALS ARE THE VALUABLE HALF
-- ---------------------------------------------------------------------
-- Operator: *"Recording them explicitly -- especially the day strip, where
-- changing which weekdays a class meets means destroying sessions with no
-- ratified string -- is what stops a later phase building the control and
-- quietly not wiring it."*
--
--  1. ⛔ **NO SESSION CANCEL OR DELETE STRING**, so **the day strip is NOT
--     EDITABLE on `27`**. Changing which weekdays a class meets means
--     REMOVING existing sessions -- a governed destruction with no ratified
--     string, and a session may already carry attendance, an observation or
--     a submitted report. Assertion `U-5` fails the build if either update
--     RPC ever DELETEs a session.
--  2. ⛔ **NO UNASSIGN STRING**, so the `-` beside the assigned trainer is
--     not built. REASSIGNMENT works through the existing
--     `admin_assign_session_trainer` (`P2-2b`), which is a different action
--     with a ratified string.
--  3. ⛔ **NOTHING FOR `Class code`, `Capacity` OR `Program`** -- `C-14`
--     omits all three and no column exists. "Programme" must never become
--     the hidden `classes` entity `A-016` forbids.
--
-- ⛔ AND NOTHING TOUCHES ASSESSMENT SUBSTANCE. Assertion `U-6` fails the
-- build if either RPC mentions a report, a rating or an observation:
-- editing a class is administrative and has no business near them.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- THE REGISTRY -- the ONE declaration site, extended by exactly two.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.audit_action_registry()
 RETURNS text[]
 LANGUAGE sql
 IMMUTABLE
 SET search_path TO ''
AS $function$
  SELECT ARRAY[
    'report.created',
    'report_version.created',
    'report.state_changed',
    'attendance.changed',
    'admin.module_created',
    'admin.session_created',
    'admin.trainer_assigned',
    'admin.student_created',
    'admin.enrolment_changed',
    'admin.parent_link_changed',
    'admin.profile_created',
    'invitation.created',
    'invitation.revoked',
    'invitation.reissued',
    'membership.role_changed',
    'membership.bootstrap',
    -- A-057 as amended by C-4 and its collapse ruling, 2026-08-11. 16 -> 19.
    -- ⛔ The prohibition RE-ARMS AT THREE: a fourth evidence action is a fresh
    --    CLAUDE.md §12 stop-and-ask. evidence.uploaded was COLLAPSED into
    --    evidence.attached and must not be reintroduced -- a second name for
    --    one action is the defect the collapse closed.
    'evidence.attached',
    'evidence.accessed',
    'evidence.removed',
    -- A-057 as further amended by the Operator ruling of 2026-08-13, in the
    -- C-4 shape. 19 -> 21. The strings and the count were STATED IN ADVANCE
    -- and approved before this migration was written.
    --
    -- ⛔ EXACTLY TWO, FOR THE TWO ENTITIES SCREEN `27` EDITS. A Class Module
    --    and a Class Session are different governed objects with different
    --    lifecycles, so one shared "admin.class_updated" would make the audit
    --    trail unable to say WHICH was changed -- and A-029 binds one event
    --    per governed ACTION.
    --
    -- ⛔ THREE NEIGHBOURING ACTIONS ARE DELIBERATELY ABSENT, and their absence
    --    is what keeps the corresponding controls unbuilt rather than built
    --    and quietly unwired:
    --      * NO session cancel/delete -- so `27`'s day strip is READ-ONLY.
    --        Changing which weekdays a class meets DESTROYS sessions that may
    --        already carry attendance, an observation or a submitted report.
    --      * NO trainer unassign -- reassignment uses admin.trainer_assigned.
    --      * NO module delete or deactivate.
    --    ⛔ Each is a fresh CLAUDE.md §12 stop-and-ask. This ruling is not a
    --    standing licence to extend the registry.
    'admin.module_updated',
    'admin.session_updated'
  ];
$function$;

-- ---------------------------------------------------------------------
-- RPC 1 -- update a Class Module's own fields.
-- ---------------------------------------------------------------------
-- ⚠️ A CONFIRMED NO-OP EMITS NOTHING (the `FA-6` / `P24-5` shape). Saving a
-- form nobody changed is not a governed action, and an audit trail that
-- records non-events stops being evidence that something happened.
CREATE FUNCTION public.admin_update_class_module(
  p_class_module_id uuid,
  p_class_grade_id  uuid,
  p_title           text,
  OUT o_changed     boolean,
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
  v_title         text;
  v_old_title     text;
  v_old_grade     uuid;
BEGIN
  o_changed := false;
  o_reason  := 'not_permitted';

  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  SELECT (pg_catalog.array_agg(m.id))[1], (pg_catalog.array_agg(m.centre_id))[1]
    INTO v_membership_id, v_centre_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.role = 'management' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN RETURN; END IF;

  SELECT m.title, m.class_grade_id INTO v_old_title, v_old_grade
    FROM public.class_modules m
   WHERE m.id = p_class_module_id AND m.centre_id = v_centre_id AND m.is_active;
  IF v_old_title IS NULL THEN RETURN; END IF;

  -- ⛔ THE GRADE MUST BE THIS CENTRE'S, re-resolved server-side, so an edit
  -- can never move a module under another centre's grade.
  IF NOT EXISTS (
    SELECT 1 FROM public.class_grades g
     WHERE g.id = p_class_grade_id AND g.centre_id = v_centre_id
  ) THEN RETURN; END IF;

  -- Authorization has succeeded. From here a reason is a diagnostic.
  v_title := pg_catalog.btrim(coalesce(p_title, ''));
  IF v_title = '' THEN o_reason := 'invalid_title'; RETURN; END IF;
  IF pg_catalog.length(v_title) > 120 THEN o_reason := 'title_too_long'; RETURN; END IF;

  IF EXISTS (
    SELECT 1 FROM public.class_modules m
     WHERE m.centre_id = v_centre_id AND m.class_grade_id = p_class_grade_id
       AND pg_catalog.lower(pg_catalog.btrim(m.title)) = pg_catalog.lower(v_title)
       AND m.is_active AND m.id <> p_class_module_id
  ) THEN o_reason := 'already_exists'; RETURN; END IF;

  IF v_old_title = v_title AND v_old_grade = p_class_grade_id THEN
    o_reason := 'unchanged';
    RETURN;
  END IF;

  UPDATE public.class_modules
     SET title = v_title, class_grade_id = p_class_grade_id, updated_at = pg_catalog.now()
   WHERE id = p_class_module_id;

  PERFORM public.audit_append_event(
    v_centre_id, v_account_id, v_membership_id, 'management',
    'admin.module_updated', NULL, NULL, NULL,
    'class_module', p_class_module_id, 'Class Module',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'target_type', 'class_grade', 'target_id', p_class_grade_id::text,
        'target_label', 'Class Grade')
    ),
    -- ⚠️ WHICH FIELDS MOVED, NEVER THE OLD VALUES. The prior state is already
    -- recoverable from the chain's earlier events, and data minimization
    -- (A-029) means an audit payload carries no more than the action needs.
    pg_catalog.jsonb_build_object(
      'title_changed', v_old_title IS DISTINCT FROM v_title,
      'grade_changed', v_old_grade IS DISTINCT FROM p_class_grade_id)
  );

  o_changed := true;
  o_reason  := 'updated';
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_update_class_module(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_update_class_module(uuid, uuid, text) TO authenticated;

-- ---------------------------------------------------------------------
-- RPC 2 -- update ONE existing Class Session's own fields.
-- ---------------------------------------------------------------------
-- ⛔ ONE CALL UPDATES ONE SESSION, and it NEVER creates or destroys one.
-- Screen `27` applies room/time/term across the module's existing sessions by
-- calling this once per session -- N sessions, N governed transactions, N
-- audit events, exactly as creation works.
CREATE FUNCTION public.admin_update_class_session(
  p_class_session_id uuid,
  p_session_date     date,
  p_starts_at        time,
  p_ends_at          time,
  p_room             text,
  p_term_id          uuid,
  OUT o_changed      boolean,
  OUT o_reason       text
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
  v_old           record;
BEGIN
  o_changed := false;
  o_reason  := 'not_permitted';

  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  SELECT (pg_catalog.array_agg(m.id))[1], (pg_catalog.array_agg(m.centre_id))[1]
    INTO v_membership_id, v_centre_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.role = 'management' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN RETURN; END IF;

  SELECT s.id, s.session_date, s.starts_at, s.ends_at, s.room, s.term_id
    INTO v_old
    FROM public.class_sessions s
   WHERE s.id = p_class_session_id AND s.centre_id = v_centre_id;
  IF v_old.id IS NULL THEN RETURN; END IF;

  -- ⛔ AND THE TERM, WHEN ONE IS SUPPLIED, MUST BE THIS CENTRE'S AND ACTIVE.
  -- The same gate `admin_create_class_session` makes, for the same reason:
  -- `class_sessions.term_id` has a plain FK to `terms`, not a composite one,
  -- so centre agreement is enforced by the only things that write the column.
  IF p_term_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.terms t
     WHERE t.id = p_term_id AND t.centre_id = v_centre_id AND t.is_active
  ) THEN RETURN; END IF;

  -- Authorization has succeeded. From here a reason is a diagnostic.
  IF p_session_date IS NULL THEN o_reason := 'invalid_date'; RETURN; END IF;
  IF p_starts_at IS NOT NULL AND p_ends_at IS NOT NULL AND p_ends_at <= p_starts_at THEN
    o_reason := 'invalid_times'; RETURN;
  END IF;

  -- ⚠️ An empty room is NULL, never '' -- NULL means NOT RECORDED and the
  -- surface OMITS the element (hero 0B).
  v_room := nullif(pg_catalog.btrim(coalesce(p_room, '')), '');

  IF v_old.session_date = p_session_date
     AND v_old.starts_at IS NOT DISTINCT FROM p_starts_at
     AND v_old.ends_at   IS NOT DISTINCT FROM p_ends_at
     AND v_old.room      IS NOT DISTINCT FROM v_room
     AND v_old.term_id   IS NOT DISTINCT FROM p_term_id
  THEN
    o_reason := 'unchanged';
    RETURN;
  END IF;

  UPDATE public.class_sessions
     SET session_date = p_session_date, starts_at = p_starts_at, ends_at = p_ends_at,
         room = v_room, term_id = p_term_id, updated_at = pg_catalog.now()
   WHERE id = p_class_session_id;

  PERFORM public.audit_append_event(
    v_centre_id, v_account_id, v_membership_id, 'management',
    'admin.session_updated', NULL, NULL, NULL,
    'class_session', p_class_session_id, 'Class Session',
    '[]'::jsonb,
    pg_catalog.jsonb_build_object(
      'date_changed',  v_old.session_date IS DISTINCT FROM p_session_date,
      'times_changed', v_old.starts_at IS DISTINCT FROM p_starts_at
                       OR v_old.ends_at IS DISTINCT FROM p_ends_at,
      'room_changed',  v_old.room IS DISTINCT FROM v_room,
      'term_changed',  v_old.term_id IS DISTINCT FROM p_term_id)
  );

  o_changed := true;
  o_reason  := 'updated';
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_update_class_session(uuid, date, time, time, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_update_class_session(uuid, date, time, time, text, uuid) TO authenticated;

-- ---------------------------------------------------------------------
-- ASSERTIONS. Each FAILS THE MIGRATION.
-- ---------------------------------------------------------------------
DO $assert$
DECLARE
  v_n    integer;
  v_src  text;
  v_name text;
BEGIN
  -- U-1 -- the registry is EXACTLY 21, and the two new strings are present.
  IF pg_catalog.array_length(public.audit_action_registry(), 1) <> 21 THEN
    RAISE EXCEPTION 'P2-3 assertion U-1 failed: registry is %, expected exactly 21', pg_catalog.array_length(public.audit_action_registry(), 1);
  END IF;
  IF NOT ('admin.module_updated' = ANY (public.audit_action_registry()))
     OR NOT ('admin.session_updated' = ANY (public.audit_action_registry())) THEN
    RAISE EXCEPTION 'P2-3 assertion U-1 failed: a ratified new string is missing from the registry';
  END IF;

  -- U-2 -- ⛔ AND EXACTLY THE TWO AUTHORIZED STRINGS WERE ADDED. The three
  -- neighbouring actions the Operator did NOT authorize must be absent, or
  -- the extension quietly became an open budget.
  FOREACH v_name IN ARRAY ARRAY['admin.session_cancelled','admin.session_deleted',
                                'admin.trainer_unassigned','admin.module_deleted',
                                'admin.module_deactivated','admin.class_updated'] LOOP
    IF v_name = ANY (public.audit_action_registry()) THEN
      RAISE EXCEPTION 'P2-3 assertion U-2 failed: % was added and is NOT authorized -- the ruling approved TWO strings, not a class of them', v_name;
    END IF;
  END LOOP;

  -- U-3 -- ⛔ THE SINGLE-SOURCE REGISTRY IS STILL SINGLE-SOURCE.
  -- ⚠️ This is what the Operator's "extend BOTH declaration sites" was
  -- protecting. There is only ONE site (P1-2 consolidated them), so the
  -- protection is re-proved rather than re-performed: a one-sided extension
  -- would write events verification then rejects.
  FOREACH v_name IN ARRAY ARRAY['audit_append_event','audit_verify_chain'] LOOP
    SELECT p.prosrc INTO v_src
      FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public' AND p.proname = v_name;
    IF v_src LIKE '%''report.created''%' THEN
      RAISE EXCEPTION 'P2-3 assertion U-3 failed: % declares a registry literal -- the P1-2 consolidation was undone', v_name;
    END IF;
    IF v_src NOT LIKE '%audit_action_registry()%' THEN
      RAISE EXCEPTION 'P2-3 assertion U-3 failed: % does not read the single-source registry', v_name;
    END IF;
  END LOOP;

  -- U-4 -- exactly two new functions, both SECURITY DEFINER, VOLATILE, pinned,
  -- one `authenticated` EXECUTE each and nothing for anon or PUBLIC.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname IN ('admin_update_class_module','admin_update_class_session')
     AND p.prosecdef AND p.provolatile = 'v'
     AND pg_catalog.array_to_string(p.proconfig, ',') = 'search_path=""';
  IF v_n <> 2 THEN
    RAISE EXCEPTION 'P2-3 assertion U-4 failed: % of 2 update RPCs are SECURITY DEFINER/VOLATILE with search_path pinned', v_n;
  END IF;
  SELECT count(*) INTO v_n FROM information_schema.role_routine_grants
   WHERE routine_schema = 'public'
     AND routine_name IN ('admin_update_class_module','admin_update_class_session')
     AND grantee = 'authenticated' AND privilege_type = 'EXECUTE';
  IF v_n <> 2 THEN
    RAISE EXCEPTION 'P2-3 assertion U-4 failed: % authenticated EXECUTE grant(s)', v_n;
  END IF;
  SELECT count(*) INTO v_n FROM information_schema.role_routine_grants
   WHERE routine_schema = 'public'
     AND routine_name IN ('admin_update_class_module','admin_update_class_session')
     AND grantee IN ('anon','PUBLIC');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-3 assertion U-4 failed: % anon/PUBLIC grant(s) on an update RPC', v_n;
  END IF;

  -- U-5 -- ⛔ THE THREE REFUSALS, MADE STRUCTURAL. Neither RPC may DELETE a
  -- session or a module, and neither may reach trainer assignment.
  -- ▶ Recording a refusal only in prose is what lets a later phase build the
  -- control and quietly not wire it.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname IN ('admin_update_class_module','admin_update_class_session')
     AND (p.prosrc ILIKE '%delete%' OR p.prosrc LIKE '%class_session_assignments%'
       OR p.prosrc LIKE '%trainer_assigned%' OR p.prosrc LIKE '%is_active = false%');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-3 assertion U-5 failed: an update RPC deletes, deactivates or reaches trainer assignment -- all three are UNAUTHORIZED actions';
  END IF;

  -- U-6 -- ⛔ NEITHER RPC TOUCHES A REPORT, A RATING OR AN OBSERVATION.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname IN ('admin_update_class_module','admin_update_class_session')
     AND (p.prosrc LIKE '%report%' OR p.prosrc LIKE '%rating%' OR p.prosrc LIKE '%observation%');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-3 assertion U-6 failed: an update RPC reaches report/assessment data';
  END IF;

  -- U-7 -- no new table, enum or policy, and no write surface anywhere in the
  -- class family or on terms.
  SELECT count(*) INTO v_n FROM information_schema.tables
   WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  IF v_n <> 29 THEN
    RAISE EXCEPTION 'P2-3 assertion U-7 failed: % tables, expected 29', v_n;
  END IF;
  SELECT count(DISTINCT t.typname) INTO v_n
    FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN
    RAISE EXCEPTION 'P2-3 assertion U-7 failed: % enums, expected 12', v_n;
  END IF;
  SELECT count(*) INTO v_n FROM pg_policies WHERE schemaname = 'public';
  IF v_n <> 30 THEN
    RAISE EXCEPTION 'P2-3 assertion U-7 failed: % policies, expected 30', v_n;
  END IF;
  SELECT (SELECT count(*) FROM pg_policies
           WHERE schemaname='public'
             AND tablename IN ('terms','class_modules','class_sessions','class_session_assignments')
             AND cmd <> 'SELECT')
       + (SELECT count(*) FROM information_schema.role_table_grants
           WHERE table_schema='public'
             AND table_name IN ('terms','class_modules','class_sessions','class_session_assignments')
             AND grantee IN ('anon','authenticated','service_role')
             AND privilege_type <> 'SELECT')
    INTO v_n;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-3 assertion U-7 failed: a write path appeared in the class family (%)', v_n;
  END IF;

  RAISE NOTICE 'P2-3 assertions U-1..U-7 PASSED: registry 19 -> 21 with EXACTLY the two authorized strings, single-source intact, two update RPCs, no delete, no unassign, no assessment reach, no new table/enum/policy and no write surface';
END
$assert$;

COMMIT;
