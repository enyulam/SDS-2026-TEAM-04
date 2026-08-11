-- ===========================================================================
-- PORTAL COMPLETION PLAN — phase P1-5
-- D-5 / A-002: the PARENT arm on the evidence reads.
--
-- Authority:
--   A-002 as AMENDED 2026-08-12 (Operator ruling; Amendment 001, A-002):
--         parent evidence access is authorized in PART 1, at this phase.
--         New ground: D-5 is CLIENT-RATIFIED and its premise is that all
--         three roles watch the clip; consent is confirmed with the academy.
--   A-001 ACTIVATED by D-5: linked child only, submitted report only,
--         short-TTL SERVER-MINTED signed URL, no direct/raw/public access.
--   A-003 both-direction exit. A-004 both-direction Parent UAT.
--   C-2   consent is CENTRE-LEVEL. No per-object lookup, no table.
--   C-3   no scan gate, no scan state, no invented vocabulary.
--   D-5   NO DOWNLOAD CONTROL FOR ANY ROLE, Parent included, and no surface
--         may claim technical impossibility.
--   Bounded CLAUDE.md §12 authorization, 2026-08-12.
--
-- ===========================================================================
-- ⛔ ASSERTION E9 OF `20260812090000` IS RETIRED HERE, DELIBERATELY.
-- ===========================================================================
-- E9 read: "no evidence function may reference app_parent_reaches_student,
-- latest_submitted_version_id or 'parent' -- A-002 is UNRULED; P1-5 builds
-- it, not this phase." ▶ IT DID EXACTLY ITS JOB. It made "the parent arm was
-- deliberately not built" a MECHANICAL FACT rather than a promise in a
-- comment, for the whole time A-002 was unruled.
--
-- ⚠️ IT IS RETIRED BECAUSE ITS PREMISE WAS RULED AWAY, NOT BECAUSE IT WAS
-- INCONVENIENT. A-002 now places this access in Part 1, so an assertion that
-- the arm must not exist is asserting the opposite of the ratified rule.
--
-- ⛔ IT IS REPLACED, NOT DROPPED. E9 forbade the arm; its successor `P5-3`
-- below requires the arm AND requires it to be GATED. Removing a guard
-- without putting its successor in the same file is how a prohibition
-- becomes an absence nobody notices.
--
-- ⚠️ E9 still runs, and still passes, on a FRESH APPLY -- it executes at
-- `20260812090000`'s position, before this file exists. That is correct and
-- is not a contradiction: it records that the arm was absent AT THAT POINT
-- IN HISTORY, which was true. Do not "fix" it by editing that migration.
--
-- ===========================================================================
-- ⛔ WHAT THIS MIGRATION DOES NOT DO
--   - No table, column, enum value, policy or audit action string. The
--     registry stays at 19 and the census gains no object.
--   - No download affordance, and nothing here produces or implies one.
--   - No storage path crosses the boundary outward. The parent receives an
--     evidence id and a media type; the object key is DERIVED server-side
--     (A-001 gate 7).
--   - Q-27 IS UNTOUCHED. This is media. No rating reaches a parent surface,
--     DTO, projection, RPC result or client payload, in any form.
-- ===========================================================================


-- ===========================================================================
-- 1 . evidence_list_for_report -- the parent arm, mirroring RPC-13
-- ===========================================================================
-- ⚠️ THE GATE IS RESTRUCTURED INTO RPC-13's EXACT SHAPE, not extended beside
-- it. RPC-13 (`report_get_canonical`) resolves the caller's SINGLE ACTIVE
-- membership in the report's own centre, fails closed on zero or on more than
-- one, and gives every branch a NAMED LIVE PREDICATE with NO BRANCH
-- DEFAULTING TO PERMIT. A looser gate here would be a SIDE CHANNEL disclosing
-- evidence for reports the canonical read refuses (R-C2-6) -- and the parent
-- is precisely the caller for whom the two must agree.
CREATE OR REPLACE FUNCTION public.evidence_list_for_report(
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
  v_role       public.centre_membership_role;
  v_r          public.reports%ROWTYPE;
BEGIN
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  SELECT r.* INTO v_r
    FROM public.reports r
   WHERE r.class_session_id = p_class_session_id AND r.student_id = p_student_id;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT (pg_catalog.array_agg(m.role))[1] INTO v_role
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_role IS NULL THEN RETURN; END IF;

  IF v_role = 'trainer' THEN
    IF NOT public.app_trainer_reaches_session(v_r.class_session_id) THEN RETURN; END IF;
  ELSIF v_role = 'management' THEN
    NULL;  -- the single active management membership of this centre is the predicate
  ELSIF v_role = 'parent' THEN
    -- ⛔ A-001 GATES 3 AND 1, IN THAT ORDER. The link is LIVE (never a JWT
    --    claim, ADR-4), and the report must have REACHED SUBMITTED -- a
    --    parent never sees evidence attached to an unpublished report, the
    --    same rule that governs every other field on their surface.
    IF NOT public.app_parent_reaches_student(p_student_id) THEN RETURN; END IF;
    IF v_r.latest_submitted_version_id IS NULL THEN RETURN; END IF;
  ELSE
    RETURN;
  END IF;

  RETURN QUERY
    SELECT e.id, e.media_type, e.byte_size, e.created_at
      FROM public.report_evidence e
     WHERE e.report_id = v_r.id;
END;
$function$;

COMMENT ON FUNCTION public.evidence_list_for_report(uuid, uuid) IS
  'D-5/A-001/A-002: evidence metadata for a report detail surface. Gate MIRRORS '
  'RPC-13 step for step -- single active membership, named live predicate per '
  'role, no branch defaults to permit. PARENT ARM ADDED AT P1-5: live link AND '
  'a submitted report. Returns no storage path (A-001 gate 7).';


-- ===========================================================================
-- 2 . evidence_record_access -- the same arm, so evidence.accessed fires
--     on a PARENT mint
-- ===========================================================================
-- ⚠️ THIS IS THE ONLY TRACE THAT A SIGNED URL TO A CHILD'S VIDEO WAS MINTED,
--    FOR WHOM AND WHEN -- and it matters MORE for the parent than for anyone
--    else, because the parent is the audience outside the academy. C-3
--    removed scanning, which is exactly why this record is not optional.
--
-- ⛔ SUCCESS ONLY (A-057). A denied parent attempt emits NOTHING and returns
--    the same shape every other refusal here returns.
CREATE OR REPLACE FUNCTION public.evidence_record_access(
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

  -- THE SAME DISPATCH AS THE LIST READ, re-evaluated. Two gates that can
  -- drift apart is a side channel; these are written to move together.
  SELECT (pg_catalog.array_agg(m.id))[1], (pg_catalog.array_agg(m.role))[1]
    INTO v_membership_id, v_role
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN RETURN; END IF;

  IF v_role = 'trainer' THEN
    IF NOT public.app_trainer_reaches_session(v_r.class_session_id) THEN RETURN; END IF;
  ELSIF v_role = 'management' THEN
    NULL;
  ELSIF v_role = 'parent' THEN
    IF NOT public.app_parent_reaches_student(v_r.student_id) THEN RETURN; END IF;
    IF v_r.latest_submitted_version_id IS NULL THEN RETURN; END IF;
  ELSE
    RETURN;
  END IF;

  PERFORM public.audit_append_event(
    v_r.centre_id, v_account_id, v_membership_id, v_role,
    'evidence.accessed', NULL, NULL, NULL,
    'report_evidence', v_e.id, 'Evidence media',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('target_type', 'report', 'target_id', v_r.id::text, 'target_label', 'Report')
    ),
    -- ⛔ DATA MINIMIZATION (A-029). No child name, initial, account name,
    --    email or phone number reaches a row no erasure mechanism can touch.
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

COMMENT ON FUNCTION public.evidence_record_access(uuid) IS
  'D-5/A-057: authorizes ONE evidence view and emits evidence.accessed -- the '
  'only trace that a signed URL to a child video was minted, for whom and when. '
  'PARENT ARM ADDED AT P1-5, gated on a live link AND a submitted report. '
  'Success only; a denial emits nothing. Returns no storage path.';


-- ===========================================================================
-- 3 . IN-TRANSACTION ASSERTIONS
-- ===========================================================================
DO $assert$
DECLARE
  v_src text;
  v_n   integer;
BEGIN
  -- P5-1 -- the parent arm EXISTS on both reads. ⚠️ This is the assertion
  -- that replaces E9, and it points the opposite way on purpose.
  FOREACH v_src IN ARRAY ARRAY['evidence_list_for_report','evidence_record_access'] LOOP
    SELECT p.prosrc INTO v_src
      FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public' AND p.proname = v_src;
    IF v_src IS NULL OR v_src NOT LIKE '%app_parent_reaches_student%' THEN
      RAISE EXCEPTION 'P1-5 assertion P5-1 failed: an evidence read has no parent arm';
    END IF;
  END LOOP;

  -- P5-2 -- ⛔ AND IT IS GATED. An arm that exists but is ungated is worse
  -- than no arm: A-001 gate 1 requires a SUBMITTED report, so the parent
  -- branch must test latest_submitted_version_id, not merely the link.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname IN ('evidence_list_for_report','evidence_record_access')
     AND p.prosrc LIKE '%app_parent_reaches_student%'
     AND p.prosrc LIKE '%latest_submitted_version_id%';
  IF v_n <> 2 THEN
    RAISE EXCEPTION 'P1-5 assertion P5-2 failed: % of 2 evidence reads gate the parent arm on a SUBMITTED report', v_n;
  END IF;

  -- P5-3 -- neither read leaks a storage path (A-001 gate 7).
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   CROSS JOIN LATERAL pg_catalog.unnest(COALESCE(p.proargnames, ARRAY[]::text[])) AS a(nm)
   WHERE n.nspname = 'public'
     AND p.proname IN ('evidence_list_for_report','evidence_record_access')
     AND (a.nm ILIKE '%path%' OR a.nm ILIKE '%url%' OR a.nm ILIKE '%object%');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P1-5 assertion P5-3 failed: % path/url/object field(s) are returned to a caller', v_n;
  END IF;

  -- P5-4 -- the census did not move. No table, enum value, policy or audit
  -- action string; the registry stays at exactly 19.
  IF pg_catalog.array_length(public.audit_action_registry(), 1) <> 19 THEN
    RAISE EXCEPTION 'P1-5 assertion P5-4 failed: the audit registry is no longer 19';
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r';
  IF v_n <> 28 THEN
    RAISE EXCEPTION 'P1-5 assertion P5-4 failed: public holds % tables, expected 28', v_n;
  END IF;

  -- P5-5 -- ⛔ Q-27 IS UNTOUCHED. Neither evidence read may carry a rating or
  -- dimension field, and the canonical parent read is not redefined here.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   CROSS JOIN LATERAL pg_catalog.unnest(COALESCE(p.proargnames, ARRAY[]::text[])) AS a(nm)
   WHERE n.nspname = 'public'
     AND p.proname IN ('evidence_list_for_report','evidence_record_access')
     AND (a.nm ILIKE '%rating%' OR a.nm ILIKE '%dimension%' OR a.nm ILIKE '%band%'
          OR a.nm ILIKE '%grade%' OR a.nm ILIKE '%overall%');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P1-5 assertion P5-5 failed: an evidence read carries % rating-shaped field(s)', v_n;
  END IF;

  RAISE NOTICE 'P1-5 assertions P5-1..P5-5 PASS';
END;
$assert$;
