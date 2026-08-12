# B.E.S.T Coach — Final MVP UI Screen and Route Inventory

**Status:** Ratified inventory — created at the Final MVP visual-screen inventory and 48-hour core-slice reconciliation checkpoint (2026-08-05, Asia/Singapore).
**Authority:** Governed by **`docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_005.md`** (**A-041 … A-048**), and subordinate to Specification v3, Amendments 001–004 and `CLAUDE.md`.
**Precedence:** This document is **procedural planning material**. It cannot override Specification v3, any ratified amendment, or `CLAUDE.md`. Where it and a governing document disagree, the governing document wins and the disagreement is reported, never resolved locally.

---

## 0. What this document is, and what it is not

This is the **complete, canonical visual-reference inventory** for the final MVP: **36 screens** — **3 authentication screens** and **33 portal screens** — every one of which belongs to Figma file key **`sSY1TYw3jyVlZDy8V2Mu7g`**, file name **`SDS-dashboard`**.

**It is an inventory and a route plan. It is not an implementation authorization, and screen presence is not authorization.** A Figma screen or a control drawn on one does **not** independently authorize a lifecycle transition, a role or permission, a database mutation, an AI operation, access to protected content, direct table access, a Management power, or Parent access to unpublished content. Where a screen implies governance this project has not ratified, that is recorded here as a **dependency**, never invented as behaviour.

**No application code, route or component was created, moved, deleted or restyled to produce this document.** No Figma asset was scraped, exported, downloaded or ported, and **no node ID was fabricated** — every node below was supplied by the orchestrator.

### 0.1 Authority precedence

**Visual authority (highest first)** — ✅ **reconciled 2026-08-08 (Authority Lock §2.4 / §28.1a; `CLAUDE.md` §7.4):**

1. **`UI_REFERENCE_FINAL_MVP/reference/<mapped pack>/`** — the ratified current visual source for all 36 governed screens. Mapping: `UI_REFERENCE_FINAL_MVP/SCREEN_INDEX.md`
2. The governed pack's **optional frozen local `reference.png` duplicate** — 12 of 36, SHA-identical to (1); never outranks it, and **its absence is not a missing reference**
3. Node-specific Figma context — **only where no ratified `/reference/` asset exists**
4. Existing frontend implementation

~~1. Frozen `reference.png` · 2. Node-specific Figma context · 3. Existing frontend implementation~~ *(superseded — it ranked a file 24 of 36 packs do not hold above the ratified frame all 36 do)*

**Functional, security and privacy authority (highest first):**

1. Specification v3 and active amendments
2. `CLAUDE.md`
3. Lifecycle and authorization baselines (`STEP_7I_REPORT_LIFECYCLE_BASELINE.md`, `PHYSICAL_TEST_ASSESSMENT_WRITE_BASELINE.md`, Step 7G/7H baselines)
4. Ratified implementation contract (`PHYSICAL_TEST_SLICE_48H.md`)
5. Figma

**Figma never bypasses governance.** Where a frame and a ratified rule disagree, the ratified rule wins and the discrepancy is recorded.

### 0.2 Counts, stated once

| Group | Count |
|---|---|
| Authentication screens (`AUTH-01` … `AUTH-03`) | **3** |
| Trainer portal screens (IDs 01–10) | **10** |
| Management portal screens (IDs 11–29) | **19** |
| Parent portal screens (IDs 30–33) | **4** |
| **Portal total** | **33** |
| **Complete visual-reference inventory** | **36** |
| 48-hour core slice — `Yes` | **12** |
| 48-hour core slice — `No` | **24** |

Authentication IDs sit **outside** the numbered portal sequence deliberately, so the previously accepted portal numbering **01–33 does not shift**.

### 0.3 Classification vocabulary

| Value | Meaning |
|---|---|
| `Implemented and visually aligned` | A route exists and has been reconciled against its frozen visual reference. |
| `Implemented but visually unaligned` | A route exists and is functional, but was built to the governed contract without a node-specific frame; its visual acceptance is outstanding. |
| `Partially implemented` | Some of the screen's function exists — often on a non-canonical route or folded into another surface — but the screen itself does not exist as designed. |
| `Not implemented` | No route, component or projection serves this screen. |
| `Backend dependency missing` | The screen cannot be built truthfully because a governed read/write path, table or projection does not exist. |
| `Governance decision missing` | The screen's behaviour is not ratified; building it would require inventing governance. |
| `Post-48-hour final-MVP scope` | In ratified final-MVP scope, not required before the physical test. |

**No screen in this inventory is marked `Implemented and visually aligned`.** ~~No frozen `reference.png` exists yet for any of the 36 screens, so visual alignment cannot be claimed for any of them.~~ **✅ CORRECTED 2026-08-08 (Phase A2, S-14). FALSE — 12 frozen `reference.png` files exist**, each SHA-256-verified against `UI_REFERENCE_FINAL_MVP/UI_PACK_MANIFEST.json` and byte-identical to its `reference/` twin (Authority Lock §28.1, §28.6, §31.5). **~~The correct statement: 12 of the 36 governed screens have a frozen reference; 24 do not, so alignment cannot be claimed for those 24.~~ **✅ SUPERSEDED 2026-08-08 (Final UI Reference Authority Synchronization).** The accurate statement is: **12 of the 36 hold a pack-local frozen `reference.png` duplicate; 24 do not — but ALL 36 have a ratified current visual reference** at `UI_REFERENCE_FINAL_MVP/reference/<mapped pack>/` (§0.1 rank 1; mapping in `SCREEN_INDEX.md`). **Alignment CAN be claimed for all 36**; what remains outstanding is the reconciliation work itself, not the availability of a reference.** ⚠️ Left uncorrected, the struck sentence would let a future reader **deny that visual-authority rank 1 is populated at all**.

### 0.4 Route notation

Dynamic segments use **bracket notation** (`[sessionId]`, `[studentId]`, `[reportId]`, `[classModuleId]`). The operator's compiled source list expressed these as prose placeholders (`specific-session-id`, `specific-class-type`); those are normalized here and the normalization is ratified by Amendment 005 **A-042**.

**Role-query variants are canonical route strings.** `/login?role=trainer`, `/login?role=management` and `/login?role=parent` are three distinct canonical routes over one implementation shell. **The `role` query parameter selects presentation only and carries no authority whatsoever** (A-046).

---

## 1. Authentication screens

Three authentication-entry screens. Each is a **separately frozen visual reference** because the three supplied Figma frames are **distinct nodes**. They may share implementation components; that is an implementation decision, not a visual-reference merge.

The orchestrator's sharing rule for these three frames is recorded verbatim: **"all similar to each other."** Similar is not identical — three distinct node IDs were supplied, so **three separate frozen references are required**, and the shared-frame exception of A-041 is **not** invoked.

### 1.1 Identity

| ID | Role | Screen | Folder | Canonical route | Figma node | Figma URL |
|---|---|---|---|---|---|---|
| AUTH-01 | Trainer | Trainer Login | `AUTH-01-trainer-login` | `/login?role=trainer` | `546:370` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=546-370&m=dev |
| AUTH-02 | Management | Management Login | `AUTH-02-management-login` | `/login?role=management` | `459:13` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=459-13&m=dev |
| AUTH-03 | Parent | Parent Login | `AUTH-03-parent-login` | `/login?role=parent` | `546:413` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=546-413&m=dev |

### 1.2 Status

| ID | Final visual status | Current implementation status | 48-hour core slice | Physical-test flow order | Implementation gap classification |
|---|---|---|---|---|---|
| AUTH-01 | Final — node-specific frame supplied | `Implemented but visually unaligned` | **Yes** | **1** | Visual reconciliation outstanding; frame supplied at this checkpoint |
| AUTH-02 | Final — node-specific frame supplied | `Implemented but visually unaligned` | **Yes** | **7** | Visual reconciliation outstanding; frame supplied at this checkpoint |
| AUTH-03 | Final — node-specific frame supplied | `Implemented but visually unaligned` | **Yes** | **10** | Visual reconciliation outstanding; frame supplied at this checkpoint |

### 1.3 Dependencies and route compatibility

| ID | Backend dependency | Screenshot status | Current frontend route | Compatibility treatment |
|---|---|---|---|---|
| AUTH-01 | Real Supabase Auth sign-in; server-derived role resolution from `accounts.auth_user_id` → active `centre_memberships` — **delivered** on `feat/48h-backend` (`server/modules/identity-access/`) | Not captured — external frozen UI-reference pack pending; **required immediately** | `/login` with `?role=` presentation (`app/(auth)/login/page.tsx`, `features/auth/login-presentation.tsx`) | **No mismatch** — canonical route satisfied |
| AUTH-02 | As AUTH-01 | Not captured — **required immediately** | As AUTH-01 | **No mismatch** — canonical route satisfied |
| AUTH-03 | As AUTH-01 | Not captured — **required immediately** | As AUTH-01 | **No mismatch** — canonical route satisfied |

### 1.4 Authentication governance — restated, not created

The three login screens **must not**:

- imply that choosing a role grants that role;
- expose whether an unrelated account exists;
- store or display plaintext passwords;
- bypass real Supabase Auth;
- provide shared credentials;
- reveal internal authorization details in errors.

**Authenticated identity, live membership and server-derived role determine authority** — never the query parameter, never a token claim, never a UI condition (ADR-4, A-030, contract §4).

**Resolved by this checkpoint.** The Figma matrix recorded, for all three login rows, that *"Shared login shell vs three role-specific login screens is **undetermined** in Design 2"*, and its §5.2 porting actions asked the orchestrator to confirm it. **Three distinct node-specific frames have now been supplied, so the visual answer is three role-specific frames.** The implementation may still share one shell and one route file; the **visual references do not merge**.

---

## 2. Trainer screens (IDs 01–10)

### 2.1 Identity

| ID | Role | Screen | Folder | Canonical route | Figma node | Figma URL |
|---|---|---|---|---|---|---|
| 01 | Trainer | Trainer Dashboard | `01-trainer-dashboard` | `/trainer/dashboard` | `415:9` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=415-9&m=dev |
| 02 | Trainer | Trainer My Classes | `02-trainer-my-classes` | `/trainer/my-classes` | `777:2` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=777-2&m=dev |
| 03 | Trainer | Trainer Lesson Plan | `03-trainer-lesson-plan` | `/trainer/my-classes/lesson-plan` | `773:2` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=773-2&m=dev |
| 04 | Trainer | Trainer Students | `04-trainer-students` | `/trainer/students` | `529:9` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=529-9&m=dev |
| 05 | Trainer | Trainer Schedule | `05-trainer-schedule` | `/trainer/schedule` | `591:9` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=591-9&m=dev |
| 06 | Trainer | Trainer Student Roster | `06-trainer-student-roster` | `/trainer/schedule/[sessionId]/student-roster` | `487:9` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=487-9&m=dev |
| 07 | Trainer | Trainer Grade Student | `07-trainer-grade-student` | `/trainer/schedule/[sessionId]/student-roster/[studentId]/grade-student` | `784:679` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=784-679&m=dev |
| 08 | Trainer | Trainer AI Report Generation | `08-trainer-ai-report-generation` | `/trainer/schedule/[sessionId]/student-roster/[studentId]/grade-student/ai-report-generation` | `784:340` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=784-340&m=dev |
| 09 | Trainer | Trainer Reports | `09-trainer-reports` | `/trainer/reports` | `783:59` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=783-59&m=dev |
| 10 | Trainer | Trainer Student Report | `10-trainer-student-report` | `/trainer/reports/[reportId]` | `664:9` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=664-9&m=dev |

### 2.2 Status

| ID | Final visual status | Current implementation status | 48-hour core slice | Physical-test flow order | Implementation gap classification |
|---|---|---|---|---|---|
| 01 | Final | `Partially implemented` | No | — | `Post-48-hour final-MVP scope` — a trainer landing surface exists at a non-canonical route; the designed dashboard does not |
| 02 | Final | `Not implemented` | No | — | `Post-48-hour final-MVP scope` |
| 03 | Final | `Not implemented` | No | — | `Post-48-hour final-MVP scope` **+ `Backend dependency missing`** — no lesson-plan table, enum or RPC exists in the 26-table / 12-enum census |
| 04 | Final | `Not implemented` | No | — | `Post-48-hour final-MVP scope` |
| 05 | Final | `Partially implemented` | **Yes** | **2** | Session selection is currently served by the trainer landing surface; **no `/trainer/schedule` route exists**. This is the one core-slice screen with no dedicated route |
| 06 | Final | `Implemented but visually unaligned` | **Yes** | **3** | Route mismatch; visual reconciliation outstanding |
| 07 | Final | `Implemented but visually unaligned` | **Yes** | **4** | Route mismatch; visual reconciliation outstanding |
| 08 | Final | `Implemented but visually unaligned` | **Yes** | **5** | Route mismatch; visual reconciliation outstanding |
| 09 | Final | `Partially implemented` | No | — | `Post-48-hour final-MVP scope` — the canonical route exists but currently serves only the returned-correction queue (`?status=needs_edit`), not the designed reports screen |
| 10 | Final | `Implemented but visually unaligned` | **Yes** | **6** | Route mismatch; no bare `[reportId]` index route exists — review and edit sub-routes carry the function |

### 2.3 Dependencies and route compatibility

| ID | Backend dependency | Screenshot status | Current frontend route | Compatibility treatment |
|---|---|---|---|---|
| 01 | Trainer assigned-session projection (R-1) — **delivered** (`server/modules/report-workflow/trainer-projections.ts`) | Not captured — pack pending | `/trainer` | **Preserve existing route as redirect** — `/trainer` redirects to `/trainer/dashboard` |
| 02 | **Missing** — no class-module read projection scoped to a trainer | Not captured — pack pending | — | Not applicable — no implemented route |
| 03 | **Missing** — lesson plans have no schema, no RPC and no ratified governance | Not captured — pack pending | — | Not applicable — no implemented route |
| 04 | **Missing** — no trainer-scoped student list projection | Not captured — pack pending | — | Not applicable — no implemented route |
| 05 | Trainer assigned-session projection (R-1) — **delivered**; a schedule/date projection over the same class-session records is **not** delivered | Not captured — **required immediately** | `/trainer/schedule` ~~— (function folded into `/trainer`)~~ | ~~**Operator decision required** — see §7.3~~ **✅ CLOSED — see §7.3** *(corrected 2026-08-08, P0-T04 under G-00a: §7.3 has recorded the gap as CLOSED since Phase A2 S-15, but this row still said the decision was open — an internal contradiction inside one document. `app/(portals)/trainer/schedule/page.tsx` exists on disk; checkpoint F-04, ruling R-B1. `U-A5-1` is closed.)* |
| 06 | Roster + per-student report state (R-2) — **delivered** | Not captured — **required immediately** | `/trainer/sessions/[sessionId]/roster` | **Replace after integration**, pinned path preserved as a redirect |
| 07 | `assessment_save_observation` / `assessment_get_trainer_observation` — **delivered** on `feat/48h-backend` | Not captured — **required immediately** | `/trainer/sessions/[sessionId]/students/[studentId]/assess` | **Replace after integration**, pinned path preserved as a redirect |
| 08 | `report_request_draft` (RPC-3) → grounding → `report_store_draft` (RPC-4) / `report_cancel_draft` (RPC-5) — **delivered** | Not captured — **required immediately** | `/trainer/reports/[reportId]/generate` | **Replace after integration**, pinned path preserved as a redirect |
| 09 | Returned-correction queue (R-4) — **delivered**; a general trainer reports list is **not** delivered | Not captured — pack pending | `/trainer/reports` (`?status=needs_edit`) | **No route mismatch** — canonical route satisfied; screen content incomplete |
| 10 | `report_get_working` (RPC-14), `report_get_canonical` (RPC-13), `report_update_checklist` (RPC-7), `report_trainer_approve` (RPC-8) — **delivered** | Not captured — **required immediately** | `/trainer/reports/[reportId]/review`, `/trainer/reports/[reportId]/edit` | **Replace after integration** — add the canonical `[reportId]` index; sub-routes preserved |

---

## 3. Management screens (IDs 11–29)

### 3.1 Identity

| ID | Role | Screen | Folder | Canonical route | Figma node | Figma URL |
|---|---|---|---|---|---|---|
| 11 | Management | Management Dashboard | `11-management-dashboard` | `/management/dashboard` | `397:2` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=397-2&m=dev |
| 12 | Management | Management Classes | `12-management-classes` | `/management/classes` | `442:9` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=442-9&m=dev |
| 13 | Management | Management Class Overview | `13-management-class-overview` | `/management/classes/[classModuleId]` | `689:66` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=689-66&m=dev |
| 14 | Management | Management Lesson Plan Management | `14-management-lesson-plan-management` | `/management/classes/[classModuleId]/lesson-plans` | `760:2` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=760-2&m=dev |
| 15 | Management | Management Lesson Statistics | `15-management-lesson-statistics` | `/management/classes/[classModuleId]/sessions/[sessionId]/lesson-statistics` | `690:2` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=690-2&m=dev |
| 16 | Management | Management Class Statistics | `16-management-class-statistics` | `/management/classes/[classModuleId]/class-statistics` | `445:9` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=445-9&m=dev |
| 17 | Management | Management Students | `17-management-students` | `/management/students` | `510:9` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=510-9&m=dev |
| 18 | Management | Management Student Profile | `18-management-student-profile` | `/management/students/[studentId]` | `649:9` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=649-9&m=dev |
| 19 | Management | Management Student Report | `19-management-student-report` | `/management/students/[studentId]/reports/[reportId]` | `648:330` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=648-330&m=dev |
| 20 | Management | Management Register New Student | `20-management-register-student` | `/management/students/register` | `425:10` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=425-10&m=dev |
| 21 | Management | Management Create Parent Account | `21-management-create-parents-account` | `/management/students/create-parent-account` | `709:2` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=709-2&m=dev |
| 22 | Management | Management Edit Student | `22-management-edit-student` | `/management/students/[studentId]/edit` | `545:175` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=545-175&m=dev |
| 23 | Management | Management Trainers | `23-management-trainers` | `/management/trainers` | `544:9` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=544-9&m=dev |
| 24 | Management | Management Add Trainer | `24-management-add-trainer` | `/management/trainers/add` | `544:292` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=544-292&m=dev |
| 25 | Management | Management Schedule | `25-management-schedule` | `/management/schedule` | `506:59` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=506-59&m=dev |
| 26 | Management | Management Add Class | `26-management-add-class` | `/management/classes/add-class` | `646:9` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=646-9&m=dev |
| 27 | Management | Management Edit Class | `27-management-edit-class` | `/management/classes/[classModuleId]/edit` | `545:9` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=545-9&m=dev |
| 28 | Management | Management Term Report | `28-management-term-report` | `/management/students/[studentId]/term-report` | `836:2` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=836-2&m=dev |
| 29 | Management | Management Reports | `29-management-reports` | `/management/reports` | `527:170` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=527-170&m=dev |

### 3.2 Status

| ID | Final visual status | Current implementation status | 48-hour core slice | Physical-test flow order | Implementation gap classification |
|---|---|---|---|---|---|
| 11 | Final | `Partially implemented` | No | — | `Post-48-hour final-MVP scope` — a management landing surface exists at a non-canonical route |
| 12 | Final | ~~`Not implemented`~~ ✅ **`Implemented` — 2026-08-12, plan phase `P2-1`** | No | — | ~~`Post-48-hour final-MVP scope`~~ ✅ **BUILT at its canonical route `/management/classes`.** Projection + server action + frontend + verification (`prove:portal-p2-1`, `prove:portal-p2-1-composed`). ⛔ **NO migration** — a management SELECT policy and a matching `authenticated` grant already existed on all eight relations, MEASURED at HEAD (leg `P21-3`). Three `REGISTERED-OMISSION`s: `Asst.` (never ends), `X / 12 Lessons done` (ends at `P2-2`/`P2-6`), the frame's `Junior` tab (never ends) |
| 13 | Final | ~~`Not implemented`~~ ✅ **`Implemented`** — 2026-08-13, plan phase `P2-4`, at the canonical route `/management/classes/[classModuleId]` | No | — | `Post-48-hour final-MVP scope` — ✅ **BUILT, and the per-row status gating WAS built to the rule rather than inferred from the frame.** Two reviewed `SECURITY DEFINER` reads; **zero new table, column, enum, policy or write grant; registry UNMOVED at 21**. ⛔ **The frame's B.E.S.T. Ratings and rubric focus-area list are NOT built** — `C-9`/`G-2` override the frame, enforced by migration assertion `V-4`, suite `P26-7` and a contract with no field that could hold a rating. ✅ **`C-17`'s Class Health Summary IS built**, verbatim from `CLAUDE.md` §6. ⛔ **No Edit affordance** — neither this frame nor `12` draws one to `27`; ruled a **DESIGN GAP, not a build gap** |
| 14 | Final | `Not implemented` | No | — | `Post-48-hour final-MVP scope` **+ `Backend dependency missing`** — no lesson-plan schema, RPC or governance |
| 15 | Final | `Not implemented` | No | — | `Post-48-hour final-MVP scope` **+ `Backend dependency missing`** — no session-level statistics projection |
| 16 | Final | `Not implemented` | No | — | `Post-48-hour final-MVP scope` **+ `Backend dependency missing`** — no class statistics projection; "Management Insight" content is governed by `CLAUDE.md` §6's exact deterministic template |
| 17 | Final | `Not implemented` | No | — | `Post-48-hour final-MVP scope` |
| 18 | Final | `Not implemented` | No | — | `Post-48-hour final-MVP scope` |
| 19 | Final | `Implemented but visually unaligned` | **Yes** | **9** | Route mismatch; visual reconciliation outstanding |
| 20 | Final | `Not implemented` | No | — | `Post-48-hour final-MVP scope` **+ `Governance decision missing`** — exact student-profile field inventory UNRESOLVED (Figma matrix §5.2) |
| 21 | Final | `Not implemented` | No | — | `Post-48-hour final-MVP scope` **+ `Governance decision missing`** — exact parent-profile field inventory UNRESOLVED; no plaintext password may ever appear (A-020, A-027) |
| 22 | Final | `Not implemented` | No | — | `Post-48-hour final-MVP scope` |
| 23 | Final | `Not implemented` | No | — | `Post-48-hour final-MVP scope` |
| 24 | Final | `Not implemented` | No | — | `Post-48-hour final-MVP scope` **+ `Governance decision missing`** — exact trainer-profile field inventory UNRESOLVED |
| 25 | Final | `Not implemented` | No | — | `Post-48-hour final-MVP scope` — the calendar is a **projection** of class-session records; no duplicated event table may be created (A-016) |
| 26 | Final | ~~`Not implemented`~~ ✅ **`Implemented`** — 2026-08-13, plan phase `P2-2`, at the canonical route `/management/classes/add-class` | No | — | `Post-48-hour final-MVP scope` — ~~**+ `Governance decision missing`** — exact Create Class field inventory UNRESOLVED and flagged schema-relevant~~ ✅ **THE FIELD INVENTORY IS RULED**: `C-14` omits `Class code`, `Capacity` and `programme` and makes a recurring pattern *"a generator, not a stored schedule"*; `C-6`/`D-3` place terms as SCHEDULING STRUCTURE with no lessons entity; `A-014`/`G-7` bar the TA slot. ⛔ **ONE ITEM IS STILL OWED TO THE OPERATOR** — trainer assignment needs `admin.trainer_assigned`, a THIRD audit string this phase's authorization did not name, and it is **STOPPED**, enforced by migration assertion `C-8` |
| 27 | Final | ~~`Not implemented`~~ ✅ **`Implemented`** — 2026-08-13, plan phase `P2-3`, at the canonical route `/management/classes/[classModuleId]/edit` | No | — | `Post-48-hour final-MVP scope` — ✅ **BUILT.** Two reviewed `SECURITY DEFINER` update RPCs; **audit registry 19 → 21** on `admin.module_updated` and `admin.session_updated`, the exact two the Operator authorized with the count stated in advance; **no new table, enum, policy or client write grant**. ⛔ **THREE REFUSALS, each removing a control the frame draws**: (1) the **Sun–Sat day strip is ABSENT, not disabled** — changing meeting days means REMOVING sessions and **no cancel/delete audit string exists**, and a session may already carry attendance, an observation or a submitted report; (2) **no unassign** — leaving a session with nobody is a different action with no string, though choosing a DIFFERENT trainer reassigns; (3) **no `Class code` / `Capacity` / `Program`** (`C-14`; "programme" has no entity under `A-016`). ⚠️ **NO RATIFIED FRAME DRAWS AN INBOUND CONTROL TO THIS SCREEN** — `Management - Classes` sends a card to Class Overview and Class Overview names no Edit control at all. **No affordance was invented on `12`**; reported as a dependency |
| 28 | Final | `Not implemented` | No | — | **`Governance decision missing`** — term-report **generation is explicitly out of MVP scope** (`CLAUDE.md` §5, §8; spec §28). Separately governed before implementation |
| 29 | Final | `Implemented but visually unaligned` | **Yes** | **8** | Canonical route satisfied; visual reconciliation outstanding |

### 3.3 Dependencies and route compatibility

| ID | Backend dependency | Screenshot status | Current frontend route | Compatibility treatment |
|---|---|---|---|---|
| 11 | Centre-scoped summary projection — **not delivered**; the current landing surface reads the queue projections | Not captured — pack pending | `/management` | **Preserve existing route as redirect** — `/management` redirects to `/management/dashboard` |
| 12 | ~~**Missing** — no class-module list projection~~ ✅ **DELIVERED 2026-08-12 (`P2-1`)** — `listClassModulesCore` (class-session) + `listManagementClassesCore` (management-view) + `adapterListManagementClasses`. ⛔ **RLS-scoped over the caller's own credential; no new RPC, policy, grant or table** | ⛔ **NOT CAPTURED — RENDERED CAPTURE stays `NOT-RUN`** on every authenticated surface (`PORTAL_COMPLETION_PLAN.md` §10). A green DOM-text proof is not a visual acceptance | ✅ `/management/classes` — **the canonical route** | Not applicable — the route was CREATED at its canonical path; nothing was moved, renamed or aliased |
| 13 | **Missing** — no class-overview projection; per-row status gating ratified but unbuilt | Not captured — pack pending | — | Not applicable |
| 14 | **Missing** — no lesson-plan schema or RPC | Not captured — pack pending | — | Not applicable |
| 15 | **Missing** — no lesson-statistics projection | Not captured — pack pending | — | Not applicable |
| 16 | **Missing** — no class-statistics projection | Not captured — pack pending | — | Not applicable |
| 17 | **Missing** — no management student-list projection | Not captured — pack pending | — | Not applicable |
| 18 | **Missing** — no student-profile projection | Not captured — pack pending | — | Not applicable |
| 19 | `report_get_management_review` (RPC-15), `report_get_canonical` (RPC-13), `report_management_edit_wording` (RPC-9), `report_management_return_to_trainer` (RPC-10), `report_management_approve_and_submit` (RPC-11) — **delivered** | Not captured — **required immediately** | `/management/reports/[reportId]/review`, `/management/reports/[reportId]/edit` | **Replace after integration**, pinned paths preserved as redirects |
| 20 | **Missing** — no student-creation write path; `students` has no Auth linkage by design (A-025) | Not captured — pack pending | — | Not applicable |
| 21 | **Missing** — no invitation write path; `invitations` holds zero policies and zero client privileges | Not captured — pack pending | — | Not applicable |
| 22 | **Missing** — no student-edit write path | Not captured — pack pending | — | Not applicable |
| 23 | **Missing** — no trainer-list projection | Not captured — pack pending | — | Not applicable |
| 24 | **Missing** — no trainer-creation/invitation write path | Not captured — pack pending | — | Not applicable |
| 25 | **Missing** — no management calendar projection | Not captured — pack pending | — | Not applicable |
| 26 | ~~**Missing** — no class-module creation write path~~ ✅ **DELIVERED 2026-08-13** — two reviewed `SECURITY DEFINER` RPCs (`admin_create_class_module`, `admin_create_class_session`) firing the two already-ratified audit strings; **ZERO tables, columns, enums, policies or client write grants; registry UNMOVED at 19**. ⛔ Trainer assignment **STOPPED** — needs a third string | ⛔ **NOT CAPTURED — VISUAL acceptance is `NOT-RUN` and not claimed** | — | Not applicable |
| 27 | **Missing** — no class-module edit write path | Not captured — pack pending | — | Not applicable |
| 28 | **Missing** — no term-report instrument, generator, schema or governance | Not captured — pack pending | — | Not applicable — **separately governed** |
| 29 | Management pending-review and correction-tracking queues (R-6, R-7) — **delivered** (`server/modules/management-view/projections.ts`) | Not captured — **required immediately** | `/management/reports` (`?status=trainer_approved`, `?status=needs_edit`) | **No route mismatch** — canonical route satisfied |

---

## 4. Parent screens (IDs 30–33)

**The original repeated Parent `30-` prefixes are normalized to IDs 30–33.** The four source entries all carried the prefix `30-`; they are distinct screens and are numbered distinctly here. This normalization is ratified by Amendment 005 **A-041**.

### 4.1 Identity

| ID | Role | Screen | Folder | Canonical route | Figma node | Figma URL |
|---|---|---|---|---|---|---|
| 30 | Parent | Parent Dashboard | `30-parent-dashboard` | `/parent/dashboard` | `420:9` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=420-9&m=dev |
| 31 | Parent | Parent Calendar | `31-parent-calendar` | `/parent/calendar` | `622:91` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=622-91&m=dev |
| 32 | Parent | Parent Reports | `32-parent-reports` | `/parent/reports` | `533:180` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=533-180&m=dev |
| 33 | Parent | Parent Class Report | `33-parent-class-report` | `/parent/reports/[reportId]` | `627:9` | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=627-9&m=dev |

### 4.2 Status

| ID | Final visual status | Current implementation status | 48-hour core slice | Physical-test flow order | Implementation gap classification |
|---|---|---|---|---|---|
| 30 | Final | `Partially implemented` | No | — | `Post-48-hour final-MVP scope` — a parent landing/availability surface exists at a non-canonical route |
| 31 | Final | `Not implemented` | No | — | `Post-48-hour final-MVP scope` **+ `Backend dependency missing`** — no parent calendar projection |
| 32 | Final | `Implemented but visually unaligned` | **Yes** | **11** | Canonical route satisfied; visual reconciliation outstanding |
| 33 | Final | `Implemented but visually unaligned` | **Yes** | **12** | Route mismatch; visual reconciliation outstanding |

### 4.3 Dependencies and route compatibility

| ID | Backend dependency | Screenshot status | Current frontend route | Compatibility treatment |
|---|---|---|---|---|
| 30 | Parent availability projection (R-10) — **delivered** (`server/modules/parent-view/projections.ts`) | Not captured — pack pending | `/parent` | **Preserve existing route as redirect** — `/parent` redirects to `/parent/dashboard` |
| 31 | **Missing** — no parent calendar projection over class sessions | Not captured — pack pending | — | Not applicable |
| 32 | Parent submitted-report list (R-9) — **delivered** | Not captured — **required immediately** | `/parent/reports` | **No route mismatch** — canonical route satisfied |
| 33 | `report_get_canonical` (RPC-13) via `app_parent_reaches_student` — **delivered** | Not captured — **required immediately** | `/parent/students/[studentId]/sessions/[sessionId]/report` | **Replace after integration**, pinned path preserved as a redirect |

### 4.4 Parent boundary — restated, not created

Parent access is **submitted-canonical and view-only**, and this is **unchanged and absolute**. Parents read only the version `reports.latest_submitted_version_id` names, and only for students reachable through a live `parent_student_links` row. **Parent child selection is limited to linked children.** **No per-dimension rating grid appears in any parent surface, in any form or wording.** No content hash, revision number, correction reason, trainer note, draft, AI history or audit row ever reaches a parent surface, and nothing may disclose that a correction cycle is or was underway.

The multi-child dropdown described in the operator's source list for IDs 30–32 is a **presentation affordance over linked children only** — it is never a child picker over the centre's students.

---

## 5. Twelve-screen physical-test flow

**Exactly twelve visual-reference screens are immediate physical-test blockers.** The flow order is contiguous 1–12.

| Flow order | Screen ID | Role | Screen | Canonical route | Current frontend route |
|---:|---|---|---|---|---|
| 1 | AUTH-01 | Trainer | Trainer Login | `/login?role=trainer` | `/login?role=trainer` |
| 2 | 05 | Trainer | Trainer Schedule | `/trainer/schedule` | — (folded into `/trainer`) |
| 3 | 06 | Trainer | Trainer Student Roster | `/trainer/schedule/[sessionId]/student-roster` | `/trainer/sessions/[sessionId]/roster` |
| 4 | 07 | Trainer | Trainer Grade Student | `/trainer/schedule/[sessionId]/student-roster/[studentId]/grade-student` | `/trainer/sessions/[sessionId]/students/[studentId]/assess` |
| 5 | 08 | Trainer | Trainer AI Report Generation | `/trainer/schedule/[sessionId]/student-roster/[studentId]/grade-student/ai-report-generation` | `/trainer/reports/[reportId]/generate` |
| 6 | 10 | Trainer | Trainer Student Report | `/trainer/reports/[reportId]` | `/trainer/reports/[reportId]/review` |
| 7 | AUTH-02 | Management | Management Login | `/login?role=management` | `/login?role=management` |
| 8 | 29 | Management | Management Reports | `/management/reports` | `/management/reports` |
| 9 | 19 | Management | Management Student Report | `/management/students/[studentId]/reports/[reportId]` | `/management/reports/[reportId]/review` |
| 10 | AUTH-03 | Parent | Parent Login | `/login?role=parent` | `/login?role=parent` |
| 11 | 32 | Parent | Parent Reports | `/parent/reports` | `/parent/reports` |
| 12 | 33 | Parent | Parent Class Report | `/parent/reports/[reportId]` | `/parent/students/[studentId]/sessions/[sessionId]/report` |

### 5.1 The governed physical-test workflow

```
Trainer sign-in
  → session selection
    → roster
      → student assessment
        → grounded AI report generation
          → Trainer review / edit / checklist / approval
            → Management sign-in
              → Management queue
                → Management wording edit, return, or final Approve & Submit
                  → Parent sign-in
                    → Parent submitted-report list
                      → Parent canonical report detail
```

**The governed lifecycle includes Trainer approval before Management final submission even where a high-level description abbreviates it.** Trainer approval commits `draft_ready | needs_edit → trainer_approved`, freezes that version and **publishes nothing**. Management's Approve & Submit is the **only** action that makes a report parent-visible (A-033). Where management returns a report, the trainer owns the correction and **must reapprove through a new immutable version** — a silent byte-identical save is rejected server-side (A-035/A-036).

### 5.2 What the twelve screens do not cover

Six of the eight **blocked design families** recorded in `FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md` §0.1 are exercised by the physical-test walkthrough but have **no Figma frame in this inventory**, because no suitable frame exists: management review queue, management final review, wording-only editor, return-to-trainer dialog, correction tracking, and final Approve & Submit. The two notification surfaces are the remaining two families.

**These are not omissions from the 36-screen inventory — they are screens the Figma file does not contain.** They are built to the governed contract's field lists and to the ratified rules. **No frame, node ID or field may be invented for any of them** (`CLAUDE.md` §12, A-022.2). Screens 19 and 29 in this inventory are the *canonical submitted-report* surfaces; the management review-stage surfaces are separate and still blocked.

---

## 6. Twenty-four deferred portal screens

The remaining **24 portal screens** remain **required for the final MVP** but are **not required before the physical test**. They are classified `Post-48-hour final-MVP scope`, with any additional dependency classification recorded in §2–§4.

| # | ID | Screen | Additional classification |
|---:|---|---|---|
| 1 | 01 | Trainer Dashboard | Partially implemented at `/trainer` |
| 2 | 02 | Trainer My Classes | — |
| 3 | 03 | Trainer Lesson Plan | `Backend dependency missing` |
| 4 | 04 | Trainer Students | — |
| 5 | 09 | Trainer Reports | Partially implemented at the canonical route |
| 6 | 11 | Management Dashboard | Partially implemented at `/management` |
| 7 | 12 | Management Classes | — |
| 8 | 13 | Management Class Overview | — |
| 9 | 14 | Management Lesson Plan Management | `Backend dependency missing` |
| 10 | 15 | Management Lesson Statistics | `Backend dependency missing` |
| 11 | 16 | Management Class Statistics | `Backend dependency missing` |
| 12 | 17 | Management Students | — |
| 13 | 18 | Management Student Profile | — |
| 14 | 20 | Management Register New Student | `Governance decision missing` |
| 15 | 21 | Management Create Parent Account | `Governance decision missing` |
| 16 | 22 | Management Edit Student | — |
| 17 | 23 | Management Trainers | — |
| 18 | 24 | Management Add Trainer | `Governance decision missing` |
| 19 | 25 | Management Schedule | — |
| 20 | 26 | Management Add Class | ~~`Governance decision missing`~~ ✅ **RULED** (`C-14`, `C-6`/`D-3`, `A-014`/`G-7`) and **BUILT 2026-08-13**. ⛔ One item owed: the trainer-assignment audit string |
| 21 | 27 | Management Edit Class | ~~—~~ ✅ **BUILT 2026-08-13** (`P2-3`). ⚠️ One item owed: **no ratified frame draws an inbound control to `27`** — reported, never invented |
| 22 | 28 | Management Term Report | `Governance decision missing` — separately governed |
| 23 | 30 | Parent Dashboard | Partially implemented at `/parent` |
| 24 | 31 | Parent Calendar | `Backend dependency missing` |

**These 24 screens must not be required to be visually complete before the physical test.** No active document may state or imply that all 36 screens are required before the physical test.

---

## 7. Route compatibility

**No route code was edited at this checkpoint.** This section records the mismatches and the chosen treatment for each; execution belongs to a later, separately-authorized route-migration checkpoint.

### 7.1 Why mismatches exist

The currently implemented routes were built to **`docs/plan/PHYSICAL_TEST_SLICE_48H.md` §4**, which pins a route contract and states that *"neither agent may rename, add or restructure a route family without a §9 blocker."* Those routes are therefore **correct against the contract that governed them**. The canonical routes ratified by Amendment 005 **A-042** come from the orchestrator's compiled Figma screen list and describe the final MVP's information architecture. **Both are legitimate; they are reconciled here rather than one being declared wrong.**

**The contract's pinned routes are not superseded for the physical test.** Amendment 005 A-042 ratifies the canonical routes as the **final-MVP target**; the physical test runs on the pinned routes.

### 7.2 Mismatch register — core-slice screens first

| Priority | ID | Canonical route | Currently implemented route | Treatment |
|---|---|---|---|---|
| **Core 3** | 06 | `/trainer/schedule/[sessionId]/student-roster` | `/trainer/sessions/[sessionId]/roster` | **Replace after integration** — move to canonical after the physical test; preserve the pinned path as a redirect |
| **Core 4** | 07 | `/trainer/schedule/[sessionId]/student-roster/[studentId]/grade-student` | `/trainer/sessions/[sessionId]/students/[studentId]/assess` | **Replace after integration**; pinned path preserved as a redirect |
| **Core 5** | 08 | `/trainer/schedule/[sessionId]/student-roster/[studentId]/grade-student/ai-report-generation` | `/trainer/reports/[reportId]/generate` | **Replace after integration**; pinned path preserved as a redirect. Note the canonical route is keyed on `(sessionId, studentId)` and the implemented route on `reportId` — the move requires a server-side resolution the trainer projections already perform |
| **Core 6** | 10 | `/trainer/reports/[reportId]` | `/trainer/reports/[reportId]/review` (+ `/edit`) | **Replace after integration** — add the canonical index route; `/review` and `/edit` remain as governed sub-surfaces |
| **Core 9** | 19 | `/management/students/[studentId]/reports/[reportId]` | `/management/reports/[reportId]/review` (+ `/edit`) | **Replace after integration**; pinned paths preserved as redirects. The canonical route adds a `[studentId]` segment the implemented route resolves server-side |
| **Core 12** | 33 | `/parent/reports/[reportId]` | `/parent/students/[studentId]/sessions/[sessionId]/report` | **Replace after integration**; pinned path preserved as a redirect. The implemented route matches the canonical read RPC's `(class_session_id, student_id)` key directly; the canonical route requires a `reportId` → pair resolution server-side |
| Deferred | 01 | `/trainer/dashboard` | `/trainer` | **Preserve existing route as redirect** |
| Deferred | 11 | `/management/dashboard` | `/management` | **Preserve existing route as redirect** |
| Deferred | 30 | `/parent/dashboard` | `/parent` | **Preserve existing route as redirect** |

**Canonical routes already satisfied, with no mismatch:** AUTH-01, AUTH-02, AUTH-03 (`/login` + role query), **09** (`/trainer/reports`), **29** (`/management/reports`), **32** (`/parent/reports`).

### 7.3 Coverage gap — one core screen has no route at all

~~**ID 05 Trainer Schedule (`/trainer/schedule`, flow order 2) has no implemented route.** Session selection is currently performed on the trainer landing surface at `/trainer`. This is a **coverage gap, not a route mismatch**, and it is the single most consequential finding of this reconciliation for the physical test.~~ **✅ CORRECTED 2026-08-08 (Phase A2, S-15). THE GAP IS CLOSED.** `app/(portals)/trainer/schedule/page.tsx` exists and is verified on disk; it was created by checkpoint **F-04** under operator ruling **R-B1**, and `/trainer` now redirects to it as a compatibility alias (Authority Lock §28.6). **Open decision U-A5-1 is closed** and must not be re-raised from this paragraph.

**Treatment: `Operator decision required`.** Two defensible options, neither of which this checkpoint may choose:

1. **Accept the fold.** Treat the trainer landing surface as satisfying flow step 2 for the physical test, and build `/trainer/schedule` to node `591:9` post-test. The walkthrough still works end to end; the twelve-screen visual subset is then eleven screens against frozen references plus one deliberately-substituted surface.
2. **Build `/trainer/schedule` before the test.** This adds a route and a schedule/date projection over existing class-session records — new frontend and backend work inside the 48-hour window, and a route addition the contract §4 pins.

**This checkpoint records the decision; it does not make it, and it created no route.**

### 7.4 Implemented routes with no canonical inventory ID

| Implemented route | What it serves | Treatment |
|---|---|---|
| `/trainer/reports/[reportId]/edit` | Trainer wording edit — a governed sub-surface of ID 10 | **Operator decision required** — whether it becomes a canonical sub-route of ID 10 or receives its own ID once a frame exists |
| `/management/reports/[reportId]/edit` | Wording-only editor — blocked design family 3 | **Operator decision required** — no Figma frame exists; it cannot be assigned an inventory ID without one |
| `/management/reports/[reportId]/review` | Management **final review** (blocked family 2), distinct from ID 19's canonical submitted report | **Operator decision required** — the route currently carries two governed surfaces; whether they separate is a design decision |
| `/trainer/reports?status=needs_edit` | Returned-correction queue | **Preserve as compatibility alias** — a query variant of ID 09, not a separate route |
| `/management/reports?status=trainer_approved` / `?status=needs_edit` | Pending-review and correction-tracking queues | **Preserve as compatibility alias** — query variants of ID 29 |
| `/` (`app/page.tsx`) | Root entry — redirect-only, `dynamic="force-dynamic"`; sends the caller to `/login` or their portal home. Renders nothing | **✅ ADDED 2026-08-08 (Phase A2, S-17).** This register listed **5** unmapped implemented routes; there are **6** — the root route was absent (Authority Lock §28.6). **No decision required:** it is a redirect, not a screen surface, and correctly holds no inventory ID |

**✅ Dispositions updated 2026-08-08 (Phase A2, operator rulings Q-20, Q-23):** `/trainer/reports/[reportId]/edit` is **RULED a canonical sub-route/state of governed screen ID 10** and does **not** receive another screen ID without explicit future authority (Q-23). `/management/reports/[reportId]/edit` is **RULED required Final MVP functionality** to be implemented in Phase B as a **derived governed surface** inheriting the nearest authoritative Management report shell, layout, typography and interaction conventions — exposing only wording-only controls, and **not becoming a new authoritative Figma screen** (Q-20). Management still may never change ratings, attendance, observations, trainer notes, evidence or any assessment fact.

---

## 8. Backend and governance dependencies

**Screen presence is not authorization.** Everything below is recorded as a **dependency**, never invented as behaviour.

### 8.1 ~~Delivered on `feat/48h-backend` (not yet merged to `main`)~~ → **Delivered and MERGED to `main`**

> **✅ CORRECTED 2026-08-08 (Phase A2, S-16/S-18).** All work described in this section **is on `main`**. Both 48H branches are **0 commits ahead of `main`** (`git rev-list --count main..feat/48h-backend` = 0; `git diff main...feat/48h-backend --stat` = empty), and both are **`CLOSED_BY_NONUSE_POLICY`** (`CLAUDE.md` §14.3a; Authority Lock §31.11) — **frozen historical artefacts that may never be used for Final MVP implementation**. Their physical worktree directories were removed in Phase A2 after preservation; the branches and commits remain, anchored by tags `frozen/48h-backend-402b0b6` and `frozen/48h-frontend-6762b5c`.
>
> ⚠️ **Every "delivered on `feat/48h-backend`" phrase below is historical provenance, not a live delivery surface.** Do not check out, branch from, or look for current code in either worktree. **All future work starts from `main`.**

Real authentication and server-derived role resolution; the Step 7I governed report lifecycle and its RPCs; governed assessment persistence (`assessment_save_observation`, `assessment_get_trainer_observation`); trainer, management and parent read projections; the AI provider boundary and deterministic grounding; management correction tracking. These carry the **core-slice** screens.

### 8.2 Missing backend paths, by screen

| Dependency | Screens blocked |
|---|---|
| Lesson-plan schema, RPC and governance — none exists in the 26-table / 12-enum census | 03, 14 |
| Statistics projections (session-level and class-level) | 15, 16 |
| Class-module list, overview and calendar projections | 12, 13, 25 |
| Management student/trainer list, profile and edit projections and write paths | 17, 18, 22, 23 |
| Creation and invitation write paths (`invitations` holds zero policies and zero client privileges) | 20, 21, 24, 26, 27 |
| Trainer-scoped class and student projections | 02, 04 |
| Parent calendar projection | 31 |
| Term-report instrument and generator — **explicitly out of MVP scope** | 28 |
| Trainer schedule/date projection | 05 (core slice) |
| Centre-scoped management dashboard summary projection | 11 |

### 8.3 Open governance decisions carried, not resolved

| Item | Effect on this inventory |
|---|---|
| **CP-3** — queue and list projections beyond those delivered | Recorded; several deferred screens depend on the same decision |
| **CP-5** / N-4 — deterministic management bootstrap | Non-blocking for the physical test |
| **U-09 / U-10 / U-11** — evidence scope, uploader and frames | No evidence surface appears in this inventory |
| Exact field inventories for Create Class, student, parent and trainer profiles | 20, 21, 24, 26 cannot be built without them; **do not invent a field** |
| **Management Term Report** governance | 28 remains separately governed before implementation |
| Eight blocked design families | No frame exists; **do not invent one** |

### 8.4 What this inventory does not change

- It does **not** amend Specification v3 or Amendments 001–004.
- It does **not** alter the competency-rating vocabulary. **That vocabulary is now ratified by Amendment 006 (A-049, 2026-08-05) as `Beginning` → `Developing` → `Mastering` → `Mastered`**; the reconciliation checkpoint this document formerly pointed to has **completed its governance stage**. Nothing in this inventory — screen counts, IDs, nodes, routes, the twelve-screen physical-test subset or any Amendment 005 decision — is affected by it.
- It does **not** alter the canonical hierarchy: **Centre → Class Grade → Class Module → Class Session**.
- It does **not** create, move, delete or restyle any application code, route or component.
- It does **not** authorize any checkpoint.

**"Class type" presentation maps to Class Module.** The operator's source list describes IDs 13–16 and 27 in terms of a "class type" (junior public speaking, intermediate public speaking, and so on). Under the ratified hierarchy the persisted entity is the **Class Module** under a selected **Class Grade**, and the canonical routes use `[classModuleId]` accordingly. **No hidden `classes` entity is introduced** (A-016), and this mapping stands unless a later amendment changes it (A-047).

---

*Created 2026-08-05 at the Final MVP visual-screen inventory and 48-hour core-slice reconciliation checkpoint. No Figma asset was scraped, exported, downloaded or ported; no node ID was fabricated; no application code was created, moved, deleted or restyled; and no Supabase, Docker, migration, fixture, build or server was run.*
