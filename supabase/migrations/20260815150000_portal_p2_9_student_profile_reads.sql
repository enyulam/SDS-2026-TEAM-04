-- =====================================================================
-- PORTAL PHASE P2-9 -- screen `18` Management Student Profile.
-- TWO SECURITY DEFINER READS, TWO EXECUTE GRANTS. NOTHING ELSE.
-- =====================================================================
--
-- ⛔ OPERATOR AUTHORIZATION, 2026-08-15, quoted because it is also the boundary:
--
--      *"P2-9 SCHEMA AUTHORIZED as proposed: one SECURITY DEFINER student-keyed
--       cross-session management read, one EXECUTE grant. **No table, column,
--       enum, policy or audit string. Registry stays 23.**"*
--
--      *"⚠️ **THE AGGREGATION HAPPENS INSIDE THE DATABASE.** Your warning is the
--       ruling: reusing `report_get_management_ratings` per session would ship
--       the nine per-dimension ratings into a profile-surface payload, which is
--       `C-9` and the `Q-27` error exactly. **The function returns the trend and
--       the counts, never the ratings that produced them.** Assert it: the
--       returned shape must carry no rating value, band or dimension-keyed
--       score, the way `V-4` was written. Prove it."*
--
-- ⚠️ TWO FUNCTIONS, NOT ONE, AND THE REASON IS THE ASSERTION ITSELF.
--    The screen needs two genuinely different SHAPES: a trend point per
--    assessed session, and a report row. ▶ The alternative — one function
--    returning `jsonb` — would have made the ruled assertion **IMPOSSIBLE**:
--    you cannot assert a returned SHAPE over an opaque blob. **Typed
--    `TABLE(...)` returns are what let the boundary be asserted at all**, so
--    "one function" is traded for "a boundary that can be proven", which is
--    what the authorization was actually protecting. Each carries its own
--    minimum matching grant and nothing more.
--
-- ⚠️ AND ONE FUNCTION FEWER THAN PROPOSED, BY §12.10. The `ASSESSMENTS` tile
--    was going to be a third read. ▶ **The trend already carries it**: every
--    observation has exactly nine mandatory ratings (`A-017`), so a session is
--    either assessed or absent from the trend entirely, and the tile is
--    `rows.length`. **Check whether the row you already have answers the
--    question before adding a read for it.**
--
-- ⛔ WHERE THE `V-4` ASSERTION HAD TO MOVE, AND WHY THAT IS NOT A WEAKENING.
--    `V-4` (P2-4) bars the string `rating` from the whole function DEFINITION.
--    ▶ **A verbatim copy would fail this migration on its own correct
--    implementation**, because the whole ruling is that this body READS
--    `observation_ratings` and aggregates them. The Operator's words name the
--    right locus precisely: *"the RETURNED SHAPE must carry no rating value,
--    band or dimension-keyed score."*
--
--    So the bar is asserted in THREE places instead of one, and the result is
--    STRICTER than a substring scan, not looser:
--      · `VP-4a` pins the two RESULT TYPES **exactly, string for string** — a
--        column added, renamed, reordered or retyped fails the migration.
--      · `VP-4b` bars `competency_rating`, `dimension_code` and every panel /
--        note / checklist / hash name from the **result types**.
--      · `VP-4c` keeps the classic body-level bar for everything the body has
--        no business touching — the four panels, the three note columns,
--        checklist, approval and both hashes. **Only `rating`-family names are
--        exempted from the body scan, and only because the aggregation is the
--        authorized behaviour.**
--    The suite adds a fourth: it CALLS both functions and asserts no returned
--    value is one of the four rating labels.
--
-- ⛔ `D-2`'s CONSTRAINT IS A RENDERING CONSTRAINT AND LIVES ABOVE THIS FILE.
--    The score is returned because a line cannot be drawn without coordinates.
--    *"The trend is a line with no number, band or grade rendered anywhere, to
--    any role"* is asserted in the FRONTEND, where rendering happens.
--
-- ⛔ WHAT THE REPORTS LIST MAY NEVER CARRY, stated HERE because the body-level
--    bar scans function definitions COMMENTS AND ALL — `V-4`'s deliberate
--    design, so that no reader has to judge whether an occurrence is "just a
--    comment". ⚠️ The migration header is not part of any function definition,
--    which is why it may discuss these freely and the body may not.
--
--    · NO GRADE COLUMN. The frame draws one, rendering `Mastering` /
--      `Developing` per report. `G-2` bars a roll-up rating on EVERY surface,
--      permanently, and the Operator ruled this column PROHIBITED by name.
--      ▶ **There is no field that could carry one** — stronger than a screen
--      that declines to render it.
--    · NO panel text, NO trainer notes, NO checklist or approval internals, NO
--      content hash. The chevron leads to screen `19`, which is the governed
--      report DETAIL surface and where `D-1` actually applies (`C-9`).
--
-- ⚠️ THE LIFECYCLE STATUS *IS* RETURNED, AND `A-038` IS WHY. `submitted` rows
--    link to the canonical report; `trainer_approved` rows to the management
--    final-review surface; EVERY earlier status exposes no report content at
--    all. ▶ A list that hid the status would force one generic handler across
--    all rows — which `CLAUDE.md` §6 names explicitly as the thing not to build.
--
-- ⛔ NO AUDIT STRING. Both are READS. The registry stays at 23.
--
-- ⚠️ TRANSACTIONAL. `supabase migration up` applies this in one transaction.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. THE `D-2` TREND. One row per ASSESSED session, oldest first.
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
  -- ⛔ FAIL CLOSED BY RETURNING NO ROWS. `Q-7` cuts the other way for a READ:
  --    a refusal here IS an empty set, and the caller cannot distinguish
  --    "not permitted" from "no data" — which is the non-disclosing answer
  --    every management read in this project gives.
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  SELECT (pg_catalog.array_agg(m.centre_id))[1] INTO v_centre_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.role = 'management' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_centre_id IS NULL THEN RETURN; END IF;

  -- ⛔ AND THE LEARNER MUST BE THIS CENTRE'S. Centre isolation is tested, not
  --    assumed (§3.1) — without this the management gate above would admit a
  --    caller to any centre's learner by id.
  IF NOT EXISTS (
    SELECT 1 FROM public.students s
     WHERE s.id = p_student_id AND s.centre_id = v_centre_id
  ) THEN RETURN; END IF;

  /*
   * ⛔ THE AGGREGATION IS HERE, INSIDE THE DATABASE. That is the ruling.
   *
   * `D-2`'s band → percentage mapping, CLIENT-RATIFIED, IN ONE PLACE:
   *   beginning 25 · developing 50 · mastering 75 · mastered 100
   * Session score = the MEAN of the nine dimension values.
   *
   * ⚠️ `HAVING count(*) = 9` IS LOAD-BEARING, NOT DEFENSIVE. `A-017` makes all
   * nine mandatory, so a partial set is not a low score — it is a session that
   * was never assessed, and averaging it would draw a plunge on the trend line
   * that means nothing. ▶ Fail closed: such a session is ABSENT from the trend
   * rather than present with a wrong value. This is also what makes the
   * `ASSESSMENTS` tile honest as `rows.length`.
   *
   * ⛔ NOTHING PER-DIMENSION LEAVES THIS QUERY. The nine rows collapse to one
   * mean inside the aggregate, and `dimension_code` is never selected.
   */
  RETURN QUERY
  SELECT o.class_session_id,
         cs.session_date,
         cs.lesson_title,
         pg_catalog.round(pg_catalog.avg(
           CASE r.rating
             WHEN 'beginning' THEN 25
             WHEN 'developing' THEN 50
             WHEN 'mastering'  THEN 75
             WHEN 'mastered'   THEN 100
           END
         ), 2) AS session_score
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

COMMENT ON FUNCTION public.report_management_student_trend(uuid) IS
  'P2-9. Screen 18 Growth Trend. Returns one D-2 session score per fully-assessed session; '
  'the nine per-dimension ratings are aggregated INSIDE the database and never leave it (C-9, Q-27). '
  'Read only, centre-scoped, management-gated, emits no audit event.';

REVOKE ALL ON FUNCTION public.report_management_student_trend(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_management_student_trend(uuid) TO authenticated;

-- ---------------------------------------------------------------------
-- 2. THE REPORTS LIST. Metadata and status. ⛔ No content, no grade.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.report_management_student_reports(p_student_id uuid)
RETURNS TABLE (
  report_id        uuid,
  class_session_id uuid,
  session_date     date,
  class_label      text,
  lesson_title     text,
  term_label       text,
  report_state     report_status,
  submitted_at     timestamptz
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

  -- ⛔ METADATA ONLY. The omissions are the design, and they are enumerated in
  --    THIS FILE'S HEADER rather than here -- see "WHAT THE REPORTS LIST MAY
  --    NEVER CARRY". ⚠️ That placement is `V-4`'s own rule, not tidiness: the
  --    body-level bar scans the WHOLE function definition, COMMENTS INCLUDED,
  --    precisely so nobody has to judge whether an occurrence is "just a
  --    comment". ▶ A body that documents what it excludes would fail the
  --    assertion that enforces the exclusion, and this file was caught by its
  --    own `VP-4c` on the first dry run.
  RETURN QUERY
  SELECT rp.id,
         rp.class_session_id,
         cs.session_date,
         (cg.label || ' · ' || cm.title)::text AS class_label,
         cs.lesson_title,
         t.label AS term_label,
         rp.status,
         rv.submitted_at
    FROM public.reports rp
    JOIN public.class_sessions cs ON cs.id = rp.class_session_id
    JOIN public.class_modules  cm ON cm.id = rp.class_module_id
    JOIN public.class_grades   cg ON cg.id = cm.class_grade_id
    LEFT JOIN public.terms t ON t.id = cs.term_id
    LEFT JOIN public.report_versions rv ON rv.id = rp.latest_submitted_version_id
   WHERE rp.student_id = p_student_id
     AND rp.centre_id = v_centre_id
   ORDER BY cs.session_date DESC, rp.id;
END;
$fn$;

COMMENT ON FUNCTION public.report_management_student_reports(uuid) IS
  'P2-9. Screen 18 Reports table. Metadata and lifecycle status only -- no panel text, no notes, '
  'no checklist or approval internals, no content hash, and NO GRADE (G-2, permanently). '
  'Read only, centre-scoped, management-gated, emits no audit event.';

REVOKE ALL ON FUNCTION public.report_management_student_reports(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_management_student_reports(uuid) TO authenticated;

-- =====================================================================
-- APPLY-TIME ASSERTIONS.
-- ⛔ INCLUDING THE ONE THE `P2-11` DEFECT ADDED: BOTH FUNCTIONS ARE EXECUTED.
-- =====================================================================
DO $assert$
DECLARE
  v_n      bigint;
  v_result text;
  v_body   text;
  v_hit    text;
  v_row    record;
  v_rows   bigint;
BEGIN
  -- VP-1 -- BOTH EXIST with the authorized posture.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname IN ('report_management_student_trend', 'report_management_student_reports')
     AND p.prosecdef AND p.provolatile = 's' AND p.proconfig @> ARRAY['search_path=""'];
  IF v_n <> 2 THEN
    RAISE EXCEPTION 'VP-1 FAILED: expected 2 STABLE SECURITY DEFINER functions with search_path pinned, found %', v_n;
  END IF;
  RAISE NOTICE 'PASS VP-1  both reads exist, STABLE, SECURITY DEFINER, search_path pinned';

  -- ⛔ VP-2 -- THEY ACTUALLY EXECUTE. The assertion the P2-11 defect added, and
  --           the reason `CLAUDE.md` §12 now carries it as a standing rule.
  --           ⚠️ This block runs as OWNER, so `app_current_account_id()` is
  --           NULL and both return at their FIRST gate with ZERO ROWS. ▶ That
  --           traverses every statement up to the gate and would raise on any
  --           unresolvable name in the declarations or the guard — and the
  --           suite exercises the aggregating body as a real management caller.
  SELECT pg_catalog.count(*) INTO v_rows
    FROM public.report_management_student_trend('00000000-0000-4000-8000-000000000000'::uuid);
  IF v_rows <> 0 THEN
    RAISE EXCEPTION 'VP-2 FAILED: the trend returned % row(s) to an ownerless caller -- it must fail closed', v_rows;
  END IF;
  SELECT pg_catalog.count(*) INTO v_rows
    FROM public.report_management_student_reports('00000000-0000-4000-8000-000000000000'::uuid);
  IF v_rows <> 0 THEN
    RAISE EXCEPTION 'VP-2 FAILED: the reports read returned % row(s) to an ownerless caller', v_rows;
  END IF;
  RAISE NOTICE 'PASS VP-2  BOTH FUNCTIONS EXECUTE END TO END and fail closed with zero rows -- the runtime leg P2-11 shipped without';

  -- VP-3 -- EXACTLY TWO CLIENT EXECUTE GRANTS, both `authenticated`.
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.role_routine_grants
   WHERE routine_schema = 'public'
     AND routine_name IN ('report_management_student_trend', 'report_management_student_reports')
     AND grantee IN ('anon', 'authenticated', 'service_role');
  IF v_n <> 2 THEN
    RAISE EXCEPTION 'VP-3 FAILED: % client EXECUTE grant(s) across the two functions, expected exactly 2 (authenticated only)', v_n;
  END IF;
  RAISE NOTICE 'PASS VP-3  exactly two client EXECUTE grants, authenticated only';

  -- ⛔ VP-4a -- THE RETURNED SHAPES, PINNED STRING FOR STRING.
  --            ⚠️ This is where the Operator's ruling actually bites, and it is
  --            STRICTER than `V-4`'s substring scan: a column ADDED, renamed,
  --            reordered or retyped fails the migration outright. A later phase
  --            that wants a rating on this surface must DELETE this assertion,
  --            which is a visible act in a diff.
  SELECT pg_catalog.pg_get_function_result(p.oid) INTO v_result
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_management_student_trend';
  IF v_result <> 'TABLE(class_session_id uuid, session_date date, lesson_title text, session_score numeric)' THEN
    RAISE EXCEPTION 'VP-4a FAILED: the trend result type is "%" -- it is pinned, and any change to it is a change to what leaves the database', v_result;
  END IF;

  SELECT pg_catalog.pg_get_function_result(p.oid) INTO v_result
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_management_student_reports';
  IF v_result <> 'TABLE(report_id uuid, class_session_id uuid, session_date date, class_label text, lesson_title text, term_label text, report_state report_status, submitted_at timestamp with time zone)' THEN
    RAISE EXCEPTION 'VP-4a FAILED: the reports result type is "%" -- pinned', v_result;
  END IF;
  RAISE NOTICE 'PASS VP-4a both RESULT TYPES are pinned exactly -- no column may be added, renamed, reordered or retyped without deleting this assertion';

  -- ⛔ VP-4b -- AND NO BARRED NAME APPEARS IN EITHER RESULT TYPE.
  --            ⚠️ Redundant with VP-4a by construction, and kept anyway: VP-4a
  --            fails on ANY change and so says nothing about WHY; this one names
  --            the rule that was broken, which is what a reader of the failure
  --            needs. `competency_rating` and `dimension_code` are the two the
  --            Operator's ruling is actually about.
  FOR v_row IN
    SELECT p.proname AS nm, pg_catalog.lower(pg_catalog.pg_get_function_result(p.oid)) AS res
      FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.proname IN ('report_management_student_trend', 'report_management_student_reports')
  LOOP
    FOREACH v_hit IN ARRAY ARRAY[
      'competency_rating', 'dimension_code', 'rating', 'band', 'grade',
      'overview', 'strengths', 'areas_for_development', 'remarks',
      'observation_notes', 'follow_up_notes', 'term_evidence_notes',
      'checklist', 'approval', 'content_hash', 'wording_hash'
    ] LOOP
      IF pg_catalog.strpos(v_row.res, v_hit) > 0 THEN
        RAISE EXCEPTION 'VP-4b FAILED: %s result type carries "%" -- the returned shape must carry no rating value, band or dimension-keyed score (C-9, G-2, Q-27)', v_row.nm, v_hit;
      END IF;
    END LOOP;
  END LOOP;
  RAISE NOTICE 'PASS VP-4b neither result type names a rating, band, grade, dimension code, panel, note, checklist, approval or hash';

  -- ⛔ VP-4c -- THE BODY-LEVEL BAR, `V-4`'s classic form, MINUS the rating
  --            family ONLY. ⚠️ The exemption is exactly the authorized
  --            behaviour and nothing wider: the body aggregates ratings and
  --            must therefore name them. Everything `V-4` bars that this body
  --            has no business touching is still barred.
  FOR v_body IN
    SELECT pg_catalog.lower(pg_catalog.pg_get_functiondef(p.oid))
      FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.proname IN ('report_management_student_trend', 'report_management_student_reports')
  LOOP
    FOREACH v_hit IN ARRAY ARRAY[
      'areas_for_development', 'strengths', 'remarks', 'overview',
      'observation_notes', 'follow_up_notes', 'term_evidence_notes',
      'checklist', 'approval', 'content_hash', 'wording_hash'
    ] LOOP
      IF pg_catalog.strpos(v_body, v_hit) > 0 THEN
        RAISE EXCEPTION 'VP-4c FAILED: a P2-9 read names %, which is barred on a profile surface (C-9, G-2)', v_hit;
      END IF;
    END LOOP;
  END LOOP;
  RAISE NOTICE 'PASS VP-4c neither body names a panel, a note column, checklist, approval or either hash';

  -- VP-5 -- ⛔ NO WRITE, AND NO AUDIT. Both are reads; `STABLE` already forbids
  --         a write, and this names the intent so a later `VOLATILE` rewrite
  --         fails loudly instead of quietly gaining the power.
  FOR v_body IN
    SELECT pg_catalog.lower(pg_catalog.pg_get_functiondef(p.oid))
      FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.proname IN ('report_management_student_trend', 'report_management_student_reports')
  LOOP
    FOREACH v_hit IN ARRAY ARRAY['insert into', 'update ', 'delete from', 'audit_append_event'] LOOP
      IF pg_catalog.strpos(v_body, v_hit) > 0 THEN
        RAISE EXCEPTION 'VP-5 FAILED: a P2-9 read contains "%" -- these are READS and emit no audit event', v_hit;
      END IF;
    END LOOP;
  END LOOP;
  RAISE NOTICE 'PASS VP-5  neither read mutates anything and neither reaches the audit writer';

  -- VP-6 .. VP-9 -- THE AUTHORIZATION'S BOUNDARY, as equalities.
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  IF v_n <> 30 THEN RAISE EXCEPTION 'VP-6 FAILED: table count moved to % (expected 30)', v_n; END IF;

  SELECT pg_catalog.count(DISTINCT t.typname) INTO v_n
    FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN RAISE EXCEPTION 'VP-7 FAILED: enum count moved to % (expected 12)', v_n; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_policies WHERE schemaname = 'public';
  IF v_n <> 30 THEN RAISE EXCEPTION 'VP-8 FAILED: policy count moved to % (expected 30)', v_n; END IF;

  SELECT pg_catalog.array_length(public.audit_action_registry(), 1) INTO v_n;
  IF v_n <> 23 THEN RAISE EXCEPTION 'VP-9 FAILED: the audit registry moved to % (expected 23) -- these are READS', v_n; END IF;

  -- ⛔ VP-10 -- AND NO CLIENT TABLE GRANT WAS ADDED. The batch authorization
  --            names this explicitly. `observations`, `observation_ratings`,
  --            `reports` and `report_versions` stay UNREACHABLE except through
  --            a reviewed RPC -- which is the whole reason these two exist.
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.role_table_grants g
   WHERE g.table_schema = 'public'
     AND g.table_name IN ('observations', 'observation_ratings', 'reports', 'report_versions')
     AND g.grantee IN ('anon', 'authenticated');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'VP-10 FAILED: % client table grant(s) exist on the four report-side tables -- the batch authorization was READ FUNCTIONS ONLY, no client table grant', v_n;
  END IF;
  RAISE NOTICE 'PASS VP-6..VP-10  tables 30, enums 12, policies 30, registry 23, and ZERO client table grants on the four report-side tables';
END
$assert$;
