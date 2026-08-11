-- ===========================================================================
-- PORTAL COMPLETION PLAN — phase P1-2
-- D-5: per-child, per-session video evidence. The governed substrate.
--
-- Authority:
--   D-5  (FINAL_MVP_PORTAL_DECISIONS.md)  build evidence video; subject is the
--                                         INDIVIDUAL CHILD, never class
--                                         footage; uploader is the TRAINER;
--                                         tagged to exactly ONE session
--                                         report; can be removed; NO download
--                                         affordance for any role.
--   C-7  (FINAL_MVP_PORTAL_DECISIONS.md §C)  per-phase table-family ruling.
--                                            APPROVED 2026-08-11 as designed.
--   C-16                                     100 MiB, enforced PER BUCKET and
--                                            re-validated SERVER-SIDE;
--                                            resumable upload REQUIRED.
--   C-3                                      no scan gate, no scan state, no
--                                            invented vocabulary.
--   C-2                                      consent is CENTRE-LEVEL. No
--                                            consent_records table.
--   A-057 as amended by C-4 + its collapse ruling: the Step 7H governed action
--         registry goes 16 -> 19, and the three strings are exactly
--         evidence.attached . evidence.accessed . evidence.removed.
--
-- Design was stated in full BEFORE this file was written:
--   docs/plan/PORTAL_COMPLETION_PLAN.md, "C-7 . P1-2's TABLE FAMILY —
--   PROPOSED FOR RULING".
--
-- ===========================================================================
-- ⛔ WHY report_evidence HAS NO student_id AND NO class_session_id.
--    THE OMISSION IS THE CONTROL. Read this before "completing" the table.
-- ===========================================================================
-- public.reports already carries reports_session_student_key
-- UNIQUE (class_session_id, student_id). A row whose only anchor is
-- report_id is therefore ALREADY exactly one child in exactly one session.
-- Per-child scope is a CONSEQUENCE OF THE KEY, not a check anyone has to
-- remember to write.
--
-- Adding student_id or class_session_id here would create a SECOND,
-- INDEPENDENTLY-WRITABLE answer to "whose clip is this?" -- and two answers
-- that can disagree is PRECISELY how class footage gets attached as a child's
-- clip. A row naming a session but no student, or naming a student the report
-- does not, becomes REPRESENTABLE the moment those columns exist. With only
-- report_id there is no such row to write.
--
-- ⚠️ This is not a normalization preference and it is not a space saving. A
--    later phase that denormalizes "for query convenience" removes the only
--    structural guarantee D-5's per-child rule has. Any such change is a
--    CLAUDE.md §12 stop-and-ask.
--
-- What this does NOT claim: the application does not verify that a recording
-- contains only one child. A-001 states that limitation and D-5 does not
-- change it. Single-child FRAMING stays an operational filming requirement.
-- What is guaranteed is that whatever is uploaded can only ever be ATTACHED
-- to exactly one child's report.
--
-- ===========================================================================
-- ⛔ WHAT THIS MIGRATION DELIBERATELY DOES NOT DO
--   - No parent authorization arm anywhere (A-002 is UNRULED; the Operator
--     reserved it for P1-5). Leaving it out is deliberate: an unexercised
--     authorization arm is the S-8 shape -- it looks proven because the legs
--     around it pass, while the one path that matters never returned a row.
--   - No scan state, status column, enum or vocabulary of any kind (C-3).
--   - No consent_records table, and no per-object consent lookup (C-2).
--   - No retention or erasure object (Phase 4).
--   - No download affordance, and nothing here implies one (D-5).
--   - No client GRANT and no RLS policy on the new public table. Reports and
--     report_versions have neither; evidence belongs in that class.
-- ===========================================================================


-- ===========================================================================
-- 1 . THE GOVERNED ACTION REGISTRY BECOMES A SINGLE SOURCE
-- ===========================================================================
-- ⛔ THE LANDMINE THIS CLOSES. Step 7H declared the 16-string registry TWICE:
--    once in audit_append_event and once in audit_verify_chain. A one-sided
--    extension writes events that chain verification then REJECTS -- a
--    corruption invisible until someone verifies.
--
-- Both functions are replaced below to read from this one function, so a
-- future extension has exactly ONE site. The replacement bodies are otherwise
-- byte-derived from the Step 7H source; only the registry line changed.
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
    'evidence.removed'
  ];
$function$;

REVOKE ALL ON FUNCTION public.audit_action_registry() FROM PUBLIC;

COMMENT ON FUNCTION public.audit_action_registry() IS
  'A-029/A-057: the ONE governed action registry. Step 7H declared it twice; '
  'a one-sided extension produces events that audit_verify_chain rejects. '
  'Extending it is a reviewed code change here and nowhere else, and remains '
  'a CLAUDE.md §12 stop-and-ask.';


-- ===========================================================================
-- 2 . THE TABLE
-- ===========================================================================
CREATE TABLE public.report_evidence (
  id                        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id                 uuid        NOT NULL,
  centre_id                 uuid        NOT NULL,
  storage_object_path       text        NOT NULL,
  media_type                text        NOT NULL,
  byte_size                 bigint      NOT NULL,
  uploaded_by_account_id    uuid        NOT NULL,
  uploaded_by_membership_id uuid        NOT NULL,
  created_at                timestamptz NOT NULL DEFAULT now(),

  -- The anchor, and the whole per-child guarantee. The composite form makes
  -- centre drift UNREPRESENTABLE rather than merely checked -- reports carries
  -- reports_id_centre_key for exactly this.
  CONSTRAINT report_evidence_report_fk
    FOREIGN KEY (report_id, centre_id)
    REFERENCES public.reports (id, centre_id) ON DELETE RESTRICT,

  -- ⛔ ONE CLIP PER REPORT, ENFORCED STRUCTURALLY (Operator ruling, 2026-08-11).
  -- More than one creates a selection problem for management review and a
  -- which-one question for parents. More than one is an AMENDMENT, not a
  -- default reachable by dropping this constraint.
  CONSTRAINT report_evidence_report_key UNIQUE (report_id),

  -- One row can never point at another row's object.
  CONSTRAINT report_evidence_object_key UNIQUE (storage_object_path),

  -- Durable actor FKs (A-029). RESTRICT: accounts and memberships are never
  -- physically deleted, so this is attribution that cannot rot.
  CONSTRAINT report_evidence_account_fk
    FOREIGN KEY (uploaded_by_account_id)
    REFERENCES public.accounts (id) ON DELETE RESTRICT,
  CONSTRAINT report_evidence_membership_fk
    FOREIGN KEY (uploaded_by_membership_id)
    REFERENCES public.centre_memberships (id) ON DELETE RESTRICT,

  CONSTRAINT report_evidence_media_type_chk
    CHECK (media_type IN ('video/mp4', 'video/quicktime')),

  -- ⛔ C-16's 100 MiB, IN THE DATABASE. This is the third of three independent
  -- ceilings (bucket row, this CHECK, the confirm RPC). The client-side one is
  -- not a boundary at all.
  CONSTRAINT report_evidence_byte_size_chk
    CHECK (byte_size > 0 AND byte_size <= 104857600)
);

CREATE INDEX report_evidence_centre_idx ON public.report_evidence (centre_id);

-- Deny by default (A-030). RLS on, ZERO policies, ZERO client grants -- the
-- same posture reports and report_versions hold. Every read and write goes
-- through the reviewed SECURITY DEFINER RPCs below.
ALTER TABLE public.report_evidence ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.report_evidence IS
  'D-5: per-child, per-session video evidence. Anchored ONLY on report_id -- '
  'reports_session_student_key already makes that exactly one child in one '
  'session, so a student_id or class_session_id column here would create a '
  'second writable answer to whose clip this is. THE OMISSION IS THE CONTROL. '
  'RLS on, no policy, no client grant: reached only through the evidence_* RPCs.';


-- ===========================================================================
-- 3 . THE BUCKET
-- ===========================================================================
-- ⚠️ THE DURABLE CEILING LIVES HERE, NOT IN config.toml. config.toml is
--    LOCAL-DEV ONLY and does not travel to a hosted project; a ceiling that
--    exists only there is not a boundary.
--
-- ⛔ ANY FUTURE BUCKET MUST CARRY ITS OWN file_size_limit. A bucket created
--    without one inherits the global cap -- which is exactly the silent
--    widening C-16 names for the deferred photo and lesson-materials buckets.
--    The invariant is asserted below over the WHOLE storage.buckets table, not
--    over this bucket's name, so it binds on buckets that do not exist yet.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('evidence', 'evidence', false, 104857600,
        ARRAY['video/mp4', 'video/quicktime'])
ON CONFLICT (id) DO UPDATE
   SET public             = false,
       file_size_limit    = 104857600,
       allowed_mime_types = ARRAY['video/mp4', 'video/quicktime'];


-- ===========================================================================
-- 4 . THE ONE STORAGE POLICY, AND THE BOUNDED ADR-3 EXCEPTION IT CARRIES
-- ===========================================================================
-- ⚠️ RECORDED AS A BOUNDED, REASONED EXCEPTION TO ADR-3 (Operator ruling,
--    2026-08-11), not as a precedent and not as a drift.
--
-- WHY IT IS UNAVOIDABLE: C-16 makes RESUMABLE upload an acceptance condition.
-- Supabase's resumable (TUS) endpoint authenticates the CLIENT'S OWN JWT and
-- is governed by storage RLS. A server-minted signed upload URL is not
-- resumable, and proxying 100 MiB through a server action is not viable on a
-- serverless host. A non-resumable 100 MiB upload on classroom wifi is a
-- failure mode we would be DESIGNING IN.
--
-- WHAT THE CLIENT CAN WRITE, STATED EXACTLY:
--   . an OPAQUE OBJECT -- no schema, no governed meaning, no lifecycle;
--   . into a PRIVATE bucket -- public = false, and no SELECT/UPDATE/DELETE
--     policy exists for any role, so nothing can read it back through RLS;
--   . at a path it must prove TRAINER AUTHORITY over -- the first segment is
--     the report id and the helper resolves that authority LIVE (ADR-4);
--   . GOVERNED BY NOTHING until evidence_attach_confirm attaches it. Until
--     then it is referenced by no row and reachable by no read path.
--
-- ⚠️ ORPHANS. An upload that is never confirmed leaves an object with no row.
--    A sweeper exists: `npm run sweep:evidence-orphans` (service-role,
--    manual). ⛔ IT IS NOT SCHEDULED -- no scheduler exists in this project and
--    adding one is hosted work, which is a CLAUDE.md §12 stop-and-ask. That is
--    a STATED limitation, not a hidden one.
CREATE FUNCTION public.app_trainer_may_attach_evidence(p_object_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_report_id uuid;
  v_r         public.reports%ROWTYPE;
BEGIN
  -- Shape first, and it is strict: {report_uuid}/{evidence_uuid}.{mp4|mov}.
  -- A malformed name is refused here rather than raising a cast error out of a
  -- policy, so the deny is a clean false.
  IF p_object_name IS NULL
     OR p_object_name !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(mp4|mov)$'
  THEN
    RETURN false;
  END IF;

  v_report_id := pg_catalog.split_part(p_object_name, '/', 1)::uuid;

  SELECT r.* INTO v_r FROM public.reports r WHERE r.id = v_report_id;
  IF NOT FOUND THEN RETURN false; END IF;

  -- ⛔ ATTACH IS PRE-SUBMISSION. Removal is NOT (Operator ruling): removal
  --    WITHDRAWS media and must stay available if a wrong clip reaches a
  --    parent. Attaching after publication would ADD media to a published
  --    artefact, which is a different act.
  IF v_r.status = 'submitted' THEN RETURN false; END IF;

  -- The authoring trainer, resolved LIVE. Never a JWT claim (ADR-4).
  RETURN public.app_trainer_reaches_session(v_r.class_session_id);
END;
$function$;

REVOKE ALL ON FUNCTION public.app_trainer_may_attach_evidence(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.app_trainer_may_attach_evidence(text) TO authenticated;

COMMENT ON FUNCTION public.app_trainer_may_attach_evidence(text) IS
  'D-5/C-16: the ONLY predicate behind the one storage.objects INSERT policy. '
  'Strict path shape, live trainer authority over the report named in the '
  'first path segment, and pre-submission only. Attach is pre-submission; '
  'REMOVAL is not, by Operator ruling.';

-- INSERT ONLY. No SELECT, UPDATE or DELETE policy for any role -- reads are
-- server-minted signed URLs and removal runs as the owner.
CREATE POLICY evidence_objects_insert_authoring_trainer
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'evidence'
    AND public.app_trainer_may_attach_evidence(name)
  );



-- ===========================================================================
-- 5 . evidence_attach_confirm  ->  evidence.attached
-- ===========================================================================
-- ⚠️ THE CALLER SUPPLIES NO SIZE AND NO MEDIA TYPE. Both are read from the
--    STORED OBJECT, so a caller cannot declare a 10 MiB clip and upload 400.
--    That is what "re-validate server-side" (C-16) has to mean to be worth
--    anything.
CREATE FUNCTION public.evidence_attach_confirm(
  p_report_id   uuid,
  p_evidence_id uuid,
  OUT o_attached boolean
)
 RETURNS boolean
 LANGUAGE plpgsql
 VOLATILE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_r             public.reports%ROWTYPE;
  v_prefix        text;
  v_name          text;
  v_mime          text;
  v_size          bigint;
BEGIN
  o_attached := false;

  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  SELECT r.* INTO v_r FROM public.reports r WHERE r.id = p_report_id;
  IF NOT FOUND THEN RETURN; END IF;
  IF v_r.status = 'submitted' THEN RETURN; END IF;

  -- The authoring trainer, and the membership the upload is attributed to.
  IF NOT public.app_trainer_reaches_session(v_r.class_session_id) THEN RETURN; END IF;
  SELECT (pg_catalog.array_agg(m.id))[1] INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id
     AND m.role = 'trainer' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN RETURN; END IF;

  -- The object, found by the ONE prefix this (report, evidence) pair can own.
  v_prefix := p_report_id::text || '/' || p_evidence_id::text || '.';
  SELECT o.name,
         o.metadata->>'mimetype',
         (o.metadata->>'size')::bigint
    INTO v_name, v_mime, v_size
    FROM storage.objects o
   WHERE o.bucket_id = 'evidence'
     AND o.name LIKE v_prefix || '%';
  IF v_name IS NULL THEN RETURN; END IF;

  -- Server-side re-validation, against the STORED bytes.
  IF v_mime IS NULL OR v_mime NOT IN ('video/mp4', 'video/quicktime') THEN RETURN; END IF;
  IF v_size IS NULL OR v_size <= 0 OR v_size > 104857600 THEN RETURN; END IF;

  INSERT INTO public.report_evidence (
    id, report_id, centre_id, storage_object_path, media_type, byte_size,
    uploaded_by_account_id, uploaded_by_membership_id)
  VALUES (
    p_evidence_id, p_report_id, v_r.centre_id, v_name, v_mime, v_size,
    v_account_id, v_membership_id);

  -- ⛔ DATA MINIMIZATION (A-029). No child name, initial, account name, email
  --    or phone number in a label or a payload -- here or anywhere.
  PERFORM public.audit_append_event(
    v_r.centre_id, v_account_id, v_membership_id, 'trainer'::public.centre_membership_role,
    'evidence.attached', NULL, NULL, NULL,
    'report_evidence', p_evidence_id, 'Evidence media',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('target_type', 'report', 'target_id', p_report_id::text, 'target_label', 'Report')
    ),
    pg_catalog.jsonb_build_object(
      'report_id',  p_report_id::text,
      'media_type', v_mime,
      'byte_size',  v_size
    )
  );

  o_attached := true;
END;
$function$;

REVOKE ALL ON FUNCTION public.evidence_attach_confirm(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.evidence_attach_confirm(uuid, uuid) TO authenticated;

COMMENT ON FUNCTION public.evidence_attach_confirm(uuid, uuid) IS
  'D-5/C-16: attaches an uploaded object to exactly one report. Authoring '
  'trainer only, pre-submission only. Media type and byte size are read from '
  'the STORED OBJECT, never from the caller. Emits evidence.attached in the '
  'same transaction as the INSERT.';


-- ===========================================================================
-- 6 . evidence_list_for_report  ->  no audit (a list read is not an access)
-- ===========================================================================
-- ⛔ RETURNS NO STORAGE PATH. A-001 gate 7 prohibits raw storage-path access;
--    the path is derivable server-side from report_id + id + media_type, so it
--    never has to cross this boundary.
--
-- ⛔ THERE IS NO PARENT ARM, DELIBERATELY. A-002 is unruled and reserved for
--    P1-5. Building it now as an unreachable branch is the S-8 shape exactly.
CREATE FUNCTION public.evidence_list_for_report(
  p_class_session_id uuid,
  p_student_id       uuid
)
 RETURNS TABLE(
   id         uuid,
   media_type text,
   byte_size  bigint,
   created_at timestamptz
 )
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_account_id uuid;
  v_r          public.reports%ROWTYPE;
  v_ok         boolean := false;
BEGIN
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  SELECT r.* INTO v_r
    FROM public.reports r
   WHERE r.class_session_id = p_class_session_id AND r.student_id = p_student_id;
  IF NOT FOUND THEN RETURN; END IF;

  -- Trainer: live session assignment.
  IF public.app_trainer_reaches_session(v_r.class_session_id) THEN
    v_ok := true;
  ELSE
    -- Management: exactly one ACTIVE management membership of the report's own
    -- centre. Same predicate as report_get_management_review and
    -- report_get_management_ratings -- one gate, written once, not a looser
    -- second one beside it (R-C2-6).
    PERFORM 1 FROM public.centre_memberships m
      WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id
        AND m.role = 'management' AND m.status = 'active'
     HAVING pg_catalog.count(*) = 1;
    v_ok := FOUND;
  END IF;

  IF NOT v_ok THEN RETURN; END IF;

  RETURN QUERY
    SELECT e.id, e.media_type, e.byte_size, e.created_at
      FROM public.report_evidence e
     WHERE e.report_id = v_r.id;
END;
$function$;

REVOKE ALL ON FUNCTION public.evidence_list_for_report(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.evidence_list_for_report(uuid, uuid) TO authenticated;

COMMENT ON FUNCTION public.evidence_list_for_report(uuid, uuid) IS
  'D-5: evidence metadata for a report detail surface. Trainer via live '
  'session assignment, management via a single active management membership. '
  'NO PARENT ARM -- A-002 is unruled and reserved for P1-5. Returns no storage '
  'path (A-001 gate 7).';


-- ===========================================================================
-- 7 . evidence_record_access  ->  evidence.accessed
-- ===========================================================================
-- ⚠️ THIS IS THE ONLY TRACE THAT A SIGNED URL TO A CHILD'S VIDEO WAS MINTED,
--    FOR WHOM AND WHEN. It is why the C-4 collapse kept three strings rather
--    than dropping one to fit a slot count.
--
-- ⛔ EMITTED ON SUCCESS ONLY (A-057). A denied attempt emits nothing and
--    returns the same shape every other refusal here returns.
CREATE FUNCTION public.evidence_record_access(
  p_evidence_id uuid,
  OUT o_authorized boolean,
  OUT o_report_id  uuid,
  OUT o_media_type text
)
 RETURNS record
 LANGUAGE plpgsql
 VOLATILE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_role          public.centre_membership_role;
  v_e             public.report_evidence%ROWTYPE;
  v_r             public.reports%ROWTYPE;
BEGIN
  o_authorized := false;
  o_report_id  := NULL;
  o_media_type := NULL;

  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  SELECT e.* INTO v_e FROM public.report_evidence e WHERE e.id = p_evidence_id;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT r.* INTO v_r FROM public.reports r WHERE r.id = v_e.report_id;
  IF NOT FOUND THEN RETURN; END IF;

  -- THE SAME PREDICATE AS THE LIST READ, re-evaluated. Two gates that can
  -- drift apart is a side channel; these are written to move together.
  IF public.app_trainer_reaches_session(v_r.class_session_id) THEN
    v_role := 'trainer';
    SELECT (pg_catalog.array_agg(m.id))[1] INTO v_membership_id
      FROM public.centre_memberships m
     WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id
       AND m.role = 'trainer' AND m.status = 'active'
    HAVING pg_catalog.count(*) = 1;
  ELSE
    v_role := 'management';
    SELECT (pg_catalog.array_agg(m.id))[1] INTO v_membership_id
      FROM public.centre_memberships m
     WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id
       AND m.role = 'management' AND m.status = 'active'
    HAVING pg_catalog.count(*) = 1;
  END IF;
  IF v_membership_id IS NULL THEN RETURN; END IF;

  PERFORM public.audit_append_event(
    v_r.centre_id, v_account_id, v_membership_id, v_role,
    'evidence.accessed', NULL, NULL, NULL,
    'report_evidence', v_e.id, 'Evidence media',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('target_type', 'report', 'target_id', v_r.id::text, 'target_label', 'Report')
    ),
    pg_catalog.jsonb_build_object(
      'report_id',  v_r.id::text,
      'media_type', v_e.media_type
    )
  );

  o_authorized := true;
  o_report_id  := v_e.report_id;
  o_media_type := v_e.media_type;
END;
$function$;

REVOKE ALL ON FUNCTION public.evidence_record_access(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.evidence_record_access(uuid) TO authenticated;

COMMENT ON FUNCTION public.evidence_record_access(uuid) IS
  'D-5/A-057: authorizes one evidence view and emits evidence.accessed -- the '
  'only trace that a signed URL to a child video was minted, for whom and '
  'when. Success only; a denial emits nothing. Returns no storage path.';


-- ===========================================================================
-- 8 . evidence_remove  ->  evidence.removed
-- ===========================================================================
-- ⛔ TRAINER ONLY, AND NOT LIMITED TO PRE-SUBMITTED (Operator ruling,
--    2026-08-11). Same reasoning as follow_up_notes: removal WITHDRAWS media,
--    it does not edit an approved artefact -- and if a wrong clip reaches a
--    parent the trainer must be able to pull it.
--
-- ⛔ MANAGEMENT MAY NEVER REMOVE. That is not a D-5 choice: CLAUDE.md §6
--    already forbids any management write reaching evidence. An
--    assessment-level disagreement is a RETURN TO THE TRAINER.
--
-- ⚠️ The ROW is deleted here; the storage OBJECT is deleted by the server
--    action afterwards, because removing the backing file needs the Storage
--    API. Row first is deliberate -- a dangling row pointing at a deleted
--    object would be worse than an orphaned object pointing at nothing, and
--    the sweeper collects the latter.
CREATE FUNCTION public.evidence_remove(
  p_evidence_id uuid,
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
  v_e             public.report_evidence%ROWTYPE;
  v_r             public.reports%ROWTYPE;
BEGIN
  o_removed     := false;
  o_object_path := NULL;

  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  SELECT e.* INTO v_e FROM public.report_evidence e WHERE e.id = p_evidence_id;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT r.* INTO v_r FROM public.reports r WHERE r.id = v_e.report_id;
  IF NOT FOUND THEN RETURN; END IF;

  IF NOT public.app_trainer_reaches_session(v_r.class_session_id) THEN RETURN; END IF;
  SELECT (pg_catalog.array_agg(m.id))[1] INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id
     AND m.role = 'trainer' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN RETURN; END IF;

  DELETE FROM public.report_evidence e WHERE e.id = p_evidence_id;

  PERFORM public.audit_append_event(
    v_r.centre_id, v_account_id, v_membership_id, 'trainer'::public.centre_membership_role,
    'evidence.removed', NULL, NULL, NULL,
    'report_evidence', v_e.id, 'Evidence media',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('target_type', 'report', 'target_id', v_r.id::text, 'target_label', 'Report')
    ),
    pg_catalog.jsonb_build_object(
      'report_id',  v_r.id::text,
      'media_type', v_e.media_type
    )
  );

  o_removed     := true;
  o_object_path := v_e.storage_object_path;
END;
$function$;

REVOKE ALL ON FUNCTION public.evidence_remove(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.evidence_remove(uuid) TO authenticated;

COMMENT ON FUNCTION public.evidence_remove(uuid) IS
  'D-5: withdraws evidence. AUTHORING TRAINER ONLY and NOT limited to '
  'pre-submitted -- removal withdraws media rather than editing an approved '
  'artefact, and a wrong clip that reached a parent must be pullable. '
  'Management may never remove (CLAUDE.md §6). Emits evidence.removed.';


-- ===========================================================================
-- 9 . BOTH AUDIT DECLARATION SITES, REPLACED IN THIS ONE MIGRATION
-- ===========================================================================
-- The two bodies below are byte-derived from the Step 7H source. The ONLY
-- change in each is the registry line, which now reads from
-- public.audit_action_registry(). Assertion E5 proves no registry literal
-- survives in either.

CREATE OR REPLACE FUNCTION public.audit_append_event(
  p_centre_id           uuid,
  p_actor_account_id    uuid,
  p_actor_membership_id uuid,
  p_actor_role          public.centre_membership_role,
  p_action              text,
  p_state_domain        text,
  p_state_from          text,
  p_state_to            text,
  p_target_type         text,
  p_target_id           uuid,
  p_target_label        text,
  p_related_targets     jsonb,
  p_payload             jsonb,
  OUT o_event_id        uuid,
  OUT o_entry_hash      text
)
RETURNS record
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  -- R8: the ratified registry (design section 1.4, E1-E8), function-enforced
  -- text per A-026. Extending it is a reviewed code change, never an enum.
  v_registry CONSTANT text[] := public.audit_action_registry();
  -- Section 5.4: v1 flags ONLY the reserved membership.bootstrap as
  -- system-actor-allowed; it is system-only (ruling R8).
  v_system_only CONSTANT text[] := ARRAY['membership.bootstrap'];
  v_field_names CONSTANT text[] := ARRAY[
    'canonical_version','centre_id','seq_no','prev_hash','occurred_at',
    'actor_account_id','actor_membership_id','actor_role','action',
    'state_domain','state_from','state_to','target_type','target_id',
    'target_label','payload_canonical'
  ];
  v_lf CONSTANT text := pg_catalog.chr(10);

  v_uid               uuid;
  v_norm_targets      jsonb;
  v_elem              jsonb;
  v_elem_keys         text[];
  v_elem_target_id    uuid;
  v_payload           jsonb;
  v_payload_canonical text;
  v_genesis           text;
  v_last_seq          bigint;
  v_last_hash         text;
  v_seq_no            bigint;
  v_prev_hash         text;
  v_occurred_at       timestamptz;
  v_field_values      text[];
  v_preimage          text;
  v_event_id          uuid;
  v_ord               integer;
  v_i                 integer;
BEGIN
  -- ---- section 5.2 step 1: centre validation -------------------------
  IF p_centre_id IS NULL THEN
    RAISE EXCEPTION 'audit_append_event: centre_id must not be NULL';
  END IF;
  PERFORM 1 FROM public.centres c WHERE c.id = p_centre_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'audit_append_event: unknown centre %', p_centre_id;
  END IF;

  -- ---- section 5.2 step 2: registry and payload validation -----------
  IF p_action IS NULL OR NOT (p_action = ANY (v_registry)) THEN
    RAISE EXCEPTION 'audit_append_event: action "%" is not in the ratified event registry (design section 1.4)', p_action;
  END IF;
  IF p_target_type IS NULL OR pg_catalog.length(pg_catalog.btrim(p_target_type)) = 0 THEN
    RAISE EXCEPTION 'audit_append_event: target_type must be non-empty';
  END IF;
  IF p_target_label IS NULL THEN
    RAISE EXCEPTION 'audit_append_event: target_label must not be NULL (immutable snapshot, A-029)';
  END IF;
  IF p_payload IS NULL THEN
    RAISE EXCEPTION 'audit_append_event: payload must not be SQL NULL (the empty payload is {})';
  END IF;
  IF pg_catalog.jsonb_typeof(p_payload) <> 'object' THEN
    RAISE EXCEPTION 'audit_append_event: payload must be a JSON object (design section 4.4)';
  END IF;
  IF p_payload ? 'related_targets' THEN
    RAISE EXCEPTION 'audit_append_event: payload key "related_targets" is reserved -- pass related targets via p_related_targets (ruling R3)';
  END IF;

  -- Related-target normalization (ruling R3): ordered array of exactly
  -- {target_type, target_id, target_label}; ids normalized to lowercase
  -- canonical uuid text; NULL parameter means "none".
  IF p_related_targets IS NOT NULL
     AND pg_catalog.jsonb_typeof(p_related_targets) <> 'array' THEN
    RAISE EXCEPTION 'audit_append_event: p_related_targets must be a JSON array when supplied';
  END IF;
  v_norm_targets := '[]'::jsonb;
  FOR v_elem IN
    SELECT e.value
      FROM pg_catalog.jsonb_array_elements(COALESCE(p_related_targets, '[]'::jsonb))
           WITH ORDINALITY AS e(value, ord)
     ORDER BY e.ord
  LOOP
    IF pg_catalog.jsonb_typeof(v_elem) <> 'object' THEN
      RAISE EXCEPTION 'audit_append_event: each related target must be a JSON object';
    END IF;
    SELECT pg_catalog.array_agg(k.key ORDER BY k.key)
      INTO v_elem_keys
      FROM pg_catalog.jsonb_object_keys(v_elem) AS k(key);
    IF v_elem_keys IS DISTINCT FROM ARRAY['target_id','target_label','target_type'] THEN
      RAISE EXCEPTION 'audit_append_event: related target must carry exactly target_type, target_id, target_label';
    END IF;
    IF pg_catalog.jsonb_typeof(v_elem->'target_type') <> 'string'
       OR pg_catalog.length(pg_catalog.btrim(v_elem->>'target_type')) = 0 THEN
      RAISE EXCEPTION 'audit_append_event: related target_type must be a non-empty string';
    END IF;
    IF pg_catalog.jsonb_typeof(v_elem->'target_label') <> 'string' THEN
      RAISE EXCEPTION 'audit_append_event: related target_label must be a string';
    END IF;
    IF pg_catalog.jsonb_typeof(v_elem->'target_id') = 'null' THEN
      v_elem_target_id := NULL;
    ELSIF pg_catalog.jsonb_typeof(v_elem->'target_id') = 'string' THEN
      BEGIN
        v_elem_target_id := (v_elem->>'target_id')::uuid;
      EXCEPTION WHEN invalid_text_representation THEN
        RAISE EXCEPTION 'audit_append_event: related target_id "%" is not a valid uuid', v_elem->>'target_id';
      END;
    ELSE
      RAISE EXCEPTION 'audit_append_event: related target_id must be a uuid string or null';
    END IF;
    v_norm_targets := v_norm_targets || pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'target_type',  v_elem->>'target_type',
        'target_id',    CASE WHEN v_elem_target_id IS NULL THEN NULL
                             ELSE v_elem_target_id::text END,
        'target_label', v_elem->>'target_label'
      )
    );
  END LOOP;

  -- ---- section 5.2 step 3: actor validation (section 5.4) ------------
  v_uid := auth.uid();
  IF v_uid IS NOT NULL THEN
    -- Authenticated path: the passed triple is re-proven, never trusted.
    IF p_actor_account_id IS NULL OR p_actor_membership_id IS NULL OR p_actor_role IS NULL THEN
      RAISE EXCEPTION 'audit_append_event: an authenticated event requires the full actor triple (account, membership, role)';
    END IF;
    IF p_action = ANY (v_system_only) THEN
      RAISE EXCEPTION 'audit_append_event: action "%" is reserved for system origin -- a JWT-backed session can never emit it (design section 5.4)', p_action;
    END IF;
    PERFORM 1
      FROM public.accounts a
     WHERE a.id = p_actor_account_id
       AND a.auth_user_id = v_uid
       AND a.status = 'active';
    IF NOT FOUND THEN
      RAISE EXCEPTION 'audit_append_event: actor account is not the active account of the current session identity';
    END IF;
    PERFORM 1
      FROM public.centre_memberships m
     WHERE m.id = p_actor_membership_id
       AND m.account_id = p_actor_account_id
       AND m.centre_id = p_centre_id
       AND m.role = p_actor_role
       AND m.status = 'active';
    IF NOT FOUND THEN
      RAISE EXCEPTION 'audit_append_event: actor membership does not match an active membership of that account, role and centre';
    END IF;
  ELSE
    -- System/operator path: jointly-NULL triple + registry-flagged action.
    IF p_actor_account_id IS NOT NULL OR p_actor_membership_id IS NOT NULL OR p_actor_role IS NOT NULL THEN
      RAISE EXCEPTION 'audit_append_event: a system event requires a jointly-NULL actor triple (design section 5.4)';
    END IF;
    IF NOT (p_action = ANY (v_system_only)) THEN
      RAISE EXCEPTION 'audit_append_event: action "%" requires an authenticated actor (design section 5.4)', p_action;
    END IF;
  END IF;

  -- Merge the normalized related targets into the payload (ruling R3): the
  -- hash covers them; the child rows are a projection of this same value.
  v_payload := p_payload || pg_catalog.jsonb_build_object('related_targets', v_norm_targets);
  v_payload_canonical := public.audit_canonical_json(v_payload);

  -- ---- section 5.2 step 4: atomic head seed-or-skip ------------------
  v_genesis := pg_catalog.encode(
    pg_catalog.sha256(
      pg_catalog.convert_to('BESTCOACH-AUDIT-GENESIS-V1|' || p_centre_id::text, 'UTF8')
    ), 'hex');
  INSERT INTO public.audit_chain_heads (centre_id, last_seq, last_hash)
  VALUES (p_centre_id, 0, v_genesis)
  ON CONFLICT (centre_id) DO NOTHING;

  -- ---- section 5.2 step 5: lock ---------------------------------------
  -- A separate statement, deliberately: under READ COMMITTED the loser of a
  -- concurrent seed race re-reads the winner's COMMITTED head under a fresh
  -- statement snapshot (the design's two-writer proof depends on this;
  -- steps 4 and 5 must never be fused into one statement).
  SELECT h.last_seq, h.last_hash
    INTO STRICT v_last_seq, v_last_hash
    FROM public.audit_chain_heads h
   WHERE h.centre_id = p_centre_id
   FOR UPDATE;

  -- ---- section 5.2 step 6: allocate (uniform -- no genesis branch) ----
  v_seq_no    := v_last_seq + 1;
  v_prev_hash := v_last_hash;

  -- ---- section 5.2 step 7: envelope and hash (section 4.2) ------------
  v_occurred_at := pg_catalog.now();  -- R4: database clock, transaction time
  v_field_values := ARRAY[
    '1',                                                     -- canonical_version
    p_centre_id::text,                                       -- centre_id
    v_seq_no::text,                                          -- seq_no
    v_prev_hash,                                             -- prev_hash
    pg_catalog.to_char(v_occurred_at AT TIME ZONE 'UTC',
                       'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),     -- occurred_at
    p_actor_account_id::text,                                -- actor_account_id
    p_actor_membership_id::text,                             -- actor_membership_id
    p_actor_role::text,                                      -- actor_role
    p_action,                                                -- action
    p_state_domain,                                          -- state_domain
    p_state_from,                                            -- state_from
    p_state_to,                                              -- state_to
    p_target_type,                                           -- target_type
    p_target_id::text,                                       -- target_id
    p_target_label,                                          -- target_label
    v_payload_canonical                                      -- payload_canonical
  ];
  v_preimage := 'BESTCOACH-AUDIT-V1' || v_lf;
  FOR v_i IN 1..16 LOOP
    IF v_field_values[v_i] IS NULL THEN
      v_preimage := v_preimage || v_field_names[v_i] || ':N' || v_lf;
    ELSE
      v_preimage := v_preimage || v_field_names[v_i] || ':V:'
        || pg_catalog.octet_length(v_field_values[v_i])::text || ':'
        || v_field_values[v_i] || v_lf;
    END IF;
  END LOOP;
  o_entry_hash := pg_catalog.encode(
    pg_catalog.sha256(pg_catalog.convert_to(v_preimage, 'UTF8')), 'hex');

  -- ---- section 5.2 step 8: write (event + children + head, atomically) -
  v_event_id := pg_catalog.gen_random_uuid();
  INSERT INTO public.audit_events (
    id, centre_id, seq_no, canonical_version, occurred_at,
    actor_account_id, actor_membership_id, actor_role,
    action, state_domain, state_from, state_to,
    target_type, target_id, target_label,
    payload, payload_canonical, prev_hash, entry_hash
  ) VALUES (
    v_event_id, p_centre_id, v_seq_no, 1, v_occurred_at,
    p_actor_account_id, p_actor_membership_id, p_actor_role,
    p_action, p_state_domain, p_state_from, p_state_to,
    p_target_type, p_target_id, p_target_label,
    v_payload, v_payload_canonical, v_prev_hash, o_entry_hash
  );

  v_ord := 0;
  FOR v_elem IN
    SELECT e.value
      FROM pg_catalog.jsonb_array_elements(v_norm_targets)
           WITH ORDINALITY AS e(value, ord)
     ORDER BY e.ord
  LOOP
    v_ord := v_ord + 1;
    INSERT INTO public.audit_event_targets (
      id, event_id, centre_id, ordinal, target_type, target_id, target_label
    ) VALUES (
      pg_catalog.gen_random_uuid(), v_event_id, p_centre_id, v_ord,
      v_elem->>'target_type',
      CASE WHEN pg_catalog.jsonb_typeof(v_elem->'target_id') = 'null' THEN NULL
           ELSE (v_elem->>'target_id')::uuid END,
      v_elem->>'target_label'
    );
  END LOOP;

  UPDATE public.audit_chain_heads
     SET last_seq = v_seq_no, last_hash = o_entry_hash, updated_at = pg_catalog.now()
   WHERE centre_id = p_centre_id;

  -- ---- section 5.2 step 9: return -------------------------------------
  o_event_id := v_event_id;
END;
$fn$;

CREATE OR REPLACE FUNCTION public.audit_verify_chain(
  p_centre_id uuid   DEFAULT NULL,
  p_from_seq  bigint DEFAULT NULL,
  p_to_seq    bigint DEFAULT NULL
)
RETURNS TABLE (
  centre_id        uuid,
  mode             text,
  ok               boolean,
  events_checked   bigint,
  first_failed_seq bigint,
  failed_check     text,
  anchor_seq       bigint,
  anchor_hash      text,
  head_checked     boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_registry CONSTANT text[] := public.audit_action_registry();
  v_field_names CONSTANT text[] := ARRAY[
    'canonical_version','centre_id','seq_no','prev_hash','occurred_at',
    'actor_account_id','actor_membership_id','actor_role','action',
    'state_domain','state_from','state_to','target_type','target_id',
    'target_label','payload_canonical'
  ];
  v_lf CONSTANT text := pg_catalog.chr(10);

  v_centre        uuid;
  v_mode          text;
  v_ok            boolean;
  v_checked       bigint;
  v_failed_seq    bigint;
  v_failed_check  text;
  v_anchor_seq    bigint;
  v_anchor_hash   text;
  v_head_checked  boolean;
  v_max_seq       bigint;
  v_from          bigint;
  v_to            bigint;
  v_expected_prev text;
  v_head_seq      bigint;
  v_head_hash     text;
  v_row           record;
  v_tip_hash      text;
  v_parsed        jsonb;
  v_child_agg     jsonb;
  v_child_count   bigint;
  v_child_min     integer;
  v_child_max     integer;
  v_field_values  text[];
  v_preimage      text;
  v_i             integer;
BEGIN
  -- Invocation validation (the only errors this function raises).
  IF p_from_seq IS NOT NULL AND p_from_seq < 1 THEN
    RAISE EXCEPTION 'audit_verify_chain: p_from_seq must be >= 1';
  END IF;
  IF p_to_seq IS NOT NULL AND p_to_seq < COALESCE(p_from_seq, 1) THEN
    RAISE EXCEPTION 'audit_verify_chain: p_to_seq must be >= p_from_seq';
  END IF;

  -- Section 6.1: a run with either range bound set is partial and can never
  -- claim complete-chain integrity.
  v_mode := CASE WHEN p_from_seq IS NULL AND p_to_seq IS NULL
                 THEN 'complete' ELSE 'partial' END;

  FOR v_centre IN
    SELECT u.centre_id
      FROM (SELECT e.centre_id FROM public.audit_events e
            UNION
            SELECT h.centre_id FROM public.audit_chain_heads h) AS u(centre_id)
     WHERE p_centre_id IS NULL OR u.centre_id = p_centre_id
     ORDER BY u.centre_id
  LOOP
    v_ok           := true;
    v_checked      := 0;
    v_failed_seq   := NULL;
    v_failed_check := NULL;
    v_anchor_seq   := NULL;
    v_anchor_hash  := NULL;
    v_head_checked := false;

    SELECT pg_catalog.max(e.seq_no) INTO v_max_seq
      FROM public.audit_events e WHERE e.centre_id = v_centre;
    v_from := COALESCE(p_from_seq, 1);
    v_to   := COALESCE(p_to_seq, v_max_seq);

    -- Predecessor anchor (section 6.1): its integrity is assumed, not
    -- proven; recorded so the assumption is explicit and auditable.
    IF v_ok AND v_mode = 'partial' AND v_from > 1 THEN
      SELECT e.seq_no, e.entry_hash INTO v_anchor_seq, v_anchor_hash
        FROM public.audit_events e
       WHERE e.centre_id = v_centre AND e.seq_no = v_from - 1;
      IF v_anchor_seq IS NULL THEN
        v_ok := false; v_failed_seq := v_from - 1; v_failed_check := 'anchor_missing';
      END IF;
    END IF;

    -- Row-by-row checks (sections 6.2-1 ... 6.2-4, 6.2-6, 6.2-7).
    -- The gate deliberately does NOT test v_max_seq: when an explicit upper
    -- bound is supplied for a chain with no events, the range must still be
    -- proven dense (it is not), rather than passing vacuously. v_to is NULL
    -- only when no bound was supplied and no event exists -- the empty-chain
    -- case, which the head check below adjudicates.
    IF v_ok AND v_to IS NOT NULL AND v_from <= v_to THEN
      v_expected_prev := NULL;
      FOR v_row IN
        SELECT e.*
          FROM public.audit_events e
         WHERE e.centre_id = v_centre
           AND e.seq_no BETWEEN v_from AND v_to
         ORDER BY e.seq_no
      LOOP
        v_checked := v_checked + 1;

        -- 6.2-1 sequence continuity (dense; uniqueness is constraint-backed).
        IF v_row.seq_no <> v_from + v_checked - 1 THEN
          v_ok := false; v_failed_seq := v_from + v_checked - 1;
          v_failed_check := 'sequence_continuity';
          EXIT;
        END IF;

        -- 6.2-2 previous-hash continuity (row 1: the section 3 genesis
        -- constant; from_seq > 1: the recorded anchor; later rows: the
        -- predecessor entry_hash).
        IF v_checked = 1 THEN
          IF v_row.seq_no = 1 THEN
            v_expected_prev := pg_catalog.encode(
              pg_catalog.sha256(pg_catalog.convert_to(
                'BESTCOACH-AUDIT-GENESIS-V1|' || v_centre::text, 'UTF8')), 'hex');
          ELSE
            v_expected_prev := v_anchor_hash;
          END IF;
        END IF;
        IF v_row.prev_hash IS DISTINCT FROM v_expected_prev THEN
          v_ok := false; v_failed_seq := v_row.seq_no;
          v_failed_check := 'prev_hash_continuity';
          EXIT;
        END IF;

        -- 6.2-6 part 1: payload/canonical agreement (parse-back equality).
        BEGIN
          v_parsed := v_row.payload_canonical::jsonb;
        EXCEPTION WHEN OTHERS THEN
          v_parsed := NULL;
        END;
        IF v_parsed IS NULL OR v_parsed <> v_row.payload THEN
          v_ok := false; v_failed_seq := v_row.seq_no;
          v_failed_check := 'payload_consistency';
          EXIT;
        END IF;
        -- Canonical payload reconstruction: the stored jsonb re-serialized
        -- by the section 4.4 rules must reproduce the stored canonical text.
        IF public.audit_canonical_json(v_row.payload) IS DISTINCT FROM v_row.payload_canonical THEN
          v_ok := false; v_failed_seq := v_row.seq_no;
          v_failed_check := 'payload_reconstruction';
          EXIT;
        END IF;

        -- 6.2-6 part 2: the payload related_targets array equals the
        -- ordered child rows (ruling R2: ordinal-dense projection).
        SELECT pg_catalog.count(*),
               pg_catalog.min(t.ordinal),
               pg_catalog.max(t.ordinal),
               COALESCE(pg_catalog.jsonb_agg(
                 pg_catalog.jsonb_build_object(
                   'target_type',  t.target_type,
                   'target_id',    CASE WHEN t.target_id IS NULL THEN NULL
                                        ELSE t.target_id::text END,
                   'target_label', t.target_label)
                 ORDER BY t.ordinal), '[]'::jsonb)
          INTO v_child_count, v_child_min, v_child_max, v_child_agg
          FROM public.audit_event_targets t
         WHERE t.event_id = v_row.id AND t.centre_id = v_row.centre_id;
        IF (v_child_count > 0 AND (v_child_min <> 1 OR v_child_max <> v_child_count))
           OR v_child_agg IS DISTINCT FROM (v_row.payload -> 'related_targets') THEN
          v_ok := false; v_failed_seq := v_row.seq_no;
          v_failed_check := 'related_targets_mismatch';
          EXIT;
        END IF;

        -- 6.2-7 registry conformance for canonical_version 1.
        IF v_row.canonical_version <> 1
           OR NOT (v_row.action = ANY (v_registry)) THEN
          v_ok := false; v_failed_seq := v_row.seq_no;
          v_failed_check := 'registry_conformance';
          EXIT;
        END IF;

        -- 6.2-3 / 6.2-4: envelope reconstruction from the stored columns
        -- and stored payload_canonical, then hash recomputation.
        v_field_values := ARRAY[
          v_row.canonical_version::text,
          v_row.centre_id::text,
          v_row.seq_no::text,
          v_row.prev_hash,
          pg_catalog.to_char(v_row.occurred_at AT TIME ZONE 'UTC',
                             'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
          v_row.actor_account_id::text,
          v_row.actor_membership_id::text,
          v_row.actor_role::text,
          v_row.action,
          v_row.state_domain,
          v_row.state_from,
          v_row.state_to,
          v_row.target_type,
          v_row.target_id::text,
          v_row.target_label,
          v_row.payload_canonical
        ];
        v_preimage := 'BESTCOACH-AUDIT-V1' || v_lf;
        FOR v_i IN 1..16 LOOP
          IF v_field_values[v_i] IS NULL THEN
            v_preimage := v_preimage || v_field_names[v_i] || ':N' || v_lf;
          ELSE
            v_preimage := v_preimage || v_field_names[v_i] || ':V:'
              || pg_catalog.octet_length(v_field_values[v_i])::text || ':'
              || v_field_values[v_i] || v_lf;
          END IF;
        END LOOP;
        IF pg_catalog.encode(
             pg_catalog.sha256(pg_catalog.convert_to(v_preimage, 'UTF8')), 'hex')
           <> v_row.entry_hash THEN
          v_ok := false; v_failed_seq := v_row.seq_no;
          v_failed_check := 'hash_mismatch';
          EXIT;
        END IF;

        v_expected_prev := v_row.entry_hash;
      END LOOP;

      -- Density across the requested range: every position must have a row.
      IF v_ok AND v_checked <> (v_to - v_from + 1) THEN
        v_ok := false; v_failed_seq := v_from + v_checked;
        v_failed_check := 'sequence_continuity';
      END IF;
    END IF;

    -- 6.2-5 stored-head agreement -- only when the range reaches the tip
    -- (to_seq = max(seq_no) or NULL); a below-tip range skips it and says
    -- so via head_checked = false (section 6.1). A committed head with
    -- last_seq = 0, an orphan head, or a headless chain is a failure.
    IF v_ok AND (v_mode = 'complete' OR p_to_seq IS NULL OR p_to_seq = v_max_seq) THEN
      v_head_checked := true;
      SELECT h.last_seq, h.last_hash INTO v_head_seq, v_head_hash
        FROM public.audit_chain_heads h WHERE h.centre_id = v_centre;
      IF v_max_seq IS NULL THEN
        -- No events: a head row (orphan) is a failure; absence is consistent.
        IF v_head_seq IS NOT NULL THEN
          v_ok := false; v_failed_check := 'head_agreement';
        END IF;
      ELSE
        IF v_head_seq IS NULL
           OR v_head_seq = 0
           OR v_head_seq <> v_max_seq THEN
          v_ok := false; v_failed_check := 'head_agreement';
        ELSE
          SELECT e.entry_hash INTO v_tip_hash
            FROM public.audit_events e
           WHERE e.centre_id = v_centre AND e.seq_no = v_max_seq;
          IF v_head_hash IS DISTINCT FROM v_tip_hash THEN
            v_ok := false; v_failed_check := 'head_agreement';
          END IF;
        END IF;
      END IF;
    END IF;

    centre_id        := v_centre;
    mode             := v_mode;
    ok               := v_ok;
    events_checked   := v_checked;
    first_failed_seq := v_failed_seq;
    failed_check     := v_failed_check;
    anchor_seq       := v_anchor_seq;
    anchor_hash      := v_anchor_hash;
    head_checked     := v_head_checked;
    RETURN NEXT;
  END LOOP;
END;
$fn$;



-- ===========================================================================
-- 10 . IN-TRANSACTION ASSERTIONS
-- ===========================================================================
-- ⚠️ CATALOGUE STATE ONLY. A migration must never assert on FIXTURE data --
--    the H0B-3 lesson: an assertion pinned to 4 class_sessions was fixture
--    state, and a fresh apply has none.
DO $assert$
DECLARE
  v_n        integer;
  v_txt      text;
  v_names    text[];
  v_expected text[];
  v_bool     boolean;
  v_src      text;
BEGIN
  -- E1 -- THE OMISSION IS THE CONTROL. The two columns that must never exist.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_attribute a
    JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relname = 'report_evidence'
     AND a.attnum > 0 AND NOT a.attisdropped
     AND a.attname IN ('student_id', 'class_session_id');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P1-2 assertion E1 failed: report_evidence carries % denormalized scope column(s). The omission IS the control -- see this migration''s header.', v_n;
  END IF;

  -- E2 -- one clip per report, and one row per object, both structural.
  SELECT pg_catalog.array_agg(conname::text ORDER BY conname) INTO v_names
    FROM pg_catalog.pg_constraint
   WHERE conrelid = 'public.report_evidence'::regclass AND contype = 'u';
  IF v_names IS DISTINCT FROM ARRAY['report_evidence_object_key','report_evidence_report_key'] THEN
    RAISE EXCEPTION 'P1-2 assertion E2 failed: unique constraints are %, expected the report and object keys', v_names;
  END IF;

  -- E3 -- deny by default. RLS on, ZERO policies, ZERO client privileges of
  -- any kind on the new table. Privilege and policy are separate layers.
  SELECT c.relrowsecurity INTO v_bool
    FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relname = 'report_evidence';
  IF v_bool IS NOT TRUE THEN
    RAISE EXCEPTION 'P1-2 assertion E3 failed: RLS is not enabled on report_evidence';
  END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_policy
   WHERE polrelid = 'public.report_evidence'::regclass;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P1-2 assertion E3 failed: report_evidence holds % policies, expected 0', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM (VALUES ('SELECT'),('INSERT'),('UPDATE'),('DELETE'),('TRUNCATE'),('REFERENCES'),('TRIGGER')) AS p(priv)
   CROSS JOIN (VALUES ('anon'),('authenticated'),('service_role')) AS r(role)
   WHERE pg_catalog.has_table_privilege(r.role, 'public.report_evidence', p.priv);
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P1-2 assertion E3 failed: report_evidence holds % client table privileges, expected 0', v_n;
  END IF;

  -- E4 -- THE BUCKET INVARIANT, OVER THE WHOLE TABLE. ⚠️ Deliberately not
  -- scoped to 'evidence': a check naming only this bucket would be silent on
  -- the day the deferred photo or lesson-materials bucket is added, which is
  -- the day it matters (C-16).
  SELECT pg_catalog.count(*) INTO v_n FROM storage.buckets b
   WHERE b.file_size_limit IS NULL OR b.public IS NOT FALSE;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P1-2 assertion E4 failed: % bucket(s) are public or carry no file_size_limit', v_n;
  END IF;
  SELECT b.file_size_limit INTO v_n FROM storage.buckets b WHERE b.id = 'evidence';
  IF v_n IS DISTINCT FROM 104857600 THEN
    RAISE EXCEPTION 'P1-2 assertion E4 failed: evidence bucket limit is %, expected 104857600 (C-16 100 MiB)', v_n;
  END IF;

  -- E5 -- THE LANDMINE IS CLOSED. Neither audit function may still declare a
  -- registry literal, and both must resolve through the one function.
  FOREACH v_txt IN ARRAY ARRAY['audit_append_event','audit_verify_chain'] LOOP
    SELECT p.prosrc INTO v_src
      FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public' AND p.proname = v_txt;
    IF v_src LIKE '%''report.created''%' THEN
      RAISE EXCEPTION 'P1-2 assertion E5 failed: % still declares a registry literal -- a one-sided extension writes events verification rejects', v_txt;
    END IF;
    IF v_src NOT LIKE '%audit_action_registry()%' THEN
      RAISE EXCEPTION 'P1-2 assertion E5 failed: % does not read the single-source registry', v_txt;
    END IF;
  END LOOP;

  -- E6 -- the registry is exactly 19, and exactly the ratified three are new.
  v_names := public.audit_action_registry();
  IF pg_catalog.array_length(v_names, 1) <> 19 THEN
    RAISE EXCEPTION 'P1-2 assertion E6 failed: registry holds % strings, expected 19 (A-057 as amended: 16 -> 19)', pg_catalog.array_length(v_names, 1);
  END IF;
  v_expected := ARRAY['evidence.attached','evidence.accessed','evidence.removed'];
  IF NOT (v_names @> v_expected) THEN
    RAISE EXCEPTION 'P1-2 assertion E6 failed: the three ratified evidence strings are not all present';
  END IF;
  -- ⛔ evidence.uploaded was COLLAPSED into evidence.attached and must never
  --    return; evidence.deleted was never added and must not be.
  IF v_names && ARRAY['evidence.uploaded','evidence.deleted'] THEN
    RAISE EXCEPTION 'P1-2 assertion E6 failed: a prohibited evidence action string is present (evidence.uploaded is collapsed; evidence.deleted is unadded)';
  END IF;

  -- E7 -- exactly one storage policy, INSERT only, and no read/update/delete
  -- policy for anyone. Reads are server-minted signed URLs.
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_policy p
    JOIN pg_catalog.pg_class c ON c.oid = p.polrelid
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'storage';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'P1-2 assertion E7 failed: storage holds % policies, expected exactly 1', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_policy p
    JOIN pg_catalog.pg_class c ON c.oid = p.polrelid
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'storage' AND p.polcmd = 'a';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'P1-2 assertion E7 failed: the storage policy is not INSERT-only';
  END IF;

  -- E8 -- the four RPCs are SECURITY DEFINER with a pinned search_path, and
  -- carry exactly one authenticated EXECUTE each. ⚠️ The catalogue stores
  -- SET search_path = '' as search_path="" WITH QUOTES (the H0A-4 lesson).
  FOREACH v_txt IN ARRAY ARRAY['evidence_attach_confirm','evidence_list_for_report',
                               'evidence_record_access','evidence_remove',
                               'app_trainer_may_attach_evidence'] LOOP
    SELECT pg_catalog.count(*) INTO v_n
      FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public' AND p.proname = v_txt
       AND p.prosecdef
       AND p.proconfig @> ARRAY['search_path=""'];
    IF v_n <> 1 THEN
      RAISE EXCEPTION 'P1-2 assertion E8 failed: % is not exactly one SECURITY DEFINER function with a pinned search_path', v_txt;
    END IF;
    SELECT pg_catalog.count(*) INTO v_n
      FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public' AND p.proname = v_txt
       AND (pg_catalog.has_function_privilege('anon', p.oid, 'EXECUTE')
            OR pg_catalog.has_function_privilege('service_role', p.oid, 'EXECUTE'));
    IF v_n <> 0 THEN
      RAISE EXCEPTION 'P1-2 assertion E8 failed: % is executable by anon or service_role', v_txt;
    END IF;
  END LOOP;

  -- E9 -- ⛔ NO PARENT ARM ANYWHERE. A-002 is unruled; the parent branch is
  -- DELIBERATELY NOT BUILT rather than built unreachable (the S-8 shape).
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname LIKE 'evidence\_%'
     AND (p.prosrc LIKE '%app_parent_reaches_student%'
          OR p.prosrc LIKE '%latest_submitted_version_id%'
          OR p.prosrc LIKE '%''parent''%');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P1-2 assertion E9 failed: % evidence function(s) carry a parent arm. A-002 is UNRULED -- P1-5 builds it, not this phase.', v_n;
  END IF;

  -- E10 -- no scan state, and no consent object. C-3 and C-2, at the schema.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_attribute a
    JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relname = 'report_evidence'
     AND a.attnum > 0 AND NOT a.attisdropped
     AND (a.attname LIKE '%scan%' OR a.attname LIKE '%consent%' OR a.attname LIKE '%status%');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P1-2 assertion E10 failed: report_evidence carries a scan/consent/status column. C-3 forbids a fake scan state; C-2 forbids a per-object consent lookup.';
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname = 'consent_records';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P1-2 assertion E10 failed: a consent_records table exists (C-2 forbids it)';
  END IF;

  RAISE NOTICE 'P1-2 assertions E1-E10 PASS';
END;
$assert$;
