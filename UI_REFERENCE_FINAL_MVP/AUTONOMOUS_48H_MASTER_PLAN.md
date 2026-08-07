# Autonomous 48-Hour Sprint — Master Plan

**Produced at:** RUN A — multi-agent autonomous planning checkpoint, 2026-08-06 (Asia/Singapore)
**Status:** Planning artefact. **Procedural and subordinate.** It overrides no specification, no amendment, `CLAUDE.md`, the Implementation Plan or the physical-test contract.
**Authority:** Derived from verified Git state and the governing documents. **Chat history is not authority.**

> **This document authorizes nothing.** Every Run B checkpoint named here still requires its own explicit operator authorization. No code, route, migration, fixture, test or screenshot was changed to produce it.

---

## 1. Verified current state

### 1.1 Git baseline — verified by direct inspection, not by report

| Repository | Path | Branch | HEAD | Tree |
|---|---|---|---|---|
| Main MVP | `SDS Project Final (BEST Coach)` | `main` | `7c0a3591c2e4ffcea05161caf536921696b31fff` | clean |
| Backend worktree | `worktrees/backend-48h` | `feat/48h-backend` | `4b58c6b06700ecdc8591e3cce7b0c55d48c55ac8` | clean |
| Frontend worktree | `worktrees/frontend-48h` | `feat/48h-frontend` | `d1883db9cd977f294747f4baad728d1be5bcebda` | clean |
| Frozen demo | `SDS Project Sprint 2` | `main` | `8d4acf4abc5039c24da01be773ab1a5e4916080f` | clean; tag `demo-freeze-step14-2026-07-21` → `8d4acf4a`, intact |

**Frontend commit chain after F1** (`84b45189d7dfab30a93da8aa0b90a08fa2c165dc` = F1 visual foundation) — verified in order:

1. `07988a57239726d8b026165e2bc51c28da2147a5` — F2 shared authentication shell
2. `b72752a88ed84144a135d19b64aea2c1658ceb95` — F3 Trainer login
3. `52d26d08f6ae3439b9bf46c4561c17ed1f4acfb2` — F10 Management login
4. `d1883db9cd977f294747f4baad728d1be5bcebda` — F13 Parent login

**Branch topology.** `git merge-base feat/48h-backend feat/48h-frontend` = `7c0a3591…` — identical to `main`'s HEAD. Both branches are pure divergences from the current tip. **Changed-file overlap between the two branches is empty** (36 backend files vs 69 frontend files; `comm -12` returns nothing). The merge-conflict surface is **semantic, not textual**.

### 1.2 Other baseline invariants — all verified

- **All 12 core `reference.png` files match their recorded SHA-256 and byte counts exactly.** No screenshot changed.
- **The UI pack is outside every Git repository** (`git rev-parse --show-toplevel` fails from `UI_REFERENCE_FINAL_MVP`; no parent is a repository).
- **Reconstruction tracker**: F0 and F1 `Accepted by the operator`; F2/F3/F10/F13 `Ready for review` with implementation commits matching the four SHAs above exactly.
- **No other checkpoint is marked complete.** F4–F9, F11, F12, F14–F17 are all pending or blocked.
- **Route census = 16**, verified independently by enumerating `app/**/page.tsx`.

### 1.3 The vocabulary-migration window — corrected

Amendment 006 A-053 mandates a fail-closed in-transaction guard proving **zero rows** in `report_versions`, `report_version_ratings` **and `observation_ratings`**.

| Table | State established from source | Window |
|---|---|---|
| `report_versions` | Never created by fixtures. `local_fixtures.sql:509–516` **aborts the load** unless it is empty; `verify-local-fixtures.sql:239–244` re-asserts. Test suites create report rows only on disposable clones that are dropped. | **OPEN** |
| `report_version_ratings` | Same two committed guards. | **OPEN** |
| `observation_ratings` | **9 rows inserted by design** (`local_fixtures.sql:368–388`), and the loader's own guard *requires* them (4 levels represented, ≥1 `emerging`, ≥1 `advanced`). | **CLOSED on any fixture-loaded database** |

**Consequence — the single most important finding of Run A.** The migration **as literally specified will `RAISE EXCEPTION` and abort on the canonical fixture database, on the first attempt.** This is not a defect in either document; the ratified fixture and the ratified guard were authored for different purposes and have never been executed together. It is **unresolved operator decision OD-6** (§8). The window has **not** been knowingly closed — it has never been open for `observation_ratings` on a loaded database.

### 1.4 Where the vocabulary actually stands

Amendment 006 is **ratified and unimplemented in all three layers** — verified in code, not inferred:

- Migration `20260803034500_step_7e_governed_core.sql:110–114` still declares `'emerging','developing','secure','advanced'`.
- Backend `server/modules/framework/dimensions.ts:27` (`RATING_LEVELS`), `:34–43` (`RUBRIC_ANCHORS`), `:46–51` (`POLARITY_BANDS`).
- Frontend `lib/frontend/contracts/physical-test.ts:1–8`.

This is the **expected** pre-V2/V3 state. It must not be "fixed" without V2/V3 authorization.

---

## 2. Sprint objective

Deliver a **real, governed, three-role physical test** of the twelve core screens: a participant signs in as Trainer with a real Supabase Auth identity, assesses a student across all nine dimensions, obtains a grounded AI draft, approves it; a participant signs in as Management, performs final review and Approve & Submit; a participant signs in as Parent and reads only the canonical submitted report.

**The objective is the acceptance gates, not the screenshots.** Completion is defined by **G-1 … G-21** (`PHYSICAL_TEST_SLICE_48H.md` §13), not by visual resemblance to twelve frames.

---

## 3. In-scope: the twelve-screen physical-test flow

`AUTH-01 · 05 · 06 · 07 · 08 · 10 · AUTH-02 · 29 · 19 · AUTH-03 · 32 · 33`, in that flow order (Amendment 005 A-043).

**What the twelve screens do not cover.** Eight design families are exercised by the walkthrough but have **no Figma frame** — six management review-stage surfaces (review queue, final review, wording-only editor, return-to-trainer dialog, correction tracking, final Approve & Submit) plus two notification surfaces. They are built to the governed contract's field lists. **No frame, node ID or field may be invented for any of them.** Screens 19 and 29 are the *canonical submitted-report* surfaces; the review-stage surfaces are separate and remain blocked.

Fixture-mode implementations of several of these already exist at `/management/reports/[reportId]/review` and `/edit` — they exist in code without a visual reference, which is the correct state, not a gap.

---

## 4. Deferred: the 24 portal screens

Post-48-hour final-MVP scope (A-044). **They must not be required to be visually complete before the physical test, and none may be added to the critical path.** No deferred screen appears in the task graph.

---

## 5. Completed work — stated in the four distinct senses

These five states are **not synonyms** and are tracked separately throughout this plan.

| Checkpoint | Implementation complete | Visually accepted | Fixture-mode accepted | Integrated | Physical-test ready |
|---|---|---|---|---|---|
| **F0** planning | n/a (no code) | n/a | n/a | n/a | n/a |
| **F1** visual foundation | **Yes** — `84b45189` | n/a (claims no screen) | n/a | No | No |
| **F2** shared auth shell | **Yes** — `07988a57` | **No** — operator review awaiting | **Awaiting** | No | **No** |
| **F3** Trainer login | **Yes** — `b72752a8` | **No** | **Awaiting** | No | **No** |
| **F10** Management login | **Assertions only** — `52d26d08` adds **zero product code** | **No** | **Awaiting** | No | **No** |
| **F13** Parent login | **Assertions only** — `d1883db9` adds **zero product code** | **No** | **Awaiting** | No | **No** |
| All others | **No** | No | No | No | No |

**`SCREEN_INDEX.md` still records visual acceptance as `Not started` for all 36 screens. Only the operator changes that.** Nothing in this workspace is visually accepted.

**A precise statement of what the authentication batch delivered.** F2 is the only one of the four that adds product code (9 files, +917/−104, of which 450 lines are the smoke suite). F3 adds 54 lines of product change. **F10 and F13 are pure verification checkpoints** — 2 files each, assertions and the progress log only. This is correctly scoped work, but "four login checkpoints delivered" overstates the delivered capability, and the plan below does not rely on it.

---

## 6. Remaining work

### 6.1 Backend

- **V2** — the three-statement enum rename behind the fail-closed guard, plus the rating union, rubric anchor re-keying, polarity mapping, provider schema/prompt, **the contextual leak-detection replacement**, the audit-payload privacy assertion, fixtures, three test suites and regenerated types.
- **Two files carrying a hard `7`-migration pin are absent from the plan's owned-path list** and will break when an eighth migration lands: `scripts/tests/step-7i/verify-fresh-apply.mjs:171,202` and `scripts/tests/step-7i/static-scan.mjs:46`. They must be added to V2's ownership.
- **`request-draft-core.ts` requires no edit** — it contains no superseded label (only `"developing"` at `:298`, which A-049 leaves unchanged). It may remain on the owned list harmlessly, but no change is expected.

### 6.2 Frontend

F6 (V3 vocabulary), F4, F5, F7, F8, F9, F11, F12, F14, F15 — plus, at F16, four items that **no current checkpoint owns**:

- **`app/page.tsx` is still the unmodified `create-next-app` starter.** `/` does not redirect to `/login`.
- **There is no route guard on any portal route.** Verified: `grep -rE "resolveSession|requireRole|redirect\(|unauthorized|getSessionUser" "app/(portals)"` returns **nothing**. Every workspace route is reachable by typing the URL with no identity.
- **There is no `middleware.ts` on either branch** — no session refresh, no cookie propagation.
- **The F1 accessibility fix is bypassed at seven sites.** `brand-600` = `#ec4899` (3.53:1 under white text); the accessible value `#d6357a` is `brand-700`. Seven components render white-label buttons on `bg-brand-600`: `management-dashboard.tsx:105`, `management-report-review.tsx:137`, `management-reports-queue.tsx:115`, `management-wording-editor.tsx:94`, `parent-dashboard.tsx:91`, `parent-reports-list.tsx:82`, `returned-reports-queue.tsx:61`. This is a **live WCAG 2.2 AA failure**, not a planning risk.

### 6.3 Integration

F16 (real adapter, real auth, route guards, middleware) and F17 (walkthrough against G-1 … G-21).

---

## 7. Critical path

```
OD-2 (authorize V2)  →  BACKEND V2  →  F6 (V3)  →  F7 → F9  →  F12
                                                                  ↓
                       backend → main  →  frontend → main  →  F16  →  F17  →  targeted correction
```

**Six of the eighteen checkpoints sit behind a single authorization (OD-2).** V2 has near-zero cost today and becomes **permanently impossible** once a `report_versions` row exists (A-053 — frozen content hashes would be unreproducible forever). **V2 is the highest-leverage, lowest-cost action available and should be authorized first.**

**Estimated agent time on the serial chain: ~8–11 hours.** The binding constraint on a 48-hour sprint is **not** agent throughput — it is (a) the unresolved operator decisions in §8 and (b) operator review latency at roughly ten gates.

---

## 8. Unresolved operator decisions

**No Run B work that depends on these may begin until they are answered.** Recommendations are given with consequences; the operator decides.

| # | Decision | Blocks | Recommendation | Consequence of the alternative |
|---|---|---|---|---|
| **OD-1** | `/trainer/schedule` — accept the `/trainer` fold, or build the route (inventory §7.3, U-A5-1) | F4, F5 sequencing, the trainer walkthrough entry | **Accept the fold.** | Building it costs 60–90 min, adds a route family the contract §4 pins, and needs an undelivered Trainer schedule/date projection (§8.2). It buys **no acceptance gate**. Accepting it makes the visual subset 11 frozen frames + 1 deliberately substituted surface — which must be recorded, not glossed. |
| **OD-2** | Authorize **Backend V2** | V2, F6, F7, F8, F9, F12, F16, F17 | **Authorize immediately.** | Every hour of delay increases the chance a `report_versions` row is created by an integration run, which closes the window **irreversibly**. |
| **OD-3** | Whether `/trainer/reports/[reportId]/edit` becomes a canonical sub-route of ID 10 or takes its own ID | F9 (record only) | **Defer.** Record, do not resolve. | None — explicitly recorded-not-resolved by its checkpoint. |
| **OD-4** | Whether `/management/reports/[reportId]/review`'s two governed surfaces separate | F12 (record only) | **Defer.** Record, do not resolve. | None. |
| **OD-5** | Canonical route moves before the physical test, or after integration | F5, F8, F9, F12, F15 | **After integration.** | Inventory §7.2 already assigns every core mismatch "Replace after integration"; contract §4.1 states the pinned routes are the ones the physical test runs on. Moving six core routes inside the window is pure risk with no gate benefit. Note screens 33 and 08 currently sit on paths that **match** the read-RPC key better than the canonical ones do. |
| **OD-6** | **NEW — the `observation_ratings` zero-row conflict** (§1.3) | **Backend V2 — hard block** | **Option (a): apply the rename on a clean schema apply *before* fixture load, then reload fixtures carrying the new labels.** V2 already owns `local_fixtures.sql`, so this needs no amendment and satisfies A-053 literally. | Option (b) narrowing the guard to the two hash-bearing tables requires **an amendment** — A-053 and R-A6-4 name all three tables at amendment level, and no plan document may narrow it. Option (c), deleting fixture rows ad hoc, is prohibited. |
| **OD-7** | **NEW — reference `19` (Management) shows prohibited content** | **F12** | **Rule wins; implement without the prohibited elements and record every omission.** | The frame carries a per-dimension PERFORMANCE SUMMARY grid (SPEECH/MASTERING, TONALITY/MASTERED, EYE CONTACT/BEGINNING, AUDIENCE AWARENESS/DEVELOPING), an "Overall Grade: Mastering" row, a "Report for: Parent \| Management" toggle, a "Save as draft" action and a Class Video Evidence player. `CLAUDE.md:263` states Management "never reads … raw per-dimension ratings"; `:225` forbids it "on **any** row, `trainer_approved` included"; `:263` states "There is no `kind` enum and no `audience` column on a version". **This conflict is recorded nowhere** — the tracker's F1 finding names only reference 33. |
| **OD-8** | **NEW — reference `32` (Parent) shows aggregate rating chips**, and reference `33` leaks the taxonomy beyond the recorded grid | **F14, F15** | **Rule wins; omit and record.** | Reference 32 renders per-report chips reading "Mastering"/"Developing" on a Parent surface. The screenshot-validation report cleared it as "overall grade only — no per-dimension rating grid", which is **literally true and materially incomplete**. Tracker Table D records F14's blocker as "**None known**" — **that is wrong.** Reference 33 additionally carries "Overall Grade: Mastering" and prose rating attributions ("Assessed as **Mastered** in eye contact…"), neither of which the ratified F1 finding covers. |
| **OD-9** | **NEW — test-runner conflict** | Every "write the missing test" task | **Rule on it before Run B.** | `CLAUDE.md:486–488` fixes the stack as Vitest + RTL + Playwright and A-009 **pre-approves** installing them; `FRONTEND_RECONSTRUCTION_PLAN.md:552` states "**No test-runner dependency exists and none may be added without operator approval**", citing `CLAUDE.md` as its authority. Two active documents conflict. Zero hits for `vitest\|playwright\|@testing-library\|lighthouse` across all three repositories. |

**Decisions OD-3, OD-4 and the academy-wordmark disposition are non-blocking** and have already been carried unchanged through four checkpoints. Defer them to F16.

---

## 9. Proposed Run B phases

Each phase states its entry and exit criteria. **A phase may not begin until its entry criteria are provably met.**

### Phase 0 — Operator decision gate *(no agent work)*
- **Entry:** Run A accepted.
- **Exit:** OD-1, OD-2, OD-6, OD-7, OD-8, OD-9 answered and recorded in `CHANGE_LOG.md`.
- **Duration:** operator-bound.

### Phase 1 — Backend V2 *(lane L-B)*, with rating-free frontend work in parallel *(lane L-F)*
- **Entry:** OD-2 and OD-6 answered; backend worktree clean at `4b58c6b0`.
- **Work:** V2 in three commits (migration+guard+types → provider/grounding/audit-privacy → fixtures/suites/log). In parallel: **F5, F8, F11** — none renders a rating, none shares a file with V2.
- **Exit:** migration applies to a disposable clone **and aborts on a deliberately violated guard**; grounding rejects `rated as Beginning` **and accepts** "at the beginning of the session"; Class Grade artefacts byte-unchanged; census 8 migrations / 26 tables / 12 enums / 31 functions.
- **Duration:** 60–90 min (L-B) ‖ 85–125 min (L-F).

### Phase 2 — Frontend V3 (F6) *(lane L-F)*
- **Entry:** V2 committed; its exact union text and anchor bytes pinned into the F6 brief.
- **Exit:** four ratified labels in ratified order; anchors **byte-identical** to the backend copy; colour ramp unchanged in ordering; `classGrade` union byte-unchanged; both smoke suites green.
- **Duration:** 35–50 min.

### Phase 3 — Rating-bearing screens *(lane L-F, serial)*
- **Entry:** F6 accepted.
- **Work:** F7 → F9, then F12 (gated additionally on OD-7). F14/F15 gated on OD-8.
- **Exit:** per-checkpoint contract items 1–15; route census unchanged at 16.
- **Duration:** 30–45 min each; F12/F15 35–50 min each.

### Phase 4 — F4 *(conditional)*
- **Entry:** OD-1 resolved as "build". **Skipped entirely if the fold is accepted.**
- **Exit:** census moves 16 → 17, recorded in `CHANGE_LOG.md`.
- **Duration:** 60–90 min.

### Phase 5 — Merge *(pinned by contract §12)*
- **Entry:** all core screens implemented and accepted.
- **Work:** **backend merges to `main` first** (§12 step 5); frontend rebases/merges against the backend-integrated `main` and merges second (steps 6–7).
- **Exit:** `main` carries both halves; typecheck, lint, build green on the merged tree.
- **Note:** the empty changed-file overlap makes this low-risk textually. Budget the time for **semantic** reconciliation of the DTO divergences instead.

### Phase 6 — F16 integration
- **Entry:** Phase 5 complete; V2+V3 landed across all three layers; F16's eight preconditions met.
- **Work, in dependency order:** port `identity-access` into the merged tree → add `middleware.ts` → **guard every portal route with `requireRole`, denying non-disclosingly** → convert login to a real `<form action={signInAction}>`, enable credential fields, button reads "Sign in", delete the fixture note → server-derive the post-auth destination from `centre_memberships.role`, never from `?role=` → implement `RealParticipantPhysicalTestPort` (23 methods) → resolve the read-RPC keying mismatch → isolate (do not delete) the fixture → redirect `/` to `/login` → fix the seven `bg-brand-600` contrast sites.
- **Exit:** `identity.participantEligible === true` on every portal surface; no fixture affordance reachable; fixture mode selectable only by a non-default, non-participant-facing switch.
- **Duration:** 90–150 min **plus 60–90 min** for the auth/guard/middleware work no checkpoint currently scopes. Budget **150–240 min**.

### Phase 7 — F17 walkthrough
- **Entry:** F16 accepted; database reset and seeded; canonical verifier green on the **pristine** canonical DB; concurrency suite on a **separate disposable** DB.
- **Exit:** **G-1 … G-21 each recorded pass/fail**; scripted three-role dry run green with zero uncaught console errors.
- **Duration:** 45–60 min.

### Phase 8 — Targeted correction
- Correct against **gates, not impressions**. Any failure among **G-8, G-9, G-12, G-13, G-14, G-15, G-16** is a governance defect and outranks every visual defect. Run V4's seven cross-branch verifications — item 1 (independent rating unions, no shared import) is flagged by the plan itself as the single most likely residual defect; verify by **byte comparison**, not by reading side by side. Visual corrections last, one commit per screen. **Never resolve a frame-versus-rule conflict during correction** — the rule wins and the discrepancy stays recorded.

---

## 10. Parallel work lanes and serial gates

| Lane | Worktree | Writer | Scope |
|---|---|---|---|
| **L-B** | `worktrees/backend-48h` | exactly 1 | Backend V2 |
| **L-F** | `worktrees/frontend-48h` | exactly 1 | F4–F15 |
| **L-D** | `UI_REFERENCE_FINAL_MVP` | whichever lane owns the checkpoint | tracker/notes at contract item 12 |
| **L-R** | any | read-only | verification; runs **only when both writer lanes are idle** |

**Maximum useful concurrency is 2 writers + 0 concurrent test agents.**

**Validation is a global mutex.** Both worktrees serve `http://127.0.0.1:3000`, and the three browser suites hard-code CDP ports 9331 / 9332 / 9345 with **no environment override**. Two suites started together produce a **silent false green** — one binds, the other asserts against the wrong worktree's application. This is worse than a crash.

**Serial gates:** OD-2 → V2 → F6 → F7 → F9; Phase 5 merge order (backend first) is pinned by contract §12; F16 → F17.

**Safe parallel lanes:** F5, F8 and F11 alongside Backend V2 — verified disjoint file sets, none imports `RATING_LEVELS`. F11's only shared-file touch is a one-value status widening in `physical-test.ts`, which F6 does not touch.

---

## 11. Final audit and correction strategy

1. **G-1 … G-21**, recorded per gate.
2. **V4's seven cross-branch verifications**, byte-compared.
3. **The six named governance tests** — three are currently ABSENT and two are PARTIAL (see the risk register and the test matrix).
4. **Visual fidelity last**, via extension of the SHA-256 reference-fidelity assertion module to the remaining nine screens rather than eyeballing.
5. **Stop on the first route-census move.** F4 and F16 are the only checkpoints licensed to move it.

---

## 12. Physical-test setup and rehearsal requirements

- **Database isolation is mandatory (U-7I-21).** Non-concurrency proofs, preservation and repeatability run on the **canonical** fixture database, which stays **pristine**. Coordinated concurrency tests run on a **separate disposable** database that is deliberately dirtied and destroyed. These are two different databases and are not interchangeable.
- **Never `supabase db reset`.** It destroys the three synthetic Auth identities, and recreating them requires an interactive password prompt no agent may handle.
- **Fixture mode off for the primary walkthrough** (G-19), selectable only by an explicit non-default switch that is unreachable from a participant-facing surface.
- **Synthetic/seed data only, always** (ADR-6). **No credential in chat, in any file, in a log, in an error or in a report.**
- **Rehearsal:** one full scripted three-role dry run must pass **before** participants arrive, with the browser console clean. The dry run is the last exit criterion of Phase 7, not an optional extra.

---

## 13. What this plan deliberately does not do

It does not authorize Backend V2, reconstruct a screen, alter authentication, create a route, modify a database, create report data, resolve OD-1 … OD-9, or declare the sprint complete.

---

*Produced at Run A, 2026-08-06. Read-only planning checkpoint. No repository file, Git state, database or screenshot was modified.*
