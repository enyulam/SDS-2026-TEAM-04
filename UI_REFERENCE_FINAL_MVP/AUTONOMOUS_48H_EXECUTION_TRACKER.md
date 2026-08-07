# Autonomous 48-Hour Sprint — Execution Tracker

**Produced at:** RUN A, 2026-08-06 (Asia/Singapore). Sole writer in Run B: **the main orchestrator**.
**Status:** Initialized. **Every row reflects actual verified current state. No unimplemented work is marked complete.**

> **Scope clarification added 2026-08-08 (`CLAUDE.md` §15.1).** The 48-hour sprint this tracker covers is **CLOSED and formally accepted**; this file is now **HISTORICAL EVIDENCE for Runs B–C4**, and "actual verified current state" above should be read as *true of the sprint at the time each row was written*. **It is not the project's current status.** The canonical CURRENT STATUS is `SDS Project Final (BEST Coach)/docs/progress/STATUS.md`; the canonical HISTORICAL LOG is `docs/progress/BUILD_NOTES.md`; the Final MVP baseline is `FINAL_MVP_AUTHORITY_LOCK.md`. **No row below was edited.**

> **Never mark a row `Accepted`.** Only the operator does that, and only after review. **(This remains standing project policy — `CLAUDE.md` §14.7 and §15.6.)**
> **No cell may read `Pass` before the command has actually run and exited 0.**

---

## 0. Status vocabulary

| Status | Meaning |
|---|---|
| `Not started` | No work has begun |
| `Blocked — <gate>` | A named gate is not cleared |
| `Ready now` | All dependencies met; awaiting authorization |
| `In progress` | A writer holds the lane |
| `Ready for review` | Work complete, agent stopped, awaiting operator |
| `Accepted` | **Operator-set only** |

---

## 1. Phase 0 — operator decisions — ALL RESOLVED BY RUN B RULINGS R-B1…R-B13

Every Run A operator decision is answered by an explicit Run B operator ruling. The Run B prompt is the authority; it supplements the ratified workspace sources and overrides no governance instrument.

| ID | Decision | Status | Ruling | Answer |
|---|---|---|---|---|
| **OD-1** | `/trainer/schedule` — accept fold or build | **Resolved** | **R-B1** | **Build.** `/trainer/schedule` is the canonical Trainer entry route. `/trainer` preserved as a compatibility redirect/alias through the physical test. A working route may not be silently deleted. **F-04 is therefore IN scope, not skipped.** |
| **OD-2** | Authorize Backend V2 | **Resolved** | **R-B2** | **Authorized now.** No canonical report version may be created until Backend V2 is complete and verified. |
| **OD-3** | `/trainer/reports/[reportId]/edit` canonical ID | **Resolved** | **R-B4** | Adopt the canonical inventory route treatment before the physical test; preserve the working pinned path as a redirect/alias. Record only at F-09; the treatment lands at F-16. |
| **OD-4** | `/management/reports/[reportId]/review` surface split | **Resolved** | **R-B4** | As OD-3 — follow the exact route treatment in the ratified inventory; preserve pinned paths as aliases. |
| **OD-5** | Canonical route timing | **Resolved** | **R-B4** | **Before the physical test**, not after integration. All working pinned paths preserved as redirects/compatibility aliases through the physical test. |
| **OD-6** | `observation_ratings` zero-row conflict | **Resolved** | **R-B3** | **Do not weaken or amend the Amendment 006 zero-row guard.** Ordered procedure: (1) prove data synthetic; (2) pre-reset census; (3) implement V2 migration + updated fixtures; (4) clean local DB reset + ordered migration replay; (5) guarded enum migration runs **before** fixtures load; (6) load updated fixtures; (7) post-reset census. **No manual row deletion to make the migration pass.** Local only — never a remote or production database. |
| **OD-7** | Reference 19 prohibited content | **Resolved** | **R-B5** | **Governance overrides the frozen screenshot.** Management report screen must not expose raw per-dimension ratings, an overall competency grade, Trainer observations, evidence/video, attendance substance, Trainer notes, assessment editing controls, or a Parent-vs-Management audience toggle. Reference usable for shell, spacing, typography and allowed parent-facing wording panels. Management may edit wording only, return substantive concerns, and perform final Approve & Submit. **Record the visual deviation.** |
| **OD-8** | References 32/33 taxonomy disclosure | **Resolved** | **R-B6** | **Governance overrides the frozen screenshots.** Do not expose aggregate rating chips, per-dimension ratings, observations, correction history, hashes, version metadata or audit internals. Parent receives submitted canonical narrative only. **Record the visual deviation.** |
| **OD-9** | Test-runner conflict | **Resolved** | **R-B7** | **Use the existing assertion and browser harnesses first.** Playwright only if the existing harness cannot reliably prove real auth, unauthorized-route denial, the integrated three-role walkthrough and required rendered evidence — and then justified, isolated in its own commit, verified by tsc/lint/build, free of unrelated upgrades. **No Vitest or other runner. No `npm audit fix`.** |

### 1.1 Additional Run B rulings with no Run A decision row

| Ruling | Subject | Effect on the graph |
|---|---|---|
| **R-B9** | Authentication checkpoint status | F2, F3, F10, F13 are **fixture-mode visual checkpoints only** — not integrated-auth completion. F-16 must replace the fixture entry action with real authentication and add server-derived authorization and route protection. |
| **R-B10** | Auth secondary controls | No new password-recovery workflow this sprint. "Forgot password?" → non-interactive deferred text **or** omitted with the deviation recorded; never an interactive control that does nothing. No custom "Remember me" behaviour — use approved Supabase session persistence, else remove/render non-interactive and record. Neither blocks readiness when represented honestly. |
| **R-B11** | Root-route behaviour | `/` — unauthenticated → login; authenticated → redirect by **server-derived** active role and membership; **URL query must not establish authority**; no create-next-app starter content may remain. Physical-test starting role is presentation/default navigation only, never authorization. |
| **R-B12** | Fixture isolation | Fixture mode may remain only as an explicit development/automated-test mode: requires explicit env or config selection; visually identifiable when active; **not** the composition used for the F-17 integrated walkthrough; not reachable through the normal real-auth flow. |
| **R-B13** | Priority under time pressure | Order: (1) Backend V2 + DB safety; (2) Frontend V3 vocabulary; (3) real auth + route guards; (4) real adapter + lifecycle integration; (5) complete Trainer→Management→Parent flow; (6) privacy/authorization/audit proof; (7) remaining screen reconstruction; (8) minor visual refinement. **Never sacrifice F16/F17 functional integration or security proof for pixel-level fidelity.** Academy wordmark stays a documented non-blocking deviation (**R-B8**). |

### 1.2 Governance-overridden visual targets

References **19**, **32** and **33** are hereby marked **governance-overridden visual targets**. Each remains a valid reference for shell, spacing and typography, and an invalid reference for the prohibited substance listed in R-B5/R-B6. A visual deviation record is a required deliverable for each — not an optional note.

### 1.3 Scope fences reaffirmed at Run B Phase 0

- The **24 deferred screens** remain outside the sprint path. None appears in the Run B graph. None may be implemented.
- **F2, F3, F10, F13** are recorded as **fixture-mode visual acceptance only** (R-B9). They are not evidence of authentication, authorization or integration.
- **Real authentication, route security and fixture isolation are F-16 requirements**, not F2/F3/F10/F13 outcomes.

---

## 2. Task rows — Part A: identity, ownership, dependency

| Task | Phase | Owner | Worktree | Starting HEAD | Dependency status |
|---|---|---|---|---|---|
| **F-01a** | 1 | frontend implementer | `frontend-48h` | `d1883db9cd977f294747f4baad728d1be5bcebda` | **Met** — new Run B row (see §7.1) |
| **B-V2-1** | 1 | backend implementer | `backend-48h` | `4b58c6b06700ecdc8591e3cce7b0c55d48c55ac8` | **Met** — R-B2 authorizes; R-B3 resolves OD-6 |
| **B-V2-2** | 1 | backend implementer | `backend-48h` | *(B-V2-1 tip — recorded, not predicted)* | Gated on B-V2-1 |
| **B-V2-3** | 1 | backend implementer | `backend-48h` | *(B-V2-2 tip)* | Gated on B-V2-2 |
| **F-11** | 1 | frontend implementer | `frontend-48h` | *(F-01a tip)* | **Met** |
| **F-14** | 1 | frontend implementer | `frontend-48h` | *(F-11 tip)* | **Met** — R-B6 resolves OD-8 |
| **F-08** | 1 | frontend implementer | `frontend-48h` | *(F-14 tip)* | **Met** — **not F-06-blocked** (§6.1) |
| **F-04** | 1 | frontend implementer | `frontend-48h` | *(F-08 tip)* | **Met** — R-B1 = build; R-B4 route timing |
| **F-05** | 1 | frontend implementer | `frontend-48h` | *(F-04 tip)* | **Met** |
| **F-06** | 2 | frontend implementer | `frontend-48h` | *(Lane-B tip + V2 verified)* | Gated on Backend V2 acceptance |
| **F-07** | 3 | frontend implementer | `frontend-48h` | *(F-06 tip)* | Gated on F-06 |
| **F-09** | 3 | frontend implementer | `frontend-48h` | *(F-07 tip)* | Gated on F-06, F-07 |
| **F-12** | 3 | frontend implementer | `frontend-48h` | *(F-09 tip)* | **Met on vocabulary** — R-B5 resolves OD-7; **not F-06-blocked** (§6.2) |
| **F-15** | 3 | frontend implementer | `frontend-48h` | *(F-12 tip)* | **Met** — R-B6 resolves OD-8 |
| **M-1** | 5 | integration implementer | `main` | `7c0a3591…` | Gated on both pre-integration gates |
| **M-2** | 5 | integration implementer | `main` | *(M-1 tip)* | Gated on M-1 — **backend merges first, always** |
| **F-16** | 6 | integration implementer | `main` | *(M-2 tip)* | Gated on M-2 |
| **F-17** | 7 | integration/UAT verifier | `main` | *(F-16 tip)* | Gated on F-16 |
| **X-1** | 8 | implementer + verifier | as owned | *(F-17 tip)* | Gated on F-17 audit |

**Starting HEADs after the first task in each lane are recorded, not predicted.** Each task writes its predecessor's actual ending commit here before beginning.

**Lane-B ordering note.** R-B13 priority and the verified dependency graph put the bounded accessibility correction first (it touches shared tokens; doing it before screen work avoids re-touching every screen), then F-11 → F-14 → F-08 → F-04 → F-05. F-04 is sequenced before F-05 because F-05 (roster) is reached *from* the schedule route F-04 creates, and R-B1 makes that route canonical rather than optional.

---

## 3. Task rows — Part B: execution results

| Task | Status | Implementation result | Verifier result | Commit | Merge result | Retry |
|---|---|---|---|---|---|---|
| **F-01a** | **Ready now** | *(not started)* | *(not started)* | *(none)* | *(none)* | 0 |
| **B-V2-1** | **Ready now** | *(not started)* | *(not started)* | *(none)* | *(none)* | 0 |
| **B-V2-2** | Gated — B-V2-1 | *(not started)* | *(not started)* | *(none)* | *(none)* | 0 |
| **B-V2-3** | Gated — B-V2-2 | *(not started)* | *(not started)* | *(none)* | *(none)* | 0 |
| **F-11** | **Ready now** | *(not started)* | *(not started)* | *(none)* | *(none)* | 0 |
| **F-14** | **Ready now** | *(not started)* | *(not started)* | *(none)* | *(none)* | 0 |
| **F-08** | **Ready now** | *(not started)* | *(not started)* | *(none)* | *(none)* | 0 |
| **F-04** | **Ready now** | *(not started)* | *(not started)* | *(none)* | *(none)* | 0 |
| **F-05** | **Ready now** | *(not started)* | *(not started)* | *(none)* | *(none)* | 0 |
| **F-06** | Gated — Backend V2 | *(not started)* | *(not started)* | *(none)* | *(none)* | 0 |
| **F-07** | Gated — F-06 | *(not started)* | *(not started)* | *(none)* | *(none)* | 0 |
| **F-09** | Gated — F-06, F-07 | *(not started)* | *(not started)* | *(none)* | *(none)* | 0 |
| **F-12** | **Ready now** | *(not started)* | *(not started)* | *(none)* | *(none)* | 0 |
| **F-15** | **Ready now** | *(not started)* | *(not started)* | *(none)* | *(none)* | 0 |
| **M-1** | Gated — Phase 4 | — | — | *(none)* | *(none)* | 0 |
| **M-2** | Gated — M-1 | — | — | *(none)* | *(none)* | 0 |
| **F-16** | Gated — M-2 | *(not started)* | *(not started)* | *(none)* | *(none)* | 0 |
| **F-17** | Gated — F-16 | *(not started)* | *(not started)* | *(none)* | *(none)* | 0 |
| **X-1** | Gated — F-17 | *(not started)* | *(not started)* | *(none)* | *(none)* | 0 |

> `Ready now` means every named gate is cleared and the task awaits a writer slot under the one-writer-per-worktree rule. It does **not** mean the work is done, and no row here may be advanced to `Accepted` — that remains operator-set only.

---

## 4. Task rows — Part C: evidence

| Task | Tests | Visual evidence | Security / privacy evidence | Blocker | Operator decision | Final acceptance | Next action |
|---|---|---|---|---|---|---|---|
| **B-V2-1** | *(pending)* | — | *(pending)* — Class Grade byte-unchanged proof | **`observation_ratings` holds 9 fixture rows; the A-053 guard covers that table** | **OD-2, OD-6** | *(none)* | **Answer OD-6, then authorize V2** |
| **B-V2-2** | *(pending)* | — | *(pending)* — attribution rejected **and** ordinary prose accepted | Prohibited bare-word regex at `grounding.ts:50` | OD-2 | *(none)* | Await B-V2-1 |
| **B-V2-3** | *(pending)* | — | *(pending)* — audit-payload privacy on new labels | Canonical checksum will move | OD-2 | *(none)* | Await B-V2-2 |
| **F-05** | *(pending)* | *(pending)* — reference `78e4b618…` | *(pending)* | None | — | *(none)* | **Authorize** |
| **F-08** | *(pending)* | *(pending)* — reference `3160524f…` | *(pending)* | None | — | *(none)* | **Authorize** |
| **F-11** | *(pending)* | *(pending)* — reference `eddda3b1…` | *(pending)* — `draft_ready` exposes no content | None | — | *(none)* | **Authorize** |
| **F-06** | *(pending)* | — (not a visual screen) | *(pending)* — anchors byte-identical to backend | Backend V2 incomplete | OD-2 | *(none)* | Await V2 |
| **F-07** | *(pending)* | *(pending)* — reference `1df95a5b…` | *(pending)* | F-06 | — | *(none)* | Await F-06 |
| **F-09** | *(pending)* | *(pending)* — reference `e64291dc…` | *(pending)* | F-06; OD-3 recorded only | OD-3 | *(none)* | Await F-06 |
| **F-12** | *(pending)* | *(pending)* — reference `394d8475…` | *(pending)* — **negative: no per-dimension rating on a Management surface** | **Reference 19 carries a per-dimension grid, "Overall Grade", a Parent/Management toggle, "Save as draft" and an evidence video — all prohibited, and recorded nowhere** | **OD-7**, OD-4 | *(none)* | **Answer OD-7** |
| **F-14** | *(pending)* | *(pending)* — reference `90e368c1…` | *(pending)* — **negative: no rating token on any Parent surface** | **Reference 32 carries aggregate rating chips. Tracker records "None known" — incorrect.** | **OD-8** | *(none)* | **Answer OD-8** |
| **F-15** | *(pending)* | *(pending)* — reference `2aaeb446…` | *(pending)* — four governed panels only | Grid **(recorded)** + "Overall Grade" **(unrecorded)** + prose attributions **(unrecorded)** + evidence video | **OD-8** | *(none)* | **Answer OD-8** |
| **F-04** | *(pending)* | *(pending)* — reference `d2d58b16…` | *(pending)* | No route exists; needs an undelivered schedule/date projection | **OD-1** | *(none)* | **Answer OD-1** |
| **M-1** | *(pending)* | — | — | Core screens incomplete | — | *(none)* | Await Phase 3 |
| **M-2** | *(pending)* | — | — | M-1 | — | *(none)* | Await M-1 |
| **F-16** | *(pending)* | — | *(pending)* — **route authorization on every portal route** | **No route guard exists anywhere; no `middleware.ts` on either branch; `RealParticipantPhysicalTestPort` unimplemented; read-RPC keying mismatch; `/` is the `create-next-app` starter; 7 contrast failures** | OD-5 | *(none)* | Await Phase 5 |
| **F-17** | *(pending)* | *(pending — all 12)* | *(pending)* — G-1…G-21 | F-16 | — | *(none)* | Await F-16 |
| **X-1** | *(pending)* | *(pending)* | *(pending)* | F-17 | — | *(none)* | Await F-17 |

---

## 5. Carried-forward state — verified, not assumed

| Item | State | Evidence |
|---|---|---|
| Main repo | `main` @ `7c0a3591…`, clean | direct inspection |
| Backend worktree | `feat/48h-backend` @ `4b58c6b0…`, clean | direct inspection |
| Frontend worktree | `feat/48h-frontend` @ `d1883db9…`, clean | direct inspection |
| Frozen demo | `main` @ `8d4acf4a…`, clean; tag intact | direct inspection |
| 12 core screenshots | **All SHA-256 and byte counts match** | recomputed at Run A |
| UI pack | Outside every Git repository | `git rev-parse --show-toplevel` fails |
| Route census | **16** | enumerated `app/**/page.tsx` |
| Frontend rating union | `emerging/developing/secure/advanced` | `lib/frontend/contracts/physical-test.ts:1–8` |
| Backend enum | `emerging/developing/secure/advanced` | `20260803034500_step_7e_governed_core.sql:110–114` |
| `report_versions` rows | **Zero** — two committed load guards make non-empty impossible without a verifier failure | `local_fixtures.sql:509–516`; `verify-local-fixtures.sql:239–244` |
| `observation_ratings` rows | **Nine, by design** | `local_fixtures.sql:368–388` |
| Portal route guards | **None exist** | `grep -rE "resolveSession\|requireRole\|redirect\(" "app/(portals)"` → no matches |
| Branch file overlap | **Empty** | `comm -12` over both diff sets |
| F2/F3/F10/F13 | Implementation complete (fixture-mode); **not** visually accepted; **not** integrated | tracker + commit diffstats |
| F10, F13 product code | **Zero** — assertions and logs only | `git show --stat` |

---

## 6. Reconciliation notes carried into Run B

1. **F-08 is reclassified `Ready now`.** The tracker marks it "Blocked by F6"; the code renders no rating. Update `FRONTEND_RECONSTRUCTION_TRACKER.md` when the operator accepts this reclassification.
2. **F-12 is not F6-blocked.** `management-report-review.tsx` renders no rating value. `19-…/screen.md:124` calls it "rating-bearing" — that statement does not match the code.
3. **F-14's tracker blocker "None known" is incorrect.**
4. **Two files carrying hard `7`-migration pins are missing from V2's owned-path list** and must be added: `verify-fresh-apply.mjs`, `static-scan.mjs`.
5. **`request-draft-core.ts` needs no V2 edit** — it carries no superseded label.
6. **`docs/progress/STATUS.md` is stale** against the backend branch: it names Step 7I2A as the next permitted action, while those migrations are committed, and its census is one migration behind.
7. **`governance-source/` has materially drifted** and contains none of Amendments 001–006. Non-authoritative per A-055; no agent may read it as governance.

---

---

## 7. Run B Phase 0 reconciliation — verified corrections to the Run A record

Every item below was **re-verified against the actual working trees at Run B**, not carried forward on trust. Three Run A figures were found stale or incomplete and are corrected here.

### 7.1 F-01a — bounded accessibility correction (new Lane-B row)

Run A records **"seven"** `bg-brand-600` white-label sites. **The verified count at `d1883db9` is higher.** `grep -n "bg-brand-600"` returns **12 sites across 11 components**. Classification:

| # | Site | Carries text? | In correction scope |
|---|---|---|---|
| 1 | `features/trainer/trainer-roster.tsx:153` | white label | **Yes** |
| 2 | `features/trainer/trainer-roster.tsx:162` | white label | **Yes** |
| 3 | `features/trainer/returned-reports-queue.tsx:61` | white label | **Yes** |
| 4 | `features/trainer/trainer-draft-generation.tsx:142` | white label | **Yes** |
| 5 | `features/parent/parent-reports-list.tsx:82` | white label | **Yes** |
| 6 | `features/parent/parent-dashboard.tsx:91` | white label | **Yes** |
| 7 | `features/management/management-wording-editor.tsx:94` | white label | **Yes** |
| 8 | `features/management/management-report-review.tsx:137` | white label | **Yes** |
| 9 | `features/management/management-reports-queue.tsx:115` | white label | **Yes** |
| 10 | `features/management/management-dashboard.tsx:105` | white label | **Yes** |
| 11 | `components/brand/brand-mark.tsx:46` | logotype glyph | **No** — logotypes are WCAG-exempt and R-B8 requires the approved in-repository mark be used unaltered |
| 12 | `features/trainer/trainer-assessment.tsx:212` | none (progress-bar fill) | **No** — decorative pink carrying no text; the Run B prompt expressly forbids globally altering these |

**Scope: 10 sites across 9 components.** Token change `brand-600` `#ec4899` (3.53:1 on white — **live AA failure**) → `brand-700` `#d6357a` (4.52:1 — passes AA for normal text). The two exclusions are deliberate and recorded, not overlooked.

**Correction to Run A:** the figure of seven understated the defect. No site was dropped; the scope is *wider* than planned, not narrower.

### 7.2 Backend V2 ownership — a **third** hard-coded migration pin exists

Run A note 4 names **two** files carrying a hard `7`-migration pin. **There are three.** Adding the V2 migration moves the census 7 → 8, so every one of these fails unless updated in the same checkpoint:

| File | Line | Assertion |
|---|---|---|
| `scripts/tests/step-7i/verify-fresh-apply.mjs` | 171 | `files.length !== 7` |
| `scripts/tests/step-7i/static-scan.mjs` | 46 | `all.length !== 7` |
| **`scripts/tests/correction-tracking/ct-static.mjs`** | **146** | `all.length !== 7` — **named in no Run A owned-path list** |

All three are added to **B-V2-1** owned paths. Omitting `ct-static.mjs` would have produced a red gate attributable to no owner.

**CORRECTED AGAIN after the independent backend verifier ran (2026-08-06).** There are **six** pins, not three. The three above are `.mjs` static scanners and were reconciled by B-V2-1. Three further pins live in **runtime SQL suites** and were missed by both Run A and my own Phase 0 grep, which searched `.mjs` patterns:

| # | File | Line | Assertion | Reconciled by |
|---|---|---|---|---|
| 4 | `scripts/tests/assessment/asm-suite.sql` | 156 | `IF v_n <> 7 THEN RAISE EXCEPTION 'T-ASM-40: % migrations, expected 7'` — plus the comment at 152 and NOTICE at 168 both reading "7 migrations, 31 functions, 26 tables, 12 enums" | **B-V2-2** (owns `asm-suite.sql`) |
| 5 | `scripts/fixtures/verify-local-fixtures.sql` | 379 | `IF v_n <> 7 THEN RAISE EXCEPTION 'FAIL A34: expected exactly 7 applied migrations'` — plus stale comments at 69, 372, 377 | **B-V2-3** |
| 6 | `scripts/tests/step-7i/lifecycle-canonical.sql` | 233 | `IF v_n <> 7 THEN RAISE EXCEPTION 'FAIL T7I-73: applied-migration count is %, expected 7'` — plus the comment at 230 calling the correction-tracking migration "the seventh" | **B-V2-3** |

Every one falls inside an already-owned path, so coverage is complete without widening any contract — but each has now been named **explicitly** in its owner's assignment rather than left to discovery. The verified post-replay census is **8 migrations, 26 tables, 31 functions, 12 enums, 29 policies**.

### 7.3 Read-RPC arity mismatch — added to integration and backend correction scope

`lib/frontend/physical-test-port.ts:62` `getTrainerWorkingReport(...)` and `:77` `getManagementReview(...)` are keyed by a single `reportId`. The governed RPCs are keyed `(class_session_id, student_id)`. **No backend resolver from `reportId` to that pair exists.** The fixture satisfies the single-argument shape, so this is invisible until the real adapter is composed.

Both are added to **F-16** scope and to the **backend correction scope** (a resolver is a backend deliverable, not a frontend cast). Call sites requiring reconciliation: `trainer-report-review.tsx:71,132`, `trainer-report-editor.tsx:35`, `trainer-assessment.tsx:103`, `management-report-review.tsx:52`, `management-wording-editor.tsx:33`, plus `tests/frontend/fixture-lifecycle.assertions.ts`.

### 7.4 Root starter page — confirmed present, added to F-16

`app/page.tsx` is **verbatim `create-next-app` scaffolding** — `next.svg`, "To get started, edit the page.tsx file.", Vercel template links. Confirmed by direct read at `d1883db9`. R-B11 governs its replacement. **Route census confirmed at 16** (`find app -name page.tsx`), matching the Run A carried-forward figure.

### 7.5 F-08 and F-12 unblocked from F-06

Both Run A reclassifications are adopted as tracker fact, not merely as notes:

- **F-08** renders no rating value; its "Blocked by F6" status in `FRONTEND_RECONSTRUCTION_TRACKER.md` was inherited from flow order, not a code dependency. → **Ready now.**
- **F-12** imports `DIMENSION_CODES` only to populate a return-to-trainer dimension `<select>`; it renders no rating value. Its only real gate was OD-7, which **R-B5 resolves**. → **Ready now.** The claim at `19-management-student-report/screen.md:124` that this is "a rating-bearing screen" does not match the code and is superseded by R-B5.

`FRONTEND_RECONSTRUCTION_TRACKER.md` is a repository-adjacent pack file and will be updated by the designated screen implementers within their checkpoints, not retroactively here.

### 7.6 Scope fences — unchanged and reaffirmed

- **24 deferred screens** remain outside the sprint path; none is scheduled, and an evidence-auditor check that none entered scope is a Phase 4 gate.
- **F2, F3, F10, F13** = fixture-mode visual acceptance only (R-B9); explicitly **not** auth or integration evidence.
- **References 19, 32, 33** = governance-overridden visual targets (§1.2); a recorded visual deviation is a required deliverable for each.
- **`governance-source/`** has materially drifted and contains none of Amendments 001–006. **Non-authoritative per A-055 — no agent may read it as governance.** Carried forward from Run A note 7 and reaffirmed.

### 7.6a Scheduling correction — operator directive, Run B Phase 1 (recorded 2026-08-06)

**Directive.** The frontend lane must verify **per checkpoint**, not in one batch after F-05. Frontend verification may not be deferred.

**Defect in the as-launched Phase 1 schedule.** Phase 1 was launched with each frontend checkpoint as its own bounded agent and its own bounded commit — that part was correct — but with a **single** visual/accessibility verifier scheduled **after F-05**. That batches six checkpoints behind one review and lets a defective checkpoint seed five successors before anyone looks at it. The backend lane was not affected.

**Corrected frontend sequence — enforced individually for F-01a, F-11, F-14, F-08, F-04, F-05:**

1. finish the bounded implementation;
2. run its permitted writer-side checks;
3. update its records (`implementation-notes.md`, reconstruction tracker, frontend workstream log);
4. create its bounded commit;
5. verify the frontend worktree is clean;
6. **release the frontend writer**;
7. assign the **independent** frontend visual/accessibility verifier;
8. review the verifier report;
9. **continue to the next checkpoint only if the checkpoint passes.**

**Backend lane unchanged and explicitly permitted to remain** `B-V2-1 → B-V2-2 → B-V2-3 → independent backend verifier`, because those three commits form **one coordinated vocabulary/database checkpoint** whose intermediate states are not independently meaningful — B-V2-1 leaves the database migrated but deliberately unfixtured, and B-V2-3 is what restores a loadable fixture set.

**State at the moment of correction (verified, not assumed).** Both lanes were on their **first** checkpoint with **no commit yet in either**. Backend B-V2-1 held the new migration file plus `dimensions.ts` and the three count pins; frontend F-01a held the nine accessibility components. **No frontend agent had begun more than one checkpoint** — the as-launched design assigns exactly one checkpoint per agent — so no agent required truncation, and the "finish only the checkpoint currently being edited" provision had no subject.

**Application boundary.** The correction is applied from the **earliest safe boundary**: the first clean commit boundary in the frontend lane. No checkpoint actively being implemented was cancelled, interrupted, rolled back or restarted, and **no committed work was discarded**. Uncommitted work belonging to a successor checkpoint that had not yet reached a commit boundary is not "completed work" and its re-execution under the corrected schedule is not a rollback.

**Validation mutex unchanged.** Database mutation, builds, application servers, browser automation and fixed ports (3000, CDP 9331/9332/9345) remain serialized by the main orchestrator. A frontend verifier and the frontend writer never hold the worktree at the same time — step 6 (release) strictly precedes step 7 (assign).

#### 7.6a.1 The boundary actually taken — recorded, not predicted

A gate cannot be injected into a running workflow, so applying the correction required stopping and relaunching the Phase 1 process. The stop was **timed to a double clean boundary** rather than taken immediately:

| Time | Event |
|---|---|
| t+80 s | Backend **B-V2-1 committed `e5a66d7`** — migration census 7 → 8 |
| t+~5 min | Frontend **F-01a committed `6e8816e`** — worktree returned clean |
| immediately after | Phase 1 process stopped |

**State verified at the moment of the stop — all four repositories:**

| Repository | HEAD | Working tree |
|---|---|---|
| Backend `feat/48h-backend` | `e5a66d7` | **clean** |
| Frontend `feat/48h-frontend` | `6e8816e` | **clean** |
| Main `main` | `7c0a3591` — **unchanged** | clean |
| Frozen demo `main` | `8d4acf4a` — **unchanged** | clean |

**Both lanes were between checkpoints with clean trees.** B-V2-2 and F-11 had been dispatched but had produced no file change. Consequently the stop **interrupted no work in progress, discarded no committed work, and left no half-applied migration and no dirty tree** — the partial-run conditions the Run B contract requires are all satisfied at this boundary. No reset, restore, stash, discard, rebase or force-checkout was used at any point; the stop was a process stop, not a Git operation.

**Cost of the correction:** the re-dispatch of B-V2-2 and F-11, neither of which had written anything. This is the minimum achievable cost, and it is the reason the stop was timed rather than taken on receipt of the directive.

#### 7.6a.2 Retrospective verification of F-01a

F-01a committed **before** the corrected schedule took effect, so it never passed through steps 5–9. It is **not** exempt: an independent frontend visual/accessibility verifier is assigned to it retrospectively as the first action of the corrected lane, and **F-11 does not start until that verdict passes**. A checkpoint that committed under the superseded schedule is verified under the corrected one, not grandfathered.

#### 7.6a.3 Phase 1 commits to date

| Lane | Checkpoint | Commit | Status |
|---|---|---|---|
| A | B-V2-1 | `e5a66d7` | Committed — enum rename, guard, three `.mjs` count pins, regenerated types |
| A | B-V2-2 | `103f433` | Committed — bare-word regex **deleted** and replaced by five contextual rules; `provider.ts` union fixed (`tsc` now exits 0); `asm-suite.sql` audit-privacy regex and census pin reconciled |
| A | B-V2-3 | *(in progress)* | File reconciliation complete but **uncommitted** when the previous agent correctly stopped at the fixture-credential blocker; a continuation agent is closing it to a clean commit |
| B | F-01a | `6e8816e` | Committed — **retrospective verifier returned FAIL on a High finding (R-28)**; F-11 gated behind bounded correction **F-01b** |

#### 7.6a.6 F-08 BLOCKED — a Run A reclassification is overturned by the frozen frame

**F-08 returned BLOCKED with no commit and a clean worktree.** The blocker is substantive and corrects an assumption that passed through Run A, my Phase 0 reconciliation, and two of my own agent contracts unchallenged.

**The false premise.** Run A reclassified F-08 from "Blocked by F6" to "Ready now" on the evidence that `trainer-draft-generation.tsx` *renders no rating value*. That is true of the **current component** — and irrelevant, because the checkpoint's job is to reconstruct the **frozen frame**, and the frame does render ratings:

- a right-rail **"Overall Grade: Mastering"**;
- a four-tile **PERFORMANCE SUMMARY** grid — SPEECH/MASTERING, TONALITY/MASTERED, EYE CONTACT/…

Run A inspected the wrong artefact: the implementation rather than the reconstruction target. **F-08 is genuinely F-06-dependent**, and the original tracker position was right. §7.5's adoption of that reclassification is **overturned for F-08**. The parallel F-12 reclassification is *not* disturbed — it rests on `management-report-review.tsx` importing `DIMENSION_CODES` only to populate a `<select>`, and on R-B5 independently prohibiting rating substance on that surface.

**Three further blockers, each recorded not resolved:**

1. **The frame is a TERM REPORT** — titled *"Term Report — Alicia Gomez · Term 1, 2035 · Parent copy"*. End-of-term report **generation is expressly out of MVP scope** (CLAUDE.md §5, §8; v3 §28). Reconstructing it faithfully would pull a deferred instrument into scope.
2. **Class Video Evidence upload has no governed backing.** Evidence scope **and** uploader are UNRESOLVED (Amendment 002 A-014), evidence schema is excluded from Step 7E, and no upload path exists on `PhysicalTestPort`.
3. **"Confirm & Submit" appears as a trainer primary control with no Quality Checklist in the frame.** The trainer action is **Approve**, gated on the three-item version-scoped checklist, and the trainer **does not publish** (A-033, A-036). The frame contradicts the ratified two-stage workflow.

**Disposition.** F-08 is resequenced to **after F-06**, and will be reattempted under the same governance-wins-and-record discipline that F-14 executed successfully: reconstruct what is governed, omit what is prohibited or out of scope, record every omission. Blockers 1–3 may leave it partially reconstructed with recorded deviations rather than fully delivered. **The agent was correct to stop, commit nothing and leave the worktree clean** rather than fabricate a term-report generator, an evidence uploader and an ungated publish control.

#### 7.6a.7 Phase 1 result — Backend V2 complete and verified

| Lane | Checkpoint | Commit | Independent verdict |
|---|---|---|---|
| A | B-V2-1 | `e5a66d7` | **PASS** (as part of the coordinated checkpoint) |
| A | B-V2-2 | `103f433` | **PASS** |
| A | B-V2-3 | `ec5be57` | **PASS** |
| B | F-01a | `6e8816e` | FAIL → corrected by F-01b |
| B | F-01b | `69ca3e5` | **PASS** |
| B | F-11 | `77abff4` | **PASS** |
| B | F-14 | `50e0ee2` | **PASS** |
| B | F-08 | *(none)* | **BLOCKED** — see §7.6a.6 |

**Backend V2 verifier verdict: PASS**, with database-dependent verification explicitly INCOMPLETE per R-27. Exactly three commits, 17 files, **all backend-owned; zero files under `app/`, `lib/` or `components/`** — the branch-disjointness the merge order depends on is intact. Findings: one Medium (`run-canonical.mjs:36` holds a stale hardcoded canonical checksum `d6a314b4…b87517` that is not reconciled and not disclosed as stale — it cannot be re-derived until fixtures load, so it is recorded rather than guessed), two Low over-rejection edge cases in the A-052 rules, two acceptable deviations.

**A genuine fail-open defect was found and fixed inside B-V2-3.** `run-integration.mjs` Part 1 carried superseded rating literals, so `POLARITY_BANDS[rating]` was `undefined` and grounding rule 3 **silently skipped** — INT-G3 and INT-G5 printed PASS while exercising nothing. That is a fail-open degradation of CLAUDE.md §4 non-negotiable 1. It is now fixed and hardened with **INT-G0**, a fail-closed precondition proving every fixture rating resolves to a live polarity band *before* any grounding proof runs, and INT-G4 was re-keyed from a guarantee that could no longer be violated to one that can.

**Backend V2 is verified, not accepted.** Only the operator accepts, and its database-dependent gates remain blocked.

#### 7.6a.8 Phase 2 complete — Frontend V3 adopted and verified

| Checkpoint | Commit | Independent verdict |
|---|---|---|
| F-04 · screen 05 Trainer Schedule | `468ac56` | **PASS** |
| F-05 · screen 06 Trainer Student Roster | `84f7d80` | **PASS** |
| **F-06 · Frontend V3 vocabulary (A-049)** | `5dcbeeb` | **PASS** |

**R-B1 and R-B4 executed exactly.** `/trainer/schedule` is created as the canonical Trainer entry route; `/trainer` is **preserved as a 307 compatibility redirect** onto it — `app/(portals)/trainer/page.tsx` was *converted*, never deleted, and the redirect was measured on a production build. **Route census moved 16 → 17**, exactly one route added, none removed or renamed, cross-referenced in `CHANGE_LOG.md`, the tracker, `screen.md` §1 and the workstream log.

**The calendar is a projection, proved by construction.** `trainer-schedule-projection.ts` is a pure, side-effect-free date projection over the rows `listTrainerSessions()` already returns. No event table, agenda record, calendar entity or second store exists anywhere in the checkpoint — A-016's prohibition on duplicated calendar records is satisfied structurally, not merely asserted. Because that projection is the only input, the surface **cannot name a Class Session the trainer is not assigned to**; search and the view switch narrow what it returned and cannot widen it.

**F-06 anchor parity was independently verified, not trusted.** The verifier wrote its own brace-matched extractor and diffed the four behavioural anchors against `${BE}\\server\\modules\\framework\\dimensions.ts`. Rating unions agree exactly; polarity matches key-by-key with `mastering = positive`; the Class Grade union is byte-unchanged; and the diff was inspected for collateral edits to confirm **no global keyword replacement** occurred (A-054).

**A real defect was found and fixed inside F-04.** `sr-only` weekday names were absolutely positioned and escaped the scrolling table's clipping, extending `documentElement.scrollWidth` to 688px at a 480px viewport — a genuine horizontal **page** scroll (GLOBAL_UI_RULES §6). Re-measured 465 ≤ 480 after the fix.

**Carried forward as a correction, not a pass:** the F-06 verifier measured the nine per-dimension rating labels on `/trainer/reports/<id>/review` failing SC 1.4.3 in the rendered DOM. That file is owned by **F-09**, which is instructed to fix and re-measure it. It is newly-authored content, not a pre-existing shell defect.

#### 7.6a.9 Runtime projection and the fallback position

Approximately **4.5 of the ~10 authorized hours** are consumed. Phase 3 (five checkpoints, ten agents) is projected at 2.5–3 hours, leaving roughly 2–2.5 hours for Phases 4–9 and the final report.

**This will not be enough for a complete F-16 plus F-17.** Stated plainly now rather than discovered at the end:

- **F-17 cannot run at all** regardless of remaining time. The three-role walkthrough requires real Supabase Auth sign-in as synthetic Trainer, Management and Parent accounts. Those accounts do not exist — **R-27** destroyed them and only the operator can restore them. No amount of runtime changes this.
- **F-16 can be implemented but not proven end to end.** Real auth wiring, route guards, the real adapter, the read-RPC resolver and root routing are all authorable; the integration proof that would validate them needs the same accounts.

**Consequence for the readiness verdict.** A complete readiness verdict requires a successful F-17 walkthrough. That gate cannot be met in this run. The honest terminal state is therefore **PARTIAL**, and the run will end on the partial phrase, not the success phrase. Per R-B13 and §19 the remaining time is spent in priority order — Phase 4 verification and the ratified merge first, then as much of F-16 as fits — and every incomplete item is recorded as incomplete rather than presented as ready.

#### 7.6a.4 Verified database state after the A-053 migration

Confirmed directly against the running local stack, independent of any agent report:

| Check | Observed | Verdict |
|---|---|---|
| `competency_rating` | `beginning, developing, mastering, mastered` | ✅ renamed; ordinal sort order preserved |
| `class_grade_code` | `beginner, intermediate, advanced` | ✅ **UNCHANGED** — A-054 satisfied |
| Applied migrations | 8 | ✅ census 7 → 8 |
| `report_versions` / `report_version_ratings` | 0 / 0 | ✅ R-B2 respected — no canonical report version created |
| `observation_ratings` | 0 | ✅ guard precondition genuinely satisfied at apply time |
| Seed rows | 1 centre, 3 class grades, 9 dimensions | ✅ intact |
| `auth.users` / `accounts` | **1 orphan / 0** | ❌ **R-27** — ratified identities destroyed by the reset |

**The vocabulary change itself is complete and correct in the database.** What is missing is the fixture population, and that is an operator-only action.

#### 7.6a.5 R-27 — the exact operator action required

Backend V2 cannot be **accepted** until fixtures load, because the post-reset census, fixture verification, the assessment suite, the Step 7I lifecycle dual-run checksum and integration Parts 2–3 all depend on a populated database. None of these may be recorded as passing.

**Required, and only performable by the operator, at a local interactive terminal:**

```
cd "C:\Users\enyul\Vibe Studio\B.E.S.T-Coach-Workspace\worktrees\backend-48h"
npm run fixtures:local -- --reload
```

Entering the fixture passwords at the no-echo prompt. The `--reload` flag is required because of the orphan `auth.users` row.

**No autonomous workaround exists or may be invented.** `CLAUDE.md` §11 permits no environment-variable path, no default, no generated-and-discarded value and no file source, and forbids a password being requested or transmitted in chat in either direction. Direct `auth.users` insertion, a supplied `password_hash`, and weakening the loader preflight are each independently prohibited by §12. **None was attempted.**

**What proceeds regardless:** the B-V2-3 file reconciliation is committed so the worktree is clean and no work is stranded; the Backend V2 verifier runs scoped, recording fixture-dependent gates as **BLOCKED** — never as pass or fail; and the entire frontend lane is unaffected because it runs in fixture mode with no database dependency.

### 7.7 Pre-reset database census — recorded at Run B Phase 0 (R-B3 step 2)

Captured from the running local stack (`supabase_db_best-coach-mvp`, port 54322) **before any V2 work**:

| Table | Rows | Table | Rows |
|---|---|---|---|
| accounts | 3 | reports | **0** |
| centres | 1 | **report_versions** | **0** |
| centre_memberships | 3 | **report_version_ratings** | **0** |
| students | 1 | report_version_approvals | 0 |
| trainer_profiles | 1 | report_correction_requests | 0 |
| parent_profiles | 1 | report_version_checklist_progress | 0 |
| parent_student_links | 1 | audit_events | 0 |
| enrolments | 1 | audit_event_targets | 0 |
| class_modules | 1 | audit_chain_heads | 0 |
| class_sessions | 1 | assessment_dimensions | 9 |
| class_session_assignments | 1 | class_grades | 3 |
| attendance | 1 | invitations | 0 |
| **observations** | **1** | **observation_ratings** | **9** |

**Old-vocabulary distribution in `observation_ratings`:** `emerging` 2, `developing` 2, `secure` 3, `advanced` 2 = 9. This is the exact population the A-053 zero-row guard will refuse, and the reason R-B3's ordered reset is required.

**Synthetic-data proof (R-B3 step 1) — the data is unambiguously synthetic:**

- All three accounts use the **RFC 6761 reserved `.test` TLD**: `trainer.fixture@example.test`, `management.fixture@example.test`, `parent.fixture@example.test`. A reserved TLD cannot resolve to a real mailbox.
- Display names are self-declaring fixtures: `Fixture Trainer One`, `Fixture Manager One`, `Fixture Parent One`.
- The single student is `Fixture Student One`; the single centre is `ispeak` / `iSpeak Academy`.
- The single observation carries **empty** `observation_notes`, `strength_chips {}` and `focus_chips {}` — no free-text content of any kind exists.

**No real or non-synthetic project data is present. No `report_versions` row has been created since Run A. Both Run B §1 stop conditions are clear.**

---

*Initialized at Run A, 2026-08-06. Section 7 added by the main orchestrator at Run B Phase 0, 2026-08-06, from direct verification of the working trees and the running local database. No repository file, Git state, database or screenshot was modified to produce it. No task is authorized by the existence of a row here.*

---

## 8. Run C1 Phase C0 reconciliation — verified corrections to the current-state record

Added by the Run C1 main orchestrator, 2026-08-06. **Historical rows are not rewritten.** Only cells that assert something about *the present* and are now false have been corrected, each marked in place at its own location. Every correction below was verified directly before being written.

### 8.1 Starting baseline — re-verified, no drift

| Repository | Branch | HEAD | Tree |
|---|---|---|---|
| Main MVP | `main` | `68ba4976ba9c5f19e54274a39877c77a854ca2bd` | clean |
| Backend worktree | `feat/48h-backend` | `ec5be5737fa848f4e4069b359f0344e3a0cc989e` | clean |
| Frontend worktree | `feat/48h-frontend` | `6762b5c59d41cdeaaaa0bc410a4fe28a1d31cebe` | clean |
| Frozen demo | `main` | `8d4acf4abc5039c24da01be773ab1a5e4916080f` | clean |

Both ratified merge commits present in the ratified order — backend `0c9fbe4823fd8e94e12826919169ee3fd3a95d38`, then frontend `68ba4976ba9c5f19e54274a39877c77a854ca2bd`. Annotated tag `demo-freeze-step14-2026-07-21` intact and dereferencing to `8d4acf4`. **12 `reference.png` files, 12/12 SHA-256 unchanged** against `CORE_SCREENSHOT_VALIDATION_REPORT.md`. Local Supabase stack local-only (all published ports loopback: 54321/54322/54323/54324); **no remote project is linked** — `supabase/.temp/` holds no `project-ref`. No non-synthetic data: all three identities use the RFC 6761 reserved `.test` TLD.

### 8.2 R-27 — resolved by the operator

The operator ran `npm run fixtures:local -- --reload` interactively. **Independently reproduced by the orchestrator without handling, requesting, displaying or persisting any credential** — see the risk register R-27 row for the full census. Canonical fixture SHA-256 `6bdff280e550503d212832c2fd1099ac45880c2bc430bfdff8f92a3b35ffc576`, 28 canonical rows, 25 domain rows, 3 ratified Auth UUIDs, `report_versions` = 0, `report_version_ratings` = 0.

**Fixture passwords remain operator-only and non-persisted.** They exist nowhere in this workspace: not in a file, not in an environment variable, not in a log, not in an evidence pack, not in a tracker, and not in any message. Run C1 neither requested nor received one, and the F17 runner it delivers is designed so that it never can.

### 8.3 Backend V2 database-dependent verification — PENDING EXECUTION → EXECUTED

Run B recorded these gates as **blocked** because fixtures were absent. That blocker is discharged; the correct current status was **pending execution**, and Run C1 has now executed them. Results are in the Run C1 report §3. Every load-bearing gate passed. The single failure was the **stale canonical checksum pin** Run B §8.7 predicted and deliberately refused to guess.

### 8.4 F-08 — completed, and its stale cells corrected

**F-08 completed at commit `bda9cad6854ffec768200d58a8666bb0038ab2b2`.** Two corrections were required in `FRONTEND_RECONSTRUCTION_TRACKER.md`:

1. **Table B, F8 row — missing commit SHA.** The "Implementation commit" cell carried only the commit *subject*, `feat(frontend): reconstruct trainer AI report generation`, with no SHA — the only such cell in the table. Now supplied.
2. **Table C, line 117 — stale "Blocked — not attempted".** That cell recorded the **first** F-08 attempt, which returned BLOCKED and was **correct to do so**. It was never updated after the successful retry, leaving the tracker contradicting commit `bda9cad`. Corrected in place, with the original first-attempt wording retained as history.

### 8.5 Route rows describe future canonical targets, not existing routes

`FRONTEND_RECONSTRUCTION_TRACKER.md` Table A's `Route` column records each screen's **ratified canonical target**. Six of those paths have never existed; each screen was implemented at a different pinned path. A clarifying block with the full target-versus-actual mapping is now recorded directly beneath Table A. This was a **reading hazard, not a defect** — the divergence is the ratified "replace after integration, preserve the implemented path as a redirect" treatment. Run C1 protects the 17 routes that exist and does **not** perform the six canonical migrations, which would touch reconstructed screens.

### 8.6 Backend workstream log — stale frontend-vocabulary statement

`docs/workstreams/48H_BACKEND_PROGRESS.md` (in-repository) asserted as current state: *"**Frontend V3 remains pending and separately authorized** — the frontend still carries the superseded labels."* **False since commit `5dcbeeb6c45e97506cf2404e37df4e0d00b9dff0`**, which adopted the ratified Amendment 006 vocabulary on `feat/48h-frontend`, merged to `main` at `68ba4976`. Because that file is tracked, its correction cannot be made here — it is corrected **inside a backend commit** at Phase C1, not in this external pack.

### 8.7 F-16 and F-17 — current status

| Checkpoint | Run B status | Run C1 status |
|---|---|---|
| **F-16** | **NOT STARTED.** No real auth; no route guard on any portal route; `RealParticipantPhysicalTestPort` unimplemented; `/` still the create-next-app starter; fixture mode not isolated; read-RPC arity unresolved | **IN PROGRESS at Phase C4**, split into F16-A / F16-B / F16-C / F16-D, each separately committed and independently verified. Its entire Run B blocking set is discharged. |
| **F-17** | **NOT RUN.** G-1 … G-21 all unrecorded; G-19 unsatisfiable | **STILL NOT RUN, and Run C1 does not run it.** F17 requires the three fixture passwords, which `CLAUDE.md` §11 permits only through no-echo interactive stdin in an operator-controlled terminal. Run C1 delivers a **secure runner** for the operator to execute manually. Asking for a password through chat is prohibited in both directions, so the run terminates before that point by design. |

**Neither row authorizes anything by existing.** F-16 is authorized by the Run C1 operator directive §9; the F-17 runner by §10; running F-17 itself is the operator's, and remains unperformed.

*Appended by the Run C1 main orchestrator, 2026-08-06, from direct verification. No credential appears anywhere in this document.*

---

## 9. Run C2 — operator rulings recorded before implementation

Recorded by the Run C2 main orchestrator, 2026-08-06, **before any implementation agent was assigned**, as Run C2 §3 requires. These four rulings are operator authority for this run. Nothing here is satisfied by being written down.

### 9.0 Run C2 starting baseline — verified before rulings were recorded

| Item | Required | Verified |
|---|---|---|
| Main branch / HEAD | `main` / `629965d…` | `629965d2fa40705e095bf76df55f08fd50c4cba4`, subject `docs(integration): record Run C1 F16 checkpoint and continuity state`, tree clean |
| Run C1 ancestry (9 commits) | all ancestors of HEAD | 9/9 confirmed ancestors |
| Backend worktree | `feat/48h-backend` @ `402b0b6f…` | exact, clean |
| Frontend worktree | `feat/48h-frontend` @ `6762b5c5…` | exact, clean |
| Frozen demo | `main` @ `8d4acf4a…`, tag intact | exact, clean; `demo-freeze-step14-2026-07-21` dereferences to `8d4acf4a` |
| Accepted reference screenshots | 12 unchanged | 12/12 SHA-256 match `48H_CORE_SLICE.md` |
| Route census | 17 | 17 `page.tsx` route files |
| Local Supabase project | `best-coach-mvp` | only stack running; all published ports loopback |
| Hosted project reference | none active | `supabase/.temp/` holds no `project-ref` |
| Canonical fixture checksum | `6bdff280…ffc576` | exact match, 28 canonical rows |
| `reports` / `report_versions` / `report_version_ratings` / `audit_events` | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 |
| Auth users | 3 ratified deterministic identities | 3 |

No Git drift, no screenshot drift, no non-synthetic data, no canonical database residue. Execution authorized to begin.

### R-C2-1 — report creation belongs to complete assessment save

The authoritative **server-side** complete-assessment save must **atomically** ensure exactly one report shell exists and return its **real** report identifier.

Required post-state: report status `observation_saved`; **no** report version; **no** AI draft; **no** Trainer approval; **no** Parent visibility; Management visibility only as the ratified workflow already permits.

- Incomplete saves may remain report-free.
- Repeated complete saves return the **existing** report.
- Concurrent complete saves for the same `(class_session_id, student_id)` produce **exactly one** report.
- The client may **never** generate, guess, cast or fabricate a report id.
- After a successful complete save the UI navigates via the **returned** id to `/trainer/reports/[reportId]/generate`.
- An alternative generation route keyed by untrusted client-supplied session/student identifiers is **prohibited** as a workaround.

### R-C2-2 — disposable lifecycle environment is mandatory

The writable F17 lifecycle runs **only** against a separate disposable local Supabase environment. The canonical `best-coach-mvp` fixture database stays pristine.

**G-18 definition for this run:** the canonical fixture database has the same verified checksum and zero report, version and audit residue **before and after** the full lifecycle executes on the disposable environment.

### R-C2-3 — Management Reports architecture

Management has **one** primary Reports destination: `/management/reports`. Pending and Approved are **internal page filters or tabs**. Two separate primary sidebar destinations are prohibited. Deep links may use query parameters or governed internal state, but must render inside the same centralized page under **one active sidebar item**.

### R-C2-4 — AI completion boundary

The 48-hour sprint cannot be marked complete until a **real external AI provider and exact model** generate a grounded draft. This run does not select or activate a provider unless an already-ratified decision exists in authoritative documents. The disposable harness must **never** mark **G-6 PASS** using fixture text, hard-coded output or a deterministic fake provider.

*Recorded by the Run C2 main orchestrator, 2026-08-06, before implementation. No credential appears in this section.*

---

## 10. Run C2 — operator ruling R-C2-5, exact disposable Supabase runtime profile

Recorded by the Run C2 main orchestrator, 2026-08-06, at a safe boundary (main `1e7e40cd7d3731af0c1e2b2912139ae821a0f007`, tree clean, canonical pristine, Phase C2-D not yet started), **before** the correction was implemented.

### R-C2-5 — authorize exactly two runtime profiles, fail closed on everything else

The normal local configuration is **not weakened**. Two profiles, and only two, are authorized:

| Profile | Project | API port |
|---|---|---|
| normal / default | `best-coach-mvp` | 54321 |
| explicit F17 disposable | `bc-f17-disposable` | 55421 |

Port 55421 is acceptable **only** when the disposable F17 harness sets an explicit dedicated runtime profile in the child application environment. **Arbitrary localhost ports are not accepted.**

**Must fail closed for:** a disposable URL without the disposable profile; a canonical URL while the disposable profile is active; any local port other than 54321 or 55421; malformed or unknown profiles; any non-loopback hostname; hosted Supabase URLs; linked-project fallbacks.

**The profile must not be selectable through** query parameters, cookies, headers, request bodies, forms, `localStorage`/`sessionStorage`, or any UI control. It is a server-side child-process environment input only.

**Fixture mode remains off**, and the served application must report `data-adapter-kind="real_participant_adapter"`.

### Required follow-through (operator-specified)

1. independent security review of the configuration path;
2. independent false-PASS review of the tests;
3. rerun the disposable isolation and teardown proof;
4. serve the application against the disposable stack;
5. prove the live screen 07 → 08 transition using the returned real report id;
6. run every currently possible authenticated browser gate;
7. **G-6 remains NOT-RUN** — no real AI provider is activated;
8. teardown disposable resources;
9. prove canonical checksum, identities and report/audit residue unchanged.

### Retained unresolved Run C2-A findings

These are **not** closed by this ruling and must remain on the register:

- **direct complete-save bypass through `assessment_save_observation`** — the non-atomic predecessor RPC retains `authenticated` EXECUTE and is still directly reachable via PostgREST, so a caller bypassing the application can still persist a complete assessment without opening a report shell;
- **`server/db/database.types.ts` regeneration** — the new RPC is absent from the generated schema types.

*Recorded by the Run C2 main orchestrator, 2026-08-06. No credential appears in this section.*

---

## 11. Run C2 — operator rulings R-C2-6 and R-C2-7

Recorded by the Run C2 main orchestrator, 2026-08-06, while the R-C2-5 writer was still in flight on commit 2. The active writer was **not** interrupted. Both rulings arise from the autonomous app-served disposable proof (`_f17-disposable-evidence/disposable-app-proof.md`, completed 2026-08-06T15:06:59Z), which returned 28 PASS / 14 NOT-RUN / **2 FAIL**.

### R-C2-6 — Parent non-disclosing denial is a BLOCKING Run C2 security fix

**G-14 FAILED.** Recorded reason: *"the two denials differed, which discloses that one of the two pairs exists."* The Parent-facing path is an **existence oracle**: it returns distinguishable results for a pair that does not exist versus an existing pair the Parent is not authorized to read. **High. Must be fixed inside Run C2. Not deferred.**

1. Fix the **authoritative server-side boundary**, not merely the frontend message.
2. These Parent denial cases must be **indistinguishable**: nonexistent report/session/student pair; existing report belonging to another child; existing report in another centre; existing but **not submitted** report; inactive or absent Parent membership; unauthenticated caller where the same endpoint contract applies.
3. The denial must have the same **HTTP status**, **response body**, **application outcome**, **error code/message (if any)** and **projected shape**.
4. Prefer a **zero-row or single generic unavailable** result. Disclose nothing about: whether the report exists, student identity, session identity, report state, submission state, centre, or version/correction metadata.
5. **Preserve the positive control** — the linked Parent can read only the submitted canonical report for their own child.
6. **Preserve Management and Trainer behaviour.**
7. Adversarial tests at **both** levels: the direct governed RPC / PostgREST / server-action boundary, **and** the app-served browser/adapter boundary.
8. The negative test must compare the **full denial result byte-for-byte** where technically applicable — not selected fields.
9. Demonstrate liveness with three cases: one authorized submitted **positive control**; one **existing but unauthorized** report; one **nonexistent** pair.
10. **No service-role or elevated client** may enter the participant application path.
11. Independent security review after correction.

### R-C2-7 — A-14 must prove an ORDERED transition, not a stale final status

The proof already established: no report existed before save; the server returned a real UUID; the browser navigated to that exact UUID; the id was unavailable to the client before save; exactly one shell was created (**A-15 PASS**). A-14 failed only because the row read back as `drafting`, since screen 08 auto-invokes `requestDraft` on mount.

**A-14 must NOT be weakened to `status === observation_saved || status === drafting`.** It must require positive **ordered** evidence:

1. complete assessment save succeeds;
2. the new report is created/opened at **`observation_saved`**;
3. the save response returns that exact report id;
4. the browser navigates to `/trainer/reports/<returned-report-id>/generate`;
5. **only after that**, screen 08 invokes the draft request;
6. the report may **then** transition to `drafting`.

A-14 may PASS with final state `drafting` **only if** the ordered `observation_saved → drafting` sequence is established. Also prove: one report only; no duplicate; **no report version**; **no AI draft content**; **no external AI provider call occurred**; **G-6 remains NOT-RUN**. If the intermediate `observation_saved` state or its ordering cannot be proved, **A-14 remains FAIL rather than being broadened.**

### Process

Let the current writer finish commit 2 → run both planned reviewers → one bounded remediation cycle for R-C2-6 and R-C2-7 → separate commits if the product security fix and the proof-harness correction are materially distinct → rerun the full set (app-served proof, G-14 adversarial, A-14 ordered-transition, G-17 non-empty audit, H-1 measured teardown, TypeScript, lint, production build, static scan, isolation proof, canonical before/after) → both independent reviewers again.

**C2-D acceptance must not proceed while G-14 is FAIL.** The phrase `RUN C2 PORT-PROFILE CORRECTION REVIEWED` must not be reported until both independent reviews have actually completed.

### Residual items — still open, still explicit

- **direct complete-save bypass through `assessment_save_observation`**;
- **`server/db/database.types.ts` regeneration**.

*Recorded by the Run C2 main orchestrator, 2026-08-06. No credential appears in this section.*

---

## 12. Run C3-A — operator F17 result, and corrections to the issued Run C2 report

Recorded by the Run C3-A main orchestrator, 2026-08-07, **before** any C3-A implementation. Starting main HEAD `3fc4295af5d902be3b656d788727188aaafa4f15`, tree clean, with `1fd741c` and `3fc4295` both confirmed ancestors. Backend `402b0b6f`, frontend `6762b5c5`, frozen demo `8d4acf4a` — untouched.

### 12.1 Operator interactive F17 result (no credential recorded)

The operator executed `node scripts/physical-test/run-f17-disposable.mjs` on a real terminal with real hidden password entry, after the `1fd741c` identity-linkage correction.

| Gate | Verdict | Basis |
|---|---|---|
| **G-1** | **PASS** | three real `signInWithPassword` authentications against the disposable stack |
| **G-17** | **NOT-RUN** | the audit set was empty — the gate correctly refused to PASS on nothing, which is the fail-closed behaviour installed at `1e7e40c` |
| **G-18** | **PASS** | canonical pristine |
| **G-20** | **PASS** | typecheck / lint / build |
| **H-1** | **PASS** | measured teardown, process and port evidence |

Canonical checksum unchanged: `6bdff280e550503d212832c2fd1099ac45880c2bc430bfdff8f92a3b35ffc576`.

**No password, token, cookie, key or credential of any kind was recorded, transmitted or observed by any agent.** G-1 is now satisfied by operator-performed evidence and can never be satisfied autonomously.

### 12.2 Corrections to `AUTONOMOUS_48H_RUN_C2_REPORT.md` — recorded here, **not** retro-edited into the issued report

1. **Both Critical UI findings were reported as High.** §16 lists **C2C-001** (Management sidebar declares two primary Reports destinations) and **C2C-010** (no session-start eligibility on any Trainer surface) under a "High" heading. Both are **Critical**.
2. **Severity counts are wrong in both documents.** `RUN_C2_UI_ARCHITECTURE_RECONCILIATION.md` §3 states Critical 2 / High 8 / Medium 12 / Low 12 / Informational 14, and the C2 report §15 repeated it. The matrix's own §2 index tallies **Critical 2 / High 9 / Medium 13 / Low 10 / Informational 14**. Total 48 is correct in both; three of five buckets are miscounted. No finding is missing, duplicated or stale.
3. **Migration baseline wording.** C2 report §18's "Before" column reads "10 (was 9 at baseline)", which is self-contradictory. Correct: **Before = 9, After = 10** — the single committed C2-A migration.
4. **"Strictly stronger" is wrong for admin-minted sessions.** C2 report §11 claims the admin mint is "strictly stronger than a generated password". Precise wording: *it removes password handling entirely and therefore carries no password-exposure risk, but it proves strictly less, because it never exercises the password authentication path. It is a narrower assurance, not a superset.*
5. **The OpenAI incident — what is unattributable.** One earlier intermediate run entered `requestDraftCore` and may have transmitted the real `LLM_API_KEY`. The run **cannot** determine token count, cost, request id, or which provider-account entry corresponds to it: no response was captured and no provider-side telemetry was read. Only the fact that the draft path was entered is established. Aggregate provider usage cannot be decomposed to attribute the call after the fact.
6. **The interactive-runner recommendation was wrong.** C2 report §21 states the runner "exercises the lifecycle gates the autonomous proof declares it does not decide". **False** — it stamps fifteen of them NOT-RUN. It decides **G-1, G-17, G-18, G-20 and H-1 only**. (The stale `APP_TARGET_BLOCKED` reason string was itself corrected at `3fc4295`.)

### 12.3 Carried into Run C3-A as work items

`assessment_save_observation` complete-save bypass · `database.types.ts` regeneration · `lifecycle-canonical.sql` 23:00-hour nondeterminism · the boolean-cast false-FAIL in the byte-frozen `run-f17.mjs` · C2C-001/002 · C2C-004 · C2C-010/011 · C2C-012 · sign-out control.

*Recorded by the Run C3-A main orchestrator, 2026-08-07. No credential appears in this section.*

---

## 13. Run C3-A — non-AI blockers closed

Recorded 2026-08-07. Start `3fc4295` → end `2ba4c79`, **17 commits**, tree clean. Backend `402b0b6f`, frontend `6762b5c5`, frozen demo `8d4acf4a` — untouched throughout.

**Phase 1 (db/harness):** `79b7886` complete-save bypass closed by a single signature-qualified `REVOKE` (the composer still executes the delegate as owner); `61d417c` types regenerated; `001fed9` 23:xx clock nondeterminism fixed and proved over 1,444 constructed cases; `b71eda0` canonical-runner G-17 boolean false-FAIL fixed with the shared strict reader. Both reviewers ACCEPT_WITH_FINDINGS, no Critical/High.

**Phase 2/2b (architecture):** `0b947ac` C2C-001/002/003 — one Reports rail item, dead ternary fixed, per-item prefix ownership declared; `c932ad3` C2C-012 ratified post-login destinations; `455ffe6` C2C-023 sign-out; `14444b0` C2C-004 governed Approved (`submitted`) projection — `approved` proved never to commit from the applied catalogue; `55655a5` C2C-010/011 derived session eligibility (`future` the only inert state, matching BC017/BC104 exactly) and server-side assessment entry gating; `d7dc543`/`7124093` G-14 nondeterminism diagnosed to a shell-vs-page two-round-trip race and fixed without retry or sleep.

**Provider-guard correction:** `b948110` — a **real external provider call occurred during Phase 2b** via `run-integration.mjs`'s unguarded INT-L2b leg, which fired on key presence alone. Root cause was orchestration: the standard verification list included that runner. The leg now defaults **OFF** behind a strict fail-closed opt-in (`=== "1"`, exact argv membership), records **SKIPPED — NOT PASSED**, and is preserved unweakened for deliberate G-6 activation. New gate **INT-PG** arms an outward-call trip-wire that refuses and fails on any non-loopback host. `2ba4c79` corrected four narrations, including one census assertion that had become false.

**Canonical unchanged throughout:** `6bdff280…ffc576` over 28 rows; reports/versions/ratings/audit_events all 0; auth.users 3; migrations 12. Zero disposable residue. **G-6 remains NOT-RUN; G-1 remains operator-only.**

**Open (non-blocking):** C2C-005 unknown `?status=` denial panel; the published-report fallback read; fixture session dates derived once at module load; the `future`-only-inert interpretation of C2C-010.

*Recorded by the Run C3-A main orchestrator. No credential appears in this section.*

---

## 14. Run C3-B — read-only G-6 activation-path audit: incident and usage accounting

Recorded by the Run C3-B auditor, 2026-08-07. Baseline: main HEAD `2ba4c79`, tree clean; backend, frontend and frozen demo untouched; canonical checksum `6bdff280e550503d212832c2fd1099ac45880c2bc430bfdff8f92a3b35ffc576`; canonical migrations 12. This section appends to, and does not modify, the issued Run C3-A record in §12–§13.

### 14.1 Incident accounting (restated for continuity — original record: §13 "Provider-guard correction")

- **One unauthorized external provider call occurred during Run C3-A Phase 2b**, via `run-integration.mjs`'s then-unguarded INT-L2b leg, which fired on key presence alone while a standing operator directive prohibited external provider calls.
- **That call does not count as G-6 evidence.** It produced no gate ledger, no differential proof, no metadata capture and no verified use of the ratified selectors; the Phase 2b call is excluded from all G-6 evidence.
- **Its exact request id, token usage and cost remain UNATTRIBUTED** and must remain so unless provider-side telemetry proves them: no response was captured, no provider telemetry was read, and aggregate provider usage cannot be decomposed after the fact (consistent with §12.2 item 5).
- **The default-off guard was subsequently installed** at `b948110`: the leg now fires only on `--run-real-provider-leg` or `BEST_COACH_RUN_REAL_PROVIDER_LEG=1` (strict `=== "1"`), records SKIPPED — NOT PASSED otherwise, does not load the LLM selectors from `.env.local` without the opt-in, and the INT-PG outward-call trip-wire refuses any non-loopback fetch on every default run.
- **No external provider call was authorized or made during Run C3-B.** This audit was strictly read-only: no application was served, no browser started, no disposable stack provisioned, no credential requested or printed, and no provider constructed.

### 14.2 Run C3-B audit verdict (summary; full report issued in-session)

**RUN C3-B G-6 AUDIT — ACTIVATION PATH INCOMPLETE.** Exactly one deliberate, opt-in-guarded command can make a real provider call today (`run-integration.mjs` with the INT-L2b opt-in), but it cannot prove G-6: the outward call bypasses `requestDraftCore` (direct `provider.generate` with a dummy report id and empty anchor text), the ratified provider/model equality is not verified (presence only), no two-profile differential proof, no fixture-inequality check, no non-secret cost/request/model metadata capture and no gate ledger exist. `run-f17-disposable.mjs` stamps G-6 unconditionally NOT-RUN with no PASS branch; `prove-disposable-app.mjs` remains structurally incapable of activating a provider (selector overwrite with an unratified literal, verified against `server/platform/env.ts`, plus a zero-non-loopback-peer measurement). The operator must NOT run the INT-L2b opt-in as a G-6 activation: it would spend a real billable call without producing acceptable G-6 evidence. A separately designed, single-purpose activation runner remains the safest path; no correction was implemented in this read-only audit.

*Recorded by the Run C3-B auditor. No credential appears in this section.*

---

## 15. Run C3-C — G-6 activation harness accepted; formal G-6 PASS recorded

Recorded by the Run C4 main orchestrator, 2026-08-07, at the start of Run C4, before any C4 work. Baseline: main HEAD `dbd82d0`, tree clean.

**Run C3-C delivered the sanctioned activation harness** (`scripts/physical-test/activate-g6.mjs`, commits `711cadf`, `87420c8`, `6577500`, `dbd82d0` on `main`) and closed with `RUN C3-C G-6 HARNESS READY — AWAITING OPERATOR ACTIVATION` (§14 context). The operator subsequently ran the sanctioned activation command directly in an interactive terminal, typing the per-call confirmation phrase for both real requests.

**G-6 formally PASSES.** All sixteen evidence conditions in the operator-specified contract report PASS:

| # | Condition | Verdict |
|---|---|---|
| 1 | Provider is exactly openai | PASS |
| 2 | Model is exactly the ratified model | PASS |
| 3 | Both requests originate from real disposable Trainer assessments | PASS |
| 4 | All nine ratings and Trainer notes represented (per-dimension) | PASS |
| 5 | Structured output parses and passes schema validation | PASS |
| 6 | Grounding validation ran on each real generation | PASS |
| 7 | The two generated drafts materially differ | PASS |
| 8 | Neither generated draft equals any pinned fixture-provider panel | PASS |
| 9 | Neither generated draft is cached, replayed or hard-coded | PASS |
| 10 | Both reports reach draft_ready through requestDraftCore | PASS |
| 11 | Persisted panels correspond to the generated, validated panels | PASS |
| 12 | Contradictory/ungrounded output is rejected and not stored (this run) | PASS |
| 13 | Provider timeout/invalid-JSON/failure leave no false draft_ready (static proof) | PASS |
| 14 | Exactly the expected audit transitions occur | PASS |
| 15 | Canonical Supabase remains byte-identical | PASS |
| 16 | All disposable resources are removed | PASS |

**Call accounting.** Exactly one real request for Profile A and one for Profile B (the bounded-retry path was never exercised — both generations succeeded on the first attempt). Canonical residue unchanged across all nine measured tables (`reports`, `report_versions`, `report_version_ratings`, `report_version_checklist_progress`, `report_version_approvals`, `observations`, `observation_ratings`, `audit_events`, `audit_event_targets`); the report/audit subset held at zero both before and after. Disposable databases (`bc_g6_seed`, `bc_g6`) confirmed removed.

**Redacted external evidence location (outside this repository, never committed):**
`C:\Users\enyul\Vibe Studio\B.E.S.T-Coach-Workspace\_g6-activation-evidence\g6-ledger.md`

The ledger is redacted by construction — gate verdicts, authored reasons, the ratified provider/model literals, and structural facts (call counts, table residue) only. **No credential, prompt, provider response, or full generated narrative is recorded in that file or reproduced here** — generated content is represented only through pass/fail comparisons the harness performed, never quoted.

**G-6 is CLOSED.** No further real provider call is authorized by this record. Run C4 (governed lifecycle proof) uses the deterministic fixture provider throughout, since the real-provider path is independently proven by this acceptance.

*Recorded by the Run C4 main orchestrator. No credential, prompt, response or generated narrative appears in this section.*

---

## 16. Run C4 — the complete governed lifecycle, proven through the real UI

Recorded by the Run C4 main orchestrator, 2026-08-07. Start `dbd82d0` → end `139d753`, **4 commits**, tree clean. Backend `402b0b6f`, frontend `6762b5c5`, frozen demo `8d4acf4a` — untouched throughout. No push, no remote, no tag.

**New artifact:** `scripts/physical-test/prove-governed-lifecycle.mjs` — provisions a disposable Supabase stack, builds and serves the real Next.js application against it, and drives headless Chrome over raw CDP through Trainer → Management → Parent end to end. **29 PASS · 0 FAIL · 0 NOT-RUN** across 14 lifecycle legs and 15 negative controls.

**Lifecycle observed, in order:** trainer sign-in → roster with attendance `present` by default → nine-dimension instrument → governed save (`observation_saved`, 9 ratings) → `draft_ready` → trainer edit (new immutable version, checklist reset 3/3 → 0/3) → approve (`trainer_approved`, parent sees 0 rows) → management pending queue → wording-only edit (ratings byte-identical) → return-for-correction (`needs_edit`, no version created) → trainer correction (new version) + reapproval → management pending queue → Approve & Submit (`submitted`) → parent reads only the submitted canonical version.

**Audit trail, complete and hash-verified** (14 events, one centre chain, `audit_verify_chain()` ok in COMPLETE mode, head checked): `report.created` once, then the full transition sequence, ending **seq 13 `trainer_approved→approved` and seq 14 `approved→submitted` — ADJACENT**, which is what one transaction means. No row ever committed at `approved`.

**One real regression found and fixed.** `prove-disposable-app.mjs` greps the ratified AI selectors out of `server/platform/env.ts`; Run C3-C moved them to `llm-config.ts`, so the proof's fail-closed guard correctly **refused to serve** and the proof had been unrunnable since `87420c8`. Fixed at `1e59b6f` to search both locations; re-verified G-2, G-5, G-14, G-17, G-18, G-20, G-21, G-22, G-23, H-1 all PASS.

**Ten harness defects were found and fixed; ZERO application changes were required.** Six on first execution (three races against client components, two over-broad assertions, one mis-measurement of responsive duplicates as extra rail destinations), then four more from the two independent reviews: two negative controls (N-4, N-5) passing **vacuously** on `42883` function-resolution errors rather than authorization denials — closed as a class by `isAuthorizationDenial()`, which accepts only authored `BC` codes or `42501`; N-2 passing vacuously against a loading skeleton; and fixture mode assumed rather than proven. Every fix was classified from captured DOM/RPC diagnostics, never guessed.

**Two new controls added from review findings:** N-13 (the Quality Checklist gate refused a signature-correct RPC approval with `BC005` while the checklist was 0/3 — server-side, not a disabled button) and N-14 (management's governed review read returns 0 rows with **no error** at `draft_ready` — non-disclosing, A-038). N-15 proves the served app reported `real_participant_adapter`.

**Canonical unchanged throughout:** `6bdff280…ffc576` over 28 rows; reports/versions/audit_events 0; auth.users 3. Zero disposable databases, containers, volumes or held ports after teardown. **Zero external provider calls** — the served process was structurally incapable of constructing a provider.

**Redacted external evidence (outside the repository, never committed):**
`C:\Users\enyul\Vibe Studio\B.E.S.T-Coach-Workspace\_c4-lifecycle-evidence\` — `c4-lifecycle-ledger.md` and `c4-diagnostics.json`. Scanned clean for credential-shaped content.

*Recorded by the Run C4 main orchestrator. No credential appears in this section.*
