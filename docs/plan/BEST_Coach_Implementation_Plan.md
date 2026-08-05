# B.E.S.T Coach — Implementation Plan (Orchestrator's Script)

**Companion to:** `CLAUDE.md` (the agent's standing contract), the Complete MVP Specification (v3), its ratified **Amendment 001** (`docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_001.md`), its ratified **Amendment 002** (`docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_002.md`), and its ratified **Amendment 003** (`docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_003.md`)
**Audience:** you, as orchestrator and reviewer, working with Claude Code in VS Code
**Purpose:** a start-to-end script for driving the build, with concrete tasks, verification steps, and review checklists at every stage — not just a restatement of the phases in `CLAUDE.md`.

> **Authority (Amendment 001 A-012).** This plan is **procedural** — it may add Phase 5 (final integration/UAT/quality) and review detail, but it **cannot override** the specification or a ratified amendment. Where this plan and v3-as-amended disagree, **v3-as-amended governs**. Several passages below were reconciled to Amendment 001 and then to Amendment 002; each is marked inline.

> **Amendment 002 reconciliation (2026-07-30).** This plan is reconciled to Amendment 002 **A-014 … A-024**: the one-centre / three-flow MVP boundary; the **Centre → Class Grade → Class Module → Class Session** hierarchy; **mandatory nine-dimension assessment with Quick mode removed**; Present-by-default attendance with a trainer Absent toggle; management administration scope; the profile/invitation model; **one canonical role-aware feedback report**; **Figma Design 2 as the final UI authority**; **Supabase-native data access with no general-purpose ORM**; and the revised three-flow phasing and UAT.
>
> **Amendment 003 reconciliation (2026-08-03).** This plan is reconciled to Amendment 003 **A-025 … A-032**: centre-independent `accounts` with **membership-scoped roles**; enum-vs-reference-table rules; the **absolute authentication-secret prohibition** for application tables; the report **aggregate/version** model with **approval as the freeze point**; audit-compatibility guarantees; the **deny-by-default** privilege posture; and the **exact Step 7E boundary of 10 enums, 22 tables and 13 deterministic seed rows**, with its explicit exclusions. Amendment 003 **clarifies rather than reverses** Amendment 002 and **names no Amendment 001 clause**.
>
> **Amendment 003 is not an implementation authorization.** It governs **schema architecture and migration boundaries**. **Step 7E remains blocked, unauthorized and unstarted** after Amendment 003 is staged **and** after it is committed. Ratifying an architecture is not the same as authorizing its construction — **Step 7E requires a separate, explicit orchestrator authorization**.
>
> **Amendment 004 reconciliation (2026-08-05).** This plan is reconciled to Amendment 004 **A-033 … A-040**: the **two-stage governed report workflow** (trainer assessment → AI draft → trainer edit → **trainer approval** → management notification → **management final quality review** → **management Approve & Submit** → canonical/submitted/parent-visible → parent notification); the **management editing boundary** (parent-facing wording only, never assessment substance); the **conditional return-to-trainer** and its bounded structured correction request; the **eight-value status set** adding `trainer_approved`; **dual approval provenance with trainer-approved source lineage**; **management's pre-submission read** alongside the unchanged, absolute parent submitted-only read; **notification lifecycle triggers**; and the **exhaustive, Step-7I-only additive schema set**.
>
> **Amendment 004 supersedes A-019 item 14, A-021's Management "View only" row and four of its management-scoped bullets, A-028's seven-status set, and v3 §13's transition model. (Both counts corrected at Step 7I1F-R3: the bullet count was stated as two, and A-028 was wrongly named as the source of the superseded transition set — A-028 enumerates no transitions and its `submitted → needs_edit` exit rule is preserved. Amendment 004's own supersession table is the authoritative list.)** Passages in this plan that still say management is view-only, that management may never edit report content, or that the trainer performs "Approve & Submit", are **superseded** — each is corrected inline below. **The parent boundary is unchanged and absolute**, and every named parent-side test in this plan stands verbatim.
>
> **Amendment 004 is not an implementation authorization.** **Step 7I remains unstarted and unauthorized**, and each Step 7I sub-checkpoint still requires its own explicit orchestrator authorization.
>
> **Step 7I1D-R2 correction pass (2026-08-05).** The Step 7I1C adversarial review found that the claim "each is corrected inline below" was **not** true of four passages, which are now corrected and marked in place: Phase 1's report-state-machine item said **"all seven states"** (now **eight**, A-036); the Class Statistics status-gating verification item named a **`Pending Review`** status that has never existed in the ratified enum and predated A-038's `trainer_approved` row rule; the A-021 verification register said the checklist reset blocks **"Approve & Submit"** (it blocks the **trainer's "Approve"**, A-033); and Phase 3's management read projection was scoped to **"approved `report_versions` only"**, whose referent is empty at aggregate level now that `approved` never commits (now **submitted**). **No other passage in this plan was found to instruct the superseded workflow.**
>
> **Accepted history is not renumbered and not rewritten.** The completed migration and Phase 0 checkpoints — through the **complete, accepted Step 7D sequence** (Supabase environment and client boundaries) — **remain historically unchanged**. The product decisions in Amendment 002 **do not invalidate the accepted Step 7D client-boundary work**: Step 7D created browser / request-scoped / elevated client boundaries only, committed the project to no domain shape, and is unaffected by a scope or hierarchy decision. No accepted checkpoint identifier below is renumbered.

---

## How to use this document

`CLAUDE.md` tells Claude Code the rules. This document tells **you** what to do at each stage: what to prepare, what to ask for, what to personally check before signing off a phase, and what "done" concretely means. Read a phase's section here before opening that phase's session in Claude Code, and use its review checklist as your literal sign-off script when the agent reports a phase complete.

Sizing note: instead of calendar estimates (which would be false precision this early), each phase is sized in **focused Claude Code sessions** — a rough planning signal, not a schedule commitment. A "session" here means one sustained working block with a clear goal, not a calendar day.

---

## What "fully functional and 100% tested" means in practice

No non-trivial software is provably bug-free. What this plan builds toward instead is a precise, checkable definition of done:

1. Every phase's exit condition (below and in `CLAUDE.md` §10) is **demonstrated**, not just claimed.
2. Every persona checklist item in `CLAUDE.md` §3 has a **named, passing automated test** behind it where the checklist calls for one.
3. A full **manual UAT script**, one per required MVP role — **management, trainer, parent (Amendment 002 A-024)** — is walked end-to-end without a governance violation. **TA UAT is not an MVP completion gate**; the TA flow is deferred.
4. An **accessibility audit tool** runs clean against every screen — **Lighthouse is the initial approach (Amendment 001 A-009)**; do not add `axe-core` or another accessibility package unless later justified and approved.
5. A **security review pass** (checklist in Phase 5 below) is completed and signed off.

That combination — automated proof plus structured manual verification plus a named quality-tool pass — is what "fully working" operationally means for this project. Treat any phase reported "done" without evidence against these four as not actually done.

---

## Phase −1 — Orchestrator-only setup (before Claude Code opens)

Nothing here is Claude Code's job — it cannot complete OAuth flows or hold API keys until you give them to it.

**Checklist:**
- [ ] Create the Supabase project via the dashboard. **Confirm the Singapore region at creation** — this cannot be changed later without a migration.
- [ ] Record: Supabase project URL, anon key, service role key.
- [ ] Obtain the LLM provider API key.
- [ ] **(Amendment 001 A-005) — Git is already done, locally.** The MVP is already a **local** Git repository (`main`, scaffold committed); **GitHub, a remote, and cloning are NOT prerequisites for Phase 0.** A remote/push happens only on your explicit instruction later. (The older "create the git repository (GitHub or equivalent); clone it" step is superseded.)
- [ ] **Governance documents are already installed** (Step 5B) at the paths in `CLAUDE.md` §1: root `CLAUDE.md`, `docs/spec/BEST_Coach_Complete_MVP_Specification_v3.md`, `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_001.md`, `docs/plan/BEST_Coach_Implementation_Plan.md`, `docs/progress/STATUS.md`, `docs/progress/BUILD_NOTES.md`.
- [ ] **(A-011)** `BEST_Coach_AI_Features_Breakdown_v2.docx` is **currently unavailable and non-blocking** for Phases 0–4 — do not fabricate it; obtain it only before scoping a deferred aggregate AI feature.
- [ ] **(A-013 as superseded by Amendment 002 A-022)** The final UI authority is **Figma Design 2**, not Stitch. UI reference material is installed **selectively later, after an approved disposition** — it is **not** a Phase 0 prerequisite and does **not** block the first SQL migration. See the **Figma Design 2 implementation-readiness gate** below and `docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md`.
- [ ] Create `.env.local` (git-ignored) with your real keys; create a matching `.env.example` with placeholder values for Claude Code to reference.
- [ ] **(A-006) Toolchain is ratified:** Node.js **24 LTS** (`.nvmrc` `24`, engines `>=24 <25`), **npm** (`npm@11.13.0`). This supersedes the older "Node 20 LTS, npm or pnpm" recommendation.

**Exit condition:** the Supabase project (Singapore) exists with keys recorded, the LLM key is obtained, and `.env.local` is populated. The repository, governance docs, `STATUS.md`, and `BUILD_NOTES.md` are already in place. Only then start Phase 0.

---

## Gate G1 — Governance and schema-preflight gate (mandatory, before Step 7E / the first SQL migration)

**Added by the Amendment 002 reconciliation. This gate is new; it renumbers nothing.**

**Where it sits.** After the accepted Step 7D sequence (Supabase environment and client boundaries) and **before Step 7E** (the first governed SQL migration and database foundation). **No migration may be written while any item below is unresolved.**

**Why it exists.** Step 7D delivered client boundaries only. The first migration is the point at which product decisions become physical schema, so every decision the schema depends on must be ratified at the correct precedence level first — not recorded only in a low-precedence tracker.

**G1a — Governance items (resolved by Amendment 002, verify they are actually reflected in the active documents):**

- [ ] **Supabase-native data access, no general-purpose ORM** is ratified at spec-amendment level (**A-023**) and reflected in `CLAUDE.md` (ADR-8, §9) and this plan. Spec §18 / older `CLAUDE.md` §9 "Prisma or Drizzle" wording is historical.
- [ ] **The canonical hierarchy** Centre → Class Grade → Class Module → Class Session (**A-016**) is reflected everywhere schema planning happens; "Academic Level" appears nowhere as an active term.
- [ ] **Mandatory nine dimensions, Quick mode removed** (**A-017**) is reflected in the plan, `CLAUDE.md`, and the intended enum/validation design — **no `mode` column, no four-dimension completion path, no four-dimension fallback.**
- [ ] **Attendance defaults `Present` with a trainer `Absent` toggle**, unique per student + class session, auditable (**A-018**).
- [ ] **Management administration scope** (**A-019**) and the **profile/invitation model** (**A-020**) are reflected in the intended identity and class-hierarchy tables.
- [ ] **One canonical role-aware report** (**A-021**) is reflected in the intended report read model — one shared projection, not three.
- [ ] **One centre, three flows** (**A-014**, **A-015**) is reflected in scope, seed design, and RLS scoping — with the `centres` entity and its relationships kept real.
- [ ] **Schema architecture and the first-migration boundary** are ratified at spec-amendment level (**Amendment 003, A-025 … A-032**) and reflected in `CLAUDE.md` (§1 precedence and table, ADR-3, ADR-7, §6, **§6.1**, §9, §10 Phase 0, §12) and this plan. Any older `management_centre_assignments` / `trainer_class_assignments` / `parent_child_links` naming, `reports.checklist_*` column location, or `report_versions.kind` / `audience` visibility mechanism is **historical**.

**G1b — Schema-critical decisions (RESOLVED by Amendment 003; verify each is reflected, do not re-decide):**

Each item below records the decision that closed it. **These are no longer open questions — a differing schema shape is a defect, not a choice.**

- [x] **`public` profile relationship to `auth.users`** → **A-025**: centre-independent `accounts` with an **application-owned UUID** and a **nullable, unique `auth_user_id`**. Profiles never key to `auth.users`. `students` have **no** Auth linkage at all. *(Closes Amendment 002 U-17.)*
- [x] **Role authority** → **A-025**: role lives **only** on `centre_memberships` (`management` / `trainer` / `parent`; **no TA**). **No `role` or `centre_id` on `accounts`.** Account lifecycle (`active`/`deactivated`) and membership lifecycle (`pending`/`active`/`deactivated`) are **separate**. Role changes **deactivate and re-create** a membership. Role/profile agreement uses **composite keys and composite FKs**, never a cross-table `CHECK`. Cardinality (one active membership per account+centre; one active `management` membership per centre) uses **partial unique indexes restricted to active rows**.
- [x] **Audit target representation** → **A-029**: **polymorphic target IDs with immutable minimal snapshots and no FK**, plus a **related-target child table** (not a JSONB blob). **Durable actor FKs (`RESTRICT`) for centre/account/membership attribution** — this is **not** a blanket no-FK rule. *(Closes Amendment 002 U-12.)*
- [x] **Report-status storage representation** → **A-028, as superseded by Amendment 004 A-036**: a normalized `report_status` enum with **exactly eight** values — `incomplete`, `observation_saved`, `drafting`, `draft_ready`, `needs_edit`, **`trainer_approved`**, `approved`, `submitted`. **`trainer_approved` is the persisted management-review state**; **`approved` stays transient-in-transaction only** and is never committed; **no additional management-review status may be added**. **`Evidence Pending` is not a stored status** (evidence scope/uploader unresolved — A-014); this deletes **no** evidence safeguard.
- [x] **`GRANT` strategy for new tables** → **A-030**: **deny-by-default**. Step 7E enables RLS on every table with **zero policies** and **zero client privileges** (no `SELECT`, no DML, no `EXECUTE` for `PUBLIC` / `anon` / `authenticated` / `service_role`); `CREATE` on `public` revoked from `PUBLIC`. **Privilege and policy are separate layers.** In **Step 7G**, **a policy and its minimum matching grant ship together**. *(Closes Amendment 002 U-16.)*
- [x] **Enum versus reference table** → **A-026**: enum for **closed, security/workflow-bearing, non-runtime-editable** vocabularies; table where **FK identity, ordering or labels** are needed; **hybrid** for **Class Grade** (`class_grade_code` enum + **centre-owned** rows) and the **nine dimensions** (`dimension_code` enum + **global** rows). Session-lifecycle and audit vocabularies are **deferred — do not invent a placeholder enum.** *(Closes Amendment 002 U-19.)*
- [x] **Invitation token and expiry** → **A-027**: **no application table may hold a raw token, OTP, password, access token, refresh token or secret hash** — enforced by the **absence of any such column**. An invitation targets a **`pending` centre membership**, carries an **immutable normalized email** (acceptance-time proof only) plus **stored status and `expires_at`**, and its **effective expiry is evaluated transactionally** (a partial unique index cannot reference `now()`). **Revoke or supersede before reissue**; **reuse the existing account** for a later-centre invitation. *(Closes Amendment 002 U-18. Invitation **duration** remains an operational default — U-20 — and does **not** block schema design.)*
- [x] **Report aggregate and freeze point** → **A-028**: one aggregate per Class Session + student (valid enrolment required) owning the status, `lock_version`, `current_cycle_version_id` and `latest_submitted_version_id`; **self-contained versions** with **exactly nine immutable rating snapshots**; **approval — not submission — freezes**; **version-scoped immutable checklist and approval evidence**; edits **clone into a new version**; a submitted version **never reopens**; the **previous submitted version stays canonical** during correction. **No version-kind enum and no audience column.** **(Amendment 004 A-037 — strengthened, not relaxed.)** **Every** accepted content change now creates a new immutable version — trainer edits, AI drafts/regenerations and management wording edits alike; nothing is mutated in place. Approval remains the freeze point, and **trainer approval is what freezes** the trainer-reviewed version. A version additionally carries an explicit **trainer-approved source** reference, and `report_version_approvals` holds **at most one trainer approval and one management approval per version**, each role-pinned by constraint.
- [x] **First-migration table and enum scope** → **A-031**: **exactly 10 enums, 22 tables and 13 deterministic seed rows** — the canonical inventory in Amendment 003 A-031 and `CLAUDE.md` §6.1. **Seed UUIDs are fixed literals across environments**, and a seed insert **asserts on the natural key and fails on divergence** — never a silent upsert, never a quiet do-nothing. Centre seed values: code **`ispeak`**, display name **`iSpeak Academy`**.

**G1c — Audit-design decisions (ratify before the audit-chain checkpoint; they do not block the first migration):**

- [x] **Audit target representation** — **RESOLVED by A-029** (moved to G1b above; retained here for traceability).
- [ ] **Audit-chain scope** — one global chain vs one chain per target/tenant. **(Amendment 002 U-13 — still open.)**
- [ ] **SHA-256 ratification** for the audit hash (spec §23 names no algorithm). **(Amendment 002 U-14 — still open.)**
- [ ] **Audit-chain genesis rule** — sentinel vs zero-hash for the first entry. **(Amendment 002 U-15 — still open.)**
- [ ] **Canonical serialization**, **previous-hash rules**, and **verification/repair procedures**. **(Explicitly NOT ratified by Amendment 003 — Step 7H.)**

**G1d — Checkpoint decomposition and the Step 7E boundary (Amendment 003 A-031, A-032).**

**Phase 0's build list is the *phase* scope, not the first migration's scope.** It is delivered as separate, separately-authorized checkpoints, in this order:

| Checkpoint | Scope |
|---|---|
| **7E** | The **first governed migration** — exactly the A-031 inventory: 10 enums, 22 tables, 13 seed rows, all constraints and indexes, **RLS enabled with zero policies and zero client grants** |
| **7F** | Synthetic Auth users and domain fixtures |
| **7G** | **RLS policies with their minimum matching grants**, and the access proofs |
| **7H** | Audit tables and the hash chain |
| **7I** | Reviewed **read/mutation RPCs** and server-action proof |
| **7J** | Committed **generated database types** |

**Excluded from Step 7E** — do not fold a later checkpoint's artefacts into the first migration: RLS policies and client grants (7G) · Auth users and fixtures (7F) · audit objects and hash chain (7H) · RPCs and server-action proof (7I) · generated database types (7J) · AI schema · evidence schema · session-lifecycle enum · private helper schema · **views, RPCs and helper functions (absent from Step 7E entirely)** · UI and Figma implementation. **No placeholder or dangling AI/evidence/audit/hash-chain columns, and no extension** — PostgreSQL 17 built-ins suffice.

**Gate rule.** Every G1a and G1b item must be **explicitly ratified and recorded** before Step 7E begins — **G1b is now satisfied by Amendment 003, and its items are to be verified as reflected, not re-decided.** G1c items must be ratified before the audit-chain checkpoint. **If an item is unresolved, stop and request an orchestrator decision — do not guess a schema shape and do not "decide it in the migration."**

**Authorization rule — separate from the gate.** Passing Gate G1 makes Step 7E **eligible**; it does **not** make it **authorized**. **Step 7E is blocked, unauthorized and unstarted**, and stays that way until the **Step 7E0D ratification checkpoint is accepted and committed** *and* the orchestrator issues an **explicit Step 7E authorization**. **Amendment 003 does not authorize migration implementation.**

**Step 7E0D — schema-critical decision ratification (the checkpoint that closes G1b).**

- **Step 7E0D1 — read-only architecture analysis: COMPLETE.** Decisions A–G were analysed and corrected across the review; the analysis produced **no file, SQL, schema, Auth, runtime or repository change of any kind**. It was analysis only and ratified nothing by itself.
- **Step 7E0D2 — ratification and documentation only.** Records the ratified architecture at the correct precedence levels (**Amendment 003**), reconciles `CLAUDE.md` and this plan, and updates the progress and tracker records. **It creates no SQL, migration, seed, Supabase function, Auth user, fixture, database type, application code, test, dependency or Figma asset.** Step 7E0D2 is a **documentation checkpoint**; completing it authorizes **nothing** beyond itself.

**Step 7F0 — synthetic fixture design ratification (the checkpoint that prepares Step 7F).**

- **Step 7F0A — read-only synthetic Auth and domain-fixture design: COMPLETE.** Produced the minimum fixture purpose, the exact synthetic identities, the domain inventory and insertion order, the assessment/report boundary options, the Auth bootstrap and invitation boundary, the delivery-mechanism evaluation and the verification/negative-test plan. **No file, database, Auth, fixture, runtime or repository change of any kind occurred.** It was analysis only and ratified nothing by itself.
- **Step 7F0B — read-only resolution of implementation mechanics: COMPLETE.** Resolved the caller-supplied Auth UUID capability against the installed local sources, the single repeatability rule, the credential-acquisition mechanism, and the reload/idempotence and failure-recovery design. **No file, database, Auth, fixture, runtime or repository change of any kind occurred.**
- **Step 7F fixture design — RATIFIED BY THE ORCHESTRATOR (2026-08-03).** Recorded in **`docs/plan/STEP_7F_SYNTHETIC_FIXTURE_BASELINE.md`**, which is a **development-fixture implementation record, not a specification amendment**, and is subordinate to the spec, every amendment, `CLAUDE.md` and this plan. **Use its values; do not re-derive them.**
- **Step 7F0C — documentation and governance only.** Creates the fixture-baseline record and reconciles `CLAUDE.md` and this plan. **It creates no fixture script, SQL fixture file, `seed.sql`, migration, Auth user, password, policy, grant, RPC, application code, test or Figma asset**, starts no database, and runs no database or hosted operation. Completing it authorizes **nothing** beyond itself.

**Ratified Step 7F content — the exact minimal footprint.** **3 synthetic Auth identities and 25 application-domain rows**, and no more:

| Group | Rows |
|---|---|
| **Core (15)** | 3 `accounts` · 3 `centre_memberships` · 1 `trainer_profiles` · 1 `parent_profiles` · 1 `students` · 1 `parent_student_links` · 1 `class_modules` · 1 `class_sessions` · 1 `enrolments` · 1 `class_session_assignments` · 1 `attendance` |
| **Assessment (10)** | 1 `observations` · 9 `observation_ratings` |

Anchored on the existing Step 7E seed centre (`ispeak` / `iSpeak Academy`) and Class Grade `beginner`. Identities are `Fixture Manager One`, `Fixture Trainer One` and `Fixture Parent One` at reserved `example.test` addresses; the student is `Fixture Student One` with **no Auth identity of any kind**. Attendance is `present` with **both recorder columns NULL**, because it represents default roster initialization rather than a trainer action.

- **Assessment/report boundary — Option B (ratified).** The observation and all **nine** ratings exist, deliberately mixed across all four levels including two at the lowest level and two at the highest. **(Amendment 006 A-049: those levels are now `beginning` and `mastered`. The fixture files still carry the superseded `emerging`/`advanced` values until reconciliation checkpoint V2 — see `docs/plan/COMPETENCY_VOCABULARY_RECONCILIATION_PLAN.md`.)** **`reports`, `report_versions`, `report_version_ratings`, `report_version_checklist_progress`, `report_version_approvals` and `invitations` all remain at zero rows.** **This zero-row state is also the precondition that keeps the A-053 enum rename safe — see the reconciliation plan.** **No report lifecycle, approval, publication, invitation-acceptance or Management-bootstrap transition is fabricated.**
- **Delivery mechanism (ratified).** A tracked local-only Node ESM loader (`scripts/fixtures/load-local-fixtures.mjs`) plus tracked static transactional SQL (`scripts/fixtures/local_fixtures.sql`) and verification SQL (`scripts/fixtures/verify-local-fixtures.sql`), with **one** future `package.json` script entry and **no new dependency**. The domain SQL runs through the **local database container's `psql`**; Auth users are created through the **local Auth Admin API**. **No `supabase/seed.sql`, no second migration, no direct insertion into `auth.users`, no password hash, no invitation row.** None of these files exist yet and none may be created until Step 7F is authorized.
- **Deterministic Auth UUIDs (ratified).** Caller-supplied through the supported Auth Admin API: management `d0000000-0000-4000-8000-000000000001`, trainer `...002`, parent `...003`, linked explicitly through `accounts.auth_user_id`. Every Auth and domain UUID and every fixture timestamp is a **fixed literal**, so the acceptance checksum covers **all** fixture columns including `accounts.auth_user_id`. **The runtime-generated Auth UUID fallback is withdrawn**, and a returned UUID that does not match its ratified literal must **abort the load rather than adapt**.
- **Credential rule (absolute).** Fixture passwords are entered **only through no-echo interactive stdin in an operator-controlled local terminal** — **no environment-variable path**, no default, no file source. **No password may be requested or transmitted in chat**, and **no credential of any kind may be written to any tracked or untracked file, printed, or logged.** **No pattern-based redaction**: credential-bearing stdout and stderr are captured and left unrendered. Local connection values are captured into **process memory only**, and the loader **aborts** unless the API URL is loopback, the configured ports match, and no project reference exists.
- **Reload and recovery (ratified).** A duplicate load without `--reload` **fails** rather than absorbing divergent state; `--reload` deletes **only** exact fixture UUIDs and exact reserved fixture emails, in **reverse-FK transactional** order, with the **Step 7E seed rows never in the deletion set** and asserted intact before commit; Auth deletion uses the Auth Admin API with **exact reserved-email matching**; and a partial failure between Auth creation and the domain transaction is **compensated** so no non-fixture user is ever deleted and no state is persisted.

> **Step 7F remains unauthorized and unstarted.** Ratifying the fixture design made Step 7F **ready**, not **authorized** — the same distinction Gate G1 drew for Step 7E. **Step 7F requires a separate explicit orchestrator authorization**, and the **7F → 7G → 7H → 7I → 7J** sequence in G1d is unchanged, with each remaining checkpoint separately authorized.

**The broader fixture shape is deferred, not deleted.** The Step 7F baseline is the explicit "unless told otherwise" exception to `CLAUDE.md` §11's standing fixture shape. The larger dataset — **2 trainers, 2 class modules, 3–4 enrolled students per module, 2 parent accounts, and a second Class Session** — remains required as a **later additive fixture expansion**, before the Phase 1 grounding-validation contradiction proof (persona §3.4) and the session-to-session follow-up continuity proof can be demonstrated.

---

## Gate G2 — Figma Design 2 implementation-readiness gate (mandatory, before the first Figma-based UI implementation checkpoint)

**Added by the Amendment 002 reconciliation (A-022.1). This gate is new; it renumbers nothing.**

**Where it sits.** Immediately **before the first Figma-based UI implementation checkpoint** — i.e. before any screen from the Figma Design 2 prototype is built. It sits **after** Gate G1 and does **not** gate G1 or Step 7E.

**What you (the orchestrator) must provide or verify for each approved screen:**

- [ ] a node-specific Figma `/design/` link where possible;
- [ ] the authoritative screen name; the applicable user flow; the intended route;
- [ ] desktop, mobile or responsive variants where applicable;
- [ ] component states and interaction states;
- [ ] **loading, empty, validation, error, success and disabled** states;
- [ ] design variables, or an approved **token inventory** — typography, colours, spacing, radii, shadows;
- [ ] approved **logos**, **SVGs**, **icons**, and **image assets**;
- [ ] prototype transitions or interaction notes not evident from a static frame;
- [ ] any **discrepancy between a Figma frame and a ratified governance or domain rule**.

**Porting rules (A-022.2).** Port only approved presentation information and approved assets. **Never blindly port** generated React code, Figma mock data, prototype-only navigation, fake authentication, static hard-coded user identities, duplicated calendar records, client-side authorization assumptions, database schema inferred from a visual frame, business logic inferred only from a visual frame, report permissions inferred only from whether an Edit button is visible, generated CSS/components that conflict with the MVP design system, or prototype shortcuts that bypass Supabase, RLS, or server-side validation.

**Blocking classification (A-022.3) — read this before treating a missing frame as a project blocker:**

- A missing node-specific link, asset, state, or field definition **blocks only the affected UI implementation checkpoint**.
- It **does not block Step 7E or any schema work** — **unless** the missing visible field **changes the actual domain relationship model**, in which case it escalates to a G1b item.

**Stop-don't-guess rule.** When a required node-specific frame, approved asset, interaction state, responsive state, or visible field definition is missing, **implementation must stop and request orchestrator input.** Guessing a field, silently recreating a missing screen, or inferring a permission from a visible button is prohibited. A blocked screen reported honestly costs a message; an invented requirement costs a rebuild.

**Working artefact.** `docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md` holds the per-screen inventory and the **"Orchestrator Figma Porting Actions"** checklist that operationalises this gate.

### G2.1 — The ratified 36-screen inventory and the four screen classes (Amendment 005, A-041 … A-048)

**A large part of Gate G2 is now discharged.** The orchestrator has supplied a **node-specific `/design/` link and node ID for all 36 screens** — **3 authentication screens (`AUTH-01` … `AUTH-03`)** and **33 portal screens (Trainer 01–10 · Management 11–29 · Parent 30–33)** — in Figma file `sSY1TYw3jyVlZDy8V2Mu7g` (`SDS-dashboard`). **Portal numbering 01–33 is preserved; authentication IDs sit outside it.**

**The per-screen record is `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md`.** Do not duplicate it here and do not re-derive it.

**Still outstanding at G2, for every screen:** the six required state frames (loading, empty, validation, error, success, disabled), the token inventory, typography/colour/spacing/radii/shadow scales, logo and icon exports, responsive variants, prototype transitions and interaction notes. **A node ID is not a discharged gate** — it discharges only the "node-specific link, screen name, flow and intended route" line.

**Sequence the work in these four classes, in this order.**

**Class 1 — the twelve physical-test-critical screens.** These, and only these, block the physical-test walkthrough, in this contiguous flow order:

| Flow | ID | Screen | Canonical route |
|---:|---|---|---|
| 1 | AUTH-01 | Trainer Login | `/login?role=trainer` |
| 2 | 05 | Trainer Schedule | `/trainer/schedule` |
| 3 | 06 | Trainer Student Roster | `/trainer/schedule/[sessionId]/student-roster` |
| 4 | 07 | Trainer Grade Student | `/trainer/schedule/[sessionId]/student-roster/[studentId]/grade-student` |
| 5 | 08 | Trainer AI Report Generation | `/trainer/schedule/[sessionId]/student-roster/[studentId]/grade-student/ai-report-generation` |
| 6 | 10 | Trainer Student Report | `/trainer/reports/[reportId]` |
| 7 | AUTH-02 | Management Login | `/login?role=management` |
| 8 | 29 | Management Reports | `/management/reports` |
| 9 | 19 | Management Student Report | `/management/students/[studentId]/reports/[reportId]` |
| 10 | AUTH-03 | Parent Login | `/login?role=parent` |
| 11 | 32 | Parent Reports | `/parent/reports` |
| 12 | 33 | Parent Class Report | `/parent/reports/[reportId]` |

**Only the twelve core screenshots are required immediately.** **One open decision blocks Class 1 completeness: ID 05 has no implemented route** (inventory §7.3 / Amendment 005 U-A5-1) — accept the fold into the trainer landing surface for the test, or build `/trainer/schedule` before it. **Decide it; do not improvise it.**

**Class 2 — the twenty-four deferred portal screens.** `Post-48-hour final-MVP scope` — **required for the final MVP, not required before the physical test**: 01 · 02 · 03 · 04 · 09 · 11 · 12 · 13 · 14 · 15 · 16 · 17 · 18 · 20 · 21 · 22 · 23 · 24 · 25 · 26 · 27 · 28 · 30 · 31. **Do not require these to be visually complete before the physical test**, and do not let their absence be reported as a physical-test blocker. Deferral **deletes no safeguard**.

**Class 3 — backend-dependent screens.** These cannot be built truthfully until a governed read/write path exists; a screen in this class is **blocked on backend work, not on a frame**:

| Missing backend path | Screens |
|---|---|
| Lesson-plan schema, RPC and governance (none exists in the census) | 03, 14 |
| Session- and class-level statistics projections | 15, 16 |
| Class-module list, overview and calendar projections | 12, 13, 25 |
| Management student/trainer list, profile and edit projections and write paths | 17, 18, 22, 23 |
| Creation and invitation write paths | 20, 21, 24, 26, 27 |
| Trainer-scoped class and student projections | 02, 04 |
| Parent calendar projection | 31 |
| Trainer schedule/date projection | **05 (core slice)** |
| Centre-scoped management dashboard summary | 11 |

**Class 4 — separately governed screens.** **ID 28 Management Term Report** remains **separately governed before implementation**. Term-report **generation is out of MVP scope** (spec §28; `CLAUDE.md` §5, §8) — evidence is captured, the generator is not built. **Its presence in the visual inventory authorizes nothing.** Screens **20, 21, 24 and 26** additionally carry `Governance decision missing` because their exact field inventories are **UNRESOLVED** — **do not invent a field.**

**Route compatibility is planned, not executed.** The inventory §7 records every mismatch between an implemented route and its canonical route, with one treatment each (move / redirect / alias / replace after integration / operator decision required). **Executing any treatment requires its own authorization**, and no route code was changed to produce the plan.

**Screen presence is not authorization.** A frame authorizes no lifecycle transition, role, permission, database mutation, AI operation, protected-content access, direct table access, Management power or Parent access to unpublished content. Record missing governance as a dependency (A-045).

---

## Phase 0 — Foundations

**Sessions (rough):** 2–4.

**What you ask Claude Code to do:**
1. Read `CLAUDE.md` fully, then the spec fully, then **Amendment 001**, then **Amendment 002**, then **Amendment 003**, then this Implementation Plan. (The AI Features Breakdown is **currently unavailable and non-blocking** — A-011; UI reference material is **installed later, after an approved disposition** — A-013/A-022, so for Phase 0 use the **spec §8 Screen & Page Inventory as amended by Amendment 002 A-014/A-019** plus the Figma screen matrix as the screen list.) Confirm back to you in its own words what the core governance rule is, before writing any code — this is a cheap way to catch a misread early.
2. Scaffold the Next.js (App Router) project with the `/server/modules/*` structure from `CLAUDE.md` §9.
3. Install and configure the **Supabase-native** client libraries (`@supabase/ssr`, `@supabase/supabase-js`) and the browser / request-scoped / elevated `server-only` boundaries; connect to your Singapore project using the `.env.local` values. **(Amendment 002 A-023): no Prisma, no Drizzle, no general-purpose ORM.** Supabase SQL migrations are the schema source of truth; generated Supabase database TypeScript types are authoritative for application data types.
4. Write the initial schema migration **only after Gate G1 has passed *and* the orchestrator has explicitly authorized Step 7E**. **(Amendment 003 A-031, A-032 — this step is now bounded):** Step 7E creates **exactly** the canonical inventory — **10 enums, 22 tables and 13 deterministic seed rows** (Amendment 003 A-031; `CLAUDE.md` §6.1) — with all constraints and indexes, **RLS enabled on every table**, **zero policies** and **zero client grants**. It creates **no** `audit_events`, **no** PDPA tables (`consent_records`, `retention_policies`, `erasure_requests`), **no** view, RPC or helper function, and **no** placeholder AI/evidence/audit column; those belong to their own checkpoints per **G1d**. Physical names come from the ratified inventory — **`centre_memberships`, `class_session_assignments`, `parent_student_links`**; the older `management_centre_assignments`, `trainer_class_assignments` and `parent_child_links` names are **historical**. The hierarchy is **Class Grade / Class Module / Class Session** (replacing the flat `classes` → `class_sessions` assumption), and `observation_ratings` carries the B.E.S.T enums — **all nine dimensions, no `mode` column**.
   - **Keep `centres` a real entity with real relationships.** The MVP runs on **exactly one seeded centre**, but the one-centre operation must come from **seed data and the absence of centre-management UI**, never from hardcoding the centre away, dropping the foreign keys, or collapsing centre scoping out of RLS. Future multi-centre support must stay **additive**.
   - **Calendars are projections**, not stored event tables. Do not create a management-calendar table and a trainer-calendar table; both views read the same class-session records, filtered by the live trainer assignment.
5. Implement the audit module: append-only grant (`INSERT`-only, `UPDATE`/`DELETE` revoked at the DB level), hash-chaining logic (`entry_hash = hash(prev_hash + payload)`). **(Amendment 003 A-029, A-032): this is Step 7H, not Step 7E** — the first migration creates no audit object. Step 7E must only avoid making this design impossible later (stable account/membership attribution; durable actor FKs; polymorphic targets with label snapshots). **Chain scope, canonical serialization, hash application, previous-hash rules, genesis, and verification/repair are NOT ratified — G1c. Do not infer or default them.**
6. Wire Supabase Auth; scaffold a minimal login flow for at least the trainer role. **(Step 7F0 ratification, 2026-08-03): the synthetic Auth identities this depends on are Step 7F**, whose ratified design is `docs/plan/STEP_7F_SYNTHETIC_FIXTURE_BASELINE.md` — **exactly three** local identities (management, trainer, parent) created through the **local Auth Admin API** with caller-supplied deterministic UUIDs and linked through `accounts.auth_user_id`. **The student has no Auth identity.** **Step 7F is unauthorized and unstarted** — do not create an Auth user, and never request, print or persist a password.
7. Write an initial RLS policy for one table (e.g. `reports`, scoped to trainer-class assignment) as a proof of the pattern — full RLS coverage comes in Phase 1, but Phase 0 proves the mechanism works at all. **(Amendment 003 A-030, A-032): this is Step 7G, not Step 7E.** Step 7E **enables** RLS with **zero policies and zero client grants**; the first policy arrives **together with its minimum matching grant** — neither is added alone. Remember that **privilege and policy are separate layers**: a missing grant must never be misdiagnosed as an RLS failure.
8. Set up the testing stack: Vitest + React Testing Library, Playwright (**pre-approved by Amendment 001 A-009 — install without a separate flag**), and write the seed script producing the synthetic dataset from `CLAUDE.md` §11.
   - **(Step 7F0 ratification, 2026-08-03) — the fixture half of this step is now bounded.** For **Step 7F** the dataset is the ratified minimum in `docs/plan/STEP_7F_SYNTHETIC_FIXTURE_BASELINE.md` — **3 Auth identities and 25 domain rows**, Option B, with `reports` and `invitations` at zero. It is **not** delivered as a "seed script" in the `supabase/seed.sql` sense: **no `supabase/seed.sql` and no second migration**. It is a **local-only** Node loader plus static transactional SQL under `scripts/fixtures/`, with **no new dependency**. **Step 7F is unauthorized and unstarted — create none of these files yet.**
   - **The broader `CLAUDE.md` §11 shape is deferred, not deleted.** The 2-trainer / 2-module / 3–4-student / 2-parent dataset **plus a second Class Session** remains required as a **later additive expansion**, before the Phase 1 grounding-validation contradiction proof and the follow-up continuity proof.
9. Maintain the permanent continuity documents `docs/progress/STATUS.md` **and** `docs/progress/BUILD_NOTES.md` (both already created at Step 5B) — update `STATUS.md` to reflect Phase 0 state and add a dated `BUILD_NOTES.md` entry for the Phase 0 work (Amendment 001 A-008).

**Your review checklist before signing off Phase 0:**
- [ ] Log in as the seeded trainer account and hit one real authorized server action (not a stub).
- [ ] Query `audit_events` directly (via Supabase's SQL editor) and confirm a row was written with a non-null `entry_hash`, and that `prev_hash` correctly chains to the prior row (or is the genesis value for the first row).
- [ ] Attempt `UPDATE` or `DELETE` on `audit_events` as the **application/restricted database role** (or via a controlled `SET ROLE`/equivalent restricted session), **not** the Supabase admin/service role — confirm it is **rejected** by a database permission error. **(Amendment 001 A-010):** a check run only as the privileged SQL-editor identity does not prove application-role denial; back this with a restricted-role automated integration test, not just a manual SQL-editor attempt.
- [ ] Confirm the Supabase project region is Singapore (check the dashboard, don't just trust the setup step happened).
- [ ] Confirm `.env.local` is git-ignored and no key appears in any committed file (`git log -p` or a secret-scan tool).
- [ ] Read `STATUS.md` — does it accurately describe what you just watched happen?

**Exit condition (from `CLAUDE.md` §10):** a logged-in trainer can hit one authorized server action and it produces a verifiable, hash-chained audit row. **(Amendment 003 A-032): this is the exit condition for Phase 0 as a whole — through Step 7J — not for Step 7E.** Step 7E's own completion is the ratified inventory created, constrained, RLS-enabled and **unreachable by any client**; the review checklist above cannot be run until the later checkpoints that create Auth users (7F), policies and grants (7G), and the audit chain (7H) have been separately authorized and completed.

---

## Phase 1 — Governed vertical slice (the heart of the build)

**Sessions (rough):** 6–10. This is the largest and most important phase — do not rush it to "get to the UI."

> **(Amendment 002 A-024) — the ratified order inside this phase.** Work proceeds in this sequence, each step its own session or clear sub-goal: **(1)** governance and schema-preflight decisions (Gate G1) · **(2)** centre, class-grade, class-module and class-session foundations · **(3)** identity, profile and invitation foundations · **(4)** management setup and creation flows · **(5)** trainer assignment and calendar projection · **(6)** student enrolment and roster projection · **(7)** trainer attendance · **(8)** nine-dimension assessment · **(9)** AI draft, review, edit and approval · **(10)** shared submitted-report projection · **(11)** parent invitation, activation and linked-student view · **(12)** management report view and remaining Design 2 management screens · **(13)** full three-flow integration and UAT. Steps 12–13 span into Phase 3 and Phase 5; the numbered tasks below are the detail for the trainer/parent core.
>
> **Gate G2 applies to every step that builds a Figma-based screen.** A missing frame, asset, or state blocks **only that screen's checkpoint** — never the schema work — unless a missing visible field changes the domain relationship model.

**What you ask Claude Code to do, in this order (each sub-step should be its own session or clear sub-goal, not one giant push):**

1. **Foundations before capture:** class grades / class modules / class sessions; identity, profile and invitation foundations; management creation flows; trainer assignment; enrolment; roster projection; **attendance (Present by default, trainer Absent toggle, unique per student + class session, auditable)**. Only then the **Data capture path:** Dashboard → Roster (with previous-focus continuity from a prior session's follow-up note) → B.E.S.T Form, **all 9 dimensions mandatory**, rubric anchors surfaced in the UI per dimension. Adapt the corresponding **Figma Design 2** screens per `CLAUDE.md` §7 — visual fidelity from Figma, data/validation logic from the spec-as-amended.
2. **Validation & save:** **required-field validation across all nine dimensions** (there is no mode — Amendment 002 A-017), future-session lock, the observation persists with a `version` column for optimistic concurrency. Build all three of the form's interaction states, not just the happy path: the validation-error state (missing fields highlighted, jump to first missing field, AI call blocked), the loading state (draft generating, actions disabled), and the failure/retry state (generation failed, assessment preserved, retry offered) — per `CLAUDE.md` §7.3 and spec §13/§15. Apply these patterns to the mandatory 9-dimension form; do not reference the old 6-criteria layout shown in the legacy state screenshots, and **do not build a Quick/Full mode toggle** — if a Design 2 frame still shows one, report the discrepancy instead of building it.
3. **The rubric-anchored skeleton:** the deterministic, AI-free structure described in spec §12/§24 — every dimension carries its rating, rubric anchor text, and polarity band before anything is sent to the LLM.
4. **AI drafting, synchronous:** the server action that calls the LLM with the bounded skeleton, including the idempotency key.
5. **Grounding validation:** the check that rejects/regenerates a draft whose language contradicts a dimension's polarity band, references an unselected chip, or introduces unsupported facts.
6. **Report state machine:** **all eight states** (Amendment 004 A-036 — `incomplete` · `observation_saved` · `drafting` · `draft_ready` · `needs_edit` · **`trainer_approved`** · `approved` · `submitted`), each transition guarded (compare-and-set + transaction), audit write in the same transaction as the state change. **`approved` is transient-in-transaction only** — it is asserted inside the management Approve & Submit transaction and named in its two audit events, and **no operation ever commits with `status = 'approved'`**. **Corrected at Step 7I1D-R2:** this line previously read "all seven states", which predated A-036 and would have produced a state machine incapable of the two-stage workflow.
7. **Review & Approve screen, plus its Edit Report sub-screen:** compare-with-notes via the source map, the approval checklist, the approval snapshot with content hash. "Coach Notes (Internal Only)" on Review & Approve is the same `follow_up_notes` field as the B.E.S.T Form's "Follow-up for Next Session" — load the trainer's existing value here (don't render blank), and save through the same server action used on the form (`CLAUDE.md` §6). **(Amendment 004 A-033, A-036 — the trainer's final button is "Approve", not "Approve & Submit".)** The trainer's **"Approve"** button stays visually disabled until all three Quality Checklist items are checked, **and** the trainer-approve server action independently re-checks all three **for the exact version being approved** before allowing the transition — the disabled button alone is not the gate. Clicking it opens a simple confirmation modal (no dedicated design mockup needed — reuse the future-session-lock modal pattern) whose copy must **not** promise a parent notification; on confirm the server commits `draft_ready | needs_edit → trainer_approved`, writes the trainer approval row that freezes that version, and **publishes nothing**. Edit Report's "Save Changes & Finalize" saves the edit and returns to Review & Approve **without** approving; per A-037 it creates a **new immutable version** carrying a fresh all-false checklist, so a prior review can never certify post-edit content.

8a. **The management final-review stage (Amendment 004 A-033 … A-039) — build it with this slice, not with Phase 3's read breadth.** After trainer approval, notify authorized management that final review is pending. Management's review surface shows the final-review candidate's four parent-facing panels and the workflow state it must act on — **never** the per-dimension ratings, internal notes, checklist internals, approval internals or AI history, and **never a content hash** (A-038's rating-reconstruction hazard). From it management may: **approve unchanged**; **edit parent-facing wording only** (the four panels, creating a new immutable version with management authorship and explicit lineage to the trainer-approved source); or **return the report to the trainer** for a rating, observation or derived assessment-fact issue, recording a bounded structured correction request and notifying the assigned trainer. Management's **"Approve & Submit"** then performs `trainer_approved → approved → submitted` atomically, publishes the canonical version, and notifies the linked parents. **The Figma frames for every screen in this stage do not exist (U-25) — stop and ask; do not invent them.**
8. **Shared submitted-report projection, then the parent-facing view.** Build **one** canonical submitted-report read model and **one** reusable presentation architecture used by trainer, management and parent (**Amendment 002 A-021**) — not three formats. Then **parent invitation, verification, credential setup and activation** (A-020), then the parent-facing view: built as a strict read projection — **(A-028, A-038) only the version the aggregate's `latest_submitted_version_id` points to, which only management's Approve & Submit ever moves**, only for linked children, through the reviewed read RPC. (The older `kind = approval_snapshot` mechanism is superseded — there is no version-kind column.) Per `CLAUDE.md` §6: **no per-dimension rating grid** anywhere on the Parent Feedback Report (the prose panels already satisfy "simplified performance summary" — don't add a second panel restating ratings in grid form). **(Amendment 001 A-002): Phase 1 is text-only — no parent evidence-media access here.** The per-child evidence video is a confirmed *Phase 2* feature; Phase 1 may define the schema/typed interfaces it will need, but must not expose media to a parent. Actual gated parent evidence access (report `Submitted` + `evidence_media` consent + short-TTL signed URL scoped to the `parent_child_link`) is built and tested in Phase 2 (A-001/A-003).
9. **Full RLS coverage** for every table introduced this phase, not just the one from Phase 0.
10. Write the QA tests named in `CLAUDE.md` §3.6 as actual test files, not manual checks.

**Your review checklist before signing off Phase 1 — this is the most important checklist in the whole plan:**
- [ ] **The core proof:** ask Claude Code to force a contradictory scenario — rate a dimension `Beginning` (Amendment 006 A-049) and inspect (or instrument) the AI's raw draft attempt to confirm grounding validation actually catches and rejects/regenerates a positively-worded description of it. Watch this happen; don't accept "it should work."
- [ ] **The companion proof (Amendment 006 A-052):** confirm ordinary prose is **not** rejected — "at the beginning of the session" and "has mastered maintaining eye contact" must pass. A bare-word rating-label regex is **prohibited**; the guard detects explicit rating attribution and taxonomy disclosure only.
- [ ] **Audit recoverability:** approve a report, then independently pull the `report_versions` row referenced by that approval's `content_hash` and confirm the hash actually matches the stored content byte-for-byte.
- [ ] **Continuity:** add a follow-up note on one session, start the next session for the same student, and confirm it appears as "previous focus" without manual re-entry.
- [ ] **Concurrency:** with two browser sessions (or a script), attempt to approve the same report twice in quick succession, or edit-then-approve using a stale version — confirm the guarded transition rejects the stale one rather than silently overwriting.
- [ ] **Parent isolation (the highest-stakes check in the app):** log in as parent A, attempt to access parent B's child's report by manipulating the URL/ID directly — confirm it is refused at the database (RLS) level, not merely hidden in the UI.
- [ ] **Parent view content checks (Amendment 001 A-002 — Phase 1 is text-only):** on a parent's own, correctly-approved report, confirm there is no per-dimension rating grid anywhere on the page, **and** confirm that **no evidence media is reachable by a parent in Phase 1 at all** (drafts, internal notes, raw ratings, and AI history also absent). The gated parent-evidence access checks (permitted for the linked child's `Submitted`, consented clip via short-TTL signed URL; refused for every prohibited path) belong to the **Phase 2** review checklist, not here.
- [ ] **Idempotency:** submit the same draft-generation request twice (double-click, or replay) and confirm only one `report_version` results.
- [ ] **The three form states:** trigger each of the B.E.S.T Form's non-happy-path states on the mandatory 9-dimension form — submit with required fields missing (confirm the banner, the jump-to-first-missing-field, and that the AI call is blocked), watch the loading state during a real draft generation, and force a generation failure (e.g. a bad API key temporarily) to confirm the assessment is preserved and retry works. Confirm none of these regress to the old 6-criteria layout **and that no Quick/Full mode toggle exists anywhere**.
- [ ] **The trainer approval gate is real, not just visual:** with all three Quality Checklist items unchecked, confirm the **Approve** button is disabled — then, bypassing the UI (direct API call or browser dev tools), attempt to call the trainer-approve action anyway with the checklist still `false`. Confirm the server rejects it, **including when called directly and skipping the confirmation modal entirely** — the modal is a UX safeguard, not the enforcement point.
- [ ] **Editing creates a new version and resets the checklist:** check all three Quality Checklist items, open Edit Report, change any text, and Save Changes & Finalize back to Review & Approve. Confirm a **new** version now exists, the prior version is untouched, all three checklist items on the working version are unchecked, and **Approve** is disabled — a prior review must not silently carry over to edited content.
- [ ] **(Amendment 004) The two-stage gate is real:** confirm trainer approval makes the report visible to **management** and **not** to the parent. Then, as management: confirm a wording-only edit publishes nothing by itself and leaves the trainer-approved version byte-identical; confirm a **return to trainer** records the correction request, moves the report to `needs_edit`, notifies the trainer, and leaves the report **invisible to the parent**; and confirm **Approve & Submit** is the only action that makes the report parent-visible.
- [ ] **(Amendment 004) Management cannot touch assessment substance:** bypassing the UI entirely, attempt as management to write a rating, an observation, an attendance record, a trainer note, a checklist row and an approval row. Confirm **every one** is rejected server-side, and that the version management submitted carries **exactly the same nine ratings** as the trainer-approved version it derives from.
- [ ] **(Amendment 004) No `approved`-only residue:** confirm no report is ever observed at rest in `approved`, and that the management submission emits exactly **two** ordered state-change audit events in one transaction.
- [ ] Run the automated test suite; all Phase 1 tests pass.
- [ ] Run an accessibility scan (**Lighthouse first, per Amendment 001 A-009**) against the built screens; fix anything at "serious" or "critical" severity before moving on.
- [ ] Read `STATUS.md` for accuracy.

**Exit condition:** the three items named in `CLAUDE.md` §10 (contradiction rejected, approval recoverable by hash, continuity threads through) all demonstrated live, not just asserted.

---

## Phase 2 — Evidence (conditional) — **TA flow deferred**

**Sessions (rough):** 2–3 **if evidence is in scope**.

> **(Amendment 002 A-014, A-024) — this phase is no longer an MVP completion gate.** The **TA flow — its screens, its login, and its UAT — is deferred**. Whether **evidence media** remains a completion requirement, and **who uploads it** if it does, are **UNRESOLVED orchestrator decisions**. Do **not** invent a replacement uploader and do **not** silently transfer TA evidence-upload permissions to management or trainer.
>
> **Amendment 001's evidence safeguards are retained in full as conditional requirements.** A-001 (gated same-child parent access), A-003 (every prohibited path fails **and** the permitted path works), and A-004 (both-direction Parent UAT) apply **unweakened** the moment evidence is implemented. Deferring the TA *flow* deletes no security control.
>
> If evidence is confirmed out of scope for the MVP, this phase is skipped and its checklist is recorded as **not applicable**, not as passed.

**What you ask Claude Code to do (only if evidence is confirmed in scope, with the uploader explicitly ratified):** the upload/re-upload flow, a malware/content scan step (or a stub with a clearly logged TODO flagged to you — evidence scanning may depend on a third-party service you need to choose), signed-URL generation (short TTL, server-minted only), evidence-gated approval (trainer can mark evidence "not required"), consent-gated upload tied to `consent_records`.

This phase also implements the **gated parent evidence access** ratified in Amendment 001 A-001 (the confirmed per-child evidence video on the Parent Feedback Report), first exposed to parents here — not in Phase 1.

**Your review checklist:**
- [ ] **Prohibited paths all fail (A-003):** as a parent account, attempt to fetch an evidence file's storage path directly (bypassing the UI), another child's evidence, a pre-`Submitted` report's evidence, unconsented evidence, and an expired/tampered signed URL — confirm **each is refused**; no public/direct-bucket access works.
- [ ] **Permitted path works, narrowly (A-001):** confirm a correctly linked parent **can** retrieve **only their own child's** `Submitted`, `evidence_media`-consented clip via a short-TTL, server-minted signed URL scoped to that `parent_child_link` — and only briefly.
- [ ] Confirm an upload without a corresponding `consent_records` entry is blocked.
- [ ] Confirm the evidence-status flag correctly gates the Approve action per spec §12.4/§15.

**Exit condition (Amendment 001 A-003 — supersedes the absolute "a parent can never reach an evidence URL"; conditional under Amendment 002 A-014):** **if evidence is in scope**, this must be demonstrated, not assumed — **every prohibited path fails** (unauthorized, unrelated-child, pre-`Submitted`, unconsented, unscanned, expired-URL, direct-storage, public) **and** the linked parent can retrieve only their child's submitted, consented evidence through a valid short-TTL signed URL. Both directions demonstrated. **If evidence is confirmed out of MVP scope, record this exit condition as `not applicable`** — never as passed, and never by weakening it.

---

## Phase 3 — Management breadth

**Sessions (rough):** 2–4.

> **(Amendment 002 A-019) — management's creation and administration flows are NOT in this phase.** Create Class (Class Module under a Class Grade), class-session scheduling, trainer assignment, trainer/student/parent profile creation and invitations, enrolment, and parent–student linking are built **earlier**, in the A-024 sequence, because the trainer, roster, attendance and parent work all depend on them. **This phase is the management *read* breadth** — the calendar, overview, statistics, the canonical management report view, and the remaining Design 2 management screens.
>
> **(Amendment 004 A-033 — supersedes "Management remains view-only for feedback-report content".)** **Management's final-review stage is also NOT in this phase** — the review surface, the parent-facing wording edit, the return-to-trainer action and Approve & Submit belong to the governed report workflow and are built with Phase 1's step 8a. What remains here is genuine **read** breadth. Management is **no longer view-only on reports**; what is enforced server-side is the **editing boundary** — management writes **only** the four parent-facing wording fields, and never a rating, observation, attendance record, evidence object or trainer note.

**What you ask Claude Code to do:** Management Calendar, Class Overview, Class Statistics, the **canonical management report view**, and the remaining Design 2 management screens — each built as a read projection strictly over **submitted** data (`observation_ratings` aggregates, **submitted `report_versions` only**) — **corrected at Step 7I1D-R2**: under A-036 `approved` is transient-in-transaction and never commits, so "approved reports" has an empty referent at aggregate level; the canonical readable version is the one `latest_submitted_version_id` names, reading the **same shared canonical report projection** used by trainer and parent (A-021), and strictly scoped to the management account's assigned centre via its active **`centre_memberships`** row with role `management` (Amendment 003 A-025 — the older `management_centre_assignments` name is historical; `CLAUDE.md` §2 ADR-7, §6, §6.1) — no cross-branch visibility anywhere, no HQ tier, no super-admin, no centre picker. Per-row action buttons on **both** Class Overview's Student Report Status table **and** Class Statistics' Students Needing Follow-up table must check that student's report status before deciding what they show — **(Amendment 004 A-038)** `submitted` rows link to the canonical submitted report and `trainer_approved` rows link to the management final-review surface; `incomplete`/`observation_saved`/`drafting`/`draft_ready`/`needs_edit` rows show "Send Reminder to Trainer"; **`No Report` rows show no action button at all** (or a plain "—") — never pre-approval draft content, and never a reminder action where nothing was ever started. There is no page-level "Quick Actions" panel on Class Overview, and no Classcard concept anywhere in this project (mocked or real) — do not build either. Class Overview's "Class Health Summary" and Class Statistics' "Management Insight" both implement their **exact fixed templates in `CLAUDE.md` §6** — no LLM, no freeform generation, no additional conditions; neither is the deferred Weekly Class Health Brief (`CLAUDE.md` §6, §12.1, §28.1).

**Your review checklist:**
- [ ] From the management UI, try every navigation path you can find and confirm none reaches a draft, an internal note, or a raw rating outside an approved report.
- [ ] **Centre isolation:** log in as a management account assigned to Centre A, attempt to access a Centre B class/report/statistic by manipulating the URL/ID directly. Confirm it is refused at the database (RLS) level, not merely hidden in the UI — same rigor as the parent-isolation check in Phase 1.
- [ ] **Row-level status gating on Class Overview:** with a class that has at least one `draft_ready` or `needs_edit` student report, click that specific row's action button as a management user. Confirm it does **not** show the draft text or any internal note — only status information. Then click a `trainer_approved` row and confirm it opens the **final-review surface** (four parent-facing panels only, no ratings, no notes, no hash), and a `submitted` row and confirm it shows the canonical published content. Finally, confirm a `No Report` row shows no action button (or a plain "—"), not "Send Reminder to Trainer." Same table, same-looking buttons — the difference must come from the status check, not the UI alone.
- [ ] **Class Health Summary's four conditions:** using seeded/adjustable test data, exercise all four rows of the table in `CLAUDE.md` §6 (pending+missing, pending only, missing only, all clear) and confirm each produces the exact `Status` and exact `Recommended Management Action` wording specified — not a paraphrase, not an LLM-generated variant.
- [ ] **Management Insight's three slots:** confirm slot 1 (main follow-up area) matches the exact same value shown in that same class's Class Health Summary — they must never disagree. Confirm slot 2 correctly falls back to "Not enough session data yet to identify a trend" with fewer than 2 sessions of **submitted** data (**corrected at Step 7I1D-R2** — `approved` is transient-in-transaction and never commits, so "approved data" has an empty referent at aggregate level). Confirm slot 3's recommended action matches the exact lookup-table wording for whichever dimension slot 1 names, not a generated variant.
- [ ] **Generalized status gating on Class Statistics:** repeat the row-level status gating test (above) on Class Statistics' "Students Needing Follow-up" table — confirm a row at `incomplete`, `observation_saved`, `drafting`, `draft_ready` or `needs_edit` shows **"Send Reminder to Trainer"** and **never** report content; a row at **`trainer_approved`** links to the **management final-review surface**; a row at **`submitted`** links to the canonical submitted report; and a `No Report` row shows **no button at all**. **Corrected at Step 7I1D-R2:** this item previously named a `Pending Review` status, which has never existed in the ratified enum, and predated A-038's `trainer_approved` row rule.
- [ ] Confirm module boundaries held — spot-check that the management-view module isn't reaching into another module's tables directly (per `CLAUDE.md` §9 rule 1).

**Exit condition (Amendment 004 A-034 — reshaped, not weakened):** no code path from any management view to **pre-trainer-approval** content, an internal trainer note, a raw per-dimension rating, AI generation history, or a report content hash — **and** a management write to **any** field outside the four parent-facing wording fields is **rejected server-side**, not merely hidden.

---

## Amendment 002 verification register — automated and manual

**Added by the Amendment 002 reconciliation.** Every item below needs **both** a named automated test **and** a manual confirmation, unless the row says otherwise. Verify each item at the checkpoint that builds it, then re-verify the whole register during Phase 5. **A checkbox here is not satisfied by "it looked right when I clicked through it."**

### Assessment (A-017)

- [ ] **All nine ratings are required** — an automated test proves an observation cannot be completed, and the AI call cannot be made, with fewer than nine dimensions rated; manual: submit an eight-of-nine form and confirm it is blocked.
- [ ] **No Quick mode exists** — an automated/repository check proves there is no `mode` column, no quick/full toggle, no four-dimension completion path, and no four-dimension fallback anywhere in schema, server validation, components, or tests; manual: search the built UI for any mode selector.

### Attendance (A-018)

- [ ] **Present default** — an automated test proves every enrolled student is `Present` immediately after a valid roster is initialized.
- [ ] **Absent toggle persistence** — an automated test proves toggling one student to `Absent` persists for that student and that session, and survives reload; manual: toggle, reload, confirm.
- [ ] **Attendance uniqueness by student + class session** — an automated test proves a second attendance record for the same student and session is rejected at the **database** level, not merely avoided by the application.
- [ ] **Absent students do not receive fabricated reports** — an automated test proves no assessment or report is created for, or exposed for, an absent student.

### Class hierarchy, scheduling and calendars (A-016, A-019)

- [ ] **Management-created class sessions appear in the management calendar** — automated projection test plus a manual create-then-view walkthrough.
- [ ] **Trainer assignment causes the same session to appear in the trainer calendar** — an automated test proves the trainer's calendar reads the **same session record**, keyed by the same identifier management created.
- [ ] **No duplicated calendar-event record** — a repository/schema check proves there is no separate trainer-calendar or management-calendar event table, and no duplicate row is written on assignment.
- [ ] **Student enrolment appears in the correct roster** — an automated test proves a student enrolled in a Class Module appears in that module's session rosters and in no other module's.

### Centre scoping and role access (A-014, A-015, A-020)

- [ ] **Management write isolation to the sole centre** — an automated negative test proves a management write cannot target data outside its assigned centre, refused at the **database (RLS)** level; manual: attempt via a direct call, not the UI.
- [ ] **Trainer access is based on live class-session assignment** — an automated negative test proves a trainer cannot open, read, or write a session they are not currently assigned to; removing the assignment removes the access on the next request.
- [ ] **Parent–student isolation** — an automated negative test proves parent A's RLS-scoped query cannot return parent B's child's report, by ID manipulation as well as by navigation.

### Identity, invitation and activation (A-020)

- [ ] **Parent invitation creation** — an automated test proves management can create a parent invitation, that it starts `pending`, and that **no plaintext password is stored, displayed, logged, or emailed**.
- [ ] **Parent account activation** — an automated + manual test proves the recipient verifies the address and sets their **own** credentials, and the invitation moves to `accepted`.
- [ ] **Trainer invitation creation** — same proof as the parent invitation, for the trainer path.
- [ ] **Inactive profile versus active Auth identity** — an automated test proves a created-but-unactivated profile **cannot authenticate** and is **not** treated as a login identity; expired and revoked invitations are also refused.

### Canonical report governance (A-021)

- [ ] ~~**Management report-edit denial**~~ — **superseded by Amendment 004 A-034.** Replaced by **Management edit-boundary enforcement** — an automated negative test proves a management call writing **any** field outside the four parent-facing wording fields is **rejected server-side**, including when the UI is bypassed entirely: ratings, observations, attendance, evidence, trainer notes, checklist rows, approval rows, revision number, lineage, authorship and submission metadata are all proven unreachable. A companion positive test proves the wording-only edit **succeeds** and creates a **new immutable version** with management authorship and explicit lineage to the trainer-approved source.
- [ ] **Parent report-edit denial** — an automated negative test proves a parent edit call is **rejected server-side**, including when the UI is bypassed entirely. **Unchanged and absolute under Amendment 004.**
- [ ] **(Amendment 004) Trainer approval is mandatory in every published lineage** — an automated negative test proves management cannot submit a version whose resolved trainer-approved source carries no trainer approval row.
- [ ] **(Amendment 004) Rating parity at submission** — an automated test proves the submitted version's nine (dimension, rating) pairs are identical to the trainer-approved source's, and that a divergence is rejected.
- [ ] **(Amendment 004) Conditional return-to-trainer** — an automated test proves the return is legal only from `trainer_approved`, records the bounded structured correction request with its scope/reason/creator/time/status, leaves the trainer-approved source version byte-identical, does **not** move the canonical pointer, and leaves the report **unreadable by any parent**; manual: confirm the assigned trainer is notified.
- [ ] **(Amendment 004) Trainer reapproval after correction** — an automated test proves an assessment-level correction creates a new immutable version, re-snapshots the nine current ratings, requires a fresh trainer approval, and returns the report to management for a second final review.
- [ ] **(Amendment 004) Dual approval provenance** — an automated test proves trainer approval stays attached to its own source version with its own content hash, that management approval attaches to the exact submitted version, that both are immutable, and that at most one approval of each role exists per version.
- [ ] **(Amendment 004) No content hash reaches management or a parent** — a catalogue-level test proves neither the management review read nor the canonical read returns a content hash or a revision number, and that management's stale-render proof uses the panels-only wording hash.
- [ ] **(Amendment 004) Notification triggers fire only after commit** — an automated test proves a notification record is created for trainer approval, assessment-level return and submission, is **never** created for a rolled-back transition, and carries identifiers and timestamps only — no child name, account name, email, phone number, report content, rating or correction reason.
- [ ] **Trainer-authorized report editing** — an automated test proves the assigned trainer **can** edit the governed editable version, and that an unassigned trainer cannot.
- [ ] **Checklist reset after trainer edit** — an automated test proves the **working version's** quality-checklist progress is cleared after any save from the edit path, and that **the trainer's "Approve"** is consequently blocked (**corrected at Step 7I1D-R2** — "Approve & Submit" is management's action under A-033; the checklist gates the **trainer's Approve**); manual: check all three, edit, confirm all three are cleared. **(Amendment 003 A-028): checklist progress is version-scoped (`report_version_checklist_progress`), not `reports.checklist_*` columns** — and a **frozen** version's checklist and approval evidence are **immutable and must never be cleared**. Add a negative test for that.
- [ ] **Immutable frozen approved versions** — an automated test proves a trainer edit **creates a new version** and **never mutates a frozen approved or submitted version in place**; the frozen version's content still verifies against its stored hash afterwards. **(Amendment 004 A-037):** the same test must cover a **management wording edit**, which likewise creates a new version and leaves the trainer-approved version — its content, hash, nine snapshots, checklist evidence and trainer approval row — byte-identical. **(Amendment 003 A-028): approval — not submission — is the freeze point**, and the **previous submitted version stays canonical** while correction work is in progress. Add a test that a reader sees the previous submitted version, never a gap and never draft content.
- [ ] **One shared canonical report projection** — a repository/architecture check proves trainer, management and parent read the **same** submitted-report read model and the **same** presentation components — no second or third report format exists.

### Final integration (A-024)

- [ ] **All three Figma-based flows pass final UAT** — Management, Trainer and Parent walked end to end against the approved Design 2 screens without a governance violation. **TA UAT is not part of this gate.**

---

## Phase 4 — PDPA hardening & ops

**Sessions (rough):** 2–3.

**What you ask Claude Code to do:** retention jobs (scheduled purge per `retention_policies`), erasure-request endpoints, data-subject access/correction endpoints, basic alerting on job failures, a first-draft incident runbook, and — **(Amendment 001 A-007)** — the **independent, retention-locked external audit mirror** (spec §23). Phase 0 built the in-app append-only audit table + hash chain; the external mirror and its operational verification are completed here, not claimed in Phase 0.

**Your review checklist:**
- [ ] Trigger a test erasure request end-to-end and confirm the referenced data is actually removed or anonymized, not just flagged.
- [ ] Confirm retention jobs run on a schedule in a non-production environment without manual triggering.

---

## Phase 5 — Final integration, UAT, and quality passes (not in `CLAUDE.md`'s phase list — this is your wrap-up phase before considering the MVP "done")

**Sessions (rough):** 3–5, plus your own manual UAT time (budget this separately — it's you clicking through the app, not Claude Code coding).

This phase is deliberately yours to drive, with Claude Code fixing what you find rather than building new features.

### 5.1 Full regression pass
Run the entire automated test suite (unit, integration, e2e) from a clean checkout. Every test must pass; investigate and fix any flake rather than re-running until green.

### 5.2 Manual UAT script — one full walkthrough per required MVP role
**(Amendment 002 A-024): the required MVP UAT personas are Management, Trainer and Parent. TA UAT is not an MVP completion gate.** Write out and literally follow a script for each, start to finish, using the seeded synthetic data (one centre, one named management account):
- **Management:** log in → create a Class Module under a selected Class Grade → create dated Class Sessions → assign a trainer → create trainer, student and parent profiles with invitations → enrol students → link parent to student → confirm sessions appear in the management calendar → open a report awaiting final review → **(Amendment 004)** confirm you see only the four parent-facing panels (no ratings, no notes, no hash) → edit parent-facing wording and confirm a **new version** is created while the trainer-approved version stays byte-identical → **return a report to the trainer** with a bounded correction reason and confirm the trainer is notified and the parent still cannot see it → **Approve & Submit** another report and confirm it becomes parent-visible and the linked parent is notified → **confirm you cannot write a rating, observation, attendance record, evidence object or trainer note, including via a direct call that bypasses the UI** → view a submitted report in the canonical format → confirm no pre-trainer-approval content is reachable anywhere and nothing outside the sole centre is reachable.
- **Trainer:** activate the invited account → log in → confirm the assigned session appears in your calendar (the same session management created) → open the roster → confirm attendance defaults to `Present` and toggle one student to `Absent` → complete a **full nine-dimension** B.E.S.T observation (confirm no Quick mode exists and eight-of-nine is rejected) → generate a draft → review → edit (confirm a new version is created and the checklist resets) → **(Amendment 004)** **Approve** → confirm the report is **not** yet visible to the parent and that management has been notified → have management return it, confirm you are notified, correct the flagged rating, and **approve again** → after management submits, confirm it appears correctly to the linked parent account and that the absent student has no fabricated report.
- **Parent (Amendment 001 A-004, as scoped by Amendment 002 A-014):** receive the invitation → verify the account → set your **own** credentials (confirm no generated password was ever shown or emailed) → log in → open the linked-student view → open an approved report in the canonical format → confirm **no draft, internal note, raw rating grid, or AI history** is reachable and that **editing is refused server-side** → attempt to reach another parent's child by ID manipulation and confirm refusal at the database level. **If — and only if — evidence media is confirmed in MVP scope**, also confirm the **permitted** case (the linked child's own `Submitted`, `evidence_media`-consented evidence opens via a short-TTL signed URL) and that **all prohibited** evidence paths fail (another child's clip, a pre-`Submitted` report's evidence, unconsented evidence, a direct storage path, an expired/tampered URL). If evidence is out of scope, record these as **not applicable**, not as passed.
- **TA:** **deferred — not an MVP UAT gate.** Run it only if the orchestrator explicitly reopens the TA flow as a scope change.

**Also re-verify the full "Amendment 002 verification register" above during this phase.**

### 5.3 Accessibility audit
Run **Lighthouse accessibility scoring (the initial approach per Amendment 001 A-009; do not add `axe-core` unless later approved)** against every screen in the built three-flow inventory (`docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md`, cross-referenced with spec §8). Fix anything flagged serious or critical. Spot-check keyboard-only navigation through the B.E.S.T form and the Review & Approve screen specifically — these have the most complex interactive elements (chip selectors, the approval checklist).

### 5.4 Security review pass
- [ ] Re-verify every RLS policy against the role/data-access table in spec §14 — one row at a time, confirm the policy matches.
- [ ] Confirm no secret or key appears in the client-side JS bundle (inspect the built output, not just the source).
- [ ] Confirm all evidence storage is private with no publicly-listable bucket.
- [ ] Run a dependency audit (`npm audit` or equivalent) and address anything high/critical.

### 5.5 Performance sanity check
Basic check only for an MVP — confirm the AI drafting call has a visible loading state and a reasonable timeout/error path (per spec's failure-and-recovery design, §15), and that the dashboard/roster views load acceptably with the seeded dataset size.

### 5.6 STATUS.md and BUILD_NOTES.md final review
Confirm both permanent continuity documents are accurate (Amendment 001 A-008): `docs/progress/STATUS.md` reflects the final phase/state, and `docs/progress/BUILD_NOTES.md` captures the full chronological build history — together they become the handoff record if anyone else picks up the project later.

**Exit condition for the whole MVP:** every checklist item above is checked, every automated test passes from a clean checkout, and you have personally walked all four UAT scripts without finding a governance violation.

---

## Deployment checklist (staging → production)

- [ ] Separate Supabase projects for staging and production (never share one project across environments).
- [ ] Production environment variables set via your hosting provider's secret management, never committed.
- [ ] Confirm production project region is Singapore.
- [ ] Run the full Phase 5 checklist again against staging before promoting to production.
- [ ] Only load real student/parent data after Phase 4's PDPA mechanisms are confirmed working in production — not before.

---

## What comes after this plan (explicitly not part of it)

Per spec §28 and `CLAUDE.md` §8, the following are roadmap items, not part of this implementation plan, and should only be started on your explicit instruction:
- Weekly Class Health Brief (management aggregate AI feature)
- Child Progress Digest (parent aggregate AI feature, mandatory-approval-gated)
- End-of-term report generation
- Full relief-teacher handover UI

When you're ready to scope any of these in, treat it as a new mini version of this same plan — its own phase, its own review checklist, its own exit condition — rather than folding it into an existing phase's scope.

One more, not in the list above because it isn't scoped as a roadmap item, just noted: if iSpeak ever wants an HQ/corporate tier with visibility across branches (ADR-7 in `CLAUDE.md` §2 explicitly rejected this for the current MVP), it's additive — a new role and RLS policy granted visibility across multiple centres — not a redesign of the branch-scoped access already built.
