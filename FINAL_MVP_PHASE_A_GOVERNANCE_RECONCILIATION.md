# FINAL MVP PHASE A — Governance Reconciliation & Authority-Lock Gate

> 📍 **LOCATION (2026-08-08, repository-boundary normalization).** This file now lives at the **root of the main MVP repository** and is git-tracked. Its Part II is governing; Part I is historical. Any "(workspace root)" or "outside every git repository" phrasing about the six `FINAL_MVP_*` documents or `UI_REFERENCE_FINAL_MVP/` is **historical** — those are repository-relative now. See `CLAUDE.md` §9.1 and `FINAL_MVP_AUTHORITY_LOCK.md` §1.1. **No reconciliation finding is changed by the move.**

**Date:** 2026-08-07 (Asia/Singapore)
**HEAD at start and end:** `139d7533c126acc6a5162d0fcb889e86e80ed59e` — branch `main`, no remote, **nothing committed, nothing pushed**.
**Working tree:** **DIRTY by design** — three tracked *documentation* files carry the Phase A corrections applied under §4: `CLAUDE.md`, `docs/progress/STATUS.md`, `docs/plan/BEST_Coach_Implementation_Plan.md` (8 insertions, 8 deletions, documentation only). **No application code, schema, migration, fixture or configuration file was touched.** The changes are uncommitted and fully reversible with `git restore`.
**Accepted baseline:** Run C3-C G-6 PASS (16/16) · Run C4 governed lifecycle PASS (29/0/0) · 48-hour physical-test sprint formally accepted.
**Status:** Reconciliation and decision instrument. **Authorizes nothing. Creates no application code, schema, migration or hosted resource.**

> ## ✅ SUPERSEDED 2026-08-08 (Phase A2, S-42/S-43/S-44/S-45/S-46/S-48) — READ THIS BEFORE PART I.
>
> **`FINAL_MVP_AUTHORITY_LOCK.md` HAS BEEN CREATED** (144,769 bytes, verified on disk) and is the canonical Final MVP baseline. **Part II of this same file, from §II onward, already says so** — but a reader hitting the red banner below would take a false blocking instruction **327 lines before its retraction**, which is the reverse of the annotate-never-delete method used everywhere else in this corpus. Hence this banner.
>
> **Every operator decision listed as "Live" below is CLOSED:**
> - **PA-OD-1 · PA-OD-9** — exercised and ratified (Authority Lock §19, §18).
> - **PA-OD-2 · PA-OD-3 · PA-OD-5/5b · PA-OD-8 · PA-OD-10** — ruled by the operator.
> - **PA-OD-7** — **dissolved**, not decided: spec §19 already offered *"Vercel (Singapore) **or** Cloud Run"*, so the operator selected a branch governance already permitted (G-29). **Cloud Run is NOT a live selectable option** — the ratified architecture is **NEXT.JS → VERCEL → HOSTED SUPABASE**.
> - **PA-OD-4 · PA-OD-6** — withdrawn as manufactured.
> - **C-4 and C-5** — shown "HELD" in Part I §4; both were **UNBLOCKED** by G-20 (Part II §II.2) and were **applied in Phase A2** on 2026-08-08.
>
> **Part I is HISTORICAL. Part II governs.** Retained unrewritten so the reasoning that produced the lock survives.
>
> ~~## 🔴 FINAL_MVP_AUTHORITY_LOCK.md WAS NOT CREATED.~~
> ~~**Seven operator rulings remain, and three of them block sections the authority lock is required by its own specification to contain**~~ — §11/§15 (evidence media, `PA-OD-2`), §16 (deployment target, `PA-OD-7`), and §17 (submission requirements, which no brief has ever been ingested to support). Creating the lock today would mean recording unratified material as settled — the precise failure mode this governance corpus exists to prevent.
>
> ⚠️ **Revised after adversarial review.** An earlier draft claimed *eight* rulings with *five* blockers. Two were **manufactured** and have been withdrawn — `PA-OD-4` (acronym gloss) and `PA-OD-6` (`report_source_map`) are both resolvable from ratified authority and should never have reached you. One genuinely required decision was **missing** and has been added: `PA-OD-9`, the hosted draft-storage transport. **Over-deferral was this document's characteristic failure mode**, and the gate in §3 is now materially shorter and more honest.

---

## 1. Method and reconciliation notes

Six read-only subagents ran in parallel (specification conflicts · database/PDPA/hosted · screen-pack governance · AUTH-01 forensics · submission brief · usability evidence). Every finding below was re-verified by the orchestrator at source before being recorded. Three subagent claims were **corrected** rather than accepted:

| Claim | By | Orchestrator finding |
|---|---|---|
| "30 RLS policies" | prior audit + Subagent A | **WRONG — it is 29.** `grep -c "^CREATE POLICY"` returns 29, and **nine** migrations assert `IF v_n <> 29 THEN RAISE EXCEPTION` (`…7g…:869`, `…7h…:1121`, `…7i_report_lifecycle:3212`, and one in each of the five post-7I migrations plus `…management_submitted_list:398`) — three times stronger corroboration than first stated. Corrected in both plans |
| "The AUTH-01 incident is isolated" | prior audit + Subagent D | **INCOMPLETE.** True by *modify* time; false by *birth* time. `00-PeakPalate-Master.mp4` was created on disk at **00:55:39**, 35 min before the 01:30 paste, with an *older* mtime — the signature of a copy. Two foreign artefacts, one night |
| "CP-3 is OPEN" | `STATUS.md:114` | **STALE.** `48H_BACKEND_PROGRESS.md:75` records it FULLY RESOLVED at Round B2.1 and migration `20260806103000` exists at HEAD. **Precedence governs rules, not facts — a document cannot outrank a file that exists on disk** |

---

## 2. Master decision table

**R** = resolved from evidence, no operator input. **OD** = genuine operator decision.

| ID | Issue | Authoritative source | Conflicting source | Current implementation | Historical decision | Proposed final ruling | OD? |
|---|---|---|---|---|---|---|---|
| **G-1** | PDPA tables `consent_records` / `retention_policies` / `erasure_requests` | `CLAUDE.md:296` §6.1 (self-declaring: *"authoritative over any older spec §20 table name or shape… the **delivered** schema"*); A-031; A-040 | `CLAUDE.md:98` §3.1 — *"exist from the Phase 0 schema"* | **Absent from all 12 migrations** | A-031 fixed 22 tables as exact; A-040 added exactly one | **§6.1 wins. §3.1:98 is a stale spec-§20 restatement and is factually false. PDPA enforcement is Phase 4. DO NOT BUILD** — `CLAUDE.md` §12 makes creating a table §6.1 omits a triple stop-and-ask | **R** |
| **G-2** | `ai_jobs` absent vs ADR-5's idempotency key | ADR-5; spec §20/§24 | — | Idempotency achieved structurally: RPC-3→RPC-4 observation-lock CAS + `BC019`, and the transition graph makes `drafting` unreachable from any later state | §6.1 excludes "AI schema → later AI work" | **Accept the graph-based single-shot as satisfying ADR-5's invariant.** The substitution is **recorded in-source** (`…7i_report_lifecycle.sql:890-896`: *"the spec section 24 hash(observation_id + version) idempotency shape expressed as a guard. NO COLUMN IS ADDED"*) but **not in the governance set** — record it there | **R** |
| **G-3** | `term_reports` — spec says "schema present", governance says do not build | `CLAUDE.md` §5/§8/§12; A-048 | spec:569 *"schema present so evidence accrues cleanly"* | Absent | Term generation expressly out of MVP scope | **Do not build.** §6.1 supersedes spec §20; the enum `term_rating` would be an invented closed vocabulary; and spec:569's stated *purpose* is already met — term evidence accrues via `observations.term_evidence_notes` | **R** |
| **G-4** | `report_source_map` absent | spec:566 **[KEY]**; `CLAUDE.md:458` names the *capability* "compare-with-notes via source map" (the token `report_source_map` appears in `CLAUDE.md` **zero** times) | — | Absent from all migrations | ✅ **`STEP_7I_REPORT_LIFECYCLE_BASELINE.md:770` — item U-7I-12, ratified at D-287**, owner *"the compare-with-notes / AI checkpoint"*, **blocking: No** | **Already registered, owned and ruled non-blocking. Do not build; record the pointer in §6.1.** *(Corrected — an earlier draft called it "uniquely without a deferral clause or owner". That was reached by checking §6.1 and all six amendments but **not** the ratified Step 7I baseline, which is where the disposition lives)* | **R** |
| **G-5** | Step 7F "unauthorized and unstarted" | `STATUS.md:48` — *"Completed and runtime-accepted (2026-08-03)… commit `e197f91`… **Authorization was bounded to Step 7F alone**"*; D-243/D-251 | `CLAUDE.md:292, 452, 501, 43, 540` | `scripts/fixtures/` holds the three ratified files | Bounded authorization given and discharged | **Step 7F was authorized, executed, independently verified and accepted.** The five CLAUDE.md clauses are stale; mark HISTORICAL | **R** |
| **G-6** | 🔴 **Step 7I onward — authorization chain unrecorded** | Every governing doc says implementation needs its own authorization (`Implementation_Plan:19`, `STATUS.md:59/171`, `PHYSICAL_TEST_SLICE_48H:40`, `Amendment_005:210`) | The work exists, merged, and passed C1–C4 | **12 migrations at HEAD.** **Six functions exist beyond the Step 7I baseline's ratified 28-function inventory** across five post-7I migrations — **not** "beyond A-040", which at `:411` states verbatim *"Functions are outside this clause"* | **D-register holds exactly 317 rows ending D-317.** A repo-wide grep for `7I2A` returns **only prohibitions, never a grant**. The **A-053/V2 vocabulary rename** is a further unrecorded checkpoint execution (D-316 required separate V2/V3/V4 authorization) | **In-scope by inspection, unratified by instrument** — and for the six post-7I functions there is **no ratified inventory to compare against at all**, so "in-scope" is an inspection judgement, not a governance fact. Nothing needs reverting; a retroactive attestation is required | **PA-OD-1** |
| **G-7** | A-014 evidence media | A-002 A-014; `CLAUDE.md:59` — *"Do **not** invent a replacement uploader"* | — | Correctly absent: no table, no bucket, no uploader. Trainer screens render the region **inert with a visible reason**; parent screen omits it entirely | Never reopened by Amendments 003–006 | **OPEN. Status quo is correct** — safeguards stay armed, nothing invented. Two separable questions remain | **PA-OD-2** |
| **G-8** | U-23 / N-4 / CP-5 management bootstrap | A-003:369; A-004:453 — *"materially more important — management is now the publisher"* | — | **No RPC, no seed, no procedure.** `membership.bootstrap` is a **reserved audit-action name with zero emitters**. `invitations` has zero policies, zero grants, no RPC | D-243/D-251: fixtures explicitly do **not** discharge it | **OPEN. Non-blocking locally (the fixture supplies the identity); ABSOLUTELY BLOCKING for hosted go-live** — a fresh hosted instance would have no management login, so no report could ever reach `submitted` | **PA-OD-3** |
| **G-9** | CP-3 management review-queue read path | `48H_BACKEND_PROGRESS.md:75` — *"FULLY RESOLVED at Round B2.1"* | `STATUS.md:114, 536` — "OPEN" | R-6, R-7 and a submitted list all implemented in `management-view/projections.ts`; migration `20260806103000` present | Round B2.1, 2026-08-05 | **CLOSED. `STATUS.md` is stale.** *(Its two new functions ride on PA-OD-1.)* | **R** |
| **G-10** | U-06 / screen-plan OD-4 panel headings | `CLAUDE.md:283`; A-004:448 — the four panels *"are also the exact management wording-edit allow-list"* | Figma frames draw Overview / Strengths / **Areas for Development** / Remarks *(the tree is internally inconsistent: **three** packs read "Areas to Grow" — `Management - Student Report.md:11`, `Trainer - AI Report Generation.md:14`, `Management - Term Report.md:11` — against **two** reading "Areas for Development". **`Areas for Development` is the ratified label.** See the OD-4 ruling §1.3. **Corrected after review — an earlier draft of this cell said "two packs", which was the wrong figure and the wrong side.)*** | `report-panel-config.ts` ships the governed four; deviation recorded in three source files | Raised 3×, never adjudicated | ~~**KEEP THE GOVERNED FOUR — evidence-resolvable.** … **Adopting the frame would be an amendment, not an adjudication** — and A-053's precedent shows it becomes *permanently impossible* once any `report_versions` row exists. **Rule it now while the table is empty**~~ ⚠️ **SUPERSEDED 2026-08-07 BY OPERATOR RULING OD-4.** The operator ratified **Overview · Strengths · Areas for Development · Remarks** as the Final MVP report semantics; the old four are **SUPERSEDED_BY_OD-4_FINAL_REPORT_MODEL**. **This row's reasoning was sound and is discharged, not overruled**: it correctly held that adopting the frame *"would be an amendment, not an adjudication"* — and an explicit operator ruling is exactly the instrument that supplies it. It was ruled **inside the time-box, while `report_versions` was still empty**, which is what this row asked for. See `FINAL_MVP_OD4_REPORT_SEMANTICS_RULING.md` and Authority Lock §15.1 | ~~**R**~~ → **OD — RULED** |
| **G-11** | U-25 eight blocked design families | Figma matrix §0.1; A-004:466 | — | **Six of eight are BUILT to governance without a frame** (queue, final review, wording editor, return dialog, correction tracking, Approve & Submit). Families 7–8 (notifications) absent, correctly, pending U-31 | *"must not be invented"* | **Record as: governed behaviour complete for families 1–6, visually unaccepted; 7–8 not built.** Nothing was invented — no node ID, no field. Designs must come from the operator | **PA-OD-5** |
| **G-12** | U-29 post-submission correction by management | A-004:470 — *"decided by no source and deliberately not invented"* | — | `report_reopen_submitted` guard requires `role = 'trainer' AND status = 'active'` + `app_trainer_reaches_session`. Management cannot reopen by any path | Deferred, reaffirmed at 7I1D-R2 | **Correctly deferred, non-blocking. Do not add** | **R** |
| **G-13** | U-20 · U-21 · U-22 · U-24 · U-28 · U-30 · U-31 | A-003:366-370; A-004:469-472 | — | **U-30 CLOSED** (`assessment_get_trainer_observation` implemented); **U-22/U-24/U-28 resolved-by-design**; **U-20/U-21/U-31 open** | — | Record U-30 closed. U-21's "Start Class"→"Open Class Roster" relabel is the **correct governed response — do not revert**. U-31 blocks U-25 families 7–8 | **R** *(U-31 → PA-OD-5)* |
| **G-14** | B.E.S.T acronym gloss | spec §3.6 item 1 + Appendix C:771 — *"pending client ratification"*; `CLAUDE.md:186`, `:543` | Term Report glosses it *Body Language · Emotions · Structure · Tonality* | **The nine dimension names are RATIFIED and agree exactly** across the `dimension_code` enum, the 9 seed rows, and `dimensions.ts` — name, group and ordinal | **Nothing ratifies the gloss.** Zero hits across all six amendments, the D-register, every run report, and the screen packs | **The gloss is unratified and separable — it touches zero enum labels, zero seed rows, zero columns, zero RPCs and zero screens.** Its only live dependency is the out-of-scope Term Report and external-facing prose. `CLAUDE.md:186`: *"The spec's proposed defaults **are fine to build against**"* | **PA-OD-4** |
| **G-15** | "Columns not quantity" trade | `CLAUDE.md:17`; A-004:119 — *"there is no narrower column set to allow-list"* | — | RPC signature is the allow-list; nine ratings copied verbatim; parity re-verified at submission | Ratified twice, independently | **A ratified accepted limitation, not a defect.** Answer any reviewer with A-004:119, never with a code change. Widening or narrowing is a stop-and-ask | **R** |
| **G-16** | GCP vs spec §19 | spec:518 — *"Vercel (Singapore) **or** Cloud Run `asia-southeast1`"* | Audit instruction says GCP | No deployment config of any kind exists | — | **`GCP` and `Google Cloud` appear ZERO times in all governance.** An unverified instruction must not override a ratified either/or | **PA-OD-7** |
| **G-17** | Submission brief | — | — | **No brief, rubric or deliverables list exists in the workspace.** Zero PDF/DOCX/PPTX anywhere; nothing ever added-then-deleted in 121 commits | — | **Not ingested — NOT proven non-existent.** Only 6 of 19 requirements have a canonical source, and all six are infrastructure. **Zero submission-artefact requirements are canonically sourced** | **Blocks lock §17** |
| **G-18** | AUTH-01 SPORTSTER contamination | — | — | 1,792 B of foreign coursework at `AUTH-01/SCREENSHOT_REQUIRED.txt`, SHA `30d7ba77…`. **The only copy in existence** — absent from both git repositories and both worktrees, no `.bak`, not under OneDrive | — | `REQUIRES_OPERATOR_DECISION`. The B.E.S.T content is 100% reconstructible (node `546:370`); the SPORTSTER content is **irreplaceable** | **Part of PA-OD-8** |

---

## 3. 🔴 OPERATOR DECISION GATE

**Seven rulings. Three block the authority lock** (`PA-OD-2`, `PA-OD-7`, and the un-ingested brief). `PA-OD-4` and `PA-OD-6` were withdrawn after review as manufactured; `PA-OD-9` was added as a genuinely required decision that had been omitted.

**Live:** `PA-OD-1` (authorization attestation) · `PA-OD-2` (evidence media) · `PA-OD-3` (management bootstrap) · `PA-OD-5` + `PA-OD-5b` (designs, wordmark) · `PA-OD-7` (deployment target) · `PA-OD-8` (AUTH-01 contamination) · `PA-OD-9` (hosted transport).

### PA-OD-1 — Retroactive authorization attestation for Step 7I onward *(BLOCKS THE LOCK)*

**Question.** Do you attest that the Step 7I2A…7I2G implementation, Backend Rounds B1/B2/B2.1, **the Amendment 006 A-053 / V2 vocabulary-rename execution**, and the Run C2 migrations were authorized — and do you additively ratify the **six functions created beyond the Step 7I design baseline's ratified 28-function inventory**?

The six: `assessment_save_observation` · `assessment_get_trainer_observation` · `report_list_management_corrections` · `report_resolve_context` · `assessment_save_complete_and_open_report` · `report_list_management_submitted`.

> ⚠️ **Corrected 2026-08-07 — the instrument was anchored to the wrong clause.** An earlier draft said "beyond **A-040**'s exhaustive list". That is a category error: **A-040:411 states verbatim *"Functions are outside this clause"*** and assigns the function inventory to the Step 7I design baseline instead. Signed as originally drafted, you would have ratified against a clause that expressly disclaims jurisdiction. The binding inventory is the Step 7I baseline's **28 functions** (asserted in-source at `…7i_report_lifecycle.sql:3323`); the live count is 34.
>
> ⚠️ **Also widened.** The A-053 vocabulary rename was omitted from the original list. D-316 confined it to a plan whose **V2, V3 and V4 checkpoints each require separate authorization**, and no record of that authorization exists — so it is a separate unrecorded checkpoint execution, not part of Round B1/B2.

**Why evidence cannot settle it.** Every governing document says implementation requires its own authorization and **none records one being given**. The D-register holds exactly 317 rows ending at D-317; a repo-wide grep for `7I2A` returns **only prohibitions, never a grant**.

**Honest framing, corrected.** The original draft called this *"in-scope, not a scope breach"* on the strength of the two 7I files matching A-040. Per the correction above, **A-040 never governed the objects actually at issue**, and for the six post-7I functions there is **no ratified inventory to compare against at all**. The accurate statement is: **in-scope by inspection, unratified by instrument, and for at least one migration (the A-053 rename) the checkpoint authorization itself is unrecorded.** Nothing needs reverting — but the exculpatory case is weaker than first stated.

- **Recommended:** attest, and issue one additive instrument naming the six functions and resetting the census to **12 migrations / 26 tables / 34 functions / 29 policies / 12 enums**.
- **A — Attest and ratify additively.** The lock can then claim a complete chain. No code changes. *(Recommended.)*
- **B — Decline to attest.** The six functions become unratified objects in a shipped schema; the lock cannot honestly assert an authorization chain; a remediation checkpoint would be required before any submission claim about governance rigour.
- **Affected:** `CLAUDE.md` §1/§6.1/§10/§11/§12 · Implementation Plan:19 · `STATUS.md` · the D-register. **No screens. No code. No DB change.**

### PA-OD-2 — A-014: evidence media *(BLOCKS THE LOCK §11/§15)*

**Question.** (i) Is evidence media an MVP completion requirement? (ii) If yes, who uploads it, now the TA flow is deferred?

**Why evidence cannot settle it.** `CLAUDE.md:59` explicitly forbids an agent from choosing: *"Do **not** invent a replacement uploader and do **not** silently transfer TA evidence-upload permissions to management or trainer."*

- **Recommended:** **(i) No** for this MVP — keep evidence out, safeguards armed.
- **A — Not required.** Current state is already correct and complete. **But note:** `CLAUDE.md` §6's Class Health Summary conditions 1 and 3 count "evidence missing", so they become **unimplementable as written** and need re-derivation (an amendment).
- **B — Required.** Opens Phase 2: a table, a private bucket, `scan_status`, short-TTL signed URLs, consent gating, and **a ratified uploader role** — which is the unresolved part.
- **Affected:** screens 08, 10, 33 · `/server/modules/evidence` (correctly absent) · Class Health Summary · the `evidence_media` consent scope.

### PA-OD-3 — N-4 production management bootstrap *(blocks hosted go-live, not the local MVP)*

**Question.** How is the first management membership created in a hosted environment?

**Why evidence cannot settle it.** No RPC, seed or procedure exists. `membership.bootstrap` is a reserved audit-action name with zero emitters — 7H pre-carved the audit shape and **decided nothing else**. Fixtures explicitly do not discharge it (D-243/D-251).

**Consequence if unresolved:** a freshly-deployed hosted instance has **no management login → no report can reach `submitted` → no parent sees anything.** Under Amendment 004 management is the sole publisher, so this is a total functional stop, not an inconvenience.

- **Recommended:** a `SECURITY DEFINER` bootstrap RPC gated on *zero existing active management membership*, emitting `membership.bootstrap`, invoked once by an operator at an interactive terminal.
- **A — Bootstrap RPC** (above). Auditable, repeatable, fits the reserved slot. Requires a new function → beyond A-040 → needs the PA-OD-1 instrument.
- **B — Privileged one-shot migration seed.** Simplest; but seeds assert-and-fail on divergence by design, and a credential cannot be seeded under `CLAUDE.md` §11.
- **C — Out-of-band operator SQL runbook.** No new object; least auditable; leaves `membership.bootstrap` permanently unemitted.
- **Constraint on all three:** `CLAUDE.md` §11 permits credentials **only** through a no-echo interactive prompt on an operator-controlled terminal — **so hosted provisioning can never be a pipeline step**, under any option.

### ~~PA-OD-4~~ — B.E.S.T acronym gloss — **WITHDRAWN 2026-08-07; RESOLVED FROM EVIDENCE**

**This was a manufactured operator decision and is withdrawn.** Adversarial review established that ratified text already settles everything the MVP depends on:

- `CLAUDE.md:186` — *"The spec's proposed defaults **are fine to build against**"*, provided they are not presented as settled client decisions.
- `CLAUDE.md:543` fires a stop-and-ask **only** when a §3.6 item *"needs to be treated as **final** rather than provisional"* — which locking it *as provisional* does not do.
- The recommended option was a **verbatim restatement of ratified text** (spec:172, Appendix C:771), so it required no ruling.
- The alternative — hold for client ratification — **was never the operator's to give.** §3.6 items await the *client's* ratification, and the operator is not the client. The question offered one already-ratified answer and one the addressee lacks authority to give.

**Ruling (R):** lock §9 records **Body · Emotion · Speech · Tonality**, explicitly labelled *"proposed canonical, pending client ratification (spec §3.6)"*. The **nine dimension names are separately and fully ratified** and verified identical across the `dimension_code` enum, the nine seed rows and `dimensions.ts`. **Zero code impact under any outcome.** This is no longer a lock blocker.

<details><summary>Original question, retained for the record</summary>

**Question.** For the Final MVP, is the four-pillar gloss locked as **Body · Emotion · Speech · Tonality** (explicitly provisional), or held pending external client ratification?

**Why evidence cannot settle it.** Spec §3.6 frames it as *"a decision for the client to confirm"*; no instrument anywhere ratifies it. **But `CLAUDE.md:186` already permits building against the proposed default** — what it forbids is presenting it as settled.

**Scope, precisely.** The **nine dimension names are ratified** and verified identical across the enum, the seed rows and `dimensions.ts`. The competing gloss belongs solely to the **out-of-scope** Term Report. **Either outcome changes zero code.**

- **Recommended:** **A — Lock as provisional.** Record *Body · Emotion · Speech · Tonality*, explicitly labelled "proposed canonical, pending client ratification", per `CLAUDE.md:186`. This satisfies the lock without asserting a client decision.
- **B — Hold the lock** pending the academy's ratification. Blocks Phase A2 indefinitely for a question that gates no MVP artefact.
- **Affected:** external prose only — final report, Google Site, video narration. **No screen, no RPC, no schema.**

</details>

### PA-OD-5 — U-25: the eight blocked design families *(blocks visual acceptance, not the lock)*

**Question.** Will you supply the eight designs, or accept the six built-to-governance surfaces as visually unaccepted for submission?

Six of eight are **already implemented correctly without a frame** — nothing was invented. Families 7–8 (notifications) are absent pending U-31. Per the Figma matrix §0.1 these *"must be produced by the orchestrator — they may not be inferred, improvised, or assembled from other screens."* **Six are exercised by the demo walkthrough**, so this is the entire management half of the story.

- **A — Supply designs.** Enables full visual acceptance.
- **B — Accept as-is, disclosed.** Ship with governed-but-unaccepted visuals and state it. *(Recommended given time constraints.)*
- Also here: **PA-OD-5b — the academy raster wordmark** on all three AUTH login frames has no `PORT` / `REFERENCE ONLY` / `REBUILD` / `REJECT` disposition, and `GLOBAL_UI_RULES.md` §8 conditions **both** porting it **and** re-drawing it on a recorded disposition (`:125`, `:127`). *(Corrected: an earlier draft called both workarounds "prohibited" outright — they are conditional, not absolute. §8 does not create a deadlock; it names the single unlock, which is exactly the action recommended here.)* All three AUTH packs stay blocked until you record one.

### ~~PA-OD-6~~ — `report_source_map` — **WITHDRAWN 2026-08-07; RESOLVED FROM EVIDENCE**

**Also a manufactured decision.** The original ruling said it *"uniquely among absent tables has no deferral clause and no owner"*. That was reached by checking §6.1's exclusion register and all six amendments — but **not the ratified Step 7I design baseline, which is where the disposition actually lives.**

`docs/plan/STEP_7I_REPORT_LIFECYCLE_BASELINE.md:770` (ratified with R-1…R-33 at **D-287**) registers it as item **U-7I-12**, assigns the owner column *"The compare-with-notes / AI checkpoint"*, and marks it **blocking: No**.

**Ruling (R):** the gap is **already registered, already owned and already ruled non-blocking**. Record the pointer in §6.1 so it is findable from the table inventory; do not build. *(Note the row's own prose does say the table "has no owner" — that refers to the table's absence from the ratified inventory, while the row itself carries the checkpoint assignment. Both readings agree on the outcome: deferred, non-blocking.)* **No longer a lock blocker.**

*(Secondary correction: the claim that `CLAUDE.md:458` "names it" was loose — `:458` names the **capability** "compare-with-notes via source map"; the token `report_source_map` appears in `CLAUDE.md` zero times. Corrected in the readiness plan too.)*

### PA-OD-9 — Hosted draft-storage transport *(NEW — added 2026-08-07; blocks Track 6)*

**Question.** Which replacement transport for `report_store_draft` do you authorize?

**Why this is a required decision and was wrongly omitted.** §6 states that **every** candidate replacement trips at least one `CLAUDE.md` §12 stop-and-ask — and a stop-and-ask *is* an operator decision. The original gate claimed to be complete and "minimised" while leaving this unlisted, so **Track 6's prerequisites were wrong and it could not have started when claimed.**

Verified constraints: `report_store_draft` holds **zero client EXECUTE** (`REVOKE ALL` at `…7i_report_lifecycle.sql:3031`, no matching GRANT; `:1010` — *"NO LATER CHECKPOINT MAY GRANT EXECUTE ON THIS FUNCTION"*), and the only path spawns `docker` (`trusted-store.ts:11, 25, 122`).

| Option | Trips | Note |
|---|---|---|
| **A — Definer-chain wrapper** | R-27 in substance | A client-callable wrapper taking four arbitrary text fields is materially the surface R-27 exists to close |
| **B — Grounding-proof token** | New schema object beyond the ratified inventory | Adds a signing secret and replay/TTL correctness as governance-critical controls |
| **C — Privileged worker with a `postgres` connection** | `CLAUDE.md` §11 credential rules | Introduces a superuser credential into application-reachable config — the largest new risk |
| **D — Grounding moved into the database** | R-27 explicitly | Strongest structurally; requires porting A-052 contextual detection to SQL, and duplicated grounding logic is its own defect class |
| **E — Do not deploy the AI draft step** | Nothing | The honest zero-risk baseline to price the others against |

**No recommendation offered** — each option reopens a different ratified control, and that trade is yours.

### PA-OD-7 — Deployment target: GCP vs spec §19 *(BLOCKS THE LOCK §16)*

**Question.** Is the deployment target **GCP Cloud Run `asia-southeast1`**, or **Vercel (Singapore)**?

**Why evidence cannot settle it.** `GCP`/`Google Cloud` appear **zero times** in `CLAUDE.md`, the spec, any amendment or the Implementation Plan. The sole ratified statement is spec:518's either/or. GCP comes only from the audit instruction — an unverified source that would override a ratified ADR.

- **A — Cloud Run `asia-southeast1`.** Satisfies ADR-6; needs `output: "standalone"`, a container and a build pipeline.
- **B — Vercel (Singapore).** Also ratified, materially less work, no container. *(Recommended unless the brief mandates GCP.)*
- **Either way ADR-6 binds the region for database, storage AND compute**, and getting it wrong means re-provisioning, not reconfiguring.

### PA-OD-8 — AUTH-01 contamination and the foreign-artefact sweep

**Question.** (i) Where should the SPORTSTER coursework be preserved? (ii) May the AUTH-01 placeholder then be reconstructed? (iii) Is `00-PeakPalate-Master.mp4` yours from another module?

**Why evidence cannot settle it.** The SPORTSTER text is the **only copy in existence** in this workspace — not in any of the four git repos, no `.bak`, not under OneDrive. Overwriting it destroys your work for another module.

**Mandatory order — do not reverse:**
1. Copy the file to **two** locations you choose, on **different volumes**, both **outside** the pack. Then compute SHA-256 **of each copy** and confirm each equals `30d7ba77cf0559a34725472729f7ae727d108ff565ed6e6c6e2893db0d3c993a`. **Do not proceed until both copies verify** — verifying the *source* proves nothing.
2. Confirm whether a fuller original exists elsewhere (it may have a canonical home in another module's folder).
3. Only then reconstruct the placeholder **by content, not by size**: node `546:370` and the `/design/…node-id=546-370&m=dev` URL from `UI_PACK_MANIFEST.json:156-157`, the role/route/priority from `SCREEN_INDEX.md:30`, and the surrounding template copied from `AUTH-02-management-login/SCREENSHOT_REQUIRED.txt`, reproducing the stale `Missing - …` trailer verbatim. *(An earlier draft named a 842-byte target; that figure is unverifiable — the 36 placeholders range 833–914 B and none is 842. Do not treat any byte count as an acceptance criterion.)*
4. Record in `CHANGE_LOG.md`; close R1.

**Blocking note — corrected 2026-08-07.** An earlier draft justified the cleanup freeze on the claim that this file has *"the newest mtime in the entire pack"*. **That is false, and it was falsified by this audit's own writes.** It is the fifth-newest: `FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md` (19:00), `UI_REFERENCE_CLEANUP_MANIFEST.md` (18:54), `AUTONOMOUS_48H_EXECUTION_TRACKER.md` (13:05) and `_checkpoint-evidence/F17/gate-ledger.md` (07:17) are all newer.

**The freeze still stands, on the correct ground: irreplaceability.** The contaminated file is the only copy of that coursework in existence here — absent from both git repositories and both worktrees, no `.bak`, and `UI_REFERENCE_FINAL_MVP` is outside version control entirely. **No automated cleanup may run over `UI_REFERENCE_FINAL_MVP` until R1 closes**, because a single wrong deletion is unrecoverable — not because of any timestamp heuristic.

**⚠️ The freeze must extend beyond the pack.** `00-PeakPalate-Master.mp4` (58,387,212 B) sits at the **workspace root**, not inside `UI_REFERENCE_FINAL_MVP`, and is equally unbacked and equally likely to be foreign-module work. A root-level sweep would destroy it while fully complying with a pack-scoped freeze. **Until (iii) is answered, no automated cleanup may run anywhere in the workspace — pack or root.**

`AUTH-01/reference.png` is unaffected — all 12 frozen references were re-hashed and match their manifest values exactly (12/12).

### PA-OD-10 — Where participant consent and retention data lives *(NEW — added 2026-08-07; blocks Track 8 sessions, not recruitment)*

**Question.** Confirm that usability-participant consent records, session recordings and retention scheduling live **entirely outside the product** — in your own files — and never in the application database.

**Why it needs a ruling.** Track 8 was originally marked *"gated on nothing"*, but it collides with two ratified rules: **ADR-6** (`CLAUDE.md:74`, `:493`) — *"synthetic/seed data only… **never** real student data… even in local development"* — and **G-1**, which rules `consent_records` / `retention_policies` / `erasure_requests` **must not be built**. A real human-subjects study generates exactly the consent and retention data those tables would have held. Without an explicit ruling, an implementer could reasonably conclude the study needs them and trip a §12 stop-and-ask.

- **Recommended: A — out of product.** Consent forms, recordings and the retention schedule live in your own storage. The application sees only the ratified synthetic fixture; **no participant data ever enters it**; PDPA obligations stay dormant exactly as ADR-6 intends. Zero code, zero schema.
- **B — in product.** Would require the three PDPA tables, contradicting G-1 and §6.1. **Not recommended.**

**Recruitment, protocol drafting, consent-form authoring and task design are unaffected and remain gated on nothing.** Only running sessions depends on this.

**Note:** Track 1's **A-018 attendance toggle** decision (build the write path, or drop task T3 and disclose) also had no OD. It is folded into `PA-OD-2`'s scope, since both concern whether a ratified-but-unbuilt capability is completed or formally descoped.

### Not an operator decision, but the highest-value action available

**Obtain the submission brief (G-17).** Only 6 of 19 requirements have a canonical source and **every one is infrastructure** — Singapore region, dev/staging/prod, secrets, UAT scope, blueprint fidelity, hosted Supabase. **Not a single submission artefact** (README, Google Site, report, video, deck, public URL, GitHub Classroom) has any canonical source. The brief is **not ingested**; it is almost certainly not non-existent.

---

## 4. Governance corrections — EIGHT APPLIED, TWO HELD

An earlier draft held **all eleven** corrections pending PA-OD-1. **Adversarial review found that to be over-application and a failure to do permitted work**, and it was right: Phase A expressly permitted reconciling `CLAUDE.md` *"where evidence establishes the final ruling"*, and six of the corrections are pure stale-fact reconciliations whose rulings are marked **R** in §2. Correcting a clause that says Step 7F *"remains unauthorized and unstarted"*, when `STATUS.md:48` records it **Accepted** with a bounded authorization, is not silent reconciliation — it is flagged, evidenced and ruled.

**Method: annotate, never delete.** Every correction strikes the stale text, preserves it inline as a historical record, names the Phase A ruling that supersedes it, and dates it. No history was rewritten.

**Only C-4 and C-5 remain held**, because their replacement authority genuinely is PA-OD-1 and applying them first would assert an authorization chain that does not yet exist.

| # | File / line | Current (stale) | Correction | Gate |
|---|---|---|---|---|
| C-1 | `CLAUDE.md:98` | PDPA tables *"exist from the Phase 0 schema"* | *"PDPA enforcement (consent, retention, erasure) is **Phase 4**. **No PDPA table exists** in the ratified §6.1 inventory and none may be created without an amendment. ADR-6's synthetic-data-only rule keeps the obligation dormant meanwhile."* | ✅ **APPLIED** — G-1 |
| C-2 | `CLAUDE.md:294, 296` | *"Exactly 10 enums" / "Exactly 22 tables"* | Annotate: live census is **12 enums / 26 tables**, via A-040 (+2 enums, +1 table) and Step 7H (+3 audit tables) — as the same §6.1 paragraph at `:292` already records | ✅ **APPLIED** (both count sentences) |
| C-3 | `CLAUDE.md:292, 452, 501, 43, 540` | Step 7F *"remains unauthorized and unstarted"* | Mark **HISTORICAL — superseded**; Step 7F completed and runtime-accepted 2026-08-03 (`e197f91`), authorization bounded to 7F alone | ✅ **APPLIED** at CLAUDE.md:501, the one ACTIVE prohibition. The four registry/historical mentions are left intact as historical record |
| C-4 | `CLAUDE.md:35`; `Implementation_Plan:19`; `STATUS.md:59, 167, 171` | Step 7I *"remains unstarted and unauthorized"* | Reconcile to the 12-migration reality | ⏸️ **HELD — blocked on PA-OD-1** |
| C-5 | `STATUS.md:24` (body) | *"assessment writes, report lifecycle… are **not started**"* | Reconcile. Note `STATUS.md`'s **header entries are current**; only the static body below them is frozen at the 2026-08-05 checkpoint | ⏸️ **HELD — blocked on PA-OD-1** |
| C-6 | `STATUS.md:114, 536` | CP-3 *"OPEN"* | **CLOSED at Round B2.1**; `report_list_management_corrections` present at HEAD | ✅ **APPLIED** at both STATUS.md:114 and :536 |
| C-7 | `STATUS.md:115` | U-30 open | **CLOSED** — `assessment_get_trainer_observation` implemented | ✅ **APPLIED.** *(Quote corrected: STATUS.md:115 does not say "U-30 open" — it says CP-4 "RESOLVED BY DESIGN... No implementation exists". The stale element was the latter)* |
| C-8 | `Implementation_Plan:470` | *"all **four** UAT scripts"* | **Three** — A-024 removes TA as an MVP UAT gate; contradicts its own `:41`/`:447` | ✅ **APPLIED** |
| C-9 | `supabase/config.toml:66-71` | `[db.seed] enabled = true` → non-existent `seed.sql` | Set `enabled = false` with a comment that fixture loading is an explicit operator action under §11. **A latent trap:** §11 and §12 forbid creating `supabase/seed.sql`, yet the config would auto-execute it if one ever appeared | Ready — config change, needs authorization |
| C-10 | `CORE_SCREENSHOT_VALIDATION_REPORT.md:47, 295` | *"human-equivalent usability judgement"*; §8 *"Visual usability validation summary"* | *"automated visual inspection of the rendered image — **no human observer was involved**"*; retitle to *"Visual reference-fidelity summary"* | **Ready — highest integrity priority** |
| C-11 | Packs `30-parent-dashboard/` and `31-parent-calendar/` `implementation-notes.md` | **No conflict recorded at all** | Record the prohibited-content conflicts itemised in §5 | **Ready — highest leverage** |

**Applied this phase** (my own planning documents only): policy count 30→29 in both plans · `report_source_map` added as §3.2 item 5a · the foreign-artefact timeline correction in the cleanup manifest · PA-OD-1 restated as "recorded, awaiting ruling" · the GCP escalation note.

---

## 5. Screen-governance rulings

**Authority model applied — the ratified TWO ladders (A-045), never a flat order.** Visual: frozen `reference.png` → node-specific Figma → implementation. Functional/security/privacy: spec + amendments → `CLAUDE.md` → baselines → contract → Figma. **Neither `screen.md` nor the HTML holds a rank in either — but for different reasons, and the earlier one-citation shortcut was wrong.**
- `screen.md`: `GLOBAL_UI_RULES.md:3` — *"A per-screen `screen.md` may add detail; it may never weaken anything here."* That **constrains** it; it does not de-rank it. Where `screen.md` appears decisive below, it is decisive because it **restates a ratified rule**, never on its own footing.
- The `reference/<Screen Name>/*.html|md|png` triples: **`GLOBAL_UI_RULES.md:3` says nothing about them.** The only `html` mention in that file is `:108`, an accessibility rule about authored markup. **These triples hold no rank under A-045 or GLOBAL_UI_RULES and are unrecorded in the governance set.** They are treated here as **evidence of design intent, not as authority** — which matters because packs 30 and 31 have no frozen `reference.png`, so the prohibited content in §5 is sourced *entirely* from this ungoverned class. **The governance status of the `reference/` tree is itself an open item** (carried as R2 in the cleanup manifest).

| Screen | Finding | Ladder | Ruling |
|---|---|---|---|
| **31 Parent Calendar** | Publishes the **verbatim ratified enum labels** with a four-level explanatory legend ("Just starting — needs support" … "Excelling and independent"), per-day rating colouring, per-level counters, and "13 mastered days" | **Functional/privacy** | **Governance overrides. Most severe exposure in the set.** Build as a class-session projection only. Omit the legend, counters, colouring, counts and dimension chips. **Do not freeze `reference.png` from the current frame** — that would install prohibited content at visual rank 1 |
| **30 Parent Dashboard** | "This Term's Skills" — **nine rows, one per dimension**, each a proportional fill with a band colour token. A rating grid twice over: magnitude and band | **Functional/privacy** | **Governance overrides.** A-048 says *"in any form or wording"* — **a bar chart is a form.** Not implemented as bars, radar, percentages or word-bands |
| **32 / 33 Parent** | Frozen PNGs carry prohibited elements (aggregate chips; PERFORMANCE SUMMARY; "Overall Grade"; prose rating attributions; "Watch Together" video) | **Functional/privacy** | **Already correct in code, itemised and clause-pinned.** This is the model for 30/31. ⚠️ **Corrected:** an earlier draft invented a *"rank-1-vs-rank-1 resolves by scope"* doctrine. **A-045 supplies an explicit tie-break and needs no doctrine** — *"Where a frame and a ratified rule disagree, **the ratified rule wins and the discrepancy is recorded**."* There is also no genuine rank-1 collision: the two ladders answer different question types, so a frozen PNG and A-048 never contend for the same rank |
| **11/15/16/17/18/28 Management** | Six frames render raw per-dimension ratings, band distributions, `Overall` columns and Strongest/Focus-area columns **to Management** | **Functional/privacy** | **Governance overrides (A-038).** No management surface renders a rating token. Statistics screens permit **completion and attendance aggregates only** |
| **13 Class Overview** | Status-agnostic `Stats ›` on **every** row including "Not started"; **and** the mandated Class Health Summary is absent from the frame | **Functional** | **Both directions.** Per-row status gating per A-038's exact mapping — never one shared handler. Build the Class Health Summary to its literal four-condition table. *(Conditions 1 and 3 count "evidence missing" → blocked on PA-OD-2.)* |
| **16 Class Statistics** | The **most inverted screen in the pack** — everything drawn is prohibited; the mandated "Management Insight" three-slot deterministic template and "Students Needing Follow-up" are undrawn | **Functional** | Implement the literal template. **No LLM, ever** — expanding it silently pulls the deferred Weekly Class Health Brief into scope |
| **24 Add Trainer** | A **"Role" dropdown** offering **"Assistant Trainer"** | **Functional/security** | **Prohibited — but re-attributed.** An earlier draft cited A-020/A-025 *"never put a role on the identity row"*; that prohibits a `role` **column on `accounts`**, not a selector on a creation form (a governed create-account-plus-membership flow legitimately picks a `centre_memberships.role`). The **actual** grounds are narrower and stronger: **`Assistant Trainer` is not a member of `centre_membership_role`**, a closed three-value enum (`management`/`trainer`/`parent`) — a value may never be created from a frame (A-025/A-026) — and **TA is a deferred persona** (A-014). On a screen named *Add Trainer* the role is determined anyway, so the selector is also redundant. Blocked on **three** grounds: this, the unresolved field inventory, and the absent invitation write path |
| **28 Term Report** | Renders **4 of 9 session dimensions on the 4-level session scale** — the term instrument is **7 criteria on Excellent/Good/Needs Improvement**. Plus an audience toggle, "Save as draft", and a live "Generate Term Report" entry point on pack 18 | **Functional** | **Not implemented. Ruled out, not merely deferred.** `REFERENCE ONLY` at most. Pack 18's button must be absent or inert |
| **29 Management Reports** | Status column reads **"Approved"** — a status with an **empty referent**, since `approved` never commits (A-036) | **Functional** | ⚠️ **Reclassified: ALREADY DISCHARGED, not open.** `29-management-reports/implementation-notes.md:274-280` records it verbatim — *"That is Figma mock data and is NOT the ratified lifecycle. 'Approved' is transient-in-transaction and NEVER commits (A-036)"* — with the ratified replacements named. Pack 29 is in exactly the state credited to 32/33. **NEW and genuinely open, however:** `reference/Management - Reports/…md` and `…Term Report/…md` both assert *"only Management may edit a report after it has been sent to a Parent"* — which **contradicts A-028/A-035** (a submitted version never reopens; the sole exit is `needs_edit`, creating a new version). That frame-level assertion is recorded nowhere |
| **23 / 25 / 22** | "On leave" (not a `centre_membership_status` value) · "Showcase" event type (A-016 forbids a duplicated event table) · "undone within 30 days" (unratified retention) | **Functional** | All three: do not schema a value from a frame |
| **AUTH-01/02/03** | One shell serving three role-query routes | — | **Ratified and correct** (A-046). Role query is presentation-only; three visual references do not merge. Implementation whitelists `?role=` against `AUTH_ROLES` and falls back — an arbitrary value cannot even change presentation |
| **Auth 04** | Fully designed, **no pack, no inventory ID, no node ID** | — | **Recommended: does NOT become a 37th screen.** No node ID (may not be invented); password recovery is a Supabase Auth flow expressly outside Figma's authority; changing the ratified 36 requires an amendment. Keep the control inert, deviation recorded |

**Parent projection — verified clean.** Grep across `features/parent/` for `rating|dimension|hash|revision|correction|trainer_note|evidence` returns **only the deviation-record comments** — zero live references. All three parent surfaces are free of taxonomy, ratings in any form, derived facts, trainer notes, evidence, management controls, pre-submission content, correction disclosure, content hash and revision number.

---

## 6. Readiness summary

**Local Supabase — READY.** Full Docker stack real and running; 12 migrations; 26 tables all RLS-enabled; 29 SELECT-only policies with **zero DML policies anywhere**; 34 functions (25 client-callable, 9 owner-only); password auth; SHA-256 audit chain with demonstrated tamper detection; the two-stage governed lifecycle proven end-to-end by Run C4.

**Hosted Supabase — BLOCKED, in this severity order** *(re-ranked after review: the transport now outranks N-4)*:
1. **`docker exec` transport (`PA-OD-9`)** — `report_store_draft` holds zero client EXECUTE by design (R-27); the only path spawns `docker` into a local container. **Five independent fatal reasons hosted.** It ranks first because it stops the flow at RPC-4 — **no draft can be stored, so nothing downstream exists to submit** — and because **every** replacement trips a §12 stop-and-ask, making it strictly *less* resolvable than N-4. It also forces the entire usability study onto the local stack.
2. **N-4 management bootstrap (`PA-OD-3`)** — no path to a first management membership; a hosted instance is functionally dead. Ranked second because it stops the flow at the **last** leg and already has a recommended, auditable answer.
3. 🔴 **P-1 ownership guard — INCOMPLETE, and this is a new unreported finding.** An earlier draft asserted *"every migration aborts unless `current_user = 'postgres'`… aborts on migration #1"*. **Both halves are false.** Only **10 of 12** migrations carry the guard:

   | Guard occurrences | Migration |
   |---:|---|
   | **0** | `20260803034500_step_7e_governed_core.sql` ← **migration #1** |
   | **0** | `20260806160000_competency_vocabulary_rename.sql` |
   | 1–2 | the other ten |

   P-1 was introduced at Step 7G (`…7g…:40-59`), *after* the core migration. **Migration #1 would therefore apply in full under `supabase_admin`** — all 22 core tables, 10 enums and 13 seed rows — and the first abort is at **#2**. The vocabulary rename is likewise unguarded, which is doubly notable because its checkpoint authorization is also unrecorded (`PA-OD-1`).

   **The derived hazard was also overstated.** `7e:47-51` runs `ALTER DEFAULT PRIVILEGES … REVOKE ALL … FROM PUBLIC, anon, authenticated, service_role` **before** the first `CREATE TABLE` at `:153`, and `7e:1163-1186` explicitly `REVOKE ALL` on all 22 tables, with `7h:260-264` and `7i:370` covering the other four. So the exposure is **not** "ALL on all 26 tables" — it is scoped to objects created before the default-ACL revoke and to anything lacking an explicit REVOKE. Real, but narrow.

   No down-migrations exist; the audit chain is unremovable; hosted migration is **forward-only, one-shot, on a fresh project**.
4. **Fixture-credential rule** — §11 forbids every unattended seeding mechanism, so hosted provisioning can never be a pipeline step.
5. **Singapore region** — unpinned on every leg; `config.toml` structurally cannot express it; orchestrator-only, one-shot, non-recoverable at project creation.
6. **`next.config.ts` empty** — no CSP, no security headers, no `output: "standalone"`.
7. **dev/staging/prod** — two *local* profiles, zero hosted projects.
8. **Production secrets** — six variables structurally well-validated, but `env.ts:10-12` disclaims any proof the credentials bind to the selected project; no secret manager, no rotation, no CI leak gate.

**Usability — the largest gap, and it is total.** Zero human usability, UAT or human-subjects evidence exists anywhere. The only human action in the entire corpus is the operator typing three fixture passwords and two AI confirmation phrases — an administrative act yielding **no** usability data. A-024 step 13 of 13 was never executed; the sprint's own plan named "Participant testing begins" as step 15 and reached step 13. **A real client exists** (spec §3.6 items await *client* ratification) and **not one feedback session is recorded**.

**Terminology purge — mandatory, not cosmetic.** `participant` / `real_participant_adapter` / "Participant eligible: yes" / "physical test" / "walkthrough" / "acceptance" all denote software constructs or AI-agent verdicts. The worst single string is `CORE_SCREENSHOT_VALIDATION_REPORT.md:47` — *"a human-equivalent usability judgement"* — describing **an AI agent looking at PNG files**.

---

## 7. Phase B implementation authorization map — NOT AUTHORIZED

| Track | Scope | Prerequisites | Parallel-safe? | Worktree | Pre-deployment? | Acceptance gate | OD deps | A2 deps |
|---|---|---|---|---|---|---|---|---|
| **1 — Governance-required app fixes** | C2C-007 (dead canonical `/trainer/reports`), C2C-006 (stale-state refusal copy), C2C-015 (schedule opens on a past month), C2C-025, C2C-027, C2C-020, wall-clock non-determinism | None | ✅ Yes | `main` | ✅ Yes | Failing-then-passing assertion each; route census unchanged; **no migration**; repo-wide assertion that no content hash reaches any DOM | — | — |
| **2 — Trainer UI** | Screens 05, 06, 07, 08, 10 — bounded corrections + before/after captures | Track 1; **PA-OD-5b** (wordmark) | ✅ With T3/T4 | `feat/ui-trainer` | ✅ Yes | Per screen: capture at frozen native dimensions, reference SHA unchanged, operator acceptance | **PA-OD-5b only.** *(Panel headings removed — G-10 rules them **R**; keeping a gate on a decision this document declares resolved was a self-contradiction.)* ⚠️ **Updated 2026-08-07:** OD-4 has since been **ruled the other way** by the operator — the panels become **Overview · Strengths · Areas for Development · Remarks**. Track 2 is still not *gated* on a decision, because the decision is made; but screens 08 and 10 now carry a **Phase B semantic migration** in their scope, not merely a bounded visual correction. See `FINAL_MVP_OD4_REPORT_SEMANTICS_RULING.md` | — |
| **3 — Management UI** | Screens 19, 29 + the six built-but-unframed families | Track 1; **PA-OD-5** | ✅ With T2/T4 | `feat/ui-management` | ✅ Yes | As above; wording-only editor needs a visual disposition | PA-OD-5 | — |
| **4 — Auth / Parent / shared UI** | AUTH-01/02/03, 32, 33 + the 25 shared states | Track 1; **PA-OD-5b** | ✅ With T2/T3 | `feat/ui-shared` | ✅ Yes | As above + validation/success/disabled states assessed (currently UNVERIFIED) | screen-plan OD-1 (Auth 04), PA-OD-5b | — |
| **5 — Error/loading/not-found + test infra** | Route-level boundaries (zero exist); `npm test` aggregator; `TESTING.md`; credential-free tier | None | ✅ Yes | `main` | ✅ Yes | Every mandated state has a boundary; **no thrown message interpolated**; SEC-11's reliance on the bare 404 preserved | — | — |
| **6 — Hosted Supabase / deployment** | Transport replacement · hosted provisioning · G-SG region · env separation · secrets · `next.config.ts` · **P-1 guard remediation for the two unguarded migrations** | **PA-OD-1, PA-OD-3, PA-OD-7, PA-OD-9** | ⚠️ Partly — provisioning parallel to transport design | dedicated | ❌ **No** | `G-SG` region verified **at creation**; **all 12 migrations apply cleanly, with the ownership posture proven for the 2 that carry no P-1 guard**; RLS/grant posture replayed; audit chain verifies hosted; **no module spawns a container CLI** | PA-OD-1, PA-OD-3, PA-OD-7, **PA-OD-9** | — |
| **7 — Documentation / submission** | README rewrite · setup runbook · `seed.sql` reconciliation · LICENCE · evidence commit · GitHub Classroom | **PA-OD-8** (R1 closed) + **a fresh dated secret / redaction / third-party-content scan over all four evidence trees** | ✅ Yes | `main` | ✅ Yes | Clean clone reaches a running app + green credential-free tier from committed docs; **nothing published contains third-party content** | PA-OD-7, PA-OD-8 | **Stated concretely, not as "Phase A2":** the push step is gated on **(a)** R1 closed and **(b)** the fresh scan passing. *(An earlier draft gated it on "Phase A2 must complete" — but Phase A2 is defined in no document in this workspace, so that was a gate on an undefined object.)* |
| **8 — Usability study** | Recruit 3 roles · consent · protocol · tasks · SUS · findings register · remediation trace · the A-024 UAT document | **Track 1** for session viability; **plus a ruling that participant consent/retention data lives OUT of product** | ✅ Fully independent | n/a | ✅ Yes | Real participants, real tasks, real findings; **no document implies human subjects where there were none** | **PA-OD-10** (below) | — |

**Track 8 recruitment is gated on nothing and is the longest lead item in the entire project. Start it before anything else.** Sessions additionally need Track 1's C2C-007 and C2C-015 fixed, plus a decision on the A-018 attendance toggle (which has no write path — either build it or drop that task and disclose).

**Session venue note:** because of the `docker exec` blocker, usability sessions must run against the **local stack**, not a hosted deployment.

---

## 8. Confirmations

No application code changed. No database schema or data changed. No migration, seed or fixture ran. No hosted Supabase resource created; the CLI remains unlinked (`supabase/.temp/` holds only `cli-latest` and `pgdelta`). No GCP action. No GitHub remote, no push, **nothing committed**. No external AI/provider called. `.env.local` untouched. The frozen demo at `SDS Project Sprint 2` untouched at `8d4acf4`. Both worktrees untouched. **Nothing deleted, moved or archived — the AUTH-01 contaminated file and `00-PeakPalate-Master.mp4` were both left byte-identical and untouched.**

**Edited under the §4 permission, documentation only, uncommitted:** `CLAUDE.md` (4 annotations — C-1 PDPA, C-2 ×2 counts, C-3 Step 7F), `docs/progress/STATUS.md` (3 — C-6 ×2 CP-3, C-7 CP-4), `docs/plan/BEST_Coach_Implementation_Plan.md` (1 — C-8 UAT count). Every edit strikes stale text, preserves it inline, cites the Phase A ruling and carries the date. **`AGENTS.md` was not edited — it exists only inside the frozen demo, which `CLAUDE.md:560` rules "migration provenance only and never governs the MVP", so there is no active `AGENTS.md` to reconcile.**

*Note: `AGENTS.md` exists only inside the frozen demo. `CLAUDE.md:560` rules it "migration provenance only and never governs the MVP" — there is no active `AGENTS.md` to reconcile.*

---

*Produced at Final MVP Phase A, 2026-08-07, against main HEAD `139d753` with a clean working tree.*

---
---

# PART II — PHASE A CONTINUATION, 2026-08-07

**Status: the operator ruled on the outstanding gates, supplied both canonical PDFs, and delegated PA-OD-1 and PA-OD-9 to the orchestrator. `FINAL_MVP_AUTHORITY_LOCK.md` HAS BEEN CREATED.** That file — not this one — is now the canonical Final MVP baseline. This Part II records the reconciliation that produced it.

Eight parallel read-only subagents were run, plus one adversarial falsification agent and two independent final reviewers. The orchestrator additionally verified first-hand: both canonical PDFs in full, the live database catalogue, the migration set, the `reference` pack tree and the route inventory. **No count in the Authority Lock was restated from another document.**

## II.1 UPDATED MASTER DECISION TABLE

Columns: **ID · ISSUE · AUTHORITATIVE SOURCES · CONFLICTING SOURCES · CURRENT IMPLEMENTATION · HISTORICAL DECISION · FINAL RULING · OPERATOR DECISION REQUIRED? · AFFECTED DOCUMENTS · AFFECTED SCREENS · IMPLEMENTATION IMPACT · PHASE A2 CLEANUP IMPACT**

---

### G-19 · Canonical submission brief — ingestion and reconciliation
- **Authoritative sources:** `Complete_Project_and_Module_Brief.pdf` (19pp, 19 Apr 2026); `Project_Final_Deliverables.pdf` (6pp, 4 Aug 2026)
- **Conflicting sources:** the two PDFs conflict on four points (see G-25); the prior §7.0 register was built from an audit instruction, not a brief
- **Current implementation:** n/a — documentation
- **Historical decision:** brief was un-ingested; only 6 of 19 derived requirements were canonically sourced
- **FINAL RULING:** Both PDFs read in full, sound, text-based, correct documents (60.004 Service Design Studio, cohort SDS-2026). **146 requirements extracted: 135 ACTIVE, 11 superseded, 0 contradicted.** Register reconciles as 12 CONFIRMED · 3 GCP-superseded · 9 NOT_MENTIONED. **The Deliverables PDF is 3.5 months newer and governs submission content.**
- **Operator decision required?** No
- **Affected documents:** Authority Lock §2, §25
- **Affected screens:** none
- **Implementation impact:** six mandatory artefacts exist only in the Deliverables PDF and are all unstarted — GitHub Classroom repo, README, deployment instructions, Google Site, 2-minute video, architecture diagrams
- **Phase A2 impact:** `FINAL_SUBMISSION_BRIEF/` is protected; PDFs are never edited

---

### G-20 · PA-OD-1 — database function baseline
- **Authoritative sources:** the 12 migrations on disk; live `pg_proc` catalogue; `supabase_migrations.schema_migrations`
- **Conflicting sources:** Step 7I baseline §5.0 records 28; STATUS.md dated entries record 32 and 30; A-040:411 states *"Functions are outside this clause"*
- **Current implementation:** **34 functions, all names distinct, zero `CREATE OR REPLACE`, zero `DROP FUNCTION`**
- **Historical decision:** the 28 was a point-in-time Step 7I gate asserted in-migration
- **FINAL RULING: RATIFIED.** Census locked at **12 migrations · 26 tables · 34 functions · 12 enums · 29 policies · 25 `authenticated` EXECUTE · 9 owner-only**. All six deltas traceable to accepted migration and governance history. The 28 is a **closed historical snapshot, not a quantity cap**. `report_list_management_submitted` has the thinnest chain and is named explicitly so the ratification is deliberate.
- **Operator decision required?** No — delegated and exercised
- **Affected documents:** Authority Lock §19; STATUS.md (C-12 census block added)
- **Affected screens:** none
- **Implementation impact:** none — no code or migration change
- **Phase A2 impact:** the Step 7I baseline is HISTORICAL_EVIDENCE, not the standing inventory

---

### G-21 · PA-OD-9 — hosted draft-storage transport
- **Authoritative sources:** `trusted-store.ts`; R-27 (`…7i:3031`, `:1010`); live ACL `{postgres=X/postgres}`; live `pg_roles`
- **Conflicting sources:** `FINAL_MVP_SUBMISSION_READINESS_PLAN.md:202` ("definer chain is the indicated shape") vs the reconciliation's ruling that the same shape trips R-27 in substance; the PA-OD-9 table mispriced the direct-connection option as *"superuser"*
- **Current implementation:** `spawn("docker", …)` into a hardcoded container as `postgres` — cannot work hosted, and is constructed by shipped `"use server"` code so a deployed build fails at runtime with no build-time signal
- **Historical decision:** OPEN; five options recorded; no recommendation offered
- **FINAL RULING: RATIFIED — a dedicated minimally-privileged login role over a direct pooled connection.** The decisive fact: **the accepted, G-6-passing transport already IS a direct `postgres` session**; only credential supply changes. The narrow role holds EXECUTE on `report_store_draft` and nothing else, is not granted to `authenticator`, and is therefore **less privileged than the transport already accepted**. R-27 preserved literally. Verified: `postgres | rolsuper=false`; assertions B7/A35/T7I-4 test only the five client roles. Edge Function rejected — best on secrets but reopens ADR-2, and priority 1 outranks priority 5.
- **Operator decision required?** No — delegated and exercised
- **Affected documents:** Authority Lock §18
- **Affected screens:** none directly; blocks the whole AI draft flow hosted
- **Implementation impact:** one new migration (12→13 pinned in 8 files); ~60-line store implementation; **G-6 must be re-proven**; a second copy of the transport SQL in `prove-governed-lifecycle.mjs` must be updated in step
- **Phase A2 impact:** none

---

### G-22 · PA-OD-2 — attendance
- **Authoritative sources:** operator ruling; A-018 (never superseded, reaffirmed in Amendments 003–006)
- **Conflicting sources:** three prior deferrals (Phase A note; screen-06 pack; STATUS.md audit scope)
- **Current implementation:** data model **complete and correct**; absence-respect **complete and fail-closed**; **no write path of any kind**
- **Historical decision:** deferred — "no attendance mutation exists on PhysicalTestPort, so NO toggle was built, faked or stubbed"
- **FINAL RULING:** **REQUIRED. A-018 ACTIVE.** Defaults Present; Trainer toggles; Management and Parent prohibited (already structurally enforced); absent learner gets no report; direct RPC access must not bypass.
- **Operator decision required?** Resolved — but the **design disposition for a toggle affordance is open**: no ratified frame draws one
- **Affected documents:** Authority Lock §7
- **Affected screens:** 06 (roster)
- **Implementation impact:** new RPC + audit emitter + server action + port mutator + UI control + tests. Adding a 4th attendance policy would fail two migration assertions pinning `('attendance', 3)` — route through a definer RPC instead
- **Phase A2 impact:** none

---

### G-23 · PA-OD-2 — evidence media
- **Authoritative sources:** operator ruling; A-001/A-003/A-004 (now ARMED); §19 storage row
- **Conflicting sources:** A-014 recorded uploader UNRESOLVED; `CLAUDE.md` forbade naming one; A-038 places evidence outside Management's read
- **Current implementation:** **nothing** — zero buckets, zero storage policies, zero tables, zero code
- **Historical decision:** correctly absent; safeguards armed, nothing invented
- **FINAL RULING:** **REQUIRED. Trainer uploads. Private hosted Supabase Storage, signed URLs only. Management review-only. PARENT PROJECTION RULED OUT** — the operator's condition ("unless the canonical PDFs explicitly require it") is **not met**; neither PDF mentions evidence at all. Consistent with A-002's text-only Phase 1 parent report; A-001 remains armed but unactivated.
- **Operator decision required?** Resolved. Four Phase B rulings remain: `scan_status` vocabulary, retention period, 500MB vs 50MiB, A-038 reconciliation
- **Affected documents:** Authority Lock §8, §21
- **Affected screens:** 08, 10, 19 build it; **33 stays omitted**; 13 Class Health Summary is now unblocked
- **Implementation impact:** largest single Phase B item — table, bucket, policies, 3 RPCs, module, port, UI, and the A-003 must-fail test matrix
- **Phase A2 impact:** none

---

### G-24 · PA-OD-3 — auth / signup / bootstrap
- **Authoritative sources:** operator ruling; A-027; A-046; A-015/A-020
- **Conflicting sources:** `config.toml` `enable_signup = true` contradicts the ruling **today**
- **Current implementation:** no signup/registration/invitation/recovery path exists in the app; **no bootstrap mechanism exists at all**; `membership.bootstrap` reserved with zero emitters
- **Historical decision:** N-4/U-23/CP-5 — open since 2026-08-03, ~30 citations, never ratified
- **FINAL RULING:** **The MODEL is locked** (Authority Lock §5, 12 points). Mechanism is Phase B, as the operator permitted. Auto-grant is **verified impossible today** by three independent proofs.
- **Operator decision required?** No
- **Affected documents:** Authority Lock §5, §17, §30.2
- **Affected screens:** AUTH-01/02/03; future invitation/activation screens have no frames
- **Implementation impact:** disable or hook-gate signup; enable confirmations **before** designing any claim flow (email is A-027's acceptance proof — pre-squatting hazard); build bootstrap; build invitation lifecycle
- **Phase A2 impact:** none

---

### G-25 · Canonical PDF internal contradictions
- **FINAL RULING — four cross-document, three intra-document, all recorded not corrected:** (1) deployment mandate **absolute in the Brief, conditional in the newer Deliverables** — decisive for the GCP override; (2) submission package four items vs six components; (3) Firestore named in Brief, no data-layer requirement in Deliverables; (4) "real or representative users" vs "target users identified". Intra-Brief: **weightings total 102%**; the p.3 weekly table **omits Week 14 entirely**, so a reader using only it would miss the submission deadline; a "Recommended" tools table contains "Required"/"Compulsory" cells.
- **Operator decision required?** No — but the **team number** and the **exact deadline** are operator-held facts
- **Affected documents:** Authority Lock §2.1, §25.2

---

### G-26 · `reference` folder authority and its boundary
- **Authoritative sources:** operator ruling; A-045's **two** ladders
- **Conflicting sources:** **12 functional conflicts inside the `reference` packs**
- **Current implementation:** 37 packs; 12 frozen PNGs SHA-identical to `reference/`
- **FINAL RULING:** `reference/` is **VISUAL authority only**. Its Markdown sits at **rank 5 of the functional ladder and loses**. Four parent packs describe the **already-caught per-dimension rating leak** and must not be built. **37 directories, not 36** — the extra is `Auth 04`, outside the ratified 36.
- **Operator decision required?** No
- **Affected screens:** 30, 33, 32, 31 (parent leak); 19, 29 (management edit right); 28 (term report, out of scope)
- **Implementation impact:** none — the correct behaviour is already implemented; the risk is a future agent "correcting" the app toward the packs
- **Phase A2 impact:** the whole tree is protected; **the two `.txt` renders are the highest deletion risk in the workspace**

---

### G-27 · Usability evidence and the anti-substitution rule
- **Authoritative sources:** Deliverables p.4 §6; Brief p.9 §8; operator PA-OD-10 ruling
- **Current implementation:** **zero human usability evidence exists**, confirmed four ways
- **FINAL RULING:** Human usability testing is **required and graded**. **No participant count is mandated anywhere** — the word "participant" does not occur in either PDF. Consent and research-data retention live **outside the product**. Technical runs must **never** be relabelled as usability testing.
- **Operator decision required?** No
- **Affected documents:** Authority Lock §26; **C-10 applied this run** to `CORE_SCREENSHOT_VALIDATION_REPORT.md` (two edits)
- **Implementation impact:** none in product — but **participant recruitment is the longest-lead item in the project and is gated on nothing**

---

### G-28 · PDPA, tables and data residency
- **FINAL RULING:** The §3.1/§6.1 contradiction is **in `CLAUDE.md`, not the spec** (spec v3 has no §6.1); **§6.1 wins, do not build**. Five commonly-cited "missing" tables are **renames, not absences**. Of nine genuinely absent: six DEFERRED with named owners, one NOT_REQUIRED, one **REQUIRED_FOR_FINAL_MVP** (`report_source_map`), one **GENUINELY MISSING** (`session_logs`, the one true orphan). All three PDPA instruments deferred to Phase 4. **Compliance rests entirely on ADR-6's synthetic-data rule** — real participant data would activate the obligation. **The LLM region/DPA required by spec §22 is recorded nowhere** — an open gap.
- **Operator decision required?** No for the lock; LLM region/DPA is a Phase B decision
- **Affected documents:** Authority Lock §20, §23

---

### G-29 · Deployment, GCP override and region
- **FINAL RULING:** **11 GCP platform mandates superseded, each paired with its surviving requirement; no paragraph discarded.** The newer PDF's **Alternative Deployment clause** means the override **aligns with the canon rather than contradicting it** — at the price of four transferred obligations, including explaining the approach at the final presentation and **discussing it with the teaching team in advance** (a human action, time-critical). **Governance permits Vercel; the operator ratifies it** — §19 already offered "Vercel (Singapore) or Cloud Run" as an either/or, so PA-OD-7 was never a genuine conflict. **Data residency is real and platform-neutral**, asserted three times before any platform is named; it binds Postgres, Storage **and** compute — and because §19 itself says "Vercel (Singapore)", a Singapore function region implements an existing clause rather than inventing one. **Neither PDF requires any region.**
- **Operator decision required?** No — ~~but the teaching-team discussion is an outstanding human action~~ **✅ CLOSED 2026-08-08: `OPERATOR_CONFIRMED_TEACHING_TEAM_DEPLOYMENT_APPROVAL`.** Vercel + hosted Supabase accepted by the teaching team. ⚠️ **Operator-reported external confirmation — no workspace documentary evidence exists and none may be fabricated.**
- **Affected documents:** Authority Lock §22, §23

---

### G-26 · **OD-4 — the Final MVP report narrative semantics** *(added 2026-08-07, after the Authority Lock was created)*

- **Authoritative source:** an **explicit operator ruling**, 2026-08-07 — the highest authority on the question it addresses (Authority Lock §2.3). Canonical instrument: **`FINAL_MVP_OD4_REPORT_SEMANTICS_RULING.md`** (**repository root** — ~~workspace root~~; moved 2026-08-08, Authority Lock §1.1 / `CLAUDE.md` §9.1)
- **Conflicting sources:** spec §8's four panels; `CLAUDE.md:283-284`; G-10 above; Authority Lock §15/§15.1 as first written; the `reference` tree's own internal inconsistency on the third label
- **Current implementation:** the superseded four are physically present in **1 table (4 columns)**, **8 SQL functions**, the **generated database types (44 occurrences)**, **6 TypeScript contract/domain types**, the **AI structured-output schema and prompt**, **grounding rule 4**, the **fixture provider**, **all three role UIs**, and the **C3/G-6, C4, integration and concurrency harnesses**
- **Historical decision:** raised 3× in the screen plan, ruled **R — keep the governed four** at G-10, and carried by the Authority Lock as the one **time-boxed** open operator decision
- **FINAL RULING: RATIFIED — Overview · Strengths · Areas for Development · Remarks.** A **semantic-model change, not a cosmetic relabel**. One canonical model across Trainer, Management and Parent; role differences are **authority and lifecycle state, not panel semantics**. The AI contract must generate the four outputs **directly** — an internal-old-concepts-plus-UI-relabel shim is prohibited. **`Areas for Development`** is the ratified label; *Areas to Grow*, which appears in three `reference` packs, is not. Ruled **inside the time-box, with `report_versions` empty** — the preferred migration point, which does **not** reduce the regression obligation
- **Operator decision required?** No — **ruled**
- **Affected documents:** Authority Lock §2.3/§12/§14/§15/§15.1/§28.2/Appendix · G-10 above · readiness plan U-06 · screen plan §6 OD-4 and screens 08/10/19 · `CLAUDE.md:283-284` · `STATUS.md`
- **Affected screens:** **08, 10, 19** (and 33's omitted region)
- **Implementation impact:** a registered **Phase B migration** — none performed. Two genuine sub-rulings remain open inside it: **(a)** the content-hash envelope version (the panel names are literal bytes inside both SHA-256 preimages and `content_hash_version` is pinned by `CHECK (= 1)`); **(b)** the **re-derivation** of grounding rule 4, which cannot be a rename because `Overview` may legitimately carry developmental context. **No enum, no `report_status` value, no RLS policy, no grant, no audit action and no rating/attendance/observation contract changes**
- **Phase A2 impact:** historical evidence documents are **not** rewritten; C3-C/G-6 and C4 evidence is recorded **VALID FOR PRE-OD-4 IMPLEMENTATION BASELINE; AFFECTED CONTRACTS REQUIRE RE-VERIFICATION AFTER OD-4 IMPLEMENTATION**

---

## II.2 CORRECTION MANIFEST — PART II

| ID | Correction | File | Status |
|---|---|---|---|
| **C-10** | "human-equivalent usability judgement" struck as false; "Visual usability validation summary" heading corrected to "Automated image-legibility validation summary". Document now explicitly marked **not** usability evidence | `UI_REFERENCE_FINAL_MVP/CORE_SCREENSHOT_VALIDATION_REPORT.md` | ✅ **APPLIED** — highest integrity priority |
| **C-12** | Authoritative current-census block added; dated historical figures **preserved intact** and explicitly labelled historical | `docs/progress/STATUS.md` | ✅ **APPLIED** |

Part I's manifest stands: **7 APPLIED · 2 HELD (C-4/C-5, both blocked on PA-OD-1) · 3 Ready**. **C-4 and C-5 are now UNBLOCKED** by the G-20 ratification and pass to Phase B.

## II.3 WITHDRAWN AND DISSOLVED

- **PA-OD-4** (B.E.S.T gloss) and **PA-OD-6** (`report_source_map` ownership) — withdrawn in Part I as manufactured; **confirmed withdrawn**.
- **PA-OD-7** — **dissolved.** Spec §19 already ratified "Vercel (Singapore) **or** Cloud Run" as an either/or. The operator selected a branch governance already offered; there was never a conflict to resolve.
- **PA-OD-1, PA-OD-9** — delegated and **exercised** (G-20, G-21).
- **PA-OD-2, PA-OD-3, PA-OD-5/5b, PA-OD-8, PA-OD-10** — **ruled by the operator**.

- **OD-4** (screen-plan ID; report narrative semantics) — **ruled by the operator, 2026-08-07** (G-26). ⚠️ *This was the one exception to the claim below when Part II was first written: the Authority Lock's own Appendix flagged `OD-4` as a genuine, time-boxed, still-open operator decision. The claim is accurate as of the OD-4 ruling and was not accurate before it.*

**No Final-MVP-defining operator decision remains open.** Residual items are operator-held facts, human actions, or Phase B implementation choices — enumerated in the Authority Lock's Appendix.

---

*Part II produced at the Final MVP Phase A continuation, 2026-08-07, against main HEAD `139d753`. Working tree dirty by design: documentation only.*
