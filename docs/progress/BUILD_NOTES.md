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

**Extended 2026-08-08 (operating-policy reconciliation, `CLAUDE.md` §15.4).** The fields above are unchanged and still required. Add, where applicable:

- **Track / workstream**, and **branch / worktree**
- **Starting HEAD → ending HEAD**
- **Migration or schema changes** (or an explicit "none")
- **Reviewer findings** — adversarial/independent review results, their severity, and how each was remediated
- **Operator decisions received** during the entry's window
- **Blockers opened or closed**, by ID
- **Environment / infrastructure changes** (local services, hosted state)
- **Cleanup / rollback state** — whether any partial mutation occurred
- **Multi-agent synthesis**, where used: which workstreams ran, significant findings, contradictions, accepted resolutions, unresolved matters. **Never paste a subagent transcript.**

**Never record** an API key, password, service-role key, authorization header, connection string, other secret, real participant data, or raw private AI content with no evidentiary purpose. Follow the established **redaction-by-construction** discipline — verdicts, counts, routes and public checksums only, generated prose represented by its hash — rather than filtering credential-bearing output after the fact (`CLAUDE.md` §11).

**This log is the canonical HISTORICAL PROGRESS LOG** (`CLAUDE.md` §15.1). It is append-only and is never rewritten, even when a later ruling supersedes an entry. `STATUS.md` is the canonical CURRENT STATUS snapshot; chronology belongs here, not there.

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

## 2026-08-04 — Audit-chain design: reconciliation, adversarial review, ratification commit and progress record (Steps 7H1A, 7H1A2, 7H1A3, 7H1A4)

**Scope:** the Step 7H audit-chain **design phase only**, delivered under bounded per-checkpoint orchestrator authorizations as **documentation work**. **No audit-chain SQL, migration, table, function, trigger, policy or grant was authored**; Supabase remained **stopped** throughout; no database, Docker, psql or hosted command ran; `.env.local` was never accessed; no password or credential was requested, printed, logged or persisted.

**Step 7H1A — design-only reconciliation.** Authored `docs/plan/STEP_7H_AUDIT_CHAIN_BASELINE.md`, reconciling and ratifying the six open audit-chain items against Specification v3 §23, Amendment 003 A-029 and the delivered Step 7E/7F/7G state: **A-1** per-centre chain scope and threat model (protects governed business history below database-superuser level; no client audit-read in the MVP; fixture and authentication activity excluded; report-lifecycle events assigned to Step 7I; external mirror/anchoring deferred to Phase 4) · **A-2** SHA-256 via PostgreSQL core `sha256(bytea)` computed in-database, with governed mutation and audit append in the same transaction and no caller-supplied hashes · **A-3** `centre_id` partition, dense authoritative `seq_no`, seed-or-skip genesis head (`last_seq = 0`, domain-separated centre-specific genesis hash) locked `FOR UPDATE` · **A-4** the versioned `BESTCOACH-AUDIT-V1` fixed-field length-prefixed envelope with a recursive deterministic JSON serializer (UTF-8 byte-ordered object keys, exhaustive escaping, six-fractional-digit UTC timestamps, and a `payload_canonical` parse-back guarantee) · **A-5** the governed `audit_append_event` protocol (VOLATILE · SECURITY DEFINER · postgres-owned · pinned search path · no dynamic SQL · no client EXECUTE · validated actor authority · atomic head-locked append · per-RPC duplicate gates with no global idempotency claim) · **A-6** complete/partial `audit_verify_chain` semantics (recorded predecessor anchors; stored-head agreement only when the range reaches the tip; read-only; no repair; an integrity failure is an incident). Minimum proposed objects: tables `audit_events`/`audit_event_targets`/`audit_chain_heads`, functions `audit_canonical_json`/`audit_append_event`/`audit_verify_chain`, and guard triggers (events UPDATE/DELETE denial · targets UPDATE/DELETE denial · heads **DELETE denial only**, because the append function legitimately INSERTs and UPDATEs the head — no spoofable session-variable bypass).

**Step 7H1A2 — adversarial design review; defects corrected before ratification.** The review attacked the draft rather than confirming it, and every correction was proven rather than assumed: the advisory-lock claim was **factually wrong** (only the session variant is connection-scoped; `pg_advisory_xact_lock` is transaction-scoped) — the head-row `FOR UPDATE` choice was re-ratified on accurate grounds as a rejection of unnecessary indirection, not impossibility; the **genesis race** was under-specified — replaced with an exact seed-or-skip + row-lock protocol including a two-concurrent-writer READ COMMITTED interleaving proof that exactly one sequence-1 event can exist; the head guard trigger was reconciled to **DELETE-only** denial; idempotency was rewritten from a false global claim into **per-event-group RPC-level duplicate gates** recorded in an obligations table; actor authority was fully specified (authenticated path validated against `auth.uid()` and live membership — validated, never trusted; system path jointly-NULL and registry-flagged); serializer feasibility was proven core-only, including the **jsonb length-then-bytes key-order trap** requiring explicit `convert_to(key, 'UTF8')` ordering; partial-verification semantics were fixed to record predecessor anchors and never claim full-chain integrity; and the object shapes were made internally consistent. A literal NUL byte that had slipped into the serializer section was located by byte-scan and replaced with its escaped text form; the final file scans at **0 control bytes**.

**Step 7H1A3 — design commit.** **`3e479b69b1a4cd3592daf3edc321e92929002dbb`** (`3e479b6`) · `docs(audit): ratify audit-chain design baseline` — one subject line, no body, no amend · parent `6ba61596b524df77ca5366c19b4521f3041f0072` · `2026-08-04 20:48:37 +0800` · **1 file, 378 insertions(+)** — `docs/plan/STEP_7H_AUDIT_CHAIN_BASELINE.md` (SHA-256 `da5b0aea3c7a0640847944d9e5ce6371ac5b07fc5470af0c091ca37251362755`, 378 lines, 52,012 bytes, LF-only, no BOM, no control bytes). Sixteen content markers were verified in the staged bytes before the commit; the committed blob was verified identical to the worktree. Local only; nothing pushed; resulting commit count **25**; clean tree after the commit.

**Step 7H1A4 — progress-ratification record (this entry).**

- **Decisions appended:** **D-261 through D-272**, sequential after **D-260**; the log remains contiguous (**D-001 … D-272**) and unique (**272 IDs, 0 duplicates, 0 gaps**).
- **Files changed in this checkpoint (3 in-repository + 1 workspace-level):** `docs/progress/DEMO_TO_MVP_MIGRATION.md`, `docs/progress/STATUS.md`, `docs/progress/BUILD_NOTES.md` (append-only), plus the workspace tracker outside the repository.
- **Tracker synchronization:** synchronized **byte-for-byte** into `docs/progress/DEMO_TO_MVP_MIGRATION.md`; verified by raw byte comparison, SHA-256, byte count and line count.
- **Boundaries preserved:** **A-1 … A-6 are fully ratified at design level — ratification authorizes design only**; **no audit-chain SQL exists**; **N-4 (production management bootstrap) remains unresolved** and synthetic fixtures do not replace it; the report status vocabulary binds in Step 7I under the existing accepted decision (A-028); automatic integrity-failure response, audit retention/PDPA, verification cadence and external-anchor mechanics remain Phase 4; **Step 7I was not started**.
- **Next permitted action after acceptance:** the next bounded checkpoint may **author and stage one Step 7H audit-chain migration for static review** and **must stop before local application or commit**; it still requires its own separate, explicit orchestrator authorization.
- **This progress-ratification change set is staged but NOT committed at the time of writing.** Per the anti-recursion rule (D-060 … D-066, D-101, D-121, D-145, D-169, D-213, D-230, D-236, D-245), these committed progress files name the **substantive** design commit `3e479b69b1a4cd3592daf3edc321e92929002dbb`, never their own administrative hash.

## 2026-08-05 — Audit-chain migration application, dual Codex proof, migration commit and Claude handoff (Steps 7H1D, 7H1E, 7H1F)

**Scope and temporary tool transition.** Step 7H1D primary local proof executed using Codex in the same workspace because the Claude Code usage limit was temporarily reached. Step 7H1E independent verification executed in a separate fresh Codex chat and did not use the primary report as evidence. The filesystem, Git repository, preserved local database volume and committed documents remained the sources of truth. **No project scope or governance rule changed because of the tool transition.** No hosted Supabase access occurred, `.env.local` was not inspected, no dependency changed, and Step 7I was not begun.

**Step 7H migration application.** Applied `supabase/migrations/20260804213000_step_7h_audit_chain.sql` (version `20260804213000`; SHA-256 `6d2f11a3ad66d2666b5442b759646852679a9a4ebabe3b76fb25db2d2aa62c3b`; 1,550 lines; 76,073 bytes) locally with pinned Supabase CLI `2.109.1`: exit `0`, duration `1,471 ms`, authored assertions **B1–B20 passed**. The preserved database migration history became exactly `20260803034500`, `20260803154500`, `20260804213000`.

**Delivered object inventory and access posture.** Three postgres-owned RLS tables — `public.audit_events`, `public.audit_event_targets`, `public.audit_chain_heads`; four postgres-owned functions — `public.audit_canonical_json`, `public.audit_append_event`, `public.audit_verify_chain`, `public.audit_block_mutation`; three enabled guards denying audit-event UPDATE/DELETE, audit-event-target UPDATE/DELETE and audit-chain-head DELETE; three supporting indexes — `audit_events_actor_account_idx`, `audit_events_actor_membership_idx`, `audit_event_targets_centre_idx`. All **25** project tables have RLS, none FORCE RLS; audit policies are zero; Step 7G remains **29 policies and six helpers**; authenticated SELECT remains exactly **13 approved tables**; client roles and PUBLIC have no audit-table privilege and no Step 7H function EXECUTE; default ACLs are unchanged; no Step 7H schema, view, materialized view, enum or extension was added.

**Step 7H1D — primary Codex runtime proof: PASS.** Passed the canonical serializer; privilege and role denials; actor authority; sequential append; concurrent genesis; aborted first writer; rollback atomicity; append-only guards; complete and partial verification; tamper detection; cross-centre isolation; fixture and Step 7G preservation; and repeatability. The non-concurrency battery produced **41 result rows**; its repeated semantic output had SHA-256 `fa0155c657679955cecb89090e1a390f0b9b821a5c0de59664c4e226f9a2c2e5`.

**Step 7H1E — independent fresh-chat Codex verification: PASS.** Independently reread the governing sources; ran live B1–B20; constructed and byte-verified the full 17-line `BESTCOACH-AUDIT-V1` envelope; independently reproduced serializer/hash, role, actor, sequential, concurrency, rollback, append-only, verifier, tamper and cross-centre isolation proofs; and found **no discrepancy in the ratified design, migration or primary proof**. One external concurrency-monitor harness issue was corrected and its committed decoy was independently cleaned; this was not a repository or implementation defect. Zero residue was proven afterward. The independent non-concurrency battery, tamper matrix and externally reconciled verifier each repeated with identical semantic results.

**Preserved final database and process state.** Auth users `3`; application-domain rows `25`; canonical rows `28`; fixture checksum `d6a314b40bb5eb1bc3169097e2a9cb03858791498ca5137a43050cee36b87517`; audit events `0`; audit event targets `0`; audit chain heads `0`; committed zero heads `0`; decoy residue `0`; disabled user triggers `0`. The local Supabase stack was stopped with database, edge-runtime and storage volumes preserved. No test, Supabase CLI, psql or fixture-loader process remained.

**Fixture-verifier compatibility limitation — deliberately not edited in this checkpoint.** `scripts/fixtures/verify-local-fixtures.sql` remains unchanged at SHA-256 `d568793335fbaeff568f70905082d4e3b756e4252a453936b6a6d25eb062b52b`. Its domain, checksum and authorization semantics, canonical checksum logic and all seven negative tests remain valid. Exactly these Step 7G-era census assumptions require reconciliation:

- **A32:** project-table count `22 → 25`; policies remain `29`; FORCE RLS remains `0`.
- **A33:** project-table privilege sweep `22 → 25`; authenticated non-SELECT tables `9 → 12`; the approved authenticated SELECT set remains `13`.
- **A34:** migration count `2 → 3`; add `20260804213000`.
- **A35:** public project-function count `6 → 10`; preserve the exact six Step 7G helper checks; add four Step 7H function ownership, volatility, SECURITY DEFINER/invoker, search-path and EXECUTE checks.
- **A38:** replace the combined zero-view/zero-trigger assumption with independent checks for zero views and exactly three enabled audit guard triggers.
- **D5:** function count `6 → 10`; table sweep `22 → 25`; enabled guard triggers `0 → 3`; policies remain `29`; authenticated SELECT remains `13`.

No non-census fixture assertion is stale. The reconciled verifier passed twice externally during **both** Codex proof checkpoints, but the committed verifier has not yet been edited. **This reconciliation is the next required checkpoint; Step 7H is not fully complete until the reconciliation, runtime proof and verifier commit are accepted.**

**Step 7H1F — migration commit and handoff record.** Created substantive commit **`ef2252119babee1714b335ac43b6bf4bbd4ee582`** (`ef22521`) · `feat(audit): add tamper-evident audit chain` · parent `88f0fe2d941ddece5babb2dfa8efef4079cdc783` · exactly one file · 1,550 insertions · local only · no remote and nothing pushed. Decisions **D-273 through D-278** were appended contiguously and uniquely. The only handoff-record files are `docs/progress/STATUS.md`, `docs/progress/BUILD_NOTES.md`, `docs/progress/DEMO_TO_MVP_MIGRATION.md` and the byte-identical workspace tracker outside the repository.

**Handoff status.** Step 7H1D primary runtime proof: **passed**. Step 7H1E independent verification: **passed**. Step 7H migration: **applied, independently verified and committed**. Fixture-verifier reconciliation: **pending**. Step 7H final acceptance: **pending**. Step 7I: **unstarted**. The next bounded checkpoint is to reconcile only **A32, A33, A34, A35, A38 and D5** in `scripts/fixtures/verify-local-fixtures.sql`, then run the complete fixture verifier twice against the preserved Step 7H database state. Execution may resume under Claude Code from that checkpoint.

## 2026-08-05 — Autonomous Step 7H completion: fixture-verifier reconciliation, dual repeatability proof, commit and final acceptance

**Scope.** Resumed under Claude Code from the committed Codex handoff at `643d973ac9162be2f7aebb8ba9b825e7a9626165`, under an autonomous overnight-completion authorization bounded strictly to finishing Step 7H (reconcile the fixture verifier, prove it, commit it, record final acceptance, then perform a read-only Step 7I readiness assessment — no Step 7I SQL, RPC, server action, UI or generated type). No hosted Supabase access occurred; `.env.local` was not accessed; no dependency changed; the pinned project-local Supabase CLI `2.109.1` was used throughout via `node node_modules/supabase/dist/supabase.js`.

**Baseline verification.** Every expected value matched exactly before any edit: HEAD `643d973ac9162be2f7aebb8ba9b825e7a9626165`, commit count `28`, clean tree; migration SHA-256 `6d2f11a3ad66d2666b5442b759646852679a9a4ebabe3b76fb25db2d2aa62c3b` (1,550 lines, 76,073 bytes) committed at `ef22521`; workspace tracker and repository copy byte-identical at SHA-256 `39208e54a88434e82d1495f7ed6652107a3ff3f52122dea323dfdb8a235d7826` (338,656 bytes, 2,952 lines, CRLF, no BOM, D-001…D-278 contiguous and unique); `STATUS.md` SHA-256 `2da1f507bc285f4a0063462418fc856eea0bf0cbe774af7e310704467c36cb82`; `BUILD_NOTES.md` SHA-256 `de20fa9147488f1939f97d81e018f3b8d6def14c6e81bb34265906795bfedd07`; current (unreconciled) verifier SHA-256 `d568793335fbaeff568f70905082d4e3b756e4252a453936b6a6d25eb062b52b`. Process-level inspection found no fixture-loader, verifier, psql or Supabase CLI process; zero Supabase containers running (Docker Desktop present with the three preserved volumes: `supabase_db_best-coach-mvp`, `supabase_edge_runtime_best-coach-mvp`, `supabase_storage_best-coach-mvp`).

**Fixture-verifier reconciliation (Phase 1).** Edited `scripts/fixtures/verify-local-fixtures.sql`, changing **only** the six labelled assertion areas:
- **A32** — RLS/policy census extended `22 → 25` project tables; the zero-policy out-of-scope list extended from 9 to 12 tables (adding `audit_events`, `audit_event_targets`, `audit_chain_heads`); policies (`29`) and FORCE RLS (`0`) unchanged.
- **A33** — the "authenticated must not SELECT" list extended `9 → 12`; the write-side and the anon/service_role/authenticator/PUBLIC zero-privilege sweeps extended `22 → 25` tables; the approved 13-table authenticated SELECT set unchanged.
- **A34** — applied-migration count `2 → 3`; version whitelist gained `20260804213000`.
- **A35** — public function census `6 → 10`; the six Step 7G helper checks preserved byte-for-byte; four new per-function contract checks added for `audit_canonical_json` (IMMUTABLE, STRICT, PARALLEL SAFE, SECURITY INVOKER), `audit_append_event` (VOLATILE, SECURITY DEFINER, not STRICT), `audit_verify_chain` (STABLE, SECURITY DEFINER, not STRICT) and `audit_block_mutation` (VOLATILE, SECURITY INVOKER, not STRICT) — each resolved via the identical `regprocedure` signature strings the migration's own `REVOKE ALL ON FUNCTION` statements use, each requiring postgres ownership, a pinned search path, and zero EXECUTE for every client role including PUBLIC (via `proacl` text inspection, matching the table-ACL technique already used for PUBLIC/`authenticator`).
- **A38** — the obsolete combined zero-view/zero-trigger check replaced with three independent checks: zero views, zero materialized views, and an exact inventory of the three enabled Step 7H guard triggers (name, owning table, `tgtype` 26/26/10, enabled state `'O'`, bound to `audit_block_mutation`) via `NOT EXISTS` against a `VALUES` list of expected rows.
- **D5** — function count `6 → 10`; the anon/service_role/authenticator/PUBLIC zero-privilege sweep extended to 25 tables; a new check added that all three guard triggers remain enabled (`tgenabled = 'O'`) after the negative-test rollback.

A1–A31, A36, A37, all seven negative tests (N1–N7, including every expected constraint name and every scratch UUID), the entire canonical-checksum region (Section B), and the D1–D4 rollback-residue checks were left **byte-identical** — no hunk touches them. A `v_oid oid` variable was added to the shared `DECLARE` block to support the new A35 identity lookups; a mechanical tokenizer (dollar-quote/string/comment-aware) confirmed the file remained syntactically balanced (32 top-level statements, zero unclosed dollar-quotes) both before and after every edit.

**Containment and static proof (Phase 2).** Two read-only adversarial subagents ran in parallel. The **containment/regression reviewer** classified every hunk in the full diff by label, confirmed zero touched lines in every excluded region, confirmed every changed comparison remained an exact-equality guard (no weakening), and confirmed all pre-existing `FAIL A1`…`FAIL A38`/`FAIL N1`…`FAIL N7`/`FAIL D1`…`FAIL D5` labels survived — concluding **no containment violation found**. The **catalogue/ACL/trigger reviewer** cross-checked every new assertion against the committed migration's actual `CREATE TABLE`/`CREATE FUNCTION`/`CREATE TRIGGER`/`REVOKE` statements and its own B1–B20 self-check — confirming the four `regprocedure` strings are byte-identical to the migration's own `REVOKE` signatures, the volatility/strictness/parallel/SECDEF flags match the migration's declarations exactly, the trigger `tgtype` values match the migration's own B15 assertion, and the 25 = 22+3 / 10 = 6+4 counts are correct — concluding **no defect found**. The parent's own hunk-boundary analysis (comparing every `@@` range against the six labels) reached the identical conclusion independently. Repository lint, the tokenizer, and `git diff --check` all passed (exit 0).

**Live verifier proof — pre-commit (Phase 3).** Started the preserved local stack (`supabase start`, "Starting database from backup..." confirming no reset). A read-only preflight independently proved every precondition using the untouched Section-B canonical-region logic plus separate read-only queries: migrations exactly `20260803034500,20260803154500,20260804213000`; Auth `3`; domain rows `25`; audit events/targets/heads `0/0/0`; zero committed-zero heads; policies `29`; helpers `6`; authenticated SELECT `13`; zero disabled guards; zero decoy residue; canonical checksum `d6a314b40bb5eb1bc3169097e2a9cb03858791498ca5137a43050cee36b87517` over 28 rows (computed with Node's `crypto`, matching the loader's own `canonicalChecksum` algorithm exactly). The edited verifier then ran through the documented `docker exec -i supabase_db_best-coach-mvp psql --no-psqlrc --username=postgres --dbname=postgres --set=ON_ERROR_STOP=1 --set=VERBOSITY=verbose --quiet` contract **twice**, with no substitution, no reduction, no skipped assertion and no edit between runs: both exit `0`; both emit `SECTION A: all positive assertions passed`, `SECTION C: all 7 negative tests were correctly rejected`, `SECTION D: rollback left no residue; fixture, Option B, seed and audit-guard boundaries all intact`; both reproduce the canonical checksum unchanged; both are byte-identical in full stdout (SHA-256 `3073041500c43e6ad824bf8b0baee777f8d0e352c74cb1814bee8ccd9c6b919d`) and full stderr (SHA-256 `92ffdadea78736e8dee50f7c36f49142f87589ec1084fd516c7e8ad017a4ec15`). An independent post-run read-only re-check reproduced every precondition value, including the checksum, unchanged. Supabase was stopped (containers removed, all three volumes preserved) and zero lingering `psql`/`supabase` process was confirmed.

**Commit (Phase 4).** Staged only `scripts/fixtures/verify-local-fixtures.sql` (path-scoped `git add`); confirmed exactly one staged file, zero unstaged, zero untracked, `git diff --cached --check` exit 0, HEAD still `643d973`, count still `28`. Committed as **`617ca4b29471625c1bc13c91ae66605e9eca72dc`** (`617ca4b`) · `test(fixtures): reconcile verifier with audit chain` — one subject line, no body, no amend · parent `643d973ac9162be2f7aebb8ba9b825e7a9626165` · `206 insertions(+), 42 deletions(-)` · resulting commit count **29**. Final verifier: SHA-256 `049cc7d402904e7fb5ccae8f70431589f787d3827acdd1c3b7973ff7bcb5b3d4`, 1,010 lines, 56,099 bytes — identical to the bytes both pre-commit runs tested. Local only; nothing pushed; clean tree after the commit.

**Live verifier proof — post-commit (Phase 5).** Restarted Supabase from the preserved volume (again "Starting database from backup..."; no reset, no reapplied migration). Confirmed the committed `HEAD:scripts/fixtures/verify-local-fixtures.sql` blob byte-identical to the worktree file (both SHA-256 `049cc7d4…`). Ran the complete committed verifier through the identical documented contract **twice** more, with no substitution, reduction or edit: both exit `0`; both emit the identical three section notices; both byte-identical to each other **and** to both pre-commit runs (same stdout/stderr SHA-256 values recorded above) — **four independent runs total, zero divergence**. A final independent read-only state check reproduced every required post-commit value unchanged (migrations, Auth, domain, canonical, checksum, policies, helpers, authenticated-SELECT set, audit counts, zero heads, zero residue, zero disabled guards). Supabase was stopped a second time (volumes preserved, zero lingering process confirmed); the committed verifier was not edited after this proof.

**Deviation noted.** `supabase start`'s own stdout JSON block (local-dev default `ANON_KEY`/`SERVICE_ROLE_KEY`/`JWT_SECRET`/`SECRET_KEY` — the fixed, publicly documented Supabase OSS local-development defaults, identical across every local Supabase installation, bound only to `127.0.0.1` and never reused against any hosted project) was allowed to print to the session transcript on the first `start` invocation before this was caught; the second `start` and all subsequent commands suppressed it. **No `.env.local` value, hosted credential, database password or non-default secret was ever accessed, computed, or printed** — this was local-dev boilerplate reaching the transcript, not a credential exposure, but the omission is recorded honestly rather than silently corrected.

**Step 7H final acceptance.** The complete Step 7H sequence — design ratification (`3e479b6`), adversarial design review, migration authoring and static review, Codex primary/independent runtime proof (7H1D/7H1E), migration commit (`ef22521`), the Codex-to-Claude handoff (`643d973`), and this session's reconciliation/proof/commit (`617ca4b`) — is **complete and fully accepted**. Decisions **D-279 through D-284** record the reconciliation, the repeatability proof, the commit, final fixture/authorization preservation, full acceptance, and the Step 7I-unstarted boundary; the log remains contiguous (**D-001 … D-284**) and unique (284 IDs, 0 duplicates, 0 gaps). **The audit infrastructure remains empty (0 events / 0 targets / 0 heads) until a future governed RPC calls `audit_append_event`** — nothing in this checkpoint appended an audit event. Production management bootstrap (N-4) remains unresolved but does not reopen or block Step 7H. Phase 4 items (external mirror, alerting, retention, verification cadence) remain deferred, unchanged from the ratified design. Per the anti-recursion rule, these committed progress files name the substantive verifier-reconciliation commit `617ca4b29471625c1bc13c91ae66605e9eca72dc`, never their own administrative hash.

**Step 7I read-only readiness assessment (no file created, no SQL authored, no Supabase started).** Read `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_003.md` (A-028 report/audit compatibility), `docs/plan/STEP_7H_AUDIT_CHAIN_BASELINE.md` §8 (event → checkpoint matrix) and §9 (acceptance tests), `CLAUDE.md` (ADR-8, §101/§205/§244 transition/audit-in-one-transaction rules), and the accepted Step 7E/7G/7H migrations. Findings:
1. **7H/7I boundary:** Step 7H delivers reusable append/verify infrastructure only; Step 7I owns every report-lifecycle table read/write and calls `audit_append_event` from within its own postgres-owned `SECURITY DEFINER` RPCs, reaching the append function by ownership (no grant needed or possible).
2. **Report-lifecycle objects assigned to 7I:** `reports`, `report_versions`, `report_version_ratings`, `report_version_checklist_progress`, `report_version_approvals` — all already schema-delivered by Step 7E, currently policy-free and grant-free (zero client access, by design, until Step 7I ships the read RPC).
3. **A-028 status vocabulary (already ratified, binds at 7I):** exactly seven values — `incomplete`, `observation_saved`, `drafting`, `draft_ready`, `needs_edit`, `approved`, `submitted`; approval (not submission) freezes the version and its canonical children.
4. **Audit events required:** `report.created`, `report_version.created`, `report.state_changed` (one per §13 transition, carrying `state_from`/`state_to`, and — on the approval transition — the approved version id, its `content_hash`, and checklist-gate proof) — all three already reserved in the ratified registry (design §1.4 E1–E3) and present in both `audit_append_event` and `audit_verify_chain`'s registry arrays.
5. **Two-event Approve & Submit:** design §1.4 E3 and CLAUDE.md both require "Approve & Submit" to emit two `report.state_changed` events (approval, then submission) inside one server-action transaction — not yet implemented; a 7I design decision.
6. **CAS/idempotency:** design §5.3 assigns report-lifecycle duplicate gating to each governed RPC (natural CAS on current state + `lock_version` bump per CLAUDE.md §205) — the audit layer itself carries no idempotency key by design; 7I must define its own gate before any append.
7. **Authorization boundaries:** trainer edits within the governed workflow; management and parent are read-only on the canonical submitted report (Step 7G's helpers already resolve caller identity; 7I RPCs must reuse them, never re-derive authorization ad hoc).
8. **Immutable submitted snapshots:** approval freezes the exact version and its canonical children (checklist progress, approval evidence) — later edits clone into a new mutable version; a submitted version never reopens; the previous submitted version stays canonical during correction.
9. **Reapproval:** any trainer edit after approval resets the quality checklist and requires review and approval again — not yet implemented.
10. **AI publication prohibition:** AI never publishes directly (A-014/A-021) — every report-lifecycle write is a reviewed, constrained `SECURITY DEFINER` RPC or server action, never a raw client write.
11. **Dependencies already satisfied:** Step 7E's report tables, Step 7G's authorization helpers, and Step 7H's `audit_append_event`/registry are all delivered and require no further schema change to begin 7I design.
12. **Genuinely blocking open decisions:** none identified that block *design* — the report-lifecycle table shape, the status vocabulary, and the audit contract are all already ratified. The two-event Approve & Submit protocol and each RPC's exact CAS/idempotency gate are 7I *design* work, not pre-existing blockers.
13. **Explicitly deferred to later phases:** N-4 (production management bootstrap; a separate future checkpoint), automatic integrity-failure response and the external audit mirror/alerting/retention/cadence (all Phase 4).
14. **Recommended next bounded checkpoint:** a Step 7I design-reconciliation checkpoint — ratifying the exact report-lifecycle RPC/server-action inventory, the two-event Approve & Submit protocol, and each RPC's CAS/idempotency gate — authored as a design document only, with **no SQL, migration, RPC, server action, UI or generated type**, mirroring the Step 7H1A precedent.

No open design decision was silently resolved; every item above is either already ratified (cited to its source) or flagged as design work still to be done at the 7I checkpoint itself.

## 2026-08-05 — Step 7I1G: Step 7I report-lifecycle design final verification, ratification and commit

- **Checkpoint:** Step 7I1G — independent final verification of the staged Step 7I1F-R3 revision, progress ratification, and the design commit. Closes **Step 7I1**.
- **Scope:** Documentation and governance only. **No SQL, migration, RPC, server action, fixture, generated database type, application code or UI component was authored, staged or applied, and no Supabase, Docker, psql, fixture-loader, verifier or application runtime was started at any point.**

**Baseline verified before any edit.** Working directory resolved explicitly to the MVP repository and confirmed with `git rev-parse --show-toplevel` → `C:/Users/enyul/Vibe Studio/B.E.S.T-Coach-Workspace/SDS Project Final (BEST Coach)`. Branch `main`; HEAD `42d3c0292d7bc9e6442c4d4fc2398e5ee25de1a6`; commit count `30`; no tag, no remote, no upstream (`git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}'` → `fatal: no upstream configured for branch 'main'`). `git status --porcelain` showed exactly five staged entries and **zero unstaged, zero untracked**: `M CLAUDE.md`, `M docs/plan/BEST_Coach_Implementation_Plan.md`, `M docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md`, `A docs/plan/STEP_7I_REPORT_LIFECYCLE_BASELINE.md`, `A docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_004.md`. For each of the five, the **staged blob** (`git cat-file blob :<path>`) and the **worktree file** were hashed independently and were **byte-identical**, and every hash matched the expected value exactly: `CLAUDE.md` `f57c6e1b563319a69e3a71b1cfa5c8ba2bb3f31420daedff6ff9825875df5421`; Implementation Plan `1c5165c448f8f6438ea0f0a49649ae26c8666c07fe564919fbafb951713475c3`; Step 7I baseline `796bcdf71b2fa002f1b4b8acdf03f04c7520f395913a416b26236b74c30e7226`; Amendment 004 `dd631d80b9695bba9d3ca6ec0bdfdd332b646a9039597ee11ff5500dff6d4a95`; Figma matrix `ec8d5893820e95bed3c89b11675baa6129bd07e1bf08c7b71b16e38052280af4`. **Nothing was reset, restored, unstaged, stashed or discarded.**

**Independent read-only design verification — every check passed.**

- **T7I-69's path is exactly `T11 → T12 → RPC-7 → T8 → T9 → T11`**, with T6 deliberately absent, and every step is legal against the §3.2 matrix: T11 (`trainer_approved → approved → submitted`, atomic) → T12 (`submitted → needs_edit`, the only exit from `submitted`) → RPC-7 (not a transition; legal at `needs_edit`, Gate A passes because the clone holds no approval row, Gate B passes because the clone is trainer-authored) → T8 (`needs_edit → trainer_approved`, reachable because R-7a's prior-approval gate is satisfied only by the T12 clone) → T9 (`trainer_approved → trainer_approved`, management wording edit, lineage resolves to the clone) → T11 again (CAS on the current candidate, lineage root the clone, rating parity holds because T9 copies the nine snapshots verbatim). Inserting T6 would commit `needs_edit → draft_ready` and supersede the clone, destroying both T8's origin status and its target version — the CD-1 defect, now removed.
- **T7I-75 directly proves R-7a.** Its setup drives the report through **T7 → T10**, leaving the aggregate legally at `needs_edit` while `current_cycle_version_id` still names the frozen, already-trainer-approved version. Every other §6.1 gate passes in that state (domain check, three-way CAS, all-true frozen checklist, nine snapshots, matching content hash), so the prior-approval gate is the sole barrier; the test asserts the named authored error is distinct from five other named errors, asserts nil residue (no second approval row, status/`lock_version`/both pointers unchanged, chain +0, correction request still `open`), asserts the failure precedes any INSERT (a transition guard, not a primary-key violation), and proves the gate does not trap the trainer.
- **Tests are exactly T7I-1 … T7I-75, contiguous** — programmatically extracted from the §14 table: 75 distinct IDs, each appearing exactly once, minimum 1, maximum 75, no gap and no duplicate.
- **`R(C)` contains exactly four tests** — T7I-15, T7I-16, T7I-46 and T7I-61 — confirmed by extracting the Kind column of every one of the 75 rows. **T7I-69's kind is `R(D)`** and it carries no concurrent leg; the T11-versus-T12 race is T7I-61(d).
- **Supersession agreement across Amendment 004, `CLAUDE.md` and the Implementation Plan** was checked clause by clause: A-019 item 14; A-021's Management "View only" role row; **four** management-scoped A-021 bullets, enumerated identically in all three documents; A-028's seven-status set and its management-edit sentence for management only; A-031's ceiling additively and for Step 7I only; and **v3 §13** as the sole source of the superseded transition model. **A-028's `submitted → needs_edit` exit rule is preserved and implemented as T12** in all three.
- **v3 §14.1 is not superseded.** Amendment 004's supersession table names it **nowhere** and twice records the citation corrections that removed the earlier wrong references (A-034 and A-038 rows); `CLAUDE.md` §1 states the same explicitly. v3 §14.1 was read directly and contains only the three deferred-roadmap visibility positions, whose mandatory-trainer-approval rule for the Child Progress Digest is restated intact in `CLAUDE.md` §8.
- **Figma matrix inventory is consistent:** §0.1 lists **eight** blocked design families (six management-review screens plus two notification surfaces); §1's screen inventory carries the **same eight** rows at `Blocked — new design required`; §5.2 carries **nine** porting rows, the ninth being "Trainer reapproval after correction", which shares family 5's correction-tracking design surface rather than adding a ninth family. Counted mechanically per section: §1 → 8, §5.2 → 9 (excluding the one prose sentence that states the count).
- **Census coherence re-derived rather than restated:** 8 statuses; 14 legal transition pairs (the §3.2 list enumerates 14, and Amendment 004's 13-row table contributes 14 pairs because Approve & Submit contributes two); 15 RPCs = 14 client-callable + 1 internal; 18 new functions = 15 + 1 helper + 2 serializers; 14 authenticated EXECUTE grants; 4 zero-client-EXECUTE functions; 14 + 4 = 18; 15 audit-emitting call sites (1+1+1+2+1+2+0+1+1+1+2+2); T7I-6's 8×6 + 3×5 = 63 illegal-transition cases; post-migration 12 enums, 26 tables, 28 functions, 5 applied migrations; verifier labels A32 25→26, A34 3→5, A35 10→28, D5 10→28 functions and 25→26 tables.
- **No previously identified ratification blocker remains.** The Step 7I1E register is closed in place: **CD-1** (T7I-69 path) and **CD-2** (R-7a untested) in the Step 7I baseline; **CD-3** and **CD-4** in `CLAUDE.md` (its Amendment 004 summary row and its Figma matrix row); **CD-5** (the `R(C)` set stated as five and wrongly attributed to T7I-69) in the baseline; **CD-6** (the eight/eight/eight miscount) in the matrix, Amendment 004 and `CLAUDE.md`; **CD-7** (A-028 wrongly named as the superseded transition source) in Amendment 004 and the Implementation Plan. A stale-wording scan for "seven statuses", "two management-scoped bullets", "all three lists are eight" and the withdrawn `T12 → T6 → T8` path found matches **only** inside correction and supersession statements — no active instruction restates any of them.
- **Markdown validation passed** for all five documents: valid UTF-8 with no BOM, LF-only, trailing newline present, balanced code fences, well-formed headings, no tabs, no stray trailing whitespace, and **every Markdown table column-consistent** (5 + 2 + 22 + 9 + 9 = 47 tables checked, including indented tables, header/delimiter/row column counts all equal).
- **Whitespace gates passed:** `git diff --check` exit `0` and `git diff --cached --check` exit `0`, both with no output.
- **One non-blocking observation, recorded and not silently fixed.** `CLAUDE.md` §6's visibility bullet cites "spec §14, §14.1" as the source sections and then attributes supersessions per topic ("mechanism … A-028; management's audience … A-038"). Read strictly, the compound citation could be mistaken for a claim that §14.1's management audience is superseded, which Amendment 004 disclaims. It is **not** a defect in substance: v3 §14.1 contains no current-workflow management audience clause at all, so the attribution has an empty referent there; no document declares §14.1 superseded; and §14.1's operative rule is preserved and separately restated in `CLAUDE.md` §8. Recorded as a citation-precision observation for a future editing checkpoint. **No edit was made to any ratified document at Step 7I1G.**

**Progress ratification.** `docs/progress/STATUS.md`, `docs/progress/BUILD_NOTES.md`, the workspace-level tracker `..\BEST_COACH_DEMO_TO_MVP_MIGRATION_TRACKER.md` and its synchronized repository copy `docs/progress/DEMO_TO_MVP_MIGRATION.md` were updated to record: Amendment 004 and the Step 7I lifecycle design **ratified**; **Step 7I1 complete**; the five final design-document hashes; the eight statuses and fourteen legal transition pairs; **18** proposed new functions; **14** authenticated EXECUTE grants; **four** zero-client-EXECUTE functions; the proposed post-Step-7I census of **12 enums, 26 tables, 28 functions and 5 migrations**; **75** acceptance tests; the canonical/disposable database isolation ruling; that **no Step 7I SQL or implementation has begun**; and the physical-test dependencies that remain implementation work — the management review queue, the trainer returned-correction and observation paths, management correction tracking, the parent report-list and availability projections, a deterministic management bootstrap, notification states, AI grounding, real authentication, and real frontend/backend adapters. **No historical decision was rewritten.** The workspace tracker's exact existing path was confirmed by directory listing before it was modified; no new tracker was created and no location was guessed.

**Tracker synchronization.** The workspace tracker and `docs/progress/DEMO_TO_MVP_MIGRATION.md` were **byte-identical before** the update (both SHA-256 `ebd13b1e83cf10ce68a29fb0e80d685d2a0d7ff5ae900eef7330c4d65d86b9b4`), the workspace tracker was edited first, and the repository copy was then replaced with an exact byte copy of it and re-hashed to prove equality. Both files are CRLF, matching the existing convention.

**Commands run (all read-only except the file writes and the single commit):** `git rev-parse --show-toplevel` · `git rev-parse --abbrev-ref HEAD` · `git rev-parse HEAD` · `git rev-list --count HEAD` · `git status --porcelain` · `git tag` · `git remote -v` · `git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}'` · `git ls-files` · `git cat-file blob :<path>` (×5) · `sha256sum` · `git diff --check` · `git diff --cached --check` · `git log --oneline` · `git show --stat` · path-scoped `git add --` (×8) · `git commit` · post-commit `git show --stat --name-only`, `git status --porcelain`, `git rev-list --count HEAD`, `git tag`, `git remote -v`. **No `git add -A` and no `git add .` was used.** **No package manager, build, test, Docker, Supabase, psql, fixture or verifier command was run.**

**Automated verification:** Markdown structural/table validation **PASS** (5 files, 47 tables); `git diff --check` **exit 0**; `git diff --cached --check` **exit 0**; test-ID contiguity check **PASS** (75/75, no gap, no duplicate); `R(C)` kind extraction **PASS** (exactly 4). No typecheck, lint or build was run — no code file changed.

**Manual verification:** the five design documents were read in full or in the sections each claim depends on, together with the governing sources needed to adjudicate them (v3 §14/§14.1, Amendment 004's supersession table and A-034/A-036/A-040 bodies, the Implementation Plan's Amendment 004 reconciliation block, and the Figma matrix §0/§0.1/§1/§5.2).

**Failures and recovery:** none. No verification check failed, so no correction was required and none was made.

- **Decisions:** D-285 … D-292 record the baseline verification, the design verification result, Amendment 004 and the lifecycle design ratification, the Step 7I1 closure, the ratified censuses, the database-isolation posture, the outstanding physical-test dependencies, and the Step 7I2A boundary.
- **Commit:** `docs(governance): ratify Step 7I report lifecycle design` — **eight** files (the five ratified design documents plus `docs/progress/STATUS.md`, `docs/progress/BUILD_NOTES.md` and `docs/progress/DEMO_TO_MVP_MIGRATION.md`), parent `42d3c0292d7bc9e6442c4d4fc2398e5ee25de1a6`, resulting commit count **31**. The workspace-level tracker lies outside the repository and was deliberately **not** staged.
- **Next permitted action:** **Step 7I2A** — author and stage the **exactly two** Step 7I migration files for static review (file 1 containing only `ALTER TYPE public.report_status ADD VALUE 'trainer_approved' AFTER 'needs_edit'` under the P-1 fail-closed guard; file 2 containing every other authorized object). **It requires its own explicit orchestrator authorization; Step 7I2A must not begin without one, and no SQL may be authored before it is given.**

---

## 2026-08-05 — 48-hour physical-test slice: contract acceptance and parallel-worktree setup

**Checkpoint.** 48-hour physical-test slice — shared implementation contract, branch-local workstream logs, and isolated backend/frontend worktrees. **Setup only; no implementation.**

**Scope.** Created and committed the shared 48-hour implementation contract and the two branch-local operational logs, updated the four canonical progress records required by `CLAUDE.md` §11, and created two isolated branches and worktrees from that same commit. **No backend or frontend implementation was begun.**

**Baseline verified before any change.** Working directory resolved explicitly to the MVP repository — `git rev-parse --show-toplevel` → `C:/Users/enyul/Vibe Studio/B.E.S.T-Coach-Workspace/SDS Project Final (BEST Coach)`. Branch `main`; HEAD `194a7c27189903ef5ba2c02cec75af9f7fbfc1bb`; commit count `31`; `git status --porcelain --untracked-files=all` empty (clean index, clean worktree, zero untracked); zero tags; zero remotes; no upstream (`fatal: no upstream configured for branch 'main'`). The workspace tracker `BEST_COACH_DEMO_TO_MVP_MIGRATION_TRACKER.md` and the repository copy `docs/progress/DEMO_TO_MVP_MIGRATION.md` were proven **byte-identical** by SHA-256 (`83818417d9353dedce269d8575e524dc7f64be874fc5dd966c55ad82b7ac2d96`) and by `cmp`. The frozen demo was verified clean at `8d4acf4abc5039c24da01be773ab1a5e4916080f` on branch `main` with an empty porcelain status. **Nothing was reset, restored, stashed, discarded or rewritten.**

**Files created.**

- `docs/plan/PHYSICAL_TEST_SLICE_48H.md` — the shared contract. §0 pins its **subordination**: it sits below Specification v3, Amendments 001–004, `CLAUDE.md`, the Implementation Plan, Figma Design 2, `STATUS.md`, `BUILD_NOTES.md` and the migration tracker; it **authorizes no checkpoint**, **amends no governing document**, and **narrows no part of `CLAUDE.md` §12**. It pins the objective and the real-participant-path requirement; included Trainer/Management/Parent scope; deferred scope; the 18-route contract with the "role query parameter is presentation only" rule; the eight write actions mapped to RPC-1 … RPC-11; the eleven required reads and projections; the frontend DTO inventory with the "no generated database types in frontend contracts" rule; the nine-outcome `UiActionResult<T>`; the absolute management DTO exclusions; the `AiDraftProvider` boundary and its no-silent-selection rule; file ownership for both tracks; shared-reference read-only rules; the blocker protocol; the five named implementation checkpoints CP-1 … CP-5; the four parallel rounds; the fifteen-step integration order; and the 21 physical-test acceptance gates.
- `docs/workstreams/48H_BACKEND_PROGRESS.md` — branch-local operational log for `feat/48h-backend` (Claude Code).
- `docs/workstreams/48H_FRONTEND_PROGRESS.md` — branch-local operational log for `feat/48h-frontend` (Codex).

Each log carries the required header (workstream, owning agent, owning branch, planned worktree path, contract path, contract baseline commit and the explicit statement that governance and the shared contract take precedence), the fixed six-value status vocabulary (Not started · In progress · Blocked · Ready for review · Accepted · Integrated), its round checklist, and an append-only eleven-field checkpoint template (timestamp in Asia/Singapore, round/checkpoint ID, starting commit, ending commit, status, scope completed, files changed, tests and validation, unresolved blockers, contract deviations requested, next action). Both state that no secret, password, token, `.env` value or personal data may be recorded, and that the other agent's log is read-only.

**Contract-baseline resolution without a follow-up commit.** Both logs and `STATUS.md` name the contract baseline as *the commit created by* `docs(plan): define 48-hour physical-test slice`, resolvable at any time as `git merge-base feat/48h-backend feat/48h-frontend`. Because that reference is self-resolving, **no placeholder needed rewriting after the commit and no documentation-only follow-up commit was required**; both branches therefore begin from the same single setup commit.

**Files updated.** `docs/progress/STATUS.md` (new current-checkpoint header, a dedicated 48-hour section recording the contract acceptance, the isolated-branch/worktree model, the read-only shared-reference rule, the branch-local log model, the reconcile-only-from-`main` rule and the CP-1 … CP-5 table, plus a rewritten "Next permitted action" with the prior entry retained as history); `docs/progress/BUILD_NOTES.md` (this entry); `docs/progress/DEMO_TO_MVP_MIGRATION.md` (header block, decisions D-293 … D-300, and the next-permitted-action section). The workspace-level tracker was synchronized byte-for-byte from the repository copy and, being outside the repository, was deliberately **not** staged.

**Commands run.** `git rev-parse --show-toplevel` · `git rev-parse HEAD` · `git rev-parse --abbrev-ref HEAD` · `git rev-list --count HEAD` · `git status --porcelain=v1 --untracked-files=all` · `git tag -l` · `git remote -v` · `git branch -a` · `git worktree list` · `git ls-files` · `sha256sum` and `cmp` on both tracker copies · `git add --` with explicit paths · `git commit` · `git worktree add -b` (twice) · post-creation verification (`git worktree list`, `git rev-parse` on both branches, `git merge-base`). **No package manager, Supabase CLI, Docker, psql, fixture loader, verifier, dev server or build was invoked.**

**Automated verification.** None applicable — this checkpoint changed only Markdown. **No typecheck, lint, build or test was run, and none is claimed.**

**Manual verification.** Baseline verification as above; byte-identity of both tracker copies re-proven **after** synchronization; path-scoped staging confirmed to contain exactly the intended files, with `git add -A` and `git add .` never used; both worktrees confirmed to exist, to be attached to the expected branches, and to resolve to the **same** commit as `main`; the frozen demo re-verified unchanged and clean.

**Failures and recovery.** None.

**Decisions.** D-293 … D-300 in `docs/progress/DEMO_TO_MVP_MIGRATION.md` §7. Governing references: `CLAUDE.md` §1 (precedence), §4 (non-negotiables), §6/§6.1 (lifecycle and schema), §11 (git discipline, session continuity), §12 (stop-and-ask); Amendment 004 A-033 … A-040; `docs/plan/STEP_7I_REPORT_LIFECYCLE_BASELINE.md` R-1 … R-33; `docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md` §0.1.

**Open checkpoints recorded, not resolved.** **CP-1 (AI provider) is satisfied** — the ratified non-secret selectors `LLM_PROVIDER=openai` / `LLM_MODEL=gpt-5.6-terra` are already committed in `.env.example` and the key is recorded as present locally; **no secret value was inspected, printed, logged or reported**. **CP-2 (assessment-write authorization) is OPEN and requires an operator decision** — `observations` and `observation_ratings` carry zero policies and zero `authenticated` privileges, and the ratified Step 7I inventory contains no assessment-write RPC, so real observation persistence needs governed write objects that are not yet designed or authorized. It does **not** block backend Round 1. **CP-3** (queue/list projections, U-7I-24), **CP-4** (trainer observation read path, U-7I-11/U-30) and **CP-5** (management bootstrap, N-4/U-23) remain open as recorded.

**Commit.** `docs(plan): define 48-hour physical-test slice` — six repository files: the contract, the two workstream logs, and the three progress records. Local only; **no tag, no remote, nothing pushed.**

**Next permitted action.** Begin **backend Round B1** and **frontend Round F1** in parallel, each in its own worktree, each from the contract commit. **Step 7I2A remains the first backend sub-checkpoint and still requires its own explicit orchestrator authorization**, as do 7I2B … 7I2G and 7J. **CP-2 must be resolved by an operator decision before any assessment-write SQL is authored.** No merge, tag, remote or push is authorized, and canonical progress is reconciled only from `main`.

---

## 2026-08-05 — CP-2 / CP-4 governed assessment persistence design (design only)

**Checkpoint.** Resolve the two open assessment checkpoints of the 48-hour contract — **CP-2** (assessment-write authorization) and **CP-4** (trainer observation read path, U-7I-11 / U-30) — by ratified design, commit the result on `main`, and fast-forward both implementation worktrees to the new shared baseline. **Design and documentation only.**

**Scope.** Verify the baseline; read the governing corpus; inspect the *committed* observation/rating schema, the Step 7G authorization posture and the Step 7H audit registry; design exactly two governed database entry points; record the assessment-layer census delta separately from Step 7I; update only the CP-2/CP-4 portions of the shared contract; reconcile canonical progress from `main`; commit; fast-forward `feat/48h-backend` and `feat/48h-frontend` with `--ff-only`.

**The audit-action gate fired first, and was reported before any file was written.** A first pass established that the committed Step 7H registry is a **closed 16-element `CONSTANT text[]`** duplicated byte-identically inside **two applied `SECURITY DEFINER` functions** — `audit_append_event` (lines 439–456) and `audit_verify_chain` (lines 744–761) — and that **none of its sixteen actions denotes standalone observation persistence**. Every action that could truthfully describe an observation save is a *report* action requiring exactly the report mutation the CP-2 design forbids. That session **stopped as blocked with the repository untouched** rather than improvising, per the contract's own audit-action gate and `CLAUDE.md` §12 ("extend the Step 7H audit registry" — stop-and-ask).

**Operator ruling — option (c), adopted at this checkpoint.** `assessment_save_observation` **emits no Step 7H audit event**, and neither does `assessment_get_trainer_observation`. This is consistent with what Step 7H already ratified: §1.4 event **E9 — "Observation-to-report derivation"** — was resolved as *"Folded into E2/E3 payloads … no separate event (data minimization)"*, so observation facts were already ratified as auditable **through report events**. Binding consequences: the **registry is not extended**; **neither audit function is replaced** (Step 7H assertion **B20** requires the two copies to stay equal, and Step 7I test **T7I-30** requires the registry byte-unchanged in both); **no misleading report or administration action is reused**; and the save **creates no report and performs neither T0 nor T1**. `CLAUDE.md` §4 non-negotiable 2 is **not** engaged — it governs *state transitions*, and Step 7I §3.2 states directly that an observation save "is not a report transition at all". **Truthful audit begins when `requestDraft` performs the report lifecycle operations** (T0 → `report.created`, T1/T2 → `report.state_changed`), whose payloads carry only permitted non-PII derivation identifiers with the generic constant target labels of R-30.

**Design delivered.** Exactly two `public` functions, both `postgres`-owned, `plpgsql`, `SECURITY DEFINER`, `SET search_path = ''`, no dynamic SQL, `authenticated` EXECUTE only:

- **`assessment_save_observation`** (`VOLATILE`) — resolves `auth.uid()` to exactly one active account and one active trainer membership holding an **active** assignment to the exact session; verifies active enrolment in the session's module and attendance `present` (a missing attendance row **fails closed**); enforces the ratified `Asia/Singapore` session-start gate (Step 7I **R-9 / B-7I-1**, including the **U-7I-13** NULL-`starts_at` fallback, with the zone as a **pinned literal**); validates **exactly nine unique** governed dimension codes and the four-value rating vocabulary, each with its own distinct authored error; **derives dimension metadata from `assessment_dimensions`** — a client-supplied group or label is *unrepresentable* because no such parameter exists; creates, or CAS-updates on **observation id + session + student + lock version**, bumping `lock_version` by **exactly one** in the single UPDATE; upserts the complete nine-row rating set in the same transaction with a `count(*) = 9` post-condition; returns a bounded shape of identifiers, completion state and the new lock version, and nothing else.
- **`assessment_get_trainer_observation`** (**`STABLE`**, so it structurally cannot append) — same live relationship, scoped to the requested session and student; returns the five trainer-editable fields, the nine ratings with authoritative labels **embedded** from `assessment_dimensions` (so **U-7I-7** stays closed and no client grant on that table is needed), ordered by the **hard-coded `dimension_code` enum declaration order** rather than the mutable `sort_order` column; a **safe empty/not-created shape** of one row where no observation exists; one non-disclosing authored denial for management, parents, unrelated trainers and unauthenticated callers. It supports the **returned-correction** workflow while returning **no** management-only correction metadata — scope, dimension, status and reason stay with `report_get_working` (RPC-14).

**Posture preserved.** RLS stays enabled with **zero policies** on both tables; **no `authenticated` table SELECT/INSERT/UPDATE/DELETE** is granted on `observations`, `observation_ratings` or `assessment_dimensions`; `anon`, `service_role`, `authenticator` and `PUBLIC` stay at zero on everything; `FORCE ROW LEVEL SECURITY` is never added. The 7G block grant idiom is used, signature-qualified, one line per function. `authenticated` EXECUTE is **required** by the accepted server-action pattern — the request-scoped client carries the caller's session as role `authenticated`, and **the database role follows the credential, not the code location** (A-030) — and is **safe** because both functions re-derive every authorization fact live from `auth.uid()` on every call and are written to be invoked directly by any authenticated caller of any role.

**Census.** Assessment-layer delta recorded **separately**: **+1 migration, +2 public functions, +2 `authenticated` EXECUTE grants, no new table or enum, no new policy or table grant, no audit-registry change**. Post-assessment census: **6 migrations, 30 public functions, 26 tables, 12 enums**. **The ratified Step 7I counts of 5 migrations, 28 public functions and 75 acceptance tests are unchanged.** The verifier reconciliation the assessment migration must carry (A34 5→6, A35 28→30, D5 28→30, A32 unchanged at 26) is recorded in the baseline so it ships in the same commit as the migration.

**Acceptance tests.** **45 specified, `T-ASM-1 … T-ASM-45`, contiguous and additional to Step 7I's 75** — authorized creation and CAS update; exactly nine ratings; missing, duplicate, unknown and invalid dimension/rating cases as distinct authored errors; malformed payloads; mixed CAS nullability; future session under both `starts_at` states and both `TimeZone` GUCs; absent student; missing attendance row; inactive enrolment; inactive and unrelated trainer assignment; deactivated membership/account; ambiguous identity; management, parent, unrelated-trainer and unauthenticated denial; non-disclosing denial; borrowed observation id; stale lock-version and concurrent-create races; rollback and no-partial-state; and the privilege/posture census. **The impossible audit-append tests were replaced** by: assessment save leaves the audit chain unchanged; assessment read leaves the audit chain unchanged; assessment save creates no report and performs no report transition; Step 7H is byte-untouched; and a later `requestDraft`/report integration test proving the truthful T0/T1 events carry the permitted derivation identifiers and exclude assessment content and PII.

**Review.** Three read-only subagents (schema/constraint feasibility · authorization and privacy · audit, concurrency and test completeness) were used, and the parent **independently reconciled** every conclusion against the committed files rather than accepting them. All three agreed: the shipped schema is sufficient with **no** new object indispensable; the zero-grant posture is preservable; `authenticated` EXECUTE is required by the server-action pattern; and **no suitable existing audit action exists** — the finding that produced the blocker and the operator ruling. Two facts surfaced by review and re-verified directly: Step 7H **B20** (registry copies must stay equal) and Step 7I **T7I-30** (registry byte-unchanged in both functions).

**Files updated.** `docs/plan/PHYSICAL_TEST_ASSESSMENT_WRITE_BASELINE.md` (new); `docs/plan/PHYSICAL_TEST_SLICE_48H.md` (**only** the CP-2 and CP-4 rows of the §10 table and the CP-2 paragraph beneath it, which gained a new §10.1 audit-boundary note — a single diff hunk, verified; no unrelated section touched); `docs/progress/STATUS.md`; `docs/progress/BUILD_NOTES.md` (this entry); `docs/progress/DEMO_TO_MVP_MIGRATION.md`. The workspace-level tracker was synchronized byte-for-byte and, being outside the repository, deliberately **not** staged.

**Commands run.** `git rev-parse --show-toplevel` · `git rev-parse HEAD` · `git rev-parse --abbrev-ref HEAD` · `git rev-list --count main` · `git status --porcelain` · `git tag -l` · `git remote -v` · `git branch -vv --all` · `git worktree list` · `git log --oneline main..<branch>` (both, empty) · `git diff --stat` / `git diff -U1` on the contract · `md5sum` on both tracker copies · `git add --` with explicit paths · `git commit` · `git merge --ff-only` in each worktree · post-merge verification. **No package manager, Supabase CLI, Docker, psql, fixture loader, verifier, dev server or build was invoked, and no dependency was installed.**

**Automated verification.** None applicable — this checkpoint changed only Markdown. **No typecheck, lint, build or test was run, and none is claimed.**

**Manual verification.** Baseline verified with no drift (main `336cc18e` · 32 commits · clean · no tags/remotes/upstream · both worktrees clean on the correct branches at the same commit and carrying **no** divergent commits · frozen demo clean at `8d4acf4a` · tracker copies byte-identical). Contract edits confirmed to be a single hunk covering only CP-2/CP-4. Tracker byte-identity re-proven **after** synchronization. Path-scoped staging confirmed to contain exactly the intended files, with `git add -A` and `git add .` never used. Both worktrees re-verified after the fast-forward: clean, correct branch and path, same commit as `main`, no implementation change.

**Failures and recovery.** None at this checkpoint. The preceding session's blocker was resolved by operator ruling rather than by any repair.

**Decisions.** Recorded in `docs/progress/DEMO_TO_MVP_MIGRATION.md` §7. Governing references: `CLAUDE.md` §1, §4, §6/§6.1, §9, §11, §12; Amendment 002 A-017/A-021; Amendment 003 A-026/A-029/A-030; Amendment 004 A-033 … A-040; `docs/plan/STEP_7H_AUDIT_CHAIN_BASELINE.md` §1.4 (E9), §5, §6.4; `docs/plan/STEP_7I_REPORT_LIFECYCLE_BASELINE.md` R-5, R-9, R-19a, R-20, R-27, R-28, R-29, R-30, §3.2, §5.0, §8.6, U-7I-4, U-7I-7, U-7I-11/U-30, U-7I-13.

**Open items.** **U-ASM-1** — whether an observation edit should additionally be locked once its report reaches `submitted`; **non-blocking**, deferred to the hardening week, and deliberately not invented here (U-7I-4 already ratifies that mutable ratings may diverge from frozen snapshots by design, and frozen snapshots are unreachable from this path). **U-ASM-2** — rubric anchors and polarity bands have no schema column; the UI sources them from the ratified framework constants. **CP-3** and **CP-5** remain open as recorded. **Quick mode remains removed entirely** (A-017), not merely deferred.

**Commit.** `docs(plan): define governed assessment persistence` — five repository files: the new assessment baseline, the 48-hour contract, and the three progress records. Local only; **no tag, no remote, nothing pushed.**

**Next permitted action.** Begin **backend Round B1** and **frontend Round F1** in parallel, each in its own worktree, both now on the new shared baseline. **Step 7I2A remains the first backend sub-checkpoint and still requires its own explicit orchestrator authorization**, as do 7I2B … 7I2G and 7J. **Assessment implementation is Backend Round B2, after Step 7I acceptance, in its own separately-authorized migration.** No merge, tag, remote or push is authorized, and canonical progress is reconciled only from `main`.

---

## 2026-08-05 — Final MVP visual-screen inventory and 48-hour core-slice reconciliation (Amendment 005, documentation only)

**Checkpoint.** Ratify the complete final-MVP visual-reference inventory — **36 screens: 3 authentication + 33 portal** — reconcile it against the active instructions, plans and the 48-hour physical-test contract, pin the exact twelve-screen physical-test subset, plan route compatibility, and record canonical progress from `main`. **Documentation, instructions, visual-screen scope and route planning only.**

**Explicit non-scope, honoured in full.** No application code was implemented, moved, deleted or restyled. No application route or component was created. No Supabase, Docker, migration, fixture, build or server was run. No secret value was inspected. The competency-rating vocabulary was not altered — it is governed by a separate vocabulary-reconciliation checkpoint.

**Operator input gate (§0) fired once, then cleared.** The first pass **stopped as blocked with the repository untouched**: all six login placeholders were still literal (`<<REPLACE_WITH_…>>`), and a read-only sweep of the workspace confirmed no substitute source existed — the role-query strings appeared only in the physical-test contract, two frontend smoke tests and a backend lifecycle SQL fixture, none of which is an authorized §0 input. The orchestrator then supplied three node-specific `/design/` URLs. All three were verified: **file key `sSY1TYw3jyVlZDy8V2Mu7g`** in every case; **explicit `node-id` in every case**; **three distinct nodes** — `546:370` (trainer), `459:13` (management), `546:413` (parent). The sharing rule was recorded verbatim — *"all similar to each other"* — and read as **similar, not identical**: three distinct frames means **three separately frozen visual references**, and the shared-frame exception was **not** invoked.

**Baseline verified with no drift.** `main` `68169e97cbf614bf8b9b55deaee4039065fa45a0`, clean · `feat/48h-backend` `4a74b3ffb5b7b3ed1cb4a82644906beb00278ab5`, clean · `feat/48h-frontend` `c50ffd73edec51903b3eea4222dcbcca7b5e3d0f`, clean · frozen demo `8d4acf4abc5039c24da01be773ab1a5e4916080f`, clean, tag `demo-freeze-step14-2026-07-21` intact. **Both migration-tracker copies byte-identical** — SHA-256 `d40833c2feadd6c9f0fff449510ee53b9e1720bd884a1924cb40d86640af612c`, confirmed by `cmp`. **No reset, restore, stash, discard, merge or rebase was performed at baseline.**

**Active-document audit.** Read in full or in the relevant part: `CLAUDE.md`; Specification v3 and Amendments 001–004 (Amendment 004's supersession table and precedence rules in full); `docs/plan/BEST_Coach_Implementation_Plan.md`; `docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md`; `docs/plan/PHYSICAL_TEST_SLICE_48H.md`; `docs/plan/STEP_7I_REPORT_LIFECYCLE_BASELINE.md` and `docs/plan/PHYSICAL_TEST_ASSESSMENT_WRITE_BASELINE.md` where UI is referenced; `docs/progress/STATUS.md`; `docs/progress/BUILD_NOTES.md`; both migration trackers; and **both branch-local workstream logs, read-only**. **No active MVP `AGENTS.md` exists** — `git ls-files` confirms none is tracked. **No accepted historical record was rewritten.**

**Implementation branches inspected, not modified.** `feat/48h-frontend` carries 15 route files under `app/(auth)` and `app/(portals)`, 18 feature components and the `lib/frontend/**` DTO layer. `feat/48h-backend` carries the Step 7I lifecycle migrations and RPCs, governed assessment persistence, real authentication, the trainer/management/parent projections, the AI provider boundary with deterministic grounding, and management correction tracking. **Implementation status in the inventory was derived from that inspection, never assumed.**

**Amendment 005 authored and ratified.** `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_005.md`, clauses **A-041 … A-048**, with a complete supersession and precedence table: A-041 the 36-screen inventory and preserved 01–33 portal numbering; A-042 the canonical routes and bracket notation; A-043 the exact twelve-screen subset; A-044 the twenty-four deferred screens; A-045 the two authority precedences and the Figma-never-bypasses-governance rule; A-046 role-query-as-presentation-only, real identity and live membership, and the shared-credential and plaintext-password prohibitions; A-047 the preserved hierarchy and the "class type" → Class Module mapping; A-048 the preserved lifecycle, privacy and authorization controls, Parent linked-children limitation, Amendment 004's management-edit boundaries, and Management Term Report as separately governed. **It names no Amendment 001, 003 or 004 clause**, **extends rather than reverses A-022**, and **does not amend the competency-rating vocabulary**. **Specification v3 and Amendments 001–004 were not modified.**

**Canonical inventory created.** `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md`, with the eight required sections and, for each of the 36 screens, its ID, role, screen name, folder, canonical route, Figma node and node-specific URL, final visual status, current implementation status, `48-hour core slice: Yes/No`, physical-test flow order where applicable, backend dependency, screenshot status, current frontend route, compatibility treatment and implementation gap classification.

**Documents reconciled.** `CLAUDE.md` — precedence line, two new source-of-truth rows, three §7 pointer paragraphs and one new §12 stop-and-ask bullet; **pointers only, no duplicated tables**. `BEST_Coach_Implementation_Plan.md` — new **G2.1** separating the four screen classes (twelve core · twenty-four deferred · backend-dependent · separately governed). `FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md` — new **§0.2** carrying all 36 exact mappings with the twelve core screens marked, an explicit boundary note that **§1–§3 are family-based planning rows and are not the complete screen inventory**, the `Pending node-specific Design 2 link` placeholder withdrawn **only** for the 36 named screens, and the route-proposal note superseded for those screens. `PHYSICAL_TEST_SLICE_48H.md` — new **§4.1–§4.4**: the canonical-route relationship, the twelve-screen visual subset with the routes the test actually runs on, the complete governed workflow, the external frozen UI-reference pack, and the 24 post-physical-test screens. **The contract was not expanded to all 36 screens** — its §2 included scope and §3 deferrals are unchanged.

**Route compatibility documented; no route code edited.** Six canonical routes are already satisfied — the three login role-query variants plus **09** `/trainer/reports`, **29** `/management/reports` and **32** `/parent/reports`. Nine mismatches are recorded with one treatment each: core IDs **06, 07, 08, 10, 19, 33** → *replace after integration* with the contract-pinned path preserved as a redirect; deferred IDs **01, 11, 30** → *preserve existing route as redirect*. Four implemented surfaces carry governed behaviour with **no inventory ID** because no Figma frame exists (trainer wording editor, management wording-only editor, the management final-review surface sharing `/management/reports/[reportId]/review`, and the two query-variant queues) — recorded as *operator decision required* or *compatibility alias*.

**The one material finding.** **ID 05 Trainer Schedule — core flow order 2 — has no implemented route.** Session selection is currently folded into the trainer landing surface at `/trainer`. This is a **coverage gap, not a route mismatch**, and it is the single most consequential result of this reconciliation for the physical test. Two defensible options are recorded (accept the fold, or build `/trainer/schedule` before the test); **this checkpoint recorded the decision and did not make it**, because adding a route is a contract §9 blocker, not an agent decision.

**Open question resolved.** Six matrix rows and three §5.2 porting actions carried *"shared login shell vs three role-specific login screens is **undetermined** in Design 2."* **Three distinct node-specific frames were supplied, so the visual answer is three role-specific frames**, each separately frozen. The implementation may still share one shell and one route file.

**Validation.** Exactly 3 unique authentication IDs · exactly 33 unique portal IDs · exactly 36 unique folder slugs · exactly 36 canonical route strings including the three role-query variants · every supplied node ID well-formed and orchestrator-supplied · 33 unique portal nodes · 3 unique authentication nodes, none documented as shared · Trainer 10 · Management 19 · Parent 4 · Authentication 3 · total 36 · exactly 12 `48-hour core slice: Yes` · exactly 24 `48-hour core slice: No` · physical-test flow contiguous 1–12 · Parent numbering 30–33 · dynamic segments in bracket notation · no active source describes all 36 screens as required before the physical test · no active source omits a core screen · Markdown tables validate · `git diff --check` passes.

**Commands run.** `git rev-parse --show-toplevel` · `git rev-parse HEAD` · `git rev-parse --abbrev-ref HEAD` · `git status --porcelain` · `git tag --list` · `git worktree list` · `git ls-files` · `git log --oneline` · `git diff --stat main..HEAD` (both branches, read-only) · `sha256sum` and `cmp` on both tracker copies · `git diff --check` · `git add --` with explicit paths · `git commit` · `git merge --no-ff` into each implementation branch. **`git add .` and `git add -A` were never used.** **No package manager, Supabase CLI, Docker, psql, fixture loader, verifier, dev server or build was invoked, and no dependency was installed.**

**Automated verification.** None applicable — this checkpoint changed only Markdown. **No typecheck, lint, build or test was run, and none is claimed.**

**Manual verification.** Baseline verified with no drift before any edit; tracker byte-identity re-proven after synchronization; path-scoped staging confirmed to contain exactly the intended files; both worktrees confirmed clean before and after propagation; the frozen demo re-verified unchanged and clean; every node ID cross-checked against the orchestrator's compiled source list and the three supplied login URLs; uniqueness, count and contiguity checks performed against the authored tables.

**Failures and recovery.** One blocked pass, resolved by operator input rather than by any repair: the §0 login-input gate stopped the first attempt with the repository untouched, and the orchestrator then supplied the three node-specific URLs.

**Decisions.** Recorded in `docs/progress/DEMO_TO_MVP_MIGRATION.md` §7. Governing references: `CLAUDE.md` §1, §7, §12; Amendment 002 A-014/A-016/A-021/A-022; Amendment 004 A-033 … A-040; **Amendment 005 A-041 … A-048**; `docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md` §0.1/§0.2; `docs/plan/PHYSICAL_TEST_SLICE_48H.md` §0/§4.

**Open items.** **U-A5-1** ID 05 has no implemented route — **operator decision required before the physical test**. **U-A5-2** three implemented surfaces carry governed behaviour with no inventory ID, dependent on the eight blocked design families. **U-A5-3** exact field inventories for Create Class and the student/parent/trainer profiles remain UNRESOLVED, blocking IDs 20, 21, 24 and 26 — **do not invent a field**. **U-A5-4** Management Term Report governance, separately owned. **U-A5-5** whether the six management-review blocked families are ever assigned inventory IDs, which would extend the count beyond 36 — **a later amendment, never an implementation decision**. **CP-3** and **CP-5** remain open as previously recorded.

**Commit.** `docs(ui): ratify final MVP inventory and core test slice` — Amendment 005, the canonical inventory, four reconciled active documents and the three canonical progress records. Local only; **no tag, no remote, nothing pushed.**

---

## 2026-08-05 — Vocabulary Governance Checkpoint V1: competency-vocabulary ratification (Amendment 006, governance only)

**Checkpoint.** Ratify the competency-assessment vocabulary as **`Beginning` → `Developing` → `Mastering` → `Mastered`**, settle the derived rulings a label change cannot settle on its own (anchors, polarity, AI leak detection, the exact schema change, the Class Grade boundary, documentary authority), create the bounded implementation baseline, reconcile the active instructions, and record canonical progress from `main`. **Governance and documentation only.**

**Explicit non-scope, honoured in full.** **No SQL, migration, backend code, frontend code, fixture, generated type or test was changed.** No application route or component was created, moved, deleted or restyled. No Supabase, Docker, migration, fixture, build, application server or browser automation was run. No secret value was inspected. **No `governance-source` mirror file was synchronized.** **Amendments 001–005 were not edited** and remain byte-for-byte unchanged.

**Baseline verified with no drift.** `git rev-parse --show-toplevel` resolved exactly to the main MVP repository. `main` `63a990e7b108a5e7995b018c17ff1cfd22d490cb`, with **exactly one untracked path** — `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_006.md` — and no other modified, staged, deleted, renamed or untracked file. `feat/48h-backend` `81d5352f947d900b2fa48720bb942f1cb5b989ec`, clean · `feat/48h-frontend` `6f1a314f2285e1b70a293684d29e806fac34d414`, clean · frozen demo `8d4acf4abc5039c24da01be773ab1a5e4916080f`, clean, tag `demo-freeze-step14-2026-07-21` intact and resolving to that commit. **Both migration-tracker copies byte-identical at baseline** — SHA-256 `abe9e1ede1705f0e7d507d79a255dad557932d4c933c3458809ce3adf17ba206`. **Amendment 005 confirmed committed and matching its committed form.** **No reset, restore, stash, discard, merge or rebase was performed before the governance commit.**

**Pre-existing draft reviewed, not accepted unchanged.** The untracked draft measured **SHA-256 `e77175fd497fe77d18928ea5d8a8861e2f5cb2c4a2a2b3dfb64ae8097ee29f2f`**, 24,344 bytes, before any edit. Review confirmed it was a **draft** vocabulary amendment using **A-049 … A-055**, that it **did not overwrite or renumber Amendment 005**, that it **treated A-048 as the reserved vocabulary checkpoint**, and that it **superseded no Amendment 005 screen-inventory clause**. Its structure and reasoning were retained; its five open items were **closed by operator ruling** rather than ratified as drafted.

**Clause-continuity check performed, not assumed.** The highest clause in any committed instrument is **A-048**; no clause in **A-049 … A-055** appears anywhere in the committed tree. **A-049 … A-055 confirmed as the correct next range, and the instrument remains Amendment 006.**

**Amendment 006 ratified.** `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_006.md`, **A-049 … A-055**, ratified **2026-08-05 23:20 Asia/Singapore**, with a complete supersession and precedence table. **A-049** the four labels, arity/ordering/direction unchanged, `developing` unchanged, and the term-report map restated without advancing it · **A-050** the four behavioural anchors carried forward **positionally and verbatim**, with v3 §3.3's wording authoritative character-for-character · **A-051** polarity bands, `mastering` **retained** as `positive` because polarity derives from the anchor and not from the label's progressive form · **A-052** contextual attribution and taxonomy-disclosure detection **authorized**, a bare-word regex **prohibited**, ordinary prose **legal**, `mastered`/`mastery` **retained** as achievement language, and the audit-payload assertion required in the same checkpoint as the migration · **A-053** exactly three `RENAME VALUE` statements behind a **fail-closed in-transaction zero-row guard** over `report_versions`, `report_version_ratings` and `observation_ratings`, with the hash-v1 label-serialization rationale recorded · **A-054** Class Grade unchanged and **global keyword replacement prohibited** · **A-055** repository sources authoritative, `governance-source/` a non-authoritative mirror.

**Supersession and discharge.** Supersedes **Amendment 002's explicit retention of the four previous ratings** and **Amendment 003 A-026's `competency_rating` label list**; **additively extends Amendment 004 A-040** for the bounded rename; **discharges Amendment 005 A-048** and **supersedes no other Amendment 005 clause** — the 36-screen inventory, canonical routes, twelve-screen subset, 24-screen deferral, visual-authority precedence, authentication rulings and hierarchy mapping all stand. **A-031's enum, table and seed-row counts are not superseded** — a rename changes no count.

**Draft items closed by operator ruling.** **R-A6-1** `Mastered` remains the exceeds-expectations level; anchors carry forward verbatim; no threshold moved and no fifth level exists. **R-A6-2** repository sources authoritative; mirror divergence measured — `CLAUDE.md` 42,828 B and the Implementation Plan 24,307 B against the repository's 114,043 B and 86,714 B, so **both divergent mirror files are earlier, not later**, and **nothing was synchronized**; the specification mirror is byte-identical. **R-A6-3** contextual detection authorized, bare-word regex prohibited, required contexts enumerated. **R-A6-4** the zero-row guard is mandatory and fail-closed. **R-A6-5** the two rating unions stay separate, with **V4 verifying exact agreement** as a gate. **No `TBD`, placeholder or open decision remains in Amendment 006.**

**Implementation baseline created.** `docs/plan/COMPETENCY_VOCABULARY_RECONCILIATION_PLAN.md` defines **V2** (backend/database), **V3** (frontend) and **V4** (cross-branch integration), each with **exact owned-path boundaries, sequences, exit conditions and stopping conditions**, and each requiring **its own authorization**. V1 is recorded complete. The plan restates the prohibition on global keyword replacement and records that **the safe zero-row window closes on the first `report_versions` row**.

**Documents reconciled.** `CLAUDE.md` — precedence line, a new Amendment 006 source-of-truth row, the §5 scale/anchor/polarity bullets rewritten with an explicit implementation-status warning, a new §3.4 contextual-leak-guard bullet, the §3.6 open-items note corrected so the vocabulary is no longer listed as open, the Phase 0 fixture instruction updated, the §12 Amendment 005 stop-and-ask item updated to record A-048 as discharged, and a **new §12 stop-and-ask bullet** covering unauthorized implementation, a missing zero-row guard, hand-edited generated types, a bare-word regex, anchor edits, Class Grade edits and global replacement. `BEST_Coach_Implementation_Plan.md` — the Option B boundary and the Phase 1 core proof updated, plus a **new companion proof** that ordinary prose is not rejected. `FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` — the pending-reconciliation note replaced by a ratified pointer; **no screen count, ID, node, route, flow order or Amendment 005 decision touched**. `PHYSICAL_TEST_SLICE_48H.md` — a dated Amendment 006 supersession note appended and the **§7 active shared-contract `rating` union** updated in place. `PHYSICAL_TEST_ASSESSMENT_WRITE_BASELINE.md` — a dated supersession note appended; **the §2 enum declaration and the T-ASM-8 row were preserved verbatim as accurate historical records.** `FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md` — **inspected and deliberately unchanged**: it carries no competency-rating vocabulary and no pending-reconciliation note; its only `Beginner`/`Intermediate`/`Advanced` reference is **Class Grade**, which A-054 preserves.

**Class Grade confirmed untouched.** `class_grade_code`, the three centre-owned seed rows and their exact-match assertion, the `classGrade` unions, class-grade fixtures, UI labels and tests were **not modified**. `CLAUDE.md` §6, §6.1 and the Phase 0 fixture rows retain `Beginner` / `Intermediate` / `Advanced` unchanged.

**Validation.** Amendment 005 byte-identical to its committed form · Amendments 001–005 otherwise untouched · Amendment 006 carries no unresolved item · old labels remain only as historical record, quoted superseded text or unrelated domain use · active `CLAUDE.md` uses the ratified vocabulary · active implementation instructions use the ratified vocabulary · Class Grade remains Beginner / Intermediate / Advanced · Amendment 006 authorizes **exactly three** enum renames · **no SQL, TypeScript, TSX, fixture, generated-type or test file changed** · no application-owned path changed · both tracker copies byte-identical after synchronization · Markdown tables validate · `git diff --check` passes.

**Commands run.** `git rev-parse --show-toplevel` · `git rev-parse HEAD` · `git rev-parse --abbrev-ref HEAD` · `git status --porcelain --untracked-files=all` · `git ls-files` · `git log --oneline` · `git tag -l` · `git grep` (read-only) · `Get-FileHash` on the draft, both trackers and the three mirror files · `git diff --check` · `git add --` with explicit paths · `git commit` · `git merge --no-ff` into each implementation branch. **`git add .` and `git add -A` were never used.** **No package manager, Supabase CLI, Docker, psql, fixture loader, verifier, dev server or build was invoked.**

**Automated verification.** None applicable — this checkpoint changed only Markdown. **No typecheck, lint, build or test was run, and none is claimed.**

**Manual verification.** Baseline verified with no drift before any edit; the draft checksummed before modification; clause continuity proven by search rather than assumed; mirror divergence measured by hash and size rather than inferred; tracker byte-identity re-proven after synchronization; path-scoped staging confirmed to contain exactly the intended files; both worktrees confirmed clean before and after propagation; the frozen demo and its tag re-verified unchanged.

**Failures and recovery.** None. One material discovery: the instrument originally scoped as "Amendment 005" collided with the **already-ratified** Amendment 005 (A-041 … A-048); the vocabulary instrument was renumbered to **Amendment 006** after a clause-continuity check, and **no ratified instrument was renumbered, edited or overwritten**.

**Decisions.** Recorded in `docs/progress/DEMO_TO_MVP_MIGRATION.md` §7. Governing references: `CLAUDE.md` §1, §3.4, §5, §12; Amendment 002 A-016/A-017; Amendment 003 A-026/A-031/A-032; Amendment 004 A-040; Amendment 005 A-048; **Amendment 006 A-049 … A-055**.

**Open items.** **None created by this checkpoint** — all five draft items were closed by operator ruling. **Backend V2, frontend V3 and integration V4 remain pending, each requiring its own authorization.** The **safe zero-row migration window remains open** and closes on the first `report_versions` row. Previously recorded items **U-A5-1 … U-A5-5**, **CP-3** and **CP-5** are unchanged.

**Commit.** `docs(governance): ratify competency vocabulary amendment` — Amendment 006, the reconciliation plan, five reconciled active documents and the canonical progress records. Local only; **no tag, no remote, nothing pushed.**

**Next permitted action.** Scaffold the **external frozen UI-reference pack** — all 36 folders, with **only the 12 core screenshots required immediately** — and resolve **U-A5-1**. **Step 7I2A remains a separately-authorized backend sub-checkpoint**, as do 7I2B … 7I2G and 7J. **No route-compatibility treatment may be executed without its own authorization**, and canonical progress is reconciled only from `main`.

---

## 2026-08-06 — Backend Reconciliation Checkpoint V2 (Amendment 006 A-049 … A-055) — implemented on `feat/48h-backend`; database-dependent verification INCOMPLETE

**Scope.** The backend half of `docs/plan/COMPETENCY_VOCABULARY_RECONCILIATION_PLAN.md`, delivered as **three commits** on `feat/48h-backend` (worktree `worktrees/backend-48h`). This entry covers all three. **`main` was not touched; nothing was merged, tagged, pushed or remoted.**

| Commit | Title |
|---|---|
| `e5a66d7` | `feat(backend): rename competency rating vocabulary behind a fail-closed zero-row guard (Amendment 006 A-053)` |
| `103f433` | `feat(backend): replace bare-word rating leak guard with contextual attribution detection (A-052)` |
| *(this entry's commit)* | `test(backend): reconcile fixtures, assessment, lifecycle and integration suites to the ratified vocabulary` |

**Files changed.**

- `e5a66d7` — `supabase/migrations/20260806160000_competency_vocabulary_rename.sql` (new) · `server/modules/framework/dimensions.ts` · `server/db/database.types.ts` (**regenerated from the migrated schema, never hand-edited** — ADR-8) · `scripts/tests/step-7i/static-scan.mjs` · `scripts/tests/step-7i/verify-fresh-apply.mjs` · `scripts/tests/correction-tracking/ct-static.mjs`.
- `103f433` — `server/modules/ai-drafting/grounding.ts` · `server/modules/ai-drafting/provider.ts` · `scripts/tests/assessment/asm-suite.sql`.
- *This commit* — `scripts/fixtures/local_fixtures.sql` · `scripts/fixtures/verify-local-fixtures.sql` · `scripts/tests/assessment/asm-suite.sql` · `scripts/tests/assessment/run-assessment.mjs` · `scripts/tests/integration/run-integration.mjs` · `scripts/tests/step-7i/lifecycle-canonical.sql` · `docs/workstreams/48H_BACKEND_PROGRESS.md` · `docs/progress/STATUS.md` · `docs/progress/BUILD_NOTES.md`.
- **`package.json` and `package-lock.json` are unchanged. No dependency and no test runner was added (R-B7). `npm audit fix` was never run.** No frontend-owned path changed. The frozen demo at `SDS Project Sprint 2` was not touched.

**What the schema change actually is.** Migration `20260806160000` contains **exactly three** `ALTER TYPE public.competency_rating RENAME VALUE` statements — `emerging`→`beginning`, `secure`→`mastering`, `advanced`→`mastered` — behind a **fail-closed in-transaction zero-row guard** over `report_versions`, `report_version_ratings` and `observation_ratings` (A-053). `developing` is untouched, which is why there are three renames and not four. `RENAME VALUE` leaves `pg_enum.enumsortorder` intact, so **arity, ordinal position and low-to-high direction survive**; the fixture verifier and the lifecycle canonical suite now assert the four labels **in physical sort order**, which is a stronger check than a membership test and is the assertion that would have caught a reordering. **No table, enum-count, column, constraint, index, policy, grant or function-count change** — the accepted census moves only in its migration count, 7 → 8.

**Why the bare-word guard had to go (A-052).** The previous leak guard was equivalent to `\b(beginning|developing|mastering|mastered)\b`, which post-rename would have rejected ordinary parent-facing English — "at the beginning of the session", "has mastered maintaining eye contact". It is replaced by **contextual attribution and taxonomy-disclosure detection**: `rating: Mastered`, `rated as Beginning`, `Mastering level`, or an isolated raw label presented as a rating value. `mastered` / `mastery` are **retained** as achievement language for contradiction detection, per A-052.

**The one real defect found and fixed in this commit.** `scripts/tests/integration/run-integration.mjs` Part 1 still built its rating fixtures from `advanced` / `emerging` / `secure`. Those are no longer members of `RatingLevel`, so `POLARITY_BANDS[rating]` evaluated to `undefined` and grounding rule 3 **skipped** rather than erroring. INT-G3 ("an achievement-worded draft about a needs-support dimension must be rejected") and INT-G5 would therefore have printed PASS while exercising nothing — a **fail-open degradation of `CLAUDE.md` §4 non-negotiable 1**, and precisely the failure mode a label rename invites. Remedies, all in the suite:

1. **INT-G0** (new) — a fail-closed precondition asserting every fixture rating resolves to a live `POLARITY_BANDS` member **before** any grounding proof runs. A future vocabulary drift now fails loudly at the top of Part 1 instead of quietly disabling the gate.
2. **INT-G3 / INT-G5** now require the rejection to come from the **polarity** rule specifically, so a green can never be an accident of the attribution rule.
3. **INT-G4** re-keyed. It asserted that "The student is currently rated **Emerging** in eye contact" is rejected — a sentence that certified a guarantee no longer capable of being violated, because `emerging` is not a value this system can assign. It now uses the ratified `"currently rated Mastering"` and requires the **attribution** rule to be the rejecting rule.
4. **INT-G6** (new) — A-052's other half: ordinary prose using the same words ("Right from the beginning of the session…", "has mastered a confident, upright posture", "is mastering sentence flow") must remain **legal**. This is the standing proof that a bare-word guard has not been reintroduced.
5. Part 3's `polarityBand` is now derived from the **`POLARITY_BANDS` constant** instead of a re-hardcoded ternary, so the harness cannot drift from the backend mapping again.

**Fixtures.** The nine `observation_ratings` literals moved to the ratified storage values **positionally**: `secure`→`mastering` (body, tonality, sentence_flow), `emerging`→`beginning` (speech, emotional_expression), `advanced`→`mastered` (eye_contact, audience_awareness); `developing` (emotion, vocal_projection) unchanged. The set stays **deliberately mixed with two `beginning` and two `mastered`**, so the persona §3.4 grounding contradiction proof remains exercisable (`CLAUDE.md` §11). The **Step 7F shape is preserved exactly** — 3 Auth identities, 25 domain rows, Option B — and **no `reports`, `report_versions`, `report_version_ratings`, checklist-progress, approval or `invitations` row is created**. The **Option B zero-row guards over the five report tables in `verify-local-fixtures.sql` were kept verbatim and not weakened**; A-053's zero-row precondition is exactly why the rename is safe, so weakening them would have removed the guarantee the migration depends on.

**Suite casts.** `asm-suite.sql` (`pg_temp.nine()` and the T-ASM-6 / T-ASM-7 / T-ASM-9 malformed-payload fragments) and `lifecycle-canonical.sql` (T7I-4, T7I-45, T7I-35, T7I-52 and the decoy snapshot mutation) no longer cast superseded literals to `public.competency_rating`; post-rename those casts would have failed at cast time rather than exercising the validator branch under test. Migration-count pins moved 7 → 8 in `verify-local-fixtures.sql` A34 (with `20260806160000` added to the exact version list) and `lifecycle-canonical.sql` T7I-73, and their stale narrative comments — including the one calling the correction-tracking migration "the seventh" — were corrected. `asm-suite.sql`'s T-ASM-40 pin had already been reconciled at the second Backend V2 commit and was verified rather than re-edited.

**Class Grade discipline (A-054).** Every occurrence of `advanced`, `secure` and `emerging` was classified by **actual context**. **No global keyword replacement was performed.** `class_grade_code`, the three centre-owned Class Grade seed rows, the `beginner` grade assertions and every Class Grade literal are byte-identical, and `advanced` survives unchanged wherever it is a Class Grade. Two new assertions — one in the fixture verifier, one in the lifecycle canonical suite — now **pin `class_grade_code` to `beginner` / `intermediate` / `advanced`**, so a future vocabulary edit that strays into Class Grade fails loudly. The superseded labels deliberately **remain** inside `asm-suite.sql`'s audit-payload leak-scan regex, which asserts that neither the old nor the new vocabulary reaches an audit payload.

**Automated verification — commands run, with real exit codes.**

| Command | Exit | Result |
|---|---|---|
| `npx tsc --noEmit` | **0** | Clean. |
| `npx eslint .` | **0** | Clean, no warnings. |
| `node scripts/tests/step-7i/static-scan.mjs` | **0** | All ten static proofs pass, including T7I-73's eight-migration-file check. |
| `node scripts/tests/correction-tracking/ct-static.mjs` | **0** | All six static proofs pass; T-CT-S4 confirms eight migration files and that the seven already-applied files are byte-identical to HEAD. |
| `node scripts/tests/step-7i/verify-fresh-apply.mjs` | **0** | All **eight** migrations apply cleanly, in order, from a database stripped of every project object. Fresh census 26 tables / 31 functions / 12 enums / 29 policies / 8 migrations / 23 authenticated EXECUTE / RLS everywhere / 8 ordered report-status labels / 1-3-9 seeds. The local database is **catalogue-identical** to that fresh application. Scratch database destroyed. |
| `node --import ./scripts/tests/integration/alias-loader.mjs scripts/tests/integration/run-integration.mjs` | **1** | **Part 1 passes 7 of 7** — INT-G0, INT-G1, INT-G2, INT-G3, INT-G4, INT-G6, INT-G5. The run then exits 1 at **INT-A0** (`the trainer session resolved to an unexpected auth user`) because the database is unfixtured. **Parts 2 and 3 are BLOCKED-ON-FIXTURE, not failing.** |
| Read-only census (`docker exec … psql`, no mutation) | **0** | `auth.users` = 1 · `public.accounts` = 0 · applied migrations = 8 · `competency_rating` = `beginning, developing, mastering, mastered` · `class_grade_code` = `beginner, intermediate, advanced`. |

**A static SQL parse/lint of the four changed `.sql` files was not run because the toolchain offers none.** `package.json` exposes only `dev`, `build`, `start`, `lint` (ESLint) and `fixtures:local`; `supabase db lint` operates against an applied schema, which is the blocked path. **No SQL linter was added — R-B7 forbids adding any dependency or test runner.** The SQL edits are literal-for-literal substitutions plus additive assertions, and the enum values they now use are proven live by the `verify-fresh-apply.mjs` census.

**Manual verification.** The predecessor agent's uncommitted work was reviewed in full with `git diff` before any edit and **continued, not restarted or discarded** — no reset, checkout, stash or restore was performed. Every path was staged **explicitly by name**; `git add .` and `git add -A` were never used. Remaining superseded competency literals across `scripts/`, `server/`, `app/` and `supabase/` were searched for and none remain outside the two deliberate contexts named above.

**Failures and recovery.** One gate ends non-zero and is **recorded as blocked rather than failing**: `run-integration.mjs` exits 1 at INT-A0 because no fixture identity exists to authenticate as. This is distinguishable from a real failure — Part 1, which needs no database, passes completely, and the failure occurs at session establishment, before any assertion about backend behaviour is evaluated.

**BLOCKER B-V2-BLOCK-1 — fixture-credential blocker. OPERATOR-ONLY. OPEN.**

- **State.** The local database is **migrated** (8 migrations; `competency_rating` correctly renamed; `class_grade_code` unchanged) but **UNFIXTURED**.
- **Observed residue.** `auth.users` holds **one orphan row**, `trainer.fixture@example.test`, under a **non-ratified UUID**; `public.accounts` is **0**. The 25 ratified domain rows are absent.
- **Why no agent can close it.** Reloading requires `npm run fixtures:local -- --reload`, whose password prompt requires an **interactive no-echo TTY** that does not exist in an agent session. `CLAUDE.md` §11 "Fixture credentials — absolute" is absolute: fixture passwords come **only** from no-echo interactive stdin on an operator-controlled local terminal. There is **no environment-variable path, no default, no generated-and-discarded value and no file source**, and no password may ever be requested, accepted, transmitted, printed or persisted.
- **Deliberately not done.** No password path was added. No password was generated. Nothing was inserted directly into `auth.users`. No `password_hash` was supplied. **The loader's preflight was not weakened.** Each of those would have violated an absolute rule and would have been the wrong way to make a gate go green.
- **Precise operator action required.** From an **interactive local terminal**, in `c:\Users\enyul\Vibe Studio\B.E.S.T-Coach-Workspace\worktrees\backend-48h`, run `npm run fixtures:local -- --reload`, entering the fixture passwords at the **no-echo prompt**. Then re-run the blocked gates.
- **Blocked and therefore unrun — neither passing nor failing:** the fixture load and reload · fixture verification (`scripts/fixtures/verify-local-fixtures.sql`) · the post-reset census and the canonical fixture checksum · `node scripts/tests/assessment/run-assessment.mjs` · the Step 7I lifecycle canonical **dual run** and its `d6a314b4…b87517` checksum reproduction · `run-integration.mjs` **Parts 2 and 3**.
- **Consequence, stated plainly.** **Backend V2's database-dependent verification is INCOMPLETE. No readiness claim may be made for Backend V2.** It is not accepted, not integration-ready and not physical-test-ready until the operator has reloaded the fixture and the blocked gates have been run and reported.

**Decisions.** Governing references: `CLAUDE.md` §3.4, §4 (non-negotiable 1), §5, §6.1, §11 (fixture shape, fixture credentials, git discipline), §12; Amendment 006 **A-049** (vocabulary), **A-050** (anchors verbatim, positional), **A-051** (polarity, `mastering` = `positive`), **A-052** (contextual detection; bare-word regex prohibited), **A-053** (exactly three renames behind the zero-row guard), **A-054** (Class Grade unchanged; global replacement prohibited), **A-055** (repository copies authoritative; `governance-source/` not consulted); ADR-8 (generated types regenerated, never hand-edited).

**One recorded deviation, not requested.** `docs/workstreams/48H_BACKEND_PROGRESS.md` states that `STATUS.md` and `BUILD_NOTES.md` are "never updated from this worktree". They were **explicitly assigned as owned paths for this checkpoint**, and `CLAUDE.md` §11 — which mandates these two permanent continuity documents — sits above that log in precedence; the log itself states that it is "an operational log, not a governance authority". An open, operator-only blocker is exactly the state these two documents exist to carry across sessions.

**No credential-bearing output was rendered at any point.** No password, token, API key, service-role key or connection string was requested, accepted, printed, logged or persisted. No hosted Supabase endpoint was contacted; the project has never been linked.

**Commit.** `test(backend): reconcile fixtures, assessment, lifecycle and integration suites to the ratified vocabulary`. Local only, on `feat/48h-backend`; **no tag, no remote, nothing pushed, nothing merged into `main`.**

**Next permitted action.** **Operator:** reload the fixture as described above, then re-run the blocked gates. Only after they report clean may Backend V2 be reviewed for acceptance. **Frontend V3 remains pending and separately authorized** — the frontend still carries the superseded labels — and cross-branch **V4** follows it.

---

## 2026-08-08 — CLAUDE.md operating-policy reconciliation (multi-agent execution + continuity/status/logging) — GOVERNANCE/DOCUMENTATION ONLY

**Scope.** Establish standing operating policy in two domains — (1) multi-agent execution/orchestration, (2) execution continuity, status and progress logging — by **reconciling existing policy rather than appending new policy**. Follows the Phase A governance reconciliation, the Authority Lock, and the OD-4 report-semantics ruling. **Phase A2 not started. Phase B implementation not started. No application change of any kind.**

**Track / workstream.** Governance/documentation only, on `main`, no worktree.

**Starting HEAD → ending HEAD.** `139d7533c126acc6a5162d0fcb889e86e80ed59e` → `139d7533c126acc6a5162d0fcb889e86e80ed59e` (**unchanged — nothing committed**).

**Method — multi-agent, per the policy being written.** Five independent READ-ONLY subagents ran in parallel (A multi-agent policy · B status/logging system · C resume/blocker/operator-decision rules · D autonomy and safety gates · E overlap/duplication and canonical assignment). The orchestrator re-verified every material finding at source before recording it. Two independent adversarial reviews followed — one full falsification pass, one focused re-review of the corrections.

**What already existed (preserved, not duplicated).**
- **Continuity: PARTIAL.** Amendment 001 **A-008** already ratified the two-document model — `STATUS.md` + `BUILD_NOTES.md`. Preserved unchanged; §15 supplies only what A-008 never specified (canonical role assignment, required fields, snapshot-vs-log discipline, verification on resume).
- **Multi-agent: effectively ABSENT from standing authority.** `CLAUDE.md` contained zero occurrences of subagent/multi-agent/worktree/single-writer/adversarial. The best material in the project — `AUTONOMOUS_48H_AGENT_CONTRACTS.md` §0 and `PHYSICAL_TEST_SLICE_48H.md` §7 — was sprint-scoped, self-declared subordinate, and outside git. **Promoted and generalized into standing policy; no safeguard weakened.**

**Files changed — 7 tracked (all `.md`) + 4 outside git.**
- `CLAUDE.md` — §1 precedence ladder now names the four root governance instruments and the Authority Lock (previously absent entirely), with the two-ladder visual/functional split restored per A-045; §11 session continuity extended with forward pointers; §12 gained six stop-and-ask conditions (billable/financial · hosted-or-external provisioning and deployment, paid **or free** · editing ratified authority as distinct from deleting it · Critical/High defect as a halt trigger · legal/privacy ambiguity · retry and commit discipline); **new §14 Execution orchestration**; **new §15 Continuity, blockers and Operator escalation**. §1–§13 numbering deliberately unchanged so existing cross-references stay valid.
- `docs/progress/STATUS.md` — new CURRENT EXECUTION STATE snapshot block; canonical-role and verify-against-reality header.
- `docs/progress/BUILD_NOTES.md` — entry format extended; canonical historical-log role stated.
- `docs/progress/DEMO_TO_MVP_MIGRATION.md` + `BEST_COACH_DEMO_TO_MVP_MIGRATION_TRACKER.md` (root) — HISTORICAL banners; the superseded ChatGPT-seated checkpoint-acceptance protocol explicitly retired; D-1…D-317 ownership preserved.
- `docs/workstreams/48H_{BACKEND,FRONTEND}_PROGRESS.md` — closed-sprint banners; stale "Amendments 001–004" precedence flagged.
- `FINAL_MVP_SUBMISSION_READINESS_PLAN.md`, `UI_REFERENCE_FINAL_MVP/FRONTEND_RECONSTRUCTION_TRACKER.md`, `UI_REFERENCE_FINAL_MVP/AUTONOMOUS_48H_EXECUTION_TRACKER.md` — currency/scope markers so they stop competing for "current status".

**Canonical assignment recorded.** AUTHORITY → `FINAL_MVP_AUTHORITY_LOCK.md` · EXECUTION PLAN → `FINAL_MVP_EXECUTION_PLAN.md` (workspace root, **not yet created**) · CURRENT STATUS → `docs/progress/STATUS.md` · HISTORICAL LOG → `docs/progress/BUILD_NOTES.md`. **No new tracker, status file or log was created.**

**Migration / schema changes.** **None.**

**Automated verification.** None applicable — no code changed. Scope proven instead by `git status --porcelain -uall` and `git diff --name-only`: **every changed path is `.md`; zero untracked files.** `docker ps` fails (daemon down), so no database or migration could have run.

**Reviewer findings and remediation.** Full review returned 1 CRITICAL + 8 HIGH + 7 MEDIUM. All remediated: the status block understated the dirty-file set and bundled a pre-existing Phase A edit under a blanket `git restore` (would have destroyed the ratified C-8 correction); a stale environment claim wore a fresh-verification date; two precedence contradictions; the missing free-tier hosted/deployment gate; a checksummably false "byte-identical" claim; three surfaces still reading as live. Focused re-review then caught **four numeric falsehoods introduced by the corrections themselves** (file counts 3-vs-4 and 5-vs-7; "40 commits" where git says **38**; the "byte-identical twin" phrase surviving in §15.1) — all four verified at source and fixed.

**Operator decisions received.** One: the bounded instruction authorizing this reconciliation.

**Blockers opened.** One, **escalated not mitigated** — the frozen worktrees each carry a complete stale governance corpus including their own `CLAUDE.md`/`STATUS.md` predating Phase A and OD-4. A session launched inside one loads the wrong contract and cannot see the warning, which lives in the canonical copy. Authority Lock §31.11 forbids touching them, so the fix requires an Operator ruling: bounded unfreeze to place pointer banners, removal, or explicit risk acceptance. Recorded at `CLAUDE.md` §14.3.

**Environment / infrastructure changes.** None. Docker down throughout; nothing hosted contacted.

**Cleanup / rollback state.** No mutation of any kind. All seven tracked edits individually reversible with `git restore <path>` — **except `docs/plan/BEST_Coach_Implementation_Plan.md`, which is a PRE-EXISTING Phase A edit and must NOT be restored.** The four out-of-git edits are unbacked.

**Deliberately not done.** No commit · no push or remote · no Phase A2 · no implementation · no schema, migration, fixture, test or `.env` change · no hosted/Vercel/GCP action · no external provider call · nothing deleted, moved or archived · frozen demo and both worktrees untouched · Authority Lock and OD-4 ruling untouched · the two OD-4 implementation-time decisions (content-hash envelope V1-vs-V2; grounding rule-4 re-derivation) left **unresolved by design**, and the five-deny-list fail-open hazard left recorded with its negative-control requirement intact.

**Commit.** **NONE — nothing was committed.** The tree is deliberately left dirty for Operator review, consistent with the Phase A and OD-4 runs and with the commit discipline this run added to §12.

**Next permitted action.** **Operator review of the cumulative documentation diff.** No further work is authorized until the Operator authorizes a bounded phase — Phase A2 cleanup, creation of `FINAL_MVP_EXECUTION_PLAN.md`, or the OD-4 implementation track. The worktree stale-corpus hazard above also needs a ruling.

---

## 2026-08-08 — Operator ruling: the two 48H worktrees are CLOSED_BY_NONUSE_POLICY — GOVERNANCE/DOCUMENTATION ONLY

**Scope.** Record the Operator's ruling that `worktrees/backend-48h` (`feat/48h-backend` @ `402b0b6`) and `worktrees/frontend-48h` (`feat/48h-frontend` @ `6762b5c`) are **HISTORICAL / FROZEN IMPLEMENTATION ARTEFACTS**, and propagate the prohibition into active governance and status. This closes the stale-contract execution hazard escalated earlier the same day in the operating-policy reconciliation.

**Track / workstream.** Governance/documentation only, on `main`, no worktree. **Bounded ruling — no Phase A2, no implementation.**

**Starting HEAD → ending HEAD.** `139d753` → `139d753` (**unchanged — nothing committed**).

**The ruling.** Neither worktree's stale `CLAUDE.md`, `STATUS.md` or other governance file may be modified. **Neither may be used for ANY future Final MVP implementation.** All future parallel implementation worktrees are created **fresh from the current accepted `main` baseline, after Phase A2 and after `FINAL_MVP_EXECUTION_PLAN.md` is established.** Phase A2 is authorized to inspect them **read-only** and classify them, and may later **propose** removing the physical directories only on proof of five conditions — reachability from the main repository · no unique required evidence held only in the physical worktree · no effect on the frozen demo · inclusion in the cleanup manifest · **explicit Operator approval**. **Removal is not authorized and was not performed.**

**Risk disposition.** Recorded as **`CLOSED_BY_NONUSE_POLICY`** — closed by prohibiting use, explicitly **not** by accepting stale-contract execution risk and **not** by editing the worktrees. The earlier hazard was that a session launched inside a worktree would load its superseded contract (pre-Phase-A, pre-OD-4, precedence stopping at Amendment 004) and never see a warning living in the canonical copy. A worktree that may never be a launch target never loads that contract. The §31.11 freeze is preserved intact.

**Files changed — 2 tracked, 1 out-of-git. All `.md`.**
- `CLAUDE.md` — §14.3's OPEN-HAZARD escalation replaced by new **§14.3a**, the ruling in full with the three prohibitions, the fresh-worktree requirement, the read-only Phase A2 authorization and the five removal conditions.
- `docs/progress/STATUS.md` — worktree row rewritten; new pinned ruling block; active-blockers row records the hazard CLOSED; out-of-git file list corrected 4 → 5.
- `FINAL_MVP_AUTHORITY_LOCK.md` (out of git) — §31 item 11 extended from "untouched" to the full non-use policy; §2.3 records the ruling. Edited **only** under the explicit Operator instruction authorizing it, per the editing-ratified-authority gate added to §12 earlier the same day.

**Verification — read-only git inspection, no mutation.** `git for-each-ref refs/heads` shows all three branch refs live in the **main repository's shared `.git`**; `git cat-file -t` confirms both commits are objects in that store; `git rev-list --count main..feat/48h-backend` = **0** and the same for frontend — **both branches are fully merged into `main` and hold no unmerged history.** Recorded as evidence for removal-condition 1 **only**; conditions 2–5 are untested and remain the future proposal's burden.

**Reviewer findings.** None commissioned — bounded single-ruling propagation, done directly rather than fanned out, per `CLAUDE.md` §14.1 (*"a small, well-scoped task is done directly"*). One self-caught defect: editing the Authority Lock made the out-of-git file count 4 → 5, and the STATUS.md working-tree row was corrected in the same pass rather than left stale — the §15.2/§15.3 discipline applied to this run's own output.

**Operator decisions received.** One: this ruling.

**Blockers.** **One CLOSED** — the 48H worktree stale-contract hazard, now `CLOSED_BY_NONUSE_POLICY`. None opened.

**Migration / schema changes.** **None.** **Environment changes.** None. **Cleanup / rollback state.** No mutation; nothing deleted, moved, renamed or archived.

**Deliberately not done.** Nothing inside either worktree was read for content, edited, moved or removed · no branch deleted · no `git worktree remove` · no commit · no push · Phase A2 not started · implementation not started · frozen demo untouched.

**Commit.** **NONE.** Tree deliberately left dirty for Operator review.

**Next permitted action.** **Operator review of the cumulative documentation diff.** No further work authorized until the Operator authorizes a bounded phase — Phase A2 cleanup, creation of `FINAL_MVP_EXECUTION_PLAN.md`, or the OD-4 implementation track.

---

## 2026-08-08 — FINAL MVP PHASE A2: CONTROLLED PRESERVATION, RECONCILIATION, CLEANUP AND VERIFICATION

**Authorized by explicit operator instruction** (rulings OR-PA2-1 … OR-PA2-4 and Q-1 … Q-26). **Documentation, governance metadata and filesystem hygiene only — no application source, schema, migration, fixture, configuration or test file was changed.**

### Preservation gates (all PASS, before any destructive or reconstructive action)

- **Gate 0 — state verified.** HEAD `139d7533`, branch `main`, 0 remotes, 7 modified `.md` files, **zero non-documentation changes**, `git diff --check` clean, frozen demo clean at `8d4acf4`.
- **Gate 1 — targets verified.** SUTD OneDrive writable; `D:\` present, writable, 629.5 GB free. **`C:` is disk 0 and `D:` is disk 1 — two separate physical NVMe devices, so there is NO residual backup-independence risk to record.**
- **Gate 2 — two snapshots created and verified.** 1,726 files / 107.2 MB each (`node_modules`, `.next`, `.env.local` excluded), **0 failures**. Subtree counts matched source exactly across all three locations: 37 reference packs, 343 UI files, 12 migrations, 7 spec files, 88 checkpoint-evidence files, 2 canonical PDFs, 3 governance-source files, 762 + 111 git objects. **`.env.local` copied ONLY to a protected D: location** (OneDrive verified to contain zero). **AUTH-01 and PeakPalate hash-verified byte-exact in all three locations.**
- **Gate 3 — checkpoint commit `3930db9164d7f7e6353b00eccdf4dd31074610c2`**, tag `final-mvp/pre-phase-a2-cleanup-2026-08-08`. Staged set was exactly 7 `.md` files. **`git restore` was deliberately NOT used**, protecting the pre-existing C-8 correction in `docs/plan/BEST_Coach_Implementation_Plan.md`.
- **Gate 4 — frozen tags created BEFORE removal:** `frozen/48h-backend-402b0b6`, `frozen/48h-frontend-6762b5c`. *Rationale: git refuses to delete a branch checked out in a worktree; removing the worktree lifts that protection, and both branches are fully merged, so a plain `git branch -d` would then succeed silently. The tags make the commits reachable independently of the mutable branch refs.*
- **Gate 5 — portable git bundles**, both verified *"records a complete history"*, stored and independently re-verified at **both** locations.

### Cleanup executed

- **58 stale-segment rewrites** in annotate-never-delete style (strike-through + date + ruling citation), across `CLAUDE.md`, `STATUS.md`, `FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md`, `BEST_Coach_Implementation_Plan.md`, `STEP_7I_REPORT_LIFECYCLE_BASELINE.md`, `PHYSICAL_TEST_SLICE_48H.md`, `COMPETENCY_VOCABULARY_RECONCILIATION_PLAN.md`, and three ungit'd workspace-root documents. **Four clauses in the rank-2 contract that instructed agents NOT to build a ratified deliverable are now corrected.**
- **`S-57` deliberately NOT applied** (operator ruling). It proposed rewriting *"Total `authenticated` EXECUTE grants = 14"* to 25 in the Step 7I baseline — but that line self-scopes (*"This counts only functions Step 7I creates"*) and is correct in its frame. **Applying it would have committed the very two-frames error the Phase A2 audit condemns.** The four explicit NOT-STALE guards were likewise left untouched.
- **AUTH-01 foreign contamination resolved** — byte-exact preservation to two independent devices, verified, then reconstruction from Figma node `546:370` only. Zero foreign content remains in active UI authority. Full record in `UI_REFERENCE_FINAL_MVP/CHANGE_LOG.md`.
- **Two `.txt` → `.html` renames** with **bytes unchanged** (pre/post SHA-256 identical). `reference/` now holds 37 `.html`, 37 `.png`, 37 `.md`, **zero `.txt`**.
- **11 stale screenshot trailers corrected**; verified afterwards that **12 packs hold a `reference.png` and exactly 12 claim one — zero mismatches against disk**. None manufactured.
- **`UI_PACK_MANIFEST.json` reconciled** — 24 phantom `referenceScreenshot` paths nulled; `screenCount: 36` and the 12 validated frozen relationships preserved.
- **GC-1 … GC-14 recorded into 19 packs' `implementation-notes.md`.** Packs 30 and 31 previously carried **no** recorded conflict, so nothing had stopped a future agent building GC-2 and GC-3 — parent-facing per-dimension rating surfaces — exactly as drawn. **No PNG or HTML byte was altered.**
- **Both physical worktree directories removed** via `git worktree remove`; `git worktree list` now contains only `main`. **~1.59 GB reclaimed** (91,779 → 46,072 files; 3.28 → 1.69 GB).

### Explicitly NOT done

**Zero file deletions. Zero archival.** No application source, schema, DB, migration or test change. **PeakPalate retained in place, byte-identical** (`FOREIGN_REFERENCE_RETAINED_BY_OPERATOR`, OR-PA2-1) — its earlier removal proposal is withdrawn and its presence must never be reported as unresolved contamination. No hosted Supabase, no Vercel deploy, no GCP action, no GitHub remote, no push, no external provider call. **`FINAL_MVP_EXECUTION_PLAN.md` was NOT created.** The frozen demo was not modified.

### Verification

Census re-derived: **12 migrations · 26 tables · 34 functions · 29 policies.** UI tree: 36 governed screen packs · 37 reference packs — **kept as distinct scopes; Auth 04 was NOT promoted to screen 37.** Regression: `tsc` 0, `lint` 0, `build` 0 (17 routes), 5 portable suites 0. `integrated-route-security` and the four `.assertions.ts` recorded **`NOT_RUN`** with reasons — **no suite was reported as passing without a real runner, and no external or billable service was started to make one green.**

### Phase A2 commit record and post-review remediation

- **Pre-cleanup governance checkpoint:** `3930db9164d7f7e6353b00eccdf4dd31074610c2` — tag `final-mvp/pre-phase-a2-cleanup-2026-08-08`
- **Phase A2 completion commit:** `9491e4b8c3df1470a2607ad036a787d1d13d95bd` — tag `final-mvp/phase-a2-complete-2026-08-08`
- **Durable historical anchors:** `frozen/48h-backend-402b0b6` → `402b0b6f25828775bcc2a3d30f418b90b898aa80` · `frozen/48h-frontend-6762b5c` → `6762b5c59d41cdeaaaa0bc410a4fe28a1d31cebe`

**Two independent read-only adversarial reviewers were run after the cleanup.** Both returned the same top finding, independently. Their valid Critical/High findings were remediated before the completion commit:

- 🔴 **CRITICAL — `UI_PACK_MANIFEST.json` was corrupted by a PowerShell `ConvertTo-Json` round-trip.** It (a) double-encoded **12 em dashes** into `â€"` inside `screenshotValidation.classification` — i.e. in **exactly the 12 validated frozen relationships the cleanup claimed to preserve**; (b) prepended a **UTF-8 BOM that broke `JSON.parse` and `json.load`**, in the very file whose edit was justified by machine-consumer correctness; and (c) inflated it **50,399 → 79,373 bytes** by reindenting and `\u0026`-escaping every `figmaUrl`, destroying the diff's reviewability. **Repaired** by rebuilding from the byte-clean pre-cleanup snapshot with Node, applying only the intended edits: BOM absent, `JSON.parse` OK, **12 em dashes restored**, 0 mojibake, `screenCount: 36`, 12 non-null references, **0 claim-vs-disk mismatches**, 48,568 bytes.
- 🔴 **HIGH — BOMs on 11 `SCREENSHOT_REQUIRED.txt` files** from the same `-Encoding UTF8` fault. **Stripped; a whole-workspace sweep now reports ZERO BOM files.**
- 🔴 **HIGH — the record still declared the worktree removal unauthorized.** The most irreversible action of the phase was marked *"proposal only"* and *"NOT authorized"* in three places, with no Q-disposition — so a future session could not have told it was sanctioned. **Corrected**, and the mandated frozen SHAs were written into Authority Lock §31.11, closing a precondition that had been created and then left unwritten.
- 🔴 **HIGH — OD-4-superseded panel names were still the stated *"governing workflow"*** in `docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md`, reachable from a live unqualified instruction in `CLAUDE.md`. **Supersession banner added, and the `CLAUDE.md` pointer qualified.**
- 🔴 **HIGH — the teaching-team closure had not propagated.** The Authority Lock still carried it as the **HIGHEST**-urgency open action while the readiness plan called it closed. **Propagated to all sites, each carrying the "operator-reported, no workspace documentary evidence, none may be fabricated" caveat verbatim.**
- **MEDIUM** — PeakPalate still classified `FOREIGN_CONTAMINATED` in three places (corrected to `FOREIGN_REFERENCE_RETAINED_BY_OPERATOR`); the audit's §9.2 still described the renamed files as `.txt`; GCP instructions surviving outside the readiness plan's §6 banner scope; and two of that plan's factual claims falsified by later events. **All corrected.**

**What both reviewers could not break:** zero application source, schema, migration, fixture, config or test changes · all 12 migrations byte-identical · `git fsck` clean · both branches, all four tags and both bundles verified at both locations · full recursive hash diff showing **zero files lost** · the evidence estate **95/95 byte-identical** · frozen demo untouched · canonical PDFs untouched · **zero `.png` or `.html` bytes altered anywhere** · S-57 correctly refused · the 36/37 scope distinction defended · no fabricated evidence of any kind.

---

## 2026-08-08 — FINAL PRE-EXECUTION-PLAN GOVERNANCE SYNCHRONIZATION (Q-27, Q-28) — GOVERNANCE/DOCUMENTATION ONLY

**Scope.** A bounded, documentation-only run **after** Phase A2 acceptance, to land two standing operator rulings **before** `FINAL_MVP_EXECUTION_PLAN.md` is written. **The Execution Plan was NOT created. Phase B was NOT started.**

**Baseline verified before any edit (Gate 0).** Branch `main` · HEAD **`7cc592b7d720b36b009e0b853f62fdff37c5214a`** · `git status --porcelain` **empty** · tag `final-mvp/phase-a2-complete-2026-08-08` present · `git worktree list` shows **only `main`** · no application/schema/config/test change present.

**⚠️ A structural fact this run had to establish first, and which every future session needs:** the git repository is **`SDS Project Final (BEST Coach)/` only**. `FINAL_MVP_AUTHORITY_LOCK.md`, `FINAL_MVP_PHASE_A2_CLEANUP_MANIFEST.md` and the whole of `UI_REFERENCE_FINAL_MVP/` sit at the **workspace root, outside any repository** — they are untracked, uncommittable and **not recoverable by git**. Five of this run's eight edited documents are in that unversioned space. **A clean `git status` is not evidence that the governance corpus is safe.**

### Q-27 — Parent Dashboard: the nine-dimension ratings card is `DO_NOT_IMPLEMENT`

The operator ruled that the **complete "This Term's Skills" card** drawn in the ratified Parent Dashboard reference — title, all nine B.E.S.T. dimension labels, all rating bars, all rating-derived visual state, and **any replacement ratings visualization** — is **absent from the Final MVP**. Hiding, obscuring, emptying, collapsing, renaming or substituting is **non-compliance**. **Profile Details promotes upward** into the vacated main-column space; **no blank rectangle and no invented filler card**; the right-hand Calendar / Upcoming structure is unchanged.

**The ruling is a data boundary, not a styling choice.** The nine ratings must be excluded from Parent-facing DTOs, projections, RPC results, APIs, server actions and any client payload reachable by a Parent session. **Fetching them into the Parent client and hiding them with CSS is a violation**, on the same principle as `CLAUDE.md` §6's *"hiding an Edit button is not authorization"*.

**ID assignment.** `Q-1 … Q-26` were all consumed by Phase A2's Batch 7, so this run took the next free identifier, **Q-27**. **Batch 7's count of 26 was NOT amended** — Q-27 and Q-28 are registered in the cleanup manifest under a clearly-marked *continuation* heading stating they postdate the Phase A2 tag and are not Batch 7 items. **No existing ID was reused, renumbered or overwritten.**

**Relationship to GC-3 — elevated, not duplicated.** GC-3 already recorded this card as a governance conflict and said *do not build the bar chart*. Creating a second, parallel identifier for the same element would have produced exactly the conflicting-ID defect the run was told to avoid, so **Q-27 elevates and closes GC-3** rather than competing with it: GC-3 prohibited building the chart; Q-27 rules the whole card absent, fixes the layout consequence, extends the prohibition to the data layer, and settles how visual acceptance must read the gap.

**Visual acceptance now treats the card's absence as `EXPECTED / REQUIRED`** — never `MISSING IMPLEMENTATION`, never a `VISUAL REGRESSION`. Without that clause the ruling would have created a permanent false positive on every future review of screen 30.

**Explicitly unaffected. The full formula — "neither widened nor narrowed / A-038's bar stands / Q-27 grants Management nothing" — is carried in the five documents an implementer or future ruling would quote from** (Authority Lock §15.2, `CLAUDE.md` §6, `screen.md`, `implementation-notes.md`, this entry); `STATUS.md`, the cleanup manifest and the reconciliation plan carry the shorter *"Trainer/Management ratings unaffected"*, which is substantively equivalent and is not quotable against A-038 in either direction. The clause: **Trainer and Management rating AUTHORITY is unchanged — neither widened nor narrowed** (§9/§11/§13/§14, A-034/A-038 unchanged), which expressly includes **A-038's standing bar on Management reading raw per-dimension data** and leaves **GC-5/GC-6 live** — **Q-27 grants Management nothing**; attendance, observations, evidence, Trainer notes, Management review authority, the report lifecycle and AI authority are untouched; **OD-4 remains `Overview · Strengths · Areas for Development · Remarks`.** The Parent continues to receive the submitted canonical narrative under existing governance.

**Reference authority preserved.** **No authoritative visual bytes were altered** — not the Parent Dashboard PNG, not the HTML render, not the Figma source, not the Figma provenance. `reference/Parent - Dashboard/Parent - Dashboard.md:5, :11, :19` still describe the card. ⚠️ **That file was NOT annotated in place and carries no marker of any kind** — deliberately, because it is ratified visual authority. It is superseded on this point **only by external record**: Authority Lock §15 (conflict table, all three lines) and §15.2, plus this pack's `implementation-notes.md`. **An implementer who opens the `reference/` pack alone sees an unqualified active description**, which is exactly why the deviation is recorded in the pack's own notes and in `screen.md`. Pack 30 has **no** frozen `reference.png` — it is still `Deferred` — so no frozen relationship was involved.

**Carried forward.** `FINAL_MVP_EXECUTION_PLAN.md` **must** carry five Parent Dashboard acceptance criteria (reference-minus-card · Profile Details promoted · no replacement visualization · **projections proved rating-free at the data layer, not by DOM inspection** · Trainer/Management ratings proved unaffected). Recorded in Authority Lock §15.2; the plan itself was **not** created.

### Q-28 — structured UTF-8 write safeguard

Phase A2's own worst defect is now a standing rule rather than a war story. **Prohibited for structured/BOM-less-UTF-8 files:** PowerShell 5.1 `ConvertTo-Json` as a **round-trip editor** for an existing structured file, and `Set-Content -Encoding UTF8` / `Out-File -Encoding UTF8` where BOM-less UTF-8 is required — in Windows PowerShell 5.1 `UTF8` means UTF-8 **with** BOM and there is no BOM-less option on that parameter. **Required instead:** Node.js, a purpose-built script, or another writer **proven** to preserve exact UTF-8 bytes.

**Mandatory post-write verification** — parses (**for JSON, a real `JSON.parse` after the write**) · no BOM unless the format demands one · no mojibake · Unicode round-trips exactly · no double encoding · schema/shape intact · unexpected size inflation investigated · integrity hashes still valid. **Integrity-sensitive Unicode is compared by value or hash, never by eye** — a terminal that renders `â€"` and one that renders `—` can be showing the same corrupt bytes.

**Placement follows the operator's split:** the permanent rule is in **`CLAUDE.md` §11** (a new *"Writing structured / machine-readable files — encoding safety"* subsection immediately before Git discipline); the **incident narrative stays here**, in the Phase A2 entry above; `STATUS.md` carries only the execution-readiness relevance. A workspace-wide sweep confirmed **no active rule, script or document anywhere recommends the prohibited path** — the only other occurrences are this historical record and `UI_PACK_MANIFEST.json`'s own `repairNote`.

### Files changed — eight, all Markdown, all documentation

**Tracked — staged for this run's single checkpoint commit, `docs(governance): lock parent rating exclusion and utf8 write safeguard`, whose parent is `7cc592b`:** `CLAUDE.md` (§6 Q-27 parent data boundary; §11 Q-28 encoding safeguard) · `docs/progress/STATUS.md` · `docs/progress/BUILD_NOTES.md` (this entry). ⚠️ **These three were written BEFORE the commit was created** — the commit is the last action of the run. **If a later session finds them uncommitted, the run did not finish: commit them, never `git restore` them.**

**Untracked, outside any repository:** `FINAL_MVP_AUTHORITY_LOCK.md` (new **§15.2** — the canonical Q-27 instrument; §15 bullet and §15 table row reconciled) · `FINAL_MVP_PHASE_A2_CLEANUP_MANIFEST.md` (Q-ID continuation registry) · `UI_REFERENCE_FINAL_MVP/FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md` (§5 GC-3 row elevated; §7 screen-30 row) · `UI_REFERENCE_FINAL_MVP/30-parent-dashboard/screen.md` (§6 `DO_NOT_IMPLEMENT` block; §9 visual-acceptance clauses; §11 data-boundary clause) · `UI_REFERENCE_FINAL_MVP/30-parent-dashboard/implementation-notes.md` (the governed deviation record, appended — **no existing entry edited or deleted**, per that file's append-only rule).

### Verification

**Visual bytes:** all **74** `.png`/`.html` files under `UI_REFERENCE_FINAL_MVP/reference/` and the **12** frozen `reference.png` files were SHA-256-hashed **before and after** — **zero changed.** Parent Dashboard PNG `dfadca64…` and HTML `0a333980…` verified identical.

**Encoding (Q-28 applied to this very run):** every file touched was edited as Markdown through a BOM-less UTF-8 writer; **the prohibited PowerShell path was not used at any point.** Post-run sweep: **0 BOM** on every edited file, existing LF/CRLF conventions preserved, and **every JSON file in the workspace re-parsed with Node** — all parse, `UI_PACK_MANIFEST.json` still `screenCount: 36` with 12 non-null references and 0 mojibake.

**Scope:** `git diff --check` clean; the diff is **three `.md` files and nothing else**. **No application code, DTO, projection, RPC, schema, migration, fixture, test, AI prompt, `.env.local` or database row was changed; no migration run; no database mutated; no external provider called; no hosted Supabase action; no Vercel deployment; no GitHub remote created; nothing pushed; no tag created.** Frozen demo untouched · PeakPalate untouched · Phase A2 backup snapshots untouched · **`FINAL_MVP_EXECUTION_PLAN.md` NOT created.**

### Adversarial review and remediation

**One independent read-only reviewer was run after the edits**, per the run contract, and it diffed the four diffable unversioned files against the pre-run archive snapshot rather than trusting the run's self-report. **Verdict on the first pass: NOT SAFE TO ACCEPT AS WRITTEN.** The rulings themselves were found complete, internally consistent and unbroken on every governance axis attacked — **but the run's own continuity record was defective, and that was the finding that mattered.** Remediated before the commit:

- 🔴 **CRITICAL — `STATUS.md` asserted a checkpoint commit that did not yet exist and a working tree that was clean when it was dirty.** The rows were written before the commit and phrased in the past tense, and the replacement **struck out the previous entry's explicit `do not blanket-git restore them` warning**. A future session obeying §15.3's *"if reality and this file disagree, pause and reconcile"* would have found an unexplained dirty tree that `STATUS.md` called clean — and the natural reconciliation, `git restore`, would have **silently destroyed the entire tracked half of Q-27 and Q-28**. **Corrected:** the verification-scope note now states the snapshot was taken at run start with HEAD `7cc592b`, both rows say the commit is created at the **end** of the run and must be verified against `git`, and an explicit **"if these show as modified, DO NOT `git restore` them — commit them"** guard was restored.
- 🔴 **HIGH — this entry repeated the same false commit claim.** Corrected to *"staged for"*, with the same restore guard.
- 🔴 **HIGH — this entry claimed an adversarial review in the past tense before one had run**, with no reviewer, findings or outcome. That sentence has been replaced by this section, which records the actual result.
- 🔴 **HIGH — count contradiction in the one row whose purpose is naming what is unrecoverable.** `STATUS.md` said *"FOUR further edited documents sit outside any git repository"* and then listed **five**. Corrected to **FIVE**. *(This is the Q-25 defect class — a count that contradicts its own enumeration — recurring.)*
- **MEDIUM, accepted and fixed:** `reference/Parent - Dashboard.md:5` (*"current B.E.S.T. Ratings"*) was missing from the Authority Lock §15 conflict table while two other documents cited it — a remediation pass driven from the canonical register would not have seen it · this entry overclaimed that the reference text was *"marked superseded"* when **no marker was placed on that file at all** · Q-28's file-class list omitted plain-text and Markdown, so it would not have covered the **11 BOM-stamped `SCREENSHOT_REQUIRED.txt` files it cites as its own rationale** · *"Management may continue to use the governed nine-dimension assessment model"* was quotable against **A-038**, which bars Management from raw per-dimension data — reworded to *authority is unchanged, including A-038's bar* · Authority Lock **§28** (the section defining UI authority) carried no pointer to §15.2, so a reader entering through §28 would find the frame authoritative with no carve-out · the cleanup manifest's Execution-Plan deferral register did not name the Q-27 criteria · `STATUS.md`'s **"Next authorized action"** had been flipped from *"Await Operator authorization"* to naming an action, which a documentation-only run has no standing to do — restored.
- **LOW, recorded not fixed:** `FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md:454` still says packs 30/31 *"currently carry no recorded conflict"*, falsified by Q-24 and now by line 366 of the same file · the cleanup manifest's *"ALL 26 CLOSED"* heading now sits above 28 rows (the continuation fence at `:444` explains it) · Authority Lock §1 LOCK METADATA has no amendment log despite two post-creation amendments. **Left for a future authorized pass rather than widened into this run's scope.**

**What the reviewer attacked and could not break:** no active parent-ratings authorization survives anywhere in the corpus · the exclusion is stated as a projection/data-layer boundary in all six carriers, never as CSS-only · **OD-4 byte-identical to the pre-run snapshot** · **zero visual bytes altered** (74 `reference/` `.png`/`.html` + 12 frozen `reference.png`; nothing under `reference/` has an mtime newer than the 2026-08-06 bulk import) · no visual-acceptance checklist anywhere would flag the card's absence as a regression · Profile Details promote-upward recorded in **7** places including both files an implementer opens first · **no ID collision and no falsified registry** — `Q-1 … Q-26` byte-identical, the *"exactly 26 Q-items"* claim unmodified, Q-27↔GC-3 coherent as elevate-and-close with no parallel identifier · **no history rewritten** — all **five** unversioned files were **additive or superset-in-place**: three lines were **rewritten, not appended** (`screen.md`'s "Component composition" acceptance item, the Authority Lock §15 conflict-table row, the reconciliation plan's GC-3 row), and each replacement is a **strict superset of its predecessor** — **no existing content was removed anywhere**. Those three are disclosed as section edits in "Files changed" above. `implementation-notes.md`'s **append-only rule is honoured strictly** — zero existing lines touched, verified by diff against the pre-run archive snapshot. Every existing strikethrough retained. *(An earlier draft of this entry said "all four diffable unversioned files purely additive" — wrong on both the count and the shape, corrected here rather than left standing.)* · no code, schema, config, test, fixture or migration change · all JSON parses, 0 BOM, no CRLF introduced, `screen.md`'s 3 pre-existing mojibake sequences **not worsened** · Q-28 has no conflicting policy and no surviving recommender of the prohibited path.

**A focused read-only re-review was run after these corrections.**

---

## 2026-08-08 — REPOSITORY-BOUNDARY NORMALIZATION: active governance + UI authority folded into the main repository — GOVERNANCE/PATH ONLY

**Scope.** Fold the ACTIVE Final MVP governance and UI authority estate from the workspace root **into** `SDS Project Final (BEST Coach)/`, so future execution runs against **one versioned canonical filesystem boundary**. **No Phase B. `FINAL_MVP_EXECUTION_PLAN.md` NOT created. The known `/reference/` instruction-layer gaps were deliberately NOT repaired** — that is the next run.

**Baseline verified before writing.** `main` · HEAD **`d6fec445f004aa005188c61d391e4aec65f08e30`** · tree clean · 0 remotes · 1 worktree · 4 tags · frozen demo `8d4acf4…` clean · Q-27 and Q-28 present · no `FINAL_MVP_EXECUTION_PLAN.md` · PeakPalate 58,387,212 B untouched.

### ⚠️ This entry SUPERSEDES the structural claim recorded above at the Q-27/Q-28 run

That entry stated: *"the git repository is `SDS Project Final (BEST Coach)/` only … `FINAL_MVP_AUTHORITY_LOCK.md` … and the whole of `UI_REFERENCE_FINAL_MVP/` sit at the workspace root, outside any repository — untracked, uncommittable and not recoverable by git … A clean `git status` is not evidence that the governance corpus is safe."* **It was true when written and is left standing unedited, per the append-only rule.** It is **no longer true**: this run is precisely the action that ended it. **A clean `git status` now DOES cover the governance corpus.**

### What moved

Six documents to the repository root — `FINAL_MVP_AUTHORITY_LOCK.md` · `FINAL_MVP_OD4_REPORT_SEMANTICS_RULING.md` · `FINAL_MVP_PHASE_A_GOVERNANCE_RECONCILIATION.md` · `FINAL_MVP_PHASE_A2_WORKSPACE_AUDIT.md` · `FINAL_MVP_PHASE_A2_CLEANUP_MANIFEST.md` · `FINAL_MVP_SUBMISSION_READINESS_PLAN.md` — plus the **complete `UI_REFERENCE_FINAL_MVP/` tree: 343 files, 94 directories, 19,602,695 B.** Names and relative structure preserved exactly; no reorganized `docs/governance/` hierarchy was invented, so citation paths did not churn.

### What deliberately did NOT move, and why

A read-only inventory enumerated **all 18 workspace-root entries** and recommended **zero additions** to the approved set. `FINAL_SUBMISSION_BRIEF/` (the two canonical PDFs — §31.1 *"never edited, never moved"*) · `SDS Project Sprint 2/` (frozen demo, own `.git`; nesting it would corrupt both repos) · `00-PeakPalate-Master.mp4` (Q-2 `KEEP_IN_PLACE`, barred from this repo) · `governance-source/` (**A-055 non-authoritative mirror, and a hash-assertion target whose path must stay stable — moving it would break the very assertions that justify keeping it**) · `BEST_COACH_DEMO_TO_MVP_MIGRATION_TRACKER.md` (historical; its `D-1…D-317` register is **already** tracked here as `docs/progress/DEMO_TO_MVP_MIGRATION.md`) · `complete mvp screens compiled figma list.txt` (superseded; node data already in `docs/plan/`) · the three `_*-evidence/` trees (historical; committing them is a **gated** Phase B rework item behind a secret/redaction/third-party scan, not an authority move) · `worktrees/` (**verified empty — 0 files**). All backups stayed out.

### Method — copy, verify, commit, only then remove

**Gate 2 — preservation, both targets, before touching anything.** `2026-08-08_PRE_REPOSITORY_BOUNDARY_NORMALIZATION` written to the SUTD OneDrive archive **and** `D:\B.E.S.T-Coach-Archive\` (independent physical devices). Refused-to-overwrite guard armed. **343/343 UI files + 6/6 governance files SHA-256 verified in each — PASS/PASS.**

**Gate 3 — pre-move census** (hashes, never mtimes): 37 `/reference/` packs · 111 `/reference/` files (37 PNG / 37 HTML / 37 MD) · 36 governed packs / 120 files · 12 local frozen `reference.png` · 24 UI root files · 88 `_checkpoint-evidence` files. Full SHA-256 manifest retained.

**Gate 4 — copy first, delete never-before-verified.** Copied into the repo with the originals left in place; **343/343 + 6/6 byte-identical**, zero missing, zero extra. `git status --ignored` confirmed **nothing** silently excluded — the `.gitignore` rules are root-anchored (`/node_modules`, `/.next/`, `/build`, `/out/`) and none collides. All 349 files stageable.

**Gates 8–10 — the removal was gated on proof, not on confidence:** byte-identity PASS → active path rewrite → commit → `git show <commit>:<path>` retrieval → *then* the workspace-root originals were removed.

### Path-reference census — the part that mattered

A read-only census classified **~321 hits**. The critical distinction was between references that merely **name** a file (≈290 — these keep working, several become *more* correct as repo-relative) and those that assert its **location** (**31 — these became false**). **~35 correctly-fenced historical statements and ~12 provenance records were deliberately left untouched.**

**🔴 One real functional break, found only because the census read code and not just prose.** `scripts/physical-test/run-f17.mjs:206-212` resolved its evidence directory as `REPO_ROOT/../UI_REFERENCE_FINAL_MVP/_checkpoint-evidence/F17`. Post-move that `'..'` would not have crashed — `mkdirSync(…, {recursive:true})` would have **silently created a phantom `UI_REFERENCE_FINAL_MVP/` back at the workspace root** and written the F17 gate ledger and screenshots into it, orphaned from the real pack and perfectly positioned to be mistaken for authority by a later agent. **The `'..'` segment was removed** and the two prose strings describing the pack as "outside this repository" / "the external pack" corrected.

**🟠 A second path was already broken before this run.** `tests/frontend/auth-reference-fidelity.assertions.ts:24` used `resolve(process.cwd(), "..", "..", …)`, a form written for a 48H **worktree** cwd — and both worktrees were physically removed on 2026-08-08, so it had been resolving to a non-existent directory since then. Corrected to the repo-root form and its two stale comments fixed. It remains `NOT_RUN` (no runner) and fails closed, so nothing had been silently passing.

**Also corrected because they would have actively misdirected a future run:** `FINAL_MVP_PHASE_A2_CLEANUP_MANIFEST.md`'s backup instruction, which post-move would have **excluded the entire governance corpus it exists to protect** — the exact inversion of its intent · `CLAUDE.md`'s *"outside every git repository … treat every edit as unbackable"* warning, now wholly reversed · `STATUS.md`'s Working-tree row, every clause of which was falsified · Authority Lock §31.12a, whose **rationale** ("none is recoverable after deletion") collapsed while its **prohibition** is unchanged and absolute · `FINAL_MVP_SUBMISSION_READINESS_PLAN.md` §8.3 item 3, where the "a marker cloning the repo gets zero evidence" conclusion is now half-wrong — **and where the risk inverted: the tree is committable today, so the unmet secret/redaction/third-party precondition is MORE urgent, not less** · the F17 operator README, which told the operator nothing there is committed.

### What was deliberately NOT changed

`UI_PACK_MANIFEST.json` was **not edited** — it contains **zero** path strings, so the move required nothing (verified: parses, `screenCount: 36`, no BOM, 0 mojibake, 12 em dashes, 48,568 B unchanged). Q-28's prohibition on the PowerShell 5.1 structured-write path was honoured; every edit went through a BOM-less writer. `docs/progress/BUILD_NOTES.md`'s historical entries were **appended to, never rewritten**. No `/reference/` visual byte was touched. **The 24-pack instruction-layer gaps are untouched and still open.**

### Verification

**UI integrity in the repo copy:** 36 governed packs · 37 `/reference/` packs · 111 `/reference/` files (37/37/37) · **12/12 frozen `reference.png` still SHA-match their `/reference/` counterpart** · Q-27 carriers present in pack 30. **Regression: `npx tsc --noEmit` 0 · `npm run lint` 0 · `npm run build` 0 with 17 routes — unchanged.** **Secrets sweep over all 349 moved files: zero `.env`/`.pem`/key files, zero credential-like content** (the `service_role` matches are governance prose asserting it holds *zero* privileges), zero media/archives, zero SPORTSTER material — only governance records *about* the incident. No DB, migration, provider, hosted-Supabase, Vercel, remote or push action of any kind.

### Adversarial review — two independent read-only reviewers, and what they changed

**Reviewer 2 (technical/integrity) returned ALL TEN of its assigned claims DISPROVEN and ZERO Critical.** Working from the two archive snapshots as independent oracles — which it first proved byte-identical to each other — and comparing against the **committed blobs** rather than the working tree (immune to autocrlf), it confirmed: **340/343 UI files byte-identical**, exactly the 6 documented edits and no others · 37 packs / 111 reference files / 36 governed packs / 12 local PNG · **12/12 frozen PNG full-SHA match**, including all three non-name-derivable mappings · manifest byte-identical to backup at 48,568 B, `screenCount: 36`, 12 em dashes, no BOM · all 17 tracked JSON parse · **zero BOM and zero CR in every committed blob** · `git ls-files` = 343, all retrievable, all 118 PNG blobs byte-equal to disk, nothing silently gitignored · `.env.local` untracked and **never present in history** (0 objects) · build 0/0/0. It also verified the two code fixes by **executing the resolution** rather than reading it, and confirmed via `tsc --listFiles` that the assertions file is genuinely in the tsc program, so "tsc 0" actually proves it type-checks.

**Reviewer 1 (authority/duplication) confirmed the structure but found the path census had leaked five current-operational location assertions.** Its HIGH is the one that mattered:

- 🔴 **HIGH — `FINAL_MVP_SUBMISSION_READINESS_PLAN.md:311`, the GitHub Classroom row, still said `UI_REFERENCE_FINAL_MVP/` "lives outside the repo — pushing `main` publishes none of them."** The consequence had **inverted**: a push now publishes all 343 files including the 88 `_checkpoint-evidence` artefacts. An agent executing that row would have pushed the UI estate unscanned *while believing it hadn't shipped*. The row sits outside every scope marker in the document's own currency notice, which is why the census missed it. **Corrected, and the unmet secret/redaction precondition re-pointed from the commit to the push.**
- **MEDIUM ×4, all fixed:** Authority Lock §2.3 `:78` still routed readers to the workspace root for the OD-4 instrument **while §15.1 was corrected for the identical fact** — being right in one place and wrong in another makes the historical fence unreliable rather than authoritative · `FINAL_MVP_PHASE_A_GOVERNANCE_RECONCILIATION.md:488` (**G-26 — a *governing* entry, not historical**) same defect · `FINAL_MVP_PHASE_A2_WORKSPACE_AUDIT.md:404` asserted "not one of the 95 evidence files is in any git repository" when **88 of them now are** · and a **dead contamination claim this run had carried forward**: the readiness plan said AUTH-01's `SCREENSHOT_REQUIRED.txt` "currently contains unrelated third-party coursework". **Verified directly by reading the file — it is the Phase A2 reconstruction plus its `FILE RECONSTRUCTION NOTICE`, and a `SPORTSTER` scan returns zero.** R1 is discharged; the claim is **retracted rather than re-published**.
- **Both reviewers independently confirmed** Q-27 and Q-28 intact, the two canonical PDFs untouched (exactly 2 PDFs in the whole workspace, neither tracked), `governance-source/` undisturbed with its asserted hash `64d54aa2…` still matching D-211, and `BUILD_NOTES.md` append-only (`48 0` — zero deletions).

**Structural fix beyond the literal findings.** Three moved documents — the OD-4 ruling, the Phase A2 workspace audit and the Phase A reconciliation — were byte-identical after the move and carried **no boundary banner**, so a reader entering them directly was protected only by an *external* fence in `CLAUDE.md` §9.1. Each now carries its own 📍 LOCATION banner stating what moved, what did not, and that its "(workspace root)" phrasings are historical.

**Recorded, not fixed — carried to the next run:**

- 🟡 **`.gitattributes` is absent and `core.autocrlf=true`.** The object store is clean (zero CR in any blob), but on a fresh Windows clone `UI_PACK_MANIFEST.json` checks out CRLF at **49,673 B**, breaking the pinned "48,568 B / sha256 `48e110f4…`" invariant this project asserts in several places. **That invariant is machine-local, not clone-reproducible.** Adding `.gitattributes` would renormalize the working tree — including 23 files with pre-existing mixed EOLs that the move preserved exactly — so it is deliberately **not** done inside a boundary-normalization run.
- Two committed evidence JSONs (`_checkpoint-evidence/F-04/f04-evidence.json`, `F-14/f14-evidence.json`) still record absolute pre-move workspace-root paths. **Inert** — no code reads them — and they are historical evidence, so they are left as written.
- **Fixed after Reviewer 2 flagged it:** `auth-reference-fidelity.assertions.ts`'s replacement `PACK_ROOT` was **cwd-relative — the same failure class as the bug it replaced**, correct from the repo root and silently wrong elsewhere. Re-derived **module-relative** from `import.meta.url` and proven to resolve correctly from a foreign cwd. `run-f17.mjs` already used the robust module-relative form.

**Two corrections to this run's own records.** The migration commit message (`f9a0d56`) says location assertions were corrected in *"four files inside the UI tree"*; the byte-diff shows **three** — the commit message is immutable and history is not rewritten, so the correction is recorded here. And the reviewer brief for the frozen-PNG check listed `02-trainer-my-classes → "Trainer -  My Classes"` among the 12 frozen pairs; **pack 02 has no local `reference.png`** and is not one of the 12. The double-space folder name is real, but it is a mapping curiosity, not a frozen relationship. The 12 are 05 · 06 · 07 · 08 · 10 · 19 · 29 · 32 · 33 · AUTH-01 · AUTH-02 · AUTH-03.

**After remediation:** `tsc` 0 · `lint` 0 · no BOM, no mojibake, trailing newline present on all five remediated documents · `git diff --check` exit 0.

---

## 2026-08-08 — FINAL UI REFERENCE AUTHORITY SYNCHRONIZATION — GOVERNANCE / UI METADATA ONLY

**Scope.** Close the four `/reference/` instruction-layer gaps the read-only mapping audit found, and one Git reproducibility defect. **The mapping itself was never broken** — 36/36 resolved before this run. What was broken was every document that should have *told* an agent so. **No Phase B. `FINAL_MVP_EXECUTION_PLAN.md` not created. No application change.**

**Recovery note.** This run was interrupted at its `.gitattributes` write and resumed. Reconstruction found HEAD still `459b1b3`, working tree **clean**, no commits, no `.gitattributes`, no disposable clone — **the interrupted run had written nothing**. Gates 0 and 1 (both read-only) were re-verified rather than assumed, and work resumed at the first incomplete gate. No partial edit needed repair.

### The defect, stated plainly

Authority Lock §28.1 has said since Phase A2 that `UI_REFERENCE_FINAL_MVP/reference/` is the Final MVP visual authority. **That ruling had never propagated to the instruction layer.** A fresh agent opening screen 30 would have been told, three separate times, that a ratified frame it already had did not exist:

1. `screen.md` §4 ranked *"This folder's frozen `reference.png`"* **first** — and for 24 of 36 packs that file does not exist, so rank 1 dangled and rank 2 was live Figma. **Zero of 36 `screen.md` mentioned `/reference/` at all.**
2. `SCREEN_INDEX.md` asserted **24 times**, verbatim, *"Not started - no frozen reference exists"* — an affirmative false negative, not merely an omission.
3. All **24** of those packs' `SCREENSHOT_REQUIRED.txt` ordered *"Export the exact node-specific Figma frame … save it in this folder as reference.png"*. **The 12 packs that did NOT need the pointer were the only ones that had it** — the instruction existed exactly where it was redundant and was absent exactly where it was load-bearing.

### What changed

**Visual ladder reconciled in every carrier** — 36/36 `screen.md`, `GLOBAL_UI_RULES.md` §1.1, `CLAUDE.md` §1 / §7 (A-045) / new **§7.4**, and Authority Lock **§28.1a**. New rank order: **`/reference/<mapped pack>/` → optional pack-local frozen duplicate → node-specific Figma (only where no ratified asset exists) → existing implementation.** Each `screen.md` names *its own* counterpart explicitly and states whether it carries a local duplicate. The post-freeze-drift protection is preserved and strengthened: **a live re-export never outranks a ratified asset, and must not be run merely to manufacture a local duplicate.**

**24/24 `SCREENSHOT_REQUIRED.txt` corrected** — each now opens with `NO EXPORT IS REQUIRED`, gives the exact `/reference/` pack, frame, HTML and notes paths, states that a missing local copy is not a missing reference, and **retains the superseded instruction verbatim under an explicit history fence**. Figma node, URL, file key, role, priority and route are untouched.

**The authoritative 36-row mapping is published twice.** Human-readable in `SCREEN_INDEX.md`; machine-readable as **`currentReferencePack`** (plus `currentReferenceFrame`) on every screen entry in `UI_PACK_MANIFEST.json`.

**Manifest decision and its justification.** Gate 1 proved **zero runtime consumers** — no `.ts`, `.tsx`, `.mjs`, `.js`, `.json` or `package.json` reference reads the file — so an additive field cannot break a consumer. `referenceScreenshot` was **not repurposed**: it still means *optional pack-local frozen duplicate*, and remains `"reference.png"` on 12 and `null` on 24. A structural diff proves the document is **semantically identical after stripping only the new fields**, all **12 frozen PNG SHA pins preserved**, `screenCount: 36`, **em dashes 12 → 12** (exact Unicode round-trip), no BOM, no mojibake, `JSON.parse` PASS. Written with Node per **Q-28**; the prohibited PowerShell path was not used.

**Three irregular names, recorded so they are never guessed again:** `32-parent-reports` → `Parent - Report` (**singular**) · `AUTH-02-management-login` → `Auth 02 - **Mangement** - Login` (**misspelled on disk — deliberately not corrected**) · `02-trainer-my-classes` → `Trainer -  My Classes` (**two spaces**). Renaming a ratified pack folder is not authorized, which is exactly why an explicit mapping had to exist.

**Forgot Password unchanged:** `reference/Auth 04 - All Users - Forgot Password/` remains `EXTRA_REFERENCE_ONLY_AUTH_FLOW_PACK` — no governed counterpart, no screen ID, no invented node, **not screen 37** (Q-4). Stated in `SCREEN_INDEX.md`, `CLAUDE.md` §7.4 and Authority Lock §28.1a.

**Two stale records closed:** the reconciliation plan's *"packs 30 and 31 currently carry no recorded conflict"* (both now carry GC-3 / GC-2 under Q-24; pack 30's was elevated to Q-27) and **R6** in the UI cleanup manifest (the 24 phantom `referenceScreenshot` paths, nulled under Q-16 — and the entry's framing was itself corrected, since those screens were never without a *reference*, only without a *duplicate*).

### `.gitattributes` — narrow by audit, not by caution

`core.autocrlf=true` with no `.gitattributes` meant the manifest's byte invariant was **machine-local, not clone-reproducible**. Exactly **one** path is pinned, `UI_REFERENCE_FINAL_MVP/UI_PACK_MANIFEST.json -text`. Three classes were examined and **deliberately excluded**:

- the **119 tracked PNGs** are already `-text` by Git's own detection, so every frozen-image SHA contract is inherently safe;
- **`supabase/migrations/*.sql`** carry a real byte-identity assertion (T-C3-S2 / T-CT-S4 / T-ASM-33) — **but those suites already normalize CRLF on both sides** (`c3-static.mjs:29`, `ct-static.mjs:33`, and `asm-static.mjs`'s `norm()`, whose comment names `core.autocrlf` outright). **6 of the 12 already sit CRLF in the worktree and pass.** Pinning them would have rewritten six files for zero gain;
- **`_checkpoint-evidence/*.json`** are historical records with no consumer — **an audit hash is not a checkout-byte contract.**

**`git add --renormalize` was NOT run.** Zero-churn proven: introducing the file left `git status` showing only the new untracked `.gitattributes`, no tracked file modified, and the **23 pre-existing mixed-EOL files still 23**.

### Verification

**74/74** `/reference/` PNG+HTML SHA-256 identical to the pre-run census · **12/12** frozen local copies still match their mapped counterpart · **36/36** governed packs map uniquely, exactly one `/reference/` pack (Auth 04) intentionally unmapped, none claimed twice · **0** false "no frozen reference" rows (was 24) · **0** stale live-Figma instructions (was 24). **Encoding proven against HEAD rather than asserted:** mojibake **107 → 107** across the 72 pack files (all pre-existing, none introduced), missing trailing newlines **71 → 47** (improved), and **no file made worse**. `SCREEN_INDEX.md` is a CRLF document — the inserted block was emitted in its own EOL convention, leaving it **152 CRLF / 0 bare LF** rather than mixed.

### Adversarial review — and the finding that mattered

**Reviewer 2 (Git / encoding / structured metadata) returned all twelve assigned hypotheses DISPROVEN, zero Critical**, working from its own disposable `autocrlf=true` clone and comparing **committed blobs** rather than the working tree. It independently confirmed: `.gitattributes` holds **exactly one** non-comment line, no wildcard · `--stat` and `--ignore-all-space --stat` **byte-identical** across all 70 changed files, and **zero CR bytes in either revision** — so no line-ending-only rewrite exists · the **23** mixed-EOL files appear nowhere in the diff · manifest **55,434 B / `598c714a…`** in a fresh clone, matching the committed blob, **with non-vacuity proven** (`CLAUDE.md` CR=859, `SCREEN_INDEX.md` CR=152 in that same clone) · `referenceScreenshot` **not repurposed** (12/24, identical to `459b1b3`) · 12 `screenshotValidation.sha256` pins unchanged · a deep-diff showing **one** semantic delta, the additive note key · **zero BOMs**, mojibake **131 → 131** across all tracked text · **120/120** declared manifest paths resolve · **12/12** frozen hashes · `git diff 459b1b3 f6891d9 -- .../reference/` **empty** · tsc/lint/build and all six portable suites **exit 0**, with **T-ASM-33, T-CT-S4 and T-C3-S2 all passing explicitly** — the migration suites that would have broken had the EOL policy been wrong.

**Reviewer 1 (UI authority) found the synchronization was genuinely incomplete, and it was right.** The run reconciled five carriers and left a dozen others contradicting them:

- 🔴 **CRITICAL — the superseded rank-1 ladder survived, unstruck, in ~10 places including the Authority Lock itself.** `FINAL_MVP_AUTHORITY_LOCK.md` **§2.4** — 930 lines before the §28.1a note claiming reconciliation — still ranked *"frozen `reference.png`"* first, so **the lock contradicted itself**. Also `CLAUDE.md:55`, `FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md:15` and `:29` (the latter ranking the local PNG *above the `/reference/` HTML render*), `README.md:60`, `IMPLEMENTATION_WORKFLOW.md:77`, `FRONTEND_RECONSTRUCTION_PLAN.md:57`, `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md:19` and `docs/plan/PHYSICAL_TEST_SLICE_48H.md:245`. **All corrected by annotate-never-delete.**
- 🔴 **CRITICAL — a document flatly inverted the ruling.** `FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md:54` stated the 24 deferred screens have *"no frozen reference at all"*, that `/reference/` has *"no rank at all on the visual ladder"*, and that *"visual reconciliation of a deferred screen is therefore not currently possible"* — a hard block on 24 screens that all have a ratified frame. Corrected, with the half that **remains true** (functional rank 5) preserved rather than swept away. Same for `:448` (*"blocked twice over"* → blocked once) and `README.md:52`.
- 🔴 **CRITICAL — `/reference/` appeared ZERO times in four load-bearing process documents.** `README.md`, `IMPLEMENTATION_WORKFLOW.md`, `SCREENSHOT_CHECKLIST.md`, `FRONTEND_RECONSTRUCTION_PLAN.md`. Worst of these: `IMPLEMENTATION_WORKFLOW.md` steps 1–3 make a live Figma export the **mandatory first action** and instruct *"if the file is missing … stop and report"* — a hard stop on 24 screens that are fully implementable. All four now carry the reconciled ladder, and the workflow's steps 1–3 are explicitly superseded with instructions to begin at step 4.
- 🟠 **HIGH — `SCREENSHOT_CHECKLIST.md:7`** still ordered an export for all 36 from the pack root, unfenced. Corrected.
- 🟠 **HIGH — asymmetric fencing.** The run fenced the 24 stale files and left the **12 core packs** opening with the same unfenced export order it had just condemned. **All 12 now carry the same fence.**
- 🟠 **HIGH — all 36 `screen.md` §9 still gated visual acceptance on a pack-local `reference.png`.** For the 24 that deliberately hold none, §3/§4/§12 said the absence was not a gap while §9 required presence. Fixed on the 24; on the 12 the item is `- [x]`, already satisfied and factually true, so it never gated anything.

**Two `.gitattributes` corrections from Reviewer 2:** the comment said **119** tracked PNGs — the true count is **118** (the substance held: all 118 are `-text`). And a genuine **pre-existing** limit is now recorded rather than left to surprise someone: **`core.longpaths` is unset**, and the longest tracked path is 113 chars, so a clone into a root deeper than ~145 chars fails checkout with *"Filename too long"*. Not fixed — it is a clone-side setting, not a repository byte invariant.

**A-045 itself was deliberately NOT edited.** `docs/spec/…Amendment_005.md` is ratified specification text; rewriting it needs an amendment or an explicit operator ruling. The reconciliation is recorded where it belongs — **Authority Lock §2.4**, which states plainly that the amendment is unedited and superseded **on this one point only**, with A-045's two-ladder separation and its "a frame is never authoritative for…" clause left fully intact. **Flagged for the operator: the amendment text still carries the old ladder.**

**Recorded, not fixed:** 36 `screen.md` still lack a trailing newline (pre-existing at `459b1b3`; the 24 `.txt` files gained one, so the commit improved 71 → 47 without regressing any file) · superseded code comments carry the old ladder in `app/globals.css`, `lib/frontend/design/tokens.ts` and 9 `features/**` files — **left untouched deliberately**, since this run is not authorized to modify application files, and a comment edit there would have put `app/` and `features/` into a governance-only diff. ✅ **Both residuals were closed in the run below.**

---

## 2026-08-08 — FINAL PRE-EXECUTION AUTHORITY SUPERSESSION CLEANUP — AMENDMENT 007 (A-056) + COMMENT-ONLY SOURCE CORRECTIONS

**Scope.** Close the two residual stale-authority surfaces the previous run recorded but was not authorized to touch: **A-045's obsolete visual ladder in ratified specification text**, and the **stale ladder comments in application source**. Also record — never apply — the Windows `core.longpaths` clone prerequisite. **No Phase B. `FINAL_MVP_EXECUTION_PLAN.md` NOT created.**

**Baseline verified before writing.** `main` · HEAD **`c05d6040510d920937428c3e2be4062cadbcc3ab`** · tree clean · 0 remotes · 1 worktree · 4 tags · 36 governed packs · 37 `/reference/` packs · 111 reference files · 12 pack-local `reference.png` · Q-27 and Q-28 intact · no execution plan.

### Ruling 1 — A-045's visual ladder superseded BY AMENDMENT, not by rewriting it

**The problem was structural, not cosmetic.** Every active carrier had already been reconciled to `/reference/`-first, but `docs/spec/…Amendment_005.md` §A-045 is **ratified specification text** and still enumerated the old three-rank ladder — *frozen `reference.png` → node-specific Figma → existing implementation*. A fresh agent reading the specification would find that ordering presented as current authority, and it ranks a file that **24 of the 36 governed packs do not have** above the ratified frame they all do. The Authority Lock's §2.4 was carrying the reconciliation on its own prose, which is weaker than the instrument it was contradicting.

**Resolved through the amendment mechanism.** `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_007.md` — **Amendment 007, clause `A-056`**, ratified 2026-08-08. **Clause-continuity checked on disk:** the highest committed clause is **A-055** (Amendment 006) and A-056 is unused anywhere in the tree, so **A-056 / Amendment 007 is the correct next identifier**. No instrument was renumbered, edited or overwritten; **Amendments 001–006 remain byte-for-byte unchanged**, and **A-045's original text stands unedited in Amendment 005**.

**Scope of the supersession is deliberately narrow — one enumerated list.** A-056 supersedes *only* `Amendment_005.md:136-140`. **A-045 is not obsolete**: its two-ladder separation, its functional/security/privacy ladder, *Figma never bypasses governance*, its frame-versus-ratified-rule rule and its preservation of **A-022.2** and **A-013** are all **expressly preserved and remain binding**. Citing A-045 as active authority stays correct for everything except the ordering. No Amendment 001/002/003/004/006 clause is named, and no other Amendment 005 clause is named.

**The ratified model A-056 states** is three roles rather than one flat ladder: `UI_REFERENCE_FINAL_MVP/reference/<mapped pack>/` is the **primary current visual source**; the **governed implementation pack** holds implementation, governance and provenance authority and **is never obsolete merely because its visual snapshot lives elsewhere**; a pack-local `reference.png` is an **optional frozen duplicate and integrity evidence** (12 of 36), never the ranking authority. A-056 grants `reference/` **no functional rank** — its Markdown stays functional rank 5. And it states explicitly that a higher-ranked functional/product/privacy ruling **may override a specific visible element without invalidating the rest of the pack**, with **Q-27** as the canonical worked example: `reference/Parent - Dashboard/` remains the current visual source **and** the "This Term's Skills" card is `DO_NOT_IMPLEMENT`, both true at once.

**Propagated to:** `FINAL_MVP_AUTHORITY_LOCK.md` §2.4 (heading + the struck ladder now cites A-056 as the superseding instrument, replacing the earlier claim that *the lock itself* carried the reconciliation) · `CLAUDE.md` §1 amendment register (new Amendment 007 row), §7 ladder citation, §7.4 (now backed by a ratified amendment rather than by the file alone) · `STATUS.md` · this entry.

### Ruling 2 — stale ladder comments in application source

**Re-scanned rather than trusting the prior list.** The exact current set was **11 files**: `app/globals.css`, `lib/frontend/design/tokens.ts`, and **9** under `features/**` (management ×2, parent ×2, trainer ×5). Each carried *"Visual authority (Amendment 005 A-045): frozen reference.png → node-specific Figma → existing implementation"*. All 11 now name `/reference/<mapped pack>/` as current, describe the pack-local copy as an optional SHA-identical duplicate, and point to `CLAUDE.md` §7.4 / `FINAL_MVP_AUTHORITY_LOCK.md` §2.4 instead of restating governance inline.

**Deliberately NOT changed:** the *"Figma never bypasses governance"* sentences — those are **A-045 provisions A-056 preserves**, so they were kept and re-attributed (`A-045, preserved by A-056`) rather than deleted. Also untouched: the many accurate references to "the frozen references" as the design source F1 was derived from in `components/ui/*`, `tests/**` and `server/**` — those describe the 12 frozen screenshots as historical design input, not as the authority ladder, and are correct. One further stale **location** phrase was fixed in `tokens.ts` ("external UI reference pack" → "in-repository UI reference pack").

**Comment-only, proven rather than asserted.** A language-aware projection stripped `//`, `/* */` and CSS comments while preserving string, template and regex literals, then collapsed whitespace so comment removal could not shift the token stream, and SHA-256'd the result for all 11 files **before and after**. **11/11 code-identical, 0 changed.** Backed by `tsc --noEmit` 0, `eslint` 0 and `next build` 0.

### `core.longpaths` — recorded, not applied

Verified **read-only**: `core.longpaths` is **unset**, longest tracked path **113 characters** — the reviewer independently measured it and identified the file (`UI_REFERENCE_FINAL_MVP/reference/Auth 04 - All Users - Forgot Password/Auth 04 - All Users - Forgot Password.html`). **No `git config` command was run and the operator's Git configuration was not touched** (confirmed unset at *every* scope). Recorded as an Execution-Plan prerequisite in `CLAUDE.md` §9.1 and the cleanup manifest's deferral register, framed as **a clone-side environment setting, never a repository invariant**, explicitly **not a current blocker**, and with a standing rule that a session must never change the operator's Git config to work around it.

### Adversarial review and remediation

**One independent read-only reviewer ran after the edits.** It disproved nine of the ten hypotheses it was set, and it **verified the comment-only claim by its own method rather than trusting this run's** — discarding its first attempt (a raw TypeScript scanner that mis-handles JSX text containing apostrophes, yielding 6 false positives) and re-running with `ts.transpileModule({removeComments:true})` on the HEAD blob versus the worktree file: **10/10 TS/TSX code-identical**, and `app/globals.css` comment-stripped identical at 4,713 bytes with comment-block count 18 → 18. It independently confirmed clause continuity (ceiling A-055, A-056 unused), Q-27 occurrence counts unchanged with §15.2 untouched, `/reference/` authority **raised not weakened**, `core.longpaths` unset at every scope, the 36/37 estate and `UI_PACK_MANIFEST.json` hash unchanged, and tsc/lint/build 0/0/0.

**Remediated before commit:**

- 🔴 **HIGH — Amendment 007's ratification provenance was unverifiable from the tree.** The document declares *"Ratified by operator"* and inserts itself **above the Authority Lock and `CLAUDE.md`** on the §1 ladder, yet the only in-repo evidence was circular — the amendment's own text plus this run's own continuity entries. `CLAUDE.md` §14.0/§14.7 are explicit that **a Claude session may not ratify**. **Fixed by recording the provenance explicitly:** the amendment now names the bounded operator run instruction that directed its creation, states plainly that *the authoring session did not ratify it and has no authority to*, and adds a **falsification clause** — if that instruction is ever found not to have covered this, **A-056 is void and A-045's ordering stands**. The reviewer was right that this is the one artefact where the distinction is load-bearing.
- 🟡 **MEDIUM — `STATUS.md` contradicted itself.** Line 265 still presented the old ladder as *"Visual authority ratified (A-045)"* with no strikethrough, in the canonical CURRENT STATUS file — while a cell this run edited claimed the ladder *"now names `/reference/` first in **every carrier**"*. The file's own convention annotates stale historical bullets (the immediately preceding bullet carries one); this one had been skipped. **Struck and annotated**, with A-045's still-valid functional ladder expressly preserved in the same bullet.
- 🟡 **MEDIUM — Amendment 007 named carriers it had not reached.** Its affected-document list cites `GLOBAL_UI_RULES.md` §1.1 and Authority Lock §28, but `grep -rl "A-056" UI_REFERENCE_FINAL_MVP/` returned **0 files** — so an agent reading only the UI estate still could not tell the ordering was amendment-backed, which was the amendment's entire purpose. **A-056 attribution added to `GLOBAL_UI_RULES.md` §1.1** (the shared instrument every pack inherits) **and to Authority Lock §28.1a.** The 36 `screen.md` files were verified already §84-conformant and were deliberately **not** re-touched — a 36-file mechanical edit to add a citation is disproportionate, and the shared instrument now carries it.
- 🔵 **LOW, fixed:** A-056 had superseded A-045's ladder wholesale while its replacement model named only three roles, silently dropping **Figma (old rank 2)** and **existing implementation (old rank 3)** — leaving their rank established by no ratified instrument. Those two ranks are now **explicitly retained beneath the three roles**, with the *only where no ratified `/reference/` asset exists* qualifier. The *"never the ranking authority"* phrasing, which read as forbidding the rank-2 placement every carrier uses, is now *"never the TOP rank"*. And `CLAUDE.md`'s ladder gained the Figma re-export qualifier the Lock, `GLOBAL_UI_RULES` and all 36 packs already carried.

**Recorded, not fixed.** `docs/spec/…Amendment_005.md:134` carries **no inbound pointer** to A-056, so a fresh agent opening Amendment 005 alone reads the old ladder as current. The reviewer established this is **the repo's uniform convention, not a defect introduced here** — `grep -ln "Superseded by Amendment" docs/spec/*.md` returns **0 files**, and the identical shape already exists for A-019/A-021 (superseded by A-034) and A-028 (superseded by A-036). Editing ratified text to add banners is exactly what this run was told not to do. **Escalated as a convention question for the operator: should ratified instruments carry an inbound-supersession register?** Mitigation today is six independent carriers plus 11 source files.

**Also noted, no action:** the run wrote 7 files as LF where they had been CRLF in the working tree. `core.autocrlf=true` normalizes on commit and the committed blobs are LF regardless, so this is invisible in `git diff` and harmless — but it means *comment-only* is exact for the **content** of those files, not for their working-tree **bytes**. The one byte-pinned path, `UI_PACK_MANIFEST.json`, was untouched and still matches its `.gitattributes` hash.

**After remediation:** comment-only re-proved **11/11 code-identical** · `tsc` 0 · `lint` 0 · `build` 0 · `git diff --check` 0 · zero surviving stale-ladder text in any source file · `core.longpaths` still unset.

---

## 2026-08-08 — FINAL MVP EXECUTION PLAN CREATED — PLANNING ONLY, ZERO IMPLEMENTATION

**Scope.** Create `FINAL_MVP_EXECUTION_PLAN.md` at the repository root: the single operational
roadmap from the accepted pre-execution baseline through local implementation, governed local
acceptance, hosted Supabase, Vercel, production UAT, human usability testing and submission
preparation. **Planning only.** No implementation begun, no hosted service provisioned, no external
AI invoked, nothing pushed. The plan **authorizes nothing** — every phase in it still requires its
own explicit Operator authorization.

**Track / workstream.** Governance/documentation — execution-plan authoring.
**Branch / worktree.** `main`, single worktree. No worktree created or removed.

**Baseline verified before writing** (directly against `git` and the filesystem, not restated):
branch `main` · HEAD **`dff7a693a2e5c755bb6d809a3b158385f7397605`** · working tree **CLEAN**
(`git status --porcelain -uall` empty) · **0 remotes** · **1 worktree** · **4 tags** ·
12 migrations · 36 governed UI packs · 37 `/reference/` packs · zero attendance write functions ·
zero admin `INSERT` in any migration. Frozen demo `8d4acf4a…` untouched and external.

**Starting HEAD → ending HEAD.** `dff7a693…` → this entry's checkpoint commit.
**Migration or schema changes.** **NONE.**
**Environment / infrastructure changes.** **NONE.** Local Docker stack not started; no hosted
resource contacted; no provider call made.

### Method

Six parallel **read-only** analysis agents digested the governance estate and the codebase
(`CLAUDE.md` + Authority Lock; the OD-4 ruling cross-checked against source; the Phase A/A2
instruments plus continuity records; the submission brief and readiness plan; a full technical
implementation-surface audit; the UI authority estate). The Main Orchestrator wrote the plan and
**independently verified every material claim at source** before recording it (§14.5). Several
subagent claims were checked directly, and one later reviewer claim was rejected outright.

### What the plan contains

**11 phases · 98 actionable tasks.** Phase 0 execution baseline/lock · 1 OD-4 contract foundation ·
2 backend governance completion · 3 final frontend reconstruction · 4 local integration/acceptance ·
5 bounded real-provider re-proof (G-6) · 6 hosted Supabase · 7 Vercel · 8 production UAT ·
9 human usability testing · 10 final submission.

Each task carries: objective · authority · dependencies · files/systems · owner · steps · negative
controls · acceptance · tests/proofs · commit checkpoint · rollback · operator gate · stop
condition. Plus: a dependency map with named serialization points, a multi-agent/worktree policy, a
24-row acceptance matrix (LOCAL/HOSTED/BOTH plus owning phase), a 30-row operator-gate register, a
continuity/resume model, an 11-row rollback register, a 24-row external-input register, 22 critical
product acceptance rules, and a Definition of Done that explicitly declares what is **out** of scope
rather than omitting it.

**Mandatory carry-forwards discharged:** the five Q-27 Parent Dashboard acceptance criteria
(Authority Lock §15.2), split across **P3-T05a** (the projection-layer data boundary, owned by the
Main Orchestrator on `main`) and **P3-T05** (the UI half, Track P/A); and the Windows
`core.longpaths` clone prerequisite, recorded as an **environment** prerequisite, never as
repository governance and never applied.

### Adversarial review and remediation

Two independent read-only reviewers, instructed to falsify — one product/governance/UI, one
technical/security/execution. Between them: **6 CRITICAL, 15 HIGH** plus a MEDIUM/LOW tail. All
Critical and High findings were verified at source before remediation; **every valid one was
remediated.** The most consequential:

- 🔴 The **Authority Lock was missing from the precedence ladder** — a fresh session would have
  ranked `CLAUDE.md` above the canonical Final MVP baseline and above every operator ruling.
- 🔴 **The entire management-administration and invitation write layer was unplanned.** Verified:
  zero `INSERT INTO` for nine domain entities across all 12 migrations, all 29 RLS policies
  `FOR SELECT`, zero DML policies. Three later tasks depended on paths that do not exist. Added as
  **P2-T07a / P2-T07b** (A-024 steps 2–6 and 11), now on the critical path.
- 🔴 **Three billable provider calls sat behind `Operator gate: NO`.** The deployed build has no
  fixture path (gate G-19 — *"there is no switch to flip"*), so every hosted exercise of the AI
  feature costs money. Added the **G-16b … G-16h** paid-gate series; the widest surface is
  participant usability sessions.
- 🔴 **P2-T10 restated the weaker property the current transport already has.** Lock §18.2.1a
  requires the wrapper to **resolve the report's own trainer and refuse on mismatch**, not merely
  accept a verified subject — and the plan had accepted the *narrowed* residual while specifying
  only the un-narrowed control. Also added the explicitly-prohibited `GRANT … TO authenticated`
  direction and the `NOBYPASSRLS` requirement.
- 🔴 **Profile Details would have shipped a child's date of birth, contact details and a "Trainer
  Assistant (TA)" field to a parent surface.** Lock §15's table records all three; §15.2 states
  expressly that Q-27 does **not** resolve them, and pack 30 records no conflict for them — so the
  Lock's table was the only carrier, and the plan had not carried it.
- 🔴 **P0-T04 and P1-T02 self-authorized past §12 stop-and-asks** — bounded annotate-never-delete
  needs a per-run instruction, and incrementing the content-hash envelope needs the OD-4 §5.1
  ruling, which is recorded as open. Both are now gated (G-00a, G-05a).
- 🟠 **Eight rollback citations were off by one** after the §11 table was renumbered — including
  auth hardening pointing at the generated-types procedure. All re-mapped, and a register-integrity
  check added.
- 🟠 **Phase 3 ownership was not disjoint.** `report-panel-config.ts` (6 importers) and
  `resource-state.ts` (15 importers) sat inside Track T's owned glob while all three tracks import
  them; `proxy.ts` — layer 1 of 2 of server-side portal authorization — was never mentioned.
  Ownership is now closed-world with an explicit frozen list and a relocation step at P3-T00.
- 🟠 **Auth hardening was sequenced after bootstrap**, inverting Lock §17.6's requirement that
  confirmations be enabled *before* any claim flow is designed (the A-027 pre-squat hazard).
- 🟠 **The zero-EXECUTE assertion set is eight carriers across four identifier spellings**, not the
  four then stated. Two hard-assert `IF v_n <> 4` and fail loudly; one is the only authoring-time
  static scan that would catch a stray V2 grant in a new migration file.

A **focused re-review** was then run over the remediated document. It found **no surviving
Critical**, confirmed the substance of every remediation (including all five Q-27 criteria, the
R-27 boundary, the 19/6 RPC split, and roughly thirty file:line citations with **zero** wrong), and
identified **nine HIGH propagation gaps** — the remediations had fixed tasks without updating the
cross-cutting registers (§5.2, §6.1, §6.2, §6.5, §6.6, §10, §12, §13). All nine were reconciled,
along with the worthwhile MEDIUMs: gate-namespace collisions with Phase A gate IDs, the Lock §23.2
(a)/(b)/(c) network-restriction record, attendance roster initialization (default-Present is
delivered by session creation, not by the trainer's toggle), the GC-6/GC-7 pack-to-track
attribution, and the `c2-static.mjs` **ordinal** pin that no count update would fix.

**Operator decisions received during this window.** One — the instruction to create the plan, as a
planning-only run.

**Blockers opened or closed.** None opened, none closed. The standing implementation-time blockers
(N-4 management bootstrap, the `docker exec` draft transport, the OD-4 fail-open deny-lists) are now
each owned by a named task rather than only recorded.

### Files changed

- **`FINAL_MVP_EXECUTION_PLAN.md`** — **NEW.**
- `CLAUDE.md` — **two rows only**, annotate-never-delete. §1's source table and §15.1's four-layer
  table each asserted the execution plan *"does not exist yet"* and routed a fresh session to the
  superseded Phase A §7 track table; left uncorrected they would have defeated the resume protocol
  §15.3 defines. No other line touched.
- `docs/progress/STATUS.md` — current-state block rows replaced (phase, current track, HEAD,
  acceptance-gate state, next authorized action, outstanding decisions).
- `docs/progress/BUILD_NOTES.md` — this entry.

### Verification

`git diff --check` clean; complete diff inspected. **Expected functional/code change: ZERO** — and
confirmed: no application source, schema, migration, test, fixture or configuration file was
modified. No `tsc`/`lint`/`build` run was required or performed, because nothing they cover changed.

**Cleanup / rollback state.** No partial mutation. Nothing to roll back; the checkpoint commit is
revertible in one operation.

**Confirmed NOT done:** zero Phase B implementation · zero application behaviour change · zero
schema/data change · zero migration · zero provider invocation · zero hosted Supabase action · zero
Vercel deployment · zero GitHub remote or push · frozen demo untouched · PeakPalate untouched
(`KEEP_IN_PLACE`) · no worktree created or removed · no tag created · no Operator Git configuration
touched.

**Next permitted action.** **Await Operator authorization of gate `G-00`** — entering Phase 0 of the
execution plan (baseline verification, live-catalogue re-derivation, register reconciliation, and
arming the long-lead recruitment and external-input gates). Phase 0 contains no product work.

---

## 2026-08-08 — FINAL MVP EXECUTION PLAN CONSISTENCY CORRECTION — PLAN/PROCESS ONLY, ZERO IMPLEMENTATION

**Scope.** Nine bounded corrections to `FINAL_MVP_EXECUTION_PLAN.md`'s execution graph and
orchestration model, plus the minimum process wording in `CLAUDE.md` needed to encode a bounded
`STANDING_LOCAL_EXECUTION_AUTHORIZATION`. **No product or governance decision was reopened.** No
Phase 0 work, no implementation, no migration, no provider call, no hosted action, no worktree, no
tag, no push.

**Track / workstream.** Governance/documentation — execution-plan correction.
**Branch / worktree.** `main`, single worktree.
**Starting HEAD → ending HEAD.** `f53cae2853c4151d2a38ec29524573eed1af2e7b` → this entry's commit.
**Migration or schema changes.** **NONE.**
**Environment / infrastructure changes.** **NONE.**

**Baseline verified before writing:** branch `main` · HEAD `f53cae2…` · tree **CLEAN** ·
**0 remotes** · **1 worktree** · 4 tags. All checked against `git`, not restated.

### The nine corrections

1. **Critical path re-derived from real dependencies.** §5.2 previously skipped Phases 3, 5 and 9.
   It now states the full mandatory chain `P0→P1→P2→P3→P4→P5→P6→P7→P8→P9→P10`, with the two
   genuinely parallel branches (the long-lead human track armed at P0-T07 and converging at P9; the
   P10 artefact-authoring track) **shown rather than omitted**, and an explicit bar on satisfying a
   phase by a reduced "minimum acceptance" reading of the one before it.
2. **Phase 3's entry de-circularized.** P3-T00 was an entry condition of the phase containing it.
   Entry is now prior-phase exit + authorization + no blocking gate; P3-T00 and P3-T05a are
   prerequisites to the **role-track fork**, not to entering Phase 3.
3. **`P3_ROLE_TRACK_BASELINE` defined.** All three worktrees fork from **one** SHA: accepted `main`
   HEAD after **both** P3-T00 **and** P3-T05a have landed and passed. Resolved at P3-T01, recorded
   in `STATUS.md`, verified with `git worktree list`; differing SHAs are a halt. No future SHA is
   hard-coded.
4. **Phase 5 reclassified.** Three locality bands replace two: 0–4 local · **5 = local
   infrastructure with a gated paid external call** · 6–10 hosted/public/human/submission. E-7 and
   the per-invocation G-16 discipline are preserved unweakened.
5. **Dangling `P2-T16` removed** — the ownership-guard owner is **P2-T13**, verified before
   rewiring.
6. **Q-27 cross-reference corrected** — P3-T02 pointed at Track M; it now points at **P3-T05a**
   (data boundary) and **P3-T05** (UI). Q-27 itself untouched.
7. **`STANDING_LOCAL_EXECUTION_AUTHORIZATION` defined** (plan §7.6, `CLAUDE.md` §15.11): a future
   Operator may name a bounded **local** range; advance across ordinary phase boundaries then
   requires all ten evidence conditions. **Conditional continuation, never self-acceptance** —
   `PASS` stays Claude's, `Accepted` stays the Operator's. Fourteen categories can never be
   inherited, and the list is declared **non-exhaustive** with `CLAUDE.md` §12 binding in addition.
8. **Gate register classified A / B / C** — 37 gates: 3 satisfiable in-range, 16 genuine Operator
   decisions, 16 hard external, 2 hybrid. It now states plainly which gates will actually stop an
   autonomous run.
9. **Baseline semantics separated** — `dff7a693…` is the **plan-authoring** baseline (historical,
   never rewritten); `f53cae2…` is the **first committed-plan** baseline; **execution always begins
   from actual current HEAD** after verifying intervening commits.

### `CLAUDE.md` changes — process only, additive

Under this run's explicit bounded Operator instruction: a **§10 scope note** (its five-phase model
and persona sign-offs unchanged; the carve-out reaches only an Execution Plan's own finer *local*
phases, and satisfying one numbering never satisfies the other) · new **§15.11** · **§15.2** gains
three fields (standing-authorization range, outstanding `Accepted` marks, resolved fork baseline) ·
**§12** gains two bullets that were missing from the canonical enumeration entirely — **human
participant recruitment/consent/testing** and **final submission** — and a miscount corrected.
**No product rule was changed, and no hosted/provider/human/push gate was made inheritable.**

### Adversarial review and remediation

Two independent read-only reviewers (execution graph; autonomy/safety), then a focused re-review.
**2 Critical and 10 High** in the first pass; **4 High** survived into the second; all remediated.

- 🔴 **The plan's own central safety premise was false.** *"Phases 0–4 are LOCAL-ONLY. No external
  system is contacted, nothing is billed"* — but `report-workflow/actions.ts` constructs the **real**
  provider unconditionally (Phase A gate G-19, *"there is no switch to flip"*), the machine's
  selectors are ratified and present, and P4-T07's own suite **requires a non-fixture build**. So a
  locally served build is a **billable** surface, and a standing local authorization would have been
  a spend authorization. **This is not hypothetical:** `prove-disposable-app.mjs` records that a
  *deleted* selector is silently refilled by `@next/env` — *"which is exactly what happened on an
  earlier run of this proof, whose report reached `drafting`."* Closed by new **§7.4a**: overwrite
  the three LLM selectors with a proven-unratified literal **and read them back** (never delete),
  assert `BEST_COACH_RUN_REAL_PROVIDER_LEG` unset, arm the trip-wire — now **§7.4 stop condition 15**
  and binding on every task below §8 whether or not the task repeats it.
- 🔴 **Phase 5 had no entry gate and no exit condition**, while Phase 6's entry cited "Phase 5
  complete" — a referent that did not exist, i.e. precisely the reduced reading §5.2 forbids. All
  eleven phases now carry both an ENTRY and an EXIT block; Phase 7 and Phase 9 gained entries;
  Phase 9's circular "participants" entry was disclaimed.
- 🟠 **I had downgraded three gates while asserting none was weakened.** G-13 and G-14 are restored
  to **Class B**; the A/B hybrid is gone; the false sentence is replaced by an honest account of the
  three reclassifications that did happen (G-07, G-10, G-11 — the last justified by §12's explicit
  `git worktree add` carve-out, which covers **creation only**, so worktree deletion gained its own
  gate G-12a).
- 🟠 **The bounded-edit carve-out was weaker than `CLAUDE.md` §12** — it permitted "bounded edits"
  by any method, attached to a multi-phase range grant. Restored to §12's strength: annotate-never-
  delete only, its own instruction **for that run** naming exact files and corrections, and
  **`CLAUDE.md` itself never editable under a standing authorization**.
- 🟠 **The same "no server contract" failure the plan closed for Management's *write* screens was
  open for its *read* screens.** Verified: `management-view/projections.ts` exports only
  report-workflow shapes — nothing statistical, no calendar, no student or class reads. Class Health
  Summary and Management Insight are **mandated by `CLAUDE.md` §6 and undrawn in `/reference/`**, so
  a reference-driven build omits them and a reference-driven sweep passes. New **P2-T07c**.
- 🟠 **P3-T05's Profile Details criterion was unsatisfiable inside Track P/A** by the identical
  mechanism the earlier split fixed for criterion 4, as was pack 31's Parent Calendar remediation.
  **P3-T05a** widened to land the parent profile and calendar projections with DOB, contact details,
  the TA field and trainer observations structurally excluded.
- 🟠 **Resume could repeat an irreversible side effect** — §7.6-D deferred to §9.3, which had dropped
  `SUBMISSION` and interrupted-destructive. Both restored, and the carve-out **re-keyed from the
  recorded gate class to actual capability**, so a task recorded `Operator gate — NO` that can still
  reach a provider or a credential is non-auto-resumable.
- 🟠 **Eligibility was self-contradictory** — Phase 0 contains two Class C gates, so a literal
  "contains no external action" test would have made the mechanism's own canonical `Phases 0–4`
  example ineligible, and the converse argued a path into Phase 5's pre-flight. Re-based on the
  phase's **deliverable**, with that analogy explicitly foreclosed.
- Also corrected: P5-T02 told the Operator *"exactly two"* billable requests where the harness
  documents **2–4**; twelve section cross-references resolving to the wrong document (one, `§15.5`,
  fully dangling); `run-integration.mjs` cited unqualified in two in-range tasks; P3-T06 ordered
  before the merge that makes it executable; the six-vs-eight zero-EXECUTE carrier count that would
  have shipped V2 with no static-scan coverage; and several counts.

**Operator decisions received.** One: the instruction to perform this correction run, which is also
the explicit bounded instruction authorizing the `CLAUDE.md` process edits.

**Blockers opened or closed.** None.

### Files changed

`FINAL_MVP_EXECUTION_PLAN.md` · `CLAUDE.md` (process/orchestration only) ·
`docs/progress/STATUS.md` · `docs/progress/BUILD_NOTES.md`.

### Verification

`git diff --check` clean; complete diff inspected. **Zero application, schema, migration, test,
fixture or configuration change** — verified by path filter over the commit.

**Cleanup / rollback state.** No partial mutation; the checkpoint commit is revertible in one
operation.

**Confirmed NOT done:** zero Phase 0 execution · zero Phase B implementation · zero application
behaviour change · zero schema/data change · zero migration · zero provider call · zero hosted
action · zero deployment · zero worktree creation · zero tag · zero remote or push · frozen demo
untouched · PeakPalate untouched.

**Next permitted action.** **Await Operator authorization of gate `G-00`** — optionally carrying a
`STANDING_LOCAL_EXECUTION_AUTHORIZATION` over a named local range such as `Plan Phases 0–4`. Without
that range, each phase still needs its own entry instruction.
