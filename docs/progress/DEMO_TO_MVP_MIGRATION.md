# B.E.S.T Coach — Demo-to-MVP Migration Tracker

**Purpose:** Durable source of truth for selectively migrating the completed local trainer-flow demo into the fresh MVP repository without relying on chat memory.

**Scope:** This tracker governs only the demo-to-MVP migration. It ends when every relevant demo asset has been ported, rejected, or superseded and the MVP has no dependency on demo-only architecture.

**Current checkpoint:** Final MVP visual-screen inventory and 48-hour core-slice reconciliation — **Amendment 005**; complete (2026-08-05)\
**Checkpoint status:** **Amendment 005 (A-041 … A-048) is ratified.** **36 complete visual-reference screens are accepted — 33 portal screens and 3 authentication screens** — all in Figma file `sSY1TYw3jyVlZDy8V2Mu7g` (`SDS-dashboard`), each with an orchestrator-supplied node-specific frame; **portal numbering 01–33 is preserved and authentication IDs sit outside it**. **12 screens are physical-test-critical; the other 24 portal screens are deferred until after the physical test.** The canonical inventory `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` was created, and `CLAUDE.md`, the Implementation Plan, the Figma matrix and the physical-test contract were reconciled and committed as `docs(ui): ratify final MVP inventory and core test slice`, together with the three canonical progress records. The **current narrow-flow frontend is functionally implemented but visually unaccepted**; the **external UI pack will scaffold all 36 folders**, and **only the 12 core screenshots are required immediately**. **Documentation only — no application code changed**, and the documentation commit was merged into both implementation branches without either branch being merged into `main`.\
**Current permitted action:** Scaffold the **external frozen UI-reference pack** — all 36 folders, **only the 12 core screenshots required immediately** — and resolve **U-A5-1** (**ID 05 Trainer Schedule has no implemented route**; accept the fold into the trainer landing surface for the physical test, or build `/trainer/schedule` before it — **adding the route is a contract §9 blocker, not an agent decision**). **Step 7I2A remains a separately-authorized backend sub-checkpoint**, as do 7I2B … 7I2G and 7J. **No route-compatibility treatment (move · redirect · alias · replace) may be executed without its own authorization**, **no frame, node ID or field may be invented for the eight blocked design families**, and **Management Term Report (ID 28) stays separately governed**. **CP-3 and CP-5 remain open.**\
**Preceding checkpoint:** CP-2 / CP-4 governed assessment persistence design; complete (2026-08-05); `docs/plan/PHYSICAL_TEST_ASSESSMENT_WRITE_BASELINE.md` committed as `docs(plan): define governed assessment persistence`, with both worktrees fast-forwarded to that commit — **design only, no implementation**\
**Step 7E0:** **Completed · Accepted by orchestrator (2026-07-30)** — substantive governance commit **`722dcb8`**  
**Step 7E0D:** **Completed · Accepted by orchestrator (2026-08-03)** — substantive ratification commit **`b367475`**  
**Step 7E:** **Completed · Accepted by orchestrator (2026-08-03)** — substantive migration commit **`252ef9b`**  
**Step 7F design (7F0A … 7F0D):** **Completed · Ratified by orchestrator (2026-08-03)** — substantive fixture-design commit **`936cf4e`**  
**Step 7F:** **Design completed and ratified (2026-08-03)** · **Implementation completed and runtime-accepted (2026-08-03)** — substantive fixture-implementation commit **`e197f91`**  
**Step 7G:** **Completed and runtime-accepted (2026-08-04)** — substantive authorization commit **`17d7ddc`** · verification-reconciliation commit **`97f3fb2`** · **P-1 resolved**
**Step 7H:** **Completed and fully accepted (2026-08-05)** — design commit **`3e479b6`** · migration commit **`ef22521`** · verifier reconciliation commit **`617ca4b`** · four independent runtime runs, all identical, all passing · acceptance record **`42d3c02`**
**Step 7I1 (7I1A … 7I1G):** **Completed and ratified (2026-08-05)** — Amendment 004 (**A-033 … A-040**) and `docs/plan/STEP_7I_REPORT_LIFECYCLE_BASELINE.md` (**R-1 … R-33**) ratified and committed · **design only; no Step 7I SQL, migration, RPC, server action, fixture, generated type, application code or UI authored, and no runtime started** · **Step 7I2A unstarted and separately authorized**
**48-hour physical-test slice setup:** **Completed (2026-08-05)** — shared contract `docs/plan/PHYSICAL_TEST_SLICE_48H.md` plus `docs/workstreams/48H_BACKEND_PROGRESS.md` and `docs/workstreams/48H_FRONTEND_PROGRESS.md` created and committed as `docs(plan): define 48-hour physical-test slice`; isolated worktrees `feat/48h-backend` and `feat/48h-frontend` created from that same commit · **setup only — no implementation, no dependency install, no Supabase/Docker/psql/server runtime, no merge, no tag, no remote, nothing pushed**
**CP-2 / CP-4 assessment persistence design:** **Completed and ratified (2026-08-05)** — the ratified record is `docs/plan/PHYSICAL_TEST_ASSESSMENT_WRITE_BASELINE.md`, committed as `docs(plan): define governed assessment persistence`. Exactly **two** governed functions designed — `public.assessment_save_observation` and `public.assessment_get_trainer_observation` — both `postgres`-owned, `SECURITY DEFINER`, search-path-pinned, `authenticated` EXECUTE only, with **no table grant, no RLS policy, no new table or enum, and no audit-registry change**. **Operator ruling option (c): standalone observation persistence emits no Step 7H audit event**, consistent with the ratified **E9** disposition; truthful audit begins when `requestDraft` performs the report lifecycle operations. Assessment-layer delta **+1 migration, +2 public functions, +2 `authenticated` EXECUTE grants**; post-assessment census **6 migrations, 30 public functions, 26 tables, 12 enums**; **the ratified Step 7I counts of 5 migrations, 28 functions and 75 tests are unchanged** · **design only; no SQL, migration, RPC, server action, fixture, generated type, application code or UI authored, and no runtime started** · **implementation is Backend Round B2, after Step 7I acceptance, and separately authorized**
**Final MVP visual-screen inventory and 48-hour core slice:** **Completed and ratified (2026-08-05)** — `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_005.md` (**A-041 … A-048**) and `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md`, committed as `docs(ui): ratify final MVP inventory and core test slice`. **36 visual-reference screens accepted — 3 authentication (`AUTH-01` … `AUTH-03`) + 33 portal (Trainer 10 · Management 19 · Parent 4)**, portal numbering **01–33 preserved**, Parent normalized to **30–33**, all nodes **unique and orchestrator-supplied**. **12 physical-test-critical screens; 24 portal screens deferred until after the physical test.** Visual authority ratified as **frozen `reference.png` → node-specific Figma → existing implementation**; **Figma never bypasses governance and screen presence is not authorization**. Route compatibility **documented, not executed** — six canonical routes already satisfied, nine mismatches with one treatment each, and **one coverage gap (ID 05, U-A5-1) recorded as an operator decision**. `CLAUDE.md`, the Implementation Plan, the Figma matrix (**new §0.2**) and the physical-test contract (**new §4.1–§4.4**) reconciled · **the competency-rating vocabulary was not altered** · **documentation only — no application code, route or component created, moved, deleted or restyled, and no Supabase, Docker, migration, fixture, build or server was run**

> **Step 7D and Step 7E0 remain historically unchanged and fully accepted.** The Step 7E0 documentation reconciliation was **reviewed and accepted by the orchestrator on 2026-07-30** and committed as **`722dcb868435e83fbeb3963cc2548d0745436406`**. It created **Specification v3 Amendment 002** (A-014 … A-024) and the Figma Design 2 screen implementation matrix, and aligned the active governance, plan and progress documents with the orchestrator's final confirmed MVP scope. **No schema or application implementation was authorized by it, and none has occurred.**
>
> **Step 7E0D is completed and accepted (2026-08-03).** The schema-critical architecture ratification was **reviewed and accepted by the orchestrator** and committed as **`b367475c180a2e4f4cf70ff1385f34b253356c33`**. It created **Specification v3 Amendment 003** (**A-025 … A-032**) and reconciled `CLAUDE.md` and the Implementation Plan to it. It recorded the **exact Step 7E boundary — 10 enums, 22 tables and 13 deterministic seed rows** — and the accepted centre seed identity **`ispeak` / `iSpeak Academy`**. **Amendment 003 governs schema architecture and migration boundaries; it is not an implementation authorization.**
>
> **Step 7E is now completed and accepted (2026-08-03).** Under a bounded orchestrator authorization covering Step 7E only, the first governed SQL migration was authored (**7E1A**), corrected after static architecture review (**7E1B**), applied and verified against a **clean local disposable Supabase database only** (**7E2A**), and committed as **`252ef9b13008629cadc238bdf58b7016c50bb7b2`** (**7E2B**). The local catalogue confirmed the exact ratified boundary — **10 enums, 22 tables, 13 deterministic seed rows, 44 foreign keys, 43 explicit indexes** — with **RLS enabled on all 22 tables, zero policies, and zero effective client table privileges** for `PUBLIC`, `anon`, `authenticated` and `service_role`. Database lint returned **zero errors and zero warnings**. **No hosted database was accessed at any point**, and the local stack was stopped cleanly afterwards.
>
> **Step 7F is completed and runtime-accepted (2026-08-03).** The exact synthetic-fixture baseline — **3 Auth identities, 25 application-domain rows, Option B** — was ratified and committed as **`936cf4e9b131b99943db6724bfb6eb9b23c07050`**, then implemented, corrected across five recorded incidents, proven by operator and independent runtime verification, and committed as **`e197f91bbdf3196ef8e0eeee8216d6e7d8e495a7`**. **3 Auth users, 25 domain rows and 28 canonical rows** exist in the **local disposable database only**, with canonical SHA-256 **`d6a314b40bb5eb1bc3169097e2a9cb03858791498ca5137a43050cee36b87517`** reproduced identically across the bounded reload, two reset-and-clean-load cycles and independent verification.
>
> **Step 7G is now completed and runtime-accepted (2026-08-04).** The **P-1 `supabase_admin` default-ACL review** was performed first and resolved (Step 7G1A); the relationship-authorization migration — a fail-closed `postgres` execution guard, **6 STABLE SECURITY DEFINER search-path-pinned helpers** (EXECUTE for `authenticated` only), **13 SELECT grants** and **29 permissive SELECT policies** over the identity/roster layer — was authored, adversarially reviewed (one proven defect corrected: ambiguous-identity fail-closure), applied as the **second** project migration and runtime-proven with the full 39-cell visibility matrix, the denial suite (including **`service_role` denied on all 22 tables despite BYPASSRLS**) and the inactive/cross-centre decoy suite, all rolling back with zero residue; committed as **`17d7ddc4e7264ffe0a545d3830813af94b7ac688`**. The Step 7F verification suite — which carried **five** superseded posture assumptions (A32, A33, A34, A35, D5) — was reconciled to the accepted Step 7G posture with its data assertions, negative tests and checksum logic byte-unchanged, proven twice with the identical canonical checksum, and committed as **`97f3fb2ed05f7fc3ddcec5e3f5e13b15da668b1f`**. **No write policy, RPC, audit object, view, trigger, generated type, application code, test or Figma asset exists.** **Step 7H requires a separate explicit orchestrator authorization**, and **A-1 … A-6 must be ratified before any audit-chain SQL is authored**. This Step 7G1H checkpoint records the acceptance and authorizes **nothing further**.

---

## 1. Mandatory operating workflow

For every checkpoint:

1. ChatGPT gives the orchestrator one bounded Claude Code prompt.
2. The orchestrator reviews and sends it to Claude Code.
3. Claude Code performs only that task and returns its complete report.
4. The orchestrator sends the complete response back to ChatGPT.
5. ChatGPT checks the evidence and either:
   - accepts the checkpoint and gives the next prompt;
   - requests correction or additional verification; or
   - stops for an orchestrator decision.
6. The orchestrator may stop, reject, revise, or redirect any step.

Do not combine multiple implementation checkpoints into one Claude Code prompt unless this tracker explicitly authorizes it.

---

## 2. Anti-hallucination continuation protocol

At the start of a new ChatGPT or Claude Code session:

1. Read this tracker fully.
2. Read the active repository's governing instruction file.
3. Read the active repository's `STATUS.md` and relevant `BUILD_NOTES.md` entries, once those files exist.
4. Inspect the actual filesystem and Git state.
5. Continue only from the first unchecked checkpoint.

Rules:

- Do not infer repository paths, branches, commit hashes, installed dependencies, environment variables, test results, or external-service state.
- Record exact commands actually run and their outcomes.
- Distinguish:
  - implemented;
  - automatically verified;
  - manually verified;
  - accepted by orchestrator.
- Preserve failed attempts and append their resolution later.
- Reopen a checkpoint if later changes invalidate its verification.
- Stop when governing documents conflict or when an orchestrator decision is required.
- Do not claim a migration is complete merely because a screen renders.

---

## 3. Migration principle

> Reuse presentation and proven interaction behaviour. Rebuild data flow, persistence, authentication, authorization, workflow, AI governance, evidence handling, and audit against the MVP architecture.

### May be selectively reused after review

- Tailwind styling and design tokens
- Presentational React components
- Page layouts
- Calendar, roster, form, review, edit, loading, failure, retry, and modal interaction patterns
- Copy and microcopy that still agree with the authoritative MVP documents

### Must not be carried over as MVP architecture

- Demo React Context or in-memory state
- Hardcoded users, classes, students, schedules, or reports
- Cosmetic authentication
- Client-controlled report status changes
- Client-only governance validation
- Four-dimension-only domain model
- Existing AI route without authoritative database re-read, idempotency, structured validation, and grounding validation
- Browser object URLs as persistent evidence storage
- Demo-only forced-failure controls exposed in production UI
- Demo governance files as active MVP instructions

---

## 4. Document hierarchy for the MVP repository

The following hierarchy must be reconciled and recorded before Phase 0 implementation begins.

1. `BEST_Coach_Complete_MVP_Specification_v3.md`
   - authoritative product, governance, architecture, data-model, scope, and phase source of truth.
2. `CLAUDE.md`
   - Claude Code's standing implementation contract.
   - must agree with the authoritative specification.
3. `BEST_Coach_Implementation_Plan.md`
   - orchestrator's execution and review script.
   - may add checkpoints and a final quality/UAT phase, but must not override the specification.
4. Figma Design 2 (superseded Stitch as the final UI authority at Step 7E0, Amendment 002 A-022)
   - visual and interaction reference only; never authoritative for schema, RLS, authorization, report lifecycle, audit, Auth, persistence, state-machine rules, or transaction boundaries.
5. `docs/progress/STATUS.md`
   - concise current state and next permitted work.
6. `docs/progress/BUILD_NOTES.md`
   - permanent chronological technical evidence.
7. This migration tracker
   - temporary migration disposition and acceptance record.

### Known reconciliation item

The authoritative documents must be checked for any inconsistent statement about parent access to evidence. The latest confirmed rule in `CLAUDE.md` is expected to govern only if it agrees with or explicitly supersedes the specification through an orchestrator-approved amendment. No evidence feature is to be implemented until this is resolved and documented.

---

## 5. Repository roles

### Demo repository

**Purpose:** Frozen, runnable reference implementation.

Expected governing files:

- `AGENTS.md`
- `DEMO_BUILD_PLAN.md`
- `progress_tracking.md`

The demo remains local unless the orchestrator later requests a remote.

### MVP repository

**Purpose:** Actual final-project application.

Expected governing and tracking files:

- `CLAUDE.md`
- `docs/spec/BEST_Coach_Complete_MVP_Specification_v3.md`
- `docs/spec/BEST_Coach_AI_Features_Breakdown_v2.docx`
- `docs/plan/BEST_Coach_Implementation_Plan.md`
- `docs/progress/STATUS.md`
- `docs/progress/BUILD_NOTES.md`
- `docs/progress/DEMO_TO_MVP_MIGRATION.md`

The demo's `AGENTS.md`, `DEMO_BUILD_PLAN.md`, and `progress_tracking.md` must not govern the MVP repository.

---

# Migration checkpoints

## Step 0 — Inventory the existing demo repository

**Status:** Completed  
**Accepted by orchestrator:** Yes

### Objective

Obtain a read-only factual report of the demo repository before changing anything.

### Required evidence

- [x] Exact absolute repository path
- [x] Whether the folder is a Git repository
- [x] Current branch — N/A (folder is not a Git repository)
- [x] Latest commit hash and message, if Git exists — N/A (no Git repository)
- [x] Working-tree status, including modified and untracked files — N/A (no Git repository; nothing is tracked)
- [x] Configured Git remotes — N/A (no Git repository; none exist)
- [x] Concise folder tree with relevant source, configuration, and reference files
- [x] Framework and package-manager identification
- [x] Node and package-manager versions
- [x] Main scripts and major dependencies from `package.json`
- [x] Locations of demo governance and progress files
- [x] Locations of mock state, AI API route, pages, components, styles, and reference assets
- [x] Environment filenames only, with no values
- [x] Mismatch check against `progress_tracking.md`
- [x] Explicit confirmation that no files were modified

### Recorded result

Read-only inventory completed 2026-07-21. No files were changed.

**Canonical paths (approved):**

- Parent workspace: `C:\Users\enyul\Vibe Studio\B.E.S.T-Coach-Workspace`
- Demo repository: `C:\Users\enyul\Vibe Studio\B.E.S.T-Coach-Workspace\SDS Project Sprint 2`
- Reserved MVP repository: `C:\Users\enyul\Vibe Studio\B.E.S.T-Coach-Workspace\SDS Project Final (BEST Coach)`
- Migration tracker: `C:\Users\enyul\Vibe Studio\B.E.S.T-Coach-Workspace\BEST_COACH_DEMO_TO_MVP_MIGRATION_TRACKER.md`

**Git / locality state:**

- The demo is **not yet a Git repository** (no `.git` directory; `git rev-parse` reports "not a git repository").
- The workspace root is **not a Git repository**.
- The reserved MVP folder is **empty**.
- **No Git remote and no tag exist** anywhere.
- Everything remains **local**; no GitHub configured.

Full inventory facts are recorded in Section 6 (Current repository record).

> **Naming note:** on-disk names differ from earlier brief names. Actual demo folder is `SDS Project Sprint 2` (no "(demo)" suffix); reserved MVP folder is `SDS Project Final (BEST Coach)` (no "(MVP)" suffix); tracker filename is `BEST_COACH_DEMO_TO_MVP_MIGRATION_TRACKER.md`. The paths above are canonical.

---

## Step 1 — Approve local repository locations

**Status:** Completed  
**Accepted by orchestrator:** Yes

### Objective

Choose and record:

- demo repository absolute path;
- parent workspace path;
- new MVP repository absolute path.

### Required evidence

- [x] Paths approved by orchestrator
- [x] No path collision
- [x] MVP target folder is absent or empty
- [x] Parent-level master copy of this tracker exists

### Recorded result

- The paths recorded under Step 0 are the **approved canonical paths**.
- **No path collision exists** — demo, reserved MVP folder, and tracker occupy distinct locations under the same parent workspace.
- The **MVP target folder is empty** (`SDS Project Final (BEST Coach)`).
- The **parent-level migration tracker exists outside both project folders** (it lives at the workspace root, a sibling of both).

---

## Step 2 — Establish and verify the demo baseline

**Status:** Completed  
**Accepted by orchestrator:** Yes

### Objective

Verify what currently works before freezing the demo.

### Required evidence

- [x] Existing typecheck command passes
- [x] Existing lint command passes
- [x] Existing build command passes
- [x] Existing automated tests, if any, are run and recorded — none exist (no test framework or test files); recorded as "not applicable"
- [x] Bounded manual smoke test covers the working trainer flow
- [x] Known incomplete demo Step 15 disposition decided — see "Step 15 disposition" below
- [x] Existing environment secrets remain protected — `.env.local` not read, printed, or modified throughout Steps 2A/2B
- [x] No MVP changes introduced — MVP folder untouched; no authored demo file changed

### Recorded result — Step 2A automated baseline (verified 2026-07-21)

- `npx tsc --noEmit` — exit code 0, **PASS**
- `npm run lint` — exit code 0, **PASS**
- `npm run build` — exit code 0, **PASS** (Next.js 16.2.10, 11 routes emitted)
- **No authored source, configuration, documentation, or reference file changed** (SHA-256 verified before/after).
- `package.json` and `package-lock.json` **remained unchanged**; no dependency mutation run.
- Generated artifacts refreshed by the checks: `.next`, `tsconfig.tsbuildinfo`, `next-env.d.ts` (all generated/git-ignored; not authored content).
- `.env.local` was **not read, printed, or modified**.
- The MVP folder **remained empty and untouched**.

### Recorded result — Step 2B manual baseline (verified 2026-07-21)

Bounded browser smoke test (fresh server start, synthetic input only) **PASSED** for:

- cosmetic login;
- current-month calendar;
- exactly two active dates;
- Junior A session flow;
- Advanced B locked-session popup;
- roster;
- required-field validation;
- reactive missing-field highlighting;
- forced AI failure;
- retry and real AI generation;
- Review & Approve;
- Student Queue;
- edit persistence;
- approval success;
- Approved roster status;
- read-only report view;
- general integrity — no crash, no unexpected navigation, no tested-action console error.

Also recorded:

- **Synthetic input only** was used (no real child/parent/trainer/academy operational data).
- **Evidence upload was not required** for this baseline because no standard media fixture exists — not treated as a Step 14 regression.
- **Demo Step 15 remains intentionally incomplete and skipped** by orchestrator decision (see below).
- **No source fix was required.**
- The demo server was **stopped cleanly**, and **no demo-specific server process remained running** afterward (only an unrelated Adobe Creative Cloud node process was present and left untouched).

### Step 15 disposition (orchestrator decision)

- **Demo Step 15 will not be implemented.**
- The demo will be **frozen at verified Step 14**.
- Step 15 is **intentionally skipped** because the completed demo has already served its purpose; the corresponding production ("read-only View" with Assessment Snapshot + Focus Tags) will instead be built against the MVP architecture and governance rules.
- The demo's own `progress_tracking.md` is **not** being altered as part of this decision — it continues to show Step 15 as incomplete, which is factually correct.

---

## Step 3 — Freeze the demo locally

**Status:** Completed  
**Accepted by orchestrator:** Yes

### Objective

Preserve the verified demo as a local reference.

### Required evidence

- [x] Working tree reviewed
- [x] Unrelated generated artifacts excluded
- [x] Coherent local freeze commit created
- [x] Local tag created
- [x] Demo still passes its baseline after freeze
- [x] No GitHub push performed unless explicitly requested

The freeze was executed in two bounded sub-checkpoints. Both are complete and accepted.

### Step 3A — Freeze safeguards

**Status:** Completed

- [x] Verify `.env.local` remains ignored by `.gitignore` — confirmed (`.gitignore:34`); present, unread, unmodified.
- [x] Add ignore rules for the three runtime log files:
  - `dev-server.log`
  - `.codex-dev-webpack.out.log`
  - `.codex-dev-webpack.err.log`
- [x] Review whether existing generated/runtime files should be deleted from the working directory before Git initialization — the three disposable runtime logs were deleted; `.next`, `node_modules`, `tsconfig.tsbuildinfo`, and `next-env.d.ts` were left in place and remain ignored.
- [x] Confirm no secret-bearing file would be staged — filename scan found no unexpected secret-bearing file.

**Recorded result (2026-07-21):**

- `.env.local` remains present, ignored, unread, and unmodified.
- `.gitignore` was updated to ignore the three runtime logs (`dev-server.log`, `.codex-dev-webpack.out.log`, `.codex-dev-webpack.err.log`).
- The three disposable runtime logs were deleted.
- `.next`, `node_modules`, `tsconfig.tsbuildinfo`, and `next-env.d.ts` remain ignored.
- No unexpected secret-bearing filename was found.
- **Only `.gitignore` changed** during safeguards; no application source, package, governance, progress, or reference file changed.

### Step 3B — Local Git freeze

**Status:** Completed

- [x] Initialize Git only inside the canonical demo folder — repo root `SDS Project Sprint 2`, initial branch `main`.
- [x] Review the complete staged-file list — 58 files, `58 additions / 0 modifications / 0 deletions`; all excluded/secret/generated paths confirmed unstaged (Step 3B1).
- [x] Create one coherent local freeze commit.
- [x] Create one local freeze tag.
- [x] Verify the frozen checkout still passes the accepted baseline.
- [x] Do not configure or push to any remote — no remote exists; nothing pushed.

**Recorded result — local Git freeze (2026-07-21):**

- Git repository initialized only inside `C:\Users\enyul\Vibe Studio\B.E.S.T-Coach-Workspace\SDS Project Sprint 2`.
- Initial branch: `main`.
- Freeze commit: `8d4acf4abc5039c24da01be773ab1a5e4916080f` (short `8d4acf4`).
- Commit date: `2026-07-21 05:30:43 +0800`.
- Commit message: `chore(demo): freeze verified trainer-flow baseline at step 14`.
- Commit summary: `58 files changed, 14240 insertions, 0 deletions`.
- Annotated freeze tag: `demo-freeze-step14-2026-07-21`.
- Tag message: `Verified local B.E.S.T Coach trainer-flow demo frozen at completed Step 14; Step 15 intentionally skipped.`
- Tag points exactly to the freeze commit.
- Working tree is clean; no Git remote exists; nothing was pushed; everything remains local.

**Recorded result — post-freeze automated verification (committed checkout, 2026-07-21):**

- `npx tsc --noEmit` — exit code 0
- `npm run lint` — exit code 0
- `npm run build` — exit code 0
- No warnings or failures reported.
- Generated verification artifacts remained ignored and unstaged.
- Package files remained unchanged.
- `.env.local` remained protected and untouched.
- The MVP folder remained empty and untouched.
- The previously accepted manual smoke test (Step 2B) remains valid because no application source changed after it.

---

## Step 4 — Create the fresh MVP repository

**Status:** Completed  
**Accepted by orchestrator:** Yes

### Objective

Create a separate local MVP repository using the approved Next.js and package-manager setup, in the reserved empty MVP folder, without copying demo architecture or configuring a remote.

### Required evidence

- [x] Fresh folder created — scaffolded via temp dir, moved into `SDS Project Final (BEST Coach)`
- [x] Git initialized locally — repo inside the MVP destination, branch `main`
- [x] Approved Node and package-manager versions recorded — Node 24 LTS (`v24.16.0`), npm `11.13.0`
- [x] Initial scaffold runs — starter served HTTP 200
- [x] No demo architecture copied wholesale — zero demo files copied
- [x] Initial scaffold verification passes — tsc/lint/build all exit 0
- [x] Initial commit created — `4de3f93c64ffea4883655f411d2f35a9a35f15d6`

Step 4 was executed in two bounded sub-checkpoints; both complete and accepted.

### Step 4A — Toolchain and scaffold decision

**Status:** Completed  
**Accepted by orchestrator:** Yes

- [x] Verify the current official Next.js Node.js requirements — MVP targets Node 24 LTS (see decision below).
- [x] Select and record the MVP Node.js version.
- [x] Select and record the package manager.
- [x] Confirm the scaffold command and options.
- [x] Confirm no demo source will be copied during scaffolding.

**Verified local prerequisites (read-only, 2026-07-21):**

- Workspace: `C:\Users\enyul\Vibe Studio\B.E.S.T-Coach-Workspace`
- Frozen demo: `C:\Users\enyul\Vibe Studio\B.E.S.T-Coach-Workspace\SDS Project Sprint 2`
- MVP destination: `C:\Users\enyul\Vibe Studio\B.E.S.T-Coach-Workspace\SDS Project Final (BEST Coach)` — **verified completely empty** (0 entries, no hidden files).
- Frozen-demo integrity: branch `main`, commit `8d4acf4abc5039c24da01be773ab1a5e4916080f`, tag `demo-freeze-step14-2026-07-21`, working tree clean, no remote.
- Installed versions: Node.js `v24.16.0`, npm `11.13.0`, npx `11.13.0`, Git `2.54.0.windows.1`.
- Temp scaffold candidates `best-coach-mvp` and `best-coach-mvp-scaffold`: both absent from the workspace.
- No demo-specific Node/Next server running (only an unrelated Adobe Creative Cloud node process, untouched).
- MVP destination basename `SDS Project Final (BEST Coach)` contains uppercase letters, spaces, and parentheses → **not a valid npm package name** for direct `create-next-app` scaffolding.

**Ratified toolchain decision (orchestrator-approved):**

- Node.js major line: `24 LTS`; current `v24.16.0` accepted for scaffolding.
- Future project engine range: `>=24 <25`; planned `.nvmrc`: `24`.
- Package manager: `npm` — use locally confirmed npm `11.13.0` unless the scaffold command resolves a different bundled npm before files are generated.
- Framework: latest stable Next.js resolved by `create-next-app@latest`.
- Router: App Router. Language: TypeScript. Styling: Tailwind CSS. Linting: ESLint. Bundler: Turbopack.
- Import alias: `@/*`. Source layout: root-level `/app`, no `/src`.
- React Compiler: disabled initially.
- create-next-app generated `AGENTS.md` and `CLAUDE.md`: disabled.
- create-next-app automatic Git initialization: disabled — Git is initialized deliberately after the scaffold is moved and reviewed.
- No GitHub remote will be configured or pushed.

**Ratified scaffold strategy:** Direct scaffolding into `SDS Project Final (BEST Coach)` will **not** be used because its basename is not npm-package-compatible. Instead, scaffold into a temporary lowercase sibling directory, then move the generated files into the reserved destination (see Step 4B).

### Step 4B — Fresh local scaffold

**Status:** Completed  
**Accepted by orchestrator:** Yes

The scaffold was executed via the approved temporary lowercase directory strategy and moved into the reserved destination. The command used was:

```powershell
npx create-next-app@latest best-coach-mvp --typescript --tailwind --eslint --app --no-src-dir --turbopack --import-alias "@/*" --use-npm --no-react-compiler --no-agents-md --disable-git --yes
```

**Recorded result — scaffold + move (2026-07-21):**

- Temporary scaffold at `C:\Users\enyul\Vibe Studio\B.E.S.T-Coach-Workspace\best-coach-mvp` completed successfully (exit 0); dependency installation completed successfully (356 packages).
- Resolved framework versions: **Next.js `16.2.10`**, **React `19.2.4`**, **React DOM `19.2.4`**.
- All 13 generated items (including hidden files) moved into `SDS Project Final (BEST Coach)`; source/destination counts matched; the temporary directory was then removed after the move.
- Package name is `best-coach-mvp`; `.nvmrc` (`24`), `engines` (`>=24 <25`), and `packageManager` (`npm@11.13.0`) declarations were added.
- No `.env.local` was created; no `CLAUDE.md` or `AGENTS.md` was generated; no Supabase, database, governance, progress, demo, mock-state, or reference files were added; no `/src` directory.
- Untouched create-next-app starter returned **HTTP 200**; the starter dev server was stopped cleanly; no MVP-specific process remained running.
- No demo source, Context, mock state, route, component, or reference asset was copied.

**Recorded result — automated verification (2026-07-21):**

- `npx tsc --noEmit` — exit code 0
- `npm run lint` — exit code 0
- `npm run build` — exit code 0
- Starter smoke test — HTTP 200 (Step 4B1); no authored file changed after verification; generated artifacts remained ignored.
- create-next-app reported **two moderate-severity npm audit advisories**; no `npm audit fix` was run; no dependency mutation was performed. Advisories remain a follow-up item for the later security/dependency review.

**Recorded result — initial MVP Git commit (2026-07-21):**

- Git repository initialized only inside the MVP destination; branch `main`.
- Initial commit: `4de3f93c64ffea4883655f411d2f35a9a35f15d6` (short `4de3f93`).
- Commit date: `2026-07-21 06:48:28 +0800`.
- Commit message: `chore(mvp): initialize fresh Next.js scaffold`.
- Commit summary: `18 files changed, 7121 insertions, 0 deletions`.
- Exactly one commit exists; working tree clean; no tag exists; no remote exists; nothing was pushed.
- Post-commit typecheck, lint, and production build all passed (exit 0).

### Build-notes requirement

This is the point at which the MVP's `docs/progress/BUILD_NOTES.md` begins. Every subsequent migration and implementation checkpoint must be recorded there.

---

## Step 5 — Install and reconcile MVP governance documents

**Status:** Completed  
**Accepted by orchestrator:** Yes

> **Substantive deliverable accepted at governance commit `c7c27e5e2f772725d88fbed1b5e1459d509960ce`.** The subsequent administrative synchronization commit `a39ed21` covers progress records only and does **not** reopen the accepted governance content.
>
> **Step 5 is fully closed at MVP HEAD `a39ed21d4ecf405b3425db711e63a2f71f0f1586`.** All sub-checkpoints (5A, 5B1, 5B2, 5B3, 5B4, 5B5) are complete and accepted. The next permitted checkpoint is **Step 6A**.

### Objective

Install the MVP instruction, specification, orchestration, status, build-note, UI-reference, and migration documents at permanent paths.

### Required evidence

- [x] Root `CLAUDE.md` installed (reconciled to Amendment 001)
- [x] v3 specification installed at the path declared in `CLAUDE.md` (byte-for-byte)
- [ ] AI Features Breakdown installed — **N/A / MISSING**: `BEST_Coach_AI_Features_Breakdown_v2.docx` unavailable; **non-blocking** for governance, Phase 0, and MVP Phases 1–4 (Amendment 001 A-011). Required before either deferred aggregate-AI feature enters scope. Not fabricated.
- [x] Implementation Plan installed (reconciled to Amendment 001)
- [ ] Stitch exports installed or their migration source path recorded — **deferred by design** (A-013): installed selectively only after accepted Phase 0 and an approved asset disposition; source path recorded as the frozen demo's `reference/` (9 folders), reference-only.
- [x] `docs/progress/STATUS.md` created
- [x] `docs/progress/BUILD_NOTES.md` created
- [x] This tracker copied to `docs/progress/DEMO_TO_MVP_MIGRATION.md` (Step 5B2)
- [x] Session-continuity and build-evidence rules added to `CLAUDE.md` (§11, both documents mandatory)
- [x] Demo-migration rules added to `CLAUDE.md` (new §13 — frozen demo reference-only)
- [x] Demo governance files absent from MVP root (no `AGENTS.md` / `DEMO_BUILD_PLAN.md` / `progress_tracking.md`)
- [x] All paths referenced by `CLAUDE.md` exist
- [x] Conflicts among the specification, `CLAUDE.md`, and Implementation Plan documented (Step 5A register C-01 … C-14)
- [x] Parent-evidence policy reconciled and approved (Amendment 001 A-001 … A-004)
- [x] Source-of-truth hierarchy documented in `STATUS.md`
- [x] Document reconciliation recorded in `BUILD_NOTES.md`

Step 5 remains **Pending** until the governance-baseline commit is created and verified (Step 5B3). It is executed in bounded sub-checkpoints: **5A** (inventory/reconciliation plan) → **5B1** (install) → **5B2** (migration copy + staging) → **5B3** (commit).

### Step 5A — Governance-document inventory and reconciliation plan

**Status:** Completed  
**Accepted by orchestrator:** Yes

- [x] Inventory all available MVP governance, specification, implementation-plan, AI-feature, UI-reference, and migration documents.
- [x] Verify exact filenames, formats, and locations.
- [x] Identify any missing required document.
- [x] Compare `CLAUDE.md`, MVP Specification v3, and the Implementation Plan for conflicts (all seven listed topics covered).
- [x] Propose exact destination paths inside the MVP repository.
- [x] Do not copy or edit documents yet — checkpoint was strictly read-only.

**Recorded result (2026-07-21):**

- The local workspace **initially lacked all authoritative MVP governance inputs** — Specification v3, AI Features Breakdown v2, Implementation Plan, and a root `CLAUDE.md` were absent, present only as *references* inside this tracker. Step 5B was therefore initially assessed **BLOCKED — BOTH** (missing documents + unresolved conflicts).
- The **three authoritative source files were subsequently supplied** by the orchestrator in `governance-source/`:
  - `CLAUDE.md`, `BEST_Coach_Complete_MVP_Specification_v3.md`, `BEST_Coach_Implementation_Plan.md`.
- **`BEST_Coach_AI_Features_Breakdown_v2.docx` remains missing.** Its absence is **non-blocking** for governance installation, Phase 0, and current MVP Phases 1–4 (Specification v3 already incorporated its aggregate-AI detail). It **is required** before either deferred aggregate-AI feature (Weekly Class Health Brief §28.1, Child Progress Digest §28.2) enters scope. It was **not fabricated** and no placeholder was created.
- The **source-of-truth hierarchy was accepted**: Specification v3 → ratified amendments → root `CLAUDE.md` → Implementation Plan (procedural) → Stitch/UI reference (visual only) → `STATUS.md` → `BUILD_NOTES.md` → this temporary migration tracker.
- The **conflict register C-01 through C-13 was reviewed** (plus C-14 for additional findings): parent evidence access, evidence phase ordering, Phase 2 exit, Parent UAT, local Git vs GitHub-first, Node version, audit-mirror timing, continuity documents, testing/accessibility, audit-permission verification method, AI-Breakdown availability, Implementation Plan authority, and migration-tracker lifecycle.
- **Step 5B readiness changed from BLOCKED to READY** once the three files were supplied and the reconciliation decisions were ratified as Amendment 001.

### Step 5B1 — Install reconciled governance baseline

**Status:** Completed  
**Accepted by orchestrator:** Yes

- [x] Install the approved documents at their permanent MVP paths.
- [x] Create `docs/progress/STATUS.md`.
- [x] Create `docs/progress/BUILD_NOTES.md`.
- [x] Make only approved reconciliation edits.
- [x] Verify all paths referenced by root `CLAUDE.md`.

**Recorded result (2026-07-21):**

- **Governance-source files verified** (unchanged; `governance-source/`):
  - `CLAUDE.md` — `b73813a3448e38991a0ce94a7e4e2789836625db23f6f8fd6715fe4b8d22ee19`
  - `BEST_Coach_Complete_MVP_Specification_v3.md` — `64d54aa2f0b3200b540b50cebfb5a614e7d644e895effcf5428bd96ae60852a2`
  - `BEST_Coach_Implementation_Plan.md` — `5e99823958a3f6f1e2d549af964c356771d0d65578fda2b28f1ebe0e9a24939b`
- **Specification v3 copied byte-for-byte**; installed hash `64d54aa2f0b3200b540b50cebfb5a614e7d644e895effcf5428bd96ae60852a2` (identical to source — the specification itself was **not** edited; all reconciliations live in the amendment).
- **Amendment 001 created** at `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_001.md` with decisions **A-001 through A-013** and a supersession table naming the affected v3 clauses (§21, §23, §26 Phase 2 exit).
- **Root `CLAUDE.md` reconciled** (13 surgical edits; all standing-contract content preserved).
- **Implementation Plan reconciled** (15 surgical edits; Phase 5, deferred features, and the HQ-tier note preserved).
- **`STATUS.md` created**; **`BUILD_NOTES.md` created**.
- **Exactly six governance files created.** No demo file, UI-screen asset, AI-Breakdown placeholder, environment file, or application file was added.
- **No staging and no commit occurred** in 5B1; the demo remained clean; MVP application/package/configuration files remained unchanged.

### Step 5B2 — Install active migration copy and stage governance baseline

**Status:** Completed  
**Accepted by orchestrator:** Yes

- [x] Record Step 5A acceptance and the ratified reconciliation decisions in this tracker.
- [x] Record Step 5B1 acceptance in this tracker.
- [x] Copy this tracker byte-for-byte to `docs/progress/DEMO_TO_MVP_MIGRATION.md` (the **active migration record**, retained as archived migration history at closure).
- [x] Update `docs/progress/STATUS.md` and append a `BUILD_NOTES.md` entry.
- [x] Stage exactly the seven governance files and review the staged set.
- [x] Stop before committing — commit performed in Step 5B3.

**Recorded result (2026-07-21):**

- Workspace tracker updated (Step 5A/5B1 acceptance, ratified reconciliation decisions, sub-checkpoint structure, MVP repository record, decision log D-035 … D-050).
- **Active migration copy installed byte-for-byte** at `docs/progress/DEMO_TO_MVP_MIGRATION.md`.
- `docs/progress/STATUS.md` and `docs/progress/BUILD_NOTES.md` updated.
- **Exactly seven governance files were staged**; staged review passed (7 additions / 0 modifications / 0 deletions; 2697 insertions; nothing outside the approved paths; no file >5 MB).
- **An inter-turn worktree rollback was detected, disclosed, and recovered without changing Git history** — the tracker and the two continuity files had reverted to their pre-5B2 state while the Git index retained the correct content; the tracker was restored byte-for-byte from the migration copy and the worktree was resynced from the index (`git restore --worktree`). No history was amended, reset, or rebased.
- No application, package, dependency, secret, demo, or UI file changed.

### Step 5B3 — Create and verify the governance-baseline commit

**Status:** Completed  
**Accepted by orchestrator:** Yes

- [x] Create one coherent local governance-baseline commit from the accepted staged set.
- [x] Verify the commit and the resulting working-tree state.
- [x] No tag, no remote, no push.

**Recorded result (2026-07-22):**

- **Commit:** `c7c27e5e2f772725d88fbed1b5e1459d509960ce` (short `c7c27e5`)
- **Date:** `2026-07-22 02:23:13 +0800`
- **Message:** `docs(governance): install reconciled MVP baseline`
- **Parent:** `4de3f93c64ffea4883655f411d2f35a9a35f15d6`
- **Summary:** `7 files changed, 2697 insertions, 0 deletions`
- **Exactly two commits now exist**; working tree clean after commit; **no tag, no remote, nothing pushed**.
- Specification v3 remained **byte-for-byte unchanged** (`64d54aa2…`); Amendment 001 contains **A-001 through A-013**; document verification passed; **no active stale requirement remained** (Node 20, mandatory GitHub, Phase 1 parent evidence, absolute parent-evidence prohibition, Stitch as Phase 0 prerequisite, AI Breakdown as Phase 0 blocker, `STATUS.md` as sole continuity file).

### Step 5B4 — Governance closure synchronization

**Status:** Completed  
**Accepted by orchestrator:** Yes

**Scope (administrative only):**

- Close Step 5 in the records.
- Synchronize the tracker copy into the MVP.
- Update the permanent continuity documents.
- Stage only the three progress files.
- Stop before the administrative closure commit.

**Recorded result (2026-07-22):**

- **Step 5 closure was synchronized** across the workspace tracker and the MVP records.
- The **workspace tracker and the MVP migration copy matched at the time of staging** (`74a981c57aaed22fbe9d99ec8c95c5dd75039c50bc4d45372e59df09ad1500fc`).
- **`STATUS.md` and `BUILD_NOTES.md` were updated** (current state advanced; Step 5B3 commit entry and Step 5 closure entry appended).
- **Exactly three progress-file modifications were staged** — `docs/progress/DEMO_TO_MVP_MIGRATION.md`, `docs/progress/STATUS.md`, `docs/progress/BUILD_NOTES.md`.
- **Staged-set and document-consistency reviews passed** (0 additions / 3 modifications / 0 deletions; nothing outside the approved paths; no secret; no broken links).
- **No product, governance-policy, application, dependency, or secret content changed.**

This checkpoint changed **progress records only**. It did not reopen, alter, or re-litigate the accepted governance content committed at `c7c27e5`.

### Step 5B5 — Administrative governance-closure synchronization commit

**Status:** Completed  
**Accepted by orchestrator:** Yes

**Recorded result (2026-07-22):**

- **Commit:** `a39ed21d4ecf405b3425db711e63a2f71f0f1586` (short `a39ed21`)
- **Date:** `2026-07-22 03:34:42 +0800`
- **Message:** `docs(progress): synchronize migration and continuity records`
- **Parent:** `c7c27e5e2f772725d88fbed1b5e1459d509960ce`
- **Summary:** `3 files changed, 152 insertions, 43 deletions`
- **Committed files (exactly three progress files):**
  - `docs/progress/BUILD_NOTES.md`
  - `docs/progress/DEMO_TO_MVP_MIGRATION.md`
  - `docs/progress/STATUS.md`
- **Repository clean after commit**; **exactly three commits exist** (`a39ed21` ← `c7c27e5` ← `4de3f93`); **no tag, no remote, nothing pushed**.
- **All record and integrity checks passed** — migration copy ≡ workspace tracker; Specification v3 unchanged (`64d54aa2…`); `CLAUDE.md`, Amendment 001, and the Implementation Plan unchanged since `c7c27e5`; application/package/configuration files unchanged; no secret present; no broken relative links.

**Commit-message discrepancy — resolved as accepted, not a failure.** A later prompt proposed the wording `docs(progress): close governance installation`. The commit retains its original message `docs(progress): synchronize migration and continuity records`, accepted because:

- the existing message **accurately describes the change**;
- the **committed files, parent, and diff are correct** and match the approved staged set exactly;
- the **commit was already created before the later prompt was issued**;
- **rewriting clean Git history solely to change equivalent wording was unnecessary** (and would have changed the hash for no substantive gain).

This commit is **accepted**. It is **not** classified as a failure.

---

## Step 6 — Phase 0 prerequisite readiness (verify orchestrator-only prerequisites)

**Status:** Pending  
**Accepted by orchestrator:** No

### Objective

Verify prerequisites Claude Code cannot invent or safely perform autonomously.

### Step 6A — Orchestrator prerequisite and architecture-decision inventory

**Status:** Completed  
**Accepted by orchestrator:** Yes

- [x] Verify whether a Supabase project has been created.
- [x] Verify the project region from orchestrator-provided evidence.
- [x] Confirm the intended region is **Singapore**.
- [x] Verify Supabase URL / publishable key / secret key availability locally — **without printing values**.
- [x] Verify the selected LLM provider and API key availability locally — **without printing values**.
- [x] Select and record the production **data-access approach**.
- [x] Define the required `.env.local` variable **names**.
- [x] Define a safe `.env.example` with **placeholders only** (defined; file creation deferred to Step 6B2).
- [x] Verify the existing local-only Git and governance prerequisites.
- [x] Determine whether Phase 0 is **ready or blocked**.
- [x] **Phase 0 was not implemented in Step 6A.**

**Standing constraints (remain in force):**

- **Claude Code cannot create the Supabase project or perform any browser/OAuth setup** — the orchestrator must complete those actions.
- **No secret value may be pasted into reports, committed, or printed** — presence/absence only.
- **Stitch assets and the missing AI Features Breakdown do not block Phase 0** (Amendment 001 A-011, A-013).
- **Phase 0 must not start** until all mandatory prerequisites — including local tooling — are verified and accepted.

**Step 6A closure statement:**

- **Supabase project and Singapore region are verified.**
- **Required Supabase configuration is present locally** (ignored `.env.local`).
- **OpenAI provider, model, and key are present locally.**
- **Environment safeguards pass.**
- **Data-access architecture is resolved.**
- **Phase 0 product implementation has not started.**
- **Local implementation tooling remains outstanding** (Docker-compatible runtime and Supabase CLI) — addressed in Step 6B.

#### Step 6A1 — Phase 0 prerequisite inventory and architecture-decision verification

**Status:** Completed  
**Accepted by orchestrator:** Yes

**Recorded result (2026-07-22, read-only):**

- Repository and governance integrity **passed**; **Phase 0 had not started**.
- **Supabase project, region, and credentials were initially unverified** — no `supabase/config.toml`, no `supabase/migrations/`, no `.supabase/`, no SDK dependency, no local project reference.
- **No environment file initially existed** in the MVP root.
- **No LLM provider or model was initially ratified** — Specification v3 is deliberately provider-agnostic (§17, §19, ADR-5).
- **Supabase CLI and a Docker-compatible runtime were absent** (verified by installed-command discovery only; nothing downloaded, installed, or started).
- **Environment-variable contract defined** (six names):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SECRET_KEY`
  - `LLM_PROVIDER`
  - `LLM_MODEL`
  - `LLM_API_KEY`
- **No legacy Supabase variable name was selected** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` all rejected as the primary contract).
- **No secret may use a `NEXT_PUBLIC_` prefix.**
- The inventory was **strictly read-only** — no file created or modified, no network call, no secret read or exposed.

**Data-access decision — `RESOLVED — SUPABASE-NATIVE, NO GENERAL-PURPOSE ORM`:**

- `@supabase/ssr` for cookie-aware Next.js browser/server clients.
- `@supabase/supabase-js` as the underlying SDK.
- **RLS-scoped user-session clients** for normal access.
- **Governance-carrying writes** only through server actions or route handlers.
- **PostgreSQL functions/RPCs** for atomic state transition **plus** audit insertion in one transaction.
- **Invoker rights by default**; tightly reviewed **`SECURITY DEFINER` only where justified** (fixed `search_path`, restricted execute grants, security review).
- **Separate server-only elevated client** using `SUPABASE_SECRET_KEY`, never bound to browser cookies or a user session; every elevated operation performs its own authorization checks because the secret key bypasses RLS.
- **Supabase SQL migrations** are the schema source of truth (no dashboard-only change without a migration).
- **Generated database TypeScript types** committed; domain/validation types kept separate; strict TS.
- **An ORM may be added only through a later ADR and orchestrator approval.**

#### Step 6A2 — Orchestrator prerequisite verification

**Status:** Completed  
**Accepted by orchestrator:** Yes  
**Result:** `READY — CREDENTIAL AND PROVIDER PREREQUISITES VERIFIED`

**Supabase:**

- Project creation: **Orchestrator confirmed**.
- Region: **Southeast Asia (Singapore) — `ap-southeast-1`**.
- Region evidence: **Orchestrator personally verified in the Supabase dashboard**.
- Project URL: **present and nonempty** in ignored `.env.local`.
- Publishable key: **present and nonempty** in ignored `.env.local`.
- Secret key: **present and nonempty** in ignored `.env.local`.
- **No Supabase network validation was performed by Claude Code.**

**OpenAI:**

- Provider: **OpenAI** · Model: **`gpt-5.6-terra`**
- API: **Responses API** · Output contract: **Structured Outputs with strict JSON Schema**
- API key: **present and nonempty** in ignored `.env.local`.
- Provider selector verified equal to `openai`; model selector verified equal to `gpt-5.6-terra`.
- **No OpenAI network validation was performed by Claude Code.**
- **Synthetic-data-only remains mandatory** (ADR-6).

**Official model verification supplied by orchestrator:** the orchestrator separately verified against current official OpenAI API documentation that the model identifier **`gpt-5.6-terra` exists**, that the **Responses API is supported**, and that **Structured Outputs are supported**. Claude Code did **not** perform this web verification; it is recorded here as **orchestrator-supplied external verification**.

**Environment safeguards:**

- `.env.local` **exists**; **exactly the six approved application variables** are declared (no extras).
- `.env.local` is **ignored** (`.gitignore` `.env*`), **untracked**, and **unstaged**; Git working tree remained **clean**.
- **No legacy Supabase variable** is used as the primary contract.
- **No database password, access token, or direct Postgres connection string** is part of the six-variable application contract.
- **No secret value was exposed** — presence-only classification; no value, length, prefix, suffix, or format reported.

### Step 6B — Local Phase 0 tooling setup

**Status:** Completed  
**Accepted by orchestrator:** Yes  
**Accepted:** 2026-07-23

Credential and provider prerequisites were verified in Step 6A. What remained before Phase 0 was **local implementation tooling**, delivered across four bounded sub-checkpoints — 6B1 (Docker runtime), 6B2A (CLI install and scaffold), 6B2B (verification and staging), and 6B2C (commit) — all now completed and accepted.

**Step 6B closure record:**

- [x] **Docker Desktop with WSL 2 accepted** as the local container runtime.
- [x] **Linux Docker engine and Compose verified** — engine/client `29.6.2`, Compose `v5.3.1`, `OSType=linux`, `Architecture=x86_64`.
- [x] **Project-local pinned Supabase CLI installed** — `supabase@2.109.1`, exact pin, dev dependency, never global.
- [x] **Local Supabase configuration initialized** — `supabase/config.toml` (project ID `best-coach-mvp`) and `supabase/.gitignore`, committed as `0cdb782`.
- [x] **Safe `.env.example` committed** — six approved variable names, placeholder-only, no real credential.
- [x] **Secret `.env.local` remains ignored and untracked** — never printed, hashed, copied, or committed.
- [x] **The local stack has NOT yet been started** — `supabase start` was never run; no container or image exists.
- [x] **The remote project has NOT been linked** — no `supabase login`, no `supabase link`, no access token on this machine.
- [x] **Phase 0 product/schema implementation has NOT started.**

#### Step 6B1 — Orchestrator Docker-compatible runtime setup

**Status:** Completed  
**Accepted by orchestrator:** Yes  
**Accepted:** 2026-07-23

**Scope executed (orchestrator-only — required browser and administrator access):**

- [x] **Docker Desktop for Windows installed** by the orchestrator.
- [x] **WSL 2 backend** selected (Hyper-V backend not selected).
- [x] **Docker Desktop started and running.**
- [x] Docker **client**, **Compose plugin**, and **engine** verified available.
- [x] **MVP repository not changed.**
- [x] **Supabase CLI not installed.**
- [x] **Supabase not initialized.**
- [x] **Phase 0 not started.**

**Accepted evidence (non-secret tooling versions only):**

| Item | Recorded value |
|---|---|
| Docker Desktop | Installed and **running** |
| Backend | **WSL 2** |
| Docker client version | `29.6.2` (build `dfc4efb`) |
| Docker engine/server version | `29.6.2` |
| Docker Compose version | `v5.3.1` |
| Engine OS type | `linux` |
| Architecture | `x86_64` |
| Operating system | `Docker Desktop` |
| Insecure daemon exposure on TCP port `2375` | **Disabled** |
| Kubernetes | **Not enabled** |

**Verification record:**

- [x] `docker --version` succeeds — matches the orchestrator evidence.
- [x] `docker compose version` succeeds — matches the orchestrator evidence.
- [x] `docker info` succeeds **without exposing sensitive configuration** — only `ServerVersion`, `OSType`, `Architecture`, and `OperatingSystem` were read; full `docker info` was **not** printed.
- [x] Docker Desktop settings **visually confirmed by the orchestrator**: WSL 2 selected; Hyper-V not selected; insecure TCP daemon exposure on port `2375` disabled; Kubernetes not enabled.
- [x] MVP repository **remained clean** (`git status --short` produced no output, confirmed independently by the orchestrator and at Step 6B1 closure).
- [x] **No repository file changed.**
- [x] **No container was run** (no `docker run`, no `docker pull`, no test container).
- [x] **No Supabase CLI was installed.**
- [x] **Phase 0 did not start.**

#### Step 6B2A — Project-scoped Supabase CLI and local-project initialization

**Status:** Completed  
**Accepted by orchestrator:** Yes  
**Accepted:** 2026-07-23

**Executed and verified:**

- [x] **`supabase@2.109.1` verified as the approved stable version** — resolved from the registry as the `latest` dist-tag; the `beta` tag pointed to a different version (`2.110.0-beta.36`); no prerelease suffix; no registry-integrity error.
- [x] Installed as an **exact project development dependency** — `npm install --save-dev --save-exact supabase@2.109.1` (exit 0); `devDependencies.supabase = "2.109.1"` with **no caret or tilde**; `package-lock.json` purely additive (**237 insertions, 0 deletions**), so no existing dependency version changed.
- [x] **No global Supabase CLI installed** — `command -v supabase` absent; `npm ls -g` shows no supabase.
- [x] **Project-local CLI verified through `npx --no-install`** — `npx --no-install supabase --version` returned `2.109.1`.
- [x] **`supabase init` completed** (exit 0, `Finished supabase init.`), run non-interactively (no `-i`), so **no IDE-settings prompt or generation** occurred (`.vscode`, `deno.json` absent).
- [x] **Generated:** `supabase/.gitignore` and `supabase/config.toml` — the complete generated set, enumerated after the fact rather than assumed.
- [x] **Generated project identifier normalized** from the folder-derived `"SDS_Project_Final_BEST_Coach_"` to **`best-coach-mvp`** — a single-line edit; no other generated setting altered (file size moved 15,610 → 15,595 B, exactly the identifier shortening; line count unchanged at 414).
- [x] **`.gitignore` retained `.env*`** (line 34) and **added `!.env.example`** immediately after it (line 35) — one line added, no other ignore rule touched, no protection weakened.
- [x] **`.env.example` created** with exactly the **six approved variables** and **no real credentials** — only the two non-secret ratified selectors carry values (`LLM_PROVIDER=openai`, `LLM_MODEL=gpt-5.6-terra`); no URL, key, password, token, connection string, or legacy Supabase variable.
- [x] **`.env.local` remained ignored, untracked, unstaged, and unopened** — presence-only checks throughout; no value, length, prefix, suffix, or format read or reported; never copied.
- [x] **No authentication, linking, migration, container start, or hosted-project operation occurred** — no `supabase login`, `supabase link`, or `supabase start`; Docker reported `Containers=0` and `Images=0` after init; no `%USERPROFILE%\.supabase\` directory or access token exists.
- [x] **No schema implementation began.**

**Generated Supabase configuration — sensitive-content review passed:** no hosted Supabase URL, API key, database password, access token, or project secret. Every secret-shaped setting is a commented template, an empty string, or an `env(...)` reference; all URL values are loopback defaults (`http://127.0.0.1`, `http://127.0.0.1:3000`) or a relative path.

#### Step 6B2B — Supabase tooling scaffold verification and staging

**Status:** Completed  
**Accepted by orchestrator:** Yes  
**Accepted:** 2026-07-23

**Exact six-file staged set:**

| Path | Status |
|---|---|
| `.env.example` | Added |
| `.gitignore` | Modified |
| `package.json` | Modified |
| `package-lock.json` | Modified |
| `supabase/.gitignore` | Added |
| `supabase/config.toml` | Added |

- [x] **Composition:** `3 modifications, 3 additions, 0 deletions`.
- [x] **`672 insertions, 0 deletions`.**
- [x] **Typecheck passed** — `npx tsc --noEmit`, exit 0.
- [x] **Lint passed** — `npm run lint`, exit 0.
- [x] **Production build passed** — `npm run build`, exit 0 (Next.js 16.2.10 Turbopack; 4/4 static pages).
- [x] **No warnings and no errors** from any of the three commands.
- [x] **Staged-content and secret scans passed** — `sk-`, `eyJ`, `.supabase.co`, `postgres://`, `postgresql://`, `ANON_KEY`, `PASSWORD=` all 0; the only `service_role` / `access_token` matches were generated documentation comments in `config.toml`, not values. `git diff --cached --check` clean.
- [x] **No unstaged or untracked files remained** (0 / 0). No staged file exceeded 5 MB (largest 236 KB). Build artifacts `.next`, `next-env.d.ts`, `tsconfig.tsbuildinfo`, `node_modules` confirmed ignored and unstaged.
- [x] **No Supabase service or container was started.**
- [x] Staging used an explicit path-scoped `git add --` with the six paths; `git add -A` was **not** used.

#### Step 6B2C — Commit local Supabase tooling scaffold

**Status:** Completed  
**Accepted by orchestrator:** Yes  
**Accepted:** 2026-07-23

| Field | Value |
|---|---|
| **Full commit** | `0cdb7825b0d4bcd9ad9b40323a3e90228065f006` |
| **Short commit** | `0cdb782` |
| **Date** | `2026-07-23 11:08:38 +0800` |
| **Message** | `chore(tooling): initialize local Supabase scaffold` |
| **Parent** | `a39ed21d4ecf405b3425db711e63a2f71f0f1586` |
| **Summary** | `6 files changed, 672 insertions, 0 deletions` |

- [x] Message is a **single subject line with an empty body** — byte-exact, no trailer added.
- [x] **Post-commit typecheck, lint, and build all passed** (exit 0 each; no warnings, no errors).
- [x] **Working tree clean.**
- [x] **Exactly four commits now exist** — `4de3f93` → `c7c27e5` → `a39ed21` → `0cdb782`.
- [x] **No tag, remote, or push.**
- [x] **No Supabase runtime, linking, authentication, or migrations occurred.**
- [x] **Phase 0 schema implementation remained unstarted** — `supabase/migrations`, `supabase/functions`, `supabase/seed.sql`, `src/`, `lib/`, `db/`, `server/` all absent.
- [x] Exactly one commit was created — no amend, reset, rebase, or second commit.

#### Dependency advisory record (accepted observed state, 2026-07-23)

- **3 current advisories — 1 moderate, 2 high.**

| Package | Severity | Relationship |
|---|---|---|
| `next` | high | direct dependency |
| `sharp` | high | transitive, via `next` |
| `postcss` | moderate | transitive, via `next` |

- **None was attributed to `supabase@2.109.1`** or to any of the 8 packages it newly installed (`supabase`, `@supabase/cli-windows-x64`, `eciesjs`, `jose`, `@ecies/ciphers`, `@noble/ciphers`, `@noble/curves`, `@noble/hashes`).
- The advisory state **changed relative to the earlier snapshot** (previously recorded as two moderate) **because the npm advisory database changed** — the affected `next` dependency itself is unchanged.
- **No `npm audit fix` was run** and no dependency was installed, removed, or updated for remediation.
- **These advisories are NOT resolved.** Remediation remains **deferred to a reviewed dependency/security checkpoint**.

#### Step 6B2D — Supabase tooling record synchronization and staging

**Status:** Completed  
**Accepted by orchestrator:** Yes  
**Accepted:** 2026-07-23

- [x] **Workspace tracker synchronized byte-for-byte** into `docs/progress/DEMO_TO_MVP_MIGRATION.md` — copied with `cp`, never edited afterward; source and destination hashes verified equal and `cmp` reported identical.
- [x] **`STATUS.md` and `BUILD_NOTES.md` updated** — STATUS moved to the Phase 0-ready lifecycle stage with the Step 6 tooling state and refreshed follow-ups; BUILD_NOTES gained four chronological entries (6B2A, 6B2B, 6B2C, Step 6 closure) with **no earlier entry rewritten**.
- [x] **Exactly three progress-file modifications staged** — `docs/progress/BUILD_NOTES.md`, `docs/progress/DEMO_TO_MVP_MIGRATION.md`, `docs/progress/STATUS.md`, staged with an explicit path-scoped `git add --` (never `git add -A`).

| Metric | Value |
|---|---|
| Modifications | **3** |
| Additions | **0** |
| Deletions | **0** |
| Insertions | **488** |
| Deleted lines | **52** |

- [x] **Tracker and staged migration-copy SHA-256:** `1d3350de1842b4629131ce0517164ce2ff51c66e1d9e034ac83cc23b397c2cbd`.
- [x] **No application, dependency, environment, Supabase configuration, governance, or demo file changed** — all six committed tooling files, `CLAUDE.md`, the Specification, Amendment 001, the Implementation Plan, `app/`, `public/`, and every project configuration file showed 0 diffs against `0cdb782`.
- [x] **No implementation or runtime operation occurred** — no dependency install, no Supabase command, no container, no typecheck/lint/build, no application run.
- [x] `git diff --cached --check` reported trailing whitespace only on **two-space Markdown hard line breaks** inherited verbatim from this tracker; these are intentional and the migration copy was **not** altered independently.

#### Step 6B2E — Commit Supabase tooling record synchronization

**Status:** Completed  
**Accepted by orchestrator:** Yes  
**Accepted:** 2026-07-23

| Field | Value |
|---|---|
| **Full commit** | `a83ec7aa66a32b7da33b9d9d84cd01be81426581` |
| **Short commit** | `a83ec7a` |
| **Date** | `2026-07-23 13:02:40 +0800` |
| **Message** | `docs(progress): close local Supabase tooling setup` |
| **Parent** | `0cdb7825b0d4bcd9ad9b40323a3e90228065f006` |
| **Summary** | `3 files changed, 488 insertions, 52 deletions` |

- [x] **Repository clean after commit**; branch `main`; **exactly five commits** (`4de3f93` → `c7c27e5` → `a39ed21` → `0cdb782` → `a83ec7a`).
- [x] **No tag, remote, or push**; no amend, reset, rebase, or second commit.
- [x] **The committed migration copy remained byte-identical to the pre-update workspace tracker** (`1d3350de…`), verified across the tracker, the worktree copy, and the committed blob.
- [x] **Phase 0 implementation remained unstarted** — `supabase/migrations`, `supabase/functions`, `supabase/seed.sql`, `src/`, `lib/`, `db/`, `server/` all absent.
- [x] Post-commit record verification confirmed no record claims a started local stack, a linked hosted project, a remote migration, begun Phase 0 schema work, or resolved advisories; no secret value appears; no broken relative Markdown link was introduced (the three records contain no relative links).

**Self-reference note.** The committed progress files correctly identify the **substantive tooling commit `0cdb782`** as the accepted implementation/tooling HEAD. The **absence of a self-reference to `a83ec7a`** inside those files **is not a defect** — it is the intended outcome of the anti-recursion rule (D-060 … D-066), and no follow-up commit was or will be created to add it.

### Required evidence

- [ ] Supabase project created
- [ ] Singapore region confirmed through the dashboard
- [ ] Supabase project URL, anon key, and service-role key available locally
- [ ] Local environment file created without exposing values
- [ ] `.env.example` contains placeholders only
- [ ] `.gitignore` protects local secrets
- [ ] LLM provider selected
- [ ] LLM API key available locally
- [ ] ORM/data-layer decision recorded
- [ ] Node and package-manager decision recorded
- [ ] Synthetic-data-only rule recorded
- [ ] No real child, parent, trainer, or academy operational data used

---

## Step 7 — Phase 0 Foundations

**Status:** In progress  
**Accepted by orchestrator:** No

_(Previously titled "Complete MVP Phase 0 foundations" and marked `Blocked by Step 6`. Step 6 closed on 2026-07-23, so this step is now unblocked and retitled; the objective and exit evidence below are unchanged.)_

> **Phase 0 state — precise as of 2026-07-23.**
>
> - **Phase 0 is `In progress`.**
> - **Phase 0 local-runtime execution has begun and passed** (Step 7B).
> - **Phase 0 schema, Auth, RLS, audit and application implementation have NOT started.**
>
> The earlier blanket statement "Phase 0 has not started" is superseded by this three-part formulation and must not be repeated.

### Step 7A — Phase 0 foundation-slice planning

**Status:** Completed  
**Accepted by orchestrator:** Yes  
**Accepted:** 2026-07-23

- [x] **Planning-only review completed** — governing Phase 0 sections of Specification v3, Amendment 001, root `CLAUDE.md`, the Implementation Plan, `STATUS.md`, `BUILD_NOTES.md`, and the migration copy were read, together with the committed configuration and `app/`.
- [x] **No repository or runtime mutation occurred** — no file created, modified, or deleted; no dependency installed; no stack started; no image pulled; no migration, seed, Auth user, generated type, or source code created; no hosted operation; no Git mutation.
- [x] **Phase 0 obligations and checkpoint sequence were extracted** into a 24-row requirement matrix mapping every obligation to its governing source, its Phase 0 necessity, its first-slice necessity, its deferred checkpoint, and its acceptance evidence. Nothing was silently narrowed or expanded.
- [x] **Recommended first implementation slice: local Supabase startup and health verification only** — chosen over "startup + dependencies" and "startup + clients + boundaries" because it isolates the single highest-variance risk domain (container runtime) in the one checkpoint that produces **zero Git diff**, so a failure needs no rollback.

**Accepted planned sequence:**

| Checkpoint | Scope |
|---|---|
| **7B** | Local runtime — start, verify, stop the local Supabase stack |
| **7C** | Dependency selection and installation |
| **7D** | Supabase clients and `server-only` boundaries |
| **7E** | First SQL migration |
| **7F** | Auth and synthetic identities |
| **7G** | RLS relationship proof |
| **7H** | Audit hash chain |
| **7I** | Authorised server action |
| **7J** | Generated database types |
| **7K** | Automated and manual Phase 0 evidence |
| **7L** | Separately approved hosted linking and remote migration |

**Unresolved findings recorded at Step 7A — none silently resolved:**

1. **Data-layer governance tension.** Specification v3 §18 and `CLAUDE.md` §9 both describe `/server/db` as holding a *typed client (Prisma or Drizzle)*, while accepted decision **D-067** selects **Supabase-native access with no general-purpose ORM**. D-067 is recorded only in this tracker, which is the **lowest-precedence** document, so it cannot override `CLAUDE.md` or v3. **Formal ratification (an Amendment 002 or an explicit `CLAUDE.md` edit) is required before Step 7E or Step 7J.** It did **not** block Step 7B and does **not** block Step 7C.
2. **New tables are not automatically exposed.** The generated `config.toml` records that new `public` entities are not reachable by `anon`/`authenticated`/`service_role` without explicit `GRANT`s. **Future migrations must use deliberate grants**, and a missing grant **must not be misdiagnosed as an RLS failure**.
3. **PostgreSQL 17 provides built-in `sha256(bytea)`.** `pgcrypto` is **not required solely for SHA-256 audit hashing** (`gen_random_uuid()` is likewise built in from PG 13).
4. **Schema and audit ambiguities must be resolved before their implementation checkpoints:** the `public` profile table's relationship to `auth.users`; the audit **target representation** (typed FK vs polymorphic `target_type`/`target_id`); **report-status storage values**; **audit chain scope** (one global chain vs per-target); **SHA-256 ratification** (v3 §23 names no algorithm); and **genesis representation**.

**No ambiguity was silently resolved.** Each finding is recorded for orchestrator decision at or before its dependent checkpoint.

### Step 7B — Local Supabase stack startup and health verification

**Status:** Completed  
**Accepted by orchestrator:** Yes  
**Accepted:** 2026-07-23

- [x] **Local Supabase runtime is operational on Windows.**
- [x] **Required Phase 0 services verified healthy.**
- [x] **Optional Analytics and Vector intentionally disabled.**
- [x] **Docker TCP 2375 remains disabled** (D-082 upheld throughout).
- [x] **PostgreSQL 17 verified.**
- [x] **Auth and REST verified.**
- [x] **Local stack currently stopped.**
- [x] **Images and persistent local volumes retained** (13 images, 3 volumes).
- [x] **Repository clean.**
- [x] **No schema or application implementation yet.**

#### Step 7B1 — Initial local Supabase stack verification

**Status:** Completed  
**Outcome:** **Failed service-health gate**  
**Accepted as diagnostic evidence by orchestrator:** Yes

- [x] **Cold start completed successfully in 124 seconds** (exit 0).
- [x] **13 Docker images pulled**; **12 project containers created**.
- [x] **PostgreSQL 17, Auth, REST, Studio, Storage, Realtime, Kong, Mail, Postgres Meta and Edge Runtime were operational.**
- [x] **Auth, REST and Studio probes passed** (HTTP 200 each).
- [x] **`public` schema contained zero application tables.**
- [x] **Vector entered a restart loop** (10 restarts, `health=unhealthy`) because Windows local Analytics requires **insecure Docker TCP exposure on port 2375**; its `docker_logs` source failed with `Listing currently running containers failed`, all sources finished, and the container exited 0 and restarted repeatedly.
- [x] **Docker TCP 2375 remained disabled under D-082.**
- [x] **Core Phase 0 services were healthy, but the checkpoint correctly failed** because one configured service was unhealthy — the gate was not waived, `--ignore-health-check` was not used, and no workaround was applied.
- [x] **`supabase/snippets/` was created as an empty, non-ignored runtime directory** (invisible to `git status` because Git does not track empty directories).
- [x] **The stack stopped cleanly**; all ports released.
- [x] **Repository remained unchanged**; **no secret was exposed**; **no schema/application implementation occurred**.

**Rejected remediation:** enabling **insecure Docker TCP 2375** — rejected as a **security regression** contradicting D-082.

**Accepted remediation:** disable optional local **Analytics/Vector**; ignore **`supabase/snippets/`**; **governed schema changes continue through SQL migrations**, never Studio snippets.

#### Step 7B-R1 — Windows local-stack remediation and verification

**Status:** Completed  
**Accepted by orchestrator:** Yes  
**Accepted:** 2026-07-23

- [x] `supabase/config.toml` changed **only**: `[analytics] enabled = true` → **`false`**.
- [x] `supabase/.gitignore` added **only**: **`snippets/`**.
- [x] **Migrations and `seed.sql` remain trackable** — neither is ignored; no broad `*.sql` rule was added.
- [x] **Docker TCP 2375 remained disabled.**
- [x] **Remediated stack started in 25 seconds** using cached images (no pulls).
- [x] **Zero warnings and zero errors** — the prior `tcp://localhost:2375` Analytics warning no longer occurred.
- [x] **Ten required project containers ran**: Kong, PostgreSQL, Studio, Auth, Storage, Realtime, Mail, Postgres Meta, REST, Edge Runtime.
- [x] **Zero unhealthy containers · zero restarting containers** (every container `restarts=0`).
- [x] **Logflare Analytics and Vector were absent by configuration** (0 containers each; port 54327 unbound).
- [x] **Auth health returned HTTP 200**; **REST returned HTTP 200**; **Studio returned HTTP 200**.
- [x] **PostgreSQL major version 17 verified.**
- [x] **`public` schema still contained zero application tables.**
- [x] **No migration, seed, Auth user, generated type or source code was created.**
- [x] **Stack stopped cleanly**; **project ports released**; **retained images and volumes preserved**.
- [x] **Exactly two approved files were staged**; **no other repository-visible change existed**.

#### Step 7B-R2 — Commit Windows local-stack remediation

**Status:** Completed  
**Accepted by orchestrator:** Yes  
**Accepted:** 2026-07-23

| Field | Value |
|---|---|
| **Full commit** | `25551c5d733fa581844db35ae3647c0ca8d52190` |
| **Short commit** | `25551c5` |
| **Date** | `2026-07-23 14:16:15 +0800` |
| **Message** | `chore(supabase): stabilize local Windows stack` |
| **Parent** | `a83ec7aa66a32b7da33b9d9d84cd01be81426581` |
| **Summary** | `2 files changed, 2 insertions, 1 deletion` |

- [x] **Working tree clean after commit.**
- [x] **Exactly six commits now exist.**
- [x] **No tag, remote or push.**
- [x] **No runtime operation occurred during the commit checkpoint.**
- [x] **Schema/application implementation remained unstarted.**

#### Step 7B-R3 — Phase 0 runtime record synchronization and staging

**Status:** Completed  
**Accepted by orchestrator:** Yes  
**Accepted:** 2026-07-24

- [x] **Workspace tracker synchronized byte-for-byte** into `docs/progress/DEMO_TO_MVP_MIGRATION.md` — copied with `cp`, never edited afterward; source and destination hashes verified equal, `cmp` identical, and confirmed at the Git object level (same blob).
- [x] **`STATUS.md` and `BUILD_NOTES.md` updated** — STATUS moved to the Phase 0-in-progress lifecycle with the runtime state and refreshed follow-ups; BUILD_NOTES gained five chronological entries (7A, initial 7B diagnostic run, 7B-R1, 7B-R2, 7B closure) with **no earlier entry rewritten** (the diff was purely additive apart from the trailing next-action footer pointer, which is not a dated entry).
- [x] **Exactly three progress files staged**, using an explicit path-scoped `git add --` (never `git add -A`).

| Metric | Value |
|---|---|
| Modifications | **3** |
| Additions | **0** |
| Deletions | **0** |
| Insertions | **332** |
| Deleted lines | **65** |

- [x] **Tracker and staged migration-copy SHA-256:** `66fa2d8eaffc3cae7f3b466036d0d5647346d5800c22360308717e9e1437d6ff`.
- [x] **Step 7A and Step 7B records were synchronized** into the MVP progress documents.
- [x] **Phase 0 was correctly recorded as `In progress` at the runtime-foundation level.**
- [x] **Schema/application implementation remained unstarted.**
- [x] **No runtime, dependency, schema, application, or hosted operation occurred.**
- [x] `git diff --cached --check` reported trailing whitespace only on **intentional two-space Markdown hard line breaks** inherited byte-for-byte from this tracker; the migration copy was **not** altered independently.

#### Step 7B-R4 — Commit Phase 0 runtime record synchronization

**Status:** Completed  
**Accepted by orchestrator:** Yes  
**Accepted:** 2026-07-24

| Field | Value |
|---|---|
| **Full commit** | `329f03c253cc3afc356be5873c963efc2eb35e12` |
| **Short commit** | `329f03c` |
| **Date** | `2026-07-24 14:24:35 +0800` |
| **Message** | `docs(progress): record Phase 0 runtime foundation` |
| **Parent** | `25551c5d733fa581844db35ae3647c0ca8d52190` |
| **Summary** | `3 files changed, 332 insertions, 65 deletions` |

- [x] **Repository clean after commit.**
- [x] **Exactly seven commits** — `4de3f93` → `c7c27e5` → `a39ed21` → `0cdb782` → `a83ec7a` → `25551c5` → `329f03c`.
- [x] **No tag, remote or push.**
- [x] **Tracker and committed migration copy remained byte-identical before this tracker-only update** (`66fa2d8e…` on both sides).
- [x] **No dependency, runtime, schema, application, or hosted operation occurred.**

**Self-reference note.** The committed progress files correctly identify the **substantive runtime commit `25551c5`**. Their **absence of a self-reference to administrative commit `329f03c` is intentional and is not a defect** — it is the required outcome of the anti-recursion rule, and no follow-up commit was or will be created to add it.

#### Step 7B sequence closure

**All of the following are Completed and Accepted (2026-07-24):**

| Sub-checkpoint | Status |
|---|---|
| **Step 7A** — Phase 0 foundation-slice planning | Completed · Accepted |
| **Step 7B1** — initial diagnostic run | Completed · Accepted as diagnostic evidence (failed service-health gate) |
| **Step 7B-R1** — remediation and verification | Completed · Accepted |
| **Step 7B-R2** — remediation commit (`25551c5`) | Completed · Accepted |
| **Step 7B-R3** — record synchronization | Completed · Accepted |
| **Step 7B-R4** — administrative record commit (`329f03c`) | Completed · Accepted |
| **Step 7B** — overall | **Completed · Accepted** |

**Precise state preserved at closure:**

- **Phase 0 is `In progress`.**
- **Local runtime verification has passed.**
- **Local stack is currently stopped.**
- **Verified services:** PostgreSQL 17, Auth, REST, Studio, Storage, Realtime, Kong, Mail, Postgres Meta, and Edge Runtime.
- **Analytics and Vector are intentionally disabled locally.**
- **Docker TCP 2375 remains disabled.**
- **Schema, Auth population, RLS, audit-chain, and application implementation have NOT started.**
- **Hosted linking remains deferred.**

### Step 7C — Supabase runtime dependency selection and installation

**Status:** Completed  
**Accepted by orchestrator:** Yes  
**Accepted:** 2026-07-24

- [x] **Runtime dependencies selected, exact-pinned, installed and verified.**
- [x] **Node and peer compatibility passed.**
- [x] **Automated baseline passed** (typecheck, lint, production build).
- [x] **Current advisory state is 3 high, unresolved.**
- [x] **Dependency commit `ffd9eef` accepted.**
- [x] **The data-layer governance tension remains UNRESOLVED** (D-108).
- [x] **Installing Supabase-native packages did NOT resolve that tension** — it required, and still requires, an explicit governance decision.
- [x] **No Supabase clients, server boundaries, schema or application functionality exist yet.**

#### Step 7C1 — Supabase runtime dependency verification, installation and staging

**Status:** Completed  
**Accepted by orchestrator:** Yes  
**Accepted:** 2026-07-24

**Toolchain:** Node **`v24.16.0`** · npm **`11.13.0`**.

**Approved stable versions, each verified as the current `latest` dist-tag with no prerelease suffix:**

| Package | Version | Section | Pin |
|---|---|---|---|
| `@supabase/ssr` | `0.12.3` | `dependencies` | exact |
| `@supabase/supabase-js` | `2.110.8` | `dependencies` | exact |
| `server-only` | `0.0.1` | `dependencies` | exact |

- [x] **`@supabase/supabase-js` requires `node >=22.0.0` and is compatible with Node 24** (`v24.16.0` satisfies it).
- [x] **`@supabase/ssr` peer requirement `^2.110.5` is satisfied by `@supabase/supabase-js` `2.110.8`** (verified with `semver -r`).
- [x] Neither `@supabase/ssr` nor `server-only` declares an engine constraint, and none of the three declares a React or Next.js peer — so **React 19.2.4 and Next.js 16.2.10 are unconstrained**.
- [x] **All three packages installed as exact runtime dependencies** — `npm install --save --save-exact …`, exit 0.
- [x] **11 packages added, 0 removed, 0 changed** — the three direct packages plus `@supabase/auth-js`, `@supabase/storage-js`, `@supabase/realtime-js`, `@supabase/functions-js`, `@supabase/postgrest-js` (all `2.110.8`), `@supabase/phoenix` `0.4.5`, `iceberg-js` `0.8.1`, and `cookie` `1.1.1`.
- [x] **No ORM or test dependency added** — prisma, drizzle, typeorm, sequelize, kysely, knex, vitest, jest, Playwright and Testing Library all absent. (`axe-core@4.12.1` is present but **pre-existing, dev-only and transitive** via `eslint-config-next → eslint-plugin-jsx-a11y`; this install added zero axe-core entries, so A-009 is not engaged.)
- [x] **Typecheck, lint and production build passed** (exit 0 each; no warnings, no errors).
- [x] **Exactly `package.json` and `package-lock.json` staged**, via explicit path-scoped `git add --`.

| Metric | Value |
|---|---|
| Modifications | **2** |
| Additions | **0** |
| Deletions | **0** |
| Insertions | **132** |
| Deleted lines | **2** |

- [x] **No source, schema or hosted operation occurred** — no client, server module, migration, seed, Auth user, generated type; local stack never started; no `supabase login`/`link`.

#### Advisory movement record (Step 7C1, 2026-07-24)

| | Pre-install | Post-install |
|---|---|---|
| **Total** | 3 | 3 |
| **Critical** | 0 | 0 |
| **High** | **3** | **3** |
| **Moderate** | **0** | **0** |
| **Low / info** | 0 | 0 |

**Affected packages, unchanged before and after:**

| Package | Severity | Status | Path |
|---|---|---|---|
| `next` | high | **direct** | root → `next` |
| `postcss` | high | transitive | root → `next` → `postcss` |
| `sharp` | high | transitive | root → `next` → `sharp` |

- [x] **No advisory is attributable to the three new direct dependencies or their new transitive packages** — none appears in any `via` chain or `effects` list; every path terminates at `next`. The install produced a **zero advisory delta**.
- [x] **The earlier 1-moderate / 2-high snapshot changed because the npm advisory database raised `postcss` to high** — a second `postcss` advisory ("Arbitrary file read and information disclosure via attacker-controlled `sourceMappingURL` in CSS comments") was published alongside the existing XSS finding. **No dependency changed**; the pre-install audit already showed 3 high against the tree exactly as committed at `329f03c`.
- [x] **No `npm audit fix` was run.**
- [x] **Findings remain unresolved** and deferred to a reviewed security/dependency checkpoint.

> Earlier audit snapshots elsewhere in this tracker (the Step 4B "two moderate" record, the Step 6B2A "1 moderate, 2 high" record dated 2026-07-23, and D-034/D-099) are **accurate historical records of their moment** and are preserved unchanged. Only current-state summaries were corrected.

#### Step 7C2 — Commit Supabase runtime dependencies

**Status:** Completed  
**Accepted by orchestrator:** Yes  
**Accepted:** 2026-07-24

| Field | Value |
|---|---|
| **Full commit** | `ffd9eef8677f9183175a66f7de00f9fef1223fab` |
| **Short commit** | `ffd9eef` |
| **Date** | `2026-07-24 14:59:58 +0800` |
| **Message** | `chore(deps): add Supabase runtime clients` |
| **Parent** | `329f03c253cc3afc356be5873c963efc2eb35e12` |
| **Summary** | `2 files changed, 132 insertions, 2 deletions` |

- [x] **Post-commit typecheck, lint and build passed** (exit 0 each; no warnings, no errors).
- [x] **npm dependency validation passed** — `npm ls --depth=0` exit 0, no missing, invalid, extraneous or peer-conflicting package.
- [x] **Repository clean.**
- [x] **Exactly eight commits** — `4de3f93` → `c7c27e5` → `a39ed21` → `0cdb782` → `a83ec7a` → `25551c5` → `329f03c` → `ffd9eef`.
- [x] **No tag, remote or push.**
- [x] **No source, schema, runtime or hosted operation occurred.**
- [x] The only `package.json` deletion was the `react-dom` line re-emitted with a trailing comma; **its version is unchanged**.

#### Step 7C3 — Recover and synchronize Supabase dependency records

**Status:** Completed  
**Accepted by orchestrator:** Yes  
**Accepted:** 2026-07-30

- [x] **The original Step 7C3 session stopped after partial workspace-tracker edits** because the Claude Code account reached its session limit; the work was resumed and completed in a later session.
- [x] **Valid partial edits were preserved** — the header, the Step 7C / 7C1 / advisory-movement / 7C2 / 7D section content, the current-state advisory corrections, and the detailed repository sub-block were all retained.
- [x] **The tracker was audited before continuation** — no duplicate section, truncated Markdown, reused decision identifier, malformed content, or repository corruption was found.
- [x] **Stale repository fields and incomplete synchronization content were repaired** — the top MVP `Latest HEAD`, commit count, and next-checkpoint fields; the current-state "Next checkpoint" pointers; the "Latest committed HEAD" line; the synchronization note; and Section 9.
- [x] **Decisions D-130 through D-139 were completed** — the Step 7C execution acceptances that the interrupted session had not yet appended.
- [x] **The workspace tracker, migration copy, `STATUS.md`, and `BUILD_NOTES.md` were synchronized correctly** — the completed tracker was copied byte-for-byte into `docs/progress/DEMO_TO_MVP_MIGRATION.md`.
- [x] **Exactly three progress files were staged** via explicit path-scoped `git add --` (`git add -A` not used).

| Metric | Value |
|---|---|
| Modifications | **3** |
| Additions | **0** |
| Deletions | **0** |
| Insertions | **310** |
| Deleted lines | **57** |

- [x] **Final synchronized tracker SHA-256:** `07431fab2a7e5b45785ec94a074cb1059dca6c10224ab0a9776a6ec8063fe9dc`.
- [x] **No data or work was lost, and the account/session interruption caused no lasting defect.**
- [x] **No package, source, runtime, schema, or hosted operation occurred during recovery.**

#### Step 7C4 — Commit Supabase dependency records

**Status:** Completed  
**Accepted by orchestrator:** Yes  
**Accepted:** 2026-07-30

| Field | Value |
|---|---|
| **Full commit** | `5d10bd050887dc9ceaf0ad9641932257c77c2936` |
| **Short commit** | `5d10bd0` |
| **Date** | `2026-07-30 02:21:39 +0800` |
| **Message** | `docs(progress): record Supabase runtime dependencies` |
| **Parent** | `ffd9eef8677f9183175a66f7de00f9fef1223fab` |
| **Summary** | `3 files changed, 310 insertions, 57 deletions` |

- [x] **Repository clean after commit.**
- [x] **Exactly nine commits** — `4de3f93` → `c7c27e5` → `a39ed21` → `0cdb782` → `a83ec7a` → `25551c5` → `329f03c` → `ffd9eef` → `5d10bd0`.
- [x] **No tag, remote or push.**
- [x] **Tracker and committed migration copy remained byte-identical before this tracker-only update** (`07431fab…3fe9dc` on both sides).
- [x] **Post-commit recovery-integrity verification passed** — no duplicate Step 7C / 7C1 / 7C2 / 7D sections, no malformed or truncated Markdown, no reused decision identifiers, and no stale current-state repository or advisory summary.
- [x] **No dependency, source, runtime, schema, or hosted operation occurred.**

**Self-reference note.** The committed progress files correctly identify the **substantive dependency commit `ffd9eef`**. Their **absence of a self-reference to administrative commit `5d10bd0` is intentional and is not a defect** — it is the required outcome of the anti-recursion rule, and no follow-up commit was or will be created to add it.

#### Step 7C sequence closure

**All of the following are Completed and Accepted:**

| Sub-checkpoint | Status |
|---|---|
| **Step 7C1** — dependency verification, installation and staging | Completed · Accepted (2026-07-24) |
| **Step 7C2** — dependency commit (`ffd9eef`) | Completed · Accepted (2026-07-24) |
| **Step 7C3** — interrupted-session recovery and record synchronization | Completed · Accepted (2026-07-30) |
| **Step 7C4** — administrative progress commit (`5d10bd0`) | Completed · Accepted (2026-07-30) |
| **Step 7C** — overall | **Completed · Accepted** |

**Accepted dependency foundation (preserved):**

- **Exact-pinned runtime dependencies:** `@supabase/ssr` `0.12.3`, `@supabase/supabase-js` `2.110.8`, `server-only` `0.0.1`; **Supabase CLI** `2.109.1`.
- **Node `v24.16.0` compatible; the `@supabase/ssr` peer requirement `^2.110.5` is satisfied by `@supabase/supabase-js` `2.110.8`.**
- **Typecheck, lint and production build passed.**
- **Current advisories: 3 high, 0 moderate, 0 critical — unresolved;** no advisory is attributable to the installed Supabase runtime packages; `npm audit fix` was not run.
- **No ORM or test dependency was installed.**
- **No clients, server modules, schema, Auth, RLS, audit chain, or application functionality has been implemented.**
- **Installing Supabase-native dependencies did not resolve the data-layer governance tension** — D-108 still gates Step 7E and Step 7J.

### Step 7D — Supabase clients, environment selection and server-only boundaries

**Status:** Completed  
**Accepted by orchestrator:** Yes  
**Authorized:** Yes  
**Authorized date:** 2026-07-30  
**Accepted:** 2026-07-30

- [x] **Explicit local-versus-hosted target classification implemented** — a single `NEXT_PUBLIC_SUPABASE_URL` selector; the application never holds simultaneous local and hosted credential sets.
- [x] **All six approved environment-variable names validated.**
- [x] **Browser-safe client boundary implemented.**
- [x] **Request-scoped authenticated server-client boundary implemented.**
- [x] **Separate server-only elevated client boundary implemented.**
- [x] **`server-only` imports applied at every required boundary; objective negative server-only proof passed.**
- [x] **Client-bundle private-name isolation passed.**
- [x] **Typecheck, lint and production build passed.**
- [x] **Implementation commit `455a070` accepted.**
- [x] **No query, Auth flow, hosted connection, schema, RLS, audit chain, or domain functionality was implemented** — Phase 0 remains `In progress`.

**Prohibitions honored:** no ORM; no migration or database schema; no Auth users; no RLS policy; no audit-chain code; no hosted link; no Phase 1–4 functionality; no reading or copying of hosted credentials from `.env.local`.

> **The data-layer governance issue (D-108) still gates Steps 7E and 7J — not Step 7D.** Step 7D created client boundaries only and did not commit the project to a data-access abstraction.

#### Step 7D1 — Implement and stage Supabase environment and client boundaries

**Status:** Completed  
**Accepted by orchestrator:** Yes  
**Accepted:** 2026-07-30

**Five permanent files and their roles:**

1. **`lib/supabase/public-config.ts`** — client-safe public configuration; validates only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; classifies local versus hosted (local hosts `localhost`, `127.0.0.1`, and IPv6 loopback `::1`; local port restricted to `54321`; hosted restricted to HTTPS and `*.supabase.co`); supports current opaque (`sb_publishable_`) and legacy JWT publishable-key families; rejects a secret-key prefix; does not decode JWTs or expose values.
2. **`lib/supabase/browser.ts`** — browser-safe `createBrowserClient` boundary; publishable key only; module-level browser singleton; no server import, private variable name, Auth call, or query.
3. **`server/platform/env.ts`** — first executable import is `import "server-only";`; validates exactly the six approved environment names; reuses the public local/hosted classification; validates key families, key non-reuse, the accepted LLM provider (`openai`) and model (`gpt-5.6-terra`), and a nonblank LLM API key; returns an immutable typed configuration; logs and exposes no values.
4. **`server/platform/supabase/request.ts`** — first executable import is `import "server-only";`; async request-scoped `createServerClient` factory; `await cookies()`; a fresh client per invocation; publishable key only; `getAll`/`setAll` cookie adapter (name, value, and options preserved); no global client, Authorization override, Auth call, or query.
5. **`server/platform/supabase/elevated.ts`** — first executable import is `import "server-only";`; elevated client uses the secret key only; no request cookie or user JWT; `persistSession: false`, `autoRefreshToken: false`, `detectSessionInUrl: false`; a warning states it bypasses RLS and requires prior server-side authorization; no query or administrative action.

**Design notes:**

- Installed package APIs were checked before implementation.
- Next.js `cookies()` is **asynchronous** in the installed version.
- The SSR `getAll`/`setAll` cookie adapter is supported.
- The browser, request-scoped, and elevated clients have **distinct security boundaries**.
- Structural validation **cannot** prove that opaque credentials belong to the selected project without a later runtime connection/identity proof.
- The request-client cookie-write `setAll` uses a narrow `try/catch` limited to the documented Next.js Server-Component write restriction; full session-refresh/proxy behaviour is deferred to the later Auth checkpoint (no `proxy.ts`/`middleware.ts`).

**Validation evidence.**

- **Environment probe.** The originally proposed `app/__step7d_env_probe` path was identified as a **Next.js private folder** (leading underscore ⇒ excluded from routing) and therefore did **not** become a route; the first build correctly demonstrated the validators had not executed through that path. A temporary **routable** path `app/step7d-env-probe/page.tsx` was used instead; the production build included the temporary route, and public and server configuration validation executed successfully using opaque environment inputs. No value was rendered, logged, inspected, or reported. The temporary route was deleted and not staged. **This deviation was necessary to make the proof valid and did not weaken scope or security.**
- **Negative server-only proof.** A temporary Client Component imported the elevated factory; the production build failed with **exit code 1 specifically because a `server-only` module was imported into a Client Component** — not a syntax, path, dependency, lint, or unrelated TypeScript error. The temporary route was deleted and not staged. The negative build failure counted as a **successful** boundary proof.
- **Automated baseline.** `npx tsc --noEmit` passed; `npm run lint` passed; `npm run build` passed — zero warnings, zero errors. The ignored `.next` cache was removed only to clear a stale generated reference to the deleted probe; no tracked or repository-visible file was affected.
- **Client-bundle isolation.** Private variable-name occurrences in `.next/static`: `SUPABASE_SECRET_KEY` 0, `LLM_PROVIDER` 0, `LLM_MODEL` 0, `LLM_API_KEY` 0. No `server/platform` module appeared in the client output or inspected client manifests; the elevated factory was unreachable from browser code; no value was searched or printed.
- **Staged set.** Exactly **5 additions, 0 modifications, 0 deletions, 363 insertions**; no temporary probe; no package, environment, Supabase configuration, governance, progress, app-route, public, or demo file staged.

#### Step 7D2 — Commit Supabase environment and client boundaries

**Status:** Completed  
**Accepted by orchestrator:** Yes  
**Accepted:** 2026-07-30

| Field | Value |
|---|---|
| **Full commit** | `455a0706b5555c0b4f083327dfd5613d3aa23245` |
| **Short commit** | `455a070` |
| **Date** | `2026-07-30 09:19:03 +0800` |
| **Message** | `feat(platform): add Supabase client boundaries` |
| **Parent** | `5d10bd050887dc9ceaf0ad9641932257c77c2936` |
| **Summary** | `5 files changed, 363 insertions, 0 deletions` |

- [x] **Exactly the five approved files were committed.**
- [x] **Post-commit typecheck, lint and production build passed.**
- [x] **Client-bundle isolation passed** (0 private-name occurrences in `.next/static`).
- [x] **Repository clean; exactly ten commits.**
- [x] **No tag, remote or push.**
- [x] **No dependency, schema, Auth, runtime, hosted, or application operation occurred.**

#### Step 7D3 — Synchronize and stage Supabase client-boundary records

**Status:** Completed  
**Accepted by orchestrator:** Yes  
**Accepted:** 2026-07-30

- [x] **Workspace tracker synchronized byte-for-byte into `docs/progress/DEMO_TO_MVP_MIGRATION.md`.**
- [x] **`STATUS.md` and `BUILD_NOTES.md` updated** — current-state fields, Phase 0 progress, follow-ups, and chronological Step 7D1 / Step 7D2 / Step 7D-closure entries.
- [x] **Exactly three progress files staged** — staged composition: **3 modifications, 0 additions, 0 deletions; 302 insertions, 63 deletions**.
- [x] **Tracker and migration-copy hashes matched** (byte-identical; `cmp` clean).
- [x] **Step 7D1 and Step 7D2 records were synchronized.**
- [x] **Step 7D closure, the Step 7E block, and the Step 7E0 planning checkpoint were recorded.**
- [x] **No implementation, dependency, runtime, schema, governance, or hosted operation occurred.**

**`/compact` recovery.** During Step 7D3 an accidental `/compact` interrupted execution:

- `/compact` changed **conversation context only**;
- it did **not** mutate files, Git staging, commits, or runtime state;
- execution stopped cleanly **after Section 9 and before Section 10**;
- the existing synchronization work was verified before resuming (tracker and migration copy byte-identical; HEAD, staging, and hashes intact);
- **no work was lost**;
- no duplicate, malformed, truncated, or inconsistent content remained;
- the interruption caused **no lasting issue**.

#### Step 7D4 — Commit Supabase client-boundary records

**Status:** Completed  
**Accepted by orchestrator:** Yes  
**Accepted:** 2026-07-30

| Field | Value |
|---|---|
| **Full commit** | `e07b2138c9b670ebd3feda41c89782056cb8a6d5` |
| **Short commit** | `e07b213` |
| **Date** | `2026-07-30 10:20:13 +0800` |
| **Message** | `docs(progress): record Supabase client boundaries` |
| **Parent** | `455a0706b5555c0b4f083327dfd5613d3aa23245` |
| **Summary** | `3 files changed, 302 insertions, 63 deletions` |

- [x] **Repository clean after commit; exactly eleven commits.**
- [x] **No tag, remote, or push.**
- [x] **Tracker and committed migration copy remained byte-identical before this tracker-only update.**
- [x] **Compact-recovery integrity verification passed.**
- [x] **No dependency, implementation, runtime, schema, governance, or hosted operation occurred.**

> The committed progress files correctly identify **substantive implementation commit `455a070`**. Their lack of self-reference to **administrative commit `e07b213`** is **intentional and not a defect** (anti-recursion rule, D-060 … D-066, D-101, D-121, D-145, D-169).

#### Step 7D sequence closure

**All of the following are Completed and Accepted (2026-07-30):**

| Sub-checkpoint | Status |
|---|---|
| **Step 7D1** — implement and stage environment/client boundaries | Completed · Accepted |
| **Step 7D2** — implementation commit (`455a070`) | Completed · Accepted |
| **Step 7D3** — record synchronization and staging | Completed · Accepted |
| **Step 7D4** — administrative progress commit (`e07b213`) | Completed · Accepted |
| **Step 7D** — overall | **Completed · Accepted** |

**The complete Step 7D sequence is closed and accepted (2026-07-30)** and the Supabase environment/client-boundary foundation is accepted. Preserved implementation state: `lib/supabase/public-config.ts`, `lib/supabase/browser.ts`, `server/platform/env.ts`, `server/platform/supabase/request.ts`, and `server/platform/supabase/elevated.ts` implemented; explicit local-versus-hosted target classification; six approved environment names validated; browser client publishable-only; request client request-scoped and publishable-key; elevated client server-only, session-free, secret-key; negative `server-only` proof, client-bundle private-name isolation, and IPv6 loopback (`::1`) handling all passed; typecheck, lint, and production build passed; implementation commit `455a070` and administrative progress commit `e07b213` accepted; structural credential validation does **not** prove hosted-project ownership; no Auth flow, query, schema, RLS, audit chain, hosted connection, or domain functionality exists. **The workflow is paused by the orchestrator before Step 7E0** (see the checkpoint header and Section 9).

### Step 7E0 — Final MVP scope and schema-preflight governance reconciliation

**Status:** **Completed**  
**Accepted by orchestrator:** **Yes**  
**Authorized:** Yes  
**Authorized date:** 2026-07-30  
**Accepted:** 2026-07-30  
**Commit:** **`722dcb868435e83fbeb3963cc2548d0745436406`** (short `722dcb8`)  
**Position:** immediately **after** the complete accepted Step 7D sequence and immediately **before** Step 7E

> **The documentation reconciliation was reviewed and accepted by the orchestrator on 2026-07-30.** The **acceptance-record commit remains pending** because the Step 7E0C checkpoint that writes this record stops before commit. **Step 7D remains completed and fully accepted, and no previously accepted history has been rewritten.**

#### Step 7E0A — Governance reconciliation change set (staged)

**Status:** Completed  
**Accepted by orchestrator:** Yes  
**Accepted:** 2026-07-30

The seven-file documentation change set was authored, verified and staged. Its full scope, verification evidence and unresolved-item register are recorded in this Step 7E0 section.

#### Step 7E0B — Commit the staged final-MVP governance reconciliation

**Status:** Completed  
**Accepted by orchestrator:** Yes  
**Accepted:** 2026-07-30

| Field | Value |
|---|---|
| **Full commit** | `722dcb868435e83fbeb3963cc2548d0745436406` |
| **Short commit** | `722dcb8` |
| **Date** | `2026-07-30 12:39:49 +0800` |
| **Message** | `docs(governance): ratify final single-centre three-flow MVP` |
| **Parent** | `e07b2138c9b670ebd3feda41c89782056cb8a6d5` |
| **Summary** | `7 files changed, 1383 insertions, 123 deletions` |
| **Composition** | **2 files created · 5 files modified · 0 deleted · 0 renamed** |
| **Resulting commit count** | **12** |

**Committed files (exactly seven):**

| Path | Change |
|---|---|
| `CLAUDE.md` | Modified |
| `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_002.md` | **Created** |
| `docs/plan/BEST_Coach_Implementation_Plan.md` | Modified |
| `docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md` | **Created** |
| `docs/progress/STATUS.md` | Modified |
| `docs/progress/BUILD_NOTES.md` | Modified |
| `docs/progress/DEMO_TO_MVP_MIGRATION.md` | Modified |

- [x] **Message is a single subject line with an empty body** — verified byte-exact; no trailer added.
- [x] **Exactly one commit created** — no amend, reset, or rebase; reflog shows `722dcb8` directly over `e07b213`.
- [x] **Repository clean after commit**; index empty; **no tag, no remote, nothing pushed**.
- [x] **`git diff --cached --check` before commit** reported **13 notices, all `trailing whitespace`, all in `docs/progress/DEMO_TO_MVP_MIGRATION.md`** — the intentional two-space Markdown hard line breaks inherited verbatim from this tracker; **zero notices in the other six files**.
- [x] **Specification v3, Amendment 001 and every `governance-source/` file were untouched by the commit** and remain byte-for-byte unchanged.
- [x] **Frozen demo unchanged and clean** at `8d4acf4abc5039c24da01be773ab1a5e4916080f`, annotated tag intact, no remote.
- [x] **No application, package, dependency, configuration, migration, schema, environment, Auth, seed, test, or Figma asset file** was committed.
- [x] **No application or runtime operation occurred** — no typecheck, lint, build, test, dev server, Supabase start, Docker start, hosted link/login/query, Auth user, seed, or Figma import/export. **`.env.local` was never accessed.**

**Ratified content carried by commit `722dcb8`:**

- **Amendment 002 A-014 through A-024** (each defined exactly once), with a precise supersession table.
- **Exactly three completed MVP flows: Management, Trainer and Parent.**
- **One-centre-only MVP operation**, with a **real `centres` entity and centre-scoped relationships retained** so multi-centre support stays additive.
- **One named management account** — never shared credentials.
- **Canonical hierarchy: Centre → Class Grade → Class Module → Class Session.**
- **Class Grade values: Beginner, Intermediate and Advanced** — the only values in the MVP.
- **Mandatory nine-dimension assessment.**
- **Removal of Quick mode**, and of every four-dimension-only completion path and fallback.
- **Present-by-default attendance with a trainer-controlled `Absent` toggle**, unique per student + class session, auditable, never producing a fabricated report for an absent student.
- **Management creation, invitation, enrolment and assignment scope** — server-side, centre-scoped, validated, authorized and auditable; management **never edits feedback-report content**.
- **One shared canonical report format** — one read model, one presentation architecture.
- **Trainer edit access** within the governed report workflow.
- **Management and parent view-only access**, enforced server-side, not by hiding an Edit button.
- **Figma Design 2 as the final visual and interaction authority** — and explicitly **not** authoritative for schema, RLS, authorization, report lifecycle, audit, Auth, persistence, state machines, or transaction boundaries.
- **Mandatory Figma implementation-readiness handoff** before the first Figma-based UI implementation checkpoint.
- **Supabase-native data access.**
- **No general-purpose ORM.**
- **TA-flow deferral while preserving Amendment 001 evidence safeguards** (A-001, A-003, A-004 remain active in full).

**Scope executed (documentation only):**

- [x] **Step 7D remains historically unchanged and accepted** — Step 7D1, Step 7D2, Step 7D3, Step 7D4 and Step 7D overall are untouched. The product decisions ratified here **do not invalidate the accepted Step 7D client-boundary work**; Step 7D created client boundaries only and committed the project to no domain shape.
- [x] **This checkpoint changes documentation only** — no application code, database schema, SQL migration, dependency, Supabase operation, Auth user, seed data, UI component, route, server action, test, or Figma asset.
- [x] **Step 7E schema migration is blocked** until Amendment 002 and the aligned active documents are **reviewed, committed and accepted**.
- [x] **The MVP contains exactly three completed flows: Management, Trainer and Parent** (Amendment 002 A-014).
- [x] **The MVP operates for one centre only** (A-015) — exactly one synthetic/seeded centre, no centre-selection UI, no centre-management UI, **one named management account** (never shared credentials), and a **real `centres` entity with real relationships** so multi-centre support stays additive.
- [x] **The canonical hierarchy is Centre → Class Grade → Class Module → Class Session** (A-016) — Class Grade values are exactly **Beginner, Intermediate, Advanced**; "Class Grade" replaces "Academic Level" as the active term; the "Create Class" action persists a **Class Module** under a selected Class Grade with **no hidden intermediate `classes` entity**.
- [x] **All assessments require all nine dimensions** (A-017) — Quick mode removed completely; no four-dimension-only completion path; no four-dimension fallback; dimensions, ratings, rubric anchors, grounding validation, trainer accountability and governed AI review all retained unchanged.
- [x] **Attendance defaults to `Present` and can be toggled to `Absent`** (A-018) — persisted per student + class session, conceptually unique, never producing a fabricated assessment or report for an absent student, and **auditable**.
- [x] **Management can create profiles, invitations, class modules, class sessions, enrolments and assignments** (A-019) — every such write **server-side, centre-scoped, validated, authorized and auditable**; management **never** edits feedback-report content.
- [x] **Trainer assignments drive trainer-calendar visibility** (A-019) — the **same stored class-session record** appears in the assigned trainer's calendar; **no separate trainer-calendar copy**; only assigned sessions are reachable through the trainer flow.
- [x] **One canonical report format is shared across all roles** (A-021) — one shared submitted-report read model and one reusable presentation architecture.
- [x] **Trainer can edit; management and parent are view only** (A-021) — enforced **server-side**; hiding an Edit button is not authorization; trainer edits use the governed editable version, never mutate a submitted approval snapshot in place, reset the quality checklist, and require review and approval again; AI never publishes directly.
- [x] **Figma Design 2 is the final visual and interaction authority** (A-022) — and is explicitly **not** authoritative for schema, foreign keys, RLS, server authorization, report lifecycle, audit, Auth, AI governance, persistence, state-machine rules, or transaction boundaries.
- [x] **Figma porting requires a later implementation-readiness handoff** (A-022.1 … A-022.3) — recorded below as a durable future checkpoint requirement.
- [x] **Supabase-native / no general-purpose ORM is ratified** (A-023) — this resolves the D-108 data-layer governance tension at spec-amendment precedence.
- [x] **TA is not a required completed MVP flow** (A-014, A-024) — TA screens, TA login and TA-specific UAT are deferred and are not MVP completion gates. **Amendment 001's evidence-security safeguards are neither deleted nor weakened.**
- [x] **No schema or application implementation is authorized by this checkpoint.**

**Documents created:**

| Path | Purpose |
|---|---|
| `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_002.md` | Ratified Amendment 002 — **A-014 … A-024** with a precise supersession table |
| `docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md` | Per-screen implementation matrix + the **"Orchestrator Figma Porting Actions"** checklist |

**Documents modified:** `CLAUDE.md`, `docs/plan/BEST_Coach_Implementation_Plan.md`, `docs/progress/STATUS.md`, `docs/progress/BUILD_NOTES.md`, `docs/progress/DEMO_TO_MVP_MIGRATION.md`, and this workspace tracker.

**Documents deliberately NOT modified:** `docs/spec/BEST_Coach_Complete_MVP_Specification_v3.md` (byte-for-byte unchanged), `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_001.md` (byte-for-byte unchanged), every file in `governance-source/`, and the entire frozen demo repository.

**Durable future checkpoint requirement — Figma Design 2 implementation handoff.**

A **mandatory Figma Design 2 implementation-readiness gate** exists before the first Figma-based UI implementation checkpoint. For each approved screen the orchestrator must provide or verify: a node-specific `/design/` link where possible; the authoritative screen name; the applicable user flow; the intended route; responsive variants; component and interaction states; **loading, empty, validation, error, success and disabled** states; design variables or an approved token inventory; typography, colours, spacing, radii and shadows; approved logos, SVGs, icons and image assets; prototype transitions and interaction notes not evident from a static frame; and any discrepancy between Figma and a ratified governance or domain rule. **Blind porting** of generated React, Figma mock data, prototype-only navigation, fake authentication, hard-coded identities, duplicated calendar records, client-side authorization assumptions, frame-inferred schema or business logic, Edit-button-inferred permissions, conflicting generated CSS, or Supabase/RLS/validation bypasses is **prohibited**. Missing frames, assets, states or field definitions require implementation to **stop and request orchestrator input — never guess**. **This handoff does not block Step 7E unless an unresolved visible field changes the domain relationship model; it does block the corresponding UI implementation checkpoint.**

**Unresolved items recorded at Step 7E0 — classified by blocking point. None was fabricated or silently resolved.**

**(1) Schema-critical — blocks Step 7E:**

| # | Unresolved item | Required orchestrator input |
|---|---|---|
| 1 | `public` profile table's physical relationship to `auth.users` | Ratify 1:1 keyed profile vs alternative |
| 2 | Audit **target representation** — typed FK vs polymorphic `target_type`/`target_id` | Ratify the representation (also relevant at Step 7H) |
| 3 | **Report-status storage representation** — display names vs normalized enum spelling | Ratify the stored vocabulary |
| 4 | Deliberate **`GRANT` strategy** for newly created tables | Ratify the grant policy; a missing grant must not be misdiagnosed as an RLS failure |
| 5 | **Enum versus reference table** at schema level, including **Class Grade** and report status | Ratify per closed vocabulary |
| 6 | **Invitation token and expiry** implementation details, and storage of `pending`/`accepted`/`expired`/`revoked` | Ratify the token, expiry and state storage design |
| 7 | **First-migration table and enum scope** | Ratify exactly which tables and enums the first migration creates |

**(2) Report / UI — blocks only its own later implementation checkpoint:**

| # | Unresolved item | Escalation rule |
|---|---|---|
| 8 | Exact individual **Figma Design 2 frame/node links** | Blocks the affected UI checkpoint only |
| 9 | Exact **field inventory for Create Class** (Class Module details) | Escalates to a **Step 7E blocker only if** a missing field changes the domain relationship model |
| 10 | Exact fields for **trainer-profile** creation | Same escalation rule |
| 11 | Exact fields for **student-profile** creation | Same escalation rule |
| 12 | Exact fields for **parent-profile** creation | Same escalation rule |
| 13 | Exact **report sections and field schema** from the canonical report frame | Blocks the report UI/projection checkpoint |
| 14 | **Responsive variants** not yet supplied | Blocks the affected UI checkpoint |

**(3) Figma assets — do not block schema work at all:**

| # | Unresolved item |
|---|---|
| 15 | **Figma tokens and approved asset exports** — typography, colours, spacing, radii, shadows, original logos, SVG icons, approved images |

**(4) Evidence — blocks only evidence implementation unless it alters core schema:**

| # | Unresolved item | Note |
|---|---|---|
| 16 | Whether **evidence media remains a completion requirement** | Amendment 001 A-001/A-003/A-004 apply in full if it does |
| 17 | **Who uploads evidence** if evidence remains | **No replacement actor may be invented**; TA upload permissions must not be silently transferred to management or trainer |
| 18 | Exact **evidence-related Figma screens** if retained | Blocks evidence UI only |

**(5) Audit-design — blocks the audit-chain checkpoint (Step 7H), not the first migration:**

| # | Unresolved item |
|---|---|
| 19 | **Audit-chain scope** — one global chain vs one chain per target/tenant |
| 20 | **SHA-256 ratification** for the audit hash (Specification v3 §23 names no algorithm) |
| 21 | **Audit-chain genesis rule** — sentinel vs zero-hash for the first entry |

**Verification performed at Step 7E0:**

- Specification v3 **byte-for-byte unchanged** (`64d54aa2f0b3200b540b50cebfb5a614e7d644e895effcf5428bd96ae60852a2`).
- Amendment 001 **byte-for-byte unchanged** (`25ede394eb4894981d140f6e330450b6e516f056b576b2e14c9afe10434de9b5`).
- Every `governance-source/` file **unchanged**.
- Frozen demo **unchanged and clean** at `8d4acf4abc5039c24da01be773ab1a5e4916080f`, annotated tag `demo-freeze-step14-2026-07-21` intact, no remote.
- **No application, package, dependency, migration, environment, Supabase-configuration or schema file changed.**
- Workspace tracker and `docs/progress/DEMO_TO_MVP_MIGRATION.md` **byte-identical** after synchronization — this **reconciles the previously permitted one-update administrative lead** recorded at Step 7D5 (D-169).
- Amendment 002 defines **A-014 through A-024 exactly once each**.
- The Figma matrix contains the **"Orchestrator Figma Porting Actions"** section; `STATUS.md` contains the pending **"Figma Design 2 implementation handoff"** item; the Implementation Plan contains the **mandatory Figma implementation-readiness gate** (Gate G2) and the **governance and schema-preflight gate** (Gate G1).
- **Stale-requirement scan** run across the active governance and plan documents for Quick mode, four-dimension-only completion, direct Centre → Class, "Academic Level" as the active term, Stitch as the current final UI source, Prisma/Drizzle/ORM as the selected data layer, TA as a required completed MVP flow or final UAT persona, multi-centre MVP administration, HQ/super-admin MVP functionality, separate role-specific report formats, and management or parent report editing — **every remaining match classified as historical or explicitly superseded; none active**.
- `git diff --check` clean apart from the intentional two-space Markdown hard line breaks inherited verbatim from this tracker.
- **`.env.local` was never opened, printed, hashed, copied, parsed or inspected.**
- **Exactly seven in-repository files staged**; no other staged, unstaged, or untracked repository-visible change; **no commit, tag, remote or push**.

### Step 7E0D — Schema-critical decision ratification

**Status:** **Completed**  
**Accepted by orchestrator:** **Yes**  
**Acceptance date:** **2026-08-03**  
**Authorized:** **Yes**  
**Authorization date:** 2026-07-30  
**Substantive commit:** **`b367475c180a2e4f4cf70ff1385f34b253356c33`** (short `b367475`)  
**Nature:** **Documentation and architecture-decision work only.** **No SQL migration or application implementation was authorized, and none occurred.**

**Purpose.** Resolve the seven schema-critical blockers that prevented Step 7E. **Step 7E may be authorized only after Step 7E0D is completed, committed, recorded and accepted — and then only by a separate explicit orchestrator authorization, which has not been given.**

**Outcome (2026-08-03).** All seven blockers below are **resolved** and ratified at spec-amendment precedence as **Specification v3 Amendment 003, clauses A-025 … A-032**. The accepted architecture is the integrated set of **Decisions A – G together with every binding correction issued during their review**. **Completing Step 7E0D did not authorize Step 7E.**

**Accepted architecture — Decisions A – G as corrected:**

| Decision | Accepted outcome | Amendment 003 clause |
|---|---|---|
| **A — Identity and roles** | Centre-independent `accounts` (application-owned UUID; **nullable unique `auth_user_id`**; lifecycle `active`/`deactivated` only; **no `centre_id`, no `role`**); `centre_memberships` is the **sole role authority** (`management`/`trainer`/`parent`; **TA excluded**) with lifecycle `pending`/`active`/`deactivated`; **students have no Auth relationship**; role changes **deactivate and re-create** a membership; role/profile agreement by **composite key + composite FK, not a cross-table `CHECK`**; **one active membership per (account, centre)** and **at most one active `management` membership per centre**, via partial unique indexes restricted to active rows | A-025 |
| **B — Controlled vocabularies** | Enums for **closed, security/workflow-bearing, non-runtime-editable** vocabularies; tables where **FK identity, ordering or labels** are needed; **hybrid** for **centre-owned Class Grades** (`beginner`/`intermediate`/`advanced`) and the **global** nine-dimension reference data; ratings `emerging`/`developing`/`secure`/`advanced`; attendance `present`/`absent`; **no Quick 4 representation**; **session-lifecycle and audit vocabularies deferred — values not ratified** | A-026 |
| **C — Invitations** | **Supabase Auth owns all authentication secrets**; **no raw token, OTP, password, access token, refresh token or secret hash in any application table** — enforced by the **absence of any such column**; invitations target a **`pending` centre membership**; **immutable normalized email**; **stored status plus `expires_at`, effective expiry evaluated transactionally**; states `pending`/`accepted`/`expired`/`revoked`; **revoke or supersede before reissue**; **existing accounts reused for later-centre invitations**; **Auth-link expiry and application-invitation expiry are separate**; **management bootstrap separately governed**; **invitation duration remains operationally unresolved and does not block schema design** | A-027 |
| **D — Reports** | One aggregate per Class Session + student, **valid module enrolment required**, owning the single current-cycle status plus `current_cycle_version_id` and `latest_submitted_version_id`; **seven authorized statuses** (`incomplete`, `observation_saved`, `drafting`, `draft_ready`, `needs_edit`, `approved`, `submitted`); **approval — not submission — freezes** the exact version and its canonical children; **immutable version-scoped checklist and approval evidence**; **exactly nine immutable rating snapshots** per approved/submitted version; later edits **clone into a new version**; **submitted versions never reopen**; the **previous submitted version stays canonical during correction**; **no report for an absent student**; **mid-cycle absence retains work but blocks progression**; **submitted attendance cannot change to Absent**; Management and Parent **read only the same latest submitted canonical report** and **never edit** | A-028 |
| **E — Audit compatibility** | Stable **account and membership attribution**; **durable actor FKs where records are retained** (`RESTRICT`) — **not a blanket no-FK rule**; **polymorphic target IDs with immutable minimal snapshots**; **one event per governed action plus related-target child rows** (not a JSONB blob); generic `state_domain`/`state_from`/`state_to`; **append-only correction-by-new-event with no redaction**; **data minimization**; **complete audit objects and hash-chain mechanics remain Step 7H** | A-029 |
| **F — Privileges and access** | **Deny-by-default**; RLS **enabled on every Step 7E table immediately** with **zero policies**; **no client SELECT, DML or RPC EXECUTE in Step 7E**; **policy and minimum matching grant ship together in Step 7G**; **no governed direct client DML**; governed mutations use **reviewed, constrained `SECURITY DEFINER` RPCs**; **an authenticated SSR client is still the `authenticated` database role** — the **database role follows the credential, not the code location**; canonical latest-submitted reports use a **reviewed read RPC**, not raw internal-table access; service-role client remains **server-only** and limited to concrete Auth-admin/system operations; **no management, trainer or parent audit-read capability in the MVP**; **migration-owner `SECURITY DEFINER` ownership accepted as the MVP default with restricted `NOLOGIN` ownership retained as deferred hardening** | A-030 |
| **G — Exact Step 7E boundary** | **Exactly 10 enums, 22 tables and 13 deterministic seed rows**, with all constraints and indexes; **seed UUIDs fixed across environments**, and **mismatched pre-existing reference data must fail verification rather than be silently accepted**; explicit exclusions assigned to their owning checkpoints | A-031, A-032 |

**Accepted centre seed identity:** code **`ispeak`** · display name **`iSpeak Academy`**.

**Accepted Step 7E inventory — exactly 10 enums:** `centre_membership_role` · `account_status` · `centre_membership_status` · `class_grade_code` · `dimension_code` · `dimension_group` · `competency_rating` · `attendance_status` · `invitation_status` · `report_status`.

**Accepted Step 7E inventory — exactly 22 tables:** `centres` · `accounts` · `centre_memberships` · `trainer_profiles` · `parent_profiles` · `students` · `parent_student_links` · `class_grades` · `class_modules` · `class_sessions` · `enrolments` · `class_session_assignments` · `attendance` · `invitations` · `assessment_dimensions` · `observations` · `observation_ratings` · `reports` · `report_versions` · `report_version_ratings` · `report_version_checklist_progress` · `report_version_approvals`.

**Accepted Step 7E inventory — exactly 13 deterministic seed rows:** **1 centre** (`ispeak` / `iSpeak Academy`) · **3 centre-owned Class Grades** (`beginner`/Beginner/1, `intermediate`/Intermediate/2, `advanced`/Advanced/3) · **9 global assessment dimensions** (Body, Emotion, Speech, Tonality = `competency` 1–4; Eye Contact, Vocal Projection, Emotional Expression, Sentence Flow, Audience Awareness = `speech_linguistics` 5–9).

**Excluded from Step 7E, with owning checkpoints:** RLS policies and client grants → **Step 7G** · synthetic Auth users and domain fixtures → **Step 7F** · audit objects and hash chain → **Step 7H** · read/mutation RPCs and server-action proof → **Step 7I** · committed generated database types → **Step 7J** · AI schema → later AI work · evidence schema → later evidence work · session-lifecycle enum → deferred · private helper schema → only when a helper is authorized · **views, RPCs and helper functions → absent from Step 7E entirely** · UI and Figma implementation → later UI checkpoints. **No placeholder or dangling columns; no extension.**

#### Step 7E0D1 — Read-only schema-critical architecture analysis

**Status:** **Completed**  
**Accepted by orchestrator:** **Yes (2026-08-03)**  
**Nature:** **Read-only analysis.** **No file, SQL, schema, Auth, runtime or repository change of any kind occurred.**

Decisions A – G were analysed individually and corrected across multiple binding orchestrator correction rounds (Decisions A, B, D, E and F), followed by a final integrated architecture review confirming cross-decision consistency. The analysis produced **no commit, no staged change, and no working-tree modification**; the repository remained at HEAD `6551d37` with a clean tree and empty index throughout. **The analysis ratified nothing by itself** — ratification occurred only at Step 7E0D2A/B.

#### Step 7E0D2A — Schema-critical architecture ratification change set (staged)

**Status:** **Completed · Accepted**  
**Nature:** **Documentation and governance work only.**

Created `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_003.md` (**A-025 … A-032**, ratification date 2026-08-03) and reconciled `CLAUDE.md` (§1 precedence and source table, ADR-3 narrowed, ADR-7 renamed, §6 identity/invitation/attendance/state-machine/checklist/visibility bullets, **new §6.1**, §9, §10 Phase 0, §12) and `docs/plan/BEST_Coach_Implementation_Plan.md` (Amendment 003 reconciliation block, **G1a** new item, **G1b replaced with the resolved decisions**, **G1c** updated, **new G1d** checkpoint decomposition, new authorization rule, Step 7E0D record, Phase 0 steps 1/4/5/7 and exit condition bounded, two verification-register items corrected). Exactly three files were staged with path-scoped staging. Specification v3, Amendment 001, Amendment 002, the Figma matrix, all three progress files, the workspace tracker, `governance-source/`, package files and all application/runtime/Supabase files were **verified unchanged**. **`.env.local` was not accessed.**

#### Step 7E0D2B — Commit the staged schema-critical architecture ratification

**Status:** **Completed · Accepted**  
**Commit:** **`b367475c180a2e4f4cf70ff1385f34b253356c33`** (short `b367475`)  
**Message:** `docs(governance): ratify schema-critical MVP architecture` — one subject line only, no body, no trailer  
**Parent:** `6551d37253e562a40d51e521b93c261daf7efdc9`  
**Date:** 2026-08-03 02:44:20 +0800  
**Change summary:** **3 files changed, 479 insertions(+), 37 deletions(-)** — 1 created, 2 modified, 0 deleted, 0 renamed  
**Resulting commit count:** **14**

Files: `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_003.md` (created, 374 lines) · `CLAUDE.md` (modified) · `docs/plan/BEST_Coach_Implementation_Plan.md` (modified). `git diff --cached --check` exited **0**. No tag, remote, upstream, push, amend, rebase or reset. The frozen demo remained unchanged and clean; the workspace tracker and committed migration copy remained unchanged and byte-identical; **no progress record was modified by this commit**.

**The seven schema-critical blockers, as originally recorded (all now resolved):**

1. **Application profile ↔ `auth.users` key relationship** — the physical key design binding the public application profile to the Supabase Auth identity.
2. **Table/reference strategy for roles and Class Grades** — enum versus reference table for each closed vocabulary, including the three Class Grade values (`Beginner`, `Intermediate`, `Advanced`).
3. **Invitation lifecycle persistence** — how `pending` / `accepted` / `expired` / `revoked` states, tokens and expiry are stored.
4. **Report lifecycle/status representation** — the stored vocabulary for report status.
5. **Audit target representation** — typed foreign key versus polymorphic `target_type` / `target_id`.
6. **Initial `GRANT` policy** — the deliberate grant strategy for newly created `public` entities.
7. **Exact first-migration boundary** — the precise tables, enums, constraints and functions the first migration creates.

**Resolution mapping (2026-08-03).** Item 1 → **A-025** · item 2 → **A-026** · item 3 → **A-027** · item 4 → **A-028** · item 5 → **A-029** · item 6 → **A-030** · item 7 → **A-031** and **A-032**. Every item was resolved by an explicit orchestrator-ratified clause; **none was defaulted, narrowed silently, or "decided in the migration."**

**Explicitly out of scope for Step 7E0D:** writing SQL; creating a migration, seed, Auth user, RLS policy or audit chain; application code; dependency changes; starting Supabase or Docker; hosted linking; and any Figma import or export. **All of these remained out of scope throughout, and none occurred.**

**Not decided in Step 7E0C.** None of the seven items above was resolved, narrowed, or silently decided while recording the Step 7E0 acceptance. They were resolved only at Step 7E0D, at spec-amendment precedence.

**Still not decided at Step 7E0D — carried forward, not fabricated:** invitation duration (an operational default, not a schema shape); the session-lifecycle vocabulary; the restricted `NOLOGIN` `SECURITY DEFINER` function owner (deferred hardening); the management bootstrap mechanism; management/trainer/parent audit-read capability; **and the entire audit-chain design — chain scope, canonical serialization, hash application, previous-hash rules, genesis, and verification/repair — which remains Step 7H work.** Evidence scope, the evidence uploader, and the Figma implementation handoff also remain **unresolved and pending**.

### Step 7E — First governed SQL migration and database foundation

**Status:** **Completed**  
**Accepted by orchestrator:** **Yes**  
**Acceptance date:** **2026-08-03**  
**Authorized:** **Yes** — bounded orchestrator authorization covering **Step 7E only**  
**Started:** **Yes**  
**Substantive commit:** **`252ef9b13008629cadc238bdf58b7016c50bb7b2`** (short `252ef9b`)  
**Migration:** `supabase/migrations/20260803034500_step_7e_governed_core.sql` · version **`20260803034500`**

**Prior blockers, both cleared before authorization.** The Step 7E0 governance reconciliation was **completed and accepted** (commit `722dcb8`), and **Step 7E0D — Schema-critical decision ratification** was **completed and accepted** (commit `b367475`), resolving all seven schema-critical decisions at spec-amendment precedence as **Amendment 003 A-025 … A-032**. Passing the gate made Step 7E **eligible**; the **separate explicit orchestrator authorization** that followed made it **authorized**, and that authorization was **bounded to Step 7E alone**.

**Delivered content — exactly the ratified boundary, no more and no fewer:** 10 enums · 22 application tables · 13 deterministic seed rows · 44 foreign keys · 43 explicit indexes (8 partial-unique + 35 supporting) · RLS enabled on all 22 tables · **zero RLS policies** · **zero client grants** · no view, persisted function, procedure, trigger, extension or additional schema · no AI, evidence, audit, Quick-4, session-lifecycle, version-kind or `content_hash` object · no Auth user and no synthetic domain fixture.

#### Step 7E1A — Author and stage the governed-core migration

**Status:** **Completed · Accepted**

The first governed-core migration was **authored and staged** (one file; path-scoped staging; not applied and not committed at that point). Static review of the staged file then identified four items requiring correction before acceptance:

1. **missing active normalized-email uniqueness** on `accounts`;
2. **`full_name` versus `display_name`** as the account display column;
3. **incomplete role pinning** for the attendance recorder and the report-version author and submitter — these were centre-pinned only;
4. **the need to adjudicate `content_hash` precisely**, rather than assume that deferring the audit hash chain automatically defers a report-content hash.

**The migration was not applied to any database and not committed at Step 7E1A.**

#### Step 7E1B — Correct and restage after static architecture review

**Status:** **Completed · Accepted**

The migration was corrected **in place** — not renamed, and no corrective second migration was created — so that:

- **`accounts.display_name`** is used (the binding clauses A-025 and `CLAUDE.md` §6 are silent on the column name; the accepted Decision G account shape is the controlling source);
- **`accounts.normalized_email`** is present, `NOT NULL`, and normalized by `CHECK`;
- **active normalized-email uniqueness** is enforced by a partial unique index `WHERE status = 'active'`, so many **deactivated** historical accounts may share an email while two **live** identities for one email are impossible;
- the email is a **lookup and contact snapshot only, never an authorization source** — after linkage, authority flows from `auth_user_id` plus live memberships (A-027);
- **`accounts` has no `centre_id` and no role column**;
- **attendance recorder** is trainer-role-pinned (A-018: "the **trainer** may toggle an individual student to `Absent`");
- **observation recorder** is trainer-role-pinned;
- **report-version author** is trainer-role-pinned (A-021: Trainer views **and edits**; Management and Parent are view-only);
- **report-version approver** is trainer-role-pinned;
- **report-version submitter** is trainer-role-pinned (`CLAUDE.md` §6: "Approve & Submit is one user action performing two transitions … the server performs **both** the `approve` and `publish` transitions in sequence within the same server action", and approval is trainer-only);
- **optional actor IDs and their role discriminators are paired** by `CHECK ((id IS NULL) = (role IS NULL))` plus a role-pin `CHECK`, so a nullable actor is either wholly absent or internally consistent;
- **`content_hash` remains absent under Amendment 003 A-032** and is **deferred to the checkpoint that gives it defined meaning**. Specification v3 §20 lists it and A-028 does **not** supersede it, so it remains a live data-model requirement; but §23 — "**Approval provenance.** An approval event captures the `content_hash` of the approved version" — is the clause that gives it meaning, making it **audit-provenance data**, and A-032 states that Step 7E creates "no AI, evidence, audit, or hash-chain column … A column arrives with the checkpoint that gives it meaning." Its algorithm and canonical serialization are explicitly unratified (A-029; U-14), so creating it now would mean either a semantically undefined column or an unratified algorithm choice. It arrives at **Step 7H**;
- the **exact 10-enum, 22-table and 13-seed boundary remained unchanged** by the corrections.

#### Step 7E2A — Apply and verify against local Supabase

**Status:** **Completed · Accepted**  
**Scope:** **Local disposable database only.**

- Migration version **`20260803034500`** applied from a clean local database via the CLI's explicit local mode; **reset/application exit code `0`**; **recorded exactly once** in `supabase_migrations.schema_migrations`; no later application migration.
- **Exact local catalogue:** **10 enums** (ordered values matching the migration exactly) · **22 application tables** · **44 foreign keys** (40 `RESTRICT`, 3 `CASCADE` on owned children, 1 `SET NULL` on `accounts.auth_user_id`) · **43 explicit indexes**, all present, plus 54 constraint-backed · **13 deterministic seed rows** with exact fixed UUIDs, codes, labels, groups and orders.
- **Every foreign-key target is backed by a primary or non-partial unique candidate key** (0 unbacked). Same-centre, session/module, enrolment/module/student, observation and same-report-context agreements are all structurally enforced.
- **All 22 tables have RLS enabled**; **RLS forced on 0** (the migration does not force it); **no RLS policy exists**.
- **Effective table privileges are zero** for `PUBLIC`, `anon`, `authenticated` and `service_role` across all 22 tables and all seven privilege types, measured with catalogue privilege functions rather than a textual scan. `PUBLIC` does not retain `CREATE` on schema `public`.
- **Database lint returned zero errors and zero warnings**, including at warning level with `--fail-on warning` (exit 0).
- **No hosted database was accessed** — no `supabase link`, no project reference, no `--linked`, no hosted URL; `supabase/.temp/project-ref` does not exist, so the project has never been linked.
- The **local stack was stopped cleanly** afterwards (0 running project containers), and the **migration file remained byte-identical** throughout.

**Local-output incident (recorded factually).** `supabase start` briefly printed **disposable local-development JWT and S3 default values** because the first redaction filter did not match that output form (the CLI emits a JSON `"KEY": "value"` block, while the filter targeted `Key: value`). **No hosted credential and no `.env.local` value was exposed**; these are Supabase's publicly documented local defaults, regenerated on every `supabase start`. Redaction was tightened immediately and all later output was clean. **Future database-operation prompts must suppress all credential-bearing CLI output.**

**Step 7G carry-forward (privilege review).** A **pre-existing `supabase_admin` default ACL** in schema `public` may grant client privileges to **future objects created by that role**. It **did not affect the 22 Step 7E tables**, which are **`postgres`-owned and catalogue-verified at zero client privileges**. **Step 7G must inspect effective and default ACLs before adding any policy or grant**, so that a policy-and-grant pair is not silently widened by an inherited platform default. No default privilege was changed in Step 7E.

#### Step 7E2B — Commit the locally proven migration

**Status:** **Completed · Accepted**  
**Commit:** **`252ef9b13008629cadc238bdf58b7016c50bb7b2`** (short **`252ef9b`**)  
**Message:** `feat(supabase): add governed core schema migration` — one subject line only, no body, no trailer  
**Parent:** `584691ebe8b12e8b0eb0d56ca38db259d59ec949`  
**Date:** `2026-08-03 04:37:05 +0800`  
**Summary:** **1 file changed, 1,209 insertions(+), 0 deletions**, `create mode 100644`  
**Resulting commit count:** **16**

The committed blob is **byte-identical** to the locally verified migration — SHA-256 `422be2850c6913ca040bc54b90902df8eaaf35d66492230553e65ab1b3f8db54`, **66,809 bytes**, **1,209 lines**. No tag, remote, upstream, push, amend, rebase or reset. The commit changed **no progress file**, so the tracker and committed migration copy stayed byte-identical across it.

**Original blocking decisions — all seven were resolved by Amendment 003 before authorization:**

*(Original blocking list, preserved. Item 1 is resolved; items 2 – 9 are carried forward and reclassified below.)*

1. ~~Supabase-native data access versus the conflicting Prisma/Drizzle wording in `CLAUDE.md` and Specification v3.~~ — **RESOLVED by Amendment 002 A-023**, ratified at Step 7E0 and committed as `722dcb8`; the Step 7E0 checkpoint is **accepted (2026-07-30)**.
2. `public` profile relationship to `auth.users`.
3. Audit target representation.
4. Report-status storage representation.
5. Audit-chain scope.
6. Audit SHA-256 algorithm.
7. Audit genesis representation.
8. Deliberate `GRANT` strategy for newly created tables.
9. First-migration table and enum scope.

**The seven schema-critical decisions that blocked Step 7E — all RESOLVED by Step 7E0D (2026-08-03):**

| # | Schema-critical blocker | Carried from | Resolution |
|---|---|---|---|
| 1 | **Public application-profile relationship to `auth.users`** | item 2 | **A-025** — centre-independent `accounts`, application-owned UUID, **nullable unique `auth_user_id`**; profiles never key to `auth.users`; `students` have no Auth linkage |
| 2 | **Audit-target representation** — typed FK vs polymorphic `target_type`/`target_id` | item 3 | **A-029** — polymorphic target with an immutable label snapshot and **no FK**, plus a related-target child table; durable actor FKs (`RESTRICT`) retained for attribution |
| 3 | **Report-status storage** | item 4 | **A-028** — normalized `report_status` enum, **exactly seven values**; `Evidence Pending` is **not** a stored status (evidence unresolved), which deletes **no** evidence safeguard |
| 4 | **Database `GRANT` strategy** | item 8 | **A-030** — deny-by-default; **zero client grants and zero policies in Step 7E**; policy and minimum matching grant **ship together in Step 7G** |
| 5 | **Enum versus reference-table strategy, including Class Grade** | new at Step 7E0 (A-016) | **A-026** — enum for closed vocabularies, table for FK identity/order/label, **hybrid** for centre-owned Class Grades and the global nine dimensions |
| 6 | **Invitation state, token and expiry storage** | new at Step 7E0 (A-020) | **A-027** — **no secret-bearing column exists**; stored status plus `expires_at` with **transactional effective-expiry evaluation**; revoke or supersede before reissue |
| 7 | **Exact scope of the first migration — tables, enums, constraints and functions** | item 9 | **A-031 / A-032** — **exactly 10 enums, 22 tables, 13 deterministic seed rows**, all constraints and indexes, RLS enabled with zero policies; **no view, RPC or helper function**; explicit exclusions assigned to 7F–7J |

**Retained later audit-chain decisions (block Step 7H, not the first migration):**

| # | Audit-chain decision | Carried from |
|---|---|---|
| 1 | **Audit-chain scope** — one global chain vs one chain per target/tenant | item 5 |
| 2 | **SHA-256 ratification** — Specification v3 §23 names no algorithm | item 6 |
| 3 | **Genesis rule** — sentinel vs zero-hash for the first chain entry | item 7 |

- **The seven schema-critical items are resolved** (Amendment 003, commit `b367475`, accepted 2026-08-03). **None was decided, narrowed, or silently resolved at Step 7E0 or Step 7E0C** — each was ratified explicitly at Step 7E0D.
- **The three audit-chain items above remain open and block Step 7H**, not the first migration. They were **not** ratified by Amendment 003.
- **The first governed migration has now been written, applied to a local disposable database only, verified and committed** (`252ef9b`, accepted 2026-08-03) under a **bounded orchestrator authorization covering Step 7E alone**. Resolution of the blockers did not by itself authorize implementation; the separate explicit authorization did.
- **The accepted checkpoint sequence after Step 7E is preserved unchanged:** **7E** first governed migration → **7F** synthetic Auth users and domain fixtures → **7G** RLS policies with their minimum matching grants → **7H** audit tables and hash chain → **7I** reviewed read/mutation RPCs and server-action proof → **7J** committed generated database types.
- **No further implementation is authorized. Step 7F requires a separate explicit orchestrator authorization**, which has **not** been given. Step 7E's bounded authorization did **not** extend to Step 7F or any later checkpoint.

#### Step 7E0-B — Schema-preflight technical ratification — **superseded in designation by Step 7E0D**

> **Redesignation note (2026-07-30, Step 7E0).** This sub-checkpoint was **previously designated "Step 7E0 — Data-layer governance and first-migration ratification"**. It was **Pending, unauthorized and never started**, so no accepted history is affected. It was redesignated **Step 7E0-B** to remove the name collision with the new top-level checkpoint **"Step 7E0 — Final MVP scope and schema-preflight governance reconciliation"** recorded immediately before Step 7E. Its original title and scope are preserved verbatim below.
>
> **Second redesignation note (2026-07-30, Step 7E0C).** This sub-checkpoint's remaining scope is now carried by the authorized top-level checkpoint **"Step 7E0D — Schema-critical decision ratification"**, recorded immediately before Step 7E. The designation `Step 7E0-B` is **retired to avoid confusion with `Step 7E0B`** (the completed and accepted commit checkpoint). It was still **Pending, unauthorized and never started**, so **no accepted history is affected**; its text is preserved below unchanged as the provenance of the Step 7E0D scope. **Step 7E0D is the live checkpoint; this block is historical.**

**Status:** Superseded in designation by Step 7E0D — never started  
**Accepted by orchestrator:** No  
**Authorized:** No  
**Prior pause record (preserved):** Paused by orchestrator (2026-07-30) — awaiting explicit orchestrator instruction before planning begins. *That pause was lifted for the Step 7E0 documentation checkpoint only; the technical ratification remained unauthorized until it was reconstituted and authorized as Step 7E0D on 2026-07-30.*

**Scope (as originally recorded):**

- Reconcile the Supabase-native / no-general-purpose-ORM decision with the governance documents.
- Define the first migration's exact tables, enums, foreign keys, grants, and audit primitives.
- Ratify the unresolved identity, status, audit, and grant decisions.
- Determine whether Amendment 002 and/or a `CLAUDE.md` correction is required.
- Produce a bounded implementation plan for Step 7E.
- Make **no** repository, governance, schema, dependency, runtime, or hosted change during planning.

**Scope adjustment after Step 7E0 (2026-07-30):**

- The **data-layer governance reconciliation** and the **Amendment 002 / `CLAUDE.md` correction** questions are **now answered** — Amendment 002 A-023 ratifies Supabase-native access with no general-purpose ORM, and the active documents have been aligned (staged; acceptance pending).
- What **remains** for this sub-checkpoint is the **technical schema preflight**: the `public` profile ↔ `auth.users` relationship, audit target representation, report-status storage, the deliberate `GRANT` strategy, enum-versus-reference-table decisions (including Class Grade), invitation token/expiry details, and the first-migration table and enum scope — plus the audit-chain scope, SHA-256 ratification and genesis rule before Step 7H.
- The schema must now be planned against the **ratified canonical hierarchy** Centre → Class Grade → Class Module → Class Session (A-016), the **mandatory nine-dimension** assessment with **no `mode` column** (A-017), **Present-by-default attendance** unique per student + class session (A-018), the **identity/profile/invitation** model (A-020), and **one shared canonical report read model** (A-021) — with `centres` kept a **real entity with real relationships** (A-015).

### Step 7F0 — Synthetic Auth and domain fixture design ratification

**Status:** Design **Completed and Ratified (2026-08-03)** · **Implementation: Completed and runtime-accepted (2026-08-03) — recorded at Step 7F1 below**  
**Accepted by orchestrator:** Yes — **design only**; ratifying the design authorized nothing  
**Substantive fixture-design commit:** `936cf4e9b131b99943db6724bfb6eb9b23c07050` (`936cf4e`) · parent `20e3650be26c0f40fda32078da32398c924e2672` · `2026-08-03 07:31:15 +0800` · `docs(fixtures): ratify synthetic fixture baseline` · **3 files changed, 495 insertions(+), 5 deletions(-)**, one file created  
**Ratified design record:** `docs/plan/STEP_7F_SYNTHETIC_FIXTURE_BASELINE.md` — 442 lines · 32,167 bytes · SHA-256 `0b64231ad7b31f2f814a8b743c6413ce8605c3068c9ab7a505fc898154211cc1`

#### Step 7F0A — Read-only synthetic Auth and domain-fixture design

- **Completed as read-only analysis.** The minimum synthetic dataset was designed to support later **Management, Trainer and Parent** proof without prematurely implementing Step 7G–7J.
- **Option B was recommended** — **one observation** and **nine mixed observation ratings**, with **no report aggregate, no report version, no approval, no checklist evidence and no invitation**.
- **No repository or database change occurred** — no file created, modified or deleted; no Auth user; no fixture row; no database or hosted command; `.env.local` never accessed.

#### Step 7F0B — Fixture implementation mechanics

- **The Auth Admin `createUser` capability was verified from installed local source and typings only.** `AdminUserAttributes.id` is a documented, type-supported member of `@supabase/auth-js` `2.110.8`, and `createUser` forwards the request body verbatim to the ordinary `POST /admin/users` endpoint.
- **Caller-supplied deterministic Auth UUIDs are supported**, so no direct `auth.users` insertion, no password hash and no unsupported cast is required — all three remain **prohibited**.
- **The runtime-generated Auth UUID fallback was withdrawn.** There is exactly one implementation, and a returned UUID that does not match its ratified literal must **abort the load rather than adapt**.
- **The complete deterministic checksum includes `accounts.auth_user_id`**, because every Auth and domain UUID and every fixture timestamp is a fixed literal.
- **Credential acquisition and reload/recovery mechanics were resolved.**
- **No implementation occurred** — read-only analysis only.

#### Orchestrator-confirmed design (2026-08-03)

Exactly **three** synthetic Auth identities, and **no Student Auth identity**:

| Role | Display name | Email | Auth UUID | Account UUID | Membership UUID |
|---|---|---|---|---|---|
| Management | `Fixture Manager One` | `management.fixture@example.test` | `d0000000-0000-4000-8000-000000000001` | `c0000000-0000-4000-8000-000000000001` | `c1000000-0000-4000-8000-000000000001` |
| Trainer | `Fixture Trainer One` | `trainer.fixture@example.test` | `d0000000-0000-4000-8000-000000000002` | `c0000000-0000-4000-8000-000000000002` | `c1000000-0000-4000-8000-000000000002` |
| Parent | `Fixture Parent One` | `parent.fixture@example.test` | `d0000000-0000-4000-8000-000000000003` | `c0000000-0000-4000-8000-000000000003` | `c1000000-0000-4000-8000-000000000003` |

**Accepted footprint:** **3 local synthetic Auth users** and **25 application-domain rows** — **15 core rows** and **10 assessment rows**; **1 observation**; **9 ratings**; **0 reports**; **0 report versions**; **0 report-version ratings**; **0 checklist-progress rows**; **0 approval rows**; **0 invitation rows**.

**Accepted domain values:** centre `ispeak` / `iSpeak Academy` · grade `beginner` · Student `Fixture Student One` · module `Beginner Public Speaking — Fixture Module A` · session `2026-02-03`, `10:00–11:00` · attendance `present` with **recorder membership and role both NULL**, representing default roster initialization rather than a trainer action.

**All nine rating UUIDs and their exact dimension/rating pairs are fixed exactly as documented in `docs/plan/STEP_7F_SYNTHETIC_FIXTURE_BASELINE.md`.** That committed document is the single source for the full UUID table and is deliberately not duplicated here; the identity UUIDs above are recorded explicitly because they are the authorization-bearing values.

**Delivery mechanism.** A **local-only Node ESM loader** · **static transactional domain SQL** · **verification and negative-test SQL** · **one** future package script · **no new dependency** · **no `supabase/seed.sql`** · **no second migration** · **no direct insertion into `auth.users`** · **no password hash** · **no invitation rows**. Auth users are created through the **local Auth Admin API**; domain rows load through **local-container `psql`**.

**Credential rule (binding).** Passwords are entered **only through no-echo interactive stdin in an operator-controlled local terminal**. **No password may enter chat, environment variables, tracked or untracked files, logs, errors or reports.** **No pattern-based redaction** is used; credential-bearing CLI stdout and stderr remain **captured and unrendered**. The local API URL and service-role key remain **process-memory only**. The loader **aborts** unless the API URL is loopback, the configured ports match, and no project-ref exists.

**Determinism and recovery.** All Auth and domain UUIDs are fixed · all timestamps are fixed · the checksum covers **all** fixture columns · a duplicate load without `--reload` **fails** rather than absorbing divergent state · `--reload` deletes **only** exact fixture UUIDs and exact fixture emails · domain deletion is **transactional and reverse-FK** · Auth deletion uses the **Auth Admin API** with exact reserved-email matching · **Step 7E seed rows are never deleted** · partial failure triggers **compensation** · **no non-fixture user may be deleted**.

**Governance boundaries.** The minimal fixture is a **deliberate Phase 0 exception** to the broader fixture shape in `CLAUDE.md` §11. The broader **two-trainer / two-module / multi-student** dataset **plus a second Class Session** remains a **later additive Phase 1 requirement — deferred, not deleted**. **Fixture provisioning does not define or resolve production Management bootstrap; N-4 / U-23 remains open.** **Step 7F implementation requires separate explicit authorization.**

#### Step 7F0C — Documentation and staging

- Created `docs/plan/STEP_7F_SYNTHETIC_FIXTURE_BASELINE.md` and reconciled `CLAUDE.md` and the Implementation Plan to it. Staged exactly three files path-scoped; **no commit**. No immutable file changed and no progress file was touched.

#### Step 7F0C1 — Stale Step 7E governance correction

- **Four stale current-state statements in `CLAUDE.md` were corrected** — two named in the Step 7F0C report (§6.1 and the §10 Phase 0 blockquote) and **two more found by the required full-file search** (the §1 Amendment 003 row and the §6.1 lead-in sentence).
- The §10 historical text is **preserved verbatim inside a quotation** and explicitly labelled **HISTORICAL — superseded**, so the earlier blocked state remains on record without reading as a current instruction.
- `CLAUDE.md` now carries one unambiguous current state: **Step 7E completed and accepted** (migration `252ef9b`, acceptance record `20e3650`), and **Step 7F ready by design but unauthorized and unstarted**.
- **No fixture decision, UUID, count, credential rule or checkpoint sequence was changed.**

#### Step 7F0D — Commit and verification

- **Exactly one commit was created:** `936cf4e9b131b99943db6724bfb6eb9b23c07050` — subject line only, **no body, no trailer, no amend**, single parent `20e3650be26c0f40fda32078da32398c924e2672`.
- Contents exactly `CLAUDE.md`, `docs/plan/BEST_Coach_Implementation_Plan.md` and `docs/plan/STEP_7F_SYNTHETIC_FIXTURE_BASELINE.md`; **3 files changed, 495 insertions(+), 5 deletions(-)**, one file created; committed blob hashes matched the verified staged hashes exactly.
- **A malformed initial Git invocation (`--no-verify=false`) was rejected by Git before any commit object was created and caused no repository change.** HEAD was re-verified at `20e3650` with the same three files still staged, and the single clean commit was then created.
- **No database, hosted, Auth or fixture operation occurred at any point across Step 7F0A … 7F0D**, the local Supabase stack remained stopped throughout, and `.env.local` was never accessed.

### Step 7F1 — Deterministic local synthetic fixture implementation

**Status:** **Completed and runtime-accepted (2026-08-03)**
**Accepted by orchestrator:** Yes — implementation, runtime proof and independent verification
**Substantive fixture-implementation commit:** `e197f91bbdf3196ef8e0eeee8216d6e7d8e495a7` (`e197f91`) · parent `098d0eaf2bcba912c366aee6789813410df86b48` · `2026-08-03 23:07:57 +0800` · `feat(fixtures): add deterministic local fixture baseline` · **5 files changed, 2,208 insertions(+), 1 deletion(-)**, three files created
**Scope of authorization:** bounded to Step 7F alone; applied to a **local disposable Supabase database only**. **No hosted database was accessed**, the project has never been linked, and `.env.local` was never accessed.

#### Delivered fixture scope

Exactly **3 deterministic Auth users** — **management**, **trainer** and **parent** — and exactly **25 application-domain rows**, producing exactly **28 canonical checksum rows**. The dataset is **1 centre** · Class Grade **`beginner`** · **1 student** · **1 parent-student link** · **1 Class Module** · **1 Class Session** · **1 enrolment** · **1 trainer assignment** · **1 `present` attendance row** · **1 observation** · **9 mixed observation ratings** · **0 reports** · **0 report versions** · **0 report-version ratings** · **0 checklist-progress rows** · **0 approval rows** · **0 invitation rows** · **no Student Auth identity**. Every value matches the ratified baseline in `docs/plan/STEP_7F_SYNTHETIC_FIXTURE_BASELINE.md` exactly.

#### Runtime proof

- **Bounded `--reload` passed.**
- **A duplicate clean load was rejected before password prompting and made no mutation.**
- **Two independent reset-and-clean-load cycles passed.**
- **Operator Checksums A, B and C were identical**, and **independent verification reproduced the same value**.
- **Canonical SHA-256:** `d6a314b40bb5eb1bc3169097e2a9cb03858791498ca5137a43050cee36b87517`
- **37 positive assertions passed** · **all 7 negative tests passed** · **negative tests left no residue**.
- **Step 7E seeds remained 1 centre, 3 grades and 9 dimensions** · **one migration applied** (`20260803034500`).
- **RLS enabled on all 22 tables** · **zero policies** · **zero unintended privileges** for `anon`, `authenticated`, `service_role` and `PUBLIC`.
- **Every command exited normally**, without an operator interrupt.

#### Corrective incidents resolved

1. **The first operator attempt was blocked** because the execution channel lacked a **genuine interactive TTY**. The loader was not invoked, no alternative password path was substituted, and **no mutation occurred**.
2. **The initial Windows password handler converted stdin chunks to strings while comparing numeric byte codes**, so **Enter and Ctrl+C were never recognized**. The handler was rewritten around a pure byte-level state machine covering Enter, CRLF, Backspace and Ctrl+C, with a single raw-mode session across all three prompts.
3. **The domain SQL operation guard placed psql variables inside a dollar-quoted block**, where psql performs no substitution; the block reached the server verbatim and failed with **SQLSTATE 42601**. The guard was rewritten using `\if` meta-commands, with no variable reference inside any `DO` block.
4. **Verification tests N2, N3 and N4 reached unrelated constraints before their intended constraints** — an account-centre uniqueness index, an active-link uniqueness index and an active-timestamp CHECK respectively — and were corrected to isolate the intended invariants.
5. **stdin remained referenced after completion**, preventing Node from exiting automatically and requiring an operator interrupt. The loader lifecycle was corrected so stdin is always paused and both the success and failure paths exit on their own; verification failure now **reports** bounded compensation rather than performing it, because the fixture is already committed and deleting it would destroy diagnostic evidence.
6. **All corrected paths were subsequently proven** by operator runtime verification and by independent verification through the approved local `docker exec … psql` contract.

**No password, password length, service-role key, local API URL, database connection string or container connection detail was requested, printed, logged, persisted or reported at any point across Step 7F1A … Step 7F1F.**

#### Sub-checkpoints

- **7F1A** — authored the three fixture files and one `package.json` script; staged path-scoped; **no new dependency**.
- **7F1B** — reconciled the four ratified timestamp groups and completed the targeted static audit; seven implementation defects were corrected before any execution.
- **7F1C** — execution blocked: no genuine interactive TTY; nothing was started, created or changed.
- **7F1C1** — Windows no-echo password handler corrected and proven by 33 non-interactive assertions.
- **7F1C2** — domain SQL operation guard corrected; SQLSTATE diagnostics added so a raw server error is never again invisible.
- **7F1C3** — negative tests N2, N3 and N4 corrected; loader exit path corrected; full verification suite passed directly.
- **7F1D** — independent runtime verification passed; local Supabase stack stopped afterwards (10 containers → **0**).
- **7F1E** — implementation commit `e197f91`.
- **7F1F** — this acceptance record.

### Step 7G1 — Relationship authorization (read policies and minimum matching grants)

**Status:** **Completed and runtime-accepted (2026-08-04)**
**Accepted by orchestrator:** Yes — P-1 audit, implementation, adversarial static review, runtime proof and verification reconciliation
**Substantive authorization commit:** `17d7ddc4e7264ffe0a545d3830813af94b7ac688` (`17d7ddc`) · parent `0cd6dd796f27cb7624409685eb3c299bfe6688be` · `2026-08-04 00:41:33 +0800` · `feat(authz): add relationship-scoped read policies` · **1 file, 938 insertions(+)** — `supabase/migrations/20260803154500_step_7g_relationship_authorization.sql` (SHA-256 `9cf6c539fd5c0c8067f343a2556e265513a0ba08aaa3ca4c2109d8817a5a736c`, 938 lines, 40,695 bytes)
**Verification-reconciliation commit:** `97f3fb2ed05f7fc3ddcec5e3f5e13b15da668b1f` (`97f3fb2`) · parent `17d7ddc…` · `2026-08-04 01:06:59 +0800` · `test(fixtures): reconcile verification with relationship policies` · **1 file, 203 insertions(+), 31 deletions(-)** — `scripts/fixtures/verify-local-fixtures.sql` (SHA-256 `d568793335fbaeff568f70905082d4e3b756e4252a453936b6a6d25eb062b52b`, 846 lines, 46,912 bytes)
**Scope of authorization:** bounded per checkpoint; applied to the **local disposable Supabase database only**; **no hosted access, no link, no `.env.local`, no password handled**.

#### P-1 default-ACL resolution (7G1A)

- Migration objects are created by **`postgres`**; all **22** Step 7E tables are `postgres`-owned.
- The **`postgres` public default ACLs are hardened** (owner-only for tables, sequences and functions — established by the Step 7E migration itself) and grant **no automatic client access**.
- **`supabase_admin` retains broad public default ACLs** (ALL to anon/authenticated/service_role on objects it creates); they **did not apply** because every project migration executes as `postgres`.
- The Step 7G migration opens with a **fail-closed `current_user = 'postgres'` guard** that aborts before any object is created.
- Both default-ACL sets were verified **unchanged after application**.
- **Any future object creation under `supabase_admin` remains a privilege event requiring re-audit.**

#### Delivered authorization scope

- **Six** public authorization helpers — `app_current_account_id`, `app_has_active_membership`, `app_is_own_membership`, `app_is_own_active_membership`, `app_trainer_reaches_session`, `app_trainer_reaches_module` — all **STABLE · SECURITY DEFINER · search-path pinned · created through the `postgres` migration path · EXECUTE for `authenticated` only**.
- **29 permissive SELECT policies** over exactly **13 identity/roster tables**: centres, accounts, centre_memberships, trainer_profiles, parent_profiles, students, parent_student_links, class_grades, class_modules, class_sessions, enrolments, class_session_assignments, attendance.
- `authenticated`: **SELECT only** on those 13 — **no INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES or TRIGGER anywhere**.
- `anon`, `service_role`, `authenticator`, `PUBLIC`: **zero project-table privileges**. `service_role` stays **deliberately ungranted** because it carries **BYPASSRLS** — absence of privilege is the only boundary that constrains it.
- **Nine out-of-scope tables** keep zero policies and zero authenticated privileges: invitations, assessment_dimensions, observations, observation_ratings, reports, report_versions, report_version_ratings, report_version_checklist_progress, report_version_approvals.
- **No view, trigger, extra schema, default-privilege change or ownership change** was introduced.

#### Accepted role behaviour

- **Management:** centre-scoped read of the in-scope identity/roster layer including lifecycle states; restricted to the managed centre; **no cross-centre visibility**.
- **Trainer:** own account, membership and trainer profile; roster/calendar **only** through active trainer-assignment relationships; **no parent account/profile visibility**; no unrelated or unassigned trainer/session access.
- **Parent:** own account, membership and parent profile; linked-student visibility only through an **active** link; calendar/class access only through the linked student's **active** enrolment; no other parent, child, trainer or centre-wide roster access.
- All paths derive live from `auth.uid()` → `accounts.auth_user_id` → an **active** membership → the relationship tables; every predicate is centre-aware; **inactive relationships confer no authority**.

#### Runtime proof (7G1D)

- Applied cleanly as the **second** project migration: exactly **two** applied — `20260803034500`, `20260803154500`; **22 tables RLS-enabled, FORCE on none**.
- **All 39 visibility-matrix cells passed with deterministic IDs** for management, trainer and parent.
- **Denials:** anon → 42501 on all 13; missing/unknown authenticated identity → 0 rows; all nine out-of-scope tables denied; **`service_role` denied on all 22 despite BYPASSRLS**; authenticator denied; authenticated INSERT/UPDATE/DELETE denied; helper EXECUTE denied to anon/service_role/authenticator.
- **Fail-closed decoys (all transaction-local, all rolled back, zero residue):** inactive account, inactive membership, inactive link, inactive enrolment and inactive assignment all failed closed; unrelated child, unrelated session, another trainer's session and a second centre stayed invisible; **management lifecycle visibility never became a trainer or parent authority path**.
- Fixture unchanged throughout: **3 Auth users · 25 domain rows · 28 canonical rows · canonical SHA-256 `d6a314b40bb5eb1bc3169097e2a9cb03858791498ca5137a43050cee36b87517` · seed 1/3/9**.

#### Verification reconciliation (7G1F)

- The Step 7F suite carried **five superseded assumptions** — A32 (zero policies), A33 (zero client privileges), A34 (one migration), A35 (one migration version), D5 (zero policies after rollback) — reconciled to the accepted Step 7G posture.
- **A1–A31, all seven negative data-integrity tests, and the canonical serialization/checksum logic remained byte-unchanged.**
- The reconciled suite now verifies: 2 migrations · 22 RLS-enabled tables · 29 policies · 6 helpers · the exact grants and denials · no views or user triggers — and **passed twice with the identical canonical checksum and no residue**.

#### Sub-checkpoints

- **7G1A** — read-only authorization and default-ACL baseline audit; **P-1 resolved**.
- **7G1B** — migration authored from a scratchpad policy matrix and staged.
- **7G1C** — adversarial static review; one proven defect corrected (`app_current_account_id` ambiguous-identity fail-closure).
- **7G1D** — applied and runtime-proven as `authenticated`/`anon`/`service_role`/`authenticator` — never as `postgres`.
- **7G1E** — authorization commit `17d7ddc`.
- **7G1F** — verification suite reconciled and twice runtime-proven.
- **7G1G** — reconciliation commit `97f3fb2`.
- **7G1H** — this acceptance record.

### Step 7H1A — Audit-chain design reconciliation and ratification

**Status:** **Design completed and ratified (2026-08-04) — audit-chain SQL not started**
**Accepted by orchestrator:** Yes — design reconciliation, adversarial design review and design commit
**Design commit:** `3e479b69b1a4cd3592daf3edc321e92929002dbb` (`3e479b6`) · parent `6ba61596b524df77ca5366c19b4521f3041f0072` · `2026-08-04 20:48:37 +0800` · `docs(audit): ratify audit-chain design baseline` · **1 file, 378 insertions(+)** — `docs/plan/STEP_7H_AUDIT_CHAIN_BASELINE.md` (SHA-256 `da5b0aea3c7a0640847944d9e5ce6371ac5b07fc5470af0c091ca37251362755`, 378 lines, 52,012 bytes)
**Scope of authorization:** design-only per bounded checkpoint — **no SQL, migration, table, function, trigger, policy, grant or runtime operation**; Supabase remained **stopped** throughout; no database, Docker, psql or hosted command ran.

#### Ratified contract (A-1 … A-6)

- **A-1 — scope and threat model:** one independent chain per centre; protects governed business history under the application threat model; detects accidental or unauthorized alteration **below database-superuser level** and **cannot independently prove integrity against a superuser able to rewrite the chain and anchors**; external mirror/anchoring deferred to **Phase 4**; **no client audit-read in the MVP**; fixture and authentication activity **excluded**; report-lifecycle events belong to **Step 7I**; attendance, management, roster, invitation and role-change events belong to their later governed RPC checkpoints.
- **A-2 — hashing and atomicity:** **SHA-256** via PostgreSQL **core `sha256(bytea)`** (no extension); hashes computed **in PostgreSQL**; governed mutation and required audit append in the **same transaction** — no split transaction; callers can **never supply `entry_hash` or `previous_hash`**.
- **A-3 — partition, genesis and concurrency:** partition key **`centre_id`**; the **dense `seq_no`** — never timestamps — is the chain order; **no head row before the first append**; the first append atomically **seed-or-skips** the head (`last_seq = 0`, domain-separated centre-specific genesis hash), then locks it **`FOR UPDATE`**; the ratified **READ COMMITTED** protocol guarantees **exactly one sequence-1 event** under concurrent first writers; future centres get independent chains without redesign; transaction-scoped advisory locks rejected as **unnecessary indirection**, not as impossible.
- **A-4 — canonical serialization:** domain prefix **`BESTCOACH-AUDIT-V1`**; versioned fixed-field **length-prefixed envelope**; explicit SQL NULL/value representation; deterministic lowercase UUID/hash forms; **UTC timestamps with six fractional digits and `Z`**; **recursive deterministic JSON serialization** with object keys sorted by **UTF-8 byte order** (not native jsonb order), order-preserving arrays, specified number normalization and exhaustive escaping; **SQL NULL, JSON null and text `"null"` distinct**; raw UTF-8, no Unicode normalization; **`payload_canonical` parses back to the stored jsonb payload**; independently reproducible with PostgreSQL core functionality only.
- **A-5 — append protocol and authority:** proposed **`audit_append_event`** — **VOLATILE · SECURITY DEFINER · postgres-owned · search-path pinned · no dynamic SQL · no client EXECUTE**; validates the authenticated actor against **`auth.uid()` and live active account/membership relationships** (the actor triple cannot be spoofed); system/operator events require **`auth.uid()` NULL + jointly-NULL actor triple + registry-approved action**; locks the centre head, allocates the next sequence, computes the hash, and inserts event/targets and the head update **atomically**; committed events/targets **never updated or deleted**; **zero direct client privileges** on audit tables; **no global audit-level idempotency claim** — every governed RPC provides its own deterministic CAS/uniqueness/operation-idempotency gate, defined **before** append for business creates without a natural CAS.
- **A-6 — verification and incidents:** proposed **`audit_verify_chain`** — **read-only, no client EXECUTE**; verifies sequence continuity, previous-hash continuity and genesis, canonical reconstruction, hash recomputation, stored-head agreement, partition isolation, payload/target consistency and registry conformance; **explicit complete and partial modes** — partial ranges record their **predecessor anchor** and cannot claim complete-chain integrity, and stored-head agreement applies **only when the range reaches the tip**; **no silent or automatic repair; no in-place alteration**; an integrity failure is an **incident** — evidence preserved/exported before action; corrections are **new events**; mirror/alerting/cadence/retention remain Phase 4.

#### Minimum proposed objects (ratified design, not implemented)

- **Tables:** `audit_events` · `audit_event_targets` · `audit_chain_heads`.
- **Functions:** `audit_canonical_json` · `audit_append_event` · `audit_verify_chain`.
- **Guard triggers:** `audit_events` UPDATE/DELETE denial · `audit_event_targets` UPDATE/DELETE denial · `audit_chain_heads` **DELETE denial only** — the append function legitimately INSERTs and UPDATEs the head, and **no spoofable session-variable bypass is permitted**.

#### Boundaries and acceptance-test contract

- Step 7H implements **reusable audit-chain infrastructure and verification only**; its runtime decoys must **roll back and leave the real chain empty**; **Step 7I** owns report-lifecycle RPCs/server actions and their appends; later Phase 1 governed RPC checkpoints own attendance, management, roster, invitation and role events; **N-4** owns production management bootstrap; **no report lifecycle is pulled into Step 7H**.
- Ratified future proof categories: postgres migration-role guard; ownership and default-ACL preservation; zero direct client audit-table writes; append/verify execution restrictions; deterministic genesis and serialization; sequential and concurrent append; rollback atomicity; per-RPC duplicate gating; actor-spoofing denial; tamper and head-mismatch detection; complete/partial verification semantics; cross-centre isolation; unauthenticated, trainer and parent non-enumerability; service-role posture; zero repair mutation; fixture/checksum preservation; Step 7G authorization preservation.

#### Sub-checkpoints

- **7H1A** — design-only reconciliation ratifying A-1 … A-6 in `docs/plan/STEP_7H_AUDIT_CHAIN_BASELINE.md`.
- **7H1A2** — adversarial design review; every factual and specification defect corrected before ratification (advisory-lock scoping corrected, genesis race protocol fully specified with a two-writer READ COMMITTED proof, head-trigger shape reconciled to DELETE-only, idempotency bound to per-event-group RPC gates, actor-authority validation specified, serializer feasibility proven core-only including the jsonb key-order trap, partial-verification semantics fixed, object shapes made consistent).
- **7H1A3** — design commit `3e479b6`.
- **7H1A4** — this progress-ratification record.

### Step 7H1D–7H1F — Audit-chain application, dual Codex proof, migration commit and Claude handoff

**Status:** Migration applied, primary-proven, independently verified and committed (2026-08-05); fixture-verifier reconciliation and Step 7H final acceptance pending.\
**Migration commit:** `ef2252119babee1714b335ac43b6bf4bbd4ee582` (`ef22521`) · parent `88f0fe2d941ddece5babb2dfa8efef4079cdc783` · `feat(audit): add tamper-evident audit chain` · exactly one file · 1,550 insertions · local only.\
**Tool transition:** Step 7H1D primary local proof executed using Codex in the same workspace because the Claude Code usage limit was temporarily reached. Step 7H1E independent verification executed in a separate fresh Codex chat. The filesystem, Git repository, preserved local database volume and committed documents remained the sources of truth; project scope and governance did not change.

#### Applied migration and inventory

- Version `20260804213000`; path `supabase/migrations/20260804213000_step_7h_audit_chain.sql`; SHA-256 `6d2f11a3ad66d2666b5442b759646852679a9a4ebabe3b76fb25db2d2aa62c3b`; 1,550 lines; 76,073 bytes.
- Applied locally with pinned Supabase CLI `2.109.1`: exit `0`, duration `1,471 ms`; authored assertions B1–B20 passed. Migration history is exactly `20260803034500`, `20260803154500`, `20260804213000`.
- Tables: `public.audit_events`, `public.audit_event_targets`, `public.audit_chain_heads`.
- Functions: `public.audit_canonical_json`, `public.audit_append_event`, `public.audit_verify_chain`, `public.audit_block_mutation`.
- Enabled guards: audit-events UPDATE/DELETE denial; audit-event-targets UPDATE/DELETE denial; audit-chain-heads DELETE denial.
- Supporting indexes: `audit_events_actor_account_idx`, `audit_events_actor_membership_idx`, `audit_event_targets_centre_idx`.
- Catalogue posture: **25** project tables, RLS on all 25, FORCE on none, zero audit policies; Step 7G unchanged at **29 policies and six helpers**; authenticated SELECT exactly **13 approved tables**; no client/PUBLIC audit-table privilege or Step 7H function EXECUTE; no Step 7H schema, view, materialized view, enum or extension; default ACLs unchanged.

#### Runtime proof and preserved state

- **Step 7H1D primary Codex proof: PASS** — canonical serializer; role/privilege denials; actor authority; sequential append; concurrent genesis; aborted first writer; rollback atomicity; append-only guards; complete/partial verification; tamper detection; cross-centre isolation; fixture and Step 7G preservation; repeatability. Non-concurrency results: **41 rows**; repeatability SHA-256 `fa0155c657679955cecb89090e1a390f0b9b821a5c0de59664c4e226f9a2c2e5`.
- **Step 7H1E independent fresh-chat Codex proof: PASS** — governing sources reread independently; live B1–B20 rerun; full 17-line audit envelope independently constructed; serializer and hash bytes independently verified; role, actor, sequential, concurrency, rollback, append-only, verifier, tamper and isolation proofs independently reproduced. No discrepancy was found in the ratified design, migration or primary proof. One external concurrency-monitor harness issue was corrected and cleaned with no repository or implementation defect; zero residue was independently verified.
- Preserved final state: Auth users `3`; application-domain rows `25`; canonical rows `28`; checksum `d6a314b40bb5eb1bc3169097e2a9cb03858791498ca5137a43050cee36b87517`; audit events/targets/heads `0/0/0`; committed zero heads `0`; decoy residue `0`; disabled user triggers `0`.
- Local Supabase stopped; database, edge-runtime and storage volumes preserved; no lingering test, Supabase CLI, psql or fixture-loader process.

#### Fixture-verifier compatibility limitation and handoff

`scripts/fixtures/verify-local-fixtures.sql` remains unchanged at SHA-256 `d568793335fbaeff568f70905082d4e3b756e4252a453936b6a6d25eb062b52b`. Its domain, checksum, authorization and seven negative tests remain valid; canonical checksum logic remains unchanged. Exactly these assertions require later reconciliation:

- **A32:** tables `22 → 25`; policies stay `29`; FORCE RLS stays `0`.
- **A33:** privilege sweep `22 → 25`; authenticated non-SELECT tables `9 → 12`; approved authenticated SELECT set stays `13`.
- **A34:** migrations `2 → 3`; add `20260804213000`.
- **A35:** public functions `6 → 10`; retain the six Step 7G helper checks and add the four Step 7H function ownership, volatility, SECURITY DEFINER/invoker, search-path and EXECUTE checks.
- **A38:** replace the combined zero-view/zero-trigger assumption with independent zero-view and exactly-three-enabled-audit-guard checks.
- **D5:** functions `6 → 10`; table sweep `22 → 25`; enabled guards `0 → 3`; policies stay `29`; authenticated SELECT stays `13`.

No non-census assertion is stale. The reconciled verifier passed twice externally during both Codex proof checkpoints, but the committed verifier has not yet been edited. **Step 7H is not fully complete until reconciliation, runtime proof and commit of the verifier are accepted.** Step 7I remains unstarted. The next bounded checkpoint is the six-assertion reconciliation followed by two complete verifier runs; Claude Code may resume there.

### Objective

Implement only Phase 0 from the authoritative MVP plan.

### Phase 0 exit evidence

- [ ] Modular Next.js server structure
- [ ] Supabase Auth integrated
- [ ] Core schema and reversible migrations
- [ ] B.E.S.T enums and normalized observation ratings
- [ ] Relationship and PDPA-foundation tables
- [ ] Initial RLS skeleton
- [ ] Append-only hash-chained audit module
- [ ] Logged-in synthetic trainer invokes an authorized server action
- [ ] Verifiable audit event created
- [ ] Database-level audit UPDATE rejection demonstrated
- [ ] Database-level audit DELETE rejection demonstrated
- [ ] Testing stack initialized
- [ ] Required persona checks recorded
- [ ] Phase 0 evidence recorded in `BUILD_NOTES.md`
- [ ] `STATUS.md` updated
- [ ] Orchestrator explicitly accepts Phase 0

---

## Step 8 — Inventory and classify reusable demo assets

**Status:** Blocked by accepted Phase 0

### Objective

Create a disposition table for every potentially reusable demo asset.

### Required classifications

Each relevant asset must be marked:

- `PORT`
- `REFERENCE ONLY`
- `REBUILD`
- `REJECT`
- `NOT APPLICABLE`

### Required evidence

- [ ] Login screen disposition
- [ ] Dashboard/calendar disposition
- [ ] Locked-session modal disposition
- [ ] Roster disposition
- [ ] B.E.S.T form disposition
- [ ] Validation/loading/failure state dispositions
- [ ] AI route disposition
- [ ] Review & Approve disposition
- [ ] Edit Report disposition
- [ ] Approval/success modal disposition
- [ ] Read-only view disposition
- [ ] Evidence preview disposition
- [ ] Shared styles/design tokens disposition
- [ ] Reusable components disposition
- [ ] Demo Context/state explicitly classified `REJECT`
- [ ] Hardcoded data explicitly classified `REJECT`
- [ ] Disposition table approved by orchestrator
- [ ] Disposition recorded in `BUILD_NOTES.md`

---

## Step 9 — Selective integration during MVP Phase 1

**Status:** Blocked by Step 8

Port only when the corresponding production module and authoritative data path exist.

### 9.1 Login shell

- [ ] Visual shell selectively ported or rebuilt
- [ ] Demo credential logic absent
- [ ] Connected to Supabase Auth
- [ ] Auth errors and accessibility verified
- [ ] Integration recorded in `BUILD_NOTES.md`

### 9.2 Dashboard and calendar

- [ ] Presentation selectively ported
- [ ] Hardcoded schedule absent
- [ ] Connected to authorized class/session module
- [ ] Loading, empty, and future-session states verified
- [ ] Integration recorded in `BUILD_NOTES.md`

### 9.3 Roster

- [ ] Cards and status visuals selectively ported
- [ ] Demo Context absent
- [ ] Status derived from real attendance/observation/report workflow
- [ ] Assignment and role access verified
- [ ] Previous-focus continuity connected
- [ ] Integration recorded in `BUILD_NOTES.md`

### 9.4 B.E.S.T form

- [ ] Rating-chip presentation selectively ported
- [x] ~~Quick mode supports four competency dimensions~~ — **removed by Amendment 002 A-017 (Step 7E0, 2026-07-30).** Quick mode is deleted from scope; there is no four-dimension-only completion path and no four-dimension fallback. Preserved struck through as history; **do not implement.**
- [ ] **All nine dimensions are mandatory for every assessment** (A-017) — no mode toggle, no `mode` column, server-validated
- [ ] Rubric anchors surfaced
- [ ] Server validation implemented
- [ ] Future-session lock implemented
- [ ] Follow-up and term-evidence fields implemented
- [ ] Optimistic concurrency implemented
- [ ] Validation/loading/failure interactions verified
- [ ] Integration recorded in `BUILD_NOTES.md`

### 9.5 AI drafting states and workflow

- [ ] Loading/failure/retry presentation selectively ported
- [ ] Demo AI route not reused as production architecture
- [ ] Authoritative observation re-read
- [ ] Deterministic skeleton
- [ ] Idempotency
- [ ] Structured-output validation
- [ ] Grounding validation
- [ ] Bounded regeneration/manual-completion path
- [ ] Contradictory-polarity negative test passes
- [ ] Integration recorded in `BUILD_NOTES.md`

### 9.6 Review, edit, approve, and submit

- [ ] Layouts selectively ported
- [ ] Report versions and source map implemented
- [ ] Follow-up notes use the shared authoritative field
- [ ] Checklist state implemented
- [ ] Editing resets checklist
- [ ] Confirmation modal implemented
- [ ] Guarded approve and publish transitions
- [ ] Audit events committed atomically
- [ ] Parent and management visibility blocked until `Submitted`
- [ ] Integration recorded in `BUILD_NOTES.md`

### 9.7 Parent submitted-report view

- [ ] Built from approval snapshot only
- [ ] No raw rating grid
- [ ] No internal notes or draft history
- [ ] Parent-child RLS negative test passes
- [ ] Evidence behaviour follows the reconciled policy
- [ ] Integration recorded in `BUILD_NOTES.md`

### Phase 1 relationship

MVP Phase 1 may contain production work that is not a demo port. This tracker records only the migration-related disposition and integration. Full Phase 1 implementation evidence remains in `BUILD_NOTES.md`, and current state remains in `STATUS.md`.

---

## Step 10 — Migration closure audit

**Status:** Blocked by completion of all selected ports

### Objective

Prove that the MVP no longer depends on demo-only architecture and that every relevant demo asset has a recorded disposition.

### Required evidence

- [ ] Every relevant demo asset classified
- [ ] Every `PORT` item integrated and tested
- [ ] Every `REFERENCE ONLY`, `REBUILD`, `REJECT`, or `NOT APPLICABLE` item documented
- [ ] No MVP import from demo Context or mock-state files
- [ ] No hardcoded demo identities, students, classes, schedules, or reports in production paths
- [ ] No cosmetic authentication
- [ ] No client-controlled governance transition
- [ ] No client-only governance validation
- [ ] No four-dimension-only production domain assumption
- [ ] No demo AI route used as the production grounding boundary
- [ ] No browser object URL used as persistent evidence storage
- [ ] No demo-only forced-failure control exposed in production UI
- [ ] No demo governance document controls MVP work
- [ ] All migration/integration work recorded in `BUILD_NOTES.md`
- [ ] `STATUS.md` accurately reflects the active MVP phase
- [ ] Migration closure accepted by orchestrator

### Closure action

After acceptance:

1. Set this document's status to `Migration complete`.
2. Add the closure date and final migration commit.
3. Move it to:
   `docs/progress/archive/DEMO_TO_MVP_MIGRATION.md`
4. Continue the MVP using:
   - `CLAUDE.md`
   - the authoritative specification;
   - the Implementation Plan;
   - `STATUS.md`;
   - `BUILD_NOTES.md`.

Phases 2–4, final UAT, quality passes, and deployment are outside this migration tracker and remain governed by the permanent MVP documents.

---

## 6. Current repository record

### Demo repository

- Absolute path: `C:\Users\enyul\Vibe Studio\B.E.S.T-Coach-Workspace\SDS Project Sprint 2`
- Git repository: **Yes** (local, initialized 2026-07-21)
- Branch: `main`
- Latest commit: `8d4acf4abc5039c24da01be773ab1a5e4916080f`
- Working tree: **Clean**
- Automated baseline: **Accepted** — tsc/lint/build all exit 0 (2026-07-21; re-verified on the frozen commit)
- Manual baseline: **Accepted** — bounded browser smoke test passed (2026-07-21)
- Freeze status: **Completed and accepted**
- Freeze commit: `8d4acf4abc5039c24da01be773ab1a5e4916080f`
- Freeze tag: `demo-freeze-step14-2026-07-21` (annotated, points to the freeze commit)
- Remote/GitHub: None (everything local; nothing pushed)
- Document-reported progress: Steps 0–14 complete; Step 15 incomplete
- Actual repository confirmation: Verified 2026-07-21 — code matches the tracker. Steps 0–14 implemented; **Step 15 incomplete exactly as documented** (read-only View renders only the three AI-generated fields; Assessment Snapshot and Focus Tags panels absent)

**Verified inventory findings (2026-07-21):**

- Stack: **Next.js App Router + TypeScript + Tailwind CSS v4**
- **Node.js v24.16.0**; **npm v11.13.0**
- `package-lock.json` **present**
- **No automated test framework or test files**
- `.env.local` **exists and is listed in `.gitignore`** (secret value not read or exposed)
- **Demo-only architecture** (must not be carried into MVP as-is):
  - `lib/demoState.tsx` (React Context / in-memory client state)
  - `lib/serverReportStore.ts` (in-memory `globalThis` Map)
  - `lib/mockData.ts` (hardcoded trainer/students/classes/schedule)
  - cosmetic login (any input proceeds)
  - forced-failure AI controls (`?forceFail` / `FORCE_AI_FAILURE`)
- **No Supabase, RLS, database migrations, real authentication, or production state machine** present
- **Generated/runtime artifacts:** `.next`, `node_modules`, `tsconfig.tsbuildinfo` remain present and ignored; `next-env.d.ts` regenerated by build and ignored.
- **The three runtime log files (`dev-server.log`, `.codex-dev-webpack.out.log`, `.codex-dev-webpack.err.log`) were handled in Step 3A** — added to `.gitignore` and deleted from the working directory before the freeze commit (no longer present).
- The demo contains **nine Stitch/reference folders** under `reference/`.

**Canonical-source rule — duplicate folder:**

- The only canonical migration source is the demo path above, inside `B.E.S.T-Coach-Workspace`.
- A separate copy exists at `C:\Users\enyul\OneDrive - ...\Desktop\SDS Project Sprint 2`. This OneDrive/Desktop duplicate is **not** the migration source and **must not be inspected, modified, frozen, or copied from.**

### MVP repository

- Absolute path: `C:\Users\enyul\Vibe Studio\B.E.S.T-Coach-Workspace\SDS Project Final (BEST Coach)`
- Git repository: **Yes** (local, initialized 2026-07-21)
- Branch: `main`
- Latest commit: `4de3f93c64ffea4883655f411d2f35a9a35f15d6`
- Working tree: **Clean**
- Package name: `best-coach-mvp`
- Node: `v24.16.0`, engine `>=24 <25` (`.nvmrc` `24`)
- npm: `11.13.0` (`packageManager` `npm@11.13.0`)
- Framework: `Next.js 16.2.10` (App Router, TypeScript, Tailwind, ESLint, Turbopack, root `/app`, alias `@/*`, React Compiler off); React/React DOM `19.2.4`
- Initial scaffold verification: **Accepted** (tsc/lint/build exit 0; starter HTTP 200)
- Remote/GitHub: None (everything local; nothing pushed)
- **Latest HEAD:** `42d3c0292d7bc9e6442c4d4fc2398e5ee25de1a6` (short `42d3c02`) — before the Step 7I1G design-ratification commit
- **Total commits before the Step 7I1G design-ratification commit:** `30` — the 29-commit history through `617ca4b` (verifier reconciliation), followed by `42d3c02` (`docs(progress): record Step 7H final acceptance`)
- **Working tree:** `Clean` (before the Step 7I1G edits, which touch only the five ratified design documents already staged plus the three progress files)
- **Governance installation:** `Completed and accepted` (commit `c7c27e5`)
- **Governance closure synchronization:** `Completed and accepted` (commit `a39ed21`)
- **Phase 0:** `In progress` — local-runtime execution, Supabase environment/client boundaries, governed schema, deterministic fixture, relationship authorization and the reusable audit-chain infrastructure complete; **Step 7I's design is ratified, and governed business RPCs and application implementation are not started**
- **Next checkpoint:** **Step 7I2A** — author and stage the exactly two Step 7I migration files for static review; **no Step 7I SQL, RPC, server action, fixture, UI or generated type may be authored until Step 7I2A is explicitly authorized**.
- **Tag:** `None` · **Remote:** `None` · **Upstream:** `None` · **Push:** `None`

**Local tooling and runtime state (accepted at Step 7D5, 2026-07-30; repository fields refreshed at Step 7E0C, Step 7E0D2C and again at Step 7E2C — non-secret evidence only; no credential value or project URL recorded):**

- **Current substantive repository HEAD:** `42d3c0292d7bc9e6442c4d4fc2398e5ee25de1a6` · **Short HEAD:** `42d3c02` · `docs(progress): record Step 7H final acceptance`
- **Total commits before the Step 7I1G design-ratification commit:** `30` · **Working tree:** clean before the eight authorized Step 7I1G file changes (five already-staged design documents plus three progress records)
- **Latest substantive schema commit:** `252ef9b13008629cadc238bdf58b7016c50bb7b2` (governed core schema migration, 2026-08-03)
- **Latest substantive governance commit:** `b367475c180a2e4f4cf70ff1385f34b253356c33` (schema-critical architecture ratification, 2026-08-03) · **preceding substantive governance commit:** `722dcb868435e83fbeb3963cc2548d0745436406`
- **Latest substantive tooling commit:** `0cdb7825b0d4bcd9ad9b40323a3e90228065f006`
- **Latest substantive runtime commit:** `25551c5d733fa581844db35ae3647c0ca8d52190`
- **Latest substantive dependency commit:** `ffd9eef8677f9183175a66f7de00f9fef1223fab`
- **Latest substantive platform commit:** `455a0706b5555c0b4f083327dfd5613d3aa23245`
- **Latest administrative progress commit before this record:** `643d973ac9162be2f7aebb8ba9b825e7a9626165` (Codex audit-chain verification handoff) · **preceding:** `88f0fe2d941ddece5babb2dfa8efef4079cdc783`
- **Latest substantive fixture-design commit:** `936cf4e9b131b99943db6724bfb6eb9b23c07050` (synthetic fixture baseline ratification, 2026-08-03) — **design only; no fixture or Auth artefact was created by it**
- **Latest substantive fixture-implementation commit:** `e197f91bbdf3196ef8e0eeee8216d6e7d8e495a7` (deterministic local fixture baseline, 2026-08-03) — **implemented, runtime-proven and accepted; local disposable database only**
- **Latest substantive authorization commit:** `17d7ddc4e7264ffe0a545d3830813af94b7ac688` (relationship-scoped read policies, 2026-08-04) — **P-1 resolved; 6 helpers, 29 SELECT policies, 13 tables; runtime-proven and accepted**
- **Preceding test/verification commit:** `97f3fb2ed05f7fc3ddcec5e3f5e13b15da668b1f` (fixture-verification reconciliation, 2026-08-04) — **five superseded posture assumptions reconciled; twice runtime-proven with the identical canonical checksum**
- **Latest substantive design commit:** `3e479b69b1a4cd3592daf3edc321e92929002dbb` (audit-chain design baseline, 2026-08-04) — **design only; A-1 … A-6 ratified; no audit-chain SQL, migration or database object was created by it**
- **Latest substantive audit migration commit:** `ef2252119babee1714b335ac43b6bf4bbd4ee582` (tamper-evident audit chain, 2026-08-05) — applied locally, primary-proven, independently verified and committed
- **Latest test/verification commit:** `617ca4b29471625c1bc13c91ae66605e9eca72dc` (`617ca4b`, `test(fixtures): reconcile verifier with audit chain`, 2026-08-05) — A32/A33/A34/A35/A38/D5-only reconciliation; verifier SHA-256 `049cc7d402904e7fb5ccae8f70431589f787d3827acdd1c3b7973ff7bcb5b3d4`, 1,010 lines, 56,099 bytes; run twice pre-commit and twice post-commit, all four runs identical and passing
- **Supabase environment/client boundaries:** **`Implemented`** — browser-safe, request-scoped, and separate server-only elevated clients; committed as `455a070`
- **Runtime dependencies (exact-pinned):** `@supabase/ssr` `0.12.3` · `@supabase/supabase-js` `2.110.8` · `server-only` `0.0.1`
- **Docker Desktop:** `Running with WSL 2` (client and engine `29.6.2`, Compose `v5.3.1`, Linux engine, `x86_64`; Kubernetes not enabled)
- **Supabase CLI:** `2.109.1` — **project-local and exact-pinned** (dev dependency; no global install; invoked via `npx --no-install`)
- **Local Supabase scaffold:** `Initialized` (`supabase/config.toml`, `supabase/.gitignore`)
- **Project identifier:** `best-coach-mvp`
- **Local Supabase runtime:** **`Verified operational`** (Step 7B; 10 required services healthy)
- **Local Supabase stack:** **`Currently stopped`** (stopped after the post-commit verifier proof; database, edge-runtime and storage volumes preserved; the three applied migrations and loaded fixture remain the last verified database state)
- **Analytics / Vector:** **`Disabled locally`** (optional; incompatible with the accepted Windows security posture)
- **Docker TCP 2375:** **`Disabled`**
- **PostgreSQL:** **`17`** · **Local `public` project tables:** **`25`** (22 governed-domain tables plus 3 Step 7H audit tables; RLS enabled on all, FORCE on none)
- **Hosted Supabase project:** `Not linked through CLI` (no login, no link, no access token on this machine)
- **`.env.example`:** `Committed, placeholder-only` (six approved variable names; only the non-secret selectors carry values)
- **`.env.local`:** `Present, ignored, and untracked` (never printed, hashed, copied, or committed)
- **Database schema:** **`Delivered (Step 7E)`** · **Auth population and domain fixtures:** **`Delivered (Step 7F)`** · **Relationship read policies + minimum matching grants:** **`Delivered (Step 7G)`** · **Audit-chain infrastructure:** **`Delivered, applied, dual-proven, committed and fully accepted (Step 7H)`** · **Governed business RPCs:** **`Not started`**
- **Phase 0:** **`In progress`**
- **Step 7D:** **`Complete and accepted`** — Step 7D1 → Step 7D4 and Step 7D overall; environment/client boundaries implemented (`455a070`); records committed (`e07b213`)
- **Step 7E0 (final MVP scope and schema-preflight governance reconciliation):** **`Completed and accepted (2026-07-30)`** — committed as `722dcb8`; sub-checkpoints **7E0A** (change set) and **7E0B** (commit) both Completed · Accepted
- **Step 7E0C (acceptance record):** **`Completed and accepted`** — committed as `6551d37` (`docs(progress): record final MVP governance acceptance`)
- **Step 7E0D (schema-critical decision ratification):** **`Completed and accepted (2026-08-03)`** — committed as `b367475`; sub-checkpoints **7E0D1** (read-only analysis), **7E0D2A** (change set) and **7E0D2B** (commit) all Completed · Accepted; documentation and architecture-decision work only; **no SQL or application implementation was authorized, and none occurred**
- **Step 7E (first governed SQL migration):** **`Completed and accepted (2026-08-03)`** — committed as `252ef9b`; sub-checkpoints **7E1A** (author/stage), **7E1B** (correct/restage), **7E2A** (local apply + catalogue verification) and **7E2B** (commit) all Completed · Accepted. Applied to a **local disposable database only**; **no hosted database was accessed**
- **Step 7F design (7F0A … 7F0D):** **`Completed and ratified (2026-08-03)`** — committed as `936cf4e`; sub-checkpoints **7F0A** (read-only design), **7F0B** (read-only mechanics), **7F0C** (documentation/staging), **7F0C1** (stale Step 7E governance correction) and **7F0D** (commit) are all complete. Ratified record: `docs/plan/STEP_7F_SYNTHETIC_FIXTURE_BASELINE.md`
- **Step 7F implementation (7F1A … 7F1E):** **`Completed and runtime-accepted (2026-08-03)`** — committed as `e197f91`; sub-checkpoints **7F1A** (author/stage), **7F1B** (timestamp reconciliation + static audit), **7F1C** (blocked: no interactive TTY), **7F1C1** (Windows password handler), **7F1C2** (domain SQL operation guard), **7F1C3** (negative tests N2/N3/N4 + loader exit path), **7F1D** (independent runtime verification) and **7F1E** (commit) all Completed · Accepted. Delivered **3 Auth users**, **25 domain rows** and **28 canonical rows** with canonical SHA-256 `d6a314b40bb5eb1bc3169097e2a9cb03858791498ca5137a43050cee36b87517`, identical across the bounded reload and **two** reset-and-clean-load cycles. Applied to a **local disposable database only**; **no hosted database was accessed**
- **Step 7G (7G1A … 7G1H):** **`Completed and runtime-accepted (2026-08-04)`** — committed as `17d7ddc` (authorization migration) and `97f3fb2` (verification reconciliation); sub-checkpoints **7G1A** (P-1 audit), **7G1B** (author/stage), **7G1C** (adversarial review + one corrected defect), **7G1D** (runtime proof), **7G1E** (commit), **7G1F** (verification reconciliation, twice proven), **7G1G** (commit) and **7G1H** (this record) all Completed · Accepted. Delivered **6 helpers**, **29 SELECT policies** and **13 SELECT grants**; `anon`/`service_role`/`authenticator`/`PUBLIC` remain at **zero**; the nine report/assessment/invitation tables remain policy-free and grant-free. **Local disposable database only**
- **Step 7H (7H1A … final acceptance):** **`Completed and fully accepted (2026-08-05)`** — design `3e479b6`; migration `ef22521`; Step 7H1D and Step 7H1E passed; verifier reconciled and committed as `617ca4b` (A32/A33/A34/A35/A38/D5 only); run twice pre-commit and twice post-commit against the preserved database, all four runs producing identical output (stdout SHA-256 `3073041500c43e6ad824bf8b0baee777f8d0e352c74cb1814bee8ccd9c6b919d`) and passing; D-273 … D-284 record the full sequence; **audit infrastructure remains empty until governed RPCs append events**; Step 7I remains unstarted
- **Step 7E0-B (former designation):** **`Superseded in designation by Step 7E0D; never started`**
- **Amendment 002:** **`Active (A-014 … A-024)`** — ratified and committed at `722dcb8`; one-centre / three-flow boundary, canonical hierarchy, mandatory nine dimensions, attendance defaults, management administration, identity/invitation model, one canonical report, Figma Design 2 authority, Supabase-native / no ORM, revised phasing
- **Amendment 003:** **`Active (A-025 … A-032)`** — ratified 2026-08-03 and committed at `b367475`; centre-independent `accounts` with membership-scoped roles, enum-vs-reference-table rules, the absolute authentication-secret prohibition, the report aggregate/version model with **approval as the freeze point**, audit-compatibility guarantees, the deny-by-default privilege posture, and the **exact Step 7E boundary of 10 enums / 22 tables / 13 deterministic seed rows** with explicit exclusions. **Clarifies rather than reverses Amendment 002; names no Amendment 001 clause. Governs schema architecture and migration boundaries — not implementation authorization.**
- **Delivered Step 7E inventory:** **`10 enums · 22 tables · 13 deterministic seed rows · 44 foreign keys · 43 explicit indexes`** — **created and locally verified**; committed as `252ef9b`
- **Delivered centre seed identity:** code **`ispeak`** · display name **`iSpeak Academy`** — seeded **in the local disposable database only**
- **Committed migrations:** `20260803034500` (Step 7E governed core), `20260803154500` (Step 7G relationship authorization), `20260804213000` (Step 7H audit chain, SHA-256 `6d2f11a3ad66d2666b5442b759646852679a9a4ebabe3b76fb25db2d2aa62c3b`) · tracked migration `.sql` files: **3**
- **Database schema/access posture:** **25 project tables**, RLS enabled on all, FORCE on none; **29 Step 7G policies**, **6 authorization helpers**, authenticated SELECT on exactly **13** tables; audit tables have zero policies and zero client/PUBLIC privileges
- **Auth population and domain fixtures:** **`Delivered and runtime-accepted (Step 7F)`** — `scripts/fixtures/`: **3 files**; **3 Auth users**; **25 fixture rows** in the **local disposable database**; `supabase/seed.sql` and `supabase/functions`: still **absent**
- **Relationship read policies + minimum matching grants:** **`Delivered and runtime-accepted (Step 7G)`** — **RLS enabled on all 22 tables (FORCE on none)**, **6 helpers**, **29 SELECT policies**, `authenticated` SELECT on exactly **13** tables, **zero privileges** for `anon`/`service_role`/`authenticator`/`PUBLIC`, **two** applied migrations
- **Governed business RPCs / generated types:** **`Not started`** · **Audit chain:** **`Applied, dual-proven, committed and fully accepted (D-273 … D-284)`**
- **Amendment 004:** **`Active and ratified (A-033 … A-040)`** — ratified 2026-08-05 and committed at the Step 7I1G design-ratification commit; the **two-stage governed report workflow** (trainer approval → management final quality review → management Approve & Submit), the management editing boundary, conditional return-to-trainer, the **eight-value** status set, dual approval provenance with trainer-approved source lineage, role-specific read models, notification lifecycle triggers, and the **exhaustive Step-7I-only additive schema set**. **Names no Amendment 001 clause; weakens no privacy, approval, audit or evidence control; the parent boundary is unchanged and absolute. Not an implementation authorization.**
- **Step 7I design (7I1A … 7I1G):** **`Completed and ratified (2026-08-05)`** — the ratified record is `docs/plan/STEP_7I_REPORT_LIFECYCLE_BASELINE.md` (R-1 … R-33), governed by Amendment 004. Ratified contract: **8 statuses** · **14 legal transition pairs** · **18 proposed new functions** (15 RPCs + 1 authorization helper + 2 serializers) · **14 authenticated EXECUTE grants** · **4 zero-client-EXECUTE functions** · proposed post-Step-7I census **12 enums / 26 tables / 28 functions / 5 migrations** · **75 acceptance tests (T7I-1 … T7I-75)** · **canonical/disposable database isolation** (the four `R(C)` tests T7I-15/16/46/61 run on a separate disposable database; the canonical fixture database stays pristine). **Design only — no Step 7I SQL, migration, RPC, server action, fixture, generated type, application code or UI has been authored, and no Supabase, Docker, psql, fixture, verifier or application runtime was run.**
- **Step 7I physical-test dependencies remaining as implementation work (non-blocking for the design ratification):** the **management review queue** read path (U-7I-24) · the **trainer returned-correction and observation paths** (U-7I-4, U-7I-11/U-30) · **management correction tracking** · the **parent report-list and availability projections** · a **deterministic management bootstrap** (N-4/U-23) · **notification states** and the outbox/delivery mechanism (A-039, U-31) · **AI grounding** and the `ai_jobs` pipeline · **real authentication** · **real frontend/backend adapters**
- **Next checkpoint:** **Step 7I2A** — author and stage the exactly two Step 7I migration files for static review (file 1: only `ALTER TYPE public.report_status ADD VALUE 'trainer_approved' AFTER 'needs_edit'` under the P-1 guard; file 2: every other authorized object); **no Step 7I SQL, RPC, server action, fixture, UI or generated type is authorized until Step 7I2A is explicitly authorized**

**Phase 0 prerequisite state (accepted at Step 6A, 2026-07-22 — no credential value recorded):**

- `.env.local`: **present, ignored, and untracked** (six approved application variables; contents never read)
- **Supabase project:** confirmed
- **Supabase region:** Singapore (`ap-southeast-1`), **orchestrator-verified** in the dashboard
- **Supabase configuration:** present locally (URL, publishable key, secret key)
- **LLM provider:** OpenAI · **LLM model:** `gpt-5.6-terra` · **LLM key:** present locally
- **AI contract:** Responses API with Structured Outputs (strict JSON Schema)
- **Data access:** Supabase-native, **no general-purpose ORM**
- **Supabase CLI:** **installed at Step 6B2A** (`2.109.1`, project-local, exact-pinned) · **Docker-compatible runtime:** **installed and verified at Step 6B1** (Docker Desktop `29.6.2`, WSL 2 backend, Compose `v5.3.1`, Linux engine)

> **Tracker/copy synchronization note (anti-recursion rule, restated at Step 7D5; reconciled at Step 7E0).**
>
> - **The MVP migration copy (`docs/progress/DEMO_TO_MVP_MIGRATION.md`) was synchronized byte-for-byte from this tracker at Step 7D3 and committed as administrative commit `e07b213` at Step 7D4**, absorbing the tracker-only Step 7C5 acceptance and the Step 7D1 / Step 7D2 / Step 7D-closure / Step 7E-block / Step 7E0-planning records.
> - **The Step 7D5 final acceptance modified only this workspace tracker**, leaving the tracker leading the committed migration copy by exactly one permitted tracker-only administrative update (the Step 7D3/7D4 acceptances, the full Step 7D closure, and the orchestrator pause). Per **D-060 through D-066**, **D-101**, **D-102**, **D-121**, **D-145** and **D-169**, that lead did **not** trigger a self-referential administrative commit.
> - **Step 7E0 was that substantive progress-record checkpoint, and it reconciled the lead.** The tracker was synchronized **byte-for-byte** into `docs/progress/DEMO_TO_MVP_MIGRATION.md` as part of the Step 7E0 change set and committed at `722dcb8` (both sides `76636008…cd3ab3`), so **no administrative lead remained**. **Step 7E0C re-synchronized both sides again** with the acceptance record, and that synchronization was committed at **`6551d37`**.
> - **The Step 7E0D substantive commit `b367475` deliberately changed no progress file.** It contained exactly three files — Amendment 003, `CLAUDE.md` and the Implementation Plan — so the tracker and the committed migration copy remained **byte-identical** across it. **Step 7E0D2C re-synchronized both sides again** with that acceptance record, and that synchronization was committed at **`584691e`**.
> - **The Step 7E substantive commit `252ef9b` likewise changed no progress file.** It contained exactly one file — the governed-core migration — so both sides again remained **byte-identical** across it. **Step 7E2C re-synchronizes both sides** with this acceptance record, keeping them byte-identical (staged; commit pending).
> - **The Step 7F substantive commits `936cf4e` and `e197f91` likewise changed no progress file.** `936cf4e` contained exactly `CLAUDE.md`, the Implementation Plan and the ratified fixture-design record; `e197f91` contained exactly the fixture baseline document, `package.json` and the three `scripts/fixtures/` files. Both sides remained **byte-identical** across each. **Step 7F0E re-synchronized both sides** (committed at `098d0ea`), and **Step 7F1F re-synchronized them again** (committed at `0cd6dd7`).
> - **The Step 7G substantive commits `17d7ddc` and `97f3fb2` likewise changed no progress file.** `17d7ddc` contained exactly the Step 7G authorization migration; `97f3fb2` contained exactly the reconciled verification SQL. Both sides remained **byte-identical** across each, and **Step 7G1H re-synchronized them again** (committed at **`6ba6159`**).
> - **The Step 7H substantive design commit `3e479b69b1a4cd3592daf3edc321e92929002dbb` likewise changed no progress file.** It contained exactly the ratified audit-chain design baseline; Step 7H1A4 re-synchronized both sides and was committed as `88f0fe2`.
> - **The Step 7H substantive migration commit `ef2252119babee1714b335ac43b6bf4bbd4ee582` likewise changed no progress file.** It contained exactly `supabase/migrations/20260804213000_step_7h_audit_chain.sql`; Step 7H1F re-synchronized both sides with the application, dual-proof, commit and Codex-to-Claude handoff record (committed at `643d973`).
> - **The Step 7H substantive verifier-reconciliation commit `617ca4b29471625c1bc13c91ae66605e9eca72dc` likewise changed no progress file.** It contained exactly `scripts/fixtures/verify-local-fixtures.sql`; this final-acceptance checkpoint re-synchronizes both sides with the reconciliation, repeatability proof and final acceptance record.
> - **The Step 7H final-acceptance progress commit `42d3c0292d7bc9e6442c4d4fc2398e5ee25de1a6` re-synchronized both sides.** It contained exactly the three progress files, and the tracker and its repository copy were byte-identical (SHA-256 `ebd13b1e83cf10ce68a29fb0e80d685d2a0d7ff5ae900eef7330c4d65d86b9b4`) from that commit until this checkpoint.
> - **The Step 7I1G design-ratification commit is deliberately a combined commit.** Unlike every substantive commit above, it carries the five ratified design documents **and** the three progress records in one commit, because the ratification and the record of it are the same checkpoint. The tracker was updated first and its repository copy replaced with an exact byte copy, so both sides are **byte-identical inside the same commit** and no administrative lead is created.
> - **No commit will be created solely** to make committed progress files acknowledge their own administrative commit — the anti-recursion rule is unchanged. **This checkpoint records the parent commit `42d3c0292d7bc9e6442c4d4fc2398e5ee25de1a6`, not the hash of the design-ratification commit that contains these very lines.**
> - This arrangement is **intentional — it is not drift**.
- **Current phase: Phase 0 — In progress** (local runtime, client boundaries, governed schema, deterministic fixture, relationship authorization and the reusable audit-chain infrastructure delivered, applied, dual-proven and fully accepted; **Amendment 004 and the Step 7I report-lifecycle design ratified**; governed business RPCs, generated types and application implementation not started)
- **Next checkpoint:** **Step 7I2A** — author and stage the exactly two Step 7I migration files for static review; **Step 7I SQL, RPC, server action, fixture, UI and generated types remain unauthorized until Step 7I2A is explicitly authorized**
- **Active migration copy:** synchronized byte-for-byte from this tracker at prior administrative checkpoints through Step 7H final acceptance (`42d3c02`); re-synchronized byte-for-byte at this Step 7I1G design-ratification checkpoint, inside the same commit. No administrative lead remains after this commit
- **AI Features Breakdown:** missing but **non-blocking** for Phase 0 and current MVP scope
- **UI reference assets:** not installed; disposition deferred. **The final UI authority is now Figma Design 2** (Amendment 002 A-022), superseding Stitch; the A-013 disposition discipline still applies before any asset is copied
- **npm advisories:** **3 unresolved findings — 0 moderate and 3 high** (current state as of 2026-07-24) — deferred for reviewed handling (`next` **direct**; transitive `postcss` and `sharp`, both through `next`; **none attributed in any accepted review to `supabase@2.109.1`, `@supabase/ssr`, `@supabase/supabase-js`, `server-only`, or their transitive packages**; the earlier 1-moderate/2-high figure changed because the npm advisory database raised `postcss` to high, **not** because any dependency changed; no `npm audit fix` was run; **advisories remain unresolved**)
- Supabase project: **Confirmed; Singapore region orchestrator-verified (Step 6A2)**
- **Governance documents: INSTALLED AND COMMITTED** (staged at Step 5B2, committed at Step 5B3 as `c7c27e5`)
  - Root `CLAUDE.md` installed (reconciled to Amendment 001)
  - Specification v3 installed **unchanged** (`64d54aa2…`)
  - Amendment 001 installed (A-001 … A-013) — **unchanged**; A-001 … A-012 remain fully active, A-013 superseded by Amendment 002 A-022 only for the UI-reference source and install timing
  - **Amendment 002 installed and ACTIVE (A-014 … A-024)** — created, committed at `722dcb8`, and **accepted 2026-07-30**
  - **Amendment 003 installed and ACTIVE (A-025 … A-032)** — created, committed at `b367475`, and **accepted 2026-08-03**; schema architecture and migration boundaries only, **not implementation authorization**
  - Reconciled Implementation Plan installed
  - `STATUS.md` and `BUILD_NOTES.md` installed
  - Active migration copy `docs/progress/DEMO_TO_MVP_MIGRATION.md` installed in this checkpoint
  - `docs/ui-screens/` not created (A-013); AI Features Breakdown v2 absent (A-011), not fabricated
- Latest committed HEAD is `617ca4b29471625c1bc13c91ae66605e9eca72dc` (`617ca4b`) — the governance baseline was committed at Step 5B3 as `c7c27e5`, and twenty-eight further commits have since been accepted, most recently the audit-chain design baseline `3e479b6`, the tamper-evident audit-chain migration `ef22521`, the Codex-to-Claude handoff record `643d973`, and the fixture-verifier reconciliation `617ca4b`
- Remote/GitHub: None — no remote, nothing pushed
- Outstanding follow-up: **3 unresolved npm advisories — 0 moderate and 3 high** (current state as of 2026-07-24; `next` **direct**, transitive `postcss` and `sharp` both through `next`; **none attributed in any accepted review to the Supabase CLI or the Supabase runtime packages**; the shift from 1-moderate/2-high was **npm advisory-database movement on `postcss`**, not a dependency change; **no `npm audit fix` was run**; **advisories remain unresolved**; deferred to the later security/dependency review — no auto-fix without review)

---

## 7. Decision log

| ID | Date | Decision | Status |
|---|---|---|---|
| D-001 | 2026-07-21 | Use a fresh MVP repository rather than converting the demo working tree in place. | Accepted |
| D-002 | 2026-07-21 | Keep the demo as a frozen, runnable local reference. | Accepted |
| D-003 | 2026-07-21 | Selectively port UI and interaction patterns; rebuild production architecture. | Accepted |
| D-004 | 2026-07-21 | Use one-prompt-at-a-time Claude Code orchestration with ChatGPT review between steps. | Accepted |
| D-005 | 2026-07-21 | Maintain durable migration, status, and build-evidence documents to prevent context reconstruction and hallucination. | Accepted |
| D-006 | 2026-07-21 | Repositories remain local until the orchestrator explicitly requests GitHub setup or push. | Accepted |
| D-007 | 2026-07-21 | The migration tracker ends after all selected demo assets are integrated or dispositioned and the migration closure audit passes. | Accepted |
| D-008 | 2026-07-21 | MVP `BUILD_NOTES.md` begins when the MVP repository is created and records all migration, integration, implementation, verification, and later project work. | Accepted |
| D-009 | 2026-07-21 | Add a document-reconciliation gate before Phase 0 implementation. | Accepted |
| D-010 | 2026-07-21 | Final UAT, accessibility, security, and deployment work remain in the permanent Implementation Plan, not this migration tracker. | Accepted |
| D-011 | 2026-07-21 | Approve the canonical local paths recorded under Step 0 (parent workspace, demo repository, reserved empty MVP folder, migration tracker). No path collision; MVP folder empty. | Accepted |
| D-012 | 2026-07-21 | Demo Step 15 is intentionally skipped; the demo is frozen at verified Step 14, and the corresponding production view is built against the MVP architecture and governance rules. | Accepted |
| D-013 | 2026-07-21 | The canonical demo source is the copy inside `B.E.S.T-Coach-Workspace` only; the OneDrive/Desktop duplicate of `SDS Project Sprint 2` is excluded and must not be inspected, modified, frozen, or copied from. | Accepted |
| D-014 | 2026-07-21 | Demo Git initialization is deferred until after baseline verification (Step 2) and after secret/artifact safeguards are checked (`.env.local` protection confirmed; the three untracked log files handled). | Accepted |
| D-015 | 2026-07-21 | The verified Step 2 automated and manual baseline is accepted; the demo may proceed to local freeze preparation (Step 3A safeguards, then Step 3B local Git freeze). GitHub setup and push remain out of scope unless explicitly requested later. | Accepted |
| D-016 | 2026-07-21 | The demo freeze is accepted — Step 3 (safeguards + local Git freeze) complete and verified. | Accepted |
| D-017 | 2026-07-21 | The canonical demo is preserved locally at commit `8d4acf4abc5039c24da01be773ab1a5e4916080f`, branch `main`, annotated tag `demo-freeze-step14-2026-07-21`. | Accepted |
| D-018 | 2026-07-21 | No GitHub remote is required for the demo; it remains a local frozen reference (nothing pushed). | Accepted |
| D-019 | 2026-07-21 | The project may proceed to creation of the separate fresh MVP repository (Step 4). | Accepted |
| D-020 | 2026-07-21 | The frozen demo must remain unchanged unless the orchestrator explicitly reopens it. | Accepted |
| D-021 | 2026-07-21 | MVP toolchain: Node 24 LTS with npm selected as the package manager. | Accepted |
| D-022 | 2026-07-21 | Current Node `v24.16.0` accepted for MVP scaffolding. | Accepted |
| D-023 | 2026-07-21 | MVP framework: Next.js App Router with TypeScript, Tailwind CSS, ESLint, Turbopack, and a root-level `/app` layout (no `/src`), import alias `@/*`. | Accepted |
| D-024 | 2026-07-21 | React Compiler disabled initially for the MVP scaffold. | Accepted |
| D-025 | 2026-07-21 | create-next-app generated agent files (`AGENTS.md`, `CLAUDE.md`) disabled during scaffolding. | Accepted |
| D-026 | 2026-07-21 | create-next-app automatic Git initialization disabled; Git is initialized deliberately after the scaffold is moved and reviewed. | Accepted |
| D-027 | 2026-07-21 | A temporary lowercase scaffold directory (`best-coach-mvp`) is required because the final folder name `SDS Project Final (BEST Coach)` is not an npm-package-compatible name; generated files are then moved into the reserved destination. | Accepted |
| D-028 | 2026-07-21 | No demo source, Context, mock state, route, component, or reference asset will be copied during MVP scaffolding. | Accepted |
| D-029 | 2026-07-21 | The fresh MVP scaffold and its initial commit (`4de3f93c64ffea4883655f411d2f35a9a35f15d6`) are accepted. | Accepted |
| D-030 | 2026-07-21 | The MVP remains local with no remote configured and nothing pushed. | Accepted |
| D-031 | 2026-07-21 | The frozen demo (`SDS Project Sprint 2`) and fresh MVP (`SDS Project Final (BEST Coach)`) are separate local Git repositories. | Accepted |
| D-032 | 2026-07-21 | No demo architecture was copied into the MVP; the scaffold is a clean create-next-app baseline. | Accepted |
| D-033 | 2026-07-21 | MVP governance documents must be inventoried and reconciled (Step 5A) before being installed (Step 5B). | Accepted |
| D-034 | 2026-07-21 | The two moderate npm audit advisories remain deferred to the formal security/dependency review and must not be auto-fixed without review. | Accepted |
| D-035 | 2026-07-21 | Step 5A accepted: the workspace initially lacked all authoritative MVP governance inputs; three source files were subsequently supplied in `governance-source`, changing Step 5B readiness from blocked to ready. | Accepted |
| D-036 | 2026-07-21 | Source-of-truth hierarchy ratified: Specification v3 → ratified amendments → root `CLAUDE.md` → Implementation Plan → Stitch/UI (visual only) → `STATUS.md` → `BUILD_NOTES.md` → temporary migration tracker. | Accepted |
| D-037 | 2026-07-21 | Specification v3 is installed byte-for-byte and never edited in place; all reconciliations are recorded in a ratified amendment. | Accepted |
| D-038 | 2026-07-21 | **A-001** Gated parent evidence access ratified — a parent may access only their linked child's evidence when report is `Submitted`, `evidence_media` consent is valid, the `parent_child_link` is live, the child/report context matches, scan checks pass, and access is via a short-TTL server-minted signed URL; direct/public/unrelated access prohibited. | Accepted |
| D-039 | 2026-07-21 | **A-002** Phase 1 parent report is text-only; the actual evidence workflow and parent access belong to Phase 2. | Accepted |
| D-040 | 2026-07-21 | **A-003** Phase 2 exit condition corrected — all prohibited evidence paths must fail **and** the linked parent's submitted/consented evidence must work via a valid short-TTL signed URL. | Accepted |
| D-041 | 2026-07-21 | **A-004** Parent UAT corrected to test both the permitted linked-child path and every prohibited path. | Accepted |
| D-042 | 2026-07-21 | **A-005** Local-only Git workflow ratified; GitHub, remote, and push are not Phase 0 prerequisites. | Accepted |
| D-043 | 2026-07-21 | **A-006** Node 24 LTS / npm 11.13.0 toolchain ratified, superseding the Node 20 recommendation. | Accepted |
| D-044 | 2026-07-21 | **A-007** Phase 0 delivers the append-only database audit table and hash chain; the independent retention-locked external mirror is Phase 4. | Accepted |
| D-045 | 2026-07-21 | **A-008** `STATUS.md` and `BUILD_NOTES.md` are both permanent and mandatory at every accepted stopping point. | Accepted |
| D-046 | 2026-07-21 | **A-009** Vitest, React Testing Library, and Playwright are pre-approved; Lighthouse is the initial accessibility approach. | Accepted |
| D-047 | 2026-07-21 | **A-010** Audit-mutation denial must be verified with a restricted/application role or controlled `SET ROLE`, not the privileged SQL-editor identity. | Accepted |
| D-048 | 2026-07-21 | **A-011** The missing AI Features Breakdown v2 is non-blocking for governance, Phase 0, and Phases 1–4; it must not be fabricated and is required before a deferred aggregate-AI feature enters scope. | Accepted |
| D-049 | 2026-07-21 | **A-012** The Implementation Plan is procedural and cannot override the specification or a ratified amendment. | Accepted |
| D-050 | 2026-07-21 | **A-013** Stitch/UI export installation is deferred until after accepted Phase 0 and an approved asset disposition. | Accepted |
| D-051 | 2026-07-22 | The Step 5B2 staged governance set (seven files) was reviewed and accepted. | Accepted |
| D-052 | 2026-07-22 | The governance baseline commit `c7c27e5e2f772725d88fbed1b5e1459d509960ce` is accepted. | Accepted |
| D-053 | 2026-07-22 | Step 5 is substantively complete — governance documents installed, reconciled, verified, and committed. | Accepted |
| D-054 | 2026-07-22 | Step 5B4 is an administrative progress-record synchronization only; it does not reopen or alter accepted governance content. | Accepted |
| D-055 | 2026-07-22 | Phase 0 remains blocked until the orchestrator-only prerequisites are verified in Step 6A. | Accepted |
| D-056 | 2026-07-22 | Supabase project creation and all browser/OAuth setup remain orchestrator-only actions that Claude Code cannot perform. | Accepted |
| D-057 | 2026-07-22 | Secret values must never be printed, reported, or committed — presence/absence verification only. | Accepted |
| D-058 | 2026-07-22 | Stitch assets and the missing AI Features Breakdown are **not** Phase 0 prerequisites. | Accepted |
| D-059 | 2026-07-22 | The ORM/data-access approach must be resolved during Step 6A before Phase 0 implementation begins. | Accepted |
| D-060 | 2026-07-22 | A correct local commit will **not** be amended solely to match subsequently proposed, semantically equivalent commit-message wording. Commit `a39ed21` is accepted as-is. | Accepted |
| D-061 | 2026-07-22 | Progress documents committed within an administrative synchronization may legitimately name the **preceding substantive commit** rather than their own hash. | Accepted |
| D-062 | 2026-07-22 | The latest administrative commit hash may be recorded in the workspace tracker at the **next** checkpoint. | Accepted |
| D-063 | 2026-07-22 | Do **not** create an additional standalone commit solely to make a committed progress document record its own commit hash (self-referential recursion is prohibited). | Accepted |
| D-064 | 2026-07-22 | The workspace tracker may temporarily **lead** the committed MVP migration copy by one tracker-only administrative update. | Accepted |
| D-065 | 2026-07-22 | The next normal progress synchronization will reconcile the workspace tracker and the MVP migration copy. | Accepted |
| D-066 | 2026-07-22 | This temporary tracker/copy difference is **intentional** and is **not** repository drift or a failed integrity condition. | Accepted |
| D-067 | 2026-07-22 | **Supabase-native data access with no general-purpose ORM** is ratified (`@supabase/ssr` + `@supabase/supabase-js`, RLS-scoped clients, server-action writes, PostgreSQL functions/RPCs for atomic transition+audit, separate elevated client, SQL migrations as schema source of truth). An ORM may be added only via a later ADR. | Accepted |
| D-068 | 2026-07-22 | The **six-variable environment contract** is ratified: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `LLM_PROVIDER`, `LLM_MODEL`, `LLM_API_KEY`. No legacy Supabase variable; no secret may carry a `NEXT_PUBLIC_` prefix. | Accepted |
| D-069 | 2026-07-22 | The **Supabase project and Singapore region (`ap-southeast-1`) are orchestrator-verified** via personal dashboard review. | Accepted |
| D-070 | 2026-07-22 | Supabase **URL, publishable key, and secret key are present locally** in ignored, untracked `.env.local` and are protected. | Accepted |
| D-071 | 2026-07-22 | **OpenAI** is the ratified LLM provider. | Accepted |
| D-072 | 2026-07-22 | **`gpt-5.6-terra`** is the ratified LLM model. | Accepted |
| D-073 | 2026-07-22 | The **Responses API with strict Structured Outputs (JSON Schema)** is the required AI contract for the grounding pipeline. | Accepted |
| D-074 | 2026-07-22 | **Official OpenAI documentation verification was supplied by the orchestrator** (model exists; Responses API supported; Structured Outputs supported). Claude Code performed no web verification. | Accepted |
| D-075 | 2026-07-22 | `.env.local` is **ignored, untracked, and must never be printed or committed** — presence-only verification always. | Accepted |
| D-076 | 2026-07-22 | **Credential and provider prerequisites are accepted** (Step 6A2: `READY — CREDENTIAL AND PROVIDER PREREQUISITES VERIFIED`). | Accepted |
| D-077 | 2026-07-22 | **Phase 0 remains not started** until local tooling is installed and accepted. | Accepted |
| D-078 | 2026-07-22 | **Docker Desktop setup (WSL 2 backend) is the next orchestrator-only action** (Step 6B1). | Accepted |
| D-079 | 2026-07-22 | The **Supabase CLI will be installed as a pinned project development dependency** (run via `npx supabase`), only **after** Docker verification is accepted. | Accepted |
| D-080 | 2026-07-23 | **Docker Desktop with the WSL 2 backend is the accepted local container runtime** for this MVP (client and engine `29.6.2`, Compose `v5.3.1`). Hyper-V backend is not used. | Accepted |
| D-081 | 2026-07-23 | **Linux containers are the required mode** (`OSType=linux`, `Architecture=x86_64`). Windows-container mode is not supported for this project. | Accepted |
| D-082 | 2026-07-23 | **Insecure Docker daemon TCP exposure (port `2375`) remains disabled** and must stay disabled for the life of this project. | Accepted |
| D-083 | 2026-07-23 | **Kubernetes is not required for this MVP** and remains disabled in Docker Desktop. | Accepted |
| D-084 | 2026-07-23 | The **Supabase CLI must be installed project-locally and pinned** to an exact version as an MVP development dependency, and invoked through the project-local executable — **never installed globally and never version-ranged**. | Accepted |
| D-085 | 2026-07-23 | **Remote Supabase linking and authentication are deferred** beyond local initialization — Step 6B2 performs local scaffolding only (no `supabase login`, no `supabase link`, no remote migrations). | Accepted |
| D-086 | 2026-07-23 | **Supabase CLI `2.109.1` is the accepted exact project-local tooling version** — pinned without a range in `devDependencies` and resolved identically in `package-lock.json`. | Accepted |
| D-087 | 2026-07-23 | The **CLI must continue to be invoked through the project-local executable** (`npx --no-install supabase`) — never installed or run globally. | Accepted |
| D-088 | 2026-07-23 | **`supabase/config.toml` with project ID `best-coach-mvp` is accepted** as the local Supabase project configuration; the folder-derived default identifier was normalized. | Accepted |
| D-089 | 2026-07-23 | **`.env.example` is committed** (placeholder-only, six approved variable names) **while `.env.local` remains ignored and untracked** — enabled by `.env*` plus the `!.env.example` exception. | Accepted |
| D-090 | 2026-07-23 | **Local Supabase initialization does not constitute Phase 0 schema implementation** — it is tooling configuration only. | Accepted |
| D-091 | 2026-07-23 | **Starting the local stack (`supabase start`) belongs to a later explicit Phase 0 checkpoint**, not to the completed tooling setup. | Accepted |
| D-092 | 2026-07-23 | **Remote linking and hosted migrations require explicit orchestrator approval** in a separate, dedicated checkpoint. | Accepted |
| D-093 | 2026-07-23 | **The tooling commit `0cdb782`** (`chore(tooling): initialize local Supabase scaffold`, parent `a39ed21`, 6 files, 672 insertions) **is accepted**. | Accepted |
| D-094 | 2026-07-23 | **Step 6B is complete** — Docker runtime, project-local pinned CLI, local scaffold, and safe environment example are all in place and accepted. | Accepted |
| D-095 | 2026-07-23 | **The next checkpoint is read-only Phase 0 foundation-slice planning (Step 7A)** — no implementation, no local stack start, no remote linking. | Accepted |
| D-096 | 2026-07-23 | **The Step 6B2D record synchronization is accepted** — tracker synchronized byte-for-byte into the migration copy; `STATUS.md` and `BUILD_NOTES.md` updated; exactly three progress-file modifications staged (488 insertions, 52 deletions). | Accepted |
| D-097 | 2026-07-23 | **Administrative progress commit `a83ec7a`** (`docs(progress): close local Supabase tooling setup`, parent `0cdb782`, 3 files) **is accepted**. | Accepted |
| D-098 | 2026-07-23 | **The substantive Supabase tooling commit remains `0cdb782`** — `a83ec7a` is administrative record-keeping only and introduces no tooling, dependency, or implementation change. | Accepted |
| D-099 | 2026-07-23 | **The current npm advisory state is 1 moderate and 2 high — unresolved** (`next` direct; transitive `sharp` and `postcss`); none attributed in the accepted review to `supabase@2.109.1` or its newly installed packages; no `npm audit fix` was run. | Accepted |
| D-100 | 2026-07-23 | **Stale current-state advisory summaries claiming "two moderate" are corrected in this tracker.** Dated historical records that accurately described an earlier audit snapshot (Step 4B, D-034) are **preserved unchanged**. | Accepted |
| D-101 | 2026-07-23 | **The anti-recursion rule permits this tracker to lead the committed migration copy by exactly one tracker-only update** (extends D-060 … D-066). The difference is intentional and is not drift. | Accepted |
| D-102 | 2026-07-23 | **No additional commit is required solely to record `a83ec7a` inside committed progress files** — the absence of that self-reference is the intended outcome, not a defect. | Accepted |
| D-103 | 2026-07-23 | **Step 6B and all Step 6B2 sub-checkpoints (6B2A … 6B2F) are closed.** | Accepted |
| D-104 | 2026-07-23 | **Step 7A is authorized as a read-only planning checkpoint** — no `supabase start`, no `@supabase/ssr` or `@supabase/supabase-js` install, no migrations, no hosted linking, synthetic data only, no early Phase 1–4 work. | Accepted |
| D-105 | 2026-07-23 | **Phase 0 execution remains unstarted** — no schema, server structure, auth integration, audit chain, or RLS work has begun. _(Superseded on 2026-07-23 by D-115: Phase 0 local-runtime execution has since begun and passed; schema/application work remains unstarted.)_ | Superseded |
| D-106 | 2026-07-23 | **Step 7A planning is accepted** — requirement matrix, checkpoint sequence, first-slice recommendation, and the recorded unresolved findings. | Accepted |
| D-107 | 2026-07-23 | **The Phase 0 checkpoint sequence 7B through 7L is accepted as the working sequence** (runtime → dependencies → clients/boundaries → migration → auth/seed → RLS → audit chain → server action → types → tests → hosted linking). | Accepted |
| D-108 | 2026-07-23 | **The data-layer governance tension must be formally resolved before Step 7E or Step 7J** — v3 §18 / `CLAUDE.md` §9 name a typed client (Prisma or Drizzle) while D-067 selects Supabase-native access with no ORM; the tracker cannot override higher-precedence documents. | Open |
| D-109 | 2026-07-23 | **PostgreSQL 17 built-in SHA-256 is sufficient for the planned audit hash** — `sha256(bytea)` and `gen_random_uuid()` are built in, so `pgcrypto` is not required solely for audit hashing. | Accepted |
| D-110 | 2026-07-23 | **The initial Step 7B service-health failure is accepted as diagnostic evidence** — the gate correctly failed, was not waived, and produced the root-cause analysis that justified the remediation. | Accepted |
| D-111 | 2026-07-23 | **Docker TCP 2375 remains prohibited** — enabling it to satisfy local Analytics was evaluated and rejected as a security regression (reaffirms D-082). | Accepted |
| D-112 | 2026-07-23 | **Local Analytics and Vector are disabled** because they are **optional** and **incompatible with the accepted Windows security posture**; no Phase 0 requirement depends on local log analytics. | Accepted |
| D-113 | 2026-07-23 | **`supabase/snippets/` is local ignored runtime state, not governed source** — SQL migrations remain the source of truth for governed schema changes. | Accepted |
| D-114 | 2026-07-23 | **Remediation commit `25551c5`** (`chore(supabase): stabilize local Windows stack`, parent `a83ec7a`, 2 files, 2 insertions, 1 deletion) **is accepted**. | Accepted |
| D-115 | 2026-07-23 | **Step 7B is complete and Phase 0 is now `In progress`** — local-runtime execution has begun and passed. This supersedes D-105 and the blanket "Phase 0 has not started" formulation. | Accepted |
| D-116 | 2026-07-23 | **Step 7C is the next checkpoint** — Supabase runtime dependency selection and installation, dependency-only, stopping before commit and before source code. | Accepted |
| D-117 | 2026-07-23 | **Schema/application implementation remains unstarted** — no migration, seed, Auth user, RLS policy, audit chain, generated type, client, or server module exists. | Accepted |
| D-118 | 2026-07-24 | **Step 7B-R3 record synchronization is accepted** — tracker synchronized byte-for-byte into the migration copy; `STATUS.md` and `BUILD_NOTES.md` updated; exactly three progress files staged (332 insertions, 65 deletions). | Accepted |
| D-119 | 2026-07-24 | **Administrative progress commit `329f03c`** (`docs(progress): record Phase 0 runtime foundation`, parent `25551c5`, 3 files) **is accepted**. | Accepted |
| D-120 | 2026-07-24 | **The substantive runtime commit remains `25551c5`** — `329f03c` is administrative record-keeping only and introduces no runtime, dependency, schema, or application change. | Accepted |
| D-121 | 2026-07-24 | **Tracker-only anti-recursion handling applies after `329f03c`** — this tracker may lead the committed migration copy by exactly one administrative update (extends D-060 … D-066, D-101). | Accepted |
| D-122 | 2026-07-24 | **No self-referential administrative commit is required** — committed progress files need not acknowledge their own administrative commit hash; the absence is intentional, not a defect (reaffirms D-102). | Accepted |
| D-123 | 2026-07-24 | **The full Step 7B runtime sequence is closed** — 7A, 7B1, 7B-R1, 7B-R2, 7B-R3, 7B-R4 and Step 7B overall are all completed and accepted. | Accepted |
| D-124 | 2026-07-24 | **Local Supabase runtime verification is accepted** — PostgreSQL 17, Auth, REST, Studio, Storage, Realtime, Kong, Mail, Postgres Meta and Edge Runtime verified; Analytics and Vector intentionally disabled; Docker TCP 2375 disabled; stack currently stopped. | Accepted |
| D-125 | 2026-07-24 | **Phase 0 remains `In progress` at the runtime-foundation level** — local-runtime execution has begun and passed. | Accepted |
| D-126 | 2026-07-24 | **Schema, Auth population, RLS, audit-chain and application implementation remain unstarted.** | Accepted |
| D-127 | 2026-07-24 | **Step 7C is authorized as dependency-only** — exact-pin `@supabase/ssr`, `@supabase/supabase-js` and `server-only`; no clients, server modules, ORM, test dependencies, migrations, stack start, or hosted linking. | Accepted |
| D-128 | 2026-07-24 | **Installing Supabase-native packages does not resolve the data-layer governance tension** — D-108 still requires an explicit governance decision before Step 7E or 7J. | Accepted |
| D-129 | 2026-07-24 | **Hosted linking remains deferred** — `supabase login` / `supabase link` / remote migrations require their own explicit checkpoint (reaffirms D-085, D-092, D-129 scope). | Accepted |
| D-130 | 2026-07-24 | **Step 7C1 is accepted** — the Supabase runtime dependencies were verified, exact-pinned, installed, and staged; Node/peer compatibility and the automated baseline (typecheck, lint, production build) passed; exactly `package.json` and `package-lock.json` were staged (2 modifications, 132 insertions, 2 deletions). | Accepted |
| D-131 | 2026-07-24 | **The exact runtime versions `@supabase/ssr` `0.12.3`, `@supabase/supabase-js` `2.110.8`, and `server-only` `0.0.1` are accepted** as the installed, exact-pinned runtime dependencies (no ranges; resolved identically in `package-lock.json`; 11 packages added, 0 removed, 0 changed; no ORM or test dependency). | Accepted |
| D-132 | 2026-07-24 | **Node 24 and peer compatibility are accepted** — `@supabase/supabase-js` `node >=22` is satisfied by `v24.16.0`, and the `@supabase/ssr` peer requirement `^2.110.5` is satisfied by `@supabase/supabase-js` `2.110.8`. | Accepted |
| D-133 | 2026-07-24 | **The current npm advisory snapshot is 3 high and 0 moderate — unresolved** (`next` direct; transitive `postcss` and `sharp`, both through `next`). The earlier 1-moderate/2-high current-state figure changed only because the npm advisory database raised `postcss` to high; no dependency changed. The dated historical snapshots (Step 4B, Step 6B2A, D-034, D-099) are preserved unchanged. | Accepted |
| D-134 | 2026-07-24 | **No advisory is attributed to the newly installed Supabase runtime packages** — neither `@supabase/ssr`, `@supabase/supabase-js`, `server-only`, nor any of their added transitive packages appears in any advisory `via`/`effects` chain; the install produced a zero advisory delta. | Accepted |
| D-135 | 2026-07-24 | **The dependency commit `ffd9eef8677f9183175a66f7de00f9fef1223fab` (`ffd9eef`) is accepted** — `chore(deps): add Supabase runtime clients`, parent `329f03c`, 2 files changed, 132 insertions, 2 deletions; repository clean; eight commits; no tag, remote, or push. | Accepted |
| D-136 | 2026-07-24 | **Step 7C is complete and accepted** — runtime dependency selection, installation, verification, and the dependency commit are all accepted; no client, server-boundary, schema, or application implementation exists yet. | Accepted |
| D-137 | 2026-07-24 | **Installing the Supabase-native dependencies did not resolve the data-layer governance tension** (confirmed post-execution) — D-108 still requires an explicit governance decision and continues to gate Step 7E and Step 7J, not Step 7D (reaffirms D-128). | Accepted |
| D-138 | 2026-07-24 | **Step 7D is the next checkpoint** — Supabase clients, explicit local-versus-hosted environment selection, and `server-only` boundaries; it stops before commit and before any schema work. | Accepted |
| D-139 | 2026-07-24 | **Hosted linking and schema/application work remain deferred** — `supabase login` / `supabase link` / remote migrations and all schema, Auth population, RLS, audit-chain, and application implementation require their own explicit later checkpoints (reaffirms D-126, D-129). | Accepted |
| D-140 | 2026-07-30 | **The recovered Step 7C3 synchronization is accepted** — the interrupted-session partial tracker edits were audited, valid work retained, stale fields repaired, decisions D-130 … D-139 completed, and the tracker / migration copy / `STATUS.md` / `BUILD_NOTES.md` correctly synchronized (final tracker SHA-256 `07431fab…3fe9dc`). | Accepted |
| D-141 | 2026-07-30 | **The interrupted Claude Code session caused no lasting defect** — no duplicate section, truncated Markdown, reused decision identifier, malformed content, or repository corruption resulted from the account/session-limit interruption. | Accepted |
| D-142 | 2026-07-30 | **No data or valid work was lost during the interruption** — every valid partial edit from the interrupted session was preserved and completed. | Accepted |
| D-143 | 2026-07-30 | **Administrative progress commit `5d10bd0`** (`docs(progress): record Supabase runtime dependencies`, parent `ffd9eef`, 3 files, 310 insertions, 57 deletions) **is accepted**. | Accepted |
| D-144 | 2026-07-30 | **The substantive dependency commit remains `ffd9eef`** — `5d10bd0` is administrative record-keeping only and introduces no dependency, source, runtime, schema, or application change. | Accepted |
| D-145 | 2026-07-30 | **Tracker-only anti-recursion handling applies after `5d10bd0`** — this tracker may lead the committed migration copy by exactly one administrative update (extends D-060 … D-066, D-101, D-121). | Accepted |
| D-146 | 2026-07-30 | **No self-referential administrative commit is required** — committed progress files need not acknowledge their own administrative commit hash; the absence is intentional, not a defect (reaffirms D-102, D-122). | Accepted |
| D-147 | 2026-07-30 | **The full Step 7C sequence is complete and accepted** — Step 7C1, Step 7C2, Step 7C3, Step 7C4, and Step 7C overall. | Accepted |
| D-148 | 2026-07-30 | **The Supabase runtime-dependency foundation is accepted** — exact-pinned `@supabase/ssr` `0.12.3`, `@supabase/supabase-js` `2.110.8`, `server-only` `0.0.1`, and Supabase CLI `2.109.1`; Node 24 / peer-compatible; automated baseline passing; advisories 3 high / 0 moderate unresolved; no ORM or test dependency; no client, schema, or application implementation. | Accepted |
| D-149 | 2026-07-30 | **Step 7D is authorized** — Supabase clients, environment selection, and server-only boundaries (Status Pending; not yet accepted by the orchestrator). | Accepted |
| D-150 | 2026-07-30 | **Step 7D is restricted to environment selection and client/server boundaries** — explicit local-versus-hosted environment selection, six-variable validation, the browser-safe / request-scoped-server / separate server-only elevated clients, and objective server-only boundary proof; typecheck, lint, and production build; stage only the approved implementation files; stop before commit or schema work. | Accepted |
| D-151 | 2026-07-30 | **Schema, Auth, RLS, audit chain, hosted linking, and Phase 1–4 work remain deferred** — none is authorized by Step 7D; the data-layer governance tension (D-108) still gates Step 7E and Step 7J. | Accepted |
| D-152 | 2026-07-30 | **Step 7D1 is accepted** — the Supabase environment and client boundaries were implemented, validated, and staged as exactly five additions (0 modifications, 0 deletions, 363 insertions). | Accepted |
| D-153 | 2026-07-30 | **The five-file environment/client-boundary design is accepted** — `lib/supabase/public-config.ts`, `lib/supabase/browser.ts`, `server/platform/env.ts`, `server/platform/supabase/request.ts`, and `server/platform/supabase/elevated.ts`, with distinct browser / request-scoped / server-only elevated security boundaries. | Accepted |
| D-154 | 2026-07-30 | **The routable environment-probe deviation is accepted as necessary and correct** — the proposed `app/__step7d_env_probe` path is a Next.js private folder and would not execute; a temporary routable `app/step7d-env-probe` proved validation without weakening scope or security, and was deleted and never staged. | Accepted |
| D-155 | 2026-07-30 | **The negative server-only boundary proof is accepted** — importing the elevated factory into a Client Component failed the build with exit 1 specifically on the `server-only` boundary (not syntax/path/dependency/lint/unrelated TypeScript). | Accepted |
| D-156 | 2026-07-30 | **The client-bundle isolation result is accepted** — zero occurrences of `SUPABASE_SECRET_KEY`, `LLM_PROVIDER`, `LLM_MODEL`, and `LLM_API_KEY` in `.next/static`; no `server/platform` module in client output; the elevated factory is unreachable from browser code. | Accepted |
| D-157 | 2026-07-30 | **Implementation commit `455a070`** (`feat(platform): add Supabase client boundaries`, parent `5d10bd0`, 5 files, 363 insertions, 0 deletions) **is accepted**. | Accepted |
| D-158 | 2026-07-30 | **Step 7D is complete and accepted** — Step 7D1, Step 7D2, and Step 7D overall. | Accepted |
| D-159 | 2026-07-30 | **Structural credential validation does not prove hosted project ownership or identity** — offline checks cannot bind an opaque key to the selected URL; connection/identity proof belongs to a later runtime/Auth checkpoint. | Accepted |
| D-160 | 2026-07-30 | **No Auth, query, schema, RLS, audit, or hosted operation has occurred** — Step 7D implemented client boundaries only; Phase 0 remains `In progress`. | Accepted |
| D-161 | 2026-07-30 | **Step 7E is blocked pending formal ratification** — the data-layer governance decision, `public`↔`auth.users` relationship, audit target/status/chain-scope/SHA-256/genesis representations, deliberate `GRANT` strategy, and first-migration table/enum scope must be ratified before any migration is written. | Accepted |
| D-162 | 2026-07-30 | **Step 7E0 is the next planning checkpoint** — data-layer governance and first-migration ratification, planning only, unauthorized until the ratification is approved. | Accepted |
| D-163 | 2026-07-30 | **No SQL or governance-document change is authorized yet** — Step 7E0 makes no repository, governance, schema, dependency, runtime, or hosted change. | Accepted |
| D-164 | 2026-07-30 | **Step 7D3 record synchronization is accepted** — the tracker was synchronized byte-for-byte into `docs/progress/DEMO_TO_MVP_MIGRATION.md`, `STATUS.md` and `BUILD_NOTES.md` were updated, and exactly three progress files were staged (3 modifications, 0 additions, 0 deletions; 302 insertions, 63 deletions). | Accepted |
| D-165 | 2026-07-30 | **The `/compact` interruption during Step 7D3 caused no lasting defect** — `/compact` changed conversation context only; it mutated no file, Git staging, commit, or runtime state; execution stopped cleanly after Section 9 and before Section 10; no duplicate, malformed, truncated, or inconsistent record remained. | Accepted |
| D-166 | 2026-07-30 | **No work or data was lost during the interruption** — the completed synchronization was verified before resuming, and the remaining Step 7D3 sections were completed correctly. | Accepted |
| D-167 | 2026-07-30 | **Administrative progress commit `e07b213`** (`docs(progress): record Supabase client boundaries`, parent `455a070`, 3 files, 302 insertions, 63 deletions) **is accepted**. | Accepted |
| D-168 | 2026-07-30 | **The substantive implementation commit remains `455a070`** — `e07b213` is administrative record-keeping only and introduces no source, dependency, runtime, schema, or application change. | Accepted |
| D-169 | 2026-07-30 | **Tracker-only anti-recursion handling applies after `e07b213`** — this tracker may lead the committed migration copy by exactly one administrative update (extends D-060 … D-066, D-101, D-121, D-145). | Accepted |
| D-170 | 2026-07-30 | **No self-referential administrative commit is required** — committed progress files need not acknowledge their own administrative commit hash; the absence is intentional, not a defect (reaffirms D-102, D-146). | Accepted |
| D-171 | 2026-07-30 | **The complete Step 7D sequence is closed and accepted** — Step 7D1, Step 7D2, Step 7D3, Step 7D4, and Step 7D overall. | Accepted |
| D-172 | 2026-07-30 | **The Supabase environment/client-boundary foundation is accepted** — local-versus-hosted classification, six-variable validation, the browser / request-scoped / server-only elevated boundaries, the negative `server-only` proof, client-bundle private-name isolation, IPv6 loopback handling, and passing typecheck/lint/build; implementation commit `455a070` and progress commit `e07b213` accepted; structural validation does not prove hosted-project ownership; no Auth, query, schema, RLS, audit, or hosted operation exists. | Accepted |
| D-173 | 2026-07-30 | **Step 7E remains blocked** — pending formal ratification of the data-layer governance, `public`↔`auth.users` identity, report-status, audit-design (target/scope/SHA-256/genesis), deliberate `GRANT`, and first-migration table/enum decisions. | Accepted |
| D-174 | 2026-07-30 | **Step 7E0 remains pending and unauthorized** — data-layer governance and first-migration ratification, planning only; not yet accepted or authorized. | Accepted |
| D-175 | 2026-07-30 | **The workflow is paused by the orchestrator before Step 7E0** — pause point: after complete acceptance of Step 7D and before Step 7E0 planning; resume condition: explicit new orchestrator instruction. | Accepted |
| D-176 | 2026-07-30 | **No automatic next action is authorized** — the clean accepted Step 7D state must be preserved; no Step 7E0 planning, governance-document change, or SQL is permitted while paused. | Accepted |
| D-177 | 2026-07-30 | **Work may resume only after explicit orchestrator instruction** — no self-triggered continuation of the workflow. | Accepted |
| D-178 | 2026-07-30 | **The orchestrator has explicitly resumed the workflow** and authorized **Step 7E0 — Final MVP scope and schema-preflight governance reconciliation** as a **documentation-only** checkpoint, positioned after the complete accepted Step 7D sequence and before Step 7E. The pause recorded in D-175 … D-177 is closed by that instruction and preserved as history. | Accepted |
| D-179 | 2026-07-30 | **Step 7D remains historically unchanged and accepted**, and the product decisions ratified at Step 7E0 **do not invalidate the accepted Step 7D client-boundary work** — Step 7D created client boundaries only and committed the project to no domain shape. **No accepted historical checkpoint is renumbered or rewritten.** | Accepted |
| D-180 | 2026-07-30 | **Specification v3 Amendment 002 is created with decisions A-014 through A-024** and a precise supersession table. Specification v3 and Amendment 001 are **not edited in place** and remain byte-for-byte unchanged; supersession is by reference only. | Accepted |
| D-181 | 2026-07-30 | **A-014 — Final MVP boundary:** exactly **three** completed human-user flows (Management, Trainer, Parent) for **one centre**. No centre creation/deletion/switching, multi-centre administration, cross-centre analytics or transfers, HQ role, super-admin role, completed TA flow, or TA-specific UAT gate. | Accepted |
| D-182 | 2026-07-30 | **A-015 — One-centre persistence and management-account rule:** a **real `centres` entity and centre-scoped relationships are retained** so multi-centre support stays additive; the MVP uses **exactly one** synthetic/seeded centre, with **no centre-selection UI** and **no centre-management UI**; there is **one named management account** — never shared credentials. | Accepted |
| D-183 | 2026-07-30 | **A-016 — Canonical hierarchy:** **Centre → Class Grade → Class Module → Class Session → downstream records.** Class Grade values are exactly **Beginner, Intermediate, Advanced**; **"Class Grade" replaces "Academic Level"** as the active term; "Create Class" persists a **Class Module** under a selected Class Grade with **no hidden intermediate `classes` entity**; trainer assignment is authoritative at **class-session** level; **calendars are projections, never duplicated event records**. | Accepted |
| D-184 | 2026-07-30 | **A-017 — Mandatory full nine-dimension assessment:** every assessment requires **all nine** dimensions. **Quick mode is removed completely**; **no four-dimension-only completion path**; **no four-dimension fallback**. Dimensions, ratings, rubric anchors, grounding validation, trainer accountability, and governed AI generation/review are retained unchanged. | Accepted |
| D-185 | 2026-07-30 | **A-018 — Attendance:** defaults to **`Present`** on roster initialization; the trainer may toggle an individual student to **`Absent`**; state persists per **student + class session** (conceptually unique); absence never creates or exposes a fabricated assessment or report; **changes are auditable**. | Accepted |
| D-186 | 2026-07-30 | **A-019 — Management administration:** management creates Class Modules under a selected Class Grade, dated Class Sessions, trainer/student/parent profiles and invitations, enrolments, parent–student links, and **one trainer assignment per class session**; it **views** submitted reports and **never edits report content**. Every management write is **server-side, centre-scoped, validated, authorized and auditable**. Trainer assignment surfaces the **same stored session record** in the trainer calendar — **no separate copy**. | Accepted |
| D-187 | 2026-07-30 | **A-020 — Profile, invitation and account-activation model:** the **Auth identity is distinct from the domain profile**; management initiates email invitations; the recipient **verifies** and sets **their own** credentials; **no plaintext generated password is stored, displayed or emailed**; invitation states include at least `pending`/`accepted`/`expired`/`revoked`; **an unactivated profile is not an active login identity**; authorization remains live-relationship-based and RLS/server-enforced. | Accepted |
| D-188 | 2026-07-30 | **A-021 — One canonical role-aware feedback report:** one format, **one shared submitted-report read model**, one reusable presentation architecture. Trainer views and edits within the governed workflow; **management and parent are view only** (parent: linked students only). All draft / internal-note / raw-rating / AI-history prohibitions are retained; **hiding an Edit button is not authorization** — the **server rejects** management and parent edit attempts; trainer edits use the governed editable version, never mutate a submitted approval snapshot in place, reset the quality checklist, and require review and approval again; **AI never publishes directly**. | Accepted |
| D-189 | 2026-07-30 | **A-022 — Figma Design 2 replaces Stitch as the final UI authority.** It is authoritative for visual layout, hierarchy, composition, visible fields, labels, microcopy, page relationships, interaction intent, visual states, and explicitly shown responsive behaviour; it is **not** authoritative for schema, foreign keys, RLS, server authorization, report lifecycle, audit, Auth, AI governance, persistence, state-machine rules, or transaction boundaries. **Amendment 001 A-013 is superseded only for the UI-reference source and install timing**; its disposition discipline survives. | Accepted |
| D-190 | 2026-07-30 | **A-022.1 … A-022.3 — Figma implementation-readiness gate and porting rules:** a **mandatory gate** precedes the first Figma-based UI implementation checkpoint (node-specific `/design/` links, screen names, flows, routes, responsive variants, component/interaction states, the six required states, token inventory, typography/colours/spacing/radii/shadows, logos/SVGs/icons/images, prototype transitions and interaction notes, and governance discrepancies). **Blind porting is prohibited** for generated React, Figma mock data, prototype-only navigation, fake authentication, hard-coded identities, duplicated calendar records, client-side authorization assumptions, frame-inferred schema or business logic, Edit-button-inferred permissions, conflicting generated CSS, and Supabase/RLS/validation bypasses. **Missing details require implementation to stop and ask — never guess.** The handoff **does not block Step 7E unless a missing visible field changes the domain relationship model**; it **does block** the corresponding UI checkpoint. | Accepted |
| D-191 | 2026-07-30 | **A-023 — Supabase-native data layer, no general-purpose ORM, is ratified at spec-amendment precedence.** `@supabase/ssr` + `@supabase/supabase-js`; **Supabase SQL migrations are the schema source of truth**; **generated Supabase database TypeScript types are authoritative** for application data types; RLS-scoped normal access; reviewed server actions/route handlers for governance-carrying writes; reviewed PostgreSQL functions/RPCs for atomic transition+audit; a **separate server-only elevated client requiring explicit authorization**; **no Prisma, Drizzle or other general-purpose ORM**, addable only via a later explicit ADR and orchestrator approval. **This resolves D-108.** | Accepted |
| D-192 | 2026-07-30 | **D-108 is resolved.** The data-layer governance tension between Specification v3 §18 / `CLAUDE.md` §9 ("Prisma or Drizzle") and the tracker-only Supabase-native decision (D-067) is closed by Amendment 002 A-023 at the correct precedence level, and the active documents have been aligned — **pending commit and orchestrator acceptance of this checkpoint**. | Accepted |
| D-193 | 2026-07-30 | **A-024 — Revised implementation phasing and three-flow UAT:** governance/schema preflight → hierarchy foundations → identity/profile/invitation foundations → management setup and creation → trainer assignment and calendar projection → enrolment and roster projection → trainer attendance → nine-dimension assessment → AI draft/review/edit/approval → shared submitted-report projection → parent invitation/activation/linked-student view → management report view and remaining Design 2 management screens → full three-flow integration and UAT. **Final UAT covers Management, Trainer and Parent only.** | Accepted |
| D-194 | 2026-07-30 | **TA deferral does not weaken evidence security.** Amendment 001 **A-001, A-003 and A-004 remain active in full** and apply whenever evidence is implemented. Amendment 002 **does not silently weaken privacy, approval, audit or evidence controls**, and the core governance rule — *AI drafts, trainer approves, parents and management see only approved reports* — is unchanged. | Accepted |
| D-195 | 2026-07-30 | **The evidence-uploader decision is recorded as UNRESOLVED.** No replacement actor was invented, and **TA evidence-upload permissions were not silently transferred to management or trainer**. Whether evidence media remains a completion requirement, and its exact Figma screens if retained, are likewise unresolved. | Open |
| D-196 | 2026-07-30 | **A formal governance and schema-preflight gate (Plan Gate G1) is inserted before Step 7E**, and a **mandatory Figma Design 2 implementation-readiness gate (Plan Gate G2)** is inserted before the first Figma-based UI implementation checkpoint. Both are new; **neither renumbers any accepted historical checkpoint**. | Accepted |
| D-197 | 2026-07-30 | **`docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md` is created** with the required 22-column per-screen matrix covering the Management, Trainer and Parent screen families (plus the deferred TA and conditional evidence rows) and the **"Orchestrator Figma Porting Actions"** checklist. **Every unverified node cell reads exactly `Pending node-specific Design 2 link — do not guess`; no node ID was fabricated**, and the supplied prototype-section link is **not** treated as proof of any child frame. | Accepted |
| D-198 | 2026-07-30 | **The previously recorded sub-checkpoint "Step 7E0 — Data-layer governance and first-migration ratification" is redesignated "Step 7E0-B — Schema-preflight technical ratification"** to remove the name collision with this checkpoint. It was **Pending, unauthorized and never started**, so **no accepted history is affected**; its original title and scope are preserved verbatim. | Accepted |
| D-199 | 2026-07-30 | **Step 7E remains blocked** — it may not begin until the Step 7E0 documentation checkpoint is **reviewed, committed and accepted**, and until the remaining schema-critical decisions are ratified: the `public` profile ↔ `auth.users` relationship; audit target representation; report-status storage; the deliberate `GRANT` strategy; enum-versus-reference-table decisions (including Class Grade); invitation token/expiry details and state storage; and the first-migration table/enum scope. | Accepted |
| D-200 | 2026-07-30 | **Open decisions are classified by blocking point:** **(1)** schema-critical → blocks Step 7E; **(2)** report/UI → blocks only its own later implementation checkpoint; **(3)** Figma tokens/assets → blocks no schema work; **(4)** evidence → blocks only evidence implementation unless it alters core schema; **(5)** audit-design (chain scope, SHA-256, genesis) → blocks Step 7H, not the first migration. **Missing Figma node links must not block Step 7E unless a missing field changes the domain relationship model.** | Accepted |
| D-201 | 2026-07-30 | **The Step 7E0 change set is documentation only** — no application code, database schema, SQL migration, dependency, Supabase operation, Auth user, invitation, seed data, UI component, route, server action, test, or Figma asset was created or modified; no typecheck, lint, build, or test was run; the local stack was not started; the hosted project was not linked; and **`.env.local` was never opened, printed, hashed, copied, parsed or inspected**. | Accepted |
| D-202 | 2026-07-30 | **Specification v3 and Amendment 001 are verified byte-for-byte unchanged**, every `governance-source/` file is unchanged, and the **frozen demo is unchanged and clean** at `8d4acf4` with its annotated tag intact. | Accepted |
| D-203 | 2026-07-30 | **Step 7E0 reconciles the tracker's permitted one-update administrative lead** — this workspace tracker is synchronized **byte-for-byte** into `docs/progress/DEMO_TO_MVP_MIGRATION.md`, so the two are byte-identical and no lead remains. The anti-recursion rule (D-060 … D-066, D-101, D-121, D-145, D-169) is unchanged for future administrative checkpoints. | Accepted |
| D-204 | 2026-07-30 | **Exactly seven in-repository documentation files are staged** — `CLAUDE.md`, `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_002.md`, `docs/plan/BEST_Coach_Implementation_Plan.md`, `docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md`, `docs/progress/STATUS.md`, `docs/progress/BUILD_NOTES.md`, `docs/progress/DEMO_TO_MVP_MIGRATION.md` — with no other staged, unstaged, or untracked repository-visible change. **No commit, tag, remote or push was created.** | Accepted |
| D-205 | 2026-07-30 | **This checkpoint does not self-accept.** Its acceptance status is **Pending orchestrator review**; the workflow may not proceed to Step 7E or Step 7E0-B until the orchestrator explicitly accepts it. | Accepted |
| D-206 | 2026-07-30 | **The Step 7E0 governance-reconciliation change set was committed as `722dcb868435e83fbeb3963cc2548d0745436406` (`722dcb8`)** — `docs(governance): ratify final single-centre three-flow MVP`, parent `e07b2138c9b670ebd3feda41c89782056cb8a6d5`, dated `2026-07-30 12:39:49 +0800`, **7 files changed, 1383 insertions, 123 deletions (2 created, 5 modified)**, resulting commit count **12**. | Accepted |
| D-207 | 2026-07-30 | **The commit message is a single subject line with an empty body**, verified byte-exact with no trailer added; **exactly one commit was created** — no amend, reset, or rebase (reflog shows `722dcb8` directly over `e07b213`); **no tag, remote, or push**. | Accepted |
| D-208 | 2026-07-30 | **Step 7E0 — Final MVP scope and schema-preflight governance reconciliation is COMPLETED and ACCEPTED by the orchestrator (acceptance date 2026-07-30).** The documentation reconciliation was reviewed and accepted; the substantive governance commit is **`722dcb8`**. | Accepted |
| D-209 | 2026-07-30 | **Sub-checkpoints Step 7E0A (change set) and Step 7E0B (commit) are both Completed and Accepted.** | Accepted |
| D-210 | 2026-07-30 | **The accepted reconciliation carries Amendment 002 A-014 through A-024**, the **three completed MVP flows (Management, Trainer, Parent)**, **one-centre-only operation**, **one named management account**, the canonical hierarchy **Centre → Class Grade → Class Module → Class Session**, the Class Grade values **Beginner / Intermediate / Advanced**, **mandatory nine-dimension assessment**, **removal of Quick mode**, **Present-by-default attendance with a trainer-controlled `Absent` toggle**, the **management creation / invitation / enrolment / assignment scope**, **one shared canonical report format**, **trainer edit access**, **management and parent view-only access**, **Figma Design 2 as the final visual and interaction authority**, the **mandatory Figma implementation-readiness handoff**, **Supabase-native data access**, **no general-purpose ORM**, and **TA-flow deferral while preserving Amendment 001 evidence safeguards**. | Accepted |
| D-211 | 2026-07-30 | **Amendment 002 is ACTIVE** — installed, committed and accepted. Specification v3 (`64d54aa2…`), Amendment 001 (`25ede394…`) and every `governance-source/` file remain **byte-for-byte unchanged**; the frozen demo remains unchanged and clean at `8d4acf4…` with its annotated tag intact. | Accepted |
| D-212 | 2026-07-30 | **Step 7D remains completed and fully accepted**, and **no previously accepted history has been rewritten** by the Step 7E0 / 7E0B / 7E0C sequence. | Accepted |
| D-213 | 2026-07-30 | **The Step 7E0C acceptance-record commit remains PENDING** — this checkpoint stops before commit, so the committed progress files will name the substantive governance commit `722dcb8` rather than their own administrative hash (anti-recursion rule, D-060 … D-066, D-101, D-121, D-145, D-169). | Accepted |
| D-214 | 2026-07-30 | **Step 7E remains Blocked, Not accepted, Not authorized and Not started.** No migration, seed, Auth user, RLS policy, audit chain, or application schema table exists; `supabase/migrations`, `supabase/seed.sql` and `supabase/functions` are absent and zero `.sql` files are tracked. | Accepted |
| D-215 | 2026-07-30 | **Seven schema-critical decisions are carried forward as the Step 7E blockers:** (1) public application-profile relationship to `auth.users`; (2) audit-target representation; (3) report-status storage; (4) database `GRANT` strategy; (5) enum-versus-reference-table strategy, **including Class Grade**; (6) invitation state, token and expiry storage; (7) exact scope of the first migration — tables, enums, constraints and functions. | Open |
| D-216 | 2026-07-30 | **The later audit-chain decisions are retained** — audit-chain scope, SHA-256 ratification, and the genesis rule. They block **Step 7H**, not the first migration. | Open |
| D-217 | 2026-07-30 | **No schema-critical or audit-chain decision was resolved, narrowed, or silently decided at Step 7E0C.** This checkpoint records acceptance only. | Accepted |
| D-218 | 2026-07-30 | **Step 7E0D — Schema-critical decision ratification is created and AUTHORIZED (authorization date 2026-07-30); Status Pending, Accepted No.** It is **documentation and architecture-decision work only** — **no SQL migration or application implementation is authorized**. It must resolve the seven Step 7E blockers, determining at minimum: the application profile ↔ `auth.users` key relationship; the table/reference strategy for roles and Class Grades; invitation lifecycle persistence; report lifecycle/status representation; audit target representation; the initial `GRANT` policy; and the exact first-migration boundary. | Accepted |
| D-219 | 2026-07-30 | **Step 7E may be authorized only after Step 7E0D is completed, committed, recorded and accepted.** | Accepted |
| D-220 | 2026-07-30 | **The former designation `Step 7E0-B` is retired** to avoid confusion with the completed `Step 7E0B` commit checkpoint; its remaining scope is carried by **Step 7E0D**. It was Pending, unauthorized and never started, so **no accepted history is affected**; its text is preserved as provenance. | Accepted |
| D-221 | 2026-07-30 | **The Figma Design 2 implementation handoff remains pending** — node-specific `/design/` frames, states, tokens and approved assets must be supplied or verified before UI implementation, and missing details must not be guessed. It **does not block Step 7E or schema work unless a missing visible field changes the domain relationship model**; it **does block** the corresponding UI implementation checkpoint. | Open |
| D-222 | 2026-07-30 | **Unchanged follow-ups carried forward** — hosted Supabase linking remains deferred (`supabase login` / `supabase link` require their own explicit checkpoint); the npm advisory state remains **3 high, 0 moderate, unresolved**, with no `npm audit fix` run; the AI Features Breakdown v2 remains missing and non-blocking for Phases 0–4. | Open |
| D-223 | 2026-07-30 | **Step 7E0C is documentation only** — exactly three in-repository progress files plus the workspace tracker changed; **no application code, schema, migration, dependency, Supabase configuration, Auth, seed, test, or Figma asset changed**; no typecheck, lint, build, test, container, or hosted operation ran; and **`.env.local` was never accessed, inspected, printed, hashed, parsed or copied**. | Accepted |
| D-224 | 2026-07-30 | **Step 7E0C stops before commit and does not self-accept** — no commit, tag, remote, or push was created, and the acceptance record itself awaits its own orchestrator-approved commit. | Accepted |
| D-225 | 2026-08-03 | **Step 7E0D1 schema-critical analysis is completed and accepted** — the read-only architecture analysis of Decisions A – G, together with the binding orchestrator correction rounds on Decisions A, B, D, E and F and the final integrated cross-decision review, is complete. It produced **no file, SQL, schema, Auth, runtime or repository change of any kind**; the repository remained at HEAD `6551d37` with a clean working tree and empty index throughout. **The analysis ratified nothing by itself.** | Accepted |
| D-226 | 2026-08-03 | **Centre seed values accepted as `ispeak` / `iSpeak Academy`** — the single MVP centre's code is **`ispeak`** and its display name is **`iSpeak Academy`**, confirmed by the orchestrator and recorded as the deterministic seed identity. These values are **recorded only — no centre row has been seeded and no seed file exists.** | Accepted |
| D-227 | 2026-08-03 | **Integrated Decisions A – G and their binding corrections accepted as the schema architecture** — centre-independent `accounts` with membership-scoped roles and no dual role authority (A); enum-versus-reference-table rules with centre-owned Class Grades and global nine-dimension reference data (B); Auth-owned secrets with no secret-bearing application column and transactional effective invitation expiry (C); the report aggregate/self-contained-version model in which **approval — not submission — freezes** (D); durable actor foreign keys with polymorphic, label-snapshotted audit targets (E); and deny-by-default privileges in which **the database role follows the credential, not the code location** (F), completed by the exact first-migration boundary (G). Every orchestrator correction issued during the review is part of the accepted architecture; the pre-correction formulations are superseded. | Accepted |
| D-228 | 2026-08-03 | **Exact Step 7E inventory accepted as 10 enums, 22 tables and 13 deterministic seed rows** — no more and no fewer. Seed UUIDs are **fixed literals across every environment**, and **mismatched pre-existing reference data must fail verification rather than be silently accepted** (never a silent upsert, never a quiet do-nothing). RLS is enabled on all 22 tables with **zero policies and zero client grants**; **no view, RPC or helper function, no extension, and no placeholder or dangling AI/evidence/audit/hash-chain column** is in scope. **The inventory is recorded, not created — no migration exists.** | Accepted |
| D-229 | 2026-08-03 | **Amendment 003 A-025 through A-032 established as the schema-architecture governance layer** — recorded at spec-amendment precedence so the schema decisions are not held only in a low-precedence tracker. Amendment 003 **clarifies rather than reverses Amendment 002** and **names no Amendment 001 clause**; Specification v3, Amendment 001 and Amendment 002 remain **byte-for-byte unchanged**. It resolves Amendment 002 items **U-12, U-16, U-17, U-18 and U-19**, and **explicitly leaves U-13, U-14 and U-15 open for Step 7H**. Precedence is now **v3 → 001 → 002 → 003 → `CLAUDE.md` → Implementation Plan → Figma Design 2 → `STATUS.md` → `BUILD_NOTES.md` → this tracker**. | Accepted |
| D-230 | 2026-08-03 | **Substantive ratification commit `b367475c180a2e4f4cf70ff1385f34b253356c33` accepted; Step 7E0D completed** — `docs(governance): ratify schema-critical MVP architecture`, parent `6551d37253e562a40d51e521b93c261daf7efdc9`, 2026-08-03 02:44:20 +0800, **3 files changed, 479 insertions(+), 37 deletions(-)** (1 created, 2 modified, 0 deleted, 0 renamed), resulting commit count **14**. One subject line only, no body, no trailer. It created Amendment 003 and reconciled `CLAUDE.md` and the Implementation Plan; it **changed no progress file**, so the tracker and committed migration copy stayed byte-identical across it. Sub-checkpoints **7E0D1**, **7E0D2A** and **7E0D2B** are all Completed and Accepted. | Accepted |
| D-231 | 2026-08-03 | **Step 7E remains blocked, unauthorized and unstarted and requires separate explicit authorization** — resolving the seven schema-critical blockers made Step 7E **eligible**, not **authorized**. **Amendment 003 governs schema architecture and migration boundaries; it is not an implementation authorization.** No SQL, migration file, `seed.sql`, Supabase function, Auth user, fixture, database type, application code, test, dependency, runtime process or Figma asset exists or has been created (tracked `.sql`: **0**; `supabase/migrations`, `supabase/seed.sql`, `supabase/functions`: **absent**). The **7E → 7F → 7G → 7H → 7I → 7J** sequence is preserved unchanged, and the **Figma Design 2 implementation handoff remains pending**. | Accepted |
| D-232 | 2026-08-03 | **Step 7E1A authoring and static review completed; migration required correction before acceptance** — the first governed-core migration was authored and staged as one file, **not applied and not committed**. Static review identified four items: **missing active normalized-email uniqueness** on `accounts`; **`full_name` versus `display_name`**; **incomplete role pinning** for the attendance recorder and the report-version author and submitter (centre-pinned only); and **the need to adjudicate `content_hash` precisely** rather than assume audit-chain deferral carried it. | Accepted |
| D-233 | 2026-08-03 | **Step 7E1B corrected migration accepted** — edited in place (not renamed, no corrective second migration) so that `accounts.display_name` is used, `accounts.normalized_email` is present and `CHECK`-normalized, **active normalized-email uniqueness** is enforced by a partial unique index over active accounts (deactivated history may repeat an email; two live identities cannot), `accounts` still has **no `centre_id` and no role column**, and the **attendance recorder, observation recorder, report author, report approver and report submitter are all trainer-role-pinned** with paired ID/role discriminators for the optional actors. **`content_hash` remains excluded under A-032** — Specification v3 §23 makes it audit-provenance data, its algorithm and canonical serialization are unratified (A-029; U-14), and "a column arrives with the checkpoint that gives it meaning", so it is deferred to Step 7H. The **exact 10-enum, 22-table and 13-seed boundary was unchanged** by the corrections. | Accepted |
| D-234 | 2026-08-03 | **Step 7E2A local migration application and catalogue verification passed** — migration version **`20260803034500`** applied to a **clean local disposable database only**, exit code **`0`**, recorded **exactly once**. The catalogue confirmed **10 enums** (exact ordered values), **22 application tables**, **44 foreign keys** (40 `RESTRICT`, 3 `CASCADE`, 1 `SET NULL`), **43 explicit indexes** (8 partial-unique, 35 supporting, all present), and **13 deterministic seed rows** with exact fixed UUIDs. **RLS enabled on all 22 tables, zero policies**, and **zero effective client table privileges** for `PUBLIC`, `anon`, `authenticated` and `service_role` measured by catalogue privilege functions. **Database lint: zero errors and zero warnings.** **No hosted database was accessed**; the local stack was stopped cleanly and the migration file remained byte-identical. **Recorded incident:** `supabase start` briefly printed disposable local JWT/S3 defaults because the first redaction filter did not match that output form; **no hosted credential and no `.env.local` value was exposed**, later output was redacted, and **future database-operation prompts must suppress all credential-bearing CLI output**. | Accepted |
| D-235 | 2026-08-03 | **The pre-existing `supabase_admin` default-ACL risk is carried into Step 7G as a mandatory privilege review** — that platform default may grant client privileges to **future objects created by that role**. It **did not affect the 22 Step 7E tables**, which are **`postgres`-owned and catalogue-verified at zero client privileges**. **Step 7G must inspect effective and default ACLs before adding any policy or grant**, so a policy-and-grant pair is not silently widened by an inherited platform default. **No default privilege was changed in Step 7E.** | Accepted |
| D-236 | 2026-08-03 | **Substantive migration commit `252ef9b13008629cadc238bdf58b7016c50bb7b2` accepted; Step 7E completed and accepted** — `feat(supabase): add governed core schema migration`, parent `584691ebe8b12e8b0eb0d56ca38db259d59ec949`, `2026-08-03 04:37:05 +0800`, **1 file changed, 1,209 insertions, 0 deletions**, `create mode 100644`, resulting commit count **16**. One subject line only, no body, no trailer. The committed blob is **byte-identical** to the locally verified migration (SHA-256 `422be2850c6913ca040bc54b90902df8eaaf35d66492230553e65ab1b3f8db54`, 66,809 bytes, 1,209 lines) and **changed no progress file**. Sub-checkpoints **7E1A**, **7E1B**, **7E2A** and **7E2B** are all Completed and Accepted. | Accepted |
| D-237 | 2026-08-03 | **Step 7F remains unauthorized and unstarted and requires separate explicit orchestrator authorization** — the Step 7E authorization was **bounded to Step 7E alone** and did not extend to any later checkpoint. **No Auth user (0 in `auth.users`), fixture, RLS policy, client grant, RPC, view, function, trigger, audit object, generated database type, application code, test or Figma asset exists**; `supabase/seed.sql` and `supabase/functions` remain absent. The **7F → 7G → 7H → 7I → 7J** sequence is preserved unchanged, the **Figma Design 2 implementation handoff remains pending**, and invitation duration, session lifecycle, evidence ownership, audit-chain mechanics and restricted function-owner hardening all remain **unresolved and not silently decided**. | Accepted |
| D-238 | 2026-08-03 | **Step 7F0A synthetic fixture design completed as read-only analysis** — the minimum synthetic dataset supporting later Management, Trainer and Parent proof was designed, and **Option B was recommended**: one observation and nine mixed observation ratings, with no report aggregate, no report version, no approval, no checklist evidence and no invitation. **No repository or database change occurred** — no file created, modified or deleted; no Auth user; no fixture; no database or hosted command. | Accepted |
| D-239 | 2026-08-03 | **Step 7F0B fixture mechanics resolved from installed local sources only** — `AdminUserAttributes.id` is documented and type-supported in `@supabase/auth-js` `2.110.8` and `createUser` forwards the body verbatim to the ordinary admin endpoint, so **caller-supplied deterministic Auth UUIDs are supported** and direct `auth.users` insertion, password hashes and unsupported casts remain prohibited. The **runtime-generated Auth UUID fallback was withdrawn**, the **complete deterministic checksum includes `accounts.auth_user_id`**, credential acquisition is **process-memory only** with **no-echo interactive passwords**, and reload/recovery is **bounded and compensating**. **No implementation occurred.** | Accepted |
| D-240 | 2026-08-03 | **The orchestrator ratified exactly three synthetic Auth identities and the exact fixture baseline of 3 Auth users and 25 application-domain rows** — `Fixture Manager One` / `management.fixture@example.test` / Auth `d0000000-0000-4000-8000-000000000001` / account `c0000000-0000-4000-8000-000000000001` / membership `c1000000-0000-4000-8000-000000000001`; `Fixture Trainer One` / `trainer.fixture@example.test` / Auth `d0000000-0000-4000-8000-000000000002` / account `c0000000-0000-4000-8000-000000000002` / membership `c1000000-0000-4000-8000-000000000002`; `Fixture Parent One` / `parent.fixture@example.test` / Auth `d0000000-0000-4000-8000-000000000003` / account `c0000000-0000-4000-8000-000000000003` / membership `c1000000-0000-4000-8000-000000000003`. The footprint is **15 core rows and 10 assessment rows**, with **no Student Auth identity**. Full values are fixed in `docs/plan/STEP_7F_SYNTHETIC_FIXTURE_BASELINE.md`. | Accepted |
| D-241 | 2026-08-03 | **Option B ratified — one observation and nine mixed observation ratings, with all report, approval, checklist and invitation tables remaining empty** — `reports`, `report_versions`, `report_version_ratings`, `report_version_checklist_progress`, `report_version_approvals` and `invitations` all stay at **zero rows**, so **no report lifecycle, approval, publication, invitation-acceptance or Management-bootstrap transition is fabricated**. Attendance is `present` with **recorder membership and role both NULL**, representing default roster initialization rather than a trainer action. | Accepted |
| D-242 | 2026-08-03 | **A local-only Node ESM loader plus static transactional SQL was ratified as the delivery mechanism** — with verification and negative-test SQL, **one** future package script and **no new dependency**; Auth users are created through the **local Auth Admin API** and domain rows load through **local-container `psql`**. Explicitly excluded: **no `supabase/seed.sql`, no second migration, no direct `auth.users` insertion, no password hash and no invitation row**. Passwords are entered **only through no-echo interactive stdin in an operator-controlled local terminal** and may never enter chat, environment variables, tracked or untracked files, logs, errors or reports; **no pattern-based redaction** is used and credential-bearing stdout and stderr remain **captured and unrendered**. | Accepted |
| D-243 | 2026-08-03 | **Fixture provisioning is not the production Management-bootstrap mechanism** — creating a fixture management identity does **not** constitute, design or resolve it, and must never later be cited as having done so. **N-4 / U-23 remains unresolved.** The minimal fixture is a **deliberate Phase 0 exception** to the broader fixture shape in `CLAUDE.md` §11, and the broader **two-trainer / two-module / multi-student** dataset **plus a second Class Session** remains a **later additive Phase 1 requirement — deferred, not deleted**, and required before the Phase 1 grounding-validation contradiction proof and the follow-up continuity proof. | Accepted |
| D-244 | 2026-08-03 | **Substantive fixture-design commit `936cf4e9b131b99943db6724bfb6eb9b23c07050` accepted; the Step 7F design is ratified** — `docs(fixtures): ratify synthetic fixture baseline`, parent `20e3650be26c0f40fda32078da32398c924e2672`, dated `2026-08-03 07:31:15 +0800`, **3 files changed, 495 insertions(+), 5 deletions(-)**, one file created, subject line only with **no body and no trailer**. It contains exactly `CLAUDE.md`, `docs/plan/BEST_Coach_Implementation_Plan.md` and `docs/plan/STEP_7F_SYNTHETIC_FIXTURE_BASELINE.md`. A **malformed initial Git invocation (`--no-verify=false`) was rejected by Git before any commit object was created and caused no repository change**; HEAD was re-verified at `20e3650` with the same three files staged before the single clean commit was made. | Accepted |
| D-245 | 2026-08-03 | **Step 7F implementation remains unauthorized and unstarted and requires separate explicit orchestrator authorization** — ratifying the fixture design made Step 7F **ready**, not **authorized**. No fixture script, SQL fixture file, `seed.sql`, migration, Auth user, fixture row, policy, grant, RPC, application code, test or Figma asset exists; `scripts/`, `supabase/seed.sql` and `supabase/functions` are **absent**. The accepted sequence **7F → 7G → 7H → 7I → 7J** is preserved unchanged, and **Step 7G must still begin with the P-1 `supabase_admin` default-ACL privilege review**. | Accepted |
| D-246 | 2026-08-03 | **Step 7F is implemented, runtime-proven and accepted, delivering exactly the ratified fixture scope** — **3 deterministic Auth users** (management, trainer, parent), **25 application-domain rows** and **28 canonical checksum rows**, anchored on **1 centre**, Class Grade **`beginner`**, **1 student**, **1 parent-student link**, **1 Class Module**, **1 Class Session**, **1 enrolment**, **1 trainer assignment**, **1 `present` attendance row**, **1 observation** and **nine mixed observation ratings**, with **zero** reports, report versions, report-version ratings, checklist-progress rows, approvals and invitations, and **no Student Auth identity**. Created in the **local disposable database only**; **no hosted database was accessed** and the project has never been linked. | Accepted |
| D-247 | 2026-08-03 | **The determinism proof is accepted** — the bounded `--reload` passed, a **duplicate clean load was rejected before password prompting and made no mutation**, and **two independent reset-and-clean-load cycles** passed. Operator **Checksums A, B and C were identical**, and **independent verification reproduced the same value**: canonical SHA-256 **`d6a314b40bb5eb1bc3169097e2a9cb03858791498ca5137a43050cee36b87517`**. Every command **exited normally** without an operator interrupt. | Accepted |
| D-248 | 2026-08-03 | **The verification suite and post-fixture database posture are accepted** — **37 positive assertions passed**, **all 7 negative tests passed**, and the **negative tests left no residue**. The Step 7E seeds remained **1 centre, 3 grades and 9 dimensions**, exactly **one** migration is applied (`20260803034500`), **RLS is enabled on all 22 tables**, and there are **zero policies** and **zero unintended privileges** for `anon`, `authenticated`, `service_role` and `PUBLIC`. Loading fixtures **did not weaken the deny-by-default posture** established at Step 7E. | Accepted |
| D-249 | 2026-08-03 | **Five corrective incidents were found, proven and resolved before acceptance, and are recorded rather than elided** — (1) the **first operator attempt was blocked** because the execution channel lacked a **genuine interactive TTY**, and no alternative password path was substituted; (2) the initial **Windows password handler converted stdin chunks to strings while comparing numeric byte codes**, so **Enter and Ctrl+C were never recognized**; (3) the **domain SQL operation guard placed psql variables inside a dollar-quoted block**, where psql performs no substitution, producing **SQLSTATE 42601**; (4) **verification tests N2, N3 and N4 reached unrelated constraints before their intended constraints** and were corrected to isolate the intended invariants; (5) **stdin remained referenced after completion**, preventing Node from exiting automatically, and the loader lifecycle was corrected. **All corrected paths were subsequently proven** by operator and independent runtime verification. | Accepted |
| D-250 | 2026-08-03 | **The fixture implementation commit `e197f91bbdf3196ef8e0eeee8216d6e7d8e495a7` is accepted** — `feat(fixtures): add deterministic local fixture baseline`, parent `098d0eaf2bcba912c366aee6789813410df86b48`, `2026-08-03 23:07:57 +0800`, **5 files changed, 2,208 insertions(+), 1 deletion(-)**, three files created, subject line only with **no body and no trailer**. It contains exactly `docs/plan/STEP_7F_SYNTHETIC_FIXTURE_BASELINE.md`, `package.json`, `scripts/fixtures/load-local-fixtures.mjs`, `scripts/fixtures/local_fixtures.sql` and `scripts/fixtures/verify-local-fixtures.sql`. **Committed locally only — no remote exists and nothing was pushed.** | Accepted |
| D-251 | 2026-08-03 | **The accepted post-Step-7F operational state is recorded** — the local Supabase stack was **stopped only after independent verification** and **no Supabase container remains** (Docker Desktop may remain running); the repository was **clean after the implementation commit**; fixture **passwords remain operator-controlled, hidden and non-persistent**, entered only through no-echo interactive stdin and never placed in chat, a file, a log, an error, a report, an environment variable or an argument; and the loader supports a **clean load** and an **explicit bounded `--reload`** only. **Production Management bootstrap (N-4 / U-23) remains unresolved and is not replaced, defined or discharged by synthetic fixtures.** | Accepted |
| D-252 | 2026-08-03 | **Step 7F is complete, and the next implementation checkpoint is Step 7G, which is neither started nor authorized by this record** — **Step 7G must begin with the P-1 `supabase_admin` default-ACL review**, inspecting effective **and** default ACLs in schema `public` **before** any policy or grant is added, so a policy-and-grant pair is not silently widened by an inherited platform default. The accepted sequence **7F → 7G → 7H → 7I → 7J** is preserved unchanged, and the broader `CLAUDE.md` §11 fixture shape — **2 trainers, 2 modules, 3–4 students per module, 2 parents and a second Class Session** — remains a **later additive Phase 1 requirement, deferred and not deleted**. | Accepted |
| D-253 | 2026-08-04 | **P-1 is resolved by the Step 7G1A default-ACL audit** — migration objects are created by **`postgres`**; all **22** Step 7E tables are `postgres`-owned; the **`postgres` public default ACLs are hardened** (owner-only, established by the Step 7E migration itself) and grant no automatic client access; **`supabase_admin` retains broad public default ACLs** for objects it creates, which **never applied** because every project migration executes as `postgres`; the Step 7G migration opens with a **fail-closed `current_user = 'postgres'` guard**; both default-ACL sets were verified **unchanged after application**; and **any future object creation under `supabase_admin` remains a privilege event requiring re-audit**. | Accepted |
| D-254 | 2026-08-04 | **The delivered Step 7G authorization scope is accepted** — exactly **six** public helpers (`app_current_account_id`, `app_has_active_membership`, `app_is_own_membership`, `app_is_own_active_membership`, `app_trainer_reaches_session`, `app_trainer_reaches_module`), all **STABLE · SECURITY DEFINER · search-path pinned · created through the `postgres` migration path · EXECUTE for `authenticated` only**; exactly **29 permissive SELECT policies** over exactly the **13 identity/roster tables**; `authenticated` receives **SELECT only** with **no INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER**; **`anon`, `service_role`, `authenticator` and `PUBLIC` retain zero project-table privileges** — `service_role` deliberately ungranted because it carries **BYPASSRLS**; the **nine out-of-scope tables** (invitations, assessment_dimensions, observations, observation_ratings, reports, report_versions, report_version_ratings, report_version_checklist_progress, report_version_approvals) retain **zero policies and zero authenticated privileges**; and **no view, trigger, extra schema, default-privilege change or ownership change** was introduced. | Accepted |
| D-255 | 2026-08-04 | **The accepted Step 7G role behaviour is recorded** — **Management:** centre-scoped read of the in-scope identity/roster layer including lifecycle states, restricted to the managed centre, **no cross-centre visibility**. **Trainer:** own account/membership/profile; roster and calendar **only** through active trainer-assignment relationships; **no parent account or profile visibility**; no unrelated or unassigned trainer/session access. **Parent:** own account/membership/profile; linked-student visibility only through an **active** parent-student link; calendar/class access only through the linked student's **active** enrolment; no other parent, child, trainer or centre-wide roster access. All paths derive **live** from `auth.uid()` → `accounts.auth_user_id` → an active membership, remain **centre-aware**, and **inactive relationships confer no authority**. | Accepted |
| D-256 | 2026-08-04 | **The Step 7G runtime proof is accepted** — applied as the **second** project migration (`20260803034500`, `20260803154500`); **22 tables RLS-enabled, FORCE on none**; **all 39 visibility-matrix cells passed with deterministic IDs**; anon denied (42501); missing/unknown authenticated identity returned **zero rows**; all nine out-of-scope tables denied; **`service_role` denied on all 22 despite BYPASSRLS**; authenticator denied; authenticated INSERT/UPDATE/DELETE denied; helper EXECUTE denied to anon/service_role/authenticator; the inactive-account, inactive-membership, inactive-link, inactive-enrolment and inactive-assignment tests failed closed; the unrelated-child, unrelated-session, another-trainer and second-centre decoys stayed invisible; **management lifecycle visibility never became trainer or parent authority**; every decoy rolled back with **zero residue**; and the fixture remained **3 Auth users / 25 rows / 28 canonical rows / SHA-256 `d6a314b40bb5eb1bc3169097e2a9cb03858791498ca5137a43050cee36b87517` / seed 1-3-9**. | Accepted |
| D-257 | 2026-08-04 | **The fixture-verification reconciliation is accepted** — the Step 7F suite carried **five superseded assumptions** (A32 zero policies; A33 zero client privileges; A34 one migration; A35 one migration version; D5 zero policies after rollback), reconciled to the accepted Step 7G posture while **A1–A31, all seven negative data-integrity tests, and the canonical serialization and checksum logic remained unchanged**. The reconciled suite verifies **2 migrations · 22 RLS-enabled tables · 29 policies · 6 helpers · the exact grants and denials · no views or user triggers**, and **passed twice with the identical canonical checksum and no residue**. | Accepted |
| D-258 | 2026-08-04 | **The two Step 7G commits are accepted** — `17d7ddc4e7264ffe0a545d3830813af94b7ac688` (`feat(authz): add relationship-scoped read policies`, parent `0cd6dd796f27cb7624409685eb3c299bfe6688be`, **1 file, 938 insertions**) and `97f3fb2ed05f7fc3ddcec5e3f5e13b15da668b1f` (`test(fixtures): reconcile verification with relationship policies`, parent `17d7ddc…`, **1 file, 203 insertions, 31 deletions**) — both subject-line only, **local only; no remote exists; nothing was pushed; the repository was clean after each commit**. | Accepted |
| D-259 | 2026-08-04 | **The post-Step-7G operational and unresolved state is recorded** — Supabase was **stopped after runtime verification** with the migrations and fixture **preserved in the Docker volume**; **production Management bootstrap N-4 remains unresolved** and synthetic fixture identities do not replace it; assessment writes, report lifecycle, audit chain, RPCs, server actions and publication remain **outside Step 7G**; **no write policy was introduced**; service-role use remains a **trusted server-only boundary**; and **audit-chain items A-1 … A-6 remain unratified**. | Accepted |
| D-260 | 2026-08-04 | **Step 7G is complete; the next implementation checkpoint is Step 7H, which is neither started nor authorized by this record** — Step 7H concerns the **audit-chain design and implementation sequence**, and **A-1 … A-6 (chain scope, SHA-256 ratification, genesis rule, canonical serialization, hash-application/previous-hash rules, verification and repair) must be explicitly reconciled and ratified before any audit-chain SQL is authored**. The accepted sequence **7F → 7G → 7H → 7I → 7J** is preserved unchanged. | Accepted |
| D-261 | 2026-08-04 | **Audit-chain item A-1 (scope and threat model) is ratified** — **one independent chain per centre**, protecting governed business history under the **application threat model**: it detects accidental or unauthorized alteration **below database-superuser level** and **cannot independently prove integrity against a superuser able to rewrite the chain and anchors**; external mirror/anchoring remains **deferred to Phase 4**; **no client audit-read exists in the MVP**; fixture and authentication activity are **excluded**; report-lifecycle events belong to **Step 7I**; attendance, management, roster, invitation and role-change events belong to **their later governed RPC checkpoints**. | Accepted |
| D-262 | 2026-08-04 | **Audit-chain item A-2 (hashing and atomicity) is ratified** — **SHA-256** via PostgreSQL **core `sha256(bytea)`** with **no extension**; hashes are computed **inside PostgreSQL**; a governed mutation and its required audit append occur in the **same transaction**, with **no split transaction permitted**; callers can **never supply `entry_hash` or `previous_hash`**. | Accepted |
| D-263 | 2026-08-04 | **Audit-chain item A-3 (partition, genesis and concurrency) is ratified** — partition key **`centre_id`**; chain order is the **dense `seq_no`**, never timestamps; **no head row exists before the first append**; the first append atomically **seed-or-skips** a head row at **`last_seq = 0`** with a **domain-separated centre-specific genesis hash**, then locks the head with **`SELECT … FOR UPDATE`**; the ratified **READ COMMITTED protocol guarantees exactly one sequence-1 event** under concurrent first writers; future centres receive independent chains **without redesign**; transaction-scoped advisory locks are **technically valid but rejected as unnecessary indirection**, not as impossible. | Accepted |
| D-264 | 2026-08-04 | **Audit-chain item A-4 (canonical serialization) is ratified** — domain prefix **`BESTCOACH-AUDIT-V1`**; a **versioned fixed-field length-prefixed envelope** with explicit SQL NULL/value representation, deterministic lowercase UUID and hash forms, and **UTC timestamps with six fractional digits and `Z`**; a **recursive deterministic JSON serializer** with object keys sorted by **UTF-8 byte order (not native jsonb order)**, order-preserving arrays, specified number normalization and exhaustive control/quote/backslash escaping; **SQL NULL, JSON null and the text `"null"` remain distinct**; raw UTF-8 with **no Unicode normalization**; **`payload_canonical` must parse back to the stored jsonb payload**; the serialization is **independently reproducible using PostgreSQL core functionality only**. | Accepted |
| D-265 | 2026-08-04 | **Audit-chain item A-5 (append protocol and authority) is ratified** — the proposed entry point **`audit_append_event`** is **VOLATILE · SECURITY DEFINER · postgres-owned · search-path pinned · no dynamic SQL · no client EXECUTE**; it **validates the authenticated actor against `auth.uid()` and live active account/membership relationships**, so authenticated callers **cannot spoof the actor triple**; system/operator events require **`auth.uid()` NULL, a jointly-NULL actor triple and a registry-approved system action**; the append **locks the centre head, allocates the next sequence, computes the hash, and inserts the event, target rows and head update atomically**; committed events and targets are **never updated or deleted**; clients hold **zero direct privileges** on audit tables; there is **no global audit-level idempotency claim** — **every governed RPC must provide its own deterministic CAS, uniqueness or operation-idempotency gate**, and business-create operations without a natural CAS must define deterministic RPC-level idempotency **before** append. | Accepted |
| D-266 | 2026-08-04 | **Audit-chain item A-6 (verification and incident handling) is ratified** — the proposed **`audit_verify_chain`** is **read-only with no client EXECUTE**, verifying sequence continuity, previous-hash continuity and genesis, canonical reconstruction, hash recomputation, stored-head agreement, partition isolation, payload/target consistency and event-registry conformance; it supports **explicit complete and partial modes** — a partial range **records its predecessor anchor and cannot claim complete-chain integrity**, and stored-head agreement applies **only when the checked range reaches the tip**; there is **no silent or automatic repair and no in-place alteration** of committed audit evidence; **an integrity failure is an incident** — evidence is preserved/exported before action, and legitimate corrections are **new events**; mirror, alerting, cadence, retention and repair tooling remain **Phase 4** concerns. | Accepted |
| D-267 | 2026-08-04 | **The minimum proposed Step 7H object inventory is ratified as design, not implementation** — tables **`audit_events`**, **`audit_event_targets`** and **`audit_chain_heads`**; functions **`audit_canonical_json`**, **`audit_append_event`** and **`audit_verify_chain`**; guard triggers denying **UPDATE/DELETE on `audit_events`**, **UPDATE/DELETE on `audit_event_targets`** and **DELETE only on `audit_chain_heads`** — the append function legitimately INSERTs and UPDATEs the head row, and **no spoofable session-variable bypass is permitted**. **These are ratified design objects; none exists as a database object.** | Accepted |
| D-268 | 2026-08-04 | **The Step 7H event/checkpoint boundary is ratified** — Step 7H implements **reusable audit-chain infrastructure and verification only**; Step 7H runtime decoys must **roll back and leave the real chain empty**; **Step 7I** remains responsible for report-lifecycle RPCs/server actions and their audit appends; later Phase 1 governed RPC checkpoints own attendance, management, roster, invitation and role events; **N-4** owns production management-bootstrap resolution; **no report lifecycle is pulled into Step 7H**. | Accepted |
| D-269 | 2026-08-04 | **The Step 7H acceptance-test contract is ratified as future proof categories** — postgres migration-role guard; ownership and default-ACL preservation; zero direct client audit-table writes; append/verify execution restrictions; deterministic genesis and serialization; sequential and concurrent append; rollback atomicity; per-RPC duplicate gating; actor-spoofing denial; tamper and head-mismatch detection; complete/partial verification semantics; cross-centre isolation; unauthenticated, trainer and parent non-enumerability; service-role posture; zero repair mutation; fixture/checksum preservation; and Step 7G authorization preservation. | Accepted |
| D-270 | 2026-08-04 | **The unresolved-but-non-blocking state is recorded** — **N-4 (production management bootstrap) remains unresolved** and synthetic fixtures do not replace it; the **report status vocabulary binds in Step 7I** under the existing accepted decision (A-028); automatic integrity-failure response, audit retention/PDPA, verification cadence and external-anchor mechanics all remain **Phase 4**; **none of these blocks Step 7H audit-chain SQL authoring**. | Accepted |
| D-271 | 2026-08-04 | **The committed audit-chain design baseline is accepted** — commit **`3e479b69b1a4cd3592daf3edc321e92929002dbb`** (`3e479b6`, `docs(audit): ratify audit-chain design baseline`, parent `6ba61596b524df77ca5366c19b4521f3041f0072`, **1 file, 378 insertions(+)** — `docs/plan/STEP_7H_AUDIT_CHAIN_BASELINE.md`, SHA-256 `da5b0aea3c7a0640847944d9e5ce6371ac5b07fc5470af0c091ca37251362755`, 378 lines, 52,012 bytes); **local only, no remote, nothing pushed, repository clean after the commit**. | Accepted |
| D-272 | 2026-08-04 | **The Step 7H design phase is complete; audit-chain SQL and Step 7I remain unstarted** — **A-1 … A-6 are fully ratified**; the **next bounded checkpoint may author and stage one Step 7H audit-chain migration for static review** and **must stop before local application or commit**; no other implementation becomes authorized automatically. | Accepted |
| D-273 | 2026-08-05 | **Step 7H migration application and primary Codex runtime proof accepted.** — Migration `20260804213000` applied locally with pinned Supabase CLI `2.109.1` (exit `0`, `1,471 ms`); B1–B20 and the serializer, authority, append, concurrency, rollback, append-only, verifier, tamper, isolation, preservation and repeatability proofs passed; the 41 non-concurrency result rows repeated at SHA-256 `fa0155c657679955cecb89090e1a390f0b9b821a5c0de59664c4e226f9a2c2e5`. | Accepted |
| D-274 | 2026-08-05 | **Independent Step 7H Codex verification accepted.** — A separate fresh Codex chat independently reread the governing sources, reran live B1–B20, constructed and hashed the full 17-line envelope, reproduced every required proof class, found no design/migration/primary-proof discrepancy, corrected and cleaned one external harness issue, and proved zero residue. | Accepted |
| D-275 | 2026-08-05 | **Step 7H migration committed.** — Commit `ef2252119babee1714b335ac43b6bf4bbd4ee582` (`ef22521`), subject `feat(audit): add tamper-evident audit chain`, parent `88f0fe2d941ddece5babb2dfa8efef4079cdc783`, exactly one file and 1,550 insertions; local only, no remote and nothing pushed. | Accepted |
| D-276 | 2026-08-05 | **Preserved fixture and empty-chain state accepted.** — Auth `3`; domain rows `25`; canonical rows `28`; checksum `d6a314b40bb5eb1bc3169097e2a9cb03858791498ca5137a43050cee36b87517`; audit events/targets/heads `0/0/0`; committed zero heads, decoy residue and disabled user triggers `0`; local stack stopped with volumes preserved and no lingering proof process. | Accepted |
| D-277 | 2026-08-05 | **Fixture-verifier reconciliation scope fixed to A32/A33/A34/A35/A38/D5.** — The committed verifier remains unchanged at SHA-256 `d568793335fbaeff568f70905082d4e3b756e4252a453936b6a6d25eb062b52b`; only the six recorded Step 7H object-census expectations may change, while domain, checksum, authorization and seven negative-test semantics remain unchanged; reconcile and run the complete verifier twice before final Step 7H acceptance. | Accepted |
| D-278 | 2026-08-05 | **Codex-to-Claude handoff boundary and next checkpoint accepted.** — The temporary tool transition changed no scope or governance; Claude Code may resume only at the bounded fixture-verifier reconciliation checkpoint; Step 7H final acceptance remains pending and Step 7I remains unstarted. | Accepted |
| D-279 | 2026-08-05 | **Step 7H fixture-verifier reconciliation accepted.** — `scripts/fixtures/verify-local-fixtures.sql` was reconciled to the applied Step 7H audit-chain migration, changing **only** the six labelled assertion areas **A32, A33, A34, A35, A38 and D5**: A32/A33 extend the RLS, policy and privilege census from 22 to **25** project tables (the 3 audit tables added to every zero-policy/zero-privilege sweep); A34 extends the applied-migration set from 2 to **3** (`20260803034500`, `20260803154500`, `20260804213000`); A35 extends the public-function census from 6 to **10**, preserving the six Step 7G helper checks unchanged and adding four exact per-function contract checks (identity signature via the same `regprocedure` form the migration's own `REVOKE` statements use, postgres ownership, volatility, strictness, parallel-safety, `SECURITY DEFINER`/`INVOKER`, pinned search path, and zero `EXECUTE` for every client role including `PUBLIC`) for `audit_canonical_json`, `audit_append_event`, `audit_verify_chain` and `audit_block_mutation`; A38 replaces the obsolete combined zero-view/zero-trigger assumption with independent zero-view and zero-materialized-view checks plus an exact inventory of the three enabled Step 7H guard triggers (name, owning table, bound function, `tgtype`, enabled state); D5 extends its function census to 10, extends its zero-privilege table sweep to 25, and adds a new check that all three guard triggers remain enabled after the negative-test rollback. **A1 … A31, A36, A37, all seven negative tests (N1 … N7) including every expected constraint name and scratch UUID, the entire canonical-checksum region (Section B), and the D1 … D4 rollback-residue checks are byte-unchanged** — proven by two independent adversarial subagents (a containment/regression reviewer confirming every diff hunk falls inside the six labels with zero touches outside them and no weakened comparison, and a catalogue/ACL/trigger reviewer confirming every new assertion traces correctly to the committed migration's actual `CREATE TABLE`/`CREATE FUNCTION`/`CREATE TRIGGER`/`REVOKE` statements and its own B1–B20 self-check) and by the parent agent's own hunk-boundary and label-completeness analysis. | Accepted |
| D-280 | 2026-08-05 | **Reconciled fixture-verifier repeatability proof accepted.** — Before any edit, a read-only preflight independently proved the preserved database state (migrations exactly `20260803034500`/`20260803154500`/`20260804213000`; Auth `3`; domain rows `25`; canonical rows `28`; checksum `d6a314b40bb5eb1bc3169097e2a9cb03858791498ca5137a43050cee36b87517`; audit events/targets/heads `0/0/0`; zero committed-zero heads; zero decoy residue; zero disabled guards; policies `29`; helpers `6`; authenticated SELECT `13`) using the untouched Section-B canonical-region logic and independent read-only queries. The edited verifier then ran **twice pre-commit** through the documented `docker exec -i supabase_db_best-coach-mvp psql --no-psqlrc --username=postgres --dbname=postgres --set=ON_ERROR_STOP=1 --set=VERBOSITY=verbose --quiet` contract with no substitution, no reduction, no skipped assertion and no edit between runs: both exits `0`, both emitting `SECTION A: all positive assertions passed`, `SECTION C: all 7 negative tests were correctly rejected`, `SECTION D: rollback left no residue; fixture, Option B, seed and audit-guard boundaries all intact`, both reproducing canonical checksum `d6a314b4…` over **28** rows, and both byte-identical in full stdout (SHA-256 `3073041500c43e6ad824bf8b0baee777f8d0e352c74cb1814bee8ccd9c6b919d`) and full stderr (SHA-256 `92ffdadea78736e8dee50f7c36f49142f87589ec1084fd516c7e8ad017a4ec15`). An independent post-run read-only re-check reproduced every precondition value unchanged. Supabase was then stopped with all three volumes preserved and zero lingering process confirmed. | Accepted |
| D-281 | 2026-08-05 | **Step 7H fixture-verifier commit accepted.** — Committed as **`617ca4b29471625c1bc13c91ae66605e9eca72dc`** (`617ca4b`, `test(fixtures): reconcile verifier with audit chain`, parent `643d973ac9162be2f7aebb8ba9b825e7a9626165`, **1 file, 206 insertions, 42 deletions**; resulting commit count **29**); committed blob verified identical to the exact bytes both pre-commit runs tested (SHA-256 `049cc7d402904e7fb5ccae8f70431589f787d3827acdd1c3b7973ff7bcb5b3d4`, 1,010 lines, 56,099 bytes). Local only; nothing pushed; clean tree after the commit. | Accepted |
| D-282 | 2026-08-05 | **Final Step 7H fixture and authorization preservation accepted.** — Supabase was restarted from the preserved volume (no reset, no reapplied migration) and the committed verifier — confirmed byte-identical to the tested bytes — ran **twice post-commit** through the identical documented contract: both exits `0`, both emitting the same three section notices, and both byte-identical to each other **and** to both pre-commit runs (same stdout SHA-256 `3073041…`, same stderr SHA-256 `92ffdad…`) — four independent runs, zero divergence. A final independent read-only re-check reproduced every required value unchanged: migrations exactly the three accepted versions; Auth `3`; domain `25`; canonical `28`; checksum `d6a314b4…`; policies `29`; helpers `6`; authenticated SELECT `13`; audit events/targets/heads `0/0/0`; zero committed-zero heads; zero residue; zero disabled guards. Supabase was stopped with all volumes preserved and zero lingering process confirmed; the committed verifier was not edited after this proof. | Accepted |
| D-283 | 2026-08-05 | **Step 7H audit-chain implementation fully accepted.** — The complete Step 7H sequence — design ratification (`3e479b6`), adversarial design review, migration authoring and static review, Codex primary runtime proof (7H1D) and independent fresh-chat verification (7H1E), migration commit (`ef22521`), the Codex-to-Claude handoff (`643d973`), and this session's fixture-verifier reconciliation, dual pre/post-commit repeatability proof and commit (`617ca4b`) — is **complete and accepted**. Delivered: 3 postgres-owned RLS audit tables with zero policies and zero client privileges; 4 postgres-owned functions (`audit_canonical_json`, `audit_append_event`, `audit_verify_chain`, `audit_block_mutation`) with zero client `EXECUTE` including `PUBLIC`; 3 enabled append-only guard triggers; the Step 7G posture (29 policies, 6 helpers, 13-table authenticated SELECT set) and the Step 7F fixture (3 Auth users, 25 domain rows, 28 canonical rows, checksum `d6a314b4…`) preserved byte-for-byte throughout. **The audit infrastructure is reusable plumbing only and remains empty until a future governed RPC calls `audit_append_event`** — this record appends no audit event and authorizes none. Production management bootstrap (N-4) remains unresolved but does not reopen or block Step 7H. Phase 4 items (external mirror, alerting, retention, verification cadence) remain deferred, unchanged from the ratified design. | Accepted |
| D-284 | 2026-08-05 | **Step 7I remains unstarted; design reconciliation is the next checkpoint.** — No report-lifecycle table, RPC, server action, UI component or generated database type exists. The accepted sequence **7F → 7G → 7H → 7I → 7J** is preserved unchanged. The next bounded checkpoint is a read-only Step 7I design reconciliation — the report-lifecycle object/operation boundary, the A-028 status vocabulary, the report-created/version-created/state-changed audit event contract, the two-event Approve & Submit requirement, CAS/idempotency boundaries, trainer/management/parent authorization boundaries, immutable submitted-snapshot and reapproval requirements, and the AI-publication prohibition — before any Step 7I SQL, RPC, server action, UI or generated type may be authored. | Accepted |
| D-285 | 2026-08-05 | **Step 7I1G baseline verification accepted.** — The working directory was resolved explicitly to the MVP repository (`git rev-parse --show-toplevel` → `C:/Users/enyul/Vibe Studio/B.E.S.T-Coach-Workspace/SDS Project Final (BEST Coach)`) before any command ran. Branch `main`; HEAD `42d3c0292d7bc9e6442c4d4fc2398e5ee25de1a6`; commit count `30`; no tag, no remote, no upstream. Exactly five staged files and **zero** unstaged, **zero** untracked. For each of the five, the staged blob and the worktree file were hashed independently, proved **byte-identical**, and matched the expected SHA-256 exactly: `CLAUDE.md` `f57c6e1b563319a69e3a71b1cfa5c8ba2bb3f31420daedff6ff9825875df5421`; `docs/plan/BEST_Coach_Implementation_Plan.md` `1c5165c448f8f6438ea0f0a49649ae26c8666c07fe564919fbafb951713475c3`; `docs/plan/STEP_7I_REPORT_LIFECYCLE_BASELINE.md` `796bcdf71b2fa002f1b4b8acdf03f04c7520f395913a416b26236b74c30e7226`; `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_004.md` `dd631d80b9695bba9d3ca6ec0bdfdd332b646a9039597ee11ff5500dff6d4a95`; `docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md` `ec8d5893820e95bed3c89b11675baa6129bd07e1bf08c7b71b16e38052280af4`. Nothing was reset, restored, unstaged, stashed or discarded. | Accepted |
| D-286 | 2026-08-05 | **Step 7I final design verification passed on every required point.** — **T7I-69's path is exactly `T11 → T12 → RPC-7 → T8 → T9 → T11`** with T6 deliberately absent, and every step is legal against the fourteen-pair matrix; **T7I-75 directly proves R-7a** by driving the report through `T7 → T10` so the frozen already-trainer-approved version is the candidate at a legal `needs_edit`, making the prior-approval gate the sole barrier, with five explicit error-distinctness assertions and nil residue including the correction request left `open`; **tests are exactly T7I-1 … T7I-75, contiguous**, each ID appearing once; **`R(C)` is exactly T7I-15, T7I-16, T7I-46 and T7I-61**, and **T7I-69 is `R(D)` with no concurrent leg**; Amendment 004, `CLAUDE.md` and the Implementation Plan **agree on supersession**; **A-021 has four management-scoped superseded bullets**, enumerated identically in all three; **v3 §14.1 is named nowhere and is not superseded**, and its Child Progress Digest trainer-approval rule stands; **A-028's `submitted → needs_edit` rule is preserved as T12**; the Figma inventory is **eight families in §0.1, the same eight rows in §1, and nine porting rows in §5.2**; every status, transition, RPC, approval, authorization, hash, audit, function, grant, migration, verifier and test count was re-derived and found coherent; **no previously identified ratification blocker remains** (CD-1 … CD-7 all closed in place, with a stale-wording scan finding matches only inside correction and supersession statements); **Markdown validation passed** for all five documents (UTF-8, no BOM, LF-only, balanced fences, 47 column-consistent tables); and **`git diff --check` and `git diff --cached --check` both exited `0`**. One non-blocking citation-precision observation was recorded rather than fixed: `CLAUDE.md` §6's visibility bullet cites "spec §14, §14.1" as source sections while attributing supersessions per topic — the attribution has an empty referent in §14.1, no document declares §14.1 superseded, and no edit was made to any ratified document at this checkpoint. | Accepted |
| D-287 | 2026-08-05 | **Amendment 004 and the Step 7I report-lifecycle design are ratified.** — Amendment 004 (**A-033 … A-040**, ratified 2026-08-05) and `docs/plan/STEP_7I_REPORT_LIFECYCLE_BASELINE.md` (**R-1 … R-33**) are ratified and committed. The governed report workflow is **two-stage**: trainer assessment → AI draft → trainer edit → **trainer approval** → management notification → **management final quality review** → **management Approve & Submit** → canonical/submitted/parent-visible → parent notification. Trainer approval remains **mandatory and irreplaceable** as the entry condition to management review; **no version reaches a parent without a trainer approval in its lineage**; **AI never publishes directly**; and the **parent boundary is unchanged and absolute**. Amendment 004 names **no** Amendment 001 clause and weakens no privacy, approval, audit or evidence control. **Ratification authorizes nothing to be built.** | Accepted |
| D-288 | 2026-08-05 | **Step 7I1 is complete.** — The sequence 7I1A (author) → 7I1B / 7I1B-R0 / 7I1B-R1 / 7I1B-R2 → 7I1C (BLOCKED: 1 critical, 10 high, 9 medium) → 7I1D-R2 (correction under ten operator decisions) → 7I1E (BLOCKED: CD-1 … CD-4 blocking, CD-5 … CD-7 non-blocking) → 7I1F-R3 (correction under one operator decision, T7I-69 option (a)) → **7I1G (independent final verification, progress ratification and commit)** is closed. **No operator decision remains open.** Every step of this sequence was document-only. | Accepted |
| D-289 | 2026-08-05 | **The ratified Step 7I censuses are fixed, and are not to be restated from memory.** — **8 `report_status` values** (`incomplete` · `observation_saved` · `drafting` · `draft_ready` · `needs_edit` · `trainer_approved` · `approved` · `submitted`), the new label added **`AFTER 'needs_edit'`**, with `approved` **transient-in-transaction only and never committed**. **14 legal transition pairs** and no others. **18 proposed new functions** — 15 RPC entry points, 1 authorization helper (`app_parent_reaches_student`), 2 internal serializers (`report_content_hash_v1`, `report_wording_hash_v1`). **14 authenticated EXECUTE grants** — the 14 client-callable RPCs and nothing else; **nothing is ever granted to `service_role`**. **Four zero-client-EXECUTE functions** — `report_store_draft` (R-27), both serializers (R-26), and `app_parent_reaches_student` (R-31); 14 + 4 = 18. **Proposed post-Step-7I census: 12 enums · 26 tables · 28 functions · 5 applied migrations.** **75 acceptance tests, T7I-1 … T7I-75.** §5.0 of the Step 7I baseline and its verifier-reconciliation table are the sole authorities for these numbers. | Accepted |
| D-290 | 2026-08-05 | **Canonical/disposable database isolation is ratified for the Step 7I test suite (U-7I-21).** — Every **S**, **R** and **R(D)** test, plus the preservation and repeatability proofs T7I-28/29/30/31, runs on the **canonical** fixture database, which stays **pristine**: 3 Auth users, 25 domain rows, checksum `d6a314b40bb5eb1bc3169097e2a9cb03858791498ca5137a43050cee36b87517`, committed audit chain **empty**, reconciled verifier passing twice. The **four** `R(C)` coordinated two-session tests — **T7I-15, T7I-16, T7I-46 and T7I-61, and only these four** — run on a **separate disposable** database seeded by the same fixture loader, are expected to leave committed reports, versions, approvals and audit events, and that database is destroyed afterwards with no preservation assertion ever made against it. **T7I-69 is `R(D)`, has no concurrent leg, and runs on the canonical database.** The split is mandatory because an `R(C)` proof requires the winner to commit, every governed mutation appends an audit event in the same transaction, and `audit_block_mutation()` raises unconditionally on UPDATE/DELETE with no owner exemption. | Accepted |
| D-291 | 2026-08-05 | **No Step 7I SQL or implementation has begun, and physical-test dependencies remain implementation work.** — No migration file, RPC, server action, fixture, generated database type, application code or UI component was authored, staged or applied; `supabase/migrations/` still holds exactly the three accepted versions; and **no Supabase, Docker, psql, fixture-loader, verifier or application runtime was started at this checkpoint**. The following remain implementation work and are **non-blocking** for this ratification: the **management review queue** read path (U-7I-24 — no checkpoint owns it, so management currently has no in-product way to discover a report awaiting review); the **trainer returned-correction and observation paths** (U-7I-4, U-7I-11/U-30 — no governed read path to `observations`, so Review & Approve cannot yet load `follow_up_notes`); **management correction tracking**; the **parent report-list and availability projections**; a **deterministic management bootstrap** (N-4/U-23, materially more important now that management is the publisher); **notification states** and the outbox/delivery mechanism (A-039, U-31 — Step 7I creates no notification object); **AI grounding** and the `ai_jobs` pipeline; **real authentication**; and **real frontend/backend adapters**. | Accepted |
| D-292 | 2026-08-05 | **Step 7I2A is the next checkpoint and requires its own explicit authorization.** — Step 7I ships **exactly two** migration files: file 1 contains **only** `ALTER TYPE public.report_status ADD VALUE 'trainer_approved' AFTER 'needs_edit'` under the P-1 fail-closed `current_user = 'postgres'` guard and **commits**; file 2 contains every other authorized object and is the only file permitted to reference the label. The accepted sequence **7I2A → 7I2B → 7I2C → 7I2D → 7I2E → 7I2F → 7I2G → 7J** is preserved, and **each remaining checkpoint stays separately authorized**. **Step 7I2A must not begin, and no Step 7I SQL may be authored, without an explicit orchestrator authorization.** | Accepted |
| D-293 | 2026-08-05 | **48-hour setup baseline verification accepted.** — The working directory was resolved explicitly to the MVP repository (`git rev-parse --show-toplevel` → `C:/Users/enyul/Vibe Studio/B.E.S.T-Coach-Workspace/SDS Project Final (BEST Coach)`) before any command ran, and every Git and repository-writing command was executed from there. Branch `main`; HEAD `194a7c27189903ef5ba2c02cec75af9f7fbfc1bb`; commit count `31`; `git status --porcelain=v1 --untracked-files=all` **empty** (clean index, clean worktree, **zero** untracked); **zero** tags; **zero** remotes; **no upstream**. The workspace tracker and the repository copy were proven **byte-identical** by SHA-256 `83818417d9353dedce269d8575e524dc7f64be874fc5dd966c55ad82b7ac2d96` and by `cmp`. The frozen demo was verified **clean** at `8d4acf4abc5039c24da01be773ab1a5e4916080f` on branch `main`. **Nothing was reset, restored, stashed, discarded or rewritten.** | Accepted |
| D-294 | 2026-08-05 | **The 48-hour physical-test slice contract is accepted, and it is subordinate to every governing document.** — `docs/plan/PHYSICAL_TEST_SLICE_48H.md` defines the shared implementation boundary for a locally runnable, desktop-first, synthetic-data vertical slice covering trainer assessment → AI draft → trainer review/edit → **trainer approval (which publishes nothing)** → management review → wording edit or return → trainer correction/reaffirmation and reapproval → **management Approve & Submit** → parent canonical submitted-report view. Its §0 states explicitly that it sits **below** Specification v3, Amendments 001–004, `CLAUDE.md`, the Implementation Plan, Figma Design 2, `STATUS.md`, `BUILD_NOTES.md` and this tracker; that **it authorizes no checkpoint**; that **it amends no governing document**; and that **it narrows no part of `CLAUDE.md` §12**. Where the contract and a governing document disagree, the governing document wins and the disagreement is raised as a blocker. **The named schema/migration checkpoints 7I2A … 7I2G and 7J keep their identities and their separate-authorization requirement.** | Accepted |
| D-295 | 2026-08-05 | **The shared frontend/backend boundary is pinned.** — Eighteen route families, with the `role` query parameter selecting **presentation only** and authority always derived from the authenticated server session and live domain membership. Eight write actions — `saveObservation`, `requestDraft`, `saveTrainerEdit`, `updateTrainerChecklist`, `trainerApprove`, `managementEditWording`, `managementReturnToTrainer`, `managementApproveAndSubmit` — each mapped to its ratified RPC and each a `server-only` wrapper that adds no authority of its own. Eleven required reads and projections. A frontend DTO inventory that **must not import generated database types directly**. A shared nine-outcome `UiActionResult<T>` (validation · unauthenticated · unauthorized · unavailable · stale state · generation failure · retryable failure · unexpected failure · success). **Management review DTOs exclude — absolutely — ratings, observations, attendance, evidence, trainer notes, checklist values, content hashes, revision counts, AI history, and correction reasons except where the correction-tracking surface requires them.** `report_store_draft` retains **zero client EXECUTE** (R-27), and `report_reopen_submitted` is out of slice because post-submission correction initiation is deferred. | Accepted |
| D-296 | 2026-08-05 | **The AI boundary is defined and no provider was silently selected.** — The contract defines an `AiDraftProvider` boundary requiring real model generation before the physical test, deterministic structured validation before any `report_version` is persisted, grounding against the saved assessment with rubric anchors and polarity bands attached to every dimension, **one bounded** retry or regeneration, and a failure path that leaves **no false `draft_ready`** state. A deterministic fixture provider is permitted **only** for frontend development and automated UI-state tests, and must never be reachable in the participant walkthrough. **Checkpoint CP-1 is satisfied without an operator decision:** the ratified non-secret selectors `LLM_PROVIDER=openai` and `LLM_MODEL=gpt-5.6-terra` are already committed in `.env.example`, and `STATUS.md` records the provider and key as orchestrator-verified and present locally. **Only approved configuration-variable names and committed non-secret selectors were inspected; no secret value was read, printed, hashed, logged or reported.** If the approved provider is found unconfigured at implementation time, the backend agent **stops and requests an operator decision**. | Accepted |
| D-297 | 2026-08-05 | **File ownership, shared-reference read-only rules and the blocker protocol are pinned.** — The backend worktree (Claude Code) owns `supabase/**`, `server/**`, `lib/supabase/**`, generated database types, `scripts/fixtures/**`, backend and integration tests, authentication and authorization, lifecycle RPC integration, AI provider and grounding, backend-owned actions and projections, dependency files **only when genuinely required**, and its own workstream log. The frontend worktree (Codex) owns `app/(auth)/**`, `app/(portals)/**`, `components/**`, `features/**`, `lib/frontend/**`, `tests/frontend/**`, `public/brand/**`, `app/layout.tsx`, `app/globals.css` and its own workstream log, and **must not** edit SQL, migrations, RLS, grants, generated types, server authorization, lifecycle rules, governance documents, `package.json`, `package-lock.json` or the backend log. **Neither agent may edit the other track's owned paths**, and any genuinely required cross-owned edit is a **blocker reported before modification**. `CLAUDE.md`, `docs/spec/**`, `docs/plan/**` and `docs/progress/**` are **read-only in both worktrees during parallel work**; the sole exception is each agent's own branch-local log under `docs/workstreams/`. **Neither worktree may update `STATUS.md`, `BUILD_NOTES.md`, either migration tracker, Amendment 004, the Step 7I baseline, the Figma matrix or the 48-hour contract.** If the shared contract or governance must change, the agent stops without editing shared documents, records the blocker in its own log, reports the exact required decision, both worktrees pause, the contract is amended and committed on `main`, and both branches rebase onto the same amended baseline before resuming. | Accepted |
| D-298 | 2026-08-05 | **Two branch-local workstream logs were created as operational records, not governance authorities.** — `docs/workstreams/48H_BACKEND_PROGRESS.md` and `docs/workstreams/48H_FRONTEND_PROGRESS.md`. Each carries the required header (workstream name, owning agent, owning branch, planned worktree path, contract path, contract baseline commit, and an explicit statement that governance and the shared contract take precedence), the **fixed six-value status vocabulary** (Not started · In progress · Blocked · Ready for review · Accepted · Integrated), its round checklist, and an **append-only eleven-field checkpoint template** — timestamp in **Asia/Singapore**, round/checkpoint ID, starting commit, ending commit, status, scope completed, files changed, tests and validation, unresolved blockers, contract deviations requested, next action. **No secret, password, token, `.env` value or personal data may be recorded in either log.** Each agent updates and commits **its own** log in the same commit as the corresponding implementation checkpoint, unless the checkpoint is blocked before any implementation change; **the other agent's log is read-only**. **Canonical progress records are reconciled once from `main`, after both workstream reports are received — never from a worktree.** | Accepted |
| D-299 | 2026-08-05 | **The contract baseline resolved without a follow-up commit, and both branches begin from the same setup commit.** — Rather than embed a literal hash placeholder that would have required a second documentation-only commit, both workstream logs and `STATUS.md` name the contract baseline as *the commit created by* `docs(plan): define 48-hour physical-test slice`, resolvable at any time as `git merge-base feat/48h-backend feat/48h-frontend` and equivalently as the tip of `main` at worktree creation. That reference is self-resolving, so **no placeholder needed rewriting after the commit, no follow-up commit was made, and neither branch had to be fast-forwarded or recreated.** Both worktrees were verified after creation to resolve to the **same** commit as `main`. **No dependency was installed, no Supabase, Docker, psql, fixture loader, verifier or server was started, and no implementation file was edited inside either worktree.** | Accepted |
| D-300 | 2026-08-05 | **Five named implementation checkpoints are recorded rather than decided, and two of them are material.** — **CP-1 (AI provider)** is **satisfied** (D-296). **CP-2 (assessment-write authorization) is OPEN and requires an explicit operator decision:** `observations` and `observation_ratings` carry **zero policies and zero `authenticated` privileges**, and the ratified Step 7I inventory contains **no assessment-write RPC** — the baseline assigns "assessment RPCs" to a later Phase 1 slice — so the contract's requirement of **real** observation persistence needs governed write objects that are **not yet designed or authorized**. CP-2 **does not block backend Round 1**, which is entirely within the ratified Step 7I design; it blocks `saveObservation` and the real-data assessment path, and **must be resolved before any assessment-write SQL is authored**. **CP-3 (queue and list projections)** — no checkpoint owns a management review-queue read path (U-7I-24), so management currently has no in-product way to discover a report awaiting review; resolve at backend Round 2 design, and treat any new database object beyond the ratified inventory as a `CLAUDE.md` §12 stop-and-ask. **CP-4 (trainer observation read path, U-7I-11 / U-30)** — no governed read path to `observations`, so Review & Approve cannot yet load `follow_up_notes`; resolve with CP-2. **CP-5 (deterministic management bootstrap, N-4 / U-23)** — open and **non-blocking** for the physical test; synthetic fixtures do not discharge it. **No implementation began at this checkpoint**, `supabase/migrations/` still holds exactly the three accepted versions, and the frozen demo remains unchanged and clean. | Accepted |
| D-301 | 2026-08-05 | **CP-2/CP-4 baseline verification accepted, and the audit-action gate was reported as a blocker before any file was written.** — The working directory was resolved explicitly to the MVP repository (`git rev-parse --show-toplevel`) before any command ran. Branch `main`; HEAD `336cc18e6d41f44c0139679efa1de9f0bd01f7a7`; commit count `32`; `git status --porcelain` **empty**; **zero** tags; **zero** remotes; **no upstream**; both worktrees **clean**, on their correct branches and paths, at the **same** commit, with `git log main..<branch>` **empty** for both; the frozen demo **clean** at `8d4acf4abc5039c24da01be773ab1a5e4916080f`; both tracker copies **byte-identical** (MD5 `07ab643757e7ccf4efa2e033a4cdebd4`). A first design pass then established that the committed Step 7H registry is a **closed 16-element `CONSTANT text[]`** duplicated byte-identically inside **two applied `SECURITY DEFINER` functions** (`audit_append_event` lines 439–456; `audit_verify_chain` lines 744–761) and that **none of its sixteen actions denotes standalone observation persistence** — every action that could truthfully describe an observation save is a *report* action requiring exactly the report mutation the CP-2 design forbids. That session **stopped as blocked with the repository byte-for-byte untouched**, per the checkpoint's own audit-action gate and `CLAUDE.md` §12. **Nothing was reset, restored, stashed, discarded or rewritten at any point.** | Accepted |
| D-302 | 2026-08-05 | **Operator ruling — option (c): standalone observation persistence is deliberately not a Step 7H audit event.** — `assessment_save_observation` emits **no** audit event, and `assessment_get_trainer_observation` (being `STABLE`) structurally cannot. This is consistent with what Step 7H already ratified: §1.4 event **E9 — "Observation-to-report derivation"** — was resolved as *"Folded into E2/E3 payloads … no separate event (data minimization)"*, so observation facts were **already** ratified as auditable through report events. Binding consequences: the **closed 16-action registry is not extended**; **neither Step 7H audit function is replaced** (assertion **B20** requires the two registry copies to stay equal; Step 7I test **T7I-30** requires the registry byte-unchanged in both); **no misleading report or administration action is reused** — a false, hash-covered claim in a chain that is append-only by trigger and by zero privilege, and that Step 7H §6.4 forbids repairing "ever", is strictly worse than no claim; and the save **creates no report and performs neither T0 nor T1**. **`CLAUDE.md` §4 non-negotiable 2 is not engaged** — it governs *state transitions*, and Step 7I §3.2 states directly that an observation save "is not a report transition at all". | Accepted |
| D-303 | 2026-08-05 | **Truthful audit begins at the report lifecycle, owned by `requestDraft`.** — The future `requestDraft` server action ensures/creates the governed report (`report_create`, T0 → `report.created`), marks observation saved (`report_mark_observation_saved`, T1 → `report.state_changed`) and requests drafting (`report_request_draft`, T2 → `report.state_changed`). Each event is **truthful** — it describes a report mutation that actually occurred, emitted by the RPC that performed it. Their payloads carry **only permitted non-PII derivation identifiers** (report, student, session, module and **observation** ids, plus status) with the **generic constant target labels** of R-30 (`Report`, `Student`, `Class session`, `Observation`), and **never** observation prose, chip values, follow-up or term-evidence text, individual or aggregate rating values, the complete assessment payload, correction content, or any child name, initial, account name, email or phone number. **Assessment saving never silently advances the report lifecycle.** | Accepted |
| D-304 | 2026-08-05 | **CP-2 is resolved by design: `public.assessment_save_observation`.** — `postgres`-owned, `plpgsql`, `VOLATILE`, `SECURITY DEFINER`, `SET search_path = ''`, no dynamic SQL, `authenticated` EXECUTE only. It resolves `auth.uid()` to **exactly one** active account and **exactly one** active trainer membership holding an **active** assignment to the exact session (fail-closed on zero or ambiguous); verifies active enrolment in the session's module and attendance **`present`** — **a missing attendance row fails closed**; enforces the ratified `Asia/Singapore` session-start gate (**R-9 / B-7I-1**, including the **U-7I-13** NULL-`starts_at` fallback, with the zone a **pinned literal**, never the caller's `TimeZone` GUC); validates **exactly nine unique** governed dimension codes and the governed four-value rating vocabulary, each condition raising its own distinct **authored** error; **derives dimension group, label and ordering from `assessment_dimensions`** — a client-supplied group or label is *unrepresentable* because no such parameter exists, the allow-list being the signature rather than a runtime filter; creates, or CAS-updates pinned on **observation id + session + student + expected lock version** against `observations_id_session_student_key`, bumping `lock_version` by **exactly one** in the single UPDATE statement; upserts the complete nine-row rating set in the **same transaction** with a `count(*) = 9` post-condition; and returns a **bounded** result of identifiers, completion state and the new lock version, and nothing else. **`centre_id`, `class_module_id`, `enrolment_id` and `trainer_membership_id` are derived, never parameters.** It writes only `observations` and `observation_ratings`, and contains no statement referencing `reports` or any report child table. **No implementation exists.** | Accepted |
| D-305 | 2026-08-05 | **CP-4 is resolved by design: `public.assessment_get_trainer_observation`.** — `postgres`-owned, `plpgsql`, **`STABLE`**, `SECURITY DEFINER`, `SET search_path = ''`, `authenticated` EXECUTE only. It requires the **same** live trainer/session relationship as the write and is scoped to the requested session and student only. It returns the five trainer-editable observation fields, the nine rating values with **authoritative labels and group codes embedded from `assessment_dimensions`** (so **U-7I-7** stays closed and no client grant on that table is needed), ordered by the **hard-coded `dimension_code` enum declaration order** rather than the mutable `sort_order` column, plus the observation id and `lock_version`; and a **safe empty/not-created shape** — one row, `observation_exists = false`, never zero rows and never an error — where no observation exists. Management, parents, unrelated trainers and unauthenticated callers are denied with **one non-disclosing authored outcome**, byte-identical whether the target exists or not. It never returns report drafts, panels, status, versions, hashes, approval data, checklist values, correction reasons, AI history, audit data or unrelated student information. **It supports the returned-correction workflow while exposing no management-only correction metadata** — `issue_scope`, affected dimension, correction status and reason remain with `report_get_working` (RPC-14). This closes **U-7I-11 / U-30**, the blocked requirement that Review & Approve load the trainer's existing `follow_up_notes`. **No implementation exists.** | Accepted |
| D-306 | 2026-08-05 | **The assessment-layer census delta is recorded separately, and the ratified Step 7I counts are unchanged.** — Assessment persistence ships **after Step 7I acceptance**, in **its own separately-authorized migration**, under the P-1 fail-closed `current_user = 'postgres'` guard, containing two `CREATE FUNCTION` statements with their comments, two `REVOKE` lines, two `GRANT` lines and its post-apply assertions — **and nothing else**. Delta: **+1 migration · +2 public functions · +2 `authenticated` EXECUTE grants · 0 new tables · 0 new enums · 0 policies · 0 table grants · 0 audit-registry changes**. Post-assessment census: **6 migrations · 30 public functions · 26 tables · 12 enums**. **The ratified Step 7I claims of 5 migrations, 28 public functions and 75 acceptance tests are unchanged**, and Step 7I §5.0 remains the sole authority for its own numbers. The fixture-verifier reconciliation the assessment migration must carry — **A34 5→6, A35 28→30, D5 28→30, A32 unchanged at 26** — is recorded in the baseline so it ships in the same commit as the migration. **45 assessment acceptance tests, `T-ASM-1 … T-ASM-45`, are specified as additional to Step 7I's 75**, with the impossible audit-append tests replaced by proofs that the save and the read leave the audit chain unchanged, that the save creates no report and performs no report transition, that Step 7H is byte-untouched, and that the later `requestDraft`/report integration emits truthful T0/T1 events carrying only permitted derivation identifiers. **Posture preserved: RLS enabled with zero policies on both assessment tables; no `authenticated` table SELECT/INSERT/UPDATE/DELETE; `anon`, `service_role`, `authenticator` and `PUBLIC` at zero; `FORCE ROW LEVEL SECURITY` never added.** Open items **U-ASM-1** (post-submission observation-edit lock — non-blocking, hardening week) and **U-ASM-2** (rubric anchors have no schema column) are recorded rather than invented. **Quick mode remains removed entirely (A-017), not merely deferred.** **CP-3 and CP-5 remain open. No implementation began at this checkpoint**, `supabase/migrations/` still holds exactly the three accepted versions, and the frozen demo remains unchanged and clean. | Accepted |
| D-307 | 2026-08-05 | **The §0 login-input gate fired, and the checkpoint stopped with the repository untouched before it cleared.** — The first pass found all six login placeholders still literal (`<<REPLACE_WITH_…>>`) and a read-only workspace sweep confirmed no substitute source existed — the role-query strings appeared only in `docs/plan/PHYSICAL_TEST_SLICE_48H.md`, two frontend smoke tests and a backend lifecycle SQL fixture, **none of which is an authorized §0 input**. **No file was created, edited or staged during that pass.** The orchestrator then supplied three node-specific `/design/` URLs, each verified against all four §0 conditions: **file key `sSY1TYw3jyVlZDy8V2Mu7g`** in every case; an **explicit `node-id`** in every case; a specific login frame rather than an overview canvas; and **three distinct nodes** — `546:370` (trainer), `459:13` (management), `546:413` (parent). The orchestrator's sharing rule is recorded verbatim — *"all similar to each other"* — and read as **similar, not identical**: three distinct frames means **three separately frozen visual references**, and the A-041 shared-frame exception was **not** invoked. | Accepted |
| D-308 | 2026-08-05 | **Amendment 005 is ratified, and the complete final-MVP visual-reference inventory is 36 screens.** — `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_005.md` (**A-041 … A-048**) ratifies **3 authentication screens (`AUTH-01` … `AUTH-03`) and 33 portal screens (Trainer 01–10 · Management 11–29 · Parent 30–33)**, all in Figma file key **`sSY1TYw3jyVlZDy8V2Mu7g`** / **`SDS-dashboard`**. **Portal numbering 01–33 is preserved and did not shift; authentication IDs sit outside the numbered portal sequence** precisely so it would not. The four Parent source entries that all carried the prefix `30-` are **normalized to IDs 30–33** — a duplicated-prefix normalization, not a renumbering of an accepted sequence. **All 33 portal nodes are unique, the 3 authentication nodes are unique, and no node is shared between any two screens.** Every node was **supplied by the orchestrator; none was inferred, guessed or fabricated.** Amendment 005 **names no Amendment 001, 003 or 004 clause**, **extends rather than reverses A-022**, and **does not amend the competency-rating vocabulary**, which a separate vocabulary-reconciliation checkpoint owns. **Specification v3 and Amendments 001–004 were not modified and remain byte-for-byte unchanged.** | Accepted |
| D-309 | 2026-08-05 | **Exactly twelve screens block the physical test; the other twenty-four portal screens are deferred until after it.** — The core slice is **AUTH-01 · 05 · 06 · 07 · 08 · 10 · AUTH-02 · 29 · 19 · AUTH-03 · 32 · 33**, flow order **contiguous 1–12**, walking trainer sign-in → session selection → roster → assessment → grounded AI generation → **trainer review/edit/checklist/approval** → management sign-in → management queue → wording edit, return or final Approve & Submit → parent sign-in → parent submitted list → parent canonical detail. **Trainer approval is part of the governed lifecycle and is never abbreviated away** — it commits `draft_ready \| needs_edit → trainer_approved`, freezes the version and **publishes nothing**; management's Approve & Submit is the only publication (A-033/A-036). The remaining **24 portal screens are `Post-48-hour final-MVP scope`** — required for the final MVP, **not required to be visually complete before the physical test**, and never to be reported as physical-test blockers. **Deferral deletes no safeguard.** **No active source describes all 36 screens as required before the physical test, and none omits a core screen.** | Accepted |
| D-310 | 2026-08-05 | **Visual authority is ratified, and screen presence is not authorization.** — **Visual authority (highest first): frozen `reference.png` → node-specific Figma context → existing frontend implementation.** **Functional, security and privacy authority (highest first): specification and active amendments → `CLAUDE.md` → lifecycle and authorization baselines → the ratified implementation contract → Figma.** **Figma never bypasses governance** — where a frame and a ratified rule disagree, the ratified rule wins and the discrepancy is **recorded**, never silently resolved. **A Figma screen or a control drawn on one authorizes nothing**: no lifecycle transition, role, permission, database mutation, AI operation, protected-content access, direct table access, Management power, or Parent access to unpublished content. Missing governance is recorded as a **dependency**. The **eight blocked design families** of the Figma matrix §0.1 are unchanged, still have **no frame**, and **none was invented** — six of the eight are exercised by the twelve-screen walkthrough and are built to the ratified rules and the contract's field lists. **Management Term Report (ID 28) remains separately governed before implementation**; its presence in the inventory authorizes nothing. | Accepted |
| D-311 | 2026-08-05 | **Route compatibility is documented, not executed, and one core screen has no route at all.** — Amendment 005 **A-042 ratifies all 36 canonical routes**, including the three role-query login variants, with **dynamic segments in bracket notation**; the compiled list's prose placeholders are normalized, and **`specific-class-type` normalizes to `[classModuleId]`** under **A-047**, which preserves **Centre → Class Grade → Class Module → Class Session** and introduces **no hidden `classes` entity**. **Six canonical routes are already satisfied** (the three login variants plus **09**, **29**, **32**). **Nine mismatches are recorded with one treatment each**: core **06, 07, 08, 10, 19, 33** → *replace after integration* with the contract-pinned path preserved as a redirect; deferred **01, 11, 30** → *preserve existing route as redirect*. **The routes pinned by `PHYSICAL_TEST_SLICE_48H.md` §4 remain the routes the physical test runs on and are not withdrawn.** **No route code was edited, and executing any treatment requires its own authorization.** **The material finding: ID 05 Trainer Schedule — core flow order 2 — has no implemented route**; session selection is currently folded into the trainer landing surface at `/trainer`. This is a **coverage gap, not a route mismatch**, recorded as **U-A5-1**, with two defensible options; **the decision was recorded and not made**, because adding a route is a contract §9 blocker. | Accepted |
| D-312 | 2026-08-05 | **The active documents are reconciled, the external UI pack scope is fixed, and no application code changed.** — Reconciled: `CLAUDE.md` (precedence, two source-of-truth rows, three §7 pointer paragraphs, one new §12 stop-and-ask bullet — **pointers only, no duplicated tables**); `docs/plan/BEST_Coach_Implementation_Plan.md` (new **G2.1** separating twelve core · twenty-four deferred · backend-dependent · separately governed); `docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md` (new **§0.2** with all 36 exact mappings and the twelve core screens marked, plus an explicit boundary note that **§1–§3 are family-based planning rows and are not the complete screen inventory** — the previous smaller matrix is no longer presented as complete); `docs/plan/PHYSICAL_TEST_SLICE_48H.md` (new **§4.1–§4.4**, **not expanded to all 36 screens**). The **external frozen UI-reference pack will scaffold all 36 folders**, and **only the 12 core screenshots are required immediately**; the pack is **external to this repository**, and no visual asset enters it without a recorded `PORT` / `REFERENCE ONLY` / `REBUILD` / `REJECT` / `NOT APPLICABLE` disposition. **The current narrow-flow frontend is functionally implemented but visually unaccepted** — no frozen `reference.png` exists, so **no screen is classified `Implemented and visually aligned`**. **The previously open "shared login shell vs three role-specific login screens" question is resolved: three distinct frames, three separately frozen references, one permitted shared shell.** **No application code changed** — no route, component or style was created, moved, deleted or restyled; no SQL, migration, RPC, server action, fixture or generated type was authored; no Figma asset was scraped or ported; **no Supabase, Docker, psql, migration, fixture, verifier, build or dev-server runtime was started**; and **no secret value was inspected**. Both branch-local workstream logs were read **read-only and were not edited from `main`**. | Accepted |
| D-313 | 2026-08-05 | **The competency-assessment vocabulary is ratified as `Beginning` → `Developing` → `Mastering` → `Mastered`.** — `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_006.md` (**A-049 … A-055**), ratified **2026-08-05 23:20 Asia/Singapore** at Vocabulary Governance Checkpoint **V1**. Canonical storage values are `beginning`, `developing`, `mastering`, `mastered`, replacing `emerging`, `developing`, `secure`, `advanced`. **Arity, ordinal position and low-to-high direction are unchanged**, and **`developing` is unchanged in both value and position**, so the future migration requires **exactly three** enum-value renames. A clause-continuity check confirmed **A-048** as the highest committed clause and **A-049 … A-055** as unused, so the instrument is **Amendment 006**; the vocabulary work originally scoped as "Amendment 005" was renumbered after discovering Amendment 005 (**A-041 … A-048**) already ratified, and **no ratified instrument was renumbered, edited or overwritten**. | Accepted |
| D-314 | 2026-08-05 | **The four behavioural anchors carry forward positionally and verbatim, and the polarity bands are ratified.** — A-050: **Emerging→Beginning · Developing→Developing · Secure→Mastering · Advanced→Mastered**, with **Specification v3 §3.3's wording preserved character-for-character**. **Semantics do not change because labels changed**; no threshold moved, **no fifth level exists**, and **`Mastered` remains the exceeds-expectations level**. A-051 ratifies `beginning`→`needs_support`, `developing`→`developing`, `mastering`→`positive`, `mastered`→`positive`. **`Mastering` remains `positive` because polarity derives from the ratified behavioural anchor, not from the progressive grammatical form of the label** — demoting it would have silently narrowed what the AI may describe as a strength, a substantive behavioural change smuggled in under a rename. | Accepted |
| D-315 | 2026-08-05 | **AI leak detection is contextual; a bare-word rating-label regex is prohibited.** — A-052: the future grounding guard must detect **explicit rating attribution and taxonomy disclosure** — `rating: Mastered`, `rated as Beginning`, `Mastering level`, `assessment level is Developing`, an isolated raw label presented as a rating value, or explicit disclosure of the internal four-level taxonomy. **A guard equivalent to `\b(beginning\|developing\|mastering\|mastered)\b` is expressly prohibited**, because the ratified vocabulary contains **ordinary English words** and such a guard would reject valid parent-facing prose — "at the beginning of the session", "is mastering sentence flow", "has mastered maintaining eye contact", "demonstrates mastery of vocal projection" — **all of which remain legal**. **`mastered` and `mastery` are retained as achievement-language concepts** for polarity-contradiction detection; the attribution rule and the achievement rule are separate. **The audit-payload privacy assertion must be updated in the same implementation checkpoint as the enum migration**, or it continues checking obsolete labels and passes falsely. | Accepted |
| D-316 | 2026-08-05 | **A bounded three-statement enum rename is authorized behind a fail-closed zero-row guard, and is not implemented.** — A-053 additively extends Amendment 004 A-040 to authorize **exactly** `emerging`→`beginning`, `secure`→`mastering`, `advanced`→`mastered` via `ALTER TYPE public.competency_rating RENAME VALUE`, in **one future forward migration**. The migration must prove **zero rows in `report_versions`, `report_version_ratings` and `observation_ratings` in the same transaction** and **`RAISE EXCEPTION` and abort rather than rename** if the precondition fails. **The report tables are load-bearing because report-content hash v1 serializes the textual enum labels**, so a rename after report data exists produces permanently unreproducible hashes on frozen immutable rows. `RENAME VALUE` preserves `enumsortorder` and label OIDs, so **no row update or table rewrite is required**. **No type, table, enum-count, policy or function-count change is authorized**, and **A-031's counts stand unchanged**. **Nothing was implemented** — the bounded sequence is `docs/plan/COMPETENCY_VOCABULARY_RECONCILIATION_PLAN.md`, whose **V2**, **V3** and **V4** checkpoints each require separate authorization. **The safe zero-row migration window remains open and closes on the first `report_versions` row.** | Accepted |
| D-317 | 2026-08-05 | **The Class Grade vocabulary is unchanged, global keyword replacement is prohibited, and repository sources are authoritative.** — A-054: Class Grade remains **`Beginner` / `Intermediate` / `Advanced`** (`beginner`, `intermediate`, `advanced`). `class_grade_code` and `competency_rating` are **two distinct enums governing two distinct concepts** that coincidentally shared the token `advanced`; **`Advanced` is no longer a competency rating and remains a Class Grade**. `class_grade_code`, class-grade fixtures and their exact-match seed assertion, class-grade UI labels and class-grade tests were **not modified**, and **ordinary uses** of `advanced`, `secure`, `emerging`, `beginning`, `mastering` or `mastered` are preserved. **Global keyword replacement is expressly prohibited.** A-055: the copies inside `SDS Project Final (BEST Coach)` are **authoritative**; the workspace `governance-source/` folder is a **non-authoritative mirror**. Divergence was **measured, not inferred** — the mirror's `CLAUDE.md` (42,828 B) and Implementation Plan (24,307 B) are **smaller and therefore earlier** than the repository's (114,043 B and 86,714 B), and the specification mirror is byte-identical; **no mirror file was synchronized, edited or retired**. **Amendments 001–005 were not edited and remain byte-for-byte unchanged**, and **no SQL, application code, fixture, generated type or test changed in V1**. | Accepted |

---

## 8. Open decisions

- ~~Exact demo repository path~~ — resolved (D-011)
- ~~Exact parent workspace and MVP repository paths~~ — resolved (D-011)
- ~~Whether demo Step 15 should be completed before freeze~~ — resolved: skipped, freeze at Step 14 (D-012)
- ~~Package manager for MVP~~ — resolved: npm (D-021)
- ~~LLM provider~~ — resolved: OpenAI (D-071)
- ~~Supabase project creation and region~~ — resolved: created, Singapore `ap-southeast-1` orchestrator-verified (D-069)
- ~~Final reconciled parent-evidence policy~~ — resolved: Amendment 001 A-001/A-002/A-003 (gated Phase 2 access)
- Whether and when to create GitHub remotes

**Still unresolved as of Step 7B-R5 (2026-07-24) — none resolved during this tracker update:**

| # | Unresolved decision | Must be resolved before |
|---|---|---|
| 1 | **Formal data-layer governance clarification** — v3 §18 / `CLAUDE.md` §9 name a typed client (Prisma or Drizzle) vs D-067 Supabase-native / no ORM (D-108) | **Step 7E or Step 7J** |
| 2 | **`public` profile-table relationship to `auth.users`** — 1:1 keyed profile vs alternative | Step 7E |
| 3 | **Audit target representation** — typed FK to `reports` vs polymorphic `target_type`/`target_id` | Step 7E / 7H |
| 4 | **Report-status storage representation** — display names (§13) vs a normalized enum spelling | Step 7E |
| 5 | **Audit chain scope** — one global chain vs one chain per target/tenant | Step 7H |
| 6 | **SHA-256 algorithm ratification for the audit design** — v3 §23 names no algorithm | Step 7H |
| 7 | **Genesis representation** — sentinel vs zero-hash for the first chain entry | Step 7H |
| 8 | **Deliberate `GRANT` strategy for new tables** — new `public` entities are not auto-exposed | Step 7E |
| 9 | **Local-versus-hosted environment-selection design** — local CLI credentials are distinct from hosted ones | Step 7D (before client implementation) |

> **Status of that Step 7B-R5 table as of Step 7E0 (2026-07-30).** Item **1** is **resolved** by Amendment 002 A-023 / D-191 / D-192. Item **9** is **resolved** — implemented and accepted at Step 7D. Items **2 – 8** remain open and are carried forward, reclassified, into the register below. The table above is preserved unchanged as the accurate record of its moment.

**Still unresolved as of Step 7E0 (2026-07-30) — classified by blocking point. Nothing below was fabricated or silently resolved.**

> **Carried forward unchanged at Step 7E0C (2026-07-30).** Recording the Step 7E0 acceptance resolved **none** of the items below. The seven **schema-critical (S-1 … S-7)** items are exactly the Step 7E blockers that the authorized **Step 7E0D — Schema-critical decision ratification** must resolve. The **audit-chain (A-1 … A-3)** items block **Step 7H**, not the first migration. The **report/UI (U-1 … U-7)**, **Figma asset (F-1)** and **evidence (E-1 … E-3)** items block only their own later checkpoints.
>
> **Status update at Step 7E2C (2026-08-03).** The seven **schema-critical (S-1 … S-7)** items were resolved by Amendment 003 and are now **physically delivered** by the Step 7E governed-core migration (commit `252ef9b`), applied and verified against a **local disposable database only**. One new item — **P-1**, the `supabase_admin` default-ACL review — is opened for **Step 7G**. The **audit-chain (A-1 … A-6)**, **report/UI (U-1 … U-7)**, **Figma asset (F-1)**, **evidence (E-1 … E-3)** and **Amendment 003 (N-1 … N-5)** items are all **unchanged and still open**.
>
> **Status update at Step 7E0D2C (2026-08-03).** The seven **schema-critical (S-1 … S-7)** items are now **RESOLVED** by Amendment 003 (commit `b367475`) and are marked individually below. **Nothing else changed.** The **audit-chain (A-1 … A-3)** items remain **open** and still block **Step 7H** — Amendment 003 **explicitly declines to ratify** chain scope, canonical serialization, hash application, previous-hash rules, genesis, and verification/repair. The **report/UI (U-1 … U-7)**, **Figma asset (F-1)** and **evidence (E-1 … E-3)** items remain **open and unchanged**, and the **Figma Design 2 implementation handoff remains pending**. New items opened by Amendment 003 are recorded in the register that follows.
>
> **Status update at Step 7F1F (2026-08-03).** Delivering and accepting the Step 7F synthetic fixture (commit `e197f91`) resolved **none** of the items below. **P-1 remains open and is now the mandatory opening review for the next implementation checkpoint, Step 7G.** **N-4 (production Management bootstrap) remains open** — creating a fixture management identity in a local disposable database does **not** constitute, design or discharge it, and must never later be cited as having done so. The **audit-chain (A-1 … A-6)**, **report/UI (U-1 … U-7)**, **Figma asset (F-1)**, **evidence (E-1 … E-3)** and remaining **Amendment 003 (N-1 … N-3, N-5)** items are all **unchanged and still open**.
>
> **Status update at Step 7G1H (2026-08-04).** **P-1 is RESOLVED** — the Step 7G1A audit proved the `supabase_admin` default ACLs never applied (every project object is created by `postgres`, whose own public default ACLs are hardened), the Step 7G migration enforces the execution role with a fail-closed guard, and both default-ACL sets were verified unchanged after application; any future `supabase_admin` object creation remains a privilege event requiring re-audit. **Nothing else below was resolved by Step 7G.** **N-4 remains open.** The **audit-chain items A-1 … A-6 remain open, deliberately unratified, and must be explicitly reconciled and ratified before any audit-chain SQL is authored in Step 7H.** The **report/UI (U-1 … U-7)**, **Figma asset (F-1)**, **evidence (E-1 … E-3)** and remaining **Amendment 003 (N-1 … N-3, N-5)** items are all **unchanged and still open**.
>
> **Status update at Step 7H1A4 (2026-08-04).** **The audit-chain items A-1 … A-6 are now fully RATIFIED at design level** by the committed audit-chain design baseline `docs/plan/STEP_7H_AUDIT_CHAIN_BASELINE.md` (commit `3e479b6`, SHA-256 `da5b0aea…`), recorded as **D-261 … D-272** — per-centre chain scope and threat model (A-1), core-`sha256(bytea)` same-transaction hashing (A-2), seeded-head genesis with a race-proven READ COMMITTED first-append protocol (A-3), the versioned canonical envelope and deterministic byte-ordered serializer (A-4), the governed append protocol with validated actor authority and per-RPC duplicate gates (A-5), and complete/partial verification with no-repair incident handling (A-6). **Ratification authorizes design only — no audit-chain SQL, table, function, trigger, policy or grant exists.** **Nothing else below was resolved by the Step 7H design work.** **N-4 remains open.** The **report/UI (U-1 … U-7)**, **Figma asset (F-1)**, **evidence (E-1 … E-3)** and remaining **Amendment 003 (N-1 … N-3, N-5)** items are all **unchanged and still open**.
>
> **Status update at Step 7H final acceptance (2026-08-05).** **The audit-chain items A-1 … A-6 are now fully IMPLEMENTED, APPLIED, DUAL-PROVEN and ACCEPTED** — the ratified design was authored as migration `20260804213000`, adversarially reviewed, applied to the local disposable database, proven by Codex primary and independent verification, committed as `ef22521`, and closed out by this session's fixture-verifier reconciliation and four-run repeatability proof, committed as `617ca4b` (**D-279 … D-283**). **Nothing else below was resolved by Step 7H.** **N-4 remains open** and does not reopen Step 7H. The **report/UI (U-1 … U-7)**, **Figma asset (F-1)**, **evidence (E-1 … E-3)** and remaining **Amendment 003 (N-1 … N-3, N-5)** items are all **unchanged and still open**. **Step 7I (report-lifecycle RPCs and their audit appends) is the next checkpoint and remains unstarted (D-284).**

**(1) Schema-critical — blocked Step 7E; all RESOLVED at Step 7E0D (2026-08-03):**

| # | Decision | Required orchestrator input | Resolution |
|---|---|---|---|
| S-1 | `public` profile table's physical relationship to `auth.users` | Ratify 1:1 keyed profile vs alternative | **RESOLVED — A-025**: centre-independent `accounts`, application-owned UUID, **nullable unique `auth_user_id`**; profiles never key to `auth.users`; `students` have no Auth linkage |
| S-2 | Audit **target representation** — typed FK vs polymorphic `target_type`/`target_id` | Ratify the representation (carried from item 3 above) | **RESOLVED — A-029**: polymorphic target with an immutable label snapshot and **no FK**, plus a related-target child table; durable actor FKs (`RESTRICT`) retained |
| S-3 | **Report-status storage representation** — display names vs normalized enum spelling | Ratify the stored vocabulary (carried from item 4) | **RESOLVED — A-028**: normalized `report_status` enum, **exactly seven values**; `Evidence Pending` is **not** a stored status, which weakens **no** evidence safeguard |
| S-4 | Deliberate **`GRANT` strategy** for newly created tables | Ratify the grant policy (carried from item 8) | **RESOLVED — A-030**: deny-by-default; **zero client grants and zero policies in Step 7E**; policy and minimum matching grant **ship together in Step 7G** |
| S-5 | **Enum versus reference table** at schema level, including **Class Grade** (`Beginner`/`Intermediate`/`Advanced`) and report status | Ratify per closed vocabulary | **RESOLVED — A-026**: enum for closed vocabularies, table for FK identity/order/label, **hybrid** for centre-owned Class Grades and the global nine dimensions |
| S-6 | **Invitation token and expiry** implementation details, and storage of `pending`/`accepted`/`expired`/`revoked` | Ratify token, expiry and state storage | **RESOLVED — A-027**: **no secret-bearing column exists**; stored status plus `expires_at` with **transactional effective-expiry evaluation**; revoke or supersede before reissue |
| S-7 | **First-migration table and enum scope** | Ratify exactly which tables and enums the first migration creates | **RESOLVED — A-031 / A-032**: **exactly 10 enums, 22 tables, 13 deterministic seed rows**; **no view, RPC or helper function**; exclusions assigned to 7F–7J |

> **Resolving S-1 … S-7 did not authorize Step 7E.** Step 7E is now **eligible**, not **authorized**, and remains **Blocked · Not accepted · Not authorized · Not started** pending a **separate explicit orchestrator authorization**.

**(1a) Opened by Step 7E — mandatory Step 7G privilege review (2026-08-03):**

| # | Unresolved decision | Blocks |
|---|---|---|
| P-1 | ~~**Pre-existing `supabase_admin` default ACL in schema `public`** may grant `anon`/`authenticated`/`service_role` privileges to **future objects created by that role**. It **did not affect the 22 Step 7E tables**, which are **`postgres`-owned and catalogue-verified at zero client privileges**.~~ **RESOLVED at Step 7G1A (2026-08-04):** audited in full before any grant or policy was designed; the hazard is conditional on the creating role and never applied; the Step 7G migration enforces `current_user = 'postgres'` fail-closed; both default-ACL sets verified unchanged after application. | ~~**Step 7G**~~ — discharged. **Standing constraint:** any future object creation under `supabase_admin` is a privilege event requiring re-audit. |

**(1b) Opened by Amendment 003 — recorded, not answered (2026-08-03):**

| # | Unresolved decision | Blocks |
|---|---|---|
| N-1 | **Invitation duration** — the `expires_at` default value | Invitation issuance behaviour only — **not** schema design |
| N-2 | **Session-lifecycle vocabulary** — the exact ratified values | The session-lifecycle checkpoint only; **no placeholder enum may be invented** |
| N-3 | **Restricted `NOLOGIN` `SECURITY DEFINER` function owner** | Deferred hardening only — migration-owner ownership is the accepted MVP default |
| N-4 | **Management bootstrap mechanism** — how the first management membership is created | The bootstrap checkpoint only |
| N-5 | **Management / trainer / parent audit-read capability** | Post-MVP only — no audit-read surface exists in this MVP |

**(2) Report / UI — blocks only its own later implementation checkpoint:**

| # | Unresolved decision | Escalation rule |
|---|---|---|
| U-1 | Exact individual **Figma Design 2 frame/node links** | Affected UI checkpoint only |
| U-2 | Exact **field inventory for Create Class** (Class Module details) | Escalates to a **Step 7E blocker only if** a missing field changes the domain relationship model |
| U-3 | Exact fields for **trainer-profile** creation | Same escalation rule |
| U-4 | Exact fields for **student-profile** creation | Same escalation rule |
| U-5 | Exact fields for **parent-profile** creation | Same escalation rule |
| U-6 | Exact **report sections and field schema** from the canonical report frame | Report UI/projection checkpoint |
| U-7 | **Responsive variants** not yet supplied | Affected UI checkpoint |

**(3) Figma assets — do not block schema work at all:**

| # | Unresolved decision |
|---|---|
| F-1 | **Figma tokens and approved asset exports** — typography, colours, spacing, radii, shadows, original logos, SVG icons, approved images |

**(4) Evidence — blocks only evidence implementation unless it alters core schema:**

| # | Unresolved decision | Note |
|---|---|---|
| E-1 | Whether **evidence media remains a completion requirement** | Amendment 001 A-001/A-003/A-004 apply in full if it does |
| E-2 | **Who uploads evidence** if evidence remains | **No replacement actor may be invented**; TA permissions must not be silently transferred |
| E-3 | Exact **evidence-related Figma screens** if retained | Evidence UI only |

**(5) Audit-design — blocked the audit-chain checkpoint (Step 7H), not the first migration. ~~STILL OPEN after Amendment 003~~ — ALL RATIFIED at the Step 7H design reconciliation (2026-08-04); see the ratification update below and D-261 … D-272:**

| # | Unresolved decision | Carried from |
|---|---|---|
| A-1 | **Audit-chain scope** — one global chain vs one chain per target/tenant | item 5 above |
| A-2 | **SHA-256 ratification** for the audit hash (Specification v3 §23 names no algorithm) | item 6 above |
| A-3 | **Audit-chain genesis rule** — sentinel vs zero-hash for the first entry | item 7 above |
| A-4 | **Canonical serialization** of an audit event for hashing | new at Step 7E0D (A-029) |
| A-5 | **Hash application and previous-hash rules** | new at Step 7E0D (A-029) |
| A-6 | **Chain verification and repair procedures** | new at Step 7E0D (A-029) |

> **Amendment 003 explicitly declines to ratify A-1 … A-6.** A-029 ratifies only the **compatibility guarantees** the first migration must not foreclose — stable account/membership attribution, durable actor foreign keys, polymorphic targets with label snapshots, one event plus related-target child rows, append-only correction-by-new-event, and data minimization. **The audit-chain mechanics must not be inferred, defaulted, or "decided in the migration."** Specification v3 §23's append-only hash-chained audit requirement is **unchanged and undiminished — it is scheduled, not weakened.**

> **Ratification update at Step 7H1A4 (2026-08-04).** A-1 … A-6 are **fully ratified at design level** by the committed audit-chain design baseline (`docs/plan/STEP_7H_AUDIT_CHAIN_BASELINE.md`, commit `3e479b6`), recorded as **D-261 … D-266** with the object inventory, boundaries and acceptance-test contract at **D-267 … D-272**. Specification v3 §23's append-only hash-chained audit requirement is **scheduled for implementation, not weakened** — **no audit-chain SQL exists**, and the next bounded checkpoint may author and stage **one** Step 7H audit-chain migration **for static review only**, stopping before local application or commit.

**Also still open (unchanged):** whether and when to create GitHub remotes; the three unresolved npm advisories (3 high, deferred to a reviewed security/dependency checkpoint); hosted Supabase linking; and the missing `BEST_Coach_AI_Features_Breakdown_v2.docx` (non-blocking for Phases 0–4).

---

## 9. Next permitted action

**Step 6B is Completed and Accepted, and all Step 6B2 sub-checkpoints (6B2A … 6B2F) are closed (2026-07-23)** — Docker Desktop `29.6.2` (WSL 2, Compose `v5.3.1`, Linux engine), project-local pinned Supabase CLI `2.109.1`, initialized local scaffold (`project_id = "best-coach-mvp"`), and a placeholder-only `.env.example`, committed as `0cdb782`; the record synchronization was committed as `a83ec7a`.

**The complete Step 7B sequence is Completed and Accepted (2026-07-24)** — Step 7A planning, the Step 7B1 diagnostic run, Step 7B-R1 remediation and verification, Step 7B-R2 remediation commit (`25551c5`), Step 7B-R3 record synchronization, Step 7B-R4 administrative record commit (`329f03c`), and Step 7B overall. The local Supabase runtime is **verified operational on Windows** (PostgreSQL 17, Auth, REST, Studio, Storage, Realtime, Kong, Mail, Postgres Meta and Edge Runtime; Analytics/Vector intentionally disabled; Docker TCP 2375 still disabled; stack currently stopped). **Phase 0 is `In progress`: local-runtime execution has begun and passed; schema, Auth population, RLS, audit-chain and application implementation have not started.**

**Step 7C is Completed and Accepted (2026-07-24)** — the current stable Supabase runtime packages were verified and **exact-pinned** (`@supabase/ssr` `0.12.3`, `@supabase/supabase-js` `2.110.8`, `server-only` `0.0.1`), Node 24 and peer compatibility passed, the automated baseline (typecheck, lint, production build) passed, exactly `package.json` and `package-lock.json` were staged, and the dependency commit **`ffd9eef`** (`chore(deps): add Supabase runtime clients`, parent `329f03c`, 2 files, 132 insertions, 2 deletions) was accepted. The current npm advisory state is **3 high, 0 moderate — unresolved**, with **no finding attributed to the newly installed Supabase runtime packages**. Installing the Supabase-native packages **did not** resolve the data-layer governance tension — D-108 still gates Step 7E and Step 7J. **The full Step 7C sequence is now closed and accepted** — Step 7C1 (dependency verification, installation and staging), Step 7C2 (dependency commit `ffd9eef`), Step 7C3 (interrupted-session recovery and record synchronization), Step 7C4 (administrative progress commit `5d10bd0`), and Step 7C overall. The Step 7C3 session-limit interruption caused **no lasting defect** and **no work was lost**.

**Step 7D is Completed and Accepted (2026-07-30)** — explicit local-versus-hosted classification, six-variable validation, and the browser-safe / request-scoped-server / separate server-only elevated client boundaries are implemented; the negative server-only proof and client-bundle private-name isolation passed; typecheck, lint and production build passed; the implementation commit **`455a070`** (`feat(platform): add Supabase client boundaries`, parent `5d10bd0`, 5 files, 363 insertions) was accepted. No query, Auth flow, hosted connection, schema, RLS, audit chain, or domain functionality was implemented. Structural credential validation does **not** prove hosted project ownership or identity — that requires a later runtime connection/identity proof.

**Step 7D is fully accepted and remains historically unchanged (2026-07-30).** Step 7D3 (record synchronization and staging), Step 7D4 (administrative progress commit `e07b213`), the full Step 7D sequence, and the Supabase environment/client-boundary foundation are complete and accepted. The `/compact` interruption during Step 7D3 caused no lasting defect and no work was lost. **The Amendment 002 product decisions do not invalidate that accepted work.**

**The earlier orchestrator pause (2026-07-30, D-175 … D-177) is closed** by an explicit new orchestrator instruction authorizing **Step 7E0 — Final MVP scope and schema-preflight governance reconciliation** as a documentation-only checkpoint. The pause record is preserved above as accepted history.

**Step 7E0 is Completed and Accepted (2026-07-30).** The final-MVP governance reconciliation was reviewed and accepted by the orchestrator and committed as **`722dcb868435e83fbeb3963cc2548d0745436406`** (`722dcb8`, `docs(governance): ratify final single-centre three-flow MVP`, parent `e07b213`, `2026-07-30 12:39:49 +0800`, 7 files changed, 1383 insertions, 123 deletions — 2 created, 5 modified; resulting commit count **12**). Sub-checkpoints **Step 7E0A** (change set) and **Step 7E0B** (commit) are both Completed and Accepted. **Amendment 002 (A-014 … A-024) is active.** Specification v3, Amendment 001 and `governance-source/` remain byte-for-byte unchanged, and the frozen demo remains unchanged and clean.

**Step 7E0C is Completed and Accepted.** The Step 7E0 acceptance record was committed as **`6551d37253e562a40d51e521b93c261daf7efdc9`** (`6551d37`, `docs(progress): record final MVP governance acceptance`, parent `722dcb8`; resulting commit count **13**) at sub-checkpoint **Step 7E0C2**.

**Step 7E0D is Completed and Accepted (2026-08-03).** The schema-critical architecture ratification was reviewed and accepted by the orchestrator and committed as **`b367475c180a2e4f4cf70ff1385f34b253356c33`** (`b367475`, `docs(governance): ratify schema-critical MVP architecture`, parent `6551d37`, `2026-08-03 02:44:20 +0800`, **3 files changed, 479 insertions, 37 deletions** — 1 created, 2 modified; resulting commit count **14**). Sub-checkpoints **Step 7E0D1** (read-only analysis), **Step 7E0D2A** (change set) and **Step 7E0D2B** (commit) are all Completed and Accepted. **Amendment 003 (A-025 … A-032) is active**, recording the accepted Decisions A – G with all binding corrections, the accepted centre seed identity **`ispeak` / `iSpeak Academy`**, and the exact Step 7E boundary of **10 enums, 22 tables and 13 deterministic seed rows**. Specification v3, Amendment 001, Amendment 002 and `governance-source/` remain byte-for-byte unchanged, and the frozen demo remains unchanged and clean.

**Step 7E is Completed and Accepted (2026-08-03).** Under a **bounded orchestrator authorization covering Step 7E only**, the first governed SQL migration was authored (**7E1A**), corrected after static architecture review (**7E1B**), applied and verified against a **clean local disposable Supabase database only** (**7E2A**), and committed as **`252ef9b13008629cadc238bdf58b7016c50bb7b2`** (`252ef9b`, `feat(supabase): add governed core schema migration`, parent `584691e`, `2026-08-03 04:37:05 +0800`, **1 file changed, 1,209 insertions, 0 deletions**, `create mode 100644`; resulting commit count **16**). The local catalogue confirmed the exact ratified boundary — **10 enums, 22 tables, 13 deterministic seed rows, 44 foreign keys, 43 explicit indexes** — with **RLS enabled on all 22 tables, zero policies**, and **zero effective client table privileges** for `PUBLIC`, `anon`, `authenticated` and `service_role`. **Database lint returned zero errors and zero warnings.** **No hosted database was accessed**, and the local stack was stopped cleanly afterwards. Specification v3, Amendments 001–003, `CLAUDE.md`, the Implementation Plan and `governance-source/` remain byte-for-byte unchanged, and the frozen demo remains unchanged and clean.

**Step 7F design is Completed and Ratified (2026-08-03).** The orchestrator ratified the exact synthetic-fixture baseline and it was committed as **`936cf4e9b131b99943db6724bfb6eb9b23c07050`** (`936cf4e`, `docs(fixtures): ratify synthetic fixture baseline`). **Ratifying the design authorized nothing** — implementation required, and received, a **separate explicit orchestrator authorization bounded to Step 7F**, recorded below. No RLS policy, client grant, RPC, view, function, trigger, audit object, generated database type, application code, test or Figma asset exists. The audit-chain scope, SHA-256 ratification, genesis rule, canonical serialization, previous-hash rules and verification/repair procedures remain **retained for Step 7H and deliberately not ratified**. The accepted sequence **7F → 7G → 7H → 7I → 7J** is preserved unchanged, and **Step 7G must begin with the P-1 default-ACL privilege review**.

**Step 7F is Completed and Runtime-Accepted (2026-08-03).** Under a **bounded orchestrator authorization covering Step 7F only**, the deterministic local synthetic fixture was authored (**7F1A**), reconciled and statically audited (**7F1B**), blocked once for lack of a genuine interactive TTY (**7F1C**), corrected three times (**7F1C1** Windows password handler, **7F1C2** domain SQL operation guard, **7F1C3** negative tests N2/N3/N4 and the loader exit path), independently verified (**7F1D**) and committed as **`e197f91bbdf3196ef8e0eeee8216d6e7d8e495a7`** (`e197f91`, `feat(fixtures): add deterministic local fixture baseline`, parent `098d0eaf2bcba912c366aee6789813410df86b48`, `2026-08-03 23:07:57 +0800`, **5 files changed, 2,208 insertions(+), 1 deletion(-)**; resulting commit count **20**). Delivered **3 deterministic Auth users**, **25 application-domain rows** and **28 canonical rows** with canonical SHA-256 **`d6a314b40bb5eb1bc3169097e2a9cb03858791498ca5137a43050cee36b87517`**, identical across the bounded reload and **two** reset-and-clean-load cycles and reproduced independently. **37 positive assertions and all 7 negative tests passed with no residue**; Step 7E seeds remained **1 centre, 3 grades and 9 dimensions**; **one** migration is applied; **RLS is enabled on all 22 tables** with **zero policies** and **zero unintended privileges**. Applied to a **local disposable database only** — **no hosted database was accessed**, the project has never been linked, and the stack was **stopped after independent verification**. Specification v3, Amendments 001–003, `CLAUDE.md`, the Implementation Plan and `governance-source/` remain byte-for-byte unchanged, and the frozen demo remains unchanged and clean.

**Step 7G is Completed and Runtime-Accepted (2026-08-04).** Under bounded per-checkpoint orchestrator authorizations, the **P-1 default-ACL audit** was performed and resolved (**7G1A**), the relationship-authorization migration was authored (**7G1B**), adversarially reviewed with one proven defect corrected (**7G1C**), applied and runtime-proven entirely as `authenticated`/`anon`/`service_role`/`authenticator` — never as `postgres` (**7G1D**), and committed as **`17d7ddc4e7264ffe0a545d3830813af94b7ac688`** (`feat(authz): add relationship-scoped read policies`, **1 file, 938 insertions**; resulting commit count **22**) (**7G1E**); the fixture-verification suite was then reconciled from its five superseded Step 7F-era posture assumptions and twice runtime-proven with the identical canonical checksum (**7G1F**), and committed as **`97f3fb2ed05f7fc3ddcec5e3f5e13b15da668b1f`** (`test(fixtures): reconcile verification with relationship policies`, **1 file, 203 insertions, 31 deletions**; resulting commit count **23**) (**7G1G**). Delivered: **6 authorization helpers · 29 permissive SELECT policies · 13 SELECT grants to `authenticated` only**, with `anon`/`service_role`/`authenticator`/`PUBLIC` at **zero**, the nine report/assessment/invitation tables policy-free and grant-free, and the full denial, inactive-relationship and cross-centre decoy suites passing with zero residue. The fixture and its canonical checksum remained byte-identical throughout. **Applied to the local disposable database only — no hosted access, no link, no `.env.local`, no password.** Specification v3, Amendments 001–003, `CLAUDE.md`, the Implementation Plan and `governance-source/` remain byte-for-byte unchanged, and the frozen demo remains unchanged and clean.

**The Step 7G acceptance record is Committed and Accepted (2026-08-04)** — committed as **`6ba61596b524df77ca5366c19b4521f3041f0072`** (`6ba6159`, `docs(progress): record relationship authorization acceptance`, parent `97f3fb2…`, **3 files**; resulting commit count **24**), recording **D-253 … D-260** with the workspace tracker synchronized byte-for-byte into the migration copy.

**Step 7H design reconciliation is Completed and Ratified (2026-08-04).** Under bounded per-checkpoint orchestrator authorizations, the audit-chain contract **A-1 … A-6** was reconciled and ratified in `docs/plan/STEP_7H_AUDIT_CHAIN_BASELINE.md` (**7H1A**), adversarially reviewed with every factual and specification defect corrected before ratification (**7H1A2**), and committed as **`3e479b69b1a4cd3592daf3edc321e92929002dbb`** (`3e479b6`, `docs(audit): ratify audit-chain design baseline`, parent `6ba6159…`, `2026-08-04 20:48:37 +0800`, **1 file, 378 insertions(+)**; resulting commit count **25**) (**7H1A3**). Ratified: per-centre chain scope and threat model; core-`sha256(bytea)` same-transaction hashing; seeded-head genesis with a race-proven READ COMMITTED first-append protocol; the versioned `BESTCOACH-AUDIT-V1` canonical envelope and deterministic byte-ordered JSON serializer; the governed `audit_append_event` protocol with validated actor authority, guard triggers and per-RPC duplicate gates; and complete/partial `audit_verify_chain` semantics with no-repair incident handling. **Ratifying the design authorized nothing** — **no audit-chain SQL, migration, table, function, trigger, policy or grant exists**; Supabase remained **stopped**; no database, Docker, psql or hosted operation occurred. Specification v3, Amendments 001–003, `CLAUDE.md`, the Implementation Plan and `governance-source/` remain byte-for-byte unchanged, and the frozen demo remains unchanged and clean.

**Step 7H migration application, dual proof and substantive commit are accepted at the Step 7H1F handoff boundary (2026-08-05).** Step 7H1D primary Codex runtime proof and Step 7H1E independent fresh-chat Codex verification passed. Migration `20260804213000` was applied locally and committed as **`ef2252119babee1714b335ac43b6bf4bbd4ee582`** (`ef22521`, `feat(audit): add tamper-evident audit chain`, parent `88f0fe2…`, one file, 1,550 insertions). The fixture remains Auth `3`, domain `25`, canonical `28`, checksum `d6a314b40bb5eb1bc3169097e2a9cb03858791498ca5137a43050cee36b87517`; the real audit tables remain `0/0/0`; the local stack is stopped with volumes preserved. **The committed fixture verifier remains unchanged and Step 7H final acceptance remains pending its bounded A32/A33/A34/A35/A38/D5 reconciliation and two complete runtime runs.**

**Step 7H is Completed and Fully Accepted (2026-08-05).** Under an autonomous overnight-completion authorization bounded strictly to Step 7H, the fixture verifier was reconciled to the applied audit-chain migration — changing only **A32, A33, A34, A35, A38 and D5**, with every other assertion, all seven negative tests, the canonical checksum region and the fixture identities proven byte-unchanged by two independent adversarial subagents plus the parent's own containment analysis (**D-279**) — then run **twice pre-commit** against the preserved database through the documented `docker exec` psql contract with zero substitution, reduction or edit between runs, both passing with byte-identical output (**D-280**), committed as **`617ca4b29471625c1bc13c91ae66605e9eca72dc`** (`617ca4b`, `test(fixtures): reconcile verifier with audit chain`, parent `643d973…`, 1 file, 206 insertions, 42 deletions; resulting commit count **29**) (**D-281**), and run **twice more post-commit** against a freshly restarted preserved stack, all four runs producing byte-identical stdout/stderr and passing, with a final independent state re-check confirming every required value (**D-282**). The complete Step 7H sequence — design, adversarial review, migration, dual Codex proof, Codex-to-Claude handoff, and this reconciliation — is now **fully accepted** (**D-283**). The audit infrastructure is reusable plumbing only and remains **empty** until a future governed RPC calls `audit_append_event`; nothing in this record appends an audit event. Supabase was stopped after each runtime phase with all three volumes preserved throughout, and zero lingering process was confirmed at every stop.

**The Step 7H final acceptance record is Committed and Accepted (2026-08-05)** — committed as **`42d3c0292d7bc9e6442c4d4fc2398e5ee25de1a6`** (`42d3c02`, `docs(progress): record Step 7H final acceptance`, parent `617ca4b…`, **3 files**; resulting commit count **30**).

**Step 7I1 is Completed and Ratified (2026-08-05).** Under bounded per-checkpoint orchestrator authorizations, the Step 7I report-lifecycle design baseline was authored (**7I1A**), adversarially reviewed and reconciled to the ratified two-stage workflow (**7I1B**, **7I1B-R0**, **7I1B-R1**, **7I1B-R2**), independently re-reviewed with a BLOCKED outcome of one critical, ten high and nine medium defects (**7I1C**), corrected under ten operator decisions (**7I1D-R2**), re-reviewed with a BLOCKED outcome of four blocking and three non-blocking defects (**7I1E**), corrected under one further operator decision (**7I1F-R3**), and finally **independently re-verified, ratified and committed (7I1G)** — baseline verification (**D-285**), design verification (**D-286**), ratification of Amendment 004 and the lifecycle design (**D-287**), Step 7I1 closure (**D-288**), the fixed censuses (**D-289**), canonical/disposable database isolation (**D-290**), the no-implementation boundary and outstanding physical-test dependencies (**D-291**), and the Step 7I2A authorization boundary (**D-292**). **Every step of this sequence was document-only: no SQL, migration, RPC, server action, fixture, generated type, application code or UI was authored, and no Supabase, Docker, psql, fixture, verifier or application runtime was started.**

**The 48-hour physical-test slice contract is accepted and the parallel worktrees are ready (2026-08-05).** The shared contract `docs/plan/PHYSICAL_TEST_SLICE_48H.md` and the two branch-local operational logs `docs/workstreams/48H_BACKEND_PROGRESS.md` and `docs/workstreams/48H_FRONTEND_PROGRESS.md` were created and committed as `docs(plan): define 48-hour physical-test slice`, together with the three canonical progress records — six repository files in one path-scoped commit, with `git add -A` and `git add .` never used and the workspace-level tracker deliberately not staged because it lies outside the repository. The isolated branches **`feat/48h-backend`** (worktree `C:\Users\enyul\Vibe Studio\B.E.S.T-Coach-Workspace\worktrees\backend-48h`) and **`feat/48h-frontend`** (worktree `C:\Users\enyul\Vibe Studio\B.E.S.T-Coach-Workspace\worktrees\frontend-48h`) were created **from that same commit** and verified to resolve to it. The contract is **subordinate to every governing document, authorizes no checkpoint, and narrows no part of `CLAUDE.md` §12** (**D-294**). Baseline verification (**D-293**), the pinned frontend/backend boundary (**D-295**), the AI boundary and provider posture (**D-296**), file ownership and the blocker protocol (**D-297**), the two branch-local logs (**D-298**), the follow-up-commit-free baseline resolution (**D-299**) and the five named implementation checkpoints (**D-300**) are all recorded. **Setup only — no implementation began, no dependency was installed, no Supabase, Docker, psql, fixture, verifier or server runtime was started, no merge was performed, and no tag, remote or push exists.**

**CP-2 and CP-4 are resolved by design, and both worktrees sit on the new shared baseline (2026-08-05).** `docs/plan/PHYSICAL_TEST_ASSESSMENT_WRITE_BASELINE.md` was authored and committed as `docs(plan): define governed assessment persistence`, together with the CP-2/CP-4 portions of the 48-hour contract and the three canonical progress records — five repository files in one path-scoped commit, with `git add -A` and `git add .` never used and the workspace-level tracker deliberately not staged because it lies outside the repository. **`feat/48h-backend` and `feat/48h-frontend` were then fast-forwarded with `--ff-only`** to that same commit, both verified clean, on their correct branches and paths, and carrying no implementation change. The **option (c) audit ruling** (**D-302**), the truthful-audit boundary owned by `requestDraft` (**D-303**), the two ratified functions (**D-304**, **D-305**) and the separately-recorded census delta (**D-306**) are all captured, with baseline verification and the reported blocker at **D-301**. **Design only — no implementation exists.**

**Current permitted action:** begin **backend Round B1** and **frontend Round F1** in parallel, each in its own worktree, both now on the new shared baseline. **Step 7I2A remains the first backend sub-checkpoint and still requires its own explicit orchestrator authorization**, as do 7I2B … 7I2G and 7J. **Assessment implementation is Backend Round B2, after Step 7I acceptance, in its own separately-authorized migration** — no assessment SQL, RPC, server action or generated type may be authored until then. **CP-3** (queue and list projections) resolves at backend Round 2 design; **CP-5** (N-4 management bootstrap) remains open and non-blocking. **Canonical progress is reconciled only from `main`, after both workstream reports are received.**

---

**Historical — the preceding entry, retained unchanged.**

**Current permitted action:** await explicit orchestrator authorization for **Step 7I2A**. The Step 7I1G commit contains exactly eight in-repository files — the five ratified design documents plus the three progress records — and the workspace tracker is synchronized byte-for-byte into the repository migration copy within that same commit. The workspace tracker lies outside the repository and is deliberately not staged. No tag, remote or push exists.

**Exact next Claude Code checkpoint:** **Step 7I2A** (**D-292**) — author and stage the **exactly two** Step 7I migration files for static review: file 1 containing **only** `ALTER TYPE public.report_status ADD VALUE 'trainer_approved' AFTER 'needs_edit'` under the P-1 fail-closed ownership guard, and file 2 containing every other authorized object (the two correction enums, the correction-request table with its `centre_id`, composite FKs, RLS enablement and revokes, the three `report_versions` columns, the four constraint replacements, the `approver_role` default drop, the two serializers, `app_parent_reaches_student`, the fourteen granted RPCs, the internal draft-storage RPC, and the end-of-migration posture assertions). **No application. No Step 7I SQL, RPC, server action, fixture, UI component or generated type may be authored, staged or applied until Step 7I2A is explicitly authorized.** Do not create application code, governed business RPCs, generated types, tags or remotes, and do not push.
