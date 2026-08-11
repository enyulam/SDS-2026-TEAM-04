-- ===========================================================================
-- PORTAL COMPLETION PLAN — phase P1-1b
-- D-1: Management may VIEW the nine per-dimension ratings, READ ONLY.
--
-- Authority:
--   D-1  (FINAL_MVP_PORTAL_DECISIONS.md)      management may VIEW the nine,
--                                             read only; amends A-038 in the
--                                             MANAGEMENT direction only.
--   C-9  (FINAL_MVP_PORTAL_DECISIONS.md §C)   REPORT DETAIL SURFACES ONLY.
--                                             Not a list, not a statistics
--                                             surface -- those "invite
--                                             comparison between children".
--   C-10 (FINAL_MVP_PORTAL_DECISIONS.md §C)   ALL NINE, not the frame's four.
--                                             Rendering four is a selection of
--                                             assessment substance with no
--                                             ratified basis.
--   Bounded CLAUDE.md §12 authorization, 2026-08-11.
--
-- Design was stated BEFORE this file was written:
--   docs/plan/PORTAL_COMPLETION_PLAN.md, "P1-1b -- THE OBJECT, SIGNATURE AND
--   GATE, STATED BEFORE IT IS WRITTEN".
--
-- ⛔ WHAT THIS MIGRATION DOES NOT DO
--   - It does not touch public.report_get_canonical. That function dispatches
--     on the caller's role and serves parent, trainer and management from ONE
--     body; putting ratings in it would leave them one branch away from a
--     Parent session and make Q-27 depend on a conditional.
--   - It does not touch public.report_get_management_review, so the proven
--     screen 19 review path keeps its exact return type.
--   - It adds no table, no column, no enum value, no policy, no audit action
--     string. The Step 7H registry stays at 16.
--   - Management may VIEW, never EDIT. This function is STABLE and writes
--     nothing. An assessment-level disagreement remains a RETURN TO THE
--     TRAINER (A-034, D-1).
--
-- ⛔ Q-27 DOES NOT MOVE. Nothing here reaches a Parent surface, DTO,
--    projection, RPC result or client payload. D-1 grants Parent nothing.
-- ===========================================================================

CREATE OR REPLACE FUNCTION public.report_get_management_ratings(
  p_class_session_id uuid,
  p_student_id       uuid
)
 RETURNS TABLE(
   dimension_code public.dimension_code,
   display_name   text,
   sort_order     smallint,
   rating         public.competency_rating
 )
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
  v_r             public.reports%ROWTYPE;
  v_version_id    uuid;
BEGIN
  -- Step 1 -- anon deny. No account, no answer.
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  -- Step 2 -- the report must exist for this exact (session, student) pair.
  SELECT r.* INTO v_r
    FROM public.reports r
   WHERE r.class_session_id = p_class_session_id AND r.student_id = p_student_id;
  IF NOT FOUND THEN RETURN; END IF;

  -- Step 3 -- THE MANAGEMENT-ONLY LEG, resolved LIVE against the report's own
  -- centre. Mirrors report_get_management_review step for step.
  --
  -- A trainer or a parent holds no `management` membership, so the aggregate
  -- is NULL and this returns zero rows -- the deny is the SAME predicate that
  -- governs the review read, not a second, looser one written beside it.
  -- HAVING count(*) = 1 fails closed on zero AND on more than one.
  SELECT (pg_catalog.array_agg(m.id))[1] INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.centre_id = v_r.centre_id
     AND m.role = 'management' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN RETURN; END IF;

  -- Step 4 -- C-9 MADE PHYSICAL. The two branches below are exactly the two
  -- reads A-038 permits Management: the final-review candidate, and the
  -- canonical submitted version. Every other status returns NOTHING, so no
  -- rating reaches Management before a trainer approval exists.
  IF v_r.status = 'trainer_approved' THEN
    v_version_id := v_r.current_cycle_version_id;
  ELSIF v_r.status = 'submitted' THEN
    v_version_id := v_r.latest_submitted_version_id;
  ELSE
    -- incomplete | observation_saved | drafting | draft_ready | needs_edit
    RETURN;
  END IF;

  IF v_version_id IS NULL THEN RETURN; END IF;

  -- Step 5 -- the nine immutable snapshots for the resolved version. A version
  -- is self-contained (A-028): these travel with it, so the reader never
  -- reconstructs an approved report by joining against mutable working data.
  RETURN QUERY
    SELECT rvr.dimension_code, d.display_name, d.sort_order, rvr.rating
      FROM public.report_version_ratings rvr
      JOIN public.assessment_dimensions d ON d.code = rvr.dimension_code
     WHERE rvr.report_version_id = v_version_id
       AND rvr.report_id = v_r.id
     ORDER BY d.sort_order;
END;
$function$;

-- Minimum matching grant, and nothing wider.
REVOKE ALL ON FUNCTION public.report_get_management_ratings(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_get_management_ratings(uuid, uuid) TO authenticated;

COMMENT ON FUNCTION public.report_get_management_ratings(uuid, uuid) IS
  'D-1/C-9/C-10: the nine per-dimension ratings for a REPORT DETAIL surface, '
  'MANAGEMENT ONLY, READ ONLY. Gate mirrors report_get_management_review. '
  'Returns nothing for any status other than trainer_approved or submitted. '
  'Q-27 unaffected: no rating reaches any Parent surface.';

-- ===========================================================================
-- In-transaction assertions. These run as part of the migration and roll the
-- whole thing back on failure.
--
-- ⚠️ A migration must never assert on FIXTURE data (the H0B-3 lesson: an
-- assertion pinned to 4 class_sessions was fixture state, not schema state,
-- and a fresh apply has none). Every assertion below is CATALOGUE state.
-- ===========================================================================
DO $assert$
DECLARE
  v_n bigint;
BEGIN
  -- D1-1: the function exists, is SECURITY DEFINER, and is STABLE (it can
  -- never write).
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_get_management_ratings'
     AND p.prosecdef AND p.provolatile = 's';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'P1-1b assertion D1-1 failed: function absent, not SECURITY DEFINER, or not STABLE';
  END IF;

  -- D1-2: search_path is pinned to the empty string. ⚠️ The catalogue stores
  -- this as search_path="" WITH QUOTES -- the H0A-4 lesson, where an assertion
  -- written against the authored form rolled a whole migration back.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_get_management_ratings'
     AND p.proconfig @> ARRAY['search_path=""'];
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'P1-1b assertion D1-2 failed: search_path is not pinned to the empty string';
  END IF;

  -- D1-3: exactly ONE EXECUTE grant, and it is to `authenticated`. Nothing
  -- wider -- no anon, no PUBLIC, no service_role.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_get_management_ratings'
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'P1-1b assertion D1-3 failed: authenticated cannot EXECUTE';
  END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_get_management_ratings'
     AND (pg_catalog.has_function_privilege('anon', p.oid, 'EXECUTE')
       OR pg_catalog.has_function_privilege('public', p.oid, 'EXECUTE'));
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P1-1b assertion D1-4 failed: anon or PUBLIC can EXECUTE';
  END IF;

  -- D1-5: THE RETURN TYPE CARRIES NO PROHIBITED FIELD. Same shape as H1-6.
  -- ⛔ No panel text, no hash, no checklist, no approval internal, no
  -- correction reason, no revision, no status, no term, no evidence, and no
  -- roll-up (G-2: `overall`/`grade`/`band` must never appear here).
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace,
         pg_catalog.unnest(p.proargnames) AS nm
   WHERE n.nspname = 'public' AND p.proname = 'report_get_management_ratings'
     AND (nm LIKE '%hash%' OR nm LIKE '%overview%' OR nm LIKE '%strength%'
       OR nm LIKE '%remark%' OR nm LIKE '%areas%' OR nm LIKE '%checklist%'
       OR nm LIKE '%approv%' OR nm LIKE '%correction%' OR nm LIKE '%revision%'
       OR nm LIKE '%note%' OR nm LIKE '%term%' OR nm LIKE '%evidence%'
       OR nm LIKE '%overall%' OR nm LIKE '%grade%' OR nm LIKE '%band%'
       OR nm LIKE '%lock%');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P1-1b assertion D1-5 failed: % prohibited field name(s) in the return type', v_n;
  END IF;

  -- D1-6: THE TWO GATES ARE THE SAME GATE. The side-channel risk of a second
  -- RPC (R-C2-6: "a second RPC is a second gate to keep in step") is mitigated
  -- by pinning the management predicate to the SAME shape the review read
  -- uses. If either drifts, this fires.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname IN ('report_get_management_ratings', 'report_get_management_review')
     AND p.prosrc LIKE '%m.role = ''management'' AND m.status = ''active''%'
     AND p.prosrc LIKE '%HAVING pg_catalog.count(*) = 1%';
  IF v_n <> 2 THEN
    RAISE EXCEPTION 'P1-1b assertion D1-6 failed: the two management gates are not the same predicate (found %)', v_n;
  END IF;

  -- D1-7: report_get_canonical IS BYTE-UNTOUCHED -- still present, still
  -- SECURITY DEFINER, still returning exactly its five ratified columns and
  -- NOT a rating. This is the Q-27 assertion: the parent-reachable read must
  -- not have gained a rating field.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_get_canonical'
     AND p.prosecdef
     AND p.proargnames @> ARRAY['overview','strengths','areas_for_development','remarks','submitted_at'];
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'P1-1b assertion D1-7 failed: report_get_canonical is absent or altered';
  END IF;

  -- D1-8: no parent-reachable read gained a rating field. Scanned across ALL
  -- THREE parent-facing reads, not just the one this migration was near --
  -- a completeness claim is scanned across the set, never against one member.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace,
         pg_catalog.unnest(p.proargnames) AS nm
   WHERE n.nspname = 'public'
     AND p.proname IN ('report_get_canonical', 'report_get_canonical_context',
                       'report_list_management_submitted')
     AND (nm LIKE '%rating%' OR nm LIKE '%dimension%');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P1-1b assertion D1-8 failed: % rating/dimension field(s) on a parent-reachable read', v_n;
  END IF;

  -- D1-9: the Step 7H audit registry is UNMOVED at 16. A-057 remains
  -- unimplemented, and this migration is not the thing that implements it.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'audit_append_event'
     AND p.prosrc LIKE '%evidence.%';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P1-1b assertion D1-9 failed: an evidence action string reached the audit registry';
  END IF;

  RAISE NOTICE 'P1-1b: report_get_management_ratings applied; D1-1..D1-9 passed.';
END;
$assert$;
