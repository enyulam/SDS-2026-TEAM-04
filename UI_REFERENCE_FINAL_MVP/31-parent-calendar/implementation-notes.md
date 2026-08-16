# 31 - Parent Calendar - implementation notes

**Append-only.** Add a new entry at the bottom for every implementation checkpoint touching this screen. Never edit or delete an existing entry - a superseded entry is corrected by a later entry that says so.

---

## Entry template - copy below the last entry

```
Timestamp (Asia/Singapore):
Source branch:
Starting commit:
Screen ID:                     31
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

- **GC-2 — Per-day rating colouring, a "Developing" status pill, dimension chips, "13 mastered days", counters "2 Beginning / 7 Developing / 4 Mastering / 3 Mastered", AND an explicit legend glossing all four levels — all on a PARENT surface. Prohibited: no per-dimension rating exposure to parents in any form or wording. DO NOT BUILD. (This pack previously carried NO recorded conflict.)**

**No authoritative visual bytes (PNG or HTML) were altered by this recording.**

---

## Artefact-read record — `P2-23`, 2026-08-17

Screen `31` was built under the `AR-1b` rule, so it leaves `UNMEASURED` by the
only exit that list has: being built, never annotated out.

⚠️ **THE PROSE NOTE NAMES THE RATING APPARATUS AND THE FRAME ENCODES IT**, which
is the §7.4.1 point from the other direction on this screen: here the note and
the frame AGREE, and both are refused by `GC-2`/`C-12`. Measured in the
`.html` — `Beginning`, `Developing`, `Mastering`, `Mastered` twice each,
`mastered days` once, `What the colours mean` once. ▶ The refusals refuse
something that demonstrably exists.

⚠️ **`15px` WAS READ AND DELIBERATELY NOT CITED** — 14 occurrences in the
`.html`, none in the built component. Citing a value the component does not use
is exactly what `AR-5` rejects.

```artefact-read
screen: 31
pack: Parent - Calendar
component: features/parent/parent-calendar-screen.tsx
html-values: 16px, 13px, 12.50px, 11.50px, 11px, 10px, 20px, 999px, 12px
screen-md-quote: Not rating-bearing.
```
