-- =====================================================================
-- B.E.S.T Coach -- Hero chain Phase 1: canonical report CONTEXT
-- =====================================================================
-- Governing authority (highest first):
--   Specification v3 -> Amendments 001 ... 008 -> FINAL_MVP_AUTHORITY_LOCK
--   -> FINAL_MVP_HERO_CHAIN_RULINGS.md -> operator ruling Q-27
--   -> operator ruling R-C2-6 -> CLAUDE.md
--   -> docs/plan/HERO_CHAIN_COMPLETION_PLAN.md Phase 1 (screen `33`)
--
-- WHAT THIS MIGRATION CREATES:
--   * 1 function ..... public.report_get_canonical_context(uuid, uuid)
--   * 1 COMMENT ON FUNCTION statement
--   * 1 REVOKE line and 1 GRANT line
--   * its authored post-apply assertions
--
-- WHAT IT DELIBERATELY DOES NOT CREATE OR TOUCH:
--   no table, column, enum, label, policy, table grant, index, trigger,
--   view, audit action or seed row -- and NO `CREATE OR REPLACE` of any
--   existing function. `report_get_canonical` (RPC-13) is BYTE-UNTOUCHED.
--
-- ---------------------------------------------------------------------
-- WHY A SECOND FUNCTION RATHER THAN WIDENING RPC-13
-- ---------------------------------------------------------------------
-- RPC-13 is the ratified canonical read. Its zero-row behaviour across
-- all six denial cases is pinned byte-for-byte by
-- `scripts/tests/c2/c2-suite.sql` T-C2-9, and operator ruling R-C2-6
-- requires every parent denial to be INDISTINGUISHABLE. Editing it would
-- put that pinned behaviour at risk to add four display fields. This
-- function is additive and leaves the ratified read exactly as accepted.
--
-- ⚠️ THE GATE BELOW IS A DELIBERATE MIRROR OF RPC-13's, STEP FOR STEP:
-- same identity resolution, same fail-closed single-active-membership
-- dispatch, same per-role live predicate with NO BRANCH DEFAULTING TO
-- PERMIT, and the same `latest_submitted_version_id IS NULL -> RETURN`.
-- It is a mirror rather than a re-derivation ON PURPOSE: if this gate
-- were even slightly looser than RPC-13's, this function would become a
-- SIDE CHANNEL that discloses the existence and context of a report the
-- canonical read refuses -- which is exactly the R-C2-6 failure mode.
-- Assertion H1-5 pins that the two gates stay in step.
--
-- ---------------------------------------------------------------------
-- ⛔ WHAT THIS FUNCTION MUST NEVER RETURN
-- ---------------------------------------------------------------------
-- Q-27 / A-021 / A-038: NO rating, in any vocabulary, aggregated or per
--   dimension -- the nine ratings are a DATA boundary on every Parent
--   surface, and no roll-up exists to return (G-2).
-- No observation, trainer note, draft, AI history, content hash,
--   REVISION NUMBER, lifecycle status or audit row.
-- ⚠️ NOTHING THAT DISCLOSES THAT A CORRECTION CYCLE IS OR WAS UNDERWAY
--   (`33`/`32` standing prohibition, screen.md §6). There is no
--   correction field, no version count, no "updated" marker and no
--   second timestamp here -- a revision count is a correction disclosure
--   wearing a number.
-- G-4: NO TERM. G-8: NO EVIDENCE. G-7: NO `Assist.` slot.
--
-- What it DOES return is display context the frame names and governance
-- permits: the learner's name, the Class Grade and Class Module titles,
-- the session date, the lesson number and title (G-3), and the assigned
-- trainer's display name (G-5, expressly permitted on a Parent surface
-- because it is NOT a rating and NOT derived from one).
-- =====================================================================

CREATE FUNCTION public.report_get_canonical_context(
  p_class_session_id uuid,
  p_student_id       uuid
)
RETURNS TABLE (
  student_display_name text,
  class_grade_label    text,
  class_module_title   text,
  session_date         date,
  lesson_number        smallint,
  lesson_title         text,
  trainer_display_name text
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
  v_trainer    text;
BEGIN
  -- ---- the RPC-13 gate, mirrored step for step ----
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
    IF NOT public.app_parent_reaches_student(p_student_id) THEN RETURN; END IF;
  ELSE
    RETURN;
  END IF;

  IF v_r.latest_submitted_version_id IS NULL THEN RETURN; END IF;
  -- ---- end of mirrored gate ----

  -- Staff identity comes from the Phase 0A read path, NOT from a second
  -- copy of its join. One source of truth: that function re-derives the
  -- caller's reach itself, and a caller who has passed the gate above has
  -- necessarily satisfied its parent ground too (a submitted canonical
  -- version for a student they reach). Its NULL is a real state -- an
  -- unassigned session -- and is rendered by OMITTING the row.
  SELECT s.trainer_display_name INTO v_trainer
    FROM public.class_session_staff_identity(v_r.class_session_id) s;

  RETURN QUERY
  SELECT st.full_name,
         cg.display_name,
         cm.title,
         cs.session_date,
         cs.lesson_number,
         cs.lesson_title,
         v_trainer
    FROM public.class_sessions cs
    JOIN public.class_modules  cm ON cm.id = cs.class_module_id
    JOIN public.class_grades   cg ON cg.id = cm.class_grade_id
    JOIN public.students       st ON st.id = p_student_id
   WHERE cs.id = p_class_session_id;
END;
$fn$;

COMMENT ON FUNCTION public.report_get_canonical_context(uuid, uuid) IS
  'Hero Phase 1. Display CONTEXT for the canonical submitted report: learner name, '
  'Class Grade, Class Module, session date, lesson number/title (G-3) and the assigned '
  'trainer (G-5). Its authorization gate MIRRORS report_get_canonical (RPC-13) step for '
  'step so it can never become a side channel that discloses a report the canonical read '
  'refuses (R-C2-6). Returns NO rating in any form (Q-27, G-2), no observation, note, '
  'draft, AI history, content hash, revision number, status or audit row, and NOTHING '
  'that discloses a correction cycle. No term (G-4), no evidence (G-8).';

-- Same privilege posture as every governed read: `authenticated` may call
-- it; what it returns is decided per call by the caller's live reach.
-- service_role is never granted -- it carries BYPASSRLS.
REVOKE ALL ON FUNCTION public.report_get_canonical_context(uuid, uuid) FROM PUBLIC, anon, service_role, authenticator;

GRANT EXECUTE ON FUNCTION public.report_get_canonical_context(uuid, uuid) TO authenticated;

-- =====================================================================
-- POST-APPLY ASSERTIONS -- same transaction as the DDL above.
-- =====================================================================
DO $assert$
DECLARE
  v_n   bigint;
  v_m   bigint;
  v_b   boolean;
  v_t   text;
  v_src text;
BEGIN
  -- H1-1: exactly one function added. 40 before, 41 now.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public';
  IF v_n <> 41 THEN
    RAISE EXCEPTION 'Phase 1 assertion H1-1 failed: % function(s) in public; expected 41 (40 + 1)', v_n;
  END IF;

  -- H1-2: census otherwise unmoved.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r';
  IF v_n <> 27 THEN
    RAISE EXCEPTION 'Phase 1 assertion H1-2 failed: % table(s); expected 27 (unchanged)', v_n;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN
    RAISE EXCEPTION 'Phase 1 assertion H1-2 failed: % enum type(s); expected 12 (unchanged)', v_n;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_policies WHERE schemaname = 'public';
  IF v_n <> 29 THEN
    RAISE EXCEPTION 'Phase 1 assertion H1-2 failed: % policy/policies; expected 29 (unchanged)', v_n;
  END IF;

  SELECT pg_catalog.count(*) FILTER (WHERE NOT c.relrowsecurity),
         pg_catalog.count(*) FILTER (WHERE c.relforcerowsecurity)
    INTO v_n, v_m
    FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r';
  IF v_n <> 0 OR v_m <> 0 THEN
    RAISE EXCEPTION 'Phase 1 assertion H1-2 failed: % without RLS, % FORCE; expected 0 and 0', v_n, v_m;
  END IF;

  -- H1-3: security properties.
  SELECT p.prosecdef, p.provolatile INTO v_b, v_t
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_get_canonical_context';
  IF v_b IS NOT TRUE THEN
    RAISE EXCEPTION 'Phase 1 assertion H1-3 failed: not SECURITY DEFINER';
  END IF;
  IF v_t <> 's' THEN
    RAISE EXCEPTION 'Phase 1 assertion H1-3 failed: not STABLE (provolatile=%)', v_t;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_get_canonical_context'
     AND p.proconfig @> ARRAY['search_path=""'];
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Phase 1 assertion H1-3 failed: search_path is not pinned to the empty string';
  END IF;

  -- H1-4: ACL is exactly one non-owner grant, EXECUTE to authenticated,
  -- and nothing reached PUBLIC, anon or service_role.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace,
         pg_catalog.aclexplode(p.proacl) ae
   WHERE n.nspname = 'public' AND p.proname = 'report_get_canonical_context'
     AND ae.grantee <> p.proowner;
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Phase 1 assertion H1-4 failed: % non-owner grant(s); expected exactly 1', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace,
         pg_catalog.aclexplode(p.proacl) ae
   WHERE n.nspname = 'public' AND p.proname = 'report_get_canonical_context'
     AND (ae.grantee = 0 OR ae.grantee = 'anon'::regrole::oid OR ae.grantee = 'service_role'::regrole::oid);
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Phase 1 assertion H1-4 failed: % grant(s) reached PUBLIC, anon or service_role', v_n;
  END IF;

  -- H1-5: ⚠️ THE GATE IS STILL A MIRROR. RPC-13 is byte-untouched, and
  -- this function still carries every one of the gate's five decision
  -- points. If a later edit loosened one, this function would begin
  -- disclosing context for reports the canonical read refuses -- the
  -- R-C2-6 side-channel failure -- so the mirror is asserted structurally
  -- rather than trusted to a comment.
  SELECT p.prosrc INTO v_src
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_get_canonical_context';
  IF v_src IS NULL
     OR pg_catalog.strpos(v_src, 'app_current_account_id') = 0
     OR pg_catalog.strpos(v_src, 'latest_submitted_version_id IS NULL') = 0
     OR pg_catalog.strpos(v_src, 'app_trainer_reaches_session') = 0
     OR pg_catalog.strpos(v_src, 'app_parent_reaches_student') = 0
     OR pg_catalog.strpos(v_src, 'HAVING pg_catalog.count(*) = 1') = 0
  THEN
    RAISE EXCEPTION 'Phase 1 assertion H1-5 failed: the mirrored RPC-13 gate is incomplete';
  END IF;

  -- H1-6: ⛔ Q-27 / correction-disclosure, asserted on the SIGNATURE. The
  -- return type is the disclosure surface, so it is pinned by name: seven
  -- columns, none of which is a rating, a status, a hash, a revision
  -- number or a correction field.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_get_canonical_context'
     AND p.proargnames @> ARRAY['student_display_name','class_grade_label','class_module_title',
                                'session_date','lesson_number','lesson_title','trainer_display_name'];
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Phase 1 assertion H1-6 failed: the returned column set is not the seven authorized fields';
  END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace,
         pg_catalog.unnest(p.proargnames) AS nm
   WHERE n.nspname = 'public' AND p.proname = 'report_get_canonical_context'
     AND (nm LIKE '%rating%' OR nm LIKE '%grade_band%' OR nm LIKE '%overall%'
          OR nm LIKE '%hash%' OR nm LIKE '%revision%' OR nm LIKE '%correction%'
          OR nm LIKE '%status%' OR nm LIKE '%term%' OR nm LIKE '%evidence%');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Phase 1 assertion H1-6 failed: % prohibited field name(s) in the return type', v_n;
  END IF;

  -- H1-7: RPC-13 itself is untouched -- still present, still SECURITY
  -- DEFINER, still returning its five ratified columns.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_get_canonical'
     AND p.prosecdef
     AND p.proargnames @> ARRAY['overview','strengths','areas_for_development','remarks','submitted_at'];
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Phase 1 assertion H1-7 failed: report_get_canonical is absent or altered';
  END IF;

  RAISE NOTICE 'Phase 1: canonical report context applied; assertions H1-1..H1-7 passed.';
END;
$assert$;
