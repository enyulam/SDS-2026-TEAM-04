-- =====================================================================
-- PORTAL PHASE P2-20 -- screen `04` Trainer Students.
-- =====================================================================
-- ⛔ WHAT THIS FILE ADDS, NAMED NOT COUNTED (the batch requires the list):
--      · function  public.report_list_trainer_students()
--      · grant     EXECUTE ON public.report_list_trainer_students() TO authenticated
--    NOTHING ELSE. No table, column, enum, policy, client table grant, write
--    path or audit string. A read emits no governed action, so `A-029` has
--    nothing to register and the Step 7H registry stays at 23.
--
-- ---------------------------------------------------------------------
-- ⛔ THE FRAME'S `Level` COLUMN IS REFUSED, AND THE FUNCTION IS WHERE THAT
--    REFUSAL IS ENFORCED.
-- ---------------------------------------------------------------------
--   The `.png` draws a `Level` column of per-student chips -- `Mastering`,
--   `Developing`, `Mastered`, `Beginning`. TWO independent grounds refuse it:
--
--     1. `GC-7`, recorded in this pack's own `implementation-notes.md`:
--        *"Competency ratings appear in a 'Level'/chips column while
--        screen.md section 8 declares this screen 'Not rating-bearing'.
--        GOVERNANCE WINS on the functional ladder. DO NOT BUILD the rating
--        column."*
--     2. `G-2`, independently: one chip standing for a learner's whole
--        assessment history is a ROLL-UP, barred on every surface regardless
--        of audience. The trainer authored these ratings, so this is not a
--        disclosure question -- **no roll-up exists to render.**
--
--   ▶ SO NO RATING LEAVES THIS FUNCTION. `observation_ratings.rating` is not
--   selected, not aggregated and not named. Assertion `PL-4` reads the body
--   and fails if it ever is. **Refused by not being written down**, which
--   survives a later caller deciding it wants one.
--
-- ⚠️ WHAT *IS* RETURNED FROM THE RATINGS TABLE IS ITS **EXISTENCE**, NEVER ITS
--    VALUE. `last_assessed` is the session date of the most recent observation
--    that CARRIES at least one rating. ▶ "An assessment happened on this date"
--    is not "the assessment said X", and the difference is the whole column:
--    an observation row can exist with no ratings saved, and dating it would
--    tell a trainer a child was assessed when they were not.
--
-- ---------------------------------------------------------------------
-- ⚠️ §26.1's CEILING, RESTATED BECAUSE IT KEEPS BEING TRUE
-- ---------------------------------------------------------------------
--   `PL-7` below EXECUTES this function, and that proves resolution only as
--   far as the FIRST GATE: as `postgres` there is no application account, so
--   `app_current_account_id()` is NULL and the body returns immediately. The
--   joins, the rating-existence semi-join and the projection are reached ONLY
--   by `prove-p2-20-trainer-students.mjs` calling as a real trainer.
--   Both legs are required; neither substitutes for the other.
-- =====================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.report_list_trainer_students()
RETURNS TABLE (
  student_id uuid,
  student_name text,
  class_module_id uuid,
  class_label text,
  last_assessed date
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_account_id uuid;
  v_centre_id  uuid;
BEGIN
  -- GATE 1. No application account behind the caller -> no rows, never an
  -- error. `Q-7`: for a management/trainer read a refusal IS zero rows, and
  -- an error would disclose that there is something to be refused.
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN
    RETURN;
  END IF;

  -- GATE 2. Exactly one ACTIVE trainer membership. A caller holding none, or
  -- holding several, gets zero rows rather than a guessed centre.
  SELECT m.centre_id INTO v_centre_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id
     AND m.role = 'trainer'
     AND m.status = 'active';
  IF v_centre_id IS NULL THEN
    RETURN;
  END IF;

  /*
   * ⛔ THE GRAIN IS (STUDENT × MODULE), DELIBERATELY, AND IT IS STATED
   * BECAUSE THE FIXTURE CANNOT DISTINGUISH IT. Every fixture student holds
   * exactly one enrolment (13 students, 13 enrolments), so a per-student
   * grain and a per-enrolment grain return the SAME 13 rows and no proof
   * here can tell them apart. ▶ Chosen per-enrolment because the frame
   * carries a per-row `Class` cell and a class filter, and a student in two
   * of the trainer's modules genuinely appears under both. **The header
   * count is DISTINCT STUDENTS and is computed in the caller, not here.**
   *
   * ⛔ `A-016`: reach is derived from ACTIVE SESSION ASSIGNMENTS, because
   * assignment is authoritative at SESSION level. RLS agreeing is a second
   * layer, never the reason this query is right.
   */
  RETURN QUERY
  WITH reachable_modules AS (
    SELECT DISTINCT cs.class_module_id
      FROM public.class_session_assignments a
      JOIN public.class_sessions cs ON cs.id = a.class_session_id
      JOIN public.centre_memberships m ON m.id = a.trainer_membership_id
     WHERE a.is_active
       AND m.account_id = v_account_id
       AND m.role = 'trainer'
       AND m.status = 'active'
       AND cs.centre_id = v_centre_id
  ),
  assessed AS (
    /*
     * ⚠️ EXISTENCE, NOT VALUE. The join onto `observation_ratings` is a
     * semi-join used only to require that SOME rating was saved; no rating
     * column is selected, grouped by or returned.
     */
    SELECT o.student_id,
           o.class_module_id,
           pg_catalog.max(cs.session_date) AS last_assessed
      FROM public.observations o
      JOIN public.class_sessions cs ON cs.id = o.class_session_id
     WHERE o.centre_id = v_centre_id
       AND EXISTS (
             SELECT 1 FROM public.observation_ratings r
              WHERE r.observation_id = o.id
           )
     GROUP BY o.student_id, o.class_module_id
  )
  SELECT s.id,
         s.full_name,
         cm.id,
         pg_catalog.btrim(cg.display_name || ' · ' || cm.title),
         a.last_assessed
    FROM public.enrolments e
    JOIN reachable_modules rm ON rm.class_module_id = e.class_module_id
    JOIN public.class_modules cm ON cm.id = e.class_module_id
    JOIN public.class_grades cg ON cg.id = cm.class_grade_id
    JOIN public.students s ON s.id = e.student_id
    LEFT JOIN assessed a
           ON a.student_id = e.student_id
          AND a.class_module_id = e.class_module_id
   WHERE e.is_active
     AND s.is_active
     AND s.centre_id = v_centre_id
   ORDER BY s.full_name, cm.title;
END;
$$;

REVOKE ALL ON FUNCTION public.report_list_trainer_students() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_list_trainer_students() TO authenticated;

-- =====================================================================
-- APPLY-TIME ASSERTIONS
-- =====================================================================
DO $assert$
DECLARE
  v_count integer;
  v_text  text;
BEGIN
  -- PL-1: exactly one function declared by this file, with the right posture.
  SELECT pg_catalog.count(*) INTO v_count
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname = 'report_list_trainer_students'
     AND p.prosecdef
     AND p.provolatile = 's'
     -- ⚠️ THE STORED FORM IS `search_path=""`, WITH THE QUOTES, and this
     -- predicate was written as `search_path=` on the first draft and failed
     -- the migration outright. ▶ Loud, and therefore harmless — but it is the
     -- same shape as a check that would have passed on a wrong string.
     AND p.proconfig @> ARRAY['search_path=""'];
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'PL-1 FAILED: expected 1 SECURITY DEFINER STABLE function with empty search_path, found %', v_count;
  END IF;
  RAISE NOTICE 'PL-1 PASS  SECURITY DEFINER + STABLE + search_path = '''' ';

  -- PL-2: ⛔ NO `CREATE` IN A STABLE BODY. `P2-16` shipped exactly that and
  -- it applied clean: `CREATE FUNCTION` accepts the pair and only a real
  -- caller reaching the statement discovers it.
  SELECT p.prosrc INTO v_text
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_list_trainer_students' AND p.prokind = 'f';
  IF v_text ~* '\mcreate\M' THEN
    RAISE EXCEPTION 'PL-2 FAILED: a STABLE body may not CREATE anything';
  END IF;
  RAISE NOTICE 'PL-2 PASS  no CREATE inside a STABLE body';

  -- PL-3: the result type is pinned string-for-string. A silently widened
  -- projection is exactly how a rating column would arrive later.
  SELECT pg_catalog.pg_get_function_result(p.oid) INTO v_text
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_list_trainer_students';
  IF v_text <> 'TABLE(student_id uuid, student_name text, class_module_id uuid, class_label text, last_assessed date)' THEN
    RAISE EXCEPTION 'PL-3 FAILED: result type is %', v_text;
  END IF;
  RAISE NOTICE 'PL-3 PASS  result type pinned: %', v_text;

  -- PL-4: ⛔ NO RATING VALUE ANYWHERE IN THE BODY (`GC-7`, `G-2`).
  SELECT p.prosrc INTO v_text
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_list_trainer_students' AND p.prokind = 'f';
  IF v_text ~* '\mr\.rating\M|\mcompetency_rating\M|\mcompetency_score\M|\moverview\M|\mstrengths\M|\mremarks\M|content_hash' THEN
    RAISE EXCEPTION 'PL-4 FAILED: the body names a rating value, a panel or a hash';
  END IF;
  IF v_text !~ 'observation_ratings' THEN
    RAISE EXCEPTION 'PL-4 FAILED: the ratings table is not referenced at all, so last_assessed cannot be requiring a saved rating';
  END IF;
  RAISE NOTICE 'PL-4 PASS  ratings referenced for EXISTENCE only; no rating value, panel or hash named';

  -- PL-5: exactly one EXECUTE grant, and not to anon or PUBLIC.
  SELECT pg_catalog.count(*) INTO v_count
    FROM information_schema.role_routine_grants g
   WHERE g.routine_schema = 'public'
     AND g.routine_name = 'report_list_trainer_students'
     AND g.grantee <> 'postgres';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'PL-5 FAILED: expected exactly 1 non-owner grant, found %', v_count;
  END IF;
  SELECT g.grantee INTO v_text
    FROM information_schema.role_routine_grants g
   WHERE g.routine_schema = 'public'
     AND g.routine_name = 'report_list_trainer_students'
     AND g.grantee <> 'postgres';
  IF v_text <> 'authenticated' THEN
    RAISE EXCEPTION 'PL-5 FAILED: grantee is %', v_text;
  END IF;
  RAISE NOTICE 'PL-5 PASS  one EXECUTE grant, to authenticated';

  -- PL-6: the census is UNMOVED, registry included.
  SELECT (SELECT pg_catalog.count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE')::text
      || '|' || (SELECT pg_catalog.count(DISTINCT t.typname) FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public' AND t.typtype = 'e')::text
      || '|' || (SELECT pg_catalog.count(*) FROM pg_catalog.pg_policies WHERE schemaname = 'public')::text
      || '|' || (SELECT pg_catalog.array_length(public.audit_action_registry(), 1))::text
    INTO v_text;
  IF v_text <> '30|12|30|23' THEN
    RAISE EXCEPTION 'PL-6 FAILED: census moved to % (expected 30|12|30|23)', v_text;
  END IF;
  RAISE NOTICE 'PL-6 PASS  census unmoved: % (tables|enums|policies|registry)', v_text;

  -- PL-7: ⚠️ EXECUTE IT. Resolution to the first gate only -- see the header.
  SELECT pg_catalog.count(*) INTO v_count FROM public.report_list_trainer_students();
  RAISE NOTICE 'PL-7 PASS  executed as owner, returned % row(s) -- ⚠️ ZERO IS CORRECT HERE: no application account, so the body returns at GATE 1. This proves NAME RESOLUTION to that point and NOTHING about the joins below it', v_count;
END;
$assert$;

COMMIT;
