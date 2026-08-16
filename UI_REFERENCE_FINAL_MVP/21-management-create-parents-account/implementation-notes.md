# 21 - Management Create Parent Account - implementation notes

**Append-only.** Add a new entry at the bottom for every implementation checkpoint touching this screen. Never edit or delete an existing entry - a superseded entry is corrected by a later entry that says so.

---

## Entry template - copy below the last entry

```
Timestamp (Asia/Singapore):
Source branch:
Starting commit:
Screen ID:                     21
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

## `P2-13` — artefact-read record (2026-08-16)

All three artefacts were opened. Every layout value below was derived from the `.html`, and every
claim about what the frame draws or omits rests on the `.png`.

```artefact-read
screen: 21
pack: Management - Create Parents Account
component: features/management/management-create-parent-screen.tsx
html-values: 16px, 12px, 13px, 14px, 20px, 2px, 3px
screen-md-quote: Not rating-bearing.
```

### ⛔ Refusals and omissions recorded at this screen

| Frame element | Disposition |
|---|---|
| `Relationship: Mother` | **NO COLUMN.** One enum + one column on `parent_student_links`, and the vocabulary is an untaken product decision. ⚠️ **`parent_student_links.parent_role` is the DECOY** (living register entry 1) — its `CHECK` pins it to `'parent'` and would refuse `Mother` |
| `Phone` | **NO COLUMN**, and the open part is WHERE it would live — `accounts` or the profile table. Open since `P2-11` |
| `Send email invite` switch | ⛔ **REFUSED, and not because it is unimplemented.** External delivery is deferred, so nothing sends either way — a switch between two identical outcomes is a control that lies about what it does, and drawn ON it asserts a link was sent |
| `Search Trainer` caption | ⚠️ **A FRAME DEFECT, not a requirement.** This is a student picker on a parent screen; the caption reads `Search students` |
| `Junior · Public Speaking` | ⛔ `Junior` is not a ratified Class Grade (`A-016`, `A-054`). Grade labels are read from data |
| `ID 2025-113` | ⛔ `students` holds no code column. **Cited, not invented** |

All three omissions are stated **on the page** (`CLAUDE.md` §12.12), and the success banner states
plainly that **nothing has left this system**.

---

