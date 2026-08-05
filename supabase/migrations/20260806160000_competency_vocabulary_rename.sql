-- =====================================================================
-- B.E.S.T Coach -- Competency-rating vocabulary rename (V2 / B-V2-1)
-- =====================================================================
-- Governing authority (highest first):
--   Specification v3 -> Amendment 001 -> Amendment 002 -> Amendment 003
--   -> Amendment 004 -> Amendment 005
--   -> Amendment 006 (A-049 ... A-055)  <-- the governing instrument here
--   -> CLAUDE.md (S5, S6.1, S12) -> Implementation Plan
--   -> docs/plan/COMPETENCY_VOCABULARY_RECONCILIATION_PLAN.md (V2, S1.2)
--
-- WHAT THIS MIGRATION CONTAINS -- exactly, and nothing else (A-053):
--   * 1 fail-closed, in-transaction zero-row guard (DO block, RAISE EXCEPTION)
--   * 3 ALTER TYPE public.competency_rating RENAME VALUE statements
--   * 1 post-rename assertion re-deriving the enum from the catalogue
--
-- WHAT IT DELIBERATELY DOES NOT CONTAIN (A-053 "Explicitly not authorized"):
--   no new enum, no new enum LABEL, no CREATE/ALTER TABLE, no column, no
--   constraint, no index, no CREATE POLICY, no GRANT or REVOKE, no CREATE
--   or CREATE OR REPLACE of any function, no trigger, no view, no
--   extension, no schema, no seed row, no UPDATE of any row, no table
--   rewrite, no hash-envelope change, and NO change of any kind to
--   public.class_grade_code or any class-grade artefact (A-054).
--
--   Counts are therefore unchanged: a label rename alters no enum count,
--   table count, function count, policy count or seed-row count, so
--   A-031's inventory and A-040's counts stand exactly as written.
--
-- ---------------------------------------------------------------------
-- WHY RENAME AND NOT REPLACE
-- ---------------------------------------------------------------------
-- PostgreSQL cannot drop an enum label, so add-and-drop is unavailable.
-- RENAME VALUE leaves pg_enum.enumsortorder and every label OID untouched,
-- so stored rows need no UPDATE and no table rewrite, and the ordinal
-- semantics survive exactly. A create-new-type-and-swap strategy is NOT
-- authorized and is NOT required (A-053).
--
-- `developing` is NOT renamed -- it is unchanged in both value and ordinal
-- position, which is exactly why this is three statements and not four.
--
-- ---------------------------------------------------------------------
-- WHY THE ZERO-ROW GUARD IS LOAD-BEARING, AND WHY IT IS FAIL-CLOSED
-- ---------------------------------------------------------------------
-- Report-content hash v1 serializes each rating's LABEL TEXT with an
-- octet-length prefix, so renaming a label changes the hash of a logically
-- identical report -- 'secure' at 6 bytes becomes 'mastering' at 9. Any
-- pre-existing public.report_versions row would become permanently
-- unreproducible: a stored-content-hash anomaly on a FROZEN IMMUTABLE row
-- that can never be repaired. public.observation_ratings is included
-- because it is the other rating-bearing table and its contents feed the
-- hash inputs on the next version write; proving it empty keeps the guard
-- TOTAL rather than partial (A-053).
--
-- The guard is a PROOF EXECUTED AT MIGRATION TIME, never an assumption
-- inherited from documentation. It RAISES and ABORTS rather than renaming.
-- It must not be weakened, narrowed or amended, and rows must never be
-- deleted to make it pass -- both are expressly prohibited by the V2
-- checkpoint. If it fires, the correct response is to STOP and report.
--
-- TRANSACTION SCOPE. The guard and the three renames are one atomic unit.
-- This file is applied inside a single transaction by every authorized
-- path -- `supabase db reset` / `supabase migration up` wrap each
-- migration file in a transaction, and the fresh-apply harness
-- (scripts/tests/step-7i/verify-fresh-apply.mjs) wraps it in an explicit
-- BEGIN/COMMIT. This file therefore opens no transaction of its own, for
-- exactly the same reason every other migration in this tree does not:
-- a nested BEGIN would commit the outer transaction early and silently
-- decouple the guard from the renames it guards. Do not apply this file
-- through an autocommit path.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. The fail-closed, in-transaction zero-row precondition (A-053)
-- ---------------------------------------------------------------------
DO $guard$
DECLARE
  v_report_versions        bigint;
  v_report_version_ratings bigint;
  v_observation_ratings    bigint;
  v_missing                text;
BEGIN
  -- Pre-state assertion: the three labels this migration renames must be
  -- present under their PRE-rename names. This distinguishes "already
  -- applied" and "unexpected enum state" from "safe to rename", so the
  -- migration never renames a label it did not verify first.
  SELECT string_agg(w.label, ', ' ORDER BY w.label)
    INTO v_missing
    FROM (VALUES ('emerging'), ('secure'), ('advanced')) AS w(label)
   WHERE NOT EXISTS (
     SELECT 1
       FROM pg_enum e
       JOIN pg_type t ON t.oid = e.enumtypid
       JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
        AND t.typname = 'competency_rating'
        AND e.enumlabel = w.label);

  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION
      'Competency vocabulary rename ABORTED: public.competency_rating does not carry the expected pre-rename label(s): %. The enum is not in the state this migration was authored against; no label was renamed.',
      v_missing;
  END IF;

  SELECT count(*) INTO v_report_versions        FROM public.report_versions;
  SELECT count(*) INTO v_report_version_ratings FROM public.report_version_ratings;
  SELECT count(*) INTO v_observation_ratings    FROM public.observation_ratings;

  IF v_report_versions <> 0
     OR v_report_version_ratings <> 0
     OR v_observation_ratings <> 0 THEN
    RAISE EXCEPTION
      'Competency vocabulary rename ABORTED by its zero-row guard (Amendment 006 A-053): report_versions=%, report_version_ratings=%, observation_ratings=% -- all three must be 0. Renaming a competency_rating label while rating-bearing rows exist makes report-content hash v1 permanently unreproducible on frozen immutable rows. NO LABEL WAS RENAMED. Do not delete rows to satisfy this guard and do not weaken it: STOP and report.',
      v_report_versions, v_report_version_ratings, v_observation_ratings;
  END IF;

  RAISE NOTICE 'Zero-row precondition proved in-transaction: report_versions=0, report_version_ratings=0, observation_ratings=0.';
END;
$guard$;

-- ---------------------------------------------------------------------
-- 2. The exactly three authorized statements (Amendment 006 A-053)
--    `developing` is unchanged and is NOT renamed.
-- ---------------------------------------------------------------------
ALTER TYPE public.competency_rating RENAME VALUE 'emerging' TO 'beginning';
ALTER TYPE public.competency_rating RENAME VALUE 'secure'   TO 'mastering';
ALTER TYPE public.competency_rating RENAME VALUE 'advanced' TO 'mastered';

-- ---------------------------------------------------------------------
-- 3. Post-apply assertion -- re-derived from the catalogue, not assumed
-- ---------------------------------------------------------------------
DO $assert$
DECLARE
  v_rating text;
  v_grade  text;
BEGIN
  -- A-049: four labels, ordered low to high, physical sort order unchanged.
  SELECT string_agg(e.enumlabel, ',' ORDER BY e.enumsortorder)
    INTO v_rating
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname = 'public' AND t.typname = 'competency_rating';

  IF v_rating IS DISTINCT FROM 'beginning,developing,mastering,mastered' THEN
    RAISE EXCEPTION
      'Vocabulary assertion V2-1 failed: public.competency_rating is (%), expected (beginning,developing,mastering,mastered) in that physical sort order',
      v_rating;
  END IF;

  -- A-054: Class Grade is a DIFFERENT vocabulary and is untouched by this
  -- migration. Asserted, not assumed, because the two enums coincidentally
  -- shared the token `advanced` before this rename.
  SELECT string_agg(e.enumlabel, ',' ORDER BY e.enumsortorder)
    INTO v_grade
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    JOIN pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname = 'public' AND t.typname = 'class_grade_code';

  IF v_grade IS DISTINCT FROM 'beginner,intermediate,advanced' THEN
    RAISE EXCEPTION
      'Vocabulary assertion V2-2 failed: public.class_grade_code is (%), expected (beginner,intermediate,advanced) -- Class Grade must be unchanged and unaffected (A-054)',
      v_grade;
  END IF;

  RAISE NOTICE 'competency_rating = beginning,developing,mastering,mastered; class_grade_code unchanged.';
END;
$assert$;
