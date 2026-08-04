-- =====================================================================
-- Step 7H -- Append-only hash-chained audit module (infrastructure only)
-- =====================================================================
-- Implements exactly the ratified audit-chain design baseline
-- docs/plan/STEP_7H_AUDIT_CHAIN_BASELINE.md (A-1 ... A-6, committed at
-- 3e479b69b1a4cd3592daf3edc321e92929002dbb; ratified D-261 ... D-272).
--
-- Objects created (design section 7, the ratified inventory):
--   tables    : public.audit_events, public.audit_event_targets,
--               public.audit_chain_heads
--   functions : public.audit_canonical_json  (section 4.4 serializer)
--               public.audit_append_event    (section 5.2 append authority)
--               public.audit_verify_chain    (section 6 verification)
--   triggers  : audit_events        BEFORE UPDATE OR DELETE  -> raise
--               audit_event_targets BEFORE UPDATE OR DELETE  -> raise
--               audit_chain_heads   BEFORE DELETE (only)     -> raise
--   support   : public.audit_block_mutation() -- the shared raising
--               trigger helper. It is implementation support for the three
--               ratified triggers, not a fourth audit API: it takes no
--               arguments, reads nothing, does nothing but raise, and is
--               executable by no client role. Counted explicitly in the
--               end-of-migration assertions (B10, B12, B13).
--
-- Documented implementation rulings (reconciled from independent static
-- review before authoring; none alters the ratified contract):
--   R1 actor FK    : the membership attribution uses the Step 7E composite
--                    role-pinned FK (actor_membership_id, centre_id,
--                    actor_role) -> centre_memberships (id, centre_id, role)
--                    -- a documented strengthening of section 7's minimum
--                    single-column FK, using the existing 7E candidate key;
--                    MATCH SIMPLE makes it vacuous for the jointly-NULL
--                    system triple (section 5.4).
--   R2 ordinal     : audit_event_targets carries ordinal (1..n, unique per
--                    event) so section 6.2-6's "payload related_targets
--                    array equals the child rows" is well-defined and
--                    order-exact. Justified by section 4.4 (ordered array)
--                    + section 6.2-6 (equality check).
--   R3 injection   : related targets arrive as a parameter; the caller
--                    payload must NOT contain the reserved key
--                    'related_targets' (rejected); the function normalizes
--                    the array deterministically and merges it into the
--                    payload before serialization, so the hash and the
--                    child rows are projections of one normalized value.
--                    The key is always present (possibly []) -- uniform,
--                    branch-free verification.
--   R4 occurred_at : computed inside the function as now() (transaction
--                    time; database clock per section 1.2). No caller
--                    parameter exists -- callers cannot supply the
--                    authoritative timestamp. Ordering authority is
--                    (centre_id, seq_no), never the timestamp.
--   R5 serializer  : audit_canonical_json is IMMUTABLE (section 7), STRICT
--                    (SQL NULL never reaches it, section 4.4), SECURITY
--                    INVOKER (the design states DEFINER only for append and
--                    verify; the serializer reads no tables).
--   R6 triggers    : BEFORE ... FOR EACH STATEMENT -- the raise is
--                    unconditional ("statement-independent", section 7) and
--                    STATEMENT level denies even zero-row UPDATE/DELETE
--                    attempts. The head trigger's DELETE-only scope lives in
--                    the CREATE TRIGGER event clause; the body has no
--                    conditional and no session variable of any kind.
--   R7 head seed   : audit_chain_heads.last_seq CHECK is >= 0 because the
--                    section 5.2 step-4 seed row legitimately holds 0
--                    inside the first append's transaction; a COMMITTED
--                    zero head is prevented by the protocol (seed + update
--                    in one transaction) and detected as a failure by
--                    audit_verify_chain (section 3), exactly as ratified.
--   R8 registry    : function-enforced text (A-026: no enum, no placeholder
--                    enum). 16 registered actions (section 1.4, E1-E8 incl.
--                    the reserved membership.bootstrap). membership.bootstrap
--                    is the only system-actor-allowed action (section 5.4)
--                    and -- being "name reserved only", design deferred with
--                    N-4 -- is rejected on the authenticated path: the two
--                    actor paths are exact complements.
--   R9 version pin : audit_events.canonical_version CHECK (= 1): v1 rows
--                    only. A future envelope v2 migration relaxes this
--                    deliberately (section 4.2: parallel serializer;
--                    committed rows are never re-serialized).
--
-- Reviewed residual limits (adversarial static review, Step 7H1C -- recorded
-- deliberately rather than silently widened; none is a contract breach):
--   L1 TRUNCATE  : the ratified trigger inventory covers UPDATE/DELETE (and
--                  DELETE on the head). A TRUNCATE is neither prevented by
--                  them nor reachable by any client (zero TRUNCATE privilege,
--                  asserted in B6/B8/B9) -- an owner-side TRUNCATE would be
--                  detected by audit_verify_chain, not blocked. Widening the
--                  trigger events would deviate from the ratified section-7
--                  inventory, so it is reported, not done.
--   L2 actor pair: that actor_account_id and actor_membership_id name the
--                  SAME person is enforced by the append function, not by a
--                  constraint -- centre_memberships exposes no candidate key
--                  containing account_id, so no such FK is declarable without
--                  amending Step 7E. Clients cannot reach the tables at all.
--   L3 liveness  : between actor validation and the INSERT, a concurrent
--                  transaction could deactivate the membership (READ
--                  COMMITTED). The composite FK re-proves existence/role/
--                  centre but takes only KEY SHARE, not liveness. This is the
--                  ratified "validated at append time" contract (section 5.4);
--                  narrowing it would require locking the membership row -- a
--                  contract change, not a defect fix.
--   L4 labels    : target_label may be the empty string; the ratified shape
--                  imposes NOT NULL only, and an empty snapshot is still
--                  hash-covered evidence.
--   L5 registries: the action registry is stated twice (A-026 forbids an
--                  enum; section 7 admits no lookup table). B20 proves the
--                  two copies equal at apply time and fails closed if either
--                  can no longer be extracted; any later migration that
--                  replaces one function must carry that assertion forward.
--
-- Prohibitions honoured (checkpoint + design section 5.5): no extension,
-- no ALTER DEFAULT PRIVILEGES, no ownership change, no new schema, no
-- view or materialized view, no dynamic SQL, no RLS disable, no FORCE
-- ROW LEVEL SECURITY, no grant to any client role, no report-lifecycle
-- RPC, no real audit event appended, no fixture mutation.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0/6 -- Execution-role guard (P-1, fail closed; design T-1)
-- ---------------------------------------------------------------------
DO $guard$
BEGIN
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION
      'Step 7H aborted before any change: this migration must run as postgres, not "%". '
      'Objects created by supabase_admin in schema public would inherit its default ACL '
      '(ALL to anon/authenticated/service_role) -- the exact hazard P-1 exists to prevent.',
      current_user;
  END IF;
END;
$guard$;

-- ---------------------------------------------------------------------
-- 1/6 -- Tables (design sections 3, 5.1, 7)
-- ---------------------------------------------------------------------

-- Append-only event rows. One row per governed action (A-029), hash-chained
-- per centre. INSERT happens only inside audit_append_event; UPDATE/DELETE
-- never happen (trigger-guarded, privilege-denied).
CREATE TABLE public.audit_events (
  id                  uuid        NOT NULL DEFAULT gen_random_uuid(),
  centre_id           uuid        NOT NULL,
  seq_no              bigint      NOT NULL,
  canonical_version   smallint    NOT NULL,
  occurred_at         timestamptz NOT NULL,
  actor_account_id    uuid,
  actor_membership_id uuid,
  actor_role          public.centre_membership_role,
  action              text        NOT NULL,
  state_domain        text,
  state_from          text,
  state_to            text,
  target_type         text        NOT NULL,
  target_id           uuid,
  target_label        text        NOT NULL,
  payload             jsonb       NOT NULL,
  payload_canonical   text        NOT NULL,
  prev_hash           text        NOT NULL,
  entry_hash          text        NOT NULL,

  CONSTRAINT audit_events_pkey             PRIMARY KEY (id),
  CONSTRAINT audit_events_centre_fk
    FOREIGN KEY (centre_id) REFERENCES public.centres (id) ON DELETE RESTRICT,
  -- Durable actor FKs, A-029 (RESTRICT: history pins its actors).
  CONSTRAINT audit_events_actor_account_fk
    FOREIGN KEY (actor_account_id) REFERENCES public.accounts (id) ON DELETE RESTRICT,
  -- R1: role-pinned same-centre composite FK (7E convention); vacuous when
  -- the actor triple is jointly NULL (system path, MATCH SIMPLE).
  CONSTRAINT audit_events_actor_membership_fk
    FOREIGN KEY (actor_membership_id, centre_id, actor_role)
    REFERENCES public.centre_memberships (id, centre_id, role) ON DELETE RESTRICT,
  -- Chain identity and back-stops (section 5.2 step 8).
  CONSTRAINT audit_events_centre_seq_key   UNIQUE (centre_id, seq_no),
  CONSTRAINT audit_events_entry_hash_key   UNIQUE (entry_hash),
  -- Candidate key for the same-centre child FK (7E convention).
  CONSTRAINT audit_events_id_centre_key    UNIQUE (id, centre_id),
  CONSTRAINT audit_events_seq_no_chk       CHECK (seq_no >= 1),
  -- R9: v1 envelope only; a future v2 migration relaxes this deliberately.
  CONSTRAINT audit_events_canonical_version_chk CHECK (canonical_version = 1),
  -- 64 lowercase hex (section 4.2: the stored text IS the hashed representation).
  CONSTRAINT audit_events_prev_hash_chk    CHECK (prev_hash  ~ '^[0-9a-f]{64}$'),
  CONSTRAINT audit_events_entry_hash_chk   CHECK (entry_hash ~ '^[0-9a-f]{64}$'),
  -- Actor triple: all present (authenticated path) or all absent (system
  -- path) -- never partial (section 5.4).
  CONSTRAINT audit_events_actor_triple_chk CHECK (
        (actor_account_id IS NULL AND actor_membership_id IS NULL AND actor_role IS NULL)
     OR (actor_account_id IS NOT NULL AND actor_membership_id IS NOT NULL AND actor_role IS NOT NULL)
  ),
  CONSTRAINT audit_events_action_chk       CHECK (length(btrim(action)) > 0),
  CONSTRAINT audit_events_target_type_chk  CHECK (length(btrim(target_type)) > 0)
);

COMMENT ON TABLE public.audit_events IS
  'Step 7H (design section 7): append-only hash-chained audit events, one chain per centre. INSERT only via public.audit_append_event; UPDATE/DELETE denied by trigger and by zero privileges. Polymorphic target carries no FK (A-029) -- an immutable label snapshot instead.';

-- A-029 related-target child rows: a queryable projection of the ordered
-- related_targets array inside each event payload (hash-covered there;
-- cross-checked by verification, section 6.2-6).
CREATE TABLE public.audit_event_targets (
  id           uuid    NOT NULL DEFAULT gen_random_uuid(),
  event_id     uuid    NOT NULL,
  centre_id    uuid    NOT NULL,
  ordinal      integer NOT NULL,
  target_type  text    NOT NULL,
  target_id    uuid,
  target_label text    NOT NULL,

  CONSTRAINT audit_event_targets_pkey PRIMARY KEY (id),
  -- Same-centre composite FK to the owning event (7E convention; RESTRICT --
  -- events are never deleted, CASCADE would be dead code weakening posture).
  CONSTRAINT audit_event_targets_event_fk
    FOREIGN KEY (event_id, centre_id)
    REFERENCES public.audit_events (id, centre_id) ON DELETE RESTRICT,
  -- R2: exact, order-preserving projection of the payload array.
  CONSTRAINT audit_event_targets_event_ordinal_key UNIQUE (event_id, ordinal),
  CONSTRAINT audit_event_targets_ordinal_chk       CHECK (ordinal >= 1),
  CONSTRAINT audit_event_targets_target_type_chk   CHECK (length(btrim(target_type)) > 0)
);

COMMENT ON TABLE public.audit_event_targets IS
  'Step 7H (design section 7 / A-029): related-target child rows -- the queryable projection of each event payload related_targets array, order-pinned by ordinal (ruling R2).';

-- One row per centre chain: the lock point and head anchor (section 3).
CREATE TABLE public.audit_chain_heads (
  centre_id  uuid        NOT NULL,
  last_seq   bigint      NOT NULL,
  last_hash  text        NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT audit_chain_heads_pkey PRIMARY KEY (centre_id),
  CONSTRAINT audit_chain_heads_centre_fk
    FOREIGN KEY (centre_id) REFERENCES public.centres (id) ON DELETE RESTRICT,
  -- R7: 0 is the legitimate uncommitted seed value (section 5.2 step 4);
  -- a committed zero head is protocol-impossible and verification-detected.
  CONSTRAINT audit_chain_heads_last_seq_chk  CHECK (last_seq >= 0),
  CONSTRAINT audit_chain_heads_last_hash_chk CHECK (last_hash ~ '^[0-9a-f]{64}$')
);

COMMENT ON TABLE public.audit_chain_heads IS
  'Step 7H (design section 3): one row per centre -- the per-centre append serializer (SELECT ... FOR UPDATE) and stored head anchor (last_seq, last_hash). Seeded at last_seq = 0 with the domain-separated genesis hash inside the first append transaction; a committed row never holds last_seq = 0. DELETE denied; INSERT/UPDATE happen only inside audit_append_event.';

-- FK-support indexes (7E Section-12 convention: RESTRICT FKs get lookup
-- support on the referencing side).
CREATE INDEX audit_events_actor_account_idx    ON public.audit_events (actor_account_id);
CREATE INDEX audit_events_actor_membership_idx ON public.audit_events (actor_membership_id);
CREATE INDEX audit_event_targets_centre_idx    ON public.audit_event_targets (centre_id);

-- ---------------------------------------------------------------------
-- 2/6 -- RLS posture and table privileges (design section 5.5)
-- ---------------------------------------------------------------------
-- RLS enabled with zero policies, for posture consistency. RLS is NOT the
-- boundary that constrains service_role (BYPASSRLS, D-254): the boundary is
-- zero privilege. No FORCE ROW LEVEL SECURITY anywhere.
ALTER TABLE public.audit_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_event_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_chain_heads   ENABLE ROW LEVEL SECURITY;

-- The Step 7E hardened default ACLs already materialize new postgres-owned
-- objects at zero client privileges; these REVOKEs make the posture explicit
-- rather than inherited (7G precedent), and extend the explicit list to
-- authenticator (belt-and-braces; it inherits nothing regardless).
REVOKE ALL ON TABLE public.audit_events
  FROM PUBLIC, anon, authenticated, service_role, authenticator;
REVOKE ALL ON TABLE public.audit_event_targets
  FROM PUBLIC, anon, authenticated, service_role, authenticator;
REVOKE ALL ON TABLE public.audit_chain_heads
  FROM PUBLIC, anon, authenticated, service_role, authenticator;

-- ---------------------------------------------------------------------
-- 3/6 -- Append-only guard triggers (design sections 5.5, 7; ruling R6)
-- ---------------------------------------------------------------------
-- Accident protection only (the client boundary is privilege, not these
-- triggers; a superuser can disable triggers -- that actor is section 1.2's
-- deferred-anchor territory). The body is an unconditional raise: no
-- session variable, no custom GUC, no caller-supplied bypass of any kind.
CREATE FUNCTION public.audit_block_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $fn$
BEGIN
  RAISE EXCEPTION
    'audit append-only violation: % on %.% is never permitted (design section 5.5: correction is a new event; repair never mutates evidence)',
    TG_OP, TG_TABLE_SCHEMA, TG_TABLE_NAME;
END;
$fn$;

COMMENT ON FUNCTION public.audit_block_mutation() IS
  'Step 7H: shared raising helper for the three ratified append-only guard triggers. Implementation support, not an audit API: no client role can execute it, and it does nothing but raise.';

CREATE TRIGGER audit_events_block_update_delete_trg
  BEFORE UPDATE OR DELETE ON public.audit_events
  FOR EACH STATEMENT EXECUTE FUNCTION public.audit_block_mutation();

CREATE TRIGGER audit_event_targets_block_update_delete_trg
  BEFORE UPDATE OR DELETE ON public.audit_event_targets
  FOR EACH STATEMENT EXECUTE FUNCTION public.audit_block_mutation();

-- DELETE only: the append function legitimately INSERTs and UPDATEs the
-- head (section 5.2 steps 4 and 8) and must never be blocked (section 5.5).
CREATE TRIGGER audit_chain_heads_block_delete_trg
  BEFORE DELETE ON public.audit_chain_heads
  FOR EACH STATEMENT EXECUTE FUNCTION public.audit_block_mutation();

-- ---------------------------------------------------------------------
-- 4/6 -- Canonical JSON serializer (design section 4.4; ruling R5)
-- ---------------------------------------------------------------------
-- Recursive deterministic serializer over jsonb using core functionality
-- only. Object keys in pure UTF-8 byte order (convert_to -- deliberately
-- NOT the native jsonb length-then-bytes order); arrays preserve order at
-- every depth; numbers render as numeric::text (jsonb already stores exact
-- numeric; scale preserved, scientific input normalized at ingestion);
-- exhaustive escaping: quote, backslash, \b \t \n \f \r, every other
-- control U+0001-U+001F as \u00xx lowercase, nothing else escaped (no \/,
-- no non-ASCII escaping; raw UTF-8, no Unicode normalization). U+0000 is
-- structurally absent (jsonb rejects it at ingestion). JSON null -> the
-- token null; the string "null" stays quoted; SQL NULL never arrives
-- (STRICT + append-side rejection). No insignificant whitespace.
CREATE FUNCTION public.audit_canonical_json(p_value jsonb)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
STRICT
PARALLEL SAFE
SET search_path = ''
AS $fn$
DECLARE
  v_type  text;
  v_out   text;
  v_first boolean;
  v_key   text;
  v_child jsonb;
  v_str   text;
  v_code  integer;
BEGIN
  v_type := pg_catalog.jsonb_typeof(p_value);

  IF v_type = 'object' THEN
    v_out := '{';
    v_first := true;
    FOR v_key, v_child IN
      SELECT e.key, e.value
        FROM pg_catalog.jsonb_each(p_value) AS e(key, value)
       ORDER BY pg_catalog.convert_to(e.key, 'UTF8')
    LOOP
      IF NOT v_first THEN
        v_out := v_out || ',';
      END IF;
      v_first := false;
      v_out := v_out
        || public.audit_canonical_json(pg_catalog.to_jsonb(v_key))
        || ':'
        || public.audit_canonical_json(v_child);
    END LOOP;
    RETURN v_out || '}';

  ELSIF v_type = 'array' THEN
    v_out := '[';
    v_first := true;
    FOR v_child IN
      SELECT e.value
        FROM pg_catalog.jsonb_array_elements(p_value) WITH ORDINALITY AS e(value, ord)
       ORDER BY e.ord
    LOOP
      IF NOT v_first THEN
        v_out := v_out || ',';
      END IF;
      v_first := false;
      v_out := v_out || public.audit_canonical_json(v_child);
    END LOOP;
    RETURN v_out || ']';

  ELSIF v_type = 'string' THEN
    v_str := p_value #>> '{}';
    -- Order matters: backslash first (or later escapes would be re-escaped),
    -- then quote, then the five named controls, then the remaining controls.
    v_str := pg_catalog.replace(v_str, '\', '\\');
    v_str := pg_catalog.replace(v_str, '"', '\"');
    v_str := pg_catalog.replace(v_str, pg_catalog.chr(8),  '\b');
    v_str := pg_catalog.replace(v_str, pg_catalog.chr(9),  '\t');
    v_str := pg_catalog.replace(v_str, pg_catalog.chr(10), '\n');
    v_str := pg_catalog.replace(v_str, pg_catalog.chr(12), '\f');
    v_str := pg_catalog.replace(v_str, pg_catalog.chr(13), '\r');
    FOREACH v_code IN ARRAY ARRAY[1,2,3,4,5,6,7,11,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]
    LOOP
      v_str := pg_catalog.replace(v_str, pg_catalog.chr(v_code),
                 '\u00' || pg_catalog.lpad(pg_catalog.to_hex(v_code), 2, '0'));
    END LOOP;
    RETURN '"' || v_str || '"';

  ELSIF v_type = 'number' THEN
    RETURN ((p_value #>> '{}')::numeric)::text;

  ELSIF v_type = 'boolean' THEN
    RETURN p_value #>> '{}';

  ELSE
    -- jsonb_typeof = 'null': the JSON null token (distinct from the quoted
    -- string "null" handled above; SQL NULL never arrives -- STRICT).
    RETURN 'null';
  END IF;
END;
$fn$;

COMMENT ON FUNCTION public.audit_canonical_json(jsonb) IS
  'Step 7H (design section 4.4): deterministic recursive canonical-JSON serializer -- UTF-8 byte-ordered object keys, order-preserving arrays, numeric::text numbers, exhaustive control/quote/backslash escaping, raw UTF-8, no Unicode normalization. Internal helper of append + verify; no client EXECUTE.';

-- ---------------------------------------------------------------------
-- 5/6 -- Append entry point (design section 5; rulings R3, R4, R8)
-- ---------------------------------------------------------------------
-- The ONLY append authority. Callers can never supply prev_hash, entry_hash,
-- seq_no or the authoritative timestamp -- no such parameters exist.
-- Reachable exclusively through owner-context governed RPCs (postgres
-- executes by ownership; no grant exists or is needed -- section 5.5).
CREATE FUNCTION public.audit_append_event(
  p_centre_id           uuid,
  p_actor_account_id    uuid,
  p_actor_membership_id uuid,
  p_actor_role          public.centre_membership_role,
  p_action              text,
  p_state_domain        text,
  p_state_from          text,
  p_state_to            text,
  p_target_type         text,
  p_target_id           uuid,
  p_target_label        text,
  p_related_targets     jsonb,
  p_payload             jsonb,
  OUT o_event_id        uuid,
  OUT o_entry_hash      text
)
RETURNS record
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  -- R8: the ratified registry (design section 1.4, E1-E8), function-enforced
  -- text per A-026. Extending it is a reviewed code change, never an enum.
  v_registry CONSTANT text[] := ARRAY[
    'report.created',
    'report_version.created',
    'report.state_changed',
    'attendance.changed',
    'admin.module_created',
    'admin.session_created',
    'admin.trainer_assigned',
    'admin.student_created',
    'admin.enrolment_changed',
    'admin.parent_link_changed',
    'admin.profile_created',
    'invitation.created',
    'invitation.revoked',
    'invitation.reissued',
    'membership.role_changed',
    'membership.bootstrap'
  ];
  -- Section 5.4: v1 flags ONLY the reserved membership.bootstrap as
  -- system-actor-allowed; it is system-only (ruling R8).
  v_system_only CONSTANT text[] := ARRAY['membership.bootstrap'];
  v_field_names CONSTANT text[] := ARRAY[
    'canonical_version','centre_id','seq_no','prev_hash','occurred_at',
    'actor_account_id','actor_membership_id','actor_role','action',
    'state_domain','state_from','state_to','target_type','target_id',
    'target_label','payload_canonical'
  ];
  v_lf CONSTANT text := pg_catalog.chr(10);

  v_uid               uuid;
  v_norm_targets      jsonb;
  v_elem              jsonb;
  v_elem_keys         text[];
  v_elem_target_id    uuid;
  v_payload           jsonb;
  v_payload_canonical text;
  v_genesis           text;
  v_last_seq          bigint;
  v_last_hash         text;
  v_seq_no            bigint;
  v_prev_hash         text;
  v_occurred_at       timestamptz;
  v_field_values      text[];
  v_preimage          text;
  v_event_id          uuid;
  v_ord               integer;
  v_i                 integer;
BEGIN
  -- ---- section 5.2 step 1: centre validation -------------------------
  IF p_centre_id IS NULL THEN
    RAISE EXCEPTION 'audit_append_event: centre_id must not be NULL';
  END IF;
  PERFORM 1 FROM public.centres c WHERE c.id = p_centre_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'audit_append_event: unknown centre %', p_centre_id;
  END IF;

  -- ---- section 5.2 step 2: registry and payload validation -----------
  IF p_action IS NULL OR NOT (p_action = ANY (v_registry)) THEN
    RAISE EXCEPTION 'audit_append_event: action "%" is not in the ratified event registry (design section 1.4)', p_action;
  END IF;
  IF p_target_type IS NULL OR pg_catalog.length(pg_catalog.btrim(p_target_type)) = 0 THEN
    RAISE EXCEPTION 'audit_append_event: target_type must be non-empty';
  END IF;
  IF p_target_label IS NULL THEN
    RAISE EXCEPTION 'audit_append_event: target_label must not be NULL (immutable snapshot, A-029)';
  END IF;
  IF p_payload IS NULL THEN
    RAISE EXCEPTION 'audit_append_event: payload must not be SQL NULL (the empty payload is {})';
  END IF;
  IF pg_catalog.jsonb_typeof(p_payload) <> 'object' THEN
    RAISE EXCEPTION 'audit_append_event: payload must be a JSON object (design section 4.4)';
  END IF;
  IF p_payload ? 'related_targets' THEN
    RAISE EXCEPTION 'audit_append_event: payload key "related_targets" is reserved -- pass related targets via p_related_targets (ruling R3)';
  END IF;

  -- Related-target normalization (ruling R3): ordered array of exactly
  -- {target_type, target_id, target_label}; ids normalized to lowercase
  -- canonical uuid text; NULL parameter means "none".
  IF p_related_targets IS NOT NULL
     AND pg_catalog.jsonb_typeof(p_related_targets) <> 'array' THEN
    RAISE EXCEPTION 'audit_append_event: p_related_targets must be a JSON array when supplied';
  END IF;
  v_norm_targets := '[]'::jsonb;
  FOR v_elem IN
    SELECT e.value
      FROM pg_catalog.jsonb_array_elements(COALESCE(p_related_targets, '[]'::jsonb))
           WITH ORDINALITY AS e(value, ord)
     ORDER BY e.ord
  LOOP
    IF pg_catalog.jsonb_typeof(v_elem) <> 'object' THEN
      RAISE EXCEPTION 'audit_append_event: each related target must be a JSON object';
    END IF;
    SELECT pg_catalog.array_agg(k.key ORDER BY k.key)
      INTO v_elem_keys
      FROM pg_catalog.jsonb_object_keys(v_elem) AS k(key);
    IF v_elem_keys IS DISTINCT FROM ARRAY['target_id','target_label','target_type'] THEN
      RAISE EXCEPTION 'audit_append_event: related target must carry exactly target_type, target_id, target_label';
    END IF;
    IF pg_catalog.jsonb_typeof(v_elem->'target_type') <> 'string'
       OR pg_catalog.length(pg_catalog.btrim(v_elem->>'target_type')) = 0 THEN
      RAISE EXCEPTION 'audit_append_event: related target_type must be a non-empty string';
    END IF;
    IF pg_catalog.jsonb_typeof(v_elem->'target_label') <> 'string' THEN
      RAISE EXCEPTION 'audit_append_event: related target_label must be a string';
    END IF;
    IF pg_catalog.jsonb_typeof(v_elem->'target_id') = 'null' THEN
      v_elem_target_id := NULL;
    ELSIF pg_catalog.jsonb_typeof(v_elem->'target_id') = 'string' THEN
      BEGIN
        v_elem_target_id := (v_elem->>'target_id')::uuid;
      EXCEPTION WHEN invalid_text_representation THEN
        RAISE EXCEPTION 'audit_append_event: related target_id "%" is not a valid uuid', v_elem->>'target_id';
      END;
    ELSE
      RAISE EXCEPTION 'audit_append_event: related target_id must be a uuid string or null';
    END IF;
    v_norm_targets := v_norm_targets || pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'target_type',  v_elem->>'target_type',
        'target_id',    CASE WHEN v_elem_target_id IS NULL THEN NULL
                             ELSE v_elem_target_id::text END,
        'target_label', v_elem->>'target_label'
      )
    );
  END LOOP;

  -- ---- section 5.2 step 3: actor validation (section 5.4) ------------
  v_uid := auth.uid();
  IF v_uid IS NOT NULL THEN
    -- Authenticated path: the passed triple is re-proven, never trusted.
    IF p_actor_account_id IS NULL OR p_actor_membership_id IS NULL OR p_actor_role IS NULL THEN
      RAISE EXCEPTION 'audit_append_event: an authenticated event requires the full actor triple (account, membership, role)';
    END IF;
    IF p_action = ANY (v_system_only) THEN
      RAISE EXCEPTION 'audit_append_event: action "%" is reserved for system origin -- a JWT-backed session can never emit it (design section 5.4)', p_action;
    END IF;
    PERFORM 1
      FROM public.accounts a
     WHERE a.id = p_actor_account_id
       AND a.auth_user_id = v_uid
       AND a.status = 'active';
    IF NOT FOUND THEN
      RAISE EXCEPTION 'audit_append_event: actor account is not the active account of the current session identity';
    END IF;
    PERFORM 1
      FROM public.centre_memberships m
     WHERE m.id = p_actor_membership_id
       AND m.account_id = p_actor_account_id
       AND m.centre_id = p_centre_id
       AND m.role = p_actor_role
       AND m.status = 'active';
    IF NOT FOUND THEN
      RAISE EXCEPTION 'audit_append_event: actor membership does not match an active membership of that account, role and centre';
    END IF;
  ELSE
    -- System/operator path: jointly-NULL triple + registry-flagged action.
    IF p_actor_account_id IS NOT NULL OR p_actor_membership_id IS NOT NULL OR p_actor_role IS NOT NULL THEN
      RAISE EXCEPTION 'audit_append_event: a system event requires a jointly-NULL actor triple (design section 5.4)';
    END IF;
    IF NOT (p_action = ANY (v_system_only)) THEN
      RAISE EXCEPTION 'audit_append_event: action "%" requires an authenticated actor (design section 5.4)', p_action;
    END IF;
  END IF;

  -- Merge the normalized related targets into the payload (ruling R3): the
  -- hash covers them; the child rows are a projection of this same value.
  v_payload := p_payload || pg_catalog.jsonb_build_object('related_targets', v_norm_targets);
  v_payload_canonical := public.audit_canonical_json(v_payload);

  -- ---- section 5.2 step 4: atomic head seed-or-skip ------------------
  v_genesis := pg_catalog.encode(
    pg_catalog.sha256(
      pg_catalog.convert_to('BESTCOACH-AUDIT-GENESIS-V1|' || p_centre_id::text, 'UTF8')
    ), 'hex');
  INSERT INTO public.audit_chain_heads (centre_id, last_seq, last_hash)
  VALUES (p_centre_id, 0, v_genesis)
  ON CONFLICT (centre_id) DO NOTHING;

  -- ---- section 5.2 step 5: lock ---------------------------------------
  -- A separate statement, deliberately: under READ COMMITTED the loser of a
  -- concurrent seed race re-reads the winner's COMMITTED head under a fresh
  -- statement snapshot (the design's two-writer proof depends on this;
  -- steps 4 and 5 must never be fused into one statement).
  SELECT h.last_seq, h.last_hash
    INTO STRICT v_last_seq, v_last_hash
    FROM public.audit_chain_heads h
   WHERE h.centre_id = p_centre_id
   FOR UPDATE;

  -- ---- section 5.2 step 6: allocate (uniform -- no genesis branch) ----
  v_seq_no    := v_last_seq + 1;
  v_prev_hash := v_last_hash;

  -- ---- section 5.2 step 7: envelope and hash (section 4.2) ------------
  v_occurred_at := pg_catalog.now();  -- R4: database clock, transaction time
  v_field_values := ARRAY[
    '1',                                                     -- canonical_version
    p_centre_id::text,                                       -- centre_id
    v_seq_no::text,                                          -- seq_no
    v_prev_hash,                                             -- prev_hash
    pg_catalog.to_char(v_occurred_at AT TIME ZONE 'UTC',
                       'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),     -- occurred_at
    p_actor_account_id::text,                                -- actor_account_id
    p_actor_membership_id::text,                             -- actor_membership_id
    p_actor_role::text,                                      -- actor_role
    p_action,                                                -- action
    p_state_domain,                                          -- state_domain
    p_state_from,                                            -- state_from
    p_state_to,                                              -- state_to
    p_target_type,                                           -- target_type
    p_target_id::text,                                       -- target_id
    p_target_label,                                          -- target_label
    v_payload_canonical                                      -- payload_canonical
  ];
  v_preimage := 'BESTCOACH-AUDIT-V1' || v_lf;
  FOR v_i IN 1..16 LOOP
    IF v_field_values[v_i] IS NULL THEN
      v_preimage := v_preimage || v_field_names[v_i] || ':N' || v_lf;
    ELSE
      v_preimage := v_preimage || v_field_names[v_i] || ':V:'
        || pg_catalog.octet_length(v_field_values[v_i])::text || ':'
        || v_field_values[v_i] || v_lf;
    END IF;
  END LOOP;
  o_entry_hash := pg_catalog.encode(
    pg_catalog.sha256(pg_catalog.convert_to(v_preimage, 'UTF8')), 'hex');

  -- ---- section 5.2 step 8: write (event + children + head, atomically) -
  v_event_id := pg_catalog.gen_random_uuid();
  INSERT INTO public.audit_events (
    id, centre_id, seq_no, canonical_version, occurred_at,
    actor_account_id, actor_membership_id, actor_role,
    action, state_domain, state_from, state_to,
    target_type, target_id, target_label,
    payload, payload_canonical, prev_hash, entry_hash
  ) VALUES (
    v_event_id, p_centre_id, v_seq_no, 1, v_occurred_at,
    p_actor_account_id, p_actor_membership_id, p_actor_role,
    p_action, p_state_domain, p_state_from, p_state_to,
    p_target_type, p_target_id, p_target_label,
    v_payload, v_payload_canonical, v_prev_hash, o_entry_hash
  );

  v_ord := 0;
  FOR v_elem IN
    SELECT e.value
      FROM pg_catalog.jsonb_array_elements(v_norm_targets)
           WITH ORDINALITY AS e(value, ord)
     ORDER BY e.ord
  LOOP
    v_ord := v_ord + 1;
    INSERT INTO public.audit_event_targets (
      id, event_id, centre_id, ordinal, target_type, target_id, target_label
    ) VALUES (
      pg_catalog.gen_random_uuid(), v_event_id, p_centre_id, v_ord,
      v_elem->>'target_type',
      CASE WHEN pg_catalog.jsonb_typeof(v_elem->'target_id') = 'null' THEN NULL
           ELSE (v_elem->>'target_id')::uuid END,
      v_elem->>'target_label'
    );
  END LOOP;

  UPDATE public.audit_chain_heads
     SET last_seq = v_seq_no, last_hash = o_entry_hash, updated_at = pg_catalog.now()
   WHERE centre_id = p_centre_id;

  -- ---- section 5.2 step 9: return -------------------------------------
  o_event_id := v_event_id;
END;
$fn$;

COMMENT ON FUNCTION public.audit_append_event(uuid, uuid, uuid, public.centre_membership_role, text, text, text, text, text, uuid, text, jsonb, jsonb) IS
  'Step 7H (design section 5): the only append authority. Validates centre, registry, payload and actor (re-proven, never trusted); seed-or-skips and row-locks the centre head; allocates the dense seq_no; builds the BESTCOACH-AUDIT-V1 length-prefixed envelope; computes sha256 in-database; writes event + ordered child targets + head atomically in the caller transaction. Accepts no prev_hash, entry_hash, seq_no or timestamp. EXECUTE: no client role -- reachable only through postgres-owned governed RPCs by ownership.';

-- ---------------------------------------------------------------------
-- 6/6 -- Verification (design section 6), privileges, assertions
-- ---------------------------------------------------------------------
-- Read-only (STABLE -- PostgreSQL itself rejects any mutation attempt in a
-- non-volatile function). Complete and bounded-partial modes per section
-- 6.1; the seven checks of section 6.2; never raises on integrity failure
-- (only on invocation errors); never repairs.
CREATE FUNCTION public.audit_verify_chain(
  p_centre_id uuid   DEFAULT NULL,
  p_from_seq  bigint DEFAULT NULL,
  p_to_seq    bigint DEFAULT NULL
)
RETURNS TABLE (
  centre_id        uuid,
  mode             text,
  ok               boolean,
  events_checked   bigint,
  first_failed_seq bigint,
  failed_check     text,
  anchor_seq       bigint,
  anchor_hash      text,
  head_checked     boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $fn$
DECLARE
  v_registry CONSTANT text[] := ARRAY[
    'report.created',
    'report_version.created',
    'report.state_changed',
    'attendance.changed',
    'admin.module_created',
    'admin.session_created',
    'admin.trainer_assigned',
    'admin.student_created',
    'admin.enrolment_changed',
    'admin.parent_link_changed',
    'admin.profile_created',
    'invitation.created',
    'invitation.revoked',
    'invitation.reissued',
    'membership.role_changed',
    'membership.bootstrap'
  ];
  v_field_names CONSTANT text[] := ARRAY[
    'canonical_version','centre_id','seq_no','prev_hash','occurred_at',
    'actor_account_id','actor_membership_id','actor_role','action',
    'state_domain','state_from','state_to','target_type','target_id',
    'target_label','payload_canonical'
  ];
  v_lf CONSTANT text := pg_catalog.chr(10);

  v_centre        uuid;
  v_mode          text;
  v_ok            boolean;
  v_checked       bigint;
  v_failed_seq    bigint;
  v_failed_check  text;
  v_anchor_seq    bigint;
  v_anchor_hash   text;
  v_head_checked  boolean;
  v_max_seq       bigint;
  v_from          bigint;
  v_to            bigint;
  v_expected_prev text;
  v_head_seq      bigint;
  v_head_hash     text;
  v_row           record;
  v_tip_hash      text;
  v_parsed        jsonb;
  v_child_agg     jsonb;
  v_child_count   bigint;
  v_child_min     integer;
  v_child_max     integer;
  v_field_values  text[];
  v_preimage      text;
  v_i             integer;
BEGIN
  -- Invocation validation (the only errors this function raises).
  IF p_from_seq IS NOT NULL AND p_from_seq < 1 THEN
    RAISE EXCEPTION 'audit_verify_chain: p_from_seq must be >= 1';
  END IF;
  IF p_to_seq IS NOT NULL AND p_to_seq < COALESCE(p_from_seq, 1) THEN
    RAISE EXCEPTION 'audit_verify_chain: p_to_seq must be >= p_from_seq';
  END IF;

  -- Section 6.1: a run with either range bound set is partial and can never
  -- claim complete-chain integrity.
  v_mode := CASE WHEN p_from_seq IS NULL AND p_to_seq IS NULL
                 THEN 'complete' ELSE 'partial' END;

  FOR v_centre IN
    SELECT u.centre_id
      FROM (SELECT e.centre_id FROM public.audit_events e
            UNION
            SELECT h.centre_id FROM public.audit_chain_heads h) AS u(centre_id)
     WHERE p_centre_id IS NULL OR u.centre_id = p_centre_id
     ORDER BY u.centre_id
  LOOP
    v_ok           := true;
    v_checked      := 0;
    v_failed_seq   := NULL;
    v_failed_check := NULL;
    v_anchor_seq   := NULL;
    v_anchor_hash  := NULL;
    v_head_checked := false;

    SELECT pg_catalog.max(e.seq_no) INTO v_max_seq
      FROM public.audit_events e WHERE e.centre_id = v_centre;
    v_from := COALESCE(p_from_seq, 1);
    v_to   := COALESCE(p_to_seq, v_max_seq);

    -- Predecessor anchor (section 6.1): its integrity is assumed, not
    -- proven; recorded so the assumption is explicit and auditable.
    IF v_ok AND v_mode = 'partial' AND v_from > 1 THEN
      SELECT e.seq_no, e.entry_hash INTO v_anchor_seq, v_anchor_hash
        FROM public.audit_events e
       WHERE e.centre_id = v_centre AND e.seq_no = v_from - 1;
      IF v_anchor_seq IS NULL THEN
        v_ok := false; v_failed_seq := v_from - 1; v_failed_check := 'anchor_missing';
      END IF;
    END IF;

    -- Row-by-row checks (sections 6.2-1 ... 6.2-4, 6.2-6, 6.2-7).
    -- The gate deliberately does NOT test v_max_seq: when an explicit upper
    -- bound is supplied for a chain with no events, the range must still be
    -- proven dense (it is not), rather than passing vacuously. v_to is NULL
    -- only when no bound was supplied and no event exists -- the empty-chain
    -- case, which the head check below adjudicates.
    IF v_ok AND v_to IS NOT NULL AND v_from <= v_to THEN
      v_expected_prev := NULL;
      FOR v_row IN
        SELECT e.*
          FROM public.audit_events e
         WHERE e.centre_id = v_centre
           AND e.seq_no BETWEEN v_from AND v_to
         ORDER BY e.seq_no
      LOOP
        v_checked := v_checked + 1;

        -- 6.2-1 sequence continuity (dense; uniqueness is constraint-backed).
        IF v_row.seq_no <> v_from + v_checked - 1 THEN
          v_ok := false; v_failed_seq := v_from + v_checked - 1;
          v_failed_check := 'sequence_continuity';
          EXIT;
        END IF;

        -- 6.2-2 previous-hash continuity (row 1: the section 3 genesis
        -- constant; from_seq > 1: the recorded anchor; later rows: the
        -- predecessor entry_hash).
        IF v_checked = 1 THEN
          IF v_row.seq_no = 1 THEN
            v_expected_prev := pg_catalog.encode(
              pg_catalog.sha256(pg_catalog.convert_to(
                'BESTCOACH-AUDIT-GENESIS-V1|' || v_centre::text, 'UTF8')), 'hex');
          ELSE
            v_expected_prev := v_anchor_hash;
          END IF;
        END IF;
        IF v_row.prev_hash IS DISTINCT FROM v_expected_prev THEN
          v_ok := false; v_failed_seq := v_row.seq_no;
          v_failed_check := 'prev_hash_continuity';
          EXIT;
        END IF;

        -- 6.2-6 part 1: payload/canonical agreement (parse-back equality).
        BEGIN
          v_parsed := v_row.payload_canonical::jsonb;
        EXCEPTION WHEN OTHERS THEN
          v_parsed := NULL;
        END;
        IF v_parsed IS NULL OR v_parsed <> v_row.payload THEN
          v_ok := false; v_failed_seq := v_row.seq_no;
          v_failed_check := 'payload_consistency';
          EXIT;
        END IF;
        -- Canonical payload reconstruction: the stored jsonb re-serialized
        -- by the section 4.4 rules must reproduce the stored canonical text.
        IF public.audit_canonical_json(v_row.payload) IS DISTINCT FROM v_row.payload_canonical THEN
          v_ok := false; v_failed_seq := v_row.seq_no;
          v_failed_check := 'payload_reconstruction';
          EXIT;
        END IF;

        -- 6.2-6 part 2: the payload related_targets array equals the
        -- ordered child rows (ruling R2: ordinal-dense projection).
        SELECT pg_catalog.count(*),
               pg_catalog.min(t.ordinal),
               pg_catalog.max(t.ordinal),
               COALESCE(pg_catalog.jsonb_agg(
                 pg_catalog.jsonb_build_object(
                   'target_type',  t.target_type,
                   'target_id',    CASE WHEN t.target_id IS NULL THEN NULL
                                        ELSE t.target_id::text END,
                   'target_label', t.target_label)
                 ORDER BY t.ordinal), '[]'::jsonb)
          INTO v_child_count, v_child_min, v_child_max, v_child_agg
          FROM public.audit_event_targets t
         WHERE t.event_id = v_row.id AND t.centre_id = v_row.centre_id;
        IF (v_child_count > 0 AND (v_child_min <> 1 OR v_child_max <> v_child_count))
           OR v_child_agg IS DISTINCT FROM (v_row.payload -> 'related_targets') THEN
          v_ok := false; v_failed_seq := v_row.seq_no;
          v_failed_check := 'related_targets_mismatch';
          EXIT;
        END IF;

        -- 6.2-7 registry conformance for canonical_version 1.
        IF v_row.canonical_version <> 1
           OR NOT (v_row.action = ANY (v_registry)) THEN
          v_ok := false; v_failed_seq := v_row.seq_no;
          v_failed_check := 'registry_conformance';
          EXIT;
        END IF;

        -- 6.2-3 / 6.2-4: envelope reconstruction from the stored columns
        -- and stored payload_canonical, then hash recomputation.
        v_field_values := ARRAY[
          v_row.canonical_version::text,
          v_row.centre_id::text,
          v_row.seq_no::text,
          v_row.prev_hash,
          pg_catalog.to_char(v_row.occurred_at AT TIME ZONE 'UTC',
                             'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
          v_row.actor_account_id::text,
          v_row.actor_membership_id::text,
          v_row.actor_role::text,
          v_row.action,
          v_row.state_domain,
          v_row.state_from,
          v_row.state_to,
          v_row.target_type,
          v_row.target_id::text,
          v_row.target_label,
          v_row.payload_canonical
        ];
        v_preimage := 'BESTCOACH-AUDIT-V1' || v_lf;
        FOR v_i IN 1..16 LOOP
          IF v_field_values[v_i] IS NULL THEN
            v_preimage := v_preimage || v_field_names[v_i] || ':N' || v_lf;
          ELSE
            v_preimage := v_preimage || v_field_names[v_i] || ':V:'
              || pg_catalog.octet_length(v_field_values[v_i])::text || ':'
              || v_field_values[v_i] || v_lf;
          END IF;
        END LOOP;
        IF pg_catalog.encode(
             pg_catalog.sha256(pg_catalog.convert_to(v_preimage, 'UTF8')), 'hex')
           <> v_row.entry_hash THEN
          v_ok := false; v_failed_seq := v_row.seq_no;
          v_failed_check := 'hash_mismatch';
          EXIT;
        END IF;

        v_expected_prev := v_row.entry_hash;
      END LOOP;

      -- Density across the requested range: every position must have a row.
      IF v_ok AND v_checked <> (v_to - v_from + 1) THEN
        v_ok := false; v_failed_seq := v_from + v_checked;
        v_failed_check := 'sequence_continuity';
      END IF;
    END IF;

    -- 6.2-5 stored-head agreement -- only when the range reaches the tip
    -- (to_seq = max(seq_no) or NULL); a below-tip range skips it and says
    -- so via head_checked = false (section 6.1). A committed head with
    -- last_seq = 0, an orphan head, or a headless chain is a failure.
    IF v_ok AND (v_mode = 'complete' OR p_to_seq IS NULL OR p_to_seq = v_max_seq) THEN
      v_head_checked := true;
      SELECT h.last_seq, h.last_hash INTO v_head_seq, v_head_hash
        FROM public.audit_chain_heads h WHERE h.centre_id = v_centre;
      IF v_max_seq IS NULL THEN
        -- No events: a head row (orphan) is a failure; absence is consistent.
        IF v_head_seq IS NOT NULL THEN
          v_ok := false; v_failed_check := 'head_agreement';
        END IF;
      ELSE
        IF v_head_seq IS NULL
           OR v_head_seq = 0
           OR v_head_seq <> v_max_seq THEN
          v_ok := false; v_failed_check := 'head_agreement';
        ELSE
          SELECT e.entry_hash INTO v_tip_hash
            FROM public.audit_events e
           WHERE e.centre_id = v_centre AND e.seq_no = v_max_seq;
          IF v_head_hash IS DISTINCT FROM v_tip_hash THEN
            v_ok := false; v_failed_check := 'head_agreement';
          END IF;
        END IF;
      END IF;
    END IF;

    centre_id        := v_centre;
    mode             := v_mode;
    ok               := v_ok;
    events_checked   := v_checked;
    first_failed_seq := v_failed_seq;
    failed_check     := v_failed_check;
    anchor_seq       := v_anchor_seq;
    anchor_hash      := v_anchor_hash;
    head_checked     := v_head_checked;
    RETURN NEXT;
  END LOOP;
END;
$fn$;

COMMENT ON FUNCTION public.audit_verify_chain(uuid, bigint, bigint) IS
  'Step 7H (design section 6): read-only chain verification. mode=complete (both bounds NULL) proves the whole chain from the genesis constant through the stored head; mode=partial proves only its range, records the assumed predecessor anchor (anchor_seq/anchor_hash), checks the stored head only when the range reaches the tip (head_checked), and can never claim complete-chain integrity. Never mutates, never repairs; integrity failures are reported rows, not exceptions. EXECUTE: no client role (operator-run).';

-- ---------------------------------------------------------------------
-- Function privileges (design section 5.5): NO client EXECUTE at all.
-- The Step 7E hardened default ACL already births these functions
-- owner-execute-only; the revokes make the posture explicit, with
-- authenticated now INCLUDED (unlike the 7G helpers, nothing is granted).
-- ---------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.audit_block_mutation()
  FROM PUBLIC, anon, authenticated, service_role, authenticator;
REVOKE ALL ON FUNCTION public.audit_canonical_json(jsonb)
  FROM PUBLIC, anon, authenticated, service_role, authenticator;
REVOKE ALL ON FUNCTION public.audit_append_event(uuid, uuid, uuid, public.centre_membership_role, text, text, text, text, text, uuid, text, jsonb, jsonb)
  FROM PUBLIC, anon, authenticated, service_role, authenticator;
REVOKE ALL ON FUNCTION public.audit_verify_chain(uuid, bigint, bigint)
  FROM PUBLIC, anon, authenticated, service_role, authenticator;

-- ---------------------------------------------------------------------
-- End-of-migration assertions (design T-1 static half; 7G A-series style).
-- Fail closed: any deviation aborts the whole migration transaction.
-- ---------------------------------------------------------------------
DO $assert$
DECLARE
  v_n        bigint;
  v_n2       bigint;
  v_names    text[];
  v_expected text[];
  v_rec      record;
  v_reg_a    text;
  v_reg_v    text;
BEGIN
  -- B1: the execution role is still postgres (T-1).
  IF current_user <> 'postgres' THEN
    RAISE EXCEPTION 'Step 7H assertion B1 failed: current_user is "%", expected postgres', current_user;
  END IF;

  -- B2: exactly the three intended audit tables exist, and the public
  -- schema holds exactly 25 ordinary tables (22 prior + 3 audit).
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r'
     AND c.relname IN ('audit_events', 'audit_event_targets', 'audit_chain_heads');
  IF v_n <> 3 THEN
    RAISE EXCEPTION 'Step 7H assertion B2 failed: expected 3 audit tables, found %', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r';
  IF v_n <> 25 THEN
    RAISE EXCEPTION 'Step 7H assertion B2 failed: expected 25 public tables, found %', v_n;
  END IF;

  -- B3: all 22 pre-existing tables remain present by name.
  SELECT pg_catalog.array_agg(t.expected ORDER BY t.expected) INTO v_names
    FROM (VALUES
      ('centres'),('accounts'),('centre_memberships'),('trainer_profiles'),
      ('parent_profiles'),('students'),('parent_student_links'),('class_grades'),
      ('class_modules'),('class_sessions'),('enrolments'),('class_session_assignments'),
      ('attendance'),('invitations'),('assessment_dimensions'),('observations'),
      ('observation_ratings'),('reports'),('report_versions'),('report_version_ratings'),
      ('report_version_checklist_progress'),('report_version_approvals')
    ) AS t(expected)
   WHERE NOT EXISTS (
     SELECT 1 FROM pg_catalog.pg_class c
       JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname = t.expected);
  IF v_names IS NOT NULL THEN
    RAISE EXCEPTION 'Step 7H assertion B3 failed: pre-existing tables missing: %', v_names;
  END IF;

  -- B4: RLS enabled on all 25 public tables; FORCE RLS on none.
  SELECT pg_catalog.count(*) FILTER (WHERE NOT c.relrowsecurity),
         pg_catalog.count(*) FILTER (WHERE c.relforcerowsecurity)
    INTO v_n, v_n2
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r';
  IF v_n <> 0 OR v_n2 <> 0 THEN
    RAISE EXCEPTION 'Step 7H assertion B4 failed: % tables without RLS, % tables with FORCE RLS (expected 0 and 0)', v_n, v_n2;
  END IF;

  -- B5: zero policies on the three audit tables; 29 policies overall with
  -- the accepted Step 7G per-table distribution, all permissive SELECT to
  -- authenticated.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_policies p
   WHERE p.schemaname = 'public'
     AND p.tablename IN ('audit_events', 'audit_event_targets', 'audit_chain_heads');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7H assertion B5 failed: expected 0 policies on audit tables, found %', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_policies p
   WHERE p.schemaname = 'public';
  IF v_n <> 29 THEN
    RAISE EXCEPTION 'Step 7H assertion B5 failed: expected 29 policies in public, found %', v_n;
  END IF;
  FOR v_rec IN
    SELECT t.tablename, t.expected, COALESCE(p.actual, 0) AS actual
      FROM (VALUES
        ('centres', 1), ('accounts', 2), ('centre_memberships', 2),
        ('trainer_profiles', 2), ('parent_profiles', 2), ('students', 3),
        ('parent_student_links', 2), ('class_grades', 1), ('class_modules', 3),
        ('class_sessions', 3), ('enrolments', 3), ('class_session_assignments', 2),
        ('attendance', 3)
      ) AS t(tablename, expected)
      LEFT JOIN (
        SELECT p.tablename, pg_catalog.count(*) AS actual
          FROM pg_catalog.pg_policies p
         WHERE p.schemaname = 'public'
         GROUP BY p.tablename
      ) AS p ON p.tablename = t.tablename
  LOOP
    IF v_rec.actual <> v_rec.expected THEN
      RAISE EXCEPTION 'Step 7H assertion B5 failed: table % has % policies, expected %', v_rec.tablename, v_rec.actual, v_rec.expected;
    END IF;
  END LOOP;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_policies p
   WHERE p.schemaname = 'public'
     AND NOT (p.permissive = 'PERMISSIVE' AND p.cmd = 'SELECT' AND p.roles = '{authenticated}');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7H assertion B5 failed: % policies are not permissive SELECT to authenticated', v_n;
  END IF;

  -- B6: zero client privileges of any kind on the three audit tables
  -- (anon, authenticated, service_role x 7 privileges).
  SELECT pg_catalog.count(*) INTO v_n
    FROM (VALUES ('audit_events'), ('audit_event_targets'), ('audit_chain_heads')) AS t(tbl)
   CROSS JOIN (VALUES ('anon'), ('authenticated'), ('service_role')) AS r(rolename)
   CROSS JOIN (VALUES ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE'),
                      ('TRUNCATE'), ('REFERENCES'), ('TRIGGER')) AS p(priv)
   WHERE pg_catalog.has_table_privilege(r.rolename, ('public.' || t.tbl)::regclass, p.priv);
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7H assertion B6 failed: % client privilege grants exist on audit tables (expected 0)', v_n;
  END IF;

  -- B7: no PUBLIC or authenticator entry in any audit-table ACL (direct
  -- relacl evidence -- authenticator memberships are NOINHERIT, so the ACL
  -- text is the honest check; 7G A4/A5 technique).
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public'
     AND c.relname IN ('audit_events', 'audit_event_targets', 'audit_chain_heads')
     AND c.relacl IS NOT NULL
     AND (c.relacl::text LIKE '{=%' OR c.relacl::text LIKE '%,=%'
          OR c.relacl::text LIKE '%authenticator=%');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7H assertion B7 failed: PUBLIC or authenticator appears in an audit-table ACL';
  END IF;
  -- Column-level ACLs are invisible to has_table_privilege and to relacl:
  -- a single GRANT SELECT (payload) would leak evidence while every other
  -- privilege check still passed. No audit column may carry an ACL at all.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_attribute a
    JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public'
     AND c.relname IN ('audit_events', 'audit_event_targets', 'audit_chain_heads')
     AND a.attnum > 0
     AND a.attacl IS NOT NULL;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7H assertion B7 failed: % audit column(s) carry a column-level ACL (expected 0)', v_n;
  END IF;

  -- B8: anon and service_role hold zero table privileges across ALL 25
  -- public tables (service_role is constrained only by absence of
  -- privilege -- BYPASSRLS, D-254).
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   CROSS JOIN (VALUES ('anon'), ('service_role')) AS r(rolename)
   CROSS JOIN (VALUES ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE'),
                      ('TRUNCATE'), ('REFERENCES'), ('TRIGGER')) AS p(priv)
   WHERE n.nspname = 'public' AND c.relkind = 'r'
     AND pg_catalog.has_table_privilege(r.rolename, c.oid, p.priv);
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7H assertion B8 failed: anon/service_role hold % table privileges (expected 0)', v_n;
  END IF;

  -- B9: authenticated still holds SELECT on exactly the 13 in-scope
  -- relationship tables and no other privilege anywhere (the 9 report/
  -- assessment/invitation tables and the 3 audit tables at zero).
  -- relname is `name`; aggregate it as text so the comparison against the
  -- expected text[] needs no implicit array coercion. ORDER BY stays on the
  -- raw name column, whose byte ordering the expected array is built in.
  SELECT pg_catalog.array_agg(c.relname::text ORDER BY c.relname) INTO v_names
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind = 'r'
     AND pg_catalog.has_table_privilege('authenticated', c.oid, 'SELECT');
  v_expected := ARRAY['accounts','attendance','centre_memberships','centres',
                      'class_grades','class_modules','class_session_assignments',
                      'class_sessions','enrolments','parent_profiles',
                      'parent_student_links','students','trainer_profiles'];
  IF v_names IS DISTINCT FROM v_expected THEN
    RAISE EXCEPTION 'Step 7H assertion B9 failed: authenticated SELECT set is %, expected the 13-table Step 7G set', v_names;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   CROSS JOIN (VALUES ('INSERT'), ('UPDATE'), ('DELETE'),
                      ('TRUNCATE'), ('REFERENCES'), ('TRIGGER')) AS p(priv)
   WHERE n.nspname = 'public' AND c.relkind = 'r'
     AND pg_catalog.has_table_privilege('authenticated', c.oid, p.priv);
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7H assertion B9 failed: authenticated holds % non-SELECT table privileges (expected 0)', v_n;
  END IF;

  -- B10: the public schema holds exactly the 10 expected functions -- the
  -- six Step 7G helpers, the three audit API functions, and the one
  -- documented trigger support function.
  SELECT pg_catalog.array_agg(p.proname::text ORDER BY p.proname) INTO v_names
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public';
  v_expected := ARRAY['app_current_account_id','app_has_active_membership',
                      'app_is_own_active_membership','app_is_own_membership',
                      'app_trainer_reaches_module','app_trainer_reaches_session',
                      'audit_append_event','audit_block_mutation',
                      'audit_canonical_json','audit_verify_chain'];
  IF v_names IS DISTINCT FROM v_expected THEN
    RAISE EXCEPTION 'Step 7H assertion B10 failed: public function census is %, expected the 10-function set', v_names;
  END IF;

  -- B11: ownership -- all three audit tables and all four new functions
  -- are owned by postgres.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public'
     AND c.relname IN ('audit_events', 'audit_event_targets', 'audit_chain_heads')
     AND pg_catalog.pg_get_userbyid(c.relowner) <> 'postgres';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7H assertion B11 failed: an audit table is not owned by postgres';
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname IN ('audit_append_event', 'audit_canonical_json',
                       'audit_verify_chain', 'audit_block_mutation')
     AND pg_catalog.pg_get_userbyid(p.proowner) <> 'postgres';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7H assertion B11 failed: a new audit function is not owned by postgres';
  END IF;

  -- B12: volatility, security posture and pinned search_path match the
  -- ratified contract exactly (append VOLATILE+DEFINER; verify
  -- STABLE+DEFINER; serializer IMMUTABLE+INVOKER; trigger helper
  -- VOLATILE+INVOKER; all four search-path pinned). The six 7G helpers
  -- remain STABLE+DEFINER+pinned.
  FOR v_rec IN
    SELECT p.proname, p.provolatile, p.prosecdef,
           COALESCE(pg_catalog.array_to_string(p.proconfig, ','), '') AS config
      FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.proname IN ('audit_append_event', 'audit_canonical_json',
                         'audit_verify_chain', 'audit_block_mutation')
  LOOP
    IF (v_rec.proname = 'audit_append_event'   AND NOT (v_rec.provolatile = 'v' AND v_rec.prosecdef))
    OR (v_rec.proname = 'audit_verify_chain'   AND NOT (v_rec.provolatile = 's' AND v_rec.prosecdef))
    OR (v_rec.proname = 'audit_canonical_json' AND NOT (v_rec.provolatile = 'i' AND NOT v_rec.prosecdef))
    OR (v_rec.proname = 'audit_block_mutation' AND NOT (v_rec.provolatile = 'v' AND NOT v_rec.prosecdef))
    THEN
      RAISE EXCEPTION 'Step 7H assertion B12 failed: % has volatility "%" secdef "%" -- contract mismatch', v_rec.proname, v_rec.provolatile, v_rec.prosecdef;
    END IF;
    IF v_rec.config NOT LIKE '%search_path=%' THEN
      RAISE EXCEPTION 'Step 7H assertion B12 failed: % has no pinned search_path', v_rec.proname;
    END IF;
  END LOOP;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname LIKE 'app\_%'
     AND NOT (p.provolatile = 's' AND p.prosecdef
              AND COALESCE(pg_catalog.array_to_string(p.proconfig, ','), '') LIKE '%search_path=%');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7H assertion B12 failed: % Step 7G helpers no longer STABLE SECURITY DEFINER search-path-pinned', v_n;
  END IF;

  -- B13: no client role can execute any of the four new functions; no
  -- PUBLIC entry in their ACLs. The six 7G helper ACLs are preserved:
  -- EXECUTE for authenticated only.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   CROSS JOIN (VALUES ('anon'), ('authenticated'), ('service_role'), ('authenticator')) AS r(rolename)
   WHERE n.nspname = 'public'
     AND p.proname IN ('audit_append_event', 'audit_canonical_json',
                       'audit_verify_chain', 'audit_block_mutation')
     AND pg_catalog.has_function_privilege(r.rolename, p.oid, 'EXECUTE');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7H assertion B13 failed: a client role can EXECUTE an audit function (% grants found, expected 0)', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname IN ('audit_append_event', 'audit_canonical_json',
                       'audit_verify_chain', 'audit_block_mutation')
     AND p.proacl IS NOT NULL
     AND (p.proacl::text LIKE '{=%' OR p.proacl::text LIKE '%,=%');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7H assertion B13 failed: PUBLIC appears in an audit-function ACL';
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.proname LIKE 'app\_%'
     AND NOT (    pg_catalog.has_function_privilege('authenticated', p.oid, 'EXECUTE')
          AND NOT pg_catalog.has_function_privilege('anon',          p.oid, 'EXECUTE')
          AND NOT pg_catalog.has_function_privilege('service_role',  p.oid, 'EXECUTE')
          AND NOT pg_catalog.has_function_privilege('authenticator', p.oid, 'EXECUTE'));
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7H assertion B13 failed: % Step 7G helper ACLs deviate from authenticated-only EXECUTE', v_n;
  END IF;

  -- B14: the ratified constraint set exists exactly on the three audit
  -- tables (PK/UNIQUE/FK/CHECK by name; PostgreSQL-17 catalogued NOT NULL
  -- constraints excluded by contype).
  FOR v_rec IN
    SELECT t.tbl, t.expected,
           (SELECT pg_catalog.array_agg(con.conname::text ORDER BY con.conname)
              FROM pg_catalog.pg_constraint con
             WHERE con.conrelid = ('public.' || t.tbl)::regclass
               AND con.contype IN ('p', 'u', 'f', 'c')) AS actual
      FROM (VALUES
        ('audit_events', ARRAY['audit_events_action_chk','audit_events_actor_account_fk',
           'audit_events_actor_membership_fk','audit_events_actor_triple_chk',
           'audit_events_canonical_version_chk','audit_events_centre_fk',
           'audit_events_centre_seq_key','audit_events_entry_hash_chk',
           'audit_events_entry_hash_key','audit_events_id_centre_key',
           'audit_events_pkey','audit_events_prev_hash_chk',
           'audit_events_seq_no_chk','audit_events_target_type_chk']),
        ('audit_event_targets', ARRAY['audit_event_targets_event_fk',
           'audit_event_targets_event_ordinal_key','audit_event_targets_ordinal_chk',
           'audit_event_targets_pkey','audit_event_targets_target_type_chk']),
        ('audit_chain_heads', ARRAY['audit_chain_heads_centre_fk',
           'audit_chain_heads_last_hash_chk','audit_chain_heads_last_seq_chk',
           'audit_chain_heads_pkey'])
      ) AS t(tbl, expected)
  LOOP
    IF v_rec.actual IS DISTINCT FROM v_rec.expected THEN
      RAISE EXCEPTION 'Step 7H assertion B14 failed: % constraints are %, expected %', v_rec.tbl, v_rec.actual, v_rec.expected;
    END IF;
  END LOOP;

  -- B15: exactly three user triggers, correctly scoped, enabled, and all
  -- bound to audit_block_mutation. tgtype 26 = BEFORE + STATEMENT +
  -- UPDATE + DELETE (2|16|8); tgtype 10 = BEFORE + STATEMENT + DELETE (2|8).
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_trigger t
    JOIN pg_catalog.pg_class c ON c.oid = t.tgrelid
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND NOT t.tgisinternal;
  IF v_n <> 3 THEN
    RAISE EXCEPTION 'Step 7H assertion B15 failed: expected exactly 3 user triggers in public, found %', v_n;
  END IF;
  FOR v_rec IN
    SELECT t.expected_trigger, t.expected_table, t.expected_type,
           tr.tgname, tr.tgtype, tr.tgenabled,
           p.proname AS trigger_function
      FROM (VALUES
        ('audit_events_block_update_delete_trg',        'audit_events',        26),
        ('audit_event_targets_block_update_delete_trg', 'audit_event_targets', 26),
        ('audit_chain_heads_block_delete_trg',          'audit_chain_heads',   10)
      ) AS t(expected_trigger, expected_table, expected_type)
      LEFT JOIN pg_catalog.pg_trigger tr
        ON tr.tgname = t.expected_trigger
       AND tr.tgrelid = ('public.' || t.expected_table)::regclass
      LEFT JOIN pg_catalog.pg_proc p ON p.oid = tr.tgfoid
  LOOP
    IF v_rec.tgname IS NULL
       OR v_rec.tgtype <> v_rec.expected_type
       OR v_rec.tgenabled <> 'O'
       OR v_rec.trigger_function <> 'audit_block_mutation' THEN
      RAISE EXCEPTION 'Step 7H assertion B15 failed: trigger % on % is missing or mis-scoped (tgtype %, expected %)',
        v_rec.expected_trigger, v_rec.expected_table, v_rec.tgtype, v_rec.expected_type;
    END IF;
  END LOOP;

  -- B16: the FK-support indexes exist; no view or materialized view exists
  -- in public; no audit-named schema was introduced.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_indexes i
   WHERE i.schemaname = 'public'
     AND i.indexname IN ('audit_events_actor_account_idx',
                         'audit_events_actor_membership_idx',
                         'audit_event_targets_centre_idx');
  IF v_n <> 3 THEN
    RAISE EXCEPTION 'Step 7H assertion B16 failed: expected the 3 FK-support indexes, found %', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
   WHERE n.nspname = 'public' AND c.relkind IN ('v', 'm');
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7H assertion B16 failed: % view(s)/materialized view(s) exist in public (expected 0)', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_namespace n
   WHERE n.nspname LIKE 'audit%';
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7H assertion B16 failed: an audit-named schema exists (expected none)';
  END IF;

  -- B17: the P-1 default-ACL posture is byte-unchanged (7G A14 technique):
  -- postgres defaults in public remain owner-only for tables, sequences
  -- and functions; exactly 3 postgres rows; the 3 supabase_admin rows
  -- still carry their broad (never-applying) client grants -- unaltered.
  -- Plus: no client role holds CREATE on schema public.
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_default_acl d
    JOIN pg_catalog.pg_namespace n ON n.oid = d.defaclnamespace
   WHERE pg_catalog.pg_get_userbyid(d.defaclrole) = 'postgres'
     AND n.nspname = 'public'
     AND (   (d.defaclobjtype = 'r' AND d.defaclacl::text = '{postgres=arwdDxtm/postgres}')
          OR (d.defaclobjtype = 'S' AND d.defaclacl::text = '{postgres=rwU/postgres}')
          OR (d.defaclobjtype = 'f' AND d.defaclacl::text = '{postgres=X/postgres}'));
  IF v_n <> 3 THEN
    RAISE EXCEPTION 'Step 7H assertion B17 failed: postgres default ACLs in public deviate from the hardened posture (% of 3 rows match)', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_default_acl d
    JOIN pg_catalog.pg_namespace n ON n.oid = d.defaclnamespace
   WHERE pg_catalog.pg_get_userbyid(d.defaclrole) = 'postgres'
     AND n.nspname = 'public';
  IF v_n <> 3 THEN
    RAISE EXCEPTION 'Step 7H assertion B17 failed: expected exactly 3 postgres default-ACL rows in public, found %', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n
    FROM pg_catalog.pg_default_acl d
    JOIN pg_catalog.pg_namespace n ON n.oid = d.defaclnamespace
   WHERE pg_catalog.pg_get_userbyid(d.defaclrole) = 'supabase_admin'
     AND n.nspname = 'public'
     AND d.defaclacl::text LIKE '%anon=%'
     AND d.defaclacl::text LIKE '%authenticated=%'
     AND d.defaclacl::text LIKE '%service_role=%';
  IF v_n <> 3 THEN
    RAISE EXCEPTION 'Step 7H assertion B17 failed: the 3 supabase_admin default-ACL rows are altered (% match)', v_n;
  END IF;
  IF pg_catalog.has_schema_privilege('anon', 'public', 'CREATE')
     OR pg_catalog.has_schema_privilege('authenticated', 'public', 'CREATE')
     OR pg_catalog.has_schema_privilege('service_role', 'public', 'CREATE') THEN
    RAISE EXCEPTION 'Step 7H assertion B17 failed: a client role holds CREATE on schema public';
  END IF;

  -- B18: the two prior project migrations are recorded, so exactly three
  -- exist once the runner records this one.
  SELECT pg_catalog.count(*) INTO v_n
    FROM supabase_migrations.schema_migrations m
   WHERE m.version IN ('20260803034500', '20260803154500');
  IF v_n <> 2 THEN
    RAISE EXCEPTION 'Step 7H assertion B18 failed: expected the 2 prior migration records, found %', v_n;
  END IF;

  -- B19: the Step 7E deterministic seed is untouched (valid on both a clean
  -- reset and the preserved fixture volume), and this migration appended
  -- nothing: all three audit tables are empty.
  SELECT pg_catalog.count(*) INTO v_n FROM public.centres c WHERE c.code = 'ispeak';
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Step 7H assertion B19 failed: expected exactly 1 seeded centre (ispeak), found %', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.centres;
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'Step 7H assertion B19 failed: expected exactly 1 centre row, found %', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.class_grades;
  IF v_n <> 3 THEN
    RAISE EXCEPTION 'Step 7H assertion B19 failed: expected 3 class_grades seed rows, found %', v_n;
  END IF;
  SELECT pg_catalog.count(*) INTO v_n FROM public.assessment_dimensions;
  IF v_n <> 9 THEN
    RAISE EXCEPTION 'Step 7H assertion B19 failed: expected 9 assessment_dimensions seed rows, found %', v_n;
  END IF;
  SELECT (SELECT pg_catalog.count(*) FROM public.audit_events)
       + (SELECT pg_catalog.count(*) FROM public.audit_event_targets)
       + (SELECT pg_catalog.count(*) FROM public.audit_chain_heads)
    INTO v_n;
  IF v_n <> 0 THEN
    RAISE EXCEPTION 'Step 7H assertion B19 failed: audit tables are not empty (% rows) -- the migration must append nothing', v_n;
  END IF;

  -- B20: the action registry is stated twice -- once in the append entry
  -- point, once in the verifier -- because A-026 ratifies it as
  -- function-enforced text rather than an enum or a lookup table. Nothing
  -- structural keeps the two copies equal, so prove it here from pg_proc
  -- (no new database object is introduced). Fail closed: if either
  -- extraction returns NULL, the declaration was reformatted and this
  -- assertion can no longer see it -- that aborts the migration rather
  -- than passing silently.
  SELECT pg_catalog.substring(p.prosrc, 'v_registry CONSTANT text\[\] := ARRAY\[(.*?)\];')
    INTO v_reg_a
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'audit_append_event';
  SELECT pg_catalog.substring(p.prosrc, 'v_registry CONSTANT text\[\] := ARRAY\[(.*?)\];')
    INTO v_reg_v
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'audit_verify_chain';
  IF v_reg_a IS NULL OR v_reg_v IS NULL THEN
    RAISE EXCEPTION 'Step 7H assertion B20 failed: the action registry could not be extracted from % -- the declaration was reformatted and can no longer be proven equal',
      CASE WHEN v_reg_a IS NULL AND v_reg_v IS NULL THEN 'either function'
           WHEN v_reg_a IS NULL THEN 'audit_append_event'
           ELSE 'audit_verify_chain' END;
  END IF;
  IF v_reg_a <> v_reg_v THEN
    RAISE EXCEPTION 'Step 7H assertion B20 failed: the append and verify action registries have diverged -- an action accepted by one would be rejected by the other';
  END IF;
  -- The registry must also contain the reserved system-origin action, which
  -- is the only member the append function permits without an actor triple.
  IF pg_catalog.strpos(v_reg_a, '''membership.bootstrap''') = 0 THEN
    RAISE EXCEPTION 'Step 7H assertion B20 failed: the reserved system-origin action membership.bootstrap is missing from the registry';
  END IF;

  RAISE NOTICE 'Step 7H assertions B1-B20 passed: 3 audit tables (RLS on, zero policies, zero client privileges), 4 postgres-owned functions (no client EXECUTE), 3 append-only guard triggers, Step 7G posture preserved, default ACLs unchanged, seed intact, chain empty.';
END;
$assert$;
