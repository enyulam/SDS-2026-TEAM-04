# FINAL MVP — HERO CHAIN OPERATOR RULINGS (`G-1` … `G-8`)

> **Operator ruling instrument, `FINAL_MVP_AUTHORITY_LOCK.md` §2.3 class. Ratified 2026-08-10, Asia/Singapore.**
>
> Canonical location: **repository root**, alongside `FINAL_MVP_OD4_REPORT_SEMANTICS_RULING.md`, `FINAL_MVP_PHASE0_OPERATOR_RULINGS.md` and `FINAL_MVP_G06_GROUNDING_RULING.md`. Indexed at Authority Lock **§2.3**.
>
> ⚠️ **THIS INSTRUMENT AUTHORIZES NO IMPLEMENTATION.** It settles eight scope questions. It creates **no** table, enum, column, audit action string, RPC, grant, policy, route or migration, and **every phase of `docs/plan/HERO_CHAIN_COMPLETION_PLAN.md` still requires its own explicit Operator authorization before any code is written.**
>
> ⚠️ **It weakens no privacy, approval, audit or evidence control.** Five of its eight rulings are **refusals**. Every ruling that permits something permits it **narrowly and for a stated reason**.

---

## 0. Origin

While planning completion of the hero chain — the governed two-stage workflow from the trainer starting a class to the parent reading the submitted report — **eight collisions were found between what the ratified `reference/` frames draw and what ratified governance permits.** They were reported to the Operator **first, as a separate list, before any implementation phase was proposed**, on the standing principle that a collision of this kind is a ruling to be made and never something to design around.

All eight were ruled on **2026-08-10**. They are recorded here in full, with the reasoning, because a progress log must never be the sole authority for a product decision (`CLAUDE.md` §15.7).

---

## 1. `G-1` — THE THREE UNFRAMED HERO SURFACES: **LEAVE THEM UNFRAMED**

**The question.** Trainer Review & Approve (`/trainer/reports/[reportId]/review`), the Trainer wording editor and the Management wording editor have **no reference frame**. Both wording editors sit among the **eight `U-25` blocked design families**. "Complete the screen to its frame" is therefore undefined for all three — and **trainer approval is mandatory and irreplaceable** (A-033), so the chain cannot function without them.

**✅ RULED.** **They stay unframed.** They remain on their siblings' foundation — the same tokens, primitives and shell. **Commissioning frames is a design task and is not on this plan's path.**

**Consequence — the hero chain's completion criterion is explicitly SPLIT:**

- **Functional completion covers all eleven hero routes**, the three unframed surfaces included.
- **Visual acceptance covers the eight framed screens only.** The three are recorded **`VISUAL ACCEPTANCE — NOT APPLICABLE (G-1)`**.

⚠️ **`NOT APPLICABLE (G-1)` is a RULED DISPOSITION — never a `NOT-RUN`, and never a defect.** It must not be reported as a pass, and must not be reported as a gap.

**Unchanged and still binding:** inventing a frame, node ID or field for any of the eight `U-25` families remains **prohibited** (`CLAUDE.md` §7.2, §12; Authority Lock §28.4). This ruling closes **zero** `U-25` families — it rules on **acceptance**, not on design existence.

---

## 2. `G-2` — "OVERALL GRADE" / ANY ROLL-UP RATING: ⛔ **NO, PERMANENTLY EXCLUDED**

**The question.** The frames draw a single roll-up rating — `"Overall Grade: Mastering"` — on **four surfaces**: `08` Trainer AI Report Generation, `19` Management Student Report, `33` Parent Class Report, and as a per-row chip on `32` Parent Reports (and on `11`, which is out of hero scope).

**⛔ RULED: NO. All four surfaces. PERMANENTLY EXCLUDED — NOT DEFERRED.** It is a **`REGISTERED-OMISSION`** wherever a frame draws it, protected exactly like an inherited one.

**Three independent grounds, each sufficient on its own:**

1. **The roll-up is UNRATIFIED.** `CLAUDE.md` §3.6 lists the **9→7 dimension roll-up** and the **4-level→3-level scale mapping** as *pending client ratification*. **A-049 restated the mapping but expressly preserved its status** — a **proposed, trainer-overridable default, used only when term-report generation is built**. There is no ratified per-session overall grade, and term generation is **out of MVP scope** (`CLAUDE.md` §8).
2. **On a Management surface it is a DERIVATION FROM RATINGS MANAGEMENT MAY NOT SEE.** **A-038** permits Management exactly two reads and bars raw per-dimension assessment data. A roll-up is computed *from* the nine ratings; permitting it would deliver their aggregate to a reader barred from their substance.
3. **On a Parent surface it is the CAUGHT LEAK IN SOFTENED WORDING.** **Q-27** makes the nine ratings a **data boundary across every Parent surface**, and Authority Lock §15 already prohibits *"a second panel restating per-dimension ratings, **even with softened wording**"*. A single grade is the most compressed possible restatement of the grid.

**Consequence beyond the four surfaces.** G-2 removes the only reason any hero surface would need a **server-side rating derivation**. **Nothing in the hero chain computes an assessment fact.** Reconciliation had already recorded, on `08` D5, that a headline rating is a derived assessment fact the frontend must not compute; this ruling settles it at the product level rather than the layer level.

---

## 3. `G-3` — LESSON IDENTITY: ✅ **BUILD NUMBER AND TITLE** · ⛔ **KEY FOCUS CHIPS PROHIBITED**

**The question.** The frames carry lesson identity — `"Lesson 3 · Voice & Projection"`, `"4 · Expressive Delivery"`, `"4 · Speaking"` — on **five** hero surfaces (`06`, `08`, `29`, `32`, `33`). **No lesson number, lesson title or lesson sequence exists anywhere in the 26 tables**: `class_sessions` carries `session_date`, `starts_at`, `ends_at` and nothing descriptive; `class_modules` carries only `title`.

### 3.1 ✅ RULED — lesson number and title are AUTHORIZED as schema

**Lesson number and lesson title are worth the schema.** Shape evidence, from the `.html` of two independent frames: `29` renders `"4 · Speaking"` / `"2 · Pronunciation"` / `"6 · Confidence"`, and `33` renders `"4 · Expressive Delivery"` — **both `<number> · <title>`**, so **two fields, not one, and not a new entity**.

**Binding conditions:**

- The ratified hierarchy is unchanged — **no `classes` entity is introduced between Class Grade and Class Module** (A-016), and **no duplicated calendar or event record is created** (A-047).
- **This is a scope ruling, not a migration authorization.** Writing the migration is a separate, explicitly-named Operator authorization (`CLAUDE.md` §12).

### 3.2 ⛔ RULED — the **KEY FOCUS** chips are PROHIBITED

The frame's `06` lesson strip draws **KEY FOCUS** chips (*Vocal projection · Tonality · Emotional expression*). **They are NOT built, and no column is added for them.**

⚠️ **The reason is the whole point of the prohibition.** KEY FOCUS is **lesson-plan intent** — what a lesson is *designed* to work on. The roster already renders a **governed carried-over previous-session focus**, a different field with different authority, derived from the trainer's own `follow_up_notes` on the previous session and carried forward by the governed projection.

**They occupy the same visual position. Conflating them would SILENTLY REPLACE A GOVERNED FIELD WITH AN UNGOVERNED ONE**, and the substitution would be invisible on the rendered page — the strip would look correct while no longer showing what the trainer actually wrote.

**Binding: no phase may render lesson-plan focus into the roster's carried-over focus line, or into any surface that presents the governed focus.** This protects `CLAUDE.md` §10 Phase 1 exit condition **(c)** — *"a session's follow-up note appears as the next session's previous focus"* — which is a ratified phase gate.

**Also prohibited under this ruling, for the avoidance of doubt:** the frame's **SLIDES** attachment chips and **View lesson plan** control. No storage bucket exists, and they are the same media class as `G-8`.

> ✅ **QUALIFIED 2026-08-11 BY OPERATOR RULING `D-4`** (`FINAL_MVP_PORTAL_DECISIONS.md`). **KEY FOCUS chips are PERMITTED in a DISTINCT VISUAL POSITION with a DISTINCT LABEL**, as part of `D-4`'s lesson-materials feature.
> 
> ⛔ **THE PROHIBITION THAT MATTERED IS UNCHANGED: they must NEVER occupy, replace, or visually adjoin the governed carried-over previous-session focus line, or any surface presenting the governed focus.** ▶ **The position was always the rule, not the content** — two different things in one place is an **invisible substitution of a governed field**. **`CLAUDE.md` §10 Phase 1 exit condition (c) is what this protects.**
> 
> ⚠️ **SLIDES and View lesson plan:** `D-4` authorizes a lesson-materials feature in which **Management uploads and Trainer downloads** materials tagged to a **specific class session**. Anything on `06` beyond that scope remains prohibited under this ruling.

---

## 4. `G-4` — TERM: ⛔ ~~**NO**~~ ✅ **REVERSED 2026-08-11 BY `D-3`**

> ✅ **REVERSED BY OPERATOR RULING `D-3`, 2026-08-11** (`FINAL_MVP_PORTAL_DECISIONS.md`; Authority Lock §2.3). **Terms are PERMITTED as scheduling structure** — sessions belong to lessons, lessons group into terms, and terms scope the calendar and schedule surfaces across all three portals. Scope is the **final MVP prototype submission**, after the demonstration.
> 
> ⚠️ **The refusal below was correctly reasoned for the question it was asked, and the question changed.** `G-4` refused to build a substrate **in order to render a label**; `D-3` builds it because **the calendar features genuinely need the structure**. The whole text is preserved per annotate-never-delete.
> 
> ⛔ **WHAT `D-3` DOES NOT DO — the deferral this ruling protected is UNCHANGED.** **End-of-term REPORT GENERATION remains out of scope** (`CLAUDE.md` §8). **Building the term entity does NOT authorize term reports**, and **Management Term Report (screen `28`) remains separately governed** (Amendment 005; `CLAUDE.md` §12). Term **evidence capture** (`term_evidence_notes`) is unaffected, as it always was.
> 
> ⛔ **`D-3` authorizes no table, column, migration, route or screen.** The PORTAL COMPLETION PLAN schedules it, and it needs its own explicit Operator authorization.


**The question.** The frames show `"Term 1 · 2026"` / `"Term 1, 2035"` in Report Details on `08`, `19` and `33`, and an **"All terms"** filter on `29`. No term entity exists.

**⛔ RULED: NO. Where a frame shows a term, OMIT it.** The `29` "All terms" filter is not built. Each is a **`REGISTERED-OMISSION`**.

**Reason.** ⚠️ **A display label is not worth building the substrate an §8-deferred roadmap item needs.** A `terms` table plus a term filter is precisely the substrate **End-of-Term report generation** requires — expressly out of MVP scope (`CLAUDE.md` §8, spec §28). Building it "just for a label" would pull a deferred roadmap item into scope by the back door, which §8 requires be an **explicit Operator act**, never a side effect.

*(Term **evidence capture** — `term_evidence_notes` — is unaffected and remains in scope. It is the **generator** that is deferred, and this ruling neither touches nor advances it.)*

---

## 5. `G-5` — TRAINER NAME ON A PARENT SURFACE: ✅ **PERMITTED**

**The question.** Frame `32` renders `"Junior · Public Speaking · Lesson 4 · Argen Maulie · Received 14 Mar 2035"` — the assigned trainer's name on a **Parent** surface. This is a **new disclosure to the most tightly drawn audience boundary in the product**.

**✅ RULED: PERMITTED.** The Parent projection may carry the assigned trainer's display name.

**Reasoning, recorded because the boundary is tight:**

1. **Parents know who teaches their child.** Withholding it is **meaningless secrecy** — it protects nothing and degrades the report's usefulness.
2. **The same datum is already disclosed** on `29` (Management administers trainers — A-019) and on `06` (the trainer's own name).
3. ⚠️ **It is NOT a rating and NOT derived from one**, so **Q-27 does not reach it.** That is exactly why it required its own ruling rather than an inference in either direction.

**Unchanged and still absolute:** every other Parent constraint. Parents read **only** the canonical submitted version, **only** for students reachable through a live `parent_student_links` row, and **no** rating, observation, correction reason, trainer note, draft, AI history, content hash, revision number or audit row reaches a Parent surface — **nor may anything disclose that a correction cycle is or was underway.**

---

## 6. `G-6` — ROOM / LOCATION: ✅ **AUTHORIZED AS SCHEMA**

**The question.** The frames show `"Studio 2"` on `05` Schedule Details and in `06`'s banner and lesson strip. `class_sessions` has no location column.

**✅ RULED: YES. One column, no governance weight.**

**Binding conditions:**

- ⚠️ **`room` is a plain descriptive column. It carries NO authorization meaning and must never be used to scope a query.** Trainer reach is proved through the live class-session assignment (ADR-4), never through a location.
- **This is a scope ruling, not a migration authorization** — as `G-3`.

**Noted for the record:** `G-6` and `G-7` **discharge an already-registered dependency rather than open new scope.** Screen `05`'s pack records at checkpoint **F-04** that *"the frame's session **room/location** ('Studio 2') and its **Main / Assist. trainer names** exist on no governed field and are **omitted rather than fabricated**"*. This is the stronger position: the gap was correctly recorded rather than invented around, and these rulings close it.

---

## 7. `G-7` — STAFF SLOTS: ✅ **`Main:` AUTHORIZED** · ⛔ **`Assist.` PROHIBITED**

**The question.** Frame `05`'s Schedule Details draws **two** staff rows — `"Main: Sam Ong"` and `"Assist. Sam Ong"`.

**✅ RULED — `Main:` is AUTHORIZED.** The assigned trainer's display name is rendered. **It needs no schema**: it is reachable today through `class_session_assignments.trainer_membership_id → centre_memberships.account_id → accounts.display_name`, so it is a **projection**, not a migration.

**⛔ RULED — `Assist.` is PROHIBITED.** It is a **`REGISTERED-OMISSION`** on `05`.

**Reason.** ⚠️ **A second staff role is not a label.** `class_session_assignments.trainer_role` is typed `centre_membership_role`, whose values are `management` / `trainer` / `parent` — so an assistant slot means **extending a governed enum that carries authorization vocabulary**, and that is a `CLAUDE.md` §12 stop-and-ask on its own. It would also reintroduce the **Teaching Assistant persona**, which **A-014 defers**: TA screens, the TA login flow and TA-specific UAT are **not MVP completion gates**.

**Binding: `centre_membership_role` is NOT extended, and the TA persona stays deferred.**

*(A-014's safeguards are untouched by this: A-001 gating, A-003's prohibited/permitted exit and A-004's both-direction Parent UAT apply in full whenever evidence is implemented, and evidence-upload permission is never transferred to management.)*

---

## 8. `G-8` — ~~CLASS VIDEO EVIDENCE: ⛔ **CONFIRMED OUT, UNCHANGED**~~ ✅ **SUPERSEDED 2026-08-11 BY `D-5`**

> ✅ **SUPERSEDED BY OPERATOR RULING `D-5`, 2026-08-11** (`FINAL_MVP_PORTAL_DECISIONS.md`; Authority Lock §2.3). **Video evidence is AUTHORIZED**, with a scope narrower than the frame's and different in kind from what `G-8` refused.
> 
> ⚠️ **READ THE DIFFERENCE BEFORE READING THE REVERSAL.** `G-8` refused **CLASS video evidence** — the frame's uploader on `08`. **`D-5` authorizes PER-CHILD evidence**: the individual child whose report it is, **not class footage**. The subject changed, not merely the verdict.
> 
> **`D-5`'s ruled shape:** **Trainer** uploads at assessment time · tagged to **exactly one session report**, never moved or reused · **Management views it before Approve & Submit**, as part of the approval · removable · ⛔ **no download affordance for any role, including Parent** · visible to **Management · the authoring Trainer · the linked Parent** — the same boundary the report text already uses.
> 
> ⚠️ **The honest limitation is stated, not hidden:** streamed video is technically retrievable by a determined user with browser tooling. The product provides **no download affordance**; **it does not claim technical impossibility, and no surface may say otherwise.**
> 
> **Ground 1 survives and is now the operative number:** the frame's **500 MB** is still **never implemented** against `G-05`'s ruled **50 MiB**. **Ground 2 is discharged** — `D-5` is the authorization Amendment 008 withheld. **Ground 3's hero-slice exclusion stands as a statement about the HERO SLICE**, which is closed; `D-5` belongs to the PORTAL COMPLETION PLAN.
> 
> ⛔ **`A-014` IS UNCHANGED: the TA / `Assist.` persona stays deferred and `centre_membership_role` is NOT extended.** `D-5` is independent of it — the ruled uploader is the **Trainer**.
> 
> ⛔ **`D-5` authorizes no schema, bucket, policy, RPC, grant, audit action string, migration or UI.** It needs its own explicit Operator authorization.


**The question.** Frame `08` draws a **Class Video Evidence** uploader reading `"MP4, MOV · up to 500MB each"`.

**⛔ RULED: CONFIRMED OUT. Unchanged.** A **`REGISTERED-OMISSION`** on `08`.

**Three grounds, the third decisive:**

1. **A direct numeric contradiction.** The frame says **500 MB**; Operator ruling **G-05** sets **50 MiB**. The frame is visual authority with **no functional rank**, so the ruling wins — **and the divergence is recorded, never silently applied.** ⚠️ **The frame's "500MB" is never implemented in any form.**
2. **Nothing is authorized to build.** Evidence media **is** a Final MVP requirement and the **Trainer is the ruled uploader** (Authority Lock §8, §8.1) — but **Amendment 008 ratified two audit action strings and expressly authorized no evidence schema, bucket, policy, grant, RPC, UI or migration.**
3. ⚠️ **`FINAL_MVP_G06_GROUNDING_RULING.md` already ruled evidence media OUT of the hero slice**, with every A-001/A-003/A-004 safeguard intact and the Step 7H audit registry held at **16**.

~~**Unchanged:** the **Parent evidence projection stays out of the Final MVP** (Authority Lock §8.1) regardless of any later evidence authorization. **A-001 remains ratified but ARMED AND UNACTIVATED.**~~

> ⛔ **STRUCK 2026-08-11 — operator ruling `C-1`** (`FINAL_MVP_PORTAL_DECISIONS.md` §C). **THE PARENT EVIDENCE PROJECTION IS IN THE FINAL MVP** and **`A-001` IS ACTIVATED**, both by `D-5`. Authority Lock §8.1 — the clause cited above — has itself been superseded on the same ruling.
>
> ⚠️ **THIS SENTENCE IS THE REASON `C-1` EXISTED, AND IT IS WORTH SAYING WHY.** The words *"regardless of any later evidence authorization"* were written to make this line **survive its own supersession** — so a reader arriving after `D-5` would find a preserved clause explicitly instructing them to disregard the very authorization they were acting under. ▶ **A clause drafted to outlive the decision it depends on is not durable, it is a trap for the next reader.** ⛔ **Do not write another one.**
>
> ▶ **The new ground is client consent confirmed with iSpeak Academy — NOT a re-reading of the canonical PDFs**, whose finding that they require no parent-facing evidence projection **still stands** (Authority Lock §8.1). ⛔ **`Q-27` is untouched**, `A-001`'s gates apply in full as amended by `C-2` and `C-3`, and **`A-002` remains an open gate.**

---

## 9. Scope note — screen `11` Management Dashboard

**Confirmed OUT of the hero chain.** Management's post-login destination is `/management/reports`, so **a management user completes the entire governed workflow without ever loading `/management`**. Completing screen `11` is **portal breadth**, scoped to a later plan.

The per-report rating chip the frame draws on every approval row therefore belongs to that later plan. ⚠️ **Its governing class is already settled inside the hero chain by `G-2`**, so no phase may build a roll-up rating anywhere while awaiting that plan.

---

## 10. What this instrument does NOT do

- It **authorizes no implementation.** No migration, RPC, grant, policy, route, DTO field, enum value or audit action string is created by it.
- It **extends no enum** — `centre_membership_role` and the eight `report_status` values are untouched, and the **Step 7H audit registry stays at 16**.
- It **weakens no privacy, approval, audit or evidence control.** The parent boundary, A-038, Q-27, A-052, A-034's four-column allow-list and the two-stage workflow are all unchanged.
- It **closes no `U-25` design family** and **permits no invented frame, node ID or field.**
- It **does not amend** the specification, any amendment, `CLAUDE.md` or the Implementation Plan.
- It **does not change any screen's visual acceptance status.** All 36 remain `Not started`, except that three unframed hero surfaces are now `NOT APPLICABLE (G-1)`.
