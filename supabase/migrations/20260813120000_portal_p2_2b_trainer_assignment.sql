-- =====================================================================
-- PORTAL PHASE P2-2b -- the governed TRAINER ASSIGNMENT, completing
-- screen `26` Add Class.
-- =====================================================================
-- Authorized by the Operator on 2026-08-13, after they required the
-- registry be CHECKED rather than asked about:
--
--     "admin.trainer_assigned -- CHECK BEFORE ASKING... Verify against the
--      live registry. If it is there: trainer assignment is AUTHORIZED in
--      the phase that needs it, using that string, with the same pattern --
--      SECURITY DEFINER RPC, no write policy, no write grant."
--
-- ✅ **MEASURED AT HEAD BEFORE THIS FILE WAS WRITTEN:**
--    `array_length(public.audit_action_registry(), 1)` = **19**, and
--    `admin.trainer_assigned` is among them. **The registry is NOT
--    EXTENDED by this migration** -- the string was ratified at Step 7H and
--    has simply never had a writer, exactly like the two `P2-2` used.
--
-- ⚠️ THE PHASE THAT NEEDS IT IS `P2-2` ITSELF. Screen `26`'s frame draws an
-- `Assigned Trainer` section, and the plan's rule is **one screen per phase,
-- delivered complete before the next begins** -- so `26` is not finished
-- until this ships. `P2-3` is not reached by skipping it.
--
-- ---------------------------------------------------------------------
-- ⛔ WHAT THE SCHEMA ALREADY GUARANTEES, AND WHY THIS RPC IS SHAPED AROUND IT
-- ---------------------------------------------------------------------
-- Measured, not assumed, on `class_session_assignments`:
--
--   * `class_session_assignments_one_active_per_session_idx` -- a UNIQUE
--     index on `(class_session_id) WHERE is_active`. ▶ **EXACTLY ONE ACTIVE
--     ASSIGNMENT PER SESSION**, enforced by the database. So a reassignment
--     is **deactivate-then-insert IN ONE TRANSACTION**, never a second row,
--     and a bare INSERT would raise `23505` at the second attempt -- the
--     defect `P1-2b` already found once in the evidence path.
--
--   * `class_session_assignments_trainer_fk` -- a COMPOSITE foreign key on
--     `(trainer_membership_id, centre_id, trainer_role)` into
--     `centre_memberships(id, centre_id, role)`, with
--     `class_session_assignments_role_pinned_chk` fixing `trainer_role` at
--     `'trainer'`. ▶ **ASSIGNING A MANAGEMENT OR PARENT MEMBERSHIP, OR A
--     MEMBERSHIP FROM ANOTHER CENTRE, IS STRUCTURALLY UNREPRESENTABLE** --
--     `A-014`/`G-7`'s "no TA, no extended role" is held by the SCHEMA here,
--     not by this function's care.
--
--   * `class_session_assignments_active_timestamp_chk` -- `is_active` and
--     `unassigned_at` must agree, so a deactivation that forgets the
--     timestamp fails rather than leaving an ambiguous row.
--
-- ---------------------------------------------------------------------
-- ⛔ WHAT THIS FILE DOES NOT DO
-- ---------------------------------------------------------------------
-- **NO UNASSIGN, AND SCREEN `26` NEEDS NONE.** The frame's `-` control
-- removes the trainer from the FORM before it is saved -- client state, not
-- a governed act, because at creation time no assignment exists yet.
-- ⚠️ Leaving an already-assigned session with NO trainer is a different
-- action, it has **no ratified audit string**, and it is **not built here**.
-- If screen `27` offers it, that is stated and stopped there.
--
-- ⛔ NO WRITE POLICY, NO WRITE GRANT, NO NEW TABLE, COLUMN, ENUM OR POLICY,
--    AND NO REGISTRY EXTENSION.
-- =====================================================================

BEGIN;

CREATE FUNCTION public.admin_assign_session_trainer(
  p_class_session_id      uuid,
  p_trainer_membership_id uuid,
  OUT o_assignment_id     uuid,
  OUT o_reason            text
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
  v_current_id    uuid;
  v_current_who   uuid;
BEGIN
  o_assignment_id := NULL;
  o_reason        := 'not_permitted';

  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  SELECT (pg_catalog.array_agg(m.id))[1], (pg_catalog.array_agg(m.centre_id))[1]
    INTO v_membership_id, v_centre_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.role = 'management' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN RETURN; END IF;

  -- The session must be this centre's.
  IF NOT EXISTS (
    SELECT 1 FROM public.class_sessions s
     WHERE s.id = p_class_session_id AND s.centre_id = v_centre_id
  ) THEN RETURN; END IF;

  -- ⛔ AND SO MUST THE TRAINER -- an ACTIVE `trainer` membership of the same
  -- centre. The composite FK would refuse anything else anyway; checking it
  -- here is what turns a raised constraint violation into a governed answer.
  -- ⚠️ `status = 'active'` is checked HERE and by nothing else: the FK pins
  -- role and centre, not lifecycle, so a DEACTIVATED trainer would otherwise
  -- be assignable.
  IF NOT EXISTS (
    SELECT 1 FROM public.centre_memberships m
     WHERE m.id = p_trainer_membership_id AND m.centre_id = v_centre_id
       AND m.role = 'trainer' AND m.status = 'active'
  ) THEN RETURN; END IF;

  -- Authorization has succeeded. From here a reason is a diagnostic for
  -- someone the database already proved is active management of this centre.
  SELECT a.id, a.trainer_membership_id INTO v_current_id, v_current_who
    FROM public.class_session_assignments a
   WHERE a.class_session_id = p_class_session_id AND a.is_active;

  -- ⛔ A CONFIRMED NO-OP EMITS NOTHING. `A-029` binds one event per governed
  -- ACTION, and re-asserting a state that already holds is not one. The
  -- `FA-6` shape: an audit trail that records non-events stops being evidence
  -- that something happened.
  IF v_current_who = p_trainer_membership_id THEN
    o_assignment_id := v_current_id;
    o_reason        := 'already_assigned';
    RETURN;
  END IF;

  -- ⚠️ REASSIGNMENT IS DEACTIVATE-THEN-INSERT IN ONE TRANSACTION, because the
  -- partial unique index permits exactly one active row per session. The
  -- superseded row is RETAINED, never deleted -- assignment history is how
  -- "who was meant to teach this session" stays answerable after a change.
  IF v_current_id IS NOT NULL THEN
    UPDATE public.class_session_assignments
       SET is_active = false, unassigned_at = pg_catalog.now()
     WHERE id = v_current_id;
  END IF;

  INSERT INTO public.class_session_assignments
    (centre_id, class_session_id, trainer_membership_id)
  VALUES (v_centre_id, p_class_session_id, p_trainer_membership_id)
  RETURNING id INTO o_assignment_id;

  -- ⛔ THE AUDIT WRITE IS IN THE SAME TRANSACTION AS THE ASSIGNMENT (§4, §9
  -- rule 4). `admin.trainer_assigned` was ratified at Step 7H; the registry
  -- is NOT extended.
  --
  -- ⚠️ ONE EVENT COVERS A REASSIGNMENT, not two. The governed action is
  -- "this session is now taught by X"; the deactivation is that action's
  -- other half, not a separate act, and `A-029` counts ACTIONS.
  PERFORM public.audit_append_event(
    v_centre_id, v_account_id, v_membership_id, 'management',
    'admin.trainer_assigned', NULL, NULL, NULL,
    'class_session', p_class_session_id, 'Class Session',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'target_type', 'centre_membership', 'target_id', p_trainer_membership_id::text,
        'target_label', 'Trainer membership')
    ),
    -- ⚠️ DATA MINIMIZATION (A-029): the payload records THAT this replaced an
    -- earlier assignment, never WHO by name. The superseded membership is
    -- already recoverable from the retained row.
    pg_catalog.jsonb_build_object('replaced_existing', v_current_id IS NOT NULL)
  );

  o_reason := 'assigned';
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_assign_session_trainer(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_assign_session_trainer(uuid, uuid) TO authenticated;

-- ---------------------------------------------------------------------
-- ASSERTIONS. Each FAILS THE MIGRATION.
-- ---------------------------------------------------------------------
DO $assert$
DECLARE
  v_n integer;
BEGIN
  -- A-1 -- exactly one new function, SECURITY DEFINER, VOLATILE, pinned.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'admin_assign_session_trainer'
     AND p.prosecdef AND p.provolatile = 'v'
     AND pg_catalog.array_to_string(p.proconfig, ',') = 'search_path=""';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'P2-2b assertion A-1 failed: % assignment RPC(s) SECURITY DEFINER/VOLATILE with search_path pinned', v_n;
  END IF;

  -- A-2 -- one `authenticated` EXECUTE, nothing for anon or PUBLIC.
  SELECT count(*) INTO v_n FROM information_schema.role_routine_grants
   WHERE routine_schema = 'public' AND routine_name = 'admin_assign_session_trainer'
     AND grantee = 'authenticated' AND privilege_type = 'EXECUTE';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'P2-2b assertion A-2 failed: % authenticated EXECUTE grant(s)', v_n;
  END IF;
  SELECT count(*) INTO v_n FROM information_schema.role_routine_grants
   WHERE routine_schema = 'public' AND routine_name = 'admin_assign_session_trainer'
     AND grantee IN ('anon','PUBLIC');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-2b assertion A-2 failed: % anon/PUBLIC grant(s)', v_n;
  END IF;

  -- A-3 -- ⛔ THE REGISTRY IS NOT EXTENDED, AND THE STRING WAS ALREADY THERE.
  IF pg_catalog.array_length(public.audit_action_registry(), 1) <> 19
     OR NOT ('admin.trainer_assigned' = ANY (public.audit_action_registry()))
  THEN
    RAISE EXCEPTION 'P2-2b assertion A-3 failed: registry is % and/or admin.trainer_assigned is absent', pg_catalog.array_length(public.audit_action_registry(), 1);
  END IF;

  -- A-4 -- no new table, enum or policy.
  SELECT count(*) INTO v_n FROM information_schema.tables
   WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  IF v_n <> 29 THEN
    RAISE EXCEPTION 'P2-2b assertion A-4 failed: % tables, expected 29', v_n;
  END IF;
  SELECT count(DISTINCT t.typname) INTO v_n
    FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN
    RAISE EXCEPTION 'P2-2b assertion A-4 failed: % enums, expected 12', v_n;
  END IF;
  SELECT count(*) INTO v_n FROM pg_policies WHERE schemaname = 'public';
  IF v_n <> 30 THEN
    RAISE EXCEPTION 'P2-2b assertion A-4 failed: % policies, expected 30', v_n;
  END IF;

  -- A-5 -- ⛔ NO WRITE SURFACE ON `class_session_assignments`. The assignment
  -- goes through this RPC and nothing else, which is the whole reason
  -- "no write policy, no write grant" survives a phase that WRITES.
  SELECT (SELECT count(*) FROM pg_policies
           WHERE schemaname='public' AND tablename='class_session_assignments' AND cmd <> 'SELECT')
       + (SELECT count(*) FROM information_schema.role_table_grants
           WHERE table_schema='public' AND table_name='class_session_assignments'
             AND grantee IN ('anon','authenticated','service_role')
             AND privilege_type <> 'SELECT')
    INTO v_n;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-2b assertion A-5 failed: a write path appeared on class_session_assignments (%)', v_n;
  END IF;

  -- A-6 -- ⛔ THE TERMS WRITE GUARD STILL HOLDS, carried forward from P2-2.
  SELECT (SELECT count(*) FROM pg_policies
           WHERE schemaname='public' AND tablename='terms' AND cmd <> 'SELECT')
       + (SELECT count(*) FROM information_schema.role_table_grants
           WHERE table_schema='public' AND table_name='terms'
             AND grantee IN ('anon','authenticated','service_role')
             AND privilege_type <> 'SELECT')
    INTO v_n;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-2b assertion A-6 failed: a write path appeared on terms';
  END IF;

  -- A-7 -- ⛔ EXACTLY ONE AUDIT STRING IS NAMED, AND IT IS THE RATIFIED ONE.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'admin_assign_session_trainer'
     AND p.prosrc LIKE '%admin.trainer_assigned%';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'P2-2b assertion A-7 failed: the RPC does not emit admin.trainer_assigned';
  END IF;

  -- A-8 -- ⛔ IT TOUCHES NO REPORT, RATING OR OBSERVATION.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'admin_assign_session_trainer'
     AND (p.prosrc LIKE '%report%' OR p.prosrc LIKE '%rating%' OR p.prosrc LIKE '%observation%');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-2b assertion A-8 failed: the assignment RPC reaches report/assessment data';
  END IF;

  RAISE NOTICE 'P2-2b assertions A-1..A-8 PASSED: one assignment RPC, the ALREADY-RATIFIED admin.trainer_assigned, registry still 19, no table/enum/policy, and no write surface on class_session_assignments or terms';
END
$assert$;

COMMIT;
