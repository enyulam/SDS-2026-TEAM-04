# B.E.S.T Coach — MVP Specification v3 Amendment 005

**Status:** Ratified by orchestrator
**Ratification date:** 2026-08-05 (Asia/Singapore)
**Clauses:** **A-041 … A-048**

**Amends:** `BEST_Coach_Complete_MVP_Specification_v3.md` (this repository, `docs/spec/`) and, **only where explicitly named**, `BEST_Coach_MVP_Specification_v3_Amendment_002.md`

---

## Relationship to Specification v3 and Amendments 001–004

Specification v3 remains the **authoritative baseline** for this build. Amendment 001 (**A-001 … A-013**), Amendment 002 (**A-014 … A-024**), Amendment 003 (**A-025 … A-032**) and Amendment 004 (**A-033 … A-040**) remain in force **except for the specific clauses named in the supersession table below**.

This amendment ratifies the **complete final-MVP visual-reference inventory** — **3 authentication screens and 33 portal screens, 36 in total** — their **canonical routes**, the **exact twelve-screen physical-test subset**, and the **visual-authority precedence** that governs how a Figma frame relates to a ratified rule.

### Rules of precedence for this amendment

1. Every v3 clause not named here remains in force, unchanged.
2. **Amendment 005 names no Amendment 001, Amendment 003 or Amendment 004 clause.** A-001 … A-013, A-025 … A-032 and A-033 … A-040 are untouched, and every evidence, schema, lifecycle, privacy, approval and audit safeguard applies unweakened.
3. Amendment 002 **A-022** is **extended and made exact**, not reversed: Figma Design 2 remains the final UI authority for visual and interaction matters, and this amendment supplies the node-specific inventory A-022.1 required and records the precedence in which a frozen screenshot, a node-specific frame and an existing implementation are read. **A-022.2's prohibited-porting list and A-022.3's blocking classification are unchanged.** Every other Amendment 002 decision — A-014's three-flow boundary, A-015's one-centre rule, A-016's hierarchy, A-017's mandatory nine dimensions, A-018's attendance defaults, A-019's management administration scope, A-020's identity model, A-021's one-canonical-report rule, A-023's no-ORM rule and A-024's phasing — remains **fully active**.
4. **A later amendment wins only for the clauses it explicitly supersedes.** Where Amendment 005 names a clause, Amendment 005 governs that clause. Where it does not, v3-as-amended-by-001-002-003-004 governs.
5. Specification v3 and Amendments 001, 002, 003 and 004 are **never edited in place**. All five remain byte-for-byte unchanged. Superseded rules are superseded **explicitly, here** — historical records are never rewritten to conceal a prior decision.
6. `CLAUDE.md`, the Implementation Plan, the Figma matrix, the physical-test contract and the lifecycle baselines must agree with v3 as amended by 001, 002, 003, 004 **and** 005; where any of them still contains superseded wording, the wording in the governing amendment prevails and the stale text is historical.

**Precedence (highest first):** **v3 → ratified amendments (001, then 002, then 003, then 004, then 005 for the clauses each names) → `CLAUDE.md` → Implementation Plan → Figma Design 2 (visual/interaction reference only) → `STATUS.md` → `BUILD_NOTES.md` → temporary migration tracker → the 48-hour physical-test contract.**

### Scope statement — read this before treating this amendment as permission to build

Amendment 005 governs **visual-reference inventory, screen identity, canonical route planning and visual authority**. It is **not an implementation authorization**. It authorizes no checkpoint, creates no route, creates no component, and changes no application code. Amendment 003 A-032's non-authorization rule applies to it in full.

**Screen presence is not authorization.** A Figma screen or a control drawn on one does **not** independently authorize a lifecycle transition, a role or permission, a database mutation, an AI operation, access to protected content, direct table access, a Management power, or Parent access to unpublished content. Missing governance is recorded as a **dependency**, never invented as behaviour.

---

## Supersession and precedence table

| Amendment | v3 section(s) / clause superseded | Effect on Amendments 001 / 002 / 003 / 004 | Other active documents affected | Effect |
|---|---|---|---|---|
| **A-041** | **§8**'s screen-list framing, insofar as it is read as the **complete** MVP screen inventory — v3 §8 enumerates screen families by flow and predates the Design 2 file; it is **re-anchored, not contradicted**, and every governance rule attached to a §8 screen stands | **A-014's three-flow boundary unchanged and reaffirmed** (the 36 screens are exactly the Management, Trainer and Parent flows); A-022 extended, not reversed; **no Amendment 001, 003 or 004 clause named** | `CLAUDE.md` §7; `docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md` §1–§3; `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md`; `docs/plan/BEST_Coach_Implementation_Plan.md` | The complete final-MVP visual-reference inventory is **36 screens** — **3 authentication screens (`AUTH-01` … `AUTH-03`)** and **33 portal screens (IDs 01–33)** — all in Figma file key **`sSY1TYw3jyVlZDy8V2Mu7g`**, file name **`SDS-dashboard`**. Portal numbering **01–33 is preserved and does not shift**; authentication IDs sit **outside** the numbered portal sequence. Trainer 01–10, Management 11–29, Parent **30–33**. |
| **A-042** | **§8** and **§18** route wording, insofar as any of it is read as a ratified URL path — v3 proposes no application routes; the Figma matrix's "Intended Next.js route" column is explicitly labelled *"proposed, not ratified"* and is **superseded by this clause for the 36 screens named here** | none superseded; **A-016's hierarchy governs every path segment** | `docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md` "Intended Next.js route"; `docs/plan/PHYSICAL_TEST_SLICE_48H.md` §4; `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` §7 | **All 36 canonical routes are ratified** as the final-MVP target, including the three **role-query variants** `/login?role=trainer`, `/login?role=management` and `/login?role=parent`. **Dynamic segments use bracket notation.** The physical-test contract's pinned routes remain correct **for the physical test**; the reconciliation and per-mismatch treatment live in the inventory §7. **No route is created by this amendment.** |
| **A-043** | none — this clause **adds** a scope boundary v3 does not contain | none superseded; **A-024's phasing unchanged** — this is a within-phase sequencing decision, not a re-phasing | `docs/plan/PHYSICAL_TEST_SLICE_48H.md`; `docs/plan/BEST_Coach_Implementation_Plan.md`; `docs/progress/STATUS.md` | **Exactly twelve** visual-reference screens block the physical-test walkthrough: **AUTH-01 · 05 · 06 · 07 · 08 · 10 · AUTH-02 · 29 · 19 · AUTH-03 · 32 · 33**, in that flow order, **contiguous 1–12**. The governed lifecycle **includes trainer approval before management final submission** even where a high-level description abbreviates it. |
| **A-044** | none — this clause **adds** a deferral boundary | none superseded | `docs/plan/BEST_Coach_Implementation_Plan.md`; `docs/plan/PHYSICAL_TEST_SLICE_48H.md` §3 | The **other 24 portal screens** are **`Post-48-hour final-MVP scope`** — **required for the final MVP, not required before the physical test**. **No active document may state or imply that all 36 screens are required before the physical test**, and none may omit a core screen. Deferral **deletes no safeguard**. |
| **A-045** | **§8** and **§10**, insofar as either is read as making a design surface authoritative over a governance rule | **A-022 extended and made exact**; A-022.2 and A-022.3 unchanged; **A-013's disposition discipline preserved in full** | `CLAUDE.md` §1 precedence, §7; the Figma matrix "How to read this matrix"; the inventory §0.1 | **Visual authority (highest first): (1) frozen `reference.png` · (2) node-specific Figma context · (3) existing frontend implementation.** **Functional, security and privacy authority (highest first): (1) specification and active amendments · (2) `CLAUDE.md` · (3) lifecycle and authorization baselines · (4) ratified implementation contract · (5) Figma.** **Figma never bypasses governance.** Where a frame and a ratified rule disagree, **the ratified rule wins and the discrepancy is recorded**, never silently resolved. |
| **A-046** | **§8**'s login-screen entries and **§21**'s authentication wording, insofar as either is read as permitting a client-selected role to establish authority | none superseded; **A-020's identity/profile split, A-027's absolute secret prohibition and ADR-4 restated, not modified** | `CLAUDE.md` §6 identity bullets; `docs/plan/PHYSICAL_TEST_SLICE_48H.md` §4; the inventory §1.4 | **Role-query selection is presentation-only** and carries **no authority whatsoever**. Authority requires a **real authenticated Supabase Auth identity** and **live membership** — `auth.uid()` → `accounts.auth_user_id` → an **active** `centre_memberships` row → the live relationship. **Shared credentials are prohibited. Plaintext-password storage or display is prohibited.** A login screen must not imply that choosing a role grants it, must not expose whether an unrelated account exists, must not bypass real Supabase Auth, and must not reveal internal authorization details in errors. **The three login frames are distinct nodes and are therefore three separately frozen visual references**, whatever implementation they share. |
| **A-047** | none — this clause **preserves and maps** | **A-016 preserved unchanged and reaffirmed** | `CLAUDE.md` §6, §9; the inventory §8.4 | **Centre → Class Grade → Class Module → Class Session is preserved unchanged.** Where a Design 2 screen or the compiled screen list presents a **"class type"**, that presentation **maps to the Class Module** under a selected Class Grade, and the canonical routes use `[classModuleId]`. **No hidden `classes` entity is introduced.** This mapping stands **unless a later amendment changes it**. |
| **A-048** | none — this clause **preserves** | **A-021's parent row, A-034's management-edit boundary and A-038's read models preserved unchanged**; **no clause of Amendment 004 is named or altered** | `CLAUDE.md` §6; the inventory §4.4, §8.3 | Existing **lifecycle, privacy and authorization controls are preserved in full**. **Parent child selection is limited to linked children**; **Parent access remains submitted-canonical and view-only** — unchanged and absolute. **Amendment 004's Management-edit boundaries are preserved exactly.** **Management Term Report (ID 28) remains separately governed before implementation** — its generator is out of MVP scope (v3 §28, `CLAUDE.md` §5/§8) and no screen in this inventory authorizes it. |

---

## A-041 — The complete final-MVP visual-reference inventory

**Ratified: 36 screens.** Three authentication screens and thirty-three portal screens, all belonging to Figma file key `sSY1TYw3jyVlZDy8V2Mu7g`, file name `SDS-dashboard`.

| Group | IDs | Count |
|---|---|---|
| Authentication | `AUTH-01` … `AUTH-03` | 3 |
| Trainer | 01 … 10 | 10 |
| Management | 11 … 29 | 19 |
| Parent | 30 … 33 | 4 |
| **Total** | | **36** |

**Authentication IDs remain outside the numbered portal sequence**, so the previously accepted portal numbering **does not shift**. Portal numbering **01–33 is preserved exactly** as previously accepted.

**Parent numbering is normalized to 30–33.** The orchestrator's compiled source list carried four Parent entries all prefixed `30-`. They are four distinct screens and are numbered 30, 31, 32 and 33. **This is a normalization of a duplicated prefix, not a renumbering of an accepted sequence.**

**Node uniqueness.** All 33 portal Figma nodes are unique. The three authentication nodes are unique. **No node is shared between any two screens.** Where — and only where — the orchestrator explicitly confirms in writing that two screens share one visual frame, that sharing must be **documented at the screen entry**; absent such a confirmation, a shared node is a **defect**, not a permitted economy.

**Each authentication screen remains a separately frozen visual reference** because the three supplied frames differ. The screens may share implementation components; **the visual references do not merge**.

**The per-screen inventory — IDs, folders, screen names, canonical routes, Figma nodes and URLs, visual status, implementation status, core-slice flag, flow order, backend dependency, screenshot status, current route, compatibility treatment and gap classification — is `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md`.** That document is procedural and subordinate to this amendment.

---

## A-042 — Canonical route ratification

**All 36 canonical routes are ratified as the final-MVP target.**

**Route-string counting.** There are **exactly 36 canonical route strings**, of which **three are role-query variants over one path** (`/login?role=trainer`, `/login?role=management`, `/login?role=parent`). The three variants are **three distinct canonical routes** because they identify three distinct screens; they are **one implementation path**.

**Dynamic segments use bracket notation** — `[sessionId]`, `[studentId]`, `[reportId]`, `[classModuleId]`. The compiled source list's prose placeholders (`specific-session-id`, `specific-student-id`, `specific-report-id`, `specific-class-type`) are **normalized to bracket notation**, and `specific-class-type` normalizes to `[classModuleId]` under A-047.

**This clause creates no route.** The physical-test contract's §4 route families remain the routes the physical test runs on, and remain correct against the contract that governed them. **Reconciliation between an implemented route and its canonical route is recorded per screen in the inventory §7 with one of: move to canonical route · preserve existing route as redirect · preserve as compatibility alias · replace after integration · operator decision required.** Executing any of those treatments requires its own authorization.

**A route that renders a role's surface must independently prove that role server-side. Rendering is never a permission** (A-046, ADR-4).

---

## A-043 — The exact twelve-screen physical-test subset

**Exactly twelve visual-reference screens are immediate physical-test blockers**, in this contiguous flow order:

| Flow order | Screen ID | Screen | Canonical route |
|---:|---|---|---|
| 1 | AUTH-01 | Trainer Login | `/login?role=trainer` |
| 2 | 05 | Trainer Schedule | `/trainer/schedule` |
| 3 | 06 | Trainer Student Roster | `/trainer/schedule/[sessionId]/student-roster` |
| 4 | 07 | Trainer Grade Student | `/trainer/schedule/[sessionId]/student-roster/[studentId]/grade-student` |
| 5 | 08 | Trainer AI Report Generation | `/trainer/schedule/[sessionId]/student-roster/[studentId]/grade-student/ai-report-generation` |
| 6 | 10 | Trainer Student Report | `/trainer/reports/[reportId]` |
| 7 | AUTH-02 | Management Login | `/login?role=management` |
| 8 | 29 | Management Reports | `/management/reports` |
| 9 | 19 | Management Student Report | `/management/students/[studentId]/reports/[reportId]` |
| 10 | AUTH-03 | Parent Login | `/login?role=parent` |
| 11 | 32 | Parent Reports | `/parent/reports` |
| 12 | 33 | Parent Class Report | `/parent/reports/[reportId]` |

**The governed physical-test workflow:**

Trainer sign-in → session selection → roster → student assessment → grounded AI report generation → **Trainer review / edit / checklist / approval** → Management sign-in → Management queue → Management wording edit, return or final **Approve & Submit** → Parent sign-in → Parent submitted-report list → Parent canonical report detail.

**Trainer approval is part of the governed lifecycle and is never abbreviated away.** Trainer approval commits `draft_ready | needs_edit → trainer_approved`, freezes that version, and **publishes nothing** (A-033, A-036). Management's Approve & Submit is the **only** action that makes a report parent-visible. Where management returns a report, **the trainer owns the correction and must reapprove through a new immutable version** (A-035).

**Only these twelve screens block the physical-test walkthrough.** Six of the eight blocked design families recorded in the Figma matrix §0.1 are exercised by this walkthrough and **have no frame in this inventory because the Figma file does not contain one**. They are built to the ratified governance rules and the contract's field lists. **No frame, node ID or field may be invented for any of them.**

---

## A-044 — The twenty-four deferred portal screens

**The remaining 24 portal screens are `Post-48-hour final-MVP scope`.** They are **required for the final MVP** and **not required before the physical test**:

01 · 02 · 03 · 04 · 09 · 11 · 12 · 13 · 14 · 15 · 16 · 17 · 18 · 20 · 21 · 22 · 23 · 24 · 25 · 26 · 27 · 28 · 30 · 31

**Binding consequences:**

- **No active document may state or imply that all 36 screens are required before the physical test.**
- **No active document may omit a core screen** from the twelve-screen subset.
- **These 24 screens must not be required to be visually complete before the physical test.**
- **Deferral deletes no safeguard.** Every privacy, approval, audit, evidence and PDPA control applies in full whenever a deferred screen is implemented.
- Where inspection proves that part of a deferred screen **already exists** as shared infrastructure or an implemented route, that is recorded per screen rather than the screen being reclassified as complete.

---

## A-045 — Visual authority and the Figma-never-bypasses-governance rule

**Visual authority, highest first:**

1. **Frozen `reference.png`** — the screenshot captured into the external UI-reference pack and frozen for that screen.
2. **Node-specific Figma context** — the exact frame named by the screen's node ID.
3. **Existing frontend implementation.**

**Functional, security and privacy authority, highest first:**

1. **Specification and active amendments**
2. **`CLAUDE.md`**
3. **Lifecycle and authorization baselines**
4. **Ratified implementation contract**
5. **Figma**

**Figma never bypasses governance.** A frame is authoritative for visual layout, visual hierarchy, component composition, visible fields, screen labels, microcopy, page relationships, screen-to-screen interaction intent, visual states and responsive behaviour **where explicitly shown**. It is **never** authoritative for database schema, foreign-key design, RLS, server authorization, report lifecycle, audit behaviour, Auth implementation, AI governance, persistence architecture, state-machine rules or transaction boundaries.

**Where a frame and a ratified rule disagree, the ratified rule wins and the discrepancy is recorded** — never quietly reconciled. **A-022.2's prohibited-porting list is unchanged**, and **A-013's disposition discipline is preserved**: no visual asset enters the repository without a recorded `PORT` / `REFERENCE ONLY` / `REBUILD` / `REJECT` / `NOT APPLICABLE` disposition.

---

## A-046 — Authentication screens: presentation, identity and prohibitions

**The `role` query parameter selects presentation only.** It is a rendering hint and **carries no authority whatsoever**.

**Authority requires a real authenticated identity and live membership**, resolved server-side on every request: `auth.uid()` → `accounts.auth_user_id` → an **active** `centre_memberships` row → the live relationship (class-session assignment for a trainer, the sole centre for management, `parent_student_links` for a parent). **Never a token claim, never a UI condition, never a query parameter** (ADR-4, A-020, A-030).

**Prohibited on the login screens, absolutely:**

- implying that choosing a role grants that role;
- exposing whether an unrelated account exists;
- storing or displaying a plaintext password;
- bypassing real Supabase Auth;
- providing shared credentials;
- revealing internal authorization details in errors.

**Shared credentials are prohibited** — the single named management account is one named account, never a shared login (A-015). **No plaintext generated password is ever stored, displayed, emailed or logged** (A-020), and **no application table may hold an authentication secret** (A-027) — both unchanged.

**The three login frames are distinct nodes**, so **three separately frozen visual references are required**. Sharing one implementation shell and one route file is permitted and expected; **the visual references do not merge**.

---

## A-047 — Hierarchy preserved; "class type" maps to Class Module

**Centre → Class Grade → Class Module → Class Session is preserved unchanged** (A-016). The only Class Grade values remain `Beginner`, `Intermediate`, `Advanced`. **"Class Grade" remains the canonical term**; "Academic Level" is not.

**Where a Design 2 screen or the compiled screen list presents a "class type"** — for example "junior public speaking" or "intermediate public speaking" — **that presentation maps to the Class Module** under a selected Class Grade. The canonical routes for IDs 13, 14, 15, 16 and 27 therefore use **`[classModuleId]`**.

**No additional hidden `classes` entity is introduced** between Class Grade and Class Module. **This mapping stands unless a later amendment changes it.** If a screen is later found to require a genuinely distinct entity, that is an amendment, not an implementation decision.

**Calendars remain projections** of class-session records and their assignments. **Management and trainer calendars must not store separate duplicated event records** (A-016) — this constrains IDs 25 and 31.

---

## A-048 — Preserved lifecycle, privacy and authorization controls

**This amendment preserves every existing control and weakens none.**

- **Amendment 004's Management-edit boundaries are preserved exactly.** Management may read the final-review candidate at `trainer_approved` and the canonical submitted version; may edit **only** the four parent-facing wording panels; may **return** a report for a rating, observation or derived assessment-fact issue; and performs the final **Approve & Submit**. Management **never** modifies ratings, observations, attendance, evidence, trainer notes or any underlying assessment fact (A-034, A-038).
- **Parent access remains submitted-canonical and view-only — unchanged and absolute.** Parents read only the version `latest_submitted_version_id` names, and only for linked students.
- **Parent child selection is limited to linked children.** The multi-child affordance shown on the Parent Dashboard, Calendar and Reports screens is a presentation control **over live `parent_student_links` rows only** — never a picker over the centre's students.
- **No per-dimension rating grid appears in any parent surface, in any form or wording.** No content hash, revision number, correction reason, trainer note, draft, AI history or audit row reaches a parent surface, and **nothing may disclose that a correction cycle is or was underway.**
- **The eight-value `report_status` set, the fourteen legal transitions, the freeze point, the immutable-version rule, dual approval provenance and the audit chain are untouched.**
- **The competency-rating vocabulary is not amended by this amendment.** `Emerging` → `Developing` → `Secure` → `Advanced` and its polarity bands are governed by a **separate vocabulary-reconciliation checkpoint**. **Nothing here changes it.**
- **Management Term Report (ID 28) remains separately governed before implementation.** Term-report **generation is explicitly out of MVP scope** (v3 §28; `CLAUDE.md` §5, §8) — term evidence is captured, the generator is not built. **Its presence in the visual inventory authorizes nothing.**

---

## What Amendment 005 explicitly does NOT change

- It does **not** amend Specification v3 or Amendments 001, 002, 003 or 004 except for the clauses named in its supersession table.
- It does **not** amend the **competency-rating vocabulary**.
- It does **not** change the canonical hierarchy, the one-centre boundary, the three-flow boundary, the nine mandatory dimensions, attendance defaults, the identity/invitation model, the no-ORM rule or the ratified phasing.
- It does **not** change the report lifecycle, the status set, the transition set, the management editing boundary, the parent boundary, notification triggers or the audit design.
- It does **not** create, move, delete or restyle any application code, route or component.
- It does **not** authorize any checkpoint — Step 7I2A and every later checkpoint keep their identities and their separate-authorization requirement.
- It does **not** resolve CP-3 or CP-5, and it does not resolve the eight blocked Figma design families.
- It does **not** permit inventing a frame, a node ID or a field.

---

## Unresolved items carried or created by this amendment

| # | Item | Status |
|---|---|---|
| **U-A5-1** | **ID 05 Trainer Schedule has no implemented route**, and it is a core-slice screen (flow order 2). Session selection is currently folded into the trainer landing surface. | **OPEN — operator decision required.** Accept the fold for the physical test, or build `/trainer/schedule` before it. Recorded in the inventory §7.3 |
| **U-A5-2** | Three implemented routes carry governed surfaces with **no inventory ID** because no Figma frame exists: the trainer wording editor, the management wording-only editor, and the management final-review surface sharing `/management/reports/[reportId]/review` with ID 19's canonical read. | **OPEN — operator decision required**, and dependent on the eight blocked design families |
| **U-A5-3** | Exact field inventories for Create Class, student profile, parent profile and trainer profile remain **UNRESOLVED**, blocking IDs 20, 21, 24 and 26. | **OPEN — carried from the Figma matrix §5.2.** Do not invent a field |
| **U-A5-4** | **Management Term Report (ID 28)** governance — the instrument exists (7 criteria, a different scale) but its generator is out of MVP scope. | **OPEN — separately governed.** Not reopened here |
| **U-A5-5** | Whether the six management-review blocked families are eventually assigned inventory IDs and node-specific frames, extending the 36-screen count. | **OPEN.** The count is **36 today**; any extension is a later amendment, never an implementation decision |

---

*Ratified 2026-08-05. No Figma asset was scraped, exported, downloaded or ported to produce this amendment; no node ID was fabricated; no application code, route or component was created, moved, deleted or restyled; and no Supabase, Docker, migration, fixture, build or server was run. Specification v3 and Amendments 001, 002, 003 and 004 remain byte-for-byte unchanged.*
