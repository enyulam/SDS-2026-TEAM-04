# 03 - Trainer Lesson Plan - implementation notes

**Append-only.** Add a new entry at the bottom for every implementation checkpoint touching this screen. Never edit or delete an existing entry - a superseded entry is corrected by a later entry that says so.

---

## Entry template - copy below the last entry

```
Timestamp (Asia/Singapore):
Source branch:
Starting commit:
Screen ID:                     03
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

*(none yet)*
---

## `P2-18` — screen `03` built, 2026-08-17

**Route** `/trainer/my-classes/lesson-plan` (canonical, per `SCREEN_INDEX.md`;
`?module=<id>` is presentation selection only — `A-045`). **Component**
`features/trainer/trainer-lesson-plan-screen.tsx`.

### ⛔ TWO PANELS THE FRAME DRAWS ARE NOT BUILT, AND BOTH ARE SCHEMA STOPS

Neither is a design gap. The frame draws them; the database cannot supply them.

**1. `KEY FOCUS POINTS` — ruled IN SCOPE, blocked on a column.**

⚠️ **Operator ruling, 2026-08-17: BUILD THE KEY FOCUS CHIPS.** The reasoning
matters more than the verdict, because a later reader will check `G-3` and find
a prohibition: *"the surviving prohibition is about POSITION, and it protects
§10 Phase 1 exit (c) — the governed carried-over previous-session focus. Screen
03 is the lesson-plan surface. It is not the roster and carries no governed
focus line, so there is nothing there for the chips to displace or be mistaken
for. `D-4` permitted them 'in a distinct visual position with a distinct label'.
On 03 that condition is satisfied trivially, because the position they would
have contended for does not exist on this screen."*

▶ **They are in scope and are still not built**, because the same ruling made
the schema separate: *"If they need a column, STOP and state it. This ruling
authorizes the chips, not the schema."* They need one. Measured at HEAD — an
exhaustive catalogue sweep for `%focus%`, `%chip%`, `%objective%`, `%topic%`,
`%plan%`, `%tag%`, `%outcome%` across all 30 tables returns **exactly two
columns**, `observations.focus_chips` and `observations.strength_chips`, and
both are the trainer's post-session governed ASSESSMENT data — the `G-3` decoy.

⚠️ **AND THE FRAME ITSELF SHOWS WHY THE PROHIBITION READS AS IT DOES.** The
`.html`'s own chip values are `Audience awareness`, `Sentence flow`, `Eye
contact`, `Vocal projection`, `Tonality`, `Emotional expression` — **six of the
nine B.E.S.T dimension names, verbatim.** ▶ The chips are drawn in the
assessment vocabulary, so an implementer sourcing them reaches for the
assessment table by the shortest honest-looking path. That is the conflation
`G-3` exists to prevent.

⛔ **A COLUMN ALONE WOULD NOT BE ENOUGH.** `PLMa-KEYFOCUS` records the Operator
declining this panel at `P2-6` because *"`D-4` names no author, no authoring
surface exists, and a read for a field nobody can write is a permanently empty
panel."* The chips need a column, an author and an authoring surface.

⛔ **DECLINED AGAIN — the second ruling, and the one that stands.** On this
stop, the Operator declined the chips a second time, **permanently until an
authoring surface exists**, superseding the BUILD ruling above: *"a column
without an author produces a permanently empty panel, and the frame's values
being six dimension names verbatim means the shortest honest-looking source is
the governed assessment table. That is not plumbing."* They recorded that the
first ruling *"was internally inconsistent"* — it authorized the chips on the
same ground `P2-6` had already declined them on, which is what the stop caught.

⚠️ **THE SHARPER FORM, RECORDED BECAUSE IT INVERTS THE USUAL READING:**
*"`G-3`'s prohibition reads the way it does BECAUSE the frame draws the chips in
the assessment vocabulary. The frame is the REASON for the rule, not merely
subject to it."*

**2. ✅ `SLIDES & MATERIALS` — AUTHORIZED AND BUILT.**

~~`class_session_materials` returns `permission denied for table` for the fixture
trainer. It needs a trainer policy with its minimum matching grant, or a read
RPC.~~ **The Operator authorized the read side under the batch and left the
choice to this phase. The call was a READ RPC**, on three grounds:

1. **RLS filters rows, not columns.** The table carries `storage_object_path`
   and both uploader identity columns. A policy hands a trainer all three; the
   frame needs `display_name`, `media_type` and `byte_size`.
2. **`P2-6` shipped this table with 0 policies and 0 client table grants**,
   SECURITY DEFINER RPCs only. A policy now would be a second access model.
3. **A raw storage path in a client is what §3.1 forbids outright.**

Shipped as `public.trainer_list_session_materials(uuid)` with `EXECUTE` to
`authenticated` — **one function, one grant, nothing else.**

⛔ **THIS IS THE LISTING, NOT THE DOWNLOAD.** The signed-URL mint is a separate
function and is **not** built: the table holds **0 rows**, so no proof could
exercise it. **No download control is rendered** — a control that can open
nothing reads as a defect rather than as unbuilt scope. The write split is
untouched: management uploads, the trainer reads.

✅ **AND THE FRAME'S EMPTY COPY IS NOW USED.** ~~*"Slides not uploaded yet"* is
DELIBERATELY NOT USED — it would assert the materials are absent when the truth
is this screen cannot read them.~~ **It became TRUE the moment the read landed**,
which is exactly the condition the Operator set. `P2-10`'s rule discharging:
*"not yet"* and *"cannot see"* are different facts, and now the true one is
*"not yet"*.

### ⛔ THE SCREEN CARRIES NO GOVERNED PREVIOUS-SESSION-FOCUS LINE

The ruling's third constraint: **if a phase ever adds one, the chips move or
go.** Nothing on this page presents the trainer's carried-over focus — the
roster (screen `06`) does, and that is the surface `G-3` protects.

### Screen `02`'s `Lesson plan` control is now ENABLED

`P2-17` shipped it **disabled with a reason** rather than absent, because the
destination was ratified but unbuilt. ▶ `P2-18` built it, so the reason lapsed
and the control opens. **The pattern discharged exactly as designed** — the
affordance was never removed, so nothing had to be re-invented, only unlocked.

### ⛔ THREE MEASURED VALUES WERE READ AND DELIBERATELY NOT CITED

`AR-5` rejects a citation the component does not build to, and it was right to
fire on the first draft of this block. The decision, recorded rather than
quietly dropped:

* **`22px`** (page title) and **`11.50px`** (breadcrumb) are measured in this
  `.html` and are real — but they are built by the shared `PageHeading`, not by
  this component, and are already cited where they are built. Citing them here
  would claim credit this file cannot support.
* **`999px`** (the timing badges' radius) is built as Tailwind's `rounded-full`,
  which is that value — but the literal never appears in the source, and a
  citation the scanner cannot find in the code is exactly the mismatch `AR-5`
  exists to catch. **The shape is built; the literal is not written, so it is
  not claimed.**

```artefact-read
screen: 03
pack: Trainer - Lesson Plan
component: features/trainer/trainer-lesson-plan-screen.tsx
html-values: 20px, 16px, 13px, 12px, 11px, 10px
screen-md-quote: Not rating-bearing.
```
