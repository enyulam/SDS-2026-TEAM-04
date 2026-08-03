# Step 7F — Synthetic Auth and Domain Fixture Baseline

**Status:** Design ratified by the orchestrator
**Ratification date:** 2026-08-03
**Document class:** development-fixture implementation record — **not** a product-specification amendment

> **This document does not amend Specification v3, Amendment 001, Amendment 002 or Amendment 003.** It records the exact, ratified shape of a **local development fixture** so that the later Step 7F implementation checkpoint has nothing left to invent. Where anything here appears to touch product behaviour, the ratified specification and its amendments govern and this document is subordinate.

## Provenance

| Item | Record |
|---|---|
| **Step 7F0A** | **Complete** — read-only synthetic Auth and domain-fixture design analysis. No file, database, Auth or repository change occurred. |
| **Step 7F0B** | **Complete** — read-only resolution of the remaining implementation mechanics (Auth UUID capability, repeatability rule, credential acquisition, reload and failure recovery). No file, database, Auth or repository change occurred. |
| **Orchestrator confirmation** | **Received (2026-08-03)** for the assessment/report boundary, the delivery mechanism, the caller-supplied Auth UUIDs and explicit account linkage, and the complete set of fixture values. |
| **Step 7F implementation** | **Separately unauthorized.** Ratifying this design is not authorization to build it. **No fixture script, SQL fixture file, seed file, migration, Auth user, password, policy, grant, RPC, application code or test may be created on the strength of this document.** Step 7F requires its own explicit orchestrator authorization. |

---

## 1. Purpose and boundary

**Purpose.** Provide the minimum synthetic dataset needed to prove the three human roles later, without prematurely implementing Step 7G–7J.

- **Local disposable development and verification only.** This fixture exists for the local Supabase stack. It is never applied to a hosted or shared database, and no mechanism in its design is capable of reaching one.
- **Synthetic data only** (ADR-6). No real child, parent, trainer, academy, name, photo or contact detail appears anywhere in it. All addresses use the RFC 6761 reserved `example.test` domain, which cannot resolve.
- **Supports later proof of all three roles:**
  - **Management** — an authenticated identity with an active `management` membership, centre-scoped, able to see the seeded centre and hierarchy.
  - **Trainer** — an authenticated identity with an active `trainer` membership and profile, one assigned Class Session, one enrolled Student, default-Present attendance, and one observation as a work item for later governed RPC testing.
  - **Parent** — an authenticated identity with an active `parent` membership and profile and an active link to the same Student, with **no** submitted report to read, because no submitted report is fabricated.
- **It does not define production onboarding.** It is **not** an invitation flow, **not** an invitation-acceptance implementation, and **not** a Management bootstrap mechanism.
- **N-4 / U-23 — the production management-bootstrap mechanism — remains UNRESOLVED.** Provisioning a fixture management identity does not constitute, design or resolve it, and must never later be cited as having done so. Amendment 003 A-027 is unchanged: "management bootstrap remains separately governed — the first management membership is not created by an ordinary invitation flow, and its mechanism is not ratified here."

---

## 2. Exact synthetic Auth identities

Exactly three human identities. No fourth identity, and no Student identity.

### Management

| Field | Value |
|---|---|
| Display name | `Fixture Manager One` |
| Email | `management.fixture@example.test` |
| Auth UUID | `d0000000-0000-4000-8000-000000000001` |
| Account UUID | `c0000000-0000-4000-8000-000000000001` |
| Membership UUID | `c1000000-0000-4000-8000-000000000001` |
| Role | `management` |
| Account status | `active` |
| Membership status | `active` |
| Role profile | **None** — there is deliberately no `management_profiles` table |

### Trainer

| Field | Value |
|---|---|
| Display name | `Fixture Trainer One` |
| Email | `trainer.fixture@example.test` |
| Auth UUID | `d0000000-0000-4000-8000-000000000002` |
| Account UUID | `c0000000-0000-4000-8000-000000000002` |
| Membership UUID | `c1000000-0000-4000-8000-000000000002` |
| Role | `trainer` |
| Account status | `active` |
| Membership status | `active` |
| Role profile | **`trainer_profiles`**, keyed by the membership UUID |

### Parent

| Field | Value |
|---|---|
| Display name | `Fixture Parent One` |
| Email | `parent.fixture@example.test` |
| Auth UUID | `d0000000-0000-4000-8000-000000000003` |
| Account UUID | `c0000000-0000-4000-8000-000000000003` |
| Membership UUID | `c1000000-0000-4000-8000-000000000003` |
| Role | `parent` |
| Account status | `active` |
| Membership status | `active` |
| Role profile | **`parent_profiles`**, keyed by the membership UUID |

### Identity rules

- **All three accounts are `active`** with `deactivated_at` NULL, and **all three memberships are `active`** with `activated_at` set and `deactivated_at` NULL.
- **Trainer and Parent receive their role profiles**; each profile is pinned to the correct role by the composite foreign key `(membership_id, centre_id, membership_role)` → `centre_memberships (id, centre_id, role)`.
- **Management has no profile table.** A-025 places role authority on the membership row itself, and management needs no role-extension attributes.
- **The Student has no Auth identity.** `students` carries no `auth_user_id` and no account linkage of any kind, so a student login is structurally impossible rather than merely unimplemented.
- **Auth UUIDs are caller-supplied through the supported Auth Admin API.** `AdminUserAttributes.id` is a documented, type-supported member of the installed `@supabase/auth-js@2.110.8` public interface, and `createUser` forwards the request body verbatim to `POST /admin/users`. This is the ordinary admin path — **not** a workaround, **not** a cast, and **not** direct SQL.
- **The runtime-generated Auth UUID fallback is withdrawn.** The Step 7F0A "capture the generated UUID after creation" branch, and the volatile-value-excluding checksum that accompanied it, are no longer part of this design. There is exactly one implementation.
- **Any returned Auth UUID mismatch must abort, not adapt.** Immediately after each create call the loader asserts that the returned `id` equals its ratified literal. On any mismatch it aborts the entire load, compensates (§8), and stops for orchestrator instruction. It must not fall back, must not adjust the checksum, and must not proceed with a non-ratified identifier.

---

## 3. Exact domain-fixture inventory

**Total footprint: 3 Auth users and 25 application-domain rows.**

### Core rows (15)

| Count | Table |
|---|---|
| 3 | `accounts` |
| 3 | `centre_memberships` |
| 1 | `trainer_profiles` |
| 1 | `parent_profiles` |
| 1 | `students` |
| 1 | `parent_student_links` |
| 1 | `class_modules` |
| 1 | `class_sessions` |
| 1 | `enrolments` |
| 1 | `class_session_assignments` |
| 1 | `attendance` |

### Assessment rows (10)

| Count | Table |
|---|---|
| 1 | `observations` |
| 9 | `observation_ratings` |

### Existing Step 7E seed rows referenced (never re-created, never modified)

| Entity | UUID | Values |
|---|---|---|
| Centre | `b0000000-0000-4000-8000-000000000001` | `ispeak` / `iSpeak Academy` |
| Class Grade | `b1000000-0000-4000-8000-000000000001` | `beginner` |

**Class Grade selection rationale.** `beginner` is `sort_order` 1, the entry point of the ratified progression. A synthetic student placed in `advanced` would imply a history of prior assessment that no fixture record supports, and choosing the lowest-ordered grade keeps `intermediate` and `advanced` purely additive later.

### Exact domain values and UUIDs

**Student**

| Field | Value |
|---|---|
| UUID | `c2000000-0000-4000-8000-000000000001` |
| Name | `Fixture Student One` |
| Active | true |
| Centre | `b0000000-0000-4000-8000-000000000001` |

**Parent–Student link**

| Field | Value |
|---|---|
| UUID | `c3000000-0000-4000-8000-000000000001` |
| Parent membership | `c1000000-0000-4000-8000-000000000003` |
| Student | `c2000000-0000-4000-8000-000000000001` |
| Active | true |

**Class Module**

| Field | Value |
|---|---|
| UUID | `c4000000-0000-4000-8000-000000000001` |
| Title | `Beginner Public Speaking — Fixture Module A` |
| Class Grade | `b1000000-0000-4000-8000-000000000001` |
| Active | true |

**Class Session**

| Field | Value |
|---|---|
| UUID | `c5000000-0000-4000-8000-000000000001` |
| Class Module | `c4000000-0000-4000-8000-000000000001` |
| Date | `2026-02-03` |
| Start | `10:00` |
| End | `11:00` |

The session date is a **fixed literal, never derived from the current date**, and deliberately sits in the **past**, because a future-dated session would be blocked by the future-session lock once the Step 7I / Phase 1 transitions exist — which would make the trainer fixture unusable for the work it exists to support.

**Enrolment**

| Field | Value |
|---|---|
| UUID | `c6000000-0000-4000-8000-000000000001` |
| Class Module | `c4000000-0000-4000-8000-000000000001` |
| Student | `c2000000-0000-4000-8000-000000000001` |
| Active | true |

Enrolment is at **Class Module** level (A-016).

**Trainer assignment**

| Field | Value |
|---|---|
| UUID | `c7000000-0000-4000-8000-000000000001` |
| Class Session | `c5000000-0000-4000-8000-000000000001` |
| Trainer membership | `c1000000-0000-4000-8000-000000000002` |
| Active | true |

Trainer assignment is authoritative at **Class Session** level (A-016), and at most one assignment may be active per session.

**Attendance**

| Field | Value |
|---|---|
| UUID | `c8000000-0000-4000-8000-000000000001` |
| Class Session | `c5000000-0000-4000-8000-000000000001` |
| Class Module | `c4000000-0000-4000-8000-000000000001` |
| Student | `c2000000-0000-4000-8000-000000000001` |
| Enrolment | `c6000000-0000-4000-8000-000000000001` |
| Status | `present` |
| `recorded_by_membership_id` | **NULL** |
| `recorded_by_role` | **NULL** |

Both recorder columns are NULL **because this row represents default roster initialization rather than a trainer action**. A-018 initialises each enrolled student `Present` by default, before any trainer touches the roster; naming a trainer as recorder would fabricate an action that never occurred. The NULL pair satisfies `attendance_recorded_by_pair_chk`.

**Observation**

| Field | Value |
|---|---|
| UUID | `c9000000-0000-4000-8000-000000000001` |
| Class Session | `c5000000-0000-4000-8000-000000000001` |
| Class Module | `c4000000-0000-4000-8000-000000000001` |
| Student | `c2000000-0000-4000-8000-000000000001` |
| Enrolment | `c6000000-0000-4000-8000-000000000001` |
| Trainer membership | `c1000000-0000-4000-8000-000000000002` |
| `lock_version` | `1` |
| `strength_chips` / `focus_chips` | empty defaults (`'{}'`) |
| `observation_notes` / `follow_up_notes` / `term_evidence_notes` | **NULL** |

`lock_version` remains at its default `1`, untouched by any compare-and-set, because no governed transition has been performed. Chips and free-text notes are left empty because no proof requires them and inventing trainer prose would be fabrication. `follow_up_notes` is specifically NULL because the previous-focus continuity behaviour requires a **second** session that this minimal baseline does not create.

### Insertion order required by foreign keys

```
0.  (pre-existing Step 7E seed: centres, class_grades, assessment_dimensions)
0b. auth.users x 3                    (must precede accounts, since auth_user_id is populated inline)
1.  accounts x 3
2.  centre_memberships x 3
3.  trainer_profiles x 1
4.  parent_profiles x 1
5.  students x 1
6.  parent_student_links x 1
7.  class_modules x 1
8.  class_sessions x 1
9.  enrolments x 1
10. class_session_assignments x 1
11. attendance x 1
12. observations x 1
13. observation_ratings x 9
```

Steps 3–5 are order-independent among themselves; the sequence above is one valid linearisation.

### Ratified fixed timestamp literals (added 2026-08-03, Step 7F1B)

§8 already ratifies the **rule** that every fixture timestamp is a fixed literal. This subsection records the **exact literals**, so the value — not only the rule — is ratified and auditable.

**Four ratified groups:**

| Group | Instant | Applies to |
|---|---|---|
| **T1** | `2026-01-05T09:00:00+08:00` | identity, membership, role-profile and Student lifecycle timestamps |
| **T2** | `2026-01-12T09:00:00+08:00` | Parent–Student link, Class Module, Class Session record, enrolment and trainer-assignment lifecycle timestamps |
| **T3** | `2026-02-03T10:00:00+08:00` | attendance lifecycle timestamps |
| **T4** | `2026-02-03T11:05:00+08:00` | observation and observation-rating lifecycle timestamps |

**Complete table-and-column matrix — all 37 timestamp/date/time columns across the 13 fixture tables:**

| # | Table | Column | Type | Literal |
|---|---|---|---|---|
| 1 | `accounts` | `created_at` | `timestamptz` | **T1** |
| 2 | `accounts` | `updated_at` | `timestamptz` | **T1** |
| 3 | `accounts` | `deactivated_at` | `timestamptz` | `NULL` |
| 4 | `centre_memberships` | `created_at` | `timestamptz` | **T1** |
| 5 | `centre_memberships` | `updated_at` | `timestamptz` | **T1** |
| 6 | `centre_memberships` | `activated_at` | `timestamptz` | **T1** |
| 7 | `centre_memberships` | `deactivated_at` | `timestamptz` | `NULL` |
| 8 | `trainer_profiles` | `created_at` | `timestamptz` | **T1** |
| 9 | `trainer_profiles` | `updated_at` | `timestamptz` | **T1** |
| 10 | `parent_profiles` | `created_at` | `timestamptz` | **T1** |
| 11 | `parent_profiles` | `updated_at` | `timestamptz` | **T1** |
| 12 | `students` | `created_at` | `timestamptz` | **T1** |
| 13 | `students` | `updated_at` | `timestamptz` | **T1** |
| 14 | `students` | `deactivated_at` | `timestamptz` | `NULL` |
| 15 | `parent_student_links` | `linked_at` | `timestamptz` | **T2** |
| 16 | `parent_student_links` | `unlinked_at` | `timestamptz` | `NULL` |
| 17 | `parent_student_links` | `created_at` | `timestamptz` | **T2** |
| 18 | `class_modules` | `created_at` | `timestamptz` | **T2** |
| 19 | `class_modules` | `updated_at` | `timestamptz` | **T2** |
| 20 | `class_modules` | `deactivated_at` | `timestamptz` | `NULL` |
| 21 | `class_sessions` | `session_date` | `date` | `2026-02-03` |
| 22 | `class_sessions` | `starts_at` | `time` | `10:00` |
| 23 | `class_sessions` | `ends_at` | `time` | `11:00` |
| 24 | `class_sessions` | `created_at` | `timestamptz` | **T2** |
| 25 | `class_sessions` | `updated_at` | `timestamptz` | **T2** |
| 26 | `enrolments` | `enrolled_at` | `timestamptz` | **T2** |
| 27 | `enrolments` | `withdrawn_at` | `timestamptz` | `NULL` |
| 28 | `enrolments` | `created_at` | `timestamptz` | **T2** |
| 29 | `class_session_assignments` | `assigned_at` | `timestamptz` | **T2** |
| 30 | `class_session_assignments` | `unassigned_at` | `timestamptz` | `NULL` |
| 31 | `class_session_assignments` | `created_at` | `timestamptz` | **T2** |
| 32 | `attendance` | `created_at` | `timestamptz` | **T3** |
| 33 | `attendance` | `updated_at` | `timestamptz` | **T3** |
| 34 | `observations` | `created_at` | `timestamptz` | **T4** |
| 35 | `observations` | `updated_at` | `timestamptz` | **T4** |
| 36 | `observation_ratings` | `created_at` | `timestamptz` | **T4** (all nine rows) |
| 37 | `observation_ratings` | `updated_at` | `timestamptz` | **T4** (all nine rows) |

**Every timestamp-bearing fixture column is accounted for**: 30 columns carry a ratified group literal, 7 nullable lifecycle-terminator columns are explicitly `NULL`, and the 3 non-`timestamptz` Class Session columns carry their own ratified date and time literals. **No fixture timestamp falls outside these four groups.**

**Offset notation.** The SQL writes these as `2026-01-05 09:00:00+08` and so on. `+08` and `+08:00` denote the **same instant** in PostgreSQL; the ISO-8601 form above and the SQL form are equivalent, not divergent.

**Chronological and constraint consistency.** T1 (identities exist) → T2 (hierarchy and relationships created) → T3 (roster initialised on the session date) → T4 (observation captured five minutes after the session ends at `11:00`). This satisfies every lifecycle CHECK without any reference to `now()`: `centre_memberships_activated_after_created_chk` holds because `activated_at = created_at = T1`; the `*_deactivated_after_*`, `*_unlinked_after_linked`, `*_withdrawn_after_enrolled` and `*_unassigned_after_assigned` checks hold vacuously because each terminator is `NULL`; and `class_sessions_time_order_chk` holds because `11:00 > 10:00`.

**Why this matters.** Because no value is derived from `now()`, two loads separated by a clean `supabase db reset --local` produce byte-identical rows, which is what makes the canonical SHA-256 checksum an equality test rather than a similarity judgement.

---

## 4. Exact nine mixed ratings

One row per dimension, all nine present. All nine dimensions are mandatory for every assessment (A-017); nine is the **valid** state, not a shortcut.

| Rating row UUID | Dimension | Rating |
|---|---|---|
| `ca000000-0000-4000-8000-000000000001` | `body` | `secure` |
| `ca000000-0000-4000-8000-000000000002` | `emotion` | `developing` |
| `ca000000-0000-4000-8000-000000000003` | `speech` | `emerging` |
| `ca000000-0000-4000-8000-000000000004` | `tonality` | `secure` |
| `ca000000-0000-4000-8000-000000000005` | `eye_contact` | `advanced` |
| `ca000000-0000-4000-8000-000000000006` | `vocal_projection` | `developing` |
| `ca000000-0000-4000-8000-000000000007` | `emotional_expression` | `emerging` |
| `ca000000-0000-4000-8000-000000000008` | `sentence_flow` | `secure` |
| `ca000000-0000-4000-8000-000000000009` | `audience_awareness` | `advanced` |

**This set deliberately spans all four rating levels, including exactly two `emerging` and exactly two `advanced` ratings.** The mixture is not decorative: `CLAUDE.md` §11 requires "at least one observation with a deliberately mixed rating set (some `Emerging`, some `Advanced`) specifically to exercise the grounding-validation contradiction test in persona §3.4". Two ratings at each polarity extreme guarantee a genuine contradiction case is available.

---

## 5. Assessment and report boundary — Option B (ratified)

**Ratified: the fixture stops at the observation. The report lifecycle is not entered.**

| Table | Ratified state |
|---|---|
| `observations` | **1 row** |
| `observation_ratings` | **9 rows** |
| `reports` | **0 rows** |
| `report_versions` | **0 rows** |
| `report_version_ratings` | **0 rows** |
| `report_version_checklist_progress` | **0 rows** |
| `report_version_approvals` | **0 rows** |
| `invitations` | **0 rows** |

**No report lifecycle, approval, publication, invitation-acceptance or Management-bootstrap transition is fabricated.**

**Why the line falls exactly here.** An observation is **captured factual data**: `observations` has no status column, no approval, and no publication metadata, so nothing about the row claims a workflow step occurred. The report aggregate is where governance begins — status, versions, freeze, approval evidence, canonical pointers — and everything from `reports` onward is Step 7I's property. The governing principle is: **create fixture rows only where every required field is ratified and no lifecycle claim is fabricated.** Observations pass both tests; reports and invitations fail the second.

**Why the report status is never implied.** `observation_saved` is the report status that would signal the first governed transition. Because **no `reports` row exists**, nothing anywhere asserts that transition happened, and `report_version_approvals` being empty leaves approval and publication provably unperformed.

**Why no invitation row exists.** `invitations.expires_at` is `NOT NULL` while the invitation duration (**N-1 / U-20**) is explicitly unresolved, so any value would invent an unratified default. A `pending` row would additionally occupy the partial-unique pending slot for both the membership and the `(centre, email)` pair, which A-027 requires the real flow to claim — the fixture would actively obstruct the architecture it exists to preserve. An `accepted` row would assert an acceptance event that never happened.

**Ownership of these rows later.** Step 7G may **read** the observation and its ratings for policy proofs but must not mutate them. Step 7H may attach audit events. **Step 7I owns them** and may advance, replace or require them removed for a clean transition test; `--reload` provides that clean baseline in one command.

---

## 6. Delivery mechanism (ratified)

| Artefact | Path | Tracked |
|---|---|---|
| Node ESM loader | `scripts/fixtures/load-local-fixtures.mjs` | Yes — contains no secret |
| Static transactional SQL | `scripts/fixtures/local_fixtures.sql` | Yes — contains no secret |
| Verification and negative-test SQL | `scripts/fixtures/verify-local-fixtures.sql` | Yes — contains no secret |
| `package.json` | one future `scripts` entry | Yes |

**Ratified constraints:**

- **No new dependency.** `supabase@2.109.1` is already a devDependency and `@supabase/supabase-js@2.110.8` is already a dependency. The only `package.json` change is one script entry.
- **No `supabase/seed.sql`.** `config.toml` sets `[db.seed] enabled = true` with `sql_paths = ["./seed.sql"]`, so the CLI would auto-run such a file wherever it decides seeding applies — including `db reset --linked`. That path from a tracked file to a hosted database stays closed.
- **No second migration.** Fixtures must never enter production migration history.
- **No direct insertion into `auth.users`.**
- **No password hash** — `password_hash` is offered by the admin API and is deliberately not used.
- **No invitation row.**

**Execution channels.** The domain SQL runs through the **local database container's own `psql`** (`docker exec` into `supabase_db_best-coach-mvp`, the deterministic container name derived from `project_id = "best-coach-mvp"` in `config.toml`). The Auth users are created through the **local Auth Admin API**. The CLI is resolved from `node_modules/.bin`, never from a global installation, so the pinned version is guaranteed.

**Why a local script rather than the CLI.** The CLI's `db` subcommands are exactly `diff`, `dump`, `push`, `pull`, `reset` and `lint` — there is **no** local "execute this SQL file" command, and three of those six operate on the **remote** database. The loader must never invoke `dump`, `push` or `pull`.

**File authoring note.** The project `package.json` has no `"type"` field, so the package is CommonJS; the loader is authored as `.mjs` to use ESM imports.

**These files do not exist and must not be created until Step 7F implementation is separately authorized.**

---

## 7. Credential rule (absolute)

- **Passwords are entered only through no-echo interactive stdin** in an operator-controlled local terminal (`process.stdin.setRawMode(true)`), one prompt per identity. Missing input aborts the run.
- **No password may be requested or transmitted in chat**, in either direction, at any time.
- **There is no environment-variable password path.** This is not a preference — on Windows PowerShell, assigning a secret to an environment variable at an interactive prompt causes PSReadLine to write it in plaintext to `ConsoleHost_history.txt`, manufacturing exactly the persistent on-disk credential artefact this rule forbids.
- **No password, token, key or credential may be written to any tracked or untracked file**, including `.env.local`, a scratch file, a mapping file or a log.
- **No credential-bearing output may be printed or logged**, in a console, a report, an error message or a progress record.
- **No pattern-based redaction.** Filtering is unreliable — the Step 7E2A incident occurred because a `Key: value` filter did not match the CLI's JSON `"KEY": "value"` block. The design instead guarantees that no credential-bearing stream is ever rendered in the first place.
- **The local API URL and service-role key are captured internally** from the project-local CLI's structured output (`supabase status -o json`) **into process memory only**, selected by field name, never serialized, never copied, never echoed. Field names are confirmed by inspecting object keys only; key names are not secrets, values are never read outside the two selected fields.
- **Stdout and stderr from credential-bearing commands remain fully captured and unrendered.** The CLI is spawned with both streams piped — stderr specifically so a CLI error that might embed a key can never reach the console. Captured stderr is **never** interpolated into an error message; failures throw a reconstructed error carrying only a category and an exit code.
- **The loader aborts unless all of the following hold:** the captured API URL host is loopback (`127.0.0.1`, `localhost` or `::1`); its port equals `[api] port` in `config.toml` (**54321**); the database target is the local container on `[db] port` (**54322**); and `supabase/.temp/project-ref` **does not exist**. No hosted URL, project reference, `--linked` flag or `supabase login` appears anywhere in the design.

---

## 8. Determinism and recovery

### Determinism

- **Every Auth and domain UUID is a fixed literal**, ratified in advance. No identifier anywhere in the fixture is runtime-generated, and no mapping file of Auth UUIDs is ever written — tracked or untracked — because none is needed.
- **Every fixture timestamp is a fixed literal**, ordered so that every lifecycle CHECK constraint is satisfied without reference to `now()`.
- **The acceptance checksum covers all fixture columns, including `accounts.auth_user_id`.** Two loads separated by a clean `supabase db reset --local` must therefore produce **byte-identical** checksums. Repeatability is an equality test, not a similarity judgement.

### Load behaviour

- **Clean load.** Preflight confirms zero rows across all 13 fixture tables for any reserved UUID **and** zero users for the three reserved emails. Then: create the three Auth users with pinned ids, assert each returned id, run the single-transaction domain SQL with `auth_user_id` populated inline, and verify.
- **Duplicate load without `--reload` fails.** If any reserved fixture UUID or any reserved email is already present, the loader aborts with a non-zero exit, naming the artefact classes found as **counts only**. It does not partially load, does not upsert, does not skip-existing and does not top up. This mirrors the A-031 "fail, never absorb" discipline applied to fixtures.
- **`--reload`** deletes the domain rows, asserts the Step 7E seed is intact, deletes the matched Auth users, re-runs preflight, performs a clean load and verifies. Its end state is identical to a clean load, so it is idempotent.

### Deletion safety

- **`--reload` deletes only exact fixture UUIDs and exact fixture emails.** Every statement is `DELETE FROM <table> WHERE id IN (<explicit fixed literal fixture UUIDs>)` — never a bare `DELETE FROM`, never a `WHERE centre_id = ...`, never a `TRUNCATE`, never a cascade from above.
- **Step 7E seed rows are never in the deletion set.** `centres`, `class_grades` and `assessment_dimensions` appear in **no** `DELETE` statement at all, and the transaction asserts `centres = 1`, `class_grades = 3` and `assessment_dimensions = 9` with their exact ratified UUIDs before committing, rolling back on any divergence.
- **Domain deletion is reverse-FK and transactional** — one `BEGIN ... COMMIT` containing all thirteen statements in this order, which is mandatory rather than stylistic because every inter-table foreign key in the fixture graph is `ON DELETE RESTRICT`:

  ```
  1.  observation_ratings          8.  parent_student_links
  2.  observations                 9.  students
  3.  attendance                  10.  parent_profiles
  4.  class_session_assignments   11.  trainer_profiles
  5.  enrolments                  12.  centre_memberships
  6.  class_sessions              13.  accounts
  7.  class_modules
  ```

- **Auth deletion uses the Auth Admin API with exact reserved-email matching.** Users are located by paging `admin.listUsers({ page, perPage: 1000 })` until exhausted and selecting those whose email, lower-cased and trimmed, is **exactly equal** to one of the three reserved addresses. Deletion is `admin.deleteUser(id)` with `shouldSoftDelete` left at its default `false` — a hard delete, because a soft delete would retain the row and keep the email occupied, breaking the next clean load. No SQL ever touches `auth.users`.
- **Matching is by email, never by remembered UUID**, even though the UUIDs are deterministic. This also catches a stale user created under an earlier scheme; where a matched user's id differs from its ratified literal, the loader still removes it and records the discrepancy as a count, printing no value.
- **No non-fixture user may be deleted.** Matching is exact, full-string, case-normalized equality — no `LIKE`, no prefix match, no `@example.test` domain-suffix match. The matched set is asserted to be **at most 3** and aborts if larger. `deleteUser` is called only with ids drawn from that set. Total user count is captured before and after as a count-only check.

### Partial-failure compensation

Auth creation cannot join the database transaction, because it is an HTTP API in a different subsystem. The design is **create-then-compensate**:

1. The three Auth users are created first; their ids are held in memory.
2. The domain SQL runs as one `BEGIN ... COMMIT`, so any failure rolls the whole thing back — zero domain rows, but three orphan Auth users.
3. The loader catches this and **immediately compensates**, deleting those three users and restoring the exact pre-run state. The run exits non-zero.
4. If the compensating delete also fails (Auth unreachable), the loader exits non-zero stating that three orphan Auth users remain and that the recovery action is **`--reload`**, which finds them by email and removes them.

The result is an at-most-once, self-healing load with **no persisted state of any kind**, and no situation in which manual `auth.users` SQL is ever required or permitted.

---

## 9. Required future verification

The Step 7F implementation checkpoint is not acceptable without the following proofs.

### Positive proofs

1. Exactly **three** local Auth users, with exactly the three reserved `example.test` addresses.
2. Exactly **three** linked application accounts — all `status = 'active'`, all `auth_user_id` NOT NULL, each matching a distinct Auth user, each equal to its ratified `d0000000-...` literal.
3. Exactly **three** active centre memberships, all in the seeded centre, with **one role each** (`management`, `trainer`, `parent`), `activated_at` NOT NULL and `deactivated_at` NULL.
4. Exactly **one** active `management` membership in the centre.
5. `trainer_profiles` = 1 keyed to the trainer membership; `parent_profiles` = 1 keyed to the parent membership; **no** `management_profiles` relation exists.
6. **No Student Auth linkage** — `students` has no column named `auth_user_id` or `account_id` in `information_schema.columns`, and no row references `auth.users` by any path.
7. **Same-centre consistency** — every fixture row's `centre_id` is the seeded centre; zero rows disagree across any composite foreign key.
8. Exact hierarchy and relationship rows: 1 student; 1 active parent–student link; 1 Class Module; 1 Class Session (`2026-02-03`, 10:00–11:00); 1 active enrolment; 1 active trainer assignment.
9. Exactly **one** attendance row, `status = 'present'`, both recorder columns NULL.
10. Exactly **one** observation with `lock_version = 1`, and exactly **nine** observation ratings — one per dimension, spanning at least two polarity bands and including at least one `emerging` and at least one `advanced`.
11. **`reports`, `report_versions`, `report_version_ratings`, `report_version_checklist_progress`, `report_version_approvals` and `invitations` all at zero rows.**
12. **No duplicate active relationship** — each partial unique index has exactly one qualifying row.
13. **Policies and client grants remain zero** — `pg_policies` = 0 for all 22 tables, and `has_table_privilege` false for `PUBLIC`, `anon`, `authenticated` and `service_role` across all seven privilege types on all 22 tables, unchanged from Step 7E.
14. Migration history unchanged — exactly one applied migration, `20260803034500`.
15. **Deterministic reload checksum** — `supabase db reset --local`, then reload, produces identical row counts **and** an identical checksum across all fixture columns including `accounts.auth_user_id`.
16. **No hosted operation** — `supabase/.temp/project-ref` absent; no link, no `--linked`, no hosted URL, no login.
17. **Credential-bearing output suppressed** at source, with no pattern-based redaction anywhere.
18. **Local stack shut down afterward**, verified at zero containers, and the repository verified clean apart from the intended new files at their staging checkpoint.

### Negative proofs

Each must **fail**, and each names the object that must reject it:

| Attempt | Rejected by | Expected |
|---|---|---|
| Duplicate **active** account email | `accounts_one_active_per_normalized_email_idx` | `23505` |
| **Second active `management` membership** in the centre | `centre_memberships_one_active_management_per_centre_idx` | `23505` |
| **Cross-centre relationship** — `parent_student_links` whose `centre_id` disagrees with the student's | `parent_student_links_student_fk` composite `(student_id, centre_id)` | `23503` |
| **Parent membership used as Trainer** — `class_session_assignments` with the parent membership as trainer | `class_session_assignments_trainer_fk` composite `(id, centre_id, role)` | `23503` |
| **Student with Auth linkage** — `UPDATE public.students SET auth_user_id = ...` | column **does not exist** | `42703` |
| **Second active trainer assignment** for the same session | `class_session_assignments_one_active_per_session_idx` | `23505` |

The Student check is the strongest of the set: it does not prove a rule is enforced, it proves the rule is **unrepresentable**.

### Residue-free negative testing

- The entire negative suite runs inside **one explicit transaction that ends in `ROLLBACK`** — never `COMMIT`.
- Each attempt is wrapped in a PL/pgSQL `DO` block with an `EXCEPTION` handler. A PL/pgSQL exception block is an implicit savepoint, so a caught failure does not poison the surrounding transaction.
- The pass condition is **inverted**: the handler records a pass, and falling through without an exception must `RAISE EXCEPTION` — an attempt that unexpectedly **succeeds** is the real failure being hunted.
- Any helper row a check needs is created **inside** the rolled-back transaction, never outside it.
- **After `ROLLBACK`, every positive row count is re-run and must be unchanged, and the fixture checksum must still match.** That is the proof of zero residue — not the intent to roll back. Policy and privilege counts are re-confirmed at zero so the negative suite is proven not to have widened access.

---

## 10. Deliberate subset of the broader fixture shape

- **This ratified Step 7F baseline overrides the larger general fixture shape in `CLAUDE.md` §11 only for the current Phase 0 fixture checkpoint.** §11 opens with "use this shape everywhere a fixture is needed, **unless told otherwise**"; the orchestrator has told otherwise for Step 7F, and this document is that instruction in durable form.
- **The broader dataset remains a later additive fixture expansion** — two trainers, two Class Modules, three to four enrolled students per module, two parent accounts each linked to exactly one child, plus a **second Class Session** to exercise previous-focus continuity.
- **That expansion is required before the relevant Phase 1 exit proofs** can be demonstrated: the grounding-validation contradiction test (persona §3.4) and the session-to-session follow-up continuity proof both need more than this minimal baseline provides.
- **The broader fixture requirement is deferred, not deleted and not contradicted.** `CLAUDE.md` §11's fixture shape stands in full for every checkpoint after this one, and nothing in this document weakens it.

---

*Ratified 2026-08-03. This document records a local development-fixture design; it is not a specification amendment and grants no implementation authorization. **Step 7F remains unauthorized and unstarted**, and requires a separate explicit orchestrator authorization before any fixture script, SQL file, Auth user or database operation may be created. **N-4 / U-23, the production management-bootstrap mechanism, remains unresolved.***
