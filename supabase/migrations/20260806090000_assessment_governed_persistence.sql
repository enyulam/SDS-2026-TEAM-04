-- =====================================================================
-- B.E.S.T Coach -- Governed assessment persistence (CP-2 / CP-4)
-- =====================================================================
-- Governing authority (highest first):
--   Specification v3 -> Amendment 001 -> Amendment 002 -> Amendment 003
--   -> Amendment 004 -> CLAUDE.md -> Implementation Plan
--   -> docs/plan/STEP_7H_AUDIT_CHAIN_BASELINE.md
--   -> docs/plan/STEP_7I_REPORT_LIFECYCLE_BASELINE.md
--   -> docs/plan/PHYSICAL_TEST_SLICE_48H.md
--   -> docs/plan/PHYSICAL_TEST_ASSESSMENT_WRITE_BASELINE.md (ASM-1, ASM-2)
--
-- WHAT THIS MIGRATION CREATES -- exactly what the baseline section 6.1
-- authorizes, and nothing else:
--   * 2 functions .... public.assessment_save_observation      (ASM-1)
--                      public.assessment_get_trainer_observation (ASM-2)
--   * 2 COMMENT ON FUNCTION statements
--   * 2 REVOKE lines and 2 GRANT lines
--   * its authored post-apply assertions
--
-- WHAT IT DELIBERATELY DOES NOT CREATE (baseline section 6.1, verbatim):
--   no ALTER TYPE, no CREATE TABLE, no CREATE POLICY, no table GRANT, no
--   ALTER DEFAULT PRIVILEGES, no ownership change, no trigger, no view, no
--   extension, no schema, and NO `CREATE OR REPLACE` of any existing
--   function -- in particular neither Step 7H audit function is touched, so
--   Step 7H assertion B20 and Step 7I test T7I-30 both continue to hold.
--
-- THE AUDIT BOUNDARY IS AN OPERATOR RULING, NOT AN OMISSION (baseline
-- section 1.2, option (c), and 48-hour contract section 10.1).
-- `assessment_save_observation` emits NO Step 7H audit event, and
-- `assessment_get_trainer_observation` -- being STABLE -- structurally
-- cannot. The committed registry is a CLOSED 16-action CONSTANT text[]
-- duplicated byte-identically inside two applied SECURITY DEFINER
-- functions, and none of its sixteen actions denotes standalone observation
-- persistence. Step 7H section 1.4 already dissolved event E9
-- ("Observation-to-report derivation") into the E2/E3 report payloads for
-- data-minimization reasons, so observation facts were ALREADY ratified as
-- auditable through report events. Emitting a report action from here would
-- write a false, hash-covered claim into a chain that is append-only by
-- trigger and by zero privilege and that Step 7H forbids repairing "ever".
-- CLAUDE.md section 4 non-negotiable 2 is NOT engaged: it governs STATE
-- TRANSITIONS, and Step 7I section 3.2 states directly that an observation
-- save "is not a report transition at all".
--
-- Truthful audit begins in `requestDraft`, which performs T0/T1/T2 through
-- the Step 7I RPCs that actually mutate the report.
--
-- WHY RLS DOES NO WORK INSIDE THESE FUNCTIONS -- the accurate mechanism, as
-- stated in Step 7I. It is NOT that SECURITY DEFINER bypasses RLS. These
-- functions execute as `postgres`, which OWNS `observations`,
-- `observation_ratings` and `assessment_dimensions`, and no table carries
-- FORCE ROW LEVEL SECURITY. A table owner bypasses RLS unless RLS is forced.
-- Because RLS is inert here, EVERY authorization check below is explicit and
-- fail-closed.
--
-- AUTHORED ERROR CATALOGUE. SQLSTATE class 'BC' is outside every class the
-- SQL standard defines, and the codes below are DISJOINT from Step 7I's
-- BC001 .. BC025 so an assessment failure can never be mistaken for a
-- lifecycle failure. Every message is minimal and non-disclosing: it never
-- interpolates row content, a name, a rating value, a credential or an
-- environment value.
--   BC101  not found / not permitted   -- byte-identical whether the
--                                         session, the student or the pair
--                                         exists, or the caller simply has
--                                         no authority (baseline 4.3)
--   BC102  attendance not `present`    -- a MISSING ROW FAILS CLOSED
--   BC103  enrolment not active
--   BC104  scheduled session start not reached (Asia/Singapore)
--   BC105  p_ratings is not a JSON array
--   BC106  p_ratings does not hold exactly nine elements
--   BC107  a p_ratings element is not an object, or its key set is not
--          exactly {dimension_code, rating}, or a value is not a string
--   BC108  duplicate dimension_code within p_ratings
--   BC109  unknown dimension_code
--   BC110  invalid rating label
--   BC111  mixed CAS nullability -- exactly one of the two expected values
--                                   was supplied
--   BC112  stale state -- the observation CAS matched zero rows
--   BC113  duplicate -- a concurrent create lost the
--                       observations_session_student_key race; the violated
--                       constraint name is preserved in the CONSTRAINT
--                       diagnostic
--   BC114  post-condition failure -- the committed rating set is not
--                                    exactly nine (a DATA-INTEGRITY
--                                    incident; rolls the transaction back)
-- =====================================================================

-- ---------------------------------------------------------------------
-- P-1 execution-role guard (fail closed, before any change)
-- ---------------------------------------------------------------------
DO $guard$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION
      'Assessment migration aborted before any change: this migration must run as postgres, not "%". '
      'Objects created by supabase_admin in schema public would inherit its default ACL '
      '(ALL to anon/authenticated/service_role) -- the exact hazard P-1 exists to prevent.',
      current_user;
  END IF;
END;
$guard$;

-- ---------------------------------------------------------------------
-- Precondition: the objects this migration binds to must already exist and
-- must still hold the posture the baseline was written against. Abort
-- before any change rather than create a function over a schema that has
-- drifted.
-- ---------------------------------------------------------------------
DO $precondition$
DECLARE
  v_n bigint;
BEGIN
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public';
  IF v_n <> 28 THEN
    RAISE EXCEPTION
      'Assessment migration aborted before any change: public holds % function(s); expected the accepted Step 7I census of 28.', v_n;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM public.assessment_dimensions;
  IF v_n <> 9 THEN
    RAISE EXCEPTION
      'Assessment migration aborted before any change: public.assessment_dimensions holds % row(s); expected the nine seeded governed dimensions.', v_n;
  END IF;

  -- The "exactly nine, all resolvable" gate in ASM-1 derives its force from
  -- assessment_dimensions holding exactly the nine governed codes. Prove the
  -- set, not just the count.
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.assessment_dimensions d
   WHERE d.code::text = ANY (ARRAY[
     'body', 'emotion', 'speech', 'tonality', 'eye_contact',
     'vocal_projection', 'emotional_expression', 'sentence_flow',
     'audience_awareness']);
  IF v_n <> 9 THEN
    RAISE EXCEPTION
      'Assessment migration aborted before any change: assessment_dimensions does not hold exactly the nine governed dimension codes.';
  END IF;
END;
$precondition$;

-- =====================================================================
-- ASM-1 -- public.assessment_save_observation
-- =====================================================================
-- Governed create-or-CAS-update of ONE `observations` row plus its complete
-- nine-row `observation_ratings` set, atomically.
--
-- THE ALLOW-LIST IS THE SIGNATURE, NOT A RUNTIME FILTER (the Step 7I
-- section 6.2 discipline). There is NO parameter for centre_id,
-- class_module_id, enrolment_id, trainer_membership_id, trainer_role,
-- lock_version-as-a-value-to-write, created_at, updated_at, a dimension
-- group, a dimension label, a dimension sort order, a report id, a report
-- status, a version, a checklist field, an approval field, an attendance
-- value, an evidence object or a correction request. None of those can be
-- supplied because no parameter exists to supply them -- they are
-- UNREPRESENTABLE, not rejected at runtime.
--
-- WHY p_ratings IS ONE jsonb ARRAY (baseline 3.3). Two parallel typed arrays
-- were considered and rejected: a length mismatch between them is a real
-- failure mode with no structural defence, and an out-of-vocabulary label
-- would fail at BIND time with an unauthored invalid_text_representation
-- rather than an authored error. A single jsonb array makes arity structural
-- and lets every validation raise a NAMED AUTHORED error inside the
-- function. This reuses, deliberately, the exact idiom already committed in
-- audit_append_event's p_related_targets handling.
--
-- NOT `STRICT`: NULL is a legal, meaningful value for the three nullable
-- note columns and for the two create-mode CAS parameters.
CREATE FUNCTION public.assessment_save_observation(
  p_class_session_id        uuid,
  p_student_id              uuid,
  p_expected_observation_id uuid,
  p_expected_lock_version   integer,
  p_strength_chips          text[],
  p_focus_chips             text[],
  p_observation_notes       text,
  p_follow_up_notes         text,
  p_term_evidence_notes     text,
  p_ratings                 jsonb,
  OUT observation_id        uuid,
  OUT lock_version          integer,
  OUT dimension_count       smallint,
  OUT is_complete           boolean,
  OUT was_created           boolean
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
  v_obs_id        uuid;
  v_lock          integer;
  v_created       boolean;
  v_constraint    text;
  v_elem          jsonb;
  v_codes         text[] := ARRAY[]::text[];
  v_ratings       text[] := ARRAY[]::text[];
  v_keys          text[];
  v_n             bigint;
  v_i             integer;
BEGIN
  -- 1. SESSION IDENTITY. No parameter, claim or header substitutes for it.
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC101', MESSAGE = 'assessment: not found or not permitted';
  END IF;

  -- 2. CALLER ACCOUNT -- the app_current_account_id() discipline. Zero AND
  --    two-or-more both yield the same authored outcome: ambiguous identity
  --    is treated as no identity, never as an arbitrary pick.
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC101', MESSAGE = 'assessment: not found or not permitted';
  END IF;

  -- 3. SESSION RESOLUTION. centre_id and class_module_id are DERIVED, never
  --    parameters.
  SELECT cs.centre_id, cs.class_module_id
    INTO v_centre_id, v_module_id
    FROM public.class_sessions cs
   WHERE cs.id = p_class_session_id;
  IF v_centre_id IS NULL THEN
    -- Byte-identical to every other denial: a caller must never be able to
    -- distinguish "no such session" from "not your session".
    RAISE EXCEPTION USING ERRCODE = 'BC101', MESSAGE = 'assessment: not found or not permitted';
  END IF;

  -- 4. LIVE TRAINER/SESSION AUTHORIZATION. This single step denies
  --    management, parents, unassigned trainers, unrelated trainers,
  --    deactivated memberships and deactivated accounts IDENTICALLY.
  --    app_trainer_reaches_session re-derives the active assignment joined
  --    to the caller's active trainer membership and active account.
  SELECT (pg_catalog.array_agg(m.id))[1]
    INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id
     AND m.centre_id  = v_centre_id
     AND m.role       = 'trainer'
     AND m.status     = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL OR NOT public.app_trainer_reaches_session(p_class_session_id) THEN
    RAISE EXCEPTION USING ERRCODE = 'BC101', MESSAGE = 'assessment: not found or not permitted';
  END IF;

  -- 5. SESSION-START GATE -- the ratified R-9 / B-7I-1 predicate, reused
  --    verbatim, including the U-7I-13 NULL-`starts_at` fallback (the
  --    beginning of the session date). The zone is a PINNED LITERAL and is
  --    never the caller's TimeZone GUC.
  SELECT ((cs.session_date + COALESCE(cs.starts_at, TIME '00:00')) AT TIME ZONE 'Asia/Singapore')
    INTO v_start
    FROM public.class_sessions cs
   WHERE cs.id = p_class_session_id;
  IF v_start IS NULL OR pg_catalog.now() < v_start THEN
    RAISE EXCEPTION USING ERRCODE = 'BC104', MESSAGE = 'assessment: the scheduled session start has not been reached';
  END IF;

  -- 6. ENROLMENT -- the ACTIVE row, resolved (never supplied). Only the
  --    active row is unique (enrolments_one_active_per_module_student_idx),
  --    so the filter is load-bearing, not cosmetic. The FK cannot express
  --    is_active, so this guard is the enforcement point.
  SELECT e.id INTO v_enrolment_id
    FROM public.enrolments e
   WHERE e.class_module_id = v_module_id
     AND e.student_id      = p_student_id
     AND e.is_active;
  IF v_enrolment_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC103', MESSAGE = 'assessment: no active enrolment for this student and module';
  END IF;

  -- 7. ATTENDANCE IS PRESENT -- a MISSING ROW FAILS CLOSED. Absence of
  --    evidence is not evidence of presence. This is the structural form of
  --    "absence must never create or expose a fabricated assessment".
  PERFORM 1 FROM public.attendance a
   WHERE a.class_session_id = p_class_session_id
     AND a.student_id       = p_student_id
     AND a.status           = 'present';
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC102', MESSAGE = 'assessment: the student is not recorded present for this session';
  END IF;

  -- 8. RATINGS VALIDATION -- FULL MODE, EXACTLY NINE (A-017). Each condition
  --    raises its OWN distinct named authored error, so a missing, duplicate,
  --    unknown and invalid case are never confused for one another.
  IF p_ratings IS NULL OR pg_catalog.jsonb_typeof(p_ratings) <> 'array' THEN
    RAISE EXCEPTION USING ERRCODE = 'BC105', MESSAGE = 'assessment: the ratings argument must be a JSON array';
  END IF;
  IF pg_catalog.jsonb_array_length(p_ratings) <> 9 THEN
    RAISE EXCEPTION USING ERRCODE = 'BC106', MESSAGE = 'assessment: exactly nine dimension ratings are required';
  END IF;

  FOR v_i IN 0 .. 8 LOOP
    v_elem := p_ratings -> v_i;
    IF pg_catalog.jsonb_typeof(v_elem) <> 'object' THEN
      RAISE EXCEPTION USING ERRCODE = 'BC107', MESSAGE = 'assessment: each rating entry must be an object';
    END IF;
    SELECT pg_catalog.array_agg(k ORDER BY k) INTO v_keys
      FROM pg_catalog.jsonb_object_keys(v_elem) AS k;
    IF v_keys IS DISTINCT FROM ARRAY['dimension_code', 'rating'] THEN
      RAISE EXCEPTION USING ERRCODE = 'BC107', MESSAGE = 'assessment: each rating entry must carry exactly a dimension code and a rating';
    END IF;
    IF pg_catalog.jsonb_typeof(v_elem -> 'dimension_code') <> 'string'
       OR pg_catalog.jsonb_typeof(v_elem -> 'rating') <> 'string' THEN
      RAISE EXCEPTION USING ERRCODE = 'BC107', MESSAGE = 'assessment: each rating entry must carry string values';
    END IF;
    v_codes   := v_codes   || (v_elem ->> 'dimension_code');
    v_ratings := v_ratings || (v_elem ->> 'rating');
  END LOOP;

  -- Distinctness, checked BEFORE resolution so a duplicate is reported as a
  -- duplicate rather than as a unique-violation or an unknown code.
  SELECT pg_catalog.count(DISTINCT c) INTO v_n
    FROM pg_catalog.unnest(v_codes) AS c;
  IF v_n <> 9 THEN
    RAISE EXCEPTION USING ERRCODE = 'BC108', MESSAGE = 'assessment: each governed dimension may be rated at most once';
  END IF;

  -- Every code must resolve to a seeded governed dimension. Because
  -- assessment_dimensions holds exactly nine rows, "nine distinct, all
  -- resolvable" FORCES the set to be exactly the nine governed dimensions --
  -- so no separate completeness check is needed or possible to bypass.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.unnest(v_codes) AS c
    JOIN public.assessment_dimensions d ON d.code::text = c;
  IF v_n <> 9 THEN
    RAISE EXCEPTION USING ERRCODE = 'BC109', MESSAGE = 'assessment: an unrecognised dimension was supplied';
  END IF;

  -- Every rating must be a label of public.competency_rating. Validated
  -- against the catalogue rather than by attempting a cast, so the failure is
  -- an AUTHORED error and never a raw enum-cast failure.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.unnest(v_ratings) AS r
   WHERE r = ANY (
     SELECT e.enumlabel::text
       FROM pg_catalog.pg_enum e
       JOIN pg_catalog.pg_type t  ON t.oid = e.enumtypid
       JOIN pg_catalog.pg_namespace ns ON ns.oid = t.typnamespace
      WHERE ns.nspname = 'public' AND t.typname = 'competency_rating'
   );
  IF v_n <> 9 THEN
    RAISE EXCEPTION USING ERRCODE = 'BC110', MESSAGE = 'assessment: an unrecognised rating value was supplied';
  END IF;

  -- 9. MODE DISCRIMINATION. Jointly NULL (create) or jointly NOT NULL
  --    (update). A mixed pair is the fail-closed shape Step 7H uses for its
  --    actor triple, applied here so an UPDATE CAN NEVER SILENTLY DEGRADE
  --    INTO A CREATE.
  IF (p_expected_observation_id IS NULL) <> (p_expected_lock_version IS NULL) THEN
    RAISE EXCEPTION USING ERRCODE = 'BC111',
      MESSAGE = 'assessment: the expected observation and lock version must be supplied together or not at all';
  END IF;

  IF p_expected_observation_id IS NULL THEN
    -- 10. CREATE PATH. trainer_role, lock_version, created_at and updated_at
    --     are left at their DEFAULTs, so a created row is at lock_version 1.
    BEGIN
      INSERT INTO public.observations (
        centre_id, class_session_id, class_module_id, student_id,
        enrolment_id, trainer_membership_id,
        strength_chips, focus_chips,
        observation_notes, follow_up_notes, term_evidence_notes
      ) VALUES (
        v_centre_id, p_class_session_id, v_module_id, p_student_id,
        v_enrolment_id, v_membership_id,
        COALESCE(p_strength_chips, ARRAY[]::text[]),
        COALESCE(p_focus_chips,    ARRAY[]::text[]),
        p_observation_notes, p_follow_up_notes, p_term_evidence_notes
      )
      RETURNING public.observations.id, public.observations.lock_version
        INTO v_obs_id, v_lock;
    EXCEPTION WHEN unique_violation THEN
      -- The authored duplicate error PRESERVES the violated constraint name
      -- in the CONSTRAINT diagnostic, so the caller gets a minimal
      -- non-disclosing message while the acceptance suite can still assert
      -- exactly which invariant fired (T-ASM-26).
      GET STACKED DIAGNOSTICS v_constraint = CONSTRAINT_NAME;
      RAISE EXCEPTION USING ERRCODE = 'BC113',
        MESSAGE = 'assessment: an observation already exists for this session and student',
        CONSTRAINT = v_constraint;
    END;
    v_created := true;
  ELSE
    -- 11. UPDATE PATH. ONE statement, so there is exactly one lock-version
    --     increment per successful update -- never a read-then-write, never
    --     two increments, never an increment on a failed guard.
    --
    --     Pinning id AND session AND student against
    --     observations_id_session_student_key means an observation id
    --     belonging to another (session, student) pair CANNOT BE BORROWED,
    --     even by a caller authorized on some other session (T-ASM-23).
    UPDATE public.observations o
       SET strength_chips      = COALESCE(p_strength_chips, ARRAY[]::text[]),
           focus_chips         = COALESCE(p_focus_chips,    ARRAY[]::text[]),
           observation_notes   = p_observation_notes,
           follow_up_notes     = p_follow_up_notes,
           term_evidence_notes = p_term_evidence_notes,
           lock_version        = o.lock_version + 1,
           updated_at          = pg_catalog.now()
     WHERE o.id               = p_expected_observation_id
       AND o.class_session_id = p_class_session_id
       AND o.student_id       = p_student_id
       AND o.lock_version     = p_expected_lock_version
    RETURNING o.id, o.lock_version INTO v_obs_id, v_lock;

    -- 0 rows matched => authored stale-state error, NOTHING WRITTEN.
    IF v_obs_id IS NULL THEN
      RAISE EXCEPTION USING ERRCODE = 'BC112',
        MESSAGE = 'assessment: this observation changed while you were working; re-read and retry';
    END IF;
    v_created := false;
  END IF;

  -- 12. RATING PERSISTENCE -- SAME TRANSACTION. Because the table admits
  --     only the nine enum codes and is unique per
  --     (observation_id, dimension_code), upserting nine ALWAYS yields
  --     exactly nine: no stale tenth row is representable, and no DELETE is
  --     required.
  INSERT INTO public.observation_ratings (observation_id, dimension_code, rating)
  SELECT v_obs_id, x.code::public.dimension_code, x.rating::public.competency_rating
    FROM (
      SELECT (e ->> 'dimension_code') AS code, (e ->> 'rating') AS rating
        FROM pg_catalog.jsonb_array_elements(p_ratings) AS e
    ) x
  ON CONFLICT ON CONSTRAINT observation_ratings_observation_dimension_key
  DO UPDATE SET rating     = EXCLUDED.rating,
                updated_at = pg_catalog.now();

  -- 13. POST-CONDITION. A cheap structural proof that no partial rating set
  --     can ever commit. A failure rolls the whole transaction back.
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.observation_ratings r
   WHERE r.observation_id = v_obs_id;
  IF v_n <> 9 THEN
    RAISE EXCEPTION USING ERRCODE = 'BC114',
      MESSAGE = 'assessment: the saved assessment is not complete and has been discarded';
  END IF;

  -- 14. NO AUDIT APPEND, and NO REPORT READ OR WRITE OF ANY KIND. This
  --     function body contains no statement referencing public.reports or
  --     any report child table (T-ASM-32).

  observation_id  := v_obs_id;
  lock_version    := v_lock;
  dimension_count := 9::smallint;
  is_complete     := true;
  was_created     := v_created;
END;
$fn$;

COMMENT ON FUNCTION public.assessment_save_observation(uuid, uuid, uuid, integer, text[], text[], text, text, text, jsonb) IS
  'ASM-1: governed create-or-CAS-update of one observation plus its complete nine-row rating set, atomically. Live trainer/session authorization, active enrolment, attendance present (a missing row fails closed) and the pinned Asia/Singapore session-start gate. Exactly nine unique governed ratings; every validation is a distinct authored error. centre, module, enrolment and trainer membership are DERIVED, never parameters. Creates no report and performs no report transition. Emits NO audit event -- an operator ruling, not an omission (see the migration header).';

-- =====================================================================
-- ASM-2 -- public.assessment_get_trainer_observation
-- =====================================================================
-- The assigned trainer's own working observation for one (session, student).
--
-- STABLE, not VOLATILE: it reads only, and PostgreSQL itself rejects any
-- mutation attempt in a non-volatile function -- so "this read cannot write"
-- is enforced by the engine rather than by review.
--
-- This RPC is what closes CP-4 / U-7I-11 / U-30: the trainer can load their
-- EXISTING follow_up_notes into the Review & Approve "Coach Notes (Internal
-- Only)" field instead of seeing it blank and overwriting it unknowingly
-- (CLAUDE.md section 6 -- ONE column, TWO screens), and can load the current
-- nine ratings to correct one after a management return.
--
-- IT DELIBERATELY EXPOSES NO CORRECTION METADATA. The correction request's
-- issue_scope, affected dimension_code, status and reason are
-- management-authored and reach the trainer through report_get_working
-- (RPC-14), which already owns them. Splitting it this way means the
-- assessment read path carries NO management-only correction metadata at
-- all, and the two surfaces cannot drift into stating the same fact two
-- different ways.
CREATE FUNCTION public.assessment_get_trainer_observation(
  p_class_session_id uuid,
  p_student_id       uuid
)
RETURNS TABLE (
  observation_exists  boolean,
  observation_id      uuid,
  lock_version        integer,
  strength_chips      text[],
  focus_chips         text[],
  observation_notes   text,
  follow_up_notes     text,
  term_evidence_notes text,
  ratings             jsonb,
  dimension_count     smallint,
  is_complete         boolean
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
  v_module_id     uuid;
  v_obs           public.observations%ROWTYPE;
  v_ratings       jsonb;
  v_n             bigint;
BEGIN
  -- Identity and authorization: the SAME live trainer/session relationship
  -- as ASM-1, resolved identically. Management is denied unconditionally --
  -- there is no management branch. Parents are denied unconditionally: a
  -- linked parent passes every RELATIONSHIP check, so only the role
  -- predicate stands between them and the caught rating-grid leak, and this
  -- RPC returns the rating grid itself.
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC101', MESSAGE = 'assessment: not found or not permitted';
  END IF;

  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC101', MESSAGE = 'assessment: not found or not permitted';
  END IF;

  SELECT cs.centre_id, cs.class_module_id
    INTO v_centre_id, v_module_id
    FROM public.class_sessions cs
   WHERE cs.id = p_class_session_id;
  IF v_centre_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'BC101', MESSAGE = 'assessment: not found or not permitted';
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
    RAISE EXCEPTION USING ERRCODE = 'BC101', MESSAGE = 'assessment: not found or not permitted';
  END IF;

  -- The student must be reachable through an enrolment in THIS session's
  -- module. Scoping is to this session and this student only. `is_active` is
  -- deliberately NOT required here: a withdrawn student's already-captured
  -- work must remain readable to the trainer who captured it (mid-cycle
  -- withdrawal "retains existing work but blocks progression" -- the block
  -- lives on the WRITE path, ASM-1 step 6, and on every [fwd] transition).
  PERFORM 1 FROM public.enrolments e
   WHERE e.class_module_id = v_module_id
     AND e.student_id      = p_student_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'BC101', MESSAGE = 'assessment: not found or not permitted';
  END IF;

  SELECT o.* INTO v_obs
    FROM public.observations o
   WHERE o.class_session_id = p_class_session_id
     AND o.student_id       = p_student_id;

  IF v_obs.id IS NULL THEN
    -- SAFE EMPTY / NOT-CREATED SHAPE: one row, never zero rows, never an
    -- error. "You may assess this student and have not started" is a
    -- legitimate state, not a failure.
    observation_exists  := false;
    observation_id      := NULL;
    lock_version        := NULL;
    strength_chips      := ARRAY[]::text[];
    focus_chips         := ARRAY[]::text[];
    observation_notes   := NULL;
    follow_up_notes     := NULL;
    term_evidence_notes := NULL;
    ratings             := '[]'::jsonb;
    dimension_count     := 0::smallint;
    is_complete         := false;
    RETURN NEXT;
    RETURN;
  END IF;

  -- RATING ORDER IS PINNED TO THE HARD-CODED nine-element dimension_code
  -- declaration order -- deliberately NOT to assessment_dimensions.sort_order,
  -- an ordinary mutable column protected by no trigger. This is the identical
  -- discipline Step 7I applies to its content serializer, for the identical
  -- reason. display_name and group_code are EMBEDDED from
  -- assessment_dimensions rather than read client-side, which is what keeps
  -- U-7I-7 closed: that table needs no client grant.
  SELECT COALESCE(pg_catalog.jsonb_agg(
           pg_catalog.jsonb_build_object(
             'dimension_code', x.code,
             'display_name',   x.display_name,
             'group_code',     x.group_code,
             'rating',         x.rating
           ) ORDER BY x.ord
         ), '[]'::jsonb)
    INTO v_ratings
    FROM (
      SELECT r.dimension_code::text AS code,
             d.display_name         AS display_name,
             d.group_code::text     AS group_code,
             r.rating::text         AS rating,
             pg_catalog.array_position(
               ARRAY['body', 'emotion', 'speech', 'tonality', 'eye_contact',
                     'vocal_projection', 'emotional_expression', 'sentence_flow',
                     'audience_awareness']::text[],
               r.dimension_code::text) AS ord
        FROM public.observation_ratings r
        JOIN public.assessment_dimensions d ON d.code = r.dimension_code
       WHERE r.observation_id = v_obs.id
    ) x;

  SELECT pg_catalog.count(*) INTO v_n
    FROM public.observation_ratings r
   WHERE r.observation_id = v_obs.id;

  observation_exists  := true;
  observation_id      := v_obs.id;
  lock_version        := v_obs.lock_version;
  strength_chips      := v_obs.strength_chips;
  focus_chips         := v_obs.focus_chips;
  observation_notes   := v_obs.observation_notes;
  follow_up_notes     := v_obs.follow_up_notes;
  term_evidence_notes := v_obs.term_evidence_notes;
  ratings             := v_ratings;
  dimension_count     := v_n::smallint;
  is_complete         := (v_n = 9);
  RETURN NEXT;
END;
$fn$;

COMMENT ON FUNCTION public.assessment_get_trainer_observation(uuid, uuid) IS
  'ASM-2: the assigned trainer''s own working observation for one (session, student). STABLE, so it structurally cannot write or append. Same live trainer/session authorization as ASM-1; management, parents, unrelated trainers and unauthenticated callers are denied with ONE non-disclosing authored outcome. Returns the five trainer content fields and the nine ratings with labels embedded from assessment_dimensions, ordered by the hard-coded dimension_code declaration order (never sort_order). Safe empty shape where no observation exists: one row, never an error. Returns no report, version, status, hash, checklist, approval, correction or audit data.';

-- ---------------------------------------------------------------------
-- EXECUTE posture -- the committed Step 7G block form, signature-qualified,
-- one line per function. Never an aggregate or unqualified statement, which
-- would be ambiguous under any future overload.
-- ---------------------------------------------------------------------
-- NOTHING IS GRANTED TO service_role, EVER. It carries BYPASSRLS, so the
-- ONLY control that constrains it is the ABSENCE of a privilege.
--
-- `authenticated` EXECUTE is REQUIRED, not a convenience: the request-scoped
-- client carries the caller's own session and therefore the `authenticated`
-- database role, which is what makes auth.uid() resolve inside the function.
-- The database role follows the CREDENTIAL, not the code location (A-030) --
-- running on a server confers no privilege. It is SAFE because both
-- functions are written to be invoked directly by any authenticated caller
-- of any role, with no reliance on the UI, the route, a query parameter, a
-- role tab or a token claim: every authorization fact is re-derived live
-- from auth.uid() on every call. ROLE IS A PREDICATE INSIDE EACH FUNCTION,
-- NEVER A PROPERTY OF THE GRANT.
REVOKE ALL ON FUNCTION public.assessment_save_observation(uuid, uuid, uuid, integer, text[], text[], text, text, text, jsonb) FROM PUBLIC, anon, service_role, authenticator;
REVOKE ALL ON FUNCTION public.assessment_get_trainer_observation(uuid, uuid)                                                 FROM PUBLIC, anon, service_role, authenticator;

GRANT EXECUTE ON FUNCTION public.assessment_save_observation(uuid, uuid, uuid, integer, text[], text[], text, text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assessment_get_trainer_observation(uuid, uuid)                                                 TO authenticated;

-- ---------------------------------------------------------------------
-- End-of-migration posture assertions (7E/7G/7H/7I style)
-- ---------------------------------------------------------------------
-- These re-derive the FULL posture from the catalogue rather than trusting
-- that the statements above did what they say. Every count traces to section
-- 6.3 and 6.4 of the assessment baseline, which are the sole authorities.
DO $assert$
DECLARE
  v_new CONSTANT text[] := ARRAY[
    'assessment_save_observation', 'assessment_get_trainer_observation'
  ];
  v_7i_zero_exec CONSTANT text[] := ARRAY[
    'report_store_draft', 'report_content_hash_v1', 'report_wording_hash_v1',
    'app_parent_reaches_student'
  ];
  v_7h_zero_exec CONSTANT text[] := ARRAY[
    'audit_append_event', 'audit_verify_chain', 'audit_canonical_json',
    'audit_block_mutation'
  ];
  v_assessment_tables CONSTANT text[] := ARRAY[
    'observations', 'observation_ratings', 'assessment_dimensions'
  ];
  v_n    bigint;
  v_m    bigint;
  v_name text;
BEGIN
  -- C1: exactly 30 functions in public (28 + 2). No other function was
  --     created, and none was dropped or replaced.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public';
  IF v_n <> 30 THEN
    RAISE EXCEPTION 'Assessment assertion C1 failed: % function(s) in public; expected 30 (6 Step 7G + 4 Step 7H + 18 Step 7I + 2 assessment)', v_n;
  END IF;

  -- C2: the object inventory is UNCHANGED beyond the two functions --
  --     26 tables, 12 enums, 29 policies, RLS everywhere, FORCE nowhere.
  SELECT pg_catalog.count(*) FILTER (WHERE NOT c.relrowsecurity),
         pg_catalog.count(*) FILTER (WHERE c.relforcerowsecurity)
    INTO v_m, v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace ns ON ns.oid = c.relnamespace
   WHERE ns.nspname = 'public' AND c.relkind = 'r';
  IF v_m <> 0 OR v_n <> 0 THEN
    RAISE EXCEPTION 'Assessment assertion C2 failed: % table(s) without RLS, % table(s) with FORCE RLS; expected 0 and 0', v_m, v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace ns ON ns.oid = c.relnamespace
   WHERE ns.nspname = 'public' AND c.relkind = 'r';
  IF v_n <> 26 THEN
    RAISE EXCEPTION 'Assessment assertion C2 failed: % table(s) in public; expected 26 (unchanged)', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_type t
    JOIN pg_catalog.pg_namespace ns ON ns.oid = t.typnamespace
   WHERE ns.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN
    RAISE EXCEPTION 'Assessment assertion C2 failed: % enum type(s) in public; expected 12 (unchanged)', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_policies WHERE schemaname = 'public';
  IF v_n <> 29 THEN
    RAISE EXCEPTION 'Assessment assertion C2 failed: % policy/policies in public; expected 29 (unchanged)', v_n;
  END IF;

  -- C3: both new functions are postgres-owned plpgsql with a pinned empty
  --     search_path, SECURITY DEFINER, and NOT strict.
  FOREACH v_name IN ARRAY v_new LOOP
    SELECT pg_catalog.count(*) INTO v_n
      FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
      JOIN pg_catalog.pg_language l   ON l.oid = p.prolang
     WHERE ns.nspname = 'public'
       AND p.proname = v_name
       AND pg_catalog.pg_get_userbyid(p.proowner) = 'postgres'
       AND l.lanname = 'plpgsql'
       AND p.prosecdef
       AND NOT p.proisstrict
       AND p.proconfig IS NOT NULL
       AND p.proconfig::text LIKE '%search_path=%';
    IF v_n <> 1 THEN
      RAISE EXCEPTION 'Assessment assertion C3 failed: public.% is not exactly one postgres-owned, SECURITY DEFINER, non-STRICT plpgsql function with a pinned search_path (found %)', v_name, v_n;
    END IF;
  END LOOP;

  -- C4: volatility. ASM-1 VOLATILE, ASM-2 STABLE. ASM-2 being STABLE is what
  --     makes "this read cannot write or append" an engine guarantee.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = 'assessment_save_observation' AND p.provolatile = 'v';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Assessment assertion C4 failed: assessment_save_observation is not VOLATILE';
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = 'assessment_get_trainer_observation' AND p.provolatile = 's';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Assessment assertion C4 failed: assessment_get_trainer_observation is not STABLE';
  END IF;

  -- C5: EXECUTE census rises by exactly two, to 22.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 22 THEN
    RAISE EXCEPTION 'Assessment assertion C5 failed: % function(s) hold authenticated EXECUTE; expected 22 (6 Step 7G + 14 Step 7I + 2 assessment)', v_n;
  END IF;
  FOREACH v_name IN ARRAY v_new LOOP
    SELECT pg_catalog.count(*) INTO v_n
      FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
     WHERE ns.nspname = 'public' AND p.proname = v_name
       AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
    IF v_n <> 1 THEN
      RAISE EXCEPTION 'Assessment assertion C5 failed: public.% does not hold authenticated EXECUTE', v_name;
    END IF;
  END LOOP;

  -- C6: the two new functions hold ZERO EXECUTE for anon, service_role,
  --     authenticator and PUBLIC.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = ANY (v_new)
     AND (pg_catalog.has_function_privilege('anon',          p.oid, 'EXECUTE')
       OR pg_catalog.has_function_privilege('service_role',  p.oid, 'EXECUTE')
       OR pg_catalog.has_function_privilege('authenticator', p.oid, 'EXECUTE')
       OR p.proacl IS NULL
       OR EXISTS (SELECT 1 FROM pg_catalog.aclexplode(p.proacl) ae WHERE ae.grantee = 0));
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Assessment assertion C6 failed: % of the new function(s) are reachable by anon, service_role, authenticator or PUBLIC', v_n;
  END IF;

  -- C7: the Step 7I zero-EXECUTE four and the Step 7H four are UNCHANGED --
  --     this migration adds none to either exclusion list and removes none.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND p.proname = ANY (v_7i_zero_exec || v_7h_zero_exec)
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Assessment assertion C7 failed: % owner-only function(s) acquired authenticated EXECUTE', v_n;
  END IF;

  -- C8: ZERO table privileges and ZERO policies on the three assessment
  --     tables, for every client role. The RPCs are the only reach.
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.role_table_grants g
   WHERE g.table_schema = 'public'
     AND g.table_name = ANY (v_assessment_tables)
     AND g.grantee IN ('PUBLIC', 'anon', 'authenticated', 'service_role', 'authenticator');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Assessment assertion C8 failed: % client table privilege(s) exist on the assessment tables; expected 0', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_policies
   WHERE schemaname = 'public' AND tablename = ANY (v_assessment_tables);
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Assessment assertion C8 failed: % policy/policies exist on the assessment tables; expected 0', v_n;
  END IF;

  -- C9: the Step 7H 16-action registry is byte-identical in BOTH applied
  --     functions -- the Step 7H B20 equality this migration must not break.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc a
    JOIN pg_catalog.pg_namespace ns ON ns.oid = a.pronamespace
   WHERE ns.nspname = 'public' AND a.proname = 'audit_append_event'
     AND pg_catalog.substring(a.prosrc, 'v_registry CONSTANT text\[\] :=[^;]+;') =
         (SELECT pg_catalog.substring(b.prosrc, 'v_registry CONSTANT text\[\] :=[^;]+;')
            FROM pg_catalog.pg_proc b
            JOIN pg_catalog.pg_namespace ns2 ON ns2.oid = b.pronamespace
           WHERE ns2.nspname = 'public' AND b.proname = 'audit_verify_chain')
     AND pg_catalog.substring(a.prosrc, 'v_registry CONSTANT text\[\] :=[^;]+;') IS NOT NULL;
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Assessment assertion C9 failed: the Step 7H action registry is not byte-identical in audit_append_event and audit_verify_chain';
  END IF;

  -- C10: neither new function body references a report table or the audit
  --      append path. This is the static half of T-ASM-32, asserted from the
  --      catalogue so it holds against the APPLIED body, not just the file.
  --      `--` comments are stripped FIRST: both bodies discuss the rule in
  --      prose, and a prose mention is not a statement. This is the same
  --      comment-stripping discipline the Step 7I purity scan uses.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = ANY (v_new)
     AND pg_catalog.regexp_replace(p.prosrc, '--[^\n]*', '', 'g') ~
         '(public\.reports|public\.report_version|public\.report_correction_requests|audit_append_event|public\.audit_)';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Assessment assertion C10 failed: % assessment function(s) reference a report table or an audit object', v_n;
  END IF;

  -- C11: no dynamic SQL in either new function. Comments stripped for the
  --      same reason as C10.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = ANY (v_new)
     AND pg_catalog.regexp_replace(p.prosrc, '--[^\n]*', '', 'g') ~* '\mEXECUTE\s+(format|''|"|\$|v_|p_)';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Assessment assertion C11 failed: % assessment function(s) contain dynamic SQL', v_n;
  END IF;

  -- C12: no report row was created by applying this migration, and the audit
  --      chain is untouched.
  SELECT pg_catalog.count(*) INTO v_n FROM public.reports;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Assessment assertion C12 failed: public.reports holds % row(s) after applying this migration', v_n;
  END IF;

  RAISE NOTICE 'Assessment migration: all posture assertions passed (30 functions, 26 tables, 12 enums, 29 policies, 22 authenticated EXECUTE).';
END;
$assert$;
