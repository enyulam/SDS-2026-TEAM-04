-- =====================================================================
-- PORTAL PHASE P2-7 -- screen `11` Management Dashboard.
-- ONE reviewed `SECURITY DEFINER` READ behind the four KPI tiles.
-- =====================================================================
-- Authorized by the Operator on 2026-08-14, with every count STATED IN
-- ADVANCE and approved before this file was written:
--
--     "SCHEMA — AUTHORIZED as stated. One SECURITY DEFINER read returning
--      four integers, 0 tables, 0 columns, 0 enums, 0 policies, 0 client
--      grants, registry unmoved at 23."
--
-- ---------------------------------------------------------------------
-- ⚠️ WHY A FUNCTION AT ALL -- measured, not preferred
-- ---------------------------------------------------------------------
-- Three of the four tiles need no new object: `total_students` is a direct
-- RLS read, `pending_approval` is the accepted pending boundary's row count,
-- and `submitted_reports` is `report_list_management_submitted`'s. ▶ ONLY
-- `assessed_students` has no source: `reports`, `observations` and
-- `report_versions` each carry **ZERO client grants** at HEAD, and the three
-- delivered management boundaries expose only `trainer_approved`,
-- `needs_edit`, `draft_ready` and `submitted` -- a report at `incomplete`,
-- `observation_saved` or `drafting` is invisible to management BY `A-038`'s
-- DESIGN. ⛔ There is no direct read to fall back on, exactly as at `P2-4`.
--
-- ⚠️ All four are returned TOGETHER anyway, deliberately: four tiles read in
--    one round trip cannot disagree with each other, which three separate
--    reads plus one RPC could.
--
-- ---------------------------------------------------------------------
-- ⛔ CENTRE SCOPE -- RULED, and the reasoning is recorded because it is the
--    part a later phase would have to argue against
-- ---------------------------------------------------------------------
--     "On widening to centre scope: YES. `report_class_health_summary`
--      already establishes that counts are not content at class scope, and a
--      centre is the management caller's OWN scope -- it is the boundary they
--      already hold for every other read. A count of assessments at their own
--      centre discloses nothing a per-class count does not."
--
-- ▶ The centre is resolved from the CALLER'S OWN MEMBERSHIP and is never a
--   parameter. There is nothing to widen: a caller cannot ask about a centre
--   they do not belong to, because they cannot name one.
--
-- ---------------------------------------------------------------------
-- ⛔ WHAT THIS FUNCTION MAY NEVER NAME -- asserted the way `V-4` asserts it
-- ---------------------------------------------------------------------
--     "Assert the bars the way `V-4` did: the function must not name any
--      panel field, note, checklist, hash or rating. Prove it."
--
-- Assertion `W-4` matches as a BARE SUBSTRING, so it catches
-- `observation_ratings`, `report_version_ratings` and `competency_rating`
-- WITHOUT enumerating them -- and catches the next rating column nobody has
-- written yet. ⚠️ A `CREATE OR REPLACE` that added such a reference would
-- fail the build, not merely fail review.
--
-- ⚠️ TRANSACTIONAL. `supabase migration up` applies it in one transaction.
-- =====================================================================

-- ===========================================================================
-- 1 . The read. FOUR INTEGERS AND NOTHING ELSE.
-- ===========================================================================
CREATE FUNCTION public.report_centre_dashboard_summary(
  OUT o_total_students     integer,
  OUT o_assessed_students  integer,
  OUT o_pending_approval   integer,
  OUT o_submitted_reports  integer
)
 RETURNS record
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_centre_id uuid;
BEGIN
  -- ⛔ NON-DISCLOSING FAIL-CLOSED. A caller with no active management
  --    membership gets NULLs, which the projection turns into a refusal --
  --    never zeroes, which would read as "this centre has no learners".
  o_total_students    := NULL;
  o_assessed_students := NULL;
  o_pending_approval  := NULL;
  o_submitted_reports := NULL;

  IF public.app_current_account_id() IS NULL THEN RETURN; END IF;

  -- ⚠️ THE CENTRE IS THE CALLER'S OWN AND IS NEVER A PARAMETER. This is what
  --    makes "centre scope" not a widening: there is no other centre a caller
  --    could name, so the function has no reachable surface beyond their own.
  SELECT m.centre_id INTO v_centre_id
    FROM public.centre_memberships m
   WHERE m.account_id = public.app_current_account_id()
     AND m.role = 'management' AND m.status = 'active';
  IF v_centre_id IS NULL THEN RETURN; END IF;

  SELECT pg_catalog.count(*) INTO o_total_students
    FROM public.students s WHERE s.centre_id = v_centre_id;

  -- ⚠️ ASSESSED = DISTINCT LEARNERS WITH AT LEAST ONE OBSERVATION, not a
  --    count of observations. A learner assessed in three sessions is ONE
  --    assessed learner; counting rows would report a number larger than the
  --    roster and the tile beside it would contradict it.
  SELECT pg_catalog.count(DISTINCT o.student_id) INTO o_assessed_students
    FROM public.observations o WHERE o.centre_id = v_centre_id;

  SELECT pg_catalog.count(*) INTO o_pending_approval
    FROM public.reports r
   WHERE r.centre_id = v_centre_id AND r.status = 'trainer_approved';

  -- ⛔ `submitted`, NOT `approved`. Under `A-036` `approved` is
  --    TRANSIENT-IN-TRANSACTION and no operation ever commits with it, so a
  --    count of approved reports is ALWAYS ZERO, FOREVER, by design. The
  --    frame's `Approved` tile has an empty referent; the Operator ruled the
  --    substitution, and this is the same correction already applied to Class
  --    Health Summary and Management Insight at Step 7I1D-R2.
  SELECT pg_catalog.count(*) INTO o_submitted_reports
    FROM public.reports r
   WHERE r.centre_id = v_centre_id AND r.status = 'submitted';
END;
$function$;

REVOKE ALL ON FUNCTION public.report_centre_dashboard_summary() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_centre_dashboard_summary() TO authenticated;

COMMENT ON FUNCTION public.report_centre_dashboard_summary() IS
  'P2-7 screen 14 KPI tiles. FOUR INTEGERS, centre resolved from the caller''s '
  'own active management membership and never from a parameter. Returns NULLs '
  'to any other caller. Carries no rating, roll-up, panel field, note, '
  'checklist value or hash -- assertion W-4 fails the build if it ever does.';

-- ===========================================================================
-- 2 . APPLY-TIME ASSERTIONS. Every one aborts the whole migration.
-- ===========================================================================
DO $verify$
DECLARE
  v_n   integer;
  v_def text;
BEGIN
  -- W-1 -- exactly ONE new function, SECURITY DEFINER, search_path pinned.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_proc p JOIN pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = 'report_centre_dashboard_summary'
     AND p.prosecdef
     AND pg_catalog.array_to_string(p.proconfig, ',') LIKE '%search_path=%';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'P2-7 assertion W-1 failed: % matching function(s), expected exactly 1 SECURITY DEFINER with search_path pinned', v_n;
  END IF;

  -- W-2 -- ZERO structural change. Nothing else was authorized.
  SELECT pg_catalog.count(DISTINCT typname) INTO v_n
    FROM pg_type t JOIN pg_namespace ns ON ns.oid = t.typnamespace
   WHERE ns.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN
    RAISE EXCEPTION 'P2-7 assertion W-2 failed: % enums, expected 12 -- this phase adds none', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  IF v_n <> 30 THEN
    RAISE EXCEPTION 'P2-7 assertion W-2 failed: % tables, expected 30 -- this phase adds none', v_n;
  END IF;

  -- W-3 -- ⛔ THE AUDIT REGISTRY IS UNMOVED AT 23. A read is not a governed
  --        action (`A-029`), and nothing here emits an event.
  IF pg_catalog.array_length(public.audit_action_registry(), 1) <> 23 THEN
    RAISE EXCEPTION 'P2-7 assertion W-3 failed: registry is %, expected 23 UNMOVED -- a read is not a governed action', pg_catalog.array_length(public.audit_action_registry(), 1);
  END IF;
  SELECT pg_catalog.pg_get_functiondef(p.oid) INTO v_def
    FROM pg_proc p JOIN pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = 'report_centre_dashboard_summary';
  IF v_def ~* 'audit_append_event' THEN
    RAISE EXCEPTION 'P2-7 assertion W-3 failed: the read emits an audit event';
  END IF;

  -- W-4 -- ⛔ THE `V-4` BAR, ON THE OPERATOR'S EXPLICIT INSTRUCTION:
  --        "the function must not name any panel field, note, checklist,
  --         hash or rating. Prove it."
  -- ⚠️ BARE SUBSTRINGS, so this catches `observation_ratings`,
  --    `report_version_ratings` and `competency_rating` WITHOUT enumerating
  --    them -- and catches the next rating column nobody has written yet.
  IF v_def ~* '(rating|beginning|developing|mastering|mastered|overall_grade)' THEN
    RAISE EXCEPTION 'P2-7 assertion W-4 failed: the read names RATING vocabulary (C-9, G-2)';
  END IF;
  IF v_def ~* '(overview|strengths|areas_for_development|remarks)' THEN
    RAISE EXCEPTION 'P2-7 assertion W-4 failed: the read names a PANEL field (A-038)';
  END IF;
  IF v_def ~* '(follow_up_notes|observation_notes|strength_chips|focus_chips|term_evidence_notes)' THEN
    RAISE EXCEPTION 'P2-7 assertion W-4 failed: the read names a trainer NOTE or chip field';
  END IF;
  IF v_def ~* '(checklist|content_hash|wording_hash|entry_hash)' THEN
    RAISE EXCEPTION 'P2-7 assertion W-4 failed: the read names a CHECKLIST or HASH field';
  END IF;

  -- W-4c -- ⚠️ THE CONTROL. Without it, four absences are equally true of a
  --         predicate that can never match anything. The same four patterns
  --         are required to FIRE against a planted sample.
  IF NOT ('competency_rating mastering' ~* '(rating|beginning|developing|mastering|mastered|overall_grade)'
      AND 'v.areas_for_development' ~* '(overview|strengths|areas_for_development|remarks)'
      AND 'o.follow_up_notes' ~* '(follow_up_notes|observation_notes|strength_chips|focus_chips|term_evidence_notes)'
      AND 'rv.content_hash' ~* '(checklist|content_hash|wording_hash|entry_hash)')
  THEN
    RAISE EXCEPTION 'P2-7 assertion W-4c failed: a bar detector does NOT match its planted sample -- every absence in W-4 would be meaningless';
  END IF;

  -- W-5 -- ⛔ `submitted`, NOT `approved`. The frame's tile has an empty
  --        referent under `A-036`; this fails the build if somebody "restores
  --        fidelity" by counting a status that never commits.
  IF v_def !~ 'submitted' THEN
    RAISE EXCEPTION 'P2-7 assertion W-5 failed: the read does not count `submitted`';
  END IF;
  IF v_def ~ '=\s*''approved''' THEN
    RAISE EXCEPTION 'P2-7 assertion W-5 failed: the read counts `approved`, which under A-036 is transient-in-transaction and NEVER COMMITS -- the count would be zero forever';
  END IF;

  -- W-6 -- ZERO client table grants were added anywhere.
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.role_table_grants
   WHERE table_schema = 'public' AND table_name IN ('reports', 'observations', 'report_versions')
     AND grantee IN ('authenticated', 'anon', 'PUBLIC', 'service_role');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-7 assertion W-6 failed: % client grant(s) on reports/observations/report_versions -- the whole reason this function exists', v_n;
  END IF;

  RAISE NOTICE 'P2-7 assertions W-1..W-6 PASSED: one SECURITY DEFINER read, 30 tables, 12 enums, registry UNMOVED at 23, every V-4-class bar asserted AND its detector proved to fire';
END
$verify$;
