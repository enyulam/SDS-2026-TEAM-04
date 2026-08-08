# 33 - Parent Class Report

**Role:** Parent
**Folder:** `33-parent-class-report`
**Pack:** Final MVP UI reference pack. This is a visual reference, not application source code.

---

## 1. Identity

| Field | Value |
|---|---|
| Screen ID | `33` |
| Screen name | Parent Class Report |
| Role | Parent |
| Folder | `33-parent-class-report` |
| Canonical route | `/parent/reports/[reportId]` |
| Current implemented route | /parent/students/[studentId]/sessions/[sessionId]/report |
| Route-compatibility treatment | Replace after integration; pinned path preserved as a redirect. The implemented route matches the canonical read RPC's `(class_session_id, student_id)` key directly; the canonical route requires a `reportId` to pair resolution server-side |
| Figma file key | `sSY1TYw3jyVlZDy8V2Mu7g` |
| Figma file name | `SDS-dashboard` |
| Figma node | `627:9` |
| Exact node-specific URL | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=627-9&m=dev |

**No route is created, moved, renamed or redirected by this pack.** Every compatibility treatment above is recorded from the ratified inventory and requires its own authorization to execute.

---

## 2. Scope membership

| Field | Value |
|---|---|
| Final-MVP membership | Yes - one of the ratified 36 screens (Amendment 005 A-041) |
| 48-hour core membership | **Yes** - core, flow order 12 |
| Physical-test flow order | 12 |
| Screenshot priority | Core - required before the physical test |

This screen is a blocking visual and functional dependency for the integrated physical-test walkthrough.

---

## 3. Frozen screenshot

| Field | Value |
|---|---|
| Screenshot filename | `reference.png` |
| Screenshot status | Validated — ready for implementation. **Current visual reference: `UI_REFERENCE_FINAL_MVP/reference/Parent - Class Report/`**; the pack-local `reference.png` is a frozen SHA-identical duplicate of it. |
| Native dimensions | **1440 × 1340 px** (aspect 72:67) - measured from the frozen file |
| Validation classification | `PASS WITH NOTE — READY` |
| Validation date | 2026-08-06 |
| File size | 293,726 bytes |
| SHA-256 | `2aaeb446065f8360ed6b3804490c7843d96e1e5e534e754ed738c61dd6adea67` |
| Validation note | Figma connector unavailable at validation; native node dimensions not independently verified and node-level comparison not performed. Node association is from recorded pack metadata and corroborating visual identity. Local technical and visual evidence sufficient. |
| Export rule | **No export is required — the ratified frame already exists at `UI_REFERENCE_FINAL_MVP/reference/Parent - Class Report/`.** If a future re-export is ever authorized, it must be the exact node-specific Figma frame; an overview-canvas screenshot is never acceptable. |

The ratified `/reference/` frame **overrides later unreviewed live-Figma changes** for the corresponding implementation checkpoint. If the live canvas has moved on, that is a change to record in `CHANGE_LOG.md` and re-freeze — **not** a reason to drift, and **not** a reason to re-export over the ratified asset.

---

## 4. Source precedence

**Visual authority (highest first):**

1. **THE CURRENT `/reference/` PACK — `UI_REFERENCE_FINAL_MVP/reference/Parent - Class Report/`** — the ratified Final MVP visual source for this screen. Frame `Parent - Class Report.png`, HTML render `Parent - Class Report.html`, pack notes `Parent - Class Report.md`.
2. **This pack's frozen `reference.png`, when present** — a frozen local **duplicate / integrity copy** of (1). It is provenance evidence and a byte-identity anchor; it **does not supersede (1)**, and its **absence does not mean the visual reference is missing**. **This pack HAS one**, SHA-256-identical to (1).
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

View-only canonical submitted report. Do not expose ratings, observations, correction requests, hashes, revision metadata or audit internals.

---

## 6. Implementation

| Field | Value |
|---|---|
| Current implementation status | `Implemented but visually unaligned` |

### Existing functionality to preserve

The pinned route, the canonical read RPC, the `app_parent_reaches_student` reachability check and the submitted-only version resolution.

### Allowed frontend expansion

Visual reconstruction to node `627:9`; add the canonical `[reportId]` route with server-side pair resolution; view-only, unavailable and error states.

Frontend architecture may be created **where authorized** - routes, layouts, components and states that serve already-governed behaviour. Anything that would require new backend behaviour, a new permission or an unratified rule is a dependency, not an expansion.

### Prohibited invention

Do not render a rating, observation, correction reason, trainer note, draft, AI history, content hash, revision number or audit row on a parent surface. Do not expose any working (unsubmitted) version. Do not offer an edit affordance.

Missing backend or governance requirements are **recorded, never invented**.

---

## 7. Dependencies

### Backend

`report_get_canonical` (RPC-13) via `app_parent_reaches_student` â€” **delivered**.

### Governance

Parent access is submitted-canonical and view-only â€” unchanged and absolute (A-048, A-021). No per-dimension rating grid appears in any parent surface, in any form or wording.

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
- [ ] The surface is view-only; no edit affordance exists.
- [ ] Only the version ``latest_submitted_version_id`` names is rendered.

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
| `reference.png` present (local duplicate only) | Yes — frozen duplicate, SHA-identical to `/reference/` |
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