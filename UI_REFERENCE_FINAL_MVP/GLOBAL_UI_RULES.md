# Global UI Rules — Final MVP UI Reference Pack

These rules apply to **every** screen in this pack. A per-screen `screen.md` may add detail; it may never weaken anything here.

---

## 1. Source precedence

### 1.1 Visual authority — highest first

1. **The folder's frozen `reference.png`**
2. **The exact node-specific Figma frame**
3. **The existing frontend implementation**

A frozen `reference.png` **overrides later unreviewed live-Figma changes** for the corresponding implementation checkpoint. Where the live canvas has moved on, record the change in `CHANGE_LOG.md` and re-freeze deliberately.

An **overview-canvas screenshot is never an acceptable substitute** for a node-specific frame.

### 1.2 Functional, privacy and security authority — highest first

1. **Specification v3 and the ratified amendments (001–006)**
2. **`CLAUDE.md`**
3. **Ratified lifecycle and authorization baselines** — `STEP_7I_REPORT_LIFECYCLE_BASELINE.md`, `PHYSICAL_TEST_ASSESSMENT_WRITE_BASELINE.md`, the Step 7G / 7H baselines
4. **The physical-test implementation contract** — `PHYSICAL_TEST_SLICE_48H.md`
5. **Figma**

### 1.3 Governance overrides Figma

**Figma never bypasses governance.** Where a frame and a ratified rule disagree, **the ratified rule wins and the discrepancy is recorded** — never silently resolved, never resolved locally.

**Screen presence is not authorization.** A screen, or a control drawn on one, authorizes no lifecycle transition, role, permission, database mutation, AI operation, protected-content access, direct table access, Management power, or Parent access to unpublished content.

**Figma IS authoritative for:** visual layout · visual hierarchy · component composition · visible fields · screen labels · microcopy · page relationships · screen-to-screen interaction intent · visual states · responsive visual behaviour **where explicitly shown**.

**Figma is NOT authoritative for:** database schema · foreign-key design · RLS · server authorization · report lifecycle · audit behaviour · Auth implementation · AI governance · persistence architecture · state-machine rules · transaction boundaries.

---

## 2. Shared authentication-screen rules

Applies to `AUTH-01`, `AUTH-02`, `AUTH-03`.

- **The `role` query parameter selects presentation only** and carries **no authority whatsoever**.
- **Authenticated identity and live membership establish authority**, resolved server-side on every request: `auth.uid()` → `accounts.auth_user_id` → an **active** `centre_memberships` row → the live relationship (class-session assignment for a trainer, the sole centre for management, `parent_student_links` for a parent). Never a token claim, never a UI condition, never a query parameter.
- **Integrated login uses real Supabase Auth.** No fake, mock or prototype authentication path may serve the integrated walkthrough.
- **No shared credentials.** The single named management account is one named account, never a shared login.
- **No plaintext passwords.** A password is never persisted outside the approved Auth request, and is never stored, displayed, emailed or logged. No application table may hold an authentication secret.
- **Authentication errors remain non-disclosing.** An error must not reveal whether an unrelated account exists, nor any internal authorization detail.
- **Changing the URL query cannot grant another role.** Rendering is never a permission.
- **A login screen must not imply that choosing a role grants that role.**
- **The three login frames are distinct nodes and are frozen separately.** They may share **one implementation shell and one route implementation** — the visual references do not merge.
- **Redirect policy is not changed by this pack.**

---

## 3. Shared Trainer shell rules

- Trainer reach is proved **server-side** through a live class-session assignment. Trainer assignment is authoritative at **class-session level**.
- A trainer sees only sessions they are assigned to, and only students reachable through those sessions.
- **All nine assessment dimensions are mandatory.** There is one capture mode. No Quick/Full toggle, no four-dimension form, no `mode` prop, validator or column.
- **Trainer approval publishes nothing.** It commits `draft_ready | needs_edit → trainer_approved` and freezes that version.
- Where Management returns a report, the trainer owns the correction and must reapprove through a **new immutable version**; a byte-identical save is rejected server-side.
- Assessment internals must not leak into parent-facing wording.
- Schedules and calendars are **projections** of class-session records — never duplicated event tables.

---

## 4. Shared Management shell rules

- Management authority is the sole centre, proved server-side through an active `centre_memberships` row.
- **Management may edit only the four parent-facing wording panels.** This boundary is Amendment 004's and remains controlling.
- Management may **return** a report for a rating, observation or derived assessment-fact issue.
- **Approve & Submit is the only action that makes a report parent-visible.**
- Management **never** modifies a rating, observation, attendance record, evidence item, trainer note or any underlying assessment fact.
- **Management DTO exclusions are absolute.** No excluded field may be rendered on any Management surface.
- "Class type" presentation maps to the governed **Class Module** concept; no hidden `classes` entity is introduced.
- Term-report generation is **out of MVP scope** and separately governed.

---

## 5. Shared Parent shell rules

- **Parent access is submitted-canonical and view-only — unchanged and absolute.**
- Parents read only the version `reports.latest_submitted_version_id` names, and only for students reachable through a **live `parent_student_links` row**.
- **A Parent may select only among children linked to that authenticated Parent.** The multi-child affordance is a presentation control over live links only — never a picker over the centre's students.
- **No per-dimension rating grid appears in any parent surface, in any form or wording.**
- No content hash, revision number, correction reason, trainer note, draft, AI history or audit row ever reaches a parent surface.
- **Nothing may disclose that a correction cycle is or was underway.**
- **Unavailable and denied states must remain non-disclosing** — they must not reveal whether a student, report or link exists.
- No edit affordance exists on any parent surface.

---

## 6. Responsive expectations

- Each screen is reconstructed at the **Figma reference viewport** first; that is the viewport used for `implementation-before.png` and `implementation-after.png`.
- **Responsive behaviour is authoritative from Figma only where explicitly shown.** Where a responsive variant is not in the frame, apply the project's established responsive pattern — do not invent a new one, and do not guess a breakpoint the design does not state.
- Content must not be clipped, overlapped or made unreachable at any supported width.
- Tables, wide data grids and long code-like strings scroll inside their own container; the page body must not scroll horizontally.
- Touch targets remain usable at the smallest supported width.
- Where a required responsive state is missing from the frame, **stop and request orchestrator input** rather than inventing one.

---

## 7. Accessibility and WCAG expectations

- **Target WCAG 2.1 AA.**
- Semantic HTML first; ARIA only where semantics cannot express the pattern.
- Every interactive element is keyboard reachable and operable, with a visible focus indicator, in a logical tab order.
- Form fields have programmatically associated labels. Validation errors are announced, associated with their field, and the first invalid field is reachable directly.
- Text contrast meets AA; non-text UI and graphical objects meet 3:1.
- Colour is never the only carrier of meaning — a rating band, status or error must also be conveyed by text or shape.
- Images carry meaningful alternative text; decorative images are hidden from assistive technology.
- Loading, empty, error and success states are announced, not only drawn.
- Motion respects `prefers-reduced-motion`.
- Headings form a correct, non-skipping outline.

---

## 8. Asset export and asset reuse

- Export the **exact node-specific frame**. An overview-canvas capture is not acceptable.
- Export at **native frame dimensions** (1×, PNG), and record the native dimensions in `screen.md` section 3.
- Save as `reference.png` in the matching folder. **Do not create a placeholder, empty or fake PNG.**
- **Port only approved presentation information and approved assets.** No visual asset is copied into a repository until the orchestrator records an explicit `PORT` / `REFERENCE ONLY` / `REBUILD` / `REJECT` / `NOT APPLICABLE` disposition for it.
- **Never blindly port:** generated React code · Figma mock data · prototype-only navigation · fake authentication · static hard-coded identities · duplicated calendar records · client-side authorization assumptions · schema inferred from a frame · business logic inferred from a frame · permissions inferred from whether an Edit button is visible · generated CSS that conflicts with the design system · prototype shortcuts that bypass Supabase, RLS or server-side validation.
- **Reuse the approved asset set.** Do not re-draw an icon, logo or illustration ad hoc when an approved asset exists; do not introduce a new asset without a disposition.
- **Stop-and-ask rule.** When a required node-specific frame, approved asset, interaction state, responsive state or visible field definition is missing — **stop and request orchestrator input.** Do not guess, and do not silently recreate a missing requirement.

---

## 9. Synthetic data only

**Every screenshot in this pack — frozen reference, before and after — must contain synthetic data only.**

- No real student, parent, trainer or staff name, email, phone number, address or other personal datum.
- No real report content.
- No secret, token, key or credential.

A screenshot containing real data is a privacy incident, not a documentation defect.

---

## 10. No unsupported backend behaviour may be invented

- Where a governed read path, write path, projection, RPC, table or rule does not exist, that is recorded as a **dependency** in `screen.md` section 7 and in `implementation-notes.md`.
- **It is never invented, stubbed as if real, faked client-side, or inferred from a frame.**
- A blocked screen reported honestly is fine. An invented field that later turns out to be wrong is a rebuild.
- Frontend architecture may be created **where authorized** — routes, layouts, components and states serving already-governed behaviour. Anything requiring new backend behaviour, a new permission or an unratified rule is a dependency, not an expansion.

---

## 11. Authority, roles and credentials

- **Role query parameters control presentation only.**
- **Authenticated identity and live membership establish authority.** Every role-bearing surface must independently prove its role server-side. Rendering is never a permission.
- **No plaintext passwords, and no shared credentials**, anywhere in this pack or in anything built from it.
- **Authentication errors remain non-disclosing.**
- **AI cannot approve or publish.** The AI is a non-human actor with a restricted boundary; it holds no approval authority and no publication authority. Generation is grounded, and a draft whose language contradicts a rating's polarity band is rejected before anything is persisted.
- **Parent surfaces remain submitted-canonical and view-only.**
- **Management wording edits remain bounded by Amendment 004** — the four parent-facing wording panels, and nothing else.

---

## 12. Ratified competency vocabulary

**Amendment 006 (A-049, ratified 2026-08-05) is authoritative for the four-level competency-rating vocabulary.**

### 12.1 The four levels

1. **Beginning**
2. **Developing**
3. **Mastering**
4. **Mastered**

### 12.2 Canonical values

- `beginning`
- `developing`
- `mastering`
- `mastered`

### 12.3 Polarity

| Level | Polarity |
|---|---|
| Beginning | **needs support** |
| Developing | **developing** |
| Mastering | **positive** |
| Mastered | **positive and exceeds expectations** |

`Mastering` is `positive`. Polarity derives from the ratified behavioural anchor, not from the progressive grammatical form of the label. Only `beginning` carries `needs_support`, and a `beginning` dimension may never be presented as a strength.

### 12.4 Boundaries

- **Class-grade vocabulary remains Beginner / Intermediate / Advanced** (`beginner`, `intermediate`, `advanced`). It is a different vocabulary governing a different concept, and it is unchanged.
- **`Advanced` as a Class Grade must not be globally replaced.** `Advanced` is no longer a competency rating and is still a Class Grade. Classify any occurrence by its **actual context**, never by keyword. Global keyword replacement over `advanced`, `secure`, `emerging`, `beginning`, `mastering` or `mastered` is **expressly prohibited**.
- **Ordinary contextual prose using *beginning*, *mastering*, *mastered* or *mastery* remains valid.** "At the beginning of the session", "is mastering sentence flow", "has mastered maintaining eye contact" and "demonstrates mastery of vocal projection" are legal parent-facing prose. A bare-word leak regex is prohibited; what must be detected is explicit **rating attribution or taxonomy disclosure**.
- **The four-level scale is exactly four levels.** No fifth level exists or may be created. Arity, ordinal position, low-to-high direction and all nine dimensions are unchanged.
- **Behavioural anchors carry forward positionally, verbatim.** The anchor text did not change; only the label each is keyed to did. `Mastered` remains the exceeds-expectations level.

### 12.5 Implementation status

**Agents must follow Amendment 006 rather than inventing label behaviour.**

**Backend V2 and frontend V3 implementation remain pending until separately executed.** Amendment 006 ratifies the vocabulary and authorizes a bounded three-statement enum rename, but no database, backend, frontend, fixture, generated type or test has been changed yet. The bounded sequence is `docs/plan/COMPETENCY_VOCABULARY_RECONCILIATION_PLAN.md`; **V2 (backend) and V3 (frontend) each require separate authorization.**

Until V2 lands the database still stores the superseded labels. **Do not "fix" a mismatch you find between code and this section without that authorization**, and do not perform the rename inside a visual implementation checkpoint.

---

*Governed by Specification v3, Amendments 001–006, `CLAUDE.md`, the ratified lifecycle and authorization baselines and the physical-test implementation contract. This file records rules; it creates none.*
