# 17 - Management Students - implementation notes

**Append-only.** Add a new entry at the bottom for every implementation checkpoint touching this screen. Never edit or delete an existing entry - a superseded entry is corrected by a later entry that says so.

---

## Entry template - copy below the last entry

```
Timestamp (Asia/Singapore):
Source branch:
Starting commit:
Screen ID:                     17
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

## GOVERNANCE CONFLICTS RECORDED - 2026-08-08 (Final MVP Phase A2, operator ruling Q-24)

**These are conflicts between the ratified Figma reference for this screen and B.E.S.T governance. Governance WINS. Do not build the reference behaviour described below.**

Source of record: `UI_REFERENCE_FINAL_MVP/FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md` (GC register, declared authoritative by `FINAL_MVP_AUTHORITY_LOCK.md` section 28.2). The `reference/` tree is VISUAL rank 1 but FUNCTIONAL rank 5 (lowest) - it cannot override a functional, privacy or security rule.

- **GC-6 — Per-student competency badges / per-dimension bars / "Overall" / "Strongest / Focus area" shown to MANAGEMENT. Prohibited (CLAUDE.md section 6 / A-038). DO NOT BUILD.**

  ⚠️ **CORRECTED 2026-08-11 — operator ruling `C-18`** (`FINAL_MVP_PORTAL_DECISIONS.md` §C). **THE CONCLUSION IS UNCHANGED — `DO NOT BUILD` STILL STANDS — BUT THE GROUND HAS MOVED, AND THE BULLET ABOVE NOW CITES A LAPSED ONE.**

  ⛔ **`A-038` NO LONGER BARS MANAGEMENT FROM RATINGS AS SUCH.** Operator ruling **`D-1`** (2026-08-11) permits Management to **VIEW the nine per-dimension ratings, READ ONLY**. Quoting `A-038`'s management rating bar as live is now wrong, and a reader who checks it will find it superseded — which is exactly how a genuine prohibition gets discarded along with a stale citation.

  ✅ **TWO INDEPENDENT GROUNDS CARRY SCREEN `17` INSTEAD. Either alone is sufficient:**

  1. **`C-9`** — `D-1` reaches **REPORT DETAIL SURFACES ONLY**. This screen is not one. *"Ratings on a list or a statistics surface is a different disclosure shape — it invites comparison between children, which is not what I authorized."*
  2. **`G-2`** — the **`"Overall"` / `"Strongest / Focus area"`** limbs are **roll-up ratings**, and a roll-up is **PERMANENTLY EXCLUDED on every surface**. ⚠️ `G-2`'s own `A-038`-derived ground lapsed with `D-1`; it survives on its two others — the roll-up is **unratified**, and on a Parent surface it is the **`Q-27`** leak.

  ⛔ **NOTHING ON THIS SCREEN CHANGES.** Do not add a rating badge, bar, column, tile or chip, and **do not read `D-1` as permitting one here.** The surface `D-1` actually moves is **screen `19`**.
- **GC-7 — Ratings in a "Level"/chips column while screen.md section 8 declares the screen "Not rating-bearing". GOVERNANCE WINS. DO NOT BUILD.**

**No authoritative visual bytes (PNG or HTML) were altered by this recording.**


---

## `P2-8` — artefact-read record (2026-08-14)

All three artefacts were opened. Every layout value below was derived from the `.html`, and every
claim about what the frame draws or omits rests on the `.png`.

```artefact-read
screen: 17
pack: Management - Students
component: features/management/management-students-screen.tsx
html-values: 12.50px, 17px, 13px, 11px, 18px
screen-md-quote: Management list over the centre's students.
```

### ⛔ Refusals recorded at this screen

| Frame element | Disposition |
|---|---|
| The `Overall` rating chip column | **REFUSED, NEVER ENDS.** `C-9` (its register row names `P2-8`) and `G-2`. **Absent, not empty** — no heading, no cell, no dash |
| `ID 2025-113` | **REGISTERED-OMISSION.** `public.students` carries no code column, measured at HEAD (`PDT-3`) |
| `Junior` | Not a ratified Class Grade (`A-016`, `A-026`/`A-054`). Labels are READ from `class_grades` |
| `Register Student` · `Add Parent` | **REGISTERED-OMISSION, ENDS at `P2-12`/`P2-13`.** Destinations not built |
| `View more ›` | **REGISTERED-OMISSION, ENDS at `P2-9`.** Screen `18` not built |

### ⚠️ `AR-4-17` — SECOND INSTANCE OF THE FRACTIONAL-VALUE WALL. NOT a second `KNOWN-RED`.

`AR-4` requires **≥6 distinct** values with **≥2 fractional**. Measured, this screen can honestly
cite **five**, of which **one** is fractional.

**FRACTIONAL.** The frame carries exactly three — `10.50px`, `12.50px`, `13.50px` — and **only
`12.50px` belongs to this screen's own component**. `10.50px` is the shell's `Management Portal`;
`13.50px` is the shell's sidebar nav, whose only other use is the **unbuilt** `Add Parent`.

**DISTINCT.** `12.50px` (class cell, guardian cell, search, select) · `17px` (`All Students`) ·
`13px` (learner name) · `11px` (pill, column headings) · `18px` (table card radius). A sixth was
cited and **withdrawn**: `999px` was in the first draft and `AR-5` correctly rejected it — the
component uses `rounded-full`, so the value was **quoted, not built to**. ▶ Leaving it in would
have been the exact move the screen-`14` ruling refused, caught by a leg rather than by me.

⚠️ **A related gap, recorded rather than papered over:** the frame's row avatar is **`36px`**, and
the shared `Avatar` offers `24 / 32 / 40 / 44 / 48 / 58` — **no `36px` size exists**. The nearest
(`small`, 32px) is used. Adding a size would touch a shared control on accepted screens, so it is
recorded here instead of done.

⛔ **Every route to green was refused, on the Operator's own screen-`14` reasoning:** citing the
frame's icon-internal geometry (`1.67px` outlines, `5.83px` paths) is **fabricating evidence** —
the component does not build to it; rewriting the shared shell touches accepted screens; lowering
the threshold **"stops measuring the next frame"**.

▶ **This is escalated, not recorded as settled.** The screen-`14` ruling says: *"If a later frame
hits the same wall, bring it to me; two instances would make it a rule problem rather than a frame
accident."* **Two instances now exist.** Awaiting the Operator's ruling on the RULE.
