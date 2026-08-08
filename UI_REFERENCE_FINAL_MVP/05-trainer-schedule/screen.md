# 05 - Trainer Schedule

**Role:** Trainer
**Folder:** `05-trainer-schedule`
**Pack:** Final MVP UI reference pack. This is a visual reference, not application source code.

---

## 1. Identity

| Field | Value |
|---|---|
| Screen ID | `05` |
| Screen name | Trainer Schedule |
| Role | Trainer |
| Folder | `05-trainer-schedule` |
| Canonical route | `/trainer/schedule` |
| Current implemented route | `/trainer/schedule` - **created at checkpoint F-04**, 2026-08-06. Previously: no route; the function was folded into `/trainer` |
| Route-compatibility treatment | **RESOLVED by operator ruling R-B1** (with R-B4), 2026-08-06, executed at checkpoint F-04. `/trainer/schedule` is the canonical Trainer entry route; **`/trainer` is preserved as a compatibility redirect (307) onto it and was not deleted.** Route census 16 -> 17; recorded in `CHANGE_LOG.md`. The prior status was `Operator decision required` - inventory 7.3, U-A5-1 |
| Figma file key | `sSY1TYw3jyVlZDy8V2Mu7g` |
| Figma file name | `SDS-dashboard` |
| Figma node | `591:9` |
| Exact node-specific URL | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=591-9&m=dev |

**No route is created, moved, renamed or redirected by this pack.** Every compatibility treatment above is recorded from the ratified inventory and requires its own authorization to execute.

---

## 2. Scope membership

| Field | Value |
|---|---|
| Final-MVP membership | Yes - one of the ratified 36 screens (Amendment 005 A-041) |
| 48-hour core membership | **Yes** - core, flow order 2 |
| Physical-test flow order | 2 |
| Screenshot priority | Core - required before the physical test |

This screen is a blocking visual and functional dependency for the integrated physical-test walkthrough.

---

## 3. Frozen screenshot

| Field | Value |
|---|---|
| Screenshot filename | `reference.png` |
| Screenshot status | Validated — ready for implementation. **Current visual reference: `UI_REFERENCE_FINAL_MVP/reference/Trainer - Schedule/`**; the pack-local `reference.png` is a frozen SHA-identical duplicate of it. |
| Native dimensions | **1675 × 1155 px** (aspect 335:231) - measured from the frozen file |
| Validation classification | `PASS WITH NOTE — READY` |
| Validation date | 2026-08-06 |
| File size | 90,168 bytes |
| SHA-256 | `d2d58b16b1ee2d68123ae87f58bc3aa2e586d2a1df925a84d231990564ff2ceb` |
| Validation note | Figma connector unavailable at validation; native node dimensions not independently verified and node-level comparison not performed. Node association is from recorded pack metadata and corroborating visual identity. Local technical and visual evidence sufficient. |
| Export rule | **No export is required — the ratified frame already exists at `UI_REFERENCE_FINAL_MVP/reference/Trainer - Schedule/`.** If a future re-export is ever authorized, it must be the exact node-specific Figma frame; an overview-canvas screenshot is never acceptable. |

The ratified `/reference/` frame **overrides later unreviewed live-Figma changes** for the corresponding implementation checkpoint. If the live canvas has moved on, that is a change to record in `CHANGE_LOG.md` and re-freeze — **not** a reason to drift, and **not** a reason to re-export over the ratified asset.

---

## 4. Source precedence

**Visual authority (highest first):**

1. **THE CURRENT `/reference/` PACK — `UI_REFERENCE_FINAL_MVP/reference/Trainer - Schedule/`** — the ratified Final MVP visual source for this screen. Frame `Trainer - Schedule.png`, HTML render `Trainer - Schedule.html`, pack notes `Trainer - Schedule.md`.
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

Trainer selects an assigned governed Class Session. Assignment authority is at class-session level and is proved server-side.

---

## 6. Implementation

| Field | Value |
|---|---|
| Current implementation status | `Implemented at the canonical route` - checkpoint F-04, 2026-08-06. Proposed visually accepted; **only the operator marks a screen accepted** |

### Existing functionality to preserve

The existing session-selection function on the `/trainer` landing surface, and its server-side assignment check.

### Allowed frontend expansion

Subject to the Â§7.3 operator decision: either accept the fold for the physical test and build `/trainer/schedule` to node `591:9` afterwards, or build the route and a schedule/date projection before the test.

Frontend architecture may be created **where authorized** - routes, layouts, components and states that serve already-governed behaviour. Anything that would require new backend behaviour, a new permission or an unratified rule is a dependency, not an expansion.

### Prohibited invention

Do not create a duplicated calendar or event table (A-016). Do not display sessions the trainer is not assigned to. Do not resolve the Â§7.3 operator decision inside a screen checkpoint.

Missing backend or governance requirements are **recorded, never invented**.

---

## 7. Dependencies

### Backend

Trainer assigned-session projection (R-1) â€” **delivered**. The schedule/date projection over the same class-session records is **delivered at F-04 as a pure frontend projection** (`features/trainer/trainer-schedule-projection.ts`) - no backend path, table, RPC or event record was required or created (A-016, A-047).

**Recorded dependencies, never invented (F-04):** the frame's session **room/location** ("Studio 2") and its **Main / Assist. trainer names** exist on no governed field and are **omitted rather than fabricated**; **session creation** ("Add Agenda") has no Trainer-reachable governed path and is a governed **Management** action (A-019), so the control is rendered disabled with a stated reason; the rail's **My Classes** and **Students** items depend on the Trainer-scoped class and student projections recorded missing for screens `02` and `04` (inventory 8.2) and were not added.

### Governance

Calendars and schedules are **projections** of class-session records and their assignments; no duplicated event table may be created (A-016, A-047).

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
- [ ] Only class sessions the trainer is assigned to are selectable.
- [ ] No duplicated calendar or event record is created; the schedule is a projection.

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
| `reference.png` present (local duplicate only) | Yes — frozen duplicate, SHA-identical to `/reference/` |
| Native dimensions recorded | Yes |
| Figma context retrieved | No - connector unavailable at the validation checkpoint |
| Existing route audited | Yes - F-04, 2026-08-06 |
| `implementation-before.png` captured | No |
| `implementation-after.png` captured | Yes - seven diagnostic renders written **outside Git** to `_checkpoint-evidence/F-04/` |
| Visual acceptance | Proposed - awaiting operator review (F-04) |
| Functional acceptance | Proposed - awaiting operator review (F-04) |
| Privacy and security acceptance | Proposed - awaiting operator review (F-04) |
| Implementation checkpoint committed | Yes - `feat(frontend): reconstruct trainer schedule` |
| Blocking dependency raised | None recorded |


---

*Scaffolded at the Final MVP UI reference-pack checkpoint. Populated from the ratified inventory `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` and the amendments it is governed by. No node ID, route or status on this page was invented.*