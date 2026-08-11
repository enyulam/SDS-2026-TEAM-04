-- ===========================================================================
-- PORTAL PHASE P1-2b -- THE UPLOAD TRANSPORT'S ONE DATABASE CHANGE.
-- ===========================================================================
-- Operator authorization, 2026-08-12: "BUILD P1-2's UPLOAD TRANSPORT. It is
-- the last piece of Part 1 and D-5 is half-built without it -- the clip can be
-- watched but not attached."
--
-- ⛔ THIS MIGRATION ADDS NO TABLE, NO ENUM, NO COLUMN, NO POLICY, NO GRANT AND
--    NO AUDIT ACTION STRING. It REPLACES exactly one function,
--    `public.evidence_attach_confirm`, and the census is unmoved by it:
--    28 tables · 12 enums · 49 functions · 29 public policies · 1 storage
--    policy · registry 19. `A-031`'s ceiling and `A-057`'s three-string
--    registry are both untouched, and the prohibition still re-arms at THREE.
--
-- ---------------------------------------------------------------------------
-- WHY THE FUNCTION IS REPLACED AT ALL -- TWO DEFECTS THE TRANSPORT EXPOSED
-- ---------------------------------------------------------------------------
--
-- ⚠️ DEFECT 1 -- A SECOND CLIP RAISED INSTEAD OF ANSWERING.
--    `UNIQUE (report_id)` on `report_evidence` is the structural enforcement of
--    "one clip per report" and it is UNCHANGED and still the gate. But the
--    v1 body reached it by a bare INSERT, so a second attach surfaced as a
--    `23505` -- an aborted transaction, reported to the trainer as the same
--    undifferentiated failure as a network fault.
--    ▶ The project already ruled on this exact shape for the size ceiling:
--      *a trainer who cannot tell why an upload failed will retry it*, which
--      is the worst outcome on a classroom network. The pre-check below is a
--      MESSAGE, never the boundary; ⛔ assertion `T3` proves the CONSTRAINT
--      still refuses a direct owner-side INSERT that bypasses this function
--      entirely, which is the only thing that makes it structural.
--
-- ⚠️ DEFECT 2 -- AN AMBIGUOUS OBJECT SET RESOLVED ARBITRARILY.
--    The object was found by `LIKE '<report>/<evidence>.%'` with a bare
--    `SELECT ... INTO`. The path shape admits BOTH `.mp4` and `.mov` under one
--    evidence id, so a trainer who uploaded one, changed their mind and
--    uploaded the other left two objects -- and `SELECT INTO` takes whichever
--    row the plan happened to produce. ▶ THE ATTACHED CLIP WOULD HAVE BEEN
--    CHOSEN BY THE QUERY PLANNER. It now FAILS CLOSED on ambiguity: two
--    candidate objects is a refusal, not a coin toss.
--
-- ---------------------------------------------------------------------------
-- ⛔ THE REASON CODE IS DISCLOSED ONLY AFTER AUTHORIZATION SUCCEEDS
-- ---------------------------------------------------------------------------
-- `o_reason` discriminates `already_attached` / `too_large` /
-- `unsupported_type` / `object_missing` / `object_ambiguous` so the trainer's
-- own surface can say something true. ⚠️ EVERY AUTHORIZATION FAILURE COLLAPSES
-- TO THE SINGLE VALUE `not_permitted` -- no caller learns whether a report
-- exists, what status it holds, or whether they merely lack authority over it.
-- A reason is a diagnostic for someone already proven to be the authoring
-- trainer; it is never a probe. ⛔ Assertion `T2` proves the collapse.
--
-- ---------------------------------------------------------------------------
-- ⛔ WHAT DOES NOT CHANGE, AND MUST NOT BE READ AS RELAXED
-- ---------------------------------------------------------------------------
--   . MEDIA TYPE AND BYTE SIZE ARE STILL READ FROM THE STORED OBJECT, never
--     from the caller. That is what `C-16`'s "re-validated server-side" has to
--     mean to be worth anything: a caller cannot declare 10 MiB and upload 400.
--   . ATTACH IS STILL PRE-SUBMISSION ONLY. Removal is still NOT limited to
--     pre-submitted (Operator ruling) -- removal WITHDRAWS media, and a wrong
--     clip that reached a parent must be pullable.
--   . AUTHORING TRAINER ONLY, resolved LIVE (ADR-4). Management may never
--     attach and may never remove (`CLAUDE.md` §6).
--   . `evidence.attached` still fires in the SAME TRANSACTION as the INSERT,
--     with no child name, initial, account name, email or phone number in any
--     label or payload (`A-029`).
--   . The 100 MiB ceiling is still enforced in THREE independent places --
--     the bucket row, the `CHECK` on `report_evidence`, and this function.
-- ===========================================================================

BEGIN;

-- ⚠️ DROP-THEN-CREATE, NOT `CREATE OR REPLACE`, AND THE DIFFERENCE IS NOT
--    COSMETIC. Adding `OUT o_reason` CHANGES THE FUNCTION'S RETURN TYPE
--    (`boolean` -> `record`), and PostgreSQL refuses that under REPLACE. The
--    first attempt at this migration failed exactly there.
-- ⛔ A DROP TAKES THE GRANT WITH IT. The `GRANT EXECUTE ... TO authenticated`
--    below is therefore RESTORING a privilege, not confirming one, and
--    assertion `T5` re-measures it from the catalogue afterwards rather than
--    trusting that the statement ran.
DROP FUNCTION IF EXISTS public.evidence_attach_confirm(uuid, uuid);

CREATE FUNCTION public.evidence_attach_confirm(
  p_report_id   uuid,
  p_evidence_id uuid,
  OUT o_attached boolean,
  OUT o_reason   text
)
 RETURNS record
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
  v_matches       bigint;
BEGIN
  o_attached := false;
  -- ⛔ THE DEFAULT IS THE NON-DISCLOSING ONE. Every early return below is an
  --    authorization failure and inherits it; nothing has to remember to set
  --    it, which is the only way a default like this stays true.
  o_reason   := 'not_permitted';

  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  SELECT r.* INTO v_r FROM public.reports r WHERE r.id = p_report_id;
  IF NOT FOUND THEN RETURN; END IF;
  IF v_r.status = 'submitted' THEN RETURN; END IF;

  IF NOT public.app_trainer_reaches_session(v_r.class_session_id) THEN RETURN; END IF;
  SELECT (pg_catalog.array_agg(m.id))[1] INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id
     AND m.role = 'trainer' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN RETURN; END IF;

  -- ▶ FROM HERE ON THE CALLER IS PROVEN TO BE THE AUTHORING TRAINER, so a
  --   specific reason tells them something they are already entitled to know.

  IF EXISTS (SELECT 1 FROM public.report_evidence e WHERE e.report_id = p_report_id) THEN
    o_reason := 'already_attached';
    RETURN;
  END IF;

  v_prefix := p_report_id::text || '/' || p_evidence_id::text || '.';

  SELECT pg_catalog.count(*) INTO v_matches
    FROM storage.objects o
   WHERE o.bucket_id = 'evidence' AND o.name LIKE v_prefix || '%';

  IF v_matches = 0 THEN
    o_reason := 'object_missing';
    RETURN;
  END IF;
  -- ⛔ AMBIGUITY FAILS CLOSED. Two candidate objects under one evidence id is
  --    a refusal; picking one would let the query planner choose which clip a
  --    parent eventually watches.
  IF v_matches > 1 THEN
    o_reason := 'object_ambiguous';
    RETURN;
  END IF;

  SELECT o.name, o.metadata->>'mimetype', (o.metadata->>'size')::bigint
    INTO v_name, v_mime, v_size
    FROM storage.objects o
   WHERE o.bucket_id = 'evidence' AND o.name LIKE v_prefix || '%';

  IF v_mime IS NULL OR v_mime NOT IN ('video/mp4', 'video/quicktime') THEN
    o_reason := 'unsupported_type';
    RETURN;
  END IF;
  IF v_size IS NULL OR v_size <= 0 OR v_size > 104857600 THEN
    o_reason := 'too_large';
    RETURN;
  END IF;

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
  o_reason   := 'ok';
END;
$function$;

REVOKE ALL ON FUNCTION public.evidence_attach_confirm(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.evidence_attach_confirm(uuid, uuid) TO authenticated;

COMMENT ON FUNCTION public.evidence_attach_confirm(uuid, uuid) IS
  'D-5/C-16: attaches an uploaded object to exactly one report. Authoring '
  'trainer only, pre-submission only. Media type and byte size are read from '
  'the STORED OBJECT, never from the caller. Ambiguous object sets FAIL '
  'CLOSED. o_reason discriminates only AFTER authorization succeeds; every '
  'authorization failure collapses to not_permitted. UNIQUE(report_id) '
  'remains the structural one-clip-per-report gate. Emits evidence.attached '
  'in the same transaction as the INSERT.';


-- ===========================================================================
-- IN-TRANSACTION ASSERTIONS -- this migration refuses to commit if it lies.
-- ===========================================================================
DO $assert$
DECLARE
  v_src   text;
  v_n     bigint;
  v_args  text;
BEGIN
  SELECT p.prosrc INTO v_src
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'evidence_attach_confirm';

  -- T1: the replacement landed, and it kept the two things that make the
  -- server-side re-validation real.
  IF v_src IS NULL
     OR pg_catalog.strpos(v_src, 'object_ambiguous') = 0
     OR pg_catalog.strpos(v_src, '104857600') = 0
     OR pg_catalog.strpos(v_src, 'metadata->>''size''') = 0
  THEN
    RAISE EXCEPTION 'T1 FAILED: the replacement body is absent, or lost the ambiguity guard / the ceiling / the STORED-object size read';
  END IF;

  -- ⛔ T2: EVERY authorization branch collapses to `not_permitted`. Measured by
  --    counting the bare `RETURN;` statements that precede the "proven trainer"
  --    boundary against the single default assignment that serves them all.
  IF pg_catalog.strpos(v_src, 'o_reason   := ''not_permitted'';') = 0 THEN
    RAISE EXCEPTION 'T2 FAILED: the non-disclosing default reason is gone -- an authorization failure could now name itself';
  END IF;
  IF pg_catalog.strpos(pg_catalog.split_part(v_src, 'FROM HERE ON', 1), 'o_reason := ''already_attached''') > 0
     OR pg_catalog.strpos(pg_catalog.split_part(v_src, 'FROM HERE ON', 1), 'o_reason := ''object_missing''') > 0
  THEN
    RAISE EXCEPTION 'T2 FAILED: a discriminating reason is set BEFORE authorization is proven';
  END IF;

  -- ⛔ T3: the STRUCTURAL gate is still the constraint, not the pre-check. If
  --    UNIQUE(report_id) ever disappears, the pre-check above becomes the only
  --    thing standing between a report and two clips -- which is exactly the
  --    substitution this assertion exists to refuse.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_constraint c
    JOIN pg_catalog.pg_class t ON t.oid = c.conrelid
    JOIN pg_catalog.pg_namespace n ON n.oid = t.relnamespace
   WHERE n.nspname = 'public' AND t.relname = 'report_evidence'
     AND c.contype = 'u'
     AND (SELECT pg_catalog.count(*) FROM unnest(c.conkey)) = 1
     AND pg_catalog.pg_get_constraintdef(c.oid) LIKE '%(report_id)%';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'T3 FAILED: UNIQUE(report_id) is not present -- one clip per report would rest on a code path, not on the schema';
  END IF;

  -- T4: the census did not move. This migration replaces; it adds nothing.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_tables WHERE schemaname = 'public';
  IF v_n <> 28 THEN
    RAISE EXCEPTION 'T4 FAILED: public table count is % (expected 28) -- this migration must add no table', v_n;
  END IF;
  -- ⚠️ `audit_action_registry()` returns ONE `text[]`, not a set. The first
  --    shape of this leg counted ROWS and would have measured 1 against 19 --
  --    a leg that fails for a reason unrelated to what it claims to check is
  --    as useless as one that passes for the wrong reason.
  SELECT pg_catalog.array_length(public.audit_action_registry(), 1) INTO v_n;
  IF v_n <> 19 THEN
    RAISE EXCEPTION 'T4 FAILED: the audit action registry holds % strings (expected 19) -- A-057 re-arms at THREE evidence actions', v_n;
  END IF;

  -- T5: the grant is unchanged and still `authenticated` only, and the
  -- signature the client calls did NOT change (two IN parameters).
  -- ⚠️ `pg_get_function_identity_arguments` WAS THE WRONG INSTRUMENT and the
  --    first shape of this leg used it. On this function it returns the OUT
  --    parameters too ("p_report_id uuid, p_evidence_id uuid, OUT o_attached
  --    boolean"), so the leg would have measured THE RETURN SHAPE -- the one
  --    thing this migration deliberately changes -- while claiming to measure
  --    the callable signature, which it must not change.
  --    ▶ `oidvectortypes(proargtypes)` is IN-parameters only, which is exactly
  --      what `client.rpc('evidence_attach_confirm', {...})` resolves against.
  SELECT pg_catalog.oidvectortypes(p.proargtypes) INTO v_args
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'evidence_attach_confirm';
  IF v_args <> 'uuid, uuid' THEN
    RAISE EXCEPTION 'T5 FAILED: the callable IN signature is (%) -- every existing caller would break silently', v_args;
  END IF;
  IF NOT pg_catalog.has_function_privilege('authenticated', 'public.evidence_attach_confirm(uuid, uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'T5 FAILED: authenticated lost EXECUTE on evidence_attach_confirm';
  END IF;
  IF pg_catalog.has_function_privilege('anon', 'public.evidence_attach_confirm(uuid, uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'T5 FAILED: anon holds EXECUTE on evidence_attach_confirm';
  END IF;

  RAISE NOTICE 'P1-2b ASSERTIONS T1..T5 PASSED';
END;
$assert$;

COMMIT;
