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

