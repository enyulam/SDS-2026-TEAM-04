# 29 - Management Reports

**Role:** Management
**Folder:** `29-management-reports`
**Pack:** Final MVP UI reference pack. This is a visual reference, not application source code.

---

## 1. Identity

| Field | Value |
|---|---|
| Screen ID | `29` |
| Screen name | Management Reports |
| Role | Management |
| Folder | `29-management-reports` |
| Canonical route | `/management/reports` |
| Current implemented route | /management/reports (`?status=trainer_approved`, `?status=needs_edit`) |
| Route-compatibility treatment | No route mismatch â€” canonical route satisfied. Query variants preserved as compatibility aliases |
| Figma file key | `sSY1TYw3jyVlZDy8V2Mu7g` |
| Figma file name | `SDS-dashboard` |
| Figma node | `527:170` |
| Exact node-specific URL | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=527-170&m=dev |

**No route is created, moved, renamed or redirected by this pack.** Every compatibility treatment above is recorded from the ratified inventory and requires its own authorization to execute.

---

## 2. Scope membership

| Field | Value |
|---|---|
| Final-MVP membership | Yes - one of the ratified 36 screens (Amendment 005 A-041) |
| 48-hour core membership | **Yes** - core, flow order 8 |
| Physical-test flow order | 8 |
| Screenshot priority | Core - required before the physical test |

This screen is a blocking visual and functional dependency for the integrated physical-test walkthrough.

---

## 3. Frozen screenshot

| Field | Value |
|---|---|
| Screenshot filename | `reference.png` |
| Screenshot status | Validated — ready for implementation |
| Native dimensions | **1440 × 1160 px** (aspect 36:29) - measured from the frozen file |
| Validation classification | `PASS WITH NOTE — READY` |
| Validation date | 2026-08-06 |
| File size | 98,030 bytes |
| SHA-256 | `eddda3b14c7e34747b237545116a6fb91e356ec3c9155fc7f8f28e00bae54c19` |
| Validation note | Figma connector unavailable at validation; native node dimensions not independently verified and node-level comparison not performed. Node association is from recorded pack metadata and corroborating visual identity. Local technical and visual evidence sufficient. Native frame is taller than its current content, leaving empty page background below; this is the frame's own height, not a crop. |
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

Shows pending Management review and governed correction tracking.

---

## 6. Implementation

| Field | Value |
|---|---|
| Current implementation status | `Implemented but visually unaligned` |

### Existing functionality to preserve

The canonical `/management/reports` route, the R-6 and R-7 queue projections and the `?status=` compatibility aliases.

### Allowed frontend expansion

Visual reconstruction to node `527:170`; queue rows, filters, empty, loading and error states.

Frontend architecture may be created **where authorized** - routes, layouts, components and states that serve already-governed behaviour. Anything that would require new backend behaviour, a new permission or an unratified rule is a dependency, not an expansion.

### Prohibited invention

Do not surface a DTO field the Â§5.5 exclusions forbid. Do not expose reports outside the authenticated centre membership.

Missing backend or governance requirements are **recorded, never invented**.

---

## 7. Dependencies

### Backend

Management pending-review and correction-tracking queues (R-6, R-7) â€” **delivered** (`server/modules/management-view/projections.ts`).

### Governance

Management DTO exclusions are absolute (physical-test contract Â§5.5). Nothing in a queue row may disclose assessment internals.

---

## 8. Competency vocabulary

**Not rating-bearing.** This screen surfaces no competency-rating vocabulary.

The ratified vocabulary (Amendment 006 A-049) is Beginning / Developing / Mastering / Mastered, with canonical values `beginning`, `developing`, `mastering`, `mastered`. Implementation remains pending Backend V2 and Frontend V3.

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
- [ ] Pending Management review and governed correction tracking are both represented.
- [ ] The ``?status=`` query variants continue to work as compatibility aliases.

---

## 11. Privacy and security checklist

- [ ] Synthetic data only appears in the frozen screenshot and in any captured implementation screenshot.
- [ ] No real name, email, phone number, address or other personal datum is visible.
- [ ] No secret, token, key or credential is visible.
- [ ] Authorization is proved server-side; no client-side condition grants access.
- [ ] Error, empty and denied states are non-disclosing.
- [ ] The Management DTO exclusions (contract 5.5) are satisfied - no excluded field is rendered.
- [ ] No Management affordance can modify a rating, observation, attendance record, evidence item or trainer note.
- [ ] Reports outside the authenticated centre membership are unreachable.

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