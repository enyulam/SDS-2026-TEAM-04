# B.E.S.T Coach — Demo-to-MVP Migration Tracker

**Purpose:** Durable source of truth for selectively migrating the completed local trainer-flow demo into the fresh MVP repository without relying on chat memory.

**Scope:** This tracker governs only the demo-to-MVP migration. It ends when every relevant demo asset has been ported, rejected, or superseded and the MVP has no dependency on demo-only architecture.

**Current checkpoint:** Step 7A — Phase 0 foundation-slice planning  
**Checkpoint status:** Pending  
**Current permitted action:** After the Step 6B2 record-synchronization commit is accepted, perform a **read-only Phase 0 planning review**, define the **first bounded implementation slice** and its **tests**, and **stop before implementation**.

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
4. Stitch exports
   - visual reference only.
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

**Status:** Pending  
**Accepted by orchestrator:** No

_(Previously titled "Complete MVP Phase 0 foundations" and marked `Blocked by Step 6`. Step 6 closed on 2026-07-23, so this step is now unblocked and retitled; the objective and exit evidence below are unchanged.)_

### Step 7A — Phase 0 foundation-slice planning

**Status:** Pending  
**Accepted by orchestrator:** No

**Scope (read-only planning — no implementation):**

- [ ] **Re-read the governing Phase 0 sections** of the Specification v3, Amendment 001, root `CLAUDE.md`, and the Implementation Plan.
- [ ] **Inspect the committed local Supabase scaffold** (`supabase/config.toml`, `supabase/.gitignore`, `.env.example`) at commit `0cdb782`.
- [ ] **Determine the exact first bounded Phase 0 implementation slice.**
- [ ] **Decide the sequence** for:
  - [ ] starting and verifying the **local Supabase stack**;
  - [ ] installing **`@supabase/ssr`** and **`@supabase/supabase-js`**;
  - [ ] introducing **server-only boundaries**;
  - [ ] creating the **first SQL migration**;
  - [ ] defining **generated database-type placement**;
  - [ ] **linking to the hosted Singapore project only when explicitly approved**.
- [ ] **Define tests and stopping conditions** for the slice.
- [ ] **Do not implement Phase 0 during Step 7A.**

**Explicit constraints carried into Step 7A:**

- Local **`supabase start` belongs to Phase 0 execution**, not to the completed tooling setup — it was deliberately not run in Step 6B.
- **Hosted-project linking and remote migrations require a separate explicit checkpoint** and explicit orchestrator approval.
- **No real child, parent, trainer, or academy data may be used.**
- **Synthetic data only.**
- The **append-only audit hash chain**, the **RLS proof**, and the **core schema** remain **mandatory Phase 0 deliverables**.
- **No Phase 1–4 feature may be built early.**

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
- [ ] Quick mode supports four competency dimensions
- [ ] Full mode supports all nine dimensions
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
- **Latest HEAD:** `a39ed21d4ecf405b3425db711e63a2f71f0f1586` (short `a39ed21`)
- **Total commits:** `3` — `4de3f93` (scaffold) → `c7c27e5` (governance baseline) → `a39ed21` (closure synchronization)
- **Working tree:** `Clean`
- **Governance installation:** `Completed and accepted` (commit `c7c27e5`)
- **Governance closure synchronization:** `Completed and accepted` (commit `a39ed21`)
- **Phase 0:** `Not started`
- **Next checkpoint:** `Step 7A` — Phase 0 foundation-slice planning
- **Tag:** `None` · **Remote:** `None` · **Push:** `None`

**Local tooling state (accepted at Step 6B, 2026-07-23 — non-secret tooling evidence only; no credential value or project URL recorded):**

- **HEAD:** `0cdb7825b0d4bcd9ad9b40323a3e90228065f006` · **Short HEAD:** `0cdb782`
- **Total commits:** `4` · **Working tree:** `Clean`
- **Docker Desktop:** `Running with WSL 2` (client and engine `29.6.2`, Compose `v5.3.1`, Linux engine, `x86_64`; insecure TCP 2375 disabled; Kubernetes not enabled)
- **Supabase CLI:** `2.109.1` — **project-local and exact-pinned** (dev dependency; no global install; invoked via `npx --no-install`)
- **Local Supabase scaffold:** `Initialized` (`supabase/config.toml`, `supabase/.gitignore`)
- **Project identifier:** `best-coach-mvp`
- **Local Supabase stack:** `Not started` (`supabase start` never run; 0 containers, 0 images)
- **Hosted Supabase project:** `Not linked through CLI` (no login, no link, no access token on this machine)
- **`.env.example`:** `Committed, placeholder-only` (six approved variable names; only the non-secret selectors carry values)
- **`.env.local`:** `Present, ignored, and untracked` (never printed, hashed, copied, or committed)
- **Phase 0:** `Not started`
- **Next checkpoint:** `Step 7A`

**Phase 0 prerequisite state (accepted at Step 6A, 2026-07-22 — no credential value recorded):**

- `.env.local`: **present, ignored, and untracked** (six approved application variables; contents never read)
- **Supabase project:** confirmed
- **Supabase region:** Singapore (`ap-southeast-1`), **orchestrator-verified** in the dashboard
- **Supabase configuration:** present locally (URL, publishable key, secret key)
- **LLM provider:** OpenAI · **LLM model:** `gpt-5.6-terra` · **LLM key:** present locally
- **AI contract:** Responses API with Structured Outputs (strict JSON Schema)
- **Data access:** Supabase-native, **no general-purpose ORM**
- **Supabase CLI:** not installed · **Docker-compatible runtime:** **installed and verified at Step 6B1** (Docker Desktop `29.6.2`, WSL 2 backend, Compose `v5.3.1`, Linux engine)

> **Tracker/copy synchronization note.** The MVP migration copy (`docs/progress/DEMO_TO_MVP_MIGRATION.md`) was re-synchronized **byte-for-byte** from this tracker during **Step 6B2D**, absorbing the Step 5 closure lead and the whole of Step 6. Per **D-060 … D-066**, this record does not contain the hash of the commit that will carry it; that closure commit hash is recorded in the **next** normal progress-record update rather than through a self-referential administrative commit. The resulting one-update lead is intentional and is not drift.
- Current phase: **Phase 0 not started**
- **Next checkpoint:** Step 7A — Phase 0 foundation-slice planning
- **Active migration copy:** re-synchronized during Step 6B2D (byte-identical to this tracker)
- **AI Features Breakdown:** missing but **non-blocking** for Phase 0 and current MVP scope
- **Stitch assets:** not installed; disposition deferred
- **npm advisories:** two moderate findings deferred for reviewed handling
- Supabase project: **Confirmed; Singapore region orchestrator-verified (Step 6A2)**
- **Governance documents: INSTALLED (uncommitted, staged at Step 5B2)**
  - Root `CLAUDE.md` installed (reconciled to Amendment 001)
  - Specification v3 installed **unchanged** (`64d54aa2…`)
  - Amendment 001 installed (A-001 … A-013)
  - Reconciled Implementation Plan installed
  - `STATUS.md` and `BUILD_NOTES.md` installed
  - Active migration copy `docs/progress/DEMO_TO_MVP_MIGRATION.md` installed in this checkpoint
  - `docs/ui-screens/` not created (A-013); AI Features Breakdown v2 absent (A-011), not fabricated
- Latest committed HEAD remains `4de3f93c64ffea4883655f411d2f35a9a35f15d6` — the governance baseline is **staged, not yet committed** (Step 5B3)
- Remote/GitHub: None — no remote, nothing pushed
- Outstanding follow-up: 2 moderate npm audit advisories from scaffold (deferred to later security/dependency review; no auto-fix without review)

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

---

## 8. Open decisions

- ~~Exact demo repository path~~ — resolved (D-011)
- ~~Exact parent workspace and MVP repository paths~~ — resolved (D-011)
- ~~Whether demo Step 15 should be completed before freeze~~ — resolved: skipped, freeze at Step 14 (D-012)
- ~~Package manager for MVP~~ — resolved: npm (D-021)
- ORM/data-layer choice
- LLM provider
- Supabase project creation and region
- Final reconciled parent-evidence policy
- Whether and when to create GitHub remotes

---

## 9. Next permitted action

**Step 6B is Completed and Accepted (2026-07-23)** — Docker Desktop `29.6.2` (WSL 2, Compose `v5.3.1`, Linux engine), project-local pinned Supabase CLI `2.109.1`, initialized local scaffold (`project_id = "best-coach-mvp"`), and a placeholder-only `.env.example`, all committed as `0cdb782`.

**Step 7A (Pending — next checkpoint, read-only):** after the Step 6B2 record-synchronization commit is accepted, re-read the governing Phase 0 sections, inspect the committed local Supabase scaffold, determine the **first bounded Phase 0 implementation slice**, decide the sequence for starting the local stack, installing `@supabase/ssr` and `@supabase/supabase-js`, introducing server-only boundaries, creating the first SQL migration, and placing generated database types, define **tests and stopping conditions**, and **stop before implementation**.

**Do not:** implement Phase 0; run `supabase start` (that belongs to Phase 0 execution); authenticate to or link the hosted Supabase project (`supabase login` / `supabase link` require a separate explicit checkpoint); run local or remote migrations; install dependencies; expose, print, hash, or commit any credential value; use real child, parent, trainer, or academy data (synthetic only); build any Phase 1–4 feature early; modify the frozen demo or `governance-source`; configure a remote or push.

**Do not:** implement Phase 0; create the Supabase project or perform browser/OAuth setup (orchestrator-only); print, report, or commit any secret value; create `.env.local`; install dependencies; run typecheck/lint/build or the application; configure a remote or push; modify the frozen demo, `governance-source`, or any accepted governance document. Stitch assets and the missing AI Features Breakdown are **not** Phase 0 prerequisites.
