# B.E.S.T Coach — MVP Specification v3 Amendment 003

**Status:** Ratified by orchestrator
**Ratification date:** 2026-08-03
**Amends:** `BEST_Coach_Complete_MVP_Specification_v3.md` (this repository, `docs/spec/`) and, **only where explicitly named**, `BEST_Coach_MVP_Specification_v3_Amendment_001.md` and `BEST_Coach_MVP_Specification_v3_Amendment_002.md`

---

## Relationship to Specification v3, Amendment 001 and Amendment 002

Specification v3 remains the **authoritative baseline** for this build. Amendment 001 (**A-001 … A-013**) and Amendment 002 (**A-014 … A-024**) remain **fully in force**. This amendment records orchestrator-ratified **schema architecture and first-migration boundary decisions** that **supersede only the specific clauses named in the supersession table below**.

Rules of precedence for this amendment:

1. Every v3 clause not named here remains in force, unchanged.
2. Every Amendment 001 decision remains active and unchanged; **Amendment 003 names no Amendment 001 clause**, so A-001 … A-013 are untouched by this amendment (A-013's earlier narrow supersession by A-022 is unaffected).
3. Every Amendment 002 decision (**A-014 … A-024**) remains **active**. Amendment 003 **clarifies the physical form** of several Amendment 002 product decisions; it does **not** reverse any of them. Where the table below marks an Amendment 002 entry "clarified", the product decision stands and Amendment 003 supplies only its database representation.
4. **A later amendment wins only for the clauses it explicitly supersedes.** Where Amendment 003 names a clause, Amendment 003 governs that clause. Where it does not, v3-as-amended-by-001-and-002 governs.
5. Specification v3, Amendment 001 and Amendment 002 are **never edited in place**. All three remain byte-for-byte unchanged.
6. `CLAUDE.md` (the standing agent contract) and the Implementation Plan must agree with v3 as amended by 001, 002 **and** 003; where any of them still contains superseded wording, the wording in the governing amendment prevails and the stale text is historical.

**The core governance rule is unchanged and remains absolute:**

> **AI drafts. Trainer approves. Parents and management see only approved reports.**

**Amendment 003 does not weaken any privacy, approval, audit, or evidence control.** Every requirement it touches is made **stricter or more precisely enforceable**, never looser. Where this amendment fixes a physical representation, it does so to make a wrong value **unrepresentable in the database** rather than merely rejected in application code.

**Scope statement — read this before treating this amendment as permission to build.** Amendment 003 governs **schema architecture and migration boundaries**. It is **not an implementation authorization**. Ratifying the shape of the first migration is not the same as authorizing the first migration to be written. **Step 7E remains blocked and unauthorized after this amendment is staged, and after it is committed**, until the orchestrator authorizes Step 7E as a separate, explicit checkpoint.

**Precedence (highest first):** **v3 → ratified amendments (001, then 002, then 003 for the clauses each names) → `CLAUDE.md` → Implementation Plan → Figma Design 2 (visual/interaction reference only) → `STATUS.md` → `BUILD_NOTES.md` → temporary migration tracker.**

---

## Supersession and clarification table

| Amendment | v3 section(s) / clause superseded | Effect on Amendments 001 / 002 | Other active documents affected | Effect |
|---|---|---|---|---|
| **A-025** | §20 `users` ("Identity; coarse role only") as the physical identity shape; §20 `management_centre_assignments`, `trainer_class_assignments`, `parent_child_links` as physical table names/shapes; §21 role-resolution wording where it implies a role attribute on the identity row | **A-020 clarified** (identity/profile separation gains its physical form); **A-015 clarified** (one named management account gains a database-enforced cardinality); **A-019 clarified** (management is a membership role, not an identity attribute). None superseded. | `CLAUDE.md` §2 ADR-7, §6 identity/roles/centre-scoping bullets, §9 naming; Plan Gate G1b | Identity is **centre-independent** (`accounts`); **all** centre-specific role and lifecycle state lives on `centre_memberships`. Role is **not** an attribute of the identity row. Role/profile agreement is **database-enforced by composite keys and composite foreign keys**, never by a cross-table `CHECK`. |
| **A-026** | §20 enum/reference-data wording where it leaves representation open; §20 `observations.mode` (already removed by A-017) restated as physically absent | **A-016 clarified** (Class Grade gains a code enum plus centre-owned rows); **A-017 clarified** (nine dimensions gain a code enum plus global reference rows, and no `mode` column exists); **A-018 clarified** (attendance gains a two-value enum). None superseded. | `CLAUDE.md` §6 schema/hierarchy/attendance bullets; Plan Gate G1b "enum versus reference table" | Closed security and workflow vocabularies are **PostgreSQL enums**. Reference data that needs foreign-key identity, ordering or display labels is a **table**. Class Grade and the nine dimensions use the **hybrid** form: an enum for the closed code set plus a row for identity, ordering and label. |
| **A-027** | §21 authentication-secret wording, made absolute for application tables; §20 invitation storage left unspecified | **A-020 clarified** (invitation states gain physical storage and an effective-expiry rule). None superseded. | `CLAUDE.md` §6 identity/invitation bullets; Plan Gate G1b "invitation token and expiry" | **Supabase Auth owns every authentication secret.** No application table stores a raw token, OTP, password, access token, refresh token, or secret hash — **there is no column capable of holding one**. Invitations target a **pending centre membership** and carry a **stored status plus `expires_at`**, evaluated **transactionally**. |
| **A-028** | **§13** state machine, for the **stored status set** and the **freeze point**; §20 `reports` Quality-Checklist boolean columns; **§14 / §14.1** `report_versions.kind = approval_snapshot` / `audience = parent` as the physical visibility mechanism | **A-021 clarified** (one canonical read model gains a physical pointer). None superseded. | `CLAUDE.md` §6 state-machine, checklist-reset and visibility bullets; Plan Phase 1 and the A-021 verification register | One **report aggregate** per Class Session + student owns the single current-cycle status; **`report_versions` are self-contained**. **Approval freezes** the exact version and its canonical child rows. Checklist progress and approval evidence are **version-scoped and immutable once frozen**. Later edits **clone into a new mutable version**; a submitted version **never reopens**. |
| **A-029** | §23 audit **attribution and target representation** only | none | `CLAUDE.md` §6, §9 `/audit` module; Plan Gate G1c; Amendment 002 U-12 | Audit gains **stable account/membership attribution**, **durable actor foreign keys**, **polymorphic target identifiers with immutable minimal snapshots**, **one event per governed action plus related-target child rows**, an **append-only correction-by-new-event** model, and **data minimization**. **Complete audit objects and all hash-chain mechanics remain Step 7H work and are not ratified here.** |
| **A-030** | **§16 ADR-3** direct-client-read allowance, **narrowed** for the canonical submitted report only; §21 where privilege and policy are treated as one mechanism | none | `CLAUDE.md` §2 ADR-3/ADR-4, §6; Plan Gate G1b "`GRANT` strategy", Phase 0 RLS skeleton | **Deny-by-default.** RLS is **enabled** on every Step 7E table with **zero policies**, and **zero client privileges**, in Step 7E. A **policy and its minimum matching grant must ship together** in Step 7G. **No governed direct client DML anywhere.** Governed mutations use **reviewed, constrained `SECURITY DEFINER` RPCs** when introduced. **The database role follows the credential, not the code location.** |
| **A-031** | §20 table/enum inventory as the definition of the **first** migration's scope; §26 Phase 0 "schema + migrations for the core tables" as an unbounded instruction | **A-024 clarified** (step 1 of the ratified sequence gains an exact boundary). None superseded. | `CLAUDE.md` §6, §9, §10 Phase 0; Plan Gate G1b "first-migration table and enum scope", Phase 0 | The first governed migration (**Step 7E**) creates **exactly 10 enums, exactly 22 tables and exactly 13 deterministic seed rows** — no more and no fewer. Seed UUIDs are **fixed across environments**; mismatched pre-existing reference data **fails verification** rather than being silently accepted. |
| **A-032** | §26 Phase 0 exit wording where it implies audit, RLS and fixtures land inside the first migration | **A-024 clarified** (the checkpoint boundaries 7E → 7J are made explicit). None superseded. | `CLAUDE.md` §10 Phase 0; Plan Gate G1, Phase 0 | Named artefacts are **excluded from Step 7E** and assigned to their owning checkpoints (7F–7J and later work). **Amendment 003 does not authorize migration implementation. Step 7E remains blocked and unauthorized.** |

---

## A-025 — Identity, roles and membership: centre-independent accounts

**Identity is centre-independent.** An `accounts` row is a **person's identity in this system**, not a person's position in a centre.

Ratified structure:

- `accounts` carries an **application-owned UUID primary key** — generated by the application/database, **never** borrowed from an external identity provider;
- `accounts` carries a **nullable, unique `auth_user_id`** referencing the Supabase Auth user, so an account may exist **before** activation and remain intact **after** an Auth identity is removed;
- `accounts` carries an **account-wide lifecycle limited to exactly two values: `active` and `deactivated`**;
- `accounts` carries **no `centre_id` and no `role`**.

**Why `accounts` must not be centre-bound.** Because `auth_user_id` is unique, a centre-bound account would make a second-centre relationship impossible without either duplicating an identity or breaking uniqueness. Centre-independence is therefore a **structural requirement**, not a stylistic preference.

**All centre-specific state lives on `centre_memberships`:**

- `centre_memberships` is the **sole authority for role**. There is no second place a role may be read from, and **dual role authority is prohibited**;
- membership lifecycle values are exactly **`pending`, `active`, `deactivated`** — a **status enum, not a boolean**, because "invited but not yet activated" and "deliberately revoked" are different facts;
- role values are exactly **`management`, `trainer`, `parent`**. **Teaching Assistant is excluded** from this enum, consistent with A-014's deferral;
- **account lifecycle and membership lifecycle are separate.** A person may be globally `active` with no Auth linkage yet, and simultaneously `active` in one centre and `pending` in another.

**Students have no authentication relationship.** The `students` entity carries **no `auth_user_id` column and no account linkage of any kind**, so a student login is **structurally impossible** rather than merely unimplemented.

**Role changes are membership events, never in-place mutations.** Changing a person's role **deactivates the existing membership and creates a new membership**. A role value is never overwritten on a live membership row, because the historical record of what authority a person held at the time of a governed action must survive the change.

**Database-enforced role/profile consistency.** Role-extension profiles (`trainer_profiles`, `parent_profiles`) are pinned to a membership **of the correct role** through a **composite key and composite foreign key** — `centre_memberships` exposes a composite key of `(id, role)` and each profile table references it with its own role fixed. **A cross-table `CHECK` constraint is not used**, because a `CHECK` cannot read another table.

**Ratified cardinality, enforced by partial unique indexes:**

- **at most one active membership per (account, centre)**;
- **at most one active `management` membership per centre** (the physical enforcement of A-015's "one named management account").

Both indexes are **restricted to active rows**, so deactivated history **never blocks a legitimate replacement**.

**Same-centre integrity.** Centre-scoped relationships are enforced with **composite keys carrying `centre_id`**, so a row can never link two entities belonging to different centres. This keeps A-015's "keep the centre relationships real" requirement true at the database level rather than at the query level.

## A-026 — Controlled vocabularies and reference data

**Ratified rule.** Use a **PostgreSQL enum** where the value set is **closed, security- or workflow-bearing, and must not be editable at runtime**. Use a **table** where values need **foreign-key identity, ordering, or display labels**. Use the **hybrid** form — an enum for the code plus a row for identity, ordering and label — where both are true.

**A reference table is not inherently insecure.** The reason to prefer an enum for role, status and workflow vocabularies is that **the value set is closed and must not be runtime data**, not that tables are unsafe.

**Class Grade — centre-owned rows constrained by a code enum.** The `class_grades` table holds **centre-owned rows** so class modules can carry a real foreign key and so ordering and display labels have a home. The code column is constrained by the `class_grade_code` enum whose only values are **`beginner`, `intermediate`, `advanced`**. A fourth Class Grade is **not creatable**, and Class Grade **cannot regress to a label-only string**.

**Assessment dimensions — global, migration-controlled reference data.** The nine B.E.S.T dimensions are **global**, not centre-owned: they are the framework itself, not a per-centre configuration. `assessment_dimensions` rows are **created by migration** and constrained by the `dimension_code` enum. **All nine dimensions are mandatory for every assessment (A-017). No Quick 4 representation exists** — there is **no `mode` column, no four-dimension completion path and no four-dimension fallback**, at any layer.

**Ratified closed vocabularies:**

- **ratings:** `emerging`, `developing`, `secure`, `advanced`;
- **dimension groups:** `competency`, `speech_linguistics`;
- **attendance:** `present`, `absent` — no third value, consistent with A-018's Present-by-default rule and trainer `Absent` toggle.

**Deliberately deferred vocabularies.** The **session-lifecycle** vocabulary and the **audit** vocabularies are **deferred because their exact values are not yet ratified**, not because they are unnecessary. **No enum is created for a value set the orchestrator has not ratified**, and **no placeholder value is invented**.

**Enum reversibility is understood and accepted.** Adding a value is additive and safe. Removing or reordering values requires replacing the type. This asymmetry is precisely why every enum above is restricted to a value set the orchestrator has explicitly ratified.

## A-027 — Invitations and the absolute authentication-secret prohibition

**Supabase Auth owns all authentication secrets.** This is absolute for application tables:

> **No raw token, OTP, password, access token, refresh token, or secret hash may exist in any application table.**

The prohibition is enforced by **absence of any column capable of holding such a value** — not by a convention, a comment, or a review habit. This makes A-020's "no plaintext generated password is ever stored, displayed or emailed" **structurally true** rather than procedurally promised.

**Ratified invitation model:**

- an invitation **targets a `pending` centre membership** — it does not float free of the relationship it is creating;
- the invitation carries an **immutable, normalized email**, used as **acceptance-time proof only**; after linkage, authority flows from `auth_user_id` plus live memberships, never from a stored email string;
- the invitation carries a **stored status** and an **`expires_at` timestamp**;
- **effective expiry is `status` combined with `expires_at`, evaluated transactionally** at acceptance. Expiry is **not** inferable from a partial unique index, because such an index requires an `IMMUTABLE` predicate and therefore **cannot reference `now()`**;
- invitation states are exactly **`pending`, `accepted`, `expired`, `revoked`** (A-020's minimum, made exact);
- **an existing pending invitation must be revoked or superseded before a replacement is issued** — reissue explicitly vacates the pending slot rather than relying on time to do it;
- **an existing account is reused when a person is invited to a later centre.** A second identity is never created for the same person;
- **Auth-link expiry and application-invitation expiry are separate mechanisms** governing different things, and neither is derived from the other;
- **management bootstrap remains separately governed** — the first management membership is not created by an ordinary invitation flow, and its mechanism is not ratified here.

**Operationally unresolved, non-blocking.** The **invitation duration** is **not yet decided**. It is a **default value, not a schema shape**, and therefore **does not block schema design**. No duration is invented.

## A-028 — Report aggregate, versions, and approval as the freeze point

**One report aggregate per Class Session and student.** A report exists only where a **valid module enrolment** exists, enforced structurally so an assessment cannot attach to a student who was never enrolled in the module the session belongs to.

**The aggregate owns the single current-cycle status**, plus:

- **`current_cycle_version_id`** — the version currently being worked on;
- **`latest_submitted_version_id`** — the version that is canonical for readers.

**Seven authorized statuses**, and no others:

`incomplete` · `observation_saved` · `drafting` · `draft_ready` · `needs_edit` · `approved` · `submitted`

**`Evidence Pending` is not a stored report status in this MVP.** Evidence scope and its uploader are **UNRESOLVED (A-014)**, so no status value is created for a workflow that has not been ratified. **This deletes no evidence safeguard**: Amendment 001 A-001, A-003 and A-004 remain in force in full whenever evidence is implemented, and the representation of any evidence gate is a later decision, not an invented enum value now.

**Approval is the freeze point — not submission.**

- **Approval freezes the exact report version and its canonical child rows.** After approval, that version's content and its rating snapshots are immutable.
- **Checklist progress and approval evidence are version-scoped and immutable once frozen.** They live with the version they attest to, so approving a later version cannot retroactively rewrite the evidence attached to an earlier one. This is the physical form of the rule that the checklist attests to **this exact text**.
- **Exactly nine immutable rating snapshots** exist per approved or submitted version. A version is **self-contained**: its content and its nine ratings travel together, so a reader never reconstructs an approved report by joining against mutable working data.
- **Later edits clone into a new mutable version.** Correction never reopens frozen content.
- **A submitted version never reopens.** The only exit from `submitted` is `needs_edit`, which **creates a new version**.
- **The previous submitted version remains canonical while correction work is in progress**, so readers never see a gap, a partially-corrected report, or draft content.
- **Submission metadata** (`submitted_at`, `submitted_by`) is **write-once publication metadata**. It records that publication happened; it does not perform the freeze.

**Attendance and report interaction (A-018 made physical):**

- **no report exists for an absent student**;
- **mid-cycle absence retains existing work but blocks progression**, so a trainer's effort is never destroyed by a correction to attendance;
- **attendance for a submitted report cannot be changed to `Absent`** — the correction path is governed, not a silent status flip.

**Read model (A-021 made physical).** **Management and Parent read only the same latest submitted canonical report**, through the same read model. **Management and Parent never edit reports** — enforced server-side, never by hiding an Edit button.

**Version identity is provenance, not a type.** There is **no version-kind enum** and **no audience attribute** on a version. Canonicity is determined by the aggregate's `latest_submitted_version_id` pointer, and audience is determined by **authorization**, not by a column on the row. This supersedes the earlier `kind = approval_snapshot` / `audience = parent` mechanism while **preserving in full** the rule it existed to enforce: parents and management see only the approved, submitted snapshot.

**Concurrency.** Transitions remain **guarded, transactional, compare-and-set operations** with an optimistic-lock version bump, exactly as v3 §13 requires. Nothing here relaxes that.

## A-029 — Audit compatibility guarantees (schema-forward only)

Amendment 003 ratifies **only** what the first migration must not make impossible later. It **does not** design the audit subsystem.

**Ratified now:**

- **stable account and membership attribution** — an audit event names the account and the membership that acted, so authority at the time of the action is recoverable;
- **durable actor foreign keys where the referenced records are retained.** Centres, accounts and memberships are **never physically deleted**, so real foreign keys with `RESTRICT` are correct for attribution. **This is not a blanket "no foreign keys" rule**;
- **polymorphic target identifiers with immutable minimal snapshots** — a domain target carries **no foreign key** plus a **stored label snapshot**, so an event stays intelligible after its target changes or disappears (resolves Amendment 002 **U-12**);
- **one event per governed action, plus related-target child rows** in a dedicated child table with exactly one primary target. **A JSONB blob is not the authoritative link**;
- **generic state-transition fields** (`state_domain`, `state_from`, `state_to`) rather than report-specific columns, so the audit table serves every governed domain;
- **append-only, correction-by-new-event.** **Existing audit rows are never redacted or rewritten**; a correction is a new event;
- **data minimization** — an audit row stores what is needed to prove what happened, not a copy of the content;
- **no management, trainer or parent audit-read capability in the MVP.** This is a scope decision; the records are still written.

**Explicitly NOT ratified by this amendment** — these remain **Step 7H** decisions and **must not be inferred, defaulted, or "decided in the migration"**:

- audit **chain scope** (Amendment 002 U-13);
- **canonical serialization** of an event for hashing;
- **hash application** and the algorithm (Amendment 002 U-14);
- **previous-hash rules**;
- **genesis** rule (Amendment 002 U-15);
- **verification and repair procedures**.

**Complete audit objects and hash-chain mechanics are Step 7H work.** v3 §23's append-only hash-chained audit requirement is **unchanged and undiminished** — it is scheduled, not weakened.

## A-030 — Privileges, access posture and the client boundary

**Deny-by-default is the ratified posture.** Privilege (`GRANT`) and policy (RLS) are **two separate authorization layers**. A missing grant must **never** be misdiagnosed as an RLS failure, and RLS must **never** be assumed to be doing work that a grant is actually doing.

**Step 7E posture:**

- **every Step 7E application table has RLS enabled immediately**, in the same migration that creates it;
- **zero RLS policies exist in Step 7E**;
- **no client `SELECT` and no client DML** — for `PUBLIC`, `anon`, `authenticated`, or `service_role`;
- **no client RPC `EXECUTE`**;
- `CREATE` on the `public` schema is **revoked from `PUBLIC`**, and default privileges are tightened for the migration owner;
- **nothing becomes client-reachable merely because Step 7E completed.**

**Step 7G rule — the pairing requirement.** **A policy and its minimum matching grant must ship together.** Neither is added alone. Every grant is justified by a reviewed policy, and every policy is accompanied by the least privilege that makes it functional.

**Client boundary:**

- **no governed direct client DML anywhere** in this MVP;
- **governed mutations use reviewed, constrained `SECURITY DEFINER` RPCs** when they are introduced. This is a **design requirement, not a convenience**: a caller holding no DML **cannot** perform a governed write through a `SECURITY INVOKER` function, so definer functions with a **locked `search_path`** and **schema-qualified references** are the correct mechanism. `SECURITY INVOKER` remains the default for reads and validation helpers;
- **an authenticated SSR client is still the `authenticated` database role.** **The database role follows the credential, not the code location.** Running on a server does not confer privilege, and "server-side" is **not** a privilege mechanism;
- **the canonical latest-submitted report is read through a reviewed read RPC**, not raw internal-table access. This **narrows ADR-3's direct-client-read allowance for that one path**; ADR-3 otherwise stands;
- **the service-role client remains server-only** and is limited to **concrete Auth-admin or system operations** with explicit authorization, because it bypasses RLS entirely.

**Function ownership.** **Migration-owner `SECURITY DEFINER` ownership is accepted as an MVP default.** A **restricted `NOLOGIN` owner** is retained as **deferred hardening** — recorded, not silently dropped.

## A-031 — The exact Step 7E migration boundary

The first governed migration creates **exactly** the following. **No more and no fewer.**

### Exactly 10 enums

1. `centre_membership_role` — `management`, `trainer`, `parent`
2. `account_status` — `active`, `deactivated`
3. `centre_membership_status` — `pending`, `active`, `deactivated`
4. `class_grade_code` — `beginner`, `intermediate`, `advanced`
5. `dimension_code` — `body`, `emotion`, `speech`, `tonality`, `eye_contact`, `vocal_projection`, `emotional_expression`, `sentence_flow`, `audience_awareness`
6. `dimension_group` — `competency`, `speech_linguistics`
7. `competency_rating` — `emerging`, `developing`, `secure`, `advanced`
8. `attendance_status` — `present`, `absent`
9. `invitation_status` — `pending`, `accepted`, `expired`, `revoked`
10. `report_status` — `incomplete`, `observation_saved`, `drafting`, `draft_ready`, `needs_edit`, `approved`, `submitted`

### Exactly 22 tables

1. `centres`
2. `accounts`
3. `centre_memberships`
4. `trainer_profiles`
5. `parent_profiles`
6. `students`
7. `parent_student_links`
8. `class_grades`
9. `class_modules`
10. `class_sessions`
11. `enrolments`
12. `class_session_assignments`
13. `attendance`
14. `invitations`
15. `assessment_dimensions`
16. `observations`
17. `observation_ratings`
18. `reports`
19. `report_versions`
20. `report_version_ratings`
21. `report_version_checklist_progress`
22. `report_version_approvals`

### Exactly 13 deterministic seed rows

**One centre:**

| Field | Value |
|---|---|
| code | `ispeak` |
| display name | `iSpeak Academy` |

**Three centre-owned Class Grades:**

| Code | Display name | Sort order |
|---|---|---|
| `beginner` | Beginner | 1 |
| `intermediate` | Intermediate | 2 |
| `advanced` | Advanced | 3 |

**Nine global assessment dimensions:**

| Display name | Group | Sort order |
|---|---|---|
| Body | `competency` | 1 |
| Emotion | `competency` | 2 |
| Speech | `competency` | 3 |
| Tonality | `competency` | 4 |
| Eye Contact | `speech_linguistics` | 5 |
| Vocal Projection | `speech_linguistics` | 6 |
| Emotional Expression | `speech_linguistics` | 7 |
| Sentence Flow | `speech_linguistics` | 8 |
| Audience Awareness | `speech_linguistics` | 9 |

**Total: 1 + 3 + 9 = 13 deterministic seed rows.**

### Seed determinism rule

**Seed UUIDs are fixed literals and identical across every environment.** Reference data is not environment-specific, and a report or observation must mean the same thing in local, staging and production.

**Mismatched pre-existing reference data must fail verification rather than be silently accepted.** A seed insert asserts on the natural key and **errors on divergence**. It must **not** be written as an unconditional upsert that quietly overwrites, nor as a do-nothing conflict clause that quietly tolerates a divergent value. Silent acceptance of divergent reference data is the failure mode this rule exists to prevent.

### Integrity mechanisms in scope for Step 7E

All primary keys, foreign keys, composite same-centre keys, role-pinned composite foreign keys, unique constraints, partial unique indexes, check constraints, defaults and supporting indexes required by A-025 through A-028 are **created in Step 7E**, together with the tables they constrain. The `reports` ↔ `report_versions` mutual reference is resolved by **creation order** — pointer columns first, pointer foreign keys added once both tables exist — **not** by deferrable constraints.

## A-032 — Explicit Step 7E exclusions and non-authorization

The following are **excluded from Step 7E** and belong to the checkpoints named:

| Excluded from Step 7E | Owning checkpoint |
|---|---|
| RLS **policies** and client **grants** | **Step 7G** |
| Synthetic Auth users and domain fixtures | **Step 7F** |
| Audit objects and the hash chain | **Step 7H** |
| Read and mutation **RPCs**, and server-action proof | **Step 7I** |
| Committed **generated database types** | **Step 7J** |
| AI schema | Later AI work |
| Evidence schema | Later evidence work |
| Session-lifecycle enum | Deferred — values not ratified |
| Private helper schema | Introduced only when a helper is authorized |
| **Views, RPCs and helper functions** | Absent from Step 7E entirely |
| UI and Figma implementation | Later UI checkpoints |

**No placeholder or dangling columns.** Step 7E creates **no** AI, evidence, audit, or hash-chain column — including no "reserved for later" column and no foreign key pointing at a table that does not yet exist. A column arrives with the checkpoint that gives it meaning.

**No extension is installed.** PostgreSQL 17's built-in facilities are sufficient for the ratified inventory.

**Non-authorization statement — this is binding:**

- **Step 7E remains blocked and unauthorized after Amendment 003 is staged.**
- **Step 7E remains blocked and unauthorized after Amendment 003 is committed.**
- **This amendment does not authorize migration implementation.** It fixes *what the first migration would contain* if and when the orchestrator authorizes it.
- Ratifying an architecture is **not** the same as authorizing its construction. **Do not write SQL, create a migration file, seed data, or touch the database on the strength of this amendment.**

---

## What Amendment 003 explicitly does NOT change

- **Amendment 001 A-001 through A-013 are untouched.** No Amendment 001 clause is named in the supersession table. The evidence-security safeguards (A-001 gating, A-003 prohibited/permitted exit, A-004 both-direction Parent UAT) remain active in full and apply whenever evidence is implemented.
- **Amendment 002 A-014 through A-024 remain active.** Amendment 003 supplies physical form; it reverses nothing. The one-centre / three-flow boundary, the canonical hierarchy, mandatory nine dimensions, attendance defaults, management administration scope, the identity/invitation model, the single canonical report, Figma Design 2 as UI authority, Supabase-native / no-ORM, and the revised phasing all stand.
- **The core governance rule remains active:** *AI drafts. Trainer approves. Parents and management see only approved reports.*
- **RLS, server-side guards, the append-only hash-chained audit log, guarded compare-and-set transitions, the quality checklist, grounding validation, the synthetic-data-only rule, and Singapore region pinning are unchanged and in force.**
- **ADR-1, ADR-2, ADR-4, ADR-5, ADR-6, ADR-7 and ADR-8 are unchanged.** ADR-3 is narrowed for exactly one read path (A-030) and otherwise stands.
- The four §27 / `CLAUDE.md` §4 non-negotiables are unchanged.
- **Specification v3, Amendment 001 and Amendment 002 remain byte-for-byte unchanged**; this amendment supersedes by reference only.

---

## Effect on the Amendment 002 unresolved register

| # | Item | Status after Amendment 003 |
|---|---|---|
| U-12 | Audit target representation | **Resolved** by **A-029** — polymorphic target with an immutable label snapshot, plus a related-target child table |
| U-16 | Database `GRANT` decisions for new tables | **Resolved** by **A-030** — zero client grants in Step 7E; policy and minimum grant ship together in Step 7G |
| U-17 | Profile ↔ Auth physical-key decision | **Resolved** by **A-025** — nullable unique `auth_user_id` on centre-independent `accounts`; profiles never key to `auth.users` |
| U-18 | Invitation token and expiry implementation | **Resolved** by **A-027** — no secret column exists; stored status plus `expires_at`, evaluated transactionally. **Invitation duration remains an unratified operational default and is recorded below.** |
| U-19 | Enum versus reference table | **Resolved** by **A-026** — enum for closed vocabularies, table for identity/order/label, hybrid for Class Grade and dimensions |
| U-13 | Audit-chain scope | **Still open — Step 7H** |
| U-14 | SHA-256 ratification for the audit hash | **Still open — Step 7H** |
| U-15 | Audit-chain genesis rule | **Still open — Step 7H** |
| U-01 … U-11 | Figma links/fields/assets and the evidence scope, uploader and screens | **Unchanged and still open** |

**Field-level boundary rule.** Step 7E fixes the **relationship model**. A later-supplied field that only adds an attribute to an existing ratified table does **not** reopen Amendment 003. A later-supplied field that **changes a relationship** does, and must be escalated to the orchestrator before any schema work — consistent with A-022.3's blocking classification.

---

## Unresolved items carried by this amendment

These are **recorded, not answered**. Fabricating an answer to any of them is prohibited.

| # | Unresolved item | Blocks |
|---|---|---|
| U-20 | **Invitation duration** (the `expires_at` default value) | Invitation issuance behaviour only — **not** schema design |
| U-21 | **Session-lifecycle vocabulary** — the exact ratified values | The session-lifecycle checkpoint only |
| U-22 | **Restricted `NOLOGIN` `SECURITY DEFINER` function owner** | Deferred hardening only — migration-owner ownership is the accepted MVP default |
| U-23 | **Management bootstrap mechanism** — how the first management membership is created | The bootstrap checkpoint only |
| U-24 | **Management/trainer/parent audit-read capability** | Post-MVP only — no audit-read surface exists in this MVP |

---

*Ratified 2026-08-03. This amendment governs schema architecture and migration boundaries; it is not an implementation authorization. It supersedes only the clauses named in the supersession and clarification table; all other Specification v3 content, all Amendment 001 decisions, and all Amendment 002 decisions remain authoritative and unchanged. Specification v3, Amendment 001 and Amendment 002 are not edited in place. **Step 7E remains blocked, unauthorized and unstarted.***
