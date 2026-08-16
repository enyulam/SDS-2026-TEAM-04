# 04 - Trainer Students - implementation notes

**Append-only.** Add a new entry at the bottom for every implementation checkpoint touching this screen. Never edit or delete an existing entry - a superseded entry is corrected by a later entry that says so.

---

## Entry template - copy below the last entry

```
Timestamp (Asia/Singapore):
Source branch:
Starting commit:
Screen ID:                     04
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

## `P2-20` — artefact-read record (2026-08-16)

All three artefacts were opened. Every layout value below was derived from the `.html`, and every
claim about what the frame draws or omits rests on the `.png`.

```artefact-read
screen: 04
pack: Trainer - Students
component: features/trainer/trainer-students-screen.tsx
html-values: 17px, 13px, 11px, 12.50px, 11.50px, 999px, 18px, 10px
screen-md-quote: Not rating-bearing.
```

### ⛔ Refusals and omissions recorded at this screen

| Frame element | Disposition |
|---|---|
| The `Level` column — `Mastering` / `Developing` / `Mastered` / `Beginning` chips | **REFUSED, NEVER ENDS.** `GC-7` below, and `G-2` independently: one chip for a learner's whole assessment history is a roll-up, barred on every surface regardless of audience. **Absent, not empty** — no heading, no cell, no dash, no softened replacement |
| `ID 2025-113` | **NO COLUMN EXISTS.** `students` holds `id`, `centre_id`, `full_name`, `is_active` and three timestamps — no external code. **CITED, NOT DISABLED**: rendering the UUID instead would put a governed internal identifier where the frame intends a human roll number, and would look correct |
| `—` in `Last assessed` | **BUILT AS DRAWN.** The pack's own note: *"A dash is shown when no recent assessment date is available."* NULL means NOT ASSESSED (hero `0B`) — 3 of 13 fixture rows exercise it |
| Class filter · student search | **BUILT.** Both narrow an already-authorized list, so neither is an authorization decision |

⚠️ **A NEAR-MISS RECORDED FOR THE LIVING DECOY REGISTER (plan §37):** `class_grades.code` holds
`beginner` / `intermediate` / `advanced`, and the refused chips read `Beginning` / `Developing` /
`Mastering` / `Mastered`. **`Beginner` and `Beginning` are one letter apart and are different
vocabularies** (`A-054`). Sourcing the refused column from it would ship a **Class Grade dressed as a
competency rating** — and the frame would appear satisfied.

Both omissions are stated **on the page**, not only here (`CLAUDE.md` §12.12).

---

## GOVERNANCE CONFLICTS RECORDED - 2026-08-08 (Final MVP Phase A2, operator ruling Q-24)

**These are conflicts between the ratified Figma reference for this screen and B.E.S.T governance. Governance WINS. Do not build the reference behaviour described below.**

Source of record: `UI_REFERENCE_FINAL_MVP/FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md` (GC register, declared authoritative by `FINAL_MVP_AUTHORITY_LOCK.md` section 28.2). The `reference/` tree is VISUAL rank 1 but FUNCTIONAL rank 5 (lowest) - it cannot override a functional, privacy or security rule.

- **GC-7 — Competency ratings appear in a "Level"/chips column while screen.md section 8 declares this screen "Not rating-bearing". GOVERNANCE WINS on the functional ladder. DO NOT BUILD the rating column.**

**No authoritative visual bytes (PNG or HTML) were altered by this recording.**

