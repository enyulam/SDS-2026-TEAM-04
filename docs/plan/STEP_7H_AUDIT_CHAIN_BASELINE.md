# Step 7H — Audit-Chain Design Baseline (A-1 … A-6)

**Provenance.** Authored at Step 7H1A (2026-08-04) against repository HEAD `6ba61596b524df77ca5366c19b4521f3041f0072` (24 commits). Governing authority, highest first: Specification v3 → Amendment 001 → Amendment 002 → Amendment 003 → `CLAUDE.md` → Implementation Plan. This document resolves the six deferred audit design items **A-1 … A-6** (Amendment 003 A-029 "Explicitly NOT ratified"; Amendment 002 U-13/U-14/U-15) for the Step 7H implementation checkpoints. It is a design contract only: **no SQL, migration, function, trigger, policy, grant or runtime change is made by this document.**

**Governing requirements this design binds itself to (verbatim anchors):**

- v3 §23: the audit log is append-only (application role `INSERT` only, `UPDATE`/`DELETE` revoked at the database); hash-chained (`entry_hash = hash(prev_hash + canonical_payload)`); approval events capture the approved version's `content_hash`; the audit write commits **in the same transaction** as its state transition (§18 rule 4). The **independent retention-locked mirror is Phase 4** (Amendment 001 A-007), not Step 7H.
- Amendment 001 A-010: mutation-denial must be proven **as a restricted role / `SET ROLE`**, never only as a privileged identity.
- Amendment 003 A-029 (already ratified, schema-forward): stable account **and** membership attribution; durable actor FKs (`RESTRICT`); **polymorphic target with an immutable minimal label snapshot and no FK**; **one event per governed action plus related-target child rows in a dedicated child table with exactly one primary target**; generic `state_domain` / `state_from` / `state_to`; **append-only correction-by-new-event with no redaction**; data minimization; **no management, trainer or parent audit-read capability in the MVP** (the rows are still written).
- Amendment 003 A-026: the audit vocabulary is **deliberately not an enum** — its values were unratified, and a placeholder enum is prohibited. This baseline ratifies the event registry as **function-enforced text** (§1.4, enforced at §5.2 step 2), which honours A-026 without inventing an enum.
- CLAUDE.md ADR-8 / §101 / §205 / §244: every report-state transition is a guarded compare-and-set inside one transaction **with its audit write in the same transaction**; "Approve & Submit" performs two transitions and therefore two audit events in one server action.
- Step 7E boundary (A-031/A-032): **no PostgreSQL extension**. PostgreSQL 17's built-in `sha256(bytea)` (core since v11) satisfies the hashing requirement without one.
- Step 7G accepted posture: deny-by-default; `service_role` is constrained **only** by holding zero privileges (BYPASSRLS); migrations run as `postgres` under a fail-closed guard (P-1, D-253).

---

## 1. A-1 — Chain scope and threat model (RATIFIED)

### 1.1 What the chain protects

The chain makes the **governed business history of a centre tamper-evident**: report lifecycle transitions and their approval provenance (`content_hash` of the approved version), governed attendance corrections, and governed administrative writes — together with **who acted (account + membership + role), on what (polymorphic target + label snapshot), and in what order (dense per-centre sequence)**. Any silent alteration, deletion or insertion of a committed event breaks either the sequence, the hash linkage, or the stored head, and is mechanically detectable by §6.

### 1.2 What it does not protect — the threat model, plainly

An in-database hash chain detects **accidental corruption, application-layer tampering, and alteration by any principal below database superuser** (no client role holds any privilege on the audit objects — §5.5). It **cannot independently prove integrity against a database superuser** (or platform operator, or someone with volume access) **who rewrites the complete chain and all anchors consistently**, because such an actor can recompute every hash. The defence against that actor is an **external anchor**: the independent, retention-locked audit mirror of v3 §23.

**External anchoring ruling:** **deferred to Phase 4 — scheduled, not out of scope.** Amendment 001 A-007 assigns the external mirror to Phase 4 explicitly; Step 7H must not claim the complete external audit architecture is finished, and must not build a partial anchor of its own invention. Also outside the model: OS/volume attackers, Supabase platform compromise, and wall-clock accuracy (timestamps come from the database clock; **ordering authority is the sequence number, never the timestamp**).

### 1.3 Chain partition

**One chain per centre** (partition key `centre_id`). Ruled against the alternatives:

- *Global chain*: entangles a future second centre's history with the first (cross-tenant coupling in verification, export and incident response), contradicting ADR-7's centre isolation and the additive multi-centre posture.
- *Per-aggregate (per-report) chain*: fragments accountability — cross-report ordering inside a centre (e.g. "approved A, then reopened B") would be unprovable, and verification cost multiplies per aggregate.

Every governed event in this MVP is centre-anchored (all 22 business tables carry or resolve a `centre_id`), so per-centre partitioning is total. A future second centre receives an **independent chain with its own genesis** (§3) and appears nowhere in the first centre's verification.

### 1.4 Governed event registry — the ratified minimum

Evaluated against the sources; included only where a source requires auditability. **Emission of every event belongs to the checkpoint that owns its RPC (§8); Step 7H builds only the infrastructure.**

| # | Event (`action`) | Source requiring it | In MVP scope? |
|---|---|---|---|
| E1 | `report.created` | §13 lifecycle; A-028 aggregate model | **Yes** (7I) |
| E2 | `report_version.created` | §13 versions; approval references an exact version | **Yes** (7I) |
| E3 | `report.state_changed` — one event per §13 transition, using `state_domain='report'`, `state_from`, `state_to`; the approval transition's payload **must** carry the approved version id, its `content_hash`, and the checklist-gate proof; "Approve & Submit" = two of these events in one transaction | v3 §23 approval provenance; CLAUDE.md §205/§244 | **Yes** (7I) |
| E4 | `attendance.changed` | A-018 "Attendance changes must be auditable" (the governed toggle/correction — not the routine default-Present roster initialization) | **Yes** (Phase 1 trainer-flow checkpoint) |
| E5 | `admin.module_created` · `admin.session_created` · `admin.trainer_assigned` · `admin.student_created` · `admin.enrolment_changed` · `admin.parent_link_changed` · `admin.profile_created` | A-019 "Every management write must be … auditable" | **Yes** (Phase 1 management-flow checkpoints) |
| E6 | `invitation.created` · `invitation.revoked` · `invitation.reissued` | A-019 + A-027 lifecycle | **Yes** (Phase 1 invitation checkpoint) |
| E7 | `membership.bootstrap` | N-4 — unresolved | **Name reserved only**; design deferred with N-4 |
| E8 | `membership.role_changed` / authorization changes | A-019 management administration | **Yes** (Phase 1 management checkpoint) |
| E9 | Observation-to-report derivation | §12/§24 AI pipeline | **Folded into E2/E3 payloads** — the version row and transition events carry the derivation identifiers; no separate event (data minimization) |
| E10 | Checklist item completion (per-toggle) | — no source requires per-toggle audit; the approval event (E3) must prove the gate passed for the exact version | **Excluded** |
| E11 | Authentication events (sign-in/out, token refresh) | — none; GoTrue owns `auth.*` and its own logging | **Excluded** |
| E12 | Fixture activity | — the Step 7F loader is a local dev tool writing over the owner connection, never through governed RPCs | **Excluded by construction** |
| E13 | Routine reads, navigation, UI visibility | — data minimization (A-029) | **Excluded** |

The registry is enforced by the append entry point (§5.2 step 2): an unregistered `action` is rejected, and each registry entry carries two design attributes — its **duplicate gate** (§5.3) and its **system-actor flag** (§5.4). Extending the registry is a plain, reviewable code change to that function — additive, no enum migration (A-026 honoured).

### 1.5 Who may inspect audit data

**No management, trainer or parent audit-read capability exists in the MVP** (A-029 — a scope decision; the rows are still written). Audit rows are **not client-readable**: no client role receives any privilege on any audit object (§5.5). Inspection in the MVP is operator-level only — the local/DB operator running the §6 verification entry point over an owner connection. Post-MVP read surfaces remain N-5.

---

## 2. A-2 — Hash algorithm and execution location (RATIFIED)

- **Algorithm: SHA-256.** v3 §23 names no algorithm; SHA-256 is ratified here. It is the project's already-accepted integrity primitive (report `content_hash`, the fixture canonical checksum, every governance hash in the tracker), collision-resistant for this purpose, and available **in core PostgreSQL 17** as `sha256(bytea)` — so the Step 7E "no extension" boundary is preserved. **No pgcrypto, no extension.**
- **Execution location: inside PostgreSQL, inside the append entry point** (`SECURITY DEFINER`, owner `postgres` — §5). Trusted server code never computes or supplies a hash; clients never see a preimage before commit.
- **Transactional placement:** the append function is invoked **by the governed mutation's own RPC, inside the same database transaction** (v3 §18 rule 4, CLAUDE.md §101). There is **no split transaction, no queue, no deferred write**: if the business mutation rolls back, the event and head update roll back with it; if the append fails, the business mutation fails with it.

**How the design prevents each prohibited failure:**

| Hazard | Prevention |
|---|---|
| Application inserts an arbitrary hash | `entry_hash` and `prev_hash` are computed **inside** the append function from the locked head and the canonical envelope; the function accepts neither as a parameter. No role other than the owner can `INSERT` into `audit_events` at all. |
| Client selects its own previous hash | `prev_hash` is read from `audit_chain_heads` under `FOR UPDATE` inside the function; there is no parameter for it and no client privilege on the head table. |
| Business mutation commits without its audit entry | The 7I/Phase-1 RPC template calls `audit_append_event(...)` in the same transaction **before** returning; the append function raising aborts the whole transaction. Acceptance test T-10 proves it. |
| Audit entry commits without the mutation | Same single transaction — rollback removes both (T-10); the append function is not executable by any client role, so it cannot be invoked outside a governed RPC. |

---

## 3. A-3 — Genesis and chain-partition rule (RATIFIED)

- **Partition key:** `centre_id` (§1.3). One chain per centre; a future second centre is isolated by key — its events, head and genesis never intersect the first centre's verification.
- **Sequence:** `seq_no bigint`, starting at **1**, dense (no gaps), allocated under the head row lock (§5.2). **Ordering authority is `(centre_id, seq_no)` — never timestamps.**
- **Head-seeding rule (empty chain):** a centre with no governed events has **no committed `audit_chain_heads` row and no event rows** — "chain exists" remains equivalent to "at least one event exists". The head row is **seeded inside the first append's transaction** with `last_seq = 0` and `last_hash =` the genesis constant below, then locked, then updated to `(1, entry_hash)` in the same transaction — so a committed head row with `last_seq = 0` is impossible (verification treats one as a failure), and **`prev_hash` for every append is read uniformly from the locked head** with no special genesis branch at read time. The exact race-safe protocol and its two-writer proof are §5.2.
- **Genesis previous-hash rule:** the first event of a centre's chain (`seq_no = 1`) carries
  `prev_hash = sha256( 'BESTCOACH-AUDIT-GENESIS-V1|' || lowercase-canonical-uuid(centre_id) )` rendered as 64 lowercase hex characters — the same value the seeded head row carries at `last_seq = 0`.
  Ruled against the alternatives: a **fixed zero value** would make genesis blocks interchangeable between centres (a transplanted chain prefix from another centre would still verify locally); **NULL** would break the invariant that every row hashes an identical shape and would weaken the NOT NULL discipline. The **domain-separated constant binds the chain to its centre**: unambiguous, testable, and partition-safe.
- **First-event distinction:** `seq_no = 1` **and** `prev_hash =` the genesis constant for that centre — both are asserted by verification (§6.2); later events must chain to their predecessor's `entry_hash`.

---

## 4. A-4 — Canonical serialization (RATIFIED)

### 4.1 Principles

The preimage is a **versioned, domain-separated, length-prefixed envelope** whose bytes can be reproduced independently from the stored columns. Ambiguous concatenation is structurally impossible: every field value is length-prefixed, so no delimiter collision exists regardless of content. **Generic JSONB display output is not trusted as a permanent canonical format** — the canonical payload text is computed once at append time by a deterministic serializer, **stored**, hashed from the stored bytes, and re-verified against the queryable `jsonb` copy (§4.5).

### 4.2 Envelope definition (canonical_version = 1)

Preimage bytes := UTF-8 of:

```
BESTCOACH-AUDIT-V1
<field-block> × 16, in exactly this order, each terminated by one LF (0x0A)
```

Field block grammar (ASCII): `<field_name> ':' <tag>` where `<tag>` is either
`'N'` (SQL NULL — nothing follows) or `'V:' <decimal-byte-length> ':' <value-bytes>`.
The length counts the UTF-8 **bytes** of the value representation. Because length is explicit, value bytes may contain any character, including `:` and LF.

**Field order (fixed, v1):**

| # | field_name | Representation of `<value-bytes>` |
|---|---|---|
| 1 | `canonical_version` | decimal integer, no sign, no leading zeros (`1`) |
| 2 | `centre_id` | lowercase canonical UUID `8-4-4-4-12` |
| 3 | `seq_no` | decimal integer, no leading zeros |
| 4 | `prev_hash` | 64 lowercase hex characters |
| 5 | `occurred_at` | UTC instant, `YYYY-MM-DDTHH:MM:SS.ffffffZ` (always 6 fractional digits, always `Z`; converted from the stored `timestamptz` at UTC — the timezone rule is **UTC, always**) |
| 6 | `actor_account_id` | lowercase UUID, or tag `N` when NULL |
| 7 | `actor_membership_id` | lowercase UUID, or `N` |
| 8 | `actor_role` | exact lowercase enum label (`management` / `trainer` / `parent`), or `N` |
| 9 | `action` | registry text, exactly as stored (§1.4) |
| 10 | `state_domain` | text or `N` |
| 11 | `state_from` | text or `N` |
| 12 | `state_to` | text or `N` |
| 13 | `target_type` | text (e.g. `report`, `student`) |
| 14 | `target_id` | lowercase UUID, or `N` |
| 15 | `target_label` | immutable snapshot text, UTF-8 bytes exactly as stored — **no Unicode normalization is applied at any point** (normalizing would alter evidence; length-prefixing makes raw bytes safe) |
| 16 | `payload_canonical` | the canonical JSON text of §4.4, exactly as stored |

`entry_hash := lowercase-hex( sha256( preimage-bytes ) )`.

Booleans and integers occur only inside `payload_canonical` and follow §4.4. Arrays occur only inside `payload_canonical`, preserving order. The **previous-hash representation** hashed is the 64-hex text (field 4), which for `seq_no = 1` is the §3 genesis constant. The **schema-version field** is field 1; any future envelope change increments it and adds a parallel serializer — committed rows are never re-serialized.

### 4.3 Why length-prefixing

`hash(prev_hash + canonical_payload)` in v3 §23 names the inputs, not an encoding. Plain concatenation is ambiguous (`("ab","c")` = `("a","bc")`). The envelope satisfies §23's formula — `prev_hash` is field 4, the canonical payload is the remaining fields — while making every field boundary explicit and machine-checkable.

### 4.4 Canonical JSON (for `payload_canonical`) — full determinism specification

Produced at append time by a deterministic serializer authored in Step 7H SQL — a recursive `plpgsql` walk over the stored `jsonb` using only core functions (`jsonb_typeof`, `jsonb_each`, `jsonb_array_elements`, `convert_to`, numeric casts): **no extension, feasible in PostgreSQL 17 core**.

- **Object keys: pure UTF-8 byte order** (`ORDER BY convert_to(key, 'UTF8')` — `bytea` comparison is byte-wise). This is **deliberately not `jsonb`'s native key order**, which sorts by *length first, then bytes* (`"b"` before `"ab"`) — the serializer imposes its own ordering precisely so no `jsonb` internal is load-bearing. Duplicate keys cannot occur: `jsonb` ingestion already deduplicates (last value wins) before the serializer runs.
- **Nested objects and arrays: fully recursive** — every nested object is key-sorted by the same byte rule at every depth; every array preserves element order exactly at every depth.
- **Numbers:** `jsonb` stores numbers as exact `numeric`; the serializer emits `(value)::numeric::text`, which is PostgreSQL's stable canonical rendering (scale preserved: `1.10` stays `1.10`; scientific input is already normalized at ingestion: `1e2` → `100`). The v1 payload contract additionally restricts RPCs to integers and fixed-scale decimals — floats never enter the envelope.
- **String escaping, exhaustively:** `"` → `\"`, `\` → `\\`, U+0008 → `\b`, U+0009 → `\t`, U+000A → `\n`, U+000C → `\f`, U+000D → `\r`, every other control character U+0000–U+001F → `\u00xx` with **lowercase** hex — and **nothing else is escaped** (no `\/`, no non-ASCII escaping; all other characters are raw UTF-8 bytes). U+0000 cannot occur: PostgreSQL `jsonb` rejects `\u0000` at ingestion, so the case is structurally absent.
- **Booleans:** `true` / `false`. **JSON null:** the token `null`. **SQL NULL vs JSON null vs the text "null":** a SQL-NULL payload parameter is rejected by the append function (the empty payload is `{}`), so SQL NULL never reaches the serializer; JSON null serializes as unquoted `null`; the three-character string serializes as quoted `"null"` — the quoting distinguishes them unambiguously.
- **No insignificant whitespace** anywhere; top level is always an object.
- **Timestamps and UUIDs inside the payload** are, by the v1 payload contract, passed by the governed RPC as **already-normalized strings** (lowercase canonical UUID; UTC `YYYY-MM-DDTHH:MM:SS.ffffffZ`, matching the envelope rule) — the serializer treats them as ordinary strings and performs no type guessing.
- **Consistency with the queryable copy:** `payload_canonical` is stored and hashed; verification asserts `payload_canonical::jsonb = payload` (§4.5), so the convenience `jsonb` can never silently diverge from the hashed evidence.
- related targets (A-029 child rows) are serialized **inside** the payload under the reserved key `"related_targets"` as an ordered array of `{"target_type":…,"target_id":…,"target_label":…}` objects — so the hash covers them; the child table (§5.1) is a queryable projection of the same data, cross-checked by verification (§6.2).

The result is independently reproducible from the stored `jsonb` by any implementation of these rules, in or outside PostgreSQL.

### 4.5 Dual storage rule

`payload_canonical text` (hashed, evidentiary, byte-frozen) **and** `payload jsonb` (queryable convenience) are both stored; verification asserts `payload_canonical::jsonb = payload` so the convenience copy can never silently diverge from the evidence.

### 4.6 Worked preimage example (synthetic fixture values; hash intentionally not computed)

Event: the fixture trainer submits report version 2 for approval — `report.state_changed`, `pending_review → approved` (values synthetic and illustrative only; the real status vocabulary is A-028's).

```
BESTCOACH-AUDIT-V1
canonical_version:V:1:1
centre_id:V:36:b0000000-0000-4000-8000-000000000001
seq_no:V:2:17
prev_hash:V:64:9c56cc51b374c3ba189210d5b6d4bf57790d351c96c47c02190ecf1e430635ab
occurred_at:V:27:2026-02-03T03:15:42.123456Z
actor_account_id:V:36:c0000000-0000-4000-8000-000000000002
actor_membership_id:V:36:c1000000-0000-4000-8000-000000000002
actor_role:V:7:trainer
action:V:20:report.state_changed
state_domain:V:6:report
state_from:V:14:pending_review
state_to:V:8:approved
target_type:V:6:report
target_id:V:36:aa000000-0000-4000-8000-000000000001
target_label:V:35:Fixture Student One — Feb 2026 slot
payload_canonical:V:174:{"checklist_complete":true,"content_hash":"5b0c33…(64 hex)…e2","related_targets":[{"target_id":"ab000000-0000-4000-8000-000000000001","target_label":"Version 2","target_type":"report_version"}],"version_no":2}
```

Field-by-field: 1 pins the envelope version; 2–3 pin the partition and dense position; 4 chains to the predecessor (here a synthetic 64-hex placeholder — for `seq_no 1` it would be the §3 genesis constant); 5 is the UTC instant; 6–8 are A-029's actor attribution (account + membership + role at action time); 9–12 are the generic action/state fields; 13–15 the polymorphic primary target with its immutable label snapshot (note the em dash — raw UTF-8 bytes, byte-counted, unnormalized); 16 the canonical payload carrying the approval provenance (`content_hash`), the gate proof, and the related-target child data. (Byte lengths of multibyte examples are illustrative; the serializer counts real UTF-8 bytes. The example deliberately stops short of computing `sha256` — per this checkpoint's design-only boundary.)

---

## 5. A-5 — Append, previous-hash and concurrency rules (RATIFIED)

### 5.1 Objects involved (full shape in §7)

`public.audit_events` (append-only event rows) · `public.audit_event_targets` (A-029 related-target child rows) · `public.audit_chain_heads` (one row per centre: `last_seq`, `last_hash`) · `public.audit_append_event(...)` (the only append authority) · the §4.4 canonical serializer (internal helper).

### 5.2 Append protocol (single entry point, exact race-safe sequence)

The function is `VOLATILE SECURITY DEFINER`, owner `postgres`, `search_path = ''`, fully qualified references, no dynamic SQL, **called only from inside a governed `SECURITY DEFINER` RPC's transaction** (7I / Phase 1). Exact statement order:

1. **Centre validation** — `SELECT 1 FROM public.centres WHERE id = $centre` (authored error if absent; the FKs back-stop this).
2. **Registry and payload validation** — `action` must be in the ratified registry (§1.4) and the payload must pass the §4.4 contract.
3. **Actor validation** — per §5.4: the passed actor triple is re-proven against the live session identity, never trusted.
4. **Atomic head seed-or-skip** — `INSERT INTO public.audit_chain_heads (centre_id, last_seq, last_hash) VALUES ($centre, 0, genesis_constant($centre)) ON CONFLICT (centre_id) DO NOTHING;`
5. **Lock** — `SELECT last_seq, last_hash FROM public.audit_chain_heads WHERE centre_id = $centre FOR UPDATE;` (a row now always exists). The **row lock on the per-centre head is the concurrency serializer**: appends to one centre queue; different centres proceed in parallel.
6. **Allocate** — `seq_no := last_seq + 1`; `prev_hash := last_hash` — uniform for genesis and non-genesis alike, because the seeded head already carries the §3 genesis constant at `last_seq = 0`.
7. **Hash** — build the §4 envelope; `entry_hash := encode(pg_catalog.sha256(preimage), 'hex')`.
8. **Write** — insert the event row and its related-target child rows; `UPDATE public.audit_chain_heads SET last_seq = seq_no, last_hash = entry_hash, updated_at = now() WHERE centre_id = $centre;` — all in the caller's transaction. `UNIQUE (centre_id, seq_no)` and `UNIQUE (entry_hash)` back-stop the lock.
9. **Return** — the new event id and `entry_hash` to the calling RPC (which may surface the id, never a preimage).

**Two concurrent genesis appends — proof of exactly one `seq_no = 1` (READ COMMITTED, the platform default; SERIALIZABLE only strengthens it):**

| Step | Transaction A | Transaction B |
|---|---|---|
| 4 | Inserts the seed row `(centre, 0, genesis)` (uncommitted) | `INSERT … ON CONFLICT DO NOTHING` finds A's uncommitted unique conflict → **blocks on A's transaction** |
| 5–8 | Locks its own row, allocates `seq 1`, `prev = genesis`, inserts event 1, updates head to `(1, h₁)`, commits | still blocked |
| after A commits | — | `ON CONFLICT DO NOTHING` resolves as a no-op; step 5 `FOR UPDATE` reads the **committed** head `(1, h₁)` under a fresh statement snapshot; allocates `seq 2`, `prev = h₁` |
| if A aborts instead | — | B's step-4 insert **succeeds**, B seeds and appends `seq 1` itself |

Either interleaving yields exactly one `seq_no = 1`, no duplicate, no lost append and no gap; the same argument covers any later pair of concurrent appends (both serialize at step 5). Acceptance test T-8 exercises this with two live sessions.

**Locking rationale (corrected for accuracy).** PostgreSQL advisory locks exist in **both session-scoped and transaction-scoped** forms — `pg_advisory_xact_lock(key)` releases at commit/rollback and **would** serialize appends correctly; the earlier "connection-scoped" characterisation applied only to the session-level variant and was wrong as a general claim. The head **row lock remains the ratified choice** on these grounds: the lock object **is** the datum being read-modify-written, so no `uuid → bigint` key mapping exists to collide or drift; the advisory key space is global to the database, so any other subsystem's advisory usage could collide with a hashed key; the head row must be read and updated under the lock anyway, so `FOR UPDATE` adds zero extra machinery; and the protocol is schema-visible and directly testable (a blocked second session is observable against the row). Advisory locks are rejected as unnecessary indirection, not as unworkable.

### 5.3 Duplicates and idempotency — per event group, no global claim

**The audit infrastructure itself carries no idempotency key in v1**, and no *global* duplicate-protection claim is made. Duplicate protection is a **per-operation gate owned by each governed RPC**, and every in-scope event group has a defined gate:

| Event group | Duplicate gate (owned by the originating RPC) |
|---|---|
| Report lifecycle (E1–E3) | **Natural CAS**: guarded compare-and-set on current state + optimistic `lock_version` bump (CLAUDE.md §205); `report.created` gates on the aggregate's uniqueness for its report context |
| Attendance correction (E4) | **CAS required by design**: the RPC must compare-and-set on the expected current status for `(session, student)` (unique per A-018); a repeated toggle to the same value fails the guard before any append |
| Invitations (E6) | Status transitions (`revoked`/`reissued`): CAS on current status (A-027 revoke-or-supersede). **Creation**: no natural CAS — the RPC **must** gate on a deterministic uniqueness rule (one live invitation per invitee/role/centre) or a client-supplied operation idempotency key, resolved when that RPC is designed |
| Enrolment / assignment changes (E5 subset) | Creations gate on the **existing partial-unique indexes** (one active enrolment per student/module pattern, one active assignment per session, one active membership per account/centre); deactivations are CAS on `is_active` |
| Other management creations (E5: modules, sessions, students, profiles) | No natural CAS — each creation RPC **must** define its deterministic gate (natural uniqueness where one exists, otherwise an operation-level idempotency key) **before** it may append; this is a stated requirement on Phase 1 RPC design, not an audit-infrastructure feature |
| Role changes (E8) | CAS on current role/status of the target membership |
| Bootstrap (E7, deferred) | The existing partial-unique `one active management membership per centre` index is its natural gate; formal design lands with N-4 |

**Placement ruling:** the gate belongs in **each governed RPC**, not in the audit tables — the audit layer records what happened; deciding whether an operation is a duplicate is business logic. (AI-job idempotency remains `ai_jobs`' own keyed mechanism per v3 §24, outside audit.) A repeated *successful* business action is by definition a new governed event. Acceptance test T-11 proves the CAS gate for the 7I transitions; each Phase 1 checkpoint must prove its own gate before its events are accepted.

### 5.4 Actor authority — validated, never trusted

`audit_append_event` **cannot accept an arbitrary actor as authoritative.** It receives the actor triple (`account_id`, `membership_id`, `role`) as parameters from the owner-context RPC **and independently re-validates it** before writing anything:

- **Authenticated path** (`auth.uid()` IS NOT NULL — the JWT claims are session-state and remain visible inside `SECURITY DEFINER` execution): the function proves, against the live tables, that the passed account is the **active** account of `auth.uid()`, and that the passed membership belongs to that account, is **active**, matches the passed role, and belongs to the event's centre. Any mismatch raises — a governed RPC cannot mislabel its caller, accidentally or otherwise.
- **System/operator path** (`auth.uid()` IS NULL — owner-connection operations only, e.g. the future N-4 bootstrap): the actor triple must be **jointly NULL**, and the `action` must be flagged `system-actor-allowed` in the registry (v1 flags **only** the reserved `membership.bootstrap`; every other action requires an authenticated actor). A JWT-bearing session can therefore never emit a system event, and an owner session can never impersonate a user.

No spoofable client path exists in either branch: clients cannot execute the function at all (§5.5), and the trusted-caller chain is itself validated rather than assumed.

### 5.5 Prohibitions carried into SQL

- **No client role may `INSERT`, `UPDATE` or `DELETE`** on `audit_events`, `audit_event_targets` or `audit_chain_heads` — zero grants of any kind to `anon`, `authenticated`, `service_role`, `authenticator`, `PUBLIC` (v3 §23; A-030). **RLS is not relied on against `service_role`** — its constraint is the absence of privilege (BYPASSRLS, D-254); RLS is still enabled with zero policies for posture consistency.
- Audit rows are **never updated or deleted** — not for correction (correction is a new event, A-029), not for repair (§6.4). Belt-and-braces guard triggers (§7) raise on `UPDATE`/`DELETE` even for the owner — acknowledged as accident protection only, not superuser protection.
- **Chain-head mutation protection, reconciled exactly.** The append function must legitimately `INSERT` the seed row and `UPDATE` `last_seq`/`last_hash` (§5.2 steps 4 and 8) — so the head-table guard trigger fires **only on `DELETE`**, which no code path ever performs; it can never block a valid append, and no trigger on the head restricts `INSERT`/`UPDATE`. The distinction between legitimate append activity and unauthorised direct mutation is **not** made by the trigger and depends on **no session variable (nothing spoofable): it is made by privilege alone** — zero grants mean no client role can reach the table at all, so every reachable `INSERT`/`UPDATE` is, by construction, owner-context code (the append function or the operator). What the privilege layer cannot distinguish — a rogue *owner-session* direct `UPDATE` of the head — is deliberately left to detection, not prevention: verification check §6.2-5 (stored-head agreement) flags it, and a fully consistent owner-level rewrite is §1.2's superuser threat, answered by the Phase 4 anchor. Clients cannot bypass any of this: they hold no table privilege, no trigger-management authority (ownership required), and no EXECUTE on any audit function.
- **`EXECUTE` on `audit_append_event` is granted to no client role at all** — not even `authenticated`. It is reachable exclusively through owner-context governed RPCs: a 7I/Phase-1 RPC is `SECURITY DEFINER` and owned by `postgres`, so inside it `current_user = postgres`, and `postgres` executes the append function **by ownership — no grant exists or is needed**. This preserves, provably: **(a) one transaction** — SQL functions never open their own transactions, so the append runs inside the RPC's transaction; **(b) rollback atomicity** — abort removes mutation, event, children and head update together (T-10); **(c) no service-role grant** — `service_role` appears in no ACL on any audit object or function; **(d) no direct authenticated append** — no EXECUTE, no INSERT, and `REVOKE CREATE ON SCHEMA public` (Step 7E) means a client cannot even create a function to try; **(e) no arbitrary invocation by another public function** — any function able to call the append entry point must itself run as `postgres`, i.e. be a `postgres`-owned `SECURITY DEFINER` function, and every such function is migration-authored under the P-1 role guard and review; none can appear outside a governed checkpoint.
- A failed business transaction leaves **nothing**: event, child rows and head update all roll back with it (same transaction, T-10); the chain never references rolled-back state.
- The design is **centre-aware today**: every parameter, lock, sequence and genesis is keyed by `centre_id`, so a second centre requires zero redesign.

---

## 6. A-6 — Verification, failure and repair (RATIFIED)

### 6.1 Entry point

`public.audit_verify_chain(p_centre_id uuid DEFAULT NULL, p_from_seq bigint DEFAULT NULL, p_to_seq bigint DEFAULT NULL)` — read-only (`STABLE`), `SECURITY DEFINER`, owner `postgres`, `search_path = ''`, **EXECUTE granted to no client role** (operator-run over an owner connection in the MVP, per §1.5). NULL centre = verify every chain.

**Bounded-range semantics (exact).** With `p_from_seq`/`p_to_seq` set, the run is a **partial-range verification**, and its result row is explicitly labelled `mode = 'partial'` (versus `'complete'`):

- **Predecessor anchor:** for `from_seq > 1`, the anchor is the **stored** `entry_hash` of row `from_seq − 1`. The range check first proves that row *exists*; its own integrity is **assumed, not proven**, by the partial run — the result row records `anchor_seq` and `anchor_hash` so the assumption is explicit and auditable.
- **What a partial run proves:** dense, unique `seq_no` continuity inside `[from, to]`; `prev_hash` linkage row-to-row inside the range and from the anchor into `from_seq`; full preimage reconstruction and hash recomputation for every row in the range; partition, payload-consistency and registry checks for those rows.
- **Stored-head agreement** applies **only** when `to_seq` reaches the chain tip (`to_seq = max(seq_no)` or is NULL); a below-tip range skips the head check and says so in the result.
- **A partial run can never claim full-chain integrity.** Chain-level integrity is claimed only by a `mode = 'complete'` run (whole chain from `seq 1`, genesis constant verified, head verified). Composition is possible but explicit: contiguous partial runs whose anchors chain from a verified genesis, ending in a tip-inclusive range, jointly equal a complete run — the operator composes them; the function never implies it.

### 6.2 Checks performed

1. **Sequence continuity** — per centre: `seq_no` is exactly `1..N`, dense, unique.
2. **Previous-hash continuity** — row 1 carries the §3 genesis constant; every later row's `prev_hash` equals its predecessor's `entry_hash`.
3. **Canonical preimage reconstruction** — the §4 envelope is rebuilt from the stored columns and stored `payload_canonical`.
4. **Current-hash recomputation** — `sha256` of the rebuilt preimage equals the stored `entry_hash`.
5. **Stored-head agreement** — `audit_chain_heads` matches the last event (`last_seq = max(seq_no)`, `last_hash = its entry_hash`); a head row with no events, or events with no head row, is a failure.
6. **Partition isolation** — every event's `centre_id` equals the chain being verified; child target rows join to exactly one existing event of the same chain; `payload_canonical::jsonb = payload`; the payload's `related_targets` array equals the child rows.
7. **Registry conformance** — every stored `action` is in the ratified registry for its `canonical_version`.

### 6.3 Failure semantics

Verification **mutates nothing** — ever. It returns a machine-readable report set (per centre: ok/failed, first failing `seq_no`, failed check name); it does not raise on integrity failure (a raise would abort the report mid-scan) except for its own invocation errors. **A detected break is an incident, not an exception path:** the MVP posture, stated plainly —

- the application **does not automatically freeze**: no auto-disable mechanism is ratified in the MVP (none exists to misfire); taking the product offline is the **operator's documented decision** in the incident record;
- **audit writes continue** after a detected break: later events still hash over their predecessors, so the break stays localized between two provable points and evidence keeps accruing; halting appends would destroy the very trail an incident needs;
- the incident is documented in `BUILD_NOTES.md` (permanent log, A-008) with the verification report output, and the affected chain is **exported/copied for evidence before any further action**;
- Phase 4 (A-007) adds the external mirror, alerting and the formal runbook — this baseline deliberately does not pre-build them.

### 6.4 Repair

**No automated repair. No in-place alteration of committed audit events — ever.** Legitimate correction of *business* history is a **new governed event** (A-029 correction-by-new-event). An administrator investigating a break may **rebuild a copy** (into a separate comparison table or an exported dump) and diff it against the evidence — **never overwrite** the original rows. Repair tooling is **explicitly deferred**; the incident-response boundary in the MVP is: detect (§6.2) → preserve (export/copy) → document (BUILD_NOTES + orchestrator report) → operator decision. Any future repair mechanism requires its own ratified design with authority, evidence-preservation and audit-trail rules; none is granted here.

---

## 7. Minimum proposed database shape (design only — SQL is Step 7H1B's work)

| Object | Purpose | Key columns / signature | Ownership · mutability · posture |
|---|---|---|---|
| `public.audit_events` (table) | Append-only event rows | `id uuid PK default gen_random_uuid()` · `centre_id uuid NOT NULL FK→centres RESTRICT` · `seq_no bigint NOT NULL` · `canonical_version smallint NOT NULL` · `occurred_at timestamptz NOT NULL` · `actor_account_id uuid NULL FK→accounts RESTRICT` · `actor_membership_id uuid NULL FK→centre_memberships RESTRICT` · `actor_role public.centre_membership_role NULL` · `action text NOT NULL` · `state_domain/state_from/state_to text NULL` · `target_type text NOT NULL` · `target_id uuid NULL` · `target_label text NOT NULL` · `payload_canonical text NOT NULL` · `payload jsonb NOT NULL` · `prev_hash text NOT NULL` · `entry_hash text NOT NULL` · `UNIQUE(centre_id, seq_no)` · `UNIQUE(entry_hash)` · 64-hex CHECKs on both hashes · actor-triple consistency CHECK | Owner `postgres` (P-1 guard). **INSERT via append function only; never UPDATE/DELETE.** RLS enabled, zero policies, zero client privileges of any kind. Durable actor FKs per A-029; polymorphic target has **no FK** + label snapshot. |
| `public.audit_event_targets` (table) | A-029 related-target child rows (queryable projection of the payload's `related_targets`) | `id uuid PK` · `event_id uuid NOT NULL FK→audit_events RESTRICT` · `target_type text NOT NULL` · `target_id uuid NULL` · `target_label text NOT NULL` | Same posture: append-only, owner-only, RLS enabled, zero policies/privileges. |
| `public.audit_chain_heads` (table) | One row per centre chain: lock point + head anchor | `centre_id uuid PK FK→centres RESTRICT` · `last_seq bigint NOT NULL` · `last_hash text NOT NULL (64-hex CHECK)` · `updated_at timestamptz NOT NULL` | Owner `postgres`. Mutated **only** by the append function (UPDATE of `last_seq`/`last_hash`); never client-touched; RLS enabled, zero policies/privileges; DELETE prohibited. |
| `public.audit_append_event(...)` (function) | The **only** append authority: validates registry + actor, locks head, allocates `seq_no`, derives `prev_hash`, builds the §4 envelope, computes `sha256`, writes event + children + head atomically | Parameters: centre, actor triple, action, state triple, primary target (type/id/label), related targets, payload; returns `(event_id, entry_hash)` | `VOLATILE SECURITY DEFINER`, owner `postgres`, `search_path=''`, no dynamic SQL. **EXECUTE: no client role whatsoever** — reachable only through owner-context governed RPCs. |
| `public.audit_canonical_json(jsonb)` (function) | The §4.4 deterministic serializer (recursive walk, byte-ordered keys) | `jsonb → text`, `IMMUTABLE` | Owner `postgres`, `search_path=''`; EXECUTE: no client role. Internal helper of append + verify. |
| `public.audit_verify_chain(...)` (function) | §6 verification | as §6.1; returns a report set | `STABLE SECURITY DEFINER`, owner `postgres`, `search_path=''`; EXECUTE: no client role (operator-run). Mutates nothing. |
| Guard triggers (3) | Accident-proofing only (§5.5): `audit_events` — `BEFORE UPDATE OR DELETE … RAISE`; `audit_event_targets` — `BEFORE UPDATE OR DELETE … RAISE`; `audit_chain_heads` — **`BEFORE DELETE … RAISE` only**, because the append function legitimately INSERTs and UPDATEs the head (§5.2) and must never be blocked | statement-independent `RAISE EXCEPTION`, no session-variable condition of any kind | Owner `postgres`. The client boundary is privilege, not these triggers; a superuser can disable triggers — that actor is §1.2's deferred-anchor territory. |

**Evaluated and included:** one append-only event table ✔ · the A-029 child table ✔ (mandated) · one chain-head table ✔ · one append function ✔ · one verification function ✔ · an event **schema-version field** ✔ (`canonical_version`). **Evaluated and excluded:** an audit-level idempotency key ✘ (§5.3 — duplicate gating is a defined per-RPC obligation: natural CAS or uniqueness where one exists, an operation-level idempotency mechanism where one does not) · generic event-sourcing platform, external queues, blockchain, multi-centre admin UI, cross-centre analytics, completed-TA support, client-side service-role access ✘ (all outside the MVP by standing governance). **Relationship to authenticated users and memberships:** clients never touch audit objects; actor attribution flows **from** the governed RPC (which resolves the caller via the Step 7G helpers) **into** append parameters — audit reads nothing from the client.

---

## 8. Event → checkpoint matrix

| Governed event | Originating future RPC / server action | Business tables affected | Actor identity source | Audit payload fields (minimum) | Chain partition | Checkpoint |
|---|---|---|---|---|---|---|
| Infrastructure (tables, functions, triggers, guards, verification) + rollback-proof decoy appends | — (migration + runtime proof; decoys roll back, chain stays empty) | audit objects only | — | — | per centre | **7H** |
| `report.created` | create-report RPC | reports | RPC caller via 7G helpers (account+membership+role) | report id, student id, module/session refs | centre of report | **7I** |
| `report_version.created` | store-draft / save-edit RPC | report_versions | same | version id, version_no, content_hash, derivation refs (observation id) | centre | **7I** |
| `report.state_changed` (every §13 transition; approve & publish = two events, one transaction) | transition RPCs / Approve&Submit server action | reports, report_versions, report_version_approvals, checklist progress | same | state_from/state_to, version id, content_hash + checklist proof on approval | centre | **7I** |
| `attendance.changed` | attendance-toggle RPC | attendance | trainer via 7G helpers | session id, student id, old/new status | centre | Phase 1 (trainer flow) |
| `admin.*` roster/management events (E5) | management CRUD RPCs | modules, sessions, assignments, students, enrolments, links, profiles | management via 7G helpers | created/changed entity refs + minimal change summary | centre | Phase 1 (management flow) |
| `invitation.created/revoked/reissued` | invitation RPCs | invitations | management | invitation id, role, status change (never a token — none exists, A-027) | centre | Phase 1 (invitation) |
| `membership.role_changed` | membership admin RPC | centre_memberships | management | membership id, old/new role/status | centre | Phase 1 (management flow) |
| `membership.bootstrap` | **deferred with N-4** | centre_memberships | — | name reserved | centre | N-4 checkpoint |

**Step 7H builds only the reusable infrastructure and verification contract. Step 7I owns the report-lifecycle RPCs and appends report events through the ratified entry point. No report-lifecycle implementation is pulled into 7H.**

---

## 9. Acceptance tests required before Step 7H can be accepted

Static (S) at review; runtime (R) at the application checkpoint; **(D)** = requires transaction-local decoys, always rolled back.

| # | Proof | Kind |
|---|---|---|
| T-1 | Migration begins with the fail-closed `current_user = 'postgres'` guard (P-1); end-of-migration assertions re-derive the full posture | S+R |
| T-2 | All new objects owned by `postgres`; `postgres`/`supabase_admin` default ACLs byte-unchanged after application | R |
| T-3 | Zero client privileges of any kind on all three audit tables (anon, authenticated, service_role, authenticator, PUBLIC — has_table_privilege sweep ×7 privileges); RLS enabled, zero policies | R |
| T-4 | `audit_append_event` / `audit_canonical_json` / `audit_verify_chain` EXECUTE denied to every client role (incl. authenticated); mutation-denial proven **as restricted roles via `SET ROLE`** (A-010), never only as postgres | R |
| T-5 | Deterministic genesis: first append to a fresh centre yields `seq_no 1` and the §3 domain-separated constant; recomputable independently | R (D — decoy centre) |
| T-6 | Deterministic serialization: a fixed synthetic event serialized twice yields byte-identical preimages and equal hashes; §4.6-style vector reproduced from stored columns | R (D) |
| T-7 | Sequential append: three appends yield dense `seq_no` 1‑2‑3, each `prev_hash` = predecessor's `entry_hash`, head tracks the tip | R (D) |
| T-8 | Concurrent append: two parallel sessions appending to one centre serialize on the head lock — no gap, no duplicate, both verify | R (D — two sessions, both rolled back) |
| T-9 | Cross-centre isolation: appends to decoy centre B leave centre A's chain and head untouched; verification scopes correctly | R (D) |
| T-10 | Rollback atomicity: a business-style transaction that appends and then rolls back leaves **zero** event/child/head residue | R (D) |
| T-11 | Duplicate/CAS handling: a repeated compare-and-set transition fails before appending — event count unchanged | R (D; full form lands with 7I's real RPCs) |
| T-12 | Tamper detection: inside a rolled-back transaction, altering a committed-in-txn event field breaks verification at exactly that `seq_no` (canonical/hash check named) | R (D) |
| T-13 | Stored-head mismatch detection: head desynchronized in-txn → verification reports head-agreement failure | R (D) |
| T-14 | Verification is read-only: zero mutation from a full verify pass (row counts + hashes identical before/after) | R |
| T-15 | Unauthenticated/anon and authenticated (trainer/parent/management JWT contexts) cannot SELECT, count or enumerate any audit object (permission denied, not empty result) | R |
| T-16 | `service_role` posture: denied on all audit objects despite BYPASSRLS (zero grants) | R |
| T-17 | Zero repair mutation surface: no function updates or deletes committed audit rows; guard triggers raise on owner-side UPDATE/DELETE attempts (tested in rolled-back txn) | S+R (D) |
| T-18 | Fixture preservation: 3 Auth users / 25 rows / canonical checksum `d6a314b4…` / seed 1/3/9 unchanged after all tests | R |
| T-19 | Posture preservation: two prior migrations unchanged; 29 policies, 6 helpers, 13-table grant set intact; reconciled verification suite still passes twice | R |
| T-20 | Registry enforcement: an unregistered `action` is rejected before any write | R (D) |

---

## 10. Unresolved items after this reconciliation

| Item | Blocks 7H SQL? | Source gap | Recommendation | Operator ratification needed? |
|---|---|---|---|---|
| N-4 — production Management bootstrap (and its `membership.bootstrap` event) | **No** — infrastructure does not depend on it; the registry reserves the name | N-4 open since Amendment 003 | Design with the bootstrap checkpoint; event emission specified there | Yes — at that checkpoint |
| Exact report status vocabulary inside E3 payload examples | **No** — `state_from/state_to` are generic text (A-029); the ratified A-028 seven-value set binds at 7I when transitions are implemented | none (already ratified in A-028) | 7I maps transitions to the A-028 statuses | No |
| Automated fail-closed application behaviour on integrity failure | **No** — §6.3 ratifies the MVP posture (manual operator decision; writes continue) | v3 is silent on automation | Formalize alerting/runbook in Phase 4 (A-007) | No (Phase 4 scope) |
| Audit retention duration / PDPA erasure interaction for audit rows | **No** — Phase 4 (retention jobs, erasure endpoints per Implementation Plan) | v3 §22/§23 defer operational retention to later phases | Resolve in Phase 4 with the mirror | Yes — at Phase 4 |
| Verification cadence / scheduling | **No** — operator-run in MVP (§6.1) | v3 silent | Phase 4 alerting | No |
| External anchor mechanism details | **No** — Phase 4 by A-007 (§1.2) | A-007 assigns, does not design | Phase 4 | Yes — at Phase 4 |

**No unresolved item blocks audit-chain SQL.** A-1 … A-6 are each resolved above without silent gap-filling; every deferral is source-anchored (A-007, N-4, Phase-4 scope) rather than invented.

---

## 11. Ratification statement

**A-1 (scope & threat model), A-2 (SHA-256, in-database, same-transaction), A-3 (per-centre partition, seeded-head genesis with a domain-separated constant, dense sequence), A-4 (versioned length-prefixed canonical envelope with a fully specified deterministic serializer and stored canonical payload), A-5 (single owner-only append authority with a race-proven seed-and-lock protocol, validated actor identity, per-RPC duplicate gates, absolute append-only posture) and A-6 (read-only verification with explicit complete/partial modes, incident-not-exception failure semantics, no repair) are RATIFIED by this baseline**, subordinate to Specification v3, Amendments 001–003, `CLAUDE.md` and the Implementation Plan. Supersession of anything above happens only through a later ratified amendment or a superseding baseline — never by silent edit. **This document authorizes no implementation.** Step 7H SQL authoring requires its own explicit orchestrator authorization; the recommended next bounded checkpoint is **Step 7H1B — author and stage the audit-chain migration for static review** (create the §7 objects, the §9 static assertions, and stop before application).
