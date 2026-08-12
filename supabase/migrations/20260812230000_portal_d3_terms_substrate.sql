-- =====================================================================
-- PORTAL PHASE P2-2 -- D-3: THE TERMS SUBSTRATE.
-- =====================================================================
-- Authorized by the Operator on 2026-08-12 under `C-7`, as the per-phase
-- schema ruling `PORTAL_COMPLETION_PLAN.md` section `P2-2` asked for, and
-- authorized EXACTLY AS PROPOSED AND NO MORE:
--
--     table terms
--     class_sessions.term_id, nullable, NO backfill
--     one RLS SELECT policy and one matching grant, on terms ONLY
--     SECURITY DEFINER read RPCs as needed
--     zero enums, zero new audit strings, zero write policies, zero write grants
--
-- ---------------------------------------------------------------------
-- ⛔ TERMS ARE SEEDED, NOT CREATED -- AND THAT IS WHY THERE IS NO RPC HERE
-- ---------------------------------------------------------------------
-- Operator ruling, decision 1, option (c), recorded in their words because
-- it is the reason this file contains no function at all:
--
--     "Terms are academy calendar structure, not a user-created object in
--      this product. There is no term-creation screen in the ratified
--      inventory, no ruled actor for the act, and building an RPC for
--      something nobody performs is scope I would then have to defend.
--      Seeding removes the RPC and the audit question together, and
--      satisfies A-029 trivially rather than by argument: no governed
--      action, no event. No twentieth string."
--
-- ▶ SO: NO governed action exists here, therefore NO audit event is owed,
--   therefore the Step 7H registry stays at EXACTLY 19. `A-029`'s
--   one-event-per-governed-action rule is satisfied by there being no
--   action, which is a stronger position than satisfying it by argument.
--
-- ⚠️ AND NO READ RPC EITHER. The authorization permits "SECURITY DEFINER
-- read RPCs AS NEEDED", and measured against the alternative, NONE IS
-- NEEDED: one RLS SELECT policy plus its minimum matching grant already
-- serves every reader this substrate has. A `SECURITY DEFINER` function
-- added "for symmetry" would be a second gate to keep in step with the
-- policy, for no capability the policy does not already provide. The
-- narrower instrument wins, exactly as it did at `P2-1`.
--
-- ---------------------------------------------------------------------
-- ⛔ D-3'S BOUNDARY, STATED HERE BECAUSE THE OPERATOR REQUIRED IT IN THE
--    MIGRATION AND NOT ONLY IN A PLAN
-- ---------------------------------------------------------------------
-- TERMS ARE SCHEDULING STRUCTURE. **END-OF-TERM REPORT GENERATION REMAINS
-- DEFERRED** (`CLAUDE.md` section 8; spec section 28; `G-4`'s protected
-- deferral, which `D-3` expressly did NOT reverse), and **Management Term
-- Report (screen `28`) remains separately governed and DEFERRED by `C-11`**,
-- with `A-044`'s requirement noted and unmet DELIBERATELY.
--
-- ⛔ NOTHING IN THIS PHASE MAY BUILD TOWARD A TERM REPORT. Building the term
--    entity does NOT authorize term reports, and a later reader must not
--    treat this table's existence as evidence that it does. That is the
--    precise back door `G-4` refused to open, and `D-3` reopened only for
--    scheduling structure the calendar features genuinely need.
--
-- ---------------------------------------------------------------------
-- ⛔ NO WRITE PATH ANYWHERE -- AND THE ABSENCE IS ASSERTED, NOT PROMISED
-- ---------------------------------------------------------------------
-- Operator: "NO WRITE PATH ANYWHERE. If a later phase needs one, it comes
-- back to me as its own question. Assert the absence -- a leg that fails
-- the migration if a write policy or grant on terms ever appears, the way
-- E1 and E9 were written."
--
-- ▶ Assertion `T-6` does exactly that and it FAILS THIS MIGRATION rather
--   than reporting. A reason that lives only in a comment cannot stop a
--   later phase adding an INSERT policy for query convenience; one that
--   fails the build can. `prove:portal-p2-2` re-asserts it at every phase
--   boundary, because an in-migration assertion only ever runs once.
--
-- ---------------------------------------------------------------------
-- ⚠️ THE SEED VALUES ARE A DEVELOPMENT CALENDAR AND MUST BE REPLACED
-- ---------------------------------------------------------------------
-- ⛔ READ THIS BEFORE ANY PRODUCTION USE. Unlike the Step 7E seed -- whose
-- one centre, three Class Grades and nine dimensions are all RATIFIED
-- values -- **NO DOCUMENT IN THIS PROJECT ESTABLISHES iSpeak's REAL TERM
-- CALENDAR.** The frame renders exactly one example label, `"Term 1, 2035"`,
-- and nothing anywhere fixes how many terms a year holds or when they run.
--
-- ▶ The four rows below are therefore a DETERMINISTIC DEVELOPMENT CALENDAR:
--   calendar-quarter boundaries for 2026, in the frame's ratified label
--   shape. They are chosen to SPAN the sessions that exist (measured:
--   4 sessions, 2026-02-03 .. 2026-02-17, all inside Term 1).
--
-- ⛔ THEY ARE NOT THE ACADEMY'S CALENDAR AND ARE NOT PRESENTED AS ONE. The
--   real calendar is an OPERATOR INPUT and replacing these is an Operator
--   act, not a later session's inference. Assertion `T-7` pins the count at
--   exactly four so the placeholder cannot be silently grown into something
--   that looks ratified.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1 -- THE TABLE.
-- ---------------------------------------------------------------------
CREATE TABLE public.terms (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Centre-owned, like `class_grades` and unlike the GLOBAL
  -- `assessment_dimensions`: a term is one academy's calendar, and the
  -- framework is not per-centre configuration but a calendar is.
  centre_id   uuid        NOT NULL REFERENCES public.centres (id) ON DELETE RESTRICT,
  -- ⚠️ ONE field, not a number plus a year. Every frame that mentions a
  -- term renders a SINGLE STRING (`"Term 1, 2035"`, `"Term 1 · 2026"`), and
  -- splitting it would invent a structure no frame shows and no rule
  -- requires -- schema by inference from a frame (`A-022`).
  label       text        NOT NULL,
  -- The scheduling substance. `D-3` builds terms BECAUSE the calendar
  -- features need the structure, and a term with no boundaries scopes
  -- nothing at all.
  starts_on   date        NOT NULL,
  ends_on     date        NOT NULL,
  -- Matches `class_modules` / `enrolments`: a closed term is DEACTIVATED,
  -- never physically deleted, so history stays readable.
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT terms_dates_chk CHECK (ends_on >= starts_on),
  -- A centre cannot hold two terms with the same name, which is what makes
  -- the label safe to RENDER as an identity.
  CONSTRAINT terms_centre_label_key UNIQUE (centre_id, label)
);

-- ⛔ NO OVERLAP CONSTRAINT BETWEEN TERMS, DELIBERATELY. Real academies run
-- overlapping intensives and holiday programmes, and an `EXCLUDE` here
-- would refuse a legitimate arrangement to enforce a rule nobody ratified.
-- Recorded so its absence is read as a decision rather than an omission.

COMMENT ON TABLE public.terms IS
  'D-3 scheduling structure: named, dated periods that group CLASS SESSIONS. '
  'C-6: there is NO lessons entity -- terms group sessions, and lesson identity '
  'stays the two columns on class_sessions. Seeded, never created: no write path '
  'exists and none may be added without its own Operator ruling. '
  'END-OF-TERM REPORT GENERATION REMAINS DEFERRED -- this table authorizes nothing '
  'toward it (CLAUDE.md section 8; G-4; C-11).';

CREATE INDEX terms_centre_active_idx ON public.terms (centre_id, is_active, starts_on);

-- ---------------------------------------------------------------------
-- 2 -- THE SESSION LINK. NULLABLE, AND NOT BACKFILLED.
-- ---------------------------------------------------------------------
-- ⚠️ NULLABLE IS THE LOAD-BEARING CHOICE, NOT A CONVENIENCE. Every existing
-- `class_sessions` row predates terms. `NOT NULL` would either refuse this
-- migration or force a backfill that INVENTS A TERM for sessions nobody
-- assigned one to -- and hero 0B already ruled that `NULL` means NOT
-- RECORDED and the element is OMITTED, never defaulted. Assertion `T-4`
-- proves no row was backfilled.
ALTER TABLE public.class_sessions
  ADD COLUMN term_id uuid NULL REFERENCES public.terms (id) ON DELETE RESTRICT;

-- ⚠️ A PLAIN FK, NOT THE COMPOSITE `(term_id, centre_id)` FORM used by
-- `report_evidence`. The reason is the inverse of that case: a session
-- ALREADY carries `centre_id` and `class_module_id`, and the module already
-- pins the centre -- so a third path to the same centre would be a THIRD
-- ANSWER THAT CAN DISAGREE. Centre agreement is instead a property of
-- whatever eventually writes this column, and nothing writes it today.
COMMENT ON COLUMN public.class_sessions.term_id IS
  'D-3: the term this session belongs to. NULLABLE and NOT backfilled -- NULL means '
  'NOT RECORDED and the element is omitted, never defaulted (hero 0B). No write path '
  'sets this column at this migration; adding one is its own Operator question.';

CREATE INDEX class_sessions_term_idx ON public.class_sessions (term_id) WHERE term_id IS NOT NULL;

-- ---------------------------------------------------------------------
-- 3 -- RLS: ONE SELECT POLICY AND ITS ONE MATCHING GRANT. NOTHING ELSE.
-- ---------------------------------------------------------------------
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;

-- ⚠️ ACTIVE MEMBER OF THE CENTRE, NOT MANAGEMENT-ONLY -- and that is a
-- deliberate reading of who reads a term. Screens `02`, `03`, `18`, `25`
-- and `29` all render a term to a NON-management reader, so a
-- management-only policy would need a second instrument later to serve the
-- same field. It mirrors `class_grades_select_active_member` exactly,
-- because a term is the same KIND of thing: centre-owned scheduling
-- vocabulary that carries no authorization of its own.
CREATE POLICY terms_select_active_member ON public.terms
  FOR SELECT TO authenticated
  USING (public.app_has_active_membership(centre_id, NULL::public.centre_membership_role));

-- A policy and its MINIMUM MATCHING GRANT ship together (A-030, Step 7G).
-- Here that is exactly one of each.
GRANT SELECT ON public.terms TO authenticated;

-- ⛔ NO INSERT, UPDATE OR DELETE POLICY. NO WRITE GRANT. NOT TO
--    `authenticated`, NOT TO `anon`, NOT TO `service_role`. Assertion T-6
--    fails this migration if any exists.

-- ---------------------------------------------------------------------
-- 4 -- THE SEED. Fixed literal UUIDs, identical in every environment.
-- ---------------------------------------------------------------------
-- Step 7E discipline: a seed ASSERTS ON THE NATURAL KEY and FAILS ON
-- DIVERGENCE -- never a silent upsert and never a quiet do-nothing.
INSERT INTO public.terms (id, centre_id, label, starts_on, ends_on)
SELECT v.id, c.id, v.label, v.starts_on, v.ends_on
  FROM (VALUES
    ('f0000000-0000-4000-8000-000000000001'::uuid, 'Term 1, 2026', DATE '2026-01-01', DATE '2026-03-31'),
    ('f0000000-0000-4000-8000-000000000002'::uuid, 'Term 2, 2026', DATE '2026-04-01', DATE '2026-06-30'),
    ('f0000000-0000-4000-8000-000000000003'::uuid, 'Term 3, 2026', DATE '2026-07-01', DATE '2026-09-30'),
    ('f0000000-0000-4000-8000-000000000004'::uuid, 'Term 4, 2026', DATE '2026-10-01', DATE '2026-12-31')
  ) AS v(id, label, starts_on, ends_on)
 CROSS JOIN (SELECT id FROM public.centres WHERE code = 'ispeak') AS c;

-- ---------------------------------------------------------------------
-- 5 -- IN-TRANSACTION ASSERTIONS. Each FAILS THE MIGRATION.
-- ---------------------------------------------------------------------
DO $assert$
DECLARE
  v_n integer;
BEGIN
  -- T-1 -- the table exists with exactly the authorized columns, and no more.
  --
  -- ⚠️ THIS ASSERTION FAILED THE FIRST APPLY OF THIS MIGRATION, AND IT WAS
  -- RIGHT TO. It was written expecting 7 while the table declares 8
  -- (`id`, `centre_id`, `label`, `starts_on`, `ends_on`, `is_active`,
  -- `created_at`, `updated_at`) -- an author's miscount, caught by the
  -- author's own guard rather than by review, and the transaction aborted
  -- leaving NO partial state. ▶ Recorded rather than quietly amended,
  -- because a count pinned to the wrong number is indistinguishable from a
  -- correct one until something moves.
  SELECT count(*) INTO v_n
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'terms';
  IF v_n <> 8 THEN
    RAISE EXCEPTION 'P2-2 assertion T-1 failed: terms has % columns, expected exactly 8', v_n;
  END IF;

  -- T-2 -- ⛔ NO COLUMN THAT COULD CARRY A REPORT, A RATING OR A ROLL-UP.
  -- Terms are scheduling structure; the moment one grows a `grade`, a
  -- `score` or a `report_id` it has stopped being one, and that is the
  -- exact drift toward term REPORTS that C-11 and G-4 both refuse.
  SELECT count(*) INTO v_n
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'terms'
     AND (column_name ILIKE '%report%' OR column_name ILIKE '%rating%'
       OR column_name ILIKE '%score%'  OR column_name ILIKE '%grade%'
       OR column_name ILIKE '%band%'   OR column_name ILIKE '%overall%');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-2 assertion T-2 failed: terms carries % report/assessment-shaped column(s)', v_n;
  END IF;

  -- T-3 -- the session link is NULLABLE.
  SELECT count(*) INTO v_n
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'class_sessions'
     AND column_name = 'term_id' AND is_nullable = 'YES';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'P2-2 assertion T-3 failed: class_sessions.term_id is absent or NOT NULL';
  END IF;

  -- T-4 -- ⛔ NO BACKFILL. Every pre-existing session keeps a NULL term.
  SELECT count(*) INTO v_n FROM public.class_sessions WHERE term_id IS NOT NULL;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-2 assertion T-4 failed: % session(s) were backfilled with a term', v_n;
  END IF;

  -- T-5 -- exactly ONE policy on terms, and it is a SELECT policy.
  SELECT count(*) INTO v_n FROM pg_policies
   WHERE schemaname = 'public' AND tablename = 'terms';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'P2-2 assertion T-5 failed: terms carries % policies, expected exactly 1', v_n;
  END IF;

  -- T-6 -- ⛔ THE OPERATOR-REQUIRED WRITE GUARD, IN THE E1/E9 SHAPE.
  -- It FAILS THE MIGRATION rather than reporting, because a reason that
  -- lives only in prose cannot stop a later phase adding an INSERT policy
  -- for query convenience.
  SELECT count(*) INTO v_n FROM pg_policies
   WHERE schemaname = 'public' AND tablename = 'terms' AND cmd <> 'SELECT';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-2 assertion T-6 failed: % WRITE policy/policies on terms -- NO WRITE PATH ANYWHERE (Operator, 2026-08-12)', v_n;
  END IF;

  SELECT count(*) INTO v_n FROM information_schema.role_table_grants
   WHERE table_schema = 'public' AND table_name = 'terms'
     AND grantee IN ('anon', 'authenticated', 'service_role')
     AND privilege_type <> 'SELECT';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-2 assertion T-6 failed: % non-SELECT client grant(s) on terms -- NO WRITE PATH ANYWHERE', v_n;
  END IF;

  SELECT count(*) INTO v_n FROM information_schema.role_table_grants
   WHERE table_schema = 'public' AND table_name = 'terms'
     AND grantee = 'authenticated' AND privilege_type = 'SELECT';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'P2-2 assertion T-6 failed: the policy has no matching authenticated SELECT grant (A-030)';
  END IF;

  -- T-7 -- the seed is EXACTLY four rows, all in the one centre. Pinned so
  -- a DEVELOPMENT CALENDAR PLACEHOLDER cannot be silently grown into
  -- something that reads as ratified.
  SELECT count(*) INTO v_n FROM public.terms;
  IF v_n <> 4 THEN
    RAISE EXCEPTION 'P2-2 assertion T-7 failed: % term row(s) seeded, expected exactly 4', v_n;
  END IF;

  SELECT count(*) INTO v_n
    FROM public.terms t JOIN public.centres c ON c.id = t.centre_id
   WHERE c.code <> 'ispeak';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-2 assertion T-7 failed: % term(s) seeded outside the sole centre', v_n;
  END IF;

  -- T-8 -- ⛔ NO NEW AUDIT ACTION STRING. Terms are SEEDED, so there is no
  -- governed action and therefore no event is owed (A-029, satisfied by
  -- there being no action rather than by argument). Registry stays at 19.
  IF pg_catalog.array_length(public.audit_action_registry(), 1) <> 19 THEN
    RAISE EXCEPTION 'P2-2 assertion T-8 failed: the audit registry is no longer 19';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_catalog.unnest(public.audit_action_registry()) x WHERE x LIKE '%term%') THEN
    RAISE EXCEPTION 'P2-2 assertion T-8 failed: a term audit action string was added';
  END IF;

  -- T-9 -- ⛔ NO FUNCTION WAS ADDED BY THIS MIGRATION. The authorization
  -- permitted read RPCs "as needed" and none was needed: the policy plus
  -- its grant already serves every reader, and a SECURITY DEFINER function
  -- added for symmetry would be a second gate to keep in step.
  SELECT count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname ILIKE '%term%';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'P2-2 assertion T-9 failed: % term function(s) exist -- none was needed', v_n;
  END IF;

  -- T-10 -- ⛔ NO ENUM WAS ADDED OR EXTENDED.
  SELECT count(DISTINCT t.typname) INTO v_n
    FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN
    RAISE EXCEPTION 'P2-2 assertion T-10 failed: % enums, expected 12', v_n;
  END IF;

  RAISE NOTICE 'P2-2 assertions T-1..T-10 PASSED: terms seeded, read-only, no write path, registry 19, no function, no enum';
END
$assert$;

COMMIT;
