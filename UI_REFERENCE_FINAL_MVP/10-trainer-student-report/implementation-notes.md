# 10 - Trainer Student Report - implementation notes

**Append-only.** Add a new entry at the bottom for every implementation checkpoint touching this screen. Never edit or delete an existing entry - a superseded entry is corrected by a later entry that says so.

---

## Entry template - copy below the last entry

```
Timestamp (Asia/Singapore):
Source branch:
Starting commit:
Screen ID:                     10
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
Screen ID:                     10
Checkpoint:                    F-01b — bounded correction of the High finding the independent
                               verifier raised against F-01a. NOT a screen reconstruction.
                               This screen's visual acceptance status is UNCHANGED.
Existing route audited:        /trainer/reports/[reportId]/review
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
Measured on this screen:       "Approve" (checklist complete, enabled): #1b2b4b on #d6357a = 3.113:1 at
                               14px/400 BEFORE -> #ffffff on #d6357a = 4.517:1 at 14px/700 AFTER.
                               In the approval dialog, "Approve" and "Approve for management review"
                               both moved 3.113:1 -> 4.517:1. "Cancel" took font-bold, colour unchanged.
                               The checklist gate, its three items and the non-publishing approval copy
                               are unchanged.
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
Screen ID:                     10 (cross-screen entry - F-06 is the Amendment 006 vocabulary
                               adoption, NOT a visual screen checkpoint)
Existing route audited:        /trainer/reports/[reportId]/review - NOT moved, NOT restyled,
                               NOT reconstructed. Screen 10 remains visually unreconstructed
                               and unaccepted, and the open route decision recorded at
                               inventory 7.4 is untouched.
Components preserved:          the whole composition. The only change is that the
                               Trainer-internal "Trainer source check - nine ratings" list now
                               renders the ratified A-049 labels from the single shared label
                               table (lib/frontend/fixtures/dimensions.ts
                               RATING_DISPLAY_LABELS) instead of a second local copy that
                               could drift, and each snapshot carries data-rating-level so the
                               STORAGE VALUE as well as the display label is assertable.
Components replaced:           none
Components created:            none
DTO and port changes:          none on this surface. The union change is recorded in 07's
                               entry.
Fixture changes:               none on this surface.
Governance:                    this nine-rating list is TRAINER-INTERNAL. The management and
                               parent boundaries are unchanged and still proven: the
                               management review DOM and all four parent surfaces are asserted
                               free of every competency-rating token in BOTH vocabularies. The
                               superseded labels are RETAINED in that guard deliberately -
                               A-052 warns that an assertion left pinned to labels that no
                               longer exist keeps passing while checking for values that can
                               no longer occur, which is a silent false negative. The guard is
                               an isolated-raw-label check, never the bare-word prose regex
                               A-052 prohibits.
Vocabulary dependencies:       DISCHARGED. See 07's entry for the byte-identity, union and
                               polarity proofs.
Governance blockers:           none introduced. F9's own blockers stand.
Browser viewport:              1440x1400 for the diagnostic render.
Before screenshot:             n/a - no visual reconstruction was performed
After screenshot:              _checkpoint-evidence/F-06/trainer-review-nine-snapshots.png
Validation:                    trainer-browser-smoke.mjs now proves all nine snapshots render
                               inside the ratified vocabulary, that label and storage value
                               agree, and that ALL FOUR rating states actually reach this
                               surface. Full command list and exit codes in 07's entry.
Ending commit:                 5dcbeeb6c45e97506cf2404e37df4e0d00b9dff0
                               "feat(frontend): adopt the ratified competency vocabulary
                               (Amendment 006 A-049)"
Acceptance status:             UNCHANGED - no screen visually accepted by F-06.
```


```
Timestamp (Asia/Singapore):    2026-08-06
Source branch:                 feat/48h-frontend
Starting commit:               7d3f1bab8c1503044f788141ff9772d0036b8986 (F-07)
Screen ID:                     10
Checkpoint:                    F-09 / FRONTEND RECONSTRUCTION F9 — the visual reconstruction of
                               screen 10 against the frozen node 664:9, AND the fix for the
                               carry-over WCAG defect the F-06 verifier raised against this file.
Reference integrity:           reference.png SHA-256
                               e64291dc80a2af7378635a3daffe63952899768c41493e8a185da12119b4f730
                               verified BEFORE any work began and UNCHANGED AFTER.
                               1440 x 1351, 285,426 bytes.
Existing route audited:        /trainer/reports/[reportId]/review and
                               /trainer/reports/[reportId]/edit — both PINNED, both audited,
                               NEITHER moved, renamed, aliased or redirected. The canonical
                               index route /trainer/reports/[reportId] is NOT created here; its
                               ratified treatment ("add the canonical index route; /review and
                               /edit remain governed sub-surfaces") lands at F-16.
Components preserved:          every governed behaviour. The port calls, the three-item
                               checklist RPC shape, the trainer-approve transition and its
                               concurrency proofs (expectedVersionId, expectedLockVersion,
                               expectedContentHash), the immutable-version save, the
                               byte-identical-save rejection path, the returned-correction and
                               reaffirmation paths, and every failure/loading/unavailable state
                               are unchanged in behaviour.
Components replaced:           the PRESENTATION of both owned surfaces. The review surface was
                               rebuilt into the frame's composition: page title + breadcrumb +
                               Back pill; a single official class-report card (square learner
                               avatar, pink "Class Report — <learner>" title, session subtitle,
                               four icon-led bullet-led content sections); a Class Video
                               Evidence region; and a right rail carrying Report Details,
                               Performance Summary and the approval-state banner. The previous
                               two-column panel grid, the <details> nine-rating disclosure and
                               the full-width checklist block were replaced.
Components created:            none shared. One local DetailRow helper inside the review file.
                               NO shared component was created: the rating tile has exactly one
                               consumer, so promoting it to components/ui/** would put governed
                               rating presentation in a file no rating-bearing checkpoint owns
                               (the same adjudication F-07 recorded for the rating chip).
DTO and port changes:          NONE. lib/frontend/contracts/physical-test.ts,
                               lib/frontend/physical-test-port.ts and
                               lib/frontend/fixtures/** are BYTE-UNCHANGED. The Class row in
                               Report Details is a NARROWING read over listTrainerSessions() —
                               the same governed projection the schedule and roster surfaces
                               use — and a miss omits the row rather than fabricating one.
Fixture changes:               none.

CARRY-OVER DEFECT FIXED (the F-06 verifier's High finding against this file):
                               The nine per-dimension rating labels (span[data-rating-level])
                               rendered text-brand-600 — ONE brand pink for all four states —
                               measuring 3.53:1 on white in the rendered production DOM and
                               FAILING WCAG 2.2 AA SC 1.4.3.
                               FIX: each label now carries the ordinal-keyed rating-N-on-soft
                               foreground on the matching rating-N-soft fill — the F1 foundation
                               pairs deepened specifically to clear 4.5:1. No token VALUE was
                               changed; the labels were moved onto the pairs that already
                               existed for exactly this purpose.
                               RE-MEASURED, ALL FOUR STATES, in the rendered DOM of a
                               next build + next start production server:
                                 Beginning  5.466:1
                                 Developing 5.134:1
                                 Mastering  5.311:1
                                 Mastered   5.733:1
                               The measurement is now a PERMANENT assertion in
                               tests/frontend/trainer-browser-smoke.mjs that requires all four
                               states to be PRESENT on the surface and each to clear 4.5:1 — a
                               fix proved only on the states that happen to be on screen is not
                               proved. Colour is never the only carrier: every tile states its
                               level in text.

Backend dependencies discovered (RECORDED, NEVER INVENTED — four):
                               1. A class-video-evidence READ path and a RATIFIED UPLOADER.
                                  Evidence scope AND uploader are UNRESOLVED (Amendment 002
                                  A-014), PhysicalTestPort exposes no evidence read or upload
                                  method, and "Evidence Pending" is deliberately not a stored
                                  status (A-036). No uploader was invented and no TA permission
                                  was silently transferred.
                               2. A lesson number / lesson title field (frame: "Lesson 4 ·
                                  Expressive Delivery").
                               3. A term field (frame: "Term 1 · 2026").
                               4. A governed OVERALL or roll-up competency grade (frame:
                                  "Overall Grade: Mastering").

Vocabulary dependencies:       DISCHARGED at F-06 and verified live on this branch before any
                               code was written (commit 5dcbeeb). The nine snapshots render
                               Beginning / Developing / Mastering / Mastered from the single
                               shared RATING_DISPLAY_LABELS table with storage values
                               beginning / developing / mastering / mastered, each carried on
                               data-rating-level. No anchor was reworded. No enum label was
                               renamed. NO global keyword replacement was performed over
                               advanced, secure, emerging, beginning, mastering or mastered
                               (A-054). The Class Grade rendered in the breadcrumb, the report
                               subtitle and the Report Details Class row is a DIFFERENT,
                               UNCHANGED vocabulary and marks itself data-vocabulary="class-grade"
                               so a rating-token guard classifies it by ACTUAL CONTEXT.

FRAME-VERSUS-GOVERNANCE DEVIATIONS (recorded, never resolved locally — eight):
  D1 "Official report" (report-card subtitle). At /review the version on screen is the TRAINER
     WORKING version. Only management's Approve & Submit makes a version canonical and
     parent-visible (A-033), so the frame's claim is a FALSE LIFECYCLE CLAIM. The subtitle names
     the governed state instead ("Trainer working version"); the browser suite asserts the
     string "Official report" never renders on this surface.
  D2 PANEL HEADINGS — "Overview / Strengths / Areas for Development / Remarks". THIS ONE IS AN
     OPERATOR ADJUDICATION, NOT A RESOLVED ITEM. The governed four parent-facing panels are
     Today's Strength / Next Focus / Practice Suggestion / Session Takeaway (spec §8;
     REPORT_PANEL_CONFIG; ReportPanelsDto). The frame's headings are NOT a rename of those four:
     "Overview" and "Remarks" have no governed counterpart, and inventing a mapping would
     silently redefine what each STORED field means to a parent — a spec-level change, not a
     label change. The frame's four-section composition, iconography, bullet treatment and order
     ARE reproduced; the GOVERNED labels are kept, and the suite asserts the four governed keys
     render in order. If the operator rules the frame's headings authoritative, that requires its
     own authorization at spec §8 / CLAUDE.md §6 level.
  D3 "CLASS VIDEO EVIDENCE" with a player and "Junior · Public Speaking · Recorded 14 Mar 2035 ·
     3:24 · MP4". Dependency 1 above. The region is KEPT with the frame's label and rendered
     INERT: a disabled control with a programmatically associated, visible reason, no anchor, no
     <video>, no <iframe>, and NO fabricated duration, format or recording date. This is the
     F-04 D1 / F-11 "Send Reminder to Trainer" treatment. Asserted in the browser suite.
  D4 Report Details rows "Lesson" and "Term". Dependencies 2 and 3. OMITTED rather than
     fabricated, and the omission is STATED ON SCREEN rather than left as a silent gap.
  D5 Report Details row "Overall Grade: Mastering". Dependency 4. A single headline rating would
     be a DERIVED ASSESSMENT FACT this frontend computed — exactly the class of claim
     A-034/A-035 reserve to the governed assessment. OMITTED; the nine governed snapshots are
     shown instead. The suite asserts no such row exists.
  D6 "PERFORMANCE SUMMARY" draws FOUR tiles (Speech, Tonality, Eye Contact, Audience Awareness).
     No governed rule selects four of the nine, and all nine are mandatory (A-017), so the
     frame's tile composition is reproduced across ALL NINE governed snapshots rather than an
     invented subset.
  D7 The frame shows ONLY the approved end state — no Quality Checklist, no Approve control, no
     returned-correction state, no internal Coach Notes. Those are governed functionality
     screen.md §6 requires PRESERVED, so they are built and render for the states in which they
     apply. "Report sent to management for approval" is the trainer_approved state and is
     CORRECT AND EXPECTED.
  D8 The frame's left rail (Dashboard / My Classes / Students / Reports / Schedule, Reports
     highlighted) is components/layout/portal-shell.tsx, OUTSIDE this checkpoint's owned paths —
     the same adjudication F-05 recorded as its D7. The relationship is carried by the breadcrumb
     and the Back control the frame also draws.

OPEN ROUTE DECISION OD-3 — RECORDED ONLY, NOT RESOLVED:
                               Whether /trainer/reports/[reportId]/edit becomes a canonical
                               sub-route of screen ID 10 or receives its own inventory ID once a
                               frame exists is recorded at
                               docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md §7.4 as an
                               operator decision. The route treatment lands at F-16. Nothing in
                               this checkpoint creates, moves, renames, aliases or redirects a
                               route, and no presentation choice was made that would imply an
                               answer.

/edit sub-surface treatment:   RESTYLED, NOT RECONSTRUCTED, and DELIBERATELY NOT PROPOSED
                               ACCEPTED. reference.png covers node 664:9 — the review surface
                               only. Rather than invent a frame (GLOBAL_UI_RULES §8
                               stop-and-ask), the editor was converged onto the SHARED F1
                               foundation its sibling already uses, with NO behaviour, field,
                               label or governed call changed. It also retired this file's last
                               uses of the legacy navy-* aliases and the bg-warning-800 /
                               hover:bg-amber-900 pairing.

Governance blockers:           none. The four dependencies are recorded for the operator, not
                               blocking. OD-3 stays open by instruction. D2 is an adjudication
                               request, not a blocker.

Browser viewport:              1440 x 1351 (the reference viewport) for all five diagnostic
                               renders; browser smoke suites at their own recorded viewports
                               against a production build.
Before screenshot:             not captured — no implementation-before.png was recorded for this
                               screen in any prior checkpoint, and the prior presentation is
                               fully recoverable from commit 7d3f1bab.
After screenshot:              five diagnostic renders at 1440 x 1351, OUTSIDE Git, at
                               UI_REFERENCE_FINAL_MVP/_checkpoint-evidence/F-09/ —
                                 screen-10-review-draft-ready.png
                                 screen-10-review-trainer-approved.png   (the state the frame draws)
                                 screen-10-review-returned.png
                                 screen-10-edit-wording.png
                                 screen-10-edit-correction.png
                               Synthetic fixture data only; no real name, email, phone, address,
                               secret, token, key or credential appears in any of them.

Validation:                    reference.png SHA-256 verified before and after — unchanged;
                               npx tsc --noEmit exit 0; npx eslint . exit 0; npm run build exit
                               0 with ROUTE CENSUS UNCHANGED AT 17 application routes plus
                               /_not-found (none added, removed or renamed); compiled
                               fixture-contract.assertions.ts, fixture-lifecycle.assertions.ts,
                               design-foundation.assertions.ts and
                               auth-reference-fidelity.assertions.ts exit 0 each;
                               trainer-browser-smoke.mjs exit 0 (11 check groups, including the
                               new screen 10 group); three-role-browser-smoke.mjs exit 0;
                               authentication-browser-smoke.mjs exit 0; git diff --check exit 0.
                               ALL THREE BROWSER SUITES RAN AGAINST A PRODUCTION BUILD
                               (next build + next start on port 3411), never a cold dev server.
                               ZERO uncaught browser-console/runtime errors throughout. No
                               dependency, no test runner, no package.json or package-lock.json
                               change (R-B7); npm audit fix was not run. governance-source/ was
                               NOT read (A-055). The frozen demo at "SDS Project Sprint 2" was
                               not touched.

Ending commit:                 8795496
                               "feat(frontend): reconstruct trainer student report"
Acceptance status:             PROPOSED VISUALLY ACCEPTED for screen 10 (/review). The /edit
                               sub-surface is NOT proposed accepted. Only the operator marks a
                               screen accepted.

Recorded, not fixed (outside this screen's owned paths):
                               components/layout/portal-shell.tsx nav/subtitle contrast
                               2.225:1–3.079:1; components/brand/brand-mark.tsx:86 hardcoded
                               href="/trainer" in the Parent and Management shells; no
                               skip-to-content bypass link; features/trainer/trainer-dashboard.tsx:72
                               bg-warning-800 (an UNDEFINED token); app/globals.css still declares
                               *, body, h1–h4, .card, .panel and .form-field UNLAYERED — worked
                               around here, as at F-05 and F-07, by carrying heading colour on an
                               inner <span> the unlayered selector does not match; brand-700
                               white-on-pink primary actions at 4.517:1.
```
