# AUTH-01 - Trainer Login

**Role:** Trainer
**Folder:** `AUTH-01-trainer-login`
**Pack:** Final MVP UI reference pack. This is a visual reference, not application source code.

---

## 1. Identity

| Field | Value |
|---|---|
| Screen ID | `AUTH-01` |
| Screen name | Trainer Login |
| Role | Trainer |
| Folder | `AUTH-01-trainer-login` |
| Canonical route | `/login?role=trainer` |
| Current implemented route | /login with ?role= presentation (app/(auth)/login/page.tsx, features/auth/login-presentation.tsx) |
| Route-compatibility treatment | No mismatch â€” canonical route satisfied |
| Figma file key | `sSY1TYw3jyVlZDy8V2Mu7g` |
| Figma file name | `SDS-dashboard` |
| Figma node | `546:370` |
| Exact node-specific URL | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=546-370&m=dev |

**No route is created, moved, renamed or redirected by this pack.** Every compatibility treatment above is recorded from the ratified inventory and requires its own authorization to execute.

---

## 2. Scope membership

| Field | Value |
|---|---|
| Final-MVP membership | Yes - one of the ratified 36 screens (Amendment 005 A-041) |
| 48-hour core membership | **Yes** - core, flow order 1 |
| Physical-test flow order | 1 |
| Screenshot priority | Core - required before the physical test |

This screen is a blocking visual and functional dependency for the integrated physical-test walkthrough.

---

## 3. Frozen screenshot

| Field | Value |
|---|---|
| Screenshot filename | `reference.png` |
| Screenshot status | Validated — ready for implementation. **Current visual reference: `UI_REFERENCE_FINAL_MVP/reference/Auth 01 - Trainer - Login/`**; the pack-local `reference.png` is a frozen SHA-identical duplicate of it. |
| Native dimensions | **1440 × 1024 px** (aspect 45:32) - measured from the frozen file |
| Validation classification | `PASS WITH NOTE — READY` |
| Validation date | 2026-08-06 |
| File size | 95,496 bytes |
| SHA-256 | `b1ad24e4f414ece90d7a1b091e516a44163f28856e7898a60db288f487a56da1` |
| Validation note | Figma connector unavailable at validation; native node dimensions not independently verified and node-level comparison not performed. Node association is from recorded pack metadata and corroborating visual identity. Local technical and visual evidence sufficient. |
| Export rule | **No export is required — the ratified frame already exists at `UI_REFERENCE_FINAL_MVP/reference/Auth 01 - Trainer - Login/`.** If a future re-export is ever authorized, it must be the exact node-specific Figma frame; an overview-canvas screenshot is never acceptable. |

The ratified `/reference/` frame **overrides later unreviewed live-Figma changes** for the corresponding implementation checkpoint. If the live canvas has moved on, that is a change to record in `CHANGE_LOG.md` and re-freeze — **not** a reason to drift, and **not** a reason to re-export over the ratified asset.

---

## 4. Source precedence

**Visual authority (highest first):**

1. **THE CURRENT `/reference/` PACK — `UI_REFERENCE_FINAL_MVP/reference/Auth 01 - Trainer - Login/`** — the ratified Final MVP visual source for this screen. Frame `Auth 01 - Trainer - Login.png`, HTML render `Auth 01 - Trainer - Login.html`, pack notes `Auth 01 - Trainer - Login.md`.
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

Trainer authenticates with a real Supabase Auth identity. The `?role=trainer` query selects presentation only.

---

## 6. Implementation

| Field | Value |
|---|---|
| Current implementation status | `Implemented but visually unaligned` |

### Existing functionality to preserve

The existing `/login` route file and the `?role=` presentation split. Real Supabase Auth sign-in. Server-derived role resolution. Non-disclosing error handling.

### Allowed frontend expansion

Visual reconstruction of the login shell to node `546:370`; role-specific presentation variants; loading, validation, error and disabled states.

Frontend architecture may be created **where authorized** - routes, layouts, components and states that serve already-governed behaviour. Anything that would require new backend behaviour, a new permission or an unratified rule is a dependency, not an expansion.

### Prohibited invention

Do not grant a role from the query parameter. Do not add a client-side role switcher that changes authority. Do not add "demo" or shared credentials. Do not change redirect policy independently.

Missing backend or governance requirements are **recorded, never invented**.

---

## 7. Dependencies

### Backend

Real Supabase Auth sign-in; server-derived role resolution from `accounts.auth_user_id` to an active `centre_memberships` row â€” **delivered** on `feat/48h-backend` (`server/modules/identity-access/`).

### Governance

A-046 (presentation-only role query), A-020 (identity/profile split), A-027 (no authentication secret in any application table), A-015 (no shared credentials), ADR-4 (server-side role proof).

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
| Canonical route | `/login?role=trainer` |
| Current implemented route | /login with ?role= presentation (app/(auth)/login/page.tsx, features/auth/login-presentation.tsx) |
| Compatibility treatment | No mismatch â€” canonical route satisfied |

**Redirect policy is not changed by this pack.** Executing any route treatment requires its own authorization at a separately-authorized route-migration checkpoint.

---

*Scaffolded at the Final MVP UI reference-pack checkpoint. Populated from the ratified inventory `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` and the amendments it is governed by. No node ID, route or status on this page was invented.*