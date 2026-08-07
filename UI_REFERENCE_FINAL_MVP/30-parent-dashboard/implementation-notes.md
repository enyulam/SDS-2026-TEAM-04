# 30 - Parent Dashboard - implementation notes

**Append-only.** Add a new entry at the bottom for every implementation checkpoint touching this screen. Never edit or delete an existing entry - a superseded entry is corrected by a later entry that says so.

---

## Entry template - copy below the last entry

```
Timestamp (Asia/Singapore):
Source branch:
Starting commit:
Screen ID:                     30
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
Screen ID:                     30
Checkpoint:                    F-01a — bounded WCAG 2.2 AA accessibility correction.
                               NOT a screen reconstruction. This screen's visual acceptance
                               status is unchanged and remains Not started.
Existing route audited:        /parent
Components preserved:          all — no component was replaced, created, moved or restructured
Components replaced:           none
Components created:            none
DTO and port changes:          none
Fixture changes:               none
Backend dependencies discovered: none new
Vocabulary dependencies:       none. No rating label, Class Grade label or copy string was touched.
                               Amendment 006 V3 remains pending and unauthorized.
Governance blockers:           none
Change made on this screen:    features/parent/parent-dashboard.tsx:91
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
Screen ID:                     30
Checkpoint:                    F-01b — bounded correction of the High finding the independent
                               verifier raised against F-01a. NOT a screen reconstruction.
                               This screen's visual acceptance status is UNCHANGED.
Existing route audited:        /parent
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



---

## GOVERNANCE CONFLICTS RECORDED - 2026-08-08 (Final MVP Phase A2, operator ruling Q-24)

**These are conflicts between the ratified Figma reference for this screen and B.E.S.T governance. Governance WINS. Do not build the reference behaviour described below.**

Source of record: `UI_REFERENCE_FINAL_MVP/FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md` (GC register, declared authoritative by `FINAL_MVP_AUTHORITY_LOCK.md` section 28.2). The `reference/` tree is VISUAL rank 1 but FUNCTIONAL rank 5 (lowest) - it cannot override a functional, privacy or security rule.

- **GC-3 — "This Term's Skills": a NINE-ROW BAR CHART, one bar per B.E.S.T dimension, on a PARENT surface. This is a per-dimension rating grid, prohibited "in any form or wording". A BAR CHART IS A FORM. DO NOT BUILD. (This pack previously carried NO recorded conflict — nothing stopped an agent building it as drawn.)**

**No authoritative visual bytes (PNG or HTML) were altered by this recording.**

---

## PARENT DASHBOARD — INTENTIONAL GOVERNANCE OVERRIDE (operator ruling Q-27, 2026-08-08)

**Status: `DO_NOT_IMPLEMENT`. This is a governed implementation deviation from the ratified visual reference. It is NOT a temporary omission, NOT a backlog item, and NOT a request to edit Figma.**

Canonical instrument: `FINAL_MVP_AUTHORITY_LOCK.md` §15.2. **Q-27 elevates and closes GC-3 above** — it does not conflict with it. GC-3 prohibited *building the bar chart*; **Q-27 rules the complete card absent.**

**The final implementation MUST NOT render the reference's "This Term's Skills" / nine-dimension rating card.** Removed in full:

- the card **title**;
- **all nine** dimension labels (Body · Eye Contact · Emotion · Speech · Tonality · Vocal Projection · Emotional Expression · Sentence Flow · Audience Awareness);
- **all** progress/rating bars;
- **all** rating-derived visual state;
- **any** equivalent replacement visualization of those nine ratings.

**Explicitly insufficient:** hiding the labels · obscuring the values · rendering empty bars · collapsing the values while retaining the container · renaming the card · substituting another ratings visualization. **The entire card is absent.**

**Layout consequence (required, not incidental).** With the card omitted, **Profile Details promotes upward** into the vacated main-column space under the existing layout system. **No intentional blank rectangle** is left behind, and **no new card is invented to fill it.** The right-side **Calendar / Upcoming** structure is unchanged. The screen must remain visually coherent with the authoritative reference.

**Data boundary — the ruling is not merely visual.** The nine dimension ratings must not reach a Parent session through the Parent Dashboard UI, the Parent Reports UI, Parent-visible page state, Parent-facing DTOs/projections, Parent-facing RPC results, Parent-facing APIs/server actions, or any client payload available to a Parent session. **Fetching them into the Parent client and hiding them with CSS is a violation.** The exclusion happens at the governed projection/data layer.

**Visual acceptance for this screen.** The absence of this card is **`EXPECTED / REQUIRED`**. It must **never** be recorded as `MISSING IMPLEMENTATION` or as a `VISUAL REGRESSION`. Acceptance for screen 30 = the authoritative reference **minus this card**, with Profile Details promoted upward, the right-hand column intact, and **no replacement ratings visualization anywhere**.

**Unaffected by Q-27:** Trainer assessment ratings · Management review authority · attendance · observations · evidence · Trainer notes · the report lifecycle · AI authority · **OD-4, which remains `Overview · Strengths · Areas for Development · Remarks`.** **Trainer and Management rating AUTHORITY is unchanged — neither widened nor narrowed** — which expressly includes **A-038's standing bar on Management reading raw per-dimension assessment data**, and **GC-5/GC-6, which remain live conflicts**. **Q-27 grants Management nothing.** **This ruling concerns Parent visibility only.**

**Reference authority.** The reference remains valid for the rest of the screen. **The authoritative Parent Dashboard PNG, the HTML render, the Figma source and the historical Figma provenance were NOT modified** — the record above is the deviation, not an edit to the reference. `reference/Parent - Dashboard/Parent - Dashboard.md:5, :11, :19` still describe the card; that text is **historical and superseded on this point**, and is deliberately left standing rather than rewritten.

**No authoritative visual bytes (PNG or HTML) were altered by this recording.**

