# 32 - Parent Reports

**Role:** Parent
**Folder:** `32-parent-reports`
**Pack:** Final MVP UI reference pack. This is a visual reference, not application source code.

---

## 1. Identity

| Field | Value |
|---|---|
| Screen ID | `32` |
| Screen name | Parent Reports |
| Role | Parent |
| Folder | `32-parent-reports` |
| Canonical route | `/parent/reports` |
| Current implemented route | /parent/reports |
| Route-compatibility treatment | No route mismatch â€” canonical route satisfied |
| Figma file key | `sSY1TYw3jyVlZDy8V2Mu7g` |
| Figma file name | `SDS-dashboard` |
| Figma node | `533:180` |
| Exact node-specific URL | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=533-180&m=dev |

**No route is created, moved, renamed or redirected by this pack.** Every compatibility treatment above is recorded from the ratified inventory and requires its own authorization to execute.

---

## 2. Scope membership

| Field | Value |
|---|---|
| Final-MVP membership | Yes - one of the ratified 36 screens (Amendment 005 A-041) |
| 48-hour core membership | **Yes** - core, flow order 11 |
| Physical-test flow order | 11 |
| Screenshot priority | Core - required before the physical test |

This screen is a blocking visual and functional dependency for the integrated physical-test walkthrough.

---

## 3. Frozen screenshot

| Field | Value |
|---|---|
| Screenshot filename | `reference.png` |
| Screenshot status | Validated — ready for implementation |
| Native dimensions | **1440 × 1120 px** (aspect 9:7) - measured from the frozen file |
| Validation classification | `PASS WITH NOTE — READY` |
| Validation date | 2026-08-06 |
| File size | 73,658 bytes |
| SHA-256 | `90e368c17826bb114173ec5f40f9421eaa33d81aa2032bd0e8a97db01e370aea` |
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

Shows only submitted canonical reports belonging to children linked to the authenticated Parent.

---

## 6. Implementation

| Field | Value |
|---|---|
| Current implementation status | `Implemented but visually unaligned` |

### Existing functionality to preserve

The canonical `/parent/reports` route, the R-9 submitted-report list and the live-link reachability check.

### Allowed frontend expansion

Visual reconstruction to node `533:180`; list rows, the linked-children affordance, empty, loading and error states.

Frontend architecture may be created **where authorized** - routes, layouts, components and states that serve already-governed behaviour. Anything that would require new backend behaviour, a new permission or an unratified rule is a dependency, not an expansion.

### Prohibited invention

Do not list an unsubmitted report. Do not list a report for a child the authenticated parent has no live link to. Do not disclose that a correction cycle is or was underway. Do not display any per-dimension rating grid.

Missing backend or governance requirements are **recorded, never invented**.

---

## 7. Dependencies

### Backend

Parent submitted-report list (R-9) â€” **delivered**.

### Governance

Parent access is submitted-canonical and view-only â€” unchanged and absolute. Parents read only the version `reports.latest_submitted_version_id` names, and only for students reachable through a live `parent_student_links` row (A-048).

---

## 8. Competency vocabulary

**Not rating-bearing.** No per-dimension rating grid appears in any Parent surface, in any form or wording (A-021, A-048).

The ratified competency vocabulary (Amendment 006) governs internal assessment surfaces only and must not leak into parent-facing prose as an explicit rating attribution or taxonomy disclosure (A-052).

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
- [ ] Only submitted canonical reports for linked children are listed.

---

## 11. Privacy and security checklist

- [ ] Synthetic data only appears in the frozen screenshot and in any captured implementation screenshot.
- [ ] No real name, email, phone number, address or other personal datum is visible.
- [ ] No secret, token, key or credential is visible.
- [ ] Authorization is proved server-side; no client-side condition grants access.
- [ ] Error, empty and denied states are non-disclosing.
- [ ] Only submitted canonical content is reachable; no working or unsubmitted version appears.
- [ ] Only children with a live ``parent_student_links`` row are selectable.
- [ ] No per-dimension rating grid appears in any form or wording.
- [ ] No content hash, revision number, correction reason, trainer note, draft, AI history or audit row reaches the surface.
- [ ] Nothing discloses that a correction cycle is or was underway.

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

## 14. Special-case governance for this screen

Parent screens: a Parent may select only among children linked to that authenticated Parent. **Unavailable and denied states must remain non-disclosing** - they must not reveal whether a student, report or link exists.

---

*Scaffolded at the Final MVP UI reference-pack checkpoint. Populated from the ratified inventory `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` and the amendments it is governed by. No node ID, route or status on this page was invented.*