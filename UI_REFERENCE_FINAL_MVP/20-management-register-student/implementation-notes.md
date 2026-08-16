# 20 - Management Register New Student - implementation notes

**Append-only.** Add a new entry at the bottom for every implementation checkpoint touching this screen. Never edit or delete an existing entry - a superseded entry is corrected by a later entry that says so.

---

## Entry template - copy below the last entry

```
Timestamp (Asia/Singapore):
Source branch:
Starting commit:
Screen ID:                     20
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

## `P2-12` — artefact-read record (2026-08-16)

All three artefacts were opened. Every layout value below was derived from the `.html`, and every
claim about what the frame draws or omits rests on the `.png`.

```artefact-read
screen: 20
pack: Management - Register Student
component: features/management/management-register-student-screen.tsx
html-values: 15px, 12px, 13px, 12.50px, 11.50px, 22px, 16px, 999px
screen-md-quote: Not rating-bearing.
```

