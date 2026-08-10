# UI RECONCILIATION BUILD PLAN — `F-UI-DRIFT-1` bucket (c)

> # ✅ CLOSED — COMPLETE. Operator decision, 2026-08-10.
>
> **Every phase this plan contained has run and been ACCEPTED by the Operator.**
>
> | Batch | Phases | Accepted commits |
> |---|---|---|
> | **1** | 0 · 1 · 2 · 3 | `3010b63` · `ea5d32b` · `02218ba` · `71953fa` |
> | **3** | 4 · 5 · 6a · 6 · 7 · 8 · 9 · 10 · 11 · 12 | `5dda019` · `ca9396e` · `1c93a4f` · `85e1f35` · `7634c71` · `d83823f` · `6146f73` · `e5cf572` · `d37c45a` · `cca7526` |
>
> **Result, as the two lists this plan exists to keep apart — never merged:** `TRUE-DRIFT` resolved **145** (Batch 1: 25 · Batch 3: 120) · `REGISTERED-OMISSION` preserved **73, ZERO CHANGED** (Batch 1: 12 · Batch 3: 61) · `NEW-QUESTION` **none, in any phase** · route census **17** at every boundary.
>
> **Basis of the Batch 3 acceptance:** the Operator **walked the full chain manually**, trainer through parent, all ten screens. ⚠️ **That is OPERATOR MANUAL VERIFICATION AT THOSE COMMITS ONLY — point-in-time. It is NOT a harness pass, it does NOT cover hover, focus or responsive collapse, and it does NOT transfer to any later change.**
>
> ### ⚠️ TWO OPEN ITEMS SURVIVE THIS CLOSURE — carried forward on Operator instruction
>
> 1. **The Phase 6a RUNTIME carry-over re-proof is OWED** — save a follow-up note on screen `07`, see it as the next session's previous focus. Blocked at `CONT-A0` by **`B-STAGE3-2`** (Operator-owned). Proven **statically only**, which does not discharge it. It backs **`CLAUDE.md` §10 Phase 1 exit condition (c)**.
> 2. **RENDERED CAPTURES REMAIN `NOT-RUN` on all ten authenticated screens** — they need a reachable governed database, a §12 stop-and-ask. The walkthrough does not substitute for them.
>
> **Successor plan:** `docs/plan/HERO_CHAIN_COMPLETION_PLAN.md`. It addresses a **different** problem — screens that are **functionally incomplete**, not visually drifted — and it **crosses governed surfaces this plan forbade**. Nothing below is a live instruction any more; the file is retained as the procedural record of a completed plan, and its proven disciplines are carried forward by name in the successor.

> **THIS PLAN AUTHORIZES NOTHING.** It is a procedural planning artefact (`CLAUDE.md` §1). It cannot override the specification, a ratified amendment, `FINAL_MVP_AUTHORITY_LOCK.md`, an operator ruling or `CLAUDE.md`. **Work proceeds in Operator-authorized BATCHES — see §5.1**, and no batch may be started because an earlier one passed.
>
> Written 2026-08-10 on `develop` in the development clone. **Amended 2026-08-10 (v2) by Operator instruction — see §8.** **No phase has been started. No code was changed to produce this plan or its amendment.**

---

## 0.0 ⭐ THE OPERATOR'S STANDING INTENT — read every phase in this direction

**Each screen should match the UPDATED design in `UI_REFERENCE_FINAL_MVP/reference/` as closely as governance allows.**

`reference/` is **visual rank 1** (A-056). **The registered governance-wins divergences are the ONLY exceptions, and each must carry its citation.**

⚠️ **THE EXISTING BUILD IS NOT A BASELINE TO BE PRESERVED.** It is the thing being reconciled. Where the build and the frame differ and no ratified rule speaks, **the frame wins and the build changes** — "this is how it was built" is not a reason to keep anything. The burden of proof runs one way only: an element survives contact with the frame either because the frame shows it, or because a citation says it must.

This is deliberately the opposite of the caution that governs governance boundaries. **Two different defaults, and a phase must not confuse them:**

| Question | Default |
|---|---|
| Frame and build differ, **no ratified rule speaks** | **Change the build to match the frame** |
| Frame and build differ, **a ratified rule speaks** | **Keep the rule, keep the divergence, cite it** |

---

## 0. What this plan is for, and what it is not

`F-UI-DRIFT-1` records that the deployed frontend was built against an earlier Figma iteration across multiple screens. The enumeration of 2026-08-10 split that item into three buckets:

| Bucket | Content | Status |
|---|---|---|
| (a) | The §6 Coach Notes / Follow-up question on screens **07** and **10** | ⛔ **BLOCKED — Operator ruling outstanding.** Not in this plan |
| (b) | Five superseded `A-014` citations; screens **30** and **11** undocumented | ✅ Done — commit `fed3ea4` |
| **(c)** | **True visual reconciliation** | **This plan** |

### 0.1 Why the first act of every phase is a frame comparison

The enumeration was built from each reference pack's `.md` note and from the implementing component. **Those notes describe sections, fields, labels and actions. They do not carry layout, spacing, hierarchy, composition, density, alignment, colour application or typography.** The enumeration said so explicitly and its conclusions are bounded accordingly.

**Therefore no phase in this plan may begin from the enumeration.** Each phase opens by comparing the **ratified frame — `.png` and `.html` together (§3.1)** — against a **rendered capture of the built screen**. The enumeration is an input to that comparison — a list of things already known and already adjudicated — never a substitute for it.

### 0.2 The one distinction the whole plan rests on

A difference between the frame and the build is one of two things, and **conflating them is the failure mode this plan exists to prevent**:

- **A REGISTERED GOVERNANCE-WINS DIVERGENCE.** The frame draws something a ratified rule forbids, or omits something a ratified rule requires. **These are correct. They are `EXPECTED / REQUIRED`. They are not defects, they are not regressions, and reconciliation must leave every one of them intact.** 47 are already registered in-code across six components; each phase below lists the ones it must preserve.
- **TRUE VISUAL DRIFT.** A difference with no governance justification — wrong spacing, wrong hierarchy, a control in the wrong place, a stale label, an element the newer iteration moved or removed for design reasons alone. **Only this class is in scope.**

⚠️ **A phase that "fixes" a registered omission has failed, not succeeded** — even if the result matches the frame more closely. Matching the frame is not the goal; matching the frame *except where governance says otherwise* is the goal.

---

## 1. Scope

### 1.1 In scope — **Phase 0 plus 12 screen phases over 12 screens**

Only screens with an implementation can drift. *(Amended 2026-08-10: screen `01` was cut — §8 amendment 3, and the Phase 13 entry below.)*

### 1.2 Excluded — 20 screens, `Not implemented`, cannot drift

`02` · `03` · `04` · `12` · `13` · `14` · `15` · `16` · `17` · `18` · `20` · `21` · `22` · `23` · `24` · `25` · `26` · `27` · `28` · `31`

These have no built surface. There is nothing to compare and nothing to reconcile. They are **new construction**, governed by their own future checkpoints, and are out of this plan entirely.

### 1.3 Excluded — blocked and reassigned

| Screen | Disposition |
|---|---|
| ~~**07** Trainer Grade Student~~ | ✅ **UNBLOCKED — Operator ruling 2026-08-10.** **Capture on 07 STAYS.** §6 is explicit and the assessment save is the column's only writer; removing it breaks the previous-focus carry-over, empties the AI prompt's `<FOLLOW_UP_NOTES>`, and voids **Phase 1 exit condition (c)**. A ratified rule speaks, so per **§0.0** the divergence is **KEPT AND CITED**: the frame lists only "Observation Notes", and the **Follow-up for Next Session field is a `REGISTERED-OMISSION`, not drift.** Now **Phase 6a** |
| **10** Trainer Student Report | ⛔ **RECLASSIFIED 2026-08-10 — moved to §1.4 `CANNOT BE VISUALLY ACCEPTED`.** Not blocked on the §6 ruling any more; **unframed**. See §1.4 |
| **09** Trainer Reports | **Reassigned to `F-STAGE3-1`.** Enumeration finding ④: the built surface is a returned-corrections queue gated on `?status=needs_edit`, not the frame's "All Reports" table. That is a **substitution, not drift** — a visual pass would reconcile the wrong surface. It needs a functional decision first |

### 1.4 ⚠️ CANNOT BE VISUALLY ACCEPTED — no frame exists

| Surface | Route |
|---|---|
| Trainer wording editor | `/trainer/reports/[reportId]/edit` |
| Management wording-only editor | `/management/reports/[reportId]/edit` |
| **Trainer Review & Approve** *(added 2026-08-10)* | **`/trainer/reports/[reportId]/review`** |

The two editors are among the **eight families the Figma matrix §0.1 records as `Blocked — new design required`**. Reference `664:9` and `648:330` cover the review surfaces only. **No mockup may be fabricated to fill the gap** (`CLAUDE.md` §7.2 / §12 stop-and-ask; `GLOBAL_UI_RULES` §8). Both were deliberately restyled onto the shared foundation their siblings use and both are explicitly **not proposed as visually accepted**.

#### Why `/review` joined them — measured from the routes, not inferred

**`/trainer/reports/[reportId]/review` is the ONLY trainer report detail surface.** Verified on disk 2026-08-10: the trainer portal has exactly `reports/`, `reports/[reportId]/generate`, `reports/[reportId]/review`, `reports/[reportId]/edit`, `schedule`, `sessions/[sessionId]/roster` and `sessions/[sessionId]/students/[studentId]/assess`. **There is no `reports/[reportId]` index route** — screen 10's own `screen.md` still lists *"add the canonical `[reportId]` index"* under **allowed future expansion**, so the framed completed-report view **has not been built**.

The frame `reference/Trainer - Student Report/` is a **completed-report VIEW**: purpose *"view a completed Student Report… and its approval status"*, interactions *read · play video · return*. It draws **no Quality Checklist, no Approve control, no editable field** — only Back, the report, the video and a *"Report sent to management for approval"* status line.

`/review` carries the **Review & Approve workflow** — the three-item version-scoped Quality Checklist, the trainer Approve action, the returned-correction state and the internal Coach Notes — **plus** the approved end state the frame depicts. It is therefore a **workflow surface the frame does not describe**, in exactly the position of the two editors: governed functionality with no frame.

⚠️ **Even the framed portion is only partially reconcilable.** The frame draws **"Overall Grade: Mastering"** and a four-tile **per-dimension Performance Summary**, both already registered governance-wins omissions (`10` register `D5`, `D6`). A frame that cannot be matched on its two most prominent right-rail elements is not a reconciliation target.

**All three are out of this plan and must stay out.** They become reconcilable only if the Operator commissions frames — or, for `/review`, if the canonical `[reportId]` index is built as a separate framed surface, which is **new construction and a separate authorization**. Open route decision **OD-3** is recorded and unresolved.

### 1.5 Ordering

1. **Phase 0** — shared chrome, first, because it is a prerequisite (§2). **This is Batch 1 in its entirety** (§5.1).
2. **Core-slice screens** (A-043's twelve, less the three excluded above) — these carry the physical-test flow and the demonstration path. Phases **1–3** are Batch 2.
3. **Non-core implemented screens** — `30`, `11`.
4. ~~**Unmounted** — `01`, last.~~ **Cut** — reassigned to the screen-01 reconstruction checkpoint (§8 amendment 3).

Within the core slice the three authentication screens run first and adjacently. **They share one component**, `features/auth/login-presentation.tsx`, so reconciling `AUTH-01` does most of the work for the other two, which then reduce to role-specific deltas. Splitting them across the flow order would repeat the same comparison three times.

---

## 2. Phase 0 — Shared chrome baseline · **PREREQUISITE, NOT A SCREEN**

**Why this exists.** The left rail, the brand mark and the token scale are **not owned by any screen**. At least four registered entries (`06` D7, `08` D8/D9, `10` D8, `19` D5) record a rail divergence and resolve it identically: *"outside this checkpoint's owned paths"*. Without Phase 0, **every screen phase re-raises the same finding and none is permitted to fix it.**

**Artefacts:** `components/layout/portal-shell.tsx` · `components/layout/portal-navigation.ts` · `components/brand/brand-mark.tsx` · the token scale.

**What must be compared.** Rail composition, item set, ordering, active/hover/focus treatment, iconography, collapse behaviour, header/profile block, and the brand slot — against the rail as drawn in **every** in-scope reference frame, since the rail appears in all of them.

**MUST NOT CHANGE.**
- Rail items must remain **the routes that actually exist**. A frame item pointing at an unbuilt screen is not a licence to create a route — **executing a route treatment requires its own authorization** (A-045; inventory §7).
- ⛔ **No logo or tagline asset may be invented.** No approved academy logo exists in the repository, and the frame's tagline (*"Where Confident Leaders Are Made"*) has no approved asset either. **The approved in-repo mark stands** until the Operator supplies one (A-013 disposition discipline, carried by A-022.2).
  > ⚠️ **THEIR ABSENCE MUST NOT BE CLASSIFIED `TRUE-DRIFT`.** It is a **recorded asset dependency** — the correct classification is `NEW-QUESTION` if anything about it is unclear, and otherwise simply a carried dependency. A phase that "resolves" it by drawing a mark, setting the tagline as text, or substituting any other asset has **invented an approved asset**, which is a §12 stop-and-ask and a plan failure. This holds in Phase 0 and in Phases 1–3, where the brand slot is most prominent.
- The Parent rail's **Logout** row and its deferred Overview/Calendar destinations keep their recorded treatment.

**Done-criteria.** A single written rail adjudication that every later phase cites instead of re-deriving; drift fixed only where it is genuinely presentational; every unbuilt-route item left unbuilt.

**Verification.** `tsc` 0 · `lint` 0 · `build` 0 with the route census **unchanged at 17** · rail capture diffed against ≥3 in-scope frames · keyboard traversal and visible focus order confirmed on one portal of each role · **no route created, moved, renamed or redirected** (proven by the route census, not by assertion).

---

## 3. Phase template

Every phase below is stated in the same six parts. **A phase is not complete until all six are satisfied and the Operator accepts it** — `PASS` is an evidence verdict; `Accepted` is Operator-set only (`CLAUDE.md` §15.6).

1. **Screen** — ID, name, route, implementing component.
2. **Reference pack** — the authoritative `/reference/` path, resolved from `UI_REFERENCE_FINAL_MVP/SCREEN_INDEX.md`'s mapping table. **Never guessed from the folder name.**
3. **What must be compared** — the PNG-only questions the `.md` notes could not answer.
4. **MUST NOT CHANGE** — the registered governance-wins divergences this phase is required to preserve.
5. **Done-criteria.**
6. **Verification.**

### 3.1 Comparison method, identical in every phase

**Reference side — BOTH artefacts, with distinct roles** *(amended 2026-08-10, §8 amendment 2)*:

| Artefact | Role |
|---|---|
| **`.png`** | **VISUAL TRUTH.** The ratified frame. What the screen should look like |
| **`.html`** | **MEASURABLE VALUES.** A Figma export carrying computed spacing, type scale, colour, hierarchy and structure — precisely what the `.md` notes could not supply |

**Each phase diffs the built surface against both.** A difference backed by an **extracted value** is stronger evidence than an eyeballed one: *"the card gutter is 24px against the frame's 32px"* is actionable; *"the spacing looks tight"* is not. Prefer the measured form wherever the export yields one.

⚠️ **Where the two disagree, the `.png` is the ratified frame and WINS.** The export is a derived rendering; the frame is the asset.

> ### ⛔ HARD CONSTRAINT — the export is a source of VALUES, not MARKUP
>
> Figma HTML exports are **absolutely positioned and structurally unusable**. No phase may:
>
> - port export markup into a component;
> - introduce **absolute positioning**, **fixed pixel layout**, or **export class names**;
> - reproduce the export's DOM structure, nesting or element choices.
>
> **Read values out of it. Never lift structure out of it.** Values land in the project's existing token scale, semantic HTML and responsive primitives — the accessibility and responsive requirements (`GLOBAL_UI_RULES`, persona §3.5) are unchanged and outrank any measured value that would break them.
>
> **If a phase finds itself copying structure rather than reading values, it has FAILED.** Stop, revert, report.
>
> This is the standing prohibition on porting generated code (`CLAUDE.md` §7.2), not a new rule — the export is admitted here for measurement only, and that admission changes nothing else.

- Where a pack-local frozen `reference.png` exists it is an **integrity anchor**, SHA-identical to the `/reference/` copy; it never outranks it (A-056, `CLAUDE.md` §7.4). **Its absence is not a missing reference and is never a reason to re-export from live Figma** — a live re-export can only import post-freeze canvas drift.

> ### ⭐ THE NUMBERED PACKS DO NOT HOLD OLDER DESIGNS — verified, 2026-08-10
>
> **A numbered pack's `reference.png` is a SHA-identical frozen DUPLICATE of its `/reference/` counterpart, never a superseded iteration.** This is what A-056 says, and it is now measured rather than assumed.
>
> **All 12 packs that carry a frozen duplicate are byte-identical to their `/reference/` counterpart — 12 identical, 0 different, 0 missing.** Independently, all 12 also match their `screenshotValidation.sha256` pin in `UI_PACK_MANIFEST.json` — **12/12 pin match, 0 mismatch** — so the result is corroborated by a third record rather than by one comparison.
>
> | Pack | `/reference/` counterpart | SHA-256 (first 16) | Pin |
> |---|---|---|---|
> | `05-trainer-schedule` | `Trainer - Schedule` | `d2d58b16b1ee2d68` | OK |
> | `06-trainer-student-roster` | `Trainer - Student Roster` | `78e4b618ed154ced` | OK |
> | `07-trainer-grade-student` | `Trainer - Grade Student` | `1df95a5bacae3c07` | OK |
> | `08-trainer-ai-report-generation` | `Trainer - AI Report Generation` | `3160524f41fc84cd` | OK |
> | `10-trainer-student-report` | `Trainer - Student Report` | `e64291dc80a2af73` | OK |
> | `19-management-student-report` | `Management - Student Report` | `394d8475498602ae` | OK |
> | `29-management-reports` | `Management - Reports` | `eddda3b14c7e3474` | OK |
> | `32-parent-reports` | `Parent - Report` *(singular)* | `90e368c17826bb11` | OK |
> | `33-parent-class-report` | `Parent - Class Report` | `2aaeb446065f8360` | OK |
> | `AUTH-01-trainer-login` | `Auth 01 - Trainer - Login` | `b1ad24e4f414ece9` | OK |
> | `AUTH-02-management-login` | `Auth 02 - Mangement - Login` *(misspelled on disk)* | `fcc3db9377a1b117` | OK |
> | `AUTH-03-parent-login` | `Auth 03 - Parent - Login` | `fcd4d4edcebadd20` | OK |
>
> **Consequences a phase must not get wrong:**
>
> - ⛔ **Never treat a numbered pack's PNG as a previous iteration** and never "reconcile" one against the other. There is nothing between them to reconcile.
> - **"Drift" in this plan means BUILD vs FRAME. Only that.** It never means frame-vs-frame or pack-vs-pack.
> - Either file may be opened for the comparison; they are the same bytes. The **`/reference/` copy is the one cited**, because it is the ranked authority (A-056).
> - The 24 packs without a duplicate are **not missing a reference** — theirs lives in `/reference/` like everyone else's.
- **Build side:** a rendered capture of the authenticated surface with governed fixture data, taken through the existing headless-Chrome/CDP path, **after the loading state clears**. A surface still loading at budget expiry is `NOT-RUN`, never `PASS` — the two-tier discipline already ratified for Stage 3.
- **Recorded per difference:** location, description, and a classification of **`REGISTERED-OMISSION` / `TRUE-DRIFT` / `INCOMPLETE` / `NEW-QUESTION`**. `NEW-QUESTION` is a stop-and-ask, never a judgement the phase makes about its own work.

### 3.2 Verification common to every phase

`tsc` 0 · `lint` 0 · `build` 0 · **route census unchanged** · **no governed call, DTO, projection, RPC, server action, schema object or migration touched** · `tests/frontend/three-role-browser-smoke.mjs` still proves the rating-token boundaries **structurally** · the phase's MUST-NOT-CHANGE checklist re-confirmed item by item, each with its citation · before/after captures attached.

⚠️ **Structural, never lexical.** A bare rating-word regex is **prohibited** (A-052): the four panels are prose that may legitimately contain *"mastered"* or *"eye contact"*. Boundary proofs assert on structure and on the governed projection, not on vocabulary.

---

## 4. The phases

### Phase 1 — `AUTH-01` Trainer Login
- **Route / component:** `/login?role=trainer` · `features/auth/login-presentation.tsx` (+ `components/auth/*`)
- **Reference:** `reference/Auth 01 - Trainer - Login/`  · frozen duplicate: **yes**
- **Compare:** card geometry and centring; brand slot proportion; role-selector segment styling and active treatment; field spacing, label weight, input height; the options row; primary-button sizing; footer-note placement; responsive behaviour.
- **MUST NOT CHANGE:** the **role query is presentation only** — it grants no role, session, permission or destination, and is not a parameter of the sign-in action (A-046) · **Remember me** stays a `disabled` checkbox with **no name**, never submitted · **Forgot password?** stays inert unless an explicit recovery route is authorized · the **"Role selection is presentation only"** governance note is a required addition and stays · the sign-in failure message stays **one closed two-valued message** — wrong password, unknown email and no-membership must remain indistinguishable · the password stays uncontrolled and never enters state, URL or logs · **no logo/tagline asset invented** (Phase 0).
- **Done:** every `TRUE-DRIFT` difference resolved or Operator-deferred with a reason; every `REGISTERED-OMISSION` intact.
- **Verify:** §3.2, plus contrast measured against SC 1.4.3 rather than eyeballed, and the inert affordances confirmed still announcing their unavailability to a screen reader.

### Phase 2 — `AUTH-02` Management Login
- **Route / component:** `/login?role=management` · same component
- **Reference:** `reference/Auth 02 - Mangement - Login/` — ⚠️ **"Mangement" is misspelled on disk. Do not correct it.** Renaming a ratified pack folder is not authorized · frozen duplicate: **yes**
- **Compare:** role-specific deltas only — active segment, placeholder, any copy difference. Everything shared was settled in Phase 1.
- **MUST NOT CHANGE:** all of Phase 1's list.
- **Done / Verify:** as Phase 1, scoped to the deltas.

### Phase 3 — `AUTH-03` Parent Login
- **Route / component:** `/login?role=parent` · same component
- **Reference:** `reference/Auth 03 - Parent - Login/` · frozen duplicate: **yes**
- **Compare / MUST NOT CHANGE / Done / Verify:** as Phase 2.

### Phase 4 — `05` Trainer Schedule
- **Route / component:** `/trainer/schedule` · `features/trainer/trainer-schedule.tsx`
- **Reference:** `reference/Trainer - Schedule/` · frozen duplicate: **yes**
- **Compare:** calendar grid geometry, day-cell sizing, event chips, month-selector placement, search-field treatment, details-panel proportion and stacking, lesson-card composition, responsive collapse.
- **MUST NOT CHANGE:** **`D1` "Add Agenda"** stays **disabled with a visible, programmatically associated reason** — session creation is a governed **Management** action (A-019) · **`D2` "Start Class"** keeps its relabelling to the governed action it actually performs; the **session-lifecycle enum is deferred and unratified** and no placeholder may be invented (A-026, `CLAUDE.md` §6.1) · the frame's **Trainer Assistant (TA)** fields stay unbuilt — TA is a deferred persona (A-014).
- **Done / Verify:** §3.2.

### Phase 5 — `06` Trainer Student Roster
- **Route / component:** `/trainer/sessions/[sessionId]/roster` · `features/trainer/trainer-roster.tsx`
- **Reference:** `reference/Trainer - Student Roster/` · frozen duplicate: **yes**
- **Compare:** four-column card grid and gutters; card internals (initials, name, status chip, observation line); summary-strip composition; filter/sort placement; banner geometry.
- **MUST NOT CHANGE:** **`D1`** no **"CLASS IN SESSION"** eyebrow or live dot — it asserts a lifecycle state no governed field carries · **`D2`** no lesson number, title or room — absent from `TrainerSessionSummaryDto` · **`D3`** the focus region stays filled **only** from the governed carried-over previous-session focus, and stays labelled for what it is · **`D4`** SLIDES/attachment chips stay omitted; **"View lesson plan"** stays disabled with a reason · **`D5`** no staff identity rendered · **`D6`** **no synthetic learners** — the grid renders exactly what the governed roster projection returns (`GLOBAL_UI_RULES` §8) · **`D7`** rail belongs to Phase 0.
- **Done / Verify:** §3.2, plus the previous-focus carry-over still visible on every present learner's card.

### Phase 6a — `07` Trainer Grade Student · *unblocked 2026-08-10*
- **Route / component:** `/trainer/sessions/[sessionId]/students/[studentId]/assess` · `features/trainer/trainer-assessment.tsx`
- **Reference:** `reference/Trainer - Grade Student/` · frozen duplicate: **yes**
- **Runs before Phase 6** — it is step 4 of the physical-test flow and feeds the draft screen.
- **Compare:** the nine-row rubric block — row rhythm, the four-segment rating track, chip geometry and selected treatment; the student rail; the identity card; the Observation Notes card; the primary action; group captions; responsive stacking.
- **MUST NOT CHANGE:**
  - ⭐ **THE "FOLLOW-UP FOR NEXT SESSION" FIELD STAYS.** The frame lists **only** "Observation Notes"; the field is a **`REGISTERED-OMISSION`, not drift** — Operator ruling 2026-08-10. `CLAUDE.md` §6 makes it and Review & Approve's "Coach Notes (Internal Only)" **the same `observations.follow_up_notes` column**, and the governed assessment save is that column's **only writer**. Removing it would empty the roster's previous-focus carry-over, make the AI prompt's `<FOLLOW_UP_NOTES>` permanently `(none)`, and **void Phase 1 exit condition (c)** — *"a session's follow-up note appears as the next session's previous focus"* (`CLAUDE.md` §10). Its current value must stay **loaded, never blanked**. ⛔ **Do not merge it into Observation Notes** — they are separate columns and the carry-over must surface the follow-up alone.
  - **`D1`** the nine rows render in **ratified order** — the four B.E.S.T Competency dimensions then the five Speech Linguistics Pattern dimensions — not the frame's interleaved order, and the two groups stay captioned (`CLAUDE.md` §5, spec §3).
  - **`D2`** the **behavioural anchor** stays rendered beneath every row and inside each chip's accessible name. The frame draws none; `CLAUDE.md` §5 requires it. **A required addition, not a liberty**, and the anchor text is **verbatim** (A-050) — never reworded, re-wrapped or paraphrased.
  - **`D4`** no **"Junior"** Class Grade (not a governed value — A-016/A-054) and no user-facing **"Student ID"**; the governed Class Grade, Class Module and session date stand instead.
  - **`D5`** the selected-chip fills keep the **deeper ramp step**, not the frame's saturated fill — measured at **3.70 / 2.03 / 2.34 / 2.51 : 1**, all four failing SC 1.4.3. **Accessibility wins; do not restore the frame's colour.**
  - **`D6`** no synthetic learners in the rail — the governed roster projection only.
  - All nine dimensions stay mandatory; **no Quick mode, no four-dimension path** (A-017), and completion stays **server-validated** with the client check named as convenience only.
- **Done:** every `TRUE-DRIFT` resolved or Operator-deferred; the Follow-up field and all five registered divergences intact.
- **Verify:** §3.2, plus contrast re-measured on the selected chips, the anchors confirmed byte-identical to the backend, and **the carry-over re-proven end to end** — save a follow-up note here and see it appear as the next session's previous focus.

### Phase 6 — `08` Trainer AI Report Generation
- **Route / component:** `/trainer/reports/[reportId]/generate` · `features/trainer/trainer-draft-generation.tsx`
- **Reference:** `reference/Trainer - AI Report Generation/` · frozen duplicate: **yes**
- ⚠️ **Largest register in the plan — 10 entries. Read them before comparing anything.**
- **Compare:** two-column split and rail width; editable-panel card treatment; section glyph tiles; Report Details card; Performance Summary tile grid **across all nine**; action-stack placement; and the **non-happy-path states**, which the frame does not draw at all.
- **MUST NOT CHANGE:** **`D1`** this is **not** a term report — end-of-term generation is out of MVP scope, and **"Parent copy"** is a false lifecycle claim on a Trainer working version · **`D2`** panel headings stay the OD-4 canonical four; the frame's **"Areas to Grow"** is the minority variant and is expressly **not canonical** (Authority Lock §15.1) · **`D3`** evidence region stays **inert with a reason**; no uploader, format or size limit invented — *(citation corrected 2026-08-10: the Trainer **is** the ruled uploader per Authority Lock §8; the path is **unbuilt**, not undecided)* · **`D4`** no Lesson/Term rows · **`D5`** **no "Overall Grade"** — a headline rating is a derived assessment fact this frontend must not compute · **`D6`** **all nine** governed snapshots, never the frame's arbitrary four (A-017) · **`D7`** **no "Confirm & Submit", no "Save as draft"** — the Trainer **approves and does not publish**, the gate is the three-item version-scoped Quality Checklist, and a second save affordance would be an invented mutation (A-033, A-036) · **`D8`/`D9`** rails · **`D10`** the drafting, failure-and-retry, nine-rating-refusal, empty and disabled states **must survive** — they are governed behaviour the frame simply never drew.
- **Done / Verify:** §3.2, plus each non-happy-path state captured and compared as its own view.

### Phase 7 — `29` Management Reports
- **Route / component:** `/management/reports` · `features/management/management-reports-queue.tsx`
- **Reference:** `reference/Management - Reports/` · frozen duplicate: **yes**
- **Compare:** filter-strip layout; table density, column widths, header treatment; row-action button styling; badge shape and placement; empty/loading states.
- **MUST NOT CHANGE:** the frame's status vocabulary **"Approved" / "Needs approval" is Figma mock data, not the ratified lifecycle** — the eight ratified statuses win and the divergence stays recorded · **row actions are decided per row by status**, and there is deliberately **no shared generic "view report" handler** · `trainer_approved` is the **only** queue status linking to report content · `needs_edit` / `draft_ready` expose **no report content** and get **"Send Reminder to Trainer"** only · **no raw per-dimension rating, checklist internal, approval internal or content hash** on any row (A-038).
- **Done / Verify:** §3.2, plus the per-status row-action matrix re-proven.

### Phase 8 — `19` Management Student Report
- **Route / component:** `/management/reports/[reportId]/review` · `features/management/management-report-review.tsx`
- **Reference:** `reference/Management - Student Report/` · frozen duplicate: **yes**
- ⚠️ **Highest governance density in the plan — 12 entries, six of them prohibitions under operator ruling R-B5.**
- **Compare:** report-card composition and section rhythm; approval-panel placement and prominence; per-section edit affordance styling; breadcrumb/back treatment. **Only the regions that survive the prohibitions below are comparable at all.**
- **MUST NOT CHANGE:** **`P1`** no **audience toggle** — there is no `kind` enum and no `audience` column; audience comes from authorization, never an attribute on the row · **`P2`** **NO "Performance Summary" rating grid.** Management never reads raw per-dimension ratings (A-038); this is the same class of leak already caught once on a Parent surface, and it is proven structurally, not by eye · **`P3`** no **"Overall Grade"** · **`P4`** no trainer observations, trainer notes, or any assessment-editing control — an assessment-level issue is **always a return, never a Management edit** (A-034) · **`P5`** evidence and attendance substance **omitted outright**, not merely inert — inert-with-reason is the treatment for an *unbacked* affordance, not a *prohibited* one · **`P6`** no **"Save as draft"** — no governed Management draft state exists · **the content hash is never rendered, and never will be** (it covers the panels **plus** the nine ratings; panels + hash recovers the grid in 4⁹ = 262,144 trials) · **`D1`** canonical panel label, not the frame's "Areas to Grow" · **`D2`** no **"Management copy"** · **`D3`** approved icons only · **`D4`** the pencil affordance stays a link to the **wording-only** editor, editing nothing in place (A-037) · **`D6`** the ratified approve copy stands; **no confirmation mockup may be invented** beyond `CLAUDE.md` §6's description.
- **Done / Verify:** §3.2, plus explicit re-proof that **zero** competency-rating tokens and **zero** hash values reach this surface.

### Phase 9 — `32` Parent Reports
- **Route / component:** `/parent/reports` · `features/parent/parent-reports-list.tsx`
- **Reference:** `reference/Parent - Report/` — ⚠️ **singular "Report"**, not "reports" · frozen duplicate: **yes**
- **Compare:** row height and rhythm; document-tile treatment; title/meta typography; the "Viewing <child>" affordance; "All Reports" heading; primary action placement.
- **MUST NOT CHANGE:** the frame draws an **aggregate rating chip on every row** — **it is deliberately not implemented and must not be reinstated in any form or wording** (Q-27 is a data boundary across **every** Parent surface; A-021, A-038, A-048) · no per-dimension rating, observation, correction history, content hash, version metadata or audit internal · the child affordance stays a **presentation control over live links only**, never a picker over the centre's students.
- **Done / Verify:** §3.2, plus the projection re-confirmed to return only the canonical submitted version for linked students.

### Phase 10 — `33` Parent Class Report
- **Route / component:** `/parent/students/[studentId]/sessions/[sessionId]/report` · `features/parent/parent-canonical-report.tsx`
- **Reference:** `reference/Parent - Class Report/` · frozen duplicate: **yes**
- **Compare:** report-card geometry; section tile/heading/prose rhythm; page title and meta line; spacing between panels.
- **MUST NOT CHANGE:** **the "Performance Summary" per-dimension grid stays absent** — the already-caught leak `CLAUDE.md` §6 names by name, **including in softened wording** · **no "Overall Grade"** · **the frame's prose rating attributions are not ported** ("Assessed as Mastered in eye contact…") — explicit rating attribution and taxonomy disclosure (A-052) · **the "Watch Together" evidence video stays omitted** — Authority Lock §8.1 rules the **parent evidence projection OUT of the Final MVP**; A-001 is ratified but **armed and unactivated**, and any parent evidence surface is a **§12 stop-and-ask** (`F-EVIDENCE-SCOPE-1`) · the four panels render the governed submitted narrative and nothing is written over it.
- **Done / Verify:** §3.2. **The absence of the grid, the grade, the attributions and the video is `EXPECTED / REQUIRED` at visual acceptance and must be recorded as satisfied-by-omission, never as a gap.**

### Phase 11 — `30` Parent Dashboard · *non-core, `Partially implemented`*
- **Route / component:** `/parent` · `features/parent/parent-dashboard.tsx`
- **Reference:** `reference/Parent - Dashboard/` · frozen duplicate: **no** *(not a missing reference; not a reason to re-export)*
- ⚠️ **Most of this frame is unbuilt. Separate `INCOMPLETE` from `TRUE-DRIFT` before proposing any change** — and note that new construction here is **not** this plan's mandate.
- **MUST NOT CHANGE:** ⛔ **operator ruling Q-27** — the **"This Term's Skills"** nine-dimension card is `DO_NOT_IMPLEMENT` in its entirety: title, all nine labels, all bars, all rating-derived state, and **any replacement ratings visualization**. Hiding, obscuring, emptying, collapsing, renaming or substituting are **non-compliance** · it is a **DATA boundary, not CSS** — the ratings must not reach a Parent session through the UI, page state, DTOs, projections, RPC results, APIs, server actions or client payloads; **fetching and hiding them client-side is a violation** · **Profile Details promotes upward into the vacated space — no blank rectangle, no invented filler card** · **its absence is `EXPECTED / REQUIRED`, never `MISSING IMPLEMENTATION` and never a `VISUAL REGRESSION`** (Authority Lock §15.2).
- **Done / Verify:** §3.2, plus the Q-27 omission recorded as satisfied-by-omission with its citation.

### Phase 12 — `11` Management Dashboard · *non-core, `Partially implemented`*
- **Route / component:** `/management` · `features/management/management-dashboard.tsx`
- **Reference:** `reference/Management - Dashboard/` · frozen duplicate: **no**
- ⚠️ Same `INCOMPLETE` vs `TRUE-DRIFT` caution as Phase 11.
- **MUST NOT CHANGE:** the frame's approval list carries a **B.E.S.T. Rating per row** — **it must not be built** (A-038; same adjudication R-B5 recorded for screen 19) · **no content hash on any Management surface** · **row actions decided individually by status**, with no shared generic view handler.
- **Done / Verify:** §3.2.

### ~~Phase 13 — `01` Trainer Dashboard~~ · ⛔ **CUT — Operator decision, 2026-08-10**

**CUT from this plan.** *(§8 amendment 3.)* The draft's own note was accepted: **a component that never renders cannot visually drift**, so a visual-reconciliation phase over it buys nothing.

`/trainer` is a compatibility redirect onto `/trainer/schedule` (checkpoint F-04, operator ruling R-B1), and `features/trainer/trainer-dashboard.tsx` is therefore **retained but unmounted**.

**Reassigned owner: screen 01's own reconstruction checkpoint** — a deferred post-48-hour screen (A-044) whose canonical route is `/trainer/dashboard`. Reconciliation for screen 01 happens there, against `reference/Trainer - Dashboard/`, as part of building the screen rather than as a pass over an unreachable component.

> ⛔ **DO NOT DELETE THE COMPONENT.** It holds delivered work that the screen-01 checkpoint will need. Cutting the *phase* is not a licence to remove the *file*, and this plan authorizes no deletion of anything.

---

## 5. Cross-cutting rules

### 5.1 ⭐ AUTHORIZATION MODEL — BOUNDED BATCHES *(amended 2026-08-10, §8 amendment 1)*

**This supersedes the original per-phase model. It is a deliberate Operator amendment, not an oversight in the original.**

| Batch | Contents | Gate |
|---|---|---|
| **BATCH 1** | **Phase 0 only** — highest blast radius, it touches every screen | Complete → commit → **STOP for Operator review** |
| **BATCH 2** | **Phases 1–3**, the auth trio — one shared component | Only after the Operator **accepts Phase 0**. Complete → **stop** |
| **BATCH 3** | **All remaining phases, autonomously**, committing at **every phase boundary** | Only after the Operator **accepts Batch 2** |

**One screen per phase, and one phase at a time, still hold** — batching changes *who authorizes the next phase*, not the unit of work or the commit granularity.

**Unchanged within any batch, and not relaxed by batching:**

- **`NEW-QUESTION` is a HARD STOP.** Not a judgement the phase makes about its own work (`CLAUDE.md` §12).
- **A phase that changes a `REGISTERED-OMISSION` has FAILED — revert and report.** It does not matter that the result matches the frame better.
- Batch 3's autonomy is **continuation on evidence, never self-acceptance.** `PASS` is the evidence verdict; **`Accepted` is Operator-set only** (`CLAUDE.md` §15.6). A session never accepts its own work, and no batch boundary may be crossed by the session that just finished the batch.
- Every §12 stop-and-ask binds inside a batch exactly as outside it. **Nothing here carries hosted, paid, public, human, push or submission authority.**

### 5.2 The rest

1. **One screen per phase. One phase at a time.**
2. **Governance outranks the frame, always** (A-045, preserved by A-056). Where they disagree the rule wins **and the divergence is recorded, never silently resolved**.
3. **`/reference/` is visual rank 1** and is **functional rank 5, the lowest**. A frame authorizes no transition, role, permission, mutation, AI operation or data access. **Screen presence is not authorization.**
4. **Never re-export from live Figma** where a ratified asset exists — it can only import post-freeze canvas drift.
5. **No new question is answered inside a phase.** A `NEW-QUESTION` classification is a stop-and-ask (`CLAUDE.md` §12).
6. **No governed surface changes.** No schema, migration, RPC, server action, DTO, projection, grant, policy, audit action or route. A phase that needs one has left its scope.
7. **Presentation-only means presentation-only.** If a change alters what data is fetched, it is not a visual reconciliation.
8. **Record what was dropped.** If a phase bounds its own coverage, say so explicitly — silent truncation reads as "covered everything".

---

## 6. Dependencies and open items

| Item | Blocks | Owner |
|---|---|---|
| ~~§6 Coach Notes / Follow-up ruling~~ | ~~Screens 07, 10~~ | ✅ **RESOLVED 2026-08-10.** Capture on **07** stays and is a `REGISTERED-OMISSION` (Phase 6a); **10** is unframed and moved to §1.4 |
| **`F-S6-REVIEW-1`** — **§6 NON-CONFORMANCE, functional defect, NOT drift** | Nothing in this plan | ⛔ **Out of scope here — DO NOT FIX IN THIS PLAN** |
| **`CLAUDE.md` §6 amendment** — bind the requirement to the Review & Approve **workflow surface** rather than a screen name | Nothing in this plan | **Operator.** Draft only, at `docs/plan/DRAFT_CLAUDE_MD_S6_FOLLOWUP_AMENDMENT.md`. **Not applied** |
| `F-STAGE3-1` functional decision on `/trainer/reports` | Screen **09** | Operator |
| Frames for the two editor surfaces | §1.4 | Operator — commission or leave permanently unaccepted |
| Approved logo / tagline asset | Phase 0, Phases 1–3 | Operator — no asset exists; none may be invented |
| `OD-3` route decision | Trainer `/edit` | Recorded, unresolved |
| `B-STAGE3-2` | Any phase needing pristine local fixtures | Operator — needs the three interactive passwords |

---

## 6.5 Reporting at every stop — `H-8` applies unchanged in this clone

`OPERATOR_HANDOFF.md` is **regenerated at every stop**, is **DERIVED**, and is **OVERWRITTEN, never appended** (`CLAUDE.md` §15.8; `FINAL_MVP_G06_GROUNDING_RULING.md` §H-8). It originates nothing and is **not a fifth layer of §15.1** — where it and `STATUS.md` disagree, **`STATUS.md` wins**. A fact belonging in it that is not yet in a canonical record goes to the canonical record **first**.

**During this plan's batched work, every stop must additionally carry:**

- **phases completed** in the batch;
- **per phase: `TRUE-DRIFT` resolved vs `REGISTERED-OMISSION` preserved** — as two explicit lists, never a single "reconciled" count, because the whole risk is conflating them;
- **anything classified `NEW-QUESTION`**, with the question stated plainly and what it blocks;
- **the commit at each phase boundary**, by SHA.

---

### 6.6 `F-S6-REVIEW-1` — the §6 safeguard is not implemented · **functional defect, not drift**

**Logged as its own item on Operator instruction, 2026-08-10. Explicitly NOT in scope for this plan and NOT to be fixed by any phase.**

`CLAUDE.md` §6 requires that the Review & Approve screen **"must load the trainer's current value into that field (not render it blank) so the trainer is *editing* their earlier note after seeing the AI draft and evidence, not overwriting it unknowingly"**, and that **"whatever server action saves this field must be callable from both screens against the same column"**.

**What is actually built:** on `/trainer/reports/[reportId]/review` the value is rendered as a **read-only `<p>`** ([`trainer-report-review.tsx:526`](../../features/trainer/trainer-report-review.tsx)), not a field, and **there is no save path from that screen**. The governed assessment save on screen 07 is the column's only writer.

**So the edit-after-seeing-the-draft safeguard does not exist.** Its stated rationale is also self-voiding in the current build: nothing on that screen can overwrite the note, so there is nothing to overwrite unknowingly.

⚠️ **This is a FUNCTIONAL non-conformance with a ratified rule, not visual drift.** A visual pass must not "resolve" it, and it is not a reason to delete the read-only display either. It needs its own decision — most likely alongside the §6 amendment draft, since the amendment may change what the requirement binds to.

---

## 7. What this plan deliberately does not do

- It does not build, restyle, move or delete anything. **No phase has been started.**
- It does not resolve the §6 question, and **nothing in it depends on the answer** — screens 07 and 10 are excluded outright rather than planned conditionally.
- It does not schedule the 20 unimplemented screens. They are **new construction**, not reconciliation.
- It does not claim any screen is close to acceptance. **Visual acceptance status is `Not started` for all 36** and this plan does not change that for any of them.

---

## 8. Amendment record — v2, 2026-08-10, by Operator instruction

**Recorded as deliberate amendments, not as corrections of oversights.** The v1 positions were coherent; the Operator changed them.

| # | Amendment | v1 said | v2 says | Landed in |
|---|---|---|---|---|
| **1** | **Authorization model — bounded batches, not per-phase** | Every phase requires its own explicit Operator authorization | **Batch 1** = Phase 0 alone · **Batch 2** = Phases 1–3 after Phase 0 is accepted · **Batch 3** = the remainder autonomously, committing at every phase boundary. `NEW-QUESTION` stays a hard stop; a phase that changes a `REGISTERED-OMISSION` has failed | Header, **§5.1** |
| **2** | **Reference side is `.png` AND `.html`** | `.png` only | `.png` = visual truth · `.html` = measurable values (spacing, type scale, colour, hierarchy, structure). On disagreement the **`.png` wins**. ⛔ Hard constraint: **values, never markup** — no ported export markup, no absolute positioning, no fixed pixel layout, no export class names | **§0.1**, **§3.1** |
| **3** | **Phase 13 cut** | Screen `01` ran as the last phase | **Cut.** A component that never renders cannot visually drift. Reassigned to the screen-01 reconstruction checkpoint. **The component must not be deleted** | **§1.1**, **§1.5**, Phase 13 entry |
| **4** | **Operator's standing intent stated up front** | Implicit | **§0.0** — match the updated `reference/` design as closely as governance allows; the registered divergences are the only exceptions; **the existing build is not a baseline to preserve** | **§0.0** |
| **5** | **Logo/tagline absence is not drift** | Listed as a Phase 0 constraint | Explicitly **must not be classified `TRUE-DRIFT`** — it is a recorded asset dependency, and "resolving" it invents an approved asset | **§2** |
| **6** | **Per-stop reporting content** | Not specified | `H-8` confirmed unchanged in this clone, plus the four items every stop must carry | **§6.5** |

**Unchanged by this amendment:** the scope (§1), the exclusions (§1.2–§1.4), the two blocked screens, the `REGISTERED-OMISSION` / `TRUE-DRIFT` distinction (§0.2), every MUST-NOT-CHANGE list, and the fact that **this plan authorizes nothing**.
