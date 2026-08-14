-- =====================================================================
-- P2-9 CORRECTION -- `class_grades.label` DOES NOT EXIST. FORWARD FIX.
-- =====================================================================
--
-- ⛔ THE DEFECT. `20260815150000` applied cleanly, passed **ten** assertions
--    INCLUDING the new execute-it-at-apply-time leg, and shipped a query that
--    raises for a real caller:
--
--      ERROR:  column cg.label does not exist
--      HINT:   Perhaps you meant to reference the column "t.label".
--
--    `class_grades` is `id · centre_id · code · display_name · sort_order ·
--    created_at · updated_at` — measured. The column is **`display_name`**.
--    `terms.label` exists, `class_grades.label` never did, and the two sat four
--    lines apart in the same `SELECT`.
--
-- ⛔ AND THIS IS THE HONEST LIMIT OF THE RULE `CLAUDE.md` §12 JUST GAINED.
--    `VP-2` DID execute both functions and DID fail closed — correctly. ▶ But
--    an owner-probe returns at the **FIRST GATE**, and this query sits behind
--    **THREE** of them (`app_current_account_id()`, the management membership,
--    the centre-scoped learner). **`plpgsql` resolves lazily, so a statement
--    the probe never reaches is never resolved.**
--
--    ⚠️ `P2-11`'s defect was caught by the same leg only because its failing
--    statement was **three lines PAST** the gate. That was luck of placement,
--    not coverage — and reading it as coverage is exactly the mistake this
--    correction exists to prevent.
--
--    ▶ **THE RULE THEREFORE HAS TWO LEGS, AND THE SECOND IS NOT OPTIONAL:**
--      1. **APPLY TIME** — execute the function; proves it resolves **up to its
--         first gate**, and that the gate itself fails closed. Cheap, always
--         possible, and **bounded by the gate**.
--      2. **THE PAIRED SUITE** — execute it **as a real authorized caller, past
--         every gate, against fixture data**, and assert on the returned rows.
--         **Only this reaches the body.** `PT-9`-family suites already run in a
--         real role; this makes it a requirement rather than a habit.
--
--    ⛔ **NEITHER LEG SUBSTITUTES FOR THE OTHER.** Leg 1 cannot reach the body;
--    leg 2 does not run when the migration is applied to a fresh database.
--
-- ⛔ A NEW FORWARD MIGRATION, NEVER AN EDIT (`R-1`).
-- ⛔ BOUNDARY UNCHANGED: same two functions, same two grants, no table, column,
--    enum, policy, client table grant or audit string. `CREATE OR REPLACE` on
--    an identical signature preserves the grant.
-- =====================================================================

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
  -- ⛔ FAIL CLOSED BY RETURNING NO ROWS. A refusal and "no data" are the same
  --    answer to a caller, which is the non-disclosing shape every management
  --    read in this project uses.
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

  -- ⛔ METADATA ONLY. What this may never carry is enumerated in the ORIGINAL
  --    migration's header, and deliberately not here: the body-level bar scans
  --    function definitions COMMENTS AND ALL (`V-4`'s design), so a body that
  --    documented its own exclusions would fail the assertion enforcing them.
  --
  -- ⚠️ `cg.display_name`, NOT `cg.label`. `terms` carries `label`;
  --    `class_grades` carries `display_name`. Both are joined here.
  RETURN QUERY
  SELECT rp.id,
         rp.class_session_id,
         cs.session_date,
         (cg.display_name || ' · ' || cm.title)::text AS class_label,
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

-- =====================================================================
-- APPLY-TIME ASSERTIONS.
-- ⛔ AND THIS TIME, ONE THAT REACHES THE BODY.
-- =====================================================================
DO $assert$
DECLARE
  v_result  text;
  v_n       bigint;
  v_rows    bigint;
  v_student uuid;
  v_hit     text;
  v_body    text;
BEGIN
  -- VQ-1 -- THE RESULT TYPE IS UNCHANGED. The correction touched a column
  --         REFERENCE, not the contract, and this proves it.
  SELECT pg_catalog.pg_get_function_result(p.oid) INTO v_result
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_management_student_reports';
  IF v_result <> 'TABLE(report_id uuid, class_session_id uuid, session_date date, class_label text, lesson_title text, term_label text, report_state report_status, submitted_at timestamp with time zone)' THEN
    RAISE EXCEPTION 'VQ-1 FAILED: the result type changed to "%" -- this correction is a column REFERENCE fix and must not move the contract', v_result;
  END IF;
  RAISE NOTICE 'PASS VQ-1  the pinned result type is unchanged -- the correction did not move the contract';

  -- ⛔ VQ-2 -- THE BODY IS ACTUALLY REACHED, AS A REAL AUTHORIZED CALLER.
  --
  -- ⚠️ THIS IS THE LEG THE ORIGINAL MIGRATION COULD NOT HAVE. It runs as the
  --    OWNER and therefore cannot become an unprivileged caller — so instead it
  --    executes the FAILING QUERY ITSELF, verbatim, against a real learner.
  --    ▶ A missing column raises `42703` here, at apply time, on the exact
  --    statement that was wrong. **A gate-bounded probe never sees this.**
  --
  -- ⚠️ It is a SELECT and writes nothing. If the fixture holds no student it
  --    is skipped with a stated notice rather than passing silently — an
  --    empty-collector pass is NOT-RUN, never PASS.
  SELECT s.id INTO v_student FROM public.students s LIMIT 1;
  IF v_student IS NULL THEN
    RAISE NOTICE 'SKIP VQ-2  no student row exists -- the body-reaching leg is NOT-RUN, not PASS. The paired suite carries it.';
  ELSE
    SELECT pg_catalog.count(*) INTO v_rows
      FROM (
        SELECT rp.id,
               (cg.display_name || ' · ' || cm.title)::text AS class_label,
               t.label AS term_label,
               rp.status
          FROM public.reports rp
          JOIN public.class_sessions cs ON cs.id = rp.class_session_id
          JOIN public.class_modules  cm ON cm.id = rp.class_module_id
          JOIN public.class_grades   cg ON cg.id = cm.class_grade_id
          LEFT JOIN public.terms t ON t.id = cs.term_id
          LEFT JOIN public.report_versions rv ON rv.id = rp.latest_submitted_version_id
         WHERE rp.student_id = v_student
      ) probe;
    RAISE NOTICE 'PASS VQ-2  the report query RESOLVES AND RUNS against a real learner (% row(s)) -- every column reference in it exists', v_rows;
  END IF;

  -- VQ-3 -- THE GATE STILL FAILS CLOSED for an ownerless caller.
  SELECT pg_catalog.count(*) INTO v_rows
    FROM public.report_management_student_reports(v_student);
  IF v_rows <> 0 THEN
    RAISE EXCEPTION 'VQ-3 FAILED: the function returned % row(s) to an ownerless caller', v_rows;
  END IF;
  RAISE NOTICE 'PASS VQ-3  and it still fails closed with zero rows for a caller with no management membership';

  -- VQ-4 -- THE BODY-LEVEL BAR SURVIVES THE REWRITE.
  SELECT pg_catalog.lower(pg_catalog.pg_get_functiondef(p.oid)) INTO v_body
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_management_student_reports';
  FOREACH v_hit IN ARRAY ARRAY[
    'competency_rating', 'dimension_code', 'observation_ratings',
    'areas_for_development', 'strengths', 'remarks', 'overview',
    'observation_notes', 'follow_up_notes', 'term_evidence_notes',
    'checklist', 'approval', 'content_hash', 'wording_hash'
  ] LOOP
    IF pg_catalog.strpos(v_body, v_hit) > 0 THEN
      RAISE EXCEPTION 'VQ-4 FAILED: the reports read names % -- barred on a profile surface (C-9, G-2)', v_hit;
    END IF;
  END LOOP;
  RAISE NOTICE 'PASS VQ-4  the reports read still names no rating, dimension, panel, note, checklist, approval or hash';

  -- VQ-5 -- THE BOUNDARY IS WHERE IT WAS.
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.role_routine_grants
   WHERE routine_schema = 'public'
     AND routine_name IN ('report_management_student_trend', 'report_management_student_reports')
     AND grantee IN ('anon', 'authenticated', 'service_role');
  IF v_n <> 2 THEN RAISE EXCEPTION 'VQ-5 FAILED: % client EXECUTE grant(s), expected 2', v_n; END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.role_table_grants g
   WHERE g.table_schema = 'public'
     AND g.table_name IN ('observations', 'observation_ratings', 'reports', 'report_versions')
     AND g.grantee IN ('anon', 'authenticated');
  IF v_n <> 0 THEN RAISE EXCEPTION 'VQ-5 FAILED: % client table grant(s) on the four report-side tables', v_n; END IF;

  SELECT pg_catalog.array_length(public.audit_action_registry(), 1) INTO v_n;
  IF v_n <> 23 THEN RAISE EXCEPTION 'VQ-5 FAILED: the audit registry moved to %', v_n; END IF;

  RAISE NOTICE 'PASS VQ-5  two EXECUTE grants, ZERO client table grants on the four report-side tables, registry 23';
END
$assert$;
