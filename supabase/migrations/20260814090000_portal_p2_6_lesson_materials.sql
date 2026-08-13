-- =====================================================================
-- PORTAL PHASE P2-6 -- screen `14` Management Lesson Plan Management.
-- `D-4` lesson materials: Management uploads, Trainers download.
-- =====================================================================
-- Authorized by the Operator on 2026-08-13/14, with every count STATED IN
-- ADVANCE and approved before this file was written:
--
--     "SCHEMA AUTHORIZED as stated, plus removal: 1 table
--      class_session_materials, 1 bucket lesson-materials, 1 storage INSERT
--      policy, 0 table policies, 0 client table grants, SECURITY DEFINER
--      RPCs only, 0 enums, registry 21 -> 23."
--
-- ⚠️ AND THE AUTHORIZATION WAS CONDITIONAL: *"Re-measure at HEAD now that
--    Docker is up, before writing any migration. If anything differs from
--    §13, stop and tell me."* ▶ Re-measured 2026-08-14 after the stack came
--    back: census `30|29|56|12|30|21`, table ABSENT, one bucket, one storage
--    policy, registry 21 with no `material.*`, no `key_focus` column.
--    NOTHING DIFFERED. The condition is satisfied.
--
-- ---------------------------------------------------------------------
-- ⛔ THE REGISTRY EXTENSION -- EXACTLY TWO STRINGS, 21 -> 23
-- ---------------------------------------------------------------------
--   `material.attached` -- a governed Management upload has become an
--                          accepted lesson-material row.
--   `material.removed`  -- a governed Management removal succeeded.
--
-- ⚠️ `material.attached` FOLLOWS `evidence.attached`'s RATIFIED REASONING
--    (`C-4`): no authorized workflow leaves an object unattached, so the
--    upload IS the attach, and `A-029`'s one-event-per-action rule forbids a
--    second name for one action. ⛔ Do not introduce `material.uploaded`.
--
-- ⛔ THERE IS DELIBERATELY NO `material.accessed`, AND THE OPERATOR RULED THE
--    REASON: *"Your `P2-4` precedent decides it. `evidence.accessed` fires
--    because the object is a child's video and the mint is the only trace it
--    existed. A slide deck is teaching material -- no child's data, no
--    privacy surface -- and `A-029` holds that a read is not a governed
--    action."* ▶ A download here emits NOTHING, by ruling, not by omission.
--
-- ⛔ REMOVAL IS AN OPERATOR ADDITION THE FRAME DOES NOT DRAW, on the same
--    grounds as the back affordance on `13`/`26`/`27`. Recorded so a later
--    visual pass does not remove it for fidelity. The Operator's reasoning,
--    because it decides the clause: *"The `27` day-strip discipline protects
--    against destroying GOVERNED RECORDS -- removing a session discards
--    attendance, observations and reports. A lesson slide deck is none of
--    those. And a file nobody can remove is a worse outcome than an undrawn
--    control, which is the same reasoning that made `D-5`'s evidence
--    removable."*
--
-- ---------------------------------------------------------------------
-- ⛔ WHAT THIS PHASE REFUSES -- and the refusals are the valuable half
-- ---------------------------------------------------------------------
-- * NO `class_sessions.key_focus`, and NO KEY FOCUS chips. RAISED BY THIS
--   PHASE AND DECLINED BY THE OPERATOR: *"`D-4` gave them a purpose and a
--   position constraint and never named an author. There is no authoring
--   surface in the ratified inventory and the frame draws them read-only.
--   Building a read for a field nobody can write produces a permanently
--   empty panel -- worse than absent."* ⛔ RECORDED AS DECLINED WITH THE
--   REASON so a later phase does not read `D-4`'s mention as licence. If the
--   academy later names an author it returns as ITS OWN question with ITS
--   OWN schema authorization.
--   ⛔ `observations.focus_chips` IS NOT THIS FIELD and must not be reused
--   for it -- that is the trainer's POST-session observation; KEY FOCUS is
--   lesson-plan INTENT (`G-3`), and conflating them is the invisible
--   substitution `D-4`'s position constraint exists to prevent.
-- * NO module description column. The frame's `6-week persuasive speaking
--   unit` is the `C-14` family (`Class code`, `Capacity`, `Program`) and
--   `A-022` bars schema'ing a field from a frame.
-- * NO enum. NO client grant on the new table. NO write policy anywhere.
--
-- ---------------------------------------------------------------------
-- ⛔ THE BUCKET ROW -- BOTH FIELDS RULED, NEITHER CHOSEN HERE
-- ---------------------------------------------------------------------
-- `file_size_limit = 26214400` (25 MiB). The Operator's DECIDING GROUND is
-- recorded beside the number so a later phase asked to raise it must argue
-- against THAT rather than a bare figure: *"a limit that admits video makes
-- the media-class separation depend on who uploads what, when the separation
-- exists precisely so it does not."* ▶ THE CEILING IS NOT A CAPACITY
-- ESTIMATE. It is the mechanism keeping `evidence` and `lesson-materials`
-- distinct media classes (Authority Lock §8.2).
--
-- `allowed_mime_types` -- EIGHT TYPES, WIDER THAN THE FRAME DRAWS, and that
-- is an OPERATOR RULING rather than drift: *"a trainer preparing a class will
-- have a Word handout or a photo of a worksheet."* ⛔ A LATER PHASE MUST NOT
-- NARROW IT BACK TO THE FRAME'S THREE -- the frame is a static render of the
-- three files someone happened to upload, NOT an inventory of permitted
-- types.
-- ⚠️ Still narrow where it matters: NO `video/*`, NO `audio/*`, NO archive.
--    That is the half §8.2 needs, and it is what keeps the separation at the
--    bucket row rather than by convention.
-- ⚠️ `image/png` and `image/jpeg` here are TEACHING MATERIAL keyed to a CLASS
--    SESSION, never to a person. They are NOT the §8.2 student-photo class,
--    which is PDPA-live and remains unbuilt and unauthorized.
--
-- ⚠️ TRANSACTIONAL. `supabase migration up` applies it in one transaction;
--    every assertion below aborts the whole file.
-- =====================================================================

-- ===========================================================================
-- 1 . The registry, 21 -> 23. ONE declaration site (P1-2 consolidated it).
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
    -- approved before this migration was written.
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
    'material.removed'
  ];
$function$;

-- ===========================================================================
-- 2 . The table. ZERO policies and ZERO client grants, exactly like
--     `report_evidence` -- every read and write goes through a reviewed
--     SECURITY DEFINER RPC.
-- ===========================================================================
CREATE TABLE public.class_session_materials (
  id                        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  class_session_id          uuid        NOT NULL,
  centre_id                 uuid        NOT NULL,
  storage_object_path       text        NOT NULL,
  -- The frame draws `Lesson 1 – Intro to Persuasion`, which is NOT the file
  -- name. Carried as its own column so a rename never touches storage.
  display_name              text        NOT NULL,
  media_type                text        NOT NULL,
  byte_size                 bigint      NOT NULL,
  uploaded_by_account_id    uuid        NOT NULL,
  uploaded_by_membership_id uuid        NOT NULL,
  created_at                timestamptz NOT NULL DEFAULT now(),

  -- ⚠️ THE COMPOSITE FORM MAKES CENTRE DRIFT UNREPRESENTABLE rather than
  -- merely checked. `class_sessions_id_centre_key` has existed since Step 7E
  -- -- measured at HEAD, so this needs no new object.
  CONSTRAINT class_session_materials_session_fk
    FOREIGN KEY (class_session_id, centre_id)
    REFERENCES public.class_sessions (id, centre_id) ON DELETE RESTRICT,

  -- ⛔ DELIBERATELY NOT UNIQUE ON `class_session_id`. `report_evidence` is
  --    one-per-report by ratified constraint; MATERIALS ARE MANY-PER-SESSION,
  --    because the frame itself draws TWO files on Lesson 3 (`Vocal Warm-ups`
  --    and `Lesson 3 – Projection`). The divergence is the frame's own and
  --    the Operator accepted it explicitly.
  CONSTRAINT class_session_materials_object_key UNIQUE (storage_object_path),

  -- Durable actor FKs (A-029). RESTRICT: accounts and memberships are never
  -- physically deleted, so this is attribution that cannot rot.
  CONSTRAINT class_session_materials_account_fk
    FOREIGN KEY (uploaded_by_account_id)
    REFERENCES public.accounts (id) ON DELETE RESTRICT,
  CONSTRAINT class_session_materials_membership_fk
    FOREIGN KEY (uploaded_by_membership_id, centre_id)
    REFERENCES public.centre_memberships (id, centre_id) ON DELETE RESTRICT,

  -- 25 MiB, the ruled ceiling. Enforced HERE as well as on the bucket row so
  -- a row can never record a size the bucket would have refused.
  CONSTRAINT class_session_materials_size_check
    CHECK (byte_size > 0 AND byte_size <= 26214400),
  CONSTRAINT class_session_materials_name_check
    CHECK (pg_catalog.length(pg_catalog.btrim(display_name)) BETWEEN 1 AND 200)
);

CREATE INDEX class_session_materials_session_idx
  ON public.class_session_materials (class_session_id, created_at);

ALTER TABLE public.class_session_materials ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.class_session_materials IS
  'D-4 lesson materials, keyed to ONE class session. Management uploads, '
  'trainers download. ZERO policies and ZERO client grants by design: every '
  'path is a reviewed SECURITY DEFINER RPC, exactly like report_evidence. '
  'MANY-per-session, unlike evidence -- the frame draws two files on one '
  'lesson.';

-- ===========================================================================
-- 3 . The bucket. SEPARATE FROM `evidence` (Authority Lock §8.2).
-- ===========================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('lesson-materials', 'lesson-materials', false, 26214400,
        ARRAY[
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/vnd.ms-powerpoint',
          'application/vnd.apple.keynote',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          'image/png',
          'image/jpeg'
        ])
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ===========================================================================
-- 4 . The ONE storage predicate and the ONE storage policy.
-- ===========================================================================
-- ⚠️ THE PATH SHAPE IS THE AUTHORIZATION SURFACE. `<class_session_id>/<uuid>.<ext>`
--    and nothing else: the first segment names the session whose authority is
--    then resolved LIVE. A free-form path would let a caller upload anywhere
--    in the bucket and claim it afterwards.
CREATE FUNCTION public.app_management_may_attach_material(p_object_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_session_id uuid;
  v_centre_id  uuid;
BEGIN
  IF p_object_name IS NULL THEN RETURN false; END IF;
  -- Exactly two segments, the first a uuid, the second a uuid plus extension.
  IF p_object_name !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[A-Za-z0-9]{1,8}$'
  THEN
    RETURN false;
  END IF;

  v_session_id := pg_catalog.split_part(p_object_name, '/', 1)::uuid;

  SELECT s.centre_id INTO v_centre_id
    FROM public.class_sessions s WHERE s.id = v_session_id;
  IF v_centre_id IS NULL THEN RETURN false; END IF;

  -- ⛔ LIVE, never a JWT claim (ADR-4).
  RETURN public.app_has_active_membership(v_centre_id, 'management'::public.centre_membership_role);
END;
$function$;

REVOKE ALL ON FUNCTION public.app_management_may_attach_material(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.app_management_may_attach_material(text) TO authenticated;

COMMENT ON FUNCTION public.app_management_may_attach_material(text) IS
  'D-4: the ONLY predicate behind the one lesson-materials storage.objects '
  'INSERT policy. Strict path shape, and live management authority over the '
  'centre owning the session named in the first path segment.';

-- INSERT ONLY. No SELECT, UPDATE or DELETE policy for any role -- reads are
-- server-minted signed URLs and removal runs as the owner.
CREATE POLICY lesson_materials_objects_insert_management
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'lesson-materials'
    AND public.app_management_may_attach_material(name)
  );

-- ===========================================================================
-- 5 . material_list_for_session -- MANAGEMENT **and** TRAINER.
-- ===========================================================================
-- `D-4`: management uploads, TRAINERS DOWNLOAD. Both roles read the list.
-- ⛔ Emits NOTHING. A read is not a governed action (A-029).
CREATE FUNCTION public.material_list_for_session(p_class_session_id uuid)
 RETURNS TABLE (
   o_material_id  uuid,
   o_display_name text,
   o_media_type   text,
   o_byte_size    bigint,
   o_created_at   timestamptz
 )
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_centre_id uuid;
BEGIN
  IF public.app_current_account_id() IS NULL THEN RETURN; END IF;

  SELECT s.centre_id INTO v_centre_id
    FROM public.class_sessions s WHERE s.id = p_class_session_id;
  IF v_centre_id IS NULL THEN RETURN; END IF;

  -- ⛔ NON-DISCLOSING. A caller with neither authority gets ZERO ROWS -- the
  --    same answer as a session that does not exist.
  IF NOT (
       public.app_has_active_membership(v_centre_id, 'management'::public.centre_membership_role)
    OR public.app_trainer_reaches_session(p_class_session_id)
  ) THEN
    RETURN;
  END IF;

  RETURN QUERY
    SELECT m.id, m.display_name, m.media_type, m.byte_size, m.created_at
      FROM public.class_session_materials m
     WHERE m.class_session_id = p_class_session_id
     ORDER BY m.created_at, m.id;
END;
$function$;

REVOKE ALL ON FUNCTION public.material_list_for_session(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.material_list_for_session(uuid) TO authenticated;

-- ===========================================================================
-- 6 . material_attach_confirm  ->  material.attached
-- ===========================================================================
-- ⚠️ THE CALLER SUPPLIES NO SIZE AND NO MEDIA TYPE. Both are read from the
--    STORED OBJECT, so a caller cannot declare a 2 MiB handout and upload 40.
CREATE FUNCTION public.material_attach_confirm(
  p_class_session_id uuid,
  p_material_id      uuid,
  p_display_name     text,
  OUT o_attached     boolean
)
 RETURNS boolean
 LANGUAGE plpgsql
 VOLATILE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_centre_id     uuid;
  v_prefix        text;
  v_name          text;
  v_mime          text;
  v_size          bigint;
  v_label         text;
BEGIN
  o_attached := false;

  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  SELECT s.centre_id INTO v_centre_id
    FROM public.class_sessions s WHERE s.id = p_class_session_id;
  IF v_centre_id IS NULL THEN RETURN; END IF;

  IF NOT public.app_has_active_membership(v_centre_id, 'management'::public.centre_membership_role)
  THEN RETURN; END IF;

  SELECT (pg_catalog.array_agg(m.id))[1] INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.centre_id = v_centre_id
     AND m.role = 'management' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN RETURN; END IF;

  v_label := pg_catalog.btrim(coalesce(p_display_name, ''));
  IF pg_catalog.length(v_label) < 1 OR pg_catalog.length(v_label) > 200 THEN RETURN; END IF;

  -- The object, found by the ONE prefix this (session, material) pair owns.
  v_prefix := p_class_session_id::text || '/' || p_material_id::text || '.';
  SELECT o.name,
         o.metadata->>'mimetype',
         (o.metadata->>'size')::bigint
    INTO v_name, v_mime, v_size
    FROM storage.objects o
   WHERE o.bucket_id = 'lesson-materials'
     AND o.name LIKE v_prefix || '%';
  IF v_name IS NULL THEN RETURN; END IF;

  -- ⛔ SERVER-SIDE RE-VALIDATION AGAINST THE STORED BYTES, and the list is the
  --    ruled EIGHT. Narrow where §8.2 needs it: no video, no audio, no archive.
  IF v_mime IS NULL OR v_mime NOT IN (
       'application/pdf',
       'application/vnd.openxmlformats-officedocument.presentationml.presentation',
       'application/vnd.ms-powerpoint',
       'application/vnd.apple.keynote',
       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
       'application/msword',
       'image/png',
       'image/jpeg')
  THEN RETURN; END IF;
  IF v_size IS NULL OR v_size <= 0 OR v_size > 26214400 THEN RETURN; END IF;

  INSERT INTO public.class_session_materials (
    id, class_session_id, centre_id, storage_object_path, display_name,
    media_type, byte_size, uploaded_by_account_id, uploaded_by_membership_id)
  VALUES (
    p_material_id, p_class_session_id, v_centre_id, v_name, v_label,
    v_mime, v_size, v_account_id, v_membership_id);

  -- ⛔ DATA MINIMIZATION (A-029). No child name, initial, account name, email
  --    or phone number in a label or a payload.
  PERFORM public.audit_append_event(
    v_centre_id, v_account_id, v_membership_id, 'management'::public.centre_membership_role,
    'material.attached', NULL, NULL, NULL,
    'class_session_materials', p_material_id, 'Lesson material',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('target_type', 'class_session',
                                    'target_id', p_class_session_id::text,
                                    'target_label', 'Class session')
    ),
    pg_catalog.jsonb_build_object(
      'class_session_id', p_class_session_id::text,
      'media_type',       v_mime,
      'byte_size',        v_size
    )
  );

  o_attached := true;
END;
$function$;

REVOKE ALL ON FUNCTION public.material_attach_confirm(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.material_attach_confirm(uuid, uuid, text) TO authenticated;

-- ===========================================================================
-- 7 . material_signed_path -- the download. EMITS NOTHING.
-- ===========================================================================
-- ⛔ NO AUDIT EVENT, BY OPERATOR RULING. `evidence.accessed` fires because
--    that object is a child's video and the mint is the only trace it
--    existed; a slide deck carries no child's data, and A-029 plus the P2-4
--    precedent hold that a READ IS NOT A GOVERNED ACTION.
-- ⚠️ It returns the OBJECT PATH, not a URL: minting the short-TTL signed URL
--    needs the Storage API and happens in server code. This function is the
--    AUTHORIZATION half, and it is the half that must live in the database.
CREATE FUNCTION public.material_signed_path(
  p_material_id  uuid,
  OUT o_object_path text,
  OUT o_media_type  text
)
 RETURNS record
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_m public.class_session_materials%ROWTYPE;
BEGIN
  o_object_path := NULL;
  o_media_type  := NULL;

  IF public.app_current_account_id() IS NULL THEN RETURN; END IF;

  SELECT m.* INTO v_m FROM public.class_session_materials m WHERE m.id = p_material_id;
  IF NOT FOUND THEN RETURN; END IF;

  IF NOT (
       public.app_has_active_membership(v_m.centre_id, 'management'::public.centre_membership_role)
    OR public.app_trainer_reaches_session(v_m.class_session_id)
  ) THEN
    RETURN;
  END IF;

  o_object_path := v_m.storage_object_path;
  o_media_type  := v_m.media_type;
END;
$function$;

REVOKE ALL ON FUNCTION public.material_signed_path(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.material_signed_path(uuid) TO authenticated;

-- ===========================================================================
-- 8 . material_remove  ->  material.removed.  MANAGEMENT ONLY.
-- ===========================================================================
-- ⛔ AN OPERATOR ADDITION THE FRAME DOES NOT DRAW. Cited so a later visual
--    pass does not remove it for fidelity.
-- ⚠️ The row goes first and the object second, deliberately: a dangling row
--    pointing at a deleted object is worse than an orphaned object pointing
--    at nothing, and the latter is collectable.
CREATE FUNCTION public.material_remove(
  p_material_id uuid,
  OUT o_removed boolean,
  OUT o_object_path text
)
 RETURNS record
 LANGUAGE plpgsql
 VOLATILE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_m             public.class_session_materials%ROWTYPE;
BEGIN
  o_removed     := false;
  o_object_path := NULL;

  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  SELECT m.* INTO v_m FROM public.class_session_materials m WHERE m.id = p_material_id;
  IF NOT FOUND THEN RETURN; END IF;

  -- ⛔ MANAGEMENT ONLY. A trainer downloads; a trainer does not remove.
  IF NOT public.app_has_active_membership(v_m.centre_id, 'management'::public.centre_membership_role)
  THEN RETURN; END IF;

  SELECT (pg_catalog.array_agg(mm.id))[1] INTO v_membership_id
    FROM public.centre_memberships mm
   WHERE mm.account_id = v_account_id AND mm.centre_id = v_m.centre_id
     AND mm.role = 'management' AND mm.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN RETURN; END IF;

  DELETE FROM public.class_session_materials m WHERE m.id = p_material_id;

  PERFORM public.audit_append_event(
    v_m.centre_id, v_account_id, v_membership_id, 'management'::public.centre_membership_role,
    'material.removed', NULL, NULL, NULL,
    'class_session_materials', v_m.id, 'Lesson material',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('target_type', 'class_session',
                                    'target_id', v_m.class_session_id::text,
                                    'target_label', 'Class session')
    ),
    pg_catalog.jsonb_build_object(
      'class_session_id', v_m.class_session_id::text,
      'media_type',       v_m.media_type
    )
  );

  o_removed     := true;
  o_object_path := v_m.storage_object_path;
END;
$function$;

REVOKE ALL ON FUNCTION public.material_remove(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.material_remove(uuid) TO authenticated;

-- ===========================================================================
-- 9 . APPLY-TIME ASSERTIONS. Every one aborts the whole migration.
-- ===========================================================================
DO $verify$
DECLARE
  v_n     integer;
  v_name  text;
  v_lim   bigint;
BEGIN
  -- M-1 -- the registry is EXACTLY 23 and carries both ratified strings.
  IF pg_catalog.array_length(public.audit_action_registry(), 1) <> 23 THEN
    RAISE EXCEPTION 'P2-6 assertion M-1 failed: registry is %, expected exactly 23',
      pg_catalog.array_length(public.audit_action_registry(), 1);
  END IF;
  IF NOT ('material.attached' = ANY (public.audit_action_registry()))
     OR NOT ('material.removed' = ANY (public.audit_action_registry())) THEN
    RAISE EXCEPTION 'P2-6 assertion M-1 failed: a ratified new string is missing';
  END IF;

  -- M-2 -- ⛔ NOTHING BEYOND THE TWO AUTHORIZED STRINGS. The ruling approved
  --        TWO, not a class of them.
  FOR v_name IN
    SELECT a FROM unnest(public.audit_action_registry()) a
     WHERE a LIKE 'material%' AND a NOT IN ('material.attached', 'material.removed')
  LOOP
    RAISE EXCEPTION 'P2-6 assertion M-2 failed: % was added and is NOT authorized', v_name;
  END LOOP;
  -- ⛔ `material.accessed` is RULED ABSENT. Its presence would mean somebody
  --    decided a download is a governed action, which the Operator ruled it
  --    is not.
  IF 'material.accessed' = ANY (public.audit_action_registry()) THEN
    RAISE EXCEPTION 'P2-6 assertion M-2 failed: material.accessed is RULED ABSENT -- a read is not a governed action (A-029)';
  END IF;

  -- M-3 -- ZERO client grants and ZERO policies on the new table.
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.role_table_grants
   WHERE table_schema = 'public' AND table_name = 'class_session_materials'
     AND grantee IN ('authenticated', 'anon', 'PUBLIC', 'service_role');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-6 assertion M-3 failed: % client grant(s) on class_session_materials', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_policies WHERE schemaname = 'public' AND tablename = 'class_session_materials';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-6 assertion M-3 failed: % policy/policies on class_session_materials -- it is RPC-only by design', v_n;
  END IF;

  -- M-4 -- the bucket carries the RULED ceiling, is PRIVATE, and the whole
  --        P1-2 invariant still holds across every bucket.
  SELECT file_size_limit INTO v_lim FROM storage.buckets WHERE id = 'lesson-materials';
  IF v_lim IS DISTINCT FROM 26214400 THEN
    RAISE EXCEPTION 'P2-6 assertion M-4 failed: lesson-materials limit is %, expected 26214400 (25 MiB)', v_lim;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM storage.buckets WHERE public OR file_size_limit IS NULL;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-6 assertion M-4 failed: % bucket(s) are public or carry no size limit -- the P1-2 invariant', v_n;
  END IF;

  -- M-5 -- ⛔ THE MIME LIST IS THE RULED EIGHT, AND NO VIDEO, AUDIO OR ARCHIVE
  --        REACHES IT. The second half is what Lock §8.2 actually needs.
  SELECT pg_catalog.array_length(allowed_mime_types, 1) INTO v_n
    FROM storage.buckets WHERE id = 'lesson-materials';
  IF v_n <> 8 THEN
    RAISE EXCEPTION 'P2-6 assertion M-5 failed: lesson-materials allows % type(s), expected exactly 8', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM storage.buckets b, unnest(b.allowed_mime_types) t
   WHERE b.id = 'lesson-materials'
     AND (t LIKE 'video/%' OR t LIKE 'audio/%' OR t LIKE '%zip%' OR t LIKE '%x-tar%');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-6 assertion M-5 failed: % video/audio/archive type(s) reached the DOCUMENTS bucket -- Lock §8.2', v_n;
  END IF;

  -- M-6 -- ⛔ KEY FOCUS WAS RAISED AND DECLINED. This fails the build if a
  --        later edit adds the column, so the decline is structural rather
  --        than a comment somebody can miss.
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'class_sessions' AND column_name = 'key_focus';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-6 assertion M-6 failed: class_sessions.key_focus exists -- KEY FOCUS was RAISED AND DECLINED by the Operator (no author exists), and returns only as its own question with its own schema authorization';
  END IF;

  -- M-7 -- ZERO enums added, and exactly ONE registry declaration site.
  SELECT pg_catalog.count(DISTINCT typname) INTO v_n
    FROM pg_type t JOIN pg_namespace ns ON ns.oid = t.typnamespace
   WHERE ns.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN
    RAISE EXCEPTION 'P2-6 assertion M-7 failed: % enums, expected 12 -- this phase adds none', v_n;
  END IF;
  FOR v_name IN
    SELECT p.proname FROM pg_proc p JOIN pg_namespace ns ON ns.oid = p.pronamespace
     WHERE ns.nspname = 'public' AND p.proname IN ('audit_append_event', 'audit_verify_chain')
  LOOP
    IF pg_catalog.pg_get_functiondef(
         (SELECT p.oid FROM pg_proc p JOIN pg_namespace ns ON ns.oid = p.pronamespace
           WHERE ns.nspname = 'public' AND p.proname = v_name LIMIT 1)
       ) LIKE '%''material.attached''%' THEN
      RAISE EXCEPTION 'P2-6 assertion M-7 failed: % declares a registry literal -- the P1-2 consolidation was undone', v_name;
    END IF;
  END LOOP;

  -- M-8 -- every new function is SECURITY DEFINER with search_path pinned.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_proc p JOIN pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND p.proname IN ('material_list_for_session', 'material_attach_confirm',
                       'material_signed_path', 'material_remove',
                       'app_management_may_attach_material')
     AND p.prosecdef
     AND pg_catalog.array_to_string(p.proconfig, ',') LIKE '%search_path=%';
  IF v_n <> 5 THEN
    RAISE EXCEPTION 'P2-6 assertion M-8 failed: % of 5 new functions are SECURITY DEFINER with search_path pinned', v_n;
  END IF;

  -- M-9 -- ⛔ NO RATING VOCABULARY REACHES THIS SURFACE (C-9, G-2). Matched as
  --        a BARE SUBSTRING so it catches a column nobody has written yet.
  FOR v_name IN
    SELECT p.proname FROM pg_proc p JOIN pg_namespace ns ON ns.oid = p.pronamespace
     WHERE ns.nspname = 'public' AND p.proname LIKE 'material%'
  LOOP
    IF pg_catalog.pg_get_functiondef(
         (SELECT p.oid FROM pg_proc p JOIN pg_namespace ns ON ns.oid = p.pronamespace
           WHERE ns.nspname = 'public' AND p.proname = v_name LIMIT 1)
       ) ~* '(rating|beginning|developing|mastering|mastered|overall_grade)' THEN
      RAISE EXCEPTION 'P2-6 assertion M-9 failed: % names rating vocabulary -- C-9 and G-2', v_name;
    END IF;
  END LOOP;

  RAISE NOTICE 'P2-6 assertions M-1..M-9 PASSED: registry 23, table RPC-only, bucket private at 25 MiB with 8 non-media types, key_focus DECLINED and structurally absent';
END
$verify$;
