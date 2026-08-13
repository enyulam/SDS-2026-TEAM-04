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

> ⚠️ **THIS TABLE IS THE 2026-08-11 SNAPSHOT AT `8d52121`, AND IT IS NOT CURRENT.** Annotated 2026-08-13 at the
> `P2-3` boundary. It was **correct when measured** and is kept as the starting position the plan was built from — but
> the heading says *"measured at HEAD"*, and a fresh reader takes that as **now**. ▶ **That is the stale-restatement
> shape this project has been bitten by repeatedly**, so it is labelled rather than left to be discovered.
>
> **Measured 2026-08-13 at the `P2-3` boundary:** routes **18** · migrations · tables · functions **29 · 29 · 54** ·
> enums **12** · policies **30** · audit registry **21** · storage buckets **1** (`evidence`, `P1-2`). **Take current
> state from `STATUS.md` and from a live measurement, never from this table.**

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
| **`A-001`** — armed but unactivated | ✅ **ACTIVATED** | by `D-5`; ✅ **and `A-002` no longer gates it — RULED 2026-08-12**, see `R-5` |
| **`G-2`'s ground 2** | ⛔ **GROUND LAPSED, EXCLUSION UNCHANGED** | survives on **unratified** + `Q-27` |

⛔ **`GC-1` `GC-2` `GC-3` `GC-4` `GC-7` `GC-8` `GC-9` `GC-10` `GC-11` `GC-12` `GC-13` `GC-14` are untouched.** Nothing weakens `Q-27`, `A-014`, `A-036`, `A-052` or the parent boundary.

### 2.2 The eighteen rulings, as they bind execution

| # | Ruled | Binds |
|---|---|---|
| **`C-1`** | ✅ **Propagation corrected.** Authority Lock **§8.1** and **§15**, and `G-8`'s *"regardless of any later evidence authorization"* clause, now carry `D-5`. ▶ **The NEW GROUND is stated in all three: client consent confirmed with iSpeak Academy. §8.1's original ground has NOT lapsed** — the PDFs still require no parent evidence projection, and no reader may cite the supersession as evidence otherwise | ✅ **DONE** |
| **`C-2`** | ✅ **Consent is CENTRE-LEVEL**, recorded once, not per media item. ⛔ **No `consent_records` table.** `A-001` gate 2 amended; propagated to `A-003`/`A-004` | `P1-2`, `P1-5` |
| **`C-3`** | ⛔ **Scan gate REMOVED. No scanning infrastructure exists and none will be built.** ⛔ No invented vocabulary, no fake state. **The absence is stated in the instrument AND in the product's own UI text on every upload surface** | `P1-2` |
| **`C-4`** | ✅ **RE-RULED AND APPLIED — ~~ALL FOUR STRINGS, registry `16 → 20`~~ ✅ THREE STRINGS, registry `16 → 19`, after the SAME-DAY COLLAPSE `A-057.1a`; corrected 2026-08-12.** `evidence.uploaded` · `evidence.accessed` · `evidence.attached` · `evidence.removed`. `A-057` amended, with the *"must not be extended beyond these two"* clause struck and ⛔ **the prohibition RE-ARMED AT FOUR** | ⚠️ **`P1-2` still needs the reserved collapse question ruled — `R-4a`** |
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

| # | Blocker | Blocks | State |
|---|---|---|---|
| ~~**`R-4a`**~~ **CLEARED** | ✅ **RULED — `C-4` COLLAPSE RULING, 2026-08-11. NOT OPEN.** Corrected 2026-08-12 under a bounded Operator instruction. **`evidence.uploaded` and `evidence.attached` ARE ONE governed action** — no authorized workflow leaves an object unattached, so **the upload IS the attach**; `A-029`’s one-event-per-action rule is what forced the collapse. **Registry `16 → 19` — `evidence.attached` · `evidence.accessed` · `evidence.removed`**, measured live at HEAD. ⛔ **`P1-2`, `P1-3`, `P1-4` and `P1-5` are NOT blocked — all four are BUILT and Operator-walked across all three roles, locally and on the deployed dev environment.** ~~⚠️ **The `C-4` collapse question is RESERVED to the Operator.**~~ `evidence.uploaded` and `evidence.attached` **appear to be one governed action** — `D-5` has the Trainer upload at assessment time with the object already tagged to exactly one report and never movable, so **the upload IS the attach**. ⛔ **`A-029` requires one event per governed action**, a rule `A-057`'s own table lists as preserved. ~~**If collapsed, the registry is `16 → 19`.** ▶ **Nothing is baked in — the live registry is still 16 and `A-057` has never been implemented**~~ ⛔ **THAT SENTENCE IS NOW FALSE ON BOTH COUNTS — corrected 2026-08-12.** The **live registry is 19**, measured at HEAD, and **`A-057` IS implemented**. ⚠️ **This is the SECOND HALF of a fact recorded TWICE IN ONE ROW** — the front of the row was corrected while this tail was not. **A reader correcting such a row has already seen the other half and does not re-read it**, which makes the same-row case the hardest of all. | ~~⛔ **`P1-2`**~~ **NOTHING — CLEARED** | ~~`AWAITING_OPERATOR`~~ ✅ **RULED 2026-08-11** |
| **`R-5`** | ~~**`A-002`** — *"actual parent evidence access is first implemented and tested in **Phase 2**, never Phase 1"*~~ ✅ **RULED 2026-08-12: PARENT EVIDENCE ACCESS IS AUTHORIZED IN PART 1.** The new ground is `D-5` — **client-ratified**, its premise is that **all three roles watch the clip**, and consent is confirmed. ▶ *"A rule written before that decision existed should not outlive it."* ⛔ **Amended for parent EVIDENCE access ONLY**; every other phase boundary `A-002` governs is unchanged, and every `A-001`/`A-003`/`A-004` gate applies in full | ✅ **`P1-5` UNBLOCKED** | `RESOLVED` — ⚠️ the ruling unblocks the phase; **`P1-5` still needs its own explicit authorization** |
| **`R-7`** | **`C-7` per-phase table authorizations not yet given** | ~~⛔ **`P1-2` `P2-2` `P2-6`**~~ ⛔ **`P2-6` ONLY** — `P1-2` was given 2026-08-12 and `P2-2` was given 2026-08-12/13 (**decision 1 option (c)** for terms, then **reading B** for the create path), both **BUILT AND PROVEN**. ⚠️ **Corrected 2026-08-13 at the `P2-2` boundary under §15.8.1**, which requires an OPEN item to be re-verified against current state before it is carried into a handoff — *a stale blocker does not merely mislead, it stops work that was never blocked* | `AWAITING_OPERATOR` — **for `P2-6`**. ~~⛔ **A separate item is now owed for `P2-2`: the `admin.trainer_assigned` audit string**~~ ✅ **DISCHARGED 2026-08-13 at `P2-2b`** — the string was **already ratified at Step 7H** and simply never written; the Operator's *"CHECK BEFORE ASKING"* ruling settled it and `admin_assign_session_trainer` shipped with the registry **unmoved at 19**. ⚠️ **Found by the §15.8.1 sweep at the `P2-3` boundary: the ROW HEAD had been corrected while its TAIL still owed a discharged item** — the same-row shape already recorded once in §10, and the hardest to catch, because a reader who has just corrected the front of a row does not re-read the back of it. ⛔ **`P2-3`'s own two strings were a SEPARATE authorization, given with the count stated in advance, and are NOT this item** |
| ~~`R-12`~~ | ✅ **RULED** — both ratified marking states, distinguishably; no third state. §6.1 | `P2-23` | **CLEARED** |
| ~~`R-14`~~ | ✅ **RULED** — six omitted; six fields ratified. §6.3 | — | **CLEARED** |
| ~~`R-16`~~ | ✅ **RULED** — `100 MiB`, per-bucket, resumable required. §6.4 | — | **CLEARED** |

~~⚠️ **`P1-2` remains blocked on `R-4a` and `R-7`, and therefore so does the whole evidence chain (`P1-3`, `P1-4`, `P1-5`).**~~ ✅ **FALSE SINCE 2026-08-11 — corrected 2026-08-12.** `R-4a` was ruled by `C-4`; **`P1-2` … `P1-5` are all BUILT and Operator-walked.** ⚠️ **EIGHTH STALE-RESTATEMENT INSTANCE.** It survived a full day past its ruling and was carried into **two consecutive handoffs as a live blocker** — ▶ **a stale blocker is worse than an ordinary stale fact, because it does not merely mislead, it STOPS WORK THAT WAS NEVER BLOCKED.**

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

> ✅ **PARTIALLY AUTHORIZED 2026-08-11. `P1-1` IS SPLIT IN TWO, AND ONLY THE FIRST HALF IS AUTHORIZED.**
>
> The Operator's words were *"AUTHORIZE P1-1 ONLY — the stale `GC-6`/`A-038` sweep… Complete it, commit, and STOP."* ⚠️ **That gloss names the reconciliation, not the projection**, and the stated reason — *"the `management-dashboard.tsx` banner is the file someone has open **while implementing `D-1`**"* — puts the sweep **before** the `D-1` build rather than inside it.
>
> | | Scope | State |
> |---|---|---|
> | **`P1-1a`** | ⚠️ **The `A-038` / `GC-6` reconciliation only** — §6.5's fifteen locations. **Documentation and code comments. No projection, no RPC, no migration, no rendered change.** | ✅ **AUTHORIZED** |
> | **`P1-1b`** | The `D-1` projection extension + the new management-only read that returns the nine ratings | ✅ **AUTHORIZED, BUILT AND PROVEN 2026-08-11** |
> | **`P1-1c`** | The screen `19` frontend consumer for that read | ✅ **AUTHORIZED, BUILT AND PROVEN 2026-08-11** |
>
> ▶ **Read narrowly on purpose.** `P1-1b` adds a reviewed `SECURITY DEFINER` read and its grant — a governed change `CLAUDE.md` §12 requires be authorized explicitly. **Where an authorization's scope is ambiguous, the narrower reading is the safe one**, and the cost of asking is one message.

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

**Authorization** ✅ **`P1-1a` GIVEN and executed. `P1-1b` GIVEN 2026-08-11** — bounded §12 authorization to build the `D-1` management-only read.

#### `P1-1b` — THE OBJECT, SIGNATURE AND GATE, STATED BEFORE IT IS WRITTEN

**Object** · `public.report_get_management_ratings(p_class_session_id uuid, p_student_id uuid)`
**Returns** · `TABLE(dimension_code public.dimension_code, display_name text, sort_order smallint, rating public.competency_rating)` — **exactly nine rows**, ordered by `sort_order`.
**Properties** · `LANGUAGE plpgsql` · `STABLE` · `SECURITY DEFINER` · `SET search_path TO ''`
**Grant** · `REVOKE ALL FROM PUBLIC`, then **one** `GRANT EXECUTE TO authenticated` — the minimum matching grant, nothing wider.

**The gate MIRRORS `report_get_management_review` STEP FOR STEP:**

| # | Step | Effect |
|---|---|---|
| 1 | `app_current_account_id()` is `NULL` | ⛔ **RETURN** — this is the `anon` deny |
| 2 | no `reports` row for `(session, student)` | ⛔ **RETURN** |
| 3 | **exactly one ACTIVE `management` membership in the report's own centre** | ⛔ **RETURN** otherwise — **this is the whole management-only leg.** A trainer or parent holds no `management` membership, so the aggregate is `NULL` and the function returns zero rows. `HAVING count(*) = 1` fails closed on zero **and on more than one** |
| 4 | status dispatch | `trainer_approved` → `current_cycle_version_id` · `submitted` → `latest_submitted_version_id` · ⛔ **every other status returns nothing** |
| 5 | emit the nine `report_version_ratings` rows for that resolved version | joined to `assessment_dimensions` for `display_name`/`sort_order` |

⛔ **Step 4 is `C-9` made physical.** The two dispatch branches are exactly the two reads `A-038` permits Management — the final-review candidate and the canonical submitted version. **`incomplete`, `observation_saved`, `drafting`, `draft_ready` and `needs_edit` return nothing**, so no rating reaches Management before a trainer approval exists.

**What it deliberately does NOT return:** panel text · content hash · wording hash · checklist · approval internals · trainer notes · correction reason · `lock_version` · revision number. **Nine dimension/rating pairs and their labels, and nothing else.**

**⚠️ THE DESIGN TRADE, STATED BECAUSE IT CUTS BOTH WAYS.** `report_get_working` already carries `ratings jsonb`, so **widening `report_get_management_review` with a `ratings` column would have followed that precedent and kept ONE gate** — and `R-C2-6` warns that *"a second RPC is a second gate to keep in step"*, while hero Phase 1 warns that *"a looser gate would be a side channel disclosing reports the canonical read refuses"*. ▶ **A separate function was chosen anyway**, for two reasons: widening changes a **return type** (`DROP` + `CREATE`) on the RPC the **proven** screen `19` review path depends on, and **Part 1's whole premise is that these surfaces are the only end-to-end evidence**; and the Operator's authorization names an object with **its own minimum matching grant**. ⛔ **The side-channel risk is therefore mitigated, not ignored: a proof leg asserts BOTH READS GO DARK TOGETHER**, the pattern hero Phase 1 invented for exactly this (`P1-6`).

⛔ **`report_get_canonical` IS NOT TOUCHED.** It dispatches on role and serves parent, trainer and management from one body; adding ratings there would put them one branch from a Parent session and make **`Q-27` depend on a conditional**.

#### ✅ `P1-1b` BUILT AND PROVEN — 2026-08-11

**Migration `20260811140000_portal_d1_management_ratings.sql`**, applied locally via `supabase migration up` (⛔ never `db reset`). **Nine in-transaction assertions `D1-1` … `D1-9`** passed, covering: SECURITY DEFINER + `STABLE` · `search_path` pinned (asserted against the catalogue's `search_path=""` **with quotes**, the `H0A-4` lesson) · exactly one `authenticated` EXECUTE and **no `anon`/`PUBLIC`** · no prohibited field in the return type **including `overall`/`grade`/`band`** (`G-2`) · **both management gates are the same predicate** · `report_get_canonical` unaltered · **no rating or dimension field on any of the three parent-reachable reads** · audit registry unmoved at 16.

**`npm run prove:portal-1` — 9 SQL legs + 10 runner checks, exit 0.** Non-vacuity first; the three denials (**trainer · parent · anon**) each read zero; **`D1a-6` is the Operator-required control**, re-reading as management *after* the denials so the three zeros are proven to be discrimination rather than blindness; `D1a-7` proves `C-9` at the **data** layer (a `needs_edit` report returns nothing even to management); `D1a-9` proves **both management reads go dark together**; `D1a-8` proves **Q-27 did not move**.

**Census: 21 → 22 migrations, 42 → 43 functions.** Tables, enums and policies **unchanged**. Governed row counts **byte-unmoved**, with the mid-transaction reading proven to differ (`report_version_ratings` 54 → 63, exactly the nine minted).

⚠️ **THREE DEFECTS IN MY OWN INSTRUMENTS, ALL CAUGHT BY THE HARNESS RATHER THAN BY REVIEW:**

1. ⛔ **The first `D1a-7` mutated `public.reports` while impersonating `authenticated` and got `permission denied`.** ▶ **The refusal was correct and the fix was NOT a grant** — `authenticated` holds no table grant on `reports` (deny-by-default, `A-030`), and granting it to make a suite run is precisely what §12 forbids. The setup now runs as the **owner**, and only the READ is impersonated. Same shape as the Phase 4 `P4-4` correction.
2. ⛔ **The `counts moved mid-transaction` leg was passing for the wrong reason.** It compared the shared prelude's **nine-field** string against the runner's **six-field** string, so it passed because *the formats differ*, not because anything moved — **a false green in the leg whose whole job is to stop `before = after` being a tautology.** A same-shape `pg_temp.runner_counts()` replaced it.
3. ⚠️ **`prove:hero-2`'s `P2-6` census pin fired**, because the new function moved the count 42 → 43. ▶ **The pin was UPDATED, never removed, with the reason named** — a census ratchet deleted the first time it is inconvenient is not a ratchet. The `context` field-set assertion it guards is **unchanged at exactly 7**.

**`npm run prove:hero-all` — 17/17 by exit code** after the pin update. `tsc` **0** · `eslint` **0 errors** · `build` **0**.

~~⛔ **THE FRONTEND IS NOT BUILT.** The authorization was for *"the `D-1` management-only read"*. **Screen `19` renders no rating today** — the read exists and nothing consumes it. That is a **deliberate stopping point**, not an incomplete phase, and the structural assertions on `19` still hold.~~ ✅ **SUPERSEDED THE SAME DAY — the frontend was authorized and built. See `P1-1c` immediately below.** Preserved because it records why the read shipped without a consumer, which is otherwise indistinguishable from an unfinished phase.

⚠️ **A pre-existing staleness found and NOT fixed:** **Authority Lock §19.1's "ratified Final MVP census" reads `15 migrations · 36 functions`** while reality was **21 · 42** *before* this phase and is **22 · 43** after. **The divergence predates this work** and correcting a ratified instrument is outside `P1-1b`'s authorization. ✅ **The Operator ruled *record, do not fix*.** **Recorded, not silently repaired** — `STATUS.md` carries the live census.

---

#### ✅ `P1-1c` — THE SCREEN `19` FRONTEND — BUILT AND PROVEN, 2026-08-11

**Authorization** ✅ **GIVEN 2026-08-11**, bounded: *"build the consumer for the read that now exists"* — all nine dimensions, read-only, **management review detail only** (`C-9`), **no roll-up in any form** (`G-2`), every `REGISTERED-OMISSION` preserved, the addition **recorded as cited**, and proof that **nothing changed for trainer or parent**.

**The chain, end to end:** `getManagementRatingsCore` (projection) → `AdapterRatingSnapshotDto` / `ratings` on `AdapterManagementReviewDto` → `adapterGetManagementReview` → `ManagementReviewDto` → the physical-test fixture → `management-report-review.tsx`. **The same spine every other proven surface uses** — no new pathway was invented for it.

⚠️ **`Q-7` applied at the new boundary:** the projection reads through **`readRows`** and returns `unavailable` on a failed read, and `adapterGetManagementReview` **returns `unavailable` rather than falling through**. ▶ **A rejected query is not an empty result** — and on this screen an empty grid is precisely the shape a rejection would otherwise take.

⚠️ **THE NINE-DIMENSION GRID IS A GOVERNANCE-MANDATED ADDITION, AND IT IS CITED IN THREE PLACES.** ⛔ **The `19` frame does not draw it** — it draws four. **`D-1` requires it and `C-10` requires all nine.** A later visual pass that removed it *for matching the frame* would be reverting a ratified decision, so the citation sits in the **component**, the **DTO** and `BUILD_NOTES.md` — the three places such a pass would look. **The visual ladder does not outrank a functional ruling** (`A-045`, `A-056`).

**Read-only is structural, not styling:** the block carries **no `input`, `select`, `textarea`, `button`, `onChange` or `onClick`**, asserted against **comment-stripped** source. **`G-2` holds** — no Overall Grade, no average, no headline band. **All twelve `REGISTERED-OMISSION` markers on `19` intact.**

**`prove:portal-1` now carries NINE SURFACE LEGS** on top of its 9 SQL + 10 runner checks: the grid renders · its rendered value is the **rating itself** (so the absence scans describe a **real** grid, not an empty div) · `C-9` on queue `29` and dashboard `11` · `Q-27` on parent `30`/`32`/`33` · the **trainer** surface unchanged · and a control proving the rating-render pattern fires.

✅ **THE `M-3` RATCHET FIRED AND IT WAS RIGHT.** `prove:hero-15` pins the module's `readRows` sites **by exact label**; the fourth is **compliance, not a breach**. ⛔ **Raised to four with its reason, never loosened to a range**, and renamed off *"spine reads"* — three are the queue spine, the fourth is a report-detail read, and calling all four "spine" would tell the next reader that a rating read had joined the **queue** enumeration, which **`C-9` forbids**.

⛔ **`prove:portal-1` EXITED 0 TWICE AGAINST A SUITE MY EDIT HAD NEVER REACHED** — a heredoc lost its escaping, the instrument stayed silent, the result stayed green. ▶ **A green run proves nothing about a file you did not confirm changed.**

⚠️ **Five `tsc` errors caught before any run, one of which mattered:** `AdapterRatingSnapshotDto` had typed dimension and rating as `string`. **A closed vocabulary widened to `string` at a DTO boundary is how an unmapped rating reaches a surface**; both are unions again.

⛔ **`C-7` IS UNTOUCHED BY THIS.** The Operator stated it expressly: **`P1-2`'s table family returns as its own question** — what tables, what columns, what policies, what grants, and what each is for. **This authorization is not that one.**

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

#### `C-7` · `P1-2`'s TABLE FAMILY — PROPOSED FOR RULING, 2026-08-11

⛔ **THIS SECTION CREATES NOTHING.** No table, column, type, bucket, policy, grant, RPC, audit string, migration or route exists from it. It is the `C-7` per-phase question put to the Operator **before any code**, in the shape `P1-1b`'s design was stated before its migration was written. **Every measurement below was taken at HEAD, not read off a document.**

##### 1 · One table, and per-child scope is a CONSEQUENCE of its key rather than a check

**`public.report_evidence`**

| Column | Type | Null | Default | What it is for |
|---|---|---|---|---|
| `id` | `uuid` | NOT NULL | `gen_random_uuid()` | PK. ⚠️ **Minted by the server BEFORE upload** so the object key is known in advance — see §5 |
| `report_id` | `uuid` | NOT NULL | — | **The anchor.** `D-5`: tagged to exactly one session report |
| `centre_id` | `uuid` | NOT NULL | — | Carried for the composite FK and for `audit_append_event`'s required centre scope |
| `storage_object_path` | `text` | NOT NULL | — | The exact object key. **UNIQUE** — one row can never point at another row's object |
| `media_type` | `text` | NOT NULL | — | `CHECK IN ('video/mp4','video/quicktime')` — the frame's `MP4, MOV` |
| `byte_size` | `bigint` | NOT NULL | — | `CHECK (> 0 AND <= 104857600)` — **`C-16`'s 100 MiB, in the database** |
| `uploaded_by_account_id` | `uuid` | NOT NULL | — | Durable actor (`A-029`), `ON DELETE RESTRICT` |
| `uploaded_by_membership_id` | `uuid` | NOT NULL | — | The membership the upload was made under — role at the time, not role today |
| `created_at` | `timestamptz` | NOT NULL | `now()` | — |

**Constraints:** `FOREIGN KEY (report_id, centre_id) REFERENCES public.reports (id, centre_id) ON DELETE RESTRICT` — the existing `reports_id_centre_key` makes this composite form available, and it is the project's established way of making centre drift **unrepresentable** rather than merely checked. Plus `UNIQUE (report_id)` — **at most one clip per report** (§8, decision 2).

⚠️ **THIS IS THE ANSWER TO *"how is per-child scope enforced structurally"*, AND IT IS THE REASON FOR THE SHAPE.** `reports` already carries `reports_session_student_key UNIQUE (class_session_id, student_id)` — **measured at `20260803034500_step_7e_governed_core.sql`**. ▶ **A row FK'd to `reports.id` is therefore already exactly one child in exactly one session; there is nothing left to enforce.**

⛔ **THIS IS WHY THERE IS NO `student_id` AND NO `class_session_id` COLUMN, and the omission is the control.** Denormalizing either would create a second, independently-writable answer to *"whose clip is this?"* — and **two answers that can disagree is precisely how class footage gets attached as a child's clip**: a row naming a session but no student, or naming a student the report does not, is *representable* the moment those columns exist. **With only `report_id` there is no such row to write.** A clip of a whole class can still be *filmed* and uploaded — `A-001` already states the application does not verify single-child framing, and `D-5` does not change that — but it can only ever be **attached to exactly one child's report**, and the surface, the audit event and the parent projection all name that one child.

##### 2 · Policies and grants — ⛔ ZERO in `public`, and that is the established pattern, not an omission

**Measured at HEAD:** `public.reports` and `public.report_versions` hold **no client `GRANT` and no RLS policy of any kind**. Every report read is a reviewed `SECURITY DEFINER` RPC (`A-030`). The 13 tables that *do* carry `GRANT SELECT TO authenticated` are pinned **by exact name** in Step 7H assertion **B9**.

▶ **`report_evidence` belongs in the report class, not the roster class.** So: **RLS enabled · zero policies · zero client grants**, reached only through the RPCs in §3. **This is strictly narrower than "a policy plus its minimum matching grant"** — the same choice Phase 0A made and the Operator accepted.

⚠️ **There IS one policy in this family, and it is on `storage.objects`, not on `public`.** It exists only because resumable upload requires it — §5. **Do not read the two as the same layer.**

##### 3 · Four RPCs, and where the three audit strings fire

| RPC | Volatility | EXECUTE | Gate | Audit |
|---|---|---|---|---|
| `evidence_attach_confirm(report_id, evidence_id, object_path, media_type, byte_size)` | `VOLATILE` | `authenticated` | **Authoring trainer only** — `app_trainer_reaches_session` on the report's session · report **not** `submitted` · re-validates `byte_size` and `media_type` **server-side** | ▶ **`evidence.attached`**, in the **same transaction** as the INSERT |
| `evidence_list_for_report(class_session_id, student_id)` | `STABLE` | `authenticated` | **Role-dispatching, mirroring RPC-13 step for step** — trainer via session assignment · management via a single active management membership · parent via `app_parent_reaches_student` **and** `latest_submitted_version_id IS NOT NULL` | ⛔ **none** — a list read is not an access |
| `evidence_record_access(evidence_id)` | `VOLATILE` | `authenticated` | **The same predicate as the list read**, re-evaluated | ▶ **`evidence.accessed`**, emitted **only on success** |
| `evidence_remove(evidence_id)` | `VOLATILE` | `authenticated` | **Authoring trainer only**, report **not** `submitted` | ▶ **`evidence.removed`**, same transaction as the DELETE |

⛔ **`evidence.accessed` fires when the server MINTS the signed URL, not when the video plays.** It is the only trace that a URL to a child's video was minted, for whom and when — the Operator's stated reason for keeping it through the `C-4` collapse. **A denied attempt emits nothing** (`A-057`), so the deny path returns the same zero-row shape every other refusal in this codebase returns.

⚠️ **THE LIST READ RETURNS NO STORAGE PATH.** `A-001` gate 7 prohibits raw storage-path access, and the path is **derivable** from `{report_id}/{id}.{ext}`, so the server computes it and the client never receives it. ▶ **This is what lets every RPC stay `authenticated`-executable instead of dragging in the owner-only privileged transport** that `report_store_draft` needs.

⚠️ **EXTENDING THE REGISTRY TOUCHES TWO ARRAYS, NOT ONE — measured.** `20260804213000_step_7h_audit_chain.sql` declares the 16-string registry **twice**: at **line 439** inside `audit_append_event` and again at **line 744** inside `audit_verify_chain`. ▶ **Updating only the first would let events be written that chain verification then rejects** — a corruption that surfaces only when someone verifies. Both go to 19, in one migration, with an assertion that they are identical.

##### 4 · The bucket, and how `C-16`'s ceiling is stopped from widening the deferred buckets

**Bucket `evidence` — private, created by migration** (`INSERT INTO storage.buckets`), carrying its own `file_size_limit = 104857600` and `allowed_mime_types = {video/mp4,video/quicktime}`. **No public bucket, ever.**

⚠️ ~~**`supabase/config.toml` currently reads `file_size_limit = "50MiB"` GLOBAL, and declares NO buckets** (the `[storage.buckets.images]` block is commented out) — **measured**.~~ ✅ **CORRECTED 2026-08-12 under a bounded Operator instruction. THIS "MEASURED" CLAIM IS NOW FALSE and was the reason to correct it: `config.toml` reads `file_size_limit = "100MiB"` GLOBAL — the §4 proposal below was IMPLEMENTED. The only `50MiB` remaining in that file is inside the COMMENTED-OUT `[storage.buckets.images]` example block, which declares nothing.** ⚠️ **A stale measurement is worse than a stale opinion — "measured" is exactly the word a later reader trusts without re-checking, which is why this one is struck rather than quietly updated.** The `evidence` bucket IS now declared, by migration rather than by `config.toml`. Two facts follow that decided the answer:

1. ⛔ **`config.toml` is LOCAL-DEV ONLY.** It does not travel to a hosted project. ▶ **A ceiling that exists only there is not a boundary** — the durable one is the `storage.buckets` **row**, which a migration creates and which applies wherever the migration is applied.
2. **The global limit is a CAP, not a grant.** Raising it to `100MiB` widens nothing by itself — but it **removes the accidental 50 MiB backstop** currently sitting under every future bucket.

▶ **So the answer to *"how is the global limit prevented from widening the deferred photo and materials buckets"* is: those buckets do not exist, and the rule is that neither may ever be created without its OWN `file_size_limit` on its own bucket row.** A bucket created without one inherits the global cap — exactly the silent widening `C-16` names. **`prove:portal-2` asserts it as an invariant over `storage.buckets`, not as a promise: every bucket row has a non-null `file_size_limit`, and no bucket is public.** ⚠️ **An invariant over the whole table is what makes it bind on buckets that do not exist yet** — a check naming only `evidence` would be silent on the day the photo bucket is added, which is the day it matters.

**Server-side re-validation** happens in `evidence_attach_confirm`: it re-reads the object's recorded size and rejects if it exceeds the ceiling. ⛔ **Three independent ceilings — bucket row, database `CHECK`, RPC — because the client-side one is not a boundary at all.**

##### 5 · Resumable upload — required, and it forces the one genuine architectural question

⚠️ **`C-16` makes resumable upload an acceptance condition, and that condition is what puts a policy on `storage.objects`.** Supabase's resumable (TUS) endpoint authenticates the **client's own JWT** and is governed by storage RLS. A server-minted single-shot signed upload URL is **not** resumable, and proxying 100 MiB through a server action is not viable on a serverless host.

**Proposed shape:**

1. A server action verifies the trainer's authority, **mints the `evidence_id`**, and returns the deterministic object key **`{report_id}/{evidence_id}.{ext}`**. ⛔ **No row is written yet.**
2. The client TUS-uploads to that exact key.
3. `evidence_attach_confirm` verifies the object, re-validates size and type, INSERTs the row, and emits `evidence.attached`.

**The storage policy** is `INSERT` on `storage.objects` for `authenticated`, `bucket_id = 'evidence'`, gated on a helper checking the caller is the authoring trainer for **`(storage.foldername(name))[1]::uuid`** — the report id in the first path segment. ▶ **A live DB check, per `ADR-4`; the client cannot forge a path into a report it does not own.** ⛔ **No `SELECT`, `UPDATE` or `DELETE` policy on `storage.objects` for anyone** — reads are server-minted signed URLs only, and removal runs as the owner.

⚠️ **THE HONEST COST, STATED RATHER THAN GLOSSED.** This is the **first client-direct write in the product**, and `ADR-3` says writes are server-only. ▶ **It is a bounded exception, not a precedent:** what the client can write is an **opaque object in a private bucket at a path it must prove authority over**, and **that object is governed by nothing until a server RPC attaches it.** An unconfirmed upload is an **orphan** — invisible to every read path, referenced by no row. **Orphans are possible and there is no sweeper; that is a stated limitation, not a hidden one.**

##### 6 · How the `C-3` unscanned limitation surfaces in the product's own text

⛔ **Part of `P1-2`'s acceptance, not a nicety** — *"an honest absence beats a satisfied-looking gate"*, and **a gate removed in an instrument but not surfaced in the product is neither.**

- **On the upload surface**, permanently visible and not behind a disclosure: **uploaded media is NOT scanned for malware or harmful content, and a production deployment would require scanning.**
- **On the parent-facing surface** when `P1-5` is reached, the **no-download** limitation is stated the way `D-5` requires: the product provides no download control and ⛔ **does not claim technical impossibility.**
- ⛔ **`prove:portal-2` asserts the upload-surface text is PRESENT** — comment-stripped, so a paragraph *explaining* the obligation cannot satisfy it.
- ⛔ **`A-003`'s `unscanned` leg is `NOT APPLICABLE (C-3)` — never `PASS`.** A must-fail leg with nothing to test either fails forever or gets quietly marked green, which is the `S-8` defect landing on a refusal proof.

##### 7 · What `A-002` would block — stated separately, and NOT part of this question

⚠️ **`A-002` is untouched by this family and the Operator rules it at `P1-5`, not now.** Recorded here only so the boundary is unmistakable:

- **`A-002` blocks the PARENT half and nothing else** — the parent branch of `evidence_list_for_report`, the parent signed-URL path, the parent surface on screen `33`, and `A-004`'s both-direction Parent UAT.
- ▶ **It blocks NONE of §1–§6.** The table, bucket, storage policy, the RPCs, two of the three audit strings and the trainer/management surfaces are `P1-2`/`P1-3`/`P1-4` work and stand or fall on `C-7` alone.
- ⚠️ **The parent branch may be BUILT INTO the RPC gate as an unreachable arm, or LEFT OUT until `P1-5`.** ⛔ **Left out is the recommendation** — an unexercised authorization arm is exactly the `S-8` shape: it looks proven because the surrounding legs pass, while the one path that matters has never returned a row.

##### 8 · ⚠️ FOUR DECISIONS INSIDE THE FAMILY THAT ARE THE OPERATOR'S, NOT MINE

1. ⛔ **The `storage.objects` INSERT policy** — the first client-direct write in the product (§5). **Required by `C-16`'s resumable condition**; there is no route satisfying both it and a strict reading of `ADR-3`. ▶ **This is the ruling that actually matters in this family.**
2. **`UNIQUE (report_id)` — one clip per report.** `D-5` says *"tagged to exactly one session report"*, which constrains the clip's target, **not the count**. ▶ **One is recommended**: management *"views it"*, singular, and no frame answers which of several a parent would see. **Removal plus re-upload covers the correction case.**
3. **Removal is Trainer-only and pre-`submitted`.** ⚠️ **The actor is NOT my choice — `CLAUDE.md` §6 already forbids a management write reaching evidence**, so management removal is ruled out independently of `D-5`. **The pre-`submitted` window IS a choice**: after submission a parent may already have seen the clip. **Recommended, and it needs your word.**
4. ~~**`config.toml`'s global `50MiB` → `100MiB`.**~~ ✅ **DONE — `config.toml` reads `100MiB` (verified 2026-08-12).** Local-dev only, but without it no local proof of the ceiling can run. ▶ **The durable ceiling is the bucket row**, and the invariant in §4 is what stops the raise from mattering elsewhere.

##### 9 · What this family does NOT contain

⛔ **No `consent_records` table** (`C-2`) · **no scan state, status enum or vocabulary of any kind** (`C-3`) · **no retention or erasure object** (Phase 4) · **no `centre_membership_role` extension** (`A-014`) · **no photo or lesson-materials bucket** (`C-14`/`C-15`, `D-4` — each needs its own `C-7` ruling) · **no download affordance for any role** (`D-5`) · **no class-footage framing and no 500 MB** (`G-8`; `REGISTERED-OMISSION`, never ends) · **no new enum** · **no change to `Q-27`, `G-2`, `A-038` or the content hash.**

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

~~⛔ **BLOCKED on `R-5`.** `C-1` resolved Authority Lock §8.1 and §15 and `G-8`; **it did not rule on `A-002`**, which assigns parent evidence access to **Phase 2, "never Phase 1"**, and `CLAUDE.md` §10 Phase 2 has not been entered.~~ ✅ **UNBLOCKED 2026-08-12 — `A-002` IS AMENDED** (`docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_001.md`, A-002). ⚠️ **Unblocked is not authorized**: `P1-5` still requires its own explicit Operator authorization before any code.

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

**One design consequence — ✅ RULED 2026-08-11 (`C-12`).** With colouring gone, the calendar marks days using **BOTH ratified states, distinguishably**: **a session occurred** and **a report is available to read**. *"They are different facts and a parent needs both."* ⛔ **Neither is rating-derived, and no third state may be invented.**

**⚠️ The states NEST — they are not two orthogonal flags, and building them as such would produce an unreachable combination.** A report can only exist for a session that happened, so the reachable cells are exactly three: **no session** · **session, no report yet** · **session + report available**.

**✅ SC 1.4.1 answer: yes, both are distinguishable without colour carrying meaning alone.** The Operator asked to be told if they were not; they are not.

| Cell state | Non-colour encoding |
|---|---|
| No session | date numeral only |
| Session, no report | a **filled dot** beneath the numeral — **shape**, present or absent |
| Session + report available | the dot **plus a distinct document glyph**, and the cell becomes an **actionable control** with a visible focus ring — **shape + glyph + interactivity**, three non-colour differences |

**Binding accessibility conditions:** every cell carries an **accessible name stating the facts in words** (*"14 March — session held; report available"*), so a screen-reader user gets the same information without any visual channel · glyphs meet **SC 1.4.11** non-text contrast at 3:1 · any text meets **SC 1.4.3** · colour may **reinforce** the distinction but must never be the sole carrier. ▶ **The legend that made this screen `GC-2`'s worst limb is gone; a legend explaining *these two states* is permitted and is not rating vocabulary** — it glosses scheduling and publication facts, never a competency taxonomy (**A-052**).

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

▶ **Essentially every field on these forms beyond a name is unbacked.** Each field therefore needs **both** a ratification and a column.

### ✅ RULED 2026-08-11 (`C-14`) — six fields ratified, six omitted

**The ratified field set, and nothing else:**

| Field | Backing today |
|---|---|
| **learner name** | ✅ `students.full_name` |
| **class** | ✅ `class_modules.title` + `class_grades` |
| **trainer** | ✅ `class_session_assignments` → `accounts.display_name` |
| **enrolment date** | ~~⚠️ **needs a column** — `enrolments` exists; no dated enrolment field measured~~ ✅ **CORRECTED 2026-08-12 BY MEASUREMENT AT `P2-1`: THE COLUMN ALREADY EXISTS.** `public.enrolments.enrolled_at` is `timestamptz NOT NULL`, measured against `information_schema.columns`. ⚠️ **The original was a stale MEASUREMENT, not a stale opinion** — *"no dated enrolment field measured"* is the wording a later reader trusts without re-checking, and `P2-12`/`P2-13` would have requested a schema authorization for a column that is already there. ⛔ **Ratifying the FIELD is still separate from having the COLUMN**, and guardian name/contact genuinely do need theirs |
| **guardian name** | ⛔ **NEEDS A COLUMN** |
| **guardian contact** | ⛔ **NEEDS A COLUMN** |

⚠️ **The Operator's own note, recorded because it is the load-bearing part:** *"`trainer_profiles` and `parent_profiles` carry no name, email or phone — so guardian name and contact need columns, and that is a schema authorization I will give at the phase, not now."* ▶ **Ratifying a field is not authorizing its column.** `P2-12`/`P2-13` cannot start on these two without that separate authorization.

⛔ **OMITTED, all six:** **gender · home address · employee ID · class code · capacity · relationship.**

⛔ **Everything else drawn on `20` `21` `22` `24` `26` `27` needs its own ruling at its phase** — including first/last-name splitting, student ID, date of birth, day/time recurrence patterns and programme. **Do not schema a field from a frame (`A-022`).**

⚠️ **`C-13` and `C-14` are consistent, and the difference is worth stating.** `C-13` permits a parent to *see* their own child's **date of birth**; `C-14` does not ratify DOB as a **captured field**. ▶ **Permission to display and authorization to store are different acts** — DOB stays unratified for capture until ruled at its phase.

**The full listing that produced the ruling is retained below as the record of what was measured and asked.**

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

### 6.4 `C-16` — ✅ RULED: `100 MiB` per object

**✅ RULED 2026-08-11: `100 MiB`** — *"Take the cheaper option on every axis."* The `200 MiB` proposal and its costs are retained below as the record.

**Three binding conditions came with the figure, and none is optional:**

1. ⛔ **Enforce PER BUCKET, and re-validate server-side.** `config.toml`'s `file_size_limit` is **global**; relying on it alone would silently widen the deferred **photo** and **lesson-materials** buckets. The evidence bucket carries its own ceiling, and the server re-checks it — **a client-side or config-level limit is not a boundary.**
2. ⚠️ **Resumable upload is REQUIRED, not optional** — *"a single-shot POST on classroom wifi is a failure mode we would be designing in."* This is a `P1-2` acceptance condition.
3. ⚠️ **The trade is accepted knowingly:** `100 MiB` covers roughly **90 seconds** of 1080p phone video. Longer clips are **rejected**, so the refusal message must **name the limit and be actionable** — a trainer who cannot tell why an upload failed will retry it, which is the worst outcome on a classroom network.

⚠️ **`C-3` compounds this and the two must be read together:** the scan gate is gone, so **every accepted byte is unscanned**. The lower ceiling is now also a **containment** measure, not only a cost one.

**The superseded proposal, retained as the record — `200 MiB`:**

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

**Fourth instance in this project of the same defect: a rule whose stated reason has gone stale invites a later phase to "fix" it.** Each location is corrected to state **which ground now carries it** — `G-2`, `C-9`, or both — never left asserting a lapsed one.

### ✅ `P1-1a` EXECUTED 2026-08-11 — and the register was under-measured by five

**16 locations annotated** (the 15 recorded above plus **screen `19`'s own pack**, which had to move in the opposite direction — `GC-5`'s Performance Summary limb is now **permitted**, and its notes still said Management never reads ratings on the one screen where `D-1` lifts that).

⛔ **A completeness scan across the whole tracked tree then found FOUR MORE**, none of them in the recorded register:

| Site | Disposition |
|---|---|
| `UI_REFERENCE_FINAL_MVP/AUTONOMOUS_48H_RISK_REGISTER.md:130` | ⛔ **LEFT ALONE — historical**, closed Run B sprint artefact |
| `docs/plan/UI_RECONCILIATION_BATCH_3_ADJUDICATION.md:438` | ⛔ **LEFT ALONE — historical** adjudication record |
| `docs/plan/UI_RECONCILIATION_BUILD_PLAN.md:296` | ⛔ **LEFT ALONE** — banner reads *"✅ CLOSED — COMPLETE. Operator decision, 2026-08-10."* |
| `docs/workstreams/48H_FRONTEND_PROGRESS.md:437` | ⛔ **LEFT ALONE** — banner reads *"⚠️ HISTORICAL — CLOSED SPRINT."* |

▶ **Each carries a `CLOSED`/`HISTORICAL` banner and accurately records what was true when written.** `CLAUDE.md` §12 forbids rewriting historical evidence that accurately records superseded state, so they are **excluded by rule, not by oversight** — the same treatment `BUILD_NOTES.md` gets under §15.4. **The true count of `A-038` management-rating claims in the tracked tree is 20: 16 corrected, 4 deliberately preserved.**

### ⚠️ THE COMPLETENESS SCAN'S FIRST DETECTOR WAS BROKEN, AND ITS CONTROL IS THE ONLY REASON THIS IS KNOWN

The scan alternated **`management|MANAGEMENT`** — and **missed `Management`, title case, which is what the files actually use.** It reported **"0 uncorrected claims outside the register"** while matching almost nothing.

▶ **It was caught by a deliberate non-vacuity control** — a probe string the detector was required to MATCH — which reported `BROKEN — every result above is meaningless`. With the case-insensitive fix the same scan found the four sites above.

⚠️ **This is the project's recurring defect in its fourth direction.** The three recorded instances were a false `MISSING` (the CSS minifier's stored representation), a false `FAIL` (a regex that captured a parameter list), and a false `VIOLATION` (a bare keyword matching prose). ▶ **This one is a false `CLEAN` — the most dangerous of the four, because a sweep that reports nothing left to do is exactly the result nobody re-checks.**

**Binding on every later phase: a sweep must carry a control proving its detector can FIRE, and a completeness claim must be scanned across the tree, never only across the list the sweep was given.** A register checked against itself cannot tell you what it omitted.

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
| **P2-1** | `12` Management Classes | Class-list projection, level tabs | — | — · ✅ **BUILT AND PROVEN 2026-08-12** at `/management/classes`. ⛔ **No migration** — policy AND grant already present on all eight relations, both layers measured at HEAD (`P21-3`). Three `REGISTERED-OMISSION`s, each with a controlled detector |
| **P2-2** | `26` Add Class | ⚠️ **`D-3` terms substrate** + class creation | P2-1 | `C-6` `C-7` `C-14` · ✅ **BUILT AND PROVEN 2026-08-13** at `/management/classes/add-class`, in **two** migrations — the terms substrate (read-only, seeded, zero functions) and **two** create RPCs on the **already-ratified** `admin.module_created` / `admin.session_created`. ⛔ **Registry UNMOVED at 19**, zero new table/enum/policy/write grant. ⛔ **Trainer assignment STOPPED** — needs a third string; enforced by migration assertion `C-8` |
| **P2-3** | `27` Edit Class | Class edit write path | P2-2 | `C-14` · ✅ **BUILT AND PROVEN 2026-08-13** at `/management/classes/[classModuleId]/edit`. Two update RPCs; **audit registry 19 → 21** on `admin.module_updated` and `admin.session_updated`, the exact two authorized with the count stated in advance; zero new table/enum/policy/write grant. ⛔ **THREE REFUSALS** — no day strip, no unassign, no class code/capacity/programme — each with its reason and its lift condition recorded in the `P2-3` section below. ⚠️ **No ratified frame draws an inbound control to `27`**; none was invented |
| **P2-4** | `13` Class Overview | Class summary, lesson timeline, **+ Class Health Summary** | P2-1 | `C-17` (`GC-9`) · ✅ **BUILT AND PROVEN 2026-08-13** at `/management/classes/[classModuleId]`. Two `SECURITY DEFINER` READS; **zero new table/column/enum/policy/write grant; registry UNMOVED at 21**. ⛔ **The frame's B.E.S.T. Ratings and rubric focus-area list are NOT built** — `C-9`/`G-2` override the frame, enforced three deep. ✅ `C-17`'s Class Health Summary built verbatim, extracted to one shared file. ⛔ No Edit affordance: **DESIGN GAP, not a build gap** |
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

---

## `P2-2` · screen `26` Management Add Class — the `D-3` terms substrate and the class-creation write path

> ⛔ **STOPPED HERE. THIS SECTION CREATES NOTHING.** No table, column, type, policy, grant, RPC, audit string, migration or route exists from it. It is the **`C-7` per-phase question put to the Operator before any code**, in the shape `P1-1b`'s design and `P1-2`'s table family were both stated before their migrations were written. **Every measurement below was taken at HEAD on 2026-08-12, not read off a document.**

**Frame** · `reference/Management - Add Class/` + `26-management-add-class/screen.md`. Draws: **Class Details** (Class name · **Class code** · **Program** · Level · **Capacity** · Room) · **Schedule** (day selectors Sun–Sat · Start time · End time · **Term**) · **Assigned Trainer** with a search, and a **Trainer Assistant (TA)** slot in its `.md` · **Cancel** / **Save Class**.

**Built today, measured at HEAD** · `/management/classes` exists (`P2-1`) and its `Add Class` control is **inert by design**, awaiting this phase. ⛔ **There is NO class-creation path of any kind:** `class_modules`, `class_sessions`, `class_grades`, `class_session_assignments` and `enrolments` carry **ZERO non-`SELECT` policies and ZERO non-`SELECT` client grants**, and no RPC creates any of them. **No `terms` object of any kind exists.**

| Delta | Class |
|---|---|
| A `terms` entity, and the session's link to it (`D-3`, `C-6`) | **NEEDS NEW SCHEMA** (`C-7`) |
| Governed create paths for module · sessions · trainer assignment | **NEEDS NEW SERVER ACTION** (reviewed `SECURITY DEFINER` RPCs) |
| The `26` form and its states | `PRESENTATION-ONLY` once the above lands |
| **Class code · Capacity · Program** | ⛔ **GOVERNANCE-BLOCKED** — `C-14` omits code and capacity; **"programme" has no entity and must not become a hidden `classes` entity** (`A-016`) |
| **Trainer Assistant (TA)** | ⛔ **PROHIBITED** — `A-014`, `G-7`. `REGISTERED-OMISSION`, **never ends** |

### ✅ ONE MEASUREMENT THAT REMOVES A GATE I EXPECTED TO ARM

**The Step 7H audit registry already carries `admin.module_created`, `admin.session_created` and `admin.trainer_assigned`** — measured live: `audit_action_registry()` returns **19** strings and those three are among them. ▶ **`P2-2` therefore needs NO registry extension**, and `A-029`'s one-event-per-action rule is satisfied by strings that were ratified at Step 7H and have simply never had a writer. ⛔ **The `A-057` stop-and-ask, re-armed at three evidence strings, is NOT engaged by this phase.**

### 1 · ONE NEW TABLE — `public.terms`

⛔ **`C-6` decides its shape before any preference does: TERMS GROUP SESSIONS. There is NO lessons entity, and lesson identity stays the two columns already on `class_sessions`.**

| Column | Type | Null | Default | What it is for |
|---|---|---|---|---|
| `id` | `uuid` | NOT NULL | `gen_random_uuid()` | PK |
| `centre_id` | `uuid` | NOT NULL | — | FK → `centres(id)` `ON DELETE RESTRICT`. Terms are centre-owned, like `class_grades` and unlike the global `assessment_dimensions` |
| `label` | `text` | NOT NULL | — | The one thing every frame that mentions a term actually renders — `"Term 1, 2035"`. ⚠️ **ONE field, not a number plus a year**: `08`, `19`, `33` and `29` all draw a single string, and splitting it would invent a structure no frame shows and no rule requires |
| `starts_on` | `date` | NOT NULL | — | The scheduling substance. `D-3` builds terms **because the calendar features need the structure**, and a term with no boundaries scopes nothing |
| `ends_on` | `date` | NOT NULL | — | `CHECK (ends_on >= starts_on)` |
| `is_active` | `boolean` | NOT NULL | `true` | Matches `class_modules` / `enrolments`; a closed term is deactivated, never deleted |
| `created_at` / `updated_at` | `timestamptz` | NOT NULL | `now()` | As every other governed table |

**Constraints:** `UNIQUE (centre_id, label)` — a centre cannot hold two terms with the same name, which is what makes the label safe to render as an identity. ⛔ **No overlap constraint between terms.** Real academies run overlapping intensives, and an `EXCLUDE` here would refuse a legitimate arrangement to enforce a rule nobody ratified.

**And ONE new column:** `class_sessions.term_id uuid NULL REFERENCES public.terms(id) ON DELETE RESTRICT`.

⚠️ **NULLABLE, DELIBERATELY, AND THIS IS THE LOAD-BEARING CHOICE.** Every one of the **4 existing `class_sessions` rows** predates terms. A `NOT NULL` column would either refuse the migration or force a backfill that **invents a term for sessions nobody assigned one to** — and hero 0B already ruled that **`NULL` means NOT RECORDED and the element is omitted**, never defaulted. ⛔ **No backfill, and no invented "Term 1".**

⚠️ **The FK is to `terms`, and there is no composite `(term_id, centre_id)` form** — unlike `report_evidence`'s deliberate composite. The reason is that a session already carries `centre_id` and `class_module_id`, and the module already pins the centre; a third path to the same centre is a third answer that can disagree. **Centre agreement is instead enforced by the RPC, which resolves the term inside the caller's own centre and can therefore never attach a foreign one.**

### 2 · POLICIES AND GRANTS — ⛔ `SELECT` ONLY, AND NO WRITE POLICY ANYWHERE

**Measured at HEAD: not one of the five class tables carries a non-`SELECT` policy or a non-`SELECT` client grant.** Every governed mutation in this product is a reviewed `SECURITY DEFINER` RPC (`ADR-3`, `A-030`), and **`P2-2` does not change that.**

**Proposed, and it is the minimum:**

| Object | Policy | Grant |
|---|---|---|
| `public.terms` | **RLS enabled** · **one** `SELECT` policy — an active member of the centre, mirroring `class_grades_select_active_member` | **one** `GRANT SELECT TO authenticated` |
| `class_sessions.term_id` | — (the table's existing three `SELECT` policies already cover the row) | — (the table's existing grant already covers the column) |

⛔ **ZERO `INSERT`, `UPDATE` or `DELETE` policy, and zero write grant, on ANY table in this family.** The form writes **only** through the RPCs in §3. **A policy and its minimum matching grant ship together** (`A-030`, Step 7G) — and here that is exactly one of each, on exactly one table.

⚠️ **Why `terms` gets a `SELECT` policy at all, when `report_evidence` deliberately got none.** A term is **scheduling structure a trainer and a parent legitimately see on a session**, not report substance; it belongs in the roster class, not the reports class. ⛔ **The `SELECT` policy is `active member of the centre` — NOT management-only** — because `02`, `03`, `29`, `18` and `25` all render a term to a non-management reader, and serving that through a management-only policy would need a second instrument later.

### 3 · THREE RPCs, AND THE AUDIT STRINGS THEY FIRE ALREADY EXIST

| RPC | Volatility | EXECUTE | Gate | Audit |
|---|---|---|---|---|
| `admin_create_term(p_label, p_starts_on, p_ends_on)` | `VOLATILE` | `authenticated` | **Exactly one ACTIVE `management` membership**, resolved live in the caller's own centre — the `HAVING count(*) = 1` form that fails closed on zero **and** on more than one | ⛔ **NONE — and this is the one place I am proposing something the registry does not cover.** See the question below |
| `admin_create_class_module(p_class_grade_id, p_title)` | `VOLATILE` | `authenticated` | The same management gate · the grade must be **in the caller's own centre** | ▶ **`admin.module_created`** — already ratified, same transaction as the INSERT |
| `admin_create_class_session(p_class_module_id, p_session_date, p_starts_at, p_ends_at, p_room, p_term_id, p_trainer_membership_id)` | `VOLATILE` | `authenticated` | The same management gate · module, term and trainer membership **all re-resolved inside the caller's centre** | ▶ **`admin.session_created`**, and **`admin.trainer_assigned`** when a trainer is supplied — **both already ratified**, both in the same transaction |

⛔ **ONE CALL CREATES ONE DATED SESSION.** The frame's **Sun–Sat day selectors are a GENERATOR, not a stored schedule** — `C-14`'s words. The **client** expands the chosen days across the term into N dated sessions and calls the RPC N times; **no recurrence rule is stored, and no duplicated calendar record is created** (`A-016`, `A-047`). ⚠️ **This is the design question I am least certain about and it is flagged as decision 3 below.**

### 4 · ⚠️ FOUR DECISIONS THAT ARE THE OPERATOR'S, NOT MINE

1. ⛔ **`admin_create_term` HAS NO AUDIT STRING, AND I WILL NOT INVENT ONE.** The registry carries `admin.module_created`, `admin.session_created`, `admin.trainer_assigned`, `admin.student_created`, `admin.enrolment_changed`, `admin.parent_link_changed`, `admin.profile_created` — **and nothing for a term.** ▶ **Three readings, and the choice is yours:** **(a)** creating a term is a governed administrative act and needs **`admin.term_created`** — a **twentieth** registry string, which is a `CLAUDE.md` §12 stop-and-ask in its own right; **(b)** a term is inert scheduling structure that carries no authorization and audits nothing, like `class_grades`, which is **seeded** and has no create action either; **(c)** terms are **seeded** rather than created, and screen `26` only *selects* one — which removes the RPC entirely. ⚠️ **I lean (b) or (c): `D-3` calls terms "scheduling structure", and `G-4`'s original refusal was about not building a substrate for a label.** But **`A-029` requires one event per GOVERNED action**, and whether creating a term is one is a ruling, not an inference.
2. **`class_sessions.term_id` NULLABLE with NO backfill.** The four existing sessions stay term-less and their term is **omitted, never invented**. ⛔ **Recommended, and it needs your word** — the alternative is a fabricated academic fact on live rows.
3. ⚠️ **THE RECURRENCE GENERATOR RUNS IN THE CLIENT AND STORES NOTHING.** `C-14` says a recurring pattern is *"a generator, not a stored schedule"*, which settles that no rule is **stored** — it does not settle **where the expansion happens**. ▶ **Client-side expansion means N round trips and N audit events, one per session, which is the honest shape**: each session really is a separate governed record. **A server-side batch RPC would be fewer calls but would put a loop inside a governed transaction and make partial failure ambiguous.** **Recommended as proposed; your call.**
4. **`room` stays on `class_sessions` only.** `C-14` left open *"whether it is also a module-level default"*. ⛔ **Recommended: no module-level default.** `G-6` made `room` a **plain descriptive column that must never scope a query**; a second copy on the module is a second answer to *where does this class meet*, and the two can disagree. The form pre-fills the field per session from the previous one — **presentation, not storage.**

### 5 · WHAT THIS FAMILY DOES NOT CONTAIN

⛔ **No lessons entity** (`C-6`) · **no `classes` entity between Class Grade and Class Module** (`A-016`) · **no fourth Class Grade** (`A-026`, `A-054`) · **no class code, capacity or programme column** (`C-14` omits all three) · **no TA field and no `centre_membership_role` extension** (`A-014`, `G-7`) · **no term REPORT of any kind** (`D-3` authorizes structure only; `C-11` defers screen `28`) · **no duplicated calendar or event record** (`A-047`) · **no new enum** · **no write policy or write grant on any table** · **no change to `Q-27`, `G-2`, `A-036`, `A-038` or the content hash.**

### 6 · WHAT AN AUTHORIZATION WOULD NEED TO SAY

**One migration**, creating: **1 table** (`terms`) · **1 column** (`class_sessions.term_id`) · **1 RLS policy + 1 matching `SELECT` grant** (on `terms` only) · **2 or 3 RPCs** depending on decision 1 · **0 new enums** · **0 new audit action strings** *(unless decision 1 goes to reading (a), which is its own stop-and-ask)* · **0 seed rows** *(unless decision 1 goes to reading (c), which would add them)*.

⛔ **Census effect if approved as proposed:** **25 → 26 migrations · 28 → 29 tables · 49 → 51 or 52 functions · 12 enums unchanged · 29 → 30 policies · audit registry UNCHANGED at 19.**

---

### ✅ `P2-2` RULED AND HALF-BUILT — 2026-08-12

**Operator ruling, `C-7`, decision 1 = option (c): TERMS ARE SEEDED, NOT CREATED.** In their words: *"Terms are academy calendar structure, not a user-created object in this product… Seeding removes the RPC and the audit question together, and satisfies `A-029` trivially rather than by argument: no governed action, no event. No twentieth string."*

✅ **BUILT AND PROVEN:** migration `20260812230000_portal_d3_terms_substrate.sql` — **1 table · 1 nullable `class_sessions.term_id` (NO backfill) · 1 RLS `SELECT` policy · 1 matching `SELECT` grant · 4 seed rows · ZERO functions, enums, audit strings, write policies, write grants.** `prove:portal-p2-2` **exit 0**. Census **26 · 29 · 49 · 12 · 30 · 19** — exactly the figure proposed in advance.

⚠️ **THE SEED IS A DEVELOPMENT CALENDAR AND DECLARES ITSELF ONE.** No document establishes iSpeak's real term calendar; the four 2026 quarter rows are a placeholder, the real calendar is an **OPERATOR INPUT**, and `T-7` pins the count at four so it cannot be silently grown into something that reads as ratified.

### ⛔ `P2-2`'s SCREEN IS STOPPED ON AN INTERNAL INCONSISTENCY IN THE RULING

The same ruling says **"NO WRITE PATH ANYWHERE"** and **"SECURITY DEFINER *read* RPCs as needed"** — and also **"BUILD `P2-2` COMPLETE"**. ⛔ **`P2-2` is screen `26` Add Class, a CREATE form**, which needs governed writes to `class_modules`, `class_sessions` and `class_session_assignments`.

**The two readings, recorded rather than chosen between:**

| # | Reading | Consequence |
|---|---|---|
| **A** | *"NO WRITE PATH ANYWHERE"* is categorical | The terms substrate is all of `P2-2` that ships. **Screen `26` is deferred** until class creation is authorized as its own question, and `P2-3` (`27` Edit Class) defers with it |
| **B** | The enumerated list scoped the **terms family**; class creation proceeds on the two **already-ratified** audit strings `admin.module_created` and `admin.session_created` | Three governed `SECURITY DEFINER` write RPCs ship. ⚠️ **They need no write policy and no write grant** — that is the whole point of the pattern — so reading (B) is *consistent* with the enumerated zeros |

▶ **Reading (B) is textually available and (A) is textually plain.** The asymmetry decides the handling, not the probability: building (B) wrongly creates the product's **first governed administrative write path** under a ruling forbidding one; building (A) wrongly costs one screen. **`C-4`'s precedent governs — a ruling with an internal inconsistency is a stop-and-ask.**

---

### ✅ `P2-2` COMPLETE — 2026-08-13. READING **B**, RULED BY THE OPERATOR

**Operator ruling, 2026-08-12:** *"READING B. My ruling was ambiguous and your stop was right. The enumerated zeros scoped the TERMS family… BUILD `P2-2` — screen `26` Add Class — on the already-ratified `admin.module_created` and `admin.session_created`."*

#### ⚠️ THE AMBIGUITY ITSELF, RECORDED — NOT ONLY ITS RESOLUTION

The Operator asked for this expressly: *"RECORD THE AMBIGUITY, not just the resolution. A ruling that scopes a prohibition to one subject and an instruction to another, in one message, is the operator-side instance of the same defect the disciplines describe."*

▶ **THE SHAPE:** one message carried a **categorical-sounding prohibition** (*"NO WRITE PATH ANYWHERE"*) written while thinking about **terms**, and an **instruction** (*"BUILD `P2-2` COMPLETE"*) about a phase whose screen **is a create form**. Each half was correct about its own subject. **Neither half said which subject it was about**, and the reader cannot recover a scope that was never written down.

⛔ **IT IS THE SAME DEFECT AS `D-28`, ON THE OTHER SIDE OF THE CONVERSATION** — a claim whose *stated* scope is wider than its *intended* scope, propagated into a place that reads it as governing. **Recorded because the corpus's stale-restatement register would otherwise contain only agent-side instances**, which would make the pattern look like an agent failure mode rather than a property of how rules travel.

✅ **AND THE HANDLING WAS RIGHT ON ITS OWN TERMS.** The stop cost one phase-boundary round trip. Building reading (B) wrongly would have created the product's first governed administrative write path under a ruling whose plain words forbade one.

#### What shipped

**Migration `20260813090000_portal_p2_2_class_creation.sql`** — exactly **two** reviewed `SECURITY DEFINER` RPCs:

| RPC | Fires | Gate |
|---|---|---|
| `admin_create_class_module(p_class_grade_id, p_title)` | `admin.module_created` | exactly one ACTIVE `management` membership, `HAVING count(*) = 1` · the grade re-resolved **inside the caller's own centre** |
| `admin_create_class_session(p_class_module_id, p_session_date, p_starts_at, p_ends_at, p_room, p_term_id)` | `admin.session_created` | the same gate · module **and term** re-resolved inside the caller's centre |

⛔ **ZERO** tables, columns, enums, policies or client write grants. ⛔ **The audit registry is UNMOVED at 19** — both strings were ratified at Step 7H and had simply never had a writer. **Census `26·29·49·12·30·19` → `27·29·51·12·30·19`**, moving by exactly the two functions.

▶ **THIS IS WHY READING (B) IS CONSISTENT WITH THE ENUMERATED ZEROS RATHER THAN AN EXCEPTION TO THEM:** a `SECURITY DEFINER` RPC needs **no write policy and no write grant**. The owner writes; the caller holds only `EXECUTE`. Migration assertion `C-7` re-proves the terms write surface is still zero, **inside the very migration that introduced the first administrative write path**.

#### ⛔ ONE THING IS STOPPED, AND THE STOP IS STRUCTURAL

**Trainer assignment needs `admin.trainer_assigned` — a THIRD audit string the Operator did not name.** Their instruction was explicit: *"If class creation needs anything beyond those two strings and the existing tables, state it and stop."* It does, so it is **stated and stopped**.

⚠️ **The stop is not prose.** Migration assertion **`C-8` fails the build** if either RPC ever references `class_session_assignments` or names `admin.trainer_assigned`, and suite leg **`P23-9` measures it at RUNTIME** — after a module and two sessions were really created, `class_session_assignments` is unmoved and zero such events exist. ▶ **A stop recorded only in a comment is a stop the next phase edits away.**

✅ **A session created with no assignment is a REAL GOVERNED STATE**, not a broken one — `staff-projections.ts` already documents *"a session created but not yet assigned"*, and screen `12` already renders a module with no trainer name.

---

#### ✅ `P2-2b` — THE STOP IS DISCHARGED, 2026-08-13, AND THE CORRECTION IS MINE

**Operator ruling:** *"`admin.trainer_assigned` — **CHECK BEFORE ASKING**. Your own `P2-2` proposal reported the registry already carries `admin.module_created`, `admin.session_created` AND `admin.trainer_assigned`. If that holds, this is not a new-string question and the stop was unnecessary."*

✅ **MEASURED: it holds.** `array_length(audit_action_registry(), 1)` = **19**, and `admin.trainer_assigned` is among them.

⚠️ **THE MECHANISM, STATED ACCURATELY, BECAUSE IT DECIDES WHICH DISCIPLINE TO DRAW.** This was **not** a missing measurement — §`P2-2`'s own proposal above records the three strings as present, and this plan restated it. ▶ **The error was reading an ENUMERATION OF TWO as NARROWING an already-ratified THREE**, and treating that as a hard stop rather than a one-line question. **A stop is only as good as the fact it rests on**, and this one rested on a scope I inferred rather than on anything measured.

**Migration `20260813120000_portal_p2_2b_trainer_assignment.sql`** — **one** `SECURITY DEFINER` RPC, `admin_assign_session_trainer`. ⛔ **Registry UNMOVED at 19**, zero new table/column/enum/policy, zero write policy, zero write grant. Census `27·29·51` → `28·29·52`; **tables, enums, policies and registry all unmoved**.

**What the schema already guaranteed, and why the RPC is shaped around it:**

| Measured | Consequence |
|---|---|
| `class_session_assignments_one_active_per_session_idx` — UNIQUE `(class_session_id) WHERE is_active` | ⛔ **EXACTLY ONE ACTIVE ASSIGNMENT PER SESSION.** Reassignment is **deactivate-then-insert in one transaction**; a bare INSERT would raise `23505` on the second attempt — the defect `P1-2b` already found once |
| Composite FK `(trainer_membership_id, centre_id, trainer_role)` + `trainer_role` pinned by CHECK | ⛔ **A MANAGEMENT, PARENT OR FOREIGN-CENTRE MEMBERSHIP IS STRUCTURALLY UNASSIGNABLE.** `A-014`/`G-7` is held by the SCHEMA, not by this function's care |
| The FK pins role and centre — **not lifecycle** | ⚠️ **`status = 'active'` is the one gate ONLY the RPC can make**, and `P24-4` measures a deactivated trainer being refused |

⛔ **ONE EVENT COVERS A REASSIGNMENT, NOT TWO.** The governed action is *"this session is now taught by X"*; the deactivation is that action's other half, and `A-029` counts **actions**. ⛔ **A CONFIRMED NO-OP EMITS NOTHING** (`P24-5`) — the `FA-6` shape.

⛔ **UNASSIGNMENT IS STILL NOT BUILT**, and correctly: it is a different action with **no ratified string**, and `26` needs none because at creation time there is nothing to unassign. The frame's `-` removes the trainer from the **form**.

#### ⛔ THE STANDING RULE THIS PHASE PRODUCED, MECHANIZED

**Operator ruling, on `P2-2`'s most important defect:** *"**A STRUCTURAL ASSERTION CANNOT PROVE A FUNCTION RUNS.** Every RPC migration from here carries a leg that CALLS the function, not one that inspects it."*

✅ **`P24a-CALL` enforces it across the whole `P2-2` family**: it reads every `CREATE FUNCTION public.<name>` out of each migration and requires the paired SQL suite to CALL it. **`P24a-CALLc` is its control** — the same detector, pointed at a file that cannot contain the calls, must report every function uncalled. ▶ **A migration that adds an RPC nobody exercises now FAILS the phase**, which is the only form of this rule that survives the next person in a hurry.

#### ⚠️ AND ONE INSTRUMENT CHANGE, RECORDED RATHER THAN QUIETLY APPLIED

The `P2-2` phase suites pinned **all six** whole-database census figures as one exact string, and **fired on three consecutive phases** — every time because a *later* phase legitimately added an object. ⛔ **The answer is not a floor**: `>=` keeps passing while something silently stops being counted. ▶ **The split instead:** phase suites assert **exactly** the four *"nothing was added"* invariants (tables, enums, policies, registry) and **report** the growing totals; the **global function ratchet lives in exactly one place**, `hero-2`'s `P2-6`, where moving it requires writing down which authorization did it.

#### ⚠️ ONE RECORDED CONTROL-TYPE DIVERGENCE FROM THE FRAME

`Room`, `Start time` and `End time` are **drawn as dropdowns and built as free inputs**. The frame is a static render: it shows one value in each and **enumerates no options**, and no ruling, table or seed establishes a room inventory or a time-slot vocabulary anywhere. ▶ A `<select>` would require **inventing** one — schema by inference from a frame (`A-022`). `Term` and `Level` **are** selects, because both are backed by real rows.

#### Gates

| Gate | Result |
|---|---|
| `prove:portal-p2-2-create` | ✅ **exit 0** — 11 SQL legs + 5 runner checks. Non-vacuity first; **denials before the permit control**; non-disclosure proved by an AUTHORIZED caller receiving the same string an unauthorized one did; the stop measured at runtime |
| `prove:portal-p2-2` · `prove:portal-p2-1` · `-p2-1-composed` · `-1` · `-2` · `-2b` · `-5` · `-34` · `-5-composed` · `f-attendance-init-1` | ✅ **all exit 0** |
| `prove:hero-all` | ✅ **17/17** — after `hero-2`'s `P2-6` census ratchet fired at `49 → 51` and was **updated with its reason, never relaxed** |
| `prove:encoding` · `test:integration` · `tsc` · `eslint` · `next build` · nav suite | ✅ **0 · 0 · 0 · 0 errors · 0 · 0** |
| `prove:stage3-authenticated` | ⛔ **`NOT-RUN`, not `FAIL`** — an Operator-owned `next dev` (PID `46348`) holds this directory and Next 16 refuses a second. **The cause was reproduced directly**, so it is not this phase's code, and the process was **NOT killed** |
| **VISUAL acceptance, screen `26`** | ⛔ **`NOT-RUN`** and not claimed — no screenshot of any kind was captured |



---

## `P2-3` · screen `27` Management Edit Class — ✅ **COMPLETE 2026-08-13**

**Operator authorization:** *"APPROVED — two strings, registry 19 → 21, exactly as stated … I am authorizing the class of change, not an open budget."*

**Migration `20260813150000_portal_p2_3_class_edit.sql`** — two `SECURITY DEFINER` RPCs,
`admin_update_class_module` and `admin_update_class_session`; **audit registry 19 → 21**;
**zero** new table, column, enum or policy, **zero** write policy, **zero** write grant.
Census `29·29·52` → `29·29·54`; **tables, enums and policies unmoved**.

`A-057` was amended in the **`C-4` shape** at the **single** declaration site, and assertion
`U-3` re-proves no second site exists. Assertion `U-2` **fails the build if any of six
unauthorized neighbouring strings appears**, `U-5` if either RPC deletes, deactivates or
reaches trainer assignment, and `U-6` if either mentions a report, rating or observation.

### ⛔ THE THREE REFUSALS — THE MORE VALUABLE HALF OF THIS PHASE

**Operator:** *"Recording them explicitly — especially the day strip, where changing which
weekdays a class meets means destroying sessions with no ratified string — is what stops a
later phase building the control and quietly not wiring it. Keep all three with their reasons
in the plan, not only in this report."*

| # | Refused | Why, and what would be needed to lift it |
|---|---|---|
| **1** | **The Sun–Sat DAY STRIP.** ⛔ **ABSENT, not present-and-disabled** | Changing which weekdays a class meets means **REMOVING sessions**, and **no cancel or delete audit string was ratified**. A session may already carry attendance, an observation or a **submitted report**, so destroying one is a governed act that must be recorded — and nothing can record it. ▶ **A greyed chip reads as "not wired yet"; this is "not permitted", and the two must not look alike.** The existing dates are listed **read-only** with the reason stated on the surface, so the schedule stays legible. **To lift:** a ratified session-cancellation action string and its governed RPC |
| **2** | **UNASSIGN** — the frame's `-` beside the trainer | Leaving a session with **nobody** is a different governed action with **no ratified string**. ⚠️ Choosing a **DIFFERENT** trainer is **reassignment** and works, through the `P2-2b` RPC on `admin.trainer_assigned`. **To lift:** a ratified unassignment string |
| **3** | **`Class code`, `Capacity`, `Program`** | `C-14` omits all three. "Programme" additionally has **no entity**, and `A-016` forbids a hidden `classes` entity between Class Grade and Class Module. **To lift:** an Operator ruling adding fields to `C-14`'s six — and, for programme, a schema authorization |

### ⚠️ AN OPERATOR-SUPPLIED PREMISE REFUTED BY MEASUREMENT — THE THIRD

The instruction said *"extend **BOTH** declaration sites in one migration"*. **There is one.**
`P1-2` consolidated them into `public.audit_action_registry()`, read by `audit_append_event`
and `audit_verify_chain`. **Operator:** *"MY PREMISE WAS STALE and you were right to say so
… Record it as an operator-supplied premise refuted by measurement — that is now the third."*
The single site was extended, with an assertion that **no second exists**.

### ⚠️ NO RATIFIED FRAME DRAWS AN INBOUND CONTROL TO `27` — REPORTED, NOT INVENTED

`Management - Classes` states *"Selecting a class card opens `Management - Class Overview`"*,
and `Management - Class Overview` names **no Edit control at all**. **No Edit affordance was
added to screen `12`**: inventing a navigation control the frames do not draw is the same
error class as inferring schema from a frame (`A-022`, §7.2). `27` is reached at its canonical
route. ▶ **Operator question, recorded as a dependency.**

### Other recorded divergences

- The frame's breadcrumb `Classes / Junior Public Speaking / Edit` — **`Junior` is a class
  code**, omitted by `C-14`, so the breadcrumb carries the module title alone.
- `Room` / `Start time` / `End time` drawn as dropdowns, built as free inputs — the `P2-2`
  reasoning, unchanged. `Term` and `Level` **are** selects; both are backed by real rows.
- **Room, times and term apply across EVERY session; each session keeps its own DATE.**
  Rewriting the dates too would collapse a term into a single day.
- A field seeds **only where every session agrees**; otherwise it renders **empty**, so a save
  cannot silently flatten an arrangement the form never displayed. Same rule for the trainer.
- **`unchanged` is reported as itself** — a governed no-op emits nothing (`A-029`), so
  claiming "saved" would assert an audit record that deliberately does not exist.

### ⛔ THE PHASE-SCOPED-CLAIM DEFECT, FOUND THREE MORE TIMES

The registry moving 19 → 21 fired **three** suites — `P2-2`'s create suite, the terms
substrate and `P2-2b` — each pinning the registry **TOTAL**. ▶ **A phase-scoped claim
written as a global absolute measures every OTHER phase's behaviour.** All three now assert
only what their own phase did: its strings present, and its **migration file** declaring no
registry, each with a **control** proving the detector fires. Totals are **reported**. The one
surviving global ratchet is `hero-2`'s `P2-6` (**52 → 54**), where moving the number requires
naming the authorization.

### Gates

| Gate | Result |
|---|---|
| `prove:portal-p2-3` | ✅ **exit 0** — 12 SQL legs + runner checks, including **chain verification accepting both new strings** and its **non-vacuity control** proving the verified chain really contains them |
| `prove:portal-p2-2-create` · `-p2-2` · `-p2-2b` · `-p2-1` · `-p2-1-composed` · `-1` · `-2` · `-2b` · `-5` · `-5-composed` · `-34` · `f-attendance-init-1` | ✅ **all exit 0** |
| `prove:hero-all` | ✅ **exit 0** — after `P2-6` fired at `52 → 54` and was **updated with its reason, never relaxed** |
| `tsc` · `eslint` · `next build` · nav suite · `test:integration` · `test:g06-grounding` · `prove:encoding` · `prove:no-secrets` · `prove:serving-discipline` · `prove:stage2-routes` · the four guard suites | ✅ **all 0** |
| `prove:stage3-authenticated` | ✅ **exit 0 — 31 PASS · 0 FAIL · 2 `NOT-RUN`.** ⚠️ **THE OPERATOR HAD ALREADY CLEARED PORT 3000**, which the §15.8.1 sweep found by measuring (`netstat` no listener; PID `46348` gone) rather than by carrying the limit forward. ✅ **`S3-M3-r` and `S3-M4-r` are the FIRST RENDERED PROOFS of screens `26` and `27`**, and **`S3-M4-refusals` measures all three refusals ON THE PAINTED PAGE** — strictly stronger than a source scan, with a control requiring the detector to match the frame's own strings |
| **VISUAL acceptance, screens `26` and `27`** | ⛔ **`NOT-RUN`** on both, and not claimed. ⚠️ **A rendered DOM-text proof is NOT a visual acceptance** — it says the surface paints its data and nothing about layout or fidelity to the frame |
| `test:continuity` | ⛔ **`NOT-RUN`** — blocked at `CONT-A0` by `B-STAGE3-2`, as already recorded |
| `test:exit-condition-b` | ⛔ **`NOT-RUN`** — refused at `XB-PRE` because the canonical database is not pristine. **A downstream consequence of the OPEN, `OPERATOR-ONLY` blocker `B-STAGE3-2`**, not a `P2-3` regression: nothing was provisioned |
| `test:runtime-profile` | ~~⛔ **`FAIL`**~~ ✅ **exit 0 — RULED AND FIXED 2026-08-13** under a bounded §12 authorization, with `T-P44c` and a live on-disk plant proving the guard still fires. See `B-P2-3-1` |

### ⛔ `B-P2-3-1` — A GUARD THAT HAS BEEN FAILING SINCE PART 1 AND HAD NEVER BEEN RUN

`T-P44` in `scripts/tests/config/run-runtime-profile.mjs` pins that
**`lib/supabase/browser.ts` is imported by NOTHING** and that `lib/supabase/public-config.ts`
is imported by exactly four permitted modules — *"if a future client component imported it, a
disposable build would inline the disposable URL and publishable key straight into a browser
bundle"*.

⚠️ **`P1-2b`'s `lib/frontend/evidence-upload.ts` imports BOTH** (commit `1624ef8`,
2026-08-12). **Measured, not argued:** that file and the runner are **byte-identical at HEAD
and in the working tree** (`git diff HEAD --stat` empty), so the failure **reproduces at
`62ee67b`** and is **not** caused by `P2-3`. `runtime-profile` appears **nowhere** in
`STATUS.md` and only once, incidentally, in `BUILD_NOTES.md` — **it has never been recorded as
run**, which is why a guard written to catch exactly this went unnoticed.

⛔ **NOT FIXED, DELIBERATELY.** Extending the permitted-importer list **changes a security
guard** (§12: *"changes an authorization or security contract"*) and is **outside `P2-3`'s
authorization**. ▶ The likely correct disposition is that `T-P44`'s **premise was superseded
by `D-5`/`P1-2b`** — a browser-side resumable upload genuinely needs the Supabase URL and
publishable key — but "the guard's premise lapsed" is exactly the shape that must be
**ruled, not inferred by the session that trips over it**. **Operator decision required.**


---

## `P2-4` · screen `13` Management Class Overview — ✅ **COMPLETE 2026-08-13**

**Operator authorization:** *"SCHEMA AUTHORIZED — two SECURITY DEFINER read RPCs, exactly as proposed … Zero new table, column, enum, policy or write grant. Registry unmoved at 21."*

**Migration `20260813180000`** — `report_list_management_class_status` and
`report_class_health_summary`. Census `30 · 29 · 56`; **tables, enums, policies and the audit
registry all unmoved**. A read is not a governed action (`A-029`).

### ⛔ WHY A FUNCTION EXISTS AT ALL — MEASURED BEFORE IT WAS PROPOSED

`reports`, `observations` and `report_evidence` carry **ZERO policies and ZERO client grants**.
Unlike `12`, this surface **cannot** be a direct RLS read. ⚠️ Assertion **`V-7`** keeps that
justification honest: it fails the build if a policy or client grant ever appears on those three,
because the functions would go on working while the reason for them had evaporated.

### ⛔ THE BARS, ASSERTED STRUCTURALLY — AND THE FRAME IS OVERRIDDEN

The frame's own note lists **B.E.S.T. Ratings** and a *"rubric focus-area list … assessed
speaking criteria"*. **NOT BUILT.** `C-9` confines `D-1`'s nine ratings to report **DETAIL**
surfaces; `G-2` bars every roll-up everywhere. ▶ **The omission is EXPECTED, never a regression.**

Enforced **three deep**: migration **`V-4`** fails the build if either RPC so much as **names**
a barred term — matched as a **bare substring**, so it also catches `observation_ratings`,
`report_version_ratings` and `competency_rating` **without enumerating them**, which an
enumerated list would not have done for the next rating column somebody adds. `P26-7` re-asserts
it on the **returned shape** (a column can be renamed and still carry a rating). The contract
declares no field that could hold one. ✅ And `S3-M5-bars` measures it on the **painted page**.

### ✅ `C-17` — THE CLASS HEALTH SUMMARY, A GOVERNANCE-MANDATED ADDITION THE FRAME OMITS

`CLAUDE.md` §6's **four conditions, verbatim, top to bottom, first match wins**. ⛔ Never
AI-authored — generating this prose would silently pull the §8-deferred Weekly Class Health
Brief into scope.

⚠️ **EXTRACTED TO `lib/shared/class-health.ts`, NOT COPIED.** The server projection and the
deterministic fixture both need the verdict, and the server module is `server-only` — so the
fixture **cannot import it**. ▶ **The constraint produced the better structure**: two copies of
a ratified closed set is how one surface quietly acquires a fifth condition, and §6's whole
point is that exactly one result is ever shown.

### ⛔ `A-038` PER-ROW GATING — BUILT TO THE RULE, NOT INFERRED FROM THE FRAME

Four outcomes, each checked independently, with **no generic "view report" handler**:
`submitted` → the canonical report · `trainer_approved` → the final-review surface · any earlier
status → **Send Reminder to Trainer** and **no report content of any kind** · **`No Report` → no
button at all**, a plain "—".

⚠️ That last case is why the projection returns a **row** for a learner with no report: an
absent row cannot be told apart from a learner who is not enrolled.

### ⚠️ THE FINDING OF THIS PHASE — TWO LEGS THAT PASSED WHILE MEASURING NOTHING

**Operator:** *"A leg that passes on a fixture lacking the case it tests has measured nothing,
and planting the case inside the rolled-back transaction is the fix."*

The first green run of `prove-p2-4` was **worthless on its two most important behaviours**:

* **`P26-6`** reported *"0 rows with No Report"* — the fixture's only learner already had one,
  so **`A-038`'s NULL branch was never exercised**;
* **`P26-8`** returned NULL — no observation carried `focus_chips`, so **the server-side
  aggregation the Operator had just ruled on never ran**.

Both are now **planted inside the rolled-back transaction**: a second learner, and chips with a
deliberate **winner and runner-up**. ▶ **A most-frequent-tag proof with one candidate proves
nothing**, so the leg requires `audience_awareness` — the `count DESC, chip ASC` tie-break
winner — which also proves ties are **deterministic** rather than planner-order.

### ⛔ THE SAME VACUITY CLASS, ARRIVING THROUGH INFRASTRUCTURE FAILURE

Mid-phase the **Docker daemon stopped**, and the runner printed **two PASS lines** — *"ran to
completion without an error"* and *"0 FAIL"* — against **no output at all**. Both are trivially
true of an empty string; only the pinned executed-count leg caught it.

**Operator ruling:** *"a suite that cannot run must not be able to report clean."*

✅ **SWEPT: 17 runners carried the shape** (measured **before** fixing; only `prove-p2-4` was
guarded, because it had just been fixed). Every one now calls **one shared predicate**,
`scripts/tests/portal/suite-output-rule.mjs` — shared, not copied, so a control guards the
predicate everyone actually runs. **`P26a-EMPTY`** proves it **rejects** an empty result, a
non-empty docker error carrying no legs, and *another suite's* legs, and **accepts** a real one
— the positive clause matters, or "the guard fires" would be equally true of a predicate that
rejects everything.

### Gates

| Gate | Result |
|---|---|
| `prove:portal-p2-4` | ✅ **exit 0** — 11 SQL legs + runner checks, including the shared emitted-output guard and its control |
| Every other portal suite (13 of them) · `prove:hero-all` · `test:integration` · `test:g06-grounding` | ✅ **all exit 0** — after `P2-6`, the single global function ratchet, fired at **54 → 56** and was updated **with its reason** |
| `tsc` · `eslint` · `next build` · nav suite · `prove:encoding` · `prove:no-secrets` · `test:runtime-profile` · `prove:stage2-routes` | ✅ **all 0**. Route census **18 → 19** |
| `prove:stage3-authenticated` | ✅ **exit 0 — 34 PASS · 0 FAIL · 2 `NOT-RUN`.** `S3-M5-r` is screen `13`'s FIRST rendered proof, and `S3-M5-bars` measures the rating exclusion on the painted page |
| **VISUAL acceptance, screens `12` · `13` · `26` · `27`** | ⛔ **`NOT-RUN` on all four**, and not claimed |

✅ **Screen `12`'s card destination WENT LIVE** — the second inert control to activate when its
target became real (after `Add Class` at `P2-2`). **Rewritten, not deleted**: the rule still
governs, and the control went live because the TARGET became real, which is the condition the
inert treatment was chosen for.

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
| **17** | ⛔ **A CONTROL A RULING FORBIDS IS ABSENT, NEVER GREYED.** **A disabled control reads *"not wired yet"*; an absent one reads *"not permitted"*.** Where a ruling forbids a **capability**, the control must not be rendered at all — and where its removal leaves a gap a reader would notice, the surface **states the reason** rather than leaving a silent hole. ⚠️ **This is NOT the inert-control treatment and must not be confused with it**: an **inert** control is right when the target is merely NOT YET BUILT and will become live when it exists (`Add Class` on `12`, which went live at `P2-2`). **Absence is right when the capability is REFUSED.** ▶ Canonical case: screen `27`'s Sun–Sat day strip, absent because removing a session has no ratified audit string | **Operator ruling, 2026-08-13**; `P2-3` |

---

## 9. Authorization register

⛔ **A ruling is not an authorization.** `D-1` … `D-5` and `C-1` … `C-18` authorize **no** table, enum, column, bucket, policy, RPC, grant, audit action string, migration, route or screen. **`C-7`: every new table family needs its own explicit Operator ruling at its phase.**

| Phase | Change class | Before any code |
|---|---|---|
| **P1-1a** | Documentation + code-comment reconciliation only | ✅ **GIVEN 2026-08-11** — executed and committed |
| **P1-1b** | Management projection extension + a new management-only read | ✅ **GIVEN 2026-08-11** — bounded §12. Built, proven, committed |
| **P1-1c** | The screen `19` frontend consuming that read | ✅ **GIVEN 2026-08-11** — bounded, with six named constraints. Built, proven, committed. ⛔ **Expressly NOT the `C-7` table-family authorization** |
| **P1-2** | The `D-5` evidence table family, bucket, storage policy and RPCs | ✅ **GIVEN 2026-08-12** — the `C-7` ruling, approved as designed, plus four named decisions. Built and proven; ⚠️ **the resumable upload transport is outstanding** |
| **P1-2** | ⚠️ **SCHEMA + STORAGE + audit registry** — the highest-risk item in the plan | ✅ **REQUIRED** — ~~⛔ **BLOCKED on `R-4a` `R-7`~~ ✅ **BUILT — `R-4a` RULED 2026-08-11, corrected 2026-08-12** |
| **P1-3** | Management read of evidence; ⛔ **no transition-guard change** (`C-5`) | ✅ **REQUIRED** |
| **P1-4** | Trainer read of evidence | ✅ **REQUIRED** |
| **P1-5** | ⚠️ **Parent projection extension** | ✅ **REQUIRED** — ✅ **`R-5` RESOLVED 2026-08-12; awaiting its own authorization** |
| **P2-2** | ⚠️ **SCHEMA — terms** + the two create RPCs | ✅ **REQUIRED** (`C-6` `C-7` `C-14`) · ✅ **GIVEN AND DISCHARGED 2026-08-12/13** — decision 1 option (c) for terms, then reading **B** for the create path. ⛔ A **third** audit string for trainer assignment is **NOT** given and is stopped |
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
| ~~⚠️ **`R-4a` — the reserved `C-4` collapse question**~~ ✅ **RULED 2026-08-11 by `C-4`; corrected 2026-08-12** | ~~`AWAITING_OPERATOR`~~ ✅ **CLOSED** | ~~Blocks `P1-2`. `evidence.uploaded` and `evidence.attached` **appear to be one governed action**; `A-029` requires one event per action. **If collapsed, `16 → 19`.** ▶ **Live registry is still 16 and `A-057` is unimplemented, so nothing is baked in**~~ ⛔ **THAT SENTENCE IS NOW FALSE ON BOTH COUNTS — corrected 2026-08-12.** The **live registry is 19**, measured at HEAD, and **`A-057` IS implemented**. ⚠️ **This is the SECOND HALF of a fact recorded TWICE IN ONE ROW** — the front of the row was corrected while this tail was not. **A reader correcting such a row has already seen the other half and does not re-read it**, which makes the same-row case the hardest of all. |
| ✅ **`A-002` — RULED 2026-08-12** | `RESOLVED` | **Parent evidence access is authorized in Part 1.** ⚠️ It did return as its own question rather than as a footnote, which is why the ruling could state its own ground — **`D-5`, client-ratified, consent confirmed** — and could scope itself to parent EVIDENCE access alone |
| ✅ **`P1-1b` — the `D-1` read** | `PASS` | `report_get_management_ratings`, nine in-transaction assertions, `prove:portal-1` exit 0 |
| ✅ **`P1-1c` — the screen `19` frontend** | `PASS` | The full chain; nine surface legs. ▶ **`D-1` is COMPLETE end to end** |
| ⚠️ **The silent-save reproduction is still owed a walk** | `OPEN` | Carry into §5. Console empty = the button never enabled · `submit-ignored` = not `ready` · `dispatching` with no server-log entry = a third possibility neither candidate covered. Steps in `BUILD_NOTES.md`; repeat on a `trainer_approved` report → Management **Edit wording** |
| ✅ **The `A-038` / `GC-6` reconciliation** | **SCHEDULED** | `P1-1`, measured scope at §6.5 — **15 locations, 4 of them live source** |
| ⚠️ **`test:integration` exit 1 — AND `prove:stage3-authenticated` exit 1, ONE ROOT CAUSE** | `OPEN`, **re-measured 2026-08-12 at `P2-1`** | `INT-A5` ×2, `INT-Q27`, `S3-M1-r`, `S3-P1-r`, `S3-P2-r`. ▶ **Both suites are pinned to an EMPTY-FIXTURE state the Operator's walkthrough legitimately moved** — *suite staleness, product correct*, and **neither was caused by `P2-1`**, which writes nothing. `INT-Q27` additionally expects a Parent DTO without the `context` key hero Phase 1 added. ⛔ ~~`run-integration.mjs:517` calls `pass("INT-A5")` **unconditionally** after both `fail()`s~~ ✅ **THAT NOTE IS ITSELF STALE — measured at HEAD, the block is guarded by `failuresBefore` and prints no `PASS` when it fails.** The instrument defect is closed; the two `INT-A5` failures are real and are fixture staleness. ⚠️ **`stage3` is the project's ONLY harness that renders an AUTHENTICATED surface**, so repairing it is also the precondition for giving any new screen a real render leg. ~~**Scheduled as one bounded unit before `P2-2`**~~ ✅ **DONE 2026-08-12 — BOTH SUITES EXIT 0 AND THIS ITEM IS CLOSED.** `INT-A5` now DERIVES a pre-approval report at run time with a control proving the same read returns content for the submitted pair; `INT-Q27` is corrected to the current field set and STRENGTHENED by pinning `context`’s own seven fields; `stage3`’s three render legs are STATE-DERIVED. ✅ **Two `Q-27` legs that had been `NOT-RUN` now RUN**, and **screen `12` gained the first RENDERED proof of any Part 2 surface** (`S3-M2`, plus `S3-M2-omissions` asserting the three ruled omissions and `G-2` on the painted page). ⚠️ **VISUAL acceptance stays `NOT-RUN`** — a DOM-text proof is not one |
| ⚠️ **`RENDERED CAPTURE` `NOT-RUN` on every authenticated surface** | `OPEN` | Not closed by any phase unless one runs a capture |
| ⚠️ **The Phase 8/11 gap** | `OPEN` | Structural consistency is **neither a visual nor a functional acceptance** |
| ⛔ **`09` refuses its canonical route** (`C2C-007`) | `OPEN`, measured | `P2-21`, first |
| ⚠️ **`A-044` is knowingly unmet for `28`** | **RULED** (`C-11`) | Deliberate. Recorded so it is never read as an oversight |
| ~~⛔ **`B-P2-3-1` — `T-P44` has been FAILING SINCE PART 1 and had NEVER BEEN RUN**~~ ✅ **CLOSED** | ~~`OPEN` · **Operator decision required**~~ ✅ **RULED 2026-08-13** | `P1-2b`'s `lib/frontend/evidence-upload.ts` imports **both** `lib/supabase/browser.ts` and `lib/supabase/public-config.ts`, which `T-P44` pins as unimported / four-importer-only. **Measured:** both that file and the runner are byte-identical at HEAD, so the failure reproduces at `62ee67b` and is **not** a `P2-3` regression. ⛔ **NOT FIXED** — extending a security guard's allow-list is a §12 stop-and-ask, and *"the guard's premise lapsed under `D-5`"* must be **ruled, not inferred by the session that tripped over it**. Full record in the `P2-3` section. ✅ **RULED AND CLOSED 2026-08-13 — BOUNDED §12 AUTHORIZATION.** The Operator authorized extending the allow-list **for `evidence-upload.ts` SPECIFICALLY, not as a class**, on the ground that **the premise lapsed BY AUTHORIZATION, NOT BY DRIFT**: `T-P44` pinned those modules as unimported when nothing imported them, and `D-5`'s client-direct upload — a bounded **ADR-3 exception** — legitimately does. ⛔ **Any other module importing either one still fails**, proved TWICE: `T-P44c` plants a synthetic module and requires **both detectors to see it and both allow-lists to reject it** while the one authorized module is **admitted**; and a **real file was planted on disk**, measured **exit 1**, and removed, with **exit 0** after. ⚠️ **The control shares the LIVE sets and regexes** — the first draft gave it private copies, which is the very defect its own comment warned about. ▶ **Operator: *"A guard whose premise lapsed still needs a ruling, because 'the premise lapsed' is exactly what someone says when they want the guard out of the way."*** |
| ⚠️ **No ratified frame draws an inbound control to screen `27`** | **`AWAITING_OPERATOR` — DEFERRED TO `P2-4` BY RULING, 2026-08-13** | `Management - Classes` sends a card to Class Overview; `Management - Class Overview` names **no Edit control at all**. **No affordance was invented on `12`.** `27` is reachable at its canonical route. ~~✅ **OPERATOR RULING: WAIT FOR SCREEN `13`** … ⛔ **If `13` draws no Edit control either, THAT IS A FINDING**~~ ✅ **CLOSED 2026-08-13 BY THE AUTHORIZATION-A REBUILD — THE CONTROL IS BUILT AND WIRED.** ~~THE PREMISE WAS FALSE AND THE FINDING IS WITHDRAWN.~~ **`Edit class` IS in frame `13`'s HEADER CARD**, top-right, beside ASSIGNED TRAINER and ASSISTANT. The *"no inbound affordance"* report was a `grep` over the pack's **prose note**, never a reading of the frame (§12). ▶ **This is `TRUE-DRIFT`, not a design gap**: the control is drawn and simply was not built. The Operator rules the rebuild |
| ⚠️ **`RENDERED PROOF` on Part 2 screens** | **NARROWED 2026-08-13**, restated each boundary | ✅ **All FOUR Part 2 screens now have a RENDERED proof** — `12` (`S3-M2-r`), `26` (`S3-M3-r`), `27` (`S3-M4-r`), `13` (`S3-M5-r`), plus `S3-M2-omissions`, `S3-M4-refusals` and `S3-M5-bars` measuring ruled-out material on the painted page. ⛔ **VISUAL acceptance on all four was NOT MERELY `NOT-RUN` — THERE WAS NO BASIS ON WHICH IT COULD PASS**, because every one of these layouts was derived from a prose note rather than from the `.png`/`.html` (§12). A DOM-text proof never becomes a visual acceptance, and in this case it was not even evidence toward one |

---

## 12. ⛔ STANDING RULE — A LAYOUT IS DERIVED FROM THE `.png` AND THE `.html`, NEVER FROM A NOTE

**Operator ruling, 2026-08-13**, after the defect below was measured and admitted.

> **A layout is derived from the reference `.png` and `.html`. A `.md` note describes CONTENT and
> is never a source for GEOMETRY. Any statement of the form *"the frame draws X"* or *"the frame
> draws no X"* requires the `.png`; a note cannot support either claim. State which artefact a
> claim rests on when you make it.**

### ⛔ THE RULE WAS ALREADY IN THIS PLAN. IT WAS NOT FOLLOWED.

⚠️ **§3 of this document, *"How a phase is shaped"*, already requires every phase to carry the
frame read in full — *"the `/reference/` `.png`, its `.html`, **and** the numbered pack's
`screen.md`, which carries prohibitions and dependencies the visual artefacts cannot"*.** The
hero-chain plan carried the same requirement as an explicit Operator amendment (*".png AND .html
with values-never-markup"*).

▶ **So this is a COMPLIANCE failure, not a missing rule**, and it must be recorded that way.
Four consecutive phases declared §3 satisfied while reading one artefact of the three — and every
one of those phases was reported to the Operator as complete, with a gate table, and accepted.
⚠️ **No proof in this project measured §3 compliance**, which is why it survived four phases.

### What happened

Screens `12`, `13`, `26` and `27` had their layouts derived from
`reference/<pack>/<pack>.md` — **prose notes**. The `.png` and the `.html` were **never opened**
for any of them. ⚠️ Confirmed by the building session on direct question, including for the two
screens where it could not recall its sources and **refused to reconstruct them from its own
code comments**, which record conclusions rather than what was read.

### ⛔ CONSEQUENCE 1 — FINDINGS ABOUT "THE FRAME" WERE FINDINGS ABOUT A NOTE. WITHDRAWN.

Every claim below was reported as a measurement of a frame and was a `grep` over prose. **All are
withdrawn.** They are not merely unproven — at least one is **false**:

| Withdrawn claim | Status |
|---|---|
| *"No ratified frame draws an inbound control to `27`"* · *"screen `13` draws no Edit control either"* · the **DESIGN GAP** disposition built on them | ⛔ **FALSE.** The Operator read the frame: **`Edit class` is in frame `13`'s HEADER CARD**, top-right. Confirmed in the `.png` by the building session |
| The `27` **day strip**, **unassign** control and **field inventory** as *"what the frame draws"* | ⛔ **WITHDRAWN AS FRAME EVIDENCE.** The underlying GOVERNANCE reasoning (no cancel/delete audit string; no unassign string; `C-14`) is untouched — but it was never a measurement of the frame, and must not be cited as one |
| Screen `26`'s *"the frame enumerates no options, so a `<select>` would invent one"* | ⛔ **WITHDRAWN AS FRAME EVIDENCE**, pending re-measurement against the `.png`/`.html` |

⚠️ **The `S3-M4-refusals` and `S3-M5-bars` legs remain VALID as statements about the BUILD** —
they measure what the painted page contains. They were **never** evidence about the frame, and
any wording implying otherwise is withdrawn with the claims above.

### ⛔ CONSEQUENCE 2 — VISUAL ACCEPTANCE WAS NOT MERELY `NOT-RUN`

It has been reported as `NOT-RUN` at every boundary. That was **understated**. For these four
screens **there was no basis on which it could pass**, because the layout was never derived from
the artefact that defines it. ▶ `NOT-RUN` implies *"the check has not been performed"*; the
truth was *"the check could not have been passed"*. **Restated wherever it appears.**

### Why the `.html` specifically

It is the **only artefact carrying computed values** — spacing, type scale, grid structure,
column counts, radii. A layout built without it **cannot be faithful except by accident**, and
no proof this project runs would detect the difference: a rendered DOM-text leg asserts that a
handful of strings appear on a painted page, which is true of almost any arrangement of them.

### The rule, operationally

1. **Open the `.png` first.** It is the only artefact that can support *"the frame draws X"* or
   *"the frame draws no X"*.
2. **Open the `.html` before writing layout.** Grid, columns, spacing and type scale come from
   there, never from a description.
3. **The `.md` note is a CONTENT checklist**, useful for *"is this element accounted for"* and
   **never** for *"where does it sit and how big is it"*.
4. **Every claim names its artefact.** *"the `.png` shows …"*, *"the `.html` computes …"*,
   *"the note lists …"*. A claim that cannot name one is not a measurement.

### ✅ §12.1 — `prove:artefact-read`, THE MECHANICAL GATE (Operator ruling, 2026-08-13)

> *"The rule was in §3 of the plan you were executing, and no proof measures §3 compliance.
> That is the gap. CLOSE IT FIRST … A phase must be able to DEMONSTRATE it opened the `.png`,
> the `.html` and the numbered pack's `screen.md` — NOT ASSERT IT."*

⛔ **THE DEFECT WAS COMPLIANCE, NOT DOCUMENTATION.** §3 already required all three artefacts.
Four phases each reported complete with a full gate table and were accepted. **Nothing measured
the requirement**, so it survived four phases running.

**`prove:artefact-read` is added to EVERY phase's gate from here.** Each rebuilt screen carries
an ```` ```artefact-read ```` block in its numbered pack's `implementation-notes.md`, naming the
reference pack, the component file(s), a set of **computed values** and one **exact quotation**
from `screen.md`. The suite then measures, per screen:

| Leg | What it measures |
|---|---|
| `AR-3` | every cited value occurs **literally** in that pack's `.html` — you cannot cite a substring of a file you did not open |
| `AR-4` | **≥6 distinct**, **≥2 FRACTIONAL** (`1.30px`, `9.50px`, `2.40px`), and **none obtainable from the prose `.md`** — this is the leg that would have caught the defect |
| `AR-5` | every cited value is **USED in the component**, with **comments stripped first**, so *"used"* cannot degenerate into *"quoted"* |
| `AR-6` | the `screen.md` quotation is verified **at source** |
| `AR-7a…f` | **six controls** — a fabricated value, an all-integer set, a rounding attempt and a comment-only value must each be **REJECTED**, and a real value **ACCEPTED** |
| `AR-8` | `MEASURED` and `UNMEASURED` are disjoint and **every one of the 36 governed packs is accounted for** |

⛔ **WHAT IT CANNOT PROVE, STATED RATHER THAN PAPERED OVER: the `.png`.** An image leaves no
derivable textual residue; `atime` proves *"something touched the file"*, never *"a session
looked at it"*; and a declaration would be exactly the *"check that only records a claim"* the
Operator refused. ▶ **The honest bound:** this corpus's `.html` is a full render of the same
frame, so proving the `.html` was read covers the frame's **content and geometry**. What stays
unproven is narrow and real — the `.png` is the **tie-break authority where render and image
disagree** (font fallback, clipping, overflow). **The suite prints this limit on every run.**

⛔ **NOT BACK-FILLED.** Screens built before the rule sit in `UNMEASURED` and are given **no
citations**. Back-filling would mean opening the `.html` **today** and recording it as though
the building phase had — **fabricating a historical record**, the precise failure the rule
exists to prevent. A screen leaves `UNMEASURED` only by being **built or rebuilt** under it.

⚠️ **`AR-1` FAILS AT AN INTERMEDIATE SCREEN BOUNDARY, BY CONSTRUCTION**, until all four
Authorization-A screens carry a block. That is reported as *"screen N green, AR-1 outstanding"*
at each commit — **never** as a green suite.


---

## ✅ AUTHORIZATION A — THE FOUR-SCREEN REBUILD (2026-08-13) · **COMPLETE**

**Operator ruling, in two authorizations, deliberately not mixed.** `A` = layout and
presentation, every `(c)` item needing no data that does not exist. `B` = everything blocked on
data (FOCUS chips, per-row Stats, the footer targets, the employee ID) — **not built, and no
placeholders**.

### ⛔ THE GAP WAS CLOSED FIRST — see §12.1

`prove:artefact-read` now measures §3 compliance mechanically. **`AR-1` failed by construction
at each intermediate screen boundary** and was reported that way in each commit; it went green
at the fourth. The suite prints its **residual limit on every run**: the `.png` is not
mechanically provable.

### What each screen gained

| Screen | Built to the frame | Reported divergence |
|---|---|---|
| **`12`** | one `space-between` toolbar row (heading + count pill left, four level pills and `Add Class` right) · `20px` 3-column grid · cards at `16px` radius with a `13px` tile chip · the `···` overflow control · the whole card as the affordance to `13` · the `Students` stat in the frame's FOOTER position below the 1px divider | ⛔ **The `···` MENU OPENS TO NOTHING** — the frame draws the glyph and defines **no items**, so the control is real, operable, and says in words that the frame defines no actions. The invented `View class overview` button is **removed** |
| **`13`** | the header card entire — `58px` chip at `15px` radius, title, `Active` badge, meta line, `ASSIGNED TRAINER`, **`Edit class`** · the two stat tiles (`LEARNERS`, `ATTENDANCE`) · the lessons **TABLE** replacing the `<ul>` · the footer as CONTROLS rather than prose | ⚠️ **TWO EARLIER CLAIMS CORRECTED AT SOURCE** — see below |
| **`26`** | **ONE card, not three**, with the frame's 1px hairlines and `Cancel` / `Save Class` INSIDE it · the row structure · day chips inline at `9px 15px` · the `230px` search box · the trainer row with avatar and trailing control | ⚠️ **THE TRAINER SUBTITLE IS OMITTED**, and this is reported rather than resolved locally |
| **`27`** | the same one-card structure (the frame is layout-identical to `26`) · read-only session list in the day strip's place · trainer row · footer inside the card | ⛔ **All three refusals unchanged — and their EVIDENCE corrected** |

### ⛔ TWO CLAIMS CORRECTED AT SOURCE ON SCREEN `13`

1. **The Edit control.** `P2-4` reported *"this frame draws NO Edit control"*, and a **DESIGN
   GAP** was ruled on that premise. ⛔ **THE PREMISE WAS FALSE** — `Management - Class
   Overview.png` draws **`✎ Edit class`** in the header card. The claim was a `grep` over the
   pack's prose note. ▶ **`TRUE-DRIFT`, and now built.**
2. **The ratings claim.** `P2-4` recorded *"the frame's own note lists B.E.S.T. Ratings … NOT
   BUILT, and this is governance overriding a frame"*. True of the **NOTE**. Measured against
   the `.png`, **the frame draws no rating anywhere** — it draws a per-lesson `FOCUS` chip
   column. ⛔ **The bar is unchanged and still absolute**; only its stated ground moves.

⚠️ **THE SAME SHAPE ON `27`, IN REVERSE.** The day strip and the trainer row's `-` control
were recorded as absent **on evidence taken from the note**. Measured: **the `.png` DRAWS BOTH.**
Their absence is a REAL divergence and is `EXPECTED / REQUIRED` — removing sessions has no
cancel/delete audit string, and unassigning a persisted session has no ratified string either.
▶ Screen `26` builds the same `-` glyph as `Remove` because there it clears a FORM CHOICE
before anything is saved. **Same glyph, different act.**

### ⚠️ THREE PINS MOVED, AND EVERY ONE WAS REWRITTEN RATHER THAN DELETED

* **`S3-M2`** — `Every Class Module running at this centre` and `Actively enrolled in this Class
  Module` were **INVENTED COPY**; the `.png` draws neither. ▶ Pinning invented copy made the leg
  green **while measuring the opposite of faithfulness to the frame**. Replaced with strings the
  frame itself draws.
* **`S3-M5`** — `'Lessons'` was this build's own `h2`; the frame's lesson card carries **column
  headers**. Replaced with `LEARNERS` and `Edit class`.
* **`LEARNERS` is pinned IN CAPS** because that is what the page PAINTS: the markup says
  `Learners` and CSS `text-transform` uppercases it, and `innerText` reports the transformed
  string. A render tier should measure what is painted.

### Gates at the boundary

| Gate | Result |
|---|---|
| `prove:artefact-read` | ✅ **exit 0 — 30 PASS · 0 FAIL**, all four screens, six controls green |
| Every portal suite (`p2-1`, `-composed`, `p2-2`, `p2-2-create`, `p2-2b`, `p2-3`, `p2-4`) | ✅ **all exit 0** |
| `prove:hero-all` · `test:integration` · `test:g06-grounding` · `test:runtime-profile` · `prove:encoding` · `prove:no-secrets` · `prove:stage2-routes` · `tsc` · `eslint` · `next build` | ✅ **all 0** |
| `prove:stage3-authenticated` | ✅ **exit 0 — 34 PASS · 0 FAIL · 2 `NOT-RUN`**, including `S3-M2-omissions`, `S3-M5-bars` and `S3-M4-refusals` on the painted pages |
| **VISUAL acceptance, `12` · `13` · `26` · `27`** | ⛔ **`NOT-RUN` on all four.** A rendered DOM-text proof is not a visual acceptance, **and this rebuild is exactly why** |
| Migration / schema | ⛔ **NONE.** No table, column, enum, policy, grant or audit string. `attendance` was already readable by management, measured at HEAD |


---

## §12.2 — THE WALKTHROUGH DEFECTS, AND THE STANDING LIMIT OF DOM-TEXT PROOF

**Operator walkthrough, 2026-08-13.** Screen `12` correct in full; every frame match on `13`,
`26` and `27` confirmed; backend integration on `26`/`27` confirmed. **Three defects**, none of
which any green proof in this project could see.

> ⛔ **OPERATOR, FOR THE RECORD:** *"Rendered DOM proof passed on all four screens while a
> dozen chevrons were stacked inside a field and three screens had no exit. That is the standing
> limit of DOM-text proof, and it is why VISUAL acceptance stays NOT-RUN until I walk."*

▶ `innerText` reports the STRINGS a page paints. It says nothing about **where they sit** or
**what is painted on top of them**. A render tier is a proof of DATA ARRIVAL, never of layout.

### ✅ DEFECT 1 — the select chevron tiled a dozen times. FIXED

**Three causes were possible and the measurement discriminated them.** `getComputedStyle` on the
shipped markup, in headless Chrome, **before anything was changed**:

```
background-repeat: repeat  ·  background-size: auto
background-position: 0% 0%  ·  appearance: none
```

▶ **The `appearance` reset DID take**, so there is no native chevron underneath — hypotheses
(b) and (c) are both eliminated **by measurement, not by argument**. The cause is (a): the
background image **TILES**.

**Why.** `.form-field` is UNLAYERED and declares the `background` **SHORTHAND**, which resets
repeat, size and position. `@import "tailwindcss"` emits utilities into `@layer utilities`, and
an unlayered rule outranks every rule in every layer — so `bg-no-repeat`, `bg-[length:1.15rem]`
and `bg-[right_0.75rem_center]` were generated, matched, and **silently lost**. Only the chevron
survived, because it is an **inline** style.

⚠️ **THIS IS THE `F-01b` CASCADE TRAP, ALREADY DOCUMENTED IN `app/globals.css`**, in two
controls nobody had re-measured. **Fixed at the shared control** with the remedy that file
already established for `.auth-field` and `.notes-field`: an unlayered modifier
**`.form-field.select-field`**. ⛔ Written as utilities it would have looked correct in review
and changed nothing on screen — which is exactly what had happened.

### ✅ DEFECT 2 — the search magnifier did not clear. FIXED

Same trap, same file. Measured before the change: **`padding-inline-start: 14px`** —
`.form-field`'s own `padding` shorthand — while the icon sits at `left: 14px` and is `16px`
wide. Text began **exactly where the icon begins**. `pl-10` was emitted and lost. Fixed at the
shared control as **`.form-field.search-field`**. Measured after: **`40px`**.

### ⛔ NO OTHER SELECT CARRIES THE TREATMENT — measured, not assumed

`SC-3` scans every `.ts`/`.tsx` under `app`, `features`, `components` and `lib` and asserts that
**no select outside the shared control combines `form-field` with `appearance-none`** — the
combination that produced the defect. **Five raw `<select>` elements legitimately exist
elsewhere** (`management-report-review`, `management-reports-queue`, `parent-reports-list`,
`trainer-roster`, `trainer-schedule`); each was read and none carries the treatment. ⚠️ Routing
them through the shared component is a change to five screens **outside this authorization** and
was NOT done.

### ⚠️ THREE INSTRUMENT DEFECTS, FOUND AND FIXED BEFORE ANY READING WAS TRUSTED

The measurement instrument was wrong three times, and each wrong reading **looked like a product
defect**:

| # | The instrument did | It reported | Fix |
|---|---|---|---|
| 1 | took the FIRST template literal after the marker — the **wrapper `div`'s** class, not the input's | `padding-inline-start: 0px` | extract the first string that actually names `form-field` |
| 2 | scanned `<select` over **raw source including comments** | **8** files rendering a raw select; **3 were COMMENTS**, including this rebuild's own *"a `<select>` would require INVENTING one"* | strip comments first |
| 3 | extracted the class list from source **including the new fix comment**, which names `` `.form-field` `` in prose | `appearance: auto` — read as the fix having REGRESSED the product | strip comments before extraction too |

▶ **A SCAN OVER PROSE IS NOT A SCAN OVER CODE.** `AR-5` already guards it, `SC-3` guards it,
and the extractor needed it as well. **Third instance in one session.**

⛔ **AND A FOURTH: A STALE BUNDLE IS A VACUOUS MEASUREMENT.** `next start` serves whatever
`.next` already holds, so the first post-fix run measured the **previous build** and reported the
defect as still present. **`SC-BUILD` now refuses to measure a bundle older than
`app/globals.css` or `components/ui/field.tsx`** — proved firing before it was proved passing.

⚠️ **`SC-1`'s ASSERTION WAS ALSO WRONG ONCE, AND THE PRODUCT WAS NOT.** It required the
computed position to start with `right`; Chrome **resolves** `right 0.75rem center` to
`calc(100% - 12px) 50%`. An assertion written against the AUTHORED value rather than the
COMPUTED one **fails a correct fix** and would have sent the next session hunting a closed defect.

### ⛔ DEFECT 3 — REPORTED, NOT BUILT

**No back affordance on `13`, `26` or `27`.** Answered from the `.png` and corroborated against
each `.html`; **held for the Operator's ruling.** See `docs/progress/STATUS.md` for the
per-screen finding.


---

## §12.3 — STANDING RULES SET BY THE WALKTHROUGH RULING (2026-08-13)

### ⛔ RULE 1 — STRIP COMMENTS BEFORE ANY SCAN. STANDING, NOT PER-SUITE.

> **Operator:** *"Comment-stripping before scanning is now a standing requirement, not a
> per-suite habit."*

**Every scan over source — in any proof, for any purpose — runs on
`stripComments()` from `scripts/tests/portal/artefact-read-rule.mjs` first.** One
implementation, imported; never a private copy.

▶ **THREE INSTANCES IN A SINGLE SESSION**, and the third is the one to remember: the
raw-`<select>` scan reported **eight** offending files, of which **three were COMMENTS** —
including **this rebuild's own sentence saying a `<select>` would have to be invented**. The
detector matched the prose in which I had explained why I was not doing the thing it accused me
of doing. ⚠️ A scan over prose is not a scan over code, and a comment is the likeliest place
for the exact string a detector hunts for, because that is where it gets explained.

### ⛔ RULE 2 — A DOCUMENTED TRAP THAT IS NOT MECHANICALLY ENFORCED IS A TRAP THAT RECURS.

> **Operator:** *"globals.css already documented this trap and named its remedy, and the
> utilities were still written … if that check is cheap, build it: any element combining
> `.form-field` with a background or padding utility fails."*

**`F-01b` RECURRED, PLAINLY STATED.** `app/globals.css` carried a full paragraph naming the
cascade trap, explaining that Tailwind emits utilities into `@layer utilities`, that an unlayered
rule outranks them, and that `.auth-field` / `.notes-field` were the remedy — **and the next two
controls were still written with utilities.** Prose in the file being edited did not prevent the
defect it described.

✅ **`SC-6` NOW ENFORCES IT.** Any element whose class string names `form-field` alongside a
`bg-*`, `p*-` **or `border-*`** utility fails the suite, and the message names the remedy
(`.form-field.<modifier>` in `app/globals.css`) so the fix is never a guess.

⚠️ **BORDER IS INCLUDED THOUGH THE RULING SAID *"background or padding"***: `.form-field`
declares all three as shorthands, and naming two of the three would leave the third to recur.

✅ **IT PAID FOR ITSELF ON ITS FIRST RUN**, finding two live losses on the search control that
neither the walkthrough nor any DOM proof had caught — measured, then fixed:

| | Frame draws | Rendered before | After |
|---|---|---|---|
| fill | `var(--surface-card, white)` | **`rgb(244, 245, 249)`** — `bg-surface` lost | `rgb(255, 255, 255)` |
| hairline | `outline: 1px #EDEFF4` | **`rgba(0, 0, 0, 0)`** — `border-line` lost | `rgb(237, 239, 245)` |

---

## §12.4 — THE BACK AFFORDANCE: AN OPERATOR ADDITION THE FRAMES DO NOT DRAW

> **Operator ruling, 2026-08-13:** *"The frames omit it. I am authorizing an addition the frames
> do not draw, because a screen a user cannot leave is a usability defect and the design set not
> catching it does not make it correct."*

⛔ **CITE IT AS SUCH — it is recorded in all three components so a later visual pass does not
remove it for fidelity.** A frame comparison will find an element the frame lacks; that is
**EXPECTED and RULED**, exactly as a `REGISTERED-OMISSION` is expected in the other direction.

**The control is the product's EXISTING one**, extracted rather than invented:
`components/ui/back-link.tsx`, taken from `trainer-roster` ("Back to Schedule") and
`trainer-assessment` ("Back to Student Roster") — whose class strings were **byte-identical**,
measured before the move, so both were re-pointed with **provably zero visual change**.
▶ Creating a shared component and leaving the originals inline would have made **four**
definitions of one control.

⚠️ **ONE CALL SITE IS DELIBERATELY NOT RE-POINTED AND IS REPORTED, NOT NORMALISED.**
`trainer-draft-generation.tsx` carries a **variant** (`rounded-field`, `text-body`, `font-bold`),
not a copy. Re-pointing it would **change a Part 1 screen's appearance**, which needs its own
ruling.

| Screen | Back target | Why |
|---|---|---|
| `13` | → `12` | the class list it was opened from |
| `26` | → `12` | same |
| `27` | → **`13`** | **the class it edits**, which is where Edit is entered from — and the ONLY inbound route to `27` |

⛔ **THE BREADCRUMB IS NEITHER REMOVED NOR DUPLICATED.** It stays as drawn on all three.

---

## §12.5 — `F-01b` ONE STATE DEEPER, AND THE HALF THE FIRST FIX COULD NOT SEE

> **Operator, 2026-08-13:** *"the chevron tiling returns ON HOVER … Base state is correct; only
> hover regresses … MEASURE IT, do not assume … ⚠️ SC-6 did not catch this, and that is the more
> important half."*

### ⛔ THE PRODUCT DEFECT — MEASURED, THEN EXPLAINED, IN THAT ORDER

`CSS.forcePseudoState` — DevTools' own *Force element state* — was used so the BROWSER resolved
the cascade rather than a model of it in JavaScript. **Measured at HEAD before anything changed:**

| State | `background-repeat` · `-size` · `-position` | |
|---|---|---|
| rest | `no-repeat` · `18.4px` · `calc(100% - 12px) 50%` | ✅ |
| **`:hover`** | **`repeat` · `auto` · `0% 0%`** | ⛔ **REGRESSED** |
| `:focus` · `:disabled` · `[aria-invalid]` | `no-repeat` · `18.4px` · `calc(100% - 12px) 50%` | ✅ survived |

**The arithmetic explains the hover-only shape exactly.** `.form-field:hover:not(:disabled)` is
**`(0,3,0)`** and beats `.form-field.select-field`'s **`(0,2,0)`** unconditionally. The other
three states are themselves `(0,2,0)` and lose to the modifier **on source order alone** — the
modifier sits later in the file. ▶ **Three of the four were saved by line ordering, not by
design**, which is why fixing only the reported state would have been the wrong repair.

✅ **THE FIX IS AT THE ROOT, NOT AT THE SYMPTOM.** The `background` SHORTHAND is removed from the
base `.form-field` rule **and from all four state rules**, replaced by `background-color`.
⚠️ Chasing it with a `.form-field.select-field:hover` rule would have fixed **one** state and
left the next state rule anyone adds to break it again.

**The change is provably safe for every existing consumer rather than assumed to be:** `SC-4`
proves no component outside the shared control paints its own background image, and `SC-6` proves
no element combines `.form-field` with a `bg-*`, `p*-` or `border-*` utility. Nothing relied on
the shorthand's resets.

### ⛔ RULE 2 EXTENDED — VARIANTS, AND THE STYLESHEET ITSELF

`SC-6` scans **component class strings**. This defect lived in a **CSS state rule**, where no
class string could ever have revealed it. Widening `SC-6` was necessary and **not sufficient**.

| Leg | What it now measures | Its control |
|---|---|---|
| **`SC-6`** | class strings, **now including variant prefixes** — `hover:bg-*`, `focus:p*-`, `disabled:border-*`, `focus-visible:*`, stacked forms | **`SC-6c`** plants 5 offenders, **2 of them state variants**, exactly as the ruling required |
| **`SC-9`** | **`app/globals.css` itself** — no `.form-field` STATE rule may use the `background` / `padding` / `border` SHORTHAND | **`SC-9c`** plants the defect's own shape; the longhand state rule and the base rule beside it must **not** match |
| **`SC-9b`** | no element carries **two** `.form-field` modifiers | **`SC-9bc`** plants a two-modifier element |
| **`SC-7`** ×4 | the chevron geometry under **hover, focus, disabled and invalid** | **`SC-8c`**, below |
| **`SC-8`** | the search control's fill and hairline **under hover** | **`SC-8c`** |

⚠️ **`SC-9` IS NARROWER THAN A BLANKET BAN, AND THE NARROWING IS ARITHMETIC RATHER THAN
CONVENIENCE.** A first cut barred the shorthand everywhere and failed on two provably harmless
rules: the base `.form-field` at `(0,1,0)`, which **loses** to every modifier and is the value
modifiers exist to override; and `.form-field.notes-field`, a modifier declaring its **own**
padding. A STATE rule is different in kind — it co-applies with whatever modifier is present
**and outranks it**. ⛔ **The exemption is not taken on trust: `SC-9b` measures that the
two-modifier case cannot arise.**

### ⛔ THE OPERATOR'S SECOND QUESTION, ANSWERED BY MEASUREMENT

*"were `bg-surface` and `border-line` also lost in any state variant, or only at rest?"* —
**Only at rest.** Measured under forced hover: `border-color` = `rgb(237, 239, 245)`, the hairline
**survives**. The fill moves to `rgb(238, 240, 246)`, which is the product-wide `.form-field:hover`
tint and is **DESIGNED, not a loss**.

### ⛔ A SIXTH INSTRUMENT DEFECT — AND `SC-8c` IS THE ONLY REASON IT WAS SEEN

The first post-fix run reported **`SC-7-hover` PASS and `SC-8` PASS**. Both were **VACUOUS**.

`.form-field` declares `transition: … background-color 160ms ease`, and `getComputedStyle`
returns the **currently animated** value — so a read taken immediately after forcing `:hover`
returns the value from **before** the hover. Indistinguishable, in the output, from a forced state
that never applied.

▶ **It also explains why the earlier run looked sound.** Before the root fix the hover rule used
the SHORTHAND, and `background-repeat` / `-size` / `-position` are **not** in the transition list —
they snapped instantly, so the tiling was measurable at once. **The moment the fix left only
`background-color` changing, every state read went silently stale.** The suite now waits out the
transition.

⛔ **`SC-8c` FAILED FIRST AND FAILED LOUDLY**, on a bare `.form-field` whose hover tint is known:
`rgb(244, 245, 249)` → `rgb(244, 245, 249)`, i.e. no change. It now reads
`rgb(244, 245, 249)` → **`rgb(238, 240, 246)`**. ⚠️ **A state suite without a control proving the
forcing applies is not a weaker measurement — it is not a measurement at all**, and it would have
shipped as a clean green run.

**A seventh, caught the same way:** six proof scripts were invoked as `prove:p2-*` and all six
exited non-zero. **The scripts are named `prove:portal-p2-*`; nothing was failing.** ▶ A
non-zero exit from a name that does not exist reads exactly like a regression, and only checking
`package.json` separated them.

### ✅ TWO MEASURED DRIFTS, RULED AND FIXED

1. **`13`'s breadcrumb was BELOW its title; the frame draws it ABOVE** (`11.50px`, `gap: 3px`,
   then the `22px` title). Fixed. ⚠️ `26` and `27` are **not** the same case — their frames
   genuinely draw it BELOW, at `12.50px`, and they were left alone.
2. **`12` rendered NO breadcrumb at all**, though its frame draws `Management / Classes`. Fixed.
   > **Operator:** *"My acceptance of `12` was a walkthrough, not a measurement, and your
   > measurement supersedes it."*

Both are carried by a new **`breadcrumb`** slot on `PageHeading`, rendered above the title.
⚠️ A **second** above-title slot, deliberately not `eyebrow`: `eyebrow` is an uppercase
brand-coloured LABEL with four live consumers, and this is a muted navigational PATH carrying a
link.

---

## 11. Completion states

`NOT_STARTED` · `IN_PROGRESS` · `BLOCKED` · `AWAITING_OPERATOR` · `IMPLEMENTED_AWAITING_VERIFICATION` · `PASS` · `SUPERSEDED`

⚠️ **`PASS` is an evidence verdict; `Accepted` is the Operator's and only the Operator's.** A session never accepts its own work, and **code existing is not work being complete**.

**`P1-1a`, `P1-1b` and `P1-1c` are `PASS` — executed and committed 2026-08-11, making `D-1` the first of the five portal decisions to reach a surface. ⚠️ `PASS` is the session evidence verdict; `Accepted` is the Operator's (§14.1, §15.6). `P1-2` is `PASS` for its substrate with its **upload transport outstanding**, and `P1-5`'s blocker `A-002` is **RESOLVED** — it now awaits its own authorization rather than a ruling.**


---

## §12.6 — `P2-5` (SCREEN `25` MANAGEMENT SCHEDULE): A PROJECTION, AND NO MIGRATION

**Route:** `/management/schedule`, canonical. ⛔ **NO MIGRATION, NO RPC, NO POLICY, NO GRANT, and
the audit registry is UNMOVED at 21** — a read is not a governed action (`A-029`).

### The schema question, answered by measurement before anything was written

All six tables the projection touches — `class_sessions`, `class_modules`, `class_grades`,
`class_session_assignments`, `centre_memberships`, `accounts` — carry a management `SELECT`
policy **and** a matching `authenticated` `SELECT` grant. ▶ That is why screen `25` is a direct
RLS-scoped read like screen `12`, and not the two `SECURITY DEFINER` reads screen `13` needed,
where `reports` and `observations` carry **zero of both**.

⚠️ **`class_sessions.room` ALREADY EXISTS** — `text`, nullable, written by `26` and `27`. The
frame's `Studio 2` needed no column.

### ⛔ `GC-13` DISCHARGED, AND IT REACHED FURTHER THAN THE REGISTER'S WORDING

The register bars *"a second event entity"*. Measured in the `.html`, `Showcase` is **also** a
badge **and a THIRD chip treatment** (`#DCF2F3` / `#3FBAC2`) on the 5:00 PM chip — the same
session the details panel labels `Showcase`. ▶ **The colour ENCODED the barred type.** None of the
three is built, and the bar is structural: `session_type`, `event_type` and `showcase` return
**zero columns** across the schema.

### ⚠️ THE `.md` NEVER MENTIONS `Showcase` — §7.4.1 EARNS ITSELF AGAIN, MEASURED

This pack's prose note lists *"Lesson cards with date, time, room, assigned Trainer, and Trainer
Assistant (TA)"* and **names `Showcase` nowhere**. ▶ A build derived from the note would have
missed the frame's second badge and its third chip colour entirely **and reported a clean match**.
The `.png` is the only artefact in which it is visible. ⚠️ This is the first phase since §12.4
where the three-artefact rule was followed, and it caught something on its first outing.

### `REGISTERED-OMISSION`s — preserved and cited

| Frame draws | Ruling | Ends |
|---|---|---|
| `Showcase` badge + its chip colour | `GC-13`, `A-016` | **NEVER** |
| `Assist.` / `Asst.` | `A-014`, `G-7` — and `trainer_role` **IS** `centre_membership_role`, so an assistant is **INEXPRESSIBLE** | **NEVER** |
| `Main:` prefix | consequence of the row above | **NEVER** |
| `Junior` | `A-016` / `A-026` / `A-054` | **NEVER** |

⚠️ **`Studio 2` IS NOT ON THAT LIST.** `room` exists and is NULL, so the element is **omitted by
hero 0B** — nothing is refused and the row appears the moment a session carries one.

### Two judgement calls, stated so they can be overturned rather than discovered

1. **The month control's contents.** The frame draws a chevron and enumerates nothing — the
   screen-`12` `···` shape. Built, because unlike the `···` the FUNCTION is unambiguous and a
   calendar that cannot change month is unusable. Its contents are **measured**: the months this
   centre demonstrably has sessions in. ⛔ No guessed range.
2. **Chip colour.** Hue per Class Module, deterministic, **cycling**, carrying no meaning — stated
   because a reader who took colour for a session type would be reading back the barred concept.

### `prove:portal-p2-5` — 7 SQL legs + 12 runner checks, exit 0

⛔ **`P25-4` is the leg that matters**: it fails the day either layer disappears, which is the
only thing standing between this screen and a silently empty calendar.

⚠️ **AND ITS FIRST DRAFT FAILED A CORRECT PRODUCT.** It required each table to carry a policy
whose NAME contained `management`, and `class_grades_select_active_member` is deliberately an
active-member policy. ▶ **A NAME IS NOT A PERMISSION.** Rewritten to read each table AS a
management caller under RLS — strictly stronger, because a policy named `..._management` that
excluded management would have passed the name test. *(Same defect class as the `SC-1` assertion
written against an AUTHORED rather than a COMPUTED value.)*

⚠️ **ITS CONTROL RAISED RATHER THAN RETURNING ZERO**, and that is sharper than what was written
for: `reports` carries no client grant, so the read is refused at the **PRIVILEGE** layer and
never reaches RLS. `CLAUDE.md` §6.1 — privilege and policy are two layers, and a missing grant
must never be misdiagnosed as an RLS failure. The abort was correctly reported as **3 of 7 legs
executed**, not as a pass.

---

## §12.7 — FOUR SUITES WENT RED. ONE WAS MINE; THREE WERE THE OPERATOR'S WALKTHROUGH

⚠️ **MEASURED, NOT ARGUED.** The walkthrough's own audit rows are timestamped
**06:55–06:56 on 2026-08-13** — `admin.module_created` ×1, `admin.session_created` ×13,
`admin.trainer_assigned` ×13, `admin.module_updated` ×1 — all **before** commit `3431981` at
08:02:34. `P2-5` adds no migration and no write path, proved mechanically by `P25a-NOMIG` and
`P25a-PROJECTION`.

| Suite | Cause | Repair |
|---|---|---|
| `prove:portal-p2-1` | **MINE** — the route ratchet, 19 → 20 | Pin **REWRITTEN, not deleted**, and `/management/schedule` added to the nav expectation table. *"Every new screen deliberately edits this line — that is the ratchet, not friction."* |
| `prove:encoding` | Operator created `Beginner -  Dance` through screen `26`, typed with a HYPHEN | ⛔ The suite demanded **every** module title contain U+2014 — i.e. that the product REJECT a title a user types without one. **Scoped to the SEEDED titles**; `E-2`'s mojibake check still runs over **every** row, including the Operator's |
| `prove:portal-p2-2-create` | 13 `admin.trainer_assigned` events from the walk | ⛔ **THE PHASE-SCOPED-CLAIM DEFECT, FOURTH INSTANCE.** `P23-9` counted every `admin.trainer_assigned` event **that has ever existed**, to claim the two CREATE RPCs assign nobody. Rewritten as a **DELTA** — what it always meant. ⚠️ Its prose was corrected too: *"assignment needs a THIRD string"* was **superseded by `P2-2b`** |
| `prove:hero-7` | the walk assessed the last learner who qualified | ⛔ `P7-6` needs an enrolled learner **without** an observation, and a legitimate walkthrough CONSUMED its precondition. **The case is now PLANTED** inside the rolled-back transaction — the `P26-6` remedy. ⚠️ It reported `FAIL`, not `PASS`, which is the only reason it was found |

▶ **THE PATTERN WORTH KEEPING: three suites encoded a snapshot of the fixture as if it were a
rule.** Each survived only while nobody used the product. A suite that a legitimate walkthrough
can turn red is measuring the fixture, not the behaviour — and the repair is always to scope the
claim to what it actually meant, never to relax it.

---

## §12.8 — A SUITE THAT PINS FIXTURE CONTENT RATHER THAN A GOVERNED RULE

> **Operator ruling, 2026-08-13:** *"THE THREE RED SUITES ARE ONE CLASS AND I WANT IT NAMED. Each
> had encoded a snapshot of the fixture as if it were a rule, and each survived only while nobody
> used the product … Distinguish 'this is what the fixture happens to hold' from 'this is what the
> system must enforce', and pin only the second."*

### ⛔ THE RULE

**A suite may pin a GOVERNED RULE. It may not pin what the fixture HAPPENS TO CONTAIN.**

A content pin is invisible while the product sits unused, because the fixture is the only writer.
The moment anyone exercises the product — a walkthrough, a demo, a UAT session — the pin fires.
▶ **And it fires looking exactly like a regression**, which is the expensive part: the next
session spends its time hunting a defect in code that is behaving correctly.

**Before writing an assertion, answer which of the two it is:**

| | *"what the fixture happens to hold"* | *"what the system must enforce"* |
|---|---|---|
| Written as | a literal count, a total, an exact set, a specific string | a **delta**, an **invariant**, a **refusal**, a **shape** |
| Broken by | somebody using the product | a real defect |
| Correct response when red | **scope the claim to what it meant** | **fix the product** |

⚠️ **THE REPAIR IS NEVER TO RELAX THE CHECK.** Every one of the three below came back **stronger**
than it went in, because scoping a claim to what it actually meant removes the accidental half and
leaves the load-bearing half exposed.

### ⛔ `prove:encoding` IS THE CLEAREST CASE — A TEST ASSERTING A DEFECT

> **Operator:** *"demanding every module title contain an em dash required the product to REJECT a
> title typed with a hyphen — a test asserting a defect."*

It required **every** `class_modules.title` to contain `U+2014`. Stated as a product rule, that is:
**the system must REJECT a class title a user types with a hyphen.** No such rule exists, none was
ever proposed, and building one would be a defect.

▶ **The suite was not merely over-tight — it was asserting the wrong behaviour**, and it would have
kept asserting it until somebody typed a title. The Operator did, at 06:56 on 2026-08-13
(`Beginner -  Dance`, through screen `26`).

**Repaired:** the em-dash claim is scoped to the **seeded** titles, identified by their stable
`Fixture Module` marker with the count still pinned so it cannot become zero. ⛔ **`E-2`'s
mojibake check still runs over EVERY row, including the Operator's** — that is the leg that
actually protects encoding, and it is untouched.

### ⛔ `P23-9` — THE PHASE-SCOPED-CLAIM DEFECT, FOURTH INSTANCE

Recorded with the other three (§12's census split, and the three `P2-2`-era suites that pinned the
audit registry TOTAL). `P23-9` claimed *the two CREATE RPCs assign nobody* and wrote it as
`count(*) FROM audit_events WHERE action = 'admin.trainer_assigned' = 0` — **a global count of
every such event that has ever existed**.

It was true the day `P2-2` shipped and became false **twice**: `P2-2b` BUILT assignment under its
own Operator ruling, and the walkthrough then fired 13 more.

**Repaired as a DELTA** across the suite's own transaction — which is how the
`class_session_assignments` half of the very same `IF` was already written. ⚠️ Its prose was
corrected rather than deleted: *"assignment needs a THIRD string the Operator did not name"* is
**superseded by `P2-2b`**, where the string turned out to be already ratified.

### ⛔ `P7-6` — THE SAME FAMILY FROM THE OTHER DIRECTION

> **Operator:** *"the same family from the other direction — and it said FAIL rather than PASS,
> which is the only reason it surfaced."*

`P7-6` does not pin fixture content; it **depends on a fixture SHAPE** — an enrolled learner with
no observation on the session. The walkthrough legitimately **consumed its precondition** by
assessing the last learner who qualified.

▶ **A precondition a legitimate walkthrough can consume is a precondition that will keep
disappearing.** The established remedy applies unchanged: **PLANT the case inside the rolled-back
transaction** (`P26-6`, `P26-8`, `P24`'s second trainer).

⚠️ **IT REPORTED `FAIL`, NOT `PASS`, AND THAT IS THE WHOLE REASON IT WAS FOUND.** A leg that
cannot run is `NOT-RUN`, never `PASS` — the rule that has now paid for itself in four separate
places: the docker-stopped runner, `SC-8c`'s vacuous forced hover, this leg, and `S3-00` refusing
to report a green Stage 3 against an unreachable stack.

### The test to apply to a new assertion

1. **Say the assertion out loud as a product rule.** *"The system must reject a title typed with a
   hyphen"* fails immediately. If the sentence is absurd, the pin is on fixture content.
2. **Ask what a legitimate user action would do to it.** If a walkthrough turns it red, it is
   measuring the fixture.
3. **Prefer a delta to a total**, a refusal to a count, a shape to a string.
4. **If it must pin content, scope it to the SEEDED set** and pin the count so it cannot silently
   become zero.

---

## §12.9 — §7.4.1 EARNED ITSELF ON ITS FIRST OUTING

> **Operator ruling, 2026-08-13:** *"The GC-13 finding is the significant one: the register bars a
> second event entity, and the frame also encodes it as a badge and a third chip colour that the
> .md never mentions. A note-derived build would have missed both and reported a clean match.
> Record §7.4.1 as having earned itself on its first outing."*

**Recorded.** `CLAUDE.md` §7.4.1 — the artefact contract — was written on 2026-08-13 after four
consecutive phases derived their layouts from a prose `.md`. **`P2-5` is the first phase executed
under it, and it caught something immediately.**

| Artefact | What it said about `Showcase` |
|---|---|
| the pack's **`.md`** | ⛔ **NOTHING.** It lists *"Lesson cards with date, time, room, assigned Trainer, and Trainer Assistant (TA)"* and names `Showcase` **nowhere** |
| the **`.png`** | a second badge on the second details card |
| the **`.html`** | ⚠️ **a THIRD chip treatment** — `#DCF2F3` / `#3FBAC2` — on the 5:00 PM chip, distinct from the pink `#FCE7F0`/`#EC4B96` and the teal `#B5E5E8`/`#2B8F96` |

▶ **The colour ENCODED the barred type.** The `GC-13` register bars *"a second event entity"*; the
frame carries the same concept in **two further places the register does not name**, and the
`.md` — the artefact four previous phases were built from — mentions **neither**.

⛔ **A note-derived build would have shipped both and reported a clean match.** It would not have
been caught by any proof this project runs: a rendered-DOM leg asserts that strings appear, and
these are a badge and two hex values.

**The general form, worth keeping:** ▶ **a prose note lists what a screen CONTAINS; it does not
enumerate what a screen ENCODES.** Colour, position, weight, adjacency and shade carry meaning
that prose has no obligation to mention — and `Showcase` is the case where the meaning was
governance-bearing. **The `.md`'s silence about an element is not evidence the element is absent**
(§7.4.1), and this is the first measured instance of that clause mattering.

---

# §13 — `P2-6` · SCREEN `14` LESSON PLAN MANAGEMENT · ⛔ THE `C-7` STATEMENT, STOPPED FOR AUTHORIZATION

**Route (ratified):** `/management/classes/[classModuleId]/lesson-plans` · **Figma** `760:2`
**Artefacts opened:** `reference/Management - Lesson Plan Management/` `.png` **and** `.html`, and
the numbered pack's `screen.md` (§7.4.1).

⚠️ **ONE MEASUREMENT LIMIT, STATED UP FRONT.** Docker Desktop stopped between the `P2-5` boundary
and this statement, so the live database was **not** re-measured for this phase. Everything below
is read from the **migration files at HEAD** plus measurements taken earlier in the same session
while the stack was up (census `29 · 29 · 56 · 12 · 30 · 21`). ⛔ **The at-HEAD re-measurement is
OWED before any migration is written**, and the authorization should be read as conditional on it.

---

## 13.1 What the `.png` draws

Breadcrumb `Classes / Junior · Public Speaking / Lesson Plans` · title `Lesson Plan Management` ·
a **`← Class Overview`** back control (this frame *does* draw one) · a header card with avatar,
`Junior · Public Speaking`, the meta line
`6-week persuasive speaking unit · Tue & Thu · 3:00–4:00 PM · Studio 2 · 12 learners`, and a
`Term 1 · 2025` selector · `Weekly Lessons` with a `Completed / This week / Upcoming` legend ·
then one card per lesson carrying a `LESSON n` pill, title, `Tue 25 Feb · Studio 2`, a status
badge, a **`KEY FOCUS POINTS`** chip row, a **`SLIDES & MATERIALS`** file list
(`PPTX`/`PDF`/`KEY` type chip · name · size · a download glyph), an
**`Upload slides & materials`** button, and a dashed **`Slides not uploaded yet`** empty state.

⚠️ **The frame draws TWO files on Lesson 3** (`Vocal Warm-ups`, `Lesson 3 – Projection`). Materials
are **many-per-session**, unlike evidence's ratified one-per-report.

⚠️ **The last card reads `WEEK 5` where the other four read `LESSON n`.** Measured in the `.html`,
not inferred. Treated as a frame inconsistency; the build uses `LESSON n` throughout and records
the divergence.

## 13.2 What needs NO new schema — measured, not assumed

| Frame element | Source at HEAD |
|---|---|
| lesson number, lesson title | `class_sessions.lesson_number`, `.lesson_title` (both exist, nullable) |
| date, `Studio 2` | `class_sessions.session_date`, `.room` |
| `Tue & Thu`, `3:00–4:00 PM` | derived from the module's sessions — screen `13` already does exactly this |
| `12 learners` | `enrolments` |
| `Term 1 · 2025` | `terms` (shipped at `P2-2`) |
| `Completed` / `This week` / `Upcoming` | **deterministic** from `session_date` vs today. No column, no enum |
| the back control | `components/ui/back-link.tsx` |

## 13.3 ⛔ THE SCHEMA ASK — counts stated in advance

**`1` table · `1` bucket · `1` storage policy · `0` table policies · `0` client table grants ·
`4` RPCs · `4` `EXECUTE` grants · `0` enums · audit registry `21 → 22`.**

### One table — `public.class_session_materials`

| Column | Type | Note |
|---|---|---|
| `id` | `uuid` PK `DEFAULT gen_random_uuid()` | |
| `class_session_id` | `uuid NOT NULL` | `D-4`: materials belong to a **specific class session**, never to the class generally |
| `centre_id` | `uuid NOT NULL` | |
| `storage_object_path` | `text NOT NULL` | |
| `display_name` | `text NOT NULL` | the frame draws `Lesson 1 – Intro to Persuasion`, which is **not** the file name |
| `media_type` | `text NOT NULL` | drives the `PPTX`/`PDF`/`KEY` chip |
| `byte_size` | `bigint NOT NULL` | the frame draws `4.2 MB` |
| `uploaded_by_account_id` | `uuid NOT NULL` | durable actor FK, `RESTRICT` (`A-029`) |
| `uploaded_by_membership_id` | `uuid NOT NULL` | durable actor FK, `RESTRICT` |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` | |

**Constraints:** composite FK `(class_session_id, centre_id) → class_sessions (id, centre_id)`
`ON DELETE RESTRICT` — ✅ **`class_sessions_id_centre_key` already exists**, so no extra object is
needed and centre drift is **unrepresentable** rather than merely checked · `UNIQUE
(storage_object_path)` · `CHECK (byte_size > 0 AND byte_size <= <the ruled ceiling>)`.

⛔ **NO `UNIQUE (class_session_id)`** — the frame draws two files on one lesson. This is the one
deliberate divergence from the `report_evidence` template, and it is the frame's own.

### One bucket — `lesson-materials`

Private, its own `file_size_limit`, its own `allowed_mime_types`. ⛔ **SEPARATE FROM `evidence`** —
Authority Lock §8.2: *"separate media classes requiring separate buckets and separate policies —
do not fold them into the evidence bucket."*

### Policies and grants — the ratified evidence shape, unchanged

- **`0` RLS policies and `0` client grants on `class_session_materials`.** Everything reads and
  writes through reviewed `SECURITY DEFINER` RPCs, exactly as `report_evidence` does.
- **`1` policy on `storage.objects`** — `lesson_materials_objects_insert_management` — so the
  browser can upload directly, the `P1-2b` transport pattern.

### Four RPCs

| RPC | Caller | Does |
|---|---|---|
| `material_list_for_session(uuid)` | management **and** trainer | the file list. `D-4`: management uploads, **trainers download** |
| `material_attach_confirm(...)` | management only | turns an uploaded object into an accepted row |
| `material_signed_url(...)` | management **and** trainer | mints the short-TTL download URL |
| `material_remove(uuid)` | management only | ⚠️ **conditional — see 13.4 decision 1** |

### Audit registry `21 → 22` — exactly one string

**`material.attached`** — a governed Management upload has become an accepted material row.

⚠️ **The name follows `evidence.attached`'s ratified reasoning** (`C-4`): no authorized workflow
leaves an object unattached, so **the upload IS the attach**, and `A-029`'s one-event-per-action
rule forbids a second name for one action.

⛔ **This is a fresh stop-and-ask in its own right.** `A-057`'s evidence extension is spent and
does not licence a new family.

## 13.4 ⛔ THREE THINGS I CANNOT DECIDE

### Decision 1 — is removal built?

**The frame draws NO delete control** — the file rows carry a download glyph and nothing else.
The established discipline (the `27` day strip, unassign) says an undrawn, unratified control is
**not built**.

⚠️ **But the consequence is sharper here than there:** a wrongly-uploaded file could never be
removed, by anyone, ever. `D-5` expressly ruled that evidence **can** be removed for exactly this
reason.

▶ **Recommendation: BUILD IT**, `material.removed` making the registry `21 → 23`. **Your call.**

### Decision 2 — does a download emit an audit event?

`evidence.accessed` fires on every signed-URL mint because the object is **a child's video**.
A lesson slide deck is **teaching material, not personal data**, and `A-029` plus the `P2-4`
precedent hold that **a read is not a governed action**.

▶ **Recommendation: NO string.** Registry stays where decision 1 leaves it. **Your call.**

### Decision 3 — ⛔ NEW-QUESTION, AND A HARD STOP: WHO AUTHORS `KEY FOCUS POINTS`?

`D-4` permits the chips and states their **purpose** — *"to give a trainer a quick refresher on
what the session covers, before class"* — and their **position constraint**. It does **not** say
who writes them or through which surface. **The frame draws them read-only on `14`: there is no
edit affordance anywhere in it.**

⛔ **I will not infer an author.** Three things follow and none is mine to pick:

1. If Management authors them, `14` needs an edit control the frame does not draw.
2. If nobody authors them, the column is always empty, hero 0B omits the whole block, and the
   feature is **vacuous** — which is worse than absent, because the frame implies it works.
3. Whichever way it goes, it decides whether this phase also adds **`class_sessions.key_focus`**
   (`text[]`, `1` column) — which is **not** in the 13.3 counts above and would change them.

⚠️ **`observations.focus_chips` IS NOT THIS FIELD and must not be reused for it.** That is the
trainer's **post-session** observation; `KEY FOCUS` is **lesson-plan intent**. `G-3` is explicit
that they are different fields with different authority, and conflating them is the invisible
substitution `D-4`'s position constraint exists to prevent.

## 13.5 What is NOT built regardless

| Frame element | Why |
|---|---|
| **`6-week persuasive speaking unit`** | a module description. **No column, no entity** — the `C-14` family (`Class code`, `Capacity`, `Program`). `A-022`: do not schema a field from a frame. **`REGISTERED-OMISSION`** |
| **KEY FOCUS in or adjoining a governed carried-forward focus line** | `D-4`'s hard constraint · `G-3` · protects §10 Phase 1 exit condition **(c)**. ⛔ On `14` there is no such line, so the constraint is satisfiable — and the check must still be **structural**, because the substitution is invisible on the rendered page |
| **`WEEK 5`** | a frame inconsistency; `LESSON n` throughout, divergence recorded |
| any rating, roll-up or `Overall Grade` | `C-9`, `G-2` |
| `Assist.` / TA anything | `A-014`, `G-7` |

## 13.6 Status

⏸ **`AWAITING_OPERATOR`.** ⛔ **No migration is written, no file is created, and no count above is
acted on until the Operator authorizes — including the three decisions in 13.4 and the owed
at-HEAD re-measurement in the preamble.** This discharges the *statement* half of `R-7`; the
authorization half is the Operator's.

---

## §13.7 — THE THREE RULINGS, THE RE-MEASUREMENT, AND THE ONE THING STILL STOPPED

**Operator, 2026-08-13.** Three rulings received; the schema is **AUTHORIZED as stated, plus
removal**. ⛔ **One item remains stopped by the Operator's own instruction: the bucket size limit.**

### The three rulings, recorded

| # | Ruling | Effect |
|---|---|---|
| **1 · REMOVAL** | ✅ **BUILD IT. Registry `21 → 23`. Management only.** *"The `27` day-strip discipline protects against destroying GOVERNED RECORDS — removing a session discards attendance, observations and reports. A lesson slide deck is none of those. And a file nobody can remove is a worse outcome than an undrawn control, which is the same reasoning that made `D-5`'s evidence removable."* ⛔ **Cited in the component as an OPERATOR ADDITION ON THE SAME GROUNDS AS THE BACK AFFORDANCE** — the frame omits it and the Operator authorized it anyway, so a later visual pass does not remove it for fidelity | `material.attached` + `material.removed` |
| **2 · DOWNLOAD EVENT** | ✅ **NO STRING.** *"Your `P2-4` precedent decides it. `evidence.accessed` fires because the object is a child's video and the mint is the only trace it existed. A slide deck is teaching material — no child's data, no privacy surface — and `A-029` holds that a read is not a governed action."* | registry stays at **23** |
| **3 · `KEY FOCUS POINTS`** | ⛔ **RAISED AND DECLINED — DO NOT BUILD.** *"`D-4` gave them a purpose and a position constraint and never named an author. There is no authoring surface in the ratified inventory and the frame draws them read-only. Building a read for a field nobody can write produces a permanently empty panel — worse than absent."* **No `class_sessions.key_focus`. Not a fifth object.** ▶ **Recorded as DECLINED WITH THE REASON so a later phase does not read `D-4`'s mention as licence.** If the academy later names an author, it **returns as its own question with its own schema authorization** | no column, no chips |

### ✅ THE CONDITIONAL HELD — re-measured at HEAD, 2026-08-13, Docker back up

⚠️ **The Operator's authorization was conditional on this.** Every figure §13 stated from migration
files is confirmed against the live database. **Nothing differs.**

| Claim in §13 | Measured at HEAD | |
|---|---|---|
| census `30 · 29 · 56 · 12 · 30 · 21` | `30\|29\|56\|12\|30\|21` | ✅ identical |
| `class_sessions_id_centre_key UNIQUE (id, centre_id)` exists | present | ✅ no extra object needed |
| `class_session_materials` does not exist | `ABSENT` | ✅ |
| only the `evidence` bucket exists | one row: `evidence` | ✅ |
| `evidence` is private, limit `104857600` | `public=false`, `104857600` | ✅ |
| **`P1-2`'s bucket invariant** | `public_buckets=0`, `null_limit=0` | ✅ **holds, and the new bucket must preserve it** |
| one `storage.objects` policy | `evidence_objects_insert_authoring_trainer` (INSERT) | ✅ |
| `terms` exists | `EXISTS` | ✅ |
| registry is exactly 21, no `material.*` | 21 strings, `material%` → `none` | ✅ |
| `class_sessions` has no `key_focus` | absent | ✅ and it stays absent (ruling 3) |

⚠️ **ONE ADDITION, NOT A CONTRADICTION.** `class_sessions` also carries
`class_sessions_id_module_key UNIQUE (id, class_module_id)`, which §13 did not mention. It changes
nothing — the composite FK uses the centre key — and is recorded so the next reader does not
think a key appeared.

### ⛔ §13.8 — THE BUCKET SIZE LIMIT: PROPOSED, NOT SET

> **Operator:** *"Tell me the size limit you propose and why BEFORE setting it. These are
> documents, not video, so 100 MiB is probably wrong in both directions."*

**PROPOSED: `25 MiB` = `26214400` bytes.** Four reasons, in the order they carry weight.

**1 · The only empirical anchor the project has says `1.8 – 4.2 MB`.** The frame's four sample
files, measured in the `.html`: `4.2 MB` (PPTX) · `1.8 MB` (PDF) · `2.6 MB` (KEY) · `3.9 MB`
(PPTX). ⚠️ **This is evidence about MAGNITUDE, not a schema'd field** — `A-022` bars deriving a
field from a frame, and a ceiling the Operator rules is not that. `25 MiB` is **~6× the largest
sample**, which is headroom for an image-heavy deck rather than a number fitted to the samples.

**2 · It keeps Lock §8.2's media-class separation ENFORCEABLE BY THE BUCKET ROW.** A ~100 MiB
"document" is almost certainly carrying **embedded video** — which is the evidence media class,
governed by `D-5`, `A-001` and a different bucket with different policies. ▶ A limit that admits
video into the documents bucket makes the separation depend on **who uploads what**, when §8.2
exists precisely so it does not.

**3 · The recoverable direction is UP.** Raising a bucket's `file_size_limit` is a one-row
`UPDATE` with no data migration and no orphaned objects. Lowering it after files exist blocks
re-upload of material that was legitimately accepted. **Starting lower is the reversible choice.**

**4 · It reads as a different media class at a glance.** A quarter of `evidence`'s `104857600`,
so a reader comparing the two bucket rows **sees** that they hold different things — rather than
two identical numbers that invite folding them together.

⛔ **NOT SET. Awaiting the Operator's figure.**

### ⚠️ §13.9 — A SECOND BUCKET-ROW FIELD I WILL NOT SET SILENTLY

`allowed_mime_types` is on the same row and was not in the Operator's instruction. The frame draws
exactly three type chips — **`PPTX`, `PDF`, `KEY`** — which map to:

| Chip | MIME |
|---|---|
| `PPTX` | `application/vnd.openxmlformats-officedocument.presentationml.presentation` |
| `PDF` | `application/pdf` |
| `KEY` | `application/vnd.apple.keynote` |

⚠️ **A narrow list is a REFUSAL, not a default.** With exactly these three, an upload of `.docx`,
`.ppt`, `.pages`, an image or a `.zip` is **rejected at the bucket**, and the frame is the only
evidence about which types are wanted. ▶ Per `A-022` I will not widen it on my own reading.
**Recommend the three the frame draws; the Operator's call if it should be wider.**

---

## §13.10 — THE BUCKET ROW IS RULED. THE MIGRATION IS BLOCKED ON THE STACK, NOT ON A DECISION

**Operator, 2026-08-13.** Both open bucket-row fields are now ruled. ⛔ **Nothing about `P2-6`
remains undecided; what remains is an environment failure.**

### `file_size_limit` — `25 MiB` = `26214400` bytes · APPROVED

> **Operator:** *"Your §8.2 argument decides it: a limit that admits video makes the media-class
> separation depend on who uploads what, when the separation exists precisely so it does not. And
> the recoverable direction being up is the right tiebreak."*

⚠️ **Recorded with the deciding ground named**, because a later phase asked to raise it should have
to argue against **that** rather than against a bare number: the ceiling is not a capacity
estimate, it is **the mechanism that keeps `evidence` and `lesson-materials` separate media
classes**. Raising it toward video sizes does not merely relax a limit — it dissolves Lock §8.2's
separation into a matter of who happens to upload what.

### `allowed_mime_types` — WIDER THAN THE FRAME DRAWS · OPERATOR RULING

> **Operator:** *"The frame draws PPTX, PDF and KEY, but a trainer preparing a class will have a
> Word handout or a photo of a worksheet … ⚠️ This is wider than the frame draws. Record it as an
> Operator ruling with the reason, so it does not read as drift, and so a later phase does not
> narrow it back to match the frame."*

**The ratified list — eight types:**

| Ext | MIME |
|---|---|
| `PDF` | `application/pdf` |
| `PPTX` | `application/vnd.openxmlformats-officedocument.presentationml.presentation` |
| `PPT` | `application/vnd.ms-powerpoint` |
| `KEY` | `application/vnd.apple.keynote` |
| `DOCX` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| `DOC` | `application/msword` |
| `PNG` | `image/png` |
| `JPEG` | `image/jpeg` |

⛔ **THIS IS AN OPERATOR RULING, NOT DRIFT, AND A LATER PHASE MUST NOT NARROW IT BACK TO THE
FRAME'S THREE.** The frame is a static render showing the three files someone happened to upload;
it is **not an inventory of permitted types**, and treating it as one would refuse a Word handout
or a photographed worksheet — the ordinary case the Operator named.

⚠️ **It is still narrow in the direction that matters.** No `video/*`, no `audio/*`, no archive.
▶ **That is the half Lock §8.2 needs**, and it is what makes the media-class separation hold at the
bucket row rather than by convention.

⚠️ **`PNG`/`JPEG` are a teaching-material photo, and they are NOT the `§8.2` student-photo class.**
That surface (`Management - Register Student`) is **PDPA-live** and remains unbuilt and
unauthorized. This bucket is keyed to a **class session**, never to a person, and no image here is
an identity photograph.

### ⛔ `supabase start` — AUTHORIZED, RUN, AND IT DID NOT RESOLVE THE FAILURE

Run on the **dev project only**, pinned by `config.toml` `project_id = "best-coach-dev"`. Exit 0;
it reported every URL normally.

| | dev | mvp |
|---|---|---|
| before | **9** | **9** |
| after | **9** | **9** |

⛔ **The port is still not published.** `supabase_kong_best-coach-dev`'s `NetworkSettings.Ports`
is `{"8000/tcp":[]}` and `127.0.0.1:54421` still returns **HTTP 000**.

▶ **AND THE MEASUREMENT WIDENED THE DIAGNOSIS.** Across the **whole daemon**, both stacks, **ZERO
of the 18 containers carries a host binding** — every `docker ps` Ports column shows only the
container-internal port, and the count of `->` mappings is **0**. ⚠️ **This is a Docker
Desktop-wide port-proxy failure, not a dev-stack problem**, which is why a container restart and
then `supabase start` both left it unchanged. Neither could have fixed it.

**Stopped and reported, per the Operator's own instruction, rather than escalated.**

### ⛔ WHY THE MIGRATION IS ALSO STOPPED — AND IT IS NOT A SECOND DECISION

The authorization is complete and the figures are ruled. **The blocker is that the migration
cannot be APPLIED or PROVEN:**

- The established path is **`supabase migration up`**, which connects over **TCP `54422`** — down
  for the same reason as `54421`.
- ⛔ **The `docker exec … psql -f` workaround is the path that already broke atomicity in this
  project.** `BUILD_NOTES.md` records it: *"`psql -f` autocommits per statement. The first apply
  left the function committed while its assertion block aborted … ▶ A migration's atomicity is a
  property of how it is APPLIED, not only of how it is written."* Reaching for it now would be
  escalating around the blocker the Operator asked to be told about.
- Writing the file without applying it would **immediately break `prove:portal-p2-5`'s
  `P25a-NOMIG` pin** (`migrations.length === 30`), and that suite cannot be run to see it —
  leaving an unapplied, unproven migration in the tree that a later session would reasonably read
  as shipped.

⛔ **No migration file is written.** The moment the daemon publishes ports again, `P2-6` proceeds
under the authorization already given, at `25 MiB` with the eight MIME types above.

---

## §13.11 — `S3-00`: A CHECK WHOSE NAME OVERSTATES WHAT IT MEASURES

> **Operator:** *"the leg's NAME reads as a reachability check while it is a config-resolution
> check. Nothing went green, but only because a later leg caught what this one asserted. Record it
> — a check whose name overstates what it measures is a false claim waiting for the leg behind it
> to be removed. Do NOT repair it now; it belongs to another phase's harness."*

**Recorded as its own named class**, distinct from §12.8's fixture-content pin.

`prove:stage3-authenticated` printed **`PASS  S3-00  the local loopback Supabase stack was
resolved`** while `127.0.0.1:54421` was returning **HTTP 000**. The leg is not wrong about what it
did — it resolved configuration — but its **name asserts reachability**, and a reader scanning
the output reads *"the stack is up"*.

▶ **The defect is the gap between the name and the measurement, and it is latent by construction.**
Nothing went green **only because the three magiclink mints failed one leg later**. ⛔ **Remove or
weaken that downstream leg and `S3-00` becomes a false PASS on a dead stack** — the suite would
report a resolved, reachable stack that is neither.

**The family this belongs to, now three deep:**

| Instance | The gap |
|---|---|
| `SC-1` | asserted the **authored** value (`right 0.75rem center`) where the browser reports the **computed** one — failed a correct fix |
| `P25-4` | required a policy **NAME** to contain `management` where the property is **readability** — failed a correct product |
| **`S3-00`** | claims **reachability** where it measures **config resolution** — passes on a dead stack |

⚠️ **The general rule: a leg's name is read far more often than its body, so the name is part of
the assertion.** If the two disagree, the name is what future sessions will act on.

⛔ **NOT REPAIRED — it belongs to another phase's harness**, and fixing it mid-gate is not what was
authorized. Recorded so the repair has a home.

---

## §13.12 — `class_sessions_id_module_key`, recorded so it is not read as an appearance

> **Operator:** *"The `class_sessions_id_module_key` note is exactly right to record. An
> unmentioned key found later reads as an appearance."*

`class_sessions` carries **two** unique keys, both since Step 7E:

- `class_sessions_id_centre_key UNIQUE (id, centre_id)` — the one `class_session_materials`'
  composite FK will use, so centre drift is **unrepresentable** rather than merely checked;
- `class_sessions_id_module_key UNIQUE (id, class_module_id)` — **not mentioned in §13**, and
  recorded here for that reason alone.

⚠️ **Neither is new and nothing changed.** The note exists because **an unmentioned key found
later reads as an appearance** — and a reader who believes a key appeared will go looking for the
migration that added it.
