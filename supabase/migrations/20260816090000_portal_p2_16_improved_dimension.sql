-- =====================================================================
-- P2-16 SLOT 2 -- Management Insight's most-improved dimension.
-- =====================================================================
-- ⛔ OPERATOR RULING, 2026-08-16, AND ITS REASONING IS RECORDED HERE
--    BECAUSE A LATER PHASE MUST NOT READ §6's MANDATE AS THE ONLY GROUND:
--
--      "Its input is ratings across children; its output is a dimension name
--       and never a value. That is D-2's exact structure and D-2 is permitted
--       on precisely that ground: the aggregation happens server-side and no
--       rating, band or number is rendered.
--       G-2 bars a roll-up RATING. A dimension name is not a rating -- it
--       names where attention goes, not how anyone performed."
--
--    ▶ SO THE PERMISSION DOES NOT REST ON `CLAUDE.md` §6 MANDATING THE
--    SENTENCE. It rests on the SHAPE: aggregate inside the database, emit an
--    identifier, never a value. A future slot that mandated a NUMBER would
--    not inherit this ruling.
--
-- ⛔ WHAT THIS FILE ADDS, EXACTLY:
--      1. `public.competency_score(competency_rating)` -- IMMUTABLE, NO GRANT.
--      2. `public.report_class_improved_dimension(uuid)` -- SECURITY DEFINER
--         read + ONE EXECUTE grant to `authenticated`.
--      3. RECREATES `report_management_student_trend` to call the helper.
--    ⛔ No table, column, enum, policy, client table grant or audit string.
--
-- ⚠️ WHY THE HELPER EXISTS AT ALL, AND WHY NOT DOING THIS WOULD HAVE BROKEN
--    A RULING: `D-2` requires its band -> percentage mapping to be held in
--    ONE PLACE. Measured before writing: it existed in exactly one --
--    `report_management_student_trend`. ▶ A second inline CASE here would
--    have made it TWO, which is both a direct `D-2` violation and precisely
--    the "second definition free to drift" defect §12.10 keeps catching.
--    The recreation is a FORWARD migration under §11 R-1, never an edit.
--
-- ⛔ THE HELPER TAKES NO GRANT. It is called only from inside SECURITY
--    DEFINER bodies, which execute as owner. Granting it would widen the
--    client surface for no caller.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1. THE SINGLE D-2 MAPPING.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.competency_score(p_rating public.competency_rating)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = ''
AS $fn$
  SELECT CASE p_rating
           WHEN 'beginning'  THEN 25
           WHEN 'developing' THEN 50
           WHEN 'mastering'  THEN 75
           WHEN 'mastered'   THEN 100
         END::numeric;
$fn$;

COMMENT ON FUNCTION public.competency_score(public.competency_rating) IS
  'D-2 band to percentage mapping, client-ratified, THE ONE PLACE it is held. '
  'beginning 25, developing 50, mastering 75, mastered 100. '
  'No grant: called only from SECURITY DEFINER bodies. Never rendered as a number to any role.';

REVOKE ALL ON FUNCTION public.competency_score(public.competency_rating) FROM PUBLIC;

-- ---------------------------------------------------------------------
-- 2. THE EXISTING TREND, RECREATED TO USE IT (R-1 forward, not an edit).
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.report_management_student_trend(p_student_id uuid)
RETURNS TABLE (
  class_session_id uuid,
  session_date     date,
  lesson_title     text,
  session_score    numeric
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_account_id uuid;
  v_centre_id  uuid;
BEGIN
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  SELECT (pg_catalog.array_agg(m.centre_id))[1] INTO v_centre_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.role = 'management' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_centre_id IS NULL THEN RETURN; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.students s
     WHERE s.id = p_student_id AND s.centre_id = v_centre_id
  ) THEN RETURN; END IF;

  RETURN QUERY
  SELECT o.class_session_id,
         cs.session_date,
         cs.lesson_title,
         pg_catalog.round(pg_catalog.avg(public.competency_score(r.rating)), 2) AS session_score
    FROM public.observations o
    JOIN public.class_sessions cs ON cs.id = o.class_session_id
    JOIN public.observation_ratings r ON r.observation_id = o.id
   WHERE o.student_id = p_student_id
     AND o.centre_id = v_centre_id
   GROUP BY o.class_session_id, cs.session_date, cs.lesson_title
  HAVING pg_catalog.count(*) = 9
     AND pg_catalog.count(*) FILTER (WHERE r.rating IS NULL) = 0
   ORDER BY cs.session_date, o.class_session_id;
END;
$fn$;

-- ---------------------------------------------------------------------
-- 3. THE NEW READ.
-- ---------------------------------------------------------------------
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
  -- ⛔ FAIL CLOSED BY RETURNING NO ROWS -- `Q-7` for a management READ: a
  --    refusal IS an empty set, indistinguishable from "no data".
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

  /*
   * ⛔ SUBMITTED ONLY. `CLAUDE.md` §6 says both Insight slots compute over
   *    SUBMITTED reports, and the Class Health Summary already does. A draft
   *    is not a published fact about a child.
   */
  CREATE TEMP TABLE _p216_sessions ON COMMIT DROP AS
  SELECT DISTINCT cs.id AS class_session_id, cs.session_date
    FROM public.class_sessions cs
    JOIN public.reports rp ON rp.class_session_id = cs.id
   WHERE cs.class_module_id = p_class_module_id
     AND cs.centre_id = v_centre_id
     AND rp.status = 'submitted';

  SELECT pg_catalog.count(*) INTO v_sessions FROM _p216_sessions;

  /*
   * ⛔ §6's OWN FLOOR: "If fewer than 2 sessions of submitted data exist in
   *    range, this sentence is replaced." ▶ Returned as a ROW carrying a NULL
   *    dimension and the count, NOT as an empty set -- because an empty set
   *    is the REFUSAL signal three gates above, and the caller must be able to
   *    tell "you may not read this" from "there is not enough data yet".
   */
  IF v_sessions < 2 THEN
    RETURN QUERY SELECT NULL::public.dimension_code, v_sessions;
    RETURN;
  END IF;

  v_midpoint := v_sessions / 2;

  /*
   * ⛔ THE AGGREGATION HAPPENS HERE, INSIDE THE DATABASE. That is the ruling,
   *    and it is the same structure `D-2` was permitted on.
   *
   * ⛔ AND THE RESULT IS AN IDENTIFIER, NEVER A VALUE. The per-dimension
   *    means, the halves, and the delta all exist only inside this query; what
   *    crosses the boundary is one `dimension_code` and one count. There is no
   *    column here capable of carrying a rating, a band or a score.
   */
  RETURN QUERY
  WITH ordered AS (
    SELECT class_session_id,
           pg_catalog.row_number() OVER (ORDER BY session_date, class_session_id) AS seq
      FROM _p216_sessions
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

  /*
   * ⚠️ IF NO DIMENSION IMPROVED, THE QUERY ABOVE RETURNS NOTHING and the
   *    caller sees an empty set -- which it cannot distinguish from a refusal.
   *    ▶ Emit the explicit "enough data, no improving dimension" row instead.
   *    `CLAUDE.md` §6 does not specify this case; it is reported to the
   *    Operator rather than resolved silently, and it FAILS TOWARD SAYING
   *    LESS: a NULL dimension renders no sentence naming one.
   */
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

REVOKE ALL ON FUNCTION public.report_class_improved_dimension(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_class_improved_dimension(uuid) TO authenticated;

-- =====================================================================
-- APPLY-TIME ASSERTIONS.
-- ⚠️ §26.1's CEILING APPLIES: apply-time execution proves resolution only up
--    to the FIRST GATE. `PI-6` executes both functions and requires a
--    REFUSAL; the SUITE is the leg that reaches the body as a real caller.
-- =====================================================================
DO $assert$
DECLARE
  v_txt text;
  v_n   integer;
BEGIN
  -- PI-1 the helper exists, is IMMUTABLE, and holds NO grant.
  SELECT p.provolatile::text INTO v_txt
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'competency_score';
  IF v_txt IS DISTINCT FROM 'i' THEN
    RAISE EXCEPTION 'PI-1 FAIL: competency_score volatility is %, expected i (IMMUTABLE)', v_txt;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.role_routine_grants
   WHERE specific_schema = 'public' AND routine_name = 'competency_score'
     AND grantee IN ('authenticated','anon','PUBLIC','service_role');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'PI-1 FAIL: competency_score carries % client grant(s), expected 0', v_n;
  END IF;
  RAISE NOTICE 'PI-1 PASS: competency_score IMMUTABLE, zero client grants';

  -- ⛔ PI-2 THE MAPPING IS IN EXACTLY ONE PLACE. `D-2` requires it, and this
  --    is the assertion that keeps it true as functions are added later.
  -- ⚠️ `prosrc`, NOT `pg_get_functiondef`, AND `prokind = 'f'` FILTERED IN A
  --    SUBQUERY. The first draft called `pg_get_functiondef(p.oid)` in a WHERE
  --    clause alongside the name filter and died on
  --    `"array_agg" is an aggregate function` -- ▶ `pg_get_functiondef`
  --    REFUSES aggregates outright, and a WHERE clause gives no evaluation
  --    order that would have spared it. The subquery forces the filter first.
  SELECT pg_catalog.count(*) INTO v_n
    FROM (
      SELECT p.prosrc
        FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
       WHERE n.nspname = 'public'
         AND p.prokind = 'f'
         AND p.proname <> 'competency_score'
    ) z
   WHERE z.prosrc ~ 'WHEN\s+''mastering''\s+THEN\s+75';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'PI-2 FAIL: % other function(s) inline the D-2 mapping; it must live in competency_score alone', v_n;
  END IF;
  RAISE NOTICE 'PI-2 PASS: the D-2 mapping exists in exactly one place';

  -- ⛔ PI-3 THE RETURNED SHAPE CARRIES NO RATING VALUE, BAND OR SCORE.
  --    Same form as VP-4: pinned string-for-string, so a later widening fails.
  SELECT pg_catalog.pg_get_function_result(p.oid) INTO v_txt
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_class_improved_dimension';
  IF v_txt IS DISTINCT FROM 'TABLE(improved_dimension dimension_code, sessions_considered integer)' THEN
    RAISE EXCEPTION 'PI-3 FAIL: result type is "%"', v_txt;
  END IF;
  RAISE NOTICE 'PI-3 PASS: result type pinned -- one dimension IDENTIFIER and one count';

  -- ⛔ PI-4 …AND NO RATING FAMILY NAME APPEARS IN THAT RESULT TYPE AT ALL.
  IF v_txt ~* '(rating|band|score|beginning|developing|mastering|mastered|percent|avg|delta)' THEN
    RAISE EXCEPTION 'PI-4 FAIL: result type mentions a rating family term: %', v_txt;
  END IF;
  RAISE NOTICE 'PI-4 PASS: no rating value, band or score can cross this boundary';

  -- PI-5 exactly one client grant, and it is EXECUTE to authenticated.
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.role_routine_grants
   WHERE specific_schema = 'public' AND routine_name = 'report_class_improved_dimension'
     AND grantee = 'authenticated' AND privilege_type = 'EXECUTE';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'PI-5 FAIL: expected exactly 1 EXECUTE grant to authenticated, found %', v_n;
  END IF;
  RAISE NOTICE 'PI-5 PASS: one EXECUTE grant, to authenticated';

  -- ⛔ PI-6 EXECUTE BOTH FUNCTIONS. As `postgres` there is no account, so the
  --    first gate refuses and returns zero rows -- a traversal that writes
  --    nothing. ⚠️ This proves RESOLUTION TO THE FIRST GATE ONLY (§26.1).
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.report_class_improved_dimension('00000000-0000-4000-8000-000000000000'::uuid);
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'PI-6 FAIL: an unauthenticated caller got % row(s), expected 0', v_n;
  END IF;
  PERFORM public.competency_score('mastering'::public.competency_rating);
  RAISE NOTICE 'PI-6 PASS: both functions EXECUTE and the read fails closed at its first gate';

  -- PI-7 census unmoved.
  SELECT pg_catalog.count(*) INTO v_n FROM information_schema.tables
   WHERE table_schema='public' AND table_type='BASE TABLE';
  IF v_n <> 30 THEN RAISE EXCEPTION 'PI-7 FAIL: % tables, expected 30', v_n; END IF;
  SELECT pg_catalog.array_length(public.audit_action_registry(),1) INTO v_n;
  IF v_n <> 23 THEN RAISE EXCEPTION 'PI-7 FAIL: registry %, expected 23', v_n; END IF;
  RAISE NOTICE 'PI-7 PASS: 30 tables, registry 23 -- no table, enum, policy or audit string added';
END;
$assert$;

COMMIT;
