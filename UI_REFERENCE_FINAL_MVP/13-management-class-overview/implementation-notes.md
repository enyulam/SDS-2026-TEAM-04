# 13 - Management Class Overview - implementation notes

**Append-only.** Add a new entry at the bottom for every implementation checkpoint touching this screen. Never edit or delete an existing entry - a superseded entry is corrected by a later entry that says so.

---

## Entry template - copy below the last entry

```
Timestamp (Asia/Singapore):
Source branch:
Starting commit:
Screen ID:                     13
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

### 2026-08-13 - `P2-4` - screen `13` Management Class Overview SHIPPED

```
Checkpoint:                    PORTAL COMPLETION PLAN phase P2-4
Route:                         /management/classes/[classModuleId]  (CANONICAL; nothing moved)
Starting commit:               c8c56f4
Files:                         supabase/migrations/20260813180000_portal_p2_4_class_overview.sql
                               lib/shared/class-health.ts
                               server/modules/class-session/class-overview.ts
                               features/management/management-class-overview.tsx
                               app/(portals)/management/classes/[classModuleId]/page.tsx
                               scripts/tests/portal/prove-p2-4-class-overview.{sql,mjs}
                               scripts/tests/portal/suite-output-rule.mjs
Validation:                    tsc 0 | eslint 0 | next build 0 | prove:portal-p2-4 0
                               | all 14 portal suites 0 | prove:hero-all 0 | test:integration 0
                               | prove:stage3-authenticated 0 (34 PASS)
Rendered proof:                PASS  (S3-M5-r, S3-M5-bars)
VISUAL acceptance:             NOT-RUN
Acceptance status:             PASS claimed on evidence; `Accepted` is Operator-set only
```

#### What shipped

Two reviewed `SECURITY DEFINER` READS. **Zero** new table, column, enum, policy or write grant;
**audit registry UNMOVED at 21** — a read is not a governed action (`A-029`).

⛔ **They exist only because `reports`, `observations` and `report_evidence` carry ZERO policies
and ZERO client grants**, measured at HEAD. Unlike screen `12`, this surface cannot be a direct
RLS read. Assertion **`V-7`** fails the build if that ever stops being true, so the justification
cannot rot silently.

#### ⛔ The frame is overridden, and the omission is EXPECTED

This frame's own note lists **B.E.S.T. Ratings** and a *"rubric focus-area list … assessed
speaking criteria such as audience awareness, body language, and vocal projection"*. **NOT
BUILT.** `C-9` confines `D-1`'s nine per-dimension ratings to report **DETAIL** surfaces because
ratings on an overview *"invite comparison between children"*; `G-2` bars every roll-up on every
surface, permanently.

Enforced three deep: migration `V-4` (**bare-substring** match, so it catches
`observation_ratings`, `report_version_ratings` and `competency_rating` without enumerating them
— and the next rating column nobody has written yet), `P26-7` on the returned shape, and a
contract declaring no field that could hold one. ✅ `S3-M5-bars` measures it on the painted page.

⚠️ What legitimately survives from that frame section is the single **most frequent
improvement-focus tag**, which `CLAUDE.md` §6 mandates by name — computed **server-side**,
returned as **one string**, never the underlying tags (Operator ruling).

#### ✅ `C-17` — the Class Health Summary, a governance-mandated addition the frame OMITS

`CLAUDE.md` §6's four conditions, **verbatim**, top to bottom, first match wins. Extracted to
`lib/shared/class-health.ts` and shared with the fixture rather than copied.

#### ⛔ `A-038` per-row gating, built to the RULE

`submitted` → canonical report · `trainer_approved` → final review · any earlier status →
reminder, with **no report content at all** · **`No Report` → no button**, a plain "—". No
generic "view report" handler is shared across them.

#### Registered omissions

1. **`Trainer Assistant (TA)`** on the class card — `A-014`/`G-7`. **PROHIBITED, NEVER ENDS.**
2. **`Manage lesson plans`** (screen `14`, `P2-6`) and **`View Overall Class Statistics`**
   (screen `16`, `P2-16`) — **INERT with a stated reason**. ⚠️ This is the INERT treatment
   (target not yet built), **not** the ABSENT treatment (capability refused): standing
   prohibition 17 keeps them apart.
3. **Lesson name and number** render only where recorded — **NULL means NOT RECORDED** (hero 0B).
4. ⛔ **NO EDIT CONTROL, AND ITS ABSENCE IS RULED.** Neither this frame nor `12` draws an inbound
   affordance to screen `27`. Operator: a **DESIGN GAP, not a build gap** — *"a question for the
   design set, not something the build resolves"*. Do not add one anywhere.

---


---

## GOVERNANCE CONFLICTS RECORDED - 2026-08-08 (Final MVP Phase A2, operator ruling Q-24)

**These are conflicts between the ratified Figma reference for this screen and B.E.S.T governance. Governance WINS. Do not build the reference behaviour described below.**

Source of record: `UI_REFERENCE_FINAL_MVP/FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md` (GC register, declared authoritative by `FINAL_MVP_AUTHORITY_LOCK.md` section 28.2). The `reference/` tree is VISUAL rank 1 but FUNCTIONAL rank 5 (lowest) - it cannot override a functional, privacy or security rule.

- **GC-9 — The frame shows a status-agnostic "Stats" action on every row and NO Class Health Summary. CLAUDE.md section 6 mandates per-row status gating and forbids "one generic view-report handler shared across all rows"; the Class Health Summary is mandated. The frame is WRONG and INCOMPLETE — build to governance, not to the frame.**

**No authoritative visual bytes (PNG or HTML) were altered by this recording.**

---

### 2026-08-13 - REBUILT to the frame, Operator AUTHORIZATION A

```
Timestamp (Asia/Singapore):    2026-08-13
Source branch:                 develop  (DEVELOPMENT CLONE)
Starting commit:               6e87f43
Screen ID:                     13
Existing route audited:        /management/classes/[classModuleId] - UNCHANGED
Components replaced:           features/management/management-class-overview.tsx
Components created:            HeaderCard, StatTiles, LessonTable, ReportProgressChip,
                               InertControl, StudentReportStatus (same file);
                               Avatar size/shape `banner`, MEASURED FROM THE FRAME
Projection change:             readClassHeaderCore (class-session/class-overview.ts)
DTO and port changes:          ClassHeaderDto on the contract, the Adapter DTO and the fixture
Migration:                     NONE
Validation:                    tsc 0 | eslint 0 | next build 0 | prove:artefact-read screen 13
                               green | prove:portal-p2-4 0 | prove:stage3-authenticated 0
VISUAL acceptance:             NOT-RUN - and see below: it could not previously have PASSED
Acceptance status:             PASS claimed on evidence; `Accepted` is Operator-set only
```

#### ⛔ THE WITHDRAWN FINDING, AND ITS CORRECTION

The `P2-4` build reported *"screen `13`'s frame draws NO Edit control"*, and a **DESIGN GAP**
disposition was ruled on that premise. ⛔ **THE PREMISE WAS FALSE.** `Management - Class
Overview.png` draws **`✎ Edit class`** in the header card, top-right, beside `ASSIGNED TRAINER`
and `ASSISTANT`.

The claim was a `grep` over the pack's **prose note**, whose navigation section lists only
`Manage lesson plans` and `View Overall Class Statistics`. ▶ **A note cannot support *"the frame
draws no X"*.** The control is built now, wired to `27` at its canonical route:
**`TRUE-DRIFT`, not a design gap.**

⚠️ **THE SAME CORRECTION APPLIES TO THE RATINGS CLAIM.** The `P2-4` record said *"the frame's
own note lists B.E.S.T. Ratings and a rubric focus-area list … NOT BUILT, and this is governance
overriding a frame"*. Measured against the `.png`: **this frame draws no rating anywhere.** What
it draws is a per-lesson `FOCUS` chip column. ⛔ **The bar is unchanged and still absolute** —
only its stated ground moves from *"governance overrides a frame that draws ratings"* to *"the
frame draws none, and none may be added"*.

#### What the artefacts say, per artefact

* **`.png`** - header card (tile chip, title, `Active` badge, meta line, `ASSIGNED TRAINER`,
  `ASSISTANT`, `✎ Edit class`); two stat tiles (`LEARNERS 12`, `ATTENDANCE 94%` in teal); a
  lesson **TABLE** with `DATE · LESSON · FOCUS · REPORT STATUS` and an unlabelled `Stats ›`
  column; and a footer of two controls inside the same card.
* **`.html`** - header card `padding: 20px 22px`, `border-radius: 18px`, `gap: 18px`; chip
  `58px` at `border-radius: 15px`, `font-size: 18px`; meta line `12.50px`; column labels
  `9.50px` at `letter-spacing: 0.60px`; stat value `24px`; table header `10px` at
  `letter-spacing: 0.40px` with a `110px` DATE column; rows `padding: 12px 14px` on `#F7F8FB`
  at `border-radius: 12px`; `Edit class` at `padding: 9px 14px/16px`, `border-radius: 999px`,
  `outline: 1px #E3E7EE`.
* **`screen.md`** (numbered pack) - the governed record: canonical route, node, and the
  standing management prohibitions.

#### ⛔ VISUAL acceptance was not merely `NOT-RUN`

Before this rebuild **there was no basis on which it could pass** - the layout was derived from
the prose note. It remains `NOT-RUN`, and a rendered DOM-text proof never becomes one.

#### The ATTENDANCE tile, and why it needed no migration

`attendance` carries **3 policies** including `attendance_select_management` (centre-scoped via
`app_has_active_membership`) **and** an `authenticated` SELECT grant - **measured at HEAD before
the read was written**. So the header is a direct RLS-scoped read like screen `12`, while the
report grid still needs the two `SECURITY DEFINER` reads, because `reports` and `observations`
carry zero of either.

⛔ **`attendancePercent` is `null`, never `0`, when nothing was recorded**, and the surface then
**omits the whole tile** (hero 0B). `0%` is a measured claim that a class met and nobody came.

#### Registered omissions

1. ⛔ **`ASSISTANT`** in the header card - `A-014`/`G-7`. **PROHIBITED, NEVER ENDS**; no DTO
   field exists that could carry one.
2. ⚠️ **The `FOCUS` chip column** - lesson-plan focus (`D-4`/`P2-6`), no substrate at HEAD.
   AUTHORIZATION B. `G-3` additionally bars it from any governed-focus surface.
3. ⚠️ **The per-row `Stats ›` link** - screen `16` (`P2-16`). AUTHORIZATION B.
4. ⚠️ **`Manage lesson plans`** and **`View Overall Class Statistics`** - built as CONTROLS in
   the frame's footer position, **INERT with a stated reason**. Not the ABSENT treatment.
5. ⚠️ **Lesson name/number, room, times and the attendance tile** render only where recorded -
   **NULL means NOT RECORDED** (hero 0B).

#### Two governance-mandated additions the frame omits

**Student Report Status** (`CLAUDE.md` §6, gated by `A-038`) and the **Class Health Summary**
(`C-17`). ⚠️ The first is **not** the frame's `REPORT STATUS` column: that column is per
**LESSON**, the ratified table is per **LEARNER**. Different axes, so both exist.

#### Artefact-read citation - verified by `prove:artefact-read`

```artefact-read
screen: 13
pack: Management - Class Overview
component: features/management/management-class-overview.tsx, components/ui/avatar.tsx, components/ui/page-heading.tsx
html-values: 18px, 15px, 12.50px, 9.50px, 0.60px, 0.40px, 24px, 12px, 110px, 11.50px, 3px
screen-md-quote: Management overview of one Class Module, including per-row status gating governed by
```
