# B.E.S.T Coach — MVP Specification v3 Amendment 004

**Status:** Ratified by orchestrator
**Ratification date:** 2026-08-05
**Last corrected:** 2026-08-05 (Step 7I1F-R3 — corrections applied against the Step 7I1E focused re-review defect register, under explicit orchestrator authorization; the amendment has still not been committed. Previously corrected at Step 7I1D-R2 against the Step 7I1C adversarial-review defect register.)

> **Step 7I1D-R2 correction note.** This amendment was adversarially reviewed at Step 7I1C before commit, and the defects that review confirmed are corrected here **in place**, because the document is **staged and uncommitted** — no historical record is rewritten, and Specification v3 and Amendments 001–003 remain byte-for-byte untouched. The corrections are: v3 **§7, §8 and §10** explicitly named in A-033's supersession row; the conflicting **A-021 and A-028 management-edit clauses** explicitly named in A-034; four **mis-citations** repointed (§14.1 ×2, §15, §25) and two more corrected (§20 ×2); the summary's approval-control claim **restated honestly** to match A-034's own body; the **enum-sequencing ruling** replaced with a mandatory migration split and an accurate statement of PL/pgSQL versus `LANGUAGE sql`/`BEGIN ATOMIC` behaviour, with the label pinned `AFTER 'needs_edit'`; the **approver-role default drop** added to A-040 as a fifth change; **`centre_id`**, the same-report version FKs and **RLS enablement** stated explicitly for the correction-request table; the **outbox versus notification-record** timing rule disambiguated; **reapproval after a return** ratified as requiring a new immutable version; **U-27 resolved** at 2,000 characters; **U-29** reaffirmed as deferred and non-blocking; and **U-25** completed to eight blocked design families.

> **Step 7I1F-R3 correction note (2026-08-05).** Step 7I1E independently re-reviewed the 7I1D-R2 corrections and confirmed two defects in this amendment, both corrected here **in place** while it remains staged and uncommitted. **(CD-7)** The **A-036 supersession row and precedence rule 4 claimed A-028 was superseded "for the transition set".** A-028 enumerates **no** transition set — it defers transitions to v3 §13 — and its single transition statement, "the only exit from `submitted` is `needs_edit`, which creates a new version", is **preserved and implemented as T12**, not superseded. The row and the rule now name **v3 §13** as the sole source of the superseded transition model and record A-028's `submitted` exit rule among the preserved clauses. **(CD-6)** **U-25's claim that the Figma matrix's three lists "each carry eight" rows was a miscount:** §0.1 and the §1 screen inventory carry **eight design families**, while §5.2 carries **nine porting rows**, because "Trainer reapproval after correction" is a separate row **sharing** the correction-tracking family. Eight families, nine porting rows; no requirement was missing and no frame was invented. **No other clause of this amendment is changed, and Specification v3 and Amendments 001–003 remain byte-for-byte untouched.**

**Amends:** `BEST_Coach_Complete_MVP_Specification_v3.md` (this repository, `docs/spec/`) and, **only where explicitly named**, `BEST_Coach_MVP_Specification_v3_Amendment_002.md` and `BEST_Coach_MVP_Specification_v3_Amendment_003.md`

---

## Relationship to Specification v3 and Amendments 001–003

Specification v3 remains the **authoritative baseline** for this build. Amendment 001 (**A-001 … A-013**), Amendment 002 (**A-014 … A-024**) and Amendment 003 (**A-025 … A-032**) remain in force **except for the specific clauses named in the supersession table below**. This amendment records the orchestrator-ratified **two-stage governed report workflow**: the trainer approves the report, management performs the final quality review, and **management performs the final Approve & Submit that publishes the report to parents**.

Rules of precedence for this amendment:

1. Every v3 clause not named here remains in force, unchanged.
2. **Amendment 004 names no Amendment 001 clause.** A-001 … A-013 are untouched, and every Amendment 001 evidence, audit and continuity safeguard applies unweakened.
3. Amendment 002 **A-019 item 14** and **A-021's role table and four of its preserved-governance bullets** are **superseded** for the clauses named below (the bullet count was corrected from two to four at Step 7I1D-R2 — see A-034). Every other Amendment 002 decision — including A-014's three-flow boundary, A-015's one-centre rule, A-016's hierarchy, A-017's mandatory nine dimensions, A-018's attendance defaults, A-020's identity model, A-021's **one canonical format / one shared read model / one presentation architecture** rule, A-022's Figma authority, A-023's no-ORM rule and A-024's phasing — remains **fully active**.
4. Amendment 003 **A-028** is superseded for the **stored status set**, the **pre-submission management-visibility rule** and — named at Step 7I1D-R2 — its **management-edit prohibition** ("Management and Parent never edit reports"), **for management only**; that prohibition remains **absolute for parents**. **A-028 is NOT superseded for any transition rule (corrected at Step 7I1F-R3):** A-028 enumerates no transition set — it defers transitions to v3 §13 — and its **one** transition statement, "the only exit from `submitted` is `needs_edit`, which creates a new version", is **preserved unchanged** and is made physical by A-036's T12. **The transition model A-036 supersedes is v3 §13's**, not A-028's; **A-031's exact 10-enum / 22-table boundary** is superseded **additively and only for Step 7I**. Every other Amendment 003 decision — A-025, A-026, A-027, A-029, A-030, A-032's non-authorization rule — remains **fully active**. A-028's approval-freeze principle, self-contained-version rule, canonical-pointer rule and attendance interaction are **preserved and strengthened**, not relaxed.
5. **A later amendment wins only for the clauses it explicitly supersedes.** Where Amendment 004 names a clause, Amendment 004 governs that clause. Where it does not, v3-as-amended-by-001-002-003 governs.
6. Specification v3, Amendment 001, Amendment 002 and Amendment 003 are **never edited in place**. All four remain byte-for-byte unchanged. Superseded rules are superseded **explicitly, here** — historical records are never rewritten to conceal a prior decision.
7. `CLAUDE.md` (the standing agent contract), the Implementation Plan and `docs/plan/STEP_7I_REPORT_LIFECYCLE_BASELINE.md` must agree with v3 as amended by 001, 002, 003 **and** 004; where any of them still contains superseded wording, the wording in the governing amendment prevails and the stale text is historical.

**The core governance rule is restated. Its final clause changes, and one approval control is deliberately narrowed:**

> **AI drafts. The trainer approves. Management performs the final quality review and publishes. Parents see only the version management submitted, and no version reaches a parent without a trainer approval behind it.**

**What Amendment 004 preserves, and what it narrows — stated honestly, because the body of A-034 concedes it and a summary that denied it would be false.**

**Preserved, unweakened:** every **privacy** control (the parent boundary is unchanged and absolute; nothing previously invisible to a parent becomes visible; no per-dimension rating grid and no content hash reaches a parent or management); every **evidence** control (A-001 … A-013 untouched); every **audit** control (append-only, hash-chained, one event per governed action, no registry extension); **rating parity** (the submitted version must carry exactly the same nine (dimension, rating) pairs as its trainer-approved source, re-verified at submission); **immutable lineage** (every accepted content change creates a new immutable version, and the submitted version's lineage must resolve to a version carrying a real trainer approval); and **exact-version management approval** (management's approval row names the precise version published, with its own hash and timestamp).

**Narrowed — exactly one control, named precisely:** under the superseded single-stage workflow the trainer approved **the exact final prose a parent would read**. Under Amendment 004, management may rewrite the four parent-facing panels after trainer approval, so **the exact final prose is no longer necessarily trainer-approved**. What remains mandatory is that the published version's **assessment substance** — its nine ratings — is identical to a version a trainer did approve, and that its lineage to that approval is explicit, immutable and auditable. **The database can enforce *which columns* management may write, not *how much*** (A-034). Faithfulness of a management rewrite is therefore guaranteed by **governance and evidence** — immutable versioning, management authorship, explicit lineage, a distinct content hash, an audit event and an exact-version management approval row — **not by structure**. This is a ratified trade, recorded here in the summary and not only in the body.

Amendment 004 **adds a second mandatory human review stage** in front of parent publication. Management gains a **pre-submission read** and a **strictly bounded wording-edit capability** that is **structurally incapable of touching assessment substance**.

**Precedence (highest first):** **v3 → ratified amendments (001, then 002, then 003, then 004 for the clauses each names) → `CLAUDE.md` → Implementation Plan → Figma Design 2 (visual/interaction reference only) → `STATUS.md` → `BUILD_NOTES.md` → temporary migration tracker.**

**Scope statement — read this before treating this amendment as permission to build.** Amendment 004 governs **product workflow, lifecycle semantics, authorization boundaries and the schema additions those require**. It is **not an implementation authorization**. **Step 7I remains unstarted and unauthorized**, and no migration, RPC, server action, generated type or UI may be authored, staged or applied until the orchestrator authorizes the relevant Step 7I sub-checkpoint separately. Amendment 003 A-032's non-authorization rule applies to this amendment in full.

---

## Supersession and clarification table

| Amendment | v3 section(s) / clause superseded | Effect on Amendments 001 / 002 / 003 | Other active documents affected | Effect |
|---|---|---|---|---|
| **A-033** | §4 / **§7** / **§8** / **§10** / §13 / §14 workflow wording in which **the trainer is the final publisher** and publication follows immediately from trainer approval; §13's `Approved --> Submitted: publish` as a trainer action. **Named exactly, because a prose catch-all is not a supersession under rule 5:** **§7**'s "AI drafts; the trainer approves" flow line and its `5 · Review & Approve → 6 · Publish & View` diagram, in which no management stage exists (§7's separate governance sentence, "Only trainer-approved reports become visible to parents and management", **remains true and is not superseded** — trainer approval is still necessary in every published lineage); **§8**'s Review & Approve (Trainer / TA) entry "trainer approval checklist and **Approve & Submit** gate", insofar as it names *Approve & Submit* as the trainer's control — the **checklist gate itself is preserved**, now attached to the trainer's **Approve**; **§10**'s Operational Service Blueprint rows "**Review + Approve** … submit approval … Output/handoff: **Final submitted report**" and the "Publish + View" row that follows it directly from trainer approval | **A-019 item 14 superseded** (see A-034); **A-021 role table superseded** (see A-034); A-014/A-015/A-024 unchanged | `CLAUDE.md` §0, §6 "Approve & Submit", §10 Phase 3; Plan Phase 1 step 7, Phase 3, Phase 5 UAT; Step 7I baseline §1, §3, §6 | The governed report workflow is **two-stage**: trainer assessment → AI draft → trainer edit → **trainer approval** → management notification → **management final quality review** → **management Approve & Submit** → canonical, submitted, parent-visible → parent notification. **Publication is a management action.** |
| **A-034** | §14 role table row **Management** ("Approved completion … statistics" only); **§21**'s access-control line "Management → approved completion/evidence/statistics projections only", insofar as it excludes a pre-submission review read. **(Citation corrected at Step 7I1D-R2: the earlier "§14.1 audience wording" citation was wrong — v3 §14.1 is "Visibility positions for the future roadmap features", a three-row table covering only the Weekly Class Health Brief, the Child Progress Digest and digest cadence. It contains no current-workflow management audience wording, supersedes nothing here, and is not named.)** | **A-019 item 14 ("Never edit feedback-report content") superseded**; **A-021 role table row Management ("View only") superseded**; A-021's bullets "management and parent can read only the submitted or approved report snapshot" and "server-side authorization must reject management and parent edit attempts" **superseded for management only** — both remain **absolute for parents**. **Additionally superseded for management only, and named explicitly at Step 7I1D-R2:** A-021's bullets "**editing resets the quality checklist** where the governed workflow requires it" and "**editing requires review and approval again**" — both remain **absolute for trainer edits**, and neither ever applied to a parent; and **Amendment 003 A-028's sentence "Management and Parent never edit reports — enforced server-side, never by hiding an Edit button"**, which is an **edit** rule rather than the visibility rule superseded elsewhere in this table, and which remains **absolute for parents** | `CLAUDE.md` §6 A-021 table, visibility bullet, management-administration bullet; Plan Phase 3, A-021 verification register; **`docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md` "Management report viewing" and "Report approval / submission" rows and their Orchestrator porting actions (U-26)** | Management may **read the final-review candidate before submission** and may **directly edit parent-facing wording only** — grammar, clarity, tone, presentation. Management **must not** modify assessment ratings, observations, attendance, evidence, trainer notes, underlying assessment facts, or any factual claim whose correction requires changing a rating or observation. **Parent view-only and parent edit-rejection are unchanged and absolute.** |
| **A-035** | §13 state machine, for the **absence of any review-return path**; §15 failure-and-recovery, for the absence of a management-raised correction path | none superseded; **A-028's correction-cycle rule clarified** (a second, earlier correction entry point is added) | `CLAUDE.md` §6 state machine; Plan Phase 1 step 7, Phase 3; Step 7I baseline §3, §5, §11 | **Conditional return-to-trainer.** Management may return a report to the trainer **only** when an assessment rating, an observation, or a substantive assessment fact derived from one appears visibly incorrect. The return creates a **durable, bounded, structured correction request**, a governed state transition and one audit event. Management **never** alters the underlying assessment data, and the returned report **remains unavailable to parents**. |
| **A-036** | **§13** state machine, for the **stored status set** and the **legal transition set** — **v3 §13 is the sole source of the superseded transition model**; §13's `DraftReady --> NeedsEdit: trainerEdits` as a navigation-triggered arc | **A-028 superseded for "seven authorized statuses and no others", and for nothing else in this row.** **(Corrected at Step 7I1F-R3: the earlier "and for the transition set" was over-broad — A-028 enumerates no transition set, deferring transitions to v3 §13, and its single transition statement, "the only exit from `submitted` is `needs_edit`, which creates a new version", is PRESERVED and made physical by T12.)** A-028's approval-freeze, self-containment, canonical-pointer, submitted-exit and attendance rules **preserved unchanged** | `CLAUDE.md` §6 state-machine bullet, §6.1; Plan Phase 1 step 6; Step 7I baseline §2, §3 | **Eight authorized `report_status` values**, and no others: `incomplete` · `observation_saved` · `drafting` · `draft_ready` · `needs_edit` · **`trainer_approved`** · `approved` · `submitted`. **`trainer_approved` is the persisted management-review state.** `approved` remains **transient-in-transaction only**. **No additional management-review status is created** — `trainer_approved` already denotes it. **`trainerEdits` commits only on a successful save**; opening, closing or cancelling an editor is non-mutating. |
| **A-037** | **§23** approval provenance, where a single approval is assumed; **A-031's delivered `report_versions` shape**, for its authorship and submission role pinning to `trainer`. **(Citation corrected at Step 7I1D-R2: v3 §20 lists `report_versions` only as "kind, audience, content, content_hash, author, time" and contains no role pin; the role pins are A-028/A-031 decisions made physical by the Step 7E migration, and `CLAUDE.md` §6.1 already declares A-031's inventory authoritative over any older §20 shape.)** | **A-028 clarified** (versioning gains an explicit lineage requirement); A-029 unchanged | `CLAUDE.md` §6 state-machine and visibility bullets; Plan Phase 1 checklist; Step 7I baseline §4, §6 | **Two independent, immutable approval provenances.** Trainer approval binds trainer identity, the trainer-approved version id, its content hash, timestamp and source role. Management approval binds management identity, the **exact final version id**, its content hash, timestamp, source role and **explicit lineage to the trainer-approved source version**. **Every accepted content change creates a new immutable version** — trainer edits, AI drafts/regenerations and management wording edits **never overwrite a prior version**. A wording-only management edit **does not require trainer reapproval**; an assessment-level correction **does**. |
| **A-038** | **§14** visibility rows, for **management pre-submission access**; §21 access-control wording where management access is defined as approved-only. **(Citation corrected at Step 7I1D-R2: the earlier "§14 / §14.1" citation over-reached — §14.1 governs only the two deferred roadmap features and is not superseded. Its rule that the Child Progress Digest requires mandatory trainer approval before any parent sees it stands unchanged.)** | **A-021's "one canonical format / one shared read model / one presentation architecture" preserved unchanged**; A-028's canonical-pointer rule preserved | `CLAUDE.md` §6 visibility bullet, §6 per-row status-gating bullet; Plan Phase 3; Step 7I baseline §8 | **Three read models over one canonical format.** Trainer reads working state. **Management reads (a) the final-review candidate while status is `trainer_approved`, and (b) the canonical submitted version.** Management still **never** reads drafts before trainer approval, internal trainer notes, raw per-dimension assessment data, checklist/approval internals, AI generation history or audit rows. **Parents read only the canonical submitted version, and only for linked students** — unchanged and absolute. |
| **A-039** | **§18**'s module line "`/notifications` → in-app records (**post-approval only**)" and **§20**'s `notifications` table row "recipient, type, state — In-app, **post-approval only**", read only insofar as "post-approval" was previously satisfied by a **trainer** approval; both are **re-anchored, not contradicted** — management notification fires at `trainer_approved` and parent notification at `submitted`, so each remains strictly post-approval. **(Citation corrected at Step 7I1D-R2: the earlier "§15 / §25" citation was wrong — v3 §15 is Failure & Recovery and §25 is Toolchain & Workflow; neither contains any notification wording, and neither is superseded by this clause. §15 is separately and correctly named by A-035.)** | none | `CLAUDE.md` §6 confirmation-modal copy, §9 `/notifications` module; Plan Phase 1 step 7; Step 7I baseline §10 | **Three ratified lifecycle notification triggers**, recipients and timing: trainer approval → authorized management; management assessment-level return → the actively assigned trainer; management submission → linked parents. **Notification records are created only after the corresponding business transaction succeeds**, through a **transactional outbox or equivalent**. **No child PII enters an immutable audit event to support a notification.** **Delivery is not implemented by this amendment.** |
| **A-040** | **A-031's** "exactly 10 enums, 22 tables and 13 deterministic seed rows" as a **standing** ceiling; **A-031's delivered `report_version_approvals` single-approval shape**. **(Citation corrected at Step 7I1D-R2: `report_version_approvals` does not appear anywhere in v3 §20 — it is an A-028/A-031 table delivered by the Step 7E migration.)** | **A-031 superseded additively and only for Step 7I**; **A-032's exclusion list and non-authorization rule unchanged and still binding** | `CLAUDE.md` §6.1, §12 stop-and-ask list; Plan Gate G1, Phase 0; Step 7I baseline §4, §5 | The Step 7E boundary was the boundary of the **first** migration, not a permanent ceiling. Amendment 004 authorizes, **for Step 7I only**, the **exact** additive schema set in A-040 below: **one enum label**, **two new enums**, **one new table**, **three new `report_versions` columns**, and **five constraint and default changes** (four constraint replacements plus one column-default drop, widened from four at Step 7I1D-R2). **Nothing else may be added**, and the addition is still **not an implementation authorization**. |

---

## A-033 — The two-stage governed report workflow

**Ratified workflow.** The governing report workflow is exactly these ten steps, in this order:

1. The trainer completes the student assessment.
2. AI generates a governed report draft.
3. The trainer reviews and edits the report where necessary.
4. The trainer **approves the exact trainer-reviewed version**.
5. Management is **notified** that the report requires final review.
6. Management performs the **final quality review**.
7. Management may:
   - approve without changing the report;
   - **directly edit parent-facing wording only**; or
   - **return the report to the trainer** — **only** when a rating, observation, or substantive assessment fact appears visibly incorrect or requires correction.
8. Management performs the final **Approve & Submit** action.
9. The selected version becomes **canonical, submitted and parent-visible**.
10. Parents are **notified** that a new report is available.

**"Submit" does not mean the first database save.** Report drafts, versions, edits and approvals are **persisted before final submission**. Submission means **canonical publication and parent visibility** — the moment the aggregate's canonical pointer moves and the report becomes readable by a parent.

**What this supersedes.** Every active instruction stating that the **trainer** performs the final publication, that "Approve & Submit" is a **trainer** action, or that trainer approval is immediately followed by publication, is **superseded**. The trainer's approval remains **mandatory and irreplaceable** — it is now the **entry condition** to management's final review rather than the final act of publication.

**What this preserves, unchanged and absolute:**

- **AI never publishes directly** (A-021). AI has no portal role, no credential and no lifecycle authority.
- **No version reaches a parent without a trainer approval behind it.** Management cannot submit a report whose content lineage does not resolve to a trainer-approved version.
- **The grounding-validation pipeline** (`CLAUDE.md` §4 non-negotiable 1) is untouched and still gates every AI draft before a trainer sees it.
- **Every transition remains a guarded, compare-and-set operation inside one transaction, with its audit write in the same transaction** (v3 §13; A-028).

---

## A-034 — The management editing boundary

**Management may directly edit only:**

- parent-facing wording;
- grammar;
- clarity;
- tone;
- presentation.

**Management must not directly modify:**

- assessment ratings;
- observations;
- attendance;
- evidence;
- trainer notes;
- underlying assessment facts;
- **any factual claim whose correction requires changing a rating or observation** — that is a **return-to-trainer** case (A-035), never a management edit.

**The boundary is structural, not procedural.** It is enforced by a **strict field allow-list** on exactly one management mutation operation, by the **absence of any management write path** to `observations`, `observation_ratings`, `attendance` or any evidence object, and by **zero client DML on every report-lifecycle table**. Hiding an edit control is not the enforcement mechanism, and neither is a code review — the wrong write must be **unreachable**, not merely rejected.

**Every accepted management wording edit creates a new immutable `report_versions` row.** Management never mutates the trainer-approved version. The trainer-approved version, its nine rating snapshots, its checklist evidence and its trainer approval row remain **byte-stable** for the life of the report.

**Rating parity is a gate, not a convention.** The version management submits must carry **exactly the same nine (dimension, rating) pairs** as the trainer-approved source version it derives from. A management-edited version copies its rating snapshots **verbatim** from the source and the submission gate **independently re-verifies parity**, so a management wording edit cannot mutate, impersonate or drift a rating even if an implementation error occurred upstream.

**What the allow-list can and cannot guarantee — stated honestly.** The four parent-facing panels **are** the entire parent-facing content of a version, so a column-level allow-list that permits all four permits management to rewrite the parent-facing text. **The database can enforce *which columns*, not *how much*.** What is therefore **structurally** guaranteed is that management cannot touch assessment substance — ratings, observations, attendance, evidence, trainer notes — and cannot publish content whose ratings differ from the trainer-approved source. What guarantees that a management rewrite stays *faithful* is **governance and evidence**, not structure: every wording edit is a new immutable version with management authorship, explicit lineage to the trainer-approved source, its own content hash, an audit event, and a management approval row naming the exact version published. This is recorded as a stated limitation, not glossed over, and there is **no narrower column set to allow-list**.

**A wording-only management edit does not require trainer reapproval.** The trainer approved the assessment substance; management adjusted only parent-facing presentation, and the trainer approval remains attached to its own source version with its own content hash. **An assessment-level correction always requires trainer reapproval** (A-035).

**Parents are unaffected by this clause.** **Parent access remains view-only and submitted-only**, and a parent edit attempt is **rejected server-side** exactly as A-021 requires. Amendment 004 changes nothing about the parent boundary.

**Superseded — the complete list, corrected and completed at Step 7I1D-R2.** For **management only**, and in every case remaining **absolute for parents**:

- Amendment 002 **A-019 item 14** ("Never edit feedback-report content");
- the **Management** row of **A-021's role table** ("View only");
- A-021's bullet "management and parent can read only the submitted or approved report snapshot";
- A-021's bullet "server-side authorization must reject management and parent edit attempts";
- **A-021's bullet "editing resets the quality checklist where the governed workflow requires it"** — a management wording edit creates a new version that carries **no** checklist row at all, because the checklist is a trainer instrument; this bullet remains **absolute for trainer edits**;
- **A-021's bullet "editing requires review and approval again"** — a management wording-only edit requires **no trainer reapproval** (it requires management's own approval on the exact version submitted); this bullet remains **absolute for trainer edits**, and an **assessment-level correction always requires fresh trainer approval** (A-035);
- **Amendment 003 A-028's sentence "Management and Parent never edit reports — enforced server-side, never by hiding an Edit button"**, which is an **edit** rule distinct from the visibility rule superseded elsewhere.

**A-019 items 1–13 stand. Every A-021 and A-028 rule not listed above stands. Every one of the seven clauses above remains fully in force for parents.**

---

## A-035 — Conditional return-to-trainer and the correction request

**Return-to-trainer applies only** when management identifies a potentially incorrect:

- assessment rating;
- observation; or
- substantive assessment fact derived from a rating or observation.

It is **not** the path for wording, grammar, clarity, tone or presentation — those are management's own edit (A-034).

**For a qualifying assessment-level issue, management must be able to:**

- flag the exact issue;
- provide a **bounded correction reason**;
- return the report from management review to the trainer;
- **preserve the trainer-approved source version unchanged**;
- **keep the report unavailable to parents**;
- trigger a notification to the **actively assigned trainer** (A-039).

**Management must not alter the underlying assessment data.** The return records a request; it never performs the correction.

**The return operation itself does not create a new report version** unless report content is also changed through an authorized operation. It **must** create:

- the **governed state transition** (`trainer_approved → needs_edit`);
- a **durable correction request**; and
- the **required audit event**.

**Minimum durable representation of a correction request** — ratified, and deliberately **structured rather than free-form**:

| Element | Requirement |
|---|---|
| Identity | Its own primary key |
| Relevant report | Required reference to the report aggregate |
| Relevant version | Required reference to the exact version under review when the issue was raised |
| Issue scope | A **closed, controlled vocabulary**: rating · observation · derived assessment fact |
| Affected rating reference | The affected dimension, **where the issue scope is a rating** — optional otherwise |
| Reason | **Bounded free text with an enforced length limit of 2,000 characters** (ratified at Step 7I1D-R2, resolving U-27) — a required, human-written explanation, not an unrestricted note field |
| Creator | Required management membership reference, **role-pinned to management** |
| Creation time | Required timestamp |
| Status / resolution | A **closed vocabulary** — open · resolved — with the resolving actor, resolution time and resolving version recorded when it resolves |

**Unrestricted free-form notes are prohibited where a bounded structured representation is sufficient.** The scope, the affected-rating reference and the status are **controlled vocabularies and references**; only the reason is prose, and it is length-bounded.

**At most one open correction request may exist per report at a time**, enforced structurally.

**After a return:**

1. The trainer corrects the relevant rating, observation, or derived report content **through the governed trainer workflow**.
2. **Every accepted correction creates a new immutable version.**
3. The trainer **approves the corrected version again**.
4. Management performs **final review again**.

**The trainer can never reapprove the returned version itself (ratified at Step 7I1D-R2).** A return creates no version and moves no pointer, so the report's candidate is still the **frozen** version that already carries the trainer's approval. Reapproval therefore **always** runs through a **new immutable correction version**. Where the trainer examines the flagged item and finds it already correct, that new version may be **byte-identical in content**, but only as an **explicit trainer reaffirmation naming the open correction request** — a silent byte-identical save is rejected, so "the trainer checked and stood by the assessment" is never recorded the same way as "the trainer did nothing". The reaffirmation is durably linked through the correction request's own resolution fields and named in the version-creation audit event. **The frozen version, its nine rating snapshots, its checklist evidence and its trainer approval row are never written by any part of this path.**

**The correction reason never enters an immutable audit event.** The audit event references the correction request by **id only** (A-039, A-029 data minimization). The reason lives in the correction-request row, which a future PDPA mechanism can reach; an audit row is permanent and unredactable, and a human-written reason may contain identifying detail.

**A returned report is not readable by any parent at any point.** The canonical pointer does not move on a return, and a report that has never been submitted has no canonical version at all. A previously submitted report keeps its **previous** canonical version visible while correction work proceeds — never a gap, never draft content (A-028, preserved).

---

## A-036 — Report lifecycle statuses and transitions

**Eight authorized `report_status` values**, and no others:

`incomplete` · `observation_saved` · `drafting` · `draft_ready` · `needs_edit` · **`trainer_approved`** · `approved` · `submitted`

This supersedes A-028's "seven authorized statuses and no others" **by adding exactly one label**. No label is removed, renamed or repurposed.

**Label position is ratified, not incidental.** `trainer_approved` is added **`AFTER 'needs_edit'`**, so the physical `pg_enum` sort order equals the workflow order listed above and equals the order stated everywhere else in this amendment, in `CLAUDE.md` §6 and in the Step 7I baseline §2. A bare `ADD VALUE` would append the label last and silently disagree with all four; the placement clause is therefore mandatory. Nothing in the MVP orders or ranges by `report_status` today — this pins the ordering **before** anything depends on it, not after.

**`trainer_approved` is the persisted management-review state.** It means: the trainer has approved a specific version, management has been notified, and the report is awaiting or undergoing management final review. **No additional explicit management-review status is created.** A separate "in management review" status would encode UI presence, not a governed fact, and `trainer_approved` already carries every fact the lifecycle needs. **This is a ratified decision, not an omission** — an additional status must not be introduced for UI convenience.

**`approved` remains transient-in-transaction only.** It is asserted inside the management Approve & Submit transaction and named in the audit events, and **no operation ever commits with `status = 'approved'`**. There is no committed `approved`-only residue.

**Ratified transitions**, and no others:

| From → To | Actor | Meaning |
|---|---|---|
| ∅ → `incomplete` | trainer | report created for a present, actively enrolled student |
| `incomplete` → `observation_saved` | trainer | all nine dimensions rated |
| `observation_saved` → `drafting` | trainer | draft requested |
| `drafting` → `draft_ready` | trainer (through the governed AI storage path) | validated draft stored as a new immutable version |
| `drafting` → `observation_saved` | trainer | draft cancelled or failed |
| `draft_ready` → `draft_ready` | trainer | **accepted trainer edit** — creates a new immutable version; the persisted status does not change |
| `needs_edit` → `draft_ready` | trainer | **accepted trainer correction** — creates a new immutable version. **This is the only route out of `needs_edit` after a management return** (see the reapproval rule below) |
| `draft_ready` → `trainer_approved` | trainer | **trainer approval** of the exact reviewed version |
| `needs_edit` → `trainer_approved` | trainer | **trainer approval of a version that carries no trainer approval of its own.** Reachable from the post-publication reopen clone (`submitted → needs_edit`), whose clone is a fresh unapproved version. **It is not reachable directly after a management return**, because a return creates no version and leaves the frozen, already-trainer-approved version as the report's candidate — see the reapproval rule below. Gated by the precondition that the target version holds **no** trainer approval row |
| `trainer_approved` → `trainer_approved` | management | **wording-only edit** — creates a new immutable final-review candidate; the persisted status does not change |
| `trainer_approved` → `needs_edit` | management | **assessment-level return-to-trainer** (A-035) |
| `trainer_approved` → `approved` → `submitted` | management | **Approve & Submit**, atomic, one transaction, two ordered state-change audit events |
| `submitted` → `needs_edit` | trainer | post-publication correction — clones into a new version; the previous submitted version stays canonical (A-028, preserved) |

**Explicitly illegal, and structurally unreachable:**

- any transition to `approved` other than inside the management Approve & Submit transaction;
- any committed `approved` state;
- any path from `draft_ready`, `needs_edit` or `trainer_approved` directly to `submitted`;
- any management-initiated transition other than the wording edit, the return, and Approve & Submit;
- any parent- or AI-initiated transition of any kind;
- any trainer-initiated transition out of `trainer_approved` — **the trainer cannot un-approve, withdraw, or edit past their own approval**; a change after trainer approval requires either a management wording edit or a management return;
- any exit from `submitted` other than `submitted → needs_edit`.

**Reapproval after a management return is ratified (Step 7I1D-R2, operator decision).** A management return records a request; it creates no version and moves no pointer, so the report's candidate remains the **frozen** version the trainer already approved. **The trainer may therefore never reapprove that same version.** Trainer reapproval after a return **requires a new immutable correction version**, created through the ordinary governed trainer save (`needs_edit → draft_ready`), which is then approved (`draft_ready → trainer_approved`).

**A content-identical correction version is permitted, but only as an explicit trainer reaffirmation.** Where the trainer inspects the flagged rating, observation or derived fact and concludes it is already correct, the corrective save may carry byte-identical panel content — but **only** when the trainer explicitly declares it a reaffirmation of the open correction request, naming that request. A silent byte-identical save is **rejected**, so "nothing changed" can never be indistinguishable from "the trainer did not look". The reaffirmation is durably linked to the correction request through the request's own resolution fields, and is named in the version-creation audit event. **The previously frozen version, its nine rating snapshots, its checklist evidence and its trainer approval row are never touched by any of this.**

**`trainerEdits` semantics (superseding §13's arc trigger).** The `trainerEdits` transition commits **only when a save succeeds**. **Opening, closing or cancelling the report editor is non-mutating** — it writes no row, changes no status and emits no audit event. Any mutating "begin edit" operation is **removed**. A save from `draft_ready` returns to `draft_ready` having produced a new version; a save from `needs_edit` advances to `draft_ready`.

**Future-session guard (ratified).** A report lifecycle action is **locked until the scheduled session start**, and the scheduled start is interpreted in **`Asia/Singapore`** for the single-centre MVP. **No multi-centre timezone administration is added** — no per-centre timezone column, no operator timezone UI, no timezone in scope for Step 7I. Where a session records no scheduled start time, the scheduled start is the **beginning of the session date in `Asia/Singapore`**; this is the unique total reading of the rule against the existing schema and is recorded as an explicit adjudication, not an inference.

**Concurrency is unchanged and unweakened.** Every transition remains a guarded compare-and-set on the current status plus an optimistic-lock version, inside one database transaction, with its audit write in the same transaction (v3 §13, A-028).

---

## A-037 — Versioning, lineage and dual approval provenance

**Immutable versioning (ratified).** **Every accepted content change creates a new immutable report version.** Accepted trainer edits, AI drafts and regenerations, and management wording edits **never overwrite a prior version**. This supersedes any design in which the pre-approval working version is mutated in place.

**Rating snapshots follow the actor's authority:**

- a version created by an **accepted trainer save** copies the **nine current assessment ratings**, so a trainer's rating correction propagates into the report;
- a version created by a **management wording edit** copies the **nine rating snapshots verbatim from its source version**, so management can never introduce, remove or alter a rating.

**Trainer-approved source lineage.** Every version carries an explicit reference to the **trainer-approved source version** it descends from, distinct from generic clone lineage. A version that is itself trainer-approved is its own source. **The management-edited version must retain explicit lineage to the trainer-approved source version.**

**Trainer approval provenance must independently represent:**

- trainer identity and **live** authorization at the moment of approval;
- the trainer-approved **version id**;
- that version's **content hash**;
- the **approval timestamp**;
- the **source role**;
- **immutable provenance** — the record is never updated or deleted.

**Management approval provenance must independently represent:**

- management identity and **live centre authorization** at the moment of approval;
- the **exact final version id** being submitted;
- that version's **content hash**;
- the **approval timestamp**;
- the **source role**;
- **lineage to the trainer-approved source version**;
- **immutable provenance**.

**Trainer approval remains attached to the trainer-approved source version.** It is never transferred, re-pointed or re-dated onto a later version. **Management approval attaches to the exact final version being submitted.**

**The database must prevent — structurally, not by application convention:**

| Must be prevented | Mechanism required |
|---|---|
| Management submission without trainer approval | The final version's resolved trainer-approved source must carry a trainer approval row; no source, no submission |
| Management approval of an obsolete version | Compare-and-set on the aggregate's current-version pointer, status and lock version, **plus** a caller-supplied content hash that must match the stored and recomputed hash |
| Trainer approval being silently transferred to changed content | Approval is keyed to a version id and carries that version's content hash; a content change creates a **new** version with a **new** hash and **no** trainer approval row |
| Parent visibility before final submission | Parents resolve exclusively through the aggregate's canonical submitted pointer, which moves only at submission |
| Management changing assessment data | No management write path to assessment tables exists; the management edit operation's field allow-list is the four parent-facing content fields and nothing else; rating parity against the trainer-approved source is re-verified at submission |
| Return-to-trainer being bypassed for assessment-level corrections | Management's only content mutation is the wording edit, which cannot write a rating, an observation, attendance, evidence or a trainer note; any assessment-level change is reachable only through the trainer workflow after a return |

**Approval cardinality and role constraints.** At most **one trainer approval** and at most **one management approval** may exist per version. An approval row's role is **pinned by constraint** to the role that produced it and is **foreign-keyed to a membership of that exact role**, so an approval by the wrong role is unrepresentable rather than merely rejected.

**"At most one of each" is a ceiling, not a requirement — no version ever requires both approvals.** Each approval belongs to the exact version its actor reviewed, and to no other:

- **When management approves unchanged**, the trainer-approved version and the submitted version are the same row, so that one version carries both approvals.
- **When management edits wording**, the trainer-approved source carries **only** a trainer approval and the submitted descendant carries **only** a management approval. **Neither version carries both, and that is the expected outcome, not a defect.**

**No trainer approval is ever created, copied, transferred, re-dated or fabricated for a management-edited version.** A management-edited version carries no trainer approval row, because no trainer reviewed that exact text. The three checklist values recorded on a **management** approval row are **evidence that the trainer's gate was satisfied for the lineage source** — they are not a trainer approval and never stand in for one. The trainer's approval remains exactly where the trainer placed it, on the version whose content it attests to.

**Submission verifies lineage to a *current* trainer-approved source.** The compare-and-set that proves the version being submitted is the report's current candidate runs **before** lineage resolution, so the resolved trainer-approved source is the current lineage root by construction; a stale or superseded source cannot satisfy the gate. **A substantive assessment change is unreachable through management entirely** — it requires a return to the trainer, the trainer's correction through the governed workflow, and a fresh trainer approval that begins a new publication lineage.

**Preserved from A-028, unchanged:** approval is the freeze point; a version is self-contained with exactly nine immutable rating snapshots; checklist progress and approval evidence are version-scoped and immutable once frozen; a submitted version never reopens; the previous submitted version stays canonical during correction; `submitted_at` / `submitted_by` are write-once publication metadata that do not perform the freeze.

**The three-item Quality Checklist remains a trainer gate.** It attests to the trainer's review of that exact text and gates **trainer approval**. It is not a management instrument. A management wording-edit version carries **no checklist progress row**, and the **management approval row carries the checklist snapshot of the trainer-approved source version** — so the evidence that the trainer's gate was satisfied travels with the published report without management ever being asked to perform, or able to satisfy, the trainer's attestation.

---

## A-038 — Role-specific visibility and read models

**One canonical report format, one shared read model architecture, one presentation architecture** (A-021) — **unchanged**. Amendment 004 adds a **management pre-submission read**, not a second report format.

| Role | May read | Must never read |
|---|---|---|
| **Trainer** | Full working state for assigned sessions: status, current version content, rating snapshots, checklist, canonical pointer metadata, and any open correction request with its reason | Another trainer's sessions; audit rows |
| **Management** | (a) the **final-review candidate** while the report is `trainer_approved` — the four parent-facing content fields, plus the correction-request state it owns; (b) the **canonical submitted version**; ✅ **(c) the nine per-dimension ratings, READ ONLY — added 2026-08-11 by operator ruling `D-1`** | Drafts before trainer approval; internal trainer notes; ~~raw per-dimension assessment data;~~ checklist internals; approval internals; AI generation history; audit rows; any other centre's data |
| **Parent** | **Only** the canonical submitted version, **only** for linked students | Everything else, including any per-dimension rating grid in any form or wording, drafts, notes, approval internals, content hashes, revision counts, and any workflow-internal status |

> ✅ **AMENDED 2026-08-11 BY OPERATOR RULING `D-1`** (`FINAL_MVP_PORTAL_DECISIONS.md`, repository root; Authority Lock §2.3). **Management may VIEW the nine per-dimension ratings. `raw per-dimension assessment data` is struck from the Management "must never read" column and preserved above per annotate-never-delete.**
>
> **Why:** management is the highest authority in the academy and approves reports about children, so seeing the underlying assessment is reasonable oversight, not a leak. ▶ **The boundary that actually matters is that ASSESSMENT IS THE TRAINER'S JOB, and read-only visibility preserves it exactly.**
>
> ⛔ **WHAT `D-1` DOES NOT DO — all four still absolute:**
> 1. **Management may not EDIT a rating**, an observation, attendance, or a trainer's internal note. An assessment-level disagreement is a **return to the trainer** (A-034/A-035), never a management edit.
> 2. ⛔ **`Q-27` IS UNTOUCHED AND THE PARENT ROW BELOW DOES NOT MOVE.** `D-1` amends this clause **in the Management direction only** and grants Parent nothing. The nine ratings must still never reach a Parent session — not a page, not a DTO, not a projection, not an RPC result, not a client payload.
> 3. **Internal trainer notes, checklist internals, approval internals, AI generation history and audit rows remain barred to management.** Only the ratings moved.
> 4. **The content-hash prohibition below is NOT amended by `D-1`** and still stands. ⚠️ Its management-facing *rationale* — the 4⁹ reconstruction argument — is now weaker, because a reader permitted to see the grid gains nothing by reconstructing it; but **the rule was not named in `D-1` and is not changed here.** Management's "exact text I approved" proof continues to use the **separate domain-separated wording hash over the four panels only**, exactly as ratified. *(Rule preserved, rationale annotated — the same treatment `CLAUDE.md` §6 gave the eight-`report_status` rule when its stated reason went stale.)*

~~**Management pre-submission read is bounded to the review it exists to serve.** It exposes the parent-facing content management is reviewing and the workflow state it must act on. It does **not** expose the per-dimension ratings, and it does **not** become a general management window into assessment data — Amendment 002 A-019 item 13's canonical-report viewing and Phase 3's read breadth are unchanged.~~

✅ **REPLACED 2026-08-11 BY OPERATOR RULING `D-1`** (`FINAL_MVP_PORTAL_DECISIONS.md`). Struck text preserved above per annotate-never-delete; **only the ratings clause changed.**

**Management pre-submission read is bounded to the review it exists to serve.** It exposes the parent-facing content management is reviewing and the workflow state it must act on. ✅ **It DOES expose the nine per-dimension ratings, READ ONLY (`D-1`).** ⛔ It still does **not** become a general management window into assessment data: **internal trainer notes, checklist internals, approval internals and AI generation history remain barred**, and **no read grants any write.** Amendment 002 A-019 item 13's canonical-report viewing and Phase 3's read breadth are unchanged.

**Parent visibility is unchanged and absolute.** A parent reads the canonical submitted version and nothing else. A report that has never been submitted, or that has been returned to the trainer, produces the ordinary "not available" outcome — never draft data, and **never any disclosure that a correction cycle is underway**.

**The confirmed parent-view leak rule is unchanged and reinforced.** **No per-dimension rating grid appears on the Parent Feedback Report in any form or wording** (`CLAUDE.md` §6). No value from which the rating grid can be reconstructed — including a content hash over the ratings — may be returned to a parent or to management.

**The rating-reconstruction hazard, and its ratified resolution.** The report content hash covers the four parent-facing panels **plus** the nine ratings, and a rating is one of only four enum values. A reader who holds the four panels *and* that hash can therefore recover the exact per-dimension rating grid by exhausting **4⁹ = 262,144** candidates — trivial work. Management now holds the four panels by design, and management is now the actor who must supply a "this is the exact text I approved" proof at submission. **Returning the content hash to management would therefore recreate precisely the caught leak this project already fixed once**, and obscurity of the envelope grammar is not a control.

**Ratified:** the stale-render proof for the management stage uses a **separate, domain-separated wording hash computed over the four parent-facing panels only** — never the content hash. It leaks nothing, because it is a checksum of data the reader already holds in full; it is **derived by a pure function and not stored**, so it cannot drift; and it is re-verified server-side at submission. **The content hash remains trainer-only** and continues to carry trainer approval provenance and audit payloads. Alternatives considered and rejected: dropping the caller-supplied proof for the management stage (weakens the exact stale-render guard the proof exists for); returning the content hash to management under an explicit "raw private assessment data" carve-out (recreates the caught leak); and re-designing the content-hash preimage (changes trainer provenance and the audit payload contract to solve a reader-side problem).

**Per-row status gating on management screens is extended, not relaxed.** `CLAUDE.md` §6's rule that only `Submitted` rows link to report content is superseded **only** to the extent that a **`trainer_approved` row must link to the management final-review surface**. `incomplete`, `observation_saved`, `drafting`, `draft_ready` and `needs_edit` rows still expose **no report content** to management, and a `No Report` row still gets no action.

---

## A-039 — Notification lifecycle triggers, recipients and timing

This clause ratifies **lifecycle triggers and recipient rules only**. **Delivery is not implemented** — no transport, template, channel, retry policy or provider is chosen here.

**Required triggers:**

| # | Trigger event | Intended recipient relationship | Minimum non-sensitive payload | Deduplication expectation |
|---|---|---|---|---|
| 1 | **Trainer approval succeeds** (`… → trainer_approved`) | Every **authorized management membership of the report's centre**, resolved live | report id, class-session id, student id, trainer-approved version id, occurrence timestamp — **identifiers and timestamps only** | **At most one pending "final review required" notification per (report, trainer-approved version)**; a repeat approval of the same version after a failed attempt must not produce a second |
| 2 | **Management returns an assessment-level issue** (`trainer_approved → needs_edit`) | The **actively assigned trainer** for the report's class session, resolved live from the live assignment | report id, class-session id, student id, correction-request id, occurrence timestamp — **never the correction reason text** | **At most one pending notification per correction request** |
| 3 | **Management submission succeeds** (`approved → submitted`) | Every **parent linked to the report's student** through a live parent–student link | report id, class-session id, student id, submitted version id, occurrence timestamp | **At most one notification per (report, submitted version)**; a later correction cycle that republishes produces a new notification for the new submitted version |

**Timing rule — absolute, and stated as two distinct artefacts so it cannot be misread (clarified at Step 7I1D-R2).** The earlier single-sentence form ("a notification record is created only after the transaction succeeds") sat directly above a rule requiring an in-transaction write, and the two read as a contradiction. They are not — they describe **two different artefacts**:

| Artefact | Written | Visibility rule | Failure rule |
|---|---|---|---|
| **Outbox row** — the durable intent | **INSIDE** the governed transaction, in the same commit as the transition and its audit event | Becomes visible **only if that transaction commits**; a rolled-back transition leaves no outbox row | Cannot be lost once the transition committed |
| **Notification record / delivery attempt** — the recipient-facing artefact | **AFTER** commit, by a separately driven worker reading committed outbox rows | Never created for a rolled-back transition, because no outbox row survives one | A delivery failure **never** rolls back the committed governed transition, and is retried from the outbox |

**Effect.** "Created only after the transaction succeeds" governs the **notification record**; "written inside the governed transaction" governs the **outbox row**. Together they are the only construction satisfying both halves — no notification for a rolled-back transition, and no lost notification for a committed one. A post-commit hook with no in-transaction outbox row satisfies the first half and **violates the second**: a committed publication whose parent notification silently never happens, undetectably. That construction is prohibited.

**Forward-compatibility consequence, recorded so it is not discovered late.** Because the outbox row is written **inside** the governed transaction, the notifications checkpoint must **replace** the three emitting RPCs (trainer approval, management return, management Approve & Submit) in its own migration in order to add that INSERT. Step 7I therefore authors those three so the insertion point is a **single, clearly commented location** in each. **The outbox table, the notification record, the delivery worker and all external email/push delivery are not created by Step 7I and remain deferred.**

**Recipients are resolved live, never cached and never taken from a token claim** — management from live centre membership, trainer from the live class-session assignment, parents from live parent–student links (A-020, ADR-4).

**Payload minimization.** Notification payloads carry **identifiers and timestamps**. **No child name, no account name, no email address, no phone number, no report content, no rating and no correction reason** appears in a notification payload. A recipient's own delivery channel address is resolved at delivery time from live authorization, not carried in the record.

**No child PII is placed into an immutable audit event to support a notification.** The audit chain and the notification mechanism are separate; an audit event is permanent and unredactable, and must never be used as a notification carrier.

**Later implementation owner:** the Phase 1 notifications checkpoint (`/server/modules/notifications`), which owns the outbox schema, the delivery worker, the channel choice and the recipient-preference model.

---

## A-040 — Authorized Step 7I schema additions

**Amendment 003 A-031 fixed the boundary of the *first* migration, not a permanent ceiling.** A-032's own text assigns "read/mutation RPCs" to Step 7I, so Step 7I was always expected to add objects. Amendment 004 makes the Step 7I additive set **exact**, so the boundary discipline survives the addition.

**Authorized additions, for Step 7I only. This list is exhaustive.**

**1. One enum label**

- `public.report_status` gains **`trainer_approved`** (A-036). No other label is added, removed or renamed.

**2. Two new enums** (closed, workflow-bearing, not runtime-editable — A-026's enum test)

- a **correction issue-scope** enum: rating · observation · derived assessment fact;
- a **correction request status** enum: open · resolved.

**3. One new table** — the correction-request record of A-035, carrying exactly the ratified minimum representation, with:

- a **`centre_id`** column, **without which none of the composite foreign keys below is declarable** — the Step 7E composite-FK targets are `reports (id, centre_id)` and `centre_memberships (id, centre_id, role)`, both of which require the referencing row to carry its own `centre_id`. **(Stated explicitly at Step 7I1D-R2: it was previously implied only by the phrase "composite foreign key", and an exhaustive column list must not leave a required column to inference.)**;
- role-pinned composite foreign keys to a **management** requester membership and, on resolution, a **trainer** resolver membership;
- same-report composite foreign keys for **both** version references — the version under review when the issue was raised, and the resolving version;
- a **length-bounded** reason;
- a **partial unique index restricting the report to at most one `open` request**;
- centre and report agreement proven by composite foreign key, in the Step 7E style;
- **RLS enabled with zero policies, and explicit revokes from every client role** — the A-030 deny-by-default posture is not achieved by the absence of a grant alone, and the committed fixture verifier asserts RLS is enabled on **every** table in `public`.

**4. Three new `report_versions` columns**

- `content_hash` — the deterministic content identity required by v3 §20 and §23, arriving with the checkpoint that gives it meaning;
- a **content-hash envelope version**, so the algorithm that produced a stored hash is recoverable from the row;
- a **trainer-approved source version** reference, with a same-report composite foreign key and a not-self check.

**5. Five constraint and default changes** — each on a **provably empty** table, so no data migration exists (**widened from four at Step 7I1D-R2 by the addition of item 5**):

- `report_versions` authorship role pin **widened** from `trainer` to `trainer` or `management` (a management wording-edit version has a management author);
- `report_versions` submission role pin **narrowed** from `trainer` to **`management` only** (management is now the sole publisher — this makes the new rule *stricter* than the old one);
- `report_version_approvals` primary key **widened** from the version id to **(version id, approver role)**, so exactly one trainer approval and one management approval may coexist on one version;
- `report_version_approvals` approver-role pin **widened** from `trainer` to `trainer` or `management`, with the existing role-composite foreign key unchanged so each approval still proves a membership of that exact role;
- **`report_version_approvals.approver_role`'s `DEFAULT 'trainer'` is DROPPED.** Under the single-column primary key a defaulted role was harmless; under the **composite** key it is not — an INSERT that omitted the role would silently become a *trainer* approval and could coexist with a genuine one, manufacturing exactly the fabricated trainer approval A-037 forbids. **The role must be supplied explicitly by every approval-writing operation.** The column stays `NOT NULL`, so an omission now fails loudly instead of defaulting.

**Nothing else.** No view. No trigger. No extension. No additional table, enum, column or seed row. No placeholder column of any kind (A-032's rule is unchanged and still binding). **No notification, outbox, AI, evidence or PDPA object** — each keeps its existing owner.

**Functions are outside this clause.** A-031's ceiling counts enums, tables and seed rows; A-032 already assigns "read/mutation RPCs and server-action proof" to Step 7I. The exact function inventory — the governed RPCs, the authorization helper, the content serializer and the wording serializer of A-038 — is fixed by the Step 7I design baseline and proven by its acceptance-test contract, not by this amendment.

**Two implementation constraints are ratified here so they are not discovered late:**

- **The enum label addition and every use of `trainer_approved` are split across migration boundaries — mandatory, not an either/or (ratified at Step 7I1D-R2).** Step 7I therefore ships **exactly two migration files**: the first contains **only** `ALTER TYPE public.report_status ADD VALUE 'trainer_approved' AFTER 'needs_edit'` (plus the standing fail-closed ownership guard) and **commits**; the second contains every other authorized object and is the only file permitted to reference the label. The earlier "either place it in its own file, **or** avoid evaluating the literal in the same transaction" formulation is **withdrawn**, because its escape clause rested on a false generalization:
  - **The accurate rule.** PostgreSQL rejects a new enum value used in the same transaction that added it, and the check fires from the enum **input function** during **parse analysis**. **PL/pgSQL bodies are safe** — the language defers parse analysis of its SQL expressions to first execution, so a `plpgsql` body may contain the literal. **`LANGUAGE sql` bodies and SQL-standard `BEGIN ATOMIC` bodies are *not* safe** — they are parse-analyzed at `CREATE FUNCTION` time whenever `check_function_bodies` is on, which is the default, so such a body containing the literal **aborts the migration on first apply**. The blanket claim that "function bodies are stored text and are not evaluated at creation" was true only for `plpgsql`, and the Step 7I design permits `sql` bodies for its read functions — including the one read whose whole purpose is to select on `trainer_approved`.
  - **End-of-migration assertions that evaluate the literal remain unsafe in the adding transaction** under any language. With the split mandated above, the second file's assertions may evaluate it freely, because the label was committed by the first.
- **The five report-lifecycle tables must be asserted empty before any `NOT NULL` column, constraint replacement or default drop is applied**, and the migration must abort otherwise.

**Irreversibility is recorded, not discovered.** PostgreSQL offers no way to remove an enum label, so `trainer_approved` is **permanent** once the first file applies; the four constraint replacements and the default drop are reversible only while the tables remain empty. This is the project's first genuinely irreversible schema change, and it is accepted **because Step 7I applies only to a local disposable database whose down path is drop-and-rebuild**. `CLAUDE.md` §3.2's reversibility discipline continues to govern every reversible change. Recorded here so no later checkpoint treats the label as retractable.

**This clause authorizes shape, not execution.** **Step 7I remains unstarted and unauthorized.** No migration file may be authored, staged or applied under this amendment; each Step 7I sub-checkpoint still requires its own explicit orchestrator authorization (A-032, unchanged).

---

## What Amendment 004 explicitly does NOT change

- **Amendment 001 in full.** A-001 … A-013 are untouched. Every evidence safeguard, the audit-mirror phasing, the permanent continuity documents, the toolchain and the testing/accessibility rules are unchanged.
- **The parent boundary.** Parents remain view-only, submitted-only, linked-student-only. The no-per-dimension-rating-grid rule is unchanged and reinforced.
- **AI governance.** AI drafts; AI never publishes; grounding validation is unchanged and still non-negotiable; the AI worker has no lifecycle authority and no credential.
- **A-021's one canonical format**, one shared read model architecture, one reusable presentation architecture. Three read models over one format is not three formats.
- **A-028's approval-freeze principle**, self-contained versions with exactly nine immutable rating snapshots, version-scoped immutable checklist and approval evidence, the canonical-pointer rule, **its `submitted` exit rule — "the only exit from `submitted` is `needs_edit`, which creates a new version", which A-036 preserves and implements as T12 rather than superseding (stated explicitly at Step 7I1F-R3)** — and the attendance interaction (no report for an absent student; mid-cycle absence blocks progression; submitted-report attendance cannot flip to absent).
- **A-029's audit compatibility guarantees** and **A-030's deny-by-default privilege posture**, including "no governed direct client DML anywhere", "policy and grant ship together", and "the database role follows the credential, not the code location".
- **A-032's exclusion assignments and its non-authorization rule.** Ratifying a design authorizes nothing.
- **The one-centre MVP boundary** (A-014, A-015). No centre picker, no HQ tier, no super-admin, **and no multi-centre timezone administration**.
- **Figma Design 2's visual authority and its non-authority over governance** (A-022). Where a frame disagrees with this amendment, the amendment wins and the discrepancy is reported.
- **Every Step 7E, 7F, 7G and 7H accepted baseline and migration.** No committed migration SQL is edited. The Step 7H audit registry, chain mechanics, envelope, genesis rule, verification contract and append contract are unchanged, and **Step 7I emits only actions already in the ratified 16-action registry** — no registry extension is required or permitted, so neither `audit_append_event` nor `audit_verify_chain` is replaced.
- **The Step 7H baseline is clarified, not superseded.** Its §1.4 E3 rule that Approve & Submit emits **two `report.state_changed` events in one transaction** remains exactly true — only the actor changes, and 7H pins no actor. **A third clause is clarified, named at Step 7I1D-R2:** its deferred-decisions row "the ratified A-028 **seven-value** set binds at 7I when transitions are implemented" now binds to the **eight-value** set of A-036. The row's substance — that the status vocabulary binds at Step 7I rather than at Step 7H — is unchanged and correct; only the count moves. Its §8 originator column, which names the **save-edit** RPC as an originator of `report_version.created`, becomes **more** accurate under A-037's create-per-edit rule than it was under the superseded in-place model; the additional originators (management wording edit, reopen-for-correction) extend that column without contradicting it.
- **The workspace `governance-source/` directory.** It holds the pre-installation input copies, is referenced by **no** active governing document, is a byte-for-byte integrity baseline asserted unchanged by multiple accepted checkpoints, and is **not an active authority and not edited**. Its stale copies of `CLAUDE.md` and the Implementation Plan carry the superseded workflow wording and are **historical provenance only**.
- **Progress and decision records.** `STATUS.md`, `BUILD_NOTES.md` and both synchronized migration trackers are **not edited by this amendment**. Their existing entries are the historical record of the prior design and are **deliberately retained, not rewritten**; their forward-looking "next permitted action" text is updated only when the reconciled design is accepted.

---

## Effect on the Amendment 002 and Amendment 003 unresolved registers

| # | Item | Status after Amendment 004 |
|---|---|---|
| U-06 | Exact Design 2 report section and field schema | **Open, unchanged.** The four v3 §8 panels remain the authoritative content baseline, and they are also the exact management wording-edit allow-list. |
| U-14 | Content-hash algorithm and serialization | **Resolved in principle by A-040's authorization of the `content_hash` columns**; the exact envelope is ratified in the Step 7I baseline, not here. |
| U-20 | Invitation duration | Open, unchanged. |
| U-21 | Session-lifecycle vocabulary | **Open, unchanged — and explicitly not reopened.** A-036's future-session guard is a temporal predicate over existing columns, **not** a session-lifecycle status; no placeholder enum is invented. |
| U-22 | Restricted `NOLOGIN` `SECURITY DEFINER` owner | Open, unchanged. |
| U-23 / N-4 | Management bootstrap mechanism | **Open, and materially more important** — management is now the publisher, so a centre with no active management membership can publish no report. Recorded, not resolved. |
| U-24 | Management/trainer/parent audit-read capability | Open, unchanged. No audit-read surface exists. |

**Every other item in the Amendment 002 and Amendment 003 unresolved registers remains open and unchanged**, including evidence scope and uploader (A-014) and the Figma field inventories.

---

## Unresolved items carried or created by this amendment

These are **recorded, not answered**. Fabricating an answer to any of them is prohibited.

| # | Unresolved item | Blocks | Ratification owner |
|---|---|---|---|
| **U-25** | **Figma Design 2 coverage for the management review stage — an open, explicitly NON-BLOCKING design gap.** No suitable frame exists for: the management review queue; the management final-quality-review screen; the wording-only editor; the return-to-trainer dialog and its bounded correction-reason input; correction tracking; the management Approve & Submit confirmation modal; or the two notification surfaces. Under A-022/A-022.1 each is a new UI checkpoint with **no frame, no node link and no ratified field inventory**, and **these must not be invented** (`CLAUDE.md` §7.2 stop-and-ask). **Recorded at Step 7I1B-R1 and completed at Step 7I1D-R2.** The Step 7I1B-R1 reconciliation was **incomplete**: its §0.1 summary table listed only five families — omitting the **management final-quality-review screen**, the central surface of the whole stage — and **no notification surface appeared anywhere in the matrix**, so this clause's claim that the matrix carried a row "for each family" was false as recorded. **Corrected at Step 7I1D-R2, with its arithmetic stated precisely at Step 7I1F-R3:** the matrix's §0.1 lists **eight** missing design **families**; its §1 screen inventory carries the same **eight**; and its §5.2 Orchestrator porting actions carry **nine** implementation **rows**, because "Trainer reapproval after correction" is a separate porting row that **shares** the correction-tracking design family rather than adding a ninth family. **Eight families, nine porting rows** — the earlier claim that all three lists were eight was a miscount, not a missing requirement, and every family below is carried in all three places. The eight are **six management-review screen families** — review queue · **final review** · wording-only editor · return-to-trainer dialog · correction tracking · final Approve & Submit — **plus two notification surfaces**: the **staff notification surface** (management "final review required"; trainer "correction requested") and the **parent notification surface** ("a new report is available"). Between them the two cover all three A-039 triggers. **In-app surfaces only — external email and push delivery remain deferred and are not part of this gap.** **The governed behaviour is fully ratified — only the visual and interaction design is outstanding.** | The management-review and notification **UI checkpoints only** (A-022.3). **Not** the schema, **not** Step 7I, and **not** any other screen family. | Orchestrator, via the Gate G2 Figma handoff |
| ~~**U-26**~~ | ~~**Superseded instructions inside `docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md`**~~ — **RESOLVED at Step 7I1B-R1 (2026-08-05)** under an explicit orchestrator authorization to update that file. Its "Management report viewing" row, its trainer approval/submission row, its report-edit row and its Orchestrator porting actions were reconciled to Amendment 004; a new **§0 Amendment 004 reconciliation** block names the four superseded instructions explicitly (management report-view-only; management has no report-edit affordance; trainer approval directly publishes; Approve & Submit is trainer-only) and records what supersedes each. **No active instruction to build the superseded workflow remains in that file.** | — | Resolved |
| ~~**U-27**~~ | ~~**Bounded correction-reason maximum length.**~~ — **RESOLVED at Step 7I1D-R2: the bound is 2,000 characters.** A-035 requires the reason to be length-bounded; the operator confirmed 2,000 as the ratified value — sufficient for a specific, actionable correction note and far short of a free-form log. It remains trivially adjustable while the table is empty, but it is now a decision rather than a reviewable default. | — | Resolved |
| **U-28** | **Management notification recipient breadth.** A-015 guarantees exactly one active management membership per centre, so "every authorized management membership" resolves to one recipient today. The plural rule is ratified now so multi-management support stays additive. | Nothing today | Notifications checkpoint |
| **U-29** | **Post-submission correction initiation.** `submitted → needs_edit` remains **trainer-initiated**, unchanged. Whether management should also be able to initiate a post-publication correction is **decided by no source** and is **deliberately not invented here**. **Reaffirmed at Step 7I1D-R2: deferred, and explicitly NON-BLOCKING for the physical-test slice.** The trainer-initiated reopen is fully specified, fully reachable and fully tested, including the complete republication cycle; nothing in the Step 7I schema, RPC inventory, grant posture or acceptance-test contract depends on the management-initiated variant, and adding it later is additive (one new legal origin on the existing reopen RPC, no schema change). | Nothing today, and nothing at Step 7I2A–7I2G — the trainer path fully satisfies A-028 | Orchestrator, if the need arises |
| **U-30** | **Governed trainer read path to `observations`.** A returned report frequently requires editing `follow_up_notes` or a rating, which live on assessment tables carrying zero client access and no governed read path. Carried forward unchanged from the Step 7I baseline. | The Phase 1 assessment checkpoint | Phase 1 assessment checkpoint |
| **U-31** | **Notification module ownership and outbox schema.** A-039 ratifies triggers, recipients, timing, payload minimization and the outbox requirement. **No notification table, enum, RPC, audit action or delivery mechanism exists**, and none is created by Step 7I. The owner is named (the Phase 1 notifications checkpoint); the schema is not designed. | The notifications checkpoint only | Phase 1 notifications checkpoint |

---

*Ratified 2026-08-05. This amendment governs the two-stage report workflow, its authorization boundaries and the schema additions they require; it is **not an implementation authorization**. It supersedes only the clauses named in the supersession and clarification table; all other Specification v3 content, **all** Amendment 001 decisions, and every unnamed Amendment 002 and Amendment 003 decision remain authoritative and unchanged. Specification v3, Amendment 001, Amendment 002 and Amendment 003 are not edited in place. **Step 7I remains unstarted and unauthorized.***
