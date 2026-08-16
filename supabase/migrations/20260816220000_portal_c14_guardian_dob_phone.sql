-- =====================================================================
-- C-14 RATIFIED FIELDS + DOB + PHONE — FOUR COLUMNS, NOTHING ELSE
-- =====================================================================
-- Operator authorization, 2026-08-16, quoted so the boundary travels with
-- the file:
--
--   "SCHEMA AUTHORIZED: students.date_of_birth date NULL ·
--    students.guardian_name text NULL · students.guardian_contact text NULL ·
--    accounts.phone text NULL. Four columns. No table, enum, policy, client
--    grant or audit string. Registry unmoved at 24."
--
-- WHERE EACH LANDS, AND WHY:
--
--   students.guardian_name / .guardian_contact  -- OPTION (c), ruled.
--     C-14 ratified both as FIELDS on 2026-08-11 and deferred the columns to
--     "the phase". This is that phase.
--     ⛔ THEY ARE A PRE-LINK CAPTURE, NOT A SECOND SOURCE OF TRUTH. Screen 18
--     already shows a guardian name derived through
--     parent_student_links -> parent_profiles -> accounts.display_name, and a
--     free-text column beside it would give one displayed fact two sources
--     that disagree the first time a parent corrects their own account.
--     ▶ PRECEDENCE, RULED: A LINKED ACCOUNT ALWAYS WINS. These columns are
--     only what registration captured BEFORE a link existed. Enforced in the
--     projection and asserted by prove:portal-c14 with a divergent case.
--
--   students.date_of_birth  -- C-13 already permits a parent to SEE it; the
--     Operator ruled storing it "the lesser act". A fact about the learner,
--     so it lives on the learner.
--
--   accounts.phone  -- ONE PER PERSON, NOT ONE PER ROLE, ruled verbatim:
--     "a trainer who becomes a parent should not have two numbers."
--     ⛔ NOT on trainer_profiles/parent_profiles, which are role-scoped.
--
-- ⛔ NOT ADDED, EACH REFUSED BY A NAMED RULING: gender, home address,
--    employee ID, class code, capacity, relationship (all C-14 omitted) ·
--    photo (C-15) · student ID (Operator, 2026-08-16: "REFUSE for now — it
--    needs a generation rule nobody has specified, and an invented format on
--    six screens is worse than its absence") · an email on screen 20
--    (Operator: screen 21 captures the parent email properly, and a second
--    capture is the second source of truth C-14 warns about).
--
-- ⛔ NO audit string. Adding a column is not a governed action; A-029
--    registers actions. The existing admin.student_created /
--    admin.student_updated / admin.profile_created cover every write that
--    will touch these columns.
--
-- ⛔ NO grant and NO policy. Every table here already carries its
--    authenticated SELECT grant table-wide and its RLS policies; a column
--    added to a granted table inherits both. Asserted below rather than
--    assumed.
-- =====================================================================

BEGIN;

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS guardian_name text,
  ADD COLUMN IF NOT EXISTS guardian_contact text;

ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS phone text;

COMMENT ON COLUMN public.students.guardian_name IS
  'PRE-LINK CAPTURE ONLY. A linked parent account always wins (Operator ruling 2026-08-16). Never written after a parent_student_links row exists.';
COMMENT ON COLUMN public.students.guardian_contact IS
  'PRE-LINK CAPTURE ONLY. A linked parent account always wins (Operator ruling 2026-08-16). Never written after a parent_student_links row exists.';
COMMENT ON COLUMN public.accounts.phone IS
  'One per PERSON, not one per role (Operator ruling 2026-08-16): a trainer who becomes a parent must not have two numbers.';

-- ---------------------------------------------------------------------
-- APPLY-TIME ASSERTIONS. Exit code is the only verdict.
-- ---------------------------------------------------------------------
DO $$
DECLARE
  v_cols  integer;
  v_null  integer;
  v_tab   integer;
  v_enum  integer;
  v_pol   integer;
  v_reg   integer;
BEGIN
  -- CG-1 the four columns exist, with the authorized types
  SELECT count(*) INTO v_cols
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND ( (table_name = 'students' AND column_name = 'date_of_birth'    AND data_type = 'date')
       OR (table_name = 'students' AND column_name = 'guardian_name'    AND data_type = 'text')
       OR (table_name = 'students' AND column_name = 'guardian_contact' AND data_type = 'text')
       OR (table_name = 'accounts' AND column_name = 'phone'            AND data_type = 'text') );
  IF v_cols <> 4 THEN
    RAISE EXCEPTION 'CG-1 FAILED: expected the 4 authorized columns at their authorized types, found %', v_cols;
  END IF;
  RAISE NOTICE 'CG-1 PASS: 4 authorized columns present at the authorized types';

  -- CG-2 all four are NULLABLE. ⛔ A NOT NULL would break every existing row
  -- and would assert a fact the academy has not supplied.
  SELECT count(*) INTO v_null
  FROM information_schema.columns
  WHERE table_schema = 'public' AND is_nullable = 'YES'
    AND ( (table_name = 'students' AND column_name IN ('date_of_birth','guardian_name','guardian_contact'))
       OR (table_name = 'accounts' AND column_name = 'phone') );
  IF v_null <> 4 THEN
    RAISE EXCEPTION 'CG-2 FAILED: expected 4 NULLABLE columns, found %', v_null;
  END IF;
  RAISE NOTICE 'CG-2 PASS: all 4 columns are NULLABLE';

  -- CG-3 the census is UNMOVED. Four columns is not a table, an enum or a policy.
  SELECT count(*) INTO v_tab  FROM pg_tables WHERE schemaname = 'public';
  SELECT count(*) INTO v_enum FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typtype = 'e';
  SELECT count(*) INTO v_pol  FROM pg_policies WHERE schemaname = 'public';
  SELECT cardinality(public.audit_action_registry()) INTO v_reg;
  IF v_tab <> 30 OR v_enum <> 12 OR v_pol <> 30 OR v_reg <> 24 THEN
    RAISE EXCEPTION 'CG-3 FAILED: census moved -- tables=% enums=% policies=% registry=% (expected 30/12/30/24)',
      v_tab, v_enum, v_pol, v_reg;
  END IF;
  RAISE NOTICE 'CG-3 PASS: census UNMOVED at tables=30 enums=12 policies=30 registry=24';

  -- CG-4 ⛔ NO NEW GRANT. The columns inherit the table-wide SELECT that already
  -- exists; this migration must not widen anything. Asserted as an EXACT set.
  SELECT count(*) INTO v_cols
  FROM information_schema.role_table_grants
  WHERE table_schema = 'public' AND table_name IN ('students','accounts')
    AND grantee = 'authenticated' AND privilege_type <> 'SELECT';
  IF v_cols <> 0 THEN
    RAISE EXCEPTION 'CG-4 FAILED: authenticated holds % non-SELECT privilege(s) on students/accounts', v_cols;
  END IF;
  RAISE NOTICE 'CG-4 PASS: authenticated still holds SELECT and nothing else on students/accounts';

  -- CG-5 ⛔ NON-VACUITY: the columns must be REACHABLE, not merely declared.
  -- A column on a table with no SELECT grant would satisfy CG-1 and be useless.
  SELECT count(*) INTO v_cols
  FROM information_schema.role_column_grants
  WHERE table_schema = 'public' AND grantee = 'authenticated' AND privilege_type = 'SELECT'
    AND ( (table_name = 'students' AND column_name IN ('date_of_birth','guardian_name','guardian_contact'))
       OR (table_name = 'accounts' AND column_name = 'phone') );
  IF v_cols <> 4 THEN
    RAISE EXCEPTION 'CG-5 FAILED: expected all 4 columns readable by authenticated, found %', v_cols;
  END IF;
  RAISE NOTICE 'CG-5 PASS: all 4 columns are SELECT-able by authenticated (inherited, not granted here)';
END $$;

COMMIT;
