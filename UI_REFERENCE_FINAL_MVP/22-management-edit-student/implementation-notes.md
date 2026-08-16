# 22 - Management Edit Student - implementation notes

**Append-only.** Add a new entry at the bottom for every implementation checkpoint touching this screen. Never edit or delete an existing entry - a superseded entry is corrected by a later entry that says so.

---

## Entry template - copy below the last entry

```
Timestamp (Asia/Singapore):
Source branch:
Starting commit:
Screen ID:                     22
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

## `P2-14` — artefact-read record (2026-08-16)

All three artefacts were opened. Every layout value below was derived from the `.html`, and every
claim about what the frame draws or omits rests on the `.png`.

```artefact-read
screen: 22
pack: Management - Edit Student
component: features/management/management-edit-student-screen.tsx
html-values: 15px, 12px, 13px, 12.50px, 13.50px, 11.50px, 22px, 16px
screen-md-quote: Not rating-bearing.
```

### ⛔ Refusals and omissions recorded at this screen

| Frame element | Disposition |
|---|---|
| *"Can be undone within 30 days"* | ⛔ **DROPPED BY OPERATOR RULING, 2026-08-16** — *"build the withdrawal, drop the sentence. A retention promise with no mechanism is a lie with a deadline."* Retention is Phase 4 (`CLAUDE.md` §10). ✅ What replaces it is TRUE and carries no deadline: nothing is deleted, and re-enrolment is a management action |
| Date of birth · Gender · Student ID | **NO COLUMN.** Each is an untaken product decision — see screen `20`'s record |
| Guardian name · contact · email · home address | ⛔ **REFUSED BY RULING.** Screen `21` creates the guardian properly; columns here would be a second, unlinked copy nothing keeps in step |
| `Change photo` | **DEFERRED by `C-15`** — a bucket, its policies, an upload transport and a column |
| `Junior · Public Speaking` chip | ⛔ `Junior` is not a ratified Class Grade (`A-016`, `A-054`). Chips render from data |

⚠️ **THE NAME SPLIT IS A LOSSY GUESS THE SCHEMA FORCES.** `students` stores one `full_name` and the
frame draws two boxes; the split is on the **last** space so a multi-part given name survives
("Mary Anne Tan" → "Mary Anne" + "Tan"), which is the failure mode that would otherwise silently
rename a child on save.

All seven omissions are stated **on the page** (`CLAUDE.md` §12.12).

---

## GOVERNANCE CONFLICTS RECORDED - 2026-08-08 (Final MVP Phase A2, operator ruling Q-24)

**These are conflicts between the ratified Figma reference for this screen and B.E.S.T governance. Governance WINS. Do not build the reference behaviour described below.**

Source of record: `UI_REFERENCE_FINAL_MVP/FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md` (GC register, declared authoritative by `FINAL_MVP_AUTHORITY_LOCK.md` section 28.2). The `reference/` tree is VISUAL rank 1 but FUNCTIONAL rank 5 (lowest) - it cannot override a functional, privacy or security rule.

- **GC-14 — "Can be undone within 30 days" withdrawal copy. Unratified retention semantics; PDPA enforcement logic is Phase 4. DO NOT BUILD or promise this behaviour.**

**No authoritative visual bytes (PNG or HTML) were altered by this recording.**

