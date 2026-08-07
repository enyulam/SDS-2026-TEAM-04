# Frontend Reconstruction Plan — Final MVP UI Reference Pack

**The operational plan for screen-by-screen frontend reconstruction against the twelve frozen core references.**

Created at **Frontend Reconstruction Planning Checkpoint F0**, 2026-08-06 (Asia/Singapore). This checkpoint changed **no application code, no route, no repository file and no screenshot**.

| Companion file | Purpose |
|---|---|
| `FRONTEND_RECONSTRUCTION_TRACKER.md` | The per-checkpoint status table — F0 … F17 |
| `FRONTEND_STEP_REPORT_TEMPLATE.md` | The mandatory 20-part report every future checkpoint must produce |
| `IMPLEMENTATION_WORKFLOW.md` | The general fifteen-step per-screen workflow this plan operationalizes |
| `GLOBAL_UI_RULES.md` | Source precedence, shared shell rules, accessibility, ratified vocabulary |
| `CORE_SCREENSHOT_VALIDATION_REPORT.md` | Proof the twelve frozen references are dependable targets |

---

## 0. What this plan is, and what it is not

**It is** an ordered, dependency-gated, operator-reviewable sequence of bounded implementation checkpoints, each ending in one commit and a stop.

**It is not** an implementation authorization. **F0 authorizes nothing but itself.** Every checkpoint F1 … F17 requires its own operator prompt. Creating a row in the tracker grants no permission to write code.

**It creates no route, no component, no permission and no backend behaviour.** Where this plan names a route treatment, it is **recording** a treatment already ratified in `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` §7, or **flagging** one that remains an operator decision. Executing any treatment requires its own authorization (Amendment 005, `CLAUDE.md` §12).

### 0.1 Naming collision — read this before using any "F" number

The frontend workstream log `docs/workstreams/48H_FRONTEND_PROGRESS.md` **already uses `Round F1` and `Round F2`** for the two completed fixture-backed delivery rounds. Those are **not** the checkpoints in this plan.

| Term | Meaning |
|---|---|
| `Round F1`, `Round F2` | **Historical.** The completed 48-hour fixture-backed frontend delivery rounds, already logged and accepted-pending-review. |
| `FRONTEND RECONSTRUCTION F1` … `F17` | **This plan.** Visual reconstruction checkpoints against the frozen references. |

**Always write the reconstruction checkpoints in full** — `FRONTEND RECONSTRUCTION F4`, never a bare `F4` — in commit messages, workstream-log entries and reports. A bare `F1` in the workstream log will be read as the historical delivery round.

---

## 1. Baseline verified at F0

| Repository | Path | Branch | HEAD | Working tree |
|---|---|---|---|---|
| Main MVP | `SDS Project Final (BEST Coach)` | `main` | `7c0a3591c2e4ffcea05161caf536921696b31fff` | clean |
| Backend worktree | `worktrees\backend-48h` | `feat/48h-backend` | `4b58c6b06700ecdc8591e3cce7b0c55d48c55ac8` | clean |
| **Frontend worktree** | `worktrees\frontend-48h` | `feat/48h-frontend` | **`b60b44d31f55ac9c1c03301511b63748ed1399d7`** | clean |
| Frozen demo | `SDS Project Sprint 2` | `main` | `8d4acf4abc5039c24da01be773ab1a5e4916080f` | clean; tag `demo-freeze-step14-2026-07-21` intact |

**`b60b44d31f55ac9c1c03301511b63748ed1399d7` is the starting frontend commit for F1.** Every later checkpoint starts from the commit its predecessor created — recorded in the tracker, never assumed.

**Pack integrity:** outside every repository and worktree (`git rev-parse` → *not a git repository*); 36 screen folders; 36 `screen.md`; 36 `implementation-notes.md`; **exactly 12 `reference.png`**; all 12 `PASS WITH NOTE — READY`; 0 failed; 0 missing; `CORE_SCREENSHOT_VALIDATION_REPORT.md` present.

---

## 2. Governing sources

**Visual authority, highest first (Amendment 005 A-045):**

1. the frozen `reference.png` in this pack;
2. node-specific Figma context;
3. the existing frontend implementation.

**Functional, security and privacy authority, highest first:**

1. Specification v3 and Amendments 001–006;
2. `CLAUDE.md`;
3. the lifecycle and authorization baselines (Step 7F / 7H / 7I);
4. the ratified implementation contract `docs/plan/PHYSICAL_TEST_SLICE_48H.md`;
5. Figma.

**Figma never bypasses governance. Screen presence is not authorization.** Where a frame and a ratified rule disagree, **the rule wins and the discrepancy is recorded** — never silently resolved.

Read at F0: `CLAUDE.md`; Amendments 004, 005, 006; `FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md`; `PHYSICAL_TEST_SLICE_48H.md`; `COMPETENCY_VOCABULARY_RECONCILIATION_PLAN.md`; `FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md`; the frontend workstream log; current frontend routes, components, contracts, fixtures and tests; and every pack file listed in §0.

---

## 3. Reconstruction strategy

### 3.1 The per-checkpoint approach

```
frozen Figma-derived reference.png
  -> audit the existing frontend route and behaviour
    -> preserve valid contracts, state and lifecycle handling
      -> rebuild or replace presentation where necessary
        -> create missing frontend architecture where authorized
          -> record missing backend or governance requirements
            -> validate against the screenshot
              -> commit one bounded checkpoint
                -> stop and report for operator review
```

### 3.2 The honest position on the current frontend

The frontend delivered by Rounds F1–F2 is:

- **functionally useful** — a complete fixture-backed three-role lifecycle exists;
- **visually provisional** — built before any frozen reference existed;
- **not visually accepted merely because routes exist.** Visual acceptance is `Not started` for all 36 screens, and a route existing is not visual alignment.

**Do not constrain the reconstruction to the current component structure where that structure is materially missing the Figma design.** The current shell is a dark-navy portal built without the references; several frozen frames show a light portal shell with a left navigation rail, a header search/notification/identity strip and card surfaces. Where the delivered structure cannot express the frozen frame, **replace it** — and record what was replaced and why.

### 3.3 What agents may create or replace

Frontend-owned only: components · layouts · visual tokens · typed frontend DTOs · fixture projections · client-side state · route presentation · **route redirects and aliases where already ratified** · frontend tests.

### 3.4 What agents must never invent

Backend actions · permissions · lifecycle transitions · database fields · database mutations · Parent access to unpublished content · Management access to protected assessment substance · AI publication or approval powers.

A missing read path, write path, projection, RPC, field inventory or ratified rule is recorded as a **dependency** in `implementation-notes.md` and `screen.md` §7. **It is never invented, stubbed as if real, faked client-side or inferred from a frame.** A blocked screen reported honestly is fine.

---

## 4. Standing governance constraints on every checkpoint

These are restated, not created. They bind every checkpoint below.

| Constraint | Source |
|---|---|
| Role-query selection is **presentation-only** and carries no authority. Authority requires a real Supabase Auth identity and live membership. | A-046 |
| A login screen must not imply choosing a role grants it, must not expose whether an unrelated account exists, and must not reveal internal authorization detail in errors. | A-046 |
| Trainer **approves and never publishes**. Management's **Approve & Submit is the only action that makes a report parent-visible**. | A-033 |
| Management may edit **parent-facing wording only** and must never modify ratings, observations, attendance, evidence, trainer notes or any assessment substance. Substantive concerns are a **return to Trainer**. | A-034, A-035 |
| Parent access is **submitted-canonical and view-only**, limited to linked children — unchanged and absolute. | A-021, A-048 |
| **No per-dimension rating grid on any Parent surface, in any form or wording.** | `CLAUDE.md` §6 |
| **Never return a report content hash to a Parent or to Management.** | A-038 |
| **AI never publishes, approves or submits.** | `CLAUDE.md` §0 |
| All **nine dimensions are mandatory**; no Quick mode, no four-dimension path. | A-017 |
| Class Grade remains `Beginner` / `Intermediate` / `Advanced` and is **not** the rating vocabulary. **Global keyword replacement is prohibited.** | A-054 |
| Eight authorized `report_status` values; no UI-convenience status may be added. | A-036 |

---

## 5. Ordered reconstruction checkpoints

Eighteen checkpoints, **F0 … F17**. Fourteen are visual screen checkpoints; four are foundations, dependencies or integration.

### F0 — Planning and baseline

**This checkpoint only. No application code.** Verify the baseline and pack; read the governing sources; audit for an existing operational plan; create or reconcile the plan, tracker and report template; append one change-log entry; validate; report and stop.

**Ends:** awaiting operator acceptance. **No screen is claimed accepted.**

---

### F1 — Shared visual foundation

**Not a screen. This checkpoint must not claim any screen visually accepted.**

**Scope:** global design tokens · typography scale · page background · card surfaces · buttons · fields · badges and pills · icon treatment · role-shell primitives (left navigation rail, header strip, identity chip, breadcrumb) · responsive desktop layout foundation.

**Derived from** the frozen references as a set — the twelve frames share one shell language — **never from generated Figma export CSS** (Amendment 002 A-023; `CLAUDE.md` §2).

**Acceptance:** tokens and primitives exist, are used by at least one rendered surface, satisfy WCAG 2.2 AA contrast, and typecheck / lint / build cleanly. **Visual acceptance for every screen remains `Not started`.**

**Combination:** may be implemented together with F2 **only if a future operator prompt explicitly permits that bounded combination**.

---

### F2 — Shared authentication shell

Build the shared structural implementation used by the three frozen login frames. The three login frames are **distinct nodes and three separately frozen references** (A-046), whatever implementation they share.

**Current route:** `/login` exists — `app/(auth)/login/page.tsx`, presentation in `features/auth/login-presentation.tsx`. Canonical routes `/login?role=trainer|management|parent` are **already satisfied** with no mismatch (inventory §7.2).

**Do not claim any login screen accepted until its own checkpoint passes.**

**Combination:** may be combined with F1, or with F3, **only where a future operator prompt explicitly permits it**.

---

### F3 — AUTH-01 Trainer Login

| Field | Value |
|---|---|
| Screen | `AUTH-01` · Trainer Login · role Trainer · flow order 1 |
| Route | `/login?role=trainer` — canonical, already satisfied |
| Figma node | `546:370` |
| Reference | `AUTH-01-trainer-login/reference.png` · 1440 × 1024 · 95,496 B |
| SHA-256 | `b1ad24e4f414ece90d7a1b091e516a44163f28856e7898a60db288f487a56da1` |
| Expected physical-test destination | `/trainer/schedule` — see the F4 route decision below |

**Authority remains server-derived.** The role query selects presentation only.

---

### F4 — 05 Trainer Schedule

| Field | Value |
|---|---|
| Screen | `05` · Trainer Schedule · role Trainer · flow order 2 |
| Canonical route | `/trainer/schedule` |
| Figma node | `591:9` |
| Reference | `05-trainer-schedule/reference.png` · 1675 × 1155 · 90,168 B |
| SHA-256 | `d2d58b16b1ee2d68123ae87f58bc3aa2e586d2a1df925a84d231990564ff2ceb` |

#### This route is not currently implemented

**`/trainer/schedule` does not exist.** Session selection is currently folded into the Trainer landing surface at `/trainer` (`app/(portals)/trainer/page.tsx`). The ratified inventory classifies this as a **coverage gap, not a route mismatch** (§7.3), and calls it *"the single most consequential finding of this reconciliation for the physical test."*

#### Recommended route treatment

1. **Create the canonical `/trainer/schedule` route.**
2. **Preserve the current Trainer entry route** `/trainer` as a compatibility redirect or alias where required.
3. **Do not delete a working route silently.**

#### > **F4 requires operator confirmation before any code begins.**

The instruction to mark this as operator-confirmed **unless Amendment 005 or the canonical inventory already authorizes it unambiguously** resolves as follows, and the finding is **negative**:

- inventory §7.3 records the treatment as **`Operator decision required`** and states plainly *"This checkpoint records the decision; it does not make it"*;
- it offers **two defensible options** — accept the fold at `/trainer`, or build `/trainer/schedule` before the test — and **chooses neither**;
- Amendment 005 A-042 ratifies `/trainer/schedule` as the **final-MVP canonical target** but explicitly preserves the contract's pinned routes **for the physical test**, and states **"No route is created by this amendment"**;
- `CLAUDE.md` §1 carries the same open decision as **U-A5-1**;
- §8.2 additionally records the **Trainer schedule/date projection** as a **missing backend path** for screen 05 — so option 2 requires backend work as well as frontend work.

**Therefore: no unambiguous authorization exists. F4 is gated on an explicit operator decision** naming which option is taken. Record the decision in `CHANGE_LOG.md` and in `screen.md` §1 before F4 code begins.

---

### F5 — 06 Trainer Student Roster

| Field | Value |
|---|---|
| Screen | `06` · Trainer Student Roster · role Trainer · flow order 3 |
| Canonical route | `/trainer/schedule/[sessionId]/student-roster` |
| Implemented route | `/trainer/sessions/[sessionId]/roster` |
| Ratified treatment | **Replace after integration; preserve the pinned path as a redirect** (inventory §7.2) |
| Figma node | `487:9` |
| Reference | `06-trainer-student-roster/reference.png` · 1440 × 1120 · 119,195 B |
| SHA-256 | `78e4b618ed154ced8be68f8997903a8fd30e2f99f962ae08a01345e67e13659a` |

**Preserve server-governed session, enrolment, attendance and eligibility rules.** Attendance is `Present` by default with a Trainer `Absent` toggle, unique per (session, student); **an absent student never gets a fabricated assessment or report** (A-018, A-026, A-028).

---

### F6 — Frontend Vocabulary V3

**A cross-screen dependency checkpoint, not a visual screen. It claims no screen accepted.**

Implement Amendment 006 in the frontend **before any rating-bearing screen is accepted**:

| Item | Requirement |
|---|---|
| Rating union | `RATING_LEVELS` / `RatingLevel` → `beginning` · `developing` · `mastering` · `mastered` |
| Anchors | Re-keyed **positionally**, text **byte-identical** to the backend copy (A-050) |
| Polarity | `beginning`→`needs_support` · `developing`→`developing` · `mastering`→`positive` · `mastered`→`positive` (A-051) |
| Fixture values | The nine-dimension rating sets |
| Assessment labels | Rating label map and chip control |
| Help text | The instruction naming the four selectable levels — rewritten as prose |
| Review labels | Rating label map on the Trainer review surface |
| Grounding-rejection prose | Rewritten as a sentence, **not** by string substitution |
| Browser assertions | Visible-label assertions in both smoke suites |

**Current state:** `lib/frontend/contracts/physical-test.ts` still declares `emerging` · `developing` · `secure` · `advanced`. This is the expected pre-V3 state and **must not be "fixed" without the V3 authorization** (`CLAUDE.md` §12).

**Do not alter Class Grade.** `Beginner` / `Intermediate` / `Advanced` and every `classGrade` union and fixture value stay **byte-unchanged** (A-054). **Global keyword replacement is prohibited.** The four-step colour ramp transfers by **key rename only** — level 1 red, 2 amber, 3 teal, 4 green — with WCAG 2.2 AA contrast re-verified.

**Owned paths** are exactly those in `COMPETENCY_VOCABULARY_RECONCILIATION_PLAN.md` §2.1. No backend path, no migration, no `class_grade_code` artefact, no `docs/spec/` instrument.

**Dependency gate:** F6 depends on the separately authorized **Backend V2** migration being complete — **or** on an explicit operator decision permitting coordinated parallel preparation with the rating union pinned.

---

### F7 — 07 Trainer Grade Student

| Field | Value |
|---|---|
| Screen | `07` · Trainer Grade Student · role Trainer · flow order 4 |
| Canonical route | `/trainer/schedule/[sessionId]/student-roster/[studentId]/grade-student` |
| Implemented route | `/trainer/sessions/[sessionId]/students/[studentId]/assess` |
| Ratified treatment | **Replace after integration; pinned path preserved as a redirect** |
| Figma node | `784:679` |
| Reference | `07-trainer-grade-student/reference.png` · 1650 × 1200 · 131,418 B |
| SHA-256 | `1df95a5bacae3c07bf3f0dfd0940f2dcf6637b2e539634baab5498588d13199d` |

**Requires F6 complete.** Must show **all nine governed dimensions** and the **Amendment 006 rating vocabulary**. The frozen frame already reads *Beginning / Developing / Mastering / Mastered*, consistent with A-049 — accepting this screen against pre-V3 labels would contradict the reference **and** the amendment.

Each rating carries its behavioural anchor; the all-nine completion gate is validated **server-side**, not only in the form.

---

### F8 — 08 Trainer AI Report Generation

| Field | Value |
|---|---|
| Screen | `08` · Trainer AI Report Generation · role Trainer · flow order 5 |
| Canonical route | `/trainer/schedule/[sessionId]/student-roster/[studentId]/grade-student/ai-report-generation` |
| Implemented route | `/trainer/reports/[reportId]/generate` |
| Ratified treatment | **Replace after integration; pinned path preserved as a redirect.** The canonical route is keyed on `(sessionId, studentId)` and the implemented route on `reportId`; the move needs a **server-side resolution the trainer projections already perform** |
| Figma node | `784:340` |
| Reference | `08-trainer-ai-report-generation/reference.png` · 1650 × 1180 · 172,209 B |
| SHA-256 | `3160524f41fc84cd20e7f5bf8f2b9e6a1215354c17faf5b3b31644d54eae20c4` |

**AI cannot approve, submit or publish.** Grounding validation must be able to **reject** a draft; loading, safe-failure and bounded-retry states are designed experiences, not generic error toasts.

---

### F9 — 10 Trainer Student Report

| Field | Value |
|---|---|
| Screen | `10` · Trainer Student Report · role Trainer · flow order 6 |
| Canonical route | `/trainer/reports/[reportId]` |
| Implemented routes | `/trainer/reports/[reportId]/review` (+ `/edit`) |
| Ratified treatment | **Add the canonical index route**; `/review` and `/edit` remain as governed sub-surfaces |
| Figma node | `664:9` |
| Reference | `10-trainer-student-report/reference.png` · 1440 × 1351 · 285,426 B |
| SHA-256 | `e64291dc80a2af7378635a3daffe63952899768c41493e8a185da12119b4f730` |

**Preserve:** Trainer editing · the exact three-item quality checklist · Trainer approval · **no publication by Trainer** · returned-report correction and reapproval where applicable.

The Approve control renders **visually disabled** until all three checklist items are checked, and the server independently re-verifies all three **for the exact version being approved**. The confirmation copy must **not** claim the parent will be notified. A returned report is corrected through a **new immutable version**; a silent byte-identical save is rejected server-side.

`/trainer/reports/[reportId]/edit` carries an **open route decision** (inventory §7.4) — whether it becomes a canonical sub-route of ID 10 or receives its own ID once a frame exists. **Do not resolve it here.**

---

### F10 — AUTH-02 Management Login

| Field | Value |
|---|---|
| Screen | `AUTH-02` · Management Login · role Management · flow order 7 |
| Route | `/login?role=management` — canonical, already satisfied |
| Figma node | `459:13` |
| Reference | `AUTH-02-management-login/reference.png` · 1440 × 1024 · 95,584 B |
| SHA-256 | `fcc3db9377a1b1175984bc90732c588e58bd05269d767af2ee69ed8d42668483` |
| Expected physical-test destination | `/management/reports` |

**Authority remains server-derived.**

---

### F11 — 29 Management Reports

| Field | Value |
|---|---|
| Screen | `29` · Management Reports · role Management · flow order 8 |
| Route | `/management/reports` — canonical, already satisfied, no mismatch |
| Figma node | `527:170` |
| Reference | `29-management-reports/reference.png` · 1440 × 1160 · 98,030 B |
| SHA-256 | `eddda3b14c7e34747b237545116a6fb91e356ec3c9155fc7f8f28e00bae54c19` |

**Must support:** pending Management review · correction tracking · `trainer_approved` · `needs_edit` · **`draft_ready` correction-tracking state where returned work has been corrected but not reapproved**.

#### Required frontend status-union widening

`ManagementQueueRowDto.status` in `lib/frontend/contracts/physical-test.ts` is currently:

```ts
readonly status: "trainer_approved" | "needs_edit";
```

It must widen to:

```ts
readonly status: "trainer_approved" | "needs_edit" | "draft_ready";
```

**This is a frontend DTO widening only.** It adds **no** status to the ratified eight (`draft_ready` is already one of them, A-036), creates no lifecycle transition, and **must not** be read as authorizing Management to see `draft_ready` **content**.

> **Privacy boundary — do not cross it.** A `draft_ready` row here is **correction-tracking metadata only**: that a returned report has been corrected but not yet reapproved. Management reads report **content** for exactly two statuses — the final-review candidate at `trainer_approved`, and the canonical submitted version (A-038). A `draft_ready` row **exposes no report content**, no draft text, no internal trainer note, no raw rating and no content hash. `CLAUDE.md` §6 requires the row action for pre-approval statuses to be **"Send Reminder to Trainer"**, never a view-content control, and requires each such handler to check status **independently** — never one generic shared "view report" handler.

Existing query aliases `?status=trainer_approved` and `?status=needs_edit` are **preserved as compatibility aliases** (inventory §7.4) — query variants of ID 29, not separate routes.

---

### F12 — 19 Management Student Report

| Field | Value |
|---|---|
| Screen | `19` · Management Student Report · role Management · flow order 9 |
| Canonical route | `/management/students/[studentId]/reports/[reportId]` |
| Implemented routes | `/management/reports/[reportId]/review` (+ `/edit`) |
| Ratified treatment | **Replace after integration; pinned paths preserved as redirects.** The canonical route adds a `[studentId]` segment the implemented route resolves server-side |
| Figma node | `648:330` |
| Reference | `19-management-student-report/reference.png` · 1440 × 1330 · 281,963 B |
| SHA-256 | `394d8475498602aee27675d8437ee9395316c45da986b5a8f4db46a9ef94e6f0` |

**Management may:** inspect permitted parent-facing content · edit **parent-facing wording only** · return substantive concerns to Trainer · perform the final **Approve & Submit**.

**Management must not modify assessment substance.** The server rejects any Management write outside the four parent-facing wording fields, **even when the call bypasses the UI entirely** — hiding a control is not authorization. The submitted version carries **exactly the same nine ratings** as its trainer-approved source. **No content hash is returned to Management.**

`/management/reports/[reportId]/review` currently carries **two governed surfaces** — final review and the ID 19 canonical submitted report — and `/management/reports/[reportId]/edit` has **no Figma frame** (blocked design family 3). Both are recorded `Operator decision required` in inventory §7.4. **Do not invent a frame, node or field for either.**

---

### F13 — AUTH-03 Parent Login

| Field | Value |
|---|---|
| Screen | `AUTH-03` · Parent Login · role Parent · flow order 10 |
| Route | `/login?role=parent` — canonical, already satisfied |
| Figma node | `546:413` |
| Reference | `AUTH-03-parent-login/reference.png` · 1440 × 1024 · 95,425 B |
| SHA-256 | `fcd4d4edcebadd20d6ebca43b181538631fe791fab06007a389120f56853b85c` |
| Expected physical-test destination | `/parent/reports` |

**Authority remains server-derived.**

---

### F14 — 32 Parent Reports

| Field | Value |
|---|---|
| Screen | `32` · Parent Reports · role Parent · flow order 11 |
| Route | `/parent/reports` — canonical, already satisfied, no mismatch |
| Figma node | `533:180` |
| Reference | `32-parent-reports/reference.png` · 1440 × 1120 · 73,658 B |
| SHA-256 | `90e368c17826bb114173ec5f40f9421eaa33d81aa2032bd0e8a97db01e370aea` |

**Show only canonical submitted reports for children linked to the authenticated Parent** — the version `latest_submitted_version_id` names, scoped by live `parent_student_links`. Child selection is limited to linked children. A non-linked or non-submitted item must produce a **non-disclosing** state that does not reveal whether the record exists.

---

### F15 — 33 Parent Class Report

| Field | Value |
|---|---|
| Screen | `33` · Parent Class Report · role Parent · flow order 12 |
| Canonical route | `/parent/reports/[reportId]` |
| Implemented route | `/parent/students/[studentId]/sessions/[sessionId]/report` |
| Ratified treatment | **Replace after integration; pinned path preserved as a redirect.** The implemented route matches the canonical read RPC's `(class_session_id, student_id)` key directly; the canonical route requires a `reportId` → pair resolution **server-side** |
| Figma node | `627:9` |
| Reference | `33-parent-class-report/reference.png` · 1440 × 1340 · 293,726 B |
| SHA-256 | `2aaeb446065f8360ed6b3804490c7843d96e1e5e534e754ed738c61dd6adea67` |

**View-only. Do not expose:** ratings · observations · attendance details · correction requests · hashes · version history · audit internals.

**No per-dimension rating grid in any form or wording** — the prose panels satisfy the "simplified performance summary" requirement; a softened restatement recreates the caught leak. **No content hash is ever returned to a Parent.**

---

### F16 — Real adapter and route integration

**Scope:** merge-compatible frontend adapter implementation · real session-backed reads and actions · canonical route redirects and compatibility aliases · loading, empty, denied and error states · status-union reconciliation · **no fixture-only behaviour in the integrated walkthrough**.

The current `PhysicalTestPort` fixture adapter visibly identifies fixture mode as ineligible for participant use. F16 replaces it behind the same typed port **without changing page components** — the sequencing already recorded as the next action in the frontend workstream log.

**Depends on Backend V2 and backend integration readiness.**

---

### F17 — Integrated three-role walkthrough

Run the complete physical-test flow:

```
Trainer login -> schedule -> roster -> assessment -> AI generation
  -> Trainer review and approval
    -> Management login -> Management queue -> Management review and submission
      -> Parent login -> submitted-report list -> canonical report view
```

**Verify privacy, authorization and visual acceptance** across all twelve core screens. **Depends on F16.**

---

## 6. Screen-by-screen rule

**F3–F5 and F7–F15 are individually reviewable checkpoints.**

**After each checkpoint, the implementation agent must stop. It must not begin the next screen automatically.**

A later operator prompt may combine **only**:

- **F1 with F2**;
- **F2 with F3**;
- **tightly coupled route redirects with their canonical screen**;
- **shared corrections that cannot be validated separately**.

**Any combined checkpoint must explain why the screens are technically coupled.** A combination for convenience, velocity or "we're already in the area" is not permitted.

---

## 7. Dependency gates

| Gate | Blocks | Cleared by |
|---|---|---|
| **F0 operator acceptance** | F1 … F17 | Operator accepting this plan |
| **F1 shared foundation** | F2 … F15 presentation work | F1 accepted |
| **F2 auth shell** | F3, F10, F13 | F2 accepted |
| **F4 route decision (U-A5-1)** | F4 | Explicit operator decision on inventory §7.3 |
| **Backend V2 (vocabulary migration)** | F6 | V2 complete **or** explicit operator authorization for coordinated parallel preparation with the union pinned |
| **F6 Frontend V3** | F7, F8, F9 | F6 accepted |
| **Backend V2 + Frontend V3 + core screens** | F16 | All three complete |
| **F16** | F17 | F16 accepted |
| **Trainer schedule/date projection** (missing backend path, inventory §8.2) | F4 under option 2 | Backend delivery |

---

## 8. Per-step implementation contract

**Every future implementation checkpoint must, in order:**

1. **verify the expected frontend branch and starting HEAD** — `feat/48h-frontend` at the commit the tracker records; stop on drift;
2. **verify the reference screenshot SHA-256 matches the validated pack** — the hash in §5 above and in `CORE_SCREENSHOT_VALIDATION_REPORT.md`; stop on mismatch;
3. **inspect the exact `screen.md`** — all twelve sections;
4. **inspect current route and components**;
5. **preserve governed functionality** — everything in `screen.md` §6 still works when the step is done;
6. **implement only the bounded checkpoint**;
7. **render at the reference viewport** — the native dimensions recorded for that screen;
8. **save implementation comparison images outside Git** unless otherwise authorized — synthetic data only;
9. **compare major structure, colour, typography, spacing and controls**;
10. **run required validation** — §9;
11. **update the relevant `implementation-notes.md`**;
12. **update `FRONTEND_RECONSTRUCTION_TRACKER.md`**;
13. **append the frontend workstream log** `docs/workstreams/48H_FRONTEND_PROGRESS.md`, using the full checkpoint name per §0.1;
14. **create one bounded frontend commit**;
15. **stop and report** using `FRONTEND_STEP_REPORT_TEMPLATE.md`.

**No future step may merge into `main` unless separately authorized.** No step commits, merges or rebases outside its own bounded frontend commit.

---

## 9. Validation matrix

Every screen checkpoint defines acceptance in four categories. **All four must pass before a screen is proposed as accepted; operator acceptance is still separate.**

### 9.1 Visual

- complete top-level shell — nothing cropped to an inner card;
- layout regions match the frozen frame;
- typography hierarchy;
- colour system;
- spacing;
- cards and controls;
- action prominence — the primary action reads as primary;
- responsive behaviour at the reference viewport and one narrower desktop breakpoint;
- **no old dark-theme residue unless present in the frozen reference.**

### 9.2 Functional

- route works;
- expected navigation works;
- existing lifecycle behaviour remains;
- fixture or adapter state is correct;
- **no unsupported action is invented**;
- **no dead primary control** — every primary control does something governed, or is legitimately disabled with a stated reason.

### 9.3 Security and privacy

- role-derived authorization — never a query parameter, never a JWT claim, never UI hiding;
- **non-disclosing denial** — a denial must not reveal whether the record exists;
- no prohibited fields;
- **Parent submitted-only**;
- **Management substance immutability**;
- **AI cannot publish.**

### 9.4 Technical

| Check | Command |
|---|---|
| TypeScript | `node_modules/.bin/tsc.cmd --noEmit` — exit 0 |
| ESLint | `node_modules/.bin/eslint.cmd .` — exit 0 |
| Production build | `npm.cmd run build` — exit 0 |
| Relevant automated assertions | `tests/frontend/fixture-contract.assertions.ts`, `tests/frontend/fixture-lifecycle.assertions.ts` |
| Browser smoke at the reference viewport | `node tests/frontend/trainer-browser-smoke.mjs`, `node tests/frontend/three-role-browser-smoke.mjs` |
| Uncaught browser errors | **zero** |

**No test-runner dependency exists and none may be added without operator approval** (`CLAUDE.md` §11). **`package.json` and `package-lock.json` are not modified by a reconstruction checkpoint.** No credential-bearing output is ever rendered, logged or reported.

---

## 10. Blocked-state handling

**A blocked checkpoint reported honestly is a good outcome. An invented field is a rebuild.**

Stop and report as blocked when:

- the starting HEAD or branch does not match the tracker;
- a reference screenshot SHA-256 does not match the validated pack;
- a required node-specific frame, asset, interaction state, responsive state or **visible field definition is missing**;
- the frame implies a backend action, permission, lifecycle transition, database field or mutation that is not ratified;
- the frame contradicts a ratified rule — record the discrepancy; **the rule wins**;
- a dependency gate in §7 is not cleared;
- a contrast pair fails and cannot be fixed without a token change;
- proceeding would require touching a Class Grade artefact, a backend path, a migration, `package.json` or `package-lock.json`.

**On block:** record the blocker in `implementation-notes.md`, in `screen.md` §7 and in the tracker; make **no** speculative change; leave the branch clean or commit only the bounded work that is genuinely complete; and end with the blocked phrase in §11.

**Do not start the next screen because the current one is blocked.** Record the blocker and stop for operator direction.

---

## 11. Report-back contract

Every future implementation checkpoint ends with the 20-part report in `FRONTEND_STEP_REPORT_TEMPLATE.md` and **exactly one** of:

```
FRONTEND RECONSTRUCTION <CHECKPOINT_ID> COMPLETE — READY FOR REVIEW
```

```
FRONTEND RECONSTRUCTION <CHECKPOINT_ID> BLOCKED — OPERATOR DECISION REQUIRED
```

**Use the real checkpoint ID** — `F3`, `F11`, and so on. Never the literal `<CHECKPOINT_ID>`.

**Neither phrase means accepted.** `COMPLETE — READY FOR REVIEW` means the agent has stopped and the work awaits operator review. **Only the operator marks a screen accepted**, and only then does `Visual acceptance status` change in `SCREEN_INDEX.md`.

---

## 12. Screen coverage check

All twelve core screens appear **exactly once**, in ratified flow order 1–12, with no deferred screen added to the 48-hour critical path.

| Flow | Screen | Checkpoint | Role | Rating-bearing |
|---:|---|---|---|---|
| 1 | `AUTH-01` Trainer Login | **F3** | Trainer | No |
| 2 | `05` Trainer Schedule | **F4** | Trainer | No |
| 3 | `06` Trainer Student Roster | **F5** | Trainer | No |
| 4 | `07` Trainer Grade Student | **F7** | Trainer | **Yes** |
| 5 | `08` Trainer AI Report Generation | **F8** | Trainer | **Yes** |
| 6 | `10` Trainer Student Report | **F9** | Trainer | **Yes** |
| 7 | `AUTH-02` Management Login | **F10** | Management | No |
| 8 | `29` Management Reports | **F11** | Management | No |
| 9 | `19` Management Student Report | **F12** | Management | **Yes** |
| 10 | `AUTH-03` Parent Login | **F13** | Parent | No |
| 11 | `32` Parent Reports | **F14** | Parent | No |
| 12 | `33` Parent Class Report | **F15** | Parent | No |

**F6 sits before F7, F8 and F9** — every rating-bearing checkpoint. Screen `19` (F12) is recorded rating-bearing in `SCREEN_INDEX.md`; it exposes **parent-facing wording only**, so it carries no rating surface to relabel, but it must not be accepted while the frontend still declares the superseded union. **F12 therefore also requires F6.**

The twenty-four deferred screens are **not** in this plan's critical path and none was added.

---

*Created at Frontend Reconstruction Planning Checkpoint F0, 2026-08-06 (Asia/Singapore), in the external UI reference pack, outside every Git repository. No application code, route, repository file or screenshot was changed to produce it. This plan authorizes no checkpoint.*
