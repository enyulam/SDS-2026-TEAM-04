# 10 - Trainer Student Report

**Role:** Trainer
**Folder:** `10-trainer-student-report`
**Pack:** Final MVP UI reference pack. This is a visual reference, not application source code.

---

## 1. Identity

| Field | Value |
|---|---|
| Screen ID | `10` |
| Screen name | Trainer Student Report |
| Role | Trainer |
| Folder | `10-trainer-student-report` |
| Canonical route | `/trainer/reports/[reportId]` |
| Current implemented route | /trainer/reports/[reportId]/review, /trainer/reports/[reportId]/edit |
| Route-compatibility treatment | Replace after integration â€” add the canonical `[reportId]` index route; `/review` and `/edit` remain as governed sub-surfaces |
| Figma file key | `sSY1TYw3jyVlZDy8V2Mu7g` |
| Figma file name | `SDS-dashboard` |
| Figma node | `664:9` |
| Exact node-specific URL | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=664-9&m=dev |

**No route is created, moved, renamed or redirected by this pack.** Every compatibility treatment above is recorded from the ratified inventory and requires its own authorization to execute.

---

## 2. Scope membership

| Field | Value |
|---|---|
| Final-MVP membership | Yes - one of the ratified 36 screens (Amendment 005 A-041) |
| 48-hour core membership | **Yes** - core, flow order 6 |
| Physical-test flow order | 6 |
| Screenshot priority | Core - required before the physical test |

This screen is a blocking visual and functional dependency for the integrated physical-test walkthrough.

---

## 3. Frozen screenshot

| Field | Value |
|---|---|
| Screenshot filename | `reference.png` |
| Screenshot status | Validated — ready for implementation |
| Native dimensions | **1440 × 1351 px** (aspect 1440:1351) - measured from the frozen file |
| Validation classification | `PASS WITH NOTE — READY` |
| Validation date | 2026-08-06 |
| File size | 285,426 bytes |
| SHA-256 | `e64291dc80a2af7378635a3daffe63952899768c41493e8a185da12119b4f730` |
| Validation note | Figma connector unavailable at validation; native node dimensions not independently verified and node-level comparison not performed. Node association is from recorded pack metadata and corroborating visual identity. Local technical and visual evidence sufficient. |
| Export rule | Export the exact node-specific Figma frame. An overview-canvas screenshot is not acceptable. |

The frozen `reference.png` **overrides later unreviewed live-Figma changes** for the corresponding implementation checkpoint. If the live canvas has moved on, that is a change to record in `CHANGE_LOG.md` and re-freeze, not a reason to drift.

---

## 4. Source precedence

**Visual authority (highest first):**

1. This folder's frozen `reference.png`
2. The exact node-specific Figma frame
3. The existing frontend implementation

**Functional, privacy and security authority (highest first):**

1. Specification v3 and Amendments 001-006
2. `CLAUDE.md`
3. Ratified lifecycle and authorization baselines
4. The physical-test implementation contract
5. Figma

**Figma never bypasses governance.** Where a frame and a ratified rule disagree, the ratified rule wins and the discrepancy is recorded, never silently resolved. **Screen presence is not authorization.**

---

## 5. Screen responsibility

Trainer reviews and edits parent-facing wording, completes the checklist and approves for Management review. Trainer approval does not publish.

---

## 6. Implementation

| Field | Value |
|---|---|
| Current implementation status | `Implemented but visually unaligned` |

### Existing functionality to preserve

The pinned `/review` and `/edit` sub-routes, the checklist RPC, the trainer-approve transition, immutable version creation and the byte-identical-save rejection.

### Allowed frontend expansion

Visual reconstruction to node `664:9`; add the canonical `[reportId]` index; review, edit, checklist and approval states.

Frontend architecture may be created **where authorized** - routes, layouts, components and states that serve already-governed behaviour. Anything that would require new backend behaviour, a new permission or an unratified rule is a dependency, not an expansion.

### Prohibited invention

Do not make trainer approval publish anything to a parent (A-033). Do not permit an approval that bypasses the checklist. Do not allow a silent byte-identical resubmission to satisfy a correction.

Missing backend or governance requirements are **recorded, never invented**.

---

## 7. Dependencies

### Backend

`report_get_working` (RPC-14), `report_get_canonical` (RPC-13), `report_update_checklist` (RPC-7), `report_trainer_approve` (RPC-8) â€” **delivered**.

### Governance

Trainer approval commits `draft_ready | needs_edit` to `trainer_approved`, freezes that version and **publishes nothing**. Where Management returns a report, the trainer owns the correction and must reapprove through a new immutable version; a silent byte-identical save is rejected server-side (A-035/A-036).

---

## 8. Competency vocabulary

**This is a rating-bearing screen.**

Beginning / Developing / Mastering / Mastered is ratified by Amendment 006, but code implementation remains pending Backend V2 and Frontend V3.

| Ordinal | Display label | Canonical value | Polarity |
|---:|---|---|---|
| 1 | Beginning | `beginning` | needs support |
| 2 | Developing | `developing` | developing |
| 3 | Mastering | `mastering` | positive |
| 4 | Mastered | `mastered` | positive and exceeds expectations |

Until V2 lands the database still stores the superseded labels. Do not "fix" a mismatch between code and the ratified vocabulary inside a visual checkpoint - the bounded sequence is `docs/plan/COMPETENCY_VOCABULARY_RECONCILIATION_PLAN.md` and V2/V3 each require separate authorization.

Class Grade remains Beginner / Intermediate / Advanced. `Advanced` as a Class Grade must not be globally replaced (A-054).

---

## 9. Visual acceptance checklist

- [x] `reference.png` is present and is the exact node-specific frame, not an overview-canvas capture. *(Validated 2026-08-06: complete top-level frame, not an overview canvas. Node identity from recorded metadata - see the validation note in section 3.)*
- [x] Native frame dimensions are recorded in section 3.
- [ ] Layout, spacing and visual hierarchy match the frozen reference at the reference viewport.
- [ ] Typography, colour, radii and shadows match the approved token inventory.
- [ ] Component composition and visible fields match the frame.
- [ ] Screen labels and microcopy match the frame, except where a ratified rule overrides them.
- [ ] Visual states shown in the frame are reproduced.
- [ ] Responsive behaviour is correct at the reference viewport and degrades sensibly.
- [ ] Assets are reused from the approved asset set; nothing was re-drawn ad hoc.
- [ ] Any frame-versus-governance discrepancy is recorded rather than silently resolved.

---

## 10. Functional acceptance checklist

- [ ] Governed functionality that existed before this checkpoint still works.
- [ ] Every read goes through a governed projection or RPC; no direct table access from the client.
- [ ] Loading, empty, validation, error, success and disabled states are built, not only the happy path.
- [ ] No behaviour was invented to satisfy a frame; every gap is recorded as a dependency.
- [ ] No lifecycle transition, role, permission or mutation was authorized by the presence of a control.
- [ ] Trainer approval commits the governed transition and publishes nothing.
- [ ] The checklist must be complete before approval.
- [ ] A correction produces a new immutable version; a byte-identical save is rejected server-side.

---

## 11. Privacy and security checklist

- [ ] Synthetic data only appears in the frozen screenshot and in any captured implementation screenshot.
- [ ] No real name, email, phone number, address or other personal datum is visible.
- [ ] No secret, token, key or credential is visible.
- [ ] Authorization is proved server-side; no client-side condition grants access.
- [ ] Error, empty and denied states are non-disclosing.
- [ ] Only sessions and students reachable through a live class-session assignment are visible.
- [ ] No trainer affordance publishes content to a parent.
- [ ] Assessment internals do not leak into parent-facing wording.

---

## 12. Implementation state

| Field | Value |
|---|---|
| `reference.png` present | Yes |
| Native dimensions recorded | Yes |
| Figma context retrieved | No - connector unavailable at the validation checkpoint |
| Existing route audited | No |
| `implementation-before.png` captured | No |
| `implementation-after.png` captured | No |
| Visual acceptance | Not started |
| Functional acceptance | Not started |
| Privacy and security acceptance | Not started |
| Implementation checkpoint committed | No |
| Blocking dependency raised | None recorded |


---

*Scaffolded at the Final MVP UI reference-pack checkpoint. Populated from the ratified inventory `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` and the amendments it is governed by. No node ID, route or status on this page was invented.*