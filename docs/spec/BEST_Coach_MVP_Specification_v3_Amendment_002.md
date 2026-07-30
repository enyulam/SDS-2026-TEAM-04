# B.E.S.T Coach — MVP Specification v3 Amendment 002

**Status:** Ratified by orchestrator
**Ratification date:** 2026-07-30
**Amends:** `BEST_Coach_Complete_MVP_Specification_v3.md` (this repository, `docs/spec/`) and, **only where explicitly named**, `BEST_Coach_MVP_Specification_v3_Amendment_001.md`

---

## Relationship to Specification v3 and Amendment 001

Specification v3 remains the **authoritative baseline** for this build. Amendment 001 remains **fully in force**. This amendment records orchestrator-ratified **final MVP scope and product decisions** that **supersede only the specific clauses named in the supersession table below**.

Rules of precedence for this amendment:

1. Every v3 clause not named here remains in force, unchanged.
2. Every Amendment 001 decision (**A-001 through A-012**) remains **active and unchanged**. **A-013 is superseded only for the UI-reference source and its install timing** — its "do not install visual assets without an explicit disposition" discipline survives intact and now applies to Figma Design 2 assets instead of Stitch exports.
3. **A later amendment wins only for the clauses it explicitly supersedes.** Where Amendment 002 names a clause, Amendment 002 governs that clause. Where it does not, v3-as-amended-by-001 governs.
4. Specification v3 is **never edited in place**; Amendment 001 is **never edited in place**. Both remain byte-for-byte unchanged.
5. `CLAUDE.md` (the standing agent contract) and the Implementation Plan must agree with v3 as amended by 001 **and** 002; where any of them still contains superseded wording, the wording in the governing amendment prevails and the stale text is historical.

**The core governance rule is unchanged and remains absolute:**

> **AI drafts. Trainer approves. Parents and management see only approved reports.**

**Amendment 002 does not weaken any privacy, approval, audit, or evidence control.** Nothing in this amendment relaxes RLS, server-side authorization, the append-only hash-chained audit log, the grounding-validation pipeline, the guarded state machine, the approval checklist, or the Amendment 001 evidence-security restrictions. Where this amendment narrows MVP *scope*, it narrows **what is built**, never **how strictly what is built is governed**.

**Precedence (highest first):** **v3 → ratified amendments (001, then 002 for the clauses each names) → `CLAUDE.md` → Implementation Plan → Figma Design 2 (visual/interaction reference only) → `STATUS.md` → `BUILD_NOTES.md` → temporary migration tracker.**

---

## Supersession table

| Amendment | v3 section(s) / clause superseded | Amendment 001 effect | Other active documents affected | Effect |
|---|---|---|---|---|
| **A-014** | §5 (stakeholder set as MVP completion scope); §6 "Included in current base design"; §8 (screen inventory as the complete MVP screen list); §9 (feature set by phase); §14 (TA row as a required completed MVP flow); §26 Phase 2 (TA phase as an MVP completion gate) | none | `CLAUDE.md` §6 roles, §10 Phase 2; Plan Phase 2, §5.2 TA UAT | MVP completion = exactly **three** completed human-user flows (Management, Trainer, Parent), **one centre**. TA is deferred and is not an MVP completion gate. |
| **A-015** | §6 "cross-branch/HQ administration" exclusion (extended); §16 ADR-7 (operational form); §20 `centres` / `management_centre_assignments` (operational form) | none | `CLAUDE.md` §2 ADR-7, §6 | The MVP operates for **exactly one seeded centre**. A real `centres` entity and centre-scoped relationships are retained; **no** centre creation/deletion/switching, multi-centre administration, cross-centre analytics/transfer, HQ role, or super-admin role exists. **One named management account** for that centre — never shared credentials. |
| **A-016** | §8 (class/session screen wording); §10 (blueprint class wording); §20 data model (`classes` → `class_sessions` naming and hierarchy wording); §17/§18 where "class" is used as the single academic level | none | `CLAUDE.md` §6 data model; Plan Phase 0 step 4, Phase 1 | Canonical hierarchy is **Centre → Class Grade → Class Module → Class Session → downstream records**. Class Grade values are exactly **Beginner, Intermediate, Advanced**. "Class Grade" replaces "Academic Level" as the active term. |
| **A-017** | **§3.5 decision 1** ("streamlined quick mode (the core 4 Competency dimensions)"); §8 B.E.S.T Form "Mode toggle: Quick or Full"; §9 "(quick/full)"; §10 "per mode"; §15 "per mode"; §20 `observations.mode` (quick/full) as an active requirement; §26 Phase 1 "quick/full" | none | `CLAUDE.md` §5 "Two capture modes", §7.1, §10 Phase 1; Plan Phase 1 steps 1–2 and its review checklist | **All nine B.E.S.T dimensions are mandatory for every assessment.** Quick mode is **removed completely**; there is **no** four-dimension-only completion path and **no** four-dimension fallback. The nine dimensions, the four ratings, the rubric anchors, grounding validation, trainer accountability, and governed AI generation/review are all **retained unchanged**. |
| **A-018** | §10 "initialise attendance"; §15 (attendance not previously specified in default terms); §20 `attendance` (session↔student↔status) operational rule | none | `CLAUDE.md` §6; Plan Phase 1 | Attendance **defaults to `Present`** for every enrolled student on roster initialization; the trainer may toggle an individual student to `Absent`; the final state persists per **student + class session** (conceptually unique); absence must never produce or expose a fabricated assessment or report; attendance changes are **auditable**. |
| **A-019** | §5 Management "primary role" (monitoring only); §6 (management administration absent from included scope); §8 management screens (read-only inventory); §9 "Management visibility"; §26 Phase 3 ("read projections" as the whole of management scope) | none | `CLAUDE.md` §6; Plan Phase 3 and its sequencing | Management is an **administrative role as well as a read role**: it creates Class Modules under a selected Class Grade, dated Class Sessions, trainer/student/parent profiles and invitations, enrolments, parent–student links, and trainer assignments. Every management write is **server-side, centre-scoped, validated, authorized and auditable**. Management **remains read-only for feedback-report content** (§14 unchanged in that respect). |
| **A-020** | §20 `users` ("Identity; coarse role only"); §21 (authentication/authorization wording, extended); §14 (role rows, extended) | none | `CLAUDE.md` §6 roles; Plan Phase 0 step 6, Phase 1 | The **authenticated Supabase Auth identity is distinct from the application/domain profile**. Management initiates parent and trainer invitations by email; the recipient verifies and sets their own credentials; **no plaintext generated password is ever stored, displayed or emailed**; invitation states include at least **pending / accepted / expired / revoked**; a profile that has not completed activation is **not** an active login identity. Authorization remains live-relationship-based and RLS/server-enforced. |
| **A-021** | §8 Parent Feedback Report / Review & Approve / management report surfaces treated as independent formats; §14 (read-model wording, extended) | none | `CLAUDE.md` §6, §7; Plan Phases 1–3 | There is **one canonical feedback-report format** (from Figma Design 2), **one shared submitted-report read model**, and **one reusable presentation architecture** across trainer, management and parent. Trainer: view + edit within the governed workflow. Management: **view only**. Parent: **view only, linked students only**. All existing draft/notes/raw-rating/AI-history prohibitions are **retained and strengthened**, and are enforced **server-side**, never by hiding an Edit button. |
| **A-022** | **§19** "UI generation — Google Stitch"; **§25** toolchain table and loop ("Stitch generates a screen → you export it"); §8 preamble ("Each screen is generated as a Stitch screen") | **Supersedes A-013 only for the UI-reference source and install timing.** A-013's disposition discipline (`PORT` / `REFERENCE ONLY` / `REBUILD` / `REJECT` / `NOT APPLICABLE` before any asset is copied) **remains in force** and now applies to Design 2 assets. | `CLAUDE.md` §1, §2, §3.5, §7, §7.1, §9, §10, §12; Plan Phase −1, Phase 1 | **Figma Design 2 replaces Stitch as the final UI authority.** Figma is authoritative for visual layout/hierarchy/composition, visible fields, screen labels, microcopy, page relationships, screen-to-screen interaction intent, visual states, and explicitly shown responsive behaviour. Figma is **not** authoritative for schema, foreign keys, RLS, server authorization, report lifecycle, audit, Auth, persistence, state-machine rules, or transaction boundaries. A **mandatory implementation-readiness gate** precedes the first Figma-based UI checkpoint. |
| **A-023** | **§18** `/server/db` "schema + typed client (**Prisma or Drizzle**)"; §19 (data-layer row, clarified) | none | `CLAUDE.md` §9 repo structure; Plan Phase 0 step 3 | **Supabase-native data access is ratified; no general-purpose ORM is part of this MVP.** `@supabase/ssr` + `@supabase/supabase-js`; Supabase SQL migrations are the **schema source of truth**; generated Supabase database TypeScript types are **authoritative for application data types**; normal access is RLS-scoped; governance-carrying writes use reviewed server actions/route handlers; atomic transition+audit uses reviewed PostgreSQL functions/RPCs; elevated access uses a separate server-only client and requires explicit authorization. An ORM may enter only via a later explicit ADR **and** orchestrator approval. This formally resolves the recorded data-layer governance tension. |
| **A-024** | **§26** Build Plan phase content and ordering (Phases 1–3); §9 phase feature allocation | none | `CLAUDE.md` §10 Phase 1/2/3; Plan Phases 1–3 and §5.2 UAT | Implementation phasing is revised to the **three-flow sequence** below; **final UAT covers Management, Trainer and Parent only**; **TA UAT is not an MVP completion gate**. Evidence-media requirements become **conditional** and are governed by the unresolved uploader decision recorded under the TA and evidence boundary. |

---

## A-014 — Final MVP boundary: one centre and exactly three completed flows

**Ratified scope.** The completed MVP contains exactly **three complete human-user flows**:

1. **Management**
2. **Trainer**
3. **Parent**

The MVP **operates for one centre only**.

The MVP **must include** all screens, pages, interactions, functions, permissions and persisted data required for those three flows to work **end to end**.

The MVP **does not require**:

- centre creation;
- centre deletion;
- centre switching;
- multi-centre administration;
- cross-centre analytics;
- cross-centre transfers;
- an HQ role;
- a super-admin role;
- a completed Teaching Assistant user flow;
- TA-specific UAT as an MVP completion gate.

**TA and evidence boundary.**

- **Amendment 001's evidence-security safeguards (A-001, A-003, A-004) are not deleted or weakened.** They continue to apply **in full** if evidence is implemented.
- Teaching Assistant is **not** one of the three required completed MVP flows; TA-specific screens, the TA login flow, and TA-specific UAT are **deferred**.
- Evidence media is **not** automatically a final-MVP completion requirement merely because older documents included a TA phase.
- **If evidence media is retained** in the three-flow MVP, then **both** of the following must be **explicitly confirmed by the orchestrator** before evidence implementation:
  1. **who uploads the evidence**;
  2. the **corresponding approved Figma Design 2 screen**.
- **The evidence-uploader decision is recorded as UNRESOLVED.** No replacement actor is invented. TA evidence-upload permissions are **not** silently transferred to management or trainer.

## A-015 — One-centre persistence and management-account rule

**Persistence.** A **real `centres` entity and centre-scoped relationships are retained** so that future multi-centre expansion is **additive, not a redesign**. `classes`-family entities remain centre-linked, and management access remains a live relationship, exactly as v3 §20 and ADR-7 describe.

**Operation.** The MVP must use:

- **exactly one** synthetic or seeded centre;
- **no** centre-selection interface;
- **no** centre-management interface.

**Management account.** There is **one named management account** for the centre. This must **not** be described or implemented as shared credentials used by multiple management staff. It is a single, named, individually-attributable identity — audit attribution depends on it.

This extends, and does not contradict, v3 §6's exclusion of cross-branch/HQ administration and ADR-7's branch-scoped, single-tier, no-HQ decision.

## A-016 — Canonical hierarchy: Centre → Class Grade → Class Module → Class Session

**Authoritative hierarchy:**

```
Centre
  → Class Grade
      → Class Module
          → Class Session
              → downstream records (attendance, observations, reports, evidence)
```

**Class Grade values — the only values in the MVP:**

1. **Beginner**
2. **Intermediate**
3. **Advanced**

**Terminology.** Use **"Class Grade"** in active requirements. **"Academic Level" is not the current canonical term** and must not be used as such.

**UI vs entity.** The UI action may be labelled **"Create Class"**, but the persisted academic entity created by that action is the **Class Module** under a **selected Class Grade**. Do **not** introduce an additional hidden `classes` entity between Class Grade and Class Module unless the orchestrator explicitly reopens this decision.

**Ratified conceptual relationships:**

- one centre has many class grades;
- one class grade has many class modules;
- one class module has many class sessions;
- students **enrol in class modules**;
- attendance belongs to **one student and one class session**;
- observations and assessments belong to the appropriate **student and class session**;
- reports are **derived from the governed assessment and review workflow**;
- **trainer assignment is authoritative at class-session level**;
- **calendars are projections** of class-session records and their assignments;
- **management and trainer calendars must not store separate duplicated event records.**

## A-017 — Mandatory full nine-dimension assessment; Quick mode removed

**Supersedes v3 §3.5 decision 1** and every active "quick mode" / four-dimension-only completion path.

**Ratified rule.** Every assessment **always requires all nine B.E.S.T dimensions**.

- **Quick mode is removed completely.**
- **All four-dimension-only completion paths are removed.**
- **No four-dimension fallback mode is retained.**

**Retained without change — the canonical nine dimensions:**

1. Body
2. Emotion
3. Speech
4. Tonality
5. Eye Contact
6. Vocal Projection
7. Emotional Expression
8. Sentence Flow
9. Audience Awareness

**Retained without change — the four ratings:**

1. Emerging
2. Developing
3. Secure
4. Advanced

**Also retained without change:** rubric anchors (v3 §3.3), grounding validation (§12, §24), trainer accountability (§4), and governed AI generation and review (§11, §13). **All nine dimensions are required before assessment completion.**

This removes a completion-path variant; it does **not** relax any governance mechanism. Validation, the future-session lock, and the failure/recovery designs of §15 continue to apply — now always against the full nine-dimension requirement.

## A-018 — Session attendance defaults Present with trainer-controlled Absent toggle

**Ratified rules.**

- When a valid class-session roster is initialized, **each enrolled student is `Present` by default**.
- The **trainer** can toggle an individual student from `Present` to `Absent`.
- The final state **persists for that specific student and that specific class session**.
- **Attendance uniqueness is enforced conceptually for student + class session** (one attendance record per student per session).
- **Absence must not create or expose a fabricated assessment or report.**
- **Attendance changes must be auditable.**

This preserves v3 §20's rule that attendance "blocks reports for absent students" and adds the default/toggle behaviour and the auditability requirement.

## A-019 — Management administration: class modules, sessions, assignments and enrolments

The completed **management flow** must include all corresponding approved **Figma Design 2** screens and functions, including:

- management authentication;
- management dashboard;
- management calendar;
- management overview and statistics screens represented in Design 2;
- **Create Class**;
- class-session scheduling;
- trainer creation;
- student creation;
- parent creation and invitation;
- student enrolment;
- parent–student linking;
- trainer assignment;
- canonical feedback-report viewing.

**Management must be able to:**

1. Create a **Class Module** under a **selected Class Grade**.
2. Enter the class or module details required by the approved final form.
3. Create **one or more dated Class Sessions**.
4. Enter required session details such as **date, start time and end time** where supported by the approved design.
5. Assign **one specific trainer** to each Class Session.
6. See created sessions in the **management calendar**.
7. Cause an assigned session to appear in the **assigned trainer's calendar**.
8. Create **student profiles**.
9. **Enrol students in a Class Module.**
10. Create **parent profiles and account invitations**.
11. **Link** the appropriate student profile or profiles to a parent.
12. Create **trainer profiles and account invitations**.
13. **View submitted reports** using the canonical report format.
14. **Never edit feedback-report content.**

**Every management write must be:**

- performed **server-side**;
- **centre-scoped**;
- **validated**;
- **authorized**;
- **auditable**.

**Trainer calendar rule (the projection rule).** Management assigns a trainer to a class session; **the same stored class-session record** appears in the assigned trainer's calendar. **Do not create a separate trainer-calendar copy.** Only sessions assigned to the trainer are available through the trainer flow.

**Trainer flow completeness.** The completed trainer flow must include all corresponding approved Design 2 screens and functions, including: trainer authentication; trainer dashboard; trainer calendar; assigned class-session details; session roster; attendance; nine-dimension assessment; AI feedback drafting; report review; report editing; approval or submission; and canonical feedback-report viewing.

## A-020 — Profile, invitation and account-activation model

**Ratified distinction.** The **authenticated Supabase Auth identity** is distinct from the **application/domain profile**. A profile row is not a login; a login is not a profile.

**Ratified lifecycle rules:**

- management has **one named active account** for the sole centre;
- **parent profiles are separate from parent Auth identities**;
- **trainer profiles are separate from trainer Auth identities**;
- management **initiates parent invitations**;
- management **initiates trainer invitations**;
- the invitation is sent to the **supplied email address**;
- the recipient **verifies the account**;
- the recipient **establishes their own login credentials**;
- **no plaintext generated password is stored, displayed or emailed**;
- invitation states must support **at least**: `pending`, `accepted`, `expired`, `revoked`;
- **a profile that has not completed activation must not be treated as an active login identity.**

**Authorization sources (unchanged in principle, restated for this model):**

- **parent** authorization comes from **live parent–student relationships**;
- **trainer** authorization comes from **live class-session assignments**;
- **management** authorization comes from the **sole centre-management relationship**;
- authorization must be enforced through **RLS and server-side guards**;
- **UI visibility and JWT convenience claims are not sufficient authorization** (v3 §21 claims-staleness rule and ADR-4 remain in force).

## A-021 — One canonical role-aware feedback-report format

**Ratified rule.** There is **one canonical feedback-report format**, based on **Figma Design 2**. Use **one shared report read model** and **one reusable presentation architecture** across trainer, management and parent. **Do not create three independent report formats.**

**Role behaviour:**

| Role | Behaviour |
|---|---|
| **Trainer** | View **and edit** within the governed report workflow |
| **Management** | **View only** |
| **Parent** | **View only**, and **only for linked students** |

**Preserved governance rules (all retained, none weakened):**

- management and parent can read **only the submitted or approved report snapshot**;
- management and parent **cannot access drafts**;
- management and parent **cannot access internal trainer notes**;
- management and parent **cannot access raw private assessment data** unless explicitly authorized by a later amendment;
- management and parent **cannot access AI generation history**;
- **hiding an Edit button is not authorization**;
- **server-side authorization must reject management and parent edit attempts**;
- trainer edits must operate on the **governed editable report version**;
- trainer edits **must not mutate a submitted approval snapshot in place**;
- **editing resets the quality checklist** where the governed workflow requires it;
- **editing requires review and approval again**;
- **AI never publishes directly.**

**Source of the report's visible content.** The exact **report sections, labels, field arrangement, component hierarchy, visible content, and presentation styling must come from the approved Figma Design 2 report frame.** **Do not fabricate report fields** that cannot be established from an authoritative document or a verified Figma frame. Until that frame is verified, the authoritative content baseline remains v3 §8's parent panels (Today's Strength, Next Focus, Practice Suggestion, Session Takeaway) plus `CLAUDE.md` §6's confirmed prohibition on any per-dimension rating grid in the parent view. The exact Design 2 report section and field schema is recorded as **UNRESOLVED** (see §"Remaining open decisions" in `STATUS.md` and the Figma matrix).

## A-022 — Figma Design 2 replaces Stitch as the final UI authority

**Final UI reference:**

`https://www.figma.com/proto/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=391-2&t=lRaOIpHfwA4ZaNMZ-1`

The **"Design 2"** screens are the canonical **visual and interaction** reference for the three final MVP flows.

**Figma Design 2 IS authoritative for:**

- visual layout;
- visual hierarchy;
- component composition;
- visible fields;
- screen labels;
- microcopy;
- page relationships;
- screen-to-screen interaction intent;
- visual states;
- responsive visual behaviour **where explicitly shown**.

**Figma Design 2 is NOT authoritative for:**

- database schema;
- foreign-key design;
- RLS;
- server authorization;
- report lifecycle;
- audit behaviour;
- Auth implementation;
- persistence architecture;
- state-machine rules;
- transaction boundaries.

**Screen inclusion rule.** All Design 2 screens belonging to **Management, Trainer and Parent** are part of the intended final MVP **unless** a screen is clearly: an obsolete exploration; a duplicated alternative; outside the three confirmed flows; or inconsistent with a ratified governance rule.

**During a documentation checkpoint:** do **not** scrape, export, download or port Figma assets, and do **not** fabricate exact Figma node IDs that have not been verified.

### A-022.1 — Mandatory Figma Design 2 implementation-readiness gate

A **mandatory implementation-readiness gate** exists **before the first Figma-based UI implementation checkpoint**. The gate requires the orchestrator to **provide or verify, for each approved screen**:

- a node-specific Figma `/design/` link where possible;
- the authoritative screen name;
- the applicable user flow;
- the intended route;
- desktop, mobile or responsive variants where applicable;
- component states;
- interaction states;
- loading states;
- empty states;
- validation states;
- error states;
- success states;
- disabled states;
- design variables or an approved token inventory;
- typography;
- colours;
- spacing;
- radii;
- shadows;
- approved logos;
- approved SVGs;
- approved icons;
- approved image assets;
- prototype transitions or interaction notes not evident from a static frame;
- discrepancies between Figma and ratified governance or domain rules.

### A-022.2 — Approved and prohibited Figma porting

**Port only** approved presentation information and approved assets.

**Blind porting is explicitly prohibited for:**

- generated React code;
- Figma mock data;
- prototype-only navigation;
- fake authentication;
- static hard-coded user identities;
- duplicated calendar records;
- client-side authorization assumptions;
- database schema inferred from a visual frame;
- business logic inferred only from a visual frame;
- report permissions inferred only from whether an Edit button is visible;
- generated CSS or components that conflict with the MVP design system;
- prototype shortcuts that bypass Supabase, RLS or server-side validation.

**Stop-and-ask rule.** Implementation must **stop and request orchestrator input** whenever a required node-specific frame, approved asset, interaction state, responsive state, or visible field definition is **missing**. **Do not guess or silently recreate missing requirements.**

### A-022.3 — Blocking classification for the Figma handoff

- The Figma handoff is **NOT a blocker for Step 7E** (the first governed SQL migration) **unless** an unresolved visible field **changes the actual domain relationship model**.
- The Figma handoff **IS a blocker for the corresponding UI implementation checkpoint**.

### A-022.4 — Relationship to Amendment 001 A-013

A-013 is superseded **only** for the UI-reference **source** (Stitch → Figma Design 2) and its **install timing**. A-013's substantive discipline **survives**: no visual asset is copied into the repository until it has an explicit `PORT` / `REFERENCE ONLY` / `REBUILD` / `REJECT` / `NOT APPLICABLE` disposition recorded by the orchestrator, and the absence of UI assets does not block Phase 0 or Step 7E.

## A-023 — Supabase-native data layer; no general-purpose ORM

**This resolves the recorded data-layer governance tension** between v3 §18 / `CLAUDE.md` §9 (`/server/db` → "typed client (Prisma or Drizzle)") and the previously tracker-only Supabase-native decision. The tracker is the lowest-precedence document and could not override v3 or `CLAUDE.md`; this amendment provides the ratification at the correct precedence level.

**Ratified architecture:**

- **Supabase-native data access is the selected MVP architecture.**
- Use **`@supabase/ssr`**.
- Use **`@supabase/supabase-js`**.
- **Supabase SQL migration files are the schema source of truth.**
- **Generated Supabase database TypeScript types are authoritative for application data types.**
- **Normal user access is RLS-scoped.**
- **Governance-carrying writes use reviewed server actions or route handlers.**
- **Atomic state-transition-plus-audit operations use reviewed PostgreSQL functions or RPCs where required.**
- **Elevated access uses a separate server-only client.**
- **Elevated access requires explicit authorization** (the secret key bypasses RLS, so every elevated operation performs its own authorization check).
- **No Prisma, Drizzle or other general-purpose ORM is part of this MVP.**
- **An ORM may be introduced only through a later explicit ADR and orchestrator approval.**

`/server/db`'s role is unchanged in purpose — schema and typed data access — but its implementation is **Supabase migrations plus generated database types**, not an ORM.

## A-024 — Revised implementation phasing, three-flow UAT and TA deferral

**Ratified implementation sequence** (supersedes the v3 §26 Phase 1–3 content and ordering; Phase 0 foundations and Phase 4 PDPA hardening are unchanged in intent):

1. **Governance and schema-preflight decisions.**
2. **Centre, Class Grade, Class Module and Class Session foundations.**
3. **Identity, profile and invitation foundations.**
4. **Management setup and creation flows.**
5. **Trainer assignment and calendar projection.**
6. **Student enrolment and roster projection.**
7. **Trainer attendance.**
8. **Nine-dimension assessment.**
9. **AI draft, review, edit and approval.**
10. **Shared submitted-report projection.**
11. **Parent invitation, activation and linked-student view.**
12. **Management report view and remaining Design 2 management screens.**
13. **Full three-flow integration and UAT.**

**UAT scope.** Final UAT covers **Management, Trainer and Parent**. **TA is removed as a required MVP UAT flow.**

**Evidence safeguards.** Amendment 001's evidence-security restrictions (A-001, A-003, A-004) are **retained as conditional requirements**: they apply in full **if** evidence remains in scope. They are **not deleted and not weakened**. Whether evidence media remains a completion requirement, and who uploads it, are **UNRESOLVED** (A-014).

**Historical checkpoints are not renumbered.** Accepted migration and Phase 0 checkpoints (through the accepted Step 7D sequence) remain historically unchanged. The product decisions in this amendment **do not invalidate the accepted Step 7D client-boundary work** — Step 7D created client boundaries only and committed the project to no domain shape.

**Gate before Step 7E.** A formal **governance and schema-preflight gate** precedes Step 7E. A **Figma Design 2 implementation-readiness gate** precedes the first Figma-based UI implementation checkpoint.

---

## What Amendment 002 explicitly does NOT change

- **Amendment 001 A-001 through A-012 remain active**, except where this amendment names a **narrow overlap** — and the only named overlap is **A-013** (UI-reference source and install timing only).
- **The core governance rule remains active:** *AI drafts. Trainer approves. Parents and management see only approved reports.*
- **Amendment 001's evidence-security restrictions remain active** (A-001 gating, A-003 prohibited/permitted path exit, A-004 both-direction Parent UAT) and apply in full if evidence is implemented.
- **Amendment 002 does not silently weaken privacy, approval, audit or evidence controls.** RLS, server-side guards, the append-only hash-chained audit log, guarded compare-and-set transitions, the quality checklist, grounding validation, the synthetic-data-only rule, and Singapore region pinning are all **unchanged and in force**.
- The four §27 / `CLAUDE.md` §4 non-negotiables are unchanged.
- Specification v3 and Amendment 001 remain **byte-for-byte unchanged**; this amendment supersedes by reference only.

---

## Unresolved items created or carried by this amendment

These are **recorded, not answered**. Fabricating an answer to any of them is prohibited.

| # | Unresolved item | Blocks |
|---|---|---|
| U-01 | Exact individual Figma Design 2 frame/node links | The affected UI checkpoint only |
| U-02 | Exact field inventory for **Create Class** (Class Module details) | **Step 7E only if it changes the domain relationship model**; otherwise the Create Class UI checkpoint |
| U-03 | Exact fields for **trainer-profile** creation | Step 7E only if relationship-changing; otherwise the trainer-creation UI checkpoint |
| U-04 | Exact fields for **student-profile** creation | Step 7E only if relationship-changing; otherwise the student-creation UI checkpoint |
| U-05 | Exact fields for **parent-profile** creation | Step 7E only if relationship-changing; otherwise the parent-creation UI checkpoint |
| U-06 | Exact **report sections and field schema** from the canonical report frame | The report UI/projection checkpoint |
| U-07 | Responsive variants not yet supplied | The affected UI checkpoint |
| U-08 | Figma tokens and approved asset exports | The affected UI checkpoint |
| U-09 | Whether **evidence media** remains a completion requirement | Evidence implementation only, unless it alters core schema |
| U-10 | **Who uploads evidence** if evidence remains | Evidence implementation only, unless it alters core schema |
| U-11 | Exact **evidence-related Figma screens** if evidence is retained | Evidence UI implementation only |
| U-12 | Audit **target representation** (typed FK vs polymorphic `target_type`/`target_id`) | **Step 7E / Step 7H** |
| U-13 | **Audit-chain scope** (one global chain vs per-target/per-tenant) | **Step 7H** |
| U-14 | **SHA-256 ratification** for the audit hash (v3 §23 names no algorithm) | **Step 7H** |
| U-15 | **Audit-chain genesis rule** (sentinel vs zero-hash) | **Step 7H** |
| U-16 | Database **`GRANT` decisions** for newly created tables | **Step 7E** |
| U-17 | **Profile ↔ Auth physical-key decision** (`public` profile relationship to `auth.users`) | **Step 7E** |
| U-18 | **Invitation token and expiry implementation details** | **Step 7E** (invitation-state storage) |
| U-19 | **Enum versus reference-table** decision at schema level (including Class Grade and report status) | **Step 7E** |

---

*Ratified 2026-07-30. This amendment supersedes only the clauses named in the supersession table; all other Specification v3 content, and all Amendment 001 decisions except the narrow A-013 overlap named above, remain authoritative and unchanged. Specification v3 and Amendment 001 are not edited in place.*
