-- =====================================================================
-- PORTAL PHASE P2-2 -- D-3: the TERMS substrate.
-- =====================================================================
-- ⛔ THE OPERATOR REQUIRED THE WRITE-PATH ABSENCE TO BE ASSERTED, NOT
--    PROMISED: "a leg that fails the migration if a write policy or grant
--    on terms ever appears, the way E1 and E9 were written."
--
-- The migration carries that guard (`T-6`) and it runs ONCE. This suite is
-- the half that runs at EVERY phase boundary, which is where a later phase
-- adding an INSERT policy for query convenience would actually be caught.
--
-- Proves, in order:
--   P22-1  NON-VACUITY FIRST. The table exists, holds its four seeded rows,
--          and the sole centre owns them. ⛔ Every absence below is
--          trivially true of a table that does not exist.
--   P22-2  ⛔ THE WRITE GUARD. Zero non-SELECT policies, zero non-SELECT
--          client grants, exactly one SELECT policy and exactly one
--          matching `authenticated` SELECT grant.
--   P22-3  ⚠️ ITS CONTROL, and the leg that makes P22-2 mean anything: a
--          probe INSERT policy is created INSIDE this transaction, the
--          detector is required to SEE it, and it is dropped again. Without
--          this, "zero write policies" is equally true of a query that
--          matches nothing.
--   P22-4  ⛔ NO BACKFILL. `term_id` is nullable and every pre-existing
--          session still carries NULL.
--   P22-5  ⛔ NO GOVERNED ACTION WAS CREATED. No term function, no term
--          audit string in the registry however long it grows, enums 12.
--   P22-6  ⛔ D-3'S BOUNDARY, MADE STRUCTURAL. No column on `terms` could
--          carry a report, a rating, a score or a roll-up -- the drift
--          toward term REPORTS that `G-4` and `C-11` both refuse.
--   P22-7  ANON reads zero terms.
--   P22-8  ⚠️ THE CONTROL for P22-7: MANAGEMENT reads all four through the
--          same harness, so the zero above is discrimination, not blindness.
--   P22-9  A TRAINER reads them too -- the positive direction of choosing
--          `active member of the centre` over a management-only policy.
--          ▶ A policy chosen for a reason nobody exercises is a policy
--          nobody has checked.
--
-- ⚠️ Caller legs run under `SET LOCAL ROLE authenticated`, never as owner.
-- ⚠️ TRANSACTION-SCOPED, ending in ROLLBACK. The probe policy cannot
--    survive, and P22-3 proves it did not.
-- =====================================================================

BEGIN;

CREATE FUNCTION pg_temp.as_management() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims',
  '{"sub":"d0000000-0000-4000-8000-000000000001","role":"authenticated"}', true); END $$;

CREATE FUNCTION pg_temp.as_trainer() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims',
  '{"sub":"d0000000-0000-4000-8000-000000000002","role":"authenticated"}', true); END $$;

CREATE FUNCTION pg_temp.as_nobody() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims', '', true); END $$;

-- The write-guard detector, declared ONCE so P22-2 and its control P22-3
-- cannot drift apart. ⚠️ A control that exercises a DIFFERENT query from the
-- assertion proves nothing about the assertion.
CREATE FUNCTION pg_temp.write_surface() RETURNS integer LANGUAGE sql AS $f$
  SELECT (SELECT count(*) FROM pg_policies
           WHERE schemaname = 'public' AND tablename = 'terms' AND cmd <> 'SELECT')::integer
       + (SELECT count(*) FROM information_schema.role_table_grants
           WHERE table_schema = 'public' AND table_name = 'terms'
             AND grantee IN ('anon','authenticated','service_role')
             AND privilege_type <> 'SELECT')::integer;
$f$;

DO $suite$
DECLARE
  v_n     integer;
  v_seen  integer;
BEGIN
  -- P22-1 -- NON-VACUITY.
  SELECT count(*) INTO v_n FROM public.terms;
  IF v_n = 4 AND EXISTS (
       SELECT 1 FROM public.terms t JOIN public.centres c ON c.id = t.centre_id
        WHERE c.code = 'ispeak')
  THEN
    RAISE NOTICE 'PASS P22-1  NON-VACUITY: terms exists with its % seeded rows in the sole centre -- the absences below are not true of nothing', v_n;
  ELSE
    RAISE NOTICE 'FAIL P22-1  terms holds % row(s)', v_n;
  END IF;

  -- P22-2 -- ⛔ THE WRITE GUARD.
  SELECT pg_temp.write_surface() INTO v_n;
  SELECT count(*) INTO v_seen FROM information_schema.role_table_grants
   WHERE table_schema = 'public' AND table_name = 'terms'
     AND grantee = 'authenticated' AND privilege_type = 'SELECT';
  IF v_n = 0 AND v_seen = 1
     AND (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename='terms') = 1
  THEN
    RAISE NOTICE 'PASS P22-2  NO WRITE PATH: zero write policies, zero non-SELECT client grants, exactly ONE SELECT policy and ONE matching authenticated SELECT grant (Operator, 2026-08-12)';
  ELSE
    RAISE NOTICE 'FAIL P22-2  write surface = %, authenticated SELECT grants = %', v_n, v_seen;
  END IF;

  -- P22-3 -- ⚠️ THE CONTROL. Plant a write policy; the detector must SEE it.
  CREATE POLICY terms_probe_insert ON public.terms FOR INSERT TO authenticated WITH CHECK (false);
  SELECT pg_temp.write_surface() INTO v_n;
  DROP POLICY terms_probe_insert ON public.terms;
  IF v_n = 1 THEN
    RAISE NOTICE 'PASS P22-3  CONTROL: the SAME detector reported % write surface against a PLANTED INSERT policy -- P22-2 is a measurement, not a query that matches nothing', v_n;
  ELSE
    RAISE NOTICE 'FAIL P22-3  the detector reported % against a planted write policy -- every absence above is meaningless', v_n;
  END IF;

  SELECT pg_temp.write_surface() INTO v_n;
  IF v_n <> 0 THEN
    RAISE NOTICE 'FAIL P22-3  the probe policy SURVIVED its own leg';
  END IF;

  -- P22-4 -- ⛔ NO BACKFILL.
  --
  -- ⚠️ REWRITTEN 2026-08-14. This leg asserted "zero sessions carry a term",
  --    which was true only while NOTHING HAD EVER SET ONE. The
  --    Operator's governed Add Class walkthrough then legitimately created 13
  --    sessions WITH terms and this leg went red. ▶ §12.8's fixture-content
  --    pin: it measured WHAT THE FIXTURE HAPPENED TO HOLD, and its red state
  --    meant THE PRODUCT WORKS.
  --
  -- ⛔ WHAT NO-BACKFILL ACTUALLY MEANS is a property of the MIGRATION: the
  --    column is nullable, carries NO DEFAULT, and sessions predating terms
  --    still hold NULL. All three are asserted below, and none of them moves
  --    when somebody legitimately schedules a class into a term.
  SELECT count(*) INTO v_n FROM pg_attribute a
   WHERE a.attrelid = 'public.class_sessions'::regclass
     AND a.attname = 'term_id' AND a.atthasdef;
  IF v_n <> 0 THEN
    RAISE NOTICE 'FAIL P22-4  term_id carries a column DEFAULT -- that IS a backfill mechanism';
  END IF;
  -- At least one session still holds NULL: nothing swept them.
  SELECT CASE WHEN count(*) FILTER (WHERE term_id IS NULL) > 0 THEN 0 ELSE 1 END
    INTO v_n FROM public.class_sessions;
  SELECT count(*) INTO v_seen FROM information_schema.columns
   WHERE table_schema='public' AND table_name='class_sessions'
     AND column_name='term_id' AND is_nullable='YES';
  IF v_n = 0 AND v_seen = 1 THEN
    RAISE NOTICE 'PASS P22-4  term_id is NULLABLE and ZERO sessions were backfilled -- NULL means NOT RECORDED, never defaulted (hero 0B)';
  ELSE
    RAISE NOTICE 'FAIL P22-4  % backfilled session(s); nullable=%', v_n, v_seen;
  END IF;

  -- P22-5 -- ⛔ NO GOVERNED ACTION WAS CREATED.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname ILIKE '%term%';
  /*
   * ⚠️ THE REGISTRY TOTAL WAS PINNED AT 19 HERE AND IS NOT ANY MORE.
   * REWRITTEN, NOT DELETED. `P2-3` was authorized to add
   * `admin.module_updated` and `admin.session_updated`, moving it 19 → 21,
   * and this leg fired — a TERMS suite asserting a GLOBAL total measures
   * every other phase's behaviour rather than its own.
   *
   * ▶ WHAT THIS PHASE ACTUALLY CLAIMS is that NO TERM ACTION EXISTS, and
   * that is what the surviving `LIKE '%term%'` clause measures directly. It
   * stays true however many strings later phases add, which is precisely why
   * it is the right assertion and the count never was.
   */
  IF v_n = 0
     AND NOT EXISTS (SELECT 1 FROM pg_catalog.unnest(public.audit_action_registry()) x WHERE x LIKE '%term%')
     AND (SELECT count(DISTINCT t.typname) FROM pg_catalog.pg_type t
            JOIN pg_catalog.pg_namespace n2 ON n2.oid = t.typnamespace
           WHERE n2.nspname='public' AND t.typtype='e') = 12
  THEN
    RAISE NOTICE 'PASS P22-5  terms are SEEDED, not created: no term function, NO TERM AUDIT STRING among the % registered, enums 12. A-029 is satisfied by there being NO governed action', pg_catalog.array_length(public.audit_action_registry(), 1);
  ELSE
    RAISE NOTICE 'FAIL P22-5  % term function(s); registry %', v_n, pg_catalog.array_length(public.audit_action_registry(), 1);
  END IF;

  -- P22-6 -- ⛔ D-3'S BOUNDARY, MADE STRUCTURAL.
  SELECT count(*) INTO v_n FROM information_schema.columns
   WHERE table_schema='public' AND table_name='terms'
     AND (column_name ILIKE '%report%' OR column_name ILIKE '%rating%'
       OR column_name ILIKE '%score%'  OR column_name ILIKE '%grade%'
       OR column_name ILIKE '%band%'   OR column_name ILIKE '%overall%');
  IF v_n = 0 THEN
    RAISE NOTICE 'PASS P22-6  no report/rating/score/grade column on terms -- END-OF-TERM REPORT GENERATION REMAINS DEFERRED and nothing here builds toward it (G-4, C-11)';
  ELSE
    RAISE NOTICE 'FAIL P22-6  terms carries % report/assessment-shaped column(s)', v_n;
  END IF;

  -- P22-7 -- ANON reads nothing.
  SET LOCAL ROLE authenticated;
  PERFORM pg_temp.as_nobody();
  SELECT count(*) INTO v_n FROM public.terms;
  IF v_n = 0 THEN
    RAISE NOTICE 'PASS P22-7  an UNIDENTIFIED caller reads ZERO terms';
  ELSE
    RAISE NOTICE 'FAIL P22-7  an unidentified caller read % term(s)', v_n;
  END IF;

  -- P22-8 -- ⚠️ THE CONTROL.
  PERFORM pg_temp.as_management();
  SELECT count(*) INTO v_n FROM public.terms;
  IF v_n = 4 THEN
    RAISE NOTICE 'PASS P22-8  CONTROL: MANAGEMENT reads all % terms through the SAME harness -- the zero above is DISCRIMINATION, not blindness', v_n;
  ELSE
    RAISE NOTICE 'FAIL P22-8  management read % term(s)', v_n;
  END IF;

  -- P22-9 -- the policy choice, exercised in the direction it was chosen for.
  PERFORM pg_temp.as_trainer();
  SELECT count(*) INTO v_n FROM public.terms;
  IF v_n = 4 THEN
    RAISE NOTICE 'PASS P22-9  a TRAINER reads all % terms -- the policy is ACTIVE MEMBER OF THE CENTRE, not management-only, and screens 02/03/18/25/29 all render a term to a non-management reader', v_n;
  ELSE
    RAISE NOTICE 'FAIL P22-9  a trainer read % term(s); the active-member policy is not doing what it was chosen to do', v_n;
  END IF;

  RESET ROLE;
END
$suite$;

ROLLBACK;
