-- =====================================================================
-- PORTAL PHASE P2-13 -- screen `21` Create Parent Account.
-- =====================================================================
-- ⛔ WHAT THIS FILE ADDS, NAMED NOT COUNTED:
--      · function  public.admin_create_parent(text, text, uuid[])
--      · grant     EXECUTE ON that function TO authenticated
--    NOTHING ELSE. No table, column, enum, policy, client table grant.
--
-- ⛔ ZERO NEW AUDIT STRINGS. `admin.profile_created`, `invitation.created` and
--    `admin.parent_link_changed` are ALL already in the ratified 23. `A-029`:
--    a second name for an action that has one is a §12 stop-and-ask.
--    `PN-6` measures the registry unmoved at 23.
--
-- ---------------------------------------------------------------------
-- ⛔ THE FRAME'S `Relationship` FIELD, AND THE DECOY BENEATH IT
-- ---------------------------------------------------------------------
--   Screen `21` draws **`Relationship: Mother`**. There is no column for it:
--   it would be one enum plus one column on `parent_student_links`, and the
--   VOCABULARY is a product decision nobody has taken.
--
--   ⚠️ AND `parent_student_links.parent_role` IS THE DECOY THAT LOOKS LIKE
--   THE ANSWER -- entry 1 of the living register (plan §37.1). Its name reads
--   exactly like the field; its `CHECK` pins it to the literal `'parent'`,
--   because it is a COMPOSITE-FK COMPONENT that lets the database assert
--   *"this membership really is a parent of this centre"*. ▶ Writing `Mother`
--   into it FAILS THE CHECK. The register was consulted before this function
--   was written, which is what it exists for.
--
-- ---------------------------------------------------------------------
-- ⛔ AND THE `Send email invite` TOGGLE IS NOT A PARAMETER
-- ---------------------------------------------------------------------
--   The frame draws a switch, defaulted on, captioned *"Parent gets a link to
--   set their password and sign in."* **External delivery is deferred**, so
--   nothing sends either way. ▶ A toggle offering a choice between two
--   outcomes that are identical is a control that lies about what it does --
--   and defaulted ON it also asserts a link WAS sent. The invitation row is
--   always created; the screen says plainly that nothing has left the system.
-- =====================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.admin_create_parent(
  p_display_name text,
  p_email        text,
  p_student_ids  uuid[],
  OUT o_membership_id uuid,
  OUT o_invitation_id uuid,
  OUT o_links         integer,
  OUT o_reason        text
)
RETURNS record
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $fn$
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

  -- ── The rows. ONE transaction.
  -- ⛔ `auth_user_id` NULL. A profile is not a login (`A-020`).
  INSERT INTO public.accounts (display_name, normalized_email)
  VALUES (v_name, v_email)
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
$fn$;

REVOKE ALL ON FUNCTION public.admin_create_parent(text, text, uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_create_parent(text, text, uuid[]) TO authenticated;

-- =====================================================================
-- APPLY-TIME ASSERTIONS
-- =====================================================================
DO $assert$
DECLARE
  v_count integer;
  v_text  text;
  v_body  text;
  v_rec   record;
BEGIN
  SELECT pg_catalog.count(*) INTO v_count
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'admin_create_parent'
     AND p.prosecdef AND p.provolatile = 'v' AND p.proconfig @> ARRAY['search_path=""'];
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'PN-1 FAILED: posture, found %', v_count;
  END IF;
  RAISE NOTICE 'PN-1 PASS  SECURITY DEFINER + VOLATILE + search_path = '''' ';

  SELECT pg_catalog.count(*) INTO v_count
    FROM information_schema.role_routine_grants g
   WHERE g.routine_schema = 'public' AND g.routine_name = 'admin_create_parent' AND g.grantee <> 'postgres';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'PN-2 FAILED: expected 1 non-owner grant, found %', v_count;
  END IF;
  RAISE NOTICE 'PN-2 PASS  one EXECUTE grant';

  /*
   * ⚠️ COMMENTS ARE STRIPPED BEFORE ANY PROHIBITION IS SCANNED, and the first
   * draft did not strip them: `PN-3` fired on THIS FILE'S OWN COMMENT
   * explaining that the `Relationship` field is not built. ▶ FIFTH INSTANCE of
   * `PC16-8d`'s family (plan §42) -- a check reading the text that DOCUMENTS a
   * prohibition as a BREACH of it -- and the first inside a migration's own
   * assertion block rather than a JavaScript suite.
   *
   * ⛔ `v_body` is the CODE. `v_text` keeps the raw source, so a later leg that
   * legitimately wants the comments still has them.
   */
  SELECT p.prosrc INTO v_text
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'admin_create_parent' AND p.prokind = 'f';
  v_body := pg_catalog.regexp_replace(
              pg_catalog.regexp_replace(v_text, '/\*.*?\*/', ' ', 'gs'),
              '--[^\n]*', ' ', 'g');
  IF pg_catalog.length(v_body) >= pg_catalog.length(v_text) THEN
    RAISE EXCEPTION 'PN-3 FAILED: the comment stripper removed NOTHING, so every scan below is a scan of the comments too';
  END IF;

  -- PN-3: ⛔ `parent_role` IS WRITTEN AS THE PINNED LITERAL, NEVER FROM A
  -- PARAMETER. The decoy check, in the migration itself.
  IF v_body !~ '''parent'', v_student' THEN
    RAISE EXCEPTION 'PN-3 FAILED: parent_role is not written as the pinned literal';
  END IF;
  IF v_body ~* '\mrelationship\M|\mmother\M|\mfather\M|\mguardian_type\M' THEN
    RAISE EXCEPTION 'PN-3 FAILED: the body names the unbuilt Relationship field';
  END IF;
  RAISE NOTICE 'PN-3 PASS  parent_role written as the pinned composite-FK literal; no Relationship field';

  -- PN-4: ⛔ NO `phone`, NO `send_invite` PARAMETER.
  IF v_body ~* '\mphone\M|\msend_invite\M|\msend_email\M' THEN
    RAISE EXCEPTION 'PN-4 FAILED: the body names phone or an invite toggle';
  END IF;
  RAISE NOTICE 'PN-4 PASS  no phone column, no invite toggle -- an unsendable choice is not a parameter';

  -- PN-5: ⛔ NO IDENTIFYING TEXT IN A LABEL OR PAYLOAD, and NON-VACUOUS.
  IF v_body ~* 'jsonb_build_object\s*\(\s*''(name|display_name|email)''' THEN
    RAISE EXCEPTION 'PN-5 FAILED: an audit payload carries identifying text';
  END IF;
  IF v_body !~ 'v_email' OR v_text !~ 'v_name' THEN
    RAISE EXCEPTION 'PN-5 FAILED: name/email variables absent, so this assertion is vacuous';
  END IF;
  RAISE NOTICE 'PN-5 PASS  name and email exist in the body and reach no label or payload';

  -- PN-6: census UNMOVED, and all THREE emitted strings already ratified.
  SELECT (SELECT pg_catalog.count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE')::text
      || '|' || (SELECT pg_catalog.count(DISTINCT t.typname) FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public' AND t.typtype = 'e')::text
      || '|' || (SELECT pg_catalog.count(*) FROM pg_catalog.pg_policies WHERE schemaname = 'public')::text
      || '|' || (SELECT pg_catalog.array_length(public.audit_action_registry(), 1))::text
    INTO v_text;
  IF v_text <> '30|12|30|23' THEN
    RAISE EXCEPTION 'PN-6 FAILED: census moved to %', v_text;
  END IF;
  IF NOT (public.audit_action_registry() @> ARRAY['admin.profile_created', 'invitation.created', 'admin.parent_link_changed']) THEN
    RAISE EXCEPTION 'PN-6 FAILED: an emitted string is not in the registry';
  END IF;
  RAISE NOTICE 'PN-6 PASS  census unmoved at % and all THREE emitted strings were already ratified', v_text;

  -- PN-7: ⚠️ EXECUTE IT, ON THE REFUSAL PATH -- GATE 1 ONLY (§26.1's ceiling).
  SELECT * INTO v_rec FROM public.admin_create_parent('x', 'x@y.co', ARRAY[]::uuid[]);
  IF v_rec.o_reason <> 'not_permitted' OR v_rec.o_membership_id IS NOT NULL THEN
    RAISE EXCEPTION 'PN-7 FAILED: owner probe returned %', v_rec.o_reason;
  END IF;
  SELECT pg_catalog.count(*) INTO v_count FROM public.accounts;
  IF v_count <> 3 THEN
    RAISE EXCEPTION 'PN-7 FAILED: accounts moved to % (expected 3)', v_count;
  END IF;
  RAISE NOTICE 'PN-7 PASS  executed as owner -> not_permitted, accounts still 3 -- ⚠️ GATE 1 ONLY; the suite reaches the rest';
END;
$assert$;

COMMIT;
