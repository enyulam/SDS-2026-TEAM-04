# HERO CHAIN COMPLETION PLAN

> # ✅ CLOSED — COMPLETE. Operator-accepted 2026-08-11.
>
> **Every phase in this plan is built, proven and ACCEPTED.** Phases **0A, 0B, 1** and **2–6** were accepted on 2026-08-10; **7, 8, 9, 10, 11** were accepted on **2026-08-11**. **`PASS` was the session's evidence verdict; these `Accepted` marks are the Operator's** (`CLAUDE.md` §14.1, §15.6).
>
> ⚠️ **A CLOSED PLAN AUTHORIZES NOTHING AND RE-OPENS NOTHING.** No later work may cite a phase of this plan as its authorization, and no later phase may "complete" a surface this plan deliberately left alone. **Its `REGISTERED-OMISSION`s remain protected exactly as they were during execution** — G-2's Overall Grade on four surfaces, G-4's term everywhere, G-3's KEY FOCUS chips, G-7's `Assist.` slot, G-8's evidence media, and the absent trainer row on `33` (§6.1a).
>
> ⛔ **CARRIED, NOT WAIVED BY CLOSURE:** **RENDERED CAPTURE `NOT-RUN`** on every authenticated surface, and **`NOT APPLICABLE (G-1)`** on the three unframed surfaces — a **ruled disposition**, never a pass and never a gap. Closing the plan changes neither.
>
> **§12 is the part of this document with a life after closure.** It carries eighteen disciplines proven during execution, several of them by failing first. Read it before writing any future proof — items **17** and **18** in particular.
>
> ---
>
> **THIS PLAN AUTHORIZES NOTHING.** It is a procedural planning artefact (`CLAUDE.md` §1). It cannot override the specification, a ratified amendment, `FINAL_MVP_AUTHORITY_LOCK.md`, an operator ruling or `CLAUDE.md`.
>
> Written 2026-08-10 on `develop`, in the **development clone**. **No code was changed to produce it.** No phase has been started.
>
> ⚠️ **This plan CROSSES GOVERNED SURFACES that `UI_RECONCILIATION_BUILD_PLAN.md` §5.2.6 expressly forbade** — schema, projections, RPCs and server actions. That is the point of it, and it is why **§11's authorization map marks every phase needing explicit Operator authorization before any code is written.**
>
> **Revision 2 (2026-08-10)** — the Operator ruled all eight governance collisions, and a provenance audit (§4) re-derived every screen. Both are folded in.

---

## 0. Why this plan exists — the problem is not drift

`UI_RECONCILIATION_BUILD_PLAN.md` closed having resolved **145 `TRUE-DRIFT`** items across 14 phases while preserving **73 `REGISTERED-OMISSION`s** unchanged. It did its job, and in doing it made a different problem legible:

**Several screens are not visually outdated. They are FUNCTIONALLY INCOMPLETE.** The build delivers a simplified subset assembled under time pressure for a demonstration; the reference frames describe the full product. Reconciliation was forbidden from adding a field, a projection or a read path, so wherever the gap was *data* rather than *presentation*, it correctly recorded the gap and moved on.

**The sharpest single instance is `CanonicalReportDto`, which carries `panels` and `submittedAt` and nothing else** — so a parent's report page cannot state which class or session the report is even about, and cannot name the learner in its own heading. The Operator has ruled that the worst defect in the chain and sequenced it first.

---

## 1. ✅ OPERATOR RULINGS — all eight collisions resolved, 2026-08-10

**These are settled. No phase re-opens one, and no phase designs around one.**

| # | Collision | ✅ RULING | Consequence |
|---|---|---|---|
| **G-1** | Three hero surfaces have no frame | **LEAVE THEM UNFRAMED.** Trainer Review & Approve and both wording editors stay on their siblings' foundation. Commissioning frames is a design task and not on this plan's path | **No longer an open gate.** §2.3 states the completion criterion this creates |
| **G-2** | "Overall Grade" roll-up | ⛔ **NO — all four surfaces. RULED OUT PERMANENTLY, NOT DEFERRED.** Unratified (§3.6; A-049 proposed and term-only); derived from ratings Management may not see (A-038); on a Parent surface it is the caught leak in softened wording (Q-27) | Becomes a **`REGISTERED-OMISSION`** on `08`, `19`, `32`, `33`. Never built |
| **G-3** | Lesson identity | ✅ **BUILD IT** — lesson number and title are worth the schema. ⛔ **KEY FOCUS chips are OUT**: they are lesson-plan intent, and conflating them with the governed carried-over previous-session focus would **silently replace a governed field** | New schema in **Phase 0B**. The prohibition is stated beside the deliverable in §6.0b and §6.4 |
| **G-4** | Term | ⛔ **NO.** A display label is not worth building the substrate an §8-deferred roadmap item needs. **Where the frame shows a term, omit it** | `REGISTERED-OMISSION` on `08`, `19`, `33`; the `29` "All terms" filter is not built |
| **G-5** | Trainer name on a Parent surface | ✅ **YES, ALLOWED.** Parents know who teaches their child; withholding it is meaningless secrecy. The same datum is already disclosed on `29` and `06`. **It is not a rating and not derived from one** | Parent projections may carry the assigned trainer's display name |
| **G-6** | Room / location | ✅ **YES.** One column, no governance weight | New schema in **Phase 0B** |
| **G-7** | `Main:` / `Assist.` staff slots | ✅ **BUILD `Main:`** · ⛔ **LEAVE `Assist.` OUT.** The TA persona stays deferred (A-014); **do not extend `centre_membership_role`** | `Main:` from Phase 0A. `Assist.` becomes a `REGISTERED-OMISSION` on `05` |
| **G-8** | Class video evidence | ⛔ **CONFIRMED OUT, unchanged** | `REGISTERED-OMISSION` on `08`. **The frame's "500MB" is never implemented**; ~~G-05's 50 MiB governs if evidence is ever authorized elsewhere~~ ✅ **`C-16`'s 100 MiB governs — corrected 2026-08-12, bounded Operator instruction. Evidence WAS subsequently authorized elsewhere (`D-5`) and is SHIPPED; the `REGISTERED-OMISSION` on screen `08` is UNCHANGED — G-8 kept the uploader off THIS screen, and that omission stands** |

**Screen `11` scope:** the Operator confirmed the earlier judgement — **Management completes the workflow without ever loading `/management`**, so `11` belongs to the portal plan and the per-report rating chip goes with it. **G-2 covers that chip's class inside the hero chain.**

### 1.1 What the rulings changed about cost

⚠️ **Five of the eight rulings REMOVE work rather than add it.** G-2, G-4, G-7 and G-8 are refusals, and G-3's second half is a refusal. The surviving new-build surface is much narrower than the frames suggest: **three columns of schema, one identity projection, context fields on four existing projections, and one narrow governed write.**

⚠️ **G-2's effect is the largest.** It removes the Overall Grade from four surfaces *and* removes the only reason those surfaces would ever need a server-side rating derivation. **Nothing in this plan computes an assessment fact.**

---

## 2. Scope — the hero chain only

**Every screen from the trainer starting a class through to the parent viewing the submitted report** — the governed two-stage workflow of A-033, end to end.

### 2.1 ✅ IN SCOPE — eleven routes

| Screen | Route | Why it is in the chain |
|---|---|---|
| **`05` Trainer Schedule** | `/trainer/schedule` | **Chain entry point.** Canonical Trainer landing route; the trainer starts a class by selecting a session |
| **`06` Trainer Student Roster** | `/trainer/sessions/[sessionId]/roster` | Attendance capture, and the only path to a learner's assessment |
| **`07` Trainer Grade Student** | `…/students/[studentId]/assess` | The nine-dimension governed assessment — the substance every later step derives from |
| **`08` Trainer AI Report Generation** | `/trainer/reports/[reportId]/generate` | AI draft through the grounding pipeline |
| **Trainer Review & Approve** ⚠️ unframed | `/trainer/reports/[reportId]/review` | **Trainer approval — mandatory and irreplaceable** (A-033) |
| **Trainer wording editor** ⚠️ unframed | `/trainer/reports/[reportId]/edit` | The governed trainer edit; a normal step, not an exception |
| **`29` Management Reports** | `/management/reports` | **Management entry point** — the post-login destination (`post-login-destinations` D-1) |
| **`19` Management Student Report** | `/management/reports/[reportId]/review` | Final quality review, return-to-trainer, **Approve & Submit** — the only publication act |
| **Management wording editor** ⚠️ unframed | `/management/reports/[reportId]/edit` | The wording-only edit A-034 authorizes |
| **`32` Parent Reports** | `/parent/reports` | **Parent entry point** — the post-login destination |
| **`33` Parent Class Report** | `/parent/students/…/report` | **Chain terminus** — the parent reads the canonical submitted version |

### 2.2 ⛔ OUT OF SCOPE

| Screen | Judgement |
|---|---|
| **`11` Management Dashboard** | **OUT — Operator-confirmed.** Not a step in the chain; management's post-login destination is `/management/reports`. Completing it is **portal breadth** |
| **`30` Parent Dashboard** | **OUT** — same reason; the parent's destination is `/parent/reports`. Also the most Q-27-constrained surface, and its Profile Details block needs personal data (date of birth, guardian contact) that **no table holds** |
| **`AUTH-01/02/03`** | **OUT — already complete.** The chain's *precondition*, not a step in it; no functional gap found |
| **`01` Trainer Dashboard** | **OUT** — cut from reconciliation, unmounted, reassigned to its own reconstruction checkpoint |
| **`09` Trainer Reports** | **OUT** — `F-STAGE3-1`: the built surface is a returned-corrections queue, not the frame's "All Reports". A **substitution** needing a functional decision first, and not on the chain |
| **`10` Trainer Student Report** | **OUT** — the framed completed-report view was never built; `/review` is the only trainer report detail surface. New construction, and under **G-2** its two most prominent elements are now permanently omitted |
| **The 20 unimplemented screens** | **OUT** — portal completion |

### 2.3 ⚠️ What G-1 means for "complete" — stated, not carried as a gate

Under the Operator's G-1 ruling, the three unframed surfaces are built and verified **functionally**, and are **never visually accepted**, because there is no artefact to accept them against.

**The hero chain's completion criterion is therefore explicitly split:**

- **Functional completion covers all eleven routes.** The chain works end to end, including the three unframed surfaces.
- **Visual acceptance covers the eight framed screens only.** The three unframed surfaces are recorded **`VISUAL ACCEPTANCE — NOT APPLICABLE (G-1)`** on their screen records.

⚠️ **`NOT APPLICABLE (G-1)` is a ruled disposition — not a `NOT-RUN`, and not a defect.** It must never be reported as a pass, and never as a gap. The three surfaces stay on their siblings' foundation — the same tokens, primitives and shell — which is a consistency requirement, not a substitute for a frame.

---

## 3. This plan crosses governed surfaces — stated plainly

`UI_RECONCILIATION_BUILD_PLAN.md` forbade every one of these. This plan requires them:

- **Schema** — three columns on `class_sessions` (Phase 0B), in a discrete named reversible migration.
- **Projections** — one new staff-identity read path, and context fields added to four existing projections.
- **RPC / server action** — one narrow governed write for `F-S6-REVIEW-1` (Phase 7).
- **Routes** — two canonical route additions are *recorded as allowed expansion* in the `19` and `33` packs; **the route census of 17 changes only under an explicit authorization naming the route.**

**Nothing here carries hosted, paid, public, human, push or submission authority.** No enum value, table or audit action string is added. **The Step 7H audit registry stays at 16.**

---

## 4. ⚠️ ARTEFACT PROVENANCE — what was actually read, per screen

The Operator required this before the plan is relied on. **Answered by re-derivation, not from memory** — a context compaction sits between this session and the Batch 3 work, so every `.html` was re-extracted today and every frame string quoted below was reproduced from that run.

| Screen | `reference/*.png` | `reference/*.html` | numbered pack `screen.md` |
|---|---|---|---|
| `05` Trainer Schedule | ✅ yes | ✅ yes — re-extracted 2026-08-10 | ⚠️ **NOT at first drafting — read now** |
| `06` Trainer Student Roster | ✅ yes | ✅ yes — re-extracted | ⚠️ **NOT at first drafting — read now** |
| `07` Trainer Grade Student | ✅ yes | ✅ yes — re-extracted | ⚠️ **NOT at first drafting — read now** |
| `08` Trainer AI Report Generation | ✅ yes | ✅ yes — re-extracted | ⚠️ **NOT at first drafting — read now** |
| `29` Management Reports | ✅ yes | ✅ yes — re-extracted | ⚠️ **NOT at first drafting — read now** |
| `19` Management Student Report | ✅ yes | ✅ yes — re-extracted | ⚠️ **NOT at first drafting — read now** |
| `32` Parent Reports | ✅ yes | ✅ yes — re-extracted | ⚠️ **NOT at first drafting — read now** |
| `33` Parent Class Report | ✅ yes | ✅ yes — re-extracted | ⚠️ **NOT at first drafting — read now** |
| 3 unframed surfaces | n/a | n/a | n/a |

✅ **No screen's frame content was derived without its `reference/ .html`.** Each pack's `implementation-notes.md` — the registered-omission record — was also read, during Batch 3.

### 4.1 ⚠️ `screen.md` WAS the gap — and it changed three things

`screen.md` carries **§6 Prohibited invention** and **§7 Dependencies**, which are governance-relevant and bear directly on delta classification. It was not consulted at first drafting. It has now been read for all eight, and every delta in §6 is re-derived. Three material changes:

1. ⚠️ **A prohibition that was missing.** Screens `32` **and** `33` both carry **"Do not disclose that a correction cycle is or was underway."** Screen `33` additionally bars *rating, observation, correction reason, trainer note, draft, AI history, content hash, revision number and audit row*. **This constrains Phases 1 and 2 — the two the Operator sequenced first.** It is now a standing constraint on both; see §6.1, §6.2 and §8.2.
2. ✅ **G-6 and G-7 DISCHARGE A REGISTERED DEPENDENCY — they do not open new scope.** Screen `05` §7 already records, at checkpoint **F-04**, that *"the frame's session **room/location** ('Studio 2') and its **Main / Assist. trainer names** exist on no governed field and are **omitted rather than fabricated**"*. ⚠️ **This is a materially stronger position than "the rulings authorize new work", and it should be stated that way:** the gap was **correctly recorded at the time, and deliberately not invented around**. G-6 and G-7 **close a dependency the project had already booked** — so neither is an expansion of Final MVP scope, and neither needs to be defended as one. **Ruled into the Authority Lock at §13 in the same terms** (`FINAL_MVP_HERO_CHAIN_RULINGS.md` §6).
3. ⚠️ **Screen `29` §6 says "Do not surface a DTO field the §5.5 exclusions forbid"**, and §5.5 is **absolute**. That was checked rather than assumed: `PHYSICAL_TEST_SLICE_48H.md` §5.5 excludes *ratings · observations · attendance · evidence · trainer notes · checklist values · content hashes · revision counts · correction reasons (one carve-out) · AI history*. **Class name, module, lesson and trainer name are NOT on that list**, so the Phase 9 columns are permitted. ✅ **The classification holds — but it is now evidence-backed rather than assumed.**

---

## 5. What exists today — measured

### 5.1 Schema (26 tables · 12 enums · 12 migrations)

| Frame datum | In the schema? |
|---|---|
| Session date / start / end | ✅ `class_sessions` |
| Module title, Class Grade | ✅ `class_modules.title`, `class_grades` |
| Student name | ✅ `students.full_name` |
| **Staff display name** | ✅ **`accounts.display_name`**, via `class_session_assignments.trainer_membership_id → centre_memberships.account_id` |
| Attendance, observations, nine ratings, report versions, approvals, correction requests | ✅ all governed and present |
| **Room / location** | ❌ **nothing** → Phase 0B (G-6 ✅) |
| **Lesson number / title** | ❌ **nothing** → Phase 0B (G-3 ✅) |
| Lesson-plan focus tags · slides · term · overall grade | ❌ nothing — **and all four are ruled OUT** (G-3 second half, G-8 class, G-4, G-2) |

⚠️ **One hypothesis was corrected during analysis, and it changed several classifications.** `trainer_profiles` / `parent_profiles` are membership-keyed rows carrying **no name**, which initially read as "staff names need new schema". They do not — **`accounts.display_name` already holds them.** Every trainer-name delta is therefore **`NEEDS NEW PROJECTION`**, not **`NEEDS NEW SCHEMA`**: materially cheaper, and no migration.

### 5.2 Governed functions at HEAD — verified by enumeration, not by `screen.md`

⚠️ Each pack's `screen.md` describes its RPCs as *"delivered on `feat/48h-backend`"* — a branch that is **`CLOSED_BY_NONUSE_POLICY`**. That phrasing must not be relied on. **Enumerated from the migrations instead:** `assessment_get_trainer_observation` · `assessment_save_observation` · `assessment_save_complete_and_open_report` · `report_get_canonical` · `report_get_management_review` · `report_get_working` · `report_get_source_map` · `report_trainer_approve` · `report_save_edit` · `report_update_checklist` · `report_management_edit_wording` · `report_management_return_to_trainer` · `report_management_approve_and_submit` · `report_list_management_submitted` · `report_list_management_corrections` **are all present at HEAD.** Both 48-hour branches were merged and are 0 commits ahead of `main`.

**Projection entry points** (`server/modules/**`): `listTrainerSessionsCore` · `getSessionRosterCore` · `getTrainerObservationCore` · `getTrainerWorkingReportCore` · `listManagementPendingReviewCore` · `listManagementSubmittedCore` · `listManagementCorrectionTrackingCore` · `getManagementReviewCandidateCore` · `listParentReportsCore` · `getCanonicalReportCore` · `getParentAvailabilityCore`.

### 5.3 DTOs today

| DTO | Carries | Gap |
|---|---|---|
| `TrainerSessionSummaryDto` | sessionId, moduleName, classGrade, date, start, end, studentCount, countsByReportState | no trainer, no room |
| `RosterEntryDto` | studentId, displayName, attendance, reportState, reportId, previousSessionFocus | complete for its purpose |
| `ManagementQueueRowDto` | studentId, name, sessionDate, status, correction fields, submittedAt | **no class, no lesson, no trainer** |
| `ManagementReviewDto` | status, lockVersion, versionId, panels, wordingHash, correction fields | no class, no lesson, no trainer |
| `ParentReportListItemDto` | studentId, name, sessionId, sessionDate, submittedAt | **no class, no lesson, no trainer** |
| `CanonicalReportDto` | **panels + submittedAt only** | ⚠️ **the narrowest surface in the chain** |

---

## 6. Per-screen analysis — frame · built · classified delta

**Key:** `PRESENTATION-ONLY` · `NEEDS NEW PROJECTION` · `NEEDS NEW SCHEMA` · `NEEDS NEW SERVER ACTION` · `REGISTERED-OMISSION` (ruled out — preserved, never built).

⚠️ **After the eight rulings there are no `GOVERNANCE-BLOCKED` items left in a pending sense.** Every one is now either ruled in and scheduled, or ruled out and recorded as a preserved omission. **That is what ruling first bought.**

### 6.0 Phase 0A — the staff-identity projection *(shared, not a screen)*

Assigned trainer display name via `class_session_assignments → centre_memberships → accounts`. One reviewed, RLS-scoped read path. **Consumed by `05`, `06`, `29`, `19`, `32`, `33` — six of the eight framed screens.**

⚠️ Built once, deliberately. Deriving it inside six screen-phases would be the layer-first duplication the Operator excluded, running the other way.

### 6.0b Phase 0B — session descriptive metadata *(shared, not a screen)*

**Three columns on `class_sessions`: `lesson_number` · `lesson_title` · `room`.** One discrete named reversible migration.

**Shape evidence, from the `.html` of two independent screens.** `29` renders `"4 · Speaking"`, `"2 · Pronunciation"`, `"6 · Confidence"`; `33` renders `"4 · Expressive Delivery"`. **Both are `<number> · <title>`** — so two columns, not one, and not a new table. This keeps the ratified hierarchy intact: **no `classes` entity is introduced** (A-016), and **no duplicated calendar or event record is created** (A-047).

⛔ **PROHIBITION, stated beside the deliverable (G-3 second half): the KEY FOCUS chips are NOT built and NO column is added for them.** They are lesson-plan intent. The governed carried-over previous-session focus already on `RosterEntryDto` is **a different field with different authority**, and conflating them would silently replace a governed field with an ungoverned one. **No phase may render lesson-plan focus into the roster's focus line.**

⚠️ `room` is a plain descriptive column. It carries **no authorization meaning** and must never be used to scope a query.

### 6.1 `33` Parent Class Report — **Phase 1**

**Frame in full** *(re-extracted from the `.html`)*: page heading `"Class Report"` + `"Public Speaking · Wed 14 March 2035"` · report card `"Class Report — Alicia Gomez"` + `"Public Speaking · 14 March 2035 · Parent report"` · the four OD-4 panels · **Report Details** (Name · Class `"Junior · Public Speaking"` · Lesson `"4 · Expressive Delivery"` · Term `"Term 1 · 2026"` · Overall Grade `"Mastering"`) · **PERFORMANCE SUMMARY** with four dimension tiles · prose rating attributions · **Watch Together** 3:24 video.
**Built today:** the four governed panels and the received date — **and nothing else**, because `CanonicalReportDto` carries only `panels` and `submittedAt`.

| Delta | Class |
|---|---|
| **Learner name in the card heading** | **`NEEDS NEW PROJECTION`** — ⚠️ the surface knows the student **id** from the route but not the **name** |
| **Class Grade + module** on the page heading, card subtitle and Report Details | **`NEEDS NEW PROJECTION`** — data exists |
| **Lesson `N · Title`** | **`NEEDS NEW SCHEMA`** (Phase 0B) then projection — ✅ G-3 |
| ~~**Trainer name**~~ | ⛔ **STRUCK — OPERATOR RULING, 2026-08-10. NOT BUILT ON `33`; BUILT ON `32` IN PHASE 2.** See §6.1a |
| Term | ⛔ **`REGISTERED-OMISSION`** — G-4 |
| Overall Grade | ⛔ **`REGISTERED-OMISSION`** — G-2 |
| Performance Summary tiles · prose rating attributions | ⛔ **`REGISTERED-OMISSION`** — Q-27, A-052 |
| Watch Together | ⛔ **`REGISTERED-OMISSION`** — G-8, Authority Lock §8.1 |

⚠️ **Standing constraint (`screen.md` §6):** nothing on this surface may render a rating, observation, **correction reason**, trainer note, draft, AI history, content hash, **revision number** or audit row, and **nothing may disclose that a correction cycle is or was underway.** The new context fields must be added without widening the read toward any of them.

### 6.1a ✅ OPERATOR RULING, 2026-08-10 — **NO TRAINER ROW ON `33`. IT IS BUILT ON `32`.**

**The delta table above listed a trainer row on `33`. Phase 1 departed from it, reported the departure rather than resolving it silently, and the Operator has RULED THE DEPARTURE CORRECT.**

**The ruling, in its own terms:**

> **`G-5` grants PERMISSION; permission is not a visible field.** Frame `33` draws no trainer, **`G-5`'s evidence is frame `32`**, and rendering it on `33` would **invent a visible element**. Build it on `32`, where the frame draws it.

**Binding consequences — read all four:**

1. ⛔ **No later phase may "complete" `33` by adding a trainer row.** Its absence there is **`EXPECTED / REQUIRED`**, exactly as Q-27's absent skills card is on `30` — never a gap, never a visual regression, never an unfinished delta.
2. **`G-5` is unchanged and undiminished.** It permits the assigned trainer's display name on a Parent surface, and `32` exercises that permission in Phase 2. A permission that is exercised on one surface and not another is not a partial permission.
3. ⚠️ **The generalizable rule, which is why this is recorded rather than just done:** a **procedural plan cannot add a visible element the ratified frame lacks.** The plan sits below the visual ladder (`CLAUDE.md` §1, §7.4 / A-056), and a delta table is a reading of a frame — where the two disagree, **the frame decides what is drawn** and governance decides whether it may be. This is the visual counterpart of *screen presence is not authorization* (A-045).
4. **The governed projection is unaffected.** `report_get_canonical_context` returns `trainer_display_name` and continues to; the field reaches `33`'s DTO and is **deliberately not rendered there**. Carrying a permitted field that a frame does not draw is correct; **inventing an element to consume it is not.**

### 6.2 `32` Parent Reports — **Phase 2**

**Frame in full:** `"Reports"` + `"Reports you've received for Alicia"` · `"All Reports"` · per-row document tile whose **title is the lesson title** (`"Expressive Delivery"`, `"Voice & Projection"`, `"Intro to Persuasion"`), a **rating chip** (`"Mastering"` / `"Developing"`), and a meta line `"Junior · Public Speaking · Lesson 4 · Argen Maulie · Received 14 Mar 2035"` · **View** · a `"Viewing <child>"` affordance.
**Built today:** rows carrying learner name, session date, a View action, and the child affordance over live links only.

| Delta | Class |
|---|---|
| **Row title = lesson title** | **`NEEDS NEW SCHEMA`** (Phase 0B) then projection — ✅ G-3 |
| Class Grade + module in the meta line | **`NEEDS NEW PROJECTION`** |
| `Lesson N` in the meta line | **`NEEDS NEW SCHEMA`** then projection — ✅ G-3 |
| **Trainer name** | **`NEEDS NEW PROJECTION`** (Phase 0A) — ✅ G-5 |
| Received date | **`PRESENTATION-ONLY`** — `submittedAt` is already on the DTO |
| Per-row rating chip | ⛔ **`REGISTERED-OMISSION`** — Q-27 |

⚠️ Same standing constraint as `33`, plus `screen.md` §6: **do not list an unsubmitted report; do not list a report for a child with no live link.**

### 6.3 `05` Trainer Schedule — **Phase 3**

**Frame in full:** month calendar with per-day event chips · Day/Week/Month · month selector · schedule search · **Add Agenda** · Schedule Details showing the Class chip, module title, date, time range, **`"Studio 2"`**, **`"Main: Sam Ong"`**, **`"Assist. Sam Ong"`**, **`"Start Class"`**.
**Built today:** all of it except room and the two staff rows; Add Agenda inert with a stated reason, Start Class relabelled. Visually reconciled and accepted.

| Delta | Class |
|---|---|
| **Room** | **`NEEDS NEW SCHEMA`** (Phase 0B) then projection — ✅ G-6 |
| **`Main:` assigned trainer** | **`NEEDS NEW PROJECTION`** (Phase 0A) — ✅ G-7 |
| `Assist.` second staff row | ⛔ **`REGISTERED-OMISSION`** — G-7. **`centre_membership_role` is NOT extended** |
| Add Agenda · Start Class | ⛔ **`REGISTERED-OMISSION`** — A-019, A-026 |

### 6.4 `06` Trainer Student Roster — **Phase 4**

**Frame in full:** dark banner — `"CLASS IN SESSION"`, `"Junior · Public Speaking · Studio 2"`, **`"Trainer: Argen Maulie"`**, assessed-progress bar · lesson strip — `"THIS LESSON"`, `"Lesson 3 · Voice & Projection"`, `"Tue 11 Mar · Studio 2"`, **KEY FOCUS** chips, **SLIDES** chips, `"View lesson plan"` · roster heading `"8 Total"` · Filter and Sort · learner cards with initials, present/absent, focus line, status pill, action.
**Built today:** banner with governed labelling, progress bar, lesson strip fed by module + date, carried-over focus chips, working Filter/Sort, learner cards with governed status and per-row action.

| Delta | Class |
|---|---|
| **`Trainer: <name>` in the banner** | **`NEEDS NEW PROJECTION`** (Phase 0A) |
| **Lesson `N · Title`** in the strip | **`NEEDS NEW SCHEMA`** (Phase 0B) — ✅ G-3 |
| **Room** in banner and strip | **`NEEDS NEW SCHEMA`** (Phase 0B) — ✅ G-6 |
| ⛔ **KEY FOCUS chips** | **`REGISTERED-OMISSION`** — G-3 second half. ⚠️ **Must not be rendered into the existing carried-over focus line** |
| SLIDES chips · View lesson plan | ⛔ **`REGISTERED-OMISSION`** — no storage exists, and it is G-8's class |
| `"CLASS IN SESSION"` live dot | ⛔ **`REGISTERED-OMISSION`** — asserts a lifecycle state no field carries (A-026) |
| `"8 Total"` vs one learner | **Neither drift nor schema — fixture breadth.** See §7.2 step 5 |

### 6.5 `07` Trainer Grade Student — **Phase 5**

**Frame in full:** learner rail with **REVIEW & APPROVE** bucket counts and per-learner status · identity card · nine-row rubric with four-segment tracks · Observation Notes · Save & Generate.
**Built today:** all of it, in ratified dimension order with group captions and the A-050 anchors, the governed **Follow-up for Next Session** field, server-validated mandatory-nine completion, and the eligibility gate.

| Delta | Class |
|---|---|
| Rail bucket counts and per-learner status | **`NEEDS NEW PROJECTION`** — a roster-wide status summary; **all inputs already exist** on `getSessionRosterCore` |
| Frame's "Junior" / "Student ID" | ⛔ **`REGISTERED-OMISSION`** |
| Frame's saturated chip fills | ⛔ **`REGISTERED-OMISSION`** — all four fail SC 1.4.3 |

⚠️ **The most complete screen in the chain**, and its phase is correspondingly small.

### 6.6 `08` Trainer AI Report Generation — **Phase 6**

**Frame in full:** `"Term Report — Alicia Gomez"` / `"Public Speaking · Term 1, 2035 · Parent copy"` · four panel blocks with per-panel edit · **Report Details** (Name · Class · Lesson · Term `"Term 1 · 2026"` · Overall Grade) · PERFORMANCE SUMMARY · **Class Video Evidence** `"MP4, MOV · up to 500MB each"` · **Confirm & Submit / Save as draft**.
**Built today:** four OD-4 panels with edit routing, Report Details over governed facts, all nine rating tiles, an inert evidence region, and the governed next-step panel.

| Delta | Class |
|---|---|
| Class context in Report Details | **`NEEDS NEW PROJECTION`** |
| **Lesson** row | **`NEEDS NEW SCHEMA`** (Phase 0B) — ✅ G-3 |
| Term row | ⛔ **`REGISTERED-OMISSION`** — G-4 |
| Overall Grade | ⛔ **`REGISTERED-OMISSION`** — G-2 |
| Evidence uploader | ⛔ **`REGISTERED-OMISSION`** — G-8. ⚠️ **"500MB" is never implemented in any form** |
| "Term Report" framing · Confirm & Submit · Save as draft · four-tile summary | ⛔ **`REGISTERED-OMISSION`** — A-033/A-036: **the trainer approves and does not publish** |

### 6.7 Trainer Review & Approve — **Phase 7** ⚠️ highest risk

**Frame:** none — **G-1: stays unframed.**
**Built today:** the three-item version-scoped Quality Checklist, the Approve action, the returned-correction state, and the trainer's follow-up note rendered **read-only**.

| Delta | Class |
|---|---|
| ⚠️ **`F-S6-REVIEW-1`** — `CLAUDE.md` §6 requires this screen to **load the trainer's current follow-up value into an editable field**, and that *"whatever server action saves this field must be callable from both screens against the same column"*. It is a read-only `<p>` today | **`NEEDS NEW SERVER ACTION`** |
| Visual completion target | **`NOT APPLICABLE (G-1)`** |

**This is a functional non-conformance with a ratified rule**, already logged, and explicitly excluded from the reconciliation plan. **It belongs here.** Design detail and its separation from the owed re-proof are in §9.

### 6.8 Trainer wording editor — **Phase 8** · 6.10 Management wording editor — **Phase 11**

**Frame:** none — **G-1.** Both function today. Delta: consistency with their siblings' foundation only. Visual acceptance is **`NOT APPLICABLE (G-1)`**.

> ✅ **PHASE 8 — MEASURED AT HEAD 2026-08-11, AND IT BUILT NOTHING. The second such result this batch, after Phase 5, and for the same reason: the delta above is a READING OF A FRAME, NOT A MEASUREMENT OF THE BUILD (§12 item 10).** Measured against `trainer-report-review.tsx` on eleven foundation probes, `trainer-report-editor.tsx` **already sat on its sibling's foundation on every one**. There was no divergence to close, and none was manufactured to make the phase look productive.
>
> **What it delivered instead is the thing `G-1` actually needs — `scripts/tests/hero/prove-8-unframed-foundation.mjs` (`npm run prove:hero-8`), 14 legs, `PASS`.** ⚠️ **Nothing enforced this consistency before.** A framed screen has a reference frame to catch drift; these three have none, so an editor could quietly acquire its own shell, loading state or error panel and **no check anywhere would notice**. For an unframed surface a mechanical consistency check is **the only guarantee that exists**, and its absence was the real Phase 8 gap.
>
> ⚠️ **The discrimination leg is reported at its true strength, not its most flattering.** `P8-1c` measures the probe set against a deliberately unrelated control surface, which matches **7 of 9** — so the set is **not vacuously universal**, but seven probes are genuinely platform-wide. **That is the point rather than a weakness**: G-1's requirement *is* "the same tokens, primitives and shell", so a probe shared across the platform is measuring exactly the shared thing. The two that separate (`REPORT_PANEL_CONFIG` and the report port) carry the discrimination.
>
> ⛔ **This is NOT a visual acceptance and must never be reported as one.** §2.3 already rules `NOT APPLICABLE (G-1)` a **disposition** — never a pass, never a gap — and a green consistency proof does not convert it into one.
>
> **Phase 11 covers `management-wording-editor.tsx` against `management-report-review.tsx` and measured identically at HEAD** — it too has nothing to build, and **extends this same harness rather than adding a second one** (`npm run prove:hero-11` runs the same file; two harnesses asserting one property in two places is how they drift apart). ⛔ The third G-1 surface, **Trainer Review & Approve, is the SIBLING in the first pair, not a third row** — it has no unframed sibling to be compared against, and comparing it to itself would assert nothing.
>
> ⚠️ **PHASE 11 ALSO PRODUCED THE WORST NEAR-MISS OF THIS BATCH, IN MY OWN INSTRUMENT.** Extending the harness introduced a template literal containing **backticks** around `NOT APPLICABLE` — a syntax error, so the module **never parsed and never ran a single check**. The sweep in use was `npm run prove:hero-$n | grep -o "RESULT: [A-Z]*"`, and **Node's SyntaxError report ECHOES THE OFFENDING SOURCE LINE — which was the success message, containing the literal text `RESULT: PASS`.** ▶ **The harness's own success string became the evidence of its success while it had never executed.** Same family as `bool_and` over zero rows and the S-8 gate, **but one level worse: the defect was in the MEASURING INSTRUMENT**, so it would have contaminated every phase boundary the sweep was used at rather than one leg. ⛔ **Never decide a suite's verdict by matching its output — exit code is the only verdict.** Closed by **`npm run prove:hero-all`** (§12 item **17**), which keys off exit status and additionally fails any suite that exits 0 while printing `RESULT: FAIL`.

### 6.9 `29` Management Reports — **Phase 9**

**Frame in full:** filter strip (`"All terms"` · `"All classes"` · `"Status"`) · `"Search students"` · table **Student · Class · Lesson · Trainer · Submitted · Status ·** action, rows reading e.g. `"Alicia Gomez"` / `"Junior · Public Speaking"` / `"4 · Speaking"` / `"Argen Maulie"` / `"12 Mar"` / `"Approved"` / `"View report"`, with a `"Needs approval"` / `"Review"` variant.
**Built today:** status filter over the ratified aliases, client-side search, and a table of Student · Session · Status · action with per-status row actions.

| Delta | Class |
|---|---|
| **Class** column | **`NEEDS NEW PROJECTION`** — ✅ permitted; **not on the §5.5 exclusion list** (§4.1 item 3) |
| **Trainer** column | **`NEEDS NEW PROJECTION`** (Phase 0A) — ✅ permitted |
| **Lesson** column | **`NEEDS NEW SCHEMA`** (Phase 0B) — ✅ G-3, and permitted |
| **All classes** filter | **`NEEDS NEW PROJECTION`** |
| All terms filter | ⛔ **`REGISTERED-OMISSION`** — G-4 |
| Frame's `Approved` / `Needs approval` vocabulary | ⛔ **`REGISTERED-OMISSION`** — the **eight ratified statuses** win |

⚠️ **§5.5 is absolute and is re-checked at this phase's exit**, field by field, against the DTO as shipped.

> ✅ **PHASE 9 — BUILT AND PROVEN 2026-08-11. `npm run prove:hero-9`, 6 SQL legs + 17 surface legs, `PASS`.** Measured at HEAD first, per §12 item 10.
>
> **It needed NO new database object.** Management already holds its own Step 7G SELECT policy **and** matching grant on `class_sessions`, `class_modules`, `class_grades`, `class_session_assignments` and `trainer_profiles` — measured, not assumed — so the context is read over the caller's own credential, exactly as every other management projection does. The Trainer column reuses **Phase 0A's shared identity path**, so `29` carries no second copy of that join.
>
> ⚠️ **THE DESIGN DECISION WORTH RECORDING IS A REFUSAL.** The obvious reuse was Phase 0B's `report_get_canonical_context`, which returns precisely the four fields wanted — and is gated on `latest_submitted_version_id IS NOT NULL`, because it describes a **submitted** report. **Two of this screen's three queue modes hold no submitted version at all.** ⛔ **The gate was NOT widened to make it fit.** `P9-2` measures the RPC returning **zero rows** for a `trainer_approved` pair, and **`P9-3` measures that its submitted-version precondition is still present** — so §12's *"never work around a fail-closed refusal by weakening the thing that refused"* is checked mechanically rather than promised in a comment. A new shared reader in the module that **owns** those tables (§9 rule 1) was the narrower instrument.
>
> ⚠️ **`P9-5` is what makes `P9-1` mean anything:** the suite runs under `SET LOCAL ROLE authenticated`, and the same statement with no identity returns **zero rows**. `FORCE ROW LEVEL SECURITY` is off, so as owner every leg would have passed for the wrong reason — the `bool_and`-over-zero-rows shape this project has now been bitten by three times.
>
> ⛔ **`G-4` — THE "All terms" FILTER WAS FOUND STANDING ON THIS SCREEN AND HAS BEEN REMOVED.** It was rendered as a **disabled chip** with an honest reconciliation-era reason: *"the governed Management queue projection carries no term field."* ⚠️ **That reason became false in the way that matters — it implies the filter would exist if the data did.** G-4 ruled the opposite, permanently, because a `terms` table is the substrate End-of-Term generation needs (§8, spec §28). **`REGISTERED-OMISSION` means ruled out, preserved in the record, NEVER BUILT**, and an inert chip advertising a filter that will never exist is a partial build of a ruled-out element. `P9-7` pins its absence, `P9-7b` proves that matcher discriminating against the Class chip, and **`P9-6` shows G-4 holds at the SCHEMA too** — no term table, no term column.
>
> **The class filter's options are derived from the rows the caller already received (`P9-8`), and it fetches nothing to populate itself (`P9-8b`).** It therefore cannot name — or be used to probe for — a class this management account cannot already see. Both it and the search box **narrow an already-authorized list and can never widen one**; neither is an authorization decision.
>
> **§5.5 re-checked field by field against the shipped contract, not the server interface** — ten scans, plus a non-vacuity leg and a discrimination leg (`P9-10a`/`P9-10b`).

### 6.10 `19` Management Student Report — **Phase 10**

**Frame in full:** audience toggle (`"Report for: Parent / Management"`) · report card with the four panels and per-panel edit · `"Public Speaking · Term 1, 2035 · Management copy"` · Report Details · PERFORMANCE SUMMARY · Overall Grade · evidence · attendance · approval panel with Save as draft.
**Built today:** the final-review candidate and the published view, four panels, wording-only edit routing, return-to-trainer with issue scope and dimension, and Approve & Submit with the wording proof.

| Delta | Class |
|---|---|
| Class + trainer context in Report Details | **`NEEDS NEW PROJECTION`** — permitted under §5.5 |
| Lesson | **`NEEDS NEW SCHEMA`** (Phase 0B) — ✅ G-3 |
| Overall Grade | ⛔ **`REGISTERED-OMISSION`** — G-2, **and** A-038 independently |
| Audience toggle · Performance Summary · trainer notes · evidence · attendance · Save as draft | ⛔ **`REGISTERED-OMISSION`** — six prohibitions under R-B5, preserved |

> ✅ **PHASE 10 — BUILT AND PROVEN 2026-08-11. `npm run prove:hero-10`, 21 legs, `PASS`.**
>
> ⚠️ **IT ADDED NO PROJECTION, AND THAT IS THE MEASURED FINDING.** The delta above says `NEEDS NEW PROJECTION`; measured at HEAD, `19` **already** narrows its learner identity out of the same governed queue projection `29` reads, and **Phase 9 had already put class, lesson and trainer on that projection**. Phase 10 needed no new read, no new RPC and no new database object — only the render. *(This is why the Phase 9 reader was built in `class-session` rather than `management-view`: it was expected to serve two consumers, and it did.)*
>
> **No SQL half, stated rather than left as a silent omission:** there is no new database object to interrogate, and `prove:hero-9` already proved the read, the RLS decision and the refusal legs behind these very fields. Re-running it against a second consumer would restate an accepted result rather than establish a new one (`CLAUDE.md` §14.7).
>
> ⚠️ **THE SUBTLE DEFECT THIS PHASE FOUND: a data-availability omission and a RULED omission look IDENTICAL on a rendered page.** `19` omitted Lesson because *"no governed Management projection carries it"* — a **data** reason, which Phase 9 discharged. **`Overall Grade` and `Term` were never omitted for that reason**: G-2 and G-4 rule them out **permanently**, and A-038 bars a grade independently. ⛔ **The first kind of omission ends when the data arrives; the second never ends.** The stale sentence was corrected on screen and in the file's `D2`/`P3` notes, and **`P10-4b`/`P10-4c`** pin both halves — the discharged reason is gone, and term is still refused on the permanent ground.
>
> **The six R-B5 prohibitions and G-2/G-4 are pinned by nine absence legs**, with `P10-3b` proving the matcher family discriminating and `P10-3c` recording *why* `dimensionCode` is legitimately present (A-035 names which dimension a correction concerns; it carries no rating).
>
> ⚠️ **Two of those nine matchers FAILED on first run, both as bare-word matches** — `/term/` matched the screen's own sentence *refusing* term (which `P10-4c` **requires**, so the two legs contradicted each other), and `/audience/` matched **`audience_awareness`, the ninth B.E.S.T dimension** — §5's and A-054's hazard exactly, and a narrowing G-06 expressly refused. ▶ **This is the shape A-052 already prohibits for rating labels, and it generalizes: a bare-word match over a governed vocabulary rejects legitimate content — in a TEST as much as in a leak guard.** Recorded as §12 item **15**.

---

## 7. ⛔ `B-STAGE3-2` — EXACTLY WHAT IS NEEDED FROM THE OPERATOR

**`B-STAGE3-2` blocks every end-to-end verification in this plan, and the fixture breadth Phase 4 wants.** It is `OPERATOR-ONLY` because the governed fixture load reads three passwords from an interactive no-echo prompt that no agent may handle. The Operator has asked to clear it **before Phase 0A** rather than discover it mid-phase.

### 7.1 What is actually broken — measured, not assumed

The canonical fixture database is **no longer in its ratified pristine state**. An earlier revision of the Stage 3 harness drove governed mutations through the served app, and the served app talks to the **canonical** database because PostgREST is bound to it.

**Measured damage:** `reports` 0 → 1 · `audit_events` 0 → 4 (`attendance.changed` ×2, `report.created`, `report.state_changed`) · `audit_chain_heads` 0 → 1 · the fixture attendance row's `recorded_by_membership_id` / `recorded_by_role` are now **non-NULL**, so **`verify-local-fixtures.sql` fails assertion A19.**

**The consequence is wider than one failing assertion.** `readCanonical()` throws **before** it can reach `assertCanonicalPristine`, because `fixtureChecksum()` runs the failing verifier — so **all six disposable-stack harnesses abort**, and every `CREATE DATABASE … TEMPLATE postgres` inherits the dirt. That is why `npm run test:continuity` died at `CONT-A0`, and why the Phase 6a runtime re-proof is owed.

⚠️ **`audit_events` is append-only and its `BEFORE DELETE OR UPDATE` trigger refuses `postgres` too. That part is IRREVERSIBLE BY DESIGN.** The trigger was **not** disabled and **must not be** — §12 forbids working around a fail-closed refusal by weakening the thing that refused. **Therefore a plain in-place fixture `--reload` cannot succeed while those four audit rows exist.**

### 7.2 What is needed from the Operator, exactly

**All of it is LOCAL. Nothing hosted, nothing billable, nothing pushed. No credential ever reaches a session, a file, a log or a report.**

| # | Action | Notes |
|---|---|---|
| **1** | **Start the local Supabase stack** and leave it running | The loader and every harness call `supabase status -o json` and abort if it is down. **No password, no credential** |
| **2** | ⚠️ **Decide and perform the reset path** — because §7.1 means an in-place reload cannot clear `audit_events` | ⛔ **Never `supabase db reset`** — §12 prohibits it, and it destroys the three synthetic Auth identities. The precedent is the Operator's own **`D-0C`** ruling: a bounded **LOCAL-only fresh reconstruction** re-applying all 12 migrations from scratch under the plan's **R-1** semantics. ⚠️ **No session is authorized to choose or perform this** — it is a destructive local operation and it is the Operator's |
| **3** | **`npm run fixtures:local`**, in the Operator's own terminal | Prompts **three times, no-echo**, for the three synthetic identity passwords. ⚠️ **Never paste a password into chat in either direction, and do not send the raw output** — capture it and report **only** the exit code and the verifier verdict |
| **4** | **Confirm the verifier passes** — `verify-local-fixtures.sql`, assertion **A19** in particular | A19 is the one that failed. This is the signal that `B-STAGE3-2` is genuinely closed |
| **5** | ✅ **Optional, for Phase 4's roster breadth** — apply `scripts/fixtures/local_fixtures_expansion.sql` | ⚠️ **This file ALREADY EXISTS** and is `P1-T09a`. It is **strictly additive and independently appliable**, with a deliberately **disjoint UUID family**, so it does **not** need another reload. It delivers exactly the broader §11 shape — 2 trainers, 2 class modules, 3–4 learners each, 2 parents, and **a second Class Session for previous-focus continuity**. ⚠️ **Once applied, the loader REFUSES `--reload` while expansion rows are present** — so apply it **after** step 4, never before |

### 7.3 What a session will and will not do

**Will:** report the exit code and verdict the Operator supplies; re-run `npm run test:continuity` once the stack is up; treat any failure as a finding rather than something to retry around.
**Will not:** perform step 2 or step 3; read, request, print or persist any password; contact any hosted service; re-attempt a failed destructive operation (§12).

### 7.4 If it stays blocked

**Phases 0A and 0B can be authored and committed without it** — a migration and a projection are code. ⚠️ **But no phase in this plan can reach `PASS`**, because every exit criterion includes end-to-end verification against a real governed database. **Work would accumulate unverified** — which is precisely the pattern that produced the four defects Batch 3 found. **Recommendation: clear it first.**

---

## 8. The phases — one screen per phase, each delivered COMPLETE

**Structure rule:** phases are **by screen, never by layer**. Each delivers its screen **end to end** — projection → server action if needed → frontend → end-to-end verification — **before the next begins.** There is **no frontend-first pass and no trailing integration phase**; the integration *is* each phase's exit. **Within a phase, server-side precedes the frontend that consumes it.**

### 8.1 ⚠️ How the rulings changed the sequencing the Operator approved

The Operator approved **Phase 0 → 11 → 10** — the parent screens first, on the stated basis that they were the only ones with a substantial **ungated** deliverable. **That was true while G-3 and G-5 were unruled.** Ruling **G-3 = BUILD** gave both parent screens a lesson deliverable, and screen `32`'s **row title *is* the lesson title** — so both now depend on the lesson schema.

✅ **The sequencing intent is preserved: the parent screens still go first.** The prerequisite set grew by one shared schema phase, so **Phase 0 splits into 0A and 0B**. Deferring lesson to a later pass would be the "come back later" pattern the Operator's own structural rule excludes.

*(Phases are renumbered from revision 1. Screen IDs are used everywhere to prevent confusion: revision 1's "Phase 11" is screen `33`, now **Phase 1**; revision 1's "Phase 10" is screen `32`, now **Phase 2**.)*

| Phase | Screen | Delivers | Prerequisites |
|---|---|---|---|
| **0A** | *(shared)* | **Staff-identity projection** — assigned trainer display name, RLS-scoped, one reviewed read path | `B-STAGE3-2` cleared |
| **0B** | *(shared)* | **Session descriptive metadata migration** — `lesson_number`, `lesson_title`, `room` on `class_sessions`. ⛔ **No KEY FOCUS column** | `B-STAGE3-2` cleared |
| **1** | **`33` Parent Class Report** | Learner name, class context, lesson and trainer on the canonical parent read. ⚠️ **The chain's worst defect** | 0A, 0B |
| **2** | **`32` Parent Reports** | Row title = lesson title; class + lesson + trainer + received date in the meta line | 0A, 0B, 1 |
| **3** | **`05` Trainer Schedule** | Room; `Main:` trainer. ⛔ `Assist.` omitted | 0A, 0B |
| **4** | **`06` Trainer Student Roster** | Trainer in the banner; lesson strip; room. ⛔ KEY FOCUS omitted | 0A, 0B, 3, ✅ fixture expansion (§7.2 step 5) |
| **5** | **`07` Trainer Grade Student** | Rail bucket counts and per-learner status | 4 |
| **6** | **`08` Trainer AI Report Generation** | Class context and lesson in Report Details | 0B, 5 |
| **7** | **Trainer Review & Approve** | ⚠️ **`F-S6-REVIEW-1`** — the editable follow-up field with a save path | 6, and §9 in full |
| **8** | **Trainer wording editor** | Foundation consistency only | 7 |
| **9** | **`29` Management Reports** | Class, Trainer and Lesson columns; class filter. ⛔ terms filter omitted | 0A, 0B |
| **10** | **`19` Management Student Report** | Class, trainer and lesson context in Report Details | 0A, 0B, 9 |
| **11** | **Management wording editor** | Foundation consistency only | 10 |

### 8.2 Exit criteria — identical in every phase

1. The screen renders **every** element its frame specifies that is not a `REGISTERED-OMISSION`.
2. Every `REGISTERED-OMISSION` on that screen **still preserved**, item by item, each with its citation. ⚠️ **A phase that changes one has FAILED — revert and report.**
3. New projections **RLS-scoped and reviewed**; no client-side filtering standing in for authorization.
4. `tsc` **0** · `eslint` **0** · `build` **0** · **route census 17** unless a route is explicitly authorized.
5. **Emitted-CSS verification** of every new value, from the compiled stylesheet. ⚠️ **Runs every phase — Operator instruction, carried forward from Batch 3.**
6. **End-to-end**: the chain still completes from the trainer's first click to the parent's read.
7. `PASS` is the evidence verdict. **`Accepted` is Operator-set only.**

**Additionally, on the two Parent phases:** assert **structurally** that no rating, correction reason, revision number, content hash or correction-cycle disclosure reaches the surface. ⚠️ **Not by a bare rating-word regex** — A-052 prohibits that shape, and the four panels are prose that may legitimately contain *"mastered"* or *"eye contact"*.

---

## 9. ⚠️ PHASE 7 — the highest-risk phase, and its separation from the owed re-proof

### 9.1 Why it is the highest risk

`F-S6-REVIEW-1` writes **governed assessment substance** — `observations.follow_up_notes` — **from a surface that has never written it.** Every other deliverable in this plan is a read.

### 9.2 The design question, and the recommendation

`assessment_save_observation` already exists and performs a full-observation save with a `lock_version` CAS. **Two shapes are possible:**

| Option | Assessment |
|---|---|
| **(a)** Reuse `assessment_save_observation` from `/review`, round-tripping all nine ratings unchanged | ⚠️ **Not recommended.** It makes the client echo nine governed ratings back to the server, so a tampered client could alter a rating on what is nominally a note save. It also bumps `lock_version` and rewrites rating rows for a note edit |
| **(b)** ✅ **Recommended** — a narrow governed write that **reads the observation server-side and updates only `follow_up_notes`**, under the same live trainer/session authorization as the existing pair | **No rating ever round-trips through the client.** Satisfies §6's *"callable from both screens against the same column"* without widening what either screen may write |

⚠️ **(b) needs a new governed object, so it is a §12 stop-and-ask in its own right** — recorded here as a recommendation, **not** as a decision. It also inherits the **CP-2 / CP-4 audit boundary**: the standing operator ruling holds that **standalone observation persistence emits no Step 7H audit event**, and **the 16-action registry is not extended**. A note save must not silently advance the report lifecycle.

### 9.3 ⛔ Phase 7 must not absorb or obscure the owed Phase 6a re-proof

**They touch the same column. They are different claims, and they are proven independently.**

| | **The owed Phase 6a re-proof** | **Phase 7 / `F-S6-REVIEW-1`** |
|---|---|---|
| **Claim** | A follow-up note saved on screen `07` **appears as the next session's previous focus** | Screen `/review` **loads that value into an editable field and can save it back** |
| **Backs** | ⚠️ **`CLAUDE.md` §10 Phase 1 exit condition (c)** — a ratified phase gate | `CLAUDE.md` §6 |
| **Status** | ⛔ **OWED.** Attempted at Phase 6a, blocked at `CONT-A0`. Proven **statically only** — weaker, and **does not discharge it** | Not built |
| **Evidence** | `npm run test:continuity`, reaching `CONT-A0` and beyond | Phase 7's own end-to-end verification |
| **Needs a second session** | ✅ **Yes** — the fixture expansion (§7.2 step 5) supplies it | No |

⚠️ **Rules, binding on Phase 7:**

1. **The re-proof runs FIRST, on the code as it stands before Phase 7 changes anything.** Proving carry-over *after* adding a second write path proves the new path, not the original gate.
2. **Phase 7 passing is never evidence the re-proof passed, and the reverse.** Two separate verdicts, recorded separately.
3. **If Phase 7's write path makes the re-proof harder to run, that is a Phase 7 defect** — not a reason to retire the re-proof.
4. **Neither may be reported as discharging the other**, in any status record, log or handoff.

---

## 10. Prerequisites and carried blockers

| Item | Effect | Owner |
|---|---|---|
| ⛔ **`B-STAGE3-2`** | **Blocks every end-to-end verification here, and Phase 4's fixture breadth.** §7 states exactly what is needed | **Operator** |
| ⚠️ **The owed Phase 6a runtime carry-over re-proof** | Carried out of the closed reconciliation plan. Backs §10 Phase 1 exit (c). Blocked by `B-STAGE3-2`. **Kept separate from Phase 7 — §9.3** | Operator / Phase 7 |
| ⚠️ **`NOT-RUN` rendered captures on all ten authenticated screens** | Also carried forward. Need a reachable governed database — a §12 stop-and-ask. **The manual walkthrough is point-in-time and does not substitute** | **Operator** |
| **The `CLAUDE.md` §6 amendment draft** | Unapplied; may change what `F-S6-REVIEW-1` binds to. **Phase 7 should not start before it is ruled** | **Operator** |
| **Route additions on `19` and `33`** | Recorded as allowed expansion in their packs; **the census of 17 changes only under an authorization naming the route** | **Operator** |
| **Fixture expansion `P1-T09a`** | ✅ **Already written** and independently appliable. Needed for Phase 4's roster and for the continuity re-proof's second session | Operator, after §7.2 step 4 |

---

## 11. ⚠️ AUTHORIZATION MAP — every phase needs explicit authorization

| Phase | Governed surfaces touched | Authorization |
|---|---|---|
| **0A** | New reviewed read projection + RLS policy + its minimum matching grant | ✅ **EXPLICIT** |
| **0B** | ⚠️ **SCHEMA MIGRATION** — three columns on `class_sessions` | ✅ **EXPLICIT.** A §12 stop-and-ask in its own right; **the G-3 / G-6 rulings settle *whether*, not *that a migration may be written*** |
| **1 · 2** | ⚠️ **Parent** projection extension | ✅ **EXPLICIT** — the parent boundary is the most tightly drawn in the product; widening its DTO is a governance act, not a UI act |
| **3 · 4 · 5 · 6** | Trainer projection extension | ✅ **EXPLICIT** |
| **7** | ⚠️ **NEW GOVERNED WRITE PATH** to `observations.follow_up_notes` | ✅ **EXPLICIT — the highest risk in the plan.** See §9 |
| **8 · 11** | Presentation only | ✅ **EXPLICIT** for the G-1 disposition; no governed surface touched |
| **9 · 10** | Management projection extension | ✅ **EXPLICIT** — §5.5 exclusions re-checked field by field at exit |

**Every `CLAUDE.md` §12 stop-and-ask binds in addition.** No enum value, table or audit action string is added beyond what an authorization names. **The Step 7H registry stays at 16.**

---

## 12. Carried disciplines — proven in reconciliation

1. **`REGISTERED-OMISSION`s are preserved.** A phase that changes one has **FAILED** — revert and report — even if the result matches the frame better. ⚠️ **The eight rulings ADDED omissions** (G-2 ×4, G-3 ×2, G-4 ×3, G-7 ×1, G-8 ×1); they are protected exactly like the inherited ones.
2. **`NEW-QUESTION` is a HARD STOP**, never a judgement a phase makes about its own work.
3. **The `.html` export is a source of VALUES, never MARKUP.** No ported markup, absolute positioning, fixed pixel layout, export class names or lifted DOM. Copying structure is a phase failure.
4. ⚠️ **A declared class is not evidence it applied** — proven **twice, in two different ways**:
   - a rule **exists and loses** — an unlayered rule outranks every layered one, caught by a **static cascade audit**;
   - a rule **never exists at all** — `rounded-control` and `border-hairline` emitted nothing, and **no cascade audit can catch that**, because there is nothing to lose to.
   ▶ **The compiled-stylesheet check RUNS EVERY PHASE** — Operator instruction, carried forward explicitly.
5. ⚠️ **The frame-wins default never overrides an accessibility guarantee.** Screen `05` nearly proved this the hard way: matching the frame's card fill would have collapsed the eligibility chip into it and reduced **four** redundant carriers of state to three (SC 1.4.1). *Frame wins* is scoped to differences **no ratified rule speaks to** — and a ratified rule speaks whenever colour is doing load-bearing work.
6. **Governance outranks the frame, always.** Where they disagree the rule wins **and the divergence is recorded, never silently resolved.**
7. **Record what was dropped.** Silent truncation reads as "covered everything".
8. ⚠️ **AN ASSERTION CAN PASS BECAUSE THE OBJECT IT MEASURES DOES NOT EXIST — measure non-vacuity FIRST.** ✅ **Operator-recorded 2026-08-10 as the significant finding of Phase 1.** `S-8` could not have been closed earlier for a reason worth stating precisely: **with zero submitted reports the canonical gate denies EVERYONE**, so the DENY leg was **passing for the wrong reason**. It was never evidence the gate discriminates — only evidence there was nothing to discriminate over. ⚠️ **This is the same class as `bool_and` over zero rows and the inverted `CANONICAL_CONTAINERS` guard**, and it landed on **`G-5`, the one hero ruling that WIDENS disclosure** — the leg where a false green mattered most. ▶ **Every proof of a refusal must first measure that the thing being refused EXISTS.** Phase 1 proved it by constructing a genuinely `submitted` report; Phase 2's `P2-1` is a dedicated non-vacuity leg placed **before** its three refusal legs, and reports the row count it found. **A refusal suite with no permit leg is NOT-RUN wearing a PASS.**
9. ✅ **THE TRANSACTION-SCOPED PROOF IS THE ACCEPTED PATTERN FOR ANY PROOF NEEDING GOVERNED STATE.** ✅ **Operator-accepted 2026-08-10, and accepted as MATERIALLY DIFFERENT from `B-STAGE3-2` rather than merely more careful.** The difference is structural, not attitudinal: `B-STAGE3-2` **committed** governed mutations through the served app against the canonical database; this pattern constructs the state it needs **inside one transaction and ends in `ROLLBACK`**, and **plpgsql functions cannot `COMMIT` inside a transaction block**, so no governed RPC can escape it either. **The runner then measures the governed counts before and after and FAILS if any moved** — so "nothing was committed" is part of the **proof**, not an external observation. ▶ **Use this shape wherever a proof needs a report, a version or a lifecycle state that the fixture does not carry.** It needs no fixture reload, no Operator credential and no disposable stack — which is precisely why it closed a leg that had been blocked since Batch 3.
10. ⚠️ **A DELTA TABLE IS A READING OF A FRAME, NOT A MEASUREMENT OF THE BUILD — measure at HEAD before accepting this plan's own classification.** ✅ **Operator-recorded 2026-08-10 as the strongest result of the Phases 2–6 batch, and it came from a phase that built NOTHING.** §6.5 classified screen `07`'s only delta as **`NEEDS NEW PROJECTION`**; **measured at HEAD the rail already existed**, fed from `getSessionRosterCore`. A plan is written by reading frames against a **snapshot** of the build; the build moves and the plan does not. ▶ **Binding on every remaining phase.** Accepting `NEEDS NEW …` without measuring risks building a **second copy** of something that exists — worse than the gap it was meant to close. ⚠️ **And the converse binds equally: never manufacture a change to make a phase look productive.** Phase 5 delivered a proof instead — that the four hand-authored rail buckets **partition every status `pg_enum` actually holds**, which nothing had checked and which a ninth label would have broken **invisibly**. **Same family as §6.1a:** in both, a planning artefact was treated as authority over something it merely describes.
11. ⚠️ **A SEARCH IS EVIDENCE ABOUT THE CODE ONLY ONCE IT IS PROVEN DISCRIMINATING.** ✅ **Operator-recorded 2026-08-10 after three mis-scoped searches in one day, in three directions:** a **false MISSING** (the emitted-CSS grep at the authored precision — the minifier rounds to six decimals *and* strips the leading zero), a **false FAIL** (a region regex bounded by the first `\n}\n`, which captured only a parameter list), and a **false VIOLATION** (`/Overall Grade/i`, which matched the screen's own sentence saying the grade is deliberately **not** shown — **the A-052 failure exactly: a bare keyword match rejects legitimate prose, and a screen that EXPLAINS an omission necessarily names it**). ▶ **Every absence or region assertion must carry a leg that proves the search itself** — that the region really is the region, or that the matcher finds an instance that IS present. **An absence assertion over an empty string, or on a broken pattern, passes perfectly.** Same family as §12 item 8.
12. ✅ **WHEN A GOVERNED REFUSAL BLOCKS A PROOF, RE-POINT THE PROOF AT THE PATH THE APPLICATION ACTUALLY USES.** ✅ **Operator-recorded 2026-08-10 as the pattern.** Phase 4's `P4-4` read `observations` **directly** as `authenticated` and got `permission denied` — `authenticated` holds **no table grant** there, deliberate deny-by-default (A-030: privilege and policy are separate layers), and the roster reads the carry-over through `assessment_get_trainer_observation`. ⚠️ **Granting `SELECT` would have weakened the thing that refused**, which `CLAUDE.md` §12 names explicitly. ▶ **Reading through the RPC proved the boundary where it really lives, on the real read path — strictly STRONGER evidence than the leg that was refused, not a workaround for it.**
13. ⚠️ **A SCAN OVER SOURCE READS THE PROSE THAT DOCUMENTS THE CODE — FIVE TIMES IN THIS BATCH, FROM ONE ROOT.** `P6-4` matched the screen's own sentence saying the grade is deliberately not shown; `H7-6` matched the migration's comment listing what the function does *not* write; and `P9-10` failed on **eight of ten legs** because the DTO's comment RECITES §5.5's exclusion list. ▶ **Strip comments before scanning, and prove the scan discriminating against something that IS present.** The pattern is not tidiness: an unstripped scan measures the promise instead of the thing promised, and it fails **green** as readily as red.
14. ⚠️ **A PINNED CENSUS IN ONE PHASE'S PROOF GOES STALE THE MOMENT A LATER PHASE LEGITIMATELY ADDS AN OBJECT.** `prove:hero-2`'s `P2-6` pinned **41 functions**; Phase 7 added one under a bounded authorization, and the failure surfaced at the **Phase 9** boundary rather than the Phase 7 one. ⛔ **Do not relax such a pin to `>=` and do not delete it** — its whole value is that moving the number forces someone to name the authorization that moved it. ▶ **Re-run EVERY earlier proof at each phase boundary, not only the ones whose surface you touched.**
15. ⚠️ **A BARE-WORD MATCH OVER A GOVERNED VOCABULARY IS PROHIBITED IN A TEST FOR THE SAME REASON A-052 PROHIBITS IT IN A LEAK GUARD.** `P10-3`'s `/term/` matched the sentence *refusing* term — contradicting `P10-4c`, which requires it — and `/audience/` matched **`audience_awareness`**, the ninth dimension (§5, A-054; G-06 refused narrowing that very term). ▶ **Match a RENDERED SHAPE — a label, a control, a field name — never a word.** A check that fires on the prose documenting compliance is not measuring compliance.
17. ⛔ **NEVER DECIDE A SUITE'S VERDICT BY MATCHING ITS OUTPUT — EXIT CODE IS THE ONLY VERDICT.** A harness that **failed to parse** printed `RESULT: PASS` to a grep-based sweep, because Node's SyntaxError report echoes the offending source line and that line **was the success message**. ⚠️ **The defect was in the INSTRUMENT, not the measured object**, so it would have contaminated every boundary the sweep ran at. ▶ Use **`npm run prove:hero-all`**: exit-status only, plus a leg that fails any suite exiting 0 while printing a failure. A non-zero exit with no output is a **FAILURE**, never a pass. ✅ **Operator-recorded 2026-08-11: this mechanism is the right closure, and it APPLIES TO EVERY FUTURE SUITE.** A new proof is added to `prove-all.mjs`'s list as part of writing it — a suite outside the exit-code sweep is a suite whose verdict nobody is checking.
18. ✅ **WHEN A GOVERNED GATE BLOCKS A REUSE, BUILD A DIFFERENT READ — THEN PIN MECHANICALLY THAT THE GATE SURVIVED.** ✅ **Operator-recorded 2026-08-11 as the pattern.** Phase 9 wanted four fields `report_get_canonical_context` returns exactly, and that function is gated on `latest_submitted_version_id IS NOT NULL`; two of `29`'s three queue modes never have one. ⛔ **Dropping the precondition would have weakened a governed read three roles share, to solve a problem management does not have.** A narrower instrument was built instead — and, critically, **`P9-3` asserts the original precondition is STILL PRESENT**, so §12's *"never work around a fail-closed refusal by weakening the thing that refused"* is **checked by the suite rather than promised in a comment**. ▶ **Refusing to widen is only half the pattern; the other half is leaving behind a check that would fail if someone later widened it.** *(Companion to item 12, which covers re-pointing a proof at the real path; this covers re-pointing the CODE.)*
19. ⛔ **A PROOF THAT READS TEXT CANNOT TELL YOU THE TEXT IS REACHABLE.** `prove:hero-13` passed **17 legs** against a file `tsc` rejected with six errors — the strings it asserted were present *were* present, in code that could not compile. ⚠️ **Pair it with item 17: those two defects define one family — THE INSTRUMENT AGREED WITH ITSELF WHILE THE THING UNDER TEST WAS INERT** (there the harness never parsed; here the subject never compiled), and **neither mechanism catches the other's defect**, since hero-13 exited 0 and a reachability gate would not have run at all in a harness that never parsed. ▶ Every source-reading suite calls **`assertReachable()`** first (`scripts/tests/hero/reachability-gate.mjs`): live `tsc --noEmit`, plus proof that `.next/BUILD_ID` — written only on a **successful** build — post-dates the newest source. **Proven discriminating** by a deliberate type error that made both legs fail; *a gate never seen to fail is a gate nobody has tested.*
20. ⛔ **NEVER PLACE A PIPE BETWEEN A VERDICT AND THE DECISION THAT CONSUMES IT.** Immediately after committing the exit-code discipline, I ran `npm run prove:hero-all --silent 2>&1 | tail -2 && git commit` — **a pipeline's exit status is the LAST command's**, `tail` succeeded, and a commit was made over a **failing** sweep. ⚠️ The rule was right and the mechanism was right; a filter between them defeated both, which is matching stdout one layer out. ▶ **Redirect to a file and test the exit status.** *(The failing suite was `Q-7`'s count pin, firing exactly as designed.)*
16. ⛔ **AN OMISSION'S STATED REASON MUST SAY WHETHER IT ENDS WHEN DATA ARRIVES, OR NEVER ENDS.** ✅ **Operator-recorded 2026-08-11 as a rule, not an observation.** A data-availability omission and a ruled omission are **INDISTINGUISHABLE ON A RENDERED PAGE** — both are simply absent — so the *reason* is the only thing carrying the difference, and a reason that does not state its own permanence is a defect even when the omission is correct. ⚠️ **"The projection carries no term field" IMPLIES THE FILTER WOULD EXIST IF THE DATA DID.** That sentence is how a permanent refusal gets quietly reclassified as a temporary gap, and the next phase then "completes" it in good faith. **Two instances this batch, one shape:** the `29` disabled Term chip, and `19`'s Report Details note claiming Lesson was uncarried after Phase 9 had made it carried. ▶ **When a phase makes data available, re-read EVERY omission note on that surface** — and write each reason so a stranger can tell a `REGISTERED-OMISSION` from a pending dependency without consulting a ruling.
13. ⚠️ **New, from §4.1: read the numbered pack's `screen.md`, not only the `/reference/` artefacts.** Its *Prohibited invention* and *Dependencies* sections carry governance the `.png` and `.html` cannot. **Not reading it cost this plan one prohibition and one already-registered dependency at first drafting.**

21. ⚠️ **"CAN FAIL" AND "DID FAIL" ARE DIFFERENT MEASUREMENTS, AND ONLY THE SECOND IS EVIDENCE.** Repairing `run-integration.mjs:517` began with a static scan reporting **49** leg ids where a `fail()` and a `pass()` share an identifier — a number that reads alarming and is nearly meaningless, because most guard the `pass` behind an `if/else` chain. **In the actual run exactly ONE id printed both**, and a second leg that failed in the same run printed no `PASS` at all. ▶ **A structural possibility is a hypothesis; the observed run is the measurement.** Report what happened, and cite what *could* happen only as a separate, labelled claim. *(This cuts both ways: it is also why `Q-7e` and the `DURING-COUNTS` leg exist — a check pinned at zero must be shown able to reach non-zero, or its zero is the same empty claim.)*

22. ⛔ **A TEST THAT BORROWS ITS SUBJECT DEPENDS ON EVERY OTHER USER OF THAT DATABASE.** `prove:hero-1/2/7/9` selected a fixture pair with `ORDER BY … LIMIT 1` and inserted a report for it. One manual walkthrough by the Operator created reports for those pairs and all four failed with **zero legs executed** — not because anything under test was wrong. ▶ **Mint the subject; do not borrow it.** A row created a statement ago cannot already be in a state someone else put it in, and the rollback-based non-mutation proof survives untouched. ⚠️ Isolation by **clone** is not the same thing: a `TEMPLATE` copy inherits the very state you are trying to escape, and costs the byte-unmoved proof.

23. ⚠️ **A BULK EDIT KEYED TO PROSE APPLIES TO WHATEVER HAPPENED TO SHARE THE PROSE.** The discriminating leg was inserted into four runners by matching each one's byte-unmoved line; two word theirs differently and were **silently skipped**, leaving the tautology they were meant to close — while their SQL dutifully emitted the marker nothing read. ▶ **Verify a bulk edit by COUNTING the result in every target, never by trusting the patch's own report.** The tool's silence is not the tool's success.

24. ⛔ **WHEN A RULING IS SUPERSEDED, STATE WHETHER THE *SUBJECT* CHANGED AS WELL AS THE OUTCOME.** `G-8` refused **CLASS video evidence**; `D-5` authorizes **PER-CHILD evidence** — one child, their own report, tagged to one session. Annotating it as *"reversed"* and stopping there would have been true about the verdict and **catastrophically false about the scope**: the next reader would have taken class footage as permitted, on a surface whose frame still draws exactly that uploader. ▶ **A reversal answers "is it allowed now?"; it does not answer "is it the same thing?"** Write the subject delta first, then the verdict. *(The same applies in the other direction: `G-4`'s refusal was reasoned against building a substrate **to render a label** — `D-3` builds it because the **calendar needs the structure**. The question changed, not just the answer.)*

25. ⛔ **AN ANNOTATION INSERTED INTO A TABLE SPLITS IT, AND THAT DAMAGE IS INVISIBLE IN A SUMMARY.** The `A-038` annotation landed between the Management and Parent rows of the role-visibility table, orphaning the Parent row — in a **ratified amendment**, where a row that stops rendering is a governance boundary that stops being read. It was caught only because the Operator required the **diff** rather than a description. ▶ **Standing check after any structured-document edit:** scan every touched file for a table row followed by a blank line or a blockquote followed by another table row, and treat a hit as damage. Cheap, mechanical, and it belongs beside the encoding checks in `CLAUDE.md` §11 — *the file parses* and *the file still renders what it says* are two different claims.

---

## 13. What this plan deliberately does not do

- It **builds nothing and authorizes nothing.** No phase has been started.
- It does **not** re-open a ruled collision, and does **not** design around one.
- It does **not** schedule portal completion — screens `11` and `30` included.
- It does **not** pull into scope: evidence media (G-8), a term entity (G-4), an Overall Grade (G-2), lesson-plan focus or slides (G-3), or the TA persona (G-7).
- It does **not** commission frames for the three unframed surfaces (G-1), and does not treat their absence as a gap.
- It does **not** claim any screen is close to acceptance. **Visual acceptance remains `Not started` for all 36**, and this plan changes that for none of them.


---

## 12A. CARRIED DISCIPLINES — added 2026-08-12 under a bounded Operator instruction

*These extend §12's carried disciplines. Process only; no product rule changes.*

### D-26 ⛔ THE STALE-RESTATEMENT DEFECT — NINE INSTANCES, ONE SHAPE

**The cause is always the same: a fact is recorded in MORE THAN ONE PLACE, and only ONE of them is corrected.** It is never exotic and never a reasoning failure — it is a **propagation** failure.

**Where it has appeared, and the range is the point:** in **ratified authority** · in **source comments** · in **test pins** · in **operator-facing text** · and **twice in the artifact built to prevent it**, in consecutive regenerations. ▶ **No document class is immune, including the ones written specifically to catch it.**

⚠️ **A propagation run is not complete until the RESTATEMENTS have been swept for across the tree** — not against the list the run was handed. **The Operator's list has been incomplete three times.**

### D-27 ⛔ THE NINTH INSTANCE — IT REPRODUCED INSIDE THE CORRECTION FOR THE EIGHTH

**Recorded verbatim, because it is the argument for `CLAUDE.md` §15.8.1 and nothing weaker would do.**

While correcting the eighth instance, the session amended a `CLAUDE.md` table row so its opening read **"EXACTLY THREE STRINGS"** while its **tail still read "it ratifies two strings"** — and the same cell carried a duplicated `evidence.deleted` clause whose rationale had itself lapsed. **A fact recorded twice in a single table cell, corrected once.**

▶ **If it can happen INSIDE the correction for the eighth instance, written by the party who had just diagnosed the pattern, in the same edit, then NO AMOUNT OF CARE SUBSTITUTES FOR A MECHANICAL CHECK.** It was caught only because the diff was read before committing — **not** because the author was being careful. They were being as careful as it is possible to be, having just written the diagnosis.

### D-28 ⛔ THE HARDEST CASE: TWICE WITHIN ONE SENTENCE, ROW OR CELL

**A fact recorded twice inside a single sentence, table row or cell is the hardest case of all** — harder than the same fact in two files.

⚠️ **The reason is a property of reading, not of diligence: a reader correcting such a row HAS ALREADY SEEN the other half, and does not re-read it.** Having just parsed the row to locate the error, they treat the rest as known. **Proximity defeats the check that distance would have triggered.**

**Observed twice on the same day:** the `A-057` cell above, and both `R-4a` rows in `PORTAL_COMPLETION_PLAN.md`, whose fronts were corrected while their tails still asserted *"the live registry is still 16"*. ▶ **When correcting any row, re-read the WHOLE row afterwards, mechanically.**

### D-29 A RAW SWEEP CANNOT REACH ZERO UNDER ANNOTATE-NEVER-DELETE

**The method PRESERVES the struck text, so raw string hits are expected to RISE after a correction pass** — measured 23 → 29, every added hit a correction. **Reporting that as failure is as wrong as reporting a raw zero as success.**

**Classify `LIVE` / `ANNOTATED` / `EXEMPT`, and GATE THE RUN on a control that separates a live claim from an annotated one.** Every exemption carries its stated reason. **A classifier that has never been seen to distinguish is not known to distinguish.**

### D-30 ⛔ REMOVE THE LITERAL — NEVER WIDEN THE CLASSIFIER AROUND IT

When a detector fires on your own prose, **delete or rephrase the offending literal.** ⛔ **Do NOT add an exemption, an anchor exception or a nearby marker to quiet it.**

**Annotating a detector into silence is how a gate stops measuring** — and the exemption always looks locally reasonable, which is why it gets accepted. *(Observed: a typographic flourish embedding a size literal re-triggered the sweep; the fix was to remove the flourish.)*

### D-31 MEASURE THE BUILD, NOT THE FRAME, BEFORE CLAIMING A PHASE NEEDS SCHEMA

**A delta table is a reading of a frame, not a measurement of the build.**

**`P2-1` classified `NEEDS NEW SCHEMA` from the frame; measurement at HEAD showed management `SELECT` policies AND matching `authenticated` grants already existed on all six tables it reads.** ▶ **Scoping from the frame would have spent an Operator schema authorization on nothing.**

⚠️ **Check POLICY and GRANT separately** — they are two layers, and a present policy with no grant reads as an RLS failure (`A-030`).
