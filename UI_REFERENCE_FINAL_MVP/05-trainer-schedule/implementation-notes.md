# 05 - Trainer Schedule - implementation notes

**Append-only.** Add a new entry at the bottom for every implementation checkpoint touching this screen. Never edit or delete an existing entry - a superseded entry is corrected by a later entry that says so.

---

## Entry template - copy below the last entry

```
Timestamp (Asia/Singapore):
Source branch:
Starting commit:
Screen ID:                     05
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

### FRONTEND RECONSTRUCTION F4 / operator checkpoint F-04 — 2026-08-06

```
Timestamp (Asia/Singapore):    2026-08-06
Source branch:                 feat/48h-frontend (worktrees/frontend-48h)
Starting commit:               50e0ee286d7083bd6dbe201bca56009d73ae65c4
Screen ID:                     05
Existing route audited:        Yes. /trainer/schedule DID NOT EXIST. Session selection was
                               folded into the Trainer landing surface at /trainer
                               (app/(portals)/trainer/page.tsx -> TrainerDashboard).
                               Inventory 7.3 classified this a COVERAGE GAP, not a route
                               mismatch, and left the treatment as "Operator decision
                               required" (U-A5-1).

ROUTE DECISION EXECUTED (operator ruling R-B1, which resolves U-A5-1):
                               /trainer/schedule is CREATED as the canonical Trainer entry
                               route. /trainer is PRESERVED as a compatibility REDIRECT onto
                               it - the file was CONVERTED, NOT DELETED. Measured on the
                               production build: GET /trainer -> 307 -> /trainer/schedule;
                               GET /trainer/schedule -> 200. No working route was silently
                               deleted. This matches the treatment inventory 7.2 already
                               ratifies for the deferred screen 01 at /trainer/dashboard:
                               "Preserve existing route as redirect."

ROUTE CENSUS MOVE:             16 -> 17 application routes plus /_not-found.
                               ADDED:   /trainer/schedule   (exactly one)
                               REMOVED: none
                               RENAMED: none
                               Cross-referenced in CHANGE_LOG.md, as the stop condition
                               requires. An unrecorded census move would have been a stop.

Components preserved:          The governed session-selection function and its server-proved
                               assignment check (screen.md 6) - each session opens the same
                               governed roster at /trainer/sessions/[sessionId]/roster.
                               features/trainer/trainer-dashboard.tsx is RETAINED unchanged
                               (comment only) for the deferred screen 01 checkpoint; it is
                               currently unmounted, not deleted.
Components replaced:           None. The Trainer landing presentation was not rewritten; the
                               canonical Schedule surface was built alongside it and /trainer
                               now redirects.
Components created:            features/trainer/trainer-schedule.tsx       (screen 05 surface)
                               features/trainer/trainer-schedule-projection.ts
                                   (the trainer schedule/date PROJECTION - see below)
                               app/(portals)/trainer/schedule/page.tsx     (canonical route)
                               components/ui/icon.tsx gained one ADDITIVE `calendar` glyph.
DTO and port changes:          NONE. lib/frontend/contracts/physical-test.ts and
                               lib/frontend/physical-test-port.ts are byte-unchanged. No DTO
                               field, no port method, no permission was added.
Fixture changes:               NONE. lib/frontend/fixtures/ is byte-unchanged. The date
                               projection needed no fixture data that did not already exist.
Backend dependencies discovered:
                               (1) Session ROOM / LOCATION - the frame's Schedule Details
                                   panel shows "Studio 2". TrainerSessionSummaryDto carries
                                   no location field. OMITTED, never fabricated.
                               (2) Assigned-trainer NAMES - the frame shows "Main: ..." and
                                   "Assist. ...". The projection carries no assignment-name
                                   field. OMITTED, never fabricated.
                               (3) SESSION CREATION - no create-session path exists on
                                   PhysicalTestPort, and creating a Class Session is a
                                   governed MANAGEMENT action (A-019), not a Trainer one.
                                   "Add Agenda" is therefore rendered with the frame's label
                                   and DISABLED with a visible, programmatically associated
                                   reason - the F-11 "Send Reminder to Trainer" treatment.
                               (4) Trainer-scoped CLASS and STUDENT projections - the frame's
                                   rail also lists "My Classes" and "Students", which depend
                                   on the projections inventory 8.2 records missing for
                                   screens 02 and 04. Those nav items were NOT added; a nav
                                   item pointing at nothing is a dead control.
                               The "Trainer schedule/date projection" recorded missing in
                               inventory 8.2 is now DELIVERED AS A FRONTEND PROJECTION over
                               already-governed data. It required NO backend work, because a
                               calendar is a projection by ratified rule, not a new read path.
Vocabulary dependencies:       None. Screen 05 is NOT rating-bearing (screen.md 8): it
                               surfaces no competency-rating vocabulary, so F4 carries no F6
                               / Amendment 006 V3 dependency. The rating union still declares
                               the superseded emerging/developing/secure/advanced and was NOT
                               touched - the correct pre-V3 state. The CLASS GRADE vocabulary
                               this screen renders (Beginner / Intermediate / Advanced) is a
                               DIFFERENT, UNCHANGED vocabulary (A-054); it is rendered
                               verbatim, marked data-vocabulary="class-grade" where it stands
                               alone so a future guard classifies it by ACTUAL CONTEXT, and NO
                               global keyword replacement was performed over advanced /
                               secure / emerging / beginning / mastering / mastered.
Governance blockers:           None.

GOVERNANCE - THE CALENDAR IS A PROJECTION, PROVED BY CONSTRUCTION:
                               trainer-schedule-projection.ts is a PURE, side-effect-free date
                               projection over the rows PhysicalTestPort.listTrainerSessions()
                               already returns. There is NO event table, NO agenda record, NO
                               calendar entity, NO second store, NO persistence and NO
                               mutation anywhere in this checkpoint (A-016, A-047; screen.md 6
                               "Prohibited invention"). Because the only input is that governed
                               projection, the surface CANNOT name a Class Session the trainer
                               is not assigned to - the assignment check stays server-proved
                               upstream and is neither duplicated nor re-implemented. Search,
                               the month picker and the Day/Week/Month switch NARROW what the
                               projection returned; none of them can widen it. All date
                               arithmetic is UTC, so a viewer's timezone cannot move a session
                               onto a neighbouring day. The default focus month is derived from
                               the EARLIEST ASSIGNED SESSION, not from "today", so the surface
                               renders identically in every environment and every capture.

FRAME-VERSUS-GOVERNANCE DIVERGENCES - RECORDED, NEVER RESOLVED LOCALLY (A-045):
                               D1 "Add Agenda" has no governed backing. Label kept, control
                                  DISABLED with a stated reason. Behaviour not invented.
                               D2 "Start Class" implies a SESSION-LIFECYCLE TRANSITION. That
                                  enum is DEFERRED and UNRATIFIED, and CLAUDE.md 6.1 / A-026
                                  say "do not invent a placeholder enum". A control named
                                  "Start Class" that starts nothing is a false claim of state
                                  change, so it is RELABELLED "Open Class Roster" - the
                                  governed action it actually performs, and the behaviour that
                                  already existed on /trainer. Figma is authoritative for
                                  microcopy; where microcopy asserts an unratified transition,
                                  the ratified rule wins and the divergence is recorded here.
                               D3 Room/location and Main/Assist trainer names OMITTED - no
                                  governed field exists (dependencies 1 and 2 above).
                               D4 The frame's header-rail search sits in
                                  components/layout/portal-shell.tsx. The search field is
                                  rendered in the page header instead, the same trade F-14
                                  recorded for the Parent child affordance.
                               D5 The frame's month title carries a dropdown chevron; it is
                                  implemented as a real labelled month picker derived from the
                                  months the projection actually carries, so it can never jump
                                  to a period the trainer has no governed data for.
                               D6 The frame renders borrowed neighbouring-month dates in a
                                  grey measuring 2.043:1 on this fill. A date is meaningful
                                  text, so the WCAG AA floor won over the frame - hue
                                  preserved, luminance moved (A-045, persona 3.5).
                               D7 The frame's rail items "My Classes" and "Students" omitted
                                  (dependency 4).

Browser viewport:              1675 x 1155 (the reference's native dimensions), plus
                               1024 x 900 and 480 x 900 narrower desktop breakpoints.
Before screenshot:             NOT CAPTURED - there was no /trainer/schedule route to capture.
                               This is a coverage gap, not a redesign; the closest prior
                               surface was the Trainer landing page at /trainer, which is
                               preserved in git history and whose component is retained.
After screenshot:              UI_REFERENCE_FINAL_MVP\_checkpoint-evidence\F-04\
                                 f04-schedule-month-1675x1155.png
                                 f04-schedule-details-1675x1155.png
                                 f04-schedule-week-1675x1155.png
                                 f04-schedule-day-1675x1155.png
                                 f04-schedule-empty-1675x1155.png
                                 f04-schedule-1024x900.png
                                 f04-schedule-480x900.png
                                 f04-evidence.json  (contrast, overflow and redirect proof)
                               Written OUTSIDE Git. Synthetic fixture data only.
Validation:                    reference.png SHA-256 d2d58b16...4ff2ceb verified BEFORE and
                                 UNCHANGED AFTER (1675 x 1155, 90,168 bytes).
                               tsc --noEmit                                      exit 0
                               eslint .                                          exit 0
                               npm run build                                     exit 0
                                 route census 16 -> 17 (+ /_not-found); added /trainer/schedule
                               tests/frontend/trainer-browser-smoke.mjs          exit 0
                               tests/frontend/three-role-browser-smoke.mjs       exit 0
                               tests/frontend/authentication-browser-smoke.mjs   exit 0
                               git diff --check                                  exit 0
                               All three browser suites ran against a PRODUCTION build
                               (next start), never a cold dev server. Zero uncaught
                               browser-console/runtime errors in every run.
                               Contrast measured from live computed styles across 92 text
                               nodes: every owned-surface node passes. 5 residual failures are
                               portal-shell.tsx at 2.828:1 (pre-existing, outside the owned
                               surface); 2 are the DISABLED "Add Agenda" at 2.043:1, which
                               SC 1.4.3 expressly exempts as an inactive UI component.
                               No horizontal page scroll at 1675, 1024 or 480 px - measured
                               true at all three. One real defect was FOUND AND FIXED inside
                               this checkpoint: sr-only weekday names are absolutely
                               positioned and escaped the scrolling table's clipping,
                               extending documentElement.scrollWidth to 688 px at a 480 px
                               viewport. The weekday name is now the column header's
                               aria-label; re-measured 465 <= 480.
                               No dependency, no test runner, no package.json or
                               package-lock.json change (R-B7).
Ending commit:                 468ac56a87a162a7b50d19c49986de055b852a5a
Acceptance status:             READY FOR OPERATOR REVIEW. Screen 05 is PROPOSED visually
                               accepted. SCREEN_INDEX.md was NOT modified and still records
                               visual acceptance as Not started for all 36 screens. Only the
                               operator marks a screen accepted.
```

### UI RECONCILIATION plan Phase 4 (`F-UI-DRIFT-1` bucket (c)) — 2026-08-10

```
Timestamp (Asia/Singapore):    2026-08-10
Source branch:                 develop (DEVELOPMENT CLONE)
Starting commit:               05edd6d
Screen ID:                     05
Existing route audited:        Yes. /trainer/schedule unchanged. Route census 17, unchanged.
Components preserved:          features/trainer/trainer-schedule-projection.ts (byte-unchanged),
                               components/ui/badge.tsx (byte-unchanged).
Components replaced:           None.
Components created:            None.
DTO and port changes:          NONE.
Fixture changes:               NONE.
Backend dependencies discovered:
                               None new. Dependencies 1-4 of the F-04 entry stand.
Vocabulary dependencies:       None. Screen 05 is still not rating-bearing.
Governance blockers:           None. NEW-QUESTION: none.

SCOPE:                         Visual reconciliation ONLY, against
                               UI_REFERENCE_FINAL_MVP/reference/Trainer - Schedule/ (A-056,
                               visual rank 1). The .html export was read for VALUES ONLY - no
                               export markup, class name, DOM structure, absolute position or
                               fixed pixel layout entered the component.

TRUE-DRIFT RESOLVED:           19. Full table: docs/plan/UI_RECONCILIATION_BATCH_3_ADJUDICATION.md
                               Phase 4 section 4.1.

REGISTERED-OMISSION PRESERVED: 8, ZERO CHANGED - D1 Add Agenda disabled with its reason,
                               D2 "Open Class Roster" relabelling, D3 room/trainer names
                               omitted, the TA fields unbuilt, D4 header search placement,
                               D5 real month picker, D6 neighbouring-month contrast,
                               D7 rail items. Reported as a SEPARATE list from TRUE-DRIFT,
                               never merged into one count (plan 6.5).

TWO PRE-EXISTING CASCADE DEFECTS FOUND AND FIXED (neither introduced here, both invisible to
source review): the session-card <h3> "text-brand-800" was outranked by the UNLAYERED
h1..h4 colour rule and had been rendering NAVY on every build since it was written - fixed
narrowly as "text-brand-800!", the only important utility in the application; and
"tracking-[-0.02em]" on the page <h1> was likewise inert and was REMOVED rather than
restyled. See adjudication section 4.2.

Browser viewport:              n/a - see below.
Before screenshot:             NOT CAPTURED.
After screenshot:              NOT CAPTURED.
                               *** RENDERED CAPTURE IS **NOT-RUN**, WITH ITS REASON. ***
                               Screen 05 is AUTHENTICATED; the portal layout runs
                               requirePortalAccess, which needs a session and therefore a
                               reachable governed database, and .env.local in this clone
                               configures the HOSTED dev project only - a CLAUDE.md 12
                               stop-and-ask that no current authorization carries. No capture
                               was manufactured and no hosted or paid service was contacted.
                               NOT-RUN is not PASS. Verified instead by frame-vs-source
                               measurement, a static cascade audit, and EMITTED-CSS
                               verification of every new value out of .next/static/chunks.
Validation:                    tsc --noEmit                                    exit 0
                               eslint .                                        exit 0
                               npm run build                                   exit 0
                                 route census 17, UNCHANGED
                               tests/frontend/app-route-census.mjs             exit 0
                               tests/frontend/portal-navigation-active-state   exit 0  (6/6)
                               tests/frontend/post-login-destinations.mjs      exit 0  (5/5)
                               tests/frontend/session-eligibility.mjs          exit 0
                                 E-5/E-6 assert on the SessionCard branch this phase edited:
                                 a future session still renders a disabled button with the
                                 governed reason and NO link, and the roster Link still occurs
                                 exactly once. C2C-010 intact, proven not asserted.
                               reference.png SHA-256 d2d58b16... verified UNCHANGED.
                               No governed surface touched. No dependency added.
Ending commit:                 recorded in docs/progress/STATUS.md and in the adjudication's
                               Commits table (filled one phase late - a commit cannot cite its
                               own SHA).
Acceptance status:             PASS is this session's EVIDENCE verdict only.
                               Accepted is OPERATOR-SET ONLY and has NOT been set.
```

### HERO CHAIN plan Phase 3 — 2026-08-10 — Room and the `Main:` trainer

**A FUNCTIONAL completion, not a visual reconciliation.** Schedule Details now renders the
frame's **`Studio 2`** and **`Main: Sam Ong`** from governed fields.

⚠️ **THE F-04 DEPENDENCY IS DISCHARGED — and it was a dependency, not a ruled omission.** This
pack recorded at checkpoint **F-04** that *"the frame's session room/location ('Studio 2') and its
Main / Assist. trainer names exist on no governed field and are omitted rather than fabricated"*.
That was the correct treatment at the time and was deliberately not invented around. **G-6**
(room) and **G-7** (`Main:`) closed it. **This is not an expansion of Final MVP scope** — it is a
gap the project had already booked.

⛔ **`Assist.` IS A `REGISTERED-OMISSION` AND IS PRESERVED (G-7).** A second staff role is **not a
label**: `class_session_assignments.trainer_role` is typed `centre_membership_role`, whose values
are `management` / `trainer` / `parent`, so an assistant slot means **extending a governed enum
that carries authorization vocabulary** — a §12 stop-and-ask on its own — and it would reintroduce
the **TA persona A-014 defers**. ⚠️ **It is now refused in TWO places, neither of which is the
renderer:** the database returns **at most one** name (`P3-4`, measured, and **no session anywhere
carries a second active assignment**), and `TrainerSessionSummaryDto` has **no second staff field
for a row to bind to** (`P3-7c`). `centre_membership_role` is **not extended**.

⚠️ **`room` CARRIES NO AUTHORIZATION MEANING (G-6), and that is asserted where it would actually be
violated** — the policy catalogue. `P3-5` measures that `room` appears in **no** `USING` or
`WITH CHECK` expression anywhere in `public`. Trainer reach is proved through the live class-session
assignment (ADR-4), never through a location.

**Proof — `npm run prove:hero-3`: 6 SQL legs + 3 contract legs, all PASS, 0 FAIL.**

⚠️ **It runs under `SET LOCAL ROLE authenticated`, not as the owner.** `class_sessions` is owned by
`postgres` and is not `FORCE ROW LEVEL SECURITY`, so an owner-side read would bypass RLS and prove
nothing about what a trainer sees. **`room` was added by Phase 0B *after*
`class_sessions_select_trainer` was written**; RLS is row-level rather than column-level, so it
*should* be readable — but *"the policy predates the column"* is exactly the kind of assumption
this project has been wrong about before, so it was **measured** (`P3-2`: `Studio 2` reached the
trainer under RLS). **`P3-1` is a NON-VACUITY leg and runs first** — 4 sessions visible — because
with none, every leg below would pass for the wrong reason (the `S-8` finding). Transaction-scoped
ending in `ROLLBACK`; the runner measured governed counts **and the room-bearing session count**
before and after: `0|0|0|0|4|0|4` → **unchanged**.

**No database object added.** The `Main:` name comes from the **shared Phase 0A read path**, not a
join re-derived in the schedule projection — one source of truth for staff identity across the six
screens that render it, and one place an authorization decision could drift. The batch read is
**fail-soft**: if it is unavailable the schedule still lists every assigned session with the
`Main:` row omitted, because staff identity is display context here and must never remove a session
the caller's own scope returned.

⚠️ **NULL MEANS NOT RECORDED — the whole row disappears.** Never "TBC", never a dash. The frame
draws these as bare lines; they render as `<dt>`/`<dd>` pairs to match the four accepted rows above
them, which is why the frame's literal `Main:` prefix becomes the term **Main**.

**Also preserved, unchanged:** `Add Agenda` and `Start Class` remain `REGISTERED-OMISSION`s
(A-019, A-026); `Start Class` keeps its governed relabelling; the four redundant carriers of
eligibility state are untouched.

tsc **0** · eslint **0 errors** (2 pre-existing `projectId` warnings, in files this work did not
author) · build **0** · **route census 17**, enumerated from `app/**/page.tsx` ·
`session-eligibility` **PASS** · `portal-navigation-active-state` **PASS** ·
`post-login-destinations` **PASS** · **emitted-CSS verified** for all three classes used —
⚠️ **no new class was introduced; the compiled stylesheet is byte-identical in size (45,748).**

**RENDERED CAPTURE `NOT-RUN`** (authenticated surface; §12 stop-and-ask). `Accepted` is
Operator-set only and has **NOT** been set.
