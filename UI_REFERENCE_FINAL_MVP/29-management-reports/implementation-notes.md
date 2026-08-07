# 29 - Management Reports - implementation notes

**Append-only.** Add a new entry at the bottom for every implementation checkpoint touching this screen. Never edit or delete an existing entry - a superseded entry is corrected by a later entry that says so.

---

## Entry template - copy below the last entry

```
Timestamp (Asia/Singapore):
Source branch:
Starting commit:
Screen ID:                     29
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
Timestamp (Asia/Singapore):    2026-08-06
Source branch:                 feat/48h-frontend
Starting commit:               d1883db9cd977f294747f4baad728d1be5bcebda
Screen ID:                     29
Checkpoint:                    F-01a — bounded WCAG 2.2 AA accessibility correction.
                               NOT a screen reconstruction. This screen's visual acceptance
                               status is unchanged and remains Not started.
Existing route audited:        /management/reports
Components preserved:          all — no component was replaced, created, moved or restructured
Components replaced:           none
Components created:            none
DTO and port changes:          none
Fixture changes:               none
Backend dependencies discovered: none new
Vocabulary dependencies:       none. No rating label, Class Grade label or copy string was touched.
                               Amendment 006 V3 remains pending and unauthorized.
Governance blockers:           none
Change made on this screen:    features/management/management-reports-queue.tsx:115
                               bg-brand-600 (#ec4899, 3.53:1 on white text — live AA failure)
                               -> bg-brand-700 (#d6357a, 4.517:1 measured — passes AA)
                               hover:bg-brand-500 (#f472b6, 2.65:1 — failing worse than rest)
                               -> hover:bg-brand-800 (#b02a63, 6.255:1 measured — passes AA)
                               This is the same primary-action pair the F1 foundation already
                               uses in components/ui/button.tsx and components/ui/state-panel.tsx.
                               No token VALUE in app/globals.css was changed.
Excluded, deliberately:        components/brand/brand-mark.tsx:46 (logotype — WCAG-exempt, R-B8
                               requires the approved mark unaltered) and
                               features/trainer/trainer-assessment.tsx:212 (progress-bar fill
                               carrying no text). Both verified untouched in the diff.
Browser viewport:              1440 x 1100 (measurement run); browser smoke suites at their own
                               recorded viewports
Before screenshot:             not captured — this checkpoint proposes no visual acceptance and
                               changes no layout; contrast was measured numerically instead
After screenshot:              not captured — see above
Validation:                    all 12 frozen reference.png SHA-256 verified unchanged before and
                               after; tsc --noEmit exit 0; eslint . exit 0; npm run build exit 0
                               with route census unchanged at 16; compiled
                               design-foundation.assertions.ts exit 0; trainer-browser-smoke.mjs
                               exit 0; three-role-browser-smoke.mjs exit 0;
                               authentication-browser-smoke.mjs exit 0; git diff --check exit 0;
                               zero uncaught browser-console/runtime errors. Measurements at
                               UI_REFERENCE_FINAL_MVP/_checkpoint-evidence/F-01a/
Ending commit:                 the commit created by
                               "fix(frontend): use an accessible brand token for white-label
                               actions (WCAG 2.2 AA)"
Acceptance status:             Not started (unchanged) — F-01a claims no screen visually accepted
Recorded, not fixed:           text-brand-600 (#ec4899) remains in use as FOREGROUND text on
                               white (3.53:1) and on brand-100 (3.84:1) surfaces. That is a
                               further AA failure, outside this checkpoint's owned paths, and is
                               reported for separate authorization rather than swept in.
```

```
Timestamp (Asia/Singapore):    2026-08-06
Source branch:                 feat/48h-frontend
Starting commit:               6e8816e218d5b1b896abdf234be3657e3b6638e6
Screen ID:                     29
Checkpoint:                    F-01b — bounded correction of the High finding the independent
                               verifier raised against F-01a. NOT a screen reconstruction.
                               This screen's visual acceptance status is UNCHANGED.
Existing route audited:        /management/reports
Components preserved:          all — no component was replaced, created, moved or restructured
Components replaced:           none
Components created:            none
DTO and port changes:          none
Fixture changes:               none
Backend dependencies discovered: none new
Vocabulary dependencies:       none. No rating label, Class Grade label or copy string was
                               touched. No keyword replacement of any kind was performed
                               (A-054). Amendment 006 V3 remains pending and unauthorized.
Governance blockers:           none
Defect corrected (global):     app/globals.css declared
                                 button, input, textarea, select { font: inherit; color: inherit; }
                               UNLAYERED. Unlayered CSS outranks every @layer rule, and
                               @import "tailwindcss" (Tailwind v4, layer order
                               theme, base, components, utilities) emits every utility into
                               @layer utilities. The reset therefore beat EVERY colour and
                               typography utility on EVERY button, input, textarea and select
                               in the application: the utility was generated and matched, then
                               silently lost the cascade, so the control rendered its
                               ancestor's colour and weight. Before the fix, every button in
                               the application computed to font-weight 400 — font-bold never
                               applied anywhere.
Fix applied:                   the same rule, moved INSIDE @layer base — the layer where
                               Tailwind's own preflight declares the identical normalization
                               (node_modules/tailwindcss/preflight.css). The reset was NOT
                               deleted: font/colour inheritance into form controls is a
                               deliberate normalization and is retained verbatim; only its
                               cascade position changed. @layer base { ... } appends to the
                               existing layer and does not redefine the layer order.
                               No token VALUE was changed. components/ui/button.tsx needed no
                               change — its primary pair was already correct in source and
                               simply could not reach the DOM.
Measured on this screen:       "Reset fixture" took text-small + font-bold; colour unchanged at 15.598:1.
                               No other control on this surface changed.
Excluded, deliberately:        components/brand/brand-mark.tsx (logotype — WCAG-exempt, R-B8)
                               and features/trainer/trainer-assessment.tsx:212 (decorative
                               fill, no text). Both verified untouched in the diff.
Browser viewport:              1440 x 1100 (measurement runs), 1440 x 1024 (diagnostic renders);
                               browser smoke suites at their own recorded viewports
Before screenshot:             not captured for this screen — this checkpoint proposes no visual
                               acceptance and changes no layout; contrast was measured
                               numerically in the rendered DOM instead, before and after
After screenshot:              diagnostic renders of the two named surfaces and four collateral
                               surfaces at 1440 x 1024, outside Git, at
                               UI_REFERENCE_FINAL_MVP/_checkpoint-evidence/F-01b/
Collateral sweep:              122 controls across 16 surfaces and all three portals, measured
                               before and after with the identical harness against production
                               builds: 23 unchanged, 99 changed, 0 added, 0 removed. ZERO
                               inputs, selects or textareas changed at all (.form-field sets
                               its own colour and remains authoritative). Six controls moved
                               below 4.5:1 and each was individually adjudicated: three are the
                               sr-only-labelled password-reveal SVG (SC 1.4.11, 3:1, met) and
                               three are DISABLED controls (SC 1.4.3 exempts inactive
                               components). No WCAG 2.2 AA regression.
Validation:                    all 12 frozen reference.png SHA-256 verified against
                               FRONTEND_RECONSTRUCTION_PLAN.md §5 before and after — 12/12
                               match, 0 mismatch, exit 0 both times; npx tsc --noEmit exit 0;
                               npx eslint . exit 0; npm run build exit 0 with route census
                               unchanged at 16 application routes; compiled
                               design-foundation.assertions.ts exit 0; trainer-browser-smoke.mjs
                               exit 0; three-role-browser-smoke.mjs exit 0;
                               authentication-browser-smoke.mjs exit 0; git diff --check exit 0;
                               ZERO uncaught browser-console/runtime errors throughout.
Ending commit:                 the commit created by
                               "fix(frontend): restore Tailwind utility precedence on form
                               controls (WCAG 2.2 AA)"
Acceptance status:             UNCHANGED — F-01b claims no screen visually accepted
Recorded, not fixed:           app/globals.css still declares *, body, h1-h4, :focus-visible,
                               ::selection, .card, .panel, .form-field and the loading
                               primitives UNLAYERED, so those also outrank Tailwind utilities —
                               most consequentially h1..h4 { color: #1b2b4b }, which would
                               defeat a text-white heading on a dark accent panel. This
                               checkpoint's owned path was the form-control reset ONLY, so the
                               remaining unlayered rules were deliberately left untouched and
                               are reported for separate authorization. The F-01a
                               text-brand-600 foreground failures (3.53:1 on white, 3.84:1 on
                               brand-100) are likewise unchanged and still open.
```

```
Timestamp (Asia/Singapore):    2026-08-06
Source branch:                 feat/48h-frontend
Starting commit:               69ca3e59fb668400f6f7bd4db22c65f12e642430
Screen ID:                     29
Checkpoint:                    FRONTEND RECONSTRUCTION F11 — visual reconstruction of screen 29
                               against the frozen reference.png, node 527:170.
Reference verified:            SHA-256 eddda3b14c7e34747b237545116a6fb91e356ec3c9155fc7f8f28e00bae54c19
                               confirmed BEFORE work started and UNCHANGED after — 1440 x 1160,
                               98,030 bytes, byte-identical to FRONTEND_RECONSTRUCTION_PLAN.md §5.
Existing route audited:        /management/reports, plus the ?status=trainer_approved and
                               ?status=needs_edit compatibility aliases and the ?preview=empty
                               diagnostic. All three preserved and still working.
Components preserved:          the route, both governed projections
                               (listManagementPendingReviews / listManagementCorrectionTracking),
                               the loading / failed / unavailable / empty states, the
                               ResourceState handling and the /management/reports/[id]/review
                               destination for trainer_approved rows.
Components replaced:           the card-per-row list replaced by the frame's single white card
                               holding one report table (Student / Session / Status / Action),
                               preceded by the frame's "Filter:" strip and right-aligned student
                               search. Row status presentation moved off the shared StatusPill.
Components created:            local FilterChip (rounded filter chip) and local RowGroup, both
                               inside the owned feature file. No shared primitive was added,
                               moved or modified.
DTO and port changes:          ONE LINE. ManagementQueueRowDto.status widened from
                                 "trainer_approved" | "needs_edit"
                               to
                                 "trainer_approved" | "needs_edit" | "draft_ready"
                               in lib/frontend/contracts/physical-test.ts, exactly as
                               FRONTEND_RECONSTRUCTION_PLAN.md §F11 requires. Nothing else in
                               that file was touched. The RATING UNION ON LINES 1-8 WAS NOT
                               TOUCHED — it still declares emerging/developing/secure/advanced,
                               which is the correct pre-V3 state and belongs to F6.
                               This widening adds NO status to the ratified eight (draft_ready is
                               already one, A-036), creates no lifecycle transition, and grants
                               Management no access to draft_ready CONTENT.
Port changes:                  none. No method was added to PhysicalTestPort.
Fixture changes:               none. lib/frontend/fixtures/physical-test-fixture.ts is outside the
                               owned paths and was not modified — see the dependency below.
PRIVACY BOUNDARY — PROVEN:     Row action is decided per row by its own status, via one
                               ROW_PRESENTATION table with an explicit `exposesContent` flag.
                               There is deliberately NO shared generic "view report" handler
                               (CLAUDE.md §6 requires each handler to check status independently).
                                 trainer_approved -> "Review >" -> the management final-review
                                   surface. The one permitted pre-submission read (A-038).
                                 needs_edit       -> "Send Reminder to Trainer". No content.
                                 draft_ready      -> "Send Reminder to Trainer". No content.
                               Measured in the rendered production DOM, both surfaces:
                                 ?status=trainer_approved -> contains "Review", contains
                                   "Send Reminder to Trainer" = FALSE
                                 ?status=needs_edit -> contains "Send Reminder to Trainer" = TRUE,
                                   contains a Review link = FALSE
                               No trainer note, no raw per-dimension rating, no checklist
                               internal, no approval internal and no content hash is rendered on
                               ANY row, trainer_approved included. The only correction datum
                               shown is the issue scope, the open/resolved flag and the
                               Management-authored correction reason — all three already carried
                               by the governed DTO, already surfaced before this checkpoint, and
                               all three authored by Management itself rather than disclosed to
                               it.
STOP CONDITION NOT TRIGGERED:  draft_ready exposes no report content. The stop condition was
                               evaluated explicitly and did not fire.
Vocabulary dependencies:       none. This screen is not rating-bearing (screen.md §8). No
                               competency-rating label is rendered. No Class Grade artefact was
                               touched. NO KEYWORD REPLACEMENT of advanced/secure/emerging/
                               beginning/mastering/mastered was performed anywhere (A-054).
Backend dependencies discovered:
                               (1) TERM AND CLASS FILTERS. The frame draws "All terms" and
                                   "All classes" chips. ManagementQueueRowDto carries neither a
                                   term nor a class field, and no governed projection supplies
                                   one. Both chips render INERT with a visible, programmatically
                                   associated reason rather than being faked client-side or
                                   silently dropped. Recorded as a dependency, not invented.
                               (2) TRAINER REMINDER DELIVERY. CLAUDE.md §6 mandates the
                                   "Send Reminder to Trainer" row action for pre-approval
                                   statuses, but no reminder action exists on PhysicalTestPort
                                   and no notification path is delivered. The control therefore
                                   renders with its mandated label and is DISABLED with a stated
                                   reason, so the governed affordance is present without
                                   inventing behaviour or shipping a dead control.
                               (3) CLASS / LESSON / TRAINER COLUMNS. The frame's Class, Lesson
                                   and Trainer columns have no corresponding DTO field. They are
                                   omitted rather than fabricated. See the deviation below.
                               (4) draft_ready ROWS ARE NOT YET PRODUCED. The correction-tracking
                                   projection in the fixture filters on status === "needs_edit",
                                   so no draft_ready row currently reaches this queue. The
                                   fixture is outside the owned paths and was not changed. The
                                   component handles draft_ready correctly and defensively today;
                                   producing such a row is F16 adapter work.
FRAME-VERSUS-GOVERNANCE DEVIATIONS — recorded, not silently resolved:
                               D1. The frame's status vocabulary is "Approved" (green) and
                                   "Needs approval" (amber). That is Figma mock data and is NOT
                                   the ratified lifecycle. "Approved" is transient-in-transaction
                                   and NEVER commits (A-036), so it can never label a queue row.
                                   Ratified statuses win: "Awaiting final review"
                                   (trainer_approved), "Returned to Trainer" (needs_edit),
                                   "Corrected - awaiting Trainer reapproval" (draft_ready).
                               D2. The frame gives every row a content-bearing action
                                   ("View report" / "Review"). Governance forbids that for
                                   pre-approval rows. The rule wins: pre-approval rows get
                                   "Send Reminder to Trainer" and no content link.
                               D3. The frame's Class, Lesson and Trainer columns are omitted —
                                   no governed field backs them (dependency 3). The Submitted
                                   column is rendered as "Session" and carries the session date
                                   the DTO actually supplies; a trainer_approved report has no
                                   submission timestamp, so labelling it "Submitted" would be
                                   false.
                               D4. Column headers, the search placeholder and the search glyph
                                   use #5f6880 rather than the frame's lighter grey, and the two
                                   explanatory notes use #33405c. The frame's greys measure
                                   2.043:1 and 3.079:1 against white — below the 4.5:1 AA floor.
                                   Hue preserved, luminance moved. AA wins over the frame
                                   (A-045, persona 3.5) — the same trade F1 recorded for
                                   STATUS_TOKENS.
                               D5. The frame's left navigation rail lists six destinations
                                   (Dashboard, Students, Trainers, Classes, Schedule, Reports).
                                   The shell renders the three that exist. The rail is
                                   components/layout/portal-shell.tsx — outside the owned paths,
                                   untouched, and its remaining items depend on screens that are
                                   post-48-hour deferred scope (A-044).
Browser viewport:              1440 x 1160 (the recorded native frame height) for the three state
                               renders, plus 1024 x 900 for the narrower desktop breakpoint.
Before screenshot:             not captured — the previous presentation is preserved in git at
                               69ca3e59 and in the F-01a/F-01b evidence folders.
After screenshot:              UI_REFERENCE_FINAL_MVP/_checkpoint-evidence/F11/
                                 implementation-after-pending-1440x1160.png
                                 implementation-after-corrections-1440x1160.png
                                 implementation-after-empty-1440x1160.png
                                 implementation-after-pending-1024x900.png
                               Synthetic fixture data only. No real name, email, phone, address,
                               secret, token or credential appears in any of them.
Accessibility:                 real <table> with <caption> and scope="col" headers; the search
                               field and all three filter chips carry programmatically associated
                               labels; both inert affordances carry aria-describedby pointing at
                               a visible stated reason; status is carried by TEXT, never colour
                               alone; no horizontal page scroll at 1024 px (measured true), the
                               table scrolling inside its own container instead.
                               Contrast MEASURED from live computed styles in the production
                               build, 60 text nodes across the three states: every enabled
                               element inside this screen's owned surface passes. 16 residual
                               failures, all outside the owned paths or exempt:
                                 - the shell nav rail "Dashboard" / "Pending review" /
                                   "Corrections" at 3.079:1 (portal-shell.tsx, PRE-EXISTING,
                                   not this checkpoint's file);
                                 - three DISABLED controls at 2.043:1 ("All terms",
                                   "All classes", "Send Reminder to Trainer") — SC 1.4.3
                                   expressly exempts inactive user-interface components, the
                                   same adjudication F-01b recorded.
                               Measurements: _checkpoint-evidence/F11/contrast-measurements.json
Latent F1 primitive defect — RECORDED, NOT FIXED:
                               components/ui/field.tsx's `Select` and `SearchInput` were, before
                               this checkpoint, rendered NOWHERE in the application. Both compose
                               the `.form-field` class, whose `background` and `padding`
                               SHORTHANDS reset the very background-repeat / background-position /
                               padding-left utilities those two primitives rely on for their
                               chevron and their icon inset — and `.form-field` is still declared
                               UNLAYERED in app/globals.css, which F-01b already recorded as
                               outranking every Tailwind utility. Consuming them produced a
                               visibly broken filter strip (chevrons tiled across the full row,
                               search text under the glyph). Both files are outside this
                               checkpoint's owned paths, so neither was modified; the filter chip
                               and search box were built locally from utilities instead, and the
                               defect is reported for a separate foundation authorization.
Governance blockers:           none.
Validation:                    reference.png SHA-256 verified before and after — unchanged;
                               npx tsc --noEmit exit 0; npx eslint . exit 0; npm run build exit 0
                               with ROUTE CENSUS UNCHANGED at 16 application routes plus
                               /_not-found — none added, removed or renamed;
                               node tests/frontend/trainer-browser-smoke.mjs exit 0;
                               node tests/frontend/three-role-browser-smoke.mjs exit 0;
                               node tests/frontend/authentication-browser-smoke.mjs exit 0;
                               git diff --check exit 0; ZERO uncaught browser-console/runtime
                               errors in every browser run.
Ending commit:                 77abff4e1c5dc59381a8c2b81fbbe6ee932408de
                               "feat(frontend): reconstruct management reports queue"
Acceptance status:             Proposed for operator review. NOT accepted — only the operator
                               marks a screen visually accepted.
```

