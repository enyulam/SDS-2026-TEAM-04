# 26 - Management Add Class

**Role:** Management
**Folder:** `26-management-add-class`
**Pack:** Final MVP UI reference pack. This is a visual reference, not application source code.

---

## 1. Identity

| Field | Value |
|---|---|
| Screen ID | `26` |
| Screen name | Management Add Class |
| Role | Management |
| Folder | `26-management-add-class` |
| Canonical route | `/management/classes/add-class` |
| Current implemented route | ~~â€” (no implemented route)~~ ✅ **`/management/classes/add-class`** - created 2026-08-13, plan phase `P2-2`, at the CANONICAL path. No other route was moved, renamed, redirected or aliased. |
| Route-compatibility treatment | ~~Not applicable â€” no implemented route~~ **Not applicable - the implemented route IS the canonical route.** |
| Figma file key | `sSY1TYw3jyVlZDy8V2Mu7g` |
| Figma file name | `SDS-dashboard` |
| Figma node | `646:9` |
| Exact node-specific URL | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=646-9&m=dev |

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
| Screenshot status | ✅ **CURRENT VISUAL REFERENCE EXISTS** — `UI_REFERENCE_FINAL_MVP/reference/Management - Add Class/`. **Pack-local `reference.png`: not duplicated locally** (optional integrity copy only). ~~Deferred - required for final-MVP completion after physical test~~ — *corrected 2026-08-08: that wording implied no current reference existed, which was false.* |
| Native dimensions | Read them from the current reference frame `UI_REFERENCE_FINAL_MVP/reference/Management - Add Class/Management - Add Class.png`. ~~Not yet known - record … when the screenshot is exported~~ — *corrected 2026-08-08: no export is pending.* |
| Export rule | **No export is required — the ratified frame already exists at `UI_REFERENCE_FINAL_MVP/reference/Management - Add Class/`.** If a future re-export is ever authorized, it must be the exact node-specific Figma frame; an overview-canvas screenshot is never acceptable. |

The ratified `/reference/` frame **overrides later unreviewed live-Figma changes** for the corresponding implementation checkpoint. If the live canvas has moved on, that is a change to record in `CHANGE_LOG.md` and re-freeze — **not** a reason to drift, and **not** a reason to re-export over the ratified asset.

---

## 4. Source precedence

**Visual authority (highest first):**

1. **THE CURRENT `/reference/` PACK — `UI_REFERENCE_FINAL_MVP/reference/Management - Add Class/`** — the ratified Final MVP visual source for this screen. Frame `Management - Add Class.png`, HTML render `Management - Add Class.html`, pack notes `Management - Add Class.md`.
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

The UI action may be labelled "Create Class", but the persisted academic entity it creates is the **Class Module**, under a selected Class Grade (A-016, A-047).

---

## 6. Implementation

| Field | Value |
|---|---|
| Current implementation status | ~~`Not implemented`~~ ✅ **`Implemented`** - 2026-08-13, plan phase `P2-2`. âš ï¸ **Implementation is not VISUAL acceptance**, which remains `Not started` (section 12). |

### Existing functionality to preserve

Nothing exists to preserve.

### Allowed frontend expansion

None until the exact field inventory is ratified. Visual reconstruction may be prepared against node `646:9` without inventing fields or persistence.

Frontend architecture may be created **where authorized** - routes, layouts, components and states that serve already-governed behaviour. Anything that would require new backend behaviour, a new permission or an unratified rule is a dependency, not an expansion.

### Prohibited invention

Do not introduce a hidden `classes` entity (A-016). Do not create a fourth Class Grade (A-026, A-054). Do not invent a Create Class field â€” it is flagged schema-relevant.

Missing backend or governance requirements are **recorded, never invented**.

---

## 7. Dependencies

### Backend

~~**Missing** â€” no class-module creation write path.~~ ✅ **MET 2026-08-13** - migration `20260813090000_portal_p2_2_class_creation.sql` adds exactly two reviewed `SECURITY DEFINER` RPCs, `admin_create_class_module` and `admin_create_class_session`, firing the two already-ratified audit strings `admin.module_created` and `admin.session_created`. **Zero tables, columns, enums, policies or client write grants; the audit registry is UNMOVED at 19.**

⛔ **ONE BACKEND DEPENDENCY REMAINS OPEN, AND IT IS A STOP, NOT A GAP:** trainer assignment needs `admin.trainer_assigned`, a **third** audit string the Operator did not name for this phase. It is stated and stopped, and migration assertion `C-8` **fails the build** if either RPC ever reaches `class_session_assignments`.

### Governance

~~`Post-48-hour final-MVP scope` (A-044) **+ `Governance decision missing`** â€” the exact Create Class field inventory is UNRESOLVED and flagged schema-relevant.~~ ✅ **RESOLVED 2026-08-13.** The field inventory was ruled by **`C-14`** (`Class code`, `Capacity` and `programme` all omitted; a recurring pattern is *"a generator, not a stored schedule"*), by **`C-6`/`D-3`** (terms group SESSIONS; no lessons entity) and by **`A-014`/`G-7`** (no TA). `A-044` still applies: this screen is final-MVP scope, not a physical-test gate.

⛔ **The one item still owed to the Operator is the trainer-assignment audit string** (see Backend above).

---

## 8. Competency vocabulary

**Not rating-bearing.** This screen surfaces no competency-rating vocabulary.

The ratified vocabulary (Amendment 006 A-049) is Beginning / Developing / Mastering / Mastered, with canonical values `beginning`, `developing`, `mastering`, `mastered`. Implementation remains pending Backend V2 and Frontend V3.

Class Grade remains Beginner / Intermediate / Advanced. `Advanced` as a Class Grade must not be globally replaced (A-054).

---

## 9. Visual acceptance checklist

- [ ] The current visual reference `UI_REFERENCE_FINAL_MVP/reference/Management - Add Class/` is the exact node-specific frame, not an overview-canvas capture. **Do NOT gate acceptance on a pack-local `reference.png` — this pack deliberately holds none, and its absence is not a gap.**
- [ ] Native frame dimensions are read from the current reference frame (section 3); **nothing needs to be recorded here, and no export is pending.**
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
| Existing route audited | ~~No~~ **Yes - 2026-08-13. There was NONE**, verified against `app/**/page.tsx`, so nothing was moved or replaced. |
| `implementation-before.png` captured | No |
| `implementation-after.png` captured | No |
| Visual acceptance | **Not started** - ⛔ **`NOT-RUN`, and not claimed.** No screenshot was captured; `prove:stage3-authenticated` could not serve (an Operator-owned `next dev` holds the directory), so this screen has no rendered proof of any kind. |
| Functional acceptance | ~~Not started~~ **`IMPLEMENTED_AWAITING_VERIFICATION`** - `prove:portal-p2-2-create` exit 0 (11 SQL legs, denials before the permit control, the trainer-assignment stop measured at RUNTIME). ⛔ **Operator acceptance is not claimed and cannot be self-set.** |
| Privacy and security acceptance | Not started |
| Implementation checkpoint committed | No |
| Blocking dependency raised | None recorded |

---

## 14. Special-case governance for this screen

Management Class routes: "class type" presentation maps to the governed **Class Module** concept unless a later amendment changes the domain model (A-047).

---

*Scaffolded at the Final MVP UI reference-pack checkpoint. Populated from the ratified inventory `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` and the amendments it is governed by. No node ID, route or status on this page was invented.*