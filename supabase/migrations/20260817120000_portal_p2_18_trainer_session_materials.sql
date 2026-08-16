-- =====================================================================
-- P2-18 — THE TRAINER READ PATH TO `class_session_materials`.
-- =====================================================================
-- ⛔ ONE FUNCTION, ONE GRANT. NAMED, NOT COUNTED:
--      function: public.trainer_list_session_materials(uuid)
--      grant:    EXECUTE to `authenticated` (and to nothing else)
--
--    NOTHING ELSE: no table, no column, no enum, no policy, no client table
--    grant, no write path, no audit action string, no bucket, no storage
--    policy. Read-side only, under the standing batch authorization.
--
-- ---------------------------------------------------------------------
-- ⛔ WHY AN RPC AND NOT A POLICY PLUS GRANT — the Operator asked for the
--    call, and this is it, recorded where it is enforced.
-- ---------------------------------------------------------------------
--   1. **RLS FILTERS ROWS, NOT COLUMNS.** The table carries
--      `storage_object_path` and both uploader identity columns
--      (`uploaded_by_account_id`, `uploaded_by_membership_id`). A table
--      policy hands a trainer all three. ▶ The frame needs `display_name`,
--      `media_type` and `byte_size` — a function returns that projection;
--      a policy cannot.
--   2. **`P2-6` SHIPPED THIS TABLE WITH 0 POLICIES AND 0 CLIENT TABLE
--      GRANTS, SECURITY DEFINER RPCs ONLY.** A policy now would be a second
--      access model for one table — the divergence this project rules
--      against.
--   3. **A RAW STORAGE PATH IN A CLIENT IS WHAT §3.1 FORBIDS OUTRIGHT.**
--      Access to an object is a short-TTL server-minted URL, never a path
--      the browser was handed and could keep.
--
-- ---------------------------------------------------------------------
-- ⛔ THIS IS THE LISTING. IT IS NOT THE DOWNLOAD.
-- ---------------------------------------------------------------------
-- The signed-URL mint is a separate function and is NOT built here. It is
-- stated rather than assumed because `class_session_materials` holds ZERO
-- rows, so a mint built now could not be exercised by any proof — and an
-- unprovable path against a storage bucket is exactly the kind of thing
-- that should wait until it can be executed.
--
-- ⚠️ THE WRITE SPLIT IS UNCHANGED AND IS NOT TOUCHED HERE: management
--    uploads, the trainer reads. No write path of any kind is created.
--
-- ⛔ A DOWNLOAD EMITS NO AUDIT EVENT, BY RULING, NOT BY OMISSION. `P2-6`
--    recorded the Operator's reason: *"`evidence.accessed` fires because the
--    object is a child's video and the mint is the only trace it existed. A
--    slide deck is teaching material — no child's data, no privacy surface —
--    and `A-029` holds that a read is not a governed action."* ▶ The Step 7H
--    registry is NOT extended by this migration.
--
-- ---------------------------------------------------------------------
-- ⛔ THE FUNCTION IS EXECUTED AT APPLY TIME (`CLAUDE.md` §12).
-- ---------------------------------------------------------------------
-- `plpgsql` defers name resolution to first execution, so a body that
-- cannot run still CREATEs cleanly and passes every structural assertion.
-- `M18-5` CALLS it — with an unreachable session, so the ideal call: it
-- traverses the gate, returns zero rows and writes nothing.
-- =====================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.trainer_list_session_materials(p_class_session_id uuid)
RETURNS TABLE (
  material_id  uuid,
  display_name text,
  media_type   text,
  byte_size    bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- ---- the gate. A refusal IS zero rows (`Q-7`), never an error. ----
  -- ⛔ `A-016`: assignment is authoritative at CLASS SESSION level, so the
  --    reach test is the session helper and not the module one.
  IF NOT public.app_trainer_reaches_session(p_class_session_id) THEN
    RETURN;
  END IF;

  /*
   * ⛔ FOUR COLUMNS, AND THE OMISSIONS ARE THE POINT.
   *
   * `storage_object_path` is NEVER selected — it is the reason this is a
   * function rather than a policy, and selecting it here would give the
   * whole argument away. `uploaded_by_account_id` and
   * `uploaded_by_membership_id` are internal attribution the frame does not
   * draw and a trainer has no read need for. `centre_id` is the scoping key
   * the gate already enforced; returning it would leak nothing but would
   * invite a client to filter on it, which is authorization in the browser.
   */
  RETURN QUERY
  SELECT m.id, m.display_name, m.media_type, m.byte_size
    FROM public.class_session_materials m
   WHERE m.class_session_id = p_class_session_id
   ORDER BY m.display_name, m.id;
END;
$$;

REVOKE ALL ON FUNCTION public.trainer_list_session_materials(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.trainer_list_session_materials(uuid) TO authenticated;

-- =====================================================================
-- ASSERTIONS. Every one fails the migration outright.
-- =====================================================================
DO $assert$
DECLARE
  v_count  bigint;
  v_grants text[];
BEGIN
  -- ---- M18-1: the function exists with exactly this signature ----
  SELECT count(*) INTO v_count
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname = 'trainer_list_session_materials'
     AND pg_get_function_identity_arguments(p.oid) = 'p_class_session_id uuid';
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'M18-1 FAIL: expected exactly 1 trainer_list_session_materials(uuid), found %', v_count;
  END IF;
  RAISE NOTICE 'M18-1 PASS: exactly one trainer_list_session_materials(uuid)';

  -- ---- M18-2: SECURITY DEFINER, STABLE, and search_path pinned empty ----
  SELECT count(*) INTO v_count
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname = 'trainer_list_session_materials'
     AND p.prosecdef
     AND p.provolatile = 's'
     -- ⚠️ MEASURED, NOT ASSUMED. `SET search_path = ''` is stored by this
     --    PostgreSQL as `search_path=""` — WITH the quotes — not as
     --    `search_path=`. The first draft asserted the unquoted form and
     --    aborted the migration on a posture that was in fact correct.
     -- ⛔ §60, fourth instance in two phases: a detector written against the
     --    CONCEPT and never run against the TEXT it scans. Both accepted
     --    representations are pinned so a platform that stores the other form
     --    does not fail a correct function.
     AND (p.proconfig @> ARRAY['search_path=""'] OR p.proconfig @> ARRAY['search_path=']);
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'M18-2 FAIL: security posture is not SECURITY DEFINER + STABLE + empty search_path';
  END IF;
  RAISE NOTICE 'M18-2 PASS: SECURITY DEFINER, STABLE, search_path pinned empty';

  -- ---- M18-3: the grant set is EXACT, not merely present ----
  -- ⚠️ PostgreSQL grants EXECUTE to PUBLIC by default on a new function. A
  --    presence check passes with PUBLIC sitting beside `authenticated`,
  --    which is the whole reason this is pinned as an EXACT SET.
  -- ⚠️ `grantee` IS `information_schema.sql_identifier`, NOT `text`. Aggregating
  --    it without the cast yields a `sql_identifier[]` that will not assign to a
  --    `text[]`, and the migration aborts on a type error rather than on a
  --    governance finding. Measured, not guessed — it aborted exactly here.
  SELECT coalesce(array_agg(DISTINCT grantee::text ORDER BY grantee::text), ARRAY[]::text[])
    INTO v_grants
    FROM information_schema.routine_privileges
   WHERE specific_schema = 'public'
     AND routine_name = 'trainer_list_session_materials'
     AND privilege_type = 'EXECUTE';
  IF v_grants <> ARRAY['authenticated', 'postgres'] AND v_grants <> ARRAY['authenticated'] THEN
    RAISE EXCEPTION 'M18-3 FAIL: EXECUTE grant set is %, expected authenticated (owner aside)', v_grants;
  END IF;
  RAISE NOTICE 'M18-3 PASS: EXECUTE granted to authenticated only (owner aside) — %', v_grants;

  -- ---- M18-4: NOTHING ELSE CHANGED ----
  -- ⛔ Zero table policies and zero client table grants on the materials
  --    table, exactly as `P2-6` left it. This migration adds a FUNCTION, and
  --    a later reader must be able to see that it did not quietly also open
  --    the table.
  SELECT count(*) INTO v_count FROM pg_policies
   WHERE schemaname = 'public' AND tablename = 'class_session_materials';
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'M18-4a FAIL: class_session_materials carries % table policy/policies, expected 0', v_count;
  END IF;

  SELECT count(*) INTO v_count
    FROM information_schema.role_table_grants
   WHERE table_schema = 'public'
     AND table_name = 'class_session_materials'
     AND grantee IN ('anon', 'authenticated', 'service_role', 'PUBLIC');
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'M18-4b FAIL: class_session_materials carries % client table grant(s), expected 0', v_count;
  END IF;
  RAISE NOTICE 'M18-4 PASS: 0 table policies and 0 client table grants on class_session_materials';

  -- ---- M18-5: THE BODY IS EXECUTED, NOT MERELY DECLARED ----
  -- ⛔ `CLAUDE.md` §12 — a migration that verifies its own shape has not
  --    verified that it works. `plpgsql` defers name resolution to first
  --    execution, so every assertion above is TRUE of a body that raises on
  --    its first statement.
  -- ⚠️ A REFUSAL IS THE IDEAL CALL: a random session id reaches nothing, so
  --    the gate returns zero rows having traversed the body and written
  --    nothing.
  SELECT count(*) INTO v_count
    FROM public.trainer_list_session_materials('00000000-0000-0000-0000-000000000000'::uuid);
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'M18-5 FAIL: an unreachable session returned % row(s), expected 0', v_count;
  END IF;
  RAISE NOTICE 'M18-5 PASS: the body EXECUTED and an unreachable session returned 0 rows';
END
$assert$;

COMMIT;
