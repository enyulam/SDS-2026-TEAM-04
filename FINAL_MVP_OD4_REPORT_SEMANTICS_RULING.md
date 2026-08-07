# OD-4 — FINAL MVP REPORT SEMANTICS · OPERATOR RULING AND MIGRATION REGISTER

**Instrument type:** Operator ruling (§2.3 class) + read-only implementation inventory.
**Ruled:** 2026-08-07, Asia/Singapore, by explicit operator ruling.
**Status:** **RATIFIED.** This is the canonical Final MVP report-narrative model.
**Authorizes nothing.** No application code, schema, migration, fixture, database row, test or configuration was created or modified to produce it. Phase A2 has not begun.

**Precedence.** This ruling is an **explicit operator ruling** and is therefore the highest authority on the question it addresses, per `FINAL_MVP_AUTHORITY_LOCK.md` §2.3. Where the Authority Lock, `CLAUDE.md`, the specification, an amendment, a plan or a `reference` pack disagrees with this file **on the identity and meaning of the four report narrative panels**, this file governs. It changes **nothing else** — see §7.

---

## 1. THE RULING

The four canonical Final MVP report narrative panels are:

1. **Overview**
2. **Strengths**
3. **Areas for Development**
4. **Remarks**

The previously governed four concepts — **Today's Strength · Next Focus · Practice Suggestion · Session Takeaway** (spec §8) — are **SUPERSEDED_BY_OD-4_FINAL_REPORT_MODEL** as the Final MVP semantic model.

**This is a semantic-model change, not a cosmetic relabel.** The old concepts are not preserved as the canonical model merely because they are what is currently implemented. Implementation status is not authority.

### 1.1 Canonical panel meanings

| Panel | Canonical meaning |
|---|---|
| **Overview** | A general narrative summary of the learner's performance/session. It **may** synthesize relevant strengths, overall performance and developmental context, and is **not restricted to positive observations**. |
| **Strengths** | Positive demonstrated capabilities, behaviours, progress or performance, supported by the Trainer's governed assessment facts. |
| **Areas for Development** | Specific capabilities, behaviours or performance areas that would benefit from continued development/support. |
| **Remarks** | Additional relevant report commentary that does not naturally belong in Overview, Strengths or Areas for Development. **Remarks is NOT an unrestricted place for unsupported claims** — it is subject to grounding and governance in full, exactly like the other three. |

### 1.2 What resolves the mapping objection

The prior governance record (`FINAL_MVP_AUTHORITY_LOCK.md` §15.1; `FINAL_MVP_PHASE_A_GOVERNANCE_RECONCILIATION.md` G-10) declined to adopt the frame headings on the ground that *"Overview" and "Remarks" have no governed counterpart, so adopting them would silently redefine what each stored field means to a parent.*

**That objection was correct and is now discharged — not overridden.** The operator has not renamed four fields; the operator has **defined four new semantic concepts explicitly** (§1.1) and superseded the old model. Nothing is silent: the redefinition is stated, the meanings are written, and the storage migration is registered in §5 rather than assumed to be a relabel. G-10's own reasoning identified that adopting the frame *"would be an amendment, not an adjudication"* — an **operator ruling is the instrument that discharges that**, and it has now been issued.

### 1.3 A conflict inside the ratified visual authority, resolved by this ruling

The `reference` tree is **internally inconsistent** on the third panel's label, and no prior document recorded this:

| Pack | Line | Third-panel label |
|---|---|---|
| `reference/Parent - Class Report/Parent - Class Report.md` | `:11` | **Areas for Development** |
| `reference/Trainer - Student Report/Trainer - Student Report.md` | `:12` | **Areas for Development** |
| `reference/Management - Student Report/Management - Student Report.md` | `:11` | *Areas to Grow* |
| `reference/Trainer - AI Report Generation/Trainer - AI Report Generation.md` | `:14` | *Areas to Grow* (Remarks is drawn as a separate input at `:15`) |
| `reference/Management - Term Report/Management - Term Report.md` | `:11` | *Areas to Grow* (three panels only; Term Report is out of MVP scope) |

**The ratified label is `Areas for Development`.** `Areas to Grow` is a variant inside the visual authority and is **not** the canonical name.

⚠️ **`FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md:396` states OD-4's frame option as *"Overview / Strengths / Areas to Grow / Remarks"*.** That is the minority variant. The Authority Lock §15.1 quoted the majority variant correctly. Corrected here and in the screen plan.

---

## 2. ROLE CONSISTENCY — ONE MODEL, THREE AUTHORITIES

**There is exactly one canonical report narrative model across all three roles.** Role differences concern **authority and lifecycle state**, never panel semantics.

| Role | Sees | Authority over the four panels |
|---|---|---|
| **Trainer** | Overview · Strengths · Areas for Development · Remarks | **Sees and edits** within the governed workflow |
| **Management** | The same four | **Wording-only edit** of those four, and nothing else |
| **Parent** | The same four, from the canonical **submitted** version | **Read-only** |

**Management remains unable to change** — ratings · attendance · observations · Trainer notes · evidence · any assessment fact. Writes outside the four wording fields are **rejected server-side**, not merely hidden (`CLAUDE.md` §6; A-034; Authority Lock §14). **This ruling does not widen or narrow that allow-list**: it remains exactly four columns. The ratified *"the database enforces which columns management may write, not how much"* trade (G-15 / A-004:119) is **unchanged**, and widening or narrowing the arity remains a stop-and-ask.

**Parent remains read-only**, gated on a live `parent_student_links` row and a report that has actually reached `submitted`. Every parent prohibition in Authority Lock §15 stands **verbatim and unweakened**: no per-dimension rating grid in any form or wording, no drafts, no pre-submission versions, no AI draft history, no internal trainer notes, no internal evidence, no content hash, no revision number, no management or trainer controls.

---

## 3. AI CONTRACT

The future Final MVP AI drafting contract **must generate the four canonical semantic outputs directly**:

```
overview · strengths · areas_for_development · remarks
```

**The AI must NOT generate the old four concepts internally and relabel them at the UI.** A relabelling shim is expressly prohibited by this ruling: the model is instructed to the new semantics, and the structured-output contract names the new fields.

All four outputs remain:

- **schema validated** — provider-side JSON schema (`strict: true`) **plus** independent deterministic re-validation of shape, key count, non-emptiness and length, applied regardless of provider;
- **grounded** in governed Trainer assessment facts, by deterministic closed-lexicon validation with no model consulted;
- **fail-closed** — network, timeout, non-OK, unparseable and ungrounded outcomes all refuse, leaving no false `draft_ready`;
- **editable by the Trainer**;
- **wording-editable by Management** according to governance;
- **persisted canonically** as an immutable `report_versions` row;
- **projected read-only to the Parent** after submission.

**AI authority is otherwise entirely unchanged.** The AI still **drafts only** — it does not rate, approve, submit or publish. R-27 is untouched: `report_store_draft` holds **zero client EXECUTE, permanently**. The nine ratings and every assessment fact remain Trainer-authored. Authority Lock §12 stands in full; only the four output *semantics* move.

---

## 4. STORAGE / DATABASE INVENTORY — READ-ONLY, AS OF 2026-08-07

Method: repository-wide search of the app repo at `SDS Project Final (BEST Coach)` for `todays_strength` · `next_focus` · `practice_suggestion` · `session_takeaway` and their camelCase and display-string forms, excluding `node_modules`, `.next` and the two worktrees. **Nothing was modified.**

### 4.1 Where the semantics live today — and where they do NOT

**They live in exactly four representational forms:** SQL column names, SQL function parameter and result names, TypeScript property names, and display strings.

**They do NOT live in:**

| Representation | Finding |
|---|---|
| **Enums** | **NO_CHANGE.** All **12** enums enumerated; none encodes a panel vocabulary. The panels are nullable `text` columns, never an enum. **No enum value is created, renamed or removed by OD-4.** |
| **Audit action names** | **NO_CHANGE.** The Step 7H registry's report actions are **three** — `report.created`, `report_version.created`, `report.state_changed` (`20260804213000_step_7h_audit_chain.sql:440-442`, restated at `:745-747`). No action name, and no audit payload, carries a panel name. Extending the registry remains a standing stop-and-ask and OD-4 does not require it. *(Corrected after review — an earlier draft of this row named only two of the three. The conclusion is unaffected; the enumeration was wrong, and this lock's registry counts are treated as exact.)* |
| **`report_status`** | **NO_CHANGE.** The eight values and 14 transitions are untouched. No ninth status. |
| **RLS policies / grants** | **NO_CHANGE.** All 29 policies are `SELECT`; none references a panel column by name. Grant posture, R-27 and the owner-only function set are unaffected. |
| **Ratings / dimensions / attendance / observations** | **NO_CHANGE.** OD-4 touches narrative identity only. |

### 4.2 Classified register

Legend: **SR** = `SEMANTIC_RENAME_REQUIRED` · **SL** = `SEMANTIC_LOGIC_CHANGE_REQUIRED` · **D** = `DISPLAY_ONLY_CHANGE` · **N** = `NO_CHANGE`.

| # | Contract | Location | Class | Note |
|---|---|---|---|---|
| 1 | **`report_versions` columns** `todays_strength`, `next_focus`, `practice_suggestion`, `session_takeaway` | `20260803034500_step_7e_governed_core.sql:777-780` | **SR** | Four nullable `text` columns. The canonical storage of the model. |
| 2 | **`report_content_hash_v1`** — params **and** the `v_names` envelope array | `…step_7i_report_lifecycle.sql:404-480` | **SL** | ⚠️ **The field names are inside the SHA-256 preimage** (`:431-434`). Renaming changes every hash the function can produce. See §5.1. |
| 3 | **`report_wording_hash_v1`** — params **and** its `v_names` array | `…7i:482-…` (`:496-499`) | **SL** | Same preimage property, separate domain. This is management's "exact text I approved" proof. See §5.1. |
| 4 | **`report_versions.content_hash_version`** `CHECK (content_hash_version = 1)` | `…7i:183, 189-190` | **SL** | A V2 envelope cannot be stored until this CHECK is relaxed. The column comment already prescribes the path: *"A future envelope increments this value and ships a PARALLEL serializer; committed rows are never re-serialized."* |
| 5 | **`report_store_draft`** — 4 params | `…7i:1023-1026`, non-degeneracy guard `:1092-1095`, insert `:1140-1145` | **SR** | Owner-only (R-27); zero client EXECUTE, unchanged. Rename only. |
| 6 | **`report_save_edit`** — 4 params + the byte-identical reaffirmation comparison | `…7i:1309-1312`, `:1395-1398`, `:1426-1429`, `:1448-1463` | **SR** | The reaffirmation comparison is field-by-field; rename propagates mechanically. |
| 7 | **`report_management_edit_wording`** — 4 params | `…7i:1924-1927`, `:2011-2034` | **SR** | ⚠️ **This signature IS the A-034 wording-edit allow-list.** Arity must stay **exactly four**. Renaming preserves the allow-list; widening or narrowing it is a stop-and-ask and is **not** authorized here. |
| 8 | **`report_trainer_approve`** — reads the candidate's four fields to re-hash | `…7i:1814-1815` | **SR** | Rename only. |
| 9 | **Read RPC result shapes** — `report_get_canonical`, `report_get_working`, `report_get_management_review` | `…7i` (multiple) | **SR** | The four names appear as returned column names. `report_resolve_context` itself returns only two uuids and is **N** in substance. |
| 9a | ⚠️ **IN-MIGRATION LEAK-POSTURE DENY-LISTS — three, and they are NOT result shapes** | `20260807113000_management_submitted_list.sql:353` and the `prosrc` regex at **`:490`** · `20260806190000_report_context_resolver.sql:305` · `20260806103000_management_correction_tracking.sql:413` | **SL** | ⚠️ **FAIL-OPEN HAZARD.** These are `v_forbidden` assertion arrays and a `pg_proc.prosrc` regex that **prove a new read path exposes no report content**. A deny-list is not "renamed" — a stale one **silently stops detecting the leak it exists to catch**, and the assertion still passes green. This is structurally the same failure mode as the A-053 fail-open grounding degradation already recorded in `STATUS.md` (`POLARITY_BANDS[rating]` became `undefined` and the polarity rule was **silently skipped** while the suite reported green). Each must be **re-derived and demonstrated firing**, and the OD-4 migration's own end-of-migration assertions must not copy a stale list. *(Added after review — an earlier draft folded these into row 9 and called them "returned column names and comments", which is false at source and prescribed the wrong treatment.)* |
| 10 | **Generated database types** | `server/db/database.types.ts` — **44 occurrences** | **SR** | **Regenerate; never hand-edit.** Hand-editing generated types is prohibited (`CLAUDE.md` §12, A-053 clause). |
| 11 | **`ReportPanels`** (domain type) + the two RPC argument maps | `server/modules/report-workflow/core.ts:38-41, 108-111, 259-262` | **SR** | |
| 12 | **`AiDraftPanels`** + `PANEL_KEYS` + `RESPONSE_SCHEMA` | `server/modules/ai-drafting/provider.ts:45-48, 82-85, 95-100, 244-247` | **SR** | The structured-output contract. Key count assertion is 4 and stays 4. |
| 13 | **`SYSTEM_PROMPT`** | `server/modules/ai-drafting/provider.ts:104-112` | **SL** | ⚠️ Rule 6 (*"Return ONLY the four requested fields"*) survives, but the prompt must instruct the **new semantics directly** (§3). A prompt that still describes a single "today's strength" and a "practice suggestion" would be the prohibited relabelling shim. |
| 14 | **Grounding rule 4** — *"a needs_support dimension may never be presented as the strength"* | `server/modules/ai-drafting/grounding.ts:206-215` | **SL** | ⚠️ **The load-bearing logic change.** The rule is hard-keyed to `panels.todaysStrength`. Under OD-4 the pure-positive panel is **Strengths**, and **Overview may legitimately carry developmental context** (§1.1) — so retargeting this rule to `overview` would produce **false rejections of correctly-grounded drafts**, and leaving it on a renamed field silently applies the wrong semantics. It must be **re-derived**, not renamed. A companion consideration arises with it: `areas_for_development` is *expected* to name non-positive dimensions, so the rule must not be extended there either. |
| 15 | **Grounding rules 1–3, 5** | `grounding.ts` (A-052 attribution/taxonomy; sentence-level polarity; placeholder detection) | **SR** | Panel-agnostic — they iterate `PANEL_KEYS` and concatenated text. Rename propagates; **logic is unchanged**, and the A-052 prohibition on a bare-word rating regex is untouched. |
| 16 | **Fixture draft provider** — the four deterministic sentences | `server/modules/ai-drafting/provider.ts:267-270` | **SL** | Keys rename **and** the prose must be re-authored to the new meanings. A "Practice Suggestion" sentence relabelled `remarks` would encode the superseded model into every fixture-mode run and every harness that asserts against it. |
| 17 | **`request-draft-core.ts`** panel pass-through | `server/modules/ai-drafting/request-draft-core.ts:242-245` | **SR** | |
| 18 | **`trusted-store.ts`** — the draft-storage channel argument mapping | `server/modules/ai-drafting/trusted-store.ts` (8 occurrences) | **SR** | Interacts with the PA-OD-9 hosted-transport work (Authority Lock §18); the two must be sequenced, not merged. |
| 19 | **`ReportPanelsDto`** (frontend contract) | `lib/frontend/contracts/physical-test.ts:123-126` | **SR** | |
| 20 | **Integration-adapter DTO** | `server/modules/integration-adapter/adapter-dtos.ts:124-127` | **SR** | |
| 21 | **Trainer / Management / Parent projections** | `report-workflow/trainer-projections.ts` · `management-view/projections.ts` · `parent-view/projections.ts` (8 each) | **SR** | |
| 22 | **`REPORT_PANEL_CONFIG`** — keys, `label`, `supporting` | `features/trainer/report-panel-config.ts:3-28` | **SR + SL** | Keys rename; **`label` becomes the four ratified labels**; **`supporting` must be re-authored** — e.g. *"The clearest positive behaviour observed in this session"* describes Today's Strength, not Overview. Copy that describes the superseded model is a semantic defect, not a cosmetic one. |
| 23 | **Trainer UI** | `features/trainer/trainer-report-review.tsx:80-81, 155-158` · `trainer-draft-generation.tsx` | **SR + D** | Key-keyed icon/tone maps rename. ⚠️ The **deviation-record comments at `:80-81`** state the *old* OD-4 disposition (*"The frame's headings are NOT a rename…"*) and become **stale and wrong** on implementation — they must be rewritten to cite this ruling, not deleted. |
| 24 | **Management UI** | `features/management/management-report-review.tsx:100, 147-150` | **SR + D** | Same stale deviation comment at `:100`. |
| 25 | **Parent UI** | `features/parent/parent-canonical-report.tsx:74-77` | **SR + D** | Presentation map only. The parent surface's verified-clean status (no ratings, no hash, no notes) is **unaffected** and must be re-proved after migration. |
| 26 | **Frontend fixture** | `lib/frontend/fixtures/physical-test-fixture.ts` — **35 occurrences** | **SR + SL** | Keys rename; the fixture *prose* encodes the old semantics and must be re-authored, exactly as #16. |
| 26a | ⚠️ **`static-scan.mjs` FAIL-OPEN GUARDS — two deny-lists** | `scripts/tests/step-7i/static-scan.mjs:209` (**T7I-18** — no RPC mutates a version's content after INSERT) and **`:385`** (**T7I-R22** — the resolver projection declares no content column) | **SL** | ⚠️ **The highest-consequence missed site.** Both hard-code the four old column names as forbidden tokens. Rename the columns without updating these and **both guards go vacuously green**: an `UPDATE public.report_versions SET overview = …` would pass T7I-18, and a `report_resolve_context` projecting `overview` would pass T7I-R22. **Re-derive and demonstrate each firing** — a green suite is not evidence that a deny-list still denies. *(Added after review — an earlier draft of this register omitted `static-scan.mjs` entirely; row 27 named two files in that directory explicitly and did not wildcard it.)* |
| 27 | **Test fixtures and harnesses** | `scripts/tests/step-7i/lifecycle-canonical.sql` · `scripts/tests/integration/run-integration.mjs` · `scripts/physical-test/prove-governed-lifecycle.mjs` · `scripts/physical-test/activate-g6.mjs` · `scripts/tests/step-7i/run-concurrency.mjs` · `scripts/tests/g6-harness/*` · `scripts/tests/c2/c2-suite.sql` · `scripts/tests/correction-tracking/*` · `scripts/tests/management-approved/*` · `scripts/physical-test/g14-isolation-seed.sql` · `tests/frontend/*` | **SR + SL** | Names rename; **any assertion whose expectation encodes the old panel meaning must be re-derived**, notably the G-6 grounding negative controls and the C4 lifecycle canonical checksums. ⚠️ **Do not size this work from a file-level count.** The figures in §4.2 were gathered as **matching lines**, and several lines carry more than one occurrence — `lifecycle-canonical.sql` is **35 lines but ~72 occurrences**, `run-integration.mjs` **29 lines but ~47 occurrences**. Counts are given elsewhere in this register as occurrences (e.g. `database.types.ts` 44, `physical-test-fixture.ts` 35). **Re-count before scoping.** *(Corrected after review — an earlier draft presented line counts and occurrence counts side by side as one measure, which would under-scope `lifecycle-canonical.sql` by half.)* |
| 28 | **Canonical fixture / lifecycle checksums** | `run-canonical`, `verify-fresh-apply`, `lifecycle-canonical.sql` pins, the canonical fixture SHA-256 | **SL** | Any pinned checksum over panel-bearing content changes. Per the ratified precedent (STATUS.md, Run C1), a stale pin is reconciled by **deriving** the value from a successful verifier run — **never by guessing it**. |
| 29 | **`CLAUDE.md` §6 report-content baseline** | `CLAUDE.md:283, 284` | **SR** | Reconciled by this run — see §6. |
| 30 | **Specification v3 §8 and Amendment 002** | `docs/spec/…v3.md` (3) · `…Amendment_002.md` (1) | **N — HISTORICAL** | **Never edited.** They accurately record the pre-OD-4 model. They are no longer active Final MVP authority on this question. |
| 31 | **`STEP_7I_REPORT_LIFECYCLE_BASELINE.md`, `PHYSICAL_TEST_SLICE_48H.md`, `FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md`, `48H_FRONTEND_PROGRESS.md`** | `docs/plan/`, `docs/workstreams/` | **N — HISTORICAL** | Design/progress records of what was built. Left intact. |
| 32 | **Worktrees** `backend-48h`, `frontend-48h` | `worktrees/` | **N** | Untouched by design; they will carry the old names until they are refreshed or discarded. |

### 4.3 The migration window

**`report_versions` currently holds zero rows.** Independently corroborated by the fixture-reload verification recorded in `docs/progress/STATUS.md` (Run C1): *"`report_versions` 0, `report_version_ratings` 0"*, and by the Step 7E/7I design record that no production report data exists.

**The project is therefore presently at the preferred point to perform this semantic migration — before real report data exists.** This is the same window A-053's vocabulary rename depended on, and it is the reason the prior governance record called OD-4 *"time-boxed"* and *"irreversible once `report_versions` is non-empty."* Ruling it now is what that time-box asked for.

⚠️ **This does NOT mean regression verification is unnecessary.** An empty table removes the *data-migration* problem. It removes none of the **contract**, **grounding**, **lifecycle**, **authorization** or **projection** verification obligations in §6.3. Do not read "zero rows" as "low risk."

---

## 5. WHAT PHASE B MUST DECIDE — genuine technical ambiguity

Two items are **not** mechanical and must be ruled before implementation. Neither is ruled here.

### 5.1 The content-hash envelope version — an open Phase B ruling

The panel field names `todays_strength`, `next_focus`, `practice_suggestion`, `session_takeaway` are **literal bytes inside the SHA-256 preimage** of both `report_content_hash_v1` and `report_wording_hash_v1`. Renaming the columns therefore changes every hash the serializers produce, and `report_versions.content_hash_version` is pinned by `CHECK (content_hash_version = 1)`.

Two defensible paths exist and they are **not equivalent**:

- **(a) Redefine V1 in place under a fail-closed zero-row guard.** Legitimate only because the table is empty, and directly precedented by A-053's zero-row-guarded rename. Keeps one serializer; keeps the CHECK at `= 1`. Risk: it makes the string `V1` mean two different envelopes across time, which is exactly the ambiguity `content_hash_version` exists to prevent.
- **(b) Ship a V2 envelope beside V1.** Follows the path the column comment already prescribes verbatim (*"A future envelope increments this value and ships a PARALLEL serializer; committed rows are never re-serialized"*). Requires relaxing the CHECK and carrying two serializers.

**Recorded, not decided.** Note that whichever is chosen, the **domain separation** between `BESTCOACH-REPORT-CONTENT-V1` and `BESTCOACH-REPORT-WORDING-V1` must be preserved, and the R-26 rule — the content hash **never** reaches management or a parent — is untouched.

### 5.2 The grounding re-derivation for Overview

Grounding rule 4 currently enforces *"a needs_support dimension may never be presented as the strength"* against a single panel. Under OD-4 that panel splits: **Strengths** is the pure-positive surface the rule was written for; **Overview** is explicitly permitted to carry developmental context; **Areas for Development** is expected to name non-positive dimensions.

**The correct new rule set is a design decision, not a rename**, and getting it wrong fails in both directions — too strict rejects valid drafts, too loose lets a needs_support dimension be published as an achievement, which is the §4 non-negotiable this pipeline exists to enforce. **This must be designed and proven with a deliberate contradiction case before it ships** (persona §3.4).

### 5.3 No other genuine ambiguity — but one class that is unambiguous and still dangerous

Everything else in §4.2 is either a mechanical rename, a regeneration, or copy that must be re-authored to stated meanings. The panel **arity is four** in every layer today and stays four. No enum, no status, no policy, no grant and no audit action changes.

⚠️ **The `SL` deny-list rows (9a, 26a) are not ambiguous — they are FAIL-OPEN.** There is no decision to make; there is a way to get it silently wrong. Five hard-coded lists of the four old column names exist purely to **prove that report content does not leak** and that a committed version is not mutated. Renaming the columns without re-deriving every one of them leaves the assertions **passing green while detecting nothing**. This project has already been bitten by exactly this once — the A-053 rename left `POLARITY_BANDS[rating]` `undefined`, silently skipping the polarity rule while the suite reported success (`STATUS.md`, Backend V2 entry). **Each of the five must be re-derived and demonstrated firing against a deliberately-violating input.** A green run is not evidence.

**The five:** `static-scan.mjs:209` (T7I-18) · `static-scan.mjs:385` (T7I-R22) · `management_submitted_list.sql:353` + its `prosrc` regex at `:490` · `report_context_resolver.sql:305` · `management_correction_tracking.sql:413`. And the OD-4 migration's **own** end-of-migration assertions must not copy a stale list forward.

---

## 6. GOVERNANCE PROPAGATION PERFORMED BY THIS RUN

Documentation only. Method: **annotate, never delete** — the superseded text is struck and preserved inline, this ruling is cited, and the change is dated, matching the Phase A C-1/C-3 convention.

| Document | Change |
|---|---|
| `FINAL_MVP_AUTHORITY_LOCK.md` | §15 parent-panel list → the four canonical panels · §15.1 rewritten from *TIME-BOXED OPEN DECISION* to **RATIFIED** · §14 management allow-list annotated · §12 AI-output note added · §28.2 pack-conflict note · Appendix residual table: OD-4 → **CLOSED** |
| `FINAL_MVP_PHASE_A_GOVERNANCE_RECONCILIATION.md` | G-10 row struck and superseded · Part II §II.1 entry **G-26** recording OD-4 |
| `FINAL_MVP_SUBMISSION_READINESS_PLAN.md` | U-06 row reconciled |
| `UI_REFERENCE_FINAL_MVP/FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md` | §6 OD-4 row → **RULED** · the `Areas to Grow` mis-transcription corrected · screens 08/10/19 "obtain OD-4" gates discharged |
| `SDS Project Final (BEST Coach)/CLAUDE.md` | **§6** lines 283–284 — the two clauses that state the old model as the **active** content baseline — struck, preserved, superseded · **§12** — a new OD-4 stop-and-ask bullet added, so no agent drive-by-migrates the implementation or relabels at the UI without Phase B authorization |
| `SDS Project Final (BEST Coach)/docs/progress/STATUS.md` | Dated OD-4 entry added |

**Historical evidence documents were NOT rewritten.** The specification, Amendment 002, the Step 7I baseline, the physical-test slice contract, the Figma matrix, the 48-hour progress logs, the C3/C4/G-6 evidence trees and the run reports all retain their references to Today's Strength / Next Focus / Practice Suggestion / Session Takeaway, because those references **accurately describe earlier implementation and history**. They are historical record, not active Final MVP authority.

---

## 7. WHAT THIS RULING DOES **NOT** CHANGE

Stated explicitly so no implementer over-reads it:

- **AI authority** — drafts only; never rates, approves, submits or publishes. R-27 intact; zero client EXECUTE on `report_store_draft`. Only the four **output semantics** move.
- **The report lifecycle** — eight statuses, 14 transitions, `approved` transient-in-transaction, CAS on `lock_version`, audit-in-same-transaction, no ninth status.
- **Management's boundary** — wording-only, four columns, server-side rejection outside them, no draft state, cannot touch any assessment fact.
- **The parent boundary** — read-only, submitted-only, and every §15 prohibition, absolutely.
- **The nine dimensions, the rating vocabulary, polarity bands, behavioural anchors, A-052 contextual leak detection.**
- **Attendance, evidence, PDPA, deployment, hosted transport (PA-OD-9), management bootstrap (PA-OD-3)** — untouched.
- **Every other open operator decision** remains exactly as it was.

---

## 8. LATER VERIFICATION IMPACT

**Implementation of OD-4 will reopen affected report-contract tests.** Expect re-verification of, at minimum:

- the AI structured-output contract;
- grounding (including a fresh deliberate-contradiction proof per §5.2);
- fixture-provider behaviour;
- report persistence and the content/wording hash envelopes;
- Trainer review;
- Management wording-only edit;
- Parent projection (including a re-proof that no rating, hash, revision number or trainer note reaches the parent surface);
- **G-6** real-provider generation;
- **C4** governed lifecycle;
- the integration and regression suites, and the canonical checksum pins;
- ⚠️ **the five fail-open leak/immutability deny-lists (§5.3), each re-derived and demonstrated FIRING** — not merely passing.

### 8.1 Status of existing evidence

**Existing C3-C / G-6 and C4 evidence is NOT invalidated historically.** It is recorded as:

> **VALID FOR PRE-OD-4 IMPLEMENTATION BASELINE;**
> **AFFECTED CONTRACTS REQUIRE RE-VERIFICATION AFTER OD-4 IMPLEMENTATION.**

Run C3-C / G-6 (16/16) and Run C4 (29/0/0) were true of the system they tested. They remain accepted evidence of the pre-OD-4 baseline. They do **not** carry forward as proof of the post-OD-4 contracts.

---

## 9. CONFIRMATIONS

No application code, schema, migration, RPC, server action, fixture, generated type, test, database row, hosted resource or configuration file was created, modified or executed. No database, Docker, psql, build, server or external provider was run. No commit was made. Historical evidence documents were not rewritten. The two canonical submission PDFs were not touched. The frozen demo and both worktrees are untouched.

---

## 10. REVIEW HISTORY

*OD-4 ruled by the operator, 2026-08-07. Inventory produced by read-only repository search and verified at source.*

**One independent read-only adversarial reviewer ran against this propagation with instructions to falsify it, not confirm it. It found real defects, every one of which was re-verified at source by the orchestrator before being accepted, and all nine were fixed.**

| Severity | Defect | Fix |
|---|---|---|
| **High** | `FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md:200` still asserted the old four as *"the governed four"* and OD-4 as an *"Open operator adjudication"* — **unstruck, two lines above its own contradiction at `:202`**. The single surviving unmarked assertion of the old model as active authority | Struck and superseded |
| **High** | **A missed site with a fail-open failure mode:** `scripts/tests/step-7i/static-scan.mjs:209` and `:385` hard-code the four names in the T7I-18 (no post-INSERT content mutation) and T7I-R22 (resolver projects no content column) deny-lists. The register omitted the file entirely | New row **26a**, classed **SL** with an explicit fail-open warning; §5.3 and §8 updated |
| Medium | Screen plan `:218` — same stale gate, unannotated, while screen 19's equivalent at `:236` had been annotated | Struck and superseded |
| Medium | Screen plan `:383` — *"Open operator decisions — six"*; the Authority Lock designates this as the sole enumeration of OD-1…OD-6, so a stale count propagates | Corrected to **five open, one ruled** |
| Medium | Register row 9 called the three in-migration `v_forbidden` arrays *"returned column names and comments"* — **false at source**, and it prescribed "rename only" for what are **leak-posture deny-lists** | Split out as row **9a**, reclassified **SL** |
| Medium | G-10 in the Phase A reconciliation said *"two packs read Areas to Grow"* — it is **three**, and G-10 was the only document giving that figure | Corrected |
| Low | §4.1 named two Step 7H report audit actions; the ratified registry holds **three** (`report_version.created` omitted) | Corrected |
| Low | §4.2 presented **line counts and occurrence counts side by side as one measure**, under-scoping `lifecycle-canonical.sql` by roughly half | Counts removed from row 27 with an explicit re-count instruction |
| Low | §6 recorded the `CLAUDE.md` change as §6 only; a §12 stop-and-ask bullet was also added | Corrected |

**All ten factual claims the reviewer was asked to check independently at source were verified TRUE, with exact line numbers.** The reviewer also confirmed **no over-reach**: AI authority, R-27, the eight `report_status` values, management's boundary, the four-column allow-list arity and the parent boundary — including the absolute no-per-dimension-rating-grid prohibition — are all intact, and **nothing was weakened**.

**Corrections are recorded inline with what the superseded draft said**, per this corpus's standing rule that a baseline hiding its own revision history cannot be audited.
