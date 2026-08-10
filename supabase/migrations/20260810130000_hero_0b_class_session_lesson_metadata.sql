-- =====================================================================
-- B.E.S.T Coach -- Hero chain Phase 0B: session descriptive metadata
-- =====================================================================
-- Governing authority (highest first):
--   Specification v3 -> Amendments 001 ... 008 -> FINAL_MVP_AUTHORITY_LOCK
--   -> FINAL_MVP_HERO_CHAIN_RULINGS.md (G-3 lesson identity, G-6 room)
--   -> CLAUDE.md -> docs/plan/HERO_CHAIN_COMPLETION_PLAN.md Phase 0B
--
-- ⚠️ AUTHORIZATION. G-3 and G-6 are SCOPE rulings and expressly state
--    they are NOT migration authorizations. This migration is written
--    under the SEPARATE, explicitly-named Operator authorization of
--    2026-08-10, which names lesson number, lesson title and room as
--    schema and bounds the work to exactly that.
--
-- WHAT THIS MIGRATION CREATES:
--   * 3 columns on public.class_sessions ..... lesson_number,
--     lesson_title, room -- ALL NULLABLE, NO DEFAULT
--   * 3 CHECK constraints (one per column)
--   * 3 COMMENT ON COLUMN statements
--   * its authored post-apply assertions
--
-- WHAT IT DELIBERATELY DOES NOT CREATE OR TOUCH:
--   no table, no enum, no enum label, no function, no policy, no grant,
--   no index, no trigger, no view, no audit action, no seed row, and NO
--   ALTER of any EXISTING column. It writes NO ROW: there is no UPDATE,
--   no backfill and no DEFAULT that would materialize one.
--
-- ---------------------------------------------------------------------
-- ⛔ WHAT IS PROHIBITED HERE, STATED BESIDE THE DELIVERABLE (G-3)
-- ---------------------------------------------------------------------
-- THE `KEY FOCUS` CHIPS ARE NOT BUILT AND NO COLUMN IS ADDED FOR THEM,
-- in any form -- not as a column, an array, a JSON field, a side table,
-- a projection field, a DTO field or rendered output.
--
-- The reason is the whole point of the prohibition. KEY FOCUS is
-- LESSON-PLAN INTENT -- what a lesson is DESIGNED to work on. The roster
-- already renders a GOVERNED CARRIED-OVER PREVIOUS-SESSION FOCUS, a
-- different field with different authority, derived from the trainer's
-- own `observations.follow_up_notes` on the previous session.
--
-- THEY OCCUPY THE SAME VISUAL POSITION. Conflating them would SILENTLY
-- REPLACE A GOVERNED FIELD WITH AN UNGOVERNED ONE, and the substitution
-- would be INVISIBLE ON THE RENDERED PAGE -- the strip would look correct
-- while no longer showing what the trainer actually wrote. That protects
-- CLAUDE.md §10 Phase 1 exit condition (c), a ratified phase gate.
-- Assertion H0B-7 below enforces the column half of this structurally.
--
-- Also out, under the same or adjacent rulings, and none of them modelled
-- here: SLIDES attachment chips and `View lesson plan` (G-3) -- no bucket
-- exists; TERM (G-4) -- a display label is not worth the substrate an
-- §8-deferred roadmap item needs; OVERALL GRADE / any roll-up rating
-- (G-2); the `Assist.` staff slot (G-7).
--
-- ---------------------------------------------------------------------
-- WHY ALL THREE ARE NULLABLE WITH NO DEFAULT, AND WHY NOTHING IS
-- BACKFILLED
-- ---------------------------------------------------------------------
-- Four `class_sessions` rows exist and there is NO GOVERNED SOURCE for
-- their lesson number, lesson title or room. A NOT NULL column with a
-- default would not record those values -- it would MANUFACTURE them.
-- `lesson_number DEFAULT 1` asserts that every existing session is
-- lesson 1, which is a fabricated fact presented as a recorded one.
--
-- NULL here means EXACTLY "not recorded", and that is the truth about
-- every row this migration leaves behind. It is the same discipline
-- screen `05`'s own pack already applied at checkpoint F-04, where the
-- room and the staff names "exist on no governed field and are OMITTED
-- RATHER THAN FABRICATED".
--
-- ▶ CONSEQUENCE FOR EVERY LATER PHASE: a NULL lesson number, lesson
--   title or room means OMIT THE ELEMENT. It is never a placeholder,
--   never "Lesson 1", never "TBC", never an em-dash standing in for a
--   value. A `REGISTERED-OMISSION` is preserved, not filled.
--
-- The trimmed-length CHECKs exist so that an empty string cannot become
-- a SECOND spelling of "not recorded". One representation of nothing.
--
-- ⚠️ `room` is a PLAIN DESCRIPTIVE COLUMN (G-6). It carries NO
--    authorization meaning and MUST NEVER be used to scope a query.
--    Trainer reach is proved through the live class-session assignment
--    (ADR-4), never through a location.
-- =====================================================================

ALTER TABLE public.class_sessions
  ADD COLUMN lesson_number smallint,
  ADD COLUMN lesson_title  text,
  ADD COLUMN room          text;

-- Positive ordinal only. NULL is permitted and means "not recorded"; a
-- zero or negative lesson number is meaningless rather than unrecorded.
ALTER TABLE public.class_sessions
  ADD CONSTRAINT class_sessions_lesson_number_chk
  CHECK (lesson_number IS NULL OR lesson_number > 0);

-- A present title must carry content. NULL is "not recorded"; '' and '   '
-- are refused so there is exactly one representation of nothing.
ALTER TABLE public.class_sessions
  ADD CONSTRAINT class_sessions_lesson_title_chk
  CHECK (lesson_title IS NULL OR length(btrim(lesson_title)) > 0);

ALTER TABLE public.class_sessions
  ADD CONSTRAINT class_sessions_room_chk
  CHECK (room IS NULL OR length(btrim(room)) > 0);

COMMENT ON COLUMN public.class_sessions.lesson_number IS
  'G-3. Lesson ordinal within the class module, as the frames render it: '
  '`<number> · <title>`. NULLABLE -- NULL means NOT RECORDED and must be '
  'rendered by OMITTING the element, never by substituting a placeholder. '
  'Carries no authorization meaning.';

COMMENT ON COLUMN public.class_sessions.lesson_title IS
  'G-3. Lesson title, the second half of `<number> · <title>`. NULLABLE -- '
  'NULL means NOT RECORDED and is omitted, never defaulted. ⛔ This is NOT '
  'the KEY FOCUS chips, which are prohibited, and NOT the governed '
  'carried-over previous-session focus derived from observations.follow_up_notes.';

COMMENT ON COLUMN public.class_sessions.room IS
  'G-6. Plain descriptive location (the frames render "Studio 2"). NULLABLE, '
  'omitted when NULL. ⚠️ CARRIES NO AUTHORIZATION MEANING AND MUST NEVER BE '
  'USED TO SCOPE A QUERY -- trainer reach is proved through the live '
  'class-session assignment (ADR-4).';

-- =====================================================================
-- POST-APPLY ASSERTIONS -- same transaction as the DDL above. Every
-- figure is re-derived from the catalogue, never restated from a comment.
-- =====================================================================
DO $assert$
DECLARE
  v_n bigint;
  v_m bigint;
  v_t text;
BEGIN
  -- H0B-1: exactly three columns were added to exactly the right table.
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'class_sessions';
  IF v_n <> 11 THEN
    RAISE EXCEPTION 'Phase 0B assertion H0B-1 failed: class_sessions has % column(s); expected 11 (8 + 3)', v_n;
  END IF;

  -- H0B-2: all three are NULLABLE and carry NO DEFAULT. This is the
  -- assertion that makes "nothing was fabricated" structural rather than
  -- a claim in a comment.
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'class_sessions'
     AND column_name IN ('lesson_number', 'lesson_title', 'room')
     AND is_nullable = 'YES'
     AND column_default IS NULL;
  IF v_n <> 3 THEN
    RAISE EXCEPTION 'Phase 0B assertion H0B-2 failed: % of 3 new column(s) are nullable with no default', v_n;
  END IF;

  -- H0B-3: NO ROW WAS WRITTEN. Every pre-existing session still holds
  -- NULL in all three columns -- no backfill, no default materialization.
  --
  -- ⚠️ EXPRESSED AS A RELATIONSHIP (all rows NULL), NEVER AS A ROW-COUNT
  -- PIN. This assertion was first written with `IF v_m <> 4` beside it,
  -- pinning the FIXTURE's four sessions -- and the fresh-apply proof
  -- caught it immediately: on a database built from the migration files
  -- alone there are ZERO class_sessions, because FIXTURES ARE NOT
  -- MIGRATIONS. A migration that asserts on fixture data is not
  -- fresh-appliable, which would have broken the equivalence proof that
  -- makes the generated database types trustworthy.
  --
  -- The relationship form is correct at every row count. It is
  -- necessarily VACUOUS at zero rows (there is nothing to backfill on a
  -- fresh database, which is the honest outcome) and NON-VACUOUS wherever
  -- sessions exist -- on the canonical fixture database it evaluated
  -- against four real rows and found none written.
  SELECT pg_catalog.count(*) INTO v_m FROM public.class_sessions;
  SELECT pg_catalog.count(*) INTO v_n
    FROM public.class_sessions
   WHERE lesson_number IS NULL AND lesson_title IS NULL AND room IS NULL;
  IF v_n <> v_m THEN
    RAISE EXCEPTION
      'Phase 0B assertion H0B-3 failed: % of % existing row(s) carry a value in a new column; expected 0 written',
      v_m - v_n, v_m;
  END IF;

  -- H0B-4: NO EXISTING COLUMN WAS ALTERED. Name, type, nullability and
  -- default of all eight pre-existing columns are pinned exactly.
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'class_sessions'
     AND (column_name, data_type, is_nullable, COALESCE(column_default, '-')) IN (
       ('id',              'uuid',                        'NO',  'gen_random_uuid()'),
       ('centre_id',       'uuid',                        'NO',  '-'),
       ('class_module_id', 'uuid',                        'NO',  '-'),
       ('session_date',    'date',                        'NO',  '-'),
       ('starts_at',       'time without time zone',      'YES', '-'),
       ('ends_at',         'time without time zone',      'YES', '-'),
       ('created_at',      'timestamp with time zone',    'NO',  'now()'),
       ('updated_at',      'timestamp with time zone',    'NO',  'now()')
     );
  IF v_n <> 8 THEN
    RAISE EXCEPTION 'Phase 0B assertion H0B-4 failed: % of 8 pre-existing column(s) match their recorded shape', v_n;
  END IF;

  -- H0B-5: the wider census is UNMOVED. No table, enum, policy or
  -- function is created by this migration.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r';
  IF v_n <> 27 THEN
    RAISE EXCEPTION 'Phase 0B assertion H0B-5 failed: % table(s) in public; expected 27 (unchanged)', v_n;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_type t
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
   WHERE n.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN
    RAISE EXCEPTION 'Phase 0B assertion H0B-5 failed: % enum type(s) in public; expected 12 (unchanged)', v_n;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_policies WHERE schemaname = 'public';
  IF v_n <> 29 THEN
    RAISE EXCEPTION 'Phase 0B assertion H0B-5 failed: % policy/policies in public; expected 29 (unchanged)', v_n;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public';
  IF v_n <> 40 THEN
    RAISE EXCEPTION 'Phase 0B assertion H0B-5 failed: % function(s) in public; expected 40 (unchanged by 0B)', v_n;
  END IF;

  -- H0B-6: RLS posture and PRIVILEGE untouched. Adding a column must not
  -- have widened anything: the table ACL is pinned to exactly what it was.
  SELECT pg_catalog.count(*) FILTER (WHERE NOT c.relrowsecurity),
         pg_catalog.count(*) FILTER (WHERE c.relforcerowsecurity)
    INTO v_n, v_m
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r';
  IF v_n <> 0 OR v_m <> 0 THEN
    RAISE EXCEPTION 'Phase 0B assertion H0B-6 failed: % table(s) without RLS, % with FORCE RLS; expected 0 and 0', v_n, v_m;
  END IF;

  SELECT pg_catalog.array_to_string(c.relacl, ' ')
    INTO v_t
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relname = 'class_sessions';
  IF v_t <> 'postgres=arwdDxtm/postgres authenticated=r/postgres' THEN
    RAISE EXCEPTION 'Phase 0B assertion H0B-6 failed: class_sessions ACL changed; now [%]', v_t;
  END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_policies
   WHERE schemaname = 'public' AND tablename = 'class_sessions';
  IF v_n <> 3 THEN
    RAISE EXCEPTION 'Phase 0B assertion H0B-6 failed: % policy/policies on class_sessions; expected 3 (unchanged)', v_n;
  END IF;

  -- H0B-7: ⛔ G-3 STRUCTURALLY. No column anywhere in the schema carries
  -- LESSON-PLAN focus. Schema-wide rather than class_sessions-only on
  -- purpose: the prohibition is that the CONCEPT must not exist, not
  -- merely that it must not sit on this table.
  --
  -- ⚠️ `%focus_chip%` IS DELIBERATELY NOT ONE OF THESE PATTERNS, and the
  -- reason is the very confusion G-3 exists to prevent. This assertion
  -- was first written with it and CORRECTLY FAILED, matching the
  -- pre-existing `public.observations.focus_chips`.
  --
  -- That column is NOT the prohibited thing. It is the TRAINER'S OWN
  -- governed observation chips -- part of the mandatory nine-dimension
  -- B.E.S.T form ("ratings, chips, notes, follow-up", CLAUDE.md §9),
  -- authored by the trainer about a session that HAPPENED. The
  -- prohibited KEY FOCUS is LESSON-PLAN INTENT: what a lesson was
  -- DESIGNED to work on, authored by nobody governed, about a session
  -- that may not have happened yet.
  --
  -- They share the word "chips" and nothing else. Banning the governed
  -- column to satisfy a pattern would have been the SAME substitution
  -- error as rendering lesson-plan focus into the governed focus line,
  -- committed in the opposite direction -- and A-054 already prohibits
  -- classifying by keyword instead of by context. H0B-10 asserts that
  -- column is PRESERVED.
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.columns
   WHERE table_schema = 'public'
     AND (column_name LIKE '%key_focus%'
          OR column_name LIKE '%keyfocus%'
          OR column_name LIKE '%lesson_focus%'
          OR column_name LIKE '%planned_focus%'
          OR column_name LIKE '%lesson_plan%');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Phase 0B assertion H0B-7 failed: % lesson-plan-focus column(s) exist; G-3 prohibits every one', v_n;
  END IF;

  -- Belt and braces on the table this migration actually touches: no new
  -- column on class_sessions may carry focus semantics under ANY spelling.
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'class_sessions'
     AND column_name LIKE '%focus%';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Phase 0B assertion H0B-7 failed: % focus column(s) on class_sessions; G-3 permits none', v_n;
  END IF;

  -- H0B-8: the governed carried-over focus is UNTOUCHED and still lives
  -- where it always did. G-3's real risk is substitution, so its source
  -- column is asserted present and unmodified alongside the prohibition.
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'observations'
     AND column_name = 'follow_up_notes' AND data_type = 'text';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Phase 0B assertion H0B-8 failed: observations.follow_up_notes is absent or retyped';
  END IF;

  -- H0B-9: the three CHECK constraints actually exist. A nullable text
  -- column without its trimmed-length check would silently allow '' as a
  -- second spelling of "not recorded".
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_constraint
   WHERE conrelid = 'public.class_sessions'::regclass
     AND contype = 'c'
     AND conname IN ('class_sessions_lesson_number_chk',
                     'class_sessions_lesson_title_chk',
                     'class_sessions_room_chk');
  IF v_n <> 3 THEN
    RAISE EXCEPTION 'Phase 0B assertion H0B-9 failed: % of 3 new CHECK constraint(s) present', v_n;
  END IF;

  -- H0B-10: the TRAINER'S GOVERNED OBSERVATION CHIPS are preserved,
  -- present and still an array. Paired with H0B-7 deliberately: that
  -- assertion says the ungoverned concept must not exist, this one says
  -- the governed one must not be collateral damage. G-3's actual risk is
  -- SUBSTITUTION, and substitution can be committed in either direction.
  SELECT pg_catalog.count(*) INTO v_n
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'observations'
     AND column_name = 'focus_chips' AND data_type = 'ARRAY';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Phase 0B assertion H0B-10 failed: observations.focus_chips is absent or retyped';
  END IF;

  RAISE NOTICE 'Phase 0B: lesson metadata applied; assertions H0B-1..H0B-10 passed; 0 rows written.';
END;
$assert$;
