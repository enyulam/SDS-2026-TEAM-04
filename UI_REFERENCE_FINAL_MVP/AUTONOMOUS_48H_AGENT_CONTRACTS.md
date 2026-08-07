# Autonomous 48-Hour Sprint — Run B Agent Contracts

**Produced at:** RUN A, 2026-08-06 (Asia/Singapore). Companion to `AUTONOMOUS_48H_MASTER_PLAN.md` and `AUTONOMOUS_48H_TASK_GRAPH.md`.
**Status:** Planning artefact. **Spawning any agent below still requires explicit operator authorization for that specific checkpoint.**

---

## 0. Standing rules — bind every contract in this document

1. **Only one writer per worktree, ever.** Two writer agents may run at once **only** in different worktrees (`worktrees/backend-48h` and `worktrees/frontend-48h`).
2. **Test agents do not run concurrently with writers in the same worktree**, and **no two test agents run anywhere in the workspace at once.** Validation is a global mutex — both worktrees serve `http://127.0.0.1:3000` and the browser suites hard-code CDP ports 9331 / 9332 / 9345 with no environment override.
3. **The main orchestrator does not edit a subagent's owned files.** It reads, reconciles and rejects; it does not implement.
4. **Progress logs have one designated writer per checkpoint** — the lane that owns the checkpoint, writing at contract item 12. `docs/workstreams/48H_BACKEND_PROGRESS.md` is written only by the backend lane; `48H_FRONTEND_PROGRESS.md` only by the frontend lane; the tracker only by the lane owning that checkpoint.
5. **A cross-owned edit is a blocker, reported before modification, never after** (contract §7.3/§9).
6. **Never `reset`, `restore`, `stash`, `checkout <branch>`, `rebase`, `amend`, `push`, or configure a remote.** Branch history is the audit record; the tracker cites commit SHAs as evidence. The only history-touching operation compatible with SHA-cited evidence is a **forward `git revert`**.
7. **Never `supabase db reset`.** It destroys the three synthetic Auth identities; recreating them needs an interactive password prompt no agent may handle.
8. **Never `git gc`, `git pack-refs`, `git prune`, `git tag`, `git remote`** — these mutate the shared `.git` under two live worktrees.
9. **No credential in chat, in any file, in a log, in an error, or in a report.** Synthetic/seed data only (ADR-6).
10. **A blocked checkpoint reported honestly is a good outcome.** Stop at the failing gate; do not improvise past it.

**Model and effort for every Run B agent: Opus, effort as stated per contract.** Enforce both explicitly at spawn time. If the environment cannot enforce the stated pair, **do not substitute** — report and stop.

---

## 1. Main orchestrator

| Field | Value |
|---|---|
| **Model / effort** | Opus / **High** |
| **Starting directory** | `C:\Users\enyul\Vibe Studio\B.E.S.T-Coach-Workspace` |
| **Branch / HEAD source** | None of its own. Reads all four repositories read-only. |
| **Mandatory documents** | `CLAUDE.md`; Specification v3; Amendments 001–006; `PHYSICAL_TEST_SLICE_48H.md` §12, §13; `COMPETENCY_VOCABULARY_RECONCILIATION_PLAN.md`; `FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` §7; `FRONTEND_RECONSTRUCTION_PLAN.md`; `FRONTEND_RECONSTRUCTION_TRACKER.md`; the three Run A planning files |
| **Owned paths** | `UI_REFERENCE_FINAL_MVP/AUTONOMOUS_48H_EXECUTION_TRACKER.md` **only** |
| **Prohibited paths** | Every repository file. Every subagent's owned paths. Every `reference.png`. |
| **Permitted commands** | Read-only Git (`status --porcelain`, `log`, `show`, `diff`, `rev-parse`, `worktree list`); Read/Grep/Glob |
| **Forbidden commands** | Any mutation; any build, browser or database command |
| **Test requirements** | None. It verifies **evidence**, not by re-running. |
| **Commit policy** | **Never commits.** |
| **Stop conditions** | Unexpected Git drift; a subagent claim unsupported by evidence; two writers detected in one worktree; a route census move without a `CHANGE_LOG.md` entry; any G-8/G-9/G-12/G-13/G-14/G-15/G-16 failure |
| **Report format** | Per-checkpoint reconciliation: claim → evidence → accepted/rejected |
| **Success phrase** | `RUN B ORCHESTRATION CHECKPOINT COMPLETE` |
| **Blocked phrase** | `RUN B BLOCKED — OPERATOR DECISION REQUIRED` |

---

## 2. Governance auditor

| Field | Value |
|---|---|
| **Model / effort** | Opus / **Medium** |
| **Starting directory** | `…\SDS Project Final (BEST Coach)` |
| **Branch / HEAD** | `main` @ `7c0a3591…` — **read-only** |
| **Mandatory documents** | `CLAUDE.md`; Amendments 001–006 **read from their own supersession tables, never summarised from `CLAUDE.md`**; `FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md`; `FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md`; `docs/progress/STATUS.md` |
| **Owned paths** | **None — read-only** |
| **Prohibited** | All writes; all Git mutation |
| **Permitted commands** | Read, Grep, Glob; read-only Git |
| **Test requirements** | None |
| **Commit policy** | Never |
| **Stop conditions** | A checkpoint about to proceed against a ratified rule; a superseded clause being relied on as active |
| **Report format** | Claim · authority · verdict · consequence |
| **Success phrase** | `GOVERNANCE AUDIT COMPLETE` |
| **Blocked phrase** | `GOVERNANCE AUDIT BLOCKED — OPERATOR DECISION REQUIRED` |

> **Standing task.** `governance-source/` has **materially drifted** and holds none of Amendments 001–006; its `CLAUDE.md` is 42,828 B against the repository's 119,827 B. Per A-055 the repository copies are authoritative. The auditor must ensure no agent ever reads the mirror as governance.

---

## 3. Backend implementer

| Field | Value |
|---|---|
| **Model / effort** | Opus / **Medium** |
| **Starting directory** | `…\worktrees\backend-48h` |
| **Branch / expected HEAD** | `feat/48h-backend`; HEAD **must equal** the tracker's recorded starting commit for the checkpoint (`4b58c6b0…` for B-V2-1). **Stop on drift.** |
| **Mandatory documents** | `COMPETENCY_VOCABULARY_RECONCILIATION_PLAN.md` §1; Amendment 006 **A-049 … A-055 verbatim**, including the "zero-row precondition" section; `CLAUDE.md` §3.4, §4, §5, §6.1; `STEP_7I_REPORT_LIFECYCLE_BASELINE.md`; `PHYSICAL_TEST_SLICE_48H.md` §7.1 |
| **Owned paths** | Exactly the per-commit lists in the task graph §2.2 — **plus** `scripts/tests/step-7i/verify-fresh-apply.mjs` and `static-scan.mjs`, which the reconciliation plan omits and which carry hard `7`-migration pins |
| **Prohibited paths** | Any **existing applied** migration (never edit one) · every `class_grade_code` artefact · any frontend path · any `docs/spec/` instrument · any Amendment file · `package.json` / `package-lock.json` |
| **Permitted commands** | Read/Grep/Glob; read-only Git; `git add`/`commit` **within owned paths only**; `supabase gen types typescript --local`; the backend test runners **against disposable clones** |
| **Forbidden commands** | `supabase db reset` · any destructive migration · any write to the canonical database outside the governed path · `npm install` · global find-and-replace over `advanced`, `secure`, `emerging`, `beginning`, `mastering`, `mastered` (**A-054 — expressly prohibited**) |
| **Test requirements** | Per task graph §2.2, including a **deliberate guard violation that must abort** |
| **Commit policy** | Three bounded commits, one authorization. **Census reconciled in the same commit as the migration that moves it.** |
| **Stop conditions** | The `observation_ratings` guard conflict is unresolved (**OD-6**) · any `report_versions` row exists · hash anomaly · counts move · a Class Grade artefact would change · the contradiction test cannot fail closed · the canonical checksum is not reproducible twice |
| **Report format** | Per V2 sequence step: current state + evidence → change made → test result |
| **Success phrase** | `BACKEND V2 CHECKPOINT COMPLETE` |
| **Blocked phrase** | `BACKEND V2 BLOCKED — OPERATOR DECISION REQUIRED` |

> **Hard gate.** `dimensions.ts` and the migration must land in the **same** commit. A state where the database is renamed and `RUBRIC_ANCHORS` is not causes `RUBRIC_ANCHORS[level]` to return `undefined` for every rating. **Do not split at that seam.**
> **A-050 proof:** anchor prose must be **byte-unchanged**. Prove it with a hash of the anchor lines before and after — not by reading.

---

## 4. Backend verifier

| Field | Value |
|---|---|
| **Model / effort** | Opus / **Medium** |
| **Starting directory** | `…\worktrees\backend-48h` |
| **Branch / HEAD** | `feat/48h-backend` at the implementer's committed tip |
| **Owned paths** | **None — read-only.** Reports; does not fix. |
| **Permitted commands** | Read-only Git; the backend suites; `psql` **read-only** against disposable clones |
| **Forbidden** | Any commit; any write to the canonical database; **running while the backend implementer is active** |
| **Test requirements** | `verify-fresh-apply.mjs` (census → 8 migrations) · `run-canonical.mjs` **twice, byte-identical** · `run-assessment.mjs` · `run-correction-tracking.mjs` · `run-integration.mjs` · post-run proof the canonical DB is unchanged |
| **Stop conditions** | Any suite fails · the canonical DB is not pristine afterwards · a census count moves unexplained |
| **Success phrase** | `BACKEND VERIFICATION COMPLETE` |
| **Blocked phrase** | `BACKEND VERIFICATION BLOCKED — OPERATOR DECISION REQUIRED` |

---

## 5. Frontend implementer

| Field | Value |
|---|---|
| **Model / effort** | Opus / **Medium** |
| **Starting directory** | `…\worktrees\frontend-48h` |
| **Branch / expected HEAD** | `feat/48h-frontend`; HEAD **must equal** tracker Table B's recorded starting commit for the checkpoint. **Stop on drift.** |
| **Mandatory documents** | `FRONTEND_RECONSTRUCTION_PLAN.md` (the **fifteen-item** per-step contract) · `IMPLEMENTATION_WORKFLOW.md` · `GLOBAL_UI_RULES.md` · the checkpoint's `screen.md` · `FRONTEND_RECONSTRUCTION_TRACKER.md` · `CLAUDE.md` §5, §6, §3.5 · `PHYSICAL_TEST_SLICE_48H.md` §4, §7.2 |
| **Owned paths** | Exactly the per-checkpoint list in task graph §2.3–2.5 |
| **Prohibited paths** | Any backend path · any migration · `package.json` / `package-lock.json` · every `reference.png` · any `docs/spec/` instrument · another checkpoint's component |
| **Permitted commands** | Read/Grep/Glob; read-only Git; `git add`/`commit` within owned paths; `tsc --noEmit`; `eslint`; `next build`; the browser suites — **all validation under the global mutex** |
| **Forbidden commands** | `npm install` · adding any test-runner dependency (**OD-9 unresolved**) · creating a route outside F-04/F-16 · resolving a frame-versus-rule conflict |
| **Test requirements** | Reference SHA-256 verified **before** work begins · tsc · eslint · build with the **route census stated** · the relevant browser suites · **zero uncaught console errors** |
| **Commit policy** | **One commit per checkpoint**, containing code + assertions + `implementation-notes.md` + all four tracker rows + the frontend progress log, atomically. **Never a batch of unrelated screens.** |
| **Stop conditions** | Reference SHA mismatch (**stop-and-report; never proceed on a substitute image**) · route census moves · a frame contradicts a ratified rule (**record it; the rule wins; do not resolve**) · a required primitive would be a Parent rating tile or an evidence video (**never create either**) |
| **Report format** | `FRONTEND_STEP_REPORT_TEMPLATE.md` |
| **Success phrase** | `FRONTEND CHECKPOINT <ID> COMPLETE` |
| **Blocked phrase** | `FRONTEND CHECKPOINT <ID> BLOCKED — OPERATOR DECISION REQUIRED` |

> **Batching rule.** The F2/F3/F10/F13 batch was safe because **one** implementation checkpoint (F2, +917/−104) carried three **assertion-shaped** follow-ons — F10 and F13 changed 2 files each and **zero product code**. `IMPLEMENTATION_WORKFLOW.md:21` says "**Do not batch screens.**" Batch only where a shared implementation already exists and the follow-ons are assertions. **More than two production files in a follow-on means it is not assertion-shaped — split it before committing.** After committing, a batch cannot be un-batched non-destructively.

---

## 6. Visual / accessibility verifier

| Field | Value |
|---|---|
| **Model / effort** | Opus / **Medium** |
| **Starting directory** | `…\worktrees\frontend-48h` |
| **Owned paths** | **None — read-only** |
| **Permitted commands** | Read-only Git; compiled assertion suites; browser smokes — **only when no writer is active and no other test agent runs** |
| **Forbidden** | Any commit; any component edit; concurrent execution with any other test agent |
| **Test requirements** | Reference SHA-256 · geometry against the frozen frame · WCAG 2.2 AA contrast · keyboard reachability and visible focus · responsive at 1440/1024/900/480 · **zero uncaught console errors** |
| **Stop conditions** | Any contrast pair below AA · any console error · a Parent surface renders any rating token · a Management surface renders a per-dimension rating |
| **Success phrase** | `VISUAL VERIFICATION COMPLETE` |
| **Blocked phrase** | `VISUAL VERIFICATION BLOCKED — OPERATOR DECISION REQUIRED` |

> **Standing defect to confirm fixed:** seven components render white-label buttons on `bg-brand-600` = `#ec4899` (3.53:1). The accessible token is `brand-700` = `#d6357a` (4.52:1). This is a **live AA failure**, not a hypothetical.

---

## 7. Integration implementer

| Field | Value |
|---|---|
| **Model / effort** | Opus / **Medium** |
| **Starting directory** | `…\SDS Project Final (BEST Coach)` after M-2, or a short-lived branch off `main` |
| **Branch / HEAD** | `main` carrying both merges. **Merge order is pinned: backend first, frontend second** (contract §12 steps 5–7). |
| **Mandatory documents** | `PHYSICAL_TEST_SLICE_48H.md` §1.1, §1.2, §4, §5, §12, §13 · `FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` §7 · Amendment 003 A-025/A-027 · ADR-3, ADR-4 |
| **Owned paths** | `app/**` · `middleware.ts` (new) · `lib/frontend/**` · `features/**` · ported `server/modules/identity-access/**` · `server/contracts/action-result.ts` |
| **Prohibited paths** | Any migration · `docs/spec/**` · every `reference.png` |
| **Permitted commands** | Read/Grep/Glob; Git within owned paths; tsc/eslint/build; the suites under the mutex |
| **Forbidden commands** | Adding a canonical route family before the physical test (**OD-5 — pinned routes govern the test**) · `supabase db reset` · deleting the fixture |
| **Test requirements** | Full matrix; `identity.participantEligible === true` on every portal surface |
| **Stop conditions** | **Any portal route reachable without an identity** · a fixture affordance reachable in participant mode · the read-RPC keying mismatch cannot be resolved without a backend change (**raise a §9 blocker**) |
| **Success phrase** | `INTEGRATION CHECKPOINT COMPLETE` |
| **Blocked phrase** | `INTEGRATION CHECKPOINT BLOCKED — OPERATOR DECISION REQUIRED` |

> **Fixture policy: isolate, do not remove.** Deleting the fixture destroys `fixture-contract.assertions.ts`, the only mechanism proving the port surface is fully implemented. Make selection a **server-side** decision; make `fixtureRevision`/`resetFixture` optional so the five consumers degrade to a plain refetch; ensure any fixture banner is unreachable when `participantEligible === true`.

---

## 8. Integration / UAT verifier

| Field | Value |
|---|---|
| **Model / effort** | Opus / **Medium** |
| **Starting directory** | `…\SDS Project Final (BEST Coach)` |
| **Owned paths** | **None — read-only** |
| **Test requirements** | **G-1 … G-21, each recorded pass/fail individually** · the three-role walkthrough in one process · canonical verifier on the **pristine** canonical DB · concurrency suite on a **separate disposable** DB |
| **Forbidden** | Any commit · any repair (**report, do not fix**) · running concurrently with any writer or other test agent · interleaving `run-canonical` with the commit-heavy suites |
| **Stop conditions** | Any of **G-8, G-9, G-12, G-13, G-14, G-15, G-16** fails — these are governance defects and outrank every visual defect |
| **Success phrase** | `UAT VERIFICATION COMPLETE` |
| **Blocked phrase** | `UAT VERIFICATION BLOCKED — OPERATOR DECISION REQUIRED` |

---

## 9. Evidence auditor

| Field | Value |
|---|---|
| **Model / effort** | Opus / **Medium** |
| **Starting directory** | `C:\Users\enyul\Vibe Studio\B.E.S.T-Coach-Workspace` |
| **Owned paths** | **None — read-only** |
| **Mandatory documents** | `AUTONOMOUS_48H_EXECUTION_TRACKER.md` · `FRONTEND_RECONSTRUCTION_TRACKER.md` · both workstream logs · every step report |
| **Test requirements** | None — it audits **claims against artefacts** |
| **Stop conditions** | A tracker cell reads `Pass` with no exit-0 transcript behind it · a checkpoint marked `Accepted` by anyone other than the operator · a commit SHA cited in the tracker that does not exist · **any of the 12 `reference.png` SHA-256 values changed** |
| **Report format** | Claim · artefact · verdict |
| **Success phrase** | `EVIDENCE AUDIT COMPLETE` |
| **Blocked phrase** | `EVIDENCE AUDIT BLOCKED — OPERATOR DECISION REQUIRED` |

> **Standing rule from the tracker itself:** "No cell may read `Pass` before the command has actually run and exited 0." And: **never mark a checkpoint `Accepted` — only the operator does that.**

---

## 10. Ownership map — no overlap

| Path family | Sole writer |
|---|---|
| `supabase/migrations/**`, `server/**`, `scripts/**` | Backend implementer |
| `docs/workstreams/48H_BACKEND_PROGRESS.md` | Backend implementer |
| `app/**`, `components/**`, `features/**`, `lib/frontend/**`, `tests/frontend/**` | Frontend implementer (per checkpoint) |
| `docs/workstreams/48H_FRONTEND_PROGRESS.md` | Frontend implementer |
| `UI_REFERENCE_FINAL_MVP/**` implementation notes, `CHANGE_LOG.md`, `FRONTEND_RECONSTRUCTION_TRACKER.md` | The lane owning that checkpoint, at contract item 12 |
| `AUTONOMOUS_48H_EXECUTION_TRACKER.md` | Main orchestrator |
| `middleware.ts`, merged-tree `app/**` | Integration implementer (Phase 6 only) |
| Every `reference.png` | **Nobody. Immutable.** |
| `docs/spec/**`, every Amendment | **Nobody. Immutable in Run B.** |

**No path appears twice.** Where two lanes could touch `lib/frontend/contracts/physical-test.ts`, ownership is split by line range and by phase: **F-11 owns the status union line; F-06 owns lines 1–8 (the rating union)**; they never run concurrently.

---

*Produced at Run A, 2026-08-06. No repository file, Git state, database or screenshot was modified.*
