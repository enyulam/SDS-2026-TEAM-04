# 27 - Management Edit Class - implementation notes

**Append-only.** Add a new entry at the bottom for every implementation checkpoint touching this screen. Never edit or delete an existing entry - a superseded entry is corrected by a later entry that says so.

---

## Entry template - copy below the last entry

```
Timestamp (Asia/Singapore):
Source branch:
Starting commit:
Screen ID:                     27
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

### 2026-08-13 - `P2-3` - screen `27` Management Edit Class SHIPPED

```
Checkpoint:                    PORTAL COMPLETION PLAN phase P2-3
Screens:                       27 (Management Edit Class)
Route:                         /management/classes/[classModuleId]/edit  (CANONICAL; nothing moved)
Starting commit:               62ee67b
Files:                         supabase/migrations/20260813150000_portal_p2_3_class_edit.sql
                               server/modules/class-session/class-edit.ts
                               features/management/management-edit-class.tsx
                               app/(portals)/management/classes/[classModuleId]/edit/page.tsx
                               scripts/tests/portal/prove-p2-3-class-edit.{sql,mjs}
                               scripts/tests/portal/rpc-call-rule.mjs
Validation:                    tsc 0 | eslint 0 | next build 0 | prove:portal-p2-3 0 (12 SQL legs)
                               | nav suite 0 | prove:hero-all 0 | test:integration 0
                               | prove:encoding 0 | prove:no-secrets 0
Rendered proof:                NOT-RUN  (port 3000 held by the Operator's dev server)
VISUAL acceptance:             NOT-RUN
Acceptance status:             PASS claimed on evidence; `Accepted` is Operator-set only
```

#### What shipped

Two `SECURITY DEFINER` RPCs, `admin_update_class_module` and `admin_update_class_session`, and
the screen that drives them. **No write policy and no write grant** - the governed-write pattern
is unchanged, which is why *"zero write policies, zero write grants"* survives a phase that
writes.

**Audit registry 19 -> 21**, exactly the two strings the Operator authorized with the count
stated in advance: **`admin.module_updated`** and **`admin.session_updated`**. `A-057` was
amended in the `C-4` shape, at the **single** declaration site.

#### An operator-supplied premise refuted by measurement - the third

The instruction said *"extend BOTH declaration sites in one migration"*. **There is one.**
`P1-2` consolidated them into `public.audit_action_registry()`, read by `audit_append_event`
and `audit_verify_chain`; *"extend both sites"* was true at Step 7H and is not now. The single
site was extended and an assertion added that **no second site exists**, which is what the
instruction was protecting. **Operator confirmed the premise was stale.**

#### The three refusals - the more valuable half of this phase

Each removes a control the frame draws, and each is recorded so a later phase cannot build the
control and quietly leave it unwired:

1. **The Sun-Sat day strip is NOT built.** Changing which weekdays a class meets means
   **removing sessions**, and **no cancel or delete audit string was ratified**. A session may
   already carry attendance, an observation or a submitted report. ⛔ **ABSENT, not
   present-and-disabled** - a greyed chip reads as *"not wired yet"*, this is *"not
   permitted"*, and the two must not look alike. The existing dates are listed read-only, with
   the reason stated on the surface.
2. **No unassign.** The frame's `-` beside the trainer would leave a session with nobody: a
   different governed action with no ratified string. Choosing a **different** trainer is
   reassignment and works, through the `P2-2b` RPC.
3. **No `Class code`, `Capacity` or `Program`** - `C-14` omits all three, and *"programme"* has
   no entity (`A-016` forbids a hidden `classes` entity).

#### ⛔ No ratified frame draws an inbound control to this screen - REPORTED, not invented

`Management - Classes` states *"Selecting a class card opens `Management - Class Overview`"*,
and `Management - Class Overview` names **no Edit control at all** (a search for `dit` across
its note matches nothing). **No Edit affordance was added to screen `12`**, because inventing a
navigation control the frames do not draw is schema-by-inference's sibling (`A-022`, §7.2).
`27` is reached by its canonical route. **This is an Operator question, recorded as a
dependency.**

#### Other recorded divergences

- The frame's breadcrumb reads `Classes / Junior Public Speaking / Edit`. **`Junior` is a class
  code**, which `C-14` omits, so the breadcrumb carries the module title alone.
- `Room`, `Start time` and `End time` are drawn as dropdowns and built as free inputs - the
  frame enumerates no options and no ruling, table or seed establishes a room inventory or a
  slot vocabulary, so a `<select>` would invent one. `Term` and `Level` **are** selects; both
  are backed by real rows.
- Room, times and term apply **across every session**; each session keeps its own **date**.
  Rewriting the dates too would collapse a term into a single day.
- The form seeds from a session property **only where every session agrees**. A module whose
  sessions differ shows the field **empty**, so saving cannot silently flatten an arrangement
  the form never displayed. The same rule pre-selects the trainer.
- `unchanged` is reported **as itself**. A governed no-op emits nothing (`A-029`), so claiming
  *"saved"* would tell management an edit was recorded when the audit trail deliberately holds
  none.

#### The standing rule this phase mechanized

**A STRUCTURAL ASSERTION CANNOT PROVE A FUNCTION RUNS.** `P2-2`'s migration applied with all
nine assertions green while **both RPCs raised at their first statement** - `coalesce` is SQL
**grammar**, not a schema member, so `pg_catalog.coalesce` cannot resolve, and PL/pgSQL defers
identifier resolution to **call** time. The rule is now mechanized in
`scripts/tests/portal/rpc-call-rule.mjs`: **every RPC migration carries a leg that CALLS its
functions**, with a control proving the detector can fire, and a pairing leg so a future
migration cannot ship without a suite.

Beside it: **a refusal leg must not measure RLS visibility.** `P23-3` counted rows under
`authenticated` with no identity and read 0 against a real baseline of 2 - on a zero baseline
it would have passed while proving nothing, because the prober cannot see what it guards.

#### The phase-scoped-claim defect, found three more times

`P2-3` legitimately moved the registry 19 -> 21 and **three** suites fired: `P2-2`'s create
suite, the terms substrate, and `P2-2b`. Each pinned the registry **total** - a phase-scoped
claim written as a **global absolute**, which measures every *other* phase's behaviour. All
three were re-derived to assert only what their own phase did (its strings present; its
migration file declaring no registry, with a control), and the totals are now **reported**.
**One global ratchet survives, in one place** - `hero-2`'s `P2-6`, 52 -> 54, where moving the
number requires naming the authorization.

---

---

### 2026-08-13 - REBUILT to the frame, Operator AUTHORIZATION A

```
Timestamp (Asia/Singapore):    2026-08-13
Source branch:                 develop  (DEVELOPMENT CLONE)
Starting commit:               2bf54e1
Screen ID:                     27
Existing route audited:        /management/classes/[classModuleId]/edit - UNCHANGED
Components replaced:           features/management/management-edit-class.tsx (layout rebuilt)
Components created:            SectionHeading, Hairline (same file)
DTO and port changes:          NONE
Migration:                     NONE
Validation:                    tsc 0 | eslint 0 | next build 0 | prove:artefact-read screen 27
                               green | prove:portal-p2-3 0 | prove:stage3-authenticated 0
VISUAL acceptance:             NOT-RUN - and see below: it could not previously have PASSED
Acceptance status:             PASS claimed on evidence; `Accepted` is Operator-set only
```

#### Why it was rebuilt

The original layout came from `reference/Management - Edit Class/Management - Edit Class.md` -
a **prose note**. The `.png` and `.html` were **never opened**. It drew **three cards** with the
actions floating below them.

▶ **This frame is layout-identical to screen `26`**: ONE card, three hairline-divided sections,
`Cancel` / `Save Class` inside it. Only the title and breadcrumb differ.

#### What the artefacts say, per artefact

* **`.png`** - one card; `Class Details` · hairline · `Schedule` **including the Sun-Sat day
  strip with Tue and Thu active** · hairline · `Assigned Trainer` with a `230px` search box and
  the trainer row carrying avatar, name, subtitle **and a trailing `-` control** · hairline ·
  right-aligned `Cancel` and `✓ Save Class`.
* **`.html`** - the same computed values as `26`: card `padding: 24px 26px`,
  `border-radius: 18px`, `gap: 20px`; rows `gap: 16px`; controls radius `10px`; section heading
  `15px` over `12px`; chips `padding: 9px 15px`; trainer row `gap: 13px`, name `13.50px`,
  subtitle `11.50px`, initials `12.50px`; trailing control `outline: 1.30px`; footer buttons
  `border-radius: 11px`, text `13.50px`.
* **`screen.md`** (numbered pack) - the governed record: canonical route, and that this screen
  **edits an existing Class Module under its Class Grade**.

#### ⛔ VISUAL acceptance was not merely `NOT-RUN`

Before this rebuild **there was no basis on which it could pass**. It remains `NOT-RUN`.

#### ⚠️ THE THREE REFUSALS ARE UNCHANGED - AND THEIR EVIDENCE IS NOW CORRECT

Measuring the frame changed **nothing** about what this screen may do. It changed **where the
surviving controls sit**, and it corrected the EVIDENCE behind two records:

| Refusal | Previously recorded as | Now |
|---|---|---|
| **The Sun-Sat day strip** | absent, with the frame's content asserted from the NOTE | ⚠️ **The `.png` DOES draw it, Tue and Thu active.** Its absence is a REAL divergence, `EXPECTED / REQUIRED`. Removing sessions has **no cancel or delete audit string**, and a session may already carry attendance, an observation or a submitted report |
| **The trainer row's `-` control** | absent, same basis | ⚠️ **The `.png` DOES draw it.** Absent here because on `27` it would UNASSIGN a persisted session; screen `26` builds the same glyph as `Remove` because there it clears a FORM CHOICE before anything is saved. **Same glyph, different act** |
| **`Class code`, `Program`, `Capacity`** | `C-14` | Unchanged - no column exists and none is proposed |

⛔ **ABSENT, NEVER GREYED** (standing prohibition 17). A disabled day chip on an Edit form reads
as *"not wired yet"*; these are *"not permitted"*, and the two must not look alike. The dates
that exist are listed **read-only** in the strip's place, so the schedule stays legible.

#### One further omission, added at this rebuild

⛔ **The trainer row's SUBTITLE.** `Public Speaking · Employee T-1001` is programme (`C-14`: no
entity) plus the employee ID (Authorization B). Both halves are ruled out, so hero 0B omits the
element; `TrainerChoiceDto` carries no field that could hold one.

#### Artefact-read citation - verified by `prove:artefact-read`

```artefact-read
screen: 27
pack: Management - Edit Class
component: features/management/management-edit-class.tsx
html-values: 18px, 26px, 20px, 16px, 10px, 15px, 12.50px, 13.50px, 11.50px, 1.30px
screen-md-quote: Management edits an existing Class Module under its Class Grade.
```
