# 31 - Parent Calendar

**Role:** Parent
**Folder:** `31-parent-calendar`
**Pack:** Final MVP UI reference pack. This is a visual reference, not application source code.

---

## 1. Identity

| Field | Value |
|---|---|
| Screen ID | `31` |
| Screen name | Parent Calendar |
| Role | Parent |
| Folder | `31-parent-calendar` |
| Canonical route | `/parent/calendar` |
| Current implemented route | â€” (no implemented route) |
| Route-compatibility treatment | Not applicable â€” no implemented route |
| Figma file key | `sSY1TYw3jyVlZDy8V2Mu7g` |
| Figma file name | `SDS-dashboard` |
| Figma node | `622:91` |
| Exact node-specific URL | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=622-91&m=dev |

**No route is created, moved, renamed or redirected by this pack.** Every compatibility treatment above is recorded from the ratified inventory and requires its own authorization to execute.

---

## 2. Scope membership

| Field | Value |
|---|---|
| Final-MVP membership | Yes - one of the ratified 36 screens (Amendment 005 A-041) |
| 48-hour core membership | No - deferred until after the physical test |
| Physical-test flow order | Not in the physical-test flow |
| Screenshot priority | Deferred - required for final-MVP completion after the physical test |

This screen is part of the final MVP but is not required before the 48-hour physical test.

---

## 3. Frozen screenshot

| Field | Value |
|---|---|
| Screenshot filename | `reference.png` |
| Screenshot status | Deferred - required for final-MVP completion after physical test |
| Native dimensions | Not yet known - record the native frame dimensions here when the screenshot is exported |
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

Parent calendar over the class sessions of linked children only.

---

## 6. Implementation

| Field | Value |
|---|---|
| Current implementation status | `Not implemented` |

### Existing functionality to preserve

Nothing exists to preserve.

### Allowed frontend expansion

Route, layout and components to node `622:91` once a parent calendar projection exists.

Frontend architecture may be created **where authorized** - routes, layouts, components and states that serve already-governed behaviour. Anything that would require new backend behaviour, a new permission or an unratified rule is a dependency, not an expansion.

### Prohibited invention

Do not create a duplicated event or calendar table (A-016). Do not show sessions for a child the parent has no live link to. Do not display any per-dimension rating grid.

Missing backend or governance requirements are **recorded, never invented**.

---

## 7. Dependencies

### Backend

**Missing** â€” no parent calendar projection over class sessions.

### Governance

`Post-48-hour final-MVP scope` (A-044) **+ `Backend dependency missing`**. Calendars are projections; no duplicated event table may be created (A-016, A-047).

---

## 8. Competency vocabulary

**Not rating-bearing.** No per-dimension rating grid appears in any Parent surface, in any form or wording (A-021, A-048).

The ratified competency vocabulary (Amendment 006) governs internal assessment surfaces only and must not leak into parent-facing prose as an explicit rating attribution or taxonomy disclosure (A-052).

Class Grade remains Beginner / Intermediate / Advanced. `Advanced` as a Class Grade must not be globally replaced (A-054).

---

## 9. Visual acceptance checklist

- [ ] `reference.png` is present and is the exact node-specific frame, not an overview-canvas capture.
- [ ] Native frame dimensions are recorded in section 3.
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
| `reference.png` present | No |
| Native dimensions recorded | No |
| Figma context retrieved | No |
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