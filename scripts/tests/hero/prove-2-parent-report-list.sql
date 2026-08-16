-- =====================================================================
-- HERO PHASE 2 -- the parent submitted-report LIST (screen `32`)
-- =====================================================================
-- Phase 2 adds NO database object. Its read is `report_get_canonical`
-- followed, for a pair that ALREADY resolved, by the Phase 1 context
-- function -- so what this suite proves is not a new gate but that the
-- LIST'S OWN KEY PATH reaches the context, and that the list's three
-- refusals still refuse.
--
-- ⚠️ WHY THIS DOES NOT REPEAT `B-STAGE3-2`. That incident was caused by
-- COMMITTED governed mutations driven through the served app against the
-- canonical fixture database. THIS SUITE RUNS ENTIRELY INSIDE ONE
-- TRANSACTION AND ENDS IN `ROLLBACK` -- the mechanism accepted at Phase 1
-- and now the standing pattern for any proof needing governed state.
-- plpgsql functions cannot COMMIT inside a transaction block, so no
-- governed RPC can escape the rollback either. The runner re-measures the
-- governed counts afterwards and fails if any moved.
--
-- ⚠️ NON-VACUITY IS LEG ONE, AND IT IS FIRST ON PURPOSE. With zero
-- submitted reports every refusal in this suite would pass FOR THE WRONG
-- REASON -- the same class of defect as `bool_and` over zero rows and the
-- inverted `CANONICAL_CONTAINERS` guard: an assertion passing because the
-- object it measures does not exist. P2-1 measures that the enumeration
-- actually found something BEFORE any later leg asserts over it.
--
-- ---------------------------------------------------------------------
-- ⚠️ WHAT THIS SUITE DOES NOT PROVE -- stated, not implied
-- ---------------------------------------------------------------------
-- It runs as the table owner, so the RLS scoping of `parent_student_links`
-- and `enrolments` is NOT re-proven here; that is Step 7G policy work,
-- pinned by its own suites. The enumeration below MIRRORS the projection's
-- key path in order to reach the pairs -- it is not evidence that path is
-- RLS-scoped. What IS proven for every leg is the decision that actually
-- produces or withholds a row: `report_get_canonical` is SECURITY DEFINER
-- and re-derives the caller's reach from the JWT claim this suite sets, and
-- `listParentReportsCore` drops any pair it refuses (`if (!row) continue`).
-- The rendered surface remains NOT-RUN, as on every authenticated screen.
--
-- Run by scripts/tests/hero/prove-2-parent-report-list.mjs
-- =====================================================================
\set ON_ERROR_STOP on
\pset pager off
\pset footer off

BEGIN;

CREATE FUNCTION pg_temp.as_parent() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims',
  '{"sub":"d0000000-0000-4000-8000-000000000003","role":"authenticated"}', true); END $$;

CREATE FUNCTION pg_temp.as_nobody() RETURNS void LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_catalog.set_config('request.jwt.claims', '', true); END $$;

DO $suite$
DECLARE
  v_session      uuid;
  v_student      uuid;
  v_centre       uuid;
  v_module       uuid;
  v_enrolment    uuid;
  v_obs          uuid;
  v_report       uuid;
  v_version      uuid;
  v_other_sess   uuid;
  v_trainer_mem  uuid;
  v_mgmt_mem     uuid;
  v_n            bigint;
  v_listed       bigint;
  v_before_unlink bigint;
  v_ctx          record;
  v_pass         int := 0;
  v_fail         int := 0;
BEGIN
  -- ---------------------------------------------------------------
  -- Set up, identically to Phase 1: reach a genuinely `submitted`
  -- report by writing the aggregate directly as owner. The governed
  -- lifecycle RPCs are proven elsewhere; what this suite needs is the
  -- STATE, so that every assertion below is about the LIST.
  -- ---------------------------------------------------------------
  -- ⛔ THE PAIR IS MINTED, NOT BORROWED (Operator ruling 2026-08-11). Taking
  -- a fixture pair with `ORDER BY … LIMIT 1` made this suite collide the
  -- moment the Operator's own walkthrough created a report for that pair. A
  -- session minted a statement ago cannot already have one.
  SELECT m.centre_id, m.class_module_id, m.class_session_id, m.student_id,
         m.enrolment_id, m.observation_id
    INTO v_centre, v_module, v_session, v_student, v_enrolment, v_obs
    FROM pg_temp.mint_isolated_pair('P2') m;

  UPDATE public.class_sessions
     SET lesson_number = 4, lesson_title = 'Expressive Delivery', room = 'Studio 2'
   WHERE id = v_session;

  SELECT m.id INTO v_trainer_mem FROM public.centre_memberships m
   WHERE m.role = 'trainer' AND m.status = 'active' LIMIT 1;
  SELECT m.id INTO v_mgmt_mem FROM public.centre_memberships m
   WHERE m.role = 'management' AND m.status = 'active' LIMIT 1;

  INSERT INTO public.reports (centre_id, class_session_id, class_module_id, student_id,
                              enrolment_id, observation_id, status, lock_version)
       VALUES (v_centre, v_session, v_module, v_student, v_enrolment, v_obs, 'submitted', 1)
    RETURNING id INTO v_report;

  -- ⚠️ The governed counts WHILE the minted rows exist. The runner asserts
  -- this DIFFERS from its own before-reading, which is what turns
  -- "before = after" from a tautology into a measured restoration.
  RAISE NOTICE 'DURING-COUNTS %', pg_temp.governed_counts();

  INSERT INTO public.report_versions (report_id, centre_id, revision_number,
                                      authored_by_membership_id, authored_by_role,
                                      content_hash, content_hash_version,
                                      overview, strengths, areas_for_development, remarks,
                                      submitted_at, submitted_by_membership_id, submitted_by_role)
       VALUES (v_report, v_centre, 1,
               v_trainer_mem, 'trainer',
               pg_catalog.repeat('b', 64), 2,
               'Overview prose.', 'Strengths prose.', 'Areas prose.', 'Remarks prose.',
               pg_catalog.now(), v_mgmt_mem, 'management')
    RETURNING id INTO v_version;

  UPDATE public.reports
     SET latest_submitted_version_id = v_version, current_cycle_version_id = v_version
   WHERE id = v_report;

  -- A SECOND session of the SAME module, with NO report at all. This is
  -- the candidate P2-3 needs, and it is created here rather than assumed
  -- from the fixture so the leg is deterministic whether or not the
  -- P1-T09a expansion has been applied.
  INSERT INTO public.class_sessions (centre_id, class_module_id, session_date, starts_at, ends_at)
       VALUES (v_centre, v_module, (pg_catalog.now() + INTERVAL '7 days')::date, '10:00', '11:00')
    RETURNING id INTO v_other_sess;

  RAISE NOTICE 'P2-SETUP  -- a submitted report and an unreported session exist IN THIS TRANSACTION ONLY';

  -- ---------------------------------------------------------------
  -- P2-1 -- ⚠️ NON-VACUITY, FIRST. Walk the list's own key path as a
  -- linked parent -- active links -> enrolments -> sessions -> the
  -- canonical read -- and count the rows the projection would emit.
  -- Every refusal leg below is meaningless unless this is non-zero.
  -- ---------------------------------------------------------------
  PERFORM pg_temp.as_parent();
  SELECT pg_catalog.count(*) INTO v_listed
    FROM public.parent_student_links l
    JOIN public.enrolments e      ON e.student_id = l.student_id
    JOIN public.class_sessions cs ON cs.class_module_id = e.class_module_id
   CROSS JOIN LATERAL public.report_get_canonical(cs.id, l.student_id) rc
   WHERE l.is_active;

  IF v_listed > 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P2-1 -- NON-VACUOUS: the list enumeration emits % row(s); the refusal legs below measure something that exists', v_listed;
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P2-1 -- the enumeration emitted ZERO rows; every later leg would pass for the wrong reason';
  END IF;

  -- ---------------------------------------------------------------
  -- P2-2 -- the four new meta-line fields reach a row the list emits.
  -- Read through the SAME pair the enumeration matched.
  -- ---------------------------------------------------------------
  SELECT * INTO v_ctx FROM public.report_get_canonical_context(v_session, v_student);
  IF v_ctx.class_grade_label IS NOT NULL
     AND v_ctx.class_module_title IS NOT NULL
     AND v_ctx.lesson_number = 4
     AND v_ctx.lesson_title = 'Expressive Delivery'
     AND v_ctx.trainer_display_name IS NOT NULL
  THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P2-2 -- the row carries % · % · Lesson % · % (title "%")',
      v_ctx.class_grade_label, v_ctx.class_module_title, v_ctx.lesson_number,
      v_ctx.trainer_display_name, v_ctx.lesson_title;
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P2-2 -- a meta-line field did not arrive (% / % / % / % / %)',
      v_ctx.class_grade_label, v_ctx.class_module_title, v_ctx.lesson_number,
      v_ctx.lesson_title, v_ctx.trainer_display_name;
  END IF;

  -- ---------------------------------------------------------------
  -- P2-3 -- ⛔ screen.md §6: DO NOT LIST AN UNSUBMITTED REPORT. The
  -- second session of the same module is enumerated as a candidate and
  -- must contribute nothing, because the canonical read resolves
  -- EXCLUSIVELY through `latest_submitted_version_id`.
  -- ---------------------------------------------------------------
  PERFORM pg_temp.as_parent();
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.report_get_canonical(v_other_sess, v_student);
  IF v_n = 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P2-3 -- an enumerated session with no submitted report contributes NO row';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P2-3 -- an unsubmitted session contributed % row(s)', v_n;
  END IF;

  -- ---------------------------------------------------------------
  -- P2-4 -- ⛔ screen.md §6: DO NOT LIST A REPORT FOR A CHILD WITH NO
  -- LIVE LINK. Deactivate the link inside this transaction, so the deny
  -- is measured against the SAME row the permit just used, and re-walk
  -- the whole enumeration rather than one pair.
  -- ---------------------------------------------------------------
  -- ⚠️ SCOPED TO THE MINTED LEARNER, AND THE SCOPE IS THE POINT. This
  -- counted the parent's ENTIRE list and required it to reach zero, which
  -- silently assumed the parent had exactly one linked learner. The Operator
  -- walks this database manually, so that parent now also has a REAL
  -- submitted report for a different learner — and the leg failed while the
  -- rule it tests held perfectly. ▶ **The assertion was measuring the
  -- fixture's shape as well as the rule.** Scoping it to `v_student` measures
  -- exactly the `l.is_active` predicate under test and nothing else.
  --
  -- ⛔ NOT A WEAKENING: `v_before_unlink` re-measures the SAME scoped query
  -- while the link is live, so the zero below is only reachable from a
  -- non-zero. Without that, scoping down could have made the leg pass because
  -- it now counts nothing at all.
  PERFORM pg_temp.as_parent();
  SELECT pg_catalog.count(*) INTO v_before_unlink
    FROM public.parent_student_links l
    JOIN public.enrolments e      ON e.student_id = l.student_id
    JOIN public.class_sessions cs ON cs.class_module_id = e.class_module_id
   CROSS JOIN LATERAL public.report_get_canonical(cs.id, l.student_id) rc
   WHERE l.is_active AND l.student_id = v_student;

  UPDATE public.parent_student_links SET is_active = false, unlinked_at = pg_catalog.now()
   WHERE student_id = v_student;
  PERFORM pg_temp.as_parent();
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.parent_student_links l
    JOIN public.enrolments e      ON e.student_id = l.student_id
    JOIN public.class_sessions cs ON cs.class_module_id = e.class_module_id
   CROSS JOIN LATERAL public.report_get_canonical(cs.id, l.student_id) rc
   WHERE l.is_active AND l.student_id = v_student;
  IF v_before_unlink > 0 AND v_n = 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P2-4 -- with the link withdrawn this learner emits NO row (% -> 0, whole list was %)',
      v_before_unlink, v_listed;
  ELSIF v_before_unlink = 0 THEN
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P2-4 -- VACUOUS: the scoped query listed nothing even WITH a live link, so the 0 below proves nothing';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P2-4 -- an unlinked parent still listed % row(s) for this learner', v_n;
  END IF;
  UPDATE public.parent_student_links SET is_active = true, unlinked_at = NULL
   WHERE student_id = v_student;

  -- ---------------------------------------------------------------
  -- P2-5 -- an unauthenticated caller lists nothing, and gets no
  -- context either. Both halves, because the list is two reads.
  -- ---------------------------------------------------------------
  PERFORM pg_temp.as_nobody();
  SELECT pg_catalog.count(*) INTO v_n FROM public.report_get_canonical(v_session, v_student);
  SELECT pg_catalog.count(*) INTO v_listed
    FROM public.report_get_canonical_context(v_session, v_student);
  IF v_n = 0 AND v_listed = 0 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P2-5 -- an unauthenticated caller gets neither a row nor its context';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P2-5 -- unauthenticated received % canonical row(s) and % context row(s)', v_n, v_listed;
  END IF;

  -- ---------------------------------------------------------------
  -- P2-6 -- ⛔ the context function is UNCHANGED by Phase 2. Phase 2
  -- added no database object, so its own claim is that it added none:
  -- exactly 7 returned fields, so no rating, hash, revision number,
  -- status or correction field could have been slipped onto the list row
  -- through the shared read.
  --
  -- ⛔ THIS IS NOW THE PROJECT'S SINGLE GLOBAL FUNCTION RATCHET. The P2-2
  -- phase suites pinned the whole-database totals too, and fired on three
  -- consecutive phases for a reason that was never their business -- a LATER
  -- phase legitimately adding an object. They now assert only the "nothing
  -- was added" invariants (tables, enums, policies, registry) and REPORT the
  -- growing totals. ▶ One site to update per phase, and it is this one,
  -- where moving the number requires writing down which authorization did it.
  --
  -- ⛔ THE FUNCTION COUNT MOVED 62 -> 73 ACROSS EIGHT PHASES, AND THE RATCHET
  -- WAS NEVER UPDATED BY ANY OF THEM. Corrected 2026-08-16, with each of the
  -- eleven attributed to the authorization that added it:
  --
  --   `20260815120000` P2-11  +1  admin_create_trainer
  --   `20260815150000` P2-9   +2  report_management_student_trend,
  --                               report_management_student_reports
  --   `20260816090000` P2-16  +2  competency_score,
  --                               report_class_improved_dimension
  --   `20260816120000` P2-19  +1  report_list_trainer_reports
  --   `20260816140000` P2-20  +1  report_list_trainer_students
  --   `20260816160000` P2-12  +1  admin_create_student
  --   `20260816180000` P2-13  +1  admin_create_parent
  --   `20260816200000` P2-14  +2  admin_update_student, admin_withdraw_student
  --
  -- ⚠️ `20260815090000` (Ruling A) and `20260816230000` (C-14 write path) are
  -- NET ZERO: both DROP and recreate functions that already existed — one, and
  -- four, respectively. ▶ A recreation is invisible to a count, which is
  -- exactly why the count is not the only thing this project pins.
  --
  -- ⛔ WHY IT WENT UNSEEN FOR EIGHT PHASES, WHICH IS THE FINDING. This suite is
  -- `prove:hero-2`. The per-phase sweeps enumerated the `portal-p2-N` suites,
  -- so the project's SINGLE GLOBAL function ratchet was outside every one of
  -- them. It was caught only by running all 64 `prove:*` scripts at once —
  -- plan §48.1, third instance: *"I re-ran the suites I expected to be
  -- affected, so I found the suites I expected to be affected."*
  --
  -- ⚠️ THE PARENT BOUNDARY IS UNCHANGED AND IS NOT GUARDED BY THIS COUNT. What
  -- guards it is the context field-set assertion below — still EXACTLY 7 — and
  -- P2-7a/b/c over the parent DTO. A growing function total says the project
  -- grew; it says nothing on its own about what a parent can read, and the pin
  -- exists so that growth must be WRITTEN DOWN rather than noticed later.
  --
  -- ⚠️ THE FUNCTION COUNT MOVED 61 -> 62 ON 2026-08-14, AND THE ONE IS
  -- NAMED. Portal phase P2-7 (screen `11` Management Dashboard, migration
  -- `20260814140000`) added exactly one, `report_centre_dashboard_summary`,
  -- under an Operator schema authorization that stated every count in advance
  -- and moved NOTHING ELSE: 0 tables, 0 columns, 0 enums, 0 policies, 0 client
  -- grants, registry unmoved at 23.
  -- ⛔ IT IS NOT PARENT-REACHABLE. It resolves its centre from the CALLER'S OWN
  -- active management membership -- never from a parameter -- and returns NULLs
  -- to every other caller, so a parent session reaches no row through it.
  -- ⚠️ AND IT RETURNS FOUR INTEGERS AND NOTHING ELSE. The migration's own
  -- assertions fail the build if the body ever names a rating, a panel field, a
  -- note, a checklist or a hash -- with a control proving each of those four
  -- detectors actually fires -- so this suite's subject, what a PARENT can read,
  -- is untouched and the context field-set assertion below is still exactly 7.
  -- ⛔ UPDATED WITH ITS REASON, NEVER RELAXED.
  --
  -- ⚠️ THE FUNCTION COUNT MOVED 56 -> 61 ON 2026-08-14, AND THE FIVE ARE
  -- NAMED. Portal phase P2-6 added `app_management_may_attach_material`
  -- (the sole predicate behind the one lesson-materials storage policy),
  -- `material_list_for_session`, `material_attach_confirm`,
  -- `material_signed_path` and `material_remove` (migration `20260814090000`),
  -- under the Operator schema authorization of 2026-08-13/14 whose every
  -- count was STATED IN ADVANCE. ⛔ NONE is parent-reachable: the list and
  -- path RPCs admit MANAGEMENT or the ASSIGNED TRAINER only, and attach and
  -- remove are MANAGEMENT-ONLY. ⚠️ They exist because
  -- `class_session_materials` carries ZERO policies and ZERO client grants,
  -- so there is no direct read to fall back on.
  -- ⚠️ COINCIDENCE WORTH NAMING so nobody reads it as a self-reference: this
  -- LEG is called `P2-6` and the PHASE that moved it is also called `P2-6`.
  -- They are unrelated numbering schemes.
  --
  -- ⚠️ THE FUNCTION COUNT MOVED 54 -> 56 ON 2026-08-13, AND THE TWO ARE
  -- NAMED. Portal phase P2-4 added `report_list_management_class_status` and
  -- `report_class_health_summary` (migration `20260813180000`), the two
  -- governed READS behind screen `13` Class Overview, under the Operator's
  -- ruling of the same day. ⛔ BOTH ARE MANAGEMENT-ONLY and neither is
  -- parent-reachable. ⚠️ They exist ONLY because `reports`, `observations`
  -- and `report_evidence` carry ZERO policies and ZERO client grants --
  -- measured, and re-asserted by that migration's `V-7`, which fails the
  -- build if that ever stops being true. ⛔ THE AUDIT REGISTRY IS UNMOVED AT
  -- 21: a read is not a governed ACTION (`A-029`).
  --
  -- ⚠️ AND NEITHER RETURNS A RATING. Assertion `V-4` fails the build if
  -- either function so much as NAMES one, matched as a bare substring so it
  -- also catches `observation_ratings`, `report_version_ratings` and
  -- `competency_rating` without enumerating them (`C-9`, `G-2`, `A-038`).
  --
  -- ⚠️ THE FUNCTION COUNT MOVED 52 -> 54 ON 2026-08-13, AND THE TWO ARE
  -- NAMED. Portal phase P2-3 added `admin_update_class_module` and
  -- `admin_update_class_session` (migration `20260813150000`), the governed
  -- class edit behind screen `27`, under the Operator's ruling of the same day
  -- authorizing EXACTLY two audit strings -- `admin.module_updated` and
  -- `admin.session_updated`, registry 19 -> 21, with the count stated in
  -- advance. ⛔ BOTH ARE MANAGEMENT-ONLY, neither is parent-reachable, and
  -- neither touches a report, rating or observation: the migration carries
  -- assertion `U-6`, which fails the build if either function ever mentions
  -- one. ⚠️ THE REGISTRY MOVING IS WHY THREE OTHER SUITES FIRED at this
  -- boundary -- `P2-2`, `P2-2b`'s create sibling and the terms substrate each
  -- pinned the registry TOTAL, which is a phase-scoped claim written as a
  -- global absolute. All three were re-derived to assert only what their own
  -- phase did; this leg stays a global ratchet because that is its job.
  --
  -- ⚠️ THE FUNCTION COUNT MOVED 51 -> 52 ON 2026-08-13, AND THE ONE IS NAMED.
  -- Portal phase P2-2b added `admin_assign_session_trainer` (migration
  -- `20260813120000`), the governed trainer assignment, under the Operator's
  -- ruling of the same day. ⛔ It emits `admin.trainer_assigned`, which was
  -- ALREADY in the registry -- ratified at Step 7H and simply never written --
  -- so the registry is UNMOVED at 19. It is MANAGEMENT-ONLY, is not
  -- parent-reachable, and touches no report, rating or observation.
  --
  -- ⚠️ THE FUNCTION COUNT PREVIOUSLY MOVED 49 -> 51 ON 2026-08-13, AND THE TWO ARE NAMED.
  -- Portal phase P2-2 (migration `20260813090000`, screen `26` Add Class,
  -- under the C-7 per-phase ruling read as reading B) added exactly two:
  -- `admin_create_class_module` and `admin_create_class_session`. Both are
  -- MANAGEMENT-ONLY governed writes firing the two already-ratified audit
  -- strings `admin.module_created` and `admin.session_created`.
  -- ⛔ NEITHER IS PARENT-REACHABLE and neither touches a report, a rating or
  -- an observation -- the migration's own assertion `C-9` fails the build if
  -- either ever mentions one -- so this suite's subject, what a PARENT can
  -- read, is untouched and the context field-set assertion below is still
  -- exactly 7. ⛔ UPDATED WITH ITS REASON, NEVER RELAXED.
  --
  -- ⚠️ THE FUNCTION COUNT PREVIOUSLY MOVED 43 -> 49 ON 2026-08-12, AND THE SIX ARE NAMED.
  -- Portal phase P1-2 (migration `20260812090000`, D-5 evidence substrate,
  -- under the C-7 table-family ruling) added: `audit_action_registry`,
  -- `app_trainer_may_attach_evidence`, `evidence_attach_confirm`,
  -- `evidence_list_for_report`, `evidence_record_access` and
  -- `evidence_remove`. ⛔ UPDATED WITH ITS REASON, NEVER RELAXED.
  -- ⚠️ NONE OF THE SIX IS PARENT-REACHABLE: `evidence_list_for_report` has
  -- NO PARENT ARM AT ALL (A-002 is unruled and it was deliberately not
  -- built), so this suite's subject -- what a parent can read -- is
  -- untouched, and the context field-set assertion below is still exactly 7.
  --
  -- ⚠️ THE FUNCTION COUNT MOVED 42 -> 43 ON 2026-08-11, AND THE REASON IS
  -- NAMED HERE RATHER THAN QUIETLY BUMPED. Portal phase P1-1b added exactly
  -- one function, `report_get_management_ratings` (migration
  -- `20260811140000`), under a bounded Operator authorization implementing
  -- D-1. ⛔ THE PIN IS UPDATED, NEVER REMOVED: it fired correctly, and a
  -- census ratchet that gets deleted the first time it is inconvenient is
  -- not a ratchet. ⚠️ AND THE NEW FUNCTION CHANGES NOTHING THIS SUITE
  -- PROTECTS -- it is MANAGEMENT-ONLY and returns no parent-reachable field;
  -- the context field-set assertion below is what proves that, and it is
  -- unchanged at exactly 7.
  --
  -- ⚠️ THE FUNCTION COUNT PREVIOUSLY MOVED 41 -> 42, AND THAT REASON IS KEPT
  -- RATHER THAN QUIETLY BUMPED. Phase 7 added exactly one function,
  -- `assessment_save_follow_up_notes`, under a bounded Operator
  -- authorization (migration `20260811090000`). This leg failed on the
  -- first Phase 9 run because it still pinned 41 -- ⚠️ A PINNED CENSUS IN
  -- ONE PHASE'S PROOF GOES STALE THE MOMENT A LATER PHASE LEGITIMATELY
  -- ADDS AN OBJECT, and it should have been re-run at the Phase 7
  -- boundary rather than discovered at the Phase 9 one.
  --
  -- ⛔ It is deliberately NOT relaxed to `>= 41` or dropped. A census
  -- assertion whose number may drift for unnamed reasons asserts nothing;
  -- the value of this leg is precisely that changing it requires someone
  -- to write down which authorization moved it.
  -- ---------------------------------------------------------------
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'report_get_canonical_context'
     AND pg_catalog.array_length(p.proargnames, 1) = 9;  -- 2 IN + 7 OUT
  SELECT pg_catalog.count(*) INTO v_listed
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public';
  IF v_n = 1 AND v_listed = 73 THEN
    v_pass := v_pass + 1;
    RAISE NOTICE 'PASS P2-6 -- 73 functions and the context return set is still exactly 7. This is the project''s SINGLE global function ratchet, and the eleven added since it last read 62 are attributed one by one in the comment above (P2-11, P2-9, P2-16, P2-19, P2-20, P2-12, P2-13, P2-14)';
  ELSE
    v_fail := v_fail + 1;
    RAISE WARNING 'FAIL P2-6 -- % function(s) in public (expected 73) and context field-set match = %', v_listed, v_n;
  END IF;

  RAISE NOTICE '--- Phase 2 parent-list suite: % passed, % failed ---', v_pass, v_fail;
  IF v_fail > 0 THEN
    RAISE EXCEPTION 'Phase 2 parent-list suite FAILED with % failure(s)', v_fail;
  END IF;
  IF v_pass <> 6 THEN
    RAISE EXCEPTION 'Phase 2 parent-list suite is INCOMPLETE: % of 6 legs ran; an unrun leg is NOT-RUN, never PASS', v_pass;
  END IF;
END;
$suite$;

-- ⚠️ NOTHING ABOVE IS KEPT. The canonical fixture database is unchanged.
ROLLBACK;
