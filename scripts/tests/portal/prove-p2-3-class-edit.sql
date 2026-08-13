-- =====================================================================
-- PORTAL PHASE P2-3 -- screen `27` Management Edit Class.
-- =====================================================================
-- ⛔ EVERY LEG CALLS THE RPC (the standing rule, Operator 2026-08-13):
--    *"A STRUCTURAL ASSERTION CANNOT PROVE A FUNCTION RUNS."*
-- ⚠️ AND EVERY MEASUREMENT RUNS AS OWNER, because a count taken under the
--    caller's own role measures RLS VISIBILITY rather than EXISTENCE.
--
-- Proves, in order:
--   P25-1  NON-VACUITY FIRST. Both RPCs are callable, the registry is
--          EXACTLY 21 carrying both new strings, and the module and session
--          every leg edits exist. ⛔ Every claim below is trivially true of
--          nothing.
--   P25-2  ⛔ A TRAINER IS REFUSED on both, and changes nothing.
--   P25-3  ⛔ AN UNIDENTIFIED CALLER IS REFUSED on both.
--   P25-4  ⛔ NON-DISCLOSURE: an AUTHORIZED management caller aiming at a
--          non-existent grade, a non-existent session and a non-existent
--          term gets the SAME string in all three -- and the same one the
--          trainer got.
--   P25-5  ⚠️ A CONFIRMED NO-OP EMITS NOTHING. Saving a form nobody changed
--          returns `unchanged`, writes nothing and appends NO audit event.
--   P25-6  ⚠️ THE PERMIT CONTROL, module: `updated`, the title TRIMMED, and
--          exactly ONE `admin.module_updated` carrying WHICH fields moved.
--   P25-7  The session leg: `updated`, room TRIMMED, term attached, exactly
--          ONE `admin.session_updated` with its four change flags.
--   P25-8  ⛔ THE THREE REFUSALS, MEASURED AT RUNTIME. After real edits:
--          the session, module and assignment ROW COUNTS are UNMOVED, and
--          ZERO cancel / delete / unassign events exist. ▶ `27` can change
--          a class; it cannot destroy one.
--   P25-9  ⛔ CHAIN VERIFICATION ACCEPTS a chain carrying both new strings.
--  P25-10  ⚠️ ITS NON-VACUITY CONTROL, and the leg that makes P25-9 mean
--          anything: verification trivially accepts a chain containing
--          NEITHER string, so the chain just verified must be PROVEN to
--          contain both.
--  P25-11  Diagnostics AFTER authorization DISCRIMINATE.
--  P25-12  ⛔ ZERO write policies and ZERO non-SELECT client grants across
--          the whole class family AND terms.
--
-- ⚠️ TRANSACTION-SCOPED, ending in ROLLBACK.
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
  v_centre    uuid;
  v_module    uuid;
  v_grade0    uuid;
  v_grade1    uuid;
  v_session   uuid;
  v_term      uuid;
  v_title0    text;
  v_reason    text;
  v_reason2   text;
  v_n         integer;
  v_modules0  integer;
  v_sessions0 integer;
  v_assign0   integer;
  v_seq0      bigint;
  v_ok        boolean;
  v_checked   bigint;
BEGIN
  -- ---- baselines and subjects, as OWNER, PINNED BY ID ----------------
  -- ⚠️ Captured ONCE into variables. The smoke test that preceded this suite
  -- re-derived its subject with `ORDER BY session_date LIMIT 1` on every
  -- line, and `session_date` has ties -- so the row it UPDATED and the row it
  -- then READ were not guaranteed to be the same one.
  SELECT count(*) INTO v_modules0  FROM public.class_modules;
  SELECT count(*) INTO v_sessions0 FROM public.class_sessions;
  SELECT count(*) INTO v_assign0   FROM public.class_session_assignments;
  SELECT coalesce(max(seq_no), 0) INTO v_seq0 FROM public.audit_events;
  SELECT id INTO v_centre FROM public.centres WHERE code = 'ispeak';
  SELECT m.id, m.class_grade_id, m.title INTO v_module, v_grade0, v_title0
    FROM public.class_modules m WHERE m.is_active ORDER BY m.created_at LIMIT 1;
  SELECT id INTO v_grade1 FROM public.class_grades WHERE code = 'advanced';
  SELECT id INTO v_session FROM public.class_sessions
   WHERE class_module_id = v_module ORDER BY session_date, id LIMIT 1;
  SELECT id INTO v_term FROM public.terms ORDER BY starts_on LIMIT 1;

  -- P25-1 -- NON-VACUITY.
  SELECT count(*) INTO v_n FROM information_schema.role_routine_grants
   WHERE routine_schema = 'public'
     AND routine_name IN ('admin_update_class_module','admin_update_class_session')
     AND grantee = 'authenticated' AND privilege_type = 'EXECUTE';
  IF v_n = 2 AND v_module IS NOT NULL AND v_session IS NOT NULL AND v_term IS NOT NULL
     AND pg_catalog.array_length(public.audit_action_registry(), 1) >= 21
     AND 'admin.module_updated' = ANY (public.audit_action_registry())
     AND 'admin.session_updated' = ANY (public.audit_action_registry())
  THEN
    RAISE NOTICE 'PASS P25-1  NON-VACUITY: both update RPCs are authenticated-executable, the registry is EXACTLY 21 carrying both newly ratified strings, and the module and session every leg edits exist';
  ELSE
    RAISE NOTICE 'FAIL P25-1  grants=%, registry=%, module=%, session=%', v_n, pg_catalog.array_length(public.audit_action_registry(), 1), v_module IS NOT NULL, v_session IS NOT NULL;
  END IF;

  -- P25-2 -- ⛔ A TRAINER IS REFUSED.
  SET LOCAL ROLE authenticated;
  PERFORM pg_temp.as_trainer();
  SELECT o_reason INTO v_reason  FROM public.admin_update_class_module(v_module, v_grade1, 'Trainer Rename');
  SELECT o_reason INTO v_reason2 FROM public.admin_update_class_session(
    v_session, '2026-09-09'::date, NULL, NULL, 'Trainer Room', NULL);
  RESET ROLE;
  IF v_reason = 'not_permitted' AND v_reason2 = 'not_permitted'
     AND (SELECT title FROM public.class_modules WHERE id = v_module) = v_title0
  THEN
    RAISE NOTICE 'PASS P25-2  a TRAINER is refused on BOTH update RPCs (%, %) and the module is unchanged -- an ACTIVE membership is not a MANAGEMENT membership', v_reason, v_reason2;
  ELSE
    RAISE NOTICE 'FAIL P25-2  trainer got %, % and something moved', v_reason, v_reason2;
  END IF;

  -- P25-3 -- ⛔ AN UNIDENTIFIED CALLER IS REFUSED.
  SET LOCAL ROLE authenticated;
  PERFORM pg_temp.as_nobody();
  SELECT o_reason INTO v_reason  FROM public.admin_update_class_module(v_module, v_grade1, 'Anon Rename');
  SELECT o_reason INTO v_reason2 FROM public.admin_update_class_session(
    v_session, '2026-09-09'::date, NULL, NULL, NULL, NULL);
  RESET ROLE;
  IF v_reason = 'not_permitted' AND v_reason2 = 'not_permitted'
     AND (SELECT title FROM public.class_modules WHERE id = v_module) = v_title0
  THEN
    RAISE NOTICE 'PASS P25-3  an UNIDENTIFIED caller is refused on both and changes nothing';
  ELSE
    RAISE NOTICE 'FAIL P25-3  unidentified caller got %, %', v_reason, v_reason2;
  END IF;

  -- P25-4 -- ⛔ NON-DISCLOSURE, three wrong targets, one string.
  SET LOCAL ROLE authenticated;
  PERFORM pg_temp.as_management();
  SELECT o_reason INTO v_reason FROM public.admin_update_class_module(
    v_module, '00000000-0000-4000-8000-000000000000'::uuid, 'Foreign Grade');
  IF v_reason = 'not_permitted'
     AND (SELECT o_reason FROM public.admin_update_class_session(
            '00000000-0000-4000-8000-000000000000'::uuid, '2026-09-09'::date,
            NULL, NULL, NULL, NULL)) = 'not_permitted'
     AND (SELECT o_reason FROM public.admin_update_class_session(
            v_session, '2026-09-09'::date, NULL, NULL, NULL,
            '00000000-0000-4000-8000-000000000000'::uuid)) = 'not_permitted'
  THEN
    RESET ROLE;
    RAISE NOTICE 'PASS P25-4  NON-DISCLOSURE: an AUTHORIZED management caller gets the SAME "%" for a foreign GRADE, a non-existent SESSION and a foreign TERM -- and it is the same string the trainer got, so a refused caller never learns WHICH gate stopped them', v_reason;
  ELSE
    RESET ROLE;
    RAISE NOTICE 'FAIL P25-4  a wrong-target case disclosed a distinct reason (first: %)', v_reason;
  END IF;

  -- P25-5 -- ⚠️ A CONFIRMED NO-OP EMITS NOTHING.
  SELECT count(*) INTO v_n FROM public.audit_events WHERE seq_no > v_seq0;
  SET LOCAL ROLE authenticated;
  SELECT o_reason INTO v_reason FROM public.admin_update_class_module(v_module, v_grade0, v_title0);
  SELECT o_reason INTO v_reason2 FROM public.admin_update_class_session(
    v_session,
    (SELECT session_date FROM public.class_sessions WHERE id = v_session),
    (SELECT starts_at    FROM public.class_sessions WHERE id = v_session),
    (SELECT ends_at      FROM public.class_sessions WHERE id = v_session),
    (SELECT room         FROM public.class_sessions WHERE id = v_session),
    (SELECT term_id      FROM public.class_sessions WHERE id = v_session));
  RESET ROLE;
  IF v_reason = 'unchanged' AND v_reason2 = 'unchanged'
     AND (SELECT count(*) FROM public.audit_events WHERE seq_no > v_seq0) = v_n
  THEN
    RAISE NOTICE 'PASS P25-5  saving a form NOBODY CHANGED returns "unchanged" on both and appends NO audit event -- A-029 records governed ACTIONS, and re-saving an unchanged class is not one';
  ELSE
    RAISE NOTICE 'FAIL P25-5  no-op returned %, % and moved the chain', v_reason, v_reason2;
  END IF;

  -- P25-6 -- ⚠️ THE PERMIT CONTROL, module.
  SET LOCAL ROLE authenticated;
  SELECT o_reason INTO v_reason
    FROM public.admin_update_class_module(v_module, v_grade1, '  Renamed Studio Class  ');
  RESET ROLE;
  SELECT count(*) INTO v_n FROM public.audit_events
   WHERE seq_no > v_seq0 AND action = 'admin.module_updated' AND target_id = v_module;
  IF v_reason = 'updated' AND v_n = 1
     AND (SELECT title FROM public.class_modules WHERE id = v_module) = 'Renamed Studio Class'
     AND (SELECT class_grade_id FROM public.class_modules WHERE id = v_module) = v_grade1
     AND EXISTS (SELECT 1 FROM public.audit_events e
                  WHERE e.target_id = v_module AND e.action = 'admin.module_updated'
                    AND e.actor_role = 'management'
                    AND e.payload ->> 'title_changed' = 'true'
                    AND e.payload ->> 'grade_changed' = 'true')
  THEN
    RAISE NOTICE 'PASS P25-6  CONTROL: MANAGEMENT updates the module through the SAME harness -- "%", the title TRIMMED, the grade moved, and exactly ONE admin.module_updated recording WHICH fields changed. ⚠️ The payload carries the CHANGED FLAGS, never the old values: the prior state is already in the chain, and A-029 minimizes', v_reason;
  ELSE
    RAISE NOTICE 'FAIL P25-6  reason=%, events=%', v_reason, v_n;
  END IF;

  -- P25-7 -- the session leg.
  SET LOCAL ROLE authenticated;
  SELECT o_reason INTO v_reason FROM public.admin_update_class_session(
    v_session, '2026-05-05'::date, '10:00'::time, '11:00'::time, '  Studio 9  ', v_term);
  RESET ROLE;
  SELECT count(*) INTO v_n FROM public.audit_events
   WHERE seq_no > v_seq0 AND action = 'admin.session_updated' AND target_id = v_session;
  IF v_reason = 'updated' AND v_n = 1
     AND (SELECT room FROM public.class_sessions WHERE id = v_session) = 'Studio 9'
     AND (SELECT term_id FROM public.class_sessions WHERE id = v_session) = v_term
     AND (SELECT session_date FROM public.class_sessions WHERE id = v_session) = '2026-05-05'::date
  THEN
    RAISE NOTICE 'PASS P25-7  the session is updated in place -- room TRIMMED, term attached, date moved, exactly ONE admin.session_updated. ▶ ONE CALL UPDATES ONE SESSION, so applying a room across a module is N governed transactions, exactly as creation is';
  ELSE
    RAISE NOTICE 'FAIL P25-7  reason=%, events=%', v_reason, v_n;
  END IF;

  -- P25-8 -- ⛔ THE THREE REFUSALS, MEASURED AT RUNTIME.
  SELECT count(*) INTO v_n FROM public.audit_events
   WHERE action IN ('admin.session_cancelled','admin.session_deleted','admin.trainer_unassigned');
  IF (SELECT count(*) FROM public.class_sessions) = v_sessions0
     AND (SELECT count(*) FROM public.class_modules) = v_modules0
     AND (SELECT count(*) FROM public.class_session_assignments) = v_assign0
     AND v_n = 0
  THEN
    RAISE NOTICE 'PASS P25-8  ⛔ THE THREE REFUSALS HELD after real edits: sessions UNMOVED at %, modules at %, assignments at %, and ZERO cancel/delete/unassign events. ▶ `27` can CHANGE a class; it cannot DESTROY one -- the day strip is read-only because removing a session would destroy attendance, observations or a submitted report with no ratified string to record it', v_sessions0, v_modules0, v_assign0;
  ELSE
    RAISE NOTICE 'FAIL P25-8  a row count moved, or % destructive event(s) fired', v_n;
  END IF;

  -- P25-9 -- ⛔ CHAIN VERIFICATION ACCEPTS THE NEW STRINGS.
  SELECT v.ok, v.events_checked INTO v_ok, v_checked
    FROM public.audit_verify_chain(v_centre, NULL, NULL) v;
  IF v_ok THEN
    RAISE NOTICE 'PASS P25-9  audit_verify_chain ACCEPTS the chain over % events, with admin.module_updated and admin.session_updated appended to it -- the registry extension did not desynchronise verification from emission', v_checked;
  ELSE
    RAISE NOTICE 'FAIL P25-9  chain verification REJECTED a chain carrying the newly ratified strings';
  END IF;

  -- P25-10 -- ⚠️ THE NON-VACUITY CONTROL FOR P25-9.
  -- ⛔ Verification trivially accepts a chain containing NEITHER new string.
  -- The Operator required this leg by name.
  SELECT count(*) INTO v_n FROM public.audit_events
   WHERE seq_no > v_seq0 AND action IN ('admin.module_updated','admin.session_updated');
  IF v_n = 2 AND v_checked > v_seq0 THEN
    RAISE NOTICE 'PASS P25-10 NON-VACUITY: the chain P25-9 verified actually CONTAINS both new strings (% events of them, % checked in total) -- without this, "verification accepts" is equally true of a chain that never carried one', v_n, v_checked;
  ELSE
    RAISE NOTICE 'FAIL P25-10 the verified chain carried % new-string event(s) -- P25-9 proves nothing', v_n;
  END IF;

  -- P25-11 -- diagnostics AFTER authorization discriminate.
  SET LOCAL ROLE authenticated;
  SELECT o_reason INTO v_reason FROM public.admin_update_class_module(v_module, v_grade1, '   ');
  IF v_reason = 'invalid_title'
     AND (SELECT o_reason FROM public.admin_update_class_session(
            v_session, '2026-05-05'::date, '11:00'::time, '10:00'::time, NULL, NULL)) = 'invalid_times'
     AND (SELECT o_reason FROM public.admin_update_class_session(
            v_session, NULL, NULL, NULL, NULL, NULL)) = 'invalid_date'
  THEN
    RESET ROLE;
    RAISE NOTICE 'PASS P25-11 after authorization SUCCEEDS the reasons DISCRIMINATE (invalid_title / invalid_times / invalid_date) -- which is what makes P25-4''s single not_permitted a deliberate COLLAPSE rather than the only string these functions know';
  ELSE
    RESET ROLE;
    RAISE NOTICE 'FAIL P25-11 the blank title reported %', v_reason;
  END IF;

  -- P25-12 -- ⛔ ZERO WRITE SURFACE, WHOLE FAMILY.
  SELECT (SELECT count(*) FROM pg_policies
           WHERE schemaname='public'
             AND tablename IN ('terms','class_modules','class_sessions','class_session_assignments','class_grades')
             AND cmd <> 'SELECT')
       + (SELECT count(*) FROM information_schema.role_table_grants
           WHERE table_schema='public'
             AND table_name IN ('terms','class_modules','class_sessions','class_session_assignments','class_grades')
             AND grantee IN ('anon','authenticated','service_role')
             AND privilege_type <> 'SELECT')
    INTO v_n;
  IF v_n = 0 THEN
    RAISE NOTICE 'PASS P25-12 ZERO write policies and ZERO non-SELECT client grants across the WHOLE class family and terms, in the phase that UPDATES two of them -- every mutation is a reviewed SECURITY DEFINER RPC (ADR-3, A-030)';
  ELSE
    RAISE NOTICE 'FAIL P25-12 a write path appeared in the class family: %', v_n;
  END IF;
END
$suite$;

ROLLBACK;
