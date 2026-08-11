# 19 - Management Student Report - implementation notes

**Append-only.** Add a new entry at the bottom for every implementation checkpoint touching this screen. Never edit or delete an existing entry - a superseded entry is corrected by a later entry that says so.

---

## Entry template - copy below the last entry

```
Timestamp (Asia/Singapore):
Source branch:
Starting commit:
Screen ID:                     19
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
Screen ID:                     19
Checkpoint:                    F-01a — bounded WCAG 2.2 AA accessibility correction.
                               NOT a screen reconstruction. This screen's visual acceptance
                               status is unchanged and remains Not started.
Existing route audited:        /management/reports/[reportId]/review and /management/reports/[reportId]/edit
Components preserved:          all — no component was replaced, created, moved or restructured
Components replaced:           none
Components created:            none
DTO and port changes:          none
Fixture changes:               none
Backend dependencies discovered: none new
Vocabulary dependencies:       none. No rating label, Class Grade label or copy string was touched.
                               Amendment 006 V3 remains pending and unauthorized.
Governance blockers:           none
Change made on this screen:    features/management/management-report-review.tsx:137 and features/management/management-wording-editor.tsx:94
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
Screen ID:                     19
Checkpoint:                    F-01b — bounded correction of the High finding the independent
                               verifier raised against F-01a. NOT a screen reconstruction.
                               This screen's visual acceptance status is UNCHANGED.
Existing route audited:        /management/reports/[reportId]/review
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
Measured on this screen:       PRIMARY NAMED SURFACE. "Approve & Submit", enabled:
                               #1b2b4b on #d6357a = 3.113:1 at 14px/400 BEFORE ->
                               #ffffff on #d6357a = 4.517:1 at 14px/700 AFTER. Passes.
                               "Return assessment concern" took font-bold, colour unchanged.
                               On the wording editor (blocked design family 3, no own folder), the
                               disabled "Save wording changes" took its inert treatment at 2.004:1 —
                               SC 1.4.3 exempt. Management DTO exclusions are untouched; no rating,
                               note, checklist value or content hash was rendered or added.
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
Starting commit:               879549692bb592fc14f2de538975fd4b7a84525d
Screen ID:                     19
Checkpoint:                    F-12 — FRONTEND RECONSTRUCTION F12, the visual reconstruction of
                               this screen, executed under OPERATOR RULING R-B5.
Existing route audited:        Yes — /management/reports/[reportId]/review (pinned; the surface
                               this frame covers) and /management/reports/[reportId]/edit (the
                               governed wording-only sub-surface; NO frame covers it). The
                               canonical route /management/students/[studentId]/reports/[reportId]
                               stays UNEXECUTED — no route was created, moved, renamed, aliased
                               or redirected at this checkpoint.
Components preserved:          Every shared primitive — Avatar, Button, FeedbackBanner, Icon,
                               IconTile, LoadingSkeleton, StatePanel, StatusPill,
                               REPORT_PANEL_CONFIG, resource-state, the fixture runtime. None was
                               replaced, created, moved or restructured; none is an owned path.
Components replaced:           none
Components created:            none (two local presentation helpers inside the owned file —
                               PANEL_PRESENTATION and DetailRow — both mirroring what screen 10
                               already uses, so the two report surfaces stay one visual system)
DTO and port changes:          NONE. lib/frontend/contracts/, lib/frontend/fixtures/ and
                               lib/frontend/physical-test-port.ts are BYTE-UNCHANGED. No field,
                               method, permission or status was added.
Fixture changes:               none
Backend dependencies discovered: THREE, recorded and NOT invented — (1) a lesson number / lesson
                               title field, (2) a term field, (3) class-module identity on the
                               governed Management review projection. All three are drawn in the
                               frame; none exists on any governed Management DTO.
                               DELIBERATELY NOT RECORDED AS DEPENDENCIES: a governed overall
                               competency grade, and a Management-readable per-dimension rating
                               grid. Those are PROHIBITED, not missing. Filing a governance
                               boundary as a backlog gap would invite someone to "deliver" it.
Vocabulary dependencies:       none. The ratified Amendment 006 A-049 vocabulary was already live
                               on this branch (F-06, 5dcbeeb) and was verified before any code was
                               written. THIS SCREEN RENDERS NO COMPETENCY-RATING LABEL AT ALL, in
                               either the ratified or the superseded vocabulary — that is the
                               point of omission P2 below — and the browser suite now proves it
                               structurally. No anchor was reworded, no enum label renamed, and NO
                               global keyword replacement was performed over advanced, secure,
                               emerging, beginning, mastering or mastered (A-054). Class Grade is
                               a different, unchanged vocabulary and is not rendered here at all.
Governance blockers:           none. The checkpoint did not stop: R-B5 told the implementer what
                               to omit, and every omission below is a rule being applied, not a
                               requirement being guessed at.

OPERATOR RULING R-B5 — GOVERNANCE OVERRODE THE FROZEN SCREENSHOT. This is the required
deliverable of this checkpoint and is the reason screen 19 can only be proposed accepted for its
SHELL, SPACING, TYPOGRAPHY and the ALLOWED PARENT-FACING WORDING PANELS. Reference 19 draws
multiple elements that a ratified rule forbids on a Management surface. Figma never bypasses
governance (A-045; GLOBAL_UI_RULES §1.3): the RULE WINS, the prohibited thing is OMITTED, and the
divergence is RECORDED here, in the component header and in the workstream log — never silently
resolved. SIX OMISSIONS:

  P1  "Report for: Parent / Management" audience toggle. There is no `kind` enum and no
      `audience` column on a report version. Canonicity comes from the aggregate's pointer and
      audience comes from AUTHORIZATION, never from an attribute on the row (A-038). A toggle
      would assert a per-audience artefact this system deliberately does not have, and would
      imply Management can preview a second, differently-scoped rendering of one report.
      OMITTED.
  P2  "PERFORMANCE SUMMARY" — the raw per-dimension rating grid (the frame shows SPEECH
      MASTERING, TONALITY MASTERED, EYE CONTACT BEGINNING, AUDIENCE AWARENESS DEVELOPING).
      ~~Management never reads raw per-dimension ratings (A-038).~~
      ✅ SUPERSEDED 2026-08-11 BY OPERATOR RULINGS D-1 / C-10 (corrected under C-18).
      ⚠️ THIS IS THE ONE PACK IN THE ESTATE WHERE THE PROHIBITION GENUINELY LIFTED.
      D-1 permits Management to VIEW the nine per-dimension ratings, READ ONLY; C-9 confines
      that to REPORT DETAIL SURFACES, and screen 19 IS one; C-10 then ruled ALL NINE rather
      than the frame's four, because rendering four is a selection of assessment substance
      with no ratified basis.
      ⛔ ITS ABSENCE IS THEREFORE NO LONGER "A PERMANENT STRUCTURAL ASSERTION" — it is now a
      PENDING IMPLEMENTATION. The build is plan phase P1-1b, NOT YET AUTHORIZED. Until that
      authorization, nothing renders here and the structural assertions stay in place.
      ⛔ MANAGEMENT MAY VIEW, NEVER EDIT — an assessment-level disagreement is a RETURN TO THE
      TRAINER. Q-27 is untouched and the Parent boundary does not move.
  P3  Report Details row "Overall Grade: Mastering". No governed overall or roll-up competency
      grade exists. Computing one here would manufacture a DERIVED ASSESSMENT FACT this frontend
      invented — the class of claim A-034/A-035 reserve to the governed assessment — while also
      disclosing the rating substance P2 forbids. OMITTED on both grounds.
  P4  Trainer observations, Trainer notes, and every assessment-editing control. Management never
      modifies a rating, observation, attendance record, evidence item, Trainer note or any
      underlying assessment fact (A-034). A rating / observation / assessment-fact issue is
      ALWAYS a RETURN and NEVER a Management edit — that path is built as "Return assessment
      concern". OMITTED.
  P5  "Class Video Evidence", its player and its recording metadata; and attendance substance.
      Evidence scope and the uploading role are UNRESOLVED (A-014) and no governed evidence read
      path exists — but even if one did, evidence and attendance substance sit outside
      Management's read (A-038). NOTE THE DIFFERENCE FROM F-09: screen 10 KEEPS this region and
      renders it INERT with a visible reason, because there the affordance is merely UNBACKED.
      Here it is OMITTED OUTRIGHT, because inert-with-a-reason is the treatment for an unbacked
      affordance, not for a PROHIBITED one — an inert "Class Video Evidence" panel on a
      Management surface would still assert that Management is a legitimate audience for it.
  P6  "Save as draft". No governed Management draft state exists: the eight authorized
      report_status values contain none (A-036), and the only Management write to content is the
      bounded wording save on the /edit sub-surface. A control implying a private Management
      draft would encode UI presence as a lifecycle fact. OMITTED.

WHAT WAS TAKEN FROM THE FRAME, therefore: the page shell and its "Student Report" title, the
breadcrumb and the pink "Back" pill; the white class-report card with its square learner avatar,
pink "Class Report — <learner>" title and subtitle line; the four icon-led, bullet-led content
sections in the frame's composition, spacing and order; the right rail's "Report Details" card;
and the dark "Ready to approve?" action panel. Nothing else.

THE REQUIRED NEGATIVE ASSERTION. tests/frontend/three-role-browser-smoke.mjs now carries
assertManagementSurfaceClean(), run against FIVE Management surface states in the rendered
PRODUCTION DOM — screen 19 at rest, screen 19 after a correction and reapproval, the wording
editor, and both screen-29 queue projections. It asserts, structurally:
  - ZERO raw competency-rating tokens, under BOTH vocabularies (the ratified four plus the three
    superseded, kept as a regression guard so the check cannot silently pass against labels that
    no longer exist);
  - ZERO elements carrying data-rating, data-rating-level or data-evidence-state;
  - ZERO video / iframe / audio / source / track elements;
  - ZERO leaf elements whose ENTIRE text is one of the nine governed dimension display names —
    the grid-cell form P2 would take;
  - the absence of the prohibited labels themselves: Performance Summary, Overall Grade, Class
    Video Evidence, Report for, Save as draft, Trainer note, Coach Notes, Quality Checklist,
    Attendance, content hash, AI draft, AI history, audit, revision;
  - EXACTLY FOUR [data-report-panel] elements on screen 19, and EXACTLY FOUR form controls of any
    kind in the wording editor — the wording-only boundary proved by counting.
The rating check is deliberately NOT a bare-word prose regex. A-052 prohibits one, and the four
parent-facing panels are precisely the prose Management is SUPPOSED to read: "at the beginning of
the session" and "has mastered maintaining eye contact" are legal parent-facing English. What is
detected is the form A-052 authorises — an isolated raw label presented as a rendered value.
The assertion is called with the return dialog CLOSED, because that dialog legitimately renders
the nine dimension names as <option>s: naming the affected dimension is part of the governed
return-to-trainer input. Reading a rating is prohibited; naming the dimension a concern is about
is required. That distinction is recorded in the test file itself.

ONE ON-SCREEN SENTENCE WAS WEAKENED ON PURPOSE. The rail first explained the omission by naming
it — "A single overall grade is deliberately not shown…". That tripped the new assertion, which
forbids the phrase "Overall Grade" anywhere on a Management surface. THE ASSERTION WAS KEPT AND
THE PROSE WAS REWORDED: an explanatory sentence is not worth weakening the check that proves the
leak stayed closed. The rail now reads "Nothing beyond the four parent-facing panels forms part of
this review", and the full reason lives here, in the component header and in the workstream log.

THE CONTENT HASH IS NEVER RENDERED (A-038). It covers the four panels PLUS the nine ratings, and a
reader holding the panels and that hash recovers the exact per-dimension grid in 4^9 = 262,144
trials. This screen holds only wordingHash — the SEPARATE, domain-separated proof over the four
parent-facing panels alone — and even that is carried to the server as a concurrency proof and is
NOT displayed.

THE THREE GOVERNED MANAGEMENT POWERS, BUILT EXACTLY AND NO WIDER (A-034, A-038):
  1. WORDING ONLY. The four parent-facing panels are the entire editable set, on /edit. Every
     accepted change creates a NEW IMMUTABLE VERSION (A-037); a wording-only edit requires no
     Trainer reapproval.
  2. RETURN. A rating, observation or derived-assessment-fact concern with an EXACT reason. The
     dialog says in terms that grammar, clarity, tone and presentation belong in the wording
     editor, so the two paths cannot be confused.
  3. APPROVE & SUBMIT. The one user action performing two transitions in one transaction,
     trainer_approved -> approved -> submitted, carrying expectedLockVersion, expectedVersionId
     and expectedWordingHash. Its confirmation reads EXACTLY the ratified sentence — "Approve and
     submit <learner>'s report?" / "This will publish the final report, notify the linked parent,
     and update the student record." NO dedicated mockup exists and NONE WAS INVENTED beyond that
     description; both strings are pinned by the browser suite. The rail states plainly that the
     server independently re-verifies authorization, the Trainer approval behind this exact
     version and the wording proof — nothing implies the UI is the gate.

LEARNER IDENTITY CAME FROM A GOVERNED PROJECTION OR NOT AT ALL. ManagementReviewDto carries no
student name and no session date, yet the ratified confirmation names the learner. Rather than
invent a field, both are narrowed out of the SAME listManagementPendingReviews() projection that
screen 29 already reads; a miss omits the row and falls back to "this learner" rather than
fabricating one. This is the F-09 listTrainerSessions() pattern, unchanged.

SIX FURTHER FRAME-VERSUS-GOVERNANCE DIVERGENCES, recorded and not resolved locally:
  D1  Panel headings "Overview / Strengths / Areas to Grow / Remarks". The governed four are
      Today's Strength / Next Focus / Practice Suggestion / Session Takeaway (spec §8). The
      frame's headings are NOT a rename of those four — "Overview" and "Remarks" have no governed
      counterpart — and adopting them would silently redefine what each STORED field means to a
      parent. The frame's four-section composition, iconography, bullet treatment and order are
      reproduced; the governed labels are kept. THIS IS THE IDENTICAL ADJUDICATION F-09 RAISED AS
      ITS D2, still unanswered, and it is RE-RAISED rather than assumed settled.
  D2  Subtitle "Public Speaking · Term 1, 2035 · Management copy". "Management copy" is the same
      per-audience artefact claim as P1 and is replaced by the governed lifecycle state
      ("Final-review candidate · awaiting your decision"). Class module, lesson and term are
      carried by no governed Management projection and are omitted rather than fabricated.
  D3  The frame's four section glyphs (alert circle, star, arrow, heart) are not in the approved
      asset set. Approved icons are reused rather than re-drawing an icon ad hoc
      (GLOBAL_UI_RULES §8), matching the mapping screen 10 already uses.
  D4  The frame's per-section pencil is honoured as a link to the governed wording-only editor.
      It edits nothing in place.
  D5  The left rail is components/layout/portal-shell.tsx, OUTSIDE this checkpoint's owned paths —
      the same adjudication F-05, F-09 and F-11 recorded. The relationship is carried by the
      breadcrumb and the Back control the frame also draws.
  D6  The approve-panel copy "This makes the report no longer editable, and sends notification to
      the parents" is replaced by the ratified description (A-033).

THE /edit WORDING-ONLY SUB-SURFACE WAS RESTYLED, NOT RECONSTRUCTED, AND IS DELIBERATELY NOT
PROPOSED ACCEPTED. reference.png covers node 648:330 — the review surface only. /edit is one of
the eight families the Figma matrix §0.1 records as "Blocked — new design required", so rather
than fabricate a mockup (GLOBAL_UI_RULES §8 stop-and-ask) it was converged onto the shared F1
foundation its sibling now uses — tokens, card surfaces, field treatment, button primitives —
with NO behaviour, field, label, validation rule or governed call changed. It also retired this
file's last uses of the legacy navy-* aliases and the pre-foundation type scale.

Browser viewport:              1440 x 1330 (the reference viewport, for the diagnostic renders);
                               the browser smoke suites at their own recorded viewports
Before screenshot:             not captured — this checkpoint replaced the surface wholesale and
                               the prior implementation is recoverable at commit 8795496. The
                               governed behaviour that existed before is preserved and is proved
                               by the three-role suite, which exercises the full two-stage
                               workflow end to end.
After screenshot:              four diagnostic renders at 1440 x 1330, OUTSIDE Git, at
                               UI_REFERENCE_FINAL_MVP/_checkpoint-evidence/F-12/ —
                               19-management-student-report-review.png (the surface at rest),
                               19-approve-and-submit-confirmation.png (the ratified confirmation),
                               19-return-assessment-concern.png (the bounded return dialog with
                               the rating scope selected), 19-wording-only-editor.png.
                               Synthetic fixture data only.
Validation:                    reference.png SHA-256 verified BEFORE and AFTER — unchanged
                               (394d8475498602aee27675d8437ee9395316c45da986b5a8f4db46a9ef94e6f0);
                               tsc --noEmit exit 0; eslint . exit 0; npm run build exit 0 with the
                               ROUTE CENSUS UNCHANGED AT 17 application routes plus /_not-found;
                               three-role-browser-smoke.mjs exit 0 (13 check groups, three of them
                               new for screen 19); trainer-browser-smoke.mjs exit 0;
                               authentication-browser-smoke.mjs exit 0; compiled
                               fixture-contract, fixture-lifecycle, design-foundation and
                               auth-reference-fidelity assertions exit 0 each; git diff --check
                               exit 0. ALL THREE BROWSER SUITES RAN AGAINST A PRODUCTION BUILD
                               (next build + next start on port 3412), never a cold dev server,
                               and the server was restarted onto the final build before the final
                               run. ZERO uncaught browser-console/runtime errors throughout. No
                               dependency, no test runner, no package.json or package-lock.json
                               change (R-B7); npm audit fix was not run; governance-source/ was
                               not read (A-055); the frozen demo at "SDS Project Sprint 2" was not
                               touched.
Ending commit:                 the commit created by
                               "feat(frontend): reconstruct management student report"
Acceptance status:             Ready for review — screen 19 PROPOSED visually accepted for shell,
                               spacing, typography and the allowed parent-facing wording panels
                               ONLY, given the R-B5 omission set above. The /edit sub-surface is
                               NOT proposed accepted. Only the operator accepts a screen.
Recorded, not fixed (outside owned paths): components/brand/brand-mark.tsx:86 hardcodes
                               href="/trainer" — LIVE ON THIS SCREEN, where the brand mark links a
                               Management user into the Trainer portal; portal-shell.tsx nav and
                               subtitle contrast at 2.225:1 - 3.079:1 (SC 1.4.3); no
                               skip-to-content bypass link (SC 2.4.1); trainer-dashboard.tsx:72's
                               undefined bg-warning-800 token; app/globals.css still declares *,
                               body, h1-h4, .card, .panel and .form-field UNLAYERED (worked around
                               here, as at F-05, F-07 and F-09, by carrying heading colour on an
                               inner span); and the brand-700 white-on-pink primary action at
                               4.517:1 — which on this screen is the Approve & Submit control.
```


---

## GOVERNANCE CONFLICTS RECORDED - 2026-08-08 (Final MVP Phase A2, operator ruling Q-24)

**These are conflicts between the ratified Figma reference for this screen and B.E.S.T governance. Governance WINS. Do not build the reference behaviour described below.**

Source of record: `UI_REFERENCE_FINAL_MVP/FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md` (GC register, declared authoritative by `FINAL_MVP_AUTHORITY_LOCK.md` section 28.2). The `reference/` tree is VISUAL rank 1 but FUNCTIONAL rank 5 (lowest) - it cannot override a functional, privacy or security rule.

- **GC-5 — Audience toggle, Performance Summary grid, Overall Grade, "Save as draft". A-038: management never reads raw ratings or the content hash. A-036: there is no management draft state. ALREADY CORRECTLY OMITTED under R-B5 — keep it omitted.**

  ⚠️ **PARTLY DISCHARGED 2026-08-11 — operator rulings `D-1` / `C-10`, recorded under `C-18`. READ LIMB BY LIMB; THEY DO NOT MOVE TOGETHER.**

  | Limb | Now |
  |---|---|
  | **Performance Summary grid** | ✅ **PERMITTED — and required at `P1-1b`, ALL NINE** (`D-1`, `C-9` reaches report detail surfaces and this is one, `C-10` rules nine not four). ⛔ **Not yet built; `P1-1b` is not yet authorized.** |
  | **Overall Grade** | ⛔ **STILL EXCLUDED — `G-2`, PERMANENTLY.** Its `A-038` ground lapsed with `D-1`; it survives on **unratified** and on `Q-27`. |
  | **`Save as draft`** | ⛔ **STILL EXCLUDED — `A-036`.** There is no management draft state; adding one needs a ninth `report_status`. |
  | **Audience toggle** | ⛔ **STILL EXCLUDED.** There is no `kind` enum and no `audience` column; audience comes from **authorization**, never an attribute on the row. |
  | **Content hash** | ⛔ **STILL EXCLUDED for both audiences.** The rule was **not** amended by `D-1`; only its 4⁹ rationale lapsed, and only for Management. **Widening it is a §12 stop-and-ask.** |

**No authoritative visual bytes (PNG or HTML) were altered by this recording.**


### UI RECONCILIATION plan Phase 8 — 2026-08-10

Visual reconciliation only against `reference/Management - Student Report/` (A-056).
**12 TRUE-DRIFT resolved; 12 REGISTERED-OMISSION preserved, ZERO changed** — reported as two
separate lists (plan §6.5). Every prohibited frame element was verified ABSENT FROM RENDERED
JSX by sweep, not by reading its comment: P1 audience toggle, P2 Performance Summary rating
grid (`ratingSnapshots` 0; no rating token), P3 Overall Grade, P4 assessment-editing control,
P5 evidence and attendance substance, P6 Save as draft — all comment-only. The content hash is
never rendered; the screen holds only `wordingHash`, the domain-separated panels-only proof,
and SENDS it as `expectedWordingHash`.

⚠️ Two occurrences deliberately NOT flagged because they are governed fields, not leaks: the
`eye_contact` dimension-NAME map and `issueScope === "rating"` both belong to the
return-to-trainer correction request. A bare token sweep would have misread both — which is
why the boundary is asserted structurally, never lexically (A-052).

RENDERED CAPTURE **NOT-RUN** — authenticated surface; a `CLAUDE.md` §12 stop-and-ask no current
authorization carries. None manufactured, no hosted service contacted. NOT-RUN is not PASS.

tsc 0 · eslint 0 · build 0 · route census 17 unchanged · emitted-CSS 16/16 · no governed
surface touched. Full detail: `docs/plan/UI_RECONCILIATION_BATCH_3_ADJUDICATION.md` Phase 8.
`Accepted` is Operator-set only and has NOT been set.
