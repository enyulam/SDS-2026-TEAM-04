# Autonomous 48-Hour Sprint — Task Graph

**Produced at:** RUN A, 2026-08-06 (Asia/Singapore). Companion to `AUTONOMOUS_48H_MASTER_PLAN.md`.
**Status:** Planning artefact. Authorizes nothing. Every task still requires its own operator authorization.

---

## 1. Dependency graph

```
                          ┌──────────────────────────────────────────┐
                          │  PHASE 0 — OPERATOR DECISION GATE        │
                          │  OD-1  OD-2  OD-6  OD-7  OD-8  OD-9      │
                          └───────────────┬──────────────────────────┘
                                          │
        ┌─────────────────────────────────┼──────────────────────────────────┐
        │ LANE L-B (backend worktree)     │      LANE L-F (frontend worktree)│
        │                                 │                                  │
   ┌────▼─────┐                      ┌────▼────┐   ┌─────────┐   ┌─────────┐
   │ B-V2-1   │ migration + guard    │  F-05   │   │  F-08   │   │  F-11   │  ← rating-free,
   │          │ + types              │ roster  │   │ AI gen  │   │ mgmt Q  │    parallel-safe
   └────┬─────┘                      └────┬────┘   └────┬────┘   └────┬────┘
   ┌────▼─────┐                           └─────────────┴─────────────┘
   │ B-V2-2   │ provider + grounding                    │
   │          │ + audit-privacy                         │
   └────┬─────┘                                         │
   ┌────▼─────┐                                         │
   │ B-V2-3   │ fixtures + suites + log                 │
   └────┬─────┘                                         │
        │                                               │
        └───────────────► F-06 (V3 vocabulary) ◄────────┘
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
                 F-07  ──►   F-09        F-12 (also gated on OD-7)
                                │           │
                 F-14 (OD-8) ─► F-15 (OD-8) │
                    │           │           │
                    └───────────┴───────────┘
                                │
                    F-04 (conditional on OD-1 = "build")
                                │
                    ┌───────────▼───────────┐
                    │ M-1 backend  → main   │  (contract §12 step 5)
                    │ M-2 frontend → main   │  (contract §12 steps 6–7)
                    └───────────┬───────────┘
                                ▼
                    F-16  (adapter + auth + guards + middleware)
                                ▼
                    F-17  (walkthrough vs G-1 … G-21)
                                ▼
                    X-1   (targeted correction)
```

**Legend.** Boxes in the same horizontal band may run concurrently **only** where §3 marks them `Yes`. Validation is a global mutex regardless of lane (see §4).

---

## 2. Task table — every remaining task

Columns: **ID · Checkpoint · Workstream · Role · Worktree · Owned paths · Starting commit · Dependencies · Concurrent? · Agent type · Required tests · Commit message · Merge dependency · Stop condition · Success evidence · Duration · Status**

### 2.1 Phase 0 — decisions (no worktree, no code)

| ID | Checkpoint | Decision | Blocks | Status |
|---|---|---|---|---|
| **OD-1** | — | `/trainer/schedule`: accept fold or build | F-04, F-05 order | **Open** |
| **OD-2** | — | Authorize Backend V2 | B-V2-*, F-06, F-07…F-17 | **Open** |
| **OD-6** | — | `observation_ratings` zero-row conflict | **B-V2-1 (hard)** | **Open — new at Run A** |
| **OD-7** | — | Reference 19 prohibited content | F-12 | **Open — new at Run A** |
| **OD-8** | — | References 32/33 taxonomy disclosure | F-14, F-15 | **Open — new at Run A** |
| **OD-9** | — | Test-runner conflict | all missing-test tasks | **Open — new at Run A** |

### 2.2 Backend lane (L-B)

| Field | **B-V2-1** | **B-V2-2** | **B-V2-3** |
|---|---|---|---|
| **Checkpoint** | V2 (commit 1 of 3) | V2 (commit 2 of 3) | V2 (commit 3 of 3) |
| **Workstream** | Backend / database | Backend / AI | Backend / fixtures + tests |
| **Role** | backend implementer | backend implementer | backend implementer |
| **Worktree** | `worktrees/backend-48h` | same | same |
| **Owned paths** | `supabase/migrations/<new>_competency_vocabulary_rename.sql` (new only) · `server/modules/framework/dimensions.ts` · `server/db/database.types.ts` (**regenerated, never hand-edited**) · `scripts/tests/step-7i/verify-fresh-apply.mjs` · `scripts/tests/step-7i/static-scan.mjs` | `server/modules/ai-drafting/provider.ts` · `server/modules/ai-drafting/grounding.ts` · `scripts/tests/assessment/asm-suite.sql` (audit-privacy regex `:983`) | `scripts/fixtures/local_fixtures.sql` · `scripts/fixtures/verify-local-fixtures.sql` · `scripts/tests/assessment/run-assessment.mjs` · `scripts/tests/step-7i/lifecycle-canonical.sql` · `scripts/tests/integration/run-integration.mjs` · `docs/workstreams/48H_BACKEND_PROGRESS.md` |
| **Starting commit** | `4b58c6b0` | B-V2-1 tip | B-V2-2 tip |
| **Dependencies** | OD-2, **OD-6** | B-V2-1 | B-V2-2 |
| **Concurrent?** | **No** — sole L-B writer | No | No |
| **Required tests** | `verify-fresh-apply.mjs` (census → **8** migrations); deliberate guard violation **must abort** | grounding: rejects `rated as Beginning`; **accepts** "at the beginning of the session"; `run-integration.mjs` Part 1 (**no DB needed**) | `run-canonical.mjs` ×2 byte-identical; `run-assessment.mjs`; `run-correction-tracking.mjs`; canonical DB unchanged afterwards |
| **Commit message** | `feat(backend): rename competency rating vocabulary behind a fail-closed zero-row guard (Amendment 006 A-053)` | `feat(backend): replace bare-word rating leak guard with contextual attribution detection (A-052)` | `test(backend): reconcile fixtures, assessment, lifecycle and integration suites to the ratified vocabulary` |
| **Merge dependency** | → M-1 | → M-1 | → M-1 |
| **Stop condition** | Guard fails on a real DB; **any `report_versions` row exists**; hash anomaly; enum/table/function count moves; a Class Grade artefact would need to change | Contradiction test cannot be made to fail closed; any A-052 legal sentence is rejected | Canonical checksum not reproducible twice byte-identically |
| **Success evidence** | Migration applies to a disposable clone; abort transcript from the deliberately violated guard; census 8/26/12/31 | Two transcripts: attribution rejected, ordinary prose accepted | Dual byte-identical canonical transcripts; new checksum recorded |
| **Duration** | 30–45 min | 25–40 min | 25–35 min |
| **Status** | **Blocked — OD-2, OD-6** | Blocked — B-V2-1 | Blocked — B-V2-2 |

> **B-V2-1 note.** `ALTER TYPE … RENAME VALUE` is transactional, so the guard and the three renames share one transaction as the plan requires. The new file must sort after `20260806103000`. **The canonical fixture checksum `d6a314b4…b87517` will move** because fixture rating labels change — a moving checksum is expected; a non-reproducible one is a stop condition.

### 2.3 Frontend lane (L-F) — rating-free, parallel-safe with V2

| Field | **F-05** | **F-08** | **F-11** |
|---|---|---|---|
| **Checkpoint** | F5 · screen 06 | F8 · screen 08 | F11 · screen 29 |
| **Role** | frontend implementer | frontend implementer | frontend implementer |
| **Worktree** | `worktrees/frontend-48h` | same | same |
| **Owned paths** | `features/trainer/trainer-roster.tsx` · `06-…/implementation-notes.md` | `features/trainer/trainer-draft-generation.tsx` · `08-…/implementation-notes.md` | `features/management/management-reports-queue.tsx` · `lib/frontend/contracts/physical-test.ts` (**status union line only**) · `29-…/implementation-notes.md` |
| **Starting commit** | `d1883db9` | F-05 tip | F-08 tip |
| **Dependencies** | F2/F3 delivered | none in code | none in code |
| **Concurrent with V2?** | **Yes** — disjoint worktree, no `RATING_LEVELS` import | **Yes** | **Yes** — its one shared-file line is not F-06's |
| **Required tests** | reference SHA-256; tsc; eslint; build (census **16**); trainer smoke; zero console errors | same | same, plus the widened union typechecks |
| **Commit message** | `feat(frontend): reconstruct trainer student roster` | `feat(frontend): reconstruct trainer AI report generation` | `feat(frontend): reconstruct management reports queue` |
| **Stop condition** | Route census moves; reference SHA mismatch; a frame-vs-rule conflict appears (record, do not resolve) | same | `draft_ready` would expose report content to Management |
| **Duration** | 30–45 min | 30–45 min | 25–40 min |
| **Status** | **Ready now** | **Ready now** *(reclassified — renders no rating)* | **Ready now** |

> **F-08 reclassification.** The tracker marks F8 "Blocked by F6". Verified in code: `trainer-draft-generation.tsx` renders **no rating value**. Its blockage was inherited from flow order, not from a code dependency. Sequencing it after F7 is a preference, not a dependency.

> **F-11 scope.** Needs the status union widened to `"trainer_approved" | "needs_edit" | "draft_ready"` — **metadata only**; `draft_ready` exposes no report content. A `draft_ready` row must show **"Send Reminder to Trainer"** (`CLAUDE.md:225`), an affordance present in neither the frame nor the current component.

### 2.4 Frontend lane — vocabulary and rating-bearing

| Field | **F-06** | **F-07** | **F-09** | **F-12** |
|---|---|---|---|---|
| **Checkpoint** | F6 · V3 | F7 · screen 07 | F9 · screen 10 | F12 · screen 19 |
| **Owned paths** | `lib/frontend/contracts/physical-test.ts` (lines 1–8) · `lib/frontend/fixtures/dimensions.ts` · `lib/frontend/fixtures/physical-test-fixture.ts` · `features/trainer/trainer-assessment.tsx` · `features/trainer/trainer-report-review.tsx` · `tests/frontend/*-browser-smoke.mjs` · `docs/workstreams/48H_FRONTEND_PROGRESS.md` | `features/trainer/trainer-assessment.tsx` · rating tile primitive · `07-…/implementation-notes.md` | `features/trainer/trainer-report-review.tsx` · `trainer-report-editor.tsx` · `10-…/implementation-notes.md` | `features/management/management-report-review.tsx` · `19-…/implementation-notes.md` |
| **Starting commit** | F-11 tip **and** B-V2-3 merged/pinned | F-06 tip | F-07 tip | F-09 tip |
| **Dependencies** | **Backend V2** (union + anchors) | F-06 | F-06, F-07 | F-06, F-11, **OD-7** |
| **Concurrent?** | **No** — owns the union | No | No | No |
| **Required tests** | both smoke suites; anchors **byte-identical to backend**; `classGrade` union byte-unchanged; WCAG re-verified for all four rating states | reference SHA; a11y; keyboard; console clean | same | same, **plus** a negative assertion that no per-dimension rating renders |
| **Commit message** | `feat(frontend): adopt the ratified competency vocabulary (Amendment 006 A-049)` | `feat(frontend): reconstruct trainer grade student` | `feat(frontend): reconstruct trainer student report` | `feat(frontend): reconstruct management student report` |
| **Stop condition** | A contrast pair fails and cannot be fixed without a token change; a fixture cannot express the union without a backend change; any Class Grade artefact would change | Frame vs rule conflict | `/edit` route decision must **not** be resolved here | **Any prohibited element from reference 19 would be implemented** |
| **Duration** | 35–50 min | 30–45 min | 30–45 min | 35–50 min |
| **Status** | **Blocked — Backend V2** | Blocked — F-06 | Blocked — F-06 | **Blocked — OD-7** *(not F6 — renders no rating)* |

> **F-12 reclassification.** The tracker marks F12 dependent on "F6 (superseded rating union)". Verified: `management-report-review.tsx` imports `DIMENSION_CODES` only to populate a return-to-trainer dimension `<select>`; **no rating value is rendered**. F12's real blocker is OD-7. `19-management-student-report/screen.md:124` calls it "a rating-bearing screen" — that statement does not match the code and should be corrected when OD-7 is answered.

### 2.5 Frontend lane — parent screens

| Field | **F-14** | **F-15** |
|---|---|---|
| **Checkpoint** | F14 · screen 32 | F15 · screen 33 |
| **Owned paths** | `features/parent/parent-reports-list.tsx` · `32-…/implementation-notes.md` | `features/parent/parent-canonical-report.tsx` · `33-…/implementation-notes.md` |
| **Dependencies** | F13 delivered, **OD-8** | F-14, **OD-8** |
| **Concurrent with V2?** | Yes for everything except the chip decision | No |
| **Required tests** | **negative assertion: no rating token renders on any parent surface** | same, plus the four governed panels only |
| **Commit message** | `feat(frontend): reconstruct parent reports list` | `feat(frontend): reconstruct parent class report` |
| **Stop condition** | An aggregate rating chip would be implemented | **Any** of: per-dimension grid, "Overall Grade", prose rating attribution, evidence video |
| **Duration** | 25–40 min | 35–50 min |
| **Status** | **Blocked — OD-8** *(tracker records "None known" — incorrect)* | **Blocked — OD-8** |

> **F-15 is a reconstruction that must deliberately omit four things the frame contains**, each recorded not resolved: the Performance Summary grid (ratified), "Overall Grade: Mastering" (**unrecorded**), the prose rating attributions (**unrecorded**), and the Watch Together evidence video. The current code is **already compliant** — it renders exactly the four governed panels. F15 is not a "remove the leak" job.

### 2.6 Conditional and integration

| Field | **F-04** | **M-1** | **M-2** | **F-16** | **F-17** | **X-1** |
|---|---|---|---|---|---|---|
| **Checkpoint** | F4 · screen 05 | merge | merge | F16 | F17 | correction |
| **Role** | frontend implementer | integration implementer | integration implementer | integration implementer | integration/UAT verifier | implementer + verifier |
| **Worktree** | frontend | main | main | main (or short-lived branch off main) | main | as owned |
| **Owned paths** | `app/(portals)/trainer/schedule/**` (new) · `features/trainer/**` · `05-…/implementation-notes.md` | — | — | `app/**` · `middleware.ts` (new) · `lib/frontend/**` · `server/modules/identity-access/**` (ported) · `features/**` | `tests/**` · evidence | targeted |
| **Dependencies** | **OD-1 = "build"** + a Trainer schedule/date projection that **does not exist** | all core screens accepted | M-1 | M-2, V2+V3 across all three layers | F-16 accepted | F-17 |
| **Concurrent?** | No | No | No | No | No | No |
| **Required tests** | census **16 → 17**, recorded | typecheck/lint/build on merged tree | same | full matrix; `participantEligible === true` everywhere | **G-1 … G-21 each recorded** | re-run failed gates |
| **Commit message** | `feat(frontend): reconstruct trainer schedule` | `merge: integrate feat/48h-backend into main` | `merge: integrate feat/48h-frontend into backend-integrated main` | `feat: wire the real participant adapter, authentication and route authorization` | `test: three-role physical-test walkthrough against acceptance gates G-1..G-21` | `fix: targeted physical-test corrections` |
| **Stop condition** | Census moves without a `CHANGE_LOG.md` entry | Backend not merged first | — | **Any portal route reachable without identity** | Any of G-8, G-9, G-12, G-13, G-14, G-15, G-16 fails | A frame-vs-rule conflict is "resolved" |
| **Duration** | 60–90 min | 20–30 min | 30–45 min | **150–240 min** | 45–60 min | 60–120 min |
| **Status** | **Blocked — OD-1** *(skipped if fold accepted)* | Blocked | Blocked | Blocked | Blocked | Blocked |

> **F-16 carries work no checkpoint currently owns.** Beyond the adapter swap: `middleware.ts` (**absent on both branches**), a route guard on **every** portal route (**absent everywhere** — verified), `/` → `/login` (still the `create-next-app` starter), the seven `bg-brand-600` contrast sites, and the read-RPC keying mismatch — `getTrainerWorkingReport(reportId)` and `getManagementReview(reportId)` are **arity-incompatible** with RPCs keyed `(class_session_id, student_id)`, and no backend resolver exists. `RealParticipantPhysicalTestPort` is a **declared type with no implementation** (23 methods).

---

## 3. Concurrency matrix

| | B-V2-* | F-05 | F-08 | F-11 | F-06 | F-07/09/12 | F-14/15 | F-16/17 |
|---|---|---|---|---|---|---|---|---|
| **B-V2-*** | — | **Yes** | **Yes** | **Yes** | No | No | Yes* | No |
| **F-05/08/11** | Yes | — | serial within L-F | serial | No | No | serial | No |
| **F-06** | No | No | No | No | — | No | No | No |
| **F-16/17** | No | No | No | No | No | No | No | — |

\* F-14 may proceed in parallel with V2 on everything except the OD-8 chip decision.

**Only one writer per worktree, ever.** L-F tasks marked "Yes" against V2 are concurrent **with the backend lane**, not with each other.

---

## 4. Validation scheduling — a global mutex

No test agent runs while any writer is active in the same worktree, and **no two test agents run anywhere in the workspace at once.**

| Hazard | Mechanism | Consequence |
|---|---|---|
| Port 3000 | Both worktrees serve the same origin | **Silent false green** — assertions execute against the wrong application |
| CDP 9331/9332/9345 | Hard-coded, **no env override** | Second Chrome fails to bind; the runner attaches to the first run's browser |
| `.next` | `next build` writes while `next dev` reads | "Census unchanged at 16" can pass against stale output |
| `tsconfig.tsbuildinfo` | Per-worktree, shared **within** one | Two `tsc --noEmit` race; the loser can exit 0 from stale program info |

`tsconfig.tsbuildinfo` in the main repo is stale by seven days and is **irrelevant** — it belongs to a third checkout that receives no writes in Run B. **Do not delete it**; deletion is a prohibited mutation and buys nothing.

---

## 5. Tasks that may be skipped while independent work continues

- **OD-3, OD-4** — recorded, not resolved, by their checkpoints. Never block.
- **OD-5** — deferrable to F-16; the ratified treatment is already "replace after integration, preserve the pinned path as a redirect".
- **Academy-wordmark disposition** — carried unchanged through four checkpoints; defer to F-16.
- **All 24 deferred screens** — none appears in this graph.
- **`reopenSubmitted` / U-29** — deliberately deferred; not needed for the twelve-screen flow.
- **F-04** — skipped entirely if OD-1 accepts the fold.

**While the critical path is blocked on OD-2, the correct parallel work is F-05, F-08 and F-11** — all core screens, all rating-free, all disjoint from V2.

---

*Produced at Run A, 2026-08-06. No repository file, Git state, database or screenshot was modified.*
