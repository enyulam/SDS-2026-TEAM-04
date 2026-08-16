-- =====================================================================
-- PORTAL PHASE P2-14 -- screen `22` Edit Student.
-- =====================================================================
-- ⛔ WHAT THIS FILE ADDS, NAMED NOT COUNTED:
--      · audit string  'admin.student_updated'   -- registry 23 -> 24
--      · function      public.admin_update_student(uuid, text, text, uuid[])
--      · function      public.admin_withdraw_student(uuid)
--      · grant         EXECUTE on each, to authenticated
--    NO table, column, enum, policy or client table grant.
--
-- ⚠️ THE COUNT AND THE STRING WERE STATED IN ADVANCE AND AUTHORIZED BEFORE
--    THIS FILE WAS WRITTEN (Operator, 2026-08-16): *"admin.student_updated for
--    P2-14 -- AUTHORIZED, registry 23 -> 24. Amend A-057 in the C-4 shape,
--    extend the single declaration site, and prove chain verification accepts
--    it with a non-vacuity leg."*
--
-- ⛔ EXACTLY ONE STRING, AND THE WITHDRAWAL DOES NOT GET A SECOND.
--    At `P2-12` this was left as an open sub-question -- whether withdraw is
--    the same string or its own. It is NOT its own: a withdrawal is a student
--    STATE CHANGE (`admin.student_updated`) plus one enrolment change per
--    class (`admin.enrolment_changed`, already ratified). ▶ `A-029` counts
--    ACTIONS, and both of those actions already have names. Minting a third
--    would be a second name for something named, which is exactly what the
--    `evidence.uploaded` collapse closed.
--
-- ⛔ THE PROHIBITION RE-ARMS. A further student action is a fresh
--    `CLAUDE.md` §12 stop-and-ask; this authorization is not a licence.
--
-- ---------------------------------------------------------------------
-- ⛔ *"CAN BE UNDONE WITHIN 30 DAYS"* IS DROPPED, BY RULING
-- ---------------------------------------------------------------------
--   The frame's withdrawal card promises the action *"can be undone within 30
--   days"*. Operator, 2026-08-16: **build the withdrawal, DROP THE SENTENCE** --
--   *"a retention promise with no mechanism is a lie with a deadline."*
--
--   ▶ `is_active`, `deactivated_at` and `withdrawn_at` all exist, so the
--   withdrawal itself is buildable today. The 30-day WINDOW needs a recorded
--   deadline **and something that acts on it**, and retention is Phase 4
--   (`CLAUDE.md` §10). Rendering the copy would assert a guarantee nothing
--   enforces -- the `P2-11` seven-day-invitation shape exactly.
--
--   ⚠️ WITHDRAWAL IS REVERSIBLE IN THE DATA, and the screen says so without a
--   deadline: nothing is deleted, and re-enrolment is a management action.
-- =====================================================================

BEGIN;

-- ===========================================================================
-- 1 . The registry, 23 -> 24. ONE DECLARATION SITE (`P1-2` consolidated it).
-- ===========================================================================
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
    -- C-4 shape. 19 -> 21.
    'admin.module_updated',
    'admin.session_updated',
    -- A-057 as further amended by the Operator ruling of 2026-08-13/14, same
    -- shape. 21 -> 23. Both strings and the count were STATED IN ADVANCE and
    -- approved before that migration was written.
    --
    -- ⛔ EXACTLY TWO. `material.attached` collapses upload-and-attach for the
    --    reason C-4 gave for evidence: no authorized workflow leaves an
    --    object unattached, and A-029 binds one event per governed ACTION.
    --    ⛔ Do NOT introduce `material.uploaded`.
    --
    -- ⛔ `material.accessed` IS DELIBERATELY ABSENT AND ITS ABSENCE IS RULED,
    --    not overlooked. A slide deck carries no child's data, and A-029 plus
    --    the P2-4 precedent hold that a READ IS NOT A GOVERNED ACTION. A
    --    download here emits nothing.
    --
    -- ⛔ This ruling is not a standing licence. A third material action is a
    --    fresh CLAUDE.md §12 stop-and-ask.
    'material.attached',
    'material.removed',
    -- A-057 as further amended by the Operator ruling of 2026-08-16, in the
    -- C-4 shape. 23 -> 24. The string and the count were STATED IN ADVANCE
    -- and authorized before this file was written.
    --
    -- ⛔ EXACTLY ONE, AND THE WITHDRAWAL SHARES IT. A withdrawal is a student
    --    STATE CHANGE plus one `admin.enrolment_changed` per class; both of
    --    those actions already have names, and A-029 counts ACTIONS. Minting
    --    `admin.student_withdrawn` would be a SECOND NAME for something
    --    already named -- the defect the `evidence.uploaded` collapse closed.
    --
    -- ⛔ THE PROHIBITION RE-ARMS. A further student action is a fresh
    --    CLAUDE.md §12 stop-and-ask; this is not a standing licence.
    'admin.student_updated'
  ];
$function$;

-- ===========================================================================
-- 2 . The edit path.
-- ===========================================================================
CREATE OR REPLACE FUNCTION public.admin_update_student(
  p_student_id       uuid,
  p_first_name       text,
  p_last_name        text,
  p_class_module_ids uuid[],
  OUT o_reason      text,
  OUT o_added       integer,
  OUT o_removed     integer,
  OUT o_name_changed boolean
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
  v_full          text;
  v_old_name      text;
  v_ids           uuid[];
  v_module        uuid;
  v_enrolment_id  uuid;
BEGIN
  o_reason       := 'not_permitted';
  o_added        := 0;
  o_removed      := 0;
  o_name_changed := false;

  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  SELECT (pg_catalog.array_agg(m.id))[1], (pg_catalog.array_agg(m.centre_id))[1]
    INTO v_membership_id, v_centre_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.role = 'management' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN RETURN; END IF;

  SELECT s.full_name INTO v_old_name
    FROM public.students s
   WHERE s.id = p_student_id AND s.centre_id = v_centre_id AND s.is_active;
  IF v_old_name IS NULL THEN
    o_reason := 'unknown_student';
    RETURN;
  END IF;

  v_full := pg_catalog.btrim(coalesce(p_first_name, '')) || ' ' || pg_catalog.btrim(coalesce(p_last_name, ''));
  IF pg_catalog.length(pg_catalog.btrim(coalesce(p_first_name, ''))) = 0
     OR pg_catalog.length(pg_catalog.btrim(coalesce(p_last_name, ''))) = 0
     OR pg_catalog.length(v_full) > 120 THEN
    o_reason := 'invalid_name';
    RETURN;
  END IF;

  -- ⛔ AT LEAST ONE CLASS, for the same reason registration requires one: a
  --    student enrolled in nothing appears on no roster and can be assessed by
  --    nobody. An edit must not be able to produce that state either.
  SELECT pg_catalog.array_agg(DISTINCT id) INTO v_ids
    FROM pg_catalog.unnest(coalesce(p_class_module_ids, ARRAY[]::uuid[])) AS t(id)
   WHERE id IS NOT NULL;
  IF v_ids IS NULL OR pg_catalog.array_length(v_ids, 1) IS NULL THEN
    o_reason := 'no_classes';
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_catalog.unnest(v_ids) AS t(id)
     WHERE NOT EXISTS (
       SELECT 1 FROM public.class_modules cm WHERE cm.id = t.id AND cm.centre_id = v_centre_id
     )
  ) THEN
    o_reason := 'unknown_class';
    RETURN;
  END IF;

  -- ── The name.
  IF v_full <> v_old_name THEN
    UPDATE public.students SET full_name = v_full, updated_at = pg_catalog.now()
     WHERE id = p_student_id;
    o_name_changed := true;
  END IF;

  -- ── Enrolments removed. ⚠️ WITHDRAWN, NOT DELETED: `withdrawn_at` records
  --    when, and the row remains as the history of a child having been in that
  --    class. Deleting it would erase a fact reports were written against.
  FOR v_enrolment_id, v_module IN
    SELECT e.id, e.class_module_id FROM public.enrolments e
     WHERE e.student_id = p_student_id AND e.centre_id = v_centre_id AND e.is_active
       AND NOT (e.class_module_id = ANY (v_ids))
  LOOP
    UPDATE public.enrolments
       SET is_active = false, withdrawn_at = pg_catalog.now()
     WHERE id = v_enrolment_id;

    PERFORM public.audit_append_event(
      v_centre_id, v_account_id, v_membership_id, 'management',
      'admin.enrolment_changed', NULL, NULL, NULL,
      'enrolment', v_enrolment_id, 'Enrolment',
      pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object(
          'target_type', 'student', 'target_id', p_student_id::text, 'target_label', 'Student'),
        pg_catalog.jsonb_build_object(
          'target_type', 'class_module', 'target_id', v_module::text, 'target_label', 'Class module')
      ),
      pg_catalog.jsonb_build_object('change', 'withdrawn')
    );
    o_removed := o_removed + 1;
  END LOOP;

  -- ── Enrolments added.
  FOREACH v_module IN ARRAY v_ids LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.enrolments e
       WHERE e.student_id = p_student_id AND e.class_module_id = v_module AND e.is_active
    ) THEN
      INSERT INTO public.enrolments (centre_id, class_module_id, student_id)
      VALUES (v_centre_id, v_module, p_student_id)
      RETURNING id INTO v_enrolment_id;

      PERFORM public.audit_append_event(
        v_centre_id, v_account_id, v_membership_id, 'management',
        'admin.enrolment_changed', NULL, NULL, NULL,
        'enrolment', v_enrolment_id, 'Enrolment',
        pg_catalog.jsonb_build_array(
          pg_catalog.jsonb_build_object(
            'target_type', 'student', 'target_id', p_student_id::text, 'target_label', 'Student'),
          pg_catalog.jsonb_build_object(
            'target_type', 'class_module', 'target_id', v_module::text, 'target_label', 'Class module')
        ),
        pg_catalog.jsonb_build_object('change', 'enrolled')
      );
      o_added := o_added + 1;
    END IF;
  END LOOP;

  -- ⛔ NO EVENT WHEN NOTHING CHANGED. `A-029` records governed ACTIONS; a save
  --    that altered nothing is not one, and emitting it would put a
  --    "management edited this child" row into an immutable log over a
  --    no-op. ⚠️ The reason is still `saved`, because from the caller's side
  --    the save succeeded.
  IF o_name_changed OR o_added > 0 OR o_removed > 0 THEN
    -- ⛔ THE NAME REACHES NO LABEL OR PAYLOAD, old or new. `A-029` data
    --    minimization; `CLAUDE.md` §12 makes a child's name in an audit label
    --    a STOP-AND-ASK. What is recorded is THAT it changed.
    PERFORM public.audit_append_event(
      v_centre_id, v_account_id, v_membership_id, 'management',
      'admin.student_updated', NULL, NULL, NULL,
      'student', p_student_id, 'Student',
      NULL,
      pg_catalog.jsonb_build_object(
        'name_changed', o_name_changed,
        'enrolments_added', o_added,
        'enrolments_removed', o_removed)
    );
  END IF;

  o_reason := 'saved';
END;
$fn$;

-- ===========================================================================
-- 3 . The withdrawal.
-- ===========================================================================
CREATE OR REPLACE FUNCTION public.admin_withdraw_student(
  p_student_id uuid,
  OUT o_reason   text,
  OUT o_removed  integer
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
  v_module        uuid;
  v_enrolment_id  uuid;
BEGIN
  o_reason  := 'not_permitted';
  o_removed := 0;

  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  SELECT (pg_catalog.array_agg(m.id))[1], (pg_catalog.array_agg(m.centre_id))[1]
    INTO v_membership_id, v_centre_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.role = 'management' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN RETURN; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.students s
     WHERE s.id = p_student_id AND s.centre_id = v_centre_id AND s.is_active
  ) THEN
    o_reason := 'unknown_student';
    RETURN;
  END IF;

  FOR v_enrolment_id, v_module IN
    SELECT e.id, e.class_module_id FROM public.enrolments e
     WHERE e.student_id = p_student_id AND e.centre_id = v_centre_id AND e.is_active
  LOOP
    UPDATE public.enrolments
       SET is_active = false, withdrawn_at = pg_catalog.now()
     WHERE id = v_enrolment_id;

    PERFORM public.audit_append_event(
      v_centre_id, v_account_id, v_membership_id, 'management',
      'admin.enrolment_changed', NULL, NULL, NULL,
      'enrolment', v_enrolment_id, 'Enrolment',
      pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object(
          'target_type', 'student', 'target_id', p_student_id::text, 'target_label', 'Student'),
        pg_catalog.jsonb_build_object(
          'target_type', 'class_module', 'target_id', v_module::text, 'target_label', 'Class module')
      ),
      pg_catalog.jsonb_build_object('change', 'withdrawn')
    );
    o_removed := o_removed + 1;
  END LOOP;

  -- ⚠️ THE STUDENT ROW IS DEACTIVATED, NEVER DELETED. Reports, observations
  --    and audit rows all reference it, and `A-029`'s durable actor FKs are
  --    `RESTRICT` precisely so history cannot be erased by a delete.
  UPDATE public.students
     SET is_active = false, deactivated_at = pg_catalog.now(), updated_at = pg_catalog.now()
   WHERE id = p_student_id;

  PERFORM public.audit_append_event(
    v_centre_id, v_account_id, v_membership_id, 'management',
    'admin.student_updated', NULL, NULL, NULL,
    'student', p_student_id, 'Student',
    NULL,
    pg_catalog.jsonb_build_object('change', 'withdrawn', 'enrolments_removed', o_removed)
  );

  o_reason := 'withdrawn';
END;
$fn$;

REVOKE ALL ON FUNCTION public.admin_update_student(uuid, text, text, uuid[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_withdraw_student(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_update_student(uuid, text, text, uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_withdraw_student(uuid) TO authenticated;

-- =====================================================================
-- APPLY-TIME ASSERTIONS
-- =====================================================================
DO $assert$
DECLARE
  v_count integer;
  v_text  text;
  v_rec   record;
  v_chain record;
BEGIN
  -- PO-1: ⛔ THE REGISTRY IS EXACTLY 24, AND THE NEW STRING IS THE ONE
  -- AUTHORIZED. Both the count and the name were stated in advance.
  SELECT pg_catalog.array_length(public.audit_action_registry(), 1) INTO v_count;
  IF v_count <> 24 THEN
    RAISE EXCEPTION 'PO-1 FAILED: registry is % (expected exactly 24)', v_count;
  END IF;
  IF NOT (public.audit_action_registry() @> ARRAY['admin.student_updated']) THEN
    RAISE EXCEPTION 'PO-1 FAILED: admin.student_updated is not in the registry';
  END IF;
  IF public.audit_action_registry() @> ARRAY['admin.student_withdrawn'] THEN
    RAISE EXCEPTION 'PO-1 FAILED: a SECOND string was added -- the withdrawal shares admin.student_updated';
  END IF;
  RAISE NOTICE 'PO-1 PASS  registry 23 -> 24, exactly one string, and no admin.student_withdrawn';

  -- PO-2: ⛔ NOTHING ELSE IN THE CENSUS MOVED.
  SELECT (SELECT pg_catalog.count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE')::text
      || '|' || (SELECT pg_catalog.count(DISTINCT t.typname) FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public' AND t.typtype = 'e')::text
      || '|' || (SELECT pg_catalog.count(*) FROM pg_catalog.pg_policies WHERE schemaname = 'public')::text
    INTO v_text;
  IF v_text <> '30|12|30' THEN
    RAISE EXCEPTION 'PO-2 FAILED: census moved to % (expected 30|12|30)', v_text;
  END IF;
  RAISE NOTICE 'PO-2 PASS  tables|enums|policies unmoved at %', v_text;

  -- PO-3: posture and grants on BOTH functions.
  SELECT pg_catalog.count(*) INTO v_count
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname IN ('admin_update_student', 'admin_withdraw_student')
     AND p.prosecdef AND p.provolatile = 'v' AND p.proconfig @> ARRAY['search_path=""'];
  IF v_count <> 2 THEN
    RAISE EXCEPTION 'PO-3 FAILED: expected 2 correctly-postured functions, found %', v_count;
  END IF;
  SELECT pg_catalog.count(*) INTO v_count
    FROM information_schema.role_routine_grants g
   WHERE g.routine_schema = 'public'
     AND g.routine_name IN ('admin_update_student', 'admin_withdraw_student')
     AND g.grantee <> 'postgres';
  IF v_count <> 2 THEN
    RAISE EXCEPTION 'PO-3 FAILED: expected 2 non-owner grants, found %', v_count;
  END IF;
  RAISE NOTICE 'PO-3 PASS  both functions SECURITY DEFINER + VOLATILE + empty search_path, one grant each';

  -- PO-4: ⛔ NO 30-DAY PROMISE ANYWHERE IN THIS FILE'S CODE.
  SELECT pg_catalog.string_agg(p.prosrc, ' ') INTO v_text
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname IN ('admin_update_student', 'admin_withdraw_student')
     AND p.prokind = 'f';
  IF pg_catalog.regexp_replace(v_text, '--[^\n]*', ' ', 'g') ~* '30 day|thirty day|undo|restore_by|retention' THEN
    RAISE EXCEPTION 'PO-4 FAILED: a 30-day undo promise reached the code';
  END IF;
  RAISE NOTICE 'PO-4 PASS  no 30-day window, no undo deadline -- built the withdrawal, dropped the sentence';

  -- PO-5: ⚠️ EXECUTE BOTH, ON THE REFUSAL PATH -- GATE 1 ONLY (§26.1).
  SELECT * INTO v_rec FROM public.admin_update_student(
    '00000000-0000-4000-8000-000000000000'::uuid, 'a', 'b', ARRAY[]::uuid[]);
  IF v_rec.o_reason <> 'not_permitted' THEN
    RAISE EXCEPTION 'PO-5 FAILED: update owner probe returned %', v_rec.o_reason;
  END IF;
  SELECT * INTO v_rec FROM public.admin_withdraw_student('00000000-0000-4000-8000-000000000000'::uuid);
  IF v_rec.o_reason <> 'not_permitted' THEN
    RAISE EXCEPTION 'PO-5 FAILED: withdraw owner probe returned %', v_rec.o_reason;
  END IF;
  RAISE NOTICE 'PO-5 PASS  both executed as owner -> not_permitted -- ⚠️ GATE 1 ONLY; the suite reaches the bodies';

  -- PO-6: ⛔ THE HASH CHAIN STILL VERIFIES, WITH A NON-VACUITY LEG.
  -- ⚠️ THE OPERATOR REQUIRED THE NON-VACUITY LEG EXPLICITLY, and it is what
  --    makes this mean anything: `audit_verify_chain` over ZERO events returns
  --    `ok = true`, so a green with `events_checked = 0` proves NOTHING about
  --    whether the chain is intact.
  SELECT * INTO v_chain FROM public.audit_verify_chain() LIMIT 1;
  IF v_chain.ok IS NOT TRUE THEN
    RAISE EXCEPTION 'PO-6 FAILED: chain verification returned ok=% at seq %', v_chain.ok, v_chain.first_failed_seq;
  END IF;
  IF v_chain.events_checked IS NULL OR v_chain.events_checked < 100 THEN
    RAISE EXCEPTION 'PO-6 FAILED: only % events checked -- a green over an empty chain is not evidence', v_chain.events_checked;
  END IF;
  RAISE NOTICE 'PO-6 PASS  chain verifies over % events (ok=%), and the count is asserted so an EMPTY chain cannot report green -- extending the registry did not disturb it',
    v_chain.events_checked, v_chain.ok;
END;
$assert$;

COMMIT;
