-- =====================================================================
-- B.E.S.T Coach -- ONE client entry point for a complete assessment save
-- (Run C3-A Phase 1, item 1 -- closing the direct complete-save bypass)
-- =====================================================================
-- Governing authority (highest first):
--   Specification v3 -> Amendment 001 -> Amendment 002 -> Amendment 003
--   -> Amendment 004 -> Amendment 006 -> Operator ruling R-C2-1
--   -> CLAUDE.md -> Implementation Plan
--
-- WHAT THIS MIGRATION CHANGES -- exactly one privilege, in one direction:
--   * 1 REVOKE line, removing `authenticated` EXECUTE from
--     public.assessment_save_observation(uuid, uuid, uuid, integer,
--     text[], text[], text, text, text, jsonb)
--   * its authored precondition and post-apply assertions
--
-- WHAT IT DELIBERATELY DOES NOT DO:
--   no CREATE FUNCTION, no CREATE OR REPLACE, no DROP, no CREATE TABLE,
--   no CREATE TYPE, no ALTER TYPE, no new enum label, no column, no
--   constraint, no index, no CREATE POLICY, no trigger, no view, no
--   extension, no schema, no table GRANT, no ALTER DEFAULT PRIVILEGES,
--   no ownership change, no new audit action, no fixture row, and NOT ONE
--   DML STATEMENT. It GRANTS NOTHING TO ANYONE. The only movement in the
--   privilege graph is a REMOVAL, so the canonical fixture checksum, the
--   28-row canonical region, every ratified transition, status,
--   projection, policy, table, enum and column are byte-untouched.
--
-- ---------------------------------------------------------------------
-- THE DEFECT THIS CLOSES
-- ---------------------------------------------------------------------
-- R-C2-1 made `assessment_save_complete_and_open_report` the authoritative
-- complete-assessment save: in ONE transaction it writes the observation
-- and its nine ratings AND ensures exactly one report shell exists for the
-- (class_session_id, student_id) pair.
--
-- But `assessment_save_observation` -- the function the composer delegates
-- to -- KEPT its own `authenticated` EXECUTE. PostgREST exposes every
-- function the request role may execute, so ANY authenticated caller could
-- skip the composer entirely, POST /rest/v1/rpc/assessment_save_observation
-- with a complete nine-rating payload, and commit the whole assessment
-- with NO report shell. The trainer's own valid session cookie was enough;
-- no forged token, no elevated role and no UI defect was required. The
-- atomicity R-C2-1 ratified was therefore a property of ONE ROUTE, not of
-- the database -- which is precisely the shape ADR-3 and CLAUDE.md §4
-- forbid ("never expose these as client-callable RPCs that skip
-- validation").
--
-- ---------------------------------------------------------------------
-- WHY A REVOKE IS THE RIGHT INSTRUMENT, AND WHY IT IS SUFFICIENT
-- ---------------------------------------------------------------------
-- Two designs were considered.
--
--   (a) Redefine `assessment_save_observation` to REFUSE a complete
--       nine-rating payload and give the composer a private companion.
--       REJECTED, and not for taste: that function ALREADY refuses
--       everything except a complete payload. Its step 8 raises BC106
--       ("exactly nine dimension ratings are required") for ANY array
--       whose length is not exactly 9, so "complete" is the ONLY payload
--       it has ever accepted. Redefining it to refuse complete payloads
--       would leave a function that accepts nothing at all, while
--       requiring a CREATE OR REPLACE of a ratified, byte-pinned body and
--       a second copy of the ten authored error codes. That is more
--       moving parts and a larger blast radius for strictly less.
--
--   (b) Remove its client EXECUTE and leave the composer as the sole
--       client entry point. CHOSEN.
--
-- The ABSENCE OF A PRIVILEGE is this project's own primary control, stated
-- in the C2-A migration itself: "NOTHING IS GRANTED TO service_role, EVER.
-- It carries BYPASSRLS, so the ONLY control that constrains it is the
-- ABSENCE of a privilege." This migration applies exactly that control to
-- exactly the object that was over-granted.
--
-- It is SUFFICIENT, and the sufficiency is ASSERTED below rather than
-- asserted in prose:
--
--   * `authenticated` holds NO INSERT, UPDATE or DELETE on `observations`,
--     `observation_ratings` or `reports` -- and neither does `anon`,
--     `service_role` or PUBLIC (assertion X6). There is no direct-table
--     write path to close.
--   * After this migration EXACTLY ONE function that holds `authenticated`
--     EXECUTE references `assessment_save_observation` in its body, and it
--     is the composer -- whose body also references `report_create` and
--     `report_mark_observation_saved` (assertion X5). So every remaining
--     client-reachable route to a complete observation write goes through
--     the composer, and the composer opens the shell in the SAME
--     transaction.
--   * `assessment_save_observation` itself is left BYTE-IDENTICAL:
--     SECURITY DEFINER, postgres-owned, its BC106 nine-rating gate and its
--     "no report read or write of any kind" body intact (assertion X8).
--     The composer, running as postgres inside its own SECURITY DEFINER
--     context, still has EXECUTE on it as owner. Nothing about the
--     delegate's authorization, its three write gates or its ten authored
--     error codes changes: auth.uid() is still re-derived from the
--     caller's own session on every call.
--
-- ---------------------------------------------------------------------
-- INCOMPLETE / PARTIAL SAVES ARE NOT BROKEN, BECAUSE THEY NEVER EXISTED
-- ---------------------------------------------------------------------
-- Amendment 002 A-017 removed every partial-completion path: "an
-- assessment cannot be completed until all nine dimensions are rated --
-- validate this server-side". Physically, BC106 rejects any payload that
-- is not exactly nine ratings, in the delegate AND (by delegation) in the
-- composer. There is therefore NO governed incomplete-save entry point in
-- the database today, none is removed here, and NONE IS INVENTED HERE --
-- adding a new client-reachable write surface would be new scope requiring
-- its own authorization, not a bug fix. An incomplete payload receives the
-- same authored BC106 through the composer that it received through the
-- delegate.
--
-- ---------------------------------------------------------------------
-- THE DENIAL IS NON-DISCLOSING
-- ---------------------------------------------------------------------
-- A caller without EXECUTE never enters the function body, so no authored
-- message is produced and nothing about the object is revealed. PostgREST
-- does not publish a function the request role cannot execute, so a direct
-- POST to /rest/v1/rpc/assessment_save_observation is answered from the
-- schema cache with the SAME "not found" shape any nonexistent function
-- receives -- identical for a trainer, for management and for a parent.
-- A caller that reaches the function through a non-PostgREST SQL channel
-- receives SQLSTATE 42501 with PostgreSQL's own fixed text. Neither answer
-- distinguishes "no such function" from "not yours", which is the same
-- property the four byte-identical BC101 sites carry.
-- =====================================================================

-- ---------------------------------------------------------------------
-- P-1 guard: this migration must run as postgres. A REVOKE issued by any
-- other role would either fail or silently not apply to the owner's ACL.
-- ---------------------------------------------------------------------
DO $guard$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION
      'Single-entry-point migration aborted before any change: this migration must run as postgres, not "%".',
      current_user;
  END IF;
END;
$guard$;

-- ---------------------------------------------------------------------
-- Precondition: abort before any change if the posture has drifted from
-- the one this revoke was written against.
-- ---------------------------------------------------------------------
DO $precondition$
DECLARE
  v_n bigint;
BEGIN
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public';
  IF v_n <> 33 THEN
    RAISE EXCEPTION
      'Single-entry-point migration aborted before any change: public holds % function(s); expected the accepted post-C2-A census of 33.', v_n;
  END IF;

  -- The over-granted object must still BE over-granted. If it is not, this
  -- migration is being applied to a posture it did not author and must not
  -- pretend to have closed anything.
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
     WHERE ns.nspname = 'public'
       AND p.proname = 'assessment_save_observation'
       AND p.pronargs = 10
       AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE')
  ) THEN
    RAISE EXCEPTION
      'Single-entry-point migration aborted before any change: public.assessment_save_observation does not hold authenticated EXECUTE, so the bypass this migration closes is not the posture on this database.';
  END IF;

  -- The composer must exist and must still be the atomic pairing, or
  -- removing the delegate's grant would remove the only complete-save path
  -- instead of narrowing it to the governed one.
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
     WHERE ns.nspname = 'public'
       AND p.proname = 'assessment_save_complete_and_open_report'
       AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE')
       AND p.prosrc LIKE '%public.assessment_save_observation(%'
       AND p.prosrc LIKE '%public.report_create(%'
       AND p.prosrc LIKE '%public.report_mark_observation_saved(%'
  ) THEN
    RAISE EXCEPTION
      'Single-entry-point migration aborted before any change: the R-C2-1 composer is missing, is not client-reachable, or no longer composes the observation write with the report shell.';
  END IF;

  -- The delegate's nine-rating gate is what makes "complete is the only
  -- payload it accepts" true. If BC106 had gone, the reasoning above would
  -- not hold and this migration would be reasoning about a body that no
  -- longer exists.
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
     WHERE ns.nspname = 'public'
       AND p.proname = 'assessment_save_observation'
       AND p.prosrc LIKE '%''BC106''%'
       AND p.prosrc LIKE '%jsonb_array_length(p_ratings) <> 9%'
  ) THEN
    RAISE EXCEPTION
      'Single-entry-point migration aborted before any change: assessment_save_observation has lost its BC106 nine-rating gate.';
  END IF;

  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 25 THEN
    RAISE EXCEPTION
      'Single-entry-point migration aborted before any change: % function(s) hold authenticated EXECUTE; expected the accepted post-C2-A census of 25.', v_n;
  END IF;
END;
$precondition$;

-- ---------------------------------------------------------------------
-- THE ONE CHANGE. Signature-qualified, so it can only ever reach the one
-- ten-argument overload this migration reasoned about.
--
-- The other four client roles are named alongside `authenticated` for the
-- same reason the committed migrations name them: the statement then
-- STATES the whole intended posture rather than depending on what a
-- previous file happened to leave behind. They already hold nothing, so
-- naming them removes nothing that exists.
--
-- NOTHING IS GRANTED HERE, TO ANYONE.
-- ---------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.assessment_save_observation(uuid, uuid, uuid, integer, text[], text[], text, text, text, jsonb) FROM authenticated, PUBLIC, anon, service_role, authenticator;

-- ---------------------------------------------------------------------
-- End-of-migration posture assertions
-- ---------------------------------------------------------------------
DO $assert$
DECLARE
  v_delegate CONSTANT text := 'assessment_save_observation';
  v_composer CONSTANT text := 'assessment_save_complete_and_open_report';
  v_n bigint;
  v_m bigint;
BEGIN
  -- X1: the function census is UNCHANGED at 33. Nothing was created,
  --     replaced or dropped -- this migration moves a privilege only.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public';
  IF v_n <> 33 THEN
    RAISE EXCEPTION 'Single-entry-point assertion X1 failed: % function(s) in public; expected 33 (unchanged)', v_n;
  END IF;

  -- X2: the object inventory is UNCHANGED -- 26 tables, 12 enums, 29
  --     policies, 8 report_status labels, RLS everywhere, FORCE nowhere.
  SELECT pg_catalog.count(*) FILTER (WHERE NOT c.relrowsecurity),
         pg_catalog.count(*) FILTER (WHERE c.relforcerowsecurity)
    INTO v_m, v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace ns ON ns.oid = c.relnamespace
   WHERE ns.nspname = 'public' AND c.relkind = 'r';
  IF v_m <> 0 OR v_n <> 0 THEN
    RAISE EXCEPTION 'Single-entry-point assertion X2 failed: % table(s) without RLS, % table(s) with FORCE RLS; expected 0 and 0', v_m, v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace ns ON ns.oid = c.relnamespace
   WHERE ns.nspname = 'public' AND c.relkind = 'r';
  IF v_n <> 26 THEN
    RAISE EXCEPTION 'Single-entry-point assertion X2 failed: % table(s) in public; expected 26 (unchanged)', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_type t
    JOIN pg_catalog.pg_namespace ns ON ns.oid = t.typnamespace
   WHERE ns.nspname = 'public' AND t.typtype = 'e';
  IF v_n <> 12 THEN
    RAISE EXCEPTION 'Single-entry-point assertion X2 failed: % enum type(s) in public; expected 12 (unchanged)', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM pg_catalog.pg_policies WHERE schemaname = 'public';
  IF v_n <> 29 THEN
    RAISE EXCEPTION 'Single-entry-point assertion X2 failed: % policy/policies in public; expected 29 (unchanged)', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_enum e JOIN pg_catalog.pg_type t ON t.oid = e.enumtypid
   WHERE t.typname = 'report_status';
  IF v_n <> 8 THEN
    RAISE EXCEPTION 'Single-entry-point assertion X2 failed: report_status holds % label(s); expected the ratified 8', v_n;
  END IF;

  -- X3: THE CLOSURE ITSELF. The delegate is reachable by NO client role
  --     and by PUBLIC nowhere. Its ACL is non-null (so the revoke really
  --     wrote an ACL rather than leaving the implicit owner-only default
  --     unexamined) and carries no PUBLIC entry.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_delegate AND p.pronargs = 10
     AND NOT pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE')
     AND NOT pg_catalog.has_function_privilege('anon',          p.oid, 'EXECUTE')
     AND NOT pg_catalog.has_function_privilege('service_role',  p.oid, 'EXECUTE')
     AND NOT pg_catalog.has_function_privilege('authenticator', p.oid, 'EXECUTE')
     AND p.proacl IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_catalog.aclexplode(p.proacl) ae WHERE ae.grantee = 0);
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Single-entry-point assertion X3 failed: public.% is still reachable by a client role (matched % row(s), expected 1)', v_delegate, v_n;
  END IF;

  -- X4: the composer is UNTOUCHED and still exclusively `authenticated`.
  --     The closure must narrow the surface, never remove the governed
  --     route with it.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_composer
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE')
     AND NOT pg_catalog.has_function_privilege('anon',          p.oid, 'EXECUTE')
     AND NOT pg_catalog.has_function_privilege('service_role',  p.oid, 'EXECUTE')
     AND NOT pg_catalog.has_function_privilege('authenticator', p.oid, 'EXECUTE')
     AND p.prosecdef
     AND pg_catalog.pg_get_userbyid(p.proowner) = 'postgres';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Single-entry-point assertion X4 failed: public.% is not exactly one postgres-owned SECURITY DEFINER function holding authenticated EXECUTE exclusively', v_composer;
  END IF;

  -- X5: THE INVARIANT, STATED STRUCTURALLY. Of every function a client can
  --     execute, EXACTLY ONE reaches the observation write -- and that one
  --     also walks T0 and T1 in the same body, so a complete nine-rating
  --     observation cannot commit through any client-reachable object
  --     without a report shell committing in the same transaction.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE')
     AND p.prosrc LIKE '%assessment_save_observation%';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Single-entry-point assertion X5 failed: % client-reachable function(s) reference the observation write; expected exactly 1 (the composer)', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE')
     AND p.prosrc LIKE '%assessment_save_observation%'
     AND p.proname = v_composer
     AND p.prosrc LIKE '%public.report_create(%'
     AND p.prosrc LIKE '%public.report_mark_observation_saved(%';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Single-entry-point assertion X5 failed: the single client-reachable observation-write route is not the composer, or no longer opens the report shell in the same body';
  END IF;

  -- X6: there is no DIRECT-TABLE write path to close either. No client role
  --     holds INSERT, UPDATE or DELETE on the observation or report tables.
  SELECT pg_catalog.count(*) INTO v_n
    FROM (VALUES ('anon'), ('authenticated'), ('service_role'), ('public')) AS r(rn)
    CROSS JOIN (VALUES ('public.observations'), ('public.observation_ratings'), ('public.reports')) AS t(tn)
    CROSS JOIN (VALUES ('INSERT'), ('UPDATE'), ('DELETE'), ('TRUNCATE')) AS pv(pn)
   WHERE pg_catalog.has_table_privilege(r.rn, t.tn::pg_catalog.regclass, pv.pn);
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Single-entry-point assertion X6 failed: % client DML privilege(s) exist on the observation/report tables; expected 0', v_n;
  END IF;

  -- X7: the EXECUTE census falls by EXACTLY ONE, to 24. A revoke that
  --     removed more than its one target would fail here.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public'
     AND pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE');
  IF v_n <> 24 THEN
    RAISE EXCEPTION 'Single-entry-point assertion X7 failed: % function(s) hold authenticated EXECUTE; expected 24 (25 - 1)', v_n;
  END IF;

  -- X8: the delegate's BODY is byte-untouched -- same owner, same
  --     SECURITY DEFINER posture, same pinned empty search_path, its BC106
  --     nine-rating gate and its BC114 post-condition intact, and still no
  --     reference to any report object (T-ASM-32's property, re-derived
  --     from the catalogue). Removing a grant must not be mistaken for
  --     rewriting a function.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace ns ON ns.oid = p.pronamespace
   WHERE ns.nspname = 'public' AND p.proname = v_delegate AND p.pronargs = 10
     AND pg_catalog.pg_get_userbyid(p.proowner) = 'postgres'
     AND p.prosecdef
     AND p.provolatile = 'v'
     AND NOT p.proisstrict
     AND p.proconfig IS NOT NULL
     AND 'search_path=""' = ANY (p.proconfig)
     AND p.prosrc LIKE '%''BC106''%'
     AND p.prosrc LIKE '%''BC114''%'
     -- Comments are stripped before the "reaches no report object" leg is
     -- evaluated: the ratified body DISCUSSES `public.reports` in its step-14
     -- comment precisely to record that it never touches it, and matching that
     -- prose would assert the opposite of the intended property (the same
     -- comment-stripping discipline T-ASM-32 and ct-static already use).
     AND pg_catalog.regexp_replace(p.prosrc, '--[^\n]*', '', 'g') NOT LIKE '%public.reports%'
     AND pg_catalog.regexp_replace(p.prosrc, '--[^\n]*', '', 'g') NOT LIKE '%public.report_%'
     AND pg_catalog.regexp_replace(p.prosrc, '--[^\n]*', '', 'g') NOT LIKE '%audit_append_event%';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Single-entry-point assertion X8 failed: public.% is no longer the byte-untouched ratified delegate', v_delegate;
  END IF;

  RAISE NOTICE 'Single-entry-point migration applied: authenticated EXECUTE removed from public.assessment_save_observation. 33 functions unchanged, 24 hold authenticated EXECUTE (was 25), and EXACTLY ONE client-reachable function reaches the observation write -- the R-C2-1 composer, which opens the report shell in the same transaction. No object created, replaced or dropped; no grant issued; no data written.';
END;
$assert$;
