# STATUS — B.E.S.T Coach MVP

> Read this first at the start of every session (with the recent `BUILD_NOTES.md` entries). Update it last, at every accepted stopping point. Permanent continuity document (Amendment 001 A-008).

_Last updated: 2026-08-04 (Step 7H1A4 — **the Step 7H audit-chain design phase is complete and ratified**. The Step 7G acceptance record was committed as `6ba6159`; the audit-chain contract **A-1 … A-6** was reconciled (7H1A), adversarially reviewed and corrected (7H1A2), and committed as `3e479b6` — `docs/plan/STEP_7H_AUDIT_CHAIN_BASELINE.md` (7H1A3). This progress-ratification change set is **staged, commit pending**. Steps 7D, 7E0, 7E0D, 7E, 7F and 7G remain completed and accepted; **no audit-chain SQL exists**; the next bounded checkpoint may author and stage **one** Step 7H audit-chain migration **for static review only** and must stop before local application or commit; **Step 7I remains unstarted**)._

---

## Current project state

- **Project:** B.E.S.T Coach MVP
- **Lifecycle stage:** Phase 0 in progress — client boundaries accepted, the **first governed SQL migration delivered**, the **deterministic local synthetic fixture delivered and runtime-accepted**, the **relationship-authorization layer (read policies + minimum matching grants) delivered and runtime-accepted**, and the **audit-chain design baseline (A-1 … A-6) ratified and committed**; assessment writes, report lifecycle, RPCs, audit-chain SQL and generated types **not started**
- **Migration/tooling status:** Step 6 local tooling **completed and accepted**
- **Current checkpoint:** **Step 7H1A4 — Record and commit the audit-chain design ratification (documentation only)**
- **Checkpoint status:** **Staged — progress-ratification commit pending.** Nothing in this checkpoint is self-accepted.
- **Step 7D:** **Completed and fully accepted** (7D1 → 7D4 and overall)
- **Step 7E0:** **Completed and accepted (2026-07-30)** — substantive governance commit **`722dcb8`**; sub-checkpoints **7E0A** (change set) and **7E0B** (commit) both Completed · Accepted; its acceptance record committed at **`6551d37`** (Step 7E0C / 7E0C2)
- **Step 7E0D1 — read-only schema-critical analysis:** **Completed and accepted (2026-08-03)** — Decisions A – G analysed with binding orchestrator corrections; **no file, SQL, schema, Auth, runtime or repository change occurred**
- **Step 7E0D — Schema-critical decision ratification:** **Completed and accepted (2026-08-03)** — substantive ratification commit **`b367475`**; sub-checkpoints **7E0D1**, **7E0D2A** (change set) and **7E0D2B** (commit) all Completed · Accepted
- **Amendment 002:** **Active** (A-014 … A-024), committed at `722dcb8`
- **Amendment 003:** **Active** (**A-025 … A-032**), committed at `b367475` — schema architecture and migration boundaries; **clarifies rather than reverses Amendment 002**, names no Amendment 001 clause, and is **not an implementation authorization**
- **Step 7E — first governed SQL migration:** **Completed and accepted (2026-08-03)** — substantive migration commit **`252ef9b`**; sub-checkpoints **7E1A** (author/stage), **7E1B** (correct/restage), **7E2A** (local apply + catalogue verification) and **7E2B** (commit) all Completed · Accepted. Authorization was **bounded to Step 7E alone**.
- **Committed migration:** `supabase/migrations/20260803034500_step_7e_governed_core.sql` · version **`20260803034500`** · SHA-256 `422be2850c6913ca040bc54b90902df8eaaf35d66492230553e65ab1b3f8db54` · 66,809 bytes · 1,209 lines
- **Delivered and locally verified boundary:** **exactly 10 enums, 22 tables, 13 deterministic seed rows, 44 foreign keys and 43 explicit indexes** (8 partial-unique + 35 supporting); no view, RPC, helper function, trigger, extension, additional schema or placeholder column
- **Delivered centre seed identity:** code **`ispeak`** · display name **`iSpeak Academy`** — seeded in the **local disposable database only**
- **Local database application and lint: PASSED** — `supabase db reset --local` exit **0**, migration recorded **exactly once**; lint returned **zero errors and zero warnings** (including `--fail-on warning`)
- **Access posture verified in the catalogue:** **RLS enabled on all 22 tables**, **zero policies**, and **zero effective client table privileges** for `PUBLIC`, `anon`, `authenticated` and `service_role` across all seven privilege types
- **No hosted database was accessed** at any point — no link, no project reference, no hosted URL; the project has never been linked
- **P-1 default-ACL review: RESOLVED (Step 7G1A, 2026-08-03).** All migration objects are created by **`postgres`**; all 22 Step 7E tables are `postgres`-owned; the `postgres` public default ACLs are **hardened** (owner-only for tables, sequences and functions) and grant no automatic client access. **`supabase_admin` retains broad public default ACLs** for objects it creates — they never applied because every project migration executes as `postgres`, and the Step 7G migration carries a **fail-closed `current_user = 'postgres'` guard** before any object is created. Both default-ACL sets were verified **unchanged after application**. **Any future object creation under `supabase_admin` remains a privilege event requiring re-audit.**
- **Step 7F design (7F0A … 7F0D): Completed and ratified (2026-08-03)** — committed as `936cf4e`; the ratified record is `docs/plan/STEP_7F_SYNTHETIC_FIXTURE_BASELINE.md`
- **Step 7F implementation — deterministic local synthetic fixture:** **Completed and runtime-accepted (2026-08-03)** — substantive implementation commit **`e197f91`**; sub-checkpoints **7F1A** (author/stage), **7F1B** (timestamp reconciliation + static audit), **7F1C** (blocked: no interactive TTY), **7F1C1** (Windows password handler), **7F1C2** (domain SQL operation guard), **7F1C3** (negative tests N2/N3/N4 + loader exit path), **7F1D** (independent runtime verification) and **7F1E** (commit) all Completed · Accepted. Authorization was **bounded to Step 7F alone**.
- **Delivered and verified Step 7F fixture footprint:** **3 synthetic Auth users** · **25 application-domain rows** (15 core + 10 assessment) · **28 canonical checksum rows** · **1 observation** · **9 mixed ratings** · **0 reports** · **0 report versions** · **0 report-version ratings** · **0 checklist-progress rows** · **0 approval rows** · **0 invitation rows** · **no Student Auth identity**. Anchored on **1 centre**, Class Grade **`beginner`**, **1 student**, **1 parent-student link**, **1 Class Module**, **1 Class Session**, **1 enrolment**, **1 trainer assignment** and **1 `present` attendance row**. Created in the **local disposable database only**.
- **Canonical fixture checksum (accepted):** SHA-256 **`d6a314b40bb5eb1bc3169097e2a9cb03858791498ca5137a43050cee36b87517`** — operator Checksums **A**, **B** and **C** were **identical**, and independent verification reproduced the same value
- **Delivered delivery mechanism:** a **local-only Node ESM loader plus static transactional SQL** under `scripts/fixtures/`, with verification/negative-test SQL, exactly one `package.json` script (`fixtures:local`) and **no new dependency** — **no `supabase/seed.sql`, no second migration, no direct `auth.users` insertion, no password hash, no invitation row**. The loader supports a **clean load** and an **explicit bounded `--reload`** only; a duplicate clean load is **rejected before any password prompt and makes no mutation**.
- **Deterministic Auth UUIDs (ratified):** management `d0000000-0000-4000-8000-000000000001`, trainer `...002`, parent `...003`, caller-supplied through the supported Auth Admin API and linked through `accounts.auth_user_id`; every Auth and domain UUID and every fixture timestamp is a **fixed literal**, so the acceptance checksum covers **all** fixture columns including `accounts.auth_user_id`. The runtime-generated fallback is **withdrawn**, and a mismatch must **abort rather than adapt**.
- **Credential rule (binding):** fixture passwords are entered **only through no-echo interactive stdin in an operator-controlled local terminal** — **no environment-variable path**, and **no password or credential may enter chat, any tracked or untracked file, a log, an error or a report**. **No pattern-based redaction**; credential-bearing stdout and stderr stay **captured and unrendered**; connection values stay **process-memory only**.
- **The broader `CLAUDE.md` §11 fixture shape is deferred and additive, not deleted** — 2 trainers, 2 class modules, 3–4 students per module, 2 parents and a **second Class Session** remain required before the Phase 1 grounding-validation and continuity proofs.
- **N-4 / U-23 (production Management bootstrap) remains OPEN** — fixture provisioning does not define or resolve it
- **Auth users and fixtures:** **delivered** — `auth.users` contains exactly **3** deterministic fixture users and the 22 application tables contain exactly **25** fixture rows in the **local disposable database**; `scripts/fixtures/` holds exactly **3** files; `supabase/seed.sql` and `supabase/functions` remain **absent**
- **Relationship authorization (Step 7G): delivered and runtime-accepted** — **exactly two applied migrations** (`20260803034500`, `20260803154500`); **RLS enabled on all 22 tables, FORCE on none**; **6 authorization helpers** (STABLE · SECURITY DEFINER · search-path pinned · created through the `postgres` migration path · EXECUTE for `authenticated` only); **29 permissive SELECT policies** over exactly the **13 identity/roster tables** (centres, accounts, centre_memberships, trainer_profiles, parent_profiles, students, parent_student_links, class_grades, class_modules, class_sessions, enrolments, class_session_assignments, attendance); `authenticated` holds **SELECT only** on those 13 with **no INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER**; **`anon`, `service_role`, `authenticator` and `PUBLIC` hold zero project-table privileges** (`service_role` stays deliberately ungranted because it carries **BYPASSRLS**); the **nine out-of-scope tables** (invitations, assessment_dimensions, observations, observation_ratings, reports, report_versions, report_version_ratings, report_version_checklist_progress, report_version_approvals) keep **zero policies and zero authenticated privileges**; **no view, trigger, extra schema, default-privilege change or ownership change** was introduced
- **Audit-chain design baseline (Steps 7H1A … 7H1A3): ratified and committed** — `docs/plan/STEP_7H_AUDIT_CHAIN_BASELINE.md` (SHA-256 `da5b0aea3c7a0640847944d9e5ce6371ac5b07fc5470af0c091ca37251362755`, 378 lines, 52,012 bytes) committed as `3e479b6`; **A-1 … A-6 fully ratified** — per-centre chain scope and threat model; core-`sha256(bytea)` same-transaction hashing; seeded-head genesis with race-proven READ COMMITTED concurrency; the versioned `BESTCOACH-AUDIT-V1` canonical envelope and deterministic byte-ordered JSON serializer; the governed `audit_append_event` protocol with validated actor authority, guard triggers and per-RPC duplicate gates; complete/partial `audit_verify_chain` semantics with no-repair incident handling. Minimum proposed objects: **3 tables, 3 functions, 3 guard triggers** — **ratified design objects only; none exists in any database**
- **Assessment writes, report lifecycle, RPCs, audit-chain SQL, generated types:** **not started** — no write policy exists anywhere; governed mutations remain assigned to reviewed RPCs/server actions in Step 7I; **the audit-chain design is ratified but no audit object exists**
- **Environment/client boundaries:** implemented and accepted (Step 7D)
- **Actual current MVP HEAD:** `3e479b69b1a4cd3592daf3edc321e92929002dbb` (short `3e479b6`)
- **Actual MVP commit count:** **25** — before the later administrative progress commit that will carry this progress-ratification record
- **Latest accepted design commit:** `3e479b69b1a4cd3592daf3edc321e92929002dbb` (`docs(audit): ratify audit-chain design baseline`) · **latest accepted substantive MVP commit:** `17d7ddc4e7264ffe0a545d3830813af94b7ac688` (`feat(authz): add relationship-scoped read policies`) · **latest test/verification commit:** `97f3fb2ed05f7fc3ddcec5e3f5e13b15da668b1f` (`test(fixtures): reconcile verification with relationship policies`) · **latest fixture-implementation commit:** `e197f91bbdf3196ef8e0eeee8216d6e7d8e495a7` · **latest schema commit:** `252ef9b13008629cadc238bdf58b7016c50bb7b2`
- **Latest accepted administrative progress commit:** `6ba61596b524df77ca5366c19b4521f3041f0072` (`docs(progress): record relationship authorization acceptance`) · **preceding:** `0cd6dd796f27cb7624409685eb3c299bfe6688be`
- **Latest accepted platform/implementation commit:** `455a0706b5555c0b4f083327dfd5613d3aa23245` (`feat(platform): add Supabase client boundaries`)
- **Runtime dependencies (exact-pinned):** `@supabase/ssr` `0.12.3`, `@supabase/supabase-js` `2.110.8`, `server-only` `0.0.1`; **Supabase CLI** `2.109.1` (project-local, exact-pinned)
- **Latest accepted governance baseline:** `c7c27e5e2f772725d88fbed1b5e1459d509960ce`
- **Repository:** local-only and **clean at `3e479b6`**; **no tag, no remote, no upstream, nothing pushed**. The working tree carries **only** this checkpoint's three staged progress files.
- **Local Supabase stack:** **stopped after runtime verification** — no Supabase container remains; the two applied migrations and the loaded fixture are **preserved in the Docker volume**. Docker Desktop may remain running.
- **Fixture credential posture:** passwords remain **operator-controlled, hidden and non-persistent** — entered only through no-echo interactive stdin in an operator-controlled local terminal, never stored, printed, logged, reported or placed in an environment variable, argument or file.

## Step 7E0 acceptance record (accepted 2026-07-30)

| Field | Value |
|---|---|
| **Checkpoint** | Step 7E0 — Final MVP scope and schema-preflight governance reconciliation |
| **Status** | **Completed** |
| **Accepted by orchestrator** | **Yes** — 2026-07-30 |
| **Substantive commit** | `722dcb868435e83fbeb3963cc2548d0745436406` (`722dcb8`) |
| **Message** | `docs(governance): ratify final single-centre three-flow MVP` |
| **Parent** | `e07b2138c9b670ebd3feda41c89782056cb8a6d5` |
| **Date** | `2026-07-30 12:39:49 +0800` |
| **Summary** | 7 files changed, 1383 insertions, 123 deletions (**2 created, 5 modified**) |
| **Resulting commit count** | **12** |
| **Acceptance-record commit** | **`6551d37253e562a40d51e521b93c261daf7efdc9`** (`6551d37`, Step 7E0C / 7E0C2) |

**Committed files:** `CLAUDE.md` · `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_002.md` (created) · `docs/plan/BEST_Coach_Implementation_Plan.md` · `docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md` (created) · `docs/progress/STATUS.md` · `docs/progress/BUILD_NOTES.md` · `docs/progress/DEMO_TO_MVP_MIGRATION.md`.

Specification v3 (`64d54aa2…`), Amendment 001 (`25ede394…`) and every `governance-source/` file remain **byte-for-byte unchanged**; the frozen demo remains **unchanged and clean** at `8d4acf4…` with its annotated tag intact. **Step 7D remains completed and fully accepted, and no previously accepted history was rewritten.**

## Step 7E0D acceptance record (accepted 2026-08-03)

| Field | Value |
|---|---|
| **Checkpoint** | Step 7E0D — Schema-critical decision ratification |
| **Status** | **Completed** |
| **Accepted by orchestrator** | **Yes** — 2026-08-03 |
| **Substantive commit** | `b367475c180a2e4f4cf70ff1385f34b253356c33` (`b367475`) |
| **Message** | `docs(governance): ratify schema-critical MVP architecture` |
| **Parent** | `6551d37253e562a40d51e521b93c261daf7efdc9` |
| **Date** | `2026-08-03 02:44:20 +0800` |
| **Summary** | 3 files changed, 479 insertions, 37 deletions (**1 created, 2 modified**) |
| **Resulting commit count** | **14** |
| **Acceptance-record commit** | **`584691ebe8b12e8b0eb0d56ca38db259d59ec949`** (`584691e`, Step 7E0D2C / 7E0D2D) |

**Committed files:** `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_003.md` (created, 374 lines) · `CLAUDE.md` · `docs/plan/BEST_Coach_Implementation_Plan.md`. **No progress file was touched by that commit**, so the workspace tracker and the committed migration copy stayed byte-identical across it.

**Sub-checkpoints:** **7E0D1** read-only architecture analysis (Decisions A – G with binding orchestrator corrections; **zero repository change**) · **7E0D2A** ratification change set staged · **7E0D2B** commit `b367475`. All Completed and Accepted.

**Accepted architecture — the ratified schema decisions (Amendment 003 A-025 … A-032):**

- **Identity and roles (A-025):** centre-independent `accounts` — application-owned UUID, **nullable unique `auth_user_id`**, lifecycle `active`/`deactivated` only, **no `centre_id` and no `role`**. `centre_memberships` is the **sole role authority** (`management`/`trainer`/`parent`; **TA excluded**) with lifecycle `pending`/`active`/`deactivated`. **`students` have no Auth relationship.** Role changes **deactivate the old membership and create a new one**. Role/profile agreement is enforced by **composite key + composite FK, never a cross-table `CHECK`**. **One active membership per (account, centre)** and **at most one active `management` membership per centre**, via partial unique indexes restricted to active rows.
- **Vocabularies (A-026):** enums for **closed, security/workflow-bearing, non-runtime-editable** value sets; tables where **FK identity, ordering or labels** are needed; **hybrid** for **centre-owned Class Grades** (`beginner`/`intermediate`/`advanced`) and the **global** nine-dimension reference data. Ratings `emerging`/`developing`/`secure`/`advanced`; attendance `present`/`absent`; **no Quick 4 representation**. **Session-lifecycle and audit vocabularies are deferred — their values are not ratified and no placeholder may be invented.**
- **Invitations (A-027):** **Supabase Auth owns all authentication secrets.** **No raw token, OTP, password, access token, refresh token or secret hash may exist in any application table** — enforced by the **absence of any such column**. Invitations target a **`pending` centre membership**, carry an **immutable normalized email** and a **stored status plus `expires_at`** whose **effective expiry is evaluated transactionally**. States `pending`/`accepted`/`expired`/`revoked`; **revoke or supersede before reissue**; **existing accounts are reused** for later-centre invitations; **Auth-link expiry and application-invitation expiry are separate**; **management bootstrap is separately governed**; **invitation duration remains operationally unresolved and does not block schema design**.
- **Reports (A-028):** one aggregate per Class Session + student, **valid module enrolment required**, owning the single current-cycle status plus `current_cycle_version_id` and `latest_submitted_version_id`. **Seven authorized statuses:** `incomplete`, `observation_saved`, `drafting`, `draft_ready`, `needs_edit`, `approved`, `submitted`. **Approval — not submission — freezes** the exact version and its canonical children. **Checklist progress and approval evidence are version-scoped and immutable once frozen.** **Exactly nine immutable rating snapshots** per approved/submitted version. Later edits **clone into a new mutable version**; **a submitted version never reopens**; **the previous submitted version stays canonical during correction**. **No report for an absent student**; **mid-cycle absence retains work but blocks progression**; **submitted attendance cannot be changed to `Absent`**. Management and Parent **read only the same latest submitted canonical report** and **never edit**.
- **Audit compatibility (A-029):** stable account/membership attribution; **durable actor FKs (`RESTRICT`) — not a blanket no-FK rule**; **polymorphic target IDs with immutable minimal snapshots**; **one event per governed action plus related-target child rows**; **append-only correction-by-new-event with no redaction**; **data minimization**. **Chain scope, canonical serialization, hash application, previous-hash rules, genesis, and verification/repair are explicitly NOT ratified — Step 7H.**
- **Privileges and access (A-030):** **deny-by-default.** RLS enabled on every Step 7E table with **zero policies**; **no client `SELECT`, DML or RPC `EXECUTE`**; **a policy and its minimum matching grant ship together in Step 7G**. **No governed direct client DML**; governed mutations use **reviewed, constrained `SECURITY DEFINER` RPCs**. **The database role follows the credential, not the code location** — an authenticated SSR client is still the `authenticated` role. Canonical latest-submitted reports use a **reviewed read RPC**, not raw internal-table access. The service-role client stays **server-only**. **No audit-read capability in the MVP.** Migration-owner definer ownership is the accepted default; restricted `NOLOGIN` ownership is **deferred hardening**.
- **Boundary and exclusions (A-031, A-032):** the exact **10 / 22 / 13** inventory with **fixed seed UUIDs** and **fail-on-divergence** seed verification; excluded artefacts assigned to **7F** (fixtures), **7G** (policies and grants), **7H** (audit and hash chain), **7I** (RPCs and server-action proof), **7J** (generated types), plus AI, evidence, session-lifecycle, private helper schema, views/RPCs/helper functions and UI work.

**Accepted Step 7E inventory — 10 enums:** `centre_membership_role` · `account_status` · `centre_membership_status` · `class_grade_code` · `dimension_code` · `dimension_group` · `competency_rating` · `attendance_status` · `invitation_status` · `report_status`.

**Accepted Step 7E inventory — 22 tables:** `centres` · `accounts` · `centre_memberships` · `trainer_profiles` · `parent_profiles` · `students` · `parent_student_links` · `class_grades` · `class_modules` · `class_sessions` · `enrolments` · `class_session_assignments` · `attendance` · `invitations` · `assessment_dimensions` · `observations` · `observation_ratings` · `reports` · `report_versions` · `report_version_ratings` · `report_version_checklist_progress` · `report_version_approvals`.

**Accepted Step 7E inventory — 13 deterministic seed rows:** **1 centre** (`ispeak` / `iSpeak Academy`) · **3 Class Grades** (`beginner`/Beginner/1, `intermediate`/Intermediate/2, `advanced`/Advanced/3) · **9 assessment dimensions** (Body, Emotion, Speech, Tonality = `competency` 1–4; Eye Contact, Vocal Projection, Emotional Expression, Sentence Flow, Audience Awareness = `speech_linguistics` 5–9).

**None of this has been built.** The inventory above is a **ratified specification of a future authorized migration**. Specification v3 (`64d54aa2…`), Amendment 001 (`25ede394…`), Amendment 002 (`70e787ff…`) and every `governance-source/` file remain **byte-for-byte unchanged**; the frozen demo remains **unchanged and clean** at `8d4acf4…` with its annotated tag intact. **No previously accepted history was rewritten.**

## Step 7H audit-chain design ratification record (accepted 2026-08-04)

**Ratified contract (A-1 … A-6).** **A-1 — scope and threat model:** one independent chain per centre; protects governed business history under the application threat model; detects accidental or unauthorized alteration **below database-superuser level** and **cannot independently prove integrity against a superuser able to rewrite the chain and anchors**; external mirror/anchoring deferred to Phase 4; **no client audit-read in the MVP**; fixture and authentication activity excluded; report-lifecycle events belong to Step 7I; attendance, management, roster, invitation and role-change events belong to their later governed RPC checkpoints. **A-2 — hashing and atomicity:** SHA-256 via PostgreSQL **core `sha256(bytea)`** with no extension; hashes computed in PostgreSQL; governed mutation and required audit append in the **same transaction** — no split transaction; callers can **never supply `entry_hash` or `previous_hash`**. **A-3 — partition, genesis and concurrency:** partition key `centre_id`; the **dense `seq_no`** — never timestamps — is the chain order; no head row exists before the first append; the first append atomically **seed-or-skips** a head row (`last_seq = 0`, domain-separated centre-specific genesis hash) and then locks it with `SELECT … FOR UPDATE`; the ratified **READ COMMITTED protocol guarantees exactly one sequence-1 event** under concurrent first writers; future centres receive independent chains without redesign; transaction-scoped advisory locks were rejected as unnecessary indirection, not as impossible. **A-4 — canonical serialization:** domain prefix `BESTCOACH-AUDIT-V1`; versioned fixed-field **length-prefixed envelope**; explicit SQL NULL/value representation; deterministic lowercase UUID and hash forms; UTC timestamps with six fractional digits and `Z`; **recursive deterministic JSON serialization with object keys sorted by UTF-8 byte order** rather than native jsonb ordering; order-preserving arrays; specified number normalization and exhaustive escaping; **SQL NULL, JSON null and the text `"null"` remain distinct**; raw UTF-8 without Unicode normalization; **`payload_canonical` must parse back to the stored jsonb payload**; independently reproducible using PostgreSQL core functionality only. **A-5 — append protocol and authority:** the proposed `audit_append_event` is **VOLATILE · SECURITY DEFINER · postgres-owned · search-path pinned · no dynamic SQL · no client EXECUTE**; it validates the authenticated actor against **`auth.uid()` and live active account/membership relationships** so authenticated callers cannot spoof the actor triple; system/operator events require **`auth.uid()` NULL, a jointly-NULL actor triple and a registry-approved system action**; append locks the centre head, allocates the next sequence, computes the hash, and inserts the event, target rows and head update **atomically**; committed events and targets are **never updated or deleted**; clients receive **zero direct privileges** on audit tables; **no global audit-level idempotency claim** — every governed RPC must provide its own deterministic CAS, uniqueness or operation-idempotency gate, and business-create operations without a natural CAS must define deterministic RPC-level idempotency **before** append. **A-6 — verification and incidents:** the proposed `audit_verify_chain` is **read-only with no client EXECUTE**; it verifies sequence continuity, previous-hash continuity and genesis, canonical reconstruction, hash recomputation, stored-head agreement, partition isolation, payload/target consistency and event-registry conformance; **explicit complete and partial modes** — a partial range records its predecessor anchor and cannot claim complete-chain integrity, and stored-head agreement applies only when the checked range reaches the tip; **no silent or automatic repair and no in-place alteration** of committed audit evidence; **an integrity failure is an incident** — evidence is preserved/exported before action and legitimate corrections are new events; mirror, alerting, cadence, retention and repair tooling remain Phase 4 concerns.

**Minimum proposed Step 7H objects (ratified design, not implemented).** Tables `audit_events`, `audit_event_targets`, `audit_chain_heads`; functions `audit_canonical_json`, `audit_append_event`, `audit_verify_chain`; guard triggers denying **UPDATE/DELETE on `audit_events`**, **UPDATE/DELETE on `audit_event_targets`**, and **DELETE only on `audit_chain_heads`** — the append function legitimately INSERTs and UPDATEs the head, and **no spoofable session-variable bypass is permitted**. **None of these exists as a database object.**

**Boundaries.** Step 7H implements **reusable audit-chain infrastructure and verification only**; its runtime decoys must roll back and leave the real chain empty; **Step 7I** remains responsible for report-lifecycle RPCs/server actions and their audit appends; later Phase 1 governed RPC checkpoints own attendance, management, roster, invitation and role events; **N-4** owns production management-bootstrap resolution; **no report lifecycle is pulled into Step 7H**.

**Acceptance-test contract (ratified future proof categories).** Postgres migration-role guard; ownership and default-ACL preservation; zero direct client audit-table writes; append/verify execution restrictions; deterministic genesis and serialization; sequential and concurrent append; rollback atomicity; per-RPC duplicate gating; actor-spoofing denial; tamper and head-mismatch detection; complete/partial verification semantics; cross-centre isolation; unauthenticated, trainer and parent non-enumerability; service-role posture; zero repair mutation; fixture/checksum preservation; Step 7G authorization preservation.

**Committed design (local only, nothing pushed, clean tree after the commit).** `3e479b69b1a4cd3592daf3edc321e92929002dbb` (`3e479b6`) — `docs(audit): ratify audit-chain design baseline` — parent `6ba61596b524df77ca5366c19b4521f3041f0072` — **1 file, 378 insertions(+)**: `docs/plan/STEP_7H_AUDIT_CHAIN_BASELINE.md` (SHA-256 `da5b0aea3c7a0640847944d9e5ce6371ac5b07fc5470af0c091ca37251362755`, 378 lines, 52,012 bytes).

**Unresolved but non-blocking.** **N-4 (production management bootstrap) remains unresolved** and synthetic fixtures do not replace it; the report status vocabulary binds in Step 7I under the existing accepted decision (A-028); automatic integrity-failure response, audit retention/PDPA, verification cadence and external-anchor mechanics remain Phase 4. **None blocks Step 7H audit-chain SQL authoring.** **A-1 … A-6 are fully ratified; audit-chain SQL and Step 7I remain unstarted; the next bounded checkpoint may author and stage one Step 7H audit-chain migration for static review and must stop before local application or commit.**

## Step 7G acceptance record — relationship authorization (accepted 2026-08-04)

**P-1 resolution (Step 7G1A).** The default-ACL audit proved: migration objects are created by `postgres`; all 22 Step 7E tables are `postgres`-owned; the `postgres` public default ACLs are hardened (owner-only) and grant no automatic client access; `supabase_admin` retains broad public default ACLs for objects **it** creates, which never applied because every project migration runs as `postgres`. The Step 7G migration opens with a **fail-closed `current_user = 'postgres'` guard**, and both default-ACL sets were verified **unchanged after application**. Any future object creation under `supabase_admin` is a **privilege event requiring re-audit**.

**Delivered scope.** Exactly **six** public authorization helpers — `app_current_account_id`, `app_has_active_membership`, `app_is_own_membership`, `app_is_own_active_membership`, `app_trainer_reaches_session`, `app_trainer_reaches_module` — each **STABLE**, **SECURITY DEFINER**, **search-path pinned**, created through the `postgres` migration path, and executable **only by `authenticated`**. Exactly **29 permissive SELECT policies** over exactly the **13 identity/roster tables**; `authenticated` receives **SELECT only** on those 13 and holds **no write-side privilege anywhere**; `anon`, `service_role`, `authenticator` and `PUBLIC` retain **zero** project-table privileges — `service_role` deliberately ungranted because it carries **BYPASSRLS**, so absence of privilege is the only boundary that constrains it. The **nine out-of-scope tables** retain zero policies and zero authenticated privileges. **No view, trigger, extra schema, default-privilege change or ownership change** was introduced.

**Accepted role behaviour.** **Management:** centre-scoped read of the in-scope identity/roster layer, including lifecycle states (pending/deactivated/unlinked/withdrawn/unassigned), restricted to the managed centre — no cross-centre visibility. **Trainer:** own account, membership and trainer profile; roster and calendar reached **only** through active trainer-assignment relationships; no parent account/profile visibility; no unrelated or unassigned trainer/session access. **Parent:** own account, membership and parent profile; linked-student visibility only through an **active** parent-student link; calendar/class access only through the linked student's **active** enrolment; no other parent, child, trainer or centre-wide roster access. Every path derives live from `auth.uid()` → `accounts.auth_user_id` → an **active** membership → the relationship tables; all predicates stay centre-aware, and **inactive relationships confer no authority**.

**Runtime proof (accepted, Step 7G1D).** The migration applied cleanly as the **second** project migration (`20260803034500`, `20260803154500`); 22 tables stayed RLS-enabled with FORCE on none. The management/trainer/parent visibility matrices passed **all 39 cells with deterministic IDs**. Denials all passed with authored expectations: anon (42501 on all 13), missing/unknown authenticated identity (0 rows), all nine out-of-scope tables denied, **`service_role` denied on all 22 despite BYPASSRLS**, authenticator denied, authenticated INSERT/UPDATE/DELETE denied, helper EXECUTE denied to anon/service_role/authenticator. The inactive-account, inactive-membership, inactive-link, inactive-enrolment and inactive-assignment tests all failed closed; the unrelated-child, unrelated-session, another-trainer and second-centre decoys stayed invisible; **management lifecycle visibility never became a trainer or parent authority path**; every decoy rolled back with **zero residue**. The fixture remained **3 Auth users / 25 domain rows**, canonical rows **28**, canonical SHA-256 **`d6a314b40bb5eb1bc3169097e2a9cb03858791498ca5137a43050cee36b87517`**, seed **1/3/9**.

**Verification reconciliation (Step 7G1F).** The Step 7F verification suite carried **five superseded assumptions** — A32 (zero policies), A33 (zero client privileges), A34 (one migration), A35 (one migration version) and D5 (zero policies after rollback) — reconciled to the accepted Step 7G posture. Fixture assertions **A1–A31**, all **seven negative data-integrity tests**, and the **canonical serialization and checksum logic** are unchanged. The reconciled suite now verifies 2 migrations, 22 RLS-enabled tables, 29 policies, 6 helpers, the exact grants and denials, and no views/user triggers — and **passed twice with identical checksum and no residue**.

**Committed implementation (local only, nothing pushed, clean tree after each):**

- `17d7ddc4e7264ffe0a545d3830813af94b7ac688` — `feat(authz): add relationship-scoped read policies` — 1 file, 938 insertions(+)
- `97f3fb2ed05f7fc3ddcec5e3f5e13b15da668b1f` — `test(fixtures): reconcile verification with relationship policies` — 1 file, 203 insertions(+), 31 deletions(-)

**Operational and unresolved state.** Supabase was stopped after runtime verification; the migrations and fixture persist in the Docker volume. **Production Management bootstrap (N-4) remains unresolved** — synthetic fixture identities do not replace it. Assessment writes, report lifecycle, audit chain, RPCs, server actions and publication remain **outside Step 7G**; **no write policy exists**; service-role use remains a **trusted server-only boundary**. **Audit-chain items A-1 … A-6 remain unratified** and must be explicitly reconciled and ratified before any audit-chain SQL is authored in Step 7H.

## Step 7F acceptance record — deterministic local synthetic fixture (accepted 2026-08-03)

**Delivered scope.** Exactly **3 deterministic Auth users** — management, trainer and parent — and exactly **25 application-domain rows**, producing exactly **28 canonical checksum rows**. The dataset is **1 centre**, Class Grade **`beginner`**, **1 student**, **1 parent-student link**, **1 Class Module**, **1 Class Session**, **1 enrolment**, **1 trainer assignment**, **1 `present` attendance row**, **1 observation** and **nine mixed observation ratings**, with **zero** reports, report versions, report-version ratings, checklist-progress rows, approvals and invitations, and **no Student Auth identity**. Created in the **local disposable database only**.

**Runtime proof (accepted).** The bounded `--reload` passed; a duplicate clean load was **rejected before any password prompt and made no mutation**; **two independent reset-and-clean-load cycles** passed; operator **Checksums A, B and C were identical**; and independent verification reproduced the same value. **Canonical SHA-256 `d6a314b40bb5eb1bc3169097e2a9cb03858791498ca5137a43050cee36b87517`.** **37 positive assertions passed**, **all 7 negative tests passed**, and the negative tests **left no residue**. Step 7E seeds remained **1 centre, 3 grades and 9 dimensions**; exactly **one** migration is applied; **RLS is enabled on all 22 tables**, with **zero policies** and **zero unintended privileges**.

**Corrective incidents resolved.** Five defects were found and corrected before acceptance, each proven rather than assumed:

1. The **first operator attempt was blocked** because the execution channel lacked a **genuine interactive TTY**; the loader was not invoked and no alternative password path was substituted.
2. The initial **Windows password handler set a stream encoding**, so stdin chunks arrived as strings while the handler compared **numeric byte codes** — Enter and Ctrl+C were therefore never recognized.
3. The **domain SQL operation guard placed psql variables inside a dollar-quoted block**, where psql performs no substitution; the block reached the server verbatim and failed with **SQLSTATE 42601**.
4. **Verification tests N2, N3 and N4 reached unrelated constraints before their intended ones** and were corrected to isolate the intended invariants.
5. **stdin remained referenced after completion**, preventing Node from exiting automatically; the loader lifecycle was corrected so both the success and failure paths exit without Ctrl+C.

**All corrected paths were subsequently proven** by operator runtime verification and by independent verification through the approved local `docker exec … psql` contract.

**Committed implementation.** **`e197f91bbdf3196ef8e0eeee8216d6e7d8e495a7`** (short `e197f91`) · `feat(fixtures): add deterministic local fixture baseline` · parent `098d0eaf2bcba912c366aee6789813410df86b48` · **5 files changed, 2,208 insertions(+), 1 deletion(-)**. **Committed locally only — no remote exists and nothing was pushed.**

**Operational state.** The local Supabase stack was **stopped after independent verification** and **no Supabase container remains**; Docker Desktop may remain running. The repository was **clean after the implementation commit**. Fixture passwords remain **operator-controlled, hidden and non-persistent**. The loader supports a **clean load** and an **explicit bounded `--reload`** only. **Production Management bootstrap (N-4 / U-23) remains unresolved and is not replaced, defined or discharged by synthetic fixtures.**

## Ratified final MVP scope (Amendment 002 — ACTIVE, ratified and committed 2026-07-30)

- **Final MVP boundary (A-014, A-015):** exactly **three** completed human-user flows — **Management, Trainer, Parent** — operating for **one centre only**. No centre creation/deletion/switching, no multi-centre administration, no cross-centre analytics or transfers, no HQ role, no super-admin. A **real `centres` entity and centre-scoped relationships are retained** so multi-centre support stays additive; the MVP uses **exactly one seeded centre**, with **no centre-selection UI** and **no centre-management UI**, and **one named management account** (never shared credentials). **TA is not a required completed MVP flow** and **TA UAT is not a completion gate**; Amendment 001's evidence safeguards are **preserved in full** and apply whenever evidence is implemented.
- **Canonical hierarchy (A-016):** **Centre → Class Grade → Class Module → Class Session → downstream records.** Class Grade values are exactly **Beginner, Intermediate, Advanced**. **"Class Grade" replaces "Academic Level"** as the active term. The UI action may read "Create Class", but the persisted entity is the **Class Module** under a selected Class Grade; **no hidden intermediate `classes` entity.** Trainer assignment is authoritative at **class-session** level, and **calendars are projections — never duplicated event records**.
- **Mandatory nine-dimension assessment (A-017):** every assessment requires **all nine** B.E.S.T dimensions. **Quick mode is removed completely**; there is **no four-dimension-only completion path and no four-dimension fallback**. The nine dimensions, four ratings, rubric anchors, grounding validation, trainer accountability, and governed AI generation/review are **retained unchanged**.
- **Attendance (A-018):** defaults to **`Present`** on roster initialization; the trainer may toggle an individual student to **`Absent`**; state persists per **student + class session** (conceptually unique); absence never produces or exposes a fabricated assessment or report; changes are **auditable**.
- **Management creation and invitation scope (A-019, A-020):** management creates Class Modules under a selected Class Grade, dated Class Sessions, trainer/student/parent profiles and **email invitations**, enrolments, parent–student links, and **one trainer assignment per class session** — and **never edits feedback-report content**. Every management write is **server-side, centre-scoped, validated, authorized and auditable**. The **Auth identity is distinct from the domain profile**; the recipient verifies their address and sets **their own** credentials; **no plaintext generated password is stored, displayed or emailed**; invitation states include at least **`pending` / `accepted` / `expired` / `revoked`**; an unactivated profile is **not** an active login identity.
- **Canonical report access (A-021):** **one** canonical feedback-report format, **one** shared submitted-report read model, **one** reusable presentation architecture. **Trainer** views and edits within the governed workflow; **management** and **parent** are **view only** (parent: linked students only). Management and parent cannot reach drafts, internal notes, raw private assessment data, or AI generation history. **Hiding an Edit button is not authorization** — the server rejects management and parent edit attempts. Trainer edits use the governed editable version, never mutate a submitted approval snapshot in place, reset the quality checklist, and require review and approval again. **AI never publishes directly.**
- **UI authority (A-022):** **Figma Design 2 replaces Stitch** as the final visual and interaction authority; it is **not** authoritative for schema, RLS, authorization, report lifecycle, audit, Auth, persistence, state-machine rules, or transaction boundaries. A **mandatory implementation-readiness gate** precedes the first Figma-based UI checkpoint.
- **Data layer (A-023):** **Supabase-native; no general-purpose ORM.** `@supabase/ssr` + `@supabase/supabase-js`; **Supabase SQL migrations are the schema source of truth**; **generated Supabase database TypeScript types are authoritative** for application data types; RLS-scoped normal access; reviewed server actions/route handlers for governance-carrying writes; reviewed PostgreSQL functions/RPCs for atomic transition+audit; a **separate server-only elevated client requiring explicit authorization**. **No Prisma, no Drizzle.** An ORM may enter only via a later explicit ADR and orchestrator approval. **This resolves the previously blocking data-layer governance tension.**
- **Phasing (A-024):** the revised three-flow implementation sequence and **three-flow final UAT** (Management, Trainer, Parent). Accepted historical checkpoints are **not renumbered**, and Amendment 002 **does not invalidate the accepted Step 7D client-boundary work**.

## Phase 0 progress (Steps 7A–7D, accepted 2026-07-23 to 2026-07-30)

- **Step 7A completed and accepted** — read-only planning produced the requirement matrix, the accepted 7B–7L checkpoint sequence, and four recorded unresolved findings. No repository or runtime mutation occurred.
- **Step 7B completed after Windows-specific remediation** — the first attempt correctly failed its service-health gate because Vector crash-looped; the accepted fix disabled optional local Analytics/Vector and ignored `supabase/snippets/`, committed as `25551c5`.
- **Required local services are healthy** — Kong (API gateway), PostgreSQL, Studio, Auth, Storage, Realtime, Mail, Postgres Meta, REST and Edge Runtime: 10 containers, **0 unhealthy, 0 restarting**.
- **Analytics and Vector disabled locally** — optional, and incompatible with the accepted Windows security posture.
- **Docker TCP 2375 remains disabled** — enabling it was evaluated and rejected as a security regression.
- **PostgreSQL 17 verified** — `public` schema contains **0 application tables**.
- **Local stack currently stopped** — 0 containers; 13 images and 3 volumes retained for fast restart.
- **Hosted project not linked** — no `supabase login`, no `supabase link`, no access token on this machine.
- **Application client boundaries now exist (Step 7D) but perform no query** — no migrations, Auth users, RLS, or audit chain exist yet.
- **Step 7C is completed and accepted (2026-07-24)** — Supabase runtime dependencies (`@supabase/ssr` `0.12.3`, `@supabase/supabase-js` `2.110.8`, `server-only` `0.0.1`) exact-pinned, installed and verified; typecheck/lint/build passed; only `package.json` and `package-lock.json` committed as `ffd9eef`; **no clients, migrations, or source code** were created.
- **Step 7D is completed and accepted (2026-07-30)** — explicit local-versus-hosted environment selection and the three Supabase client boundaries (browser-safe `createBrowserClient`, request-scoped server `createServerClient`, and a separate elevated server-only client) implemented; `server-only` isolation proven by a **negative production build** (a Client Component importing the elevated factory failed the build with exit code 1); all six approved environment variables validated (opaque inputs only — no value rendered, logged, or reported); typecheck/lint/build passed with zero warnings; client-bundle private-name isolation passed (0 occurrences of `SUPABASE_SECRET_KEY`/`LLM_PROVIDER`/`LLM_MODEL`/`LLM_API_KEY` in `.next/static`); only the five implementation files committed as `455a070` (5 files, 363 insertions, 0 deletions); **no query, Auth flow, migration, schema, RLS, audit chain, or hosted operation** occurred.
- **Step 7E0 (final MVP scope and schema-preflight governance reconciliation) is completed and accepted** — **documentation only**. It created **Amendment 002** (A-014 … A-024) and the **Figma Design 2 screen implementation matrix**, and aligned `CLAUDE.md`, the Implementation Plan, and the progress records to the ratified final MVP scope. Committed as **`722dcb8`**; **no schema, code, dependency, runtime, Auth, seed, or Figma import was authorized or performed by it.**
- **Step 7E (first governed SQL migration and database foundation) is Completed and Accepted (2026-08-03)** — the data-layer tension was resolved by Amendment 002 A-023, the seven schema-critical blockers by Amendment 003, and the migration itself was authored, corrected, locally verified and committed as `252ef9b` under a **bounded authorization covering Step 7E alone**.
- **Step 7E0D (schema-critical decision ratification) is Completed and Accepted (2026-08-03)** — committed as `b367475`; it resolved the seven schema-critical blockers at spec-amendment precedence as Amendment 003 A-025 … A-032.
- **Step 7F is the next checkpoint and is NOT authorized** — it requires a **separate explicit orchestrator authorization** that has not been given. **No Auth user, fixture, RLS policy, client grant, RPC, audit object, generated type or application code is authorized.**

## Completed tooling state (Step 6, accepted 2026-07-23)

- **Docker Desktop / WSL 2 accepted** — client and engine `29.6.2`, Compose `v5.3.1`, Linux engine (`x86_64`); insecure TCP 2375 disabled; Kubernetes not enabled.
- **Supabase CLI `2.109.1` installed project-locally** — exact pin in `devDependencies`, resolved identically in `package-lock.json`, no global install, invoked through `npx --no-install`.
- **Local scaffold initialized** — `supabase/config.toml` (`project_id = "best-coach-mvp"`) and `supabase/.gitignore`, committed as `0cdb782`.
- **`.env.example` committed safely** — six approved variable names, placeholder-only; only the non-secret ratified selectors (`LLM_PROVIDER=openai`, `LLM_MODEL=gpt-5.6-terra`) carry values.
- **`.env.local` protected** — ignored via `.env*`, untracked, never printed, hashed, copied, or committed; `!.env.example` is the only exception to the broad rule.

## Completed governance state

- **Step 5A accepted** — governance inventory and reconciliation plan complete.
- **Step 5B1 accepted** — reconciled governance baseline installed.
- **Step 5B2 accepted** — active migration copy installed; governance baseline staged and reviewed.
- **Step 5B3 accepted** — governance baseline committed as `c7c27e5`.
- **Specification v3 installed unchanged** (byte-for-byte, `64d54aa2…`); never edited in place.
- **Amendment 001 ratified** (A-001 … A-013).
- **Root `CLAUDE.md` and the Implementation Plan reconciled** to Amendment 001.
- **Active migration record synchronized** at `docs/progress/DEMO_TO_MVP_MIGRATION.md`.
- **Permanent `STATUS.md` and `BUILD_NOTES.md` active** and updated at every accepted stopping point.

---

## Accepted repository baselines

### Frozen demo (reference-only)

- **Path:** `C:\Users\enyul\Vibe Studio\B.E.S.T-Coach-Workspace\SDS Project Sprint 2`
- **Branch:** `main`
- **Commit:** `8d4acf4abc5039c24da01be773ab1a5e4916080f`
- **Tag:** `demo-freeze-step14-2026-07-21`
- **Note:** frozen at completed Step 14; **Step 15 intentionally skipped**; **reference-only** — never a source of MVP architecture (see `CLAUDE.md` §13).

### Fresh MVP (this repository)

- **Path:** `C:\Users\enyul\Vibe Studio\B.E.S.T-Coach-Workspace\SDS Project Final (BEST Coach)`
- **Branch:** `main`
- **Latest accepted substantive commit:** `252ef9b13008629cadc238bdf58b7016c50bb7b2` (`feat(supabase): add governed core schema migration`)
- **Current HEAD:** `252ef9b13008629cadc238bdf58b7016c50bb7b2` (`252ef9b`)
- **History:** **sixteen** accepted commits — `4de3f93` (scaffold) → `c7c27e5` (governance baseline) → `a39ed21` (closure synchronization) → `0cdb782` (local Supabase tooling scaffold) → `a83ec7a` (tooling closure records) → `25551c5` (Windows local-stack remediation) → `329f03c` (Phase 0 runtime foundation records) → `ffd9eef` (Supabase runtime dependencies) → `5d10bd0` (runtime dependency records) → `455a070` (Supabase client boundaries) → `e07b213` (Supabase client-boundary records) → `722dcb8` (final single-centre three-flow MVP governance ratification) → `6551d37` (final MVP governance acceptance records) → `b367475` (schema-critical MVP architecture ratification) → `584691e` (schema architecture ratification records) → `252ef9b` (governed core schema migration)
- **Working tree:** clean at `252ef9b` apart from this checkpoint's three staged progress files
- **Remote:** none (no tag, no upstream, nothing pushed)

---

## Ratified governance

- **Source-of-truth hierarchy (highest first):** Specification v3 → ratified amendments (Amendment 001, then Amendment 002, then Amendment 003 for the clauses each names) → root `CLAUDE.md` → Implementation Plan (procedural) → **Figma Design 2** (visual/interaction reference only) → `STATUS.md` → `BUILD_NOTES.md` → temporary migration tracker.
- **Amendment 001:** Ratified 2026-07-21 (`docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_001.md`); supersedes only the clauses named in its supersession table (A-001 … A-013). **A-001 … A-012 remain fully active; A-013 is superseded by Amendment 002 A-022 only for the UI-reference source and install timing.**
- **Amendment 002:** Ratified 2026-07-30 (`docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_002.md`); **A-014 … A-024**; supersedes only the clauses named in its supersession table. **It does not weaken any privacy, approval, audit or evidence control**, and the core governance rule — *AI drafts, trainer approves, parents and management see only approved reports* — is unchanged.
- **Amendment 003:** Ratified 2026-08-03 (`docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_003.md`); **A-025 … A-032**; supersedes only the clauses named in its supersession and clarification table. It **clarifies rather than reverses Amendment 002** and **names no Amendment 001 clause**. It governs **schema architecture and migration boundaries** — centre-independent `accounts` with membership-scoped roles, vocabulary rules, the absolute authentication-secret prohibition, the report aggregate/version model with **approval as the freeze point**, audit-compatibility guarantees, the deny-by-default privilege posture, and the exact **10 / 22 / 13** Step 7E boundary. **It is not an implementation authorization.** It resolves Amendment 002 items **U-12, U-16, U-17, U-18, U-19** and **explicitly leaves U-13, U-14, U-15 open for Step 7H**.
- **Specification v3, Amendment 001 and Amendment 002 are never edited in place** and remain byte-for-byte unchanged; all reconciliation lives in the amendments.
- **Toolchain (A-006):** Node 24 LTS (`.nvmrc` `24`, engines `>=24 <25`), npm `11.13.0`; Next.js App Router, TypeScript, Tailwind, ESLint, Turbopack; root `/app`; React Compiler off.
- **Git (A-005):** local-only; no remote/push unless the orchestrator explicitly requests it.
- **Evidence phasing (A-001/A-002/A-003):** Phase 1 parent report is text-only; gated parent evidence access (linked child + `Submitted` + consent + short-TTL signed URL) is implemented and tested in Phase 2.
- **Audit (A-007/A-010):** Phase 0 = append-only DB audit table + hash chain, mutation denial verified via restricted role / `SET ROLE`; Phase 4 = independent retention-locked external mirror.
- **Continuity (A-008):** `STATUS.md` **and** `BUILD_NOTES.md` are both permanent and updated at every accepted stopping point.
- **Testing/a11y (A-009):** Vitest + React Testing Library + Playwright pre-approved; Lighthouse first for accessibility.

---

## Current follow-ups

- **Current npm advisories remain unresolved — 3 high and 0 moderate** (`next` high/direct; `postcss` and `sharp` high/transitive, both through `next`). None is attributable to `supabase@2.109.1`, `@supabase/ssr`, `@supabase/supabase-js`, `server-only`, or their transitive packages; the shift from 1-moderate/2-high reflects npm advisory-database movement raising `postcss` to high, not a dependency change. No `npm audit fix` has been run; remediation is deferred to a reviewed security/dependency checkpoint.
- **This Step 7F0E acceptance record is staged only; its commit is pending.** Nothing here is self-accepted. (The Step 7F fixture **design** is **accepted** and committed at `936cf4e`; the Step 7E governed-core migration is **accepted** and committed at `252ef9b`.)
- **Step 7E is completed and accepted (2026-08-03).** The governed-core migration was applied to a **local disposable database only**, verified against the catalogue, and committed. **Step 7F remains unauthorized and unstarted** and requires a **separate explicit orchestrator authorization**.
- **The Step 7F fixture design is completed and ratified (2026-08-03), and implementation remains unauthorized.** The ratified record is `docs/plan/STEP_7F_SYNTHETIC_FIXTURE_BASELINE.md`. **No fixture script, SQL fixture file, `seed.sql`, migration, Auth user or fixture row exists**, and none may be created until the orchestrator issues an explicit Step 7F implementation authorization. **N-4 / U-23 (production Management bootstrap) remains open**, and the broader `CLAUDE.md` §11 fixture shape remains **deferred and additive**.
- **Step 7G must begin with a privilege review.** A pre-existing **`supabase_admin` default ACL** in schema `public` may grant client privileges to future objects created by that role; it did not affect the 22 `postgres`-owned Step 7E tables, which are verified at zero client privileges. **Inspect effective and default ACLs before adding any policy or grant.**
- **Step 7E0D is completed and accepted (2026-08-03).** All seven schema-critical blockers are resolved by Amendment 003. **This did not authorize Step 7E.** **Step 7E requires a separate explicit orchestrator authorization that has not been given** — resolving the blockers made it **eligible**, not **authorized**.
- **Audit-chain design remains unratified and blocks Step 7H** — chain scope, canonical serialization, hash application, previous-hash rules, genesis, and verification/repair. **These must not be inferred, defaulted, or decided inside a migration.**
- **Figma Design 2 implementation handoff** — **pending**. The orchestrator must supply or verify, per approved screen: **node-specific `/design/` frames**, screen names, flows, intended routes, responsive variants, component/interaction states, and the **loading, empty, validation, error, success and disabled** states; the **design-variable or approved token inventory** (typography, colours, spacing, radii, shadows); and the **approved logos, SVG icons and image assets**; plus prototype transitions, interaction notes, and any discrepancy against a ratified governance rule. **It is NOT a blocker for Step 7E unless an unresolved Figma field changes the domain relationship model.** **It IS a blocker for the corresponding UI implementation checkpoint.** **Missing visual or interaction details must not be guessed** — implementation stops and asks. Tracking artefact: `docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md` § "Orchestrator Figma Porting Actions". **No Figma asset has been scraped, exported, downloaded, or ported, and no node ID has been fabricated.**

### Remaining unresolved decisions, classified by blocking point

**Schema-critical — these seven blocked Step 7E and are ALL RESOLVED by Amendment 003 (2026-08-03). Resolving them made Step 7E eligible, not authorized:**

- ~~**`public` application-profile relationship to `auth.users`**~~ — resolved by **A-025**: centre-independent `accounts` with a **nullable unique `auth_user_id`**; profiles never key to `auth.users`; `students` have no Auth linkage.
- ~~**Audit target representation**~~ — resolved by **A-029**: polymorphic target with an immutable label snapshot and **no FK**, plus a related-target child table; durable actor FKs (`RESTRICT`) retained for attribution.
- ~~**Report-status storage representation**~~ — resolved by **A-028**: normalized `report_status` enum with **exactly seven values**; `Evidence Pending` is not a stored status, which weakens **no** evidence safeguard.
- ~~**Deliberate `GRANT` strategy for newly created tables**~~ — resolved by **A-030**: deny-by-default; **zero client grants and zero policies in Step 7E**; policy and minimum matching grant **ship together in Step 7G**. Privilege and policy remain **separate layers** — a missing grant must never be misdiagnosed as an RLS failure.
- ~~**Enum versus reference table at schema level**~~ — resolved by **A-026**: enum for closed vocabularies, table for FK identity/order/label, **hybrid** for centre-owned Class Grades and the global nine dimensions.
- ~~**Invitation token and expiry implementation details**~~ — resolved by **A-027**: **no secret-bearing column exists**; stored status plus `expires_at` with **transactional effective-expiry evaluation**; revoke or supersede before reissue.
- ~~**First-migration table and enum scope**~~ — resolved by **A-031 / A-032**: **exactly 10 enums, 22 tables, 13 deterministic seed rows**; no view, RPC or helper function; exclusions assigned to 7F–7J.

**Opened by Amendment 003 — recorded, not answered:**

- **Invitation duration** — a default value, not a schema shape; **does not block schema design**.
- **Session-lifecycle vocabulary** — values not ratified; **no placeholder enum may be invented**.
- **Restricted `NOLOGIN` `SECURITY DEFINER` function owner** — deferred hardening; migration-owner ownership is the accepted MVP default.
- **Management bootstrap mechanism** — how the first management membership is created.
- **Management / trainer / parent audit-read capability** — post-MVP; no audit-read surface exists in this MVP.

**Audit-design — these blocked the audit-chain checkpoint (Step 7H), not the first migration. ~~STILL OPEN~~ — ALL RATIFIED at design level by the committed Step 7H audit-chain design baseline (`3e479b6`, 2026-08-04); ratification authorizes design only and no audit-chain SQL exists:**

- ~~**Audit-chain scope** — one global chain vs one chain per target/tenant.~~ — ratified (**A-1**): **one independent chain per centre**.
- ~~**SHA-256 ratification** for the audit hash (spec §23 names no algorithm).~~ — ratified (**A-2**): **SHA-256 via PostgreSQL core `sha256(bytea)`**, computed in-database in the same transaction as the governed mutation.
- ~~**Audit-chain genesis rule** — sentinel vs zero-hash for the first entry.~~ — ratified (**A-3**): **seed-or-skip head row with a domain-separated centre-specific genesis hash** and a race-proven READ COMMITTED first-append protocol.
- ~~**Canonical serialization** of an audit event for hashing.~~ — ratified (**A-4**): **versioned `BESTCOACH-AUDIT-V1` length-prefixed envelope** with a deterministic UTF-8 byte-ordered JSON serializer and a `payload_canonical` parse-back guarantee.
- ~~**Hash application and previous-hash rules.**~~ — ratified (**A-5**): **atomic head-locked append**; callers can never supply `entry_hash` or `previous_hash`; per-RPC duplicate gates.
- ~~**Chain verification and repair procedures.**~~ — ratified (**A-6**): **complete/partial verification with recorded predecessor anchors; no automatic repair — an integrity failure is an incident**.

**UI / report — these block only their own later implementation checkpoint:**

- **Exact individual Figma Design 2 frame/node links** for every screen family.
- **Exact field inventory for Create Class (Class Module details)** — escalates to a Step 7E blocker **only if** a missing field changes the domain relationship model.
- **Exact fields for trainer-profile creation** — same escalation rule.
- **Exact fields for student-profile creation** — same escalation rule.
- **Exact fields for parent-profile creation** — same escalation rule.
- **Exact report sections and field schema** from the canonical Design 2 report frame.
- **Responsive variants** not yet supplied.

**Figma assets — these do not block schema work at all:**

- **Figma tokens and approved asset exports** (typography, colours, spacing, radii, shadows, logos, SVG icons, images).

**Evidence — these block only evidence implementation, unless they alter core schema:**

- **Whether evidence media remains a completion requirement.**
- **Who uploads evidence** if it is retained. **No replacement actor may be invented**, and TA upload permissions must not be silently transferred to management or trainer.
- **Exact evidence-related Figma screens** if evidence is retained.
- Amendment 001's evidence-access restrictions (A-001 / A-003 / A-004) **continue to apply in full** if evidence is implemented.

### Other active follow-ups (unchanged by this checkpoint)

- **Current npm advisories remain unresolved — 3 high and 0 moderate** (restated at the top of this section; unchanged by this checkpoint). No `npm audit fix` has been run.
- **Hosted project linking remains deferred** — `supabase login` / `supabase link` require a separate explicit checkpoint.
- `BEST_Coach_AI_Features_Breakdown_v2.docx` **remains missing** — **non-blocking** for MVP Phases 0–4 (A-011); required before either deferred aggregate AI feature is scoped.
- **UI asset disposition remains pending and non-blocking** — the source is now **Figma Design 2** (A-022), not Stitch; the A-013 disposition discipline (`PORT` / `REFERENCE ONLY` / `REBUILD` / `REJECT` / `NOT APPLICABLE` before any asset is copied) still applies.
- **No real data permitted** — synthetic/seed data only (ADR-6).

### Resolved since the previous update

- ~~Supabase project creation not yet verified~~ — orchestrator-confirmed (Step 6A2).
- ~~Singapore region not yet verified~~ — orchestrator-verified as `ap-southeast-1` (Step 6A2).
- ~~Supabase credentials not yet verified locally~~ — presence-only verification passed; values never printed or committed.
- ~~LLM provider and API key not yet verified locally~~ — OpenAI / `gpt-5.6-terra`; key present locally.
- ~~ORM / data-access decision unresolved~~ — resolved: **Supabase-native, no general-purpose ORM**.
- ~~`.env.local` and `.env.example` contract not yet verified~~ — six-variable contract verified; `.env.example` committed placeholder-only; `.env.local` ignored and untracked.
- ~~Supabase client/environment boundaries not yet implemented~~ — resolved (Step 7D): browser-safe, request-scoped server, and elevated server-only factories implemented with explicit local/hosted selection and proven `server-only` isolation; committed as `455a070`.
- ~~Data-layer governance tension (Supabase-native vs the Prisma/Drizzle wording in Specification v3 §18 / `CLAUDE.md` §9)~~ — resolved by **Amendment 002 A-023**, ratified at spec-amendment precedence and reflected in `CLAUDE.md` (ADR-8, §9) and the Implementation Plan. *(Pending commit and orchestrator acceptance of this checkpoint.)*
- ~~Final MVP scope, hierarchy, assessment-mode, attendance, management-administration, identity/invitation, canonical-report and UI-authority ambiguity~~ — resolved by **Amendment 002 A-014 … A-024**, **committed at `722dcb8` and accepted 2026-07-30**.
- ~~Step 7E0 governance reconciliation awaiting commit and acceptance~~ — resolved: **committed as `722dcb8` and accepted by the orchestrator on 2026-07-30**; Amendment 002 is **active**. Its acceptance record was committed as **`6551d37`**.
- ~~The seven schema-critical decisions blocking Step 7E~~ — resolved by **Amendment 003 A-025 … A-032**, **committed at `b367475` and accepted 2026-08-03**. **Resolution is not authorization** — Step 7E remains blocked and unauthorized.
- ~~Centre seed identity undetermined~~ — resolved: code **`ispeak`**, display name **`iSpeak Academy`**, orchestrator-confirmed and recorded. **Not seeded** — no seed file or row exists.
- ~~Exact first-migration boundary undetermined~~ — resolved: **10 enums, 22 tables, 13 deterministic seed rows**, with RLS enabled, zero policies and zero client grants, and explicit exclusions assigned to 7F–7J. **Delivered and locally verified** by the Step 7E migration `252ef9b`.
- ~~Step 7F synthetic fixture designed but unimplemented~~ — resolved: **implemented, corrected across five recorded incidents, runtime-proven and committed as `e197f91`**. **3 Auth users, 25 domain rows, 28 canonical rows**, canonical SHA-256 `d6a314b4…`, identical across the bounded reload and two reset-and-clean-load cycles. **Local disposable database only.**
- ~~P-1 `supabase_admin` default-ACL review open~~ — resolved at **Step 7G1A**: audited in full, hazard proven conditional on the creating role, and neutralized by the migration's fail-closed `postgres` execution guard. Default ACLs verified unchanged after application. Future `supabase_admin` object creation remains a privilege event.
- ~~Policy-and-grant layer absent (deny-by-default only)~~ — resolved: **Step 7G delivered the relationship-authorization layer** — 6 helpers, 29 SELECT policies over 13 tables, minimum matching grants to `authenticated` only — committed at `17d7ddc` and runtime-proven. The fixture verification suite was reconciled to the new posture at `97f3fb2`. **Write paths remain deliberately closed** pending the Step 7I RPC layer.
- ~~Audit-chain design items A-1 … A-6 unratified and blocking Step 7H SQL~~ — resolved: **reconciled, adversarially reviewed and fully ratified at design level** in `docs/plan/STEP_7H_AUDIT_CHAIN_BASELINE.md`, committed as `3e479b6` and recorded as **D-261 … D-272**. **Ratification authorizes design only — no audit-chain SQL exists.**

---

## Next permitted action

**Review and commit the staged Step 7H1A4 progress-ratification record.** Exactly three progress files are **staged** — `docs/progress/DEMO_TO_MVP_MIGRATION.md`, `docs/progress/STATUS.md`, `docs/progress/BUILD_NOTES.md`. The progress-ratification commit has **not** been created at the time of writing, and this record does **not** self-accept.

**The Step 7H design phase is complete.** **A-1 … A-6 are fully ratified** by the committed audit-chain design baseline `3e479b6` (`docs/plan/STEP_7H_AUDIT_CHAIN_BASELINE.md`) and recorded as **D-261 … D-272**. **Audit-chain SQL remains unstarted and Step 7I remains unstarted.** After this record is accepted, the next bounded checkpoint may **author and stage one Step 7H audit-chain migration for static review** and **must stop before local application or commit** — it still requires its own separate, explicit orchestrator authorization. The accepted sequence **7F → 7G → 7H → 7I → 7J** is unchanged.

**No further implementation is currently authorized.** This checkpoint made **no** code, dependency, schema, migration, seed, Auth, fixture, database-type, runtime, Supabase, test, or Figma change, and **ran no database, Docker, psql or hosted command**; the local stack remains **stopped** with **no Supabase container**; `supabase login` / `supabase link` remain deferred; no tag, remote or push occurred; `.env.local` was not accessed. **No password or credential was requested, printed or persisted.** Synthetic data only.
