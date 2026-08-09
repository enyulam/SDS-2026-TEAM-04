# DRAFT — proposed amendment to `CLAUDE.md` §6, the "Follow-up for Next Session" clause

> # ⛔ DRAFT ONLY — NOT RATIFIED, NOT APPLIED, AUTHORIZES NOTHING
>
> **`CLAUDE.md` is unchanged.** Nothing in this file has been applied to it, and no session may apply it. Editing ratified authority is a **`CLAUDE.md` §12 stop-and-ask**, and the annotate-never-delete method additionally requires **an explicit bounded Operator instruction issued for that run** — a request to *draft* is not such an instruction.
>
> Drafted 2026-08-10 on Operator instruction: *"Draft an amendment binding the requirement to the Review & Approve WORKFLOW SURFACE rather than a screen name, leaving the display question explicitly open for me. Do not decide it."*
>
> ⚠️ **DECISION D-2 BELOW IS DELIBERATELY LEFT OPEN.** This draft does **not** choose between read-only, editable and absent. If a future session finds itself picking one, it has exceeded the instruction.

---

## 1. The defect in the current clause

`CLAUDE.md` §6 currently reads (line 309, verbatim):

> - **"Follow-up for Next Session" is one field, surfaced on two screens — confirmed by the orchestrator.** The B.E.S.T Form's "Follow-up for Next Session" field and the Review & Approve screen's "Coach Notes (Internal Only)" field are **the same `observations.follow_up_notes` column**, not two separate notes. The Review & Approve screen must load the trainer's current value into that field (not render it blank) so the trainer is editing their earlier note after seeing the AI draft and evidence, not overwriting it unknowingly. Whatever server action saves this field must be callable from both screens against the same column.

**The clause binds to a screen name that the ratified visual inventory does not contain.**

- Spec §8/§10 define **"Review & Approve — post-class quality control (Trainer / TA)"**, the *Review Workspace*. The clause was written against that spec-era screen.
- **Amendment 005's ratified 36-screen inventory allocates no screen named "Review & Approve."** Verified against `UI_REFERENCE_FINAL_MVP/SCREEN_INDEX.md`, 2026-08-10.
- The nearest inventory screen, **`10` Trainer Student Report** (`reference/Trainer - Student Report/`, node `664:9`), is a **completed-report VIEW** — purpose *"view a completed Student Report… and its approval status"*; interactions *read · play video · return*. It draws no Quality Checklist, no Approve control and no editable field.
- The implementation puts the Review & Approve **workflow** on `/trainer/reports/[reportId]/review`, a sub-route of screen 10, because **no frame exists for it**. There is **no `reports/[reportId]` index route**; screen 10's `screen.md` still lists the canonical index under *allowed future expansion*.

**Consequence:** the clause's requirement currently has no unambiguous addressee in the ratified inventory. A reader comparing screen 10's frame against §6 sees a contradiction that is really a category error — the frame and the clause describe **different surfaces**.

⚠️ **This is a naming defect, not a governance weakness.** The clause's substance is sound and the amendment below preserves every part of it that protects anything.

---

## 2. What the amendment would change, and what it must not

### 2.1 Change — bind to the WORKFLOW SURFACE, not to a screen name

Replace the screen-name reference with a functional definition:

> **The Review & Approve workflow surface** — the governed surface on which the trainer reviews a generated draft, satisfies the three-item version-scoped Quality Checklist and performs the trainer **Approve** transition (`draft_ready | needs_edit → trainer_approved`), **wherever that surface is routed.** It is defined by the governed behaviour it carries, not by an inventory ID, a frame or a route, and it is **not** the same thing as the completed-report view that inventory screen `10` depicts.

### 2.2 Preserve, unchanged and unweakened

- **One column, not two notes.** The B.E.S.T Form's "Follow-up for Next Session" and the workflow surface's "Coach Notes (Internal Only)" remain **the same `observations.follow_up_notes` column**.
- **Capture on the B.E.S.T Form stays mandatory** — ✅ already ruled 2026-08-10. It is the column's only writer, and losing it would empty the previous-focus carry-over, make the AI prompt's `<FOLLOW_UP_NOTES>` permanently `(none)`, and void **Phase 1 exit condition (c)**.
- **Never parent-visible.** The note is internal; nothing here touches the parent boundary.
- **The same governed save path** serves any surface that writes the column.

---

## 3. ⛔ DECISION D-2 — LEFT OPEN FOR THE OPERATOR

**What must the Review & Approve workflow surface do with the note?** Three coherent options; **this draft chooses none.**

| | Option | What it means | Notes |
|---|---|---|---|
| **A** | **EDITABLE — restore the original intent** | The surface loads the current value into a real field and can save it, so the trainer refines the note *after* seeing the AI draft | This is what §6 was written to require. It is **not** what is built (`F-S6-REVIEW-1`). Choosing A converts that item into an implementation task and needs a second write path to the column |
| **B** | **READ-ONLY — ratify what exists** | The surface displays the saved note, clearly internal, with no save path | Matches the build exactly. The trainer still *sees* the note at review time, which is most of the safeguard's value. ⚠️ The clause's stated rationale — *"not overwriting it unknowingly"* — becomes **vacuous but harmless**: nothing there can overwrite it. The amendment should then say so plainly rather than leave a rationale that no longer describes anything |
| **C** | **ABSENT — remove the display** | Capture on the B.E.S.T Form only; the workflow surface shows nothing | Coherent with every **downstream consumer** — the carry-over and the AI prompt read the **column**, not the display. Costs the trainer their only sight of the internal note at review time. **7 sites** become unused (`coachNotes` through DTO, adapter, contract, projection, fixture) |

**Facts the decision should rest on, all measured 2026-08-10:**

- **Nothing downstream reads the DISPLAY.** It is a leaf `<p>`. The column's real consumers are the roster's previous-focus projection and the AI draft prompt, both reading the database.
- **The build today is option B**, without ever having ruled it.
- **Options B and C both require this amendment**, because both contradict the current clause's explicit *"editing"* wording. **Only option A needs no rule change** — it needs implementation.

⚠️ **The amendment cannot be finalized until D-2 is answered**, because the clause's operative sentence differs in each case.

---

## 4. Draft replacement text — with the D-2 slot marked

> - **"Follow-up for Next Session" is one field, and it is the same column wherever it appears — confirmed by the orchestrator; rebound to the workflow surface by Amendment ___, 2026-__-__.** The B.E.S.T Form's "Follow-up for Next Session" field and the **Review & Approve workflow surface's** "Coach Notes (Internal Only)" are **the same `observations.follow_up_notes` column**, not two separate notes.
>
>   **The Review & Approve workflow surface is defined by governed behaviour, not by a screen name:** it is the surface carrying the three-item version-scoped Quality Checklist and the trainer **Approve** transition, wherever routed. ⚠️ **It is not inventory screen `10`**, whose ratified frame is a **completed-report view** drawing no checklist, no Approve control and no editable field. *(The previous wording named a spec-era "Review & Approve screen" that Amendment 005's 36-screen inventory never allocated — a naming defect, not a change of substance.)*
>
>   **Capture on the B.E.S.T Form is mandatory.** The governed assessment save is the column's only writer; without it the previous-session focus carry-over is empty, the AI draft prompt receives no follow-up context, and **Phase 1 exit condition (c) cannot be demonstrated.** Its current value is always **loaded, never blanked**.
>
>   **`⟦D-2 — OPERATOR TO SUPPLY: the workflow surface's treatment of the note — editable and saveable / read-only display / not displayed.⟧`**
>
>   Whatever server action saves this field must be callable from **every surface authorized to write it**, against the same column. The note is **internal and never parent-visible**.

---

## 5. Instrument, scope and what this draft does not touch

- **Instrument:** an entry in `CLAUDE.md` §6 is **not** an amendment to the specification. This clause is `CLAUDE.md`-level authority, so the appropriate instrument is an **explicit Operator ruling** plus the ratified **annotate-never-delete** edit — strike the superseded sentence, preserve it inline, cite the ruling, date it. **A new spec Amendment number is not required** unless the Operator prefers one.
- **Untouched by this draft:** the parent boundary · the nine-dimension mandate · A-017 · the Quality Checklist gate and its server-side re-verification · A-033/A-036's two-stage workflow · the OD-4 panels · the audit registry · every schema object. **No enum, table, column, RPC, grant or migration is implied.**
- **`F-S6-REVIEW-1` travels with D-2.** Option A makes it a work item; options B and C close it as ratified-as-built or as removed.
- **Screen 07 is unaffected** — capture there is already ruled and is recorded as a `REGISTERED-OMISSION` in the reconciliation plan's Phase 6a.
