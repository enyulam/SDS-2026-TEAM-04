-- =====================================================================
-- B.E.S.T Coach -- report_source_map: the panel-to-dimension source trace
-- =====================================================================
-- Governing authority (highest first):
--   Specification v3 section 20 (`report_source_map` [KEY]) -> Amendment 003
--   (A-026, A-029, A-030, A-031) -> Amendment 004 (A-037, A-038)
--   -> Operator ruling OD-4 (the four canonical panels)
--   -> Operator ruling G-04 item 1 (`report_source_map` =
--      REQUIRED_FOR_FINAL_MVP, execution owner P2-T06, "build it according
--      to current OD-4 semantics and current functional authority")
--   -> Operator ruling Q-27 (the parent rating boundary is a DATA boundary)
--   -> CLAUDE.md -> docs/plan/HERO_V3_EXECUTION_OVERLAY.md (Stage 1)
--
-- WHAT THIS MIGRATION CREATES:
--   * 1 table ........ public.report_source_map
--   * 1 function ..... public.report_store_source_map(uuid, jsonb)
--                      -- OWNER-ONLY, zero client EXECUTE
--   * 1 function ..... public.report_get_source_map(uuid)
--                      -- trainer-only read
--   * 3 COMMENT statements, 2 REVOKE lines, 1 GRANT line
--   * RLS ENABLED on the new table with ZERO policies and ZERO client grants
--   * its authored precondition and post-apply assertions
--
-- WHAT IT DELIBERATELY DOES NOT CREATE:
--   NO ENUM. No new type of any kind, no new enum label, no column on any
--   existing table, no trigger, no view, no extension, no schema, no
--   ALTER DEFAULT PRIVILEGES, no ownership change, NO NEW AUDIT ACTION,
--   no fixture row, and -- critically -- NO `CREATE OR REPLACE` and NO
--   `DROP` of ANY existing function. `report_store_draft` is BYTE-
--   UNTOUCHED, its signature is unchanged, and its ZERO client EXECUTE is
--   unchanged (R-27). Every ratified transition, status, projection,
--   policy, table, enum, column and existing grant is byte-untouched.
--
-- ---------------------------------------------------------------------
-- WHY NO ENUM, WHEN A-026 WOULD NORMALLY SUGGEST ONE
-- ---------------------------------------------------------------------
-- `output_section`'s four values are closed, so A-026's first test points
-- at an enum. It is a CHECK constraint over four literals instead, for a
-- specific reason: creating an enum `section 6.1 does not list` is a
-- CLAUDE.md section 12 stop-and-ask, and G-04's ruling authorizes the
-- REQUIRED TABLE, not a new vocabulary type. The four literals are also
-- not a new vocabulary at all -- they are the EXISTING four
-- `report_versions` column names, so a CHECK against them cannot drift
-- from the panels it describes without the panels themselves moving.
-- Assertion S8 pins that agreement against the live catalogue rather
-- than against this comment.
--
-- The source side needs no new type either: it reuses the EXISTING
-- `public.dimension_code` enum, which is already the authoritative
-- nine-value vocabulary.
--
-- ---------------------------------------------------------------------
-- WHAT A ROW MEANS, AND WHY THAT IS DERIVED RATHER THAN INVENTED
-- ---------------------------------------------------------------------
-- Spec section 20 defines this table as "output_section <-> source
-- dimension/field", the thing that "makes Compare with Notes /
-- source-trace implementable". A row asserts exactly:
--
--   "version V's panel S draws on the trainer's assessment of dimension D."
--
-- The caller derives that from the ACCEPTED panel text and the FROZEN
-- `DIMENSION_TERMS` lexicon in `server/modules/ai-drafting/grounding.ts`
-- -- the same closed lexicon grounding validation itself reads, matched on
-- word boundaries. So the trace is a DERIVATION FROM SHIPPED, RATIFIED
-- ANCHORS, not a new judgement invented at write time, and it cannot
-- disagree with what grounding saw in the same text.
--
-- THE `field` HALF OF SPEC SECTION 20's PHRASE IS DELIBERATELY ABSENT.
-- Tracing a panel to `observation_notes`, `follow_up_notes`,
-- `strength_chips` or `focus_chips` has no derivation available from
-- ratified anchors, and a `source_kind`/`source_field` column pair
-- populated with one value and reserved for another is exactly the
-- placeholder column CLAUDE.md section 12 makes a stop-and-ask. The
-- dimension half is complete and useful on its own; the field half is a
-- separate additive migration if it is ever ruled required. This is a
-- STATED SCOPE BOUND, not an oversight.
--
-- ---------------------------------------------------------------------
-- ATOMICITY: THE MAP AND THE VERSION COMMIT TOGETHER
-- ---------------------------------------------------------------------
-- `report_store_source_map` is OWNER-ONLY, exactly like
-- `report_store_draft`, and is reached only through the same trusted
-- generation-completion channel. That channel runs both calls inside ONE
-- `DO` block in ONE psql session, i.e. ONE TRANSACTION, so a version and
-- its source trace are created together or not at all. A source-map
-- failure rolls the draft store back with it and the channel reports the
-- SQLSTATE -- the map cannot be silently skipped, and a version can never
-- commit with a half-written trace.
--
-- This is why `report_store_draft` is not modified. Adding a parameter to
-- it would mean DROPping and re-CREATEing a ratified, byte-pinned body --
-- retyping ~350 lines of governed logic, which is precisely the
-- hand-transcription drift hazard this project has already been bitten by.
-- A second owner-only function in the same transaction achieves the same
-- atomicity with ZERO risk to the existing body.
--
-- ---------------------------------------------------------------------
-- WRITE-ONCE, AND IMMUTABLE BY ABSENCE OF PRIVILEGE
-- ---------------------------------------------------------------------
-- A-037: every accepted content change creates a NEW immutable version.
-- The trace belongs to the version, so it is written ONCE per version and
-- never amended: `report_store_source_map` refuses a version that already
-- holds any row (S-4 below), so a re-run cannot append a second, divergent
-- trace to a frozen version.
--
-- A DERIVED VERSION INHERITS NO TRACE, ON PURPOSE. A trainer edit or a
-- management wording edit produces prose those humans authored, not prose
-- the AI derived from ratings; copying the AI's trace onto it would assert
-- a derivation that did not happen. Lineage is already explicit through
-- `report_versions.derived_from_version_id`, so a reader who wants the
-- trace of the draft this version descends from walks back to it. The
-- correct answer for a human-authored version is ZERO ROWS, and that is
-- what it gets.
--
-- Immutability needs no trigger: RLS is ENABLED with ZERO POLICIES and
-- NO ROLE holds any privilege on the table -- not `PUBLIC`, `anon`,
-- `authenticated`, `authenticator` or `service_role`. That is Step 7E's
-- deny-by-default posture (A-030), and it means no client can SELECT,
-- INSERT, UPDATE or DELETE a row by any route. All access is through the
-- two functions.
--
-- ---------------------------------------------------------------------
-- WHO MAY READ IT: THE TRAINER, AND NOBODY ELSE
-- ---------------------------------------------------------------------
-- A source-map row names a DIMENSION CODE. Under A-038 management must
-- never read raw per-dimension assessment data, and under Q-27 the nine
-- dimension ratings must not reach a Parent session ANYWHERE -- and Q-27
-- is expressly a DATA boundary enforced at the governed projection layer,
-- never by hiding something in a client.
--
-- `report_get_source_map` therefore resolves ONLY a single active
-- `trainer` membership in the report's own centre with live session reach.
-- Management and parent are closed by the SAME predicate that authorizes
-- the trainer, not by a separate deny branch, and both receive ZERO ROWS
-- -- byte-identical to the answer a non-existent report gets, so the
-- result discloses nothing about which case it was. Q-27 grants management
-- nothing here, and this migration widens A-038 by exactly nothing.
--
-- Note the asymmetry with `report_get_working`: that read is also
-- trainer-only, so no NEW disclosure surface is created -- the trainer
-- already reads its own assessment substance. This table adds a trace
-- BETWEEN two things the trainer may already see.
--
-- ---------------------------------------------------------------------
-- AUDIT
-- ---------------------------------------------------------------------
-- No new audit action, and the Step 7H registry stays at SIXTEEN strings.
-- The source trace is a CHILD of the version, and
-- `report_version.created` (registry E2) is already emitted for that
-- version by `report_store_draft` in the SAME transaction. A second event
-- for a child row of an already-audited creation would violate A-029's
-- one-event-per-governed-action rule, not strengthen it.
-- =====================================================================

-- ---------------------------------------------------------------------
-- P-1 guard.
-- ---------------------------------------------------------------------
DO $guard$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION
      'report_source_map migration aborted before any change: this migration must run as postgres, not "%".',
      current_user;
  END IF;
END;
$guard$;

-- ---------------------------------------------------------------------
-- Precondition.
-- ---------------------------------------------------------------------
DO $precondition$
DECLARE
  v_n bigint;
BEGIN
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public';
  IF v_n <> 37 THEN
    RAISE EXCEPTION
      'report_source_map migration aborted before any change: public holds % function(s); expected 37 (the post-attendance census).', v_n;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace ns ON ns.oid = c.relnamespace
   WHERE ns.nspname = 'public' AND c.relkind = 'r';
  IF v_n <> 26 THEN
    RAISE EXCEPTION
      'report_source_map migration aborted before any change: public holds % table(s); expected the ratified census of 26.', v_n;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
      JOIN pg_catalog.pg_namespace ns ON ns.oid = c.relnamespace
     WHERE ns.nspname = 'public' AND c.relname = 'report_source_map'
  ) THEN
    RAISE EXCEPTION 'report_source_map migration aborted before any change: the table already exists.';
  END IF;

  -- The four OD-4 panels must still be the four columns this CHECK names.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_attribute a
   WHERE a.attrelid = 'public.report_versions'::pg_catalog.regclass
     AND NOT a.attisdropped
     AND a.attname IN ('overview', 'strengths', 'areas_for_development', 'remarks');
  IF v_n <> 4 THEN
    RAISE EXCEPTION
      'report_source_map migration aborted before any change: only % of the 4 OD-4 panel columns exist on report_versions.', v_n;
  END IF;

  -- The nine-value source vocabulary must still be nine values.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_enum e
    JOIN pg_catalog.pg_type t ON t.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace ns ON ns.oid = t.typnamespace
   WHERE ns.nspname = 'public' AND t.typname = 'dimension_code';
  IF v_n <> 9 THEN
    RAISE EXCEPTION
      'report_source_map migration aborted before any change: dimension_code holds % label(s); expected 9.', v_n;
  END IF;

  -- `report_store_draft` must exist with the signature the trusted channel
  -- calls, because this migration's atomicity claim depends on both calls
  -- living in that channel's one transaction.
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
     WHERE ns.nspname = 'public' AND p.proname = 'report_store_draft'
       -- oidvectortypes(proargtypes) yields ONLY the IN-argument types.
       -- MEASURED CHOICE: on this cluster
       -- pg_get_function_identity_arguments ALSO returns the five OUT
       -- parameters (and the parameter names), so comparing against a
       -- seven-type string through it fails on a correct database. This was
       -- found by measurement, not assumed.
       AND pg_catalog.oidvectortypes(p.proargtypes)
           = 'uuid, integer, integer, text, text, text, text'
  ) THEN
    RAISE EXCEPTION
      'report_source_map migration aborted before any change: report_store_draft does not carry the signature the trusted channel calls.';
  END IF;
END;
$precondition$;

-- =====================================================================
-- The table
-- =====================================================================
CREATE TABLE public.report_source_map (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_version_id     uuid NOT NULL,
  output_section        text NOT NULL,
  source_dimension_code public.dimension_code NOT NULL,
  created_at            timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT report_source_map_version_fk
    FOREIGN KEY (report_version_id) REFERENCES public.report_versions (id) ON DELETE RESTRICT,

  -- The four OD-4 canonical panels, and no others. These are the four
  -- `report_versions` column names, so this list cannot describe a panel
  -- that does not exist.
  CONSTRAINT report_source_map_output_section_chk
    CHECK (output_section IN ('overview', 'strengths', 'areas_for_development', 'remarks')),

  -- One assertion per (version, panel, dimension). A trace either says a
  -- panel draws on a dimension or it does not; saying it twice is not a
  -- stronger claim, it is a corrupt one.
  CONSTRAINT report_source_map_triple_key
    UNIQUE (report_version_id, output_section, source_dimension_code)
);

COMMENT ON TABLE public.report_source_map IS
'Spec section 20''s [KEY] source trace, built under Operator ruling G-04 item 1 to current OD-4 semantics. A row asserts "version V''s panel S draws on the trainer''s assessment of dimension D", DERIVED by the caller from the accepted panel text and the frozen DIMENSION_TERMS lexicon that grounding validation itself reads -- never invented at write time. Written ONCE per version, inside the SAME transaction as report_store_draft, through the owner-only report_store_source_map; a version that already holds any row is refused, so a frozen version can never acquire a second divergent trace. A human-authored derived version (trainer edit, management wording edit) inherits NO trace and correctly holds ZERO rows -- lineage is report_versions.derived_from_version_id. RLS is ENABLED with ZERO POLICIES and NO role holds any privilege: all access is through the two functions, and the table is immutable by absence of privilege rather than by trigger. The `field` half of spec section 20''s "dimension/field" is DELIBERATELY ABSENT -- it has no derivation from ratified anchors, and a reserved-but-unpopulated column pair is a placeholder. A row names a DIMENSION CODE, so reads are TRAINER-ONLY: A-038 bars management from raw per-dimension assessment data and Q-27 makes the parent rating boundary a DATA boundary, and both are closed here by the absence of any path, not by hiding a field.';

ALTER TABLE public.report_source_map ENABLE ROW LEVEL SECURITY;

-- Deny-by-default (A-030). No policy, and no privilege for any client role.
REVOKE ALL ON TABLE public.report_source_map FROM PUBLIC, anon, authenticated, authenticator, service_role;

-- =====================================================================
-- report_store_source_map -- OWNER-ONLY write, one transaction with the
-- version it describes
-- =====================================================================
-- Authored error codes:
--   BC301  the report version does not exist
--   BC302  a source map already exists for this version (write-once)
--   BC303  p_entries is not a JSON array
--   BC304  an element is not an object, or its key set is not exactly
--          {output_section, dimension_code}, or a value is not a string
--   BC305  unknown output_section
--   BC306  unknown dimension_code
--   BC307  duplicate (output_section, dimension_code) within p_entries
CREATE FUNCTION public.report_store_source_map(
  p_report_version_id uuid,
  p_entries           jsonb,
  OUT entries_written integer
)
RETURNS integer
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_elem      jsonb;
  v_keys      text[];
  v_section   text;
  v_dimension text;
  v_seen      text[] := ARRAY[]::text[];
  v_pair      text;
  v_n         integer := 0;
BEGIN
  IF p_report_version_id IS NULL
     OR NOT EXISTS (SELECT 1 FROM public.report_versions v WHERE v.id = p_report_version_id) THEN
    RAISE EXCEPTION USING ERRCODE = 'BC301',
      MESSAGE = 'report_store_source_map: the report version does not exist';
  END IF;

  -- Write-once (A-037): a frozen version's trace is never amended.
  IF EXISTS (SELECT 1 FROM public.report_source_map m WHERE m.report_version_id = p_report_version_id) THEN
    RAISE EXCEPTION USING ERRCODE = 'BC302',
      MESSAGE = 'report_store_source_map: a source map already exists for this version';
  END IF;

  IF p_entries IS NULL OR pg_catalog.jsonb_typeof(p_entries) <> 'array' THEN
    RAISE EXCEPTION USING ERRCODE = 'BC303',
      MESSAGE = 'report_store_source_map: entries must be a JSON array';
  END IF;

  FOR v_elem IN SELECT * FROM pg_catalog.jsonb_array_elements(p_entries) LOOP
    IF pg_catalog.jsonb_typeof(v_elem) <> 'object' THEN
      RAISE EXCEPTION USING ERRCODE = 'BC304',
        MESSAGE = 'report_store_source_map: each entry must be a JSON object';
    END IF;
    SELECT pg_catalog.array_agg(k ORDER BY k) INTO v_keys
      FROM pg_catalog.jsonb_object_keys(v_elem) AS k;
    IF v_keys IS DISTINCT FROM ARRAY['dimension_code', 'output_section'] THEN
      RAISE EXCEPTION USING ERRCODE = 'BC304',
        MESSAGE = 'report_store_source_map: each entry must carry exactly output_section and dimension_code';
    END IF;
    IF pg_catalog.jsonb_typeof(v_elem -> 'output_section') <> 'string'
       OR pg_catalog.jsonb_typeof(v_elem -> 'dimension_code') <> 'string' THEN
      RAISE EXCEPTION USING ERRCODE = 'BC304',
        MESSAGE = 'report_store_source_map: output_section and dimension_code must be strings';
    END IF;

    v_section   := v_elem ->> 'output_section';
    v_dimension := v_elem ->> 'dimension_code';

    IF v_section NOT IN ('overview', 'strengths', 'areas_for_development', 'remarks') THEN
      RAISE EXCEPTION USING ERRCODE = 'BC305',
        MESSAGE = 'report_store_source_map: unknown output_section';
    END IF;
    -- Validated against the LIVE enum, not against a transcribed list.
    IF NOT EXISTS (
      SELECT 1 FROM pg_catalog.pg_enum e
        JOIN pg_catalog.pg_type t ON t.oid = e.enumtypid
        JOIN pg_catalog.pg_namespace ns ON ns.oid = t.typnamespace
       WHERE ns.nspname = 'public' AND t.typname = 'dimension_code'
         AND e.enumlabel = v_dimension
    ) THEN
      RAISE EXCEPTION USING ERRCODE = 'BC306',
        MESSAGE = 'report_store_source_map: unknown dimension_code';
    END IF;

    -- Caught here rather than left to the unique index, so the caller gets
    -- an authored code instead of a constraint violation.
    v_pair := v_section || '|' || v_dimension;
    IF v_pair = ANY (v_seen) THEN
      RAISE EXCEPTION USING ERRCODE = 'BC307',
        MESSAGE = 'report_store_source_map: duplicate output_section and dimension_code within entries';
    END IF;
    v_seen := v_seen || v_pair;

    INSERT INTO public.report_source_map (report_version_id, output_section, source_dimension_code)
    VALUES (p_report_version_id, v_section, v_dimension::public.dimension_code);
    v_n := v_n + 1;
  END LOOP;

  entries_written := v_n;
END;
$fn$;

COMMENT ON FUNCTION public.report_store_source_map(uuid, jsonb) IS
'The ONLY write path to report_source_map. OWNER-ONLY with ZERO client EXECUTE, exactly like report_store_draft, and reached only through the same trusted generation-completion channel -- which runs both calls in ONE DO block in ONE psql session, so a version and its trace commit together or not at all and a source-map failure rolls the draft store back with it. Write-once per version (BC302), so a frozen version can never acquire a second divergent trace. Every entry is validated structurally (BC303/BC304), against the four OD-4 panels (BC305), against the LIVE dimension_code enum rather than a transcribed list (BC306), and for internal duplication (BC307) so the caller gets an authored code rather than a constraint violation. It emits NO audit event: the trace is a child of a version whose report_version.created event is already appended in the same transaction, and a second event would violate A-029''s one-event-per-action rule. The Step 7H registry stays at 16.';

REVOKE ALL ON FUNCTION public.report_store_source_map(uuid, jsonb)
  FROM PUBLIC, anon, authenticated, authenticator, service_role;

-- =====================================================================
-- report_get_source_map -- TRAINER-ONLY read of the current cycle version
-- =====================================================================
-- Returns ZERO ROWS for management, for a parent, for an unauthenticated
-- caller, for a trainer without live session reach, for a wrong-centre
-- trainer, and for a report that does not exist -- one indistinguishable
-- answer, no authored error, nothing to discriminate on.
CREATE FUNCTION public.report_get_source_map(p_report_id uuid)
RETURNS TABLE (
  report_version_id     uuid,
  output_section        text,
  source_dimension_code public.dimension_code
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_centre_id     uuid;
  v_session_id    uuid;
  v_version_id    uuid;
BEGIN
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN
    RETURN;
  END IF;

  SELECT r.centre_id, r.class_session_id, r.current_cycle_version_id
    INTO v_centre_id, v_session_id, v_version_id
    FROM public.reports r
   WHERE r.id = p_report_id;
  IF v_centre_id IS NULL OR v_version_id IS NULL THEN
    RETURN;
  END IF;

  -- THE SINGLE active trainer membership in the REPORT'S OWN centre
  -- (R-28), plus live reach re-derived on this call. Management and parent
  -- resolve nothing here and fall through to zero rows.
  SELECT (pg_catalog.array_agg(m.id))[1]
    INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id
     AND m.centre_id  = v_centre_id
     AND m.role       = 'trainer'
     AND m.status     = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL OR NOT public.app_trainer_reaches_session(v_session_id) THEN
    RETURN;
  END IF;

  RETURN QUERY
    SELECT m.report_version_id, m.output_section, m.source_dimension_code
      FROM public.report_source_map m
     WHERE m.report_version_id = v_version_id
     ORDER BY m.output_section, m.source_dimension_code;
END;
$fn$;

COMMENT ON FUNCTION public.report_get_source_map(uuid) IS
'The trainer''s Compare-with-Notes source trace for a report''s CURRENT CYCLE version. TRAINER-ONLY: the actor is THE SINGLE active trainer membership of the caller''s account in the REPORT''S OWN centre and live session reach is re-derived per call, so management (A-038 bars raw per-dimension assessment data) and parent (Q-27 makes the rating boundary a DATA boundary at the projection layer) are closed by that same predicate rather than by a deny branch. Every denial -- wrong role, no reach, wrong centre, unauthenticated, absent report, no current version -- returns the SAME ZERO ROWS with no authored error, so nothing discriminates between them. It creates no new disclosure surface: it relates two things the assigned trainer may already read.';

REVOKE ALL ON FUNCTION public.report_get_source_map(uuid)
  FROM PUBLIC, anon, authenticated, authenticator, service_role;
GRANT EXECUTE ON FUNCTION public.report_get_source_map(uuid) TO authenticated;

-- ---------------------------------------------------------------------
-- Post-apply assertions.
-- ---------------------------------------------------------------------
DO $post$
DECLARE
  v_n     bigint;
  v_write oid;
  v_read  oid;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
      JOIN pg_catalog.pg_namespace ns ON ns.oid = c.relnamespace
     WHERE ns.nspname = 'public' AND c.relname = 'report_source_map' AND c.relkind = 'r'
  ) THEN
    RAISE EXCEPTION 'source-map assertion S1 failed: the table was not created.';
  END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace ns ON ns.oid = c.relnamespace
   WHERE ns.nspname = 'public' AND c.relkind = 'r';
  IF v_n <> 27 THEN
    RAISE EXCEPTION 'source-map assertion S2 failed: public holds % table(s); expected exactly 27 (26 + this one).', v_n;
  END IF;

  SELECT p.oid INTO v_write FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = 'report_store_source_map';
  SELECT p.oid INTO v_read FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = 'report_get_source_map';
  IF v_write IS NULL OR v_read IS NULL THEN
    RAISE EXCEPTION 'source-map assertion S3 failed: one or both functions were not created.';
  END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public';
  IF v_n <> 39 THEN
    RAISE EXCEPTION 'source-map assertion S4 failed: public holds % function(s); expected exactly 39 (37 + these two).', v_n;
  END IF;

  -- R-27's posture, extended to the new writer: OWNER-ONLY, no exceptions.
  IF pg_catalog.has_function_privilege('authenticated', v_write, 'EXECUTE')
     OR pg_catalog.has_function_privilege('anon', v_write, 'EXECUTE')
     OR pg_catalog.has_function_privilege('service_role', v_write, 'EXECUTE')
     OR pg_catalog.has_function_privilege('authenticator', v_write, 'EXECUTE') THEN
    RAISE EXCEPTION 'source-map assertion S5 failed: report_store_source_map is reachable by a client role.';
  END IF;
  -- PUBLIC is a pseudo-role, not a pg_roles entry, so has_function_privilege
  -- cannot be asked about it. Its absence is checked directly in the ACL.
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p, LATERAL pg_catalog.aclexplode(p.proacl) AS a
     WHERE p.oid = v_write AND a.grantee = 0
  ) THEN
    RAISE EXCEPTION 'source-map assertion S5b failed: report_store_source_map carries a PUBLIC grant.';
  END IF;

  -- The read is client-callable, and only by `authenticated`.
  IF NOT pg_catalog.has_function_privilege('authenticated', v_read, 'EXECUTE') THEN
    RAISE EXCEPTION 'source-map assertion S6 failed: authenticated cannot execute report_get_source_map.';
  END IF;
  IF pg_catalog.has_function_privilege('anon', v_read, 'EXECUTE')
     OR pg_catalog.has_function_privilege('service_role', v_read, 'EXECUTE') THEN
    RAISE EXCEPTION 'source-map assertion S7 failed: anon or service_role can execute report_get_source_map.';
  END IF;

  -- The CHECK's four literals must be exactly the four OD-4 panel columns.
  -- Derived from the live catalogue on BOTH sides, so neither can drift
  -- without this firing.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_attribute a
   WHERE a.attrelid = 'public.report_versions'::pg_catalog.regclass
     AND NOT a.attisdropped
     AND a.attname IN ('overview', 'strengths', 'areas_for_development', 'remarks')
     AND (SELECT pg_catalog.pg_get_constraintdef(c.oid)
            FROM pg_catalog.pg_constraint c
           WHERE c.conrelid = 'public.report_source_map'::pg_catalog.regclass
             AND c.conname  = 'report_source_map_output_section_chk')
         LIKE '%''' || a.attname || '''%';
  IF v_n <> 4 THEN
    RAISE EXCEPTION
      'source-map assertion S8 failed: only % of the 4 OD-4 panel column names appear in the output_section CHECK.', v_n;
  END IF;

  -- RLS on, zero policies, and no client privilege of any kind.
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
      JOIN pg_catalog.pg_namespace ns ON ns.oid = c.relnamespace
     WHERE ns.nspname = 'public' AND c.relname = 'report_source_map' AND c.relrowsecurity
  ) THEN
    RAISE EXCEPTION 'source-map assertion S9 failed: RLS is not enabled on report_source_map.';
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_policy WHERE polrelid = 'public.report_source_map'::pg_catalog.regclass;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'source-map assertion S10 failed: % policy(ies) exist on report_source_map; expected zero.', v_n;
  END IF;
  IF pg_catalog.has_table_privilege('authenticated', 'public.report_source_map', 'SELECT')
     OR pg_catalog.has_table_privilege('authenticated', 'public.report_source_map', 'INSERT')
     OR pg_catalog.has_table_privilege('authenticated', 'public.report_source_map', 'UPDATE')
     OR pg_catalog.has_table_privilege('authenticated', 'public.report_source_map', 'DELETE')
     OR pg_catalog.has_table_privilege('anon', 'public.report_source_map', 'SELECT')
     OR pg_catalog.has_table_privilege('service_role', 'public.report_source_map', 'SELECT') THEN
    RAISE EXCEPTION 'source-map assertion S11 failed: a client role holds privilege on report_source_map.';
  END IF;

  -- NO ENUM was created by this migration: the enum census is unchanged.
  SELECT pg_catalog.count(DISTINCT t.typname) INTO v_n
    FROM pg_catalog.pg_type t
    JOIN pg_catalog.pg_namespace ns ON ns.oid = t.typnamespace
   WHERE ns.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN
    RAISE EXCEPTION 'source-map assertion S12 failed: public holds % enum(s); expected the ratified 12 -- this migration must create none.', v_n;
  END IF;

  -- report_store_draft is BYTE-UNTOUCHED: same signature, still zero
  -- client EXECUTE (R-27).
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
     WHERE ns.nspname = 'public' AND p.proname = 'report_store_draft'
       -- oidvectortypes(proargtypes) yields ONLY the IN-argument types.
       -- MEASURED CHOICE: on this cluster
       -- pg_get_function_identity_arguments ALSO returns the five OUT
       -- parameters (and the parameter names), so comparing against a
       -- seven-type string through it fails on a correct database. This was
       -- found by measurement, not assumed.
       AND pg_catalog.oidvectortypes(p.proargtypes)
           = 'uuid, integer, integer, text, text, text, text'
       AND NOT pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE')
       AND NOT pg_catalog.has_function_privilege('service_role', p.oid, 'EXECUTE')
  ) THEN
    RAISE EXCEPTION 'source-map assertion S13 failed: report_store_draft''s signature or its zero client EXECUTE changed.';
  END IF;

  -- The audit registry stays at 16 distinct actions (see the attendance
  -- migration's A7 for why DISTINCT is the correct count here).
  SELECT pg_catalog.count(DISTINCT m[1]) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace,
    LATERAL pg_catalog.regexp_matches(p.prosrc, '''[a-z_]+\.[a-z_]+''', 'g') AS m
   WHERE ns.nspname = 'public' AND p.proname = 'audit_append_event';
  IF v_n <> 16 THEN
    RAISE EXCEPTION 'source-map assertion S14 failed: the registry now reads % distinct action string(s); it must remain 16.', v_n;
  END IF;

  -- Neither function emits an audit event.
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
     WHERE p.oid IN (v_write, v_read) AND p.prosrc LIKE '%audit_append_event%'
  ) THEN
    RAISE EXCEPTION 'source-map assertion S15 failed: a source-map function appends an audit event.';
  END IF;

  RAISE NOTICE 'report_source_map: S1-S15 asserted. 1 table, 2 functions, 0 enums, 0 policies, 0 client table privileges, report_store_draft untouched, registry still 16.';
END;
$post$;
