# B.E.S.T Coach — 48-Hour Physical-Test Slice Contract

> ## ⚠️ HISTORICAL_PROCEDURAL_EVIDENCE — added 2026-08-08 (Phase A2, S-58/S-59; operator ruling Q-13)
>
> **Classification: `HISTORICAL_PROCEDURAL_EVIDENCE` for the accepted 48-hour sprint. This is NOT the current Final MVP execution contract.** The current execution contract will be `FINAL_MVP_EXECUTION_PLAN.md` (not yet created). Preserved in full.
>
> **What is stale and must not be acted on:** the claim that ***"No implementation exists today"***. Twelve migrations and 34 functions are at HEAD, and the two assessment RPCs this file says do not exist **do** exist (`supabase/migrations/20260806090000_assessment_governed_persistence.sql`). The competency vocabulary is likewise **ratified AND implemented** — V2/V3 both landed 2026-08-06.
>
> **What is NOT stale and must not be "corrected":** the phrase *"the ratified Step 7I counts of **5 migrations, 28 functions and 75 tests**"* is a **correctly-scoped frozen Step 7I snapshot** and is accurate in that frame. Do not rewrite it to the current 12/34 — see the banner in `STEP_7I_REPORT_LIFECYCLE_BASELINE.md`.

**Status:** ~~Shared implementation contract~~ **HISTORICAL_PROCEDURAL_EVIDENCE** — created 2026-08-05 (Asia/Singapore).
**Purpose:** Pin the exact shared boundary between the backend workstream (Claude Code) and the frontend workstream (Codex) so a locally runnable, desktop-first, synthetic-data vertical slice can be delivered in two focused days and used for a supervised physical test.

> **Amendment 006 supersession note — appended 2026-08-05 23:20 (Asia/Singapore). No accepted contract row was rewritten.**
>
> **The competency-rating vocabulary is now `Beginning` → `Developing` → `Mastering` → `Mastered`** (storage `beginning`, `developing`, `mastering`, `mastered`), ratified by `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_006.md` **A-049**. The §7 `rating` union has been updated in place because it is an **active shared contract** that both workstreams build against; **behavioural anchors and polarity bands are unchanged** (A-050, A-051), so the DTO shape, the anchor requirement and the polarity union are all unaffected.
>
> **Any remaining `emerging` / `secure` / `advanced` competency-rating label elsewhere in this contract is superseded and historical.** **Class Grade (`beginner` / `intermediate` / `advanced`) is a different vocabulary and is unchanged** (A-054).
>
> The vocabulary is **ratified but not yet implemented** — no backend, frontend, fixture, generated type or test has changed. See `docs/plan/COMPETENCY_VOCABULARY_RECONCILIATION_PLAN.md`; checkpoints **V2** and **V3** each require their own authorization.

---

## 0. Precedence — this document is subordinate and can override nothing

**This contract sits below every governing document and cannot amend, relax, reinterpret or supersede any of them.**

**Precedence (highest first), unchanged from `CLAUDE.md` §1:**

> Specification v3 → ratified amendments (Amendment 001 → 002 → 003 → 004 → **005**, for the clauses each names) → `CLAUDE.md` → `docs/plan/BEST_Coach_Implementation_Plan.md` → Figma Design 2 (visual/interaction reference) → `docs/progress/STATUS.md` → `docs/progress/BUILD_NOTES.md` → temporary migration tracker → **this contract**.

The governing documents this contract is derived from, and is bound by:

| Document | Binds |
|---|---|
| `CLAUDE.md` | The standing build contract, the four §4 non-negotiables, the §12 stop-and-ask list, module boundaries, testing stack, git discipline, session continuity |
| `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_004.md` (**A-033 … A-040**) | The two-stage governed workflow, the eight-value status set, the management editing boundary, return-to-trainer, dual approval provenance, role-specific read models, notification triggers, the exhaustive Step-7I-only additive schema set |
| `docs/plan/STEP_7I_REPORT_LIFECYCLE_BASELINE.md` (**R-1 … R-33**) | The exact lifecycle RPC inventory, transition set, CAS/idempotency discipline, authorization predicates, return shapes, audit mapping and the 75 acceptance tests |
| `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_005.md` (**A-041 … A-048**) | The ratified **36-screen** visual-reference inventory, the **canonical routes**, the **exact twelve-screen physical-test subset**, the **24 deferred portal screens**, the **visual-authority precedence**, and the rule that **Figma never bypasses governance** |
| `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` | The per-screen record for all 36 screens and the **route-compatibility register** — subordinate to Amendment 005 |
| `docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md` | The per-screen-family planning rows, the readiness gate, the **§0.2 ratified 36-screen node mapping**, and the **eight blocked design families** |
| `docs/plan/BEST_Coach_Implementation_Plan.md` | The procedural execution and review script |
| `docs/spec/` Amendments 001, 002, 003 and Specification v3 | Everything else |

**Three consequences, stated plainly:**

1. **Where this contract and a governing document disagree, the governing document wins**, and the disagreement is reported as a blocker under §9 rather than resolved locally.
2. **This contract authorizes no checkpoint.** The named schema/migration checkpoints (**7I2A … 7I2G**, then **7J**) keep their identities and their separate-authorization requirement. `CLAUDE.md` §12's stop-and-ask list remains fully in force for both agents, in full, at all times.
3. **This contract adds no governance.** It pins *coordination* — route names, action names, DTO shapes, file ownership, round order and integration order — so two agents working in parallel converge. Every governance rule it restates is a restatement, not a source.

---

## 1. Objective

Within two focused days, deliver a **locally runnable, desktop-first, synthetic-data vertical slice** sufficient for a supervised physical test of the complete governed report lifecycle:

```
Trainer assessment
  → AI draft
    → trainer review / edit
      → trainer approval            (does NOT publish)
        → management review
          → management wording edit  OR  return to trainer
            → trainer correction or explicit reaffirmation → trainer reapproval
              → management Approve & Submit   (the only publication)
                → parent canonical submitted-report view
```

### 1.1 The participant-test path must be real

For the walkthrough participants actually perform, all of the following are **real**, not simulated:

- **real local authentication** — Supabase Auth against the local stack, three synthetic identities, no cosmetic login;
- **real local persistence** — the local disposable Supabase database, real rows, survives reload;
- **real lifecycle RPCs and server boundaries** — the Step 7I RPCs called through `server-only` server actions using the request-scoped authenticated client;
- **real authorization** — server-derived role and centre authority from live account/membership/relationship rows, never from a query parameter, a token claim or a UI condition;
- **real audit events** — appended in the same transaction as their business write, hash-chained, verifiable;
- **real AI generation and deterministic grounding** — a real model call with the full grounding-validation pipeline in front of it (`CLAUDE.md` §4 non-negotiable 1).

### 1.2 The fixture adapter is a development tool, not the test path

A deterministic fixture adapter **may** be used to accelerate frontend development and to drive automated UI-state tests (loading, empty, validation, error, success, disabled, denied).

**It must not be the primary participant-test path.** Acceptance gate **G-19** (§13) requires the primary walkthrough to run with fixture mode off. The adapter must be selectable only by an explicit, non-default development switch, and must be impossible to enable from a participant-facing surface.

---

## 2. Included scope

### 2.1 Trainer

| # | Item |
|---|---|
| T-1 | Login and **server-derived** role resolution |
| T-2 | Trainer dashboard and assigned-session entry |
| T-3 | Session roster with per-student report state |
| T-4 | The **nine governed B.E.S.T dimensions** — all mandatory, rubric anchors surfaced, no Quick mode, no four-dimension path (A-017) |
| T-5 | Observation persistence (ratings, notes, follow-up) |
| T-6 | AI generation **loading**, **failure** and **retry** states |
| T-7 | Four-panel report review |
| T-8 | Trainer wording edit |
| T-9 | Three-item Quality Checklist (Evidence confirms rating · AI Draft reviewed · Privacy check passed) |
| T-10 | **Trainer approval without publication** (`draft_ready \| needs_edit → trainer_approved`) |
| T-11 | Returned-report queue (`?status=needs_edit`) |
| T-12 | Correction **or** explicit reaffirmation naming the open correction request (A-035/A-036) |
| T-13 | Fresh checklist and trainer **reapproval** |

**T-4 anchors:** Body (Posture & Gesture) · Emotion (Facial Expression) · Speech (Clarity & Structure) · Tonality (Voice Control) · Eye Contact · Vocal Projection · Emotional Expression · Sentence Flow · Audience Awareness. Scale: `Emerging` → `Developing` → `Secure` → `Advanced`. Polarity bands: Emerging = `needs_support`; Developing = `developing`; Secure/Advanced = `positive`.

**T-12 is not optional politeness.** A management return creates no version and moves no pointer, so the frozen trainer-approved version can never be reapproved. Reapproval always runs through a **new immutable version**. Where the trainer inspects the flagged item and finds it already correct, the new version may be byte-identical in content — but **only** as an explicit reaffirmation naming the open correction request. A silent byte-identical save is rejected server-side.

### 2.2 Management

| # | Item |
|---|---|
| M-1 | Pending-final-review queue (`?status=trainer_approved`) |
| M-2 | **Safe** trainer-approved candidate view |
| M-3 | Four-panel **wording-only** edit |
| M-4 | Bounded return-to-trainer dialog (issue scope · affected dimension where scope is a rating · bounded reason) |
| M-5 | Correction tracking (`?status=needs_edit`) |
| M-6 | Final **Approve & Submit** — the only publication |

**Management must never directly edit** — ratings · observations · attendance · evidence · trainer notes · assessment facts · AI history · checklist internals. Any of these is a **return-to-trainer** case, never a management edit. The boundary is enforced by the server and by the DTO shape, never by hiding a control.

### 2.3 Parent

| # | Item |
|---|---|
| P-1 | Report-available state |
| P-2 | Submitted-report list |
| P-3 | Canonical submitted detail |
| P-4 | Loading state |
| P-5 | Empty state |
| P-6 | Linked-but-unavailable state |
| P-7 | Non-disclosing denied state |

**Parents see only the submitted canonical report** — the version `reports.latest_submitted_version_id` names, for students reachable through a live `parent_student_links` row. **No per-dimension rating grid, in any form or wording.** A returned or preapproved report is never parent-visible, and nothing in any parent surface may disclose that a correction cycle is underway.

---

## 3. Deferred scope — explicitly out of the physical-test slice

- TA workflow
- Evidence upload and signed URLs
- Analytics and broad statistics
- External email, SMS and push delivery
- Multi-centre UI
- Production deployment
- Broad calendar work
- Full mobile refinement
- Nonessential Figma screens — **made exact by Amendment 005 A-044: the 24 portal screens listed in §4.4, none of which may be required to be visually complete before the physical test**
- Post-submission correction initiation
- Full operational PDPA tooling

**Notifications, precisely.** Durable **in-app** queue, badge or banner states are **sufficient** for the physical test — a management surface must be able to discover a report awaiting review, a trainer must be able to discover a returned report, and a parent must be able to discover an available report. **External notification delivery remains deferred.** Recipient sets are resolved live at read time from active memberships, assignments and links (the §8.5 rule of the Step 7I baseline) — never cached, never from a token claim.

Deferring an item **deletes no safeguard**. Every Amendment 001 evidence control, every PDPA obligation and every privacy rule applies in full whenever the deferred work is implemented.

---

## 4. Route contract

These route families are pinned. Neither agent may rename, add or restructure a route family without a §9 blocker.

| Route | Flow |
|---|---|
| `/login?role=trainer` | Auth |
| `/login?role=management` | Auth |
| `/login?role=parent` | Auth |
| `/trainer` | Trainer dashboard |
| `/trainer/sessions/[sessionId]/roster` | Trainer roster |
| `/trainer/sessions/[sessionId]/students/[studentId]/assess` | Nine-dimension assessment |
| `/trainer/reports/[reportId]/generate` | AI generation loading / failure / retry |
| `/trainer/reports/[reportId]/review` | Four-panel review, checklist, approve |
| `/trainer/reports/[reportId]/edit` | Trainer wording edit |
| `/trainer/reports?status=needs_edit` | Returned-correction queue |
| `/management` | Management dashboard |
| `/management/reports?status=trainer_approved` | Pending final-review queue |
| `/management/reports?status=needs_edit` | Correction tracking |
| `/management/reports/[reportId]/review` | Safe final-review candidate |
| `/management/reports/[reportId]/edit` | Wording-only editor |
| `/parent` | Parent dashboard / availability |
| `/parent/reports` | Submitted-report list |
| `/parent/students/[studentId]/sessions/[sessionId]/report` | Canonical submitted detail |

**The `role` query parameter selects presentation only.** It is a rendering hint for the login screen and carries **no authority whatsoever**.

**Authority always comes from the authenticated server session and live domain membership** — `auth.uid()` → `accounts.auth_user_id` → an **active** `centre_memberships` row → the live relationship (class-session assignment for trainers, centre for management, `parent_student_links` for parents). A route that renders a role's surface must independently prove that role server-side; rendering is never a permission.

**Route-vs-RPC note.** The canonical read RPC is keyed on `(class_session_id, student_id)`, not on `report_id`. The parent detail route matches that key directly. The trainer and management `[reportId]` routes must resolve the report's session/student pair server-side and call the RPC with that pair — the report id is a routing convenience, never a substitute for the authorization predicate.

### 4.1 Relationship to the ratified canonical routes (Amendment 005 A-042)

**Amendment 005 ratifies a canonical route for each of the 36 final-MVP screens. Several differ from the routes pinned above. Both are correct, for different purposes, and neither is withdrawn here.**

- **The routes pinned in §4 are the routes the physical test runs on.** They were built to this contract and remain correct against it. **This checkpoint renames, adds and restructures nothing**, and no route code was changed.
- **The canonical routes are the final-MVP target.** The per-screen reconciliation — every mismatch, with one treatment each (move to canonical · preserve as redirect · preserve as alias · replace after integration · operator decision required) — is `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` §7. **Executing any treatment requires its own authorization** and is **not** part of the 48-hour slice.
- **The `role` query parameter still selects presentation only** and carries no authority whatsoever (A-046). Unchanged.

### 4.2 The exact twelve-screen visual subset (Amendment 005 A-043)

**Exactly twelve visual-reference screens block this physical test.** This is a **visual-reference subset, not an expansion of this contract's scope** — §2's included scope and §3's deferrals are unchanged.

| Flow | Screen ID | Screen | Canonical route | Route this test runs on |
|---:|---|---|---|---|
| 1 | AUTH-01 | Trainer Login | `/login?role=trainer` | `/login?role=trainer` |
| 2 | 05 | Trainer Schedule | `/trainer/schedule` | — (session selection folded into `/trainer`) |
| 3 | 06 | Trainer Student Roster | `/trainer/schedule/[sessionId]/student-roster` | `/trainer/sessions/[sessionId]/roster` |
| 4 | 07 | Trainer Grade Student | `/trainer/schedule/[sessionId]/student-roster/[studentId]/grade-student` | `/trainer/sessions/[sessionId]/students/[studentId]/assess` |
| 5 | 08 | Trainer AI Report Generation | `/trainer/schedule/[sessionId]/student-roster/[studentId]/grade-student/ai-report-generation` | `/trainer/reports/[reportId]/generate` |
| 6 | 10 | Trainer Student Report | `/trainer/reports/[reportId]` | `/trainer/reports/[reportId]/review` |
| 7 | AUTH-02 | Management Login | `/login?role=management` | `/login?role=management` |
| 8 | 29 | Management Reports | `/management/reports` | `/management/reports` |
| 9 | 19 | Management Student Report | `/management/students/[studentId]/reports/[reportId]` | `/management/reports/[reportId]/review` |
| 10 | AUTH-03 | Parent Login | `/login?role=parent` | `/login?role=parent` |
| 11 | 32 | Parent Reports | `/parent/reports` | `/parent/reports` |
| 12 | 33 | Parent Class Report | `/parent/reports/[reportId]` | `/parent/students/[studentId]/sessions/[sessionId]/report` |

**The complete governed workflow this subset walks — trainer approval is never abbreviated away:**

```
Trainer sign-in
  → session selection
    → roster
      → student assessment
        → grounded AI report generation
          → Trainer review / edit / checklist / approval   (publishes NOTHING)
            → Management sign-in
              → Management queue
                → Management wording edit, return to trainer, or final Approve & Submit
                  → Parent sign-in
                    → Parent submitted-report list
                      → Parent canonical report detail
```

This is the §1 lifecycle stated at screen granularity, not a second workflow. **Trainer approval commits `draft_ready | needs_edit → trainer_approved`, freezes the version and publishes nothing; management's Approve & Submit is the only publication** (A-033/A-036). Where management returns a report, **the trainer owns the correction and reapproves through a new immutable version** — a silent byte-identical save is rejected (T-12, A-035).

**One open decision, recorded and not made here.** **ID 05 Trainer Schedule has no implemented route** — session selection currently happens on the trainer landing surface. Either accept that fold for this test, or build `/trainer/schedule` before it. Recorded as Amendment 005 **U-A5-1** and inventory §7.3. **Adding the route is a §9 blocker under this contract, not an agent decision.**

### 4.3 The external frozen UI-reference pack

**The frozen visual references live in an external UI-reference pack, not in this repository.** The pack will scaffold **all 36 folders** — `AUTH-01-trainer-login` … `AUTH-03-parent-login` and `01-trainer-dashboard` … `33-parent-class-report` — one folder per screen, each holding that screen's frozen `reference.png`.

- **Only the twelve core screenshots above are required immediately.** The other 24 folders may be scaffolded empty.
- **Visual authority is `UI_REFERENCE_FINAL_MVP/reference/<mapped pack>/` → the governed pack's optional frozen local `reference.png` duplicate → node-specific Figma context (only where no ratified asset exists) → existing frontend implementation** (A-045, **reconciled 2026-08-08** — Authority Lock §2.4 / §28.1a). ~~Visual authority is frozen `reference.png` → node-specific Figma context → existing frontend implementation~~
- **No visual asset enters this repository without a recorded `PORT` / `REFERENCE ONLY` / `REBUILD` / `REJECT` / `NOT APPLICABLE` disposition** (A-013 discipline, carried by A-022.2). **No screenshot has been captured yet.**

### 4.4 The other 24 portal screens are post-physical-test scope

**The remaining 24 portal screens — 01 · 02 · 03 · 04 · 09 · 11 · 12 · 13 · 14 · 15 · 16 · 17 · 18 · 20 · 21 · 22 · 23 · 24 · 25 · 26 · 27 · 28 · 30 · 31 — are `Post-48-hour final-MVP scope` (A-044).** They are **required for the final MVP** and **must not be required to be visually complete before this physical test**, must not appear in any acceptance gate of §13, and must not be reported as physical-test blockers. **Deferral deletes no safeguard.**

**This contract is not expanded to all 36 screens.** Its included scope stays §2; its deferrals stay §3.

---

## 5. Shared frontend/backend boundary

### 5.1 Write actions — exact names and responsibilities

Each is a `server-only` server action using the request-scoped authenticated Supabase client (`server/platform/supabase/request.ts`). None adds authority of its own; each validates request *shape*, passes expected-state values through, calls the RPC, and maps authored SQL errors to a `UiActionResult<T>`.

| Action | Role | Underlying RPC | Responsibility |
|---|---|---|---|
| `saveObservation` | Trainer | assessment write path + `report_create` (RPC-1) + `report_mark_observation_saved` (RPC-2) | Persist all nine ratings, notes and follow-up; create/advance the report aggregate. **Gated by checkpoint CP-2 (§10).** |
| `requestDraft` | Trainer | `report_request_draft` (RPC-3) → provider call → grounding → trusted channel to `report_store_draft` (RPC-4) or `report_cancel_draft` (RPC-5) | Synchronous generation with the full grounding pipeline; failure must not leave a false `draft_ready` |
| `saveTrainerEdit` | Trainer | `report_save_edit` (RPC-6) | New immutable version; carries the reaffirmation argument when the four panels are byte-identical to the current candidate |
| `updateTrainerChecklist` | Trainer | `report_update_checklist` (RPC-7) | Version-scoped checklist; emits no audit event; never bumps `lock_version` |
| `trainerApprove` | Trainer | `report_trainer_approve` (RPC-8) | `draft_ready \| needs_edit → trainer_approved`; freezes the version; **publishes nothing** |
| `managementEditWording` | Management | `report_management_edit_wording` (RPC-9) | New version from the four parent-facing panels **and nothing else**; status-preserving |
| `managementReturnToTrainer` | Management | `report_management_return_to_trainer` (RPC-10) | `trainer_approved → needs_edit`; opens exactly one correction request; moves no pointer |
| `managementApproveAndSubmit` | Management | `report_management_approve_and_submit` (RPC-11) | `trainer_approved → approved → submitted` in **one transaction**, emitting **exactly two ordered** `report.state_changed` events, with **no committed `approved` residue** |

**`report_store_draft` (RPC-4) holds zero client EXECUTE and must stay that way** (R-27). Granting it would create a permanent browser-reachable path that writes report content from four arbitrary text fields — precisely the grounding-bypass surface `CLAUDE.md` §4 non-negotiable 1 forbids. `requestDraft` reaches it only through the trusted server-side channel the backend workstream defines.

**`reopenSubmitted` (RPC-12) exists in the lifecycle design but is out of the 48-hour slice** — post-submission correction initiation is deferred (§3). It must not be wired to a participant-reachable control.

### 5.2 Required reads and projections

| # | Projection | Role | Source |
|---|---|---|---|
| R-1 | Trainer dashboard and assigned sessions | Trainer | Live class-session assignments |
| R-2 | Session roster and per-student report state | Trainer | Roster + aggregate status |
| R-3 | Trainer working report | Trainer | `report_get_working` (RPC-14) |
| R-4 | Returned-correction queue | Trainer | Reports at `needs_edit` with an open correction request |
| R-5 | Returned-correction detail | Trainer | RPC-14, including the correction request's **scope, dimension and reason** |
| R-6 | Management pending-review queue | Management | Reports at `trainer_approved` in the managed centre |
| R-7 | Management correction-tracking queue | Management | Reports at `needs_edit` with an open correction request — **scope and status; reason only where §5.5 permits** |
| R-8 | Management safe review candidate | Management | `report_get_management_review` (RPC-15), status-gated |
| R-9 | Parent submitted-report list | Parent | Linked students with a non-NULL `latest_submitted_version_id` |
| R-10 | Parent report availability | Parent | Same, expressed as availability state |
| R-11 | Canonical parent report | T/M/P | `report_get_canonical` (RPC-13) |

**R-1, R-2, R-4, R-6, R-7, R-9 and R-10 are queue/list projections that Step 7I does not own.** They are backend Round 2 deliverables and are subject to the same discipline as every other read: server-derived authority, no assessment substance leaked to management or parents, and no field outside the DTO the frontend consumes. Where a projection would require a new database function beyond the ratified inventory, that is a §9 blocker, not an improvisation.

### 5.3 Frontend DTO inventory

Frontend contracts live under `lib/frontend/` and are the **only** shapes the UI consumes.

**Frontend contracts must not import generated database types directly.** No `Database['public']['Tables'][…]`, no `Enums[…]`, no re-export of a generated type through a frontend module. The server maps generated types to these DTOs at the boundary; the frontend never sees the database's shape. This keeps the frontend from silently acquiring a field the governance rules forbid it to hold.

| DTO | Consumed by | Fields |
|---|---|---|
| `SessionRole` | shell, guards | `'trainer' \| 'management' \| 'parent'` — **server-derived only** |
| `SessionUserDto` | shell | display name, role, centre display name |
| `TrainerSessionSummaryDto` | R-1 | session id, module name, class grade, date, start/end time, student count, counts by report state |
| `RosterEntryDto` | R-2 | student id, display name, attendance state, report state, previous-session focus |
| `DimensionDto` | T-4 | dimension code, group, display name, ordinal, rubric anchors for the four levels |
| `AssessmentDraftDto` | T-4/T-5 | report id, session id, student id, nine `{ dimensionCode, rating \| null }`, notes, follow-up, `observationLockVersion` |
| `ReportPanelsDto` | T-7, M-2, P-3 | `todaysStrength`, `nextFocus`, `practiceSuggestion`, `sessionTakeaway` |
| `TrainerWorkingReportDto` | R-3/R-5 | status, `lockVersion`, `versionId`, `revisionNumber`, `panels`, `contentHash`, checklist booleans (nullable), nine rating snapshots with labels, canonical pointer metadata, `openCorrection?: CorrectionRequestDto` |
| `ChecklistDto` | T-9 | `evidenceConfirmed`, `aiDraftReviewed`, `privacyChecked` |
| `CorrectionRequestDto` | R-5, M-4 | `id`, `issueScope`, `dimensionCode?`, `status`, `reason?` — **`reason` present on the trainer surface; on the management surface only per §5.5** |
| `ManagementQueueRowDto` | R-6/R-7 | report id, session id, student id, student display name, session date, status, `openCorrectionScope?`, `openCorrectionStatus?` |
| `ManagementReviewDto` | R-8 | status, `lockVersion`, `versionId`, `panels`, `wordingHash`, `submittedAt?`, `openCorrectionScope?`, `openCorrectionStatus?` — **and nothing else** |
| `ParentReportListItemDto` | R-9/R-10 | student id, student display name, session id, session date, `submittedAt` |
| `CanonicalReportDto` | R-11 | `panels`, `submittedAt` — **and nothing else** |
| `AvailabilityStateDto` | P-1/P-5/P-6 | `'available' \| 'none_yet' \| 'linked_unavailable'` |

`TrainerWorkingReportDto` is the **only** DTO carrying `contentHash`, and it is trainer-only. `ManagementReviewDto` carries `wordingHash` — a separate, domain-separated hash over the four parent-facing panels only, which leaks nothing because it checksums data the reader already holds. `CanonicalReportDto` carries **neither**.

### 5.4 `UiActionResult<T>`

One shared discriminated union for every server action and every read the UI can fail to obtain.

```ts
// lib/frontend/contracts/result.ts

export type UiFieldError = { readonly path: string; readonly message: string };

export type UiActionResult<T> =
  | { readonly outcome: 'success';            readonly data: T }
  | { readonly outcome: 'validation';         readonly message: string; readonly fields: readonly UiFieldError[] }
  | { readonly outcome: 'unauthenticated' }
  | { readonly outcome: 'unauthorized' }
  | { readonly outcome: 'unavailable' }
  | { readonly outcome: 'stale_state';        readonly message: string }
  | { readonly outcome: 'generation_failure'; readonly retryable: boolean; readonly message: string }
  | { readonly outcome: 'retryable_failure';  readonly message: string }
  | { readonly outcome: 'unexpected_failure'; readonly message: string };
```

| Outcome | Meaning | UI obligation |
|---|---|---|
| `validation` | Request shape or completeness failed | Banner + jump to first offending field. All nine ratings are required (A-017) |
| `unauthenticated` | No valid session | Redirect to `/login` |
| `unauthorized` | Session valid, caller lacks live authority | **Non-disclosing.** Identical treatment whether the target exists or not |
| `unavailable` | Authorized, but nothing to show at this status | Empty/unavailable state. **Never** "pending management review", "returned", or any workflow-internal fact |
| `stale_state` | A CAS expectation failed | "This changed while you were working" + reload path. **Never** echo the conflicting content |
| `generation_failure` | AI generation or grounding rejected the draft | Failure state, assessment preserved, one bounded retry offered |
| `retryable_failure` | Transient infrastructure failure | Retry affordance |
| `unexpected_failure` | Anything else | Generic failure state, nothing interpolated |
| `success` | Committed | Proceed |

**Error discipline (§8.6 of the Step 7I baseline, restated).** No message interpolates row content, an unpublished content hash, a correction reason, a credential or an environment value. `unauthorized` and `unavailable` are byte-indistinguishable between "no such report" and "not permitted".

### 5.5 Management DTO exclusions — absolute

`ManagementQueueRowDto` and `ManagementReviewDto` **must exclude**:

- ratings
- observations
- attendance
- evidence
- trainer notes
- checklist values
- content hashes
- revision counts
- correction reasons — **unless required on the correction-tracking surface**
- AI history

**The `revision_number` exclusion is load-bearing.** It is a dense per-report ordinal, so disclosing it tells the reader exactly how many correction cycles a report has been through — the same class of workflow-internal fact this section forbids.

**The content-hash exclusion is load-bearing.** The content hash covers the four panels **plus the nine ratings**, and a rating has four possible values — a reader holding the panels and the hash recovers the exact per-dimension grid in 4⁹ = 262,144 trials. Management proves "this is the exact text I approved" with the separate wording hash instead.

**On the correction-reason carve-out.** Management authored the reason; the field exists for the trainer, and RPC-14 is where it is read. The correction-tracking surface (R-7) may display a reason **only** where the backend projection supplies it for a request that management itself raised in the managed centre. It is never carried on `ManagementReviewDto`, and never on any parent surface.

---

## 6. AI boundary

### 6.1 The `AiDraftProvider` boundary

```ts
// server/modules/ai-drafting/provider.ts  (server-only)

export interface AiDraftRequest {
  readonly reportId: string;
  readonly observationLockVersion: number;
  readonly studentDisplayName: string;
  readonly ratings: ReadonlyArray<{
    readonly dimensionCode: string;
    readonly displayName: string;
    readonly rating: 'beginning' | 'developing' | 'mastering' | 'mastered';   // Amendment 006 A-049
    readonly anchorText: string;                       // the rubric anchor, never a bare enum
    readonly polarityBand: 'needs_support' | 'developing' | 'positive';
  }>;
  readonly trainerNotes: string;                       // untrusted data, delimited — never instructions
  readonly followUpNotes: string;                      // untrusted data, delimited — never instructions
}

export type AiDraftOutcome =
  | { readonly kind: 'ok'; readonly panels: ReportPanels }
  | { readonly kind: 'schema_rejected';    readonly detail: string }
  | { readonly kind: 'grounding_rejected'; readonly detail: string }
  | { readonly kind: 'provider_failure';   readonly retryable: boolean };

export interface AiDraftProvider {
  generate(request: AiDraftRequest): Promise<AiDraftOutcome>;
}
```

### 6.2 Required behaviour

1. **Real model generation before the physical test.** The participant walkthrough calls a real provider.
2. **Deterministic structured validation.** Output is validated against a schema **before** it is ever persisted as a `report_version`.
3. **Grounding against the saved assessment.** Every dimension carries its rubric anchor and polarity band. Grounding validation must actually be able to **reject** — proven with a deliberately contradictory case (an `Emerging` rating with positively-worded prose must be caught, not eyeballed).
4. **One bounded retry or regeneration.** Bounded means bounded: one, not a loop.
5. **Failure leaves no false `draft_ready`.** A rejected or failed generation ends at `report_cancel_draft` (RPC-5, `drafting → observation_saved`) with the assessment preserved. **There is no path where AI output reaches the trainer's screen without grounding having run first** (`CLAUDE.md` §4 non-negotiable 1).

### 6.3 Provider selection — no silent choice

**Do not silently select Ollama or a hosted provider.** The backend agent may inspect **approved configuration-variable names** and existing provider code. **It must not inspect secret values** — no reading of `.env.local`, no printing, hashing, logging or reporting of any key.

**Checkpoint CP-1 — provider approval. Status at contract creation: SATISFIED, no operator decision required.** The ratified non-secret selectors are already committed in `.env.example` as `LLM_PROVIDER=openai` and `LLM_MODEL=gpt-5.6-terra`, and `STATUS.md` records the provider and key as orchestrator-verified and present locally. Presence was established from those two committed/recorded sources; **no secret value was read.**

**If, at implementation time, the approved provider is found unconfigured or a different provider would be needed, the backend agent stops at the provider checkpoint and requests an operator decision** — it does not choose one.

### 6.4 The fixture provider

A deterministic fixture provider implementing `AiDraftProvider` is **allowed only** for frontend development and automated UI-state tests. It must never be reachable in the participant walkthrough (gate **G-19**).

---

## 7. File ownership

**Neither agent may edit the other track's owned paths.** Any genuinely required cross-owned edit is a **blocker** and must be reported before modification (§9).

### 7.1 Backend worktree — Claude Code — branch `feat/48h-backend`

**Owns:**

- `supabase/**`
- `server/**`
- `lib/supabase/**`
- generated database types
- `scripts/fixtures/**`
- backend and integration tests
- authentication and authorization
- lifecycle RPC integration
- AI provider and grounding
- backend-owned actions and projections
- dependency files (`package.json`, `package-lock.json`) **only when genuinely required**
- `docs/workstreams/48H_BACKEND_PROGRESS.md`

**Must not edit frontend-owned paths.**

A dependency addition beyond the locked stack is flagged to the orchestrator in one line **before** installing (`CLAUDE.md` §11). Vitest, React Testing Library and Playwright are pre-approved (A-009).

### 7.2 Frontend worktree — Codex — branch `feat/48h-frontend`

**Owns:**

- `app/(auth)/**`
- `app/(portals)/**`
- `components/**`
- `features/**`
- `lib/frontend/**`
- `tests/frontend/**`
- `public/brand/**`
- `app/layout.tsx`
- `app/globals.css`
- `docs/workstreams/48H_FRONTEND_PROGRESS.md`

**Must not edit:**

- SQL or migrations
- RLS or grants
- generated database types
- server authorization
- lifecycle rules
- governance documents
- `package.json`
- `package-lock.json`
- the backend workstream log

### 7.3 Boundary notes

- `app/page.tsx` and `app/favicon.ico` exist at the repository root today and are **not** listed in either ownership set. Treat a required change to either as a cross-owned edit under §9.
- `public/brand/**` is frontend-owned; the rest of `public/**` is not. **No visual asset may be copied into the repository without a recorded `PORT` / `REFERENCE ONLY` / `REBUILD` / `REJECT` / `NOT APPLICABLE` disposition** (A-013 discipline, carried by A-022.2).
- The **eight blocked Figma design families** (management review queue · management final review · wording-only editor · return-to-trainer dialog · correction tracking · final Approve & Submit · staff notification surface · parent notification surface) have **no suitable frame**. **Do not invent a frame, node ID or field for any of them.** Build them to this contract's field lists and to the ratified governance rules, and report any point where that is insufficient.

---

## 8. Shared references and canonical progress documents

**Both worktrees start from the same contract commit** — the commit created by `docs(plan): define 48-hour physical-test slice`, which is the merge-base of `feat/48h-backend` and `feat/48h-frontend`.

### 8.1 Common read-only references

Read-only in **both** implementation worktrees, for the whole of parallel work:

- `CLAUDE.md`
- `docs/spec/**`
- `docs/plan/**`
- `docs/progress/**`
- `docs/progress/DEMO_TO_MVP_MIGRATION.md`

**Neither agent may modify any shared reference during parallel work.**

### 8.2 The one exception

Each agent may modify **only its own branch-local workstream log** under `docs/workstreams/`. The other agent's log is **read-only**.

### 8.3 Documents neither worktree may update

- `docs/progress/STATUS.md`
- `docs/progress/BUILD_NOTES.md`
- either migration tracker (the repository copy **and** the workspace-level copy)
- `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_004.md`
- `docs/plan/STEP_7I_REPORT_LIFECYCLE_BASELINE.md`
- `docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md`
- this contract

**Canonical progress records are updated once from the main integration repository, after both workstream reports are reconciled.** This is what prevents two branches from producing conflicting continuity records for the same window.

### 8.4 Required agent report

Each agent reports, at every checkpoint:

1. baseline commit
2. current round
3. completed items
4. changed paths
5. validation results
6. commits created
7. blockers
8. next recommended checkpoint

---

## 9. Blocker protocol — when the contract or governance must change

If either agent discovers that the shared contract or a governing document must change:

1. **stop** without editing shared documents;
2. **record** the blocker in its own workstream log;
3. **report** the exact required decision;
4. **pause** both worktrees;
5. **amend and commit** the contract on `main`;
6. **rebase both branches** onto the same amended baseline before resuming.

**A cross-owned edit follows the same path.** It is reported before modification, never performed and reported afterwards.

**`CLAUDE.md` §12 stop-and-ask remains fully in force and is not narrowed by this contract.** In particular: any schema object beyond the exhaustive A-040 list; any status beyond the eight; any client `EXECUTE` on `report_store_draft`, either serializer, or `app_parent_reaches_student`; any content hash returned to management or a parent; any PII in an audit label or payload; any trainer reapproval of the very version a return sent back; any invented Figma frame, node ID or field.

---

## 10. Named implementation checkpoints

These are decisions this contract deliberately **records rather than makes**. Each must be resolved by an operator decision at the point it is reached — not improvised by an agent.

| # | Checkpoint | Status | Blocks |
|---|---|---|---|
| **CP-1** | **AI provider approval and configuration** (§6.3) | **Satisfied** — `openai` / `gpt-5.6-terra` ratified and recorded; key present locally | Nothing |
| **CP-2** | **Assessment-write authorization.** `observations` and `observation_ratings` hold **zero policies and zero `authenticated` privileges**, and the Step 7I inventory contains **no assessment-write RPC** — the baseline assigns "assessment RPCs" to a later Phase 1 slice. Real observation persistence therefore requires governed write objects that were **not yet designed or authorized**. | **RESOLVED BY DESIGN (2026-08-05)** — `docs/plan/PHYSICAL_TEST_ASSESSMENT_WRITE_BASELINE.md` ratifies `public.assessment_save_observation`: `SECURITY DEFINER`, `postgres`-owned, pinned empty `search_path`, live trainer/session/enrolment/attendance authorization, the `Asia/Singapore` session-start gate, full mode with exactly nine unique governed ratings, atomic observation + nine-rating persistence, observation-id plus lock-version CAS with exactly one increment per successful update, a bounded non-sensitive return, **no report lifecycle mutation**, and **no new table, enum or table grant**. Privileges: `authenticated` EXECUTE on the RPC only; **no `authenticated` table SELECT/INSERT/UPDATE/DELETE** on either table; RLS stays enabled with **zero policies**. **Standalone observation persistence is intentionally NOT a Step 7H audit event** — see the CP-2/CP-4 audit note below. **No implementation exists.** Implementation belongs to **Backend Round B2, after Step 7I acceptance**, in its own separately-authorized migration | `saveObservation` (§5.1), scope items **T-5**, and the real-data path for **T-6 … T-13** — all now unblocked **by design**, pending implementation |
| **CP-3** | **Queue and list projections** (R-1, R-2, R-4, R-6, R-7, R-9, R-10). Step 7I owns no queue read path — U-7I-24 records that management currently has no in-product way to discover a report awaiting review. Whether these are server-side reads over existing Step 7G grants or new functions determines whether A-040's boundary is touched. | **OPEN — resolve at backend Round 2 design** | R-1, R-2, R-4, R-6, R-7, R-9, R-10 |
| **CP-4** | **Trainer observation read path** (U-7I-11 / U-30). There was no governed read path to `observations`, so Review & Approve could not load `follow_up_notes` — the single column the B.E.S.T Form and the "Coach Notes (Internal Only)" field share. | **RESOLVED BY DESIGN (2026-08-05)** — the same baseline ratifies `public.assessment_get_trainer_observation`: `SECURITY DEFINER`, **`STABLE`**, pinned empty `search_path`, the **same** live trainer/session relationship as the write, scoped to the requested session and student only. Returns the trainer-editable observation fields, the nine rating values with authoritative labels embedded from `assessment_dimensions` (so **no client grant on that table is needed** — U-7I-7 stays closed), the observation id and `lock_version`; a **safe empty/not-created shape** where no observation exists (one row, never an error). Denies management, parents, unrelated trainers and unauthenticated callers with one **non-disclosing** authored outcome. Never returns report drafts, approval data, correction reasons, audit data or unrelated student information. It supports the **returned-correction** workflow **without** exposing management-only correction metadata — `issue_scope`, affected dimension, correction status and reason stay with `report_get_working` (RPC-14). **No implementation exists**; Backend Round B2, after Step 7I acceptance | T-5, T-7 — now unblocked **by design**, pending implementation |
| **CP-5** | **Deterministic management bootstrap** (N-4 / U-23). Unresolved, and materially more important now that management is the publisher. The synthetic fixture provides a management identity for the physical test; it does not discharge N-4. | **OPEN — non-blocking for the physical test** | Nothing in the 48-hour slice |

**CP-2 does not block backend Round 1**, which is entirely within the ratified Step 7I design. It blocked the assessment-write work that Round 2 and the real-data walkthrough depend on; **that decision has now been taken** (2026-08-05) and both CP-2 and CP-4 are **resolved by design**.

### 10.1 CP-2 / CP-4 audit boundary — standalone observation persistence is deliberately not an audit event

**`assessment_save_observation` emits no Step 7H audit event, and neither does `assessment_get_trainer_observation`.** This is an explicit operator ruling, not an omission.

The committed Step 7H registry is a **closed 16-action `CONSTANT text[]`** duplicated byte-identically inside **two applied `SECURITY DEFINER` functions** (`audit_append_event` and `audit_verify_chain`), and **none of its sixteen actions denotes standalone observation persistence**. Every action that could truthfully describe an observation save is a *report* action requiring exactly the report mutation this design forbids. The ruling is consistent with what Step 7H already decided: §1.4 event **E9 — "Observation-to-report derivation"** — was resolved as *"Folded into E2/E3 payloads … no separate event (data minimization)"*, so observation facts were **already** ratified as auditable **through report events**.

Consequently, and bindingly:

- the **16-action registry is not extended**, and **neither Step 7H audit function is replaced** (Step 7H assertion **B20** requires the two copies to stay equal; Step 7I test **T7I-30** requires the registry byte-unchanged in both; `CLAUDE.md` §12 makes registry extension stop-and-ask; Step 7I **R-29** rejected extension on the same ground);
- **no misleading report or administration action is reused** — a false, hash-covered claim in an append-only chain that §6.4 of the Step 7H baseline forbids repairing "ever" is strictly worse than no claim;
- **`assessment_save_observation` creates no report and performs neither T0 nor T1**;
- `CLAUDE.md` §4 non-negotiable 2 is **not** engaged: it governs *state transitions*, and Step 7I §3.2 states directly that an observation save "is not a report transition at all".

**Truthful audit begins when `requestDraft` performs the report lifecycle operations** — ensure/create the report (`report_create`, T0 → `report.created`), mark observation saved (`report_mark_observation_saved`, T1 → `report.state_changed`), then request drafting (`report_request_draft`, T2 → `report.state_changed`). Those payloads carry **only permitted non-PII derivation identifiers** (report, student, session, module and **observation** ids, plus status) with the **generic constant target labels** of R-30 — and **never** observation prose, chip values, follow-up or term-evidence text, rating values, the assessment payload, correction content, or any name, initial, account name, email or phone number.

**Assessment saving never silently advances the report lifecycle.**

**Quick mode remains deferred** — and is not merely deferred here but **removed entirely** by A-017: there is one capture mode, the full nine, and no `mode` column, component prop, validator or test may reintroduce a four-dimension completion path. Nothing in the assessment baseline creates one.

**Implementation of both RPCs belongs to Backend Round B2, after Step 7I acceptance**, in its own separately-authorized migration (**+1 migration, +2 public functions, +2 `authenticated` EXECUTE grants, no new table or enum**; post-assessment census **6 migrations, 30 public functions, 26 tables, 12 enums**). The ratified Step 7I counts of **5 migrations, 28 functions and 75 tests** are **unchanged**. **No implementation exists today.**

---

## 11. Parallel rounds

### 11.1 Backend Round 1 — `feat/48h-backend`

1. First migration introduces `trainer_approved` — **only** `ALTER TYPE public.report_status ADD VALUE 'trainer_approved' AFTER 'needs_edit'`, under the P-1 fail-closed `current_user = 'postgres'` guard, and commits.
2. Second Step 7I migration implements the lifecycle design — and is the **only** file permitted to reference the new label.
3. Schema, constraints, lineage and correction requests.
4. Lifecycle RPCs.
5. RLS and grants — a policy and its minimum matching grant ship together; neither alone.
6. Fixtures and verifier reconciliation.
7. Canonical/disposable concurrency proofs.
8. Generated types.

### 11.2 Frontend Round 1 — `feat/48h-frontend`

1. Design tokens and shared shell.
2. Login presentation.
3. Trainer dashboard.
4. Roster.
5. Nine-dimension assessment.
6. Fixture-backed observation save.
7. AI loading / failure / retry.
8. Trainer review and wording edit.
9. Checklist and trainer approval.
10. Returned-queue shell.
11. Focused frontend tests.

### 11.3 Backend Round 2

1. Real authentication and server boundary.
2. Server actions (§5.1).
3. Trainer, Management and Parent read projections (§5.2).
4. AI provider and deterministic grounding (§6).
5. Durable in-app availability states.
6. Integration tests.

### 11.4 Frontend Round 2

1. Management queue.
2. Safe review surface.
3. Wording-only editor.
4. Return dialog.
5. Correction tracking.
6. Trainer correction and reapproval UI.
7. Final Approve & Submit.
8. Parent list and canonical detail.
9. Empty, unavailable and denied states.
10. DOM-level privacy tests.
11. Real-adapter-ready port wiring.

---

## 12. Integration order — pinned

1. Both branches start from the contract commit.
2. Backend Round 1 and frontend Round 1 run **in parallel**.
3. Reconcile both reports.
4. Backend Round 2 and frontend Round 2 run **in parallel**.
5. **Backend branch merges to `main` first.**
6. Frontend branch rebases or merges against the backend-integrated `main`.
7. Frontend branch merges second.
8. Real adapter wiring is completed.
9. Local database is reset and seeded.
10. Canonical verifier runs.
11. Disposable concurrency suite runs **separately**.
12. Typecheck, lint and build pass.
13. Scripted three-role dry run passes.
14. Physical-test blockers are repaired.
15. Participant testing begins.

**Database isolation (U-7I-21).** Every non-concurrency proof, plus preservation and repeatability, runs on the **canonical** fixture database, which stays **pristine**. The coordinated two-session concurrency tests run on a **separate disposable** database that is deliberately dirtied and destroyed afterwards. Step 10 and step 11 are two different databases; they are not interchangeable.

---

## 13. Physical-test acceptance gates

| # | Gate |
|---|---|
| G-1 | Real three-role authentication |
| G-2 | Server-derived role and centre authority |
| G-3 | Complete Trainer → Management → Parent lifecycle |
| G-4 | All nine ratings required |
| G-5 | Real observation persistence |
| G-6 | Real AI generation and grounding |
| G-7 | Deterministic retry / failure handling |
| G-8 | **Trainer approval does not publish** |
| G-9 | **Management wording-only enforcement** — a write to any field outside the four parent-facing panels is rejected **server-side**, not merely hidden, including when the UI is bypassed entirely |
| G-10 | Substantive changes require **return** and trainer **reapproval** |
| G-11 | Stale-state and duplicate-action rejection |
| G-12 | Returned and preapproved reports remain **parent-invisible** |
| G-13 | Parent sees **only** the submitted canonical report |
| G-14 | Parent isolation and **non-disclosing** denial |
| G-15 | Management cannot access preapproval draft content |
| G-16 | Final submission produces **exactly two ordered state-change audit events** |
| G-17 | No audit-chain corruption |
| G-18 | Canonical verifier database remains **pristine** |
| G-19 | Concurrency proofs run on the **disposable** database; **fixture mode is not used for the primary walkthrough** |
| G-20 | Typecheck, lint and build pass |
| G-21 | Browser console has **no uncaught errors** during the dry run |

**G-16 in full:** `trainer_approved → approved → submitted` commits in one transaction, emits two ordered `report.state_changed` events, and leaves **no committed `approved` residue** — no operation ever commits with `status = 'approved'`.

**G-13 in full:** the canonical read resolves **exclusively** through `latest_submitted_version_id`. A trainer-approved-but-unsubmitted version is unreachable **by construction**, not by a status test. No per-dimension rating grid appears in any parent surface, in any form or wording.

---

## 14. What this contract does not do

- It does not authorize Step 7I2A or any later checkpoint.
- It does not amend any amendment, `CLAUDE.md`, the Implementation Plan, the Step 7I baseline or the Figma matrix.
- It does not resolve CP-2, CP-3, CP-4 or CP-5.
- It does not weaken any privacy, approval, audit or evidence control.
- It does not narrow `CLAUDE.md` §12.
- It does not permit real data. Synthetic/seed data only, always (ADR-6).
- It does not permit any credential in chat, in any file, in a log, in an error or in a report.
