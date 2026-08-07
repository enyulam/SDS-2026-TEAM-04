# AUTH-03 - Parent Login

**Role:** Parent
**Folder:** `AUTH-03-parent-login`
**Pack:** Final MVP UI reference pack. This is a visual reference, not application source code.

---

## 1. Identity

| Field | Value |
|---|---|
| Screen ID | `AUTH-03` |
| Screen name | Parent Login |
| Role | Parent |
| Folder | `AUTH-03-parent-login` |
| Canonical route | `/login?role=parent` |
| Current implemented route | /login with ?role= presentation (app/(auth)/login/page.tsx, features/auth/login-presentation.tsx) |
| Route-compatibility treatment | No mismatch â€” canonical route satisfied |
| Figma file key | `sSY1TYw3jyVlZDy8V2Mu7g` |
| Figma file name | `SDS-dashboard` |
| Figma node | `546:413` |
| Exact node-specific URL | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=546-413&m=dev |

**No route is created, moved, renamed or redirected by this pack.** Every compatibility treatment above is recorded from the ratified inventory and requires its own authorization to execute.

---

## 2. Scope membership

| Field | Value |
|---|---|
| Final-MVP membership | Yes - one of the ratified 36 screens (Amendment 005 A-041) |
| 48-hour core membership | **Yes** - core, flow order 10 |
| Physical-test flow order | 10 |
| Screenshot priority | Core - required before the physical test |

This screen is a blocking visual and functional dependency for the integrated physical-test walkthrough.

---

## 3. Frozen screenshot

| Field | Value |
|---|---|
| Screenshot filename | `reference.png` |
| Screenshot status | Validated — ready for implementation |
| Native dimensions | **1440 × 1024 px** (aspect 45:32) - measured from the frozen file |
| Validation classification | `PASS WITH NOTE — READY` |
| Validation date | 2026-08-06 |
| File size | 95,425 bytes |
| SHA-256 | `fcd4d4edcebadd20d6ebca43b181538631fe791fab06007a389120f56853b85c` |
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

Parent authenticates with a real Supabase Auth identity. The `?role=parent` query selects presentation only.

---

## 6. Implementation

| Field | Value |
|---|---|
| Current implementation status | `Implemented but visually unaligned` |

### Existing functionality to preserve

The existing `/login` route file and the `?role=` presentation split. Real Supabase Auth sign-in. Server-derived role resolution. Non-disclosing error handling.

### Allowed frontend expansion

Visual reconstruction of the login shell to node `546:413`; role-specific presentation variants; loading, validation, error and disabled states.

Frontend architecture may be created **where authorized** - routes, layouts, components and states that serve already-governed behaviour. Anything that would require new backend behaviour, a new permission or an unratified rule is a dependency, not an expansion.

### Prohibited invention

Do not grant Parent authority from the query parameter. Do not expose whether a parent, student or link exists. Do not change redirect policy independently.

Missing backend or governance requirements are **recorded, never invented**.

---

## 7. Dependencies

### Backend

As AUTH-01 â€” real Supabase Auth sign-in and server-derived role resolution â€” **delivered** on `feat/48h-backend`.

### Governance

A-046, A-020, A-027, ADR-4. Parent authority additionally requires a live `parent_student_links` relationship (A-048).

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

---

## 11. Privacy and security checklist

- [ ] Synthetic data only appears in the frozen screenshot and in any captured implementation screenshot.
- [ ] No real name, email, phone number, address or other personal datum is visible.
- [ ] No secret, token, key or credential is visible.
- [ ] Authorization is proved server-side; no client-side condition grants access.
- [ ] Error, empty and denied states are non-disclosing.
- [ ] No plaintext password is displayed, stored, logged or echoed back.
- [ ] The error state does not reveal whether an account exists.
- [ ] No shared or demo credential is shown, pre-filled or suggested.
- [ ] Changing the ``role`` query changes presentation only and grants nothing.

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

## 13. Authentication rules - restated, never created

- The `role` query parameter **selects presentation only** and carries no authority whatsoever (A-046).
- **Server session and live membership establish authority**, resolved server-side on every request: `auth.uid()` -> `accounts.auth_user_id` -> an **active** `centre_memberships` row -> the live relationship.
- **Integrated login uses real Supabase Auth.** No fake, mock or prototype authentication path may serve the integrated walkthrough.
- **No shared credentials.** The single named management account is one named account, never a shared login (A-015).
- **Passwords are never persisted outside the approved Auth request.** No plaintext generated password is ever stored, displayed, emailed or logged (A-020); no application table may hold an authentication secret (A-027).
- **Authentication errors remain non-disclosing.** An error must not reveal whether an unrelated account exists, nor any internal authorization detail.
- **Changing the URL query cannot grant another role.** Rendering is never a permission (ADR-4).
- **The three login frames may use one shared implementation shell** and one route file. The three visual references do not merge - they are distinct nodes and are frozen separately (A-046).

### Route treatment, from the ratified inventory

| Field | Value |
|---|---|
| Canonical route | `/login?role=parent` |
| Current implemented route | /login with ?role= presentation (app/(auth)/login/page.tsx, features/auth/login-presentation.tsx) |
| Compatibility treatment | No mismatch â€” canonical route satisfied |

**Redirect policy is not changed by this pack.** Executing any route treatment requires its own authorization at a separately-authorized route-migration checkpoint.

---

*Scaffolded at the Final MVP UI reference-pack checkpoint. Populated from the ratified inventory `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` and the amendments it is governed by. No node ID, route or status on this page was invented.*