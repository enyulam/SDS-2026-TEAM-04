# AUTH-01 - Trainer Login - implementation notes

**Append-only.** Add a new entry at the bottom for every implementation checkpoint touching this screen. Never edit or delete an existing entry - a superseded entry is corrected by a later entry that says so.

---

## Entry template - copy below the last entry

```
Timestamp (Asia/Singapore):
Source branch:
Starting commit:
Screen ID:                     AUTH-01
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

*(none yet)*

---

## FRONTEND RECONSTRUCTION F3 — AUTH-01 (546:370)

| Field | Value |
|---|---|
| Timestamp (Asia/Singapore) | 2026-08-06 |
| Checkpoint | `FRONTEND RECONSTRUCTION F3` |
| Branch | `feat/48h-frontend` |
| Starting commit | `07988a57239726d8b026165e2bc51c28da2147a5` |
| Ending commit | `b72752a88ed84144a135d19b64aea2c1658ceb95` |
| Canonical route | `/login?role=trainer` — satisfied, no mismatch |
| Reference SHA-256 | `b1ad24e4f414ece90d7a1b091e516a44163f28856e7898a60db288f487a56da1` — **verified identical to the validated pack**, 95,496 bytes, 1440 x 1024 |
| Reference modified | **No** — recomputed after the checkpoint and byte-identical |

### Route audited

`app/(auth)/login/page.tsx` + `app/(auth)/layout.tsx` + `features/auth/login-presentation.tsx`. One route file serves all three login frames, as `GLOBAL_UI_RULES.md` section 2 and this screen's section 13 permit.

### Components preserved

The `/login` route file and its `?role=` presentation split; the fixture-entry navigation; the governance copy pinned by the existing browser smoke suites.

### Components replaced or created

Shared authentication shell created at F2 — `components/auth/auth-shell.tsx`, `components/auth/role-segmented-control.tsx`, `components/auth/credential-fields.tsx`. `app/(auth)/layout.tsx` replaced to retire the provisional dark presentation. `features/auth/login-presentation.tsx` recomposed onto the shell. `BrandMark` gained `size` and `interactive` props.

### Role-specific work at this checkpoint

Automated reference-fidelity module (SHA-256, byte size, IHDR dimensions, IEND completeness, distinctness of all three frames); role-specific accessible region name; keyboard operability, real reveal button and visible focus assertions; cross-role reachability assertion, which caught and fixed the brand mark exposing `/trainer` from the other two logins.

### Backend or governance dependencies recorded

- **Real Supabase Auth sign-in is delivered on `feat/48h-backend` and is not wired on this branch.** Credential inputs therefore remain disabled with an explicit note, preserving delivered behaviour and keeping a real password out of a field that goes nowhere. Enabling the credential path is F16.
- **The academy raster wordmark carried by all three frames has no asset disposition.** `GLOBAL_UI_RULES.md` section 8 forbids both copying an undispositioned asset and re-drawing a logo ad hoc, so the approved in-repo mark occupies the brand slot. **Operator disposition required.**
- **Destination:** expected physical-test destination `/trainer/schedule`. The expected physical-test destination `/trainer/schedule` DOES NOT EXIST. Its treatment is `Operator decision required` (inventory 7.3, U-A5-1) and it is gated on F4. No destination route was created and no redirect policy was changed; the fixture entry continues to target the delivered `/trainer` surface.

### Frame-versus-governance deviations, recorded not resolved

1. Brand slot uses the approved in-repo mark, not the frames' undispositioned wordmark.
2. Primary action reads "Open <Role> fixture workspace", not "Sign in" — labelling it "Sign in" would claim an action it does not perform.
3. Credential inputs disabled, with an explicit note.
4. "Remember me" renders unchecked where the frames show it checked — a disabled checked box would imply session persistence that does not exist.
5. "Forgot password?" is inert — recovery is a Supabase Auth flow not wired on this branch.

### Validation

Reference fidelity, `tsc --noEmit`, `eslint .`, production build (route census unchanged at 16), `authentication-browser-smoke.mjs`, `design-foundation.assertions.ts`, `trainer-browser-smoke.mjs`, `three-role-browser-smoke.mjs`, `git diff --check` — **all exit 0**, zero uncaught browser-console/runtime errors.

### Acceptance state

| Checklist | State |
|---|---|
| Visual acceptance | **Proposed accepted** — pending operator review. Column geometry matches the frozen frame exactly; the one open item is the brand asset disposition above. |
| Functional acceptance | **Proposed accepted** — delivered behaviour preserved; nothing invented. |
| Privacy and security acceptance | **Proposed accepted** — role query grants nothing and persists nothing; errors non-disclosing; no credential stored, logged or pre-filled; no pre-authentication disclosure. |

Evidence (outside Git): `UI_REFERENCE_FINAL_MVP\_checkpoint-evidence\F3\`

```
Timestamp (Asia/Singapore):    2026-08-06
Source branch:                 feat/48h-frontend
Starting commit:               6e8816e218d5b1b896abdf234be3657e3b6638e6
Screen ID:                     AUTH-01
Checkpoint:                    F-01b — bounded correction of the High finding the independent
                               verifier raised against F-01a. NOT a screen reconstruction.
                               This screen's visual acceptance status is UNCHANGED.
Existing route audited:        /login?role=trainer
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
Measured on this screen:       Password-reveal control took its declared text-ink-muted #8a93a8 on white,
                               3.079:1 (was #33405c 10.352:1 by inheritance). Its visible content is the
                               EyeGlyph inline SVG; "Show password" is sr-only, so SC 1.4.11 non-text
                               contrast at 3:1 applies and is met. Recorded, not fixed — credential-fields
                               is outside this checkpoint's owned paths.
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

