-- =====================================================================
-- B.E.S.T Coach -- Step 7I, migration 2 of 2: the governed report lifecycle
-- =====================================================================
-- Governing authority (highest first):
--   Specification v3 -> Amendment 001 -> Amendment 002 -> Amendment 003
--   -> Amendment 004 (A-033 ... A-040) -> CLAUDE.md -> Implementation Plan
--   -> docs/plan/STEP_7H_AUDIT_CHAIN_BASELINE.md
--   -> docs/plan/STEP_7I_REPORT_LIFECYCLE_BASELINE.md (R-1 ... R-33)
--
-- WHAT THIS MIGRATION CREATES -- the exhaustive A-040 set and nothing else:
--   * 2 enums ......... correction_issue_scope, correction_request_status
--   * 1 table ......... report_correction_requests (RLS enabled, zero
--                       policies, zero grants) + its one ratified partial
--                       unique index on status = 'open'
--   * 3 columns ....... report_versions.content_hash,
--                       report_versions.content_hash_version,
--                       report_versions.trainer_approved_source_version_id
--   * 4 constraint replacements + 1 column-default drop (A-040 item 5)
--   * 18 functions .... 15 RPC entry points + 1 authorization helper
--                       + 2 internal serializers
--   * 14 authenticated EXECUTE grants, and exactly 4 functions with ZERO
--     client EXECUTE (report_store_draft, both serializers,
--     app_parent_reaches_student)
--
-- The `trainer_approved` enum label was added by migration 1 and committed
-- there (U-7I-18). THIS is the only file permitted to reference it, and
-- EVERY function here is `plpgsql` -- no `LANGUAGE sql` and no SQL-standard
-- `BEGIN ATOMIC` body exists anywhere in Step 7I, so the parse-analysis
-- route to "unsafe use of new value" is closed twice over. See T7I-73.
--
-- WHAT THIS MIGRATION DELIBERATELY DOES NOT CREATE:
--   * no audit-registry extension -- every Step 7I event uses an action
--     already in the ratified 16-action registry, so neither
--     audit_append_event nor audit_verify_chain is replaced (R-29);
--   * no notification table, enum, outbox row or delivery mechanism -- the
--     three outbox insertion points are marked in comments only (R-21b);
--   * no RLS policy and no table grant of any kind -- the only new
--     client-reachable surface is EXECUTE on fourteen functions;
--   * no guard trigger on any report-lifecycle table (U-7I-9): zero client
--     DML makes them unreachable, Step 7E assigned freezing to "the Step 7I
--     transition functions", and a naive append-only trigger would break
--     T11's write-once submission fields;
--   * no evidence representation of any kind (T7I-42);
--   * no assessment-write or observation-read RPC -- those are Backend
--     Round B2 under docs/plan/PHYSICAL_TEST_ASSESSMENT_WRITE_BASELINE.md;
--   * no server action, no AI code, no generated type, no UI.
--
-- WHY RLS DOES NO WORK INSIDE THESE FUNCTIONS -- the accurate mechanism.
-- It is NOT that SECURITY DEFINER bypasses RLS; it does not. These RPCs
-- execute as `postgres`, which OWNS every table they touch, and no table
-- carries FORCE ROW LEVEL SECURITY. A table owner bypasses RLS unless RLS
-- is forced. Two standing invariants follow: (a) FORCE ROW LEVEL SECURITY
-- must never be added to a report-lifecycle table without re-deriving every
-- RPC's access; (b) if the deferred U-22 restricted NOLOGIN definer owner is
-- ever adopted, that owner is neither the table owner nor BYPASSRLS, so
-- every RPC would become fully RLS-evaluated against zero policies and
-- silently read and write nothing. Because RLS is inert here, EVERY
-- authorization check below is explicit and fail-closed, and
-- audit_append_event independently re-proves the actor triple.
--
-- AUTHORED ERROR CATALOGUE (section 8.6: minimal, non-disclosing, never
-- interpolating row content, hashes of unpublished content, a correction
-- reason, a credential or an environment value). SQLSTATE class 'BC' is
-- outside every class the SQL standard defines.
--   BC001  not found / not permitted     -- identical whether the target
--                                           exists or not
--   BC002  not available                 -- authorized, nothing to show
--   BC003  stale state                   -- a CAS expectation failed
--   BC004  illegal transition            -- from/to pair is not one of the
--                                           fourteen legal pairs
--   BC005  incomplete checklist          -- trainer approve gate
--   BC006  caller content-hash mismatch  -- stale render, trainer side
--   BC007  stored content-hash anomaly   -- DATA-INTEGRITY incident
--   BC008  wording-hash mismatch         -- stale render, management side
--   BC009  missing trainer-approval lineage
--   BC010  rating parity failure         -- DATA-INTEGRITY incident
--   BC011  prior approval on target version (R-7a)
--   BC012  checklist Gate A -- target version holds an approval row
--   BC013  checklist Gate B -- target version is management-authored
--   BC014  duplicate                     -- constraint name preserved in
--                                           the CONSTRAINT diagnostic
--   BC015  attendance not `present` (a missing row fails closed)
--   BC016  enrolment not active
--   BC017  scheduled session start not reached (Asia/Singapore)
--   BC018  observation/snapshot completeness (not exactly nine)
--   BC019  observation lock-version mismatch (R-21a)
--   BC020  degenerate content (all four panels blank)
--   BC021  reaffirmation required or invalid (R-7b)
--   BC022  correction-request argument invalid
--   BC023  a correction request is already open for this report
--   BC024  the report already holds a version (R-11a)
--   BC025  observation argument missing
-- =====================================================================

-- ---------------------------------------------------------------------
-- P-1 execution-role guard (fail closed, before any change)
-- ---------------------------------------------------------------------
DO $guard$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION
      'Step 7I migration 2 aborted before any change: this migration must run as postgres, not "%". '
      'Objects created by supabase_admin in schema public would inherit its default ACL '
      '(ALL to anon/authenticated/service_role) -- the exact hazard P-1 exists to prevent.',
      current_user;
  END IF;
END;
$guard$;

-- ---------------------------------------------------------------------
-- 0/9 -- Emptiness precondition (T7I-44)
-- ---------------------------------------------------------------------
-- `content_hash` is added NOT NULL with no DEFAULT, and four constraints
-- are replaced with stricter or differently-shaped ones. Both are safe only
-- because the five report tables are provably empty (Step 7F Option B
-- ratifies zero report rows, and the fixture loader aborts unless all five
-- are at zero). Assert it rather than assume it: abort before any change.
DO $precondition$
DECLARE
  v_table text;
  v_n     bigint;
BEGIN
  FOREACH v_table IN ARRAY ARRAY[
    'reports', 'report_versions', 'report_version_ratings',
    'report_version_checklist_progress', 'report_version_approvals'
  ] LOOP
    EXECUTE pg_catalog.format('SELECT pg_catalog.count(*) FROM public.%I', v_table) INTO v_n;
    IF v_n <> 0 THEN
      RAISE EXCEPTION
        'Step 7I migration 2 aborted before any change: public.% holds % row(s); '
        'the NOT NULL content_hash column and the four constraint replacements '
        'are authorized only against provably empty report tables (T7I-44).',
        v_table, v_n;
    END IF;
  END LOOP;
END;
$precondition$;

-- ---------------------------------------------------------------------
-- 1/9 -- The two correction-vocabulary enums (A-040 item 2)
-- ---------------------------------------------------------------------
-- Closed, workflow-bearing and not runtime-editable, so enums rather than
-- reference tables (A-026).

-- What KIND of thing management says is wrong. Exactly these three: each is
-- an assessment-level fact whose correction requires the trainer, never a
-- management wording edit (A-034).
CREATE TYPE public.correction_issue_scope AS ENUM (
  'rating',
  'observation',
  'assessment_fact'
);

COMMENT ON TYPE public.correction_issue_scope IS
  'Step 7I (A-035/A-040): the closed issue-scope vocabulary of a management return-to-trainer. Every value names an assessment-level fact that management may never edit directly.';

-- Exactly two values. A `withdrawn` value was considered and REJECTED: no
-- ratified operation withdraws a request, and A-026 forbids inventing an
-- enum value for an unratified workflow. Resolution is a side effect of
-- trainer reapproval, never a standalone operation.
CREATE TYPE public.correction_request_status AS ENUM (
  'open',
  'resolved'
);

COMMENT ON TYPE public.correction_request_status IS
  'Step 7I (A-035/A-040): correction-request lifecycle. Exactly two values -- a request is closed only by the trainer approval that resolves it, so it can never be closed without the corrective work actually being approved.';

-- ---------------------------------------------------------------------
-- 2/9 -- The three new report_versions columns (A-040 item 3; R-13)
-- ---------------------------------------------------------------------
-- CORRECTION RECORDED IN THE SCHEMA ITSELF (U-7I-1). The Step 7E migration
-- omitted `content_hash` with a written comment forecasting that "it
-- therefore arrives with Step 7H". Step 7H's ratified baseline scoped that
-- checkpoint to audit objects only and did not include the column. The 7E
-- comment was a forecast, not a ratified assignment. The column arrives
-- HERE, at the checkpoint that gives it meaning; the 7E file is never
-- edited, so the correction is attached as a COMMENT below where a reader
-- of the live schema will find it.

ALTER TABLE public.report_versions
  ADD COLUMN content_hash text NOT NULL,
  ADD COLUMN content_hash_version smallint NOT NULL DEFAULT 1,
  ADD COLUMN trainer_approved_source_version_id uuid NULL;

ALTER TABLE public.report_versions
  ADD CONSTRAINT report_versions_content_hash_chk
    CHECK (content_hash ~ '^[0-9a-f]{64}$'),
  ADD CONSTRAINT report_versions_content_hash_version_chk
    CHECK (content_hash_version = 1),
  -- The trainer-approved ROOT of this version's publication lineage must be
  -- a version of the SAME report. Composite FK against the shipped
  -- report_versions_id_report_key candidate key, in the Step 7E style.
  ADD CONSTRAINT report_versions_trainer_approved_source_fk
    FOREIGN KEY (trainer_approved_source_version_id, report_id)
    REFERENCES public.report_versions (id, report_id) ON DELETE RESTRICT;

COMMENT ON COLUMN public.report_versions.content_hash IS
  'Step 7I (R-13/U-7I-1): SHA-256 of the BESTCOACH-REPORT-CONTENT-V1 envelope over the four parent-facing panels AND the nine rating snapshots. CORRECTION, RECORDED RATHER THAN MADE SILENTLY: the Step 7E migration forecast that this column would "arrive with Step 7H"; the ratified Step 7H baseline scoped that checkpoint to audit objects only, so the column arrives with Step 7I -- the checkpoint that produces and consumes it. It is a content IDENTITY, not an address: deliberately NOT unique (a T12 clone initially carries its source hash, and a reverting wording edit may legitimately reproduce an earlier one). NEVER returned to management or to a parent: panels + this hash recover the exact per-dimension rating grid in 4^9 = 262,144 trials (R-26).';

COMMENT ON COLUMN public.report_versions.content_hash_version IS
  'Step 7I (R-13): the envelope version that produced content_hash, mirroring audit_events.canonical_version. Without it the algorithm behind a stored hash is unrecoverable from the row. A future envelope increments this value and ships a PARALLEL serializer; committed rows are never re-serialized.';

COMMENT ON COLUMN public.report_versions.trainer_approved_source_version_id IS
  'Step 7I (A-040/U-7I-17): the ROOT trainer-approved version of this version''s publication lineage -- NOT its immediate predecessor, which is derived_from_version_id. NULL on every version that is itself trainer-approved or that precedes trainer approval; set ONLY by the management wording edit (T9). A second wording edit points at the SAME root, so the lineage never drifts through an intermediate management version.';

-- ---------------------------------------------------------------------
-- 3/9 -- Four constraint replacements and one default drop (A-040 items 4-5)
-- ---------------------------------------------------------------------

-- (i) WIDEN report_versions authorship to trainer-or-management. A-034 lets
--     management author a wording-only version, and that version must be
--     attributable. The composite FK still proves the membership genuinely
--     holds the stamped role, so an impersonating stamp stays impossible.
ALTER TABLE public.report_versions
  DROP CONSTRAINT report_versions_authored_by_role_pinned_chk;
ALTER TABLE public.report_versions
  ADD CONSTRAINT report_versions_authored_by_role_pinned_chk
    CHECK (authored_by_role IS NULL OR authored_by_role IN ('trainer', 'management'));

-- (ii) NARROW report_versions submission to management ONLY. Under A-033
--      management is the sole publisher; the Step 7E pin to 'trainer' was
--      correct for the superseded single-stage workflow and is now wrong.
--      This is the one A-040 change that REDUCES what the schema permits.
ALTER TABLE public.report_versions
  DROP CONSTRAINT report_versions_submitted_by_role_pinned_chk;
ALTER TABLE public.report_versions
  ADD CONSTRAINT report_versions_submitted_by_role_pinned_chk
    CHECK (submitted_by_role IS NULL OR submitted_by_role = 'management');

-- (iii) WIDEN the approvals primary key to (version, role), so at most ONE
--       trainer approval and at most ONE management approval may ever exist
--       per version. "At most one of each" is a ceiling, not a requirement:
--       no version ever requires both, and whenever management edits wording
--       the published version carries only a management approval (R-12a).
ALTER TABLE public.report_version_approvals
  DROP CONSTRAINT report_version_approvals_pkey;
ALTER TABLE public.report_version_approvals
  ADD CONSTRAINT report_version_approvals_pkey
    PRIMARY KEY (report_version_id, approver_role);

-- (iv) WIDEN the approver-role pin to trainer-or-management.
ALTER TABLE public.report_version_approvals
  DROP CONSTRAINT report_version_approvals_approver_role_pinned_chk;
ALTER TABLE public.report_version_approvals
  ADD CONSTRAINT report_version_approvals_approver_role_pinned_chk
    CHECK (approver_role IN ('trainer', 'management'));

-- (v) DROP the approver_role DEFAULT (A-040 item 5; U-7I-22). Under the
--     single-column primary key a defaulted role was harmless. Under the
--     COMPOSITE key it is not: an INSERT omitting the role would silently
--     become a TRAINER approval that can coexist with a genuine one -- a
--     fabricated approval manufactured by omission, precisely what A-037
--     forbids. With no default, an omission fails loudly on NOT NULL.
ALTER TABLE public.report_version_approvals
  ALTER COLUMN approver_role DROP DEFAULT;

COMMENT ON COLUMN public.report_version_approvals.approver_role IS
  'Step 7I (A-040 item 5 / U-7I-22): the approving role, ALWAYS supplied explicitly and NEVER defaulted. Part of the composite primary key, CHECK-pinned to trainer-or-management, and proven by composite FK against a membership genuinely holding that role. Restoring a DEFAULT here is a CLAUDE.md section 12 stop-and-ask.';

-- ---------------------------------------------------------------------
-- 4/9 -- The correction-request record (A-035/A-040 item 3; R-25)
-- ---------------------------------------------------------------------
-- Table 26/26. Exactly the ratified minimum representation and nothing more.
CREATE TABLE public.report_correction_requests (
  id                          uuid                                NOT NULL DEFAULT gen_random_uuid(),
  centre_id                   uuid                                NOT NULL,
  report_id                   uuid                                NOT NULL,
  report_version_id           uuid                                NOT NULL,
  issue_scope                 public.correction_issue_scope       NOT NULL,
  dimension_code              public.dimension_code               NULL,
  reason                      text                                NOT NULL,
  requested_by_membership_id  uuid                                NOT NULL,
  requester_role              public.centre_membership_role       NOT NULL,
  requested_at                timestamptz                         NOT NULL DEFAULT now(),
  status                      public.correction_request_status    NOT NULL DEFAULT 'open',
  resolved_at                 timestamptz                         NULL,
  resolved_by_membership_id   uuid                                NULL,
  resolver_role               public.centre_membership_role       NULL,
  resolving_version_id        uuid                                NULL,

  CONSTRAINT report_correction_requests_pkey PRIMARY KEY (id),

  -- Centre and report agreement, proven structurally in the Step 7E style
  -- against the shipped reports_id_centre_key candidate key. This is why
  -- centre_id is a column here rather than an inference: NONE of the three
  -- composite foreign keys below is declarable without it.
  CONSTRAINT report_correction_requests_report_fk
    FOREIGN KEY (report_id, centre_id)
    REFERENCES public.reports (id, centre_id) ON DELETE RESTRICT,

  -- The exact version under review when the issue was raised, same-report
  -- by construction.
  CONSTRAINT report_correction_requests_version_fk
    FOREIGN KEY (report_version_id, report_id)
    REFERENCES public.report_versions (id, report_id) ON DELETE RESTRICT,

  -- The version whose trainer approval resolved the request, same-report by
  -- construction. Stated explicitly at Step 7I1D-R2: it was previously the
  -- one version reference with no declared constraint.
  CONSTRAINT report_correction_requests_resolving_version_fk
    FOREIGN KEY (resolving_version_id, report_id)
    REFERENCES public.report_versions (id, report_id) ON DELETE RESTRICT,

  CONSTRAINT report_correction_requests_dimension_fk
    FOREIGN KEY (dimension_code)
    REFERENCES public.assessment_dimensions (code) ON DELETE RESTRICT,

  -- Creator: role-pinned to management by CHECK and by composite FK to a
  -- membership genuinely holding that role. Only management returns.
  CONSTRAINT report_correction_requests_requester_role_pinned_chk
    CHECK (requester_role = 'management'),
  CONSTRAINT report_correction_requests_requester_fk
    FOREIGN KEY (requested_by_membership_id, centre_id, requester_role)
    REFERENCES public.centre_memberships (id, centre_id, role) ON DELETE RESTRICT,

  -- Resolver: role-pinned to trainer the same way. Only a trainer resolves.
  CONSTRAINT report_correction_requests_resolver_role_pinned_chk
    CHECK (resolver_role IS NULL OR resolver_role = 'trainer'),
  CONSTRAINT report_correction_requests_resolver_fk
    FOREIGN KEY (resolved_by_membership_id, centre_id, resolver_role)
    REFERENCES public.centre_memberships (id, centre_id, role) ON DELETE RESTRICT,

  -- A rating issue names its dimension; every other scope must not.
  CONSTRAINT report_correction_requests_dimension_scope_chk
    CHECK ((issue_scope = 'rating') = (dimension_code IS NOT NULL)),

  -- Bounded prose, never an unrestricted note field (A-035). The 2,000
  -- character bound is an operator decision, not a placeholder (U-27).
  CONSTRAINT report_correction_requests_reason_chk
    CHECK (length(btrim(reason)) > 0 AND length(reason) <= 2000),

  -- All five resolution fields are NULL while `open` and all five are
  -- jointly non-NULL when `resolved`. No partial resolution is
  -- representable.
  CONSTRAINT report_correction_requests_resolution_chk
    CHECK (
      (status = 'open'
        AND resolved_at IS NULL
        AND resolved_by_membership_id IS NULL
        AND resolver_role IS NULL
        AND resolving_version_id IS NULL)
      OR
      (status = 'resolved'
        AND resolved_at IS NOT NULL
        AND resolved_by_membership_id IS NOT NULL
        AND resolver_role IS NOT NULL
        AND resolving_version_id IS NOT NULL)
    )
);

COMMENT ON TABLE public.report_correction_requests IS
  'Step 7I (A-035/A-040): the record of a management return-to-trainer. Carries the report, the exact version under review, a closed issue scope, the affected dimension where the scope is a rating, and bounded reason prose. The REASON NEVER ENTERS AN AUDIT EVENT (R-30/B-7I-4): an audit row is permanent and unredactable and PDPA erasure is deferred to Phase 4, so audit references the request by id only. Resolution is a side effect of trainer reapproval, never a standalone operation. Zero client privileges; RLS enabled with zero policies.';

-- At most one OPEN request per report. Partial, so resolved history never
-- blocks a later request -- the Step 7E pattern.
CREATE UNIQUE INDEX report_correction_requests_one_open_per_report_idx
  ON public.report_correction_requests (report_id)
  WHERE status = 'open';

-- RLS ENABLED with ZERO policies. Zero grants is NOT the same as RLS
-- enabled, and the distinction is not academic: the committed fixture
-- verifier's label A32 counts EVERY relation in `public` and fails if any
-- has NOT relrowsecurity, so a table shipped without RLS enabled would fail
-- A32 indistinguishably from a real posture regression.
ALTER TABLE public.report_correction_requests ENABLE ROW LEVEL SECURITY;

-- Explicit revoke, in the Step 7E/7H style. The default ACL already denies;
-- this makes the posture stated rather than inherited.
REVOKE ALL ON TABLE public.report_correction_requests
  FROM PUBLIC, anon, authenticated, service_role;

-- ---------------------------------------------------------------------
-- 5/9 -- The two internal serializers (R-13, section 4.6)
-- ---------------------------------------------------------------------
-- Both are ARGUMENT-PURE: every hashed value arrives as a parameter and
-- NEITHER READS A TABLE. That is what makes IMMUTABLE factually correct
-- rather than merely asserted, and it is a HARD REQUIREMENT rather than a
-- style choice: report_version_ratings rows are FK children that cannot
-- exist until after the report_versions row is INSERTed, so a serializer
-- that resolved ratings by reading the table would hash an empty rating
-- set, and no ordering, DEFAULT or deferral could repair that while
-- content_hash is NOT NULL.
--
-- Both are LANGUAGE plpgsql. The content serializer must RAISE on a rating
-- array that is not exactly nine non-NULL elements, which a LANGUAGE sql
-- body cannot do cleanly. Neither references 'trainer_approved', so the
-- A-040 enum-sequencing constraint does not reach them -- but section 5.1
-- pins every Step 7I function to plpgsql regardless.
--
-- Both are SECURITY INVOKER: invoker rights are safe precisely because
-- their only legitimate callers already run as `postgres`. Neither is
-- STRICT -- the four panel columns are NULLABLE and a NULL panel is a
-- legal, meaningful value serialized as the `N` tag.
--
-- Envelope grammar (the ratified Step 7H section 4.2 form): a
-- domain-separation line, LF-terminated, then fixed field blocks, each
--   name ':' 'N'                                    (SQL NULL), or
--   name ':V:' <utf8-byte-length> ':' <value-bytes> (present)
-- each terminated by exactly one LF (0x0A). Length-prefixing makes raw
-- bytes safe regardless of content, so NO Unicode normalization, trimming
-- or case folding is applied on either hash path, ever.

CREATE FUNCTION public.report_content_hash_v1(
  p_todays_strength     text,
  p_next_focus          text,
  p_practice_suggestion text,
  p_session_takeaway    text,
  p_ratings             public.competency_rating[]
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
PARALLEL SAFE
SECURITY INVOKER
SET search_path = ''
AS $fn$
DECLARE
  -- Rating order is pinned to this HARD-CODED nine-element list, in
  -- dimension_code enum declaration order. It is DELIBERATELY not keyed to
  -- assessment_dimensions.sort_order -- an ordinary mutable column
  -- protected by no trigger -- because a future display-ordering change
  -- would otherwise silently invalidate every historical hash. That the
  -- list happens to equal the seeded sort_order 1-9 is an observation, not
  -- the authority.
  v_dims CONSTANT text[] := ARRAY[
    'body', 'emotion', 'speech', 'tonality', 'eye_contact',
    'vocal_projection', 'emotional_expression', 'sentence_flow',
    'audience_awareness'
  ];
  v_names CONSTANT text[] := ARRAY[
    'content_version', 'todays_strength', 'next_focus',
    'practice_suggestion', 'session_takeaway'
  ];
  v_vals   text[];
  v_lf     CONSTANT text := pg_catalog.chr(10);
  v_pre    text;
  v_i      integer;
BEGIN
  IF p_ratings IS NULL OR pg_catalog.array_length(p_ratings, 1) IS DISTINCT FROM 9 THEN
    RAISE EXCEPTION
      'report_content_hash_v1: p_ratings must be a nine-element array (fixed arity, section 4.6)';
  END IF;
  FOR v_i IN 1..9 LOOP
    IF p_ratings[v_i] IS NULL THEN
      RAISE EXCEPTION
        'report_content_hash_v1: p_ratings element % is NULL; nine non-NULL ratings are required', v_i;
    END IF;
  END LOOP;

  v_vals := ARRAY[
    '1',
    p_todays_strength,
    p_next_focus,
    p_practice_suggestion,
    p_session_takeaway
  ];

  v_pre := 'BESTCOACH-REPORT-CONTENT-V1' || v_lf;
  FOR v_i IN 1..5 LOOP
    IF v_vals[v_i] IS NULL THEN
      v_pre := v_pre || v_names[v_i] || ':N' || v_lf;
    ELSE
      v_pre := v_pre || v_names[v_i] || ':V:'
        || pg_catalog.octet_length(v_vals[v_i])::text || ':' || v_vals[v_i] || v_lf;
    END IF;
  END LOOP;
  FOR v_i IN 1..9 LOOP
    v_pre := v_pre || v_dims[v_i] || ':V:'
      || pg_catalog.octet_length(p_ratings[v_i]::text)::text || ':'
      || p_ratings[v_i]::text || v_lf;
  END LOOP;

  RETURN pg_catalog.encode(
    pg_catalog.sha256(pg_catalog.convert_to(v_pre, 'UTF8')), 'hex');
END;
$fn$;

COMMENT ON FUNCTION public.report_content_hash_v1(text, text, text, text, public.competency_rating[]) IS
  'Step 7I (R-13, section 4.6): the FULL CONTENT IDENTITY of a report version -- SHA-256 over the BESTCOACH-REPORT-CONTENT-V1 length-prefixed envelope covering the four parent-facing panels AND the nine ratings, in a hard-coded dimension order. Argument-pure: reads no table. Raises unless p_ratings is exactly nine non-NULL elements. TRAINER-ONLY by policy: the value it produces must never reach management or a parent, because panels + this hash recover the exact per-dimension rating grid in 4^9 trials (R-26). Zero client EXECUTE.';

CREATE FUNCTION public.report_wording_hash_v1(
  p_todays_strength     text,
  p_next_focus          text,
  p_practice_suggestion text,
  p_session_takeaway    text
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
PARALLEL SAFE
SECURITY INVOKER
SET search_path = ''
AS $fn$
DECLARE
  v_names CONSTANT text[] := ARRAY[
    'content_version', 'todays_strength', 'next_focus',
    'practice_suggestion', 'session_takeaway'
  ];
  v_vals  text[];
  v_lf    CONSTANT text := pg_catalog.chr(10);
  v_pre   text;
  v_i     integer;
BEGIN
  v_vals := ARRAY[
    '1',
    p_todays_strength,
    p_next_focus,
    p_practice_suggestion,
    p_session_takeaway
  ];

  -- Domain-separated from the content envelope. The two share NO preimage,
  -- so neither can ever be confused for or substituted for the other.
  v_pre := 'BESTCOACH-REPORT-WORDING-V1' || v_lf;
  FOR v_i IN 1..5 LOOP
    IF v_vals[v_i] IS NULL THEN
      v_pre := v_pre || v_names[v_i] || ':N' || v_lf;
    ELSE
      v_pre := v_pre || v_names[v_i] || ':V:'
        || pg_catalog.octet_length(v_vals[v_i])::text || ':' || v_vals[v_i] || v_lf;
    END IF;
  END LOOP;

  RETURN pg_catalog.encode(
    pg_catalog.sha256(pg_catalog.convert_to(v_pre, 'UTF8')), 'hex');
END;
$fn$;

COMMENT ON FUNCTION public.report_wording_hash_v1(text, text, text, text) IS
  'Step 7I (R-13/R-26, section 4.6): the PARENT-FACING WORDING IDENTITY -- SHA-256 over the BESTCOACH-REPORT-WORDING-V1 envelope covering the four panels ONLY. NEVER STORED: computed on demand by the management read and re-verified by both management mutations, so it cannot drift from the content it describes. This is management''s "this is the exact text I approved" proof, and it leaks nothing because it checksums data the reader already holds in full. Zero client EXECUTE.';

-- ---------------------------------------------------------------------
-- 6/9 -- The parent-reach authorization helper (R-31)
-- ---------------------------------------------------------------------
-- Step 7G-helper posture in every respect except EXECUTE. Created here
-- because no existing helper expresses parent -> student reach.
--
-- OWNER-ONLY, and this is a deliberate minimum-privilege decision rather
-- than a leak fix (recorded honestly): its only Step 7I consumer is
-- RPC-13's parent branch, and RPC-13 is SECURITY DEFINER owned by
-- `postgres`, so inside it current_user IS postgres and the helper is
-- reachable BY OWNERSHIP -- no grant exists or is needed. Step 7I adds no
-- RLS policy, so an `authenticated` grant here would ship a grant AHEAD of
-- its policy, inverting the Step 7G rule that a policy and its minimum
-- matching grant ship together. A later checkpoint MAY grant it, but only
-- together with the policy or client consumer that needs it.
CREATE FUNCTION public.app_parent_reaches_student(p_student_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_ok boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
      FROM public.parent_student_links l
      JOIN public.centre_memberships m ON m.id = l.parent_membership_id
      JOIN public.accounts a           ON a.id = m.account_id
     WHERE auth.uid() IS NOT NULL
       AND a.auth_user_id = auth.uid()
       AND a.status = 'active'
       AND l.student_id = p_student_id
       AND l.is_active
       AND m.status = 'active'
       AND m.role = 'parent'
  ) INTO v_ok;
  RETURN COALESCE(v_ok, false);
END;
$fn$;

COMMENT ON FUNCTION public.app_parent_reaches_student(uuid) IS
  'Step 7I (R-31) authorization helper: true when the auth.uid() caller holds an ACTIVE parent membership owning an ACTIVE parent_student_links row for exactly this student. Fail-closed on unauthenticated, unlinked, deactivated or role-mismatched callers. OWNER-ONLY in Step 7I -- zero client EXECUTE, reached by ownership from RPC-13''s parent branch. The authenticated grant is withheld until a real policy or client consumer ships WITH it (Step 7G rule, inverted).';

-- ---------------------------------------------------------------------
-- 7/9 -- The fifteen governed RPC entry points (R-14 ... R-16)
-- ---------------------------------------------------------------------
-- Shared posture for all fifteen: LANGUAGE plpgsql, owner `postgres` under
-- the P-1 guard, SECURITY DEFINER, SET search_path = '', fully qualified
-- references, no dynamic SQL.
--
-- R-18a -- THE AGGREGATE MUTEX RULE. The `reports` row is the mutex for the
-- entire report aggregate. Every mutation RPC acquires it as its first
-- authoritative statement (SELECT ... FOR UPDATE) and performs EVERY read
-- and write of report_versions, report_version_ratings,
-- report_version_checklist_progress, report_version_approvals and
-- report_correction_requests for that report only while holding it. A bare
-- guarded UPDATE is a correct compare-and-set under READ COMMITTED, but
-- that is sufficient ONLY for an RPC that reads nothing before writing --
-- which is none of the interesting ones. Without the explicit lock those
-- pre-reads run on a snapshot a concurrent writer can invalidate and the
-- serialization proofs collapse.
--
-- R-14 -- LOCK-VERSION DISCIPLINE. Every committed aggregate mutation bumps
-- reports.lock_version by exactly 1, INCLUDING the two status-preserving
-- mutations (T5 and T9), which move current_cycle_version_id and are
-- therefore aggregate changes. Approve & Submit performs two transitions
-- and bumps TWICE. report_update_checklist VALIDATES the expected
-- lock_version without bumping it -- a checklist tick is not a content
-- change and must not invalidate a concurrent editor's expectations.
--
-- R-28 -- ACTOR RESOLUTION is role-specific and fail-closed on both sides:
-- a trainer entry point resolves THE SINGLE active `trainer` membership of
-- the caller's account in the report's centre; a management entry point
-- resolves THE SINGLE active `management` membership. Both use the
-- HAVING count(*) = 1 discipline, so zero matches and ambiguous matches are
-- both treated as no identity. audit_append_event then re-proves the same
-- triple independently.
--
-- AUDIT ATOMICITY. Every mutation RPC that emits an event calls
-- audit_append_event IN THE CALLER'S TRANSACTION -- the same transaction as
-- its business write -- after all guards pass and the business write
-- succeeds. report_update_checklist emits no event, so "every mutation RPC
-- appends" is deliberately NOT claimed.
--
-- THE STATE TRIPLE IS A CONVENTION, NOT A FUNCTION. audit_append_event
-- performs no validation of state_domain/state_from/state_to, audit_events
-- carries no CHECK on them, and audit_verify_chain does not inspect them, so
-- a partial triple would be silently hashed into permanent evidence. Step 7I
-- therefore writes the triple through ONE REVIEWED TEXTUAL CONVENTION,
-- identical at every emitting call site: state_domain is always the literal
-- 'report' and state_from/state_to are always exact report_status labels on
-- a state-change event, and all three are jointly NULL on a
-- report_version.created event. Adding a shared constructor function would
-- make this migration create NINETEEN functions and fail its own census
-- assertion, so divergence is prevented by review plus test rather than by
-- structure -- and the tests prove the shape at EVERY call site, not at one
-- representative site. The same is true of the trainer-approved-source
-- resolution rule, likewise inlined at both of its call sites.
--
-- AUDIT LABELS CARRY NO DIRECT PII (R-30). Targets are identified by UUID
-- and labels are generic constants: 'Report', 'Report version', 'Student',
-- 'Class session', 'Observation', 'Correction request'. audit_events is
-- append-only by trigger and by zero privilege, audit_verify_chain treats
-- any alteration as a break, and Step 7H forbids repair "ever" -- so Step 7I
-- must never be the checkpoint that writes a child's identifying name into
-- a row no erasure mechanism can touch.

-- =====================================================================
-- RPC-1 -- report_create (T0: null -> incomplete) [fwd]
-- =====================================================================
-- R-4 LAZY, TRAINER-ACTOR CREATION. The aggregate is created by the
-- assigned trainer's explicit lifecycle action, never by roster
-- initialization. That satisfies "no report exists for an absent student"
-- structurally and gives every report.created event a real authenticated
-- trainer actor.
--
-- The enrolment id is RESOLVED here, never an argument: reports_enrolment_fk
-- proves only module-and-student agreement and does NOT read is_active, and
-- only the active row is unique. p_observation_id is REQUIRED even though
-- the column is nullable in DDL, because reports_observation_key permits
-- many NULLs and the duplicate gate would silently vanish. The observation's
-- session/student agreement is deliberately NOT pre-checked: the composite
-- reports_observation_fk is the proof, and its constraint name is what the
-- acceptance test asserts.
CREATE FUNCTION public.report_create(
  p_class_session_id uuid,
  p_student_id       uuid,
  p_observation_id   uuid,
  OUT report_id      uuid,
  OUT status         public.report_status,
  OUT lock_version   integer
)
RETURNS record
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_centre_id     uuid;
  v_module_id     uuid;
  v_enrolment_id  uuid;
  v_start         timestamptz;
  v_report_id     uuid;
  v_constraint    text;
BEGIN
  IF p_observation_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC025',
      MESSAGE = 'report_create: an observation is required';
  END IF;

  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  SELECT cs.centre_id, cs.class_module_id
    INTO v_centre_id, v_module_id
    FROM public.class_sessions cs
   WHERE cs.id = p_class_session_id;
  IF v_centre_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  SELECT (pg_catalog.array_agg(m.id))[1]
    INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id
     AND m.centre_id  = v_centre_id
     AND m.role       = 'trainer'
     AND m.status     = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL OR NOT public.app_trainer_reaches_session(p_class_session_id) THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  -- R-9a: the ACTIVE enrolment, resolved (never supplied).
  SELECT e.id INTO v_enrolment_id
    FROM public.enrolments e
   WHERE e.class_module_id = v_module_id
     AND e.student_id      = p_student_id
     AND e.is_active;
  IF v_enrolment_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC016', MESSAGE = 'report: no active enrolment for this student and module';
  END IF;

  -- R-9 [fwd] guards: attendance `present` (a MISSING ROW FAILS CLOSED) and
  -- the scheduled session start, in the pinned Asia/Singapore literal.
  PERFORM 1 FROM public.attendance a
   WHERE a.class_session_id = p_class_session_id
     AND a.student_id       = p_student_id
     AND a.status           = 'present';
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC015', MESSAGE = 'report: the student is not recorded present for this session';
  END IF;

  SELECT ((cs.session_date + COALESCE(cs.starts_at, TIME '00:00')) AT TIME ZONE 'Asia/Singapore')
    INTO v_start
    FROM public.class_sessions cs
   WHERE cs.id = p_class_session_id;
  IF v_start IS NULL OR pg_catalog.now() < v_start THEN
    RAISE EXCEPTION USING ERRCODE = 'BC017', MESSAGE = 'report: the scheduled session start has not been reached';
  END IF;

  BEGIN
    INSERT INTO public.reports (
      centre_id, class_session_id, class_module_id, student_id,
      enrolment_id, observation_id, status, lock_version
    ) VALUES (
      v_centre_id, p_class_session_id, v_module_id, p_student_id,
      v_enrolment_id, p_observation_id, 'incomplete', 1
    )
    RETURNING public.reports.id INTO v_report_id;
  EXCEPTION WHEN unique_violation THEN
    -- The authored duplicate error PRESERVES the violated constraint name in
    -- the CONSTRAINT diagnostic, so a caller gets a minimal non-disclosing
    -- message while the acceptance suite can still assert exactly which
    -- invariant fired.
    GET STACKED DIAGNOSTICS v_constraint = CONSTRAINT_NAME;
    RAISE EXCEPTION USING ERRCODE = 'BC014',
      MESSAGE = 'report_create: a report already exists for this session and student',
      CONSTRAINT = v_constraint;
  END;

  PERFORM public.audit_append_event(
    v_centre_id, v_account_id, v_membership_id, 'trainer'::public.centre_membership_role,
    'report.created', NULL, NULL, NULL,
    'report', v_report_id, 'Report',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('target_type', 'student',       'target_id', p_student_id::text,       'target_label', 'Student'),
      pg_catalog.jsonb_build_object('target_type', 'class_session', 'target_id', p_class_session_id::text, 'target_label', 'Class session')
    ),
    pg_catalog.jsonb_build_object(
      'report_id',        v_report_id::text,
      'student_id',       p_student_id::text,
      'class_session_id', p_class_session_id::text,
      'class_module_id',  v_module_id::text,
      'observation_id',   p_observation_id::text,
      'status',           'incomplete'
    )
  );

  report_id    := v_report_id;
  status       := 'incomplete';
  lock_version := 1;
END;
$fn$;

COMMENT ON FUNCTION public.report_create(uuid, uuid, uuid) IS
  'Step 7I RPC-1 (T0, null -> incomplete): lazy trainer-actor creation of the report aggregate. Resolves the ACTIVE enrolment itself, enforces the attendance and Asia/Singapore session-start guards, and requires a non-NULL observation. Emits report.created in the same transaction.';

-- =====================================================================
-- RPC-2 -- report_mark_observation_saved (T1: incomplete -> observation_saved) [fwd]
-- =====================================================================
CREATE FUNCTION public.report_mark_observation_saved(
  p_report_id             uuid,
  p_expected_lock_version integer,
  OUT status              public.report_status,
  OUT lock_version        integer
)
RETURNS record
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_r             public.reports%ROWTYPE;
  v_start         timestamptz;
  v_ratings       bigint;
BEGIN
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  SELECT r.* INTO v_r FROM public.reports r WHERE r.id = p_report_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  SELECT (pg_catalog.array_agg(m.id))[1] INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id
     AND m.role = 'trainer' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL OR NOT public.app_trainer_reaches_session(v_r.class_session_id) THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  PERFORM 1 FROM public.enrolments e WHERE e.id = v_r.enrolment_id AND e.is_active;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC016', MESSAGE = 'report: no active enrolment for this student and module';
  END IF;
  PERFORM 1 FROM public.attendance a
   WHERE a.class_session_id = v_r.class_session_id AND a.student_id = v_r.student_id
     AND a.status = 'present';
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC015', MESSAGE = 'report: the student is not recorded present for this session';
  END IF;
  SELECT ((cs.session_date + COALESCE(cs.starts_at, TIME '00:00')) AT TIME ZONE 'Asia/Singapore')
    INTO v_start FROM public.class_sessions cs WHERE cs.id = v_r.class_session_id;
  IF v_start IS NULL OR pg_catalog.now() < v_start THEN
    RAISE EXCEPTION USING ERRCODE = 'BC017', MESSAGE = 'report: the scheduled session start has not been reached';
  END IF;

  -- Single-origin RPC (R-18b): the from-status is fixed inside the function
  -- and is not a caller argument, so a wrong CURRENT status is an illegal
  -- transition and a wrong lock_version is a stale CAS -- two distinct
  -- authored errors rather than one ambiguous outcome.
  IF v_r.status <> 'incomplete' THEN
    RAISE EXCEPTION USING ERRCODE = 'BC004', MESSAGE = 'report: this transition is not legal from the report''s current state';
  END IF;
  IF v_r.lock_version IS DISTINCT FROM p_expected_lock_version THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  SELECT pg_catalog.count(*) INTO v_ratings
    FROM public.observation_ratings orr
   WHERE orr.observation_id = v_r.observation_id;
  IF v_ratings <> 9 THEN
    RAISE EXCEPTION USING ERRCODE = 'BC018', MESSAGE = 'report: the observation does not carry exactly nine ratings';
  END IF;

  UPDATE public.reports r
     SET status = 'observation_saved',
         lock_version = r.lock_version + 1,
         updated_at = pg_catalog.now()
   WHERE r.id = p_report_id;

  PERFORM public.audit_append_event(
    v_r.centre_id, v_account_id, v_membership_id, 'trainer'::public.centre_membership_role,
    'report.state_changed', 'report', 'incomplete', 'observation_saved',
    'report', v_r.id, 'Report',
    NULL,
    pg_catalog.jsonb_build_object(
      'report_id',      v_r.id::text,
      'observation_id', v_r.observation_id::text
    )
  );

  status       := 'observation_saved';
  lock_version := v_r.lock_version + 1;
END;
$fn$;

COMMENT ON FUNCTION public.report_mark_observation_saved(uuid, integer) IS
  'Step 7I RPC-2 (T1, incomplete -> observation_saved): guarded CAS advance once the linked observation carries exactly nine ratings (A-017). Emits report.state_changed in the same transaction.';

-- =====================================================================
-- RPC-3 -- report_request_draft (T2: observation_saved -> drafting) [fwd]
-- =====================================================================
-- R-21a: returns the LIVE observation lock_version. The caller passes it
-- back as RPC-4's p_observation_lock_version, which RPC-4 re-reads and
-- rejects on mismatch, so a draft can never be stored against an
-- observation that changed after the draft was requested. This is the
-- spec section 24 hash(observation_id + version) idempotency shape
-- expressed as a guard. NO COLUMN IS ADDED.
CREATE FUNCTION public.report_request_draft(
  p_report_id                 uuid,
  p_expected_lock_version     integer,
  OUT status                  public.report_status,
  OUT lock_version            integer,
  OUT observation_lock_version integer
)
RETURNS record
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_r             public.reports%ROWTYPE;
  v_start         timestamptz;
  v_ratings       bigint;
  v_obs_lock      integer;
BEGIN
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  SELECT r.* INTO v_r FROM public.reports r WHERE r.id = p_report_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  SELECT (pg_catalog.array_agg(m.id))[1] INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id
     AND m.role = 'trainer' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL OR NOT public.app_trainer_reaches_session(v_r.class_session_id) THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  PERFORM 1 FROM public.enrolments e WHERE e.id = v_r.enrolment_id AND e.is_active;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC016', MESSAGE = 'report: no active enrolment for this student and module';
  END IF;
  PERFORM 1 FROM public.attendance a
   WHERE a.class_session_id = v_r.class_session_id AND a.student_id = v_r.student_id
     AND a.status = 'present';
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC015', MESSAGE = 'report: the student is not recorded present for this session';
  END IF;
  SELECT ((cs.session_date + COALESCE(cs.starts_at, TIME '00:00')) AT TIME ZONE 'Asia/Singapore')
    INTO v_start FROM public.class_sessions cs WHERE cs.id = v_r.class_session_id;
  IF v_start IS NULL OR pg_catalog.now() < v_start THEN
    RAISE EXCEPTION USING ERRCODE = 'BC017', MESSAGE = 'report: the scheduled session start has not been reached';
  END IF;

  IF v_r.status <> 'observation_saved' THEN
    RAISE EXCEPTION USING ERRCODE = 'BC004', MESSAGE = 'report: this transition is not legal from the report''s current state';
  END IF;
  IF v_r.lock_version IS DISTINCT FROM p_expected_lock_version THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  SELECT pg_catalog.count(*) INTO v_ratings
    FROM public.observation_ratings orr WHERE orr.observation_id = v_r.observation_id;
  IF v_ratings <> 9 THEN
    RAISE EXCEPTION USING ERRCODE = 'BC018', MESSAGE = 'report: the observation does not carry exactly nine ratings';
  END IF;

  SELECT o.lock_version INTO v_obs_lock
    FROM public.observations o WHERE o.id = v_r.observation_id;

  UPDATE public.reports r
     SET status = 'drafting', lock_version = r.lock_version + 1, updated_at = pg_catalog.now()
   WHERE r.id = p_report_id;

  PERFORM public.audit_append_event(
    v_r.centre_id, v_account_id, v_membership_id, 'trainer'::public.centre_membership_role,
    'report.state_changed', 'report', 'observation_saved', 'drafting',
    'report', v_r.id, 'Report',
    NULL,
    pg_catalog.jsonb_build_object(
      'report_id',               v_r.id::text,
      'observation_id',          v_r.observation_id::text,
      'observation_lock_version', v_obs_lock
    )
  );

  status                   := 'drafting';
  lock_version             := v_r.lock_version + 1;
  observation_lock_version := v_obs_lock;
END;
$fn$;

COMMENT ON FUNCTION public.report_request_draft(uuid, integer) IS
  'Step 7I RPC-3 (T2, observation_saved -> drafting): guarded CAS advance that also returns the LIVE observations.lock_version for RPC-4 to re-verify (R-21a). Emits report.state_changed in the same transaction.';

-- =====================================================================
-- RPC-4 -- report_store_draft (T3: drafting -> draft_ready) [fwd]
-- =====================================================================
-- R-27 -- INTERNAL / SERVER-ONLY. This RPC holds ZERO client EXECUTE, and
-- that is a governance prohibition rather than a minimum-privilege
-- preference. CLAUDE.md section 4 non-negotiable 1 forbids ever shipping a
-- path where AI output reaches the trainer without grounding, and a
-- client-executable RPC accepting four arbitrary text fields is exactly such
-- a path once granted -- permanently, and reachable from the browser client.
-- The later AI checkpoint owns the trusted generation-completion channel
-- that invokes it: a postgres-owned SECURITY DEFINER caller whose grounding
-- obligation that checkpoint carries.
--
-- CONSEQUENCE, RECORDED: until that channel exists, no client-reachable path
-- stores a draft, so the drafting -> draft_ready arc is exercisable in
-- Step 7I only by tests running as `postgres`. That is the intended posture,
-- not a gap. NO LATER CHECKPOINT MAY GRANT EXECUTE ON THIS FUNCTION without
-- reopening R-27 and CLAUDE.md section 4.
--
-- R-11a: this RPC runs exactly once per report and ALWAYS INSERTs. The
-- transition graph makes `drafting` reachable only from `observation_saved`,
-- which is reachable only from `incomplete` or from `drafting` itself, and
-- no arc returns from draft_ready/needs_edit/trainer_approved/submitted to
-- either. current_cycle_version_id is therefore always NULL here -- and the
-- already-holds-a-version guard below proves it rather than assuming it.
CREATE FUNCTION public.report_store_draft(
  p_report_id                uuid,
  p_expected_lock_version    integer,
  p_observation_lock_version integer,
  p_todays_strength          text,
  p_next_focus               text,
  p_practice_suggestion      text,
  p_session_takeaway         text,
  OUT status                 public.report_status,
  OUT lock_version           integer,
  OUT report_version_id      uuid,
  OUT revision_number        integer,
  OUT content_hash           text
)
RETURNS record
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_r             public.reports%ROWTYPE;
  v_start         timestamptz;
  v_ratings       public.competency_rating[];
  v_n             bigint;
  v_obs_lock      integer;
  v_version_id    uuid;
  v_hash          text;
BEGIN
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  SELECT r.* INTO v_r FROM public.reports r WHERE r.id = p_report_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  SELECT (pg_catalog.array_agg(m.id))[1] INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id
     AND m.role = 'trainer' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL OR NOT public.app_trainer_reaches_session(v_r.class_session_id) THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  PERFORM 1 FROM public.enrolments e WHERE e.id = v_r.enrolment_id AND e.is_active;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC016', MESSAGE = 'report: no active enrolment for this student and module';
  END IF;
  PERFORM 1 FROM public.attendance a
   WHERE a.class_session_id = v_r.class_session_id AND a.student_id = v_r.student_id
     AND a.status = 'present';
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC015', MESSAGE = 'report: the student is not recorded present for this session';
  END IF;
  SELECT ((cs.session_date + COALESCE(cs.starts_at, TIME '00:00')) AT TIME ZONE 'Asia/Singapore')
    INTO v_start FROM public.class_sessions cs WHERE cs.id = v_r.class_session_id;
  IF v_start IS NULL OR pg_catalog.now() < v_start THEN
    RAISE EXCEPTION USING ERRCODE = 'BC017', MESSAGE = 'report: the scheduled session start has not been reached';
  END IF;

  IF v_r.status <> 'drafting' THEN
    RAISE EXCEPTION USING ERRCODE = 'BC004', MESSAGE = 'report: this transition is not legal from the report''s current state';
  END IF;
  IF v_r.lock_version IS DISTINCT FROM p_expected_lock_version THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  IF COALESCE(pg_catalog.length(pg_catalog.btrim(COALESCE(p_todays_strength, ''))), 0)
   + COALESCE(pg_catalog.length(pg_catalog.btrim(COALESCE(p_next_focus, ''))), 0)
   + COALESCE(pg_catalog.length(pg_catalog.btrim(COALESCE(p_practice_suggestion, ''))), 0)
   + COALESCE(pg_catalog.length(pg_catalog.btrim(COALESCE(p_session_takeaway, ''))), 0) = 0 THEN
    RAISE EXCEPTION USING ERRCODE = 'BC020', MESSAGE = 'report: the supplied content is degenerate';
  END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM public.observation_ratings orr WHERE orr.observation_id = v_r.observation_id;
  IF v_n <> 9 THEN
    RAISE EXCEPTION USING ERRCODE = 'BC018', MESSAGE = 'report: the observation does not carry exactly nine ratings';
  END IF;

  SELECT o.lock_version INTO v_obs_lock FROM public.observations o WHERE o.id = v_r.observation_id;
  IF v_obs_lock IS DISTINCT FROM p_observation_lock_version THEN
    RAISE EXCEPTION USING ERRCODE = 'BC019', MESSAGE = 'report: the observation changed after the draft was requested';
  END IF;

  IF v_r.current_cycle_version_id IS NOT NULL
     OR EXISTS (SELECT 1 FROM public.report_versions rv WHERE rv.report_id = p_report_id) THEN
    RAISE EXCEPTION USING ERRCODE = 'BC024', MESSAGE = 'report: this report already holds a version';
  END IF;

  -- The nine ratings, ordered by the SAME hard-coded dimension list the
  -- content serializer pins. Deliberately not ordered by
  -- assessment_dimensions.sort_order, which is mutable.
  SELECT pg_catalog.array_agg(x.rating ORDER BY x.ord)
    INTO v_ratings
    FROM (
      SELECT orr.rating,
             pg_catalog.array_position(
               ARRAY['body','emotion','speech','tonality','eye_contact',
                     'vocal_projection','emotional_expression','sentence_flow',
                     'audience_awareness']::text[],
               orr.dimension_code::text) AS ord
        FROM public.observation_ratings orr
       WHERE orr.observation_id = v_r.observation_id
    ) x;

  v_hash := public.report_content_hash_v1(
    p_todays_strength, p_next_focus, p_practice_suggestion, p_session_takeaway, v_ratings);

  -- Ratified statement order for every version-creating path: compute both
  -- hashes from the arguments, INSERT the version row with the hash already
  -- populated, THEN insert the nine FK-child rating rows, THEN the
  -- all-false checklist row where the creating operation is a trainer one.
  INSERT INTO public.report_versions (
    report_id, centre_id, revision_number,
    todays_strength, next_focus, practice_suggestion, session_takeaway,
    authored_by_membership_id, authored_by_role,
    content_hash, content_hash_version
  ) VALUES (
    p_report_id, v_r.centre_id, 1,
    p_todays_strength, p_next_focus, p_practice_suggestion, p_session_takeaway,
    v_membership_id, 'trainer',
    v_hash, 1
  )
  RETURNING public.report_versions.id INTO v_version_id;

  INSERT INTO public.report_version_ratings (report_version_id, report_id, dimension_code, rating)
  SELECT v_version_id, p_report_id, orr.dimension_code, orr.rating
    FROM public.observation_ratings orr
   WHERE orr.observation_id = v_r.observation_id;

  INSERT INTO public.report_version_checklist_progress (report_version_id, report_id)
  VALUES (v_version_id, p_report_id);

  UPDATE public.reports r
     SET status = 'draft_ready',
         lock_version = r.lock_version + 1,
         current_cycle_version_id = v_version_id,
         updated_at = pg_catalog.now()
   WHERE r.id = p_report_id;

  -- Ordering is ratified, not incidental: the version must exist before the
  -- transition that references it is recorded. seq_no is dense and the two
  -- events are hash-linked, so the order is frozen in tamper-evident
  -- evidence.
  PERFORM public.audit_append_event(
    v_r.centre_id, v_account_id, v_membership_id, 'trainer'::public.centre_membership_role,
    'report_version.created', NULL, NULL, NULL,
    'report_version', v_version_id, 'Report version',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('target_type', 'report', 'target_id', v_r.id::text, 'target_label', 'Report')
    ),
    pg_catalog.jsonb_build_object(
      'report_version_id',        v_version_id::text,
      'revision_number',          1,
      'content_hash',             v_hash,
      'authored_by_role',         'trainer',
      'observation_id',           v_r.observation_id::text,
      'observation_lock_version', v_obs_lock
    )
  );
  PERFORM public.audit_append_event(
    v_r.centre_id, v_account_id, v_membership_id, 'trainer'::public.centre_membership_role,
    'report.state_changed', 'report', 'drafting', 'draft_ready',
    'report', v_r.id, 'Report',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('target_type', 'report_version', 'target_id', v_version_id::text, 'target_label', 'Report version')
    ),
    pg_catalog.jsonb_build_object(
      'report_id',         v_r.id::text,
      'report_version_id', v_version_id::text,
      'content_hash',      v_hash
    )
  );

  status            := 'draft_ready';
  lock_version      := v_r.lock_version + 1;
  report_version_id := v_version_id;
  revision_number   := 1;
  content_hash      := v_hash;
END;
$fn$;

COMMENT ON FUNCTION public.report_store_draft(uuid, integer, integer, text, text, text, text) IS
  'Step 7I RPC-4 (T3, drafting -> draft_ready): INTERNAL/SERVER-ONLY draft storage with ZERO client EXECUTE (R-27). Granting it would create a permanent browser-reachable path that writes report content from four arbitrary text fields -- exactly the grounding-bypass surface CLAUDE.md section 4 non-negotiable 1 forbids. The AI checkpoint owns the trusted generation-completion channel that invokes it. Creates revision 1 with nine snapshots, both hashes and an all-false checklist row; emits report_version.created then report.state_changed.';

-- =====================================================================
-- RPC-5 -- report_cancel_draft (T4: drafting -> observation_saved)
-- =====================================================================
-- NOT a forward transition: cancelling a failed or rejected generation must
-- never be blocked by an attendance or session-start guard, and it advances
-- nothing. The assessment work is preserved untouched.
CREATE FUNCTION public.report_cancel_draft(
  p_report_id             uuid,
  p_expected_lock_version integer,
  OUT status              public.report_status,
  OUT lock_version        integer
)
RETURNS record
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_r             public.reports%ROWTYPE;
BEGIN
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  SELECT r.* INTO v_r FROM public.reports r WHERE r.id = p_report_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  SELECT (pg_catalog.array_agg(m.id))[1] INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id
     AND m.role = 'trainer' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL OR NOT public.app_trainer_reaches_session(v_r.class_session_id) THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  IF v_r.status <> 'drafting' THEN
    RAISE EXCEPTION USING ERRCODE = 'BC004', MESSAGE = 'report: this transition is not legal from the report''s current state';
  END IF;
  IF v_r.lock_version IS DISTINCT FROM p_expected_lock_version THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  UPDATE public.reports r
     SET status = 'observation_saved', lock_version = r.lock_version + 1, updated_at = pg_catalog.now()
   WHERE r.id = p_report_id;

  PERFORM public.audit_append_event(
    v_r.centre_id, v_account_id, v_membership_id, 'trainer'::public.centre_membership_role,
    'report.state_changed', 'report', 'drafting', 'observation_saved',
    'report', v_r.id, 'Report',
    NULL,
    pg_catalog.jsonb_build_object('report_id', v_r.id::text)
  );

  status       := 'observation_saved';
  lock_version := v_r.lock_version + 1;
END;
$fn$;

COMMENT ON FUNCTION public.report_cancel_draft(uuid, integer) IS
  'Step 7I RPC-5 (T4, drafting -> observation_saved): the stored-state effect of a failed or grounding-rejected generation. Not a forward transition, so no attendance or session-start guard applies. Emits report.state_changed in the same transaction.';

-- =====================================================================
-- RPC-6 -- report_save_edit (T5: draft_ready -> draft_ready;
--                            T6: needs_edit -> draft_ready [fwd])
-- =====================================================================
-- R-5 CREATE-PER-CHANGE. Every accepted content change creates a NEW
-- IMMUTABLE report_versions row. There is no in-place mutation of version
-- content at any point in the lifecycle. A version created by a TRAINER
-- operation re-copies the nine CURRENT observation_ratings, so a trainer's
-- rating correction propagates into the report.
--
-- R-6: opening, closing or cancelling the editor is NON-MUTATING and there
-- is no begin-edit RPC -- navigation is not a persisted state change. A save
-- from draft_ready is the SELF-TRANSITION T5 (new version, status
-- unchanged); a save from needs_edit is T6 (new version, advance to
-- draft_ready). No trainer who abandons an editor is ever trapped.
--
-- R-7b THE REAFFIRMATION GATE, on the T6 arc only. Where the trainer
-- inspects the flagged item and concludes it is already correct, the new
-- version may carry BYTE-IDENTICAL panel content -- but only when the caller
-- names the report's OPEN correction request. A SILENT byte-identical save
-- is rejected, so "the trainer checked and stood by the assessment" is never
-- recorded the same way as "the trainer did nothing". No schema column is
-- added for this: the linkage already exists through the correction
-- request's own resolving_version_id.
CREATE FUNCTION public.report_save_edit(
  p_report_id                      uuid,
  p_expected_status                public.report_status,
  p_expected_lock_version          integer,
  p_expected_version_id            uuid,
  p_todays_strength                text,
  p_next_focus                     text,
  p_practice_suggestion            text,
  p_session_takeaway               text,
  p_reaffirm_correction_request_id uuid DEFAULT NULL,
  OUT status                       public.report_status,
  OUT lock_version                 integer,
  OUT report_version_id            uuid,
  OUT revision_number              integer,
  OUT content_hash                 text
)
RETURNS record
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_r             public.reports%ROWTYPE;
  v_cand          public.report_versions%ROWTYPE;
  v_start         timestamptz;
  v_n             bigint;
  v_ratings       public.competency_rating[];
  v_version_id    uuid;
  v_rev           integer;
  v_hash          text;
  v_identical     boolean;
  v_new_status    public.report_status;
BEGIN
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  SELECT r.* INTO v_r FROM public.reports r WHERE r.id = p_report_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  SELECT (pg_catalog.array_agg(m.id))[1] INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id
     AND m.role = 'trainer' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL OR NOT public.app_trainer_reaches_session(v_r.class_session_id) THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  -- Domain check BEFORE CAS (R-18b): the parameter's type admits all eight
  -- labels, and without this a caller could satisfy CAS against a state the
  -- transition does not serve and die on a constraint rather than on a
  -- transition guard.
  IF p_expected_status IS NULL OR p_expected_status NOT IN ('draft_ready', 'needs_edit') THEN
    RAISE EXCEPTION USING ERRCODE = 'BC004', MESSAGE = 'report: this transition is not legal from the requested state';
  END IF;
  IF v_r.status NOT IN ('draft_ready', 'needs_edit') THEN
    RAISE EXCEPTION USING ERRCODE = 'BC004', MESSAGE = 'report: this transition is not legal from the report''s current state';
  END IF;
  IF v_r.status IS DISTINCT FROM p_expected_status
     OR v_r.lock_version IS DISTINCT FROM p_expected_lock_version
     OR v_r.current_cycle_version_id IS DISTINCT FROM p_expected_version_id THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  -- Only T6 is forward progress. T5 is a self-transition and re-checks
  -- neither the attendance nor the session-start guard.
  IF v_r.status = 'needs_edit' THEN
    PERFORM 1 FROM public.enrolments e WHERE e.id = v_r.enrolment_id AND e.is_active;
    IF NOT FOUND THEN
      RAISE EXCEPTION USING ERRCODE = 'BC016', MESSAGE = 'report: no active enrolment for this student and module';
    END IF;
    PERFORM 1 FROM public.attendance a
     WHERE a.class_session_id = v_r.class_session_id AND a.student_id = v_r.student_id
       AND a.status = 'present';
    IF NOT FOUND THEN
      RAISE EXCEPTION USING ERRCODE = 'BC015', MESSAGE = 'report: the student is not recorded present for this session';
    END IF;
    SELECT ((cs.session_date + COALESCE(cs.starts_at, TIME '00:00')) AT TIME ZONE 'Asia/Singapore')
      INTO v_start FROM public.class_sessions cs WHERE cs.id = v_r.class_session_id;
    IF v_start IS NULL OR pg_catalog.now() < v_start THEN
      RAISE EXCEPTION USING ERRCODE = 'BC017', MESSAGE = 'report: the scheduled session start has not been reached';
    END IF;
  END IF;

  IF COALESCE(pg_catalog.length(pg_catalog.btrim(COALESCE(p_todays_strength, ''))), 0)
   + COALESCE(pg_catalog.length(pg_catalog.btrim(COALESCE(p_next_focus, ''))), 0)
   + COALESCE(pg_catalog.length(pg_catalog.btrim(COALESCE(p_practice_suggestion, ''))), 0)
   + COALESCE(pg_catalog.length(pg_catalog.btrim(COALESCE(p_session_takeaway, ''))), 0) = 0 THEN
    RAISE EXCEPTION USING ERRCODE = 'BC020', MESSAGE = 'report: the supplied content is degenerate';
  END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM public.observation_ratings orr WHERE orr.observation_id = v_r.observation_id;
  IF v_n <> 9 THEN
    RAISE EXCEPTION USING ERRCODE = 'BC018', MESSAGE = 'report: the observation does not carry exactly nine ratings';
  END IF;

  SELECT rv.* INTO v_cand
    FROM public.report_versions rv WHERE rv.id = v_r.current_cycle_version_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  -- Any supplied reaffirmation id must name THIS report's OPEN request.
  IF p_reaffirm_correction_request_id IS NOT NULL THEN
    PERFORM 1 FROM public.report_correction_requests cr
     WHERE cr.id = p_reaffirm_correction_request_id
       AND cr.report_id = p_report_id
       AND cr.status = 'open';
    IF NOT FOUND THEN
      RAISE EXCEPTION USING ERRCODE = 'BC021',
        MESSAGE = 'report: the reaffirmation must name this report''s open correction request';
    END IF;
  END IF;

  v_identical := (v_cand.todays_strength     IS NOT DISTINCT FROM p_todays_strength)
             AND (v_cand.next_focus          IS NOT DISTINCT FROM p_next_focus)
             AND (v_cand.practice_suggestion IS NOT DISTINCT FROM p_practice_suggestion)
             AND (v_cand.session_takeaway    IS NOT DISTINCT FROM p_session_takeaway);
  IF v_r.status = 'needs_edit' AND v_identical AND p_reaffirm_correction_request_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC021',
      MESSAGE = 'report: an unchanged correction must be submitted as an explicit reaffirmation naming the open correction request';
  END IF;

  SELECT pg_catalog.array_agg(x.rating ORDER BY x.ord) INTO v_ratings
    FROM (
      SELECT orr.rating,
             pg_catalog.array_position(
               ARRAY['body','emotion','speech','tonality','eye_contact',
                     'vocal_projection','emotional_expression','sentence_flow',
                     'audience_awareness']::text[],
               orr.dimension_code::text) AS ord
        FROM public.observation_ratings orr
       WHERE orr.observation_id = v_r.observation_id
    ) x;

  v_hash := public.report_content_hash_v1(
    p_todays_strength, p_next_focus, p_practice_suggestion, p_session_takeaway, v_ratings);

  -- Allocation is serialized by the aggregate row lock taken above, so a
  -- concurrent pair fails with an authored error rather than a raw unique
  -- violation on report_versions_report_revision_key.
  SELECT COALESCE(pg_catalog.max(rv.revision_number), 0) + 1 INTO v_rev
    FROM public.report_versions rv WHERE rv.report_id = p_report_id;

  INSERT INTO public.report_versions (
    report_id, centre_id, revision_number,
    todays_strength, next_focus, practice_suggestion, session_takeaway,
    authored_by_membership_id, authored_by_role, derived_from_version_id,
    content_hash, content_hash_version
  ) VALUES (
    p_report_id, v_r.centre_id, v_rev,
    p_todays_strength, p_next_focus, p_practice_suggestion, p_session_takeaway,
    v_membership_id, 'trainer', v_cand.id,
    v_hash, 1
  )
  RETURNING public.report_versions.id INTO v_version_id;

  INSERT INTO public.report_version_ratings (report_version_id, report_id, dimension_code, rating)
  SELECT v_version_id, p_report_id, orr.dimension_code, orr.rating
    FROM public.observation_ratings orr
   WHERE orr.observation_id = v_r.observation_id;

  -- Every TRAINER-created version gets a fresh all-false checklist row. The
  -- PRIOR version's row is left untouched: a frozen version's checklist and
  -- approval evidence are immutable and must never be cleared.
  INSERT INTO public.report_version_checklist_progress (report_version_id, report_id)
  VALUES (v_version_id, p_report_id);

  v_new_status := 'draft_ready';

  UPDATE public.reports r
     SET status = v_new_status,
         lock_version = r.lock_version + 1,
         current_cycle_version_id = v_version_id,
         updated_at = pg_catalog.now()
   WHERE r.id = p_report_id;

  PERFORM public.audit_append_event(
    v_r.centre_id, v_account_id, v_membership_id, 'trainer'::public.centre_membership_role,
    'report_version.created', NULL, NULL, NULL,
    'report_version', v_version_id, 'Report version',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('target_type', 'report',         'target_id', v_r.id::text,   'target_label', 'Report'),
      pg_catalog.jsonb_build_object('target_type', 'report_version', 'target_id', v_cand.id::text, 'target_label', 'Report version')
    ),
    pg_catalog.jsonb_build_object(
      'report_version_id',        v_version_id::text,
      'revision_number',          v_rev,
      'content_hash',             v_hash,
      'authored_by_role',         'trainer',
      'derived_from_version_id',  v_cand.id::text,
      'observation_id',           v_r.observation_id::text
    )
    || CASE WHEN p_reaffirm_correction_request_id IS NULL THEN '{}'::jsonb
            ELSE pg_catalog.jsonb_build_object(
                   'reaffirmed_correction_request_id', p_reaffirm_correction_request_id::text)
       END
  );

  -- T5 emits report_version.created ONLY -- the persisted status does not
  -- change, so no state-change event is appended. T6 additionally emits the
  -- state change.
  IF v_r.status = 'needs_edit' THEN
    PERFORM public.audit_append_event(
      v_r.centre_id, v_account_id, v_membership_id, 'trainer'::public.centre_membership_role,
      'report.state_changed', 'report', 'needs_edit', 'draft_ready',
      'report', v_r.id, 'Report',
      pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object('target_type', 'report_version', 'target_id', v_version_id::text, 'target_label', 'Report version')
      ),
      pg_catalog.jsonb_build_object(
        'report_id',         v_r.id::text,
        'report_version_id', v_version_id::text,
        'content_hash',      v_hash
      )
    );
  END IF;

  status            := v_new_status;
  lock_version      := v_r.lock_version + 1;
  report_version_id := v_version_id;
  revision_number   := v_rev;
  content_hash      := v_hash;
END;
$fn$;

COMMENT ON FUNCTION public.report_save_edit(uuid, public.report_status, integer, uuid, text, text, text, text, uuid) IS
  'Step 7I RPC-6 (T5 draft_ready -> draft_ready; T6 needs_edit -> draft_ready): the governed trainer save. Creates a NEW IMMUTABLE version every time (R-5), re-copying the nine current observation_ratings so a trainer rating correction propagates. Carries the R-7b reaffirmation gate on the T6 arc: a SILENT byte-identical save is rejected; a reaffirmation must name the report''s open correction request. Emits report_version.created always, plus report.state_changed on T6 only.';

-- =====================================================================
-- RPC-7 -- report_update_checklist (not a transition; section 3.3)
-- =====================================================================
-- Mutates the WORKING version's three booleans without changing status and
-- WITHOUT bumping lock_version -- a checklist tick is not a content change
-- and must not invalidate a concurrent editor's expectations. It VALIDATES
-- the caller's expected lock_version and current-version id instead.
--
-- THE VALIDATION IS PERFORMED UNDER THE AGGREGATE ROW LOCK, and locking --
-- not bumping -- is the fix. A plain SELECT ... WHERE lock_version = $v
-- reads a statement snapshot and serializes against nothing, so this
-- interleaving would be admissible: (1) the checklist RPC reads matching
-- expectations; (2) a save commits, creating a new version and bumping
-- lock_version; (3) the checklist RPC, still holding its stale read, writes
-- an all-true checklist. The converse race -- two concurrent checklist
-- writes -- is benign: the signature is a full-state write of all three
-- booleans, so last-writer-wins can only produce a false negative.
--
-- TWO FURTHER GATES ARE LOAD-BEARING, because the two-stage workflow creates
-- a state the superseded single-stage design never had: `needs_edit` whose
-- current_cycle_version_id names a version that is NOT an open trainer
-- working version. A management return produces it in two shapes.
--   Gate A -- after a return with no prior wording edit the candidate is the
--     FROZEN, trainer-approved version. Status, lock_version and
--     current-version gates ALL PASS, so without Gate A this RPC would
--     overwrite the checklist evidence attached to an approved version.
--   Gate B -- after a return that followed a wording edit the candidate is a
--     MANAGEMENT-authored version carrying no checklist row at all, where
--     the behaviour was simply undefined. Gate B defines it: reject.
-- Neither gate traps the trainer: in both shapes the correct next action is
-- a governed save (T6), which creates a new trainer-authored version with a
-- fresh all-false checklist row.
--
-- No audit event is appended for a checklist write (registry E10 excludes
-- per-toggle audit; the approval event proves the gate for the exact
-- version).
CREATE FUNCTION public.report_update_checklist(
  p_report_id             uuid,
  p_expected_lock_version integer,
  p_expected_version_id   uuid,
  p_evidence_confirmed    boolean,
  p_ai_draft_reviewed     boolean,
  p_privacy_checked       boolean,
  OUT evidence_confirmed  boolean,
  OUT ai_draft_reviewed   boolean,
  OUT privacy_checked     boolean
)
RETURNS record
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_r             public.reports%ROWTYPE;
  v_authored_role public.centre_membership_role;
BEGIN
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  -- FIRST statement on the aggregate: the row lock, before any validation.
  SELECT r.* INTO v_r FROM public.reports r WHERE r.id = p_report_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  SELECT (pg_catalog.array_agg(m.id))[1] INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id
     AND m.role = 'trainer' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL OR NOT public.app_trainer_reaches_session(v_r.class_session_id) THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  IF v_r.status NOT IN ('draft_ready', 'needs_edit') THEN
    RAISE EXCEPTION USING ERRCODE = 'BC004', MESSAGE = 'report: the checklist is not writable in the report''s current state';
  END IF;
  IF v_r.lock_version IS DISTINCT FROM p_expected_lock_version
     OR v_r.current_cycle_version_id IS DISTINCT FROM p_expected_version_id THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  -- Gate A -- the target version must hold NO approval row.
  PERFORM 1 FROM public.report_version_approvals ap
   WHERE ap.report_version_id = p_expected_version_id;
  IF FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC012',
      MESSAGE = 'report: this version is approved and its checklist evidence is immutable';
  END IF;

  -- Gate B -- the target version must be trainer-authored.
  SELECT rv.authored_by_role INTO v_authored_role
    FROM public.report_versions rv WHERE rv.id = p_expected_version_id;
  IF v_authored_role IS DISTINCT FROM 'trainer' THEN
    RAISE EXCEPTION USING ERRCODE = 'BC013',
      MESSAGE = 'report: the quality checklist is a trainer instrument and this version is not trainer-authored';
  END IF;

  UPDATE public.report_version_checklist_progress cp
     SET evidence_confirmed = p_evidence_confirmed,
         ai_draft_reviewed  = p_ai_draft_reviewed,
         privacy_checked    = p_privacy_checked,
         updated_at         = pg_catalog.now()
   WHERE cp.report_version_id = p_expected_version_id
     AND cp.report_id = p_report_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC013',
      MESSAGE = 'report: the quality checklist is a trainer instrument and this version holds no checklist row';
  END IF;

  evidence_confirmed := p_evidence_confirmed;
  ai_draft_reviewed  := p_ai_draft_reviewed;
  privacy_checked    := p_privacy_checked;
END;
$fn$;

COMMENT ON FUNCTION public.report_update_checklist(uuid, integer, uuid, boolean, boolean, boolean) IS
  'Step 7I RPC-7 (section 3.3, not a transition): version-scoped quality-checklist write. Validates -- and deliberately does NOT bump -- lock_version, under the aggregate row lock. Gate A rejects any version holding an approval row (a frozen version''s evidence is immutable); Gate B rejects any management-authored version (the checklist is a trainer instrument and such a version has no checklist row at all). Emits no audit event.';

-- =====================================================================
-- RPC-8 -- report_trainer_approve (T7: draft_ready -> trainer_approved;
--                                  T8: needs_edit -> trainer_approved) [fwd]
-- =====================================================================
-- TRAINER APPROVAL PUBLISHES NOTHING. It is the ENTRY CONDITION to
-- management's review, not the final act of publication (A-033). No pointer
-- moves, no submission metadata is written, and the parent read still
-- resolves through an unmoved latest_submitted_version_id.
--
-- THIS IS THE FREEZE POINT (A-028). The approval row's existence -- not any
-- column on the version -- is the sole authority for "this version is
-- approved, and by whom".
--
-- R-7a THE PRIOR-APPROVAL GATE. The target version must carry no trainer
-- approval of its own. This is what makes T8-after-a-return fail as a
-- TRANSITION GUARD rather than as a raw primary-key violation: after
-- T7 -> T10 the aggregate rests legally at `needs_edit` while the candidate
-- is still the FROZEN, already-approved version, and every other gate in
-- this protocol succeeds against it -- the domain check, the three-way CAS,
-- the all-true frozen checklist, the nine snapshots and the content hash.
-- R-7a is the SOLE barrier there. T8's reachable origin is therefore the T12
-- reopen clone; after a return the trainer must first produce a new
-- immutable correction version through T6.
CREATE FUNCTION public.report_trainer_approve(
  p_report_id                  uuid,
  p_expected_status            public.report_status,
  p_expected_lock_version      integer,
  p_expected_version_id        uuid,
  p_expected_content_hash      text,
  OUT status                   public.report_status,
  OUT lock_version             integer,
  OUT trainer_approved_version_id uuid
)
RETURNS record
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_r             public.reports%ROWTYPE;
  v_cand          public.report_versions%ROWTYPE;
  v_start         timestamptz;
  v_ev            boolean;
  v_ai            boolean;
  v_pc            boolean;
  v_n             bigint;
  v_ratings       public.competency_rating[];
  v_recomputed    text;
  v_open_id       uuid;
BEGIN
  -- 1. Re-read authoritative state under the aggregate row lock.
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;
  SELECT r.* INTO v_r FROM public.reports r WHERE r.id = p_report_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  -- 2. Revalidate LIVE authorization (never a token claim, never UI state).
  SELECT (pg_catalog.array_agg(m.id))[1] INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id
     AND m.role = 'trainer' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL OR NOT public.app_trainer_reaches_session(v_r.class_session_id) THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;
  PERFORM 1 FROM public.enrolments e WHERE e.id = v_r.enrolment_id AND e.is_active;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC016', MESSAGE = 'report: no active enrolment for this student and module';
  END IF;
  PERFORM 1 FROM public.attendance a
   WHERE a.class_session_id = v_r.class_session_id AND a.student_id = v_r.student_id
     AND a.status = 'present';
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC015', MESSAGE = 'report: the student is not recorded present for this session';
  END IF;
  SELECT ((cs.session_date + COALESCE(cs.starts_at, TIME '00:00')) AT TIME ZONE 'Asia/Singapore')
    INTO v_start FROM public.class_sessions cs WHERE cs.id = v_r.class_session_id;
  IF v_start IS NULL OR pg_catalog.now() < v_start THEN
    RAISE EXCEPTION USING ERRCODE = 'BC017', MESSAGE = 'report: the scheduled session start has not been reached';
  END IF;

  -- 3. Domain check, BEFORE CAS.
  IF p_expected_status IS NULL OR p_expected_status NOT IN ('draft_ready', 'needs_edit') THEN
    RAISE EXCEPTION USING ERRCODE = 'BC004', MESSAGE = 'report: this transition is not legal from the requested state';
  END IF;
  IF v_r.status NOT IN ('draft_ready', 'needs_edit') THEN
    RAISE EXCEPTION USING ERRCODE = 'BC004', MESSAGE = 'report: this transition is not legal from the report''s current state';
  END IF;

  -- 4. CAS on status + lock_version + current-version id, all compared with
  --    IS DISTINCT FROM so a NULL expectation can never read as a match.
  IF v_r.status IS DISTINCT FROM p_expected_status
     OR v_r.lock_version IS DISTINCT FROM p_expected_lock_version
     OR v_r.current_cycle_version_id IS DISTINCT FROM p_expected_version_id THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  -- 5. Prior-approval gate (R-7a). Fires BEFORE any INSERT is attempted, so
  --    the failure is a transition guard and never a primary-key violation.
  PERFORM 1 FROM public.report_version_approvals ap
   WHERE ap.report_version_id = p_expected_version_id AND ap.approver_role = 'trainer';
  IF FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC011',
      MESSAGE = 'report: this version already carries a trainer approval; a correction requires a new version';
  END IF;

  -- 6. Checklist gate for EXACTLY this version. A missing row is a FAILURE,
  --    not a pass: it means the candidate is management-authored, which can
  --    never be trainer-approved.
  SELECT cp.evidence_confirmed, cp.ai_draft_reviewed, cp.privacy_checked
    INTO v_ev, v_ai, v_pc
    FROM public.report_version_checklist_progress cp
   WHERE cp.report_version_id = p_expected_version_id;
  IF NOT FOUND OR NOT (v_ev AND v_ai AND v_pc) THEN
    RAISE EXCEPTION USING ERRCODE = 'BC005',
      MESSAGE = 'report: every quality-checklist item must be satisfied for this exact version before approval';
  END IF;

  -- 7. Snapshot completeness.
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.report_version_ratings rvr WHERE rvr.report_version_id = p_expected_version_id;
  IF v_n <> 9 THEN
    RAISE EXCEPTION USING ERRCODE = 'BC018', MESSAGE = 'report: this version does not carry exactly nine rating snapshots';
  END IF;

  SELECT rv.* INTO v_cand FROM public.report_versions rv WHERE rv.id = p_expected_version_id;

  -- 8. Content-hash verification. The STORED-vs-RECOMPUTED check is a
  --    data-integrity anomaly and is deliberately distinct in code and shape
  --    from the caller mismatch, which is an ordinary stale render.
  SELECT pg_catalog.array_agg(x.rating ORDER BY x.ord) INTO v_ratings
    FROM (
      SELECT rvr.rating,
             pg_catalog.array_position(
               ARRAY['body','emotion','speech','tonality','eye_contact',
                     'vocal_projection','emotional_expression','sentence_flow',
                     'audience_awareness']::text[],
               rvr.dimension_code::text) AS ord
        FROM public.report_version_ratings rvr
       WHERE rvr.report_version_id = p_expected_version_id
    ) x;
  v_recomputed := public.report_content_hash_v1(
    v_cand.todays_strength, v_cand.next_focus, v_cand.practice_suggestion,
    v_cand.session_takeaway, v_ratings);
  IF v_recomputed IS DISTINCT FROM v_cand.content_hash THEN
    RAISE EXCEPTION USING ERRCODE = 'BC007',
      MESSAGE = 'report: stored content integrity check failed';
  END IF;
  IF p_expected_content_hash IS DISTINCT FROM v_cand.content_hash THEN
    RAISE EXCEPTION USING ERRCODE = 'BC006',
      MESSAGE = 'report: the content you reviewed is no longer current; re-read and retry';
  END IF;

  -- 9. Trainer approval provenance. approver_role is supplied LITERALLY --
  --    A-040 dropped the column default precisely so an omission fails
  --    loudly instead of silently manufacturing a trainer approval.
  INSERT INTO public.report_version_approvals (
    report_version_id, report_id, centre_id,
    approved_by_membership_id, approver_role, approved_at,
    checklist_evidence_confirmed, checklist_ai_draft_reviewed, checklist_privacy_checked
  ) VALUES (
    p_expected_version_id, p_report_id, v_r.centre_id,
    v_membership_id, 'trainer', pg_catalog.now(),
    v_ev, v_ai, v_pc
  );

  -- 10. Correction-request resolution. ONLY an `open` row is ever touched:
  --     a previously resolved row is immutable and is never re-resolved,
  --     re-dated or re-pointed by a later cycle.
  UPDATE public.report_correction_requests cr
     SET status = 'resolved',
         resolved_at = pg_catalog.now(),
         resolved_by_membership_id = v_membership_id,
         resolver_role = 'trainer',
         resolving_version_id = p_expected_version_id
   WHERE cr.report_id = p_report_id AND cr.status = 'open'
  RETURNING cr.id INTO v_open_id;

  -- 11. Transition + audit, in the same transaction.
  UPDATE public.reports r
     SET status = 'trainer_approved',
         lock_version = r.lock_version + 1,
         updated_at = pg_catalog.now()
   WHERE r.id = p_report_id;

  PERFORM public.audit_append_event(
    v_r.centre_id, v_account_id, v_membership_id, 'trainer'::public.centre_membership_role,
    'report.state_changed', 'report', v_r.status::text, 'trainer_approved',
    'report', v_r.id, 'Report',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('target_type', 'report_version', 'target_id', p_expected_version_id::text, 'target_label', 'Report version')
    )
    || CASE WHEN v_open_id IS NULL THEN '[]'::jsonb
            ELSE pg_catalog.jsonb_build_array(
                   pg_catalog.jsonb_build_object('target_type', 'report_correction_request', 'target_id', v_open_id::text, 'target_label', 'Correction request'))
       END,
    pg_catalog.jsonb_build_object(
      'report_id',                    v_r.id::text,
      'report_version_id',            p_expected_version_id::text,
      'content_hash',                 v_cand.content_hash,
      'checklist_evidence_confirmed', v_ev,
      'checklist_ai_draft_reviewed',  v_ai,
      'checklist_privacy_checked',    v_pc
    )
    || CASE WHEN v_open_id IS NULL THEN '{}'::jsonb
            ELSE pg_catalog.jsonb_build_object('resolved_correction_request_id', v_open_id::text)
       END
  );

  -- 12. OUTBOX INSERTION POINT (A-039 trigger 1). A management notification
  --     is owed. The outbox row belongs HERE, INSIDE this transaction, so it
  --     commits with the transition or not at all -- a post-commit hook with
  --     no in-transaction outbox row is PROHIBITED, because it would satisfy
  --     "only after success" while violating "never lost". Step 7I creates no
  --     notification object, no outbox table and no outbox row; the
  --     notifications checkpoint will CREATE OR REPLACE this function to add
  --     that single INSERT at this clearly-marked location.

  status                      := 'trainer_approved';
  lock_version                := v_r.lock_version + 1;
  trainer_approved_version_id := p_expected_version_id;
END;
$fn$;

COMMENT ON FUNCTION public.report_trainer_approve(uuid, public.report_status, integer, uuid, text) IS
  'Step 7I RPC-8 (T7/T8 -> trainer_approved): the trainer approval, which FREEZES the exact version (A-028) and PUBLISHES NOTHING. Gates, in order: live authorization, forward guards, domain check, three-way CAS, the R-7a prior-approval gate, the all-true checklist for exactly this version, nine snapshots, stored-hash integrity and the caller-supplied content hash. Resolves the report''s open correction request in the same transaction. Emits one report.state_changed.';

-- =====================================================================
-- RPC-9 -- report_management_edit_wording (T9: trainer_approved -> trainer_approved)
-- =====================================================================
-- THE ALLOW-LIST IS THE SIGNATURE, NOT A RUNTIME FILTER. This function has
-- NO caller-supplied parameter for a rating, an observation, an attendance
-- row, an evidence object, a trainer note, a checklist row, an approval row,
-- revision_number, lineage, authorship or submission metadata, and it
-- executes no statement writing observations, observation_ratings,
-- attendance, report_version_checklist_progress or
-- report_version_approvals.
--
-- PRECISION, because the distinction matters to a static reviewer: T9 DOES
-- insert nine report_version_ratings rows for the new version. Management
-- supplies NO RATING VALUE -- the nine snapshots are copied VERBATIM FROM
-- THE TRAINER-APPROVED SOURCE by the server, which is exactly why management
-- can never introduce, remove or alter a rating.
--
-- No checklist row is created (section 3.3): the checklist is a trainer
-- instrument, management is never asked to satisfy it, and an all-false row
-- on a version that can never be trainer-approved would be misleading.
CREATE FUNCTION public.report_management_edit_wording(
  p_report_id             uuid,
  p_expected_lock_version integer,
  p_expected_version_id   uuid,
  p_expected_wording_hash text,
  p_todays_strength       text,
  p_next_focus            text,
  p_practice_suggestion   text,
  p_session_takeaway      text,
  OUT status              public.report_status,
  OUT lock_version        integer,
  OUT report_version_id   uuid,
  OUT revision_number     integer,
  OUT wording_hash        text
)
RETURNS record
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_r             public.reports%ROWTYPE;
  v_cand          public.report_versions%ROWTYPE;
  v_source_id     uuid;
  v_ratings       public.competency_rating[];
  v_version_id    uuid;
  v_rev           integer;
  v_content_hash  text;
  v_wording       text;
BEGIN
  -- 1-2. Lock, then revalidate a SINGLE ACTIVE management membership of the
  --      report's centre. A trainer or parent context finds none and is
  --      rejected with the authored role error.
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;
  SELECT r.* INTO v_r FROM public.reports r WHERE r.id = p_report_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;
  SELECT (pg_catalog.array_agg(m.id))[1] INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id
     AND m.role = 'management' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  -- 3. CAS. Single legal origin, so a wrong current status is an illegal
  --    transition rather than a stale expectation (R-18b).
  IF v_r.status <> 'trainer_approved' THEN
    RAISE EXCEPTION USING ERRCODE = 'BC004', MESSAGE = 'report: this transition is not legal from the report''s current state';
  END IF;
  IF v_r.lock_version IS DISTINCT FROM p_expected_lock_version
     OR v_r.current_cycle_version_id IS DISTINCT FROM p_expected_version_id THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  SELECT rv.* INTO v_cand FROM public.report_versions rv WHERE rv.id = p_expected_version_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  -- 4. Lineage gate. The trainer-approved source of V is V itself when V
  --    carries a trainer approval row, otherwise V.trainer_approved_source_
  --    version_id. If neither resolves, the version has no trainer approval
  --    behind it. NO SOURCE, NO EDIT. This rule is inlined here and in
  --    RPC-11 rather than shared, and is proven at BOTH call sites.
  PERFORM 1 FROM public.report_version_approvals ap
   WHERE ap.report_version_id = v_cand.id AND ap.approver_role = 'trainer';
  IF FOUND THEN
    v_source_id := v_cand.id;
  ELSE
    v_source_id := v_cand.trainer_approved_source_version_id;
  END IF;
  IF v_source_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC009', MESSAGE = 'report: no trainer approval stands behind this version';
  END IF;
  PERFORM 1 FROM public.report_version_approvals ap
   WHERE ap.report_version_id = v_source_id AND ap.approver_role = 'trainer';
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC009', MESSAGE = 'report: no trainer approval stands behind this version';
  END IF;

  -- 5. Wording-hash verification: management edits THE TEXT IT WAS SHOWN.
  --    The CONTENT hash is never returned to, nor accepted from, management.
  IF public.report_wording_hash_v1(
       v_cand.todays_strength, v_cand.next_focus,
       v_cand.practice_suggestion, v_cand.session_takeaway)
     IS DISTINCT FROM p_expected_wording_hash THEN
    RAISE EXCEPTION USING ERRCODE = 'BC008',
      MESSAGE = 'report: the wording you reviewed is no longer current; re-read and retry';
  END IF;

  -- 7. The nine snapshots, copied VERBATIM from the trainer-approved source.
  SELECT pg_catalog.array_agg(x.rating ORDER BY x.ord) INTO v_ratings
    FROM (
      SELECT rvr.rating,
             pg_catalog.array_position(
               ARRAY['body','emotion','speech','tonality','eye_contact',
                     'vocal_projection','emotional_expression','sentence_flow',
                     'audience_awareness']::text[],
               rvr.dimension_code::text) AS ord
        FROM public.report_version_ratings rvr
       WHERE rvr.report_version_id = v_source_id
    ) x;

  v_content_hash := public.report_content_hash_v1(
    p_todays_strength, p_next_focus, p_practice_suggestion, p_session_takeaway, v_ratings);
  v_wording := public.report_wording_hash_v1(
    p_todays_strength, p_next_focus, p_practice_suggestion, p_session_takeaway);

  SELECT COALESCE(pg_catalog.max(rv.revision_number), 0) + 1 INTO v_rev
    FROM public.report_versions rv WHERE rv.report_id = p_report_id;

  INSERT INTO public.report_versions (
    report_id, centre_id, revision_number,
    todays_strength, next_focus, practice_suggestion, session_takeaway,
    authored_by_membership_id, authored_by_role,
    derived_from_version_id, trainer_approved_source_version_id,
    content_hash, content_hash_version
  ) VALUES (
    p_report_id, v_r.centre_id, v_rev,
    p_todays_strength, p_next_focus, p_practice_suggestion, p_session_takeaway,
    v_membership_id, 'management',
    v_cand.id, v_source_id,
    v_content_hash, 1
  )
  RETURNING public.report_versions.id INTO v_version_id;

  INSERT INTO public.report_version_ratings (report_version_id, report_id, dimension_code, rating)
  SELECT v_version_id, p_report_id, rvr.dimension_code, rvr.rating
    FROM public.report_version_ratings rvr
   WHERE rvr.report_version_id = v_source_id;

  -- 8. Status is UNCHANGED at trainer_approved; only the candidate pointer
  --    moves. No report.state_changed is appended, because no state changed.
  UPDATE public.reports r
     SET lock_version = r.lock_version + 1,
         current_cycle_version_id = v_version_id,
         updated_at = pg_catalog.now()
   WHERE r.id = p_report_id;

  PERFORM public.audit_append_event(
    v_r.centre_id, v_account_id, v_membership_id, 'management'::public.centre_membership_role,
    'report_version.created', NULL, NULL, NULL,
    'report_version', v_version_id, 'Report version',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('target_type', 'report',         'target_id', v_r.id::text,      'target_label', 'Report'),
      pg_catalog.jsonb_build_object('target_type', 'report_version', 'target_id', v_cand.id::text,   'target_label', 'Report version'),
      pg_catalog.jsonb_build_object('target_type', 'report_version', 'target_id', v_source_id::text, 'target_label', 'Report version')
    ),
    pg_catalog.jsonb_build_object(
      'report_version_id',                  v_version_id::text,
      'revision_number',                    v_rev,
      'content_hash',                       v_content_hash,
      'authored_by_role',                   'management',
      'derived_from_version_id',            v_cand.id::text,
      'trainer_approved_source_version_id', v_source_id::text
    )
  );

  status            := 'trainer_approved';
  lock_version      := v_r.lock_version + 1;
  report_version_id := v_version_id;
  revision_number   := v_rev;
  wording_hash      := v_wording;
END;
$fn$;

COMMENT ON FUNCTION public.report_management_edit_wording(uuid, integer, uuid, text, text, text, text, text) IS
  'Step 7I RPC-9 (T9, status-preserving): management''s PARENT-FACING WORDING-ONLY edit. The allow-list is the SIGNATURE -- there is no rating, observation, attendance, evidence, note, checklist, approval, revision, lineage, authorship or submission parameter. Creates a new immutable version whose nine snapshots are copied VERBATIM from the resolved trainer-approved source, so a rating can never change. Requires the caller-supplied WORDING hash (never the content hash, R-26). Creates no checklist row. Emits report_version.created only.';

-- =====================================================================
-- RPC-10 -- report_management_return_to_trainer (T10: trainer_approved -> needs_edit)
-- =====================================================================
-- The return RECORDS A REQUEST; it never performs the correction. NO VERSION
-- IS CREATED and no version content is written, so the trainer-approved
-- source version and its approval row stay byte-identical and valid.
--
-- latest_submitted_version_id is not touched, so the report remains
-- unavailable to parents exactly as before: a never-submitted report still
-- resolves to nothing and a previously submitted one still resolves to its
-- previous canonical version. There is NO parent-observable signal that a
-- correction cycle is underway.
--
-- THE REASON TEXT NEVER ENTERS THE AUDIT EVENT (R-30/B-7I-4). The event
-- carries the request id, its issue_scope and the affected dimension_code --
-- a UUID and closed-vocabulary values, all non-identifying. The prose lives
-- in an ordinary application row a future PDPA mechanism can reach; an audit
-- row is permanent and unredactable.
CREATE FUNCTION public.report_management_return_to_trainer(
  p_report_id             uuid,
  p_expected_lock_version integer,
  p_expected_version_id   uuid,
  p_issue_scope           public.correction_issue_scope,
  p_dimension_code        public.dimension_code,
  p_reason                text,
  OUT status              public.report_status,
  OUT lock_version        integer,
  OUT correction_request_id uuid
)
RETURNS record
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_r             public.reports%ROWTYPE;
  v_request_id    uuid;
BEGIN
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;
  SELECT r.* INTO v_r FROM public.reports r WHERE r.id = p_report_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;
  SELECT (pg_catalog.array_agg(m.id))[1] INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id
     AND m.role = 'management' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  -- The return is legal from trainer_approved AND FROM NOWHERE ELSE:
  -- management cannot return a report it has already submitted, nor one the
  -- trainer has not yet approved.
  IF v_r.status <> 'trainer_approved' THEN
    RAISE EXCEPTION USING ERRCODE = 'BC004', MESSAGE = 'report: this transition is not legal from the report''s current state';
  END IF;
  IF v_r.lock_version IS DISTINCT FROM p_expected_lock_version
     OR v_r.current_cycle_version_id IS DISTINCT FROM p_expected_version_id THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  IF p_issue_scope IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC022', MESSAGE = 'report: an issue scope is required';
  END IF;
  IF (p_issue_scope = 'rating') <> (p_dimension_code IS NOT NULL) THEN
    RAISE EXCEPTION USING ERRCODE = 'BC022',
      MESSAGE = 'report: a rating issue must name its dimension, and every other scope must not';
  END IF;
  IF p_reason IS NULL
     OR pg_catalog.length(pg_catalog.btrim(p_reason)) = 0
     OR pg_catalog.length(p_reason) > 2000 THEN
    RAISE EXCEPTION USING ERRCODE = 'BC022', MESSAGE = 'report: a bounded, non-blank correction reason is required';
  END IF;

  -- Duplicate gate, evaluated under the aggregate row lock which serializes
  -- every writer for this report. The partial unique index remains the
  -- structural backstop.
  PERFORM 1 FROM public.report_correction_requests cr
   WHERE cr.report_id = p_report_id AND cr.status = 'open';
  IF FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC023', MESSAGE = 'report: a correction request is already open for this report';
  END IF;

  INSERT INTO public.report_correction_requests (
    centre_id, report_id, report_version_id, issue_scope, dimension_code,
    reason, requested_by_membership_id, requester_role, requested_at, status
  ) VALUES (
    v_r.centre_id, p_report_id, p_expected_version_id, p_issue_scope, p_dimension_code,
    p_reason, v_membership_id, 'management', pg_catalog.now(), 'open'
  )
  RETURNING public.report_correction_requests.id INTO v_request_id;

  UPDATE public.reports r
     SET status = 'needs_edit', lock_version = r.lock_version + 1, updated_at = pg_catalog.now()
   WHERE r.id = p_report_id;

  PERFORM public.audit_append_event(
    v_r.centre_id, v_account_id, v_membership_id, 'management'::public.centre_membership_role,
    'report.state_changed', 'report', 'trainer_approved', 'needs_edit',
    'report', v_r.id, 'Report',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('target_type', 'report_version',            'target_id', p_expected_version_id::text, 'target_label', 'Report version'),
      pg_catalog.jsonb_build_object('target_type', 'report_correction_request', 'target_id', v_request_id::text,          'target_label', 'Correction request')
    ),
    pg_catalog.jsonb_build_object(
      'report_id',             v_r.id::text,
      'report_version_id',     p_expected_version_id::text,
      'correction_request_id', v_request_id::text,
      'issue_scope',           p_issue_scope::text
    )
    || CASE WHEN p_dimension_code IS NULL THEN '{}'::jsonb
            ELSE pg_catalog.jsonb_build_object('dimension_code', p_dimension_code::text)
       END
  );

  -- OUTBOX INSERTION POINT (A-039 trigger 2). The actively assigned trainer
  -- is owed a notification, with the correction-request id and NEVER the
  -- reason text. The outbox row belongs HERE, inside this transaction.
  -- Step 7I creates no notification object, no outbox table and no row.

  status               := 'needs_edit';
  lock_version         := v_r.lock_version + 1;
  correction_request_id := v_request_id;
END;
$fn$;

COMMENT ON FUNCTION public.report_management_return_to_trainer(uuid, integer, uuid, public.correction_issue_scope, public.dimension_code, text) IS
  'Step 7I RPC-10 (T10, trainer_approved -> needs_edit): the conditional return-to-trainer for an assessment-level issue. Writes only reports and report_correction_requests -- NO VERSION IS CREATED, no pointer moves, and every existing approval row is untouched. Emits one report.state_changed carrying the request id, scope and dimension, and NEVER the reason text.';

-- =====================================================================
-- RPC-11 -- report_management_approve_and_submit
--           (T11: trainer_approved -> approved -> submitted) [atomic]
-- =====================================================================
-- ONE user action, ONE RPC, ONE DATABASE TRANSACTION, two transitions, two
-- ordered audit events. `approved` is TRANSIENT-IN-TRANSACTION: it is
-- asserted inside this transaction and named in both events, and NO
-- OPERATION EVER COMMITS WITH status = 'approved'.
--
-- THIS FUNCTION CONTAINS NO EXCEPTION BLOCK AND NO SAVEPOINT. That is
-- deliberate and is asserted statically: an exception handler spanning the
-- approval INSERT and the two transitions would create an implicit savepoint
-- and could leave a partial outcome observable.
--
-- The two events are provably adjacent: the first audit_append_event call
-- takes the per-centre head row lock, which PostgreSQL holds until
-- transaction end, and the second re-reads its own uncommitted head update
-- and allocates the next sequence number. They are dense-consecutive
-- (n, n+1) with direct hash linkage and NO FOREIGN EVENT CAN INTERLEAVE on
-- that centre's chain. Corollary, stated for review honesty: the centre's
-- audit appends serialize behind this transaction for its remaining
-- duration -- acceptable at MVP scale.
CREATE FUNCTION public.report_management_approve_and_submit(
  p_report_id             uuid,
  p_expected_lock_version integer,
  p_expected_version_id   uuid,
  p_expected_wording_hash text,
  OUT status              public.report_status,
  OUT lock_version        integer,
  OUT submitted_version_id uuid,
  OUT submitted_at        timestamptz
)
RETURNS record
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_r             public.reports%ROWTYPE;
  v_final         public.report_versions%ROWTYPE;
  v_source_id     uuid;
  v_n             bigint;
  v_mismatch      bigint;
  v_ratings       public.competency_rating[];
  v_recomputed    text;
  v_ev            boolean;
  v_ai            boolean;
  v_pc            boolean;
  v_now           timestamptz;
BEGIN
  -- 1. Re-read authoritative state under the aggregate row lock.
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;
  SELECT r.* INTO v_r FROM public.reports r WHERE r.id = p_report_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  -- 2. The LIVE centre authorization A-037 requires -- never a token claim,
  --    never UI state.
  SELECT (pg_catalog.array_agg(m.id))[1] INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id
     AND m.role = 'management' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  -- 3. THE OBSOLETE-VERSION GATE: a management approval of anything other
  --    than the report's current candidate cannot pass.
  IF v_r.status <> 'trainer_approved' THEN
    RAISE EXCEPTION USING ERRCODE = 'BC004', MESSAGE = 'report: this transition is not legal from the report''s current state';
  END IF;
  IF v_r.lock_version IS DISTINCT FROM p_expected_lock_version
     OR v_r.current_cycle_version_id IS DISTINCT FROM p_expected_version_id THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  SELECT rv.* INTO v_final FROM public.report_versions rv WHERE rv.id = p_expected_version_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  -- 4. TRAINER-APPROVAL LINEAGE GATE -- the structural implementation of
  --    "management submission without trainer approval must be prevented".
  --    Step 3 already proved the final version is the report's CURRENT
  --    candidate, so the resolved source is the current lineage root by
  --    construction: a stale or superseded source cannot reach this gate.
  --    This READS an existing trainer approval; it never creates, copies or
  --    infers one.
  PERFORM 1 FROM public.report_version_approvals ap
   WHERE ap.report_version_id = v_final.id AND ap.approver_role = 'trainer';
  IF FOUND THEN
    v_source_id := v_final.id;
  ELSE
    v_source_id := v_final.trainer_approved_source_version_id;
  END IF;
  IF v_source_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC009', MESSAGE = 'report: no trainer approval stands behind this version';
  END IF;
  SELECT ap.checklist_evidence_confirmed, ap.checklist_ai_draft_reviewed, ap.checklist_privacy_checked
    INTO v_ev, v_ai, v_pc
    FROM public.report_version_approvals ap
   WHERE ap.report_version_id = v_source_id AND ap.approver_role = 'trainer';
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC009', MESSAGE = 'report: no trainer approval stands behind this version';
  END IF;

  -- 5. RATING-PARITY GATE. Independently re-proves that no wording edit
  --    mutated or impersonated a rating, even if an implementation error
  --    occurred upstream.
  SELECT pg_catalog.count(*) INTO v_mismatch
    FROM (
      (SELECT rvr.dimension_code, rvr.rating FROM public.report_version_ratings rvr
        WHERE rvr.report_version_id = v_final.id
       EXCEPT ALL
       SELECT rvr.dimension_code, rvr.rating FROM public.report_version_ratings rvr
        WHERE rvr.report_version_id = v_source_id)
      UNION ALL
      (SELECT rvr.dimension_code, rvr.rating FROM public.report_version_ratings rvr
        WHERE rvr.report_version_id = v_source_id
       EXCEPT ALL
       SELECT rvr.dimension_code, rvr.rating FROM public.report_version_ratings rvr
        WHERE rvr.report_version_id = v_final.id)
    ) d;
  IF v_mismatch <> 0 THEN
    RAISE EXCEPTION USING ERRCODE = 'BC010',
      MESSAGE = 'report: the assessment ratings of this version do not match its trainer-approved source';
  END IF;

  -- 6. Snapshot completeness for the final version.
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.report_version_ratings rvr WHERE rvr.report_version_id = v_final.id;
  IF v_n <> 9 THEN
    RAISE EXCEPTION USING ERRCODE = 'BC018', MESSAGE = 'report: this version does not carry exactly nine rating snapshots';
  END IF;

  -- 7. Content-hash integrity. A mismatch here is a DATA-INTEGRITY ANOMALY,
  --    distinct in code and shape from a caller mismatch.
  SELECT pg_catalog.array_agg(x.rating ORDER BY x.ord) INTO v_ratings
    FROM (
      SELECT rvr.rating,
             pg_catalog.array_position(
               ARRAY['body','emotion','speech','tonality','eye_contact',
                     'vocal_projection','emotional_expression','sentence_flow',
                     'audience_awareness']::text[],
               rvr.dimension_code::text) AS ord
        FROM public.report_version_ratings rvr
       WHERE rvr.report_version_id = v_final.id
    ) x;
  v_recomputed := public.report_content_hash_v1(
    v_final.todays_strength, v_final.next_focus, v_final.practice_suggestion,
    v_final.session_takeaway, v_ratings);
  IF v_recomputed IS DISTINCT FROM v_final.content_hash THEN
    RAISE EXCEPTION USING ERRCODE = 'BC007', MESSAGE = 'report: stored content integrity check failed';
  END IF;

  -- 8. Wording-hash proof: management submits THE EXACT TEXT IT REVIEWED.
  --    The content hash is never returned to, nor accepted from, management.
  IF public.report_wording_hash_v1(
       v_final.todays_strength, v_final.next_focus,
       v_final.practice_suggestion, v_final.session_takeaway)
     IS DISTINCT FROM p_expected_wording_hash THEN
    RAISE EXCEPTION USING ERRCODE = 'BC008',
      MESSAGE = 'report: the wording you reviewed is no longer current; re-read and retry';
  END IF;

  v_now := pg_catalog.now();

  -- 9. Management approval provenance. The three checklist columns are
  --    EVIDENCE, NOT AN APPROVAL: they record that the TRAINER's gate was
  --    satisfied for the lineage source, copied from that source's trainer
  --    approval row so the all-true CHECK is satisfied by a TRUE FACT. They
  --    do not create a trainer approval and never make this row count as
  --    one. approver_role is supplied literally, never defaulted.
  INSERT INTO public.report_version_approvals (
    report_version_id, report_id, centre_id,
    approved_by_membership_id, approver_role, approved_at,
    checklist_evidence_confirmed, checklist_ai_draft_reviewed, checklist_privacy_checked
  ) VALUES (
    v_final.id, p_report_id, v_r.centre_id,
    v_membership_id, 'management', v_now,
    v_ev, v_ai, v_pc
  );

  -- 10. TRANSITION 1: trainer_approved -> approved (transient).
  UPDATE public.reports r
     SET status = 'approved', lock_version = r.lock_version + 1, updated_at = v_now
   WHERE r.id = p_report_id;

  PERFORM public.audit_append_event(
    v_r.centre_id, v_account_id, v_membership_id, 'management'::public.centre_membership_role,
    'report.state_changed', 'report', 'trainer_approved', 'approved',
    'report', v_r.id, 'Report',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('target_type', 'report_version', 'target_id', v_final.id::text,  'target_label', 'Report version'),
      pg_catalog.jsonb_build_object('target_type', 'report_version', 'target_id', v_source_id::text, 'target_label', 'Report version')
    ),
    pg_catalog.jsonb_build_object(
      'report_id',                          v_r.id::text,
      'report_version_id',                  v_final.id::text,
      'content_hash',                       v_final.content_hash,
      'trainer_approved_source_version_id', v_source_id::text,
      'checklist_evidence_confirmed',       v_ev,
      'checklist_ai_draft_reviewed',        v_ai,
      'checklist_privacy_checked',          v_pc
    )
  );

  -- 11. TRANSITION 2: approved -> submitted, with the WRITE-ONCE publication
  --     metadata on the version row. This is the ONLY permitted post-approval
  --     write to a version, and only where all three fields are NULL.
  UPDATE public.report_versions rv
     SET submitted_at = v_now,
         submitted_by_membership_id = v_membership_id,
         submitted_by_role = 'management',
         updated_at = v_now
   WHERE rv.id = v_final.id
     AND rv.submitted_at IS NULL
     AND rv.submitted_by_membership_id IS NULL
     AND rv.submitted_by_role IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  UPDATE public.reports r
     SET status = 'submitted',
         lock_version = r.lock_version + 1,
         latest_submitted_version_id = v_final.id,
         updated_at = v_now
   WHERE r.id = p_report_id;

  PERFORM public.audit_append_event(
    v_r.centre_id, v_account_id, v_membership_id, 'management'::public.centre_membership_role,
    'report.state_changed', 'report', 'approved', 'submitted',
    'report', v_r.id, 'Report',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('target_type', 'report_version', 'target_id', v_final.id::text,  'target_label', 'Report version'),
      pg_catalog.jsonb_build_object('target_type', 'report_version', 'target_id', v_source_id::text, 'target_label', 'Report version')
    ),
    pg_catalog.jsonb_build_object(
      'report_id',                          v_r.id::text,
      'report_version_id',                  v_final.id::text,
      'content_hash',                       v_final.content_hash,
      'trainer_approved_source_version_id', v_source_id::text,
      'checklist_evidence_confirmed',       v_ev,
      'checklist_ai_draft_reviewed',        v_ai,
      'checklist_privacy_checked',          v_pc
    )
  );

  -- 12. OUTBOX INSERTION POINT (A-039 trigger 3). Linked parents are owed a
  --     notification. The outbox row belongs HERE, inside this transaction;
  --     the notification RECORD and its delivery are created AFTER commit by
  --     a separately driven worker reading committed outbox rows, so a
  --     delivery failure never rolls back a committed publication.
  --     Step 7I creates no notification object, no outbox table and no row.

  status              := 'submitted';
  lock_version        := v_r.lock_version + 2;
  submitted_version_id := v_final.id;
  submitted_at        := v_now;
END;
$fn$;

COMMENT ON FUNCTION public.report_management_approve_and_submit(uuid, integer, uuid, text) IS
  'Step 7I RPC-11 (T11, trainer_approved -> approved -> submitted): the SOLE publication path, and the one user action that still performs two transitions in one transaction, emitting exactly two ordered report.state_changed events with NO committed `approved` residue. Gates: live management authorization, the three-way obsolete-version CAS, the trainer-approval lineage gate, nine-way rating parity against that source, snapshot completeness, stored-hash integrity and the caller-supplied WORDING hash. Bumps lock_version TWICE. Contains no exception block and no savepoint.';

-- =====================================================================
-- RPC-12 -- report_reopen_submitted (T12: submitted -> needs_edit)
-- =====================================================================
-- The ONLY exit from `submitted` (A-028), and it creates a new version
-- rather than reopening the published one. NOT forward progress, so it
-- re-checks neither the attendance nor the session-start guard -- that is
-- the physical form of "mid-cycle absence retains existing work but blocks
-- progression": the correction-cycle ENTRY is always available, and the
-- forward transitions of the correction cycle re-check both guards.
--
-- latest_submitted_version_id IS UNCHANGED, so the previously submitted
-- version stays canonical for parents and management while correction work
-- proceeds -- readers never see a gap, a partially-corrected report or draft
-- content.
CREATE FUNCTION public.report_reopen_submitted(
  p_report_id             uuid,
  p_expected_lock_version integer,
  OUT status              public.report_status,
  OUT lock_version        integer,
  OUT report_version_id   uuid,
  OUT revision_number     integer
)
RETURNS record
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_r             public.reports%ROWTYPE;
  v_src           public.report_versions%ROWTYPE;
  v_version_id    uuid;
  v_rev           integer;
BEGIN
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;
  SELECT r.* INTO v_r FROM public.reports r WHERE r.id = p_report_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;
  SELECT (pg_catalog.array_agg(m.id))[1] INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id
     AND m.role = 'trainer' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL OR NOT public.app_trainer_reaches_session(v_r.class_session_id) THEN
    RAISE EXCEPTION USING ERRCODE = 'BC001', MESSAGE = 'report: not found or not permitted';
  END IF;

  IF v_r.status <> 'submitted' THEN
    RAISE EXCEPTION USING ERRCODE = 'BC004', MESSAGE = 'report: this transition is not legal from the report''s current state';
  END IF;
  IF v_r.lock_version IS DISTINCT FROM p_expected_lock_version THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  SELECT rv.* INTO v_src FROM public.report_versions rv WHERE rv.id = v_r.latest_submitted_version_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC003', MESSAGE = 'report: the expected state no longer matches; re-read and retry';
  END IF;

  SELECT COALESCE(pg_catalog.max(rv.revision_number), 0) + 1 INTO v_rev
    FROM public.report_versions rv WHERE rv.report_id = p_report_id;

  -- The clone carries the SOURCE's hash initially -- legitimately, because
  -- content_hash is a content identity and carries no uniqueness constraint.
  -- The clone is TRAINER-authored and holds no approval row and no
  -- submission metadata, which is what makes it the one version for which
  -- needs_edit -> trainer_approved (T8) is reachable.
  INSERT INTO public.report_versions (
    report_id, centre_id, revision_number,
    todays_strength, next_focus, practice_suggestion, session_takeaway,
    authored_by_membership_id, authored_by_role, derived_from_version_id,
    content_hash, content_hash_version
  ) VALUES (
    p_report_id, v_r.centre_id, v_rev,
    v_src.todays_strength, v_src.next_focus, v_src.practice_suggestion, v_src.session_takeaway,
    v_membership_id, 'trainer', v_src.id,
    v_src.content_hash, 1
  )
  RETURNING public.report_versions.id INTO v_version_id;

  INSERT INTO public.report_version_ratings (report_version_id, report_id, dimension_code, rating)
  SELECT v_version_id, p_report_id, rvr.dimension_code, rvr.rating
    FROM public.report_version_ratings rvr
   WHERE rvr.report_version_id = v_src.id;

  INSERT INTO public.report_version_checklist_progress (report_version_id, report_id)
  VALUES (v_version_id, p_report_id);

  UPDATE public.reports r
     SET status = 'needs_edit',
         lock_version = r.lock_version + 1,
         current_cycle_version_id = v_version_id,
         updated_at = pg_catalog.now()
   WHERE r.id = p_report_id;

  PERFORM public.audit_append_event(
    v_r.centre_id, v_account_id, v_membership_id, 'trainer'::public.centre_membership_role,
    'report_version.created', NULL, NULL, NULL,
    'report_version', v_version_id, 'Report version',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('target_type', 'report',         'target_id', v_r.id::text,  'target_label', 'Report'),
      pg_catalog.jsonb_build_object('target_type', 'report_version', 'target_id', v_src.id::text, 'target_label', 'Report version')
    ),
    pg_catalog.jsonb_build_object(
      'report_version_id',       v_version_id::text,
      'revision_number',         v_rev,
      'content_hash',            v_src.content_hash,
      'authored_by_role',        'trainer',
      'derived_from_version_id', v_src.id::text
    )
  );
  PERFORM public.audit_append_event(
    v_r.centre_id, v_account_id, v_membership_id, 'trainer'::public.centre_membership_role,
    'report.state_changed', 'report', 'submitted', 'needs_edit',
    'report', v_r.id, 'Report',
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('target_type', 'report_version', 'target_id', v_version_id::text, 'target_label', 'Report version')
    ),
    pg_catalog.jsonb_build_object(
      'report_id',         v_r.id::text,
      'report_version_id', v_version_id::text,
      'content_hash',      v_src.content_hash
    )
  );

  status            := 'needs_edit';
  lock_version      := v_r.lock_version + 1;
  report_version_id := v_version_id;
  revision_number   := v_rev;
END;
$fn$;

COMMENT ON FUNCTION public.report_reopen_submitted(uuid, integer) IS
  'Step 7I RPC-12 (T12, submitted -> needs_edit): the ONLY exit from submitted, and it never reopens the published version -- it clones it into a fresh trainer-owned working version with a fresh all-false checklist row. latest_submitted_version_id does NOT move, so the previous submitted version stays canonical throughout the correction cycle. Not forward progress, so neither the attendance nor the session-start guard is re-checked.';

-- =====================================================================
-- THE THREE READ MODELS (RPC-13, RPC-14, RPC-15)
-- =====================================================================
-- All three are SECURITY DEFINER, and that is a documented, source-justified
-- deviation rather than a silent one: `authenticated` holds ZERO SELECT on
-- every report table, so a caller holding no privilege cannot read through a
-- SECURITY INVOKER function -- the same logic A-030 uses to mandate definer
-- mutations. Each is required by the CAS contract itself, because a caller
-- cannot supply expected status / lock_version / version-id values it cannot
-- read.
--
-- THE UNAVAILABLE OUTCOME IS ZERO ROWS, for every one of the three. This is
-- forced by the return contract: RPC-13's result is pinned at exactly the
-- four panels plus submitted_at, so there is no discriminator column it
-- could carry, and RPC-15 legitimately returns a partly-NULL row at
-- `submitted` (NULL wording_hash, NULL candidate version id) -- which is
-- precisely why the unavailable outcome must be distinguished by ABSENCE
-- rather than by NULLs. Zero rows delivers "zero panels, no version id, no
-- wording_hash, no lock_version" literally, and it is byte-indistinguishable
-- between "no such report", "not permitted" and "nothing to show", so a
-- caller learns nothing it is not authorized to know.

-- =====================================================================
-- RPC-13 -- report_get_canonical (all three roles; A-030's narrowed path)
-- =====================================================================
-- ONE shared canonical read model for all three roles (A-021). It returns
-- EXACTLY the four content panels and submitted_at, and NOTHING ELSE: no
-- ratings, no notes, no approver identity, no checklist, no pointers, no
-- audit fields -- and specifically NO content_hash and NO revision_number.
--   * no content hash reaches any reader other than the trainer, because
--     panels + hash brute-forces the exact rating grid in 4^9 trials (R-26);
--   * revision_number is a dense per-report ordinal, so disclosing it tells
--     a reader exactly how many correction cycles a report has been through
--     -- the same class of workflow-internal fact this boundary forbids.
--
-- Content resolves EXCLUSIVELY through latest_submitted_version_id, so a
-- trainer-approved-but-unsubmitted version is unreachable here BY
-- CONSTRUCTION, not by a status test -- and a returned report discloses
-- nothing, because T10 moves no pointer.
CREATE FUNCTION public.report_get_canonical(
  p_class_session_id uuid,
  p_student_id       uuid
)
RETURNS TABLE (
  todays_strength     text,
  next_focus          text,
  practice_suggestion text,
  session_takeaway    text,
  submitted_at        timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_account_id uuid;
  v_r          public.reports%ROWTYPE;
  v_role       public.centre_membership_role;
BEGIN
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  SELECT r.* INTO v_r
    FROM public.reports r
   WHERE r.class_session_id = p_class_session_id AND r.student_id = p_student_id;
  IF NOT FOUND THEN RETURN; END IF;

  -- Dispatch on the caller's SINGLE active membership in the report's
  -- centre, resolved live and fail-closed on zero or more than one. Every
  -- branch has a named live predicate; NO BRANCH DEFAULTS TO PERMIT.
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
    IF NOT public.app_parent_reaches_student(p_student_id) THEN RETURN; END IF;
  ELSE
    RETURN;
  END IF;

  IF v_r.latest_submitted_version_id IS NULL THEN RETURN; END IF;

  RETURN QUERY
  SELECT rv.todays_strength, rv.next_focus, rv.practice_suggestion,
         rv.session_takeaway, rv.submitted_at
    FROM public.report_versions rv
   WHERE rv.id = v_r.latest_submitted_version_id;
END;
$fn$;

COMMENT ON FUNCTION public.report_get_canonical(uuid, uuid) IS
  'Step 7I RPC-13 (A-030/A-021): the ONE canonical submitted-report read, shared by trainer, management and parent. Per-role live predicates -- trainer: app_trainer_reaches_session; management: a single active management membership of the report''s centre; parent: app_parent_reaches_student. Resolves EXCLUSIVELY through latest_submitted_version_id, so no role can reach an unsubmitted version. Returns exactly the four panels and submitted_at -- never a content hash, revision number, rating, note, checklist or approval field. Every denial and every unavailability is the same ZERO-ROW outcome.';

-- =====================================================================
-- RPC-14 -- report_get_working (trainer only)
-- =====================================================================
-- THE HIGHEST-VALUE TARGET IN THE WHOLE SURFACE, and it is named as such
-- deliberately: this shape carries the nine rating snapshots, the
-- content_hash and the open correction reason. `authenticated` EXECUTE is
-- held by any authenticated session of any role, so a linked parent asking
-- about their OWN child passes every relationship check in the system --
-- only the ROLE predicate stands between them and the caught rating-grid
-- leak. That is why the trainer-membership resolution below is fail-closed
-- and is proven by a dedicated linked-parent denial test.
CREATE FUNCTION public.report_get_working(
  p_class_session_id uuid,
  p_student_id       uuid
)
RETURNS TABLE (
  report_id                      uuid,
  status                         public.report_status,
  lock_version                   integer,
  current_version_id             uuid,
  revision_number                integer,
  todays_strength                text,
  next_focus                     text,
  practice_suggestion            text,
  session_takeaway               text,
  content_hash                   text,
  evidence_confirmed             boolean,
  ai_draft_reviewed              boolean,
  privacy_checked                boolean,
  ratings                        jsonb,
  latest_submitted_version_id    uuid,
  submitted_at                   timestamptz,
  open_correction_request_id     uuid,
  open_correction_issue_scope    public.correction_issue_scope,
  open_correction_dimension_code public.dimension_code,
  open_correction_reason         text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_r             public.reports%ROWTYPE;
  v_cand          public.report_versions%ROWTYPE;
  v_cp            public.report_version_checklist_progress%ROWTYPE;
  v_cr            public.report_correction_requests%ROWTYPE;
  v_ratings       jsonb;
  v_submitted_at  timestamptz;
BEGIN
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  SELECT r.* INTO v_r
    FROM public.reports r
   WHERE r.class_session_id = p_class_session_id AND r.student_id = p_student_id;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT (pg_catalog.array_agg(m.id))[1] INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id
     AND m.role = 'trainer' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN RETURN; END IF;
  IF NOT public.app_trainer_reaches_session(v_r.class_session_id) THEN RETURN; END IF;

  IF v_r.current_cycle_version_id IS NOT NULL THEN
    SELECT rv.* INTO v_cand FROM public.report_versions rv WHERE rv.id = v_r.current_cycle_version_id;
    -- Every read model must TOLERATE A VERSION WITH NO CHECKLIST ROW: a
    -- management wording-edit version has none, by design.
    SELECT cp.* INTO v_cp
      FROM public.report_version_checklist_progress cp
     WHERE cp.report_version_id = v_r.current_cycle_version_id;
    SELECT pg_catalog.jsonb_agg(
             pg_catalog.jsonb_build_object(
               'dimension_code', rvr.dimension_code::text,
               'display_name',   d.display_name,
               'group_code',     d.group_code::text,
               'rating',         rvr.rating::text)
             ORDER BY d.sort_order)
      INTO v_ratings
      FROM public.report_version_ratings rvr
      JOIN public.assessment_dimensions d ON d.code = rvr.dimension_code
     WHERE rvr.report_version_id = v_r.current_cycle_version_id;
  END IF;

  IF v_r.latest_submitted_version_id IS NOT NULL THEN
    SELECT rv.submitted_at INTO v_submitted_at
      FROM public.report_versions rv WHERE rv.id = v_r.latest_submitted_version_id;
  END IF;

  -- The trainer -- and only the trainer -- reads the correction REASON. The
  -- trainer must see what to fix.
  SELECT cr.* INTO v_cr
    FROM public.report_correction_requests cr
   WHERE cr.report_id = v_r.id AND cr.status = 'open';

  RETURN QUERY SELECT
    v_r.id, v_r.status, v_r.lock_version,
    v_cand.id, v_cand.revision_number,
    v_cand.todays_strength, v_cand.next_focus, v_cand.practice_suggestion, v_cand.session_takeaway,
    v_cand.content_hash,
    v_cp.evidence_confirmed, v_cp.ai_draft_reviewed, v_cp.privacy_checked,
    v_ratings,
    v_r.latest_submitted_version_id, v_submitted_at,
    v_cr.id, v_cr.issue_scope, v_cr.dimension_code, v_cr.reason;
END;
$fn$;

COMMENT ON FUNCTION public.report_get_working(uuid, uuid) IS
  'Step 7I RPC-14: the TRAINER-ONLY working-state read. Carries status, lock_version, the current candidate''s id/revision/content/content_hash, the version-scoped checklist booleans (NULL where no row exists -- a management wording version has none), the nine rating snapshots with authoritative labels, the canonical pointer metadata, and any OPEN correction request including its REASON. Denied to management and to parents by a fail-closed trainer-membership predicate; the denial is the same zero-row outcome as absence.';

-- =====================================================================
-- RPC-15 -- report_get_management_review (management pre-submission read)
-- =====================================================================
-- STATUS-GATED, AND THE GATE IS THE WHOLE POINT (R-32, A-038). This RPC
-- returns the content of current_cycle_version_id at `trainer_approved`, and
-- that pointer names the TRAINER'S LIVE WORKING VERSION whenever the report
-- is drafting, draft_ready or needs_edit. Without the branch table below,
-- management would be handed an un-approved draft in the ORDINARY two-stage
-- flow -- immediately after any return -- not merely by a bypass. THERE IS
-- NO DEFAULT BRANCH THAT RETURNS CONTENT.
--
-- Never, at any status: ratings, content_hash, revision_number, checklist
-- internals, approval internals, trainer notes, AI history, audit rows, or
-- the correction REASON. Management authored the reason; the field exists
-- for the trainer, and RPC-14 is where it is read.
CREATE FUNCTION public.report_get_management_review(
  p_class_session_id uuid,
  p_student_id       uuid
)
RETURNS TABLE (
  report_id                   uuid,
  status                      public.report_status,
  lock_version                integer,
  current_version_id          uuid,
  todays_strength             text,
  next_focus                  text,
  practice_suggestion         text,
  session_takeaway            text,
  wording_hash                text,
  submitted_at                timestamptz,
  open_correction_issue_scope public.correction_issue_scope,
  open_correction_status      public.correction_request_status
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_r             public.reports%ROWTYPE;
  v_v             public.report_versions%ROWTYPE;
  v_cr            public.report_correction_requests%ROWTYPE;
  v_submitted_at  timestamptz;
BEGIN
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  SELECT r.* INTO v_r
    FROM public.reports r
   WHERE r.class_session_id = p_class_session_id AND r.student_id = p_student_id;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT (pg_catalog.array_agg(m.id))[1] INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id
     AND m.role = 'management' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN RETURN; END IF;

  IF v_r.status = 'trainer_approved' THEN
    SELECT rv.* INTO v_v FROM public.report_versions rv WHERE rv.id = v_r.current_cycle_version_id;
    IF NOT FOUND THEN RETURN; END IF;
    IF v_r.latest_submitted_version_id IS NOT NULL THEN
      SELECT rv.submitted_at INTO v_submitted_at
        FROM public.report_versions rv WHERE rv.id = v_r.latest_submitted_version_id;
    END IF;
    SELECT cr.* INTO v_cr
      FROM public.report_correction_requests cr
     WHERE cr.report_id = v_r.id AND cr.status = 'open';

    RETURN QUERY SELECT
      v_r.id, v_r.status, v_r.lock_version, v_v.id,
      v_v.todays_strength, v_v.next_focus, v_v.practice_suggestion, v_v.session_takeaway,
      public.report_wording_hash_v1(v_v.todays_strength, v_v.next_focus,
                                    v_v.practice_suggestion, v_v.session_takeaway),
      v_submitted_at,
      v_cr.issue_scope, v_cr.status;
    RETURN;
  END IF;

  IF v_r.status = 'submitted' THEN
    SELECT rv.* INTO v_v FROM public.report_versions rv WHERE rv.id = v_r.latest_submitted_version_id;
    IF NOT FOUND THEN RETURN; END IF;
    -- NULL lock_version, NULL candidate version id and NULL wording_hash:
    -- there is no candidate to prove a render against, and management has no
    -- operation to perform on a published report.
    RETURN QUERY SELECT
      v_r.id, v_r.status, NULL::integer, NULL::uuid,
      v_v.todays_strength, v_v.next_focus, v_v.practice_suggestion, v_v.session_takeaway,
      NULL::text,
      v_v.submitted_at,
      NULL::public.correction_issue_scope, NULL::public.correction_request_status;
    RETURN;
  END IF;

  -- incomplete | observation_saved | drafting | draft_ready | needs_edit --
  -- the five statuses A-038 names as exposing NO report content to
  -- management. The `needs_edit` case is the one the ordinary return cycle
  -- produces, and it is exactly where the leak used to be.
  RETURN;
END;
$fn$;

COMMENT ON FUNCTION public.report_get_management_review(uuid, uuid) IS
  'Step 7I RPC-15 (R-32/A-038): the STATUS-GATED management pre-submission read. At trainer_approved it returns the final-review candidate -- the four parent-facing panels, the computed WORDING hash and the CAS values management genuinely needs. At submitted it returns the published panels with a NULL wording_hash and no candidate version id. At incomplete, observation_saved, drafting, draft_ready and needs_edit -- and where no report exists -- it returns the ZERO-ROW unavailable outcome. It never returns a rating, content hash, revision number, checklist field, approval field or correction reason at any status.';

-- ---------------------------------------------------------------------
-- 8/9 -- EXECUTE posture (section 5.0: 14 granted, 4 at zero)
-- ---------------------------------------------------------------------
-- One signature-qualified REVOKE and one signature-qualified GRANT per
-- granted function, in the Step 7G block form -- never an aggregate or
-- unqualified statement, which would be ambiguous under any future overload.
--
-- Every one of the fourteen is reachable by ANY authenticated session of ANY
-- role, so ROLE IS A PREDICATE INSIDE EACH FUNCTION, NEVER A PROPERTY OF THE
-- GRANT. That is why every (role, function) pair has an explicit predicate
-- rather than only the pairs a UI would exercise.
--
-- NOTHING IS GRANTED TO service_role, EVER. It carries BYPASSRLS, so the
-- only control that constrains it is the absence of a privilege.

REVOKE ALL ON FUNCTION public.report_create(uuid, uuid, uuid)                                                              FROM PUBLIC, anon, service_role, authenticator;
REVOKE ALL ON FUNCTION public.report_mark_observation_saved(uuid, integer)                                                 FROM PUBLIC, anon, service_role, authenticator;
REVOKE ALL ON FUNCTION public.report_request_draft(uuid, integer)                                                          FROM PUBLIC, anon, service_role, authenticator;
REVOKE ALL ON FUNCTION public.report_cancel_draft(uuid, integer)                                                           FROM PUBLIC, anon, service_role, authenticator;
REVOKE ALL ON FUNCTION public.report_save_edit(uuid, public.report_status, integer, uuid, text, text, text, text, uuid)     FROM PUBLIC, anon, service_role, authenticator;
REVOKE ALL ON FUNCTION public.report_update_checklist(uuid, integer, uuid, boolean, boolean, boolean)                       FROM PUBLIC, anon, service_role, authenticator;
REVOKE ALL ON FUNCTION public.report_trainer_approve(uuid, public.report_status, integer, uuid, text)                       FROM PUBLIC, anon, service_role, authenticator;
REVOKE ALL ON FUNCTION public.report_management_edit_wording(uuid, integer, uuid, text, text, text, text, text)             FROM PUBLIC, anon, service_role, authenticator;
REVOKE ALL ON FUNCTION public.report_management_return_to_trainer(uuid, integer, uuid, public.correction_issue_scope, public.dimension_code, text) FROM PUBLIC, anon, service_role, authenticator;
REVOKE ALL ON FUNCTION public.report_management_approve_and_submit(uuid, integer, uuid, text)                               FROM PUBLIC, anon, service_role, authenticator;
REVOKE ALL ON FUNCTION public.report_reopen_submitted(uuid, integer)                                                       FROM PUBLIC, anon, service_role, authenticator;
REVOKE ALL ON FUNCTION public.report_get_canonical(uuid, uuid)                                                             FROM PUBLIC, anon, service_role, authenticator;
REVOKE ALL ON FUNCTION public.report_get_working(uuid, uuid)                                                               FROM PUBLIC, anon, service_role, authenticator;
REVOKE ALL ON FUNCTION public.report_get_management_review(uuid, uuid)                                                     FROM PUBLIC, anon, service_role, authenticator;

GRANT EXECUTE ON FUNCTION public.report_create(uuid, uuid, uuid)                                                              TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_mark_observation_saved(uuid, integer)                                                 TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_request_draft(uuid, integer)                                                          TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_cancel_draft(uuid, integer)                                                           TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_save_edit(uuid, public.report_status, integer, uuid, text, text, text, text, uuid)     TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_update_checklist(uuid, integer, uuid, boolean, boolean, boolean)                       TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_trainer_approve(uuid, public.report_status, integer, uuid, text)                       TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_management_edit_wording(uuid, integer, uuid, text, text, text, text, text)             TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_management_return_to_trainer(uuid, integer, uuid, public.correction_issue_scope, public.dimension_code, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_management_approve_and_submit(uuid, integer, uuid, text)                               TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_reopen_submitted(uuid, integer)                                                       TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_get_canonical(uuid, uuid)                                                             TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_get_working(uuid, uuid)                                                               TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_get_management_review(uuid, uuid)                                                     TO authenticated;

-- THE FOUR ZERO-EXECUTE FUNCTIONS. The revoke list adds `authenticated` --
-- the Step 7H audit pattern -- and NO GRANT of any kind follows.
--   * report_store_draft ......... GOVERNANCE PROHIBITION (R-27): granting
--     it ships the grounding-bypass surface CLAUDE.md section 4
--     non-negotiable 1 forbids. No later checkpoint may grant it without
--     reopening R-27.
--   * both serializers ........... GOVERNANCE PROHIBITION: the content
--     serializer's output must never reach management or a parent (R-26),
--     and both are pure functions whose only legitimate callers already run
--     as postgres.
--   * app_parent_reaches_student . MINIMUM PRIVILEGE (R-31), a weaker and
--     honestly weaker reason: it answers only about the caller's own links
--     and would not have expanded parent access. A later checkpoint MAY
--     grant it -- but only TOGETHER WITH the policy or client consumer that
--     needs it, never ahead of one.
REVOKE ALL ON FUNCTION public.report_store_draft(uuid, integer, integer, text, text, text, text)               FROM PUBLIC, anon, authenticated, service_role, authenticator;
REVOKE ALL ON FUNCTION public.report_content_hash_v1(text, text, text, text, public.competency_rating[])       FROM PUBLIC, anon, authenticated, service_role, authenticator;
REVOKE ALL ON FUNCTION public.report_wording_hash_v1(text, text, text, text)                                   FROM PUBLIC, anon, authenticated, service_role, authenticator;
REVOKE ALL ON FUNCTION public.app_parent_reaches_student(uuid)                                                 FROM PUBLIC, anon, authenticated, service_role, authenticator;

-- ---------------------------------------------------------------------
-- 9/9 -- End-of-migration posture assertions (7E/7G/7H style)
-- ---------------------------------------------------------------------
-- These re-derive the FULL posture from the catalogue rather than trusting
-- that the statements above did what they say. Every count below traces to
-- section 5.0 and section 14 of the Step 7I baseline, which are the sole
-- authorities for these numbers.
DO $assert$
DECLARE
  v_granted CONSTANT text[] := ARRAY[
    'report_create', 'report_mark_observation_saved', 'report_request_draft',
    'report_cancel_draft', 'report_save_edit', 'report_update_checklist',
    'report_trainer_approve', 'report_management_edit_wording',
    'report_management_return_to_trainer', 'report_management_approve_and_submit',
    'report_reopen_submitted', 'report_get_canonical', 'report_get_working',
    'report_get_management_review'
  ];
  v_zero_exec CONSTANT text[] := ARRAY[
    'report_store_draft', 'report_content_hash_v1', 'report_wording_hash_v1',
    'app_parent_reaches_student'
  ];
  v_report_tables CONSTANT text[] := ARRAY[
    'reports', 'report_versions', 'report_version_ratings',
    'report_version_checklist_progress', 'report_version_approvals',
    'report_correction_requests'
  ];
  v_expected_labels CONSTANT text[] := ARRAY[
    'incomplete', 'observation_saved', 'drafting', 'draft_ready',
    'needs_edit', 'trainer_approved', 'approved', 'submitted'
  ];
  v_n      bigint;
  v_m      bigint;
  v_labels text[];
  v_name   text;
BEGIN
  -- B1: exactly 26 tables in public, ALL with RLS enabled, none FORCEd.
  SELECT pg_catalog.count(*),
         pg_catalog.count(*) FILTER (WHERE NOT c.relrowsecurity)
    INTO v_n, v_m
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace ns ON ns.oid = c.relnamespace
   WHERE ns.nspname = 'public' AND c.relkind = 'r';
  IF v_n <> 26 THEN
    RAISE EXCEPTION 'Step 7I assertion B1 failed: % table(s) in public; expected 26', v_n;
  END IF;
  IF v_m <> 0 THEN
    RAISE EXCEPTION 'Step 7I assertion B1 failed: % table(s) do not have RLS enabled', v_m;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace ns ON ns.oid = c.relnamespace
   WHERE ns.nspname = 'public' AND c.relkind = 'r' AND c.relforcerowsecurity;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7I assertion B1 failed: FORCE ROW LEVEL SECURITY is set on % table(s); expected 0', v_n;
  END IF;

  -- B2: exactly 12 enums (10 from Step 7E + the two correction vocabularies).
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_type t
    JOIN pg_catalog.pg_namespace ns ON ns.oid = t.typnamespace
   WHERE ns.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN
    RAISE EXCEPTION 'Step 7I assertion B2 failed: % enum type(s) in public; expected 12', v_n;
  END IF;

  -- B3: the report_status label set and ORDER. The physical pg_enum sort
  -- order must equal A-036, CLAUDE.md section 6 and the Step 7I baseline.
  SELECT pg_catalog.array_agg(e.enumlabel::text ORDER BY e.enumsortorder)
    INTO v_labels
    FROM pg_catalog.pg_enum e
    JOIN pg_catalog.pg_type t ON t.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace ns ON ns.oid = t.typnamespace
   WHERE ns.nspname = 'public' AND t.typname = 'report_status';
  IF v_labels IS DISTINCT FROM v_expected_labels THEN
    RAISE EXCEPTION 'Step 7I assertion B3 failed: report_status is % ; expected % in that exact order',
      v_labels, v_expected_labels;
  END IF;

  -- B4: exactly 28 functions in public (6 Step 7G + 4 Step 7H + 18 new).
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public';
  IF v_n <> 28 THEN
    RAISE EXCEPTION 'Step 7I assertion B4 failed: % function(s) in public; expected 28 (6 Step 7G + 4 Step 7H + 18 new)', v_n;
  END IF;

  -- B5: all eighteen new functions exist, are owned by postgres, are
  -- plpgsql, and pin an empty search_path.
  FOREACH v_name IN ARRAY (v_granted || v_zero_exec) LOOP
    SELECT pg_catalog.count(*) INTO v_n
      FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
      JOIN pg_catalog.pg_language l   ON l.oid = p.prolang
     WHERE ns.nspname = 'public'
       AND p.proname = v_name
       AND pg_catalog.pg_get_userbyid(p.proowner) = 'postgres'
       AND l.lanname = 'plpgsql'
       AND p.proconfig IS NOT NULL
       AND p.proconfig::text LIKE '%search_path=%';
    IF v_n <> 1 THEN
      RAISE EXCEPTION 'Step 7I assertion B5 failed: public.% is not exactly one postgres-owned plpgsql function with a pinned search_path (found %)', v_name, v_n;
    END IF;
  END LOOP;

  -- B6: EXECUTE posture. Exactly the fourteen granted RPCs hold
  -- `authenticated` EXECUTE among the new eighteen; the six Step 7G helpers
  -- keep theirs, so the whole-schema figure is 20.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND p.proname = ANY (v_granted)
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 14 THEN
    RAISE EXCEPTION 'Step 7I assertion B6 failed: % of the 14 client-callable RPCs hold authenticated EXECUTE', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 20 THEN
    RAISE EXCEPTION 'Step 7I assertion B6 failed: % function(s) in public hold authenticated EXECUTE; expected 20 (6 Step 7G helpers + 14 Step 7I RPCs)', v_n;
  END IF;

  -- B7: the four zero-EXECUTE functions hold NO EXECUTE for any client role,
  -- INCLUDING PUBLIC.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND p.proname = ANY (v_zero_exec)
     AND (   pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE')
          OR pg_catalog.has_function_privilege('anon',          p.oid, 'EXECUTE')
          OR pg_catalog.has_function_privilege('service_role',  p.oid, 'EXECUTE')
          OR pg_catalog.has_function_privilege('authenticator', p.oid, 'EXECUTE')
          -- grantee 0 is PUBLIC: a NULL proacl would also mean the default
          -- PUBLIC EXECUTE, which the explicit revokes above must have
          -- replaced with a concrete owner-only ACL.
          OR p.proacl IS NULL
          OR EXISTS (SELECT 1 FROM pg_catalog.aclexplode(p.proacl) ae WHERE ae.grantee = 0));
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7I assertion B7 failed: % of the four zero-EXECUTE functions are client-reachable', v_n;
  END IF;

  -- B8: NOTHING is granted to service_role anywhere in public.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND pg_catalog.has_function_privilege('service_role', p.oid, 'EXECUTE');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7I assertion B8 failed: service_role holds EXECUTE on % function(s)', v_n;
  END IF;

  -- B9: zero table privileges for every client role on all six report-family
  -- tables, across all seven privilege types.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.unnest(v_report_tables) AS t(tbl)
    CROSS JOIN pg_catalog.unnest(ARRAY['anon','authenticated','service_role']) AS r(role_name)
    CROSS JOIN pg_catalog.unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) AS pv(priv)
   WHERE pg_catalog.has_table_privilege(r.role_name, ('public.' || pg_catalog.quote_ident(t.tbl))::regclass, pv.priv);
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7I assertion B9 failed: % client table privilege(s) exist on the report-family tables; expected 0', v_n;
  END IF;

  -- B10: the correction table has RLS enabled and ZERO policies, and the
  -- Step 7G policy count is untouched at 29.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_policies pol
   WHERE pol.schemaname = 'public' AND pol.tablename = 'report_correction_requests';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7I assertion B10 failed: % policy(ies) exist on report_correction_requests; expected 0', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_policies pol WHERE pol.schemaname = 'public';
  IF v_n <> 29 THEN
    RAISE EXCEPTION 'Step 7I assertion B10 failed: % policy(ies) in public; expected the 29 Step 7G policies, unchanged', v_n;
  END IF;

  -- B11: the three new columns and their named constraints exist.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_attribute a
   WHERE a.attrelid = 'public.report_versions'::regclass
     AND NOT a.attisdropped
     AND a.attname IN ('content_hash', 'content_hash_version', 'trainer_approved_source_version_id');
  IF v_n <> 3 THEN
    RAISE EXCEPTION 'Step 7I assertion B11 failed: % of the 3 new report_versions columns exist', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_constraint c
   WHERE c.conrelid = 'public.report_versions'::regclass
     AND c.conname IN ('report_versions_content_hash_chk',
                       'report_versions_content_hash_version_chk',
                       'report_versions_trainer_approved_source_fk');
  IF v_n <> 3 THEN
    RAISE EXCEPTION 'Step 7I assertion B11 failed: % of the 3 new report_versions constraints exist', v_n;
  END IF;

  -- B12: the four constraint replacements landed, and the approver_role
  -- DEFAULT is gone.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_constraint c
   WHERE c.conrelid = 'public.report_versions'::regclass
     AND c.conname = 'report_versions_authored_by_role_pinned_chk'
     AND pg_catalog.pg_get_constraintdef(c.oid) LIKE '%management%';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Step 7I assertion B12 failed: report_versions authorship is not widened to trainer-or-management';
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_constraint c
   WHERE c.conrelid = 'public.report_versions'::regclass
     AND c.conname = 'report_versions_submitted_by_role_pinned_chk'
     AND pg_catalog.pg_get_constraintdef(c.oid) LIKE '%management%'
     AND pg_catalog.pg_get_constraintdef(c.oid) NOT LIKE '%trainer%';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Step 7I assertion B12 failed: report_versions submission is not narrowed to management only';
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_constraint c
   WHERE c.conrelid = 'public.report_version_approvals'::regclass
     AND c.conname = 'report_version_approvals_pkey'
     AND pg_catalog.array_length(c.conkey, 1) = 2;
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Step 7I assertion B12 failed: the approvals primary key is not composite (version, role)';
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_constraint c
   WHERE c.conrelid = 'public.report_version_approvals'::regclass
     AND c.conname = 'report_version_approvals_approver_role_pinned_chk'
     AND pg_catalog.pg_get_constraintdef(c.oid) LIKE '%management%';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Step 7I assertion B12 failed: the approver-role pin is not widened to trainer-or-management';
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_attrdef d
    JOIN pg_catalog.pg_attribute a ON a.attrelid = d.adrelid AND a.attnum = d.adnum
   WHERE d.adrelid = 'public.report_version_approvals'::regclass
     AND a.attname = 'approver_role';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7I assertion B12 failed: report_version_approvals.approver_role still carries a DEFAULT (A-040 item 5)';
  END IF;

  -- B13: the correction table's one ratified partial unique index exists.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_indexes i
   WHERE i.schemaname = 'public'
     AND i.indexname = 'report_correction_requests_one_open_per_report_idx'
     AND i.indexdef LIKE '%UNIQUE%'
     AND i.indexdef LIKE '%WHERE%'
     AND i.indexdef LIKE '%''open''%';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Step 7I assertion B13 failed: the open-correction partial unique index is missing or not restricted to status = open';
  END IF;

  -- B14: the P-1 default-ACL posture is byte-unchanged -- postgres in public
  -- still defaults new tables/sequences/functions to owner-only.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_default_acl d
    JOIN pg_catalog.pg_namespace ns ON ns.oid = d.defaclnamespace
   WHERE pg_catalog.pg_get_userbyid(d.defaclrole) = 'postgres' AND ns.nspname = 'public';
  IF v_n <> 3 THEN
    RAISE EXCEPTION 'Step 7I assertion B14 failed: % postgres default-ACL row(s) in public; expected 3', v_n;
  END IF;

  -- B15: the Step 7H audit surface is untouched -- four functions, three
  -- tables, and no registry replacement. Step 7I extends NO audit action.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND p.proname IN ('audit_append_event', 'audit_verify_chain',
                       'audit_canonical_json', 'audit_block_mutation');
  IF v_n <> 4 THEN
    RAISE EXCEPTION 'Step 7I assertion B15 failed: % of the 4 Step 7H audit functions exist', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND p.proname IN ('audit_append_event', 'audit_verify_chain')
     AND p.prosrc LIKE '%membership.bootstrap%'
     AND p.prosrc LIKE '%report.state_changed%';
  IF v_n <> 2 THEN
    RAISE EXCEPTION 'Step 7I assertion B15 failed: the 16-action registry is not intact in both audit functions';
  END IF;

  RAISE NOTICE 'Step 7I report lifecycle: 26 tables, 12 enums, 28 functions, 8 ordered report_status labels, 14 authenticated EXECUTE grants, 4 zero-EXECUTE functions, 29 policies unchanged, zero client table privileges on the report family.';
END;
$assert$;







