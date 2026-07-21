# CLAUDE.md — B.E.S.T Coach

This file is read by Claude Code at the start of every session in this repo. It is the standing contract for how this project gets built. If anything here conflicts with an ad-hoc instruction in chat, **stop and ask** rather than silently picking one — see "When to stop and ask" at the end.

---

## 0. What this project is

B.E.S.T Coach is a human-in-the-loop education reporting service for a Speech Academy. Trainers observe students against the academy's **B.E.S.T. Method™** framework, an AI drafts a progress report from that observation, the trainer reviews and approves it, and only then do a parent or management see it.

**The one sentence that governs every decision in this codebase:**

> AI drafts. Trainer approves. Parents and management see only approved reports.

If a change you're about to make would let AI-generated content reach a parent or management view without a trainer approval step in between, **stop — that violates the core contract, regardless of what else the instruction says.**

---

## 1. Source of truth — read these before writing any code

These documents govern this build. Read the specification and its ratified amendment fully before starting Phase 0, and re-read the relevant section before starting any new phase or module.

**Precedence (highest first):** Specification v3 → ratified amendments (Amendment 001) → this `CLAUDE.md` → Implementation Plan → Stitch/UI reference → `docs/progress/STATUS.md` → `docs/progress/BUILD_NOTES.md` → temporary migration tracker.

| Document | Location | What it governs |
|---|---|---|
| **Complete MVP Prototype Specification (v3)** | `docs/spec/BEST_Coach_Complete_MVP_Specification_v3.md` | The authoritative build spec — product, framework, governance, architecture, data model, build plan. This file is **the source of truth**. If code and spec disagree, the spec wins; flag the discrepancy to the orchestrator rather than silently reconciling it. |
| **Specification v3 Amendment 001 (Ratified)** | `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_001.md` | Orchestrator-ratified reconciliations that **supersede only the specific v3 clauses named in its supersession table** (parent-evidence policy, evidence phase ordering, Phase 2 exit, Parent UAT, local-only Git, Node 24 toolchain, audit-mirror phasing, permanent continuity docs, testing/accessibility, audit-mutation verification, AI-Breakdown status, Stitch timing). Where it names a clause, it wins over v3 for that clause; everything else in v3 stands. |
| **AI Features Breakdown (v2)** | `docs/spec/BEST_Coach_AI_Features_Breakdown_v2.docx` — **currently unavailable / not installed** | Deep detail on the two **deferred** future AI features (Weekly Class Health Brief, Child Progress Digest). Its absence is **non-blocking** for MVP Phases 0–4 (per Amendment 001 A-011): v3 already incorporated its aggregate-AI detail. Do not fabricate it. It must be obtained and reviewed before either deferred feature is pulled into scope — see §8. |
| **Implementation Plan** | `docs/plan/BEST_Coach_Implementation_Plan.md` | **Procedural** — the orchestrator's execution and review script. It may add Phase 5 (final integration/UAT/quality) and review detail, but cannot override the specification or a ratified amendment (Amendment 001 A-012). |
| **Stitch-generated UI screens** | `docs/ui-screens/` — **installed selectively later, after accepted Phase 0** (Amendment 001 A-013) | Visual reference only — see §7. Not a source of truth for data model, business logic, or governance behaviour. Not present during governance setup; their absence does not block Phase 0. |

**Do not proceed past a section of the spec you haven't read.** If you're asked to build the Review & Approve screen and haven't read spec §11–13 (the AI Draft Assistant, grounding design, and state machine) in this session, read them first.

---

## 2. Locked architecture decisions — do not re-litigate

These are decided (spec §16, ADR-1 through ADR-7). Do not propose alternatives (e.g. Firestore, microservices, a separate API server) unless the orchestrator explicitly reopens the decision.

| # | Decision |
|---|---|
| ADR-1 | **Database: PostgreSQL via Supabase**, Singapore region (confirm the Singapore project region at creation). |
| ADR-2 | **Next.js (App Router) full-stack**, structured as a modular monolith — one deployable, enforced internal module boundaries. |
| ADR-3 | **Writes are server-only** (server actions / route handlers using `server-only`). **Reads may go directly to Supabase from the client where the data is role-scoped and protected by Row-Level Security** — this is a deliberate speed/safety split, not a shortcut to skip RLS. |
| ADR-4 | **Supabase Auth** for authentication. **Authorization is decided by RLS policies + server-side guards**, never by token claims and never by hiding UI. Do not put trainer-class assignment or parent-child relationship into JWT custom claims — check them live against the DB (RLS) on every request. |
| ADR-5 | **AI drafting is synchronous** in the MVP — call the LLM inside an awaited server action with a loading state. Keep the **idempotency key** and the **full grounding-validation pipeline** even though it's sync; do not simplify these away because "it's not async yet." An async queue (pg-boss or Cloud Tasks) is a future upgrade, not an MVP requirement. |
| ADR-6 | **Region-pin everything to Singapore** (database, storage, compute) from project creation. Use only synthetic/seed data — never real student data — until told otherwise. |
| ADR-7 | **Management access is branch-scoped, single-tier, no HQ/corporate role.** Each management account is assigned to exactly one centre (`management_centre_assignments`) and sees only that centre's data via RLS, joined through `classes.centre_id`. No cross-branch or HQ view exists in this MVP — confirmed by the orchestrator. If ever needed, an HQ tier is additive (a new role granted visibility across multiple centres), not a redesign of this decision. |

**Stack:** Next.js + TypeScript (App Router) · Supabase (Postgres + Auth + Storage + RLS) · Tailwind (paired with whatever Stitch's export uses) · an LLM API called only from server code. No Firebase, no separate Express/NestJS API layer, no microservices.

**Ratified toolchain (Amendment 001 A-006):** Node.js **24 LTS** (`.nvmrc` `24`, engines `>=24 <25`) · **npm** (`packageManager` `npm@11.13.0`) · Next.js App Router · TypeScript · Tailwind CSS · ESLint · **Turbopack** · root-level `/app`, no `/src` · **React Compiler disabled** initially. This supersedes any older "Node 20 LTS" recommendation. The MVP already exists as a **local** Next.js repository scaffolded on this toolchain.

---

## 3. Engineering personas — the standards this build must satisfy

A working feature and a professionally-built feature are not the same bar. This project has one deployable but many disciplines' worth of standards riding on it, so **apply the following personas as self-review lenses throughout the build, not as a one-time reading exercise.** Before declaring any phase-gate exit condition (§10) met, check the relevant checklists below and say explicitly, in your report to the orchestrator, which lenses you checked and what you found — not just "done."

These are lenses for *you* to reason through, not separate agents to simulate literally. Each one has a one-line mandate and a checklist grounded in this specific project — not generic best-practice filler.

### 3.1 Security & privacy engineer
**Mandate:** every access-control claim in the spec is enforced in the database or server — never assumed from the UI.
- An RLS policy exists, and is tested, for every table touched by more than one role (spec §14, §21).
- Trainer-class assignment, parent-child relationship, and **management-centre assignment** are never read from a JWT claim — always a live DB check.
- **Centre isolation is tested, not assumed:** a management account can never retrieve another centre's classes, reports, or statistics — same rigor as parent isolation, since both are relationship-scoped RLS boundaries.
- Evidence URLs are short-TTL and server-minted; no bucket or object is ever public.
- Secrets live only in server env / secret manager; verify none leak into the client bundle.
- OWASP ASVS baseline: validate every server action's input, use parameterized queries only, never string-concatenated SQL.
- PDPA-relevant tables (`consent_records`, `retention_policies`, `erasure_requests`) exist from the Phase 0 schema even though their enforcement logic isn't built until Phase 4.

### 3.2 Database / data architect
**Mandate:** the schema is normalized, constrained, and every change is reversible and reviewable.
- Enums and foreign keys are used wherever the spec defines a closed vocabulary (ratings, roles, states) — not loose strings or untyped JSON.
- Every schema change is a discrete, named, reversible migration file — never a manual ad hoc edit.
- Foreign keys and frequently-filtered columns (`trainer_id`, `student_id`, `session_id`, `status`) are indexed.
- Optimistic-concurrency columns (`version`, `lock_version`) exist wherever the spec requires compare-and-set (§13, §20).

### 3.3 Backend / distributed-systems engineer
**Mandate:** state transitions are atomic, idempotent, and cannot be corrupted by concurrent trainer, TA, or AI-worker activity.
- Every report-state transition is a guarded operation (current-state check + version bump) inside one DB transaction, with its audit write in the same transaction.
- The AI job idempotency key is implemented and actually exercised by a test that simulates a duplicate call.
- No transition is ever a bare `UPDATE ... SET status = X` without a `WHERE status = <expected prior state>` guard.

### 3.4 AI safety engineer
**Mandate:** the LLM decides phrasing, never assessment substance (spec §12).
- Every dimension passed to the LLM carries its rubric anchor and polarity band — never a bare rating string with no meaning attached.
- Grounding validation actually runs and can actually reject a draft — proven with a deliberately contradictory test case (force an `Emerging` rating and confirm a positively-worded draft gets caught, not just eyeballed).
- Trainer notes and follow-up text passed to the LLM are clearly delimited as untrusted data, never as instructions.
- Structured AI output is validated against a schema before it is ever persisted as a `report_version`.

### 3.5 Frontend engineer / accessibility specialist
**Mandate:** WCAG 2.2 AA compliance and production-quality component structure — not a pixel-for-pixel Stitch copy with inline styles and no semantics.
- Semantic HTML, correct landmark roles, real form labels, sane focus order, full keyboard operability for every interactive Stitch element (calendars, chip selectors, the approval checklist).
- Color contrast is checked against the standard, not eyeballed.
- Responsive behaviour is implemented with real breakpoints, not fixed pixel widths copied from a Stitch export.
- No client-side-only validation without a server-side equivalent — the server is authoritative per ADR-3, the client check is UX convenience only.

### 3.6 QA / test engineer
**Mandate:** the governance mechanisms are provably correct, not "seemed to work when I clicked through it."
- An automated (negative) test proves a parent's RLS-scoped query cannot return another child's report.
- An automated test proves a deliberately-invalid draft (contradicts a rating's polarity) is rejected by grounding validation.
- An automated test proves a duplicate AI job submission does not produce two `report_version` rows.
- An automated test proves `audit_events` rejects `UPDATE`/`DELETE` at the database permission level — not just "the application code never calls update." **(Amendment 001 A-010):** this test must run as the **application/restricted database role** (or a controlled `SET ROLE` / equivalent restricted session) — a test executed only as the privileged Supabase SQL-editor identity does not prove application-role denial.

### 3.7 DevOps / release engineer
**Mandate:** environments are separated, secrets are managed, the region is correct, and the build is reproducible from a clean checkout.
- Dev/staging/prod are separate Supabase projects, not schemas within one project.
- The Singapore region is verified at project creation, never assumed.
- No secrets are committed; `.env.example` is kept current with no real values.
- Code is structured to be CI-ready (lint, typecheck, migration check, tests) even before CI itself is wired up.

### 3.8 Product / service designer (HCD)
**Mandate:** the build stays faithful to the service blueprint (spec §10) and its trainer-led design principles — not just to each screen in isolation.
- Continuity (previous-session-focus carry-over) actually threads through the live roster experience, not just the database.
- Failure and recovery states (spec §15) are implemented as designed experiences with the specified copy and behaviour, not generic error toasts.
- Tone stays consistent — supportive, trainer-accountable — across AI-generated text and static UI copy alike.

### 3.9 Tech lead / code reviewer
**Mandate:** the codebase is something another developer, or the next agent session, can pick up without re-deriving intent from scratch.
- Module boundaries (spec §18) are respected — no module reaches into another module's tables directly.
- TypeScript strict mode throughout; no `any` used to paper over an unresolved modeling question.
- No silent TODOs on governance-relevant code — flag it to the orchestrator instead (see §4 and §11).
- Comments explain *why* on non-obvious governance logic (e.g. why a transition is guarded the way it is), not just *what* the code does.

---

## 4. Non-negotiables — never simplify these away, even under time pressure

These four exist specifically because a fast, agentic build tends to erode exactly these things first. Do not cut them, stub them permanently, or defer them past Phase 0/1 for velocity:

1. **The grounding-validation pipeline** (spec §12, §24; persona §3.4). Every AI-generated report draft must be checked against the trainer's actual saved ratings before it can be shown. **Never ship a version where AI output goes straight to the trainer's screen without this check running first**, even as a "temporary" simplification.
2. **Append-only, hash-chained audit log** (spec §23; persona §3.6). `audit_events` must have `INSERT`-only application privileges (`UPDATE`/`DELETE` revoked at the database level), and each row's `entry_hash` must be `hash(prev_hash + canonical_payload)`. A state transition and its audit write commit in the **same transaction** — never write one without the other. **(Amendment 001 A-007):** the **database** append-only table + hash chain are Phase 0; the **independent, retention-locked external audit mirror** (spec §23 "Independent mirror") is **Phase 4** — Phase 0 must not claim the complete external audit architecture is finished.
3. **Server-side governance writes** (ADR-3; persona §3.1). State transitions, approvals, and evidence-URL minting happen only in server code with the service role. Never expose these as client-callable RPCs that skip validation.
4. **Singapore region pinning** (ADR-6; persona §3.7). Don't default to a `us-east-1`-style default because it's the wizard's default — check the project region explicitly when scaffolding Supabase.

If you find yourself about to skip one of these "just to get something running," stop and flag it to the orchestrator instead. A visibly incomplete feature is fine at this stage; a governance mechanism that silently doesn't work is not.

---

## 5. The B.E.S.T. Method™ framework — use the real one, not a placeholder

Full detail in spec §3. Summary so you don't have to re-derive it every session:

- **4 B.E.S.T Competency dimensions:** Body (Posture & Gesture), Emotion (Facial Expression), Speech (Clarity & Structure), Tonality (Voice Control).
- **5 Speech Linguistics Pattern dimensions:** Eye Contact, Vocal Projection, Emotional Expression, Sentence Flow, Audience Awareness.
- **Scale (all 9 dimensions):** `Emerging` → `Developing` → `Secure` → `Advanced`. Each level has a specific behavioural anchor (spec §3.3) — carry the anchor text alongside the rating wherever it's used for AI generation; never just pass the bare enum value to the LLM.
- **Polarity bands** (used by grounding validation): Emerging = `needs_support`; Developing = `developing`; Secure/Advanced = `positive`.
- **Two capture modes:** Quick mode = the 4 Competency dimensions only (live-class speed). Full mode = all 9.
- **A separate, different instrument exists** — the End-of-Term Performance Report (7 criteria, `Excellent`/`Good`/`Needs Improvement` scale). Its **evidence is captured now** (`term_evidence_notes`) but its **generator is not built in the MVP** (spec §28). Do not build term-report generation unless explicitly asked.

**Do not invent your own dimension names or scale.** If unsure which of the 9 dimensions or which rating word applies in a schema, component prop, or seed data, check spec §3 — do not fall back to the older, superseded placeholder framework (Eye Contact/Body Movement/Speech Clarity/Structure/Active Listening/Confidence on a Needs Support→Strong scale). That placeholder should not appear anywhere in new code.

**Open items pending client ratification** (spec §3.6): the exact B.E.S.T acronym gloss, the 9→7 dimension roll-up for term reports, and the 4-level→3-level scale mapping. The spec's proposed defaults are fine to build against, but don't present them to the orchestrator as settled client decisions — they're provisional.

---

## 6. Data model, roles, and state machine — build to the spec, not to convenience

- **Schema:** follow spec §20 (tables, enums, relationships) as the baseline. `observation_ratings` normalises the 9 dimensions per observation — don't collapse this into a single JSON blob on `observations` unless the orchestrator agrees aggregation needs are light enough to justify it.
- **Roles:** Trainer, TA, Parent, Management, plus the AI worker as a non-human actor with its own restricted boundary (spec §14). Every table touched by more than one role needs an explicit RLS policy — don't rely on the application layer alone to filter rows.
- **Management access is branch-scoped, single-tier, confirmed by the orchestrator (ADR-7).** iSpeak has multiple branches. `centres` is a new table (one row per branch); `classes.centre_id` links every class to one centre; `management_centre_assignments` links each management account to exactly one centre — same relationship-table pattern as `trainer_class_assignments`/`parent_child_links`. Every management-facing query (Management Calendar, Class Overview, Class Statistics) must be scoped by RLS through this join — a management account must never see another centre's classes, reports, or statistics. There is no HQ/corporate tier in this MVP; do not build a "see all branches" view or role.
- **Report state machine** (spec §13): `Incomplete → Observation Saved → Drafting → Draft Ready → Needs Edit / Evidence Pending → Approved → Submitted`. Every transition is a guarded, compare-and-set operation inside a transaction (current state check + optimistic-lock version bump), with the audit write in the same transaction. Do not implement transitions as simple unconditional status updates. The `reports` table needs three boolean columns for the Quality Checklist — `checklist_evidence_confirmed`, `checklist_ai_reviewed`, `checklist_privacy_checked` — so the guarded `approve` transition can require all three `true` server-side, not just on the client.
- **Editing content resets the Quality Checklist, confirmed by the orchestrator.** The "Edit Report" screen's "Save Changes & Finalize" saves the edit and returns to Review & Approve (it does not itself approve — Approve & Submit remains the only path to `Approved`). But any save from Edit Report must reset all three `checklist_*` columns to `false`, the same way an edit already bumps `lock_version`. Otherwise a trainer could check "AI Draft reviewed," edit the draft afterward, and the checklist would keep certifying content that was never actually reviewed in its edited form — the checklist's whole purpose is to attest to *this exact text*, not to editing having happened at some point.
- **Any per-student action button on any management screen must gate on report status — caught on Class Overview, generalized after catching the same risk on Class Statistics.** This applies to Management Class Overview's "Student Report Status" table **and** Class Statistics' "Students Needing Follow-up" table — any place management can click into a specific student's report. **Only rows whose report has reached `Submitted` may link to actual report content.** Rows in `Pending Review` or `Draft Ready` must show **"Send Reminder to Trainer"** — the row-level action for those two states specifically, not a page-level Quick Action. **Rows with `No Report` status get no action button at all** (or a plain "—", matching how the Parent Calendar disables "Access" for absent students) — "Send Reminder to Trainer" doesn't apply when no report was ever started. Never expose draft text or internal notes for any non-`Submitted` row, even though the row's button may look identical to an approved row's button. Do not implement this as one generic "view report" handler shared across all rows/screens regardless of status; every such handler must check status first, independently.
- **The Management Class Overview's generic "Quick Actions" panel is removed, confirmed by the orchestrator, and Classcard (mocked or real) is removed from this project entirely, confirmed by the orchestrator.** "Send Reminder to Trainer" relocated to the per-row action above; "View Parent Preview" and "Export Summary" are cut, not deferred — they are not part of this project. Do not build any Classcard-related UI, mock export, or "Classcard-compatible" schema framing anywhere — this project has no Classcard concept at all, not even a mocked one. If either of these seems to be implied by an older reference anywhere, this note supersedes it.
- **"Class Health Summary" (Management Class Overview) is deterministic aggregation only, confirmed by the orchestrator — not the deferred Weekly Class Health Brief.** It shows exactly two computed fields: **Status** and **Main follow-up area** (the most frequently recurring improvement-focus tag across this class's *approved* reports only — a plain frequency count in code, not an LLM call). **"Status" and "Recommended Management Action" are driven by one shared, exact, closed set of four conditions, confirmed by the orchestrator — evaluated top to bottom, first match wins, so exactly one result is ever shown:**

  | # | Condition | Status | Recommended Management Action |
  |---|---|---|---|
  | 1 | Pending reports > 0 **and** evidence missing > 0 | `Pending follow-up` | "Check pending report and evidence before closing class record." |
  | 2 | Pending reports > 0 **and** evidence missing = 0 | `Pending follow-up` | "Check pending report(s) before closing class record." |
  | 3 | Pending reports = 0 **and** evidence missing > 0 | `Pending follow-up` | "Follow up on missing evidence before closing class record." |
  | 4 | Pending reports = 0 **and** evidence missing = 0 **and** all reports `Submitted` | `On Track` | "All reports and evidence complete — no action needed." |

  This is the literal, exhaustive set for the MVP — no other conditions, no escalation tiers for how long a report has been pending, no freeform generation. This reuses the aggregate-grounding pattern from §12.1 at a small, deterministic scale, and must not be expanded into AI-authored prose — that would silently pull the deferred Weekly Class Health Brief (§28.1) into scope, which stays out per §8. Per an interface-cleanup pass, this panel does **not** repeat "Reports completed," "Evidence completion," or "Parent communication" — those duplicate the KPI cards already shown above it on the same screen.
- **"Management Insight" (Class Statistics) is a fixed three-sentence deterministic template, confirmed by the orchestrator — same non-negotiable as Class Health Summary above, generalized to this screen.** Three slots, concatenated, no LLM involved:
  1. **Main follow-up area** — reuses the *exact same computation* as Class Overview's "Main follow-up area" (most frequently recurring improvement-focus tag across this class's approved reports). Same underlying fact stated consistently on both screens, never computed two different ways. Sentence: "[Dimension] remains the main follow-up area."
  2. **Most-improved dimension** — the dimension with the largest positive average-rating change between the first half and second half of the selected date range. If fewer than 2 sessions of approved data exist in range, this sentence is replaced with "Not enough session data yet to identify a trend." Sentence: "[Dimension] is improving across recent sessions."
  3. **Recommended action** — a fixed lookup table, one canned sentence per dimension, keyed to slot 1's dimension:

     | Dimension | Recommended action |
     |---|---|
     | Body | "Incorporate posture and gesture awareness activities into the next lesson." |
     | Emotion | "Add facial-expression practice, such as mirroring exercises, to the next lesson." |
     | Speech | "Review sentence structure and clarity techniques in the next lesson." |
     | Tonality | "Include vocal tone and pitch-control exercises in the next lesson." |
     | Eye Contact | "Include partner-facing eye contact practice in the next lesson." |
     | Vocal Projection | "Add projection exercises, such as speaking to the back of the room, to the next lesson." |
     | Emotional Expression | "Incorporate emotional-expression role-play into the next lesson." |
     | Sentence Flow | "Review pacing and sentence-flow techniques in the next lesson." |
     | Audience Awareness | "Add audience-awareness exercises, such as varying delivery for different listeners, to the next lesson." |

     Sentence: "Recommended next action: [looked-up sentence]."

  This is the literal, exhaustive set for the MVP. No freeform generation, ever — expanding this into AI-authored prose silently pulls the deferred Weekly Class Health Brief (§28.1) into current scope, which stays out per §8.
- **"Approve & Submit" is one user action performing two transitions, confirmed by the orchestrator.** Clicking it triggers a confirmation modal ("Approve and submit [Student]'s report? This will save the final report, notify parent and management, and update the student record." / Approve & Submit / Cancel) — a simple confirm dialog, reusing the same modal visual pattern already established by the future-session-lock modal (centered card, icon, title, description, primary + secondary button). **No dedicated Stitch mockup is needed for this** — build it directly from this description. On confirm, the server performs **both** the `approve` and `publish` transitions (spec §13) in sequence within the same server action — audit events for both, in the same guarded, transactional pattern as every other transition. Critically: **this modal is a UX safeguard against accidental clicks, not a security boundary.** It does not replace the checklist gate — the button that opens it only appears enabled once all three checklist items are checked (§ above), and the server independently re-verifies all three `checklist_*` columns before executing either transition, exactly as already specified. A confirmation dialog with nothing underneath enforcing the checklist would not satisfy this requirement.
- **Visibility rules** (spec §14, §14.1): parents only ever see `report_versions` where `kind = approval_snapshot` and `audience = parent`, for students in their `parent_child_links`. Management only sees approved completion/evidence/statistics — never drafts, never raw ratings, never internal notes.
- **One confirmed parent-view leak, and one confirmed parent-view feature with specific required gating.** (1) **No per-dimension rating grid on the Parent Feedback Report, in any form or wording — this is a caught leak, fix it.** A screen was found showing a "Performance Summary" grid of raw B.E.S.T dimension:rating pairs (e.g. "Eye Contact — Needs Attention") directly to a parent — a clear violation of spec §8's explicit rule for this screen ("No internal trainer notes, raw B.E.S.T ratings, or AI draft history"). The screen's "simplified performance summary" requirement is satisfied by the prose panels (Today's Strength, Next Focus, Practice Suggestion, Session Takeaway) — do not add a second panel that restates the same per-dimension ratings in grid form, even with softened wording; that recreates the same leak. (2) **Per-child evidence video on the Parent Feedback Report is a confirmed feature, not a leak — but only under specific gating, confirmed by the orchestrator.** **(Amendment 001 A-001 ratifies this gated feature and supersedes spec §21's absolute "parents never receive evidence URLs"; the parent evidence workflow and this access are implemented and tested in Phase 2, not Phase 1 — A-002/A-003.)** TA evidence capture is per-individual-child (each student filmed during their own presentation/assessment turn), and `evidence` rows are already scoped to one `student_id` per spec §20, so showing a parent their own child's evidence clip is intentional. It must be gated on all three of: **(a)** the associated report has reached `Submitted` — never show evidence tied to a draft or unapproved report, the same rule that governs every other field on this screen; **(b)** the `evidence_media` consent scope (spec §22) is granted for that student; **(c)** access is via a short-TTL, server-minted signed URL scoped to the requesting parent's `parent_child_link`, same as every other evidence access path. The guarantee that a clip contains only one child is a filming-process assumption, not something the app verifies — flag this to whoever trains TAs on capture, but it isn't a code-level fix.
- **"Follow-up for Next Session" is one field, surfaced on two screens — confirmed by the orchestrator.** The B.E.S.T Form's "Follow-up for Next Session" field and the Review & Approve screen's "Coach Notes (Internal Only)" field are **the same `observations.follow_up_notes` column**, not two separate notes. The Review & Approve screen must load the trainer's current value into that field (not render it blank) so the trainer is editing their earlier note after seeing the AI draft and evidence, not overwriting it unknowingly. Whatever server action saves this field must be callable from both screens against the same column.
- **The "Approve & Submit" button is gated on the Quality Checklist, confirmed by the orchestrator.** All three checklist items (Evidence confirms rating / AI Draft reviewed / Privacy check passed) must be checked before the button is enabled — it should render visually disabled until then, not merely clickable-with-a-warning. This is a real interaction rule that the static Stitch mockups can't demonstrate themselves; build it as described here rather than inferring it from the screen alone. This is the concrete implementation of the "trainer approval checklist and Approve & Submit gate" in spec §8, and backs the guarded `approve` transition in the state machine (spec §13). **The disabled button is a UX convenience only** — the `approve` transition's server-side guard must independently check the three `checklist_*` columns above are all `true` before allowing the transition, per ADR-3. A disabled button with no server-side check is not a real gate.

---

## 7. Working with the Stitch UI screens

The screens in `/docs/ui-screens/` are Google Stitch exports — **visual layer only**. Treat them as:

- **Authoritative for:** layout, visual hierarchy, component composition, copy/microcopy tone, which fields appear on which screen.
- **Not authoritative for:** data shapes, validation rules, state transitions, access control, or anything governance-related. If a Stitch screen implies a field, action, or flow that isn't in the spec (e.g. it shows a control the spec doesn't mention), **flag it to the orchestrator** rather than building it — it may be a Stitch generation artifact rather than an intended feature.
- **Adaptation, not copy-paste:** rebuild each screen as Next.js/React components using the project's data model and server actions, applying the persona §3.5 accessibility standard. Preserve the visual design; do not preserve any hardcoded mock data, inline "business logic," or client-side-only validation from the Stitch export — that logic must move to the server layer per ADR-3.

When starting a new screen, name it and cross-reference it against spec §8 (Screen & Page Inventory) so you know which audience, which data, and which of the governance rules in §14 apply to it.

### 7.1 B.E.S.T Form state variants — apply the pattern, not the content

Three additional reference screens exist for the B.E.S.T Form beyond its default state: a validation state (required fields missing, banner + jump-to-first-missing-field), a loading state (draft generating, spinner + disabled actions), and a failure state (AI generation failed, retry offered, assessment preserved). These map directly to spec behavior — §13's `Incomplete`/`Drafting` states and §15's failure-and-recovery design — and their **visual patterns are correct and should be built**: banner placement/color/icon per state, the button changing to a "Generating…" spinner state, the retry messaging, the required-field highlighting.

However, these three reference screens were captured **before** the form was corrected to the real 9-dimension B.E.S.T framework (spec §3) — they still show the old 6-criteria placeholder content (Eye contact, Body movement, Speech clarity, Structure, Active listening, Confidence). **Do not copy that content.** Build these three states as overlays/variants on top of the already-corrected 9-dimension, quick/full-mode form (see §5), using only the *behavior and visual treatment* from these references — banner style, loading state, retry pattern, required-field indicator style. The specific fields marked "required" in the validation state should follow whatever the current mode (quick = 4 Competency, full = all 9) actually requires, not the old screen's specific field selection.

---

## 8. Explicitly out of scope for the MVP — do not build without sign-off

These appear in the spec (so you'll see them referenced) but are **deferred, post-MVP** (spec §26 build plan is the actual scope; §28 is the roadmap, not the backlog):

- Weekly Class Health Brief (management aggregate AI feature)
- Child Progress Digest (parent aggregate AI feature, mandatory-trainer-approval-gated)
- End-of-term report **generation** (evidence capture is in scope; the generator is not)
- Full relief-teacher handover UI (schema-ready; UI deferred)
- Any form of automated video scoring or autonomous AI assessment (not recommended at all, per spec)

If asked to "add the parent digest" or similar mid-build, treat that as the orchestrator explicitly pulling a roadmap item into scope — confirm which phase it slots into before starting, since it reuses the aggregate-grounding pattern in spec §12.1 and has its own governance rule (§14.1) that must come with it. **(Amendment 001 A-011):** the companion `BEST_Coach_AI_Features_Breakdown_v2.docx` is currently unavailable — **do not fabricate it**; it must be obtained and reviewed before either the Weekly Class Health Brief or the Child Progress Digest is pulled into scope. Its absence does not block MVP Phases 0–4.

---

## 9. Repo structure

Follow spec §18. Server code lives under `/server/modules/*`, one directory per module, each owning its own tables:

```
/app                      → routes & UI (Stitch-derived components)
/server
  /modules
    /identity-access
    /class-session
    /attendance
    /observation
    /report-workflow      → the state machine
    /ai-drafting          → skeleton build, draft job, grounding validation
    /evidence
    /parent-view
    /management-view
    /consent-retention
    /audit
    /notifications
  /db                     → schema + typed client (Prisma or Drizzle)
/docs
  /spec                   → the three source-of-truth documents
  /ui-screens              → Stitch exports
```

**Module boundary rules (spec §18, persona §3.9) — enforce these in every PR-sized change:**
1. A module owns its tables. No other module reads/writes them directly — go through the module's exported service functions.
2. Cross-module communication is via typed function calls or in-process domain events, not direct DB access.
3. Authorization and audit are applied as guards/interceptors, not re-implemented per module.
4. A state transition and its audit event commit in the same DB transaction.

---

## 10. Build order — phase-gated, do not skip ahead

This is the single most important section. **Each phase has an explicit exit condition, including which personas must sign off. Do not start the next phase until the orchestrator has confirmed the current phase's exit condition is met** — even if you believe the code is ready. This mirrors spec §26 exactly; do not reorder or parallelize across phases.

**Before Phase 0 — orchestrator-only setup.** Claude Code cannot perform these (no browser/OAuth access) — the orchestrator completes them before the first session begins:
- Create the Supabase project via the dashboard; confirm the **Singapore** region at creation; record the project URL, anon key, and service role key.
- Obtain the LLM provider API key from the provider's console.
- Populate a local `.env.local` (never committed) with the keys above, and maintain a matching `.env.example` with placeholder values for Claude Code to reference.

**(Amendment 001 A-005):** the MVP is **already a local Git repository** (`main`, scaffold committed) — **GitHub creation, a remote, and cloning are NOT prerequisites for Phase 0.** A remote or push happens only on explicit orchestrator instruction. Any older "create the git repository (e.g. on GitHub) and clone it" wording is superseded.

**Governance documents** (this file, the specification, Amendment 001, the Implementation Plan) are already installed at the §1 paths. **(A-013):** Stitch/UI exports are installed **selectively later, after accepted Phase 0**, not now — their absence does not block Phase 0. **(A-011):** the AI Features Breakdown v2 DOCX is currently unavailable and is **non-blocking** for Phases 0–4.

Start Phase 0 once the Supabase project, the LLM key, and `.env.local` exist — the repository, governance docs, `STATUS.md`, and `BUILD_NOTES.md` are already in place.

### Phase 0 — Foundations
Build: Supabase project (confirm Singapore region), Next.js scaffold with the module structure above and `server-only` boundaries enforced, Supabase Auth wired, schema + migrations for the core tables (including the B.E.S.T enums and `observation_ratings`), the audit module (append-only + hash chain) working end-to-end, and an initial RLS policy skeleton.
**Exit condition:** a logged-in trainer can hit one authorized server action and it produces a verifiable, hash-chained audit row. Nothing else needs to work yet.
**Persona sign-off:** §3.2 (schema/migrations reversible and constrained), §3.1 (RLS skeleton present, secrets not leaked, region confirmed), §3.7 (envs separated, region pinned).

### Phase 1 — Governed vertical slice (the heart of the build)
Build one complete path: Dashboard → Roster (with previous-focus continuity) → B.E.S.T Form (9 dimensions, quick/full mode, rubric anchors surfaced) → Save (validated per mode, future-session lock enforced) → synchronous AI draft through the **full** grounding pipeline → Review & Approve (compare-with-notes via source map, approval snapshot) → Parent-facing approved view **only**. **(Amendment 001 A-002):** the Phase 1 parent-facing view is **text-only** — **no parent evidence-media access in Phase 1**. Phase 1 may define schema/typed interfaces evidence will later need, but must not expose media to parents; TA upload, consent enforcement, scan status, and parent signed-URL access are all Phase 2.
**Exit condition:** (a) a draft whose language contradicts a rating's polarity band is rejected by the system, not merely fixable by the trainer; (b) an approved report's exact content is recoverable from its audit trail by hash; (c) a session's follow-up note appears as the next session's previous focus. Demonstrate all three to the orchestrator before moving on.
**Persona sign-off:** §3.4 (grounding validation proven with a deliberate failure case), §3.3 (guarded transitions + idempotency tested), §3.6 (the three QA tests in §3.6 exist and pass), §3.5 (the built screens meet WCAG 2.2 AA), §3.8 (continuity and failure states match the designed experience, not generic errors).

### Phase 2 — Evidence & TA
TA upload/re-upload, malware/content scan status, signed-URL access (short-TTL, server-minted), evidence-gated approval, consent-gated media upload. This phase owns the **gated parent evidence access** ratified in Amendment 001 A-001 (see §6).
**Exit condition (Amendment 001 A-003 — supersedes the absolute "no evidence URL under any code path"):** demonstrate that **all prohibited paths fail** — unauthorized, unrelated-child, pre-`Submitted`, unconsented, unscanned, expired-URL, direct-storage-path, and public access — **and** that a correctly linked parent can retrieve **only their child's** `Submitted`, consented evidence via a valid short-TTL, server-minted signed URL. Both directions must be demonstrated, not just the refusal.
**Persona sign-off:** §3.1 (signed URLs, no public objects, consent gating), §3.6 (automated tests that (a) fail every prohibited parent-evidence path and (b) succeed only for the linked child's submitted, consented evidence).

### Phase 3 — Management breadth
Management calendar, class overview, class statistics — all built as read projections from approved data.
**Exit condition:** demonstrate there is no code path from any management view to an unapproved draft or internal note.
**Persona sign-off:** §3.1 (RLS/projections re-verified for the new views), §3.9 (module boundaries held as the view layer grew).

### Phase 4 — PDPA hardening & ops
Retention jobs, erasure-request endpoints, data-subject access/correction endpoints, alerting, incident runbook. **(Amendment 001 A-007):** this phase also implements and operationally verifies the **independent, retention-locked external audit mirror** (spec §23) — the Phase 0 database audit + hash chain is the in-app layer; the external mirror is completed here.
**Persona sign-off:** §3.1 (retention/erasure actually enforced, not just schema present), §3.7 (alerting, runbook, and the retention-locked audit mirror in place).

**Do not build Phases 2–4 features early "since we're in the area" while working on Phase 0/1.** The point of the phase gate is that Phase 1's exit condition is the proof the core product claim is true; everything after it is breadth, not depth.

---

## 11. Working practices — testing, git discipline, dependencies, and session continuity

### Testing stack (fixed — don't substitute mid-build)
- **Unit / integration:** Vitest + React Testing Library, for components and server-action-level logic.
- **End-to-end:** Playwright, run against a local dev server seeded with the synthetic data below.
- Every persona §3.6 QA checklist item corresponds to an actual named test file — not a manual click-through you report as "checked."
- **(Amendment 001 A-009):** Vitest, React Testing Library, and Playwright are **pre-approved** by this contract — install them without a separate flag. **Accessibility: use Lighthouse first**; do not add an additional accessibility package (e.g. `axe-core`) unless later justified and approved. Serious/critical accessibility findings must be resolved before a phase is accepted.

### Seed / synthetic data (use this shape everywhere a fixture is needed, unless told otherwise)
- 2 trainers, 1 TA, 2 classes, 3–4 students per class, 2 parent accounts each linked to exactly one child, 1 management account.
- At least one observation with a deliberately mixed rating set (some `Emerging`, some `Advanced`) specifically to exercise the grounding-validation contradiction test in persona §3.4.
- **Never** use real names, photos, or anything resembling actual children — synthetic data only, per ADR-6, even in local development.

### Git discipline
- Commit at coherent checkpoints — one module, one screen, or one passing test suite — not one giant commit per phase and not noisy micro-commits with no context.
- Reference the spec section and/or persona checklist a commit satisfies, e.g. `feat(report-workflow): guarded Approve transition (spec §13, persona §3.3)`.
- Never commit secrets, `.env` values, or any real data.

### Dependency additions
- Any dependency beyond what's implied by the locked stack (§2) — a form library, an animation library, an analytics SDK, anything — gets flagged to the orchestrator in one line before installing, not silently added. Prefer the smallest dependency that solves the problem, or no dependency if the stack already covers it.

### Session continuity — read these first, write these last, every session
Claude Code has no memory of prior sessions beyond this file, the code, and git history. **(Amendment 001 A-008):** maintain **two** permanent documents to close that gap — `docs/progress/STATUS.md` **and** `docs/progress/BUILD_NOTES.md`:
- **At the start of every session**, read `STATUS.md` (current state, accepted checkpoint, blockers, latest commit, next permitted action) and the recent `BUILD_NOTES.md` entries before doing anything else — they are your record of what happened in sessions you don't otherwise remember.
- **At the end of every session** (or at a natural stopping point), update **both**: `STATUS.md` with what is now true (phase, accepted checkpoint, blockers, latest commit, next action); `BUILD_NOTES.md` with a dated chronological entry — scope, files changed, commands run, automated/manual verification, failures and recovery, decisions, and commit.
- Don't rely on git history or code inspection alone to reconstruct status — these two capture *why* a decision was made, not just *what* changed, which a diff can't tell you.
- The workspace migration tracker is **temporary** and is archived after migration closure; `STATUS.md` and `BUILD_NOTES.md` are the permanent continuity record.

---

## 12. When to stop and ask the orchestrator

Proceed autonomously on implementation details (component structure, exact query shape, naming within the conventions above). **Stop and ask** when:

- A Stitch screen implies behaviour the spec doesn't cover.
- You're tempted to simplify, stub, or defer any of the four §4 non-negotiables, for any reason, even temporarily.
- A phase's exit condition (§10) seems met and you're about to start the next phase.
- A persona checklist item in §3 can't be satisfied without a design decision you're not sure is yours to make.
- Something in the spec's §3.6 "pending client ratification" items needs to be treated as final rather than provisional.
- A request would pull a §8 deferred feature into current scope.
- Code and spec disagree and reconciling them isn't obviously safe.
- You're about to add a dependency not implied by the locked stack (§2).
- It's the start of a new session and `STATUS.md` or `BUILD_NOTES.md` is missing, stale, or doesn't match what you find in the repo — reconcile before proceeding.

When in doubt, a short question to the orchestrator costs little; a governance mechanism — or a professional standard — built quietly wrong costs a rebuild.

---

## 13. Demo-to-MVP migration rule — the frozen demo is reference-only

A throwaway trainer-flow **demo** was built and frozen locally before this MVP (frozen at its Step-14 baseline, tagged `demo-freeze-step14-2026-07-21`). It exists only as a **visual and interaction reference**. This MVP is a **separate repository** and shares no code with it.

- **Never import demo architecture into the MVP:** its React Context / in-memory state, hardcoded users/classes/students/schedules/reports, cosmetic login (any-input-succeeds), its demo AI route, forced-failure controls, or browser object-URL "persistence." None of these satisfy the ADRs, RLS, grounding, audit, or state-machine requirements above.
- **Demo visual assets are not free to copy.** Any Stitch/reference export or component may be reused only after an explicit disposition — `PORT`, `REFERENCE ONLY`, `REBUILD`, `REJECT`, or `NOT APPLICABLE` — recorded by the orchestrator (Amendment 001 A-013). Until then, treat the demo as read-only reference, not a source directory.
- **Rebuild, don't lift:** presentation and proven interaction patterns may inspire the MVP build; data flow, persistence, auth, authorization, workflow, AI governance, evidence handling, and audit are always built fresh against this contract and the specification.
- The demo's own `AGENTS.md`, `DEMO_BUILD_PLAN.md`, and `progress_tracking.md` are **migration provenance only** and never govern the MVP.
