# B.E.S.T Coach — Final MVP Screen Reconciliation Plan

**Created:** 2026-08-07 (Asia/Singapore) at the post-sprint Final MVP Submission Readiness Audit.
**Baseline:** main HEAD `139d753`, working tree clean. Run C3-C G-6 PASS (16/16); Run C4 governed lifecycle PASS (29 PASS / 0 FAIL / 0 NOT-RUN). 48-hour physical-test sprint formally accepted.
**Status:** Planning instrument. **Authorizes nothing.** No application code, route, component, database object or reference asset was created, modified, moved or deleted to produce it.

---

## 0. Authority, scope and method

### 0.1 Authority — the ratified TWO-LADDER split

Amendment 005 **A-045** is ratified and controls. It does **not** define a single flat order; it defines **two separate ladders**, and which one applies depends on the *kind* of question being asked. Consolidated below from the three instruments that state it identically — A-045 (`Amendment_005.md:139-155`, as numbered lists), `FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` §0.1 (the parenthetical form used here) and `GLOBAL_UI_RULES.md` §1.1–§1.3. **The ranks and elements are identical in all three; only the closing formulation differs** (A-045: *"never quietly reconciled"*; `GLOBAL_UI_RULES` §1.3: *"never silently resolved"*):

> **Visual authority (highest first) — reconciled 2026-08-08: (1) `UI_REFERENCE_FINAL_MVP/reference/<mapped pack>/` · (2) the governed pack's optional frozen local `reference.png` duplicate, which never outranks (1) and whose absence is not a missing reference · (3) node-specific Figma context, only where no ratified `/reference/` asset exists · (4) existing frontend implementation.** ~~(1) frozen `reference.png` · (2) node-specific Figma context · (3) existing frontend implementation.~~
> **Functional, security and privacy authority (highest first): (1) specification and active amendments · (2) `CLAUDE.md` · (3) lifecycle and authorization baselines · (4) ratified implementation contract · (5) Figma.**
> **Figma never bypasses governance.** Where a frame and a ratified rule disagree, **the ratified rule wins and the discrepancy is recorded**, never silently resolved.

Restated identically in `FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` §0.1 and `GLOBAL_UI_RULES.md` §1.1/§1.2.

**Neither `screen.md` nor the HTML export holds a rank in either ladder, and this plan does not give them one.**
- `screen.md` is **subordinate pack detail**. `GLOBAL_UI_RULES.md:3`: *"A per-screen `screen.md` may add detail; **it may never weaken anything here**."* Where it appears decisive below, it is decisive **because it restates a governance rule**, never because of a position above the PNG.
- The HTML is a Figma **code export**, i.e. Figma material — functional ladder rank 5. `CLAUDE.md` §7.2 lists generated React/CSS under "Never blindly port". It is used here only as corroborating evidence of what a frame draws.

**How to apply it.**

| Question | Ladder | Consequence |
|---|---|---|
| *What should this look like?* (layout, spacing, geometry, control placement) | **Visual** | **The `/reference/` pack wins** — `reference/<mapped pack>/`, over `screen.md`, over the implementation. A pack-local frozen `reference.png`, where one exists, is a SHA-identical duplicate of it, not a higher rank. ~~The **frozen `reference.png` wins** — over `screen.md`, over the HTML, over the implementation~~ *(corrected 2026-08-08: it cannot outrank the `/reference/` HTML render, which ships in the same ratified pack)* |
| *What may this screen do, show, or expose?* (lifecycle, roles, permissions, ratings, vocabulary, privacy) | **Functional / security / privacy** | **Spec + amendments win, then `CLAUDE.md`** — Figma is last |

Every one of the fourteen conflicts in §5 is a **functional/privacy** question, so governance wins each on the functional ladder. **None is decided by a visual-precedence argument, and none needs one.**

> **The audit instruction that commissioned this plan supplied a single flat order (governance → screen Markdown → PNG → HTML → implementation → legacy).** Where that flat order and A-045 differ — chiefly in placing `screen.md` above the frozen PNG for *visual* questions — **A-045 governs**, because a procedural instruction cannot override a ratified amendment. No classification in this plan changes as a result: the flat order and A-045 agree that governance outranks every pack artefact, and that is the only precedence any conflict here actually turns on.

### 0.2 The authoritative inventory

The ratified inventory is **`docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md`** (in-repo, governed by Amendment 005 A-041…A-048). It fixes **36 screens** — 3 authentication (`AUTH-01…03`) + 33 portal (Trainer 01–10, Management 11–29, Parent 30–33) — all from Figma file `sSY1TYw3jyVlZDy8V2Mu7g` / `SDS-dashboard`, of which **12 are the physical-test core slice** and **24 are `Post-48-hour final-MVP scope`**.

**This plan does not add, remove or renumber a screen.** Doing so requires an amendment (`CLAUDE.md` §12).

### 0.3 Where the pack material actually lives — established by this audit

| Material | Location | Coverage |
|---|---|---|
| Screen Markdown | `UI_REFERENCE_FINAL_MVP/<pack>/screen.md` | **36 / 36** |
| **Frozen** reference PNG | `UI_REFERENCE_FINAL_MVP/<pack>/reference.png` | **12 / 36 — exactly the core slice** |
| Implementation notes | `UI_REFERENCE_FINAL_MVP/<pack>/implementation-notes.md` | 36 / 36 (several are empty templates) |
| HTML reference | `UI_REFERENCE_FINAL_MVP/reference/<Screen Name>/<Screen Name>.html` | **35 / 37 folders** |
| Non-frozen PNG + MD | `UI_REFERENCE_FINAL_MVP/reference/<Screen Name>/` | 37 / 37 |

**Two structural facts that govern every classification below:**

- **The 12 frozen `reference.png` files correspond exactly to the 12 core-slice screens.** ⚠️ **THE REST OF THIS BULLET IS SUPERSEDED — CORRECTED 2026-08-08 (Final UI Reference Authority Synchronization). It is the exact inversion of the ratified position and must not be acted on.** **All 36 governed screens — including the 24 — have a ratified current visual reference**, in `UI_REFERENCE_FINAL_MVP/reference/<mapped pack>/`, promoted to **VISUAL rank 1** by operator ruling **PA-OD-5/5b** (Authority Lock §28.1, §2.4). What the 24 lack is only the **optional pack-local duplicate**. **Visual reconciliation of a deferred screen IS possible today**, against `/reference/`; the mapping is published in `SCREEN_INDEX.md`. *Superseded text follows.* ~~The 24 deferred screens have **no frozen reference at all**. Their imagery exists only as non-frozen material in `reference/`, which is Figma-export material — **the lowest rank of the functional ladder, and no rank at all on the visual ladder**, since the visual ladder's rank 1 is specifically the *frozen* `reference.png`. **Visual reconciliation of a deferred screen is therefore not currently possible**, and no deferred screen may be built to pixel fidelity until its reference is frozen.~~ *(The "lowest rank of the functional ladder" half remains correct — `reference/` is functional rank 5 under §28.2. It was the **visual** demotion that was wrong.)*
- **The `reference/` tree contains 37 folders, not 36.** The extra is `Auth 04 - All Users - Forgot Password` — a fully designed password-reset screen with **no pack folder, no inventory ID and no Figma node ID recorded**. It is **outside the ratified 36** and is carried in §6 as an open operator decision, not as a screen.

~~Two folders lack HTML: `Trainer - Students` and `Management - Students` carry a `.txt` instead.~~ **✅ RESOLVED 2026-08-08 (Final MVP Phase A2, operator ruling Q-25).** Both files were **renamed `.txt` → `.html` with bytes unchanged** (pre- and post-rename SHA-256 identical: `c9fc75ac…` and `68c8654f…`). **`reference/` now holds 37 `.html`, 37 `.png`, 37 `.md` and zero `.txt`.** Folder `Auth 02 - Mangement - Login` is misspelled on disk *(unchanged — renaming a ratified pack folder is not authorized)*.

### 0.4 Classification vocabulary used here

| Value | Meaning |
|---|---|
| **EXACT** | Pack (Markdown + frozen PNG) and implementing component both opened, and no material difference found. |
| **MINOR RECONCILIATION** | Implemented and governance-correct; residual differences are bounded and enumerable. |
| **MAJOR RECONCILIATION** | A route exists but diverges substantially from the pack, or a canonical route is absent while the function lives elsewhere. |
| **MISSING** | No route or component implements it. |

**No screen is classified EXACT by inference.** Every classification below was reached by opening both the pack and the implementing source.

---

## 1. Totals — all four classifications

| Classification | Count | Screens |
|---|---:|---|
| **EXACT** | **0** | — |
| **MINOR RECONCILIATION** | **12** | AUTH-01, AUTH-02, AUTH-03, 05, 06, 07, 08, 10, 19, 29, 32, 33 |
| **MAJOR RECONCILIATION** | **3** | 09, 11, 30 |
| **MISSING** | **21** | 01, 02, 03, 04, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 25, 26, 27, 28, 31 |
| **Total** | **36** | |

Separately enumerated **shared / global states (25)**: EXACT 5 · MINOR 9 · MAJOR 0 · MISSING 8 · UNVERIFIED 3 (§4). These are *not* included in the 36 and must not be double-counted.

### 1.1 Why EXACT is zero — stated plainly

Three independent audits reached this conclusion separately, on the same evidence:

- `FRONTEND_RECONSTRUCTION_TRACKER.md` line 7: **"No screen is operator-accepted."**
- `SCREEN_INDEX.md` note 4 records visual acceptance as **`Not started` for all 36**.
- Every core-slice `screen.md` §12 records `implementation-before.png captured: No` and `Visual acceptance: Not started` or `Proposed — awaiting operator review`.

**EXACT is therefore unreachable today for any screen, on the packs' own acceptance instrument** — not because the implementations are wrong. The twelve core-slice screens are implemented, governance-correct, and in several cases deliberately and correctly diverge from their own frozen frame. Reaching EXACT is an **operator-acceptance action**, not an engineering one, for most of the twelve.

### 1.2 The three-way alignment

The 12 MINOR screens, the 12 core-slice screens, and the 12 screens holding a frozen reference are **the same twelve screens**. The 24 deferred screens divide into 3 MAJOR (a landing surface exists at a non-canonical route) and 21 MISSING (nothing implements them). This is a coherent, deliberate state — not drift.

---

## 2. Core slice — the 12 screens (all MINOR RECONCILIATION)

All twelve are in the physical-test flow, in the order shown.

### AUTH-01 · Trainer Login — flow 1
| Field | Value |
|---|---|
| Role | Trainer |
| Markdown | `AUTH-01-trainer-login/screen.md` |
| PNG (frozen) | `AUTH-01-trainer-login/reference.png` — 1440×1024, SHA `b1ad24e4…` |
| HTML | `reference/Auth 01 - Trainer - Login/Auth 01 - Trainer - Login.html` |
| Canonical route | `/login?role=trainer` — **satisfied** |
| Current route | `/login` + `?role=` presentation |
| Components | `app/(auth)/login/page.tsx`, `app/(auth)/layout.tsx`, `features/auth/login-presentation.tsx`, `components/auth/{auth-shell,role-segmented-control,credential-fields}.tsx`, `components/brand/brand-mark.tsx`, `server/modules/identity-access/actions.ts` |
| Lifecycle state | none (pre-session): idle · pending · error · disabled |
| **Classification** | **MINOR RECONCILIATION** |

**Mismatch.** (1) Brand slot renders the in-repo `BrandMark`, not the frames' raster wordmark — **no asset disposition exists**, and `GLOBAL_UI_RULES` §8 forbids both copying and re-drawing it. (2) "Remember me" renders unchecked, `disabled`, with no `name`, where the frame shows it checked. (3) "Forgot password?" is inert text, not a link. (4) The implementation adds a governance note ("Role selection is presentation only") that appears in no frame. (5) `implementation-before/after.png` never captured.

**Required correction (bounded).** Obtain the wordmark disposition (`PORT` / `REFERENCE ONLY` / `REBUILD` / `REJECT`). Capture before/after at 1440×1024 for `?role=trainer`. Either wire recovery (depends on §6 OD-1) or record the inert control as an accepted deviation in `implementation-notes.md`. **Do not enable "Remember me"** — a second session-persistence mechanism beside `@supabase/ssr` is unauthorized.

**Governance.** A-046 (role query carries no authority), A-015, A-020, A-027, ADR-4. Deviations must be *recorded*, not silently resolved.
**Dependencies.** Operator asset disposition; §6 OD-1.
**Acceptance evidence.** Before/after PNG at 1440×1024; reference SHA-256 re-verified unchanged; an assertion that all four failure causes (bad password · unknown email · deactivated · ambiguous membership) render byte-identical DOM.

### AUTH-02 · Management Login — flow 7
Identical pack shape and component set. PNG SHA `fcc3db93…`, Management segment selected; otherwise pixel-identical to AUTH-01. HTML at `reference/Auth 02 - Mangement - Login/`. **MINOR RECONCILIATION** — the same five deltas. Additionally correct: nothing presents the named management account as shared (A-015).

### AUTH-03 · Parent Login — flow 10
Identical. PNG SHA `fcd4d4ed…`, Parent segment selected. HTML at `reference/Auth 03 - Parent - Login/`. **MINOR RECONCILIATION** — the same five deltas. Parent authority additionally requires a live `parent_student_links` row (A-048); the login surface correctly asserts nothing about links and discloses nothing about whether a parent, student or link exists.

> **The three-login question is RULED and must not be re-opened as a route question.** `FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` §0.4 and `GLOBAL_UI_RULES.md:51`: the three frames are distinct nodes frozen separately, and *"They may share one implementation shell and one route implementation — the visual references do not merge."* **One route is correct and ratified.** What remains open is narrower and is carried in §6 OD-2: whether three separately-frozen, separately-SHA'd references are discharged by one route captured at three `?role=` URL states.

### 05 · Trainer Schedule — flow 2
| Field | Value |
|---|---|
| Markdown / PNG | `05-trainer-schedule/screen.md` · `reference.png` 1675×1155, SHA `d2d58b16…` |
| HTML | `reference/Trainer - Schedule/Trainer - Schedule.html` |
| Canonical route | `/trainer/schedule` — **satisfied** (created at checkpoint F-04 under operator ruling R-B1; `/trainer` preserved as a 307 redirect) |
| Components | `app/(portals)/trainer/schedule/page.tsx` → `features/trainer/trainer-schedule.tsx` (690 lines) + `trainer-schedule-projection.ts` |
| Lifecycle state | none — projection over `listTrainerSessions()`; past/eligible/future derived against the pinned Asia/Singapore clock |
| **Classification** | **MINOR RECONCILIATION** |

> **Corrections to the ratified inventory — three points where it is now stale.** (1) §7.3 records ID 05 as *"the single most consequential finding … no implemented route"* and defers an operator decision between "accept the fold" and "build the route". **That decision was taken and executed: `/trainer/schedule` exists at HEAD `139d753`.** (2) §8.1 describes the lifecycle backend as *"delivered on `feat/48h-backend` (not yet merged to `main`)"* — it is on `main` at HEAD. (3) **§0.3 states *"No screen in this inventory is marked `Implemented and visually aligned`. No frozen `reference.png` exists yet for any of the 36 screens"* — false since 2026-08-06 for twelve of them.** That third one matters most: it is the sentence a future reader would use to deny that visual-authority rank 1 is populated at all. All three should be annotated when that document is next revised (Phase R0).

**Mismatch.** (1) "Start Class" relabelled **"Open Class Roster"** — correct; the session-lifecycle enum is deferred and unratified (A-026, U-21). **Governance-sensitive; do not "fix" toward the frame.** (2) "Add Agenda" renders disabled with a visible reason — correct; session creation is a Management action (A-019). (3) Studio/room, "Main:" and "Assist." trainer names omitted — no governed field; recorded, not fabricated. (4) *Genuinely reconcilable:* the frame puts the month control as a chevron on the "March 2035" title; the implementation renders a separate labelled `<select>` plus a "Month shown" micro-label — extra chrome the frame does not draw, and Add Agenda is a muted disabled button where the frame draws a pink primary. (5) **Live defect C2C-015:** the schedule opens on the *earliest assigned session*, not today (`defaultFocusIsoDate(projected)`), so a trainer arriving for a demo lands on a past month. This is on flow order 2.

**Required correction (bounded).** Fold the month selector into the period title as drawn; keep Add Agenda disabled but match the frame's primary geometry with a disabled treatment; **fix C2C-015** to default focus to the current Singapore date when the trainer has any session that month. Nothing else — do not restore Start Class, Studio, or trainer names.

**Governance.** A-016/A-047 (calendar is a projection; no duplicated event or agenda record — held: the projection creates no store), A-019, A-026, A-054 (Class Grade tags carry `data-vocabulary="class-grade"`, not competency ratings), ADR-4 (only assigned sessions; search and view narrow, never widen).
**Acceptance evidence.** Render at 1675×1155 against the frozen PNG; assert `data-schedule-view` switch and `data-schedule-day` cells; assert Add Agenda `disabled` with `aria-describedby`; assert a future session's roster entry is `data-roster-entry="inert"`; assert no event/agenda write path exists; PNG SHA-256 unchanged before and after.

### 06 · Trainer Student Roster — flow 3
| Field | Value |
|---|---|
| Markdown / PNG | `06-trainer-student-roster/screen.md` · `reference.png` 1440×1120, SHA `78e4b618…` |
| HTML | `reference/Trainer - Student Roster/Trainer - Student Roster.html` |
| Canonical route | `/trainer/schedule/[sessionId]/student-roster` — **NOT created** (authorized non-execution, F16) |
| Current route | `/trainer/sessions/[sessionId]/roster` |
| Components | `app/(portals)/trainer/sessions/[sessionId]/roster/page.tsx` → `features/trainer/trainer-roster.tsx` (668 lines) |
| Lifecycle state | per-student `reportState` across all eight statuses + `attendanceState` (`present`/`absent`, A-018) |
| **Classification** | **MINOR RECONCILIATION** |

**Mismatch.** (1) Route family not canonical — deliberate, authorized, recorded (§3). (2) "CLASS IN SESSION" eyebrow relabelled "CLASS SESSION" and the live dot dropped — correct; no session-lifecycle enum exists. **Governance-sensitive.** (3) Lesson strip, date/room line, SLIDES chips and "Trainer: …" omitted; "View lesson plan" disabled with a stated reason — all correct, no governed fields. (4) KEY FOCUS chips repurposed to the carried-over previous-session focus and relabelled — correct, and satisfies persona §3.8 continuity. (5) *Genuinely reconcilable:* Filter and Sort render as labelled `<select>` controls, not the frame's two icon-led buttons. (6) The frame's 8 synthetic learners not ported — correct (`GLOBAL_UI_RULES` §8). (7) **`screen.md` §12 is stale** — records "Existing route audited: No" and acceptance "Not started" though checkpoint F-05 shipped.

**Required correction (bounded).** Render Filter and Sort in the frame's control geometry while keeping real labels and keyboard operability; refresh `screen.md` §12 to the F-05 state. Do not restore the lesson strip, slides, trainer name, or the "CLASS IN SESSION" claim.

**Governance.** A-018 — attendance is server-resolved and **absence exposes nothing** (held: `resolveAction` gates on attendance *before* report status, so an absent card carries no status pill and no path); ADR-4; A-054; not rating-bearing per §8, and the implementation correctly renders no competency vocabulary.
**Dependency carried, not a defect.** A-018 grants the Trainer an attendance toggle and the frame draws the state, but **no attendance mutation exists on `PhysicalTestPort`** — recorded, not faked. Open governed capability with no path, on a core-slice screen.
**Acceptance evidence.** Render at 1440×1120; assert `data-roster-card` / `data-attendance` / `data-roster-action` per learner; assert an `absent` card has no `StatusPill` and no `href`; assert the four actions resolve per-student (no shared generic handler); assert progress = assessed / present.

### 07 · Trainer Grade Student — flow 4
| Field | Value |
|---|---|
| Markdown / PNG | `07-trainer-grade-student/screen.md` · `reference.png` 1650×1200, SHA `1df95a5b…` |
| HTML | `reference/Trainer - Grade Student/Trainer - Grade Student.html` (corroborates the PNG exactly: 9 × Beginning/Developing/Mastering/Mastered) |
| Canonical route | `/trainer/schedule/[sessionId]/student-roster/[studentId]/grade-student` — **NOT created** |
| Current route | `/trainer/sessions/[sessionId]/students/[studentId]/assess` |
| Components | `features/trainer/trainer-assessment.tsx` (1,057 lines); vocabulary from `lib/frontend/fixtures/dimensions.ts`, `lib/frontend/contracts/physical-test.ts` |
| Lifecycle state | `incomplete → observation_saved`; nine mandatory ratings; `observations.follow_up_notes`; `observationLockVersion` CAS |
| **Classification** | **MINOR RECONCILIATION** |

**Mismatch.** (1) **Row order differs from the PNG deliberately.** The frame interleaves the two governed groups; the implementation renders the ratified order (Body, Emotion, Speech, Tonality, then Eye Contact, Vocal Projection, Emotional Expression, Sentence Flow, Audience Awareness) with the two groups captioned. **Governance already won correctly** (`CLAUDE.md` §5, spec §3). **Do not reorder to the frame.** (2) A behavioural anchor line is added under every row — a **required addition**, not a liberty. (3) A "Follow-up for Next Session" field is added — `observations.follow_up_notes` must be loaded, not blanked. (4) "Junior" and "Student ID 2025-113" omitted — "Junior" is not a governed Class Grade and no learner-facing student number exists. (5) Selected-chip fills darkened — the frame's four fills measure 3.70 / 2.03 / 2.34 / 2.51 : 1 and all fail SC 1.4.3; hue preserved, luminance moved, re-measured at 5.466 / 5.134 / 5.311 / 5.733 : 1. (6) **`screen.md` §8 is stale** — says Amendment 006 implementation is "pending Backend V2 and Frontend V3"; both landed.

**Required correction (bounded).** Update `screen.md` §8 and §12 to record V2/V3 as discharged. **No UI change is warranted** — every visual divergence is governance-mandated and recorded.

**Governance.** **A-017 — all nine mandatory, exactly one capture mode, no Quick/Full toggle, no `observations.mode`** (verified: no `mode` prop or branch in the file); A-049/A-050/A-051 labels, verbatim anchors and polarity; server-side completion validation authoritative, client check a convenience (ADR-3); A-018. Per-dimension ratings are **legitimately visible here** — this is a Trainer surface.
**Acceptance evidence.** Render at 1650×1200; assert nine rows in ratified order with group captions; assert 36 rating controls each carry a **distinct** accessible name containing its verbatim anchor; assert no control is named Quick/Full and no Quick/Full copy renders; assert `follow_up_notes` loads non-empty where one exists; assert all four rating states ≥ 4.5:1 in the production DOM; assert route census unchanged.

### 08 · Trainer AI Report Generation — flow 5
| Field | Value |
|---|---|
| Markdown / PNG | `08-trainer-ai-report-generation/screen.md` · `reference.png` 1650×1180, SHA `3160524f…` |
| HTML | `reference/Trainer - AI Report Generation/Trainer - AI Report Generation.html` |
| Canonical route | `…/grade-student/ai-report-generation` — **NOT created**; note the keying mismatch (`reportId` vs `(sessionId, studentId)`) |
| Current route | `/trainer/reports/[reportId]/generate` |
| Components | `features/trainer/trainer-draft-generation.tsx` (728 lines) + `report-panel-config.ts` |
| Lifecycle state | `observation_saved → drafting → draft_ready`; RPC-3 → grounding → RPC-4 store / RPC-5 cancel; refusal classes `validation \| stale_state \| generation_failure` |
| **Classification** | **MINOR RECONCILIATION — but the most governance-sensitive screen in the set.** The visual delta from the PNG is large; every element of it is governance-mandated and formally recorded, so the implementation is correct and **the frozen frame is the thing in conflict** (§5, GC-1). |

**Mismatch.** (1) **The frame is a TERM REPORT marked "Parent copy" with "Confirm & Submit" / "Save as draft".** Three simultaneous contradictions — term-report generation is expressly out of MVP scope (`CLAUDE.md` §5/§8, spec §28, a different 7-criteria instrument); "Parent copy" is a lifecycle claim only Management can make (A-033); the trainer does not publish (A-033/A-036), and the real gate is the version-scoped three-item Quality Checklist the frame draws nowhere. (2) ~~Panel headings Overview / Strengths / Areas to Grow / Remarks **not adopted** — the governed four are Today's Strength / Next Focus / Practice Suggestion / Session Takeaway~~ ⚠️ **REVERSED — OD-4 RULED BY OPERATOR 2026-08-07.** The canonical four are **Overview · Strengths · Areas for Development · Remarks** (note: **not** the minority *Areas to Grow* this line quoted); the four struck above are **`SUPERSEDED_BY_OD-4_FINAL_REPORT_MODEL`**. This is no longer a mismatch to correct back and **no longer an open adjudication** — it is a **Phase B semantic migration** of the implementation toward the ratified four. See `FINAL_MVP_OD4_REPORT_SEMANTICS_RULING.md` ~~(spec §8). **Open operator adjudication — §6 OD-4.**~~ **RULED 2026-08-07 — §6 OD-4 is CLOSED.** (3) Class Video Evidence uploader rendered inert with a visible reason — correct; evidence scope *and* uploader are UNRESOLVED (A-014). (4) Lesson/Term omitted; "Overall Grade" omitted outright — a headline rating would be a derived assessment fact the frontend computes (A-034/A-035). (5) PERFORMANCE SUMMARY expanded from the frame's arbitrary four tiles to all nine — no governed rule selects four, and all nine are mandatory (A-017). (6) **Live defect C2C-006:** the refusal branch does not distinguish `stale_state`, so a stale-state refusal renders copy claiming "Draft rejected safely / The report stayed at Observation Saved".

**Required correction (bounded).** **Fix C2C-006** — branch all three refusal classes and give `stale_state` accurate copy plus a route to review. ~~Obtain the §6 OD-4 panel-heading adjudication.~~ ✅ **OD-4 RULED 2026-08-07** — this screen's panels become **Overview · Strengths · Areas for Development · Remarks**, and the change is **semantic, not a relabel**: the AI must draft those four **directly**, and grounding rule 4 must be re-derived rather than retargeted (`FINAL_MVP_OD4_REPORT_SEMANTICS_RULING.md` §5.2). ⚠️ **Note this screen's `reference` pack (`Trainer - AI Report Generation.md:14-15`) draws only three editable sections plus a separate Remarks input, and uses the minority label *Areas to Grow* — neither is canonical; the ruling supplies four panels and `Areas for Development`.** **Do not** implement Confirm & Submit, Save as draft, Overall Grade, a four-tile subset, the uploader, or term-report framing.

**Governance.** §4 non-negotiable 1 — grounding runs before any draft reaches the screen and a rejected draft's wording is **never rendered**; A-032 (AI holds no approval authority); A-052 (contextual leak detection; bare-word regex prohibited); A-038 (content hash never rendered); A-033/A-036.
**Acceptance evidence.** Force each of the three refusal classes and assert distinct, accurate copy; assert a grounding-rejected draft's wording never appears in the DOM; assert no control named Submit/Publish and no parent-notification claim; assert the evidence region is inert with an `aria-describedby` reason; assert nine tiles, not four; assert no content hash in the DOM.

### 10 · Trainer Student Report — flow 6
| Field | Value |
|---|---|
| Markdown / PNG | `10-trainer-student-report/screen.md` · `reference.png` 1440×1351, SHA `e64291dc…` |
| HTML | `reference/Trainer - Student Report/Trainer - Student Report.html` |
| Canonical route | `/trainer/reports/[reportId]` — **index route does not exist** |
| Current routes | `/trainer/reports/[reportId]/review` and `/edit` |
| Components | `features/trainer/trainer-report-review.tsx` (749) · `trainer-report-editor.tsx` (291) · `report-panel-config.ts` |
| Lifecycle state | `draft_ready \| needs_edit → trainer_approved`; RPC-14, RPC-13, RPC-7, RPC-8; carries `expectedVersionId` + `expectedLockVersion` + `expectedContentHash` |
| **Classification** | **MINOR RECONCILIATION** |

**Mismatch.** (1) Canonical index route missing; **§6 OD-3 open** (whether `/edit` is a sub-route of ID 10 or takes its own ID). (2) "Official report" subtitle not adopted — at `/review` the version on screen is the Trainer's *working* version; only Management's Approve & Submit makes a version canonical (A-033), so it would be a false lifecycle claim. (3) ~~Panel headings not adopted — §6 OD-4.~~ ⚠️ **OD-4 RULED 2026-08-07 — CLOSED, and reversed.** The canonical four are **Overview · Strengths · Areas for Development · Remarks**; the previously governed four are **`SUPERSEDED_BY_OD-4_FINAL_REPORT_MODEL`**. Not a mismatch to correct back — a **Phase B semantic migration**. (4) Evidence player inert; duration/format/"Recorded…" omitted rather than fabricated. (5) Lesson/Term omitted; "Overall Grade" omitted; four tiles expanded to nine. (6) **The frame draws only the approved end state** — no checklist, no Approve control, no returned-correction state, no Coach Notes. `screen.md` §6 requires all of those preserved, so they are built and rendered for the states in which they apply. **The frame is materially incomplete for this screen's governed responsibility.** (7) `screen.md` §12 stale (F-09 shipped). (8) `/edit` is not proposed accepted — no frame covers it.

**Required correction (bounded).** Add the canonical `[reportId]` index (F16, separately authorized); ~~obtain OD-4~~ ✅ **OD-4 RULED 2026-08-07 — apply the four canonical panels (Overview · Strengths · Areas for Development · Remarks) as a semantic migration, and rewrite this screen's stale deviation comment at `trainer-report-review.tsx:80-81`, which still states the superseded disposition**; resolve OD-3; refresh `screen.md` §12. Do not restore "Official report", Overall Grade, Lesson/Term, the evidence player, or the four-tile subset.

**Governance.** **A-033 — trainer approval publishes nothing and must claim no parent notification**; A-036 — the checklist gate is version-scoped and the disabled button is **not** the gate (the server re-verifies all three for the exact version; proven by Run C4 N-13, which refused a signature-correct RPC approval at 0/3 with `BC005`); A-037; **A-035/A-036 — the returned version can never be reapproved as-is; a silent byte-identical save is rejected server-side (`BC021`)**; A-021; A-038.
**Acceptance evidence.** Render at 1440×1351; assert by pattern (not only copy) that no approve path claims publication or parent notification; assert Approve is `disabled` until all three checklist inputs are checked and that the copy names the server re-verification; assert no content hash anywhere in the DOM; force a returned report and assert reapproval-as-is is refused; re-measure all four rating label states ≥ 4.5:1.

### 19 · Management Student Report — flow 9
| Field | Value |
|---|---|
| Markdown / PNG | `19-management-student-report/screen.md` · `reference.png` 1440×1330, SHA `394d8475…` |
| HTML | `reference/Management - Student Report/Management - Student Report.html` |
| Canonical route | `/management/students/[studentId]/reports/[reportId]` — **NOT created** |
| Current routes | `/management/reports/[reportId]/review` and `/edit` |
| Components | `features/management/management-report-review.tsx` (incl. `PublishedReport`) · `management-wording-editor.tsx` · `features/trainer/report-panel-config.ts` |
| Lifecycle state | `trainer_approved` (mutating candidate) · `submitted` (published read-only). Transitions **T9** wording edit, **T10** return, **T11** `trainer_approved → approved → submitted` in one transaction |
| **Classification** | **MINOR RECONCILIATION** |

**Mismatch.** (1) Canonical route missing. (2) **Six frame elements deliberately omitted under operator ruling R-B5**, documented in-source at `management-report-review.tsx:39-96` — P1 audience toggle, **P2 Performance Summary rating grid**, **P3 Overall Grade**, P4 trainer observations/notes and assessment-editing controls, **P5 Class Video Evidence**, P6 "Save as draft". (3) Four further divergences: panel headings not the governed four *(⚠️ **reversed by OD-4, ruled 2026-08-07**: the canonical panels are now **Overview · Strengths · Areas for Development · Remarks**, so this is no longer a divergence to correct back — it is a **Phase B semantic migration** of the implementation toward them. Note the pack's own label at `Management - Student Report.md:11` is the minority variant *Areas to Grow*; the ratified label is **Areas for Development**)*; "Management copy" replaced by the governed lifecycle state; ad-hoc glyphs replaced from the approved set; the frame's approve copy replaced with the ratified sentence. (4) **The frame draws no return-to-trainer control at all**; the implementation adds "Return assessment concern" because A-034 requires it — a governance-mandated *addition*. (5) `/edit` has **no frame at all** (blocked design family) and is explicitly not proposed accepted.

**Wording-only edit — verified at source, and the strongest control in the system.** Enforcement is in the **database signature, not the UI**. `report_management_edit_wording(p_report_id, p_expected_lock_version, p_expected_version_id, p_expected_wording_hash, p_todays_strength, p_next_focus, p_practice_suggestion, p_session_takeaway)` — migration `20260805090500_step_7i_report_lifecycle.sql:1919-1933`. **There is no parameter for a rating, observation, attendance row, evidence object, trainer note, checklist row, approval row, revision number, lineage or submission metadata.** Line 1901: *"THE ALLOW-LIST IS THE SIGNATURE, NOT A RUNTIME FILTER."* ⚠️ **OD-4 renames these four parameters and does NOT change the arity or the control** — the allow-list stays **exactly four columns**, and widening or narrowing it remains a stop-and-ask. Lines 2018-2029 copy the nine `report_version_ratings` **verbatim** from the trainer-approved source, so management cannot introduce, remove or alter a rating **even by bypassing the UI**. Lines 1987-2006 are the lineage gate; 2008-2016 verify the **wording** hash (never the content hash, R-26). Client side: `ManagementReviewDto` carries no ratings field, so the editor physically cannot render or submit one. Run C4 N-4 confirms a signature-correct nine-rating write from management is refused with an authored `BC101`.

**Return-for-correction — verified.** "Return assessment concern" → modal capturing a **closed `issueScope`** (`rating` / `observation` / `derived_assessment_fact`), a required dimension when scope = rating, and a required reason capped at 2,000 chars. Server: **no version is created**, `latest_submitted_version_id` untouched (no parent-observable signal), and **the reason prose never enters the audit event** — only request id, issue scope and dimension code.

**Approval — verified.** Confirmation copy matches `CLAUDE.md` §6 A-033 verbatim. It is the only publish path; `PublishedReport` carries no lock version, version id or wording hash, so no mutation can be constructed from it.

**Required correction (bounded).** **None to the governance omissions — they are correct and must stay.** Outstanding: execute the canonical-route treatment under its own authorization; capture before/after at 1440×1330; obtain a design disposition for `/edit` (§6 OD-5) rather than fabricating one.
**Acceptance evidence.** Four F-12 renders already exist at `_checkpoint-evidence/F-12/`. Still required: the canonical-route decision, the `/edit` disposition, and the pixel comparison at 1440×1330 with the R-B5 omission set stated.

### 29 · Management Reports — flow 8
| Field | Value |
|---|---|
| Markdown / PNG | `29-management-reports/screen.md` · `reference.png` 1440×1160, SHA `eddda3b1…` |
| HTML | `reference/Management - Reports/Management - Reports.html` — verified textually consistent with the PNG |
| Canonical route | `/management/reports` — **satisfied**, plus ratified aliases `?status=trainer_approved`, `?status=needs_edit`, `?status=submitted` |
| Components | `features/management/management-reports-queue.tsx` · `components/layout/portal-navigation.ts` · `server/modules/management-view/projections.ts` |
| Lifecycle state | `trainer_approved` (pending) · `needs_edit` + `draft_ready` (correction tracking) · `submitted` (approved). **`approved` can never appear** — transient in-transaction (A-036) |
| **Classification** | **MINOR RECONCILIATION** |

**Mismatch.** (1) Pending vs Approved is a dropdown in both frame and implementation — one `FilterChip` with three options, satisfying R-C2-3 without a second route. (2) Status vocabulary: the frame says "Approved" / "Needs approval"; the implementation renders the governed labels. Correct — the frame's vocabulary is Figma mock data, and "In session"/"Draft" are not among the eight authorized `report_status` values. (3) Columns: frame draws 6, implementation draws 4 — Class, Lesson and Trainer are not carried by the governed projection and were correctly not fabricated. (4) "All terms" / "All classes" filters render inert with a visible stated reason rather than faked client-side. (5) Row actions decided per-status via `ROW_PRESENTATION[row.status].exposesContent` — the A-038 rule implemented exactly, including the "no generic view-report handler" prohibition. (6) Rail shows 3 of the frame's 6 destinations (the others depend on deferred screens). (7) Greys darkened for AA (frame greys measure 2.043:1 and 3.079:1).

**Required correction (bounded).** **None functional.** Outstanding for acceptance: layout/spacing/typography comparison at 1440×1160; operator sign-off on the withheld columns. The pre-existing `portal-shell.tsx` nav contrast failure (3.079:1) is outside owned paths and is recorded, not fixed here.
**Acceptance evidence.** Exists at `_checkpoint-evidence/F11/` — pending / corrections / empty at 1440×1160, plus 1024×900 and `contrast-measurements.json` (60 text nodes from live computed styles in a production build). Status: **Proposed for operator review, NOT accepted.**

### 32 · Parent Reports — flow 11
| Field | Value |
|---|---|
| Markdown / PNG | `32-parent-reports/screen.md` · `reference.png` 1440×1120, SHA `90e368c1…` |
| HTML | `reference/Parent - Report/` |
| Canonical route | `/parent/reports` — **satisfied** |
| Components | `features/parent/parent-reports-list.tsx` · `server/modules/parent-view/projections.ts` (`listParentReportsCore`) |
| Lifecycle state | `submitted` only |
| **Classification** | **MINOR RECONCILIATION** (governance-driven, correctly handled) |

**Mismatch,** all recorded in-source at `parent-reports-list.tsx:14-41`: the frame's aggregate rating chip ("Mastering", "Developing") is **deliberately not implemented** (governance overrides Figma, ruling R-B6) — correct. Row title falls back to the student name because the governed DTO carries no lesson/topic; class grade, module, lesson number and trainer name are **omitted rather than fabricated**. The rail shows Home/Reports, not the frame's Overview/Calendar/Reports (screens 30/31 deferred). Remaining deltas: `?preview=empty` is an ungated caller-input suppression (C2C-020); `PageHeading` `description` bypassed for a documented AA contrast failure still unfixed in the shared primitive.

**Required correction (bounded).** Gate `?preview=empty` on the fixture adapter or drive the empty state from zero-row fixture data; keep the chip omitted; capture before/after at 1440×1120. Do not add the meta-line fields without a governed projection.
**Dependency.** The cross-family negative test needs a two-parent / two-student fixture — **C2C-013, still absent** (§7).
**Acceptance evidence.** Before/after PNG; `assertParentSurfaceClean` (exists, `tests/frontend/three-role-browser-smoke.mjs:494-560`); **plus the missing** parent-linked-to-A-cannot-read-B negative.

### 33 · Parent Class Report — flow 12
| Field | Value |
|---|---|
| Markdown / PNG | `33-parent-class-report/screen.md` · `reference.png` 1440×1340, SHA `2aaeb446…` |
| HTML | `reference/Parent - Class Report/` |
| Canonical route | `/parent/reports/[reportId]` — **NOT created** |
| Current route | `/parent/students/[studentId]/sessions/[sessionId]/report` |
| Components | `features/parent/parent-canonical-report.tsx` · `getCanonicalReportCore` · RPC-13 `report_get_canonical` |
| Lifecycle state | `submitted` only; view-only |
| **Classification** | **MINOR RECONCILIATION** (four deliberate governance omissions, recorded in-source at `parent-canonical-report.tsx:24-67`) |

**Mismatch.** The frame draws **four prohibited things** — (1) the per-dimension PERFORMANCE SUMMARY grid, (2) "Overall Grade: Mastering", (3) prose rating attributions ("Assessed as Mastered in eye contact…"), (4) the "Watch Together" 3:24 evidence video (evidence scope/uploader UNRESOLVED, A-014; parent access is triple-gated and Phase 2 conditional, A-001). **All four are omitted — correctly.** The Report Details sidebar is omitted because `CanonicalReportDto` carries only `panels` + `submittedAt`. Remaining real deltas: **no Back-to-Reports affordance in the success state** (C2C-027 — verified still absent; the file imports no `Link`); **route params passed to the RPC with no UUID pre-check** (`:81`, `:87`) so a malformed id renders a *visibly different* panel than a valid-but-unreachable one (C2C-025).

**Required correction (bounded).** Add a keyboard-reachable Back control to `/parent/reports`; apply the existing UUID pre-check pattern from `context-resolver.ts:59-73` so malformed and unreachable collapse to the same `unavailable`; keep all four omissions permanently. Route migration stays deferred.
**Acceptance evidence.** Before/after PNG at 1440×1340; **byte-identity of three denial documents** (malformed id / non-existent pair / other-family pair) — **would FAIL today on the malformed leg.**

---

## 3. Route mismatch register — core slice

`FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` §7.1 establishes that the implemented routes were built to `PHYSICAL_TEST_SLICE_48H.md` §4, which pins a route contract, and that **both route sets are legitimate**: the pinned routes govern the physical test, and Amendment 005 A-042 ratifies the canonical routes as the **final-MVP target**. Execution belongs to a separately-authorized route-migration checkpoint.

| ID | Canonical route | Implemented route | Treatment |
|---|---|---|---|
| 06 | `/trainer/schedule/[sessionId]/student-roster` | `/trainer/sessions/[sessionId]/roster` | Replace after integration; pinned path preserved as redirect |
| 07 | `…/student-roster/[studentId]/grade-student` | `/trainer/sessions/[sessionId]/students/[studentId]/assess` | Replace; pinned path as redirect |
| 08 | `…/grade-student/ai-report-generation` | `/trainer/reports/[reportId]/generate` | Replace; **canonical is keyed on `(sessionId, studentId)`, implemented on `reportId`** — needs a server-side resolution the trainer projections already perform |
| 10 | `/trainer/reports/[reportId]` | `/trainer/reports/[reportId]/review` (+ `/edit`) | Add the canonical index; `/review` and `/edit` remain governed sub-surfaces |
| 19 | `/management/students/[studentId]/reports/[reportId]` | `/management/reports/[reportId]/review` (+ `/edit`) | Replace; canonical adds a `[studentId]` segment the implemented route resolves server-side |
| 33 | `/parent/reports/[reportId]` | `/parent/students/[studentId]/sessions/[sessionId]/report` | Replace; **implemented route matches the canonical read RPC's `(class_session_id, student_id)` key directly**; canonical requires a `reportId` → pair resolution |
| 01 | `/trainer/dashboard` | `/trainer` (currently redirects to `/trainer/schedule`) | Preserve `/trainer` as redirect |
| 11 | `/management/dashboard` | `/management` | Preserve as redirect |
| 30 | `/parent/dashboard` | `/parent` | Preserve as redirect |

**Canonical routes already satisfied:** AUTH-01/02/03, **05** (executed since the inventory was written), **09** ⚠️ *(route string satisfied but **non-functional** — C2C-007, §7)*, **29**, **32**.

**Implemented routes with no canonical inventory ID** — both carried as open decisions (§6): `/trainer/reports/[reportId]/edit` (OD-3) and `/management/reports/[reportId]/edit` (OD-5). *`/management/reports/[reportId]/review` is **not** in this category — it is the implemented route of ID 19, exactly as `/trainer/reports/[reportId]/review` is for ID 10.* The two `?status=` query families are ratified **compatibility aliases**, not separate routes.

---

## 4. Shared / global states — 25, enumerated individually

These are **not** among the 36 and are counted separately. `GLOBAL_UI_RULES.md` §7:114 mandates them: *"Loading, empty, error and success states are announced, not only drawn."*

| ID | State | Implementation | Class |
|---|---|---|---|
| S-1 | `loading.tsx` route boundary — **all 17 routes** | **Zero files at any depth.** Each surface re-implements `LoadingSkeleton` in-page | **MISSING** |
| S-2 | `error.tsx` for the portal group | **Absent.** An uncaught throw escapes to Next's built-in page — **outside `PortalShell` and outside the governed non-disclosing copy** | **MISSING** |
| S-3 | `global-error.tsx` | Absent | **MISSING** |
| S-4 | `not-found.tsx` | Absent. Unknown portal paths fall to bare `/_not-found`. **`integrated-route-security.mjs` SEC-11 relies on that bare 404 — any fix must preserve the guard proof** | **MISSING** |
| S-5 | Root landing `/` | `app/page.tsx` — `Promise<never>`, renders no markup; both failure modes → `/login`, indistinguishable; destination from server-derived role only | **EXACT** |
| S-6 | `(auth)` layout | `AuthBackdrop` — four `brand-100` discs bleeding off corners, `aria-hidden`, `pointer-events-none`, 25rem column measured from the frozen frames | **EXACT** |
| S-7 | Portal shell / rail / header | 15.625rem rail, `BrandMark` first tab stop with role-derived home, `aria-current="page"` on exactly one item in both desktop rail and mobile header | **MINOR** (rail item set differs by deferral) |
| S-8 | Sign-out | Real `<form action={signOutFormAction}>` → server `auth.signOut()` → `redirect("/login")`, outside the `nav` landmark | **EXACT** |
| S-9 | Authenticated role switching | **Deliberately absent.** The only role control is three `<Link>`s to `/login?role=…`, no `onClick`, no session effect | **EXACT** |
| S-10 | Unauthorized / 403 | **No 403 screen, by design.** Wrong-role → redirect to the caller's own portal root — discloses not even that the requested path exists | **EXACT** |
| S-11 | Session-expired | Navigation → proxy → `/login` (correct). A Server Action after expiry → `StatePanel` "Sign-in required", but its button href is `homeHref` (e.g. `/parent`), forcing a redirect hop rather than going to `/login` | **MINOR** |
| S-12 | Password reset / "Forgot password?" | **No route, no component.** Inert text + sr-only "— not available". `reference/Auth 04` is a complete designed screen with no pack, no inventory ID, no node ID | **MISSING** — §6 OD-1 |
| S-13 | "Remember me" | `disabled`, no `name`, never submitted — deliberate; a second session-persistence mechanism is unauthorized | **MINOR** (accepted deviation, record it) |
| S-14 | Empty state — `/parent` | Both branches exist with `role="status"`, **but they are produced by `searchParams.get("preview")`** (`parent-dashboard.tsx:62-68`) — the same ungated caller-input suppression as S-17 | **MINOR** (subsumed by C2C-020) |
| S-15 | Empty state — `/parent/reports` | "No reports available yet" with `role="status"`, **but reachable via `?preview=empty`** (`parent-reports-list.tsx:69`) | **MINOR** (subsumed by C2C-020) |
| **S-23** | **Validation states** | `GLOBAL_UI_RULES.md:110` mandates: *"Validation errors are announced, associated with their field, and the first invalid field is reachable directly."* Every core `screen.md` §10 lists validation among the six mandated states. **Not enumerated or examined anywhere in this plan's first draft** | **UNVERIFIED — must be assessed before Phase R2** |
| **S-24** | **Success states** | `GLOBAL_UI_RULES.md:114` mandates success among the four announced states; `screen.md` §10 repeats it | **UNVERIFIED — must be assessed before Phase R2** |
| **S-25** | **Disabled states** | `screen.md` §10 mandates disabled among the six. Heavily used in practice (Add Agenda, View lesson plan, Approve-until-checklist, inert evidence regions) but never assessed as a state family | **UNVERIFIED — must be assessed before Phase R2** |
| S-16 | Suspense fallbacks | `/login` uses a labelled `role="status"` line (good). **6 routes use `fallback={null}`** → completely blank during the streamed segment; **10 routes use no Suspense at all** (8 excluding the two pure-redirect routes) | **MINOR** |
| S-17 | `?preview=` presentation overrides | Six ungated branches. Direction of travel is safe (can only suppress) but rendered state becomes a function of caller input in a **participant** build | **MINOR** (C2C-020) |
| S-18 | Malformed-parameter denial parity | `parent-canonical-report.tsx:81,87` passes route params unvalidated → PG `22P02` → a visibly different panel. The fix pattern exists at `context-resolver.ts:59-73` and was not applied here | **MINOR** (C2C-025) |
| S-19 | `StatePanel` denial primitive | `unauthorized` and `unavailable` collapse to one byte-identical branch — correct. But `homeHref` defaults to `/trainer`; all Parent/Management call sites override, so no live leak, but the next omitting consumer inherits a cross-portal destination | **MINOR** (latent) |
| S-20 | Skip link to `#main-content` | `portal-shell.tsx:264` sets `id="main-content"`; a repository-wide grep finds **no skip link and no "Skip to" string anywhere**. The anchor is a dangling target | **MISSING** |
| S-21 | `/parent/dashboard` redirect from `/parent` | Not built; ratified-deferred (C2C-045) | **MISSING (deferred — not a defect this sprint)** |
| S-22 | `/parent/reports/[reportId]` canonical route | Not built; pinned pair-keyed path in use | **MISSING (deferred)** |

**Totals (25 entries):** EXACT 5 · MINOR 9 · MAJOR 0 · MISSING 8 · **UNVERIFIED 3**.

> **Vocabulary note.** "EXACT" here means **no defect found against governed behaviour** — it does **not** carry the §0.4 sense used for the 36 screens, which additionally requires a frozen `reference.png` and operator visual acceptance. Shared states have no pack and no frozen reference, so the screen-level definition is structurally unsatisfiable for them. **The two senses must not be conflated, and no shared-state EXACT implies visual acceptance.**

**S-1…S-4 are the highest-value shared-state work.** Their absence means an uncaught throw or an unknown portal path renders **outside the one place this project's carefully-uniform non-disclosing denial language reaches**. Any fix must not interpolate a thrown message, and must preserve SEC-11's reliance on the bare 404.

---

## 5. Governance-sensitive frame conflicts — fourteen

**In every case governance wins. None of these may be built as drawn. Each must be recorded in the pack's `implementation-notes.md` so a future implementer working from the image alone cannot reintroduce it.**

| # | Screen(s) | The frame draws | Rule violated |
|---|---|---|---|
| **GC-1** | 08 | A **Term Report** marked "Parent copy" with "Confirm & Submit" / "Save as draft" | Term generation out of MVP scope (`CLAUDE.md` §5/§8, spec §28); A-033 (trainer does not publish, and only Management may make a parent-facing claim); A-036 |
| **GC-2** | **31 Parent Calendar** | Per-day rating colouring, a "Developing" status pill, dimension chips, "13 mastered days", counters "2 Beginning · 7 Developing · 4 Mastering · 3 Mastered", **and an explicit legend glossing all four levels** | A-021, A-048, **A-052 (taxonomy disclosure)**, `CLAUDE.md` §6 — publishes the entire competency taxonomy to a parent. **The most severe conflict in the set.** |
| **GC-3** | 30 Parent Dashboard | "This Term's Skills" — a **nine-row bar chart, one bar per B.E.S.T dimension** | Per-dimension rating grid on a parent surface, prohibited "in any form or wording". A bar chart is a form. ✅ **ELEVATED AND CLOSED 2026-08-08 by operator ruling Q-27** (`FINAL_MVP_AUTHORITY_LOCK.md` §15.2). GC-3 said *do not build the bar chart*; **Q-27 rules the COMPLETE CARD absent** — title, all nine labels, all bars, all rating-derived state, and **any replacement ratings visualization**. Hiding, emptying, collapsing, renaming or substituting is **non-compliance**. **Profile Details promotes upward** into the vacated main-column space; **no blank rectangle, no invented filler card**; right-hand Calendar / Upcoming unchanged. **The exclusion is a data-boundary requirement**, not a UI one — Parent-facing DTOs, projections, RPC results, server actions and client payloads must not carry the nine ratings; **CSS hiding is not exclusion**. **Visual acceptance treats the card's absence as `EXPECTED / REQUIRED`, never as `MISSING IMPLEMENTATION` or a `VISUAL REGRESSION`.** Trainer/Management ratings are **unaffected** and OD-4 is **unchanged**. **No authoritative PNG/HTML/Figma bytes were altered.** |
| **GC-4** | 33 | PERFORMANCE SUMMARY grid, "Overall Grade", prose rating attributions, "Watch Together" video | A-021/A-048; A-034/A-035; ~~A-001/A-014 (evidence unresolved)~~ **RATIONALE STRENGTHENED 2026-08-08 (Phase A2, S-52):** evidence is no longer "unresolved" — it is **RULED required with the Trainer as uploader**, and the **parent evidence projection is ruled OUT of the Final MVP** (Authority Lock §8.1). So the "Watch Together" omission is now **more** firmly correct, on a positive ruling rather than an open question. A-001 remains **armed but unactivated**. — **already correctly omitted** |
| **GC-5** | 19, 28 | Audience toggle, Performance Summary grid, Overall Grade, "Save as draft" | A-038 (management never reads raw ratings or content hash); A-036 (no management draft state) — **already correctly omitted on 19 under R-B5** |
| **GC-6** | 11, 15, 16, 17, 18, 28 | Per-student competency badges, per-dimension bars, "Overall", "Strongest / Focus area" columns to **Management** | `CLAUDE.md` §6 / A-038 — management never reads raw per-dimension ratings |
| **GC-7** | 01, 04, 09, 17 | Competency ratings in a "Level" / chips column **while the pack's own `screen.md` §8 declares the screen "Not rating-bearing"** | **Functional/privacy ladder — governance wins, not "Markdown over PNG".** Whether a screen may surface rating vocabulary is a privacy question, so A-034/A-035 and `CLAUDE.md` §6 decide it (ladder ranks 1–2) and Figma is last (rank 5). `screen.md` §8 is decisive only because it **restates** that rule. Building from the image would create a **derived per-student headline rating** — the exact class of derived assessment fact the frontend must never compute |
| **GC-8** | 09 | Status chips "In session / Submitted / Draft" | Only `submitted` is among the eight authorized `report_status` values (A-036), which forbids adding a status to encode UI presence |
| **GC-9** | 13 | A **status-agnostic** "Stats ›" action on every row, and **no Class Health Summary** | `CLAUDE.md` §6 mandates per-row status gating and forbids "one generic view-report handler shared across all rows"; the Class Health Summary is mandated and undrawn |
| **GC-10** | 16 | No "Management Insight" panel and no "Students Needing Follow-up" table | Both mandated by `CLAUDE.md` §6 with an **exact deterministic template** — frame is incomplete; the panel must never be AI-authored prose |
| **GC-11** | 24 | A **"Role" dropdown on the trainer identity form**, offering "Assistant Trainer" | ⚠️ **GROUNDS RE-ATTRIBUTED 2026-08-08 (Phase A2, S-53).** ~~A-020/A-025 — *"Never put a role on the identity row; dual role authority is prohibited."*~~ **A-020 and A-025 remain FULLY ACTIVE** (Amendment 004 §23, §24) — they were **misapplied here, not withdrawn**: they prohibit a `role` **column on `accounts`**, not a **selector on a creation form**. **The actual grounds are narrower and stronger: `Assistant Trainer` is not a member of the `centre_membership_role` enum, so the option cannot be persisted at all** (`FINAL_MVP_PHASE_A_GOVERNANCE_RECONCILIATION.md:257`). Role still lives only on `centre_memberships`; TA is a deferred persona (A-014). **The conflict stands — on better grounds.** |
| **GC-12** | 23 | Trainer status **"On leave"** | `centre_memberships.status` is exactly `pending`/`active`/`deactivated`; a third value must not be created from a frame |
| **GC-13** | 25 | A **"Showcase"** event type distinct from a Class Session | A-016 — calendars are **projections** of class-session records; no duplicated event table |
| **GC-14** | 22 | "Can be undone within 30 days" withdrawal | Unratified retention semantics; PDPA enforcement logic is Phase 4 |

Additionally, **screens 20, 21, 24, 26 carry unresolved field inventories** (`Governance decision missing`). Every field drawn on them — gender, home address, photo, employee ID, "Class code" vs "Level" — is unratified. **Do not schema a field from a frame (A-022).** Note one positive: screen 21's email-invite model is *correct* against A-020 (the parent sets their own password via a link; no generated password is displayed).

---

## 6. Operator decisions — six raised; **five open, one RULED**

*(Header corrected 2026-08-07: this read "Open operator decisions — six". **OD-4 was ruled by the operator on 2026-08-07** and is CLOSED — see its row below and `FINAL_MVP_OD4_REPORT_SEMANTICS_RULING.md`. The remaining five are OD-1, OD-2, OD-3, OD-5, OD-6.)*

The five still open block visual acceptance and must be ruled before the affected screens can close. **None may be resolved by an implementer.** ⚠️ **OD-4 being ruled does not make its screens cheaper** — it converts screens 08/10/19 from a bounded visual correction into a **semantic migration** across storage, both hash serializers, 8 RPCs, generated types, the AI schema and prompt, grounding, fixtures and the C3/G-6 + C4 harnesses, **including five fail-open leak/immutability deny-lists** that must each be re-derived and demonstrated firing.

> **ID-space note (2026-08-07).** These six are **screen-scoped** and are cited elsewhere as `screen-plan OD-1` … `OD-6`. The Phase A governance reconciliation carries a *separate* set numbered **`PA-OD-1` … `PA-OD-8`** covering governance, database and deployment decisions. **The two sets are unrelated and must not be conflated** — e.g. `OD-4` here is the panel-heading adjudication, whereas `PA-OD-4` is the B.E.S.T acronym gloss. Where a Phase A track depends on one of these six, it cites `screen-plan OD-n` explicitly.
>
> ~~Two of the six have moved since first drafting: **OD-4 (panel headings) is now resolved from evidence** — the governed four win on the functional ladder because they are simultaneously storage columns and the A-034 wording-edit allow-list, so adopting the frame would be an **amendment**, not an adjudication (and A-053's precedent shows it becomes permanently impossible once any `report_versions` row exists — **rule it while the table is still empty**).~~ ⚠️ **SUPERSEDED 2026-08-07 — OD-4 was RULED BY THE OPERATOR the other way: Overview · Strengths · Areas for Development · Remarks.** The reasoning struck above was sound and is **discharged, not overruled** — it correctly identified that adopting the frame required an **amendment-class instrument**, and an explicit operator ruling is exactly that. It was ruled **inside the time-box, while `report_versions` was still empty**, which is what the struck text asked for. **The old four are `SUPERSEDED_BY_OD-4_FINAL_REPORT_MODEL`.** See `FINAL_MVP_OD4_REPORT_SEMANTICS_RULING.md`. **OD-6 (wordmark) is carried into Phase A as `PA-OD-5b`.**

| # | Decision | Blocks | Notes |
|---|---|---|---|
| **OD-1** | Password recovery. `reference/Auth 04 - All Users - Forgot Password` is fully designed but has **no pack, no inventory ID, no node ID** and is not among the ratified 36. Building it creates a 37th screen (requires an amendment); leaving it inert requires the deviation recorded on all three login packs. | AUTH-01/02/03, S-12 | ⚠️ **Restated 2026-08-07: the deviation-recording half IS discharged** — it is present at line 87 of all three login `implementation-notes.md`, in `CHANGE_LOG.md:321`, in `FRONTEND_RECONSTRUCTION_TRACKER.md:155`, and in-code at `credential-fields.tsx:188-196` (inert `<span>` + `title` + sr-only " — not available"). **Only the formal operator ruling is missing.** Recommended: Auth 04 does **not** become a 37th screen — it has no node ID (one may not be invented), password recovery is a Supabase Auth flow expressly outside Figma's authority, and changing the ratified count of 36 requires an amendment |
| **OD-2** | Do three separately-frozen, separately-SHA'd login references discharge against **one route captured at three `?role=` URL states**? | AUTH-01/02/03 | The *route* question is already ruled — one shell is permitted. This is the *visual-acceptance* question only |
| **OD-3** | Is `/trainer/reports/[reportId]/edit` a canonical sub-route of ID 10, or does it take its own inventory ID once a frame exists? | 10 | Recorded and deliberately unresolved at F16 |
| ~~**OD-4**~~ ✅ **OD-4 — RULED 2026-08-07** | ~~**Panel headings.** Adopt the frames' *Overview / Strengths / Areas to Grow / Remarks*, or keep the governed *Today's Strength / Next Focus / Practice Suggestion / Session Takeaway* (spec §8)?~~ **RATIFIED BY OPERATOR: Overview · Strengths · Areas for Development · Remarks.** ⚠️ **Correction — this row previously read *"Areas to Grow"*, which is the MINORITY variant.** The `reference` tree is internally inconsistent: *Areas for Development* in `Parent - Class Report.md:11` and `Trainer - Student Report.md:12`; *Areas to Grow* in `Management - Student Report.md:11`, `Trainer - AI Report Generation.md:14` and `Management - Term Report.md:11`. **The ratified label is `Areas for Development`.** | **08, 10, 19** | ~~**Raised three times and still unanswered.** These are not a rename — "Overview" and "Remarks" have no governed counterpart. Adopting the frame would silently redefine what each **stored** field means to a parent~~ ⚠️ **That objection was correct and is DISCHARGED, not overruled.** The operator did not rename four fields — the operator **defined four new semantic concepts explicitly** and superseded the old model, so nothing is silent. This row itself held that adopting the frame *"would be an amendment, not an adjudication"*; an **explicit operator ruling is that instrument**. It was ruled **inside the time-box, while `report_versions` was still empty**. The implementation still carries the superseded names: that is a **registered Phase B semantic migration**, not a contradiction. See `FINAL_MVP_OD4_REPORT_SEMANTICS_RULING.md` and Authority Lock §15.1 |
| **OD-5** | Visual disposition for `/management/reports/[reportId]/edit` — the wording-only editor — which has **no Figma frame of any kind**. | 19, and the MVP's central control | One of eight blocked design families. `GLOBAL_UI_RULES` §8 forbids fabricating one |
| **OD-6** | Disposition for the academy raster wordmark on all three login frames — `PORT` / `REFERENCE ONLY` / `REBUILD` / `REJECT`. | AUTH-01/02/03 | §8 forbids both copying it and re-drawing it, so **both available workarounds are prohibited** until this is ruled |

**Eight blocked design families** have no Figma frame and none may be invented (`CLAUDE.md` §12, A-022.2): management review queue · management final review · wording-only editor · return-to-trainer dialog · correction tracking · final Approve & Submit · staff notification surface · parent notification surface. **Six of these are exercised by the physical-test walkthrough** — i.e. the entire management half of the story a demo must tell has no designed visual authority.

---

## 7. Live defects on core-slice screens — fix before final regression

| ID | Screen | Defect | Severity |
|---|---|---|---|
| **C2C-007** | 09 | **`/trainer/reports` is dead on its canonical route.** `returned-reports-queue.tsx:36-38` returns the unavailable panel unless `?status=needs_edit` is present. The canonical/alias relationship recorded in `09/screen.md` is **inverted**, and no in-app control links to the bare route. The Management equivalent does this correctly (`searchParams.get("status") ?? "trainer_approved"`) | **HIGH** |
| **C2C-006** | 08 | Refusal branch does not distinguish `stale_state`; a stale-state refusal renders copy claiming the draft was rejected safely and the report stayed at Observation Saved | **HIGH** — on the screen whose whole purpose is proving refusals are honest |
| **C2C-015** | 05 | Schedule opens on the earliest assigned session, not today — a demo lands on a past month. Flow order 2 | **MEDIUM** |
| **C2C-025** | 33 | Malformed route params render a visibly different panel than valid-but-unreachable, defeating the required three-way denial byte-identity | **MEDIUM** |
| **C2C-027** | 33 | No Back-to-Reports affordance in the success state | **LOW** |
| **C2C-020** | **05, 09, 29, 30, 32** | `?preview=` branches ungated in a participant build — **six branches across five live components**: `trainer-schedule.tsx:154`, `returned-reports-queue.tsx:42`, `management-reports-queue.tsx:140`, `parent-dashboard.tsx:62`, `parent-reports-list.tsx:69` (plus the orphaned `trainer-dashboard.tsx:55`). Wider than an earlier draft of this plan stated; §2's entries for 05 and 29 should be read with this addition | **LOW** |

**C2C-007 is not excused by screen 09's deferred status** — the canonical route exists and is broken today. Its fix shape needs operator approval (whether the Trainer report list becomes one destination with internal filters, mirroring R-C2-3 for Management).

---

## 8. Deferred screens — 24 (3 MAJOR + 21 MISSING)

> ⚠️ **SCOPE CORRECTION — these 24 screens ARE required for the final MVP.** Amendment 005 **A-044** verbatim: *"The **other 24 portal screens** are **`Post-48-hour final-MVP scope`** — **required for the final MVP, not required before the physical test**."* Its binding consequence — *"No active document may state or imply that all 36 screens are required **before the physical test**"* — is scoped to the physical test and defers nothing from final submission.
>
> **Deferral of the physical test is not deferral of the final MVP.** An earlier draft of this plan applied the physical-test rule to final submission; that was a misreading and is corrected here. Narrowing final-MVP scope to the 12 core screens would require an **amendment**, not a plan author's decision (`CLAUDE.md` §12: adding, removing or renumbering a screen in the ratified inventory is a stop-and-ask). A-044 also states **"Deferral deletes no safeguard"** — every privacy, approval, audit, evidence and PDPA control applies in full whenever a deferred screen is implemented.

### 8.1 MAJOR RECONCILIATION — 3

| ID | Screen | Current | Why MAJOR |
|---|---|---|---|
| **09** | Trainer Reports | `/trainer/reports` exists but serves only the returned-correction queue and **refuses the bare canonical route** | Canonical route exists and is broken (C2C-007); screen content is a different screen from the frame |
| **11** | Management Dashboard | `/management` renders a heading + one banner + two `QueueCard` counters; canonical `/management/dashboard` absent | Frame draws four KPI tiles, an 8-row approval list, a calendar and an events list — none with a delivered projection; **plus GC-6** |
| **30** | Parent Dashboard | `/parent` is a generic "Family reports" availability card; canonical `/parent/dashboard` absent | Frame bears almost no relation to the implementation; **plus GC-3 — now elevated to operator ruling Q-27: the complete "This Term's Skills" card is `DO_NOT_IMPLEMENT` and its absence is EXPECTED, not a gap.** Reconciliation for this screen targets the frame **minus that card**, with Profile Details promoted upward |

### 8.2 MISSING — 21, with their blockers

| Blocker class | Screens |
|---|---|
| **Backend projection missing** (no governed read path) | 02, 04 (trainer-scoped class/student), 12, 13, 17, 18, 23, 25 (management lists/profiles/calendar), 15, 16 (statistics), 31 (parent calendar) |
| **Write path missing** | 20, 21, 22, 24, 26, 27 |
| **Governance missing — no schema, no enum, no RPC, no ratified rule** | **03, 14** (lesson plans — *"Do not create a lesson-plan table, column, enum or RPC. Do not infer a lesson-plan schema from the frame (A-022)."*) |
| **Field inventory unresolved** | 20, 21, 24, 26 |
| **Explicitly out of MVP scope** | **28** (Management Term Report — generation is not built; separately governed; the frame additionally renders the wrong instrument's vocabulary) |
| **Deferred; component retained but unrouted** | 01 — `/trainer` is a **bare `redirect("/trainer/schedule")` rendering no markup** (its own header calls it a "COMPATIBILITY REDIRECT"). `features/trainer/trainer-dashboard.tsx` still exists but **is imported by no route**. This is why 01 is MISSING while 11 and 30 are MAJOR: `/management` and `/parent` genuinely render a dashboard component; `/trainer` renders nothing |

**03 is the one screen where "not built" is the only correct state.** Its downstream shadow is already handled correctly: `trainer-roster.tsx` renders "View lesson plan" disabled with the reason *"No governed lesson-plan or session-material record exists."*

~~**Ten of the 21 have no frozen reference and no backend**, so they are blocked twice over. Any future reconstruction of them currently has no frozen, hash-recorded baseline to be held to — freezing references for the deferred set is itself a prerequisite work item.~~ ✅ **CORRECTED 2026-08-08:** they have **no pack-local duplicate**, not "no frozen reference" — every one has a ratified frame in `/reference/`, so **they are blocked once (backend), not twice**, and "freezing references for the deferred set" is **not** a prerequisite work item. A pack-local duplicate is optional integrity evidence, never a precondition for implementation.

---

## 9. Dependency-aware reconciliation order

**Phase R0 — unblock decisions (no code).** Rule OD-1 … OD-6. ~~Nothing in R2 can close without OD-4 and OD-6.~~ ✅ **OD-4 is RULED (2026-08-07)**; R2's remaining decision gate is **OD-6**. ⚠️ **But R2 has not become cheaper:** OD-4's ruling converts screens 08/10/19 from a bounded visual correction into a **semantic migration** spanning storage, both hash serializers, 8 RPCs, generated types, the AI schema and prompt, grounding, fixtures and the C3/G-6 + C4 harnesses — see `FINAL_MVP_OD4_REPORT_SEMANTICS_RULING.md` §4–§5. ~~Record all fourteen GC conflicts in the affected packs' `implementation-notes.md` — **this is the highest-leverage, lowest-cost action in this plan**, because packs 30 and 31 currently carry *no* recorded conflict, so nothing stops a future agent from building GC-2 and GC-3 as drawn.~~ ✅ **DONE — CLOSED 2026-08-08.** GC-1…GC-14 were recorded into the affected packs under operator ruling **Q-24** (Phase A2), and **packs 30 and 31 now both carry their conflict**: `30-parent-dashboard/implementation-notes.md` records **GC-3**, `31-parent-calendar/implementation-notes.md` records **GC-2**. Pack 30's was subsequently **elevated to operator ruling Q-27**, which rules the complete "This Term's Skills" card `DO_NOT_IMPLEMENT` (Authority Lock §15.2). **The gap this sentence described is closed; it is retained struck-through as the record of why the work was prioritized, not as an open action.**

**Phase R1 — live defects (code, bounded).** C2C-007 → C2C-006 → C2C-015 → C2C-025 → C2C-027 → C2C-020. Independent of each other; C2C-007 and C2C-006 are the two that would be visible in a demo.

**Phase R2 — shared states (code).** **First assess S-23/S-24/S-25** (validation, success, disabled) — they are mandated by `GLOBAL_UI_RULES.md` and every core `screen.md` §10 but were not enumerated in this plan's first draft, so R2 cannot be planned against §4 until they are. Then S-1 … S-4 (route boundaries, governed non-disclosing copy, preserving SEC-11), then S-16, S-20, S-11, S-18, S-19, S-13, S-17 (with S-14/S-15 folded into S-17's C2C-020 fix).

**Phase R3 — core-slice visual reconciliation (code + evidence).** Per screen: apply the bounded corrections in §2, capture `implementation-before/after.png` at the frozen native dimensions, re-verify each reference SHA-256 unchanged, then submit for operator acceptance. Order by flow: AUTH-01 → 05 → 06 → 07 → 08 → 10 → AUTH-02 → 29 → 19 → AUTH-03 → 32 → 33.

**Phase R4 — route canonicalisation (separately authorized).** Execute §3 for 06, 07, 08, 10, 19, 33 with pinned paths preserved as redirects; add the three deferred dashboard redirects. **Must not run before R3 acceptance** — moving a route invalidates captured evidence.

**Phase R5 — the 24 deferred screens (REQUIRED for the final MVP under A-044).** Per screen, in dependency order: **freeze a reference** (none of the 24 has one) → resolve its blocker (backend projection · write path · absent governance · unresolved field inventory) → implement → accept. **This phase is in scope, not out of it** — see the §8 scope correction. What *would* require an explicit ruling is the opposite move: **narrowing** final-MVP scope below the ratified 36, which needs an amendment. Note 03 and 14 are hard-blocked on absent governance (no lesson-plan schema, enum, RPC or rule exists — do not infer one from a frame), 28 is separately governed and out of MVP scope, and U-25's eight design families have no frame and none may be invented.

### 9.1 Acceptance gate per phase

| Phase | Gate |
|---|---|
| R0 | ~~All six ODs ruled in writing; all fourteen GCs recorded in the packs~~ **✅ SATISFIED 2026-08-08 (Phase A2, S-51).** All six ODs are ruled in writing — OD-4 on 2026-08-07, the remaining five on 2026-08-08 (Q-4, Q-20, Q-21, Q-22, Q-23). GC recording completed under Q-24 |
| R1 | Each defect has a failing-then-passing assertion; route census unchanged |
| R2 | Every mandated state has a route-level boundary; no thrown message interpolated; SEC-11 still passes |
| R3 | Per screen: before/after PNG at native dimensions, reference SHA unchanged, the screen's §2 acceptance assertions green, operator acceptance recorded |
| R4 | Canonical route resolves; pinned path 307s; route census updated; no evidence invalidated |
| R5 | Per screen: a **frozen, SHA-pinned reference** exists; its blocker (projection / write path / governance / field inventory) is resolved or the screen is ruled descoped by amendment; operator acceptance recorded. **No frame, node ID or field may be invented for any of U-25's eight unframed families** |

---

## 10. What this plan does not do

- It does **not** redesign beyond the final screen pack.
- It does **not** add, remove or renumber a screen in the ratified 36-screen inventory.
- It does **not** change the twelve-screen core slice.
- ~~It does **not** resolve any of the six open operator decisions or fourteen governance conflicts.~~ **✅ UPDATED 2026-08-08 (Phase A2, S-50).** **All six ODs are now ruled.** OD-4 was ratified 2026-08-07 (`FINAL_MVP_OD4_REPORT_SEMANTICS_RULING.md`); **OD-1, OD-2, OD-3, OD-5 and OD-6 were ruled by the operator on 2026-08-08** as Q-4, Q-22, Q-23, Q-20 and Q-21 respectively — see §6 rows. **The fourteen GC conflicts are being recorded into the affected packs' `implementation-notes.md` under operator ruling Q-24.**
- It does **not** authorize any checkpoint, route move, migration, or implementation.
- It created, moved, deleted and restyled **no** application code, route, component or reference asset.

---

*Produced at the Final MVP Submission Readiness Audit, 2026-08-07, against main HEAD `139d753` with a clean working tree. No Supabase, Docker, migration, fixture, build, server or external provider was run. No hosted environment was provisioned. Nothing was pushed.*
