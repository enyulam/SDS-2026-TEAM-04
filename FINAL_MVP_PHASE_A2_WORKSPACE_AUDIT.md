# FINAL MVP PHASE A2 — COMPLETE WORKSPACE LEGACY / OBSOLESCENCE AUDIT

> 📍 **LOCATION (2026-08-08, repository-boundary normalization).** This file now lives at the **root of the main MVP repository** and is git-tracked, as does the whole `UI_REFERENCE_FINAL_MVP/` tree it audits. **This report describes the workspace as it stood on 2026-08-08 BEFORE that move** — its "outside every git repository" / "workspace root" statements about the six `FINAL_MVP_*` documents and `UI_REFERENCE_FINAL_MVP/` are **historical and must not be followed as current paths**. Statements about `FINAL_SUBMISSION_BRIEF/`, the frozen demo, PeakPalate, `governance-source/`, the migration tracker, the figma list and the three `_*-evidence/` trees **remain true** — those did not move. See `CLAUDE.md` §9.1 and `FINAL_MVP_AUTHORITY_LOCK.md` §1.1.

**Instrument type:** Read-only discovery and classification report.
**Produced:** 2026-08-08, Asia/Singapore.
**Status:** COMPLETE. Findings only — **no cleanup was performed and none is authorized by this document.**
**Companion:** `FINAL_MVP_PHASE_A2_CLEANUP_MANIFEST.md` (the row-level proposal set).

**Authorizes nothing.** No application code, schema, migration, fixture, database row, test, configuration, governance document or evidence file was created, modified, moved, renamed, archived or deleted to produce this report. No migration was run. No database was mutated. No external provider was invoked. No hosted Supabase resource was provisioned. No deployment occurred. No GitHub remote was created and nothing was pushed. The frozen demo and both 48H worktrees were inspected read-only and are byte-unchanged.

**Precedence.** This document is a **Phase A2 inventory**, ranking **below** `FINAL_MVP_AUTHORITY_LOCK.md`, `FINAL_MVP_OD4_REPORT_SEMANTICS_RULING.md`, the canonical PDFs, the specification and `CLAUDE.md`. Where it disagrees with any of those on a *rule*, they govern. Where it reports a *fact* verified on disk, the Authority Lock's own principle applies — *"Precedence governs rules; existence governs facts"* (`FINAL_MVP_AUTHORITY_LOCK.md:1022`).

---

## 1. RUN METADATA

| | |
|---|---|
| Repository | `SDS Project Final (BEST Coach)` |
| HEAD (start and end) | `139d7533c126acc6a5162d0fcb889e86e80ed59e` — **unchanged** |
| Branch | `main` |
| Remotes | **0** — nothing in this workspace is backed up off-machine |
| Working tree | **Dirty by design** — 7 modified tracked `.md` files, **0 untracked**, 0 staged |
| Diffstat | `7 files changed, 445 insertions(+), 17 deletions(-)` — documentation only |
| Worktrees | `main` @ `139d753` · `feat/48h-backend` @ `402b0b6` · `feat/48h-frontend` @ `6762b5c` |
| Frozen demo | `SDS Project Sprint 2` — independent repo, `8d4acf4`, **clean**, 1 commit, 0 remotes |
| Scanning subagents | **8** (A–H), all read-only |
| Adversarial reviewers | **2** (authority-loss · technical-dependency) |

**The 7 modified files** — `CLAUDE.md`, `docs/plan/BEST_Coach_Implementation_Plan.md`, `docs/progress/BUILD_NOTES.md`, `docs/progress/DEMO_TO_MVP_MIGRATION.md`, `docs/progress/STATUS.md`, `docs/workstreams/48H_BACKEND_PROGRESS.md`, `docs/workstreams/48H_FRONTEND_PROGRESS.md` — are the Phase A and OD-4 governance annotations, accounted for at `STATUS.md:21`. They are **not** audit artefacts and were not produced by this run.

---

## 2. SCOPE AND METHOD

| Workstream | Scope | Files / units examined |
|---|---|---|
| **A** | Active governance document segments | ~1,930 segments across 23 documents |
| **B** | Workspace-root inventory | 19 classified root units |
| **C** | `UI_REFERENCE_FINAL_MVP` tree | **343 / 343** |
| **D** | Application source | **192** (101 TS/TSX read line-by-line; 20,192 LOC) |
| **E** | Supabase / migrations / config | 35 direct + ~200 grepped |
| **F** | Tests / evidence / harness | **192** (95 evidence + 69 test + ~28 governance) |
| **G** | Frozen demo + both worktrees | 3 subjects, full tracked-vs-disk enumeration |
| **H** | Foreign / duplicate / orphan forensics | **91,779 enumerated**, 853 SHA-256 hashed, 285,936 external files scanned |

**Total workspace:** 91,779 files · 9,582 directories · 3,284.4 MB.
**Excluded from content hashing:** 90,926 files (99.07%) — `node_modules`, `.next`, `.git` internals, `dist`, `build`. Their footprint is reported in §9 but no deletion is proposed for any of them.

🔴 **STATED LIMITATION — added after adversarial review.** **The local database was not running during this audit** (Docker daemon unreachable; `127.0.0.1:54322` closed; no `psql` on PATH). **No live catalog query was executed and `report_store_draft`'s `proacl` literal was never read.** Every census figure in this report is derived **statically** from migration text and is consistent with the migrations' own apply-time catalog assertions (`…step_7i_report_lifecycle.sql:3119`, `:3159`; `…single_entry_point.sql:367`; `…submitted_list.sql:536`) — assertions which ran against the real catalog at apply time and would have aborted the migration otherwise. R-27 therefore holds **by construction and by five independent apply-time re-derivations**, but `{postgres=X/postgres}` is **inferred, not read**. Where §11 uses catalog-shaped phrasing such as *"`service_role` holds EXECUTE on 0 functions"*, read it as static-derived. Every figure was independently re-derived by a second reviewer and reproduced exactly.

**Discipline applied throughout, and enforced against the subagents:**
- Modification time is **never** evidence of staleness. §31.2 forbids it at any scope.
- `DUPLICATE` requires a **hash match**. Filename similarity was never sufficient and was rejected wherever attempted.
- A document that **records** a superseded rule in order to supersede it is **not** stale. Only text that still **instructs** the superseded rule as current is stale.
- Code implementing the pre-OD-4 report model is **`REQUIRES_FUTURE_OD4_MIGRATION`**, never `UNUSED` or `STALE`.
- "No textual caller" is **not** proof of unused. Framework conventions, dynamic imports, form-action binding, RPC-by-name, barrels and test-only use were each ruled out explicitly, per candidate, or the candidate was classified `AMBIGUOUS`.

---

## 3. THREE PREMISES IN THE PHASE A2 BRIEF THAT ARE WRONG

These are recorded first because acting on them would have damaged the corpus. Each was found independently by more than one workstream.

### 3.1 ⚠️ "Stale 36 screens/packs where current authority is 37" — **FALSE. Both numbers are correct in their own scope.**

Confirmed independently by **workstream A, workstream C and the orchestrator**, and stated in the Authority Lock itself at `:938`:

> *"**It contains 37 pack directories, not 36.** … The operator's brief inherited "36" from the ratified *screen inventory*, where it is correct, and applied it to the *directory*, where it is not. **Both numbers are right in their own frame: 36 governed screens, 37 design-asset packs.**"*

- **36** = the ratified screen inventory (Amendment 005, A-041…A-048). `UI_PACK_MANIFEST.json:6` sets `"screenCount": 36`. There are exactly 36 pack folders (33 numbered + 3 AUTH).
- **37** = the count of `UI_REFERENCE_FINAL_MVP/reference/` folders. The 37th is `Auth 04 - All Users - Forgot Password`, which sits **outside** the ratified 36.

**`OD-1` is still open and its recorded recommendation is that Auth 04 does *not* become a 37th screen** — it has no inventory ID and no Figma node ID, and one may not be invented (`GLOBAL_UI_RULES` §8; `CLAUDE.md` §12; A-022).

**Consequence:** the workspace-wide scan returned **87 hits across 58 files** for "36 screen". **Zero are stale.** Rewriting them to 37 would fabricate an amendment the operator never issued, silently admit Auth 04 to the ratified inventory, and require inventing a node ID. **This was the single most damaging action available in this audit. It was not taken and is recommended against.** No 36→37 edit may be made anywhere pending OD-1.

Four *other* verified-false claims happen to contain "36" and are stale for unrelated reasons — recorded as S-14, S-15, S-17, S-22 in §5.

### 3.2 ⚠️ "The C4 ledger states the run was NOT browser-driven" — **imprecise, and the imprecision damages the submission.**

This error originated with the orchestrator's briefing and was corrected by workstream F.

The ledger's **title** claims the opposite — `_c4-lifecycle-evidence/c4-lifecycle-ledger.md:1`:

> `# Run C4 — governed lifecycle ledger (browser-driven, disposable stack)`

**Exactly one leg of 29 (L-4)** is declared not browser-driven, at `:16`, with **exactly three** named deviations — deterministic fixture provider replacing OpenAI; superuser psql transport on that one step; `authUserSub` as a fixture literal. The other 13 legs and all 15 negative controls **are** browser-driven through the served application, and each deviation is separately compensated (G-6 proves the real-provider path; `run-integration.mjs` proves the RLS/GRANT path under real JWTs).

**Repeating the broader claim would understate accepted evidence.** The correct citation is *"leg L-4 of 29 is not browser-driven, with three compensated deviations"* — never *"the run was not browser-driven."*

### 3.3 ⚠️ "Find tests asserting the OLD panel names" — **the direction is inverted.**

**No test asserts the old names.** The only old-name references in the test estate are docblocks explicitly *rejecting* them, e.g. `tests/frontend/trainer-browser-smoke.mjs:1124` — *"the four GOVERNED panels, in order, **not** the frame's Overview/Strengths/Areas/Remarks."*

Because OD-4 makes **Overview · Strengths · Areas for Development · Remarks** canonical, the migration burden falls on everything asserting the **currently-implemented** names. See §6.

---

## 4. CROSS-WORKSTREAM RECONCILIATIONS

Five conflicts arose between workstreams or between workstreams and the existing governance record. All five are resolved here on evidence.

### R-1 · Migration count: 12, not 13 — **RESOLVED**
Workstream E enumerated **12** migrations by filename with one commit each; workstream D's directory summary said **13**. Orchestrator verified directly: **12 files on disk, 12 tracked by git, zero non-`.sql` files** in `supabase/migrations/`. **E is correct.** D's error appears only in its tree summary; its per-file OD-4 line citations match E's exactly, so the error does not propagate into any finding. **The ratified figure of 12 stands.**

### R-2 · The in-migration "28" citation: both documents are right — **RESOLVED, no ruling needed**
Workstream A flagged that `FINAL_MVP_AUTHORITY_LOCK.md:536` cites `…step_7i_report_lifecycle.sql:3119` while `FINAL_MVP_PHASE_A_GOVERNANCE_RECONCILIATION.md:67` cites `:3323`, and concluded one must be wrong. **Neither is.** Verified directly:

| Line | Content |
|---|---|
| `:3114` | `-- B4: exactly 28 functions in public (6 Step 7G + 4 Step 7H + 18 new).` |
| `:3119` | `IF v_n <> 28 THEN` — **the actual catalog assertion** |
| `:3323` | `RAISE NOTICE 'Step 7I report lifecycle: 26 tables, 12 enums, 28 functions, …'` — a closing summary notice |

The Authority Lock's citation is precise. The Reconciliation's line exists and says 28, but calling `:3323` *"asserted in-source"* is a **wording imprecision** — it is a notice, not an assertion. Recorded as a low-risk `REWRITE_ACTIVE_SEGMENT`, not a conflict.

### R-3 · The 12 frozen `reference.png` files are not in the frozen demo — **RESOLVED**
Workstream G raised that the Authority Lock protects *"the 12 frozen `reference.png` files"* while `SDS Project Sprint 2/reference/` holds only **9** PNGs, and asked where the other 3 are. **The premise is a scope confusion.** Workstream C hash-verified all **12** frozen `reference.png` files inside the `UI_REFERENCE_FINAL_MVP` numbered/AUTH screen packs, each SHA-256-identical to its `reference/` twin and to the pin in `UI_PACK_MANIFEST.json`. The frozen demo's 9 PNGs are an **unrelated set** — workstream G separately proved all 9 are unique and match nothing in `UI_REFERENCE_FINAL_MVP`. **Both counts are correct; they describe different things. The Authority Lock needs no correction.**

### R-4 · The OD-4 fail-open deny-lists — **CONFIRMED TWICE, INDEPENDENTLY**
Workstream F found them from the test estate; workstream E found them from the SQL. Neither saw the other's work. Together they identify **seven** sites. This is the most serious technical finding of the run — see §6.2.

### R-5 · AUTH-01 preservation — **the governance record's premise is REFUTED**
See §7. Independently re-verified by the orchestrator.

---

## 5. STALE SEGMENTS IN ACTIVE GOVERNANCE — 63 FOUND

Full row-level detail is in the companion manifest (IDs `S-01`…`S-63`). Summary by document:

| Document | Classification | Stale segments |
|---|---|---|
| `FINAL_MVP_AUTHORITY_LOCK.md` | ACTIVE_AUTHORITATIVE | **0** — the cleanest document in the corpus; it names other files' staleness rather than carrying its own |
| `FINAL_MVP_OD4_REPORT_SEMANTICS_RULING.md` | ACTIVE_AUTHORITATIVE | **0** |
| `docs/progress/BUILD_NOTES.md` | ACTIVE_AUTHORITATIVE (append-only log) | **0** |
| `docs/progress/DEMO_TO_MVP_MIGRATION.md` | HISTORICAL_EVIDENCE — correctly bannered | **0** |
| `docs/workstreams/48H_*_PROGRESS.md` | HISTORICAL_EVIDENCE — correctly bannered | **0** |
| `CLAUDE.md` | ACTIVE_AUTHORITATIVE (rank 2) | **12** + 1 ambiguous |
| `docs/progress/STATUS.md` | ACTIVE_AUTHORITATIVE (current status) | **3** material + 1 borderline |
| `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` | ACTIVE_AUTHORITATIVE (rank 3) | **5** |
| `docs/plan/BEST_Coach_Implementation_Plan.md` | ACTIVE_SUPPORTING | **7** |
| `docs/plan/COMPETENCY_VOCABULARY_RECONCILIATION_PLAN.md` | ACTIVE_SUPPORTING | **1** (3 rows, high impact) |
| `docs/plan/STEP_7I_REPORT_LIFECYCLE_BASELINE.md` | **AMBIGUOUS** — disputed rank | **2** |
| `docs/plan/PHYSICAL_TEST_SLICE_48H.md` | **AMBIGUOUS** — disputed rank | **2** |
| `FINAL_MVP_SUBMISSION_READINESS_PLAN.md` | ACTIVE_SUPPORTING, substantially stale below its §0/§1 notice | **17** |
| `FINAL_MVP_PHASE_A_GOVERNANCE_RECONCILIATION.md` | Part II active; **Part I superseded with no inline marking** | **7** |
| `FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md` | ACTIVE_SUPPORTING | **4** |

### 5.1 Special-scan counts

| Scan | Result |
|---|---|
| **Stale ACTIVE GCP / Cloud Run instructions** | **14 segments in 2 files** — `FINAL_MVP_SUBMISSION_READINESS_PLAN.md` ×10 (`:230, :250, :254, :256, :258, :264, :301, :405, :445, :446`, plus `:260` partially) and `FINAL_MVP_PHASE_A_GOVERNANCE_RECONCILIATION.md` ×4 (`:49, :59, :168–176, :309`). **Zero** in `CLAUDE.md` (its one mention at `:576` is a *prohibition*), **zero** in `STATUS.md`, **zero** in `BUILD_NOTES.md`, **zero** in the Authority Lock (all 41 mentions are supersession records), **zero** in the OD-4 ruling, **zero** in `supabase/**` and **zero** in all SQL |
| **Stale ACTIVE old-OD-4 semantics** | **0.** All 18 occurrences across active governance are either inside the OD-4 ruling's own migration register, struck-and-superseded with the ruling cited, or inside correctly-bannered historical logs. Likewise **0** active assertions of `Areas to Grow` as canonical. **OD-4 propagation through governance is the single best-executed reconciliation in this corpus** |
| **Stale "28 function"** | **3** active (`FINAL_MVP_PHASE_A_GOVERNANCE_RECONCILIATION.md:67`, `STEP_7I_REPORT_LIFECYCLE_BASELINE.md:341`, `PHYSICAL_TEST_SLICE_48H.md:583`) + 1 related (`STEP_7I…:336` says 14 `authenticated` EXECUTE vs ratified 25). Correctly **not** counted: dated entries in `STATUS.md`, `BUILD_NOTES.md`, both migration trackers, the 48H logs, and the two in-migration occurrences, which are frozen history |
| **Stale "36 screen/pack"** | **0** — see §3.1 |
| **Obsolete worktree-as-active-implementation-surface** | **3** — `FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md:417` and `:98/:161`; `COMPETENCY_VOCABULARY_RECONCILIATION_PLAN.md:174-175` (assigns V2/V3 to both frozen branches) |
| **Dead STOP-AND-ASK / dead escalations** | **6** — S-27 (GCP escalation, since ruled), S-38 (SA-1 PDPA, ruled twice), S-39 (SA-3 attendance, ruled), S-42 (the 🔴 "Lock was not created" banner), S-43 (the "Live" PA-OD list, all closed), S-44 (PA-OD-7 gate, dissolved) |

### 5.2 The three highest-risk stale segments

1. **`CLAUDE.md:78, :303, :482` — four unstruck clauses instruct an agent NOT to build a ratified deliverable.** They say the evidence uploader is *"UNRESOLVED"* and *"do not invent a replacement uploader."* The operator has since ruled evidence **REQUIRED** and **named the Trainer** (`FINAL_MVP_AUTHORITY_LOCK.md:178`). The Lock predicted this exact failure at `:1055`: *"future agents will read it as still binding."* This is in the **rank-2 standing contract**.

2. **`CLAUDE.md:199` misstates live database state.** It says *"the database still stores the old labels"* and warns an agent not to *"fix"* the mismatch. The rename migration `20260806160000_competency_vocabulary_rename.sql` is at HEAD; the database stores `beginning/developing/mastering/mastered`. An agent following it would misdiagnose live schema — and `COMPETENCY_VOCABULARY_RECONCILIATION_PLAN.md:174-175` would then route it into a **frozen, `CLOSED_BY_NONUSE_POLICY` worktree branch**.

3. **`FINAL_MVP_PHASE_A_GOVERNANCE_RECONCILIATION.md:9-12` opens with a 🔴 banner reading "FINAL_MVP_AUTHORITY_LOCK.md WAS NOT CREATED"** — reversed 327 lines later at `:336`. The Lock exists (144,769 bytes, verified). A reader hitting the banner gets a false blocking instruction well before its retraction.

---

## 6. THE OD-4 MIGRATION SURFACE — NOT STALENESS, NOT DEAD CODE

OD-4 (ratified 2026-08-07) makes **Overview · Strengths · Areas for Development · Remarks** canonical and supersedes **Today's Strength · Next Focus · Practice Suggestion · Session Takeaway**. The implementation still carries the superseded model. **That is a pending migration, not an obsolescence, and none of it is a cleanup candidate.**

### 6.1 Surface totals

| Layer | Extent |
|---|---|
| **SQL (frozen migrations)** | 1 table · 4 columns · 5 functions by parameter · 3 functions by return type · 2 hash serializers with embedded literal keys · 4 deny-list assertion sites |
| **Application source** | 🔴 **203 occurrences across 17 files** — *corrected after adversarial review; the earlier "≈340 across 39 files" did not reproduce. An OD-4 plan sized at 39 files would hunt 22 that do not exist.* The 17: `features/management/management-report-review.tsx` · `features/parent/parent-canonical-report.tsx` · `features/trainer/report-panel-config.ts` · `features/trainer/trainer-draft-generation.tsx` · `features/trainer/trainer-report-review.tsx` · `lib/frontend/contracts/physical-test.ts` · `lib/frontend/fixtures/physical-test-fixture.ts` · `server/db/database.types.ts` · `server/modules/ai-drafting/{grounding,provider,request-draft-core,trusted-store}.ts` · `server/modules/integration-adapter/adapter-dtos.ts` · `server/modules/management-view/projections.ts` · `server/modules/parent-view/projections.ts` · `server/modules/report-workflow/{core,trainer-projections}.ts` |
| **Test estate** | 16 files / **227 occurrences** (+1 display-string file) |
| **Generated types** | 44 occurrences — regeneration mandatory |
| **Evidence** | `_checkpoint-evidence/F-09` (5 PNG) and `F-12` (4 PNG) render the old panels; `c4-diagnostics.json:21, :37` capture them as DOM text. Per the ruling at `:252` these remain **valid as pre-OD-4 baseline** and must be preserved and annotated externally, never rewritten |

**The single point of leverage:** `features/trainer/report-panel-config.ts:5-6, 10-11, 15-16, 20-21` is the sole source of the four English labels, consumed by three screens.

### 6.2 🔴 NINE FAIL-OPEN DENY-LISTS — the most serious technical finding of this run

**⚠️ Count corrected from seven to nine after adversarial review.** Workstreams E and F each found one half of a matched SQL/JS pair and neither reconciled them; a targeted sweep found two more with the identical failure mode.

Nine assertion sites hard-code the four implemented column names as **string-literal forbidden tokens**. **The moment the columns are renamed, every one silently stops matching and its leak check becomes vacuous — it fails OPEN, not closed.**

| # | Site | Guard |
|---|---|---|
| 1 | `scripts/tests/step-7i/static-scan.mjs:209` | T7I-18 — no RPC mutates a version's content after INSERT |
| 2 | `scripts/tests/step-7i/static-scan.mjs:385` | T7I-R22 — resolver projection declares no content column |
| 3 | `scripts/tests/correction-tracking/ct-static.mjs:135` | T-CT-S3 — correction-tracking projection declares no forbidden field |
| 4 | `supabase/migrations/20260806103000_management_correction_tracking.sql:413` | leak check on `report_list_management_corrections` |
| 5 | `supabase/migrations/20260806190000_report_context_resolver.sql:305` | leak check on `report_resolve_context` |
| 6 | `supabase/migrations/20260807113000_management_submitted_list.sql:353` | leak check on `report_list_management_submitted` |
| 7 | `supabase/migrations/20260807113000_management_submitted_list.sql:490` | regex deny-list scanned against `prosrc` |
| **8** | **`scripts/tests/correction-tracking/ct-suite.sql:176-179`** | T-CT-13 — `v_forbidden CONSTANT text[]`, `LIKE`-matched against `pg_proc.proargnames`. On rename the loop at `:194-198` never raises and `:200` prints **`PASS T-CT-13`**. *The SQL twin of site 3* |
| **9** | **`scripts/tests/management-approved/run-management-approved.mjs:159-161`** | MA-8 — literal `contentColumns` filtered against `prosrc`. On rename the array empties and `:171` emits an **affirmatively false PASS**: *"reads no version-content column"* |

Sites 8 and 9 are **runnable suites** (SQL and Node), not the unexecutable `.assertions.ts`.

**A tenth instance exists outside the OD-4 surface** and is recorded in the manifest at B0-16: `static-scan.mjs:501` `continue`s past `elevated.ts` itself, so **deleting that file makes T7I-40 pass vacuously**. The pattern is systemic, not incidental to OD-4.

**Not fail-open — these fail closed, which is correct, but they must still move in lockstep:** `lifecycle-canonical.sql:519, :567` (signature-string equality) and `run-integration.mjs:1069` (exact key-list comparison).

**This failure mode has already occurred once in this project.** The OD-4 ruling records at `:192` that the A-053 vocabulary rename left `POLARITY_BANDS[rating]` `undefined`, silently skipping the polarity rule while the suite reported green.

**Recommendation carried into the manifest:** the OD-4 migration must re-derive these deny-lists against the new names **and demonstrate each one FIRING**, not merely passing. Consider replacing literal name lists with a catalog-derived column list so no future rename can silently defeat them.

### 6.3 A ratified-decision hazard the hash serializers create

`report_content_hash_v1` (`…step_7i_report_lifecycle.sql:432-433`) and `report_wording_hash_v1` (`:497-498`) **serialize the four field names as literal JSON keys before hashing**. Stored `content_hash` / `wording_hash` values are bound to those exact strings. The OD-4 migration must make an explicit, ratified choice between freezing the `_v1` keys (preserving historical verifiability at the cost of permanent name/key divergence) and introducing `_v2` serializers (which raises the function census by 2 and requires deciding what happens to existing hashes). **Neither option may edit the `_v1` bodies.** Routed as an operator question.

---

## 7. FOREIGN MATERIAL — THE GOVERNANCE RECORD'S PREMISE IS REFUTED

Exactly **two** foreign artefacts exist in the workspace. Both now have **verified external preservation**, which the existing governance record states they do not. The orchestrator independently re-verified both findings.

### 7.1 AUTH-01 / SPORTSTER

| Field | Value |
|---|---|
| Path | `UI_REFERENCE_FINAL_MVP/AUTH-01-trainer-login/SCREENSHOT_REQUIRED.txt` |
| Size | 1,792 bytes — **not pure LF** (normalising CRLF→LF drops it to 1,788, i.e. 4 CRLF pairs; an earlier draft stated "LF only"). Immaterial to the superset proof, which normalises both sides |
| SHA-256 | `30D7BA77CF0559A34725472729F7AE727D108FF565ED6E6C6E2893DB0D3C993A` ✅ matches the Authority Lock record exactly |
| MD5 | `FA2AE6578AF8B64243DC39A77F2513F9` |
| Content | A platform-strategy essay for **"SPORTSTER"**, a sports-equipment marketplace, belonging to the HASS module **"The Design of Digital Platforms"** |

**Two external copies located, both byte-identical to each other, both a strict superset of the contaminated text** — independently re-verified by the orchestrator:

| Copy | Path | Size | SHA-256 |
|---|---|---|---|
| A | `…\OneDrive - SUTD\The Design of Digital Platforms\Sportster Context.txt` | 2,881 | `73F4A9FCB58A806C…` |
| B | `…\OneDrive - SUTD\Documents\ChatGPT\HASS - Sportster\project-info\existing project strategies and content\Sportster Context.txt` | 2,881 | `73F4A9FCB58A806C…` |

**Superset proof (orchestrator-verified):** after CRLF→LF normalization, `norm_contaminated_len = 1788`, `norm_external_len = 2838`, **`EXTERNAL_STARTSWITH_CONTAMINATED = True`**, residual **1,050 extra characters** — two whole sections (`Consumers Membership system`, `Verification system`) absent from the workspace copy.

**Timeline:** contaminated file written **01:30:46**; external `Sportster Context.txt` written **01:31:59** — **73 seconds later, and more complete**. This is a mis-paste the operator noticed and corrected within 73 seconds. **The workspace copy is the discarded, truncated, inferior version.**

**What this refutes.** `FINAL_MVP_PHASE_A_GOVERNANCE_RECONCILIATION.md:51` asserts the text is *"The only copy in existence"* and `:182` asserts it is *"not under OneDrive."* **Both are false on hash evidence.** The stated rationale for the preservation blocker — that overwriting destroys the operator's work for another module — **does not hold**: nothing would be destroyed.

**Reconstruction dependency: NONE.** The AUTH-01 Figma node ID `546:370` survives in two independent places, both confirmed present — `UI_PACK_MANIFEST.json:156-157` and `SCREEN_INDEX.md:30`. `AUTH-01-trainer-login/reference.png` is unaffected and SHA-matches both the manifest pin and the `reference/` pack.

**Preservation verdict — stated in both readings, because they diverge:**
- **Reading A ("the coursework must survive"): SATISFIED.** Two external copies, each a strict superset.
- **Reading B ("two byte-identical copies, hashes matching on all three" — the literal §31.1.3 test): NOT SATISFIED.** The hashes are not equal (externals are CRLF and 1,089 bytes longer). The exact 1,792 raw bytes exist nowhere outside the workspace.
- **Independence caveat, not smoothed over:** both external copies sit under the **same OneDrive tenant root** — two paths, one volume, one cloud replica. A sync-level deletion could propagate to both. This is **not** two independent backups in the disaster-recovery sense.

**Status: `BLOCKED_PENDING_OPERATOR_RULING`, not `BLOCKED_PENDING_VERIFIED_PRESERVATION`.** Which standard applies is the operator's call, and satisfying Reading B requires *creating* a file, which this read-only phase is forbidden to do.

### 7.2 PeakPalate — ✅ **RULED `FOREIGN_REFERENCE_RETAINED_BY_OPERATOR`, `KEEP_IN_PLACE` (OR-PA2-1, 2026-08-08)**

> **Operator ruling supersedes this section's removal analysis.** `00-PeakPalate-Master.mp4` **is** foreign to B.E.S.T and is **not** part of the 60.004 submission — the forensics below stand. But the operator **intentionally retains it** as reference material for separate later work.
>
> **It must NOT be deleted, moved, renamed, archived, transcoded or altered.** It stays at its existing workspace-root path with **bytes unchanged**, and it was backed up to **both** Phase A2 preservation snapshots as ordinary retained reference material. It remains **excluded from B.E.S.T authority, the B.E.S.T repository and B.E.S.T submission packaging**, and it is **not authoritative for B.E.S.T**.
>
> ⚠️ **Its continued presence in the workspace must never be reported as unresolved contamination.** The Q-2 ownership/removal blocker is **CLOSED**.
>
> *Forensic record retained below.*

| Field | Value |
|---|---|
| Path | `00-PeakPalate-Master.mp4` (workspace root) |
| Size | 58,387,212 bytes · SHA-256 `F80D2128489DE47F10BB0766795573AFDE9C67C325F439E98756A1828311D8AC` |
| Media | Valid MP4, H.264, `ftypisom/iso2/avc1/mp41`, **duration 1:50**, producer tag **"Made with Remotion 4.0.506"** |
| mtime / birth | 2026-08-06 22:49:23 / 2026-08-07 00:55:39 — **birth later than mtime ⇒ copied in with source mtime preserved** |

**Exact byte-identical external copy — orchestrator-verified:** `C:\Users\enyul\Downloads\Telegram Desktop\00-PeakPalate-Master.mp4`, same SHA-256, **birth 2026-08-06 22:49:17**. The Telegram copy is the **origin**; the workspace copy is the derivative. Removing the workspace copy loses nothing.

**No B.E.S.T dependency.** Workspace-wide grep returns hits only inside audit documents discussing the anomaly. Decisively: **grep for `remotion` across all 91,779 files — including all four `node_modules` trees — returns zero.** The B.E.S.T project has no Remotion toolchain, so this video could not have been produced from this workspace.

**The uncomfortable fact, left visible rather than buried:** the submission requires a **2-minute project video** (Deliverables PDF p.2 §3), none exists, and this file is a **1:50 Remotion master render** — exactly the shape of an SDS project video. On the available evidence it belongs to a project called PeakPalate, not B.E.S.T. **No frame was viewed**, so its subject is not established as fact. Even if it were a B.E.S.T video, it predates OD-4 and Amendment 006 and would narrate superseded report semantics.

### 7.3 No third foreign artefact exists
Grepped for other course codes, module names and project identifiers. `60.004 Service Design Studio` / cohort `SDS-2026` is B.E.S.T's own course and is not foreign. All other patterns returned zero or `sha512-` base64 coincidences inside `package-lock.json` integrity fields.

---

## 8. DUPLICATES — 77 GROUPS, ZERO UNCONDITIONAL DELETION TARGETS

Every collision below is a **verified SHA-256 match**. No duplicate was inferred from a filename.

| Group | Count | Content | Verdict |
|---|---|---|---|
| **A** — worktree ↔ worktree | 33 | Governance corpus, migrations, config, lockfiles | **FROZEN_BASELINE.** Co-equal frozen checkouts of the same commit. Canonical = neither. No action |
| **B** — screen pack `reference.png` ↔ `reference/` PNG | 12 | The SHA-pinned frozen reference set | **ACTIVE_SUPPORTING, not DUPLICATE.** Both sides are referenced: `reference/` is the ratified visual authority; the pack copies are wired to `UI_PACK_MANIFEST.json` and are the target of its SHA pins. Deduplicating **breaks the manifest's integrity guarantee** |
| **C** — `_checkpoint-evidence` cross-checkpoint | 3 | `auth-01/02/03` PNGs shared by F2↔F3, F2↔F10, F2↔F13 | **HISTORICAL_EVIDENCE.** The identical hash *is* the finding — it proves no regression across checkpoints. Deleting either side leaves F3, F10 and F13 **completely empty**, erasing the record that those checkpoints produced evidence at all. 200,575 bytes is not worth an unrevertible edit |
| **D** — inside the frozen demo | 3 | incl. `dashboard_v2` byte-identical to `dashboard` | **FROZEN_BASELINE.** No action. (Noted: the "v2" is not a revision) |
| **E** — genuine cross-tree | 4 | spec v3 (`governance-source` ↔ `docs/spec`), `local_fixtures.sql`, `run-concurrency.mjs`, `favicon.ico` ×4 | Canonical designated per row; every non-canonical side is either FROZEN_BASELINE or a per-repo build asset. No action |

**Net: 0 duplicate groups are safe unconditional deletion targets.** Every collision is a frozen baseline, a live dual-reference, or evidentiary.

⚠️ **Arithmetic disclosure, added after adversarial review.** The five families above total **55** groups, not the 77 stated in the heading. The remaining **22** are small cross-tree collisions inside `node_modules` and build output that were hashed but not itemised, because every one resolves to KEEP by the same reasoning. **The 77 figure is the full hashed-set count; the table itemises only the 5 material families.** No verdict depends on the difference.

**Additional hash finding:** within `UI_REFERENCE_FINAL_MVP`, **zero duplicate text-file hashes exist**. All 37 `reference/*.md`, all 35 `.html`, both `.txt`, all 36 `screen.md`, all 36 `implementation-notes.md` and all 36 `SCREENSHOT_REQUIRED.txt` are byte-unique. The 20 stub `implementation-notes.md` files *look* identical but each embeds its own screen ID — they are **not** duplicates.

---

## 9. ORPHANS, SCRATCH AND BULK

### 9.1 Orphan / temp sweep — **ZERO findings**
All 91,779 files scanned for `*.tmp`, `*~`, `*.bak`, `*.orig`, `*.rej`, `*.swp`, `.DS_Store`, `Thumbs.db`, `desktop.ini`, `*.lnk`; the filtered tree additionally for `*.log`, `*.old`, `*.save`, `*.autosave`, `Copy of *`, `* (1).*`, `* - Copy.*`. **Zero hits in every category.** The only pasted-text artefact in the workspace is the AUTH-01 file.

The test estate is equally clean: **no** `playwright-report`, `test-results`, `coverage`, `.last-run.json` or `*.log` anywhere, and `git status --untracked-files=all` returns **zero untracked files**. This is by design — the F17 runner discards child output and gate H-1 verifies the run *"leaves no server, no browser and no held port behind"*; C4's control N-12 measured the same after teardown.

### 9.2 ✅ ~~🔴 Mismatched extensions — the highest accidental-loss risk in the workspace~~ → **RESOLVED 2026-08-08**

> **Both files were renamed `.txt` → `.html` with bytes unchanged** (pre/post SHA-256 identical: `c9fc75ac…` and `68c8654f…`), under operator ruling Q-25 which corrected the Authority Lock's singular rename count to two. **`reference/` now holds 37 `.html`, 37 `.png`, 37 `.md` and ZERO `.txt`** — the hazard described below no longer exists, because there is no `.txt` left in the tree for a `.txt`-class sweep to reach. *The rule that no cleanup may treat `.txt` as a deletable class remains sound guidance and is retained.*
>
> *Historical analysis follows, in the present tense it was written in.*

| Path | Size | Actual content |
|---|---|---|
| `UI_REFERENCE_FINAL_MVP/reference/Management - Students/Management - Students.txt` | 46,166 | **HTML** — `<div style="width: 1440px; height: 1160px; …` |
| `UI_REFERENCE_FINAL_MVP/reference/Trainer - Students/Trainer - Students.txt` | 37,574 | **HTML** — `<div style="width: 1440px; height: 1120px; …` |

All 35 other `reference/` folders hold a `.html` + `.md` + `.png` triple. **These two hold `.md` + `.png` + `.txt` and no `.html` at all** — the `.txt` *is* the Figma HTML export, misnamed. They are the **sole visual authority for screens 04 and 17**, and they carry px dimensions and CSS custom-property tokens that exist nowhere else.

**A cleanup rule written as "keep `*.png *.md *.html`, sweep `*.txt`" — a completely natural rule, since the other 37 `.txt` files in this tree are placeholder TODOs — silently destroys both.** Correct remediation is **rename to `.html`**, never deletion. **No cleanup rule may treat `.txt` as a deletable class.**

Other format checks: the tree holds **38** `.txt` files in total — 2 are the HTML renders above, 1 is the AUTH-01 SPORTSTER contamination, and the remaining **35** are genuine `SCREENSHOT_REQUIRED.txt` placeholders *(counts corrected after review; the rule that `.txt` is not a deletable class is unaffected)*; **all 30 `.json` files parse cleanly** (a PowerShell 5.1 false positive on four `package-lock.json` files was re-validated and retracted rather than reported); all 223 `.md` files are free of binary contamination.

### 9.3 Bulk footprint — informational, no deletion proposed

| Area | Files | MB |
|---|---|---|
| `SDS Project Final (BEST Coach)` | 24,139 | 1,094.0 (`node_modules` 629.3 · `.next` **449.8** · `.git` 5.0) |
| `SDS Project Sprint 2` (frozen demo) | 21,564 | 565.2 (`node_modules` 403.2 · `.next` 154.7 · `.git` 3.2) |
| `worktrees/backend-48h` | 22,444 | 641.8 (`node_modules` 629.3 · `.next` 6.3) |
| `worktrees/frontend-48h` | 23,270 | 907.8 (`node_modules` 629.3 · `.next` **275.2**) |
| `UI_REFERENCE_FINAL_MVP` | 343 | 18.7 |
| **WORKSPACE TOTAL** | **91,779** | **3,284.4** |

`node_modules` ×4 = 2,291 MB (69.8%); `.next` ×4 = 886 MB (27.0%). **Together 96.8% of the workspace.** All `.git` combined = 8.6 MB (0.26%).

**The frozen demo is 96.1% `node_modules` — only 58 files are tracked, ~3 MB.** A source-only archive would be a 200:1 reduction. Recorded for archival consideration only; **no deletion is proposed**.

**`00-PeakPalate-Master.mp4` is the only non-dependency, non-build file in the top 40 by size**, and the only one not machine-regenerable.

---

## 10. FROZEN DEMO AND THE TWO 48H WORKTREES

### 10.1 Frozen demo — `FROZEN_BASELINE`, protected, no removal proposed
Own repository, single commit `8d4acf4` (*"chore(demo): freeze verified trainer-flow baseline at step 14"*), working tree **clean**, 0 remotes. **Doubly protected** — the frozen baseline *and* the Sprint 2 continuity artefact the Deliverables PDF requires.

**Unique content confirmed:** all 9 `reference/*.png` are unique against every PNG in `UI_REFERENCE_FINAL_MVP`; `AGENTS.md` exists **only** here; `DEMO_BUILD_PLAN.md`, `progress_tracking.md` and the entire demo app exist nowhere else. **No CHIPS 1–4 and no Sprint 1 material exists anywhere in the workspace** (`FINAL_MVP_AUTHORITY_LOCK.md:847`), so this is the **sole surviving sprint artefact** and continuity evidence has zero redundancy.

⚠️ **`SDS Project Sprint 2/.env.local` (179 bytes) is gitignored and untracked** — it exists in no git object anywhere and is unrecoverable if the directory is lost. Contents not read.

### 10.2 Both 48H worktrees — `SAFE_TO_PROPOSE_WORKTREE_REMOVAL_AFTER_OPERATOR_APPROVAL`

All four proof legs hold for **both** worktrees:

| Leg | `backend-48h` @ `402b0b6` | `frontend-48h` @ `6762b5c` |
|---|---|---|
| **(a) clean, no unique untracked content** | `status --porcelain` empty; 5 disk-only files, all machine-derived caches, each inspected | `status --porcelain` empty; 2 disk-only files, both compiler-emitted |
| **(b) branch ref survives removal** | Loose ref `.git/refs/heads/feat/48h-backend` = `402b0b6`, stored in the parent `.git`; HEAD attached | Loose ref = `6762b5c`; HEAD attached |
| **(c) content merged or preserved** | `merge-base --is-ancestor` exit 0; `rev-list --count main..branch` = **0**; `diff main...branch --stat` **empty**; 71 commits behind | Same; **0** unique commits; **empty** diff; 64 commits behind |
| **(d) no doc exists only here** | All 24 tracked `.md`/`.sql`; 22 identical to `main`, 2 superseded versions readable from the ref | All 23 tracked `.md`; 19 identical, 4 superseded versions readable from the ref |

Neither is cited as a *physical directory* by any authority document. Reclaimable if approved: **~1,646 MB**, of which 1,352 MB is `node_modules` and 285 MB is `.next`.

⚠️ **This remains a proposal.** `CLAUDE.md:665-669` and Authority Lock §31.11 require all five conditions **plus explicit operator approval**; removal is expressly **not** authorized by the standing ruling.

---

## 11. HOSTED-DEPLOYMENT BLOCKERS SURFACED BY THIS AUDIT

Not cleanup items — recorded because Phase A2 discovered them and the manifest must not imply the workspace is deployment-ready.

1. 🔴 **No Management bootstrap path exists anywhere.** Confirmed independently from the database side (workstream E) and the application side (workstream D). No seed, no Edge Function, no migration INSERT into `accounts`/`centre_memberships`/`invitations`, no RPC that creates a membership, no INSERT/UPDATE/DELETE policy on any table, `service_role` holds EXECUTE on **0** functions. `membership.bootstrap` exists **only as a reserved audit action name** that nothing emits. The sole identity-creation path is `scripts/fixtures/load-local-fixtures.mjs:733`, which structurally refuses to run outside the local Docker stack. **A fresh hosted database would be permanently unenterable.**
   ⚠️ **And the obvious fix is the one the design forbids:** `supabase/config.toml:66-71` declares `[db.seed] sql_paths = ["./seed.sql"]` but the file does not exist — and `docs/plan/STEP_7F_SYNTHETIC_FIXTURE_BASELINE.md:369` records that absence as **deliberate**, to keep a tracked-file→hosted-database path closed. Routed as an operator question.

2. 🔴 **The draft-storage transport is `docker exec` and is on the live participant path.** `server/modules/report-workflow/actions.ts:52` imports and **`:103`** constructs `LocalTrustedDraftStore` *(citation corrected from `:100` after review)*, which `spawn`s `docker exec -i supabase_db_best-coach-mvp psql` (`trusted-store.ts:34, :122`). This is **production code, not test code**, and it is the only channel to `report_store_draft`. AI draft generation cannot complete in any hosted runtime until the ratified `bc_draft_channel` definer wrapper replaces it.

3. 🔴 **Public signup is open with confirmations off and no captcha** — `config.toml:176`, `:221`, `:226`, `:214-217`.

4. 🟠 **Auth URLs are loopback and internally inconsistent** — `site_url = "http://127.0.0.1:3000"` (`:159`) vs `additional_redirect_urls = ["https://127.0.0.1:3000"]` (`:163`), differing in scheme.

5. 🟠 **No production SMTP** — `[auth.email.smtp]` entirely commented (`:236-244`); local Inbucket only; rate limit 2 emails/hour.

6. 🟠 **Generated types are one migration behind** — `server/db/database.types.ts` lacks `report_list_management_submitted` while `server/modules/management-view/projections.ts:276` calls it. Regenerated at `61d417c` (03:49); migration 12 landed at `14444b0` (05:53).

7. 🟡 **Hardening gaps** — SSL enforcement commented out (`:83-85`); an inert `0.0.0.0/0` + `::/0` allow-all CIDR block behind `enabled = false` (`:73-81`); `minimum_password_length = 6` with no complexity requirement; MFA disabled; no session timebox; `major_version = 17` unverified against the hosted instance.

8. 🟠 **No `npm test` exists.** No playwright/vitest/jest config anywhere; every test is a bespoke `node scripts/*.mjs` runner. **Four `.assertions.ts` files are unexecutable** — `tsconfig.json` sets `noEmit: true`, there is no build output and nothing imports them, yet `design-foundation.assertions.ts:7` claims they are *"run compiled, the same way the existing fixture assertion suites are run."* **No such compile path exists**, so any past claim that they passed is unsupported.
   Six suites **are** portable today and are the seed of a real `npm test`: `asm-static.mjs`, `c2-static.mjs`, `c3-static.mjs`, `static-scan.mjs`, `app-route-census.mjs`, and — highest value — `integrated-route-security.mjs`, which runs against a hosted URL with **no credential** (last recorded: exit 0, 25/25 assertions, 15 guarded portal routes).

9. **`README.md` is untouched `create-next-app` boilerplate** (37 lines, unmodified since repo init) against a brief that requires a real one. It documents `yarn/pnpm/bun` for a project pinning `npm@11.13.0`, advertises Geist fonts the project does not use, and mentions none of: the Supabase prerequisite, `npm run fixtures:local`, the Docker requirement, required env vars, the `proxy.ts`-not-`middleware.ts` convention, or the three portals.

10. **No C3 narrative report exists anywhere** (`AUTONOMOUS_48H_RUN_C3_REPORT.md` — filename sweep returns nothing), though `FINAL_MVP_AUTHORITY_LOCK.md:412` cites Run C3-A as accepted evidence. C1, C2 and B all have narrative reports.

---

## 12. EVIDENCE ESTATE — 95 FILES, ENTIRELY UNTRACKED

⚠️ **PARTLY SUPERSEDED 2026-08-08 (repository-boundary normalization): `UI_REFERENCE_FINAL_MVP/_checkpoint-evidence` — 88 of these 95 files — is now TRACKED and git-recoverable.** The finding below still holds for the remaining **7** files in the three `_*-evidence/` trees, which stayed at the workspace root. *(The consequence is conservative — it over-protects — so acting on the original text is safe; it is corrected for accuracy, not because it is dangerous.)* ~~**Not one of the 95 evidence files is in any git repository.**~~ `_c4-lifecycle-evidence`, `_f17-disposable-evidence`, `_g6-activation-evidence` ~~and `UI_REFERENCE_FINAL_MVP/_checkpoint-evidence`~~ sit outside all four repos — by design, and stated in their own READMEs. **Therefore no deletion anywhere in the evidence estate is reversible, and the proposed action for all 95 files is PRESERVE**, including the items classified duplicate or superseded. Total cost: **10,309,554 B (10.3 MB)** — *corrected from an earlier "~13 MB"; 99.3% of it is `_checkpoint-evidence`, 88 of the 95 files.*

**Coverage:** C1 ✅ · C2 ✅ · C3-A ⚠️ harness only, no ledger, no narrative · C3-C/G-6 ✅ strongest (16/16 PASS, real provider, 2 billed calls) · C4 ✅ (29 PASS / 0 FAIL / 0 NOT-RUN) · F17 ⚠️ split.

⚠️ **`_checkpoint-evidence/F17/gate-ledger.md` is a `--preflight-only` run: 22/22 gates NOT-RUN, no server started, no browser started, end-checksum not read. It decides nothing and must never be cited as F17 evidence.** The real F17 record is `_f17-disposable-evidence/disposable-gate-ledger.md` (21 gates decided, 4 PASS / 18 NOT-RUN).

### 12.1 Evidence-integrity sweep

**The estate itself is clean.** Zero hits for `usability`, `human`, `human-equivalent`, `user testing` or `UAT` across all 95 files. Every `participant` hit is the technical adapter identifier `real_participant_adapter`, and several fixture files **self-disclose** as *"Deterministic fixture mode — not the participant adapter."*

**The one live mislabel is confirmed at exactly the predicted location** — `UI_REFERENCE_FINAL_MVP/AUTONOMOUS_48H_RUN_B_FINAL_REPORT.md:372` describes *"structured human-equivalent review by an independent agent"* of PNG files. **Partially mitigated** by the same sentence disclosing "by an independent agent" and closing *"Screen-level fidelity claims rest on reasoned review, not pixel equality."* It is HISTORICAL_EVIDENCE and **must not be rewritten**; the control is that it is never quoted as usability evidence.

**The C-10 correction is verified applied** at `CORE_SCREENSHOT_VALIDATION_REPORT.md:47` and `:297` — struck through, preserved, superseded, dated. **No previously-unknown mislabel was found.**

⚠️ **Terminology hazard, not a mislabel:** `participant` / `real_participant_adapter` / *"Participant eligible: yes"* are technically accurate software identifiers that **read as human-subject language to an outside examiner**. They are baked into untracked historical evidence that §31 forbids rewriting. The control must be a submission glossary entry, not a purge.

---

## 13. CONSOLIDATED CLASSIFICATION COUNTS

| Classification | Count | Basis |
|---|---|---|
| **ACTIVE_AUTHORITATIVE** | ~290 | 155 UI-tree + 118 app-source + governance instruments + 12 migrations + 2 PDFs |
| **ACTIVE_SUPPORTING** | ~120 | 49 UI-tree + 51 scripts/tests + 12 Supabase + root planning documents |
| **HISTORICAL_EVIDENCE** | ~200 | 115 UI-tree + 95 evidence estate + bannered logs + `governance-source` |
| **FROZEN_BASELINE** | ~45,000 files | 12 migrations · 12 frozen PNGs · frozen demo · both worktrees |
| **SUPERSEDED_ARCHIVE** | **4** | `governance-source/CLAUDE.md` · `governance-source/BEST_Coach_Implementation_Plan.md` · `complete mvp screens compiled figma list.txt` · `_checkpoint-evidence/F17/gate-ledger.md` |
| **DUPLICATE** | **77 groups / 186 files** — **0 unconditionally deletable** | All frozen, dual-referenced, or evidentiary |
| **STALE_SEGMENT** | **63** | Text segments inside otherwise-active files |
| **UNUSED_IMPLEMENTATION_ARTIFACT** | **12 + 2,857 build-cache files** | 8 app-source (2 deliberate governance anchors) · 3 evidence-folder scripts · 1 CLI cache set · all `.next` caches |
| **FOREIGN_CONTAMINATED** | ~~2~~ → **0 remain** | **AUTH-01 `SCREENSHOT_REQUIRED.txt`** → ✅ resolved 2026-08-08: `FOREIGN_CONTAMINATION_REMOVED_AND_BEST_AUTHORITY_RESTORED`. · **`00-PeakPalate-Master.mp4`** → ✅ reclassified 2026-08-08 by operator ruling OR-PA2-1 as **`FOREIGN_REFERENCE_RETAINED_BY_OPERATOR`, `KEEP_IN_PLACE`** — **it is NOT unresolved contamination and must not be reported as such** |
| **FOREIGN_REFERENCE_RETAINED_BY_OPERATOR** | **1** | `00-PeakPalate-Master.mp4` — intentionally retained, byte-identical, excluded from B.E.S.T authority/repo/submission |
| **AMBIGUOUS** | **19** | Routed as operator questions in the manifest |
| **REQUIRES_FUTURE_OD4_MIGRATION** (separate axis) | 39 source files ≈340 sites · 16 test files / 227 occurrences · 1 table / 4 columns / 8 SQL functions / 2 serializers / 7 deny-lists | Not a cleanup class |

**Protected material (BATCH 0):** every item in Authority Lock §31.1–§31.13, plus the additions this audit proves necessary — **the 25 unduplicated `reference/` PNGs**, **the 2 HTML-in-`.txt` renders**, **the 95-file untracked evidence estate**, **`SDS Project Sprint 2/.env.local`**, and **the two unimported governance-anchor modules** (`elevated.ts`, `browser.ts`) whose deletion would break four assertions written against them.

---

## 14. WHAT THIS AUDIT CONCLUDES

**The correct Phase A2 outcome is to delete almost nothing.** Applying the classification rules honestly eliminates nearly every candidate:

- **0** files proposed for deletion in `UI_REFERENCE_FINAL_MVP` — the same conclusion the 2026-08-07 manifest reached, now for a **stronger** reason: that audit called `reference/` too ambiguous to touch; operator ruling PA-OD-5/5b has since ratified it as authority.
- **0** files proposed for deletion at the workspace root.
- **0** duplicate groups safe to deduplicate.
- **0** evidence files safe to remove.
- **0** applied migrations touchable.
- The only material reclamation available is the **two 48H worktree directories (~1,646 MB)**, and only on explicit operator approval.

**The real Phase A2 work is not deletion — it is correction and preservation:**
1. **63 stale segments** in active governance, four of which instruct agents not to build ratified deliverables.
2. **Two renames** (`.txt` → `.html`) that prevent an irreversible accidental loss.
3. **Two foreign artefacts** whose preservation standard needs an operator ruling — both already preserved externally, contrary to the record.
4. **The 25 unduplicated `reference/` PNGs** need a verified backup. **That is a copy-out, not a cleanup, and it is the single operation most worth doing first.**

⚠️ **The standing risk that dominates all of the above: 0 remotes on every repository.** 3.28 GB of work, including graded continuity evidence, the entire untracked evidence estate, and every ungit'd governance document, exists as a single copy on one Windows disk. **This raises the cost of any mistake to unrecoverable, and it is independent of anything this audit proposes.**

---

## 15. SEQUENCING CONSTRAINT — UNCHANGED AND BINDING

**No automated cleanup may run over `UI_REFERENCE_FINAL_MVP` until the AUTH-01 incident is resolved** (Authority Lock §31.2). The contaminated file has mtime `2026-08-07 01:30` while every sibling in its folder is `2026-08-05 23:47` — **any heuristic that ranks within a pack folder by modification time selects the SPORTSTER contamination as the most current artefact.**

The precise justification, stated at the scope where it is true: the file is **not** the newest in the pack — it is **sixth**. It **is** the newest within its own pack folder and the newest among the 36 screen-pack folders. That is sufficient, and the overstated version has now been struck three times across three separate runs.

**The binding rule: resolve AUTH-01 first, then sort by content and governance status — never by mtime at any scope.**
