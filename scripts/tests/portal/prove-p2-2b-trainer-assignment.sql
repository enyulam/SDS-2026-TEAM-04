-- =====================================================================
-- PORTAL PHASE P2-2b -- the governed TRAINER ASSIGNMENT.
-- =====================================================================
-- ⛔ EVERY LEG CALLS THE RPC. Operator ruling, 2026-08-13, on this phase's
--    most important defect:
--
--        "A STRUCTURAL ASSERTION CANNOT PROVE A FUNCTION RUNS. Every RPC
--         migration from here carries a leg that CALLS the function, not
--         one that inspects it."
--
-- ⚠️ AND EVERY MEASUREMENT RUNS AS OWNER. The companion ruling: a refusal
--    leg that counts rows under the caller's own role measures RLS
--    VISIBILITY, not EXISTENCE -- and on a zero baseline it PASSES because
--    the prober cannot see what it guards.
--
-- Proves, in order:
--   P24-1  NON-VACUITY FIRST. The RPC exists and is callable, the fixture
--          session and an ACTIVE trainer membership exist, an assignment is
--          already in place, and `admin.trainer_assigned` is in a registry
--          of 19. ⛔ Every claim below is trivially true of nothing.
--   P24-2  ⛔ A TRAINER IS REFUSED and writes nothing.
--   P24-3  ⛔ AN UNIDENTIFIED CALLER IS REFUSED and writes nothing.
--   P24-4  ⛔ NON-DISCLOSURE. An AUTHORIZED management caller aiming at a
--          MANAGEMENT membership, at a DEACTIVATED trainer, and at a
--          NON-EXISTENT session receives the SAME string in all three cases
--          -- and the same one the trainer got.
--   P24-5  ⚠️ A CONFIRMED NO-OP EMITS NOTHING. Re-asserting the assignment
--          that already holds returns `already_assigned`, creates no row and
--          appends no audit event (`A-029` counts ACTIONS; the `FA-6` shape).
--   P24-6  ⚠️ THE PERMIT CONTROL AND THE REASSIGNMENT, in one leg: a SECOND
--          active trainer is planted, the RPC is called, and it returns
--          `assigned` with EXACTLY ONE `admin.trainer_assigned` event
--          carrying `replaced_existing: true`.
--   P24-7  ⛔ THE INVARIANT HELD ACROSS THE REASSIGNMENT: exactly ONE active
--          row for that session, and the superseded row is RETAINED,
--          deactivated and timestamped -- never deleted.
--   P24-8  ⛔ THE WHOLE SUITE EMITTED EXACTLY ONE ACTION STRING, and the
--          registry is STILL 19. ▶ This phase extends nothing: the string
--          was ratified at Step 7H and had never had a writer.
--   P24-9  ⛔ ZERO write policies and ZERO non-SELECT client grants on
--          `class_session_assignments` AND on `terms` -- the write went
--          through a SECURITY DEFINER RPC, which is why "no write policy,
--          no write grant" survives a phase that WRITES.
--
-- ⚠️ TRANSACTION-SCOPED, ending in ROLLBACK. The planted trainer membership
--    and every assignment made here are undone; the runner re-measures the
--    row counts on both sides to prove it.
-- =====================================================================

BEGIN;

CREATE FUNCTION pg_temp.as_management() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims',
  '{"sub":"d0000000-0000-4000-8000-000000000001","role":"authenticated"}', true); END $$;

CREATE FUNCTION pg_temp.as_trainer() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims',
  '{"sub":"d0000000-0000-4000-8000-000000000002","role":"authenticated"}', true); END $$;

CREATE FUNCTION pg_temp.as_nobody() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims', '', true); END $$;

DO $suite$
DECLARE
  v_centre     uuid;
  v_session    uuid;
  v_trainer1   uuid;
  v_trainer2   uuid;
  v_dead       uuid;
  v_account    uuid;
  v_assign_id  uuid;
  v_reason     text;
  v_n          integer;
  v_assign0    integer;
  v_seq0       bigint;
BEGIN
  -- ---- baselines and fixtures, as OWNER -----------------------------
  SELECT count(*) INTO v_assign0 FROM public.class_session_assignments;
  SELECT coalesce(max(seq_no), 0) INTO v_seq0 FROM public.audit_events;
  SELECT id INTO v_centre FROM public.centres WHERE code = 'ispeak';
  SELECT id INTO v_session FROM public.class_sessions ORDER BY session_date LIMIT 1;
  SELECT m.id INTO v_trainer1 FROM public.centre_memberships m
   WHERE m.role = 'trainer' AND m.status = 'active' AND m.centre_id = v_centre LIMIT 1;

  -- P24-1 -- NON-VACUITY.
  SELECT count(*) INTO v_n FROM information_schema.role_routine_grants
   WHERE routine_schema = 'public' AND routine_name = 'admin_assign_session_trainer'
     AND grantee = 'authenticated' AND privilege_type = 'EXECUTE';
  IF v_n = 1 AND v_session IS NOT NULL AND v_trainer1 IS NOT NULL
     AND EXISTS (SELECT 1 FROM public.class_session_assignments a
                  WHERE a.class_session_id = v_session AND a.is_active)
     AND pg_catalog.array_length(public.audit_action_registry(), 1) = 19
     AND 'admin.trainer_assigned' = ANY (public.audit_action_registry())
  THEN
    RAISE NOTICE 'PASS P24-1  NON-VACUITY: the RPC is authenticated-executable, the session and an ACTIVE trainer exist, an assignment is already in place, and admin.trainer_assigned is in a registry of 19 -- ALREADY RATIFIED at Step 7H, never extended here';
  ELSE
    RAISE NOTICE 'FAIL P24-1  grants=%, session=%, trainer=%', v_n, v_session IS NOT NULL, v_trainer1 IS NOT NULL;
  END IF;

  -- P24-2 -- ⛔ A TRAINER IS REFUSED.
  SET LOCAL ROLE authenticated;
  PERFORM pg_temp.as_trainer();
  SELECT o_reason INTO v_reason FROM public.admin_assign_session_trainer(v_session, v_trainer1);
  RESET ROLE;
  IF v_reason = 'not_permitted'
     AND (SELECT count(*) FROM public.class_session_assignments) = v_assign0
  THEN
    RAISE NOTICE 'PASS P24-2  a TRAINER is refused (%) and nothing was written -- a trainer cannot assign themselves, or anyone else', v_reason;
  ELSE
    RAISE NOTICE 'FAIL P24-2  trainer got %; assignments %/%', v_reason,
      (SELECT count(*) FROM public.class_session_assignments), v_assign0;
  END IF;

  -- P24-3 -- ⛔ AN UNIDENTIFIED CALLER IS REFUSED.
  SET LOCAL ROLE authenticated;
  PERFORM pg_temp.as_nobody();
  SELECT o_reason INTO v_reason FROM public.admin_assign_session_trainer(v_session, v_trainer1);
  RESET ROLE;
  IF v_reason = 'not_permitted'
     AND (SELECT count(*) FROM public.class_session_assignments) = v_assign0
  THEN
    RAISE NOTICE 'PASS P24-3  an UNIDENTIFIED caller is refused and writes nothing';
  ELSE
    RAISE NOTICE 'FAIL P24-3  unidentified caller got %', v_reason;
  END IF;

  -- P24-4 -- ⛔ NON-DISCLOSURE, three different wrong targets, one string.
  -- A DEACTIVATED trainer, planted as owner: the composite FK pins ROLE and
  -- CENTRE but NOT LIFECYCLE, so this is the one gate only the RPC can make.
  SELECT account_id INTO v_account FROM public.centre_memberships WHERE id = v_trainer1;
  INSERT INTO public.centre_memberships (account_id, centre_id, role, status, activated_at, deactivated_at)
  VALUES (v_account, v_centre, 'trainer', 'deactivated', pg_catalog.now(), pg_catalog.now())
  RETURNING id INTO v_dead;

  SET LOCAL ROLE authenticated;
  PERFORM pg_temp.as_management();
  SELECT o_reason INTO v_reason FROM public.admin_assign_session_trainer(
    v_session, (SELECT m.id FROM public.centre_memberships m WHERE m.role = 'management' LIMIT 1));
  IF v_reason = 'not_permitted'
     AND (SELECT o_reason FROM public.admin_assign_session_trainer(v_session, v_dead)) = 'not_permitted'
     AND (SELECT o_reason FROM public.admin_assign_session_trainer(
            '00000000-0000-4000-8000-000000000000'::uuid, v_trainer1)) = 'not_permitted'
  THEN
    RESET ROLE;
    RAISE NOTICE 'PASS P24-4  NON-DISCLOSURE: an AUTHORIZED management caller gets the SAME "%" for a MANAGEMENT membership, a DEACTIVATED trainer and a NON-EXISTENT session -- and it is the same string the trainer got. ⚠️ The deactivated case is the gate only the RPC can make: the composite FK pins ROLE and CENTRE, never LIFECYCLE', v_reason;
  ELSE
    RESET ROLE;
    RAISE NOTICE 'FAIL P24-4  the wrong-target cases disclosed distinct reasons (first: %)', v_reason;
  END IF;

  -- P24-5 -- ⚠️ A CONFIRMED NO-OP EMITS NOTHING.
  SELECT count(*) INTO v_n FROM public.audit_events WHERE seq_no > v_seq0;
  SET LOCAL ROLE authenticated;
  SELECT o_reason INTO v_reason FROM public.admin_assign_session_trainer(v_session, v_trainer1);
  RESET ROLE;
  IF v_reason = 'already_assigned'
     AND (SELECT count(*) FROM public.class_session_assignments) = v_assign0
     AND (SELECT count(*) FROM public.audit_events WHERE seq_no > v_seq0) = v_n
  THEN
    RAISE NOTICE 'PASS P24-5  re-asserting the assignment that ALREADY HOLDS returns "%", writes no row and appends NO audit event -- A-029 counts governed ACTIONS, and an audit trail that records non-events stops being evidence that something happened', v_reason;
  ELSE
    RAISE NOTICE 'FAIL P24-5  the no-op returned % and moved something', v_reason;
  END IF;

  -- P24-6 -- ⚠️ THE PERMIT CONTROL AND THE REASSIGNMENT.
  -- ⛔ A SECOND TRAINER IS PLANTED because the fixture holds ONE, so the
  -- reassignment path is otherwise UNREACHABLE. A leg that cannot run is
  -- NOT-RUN, never PASS -- planting the precondition is what makes it a
  -- measurement.
  -- ⚠️ SYNTHETIC ONLY (ADR-6), and rolled back with everything else. The
  -- address is a reserved example domain so it can never resolve anywhere.
  INSERT INTO public.accounts (display_name, normalized_email)
  VALUES ('Probe Trainer Two', 'probe.trainer.two@example.invalid')
  RETURNING id INTO v_account;
  INSERT INTO public.centre_memberships (account_id, centre_id, role, status, activated_at)
  VALUES (v_account, v_centre, 'trainer', 'active', pg_catalog.now())
  RETURNING id INTO v_trainer2;

  SET LOCAL ROLE authenticated;
  SELECT o_assignment_id, o_reason INTO v_assign_id, v_reason
    FROM public.admin_assign_session_trainer(v_session, v_trainer2);
  RESET ROLE;
  SELECT count(*) INTO v_n FROM public.audit_events
   WHERE seq_no > v_seq0 AND action = 'admin.trainer_assigned' AND target_id = v_session;
  IF v_reason = 'assigned' AND v_assign_id IS NOT NULL AND v_n = 1
     AND EXISTS (SELECT 1 FROM public.audit_events e
                  WHERE e.target_id = v_session AND e.action = 'admin.trainer_assigned'
                    AND e.actor_role = 'management'
                    AND e.payload ->> 'replaced_existing' = 'true'
                    AND e.payload -> 'related_targets' @> pg_catalog.jsonb_build_array(
                          pg_catalog.jsonb_build_object('target_type','centre_membership',
                            'target_id', v_trainer2::text, 'target_label','Trainer membership')))
  THEN
    RAISE NOTICE 'PASS P24-6  CONTROL: MANAGEMENT reassigns through the SAME harness -- "%", with EXACTLY ONE admin.trainer_assigned carrying replaced_existing=true and the new membership as a related target. ▶ ONE event covers a reassignment, not two: the governed action is "this session is now taught by X", and the deactivation is that action''s other half', v_reason;
  ELSE
    RAISE NOTICE 'FAIL P24-6  reason=%, assignment=%, events=%', v_reason, v_assign_id, v_n;
  END IF;

  -- P24-7 -- ⛔ THE INVARIANT, AND THE RETAINED HISTORY.
  SELECT count(*) INTO v_n FROM public.class_session_assignments
   WHERE class_session_id = v_session AND is_active;
  IF v_n = 1
     AND (SELECT trainer_membership_id FROM public.class_session_assignments
           WHERE class_session_id = v_session AND is_active) = v_trainer2
     AND EXISTS (SELECT 1 FROM public.class_session_assignments a
                  WHERE a.class_session_id = v_session AND a.trainer_membership_id = v_trainer1
                    AND NOT a.is_active AND a.unassigned_at IS NOT NULL)
  THEN
    RAISE NOTICE 'PASS P24-7  EXACTLY ONE active assignment survives the reassignment, it names the NEW trainer, and the superseded row is RETAINED, deactivated and timestamped -- never deleted. ▶ Assignment history is how "who was meant to teach this session" stays answerable after a change';
  ELSE
    RAISE NOTICE 'FAIL P24-7  % active row(s) for the session after reassignment', v_n;
  END IF;

  -- P24-8 -- ⛔ EXACTLY ONE ACTION STRING, AND NO REGISTRY EXTENSION.
  SELECT count(DISTINCT action) INTO v_n FROM public.audit_events WHERE seq_no > v_seq0;
  IF v_n = 1
     AND NOT EXISTS (SELECT 1 FROM public.audit_events
                      WHERE seq_no > v_seq0 AND action <> 'admin.trainer_assigned')
     AND pg_catalog.array_length(public.audit_action_registry(), 1) = 19
  THEN
    RAISE NOTICE 'PASS P24-8  this entire suite emitted EXACTLY ONE action string and the registry is STILL 19 -- this phase extends nothing, because admin.trainer_assigned was ratified at Step 7H and had simply never had a writer';
  ELSE
    RAISE NOTICE 'FAIL P24-8  % distinct action(s); registry %', v_n, pg_catalog.array_length(public.audit_action_registry(), 1);
  END IF;

  -- P24-9 -- ⛔ ZERO WRITE SURFACE, BOTH TABLES.
  SELECT (SELECT count(*) FROM pg_policies
           WHERE schemaname='public' AND tablename IN ('class_session_assignments','terms') AND cmd <> 'SELECT')
       + (SELECT count(*) FROM information_schema.role_table_grants
           WHERE table_schema='public' AND table_name IN ('class_session_assignments','terms')
             AND grantee IN ('anon','authenticated','service_role')
             AND privilege_type <> 'SELECT')
    INTO v_n;
  IF v_n = 0 THEN
    RAISE NOTICE 'PASS P24-9  ZERO write policies and ZERO non-SELECT client grants on class_session_assignments AND terms, in the phase that WROTE an assignment -- the write went through a SECURITY DEFINER RPC, which is exactly why "no write policy, no write grant" survives it';
  ELSE
    RAISE NOTICE 'FAIL P24-9  a write path appeared: %', v_n;
  END IF;
END
$suite$;

ROLLBACK;
