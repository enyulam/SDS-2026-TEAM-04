# 07 - Trainer Grade Student - implementation notes

**Append-only.** Add a new entry at the bottom for every implementation checkpoint touching this screen. Never edit or delete an existing entry - a superseded entry is corrected by a later entry that says so.

---

## Entry template - copy below the last entry

```
Timestamp (Asia/Singapore):
Source branch:
Starting commit:
Screen ID:                     07
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
Starting commit:               6e8816e218d5b1b896abdf234be3657e3b6638e6
Screen ID:                     07
Checkpoint:                    F-01b — bounded correction of the High finding the independent
                               verifier raised against F-01a. NOT a screen reconstruction.
                               This screen's visual acceptance status is UNCHANGED.
Existing route audited:        /trainer/sessions/[sessionId]/students/[studentId]/assess
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
Measured on this screen:       PRIMARY NAMED SURFACE. "Save observation & generate draft", enabled after
                               all nine ratings: #1b2b4b on #d6357a = 3.113:1 at 14px/400 BEFORE ->
                               #ffffff on #d6357a = 4.517:1 at 14px/700 AFTER. Passes.
                               All 36 rating chips took their intended per-band ink at 12px/800
                               (6.813-8.339:1, all pass), previously flattened to #1b2b4b/400.
                               The disabled state of the same button took disabled:text-ink-subtle
                               #a6aec0 on disabled:bg-neutral-soft #f1f3f8 = 2.004:1 — the intended
                               inert treatment, SC 1.4.3 exempt, and now actually legible AS disabled.
                               No rating LABEL was changed; Amendment 006 V3 remains unauthorized.
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
Starting commit:               84f7d8028729afa06fa36094d6dcb8e4810f8745 (F-05)
Screen ID:                     07 (cross-screen entry - F-06 is NOT a visual screen
                               checkpoint; it is the Amendment 006 vocabulary adoption,
                               recorded here because 07 is the primary rating-bearing surface)
Existing route audited:        /trainer/sessions/[sessionId]/students/[studentId]/assess
                               - NOT moved, NOT restyled, NOT reconstructed. The frozen 07
                               frame was NOT implemented in this checkpoint and screen 07
                               remains visually unreconstructed and unaccepted.
Components preserved:          the whole screen-07 composition. Only the four rating chips'
                               labels, their storage keys and their polarity-keyed colour
                               treatment changed, plus the missing-rating error sentence
                               ("Select Beginning, Developing, Mastering, or Mastered.").
Components replaced:           none
Components created:            none
DTO and port changes:          RATING_LEVELS in lib/frontend/contracts/physical-test.ts
                               becomes beginning | developing | mastering | mastered (A-049).
                               No other DTO, no port method, no route and no permission
                               changed. Route census unchanged at 17 application routes plus
                               /_not-found.
Fixture changes:               lib/frontend/fixtures/dimensions.ts - RUBRIC_ANCHORS re-keyed
                               positionally and now BYTE-IDENTICAL to the backend (A-050);
                               RATING_DISPLAY_LABELS and POLARITY_BANDS added.
                               lib/frontend/fixtures/physical-test-fixture.ts - the two mixed
                               rating sets restated in the ratified vocabulary
                               (ADVANCED_MIXED_RATINGS -> MASTERED_MIXED_RATINGS, a
                               competency-rating identifier renamed deliberately BY CONTEXT),
                               and the grounding-rejection prose now names a Beginning rating.
Backend dependencies:          none newly discovered. Backend V2 is committed on
                               feat/48h-backend (e5a66d7, 103f433, ec5be57); its constants
                               were read READ-ONLY from
                               worktrees/backend-48h/server/modules/framework/dimensions.ts.
                               Nothing was written to or committed in the backend worktree.
Vocabulary dependencies:       DISCHARGED for the frontend. The rating union agrees with the
                               backend EXACTLY; all four behavioural anchors are byte-identical
                               (SHA-256 pairs in _checkpoint-evidence/F-06/
                               backend-frontend-vocabulary-parity.json); polarity agrees
                               exactly and mastering is POSITIVE (A-051).
                               Class Grade (Beginner/Intermediate/Advanced) proven
                               BYTE-UNCHANGED (A-054). NO global keyword replacement over
                               advanced/secure/emerging/beginning/mastering/mastered was
                               performed anywhere; every occurrence was classified by context.
Governance blockers:           none introduced. Screen 07's own reconstruction (F7) and the
                               five F8 blockers recorded in 08's notes are untouched by this
                               checkpoint and still require their own authorization.
Browser viewport:              1440x1400 for the diagnostic renders; the three smoke suites
                               run at their own pinned viewports.
Before screenshot:             n/a - no visual reconstruction was performed
After screenshot:              _checkpoint-evidence/F-06/assessment-rating-beginning.png,
                               -developing.png, -mastering.png, -mastered.png (one per rating
                               state) and trainer-review-nine-snapshots.png
Validation:                    all 12 frozen reference.png SHA-256 verified BEFORE and
                               unchanged AFTER - 12/12 match; npx tsc --noEmit exit 0;
                               npx eslint . exit 0; npm run build exit 0 with the route census
                               unchanged at 17 application routes plus /_not-found;
                               trainer-browser-smoke.mjs exit 0; three-role-browser-smoke.mjs
                               exit 0; authentication-browser-smoke.mjs exit 0 - all three
                               against a PRODUCTION build (next start), never a cold dev
                               server; git diff --check exit 0; ZERO uncaught
                               browser-console/runtime errors in every run.
                               WCAG 2.2 SC 1.4.3 measured in the RENDERED PRODUCTION DOM for
                               ALL FOUR rating states, idle AND selected - 8 measurements,
                               minimum 7.638:1, every one >= 4.5:1
                               (_checkpoint-evidence/F-06/wcag-four-rating-states.json).
                               MEASUREMENT DEFECT CAUGHT INSIDE THE CHECKPOINT: Tailwind v4
                               resolves these tokens to oklab()/lab(), whose components can be
                               NEGATIVE. A naive numeric scrape drops the minus sign and
                               reports a plausible but wrong ratio. The computed colours are
                               therefore rasterised through a 1x1 canvas to sRGB - the bytes
                               the browser actually paints - before the ratio is taken.
Ending commit:                 5dcbeeb6c45e97506cf2404e37df4e0d00b9dff0
                               "feat(frontend): adopt the ratified competency vocabulary
                               (Amendment 006 A-049)"
Acceptance status:             UNCHANGED - F-06 claims NO screen visually accepted. Screen 07
                               is still Not started for visual reconstruction.
Recorded, not fixed:           the pre-existing defects carried since F-01b are untouched and
                               still open - portal-shell nav contrast, brand-mark's hardcoded
                               /trainer href, the absent skip-to-content link,
                               trainer-dashboard's undefined bg-warning-800 token, and the
                               unlayered app/globals.css rules. All sit outside this
                               checkpoint's owned paths.
One defect found and fixed:    the frontend's level-4 behavioural anchor was a PARAPHRASE of
                               the backend's - "Exceeds the expected level through confident,
                               natural, independent application across different contexts."
                               against v3 3.3's "Exceeds the expected level: strong
                               confidence, natural expression, independent application,
                               consistent across different contexts." A-050 makes v3 3.3's
                               wording authoritative and requires the two copies to be
                               byte-identical, so the divergence was a DEFECT, not a variant.
                               It is corrected and now proven byte-identical by SHA-256.
```

```
Timestamp (Asia/Singapore):    2026-08-06
Source branch:                 feat/48h-frontend
Starting commit:               5dcbeeb6c45e97506cf2404e37df4e0d00b9dff0 (F-06)
Screen ID:                     07 - Trainer Grade Student - FRONTEND RECONSTRUCTION F7,
                               executed as operator checkpoint F-07. Node 784:679,
                               physical-test flow order 4. THE ASSESSMENT INSTRUMENT.
Reference integrity:           07-trainer-grade-student/reference.png SHA-256
                               1df95a5bacae3c07bf3f0dfd0940f2dcf6637b2e539634baab5498588d13199d
                               verified BEFORE any work began and re-verified UNCHANGED after
                               - 1650 x 1200, 131,418 bytes, byte-identical to screen.md
                               section 3 and to the tracker checksum table.
Existing route audited:        YES. /trainer/sessions/[sessionId]/students/[studentId]/assess
                               - app/(portals)/trainer/sessions/[sessionId]/students/
                               [studentId]/assess/page.tsx, presentation in
                               features/trainer/trainer-assessment.tsx. NO ROUTE WAS CREATED,
                               MOVED, RENAMED OR REDIRECTED. The canonical route
                               /trainer/schedule/[sessionId]/student-roster/[studentId]/
                               grade-student and its "Replace after integration; pinned path
                               preserved as a redirect" treatment (inventory 7.2, screen.md
                               section 1) remain UNEXECUTED and need their own authorization.
Components preserved:          the governed observation load/save path (getAssessmentDraft,
                               getDimensions, getTrainerWorkingReport, saveObservation), the
                               observation lock version, the retryable-save recovery that
                               preserves the whole form, the returned-correction banner and
                               its correction-version continuation, and the behavioural
                               anchors carried alongside every rating.
Components replaced:           the entire presentation of
                               features/trainer/trainer-assessment.tsx. The pre-reference
                               build rendered nine separate cards in two sections with
                               Tailwind default-palette chips (red-300 / amber-300 / teal-300
                               / green-300), a sticky progress rail with a bar, a breadcrumb,
                               and legacy navy-*, text-lg, text-sm and text-xs utilities.
                               Replaced by the frame's composition: the "Grade Student" page
                               title with the "Back to Student Roster" pill, the REVIEW &
                               APPROVE counter rail and learner list, the learner identity
                               card, the SINGLE "Assessment Rubric" card holding all nine
                               four-segment rows, the "Observation Notes" card, and the
                               bottom-right "Save & Generate" action. All F1 project tokens.
Components created:            none shared. NO rating-tile primitive was added under
                               components/ui/**, deliberately: the four-segment rating control
                               has exactly ONE consumer in this build - the Trainer review
                               surface renders read-only snapshots, not a selector - so
                               promoting it to a shared primitive would create an abstraction
                               with a single caller and place governed rating presentation in
                               a file that no rating-bearing checkpoint owns. It stays local
                               to the feature. Local-only helpers: ReviewApproveRail,
                               RailEntry, RubricGroup, and an inline EyeGlyph SVG for the
                               frame's Observation Notes icon (components/ui/icon.tsx is
                               outside the owned paths).
DTO and port changes:          NONE. lib/frontend/contracts/physical-test.ts,
                               lib/frontend/physical-test-port.ts and lib/frontend/fixtures/*
                               are BYTE-UNCHANGED. No port method, no permission, no lifecycle
                               transition and no field was added.
Fixture changes:               NONE.
ALL NINE ARE MANDATORY,        A-017 held exactly. There is ONE capture mode: the full nine,
ONE CAPTURE MODE (A-017):      rendered from DIMENSION_CODES. There is no four-dimension path,
                               no mode toggle, no observations.mode, no mode prop, no mode
                               branch and no Quick/Full control anywhere in the owned surface
                               - and the browser suite now asserts BOTH that no Quick/Full
                               copy renders AND that no control is named Quick or Full, so a
                               reintroduction fails the suite rather than passing review.
Frame-versus-governance        EIGHT, recorded and NOT resolved locally (A-045).
discrepancies:
                               D1 ROW ORDER. The frame interleaves the two governed groups -
                               Body, Eye contact, Emotion, Speech, Tonality, Vocal projection,
                               Emotional expression, Sentence flow, Audience awareness. The
                               ratified order is the four B.E.S.T Competency dimensions THEN
                               the five Speech Linguistics Pattern dimensions (CLAUDE.md
                               section 5, spec section 3). GOVERNANCE WINS: the rows render in
                               ratified order and the two groups are captioned so the
                               framework structure the frame's order obscures stays legible.
                               The order is asserted in the rendered DOM.

                               D2 NO ANCHOR IS DRAWN. The frame shows a bare four-segment
                               track with no behavioural anchor anywhere on the screen.
                               CLAUDE.md section 5 requires the anchor to be carried alongside
                               the rating. GOVERNANCE WINS: an anchor line is ADDED beneath
                               every one of the nine rows, and each chip's accessible name
                               carries THAT level's anchor VERBATIM so the behavioural meaning
                               reaches assistive technology BEFORE the choice is made.

                               D3 NO FOLLOW-UP FIELD IS DRAWN. The frame shows only
                               "Observation Notes". observations.follow_up_notes is ONE field
                               surfaced on TWO screens and must be LOADED, never blanked
                               (CLAUDE.md section 6). GOVERNANCE WINS: "Follow-up for Next
                               Session" is ADDED, its loaded value is proved non-empty in the
                               browser against a learner that carries one, and the help text
                               names it as the same governed note Review & Approve shows as
                               "Coach Notes (Internal Only)".

                               D4 "Junior . Student ID 2025-113 . Public Speaking". "Junior"
                               is not a governed Class Grade - the only values are Beginner /
                               Intermediate / Advanced (A-016, A-054) - and no governed
                               learner-facing student number exists on any DTO; rendering the
                               internal studentId as a "Student ID" would manufacture a
                               user-facing identifier. BOTH OMITTED. The identity card carries
                               the governed Class Grade, Class Module and session date.

                               D5 SELECTED-CHIP FILLS. The frame paints the selected segment
                               in the saturated ramp colour with WHITE label text. Measured,
                               those four pairs are 3.70 / 2.03 / 2.34 / 2.51 : 1 - ALL FOUR
                               FAIL SC 1.4.3 for normal-size text. The ratified accessibility
                               requirement wins (GLOBAL_UI_RULES section 7, persona 3.5): the
                               fill moves to the SAME hue's deeper step from the F1 ramp
                               (#b3301f / #8a6106 / #186f6f / #2c6b43), measuring 6.251 /
                               5.536 / 5.929 / 6.381 : 1 in the production DOM. Hue preserved,
                               luminance moved - the F1 status-tint and F-04 primary-action
                               adjudication applied again.

                               D6 The frame draws EIGHT synthetic learners in the rail. Figma
                               mock data is never ported (GLOBAL_UI_RULES section 8): the rail
                               renders exactly the four entries the governed roster projection
                               returns for this Class Session, in the frame's composition.

                               D7 The frame gives EVERY rail learner a lifecycle status. An
                               ABSENT learner gets NONE here, no path, and no place in any of
                               the four counters - absence must never create or expose a
                               fabricated assessment or report (A-018), the same rule F-05
                               holds on the roster. Asserted in the rendered DOM.

                               D8 The frame highlights "Schedule" in the left rail and draws
                               "Students" and "Reports" nav items this build does not carry.
                               That rail is components/layout/portal-shell.tsx, OUTSIDE the
                               owned paths - the same adjudication F-05 recorded as its D7.
Backend dependencies           THREE, recorded and NEVER invented.
discovered:                    (1) A learner-facing student number. The frame prints "Student
                               ID 2025-113"; no DTO carries one, and the internal studentId is
                               not a user-facing identifier. Omitted.
                               (2) A learner year or stage label. The frame prints "Junior";
                               the only governed grade vocabulary is Class Grade, whose values
                               are Beginner / Intermediate / Advanced. Omitted rather than
                               mapped onto a vocabulary it does not belong to.
                               (3) A programme or subject label distinct from the Class
                               Module. The frame prints "Public Speaking" alongside the
                               module; no such field exists. The governed Class Module is
                               shown instead.
Vocabulary dependencies:       NONE OUTSTANDING - F6 discharged the gate (commit 5dcbeeb),
                               verified live on this branch before any code was written. The
                               nine rows render Beginning / Developing / Mastering / Mastered
                               with storage values beginning / developing / mastering /
                               mastered, in ratified low-to-high order, on all nine
                               dimensions. No anchor was reworded, re-wrapped or paraphrased.
                               NO enum label was renamed here - that is Backend V2 / Frontend
                               V3, both already landed. NO global keyword replacement was
                               performed over advanced, secure, emerging, beginning, mastering
                               or mastered. The Class Grade the identity card renders
                               (Beginner) is a DIFFERENT, unchanged vocabulary (A-054) and
                               marks itself data-vocabulary="class-grade" so a rating-token
                               guard classifies it by ACTUAL CONTEXT rather than by keyword.
Server-side authority:         the all-nine check on this form gates a button and reveals a
                               banner, and is UX CONVENIENCE ONLY (ADR-3). The save-gate copy
                               now says so in as many words - "Completion is re-validated by
                               the governed save against all nine dimensions - the check on
                               this form is a convenience only" - so nothing on the screen
                               implies the client check is authoritative.
Accessibility:                 heading outline h1 -> h2 -> h3 with no skip. Each of the nine
                               dimensions is a fieldset whose legend names the dimension, its
                               focus and "(required)". EVERY one of the 36 rating controls
                               carries a REAL, DISTINCT accessible name - dimension, ratified
                               label, ", selected" when active, and that level's behavioural
                               anchor VERBATIM - asserted as 36 distinct names in the DOM;
                               without it all 36 would expose only four names repeated nine
                               times. Selection is carried by aria-pressed, a check glyph, the
                               accessible name and the visible anchor line naming the chosen
                               level in words - NEVER by colour alone. The validation banner
                               is role="alert", names how many dimensions are missing, and
                               focuses and scrolls the first missing fieldset; each missing
                               fieldset is aria-invalid with its error wired by
                               aria-describedby. Both textareas have real labels and the
                               Follow-up hint is wired by aria-describedby. Every interactive
                               target is at least 44 px high. The instrument is keyboard
                               operable end to end - 36 native buttons plus two textareas, in
                               DOM order, with the project's visible focus ring.
                               Contrast measured from LIVE computed styles in the production
                               build across 135 text nodes: 130 pass and EVERY owned-surface
                               node passes. The 5 residual failures are all
                               components/layout/portal-shell.tsx at 2.828:1 (the identity
                               sub-label and the fixture footer) - pre-existing and outside
                               the owned surface, the same adjudication F-04 and F-05
                               recorded. No horizontal page scroll: documentElement.
                               scrollWidth measured 1650 / 1024 / 480 at those three widths,
                               equal at all three.
A REAL MEASUREMENT DEFECT      The F-06 selected-chip contrast numbers (8.225 / 8.131 / 8.339
WAS FOUND AND FIXED INSIDE     / 8.228) were measured MID-TRANSITION and were therefore not
THIS CHECKPOINT:               measuring the settled selected state at all. getComputedStyle
                               returns the CURRENTLY INTERPOLATED value while a CSS transition
                               is running; every rating chip carries a transition, and the
                               reading fired as soon as the anchor text repainted - well
                               inside the 150 ms window. On this build that produced 9.502:1
                               for all four states, which is the IDLE pair (#33405c on
                               #f4f5f9) reported for a chip whose className was ALREADY the
                               selected one: a plausible, passing, and wrong number.
                               The harness now (a) emulates prefers-reduced-motion: reduce,
                               which collapses every transition to 0.01 ms through the
                               reduced-motion block already in app/globals.css, and (b) waits
                               for the selected chip's computed background to be
                               non-transparent before reading. The real settled values are
                               6.251 / 5.536 / 5.929 / 6.381 : 1 - all four still clear 4.5:1,
                               so the F-06 CONCLUSION survives, but the measurement that
                               supported it did not. This is the same class of defect F-06
                               itself recorded for the oklab() sign scrape: a harness that
                               degrades to a plausible number rather than to an error.
                               All four states are now measured in BOTH treatments - idle
                               9.502:1 each, selected as above.
A SECOND AA DEFECT FIXED       the shared Avatar "muted" variant renders text-ink-subtle on
LOCALLY:                       bg-neutral-soft - 2.004:1, measured in the production DOM - on
                               the absent learner's initials in the rail.
                               components/ui/avatar.tsx is outside the owned paths, so the
                               inert treatment is reproduced LOCALLY at the AA floor
                               (text-neutral-on on bg-neutral-soft, 5.02:1) - same family,
                               same hue, luminance moved. This is the same local adjudication
                               F-05 recorded as its D8, and it remains a defect in a SHARED
                               component that still needs its own fix in its own checkpoint.
Browser viewport:              1650 x 1200 (the frozen reference's native dimensions), plus
                               1024 x 900 and 480 x 900.
Before screenshot:             NOT captured. The pre-F-07 surface is reachable from the
                               starting commit; no implementation-before.png was written.
After screenshot:              captured OUTSIDE Git to
                               UI_REFERENCE_FINAL_MVP\_checkpoint-evidence\F-07\ - seven
                               renders (reference viewport unrated, the validation state, all
                               nine rated exercising all four levels, 1024, 480, the
                               returned-correction state with its loaded Follow-up value, and
                               the non-disclosing unavailable state for the absent learner)
                               plus wcag-contrast-1650.json and f07-measurements.json.
                               Synthetic fixture data only.
Validation:                    reference.png SHA-256 verified before and after - UNCHANGED.
                               node_modules/.bin/tsc --noEmit - exit 0.
                               node_modules/.bin/eslint . - exit 0.
                               npm run build - exit 0, ROUTE CENSUS UNCHANGED at 17
                               application routes plus /_not-found; none added, removed or
                               renamed.
                               node tests/frontend/trainer-browser-smoke.mjs - exit 0, now 10
                               check groups including the new screen 07 group.
                               node tests/frontend/three-role-browser-smoke.mjs - exit 0.
                               node tests/frontend/authentication-browser-smoke.mjs - exit 0.
                               git diff --check - exit 0.
                               All three browser suites ran against a PRODUCTION build
                               (next build + next start), NEVER a cold dev server, and the
                               server was restarted on the final build after the last rebuild
                               - the stale-server hazard F-04 and F-05 recorded was hit again
                               here and is recorded again so it is not re-learned.
                               ZERO uncaught browser-console/runtime errors in every run.
                               No dependency, no test runner, no package.json and no
                               package-lock.json change of any kind (R-B7); npm audit fix was
                               not run. governance-source/ was NOT read (A-055). The frozen
                               demo at "SDS Project Sprint 2" was not touched.
Ending commit:                 the commit created by
                               "feat(frontend): reconstruct trainer grade student"
Acceptance status:             READY FOR REVIEW - screen 07 PROPOSED visually accepted.
                               Only the operator marks a screen accepted.
Recorded, not fixed:           outside the owned paths and still open - portal-shell nav and
                               identity/footer contrast (2.225:1 - 3.079:1, SC 1.4.3);
                               brand-mark.tsx:86's hardcoded href="/trainer" in the Parent and
                               Management shells; the absent skip-to-content bypass link
                               (SC 2.4.1); trainer-dashboard.tsx:72's undefined bg-warning-800
                               token; the unlayered *, body, h1-h4, .card, .panel and
                               .form-field rules in app/globals.css; brand-700 white-on-pink
                               primary actions at 4.517:1; and the shared Avatar "muted"
                               variant at 2.004:1 recorded above.
```

### UI RECONCILIATION plan Phase 6a (`F-UI-DRIFT-1` bucket (c)) — 2026-08-10

```
Timestamp (Asia/Singapore):    2026-08-10
Source branch:                 develop (DEVELOPMENT CLONE)
Starting commit:               ca9396e
Screen ID:                     07
Existing route audited:        Yes. Route unchanged. Route census 17, unchanged.
Components preserved:          components/ui/{button,avatar,icon}.tsx byte-unchanged.
                               ratingStyles byte-unchanged (D5).
Components replaced:           None.   Components created: None.
DTO and port changes:          NONE.   Fixture changes: NONE.
CSS:                           app/globals.css gained ONE ADDITIVE rule,
                               ".form-field.notes-field", mirroring the ratified
                               ".form-field.auth-field" pattern. No existing rule, token or
                               value was modified; .form-field was NOT moved into a layer;
                               the new selector has exactly two consumers, both on this
                               screen. Needed because .form-field is UNLAYERED and declares
                               border-radius / padding / border, so rounded-[..] / px-[..] /
                               py-[..] on those textareas would have been emitted, matched
                               and silently discarded.
Vocabulary dependencies:       None new. A-049 labels and A-050 anchors unchanged.
Governance blockers:           NEW-QUESTION: none.
                               INCOMPLETE: ONE, named - see below.

*** THE FOLLOW-UP FIELD - PRESERVED, AND IT HEADS THIS PHASE'S LIST ***
                               The frame lists ONLY "Observation Notes". "Follow-up for Next
                               Session" remains its own labelled control bound to its own
                               column. NOT merged into Observation Notes; its loaded value NOT
                               blanked; its hint untouched. Only its label and textarea TYPE
                               moved. An in-file comment now states WHY it survives, so a
                               later reader does not reconcile it toward the frame.

*** THE END-TO-END CARRY-OVER RE-PROOF IS **NOT-RUN**, AND IT IS OWED ***
                               `npm run test:continuity` was ATTEMPTED. It reached CONT-0
                               (PASS - the earlier session's observation carries a non-empty
                               129-char follow-up note) and then FAILED at CONT-A0: the LOCAL
                               Supabase stack's connection values could not be captured. That
                               is B-STAGE3-2, which the build plan section 6 already records
                               as blocking any phase needing pristine local fixtures, and as
                               OPERATOR-OWNED (three interactive no-echo passwords).
                               Recorded as NOT-RUN, NOT as PASS and NOT as a NEW-QUESTION -
                               the blocker is already registered. The harness reached NO
                               database and NO network: it reads connection values only from
                               loadLocalStack(), never from .env.local, and exited BEFORE
                               constructing any Supabase client. The frozen project was not
                               contacted and no stack start or reload was attempted.
                               Proven instead, statically and end to end: followUp state ->
                               submit payload (trainer-assessment.tsx:360) -> observation/
                               core.ts:127 maps input.followUpNotes -> p_follow_up_notes ->
                               the RPC parameter (20260806090000...:179) and column
                               (20260803034500...:631) -> trainer-projections.ts:283 sets
                               previousSessionFocus from it. Weaker than the runtime leg and
                               declared as such. THE RUNTIME LEG REMAINS OWED.

TRUE-DRIFT RESOLVED:           14. Full table: docs/plan/UI_RECONCILIATION_BATCH_3_ADJUDICATION.md
                               Phase 6a section 6a.3.

REGISTERED-OMISSION PRESERVED: 6, ZERO CHANGED - the Follow-up field; D1 ratified dimension
                               order with both group captions (NOT the frame's interleaved
                               order); D2 behavioural anchors rendered and in each chip's
                               accessible name, VERIFIED BYTE-IDENTICAL to the backend 4/4
                               (90/100/105/129 chars) rather than assumed; D4 no "Junior"
                               Class Grade and no user-facing "Student ID"; D5 selected-chip
                               fills keep the DEEPER ramp step - ratingStyles is byte-
                               unchanged and the frame's saturated fills (3.70/2.03/2.34/
                               2.51:1, all failing SC 1.4.3) were NOT restored, only the
                               chip's WEIGHT moved; D6 no synthetic learners in the rail.
                               Also preserved: nine dimensions mandatory, no Quick mode, no
                               four-dimension path (A-017); completion still server-validated
                               with the client check named a convenience only; selection still
                               carried by shape, aria-pressed, the accessible name and the
                               visible anchor line, never colour alone.
                               Reported as a SEPARATE list from TRUE-DRIFT (plan 6.5).

Browser viewport:              n/a - see below.
Before/After screenshot:       NOT CAPTURED.
                               *** RENDERED CAPTURE IS **NOT-RUN**, WITH ITS REASON. ***
                               Screen 07 is AUTHENTICATED; reaching a governed database here
                               is a CLAUDE.md 12 stop-and-ask no current authorization
                               carries. No capture manufactured; no hosted or paid service
                               contacted. NOT-RUN is not PASS.
Validation:                    tsc 0 - eslint 0 - build 0 - route census 17 UNCHANGED
                               app-route-census / portal-navigation-active-state /
                               post-login-destinations / session-eligibility  all PASS
                               emitted-CSS verification 13/13 OK, plus the new
                               .form-field.notes-field rule confirmed present in the compiled
                               stylesheet
                               A-050 anchor byte-identity 4/4 IDENTICAL
                               test:continuity NOT-RUN (blocked at CONT-A0, B-STAGE3-2)
                               reference.png SHA-256 1df95a5b... verified UNCHANGED.
                               No governed surface touched. No dependency added.
Ending commit:                 recorded in docs/progress/STATUS.md and in the adjudication
                               Commits table (filled one phase late).
Acceptance status:             PASS is this session EVIDENCE verdict only, and it is
                               QUALIFIED by one owed runtime leg.
                               Accepted is OPERATOR-SET ONLY and has NOT been set.
```
