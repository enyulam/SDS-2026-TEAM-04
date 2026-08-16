-- =====================================================================
-- P2-22 -- screen `30` Parent Dashboard: the ONE field a parent cannot reach.
--
-- ⛔ WHAT THIS FILE ADDS, NAMED RATHER THAN COUNTED:
--      · function  public.parent_get_child_trainer(uuid)
--      · grant     EXECUTE ON public.parent_get_child_trainer(uuid) TO authenticated
--    NOTHING ELSE. No table, column, enum, policy, client table grant, write
--    path or audit string. Read-side only, inside the standing batch.
--
-- ⚠️ §12.10 WAS APPLIED BEFORE THIS FILE EXISTED, AND IT ELIMINATED FIVE OF
--    THE FRAME'S SIX `Profile Details` ROWS. Measured as the fixture parent:
--
--      students                  8 rows  -> date of birth, guardian, contact
--      enrolments                8 rows  -> enrolled date
--      class_modules / _grades   3 / 3   -> the Class row
--      class_session_assignments 0 rows  ⛔ the Trainer row is UNREACHABLE
--      trainer_profiles          0 rows  ⛔ likewise
--
--    ▶ So this is not "a read for screen 30". It is a read for the ONE row
--    RLS genuinely does not deliver, and the other five stay on the direct
--    RLS reads the parent already holds.
--
-- ⛔ THE TRAINER NAME IS EXPRESSLY PERMITTED ON A PARENT SURFACE (`G-5`) and
--    already ships to parents through `report_get_canonical_context`. This
--    adds no new disclosure -- it makes an already-permitted field reachable
--    without a submitted report, which is what a profile card needs.
--
-- ⛔ AND IT CARRIES NO RATING. `Q-27` is a DATA boundary: the result type is
--    one `text` column. The parent's own reach is additionally structural --
--    `observation_ratings` and `report_version_ratings` refuse a parent at
--    the GRANT layer (`permission denied for table`), not at RLS.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- ⚠️ `CREATE OR REPLACE` IS CORRECT HERE ONLY BECAUSE THE NAME IS NEW.
--    `P2-11`'s lesson: a different parameter list makes an OVERLOAD, not a
--    replacement. `C14W-1`'s shape is asserted below as `P22T-1`.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.parent_get_child_trainer(p_student_id uuid)
RETURNS TABLE (trainer_display_name text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_session_id uuid;
BEGIN
  -- ---- the gate. A refusal IS zero rows (`Q-7`), never an error. ----
  IF NOT public.app_parent_reaches_student(p_student_id) THEN
    RETURN;
  END IF;

  /*
   * ⚠️ THE MOST RECENT SESSION OF THE CHILD'S ACTIVE ENROLMENT, and the
   * choice is deliberate rather than incidental. The frame draws ONE
   * trainer; a child's module can carry several across a term, so "the
   * trainer" has to mean something. It means the one who took the latest
   * session -- which is what a parent reading a profile card today means.
   *
   * ⛔ `A-016`: assignment is authoritative at CLASS SESSION level. Deriving
   * this from the module would be inventing a module-level assignment the
   * model does not have.
   */
  SELECT cs.id INTO v_session_id
    FROM public.enrolments e
    JOIN public.class_sessions cs ON cs.class_module_id = e.class_module_id
   WHERE e.student_id = p_student_id
     AND e.is_active
   ORDER BY cs.session_date DESC, cs.id DESC
   LIMIT 1;

  IF v_session_id IS NULL THEN
    RETURN;
  END IF;

  /*
   * ⛔ STAFF IDENTITY COMES FROM THE PHASE 0A READ PATH, NOT FROM A SECOND
   * COPY OF ITS JOIN -- verbatim the reasoning `report_get_canonical_context`
   * records for the same call. One source of truth; a second join here would
   * be free to drift from the first.
   *
   * ⚠️ Its NULL is a REAL STATE -- an unassigned session -- and the screen
   * renders it by OMITTING the row (hero `0B`). Never "TBC", never a dash.
   */
  RETURN QUERY
  SELECT s.trainer_display_name
    FROM public.class_session_staff_identity(v_session_id) s
   WHERE s.trainer_display_name IS NOT NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.parent_get_child_trainer(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.parent_get_child_trainer(uuid) TO authenticated;

-- =====================================================================
-- ASSERTIONS. ⛔ Every one runs INSIDE the transaction that made the
-- change, so a failure rolls the whole file back.
-- =====================================================================
DO $assert$
DECLARE
  v_n        integer;
  v_grants   text;
  v_result   text;
  v_rows     integer;
BEGIN
  -- ---- P22T-1: exactly one function of this name. No overload. ----
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'parent_get_child_trainer';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'P22T-1 FAIL: % definitions of parent_get_child_trainer (expected exactly 1 -- a different parameter list would be an OVERLOAD, not a replacement)', v_n;
  END IF;
  RAISE NOTICE 'P22T-1 PASS: exactly one definition';

  -- ---- P22T-2: the grant set is EXACT, not merely present. ----
  -- ⚠️ PostgreSQL grants EXECUTE to PUBLIC by default on a new function. A
  -- presence check passes with PUBLIC sitting beside `authenticated`, which
  -- is why this compares the WHOLE set.
  SELECT coalesce(pg_catalog.string_agg(g.grantee || ':' || g.privilege_type, ',' ORDER BY g.grantee), 'none')
    INTO v_grants
    FROM information_schema.role_routine_grants g
   WHERE g.routine_schema = 'public' AND g.routine_name = 'parent_get_child_trainer';
  IF v_grants <> 'authenticated:EXECUTE,postgres:EXECUTE' THEN
    RAISE EXCEPTION 'P22T-2 FAIL: grant set is [%], expected exactly [authenticated:EXECUTE,postgres:EXECUTE]', v_grants;
  END IF;
  RAISE NOTICE 'P22T-2 PASS: exact grant set %', v_grants;

  -- ---- P22T-3: the result type carries ONE text column. `Q-27`. ----
  SELECT pg_catalog.pg_get_function_result(p.oid) INTO v_result
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'parent_get_child_trainer';
  IF v_result <> 'TABLE(trainer_display_name text)' THEN
    RAISE EXCEPTION 'P22T-3 FAIL: result type is [%], expected [TABLE(trainer_display_name text)] -- a widened projection is how a rating column would arrive later', v_result;
  END IF;
  RAISE NOTICE 'P22T-3 PASS: result type pinned string-for-string';

  -- ---- P22T-4: THE BODY EXECUTES. ----
  -- ⛔ `CLAUDE.md` §12: a migration that verifies its own SHAPE has not
  -- verified that it WORKS. `plpgsql` defers name resolution to first
  -- execution, so the three assertions above are all TRUE of a body that
  -- raises on its first statement. ONE call is enough and a REFUSAL is the
  -- ideal one -- it traverses the gate and writes nothing.
  SELECT pg_catalog.count(*) INTO v_rows
    FROM public.parent_get_child_trainer('00000000-0000-4000-8000-000000000000'::uuid);
  IF v_rows <> 0 THEN
    RAISE EXCEPTION 'P22T-4 FAIL: an unreachable student returned % row(s); the gate must refuse with ZERO rows', v_rows;
  END IF;
  RAISE NOTICE 'P22T-4 PASS: the body RAN and refused an unreachable student with zero rows';

  -- ---- P22T-5: the census is unmoved. ----
  SELECT pg_catalog.count(*) INTO v_n FROM information_schema.tables
   WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  IF v_n <> 30 THEN RAISE EXCEPTION 'P22T-5 FAIL: % tables, expected 30', v_n; END IF;
  SELECT pg_catalog.count(DISTINCT t.typname) INTO v_n
    FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN RAISE EXCEPTION 'P22T-5 FAIL: % enums, expected 12', v_n; END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_policies WHERE schemaname = 'public';
  IF v_n <> 30 THEN RAISE EXCEPTION 'P22T-5 FAIL: % policies, expected 30', v_n; END IF;
  SELECT pg_catalog.array_length(public.audit_action_registry(), 1) INTO v_n;
  IF v_n <> 24 THEN RAISE EXCEPTION 'P22T-5 FAIL: registry %, expected 24 -- a read emits no governed action', v_n; END IF;
  RAISE NOTICE 'P22T-5 PASS: 30 tables / 12 enums / 30 policies / registry 24, all unmoved';
END;
$assert$;

COMMIT;
