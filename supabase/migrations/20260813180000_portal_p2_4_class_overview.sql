-- ============================================================================
-- PORTAL COMPLETION PLAN — phase `P2-4` · screen `13` Management Class Overview
-- ============================================================================
--
-- Operator authorization, 2026-08-13:
--
--   "SCHEMA AUTHORIZED — two SECURITY DEFINER read RPCs, exactly as proposed:
--    report_list_management_class_status and report_class_health_summary. Two
--    EXECUTE grants to authenticated. Zero new table, column, enum, policy or
--    write grant. Registry unmoved at 21."
--
-- ⛔ WHY A FUNCTION EXISTS AT ALL, MEASURED BEFORE IT WAS PROPOSED.
--    `reports`, `observations` and `report_evidence` each carry **ZERO
--    policies and ZERO client grants** at HEAD. Screen `13` therefore CANNOT
--    be built as a direct client read the way `P2-1`'s screen `12` was: the
--    per-row status gating `CLAUDE.md` §6 and `A-038` ratify is unreachable,
--    and so are the Class Health Summary's counts. ▶ Two reviewed
--    `SECURITY DEFINER` reads are the minimum that makes the ratified rule
--    buildable, and they are reads — **no write policy and no write grant**,
--    so "zero write policies, zero write grants" survives this migration too.
--
-- ⛔ THE AUDIT REGISTRY IS **NOT** EXTENDED. Assertion `V-1` fails the build
--    if it moves off 21. These are READS: `A-029` counts governed ACTIONS,
--    and reading a projection is not one. ⚠️ In particular a **COUNT of
--    evidence rows is not a REVIEW**: it mints no signed URL, so it fires no
--    `evidence.accessed` (`A-057`). That distinction is MEASURED by the
--    suite's `P26-9`, not merely reasoned about here.
--
-- ============================================================================
-- ⛔ WHAT THESE FUNCTIONS MAY NEVER RETURN — ASSERTED STRUCTURALLY (`V-4`)
-- ============================================================================
--
-- Operator: *"Assert the bars structurally … I want a leg that fails if any
-- of them appears — the way `E1` and `E9` were written, so a later phase
-- cannot add one quietly."*
--
--   ⛔ NO PANEL TEXT      — `overview`, `strengths`, `areas_for_development`,
--                           `remarks`. `13` is an OVERVIEW, not a report.
--   ⛔ NO TRAINER NOTES   — `observation_notes`, `follow_up_notes`,
--                           `term_evidence_notes` (`A-021`, `A-038`).
--   ⛔ NO CHECKLIST       — `report_version_checklist_progress` and its three
--                           booleans; they attest to a specific text.
--   ⛔ NO APPROVAL INTERNALS — `report_version_approvals`.
--   ⛔ NO CONTENT HASH    — `content_hash`; `CLAUDE.md` §6 bars returning it
--                           to management, and `D-1` did not move it.
--   ⛔ NO RATING OF ANY KIND — `competency_rating`, `observation_ratings`,
--                           `report_version_ratings`. **`C-9` confines
--                           `D-1`'s nine per-dimension ratings to report
--                           DETAIL surfaces**, and an overview is not one.
--                           `G-2`'s roll-up bar is absolute on every surface.
--
-- `V-4` greps the two function bodies for every one of those names and
-- **FAILS THE MIGRATION** on a match. ▶ It is written so that a later phase
-- adding one has to delete an assertion to do it.
--
-- ============================================================================
-- ⚠️ DESIGN RULING — the follow-up area is COMPUTED SERVER-SIDE, and returns
--    ONE STRING. Do not "improve" this by returning the underlying tags.
-- ============================================================================
--
-- `CLAUDE.md` §6 defines the Class Health Summary's *main follow-up area* as
-- the most frequently recurring improvement-focus tag across this class's
-- **submitted** reports. Those tags live in `observations.focus_chips` —
-- **trainer observation data management may not read** (`A-021`, `A-038`).
--
-- Operator ruling, 2026-08-13, recorded with its reasoning **so no later
-- phase reverses it while believing it is adding a feature**:
--
--   "Compute the winning tag server-side and return ONE string. Your
--    reasoning decides it: the alternative hands management every report's
--    focus_chips to produce a one-line answer, which discloses far more than
--    the rule needs. **Minimise what crosses the boundary, not what is
--    displayed.**"
--
-- ⛔ A "richer breakdown" — per-tag counts, a ranked list, the tags
--    themselves — is therefore **PROHIBITED**, and is a `CLAUDE.md` §12
--    stop-and-ask rather than an enhancement. The aggregation happens
--    **inside** this function precisely so that the per-child data never
--    leaves the database.
--
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. The per-student report status behind `A-038`'s per-row action gating.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.report_list_management_class_status(
  p_class_module_id uuid
)
RETURNS TABLE (
  class_session_id     uuid,
  session_date         date,
  lesson_number        smallint,
  lesson_title         text,
  student_id           uuid,
  student_display_name text,
  report_id            uuid,
  report_state         report_status,
  evidence_count       integer
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_account_id uuid;
  v_centre_id  uuid;
  v_module_id  uuid;
BEGIN
  -- 1. Identity. NULL for unauthenticated, unlinked, deactivated or an
  --    ambiguous multi-account match. The helper treats ambiguity as no
  --    identity and so does this function.
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN
    RETURN;
  END IF;

  -- 2. Live authority AND centre scope from the SAME row. Exactly one active
  --    management membership; zero or two-or-more both deny. Because the
  --    centre COMES FROM this row there is no path that reads a centre the
  --    caller does not currently manage.
  SELECT (pg_catalog.array_agg(m.centre_id))[1]
    INTO v_centre_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id
     AND m.role       = 'management'
     AND m.status     = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_centre_id IS NULL THEN
    RETURN;
  END IF;

  -- 3. ⛔ THE MODULE IS RE-RESOLVED INSIDE THE CALLER'S CENTRE, never trusted
  --    from the parameter. A module that does not exist and one belonging to
  --    another centre both resolve to NULL and return ZERO ROWS — the caller
  --    cannot tell them apart, which is the same non-disclosure the read RPCs
  --    on screens `26` and `27` already hold.
  SELECT cm.id INTO v_module_id
    FROM public.class_modules cm
   WHERE cm.id        = p_class_module_id
     AND cm.centre_id = v_centre_id
     AND cm.is_active;
  IF v_module_id IS NULL THEN
    RETURN;
  END IF;

  -- 4. The projection: every SESSION of the module × every ACTIVE ENROLMENT,
  --    LEFT JOINed to the report.
  --
  --    ⚠️ A LEFT JOIN IS THE WHOLE POINT. `A-038` gives `No Report` rows NO
  --    action button at all, so "there is no report" must be a ROW rather
  --    than a missing one — otherwise the surface could not distinguish
  --    *no report* from *a learner who is not enrolled*. `report_id` and
  --    `report_state` are NULL there, and **NULL means NOT RECORDED** (hero
  --    0B): the surface omits the control rather than inventing a status.
  --
  --    `evidence_count` is a COUNT and nothing else. ⛔ It mints no signed
  --    URL, returns no object path and names no file — a count is not a
  --    review, so no `evidence.accessed` is emitted (`A-057`, measured by
  --    `P26-9`).
  RETURN QUERY
  SELECT
    cs.id,
    cs.session_date,
    cs.lesson_number,
    cs.lesson_title,
    st.id,
    st.full_name,
    r.id,
    r.status,
    (
      SELECT pg_catalog.count(*)::integer
        FROM public.report_evidence re
       WHERE re.report_id = r.id
    )
  FROM public.class_sessions cs
  JOIN public.enrolments     en ON en.class_module_id = cs.class_module_id
                              AND en.is_active
  JOIN public.students       st ON st.id = en.student_id
  LEFT JOIN public.reports    r ON r.class_session_id = cs.id
                              AND r.student_id        = st.id
 WHERE cs.class_module_id = v_module_id
   AND cs.centre_id       = v_centre_id
 ORDER BY cs.session_date, cs.id, st.full_name, st.id;
END;
$$;

COMMENT ON FUNCTION public.report_list_management_class_status(uuid) IS
  'P2-4 / screen 13. Per-session, per-enrolled-student REPORT STATUS for one '
  'class module, for the A-038 per-row action gating. Returns status only: no '
  'panel text, no trainer note, no checklist or approval internal, no content '
  'hash and NO RATING (C-9). NULL report_id/report_state means No Report.';

-- ---------------------------------------------------------------------------
-- 2. The Class Health Summary's inputs — `C-17`, a governance-mandated panel
--    the frame omits.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.report_class_health_summary(
  p_class_module_id uuid
)
RETURNS TABLE (
  pending_reports      integer,
  evidence_missing     integer,
  submitted_reports    integer,
  total_reports        integer,
  main_follow_up_area  text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_account_id uuid;
  v_centre_id  uuid;
  v_module_id  uuid;
BEGIN
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN
    RETURN;
  END IF;

  SELECT (pg_catalog.array_agg(m.centre_id))[1]
    INTO v_centre_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id
     AND m.role       = 'management'
     AND m.status     = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_centre_id IS NULL THEN
    RETURN;
  END IF;

  SELECT cm.id INTO v_module_id
    FROM public.class_modules cm
   WHERE cm.id        = p_class_module_id
     AND cm.centre_id = v_centre_id
     AND cm.is_active;
  IF v_module_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    -- "Pending" is every report that has NOT reached `submitted`. ⚠️ The four
    -- conditions in `CLAUDE.md` §6 are evaluated in the APPLICATION, top to
    -- bottom, first match wins; this function supplies their INPUTS and
    -- decides nothing. Splitting it that way keeps the ratified condition
    -- table in one readable place instead of encoded twice.
    (SELECT pg_catalog.count(*)::integer
       FROM public.reports r
      WHERE r.class_module_id = v_module_id
        AND r.centre_id       = v_centre_id
        AND r.status <> 'submitted'),
    -- "Evidence missing" counts SUBMITTED reports carrying no evidence row.
    -- ⛔ A COUNT, never a listing: no object path, no file name, no signed
    -- URL, so no `evidence.accessed`.
    (SELECT pg_catalog.count(*)::integer
       FROM public.reports r
      WHERE r.class_module_id = v_module_id
        AND r.centre_id       = v_centre_id
        AND r.status          = 'submitted'
        AND NOT EXISTS (SELECT 1 FROM public.report_evidence re WHERE re.report_id = r.id)),
    (SELECT pg_catalog.count(*)::integer
       FROM public.reports r
      WHERE r.class_module_id = v_module_id
        AND r.centre_id       = v_centre_id
        AND r.status          = 'submitted'),
    (SELECT pg_catalog.count(*)::integer
       FROM public.reports r
      WHERE r.class_module_id = v_module_id
        AND r.centre_id       = v_centre_id),
    -- ⛔ THE WINNING TAG, COMPUTED HERE, RETURNED AS ONE STRING.
    --
    --    Operator ruling (see the header): *"Minimise what crosses the
    --    boundary, not what is displayed."* The per-child `focus_chips` are
    --    unnested, counted and reduced to a single label INSIDE the database,
    --    so no observation data ever leaves it.
    --
    --    ⚠️ `SUBMITTED reports only`, exactly as `CLAUDE.md` §6 says — and
    --    the same computation screen `16`'s Management Insight must reuse, so
    --    the two surfaces state one fact one way.
    --
    --    ⚠️ NULL when there is nothing to count. **NULL means NOT RECORDED**
    --    (hero 0B): the surface omits the line rather than printing a
    --    fabricated focus area.
    --
    --    The `count DESC, chip ASC` order makes ties DETERMINISTIC. A tie
    --    broken by whatever the planner returned first would make this panel
    --    flicker between two equally-true answers on identical data.
    (SELECT chip
       FROM (
         SELECT pg_catalog.unnest(o.focus_chips) AS chip
           FROM public.observations o
           JOIN public.reports      r ON r.observation_id = o.id
          WHERE r.class_module_id = v_module_id
            AND r.centre_id       = v_centre_id
            AND r.status          = 'submitted'
       ) tags
      WHERE chip IS NOT NULL AND pg_catalog.btrim(chip) <> ''
      GROUP BY chip
      ORDER BY pg_catalog.count(*) DESC, chip ASC
      LIMIT 1);
END;
$$;

COMMENT ON FUNCTION public.report_class_health_summary(uuid) IS
  'P2-4 / screen 13, C-17. Inputs for the Class Health Summary CLAUDE.md 6 '
  'mandates: three counts plus the single most frequent improvement-focus tag '
  'across SUBMITTED reports, computed server-side and returned as ONE string '
  'by Operator ruling. Returning the underlying tags is prohibited.';

-- ---------------------------------------------------------------------------
-- 3. Grants — the two authorized EXECUTEs, and nothing else.
-- ---------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.report_list_management_class_status(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.report_class_health_summary(uuid)         FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_list_management_class_status(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_class_health_summary(uuid)         TO authenticated;

-- ===========================================================================
-- ASSERTIONS. ⛔ Each FAILS THE MIGRATION; none of them is advisory.
-- ===========================================================================
DO $$
DECLARE
  v_n   integer;
  v_hit text;
  v_body text;
BEGIN
  -- V-1 — ⛔ THE AUDIT REGISTRY IS UNMOVED. These are reads.
  IF pg_catalog.array_length(public.audit_action_registry(), 1) <> 21 THEN
    RAISE EXCEPTION 'P2-4 assertion V-1 failed: audit registry is %, expected 21 — this migration adds NO governed action',
      pg_catalog.array_length(public.audit_action_registry(), 1);
  END IF;

  -- V-2 — both functions exist, are STABLE, SECURITY DEFINER and pin search_path.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname IN ('report_list_management_class_status', 'report_class_health_summary')
     AND p.provolatile = 's'
     AND p.prosecdef
     AND pg_catalog.array_to_string(p.proconfig, ',') LIKE '%search_path=%';
  IF v_n <> 2 THEN
    RAISE EXCEPTION 'P2-4 assertion V-2 failed: % of 2 functions are STABLE SECURITY DEFINER with a pinned search_path', v_n;
  END IF;

  -- V-3 — exactly the two authorized EXECUTE grants, and no others to a
  --       client role. `anon` gets nothing.
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.role_routine_grants
   WHERE routine_schema = 'public'
     AND routine_name IN ('report_list_management_class_status', 'report_class_health_summary')
     AND grantee IN ('anon', 'authenticated', 'service_role');
  IF v_n <> 2 THEN
    RAISE EXCEPTION 'P2-4 assertion V-3 failed: % client EXECUTE grant(s) across the two functions, expected exactly 2 (authenticated only)', v_n;
  END IF;

  -- V-4 — ⛔ THE STRUCTURAL BARS, in the shape the Operator asked for.
  --
  --       Every name below is something an overview surface must never
  --       carry. A later phase that wants one has to DELETE this assertion,
  --       which is a visible act in a diff rather than a quiet addition.
  --
  --       ⚠️ `rating` is matched as a bare substring ON PURPOSE, so it also
  --       catches `report_version_ratings`, `observation_ratings` and
  --       `competency_rating` without enumerating them.
  --       ⚠️ THE WHOLE DEFINITION IS SEARCHED, COMMENTS INCLUDED, AND THAT
  --       IS DELIBERATE. A narrower scan would have to decide whether an
  --       occurrence is a real reference or "just a comment", and that
  --       judgement is exactly where a barred name gets waved through. The
  --       rule is therefore the blunt one: these functions may not so much
  --       as MENTION the names below. The migration HEADER discusses them
  --       freely, because it is not part of any function definition.
  FOR v_body IN
    SELECT pg_catalog.lower(pg_catalog.pg_get_functiondef(p.oid))
      FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.proname IN ('report_list_management_class_status', 'report_class_health_summary')
  LOOP
    FOREACH v_hit IN ARRAY ARRAY[
      'areas_for_development', 'strengths', 'remarks', 'overview',
      'observation_notes', 'follow_up_notes', 'term_evidence_notes',
      'checklist', 'approval', 'content_hash', 'wording_hash',
      'rating'
    ] LOOP
      IF pg_catalog.strpos(v_body, v_hit) > 0 THEN
        RAISE EXCEPTION 'P2-4 assertion V-4 failed: an overview RPC names %, which is barred on this surface (A-038, C-9, G-2, CLAUDE.md section 6)', v_hit;
      END IF;
    END LOOP;
  END LOOP;

  -- V-5 — ⛔ NO WRITE. Neither function may INSERT, UPDATE, DELETE, or reach
  --       the audit writer. A read RPC that mutates is the defect this
  --       project has guarded against since Step 7I.
  FOR v_body IN
    SELECT pg_catalog.lower(pg_catalog.pg_get_functiondef(p.oid))
      FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.proname IN ('report_list_management_class_status', 'report_class_health_summary')
  LOOP
    IF v_body LIKE '%insert into%'
       OR v_body LIKE '%update public.%'
       OR v_body LIKE '%delete from%'
       OR pg_catalog.strpos(v_body, 'audit_append_event') > 0
       OR pg_catalog.strpos(v_body, 'evidence_record_access') > 0 THEN
      RAISE EXCEPTION 'P2-4 assertion V-5 failed: an overview RPC writes, or reaches the audit or evidence-access writer';
    END IF;
  END LOOP;

  -- V-6 — ⛔ NO NEW TABLE, ENUM, POLICY OR CLIENT WRITE GRANT.
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.tables
   WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  IF v_n <> 29 THEN
    RAISE EXCEPTION 'P2-4 assertion V-6 failed: % tables, expected 29 — this migration creates none', v_n;
  END IF;
  SELECT pg_catalog.count(DISTINCT t.typname) INTO v_n
    FROM pg_catalog.pg_type t
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN
    RAISE EXCEPTION 'P2-4 assertion V-6 failed: % enums, expected 12', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_policies WHERE schemaname = 'public';
  IF v_n <> 30 THEN
    RAISE EXCEPTION 'P2-4 assertion V-6 failed: % policies, expected 30', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.role_table_grants
   WHERE table_schema = 'public'
     AND grantee IN ('anon', 'authenticated', 'service_role')
     AND privilege_type <> 'SELECT';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-4 assertion V-6 failed: % client write grant(s) exist — the deny-by-default write posture moved', v_n;
  END IF;

  -- V-7 — ⛔ `reports`, `observations` and `report_evidence` STAY UNREADABLE
  --       DIRECTLY. The whole justification for these functions is that a
  --       client cannot reach those tables; if a policy or grant appeared,
  --       the justification would have evaporated and nobody would notice.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_policies
   WHERE schemaname = 'public' AND tablename IN ('reports', 'observations', 'report_evidence');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-4 assertion V-7 failed: % policy/policies now exist on reports/observations/report_evidence', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.role_table_grants
   WHERE table_schema = 'public'
     AND table_name IN ('reports', 'observations', 'report_evidence')
     AND grantee IN ('anon', 'authenticated', 'service_role');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-4 assertion V-7 failed: % client grant(s) now exist on reports/observations/report_evidence', v_n;
  END IF;

  RAISE NOTICE 'P2-4 assertions V-1..V-7 passed: two STABLE SECURITY DEFINER reads, two EXECUTE grants, registry unmoved at 21, every bar asserted structurally, and reports/observations/report_evidence still directly unreachable.';
END;
$$;

COMMIT;
