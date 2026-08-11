# PORTAL COMPLETION PLAN — B.E.S.T Coach Final MVP

> **PROCEDURAL PLANNING ARTEFACT. IT AUTHORIZES NOTHING.** It cannot override the specification, an amendment, `CLAUDE.md`, `FINAL_MVP_AUTHORITY_LOCK.md` or any operator ruling. Every phase below needs its own explicit Operator authorization, and **every phase that changes schema needs one absolutely** (§9).
>
> **Written 2026-08-11.** ✅ **REVISION 1, same day — the eighteen collisions in §2 are RULED** (`FINAL_MVP_PORTAL_DECISIONS.md` **§C**, `C-1` … `C-18`). Repository: **DEVELOPMENT CLONE**, branch `develop`, HEAD `8d52121`. **Nothing was built, migrated or committed to produce it.**
>
> **It is not a §10 phase model.** `CLAUDE.md` §10's Phase 0–4 model and its persona sign-offs are untouched. These are plan-level phases in the sense of §15.11, and **satisfying one numbering never satisfies the other**.

---

## 0. What this plan covers, and the one thing it deliberately does not

It schedules the five client-ratified portal decisions **`D-1` … `D-5`** together with the **24 deferred portal screens** that Amendment 005 **A-044** requires for the final MVP.

⛔ **The hero chain is CLOSED and COMPLETE and this plan re-opens none of it.** **No phase here may "complete" a surface the hero chain deliberately left alone**, and every one of its `REGISTERED-OMISSION`s stays protected — except where `D-1` … `D-5` and `C-1` … `C-18` expressly move one, which §2 enumerates line by line.

**Structure is by RISK, not by the chain.** Part 1 changes surfaces that currently work and are the Operator's only end-to-end evidence. Part 2 builds surfaces where nothing existing is at stake.

⚠️ **The Operator re-walks the chain manually between Part 1 and Part 2** (§5). Part 2 does not begin until that has happened.

---

## 1. Position, measured at HEAD — not read from a document

| Measurement | Value |
|---|---|
| Routes (`page.tsx`) | **17** |
| Feature components | **22 files, 8,785 lines** |
| Migrations · tables · functions | **21 · 27 · 40** |
| Delivered port methods (the real projection/action inventory) | **27** |
| Storage buckets · storage policies · evidence tables | **0 · 0 · 0** |
| Term / lesson-material / score objects | **0 of each** |

**Screen-to-route map, measured.**

| Built and reachable | Screen |
|---|---|
| `/login` (one page, role query) | `AUTH-01` · `AUTH-02` · `AUTH-03` |
| `/trainer/schedule` · `/trainer/sessions/[id]/roster` · `…/students/[id]/assess` | `05` · `06` · `07` |
| `/trainer/reports/[id]/generate` | `08` |
| `/trainer/reports` | `09` — ⛔ **refuses the bare canonical route** |
| `/trainer/reports/[id]/review` · `/edit` | `10`'s content + trainer wording editor — **`G-1` unframed** |
| `/management` · `/management/reports` | `11` (heading + banner + two counters) · `29` |
| `/management/reports/[id]/review` · `/edit` | `19` · management wording editor (`G-1`) |
| `/parent` · `/parent/reports` · `/parent/students/[id]/sessions/[id]/report` | `30` (heading + availability card) · `32` · `33` |

| Not built at all | Screens |
|---|---|
| Trainer · Management · Parent | `01 02 03 04` · `12 13 14 15 16 17 18 20 21 22 23 24 25 26 27 28` · `31` |

✅ **Two measured index defects, ruled and CORRECTED 2026-08-11** in `UI_REFERENCE_FINAL_MVP/SCREEN_INDEX.md` (its Notes A and B): **`09`'s canonical route is REFUSED, not partially built** (`returned-reports-queue.tsx:36`; live defect `C2C-007`), and **no route renders `10`** — its content lives on a `G-1` unframed surface. ▶ **A canonical route is a TARGET; it is never evidence that something answers at it.**

---

## 2. Governance collisions — ALL EIGHTEEN RULED

**Canonical record: `FINAL_MVP_PORTAL_DECISIONS.md` §C.** This section records the consequences for execution.

### 2.1 What `D-1` … `D-5` newly UNBLOCKED

Against the `GC-1` … `GC-14` register in `UI_REFERENCE_FINAL_MVP/FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md` §5:

| Was blocked | Now | Because |
|---|---|---|
| **`GC-6`** — per-dimension surfaces to Management on `11` `15` `16` `17` `18` `28` | ⚠️ **PARTLY** | `D-1` permits Management to **view** the nine — ⛔ **but `C-9` confines that to REPORT DETAIL surfaces**, so `11` `15` `16` `17` `18` are **still blocked**. The `"Overall"` / `"Strongest / Focus area"` columns stay `G-2` |
| **`GC-5`** — Performance Summary grid on `19` `28` | ⚠️ **PARTLY** | the grid on `19` only, **all nine** (`C-10`). Overall Grade, audience toggle and `Save as draft` still refused |
| **`G-4`** — terms omitted; `29`'s "All terms" filter refused | ✅ **REVERSED by `D-3`** | terms permitted as **scheduling structure**, grouping **SESSIONS** (`C-6`) |
| **`G-3`** — KEY FOCUS, SLIDES, `View lesson plan` prohibited | ✅ **QUALIFIED by `D-4`** | chips permitted **in a distinct position with a distinct label**; materials within `D-4`'s scope. Unblocks `03` and `14` |
| **`G-8`** — class video evidence out | ✅ **SUPERSEDED by `D-5`** | ⚠️ **the subject changed, not only the verdict** — `G-8` refused **class** footage, `D-5` authorizes **per-child** |
| **`A-001`** — armed but unactivated | ✅ **ACTIVATED** | by `D-5`; ⛔ **and `A-002` still gates it** — see `R-5` |
| **`G-2`'s ground 2** | ⛔ **GROUND LAPSED, EXCLUSION UNCHANGED** | survives on **unratified** + `Q-27` |

⛔ **`GC-1` `GC-2` `GC-3` `GC-4` `GC-7` `GC-8` `GC-9` `GC-10` `GC-11` `GC-12` `GC-13` `GC-14` are untouched.** Nothing weakens `Q-27`, `A-014`, `A-036`, `A-052` or the parent boundary.

### 2.2 The eighteen rulings, as they bind execution

| # | Ruled | Binds |
|---|---|---|
| **`C-1`** | ✅ **Propagation corrected.** Authority Lock **§8.1** and **§15**, and `G-8`'s *"regardless of any later evidence authorization"* clause, now carry `D-5`. ▶ **The NEW GROUND is stated in all three: client consent confirmed with iSpeak Academy. §8.1's original ground has NOT lapsed** — the PDFs still require no parent evidence projection, and no reader may cite the supersession as evidence otherwise | ✅ **DONE** |
| **`C-2`** | ✅ **Consent is CENTRE-LEVEL**, recorded once, not per media item. ⛔ **No `consent_records` table.** `A-001` gate 2 amended; propagated to `A-003`/`A-004` | `P1-2`, `P1-5` |
| **`C-3`** | ⛔ **Scan gate REMOVED. No scanning infrastructure exists and none will be built.** ⛔ No invented vocabulary, no fake state. **The absence is stated in the instrument AND in the product's own UI text on every upload surface** | `P1-2` |
| **`C-4`** | ⛔ **HELD — `A-057` is NOT amended.** The ruling names `evidence.attached`/`evidence.removed`; `A-057` ratifies `evidence.uploaded`/`evidence.accessed`. **Both say 16 → 18 and there are four strings between them** | ⛔ **BLOCKS `P1-2`** |
| **`C-5`** | ⚠️ **Visibility required · attestation absent · enforced by nothing.** Evidence must be **visible** on the management review surface before Approve & Submit; **whether a human watched it is not enforceable and no attestation claiming otherwise will be built.** `A-036`'s checklist stays trainer-only | `P1-3` |
| **`C-6`** | ⛔ **No lessons entity. Terms group SESSIONS.** Lesson identity stays two columns on `class_sessions`. `G-3.1` and `A-016` stand | `P2-2` |
| **`C-7`** | ⛔ **Per-phase authorization**, not a blanket amendment | `P1-2` `P2-2` `P2-6` |
| **`C-8`** | ✅ **`D-2` moves to Part 2, hosted on `18`** | `P2-9` |
| **`C-9`** | ⛔ **`D-1` = REPORT DETAIL surfaces only.** Ratings on a list or statistics surface **invites comparison between children** and was not authorized | `P1-1` `P2-7` `P2-8` `P2-9` `P2-15` `P2-16` |
| **`C-10`** | ✅ **All nine on `19`.** The frame's four is a selection of assessment substance with no ratified basis | `P1-1` |
| **`C-11`** | ⛔ **`28` deferred.** ⚠️ **`A-044`'s requirement is noted and UNMET, DELIBERATELY** | `P2-24` |
| **`C-12`** | ⚠️ **Report first, do not build** — §6.1 below is that report | `P2-23` |
| **`C-13`** | ✅ **DOB and own contact permitted on `30`.** The narrower residue is identified in §6.2 | `P2-22` |
| **`C-14`** | ⚠️ **Field inventories listed for ratification** — §6.3 | `P2-2` `P2-11`…`P2-14` |
| **`C-15`** | ⛔ **Student photo deferred entirely** | `P2-12` `P2-14` |
| **`C-16`** | ⚠️ **Raise the limit, not to 500 MB** — proposal and costs at §6.4 | `P1-2` |
| **`C-17`** | ✅ **Build both mandated panels**, recorded as **governance-mandated additions the frame omits**, cited | `P2-4` `P2-16` |
| **`C-18`** | ✅ **Scheduled at `P1-1`, measured scope** — §6.5 | `P1-1` |

### 2.3 ⛔ What still blocks a phase after the rulings

| # | Blocker | Blocks |
|---|---|---|
| **`R-4`** | **`C-4` is held.** Choosing among its three reconciliations decides **audit coverage** — one reading deletes the only trace that a signed URL to a child's video was minted. `CLAUDE.md` §12 and `A-057` §50 both make this a stop-and-ask | ⛔ **`P1-2`** and therefore the whole evidence chain |
| **`R-5`** | **`A-002` is untouched by `C-1`** — *"actual parent evidence access is first implemented and tested in **Phase 2**, never Phase 1"*, and `CLAUDE.md` §10 Phase 2 has not been entered | ⛔ **`P1-5`** |
| **`R-12`** | **`C-12` requires the `31` report before the ruling** | ⛔ **`P2-23`** — §6.1 discharges the report; the ruling is owed |
| **`R-14`** | **`C-14` field inventories await ratification** | ⛔ **`P2-2` `P2-11` `P2-12` `P2-13` `P2-14`** — §6.3 discharges the listing |
| **`R-16`** | **`C-16` figure awaits confirmation** | ⛔ **`P1-2`** — §6.4 discharges the proposal |
| **`R-7`** | **`C-7` per-phase table authorizations not yet given** | ⛔ **`P1-2` `P2-2` `P2-6`** |

---

## 3. How a phase is shaped

**One screen per phase. Each phase delivers that screen COMPLETE — projection, server action, frontend, verification — before the next begins.** ⛔ **No frontend-first pass with a trailing integration phase.** Within a phase, **server-side precedes the frontend that consumes it.**

Each phase carries: **frame** read in full (the `/reference/` `.png`, its `.html`, **and** the numbered pack's `screen.md`, which carries prohibitions and dependencies the visual artefacts cannot) · **built today, measured at HEAD** · **delta, classified** (`PRESENTATION-ONLY` · `NEEDS NEW PROJECTION` · `NEEDS NEW SCHEMA` · `NEEDS NEW SERVER ACTION` · `GOVERNANCE-BLOCKED`) · **data provenance** · **registered omissions**, each marked **ends when data arrives** or **never ends** · **verification** with a non-vacuity leg first · **authorization**.

▶ **A delta table is a reading of a frame, not a measurement of the build.** Hero Phase 5 classified a rail `NEEDS NEW PROJECTION` and it already existed; Phases 8 and 11 built nothing for the same reason.

**Disciplines.** `HERO_CHAIN_COMPLETION_PLAN.md` §12's twenty-five carried disciplines apply in full. Three are load-bearing everywhere below: **every proof of a refusal must first measure that the thing being refused exists** · **exit code is the only verdict, and never place a pipe between a verdict and the decision that consumes it** · **a search is evidence about the code only once it is proven discriminating.**

---

## 4. PART 1 — CHANGES TO PROVEN SURFACES

⚠️ **These phases modify the surfaces that are the Operator's only end-to-end evidence.** Each must demonstrate not only that the new thing works, but that the surrounding chain still does.

**Standing rule:** `npm run prove:hero-all` at **17/17 by exit code**, start and end of every phase.

---

### P1-1 · Screen `19` Management Student Report — `D-1`, all nine ratings read-only

**Frame** · `reference/Management - Student Report/` + `19-management-student-report/screen.md` + `implementation-notes.md` (`GC-5`, `R-B5`). Draws: the four panels · **Class Video Evidence** · Report Details · **Performance Summary tiles for four dimensions** · approval panel · **Confirm & Approve** · **Save as draft**.

**Built today** · `features/management/management-report-review.tsx` (981 lines). Four panels, Report Details (Name · Class · Lesson · Trainer · Session date · Status, from hero Phases 9/10), return-to-trainer with dimension selector, Approve & Submit. **`ManagementReviewDto` carries no rating; `report_get_management_review` returns twelve columns, none a rating.**

| Delta | Class |
|---|---|
| **All nine** per-dimension ratings, read-only, on the final-review surface (`C-10`) | **NEEDS NEW PROJECTION** |
| The same nine on the published/submitted management view | **NEEDS NEW PROJECTION** |
| Reconcile the `A-038` assertions — **measured scope, `C-18`/§6.5** | `PRESENTATION-ONLY` (documentation) |
| Overall Grade · `Save as draft` · audience toggle · content hash | **GOVERNANCE-BLOCKED** — `G-2` · `A-036` · `GC-5` · `CLAUDE.md` §6 |

**Data provenance.** **`report_version_ratings`** — nine immutable snapshots per version — joined to `assessment_dimensions` (`display_name`, **`sort_order`** — ⚠️ *the column is `sort_order`, not `display_order`; a guess about a column name is not a measurement*). **No new table, no new column, no backfill.**

⛔ **The shape is decided by one constraint.** The submitted view is read through **`report_get_canonical`**, which **dispatches on role and serves parent, trainer and management from one body**. **Ratings must not be added to it** — that puts them one branch away from a Parent session and makes `Q-27` depend on a conditional. **The management ratings arrive on a separate management-only read**, gated as `report_get_management_review` is.

⛔ **`C-9` bounds this phase and the next five.** `19` is a report detail surface. **`11`, `15`, `16`, `17`, `18` are not, and get no ratings** — *"a different disclosure shape; it invites comparison between children."*

**Registered omissions** — Overall Grade · `Save as draft` · audience toggle · content hash. **All four never end.**

**Verification — `prove:portal-1`.** Non-vacuity first: a version with nine ratings **exists** (the `S-8` finding). Then: management reads **nine, and exactly nine** · a **parent** call returns **no rating field in any shape**, asserted as an exact field-set match **and** a prohibited-substring scan, because either alone can be edited around · a **trainer** call unchanged · **no rating reaches `report_get_canonical`** · `ParentReportListItemDto` and `CanonicalReportContextDto` field sets **byte-unmoved** · governed counts unmoved, with mid-transaction counts proven to **differ**.

**Authorization** ✅ **REQUIRED.** No open blocker.

---

### P1-2 · Screen `08` Trainer AI Report Generation — `D-5` evidence substrate + per-child upload

⛔ **BLOCKED on `R-4` (`C-4` held), `R-7` (`C-7` table authorization), `R-16` (`C-16` figure).**

⚠️ **The largest change in Part 1, on the screen carrying the most ruled-out material of any frame.**

**Frame** · `reference/Trainer - AI Report Generation/` (`GC-1`). Draws editable panels · **`Class Video Evidence` upload, `MP4, MOV · up to 500MB each`** · Report Details · Performance Summary · **Confirm & Submit** · **Save as draft**.

**Built today** · `features/trainer/trainer-draft-generation.tsx` (819 lines). Panels, class + lesson context, draft request, grounding. **No evidence surface. Zero buckets. The only Storage API reference in the repository is a commented-out config line.**

| Delta | Class |
|---|---|
| Evidence table, bucket, storage policies, grants | **NEEDS NEW SCHEMA** (`C-7`) |
| Governed upload path; short-TTL server-minted signed URL read path | **NEEDS NEW SERVER ACTION** |
| ⚠️ **UI text stating media is NOT SCANNED** (`C-3`) | **NEEDS NEW SERVER ACTION**'s surface — **mandatory, not optional copy** |
| Trainer upload control | `PRESENTATION-ONLY` once the above lands |
| The frame's **`Class Video Evidence`** heading and **500 MB** | **GOVERNANCE-BLOCKED as drawn** |

⛔ **The heading is a governance question, not a label.** `G-8` refused **class** footage; `D-5` authorizes **per-child**. **Not built as drawn** — a reader would otherwise build the refused thing with the frame apparently agreeing.

⚠️ **`C-3`'s UI-text obligation is part of this phase's acceptance, not a nicety.** The upload surface must state that **uploaded media is not scanned** and that a production deployment would require scanning. ▶ **An honest absence beats a satisfied-looking gate** — and a gate removed in an instrument but not surfaced in the product is neither.

**Data provenance.** Everything net-new. Association is **exactly one session report**, never moved or reused, so the row keys to the report — not to the session, not to the class.

**Registered omissions** — 500 MB (**never ends**) · class-footage framing (**never ends**) · `Save as draft` (**never ends**).

**Verification — `prove:portal-2`.** Non-vacuity: an evidence object **exists** before any refusal is asserted. Then `A-003`'s **remaining** prohibited paths fail closed — unauthorized · unrelated child · pre-`Submitted` · expired URL · direct storage path · public object — **and the permitted path succeeds for the authoring trainer**. ⛔ **`A-003`'s `unscanned` leg is `NOT APPLICABLE (C-3)`, never `PASS`** — a must-fail leg with nothing to test either fails forever or gets quietly marked green, which is the `S-8` defect on a refusal proof. ⛔ **`unconsented` is no longer a per-request refusal** (`C-2`); what is provable is that the centre-level arrangement is in force. Plus: the drafting path still has **zero evidence surface** · no bucket is public · no service-role credential reaches a client bundle.

---

### P1-3 · Screen `19`, second visit — `D-5` management evidence review

⚠️ **A DELIBERATE DEPARTURE FROM ONE-SCREEN-ONE-PHASE, RECORDED RATHER THAN HIDDEN.** `19` is the only screen two decisions land on. Coupling them would make the smallest, safest change in Part 1 (`D-1`) wait behind the largest (`D-5`). **`19`'s full verification re-runs at both.**

**Delta** · management-side player — `PRESENTATION-ONLY` over P1-2's read path. ⛔ No download control for any role.

⛔ **`C-5` decides the shape, and the wording matters.** **Visibility is required; attestation is absent; it is enforced by nothing.** The evidence must be **visible** on the review surface before Approve & Submit. ⚠️ **No server-side precondition is added to `report_management_approve_and_submit`, and no management checklist item is created** — `A-036`'s checklist stays trainer-only. ▶ **This must be recorded in the surface's own code comment and in the pack, explicitly, so no later reader takes it for a gate** — the project has four recorded instances of a rule being "completed" because its status was ambiguous.

⚠️ **State the retrievability limitation on the surface:** no download affordance; **no claim of technical impossibility.**

**Verification — `prove:portal-3`.** Management reads evidence for a `trainer_approved` pair · management **cannot mutate or remove** it (Lock §8: review only) · **no download affordance in the built client chunks**, measured in the bundle not the source · ⛔ **an explicit leg asserting Approve & Submit is NOT gated on viewing** — because `C-5` ruled it is not, and an unasserted non-gate is how a phantom gate gets built later.

---

### P1-4 · Screen `10` Trainer Student Report — `D-5` trainer evidence view

⚠️ **`10` has no route of its own** (§1, now corrected in `SCREEN_INDEX.md`). Its content lives on `/trainer/reports/[reportId]/review`, a **`G-1` unframed** surface whose disposition is **`NOT APPLICABLE (G-1)`** — a ruled disposition, never a pass and never a gap.

**Delta** · trainer-side player — `PRESENTATION-ONLY` over P1-2. ⛔ No download control. Heading not as drawn.

**Verification — `prove:portal-4`.** The authoring trainer reads it · a trainer with **no live assignment** to that session does not. ⚠️ **`prove:hero-8/11` compare shells and would pass unchanged if either editor could not save at all** — they are not evidence this surface works and must not be reported as such.

---

### P1-5 · Screen `33` Parent Class Report — `D-5` parent evidence view

⛔ **BLOCKED on `R-5`.** `C-1` resolved Authority Lock §8.1 and §15 and `G-8`; **it did not rule on `A-002`**, which assigns parent evidence access to **Phase 2, "never Phase 1"**, and `CLAUDE.md` §10 Phase 2 has not been entered.

✅ **`C-1` and `C-2` cleared the other two blockers** — the projection is IN, on the new ground of client consent confirmed with the academy, and the consent gate is centre-level with no table to build.

**When ruled**, the phase delivers the `Watch Together` player under every surviving `A-001` gate and `A-004`'s **both-direction** Parent UAT. ⛔ **A refusal suite with no permit leg is `NOT-RUN` wearing a `PASS`.**

**Until then `33`'s region stays omitted and its absence is `EXPECTED / REQUIRED`.**

---

### ~~P1-6 · `D-2`~~ ✅ **DISSOLVED BY `C-8` — moved to `P2-9`, hosted on screen `18`**

**The finding that produced the ruling, retained:** no proven surface's frame draws a progression graph. Building one on `19`/`10`/`32`/`33` would **invent a visible element the ratified frame lacks** — `CLAUDE.md` §7.2, and the rule that gave `33` no trainer row.

---

## 5. ⛔ THE MANUAL RE-WALK — the gate between Part 1 and Part 2

**Part 2 does not begin until the Operator has re-walked the chain manually and said so.**

**Why it is a gate.** The automated sweep is strong on refusals and structure and **weak in two known places**: `prove:hero-8/11` compare shells and **never mount a form or fire an action**, so they would pass if either editor could not save; and **rendered capture is `NOT-RUN` on every authenticated surface** — nothing in the suite looks at a rendered page.

⚠️ **What the walk is:** **Operator manual verification at those commits only — point-in-time.** **Not** a harness pass, does **not** cover hover, focus or responsive collapse, and **does not transfer to any later change.**

**Carry into it** — the **silent-save reproduction**, still owed (§10).

---

## 6. Discharges — the four reports the rulings asked for, and the measured scope of the fifth

### 6.1 `C-12` — what remains of screen `31` Parent Calendar once the rating apparatus is removed

**Requested before the ruling. This is the report; `31` is not built until it is ruled.**

`GC-2` is *"the most severe conflict in the set"* — it publishes the entire competency taxonomy to a parent, engaging **A-052**.

| The frame draws | Disposition |
|---|---|
| Month calendar with **per-day rating colouring** | ⛔ **REMOVED** — `Q-27`, `A-052` |
| **"What the colours mean" legend** glossing all four levels | ⛔ **REMOVED** — the taxonomy-disclosure limb, the most severe line |
| Selected-day card: **B.E.S.T. Rating** | ⛔ **REMOVED** |
| Selected-day card: **a trainer observation** (`:13`, `:23`) | ⛔ **REMOVED** — also breaches the no-internal-notes rule; **two lines, and a pass working from one would leave the other standing** |
| Selected-day card: **skill tags** | ⛔ **REMOVED** |
| Monthly summary: **"13 mastered days"**, four-level counters | ⛔ **REMOVED** — rating-vocabulary aggregate |
| **`Developing` status pill** | ⛔ **REMOVED** |
| Month calendar grid, month navigation, date selection | ✅ **SURVIVES** |
| Selected-day card **reduced to session identity** — class grade, module, lesson number/title, trainer, date | ✅ **SURVIVES** — every field already ratified for a Parent surface (`G-3`, `G-5`, hero Phase 2) |
| **`View Report`** action, gated on a genuinely `submitted` report | ✅ **SURVIVES** |
| **Recent Reports** list | ✅ **SURVIVES** — it is `32`'s row model, already built |
| Student selector, parent profile | ✅ **SURVIVES** |

▶ **Honest summary: roughly half the frame's distinctive content is the rating apparatus, and all of it goes.** What remains is a **month calendar of the child's sessions, plus a report list** — genuinely useful, and visibly plainer than the frame. ⚠️ **Its absence is `EXPECTED / REQUIRED`, never a visual regression** — but the Operator should see the shape before authorizing, which is what `C-12` asked for.

**One design consequence.** With colouring gone, the calendar needs a **non-rating** way to distinguish days. The ratified, non-derived options are: **a session occurred** · **a report is available to read**. ⛔ **Neither is rating-derived**, and no third state may be invented.

### 6.2 `C-13` — the narrower residue

**The ruling is applied: a parent seeing their own child's DOB and their own contact details is permitted.** The genuine residue is two things, **neither of which is the child's own data**:

1. ⛔ **The `Trainer Assistant (TA)` field** in the same Profile Details row — `A-014` defers the persona, `G-7` binds `centre_membership_role` against extension. **Live and prohibited.** `C-13` does not reach it.
2. ⚠️ **The cited rule never reached this surface.** Authority Lock §15 filed the finding against *"§15's four-prose-panels-only rule"* — but **§15 governs the PARENT REPORT PROJECTION**, and Profile Details is a **Dashboard** element. ▶ **A report-scoped rule was applied to a non-report surface.** The ruling is not an exception to §15; **§15 was never the right instrument.**

### 6.3 `C-14` — the unratified field inventories, listed for ratification

⚠️ **Measured first, because it changes what the list means.** The columns that exist today are thin:

| Table | Columns |
|---|---|
| `students` | `id` · `centre_id` · **`full_name`** · `is_active` · `created_at` · `updated_at` · `deactivated_at` |
| `trainer_profiles` · `parent_profiles` | `membership_id` · `centre_id` · `membership_role` · timestamps — ⚠️ **no name, no email, no phone**; the name lives on `accounts.display_name` |
| `class_modules` | `id` · `centre_id` · `class_grade_id` · **`title`** · `is_active` · timestamps |
| `class_sessions` | `id` · `centre_id` · `class_module_id` · `session_date` · `starts_at` · `ends_at` · timestamps · **+ `lesson_number` · `lesson_title` · `room`** (hero 0B) |

▶ **Essentially every field on these forms beyond a name is unbacked.** Each row below therefore needs **both** a ratification and a column.

| Screen | Field | Status |
|---|---|---|
| **`20` / `22`** Register / Edit Student | first name · last name | ⚠️ **Ratify shape** — today it is one `full_name`. Splitting it is a schema change |
| | date of birth | ⚠️ **Ratify** — permitted to Parent per `C-13`; no column |
| | **gender** | ⚠️ **Ratify — recommend OMIT.** No governed use anywhere in the product |
| | **student ID** | ⚠️ **Ratify** — a human-facing identifier distinct from the UUID; drawn on `17`, `18`, `21` too |
| | parent name · parent contact · email | ⚠️ **Ratify** — partly duplicates `parent_profiles`/`accounts`; ⛔ **do not create a second source of truth for a parent's identity** |
| | **home address** | ⚠️ **Ratify — recommend OMIT.** PDPA surface with no governed use |
| | **photo** | ⛔ **DEFERRED by `C-15`** |
| | withdraw student | ⚠️ **Ratify semantics** — `students.is_active`/`deactivated_at` exist; ⛔ **`GC-14`'s "undone within 30 days" is unratified retention and stays out** |
| **`21`** Create Parent Account | full name · email · phone | ⚠️ **Ratify** — `invitations` carries a normalized email today |
| | **relationship** (to the student) | ⚠️ **Ratify — recommend OMIT.** `parent_student_links` carries the link; the relationship word carries no authorization |
| | send-email-invite toggle | ✅ **Already modelled** — `invitations`; ⛔ **no plaintext password is ever generated, stored, displayed or emailed** |
| **`24`** Add Trainer | first/last name · email · phone | ⚠️ **Ratify** |
| | **employee ID** | ⚠️ **Ratify — recommend OMIT.** No governed use |
| | **role selector offering `Assistant Trainer`** | ⛔ **PROHIBITED — `GC-11`.** Not a member of `centre_membership_role`; **cannot be persisted at all** |
| | **photo** | ⛔ **DEFERRED by `C-15`** |
| **`26` / `27`** Add / Edit Class | class name | ✅ **Exists** — `class_modules.title` |
| | programme · level | ⚠️ **Ratify** — "level" maps to `class_grades`; **"programme" has no entity** and ⛔ **must not become a hidden `classes` entity** (`A-016`) |
| | room | ✅ **Exists** on `class_sessions` (`G-6`) — ⚠️ ratify whether it is also a module-level default |
| | **class code** | ⚠️ **Ratify — recommend OMIT** |
| | day selectors · start/end time | ⚠️ **Ratify** — sessions are dated rows today; a recurring pattern is a **generator**, not a stored schedule |
| | **term** | ✅ **Ruled by `D-3`** — ⛔ **grouping SESSIONS, no lessons entity (`C-6`)** |
| | assigned trainer | ✅ **Exists** — `class_session_assignments` |
| | **Trainer Assistant (TA)** | ⛔ **PROHIBITED — `A-014`, `G-7`** |
| | **capacity** | ⚠️ **Ratify — recommend OMIT.** No enrolment ceiling is enforced anywhere |
| **`23`** Trainers | **`On leave` status** | ⛔ **PROHIBITED — `GC-12`.** `centre_memberships.status` is exactly `pending`/`active`/`deactivated` |

### 6.4 `C-16` — the proposed upload limit, and what it costs

**Recommendation: `200 MiB` per object.**

**Why that figure.** A per-child clip is one presentation turn — realistically **1–3 minutes**. Phone video at 1080p30 runs ~8 Mbps ≈ **60 MB/min**, so three minutes ≈ **180 MB**. `200 MiB` covers that with headroom and **still refuses** a long class recording, which is the shape `G-8` refused and `D-5` did not authorize. **500 MB is the frame's number and buys only the footage that is out of scope.**

**What it costs, stated rather than glossed:**

1. **Storage and egress.** 200 MiB × one clip per learner per session is the dominant cost driver in the whole product. At a modest 30 learners × 10 sessions it is **~60 GB** — beyond every free tier, and it grows per term with no retention policy in place (**PDPA retention is Phase 4 and unbuilt**).
2. **Upload reliability.** A single-shot 200 MiB POST is fragile on a phone network in a classroom. Doing this properly needs **resumable/multipart upload**, which is materially more implementation than a simple form post.
3. ⚠️ **The `config.toml` limit is GLOBAL, not per-bucket.** Raising `file_size_limit` raises it for **every** bucket, including the deferred photo and lesson-materials buckets. **The 200 MiB ceiling must additionally be enforced per-bucket and re-validated server-side**, or the ruling silently widens two other media classes.
4. ⛔ **The abuse surface is now unscanned.** `C-3` removed the scan gate, so a larger ceiling means more unscanned bytes accepted from an authenticated trainer. **That is a stated, accepted limitation** — recorded here so the two rulings are read together rather than separately.

**If a smaller figure is preferred:** `100 MiB` covers ~90 seconds of 1080p and forces trainers to keep clips short — cheaper on every axis above, at the cost of occasional rejected uploads a trainer cannot easily diagnose.

### 6.5 `C-18` — the measured `A-038` reconciliation scope for `P1-1`

**The recorded scope was *"the ~10 UI packs' `GC-6` entries"*. The measured register is different in kind and smaller in count.**

| Where | Count | Rank |
|---|---|---|
| Pack `implementation-notes.md` with a literal `GC-6` bullet | **6** — `11` `15` `16` `17` `18` `28` | functional rank 5 |
| `FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md:369` (the register row) | 1 | rank 5 |
| `FINAL_MVP_EXECUTION_PLAN.md:2599` | 1 | procedural |
| *"GC-5/GC-6 remain live"* restatements | 3 — ⚠️ **Authority Lock `:487`**, `30-parent-dashboard/implementation-notes.md:222`, `BUILD_NOTES` | one is **the Authority Lock** |
| ⛔ **Live source files asserting `A-038` bars management ratings** | **4** — `management-dashboard.tsx` · `management-report-review.tsx` · `management-reports-queue.tsx` · `management-wording-editor.tsx` | **not rank 5 at all** |

⛔ **`management-dashboard.tsx` is the priority.** Its nine-line banner reads *"THE FRAME DRAWS RATINGS ON A MANAGEMENT SURFACE. IT MUST NOT BE BUILT (A-038)"*. ▶ **After `D-1` it reaches the RIGHT CONCLUSION for the WRONG REASON** — the frame's rating there is a **roll-up**, so `G-2` still excludes it, but the comment credits `A-038`. ⚠️ **And `C-9` means the conclusion holds for a second reason too**: `11` is a list surface, and `D-1` does not reach it.

**Fourth instance in this project of the same defect: a rule whose stated reason has gone stale invites a later phase to "fix" it.** Each of the 15 locations is corrected to state **which ground now carries it** — `G-2`, `C-9`, or both — never left asserting a lapsed one.

---

## 7. PART 2 — NEW CONSTRUCTION

**Nothing existing is at risk; the phases are larger.** Ordering is by dependency: the phase that first needs a substrate delivers it, never an orphan infrastructure phase.

| Substrate | Delivered in | Consumed by |
|---|---|---|
| **`D-3` terms** — grouping **SESSIONS** (`C-6`) | **P2-2** (`26`, where term data originates) | `02` `03` `14` `18` `25` `27` `29` |
| **`D-4` lesson materials** — bucket, table, upload/download | **P2-6** (`14`, Management uploads) | `03` `06` |
| **`D-2` score** — the computation, mapping in one place | **P2-9** (`18`, the only framed host — `C-8`) | `18` |

| # | Screen | Delivers | Depends on | Gated by |
|---|---|---|---|---|
| **P2-1** | `12` Management Classes | Class-list projection, level tabs | — | — |
| **P2-2** | `26` Add Class | ⚠️ **`D-3` terms substrate** + class creation | P2-1 | `C-6` `C-7` `C-14` |
| **P2-3** | `27` Edit Class | Class edit write path | P2-2 | `C-14` |
| **P2-4** | `13` Class Overview | Class summary, lesson timeline, **+ Class Health Summary** | P2-1 | `C-17` (`GC-9`) |
| **P2-5** | `25` Management Schedule | Centre calendar as a **projection** of class sessions | P2-2 | `GC-13` — no `Showcase`, no duplicated event record |
| **P2-6** | `14` Lesson Plan Management | ⚠️ **`D-4` materials substrate** + Management upload | P2-4, P2-2 | `C-7`; Lock §8.2 — **separate bucket, separate policies** |
| **P2-7** | `11` Management Dashboard | KPI tiles, approval list, calendar, events | P2-1, P2-5 | ⛔ **`C-9` — no ratings**; `C-18` |
| **P2-8** | `17` Management Students | Student list, level filter | P2-1 | ⛔ **`C-9` — no ratings**; `GC-7` |
| **P2-9** | `18` Student Profile | Profile, **`D-2` Growth Trend** | P2-8, P2-2 | `C-8`; ⛔ **`C-9` — Skill Breakdown is a statistics shape, not report detail** |
| **P2-10** | `23` Trainers | Trainer list | — | `GC-12` — no `On leave` |
| **P2-11** | `24` Add Trainer | Trainer creation + invitation | P2-10 | `C-14`, `GC-11`; ⛔ `C-15` photo deferred |
| **P2-12** | `20` Register Student | Student registration | P2-8 | `C-14`; ⛔ `C-15` |
| **P2-13** | `21` Create Parent Account | Parent profile + invitation | P2-12 | `C-14` |
| **P2-14** | `22` Edit Student | Student edit + withdrawal | P2-12 | `C-14`, `GC-14`; ⛔ `C-15` |
| **P2-15** | `15` Lesson Statistics | Lesson-level aggregates | P2-4 | ⛔ **`C-9` — no ratings** |
| **P2-16** | `16` Class Statistics | Class aggregates **+ Management Insight + Students Needing Follow-up** | P2-15 | ⛔ **`C-9`**; `C-17` (`GC-10`) |
| **P2-17** | `02` Trainer My Classes | Trainer class cards, term selector | P2-2 | `G-7` — no TA |
| **P2-18** | `03` Trainer Lesson Plan | `D-4` download + **KEY FOCUS in a distinct position** | P2-6, P2-17 | `D-4`'s hard constraint |
| **P2-19** | `01` Trainer Dashboard | Trainer landing at `/trainer/dashboard` | P2-17 | `GC-7` — no rating column |
| **P2-20** | `04` Trainer Students | Trainer student list | P2-17 | `GC-7` |
| **P2-21** | `09` Trainer Reports | ⛔ **fix `C2C-007` first**, then the frame's table | — | `GC-7`, `GC-8` |
| **P2-22** | `30` Parent Dashboard | Profile Details promoted, selector, calendar, upcoming | P2-5 | ✅ `C-13`; ⛔ `Q-27`; ⛔ **no TA field** (§6.2) |
| **P2-23** | `31` Parent Calendar | **Only what §6.1 lists as surviving** | P2-22 | ⛔ **`C-12` — report delivered, ruling owed** |
| **P2-24** | `28` Term Report | ⛔ **DEFERRED by `C-11` — do not build** | — | ⚠️ **`A-044` noted and unmet, deliberately** |

### The four Part 2 phases carrying the most governance weight

**P2-6 / P2-18 — `D-4`.** ⛔ **The constraint that must not be lost:** KEY FOCUS chips are permitted **in a distinct visual position with a distinct label**, and **must never occupy, replace, or visually adjoin the governed carried-over previous-session focus line, or any surface presenting the governed focus.** ▶ **The position is the rule, not the content**, and **the substitution cannot be seen on the rendered page** — so the check must be structural. This protects **`CLAUDE.md` §10 Phase 1 exit condition (c)**, a ratified phase gate. The hero chain asserted the equivalent boundary in **three layers** — schema, contract and **JSX** — locating the carried-focus block by its own label, asserting no lesson token inside it, **and** asserting it still renders `carriedFocus`, because an emptied block satisfies the first assertion perfectly. **P2-18 repeats all three.**

**P2-9 — `18` and `D-2`.** ▶ **Standing test: if a surface ever displays `D-2`'s value as a number, a band or a grade, that is `G-2` and it is prohibited** (Lock §11). The mapping lives in **one place**; the value is **not stored**. ⛔ The frame also draws **`Generate Term Report`** (`C-11`, not built) and **Trainer Assistants** in Classes Enrolled (`A-014`, prohibited). ⚠️ **`C-9` bites here**: `18` is a profile surface, not report detail — **Skill Breakdown gets no per-dimension ratings**, and the Growth Trend is a **trend line only**, never a per-dimension chart.

**P2-16 / P2-4 — `C-17`'s two mandated panels.** `CLAUDE.md` §6 fixes both **exactly**: the Class Health Summary's **four conditions, evaluated top to bottom, first match wins**; Management Insight's **fixed three-sentence template** and its **per-dimension lookup table**. ⛔ **Neither may ever be AI-authored prose** — that silently pulls the §8-deferred Weekly Class Health Brief into scope. Both compute over **submitted** reports only. **Each is recorded in its pack as a governance-mandated addition the frame omits, citing `CLAUDE.md` §6 and `C-17`.**

**P2-22 — `30`.** ⛔ **`Q-27`: the complete `This Term's Skills` card is `DO_NOT_IMPLEMENT`** — title, all nine labels, all bars, all rating-derived state, and **any replacement visualization**. Hiding, emptying, collapsing, renaming or substituting are all non-compliance. **Profile Details promotes upward; no blank rectangle, no invented filler card.** Its absence is **`EXPECTED / REQUIRED`**. **It is a data boundary, not CSS.**

---

## 8. ⛔ STANDING PROHIBITIONS — carried unchanged

| # | Prohibition | Source |
|---|---|---|
| 1 | **`G-2` Overall Grade / any roll-up rating — PERMANENTLY EXCLUDED**, all surfaces | Hero §2; Lock §11, §14 |
| 2 | **KEY FOCUS never in, over, or visually adjoining the governed carried-over focus** | `G-3`/`D-4`; `CLAUDE.md` §12 |
| 3 | **SLIDES chips and `View lesson plan` as drawn** — only within `D-4`'s scope | `G-3`; `D-4` |
| 4 | **`Assist.` staff slot** — `centre_membership_role` NOT extended | `G-7` |
| 5 | **`A-014` TA persona deferred** — no TA field on any card, profile or form | `A-014`; `D-5`; §6.2 |
| 6 | **Term REPORTS** — `D-3` authorizes structure only | `D-3`; `C-11` |
| 7 | **Class-footage evidence** — `D-5` is **per-child** only | `D-5`; `G-8` |
| 8 | **`Q-27` unmoved** — nine ratings reach no Parent surface, DTO, projection, RPC result or payload | Lock §15.2 |
| 9 | **The content hash unwidened** — both audiences | `CLAUDE.md` §6 |
| 10 | ⛔ **`D-1` does not reach a list or statistics surface** | **`C-9`** |
| 11 | **Eight `report_status` values, no ninth** | `A-036` |
| 12 | **Management edits four wording fields and nothing else** — rejected server-side, not hidden | `A-034` |
| 13 | **No parent may distinguish "not yours" from "nothing submitted"** | `R-C2-6` |
| 14 | **`NULL` means NOT RECORDED — omit the element.** Never "Lesson 1", never "TBC", never a dash | Hero 0B |
| 15 | ⛔ **No student photo** | **`C-15`** |
| 16 | **No `supabase db reset`. No push. No `main`. No hosted or billable action.** The demonstration workspace, `zjukuffiuzkbiblmnuwl` and `best-coach-mvp.vercel.app` are **FROZEN** | `CLAUDE.md` §12; Operator |

---

## 9. Authorization register

⛔ **A ruling is not an authorization.** `D-1` … `D-5` and `C-1` … `C-18` authorize **no** table, enum, column, bucket, policy, RPC, grant, audit action string, migration, route or screen. **`C-7`: every new table family needs its own explicit Operator ruling at its phase.**

| Phase | Change class | Before any code |
|---|---|---|
| **P1-1** | Management projection extension + a new management-only read | ✅ **REQUIRED** — no open blocker |
| **P1-2** | ⚠️ **SCHEMA + STORAGE + audit registry** — the highest-risk item in the plan | ✅ **REQUIRED** — ⛔ **BLOCKED on `R-4` `R-7` `R-16`** |
| **P1-3** | Management read of evidence; ⛔ **no transition-guard change** (`C-5`) | ✅ **REQUIRED** |
| **P1-4** | Trainer read of evidence | ✅ **REQUIRED** |
| **P1-5** | ⚠️ **Parent projection extension** | ✅ **REQUIRED** — ⛔ **BLOCKED on `R-5` (`A-002`)** |
| **P2-2** | ⚠️ **SCHEMA — terms** | ✅ **REQUIRED** (`C-6` `C-7` `C-14`) |
| **P2-6** | ⚠️ **SCHEMA + STORAGE — lesson materials** | ✅ **REQUIRED** (`C-7`) |
| **P2-9** | `D-2` host + a management cross-session read | ✅ **REQUIRED** (`C-8` `C-9`) |
| **P2-3 · 11 · 12 · 13 · 14** | ⚠️ **New governed WRITE paths** | ✅ **REQUIRED** each (`C-14`) |
| **P2-1 · 4 · 5 · 7 · 8 · 10 · 15 · 16 · 17 · 18 · 19 · 20 · 21 · 22** | New read projections + RLS policy + minimum matching grant | ✅ **REQUIRED** each |
| **P2-23** | `31` | ⛔ **Ruling owed on §6.1** |
| **P2-24** | `28` | ⛔ **DO NOT BUILD** (`C-11`) |

⚠️ A `STANDING_LOCAL_EXECUTION_AUTHORIZATION` over a named range can never carry a schema authorization, an amendment, a hosted or billable action, or a history-touching git operation, and converts no `PASS` into an `Accepted`.

---

## 10. Carried open items

| Item | State | Where |
|---|---|---|
| ⛔ **`C-4` held — the audit-registry discrepancy** | `AWAITING_OPERATOR` | Blocks `P1-2`. Three reconciliations, each costing something: **replace** deletes the access event (the only trace a signed URL to a child's video was minted) · **all four** contradicts "16 → 18" · **keep `A-057`'s two** leaves `D-5`'s removal unaudited |
| ⛔ **`A-002` — parent evidence is Phase 2 work** | `AWAITING_OPERATOR` | Blocks `P1-5` |
| ⚠️ **The silent-save reproduction is still owed a walk** | `OPEN` | Carry into §5. Console empty = the button never enabled · `submit-ignored` = not `ready` · `dispatching` with no server-log entry = a third possibility neither candidate covered. Steps in `BUILD_NOTES.md`; repeat on a `trainer_approved` report → Management **Edit wording** |
| ✅ **The `A-038` / `GC-6` reconciliation** | **SCHEDULED** | `P1-1`, measured scope at §6.5 — **15 locations, 4 of them live source** |
| ⚠️ **`test:integration` 47/3/3, exit 1** | `OPEN` | `INT-A5`/`INT-Q27` are **suite staleness, product correct**; ⛔ `run-integration.mjs:517` calls `pass("INT-A5")` **unconditionally** after both `fail()`s. Fix before Part 2 so the suite can gate |
| ⚠️ **`RENDERED CAPTURE` `NOT-RUN` on every authenticated surface** | `OPEN` | Not closed by any phase unless one runs a capture |
| ⚠️ **The Phase 8/11 gap** | `OPEN` | Structural consistency is **neither a visual nor a functional acceptance** |
| ⛔ **`09` refuses its canonical route** (`C2C-007`) | `OPEN`, measured | `P2-21`, first |
| ⚠️ **`A-044` is knowingly unmet for `28`** | **RULED** (`C-11`) | Deliberate. Recorded so it is never read as an oversight |

---

## 11. Completion states

`NOT_STARTED` · `IN_PROGRESS` · `BLOCKED` · `AWAITING_OPERATOR` · `IMPLEMENTED_AWAITING_VERIFICATION` · `PASS` · `SUPERSEDED`

⚠️ **`PASS` is an evidence verdict; `Accepted` is the Operator's and only the Operator's.** A session never accepts its own work, and **code existing is not work being complete**.

**Every phase is `NOT_STARTED`. `P1-1` is the only Part 1 phase with no open blocker.**
