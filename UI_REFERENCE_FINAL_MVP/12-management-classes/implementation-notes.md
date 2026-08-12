# 12 - Management Classes - implementation notes

**Append-only.** Add a new entry at the bottom for every implementation checkpoint touching this screen. Never edit or delete an existing entry - a superseded entry is corrected by a later entry that says so.

---

## Entry template - copy below the last entry

```
Timestamp (Asia/Singapore):
Source branch:
Starting commit:
Screen ID:                     12
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

```
Timestamp (Asia/Singapore):    2026-08-12
Source branch:                 develop  (DEVELOPMENT CLONE)
Starting commit:               b3bd814
Screen ID:                     12
Existing route audited:        NONE — this screen had no implemented route. Created at its
                               CANONICAL route `/management/classes` (§1). No route moved,
                               renamed, redirected or aliased.
Components preserved:          —
Components replaced:           —
Components created:            features/management/management-classes.tsx
                               app/(portals)/management/classes/page.tsx
DTO and port changes:          ClassGradeOptionDto · ManagementClassSummaryDto ·
                               ManagementClassListDto (contract) · the matching Adapter DTOs ·
                               port member `listManagementClasses()` · server projection
                               `listClassModulesCore` (class-session) + `listManagementClassesCore`
                               (management-view) + `adapterListManagementClasses`.
Fixture changes:               `listManagementClasses` on the deterministic fixture, plus
                               FIXTURE_CLASS_GRADES (the three ratified grades in seeded order).
                               ⚠️ `Advanced` deliberately has no module, so the empty-level path
                               is a real rendering case rather than an untested one.
Backend dependencies discovered: NONE. ⚠️ MEASURED AT HEAD rather than read off the delta table:
                               a management SELECT policy AND a matching `authenticated` SELECT
                               grant already exist on all eight relations this screen reads
                               (both layers checked separately — A-030). Classification is
                               NEEDS NEW PROJECTION + NEEDS NEW SERVER ACTION, **not** NEEDS NEW
                               SCHEMA, so NO migration and NO Operator schema authorization was
                               required. Re-measured by proof leg P21-3 at every run.
Vocabulary dependencies:       ⛔ THE FRAME'S LEVEL TAB READS `Junior` AND IT IS NOT BUILT.
                               The ratified Class Grade vocabulary is Beginner / Intermediate /
                               Advanced (A-016, A-026, A-054). ⚠️ THIS IS A VOCABULARY
                               DIVERGENCE, NOT A SYNONYM: A-054 prohibits global keyword
                               replacement and requires classifying each occurrence by context.
                               Measured by leg P21-2 — `class_grades` holds exactly the three
                               ratified codes and `junior` is absent.
Governance blockers:           NONE outstanding. Three REGISTERED-OMISSIONS (below).
Browser viewport:              —
Before screenshot:             NOT CAPTURED — no prior implementation existed to capture.
After screenshot:              ⛔ NOT-RUN. RENDERED CAPTURE remains NOT-RUN on every
                               authenticated surface (PORTAL_COMPLETION_PLAN §10) and this
                               checkpoint does not close it. A green DOM-text proof is not a
                               visual acceptance and is not reported as one.
Validation:                    npm run prove:portal-p2-1 — 9 SQL legs + 20 runner checks, exit 0
                               npm run prove:portal-p2-1-composed — 9 checks, exit 0
                               npm run prove:hero-all — 17/17 by exit code
                               tsc 0 · eslint 0 errors · next build 0
Ending commit:                 (this checkpoint's commit)
Acceptance status:             PASS — session evidence verdict. ⚠️ `Accepted` is the Operator's
                               and only the Operator's (CLAUDE.md §14.1, §15.6).
```

### ⛔ REGISTERED OMISSIONS — three, and each is cited in the component itself

| # | The frame draws | Disposition | Ends? |
|---|---|---|---|
| 1 | **`Asst. <name>`** on every class card | ⛔ **PROHIBITED — NOT BUILT.** It is a Teaching Assistant field: `A-014` defers the TA persona and `G-7` binds `centre_membership_role` against extension, so an assistant slot **cannot be persisted at all**. | **NEVER ENDS.** It is not waiting on data, a design or a phase. |
| 2 | **`X / 12 Lessons done`** | ⚠️ **NOT BUILT.** It needs lesson data that does not exist at HEAD; it arrives with `D-3`/`D-4`. ⛔ A denominator invented now is a fabricated fact, not a placeholder (`A-022`). | **ENDS WHEN THAT DATA ARRIVES** — `P2-2` / `P2-6`. |
| 3 | The level tab **`Junior`** | ⛔ **NOT BUILT, and `Beginner` is not a relabel of it.** Governance wins on the functional ladder; the divergence is RECORDED, never silently resolved (`A-045`, preserved by `A-056`). | **NEVER ENDS** — the vocabulary is ratified. |

**Their absence is `EXPECTED / REQUIRED`, never a visual regression.** Each is asserted by a proof leg whose detector carries a **control that must match the frame's own string** — `P21a-1/1c`, `P21a-2/2c`, `P21a-3/3c` — because a scan proving a token absent is trivially satisfied by a file it never read.

### ⚠️ TWO FURTHER DEPARTURES, RECORDED BECAUSE NEITHER IS A DEFECT

1. **One trainer per card is not a governed fact.** `A-016` makes trainer assignment authoritative at **class-session level**; there is no module-level trainer column and inventing one is prohibited. The card therefore names the **distinct trainers actually assigned across that module's sessions**. Where that is one name it reads as the frame does. ⛔ A second name is a second **session's** trainer — never an assistant (omission 1).
2. **`Add Class` and the card's own destination are INERT, not missing.** `Add Class` targets screen `26` (`P2-2`); a card opens screen `13` Class Overview (`P2-4`). Neither route exists at HEAD, and **one screen per phase** is the plan's rule (§3). A link to a route that 404s is worse than an inert control with a stated reason — the treatment screen `29`'s "Send Reminder to Trainer" already carries.

### ⛔ WHAT THIS SURFACE MUST NEVER GAIN

**No rating, roll-up, average or Overall Grade, ever.** `12` is a **LIST** surface: `C-9` confines `D-1`'s nine per-dimension ratings to report **DETAIL** surfaces, because ratings on a list *"invite comparison between children"*; `G-2` excludes any roll-up on **every** surface, permanently. The exclusion is **structural, not cosmetic** — the DTO carries no field that could hold one (asserted as an exact field set by `P21c-7`), and at HEAD the rating relations carry **zero client grants of any kind** (`P21-8`), so no direct read on this screen could reach one even if a later edit asked it to.

**No term chip and no term filter.** `D-3` permits terms as **scheduling structure grouping SESSIONS** (`C-6`) and schedules them at `P2-2`. Until then no term entity exists, and an inert chip advertising one would promise a filter that does not.