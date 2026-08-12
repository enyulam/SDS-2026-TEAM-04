-- =====================================================================
-- PORTAL PHASE P2-2 -- screen `26`: the GOVERNED CLASS-CREATION path.
-- =====================================================================
-- ⛔ THE MIGRATION'S OWN ASSERTIONS `C-1`..`C-9` ARE STRUCTURAL, AND
--    STRUCTURE CANNOT PROVE A FUNCTION RUNS. This session's first draft of
--    the migration applied CLEANLY WITH ALL NINE GREEN while both RPCs
--    raised at their first statement -- PL/pgSQL resolves identifiers at
--    CALL time, not at `CREATE FUNCTION`. ▶ So every leg below CALLS the
--    RPC. A catalogue read is not an execution.
--
-- ---------------------------------------------------------------------
-- ⚠️ WHO EACH STATEMENT RUNS AS, AND WHY THE FILE IS SHAPED THIS WAY
-- ---------------------------------------------------------------------
-- The RPC calls run under `SET LOCAL ROLE authenticated`, never as owner --
-- otherwise they prove nothing about what a real caller can do.
--
-- ⛔ BUT EVERY MEASUREMENT RUNS AS OWNER, and that is not a convenience.
--    A row count taken under the caller's own role measures RLS
--    VISIBILITY, not EXISTENCE. The first version of this suite counted
--    `class_modules` while still `authenticated` with no identity, read 0
--    against a baseline of 2, and reported FAIL on a leg whose reason codes
--    were entirely correct. ▶ A refusal leg that "passes" because the
--    prober cannot see the table it is guarding would be worse: it would
--    pass for the wrong reason and keep passing after the guard broke.
--
-- Proves, in order:
--   P23-1  NON-VACUITY FIRST. Both RPCs exist, both are `authenticated`-
--          executable, and the fixture rows every leg depends on are
--          present. ⛔ Every refusal below is trivially true of a function
--          that cannot be called at all.
--   P23-2  ⛔ A TRAINER IS REFUSED on both RPCs, and writes NOTHING.
--   P23-3  ⛔ AN UNIDENTIFIED CALLER IS REFUSED on both, and writes NOTHING.
--   P23-4  ⛔ NON-DISCLOSURE. An authorized management caller aiming at a
--          grade outside their centre receives the EXACT SAME string the
--          trainer did. ▶ A reason code that told a refused caller WHICH
--          gate stopped them would be a probe.
--   P23-5  ⚠️ THE PERMIT CONTROL, deliberately AFTER the denials: the same
--          call by MANAGEMENT succeeds, creates exactly one module and
--          exactly one `admin.module_created`, attributed to the management
--          membership with the grade as a related target.
--   P23-6  The session leg: exactly one session, exactly one
--          `admin.session_created`, the `D-3` term ATTACHED, room TRIMMED.
--   P23-7  ⚠️ `NULL` MEANS NOT RECORDED. A blank room is stored NULL, never
--          the empty string (hero 0B).
--   P23-8  Diagnostics AFTER authorization DISCRIMINATE -- which is what
--          makes P23-4's single `not_permitted` a deliberate COLLAPSE
--          rather than the only string the function knows.
--   P23-9  ⛔ THE STOP, MEASURED AT RUNTIME. After a module and three
--          sessions were really created, `class_session_assignments` is
--          UNMOVED and ZERO `admin.trainer_assigned` events exist.
--  P23-10  ⛔ EXACTLY TWO ACTION STRINGS were emitted by this whole suite,
--          and the registry is still 19 (`A-029`).
--  P23-11  ⛔ THE TERMS WRITE SURFACE IS STILL ZERO at this boundary.
--
-- ⚠️ TRANSACTION-SCOPED, ending in ROLLBACK. Nothing created here survives,
--    and the runner re-measures the row counts on both sides to prove it.
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
  v_grade_id   uuid;
  v_term_id    uuid;
  v_module_id  uuid;
  v_session_id uuid;
  v_reason     text;
  v_reason2    text;
  v_n          integer;
  v_modules0   integer;
  v_sessions0  integer;
  v_assign0    integer;
  v_seq0       bigint;
BEGIN
  -- ---- baselines, as OWNER ------------------------------------------
  SELECT count(*) INTO v_modules0  FROM public.class_modules;
  SELECT count(*) INTO v_sessions0 FROM public.class_sessions;
  SELECT count(*) INTO v_assign0   FROM public.class_session_assignments;
  -- ⚠️ `coalesce` is grammar, not a schema member -- it cannot be qualified.
  SELECT coalesce(max(seq_no), 0) INTO v_seq0 FROM public.audit_events;
  SELECT id INTO v_grade_id FROM public.class_grades WHERE code = 'intermediate';
  SELECT id INTO v_term_id  FROM public.terms ORDER BY starts_on LIMIT 1;

  -- P23-1 -- NON-VACUITY.
  SELECT count(*) INTO v_n
    FROM information_schema.role_routine_grants
   WHERE routine_schema = 'public'
     AND routine_name IN ('admin_create_class_module','admin_create_class_session')
     AND grantee = 'authenticated' AND privilege_type = 'EXECUTE';
  IF v_n = 2 AND v_grade_id IS NOT NULL AND v_term_id IS NOT NULL
     AND EXISTS (SELECT 1 FROM public.centre_memberships m
                  JOIN public.accounts a ON a.id = m.account_id
                 WHERE a.auth_user_id = 'd0000000-0000-4000-8000-000000000001'
                   AND m.role = 'management' AND m.status = 'active')
  THEN
    RAISE NOTICE 'PASS P23-1  NON-VACUITY: both create RPCs are authenticated-executable, and the grade, term and ACTIVE management membership every leg depends on all exist';
  ELSE
    RAISE NOTICE 'FAIL P23-1  % of 2 EXECUTE grants; grade=%, term=%', v_n, v_grade_id IS NOT NULL, v_term_id IS NOT NULL;
  END IF;

  -- P23-2 -- ⛔ A TRAINER IS REFUSED, and writes nothing.
  SET LOCAL ROLE authenticated;
  PERFORM pg_temp.as_trainer();
  SELECT o_reason INTO v_reason  FROM public.admin_create_class_module(v_grade_id, 'Trainer Attempt');
  SELECT o_reason INTO v_reason2 FROM public.admin_create_class_session(
    (SELECT id FROM public.class_sessions ORDER BY session_date LIMIT 1), -- any module the trainer can see
    '2026-04-01'::date, NULL, NULL, NULL, NULL);
  RESET ROLE;
  IF v_reason = 'not_permitted' AND v_reason2 = 'not_permitted'
     AND (SELECT count(*) FROM public.class_modules)  = v_modules0
     AND (SELECT count(*) FROM public.class_sessions) = v_sessions0
  THEN
    RAISE NOTICE 'PASS P23-2  a TRAINER is refused on BOTH create RPCs (%, %) and NOTHING was written -- an ACTIVE membership is not a MANAGEMENT membership', v_reason, v_reason2;
  ELSE
    RAISE NOTICE 'FAIL P23-2  trainer got %, %; modules %/%; sessions %/%',
      v_reason, v_reason2, (SELECT count(*) FROM public.class_modules), v_modules0,
      (SELECT count(*) FROM public.class_sessions), v_sessions0;
  END IF;

  -- P23-3 -- ⛔ AN UNIDENTIFIED CALLER IS REFUSED.
  SET LOCAL ROLE authenticated;
  PERFORM pg_temp.as_nobody();
  SELECT o_reason INTO v_reason  FROM public.admin_create_class_module(v_grade_id, 'Anon Attempt');
  SELECT o_reason INTO v_reason2 FROM public.admin_create_class_session(
    v_grade_id, '2026-04-01'::date, NULL, NULL, NULL, NULL);
  RESET ROLE;
  IF v_reason = 'not_permitted' AND v_reason2 = 'not_permitted'
     AND (SELECT count(*) FROM public.class_modules)  = v_modules0
     AND (SELECT count(*) FROM public.class_sessions) = v_sessions0
  THEN
    RAISE NOTICE 'PASS P23-3  an UNIDENTIFIED caller is refused on both and writes nothing -- app_current_account_id() resolves to NULL and the function returns before any gate can leak';
  ELSE
    RAISE NOTICE 'FAIL P23-3  unidentified caller got %, %', v_reason, v_reason2;
  END IF;

  -- P23-4 -- ⛔ NON-DISCLOSURE.
  SET LOCAL ROLE authenticated;
  PERFORM pg_temp.as_management();
  SELECT o_reason INTO v_reason
    FROM public.admin_create_class_module('00000000-0000-4000-8000-000000000000'::uuid, 'Foreign Grade');
  RESET ROLE;
  IF v_reason = 'not_permitted' THEN
    RAISE NOTICE 'PASS P23-4  NON-DISCLOSURE: an AUTHORIZED management caller aiming at a grade outside their centre receives the SAME "%" the trainer did -- the reason code never tells a refused caller WHICH gate stopped them', v_reason;
  ELSE
    RAISE NOTICE 'FAIL P23-4  the out-of-centre grade disclosed a distinct reason: %', v_reason;
  END IF;

  -- P23-5 -- ⚠️ THE PERMIT CONTROL, after the denials.
  SET LOCAL ROLE authenticated;
  SELECT o_module_id, o_reason INTO v_module_id, v_reason
    FROM public.admin_create_class_module(v_grade_id, '  Public Speaking Studio  ');
  RESET ROLE;
  SELECT count(*) INTO v_n FROM public.audit_events
   WHERE action = 'admin.module_created' AND target_id = v_module_id;
  IF v_reason = 'created' AND v_module_id IS NOT NULL
     AND (SELECT count(*) FROM public.class_modules) = v_modules0 + 1
     AND v_n = 1
     AND (SELECT title FROM public.class_modules WHERE id = v_module_id) = 'Public Speaking Studio'
     AND EXISTS (SELECT 1 FROM public.audit_events e
                  WHERE e.target_id = v_module_id AND e.actor_role = 'management'
                    AND e.actor_membership_id IS NOT NULL
                    AND e.payload -> 'related_targets' @> pg_catalog.jsonb_build_array(
                          pg_catalog.jsonb_build_object('target_type','class_grade',
                            'target_id', v_grade_id::text, 'target_label','Class Grade')))
  THEN
    RAISE NOTICE 'PASS P23-5  CONTROL: MANAGEMENT creates exactly ONE module through the SAME harness, the title is TRIMMED, and exactly ONE admin.module_created is attributed to the management membership with the grade as a related target -- the refusals above are DISCRIMINATION, not a broken function';
  ELSE
    RAISE NOTICE 'FAIL P23-5  reason=%, module=%, events=%', v_reason, v_module_id, v_n;
  END IF;

  -- P23-6 -- the session leg.
  SET LOCAL ROLE authenticated;
  SELECT o_session_id, o_reason INTO v_session_id, v_reason
    FROM public.admin_create_class_session(v_module_id, '2026-03-03'::date,
         '15:00'::time, '16:00'::time, '  Studio 2  ', v_term_id);
  RESET ROLE;
  SELECT count(*) INTO v_n FROM public.audit_events
   WHERE action = 'admin.session_created' AND target_id = v_session_id;
  IF v_reason = 'created'
     AND (SELECT count(*) FROM public.class_sessions) = v_sessions0 + 1
     AND v_n = 1
     AND (SELECT term_id FROM public.class_sessions WHERE id = v_session_id) = v_term_id
     AND (SELECT room    FROM public.class_sessions WHERE id = v_session_id) = 'Studio 2'
  THEN
    RAISE NOTICE 'PASS P23-6  exactly ONE dated session, exactly ONE admin.session_created, the D-3 term ATTACHED and the room TRIMMED -- one call creates one session, so the day selectors are a GENERATOR, never a stored recurrence rule (C-14)';
  ELSE
    RAISE NOTICE 'FAIL P23-6  reason=%, events=%', v_reason, v_n;
  END IF;

  -- P23-7 -- ⚠️ NULL MEANS NOT RECORDED.
  SET LOCAL ROLE authenticated;
  SELECT o_session_id INTO v_session_id
    FROM public.admin_create_class_session(v_module_id, '2026-03-10'::date, NULL, NULL, '   ', NULL);
  RESET ROLE;
  IF (SELECT room FROM public.class_sessions WHERE id = v_session_id) IS NULL
     AND (SELECT term_id FROM public.class_sessions WHERE id = v_session_id) IS NULL
  THEN
    RAISE NOTICE 'PASS P23-7  a BLANK room is stored NULL, never the empty string -- NULL means NOT RECORDED and the surface OMITS the element (hero 0B); an empty string would render as a recorded blank';
  ELSE
    RAISE NOTICE 'FAIL P23-7  a blank room was persisted as [%]', (SELECT room FROM public.class_sessions WHERE id = v_session_id);
  END IF;

  -- P23-8 -- diagnostics AFTER authorization discriminate.
  SET LOCAL ROLE authenticated;
  SELECT o_reason INTO v_reason FROM public.admin_create_class_module(v_grade_id, 'public speaking studio');
  IF v_reason = 'already_exists'
     AND (SELECT o_reason FROM public.admin_create_class_module(v_grade_id, '   ')) = 'invalid_title'
     AND (SELECT o_reason FROM public.admin_create_class_session(v_module_id, '2026-03-17'::date,
            '16:00'::time, '15:00'::time, NULL, NULL)) = 'invalid_times'
     AND (SELECT o_reason FROM public.admin_create_class_session(v_module_id, NULL,
            NULL, NULL, NULL, NULL)) = 'invalid_date'
  THEN
    RESET ROLE;
    RAISE NOTICE 'PASS P23-8  after authorization SUCCEEDS the reasons DISCRIMINATE (already_exists / invalid_title / invalid_times / invalid_date) -- which is what makes P23-4 a deliberate COLLAPSE rather than the only string the function knows. The duplicate check is CASE-INSENSITIVE and TRIMMED';
  ELSE
    RESET ROLE;
    RAISE NOTICE 'FAIL P23-8  duplicate title reported %', v_reason;
  END IF;

  -- P23-9 -- ⛔ THE STOP, MEASURED AT RUNTIME.
  SELECT count(*) INTO v_n FROM public.audit_events WHERE action = 'admin.trainer_assigned';
  IF (SELECT count(*) FROM public.class_session_assignments) = v_assign0 AND v_n = 0 THEN
    RAISE NOTICE 'PASS P23-9  ⛔ THE STOP HELD: a module and two sessions were really created, class_session_assignments is UNMOVED at % and ZERO admin.trainer_assigned events exist -- assignment needs a THIRD string the Operator did not name, so it is STOPPED, not half-built. A session with no assignment is a REAL governed state', v_assign0;
  ELSE
    RAISE NOTICE 'FAIL P23-9  assignments moved, or % trainer_assigned event(s) fired', v_n;
  END IF;

  -- P23-10 -- ⛔ EXACTLY TWO ACTION STRINGS.
  SELECT count(DISTINCT action) INTO v_n FROM public.audit_events WHERE seq_no > v_seq0;
  /*
   * ⚠️ THE REGISTRY TOTAL WAS PINNED AT 19 HERE AND IS NOT ANY MORE. REWRITTEN,
   * NOT DELETED. `P2-3` was authorized to add `admin.module_updated` and
   * `admin.session_updated`, moving the registry 19 → 21 — and this leg fired,
   * because a `P2-2` suite was asserting a GLOBAL total that measures every
   * OTHER phase's behaviour rather than its own.
   *
   * ▶ THE RULE, THE SAME ONE `P24a-0` ALREADY CARRIES: a phase-scoped claim
   * must not be written as a global absolute. What `P2-2` actually claims is
   * that IT added no string — proved by the two it names being present and by
   * `P23a-0` asserting its migration declares no registry at all. The total is
   * REPORTED so a reader still sees it move.
   */
  IF v_n = 2
     AND 'admin.module_created' = ANY (public.audit_action_registry())
     AND 'admin.session_created' = ANY (public.audit_action_registry())
     AND NOT EXISTS (SELECT 1 FROM public.audit_events
                      WHERE seq_no > v_seq0
                        AND action NOT IN ('admin.module_created','admin.session_created'))
  THEN
    RAISE NOTICE 'PASS P23-10  this entire suite emitted EXACTLY the two strings the Operator named, both are still in the registry (now % strings, reported not pinned), and no action produced a second event (A-029)', pg_catalog.array_length(public.audit_action_registry(), 1);
  ELSE
    RAISE NOTICE 'FAIL P23-10  % distinct action(s) emitted; one of the two P2-2 strings is missing from the % -string registry', v_n, pg_catalog.array_length(public.audit_action_registry(), 1);
  END IF;

  -- P23-11 -- ⛔ THE TERMS WRITE SURFACE IS STILL ZERO.
  SELECT (SELECT count(*) FROM pg_policies
           WHERE schemaname='public' AND tablename='terms' AND cmd <> 'SELECT')
       + (SELECT count(*) FROM information_schema.role_table_grants
           WHERE table_schema='public' AND table_name='terms'
             AND grantee IN ('anon','authenticated','service_role')
             AND privilege_type <> 'SELECT')
    INTO v_n;
  IF v_n = 0 THEN
    RAISE NOTICE 'PASS P23-11  the terms write surface is STILL ZERO in the very phase that introduced the first administrative write path -- the create path went through SECURITY DEFINER RPCs, which is exactly why "NO WRITE PATH ANYWHERE" survived it intact';
  ELSE
    RAISE NOTICE 'FAIL P23-11  a write path appeared on terms: %', v_n;
  END IF;
END
$suite$;

ROLLBACK;
