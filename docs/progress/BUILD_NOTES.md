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

---

_Next permitted action: Step 5B3 — create and verify one local governance-baseline commit from the seven-file staged set (no tag, no remote, no push), then record the commit hash here and in `STATUS.md`._
