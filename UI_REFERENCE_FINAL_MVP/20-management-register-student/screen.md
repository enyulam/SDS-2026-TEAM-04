# 20 - Management Register New Student

**Role:** Management
**Folder:** `20-management-register-student`
**Pack:** Final MVP UI reference pack. This is a visual reference, not application source code.

---

## 1. Identity

| Field | Value |
|---|---|
| Screen ID | `20` |
| Screen name | Management Register New Student |
| Role | Management |
| Folder | `20-management-register-student` |
| Canonical route | `/management/students/register` |
| Current implemented route | â€” (no implemented route) |
| Route-compatibility treatment | Not applicable â€” no implemented route |
| Figma file key | `sSY1TYw3jyVlZDy8V2Mu7g` |
| Figma file name | `SDS-dashboard` |
| Figma node | `425:10` |
| Exact node-specific URL | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=425-10&m=dev |

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
| Screenshot status | ✅ **CURRENT VISUAL REFERENCE EXISTS** — `UI_REFERENCE_FINAL_MVP/reference/Management - Register Student/`. **Pack-local `reference.png`: not duplicated locally** (optional integrity copy only). ~~Deferred - required for final-MVP completion after physical test~~ — *corrected 2026-08-08: that wording implied no current reference existed, which was false.* |
| Native dimensions | Read them from the current reference frame `UI_REFERENCE_FINAL_MVP/reference/Management - Register Student/Management - Register Student.png`. ~~Not yet known - record … when the screenshot is exported~~ — *corrected 2026-08-08: no export is pending.* |
| Export rule | **No export is required — the ratified frame already exists at `UI_REFERENCE_FINAL_MVP/reference/Management - Register Student/`.** If a future re-export is ever authorized, it must be the exact node-specific Figma frame; an overview-canvas screenshot is never acceptable. |

The ratified `/reference/` frame **overrides later unreviewed live-Figma changes** for the corresponding implementation checkpoint. If the live canvas has moved on, that is a change to record in `CHANGE_LOG.md` and re-freeze — **not** a reason to drift, and **not** a reason to re-export over the ratified asset.

---

## 4. Source precedence

**Visual authority (highest first):**

1. **THE CURRENT `/reference/` PACK — `UI_REFERENCE_FINAL_MVP/reference/Management - Register Student/`** — the ratified Final MVP visual source for this screen. Frame `Management - Register Student.png`, HTML render `Management - Register Student.html`, pack notes `Management - Register Student.md`.
2. **This pack's frozen `reference.png`, when present** — a frozen local **duplicate / integrity copy** of (1). It is provenance evidence and a byte-identity anchor; it **does not supersede (1)**, and its **absence does not mean the visual reference is missing**. **This pack does NOT carry one** — one of the 24 that are not duplicated locally. Use (1).
3. The exact node-specific Figma frame — **only where no ratified `/reference/` asset exists**. A live re-export never outranks (1); it can import post-freeze canvas drift.
4. The existing frontend implementation.

⚠️ **An explicit higher-ranked governed functional / product / privacy ruling may override a SPECIFIC visible element of (1) without invalidating the rest of the pack.** Where that happens it is recorded in this pack's `implementation-notes.md`, and the omission is **EXPECTED / REQUIRED**, never a visual regression.

**Functional, privacy and security authority (highest first):**

1. Specification v3 and Amendments 001-006
2. `CLAUDE.md`
3. Ratified lifecycle and authorization baselines
4. The physical-test implementation contract
5. Figma

**Figma never bypasses governance.** Where a frame and a ratified rule disagree, the ratified rule wins and the discrepancy is recorded, never silently resolved. **Screen presence is not authorization.**

---

## 5. Screen responsibility

Management registers a new student. Blocked on an unresolved field inventory.

---

## 6. Implementation

| Field | Value |
|---|---|
| Current implementation status | `Not implemented` |

### Existing functionality to preserve

Nothing exists to preserve.

### Allowed frontend expansion

None until the exact field inventory is ratified. Visual reconstruction may be prepared against node `425:10` without inventing fields or persistence.

Frontend architecture may be created **where authorized** - routes, layouts, components and states that serve already-governed behaviour. Anything that would require new backend behaviour, a new permission or an unratified rule is a dependency, not an expansion.

### Prohibited invention

Do not invent a student field. Do not create an Auth linkage for a student (A-025). Do not create a student write path without governance.

Missing backend or governance requirements are **recorded, never invented**.

---

## 7. Dependencies

### Backend

**Missing** â€” no student-creation write path; `students` has no Auth linkage by design (A-025).

### Governance

`Post-48-hour final-MVP scope` (A-044) **+ `Governance decision missing`** â€” the exact student-profile field inventory is UNRESOLVED (Figma matrix Â§5.2). **Do not invent a field.**

---

## 8. Competency vocabulary

**Not rating-bearing.** This screen surfaces no competency-rating vocabulary.

The ratified vocabulary (Amendment 006 A-049) is Beginning / Developing / Mastering / Mastered, with canonical values `beginning`, `developing`, `mastering`, `mastered`. Implementation remains pending Backend V2 and Frontend V3.

Class Grade remains Beginner / Intermediate / Advanced. `Advanced` as a Class Grade must not be globally replaced (A-054).

---

## 9. Visual acceptance checklist

- [ ] The current visual reference `UI_REFERENCE_FINAL_MVP/reference/Management - Register Student/` is the exact node-specific frame, not an overview-canvas capture. **Do NOT gate acceptance on a pack-local `reference.png` — this pack deliberately holds none, and its absence is not a gap.**
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
- [ ] The Management DTO exclusions (contract 5.5) are satisfied - no excluded field is rendered.
- [ ] No Management affordance can modify a rating, observation, attendance record, evidence item or trainer note.
- [ ] Reports outside the authenticated centre membership are unreachable.

---

## 12. Implementation state

| Field | Value |
|---|---|
| `reference.png` present (local duplicate only) | No — **the current reference lives in `/reference/`; this is not a gap** |
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

*Scaffolded at the Final MVP UI reference-pack checkpoint. Populated from the ratified inventory `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` and the amendments it is governed by. No node ID, route or status on this page was invented.*