-- =====================================================================
-- CLAUDE.md §10 PHASE 1 EXIT CONDITION (b)
--
--   "an approved report's exact content is recoverable from its audit
--    trail by hash"
-- =====================================================================
-- One of the three exit conditions §10 requires be DEMONSTRATED before
-- Phase 1 is met. It was the last one still NOT-RUN: (a) is discharged by
-- the grounding proofs and INT-G3/INT-G5, and (c) by
-- prove-session-continuity.mjs. This file is (b).
--
-- ---------------------------------------------------------------------
-- WHAT "RECOVERABLE BY HASH" IS TAKEN TO MEAN, STATED BEFORE PROVING IT
-- ---------------------------------------------------------------------
-- A hash is not a decompressor: nobody reconstructs prose from a digest.
-- The governed claim is the one that actually matters for an audit
-- trail, and it is a BINDING claim:
--
--   given the audit trail alone, you can take any candidate content and
--   decide, without trusting the database, whether it is byte-for-byte
--   the content that was approved and submitted.
--
-- That requires four things to hold together, and this suite proves each
-- of them separately rather than asserting the conjunction:
--
--   B-1  the governed lifecycle actually reaches `submitted`;
--   B-2  the audit trail RECORDS a content hash for the submitted
--        version, and names the version it belongs to;
--   B-3  RECOMPUTING the hash from the persisted content reproduces the
--        recorded value EXACTLY -- so the audit row binds that content;
--   B-4  the audit row itself is tamper-evident: the append-only hash
--        chain verifies.
--
-- ---------------------------------------------------------------------
-- WHY THE NEGATIVE CONTROLS ARE NOT OPTIONAL
-- ---------------------------------------------------------------------
-- B-3 alone is satisfiable by a vacuous hash -- a constant, a hash of the
-- report id, a hash that ignores its inputs. Any of those would "match"
-- forever and bind nothing. So this suite also proves the binding is
-- TIGHT, by perturbing exactly one thing at a time and requiring the
-- hash to MOVE:
--
--   B-5  one character changed in ONE panel  -> different hash (x4, once
--        per panel, so no panel is silently outside the envelope);
--   B-6  one of the nine RATINGS changed     -> different hash. This is
--        the one most likely to be wrong: the assessment substance must
--        be inside the envelope, or the audit trail would bind the prose
--        while leaving the ratings free to drift.
--   B-7  the recorded hash is NOT reproducible by the V1 serializer --
--        i.e. the envelope version stamped on the row is the one that
--        actually produced the hash (G-05a item 7's false-provenance
--        defect, asserted rather than assumed).
--
-- Runs on a DISPOSABLE clone only. It commits a report lifecycle and
-- therefore audit rows, which is exactly why it must never touch the
-- canonical fixture database (whose ratified baseline is zero audit
-- events and zero report_versions).
-- =====================================================================

\set ON_ERROR_STOP on

-- Identity switching by real JWT claim, never by inserting rows behind
-- the governed RPCs. Same mechanism the accepted harnesses use.
CREATE FUNCTION pg_temp.xb_be(p_who text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM pg_catalog.set_config('request.jwt.claims', CASE p_who
    WHEN 'trainer'    THEN '{"sub":"d0000000-0000-4000-8000-000000000002","role":"authenticated"}'
    WHEN 'management' THEN '{"sub":"d0000000-0000-4000-8000-000000000001","role":"authenticated"}'
    WHEN 'parent'     THEN '{"sub":"d0000000-0000-4000-8000-000000000003","role":"authenticated"}'
    ELSE ''
  END, false);
END $$;

-- Nine deliberately MIXED ratings, so the rating perturbation in B-6 has
-- somewhere to move and the envelope is not exercised on a uniform set.
CREATE FUNCTION pg_temp.xb_nine() RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
  SELECT '[{"dimension_code":"body","rating":"mastered"},
           {"dimension_code":"emotion","rating":"developing"},
           {"dimension_code":"speech","rating":"mastering"},
           {"dimension_code":"tonality","rating":"developing"},
           {"dimension_code":"eye_contact","rating":"beginning"},
           {"dimension_code":"vocal_projection","rating":"beginning"},
           {"dimension_code":"emotional_expression","rating":"mastering"},
           {"dimension_code":"sentence_flow","rating":"developing"},
           {"dimension_code":"audience_awareness","rating":"mastered"}]'::jsonb
$$;

-- The nine ratings of a stored version, in the SAME hard-coded dimension
-- order the serializers pin. Derived from the persisted child rows, never
-- from the input we happened to send.
CREATE FUNCTION pg_temp.xb_ratings(p_version uuid)
RETURNS public.competency_rating[] LANGUAGE sql STABLE AS $$
  SELECT pg_catalog.array_agg(x.rating ORDER BY x.ord)
    FROM (
      SELECT rvr.rating,
             pg_catalog.array_position(
               ARRAY['body','emotion','speech','tonality','eye_contact',
                     'vocal_projection','emotional_expression','sentence_flow',
                     'audience_awareness']::text[],
               rvr.dimension_code::text) AS ord
        FROM public.report_version_ratings rvr
       WHERE rvr.report_version_id = p_version
    ) x
$$;

DO $suite$
DECLARE
  -- The P1-T09a expansion's LATER continuity session, and a student
  -- enrolled in that module and marked Present on it.
  --
  -- NOT the ratified fixture's own session/student pair: that pair already
  -- carries an observation, and `assessment_save_complete_and_open_report`
  -- correctly refuses a second one ("an observation already exists for
  -- this session and student"). Using a pair with no observation is what
  -- lets this suite drive the lifecycle FROM NOTHING through the governed
  -- RPCs, which is what XB-1 claims. It also means this proof exercises
  -- the P1-T09a fixture rather than only the Step 7F minimum.
  v_sess     CONSTANT uuid := 'e5000000-0000-4000-8000-000000000002';
  v_student  CONSTANT uuid := 'e2000000-0000-4000-8000-000000000001';
  v_rep      uuid;
  v_lv       integer;
  v_obs_lv   integer;
  v_st       public.report_status;
  v_ver      uuid;
  v_hash     text;
  v_final    uuid;
  v_status   public.report_status;
  v_audit    text;
  v_audit_n  integer;
  v_recomp   text;
  v_v        public.report_versions;
  v_ratings  public.competency_rating[];
  v_moved    text;
  v_panels   CONSTANT text[] := ARRAY['overview','strengths','areas_for_development','remarks'];
  v_i        integer;
  v_p        text[];
  v_chain    boolean;
  v_checked  bigint;
  v_head     boolean;
BEGIN
  -- -------------------------------------------------------------------
  -- B-1 -- drive the governed lifecycle to `submitted`, through the RPCs
  -- only. No status is written directly and no version row is inserted
  -- by hand; if any guard refuses, this suite fails here rather than
  -- proving a property of hand-made data.
  -- -------------------------------------------------------------------
  PERFORM pg_temp.xb_be('trainer');

  SELECT x.report_id, x.report_lock_version, x.observation_lock_version
    INTO v_rep, v_lv, v_obs_lv
    FROM public.assessment_save_complete_and_open_report(
           v_sess, v_student, NULL, NULL,
           ARRAY['confident-opening']::text[], ARRAY['pacing']::text[],
           'Exit condition (b) observation.', 'Exit condition (b) follow-up.', '',
           pg_temp.xb_nine()) AS x;

  SELECT x.status, x.lock_version, x.observation_lock_version INTO v_st, v_lv, v_obs_lv
    FROM public.report_request_draft(v_rep, v_lv) x;

  SELECT x.status, x.lock_version, x.report_version_id, x.content_hash
    INTO v_st, v_lv, v_ver, v_hash
    FROM public.report_store_draft(v_rep, v_lv, v_obs_lv,
      'A steady session: the opening was delivered from memory, and eye contact and projection both needed prompting throughout.',
      'Posture and gesture were confident and independent across every activity today.',
      'Eye contact needs continued support, and the voice did not yet carry to the back of the room.',
      'This report covers the full session, which the trainer observed from start to finish.') x;

  PERFORM public.report_update_checklist(v_rep, v_lv, v_ver, true, true, true);

  SELECT x.status, x.lock_version INTO v_st, v_lv
    FROM public.report_trainer_approve(v_rep, v_st, v_lv, v_ver, v_hash) x;

  PERFORM pg_temp.xb_be('management');
  PERFORM public.report_management_approve_and_submit(
    v_rep, v_lv, v_ver,
    (SELECT public.report_wording_hash_v2(rv.overview, rv.strengths,
                                          rv.areas_for_development, rv.remarks)
       FROM public.report_versions rv WHERE rv.id = v_ver));

  SELECT r.status, r.latest_submitted_version_id INTO v_status, v_final
    FROM public.reports r WHERE r.id = v_rep;

  IF v_status <> 'submitted' THEN
    RAISE EXCEPTION 'FAIL XB-1: the governed lifecycle ended at %, not submitted', v_status;
  END IF;
  IF v_final IS NULL THEN
    RAISE EXCEPTION 'FAIL XB-1: submitted, but latest_submitted_version_id is NULL';
  END IF;
  RAISE NOTICE 'PASS XB-1 -- the governed lifecycle reached submitted through the RPCs only';

  -- -------------------------------------------------------------------
  -- B-2 -- the AUDIT TRAIL records a content hash for the submitted
  -- version. Read from audit_events ONLY: nothing here consults the
  -- report tables, because the claim is about what the audit trail alone
  -- carries.
  -- -------------------------------------------------------------------
  SELECT pg_catalog.count(*)::integer INTO v_audit_n
    FROM public.audit_events e
   WHERE e.target_id = v_rep
     AND e.payload ? 'content_hash';
  IF v_audit_n = 0 THEN
    RAISE EXCEPTION 'FAIL XB-2: no audit event for this report carries a content_hash';
  END IF;

  SELECT e.payload ->> 'content_hash' INTO v_audit
    FROM public.audit_events e
   WHERE e.target_id = v_rep
     AND e.state_to = 'submitted'
     AND e.payload ? 'content_hash'
   ORDER BY e.seq_no DESC
   LIMIT 1;
  IF v_audit IS NULL THEN
    RAISE EXCEPTION 'FAIL XB-2: no submission audit event carries a content_hash';
  END IF;
  IF pg_catalog.length(v_audit) <> 64 THEN
    RAISE EXCEPTION 'FAIL XB-2: the recorded content_hash is % chars, not a 64-char sha256 hex', pg_catalog.length(v_audit);
  END IF;
  RAISE NOTICE 'PASS XB-2 -- % audit event(s) for this report carry a content_hash; the submission event records a 64-char digest', v_audit_n;

  -- -------------------------------------------------------------------
  -- B-3 -- RECOMPUTE from the persisted content and require an EXACT
  -- match. This is the binding: the audit trail's digest is reproducible
  -- from the content, so any candidate content can be checked against it.
  -- -------------------------------------------------------------------
  SELECT * INTO v_v FROM public.report_versions WHERE id = v_final;
  v_ratings := pg_temp.xb_ratings(v_final);

  IF pg_catalog.array_length(v_ratings, 1) IS DISTINCT FROM 9 THEN
    RAISE EXCEPTION 'FAIL XB-3: the submitted version carries % rating snapshots, not nine',
      pg_catalog.array_length(v_ratings, 1);
  END IF;

  v_recomp := public.report_content_hash_v2(
    v_v.overview, v_v.strengths, v_v.areas_for_development, v_v.remarks, v_ratings);

  IF v_recomp <> v_audit THEN
    RAISE EXCEPTION 'FAIL XB-3: recomputed % does not match the audited %', v_recomp, v_audit;
  END IF;
  IF v_v.content_hash <> v_audit THEN
    RAISE EXCEPTION 'FAIL XB-3: the stored content_hash differs from the audited one';
  END IF;
  RAISE NOTICE 'PASS XB-3 -- the audited digest is EXACTLY reproducible from the persisted content and its nine rating snapshots';

  -- -------------------------------------------------------------------
  -- B-4 -- the audit row itself is tamper-evident.
  -- -------------------------------------------------------------------
  -- `audit_verify_chain` returns a TABLE, not a boolean:
  --   (centre_id, mode, ok, events_checked, first_failed_seq, failed_check,
  --    anchor_seq, anchor_hash, head_checked)
  -- Read the named columns rather than coercing the whole record -- an
  -- earlier version of this suite did the latter and failed with
  -- "invalid input syntax for type boolean".
  --
  -- `events_checked` is asserted as well as `ok`, because a verifier that
  -- checked ZERO events would also report ok = true, and that is exactly
  -- the vacuous pass this leg must not accept.
  SELECT v.ok, v.events_checked, v.head_checked
    INTO v_chain, v_checked, v_head
    FROM public.audit_verify_chain(v_v.centre_id) v;

  IF v_chain IS NOT TRUE THEN
    RAISE EXCEPTION 'FAIL XB-4: the append-only audit hash chain does not verify';
  END IF;
  -- Written as an explicit null check rather than COALESCE: COALESCE is a
  -- SQL CONSTRUCT, not a function in pg_catalog, so the `pg_catalog.`
  -- qualification this file uses everywhere else cannot be applied to it.
  IF v_checked IS NULL OR v_checked < 1 THEN
    RAISE EXCEPTION 'FAIL XB-4: the chain verifier reported ok while checking % events -- a vacuous pass', v_checked;
  END IF;
  IF v_head IS NOT TRUE THEN
    RAISE EXCEPTION 'FAIL XB-4: the chain verified but its HEAD was not checked, so the tail is unanchored';
  END IF;
  RAISE NOTICE 'PASS XB-4 -- the append-only audit hash chain verifies over % event(s) with its head anchored, so the recorded digest is itself tamper-evident', v_checked;

  -- -------------------------------------------------------------------
  -- B-5 -- TIGHTNESS, per panel. Change ONE character in ONE panel and
  -- the digest must move. Run once per panel so that no panel is
  -- silently outside the envelope -- a serializer that omitted `remarks`
  -- would pass B-3 forever and fail only here.
  -- -------------------------------------------------------------------
  FOR v_i IN 1..4 LOOP
    v_p := ARRAY[v_v.overview, v_v.strengths, v_v.areas_for_development, v_v.remarks];
    v_p[v_i] := v_p[v_i] || '.';
    v_moved := public.report_content_hash_v2(v_p[1], v_p[2], v_p[3], v_p[4], v_ratings);
    IF v_moved = v_audit THEN
      RAISE EXCEPTION
        'FAIL XB-5: changing panel % (%) did NOT move the digest -- that panel is outside the hash envelope',
        v_i, v_panels[v_i];
    END IF;
  END LOOP;
  RAISE NOTICE 'PASS XB-5 -- all four panels are inside the envelope: a one-character change to ANY of them moves the digest';

  -- -------------------------------------------------------------------
  -- B-6 -- TIGHTNESS, ratings. The ASSESSMENT SUBSTANCE must be bound
  -- too. If only the prose were hashed, management could republish
  -- identical wording over different ratings and the audit trail would
  -- not notice -- which is precisely what A-034's rating-parity rule
  -- exists to prevent.
  -- -------------------------------------------------------------------
  FOR v_i IN 1..9 LOOP
    v_ratings := pg_temp.xb_ratings(v_final);
    v_ratings[v_i] := CASE WHEN v_ratings[v_i] = 'mastered' THEN 'beginning' ELSE 'mastered' END;
    v_moved := public.report_content_hash_v2(
      v_v.overview, v_v.strengths, v_v.areas_for_development, v_v.remarks, v_ratings);
    IF v_moved = v_audit THEN
      RAISE EXCEPTION
        'FAIL XB-6: changing rating % did NOT move the digest -- the assessment substance is outside the hash envelope',
        v_i;
    END IF;
  END LOOP;
  v_ratings := pg_temp.xb_ratings(v_final);
  RAISE NOTICE 'PASS XB-6 -- all nine ratings are inside the envelope: changing ANY one of them moves the digest';

  -- -------------------------------------------------------------------
  -- B-7 -- ENVELOPE PROVENANCE. The row stamps content_hash_version = 2,
  -- and the V2 serializer is what actually produced the digest. Asserted
  -- rather than assumed, because the M13 review already caught a path
  -- that stamped a V1 label on a V2-produced hash (G-05a item 7).
  -- -------------------------------------------------------------------
  IF v_v.content_hash_version <> 2 THEN
    RAISE EXCEPTION 'FAIL XB-7: the submitted version stamps content_hash_version %, not 2', v_v.content_hash_version;
  END IF;
  IF public.report_content_hash_v1(
       v_v.overview, v_v.strengths, v_v.areas_for_development, v_v.remarks, v_ratings) = v_audit THEN
    RAISE EXCEPTION 'FAIL XB-7: the V1 serializer reproduces the digest, so the envelope label is not distinguishing';
  END IF;
  RAISE NOTICE 'PASS XB-7 -- the digest is V2-produced, the row stamps 2, and V1 does NOT reproduce it (domain separation holds)';

  RAISE NOTICE 'EXIT CONDITION (b) DEMONSTRATED: an approved report''s exact content is recoverable from its audit trail by hash.';
END
$suite$;
