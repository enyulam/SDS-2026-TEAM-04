# 11 - Management Dashboard - implementation notes

**Append-only.** Add a new entry at the bottom for every implementation checkpoint touching this screen. Never edit or delete an existing entry - a superseded entry is corrected by a later entry that says so.

---

## Entry template - copy below the last entry

```
Timestamp (Asia/Singapore):
Source branch:
Starting commit:
Screen ID:                     11
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
Screen ID:                     11
Checkpoint:                    F-01a — bounded WCAG 2.2 AA accessibility correction.
                               NOT a screen reconstruction. This screen's visual acceptance
                               status is unchanged and remains Not started.
Existing route audited:        /management
Components preserved:          all — no component was replaced, created, moved or restructured
Components replaced:           none
Components created:            none
DTO and port changes:          none
Fixture changes:               none
Backend dependencies discovered: none new
Vocabulary dependencies:       none. No rating label, Class Grade label or copy string was touched.
                               Amendment 006 V3 remains pending and unauthorized.
Governance blockers:           none
Change made on this screen:    features/management/management-dashboard.tsx:105
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
Screen ID:                     11
Checkpoint:                    F-01b — bounded correction of the High finding the independent
                               verifier raised against F-01a. NOT a screen reconstruction.
                               This screen's visual acceptance status is UNCHANGED.
Existing route audited:        /management
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



---

## GOVERNANCE CONFLICTS RECORDED - 2026-08-08 (Final MVP Phase A2, operator ruling Q-24)

**These are conflicts between the ratified Figma reference for this screen and B.E.S.T governance. Governance WINS. Do not build the reference behaviour described below.**

Source of record: `UI_REFERENCE_FINAL_MVP/FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md` (GC register, declared authoritative by `FINAL_MVP_AUTHORITY_LOCK.md` section 28.2). The `reference/` tree is VISUAL rank 1 but FUNCTIONAL rank 5 (lowest) - it cannot override a functional, privacy or security rule.

- **GC-6 — The frame shows per-student competency badges / per-dimension bars / "Overall" / "Strongest / Focus area" to MANAGEMENT. CLAUDE.md section 6 and A-038: management NEVER reads raw per-dimension ratings. DO NOT BUILD.**

  ⚠️ **CORRECTED 2026-08-11 — operator ruling `C-18`** (`FINAL_MVP_PORTAL_DECISIONS.md` §C). **THE CONCLUSION IS UNCHANGED — `DO NOT BUILD` STILL STANDS — BUT THE GROUND HAS MOVED, AND THE BULLET ABOVE NOW CITES A LAPSED ONE.**

  ⛔ **`A-038` NO LONGER BARS MANAGEMENT FROM RATINGS AS SUCH.** Operator ruling **`D-1`** (2026-08-11) permits Management to **VIEW the nine per-dimension ratings, READ ONLY**. Quoting `A-038`'s management rating bar as live is now wrong, and a reader who checks it will find it superseded — which is exactly how a genuine prohibition gets discarded along with a stale citation.

  ✅ **TWO INDEPENDENT GROUNDS CARRY SCREEN `11` INSTEAD. Either alone is sufficient:**

  1. **`C-9`** — `D-1` reaches **REPORT DETAIL SURFACES ONLY**. This screen is not one. *"Ratings on a list or a statistics surface is a different disclosure shape — it invites comparison between children, which is not what I authorized."*
  2. **`G-2`** — the **`"Overall"` / `"Strongest / Focus area"`** limbs are **roll-up ratings**, and a roll-up is **PERMANENTLY EXCLUDED on every surface**. ⚠️ `G-2`'s own `A-038`-derived ground lapsed with `D-1`; it survives on its two others — the roll-up is **unratified**, and on a Parent surface it is the **`Q-27`** leak.

  ⛔ **NOTHING ON THIS SCREEN CHANGES.** Do not add a rating badge, bar, column, tile or chip, and **do not read `D-1` as permitting one here.** The surface `D-1` actually moves is **screen `19`**.

**No authoritative visual bytes (PNG or HTML) were altered by this recording.**


### UI RECONCILIATION plan Phase 12 — 2026-08-10

Visual reconciliation only against `reference/Management - Dashboard/` (A-056).
**4 TRUE-DRIFT resolved; 3 REGISTERED-OMISSION preserved, ZERO changed** — two separate lists
(plan 6.5). INCOMPLETE separated from TRUE-DRIFT first: the frame draws four KPI tiles and a
"Reports waiting for approval" list; the build renders two queue cards. The extras are
INCOMPLETE, NOT drift, and nothing was built for them.

The frame carries a B.E.S.T. RATING PER ROW ("Mastering", "Beginning"). It must not be built,
and it was not — ZERO rating tokens and ZERO content-hash occurrences in the component. Row
actions are still decided individually by status via the filtered queue, with no shared generic
view handler.

This screen was also still on the pre-reference LEGACY scale (third such surface in Batch 3);
`text-ink-muted` was another LIVE 3.079:1 SC 1.4.3 failure. All legacy tokens removed from
rendered classNames.

RENDERED CAPTURE **NOT-RUN** (authenticated surface). NOT-RUN is not PASS.

tsc 0 - eslint 0 - build 0 - route census 17 unchanged - emitted-CSS 4/4 - no governed surface
touched. Full detail: docs/plan/UI_RECONCILIATION_BATCH_3_ADJUDICATION.md Phase 12.
`Accepted` is Operator-set only and has NOT been set.

### 2026-08-14 — `P2-7` BUILT (PORTAL COMPLETION PLAN phase `P2-7`)

**Route:** `/management/dashboard` — the canonical route, **created**, with `/management`
preserved as a **compatibility redirect** under the Operator's option-2 ruling and built to the
ratified `R-B1` precedent (`/trainer` → `/trainer/schedule`) rather than to a new pattern.

**Schema delivered, exactly as authorized:** 0 tables · 0 columns · 0 enums · 0 policies · 0 client
grants · **audit registry UNMOVED at 23** · **ONE** reviewed `SECURITY DEFINER` READ,
`report_centre_dashboard_summary()`, returning **four integers**. Measured both directions:
management reads `13 · 10 · 2 · 4`; a trainer reads **`NULL`**, not zeroes.

#### ⛔⛔ ONE LEAK WITH TWO RENDERINGS — cited together at one site, by ruling

**(a) THE RATING CHIP ON EVERY ROW.** The `.html` carries all four ratified labels as literal
text — **8 chips for 8 rows** (`Beginning`×2, `Developing`×3, `Mastering`×2, `Mastered`×1).
⛔ **BOTH AVAILABLE READINGS PROHIBIT IT**, which is the strongest form: as a per-dimension rating
`C-9` confines the nine to report **DETAIL** surfaces; as a roll-up `G-2` bars it everywhere,
permanently.

**(b) THE ONE-LINE ROW DESCRIPTION.** ⚠️ **THE FRAME'S ROW DESCRIPTIONS ARE ASSESSMENT SUBSTANCE.
THIS IS NOT A COPY PREFERENCE.** All eight are in the `.html` and they carry the vocabulary **in
running prose** — *"**Mastered** eye contact, clear projection"*, *"**Beginning** on sentence flow
& pace"*. ▶ **Removing the chips and keeping the descriptions would leave the leak in place and
LOOK COMPLETE.** They also have no substrate: `A-038` gives management the four parent-facing
panels and nothing else.

⛔ **THE RULE BUILT TO:** the row carries **learner, session and status — nothing about how the
child performed.** No chip, no band name, no paraphrase of a band in prose.
▶ **`REGISTERED-OMISSION`, and it NEVER ENDS.** Cited together **at the row markup itself** so a
later phase cannot delete one and believe the panel is clean.

#### ⛔ THE `Approved` KPI READS `Submitted` — an Operator ruling, not drift

`A-036` makes `approved` **transient-in-transaction**; it never commits, so the frame's tile would
read **zero forever**. ▶ *"A KPI that can only ever read zero is worse than absent — it asserts a
measurement that does not exist."* **THIRD SIGHTING of the Step 7I1D-R2 defect.** Migration
assertion **`W-5` fails the build** if anybody counts the transient status.

#### Three more frame strings not built as drawn

`Grade 8` (×5) — not a ratified Class Grade; every label is **read** from
`class_grades.display_name` (`A-016`, `A-026`/`A-054`). · `Hall A` (×5) — `room` exists but is
**NULL on all 17 sessions**, so hero `0B` omits it. · `4 awaiting approval` over **8 drawn rows** —
**the frame contradicts itself**; the pill reads the list it sits on.

⚠️ **`Today's Events` is NOT a second event entity** (`GC-13`, `A-016`): it is `P2-5`'s delivered
schedule projection filtered to today.

#### The bars, asserted the way `V-4` asserts them

Migration `W-4` fails the build if the read names a **rating**, a **panel field**, a **trainer
note or chip**, or a **checklist/hash** field — bare substrings, so it catches the next rating
column nobody has written yet. ⚠️ **`W-4c` requires all four detectors to FIRE against planted
samples**, so the four absences are measurements rather than four patterns that can never match.

```artefact-read
screen: 11
pack: Management - Dashboard
component: features/management/management-dashboard-screen.tsx
html-values: 14.50px, 13.50px, 12.50px, 9.50px, 23px, 16px, 12px, 11px
screen-md-quote: Management landing surface for the final MVP.
```

**Visual acceptance:** `NOT-RUN` — Operator-set only.
