-- =====================================================================
-- B.E.S.T Coach -- Step 7I, migration 1 of 2: the `trainer_approved` label
-- =====================================================================
-- Governing authority (highest first):
--   Specification v3 -> Amendment 001 -> Amendment 002 -> Amendment 003
--   -> Amendment 004 (A-036, A-040) -> CLAUDE.md -> Implementation Plan
--   -> docs/plan/STEP_7I_REPORT_LIFECYCLE_BASELINE.md (U-7I-18, R-2)
--
-- THIS FILE CONTAINS EXACTLY TWO THINGS AND NOTHING ELSE:
--   1. the P-1 fail-closed execution-role guard;
--   2. one `ALTER TYPE ... ADD VALUE 'trainer_approved' AFTER 'needs_edit'`.
--
-- WHY IT IS ITS OWN FILE (U-7I-18, mandatory -- not a style choice).
-- PostgreSQL refuses "unsafe use of new value of enum type" when a newly
-- added label is used in the SAME transaction that added it. The check
-- fires from the enum INPUT FUNCTION during PARSE ANALYSIS, so:
--   * `LANGUAGE sql` and SQL-standard `BEGIN ATOMIC` bodies are UNSAFE --
--     they are parse-analyzed at CREATE FUNCTION under the default
--     `check_function_bodies = on`;
--   * `plpgsql` bodies defer parse analysis of their SQL expressions to
--     first execution, so they are safe -- but an end-of-migration
--     assertion that evaluates the literal is unsafe under ANY language.
-- Splitting the label into its own committed migration removes the hazard
-- at the source. Migration 2 is the only file permitted to reference the
-- new label, and Step 7I additionally pins every new function to `plpgsql`
-- so the second, independent route to the same failure is also closed.
--
-- WHY `AFTER 'needs_edit'` (R-2, ratified at Step 7I1D-R2). A bare
-- ADD VALUE would append the label eighth, so the physical `pg_enum` sort
-- order would silently disagree with A-036, CLAUDE.md section 6 and the
-- Step 7I baseline, all three of which place the management-review state
-- between `needs_edit` and `approved`. Nothing in the MVP orders or ranges
-- by `report_status` today, so the ordering is pinned BEFORE anything can
-- depend on it. Proven by T7I-73.
--
-- IRREVERSIBILITY, RECORDED HONESTLY (U-7I-25). PostgreSQL offers no way
-- to remove an enum label, so this change is PERMANENT once applied. It is
-- a knowing exception to the reversible-migration discipline of CLAUDE.md
-- section 3.2, accepted because Step 7I applies only to a local disposable
-- database whose down path is drop-and-rebuild. No down file is authored,
-- and none is claimed.
--
-- This file adds NO table, column, constraint, index, function, policy,
-- grant, comment or assertion. See T7I-73.
-- =====================================================================

-- ---------------------------------------------------------------------
-- P-1 execution-role guard (fail closed, before any change)
-- ---------------------------------------------------------------------
DO $guard$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION
      'Step 7I migration 1 aborted before any change: this migration must run as postgres, not "%". '
      'Objects created by supabase_admin in schema public would inherit its default ACL '
      '(ALL to anon/authenticated/service_role) -- the exact hazard P-1 exists to prevent.',
      current_user;
  END IF;
END;
$guard$;

ALTER TYPE public.report_status ADD VALUE 'trainer_approved' AFTER 'needs_edit';
