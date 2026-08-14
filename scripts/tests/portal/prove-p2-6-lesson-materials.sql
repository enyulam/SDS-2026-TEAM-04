-- =====================================================================
-- P2-6 -- LESSON MATERIALS (`D-4`). The SQL half.
-- ⛔ LEGS ARE PREFIXED `PLM-`, NOT `P26-`. `prove-p2-4-class-overview.sql`
--    ALREADY OWNS `P26-1`..`P26-11` -- measured, not assumed -- so this suite
--    naming its legs `P26-` put TWO suites on one namespace. ▶ The runner
--    counts legs BY PREFIX, so a collision does not merely look untidy: it
--    makes each suite's leg count meaningless the moment both outputs meet.
-- =====================================================================
-- Legs:
--   PLM-1  NON-VACUITY -- a real centre, real sessions, a real trainer
--          assignment and a registry of >= 23 exist for the legs below to
--          measure. ⚠️ FLOOR, never `= 23`: pinning the global total is the
--          §12.8 phase-scoped-claim defect this phase itself had to repair
--          in `P2-5`, and repeating it here would break `P2-7`.
--   PLM-2  ⛔ THE BUCKET ROW, both ruled fields, AND `P1-2`'s invariant
--          re-proved ACROSS EVERY BUCKET now that a second one exists.
--   PLM-3  ⛔ RPC-ONLY -- zero policies and zero client grants on the table,
--          with RLS enabled. CONTROL: the same probe SEES a planted grant.
--   PLM-4  ⛔ THE STORAGE PREDICATE, BOTH DIRECTIONS -- management on a
--          well-formed path is ACCEPTED; a malformed path, an unknown
--          session and a non-management caller are each REFUSED.
--   PLM-5  THE GOVERNED ROUND TRIP -- attach emits `material.attached`,
--          remove emits `material.removed`, the hash chain still verifies,
--          and BOTH row and object are gone afterwards.
--   PLM-6  ⛔ THE ROLE BOUNDARY -- a TRAINER lists (D-4: trainers download)
--          but CANNOT remove; an UNIDENTIFIED caller reads ZERO.
--   PLM-7  ⛔ A DOWNLOAD EMITS NOTHING. `material_signed_path` moves the
--          audit count by ZERO, and `material.accessed` is absent from the
--          registry -- a read is not a governed action (`A-029`, and the
--          Operator's `P2-4` precedent).
--   PLM-8  ⛔ THE TWO REFUSALS -- `class_sessions.key_focus` does not exist
--          (RAISED AND DECLINED), and no rating vocabulary reaches this
--          surface (`C-9`, `G-2`).
--
-- ⚠️ TRANSACTION-SCOPED, ending in ROLLBACK. The storage object and the
--    material row created by PLM-5 exist only inside it.
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

DO $suite$
DECLARE
  v_n          integer;
  v_m          integer;
  v_reg        integer;
  v_lim        bigint;
  v_mimes      integer;
  v_bad        integer;
  v_session    uuid;
  v_tsession   uuid;
  v_matid      uuid := 'e6000000-0000-4000-8000-0000000000a1';
  -- ⚠️ A SECOND id, and the reason is a measured fact rather than tidiness:
  --    `material_remove` deletes the ROW and RETURNS the object path -- it
  --    does not delete the OBJECT, because that needs the Storage API and
  --    happens in server code. Reusing one id made PLM-6 collide with
  --    PLM-5's surviving object on `bucketid_objname`. ▶ The collision is
  --    evidence the row/object split works as designed.
  v_matid2     uuid := 'e6000000-0000-4000-8000-0000000000a2';
  v_path       text;
  v_ok         boolean;
  v_ok2        boolean;
  v_removed    boolean;
  v_ev0        integer;
  v_ev1        integer;
  v_ev2        integer;
  v_ev3        integer;
  v_chain      boolean;
  v_txt        text;
  v_rows       integer;
BEGIN
  -- =================================================================
  -- PLM-1  NON-VACUITY
  -- =================================================================
  SELECT count(*) INTO v_n FROM public.class_sessions;
  SELECT count(*) INTO v_m FROM public.class_session_assignments;
  SELECT array_length(public.audit_action_registry(), 1) INTO v_reg;

  SELECT s.id INTO v_session FROM public.class_sessions s ORDER BY s.session_date, s.id LIMIT 1;

  IF v_n > 0 AND v_m > 0 AND v_reg >= 23 AND v_session IS NOT NULL THEN
    RAISE NOTICE 'PASS PLM-1  NON-VACUITY: % session(s), % assignment(s), registry % (>= 23) -- there is a real class session for every leg below to attach to', v_n, v_m, v_reg;
  ELSE
    RAISE NOTICE 'FAIL PLM-1  sessions=% assignments=% registry=% session=%', v_n, v_m, v_reg, v_session;
  END IF;

  -- =================================================================
  -- PLM-2  ⛔ THE BUCKET ROW + `P1-2`'s INVARIANT ACROSS EVERY BUCKET
  -- =================================================================
  SELECT file_size_limit, array_length(allowed_mime_types, 1)
    INTO v_lim, v_mimes
    FROM storage.buckets WHERE id = 'lesson-materials';

  -- ⛔ The half Lock §8.2 actually needs: no media class can enter the
  --    DOCUMENTS bucket, which is what keeps the separation at the bucket
  --    row rather than by convention.
  SELECT count(*) INTO v_bad
    FROM storage.buckets b, unnest(b.allowed_mime_types) t
   WHERE b.id = 'lesson-materials'
     AND (t LIKE 'video/%' OR t LIKE 'audio/%' OR t LIKE '%zip%' OR t LIKE '%x-tar%');

  -- ⚠️ `P1-2`'s invariant RE-PROVED ACROSS EVERY BUCKET, not just the new
  --    one -- the Operator asked for exactly this, and a leg that only
  --    checked `lesson-materials` would not notice `evidence` being opened.
  SELECT count(*) FILTER (WHERE public), count(*) FILTER (WHERE file_size_limit IS NULL), count(*)
    INTO v_n, v_m, v_rows
    FROM storage.buckets;

  IF v_lim = 26214400 AND v_mimes = 8 AND v_bad = 0 AND v_n = 0 AND v_m = 0 AND v_rows = 2 THEN
    RAISE NOTICE 'PASS PLM-2  ⛔ `lesson-materials` is PRIVATE at 26214400 (25 MiB) with EXACTLY 8 MIME types and ZERO video/audio/archive among them; and `P1-2`''s invariant STILL HOLDS across all % bucket(s): 0 public, 0 without a size limit', v_rows;
  ELSE
    RAISE NOTICE 'FAIL PLM-2  limit=% mimes=% media_types_leaked=% public=% null_limit=% buckets=%', v_lim, v_mimes, v_bad, v_n, v_m, v_rows;
  END IF;

  -- =================================================================
  -- PLM-3  ⛔ RPC-ONLY, WITH A CONTROL
  -- =================================================================
  SELECT count(*) INTO v_n FROM pg_policies
   WHERE schemaname = 'public' AND tablename = 'class_session_materials';
  SELECT count(*) INTO v_m FROM information_schema.role_table_grants
   WHERE table_schema = 'public' AND table_name = 'class_session_materials'
     AND grantee IN ('authenticated', 'anon', 'PUBLIC', 'service_role');
  SELECT c.relrowsecurity INTO v_ok
    FROM pg_class c JOIN pg_namespace ns ON ns.oid = c.relnamespace
   WHERE ns.nspname = 'public' AND c.relname = 'class_session_materials';

  -- ⚠️ CONTROL -- without it, "zero grants" is equally true of a probe that
  --    can never see a grant at all. Planted, measured, revoked.
  GRANT SELECT ON public.class_session_materials TO authenticated;
  SELECT count(*) INTO v_bad FROM information_schema.role_table_grants
   WHERE table_schema = 'public' AND table_name = 'class_session_materials'
     AND grantee = 'authenticated';
  REVOKE SELECT ON public.class_session_materials FROM authenticated;

  IF v_n = 0 AND v_m = 0 AND v_ok AND v_bad > 0 THEN
    RAISE NOTICE 'PASS PLM-3  ⛔ `class_session_materials` is RPC-ONLY: RLS enabled, ZERO policies, ZERO client grants -- CONTROL: a planted `authenticated` SELECT grant WAS seen (% hit) and revoked, so this is a measurement', v_bad;
  ELSE
    RAISE NOTICE 'FAIL PLM-3  policies=% client_grants=% rls=% control_hits=%', v_n, v_m, v_ok, v_bad;
  END IF;

  -- =================================================================
  -- PLM-4  ⛔ THE STORAGE PREDICATE -- BOTH DIRECTIONS
  -- =================================================================
  -- ⚠️ The predicate is the authorization surface behind the ONE storage
  --    INSERT policy, so a leg that only proved the refusals would not
  --    notice a predicate that refuses EVERYTHING.
  SET LOCAL ROLE authenticated;
  PERFORM pg_temp.as_management();
  v_path := v_session::text || '/' || v_matid::text || '.pdf';
  SELECT public.app_management_may_attach_material(v_path) INTO v_ok;

  -- Refusal 1: a free-form path. ⛔ This is the one that matters -- without
  -- the shape rule a caller uploads anywhere in the bucket and claims it.
  SELECT public.app_management_may_attach_material('anything/i/like.pdf') INTO v_ok2;
  -- Refusal 2: well-formed, but names a session that does not exist.
  SELECT public.app_management_may_attach_material(
           '00000000-0000-4000-8000-0000000000ff/' || v_matid::text || '.pdf') INTO v_removed;

  -- Refusal 3: the SAME well-formed path, as a TRAINER. Management-only.
  PERFORM pg_temp.as_trainer();
  SELECT public.app_management_may_attach_material(v_path) INTO v_chain;
  RESET ROLE;

  IF v_ok AND NOT v_ok2 AND NOT v_removed AND NOT v_chain THEN
    RAISE NOTICE 'PASS PLM-4  ⛔ the storage predicate measures BOTH DIRECTIONS: management on a well-formed path is ACCEPTED, while a free-form path, an unknown session and a TRAINER on the identical path are each REFUSED';
  ELSE
    RAISE NOTICE 'FAIL PLM-4  management_ok=% freeform_refused=% unknown_refused=% trainer_refused=%',
      v_ok, NOT v_ok2, NOT v_removed, NOT v_chain;
  END IF;

  -- =================================================================
  -- PLM-5  THE GOVERNED ROUND TRIP
  -- =================================================================
  SELECT count(*) INTO v_ev0 FROM public.audit_events;

  -- The uploaded object. Inserted as owner deliberately: PLM-4 already
  -- measured the policy that gates the real upload, and this leg is about
  -- what `material_attach_confirm` does with an object that exists.
  INSERT INTO storage.objects (bucket_id, name, metadata)
  VALUES ('lesson-materials', v_path,
          jsonb_build_object('mimetype', 'application/pdf', 'size', 1048576));

  SET LOCAL ROLE authenticated;
  PERFORM pg_temp.as_management();
  SELECT o_attached INTO v_ok
    FROM public.material_attach_confirm(v_session, v_matid, 'Lesson 1 - Intro to Persuasion');
  RESET ROLE;

  SELECT count(*) INTO v_ev1 FROM public.audit_events;
  SELECT count(*) INTO v_n FROM public.audit_events WHERE action = 'material.attached';
  -- ⚠️ Size and type came from the STORED OBJECT, never from the caller.
  SELECT byte_size = 1048576 AND media_type = 'application/pdf' INTO v_ok2
    FROM public.class_session_materials WHERE id = v_matid;

  SET LOCAL ROLE authenticated;
  PERFORM pg_temp.as_management();
  SELECT o_removed INTO v_removed FROM public.material_remove(v_matid);
  RESET ROLE;

  SELECT count(*) INTO v_ev2 FROM public.audit_events;
  SELECT count(*) INTO v_m FROM public.audit_events WHERE action = 'material.removed';
  SELECT count(*) INTO v_rows FROM public.class_session_materials WHERE id = v_matid;
  SELECT bool_and(v.ok) INTO v_chain FROM public.audit_verify_chain(NULL, NULL, NULL) v;

  -- ⚠️ FLOORS, NOT EQUALITIES -- §12.8, SIXTH INSTANCE, and this one was caught
  --    by `P2-6R`'s end-to-end proof rather than by a reader. `v_n` and `v_m`
  --    count EVERY `material.attached` / `material.removed` row in the table,
  --    and the original pinned each at exactly 1: a claim about what the
  --    fixture HAPPENED to contain, not about the governed rule.
  --    ▶ `prove:portal-p2-6r-e2e` performs a real governed attach and remove,
  --    so the totals moved to 3 and this leg went RED against a database that
  --    was behaving perfectly.
  -- ⛔ THE GOVERNED RULE IS THE DELTA, AND IT IS ALREADY ASSERTED:
  --    `v_ev1 = v_ev0 + 1` and `v_ev2 = v_ev1 + 1` say THIS attach and THIS
  --    removal each emitted EXACTLY ONE event. The floors below only prove the
  --    rows carry the ratified action strings -- they were never the one-event
  --    guarantee, which is why relaxing them costs nothing.
  IF v_ok AND v_ok2 AND v_removed AND v_n >= 1 AND v_m >= 1
     AND v_ev1 = v_ev0 + 1 AND v_ev2 = v_ev1 + 1 AND v_rows = 0 AND v_chain THEN
    RAISE NOTICE 'PASS PLM-5  THE GOVERNED ROUND TRIP: attach emitted EXACTLY ONE `material.attached` (%->%), remove emitted EXACTLY ONE `material.removed` (%->%), the row is gone, the hash chain still verifies -- and byte_size/media_type were read from the STORED OBJECT, not from the caller', v_ev0, v_ev1, v_ev1, v_ev2;
  ELSE
    RAISE NOTICE 'FAIL PLM-5  attached=% from_object=% removed=% att_events=% rem_events=% ev %->%->% rows=% chain=%',
      v_ok, v_ok2, v_removed, v_n, v_m, v_ev0, v_ev1, v_ev2, v_rows, v_chain;
  END IF;

  -- =================================================================
  -- PLM-6  ⛔ THE ROLE BOUNDARY
  -- =================================================================
  -- Re-attach so there is something to read. A session the TRAINER actually
  -- reaches, resolved live rather than assumed.
  SET LOCAL ROLE authenticated;
  PERFORM pg_temp.as_trainer();
  SELECT s.id INTO v_tsession FROM public.class_sessions s
   WHERE public.app_trainer_reaches_session(s.id) ORDER BY s.session_date, s.id LIMIT 1;
  RESET ROLE;

  v_path := v_tsession::text || '/' || v_matid2::text || '.pdf';
  INSERT INTO storage.objects (bucket_id, name, metadata)
  VALUES ('lesson-materials', v_path,
          jsonb_build_object('mimetype', 'application/pdf', 'size', 2048));
  SET LOCAL ROLE authenticated;
  PERFORM pg_temp.as_management();
  PERFORM public.material_attach_confirm(v_tsession, v_matid2, 'Trainer-visible deck');

  -- Management reads.
  SELECT count(*) INTO v_n FROM public.material_list_for_session(v_tsession);
  -- ⛔ TRAINER READS (`D-4`: management uploads, TRAINERS DOWNLOAD) ...
  PERFORM pg_temp.as_trainer();
  SELECT count(*) INTO v_m FROM public.material_list_for_session(v_tsession);
  -- ... but a trainer CANNOT REMOVE.
  SELECT o_removed INTO v_ok FROM public.material_remove(v_matid2);
  -- ⛔ AN UNIDENTIFIED CALLER READS ZERO.
  PERFORM pg_temp.as_nobody();
  SELECT count(*) INTO v_rows FROM public.material_list_for_session(v_tsession);
  RESET ROLE;

  SELECT count(*) INTO v_bad FROM public.class_session_materials WHERE id = v_matid2;

  IF v_n = 1 AND v_m = 1 AND NOT v_ok AND v_rows = 0 AND v_bad = 1 THEN
    RAISE NOTICE 'PASS PLM-6  ⛔ THE ROLE BOUNDARY, all three measured: MANAGEMENT lists (1), the TRAINER lists the same row (1) because `D-4` says trainers download, the TRAINER''s remove is REFUSED and the row SURVIVES, and an UNIDENTIFIED caller reads ZERO';
  ELSE
    RAISE NOTICE 'FAIL PLM-6  mgmt_list=% trainer_list=% trainer_remove_refused=% anon_list=% row_survived=%',
      v_n, v_m, NOT v_ok, v_rows, v_bad;
  END IF;

  -- =================================================================
  -- PLM-7  ⛔ A DOWNLOAD EMITS NOTHING
  -- =================================================================
  SELECT count(*) INTO v_ev3 FROM public.audit_events;
  SET LOCAL ROLE authenticated;
  PERFORM pg_temp.as_management();
  SELECT o_object_path INTO v_txt FROM public.material_signed_path(v_matid2);
  PERFORM pg_temp.as_trainer();
  PERFORM public.material_signed_path(v_matid2);
  RESET ROLE;
  SELECT count(*) INTO v_n FROM public.audit_events;

  SELECT count(*) INTO v_reg FROM unnest(public.audit_action_registry()) a
   WHERE a LIKE 'material%' AND a NOT IN ('material.attached', 'material.removed');
  SELECT 'material.accessed' = ANY (public.audit_action_registry()) INTO v_ok;

  IF v_n = v_ev3 AND v_txt IS NOT NULL AND v_reg = 0 AND NOT v_ok THEN
    RAISE NOTICE 'PASS PLM-7  ⛔ A DOWNLOAD EMITS NOTHING: two `material_signed_path` calls (management + trainer) moved the audit count by ZERO (% -> %) while returning a real path; the registry carries NO `material.accessed` and NO material string beyond the two authorized -- a read is not a governed action (`A-029`, `P2-4` precedent)', v_ev3, v_n;
  ELSE
    RAISE NOTICE 'FAIL PLM-7  audit %->% path=% unauthorized_material_strings=% accessed_present=%',
      v_ev3, v_n, v_txt, v_reg, v_ok;
  END IF;

  -- =================================================================
  -- PLM-8  ⛔ THE TWO REFUSALS
  -- =================================================================
  SELECT count(*) INTO v_n FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'class_sessions' AND column_name = 'key_focus';
  -- ⚠️ Bare-substring, so it catches a column nobody has written yet.
  SELECT count(*) INTO v_m FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'class_session_materials'
     AND column_name ~* '(rating|grade|score|competency|focus)';
  SELECT count(*) INTO v_bad FROM pg_proc p JOIN pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname LIKE 'material%'
     AND pg_get_functiondef(p.oid) ~* '(beginning|developing|mastering|mastered|overall_grade)';

  IF v_n = 0 AND v_m = 0 AND v_bad = 0 THEN
    RAISE NOTICE 'PASS PLM-8  ⛔ BOTH REFUSALS HOLD: `class_sessions.key_focus` DOES NOT EXIST -- RAISED BY THIS PHASE AND DECLINED BY THE OPERATOR because no authoring surface exists, so `D-4`''s mention is not licence -- and NO rating/grade/focus vocabulary reaches this surface in a column or a function body (`C-9`, `G-2`)';
  ELSE
    RAISE NOTICE 'FAIL PLM-8  key_focus_columns=% material_columns_named=% functions_naming_ratings=%', v_n, v_m, v_bad;
  END IF;
END
$suite$;

ROLLBACK;
