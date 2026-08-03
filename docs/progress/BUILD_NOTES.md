# BUILD NOTES — B.E.S.T Coach MVP

> Permanent, chronological engineering log (Amendment 001 A-008). Append a dated entry at every accepted stopping point; never rewrite history. Read alongside `STATUS.md` at the start of every session.

## Entry format

Each future entry should record:

- **Date/time** and **checkpoint or phase**
- **Scope** — what this entry covers
- **Files changed**
- **Commands run**
- **Automated verification** (typecheck / lint / build / tests, with exit codes)
- **Manual verification**
- **Failures and recovery**
- **Decisions** (link to `CLAUDE.md` §, spec §, or Amendment 001 A-xxx)
- **Commit**
- **Next permitted action**

---

# Initial history (migration → MVP scaffold → governance)

_The entries below record verified history prior to this log's creation. They are reconstructed from the accepted migration checkpoints; only verified facts are recorded._

## 2026-07-21 — Demo inventory (migration Step 0)

- **Scope:** Read-only inventory of the existing throwaway trainer-flow demo.
- **Findings:** canonical demo at `SDS Project Sprint 2`; **not a Git repository initially** (no `.git`); Next.js App Router + TypeScript + Tailwind v4; Node v24.16.0 / npm 11.13.0; documented Steps 0–14 complete, **Step 15 incomplete**.
- **Verification:** code matched the demo tracker; Step 15 (read-only View's Assessment Snapshot + Focus Tags) confirmed absent.
- **Decision:** demo is reference-only; **Step 15 intentionally skipped**, freeze at Step 14.
- **Result:** no files changed (read-only).

## 2026-07-21 — Demo automated + manual baseline (migration Step 2)

- **Automated (Step 2A):** `npx tsc --noEmit` → 0; `npm run lint` → 0; `npm run build` → 0. No authored file changed; `package.json`/`package-lock.json` unchanged.
- **Manual (Step 2B):** bounded browser smoke test passed for login, calendar, locked-session popup, roster, validation, forced AI failure + retry + real generation, Review & Approve, edit persistence, approval, read-only View. Synthetic input only; server stopped cleanly.
- **Decision:** baseline accepted; proceed to local freeze.

## 2026-07-21 — Demo freeze safeguards (migration Step 3A)

- **Scope:** protect secrets and remove disposable runtime artifacts before Git init.
- **Files changed:** demo `.gitignore` only (added ignore rules for `dev-server.log`, `.codex-dev-webpack.out.log`, `.codex-dev-webpack.err.log`).
- **Actions:** deleted the three disposable runtime logs; confirmed `.env.local` remains ignored, present, unread, unmodified; `.next`/`node_modules`/`tsconfig.tsbuildinfo`/`next-env.d.ts` remain ignored.
- **Verification:** only `.gitignore` changed; no source/package/governance file changed.

## 2026-07-21 — Demo local freeze (migration Step 3B)

- **Scope:** initialize local Git in the demo and create the frozen baseline.
- **Commands:** `git init -b main`; `git add -A`; commit.
- **Commit:** `8d4acf4abc5039c24da01be773ab1a5e4916080f` — `chore(demo): freeze verified trainer-flow baseline at step 14` (58 files, 14240 insertions, 0 deletions).
- **Tag:** `demo-freeze-step14-2026-07-21` (annotated, at the freeze commit).
- **Post-freeze verification:** `tsc`/`lint`/`build` all exit 0 on the committed checkout; working tree clean; no remote; nothing pushed.

## 2026-07-21 — MVP scaffold decision (migration Step 4A)

- **Toolchain ratified:** Node 24 LTS (`v24.16.0` accepted), npm 11.13.0, Next.js resolved by `create-next-app@latest`; App Router, TypeScript, Tailwind, ESLint, Turbopack; root `/app`, no `/src`; import alias `@/*`; React Compiler off; generated agent files off; automatic Git off.
- **Strategy:** scaffold into a temporary lowercase directory (`best-coach-mvp`) because the destination basename `SDS Project Final (BEST Coach)` is not an npm-package-compatible name, then move into the destination.
- **Decision:** no demo source to be copied during scaffolding.

## 2026-07-21 — Fresh MVP scaffold (migration Step 4B)

- **Command:** `npx create-next-app@latest best-coach-mvp --typescript --tailwind --eslint --app --no-src-dir --turbopack --import-alias "@/*" --use-npm --no-react-compiler --no-agents-md --disable-git --yes` → exit 0; 356 packages installed.
- **Resolved versions:** Next.js `16.2.10`, React `19.2.4`, React DOM `19.2.4`.
- **Move:** 13 generated items (incl. hidden) moved into `SDS Project Final (BEST Coach)`; temp directory removed.
- **Declarations added:** `.nvmrc` `24`, `engines` `>=24 <25`, `packageManager` `npm@11.13.0`; package name `best-coach-mvp`.
- **Verification:** `tsc`/`lint`/`build` all exit 0; starter dev server returned **HTTP 200** (untouched create-next-app starter); server stopped cleanly. **No demo source copied.**
- **Follow-up:** two moderate npm audit advisories reported by create-next-app; no `npm audit fix` run.

## 2026-07-21 — Initial MVP commit (migration Step 4B3)

- **Commands:** `git init -b main`; `git add -A`; commit.
- **Commit:** `4de3f93c64ffea4883655f411d2f35a9a35f15d6` — `chore(mvp): initialize fresh Next.js scaffold` (18 files, 7121 insertions, 0 deletions).
- **State:** branch `main`, one commit, working tree clean, no tag, no remote, nothing pushed.
- **Post-commit verification:** `tsc`/`lint`/`build` all exit 0.

## 2026-07-21 — Governance inventory (migration Step 5A)

- **Scope:** read-only inventory of MVP governance sources.
- **Finding:** the authoritative documents were **originally absent** from the workspace (Specification v3, AI Features Breakdown v2, Implementation Plan, root `CLAUDE.md`) — present only as references in the migration tracker.
- **Result:** Step 5B blocked pending supplied documents and orchestrator conflict decisions; conflict register (C-01 … C-14) reviewed.

## 2026-07-21 — Ratified reconciliation + governance install (migration Step 5B1)

- **Scope:** verify supplied governance sources and install the reconciled governance baseline.
- **Sources verified** (`governance-source/`, unchanged): `CLAUDE.md` (`b73813a3…`), `BEST_Coach_Complete_MVP_Specification_v3.md` (`64d54aa2…`), `BEST_Coach_Implementation_Plan.md` (`5e998239…`). AI Features Breakdown v2 DOCX confirmed **still absent** (A-011).
- **Files created in the MVP:**
  - `CLAUDE.md` (root) — reconciled from source to align with Amendment 001.
  - `docs/spec/BEST_Coach_Complete_MVP_Specification_v3.md` — **copied byte-for-byte** (hash `64d54aa2…` matches source).
  - `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_001.md` — new ratified amendment.
  - `docs/plan/BEST_Coach_Implementation_Plan.md` — reconciled from source.
  - `docs/progress/STATUS.md`, `docs/progress/BUILD_NOTES.md` — new permanent continuity documents.
- **Ratified reconciliation — Amendment 001 (A-001 … A-013):**
  - **A-001** parent evidence access permitted only for the linked child under all gates (report `Submitted`, `evidence_media` consent, live `parent_child_link`, correct child/report context, scan passed, short-TTL server-minted signed URL); direct/public/unrelated access prohibited.
  - **A-002** Phase 1 parent report text-only; evidence workflow and parent access are Phase 2.
  - **A-003** Phase 2 exit corrected — all prohibited paths fail **and** the linked parent's submitted/consented evidence works via signed URL.
  - **A-004** Parent UAT tests both permitted and prohibited paths.
  - **A-005** local-only Git; GitHub/remote/push not a Phase 0 prerequisite.
  - **A-006** ratified Node 24 / npm 11.13.0 toolchain supersedes Node 20.
  - **A-007** Phase 0 = DB append-only audit + hash chain; Phase 4 = independent retention-locked external mirror.
  - **A-008** `STATUS.md` and `BUILD_NOTES.md` both permanent and mandatory.
  - **A-009** Vitest/RTL/Playwright pre-approved; Lighthouse first for accessibility.
  - **A-010** audit-mutation denial verified via restricted role / `SET ROLE`, not the privileged SQL-editor identity.
  - **A-011** AI Features Breakdown v2 unavailable but non-blocking for Phases 0–4; do not fabricate.
  - **A-012** Implementation Plan is procedural; cannot override spec/amendment.
  - **A-013** Stitch exports installed selectively after accepted Phase 0.
- **Verification:** Specification v3 source↔destination SHA-256 match confirmed; `CLAUDE.md` references only paths that now exist. **Commit still pending** (Step 5B2). No demo file copied; no `docs/ui-screens/` created; no AI-Breakdown placeholder created; no application/package file changed; no `.env` created.

## 2026-07-21 — Dependency follow-up (open)

- Two **moderate**-severity npm audit advisories were reported during the MVP scaffold (Step 4B).
- **No automatic fix** was run; no dependency was changed.
- Review deferred to a formal dependency/security checkpoint — do not auto-fix without review.

## 2026-07-21 — Migration records + governance staging (migration Step 5B2)

- **Checkpoint:** Step 5B2 — install active migration copy and stage the governance baseline.
- **Scope:** accept Step 5A and Step 5B1, update migration records, install the active migration copy, and stage the governance baseline for commit review.
- **Acceptances recorded:**
  - **Step 5A accepted** — the workspace initially lacked all authoritative MVP governance inputs; three source files were later supplied in `governance-source/`; the AI Features Breakdown v2 remains missing (non-blocking for governance, Phase 0, and Phases 1–4; required before a deferred aggregate-AI feature enters scope); source-of-truth hierarchy accepted; conflict register C-01 … C-13 reviewed; readiness moved from blocked to ready.
  - **Step 5B1 accepted** — reconciled governance baseline installed (six files); Specification v3 copied byte-for-byte and never edited in place.
- **Files changed:**
  - Workspace migration tracker updated (Step 5A/5B1 acceptance, ratified reconciliation decisions, Step 5B2/5B3 sub-checkpoints, MVP repository record, decision log **D-035 … D-050**).
  - **New:** `docs/progress/DEMO_TO_MVP_MIGRATION.md` — byte-for-byte copy of the updated workspace tracker (the active migration record; retained as archived migration history at closure).
  - `docs/progress/STATUS.md` updated (lifecycle stage, checkpoint, permitted action, latest committed HEAD, working-tree state, next checkpoint).
  - `docs/progress/BUILD_NOTES.md` — this entry appended.
- **Tracker hashes:** source `1b7f885e0c0126f03d06670c297c16e96236a0022e05343564a4439fbeb96950`; destination `1b7f885e0c0126f03d06670c297c16e96236a0022e05343564a4439fbeb96950` — **identical** (51,453 bytes).
- **Verification:** Specification v3 installed hash re-confirmed `64d54aa2…` (unchanged); `governance-source` files unchanged; Amendment 001 contains A-001 … A-013; frozen demo clean at `8d4acf4…`; MVP application/package/configuration files unchanged.
- **Commands run:** read-only Git status/hash inspection; `cp` of the tracker; `git add` of exactly seven governance paths. **No build, lint, typecheck, dependency operation, or application run.**
- **Failures and recovery:** none.
- **Commit:** **still pending** — the governance baseline is staged only; no commit, tag, remote, or push.
- **Next permitted action:** Step 5B3 — create and verify the single local governance-baseline commit.

## 2026-07-22 02:23:13 +0800 — Governance-baseline commit (migration Step 5B3)

- **Checkpoint:** Step 5B3 — create and verify the governance-baseline commit.
- **Scope:** one local, documentation-only commit from the seven-file staged set accepted in Step 5B2.
- **Commit:** `c7c27e5e2f772725d88fbed1b5e1459d509960ce` (short `c7c27e5`)
- **Message:** `docs(governance): install reconciled MVP baseline`
- **Parent:** `4de3f93c64ffea4883655f411d2f35a9a35f15d6`
- **Summary:** **7 files**, **2697 insertions**, 0 deletions — `CLAUDE.md`, Specification v3, Amendment 001, Implementation Plan, `STATUS.md`, `BUILD_NOTES.md`, `DEMO_TO_MVP_MIGRATION.md`.
- **Documentation-only commit** — no application, package, lockfile, or configuration file was touched.
- **Automated verification:** **none run by design** (documentation-only checkpoint) — no typecheck, lint, build, dependency operation, or application/dev-server run.
- **Document verification passed:** Specification v3 integrity confirmed byte-for-byte identical to `governance-source` (`64d54aa2…`); Amendment 001 verified to contain **A-001 through A-013**; all `CLAUDE.md` path references resolve; the Implementation Plan's procedural-authority note confirmed; migration copy byte-identical to the workspace tracker.
- **Stale-requirement scan:** **no active stale requirement** for Node 20, mandatory GitHub setup, Phase 1 parent evidence access, an absolute parent-evidence prohibition, Stitch as a Phase 0 prerequisite, the AI Breakdown as a Phase 0 blocker, or `STATUS.md` as the sole continuity file. Remaining phrases are authoritative-baseline (superseded), quoted, historical, or explanatory.
- **Result:** working tree clean; exactly two commits; **no tag, no remote, nothing pushed**.

## 2026-07-22 — Step 5 closure and record synchronization (migration Step 5B4)

- **Checkpoint:** Step 5B4 — governance closure synchronization (**administrative only**).
- **Step 5 is accepted and substantively complete** — the governance deliverable was accepted at commit `c7c27e5`.
- **Records synchronized after the governance commit:** the workspace migration tracker was updated (Step 5B2/5B3 accepted, Step 5B4 opened, Step 5 closed, Step 6/6A opened, MVP repository record, decision log **D-051 … D-059**), and the active migration copy `docs/progress/DEMO_TO_MVP_MIGRATION.md` was re-synchronized byte-for-byte.
- **Next checkpoint:** **Step 6A — orchestrator prerequisite and architecture-decision inventory.**
- **Phase 0 has not started.** Prerequisite verification remains required: Supabase project + Singapore region, Supabase and LLM credential presence (values never printed), the ORM/data-access decision, and the `.env.local` / `.env.example` contract.
- **The administrative synchronization commit is pending review** — this entry is written before that commit exists.
- **No product, governance-rule, application, dependency, or secret content changed** in this checkpoint; only progress records (`DEMO_TO_MVP_MIGRATION.md`, `STATUS.md`, `BUILD_NOTES.md`) were modified.

## 2026-07-23 — Project-scoped Supabase CLI + local scaffold (migration Step 6B2A)

- **Checkpoint:** Step 6B2A — install the pinned project-scoped Supabase CLI, initialize the local Supabase scaffold, create the safe environment example.
- **CLI version:** **`supabase@2.109.1`** — verified before install as the registry `latest` dist-tag; the `beta` tag pointed elsewhere (`2.110.0-beta.36`); no prerelease suffix; no registry-integrity error.
- **Installation command:** `npm install --save-dev --save-exact supabase@2.109.1` (exit 0) — 8 packages added, 365 audited. `devDependencies.supabase = "2.109.1"`, **exact pin, no caret or tilde**. `package-lock.json` gained **237 insertions with 0 deletions**, so no existing dependency version changed. **No global CLI installed**; verified through `npx --no-install supabase --version` → `2.109.1`.
- **Initialization:** `npx --no-install supabase init` (exit 0, `Finished supabase init.`), run non-interactively — **no prompt appeared** for IDE settings, overwrite, authentication, linking, or a token.
- **Generated files:** `supabase/.gitignore` (72 B) and `supabase/config.toml` (414 lines) — the complete generated set, enumerated after the run rather than assumed. **No `.vscode` or Deno file was created.**
- **Normalized project identifier:** the folder-derived `"SDS_Project_Final_BEST_Coach_"` was changed to **`best-coach-mvp`** — a single-line edit; no other generated setting touched (size 15,610 → 15,595 B, exactly the identifier shortening; line count unchanged).
- **Configuration review passed:** no hosted Supabase URL, API key, database password, access token, or project secret. Every secret-shaped setting is a commented template, an empty string, or an `env(...)` reference; all URL values are loopback defaults.
- **`.env.example` safeguard:** `.gitignore` kept the broad `.env*` rule and gained **`!.env.example`** immediately after it (one line, no other rule touched). `git check-ignore` confirms `.env.local` **still ignored** and `.env.example` **not ignored**. The example holds exactly the six approved variable names with **no real credential** — only the non-secret ratified selectors `LLM_PROVIDER=openai` and `LLM_MODEL=gpt-5.6-terra` carry values.
- **`.env.local` was never opened, read, printed, hashed, or copied** — presence-only checks throughout; no value, length, prefix, suffix, or format reported.
- **No container, authentication, linking, or migration** — `supabase start`, `supabase login`, and `supabase link` were never run; Docker reported `Containers=0` and `Images=0` after init; no `%USERPROFILE%\.supabase\` directory or access token exists.

## 2026-07-23 — Supabase tooling verification and staging (migration Step 6B2B)

- **Checkpoint:** Step 6B2B — validate the Step 6B2A changes, run the automated baseline, stage exactly the approved files, stop before committing.
- **Six-file staged set:** `.env.example` (A), `.gitignore` (M), `package.json` (M), `package-lock.json` (M), `supabase/.gitignore` (A), `supabase/config.toml` (A) — **3 modifications, 3 additions, 0 deletions; 672 insertions, 0 deletions**. Staged with an explicit path-scoped `git add --`; **`git add -A` was not used**.
- **Automated baseline — all PASS:** `npx tsc --noEmit` exit 0; `npm run lint` exit 0; `npm run build` exit 0 (Next.js 16.2.10 Turbopack, 4/4 static pages). **No warnings and no errors** from any command.
- **Secret and path review passed:** `sk-`, `eyJ`, `.supabase.co`, `postgres://`, `postgresql://`, `ANON_KEY`, `PASSWORD=` all 0 in staged content; the only `service_role` / `access_token` matches were generated documentation comments. `git diff --cached --check` clean. No staged file exceeded 5 MB (largest 236 KB). Build artifacts (`.next`, `next-env.d.ts`, `tsconfig.tsbuildinfo`, `node_modules`) confirmed ignored and unstaged. No unstaged or untracked change remained.
- **Advisory state observed:** **3 total — 1 moderate, 2 high** (`next` high/direct, `sharp` high/transitive, `postcss` moderate/transitive). **None attributable to `supabase@2.109.1`.** `npm audit fix` was **not** run.
- **No commit existed at this point** — the checkpoint stopped at staging for orchestrator approval.

## 2026-07-23 11:08:38 +0800 — Local Supabase tooling commit (migration Step 6B2C)

- **Checkpoint:** Step 6B2C — create exactly one local commit from the reviewed six-file staged set.
- **Commit:** `0cdb7825b0d4bcd9ad9b40323a3e90228065f006` (short `0cdb782`)
- **Message:** `chore(tooling): initialize local Supabase scaffold`
- **Parent:** `a39ed21d4ecf405b3425db711e63a2f71f0f1586`
- **Summary:** **6 files**, **672 insertions**, 0 deletions.
- **Post-commit verification passed:** `npx tsc --noEmit`, `npm run lint`, and `npm run build` each exit 0 with **no warnings and no errors**.
- **Repository clean** — working tree empty, branch `main`, **exactly four commits** (`4de3f93` → `c7c27e5` → `a39ed21` → `0cdb782`).
- **No remote or push** — and no tag, amend, reset, or second commit. Generated build artifacts remained ignored and never entered the commit.
- **No Supabase runtime, linking, authentication, or migration occurred**; `.env.local` remained ignored, untracked, and unopened.

## 2026-07-23 — Step 6 closure and record synchronization (migration Step 6B2D)

- **Step 6B is completed and accepted** — Docker Desktop with WSL 2, the project-local pinned Supabase CLI `2.109.1`, the initialized local scaffold (`project_id = "best-coach-mvp"`), and the placeholder-only `.env.example` are all in place, committed as `0cdb782`.
- **Phase 0 remains not started** — `supabase/migrations`, `supabase/functions`, `supabase/seed.sql`, `src/`, `lib/`, `db/`, and `server/` are all absent. The local stack has never been started and the hosted project has never been linked; each requires its own explicit checkpoint.
- **Step 7A is next** — read-only Phase 0 foundation-slice planning: re-read the governing Phase 0 sections, inspect the committed scaffold, define the first bounded slice with its tests and stopping conditions, and stop before implementation.
- **The administrative progress synchronization is pending commit** — this entry is written before that commit exists (per the anti-recursion rule, D-060 … D-066).
- **No application or schema implementation occurred in this record update**; only progress records (`DEMO_TO_MVP_MIGRATION.md`, `STATUS.md`, `BUILD_NOTES.md`) were modified. Dependency advisories remain **unresolved** (1 moderate, 2 high) and deferred to a reviewed security/dependency checkpoint.

## 2026-07-23 — Phase 0 foundation-slice planning (Step 7A)

- **Checkpoint:** Step 7A — read-only Phase 0 foundation-slice planning. **Planning only; no implementation.**
- **Sources read:** Specification v3 (Parts III–V, §3, §13, §14, §18–§26), Amendment 001 (A-001 … A-013), root `CLAUDE.md` (§2, §4, §5, §6, §9, §10, §11, §12), the Implementation Plan (Phase 0), `STATUS.md`, `BUILD_NOTES.md`, the migration copy, plus `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `.gitignore`, `.env.example`, `supabase/config.toml`, and `app/`.
- **Accepted checkpoint sequence:** **7B** local runtime → **7C** dependencies → **7D** clients and `server-only` boundaries → **7E** first SQL migration → **7F** Auth and synthetic identities → **7G** RLS relationship proof → **7H** audit hash chain → **7I** authorised server action → **7J** generated database types → **7K** automated and manual Phase 0 evidence → **7L** separately approved hosted linking and remote migration.
- **Recommended first slice — runtime only.** Local Supabase startup and health verification, chosen over "startup + dependencies" and "startup + clients + boundaries": it isolates the single highest-variance risk (container runtime) in the one checkpoint that produces **zero Git diff**, so a failure requires no rollback. It also had to precede client work because the local CLI emits credentials distinct from the hosted ones, and the environment-selection design depends on observing that.
- **Unresolved findings recorded, none silently resolved:** (1) **data-layer governance tension** — v3 §18 / `CLAUDE.md` §9 name a typed client (Prisma or Drizzle) while D-067 selects Supabase-native access with no ORM, and the tracker cannot override higher-precedence documents; formal ratification is required **before Step 7E or 7J** but did not block 7B/7C. (2) **New tables are not auto-exposed** — migrations must use deliberate `GRANT`s, and a missing grant must not be misdiagnosed as an RLS failure. (3) **PostgreSQL 17 has built-in `sha256(bytea)`** — `pgcrypto` is not required solely for audit hashing. (4) **Schema/audit ambiguities** — `public` profile vs `auth.users`, audit target representation, report-status storage values, audit chain scope, SHA-256 ratification, and genesis representation, each due before its dependent checkpoint.
- **No mutation:** no file created, modified, or deleted; no dependency installed; no stack started; no image pulled; no migration, seed, Auth user, generated type, or source code; no hosted operation; no Git mutation.

## 2026-07-23 — Initial local Supabase stack verification (Step 7B, first attempt — FAILED service-health gate)

- **Cold start:** `npx --no-install supabase start`, exit 0, **124 seconds** from a completely empty Docker cache.
- **Images and containers:** **13 images pulled** (8.588 GB), **12 project containers created**. The CLI intentionally stopped `imgproxy` and `pooler` per the committed configuration.
- **Healthy core services:** PostgreSQL 17, Auth (GoTrue), REST (PostgREST), Studio, Storage, Realtime, Kong, Mail (Mailpit), Postgres Meta and Edge Runtime were all operational. Auth, REST and Studio probes each returned **HTTP 200**. The `public` schema contained **0 application tables**.
- **Vector failure — definite root cause.** `supabase_vector` crash-looped (**10 restarts**, `health=unhealthy`). Its own logs showed the `docker_logs` source failing with `Listing currently running containers failed`, all sources finishing, and the container exiting 0 and restarting. Startup had warned: *Analytics on Windows requires Docker daemon exposed on `tcp://localhost:2375`* — an exposure **deliberately disabled** under D-082.
- **The checkpoint failed its service-health gate**, correctly and deliberately: the gate was not waived, `--ignore-health-check` was not used, and no workaround was applied, even though every service Phase 0 depends on was healthy.
- **Also observed:** `supabase start` created `supabase/snippets/` as an **empty, non-ignored** directory — invisible to `git status` only because Git does not track empty directories.
- **Clean shutdown:** `supabase stop` exit 0; all containers removed, all ports released; 13 images and 3 volumes retained.
- **No repository change** — working tree clean throughout; `.env.local` never opened; no secret exposed; no schema or application implementation.

## 2026-07-23 — Windows local-stack remediation and verification (Step 7B-R1)

- **Exact two-file remediation.** `supabase/config.toml`: `[analytics] enabled = true` → **`false`** (one line; `port = 54327` and `backend = "postgres"` untouched; `project_id`, `major_version = 17` and all six service ports unchanged; the enabled-flag census moved by exactly one). `supabase/.gitignore`: added **`snippets/`** only, preserving all five prior rules.
- **Migrations stay governed** — `supabase/migrations/*.sql` and `supabase/seed.sql` verified **not** ignored; no broad `*.sql` rule added. SQL migrations, not Studio snippets, remain the source of truth.
- **Rejected alternative:** enabling insecure Docker TCP 2375 — a security regression contradicting D-082. **Docker TCP 2375 remained disabled throughout.**
- **Warm start:** exit 0 in **25 seconds** using cached images (**no pulls**), with **zero warnings and zero errors** — the prior `tcp://localhost:2375` warning no longer occurred.
- **Ten required containers ran** — Kong, PostgreSQL, Studio, Auth, Storage, Realtime, Mail, Postgres Meta, REST, Edge Runtime — with **0 unhealthy and 0 restarting** (every container `restarts=0`). Logflare Analytics and Vector were **absent by configuration** (0 containers each; port 54327 unbound and unreachable).
- **Functional probes:** Auth health **HTTP 200**, REST **HTTP 200**, Studio **HTTP 200**.
- **Database:** **PostgreSQL major version 17** verified; `public` schema still contained **0 application tables**. No write was issued.
- **No migration, seed, Auth user, generated type or source code was created.**
- **Shutdown and staging:** `supabase stop` exit 0; all project ports released; 13 images and 3 volumes preserved; networks back to Docker's three defaults. Exactly the two approved files were staged (`2 files changed, 2 insertions(+), 1 deletion(-)`), with no other repository-visible change. CLI `2.109.1` exposes no read-only local config validation command (`supabase config` offers only `push`, a hosted mutation), so the successful start is the operational validation.

## 2026-07-23 14:16:15 +0800 — Commit Windows local-stack remediation (Step 7B-R2)

- **Commit:** `25551c5d733fa581844db35ae3647c0ca8d52190` (short `25551c5`)
- **Message:** `chore(supabase): stabilize local Windows stack`
- **Parent:** `a83ec7aa66a32b7da33b9d9d84cd01be81426581`
- **Summary:** **2 files**, **2 insertions**, **1 deletion**.
- **Clean repository** — working tree empty after commit; exactly **six commits** (`4de3f93` → `c7c27e5` → `a39ed21` → `0cdb782` → `a83ec7a` → `25551c5`).
- **No tag, remote or push.** No runtime operation occurred during the commit checkpoint; the stack stayed stopped and Docker TCP 2375 stayed disabled.
- Committed content re-verified from `HEAD`: analytics `enabled = false`, `project_id = "best-coach-mvp"`, `major_version = 17`, all ports unchanged, `snippets/` present, migrations and `seed.sql` still trackable.

## 2026-07-23 — Step 7B closure and record synchronization (Step 7B-R3)

- **Local runtime verified** — the local Supabase stack starts, serves, and stops cleanly on Windows with all required Phase 0 services healthy.
- **Phase 0 is now `In progress`.** Local-runtime execution has begun and passed. **Schema, Auth, RLS, audit and application implementation have not started** — `supabase/migrations`, `supabase/seed.sql`, `server/`, `src/`, `lib/`, `db/` are all absent, and `@supabase/ssr` / `@supabase/supabase-js` are not installed. The earlier blanket phrasing "Phase 0 has not started" is superseded by this three-part formulation.
- **Step 7C is next** — Supabase runtime dependency selection and installation, dependency-only, stopping before commit and before any source code.
- **The administrative progress synchronization is pending commit** — this entry is written before that commit exists (anti-recursion rule, D-060 … D-066, D-101).
- **No application or schema implementation occurred in this record update**; only the workspace tracker and the three progress records were modified. Advisories remain **unresolved** (1 moderate, 2 high).

## 2026-07-24 — Supabase runtime dependency verification, installation and staging (Step 7C1)

- **Checkpoint:** Step 7C1 — verify current stable Supabase runtime packages and Node/peer compatibility, install exact runtime pins, run the automated baseline, and stage only the package files. **Dependency-only; no source, schema, runtime, or hosted operation.**
- **Toolchain:** Node `v24.16.0`, npm `11.13.0`.
- **Package metadata and compatibility verified:** `@supabase/ssr` `0.12.3`, `@supabase/supabase-js` `2.110.8`, and `server-only` `0.0.1` each confirmed as the current `latest` dist-tag with no prerelease suffix. `@supabase/supabase-js` requires `node >=22.0.0` — satisfied by Node 24; `@supabase/ssr` peer `^2.110.5` is satisfied by `@supabase/supabase-js` `2.110.8`; none of the three declares a React or Next.js peer, so React 19.2.4 and Next.js 16.2.10 are unconstrained.
- **Exact installation:** `npm install --save --save-exact @supabase/ssr@0.12.3 @supabase/supabase-js@2.110.8 server-only@0.0.1` (exit 0). All three pinned exactly (no ranges) in `dependencies` and resolved identically in `package-lock.json`.
- **Dependency delta: 11 packages added, 0 removed, 0 changed** — the three direct packages plus `@supabase/auth-js`, `@supabase/storage-js`, `@supabase/realtime-js`, `@supabase/functions-js`, `@supabase/postgrest-js` (all `2.110.8`), `@supabase/phoenix` `0.4.5`, `iceberg-js` `0.8.1`, and `cookie` `1.1.1`. **No ORM or test dependency** (prisma, drizzle, typeorm, sequelize, kysely, knex, vitest, jest, Playwright, Testing Library all absent; pre-existing dev-only transitive `axe-core@4.12.1` unchanged, so A-009 is not engaged).
- **Automated baseline — all PASS:** `npx tsc --noEmit` exit 0; `npm run lint` exit 0; `npm run build` exit 0. No warnings, no errors.
- **Staged set:** exactly `package.json` (M) and `package-lock.json` (M) — **2 modifications, 0 additions, 0 deletions; 132 insertions, 2 deletions** — via explicit path-scoped `git add --` (`git add -A` not used). The only `package.json` deletion was the `react-dom` line re-emitted with a trailing comma; its version is unchanged.
- **No source, schema, runtime, or hosted operation** — no client, server module, migration, seed, Auth user, or generated type; local stack never started; no `supabase login` / `link`; `.env.local` never opened.

## 2026-07-24 — Advisory movement (Step 7C1)

- **Advisory count unchanged by the install: 3 total — 0 moderate, 3 high, 0 critical**, before and after (zero advisory delta).
- **Same affected packages:** `next` (high, direct), `postcss` (high, transitive via `next`), `sharp` (high, transitive via `next`). Every path terminates at `next`.
- **`postcss` severity changed due to npm advisory-database movement**, not a dependency change — a second `postcss` advisory (arbitrary file read / information disclosure via attacker-controlled `sourceMappingURL`) was published alongside the existing XSS finding, raising it from moderate to high. The pre-install audit already showed 3 high against the tree exactly as committed at `329f03c`.
- **No finding attributable to the Supabase packages** — neither `@supabase/ssr`, `@supabase/supabase-js`, `server-only`, nor any added transitive package appears in any advisory `via`/`effects` chain.
- **No `npm audit fix` was run.** Findings remain **unresolved** and deferred to a reviewed security/dependency checkpoint. The earlier "1 moderate, 2 high" figure is superseded only as a current-state summary; the dated historical snapshots (Step 4B, Step 6B2A, D-034, D-099) are preserved.

## 2026-07-24 14:59:58 +0800 — Commit Supabase runtime dependencies (Step 7C2)

- **Checkpoint:** Step 7C2 — one local commit from the reviewed two-file staged set.
- **Commit:** `ffd9eef8677f9183175a66f7de00f9fef1223fab` (short `ffd9eef`)
- **Message:** `chore(deps): add Supabase runtime clients`
- **Parent:** `329f03c253cc3afc356be5873c963efc2eb35e12`
- **Summary:** **2 files**, **132 insertions**, **2 deletions** (`package.json`, `package-lock.json`).
- **Post-commit verification passed:** `npx tsc --noEmit`, `npm run lint`, and `npm run build` each exit 0, no warnings or errors; `npm ls --depth=0` exit 0 (no missing, invalid, extraneous, or peer-conflicting package).
- **Repository clean** — working tree empty; **exactly eight commits** (`4de3f93` → `c7c27e5` → `a39ed21` → `0cdb782` → `a83ec7a` → `25551c5` → `329f03c` → `ffd9eef`).
- **No tag, remote or push.** No source, schema, runtime, or hosted operation occurred; the stack stayed stopped and `.env.local` remained ignored, untracked, and unopened.

## 2026-07-24 — Step 7C closure and record synchronization (Step 7C3)

- **Step 7C is completed and accepted** — Supabase runtime dependencies exact-pinned, installed, verified, and committed as `ffd9eef`; Node and peer compatibility passed; the automated baseline passed; the current advisory state is **3 high, 0 moderate, unresolved**.
- **Step 7D is next** — Supabase clients, explicit local-versus-hosted environment selection, and `server-only` boundaries; it stops before commit and before any schema work.
- **No client, server-boundary, schema, or application implementation exists yet** — `supabase/migrations`, `supabase/seed.sql`, `server/`, `src/`, `lib/`, `db/` remain absent; installing Supabase-native packages did **not** resolve the data-layer governance tension (D-108 still gates Step 7E/7J).
- **The administrative progress synchronization is pending commit** — this entry is written before that commit exists (anti-recursion rule, D-060 … D-066, D-101, D-121). Only the workspace tracker and the three progress records were modified in this update; no application, schema, dependency, or secret content changed.

## 2026-07-30 — Supabase environment and client boundaries: implementation, proof, and staging (Step 7D1)

- **Checkpoint:** Step 7D1 — implement, prove, validate, and stage the Supabase environment and client boundaries. **Boundaries only; no query, Auth flow, schema, or hosted operation.**
- **Installed-API verification first:** the installed `@supabase/ssr` `0.12.3` and `@supabase/supabase-js` `2.110.8` surfaces were checked before writing code — Next.js `cookies()` is asynchronous (returns a Promise), and the SSR server client expects a `getAll`/`setAll` cookie adapter.
- **Five-file implementation (additions only):**
  - `lib/supabase/public-config.ts` — client-safe public configuration; validates only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; classifies **local vs hosted** (local hosts `localhost` / `127.0.0.1` / IPv6 loopback, port restricted to `54321`; hosted restricted to HTTPS and `*.supabase.co`); supports current opaque (`sb_publishable_`) and legacy JWT publishable-key families; rejects a secret-key prefix; does not decode JWTs or expose values.
  - `lib/supabase/browser.ts` — browser-safe `createBrowserClient` boundary; publishable key only; browser singleton; no server import, private variable, Auth call, or query.
  - `server/platform/env.ts` — first executable import is `import "server-only"`; validates exactly the **six** approved environment names, the local/hosted target, key families, key non-reuse, accepted LLM provider (`openai`) and model (`gpt-5.6-terra`), and a non-blank LLM API key; returns an immutable (`Object.freeze`) typed configuration; logs and exposes no values.
  - `server/platform/supabase/request.ts` — first executable import is `import "server-only"`; async request-scoped `createServerClient` factory; `await cookies()`; a fresh client per invocation; publishable key only; `getAll`/`setAll` cookie adapter; no global client, Authorization override, Auth call, or query.
  - `server/platform/supabase/elevated.ts` — first executable import is `import "server-only"`; elevated client uses the **secret** key; no request cookie or user JWT; `persistSession`/`autoRefreshToken`/`detectSessionInUrl` all `false`; documented warning that it **bypasses RLS** and requires a prior server-side authorization decision; no query or administrative action.
- **Distinct boundaries:** the browser, request-scoped server, and elevated clients have deliberately distinct security boundaries; structural credential validation **cannot** prove that opaque credentials belong to the selected project without a later runtime connection/identity proof.
- **Cookie-write handling:** the request client's `setAll` is wrapped in a narrow `try/catch` scoped to the write loop alone, handling the documented Next.js limitation that cookie writes are permitted only from a Server Action or Route Handler (not during a Server Component render); Step 7D triggers no write (no Auth call is made), and unrelated errors are never suppressed.
- **Environment-probe correction (necessary deviation):** the originally proposed `app/__step7d_env_probe` path is a Next.js **private folder** and therefore never became a route — the first build correctly showed the validators had not executed through it. A temporary **routable** path `app/step7d-env-probe/page.tsx` was used instead; the production build included it; public and server configuration validation executed successfully using **opaque** environment inputs (no value rendered, logged, inspected, or reported); the temporary route was then deleted and never staged. This deviation was necessary to make the proof valid and did **not** weaken scope or security.
- **Negative `server-only` proof:** a temporary Client Component importing the elevated factory caused the production build to **fail with exit code 1 specifically on the `server-only` boundary** — not on syntax, path, dependency, lint, or unrelated TypeScript. The temporary route was deleted and never staged; the negative build failure counts as a successful boundary proof.
- **Automated baseline — all PASS:** `npx tsc --noEmit` exit 0; `npm run lint` exit 0; `npm run build` exit 0; **zero warnings, zero errors**. The ignored `.next` cache was removed once only to clear a stale generated reference to the deleted probe; no tracked or repository-visible file was affected.
- **Client-bundle isolation:** private variable-name occurrences in `.next/static` — `SUPABASE_SECRET_KEY` 0, `LLM_PROVIDER` 0, `LLM_MODEL` 0, `LLM_API_KEY` 0; no `server/platform` module appeared in the client output or inspected client manifests; the elevated factory is unreachable from browser code; no value was searched or printed.
- **Staged set:** exactly **five additions, 0 modifications, 0 deletions; 363 insertions**; no temporary probe; no package, environment, Supabase configuration, governance, progress, app-route, public, or demo file staged.

## 2026-07-30 09:19:03 +0800 — Commit Supabase environment and client boundaries (Step 7D2)

- **Checkpoint:** Step 7D2 — one local commit from the reviewed five-file staged set.
- **Commit:** `455a0706b5555c0b4f083327dfd5613d3aa23245` (short `455a070`)
- **Message:** `feat(platform): add Supabase client boundaries`
- **Parent:** `5d10bd050887dc9ceaf0ad9641932257c77c2936`
- **Summary:** **5 files**, **363 insertions**, **0 deletions** — `lib/supabase/public-config.ts`, `lib/supabase/browser.ts`, `server/platform/env.ts`, `server/platform/supabase/request.ts`, `server/platform/supabase/elevated.ts`.
- **Post-commit verification passed:** `npx tsc --noEmit`, `npm run lint`, and `npm run build` each exit 0 with no warnings or errors; client-bundle private-name isolation re-confirmed (0 occurrences).
- **Repository clean** — working tree empty; **exactly ten commits** (`4de3f93` → `c7c27e5` → `a39ed21` → `0cdb782` → `a83ec7a` → `25551c5` → `329f03c` → `ffd9eef` → `5d10bd0` → `455a070`).
- **No tag, remote, or push.** No dependency, schema, Auth, runtime, hosted, or application operation occurred; the stack stayed stopped and `.env.local` remained ignored, untracked, and unopened.

## 2026-07-30 — Step 7D closure and record synchronization (Step 7D3)

- **Step 7D is completed and accepted** — Step 7D1, Step 7D2, and Step 7D overall. Explicit local-versus-hosted target classification, six-variable validation, and the browser-safe / request-scoped-server / elevated server-only boundaries are implemented; the negative `server-only` proof and client-bundle private-name isolation passed; typecheck, lint, and production build passed; implementation commit `455a070` is accepted.
- **Step 7E (first governed SQL migration and database foundation) is blocked** — it cannot begin until the recorded decisions are formally ratified: Supabase-native data access vs the Prisma/Drizzle wording in `CLAUDE.md` / Specification v3; the `public` profile ↔ `auth.users` relationship; audit target representation; report-status storage representation; audit-chain scope; audit SHA-256 algorithm; audit genesis representation; a deliberate `GRANT` strategy for new tables; and the first migration's table/enum scope.
- **Step 7E0 (data-layer governance and first-migration ratification) is the next checkpoint** — planning/governance only; no schema implementation is authorized.
- **No query, Auth flow, schema, RLS, audit chain, or hosted operation has been implemented** — Step 7D delivered client boundaries only; `supabase/migrations`, `supabase/seed.sql`, and any Auth/RLS/audit/server-action/route-handler code remain absent; the local stack stayed stopped and the hosted project stayed unlinked; **Phase 0 remains `In progress`.**
- **The administrative progress synchronization is pending commit** — this entry is written before that commit exists (anti-recursion rule, D-060 … D-066, D-101, D-121, D-145). Only the workspace tracker and the three progress records were modified in this update; no application, schema, dependency, or secret content changed.

## 2026-07-30 — Final MVP scope and schema-preflight governance reconciliation (Step 7E0, documentation only)

- **Checkpoint:** Step 7E0 — final MVP scope and schema-preflight governance reconciliation. **Documentation only.** Performed after the complete Step 7D sequence was accepted and **before** Step 7E schema work begins.
- **Purpose:** reconcile the project with the orchestrator's final confirmed MVP scope and product decisions (ratified 2026-07-30), at the correct precedence level, so that the first governed SQL migration is written against ratified governance rather than against a tracker-only decision.
- **Pre-state verified before any edit:** frozen demo `8d4acf4abc5039c24da01be773ab1a5e4916080f` on `main`, working tree clean, annotated tag `demo-freeze-step14-2026-07-21` present and pointing at the freeze commit, no remote. MVP `HEAD = e07b2138c9b670ebd3feda41c89782056cb8a6d5` (`e07b213`), **11 commits**, working tree clean, index empty, no tag, no remote, single worktree, no `index.lock`, no merge/rebase state. Step 7D recorded **Completed · Accepted** (7D1 → 7D4 and overall); **Step 7E not started** — `supabase/migrations`, `supabase/seed.sql` absent, `public` schema still 0 application tables. Latest tracker decision before this checkpoint: **D-177**.
- **Final one-centre, three-flow scope (A-014, A-015):** the completed MVP contains exactly three complete human-user flows — **Management, Trainer, Parent** — operating for **one centre only**. No centre creation/deletion/switching, multi-centre administration, cross-centre analytics or transfers, HQ role, or super-admin. A **real `centres` entity and centre-scoped relationships are retained** so multi-centre support stays additive; the MVP uses **exactly one seeded centre**, with no centre-selection or centre-management UI, and **one named management account** — never shared credentials.
- **Hierarchy correction (A-016):** the canonical hierarchy is **Centre → Class Grade → Class Module → Class Session → downstream records**, replacing the earlier flat "Centre → Class" assumption. Class Grade values are exactly **Beginner, Intermediate, Advanced**. **"Class Grade" replaces "Academic Level"** as the active term. The UI action may read "Create Class"; the persisted entity is the **Class Module** under a selected Class Grade, with **no hidden intermediate `classes` entity**. Trainer assignment is authoritative at **class-session** level, and **calendars are projections — never duplicated event records**.
- **Mandatory nine-dimension assessment (A-017):** every assessment requires **all nine** B.E.S.T dimensions. **Quick mode removed completely**; **no four-dimension-only completion path**; **no four-dimension fallback**. The nine dimensions, four ratings, rubric anchors, grounding validation, trainer accountability, and governed AI generation/review are retained unchanged.
- **Attendance behaviour (A-018):** defaults to **`Present`** on roster initialization; the trainer may toggle an individual student to **`Absent`**; state persists per **student + class session** (conceptually unique); absence never creates or exposes a fabricated assessment or report; changes are **auditable**.
- **Management creation and invitation scope (A-019, A-020):** management creates Class Modules under a selected Class Grade, dated Class Sessions, trainer/student/parent profiles and email invitations, enrolments, parent–student links, and one trainer assignment per class session — and **never edits feedback-report content**. Every management write is server-side, centre-scoped, validated, authorized and auditable. **Auth identity is distinct from the domain profile**; the recipient verifies their address and sets **their own** credentials; **no plaintext generated password is stored, displayed or emailed**; invitation states include at least `pending` / `accepted` / `expired` / `revoked`; an unactivated profile is **not** an active login identity.
- **Canonical report rules (A-021):** **one** canonical feedback-report format, **one** shared submitted-report read model, **one** reusable presentation architecture. Trainer views and edits within the governed workflow; **management and parent are view-only** (parent: linked students only). Management and parent cannot reach drafts, internal notes, raw private assessment data, or AI generation history. **Hiding an Edit button is not authorization** — the server rejects management and parent edit attempts. Trainer edits use the governed editable version, never mutate a submitted approval snapshot in place, reset the quality checklist, and require review and approval again. AI never publishes directly. **No report field was fabricated** — the exact Design 2 report section and field schema is recorded as unresolved.
- **Figma Design 2 authority (A-022):** Figma Design 2 replaces Stitch as the final **visual and interaction** authority, and is explicitly **not** authoritative for schema, foreign keys, RLS, server authorization, report lifecycle, audit, Auth, AI governance, persistence, state-machine rules, or transaction boundaries.
- **Figma implementation-readiness and porting guidance (A-022.1 / A-022.2 / A-022.3):** a **mandatory readiness gate** now precedes the first Figma-based UI implementation checkpoint (node-specific `/design/` links, screen names, flows, routes, responsive variants, component/interaction states, the six required states, token inventory, typography/colours/spacing/radii/shadows, logos/SVGs/icons/images, prototype transitions and interaction notes, and governance discrepancies). Blind porting of generated React, Figma mock data, prototype-only navigation, fake authentication, hard-coded identities, duplicated calendar records, client-side authorization assumptions, frame-inferred schema or business logic, Edit-button-inferred permissions, conflicting generated CSS, and Supabase/RLS/validation bypasses is **prohibited**. Missing frames, assets, states or field definitions require implementation to **stop and ask** — never guess. The handoff **does not block Step 7E** unless an unresolved visible field changes the domain relationship model; it **does block** the corresponding UI checkpoint.
- **Supabase-native / no-ORM resolution (A-023):** the long-standing data-layer governance tension (Specification v3 §18 and `CLAUDE.md` §9 naming a typed client "Prisma or Drizzle" against the Supabase-native decision that lived only in the lowest-precedence tracker) is **formally resolved** at spec-amendment precedence: `@supabase/ssr` + `@supabase/supabase-js`; Supabase SQL migrations are the schema source of truth; generated Supabase database TypeScript types are authoritative for application data types; RLS-scoped normal access; reviewed server actions/route handlers for governance-carrying writes; reviewed PostgreSQL functions/RPCs for atomic transition+audit; a separate server-only elevated client requiring explicit authorization; **no Prisma, Drizzle or other general-purpose ORM**, addable only via a later explicit ADR and orchestrator approval.
- **TA-flow deferral (A-014, A-024):** Teaching Assistant is **not** one of the three required completed MVP flows; TA screens, TA login and TA-specific UAT are **deferred** and are not MVP completion gates. **Amendment 001's evidence-security safeguards (A-001, A-003, A-004) are neither deleted nor weakened** and apply in full whenever evidence is implemented. Whether evidence media remains a completion requirement, **who uploads it**, and its exact Figma screens are recorded as **unresolved** — **no replacement uploader was invented, and TA evidence-upload permissions were not transferred to management or trainer**.
- **Files changed (7 in-repository + 1 workspace-level):** created `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_002.md` (A-014 … A-024 with a precise supersession table) and `docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md` (per-screen matrix plus the "Orchestrator Figma Porting Actions" checklist); modified `CLAUDE.md`, `docs/plan/BEST_Coach_Implementation_Plan.md`, `docs/progress/STATUS.md`, `docs/progress/BUILD_NOTES.md`, `docs/progress/DEMO_TO_MVP_MIGRATION.md`; and, outside the repository, the workspace tracker `BEST_COACH_DEMO_TO_MVP_MIGRATION_TRACKER.md`.
- **Implementation Plan additions:** **Gate G1** (governance and schema-preflight, mandatory before Step 7E), **Gate G2** (Figma Design 2 implementation-readiness, mandatory before the first Figma-based UI checkpoint), the revised A-024 implementation sequence, and a new **Amendment 002 verification register** covering all nine ratings required, no Quick mode existing, Present-default attendance, Absent-toggle persistence, attendance uniqueness by student + class session, absent students receiving no fabricated report, management-created sessions appearing in the management calendar, trainer assignment surfacing the same session in the trainer calendar, no duplicated calendar-event record, enrolment appearing in the correct roster, management write isolation to the sole centre, trainer access from live class-session assignment, parent and trainer invitation creation, parent account activation, inactive-profile-vs-active-identity distinction, parent–student isolation, management and parent report-edit denial, trainer-authorized report editing, checklist reset after trainer edit, immutable submitted approval snapshots, one shared canonical report projection, and all three Figma-based flows passing final UAT.
- **Verification performed:** Specification v3 confirmed **byte-for-byte unchanged** (`64d54aa2f0b3200b540b50cebfb5a614e7d644e895effcf5428bd96ae60852a2`); Amendment 001 confirmed **byte-for-byte unchanged** (`25ede394eb4894981d140f6e330450b6e516f056b576b2e14c9afe10434de9b5`); every `governance-source` file confirmed unchanged; the frozen demo confirmed unchanged and clean at its freeze commit with its annotated tag intact; the workspace tracker and `docs/progress/DEMO_TO_MVP_MIGRATION.md` confirmed **byte-identical** after synchronization; Amendment 002 confirmed to define **A-014 through A-024 exactly once each**; the Figma matrix confirmed to contain the **"Orchestrator Figma Porting Actions"** section; `STATUS.md` confirmed to contain the pending **"Figma Design 2 implementation handoff"** item; the Implementation Plan confirmed to contain the mandatory Figma implementation-readiness gate; a stale-requirement scan run across the active governance and plan documents for Quick mode, four-dimension-only completion, direct Centre → Class, "Academic Level" as the active term, Stitch as the current final UI source, Prisma/Drizzle/ORM as the selected data layer, TA as a required completed flow or final UAT persona, multi-centre MVP administration, HQ/super-admin functionality, separate role-specific report formats, and management or parent report editing — with **every remaining match classified as historical or explicitly superseded**, none active; `git diff --check` run clean apart from the intentional two-space Markdown hard line breaks inherited verbatim from the tracker; and the complete diff reviewed.
- **No code changes.** No application, component, route, server action, or library file was created or modified.
- **No runtime changes.** Supabase was not started; Docker was not started; the application was not run; the hosted project was not linked, authenticated, queried, or contacted.
- **No schema changes.** No migration, SQL file, seed data, enum, table, or RLS policy was created; `supabase/migrations` and `supabase/seed.sql` remain absent.
- **No Auth changes.** No Auth user, invitation, token, or credential was created; `.env.local` was **not opened, printed, hashed, copied, parsed, or inspected** at any point.
- **No dependency, package, or configuration changes.** `package.json`, `package-lock.json`, `supabase/config.toml`, `.gitignore`, `.env.example`, and every project configuration file are unchanged.
- **No Figma imports.** No Figma asset was scraped, exported, downloaded, or ported; no Figma-generated React or CSS was produced; **no node ID was fabricated** — every unverified per-screen node cell reads exactly `Pending node-specific Design 2 link — do not guess`.
- **Change set staged** — exactly the seven approved in-repository documentation files, staged with an explicit path-scoped `git add --` (never `git add -A`). No other file is staged, unstaged, or untracked.
- **Commit pending.** No commit, tag, remote, or push was created. **Orchestrator acceptance pending** — this checkpoint does not self-accept, and Step 7E remains blocked until it is reviewed, committed and accepted.

## 2026-07-30 12:39:49 +0800 — Commit the final-MVP governance reconciliation (Step 7E0B)

- **Checkpoint:** Step 7E0B — commit-only. One local commit created from the previously reviewed and approved seven-file staged set. **No file was edited, created, deleted, restored, formatted, or restaged.**
- **Commit:** `722dcb868435e83fbeb3963cc2548d0745436406` (short `722dcb8`)
- **Message:** `docs(governance): ratify final single-centre three-flow MVP`
- **Parent:** `e07b2138c9b670ebd3feda41c89782056cb8a6d5`
- **Summary:** **7 files changed, 1383 insertions, 123 deletions** — **2 created, 5 modified, 0 deleted, 0 renamed**.
- **Committed files:** `CLAUDE.md` (191) · `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_002.md` (467, **created**) · `docs/plan/BEST_Coach_Implementation_Plan.md` (190) · `docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md` (183, **created**) · `docs/progress/STATUS.md` (103) · `docs/progress/BUILD_NOTES.md` (29) · `docs/progress/DEMO_TO_MVP_MIGRATION.md` (343).
- **Message integrity:** verified byte-exact with `od -c` — a **single subject line with an empty body**, no trailer added, matching the byte-exact commit-message discipline of the prior accepted commits.
- **Pre-commit gate:** `git diff --cached --check` reported **13 notices, all `trailing whitespace`, all in `docs/progress/DEMO_TO_MVP_MIGRATION.md`** — the intentional two-space Markdown hard line breaks inherited verbatim from the workspace tracker. A per-file re-check confirmed **zero notices** in each of the other six staged files.
- **Exactly one commit created** — no amend, reset, or rebase; the reflog shows `722dcb8` directly over `e07b213`. **No tag, no remote, nothing pushed.**
- **Post-commit repository state:** branch `main`; **12 commits**; working tree **clean** (0 porcelain lines with `-uall`); index **empty**; no tag; no remote; no upstream configured.
- **Immutable-source verification (before and after the commit):** Specification v3 `64d54aa2f0b3200b540b50cebfb5a614e7d644e895effcf5428bd96ae60852a2` and Amendment 001 `25ede394eb4894981d140f6e330450b6e516f056b576b2e14c9afe10434de9b5` — **byte-for-byte unchanged and untouched by the commit**; `governance-source/` unchanged (v3 `64d54aa2…`, Plan `5e998239…`, `CLAUDE.md` `b73813a3…`).
- **Frozen-demo verification:** branch `main`, HEAD `8d4acf4abc5039c24da01be773ab1a5e4916080f`, 1 commit, **clean** (0 porcelain lines), annotated tag `demo-freeze-step14-2026-07-21` pointing at the freeze commit, no remote.
- **Tracker parity:** the workspace tracker and the committed migration copy were byte-identical at `76636008fe49e68788f0da620065dcdf396bc64b2b187f272a88c89c39cd3ab3` (191 418 bytes, 2 296 lines), confirmed by `cmp` and by hashing the committed Git blob.
- **No application, schema, runtime, dependency, Auth, seed, or Figma change** — no code, package, dependency, configuration, migration, schema, environment, test, or Figma asset file was committed; no typecheck, lint, build, test, dev server, Supabase start, Docker start, hosted link/login/query, Auth user, seed, or Figma import/export occurred. **`.env.local` was never accessed.**

## 2026-07-30 — Step 7E0 acceptance recorded and staged (Step 7E0C)

- **Checkpoint:** Step 7E0C — record and stage acceptance of the final-MVP governance reconciliation. **Documentation-only progress-record checkpoint; stops before commit.**
- **Step 7E0 is COMPLETED and ACCEPTED by the orchestrator (acceptance date 2026-07-30).** The documentation reconciliation was reviewed and accepted; the substantive governance commit is **`722dcb8`**. Sub-checkpoints **Step 7E0A** (change set) and **Step 7E0B** (commit) are both **Completed · Accepted**.
- **Accepted content carried by `722dcb8`:** Amendment 002 **A-014 through A-024**; **exactly three completed MVP flows — Management, Trainer and Parent**; **one-centre-only MVP operation**; **one named management account**; the canonical hierarchy **Centre → Class Grade → Class Module → Class Session**; the Class Grade values **Beginner, Intermediate and Advanced**; **mandatory nine-dimension assessment**; **removal of Quick mode**; **Present-by-default attendance with a trainer-controlled `Absent` toggle**; the **management creation, invitation, enrolment and assignment scope**; **one shared canonical report format**; **trainer edit access**; **management and parent view-only access**; **Figma Design 2 as the final visual and interaction authority**; the **mandatory Figma implementation-readiness handoff**; **Supabase-native data access**; **no general-purpose ORM**; and **TA-flow deferral while preserving Amendment 001 evidence safeguards** (A-001, A-003, A-004 remain active in full).
- **Amendment 002 is ACTIVE.** Specification v3, Amendment 001 and `governance-source/` remain byte-for-byte unchanged.
- **Step 7D remains completed and fully accepted**, and **no previously accepted history was rewritten** by the Step 7E0 / 7E0B / 7E0C sequence.
- **Step 7E remains `Blocked` · `Accepted: No` · `Authorized: No` · `Started: No`.** It may be authorized **only after Step 7E0D is completed, committed, recorded and accepted**.
- **Seven schema-critical blockers carried forward, none resolved here:** (1) public application-profile relationship to `auth.users`; (2) audit-target representation; (3) report-status storage; (4) database `GRANT` strategy; (5) enum-versus-reference-table strategy including Class Grade; (6) invitation state, token and expiry storage; (7) exact scope of the first migration (tables, enums, constraints, functions). The later **audit-chain** decisions — chain scope, SHA-256 ratification, genesis rule — are retained for **Step 7H**. **No schema-critical or audit-chain decision was resolved, narrowed, or silently decided in this checkpoint.**
- **Step 7E0D — Schema-critical decision ratification is created and AUTHORIZED** (Status **Pending**, Accepted **No**, Authorization date **2026-07-30**): **documentation and architecture-decision work only**, with **no SQL migration or application implementation authorized**. It must determine at minimum the application profile ↔ `auth.users` key relationship; the table/reference strategy for roles and Class Grades; invitation lifecycle persistence; report lifecycle/status representation; audit target representation; the initial `GRANT` policy; and the exact first-migration boundary. **That decision work was not performed in this checkpoint** — only the checkpoint was established and authorized.
- **Designation housekeeping:** the former `Step 7E0-B` designation is retired to avoid confusion with the completed `Step 7E0B` commit checkpoint; its remaining scope is carried by **Step 7E0D**. It was Pending, unauthorized and never started, so **no accepted history is affected**, and its text is preserved as provenance.
- **Decisions appended:** **D-206 through D-224**, sequential after the actual last existing identifier **D-205**; the log remains contiguous (D-001 … D-224) and unique (224 IDs).
- **Files changed (3 in-repository + 1 workspace-level):** `docs/progress/DEMO_TO_MVP_MIGRATION.md`, `docs/progress/STATUS.md`, `docs/progress/BUILD_NOTES.md` (append-only), and — outside the repository — the workspace tracker `BEST_COACH_DEMO_TO_MVP_MIGRATION_TRACKER.md`. **No other file was modified.**
- **Tracker synchronization:** the workspace tracker was synchronized **byte-for-byte** into `docs/progress/DEMO_TO_MVP_MIGRATION.md`; both sides verified identical by `cmp` and SHA-256.
- **No application, schema, migration, runtime, dependency, Auth, seed, test, or Figma change**; no typecheck, lint, build, test, container, or hosted operation ran; `supabase/migrations`, `supabase/seed.sql` and `supabase/functions` remain absent, zero `.sql` files are tracked, and no application schema table exists. **`.env.local` was never accessed, inspected, printed, hashed, parsed or copied.**
- **This acceptance-record change set is staged but NOT committed** — no commit, tag, remote, or push. Per the anti-recursion rule (D-060 … D-066, D-101, D-121, D-145, D-169, D-213), these committed progress files will name the **substantive** governance commit `722dcb8` rather than their own administrative hash; that absence is intentional and is not a defect.

---

## 2026-08-03 — Schema-critical architecture analysis, ratification and acceptance (Steps 7E0D1, 7E0D2A, 7E0D2B, 7E0D2C)

- **Checkpoint:** Step 7E0D2C — record and stage acceptance of the schema-critical architecture ratification. **Documentation-only progress-record checkpoint; stops before commit.**
- **Step 7E0C is COMPLETED and ACCEPTED.** The Step 7E0 acceptance record was committed at sub-checkpoint **Step 7E0C2** as **`6551d37253e562a40d51e521b93c261daf7efdc9`** (`docs(progress): record final MVP governance acceptance`, parent `722dcb8`; resulting commit count **13**).

**Step 7E0D1 — read-only schema-critical architecture analysis: COMPLETED and ACCEPTED.**

- Decisions **A – G** were analysed one at a time, with **binding orchestrator correction rounds on Decisions A, B, D, E and F**, followed by a final integrated cross-decision consistency review.
- Corrections that changed the accepted architecture: **A** — `accounts` must be **centre-independent** (a centre-bound account with a unique `auth_user_id` would forbid a second-centre relationship) and **dual role authority removed**; **B** — account lifecycle and membership lifecycle **separated**, membership status made an **enum not a boolean**, Class Grade given a **code enum plus centre-owned rows**, dimensions made **global**; **D** — checklist and approval evidence moved to a **version-scoped** table, versions made **self-contained**, and the freeze point corrected to **approval, not submission**; **E** — the blanket "no foreign keys" rule replaced by **durable actor FKs (`RESTRICT`) plus FK-free polymorphic targets with label snapshots**, and JSONB replaced by a **child table**; **F** — "server-side" rejected as a privilege mechanism (**the database role follows the credential, not the code location**), a `security_invoker` view replaced by a **`SECURITY DEFINER` read RPC**, and governed mutation RPCs corrected to **`SECURITY DEFINER` by design** because a caller holding no DML cannot mutate through an invoker function. An enum miscount (11) was corrected to **10**.
- The analysis produced **no file, SQL, schema, Auth, runtime or repository change of any kind.** The repository stayed at HEAD `6551d37` with a **clean working tree and empty index** throughout. **The analysis ratified nothing by itself.**

**Centre seed identity confirmed by the orchestrator:** code **`ispeak`**, display name **`iSpeak Academy`**. **Recorded only — no centre row has been seeded and no seed file exists.**

**Step 7E0D2A — ratification change set staged.** Created `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_003.md` (**A-025 … A-032**, ratification date 2026-08-03, 374 lines) and reconciled `CLAUDE.md` (§1 precedence and source table, **ADR-3 narrowed for the canonical report read path**, ADR-7 renamed to `centre_memberships`, §6 identity/invitation/attendance/state-machine/checklist/visibility bullets, **new §6.1** carrying the ratified inventory, §9 physical-naming rule, §10 Phase 0 checkpoint decomposition, §12 stop-and-ask list) and `docs/plan/BEST_Coach_Implementation_Plan.md` (Amendment 003 reconciliation block, **G1a** new item, **G1b replaced with the nine resolved decisions**, **G1c** updated with the still-open audit items, **new G1d** 7E–7J decomposition and exclusions, a new authorization rule separating *eligible* from *authorized*, the Step 7E0D record, Phase 0 steps 1/4/5/7 and the exit condition bounded, and two verification-register items corrected).

**Step 7E0D2B — substantive commit: `b367475c180a2e4f4cf70ff1385f34b253356c33`** (short `b367475`).

- **Message:** `docs(governance): ratify schema-critical MVP architecture` — one subject line only, no body, no trailer.
- **Parent:** `6551d37253e562a40d51e521b93c261daf7efdc9` · **Date:** `2026-08-03 02:44:20 +0800` · **Resulting commit count:** **14**.
- **File/change summary: 3 files changed, 479 insertions(+), 37 deletions(-)** — **1 created, 2 modified, 0 deleted, 0 renamed**: `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_003.md` (created) · `CLAUDE.md` (modified) · `docs/plan/BEST_Coach_Implementation_Plan.md` (modified).
- `git diff --cached --check` exited **0**. No tag, remote, upstream, push, amend, rebase or reset. **The commit changed no progress file**, so the workspace tracker and committed migration copy remained byte-identical across it.
- **The commit was documentation and governance only.** No SQL, migration, `seed.sql`, Supabase function, Auth user, fixture, database type, application code, test, dependency, runtime process or Figma asset was created, modified or executed by it.

**Accepted architecture — Decisions A – G as corrected, ratified as Amendment 003 A-025 … A-032:** centre-independent `accounts` (application-owned UUID, nullable unique `auth_user_id`, lifecycle `active`/`deactivated`, **no `centre_id`, no `role`**) with `centre_memberships` as the **sole role authority** and `students` holding **no Auth relationship** (A-025) · enum-vs-reference-table rules with **centre-owned Class Grades** and **global** nine-dimension reference data, and **no Quick 4 representation** (A-026) · **Auth owns every authentication secret**, enforced by the **absence of any secret-bearing column**, with transactional effective invitation expiry (A-027) · the report **aggregate/self-contained-version** model in which **approval — not submission — freezes**, checklist and approval evidence are **version-scoped and immutable**, and **submitted versions never reopen** (A-028) · audit **compatibility guarantees only**, with durable actor FKs and polymorphic label-snapshotted targets (A-029) · **deny-by-default** privileges where **the database role follows the credential, not the code location** (A-030) · and the exact first-migration boundary with explicit exclusions (A-031, A-032).

**Accepted exact Step 7E inventory — recorded, not created:**

- **10 enums:** `centre_membership_role` · `account_status` · `centre_membership_status` · `class_grade_code` · `dimension_code` · `dimension_group` · `competency_rating` · `attendance_status` · `invitation_status` · `report_status`.
- **22 tables:** `centres` · `accounts` · `centre_memberships` · `trainer_profiles` · `parent_profiles` · `students` · `parent_student_links` · `class_grades` · `class_modules` · `class_sessions` · `enrolments` · `class_session_assignments` · `attendance` · `invitations` · `assessment_dimensions` · `observations` · `observation_ratings` · `reports` · `report_versions` · `report_version_ratings` · `report_version_checklist_progress` · `report_version_approvals`.
- **13 deterministic seed rows:** 1 centre (`ispeak` / `iSpeak Academy`) · 3 Class Grades (`beginner`/Beginner/1, `intermediate`/Intermediate/2, `advanced`/Advanced/3) · 9 assessment dimensions (Body, Emotion, Speech, Tonality = `competency` 1–4; Eye Contact, Vocal Projection, Emotional Expression, Sentence Flow, Audience Awareness = `speech_linguistics` 5–9). **Seed UUIDs are fixed across environments, and mismatched pre-existing reference data must fail verification rather than be silently accepted.**

**Step 7E remains `Blocked` · `Accepted: No` · `Authorized: No` · `Started: No`.** All seven schema-critical blockers are resolved, which makes Step 7E **eligible, not authorized**. **Amendment 003 governs schema architecture and migration boundaries; it is not an implementation authorization**, and **Step 7E requires a separate explicit orchestrator authorization that has not been given.** The **7E → 7F → 7G → 7H → 7I → 7J** sequence is preserved unchanged.

**Not resolved here, and not silently decided:** invitation duration; the session-lifecycle vocabulary; the restricted `NOLOGIN` `SECURITY DEFINER` function owner; the management bootstrap mechanism; audit-read capability; evidence scope and uploader; the Figma Design 2 implementation handoff (**still pending**); and the **entire audit-chain design** — chain scope, canonical serialization, hash application, previous-hash rules, genesis, and verification/repair — which **Amendment 003 explicitly declines to ratify** and which remains **Step 7H** work.

- **Decisions appended:** **D-225 through D-231**, sequential after the last existing identifier **D-224**; the log remains contiguous (**D-001 … D-231**) and unique (**231 IDs, 0 duplicates, 0 gaps**).
- **Files changed in this Step 7E0D2C checkpoint (3 in-repository + 1 workspace-level):** `docs/progress/DEMO_TO_MVP_MIGRATION.md`, `docs/progress/STATUS.md`, `docs/progress/BUILD_NOTES.md` (append-only), and — outside the repository — the workspace tracker `BEST_COACH_DEMO_TO_MVP_MIGRATION_TRACKER.md`. **No other file was modified.** `CLAUDE.md`, Specification v3, Amendments 001/002/003, the Implementation Plan, the Figma matrix, `governance-source/`, package files and all application/runtime/Supabase files are **unchanged**.
- **Tracker synchronization:** the workspace tracker was synchronized **byte-for-byte** into `docs/progress/DEMO_TO_MVP_MIGRATION.md`; both sides verified identical by **raw byte comparison, SHA-256, byte count and line count**.
- **No application, schema, migration, runtime, dependency, Auth, fixture, database-type, seed, test, or Figma change**; no typecheck, lint, build, test, container, or hosted operation ran; `supabase/migrations`, `supabase/seed.sql` and `supabase/functions` remain **absent**, **zero `.sql` files are tracked**, and no application schema table exists. **`.env.local` was never accessed, inspected, printed, hashed, parsed or copied.**
- **This acceptance-record change set is staged but NOT committed** — no commit, tag, remote, or push. Per the anti-recursion rule (D-060 … D-066, D-101, D-121, D-145, D-169, D-213), these committed progress files name the **substantive** ratification commit `b367475` rather than their own administrative hash; that absence is intentional and is not a defect.

---

## 2026-08-03 — First governed SQL migration: authoring, correction, local verification and commit (Steps 7E1A, 7E1B, 7E2A, 7E2B, 7E2C)

- **Checkpoint:** Step 7E2C — record and stage acceptance of the governed-core migration. **Documentation-only progress-record checkpoint; stops before commit.**
- **Authorization:** an explicit orchestrator authorization **bounded to Step 7E alone**. It did **not** extend to Step 7F or any later checkpoint.

**Step 7E1A — initial migration authoring.** The first governed-core migration was authored as exactly one file, `supabase/migrations/20260803034500_step_7e_governed_core.sql`, and staged with path-scoped staging. It was **not applied to any database and not committed** at this point. Static review then identified four items requiring correction: **missing active normalized-email uniqueness** on `accounts`; **`full_name` versus `display_name`**; **incomplete role pinning** for the attendance recorder and the report-version author and submitter, which were centre-pinned only; and **the need to adjudicate `content_hash` precisely** rather than assume that deferring the audit hash chain automatically deferred a report-content hash.

**Step 7E1B — corrections.** The file was edited **in place** — not renamed, and no corrective second migration was created:

- `accounts.full_name` → **`accounts.display_name`**; **`accounts.normalized_email`** added (`NOT NULL`, `CHECK`-normalized to lowercase/trimmed with an `@`).
- **`accounts_one_active_per_normalized_email_idx`** added — partial unique over `WHERE status = 'active'`, so many **deactivated** historical accounts may share an email while two **live** identities for one email are impossible. The email is a **lookup and contact snapshot only, never an authorization source** (A-027).
- `accounts` retains **no `centre_id` and no role column**.
- **Attendance recorder, observation recorder, report-version author, report-version approver and report-version submitter are all trainer-role-pinned** via the composite `(membership_id, centre_id, role) → centre_memberships(id, centre_id, role)` pattern plus a role `CHECK`. Optional actors carry a nullable role discriminator with `CHECK ((id IS NULL) = (role IS NULL))`, so an actor is either wholly absent or internally consistent.
- **`content_hash` remains absent under Amendment 003 A-032.** Specification v3 §20 lists it and A-028 does not supersede it, so it stays a live data-model requirement; but §23 — "Approval provenance. An approval event captures the `content_hash` of the approved version" — is the clause that gives it meaning, making it audit-provenance data, and A-032 states Step 7E creates "no AI, evidence, audit, or hash-chain column … A column arrives with the checkpoint that gives it meaning." Its algorithm and canonical serialization are explicitly unratified (A-029; U-14). It is deferred to **Step 7H**.
- The **exact 10-enum, 22-table and 13-seed boundary was unchanged** by the corrections.

**Migration file (final, committed):** SHA-256 **`422be2850c6913ca040bc54b90902df8eaaf35d66492230553e65ab1b3f8db54`** · **66,809 bytes** · **1,209 lines**.

**Step 7E2A — local application and catalogue proof.** Docker Desktop was started (it was not running) and the local Supabase stack brought up with the accepted Windows configuration unchanged — 10 services healthy, Analytics/Vector/imgproxy/pooler intentionally stopped. `supabase db reset --local` applied migration version **`20260803034500`** from a clean local database with **exit code 0**, recorded **exactly once**. Catalogue verification via the local container confirmed:

- **10 enums** with exact ordered values; **22 application tables**; **13 deterministic seed rows** with exact fixed UUIDs, codes, labels, groups and orders; **0 rows** in all 19 other application tables; **0** Auth users.
- **44 foreign keys** — 40 `ON DELETE RESTRICT`, 3 `CASCADE` (owned children only), 1 `SET NULL` (`accounts.auth_user_id`); **0** FK targets unbacked by a primary or non-partial unique candidate key.
- **43 explicit indexes**, all present (8 partial-unique + 35 supporting), plus 54 constraint-backed; **0** index predicates reference `now()`.
- **RLS enabled on all 22 tables**, forced on 0; **0 RLS policies**; **0 explicit grants**; and **zero effective table privileges** for `PUBLIC`, `anon`, `authenticated` and `service_role` across all seven privilege types, measured with catalogue privilege functions rather than a textual scan. `PUBLIC` does not retain `CREATE` on schema `public`.
- **0** views, materialized views, functions, procedures, non-internal triggers, extensions or additional application schemas; **0** AI/evidence/audit/`content_hash`/Quick-4/session-lifecycle/version-kind objects.
- The Step 7I rules remain **deliberately unenforced** — 0 triggers, 0 rules, 0 functions, 0 rating-cardinality constraints.

**Lint:** `supabase db lint --local` returned **zero errors and zero warnings**, including at `--level warning` with `--fail-on warning` (exit 0). Nothing was suppressed or fixed.

**Credential-output incident (local-only scope).** `supabase start` briefly printed **disposable local-development JWT and S3 default values** because the first redaction filter targeted a `Key: value` form while the CLI emits a JSON `"KEY": "value"` block. **No hosted credential and no `.env.local` value was exposed** — these are Supabase's publicly documented local defaults, regenerated on every `supabase start`. Redaction was tightened immediately and all later output was clean. **Future database-operation prompts must suppress all credential-bearing CLI output.**

**Step 7G carry-forward.** A **pre-existing `supabase_admin` default ACL** in schema `public` may grant client privileges to **future objects created by that role**. It **did not affect the 22 Step 7E tables**, which are **`postgres`-owned and catalogue-verified at zero client privileges**. **Step 7G must inspect effective and default ACLs before adding any policy or grant.** No default privilege was changed in Step 7E.

The local stack was **stopped cleanly** afterwards (0 running containers) and the migration file remained **byte-identical** throughout.

**Step 7E2B — commit.** **`252ef9b13008629cadc238bdf58b7016c50bb7b2`** (short `252ef9b`) · `feat(supabase): add governed core schema migration` — one subject line, no body, no trailer · parent `584691ebe8b12e8b0eb0d56ca38db259d59ec949` · `2026-08-03 04:37:05 +0800` · **1 file changed, 1,209 insertions(+), 0 deletions**, `create mode 100644` · resulting commit count **16**. The committed blob is **byte-identical** to the locally verified migration and the commit **changed no progress file**.

**Step 7E is Completed and Accepted (2026-08-03). Step 7F remains Not accepted · Not authorized · Not started** and requires a **separate explicit orchestrator authorization**. The **7F → 7G → 7H → 7I → 7J** sequence is preserved unchanged and the **Figma Design 2 implementation handoff remains pending**.

- **No hosted operation occurred** — no `supabase link`, no project reference, no `--linked`, no hosted URL; `supabase/.temp/project-ref` does not exist, so the project has never been linked. All database work targeted the **local disposable stack only**.
- **No Auth user, fixture, RLS policy, client grant, RPC, view, function, trigger, audit object, generated database type, application code, test or Figma asset was created.** `supabase/seed.sql` and `supabase/functions` remain absent; exactly one tracked `.sql` file exists.
- **Decisions appended:** **D-232 through D-237**, sequential after **D-231**; the log remains contiguous (**D-001 … D-237**) and unique (**237 IDs, 0 duplicates, 0 gaps**).
- **Files changed in this Step 7E2C checkpoint (3 in-repository + 1 workspace-level):** `docs/progress/DEMO_TO_MVP_MIGRATION.md`, `docs/progress/STATUS.md`, `docs/progress/BUILD_NOTES.md` (append-only), and — outside the repository — the workspace tracker. **No other file was modified**, and **no database command was run in this checkpoint**.
- **Tracker synchronization:** synchronized **byte-for-byte** into `docs/progress/DEMO_TO_MVP_MIGRATION.md`; verified by raw byte comparison, SHA-256, byte count and line count.
- **This acceptance-record change set is staged but NOT committed.** Per the anti-recursion rule (D-060 … D-066, D-101, D-121, D-145, D-169, D-213, D-230), these committed progress files name the **substantive** migration commit `252ef9b` rather than their own administrative hash; that absence is intentional and is not a defect.

---

_Next permitted action: review and commit the staged Step 7F0E acceptance record (the three progress files listed in the entry below). **After that commit is accepted, no implementation checkpoint becomes authorized automatically — Step 7F implementation requires a separate, explicit orchestrator authorization.**_

---

## 2026-08-03 — Synthetic Auth and domain fixture design: analysis, ratification, correction and commit (Steps 7F0A, 7F0B, 7F0C, 7F0C1, 7F0D, 7F0E)

**Scope:** design and governance only. **No fixture was implemented.** No Auth user, fixture row, fixture script, SQL fixture file, `seed.sql`, migration, policy, grant, RPC, application code, test or Figma asset was created; Supabase was never started; no database or hosted command ran; `.env.local` was never accessed; no password or credential was requested, printed or persisted.

**Step 7F0A — read-only synthetic Auth and domain-fixture design.** Designed the minimum synthetic dataset needed to support later **Management, Trainer and Parent** proof without pre-empting Step 7G–7J: the three identities, the domain inventory and its FK insertion order, the Auth-bootstrap and invitation boundary, a delivery-mechanism evaluation, and the verification/negative-test plan. **Option B was recommended** — one observation and nine mixed ratings, with no report aggregate, version, approval, checklist or invitation. **No repository or database change occurred.**

**Step 7F0B — fixture implementation mechanics.** Resolved the open mechanics against **installed local sources only** (`node_modules/@supabase/auth-js@2.110.8` source and typings, `@supabase/supabase-js@2.110.8`, project `package.json`, `supabase/config.toml`, and project-local CLI help). Findings: `AdminUserAttributes.id` is **documented and type-supported**, and `createUser` forwards the request body verbatim to the ordinary `POST /admin/users` endpoint, so **caller-supplied deterministic Auth UUIDs are supported** and direct `auth.users` insertion, password hashes and unsupported casts remain **prohibited and unnecessary**. The **runtime-generated Auth UUID fallback was withdrawn**; a returned UUID that does not match its ratified literal must **abort rather than adapt**. Also established: `service_role` holds **zero** privileges on the 22 Step 7E tables after the migration's explicit revoke, so domain rows must load over a direct owner connection rather than a Supabase client; and the CLI exposes **no** local "execute this SQL file" command (`db` offers only `diff`, `dump`, `push`, `pull`, `reset`, `lint`, three of which target the **remote** database). **No implementation occurred.**

**Orchestrator confirmation (2026-08-03).** The design was ratified with exactly three synthetic Auth identities and no Student Auth identity:

| Role | Display name | Email | Auth UUID | Account UUID | Membership UUID |
|---|---|---|---|---|---|
| Management | `Fixture Manager One` | `management.fixture@example.test` | `d0000000-0000-4000-8000-000000000001` | `c0000000-0000-4000-8000-000000000001` | `c1000000-0000-4000-8000-000000000001` |
| Trainer | `Fixture Trainer One` | `trainer.fixture@example.test` | `d0000000-0000-4000-8000-000000000002` | `c0000000-0000-4000-8000-000000000002` | `c1000000-0000-4000-8000-000000000002` |
| Parent | `Fixture Parent One` | `parent.fixture@example.test` | `d0000000-0000-4000-8000-000000000003` | `c0000000-0000-4000-8000-000000000003` | `c1000000-0000-4000-8000-000000000003` |

**Exact fixture footprint (designed, NOT created):** **3 Auth users** and **25 application-domain rows** — **15 core** (3 `accounts`, 3 `centre_memberships`, 1 `trainer_profiles`, 1 `parent_profiles`, 1 `students`, 1 `parent_student_links`, 1 `class_modules`, 1 `class_sessions`, 1 `enrolments`, 1 `class_session_assignments`, 1 `attendance`) and **10 assessment** (1 `observations`, 9 `observation_ratings`). Anchored on the Step 7E seed centre `ispeak` / `iSpeak Academy` and Class Grade `beginner`; student `Fixture Student One`; module `Beginner Public Speaking — Fixture Module A`; session `2026-02-03`, `10:00–11:00`; attendance `present` with **both recorder columns NULL** (default roster initialization, not a trainer action); observation at `lock_version` `1` with empty chips and NULL notes. All nine rating UUIDs and dimension/rating pairs are fixed in `docs/plan/STEP_7F_SYNTHETIC_FIXTURE_BASELINE.md`.

**Option B (ratified).** `reports`, `report_versions`, `report_version_ratings`, `report_version_checklist_progress`, `report_version_approvals` and `invitations` all remain at **zero rows**, so **no report lifecycle, approval, publication, invitation-acceptance or Management-bootstrap transition is fabricated**. The line falls between `observation_ratings` and `reports` because an observation is captured factual data with no status, approval or publication, whereas the report aggregate is where governance begins and is Step 7I's property.

**Delivery and credential rules (ratified).** A **local-only Node ESM loader** (`scripts/fixtures/load-local-fixtures.mjs`), **static transactional domain SQL** (`scripts/fixtures/local_fixtures.sql`) and **verification/negative-test SQL** (`scripts/fixtures/verify-local-fixtures.sql`), plus **one** future `package.json` script and **no new dependency**; Auth users through the **local Auth Admin API**, domain rows through **local-container `psql`**. Excluded: **no `supabase/seed.sql`, no second migration, no direct `auth.users` insertion, no password hash, no invitation row.** Passwords are entered **only through no-echo interactive stdin in an operator-controlled local terminal** — **no environment-variable path** — and **no password or credential may enter chat, any tracked or untracked file, a log, an error or a report**. **No pattern-based redaction** is used; credential-bearing stdout and stderr stay **captured and unrendered**; the local API URL and service-role key stay **process-memory only**; and the loader **aborts** unless the API URL is loopback, the configured ports match and no project-ref exists. **None of these files exists yet.**

**Determinism, reload and recovery (ratified).** Every Auth and domain UUID and every fixture timestamp is a **fixed literal**, so the acceptance checksum covers **all** fixture columns including `accounts.auth_user_id`. A duplicate load without `--reload` **fails** rather than absorbing divergent state. `--reload` deletes **only** exact fixture UUIDs and exact reserved fixture emails, with domain deletion **transactional and reverse-FK** (13 statements, mandatory because every inter-table FK is `ON DELETE RESTRICT`), the **Step 7E seed rows never in the deletion set** and asserted intact before commit, and Auth deletion through the **Auth Admin API** with exact reserved-email matching. A partial failure between Auth creation and the domain transaction triggers **compensation**, and **no non-fixture user may be deleted**.

**Step 7F0C — documentation and staging.** Created `docs/plan/STEP_7F_SYNTHETIC_FIXTURE_BASELINE.md` (442 lines, 32,167 bytes) and reconciled `CLAUDE.md` (§1 source table, §10 Phase 0 status, §11 fixture exception and credential rules, §12 stop-and-ask) and the Implementation Plan (new Step 7F0 block, footprint table, Phase 0 steps 6 and 8). Staged exactly three files path-scoped; **no commit**.

**Step 7F0C1 — stale Step 7E governance correction.** A required full-file search of `CLAUDE.md` found **four** stale current-state statements — the two named in the Step 7F0C report (§6.1 blockquote and the §10 Phase 0 blockquote) **plus two more** (the §1 Amendment 003 row and the §6.1 lead-in sentence). All four were corrected. The §10 historical text is **preserved verbatim inside a quotation** and labelled **HISTORICAL — superseded**, so the earlier blocked state stays on record without reading as a current instruction. **No fixture decision, UUID, count, credential rule or checkpoint sequence was changed.**

**Step 7F0D — commit.** **`936cf4e9b131b99943db6724bfb6eb9b23c07050`** (short `936cf4e`) · `docs(fixtures): ratify synthetic fixture baseline` — one subject line, **no body, no trailer** · parent `20e3650be26c0f40fda32078da32398c924e2672` · `2026-08-03 07:31:15 +0800` · **3 files changed, 495 insertions(+), 5 deletions(-)**, one file created · contents exactly `CLAUDE.md`, `docs/plan/BEST_Coach_Implementation_Plan.md` and `docs/plan/STEP_7F_SYNTHETIC_FIXTURE_BASELINE.md`, with committed blob hashes matching the verified staged hashes. **A malformed initial Git invocation (`--no-verify=false`) was rejected by Git before any commit object was created and caused no repository change**; HEAD was re-verified at `20e3650` with the same three files staged before the single clean commit. **Exactly one commit exists.**

**Step 7F0E — acceptance record (this entry).**

- **Decisions appended:** **D-238 through D-245**, sequential after **D-237**; the log remains contiguous (**D-001 … D-245**) and unique (**245 IDs, 0 duplicates, 0 gaps**).
- **Files changed in this Step 7F0E checkpoint (3 in-repository + 1 workspace-level):** `docs/progress/DEMO_TO_MVP_MIGRATION.md`, `docs/progress/STATUS.md`, `docs/progress/BUILD_NOTES.md` (append-only), plus the workspace tracker outside the repository.
- **Tracker synchronization:** synchronized **byte-for-byte** into `docs/progress/DEMO_TO_MVP_MIGRATION.md`; verified by raw byte comparison (**0 differing bytes**), SHA-256, byte count and line count.
- **Governance boundaries preserved:** the minimal fixture is a **deliberate Phase 0 exception** to `CLAUDE.md` §11, whose broader **2-trainer / 2-module / 3–4-student / 2-parent** dataset **plus a second Class Session** remains a **later additive Phase 1 requirement — deferred, not deleted**. **N-4 / U-23 (production Management bootstrap) remains unresolved.** **P-1** remains the mandatory opening review for Step 7G, and the **7F → 7G → 7H → 7I → 7J** sequence is unchanged.
- **Step 7F implementation remains Not accepted · Not authorized · Not started.** Ratifying the design made Step 7F **ready**, not **authorized**; it requires a **separate explicit orchestrator authorization**.
- **This acceptance-record change set is staged but NOT committed.** Per the anti-recursion rule (D-060 … D-066, D-101, D-121, D-145, D-169, D-213, D-230, D-236), these committed progress files name the **substantive** commit `936cf4e9b131b99943db6724bfb6eb9b23c07050`, never their own administrative hash.

## 2026-08-03 — Deterministic local synthetic fixture: implementation, correction, runtime proof and commit (Steps 7F1A, 7F1B, 7F1C, 7F1C1, 7F1C2, 7F1C3, 7F1D, 7F1E, 7F1F)

**Scope:** Step 7F implementation, delivered under a bounded orchestrator authorization and applied to a **local disposable Supabase database only**. **No hosted database was accessed**, the project has never been linked, `.env.local` was never accessed, and **no password, password length, service-role key, local API URL, database connection string or container connection detail was requested, printed, logged, persisted or reported** at any point.

**Step 7F1A — authoring and staging.** Created the three ratified files — `scripts/fixtures/load-local-fixtures.mjs`, `scripts/fixtures/local_fixtures.sql` and `scripts/fixtures/verify-local-fixtures.sql` — and added exactly one `package.json` script (`fixtures:local`), with **no new dependency** and **no change to `package-lock.json`**. Staged four files path-scoped; **no commit**.

**Step 7F1B — timestamp reconciliation and static audit.** The orchestrator ratified the four fixed timestamp groups — `2026-01-05T09:00:00+08:00`, `2026-01-12T09:00:00+08:00`, `2026-02-03T10:00:00+08:00` and `2026-02-03T11:05:00+08:00` — and the full 37-column mapping was recorded in `docs/plan/STEP_7F_SYNTHETIC_FIXTURE_BASELINE.md`. The static audit found and corrected seven implementation defects before any execution: psql table formatting would have corrupted the canonical checksum region (`\pset tuples_only` / `format unaligned` / `footer off` added); Node refuses to spawn a `.cmd` shim with `shell:false` on Windows (`EINVAL`, proven empirically), fixed by resolving the package-local native Supabase executable with a shell-free `process.execPath` fallback; the canonical ordering was not total (`row_number() OVER (ORDER BY u.id)` added); an empty array rendered ambiguously (`chips::text` → `{}`); a meaningless timestamp format token; a broad stderr regex replaced by an **allow-list of project-authored markers**; and `--no-psqlrc` added so a stray container `~/.psqlrc` could not alter output.

**Step 7F1C — first execution attempt: BLOCKED, no mutation.** The available execution channel was **not a genuine interactive TTY** (`process.stdin.isTTY` and `process.stdout.isTTY` both `false`, `setRawMode` unavailable, POSIX `tty` reporting "not a tty"). Per the checkpoint's own stop condition the loader was **not invoked** and **no alternative password path was substituted**: `OPERATOR INTERACTIVE TTY REQUIRED — FIXTURE LOAD NOT STARTED`. Supabase was not started, no reset occurred, and no Auth user, fixture row or checksum existed.

**Step 7F1C1 — Windows no-echo password handler corrected.** The operator's first real attempt reached the Management prompt, but Enter did not advance and Ctrl+C did not cancel; the process tree had to be terminated with `taskkill /T /F`. **Root cause, proven empirically:** the handler called `input.setEncoding('binary')`, so the `data` event delivered a **string**; iterating a string yields **single-character strings**, and every numeric byte comparison (`=== 0x0d`, `=== 0x0a`, `=== 0x03`, `=== 0x7f`, `=== 0x08`) was therefore permanently `false`. Enter then fell into `byte < 0x20` — an abstract relational comparison where `Number('\r')` is `0` — and was silently discarded, while Ctrl+C fell through to `String.fromCharCode(NaN)` and was swallowed into the buffer. Raw mode suppresses Node's SIGINT-from-Ctrl+C, so no cancellation path remained at all. **Correction:** `setEncoding` removed so chunks stay Buffers; interpretation refactored into a pure `createSecretLineReader()` state machine handling `0x0D`, `0x0A` and CRLF as **one** submission, `0x08`/`0x7F` deleting a whole character including UTF-8 continuation bytes, `0x03` cancelling, other control bytes ignored, and bytes after a terminal outcome ignored; a single raw-mode session with one `data` listener and one temporary `SIGINT` handler serves all three prompts, which is what prevents a residual CRLF line feed reaching the next prompt. Proven by **33 assertions** driven from the real source text in memory, without a TTY and without a password. **No mutation occurred.**

**Step 7F1C2 — domain SQL operation guard corrected.** The operator's next run created the 3 Auth users but `local_fixtures.sql` failed with `psql exit 3`. **Root cause, proven from the container log:** `ERROR: syntax error at or near ":" at character 33`, with the `STATEMENT:` line showing the `DO $operation_guard$` block reaching the server with `:'do_cleanup'` **un-substituted** — **psql does not interpolate `:variables` inside a dollar-quoted string**. Character 33 lands exactly on the leading colon. The file's other two variable uses (`\if :do_cleanup`, `\if :do_load`) are psql **meta-commands** and were always correct. **Correction:** the guard now uses `\if` meta-commands, and its `DO` blocks contain **no variable reference at all**; both authored messages are preserved verbatim. Verified across all four variable combinations, and the corrected load path was proven end-to-end in a **rolled-back** transaction with 43 of 44 foreign keys still enforced. A second, smaller correction was made because the failure had been opaque: `--set=VERBOSITY=verbose` was added so psql prefixes server errors with their SQLSTATE, a new allow-list rule surfaces **only the five-character code**, and the failure message now names the SQL file and selected operation. Verbosity affects stderr only — canonical-region stdout was proven byte-identical with and without it. **No Auth user was created and no fixture row was persisted in this checkpoint.**

**Step 7F1C3 — negative tests N2, N3 and N4 corrected; loader exit path corrected.** The next run loaded all 25 rows, then verification failed at **N2**. **Root cause:** three negative tests constructed rows that breached an **unrelated** invariant before the intended one, and PostgreSQL reports whichever it reaches first. Proven live: **N2** used a fixture account that already held an active membership, so `centre_memberships_one_active_per_account_centre_idx` fired instead of `..._one_active_management_per_centre_idx`; **N3** wrote an *active* link duplicating the fixture's own `(parent_membership_id, student_id)` pair, so `parent_student_links_one_active_idx` (23505) fired before any foreign-key trigger and escaped a handler that caught only `foreign_key_violation`; **N4** set `is_active = false` without `unassigned_at`, so `class_session_assignments_active_timestamp_chk` (23514) fired before the role-pinned foreign key. N5 and N7 were probed and confirmed already correct. **Correction:** N2 inserts a scratch account inside its own subtransaction so exactly one invariant can fire; N3 is written inactive with `unlinked_at`; N4 supplies `unassigned_at`. Each now proves its intended constraint. Separately, the loader **hung after every SQL failure until Ctrl+C** — a regression introduced at Step 7F1C1: `input.isPaused()` returns `false` for a stdin nothing has touched (`readableFlowing` is `null`, not `false`), so the `if (wasPaused) input.pause()` guard **never fired** and the resumed stdin handle kept the event loop alive regardless of `process.exitCode`. Proven by timing both variants against a held-open stdin: the conditional form had to be **SIGKILLed at 5,015 ms**, the unconditional form exited on its own in **40 ms**. **Correction:** stdin is always paused; verification failure now **reports** bounded compensation rather than performing it, because the fixture is committed and deleting it would destroy the evidence; and the tail `.finally()` pauses and unrefs stdin on both paths.

**Step 7F1C3 direct verification.** Run through the approved local `docker exec … psql` contract: **psql exit 0**, all positive assertions, all seven negative tests and the residue proof passing, canonical checksum reproduced identically on two independent runs, and fixture counts unchanged afterwards.

**Operator runtime proof (accepted).** Bounded `--reload` passed; a duplicate clean load was **rejected before any password prompt and made no mutation**; two independent reset-and-clean-load cycles passed; **Checksums A, B and C were identical**; every command **exited normally without Ctrl+C**.

**Step 7F1D — independent runtime verification.** Verified without running the loader, using the approved `docker exec … psql` contract only: exactly **3** deterministic Auth users (`d0000000-…-001/002/003` bound to the three reserved `@example.test` emails, and **0** Auth users outside that range); exactly **25** application-domain rows; exactly **28** canonical rows; canonical SHA-256 **`d6a314b40bb5eb1bc3169097e2a9cb03858791498ca5137a43050cee36b87517`**, matching operator Checksums A, B and C; the exact hierarchy, `present` attendance with **both recorder columns NULL**, the observation at `lock_version` `1` with `{}` chips and all notes NULL, and the **nine** exact dimension/rating pairs (9 distinct dimensions, 4 distinct levels, 2 emerging, 2 advanced); **zero** reports, report versions, report-version ratings, checklist-progress rows, approvals and invitations; Step 7E seeds intact at **1 centre / 3 grades / 9 dimensions**; **one** applied migration (`20260803034500`); **RLS enabled on all 22 tables**, **zero policies**, and **zero privileges** for `anon`, `authenticated`, `service_role` and `PUBLIC`; and **no negative-test residue or helper row**. The staged verification SQL was then run directly — **37 positive assertions, all 7 negative tests and the residue proof passed**. `node --check`, repository lint, explicit ESLint, `git diff --check` and `git diff --cached --check` all exited **0**. The local stack was **stopped only after all verification passed** (10 running containers → **0**), with credentials, URLs and keys suppressed from the shutdown output.

**Step 7F1E — implementation commit.** **`e197f91bbdf3196ef8e0eeee8216d6e7d8e495a7`** (short `e197f91`) · `feat(fixtures): add deterministic local fixture baseline` — one subject line, **no body, no trailer, no amend** · parent `098d0eaf2bcba912c366aee6789813410df86b48` · `2026-08-03 23:07:57 +0800` · **5 files changed, 2,208 insertions(+), 1 deletion(-)**, three files created. Contents exactly `docs/plan/STEP_7F_SYNTHETIC_FIXTURE_BASELINE.md`, `package.json`, `scripts/fixtures/load-local-fixtures.mjs`, `scripts/fixtures/local_fixtures.sql` and `scripts/fixtures/verify-local-fixtures.sql`; every committed blob was verified identical to its worktree file, and no file changed as a result of the commit. **Local only — no remote exists and nothing was pushed.**

**Step 7F1F — acceptance record (this entry).**

- **Decisions appended:** **D-246 through D-252**, sequential after **D-245**; the log remains contiguous (**D-001 … D-252**) and unique (**252 IDs, 0 duplicates, 0 gaps**).
- **Files changed in this Step 7F1F checkpoint (3 in-repository + 1 workspace-level):** `docs/progress/DEMO_TO_MVP_MIGRATION.md`, `docs/progress/STATUS.md`, `docs/progress/BUILD_NOTES.md` (append-only), plus the workspace tracker outside the repository.
- **Tracker synchronization:** synchronized **byte-for-byte** into `docs/progress/DEMO_TO_MVP_MIGRATION.md`; verified by raw byte comparison, SHA-256, byte count and line count.
- **Operational state:** the local Supabase stack was **stopped after independent verification** and **no Supabase container remains**; Docker Desktop may remain running. Fixture passwords remain **operator-controlled, hidden and non-persistent**. The loader supports a **clean load** and an **explicit bounded `--reload`** only.
- **Governance boundaries preserved:** the minimal fixture remains a **deliberate Phase 0 exception** to `CLAUDE.md` §11, whose broader **2-trainer / 2-module / 3–4-student / 2-parent** dataset **plus a second Class Session** remains a **later additive Phase 1 requirement — deferred, not deleted**. **N-4 / U-23 (production Management bootstrap) remains unresolved and is not replaced, defined or discharged by synthetic fixtures.** **P-1 remains the mandatory opening review for Step 7G**, and the **7F → 7G → 7H → 7I → 7J** sequence is unchanged.
- **Step 7G was not started and is not authorized by this record.**
- **This acceptance-record change set is staged but NOT committed at the time of writing.** Per the anti-recursion rule (D-060 … D-066, D-101, D-121, D-145, D-169, D-213, D-230, D-236, D-245), these committed progress files name the **substantive** commit `e197f91bbdf3196ef8e0eeee8216d6e7d8e495a7`, never their own administrative hash.

## 2026-08-04 — Relationship authorization: P-1 audit, migration, adversarial review, runtime proof, verification reconciliation and commits (Steps 7G1A … 7G1H)

**Scope:** Step 7G — the relationship-scoped read-authorization layer — delivered under bounded per-checkpoint orchestrator authorizations and applied to the **local disposable Supabase database only**. **No hosted database was accessed**, the project has never been linked, `.env.local` was never accessed, and **no password or credential was requested, printed, logged or persisted** at any point.

**Step 7G1A — read-only authorization and default-ACL baseline audit (P-1 resolved).** Audited roles, ownership, effective ACLs and `pg_default_acl` with the stack started from the existing volume (no reset, no fixture load). Findings: `session_user`/`current_user` are `postgres`; all **22** tables are `postgres`-owned with `relacl = {postgres=arwdDxtm/postgres}` and **zero** client entries; schema `public` grants USAGE (not CREATE) to the client roles; `service_role` carries **BYPASSRLS** and `postgres` inherits the client roles, so **denial can never be proven as `postgres`**. The **`postgres` public default ACLs are hardened** — created by the Step 7E migration's own `ALTER DEFAULT PRIVILEGES … REVOKE` statements — so new `postgres` objects grant nothing automatically (functions even lose the built-in PUBLIC EXECUTE). **`supabase_admin` retains broad public default ACLs** (ALL to anon/authenticated/service_role on objects it creates); they never applied because every project object is created by `postgres`. **P-1 resolved with one carried constraint:** migrations must run as `postgres`, and any future `supabase_admin` object creation is a privilege event requiring re-audit. Zero-privilege posture and fixture state re-verified; stack stopped without reset.

**Step 7G1B — migration authored and staged.** Created `supabase/migrations/20260803154500_step_7g_relationship_authorization.sql` from a scratchpad-only 13-table policy matrix: a **fail-closed `current_user = 'postgres'` execution guard** (P-1) before any object; **six** helpers — `app_current_account_id`, `app_has_active_membership`, `app_is_own_membership`, `app_is_own_active_membership`, `app_trainer_reaches_session`, `app_trainer_reaches_module` — each STABLE, SECURITY DEFINER (the deliberate RLS-recursion boundary), pinned to an empty search_path with fully qualified references, EXECUTE revoked from PUBLIC/anon/service_role/authenticator and granted to `authenticated` only; **13 SELECT grants** to `authenticated`; **29 permissive SELECT policies** (`<table>_select_<path>` naming, separate management/trainer/parent paths); and **14 end-of-migration assertion groups** re-deriving the whole posture from the catalogue, including proof that both default-ACL sets were not changed. All access derives live from `auth.uid()` → `accounts.auth_user_id` → an ACTIVE membership; no JWT relationship claims; no `auth.users` reads; inactive relationships confer nothing.

**Step 7G1C — adversarial static review; one proven defect corrected.** Independent line-by-line review against the Step 7E DDL, the 7G1A audit and the governance sources. Confirmed: runner-level per-file transaction atomicity (the same contract Step 7E already relied on); an acyclic policy dependency graph (max depth 2, recursion structurally impossible); safe OR-composition (every branch anchored to the caller's own role-pinned identity); and a set-semantic, order-independent A14 default-ACL assertion. **Proven defect:** `app_current_account_id()` was a plain scalar SQL function, which silently returns the FIRST row of a multi-row result — plan-dependent and arbitrary if the `auth_user_id` UNIQUE constraint were ever violated or dropped. **Corrected** to aggregate with `HAVING count(*) = 1`: zero and two-plus matches both return NULL — ambiguous identity is treated as no identity. A runtime test matrix (39 positive cells, denial suite, decoy suite) was prepared in the scratchpad.

**Step 7G1D — applied and runtime-proven.** Applied via the pinned CLI as the **second** migration; all in-file assertions passed. Live `auth.uid()` was inspected first and every proof ran under `SET LOCAL ROLE` with transaction-local JWT claims — **never as `postgres`**. The **management/trainer/parent visibility matrices passed all 39 cells with deterministic IDs** (management 1/3/3/1/1/1/1/3/1/1/1/1/1; trainer sees no parent data and only assignment-reachable rows; parent sees only link/enrolment-reachable rows and no assignments). **Denials:** anon 42501 on all 13; missing/unknown identity 0 rows; all nine out-of-scope tables denied; **`service_role` denied on all 22 despite BYPASSRLS**; authenticator denied; authenticated INSERT/UPDATE/DELETE denied (42501 ×6); helper EXECUTE denied to anon/service_role/authenticator. **Decoys (all transaction-local, all rolled back, zero residue):** deactivated account → total blackout including self; deactivated membership → relationship blackout with own-record reads surviving; unlinked link → child-derived blackout; withdrawn enrolment → enrolment-derived paths dark while assignment- and link-derived paths survive independently; unassigned assignment → trainer relationship blackout; unlinked student, another trainer's session, a genuinely unassigned session and a second centre all invisible to the fixture users; **management lifecycle visibility (5 memberships incl. a pending decoy) never became trainer or parent authority (both still saw exactly 1)**. Fixture unchanged: 3 Auth users, 25 rows, canonical rows 28, SHA-256 `d6a314b40bb5eb1bc3169097e2a9cb03858791498ca5137a43050cee36b87517`, seed 1/3/9. One follow-up surfaced honestly: the Step 7F verification suite still asserted the superseded zero-policy posture (its data assertions A1–A31 passed; the checksum region was proven by a read-only region run). Stack stopped without reset.

**Step 7G1E — migration commit.** **`17d7ddc4e7264ffe0a545d3830813af94b7ac688`** (`17d7ddc`) · `feat(authz): add relationship-scoped read policies` — one subject line, no body, no amend · parent `0cd6dd796f27cb7624409685eb3c299bfe6688be` · `2026-08-04 00:41:33 +0800` · **1 file, 938 insertions(+)** · committed blob verified identical to the worktree. Local only; nothing pushed.

**Step 7G1F — fixture verification suite reconciled and twice runtime-proven.** Full-file inspection found **five** superseded assumptions — the known **A32** (zero policies), **A33** (zero client privileges) and **D5** (zero policies after rollback), plus **A34** (exactly one applied migration) and **A35** (single-version check) found beyond the known list. Reconciled to the accepted Step 7G posture: A32 now pins 22 RLS-enabled/never-forced tables and the exact 29-policy distribution with zero out-of-scope policies; A33 pins the exact 13-table `authenticated` SELECT set, zero write privileges and zero privileges for anon/service_role/authenticator/PUBLIC across all 22 tables; A34 pins exactly two migrations by version; A35 pins the six helpers (STABLE · SECURITY DEFINER · search-path pinned · authenticated-only EXECUTE); new **A38** pins zero views/user triggers; **D5** re-asserts the full posture after the negative-suite rollback. **A1–A31, all seven negative tests, the canonical serialization and the rollback structure are byte-unchanged** (diff-proven: zero fixture-UUID, zero negative-test and zero canonical-region lines touched). Checks are scoped to the 22 project tables and 6 project helpers. The staged suite then ran **twice** against the live posture: exit 0 both times, all sections passing, canonical rows 28, checksum `d6a314b4…` identical across runs; fixture/posture unchanged afterwards. Stack stopped without reset. (A transient malformed `INTO` list produced while drafting A32 was caught and fixed before any validation ran.)

**Step 7G1G — reconciliation commit.** **`97f3fb2ed05f7fc3ddcec5e3f5e13b15da668b1f`** (`97f3fb2`) · `test(fixtures): reconcile verification with relationship policies` — one subject line, no body, no amend · parent `17d7ddc…` · `2026-08-04 01:06:59 +0800` · **1 file, 203 insertions(+), 31 deletions(-)** · committed blob verified identical. Local only; nothing pushed; clean tree after each commit.

**Step 7G1H — acceptance record (this entry).**

- **Decisions appended:** **D-253 through D-260**, sequential after **D-252**; the log remains contiguous (**D-001 … D-260**) and unique (**260 IDs, 0 duplicates, 0 gaps**).
- **Files changed in this checkpoint (3 in-repository + 1 workspace-level):** `docs/progress/DEMO_TO_MVP_MIGRATION.md`, `docs/progress/STATUS.md`, `docs/progress/BUILD_NOTES.md` (append-only), plus the workspace tracker outside the repository.
- **Tracker synchronization:** synchronized **byte-for-byte** into `docs/progress/DEMO_TO_MVP_MIGRATION.md`; verified by raw byte comparison, SHA-256, byte count and line count.
- **Boundaries preserved:** **N-4 (production Management bootstrap) remains unresolved** and is not replaced by synthetic fixtures; assessment writes, report lifecycle, audit chain, RPCs, server actions and publication remain outside Step 7G; **no write policy exists**; service-role use remains a trusted server-only boundary; **audit-chain items A-1 … A-6 remain unratified** and must be explicitly reconciled and ratified before any audit-chain SQL is authored.
- **Step 7H was not started and is not authorized by this record.**
- **This acceptance-record change set is staged but NOT committed at the time of writing.** Per the anti-recursion rule (D-060 … D-066, D-101, D-121, D-145, D-169, D-213, D-230, D-236, D-245), these committed progress files name the **substantive** commits `17d7ddc4e7264ffe0a545d3830813af94b7ac688` and `97f3fb2ed05f7fc3ddcec5e3f5e13b15da668b1f`, never their own administrative hash.
