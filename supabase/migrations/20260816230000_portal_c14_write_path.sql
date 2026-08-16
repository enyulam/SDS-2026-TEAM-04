-- =====================================================================
-- C-14 WRITE PATH — the four authorized columns become writable
-- =====================================================================
-- Operator authorization, 2026-08-16:
--
--   "SIGNATURE CHANGES — AUTHORIZED. admin_create_student +3 params ·
--    admin_update_student +3 · admin_create_parent +1 · admin_create_trainer
--    +1, each by DROP+CREATE with its EXECUTE grant restored to exactly what
--    it held before. No new grant, no widened grant, no new audit string,
--    registry unmoved at 24."
--
-- ⛔ WHY `DROP` AND NOT `CREATE OR REPLACE`: `CREATE OR REPLACE` with a
--    DIFFERENT parameter list does not replace anything — it creates an
--    OVERLOAD. Both signatures would then exist, PostgREST would have two
--    candidates, and the old body would keep running for any caller that
--    happened to match it. The old signature must CEASE TO EXIST.
--
-- ⛔ WHY THE CALLERS SHIP IN THE SAME PASS: dropping a signature makes every
--    stale `.rpc()` call site fail at runtime with `PGRST202`, and since
--    `Functions` was removed from `AppDatabase` the type system cannot see
--    it. `prove:rpc-arguments` is the guard built for exactly this, and it is
--    run against this migration's result.
--
-- The four columns were added at `20260816220000`; this migration adds no
-- table, column, enum, policy, client table grant or audit action string.
-- Registry stays at 24, census stays at 30 tables / 12 enums / 30 policies.
-- =====================================================================

-- ⛔ THE GRANT SET, AS AN EXACT SET — NOT A PRESENCE CHECK (before any DROP).
-- Operator instruction: *"assert the pinned exact set postgres:EXECUTE,
-- authenticated:EXECUTE before and after, as an exact set, not a presence
-- check."* ▶ A presence check passes while an EXTRA grantee sits beside the
-- expected one, which is exactly how a DROP + CREATE widens a privilege: a new
-- function grants EXECUTE to PUBLIC by default, and `REVOKE ALL FROM PUBLIC`
-- is the only thing that takes it away.
DO $ASSERT$
DECLARE
  r record;
  v_acl text;
BEGIN
  FOR r IN SELECT unnest(ARRAY['admin_create_student','admin_update_student','admin_create_parent','admin_create_trainer']) AS fn
  LOOP
    SELECT pg_catalog.string_agg(g.grantee || ':' || g.priv, ', ' ORDER BY g.grantee, g.priv)
      INTO v_acl
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      CROSS JOIN LATERAL pg_catalog.aclexplode(p.proacl) x
      CROSS JOIN LATERAL (SELECT pg_catalog.pg_get_userbyid(x.grantee) AS grantee, x.privilege_type AS priv) g
     WHERE n.nspname = 'public' AND p.proname = r.fn;

    IF v_acl IS DISTINCT FROM 'authenticated:EXECUTE, postgres:EXECUTE' THEN
      RAISE EXCEPTION 'C14W-PRE  grant set BEFORE: % holds [%], expected exactly [authenticated:EXECUTE, postgres:EXECUTE]', r.fn, coalesce(v_acl, '(none)');
    END IF;
  END LOOP;
  RAISE NOTICE 'PASS C14W-PRE  grant set BEFORE: all four hold exactly [authenticated:EXECUTE, postgres:EXECUTE]';
END
$ASSERT$;

-- ─────────────────────────────────────────────────────────────────────
-- admin_create_student: (text, text, uuid[])  ->  (text, text, uuid[], date, text, text)
-- ─────────────────────────────────────────────────────────────────────
DROP FUNCTION public.admin_create_student(text, text, uuid[]);

CREATE FUNCTION public.admin_create_student(p_first_name text, p_last_name text, p_class_module_ids uuid[], p_date_of_birth date, p_guardian_name text, p_guardian_contact text, OUT o_student_id uuid, OUT o_enrolments integer, OUT o_reason text)
 RETURNS record
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
  v_g_name        text;
  v_g_contact     text;
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

  -- ⛔ THE GUARDIAN PAIR IS A PRE-LINK CAPTURE (Operator ruling, 2026-08-16,
  --    option (c)). At creation there is definitionally no
  --    `parent_student_links` row yet, so this is the ONE moment writing them
  --    is correct. `admin_update_student` carries the guard that REFUSES them
  --    once a link exists.
  -- ⚠️ BLANK BECOMES NULL, NEVER ''. Hero `0B` makes NULL mean NOT RECORDED;
  --    an empty string would render as a present-but-empty fact.
  -- ⚠️ `coalesce` and `nullif` are SQL GRAMMAR and must NEVER be
  --    schema-qualified; `btrim`/`length` are ordinary functions and MUST be,
  --    under `search_path = ''`.
  v_g_name    := nullif(pg_catalog.btrim(coalesce(p_guardian_name, '')), '');
  v_g_contact := nullif(pg_catalog.btrim(coalesce(p_guardian_contact, '')), '');
  IF pg_catalog.length(coalesce(v_g_name, '')) > 120
     OR pg_catalog.length(coalesce(v_g_contact, '')) > 40 THEN
    o_reason := 'invalid_guardian';
    RETURN;
  END IF;

  -- ⛔ A DATE OF BIRTH IN THE FUTURE IS A DATA ERROR, NOT A LEARNER. Refused
  --    rather than stored, because every downstream age reading would be wrong
  --    and nothing would ever surface it.
  IF p_date_of_birth IS NOT NULL
     AND (p_date_of_birth > pg_catalog.now()::date OR p_date_of_birth < DATE '1900-01-01') THEN
    o_reason := 'invalid_dob';
    RETURN;
  END IF;

  -- ── The rows. ONE transaction.
  INSERT INTO public.students (centre_id, full_name, date_of_birth, guardian_name, guardian_contact)
  VALUES (v_centre_id, v_full, p_date_of_birth, v_g_name, v_g_contact)
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
$function$;

ALTER FUNCTION public.admin_create_student(text, text, uuid[], date, text, text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.admin_create_student(text, text, uuid[], date, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_create_student(text, text, uuid[], date, text, text) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- admin_update_student: (uuid, text, text, uuid[])  ->  (uuid, text, text, uuid[], date, text, text)
-- ─────────────────────────────────────────────────────────────────────
DROP FUNCTION public.admin_update_student(uuid, text, text, uuid[]);

CREATE FUNCTION public.admin_update_student(p_student_id uuid, p_first_name text, p_last_name text, p_class_module_ids uuid[], p_date_of_birth date, p_guardian_name text, p_guardian_contact text, OUT o_reason text, OUT o_added integer, OUT o_removed integer, OUT o_name_changed boolean)
 RETURNS record
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_centre_id     uuid;
  v_full          text;
  v_old_name      text;
  v_ids           uuid[];
  v_module        uuid;
  v_enrolment_id  uuid;
  v_g_name        text;
  v_g_contact     text;
  v_linked        boolean;
  v_detail_rows   integer := 0;
  v_details_chg   boolean := false;
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

  -- ═══════════════════════════════════════════════════════════════════════
  -- ⛔ THE GUARDIAN COLUMNS ARE NEVER WRITTEN ONCE A LINK EXISTS.
  -- ═══════════════════════════════════════════════════════════════════════
  -- Operator ruling, 2026-08-16, option (c): *"a linked account always wins;
  -- the free-text fields are what registration captured before a link
  -- existed."* The projection applies that precedence on READ; this applies it
  -- on WRITE, so the two cannot drift apart.
  --
  -- ⛔ A REFUSAL, NOT A SILENT IGNORE. Dropping the value quietly would let a
  --    caller believe it had corrected a guardian's details while the screen
  --    kept showing the account's — the two would disagree with nothing to say
  --    why. The refusal is also what makes the rule ASSERTABLE.
  v_linked := EXISTS (
    SELECT 1 FROM public.parent_student_links l
     WHERE l.student_id = p_student_id AND l.is_active
  );
  v_g_name    := nullif(pg_catalog.btrim(coalesce(p_guardian_name, '')), '');
  v_g_contact := nullif(pg_catalog.btrim(coalesce(p_guardian_contact, '')), '');
  IF v_linked AND (v_g_name IS NOT NULL OR v_g_contact IS NOT NULL) THEN
    o_reason := 'guardian_locked';
    RETURN;
  END IF;
  IF pg_catalog.length(coalesce(v_g_name, '')) > 120
     OR pg_catalog.length(coalesce(v_g_contact, '')) > 40 THEN
    o_reason := 'invalid_guardian';
    RETURN;
  END IF;
  IF p_date_of_birth IS NOT NULL
     AND (p_date_of_birth > pg_catalog.now()::date OR p_date_of_birth < DATE '1900-01-01') THEN
    o_reason := 'invalid_dob';
    RETURN;
  END IF;

  -- ⚠️ THE DATE OF BIRTH IS THE LEARNER'S OWN FACT, not the guardian's, so it
  --    is NOT under the link guard and stays editable throughout.
  -- ⚠️ THE RIGHT-HAND SIDES ARE UNQUALIFIED COLUMN NAMES, which in an UPDATE
  --    read the row's EXISTING values — that is what makes the linked case a
  --    genuine no-write rather than a rewrite of the same bytes.
  UPDATE public.students s
     SET date_of_birth    = p_date_of_birth,
         guardian_name    = CASE WHEN v_linked THEN guardian_name    ELSE v_g_name    END,
         guardian_contact = CASE WHEN v_linked THEN guardian_contact ELSE v_g_contact END,
         updated_at       = pg_catalog.now()
   WHERE s.id = p_student_id
     AND (s.date_of_birth IS DISTINCT FROM p_date_of_birth
          OR (NOT v_linked AND (s.guardian_name IS DISTINCT FROM v_g_name
                                OR s.guardian_contact IS DISTINCT FROM v_g_contact)));
  -- ⛔ `ROW_COUNT` IS AN INTEGER, NOT A BOOLEAN. Assigning it straight into a
  --    boolean is a runtime type error that `CREATE FUNCTION` would NOT catch —
  --    `plpgsql` defers that to first execution (§12, and `C14W-3` below is
  --    the leg that would have caught it).
  GET DIAGNOSTICS v_detail_rows = ROW_COUNT;
  v_details_chg := v_detail_rows > 0;

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
  IF o_name_changed OR o_added > 0 OR o_removed > 0 OR v_details_chg THEN
    -- ⛔ THE NAME REACHES NO LABEL OR PAYLOAD, old or new. `A-029` data
    --    minimization; `CLAUDE.md` §12 makes a child's name in an audit label
    --    a STOP-AND-ASK. What is recorded is THAT it changed.
    PERFORM public.audit_append_event(
      v_centre_id, v_account_id, v_membership_id, 'management',
      'admin.student_updated', NULL, NULL, NULL,
      'student', p_student_id, 'Student',
      NULL,
      -- ⛔ NO DATE OF BIRTH, GUARDIAN NAME OR CONTACT REACHES THE PAYLOAD.
      --    `A-029` data minimization, and `CLAUDE.md` §12 makes a child's or a
      --    guardian's identifying text in an audit label or payload a
      --    STOP-AND-ASK. What is recorded is THAT details changed.
      pg_catalog.jsonb_build_object(
        'name_changed', o_name_changed,
        'details_changed', v_details_chg,
        'enrolments_added', o_added,
        'enrolments_removed', o_removed)
    );
  END IF;

  o_reason := 'saved';
END;
$function$;

ALTER FUNCTION public.admin_update_student(uuid, text, text, uuid[], date, text, text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.admin_update_student(uuid, text, text, uuid[], date, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_update_student(uuid, text, text, uuid[], date, text, text) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- admin_create_parent: (text, text, uuid[])  ->  (text, text, uuid[], text)
-- ─────────────────────────────────────────────────────────────────────
DROP FUNCTION public.admin_create_parent(text, text, uuid[]);

CREATE FUNCTION public.admin_create_parent(p_display_name text, p_email text, p_student_ids uuid[], p_phone text, OUT o_membership_id uuid, OUT o_invitation_id uuid, OUT o_links integer, OUT o_reason text)
 RETURNS record
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  -- ⚠️ THE SAME 7-DAY LIFETIME `admin_create_trainer` uses, and the SAME open
  --    question: the value has never been ratified. It is a constant in ONE
  --    place per function rather than a magic number in a query.
  c_invitation_ttl CONSTANT interval := '7 days';

  v_account_id    uuid;
  v_membership_id uuid;
  v_centre_id     uuid;
  v_name          text;
  v_email         text;
  v_new_account   uuid;
  v_phone         text;
  v_ids           uuid[];
  v_student       uuid;
  v_link_id       uuid;
BEGIN
  o_membership_id := NULL;
  o_invitation_id := NULL;
  o_links         := 0;
  o_reason        := 'not_permitted';

  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  SELECT (pg_catalog.array_agg(m.id))[1], (pg_catalog.array_agg(m.centre_id))[1]
    INTO v_membership_id, v_centre_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.role = 'management' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN RETURN; END IF;

  v_name := pg_catalog.btrim(coalesce(p_display_name, ''));
  IF pg_catalog.length(v_name) = 0 OR pg_catalog.length(v_name) > 120 THEN
    o_reason := 'invalid_name';
    RETURN;
  END IF;

  -- ⚠️ NORMALIZED HERE, ONCE, so `accounts.normalized_email` and
  --    `invitations.email_normalized` cannot disagree about who was invited.
  --    ⚠️ `pg_catalog.strpos`, never `position(… IN …)` -- the latter is SQL
  --    GRAMMAR and cannot be schema-qualified under `search_path = ''`.
  v_email := pg_catalog.lower(pg_catalog.btrim(coalesce(p_email, '')));
  IF pg_catalog.length(v_email) < 3
     OR pg_catalog.strpos(v_email, '@') < 2
     OR pg_catalog.strpos(pg_catalog.split_part(v_email, '@', 2), '.') < 2
     OR v_email ~ '\s' THEN
    o_reason := 'invalid_email';
    RETURN;
  END IF;

  -- ⛔ AT LEAST ONE LINKED STUDENT. A parent account linked to no child can
  --    see nothing at all: `parent_student_links` is the ONLY thing that makes
  --    any report reachable for them. Creating one silently would produce a
  --    login that opens onto an empty portal.
  SELECT pg_catalog.array_agg(DISTINCT id) INTO v_ids
    FROM pg_catalog.unnest(coalesce(p_student_ids, ARRAY[]::uuid[])) AS t(id)
   WHERE id IS NOT NULL;
  IF v_ids IS NULL OR pg_catalog.array_length(v_ids, 1) IS NULL THEN
    o_reason := 'no_students';
    RETURN;
  END IF;

  -- ⛔ EVERY STUDENT MUST BE THIS CENTRE'S AND ACTIVE. Linking three of four
  --    and reporting success would be a lie the caller cannot see.
  IF EXISTS (
    SELECT 1 FROM pg_catalog.unnest(v_ids) AS t(id)
     WHERE NOT EXISTS (
       SELECT 1 FROM public.students s
        WHERE s.id = t.id AND s.centre_id = v_centre_id AND s.is_active
     )
  ) THEN
    o_reason := 'unknown_student';
    RETURN;
  END IF;

  -- ⛔ AN EXISTING ACTIVE ACCOUNT IS A REFUSAL, NOT A SECOND IDENTITY
  --    (`A-027`). One centre (`A-015`), so a duplicate can only mean this
  --    person already exists here.
  IF EXISTS (
    SELECT 1 FROM public.accounts a WHERE a.normalized_email = v_email AND a.status = 'active'
  ) THEN
    o_reason := 'email_in_use';
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.invitations i
     WHERE i.centre_id = v_centre_id AND i.email_normalized = v_email AND i.status = 'pending'
  ) THEN
    o_reason := 'invitation_pending';
    RETURN;
  END IF;

  -- ⚠️ BLANK BECOMES NULL, NEVER ''. A phone is optional; an empty string
  --    would render as a recorded-but-empty contact.
  v_phone := nullif(pg_catalog.btrim(coalesce(p_phone, '')), '');
  IF pg_catalog.length(coalesce(v_phone, '')) > 40 THEN
    o_reason := 'invalid_phone';
    RETURN;
  END IF;

  -- ── The rows. ONE transaction.
  -- ⛔ `auth_user_id` NULL. A profile is not a login (`A-020`).
  -- ⛔ THE PHONE IS A CONTACT DETAIL, NEVER A CREDENTIAL and never an
  --    authentication factor (`A-027`) — no sign-in path reads it.
  INSERT INTO public.accounts (display_name, normalized_email, phone)
  VALUES (v_name, v_email, v_phone)
  RETURNING id INTO v_new_account;

  -- ⛔ `pending`, NOT `active`. Activation is the RECIPIENT's act.
  INSERT INTO public.centre_memberships (account_id, centre_id, role, status)
  VALUES (v_new_account, v_centre_id, 'parent', 'pending')
  RETURNING id INTO o_membership_id;

  INSERT INTO public.parent_profiles (membership_id, centre_id, membership_role)
  VALUES (o_membership_id, v_centre_id, 'parent');

  INSERT INTO public.invitations
    (centre_id, membership_id, invited_by_membership_id, invited_by_role,
     email_normalized, status, expires_at)
  VALUES
    (v_centre_id, o_membership_id, v_membership_id, 'management',
     v_email, 'pending', pg_catalog.now() + c_invitation_ttl)
  RETURNING id INTO o_invitation_id;

  -- ⛔ NEITHER THE NAME NOR THE EMAIL REACHES ANY LABEL OR PAYLOAD (`A-029`
  --    data minimization; `CLAUDE.md` §12 makes an account name or email in an
  --    audit label a STOP-AND-ASK). Labels are TYPE labels.
  PERFORM public.audit_append_event(
    v_centre_id, v_account_id, v_membership_id, 'management',
    'admin.profile_created', NULL, NULL, NULL,
    'centre_membership', o_membership_id, 'Parent membership',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'target_type', 'account', 'target_id', v_new_account::text, 'target_label', 'Account')
    ),
    pg_catalog.jsonb_build_object('membership_role', 'parent', 'membership_status', 'pending')
  );

  PERFORM public.audit_append_event(
    v_centre_id, v_account_id, v_membership_id, 'management',
    'invitation.created', NULL, NULL, NULL,
    'invitation', o_invitation_id, 'Invitation',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'target_type', 'centre_membership', 'target_id', o_membership_id::text,
        'target_label', 'Parent membership')
    ),
    -- ⚠️ THE TTL, NOT THE ADDRESS.
    pg_catalog.jsonb_build_object('ttl', c_invitation_ttl::text)
  );

  FOREACH v_student IN ARRAY v_ids LOOP
    -- ⚠️ `parent_role` IS WRITTEN AS THE LITERAL `'parent'` -- it is the
    --    composite-FK component, NOT the frame's `Relationship` field. See
    --    the header.
    INSERT INTO public.parent_student_links
      (centre_id, parent_membership_id, parent_role, student_id)
    VALUES (v_centre_id, o_membership_id, 'parent', v_student)
    RETURNING id INTO v_link_id;

    -- ⛔ ONE EVENT PER LINK. Each link is separately revocable, and `A-029`'s
    --    correction-by-new-event needs a prior event per child to correct.
    PERFORM public.audit_append_event(
      v_centre_id, v_account_id, v_membership_id, 'management',
      'admin.parent_link_changed', NULL, NULL, NULL,
      'parent_student_link', v_link_id, 'Parent-student link',
      pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object(
          'target_type', 'centre_membership', 'target_id', o_membership_id::text,
          'target_label', 'Parent membership'),
        pg_catalog.jsonb_build_object(
          'target_type', 'student', 'target_id', v_student::text, 'target_label', 'Student')
      ),
      pg_catalog.jsonb_build_object('change', 'linked')
    );

    o_links := o_links + 1;
  END LOOP;

  o_reason := 'created';
END;
$function$;

ALTER FUNCTION public.admin_create_parent(text, text, uuid[], text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.admin_create_parent(text, text, uuid[], text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_create_parent(text, text, uuid[], text) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────
-- admin_create_trainer: (text, text)  ->  (text, text, text)
-- ─────────────────────────────────────────────────────────────────────
DROP FUNCTION public.admin_create_trainer(text, text);

CREATE FUNCTION public.admin_create_trainer(p_display_name text, p_email text, p_phone text, OUT o_membership_id uuid, OUT o_invitation_id uuid, OUT o_reason text)
 RETURNS record
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  -- ⚠️ THE ONE PLACE THE INVITATION LIFETIME LIVES. No instrument names a
  --    duration (`A-027` makes expiry a mechanism, not a value), so 7 days is
  --    this build's DISCLOSED default and a ruling changes exactly this line.
  c_invitation_ttl CONSTANT interval := '7 days';

  v_account_id    uuid;
  v_membership_id uuid;
  v_centre_id     uuid;
  v_name          text;
  v_email         text;
  v_new_account   uuid;
  v_phone         text;
BEGIN
  -- ⛔ FAIL CLOSED FIRST. Every early return leaves both ids NULL and the
  --    reason `not_permitted`, so a refusal is never mistaken for a creation
  --    that produced nothing (`Q-7`: a refusal is not an empty result).
  o_membership_id := NULL;
  o_invitation_id := NULL;
  o_reason        := 'not_permitted';

  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  -- ⛔ AUTHORIZATION IS RE-RESOLVED LIVE, never taken from a claim (`ADR-4`).
  --    `HAVING count(*) = 1` is deliberate: an account holding two active
  --    management memberships is an ambiguity, and this refuses rather than
  --    picking one.
  SELECT (pg_catalog.array_agg(m.id))[1], (pg_catalog.array_agg(m.centre_id))[1]
    INTO v_membership_id, v_centre_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.role = 'management' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN RETURN; END IF;

  -- ── Validation. Authorization has already succeeded, so from here a reason
  --    is a diagnostic for someone the database proved is active management.
  --
  -- ⛔ `coalesce` AND `position(… IN …)` ARE BOTH SQL GRAMMAR AND NEITHER MAY
  --    BE SCHEMA-QUALIFIED. `btrim`, `lower`, `length`, `strpos` and
  --    `split_part` are ordinary functions and stay qualified, because under
  --    `search_path = ''` an unqualified one would not resolve at all. ▶ The
  --    two categories look identical in source and behave oppositely.
  v_name := pg_catalog.btrim(coalesce(p_display_name, ''));
  IF pg_catalog.length(v_name) = 0 OR pg_catalog.length(v_name) > 120 THEN
    o_reason := 'invalid_name';
    RETURN;
  END IF;

  -- ⚠️ NORMALIZED HERE, ONCE. Both `accounts_normalized_email_chk` and
  --    `invitations_email_normalized_chk` require lower(btrim(...)) with an
  --    `@` past position 1. Normalizing in the function means the two rows
  --    cannot disagree about which address was invited.
  v_email := pg_catalog.lower(pg_catalog.btrim(coalesce(p_email, '')));
  IF pg_catalog.length(v_email) < 3
     OR pg_catalog.strpos(v_email, '@') < 2
     OR pg_catalog.strpos(pg_catalog.split_part(v_email, '@', 2), '.') < 2
     OR v_email ~ '\s' THEN
    o_reason := 'invalid_email';
    RETURN;
  END IF;

  -- ⛔ AN EXISTING ACTIVE ACCOUNT IS A REFUSAL, NOT A SECOND IDENTITY.
  --    `A-027`: an existing account is REUSED when the same person is invited
  --    to a later centre — never a second identity. ▶ This MVP is ONE centre
  --    (`A-015`), so "a later centre" cannot arise and the only meaning a
  --    duplicate can have is that this person already exists here.
  --    `accounts_one_active_per_normalized_email_idx` would refuse it anyway;
  --    this turns a raised unique violation into a governed reason.
  IF EXISTS (
    SELECT 1 FROM public.accounts a
     WHERE a.normalized_email = v_email AND a.status = 'active'
  ) THEN
    o_reason := 'email_in_use';
    RETURN;
  END IF;

  -- ⛔ A PENDING INVITATION MUST BE REVOKED OR SUPERSEDED FIRST (`A-027`).
  --    ⚠️ Unreachable while the check above stands, and kept anyway: the two
  --    rules protect different things, and a later ruling permitting account
  --    reuse would leave this one carrying the whole weight.
  IF EXISTS (
    SELECT 1 FROM public.invitations i
     WHERE i.centre_id = v_centre_id AND i.email_normalized = v_email
       AND i.status = 'pending'
  ) THEN
    o_reason := 'invitation_pending';
    RETURN;
  END IF;

  v_phone := nullif(pg_catalog.btrim(coalesce(p_phone, '')), '');
  IF pg_catalog.length(coalesce(v_phone, '')) > 40 THEN
    o_reason := 'invalid_phone';
    RETURN;
  END IF;

  -- ── The four rows. ONE governed action, one transaction.
  --
  -- ⛔ The Auth linkage column is left UNWRITTEN — a profile is not a login
  --    (`A-020`/`A-025`), and no credential of any kind is stored (`A-027`).
  -- ⚠️ BLANK BECOMES NULL, NEVER ''.
  -- ⛔ A CONTACT DETAIL, NEVER A CREDENTIAL (`A-027`).
  INSERT INTO public.accounts (display_name, normalized_email, phone)
  VALUES (v_name, v_email, v_phone)
  RETURNING id INTO v_new_account;

  -- ⛔ `pending`, NOT `active`. `centre_memberships_pending_chk` also requires
  --    `activated_at` and `deactivated_at` to stay NULL, which the defaults
  --    give. Activation is the RECIPIENT's act, never management's.
  INSERT INTO public.centre_memberships (account_id, centre_id, role, status)
  VALUES (v_new_account, v_centre_id, 'trainer', 'pending')
  RETURNING id INTO o_membership_id;

  -- ⚠️ `membership_role` is pinned by `trainer_profiles_role_pinned_chk` and by
  --    the composite FK; writing it is what lets that FK verify the membership
  --    really is a trainer of this centre.
  INSERT INTO public.trainer_profiles (membership_id, centre_id, membership_role)
  VALUES (o_membership_id, v_centre_id, 'trainer');

  INSERT INTO public.invitations
    (centre_id, membership_id, invited_by_membership_id, invited_by_role,
     email_normalized, status, expires_at)
  VALUES
    (v_centre_id, o_membership_id, v_membership_id, 'management',
     v_email, 'pending', pg_catalog.now() + c_invitation_ttl)
  RETURNING id INTO o_invitation_id;

  -- ── Audit. TWO events, because there are TWO governed actions (`A-029`
  --    counts ACTIONS): a profile came into existence, and an invitation was
  --    issued against it. Collapsing them would lose the second — the one that
  --    has an expiry and can be revoked or reissued.
  --
  -- ⛔ NEITHER THE NAME NOR THE EMAIL APPEARS IN ANY LABEL OR PAYLOAD.
  --    `A-029` data minimization, and `CLAUDE.md` §12 makes putting an account
  --    name or email into an audit label or payload a STOP-AND-ASK. The labels
  --    are TYPE labels; the identity is recoverable by id, from a row that is
  --    itself access-controlled.
  PERFORM public.audit_append_event(
    v_centre_id, v_account_id, v_membership_id, 'management',
    'admin.profile_created', NULL, NULL, NULL,
    'centre_membership', o_membership_id, 'Trainer membership',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'target_type', 'account', 'target_id', v_new_account::text,
        'target_label', 'Account')
    ),
    pg_catalog.jsonb_build_object('membership_role', 'trainer', 'membership_status', 'pending')
  );

  PERFORM public.audit_append_event(
    v_centre_id, v_account_id, v_membership_id, 'management',
    'invitation.created', NULL, NULL, NULL,
    'invitation', o_invitation_id, 'Invitation',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'target_type', 'centre_membership', 'target_id', o_membership_id::text,
        'target_label', 'Trainer membership')
    ),
    -- ⚠️ THE TTL, NOT THE ADDRESS. How long the invitation lives is governance;
    --    who it went to would be the disclosure §12 bars.
    pg_catalog.jsonb_build_object('ttl', c_invitation_ttl::text)
  );

  o_reason := 'created';
END;
$function$;

ALTER FUNCTION public.admin_create_trainer(text, text, text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.admin_create_trainer(text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_create_trainer(text, text, text) TO authenticated;


-- ⛔ THE GRANT SET, AS AN EXACT SET — NOT A PRESENCE CHECK (after every DROP + CREATE + GRANT).
-- Operator instruction: *"assert the pinned exact set postgres:EXECUTE,
-- authenticated:EXECUTE before and after, as an exact set, not a presence
-- check."* ▶ A presence check passes while an EXTRA grantee sits beside the
-- expected one, which is exactly how a DROP + CREATE widens a privilege: a new
-- function grants EXECUTE to PUBLIC by default, and `REVOKE ALL FROM PUBLIC`
-- is the only thing that takes it away.
DO $ASSERT$
DECLARE
  r record;
  v_acl text;
BEGIN
  FOR r IN SELECT unnest(ARRAY['admin_create_student','admin_update_student','admin_create_parent','admin_create_trainer']) AS fn
  LOOP
    SELECT pg_catalog.string_agg(g.grantee || ':' || g.priv, ', ' ORDER BY g.grantee, g.priv)
      INTO v_acl
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      CROSS JOIN LATERAL pg_catalog.aclexplode(p.proacl) x
      CROSS JOIN LATERAL (SELECT pg_catalog.pg_get_userbyid(x.grantee) AS grantee, x.privilege_type AS priv) g
     WHERE n.nspname = 'public' AND p.proname = r.fn;

    IF v_acl IS DISTINCT FROM 'authenticated:EXECUTE, postgres:EXECUTE' THEN
      RAISE EXCEPTION 'C14W-POST grant set AFTER: % holds [%], expected exactly [authenticated:EXECUTE, postgres:EXECUTE]', r.fn, coalesce(v_acl, '(none)');
    END IF;
  END LOOP;
  RAISE NOTICE 'PASS C14W-POST grant set AFTER: all four hold exactly [authenticated:EXECUTE, postgres:EXECUTE]';
END
$ASSERT$;

-- ⛔ THE OLD SIGNATURES MUST BE GONE, not merely shadowed. An overload left
--    behind would keep the old body reachable and the whole DROP pointless.
DO $ASSERT$
DECLARE v_n integer;
BEGIN
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname IN ('admin_create_student','admin_update_student','admin_create_parent','admin_create_trainer');
  IF v_n <> 4 THEN
    RAISE EXCEPTION 'C14W-1: expected exactly 4 admin write functions, found % — an OVERLOAD survived the DROP', v_n;
  END IF;
  RAISE NOTICE 'PASS C14W-1: exactly 4, no overload survived';
END
$ASSERT$;

-- ⛔ EACH NEW SIGNATURE EXISTS WITH ITS EXACT INPUT LIST.
DO $ASSERT$
DECLARE
  r record;
  v_args text;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    ('admin_create_student', 'p_first_name text, p_last_name text, p_class_module_ids uuid[], p_date_of_birth date, p_guardian_name text, p_guardian_contact text'),
    ('admin_update_student', 'p_student_id uuid, p_first_name text, p_last_name text, p_class_module_ids uuid[], p_date_of_birth date, p_guardian_name text, p_guardian_contact text'),
    ('admin_create_parent',  'p_display_name text, p_email text, p_student_ids uuid[], p_phone text'),
    ('admin_create_trainer', 'p_display_name text, p_email text, p_phone text')
  ) AS t(fn, expected)
  LOOP
    SELECT pg_catalog.string_agg(a.arg, ', ' ORDER BY a.ord) INTO v_args
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      CROSS JOIN LATERAL pg_catalog.regexp_split_to_table(pg_catalog.pg_get_function_arguments(p.oid), ', ')
             WITH ORDINALITY AS a(arg, ord)
     WHERE n.nspname = 'public' AND p.proname = r.fn AND a.arg NOT LIKE 'OUT %';
    IF v_args IS DISTINCT FROM r.expected THEN
      RAISE EXCEPTION 'C14W-2: %(...) takes [%], expected [%]', r.fn, coalesce(v_args, '(none)'), r.expected;
    END IF;
  END LOOP;
  RAISE NOTICE 'PASS C14W-2: all four input lists are exactly as authorized';
END
$ASSERT$;

-- ⛔ EACH FUNCTION MUST ACTUALLY RUN — §12's standing rule: *"a migration that
--    verifies its own shape has not verified that it works."* `plpgsql` defers
--    name resolution to FIRST EXECUTION, so every assertion above can be true
--    of a body that raises on its first statement.
-- ▶ A REFUSAL IS THE IDEAL CALL: it traverses the body and writes nothing.
--    `app_current_account_id()` is NULL for `postgres` here, so each returns
--    its fail-closed `not_permitted`.
DO $ASSERT$
DECLARE v text;
BEGIN
  SELECT o_reason INTO v FROM public.admin_create_student('A', 'B', ARRAY[]::uuid[], NULL, NULL, NULL);
  IF v <> 'not_permitted' THEN RAISE EXCEPTION 'C14W-3a: admin_create_student returned %', v; END IF;

  SELECT o_reason INTO v FROM public.admin_update_student(pg_catalog.gen_random_uuid(), 'A', 'B', ARRAY[]::uuid[], NULL, NULL, NULL);
  IF v <> 'not_permitted' THEN RAISE EXCEPTION 'C14W-3b: admin_update_student returned %', v; END IF;

  SELECT o_reason INTO v FROM public.admin_create_parent('A', 'a@b.co', ARRAY[]::uuid[], NULL);
  IF v <> 'not_permitted' THEN RAISE EXCEPTION 'C14W-3c: admin_create_parent returned %', v; END IF;

  SELECT o_reason INTO v FROM public.admin_create_trainer('A', 'a@b.co', NULL);
  IF v <> 'not_permitted' THEN RAISE EXCEPTION 'C14W-3d: admin_create_trainer returned %', v; END IF;

  RAISE NOTICE 'PASS C14W-3: all four EXECUTED and refused fail-closed';
END
$ASSERT$;

-- ⛔ THE CENSUS IS UNMOVED. This migration is authorized to change signatures
--    and nothing else.
DO $ASSERT$
DECLARE v_t integer; v_e integer; v_p integer; v_r integer;
BEGIN
  SELECT pg_catalog.count(*) INTO v_t FROM pg_tables WHERE schemaname = 'public';
  SELECT pg_catalog.count(DISTINCT t.typname) INTO v_e
    FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname = 'public' AND t.typtype = 'e';
  SELECT pg_catalog.count(*) INTO v_p FROM pg_policies WHERE schemaname = 'public';
  SELECT pg_catalog.array_length(public.audit_action_registry(), 1) INTO v_r;
  IF v_t <> 30 OR v_e <> 12 OR v_p <> 30 OR v_r <> 24 THEN
    RAISE EXCEPTION 'C14W-4: census moved — tables=% enums=% policies=% registry=% (expected 30/12/30/24)', v_t, v_e, v_p, v_r;
  END IF;
  RAISE NOTICE 'PASS C14W-4: census UNMOVED at tables=30 enums=12 policies=30 registry=24';
END
$ASSERT$;
