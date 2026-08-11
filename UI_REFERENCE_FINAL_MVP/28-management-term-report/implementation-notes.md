# 28 - Management Term Report - implementation notes

**Append-only.** Add a new entry at the bottom for every implementation checkpoint touching this screen. Never edit or delete an existing entry - a superseded entry is corrected by a later entry that says so.

---

## Entry template - copy below the last entry

```
Timestamp (Asia/Singapore):
Source branch:
Starting commit:
Screen ID:                     28
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

- **GC-5 — Audience toggle, Performance Summary grid, Overall Grade, "Save as draft". Prohibited by A-038 and A-036. DO NOT BUILD.**
- **GC-6 — Per-dimension rating surfaces shown to MANAGEMENT. Prohibited (CLAUDE.md section 6 / A-038). DO NOT BUILD.**

  ⚠️ **CORRECTED 2026-08-11 — operator ruling `C-18`** (`FINAL_MVP_PORTAL_DECISIONS.md` §C). **THE CONCLUSION IS UNCHANGED — `DO NOT BUILD` STILL STANDS — BUT THE GROUND HAS MOVED, AND THE BULLET ABOVE NOW CITES A LAPSED ONE.**

  ⛔ **`A-038` NO LONGER BARS MANAGEMENT FROM RATINGS AS SUCH.** Operator ruling **`D-1`** (2026-08-11) permits Management to **VIEW the nine per-dimension ratings, READ ONLY**. Quoting `A-038`'s management rating bar as live is now wrong, and a reader who checks it will find it superseded — which is exactly how a genuine prohibition gets discarded along with a stale citation.

  ✅ **TWO INDEPENDENT GROUNDS CARRY SCREEN `28` INSTEAD. Either alone is sufficient:**

  1. **`C-9`** — `D-1` reaches **REPORT DETAIL SURFACES ONLY**. This screen is not one. *"Ratings on a list or a statistics surface is a different disclosure shape — it invites comparison between children, which is not what I authorized."*
  2. **`G-2`** — the **`"Overall"` / `"Strongest / Focus area"`** limbs are **roll-up ratings**, and a roll-up is **PERMANENTLY EXCLUDED on every surface**. ⚠️ `G-2`'s own `A-038`-derived ground lapsed with `D-1`; it survives on its two others — the roll-up is **unratified**, and on a Parent surface it is the **`Q-27`** leak.

  ⛔ **NOTHING ON THIS SCREEN CHANGES.** Do not add a rating badge, bar, column, tile or chip, and **do not read `D-1` as permitting one here.** The surface `D-1` actually moves is **screen `19`**.

  ⛔ **AND SCREEN `28` IS DEFERRED OUTRIGHT — operator ruling `C-11`, 2026-08-11.** `D-3` authorizes the term **structure** only; **End-of-Term report generation stays out of scope**. ⚠️ **`A-044`'s requirement that all 24 deferred screens are required for the final MVP is NOTED AND UNMET, DELIBERATELY.** Do not build this screen.

**No authoritative visual bytes (PNG or HTML) were altered by this recording.**

