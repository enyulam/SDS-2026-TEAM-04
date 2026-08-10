-- =====================================================================
-- SHARED PRELUDE -- a SELF-CONTAINED pair, minted inside the caller's
-- transaction, so no suite ever borrows a fixture row again.
-- =====================================================================
-- ⛔ WHY THIS EXISTS -- Operator ruling, 2026-08-11.
--
-- `prove:hero-1/2/7/9` each picked a (class_session, student) pair out of
-- the fixture with `ORDER BY … LIMIT 1` and inserted a `reports` row for
-- it. The Operator walked the app manually, the app created reports for
-- those same pairs, and all four suites began failing on
-- `reports_session_student_key` with ZERO legs executed.
--
-- ▶ **THE SUITES DEPENDED ON THE STATE OF A DATABASE A HUMAN USES.**
--
-- Two cheaper repairs were considered and REJECTED by ruling:
--   * a disposable clone -- it inherits the walkthrough rows anyway (a
--     TEMPLATE copy is a copy), and it DESTROYS the byte-unmoved proof,
--     which is the strongest property these four suites have;
--   * `WHERE NOT EXISTS (SELECT 1 FROM reports …)` -- it unblocks today but
--     makes coverage depend on fixture headroom, and the Operator will keep
--     walking, so the headroom gets exhausted again.
--
-- ▶ **Minting the pair makes the collision STRUCTURALLY IMPOSSIBLE**: a
--   session that did not exist a moment ago cannot already have a report.
--   The transaction still ends in ROLLBACK, so the byte-unmoved assertion
--   survives AGAINST THE REAL DATABASE.
--
-- ---------------------------------------------------------------------
-- ⚠️ EVERY FK AND CHECK IS SATISFIED HONESTLY, NEVER WORKED AROUND.
-- ---------------------------------------------------------------------
-- The composite keys are the awkward part and they are the point: the FKs
-- here are (id, centre_id), (id, class_module_id), (id, class_module_id,
-- student_id) and (membership_id, centre_id, role) -- so a row cannot be
-- created that silently belongs to two centres or names a membership whose
-- role does not match. The three `(NOT is_active) = (…_at IS NOT NULL)`
-- pair-checks are satisfied by leaving BOTH sides at their active default.
-- ⛔ If the schema refuses a shape here, the SHAPE is wrong -- not the
--    schema. It has been right every previous time.
--
-- ⚠️ IDENTITIES ARE RESOLVED THROUGH `auth_user_id`, NOT BY `role … LIMIT
-- 1`. The suites impersonate three exact fixture identities; linking the
-- minted student to "some active parent" would pass today and silently
-- link the WRONG parent the moment a second parent exists, turning the
-- permit leg into a proof about nobody.
-- =====================================================================

CREATE FUNCTION pg_temp.mint_isolated_pair(
  p_label                    text,
  OUT centre_id              uuid,
  OUT class_module_id        uuid,
  OUT class_session_id       uuid,
  OUT student_id             uuid,
  OUT enrolment_id           uuid,
  OUT observation_id         uuid,
  OUT trainer_membership_id  uuid,
  OUT management_membership_id uuid,
  OUT parent_membership_id   uuid
) LANGUAGE plpgsql AS $mint$
DECLARE
  -- ⚠️ LOCALS THROUGHOUT, ASSIGNED TO THE `OUT` PARAMETERS ONLY AT THE END.
  -- The first shape of this function used the OUT names directly and Postgres
  -- rejected it -- `centre_id` is both an OUT parameter and a column on four
  -- of these tables, so `WHERE cm.centre_id = centre_id` is genuinely
  -- ambiguous. ▶ The schema was right again; the shape was wrong. Locals
  -- remove the class of error rather than the one occurrence.
  v_centre    uuid;
  v_module    uuid;
  v_session   uuid;
  v_student   uuid;
  v_enrolment uuid;
  v_obs       uuid;
  v_trainer   uuid;
  v_mgmt      uuid;
  v_parent    uuid;
  v_dim       record;
  v_i         int := 0;
BEGIN
  -- 1. The three impersonated identities, resolved by their AUTH uuid.
  SELECT m.id, m.centre_id INTO v_trainer, v_centre
    FROM public.centre_memberships m JOIN public.accounts a ON a.id = m.account_id
   WHERE a.auth_user_id = 'd0000000-0000-4000-8000-000000000002' AND m.status = 'active';
  SELECT m.id INTO v_mgmt
    FROM public.centre_memberships m JOIN public.accounts a ON a.id = m.account_id
   WHERE a.auth_user_id = 'd0000000-0000-4000-8000-000000000001' AND m.status = 'active';
  SELECT m.id INTO v_parent
    FROM public.centre_memberships m JOIN public.accounts a ON a.id = m.account_id
   WHERE a.auth_user_id = 'd0000000-0000-4000-8000-000000000003' AND m.status = 'active';

  IF v_trainer IS NULL OR v_mgmt IS NULL OR v_parent IS NULL THEN
    RAISE EXCEPTION 'MINT failed: one of the three fixture identities has no active membership';
  END IF;

  -- 2. A Class Module of that centre is BORROWED, deliberately. A module is
  --    not part of any uniqueness the suites collide on, and inventing one
  --    would also require a Class Grade -- more surface, no more isolation.
  SELECT cm.id INTO v_module
    FROM public.class_modules cm WHERE cm.centre_id = v_centre ORDER BY cm.id LIMIT 1;
  IF v_module IS NULL THEN
    RAISE EXCEPTION 'MINT failed: the centre has no Class Module to hang a session on';
  END IF;

  -- 3. Everything the collision touches is MINTED.
  INSERT INTO public.students (centre_id, full_name)
       VALUES (v_centre, 'Isolated Fixture ' || p_label)
    RETURNING id INTO v_student;

  INSERT INTO public.enrolments (centre_id, class_module_id, student_id)
       VALUES (v_centre, v_module, v_student)
    RETURNING id INTO v_enrolment;

  -- A PAST date: a future-dated session is refused by the governed session
  -- gate, and a suite must not fail for a reason it is not testing.
  INSERT INTO public.class_sessions (centre_id, class_module_id, session_date, starts_at, ends_at)
       VALUES (v_centre, v_module, (pg_catalog.now())::date - 1, '10:00', '11:00')
    RETURNING id INTO v_session;

  -- The assigned trainer -- required for G-5's trainer-name leg.
  INSERT INTO public.class_session_assignments (centre_id, class_session_id, trainer_membership_id)
       VALUES (v_centre, v_session, v_trainer);

  -- The link the parent permit leg reads. `is_active`/`unlinked_at` are left
  -- at their active defaults so the pair-check holds without being named.
  INSERT INTO public.parent_student_links (centre_id, parent_membership_id, student_id)
       VALUES (v_centre, v_parent, v_student);

  -- ⚠️ `follow_up_notes` is seeded deliberately: `prove:hero-7` edits a note
  -- that must ALREADY exist, and its old setup selected an observation on
  -- exactly that predicate. Minting one keeps the precondition honest rather
  -- than making the suite hunt for a fixture row that satisfies it.
  INSERT INTO public.observations (centre_id, class_session_id, class_module_id, student_id,
                                   enrolment_id, trainer_membership_id,
                                   observation_notes, follow_up_notes)
       VALUES (v_centre, v_session, v_module, v_student,
               v_enrolment, v_trainer,
               'Minted observation for ' || p_label,
               'Minted prior follow-up for ' || p_label)
    RETURNING id INTO v_obs;

  -- All nine dimensions, deliberately MIXED -- the fixture shape §11 requires,
  -- so a grounding-sensitive read is never handed a uniform rating set.
  FOR v_dim IN SELECT d.code FROM public.assessment_dimensions d ORDER BY d.sort_order LOOP
    v_i := v_i + 1;
    INSERT INTO public.observation_ratings (observation_id, dimension_code, rating)
         VALUES (v_obs, v_dim.code,
                 (CASE v_i % 4 WHEN 0 THEN 'beginning' WHEN 1 THEN 'developing'
                               WHEN 2 THEN 'mastering' ELSE 'mastered' END)::public.competency_rating);
  END LOOP;

  IF v_i <> 9 THEN
    RAISE EXCEPTION 'MINT failed: expected 9 assessment dimensions, found %', v_i;
  END IF;

  centre_id               := v_centre;
  class_module_id         := v_module;
  class_session_id        := v_session;
  student_id              := v_student;
  enrolment_id            := v_enrolment;
  observation_id          := v_obs;
  trainer_membership_id   := v_trainer;
  management_membership_id := v_mgmt;
  parent_membership_id    := v_parent;
END $mint$;

-- ---------------------------------------------------------------------
-- The SAME six governed counts the runner measures, callable from INSIDE
-- the transaction.
-- ---------------------------------------------------------------------
-- ⚠️ THIS IS WHAT MAKES "BYTE-UNMOVED" A MEASUREMENT RATHER THAN A
-- TAUTOLOGY. The runner compares before-vs-after and they are equal -- but
-- equal is also what a query that counts NOTHING returns. Emitting the same
-- counts MID-TRANSACTION, while the minted rows exist, proves the query is
-- SENSITIVE to exactly the rows this suite creates. `during <> before` and
-- `after = before` together mean the rollback restored a state that had
-- genuinely moved.
CREATE FUNCTION pg_temp.governed_counts() RETURNS text LANGUAGE sql AS $c$
  SELECT (SELECT count(*) FROM public.reports)
    || '|' || (SELECT count(*) FROM public.report_versions)
    || '|' || (SELECT count(*) FROM public.audit_events)
    || '|' || (SELECT count(*) FROM public.audit_chain_heads)
    || '|' || (SELECT count(*) FROM public.class_sessions WHERE lesson_number IS NOT NULL)
    || '|' || (SELECT count(*) FROM public.parent_student_links WHERE is_active)
    || '|' || (SELECT count(*) FROM public.students)
    || '|' || (SELECT count(*) FROM public.enrolments)
    || '|' || (SELECT count(*) FROM public.observations);
$c$;
