# 06 - Trainer Student Roster - implementation notes

**Append-only.** Add a new entry at the bottom for every implementation checkpoint touching this screen. Never edit or delete an existing entry - a superseded entry is corrected by a later entry that says so.

---

## Entry template - copy below the last entry

```
Timestamp (Asia/Singapore):
Source branch:
Starting commit:
Screen ID:                     06
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
Screen ID:                     06
Checkpoint:                    F-01a — bounded WCAG 2.2 AA accessibility correction.
                               NOT a screen reconstruction. This screen's visual acceptance
                               status is unchanged and remains Not started.
Existing route audited:        /trainer/sessions/[sessionId]/roster
Components preserved:          all — no component was replaced, created, moved or restructured
Components replaced:           none
Components created:            none
DTO and port changes:          none
Fixture changes:               none
Backend dependencies discovered: none new
Vocabulary dependencies:       none. No rating label, Class Grade label or copy string was touched.
                               Amendment 006 V3 remains pending and unauthorized.
Governance blockers:           none
Change made on this screen:    features/trainer/trainer-roster.tsx:153 and :162
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
Screen ID:                     06
Checkpoint:                    F-01b — bounded correction of the High finding the independent
                               verifier raised against F-01a. NOT a screen reconstruction.
                               This screen's visual acceptance status is UNCHANGED.
Existing route audited:        /trainer/sessions/[sessionId]/roster
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
Measured on this screen:       "Absent · assessment unavailable" (disabled) took its declared
                               text-slate-500 on bg-slate-100, 4.349:1 (was #1b2b4b 12.833:1 by
                               inheritance). SC 1.4.3 exempts inactive components; this is the intended
                               inert treatment. Recorded: this screen uses Tailwind default-palette
                               classes rather than project tokens — a convergence item for its own
                               checkpoint, not touched here.
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
Starting commit:               468ac56a87a162a7b50d19c49986de055b852a5a
Screen ID:                     06
Checkpoint:                    FRONTEND RECONSTRUCTION F5 - executed as operator checkpoint
                               F-05. Full visual reconstruction of screen 06 against the
                               frozen node 487:9 frame. Screen 06 PROPOSED visually accepted;
                               only the operator changes SCREEN_INDEX.md.
Reference integrity:           06-trainer-student-roster/reference.png SHA-256
                               78e4b618ed154ced8be68f8997903a8fd30e2f99f962ae08a01345e67e13659a
                               verified BEFORE any work began and UNCHANGED AFTER -
                               1440 x 1120, 119,195 bytes, byte-identical to the tracker
                               checksum table and to screen.md section 3.
Existing route audited:        Yes - /trainer/sessions/[sessionId]/roster, the PINNED
                               implemented path. NO route was created, moved, renamed,
                               redirected or aliased. The canonical route
                               /trainer/schedule/[sessionId]/student-roster and its
                               "Replace after integration" treatment remain UNEXECUTED and
                               require their own authorization (inventory section 7.2,
                               screen.md section 6).
Components preserved:          the R-2 governed roster projection call
                               (port.getSessionRoster) and the session summary call
                               (port.listTrainerSessions); per-student report-state display;
                               server-side assignment proof; every destination route the
                               previous surface reached (assess, generate, review); the
                               loading, failed and unavailable resource states.
Components replaced:           the provisional PageHeading + single-column numbered card list
                               was replaced by the frame's composition - breadcrumb and
                               "Back to Schedule" header, dark-accent Class Session banner
                               with assessment progress, three-region session strip, and the
                               four-column learner card grid with Filter and Sort.
Components created:            StripLabel, RosterCard, RosterAction and the pure resolveAction
                               function, all local to features/trainer/trainer-roster.tsx. No
                               shared primitive was added, altered or moved.
DTO and port changes:          NONE. lib/frontend/contracts/ and
                               lib/frontend/physical-test-port.ts are untouched.
Fixture changes:               NONE. lib/frontend/fixtures/ is untouched.
Route/permission changes:      NONE. Route census unchanged at 17 application routes plus
                               /_not-found.

GOVERNANCE HELD - the rules a static frame cannot demonstrate:

  1. ATTENDANCE AND ABSENCE (A-018, CLAUDE.md section 6). Attendance arrives resolved on the
     governed projection; nothing here computes, infers, defaults or toggles it, and no
     enrolment eligibility is computed client-side. resolveAction gates on attendance BEFORE
     it reads any report status, so an absent learner's card offers no assessment path and no
     report path - no link, no route, and deliberately NO lifecycle status pill either, so
     absence can never create or expose a fabricated assessment or report. Asserted in the
     browser: the absent card contains zero anchors, every control on it is disabled, and its
     text matches none of the eight lifecycle status labels.
  2. PER-STUDENT ACTION GATING. There is no generic handler shared across the cards.
     resolveAction is an exhaustive switch over THAT learner's actual reportState with a
     never-typed exhaustiveness check, and each branch resolves its own destination:
     no_report/incomplete -> Assess (assessment route); observation_saved/drafting ->
     Continue (that report's generate route); draft_ready/needs_edit -> Review (that report's
     review route); trainer_approved/approved/submitted -> View report (that report's review
     route, soft treatment). A state naming no reachable report renders an inert control with
     a non-disclosing reason rather than a guessed destination.
  3. CONTINUITY (persona section 3.8, Phase 1 exit condition (c)). previousSessionFocus is
     carried on every present learner's card AND summarised across the session in the strip's
     "Focus carried over from the previous session" region, so carry-over threads through the
     LIVE roster experience rather than only existing in the database.
  4. NOT RATING-BEARING (screen.md section 8). No competency-rating vocabulary is rendered.
     The Class Grade this screen does render is a DIFFERENT, unchanged vocabulary (A-054),
     is rendered verbatim, and marks itself data-vocabulary="class-grade" so a rating-token
     guard classifies it by ACTUAL CONTEXT. No keyword replacement over advanced / secure /
     emerging / beginning / mastering / mastered was performed anywhere.

FRAME-VERSUS-GOVERNANCE DISCREPANCIES - recorded, never resolved locally (A-045):

  D1  "CLASS IN SESSION" banner eyebrow and its live dot assert a session LIFECYCLE state.
      The session-lifecycle enum is DEFERRED and unratified and CLAUDE.md section 6.1 / A-026
      say "do not invent a placeholder enum". The eyebrow names the governed entity -
      "CLASS SESSION" - and the dot is dropped with it. Same adjudication as F-04's D2.
  D2  "Lesson 3 - Voice & Projection" and its "Tue 11 Mar - Studio 2" line. No lesson number,
      lesson title or room field exists on TrainerSessionSummaryDto. OMITTED rather than
      fabricated; the strip carries the governed Class Module, Class Grade, date and time.
  D3  "KEY FOCUS" chips are lesson-plan tags with no governed backing. The region is kept and
      filled from the only governed focus data on this screen - the roster's carried-over
      previous-session focus - and is labelled for what it actually is.
  D4  "SLIDES" chips (KEY / PPTX attachments) have no governed material or attachment record,
      so they are omitted rather than faked. "View lesson plan" keeps the frame's label and is
      rendered DISABLED with a visible, programmatically associated reason - the F-04 D1 /
      F-11 treatment for an affordance with no governed backing.
  D5  "Trainer: <name>" - the projection carries no assignment-name field (the dependency F-04
      already recorded), so no staff identity is rendered.
  D6  The frame draws EIGHT synthetic learner cards. Figma mock data is never ported
      (GLOBAL_UI_RULES section 8): the grid renders exactly what the governed roster
      projection returns - four entries for this Class Session - in the frame's four-column
      composition, which is why the delivered render shows four cards and not eight.
  D7  The frame highlights "Schedule" in the left rail. That rail is
      components/layout/portal-shell.tsx, OUTSIDE this checkpoint's owned paths, and its
      Schedule item matches /trainer/schedule exactly while this screen still sits on the
      pinned /trainer/sessions/... path. The highlight therefore follows the separately-
      authorized route migration, not this checkpoint; the relationship is carried instead by
      the breadcrumb and the "Back to Schedule" control the frame also draws. NOT fixed here -
      recorded for the operator.
  D8  The frame's absent-card treatment uses a very light grey initials chip. The shared
      Avatar "muted" variant measures 2.004:1 in the production DOM and components/ui/avatar.tsx
      is unowned, so the inert treatment is reproduced locally at the AA floor - same family,
      same hue, luminance moved.

Backend dependencies discovered - recorded, never invented:
  (1) lesson plan / lesson number / lesson title (D2, D4);
  (2) session materials or slide attachments (D4);
  (3) session room or location (D2) - the same gap F-04 recorded for screen 05;
  (4) assigned-trainer name on the session projection (D5) - likewise;
  (5) a Trainer-reachable attendance TOGGLE. A-018 gives the trainer the right to mark an
      individual learner Absent, and the frame draws attendance state but no control. No
      attendance mutation exists on PhysicalTestPort, so NO toggle was built, faked or
      stubbed; the roster renders the server-resolved state only. Recorded as a dependency.
Vocabulary dependencies:       none. Amendment 006 V3 remains pending and unauthorized; the
                               rating union in lib/frontend/contracts/physical-test.ts still
                               declares the superseded labels and was NOT touched. No Class
                               Grade artefact was changed.
Governance blockers:           none.
Browser viewport:              1440 x 1120 (the frozen frame's native dimensions), plus
                               1024 x 900 and 480 x 900.
Before screenshot:             not captured - the pre-F5 surface is recoverable from commit
                               468ac56a87a162a7b50d19c49986de055b852a5a.
After screenshot:              UI_REFERENCE_FINAL_MVP\_checkpoint-evidence\F-05\
                               f05-roster-1440x1120.png (plus the 1024, 480, absent-filter,
                               empty-roster and unavailable renders and f05-evidence.json).
                               Written OUTSIDE Git. Synthetic data only.

A REAL WCAG 2.2 AA DEFECT WAS FOUND AND FIXED INSIDE THIS CHECKPOINT - and it is precisely the
one the F-01b entry above predicted. app/globals.css declares h1, h2, h3, h4 { color: #1b2b4b }
UNLAYERED, which outranks every rule in @layer utilities, so text-white on the dark Class
Session banner heading was generated, matched and silently LOST the cascade: measured 1.11:1,
white-declared heading text rendering near-black on the accent surface. globals.css is outside
this checkpoint's owned paths, so the fix is local and does not touch it - the colour is
carried on an inner span the unlayered selector cannot match. The same treatment is applied to
the strip's region labels and the absent learner's name, whose intended muted colour was being
silently overwritten by the same rule. No !important was used and no unowned file was edited.

Accessibility: heading outline h1 -> h2 -> h3 with no skip; the breadcrumb is a nav/ol with an
aria-hidden separator; Filter and Sort are real selects with programmatically associated
labels; the progress bar is decorative and aria-hidden because the same fact is stated in text
("2 of 3 present learners assessed"); attendance is carried by an icon AND the words Present /
Absent, never by colour alone; every action carries an sr-only learner-name suffix so its
accessible name is unique across the grid; empty and no-match states carry role="status"; every
interactive target is at least 44 px. Contrast measured from LIVE COMPUTED STYLES in the
production build across 60 text nodes: 53 pass and EVERY OWNED-SURFACE NODE PASSES. The 5
residual failures are all components/layout/portal-shell.tsx at 2.828:1 (identity sub-label and
fixture footer) - pre-existing and outside the owned surface, the same adjudication F-04
recorded. The 2 remaining are DISABLED controls at 2.043:1, which SC 1.4.3 expressly exempts as
inactive user-interface components. NO horizontal page scroll at 1440, 1024 or 480 px -
documentElement.scrollWidth measured 1440 / 1024 / 480, equal at all three.

Validation:                    reference.png SHA-256 verified BEFORE and UNCHANGED AFTER;
                               node_modules/.bin/tsc --noEmit exit 0;
                               node_modules/.bin/eslint . exit 0; npm run build exit 0 with the
                               route census UNCHANGED at 17 application routes plus
                               /_not-found (none added, removed or renamed);
                               node tests/frontend/trainer-browser-smoke.mjs exit 0 (now 9
                               check groups, including the screen 06 group);
                               node tests/frontend/three-role-browser-smoke.mjs exit 0;
                               node tests/frontend/authentication-browser-smoke.mjs exit 0;
                               git diff --check exit 0. All three browser suites were run
                               against a PRODUCTION build (next start), never a cold dev
                               server, and the server was restarted after the final rebuild.
                               ZERO uncaught browser-console/runtime errors in every run.
                               No dependency, no test runner, and no package.json or
                               package-lock.json change of any kind (R-B7).
Process hazard:                an ORPHANED next start from an earlier session was still holding
                               port 3000 and serving stale chunks, which failed the first suite
                               run at the login surface. The stale server was terminated and
                               every result above comes from a server started on the final
                               build. Recorded so it is not re-learned.
Ending commit:                 the commit created by
                               "feat(frontend): reconstruct trainer student roster"
Acceptance status:             Ready for review - screen 06 PROPOSED visually accepted
Recorded, NOT fixed (outside this screen's owned surface): the portal-shell nav/identity/footer
contrast failures; brand-mark.tsx's hardcoded href="/trainer" inside the Parent and Management
shells; the absent skip-to-content link; trainer-dashboard.tsx's undefined bg-warning-800
token; and the remaining unlayered app/globals.css rules recorded at F-01b - this checkpoint
worked around the h1-h4 rule locally rather than editing an unowned file.
```

### UI RECONCILIATION plan Phase 5 (`F-UI-DRIFT-1` bucket (c)) — 2026-08-10

```
Timestamp (Asia/Singapore):    2026-08-10
Source branch:                 develop (DEVELOPMENT CLONE)
Starting commit:               5dda019
Screen ID:                     06
Existing route audited:        Yes. /trainer/sessions/[sessionId]/roster unchanged.
                               Route census 17, unchanged.
Components preserved:          components/ui/{avatar,status-pill,badge,icon}.tsx byte-unchanged.
Components replaced:           None.   Components created: None.
DTO and port changes:          NONE.   Fixture changes: NONE.
Backend dependencies discovered:
                               None new. The lesson-plan / session-material dependency and the
                               absent staff-identity and lesson-metadata fields all stand.
Vocabulary dependencies:       None. Class Grade (A-054) rendered verbatim, still marked
                               data-vocabulary="class-grade".
Governance blockers:           None. NEW-QUESTION: none.

SCOPE:                         Visual reconciliation ONLY against
                               UI_REFERENCE_FINAL_MVP/reference/Trainer - Student Roster/
                               (A-056, visual rank 1). The .html export was read for VALUES
                               ONLY - no export markup, class name, DOM structure, absolute
                               position or fixed pixel layout entered the component.

TRUE-DRIFT RESOLVED:           22. Full table: docs/plan/UI_RECONCILIATION_BATCH_3_ADJUDICATION.md
                               Phase 5 section 5.1.

REGISTERED-OMISSION PRESERVED: 7, ZERO CHANGED - D1 no CLASS IN SESSION eyebrow and no live
                               dot, D2 no lesson number/title/room, D3 governed carried-over
                               focus only and still labelled, D4 slides chips omitted and
                               "View lesson plan" still disabled with its reason, D5 no staff
                               identity, D6 no synthetic learners, D7 rail is Phase 0.
                               Also preserved: an absent learner card carries NO lifecycle
                               status and NO report affordance (A-018); the attendance refusal
                               offers no retry; unauthorized and unavailable keep ONE shared
                               non-disclosing sentence; the per-student action is still
                               resolved per learner with no shared generic handler.
                               Reported as a SEPARATE list from TRUE-DRIFT (plan 6.5).

TWO LIVE DEFECTS FOUND AND FIXED, one of a NEW class:
                               (a) "rounded-control" and "border-hairline" are UNDEFINED
                                   TOKENS - neither exists in @theme inline, so Tailwind
                                   emitted NOTHING and the attendance toggle had been
                                   rendering square-cornered and borderless since it was
                                   written. They were the only two uses in the repository.
                                   The static cascade audit CANNOT catch this class - there
                                   is no competing rule, the rule simply never exists - so it
                                   is caught only by grepping the COMPILED stylesheet. Both
                                   are now recorded as verified MISS.
                               (b) The frame 1.5px PINK hairline on the session strip could
                                   not be applied through a utility: .card is UNLAYERED and
                                   declares the `border` SHORTHAND, so border-brand-200 on a
                                   .card element is emitted, matched and discarded. The strip
                                   is now composed from utilities the cascade actually
                                   reaches. .card itself is untouched.

Browser viewport:              n/a - see below.
Before/After screenshot:       NOT CAPTURED.
                               *** RENDERED CAPTURE IS **NOT-RUN**, WITH ITS REASON. ***
                               Screen 06 is AUTHENTICATED; the portal layout runs
                               requirePortalAccess, needing a session and therefore a
                               reachable governed database, and .env.local here configures the
                               HOSTED dev project only - a CLAUDE.md 12 stop-and-ask no
                               current authorization carries. No capture was manufactured and
                               no hosted or paid service was contacted. NOT-RUN is not PASS.
Validation:                    tsc 0 - eslint 0 - build 0 - route census 17 UNCHANGED
                               app-route-census / portal-navigation-active-state /
                               post-login-destinations / session-eligibility  all PASS
                               emitted-CSS verification: 20/20 new utilities OK
                               reference.png SHA-256 78e4b618... verified UNCHANGED.
                               No governed surface touched. No dependency added.
Ending commit:                 recorded in docs/progress/STATUS.md and in the adjudication
                               Commits table (filled one phase late).
Acceptance status:             PASS is this session EVIDENCE verdict only.
                               Accepted is OPERATOR-SET ONLY and has NOT been set.
```

### HERO CHAIN plan Phase 4 — 2026-08-10 — the lesson strip, the banner trainer, and the G-3 boundary

**Track:** hero chain completion, plan §8 Phase 4. **Branch/worktree:** `develop` / none. **Starting HEAD:** `34d234e`.

### Scope

Banner: `Junior · Public Speaking · Studio 2` and `Trainer: <name>`. Lesson strip: `Lesson N · Title` as the headline, with module, Class Grade, date and room beneath. Every segment **disappears** when its field is NULL — with no lesson recorded the headline falls back to the governed Class Module **exactly as before**, which is the pre-existing title and not a placeholder standing in for a lesson.

**Two recorded divergences discharged, both of which were DEPENDENCIES rather than ruled omissions:** **D2** (*"no lesson number, lesson title or room field exists on `TrainerSessionSummaryDto`"*) and **D5** (*"the projection carries no assignment-name field"*). Both were correct when written and deliberately not invented around.

### ⛔ The G-3 boundary is the point of this phase, and it is asserted in THREE layers

The frame draws **KEY FOCUS** chips in *exactly* the visual position the roster already uses for the trainer's **governed carried-over previous-session focus**. KEY FOCUS is lesson-plan **intent**; `previousSessionFocus` comes from the trainer's own `observations.follow_up_notes` on the previous session of the same module. ⚠️ **Conflating them would silently replace a governed field with an ungoverned one, and the strip would still look correct.** `CLAUDE.md` §10 Phase 1 exit condition **(c)** depends on that not happening.

* **Schema** — `P4-5`: no `focus` / `slide` / `lesson_plan` / `material` column on `class_sessions`, **and `observations.focus_chips` is still present.** Both halves: asserting only the absence would pass equally well on a schema that had *lost* the governed chips.
* **Contract** — `P4-7d/e/f`: the session DTO carries the lesson fields and **no** KEY FOCUS / slides / attachment / lesson-plan field; `RosterEntryDto.previousSessionFocus` is **still there and was not replaced**.
* **JSX** — `P4-7a/b/c`: ⚠️ **this is the layer that matters, and the database cannot enforce it.** Both values are legitimately readable by the same trainer on the same page, so the violation would happen entirely in the component. The check locates the carried-focus block **by its own label**, asserts **no lesson token appears inside it**, *and* asserts the block **still renders `carriedFocus`** — an emptied block would otherwise satisfy the first assertion perfectly.

**The frame's region is kept, filled from the governed focus, and LABELLED FOR WHAT IT IS.** That label is the safeguard, and Phase 4 changed neither it nor its source.

### ⚠️ A leg was WRONG and the harness caught it — recorded, because the refusal was right

`P4-4`'s first revision selected `observations.follow_up_notes` **directly** as `authenticated` and was refused: **`permission denied for table observations`.**

**The refusal was correct and the leg was wrong.** `authenticated` holds **no table grant** on `observations` — deliberate deny-by-default (A-030: *privilege and policy are separate layers*), and `getSessionRosterCore` reads the carry-over through **`assessment_get_trainer_observation`**, never the table.

▶ **The fix made the evidence stronger, not weaker.** Reading through the RPC proves the boundary **on the path the roster actually uses**, rather than on a table the application never touches. ⚠️ **It would have been easy to "fix" this by granting `SELECT` on `observations` to `authenticated`** — which §12 names explicitly: *never work around a fail-closed refusal by weakening the thing that refused.* The grant was not touched.

⚠️ **Note also what did NOT happen: the runner reported `FAIL` with `3/6` legs and did not report green.** The pinned literal leg count is what made an aborted suite visible; `passes > 0` would have shown four passes and looked fine.

### Verification

- **`npm run prove:hero-4` — 6 SQL legs + 6 contract/JSX legs, ALL PASS, 0 FAIL.** Transaction-scoped ending in `ROLLBACK`; counts `0|0|0|0|0|1` → **unchanged**, so the lesson/room write left nothing behind.
  - ⚠️ **`P4-1` NON-VACUITY, FIRST** — a **real carry-over pair** exists (prev `e5…0001` → curr `e5…0002`, note length 129), supplied by the `P1-T09a` fixture expansion. It **raises** rather than continuing if absent: a carry-over that does not exist cannot be proven undisturbed.
  - `P4-4` the governed carried-over note is **byte-unchanged** after lesson identity was written, and contains no lesson value.
  - `P4-6` an unauthenticated caller reaches neither the session row nor the staff identity.
- **No database object added.** Migrations **20**, unchanged.
- `tsc` **0** · `eslint` **0 errors** (2 pre-existing warnings) · `build` **0** · **route census 17** · `session-eligibility` **PASS** · `portal-navigation-active-state` **PASS** · `post-login-destinations` **PASS**.
- **Emitted-CSS verified** for all four classes used; **no new class** — compiled stylesheet still **45,748 bytes**.

### Preserved, unchanged

⛔ **KEY FOCUS chips** (G-3) · **SLIDES** chips and **View lesson plan**, which stays visibly inert with its stated reason (G-3, G-8 class) · **"CLASS IN SESSION"** live dot and eyebrow, still relabelled "Class Session" because the session-lifecycle enum is deferred and A-026 forbids inventing a placeholder · the frame's **eight synthetic learner cards** are still not ported.

⚠️ **The strip's caption stays "This session"**, not the frame's "THIS LESSON": the block still carries session-level facts, and a caption rename is reconciliation work rather than this phase's delta.

### Carried

**RENDERED CAPTURE `NOT-RUN`.** `B-C2-1` untouched. **`NEW-QUESTION`: none.**

### Commit / next

**Next: Phase 5 (`07` Trainer Grade Student)** — rail bucket counts and per-learner status; all inputs already exist on `getSessionRosterCore`. ⛔ **Stop before `F-S6-REVIEW-1` (Phase 7).**
