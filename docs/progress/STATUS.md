# STATUS — B.E.S.T Coach MVP

> Read this first at the start of every session (with the recent `BUILD_NOTES.md` entries). Update it last, at every accepted stopping point. Permanent continuity document (Amendment 001 A-008).

_Last updated: 2026-07-30 (Step 7E0 — final MVP scope and schema-preflight governance reconciliation; Amendment 002 created and the active documents aligned; **documentation only**, change set staged, commit and orchestrator acceptance pending; the complete Step 7D sequence remains accepted and historically unchanged; Step 7E remains blocked)._

---

## Current project state

- **Project:** B.E.S.T Coach MVP
- **Lifecycle stage:** Phase 0 in progress — client boundaries implemented and accepted; database foundation blocked pending this governance reconciliation and the remaining schema-preflight decisions
- **Migration/tooling status:** Step 6 local tooling **completed and accepted**
- **Current checkpoint:** **Step 7E0 — Final MVP scope and schema-preflight governance reconciliation (documentation only)**
- **Checkpoint status:** **Staged — commit pending, orchestrator acceptance pending.** Nothing in this checkpoint is self-accepted.
- **Current implementation state:** local Supabase runtime **verified**; Supabase **environment and client boundaries implemented and accepted** (browser-safe, request-scoped server, and elevated server-only factories; `server-only` isolation proven by a negative build); all six approved environment variables validated; **no query, Auth flow, migration, schema, RLS, or audit implementation yet**
- **Environment/client boundaries:** implemented and accepted (Step 7D)
- **Schema, Auth, RLS, and audit:** not started
- **Step 7E:** **blocked** — it may not begin until this documentation checkpoint (Amendment 002 plus the aligned active documents) is **reviewed, committed and accepted**, and until the remaining schema-critical decisions below are ratified
- **Actual current MVP HEAD:** `e07b2138c9b670ebd3feda41c89782056cb8a6d5` (short `e07b213`)
- **Actual MVP commit count:** **11**
- **Latest accepted substantive MVP commit:** `455a0706b5555c0b4f083327dfd5613d3aa23245` (`feat(platform): add Supabase client boundaries`)
- **Latest accepted administrative progress commit:** `e07b2138c9b670ebd3feda41c89782056cb8a6d5` (`docs(progress): record Supabase client boundaries`)
- **Runtime dependencies (exact-pinned):** `@supabase/ssr` `0.12.3`, `@supabase/supabase-js` `2.110.8`, `server-only` `0.0.1`; **Supabase CLI** `2.109.1` (project-local, exact-pinned)
- **Latest accepted governance baseline:** `c7c27e5e2f772725d88fbed1b5e1459d509960ce`
- **Repository:** local-only, no tag, no remote, no push. Working tree carries **only** this checkpoint's seven staged documentation files.

## Ratified final MVP scope (Amendment 002, ratified 2026-07-30)

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
- **Step 7E (first governed SQL migration and database foundation) remains blocked** — it cannot begin until (a) this documentation checkpoint is reviewed, committed and accepted, and (b) the remaining schema-critical decisions listed under "Current follow-ups" are formally ratified. The **data-layer tension is now resolved** by Amendment 002 A-023; the identity (`public` profile ↔ `auth.users`), report-status, audit-design (target, scope, SHA-256, genesis), table-`GRANT`, enum-vs-reference-table, invitation-token, and first-migration-scope decisions remain open.
- **Step 7E0 (final MVP scope and schema-preflight governance reconciliation) is the current checkpoint** — **documentation only**. It created **Amendment 002** (A-014 … A-024) and the **Figma Design 2 screen implementation matrix**, and aligned `CLAUDE.md`, the Implementation Plan, and the progress records to the ratified final MVP scope. **No schema, code, dependency, runtime, Auth, seed, or Figma import is authorized by it.** The change set is **staged; commit and orchestrator acceptance are pending.**

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
- **Latest accepted substantive commit:** `455a0706b5555c0b4f083327dfd5613d3aa23245` (`feat(platform): add Supabase client boundaries`)
- **Current HEAD:** `e07b2138c9b670ebd3feda41c89782056cb8a6d5` (`docs(progress): record Supabase client boundaries`)
- **History:** **eleven** accepted commits — `4de3f93` (scaffold) → `c7c27e5` (governance baseline) → `a39ed21` (closure synchronization) → `0cdb782` (local Supabase tooling scaffold) → `a83ec7a` (tooling closure records) → `25551c5` (Windows local-stack remediation) → `329f03c` (Phase 0 runtime foundation records) → `ffd9eef` (Supabase runtime dependencies) → `5d10bd0` (runtime dependency records) → `455a070` (Supabase client boundaries) → `e07b213` (Supabase client-boundary records)
- **Remote:** none (no tag, nothing pushed)

---

## Ratified governance

- **Source-of-truth hierarchy (highest first):** Specification v3 → ratified amendments (Amendment 001, then Amendment 002 for the clauses each names) → root `CLAUDE.md` → Implementation Plan (procedural) → **Figma Design 2** (visual/interaction reference only) → `STATUS.md` → `BUILD_NOTES.md` → temporary migration tracker.
- **Amendment 001:** Ratified 2026-07-21 (`docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_001.md`); supersedes only the clauses named in its supersession table (A-001 … A-013). **A-001 … A-012 remain fully active; A-013 is superseded by Amendment 002 A-022 only for the UI-reference source and install timing.**
- **Amendment 002:** Ratified 2026-07-30 (`docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_002.md`); **A-014 … A-024**; supersedes only the clauses named in its supersession table. **It does not weaken any privacy, approval, audit or evidence control**, and the core governance rule — *AI drafts, trainer approves, parents and management see only approved reports* — is unchanged.
- **Specification v3 and Amendment 001 are never edited in place** and remain byte-for-byte unchanged; all reconciliation lives in the amendments.
- **Toolchain (A-006):** Node 24 LTS (`.nvmrc` `24`, engines `>=24 <25`), npm `11.13.0`; Next.js App Router, TypeScript, Tailwind, ESLint, Turbopack; root `/app`; React Compiler off.
- **Git (A-005):** local-only; no remote/push unless the orchestrator explicitly requests it.
- **Evidence phasing (A-001/A-002/A-003):** Phase 1 parent report is text-only; gated parent evidence access (linked child + `Submitted` + consent + short-TTL signed URL) is implemented and tested in Phase 2.
- **Audit (A-007/A-010):** Phase 0 = append-only DB audit table + hash chain, mutation denial verified via restricted role / `SET ROLE`; Phase 4 = independent retention-locked external mirror.
- **Continuity (A-008):** `STATUS.md` **and** `BUILD_NOTES.md` are both permanent and updated at every accepted stopping point.
- **Testing/a11y (A-009):** Vitest + React Testing Library + Playwright pre-approved; Lighthouse first for accessibility.

---

## Current follow-ups

- **Current npm advisories remain unresolved — 3 high and 0 moderate** (`next` high/direct; `postcss` and `sharp` high/transitive, both through `next`). None is attributable to `supabase@2.109.1`, `@supabase/ssr`, `@supabase/supabase-js`, `server-only`, or their transitive packages; the shift from 1-moderate/2-high reflects npm advisory-database movement raising `postcss` to high, not a dependency change. No `npm audit fix` has been run; remediation is deferred to a reviewed security/dependency checkpoint.
- **This documentation checkpoint must be reviewed, committed and accepted before Step 7E** — Amendment 002 and the aligned active documents are **staged only**. Nothing here is self-accepted.
- **Figma Design 2 implementation handoff** — **pending**. The orchestrator must supply or verify, per approved screen: **node-specific `/design/` frames**, screen names, flows, intended routes, responsive variants, component/interaction states, and the **loading, empty, validation, error, success and disabled** states; the **design-variable or approved token inventory** (typography, colours, spacing, radii, shadows); and the **approved logos, SVG icons and image assets**; plus prototype transitions, interaction notes, and any discrepancy against a ratified governance rule. **It is NOT a blocker for Step 7E unless an unresolved Figma field changes the domain relationship model.** **It IS a blocker for the corresponding UI implementation checkpoint.** **Missing visual or interaction details must not be guessed** — implementation stops and asks. Tracking artefact: `docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md` § "Orchestrator Figma Porting Actions". **No Figma asset has been scraped, exported, downloaded, or ported, and no node ID has been fabricated.**

### Remaining unresolved decisions, classified by blocking point

**Schema-critical — these block Step 7E:**

- **`public` profile table's physical relationship to `auth.users`** (1:1 keyed profile vs alternative).
- **Audit target representation** — typed FK to `reports` vs polymorphic `target_type` / `target_id`. *(Also relevant at Step 7H.)*
- **Report-status storage representation** — display names vs a normalized enum spelling.
- **Deliberate `GRANT` strategy for newly created tables** — new `public` entities are not automatically reachable by `anon` / `authenticated` / `service_role`; a missing grant must not be misdiagnosed as an RLS failure.
- **Enum versus reference table at schema level** — including **Class Grade** (`Beginner` / `Intermediate` / `Advanced`) and report status.
- **Invitation token and expiry implementation details**, and storage of the `pending` / `accepted` / `expired` / `revoked` states.
- **First-migration table and enum scope** — exactly which tables and enums the first migration creates.

**Audit-design — these block the audit-chain checkpoint (Step 7H), not the first migration:**

- **Audit-chain scope** — one global chain vs one chain per target/tenant.
- **SHA-256 ratification** for the audit hash (spec §23 names no algorithm).
- **Audit-chain genesis rule** — sentinel vs zero-hash for the first entry.

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
- ~~Final MVP scope, hierarchy, assessment-mode, attendance, management-administration, identity/invitation, canonical-report and UI-authority ambiguity~~ — resolved by **Amendment 002 A-014 … A-024**. *(Pending commit and orchestrator acceptance of this checkpoint.)*

---

## Next permitted action

**Review, commit and accept this documentation checkpoint (Step 7E0 — final MVP scope and schema-preflight governance reconciliation).** The seven approved documentation files are **staged**; the commit has **not** been created, and the checkpoint has **not** been accepted. Nothing may self-accept it.

**After acceptance**, the next checkpoint is the **schema-preflight technical ratification** — ratify the remaining schema-critical decisions listed above (`public` profile ↔ `auth.users`, audit target representation, report-status storage, deliberate `GRANT` strategy, enum-vs-reference-table including Class Grade, invitation token/expiry, and the first-migration table/enum scope), then produce a bounded Step 7E implementation plan.

**No schema work is currently authorized.** Step 7E (first governed SQL migration and database foundation) remains **blocked**. This checkpoint made **no** code, dependency, schema, migration, seed, Auth, runtime, Supabase, or Figma change; `supabase login` / `supabase link` remain deferred; no commit, tag, remote or push occurred. No secret value may be printed, reported, or committed. Synthetic data only.
