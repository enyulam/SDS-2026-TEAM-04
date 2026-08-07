# 32 - Parent Reports - implementation notes

**Append-only.** Add a new entry at the bottom for every implementation checkpoint touching this screen. Never edit or delete an existing entry - a superseded entry is corrected by a later entry that says so.

---

## Entry template - copy below the last entry

```
Timestamp (Asia/Singapore):
Source branch:
Starting commit:
Screen ID:                     32
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
Screen ID:                     32
Checkpoint:                    F-01a — bounded WCAG 2.2 AA accessibility correction.
                               NOT a screen reconstruction. This screen's visual acceptance
                               status is unchanged and remains Not started.
Existing route audited:        /parent/reports
Components preserved:          all — no component was replaced, created, moved or restructured
Components replaced:           none
Components created:            none
DTO and port changes:          none
Fixture changes:               none
Backend dependencies discovered: none new
Vocabulary dependencies:       none. No rating label, Class Grade label or copy string was touched.
                               Amendment 006 V3 remains pending and unauthorized.
Governance blockers:           none
Change made on this screen:    features/parent/parent-reports-list.tsx:82
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
Screen ID:                     32
Checkpoint:                    F-01b — bounded correction of the High finding the independent
                               verifier raised against F-01a. NOT a screen reconstruction.
                               This screen's visual acceptance status is UNCHANGED.
Existing route audited:        /parent/reports
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
                               No other control on this surface changed. No per-dimension rating grid
                               exists or was created on any parent surface.
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
Starting commit:               77abff4e1c5dc59381a8c2b81fbbe6ee932408de
Screen ID:                     32
Checkpoint:                    F-14 (FRONTEND RECONSTRUCTION F14) — screen 32 Parent Reports
                               list, node 533:180, route /parent/reports, physical-test flow
                               order 11. A full visual reconstruction. Screen 32 is PROPOSED
                               visually accepted; only the operator marks a screen accepted.
Reference integrity:           32-parent-reports/reference.png SHA-256
                               90e368c17826bb114173ec5f40f9421eaa33d81aa2032bd0e8a97db01e370aea
                               verified BEFORE any work began and UNCHANGED AFTER — 1440 x 1120,
                               73,658 bytes, byte-identical to FRONTEND_RECONSTRUCTION_PLAN.md
                               section 5.
Existing route audited:        /parent/reports — canonical, already satisfied, no route mismatch.
                               No route was created, moved, renamed, redirected or deleted.
Components preserved:          the canonical route; the governed R-9 projection
                               port.listParentSubmittedReports(); the live-link reachability
                               check; the /parent/students/[studentId]/sessions/[sessionId]/report
                               destination; every resource state (loading / ready / failed);
                               the ?preview=empty diagnostic; data-testid="parent-report-list".
Components replaced:           the page presentation. The provisional "Parent / reports —
                               Available reports" eyebrow-and-heading block and the card-per-row
                               list were replaced by the frame's structure: page title "Reports"
                               with its subtitle, a top-right "Viewing <learner>" affordance, an
                               "All Reports" section heading, and rows composed as tinted
                               document tile + title + meta line + right-aligned primary "View".
                               The legacy navy-* / text-2xl / text-sm utilities on this screen
                               were converted to the F1 token scale (text-card-title,
                               text-section-title, text-body, text-small, text-ink-strong,
                               text-ink, rounded-field, rounded-card, shadow-raised).
Components created:            none outside the owned file. IconTile + Icon("document") and
                               PageHeading are reused from the F1 primitives; no icon,
                               illustration or asset was re-drawn ad hoc.
DTO and port changes:          NONE. No contract, port method, permission or route was added,
                               widened or changed.
Fixture changes:               NONE.

*** FRAME-VERSUS-GOVERNANCE DEVIATION D1 — THE PRIMARY DELIVERABLE OF THIS CHECKPOINT ***

  The frozen reference draws an AGGREGATE RATING CHIP on every report row — "Mastering",
  "Developing", tinted teal and amber, sitting immediately beside each row title. It is
  DELIBERATELY NOT IMPLEMENTED, under operator ruling R-B6 and the ratified rules it restates:
  CLAUDE.md section 6 (no per-dimension rating grid on a parent surface, IN ANY FORM OR
  WORDING — a caught leak, and a softened restatement recreates it), Amendment 002 A-021
  (parent = view only, submitted-canonical), Amendment 004 A-038, Amendment 005 A-048, this
  screen's own screen.md section 6 "Prohibited invention" and section 8, and GLOBAL_UI_RULES
  section 5.

  An aggregate chip is not a softer form of a rating grid; it is a rating disclosure with
  fewer digits. It states assessment substance the Parent boundary does not carry, and on a
  four-value ordinal scale it also narrows the underlying per-dimension grid. A Parent
  receives the SUBMITTED CANONICAL NARRATIVE ONLY.

  The reference was therefore used for SHELL, SPACING, TYPOGRAPHY and LAYOUT, and for nothing
  else. Figma never bypasses governance: the rule wins, and the divergence is recorded here,
  never silently resolved (A-045, GLOBAL_UI_RULES section 1.3). The STOP CONDITION for this
  checkpoint — "an aggregate rating chip would be implemented -> BLOCKED" — was evaluated
  explicitly and DID NOT FIRE, because no such chip was implemented.

Frame-versus-governance
deviations D2 - D5:            D2 The frame's row title is a lesson/topic name ("Expressive
                               Delivery", "Voice and Projection") and its meta line carries
                               class grade, class module, lesson number and trainer name
                               ("Junior / Speech and Drama / Lesson 4 / Esteban Perez"). The
                               governed ParentReportListItemDto carries NONE of those fields.
                               They are OMITTED rather than fabricated (GLOBAL_UI_RULES
                               section 10) and recorded as dependency BD-1 below. The row is
                               titled with the governed student name and its meta line carries
                               the two governed dates.
                               D3 The frame places the child affordance and the identity strip
                               in the page header rail. components/layout/portal-shell.tsx owns
                               that strip and is OUTSIDE this checkpoint's owned paths, so it
                               was not touched; the "Viewing <learner>" affordance is rendered
                               at the top right of the page content instead. Same information,
                               same reading order, different owner.
                               D4 The frame's left rail carries Overview / Calendar / Reports
                               and a Logout row. The rail is portal-shell.tsx (not owned,
                               untouched); its remaining items depend on deferred post-48-hour
                               screens (A-044).
                               D5 The page subtitle is rendered locally rather than through
                               PageHeading's description prop, which resolves to text-ink-muted
                               (#8a93a8) and fails the 4.5:1 AA floor on this canvas. The shared
                               primitive is outside the owned paths, was left untouched, and the
                               failure stays recorded for a separate foundation authorization —
                               the same trade F11 recorded.
Backend dependencies discovered:
                               BD-1 (new, recorded not invented) — the governed Parent
                               submitted-report projection carries no report/lesson title, class
                               grade, class module or trainer name. The frame shows all four.
                               Nothing was faked client-side, stubbed as if real, or inferred
                               from the frame.
                               BD-2 (pre-existing) — the fixture links exactly one child, so the
                               multi-child branch of the "Viewing" affordance is built and
                               type-checked but not exercised by fixture data. Producing a second
                               linked child is fixture/adapter work at F16; the fixture is
                               outside the owned paths and was not touched.
Vocabulary dependencies:       NONE. Screen 32 is NOT rating-bearing (screen.md section 8), so
                               F-14 carries no F6 / Amendment 006 V3 dependency. No rating label
                               is rendered — that is the whole point of D1. The frontend rating
                               union in lib/frontend/contracts/physical-test.ts still declares
                               the superseded emerging/developing/secure/advanced and was NOT
                               touched: that is the correct pre-V3 state and belongs to F6.
                               Class Grade (Beginner/Intermediate/Advanced) is untouched and NO
                               keyword replacement over advanced/secure/emerging/beginning/
                               mastering/mastered was performed anywhere (A-054).
Governance blockers:           none. The stop condition did not fire.

Negative assertion — required, load-bearing privacy evidence:

                               tests/frontend/three-role-browser-smoke.mjs now carries
                               assertNoRatingTokenRendered(), run at FOUR parent surfaces: the
                               screen 32 list before any submission, the Parent home surface, the
                               screen 32 list AFTER a real end-to-end Management submission (the
                               exact state the frame draws its chip in), and the screen 33
                               canonical report detail.

                               It proves NO competency-rating token renders on any parent
                               surface, in EITHER vocabulary — the four ratified A-049 labels
                               (beginning / developing / mastering / mastered) and the four
                               superseded labels the frontend still declares (emerging /
                               developing / secure / advanced).

                               It is deliberately NOT a bare-word prose regex. Amendment 006
                               A-052 expressly PROHIBITS a bare-word rating-label regex because
                               it would reject valid parent-facing English. What is detected is
                               exactly the form A-052 authorises: an ISOLATED raw label presented
                               as a rendered value — any LEAF element whose entire text is one
                               token, plus any element carrying a rating-bearing data attribute.
                               Class Grade is a different vocabulary (A-054); an element that
                               legitimately renders one must mark itself
                               data-vocabulary="class-grade" and is skipped. Occurrences are
                               classified by actual context, never by keyword.

                               THE ASSERTION IS PROVEN FALSIFIABLE, not merely green. In the
                               evidence run the reference's own aggregate chip was injected into
                               the live production DOM and the identical guard DETECTED it
                               (span="mastering"). Two further probes confirm it is correctly
                               scoped: legal prose ("at the beginning of the session ... has
                               mastered maintaining eye contact ... is mastering sentence flow")
                               is NOT flagged, and a context-marked Class Grade "Advanced" is NOT
                               flagged. Results in _checkpoint-evidence/F-14/f14-evidence.json.
Accessibility:                 semantic landmarks preserved; the list is a section labelled by
                               its "All Reports" heading; row titles are h2 under the page h1 so
                               the outline does not skip; the child affordance is a real select
                               with a programmatically associated label (and a plain labelled
                               text pair when only one child is linked, so no label ever points
                               at a non-labelable element); each "View" action carries an sr-only
                               student-and-date suffix so its accessible name is unique; the
                               primary action keeps a 44 px minimum target; the empty state keeps
                               role="status". Contrast was MEASURED from live computed styles in
                               the production build across the 8 text nodes of the owned surface:
                               8/8 pass, 0 failures, 0 exemptions claimed. No horizontal page
                               scroll at 1440, 1024 or 480 px (measured true at all three).
Browser viewport:              1440 x 1120 (the frozen reference's native dimensions), plus
                               1024 x 900 and 480 x 900
Before screenshot:             not captured — the pre-existing surface is described above and its
                               provisional presentation predates any frozen reference
After screenshot:              diagnostic renders written OUTSIDE Git to
                               UI_REFERENCE_FINAL_MVP/_checkpoint-evidence/F-14/ —
                               screen-32-parent-reports-1440x1120.png,
                               screen-32-parent-reports-empty-1440x1120.png,
                               screen-32-parent-reports-1024x900.png,
                               screen-32-parent-reports-480x900.png, plus f14-evidence.json.
                               Synthetic fixture data only.
Validation:                    reference.png SHA-256 verified before and after — unchanged;
                               npx tsc --noEmit exit 0; npx eslint . exit 0; npm run build exit 0
                               with the ROUTE CENSUS UNCHANGED at 16 application routes plus
                               /_not-found — none added, removed or renamed;
                               node tests/frontend/trainer-browser-smoke.mjs exit 0;
                               node tests/frontend/three-role-browser-smoke.mjs exit 0 (now 10
                               check groups, including the R-B6 rating-token check);
                               node tests/frontend/authentication-browser-smoke.mjs exit 0;
                               git diff --check exit 0. ZERO uncaught browser-console/runtime
                               errors in every browser run. No dependency, test runner,
                               package.json or package-lock.json change of any kind (R-B7).
Ending commit:                 the commit created by
                               "feat(frontend): reconstruct parent reports list"
Acceptance status:             PROPOSED visually accepted — awaiting operator review.
                               Only the operator marks a screen accepted.
```
