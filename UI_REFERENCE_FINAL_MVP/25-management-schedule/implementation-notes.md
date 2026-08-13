# 25 - Management Schedule - implementation notes

**Append-only.** Add a new entry at the bottom for every implementation checkpoint touching this screen. Never edit or delete an existing entry - a superseded entry is corrected by a later entry that says so.

---

## Entry template - copy below the last entry

```
Timestamp (Asia/Singapore):
Source branch:
Starting commit:
Screen ID:                     25
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

- **GC-13 — A "Showcase" event type distinct from a Class Session. A-016: calendars are PROJECTIONS of class-session records; no duplicated event table. DO NOT BUILD a second event entity.**

**No authoritative visual bytes (PNG or HTML) were altered by this recording.**


---

## `P2-5` — SCREEN BUILT, 2026-08-13

**Route:** `/management/schedule` (canonical, §1). **No migration and no schema change.**
`class_sessions`, `class_modules`, `class_grades`, `class_session_assignments`,
`centre_memberships` and `accounts` each carry a management `SELECT` policy **and** a matching
`authenticated` `SELECT` grant — measured at HEAD at **both** layers before a line was written —
so this is a direct RLS-scoped read like screen `12`, not the two `SECURITY DEFINER` reads
screen `13` required.

### Artefacts opened (`CLAUDE.md` §7.4.1)

| Artefact | Used for |
|---|---|
| `Management - Schedule.png` | geometry, composition, what is drawn |
| `Management - Schedule.html` | every measured value cited below |
| `25-management-schedule/screen.md` | governance, provenance, prohibited invention |

⚠️ **AND THE `.md` IS WHY THE RULE EXISTS — A MEASURED INSTANCE, NOT A RESTATEMENT.** This
pack's prose note lists *"Lesson cards with date, time, room, assigned Trainer, and Trainer
Assistant (TA)"* and **never mentions `Showcase` at all**. ▶ A build derived from the note would
have missed the frame's second badge and its third chip colour entirely — including the fact that
the colour ENCODES the barred type — and would have reported a clean match. The `.png` is the only
artefact in which that is visible.

### `GC-13` discharged, and it reached further than the register's wording

The register bars *"a second event entity"*. Measured in the `.html`, `Showcase` is **also** a
badge and a **third chip treatment** (`#DCF2F3` / `#3FBAC2`) on the 5:00 PM `Junior · Speech and
Drama` chip — the same session the details panel labels `Showcase`. **None of the three is built.**
⛔ Structurally reinforced: `session_type`, `event_type` and `showcase` return **zero columns**
across the whole schema, and neither the DTO nor the adapter mapper carries a field one could
arrive in.

### `REGISTERED-OMISSION`s — preserved and cited

| Frame draws | Ruling | Ends when |
|---|---|---|
| `Showcase` badge + its chip colour | `GC-13`, `A-016` | **NEVER** |
| `Assist. Sam Ong` / `Asst. Sam Ong` | `A-014`, `G-7` — and `trainer_role` IS `centre_membership_role`, so an assistant is **inexpressible** | **NEVER** |
| `Main:` prefix | consequence of the row above — the contrast has nothing on its other side | **NEVER** |
| `Junior` | `A-016` / `A-026` / `A-054`; labels are read from `class_grades.display_name` | **NEVER** |

⚠️ **`Studio 2` / `Studio 4` IS NOT ON THAT LIST AND MUST NOT BE ADDED TO IT.** `class_sessions.room`
EXISTS and is NULL on every fixture session, so the element is **omitted by hero 0B** — nothing is
refused, the capability is live, and the row appears the moment a session carries a room.

### Two judgement calls, stated so they can be overturned rather than discovered

1. **The month control's contents.** The frame draws a chevron and enumerates no options. Built,
   with contents **measured** — the months this centre demonstrably has sessions in, plus the
   current month. No guessed range.
2. **Chip colour.** With `Showcase` removed, the remaining two treatments distinguish two Class
   Modules. Assigned deterministically per module, **cycling**, and carrying no meaning — stated
   because a reader who took colour for a session type would be reading back the barred concept.

```artefact-read
screen: 25
pack: Management - Schedule
component: features/management/management-schedule.tsx, components/ui/page-heading.tsx
html-values: 17px, 11.50px, 12.50px, 10.50px, 15.50px, 12px, 9px, 7px, 16px, 15px, 18px
screen-md-quote: Management calendar over class sessions, as a projection of class-session records.
```

**Visual acceptance:** `NOT-RUN` — Operator-set only.
