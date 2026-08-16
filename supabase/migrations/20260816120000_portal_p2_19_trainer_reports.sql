-- =====================================================================
-- P2-19 -- screen `01` Trainer Dashboard. ONE governed trainer-scoped read.
-- =====================================================================
-- ⛔ WHAT THIS ADDS, EXACTLY: one `SECURITY DEFINER` read and ONE `EXECUTE`
--    grant to `authenticated`. No table, column, enum, policy, client table
--    grant or audit string. Census stays 30/12/30/23.
--
-- ⛔ WHY A NEW READ AT ALL (§12.10 asked first, and the answer is yes here):
--    `reports`, `report_versions` and `observations` are all
--    `grants=0, policies=0` -- measured -- so the dashboard's `Pending
--    Reviews` count and `My Recent Report` list have NO path without one.
--    ▶ Everything else the screen needs (classes, learner counts, today's
--    sessions, the month calendar) is already reachable, and `P2-17`'s
--    projection already returns the first two.
--
-- ⛔ AND IT IS NOT `report_get_working`. The Operator's ruling: that function
--    returns FULL WORKING CONTENT, and reusing it to render two dashboard
--    tiles would ship report BODIES into a landing-page payload. ▶ The same
--    `Q-27`-shaped error `P2-9` avoided one phase over: aggregate/identify in
--    the database, never carry the substance to a surface that does not need
--    it. This returns identifiers, a status and a timestamp.
--
-- ⚠️ THE TRAINER AUTHORED THESE REPORTS, so this is NOT a disclosure gate --
--    they may read their own working content through `report_get_working`
--    already. ▶ What this read is careful about is VOLUME AND SHAPE, not
--    permission: a landing page should carry the least that answers it.
--
-- ⛔ NO RATING, NO PANEL TEXT, NO NOTE, NO HASH crosses this boundary, and
--    `PK-3` asserts that against the result type string-for-string.
-- =====================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.report_list_trainer_reports()
RETURNS TABLE (
  report_id         uuid,
  class_session_id  uuid,
  session_date      date,
  student_id        uuid,
  student_name      text,
  class_label       text,
  report_state      public.report_status,
  updated_at        timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_account_id    uuid;
  v_membership_id uuid;
BEGIN
  -- ⛔ FAIL CLOSED BY RETURNING NO ROWS. `Q-7` for a READ: a refusal IS an
  --    empty set and the caller cannot tell it from "no reports" -- which is
  --    the non-disclosing answer every governed read here gives.
  v_account_id := public.app_current_account_id();
  IF v_account_id IS NULL THEN RETURN; END IF;

  -- ⛔ THE CALLER MUST BE AN ACTIVE TRAINER. Exactly one active trainer
  --    membership, or nothing -- the same shape the management reads use.
  SELECT (pg_catalog.array_agg(m.id))[1] INTO v_membership_id
    FROM public.centre_memberships m
   WHERE m.account_id = v_account_id AND m.role = 'trainer' AND m.status = 'active'
  HAVING pg_catalog.count(*) = 1;
  IF v_membership_id IS NULL THEN RETURN; END IF;

  /*
   * ⛔ SCOPED BY ACTIVE SESSION ASSIGNMENT, WHICH IS `A-016`'s AUTHORITY.
   *    Trainer assignment is authoritative at SESSION level, so the join to
   *    `class_session_assignments` is what decides the answer -- not a
   *    module-level guess, and not RLS (this body runs as owner and has none).
   *
   * ⚠️ `class_grades.display_name` -- and `terms.label`. Two adjacent tables,
   *    OPPOSITE column names, and guessing wrong is the exact defect that
   *    broke `P2-9`'s migration at runtime. Both were measured before use.
   */
  RETURN QUERY
  SELECT rp.id,
         rp.class_session_id,
         cs.session_date,
         rp.student_id,
         s.full_name,
         (cg.display_name || ' · ' || cm.title)::text,
         rp.status,
         rp.updated_at
    FROM public.reports rp
    JOIN public.class_sessions cs ON cs.id = rp.class_session_id
    JOIN public.class_session_assignments a
      ON a.class_session_id = cs.id
     AND a.trainer_membership_id = v_membership_id
     AND a.is_active
    JOIN public.class_modules cm ON cm.id = cs.class_module_id
    JOIN public.class_grades cg ON cg.id = cm.class_grade_id
    JOIN public.students s ON s.id = rp.student_id
   ORDER BY rp.updated_at DESC, rp.id;
END;
$fn$;

COMMENT ON FUNCTION public.report_list_trainer_reports() IS
  'P2-19. Screen 01 Trainer Dashboard. One row per report on a session this trainer is actively '
  'assigned to (A-016). Returns identifiers, a status and a timestamp -- NEVER a rating, a panel, '
  'a note or a hash. Deliberately NOT report_get_working, which returns full working content. '
  'Read only, trainer-gated, emits no audit event.';

REVOKE ALL ON FUNCTION public.report_list_trainer_reports() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_list_trainer_reports() TO authenticated;

-- =====================================================================
-- APPLY-TIME ASSERTIONS.
-- ⚠️ §26.1/§38: these prove resolution TO THE FIRST GATE ONLY. The paired
--    suite executes it as a real trainer, past every gate, against fixture
--    data -- and that is the leg that reaches the body.
-- =====================================================================
DO $assert$
DECLARE
  v_txt text;
  v_n   integer;
BEGIN
  -- ⛔ PK-1 POSTURE.
  SELECT p.prosecdef::text || '/' || p.provolatile::text || '/' ||
         pg_catalog.array_to_string(p.proconfig, ';')
    INTO v_txt
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_list_trainer_reports';
  IF v_txt IS DISTINCT FROM 'true/s/search_path=""' THEN
    RAISE EXCEPTION 'PK-1 FAIL: posture is "%", expected true/s/search_path=""', v_txt;
  END IF;
  RAISE NOTICE 'PK-1 PASS: SECURITY DEFINER, STABLE, search_path pinned';

  -- ⛔ PK-2 NO `CREATE` IN A STABLE BODY. §38's defect, asserted so it cannot
  --    return: a STABLE function may not CREATE, and CREATE FUNCTION accepts
  --    the pair silently.
  SELECT p.prosrc INTO v_txt
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_list_trainer_reports';
  IF v_txt ~* '\mCREATE\s+(TEMP|TEMPORARY|TABLE|INDEX)' THEN
    RAISE EXCEPTION 'PK-2 FAIL: a STABLE body contains a CREATE';
  END IF;
  RAISE NOTICE 'PK-2 PASS: no CREATE in a STABLE body';

  -- ⛔ PK-3 THE RESULT TYPE, PINNED STRING-FOR-STRING (`VP-4`'s form).
  SELECT pg_catalog.pg_get_function_result(p.oid) INTO v_txt
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_list_trainer_reports';
  IF v_txt IS DISTINCT FROM 'TABLE(report_id uuid, class_session_id uuid, session_date date, student_id uuid, student_name text, class_label text, report_state report_status, updated_at timestamp with time zone)' THEN
    RAISE EXCEPTION 'PK-3 FAIL: result type is "%"', v_txt;
  END IF;
  IF v_txt ~* '(rating|band|score|overview|strengths|areas_for|remarks|hash|note|beginning|developing|mastering|mastered)' THEN
    RAISE EXCEPTION 'PK-3 FAIL: result type mentions report substance: %', v_txt;
  END IF;
  RAISE NOTICE 'PK-3 PASS: identifiers, a status and a timestamp -- no column can carry substance';

  -- ⛔ PK-4 AND THE BODY SELECTS NO PANEL COLUMN. The result type bars the
  --    shape; this bars the body reaching for content it would then discard.
  IF v_txt IS NOT NULL AND (SELECT p.prosrc FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
       WHERE n.nspname='public' AND p.proname='report_list_trainer_reports')
     ~* '(overview|strengths|areas_for_development|remarks|content_hash|observation_notes|follow_up_notes)' THEN
    RAISE EXCEPTION 'PK-4 FAIL: the body references report substance';
  END IF;
  RAISE NOTICE 'PK-4 PASS: the body references no panel, note or hash column';

  -- PK-5 exactly one client grant.
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.role_routine_grants
   WHERE specific_schema = 'public' AND routine_name = 'report_list_trainer_reports'
     AND grantee = 'authenticated' AND privilege_type = 'EXECUTE';
  IF v_n <> 1 THEN RAISE EXCEPTION 'PK-5 FAIL: % EXECUTE grants, expected 1', v_n; END IF;
  RAISE NOTICE 'PK-5 PASS: one EXECUTE grant, to authenticated';

  -- ⛔ PK-6 EXECUTE IT. As `postgres` there is no account, so the first gate
  --    refuses. ⚠️ §38: this reaches the FIRST GATE ONLY.
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_list_trainer_reports();
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'PK-6 FAIL: an unauthenticated caller got % row(s)', v_n;
  END IF;
  RAISE NOTICE 'PK-6 PASS: executes and fails closed at its first gate';

  -- PK-7 census unmoved.
  SELECT pg_catalog.count(*) INTO v_n FROM information_schema.tables
   WHERE table_schema='public' AND table_type='BASE TABLE';
  IF v_n <> 30 THEN RAISE EXCEPTION 'PK-7 FAIL: % tables', v_n; END IF;
  SELECT pg_catalog.array_length(public.audit_action_registry(),1) INTO v_n;
  IF v_n <> 23 THEN RAISE EXCEPTION 'PK-7 FAIL: registry %', v_n; END IF;
  RAISE NOTICE 'PK-7 PASS: 30 tables, registry 23';
END;
$assert$;

COMMIT;
