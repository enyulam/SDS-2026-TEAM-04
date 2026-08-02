# B.E.S.T Coach — Demo-to-MVP Migration Tracker

**Purpose:** Durable source of truth for selectively migrating the completed local trainer-flow demo into the fresh MVP repository without relying on chat memory.

**Scope:** This tracker governs only the demo-to-MVP migration. It ends when every relevant demo asset has been ported, rejected, or superseded and the MVP has no dependency on demo-only architecture.

**Current checkpoint:** Step 7E0D2C — Record and stage acceptance of the schema-critical architecture ratification (**documentation only**)  
**Checkpoint status:** Staged — acceptance-record commit pending  
**Current permitted action:** Orchestrator review of the staged acceptance-record change set (three progress files). Do not write SQL, create schema/seed/Auth data, or begin Step 7E.  
**Step 7E0:** **Completed · Accepted by orchestrator (2026-07-30)** — substantive governance commit **`722dcb8`**  
**Step 7E0D:** **Completed · Accepted by orchestrator (2026-08-03)** — substantive ratification commit **`b367475`**  
**Next authorized checkpoint:** **None beyond this acceptance record.** Step 7E requires a **separate explicit orchestrator authorization** that has not been given.  
**Step 7E:** **Blocked · Not accepted · Not authorized · Not started**

> **Step 7D and Step 7E0 remain historically unchanged and fully accepted.** The Step 7E0 documentation reconciliation was **reviewed and accepted by the orchestrator on 2026-07-30** and committed as **`722dcb868435e83fbeb3963cc2548d0745436406`**. It created **Specification v3 Amendment 002** (A-014 … A-024) and the Figma Design 2 screen implementation matrix, and aligned the active governance, plan and progress documents with the orchestrator's final confirmed MVP scope. **No schema or application implementation was authorized by it, and none has occurred.**
>
> **Step 7E0D is now completed and accepted (2026-08-03).** The schema-critical architecture ratification was **reviewed and accepted by the orchestrator** and committed as **`b367475c180a2e4f4cf70ff1385f34b253356c33`**. It created **Specification v3 Amendment 003** (**A-025 … A-032**) and reconciled `CLAUDE.md` and the Implementation Plan to it. It records the **exact Step 7E boundary — 10 enums, 22 tables and 13 deterministic seed rows** — and the accepted centre seed identity **`ispeak` / `iSpeak Academy`**. **Amendment 003 governs schema architecture and migration boundaries; it is not an implementation authorization.** **No SQL, migration, schema, Auth, fixture, runtime or UI implementation has occurred, and Step 7E remains blocked, unauthorized and unstarted.** This Step 7E0D2C checkpoint records that acceptance and authorizes **nothing further**.

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

**Status:** **Blocked**  
**Accepted by orchestrator:** **No**  
**Authorized:** **No**  
**Started:** **No**

**Blocking reason (updated 2026-08-03).** Both preceding blockers are now cleared: the Step 7E0 governance reconciliation is **completed and accepted** (commit `722dcb8`), and **Step 7E0D — Schema-critical decision ratification is completed and accepted** (commit `b367475`), resolving all seven schema-critical decisions at spec-amendment precedence as **Amendment 003 A-025 … A-032**.

**Step 7E nevertheless remains Blocked · Not accepted · Not authorized · Not started.** The remaining blocker is **authorization itself**, not analysis:

- **Amendment 003 governs schema architecture and migration boundaries — it is not an implementation authorization.** Ratifying what the first migration would contain is not the same as authorizing it to be written.
- **Step 7E requires a separate, explicit orchestrator authorization**, which **has not been given**.
- Passing the governance and schema-preflight gate makes Step 7E **eligible**; it does **not** make it **authorized**.
- **No SQL, migration file, `seed.sql`, Supabase function, Auth user, fixture, database type, application code, test, dependency, runtime process or Figma asset exists or has been created.** Tracked `.sql` files: **0**. `supabase/migrations`, `supabase/seed.sql` and `supabase/functions` are all **absent**.

**Original blocking decisions — all seven now resolved by Amendment 003:**

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
- **No migration may still be written.** Resolution of the blockers did **not** authorize implementation.
- **The accepted checkpoint sequence after Step 7E is preserved unchanged:** **7E** first governed migration → **7F** synthetic Auth users and domain fixtures → **7G** RLS policies with their minimum matching grants → **7H** audit tables and hash chain → **7I** reviewed read/mutation RPCs and server-action proof → **7J** committed generated database types.
- **No schema implementation is authorized. Step 7E requires a separate explicit orchestrator authorization.**

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
- **Latest HEAD:** `b367475c180a2e4f4cf70ff1385f34b253356c33` (short `b367475`)
- **Total commits:** `14` — `4de3f93` (scaffold) → `c7c27e5` (governance baseline) → `a39ed21` (closure synchronization) → `0cdb782` (Supabase tooling scaffold) → `a83ec7a` (tooling closure records) → `25551c5` (Windows local-stack remediation) → `329f03c` (Phase 0 runtime foundation records) → `ffd9eef` (Supabase runtime dependencies) → `5d10bd0` (Supabase dependency records) → `455a070` (Supabase client boundaries) → `e07b213` (Supabase client-boundary records) → `722dcb8` (final single-centre three-flow MVP governance ratification) → `6551d37` (final MVP governance acceptance records) → `b367475` (schema-critical MVP architecture ratification)
- **Working tree:** `Clean` (before the Step 7E0D2C acceptance-record edits, which touch only the three progress files)
- **Governance installation:** `Completed and accepted` (commit `c7c27e5`)
- **Governance closure synchronization:** `Completed and accepted` (commit `a39ed21`)
- **Phase 0:** `In progress` — local-runtime execution and Supabase environment/client boundaries complete; **schema/application implementation not started**
- **Next checkpoint:** `None authorized beyond the Step 7E0D2C acceptance record.` **Step 7E requires a separate explicit orchestrator authorization that has not been given.**
- **Tag:** `None` · **Remote:** `None` · **Upstream:** `None` · **Push:** `None`

**Local tooling and runtime state (accepted at Step 7D5, 2026-07-30; repository fields refreshed at Step 7E0C and again at Step 7E0D2C — non-secret evidence only; no credential value or project URL recorded):**

- **Current repository HEAD:** `b367475c180a2e4f4cf70ff1385f34b253356c33` · **Short HEAD:** `b367475`
- **Total commits:** `14` · **Working tree:** `Clean` (before the Step 7E0D2C acceptance-record edits, which touch only the three progress files)
- **Latest substantive governance commit:** `b367475c180a2e4f4cf70ff1385f34b253356c33` (schema-critical architecture ratification, 2026-08-03) · **preceding substantive governance commit:** `722dcb868435e83fbeb3963cc2548d0745436406`
- **Latest substantive tooling commit:** `0cdb7825b0d4bcd9ad9b40323a3e90228065f006`
- **Latest substantive runtime commit:** `25551c5d733fa581844db35ae3647c0ca8d52190`
- **Latest substantive dependency commit:** `ffd9eef8677f9183175a66f7de00f9fef1223fab`
- **Latest substantive platform commit:** `455a0706b5555c0b4f083327dfd5613d3aa23245`
- **Latest administrative progress commit:** `6551d37253e562a40d51e521b93c261daf7efdc9` (final MVP governance acceptance records) · **preceding:** `e07b2138c9b670ebd3feda41c89782056cb8a6d5`
- **Supabase environment/client boundaries:** **`Implemented`** — browser-safe, request-scoped, and separate server-only elevated clients; committed as `455a070`
- **Runtime dependencies (exact-pinned):** `@supabase/ssr` `0.12.3` · `@supabase/supabase-js` `2.110.8` · `server-only` `0.0.1`
- **Docker Desktop:** `Running with WSL 2` (client and engine `29.6.2`, Compose `v5.3.1`, Linux engine, `x86_64`; Kubernetes not enabled)
- **Supabase CLI:** `2.109.1` — **project-local and exact-pinned** (dev dependency; no global install; invoked via `npx --no-install`)
- **Local Supabase scaffold:** `Initialized` (`supabase/config.toml`, `supabase/.gitignore`)
- **Project identifier:** `best-coach-mvp`
- **Local Supabase runtime:** **`Verified operational`** (Step 7B; 10 required services healthy)
- **Local Supabase stack:** **`Currently stopped`** (0 containers; 13 images and 3 volumes retained)
- **Analytics / Vector:** **`Disabled locally`** (optional; incompatible with the accepted Windows security posture)
- **Docker TCP 2375:** **`Disabled`**
- **PostgreSQL:** **`17`** · **Local `public` application tables:** **`0`**
- **Hosted Supabase project:** `Not linked through CLI` (no login, no link, no access token on this machine)
- **`.env.example`:** `Committed, placeholder-only` (six approved variable names; only the non-secret selectors carry values)
- **`.env.local`:** `Present, ignored, and untracked` (never printed, hashed, copied, or committed)
- **Database schema / Auth / RLS / audit implementation:** **`Not started`**
- **Phase 0:** **`In progress`**
- **Step 7D:** **`Complete and accepted`** — Step 7D1 → Step 7D4 and Step 7D overall; environment/client boundaries implemented (`455a070`); records committed (`e07b213`)
- **Step 7E0 (final MVP scope and schema-preflight governance reconciliation):** **`Completed and accepted (2026-07-30)`** — committed as `722dcb8`; sub-checkpoints **7E0A** (change set) and **7E0B** (commit) both Completed · Accepted
- **Step 7E0C (acceptance record):** **`Completed and accepted`** — committed as `6551d37` (`docs(progress): record final MVP governance acceptance`)
- **Step 7E0D (schema-critical decision ratification):** **`Completed and accepted (2026-08-03)`** — committed as `b367475`; sub-checkpoints **7E0D1** (read-only analysis), **7E0D2A** (change set) and **7E0D2B** (commit) all Completed · Accepted; documentation and architecture-decision work only; **no SQL or application implementation was authorized, and none occurred**
- **Step 7E:** **`Blocked · Not accepted · Not authorized · Not started`** — the analysis blockers are cleared, but **Step 7E requires a separate explicit orchestrator authorization that has not been given**
- **Step 7E0-B (former designation):** **`Superseded in designation by Step 7E0D; never started`**
- **Amendment 002:** **`Active (A-014 … A-024)`** — ratified and committed at `722dcb8`; one-centre / three-flow boundary, canonical hierarchy, mandatory nine dimensions, attendance defaults, management administration, identity/invitation model, one canonical report, Figma Design 2 authority, Supabase-native / no ORM, revised phasing
- **Amendment 003:** **`Active (A-025 … A-032)`** — ratified 2026-08-03 and committed at `b367475`; centre-independent `accounts` with membership-scoped roles, enum-vs-reference-table rules, the absolute authentication-secret prohibition, the report aggregate/version model with **approval as the freeze point**, audit-compatibility guarantees, the deny-by-default privilege posture, and the **exact Step 7E boundary of 10 enums / 22 tables / 13 deterministic seed rows** with explicit exclusions. **Clarifies rather than reverses Amendment 002; names no Amendment 001 clause. Governs schema architecture and migration boundaries — not implementation authorization.**
- **Accepted Step 7E inventory:** **`10 enums · 22 tables · 13 deterministic seed rows`** — **not created**; no migration exists
- **Accepted centre seed identity:** code **`ispeak`** · display name **`iSpeak Academy`** — **recorded only; not seeded**
- **Database schema / migrations / seed / Auth population / RLS / audit implementation:** **`Not started`** — tracked `.sql` files: **0**; `supabase/migrations`, `supabase/seed.sql`, `supabase/functions`: **absent**
- **Next checkpoint:** `None authorized beyond the Step 7E0D2C acceptance record`

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
> - **The Step 7E0D substantive commit `b367475` deliberately changed no progress file.** It contained exactly three files — Amendment 003, `CLAUDE.md` and the Implementation Plan — so the tracker and the committed migration copy remained **byte-identical** across it. **Step 7E0D2C re-synchronizes both sides again** with this acceptance record, keeping them byte-identical (staged; commit pending).
> - **No commit will be created solely** to make committed progress files acknowledge their own administrative commit — the anti-recursion rule is unchanged for future administrative checkpoints. **This checkpoint therefore records the substantive commit `b367475`, and does not record the hash of its own future administrative commit.**
> - This arrangement is **intentional — it is not drift**.
- **Current phase: Phase 0 — In progress** (local-runtime execution and Supabase environment/client boundaries complete; schema, Auth population, RLS, audit-chain and application implementation **not started**)
- **Next checkpoint:** **None authorized beyond this Step 7E0D2C acceptance record.** Step 7E requires a **separate explicit orchestrator authorization**
- **Active migration copy:** synchronized byte-for-byte from this tracker at **Step 7E0** and committed as **`722dcb8`** (`76636008…cd3ab3` on both sides); re-synchronized at **Step 7E0C** and committed as **`6551d37`** (`fa203b4c…89dc68` on both sides); **unchanged across the substantive commit `b367475`**; **re-synchronized byte-for-byte at Step 7E0D2C** with this acceptance record (staged; commit pending). No administrative lead remains
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
- Latest committed HEAD is `b367475c180a2e4f4cf70ff1385f34b253356c33` (`b367475`) — the governance baseline was committed at Step 5B3 as `c7c27e5`, and twelve further commits have since been accepted, most recently the final-MVP governance ratification `722dcb8`, its acceptance record `6551d37`, and the schema-critical architecture ratification `b367475`
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
> **Status update at Step 7E0D2C (2026-08-03).** The seven **schema-critical (S-1 … S-7)** items are now **RESOLVED** by Amendment 003 (commit `b367475`) and are marked individually below. **Nothing else changed.** The **audit-chain (A-1 … A-3)** items remain **open** and still block **Step 7H** — Amendment 003 **explicitly declines to ratify** chain scope, canonical serialization, hash application, previous-hash rules, genesis, and verification/repair. The **report/UI (U-1 … U-7)**, **Figma asset (F-1)** and **evidence (E-1 … E-3)** items remain **open and unchanged**, and the **Figma Design 2 implementation handoff remains pending**. New items opened by Amendment 003 are recorded in the register that follows.

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

**(5) Audit-design — blocks the audit-chain checkpoint (Step 7H), not the first migration. STILL OPEN after Amendment 003:**

| # | Unresolved decision | Carried from |
|---|---|---|
| A-1 | **Audit-chain scope** — one global chain vs one chain per target/tenant | item 5 above |
| A-2 | **SHA-256 ratification** for the audit hash (Specification v3 §23 names no algorithm) | item 6 above |
| A-3 | **Audit-chain genesis rule** — sentinel vs zero-hash for the first entry | item 7 above |
| A-4 | **Canonical serialization** of an audit event for hashing | new at Step 7E0D (A-029) |
| A-5 | **Hash application and previous-hash rules** | new at Step 7E0D (A-029) |
| A-6 | **Chain verification and repair procedures** | new at Step 7E0D (A-029) |

> **Amendment 003 explicitly declines to ratify A-1 … A-6.** A-029 ratifies only the **compatibility guarantees** the first migration must not foreclose — stable account/membership attribution, durable actor foreign keys, polymorphic targets with label snapshots, one event plus related-target child rows, append-only correction-by-new-event, and data minimization. **The audit-chain mechanics must not be inferred, defaulted, or "decided in the migration."** Specification v3 §23's append-only hash-chained audit requirement is **unchanged and undiminished — it is scheduled, not weakened.**

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

**Step 7E is Blocked · Not accepted · Not authorized · Not started.** All seven schema-critical decisions are now resolved — (1) public application-profile relationship to `auth.users`; (2) audit-target representation; (3) report-status storage; (4) database `GRANT` strategy; (5) enum-versus-reference-table strategy including Class Grade; (6) invitation state, token and expiry storage; (7) exact first-migration scope — each by an explicit Amendment 003 clause. **That makes Step 7E eligible, not authorized.** **Amendment 003 governs schema architecture and migration boundaries; it is not an implementation authorization.** **Step 7E requires a separate explicit orchestrator authorization, which has not been given.** The audit-chain scope, SHA-256 ratification, genesis rule, canonical serialization, previous-hash rules and verification/repair procedures are **retained for Step 7H and were deliberately not ratified**. The accepted sequence **7E → 7F → 7G → 7H → 7I → 7J** is preserved unchanged.

**Current permitted action: orchestrator review of the staged Step 7E0D2C acceptance record.** Exactly three in-repository progress files are **staged** — `docs/progress/DEMO_TO_MVP_MIGRATION.md`, `docs/progress/STATUS.md`, `docs/progress/BUILD_NOTES.md` — and the workspace tracker is modified outside the MVP repository and synchronized byte-for-byte into the migration copy. **No commit, tag, remote, or push has been created, and this checkpoint does not self-accept.**

Until the orchestrator accepts this acceptance record, **do not**: commit, tag, configure a remote, or push; begin Step 7E; write SQL; create any migration, `seed.sql`, Supabase function, schema, seed row, Auth user, invitation, fixture, database type, RLS policy, grant, or audit chain; write application code, UI components, routes, server actions, or tests; install or modify dependencies; start Supabase or alter Docker; link, authenticate, query, or contact hosted Supabase; import, export, download, or scrape any Figma asset, or fabricate a Figma node ID; open, print, hash, copy, parse, or inspect `.env.local`; or use real data (**synthetic only**).

**After acceptance, no implementation checkpoint becomes authorized automatically.** **Step 7E — the first governed SQL migration — requires a separate, explicit orchestrator authorization.** Until that authorization is issued, the permitted work is limited to the administrative commit of this acceptance record. **No SQL migration or application implementation is authorized.**
