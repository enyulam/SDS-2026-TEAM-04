-- =====================================================================
-- P2-16 SLOT 2 -- FORWARD CORRECTION under §11 R-1. Never an edit.
-- =====================================================================
-- ⛔ THE DEFECT, AND IT IS §26.1's CEILING PROVING ITSELF A SECOND TIME --
--    IN THE VERY PHASE WHERE THE OPERATOR RULED ON IT.
--
--    `20260816090000` applied with SEVEN PASS notices, one of which (`PI-6`)
--    EXECUTED the function. It still could not run for any real caller:
--
--      ERROR:  CREATE TABLE AS is not allowed in a non-volatile function
--      CONTEXT: ... line 29 at SQL statement
--
--    ▶ WHY `PI-6` PASSED ANYWAY: as `postgres` there is no application
--    account, so `app_current_account_id()` returns NULL and the body RETURNS
--    at its FIRST GATE -- twenty lines above the offending statement.
--    ⛔ APPLY-TIME EXECUTION PROVES RESOLUTION UP TO THE FIRST GATE AND
--    NOTHING BEYOND IT. The leg that caught this was the SUITE-AS-REAL-CALLER
--    leg, executing as an authorized management identity past every gate.
--
--    ⚠️ AND THE CAUSE IS A GENERAL ONE WORTH THE NOTE: a `STABLE` function
--    MAY NOT `CREATE TABLE AS`. The declaration and the body were each
--    individually correct -- `STABLE` is right for a read, a temp table is an
--    ordinary technique -- and they are incompatible. `CREATE FUNCTION`
--    accepts the pair without complaint.
--
-- ✅ THE FIX: the temp table becomes a CTE, which is what it should have been.
--    Same semantics, no volatility, and one fewer object.
--
-- ⛔ ADDS NOTHING. No table, column, enum, policy, grant or audit string; the
--    signature, result type and single EXECUTE grant are unchanged.
-- =====================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.report_class_improved_dimension(p_class_module_id uuid)
RETURNS TABLE (
  improved_dimension   public.dimension_code,
  sessions_considered  integer
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_account_id uuid;
  v_centre_id  uuid;
  v_sessions   integer;
  v_midpoint   integer;
BEGIN
  -- ⛔ FAIL CLOSED BY RETURNING NO ROWS -- `Q-7` for a management READ.
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  SELECT (pg_catalog.array_agg(m.centre_id))[1] INTO v_centre_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.role = 'management' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_centre_id IS NULL THEN RETURN; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.class_modules cm
     WHERE cm.id = p_class_module_id AND cm.centre_id = v_centre_id
  ) THEN RETURN; END IF;

  -- ⛔ SUBMITTED ONLY. `CLAUDE.md` §6 computes both Insight slots over
  --    submitted reports; a draft is not a published fact about a child.
  SELECT pg_catalog.count(DISTINCT cs.id) INTO v_sessions
    FROM public.class_sessions cs
    JOIN public.reports rp ON rp.class_session_id = cs.id
   WHERE cs.class_module_id = p_class_module_id
     AND cs.centre_id = v_centre_id
     AND rp.status = 'submitted';

  -- ⛔ §6's OWN FLOOR, returned as a ROW rather than an empty set, because an
  --    empty set is the REFUSAL signal three gates above and the caller must
  --    be able to tell "not permitted" from "not enough data yet".
  IF v_sessions < 2 THEN
    RETURN QUERY SELECT NULL::public.dimension_code, v_sessions;
    RETURN;
  END IF;

  v_midpoint := v_sessions / 2;

  /*
   * ⛔ THE AGGREGATION HAPPENS HERE, INSIDE THE DATABASE -- the ruling, and
   *    the same structure `D-2` was permitted on.
   *
   * ⛔ THE RESULT IS AN IDENTIFIER, NEVER A VALUE. The per-dimension means,
   *    the halves and the delta exist only inside this query; what crosses the
   *    boundary is one `dimension_code` and one count, and the result type has
   *    no column capable of carrying a rating, a band or a score.
   */
  RETURN QUERY
  WITH submitted_sessions AS (
    SELECT DISTINCT cs.id AS class_session_id, cs.session_date
      FROM public.class_sessions cs
      JOIN public.reports rp ON rp.class_session_id = cs.id
     WHERE cs.class_module_id = p_class_module_id
       AND cs.centre_id = v_centre_id
       AND rp.status = 'submitted'
  ),
  ordered AS (
    SELECT class_session_id,
           pg_catalog.row_number() OVER (ORDER BY session_date, class_session_id) AS seq
      FROM submitted_sessions
  ),
  scored AS (
    SELECT r.dimension_code,
           (o2.seq > v_midpoint) AS is_second_half,
           public.competency_score(r.rating) AS score
      FROM public.observations o
      JOIN ordered o2 ON o2.class_session_id = o.class_session_id
      JOIN public.observation_ratings r ON r.observation_id = o.id
      JOIN public.reports rp
        ON rp.class_session_id = o.class_session_id
       AND rp.student_id = o.student_id
     WHERE o.centre_id = v_centre_id
       AND rp.status = 'submitted'
       AND r.rating IS NOT NULL
  ),
  deltas AS (
    SELECT s.dimension_code,
           pg_catalog.avg(s.score) FILTER (WHERE s.is_second_half)
             - pg_catalog.avg(s.score) FILTER (WHERE NOT s.is_second_half) AS delta
      FROM scored s
     GROUP BY s.dimension_code
    HAVING pg_catalog.count(*) FILTER (WHERE s.is_second_half) > 0
       AND pg_catalog.count(*) FILTER (WHERE NOT s.is_second_half) > 0
  )
  SELECT d.dimension_code, v_sessions
    FROM deltas d
   WHERE d.delta > 0
   ORDER BY d.delta DESC, d.dimension_code
   LIMIT 1;

  -- ⚠️ ENOUGH DATA BUT NOTHING IMPROVED: emit the explicit row, because an
  --    empty set is indistinguishable from a refusal. `CLAUDE.md` §6 does not
  --    specify this case; it is REPORTED rather than resolved silently, and it
  --    fails toward saying LESS -- a NULL dimension names no dimension.
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::public.dimension_code, v_sessions;
  END IF;
END;
$fn$;

COMMENT ON FUNCTION public.report_class_improved_dimension(uuid) IS
  'P2-16 slot 2. Operator ruling 2026-08-16: input is ratings across children, output is a '
  'dimension NAME and never a value -- D-2 structure, and G-2 bars a roll-up RATING, which a '
  'dimension name is not. Aggregates inside the database over SUBMITTED reports only. '
  'Read only, centre-scoped, management-gated, emits no audit event.';

DO $assert$
DECLARE
  v_txt text;
  v_n   integer;
BEGIN
  -- ⛔ PJ-1 THE FAILING CONSTRUCT IS GONE, AND ITS WHOLE CLASS WITH IT.
  --    A `STABLE` function may not CREATE, and this is the assertion that
  --    keeps a later edit from reintroducing one.
  SELECT p.prosrc INTO v_txt
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_class_improved_dimension';
  IF v_txt ~* '\mCREATE\s+(TEMP|TEMPORARY|TABLE|INDEX)' THEN
    RAISE EXCEPTION 'PJ-1 FAIL: the body still contains a CREATE, which a STABLE function may not run';
  END IF;
  RAISE NOTICE 'PJ-1 PASS: no CREATE remains in a STABLE body';

  -- PJ-2 the contract did not move: same result type, same single grant.
  SELECT pg_catalog.pg_get_function_result(p.oid) INTO v_txt
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_class_improved_dimension';
  IF v_txt IS DISTINCT FROM 'TABLE(improved_dimension dimension_code, sessions_considered integer)' THEN
    RAISE EXCEPTION 'PJ-2 FAIL: result type moved to "%"', v_txt;
  END IF;
  IF v_txt ~* '(rating|band|score|beginning|developing|mastering|mastered|percent|avg|delta)' THEN
    RAISE EXCEPTION 'PJ-2 FAIL: result type mentions a rating family term';
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.role_routine_grants
   WHERE specific_schema = 'public' AND routine_name = 'report_class_improved_dimension'
     AND grantee = 'authenticated' AND privilege_type = 'EXECUTE';
  IF v_n <> 1 THEN RAISE EXCEPTION 'PJ-2 FAIL: % EXECUTE grants, expected 1', v_n; END IF;
  RAISE NOTICE 'PJ-2 PASS: result type and grant unchanged, no rating term crosses the boundary';

  -- PJ-3 the D-2 mapping is still in exactly one place.
  SELECT pg_catalog.count(*) INTO v_n
    FROM (
      SELECT p.prosrc FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
       WHERE n.nspname = 'public' AND p.prokind = 'f' AND p.proname <> 'competency_score'
    ) z
   WHERE z.prosrc ~ 'WHEN\s+''mastering''\s+THEN\s+75';
  IF v_n <> 0 THEN RAISE EXCEPTION 'PJ-3 FAIL: % function(s) inline the D-2 mapping', v_n; END IF;
  RAISE NOTICE 'PJ-3 PASS: the D-2 mapping is still held in exactly one place';

  -- PJ-4 census unmoved.
  SELECT pg_catalog.count(*) INTO v_n FROM information_schema.tables
   WHERE table_schema='public' AND table_type='BASE TABLE';
  IF v_n <> 30 THEN RAISE EXCEPTION 'PJ-4 FAIL: % tables', v_n; END IF;
  SELECT pg_catalog.array_length(public.audit_action_registry(),1) INTO v_n;
  IF v_n <> 23 THEN RAISE EXCEPTION 'PJ-4 FAIL: registry %', v_n; END IF;
  RAISE NOTICE 'PJ-4 PASS: 30 tables, registry 23';
END;
$assert$;

COMMIT;
