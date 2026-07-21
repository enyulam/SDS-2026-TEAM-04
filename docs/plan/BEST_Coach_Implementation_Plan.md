# B.E.S.T Coach — Implementation Plan (Orchestrator's Script)

**Companion to:** `CLAUDE.md` (the agent's standing contract), the Complete MVP Specification (v3), and its ratified **Amendment 001** (`docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_001.md`)
**Audience:** you, as orchestrator and reviewer, working with Claude Code in VS Code
**Purpose:** a start-to-end script for driving the build, with concrete tasks, verification steps, and review checklists at every stage — not just a restatement of the phases in `CLAUDE.md`.

> **Authority (Amendment 001 A-012).** This plan is **procedural** — it may add Phase 5 (final integration/UAT/quality) and review detail, but it **cannot override** the specification or a ratified amendment. Where this plan and v3-as-amended disagree, **v3-as-amended governs**. Several passages below were reconciled to Amendment 001; each is marked inline.

---

## How to use this document

`CLAUDE.md` tells Claude Code the rules. This document tells **you** what to do at each stage: what to prepare, what to ask for, what to personally check before signing off a phase, and what "done" concretely means. Read a phase's section here before opening that phase's session in Claude Code, and use its review checklist as your literal sign-off script when the agent reports a phase complete.

Sizing note: instead of calendar estimates (which would be false precision this early), each phase is sized in **focused Claude Code sessions** — a rough planning signal, not a schedule commitment. A "session" here means one sustained working block with a clear goal, not a calendar day.

---

## What "fully functional and 100% tested" means in practice

No non-trivial software is provably bug-free. What this plan builds toward instead is a precise, checkable definition of done:

1. Every phase's exit condition (below and in `CLAUDE.md` §10) is **demonstrated**, not just claimed.
2. Every persona checklist item in `CLAUDE.md` §3 has a **named, passing automated test** behind it where the checklist calls for one.
3. A full **manual UAT script**, one per role (trainer, TA, parent, management), is walked end-to-end without a governance violation.
4. An **accessibility audit tool** runs clean against every screen — **Lighthouse is the initial approach (Amendment 001 A-009)**; do not add `axe-core` or another accessibility package unless later justified and approved.
5. A **security review pass** (checklist in Phase 5 below) is completed and signed off.

That combination — automated proof plus structured manual verification plus a named quality-tool pass — is what "fully working" operationally means for this project. Treat any phase reported "done" without evidence against these four as not actually done.

---

## Phase −1 — Orchestrator-only setup (before Claude Code opens)

Nothing here is Claude Code's job — it cannot complete OAuth flows or hold API keys until you give them to it.

**Checklist:**
- [ ] Create the Supabase project via the dashboard. **Confirm the Singapore region at creation** — this cannot be changed later without a migration.
- [ ] Record: Supabase project URL, anon key, service role key.
- [ ] Obtain the LLM provider API key.
- [ ] **(Amendment 001 A-005) — Git is already done, locally.** The MVP is already a **local** Git repository (`main`, scaffold committed); **GitHub, a remote, and cloning are NOT prerequisites for Phase 0.** A remote/push happens only on your explicit instruction later. (The older "create the git repository (GitHub or equivalent); clone it" step is superseded.)
- [ ] **Governance documents are already installed** (Step 5B) at the paths in `CLAUDE.md` §1: root `CLAUDE.md`, `docs/spec/BEST_Coach_Complete_MVP_Specification_v3.md`, `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_001.md`, `docs/plan/BEST_Coach_Implementation_Plan.md`, `docs/progress/STATUS.md`, `docs/progress/BUILD_NOTES.md`.
- [ ] **(A-011)** `BEST_Coach_AI_Features_Breakdown_v2.docx` is **currently unavailable and non-blocking** for Phases 0–4 — do not fabricate it; obtain it only before scoping a deferred aggregate AI feature.
- [ ] **(A-013)** Stitch UI exports are installed **selectively later, after accepted Phase 0** (one subfolder per screen, named to match spec §8), not at setup — they are **not** a Phase 0 prerequisite.
- [ ] Create `.env.local` (git-ignored) with your real keys; create a matching `.env.example` with placeholder values for Claude Code to reference.
- [ ] **(A-006) Toolchain is ratified:** Node.js **24 LTS** (`.nvmrc` `24`, engines `>=24 <25`), **npm** (`npm@11.13.0`). This supersedes the older "Node 20 LTS, npm or pnpm" recommendation.

**Exit condition:** the Supabase project (Singapore) exists with keys recorded, the LLM key is obtained, and `.env.local` is populated. The repository, governance docs, `STATUS.md`, and `BUILD_NOTES.md` are already in place. Only then start Phase 0.

---

## Phase 0 — Foundations

**Sessions (rough):** 2–4.

**What you ask Claude Code to do:**
1. Read `CLAUDE.md` fully, then the spec fully, then **Amendment 001**, then this Implementation Plan. (The AI Features Breakdown is **currently unavailable and non-blocking** — A-011; Stitch exports are **installed later, after accepted Phase 0** — A-013, so for Phase 0 use the **spec §8 Screen & Page Inventory** as the screen list.) Confirm back to you in its own words what the core governance rule is, before writing any code — this is a cheap way to catch a misread early.
2. Scaffold the Next.js (App Router) project with the `/server/modules/*` structure from `CLAUDE.md` §9.
3. Install and configure Supabase client libraries; connect to your Singapore project using the `.env.local` values.
4. Write the initial schema migration: core tables from spec §20 — `users`, `trainer_class_assignments`, `parent_child_links`, `centres`, `management_centre_assignments`, `classes` (with `centre_id`), `class_sessions`, `students`, `attendance`, `observations`, `observation_ratings` (with the B.E.S.T enums), `reports`, `report_versions`, `audit_events`, plus the PDPA-relevant tables (`consent_records`, `retention_policies`, `erasure_requests`) even though their logic isn't built yet.
5. Implement the audit module: append-only grant (`INSERT`-only, `UPDATE`/`DELETE` revoked at the DB level), hash-chaining logic (`entry_hash = hash(prev_hash + payload)`).
6. Wire Supabase Auth; scaffold a minimal login flow for at least the trainer role.
7. Write an initial RLS policy for one table (e.g. `reports`, scoped to trainer-class assignment) as a proof of the pattern — full RLS coverage comes in Phase 1, but Phase 0 proves the mechanism works at all.
8. Set up the testing stack: Vitest + React Testing Library, Playwright (**pre-approved by Amendment 001 A-009 — install without a separate flag**), and write the seed script producing the synthetic dataset from `CLAUDE.md` §11.
9. Maintain the permanent continuity documents `docs/progress/STATUS.md` **and** `docs/progress/BUILD_NOTES.md` (both already created at Step 5B) — update `STATUS.md` to reflect Phase 0 state and add a dated `BUILD_NOTES.md` entry for the Phase 0 work (Amendment 001 A-008).

**Your review checklist before signing off Phase 0:**
- [ ] Log in as the seeded trainer account and hit one real authorized server action (not a stub).
- [ ] Query `audit_events` directly (via Supabase's SQL editor) and confirm a row was written with a non-null `entry_hash`, and that `prev_hash` correctly chains to the prior row (or is the genesis value for the first row).
- [ ] Attempt `UPDATE` or `DELETE` on `audit_events` as the **application/restricted database role** (or via a controlled `SET ROLE`/equivalent restricted session), **not** the Supabase admin/service role — confirm it is **rejected** by a database permission error. **(Amendment 001 A-010):** a check run only as the privileged SQL-editor identity does not prove application-role denial; back this with a restricted-role automated integration test, not just a manual SQL-editor attempt.
- [ ] Confirm the Supabase project region is Singapore (check the dashboard, don't just trust the setup step happened).
- [ ] Confirm `.env.local` is git-ignored and no key appears in any committed file (`git log -p` or a secret-scan tool).
- [ ] Read `STATUS.md` — does it accurately describe what you just watched happen?

**Exit condition (from `CLAUDE.md` §10):** a logged-in trainer can hit one authorized server action and it produces a verifiable, hash-chained audit row.

---

## Phase 1 — Governed vertical slice (the heart of the build)

**Sessions (rough):** 6–10. This is the largest and most important phase — do not rush it to "get to the UI."

**What you ask Claude Code to do, in this order (each sub-step should be its own session or clear sub-goal, not one giant push):**

1. **Data capture path:** Dashboard → Roster (with previous-focus continuity from a prior session's follow-up note) → B.E.S.T Form, all 9 dimensions modeled correctly (quick mode = 4 Competency; full mode = all 9), rubric anchors surfaced in the UI per dimension. Adapt the corresponding Stitch screens per `CLAUDE.md` §7 — visual fidelity from Stitch, data/validation logic from the spec.
2. **Validation & save:** required-field validation per mode, future-session lock, the observation persists with a `version` column for optimistic concurrency. Build all three of the form's interaction states, not just the happy path: the validation-error state (missing fields highlighted, jump to first missing field, AI call blocked), the loading state (draft generating, actions disabled), and the failure/retry state (generation failed, assessment preserved, retry offered) — per `CLAUDE.md` §7.1 and spec §13/§15. Apply these patterns to the corrected 9-dimension form; do not reference the old 6-criteria layout shown in the legacy state screenshots.
3. **The rubric-anchored skeleton:** the deterministic, AI-free structure described in spec §12/§24 — every dimension carries its rating, rubric anchor text, and polarity band before anything is sent to the LLM.
4. **AI drafting, synchronous:** the server action that calls the LLM with the bounded skeleton, including the idempotency key.
5. **Grounding validation:** the check that rejects/regenerates a draft whose language contradicts a dimension's polarity band, references an unselected chip, or introduces unsupported facts.
6. **Report state machine:** all seven states, each transition guarded (compare-and-set + transaction), audit write in the same transaction as the state change.
7. **Review & Approve screen, plus its Edit Report sub-screen:** compare-with-notes via the source map, the approval checklist, the approval snapshot with content hash. "Coach Notes (Internal Only)" on Review & Approve is the same `follow_up_notes` field as the B.E.S.T Form's "Follow-up for Next Session" — load the trainer's existing value here (don't render blank), and save through the same server action used on the form (`CLAUDE.md` §6). The "Approve & Submit" button stays visually disabled until all three Quality Checklist items are checked, **and** the `approve` server action independently re-checks all three before allowing the transition — the disabled button alone is not the gate. Clicking it opens a simple confirmation modal (no dedicated Stitch mockup needed — reuse the existing modal pattern from the future-session-lock screen); on confirm, the server performs both the `approve` and `publish` transitions in one action (`CLAUDE.md` §6). Edit Report's "Save Changes & Finalize" saves the edit and returns to Review & Approve **without** approving; it must also reset all three checklist columns to `false` so a prior review can't silently certify post-edit content.
8. **Parent-facing view:** built as a strict read projection — only `approval_snapshot` versions, only for linked children, via RLS. Per `CLAUDE.md` §6: **no per-dimension rating grid** anywhere on the Parent Feedback Report (the prose panels already satisfy "simplified performance summary" — don't add a second panel restating ratings in grid form). **(Amendment 001 A-002): Phase 1 is text-only — no parent evidence-media access here.** The per-child evidence video is a confirmed *Phase 2* feature; Phase 1 may define the schema/typed interfaces it will need, but must not expose media to a parent. Actual gated parent evidence access (report `Submitted` + `evidence_media` consent + short-TTL signed URL scoped to the `parent_child_link`) is built and tested in Phase 2 (A-001/A-003).
9. **Full RLS coverage** for every table introduced this phase, not just the one from Phase 0.
10. Write the QA tests named in `CLAUDE.md` §3.6 as actual test files, not manual checks.

**Your review checklist before signing off Phase 1 — this is the most important checklist in the whole plan:**
- [ ] **The core proof:** ask Claude Code to force a contradictory scenario — rate a dimension `Emerging` and inspect (or instrument) the AI's raw draft attempt to confirm grounding validation actually catches and rejects/regenerates a positively-worded description of it. Watch this happen; don't accept "it should work."
- [ ] **Audit recoverability:** approve a report, then independently pull the `report_versions` row referenced by that approval's `content_hash` and confirm the hash actually matches the stored content byte-for-byte.
- [ ] **Continuity:** add a follow-up note on one session, start the next session for the same student, and confirm it appears as "previous focus" without manual re-entry.
- [ ] **Concurrency:** with two browser sessions (or a script), attempt to approve the same report twice in quick succession, or edit-then-approve using a stale version — confirm the guarded transition rejects the stale one rather than silently overwriting.
- [ ] **Parent isolation (the highest-stakes check in the app):** log in as parent A, attempt to access parent B's child's report by manipulating the URL/ID directly — confirm it is refused at the database (RLS) level, not merely hidden in the UI.
- [ ] **Parent view content checks (Amendment 001 A-002 — Phase 1 is text-only):** on a parent's own, correctly-approved report, confirm there is no per-dimension rating grid anywhere on the page, **and** confirm that **no evidence media is reachable by a parent in Phase 1 at all** (drafts, internal notes, raw ratings, and AI history also absent). The gated parent-evidence access checks (permitted for the linked child's `Submitted`, consented clip via short-TTL signed URL; refused for every prohibited path) belong to the **Phase 2** review checklist, not here.
- [ ] **Idempotency:** submit the same draft-generation request twice (double-click, or replay) and confirm only one `report_version` results.
- [ ] **The three form states:** trigger each of the B.E.S.T Form's non-happy-path states on the corrected 9-dimension form — submit with required fields missing (confirm the banner, the jump-to-first-missing-field, and that the AI call is blocked), watch the loading state during a real draft generation, and force a generation failure (e.g. a bad API key temporarily) to confirm the assessment is preserved and retry works. Confirm none of these regress to the old 6-criteria layout.
- [ ] **The approval gate is real, not just visual:** with all three Quality Checklist items unchecked, confirm the button is disabled — then, bypassing the UI (direct API call or browser dev tools), attempt to call the `approve` action anyway with the checklist columns still `false`. Confirm the server rejects it, **including when called directly and skipping the confirmation modal entirely** — the modal is a UX safeguard, not the enforcement point.
- [ ] **Editing resets the checklist:** check all three Quality Checklist items, open Edit Report, change any text, and Save Changes & Finalize back to Review & Approve. Confirm all three checklist items are now unchecked again and Approve & Submit is disabled — a prior review must not silently carry over to edited content.
- [ ] Run the automated test suite; all Phase 1 tests pass.
- [ ] Run an accessibility scan (**Lighthouse first, per Amendment 001 A-009**) against the built screens; fix anything at "serious" or "critical" severity before moving on.
- [ ] Read `STATUS.md` for accuracy.

**Exit condition:** the three items named in `CLAUDE.md` §10 (contradiction rejected, approval recoverable by hash, continuity threads through) all demonstrated live, not just asserted.

---

## Phase 2 — Evidence & TA

**Sessions (rough):** 2–3.

**What you ask Claude Code to do:** TA upload/re-upload flow, a malware/content scan step (or a stub with a clearly logged TODO flagged to you — evidence scanning may depend on a third-party service you need to choose), signed-URL generation (short TTL, server-minted only), evidence-gated approval (trainer can mark evidence "not required"), consent-gated upload tied to `consent_records`.

This phase also implements the **gated parent evidence access** ratified in Amendment 001 A-001 (the confirmed per-child evidence video on the Parent Feedback Report), first exposed to parents here — not in Phase 1.

**Your review checklist:**
- [ ] **Prohibited paths all fail (A-003):** as a parent account, attempt to fetch an evidence file's storage path directly (bypassing the UI), another child's evidence, a pre-`Submitted` report's evidence, unconsented evidence, and an expired/tampered signed URL — confirm **each is refused**; no public/direct-bucket access works.
- [ ] **Permitted path works, narrowly (A-001):** confirm a correctly linked parent **can** retrieve **only their own child's** `Submitted`, `evidence_media`-consented clip via a short-TTL, server-minted signed URL scoped to that `parent_child_link` — and only briefly.
- [ ] Confirm an upload without a corresponding `consent_records` entry is blocked.
- [ ] Confirm the evidence-status flag correctly gates the Approve action per spec §12.4/§15.

**Exit condition (Amendment 001 A-003 — supersedes the absolute "a parent can never reach an evidence URL"):** demonstrated, not assumed — **every prohibited path fails** (unauthorized, unrelated-child, pre-`Submitted`, unconsented, unscanned, expired-URL, direct-storage, public) **and** the linked parent can retrieve only their child's submitted, consented evidence through a valid short-TTL signed URL. Both directions demonstrated.

---

## Phase 3 — Management breadth

**Sessions (rough):** 2–4.

**What you ask Claude Code to do:** Management Calendar, Class Overview, Class Statistics — each built as a read projection strictly over approved data (`observation_ratings` aggregates, approved `report_versions` only), and strictly scoped to the management account's assigned centre via `management_centre_assignments` (`CLAUDE.md` §2 ADR-7, §6) — no cross-branch visibility anywhere, no HQ tier. Per-row action buttons on **both** Class Overview's Student Report Status table **and** Class Statistics' Students Needing Follow-up table must check that student's report status before deciding what they show — only `Submitted` rows link to actual report content; `Pending Review`/`Draft Ready` rows show "Send Reminder to Trainer"; **`No Report` rows show no action button at all** (or a plain "—") — never draft content, and never a reminder action where nothing was ever started. There is no page-level "Quick Actions" panel on Class Overview, and no Classcard concept anywhere in this project (mocked or real) — do not build either. Class Overview's "Class Health Summary" and Class Statistics' "Management Insight" both implement their **exact fixed templates in `CLAUDE.md` §6** — no LLM, no freeform generation, no additional conditions; neither is the deferred Weekly Class Health Brief (`CLAUDE.md` §6, §12.1, §28.1).

**Your review checklist:**
- [ ] From the management UI, try every navigation path you can find and confirm none reaches a draft, an internal note, or a raw rating outside an approved report.
- [ ] **Centre isolation:** log in as a management account assigned to Centre A, attempt to access a Centre B class/report/statistic by manipulating the URL/ID directly. Confirm it is refused at the database (RLS) level, not merely hidden in the UI — same rigor as the parent-isolation check in Phase 1.
- [ ] **Row-level status gating on Class Overview:** with a class that has at least one `Pending Review` or `Draft Ready` student report, click that specific row's action button as a management user. Confirm it does **not** show the draft text or any internal note — only status information. Then click an `Approved`/`Submitted` row's button and confirm it correctly shows the full approved content. Finally, confirm a `No Report` row shows no action button (or a plain "—"), not "Send Reminder to Trainer." Same table, same-looking buttons — the difference must come from the status check, not the UI alone.
- [ ] **Class Health Summary's four conditions:** using seeded/adjustable test data, exercise all four rows of the table in `CLAUDE.md` §6 (pending+missing, pending only, missing only, all clear) and confirm each produces the exact `Status` and exact `Recommended Management Action` wording specified — not a paraphrase, not an LLM-generated variant.
- [ ] **Management Insight's three slots:** confirm slot 1 (main follow-up area) matches the exact same value shown in that same class's Class Health Summary — they must never disagree. Confirm slot 2 correctly falls back to "Not enough session data yet to identify a trend" with fewer than 2 sessions of approved data. Confirm slot 3's recommended action matches the exact lookup-table wording for whichever dimension slot 1 names, not a generated variant.
- [ ] **Generalized status gating on Class Statistics:** repeat the row-level status gating test (above) on Class Statistics' "Students Needing Follow-up" table — confirm a `Pending Review`/`Draft Ready` row shows "Send Reminder to Trainer" and never draft content, and a `No Report` row shows no button.
- [ ] Confirm module boundaries held — spot-check that the management-view module isn't reaching into another module's tables directly (per `CLAUDE.md` §9 rule 1).

**Exit condition:** no code path from any management view to unapproved content.

---

## Phase 4 — PDPA hardening & ops

**Sessions (rough):** 2–3.

**What you ask Claude Code to do:** retention jobs (scheduled purge per `retention_policies`), erasure-request endpoints, data-subject access/correction endpoints, basic alerting on job failures, a first-draft incident runbook, and — **(Amendment 001 A-007)** — the **independent, retention-locked external audit mirror** (spec §23). Phase 0 built the in-app append-only audit table + hash chain; the external mirror and its operational verification are completed here, not claimed in Phase 0.

**Your review checklist:**
- [ ] Trigger a test erasure request end-to-end and confirm the referenced data is actually removed or anonymized, not just flagged.
- [ ] Confirm retention jobs run on a schedule in a non-production environment without manual triggering.

---

## Phase 5 — Final integration, UAT, and quality passes (not in `CLAUDE.md`'s phase list — this is your wrap-up phase before considering the MVP "done")

**Sessions (rough):** 3–5, plus your own manual UAT time (budget this separately — it's you clicking through the app, not Claude Code coding).

This phase is deliberately yours to drive, with Claude Code fixing what you find rather than building new features.

### 5.1 Full regression pass
Run the entire automated test suite (unit, integration, e2e) from a clean checkout. Every test must pass; investigate and fix any flake rather than re-running until green.

### 5.2 Manual UAT script — one full walkthrough per role
Write out and literally follow a script for each role, start to finish, using the seeded synthetic data:
- **Trainer:** log in → prepare a class → start a session → complete a full-mode B.E.S.T observation → generate a draft → edit it → approve it → confirm it appears correctly to the linked parent account.
- **TA:** log in → upload evidence for an assigned class → confirm you cannot approve anything or edit report text.
- **Parent (Amendment 001 A-004):** log in → view the calendar → open an approved report → confirm **no draft, internal note, raw rating grid, or AI history** is reachable; confirm the **permitted** case works — the linked child's own `Submitted`, `evidence_media`-consented evidence opens via a short-TTL signed URL; and confirm **all prohibited** evidence paths fail — another child's clip, a pre-`Submitted` report's evidence, unconsented evidence, a direct storage path, and an expired/tampered URL.
- **Management:** log in → view the calendar → drill into a class overview → view statistics → confirm no unapproved content is reachable anywhere.

### 5.3 Accessibility audit
Run **Lighthouse accessibility scoring (the initial approach per Amendment 001 A-009; do not add `axe-core` unless later approved)** against every screen in the Screen & Page Inventory (spec §8). Fix anything flagged serious or critical. Spot-check keyboard-only navigation through the B.E.S.T form and the Review & Approve screen specifically — these have the most complex interactive elements (chip selectors, the approval checklist).

### 5.4 Security review pass
- [ ] Re-verify every RLS policy against the role/data-access table in spec §14 — one row at a time, confirm the policy matches.
- [ ] Confirm no secret or key appears in the client-side JS bundle (inspect the built output, not just the source).
- [ ] Confirm all evidence storage is private with no publicly-listable bucket.
- [ ] Run a dependency audit (`npm audit` or equivalent) and address anything high/critical.

### 5.5 Performance sanity check
Basic check only for an MVP — confirm the AI drafting call has a visible loading state and a reasonable timeout/error path (per spec's failure-and-recovery design, §15), and that the dashboard/roster views load acceptably with the seeded dataset size.

### 5.6 STATUS.md and BUILD_NOTES.md final review
Confirm both permanent continuity documents are accurate (Amendment 001 A-008): `docs/progress/STATUS.md` reflects the final phase/state, and `docs/progress/BUILD_NOTES.md` captures the full chronological build history — together they become the handoff record if anyone else picks up the project later.

**Exit condition for the whole MVP:** every checklist item above is checked, every automated test passes from a clean checkout, and you have personally walked all four UAT scripts without finding a governance violation.

---

## Deployment checklist (staging → production)

- [ ] Separate Supabase projects for staging and production (never share one project across environments).
- [ ] Production environment variables set via your hosting provider's secret management, never committed.
- [ ] Confirm production project region is Singapore.
- [ ] Run the full Phase 5 checklist again against staging before promoting to production.
- [ ] Only load real student/parent data after Phase 4's PDPA mechanisms are confirmed working in production — not before.

---

## What comes after this plan (explicitly not part of it)

Per spec §28 and `CLAUDE.md` §8, the following are roadmap items, not part of this implementation plan, and should only be started on your explicit instruction:
- Weekly Class Health Brief (management aggregate AI feature)
- Child Progress Digest (parent aggregate AI feature, mandatory-approval-gated)
- End-of-term report generation
- Full relief-teacher handover UI

When you're ready to scope any of these in, treat it as a new mini version of this same plan — its own phase, its own review checklist, its own exit condition — rather than folding it into an existing phase's scope.

One more, not in the list above because it isn't scoped as a roadmap item, just noted: if iSpeak ever wants an HQ/corporate tier with visibility across branches (ADR-7 in `CLAUDE.md` §2 explicitly rejected this for the current MVP), it's additive — a new role and RLS policy granted visibility across multiple centres — not a redesign of the branch-scoped access already built.
