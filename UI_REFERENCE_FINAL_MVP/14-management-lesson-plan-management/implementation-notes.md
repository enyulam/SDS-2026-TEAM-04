# 14 - Management Lesson Plan Management - implementation notes

**Append-only.** Add a new entry at the bottom for every implementation checkpoint touching this screen. Never edit or delete an existing entry - a superseded entry is corrected by a later entry that says so.

---

## Entry template - copy below the last entry

```
Timestamp (Asia/Singapore):
Source branch:
Starting commit:
Screen ID:                     14
Existing route audited:
Components preserved:
Components replaced:
Components created:
DTO and port changes:
Fixture changes:
Backend dependencies discovered:
Vocabulary dependencies:
Governance blockers:
Browser viewport:
Before screenshot:             implementation-before.png
After screenshot:              implementation-after.png
Validation:
Ending commit:
Acceptance status:
```

**Rules.**

- Record a missing backend path or a missing governance decision as a **dependency**. Never invent it.
- Record a frame-versus-governance discrepancy. Never resolve it locally.
- Synthetic data only in any captured screenshot.
- One bounded screen checkpoint, or one tightly coupled shared-shell checkpoint, per commit.

---

## Entries

### 2026-08-14 — `P2-6` BUILT (PORTAL COMPLETION PLAN phase `P2-6`)

**Route:** `/management/classes/[classModuleId]/lesson-plans` — the canonical route, created, not moved.

⛔ **THE PACK'S "PROHIBITED INVENTION" IS DISCHARGED, NOT OVERRIDDEN.** `screen.md` records *"Do not
create a lesson-plan table, column, enum or RPC"* and *"Blocked on unratified governance"*. ▶ The
gap was **RECORDED** (plan §13), **ESCALATED** with every table, column, policy, grant and registry
string **stated in advance**, and **RULED by the Operator** on 2026-08-13/14. ⚠️ That is precisely
the path this pack prescribes — *"Missing backend or governance requirements are recorded, never
invented."* **Nothing was inferred from the frame.**

**Schema delivered, exactly as authorized:** 1 table `class_session_materials` · 1 private bucket
`lesson-materials` at **25 MiB** with the ruled **eight** MIME types · 1 `storage.objects` INSERT
policy · **0** table policies · **0** client table grants · **0** enums · registry **21 → 23**
(`material.attached`, `material.removed`).

#### REGISTERED OMISSIONS

1. ⛔ **THE ENTIRE `KEY FOCUS POINTS` COLUMN** — title and chips, on all five lesson cards.
   **RAISED BY THIS PHASE AND DECLINED BY THE OPERATOR:** *"`D-4` gave them a purpose and a position
   constraint and never named an author. There is no authoring surface in the ratified inventory and
   the frame draws them read-only. Building a read for a field nobody can write produces a
   permanently empty panel — worse than absent."* ⚠️ Recorded **with the reason so a later phase does
   not read `D-4`'s mention as licence.** There is no `class_sessions.key_focus`; migration assertion
   `M-6` **fails the build** if one appears. ⛔ `observations.focus_chips` **is not this field** —
   post-session observation versus lesson-plan intent (`G-3`). ▶ Ends only if the academy names an
   author, which returns as its own question with its own schema authorization.
2. ⛔ **`6-week persuasive speaking unit`** on the class header line. `class_modules` has **no
   description column**, measured at HEAD. `A-022` bars schema'ing one from a frame; `C-14` family.
   **NEVER ENDS.**
3. ⛔ **`Junior`** in the breadcrumb and class name. Class Grade is `Beginner`/`Intermediate`/
   `Advanced` (`A-016`, `A-026`/`A-054`). Every label is **read** from `class_grades.display_name`,
   never written as a literal. **NEVER ENDS.**

#### OMITTED FOR ABSENCE OF DATA — a different thing entirely

`LESSON n`, the lesson title, and `Studio 2`. ⚠️ **All three columns EXIST** (`lesson_number`,
`lesson_title`, `room`) and `G-3` ruled the first two **in scope**. They are **NULL on all 17 live
sessions**, measured — so hero `0B` **omits the element** and the card's identity falls back to its
**date**. ⛔ An invented `Lesson 1` is exactly what `0B` forbids. ▶ **This is NOT a
`REGISTERED-OMISSION`** — it ends the moment a session records a lesson, and the fixture mode already
renders the populated branch, which is the only way the omission is proved to be a **decision**
rather than an accident of empty data.

#### ADDED — an Operator addition the frame does not draw

⛔ **REMOVE**, on the same grounds as the back affordance on `13`/`26`/`27`. *"A file nobody can
remove is a worse outcome than an undrawn control, which is the same reasoning that made `D-5`'s
evidence removable."* **DO NOT DELETE IT FOR VISUAL FIDELITY.** Management only.

#### ONE MICROCOPY DIVERGENCE, recorded rather than silently resolved

The frame draws `← Class Overview`; the shared `BackLink` renders `Back to Class Overview`. ▶ The
**shared control wins**, under the standing ruling that *"a second treatment for the same act is the
divergence I keep ruling against"*.

#### ONE CHANGE TO AN ALREADY-ACCEPTED SCREEN

⚠️ **Screen `13`'s `Manage lesson plans` footer control moved from INERT to LIVE.** `P2-4` built it
inert with the stated reason *"Lesson plans arrive with screen 14."* ▶ **That reason has lapsed**, and
leaving it would have made the stated reason **false**. It is the frame's own control
(`.html` line 274: `Manage lesson plans`, `#EC4B96`, `13px`, weight `600`) and screen `14` has **no
other inbound route**. The treatment matches `InertControl` exactly apart from colour, which moves
**toward** the frame. **Reported as a change to an accepted screen.**

```artefact-read
screen: 14
pack: Management - Lesson Plan Management
component: features/management/management-lesson-plans.tsx, components/ui/back-link.tsx
html-values: 11.50px, 16px, 13px, 12px, 11px, 10px, 7px
screen-md-quote: Management administration of lesson plans for a Class Module.
```

**Visual acceptance:** `NOT-RUN` — Operator-set only.
