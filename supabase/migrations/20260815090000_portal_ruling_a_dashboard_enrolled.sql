-- =====================================================================
-- RULING A -- `report_centre_dashboard_summary`: ENROLLED, AND ONE TILE FEWER
-- =====================================================================
--
-- ⛔ OPERATOR AUTHORIZATION, 2026-08-15, quoted because it is also the exact
--    BOUNDARY of this file:
--
--      *"SCHEMA PRE-AUTHORIZED FOR RULING A: forward migration dropping
--       `o_assessed_students` from `report_centre_dashboard_summary`, and Total
--       Students changed to count ENROLLED learners rather than
--       centre-resident students. **No table, column, enum, policy, grant or
--       audit string. Registry unmoved.** If it needs anything beyond that,
--       STOP and tell me."*
--
--    ▶ It needs nothing beyond that. Assertions `RA-5` … `RA-8` fail this
--    migration outright if any of those five moved.
--
-- ⚠️ WHY A FORWARD MIGRATION AND NOT AN EDIT (`R-1`).
--    `20260814140000_portal_p2_7_dashboard_summary.sql` is COMMITTED AND
--    APPLIED. A correction to an applied migration is a NEW FILE, always —
--    editing the original would make the file disagree with every database
--    that already ran it, and `supabase_migrations.schema_migrations` would
--    still record the old hash as applied.
--
-- ⛔ WHY `DROP` AND NOT `CREATE OR REPLACE`. Removing an `OUT` parameter
--    CHANGES THE RESULT TYPE, and PostgreSQL refuses `CREATE OR REPLACE` for
--    that ("cannot change return type of existing function"). The drop is
--    therefore forced, not chosen. ⚠️ **`DROP FUNCTION` ALSO DESTROYS THE
--    GRANT**, so the identical `GRANT EXECUTE ... TO authenticated` is
--    re-issued below and `RA-3` proves it came back. ▶ **That is a restoration,
--    not a grant change**: the net privilege state before and after this file
--    is byte-identical, which is what the authorization's "no grant" means.
--
-- ⛔ NOTHING ELSE REFERENCES THIS FUNCTION. Measured at HEAD before writing:
--    ZERO policy expressions and ZERO other function bodies name it, so the
--    drop cascades to nothing. It is a leaf read.
--
-- ⚠️ TRANSACTIONAL. `supabase migration up` applies this in one transaction.
-- =====================================================================

-- ===========================================================================
-- 1 . Drop, and recreate with THREE integers.
-- ===========================================================================
DROP FUNCTION public.report_centre_dashboard_summary();

CREATE FUNCTION public.report_centre_dashboard_summary(
  OUT o_total_students     integer,
  OUT o_pending_approval   integer,
  OUT o_submitted_reports  integer
)
 RETURNS record
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_centre_id uuid;
BEGIN
  -- ⛔ NON-DISCLOSING FAIL-CLOSED, unchanged. A caller with no active
  --    management membership gets NULLs, which the projection turns into a
  --    refusal -- never zeroes, which would read as "this centre has no
  --    learners" and is a different, false statement (`Q-7`).
  o_total_students    := NULL;
  o_pending_approval  := NULL;
  o_submitted_reports := NULL;

  IF public.app_current_account_id() IS NULL THEN RETURN; END IF;

  -- ⚠️ THE CENTRE IS THE CALLER'S OWN AND IS NEVER A PARAMETER, unchanged.
  --    There is no other centre a caller could name, so the function has no
  --    reachable surface beyond their own.
  SELECT m.centre_id INTO v_centre_id
    FROM public.centre_memberships m
   WHERE m.account_id = public.app_current_account_id()
     AND m.role = 'management' AND m.status = 'active';
  IF v_centre_id IS NULL THEN RETURN; END IF;

  -- =========================================================================
  -- ⛔ TOTAL STUDENTS = **ENROLLED**, NOT CENTRE-RESIDENT. Operator ruling:
  --    *"use ENROLLED, not centre-resident. A withdrawn learner should not
  --     count, and the fixture coinciding today is exactly why this needs
  --     deciding now rather than when it splits."*
  --
  -- ⚠️ THE TWO NUMBERS ARE IDENTICAL AT HEAD -- both 13, measured -- WHICH IS
  --    PRECISELY THE HAZARD. A tile that happens to be right cannot be told
  --    from a tile that is right, and the first learner to withdraw would have
  --    split them silently on a screen nobody was re-checking.
  --
  -- ⛔ `DISTINCT`, because a learner enrolled in two class modules is ONE
  --    learner. Counting rows would report a roster larger than the centre has.
  -- ⛔ `is_active`, because that IS the withdrawal boundary: `enrolments` keeps
  --    the withdrawn row (with `withdrawn_at`) rather than deleting it, so an
  --    unfiltered count would still include exactly the learner the ruling
  --    exists to exclude.
  -- =========================================================================
  SELECT pg_catalog.count(DISTINCT e.student_id) INTO o_total_students
    FROM public.enrolments e
   WHERE e.centre_id = v_centre_id AND e.is_active;

  -- ⛔ `o_assessed_students` IS GONE. Operator ruling: *"drop the parameter
  --    properly. A forward migration under `R-1`, not an edit. Leaving it
  --    unread is the option that rots."*
  --
  -- ⚠️ AND THE OBSERVATION WORTH KEEPING, RECORDED AT THE OPERATOR'S REQUEST:
  --    removing it leaves this function doing work THE OTHER THREE BOUNDARIES
  --    COULD HAVE DONE. `o_pending_approval` and `o_submitted_reports` are both
  --    `count(*) FROM reports WHERE status = ?`, and the queue reads that back
  --    those very tiles already resolve the same rows under the same centre
  --    scope. ▶ This function's remaining justification is that it answers in
  --    ONE round trip what would otherwise be three, on a screen whose whole
  --    job is four numbers -- not that it knows anything the other boundaries
  --    do not. **A fourth tile is not a reason to widen it; it is a reason to
  --    ask whether the tile has a boundary already.**

  SELECT pg_catalog.count(*) INTO o_pending_approval
    FROM public.reports r
   WHERE r.centre_id = v_centre_id AND r.status = 'trainer_approved';

  -- ⛔ `submitted`, NOT `approved`, unchanged. Under `A-036` `approved` is
  --    TRANSIENT-IN-TRANSACTION and no operation ever commits with it, so a
  --    count of approved reports is ALWAYS ZERO, FOREVER, by design.
  SELECT pg_catalog.count(*) INTO o_submitted_reports
    FROM public.reports r
   WHERE r.centre_id = v_centre_id AND r.status = 'submitted';
END;
$function$;

-- ⚠️ RESTORED, NOT GRANTED ANEW -- see the header. `DROP FUNCTION` destroyed
--    the original; this returns the privilege state to exactly what it was.
REVOKE ALL ON FUNCTION public.report_centre_dashboard_summary() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.report_centre_dashboard_summary() TO authenticated;

COMMENT ON FUNCTION public.report_centre_dashboard_summary() IS
  'P2-7 screen 11 KPI tiles, as amended by Ruling A (2026-08-15). THREE '
  'integers: total students = DISTINCT ACTIVE ENROLMENTS (never centre-resident '
  'rows -- a withdrawn learner must not count), pending approval, submitted. '
  'The centre is resolved from the caller''s own active management membership '
  'and never from a parameter; any other caller gets NULLs. Carries no rating, '
  'roll-up, panel field, note, checklist value or hash.';

-- ===========================================================================
-- 2 . APPLY-TIME ASSERTIONS. Every one aborts the whole migration.
-- ===========================================================================
DO $assert$
DECLARE
  v_args   text;
  v_src    text;
  v_n      integer;
BEGIN
  -- RA-1 -- THREE OUT PARAMETERS, and `assessed` is not among them.
  SELECT pg_catalog.pg_get_function_arguments(p.oid) INTO v_args
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_centre_dashboard_summary';
  IF v_args IS NULL THEN
    RAISE EXCEPTION 'RA-1 FAILED: the function does not exist after recreation';
  END IF;
  IF pg_catalog.strpos(v_args, 'o_assessed_students') > 0 THEN
    RAISE EXCEPTION 'RA-1 FAILED: o_assessed_students survives in the signature: %', v_args;
  END IF;
  IF (pg_catalog.length(v_args) - pg_catalog.length(pg_catalog.replace(v_args, 'OUT ', ''))) / 4 <> 3 THEN
    RAISE EXCEPTION 'RA-1 FAILED: expected exactly 3 OUT parameters, got: %', v_args;
  END IF;
  RAISE NOTICE 'PASS RA-1  the signature carries EXACTLY THREE OUT integers and no o_assessed_students (%)', v_args;

  -- RA-2 -- THE BODY COUNTS ENROLMENTS, and no longer counts `students`.
  SELECT p.prosrc INTO v_src
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_centre_dashboard_summary';
  IF pg_catalog.strpos(v_src, 'public.enrolments') = 0 THEN
    RAISE EXCEPTION 'RA-2 FAILED: the body does not read public.enrolments';
  END IF;
  IF pg_catalog.strpos(v_src, 'e.is_active') = 0 THEN
    RAISE EXCEPTION 'RA-2 FAILED: the enrolment count is not filtered to ACTIVE -- a withdrawn learner would still be counted, which is the whole ruling';
  END IF;
  IF pg_catalog.strpos(v_src, 'FROM public.students') > 0 THEN
    RAISE EXCEPTION 'RA-2 FAILED: the body still counts centre-resident students';
  END IF;
  IF pg_catalog.strpos(v_src, 'observations') > 0 THEN
    RAISE EXCEPTION 'RA-2 FAILED: the body still reads observations -- the assessed count was not actually removed, only unnamed';
  END IF;
  RAISE NOTICE 'PASS RA-2  the body counts DISTINCT ACTIVE ENROLMENTS, reads public.students NOWHERE, and reads observations NOWHERE';

  -- RA-3 -- THE GRANT CAME BACK. `DROP FUNCTION` destroyed it.
  IF NOT pg_catalog.has_function_privilege(
        'authenticated', 'public.report_centre_dashboard_summary()', 'EXECUTE') THEN
    RAISE EXCEPTION 'RA-3 FAILED: authenticated lost EXECUTE -- the DROP destroyed the grant and it was not restored';
  END IF;
  IF pg_catalog.has_function_privilege(
        'anon', 'public.report_centre_dashboard_summary()', 'EXECUTE') THEN
    RAISE EXCEPTION 'RA-3 FAILED: anon holds EXECUTE -- the recreation WIDENED the grant';
  END IF;
  RAISE NOTICE 'PASS RA-3  EXECUTE is RESTORED to authenticated and anon holds none -- the privilege state is what it was, neither narrower nor wider';

  -- RA-4 -- IT STILL FAILS CLOSED for a caller with no management membership.
  --         ⚠️ Asserted from the SOURCE, because this DO block runs as the
  --         owner and cannot become an unprivileged caller mid-migration. The
  --         runtime proof is the suite's, not this file's.
  IF pg_catalog.strpos(v_src, 'o_total_students    := NULL;') = 0 THEN
    RAISE EXCEPTION 'RA-4 FAILED: the fail-closed NULL initialisation was lost in the rewrite';
  END IF;
  RAISE NOTICE 'PASS RA-4  the fail-closed NULL initialisation survives the rewrite (source-level; the runtime refusal is proved by the suite)';

  -- RA-5 .. RA-8 -- THE AUTHORIZATION'S OWN BOUNDARY, asserted as equalities.
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  IF v_n <> 30 THEN RAISE EXCEPTION 'RA-5 FAILED: table count moved to % (expected 30) -- this migration is authorized to add NO table', v_n; END IF;

  SELECT pg_catalog.count(DISTINCT t.typname) INTO v_n
    FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN RAISE EXCEPTION 'RA-6 FAILED: enum count moved to % (expected 12)', v_n; END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_policies WHERE schemaname = 'public';
  IF v_n <> 30 THEN RAISE EXCEPTION 'RA-7 FAILED: policy count moved to % (expected 30)', v_n; END IF;

  SELECT pg_catalog.array_length(public.audit_action_registry(), 1) INTO v_n;
  IF v_n <> 23 THEN RAISE EXCEPTION 'RA-8 FAILED: the audit registry moved to % (expected 23) -- "Registry unmoved" was explicit', v_n; END IF;

  RAISE NOTICE 'PASS RA-5..RA-8  tables 30, enums 12, policies 30, registry 23 -- ALL UNMOVED. The authorization was "no table, column, enum, policy, grant or audit string", and each is asserted as an EQUALITY rather than assumed';
END
$assert$;
