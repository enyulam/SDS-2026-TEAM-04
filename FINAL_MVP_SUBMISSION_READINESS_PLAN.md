# B.E.S.T Coach — Final MVP Submission Readiness Plan

**Created:** 2026-08-07 (Asia/Singapore), at the post-sprint Final MVP Submission Readiness Audit.
**Baseline:** main HEAD `139d753`, working tree **clean**, 121 commits, 200 tracked files, **no git remote**.
**Accepted:** Run C3-C G-6 **PASS** (16/16 conditions) · Run C4 governed lifecycle **PASS** (29 PASS / 0 FAIL / 0 NOT-RUN) · 48-hour physical-test sprint **formally accepted** · no unresolved Critical/High sprint findings.
**Status:** Planning instrument. **Authorizes nothing.** No application code, database object, hosted environment, external provider, GitHub remote or GCP resource was created or modified to produce it.

**Companion documents:** `UI_REFERENCE_FINAL_MVP/FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md` · `UI_REFERENCE_FINAL_MVP/UI_REFERENCE_CLEANUP_MANIFEST.md`

> ⚠️ **CURRENCY NOTICE — added 2026-08-08 (`CLAUDE.md` §15.1).** *"Authorizes nothing"* above scopes this document's **authority**; this notice scopes its **currency**. **§0 and §1 are a point-in-time snapshot dated 2026-08-07 and are NOT the project's current status.** Two of their statements are already false: the working tree is **no longer clean** (**seven** modified `.md` files, dirty by design — the authoritative enumeration is the "Working tree" row of `docs/progress/STATUS.md`, not this notice), and the local Docker stack described as *"running / operational"* is **not currently running**. **The canonical CURRENT STATUS is `SDS Project Final (BEST Coach)/docs/progress/STATUS.md`**; the Final MVP baseline is `FINAL_MVP_AUTHORITY_LOCK.md`. The analysis, dependency ordering and findings below remain valid as analysis — **verify any state claim against the repository before acting on it** (§15.3). No content below was edited.
>
> ### ⚠️ CURRENCY NOTICE EXTENDED — 2026-08-08 (Phase A2, S-36…S-41)
>
> **The original notice scoped itself to §0 and §1 only. It is hereby extended to §5, §6, §7.0 and §10, which carried no scope marker and read as live planning.** Specifically superseded:
> - **§0.1's premise that no submission brief exists in this workspace is FALSIFIED.** Both canonical PDFs were ingested 2026-08-07 and live at `FINAL_SUBMISSION_BRIEF/` — `Complete_Project_and_Module_Brief.pdf` and `Project_Final_Deliverables.pdf`, the latter (4 Aug 2026) governing submission content. The §7–§9 provenance disclaimer *"sourced from the audit instruction, not from a verified brief"* is likewise superseded. *(§0.1's cited line `CLAUDE.md:98` has also moved to `:117` and is now struck there.)*
> - **§6 in full** — see its own banner. GCP is superseded; **Vercel + hosted Supabase** is ratified; the teaching-team discussion is **CLOSED** by operator confirmation.
> - **The dead gates SA-1 and SA-3, and the A-014 open-conflict row** — all ruled.
> - **P4 (management bootstrap)** — **the MODEL is locked** (Authority Lock §5, twelve points); only the *mechanism* is open, and it is deferred to Phase B under operator ruling Q-5. It remains a genuine hosted blocker, but it is no longer an undecided model.
>
> ### 🔴 SUPERSESSION EXTENDED BEYOND §6 — 2026-08-08 (added after adversarial review)
>
> The §6 banner self-scopes to *"everything below **in this section**"*. **That was too narrow — GCP instructions survive OUTSIDE §6 and are hereby superseded too:**
> - **acceptance gate `G-SG`'s *"GCP region must be `asia-southeast1`"*** — data residency (Singapore) survives; the **GCP** binding does not. Vercel (Singapore) + hosted Supabase (Singapore) satisfies it.
> - ***"GCP Secret Manager is the natural fit given §6"*** — §6 is superseded; secret management survives as a requirement (Authority Lock §24), the product does not.
> - **readiness-matrix row 9, *"GCP deployment"*** — read as **"Vercel deployment"**.
> - **dependency node *"D4. Secrets + GCP"*** and **execution-order *"Phase F — GCP deployment"*** — read as Vercel + hosted Supabase.
>
> **Two factual claims in this document were falsified by later events and must not be cited:**
> - *"a workspace-wide grep confirms `GCP` and `Google Cloud` appear zero times in `CLAUDE.md`"* — **false**: `CLAUDE.md` contains *"any GCP action"* (a prohibition, correctly).
> - *"a workspace-wide grep for 'PeakPalate' returns zero textual references"* — **false**: there are now ~24 across 8 governance documents. PeakPalate is ruled **`FOREIGN_REFERENCE_RETAINED_BY_OPERATOR`, `KEEP_IN_PLACE`** (OR-PA2-1) — **do not treat it as a deliverable, and do not treat it as unresolved contamination.**
>
> Nothing below was deleted; the analysis is preserved as written.

---

## 0. Five findings that shape everything below

### 0.1 🔴 CRITICAL — No submission brief exists in this workspace

Two independent audits searched the entire workspace — root, `governance-source/`, the frozen demo, `UI_REFERENCE_FINAL_MVP/`, `worktrees/`, the repo's `docs/`, `CLAUDE.md`, the migration tracker — for a module brief, rubric or deliverables list. Both found **nothing**.

- **Zero PDF, DOCX or PPTX files exist anywhere in the workspace.**
- **Zero occurrences anywhere** of `Google Site`, `GitHub Classroom`, `2-minute video`, `grade weighting`, `submission brief`, `assignment brief`, `module brief`.
- (For precision: `submission`, `rubric`, `deliverable` and `marker` *do* occur — but exclusively in their engineering senses, e.g. spec §3.3's "rubric anchors" and the lifecycle's "submission role". None occurs in an academic-submission sense.)
- The nearest instruments are **internal, self-authored governance documents** that govern the *build*, not the *submission*.

**Consequence: every submission requirement in §7–§9 is sourced from the audit instruction, not from a verified brief.** Scope, weighting, format and deadline are unverified — including whether the video is two minutes, what the Google Site must contain, and which GitHub Classroom assignment to accept. **Obtaining the brief is the single highest-value action available and should precede all Track C work.**

The one internal statement resembling an academic gate is **A-024** (Amendment 002): a 13-step sequence ending *"13. Full three-flow integration and UAT"*, with UAT scope **Management, Trainer and Parent** and **TA removed** as a required MVP UAT flow.

### 0.2 🔴 CRITICAL — No human usability testing exists, and the vocabulary actively obscures that

Workspace-wide greps for `System Usability Scale`, `SUS score`, `think-aloud`, `usability test`, `heuristic evaluation`, `participant recruitment`, `user study`, `focus group` return **zero hits**. The word "usability" appears six times, every one referring to visual rendering or automated DOM assertions.

**The project's own plan names "Participant testing begins" as step 15 of 15. The sprint reached step 13.**

**Integrity hazard, and it is serious.** The codebase and every ledger use `real_participant_adapter`, `RealParticipantPhysicalTestPort`, "participant eligible: yes", "the participant walkthrough", "physical test", "three-role walkthrough" and "human-equivalent usability judgement". **Every one of these refers to a software adapter or an agent-driven script — not to a human being.** `c4-diagnostics.json` literally renders `"Adapter: real_participant_adapter · Participant eligible: yes"`. A marker reading that will reasonably infer human subjects were involved. **They were not.** "Physical test" is a *realness* criterion (real auth, real persistence, real RPCs, real audit, real AI) — not a human-subjects one.

This must be resolved two ways: produce real usability testing (§8.2), and purge the misleading vocabulary from anything submitted (§8.3). **Neither is optional, and the second is a research-integrity matter, not a style preference.**

### 0.3 🔴 CRITICAL — The AI draft-storage path cannot run on hosted Supabase as built

`report_store_draft` (RPC-4) holds **zero client EXECUTE, permanently and by design** (R-27). Granting it would create exactly the grounding-bypass surface `CLAUDE.md` §4 non-negotiable 1 forbids — the function writes report content from four arbitrary text fields. Neither API client can reach it: the request client is `authenticated`, and `service_role` holds zero EXECUTE by standing rule.

The only path is **`docker exec` into the local container `supabase_db_best-coach-mvp` as `postgres`**, authenticating by container-local trust. `server/modules/ai-drafting/trusted-store.ts` states its own boundary: *"This is a LOCAL-STACK channel for the physical-test slice; a deployed environment would replace the transport (e.g. a dedicated definer chain), never the posture."*

**On hosted Supabase there is no container to exec into.** This is architectural, not configurational; it is **governance-sensitive** (the replacement must preserve R-27 without granting client EXECUTE); and it **gates the entire hosted-deployment chain**. It must be designed and authorized before any deployment work begins. See §5.3 and Phase D.

### 0.4 🔴 CRITICAL — Five spec-designated tables do not exist, and two governance clauses contradict each other about it

`CLAUDE.md:98` (persona §3.1) states: *"PDPA-relevant tables (`consent_records`, `retention_policies`, `erasure_requests`) **exist from the Phase 0 schema** even though their enforcement logic isn't built until Phase 4."*

**They do not exist.** A grep across all 12 migrations returns zero definitions for any of them. Two further spec tables are also absent:

| Table | Spec marking | In migrations |
|---|---|---|
| `consent_records` | **[KEY]** — "PDPA consent as first-class data" | **absent** |
| `retention_policies` / `erasure_requests` | **[KEY]** — "PDPA retention + erasure" | **absent** |
| `ai_jobs` | **[KEY]** — "Makes retries safe"; ADR-5 requires keeping the idempotency key, and spec §20/§24 pin `idempotency_key = hash(observation_id + version)` | **absent** |
| `term_reports` | **[NEW v2, schema-ready]** — "generation deferred, schema present so evidence accrues cleanly" | **absent** |

**`CLAUDE.md` §3.1 and §6.1 are in direct, unrecorded conflict.** §6.1 fixes the Phase 0 boundary at *"exactly 10 enums, 22 tables, 13 seed rows"* — a list that omits all five — and states it *"remains the **exact** boundary."* The live total of 26 is that 22, plus the **3 Step 7H audit tables**, plus the **1 correction-request table** Amendment 004 A-040 authorizes. None of the five is among them.

**Disposition: do NOT build them.** `CLAUDE.md` §12 makes creating *"a table or enum §6.1 does not list"* an explicit stop-and-ask, and A-031's inventory is the ratified boundary. The correct action is to **record the contradiction and obtain a ruling**, not to reconcile it silently in either direction.

**Why this is Critical for submission.** Spec §22 devotes an entire section to PDPA — data residency, consent as data, retention and erasure, data minimisation, data-subject rights, breach readiness — for a **Singapore children's-data project**. A submission that presents the schema as complete without recording that the three PDPA instruments are absent, and without stating that their enforcement logic is Phase 4, would misrepresent the system's privacy posture. Spec §22's own disclaimer applies: *"Not legal advice… Validate the specifics with a Singapore privacy professional before handling real data."*

**Mitigating facts to state alongside it, not instead of it:** ADR-6's synthetic-data-only rule keeps PDPA obligations dormant, so no real child data is at risk today; and the absence of `ai_jobs` does not leave drafting unguarded — idempotency is enforced by compare-and-set on `(status, lock_version)` plus the observation-lock re-verify (`BC019`), which is a different mechanism from the spec's, and that divergence is itself unrecorded.

### 0.5 🟠 HIGH — Governance documents have drifted behind the repository

`CLAUDE.md` §6.1/§10 and much of `docs/progress/STATUS.md` still state that **Step 7F and Step 7I are "unstarted and unauthorized"**, that there are **"3 applied migrations"**, and that *"no database, backend, frontend, fixture, generated type or test has been changed yet"* for the Amendment 006 vocabulary.

**Repository reality at HEAD `139d753`: 12 applied migrations, including both Step 7I files and the vocabulary rename.** `CLAUDE.md` was last committed 2026-08-05 (`7c0a359`); the Run B/C work landed after.

**This is documentation drift, not a governance ruling against the work** — and `CLAUDE.md:547` explicitly triggers on it: *"It's the start of a new session and `STATUS.md` or `BUILD_NOTES.md` is missing, **stale**, or doesn't match what you find in the repo — **reconcile before proceeding**."* That clause is currently active. Reconciling it is Phase A work and is a prerequisite for anyone — marker or future agent — reading the governance set as truthful.

---

## 1. Current implementation state at HEAD `139d753`

### 1.1 Verified inventory

| Dimension | Value |
|---|---|
| Migrations | **12**, lexicographically ordered, no gaps, all apply to local Postgres 17 |
| Tables | **26** (22 Step 7E core + 3 audit + 1 correction request), RLS **enabled on all 26**. **Five spec-listed tables absent — see §0.4** |
| RLS policies | **29**, all `FOR SELECT TO authenticated`. **Zero INSERT/UPDATE/DELETE policies exist anywhere.** *(Corrected 2026-08-07 from 30 — three migrations assert `IF v_n <> 29 THEN RAISE EXCEPTION`, and `grep -c "^CREATE POLICY"` returns 29.)* |
| Postgres functions | **34** — 25 with `authenticated` EXECUTE, 9 owner-only |
| Enums | 12 · Seed rows | 13 deterministic |
| Routes | **17 pages** + **5 layouts** (1 root + 4 group) + `proxy.ts` |
| Server-action modules | 4 (`"use server"` verified by first-line directive) |
| Test files | 51 files, ~28,000 lines |
| Stack | Next 16.2.10 · React 19.2.4 · `@supabase/ssr` 0.12.3 · Node ≥24 <25 · npm 11.13.0 · **no ORM** (ADR-8 held) |

### 1.2 Local Supabase is real, running and complete

The full local Docker stack (Postgres 17 / Auth / PostgREST / Storage / Kong / Studio) is operational. All 12 migrations, RLS, the 34 RPCs, password authentication, the SHA-256 audit hash chain and the two-stage governed lifecycle execute against it. `supabase/.temp/project-ref` is **absent** — the CLI has remained local-only and **no hosted project has ever been linked**.

The historical stale `NEXT_PUBLIC_SUPABASE_URL` pointing at a defunct hosted project has been corrected to the local endpoint. It is treated here as stale configuration, **not** evidence of a prior hosted deployment. `docs/progress/STATUS.md:45` corroborates: *"No hosted database was accessed at any point — no link, no project reference, no hosted URL; the project has never been linked."*

**Nothing in this plan is classified missing for want of a hosted project.**

---

## 2. Already final-quality

These are the project's strongest assets. **Do not "improve" them** — with the three scope limits marked ⚠️ below, which are boundaries on the *claim*, not defects in the work. Items 1, 2, 5, 6, 7, 8 and 10 require no change of any kind.

| # | Item | Why it is final |
|---|---|---|
| 1 | **The wording-only edit boundary** | Enforced **by RPC signature**, not by UI. `report_management_edit_wording` takes four text panels + three concurrency proofs and **no rating, observation, attendance, evidence, note, checklist, approval, lineage or submission parameter**. Migration line 1902: *"THE ALLOW-LIST IS THE SIGNATURE, NOT A RUNTIME FILTER."* The nine rating snapshots are copied **verbatim** from the trainer-approved source, so management cannot alter a rating **even by bypassing the UI**. `ManagementReviewDto` carries no ratings field. Run C4 N-4 proves a signature-correct nine-rating write is refused with an authored `BC101`. **Do not widen or narrow without an amendment.** |
| 2 | **Parent isolation, by construction** | `report_get_canonical` resolves content **solely** through `latest_submitted_version_id`, so a `trainer_approved`-but-unsubmitted version is unreachable with **no status branch a later edit could weaken**. Layered with `app_parent_reaches_student`, `is_active` link policies, RLS-scoped enumeration, and a DTO of 5/2 fields where prohibited data is **never fetched**, not fetched-and-hidden. |
| 3 | **Non-disclosing denial — at the SQL layer** | `CANONICAL_READ_DENIED` is a frozen module constant; the Supabase error object is deliberately not inspected, forwarded, mapped or logged. All six denial cases return byte-identical results **in the database**. ⚠️ **Scope correction:** the *server-layer* byte-identity property does **not** hold — C2C-025 (§3.1) means a malformed route parameter renders a visibly different panel. The constant is final; the end-to-end denial-parity property is not, and it is the property the acceptance evidence turns on. |
| 4 | **The audit hash chain — for its Phase 0 scope** | Append-only by privilege (`REVOKE ALL` from `PUBLIC, anon, authenticated, service_role, authenticator`) **and** by trigger **and** by hash. Domain-separated per-centre genesis; length-prefixed NULL-distinguishing `BESTCOACH-AUDIT-V1` envelope over 16 fields; SHA-256; head-locked atomic append. **Callers cannot supply `prev_hash`, `entry_hash`, `seq_no` or the timestamp — no such parameters exist.** The actor triple is re-proven, never trusted. ⚠️ **Two limits that must be stated in every submitted document** (`CLAUDE.md:162`, A-007): the **independent retention-locked external mirror is Phase 4 and unbuilt** — *"Phase 0 must not claim the complete external audit architecture is finished"*; and the **A-010 mandatory test** (append-only proven *as the restricted application role*) **does not exist** (§8.1). |
| 5 | **Audit tamper-evidence proof** | `prove-g17-chain-controls.mjs` C-1…C-6: a drift guard binding the control to the gate it stands for, a positive control, a proof that the *old* predicate fails the same healthy rows, and **C-5 — the chain is deliberately corrupted on a disposable clone and detection FAILS it, naming centre, sequence number and failing check.** Textbook quality. |
| 6 | **AI governance** | Strict byte-equality on ratified provider/model selectors; two-stage schema→grounding validation with **no code path from provider output to storage that skips grounding**; bounded 2-attempt retry then cancel so **no false `draft_ready` ever exists**; A-052-compliant *contextual* leak detection (a bare-word regex is expressly prohibited and the code says why); metadata redaction to model/requestId/token counts only. **AI cannot approve or publish** — structurally, not by policy. |
| 7 | **The lifecycle state machine** | 8 states, 14 legal transitions, each a guarded compare-and-set with its audit write in the same transaction. **39 authored error codes — `BC001`–`BC025` (lifecycle) and `BC101`–`BC114` (management boundary).** `'approved'` is transient-in-transaction with a migration-level assertion that **no operation ever commits with it**. |
| 8 | **Two-layer route authorization** | `proxy.ts` matcher **plus** `requirePortalAccess(portal)` in each portal layout with a literal fixed in layout source. The documented rationale is sound: a matcher typo would silently disable layer 1 with no type error. The `role` query parameter grants nothing (A-046) — verified unread in every authorization path. |
| 9 | **Secret hygiene and commit discipline** *(narrower than "repository hygiene")* | `.env*` gitignored with an `!.env.example` exception; **no secret ever committed** across 121 commits; `node_modules`/`.next` never tracked; conventional-commit messages referencing governance IDs. **The git history is a submission asset.** ⚠️ This does **not** extend to repository *completeness*: no LICENCE, no `.github/`, boilerplate README — all open in §7.1. |
| 10 | **The honesty apparatus** | Run C1's verdict is literally `NOT READY`; Run C3-B advised the operator *not* to spend a billable call; the unintended provider call was disclosed; vacuous negative controls (`42883`) were found and closed by `isAuthorizationDenial()`. This is a citable verification methodology. |

---

## 3. Remaining application work

### 3.1 Live defects — fix before final regression

| ID | Where | Defect | Severity |
|---|---|---|---|
| **C2C-007** | `features/trainer/returned-reports-queue.tsx:36-38` | **The canonical `/trainer/reports` route is dead** — returns the unavailable panel unless `?status=needs_edit` is present. The canonical/alias relationship is **inverted**, and no in-app control links to the bare route. Management does this correctly (`searchParams.get("status") ?? "trainer_approved"`) | **HIGH** |
| **C2C-006** | `features/trainer/trainer-draft-generation.tsx:300-364` | Refusal branch does not distinguish `stale_state`; a stale-state refusal renders copy claiming the draft was rejected safely and the report stayed at Observation Saved. **On the screen whose entire purpose is proving refusals are honest** | **HIGH** |
| **C2C-015** | `features/trainer/trainer-schedule.tsx` | Schedule opens on the earliest assigned session, not today — a demo lands on a past month. Flow order 2 | **MEDIUM** |
| **C2C-025** | `features/parent/parent-canonical-report.tsx:81,87` | Route params passed to the RPC unvalidated → PG `22P02` → a visibly different panel, defeating the required three-way denial byte-identity. **The fix pattern already exists** at `context-resolver.ts:59-73` | **MEDIUM** |
| **C2C-027** | same file | No Back-to-Reports affordance in the success state | LOW |
| **C2C-020** | `parent-dashboard.tsx:62-68`, `parent-reports-list.tsx:69` | `?preview=` branches ungated in a participant build — rendered state becomes a function of caller input | LOW |
| Wall-clock | `scripts/tests/step-7i/lifecycle-canonical.sql:1217` | Derives `ends_at` from the local wall clock, so **the canonical suite fails between 23:00 and 24:00 Asia/Singapore**. Known, documented, deliberately unpatched | **MEDIUM** — a marker running it at the wrong hour sees red |

### 3.2 Structural gaps

| # | Gap | Detail | Priority |
|---|---|---|---|
| 1 | **Route-level `loading` / `error` / `not-found` / `global-error` boundaries** | **Zero of each exist in `app/`.** An uncaught throw or unknown portal path renders **outside `PortalShell` and outside the governed non-disclosing copy** — the one place this project's uniform denial language does not reach. Mitigated one level down by `ResourceState`/`StatePanel`/`LoadingSkeleton` in all 15 feature components, so the *experience* is largely covered; the *boundary* is not. **Any fix must not interpolate a thrown message and must preserve `integrated-route-security.mjs` SEC-11's reliance on the bare 404** | **HIGH** |
| 2 | **Suspense fallbacks** | 6 routes use `fallback={null}` → a completely blank page during the streamed segment; 7 routes use no Suspense. Only `/login` has a labelled `role="status"` fallback | MEDIUM |
| 3 | **Skip link** | `portal-shell.tsx:264` sets `id="main-content"` but no skip link and no "Skip to" string exists anywhere. **The anchor is a dangling target** | MEDIUM |
| 4 | **Operational audit-chain verification** | `audit_verify_chain` exists, is correct, is `STABLE`, and has **no application caller** — script-only. No scheduled job, no admin surface, no startup check. Chain *construction* is complete; chain *verification in operation* is missing | MEDIUM |
| 5 | **`report_reopen_submitted`** | Holds `GRANT EXECUTE … TO authenticated` (migration line 3011) with **no application caller** — a browser-reachable lifecycle transition with no UI. The omission is deliberate; **the grant was not withdrawn to match** | MEDIUM |
| 6 | **Password reset** | No `resetPasswordForEmail`, no route, no component. Drawn on all three frozen login frames; `reference/Auth 04` is a complete design **outside the ratified 36** | MEDIUM — gated on OD-1 |
| 7 | **Invitation → activation flow** | `invitations` table exists with **zero policies, zero grants, zero RPC, zero app reference**. This is the ratified onboarding path (A-020/A-027) and it is unbuilt | MEDIUM |
| 5b | **PDPA schema — `consent_records`, `retention_policies`, `erasure_requests`** | §0.4. Required by `CLAUDE.md` §3.1 and marked **[KEY]** in spec §20, absent from all 12 migrations, and excluded from §6.1's exhaustive inventory. **DO NOT BUILD — this is a stop-and-ask.** Record the §3.1↔§6.1 contradiction and obtain a ruling | **HIGH (governance)** |
| **5a** | 🔴 **`report_source_map` — GENUINELY MISSING, and unlike the others it has no deferral clause at all** | Spec §20 marks it **[KEY]** — *"output_section ↔ source dimension/field. Makes 'Compare with Notes' / source-trace implementable."* `CLAUDE.md:458` names it inside the **Phase 1** build path: *"Review & Approve (**compare-with-notes via source map**, approval snapshot)."* It is absent from all 12 migrations, **absent from §6.1's excluded-with-an-owner register**, and named by **no amendment**. Every other absent table has a phase owner; this one has none. **A Phase-1 [KEY] deliverable with no schema and no owner** | **HIGH** — needs an owner ruling |
| 5c | **`ai_jobs` / `term_reports`** | §0.4. Both spec-listed; both absent. Idempotency is instead enforced by CAS on `(status, lock_version)` + `BC019`. **The substitution is deliberate and recorded in-source** — migration `20260805090500…sql:890-896`: *"This is the spec section 24 `hash(observation_id + version)` idempotency shape expressed as a guard. **NO COLUMN IS ADDED.**"* It is **not** recorded in the governance set, which is the actual gap. `term_reports` is consistent with term generation being out of scope | MEDIUM — record in governance, do not build |
| 5d | **Attendance toggle (A-018)** | `CLAUDE.md:216` grants the **trainer** the right to toggle a student to `Absent` and requires the change to be auditable; `STEP_7I_REPORT_LIFECYCLE_BASELINE.md:53` assigns the RPC and its `attendance.changed` event to a Phase 1 checkpoint. **No attendance mutation exists in any migration or on `PhysicalTestPort`**; `attendanceState` is read-only; `attendance.changed` is registered and never emitted. A governed capability with zero write path, on a core-slice screen | **MEDIUM–HIGH** |
| 8 | **Declarative DB transition constraints** | No CHECK constraint or trigger on `reports.status`. All 14 transitions are procedural. **This is much weaker-sounding than it is**: the client holds zero table DML privilege, so the RPCs are the only write surface. Residual exposure is a superuser/migration context writing an illegal, unaudited state | LOW — record as accepted |
| 9 | **`assessment_dimensions` divergence** | Seeded and FK-referenced, but the app reads its nine dimensions from the TypeScript constant `server/modules/framework/dimensions.ts`, never from the table | LOW |
| 10 | **13 of 16 registered audit actions never emitted** | Only `report.created`, `report_version.created`, `report.state_changed` fire. Mostly consistent with the admin/invitation flows not being built — **but `attendance.changed` is not informational**: it is reserved for a ratified trainer capability (item 5d) that has no write path | MEDIUM for `attendance.changed`, LOW for the rest |

### 3.3 UI reconciliation

Fully specified in **`UI_REFERENCE_FINAL_MVP/FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md`**. Summary:

| Classification | Count |
|---|---:|
| EXACT | **0** |
| MINOR RECONCILIATION | **12** (= exactly the core slice) |
| MAJOR RECONCILIATION | **3** (09, 11, 30) |
| MISSING | **21** (deferred `Post-48-hour final-MVP scope`) |

> ⚠️ **Scope correction — the 24 deferred screens ARE required for the final MVP.** Amendment 005 **A-044** states verbatim: *"The remaining 24 portal screens are `Post-48-hour final-MVP scope`. They are **required for the final MVP** and **not required before the physical test**."* Of its five binding consequences, the two that could bear on scope are both explicitly scoped **"before the physical test"**; the remaining three ("no active document may omit a core screen", **"Deferral deletes no safeguard"**, and the already-exists-is-recorded-per-screen rule) are unscoped and defer nothing. **Deferral of the physical test is not deferral of the final MVP.** They are therefore in scope for this plan and are scheduled as Phase C2 (§10). Narrowing final-MVP scope to the 12 core screens would require an **amendment**, not a plan author's decision (`CLAUDE.md` §12: adding, removing or renumbering a screen in the ratified inventory is a stop-and-ask).

Plus **25** shared/global states: **5 EXACT · 9 MINOR · 8 MISSING · 3 UNVERIFIED** (validation, success and disabled — mandated by `GLOBAL_UI_RULES.md` and every core `screen.md` §10, and not yet assessed).

**EXACT is zero because visual acceptance is `Not started` for all 36 on the packs' own instrument** — `FRONTEND_RECONSTRUCTION_TRACKER.md` line 7: *"No screen is operator-accepted."* For most of the twelve, reaching EXACT is an **operator-acceptance action, not an engineering one**.

That plan also carries **fourteen governance-sensitive frame conflicts** (frames that draw prohibited content — most severely pack 31, whose Parent Calendar frame publishes the entire four-level competency taxonomy with polarity glosses to a parent) and **six open operator decisions**. **Recording those fourteen conflicts in the affected packs is the highest-leverage, lowest-cost action in this entire plan**, because packs 30 and 31 currently carry no recorded conflict — nothing stops a future agent building them as drawn.

---

## 4. Readiness by role and subsystem

| Area | Local status | Outstanding |
|---|---|---|
| **Authentication** | **READY FOR THE SIGN-IN PATH.** Supabase Auth email+password; role resolved live from `centre_memberships`, never a JWT claim; ambiguity (0 or ≥2 memberships) is denial; two-layer guard; real server-side sign-out; all four failure causes render one closed two-value state. ⚠️ **Not ready as an account-lifecycle**: A-020/A-027 make invitation → verification → self-set-credentials the *only* ratified account-creation path and it is **entirely unbuilt** (§3.2 item 7) | Invitation/activation flow; password reset (OD-1); hosted auth policy (§5.4) |
| **Trainer** | **READY FOR THE REPORT FLOW.** Schedule → roster → nine-dimension assessment → AI draft → review/edit/checklist → approve. All report-lifecycle backend delivered. ⚠️ **One ratified trainer capability is unbuilt** — the A-018 attendance toggle has no write path anywhere (§3.2 item 5d) | C2C-006, C2C-015; attendance toggle; visual acceptance |
| **Management** | **READY.** Queue (3 in-page filters, one route) → status-gated review → wording-only edit → return-for-correction → Approve & Submit. Row actions gate per status; no generic handler | Canonical route for screen 19; `/edit` has no design reference (OD-5); visual acceptance |
| **Parent** | **READY.** Submitted-canonical, view-only, own children only, enforced by construction | C2C-025, C2C-027; **cross-child negative test cannot be written against the one-student fixture** (§8.1) |
| **Lifecycle / governance** | **READY.** 8 states, 14 transitions, CAS + audit atomic, proven end-to-end by Run C4 (29 PASS) | Declarative constraints (accepted); `report_reopen_submitted` grant |
| **AI integration** | **READY locally.** Fixture mode OFF (`NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE` absent from `.env.local`); G-6 proved 16/16 with a real billable call | **§0.3 — the `docker exec` transport must be replaced before any deployment** |
| **Schema / RLS / audit** | **READY WITH A RECORDED GAP.** 26 tables RLS-on, 29 SELECT-only policies, deny-by-default on the 13 report/observation/audit tables, 34 functions, tamper-evidence demonstrated. ⚠️ **Five spec-listed tables are absent (§0.4), including all three PDPA instruments**, and `CLAUDE.md` §3.1 contradicts §6.1 about it. The audit architecture is complete **for Phase 0 only** — the Phase 4 external mirror is unbuilt | The §0.4 ruling; operational verification caller; the A-010 restricted-role test; hosted privilege replay |
| **Storage / evidence** | **CORRECTLY ABSENT.** Zero buckets, zero policies, zero app code. Evidence scope and uploader are UNRESOLVED (A-014) and `CLAUDE.md` §12 forbids inventing an uploader | Nothing — do not build |

---

## 5. Local vs hosted — the distinction, stated precisely

### 5.1 The rule

**Everything in §4 marked READY is validated against local Supabase and is application/database logic that is complete.** Hosted work is *environment-specific verification and provisioning*, not missing implementation. **No subsystem is classified missing for want of a hosted project.**

### 5.2 Hosted prerequisites, in two groups

**Group 1 — must be SETTLED BEFORE provisioning** (design and governance decisions; none requires a hosted project)

| # | Prerequisite | Why it blocks |
|---|---|---|
| **P1** | **Replace the `docker exec` trusted draft channel** (§0.3) | Without it, AI drafting cannot store a draft on hosted Supabase at all. Must preserve R-27 — **do not grant client EXECUTE on `report_store_draft`**. A dedicated definer chain is the indicated shape. **Governance-sensitive: requires explicit authorization.** Note this is a **code-removal item in shipped application code**, not test scaffolding: `server/modules/report-workflow/actions.ts` — a `"use server"` module — constructs `LocalTrustedDraftStore`, which hardcodes the container name and `spawn("docker", …)`. A deployed build fails at **runtime inside a server action**, with no build-time or type-level signal |
| **P4** | **Resolve the management bootstrap (U-23 / N-4 / CP-5)** | **Open and materially important**: management is the publisher, so *a centre with no active management membership can publish no report*. There is no ratified production bootstrap path |
| **P6** | **Set `next.config.ts`** | Currently **empty** — no CSP, no security headers, no `output: "standalone"` (needed for a lean container) |

**Group 2 — can only be VERIFIED AT OR AFTER provisioning** (these are gates, not preconditions — they cannot be settled in advance)

| # | Gate | Detail |
|---|---|---|
| **P2** | **The `P-1` ownership guard on the hosted platform** | Every migration aborts if `current_user <> 'postgres'`, because objects created by `supabase_admin` inherit an ACL granting ALL to `anon`/`authenticated`/`service_role`. Correct failure mode, **untested hosted** — it will fail the whole migration set if the hosted CLI applies as a different role |
| **P3** | **No out-of-band dashboard grants** | The security model depends on `service_role` holding zero EXECUTE and 13 tables holding zero grants. A hosted dashboard action could silently violate both |
| **P5** | **Hosted auth hardening** | Local values are dev defaults and unsafe hosted: `minimum_password_length = 6`, `password_requirements = ""`, `enable_confirmations = false`, `enable_signup = true`, `site_url = "http://127.0.0.1:3000"` |

**This split matters for sequencing.** P1 gates **AI drafting on hosted** — it does not gate provisioning, region verification, migration apply, or environment separation. Treating it as a hard predecessor of all Track B work would needlessly delay `G-SG`, the one gate this plan itself calls *"a constraint applied at creation time, not a later task."*

### 5.3 ADR-6 — the Singapore acceptance gate

**Verbatim, Specification v3 §16:**
> **ADR-6 — Region & data: Singapore-pinned; synthetic data during prototyping.** Free to set right now, painful to migrate later. Database **and** compute run in/near Singapore. During prototyping, only synthetic/seed data is used, keeping PDPA obligations dormant until real records are handled.

**Verbatim, `CLAUDE.md:74`:**
> **Region-pin everything to Singapore** (database, storage, compute) from project creation. Use only synthetic/seed data — never real student data — until told otherwise.

Reinforced as non-negotiable 4 (`CLAUDE.md:164`): *"Don't default to a `us-east-1`-style default because it's the wizard's default — check the project region explicitly when scaffolding Supabase."*

**Acceptance gate G-SG.** ADR-6 binds **database, storage AND compute**. Therefore:
- Supabase project region **must** be `ap-southeast-1` (Singapore), verified at creation, captured as reproducible evidence.
- **GCP region must be `asia-southeast1`** — the same clause binds it.
- The LLM region/DPA must avoid uncontrolled cross-border transfer of child data (spec §22).
- **Getting this wrong means re-provisioning, not reconfiguring.** It is a constraint applied at creation time, not a later task.

Note the one prior region claim — `MIGRATION_TRACKER.md:763` records an orchestrator-verified `ap-southeast-1` project from 2026-07-22 — is an **unreproducible human attestation**, and that document's own "Singapore region confirmed through the dashboard" checkbox remains **unticked**. Treat hosted as unprovisioned and re-verify from scratch.

### 5.4 dev / staging / prod separation

**Requirement** (`CLAUDE.md` §3.7): *"Dev/staging/prod are separate Supabase projects, not schemas within one project."* Implementation Plan `:476`: *"never share one project across environments."*

**Reality:** one local project, one `.env.local`. No `.env.staging`, no `.env.production`, no per-environment config. The disposable stack in `scripts/physical-test/disposable-stack.mjs` is **test isolation, not an environment tier**.

**Required:** ≥2 hosted projects, per-environment secret sets, a documented promotion path, and re-running the full checklist against staging before promoting. **Seed UUIDs are fixed literals and identical across every environment** (A-031) — a report must mean the same thing in local, staging and production.

### 5.5 Production secrets

**The ratified six-variable contract (names only):** `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` · `SUPABASE_SECRET_KEY` · `LLM_PROVIDER` · `LLM_MODEL` · `LLM_API_KEY`, plus the dev/test-only `NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE`. Rule: **no secret may carry a `NEXT_PUBLIC_` prefix.**

Structural validation already exists (`server/platform/env.ts`): publishable-prefix rejection on the secret key, key-family classification, cross-key family match, key-reuse rejection — with error messages carrying **only a code, a variable name and an expectation, never a value**. The module honestly notes this does **not** prove the credentials belong to the selected project.

**Missing:** any secret manager, any CI/CD injection, any rotation policy, any prod/dev key separation. GCP Secret Manager is the natural fit given §6.

---

## 6. ~~GCP deployment prerequisites~~ → **SUPERSEDED: Vercel + hosted Supabase deployment prerequisites**

> ### ✅ SUPERSEDED 2026-08-08 (Phase A2, S-25…S-35). **GCP / Cloud Run is NOT the deployment target.**
>
> **The ratified Final MVP architecture is `NEXT.JS → VERCEL → HOSTED SUPABASE`** (Authority Lock §22.1, §22.5, §22.6; Phase A **G-29**). Governance *permitted* Vercel all along — spec §19 reads *"Vercel (Singapore) **or** Cloud Run `asia-southeast1`"* — so **PA-OD-7 was dissolved, not decided**.
>
> ✅ **The teaching-team discussion requirement is CLOSED** — `OPERATOR_CONFIRMED_TEACHING_TEAM_DEPLOYMENT_APPROVAL` (2026-08-08). ⚠️ **This is an operator-reported external confirmation. No documentary evidence of it exists in this workspace, and none may be fabricated.**
>
> **Everything below in this section that names GCP, Cloud Run, `asia-southeast1` as a *GCP* region, Secret Manager, a container, `output: "standalone"` or a build pipeline is HISTORICAL and must not be actioned**, including: the *"escalated to an operator ruling"* note (**the ruling was issued** — dead escalation), acceptance gate **G-SG**'s *"GCP region must be `asia-southeast1`"*, requirement-register **row 9**, dependency node **D4**, and **Phase F** in the execution order.
>
> **What survives and is still binding:** **Singapore data residency** — it binds Postgres, Storage *and* compute, platform-neutrally, and Vercel (Singapore) + hosted Supabase (Singapore) satisfies it. Also surviving: secret management as a requirement (Authority Lock §24), and the need for a deployment runbook. **Vercel needs no Dockerfile, no `cloudbuild.yaml`, no `app.yaml`, no Terraform and no `.gcloudignore`.**
>
> **Two other dead STOP-AND-ASK gates in this document are also CLOSED:** **SA-1** (the `CLAUDE.md` §3.1↔§6.1 PDPA-table contradiction) — ruled twice, §6.1 wins, **do not build** (Phase A G-1; Authority Lock §20.1). **SA-3** (the A-018 attendance toggle) — **RULED: attendance is REQUIRED and A-018 is ACTIVE** (Authority Lock §7); the *"or record it as descoped"* branch is gone.
>
> **And the storage/evidence row's *"Nothing — do not build"* is now a WRONG instruction:** evidence media is **required**, the **Trainer** is the ruled uploader, and private hosted Supabase Storage is the ratified home (Authority Lock §8, §21). Only the **parent projection** is out of scope (§8.1).

**Current state: nothing exists.** No `Dockerfile`, no `cloudbuild.yaml`, no `app.yaml`, no Terraform, no `.gcloudignore`, no `.github/` directory. `next.config.ts` is 133 bytes of default.

> ⚠️ **Escalated to an operator ruling (2026-08-07).** A workspace-wide grep confirms **`GCP` and `Google Cloud` appear zero times** in `CLAUDE.md`, the spec, any amendment, or the Implementation Plan. The **only** ratified hosting statement is spec §19: *"Vercel (Singapore) **or** Cloud Run `asia-southeast1`."* GCP therefore originates solely from the audit instruction and **conflicts with a ratified either/or**. An unverified instruction must not silently override a ratified ADR — this needs a ruling before Phase F is planned. See the Phase A operator gate.

**Governance note worth stating plainly:** **GCP is not mandated by any governance document.** The only hosting statement is spec §19 — *"Vercel (Singapore) or Cloud Run `asia-southeast1`"* — an either/or, subordinate to ADR-6. GCP is an **externally-supplied requirement**; ADR-6 binds its region to `asia-southeast1`. (The repository README's stock "Deploy on Vercel" text is `create-next-app` boilerplate, not a decision.)

Architecturally compatible: ADR-2 makes the app a **modular monolith — one deployable**.

**Prerequisites:** P1–P6 (§5.2) · a container or buildpack with `output: "standalone"` · region `asia-southeast1` · secret wiring · a build pipeline · and updating Supabase `site_url` **and the Auth redirect allow-list** — otherwise authentication breaks on the hosted origin, which is a predictable and easily-missed failure.

---

## 7. Documentation and submission packaging

| # | Requirement | Status | Detail |
|---|---|---|---|
| 1 | **README** | **NOT STARTED** | `README.md` is **verbatim unmodified `create-next-app` boilerplate** — "This is a Next.js project bootstrapped with create-next-app", `npm run dev`, links to nextjs.org, and a closing "Deploy on Vercel" section. **Zero mention of B.E.S.T Coach, Supabase, migrations, roles or architecture.** The single most damaging item for a marker's first impression. Ample source material exists |
| 2 | **Reproducible setup** | **PARTIAL** | The machinery is real (`.nvmrc`, engines, `fixtures:local`, `config.toml`, 12 migrations). Two concrete gaps: **(a)** no document gives the ordered runbook; **(b)** **`config.toml` sets `[db.seed] enabled = true` pointing at `supabase/seed.sql`, which does not exist** — a fresh `supabase db reset` will not behave as declared. Must also document the **operator-only no-echo interactive password prompt** for `fixtures:local` (§11 forbids env-var/file/default password paths) — **a marker cannot seed without knowing this** |
| 3 | **Deployment instructions** | **NOT STARTED** | Blocked on §5–§6 decisions |
| 4 | **GitHub Classroom** | **NOT STARTED** | `git remote -v` is empty. This is a **ratified deferral**, not drift (A-005: *"A remote or push happens only on explicit orchestrator instruction"*). Needs the invite URL, which is not in the workspace. ⚠️ **CORRECTED 2026-08-08 (repository-boundary normalization) — the consequence has INVERTED.** ~~Also decide the fate of the 3 evidence folders and `UI_REFERENCE_FINAL_MVP/`, which live outside the repo — pushing `main` publishes none of them.~~ **`UI_REFERENCE_FINAL_MVP/` is now IN the repository and committed (343 files, including all 88 `_checkpoint-evidence` artefacts): pushing `main` PUBLISHES ALL OF IT.** Decide its fate **before** any push, and satisfy the §8.3 item 3 secret / redaction / third-party-content precondition first — the risk moved from *"none of it ships"* to *"all of it ships"*. **Only the 3 `_*-evidence/` folders remain outside the repo and unpublished by a push.** Confirm the commit identity matches the submitting GitHub account |
| 5 | **Google Site** | **NOT STARTED** | Requirements unknown — see §0.1 |
| 6 | **Final report** | **NOT STARTED** | No submission-shaped report exists. `AUTONOMOUS_48H_FINAL_REPORT_TEMPLATE.md` is an **empty template**. ~1.1 MB of internal prose exists as raw material — **that volume is a hazard: it needs distilling, not appending** |
| 7 | **Architecture diagrams** | **PARTIAL** | **6 Mermaid diagrams already exist** in `docs/spec/BEST_Coach_Complete_MVP_Specification_v3.md` — assessment cadence, end-to-end service flow, report state machine, high-level architecture, ER model, AI drafting sequence. **No standalone files** (no `.drawio`, `.mmd`, exported PNG/SVG). **Two are stale:** the architecture diagram still labels screens "Google Stitch" (replaced by Figma per A-022), and the state diagram predates Amendment 004's `trainer_approved` two-stage workflow and Amendment 006's vocabulary. **No deployment diagram exists** — nothing to draw until §6 |
| 8 | **Service blueprint** | **PARTIAL** | Spec §10 "Operational Service Blueprint" exists as **prose + table**, treated as binding by `CLAUDE.md` §3.8. It is **not a blueprint diagram** — no swimlane, no line-of-visibility. It also predates Amendment 004's two-stage review |
| 9 | **GitHub links** | **BLOCKED** on #4 |
| 10 | **Live deployment link** | **BLOCKED** on §6 |
| 11 | **2-minute video** | **NOT STARTED** | No script, storyboard or recording. Could be filmed against localhost if the brief permits — **unknown** |
| 12 | **Presentation / demo** | **NOT STARTED** | No deck, no demo script. **Note: six of the eight blocked design families — the entire management half of the story a demo must tell — have no Figma frame at all** |

**On `00-PeakPalate-Master.mp4`** (58.4 MB, workspace root): a workspace-wide grep for "PeakPalate" returns **zero textual references** — no doc, tracker, git history or config. The name suggests an unrelated project. **Do not count it as a deliverable without confirming by playing it.**

### 7.0 Consolidated requirement register — the single checklist

Every named requirement in one place, so the whole set can be checked against the brief when it arrives (§0.1). Sources: `A` = audit instruction (unverified against a brief) · `G` = governance document.

| # | Requirement | Src | Status | Phase | Blocker |
|---:|---|---|---|---|---|
| 1 | README | A | NOT STARTED | G | — |
| 2 | Reproducible setup | A/G | PARTIAL | G | dangling `seed.sql`; undocumented TTY password prompt |
| 3 | Deployment instructions | A | NOT STARTED | G | §5–§6 decisions |
| 4 | GitHub Classroom | A | NOT STARTED | G | invite URL absent; **R1**; fresh secret scan |
| 5 | Hosted Supabase | A/G | NOT STARTED | D2 | P4 |
| 6 | Singapore region (ADR-6) | **G** | NOT STARTED | D2 (**G-SG**) | must be set at creation |
| 7 | dev/staging/prod | **G** | NOT STARTED | D3 | D2 |
| 8 | Production secrets | **G** | PARTIAL | D3/F | no secret manager |
| 9 | GCP deployment | A | NOT STARTED | F | P1, P6, G-SG |
| 10 | Public URL | A | NOT STARTED | F | chain terminus |
| 11 | UAT | **G** (A-024) | PARTIAL — executed, undocumented | H | hosted re-run needs F |
| 12 | Google Site | A | NOT STARTED | I | §0.1 |
| 13 | Final report | A | NOT STARTED | I | §0.1 |
| 14 | Architecture diagrams | A | PARTIAL — 6 Mermaid exist, 2 stale | I | re-derive from HEAD |
| 15 | Service blueprint | A/G | PARTIAL — prose+table, not a diagram | I | predates Amendment 004 |
| 16 | GitHub links | A | BLOCKED | I | #4 |
| 17 | Live deployment link | A | BLOCKED | I | #10 |
| 18 | 2-minute video | A | NOT STARTED | I | §0.1; soft-blocked by #10 |
| 19 | Presentation / demo | A | NOT STARTED | I | U-25's 8 unframed families |
| 20 | **Human usability evidence** | A | **NOT STARTED — none exists** | H | longest lead; start now |
| 21 | Terminology purge | — | NOT STARTED | H | integrity precondition for #13/#19 |
| 22 | `npm test` + `TESTING.md` | **G** | NOT STARTED | G | — |
| 23 | Evidence committed to repo | — | NOT STARTED | G | **R1** + fresh scan |
| 24 | LICENCE | — | NOT STARTED | G | — |

**Only three of the twenty-four are traceable to a governance document** (6, 7, 11, plus partial support for 2, 8, 15, 22). The rest rest on the audit instruction alone until the brief is obtained.

### 7.1 Repository hygiene for public submission

**Safe to push today from a secrets standpoint** (§2 item 9). Gaps: **no LICENCE file**; **no `.github/` directory** — no CI, though `CLAUDE.md` §3.7 asks for "CI-ready (lint, typecheck, migration check, tests) even before CI itself is wired up", and the scripts exist while the CI does not; the boilerplate README; and the repo-external artefacts noted in #4.

---

## 8. Testing and evidence

### 8.1 Reusable as-is — label as *technical verification*, never as *testing with users*

The audit-chain tamper proof (C-1…C-6) · the G-6 negative-control-of-the-evaluator (NC-EVAL-1, which proves the pass/fail evaluator itself cannot be tricked into a false PASS) · parent-isolation G-14 (4 denials, 6 pairwise byte-identical comparisons, **plus a positive control** distinguishing a working boundary from blanket denial) · the canonical-purity invariant (checksum `6bdff280…c576` over 28 rows, identically pinned across four runs and three ledgers) · the security/authorization suite · the 88-file checkpoint screenshot corpus and 12 frozen references · **the honesty apparatus itself**.

**Two carve-outs must be declared, not buried.** Run C4's L-4 is **core-driven, not browser-driven** (deterministic fixture provider, superuser `psql` transport, so no client GRANT or RLS is exercised on that step) — so "the complete governed lifecycle proven through the real UI" is accurate for **13 of 14 legs**. And G-6 conditions **9 and 13** are structural/static rather than runtime observations. **The ledgers declare both; the summaries do not. Soften the summaries.**

**Known coverage holes:** parent **cross-child** isolation cannot be tested against the one-student ratified fixture (C2C-013) — **this is an unproven boundary and must be signed off as unproven, never as passing**; `audit_events` write-denial under the `authenticated` role is untested; password authentication (G-1) is never proven autonomously (every automated path admin-mints sessions).

### 8.2 Requires entirely new evidence — nothing existing substitutes

1. **Human usability testing.** Participant recruitment and consent · task scenarios per role (trainer assess-and-approve; management review-return-submit; parent read) · moderated sessions with think-aloud · time-on-task, completion and error rates · a standard instrument (SUS or equivalent) · a findings-and-severity register · a remediation trace. **No amount of C1–C4 or G-6 evidence substitutes for a single real participant.**
2. **A UAT document.** A-024 requires three-flow UAT. Strong *execution* evidence exists but is not called UAT. ~~and mostly lives outside the repo~~ **✅ 2026-08-08: most of it is now IN the repo** — all 88 `UI_REFERENCE_FINAL_MVP/_checkpoint-evidence` artefacts and every `AUTONOMOUS_48H_*` report. Only the three `_*-evidence/` trees remain outside. (Note the Implementation Plan's residual "all four UAT scripts" at `:470` contradicts its own three-role gate at `:41`; **A-024 governs and the answer is three.**)
3. **Final evaluation** — objectives vs outcomes, limitations, future work.
4. **Accessibility evaluation** — ad-hoc contrast JSONs exist; no repeatable gate; four known defects open.
5. **Presentation assets.**

### 8.3 Reusable with rework

| # | Rework | Why |
|---|---|---|
| 1 | **Terminology purge** — *mandatory* | §0.2. participant adapter → *live-backend adapter*; physical test → *real-stack integration verification*; walkthrough → *scripted agent traversal* |
| 2 | **Re-run C4 with screenshot capture** | **The flagship lifecycle proof captured zero screenshots** — its entire visual record is DOM text in JSON, and 13 of 29 items have no raw diagnostic. The CDP session is already open; this is a small change |
| 3 | **Commit the evidence — but not before two hard preconditions** | ✅ **CORRECTED 2026-08-08 (repository-boundary normalization).** `UI_REFERENCE_FINAL_MVP/` — **including `_checkpoint-evidence/`** — is now **inside** the repository, so a marker cloning the repo **does** get the UI estate and its checkpoint evidence. **Still outside, and still invisible to a clone: `_c4-lifecycle-evidence/`, `_g6-activation-evidence/`, `_f17-disposable-evidence/`.** ~~…and all of `UI_REFERENCE_FINAL_MVP/` are outside every git repository. **A marker cloning the repo gets zero evidence of any run.**~~ ⚠️ **Both preconditions below remain binding, and precondition 1 is now MORE urgent, not less** — the tree is committable today, so an unscanned commit would push unredacted or third-party content into the graded repository. ⚠️ **Precondition 1:** a **fresh, dated secret, redaction AND third-party-content scan over all four trees**. Two prior scans exist and **neither clears this**: `AUTONOMOUS_48H_RUN_C2_REPORT.md:391` scanned *Run C2's own evidence artifacts* for JWT-, key- and connection-string-shaped tokens (zero hits) — but it is credential-shaped only, scoped to C2, and **dated ~01:13 on 2026-08-07, seventeen minutes before the AUTH-01 incident**; `DEMO_TO_MVP_MIGRATION.md:899` covered *staged repository content* and by construction never touched these out-of-repo trees. **A credential regex would never flag prose coursework** — which is exactly what is sitting in the tree today. ⚠️ **Precondition 2: R1 is DISCHARGED** (`UI_REFERENCE_CLEANUP_MANIFEST.md` §2). ✅ **CORRECTED 2026-08-08 — verified by reading the file:** `UI_REFERENCE_FINAL_MVP/AUTH-01-trainer-login/SCREENSHOT_REQUIRED.txt` contains the Phase A2 **reconstruction** plus its `FILE RECONSTRUCTION NOTICE`, rebuilt from `UI_PACK_MANIFEST.json` and `SCREEN_INDEX.md`; a `SPORTSTER` scan of it returns **zero** hits. ~~It currently contains unrelated third-party coursework. **Committing and pushing this tree today would publish that content into a public graded repository.**~~ **That claim was already stale when this row was rewritten for location, and is retracted here rather than carried forward.** ⚠️ **Precondition 1 (the fresh dated secret / redaction / third-party scan) is UNCHANGED and still unmet** — and it now gates a *push*, not a commit: the tree was committed in `f9a0d56`, so the exposure point has moved to the GitHub Classroom step (Requirement 4). |
| 4 | **Add `npm test`** | 51 test files, no runner entry point; the authoritative 9-command list lives ~~**outside the repo**~~ **in-repo since 2026-08-08**, in the `UI_REFERENCE_FINAL_MVP/AUTONOMOUS_48H_*` sprint reports. Add a documented **credential-free tier** |
| 5 | **Add `TESTING.md`** | Name every command, its prerequisites, and which gates it does and does not decide |
| 6 | **Fix the wall-clock non-determinism** | §3.1 |
| 7 | **Consolidate one evaluation document** | Material is scattered across 4 directories and ~380 KB |

### 8.4 Reproducibility by a marker — currently **No**

A marker cloning the repo cannot reproduce any headline claim. Missing: all evidence artefacts; the command list; the three fixture passwords (no-echo TTY only, by absolute rule); a paid OpenAI key plus an interactive TTY confirmation phrase for G-6.

Additionally required on their machine: Docker Desktop, Supabase CLI 2.109.1, Node ≥24 <25, **Google Chrome at the hard-coded Windows path** (overridable only via `CHROME_PATH`), Windows-shaped paths throughout, free ports 3418/9418/55421–55424 plus 54321–54324, ~4 GB disk, and a wall-clock **not** between 23:00 and 24:00 SGT.

**Reproducible today with no credentials:** the static scans, `run-runtime-profile`, `census-provider-constructors`, `failure-safety`, `run-negative-controls`, integration Part 1, `integrated-route-security` (25 assertions, explicitly credential-free), `app-route-census`, `verify-fresh-apply`, plus `tsc`/`lint`/`build`. Meaningful but partial — and it excludes every headline claim.

---

## 9. Unresolved specification conflicts

**Carried, not invented.** Fabricating an answer is prohibited.

| ID | Item | Impact |
|---|---|---|
| **NEW — §0.4** | **`CLAUDE.md` §3.1 vs §6.1 on the PDPA tables.** §3.1 says `consent_records`, `retention_policies` and `erasure_requests` *"exist from the Phase 0 schema"*; §6.1's exhaustive boundary omits all three; none exists. Spec §20 marks them **[KEY]** and spec §22 makes them the mechanism for consent, retention and erasure | **Blocks any truthful claim about PDPA posture.** Building them is prohibited without authorization. **Stop-and-ask (SA-1)** |
| **NEW — §0.4** | **`ai_jobs` absent.** ADR-5 requires keeping *"the idempotency key"* and the full grounding pipeline; the formula `idempotency_key = hash(observation_id + version)` is pinned at spec **§20 / §24**. Grounding is fully kept; the idempotency *mechanism* is substituted (CAS + `BC019`), **deliberately and with an in-source rationale**, but the substitution is absent from the governance set | Record it in governance; do not build the table |
| **A-014** | Evidence media — is it an MVP completion requirement, and **who uploads it** now the TA flow is deferred? *"Do not invent a replacement uploader"* | Blocks all evidence UI; correctly absent today |
| **U-23 / N-4 / CP-5** | **Production management bootstrap** — *"materially more important: management is now the publisher, so a centre with no active management membership can publish no report"* | **Blocks hosted go-live** |
| **CP-3** | Management review-queue read path — *"management currently has no in-product way to discover a report awaiting review"* | Partly addressed by R-6/R-7; formally open |
| **U-06** | Exact report section/field schema | ~~Interim baseline = spec §8's four panels. **This is what OD-4 in the screen plan turns on**~~ ✅ **RULED 2026-08-07 (operator, OD-4).** The canonical Final MVP panels are **Overview · Strengths · Areas for Development · Remarks**; spec §8's four are **SUPERSEDED_BY_OD-4_FINAL_REPORT_MODEL**. One canonical model across Trainer, Management and Parent. **The implementation still carries the superseded names — that is a registered Phase B semantic migration** (`FINAL_MVP_OD4_REPORT_SEMANTICS_RULING.md`), touching storage, both hash serializers, 8 RPCs, generated types, the AI schema and prompt, grounding, fixtures, all three role UIs and the C3/G-6 + C4 harnesses |
| **U-25** | **Figma coverage for the management-review stage — 8 blocked design families.** *"These must not be invented"* | Blocks visual acceptance of the MVP's core surfaces |
| **U-29** | Post-submission correction initiation by management — *"decided by no source and deliberately not invented"* | Deferred |
| **U-20/21/22/24/28/30/31** | Invitation duration; session-lifecycle vocabulary; restricted definer owner; audit-read capability; notification breadth; trainer observation read path (resolved by design); notification module ownership | Mostly deferred; **U-21 is why "Start Class" was correctly relabelled** |
| **Spec §3.6** | **The B.E.S.T acronym gloss is not ratified** — Session Log reads *Body · Emotion · Speech · Tonality*; the Term Report reads *Body Language · Emotions · Structure · Tonality*. Proposed canonical pending ratification. Also provisional: the 9→7 roll-up and the 4→3 scale map | **Affects the final report and the Google Site — do not present as settled** |
| **Ratified residual** | *"The database can enforce which columns management may write, not how much."* **A ratified trade, not an oversight — do not "fix" it** | Record as a designed limitation |

**Documentation-only conflicts to reconcile** (§0.5): `CLAUDE.md`/`STATUS.md` drift; the Implementation Plan's "four UAT scripts" vs A-024's three; `governance-source/` is a **non-authoritative stale mirror** (A-055) and must never be submitted from.

---

## 10. Dependency-aware implementation order

Three tracks. **Track A is entirely unblocked and should start immediately. Track B is four provisioning steps deep. Track C is blocked on the brief.**

```
        §0.1 OBTAIN THE BRIEF ──────────────► gates Track C scope
                    │
 ┌──────────────────┼───────────────────────────────┐
 │                  │                               │
TRACK A             TRACK B                      TRACK C
(unblocked)         (provisioning chain)         (submission)
 │                  │                               │
 A. Governance      D1. P1 docker-exec replacement  F. README/docs
    reconcile           (governance-sensitive)      G. Usability evidence
 B. App fixes       D2. Hosted Supabase             H. Report/diagrams
 C. UI reconcile        + G-SG Singapore gate       I. Video/Site/deck
 E. Regression      D3. dev/staging/prod            J. Final verification
                    D4. Secrets + GCP
                    D5. Public URL ──► UAT ──► live link
```

### Phase A — Governance reconciliation and stop-and-asks *(docs only, no code, no migration)*
Reconcile `CLAUDE.md` §6.1/§10/§5 and `STATUS.md` to the 12-migration reality (§0.5). Annotate `FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` §7.3 (screen 05's route now exists) and §8.1 ("delivered on `feat/48h-backend`" — it is on `main`). **Record the fourteen governance-sensitive frame conflicts in their packs.** Rule OD-1…OD-6 and R1…R7.

**Four stop-and-asks must be ruled here, not later, because each would otherwise be taken silently by an implementer:**
- **SA-1 — §0.4.** The `CLAUDE.md` §3.1 ↔ §6.1 contradiction over the five absent tables. Building them is prohibited; the ruling decides whether the boundary or the persona text is amended.
- **SA-2 — §3.2 item 5.** Withdrawing `report_reopen_submitted`'s `authenticated` grant is a **migration**, not a code fix, and `STEP_7I_REPORT_LIFECYCLE_BASELINE.md:336` pins *"Total `authenticated` EXECUTE grants = 14"* — a count four documents derive from and which *"must never be restated from memory."* Withdraw-or-ratify, with the four-document census consequence stated.
- **SA-3 — §3.2 item 5d.** The A-018 attendance toggle: build the RPC + `attendance.changed` emission, or record it as descoped against A-014/A-019.
- **SA-4 — §3.2 items 6 and 7.** Password reset and the invitation/activation flow: schedule, or descope with a recorded reason against A-020/A-027.

**Gate:** no active governance document contradicts the repository; OD-1…OD-6, R1…R7 and SA-1…SA-4 all ruled in writing.

### Phase B — Application fixes *(code only — no migration)*
C2C-007 → C2C-006 → C2C-015 → C2C-025 → C2C-027 → C2C-020 → wall-clock. Then §3.2 items **1–4** (route boundaries, Suspense, skip link, operational chain verification). **Item 5 is excluded — it is SA-2 and requires authorization.** Items 6–10 execute here only if SA-3/SA-4 scheduled them.
**Gate:** each defect has a failing-then-passing assertion; route census unchanged; full local suite green; **no migration written**; a repository-wide assertion that no content hash reaches any DOM (the A-038 4⁹ = 262,144 rating-reconstruction hazard).

### Phase C1 — Core-slice UI reconciliation *(code + evidence)*
Screen plan Phases R2 and R3 — the 12 core-slice screens. Bounded corrections only; capture before/after at frozen native dimensions; re-verify each reference SHA-256; submit for operator acceptance.
**Gate:** per screen — before/after PNG, SHA unchanged, acceptance assertions green, **operator acceptance recorded**. This is the gate that moves screens off `EXACT: 0`.

### Phase C2 — The 24 deferred screens *(required for the final MVP under A-044)*
Screen plan Phase R5. **This phase exists because A-044 requires these screens for the final MVP** (§3.3). Per screen, in dependency order: freeze a reference (none exists for any of the 24) → resolve its blocker → implement.
Blockers by class: **backend projection** (02, 04, 12, 13, 15, 16, 17, 18, 23, 25, 31) · **write path** (20, 21, 22, 24, 26, 27) · **absent governance** (03, 14 — lesson plans have no schema, enum, RPC or rule; **do not infer one from a frame**) · **unresolved field inventory** (20, 21, 24, 26) · **out of MVP scope** (28 — separately governed) · **deferred, landing surface exists at a non-canonical route** (09, 11, 30) · **deferred, component retained but routed by nothing** (01 — `/trainer` is a bare redirect rendering no markup).
Also blocked here: **U-25's eight design families have no Figma frame and none may be invented** — six of them are the management surfaces a demo must show.
**Gate:** each screen has a frozen reference, a governed read/write path, and operator acceptance — or a recorded, ruled descoping. **Scope-narrowing requires an amendment.**

### Phase D — Hosted Supabase
**D1 (parallel).** Design and authorize the `report_store_draft` transport replacement (§0.3/P1) — **must not grant client EXECUTE**; prove the grounding-bypass surface stays closed. **This gates AI drafting on hosted and Phase E's G-6 re-proof — it does not gate D2.**
**D2 (parallel, start as early as possible).** Provision hosted Supabase in `ap-southeast-1`; verify P2 (the `postgres` ownership guard) and P3 (no out-of-band grants); apply P5 (auth hardening). Settle P4 (management bootstrap) before first use.
**D3.** Second project for environment separation.
**Gate G-SG:** region verified with reproducible evidence **at creation** (not a later attestation); all 12 migrations apply cleanly under the `postgres` guard; RLS and grant posture replayed and re-proven; the audit chain verifies on the hosted instance.
**Gate G-AI (D1 only):** a draft stores on hosted through the replacement channel, with `report_store_draft` still holding zero client EXECUTE and grounding still unbypassable.

### Phase E — Final regression
Re-run the full local suite plus a re-run of C4 **with screenshots** (§8.3 item 2). Re-prove G-6 only if the AI transport changed — it did, so **G-6 must be re-proven against the new channel.**
**Gate:** every gate that was PASS is PASS again; the two C4/G-6 carve-outs restated accurately.

### Phase F — GCP deployment
`output: "standalone"` + container; region `asia-southeast1` (G-SG); secrets via Secret Manager; build pipeline; **update `site_url` and the Auth redirect allow-list**.
**Gate:** public URL resolves; all three roles sign in on the hosted origin; the governed lifecycle completes end-to-end hosted; ADR-6 satisfied for database, storage **and** compute; **no application module spawns a container CLI** (the P1 regression check).

### Phase G — Documentation and packaging
README rewrite; setup runbook; **reconcile or remove the dangling `seed.sql`**; `TESTING.md`; `npm test` with a credential-free tier; LICENCE.
**Then, and only after both preconditions in §8.3 item 3 are satisfied** — a fresh dated secret scan over all four evidence trees, **and R1 resolved** — commit the evidence tree, add the GitHub Classroom remote, and push.
**Gate:** a clean clone reaches a running app and a green credential-free test tier using only committed documentation; **and nothing published contains third-party or unrelated content.**

### Phase H — Usability and final evidence
Recruit; run moderated three-role sessions; SUS or equivalent; findings register; remediation trace; the UAT document; accessibility evaluation. **Terminology purge across everything submitted.**
**Gate:** real participants, real tasks, real findings — and no document implies human subjects where there were none.

### Phase I — Report, diagrams, video, site, deck
Refresh the two stale Mermaid diagrams to Amendment 004/006 reality; add a deployment diagram; render the service blueprint as a proper swimlane; write the final report; build the Google Site; script and record the video; build the deck.
**Gate:** every claim traceable to committed evidence; no overclaim of technical verification as usability testing.

### Phase J — Final submission verification
Fresh clone on a clean machine → follow only the committed README → confirm every link, the live URL, and every deliverable named in the brief.
**Gate:** a third party reproduces the documented tier unaided.

### 10.1 Recommended first phase

**Phase A**, and within it three actions today, in this order:

1. **Rule R1** — the AUTH-01 data-integrity incident (unrelated coursework overwrote a pack file; the displaced content may be needed elsewhere and is untouched).
2. **Record the fourteen governance conflicts in their packs** — highest leverage, lowest cost, and packs 30/31 currently have no protection at all.
3. **Reconcile the `CLAUDE.md`/`STATUS.md` drift** — `CLAUDE.md:547` already obliges it.

In parallel, **obtain the submission brief** (§0.1) and **begin usability-test recruitment** (§8.2), because that is the longest-lead item in the whole plan and it is entirely independent of every technical track.

---

## 11. What this plan does not do

It does not modify application code, database schema or data; run migrations; make external AI/provider calls; push to GitHub; provision hosted Supabase; deploy to GCP; alter `.env.local`; touch the frozen demo; delete any UI-reference material; or begin implementation.

---

*Produced at the Final MVP Submission Readiness Audit, 2026-08-07, against main HEAD `139d753` with a clean working tree. No Supabase, Docker, migration, fixture, build, server or external provider was run. No hosted environment was provisioned. Nothing was pushed.*
