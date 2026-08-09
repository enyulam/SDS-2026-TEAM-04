# PHASES 1–3 — THE AUTHENTICATION TRIO, ADJUDICATED

> **This document authorizes nothing.** Procedural record for `docs/plan/UI_RECONCILIATION_BUILD_PLAN.md` §4 Phases 1, 2 and 3, written so a later phase or reviewer does not re-derive the comparison. It cannot override the specification, a ratified amendment, `FINAL_MVP_AUTHORITY_LOCK.md`, an operator ruling or `CLAUDE.md`.
>
> Written 2026-08-10 on `develop`, in the **development clone**. Companion to `UI_RECONCILIATION_PHASE_0_RAIL_ADJUDICATION.md`.

---

## 0. Scope, and why the three run together

`AUTH-01`, `AUTH-02` and `AUTH-03` are three separately-frozen Figma nodes served by **one** implementation — `features/auth/login-presentation.tsx` plus `components/auth/*`. `GLOBAL_UI_RULES` §2 permits exactly that: *"they may share one implementation shell and one route implementation — the visual references do not merge."*

**Measured this run, the three frames carry byte-identical copy** — all fourteen strings — **and differ in exactly four style blocks**, every one of them inside the segmented control. The only thing that moves between the three frames is **which segment is current**.

| Comparison | Result |
|---|---|
| AUTH-01 text vs AUTH-02 text | **identical** |
| AUTH-01 text vs AUTH-03 text | **identical** |
| AUTH-01 vs AUTH-03 style blocks | 42 vs 42; **4 differ** — indices 7, 8, 11, 12 |
| What those four are | the current segment's `background: white` and `#1B2A4A`, moving from slot 1 to slot 3 |

So Phase 1 carried the reconciliation and Phases 2 and 3 reduced to the role deltas, exactly as plan §1.5 predicted.

---

## 1. Method

Per plan §3.1: reference side is **both** artefacts — `.png` is visual truth, `.html` is measurable values, `.png` wins on disagreement. Build side is a **rendered capture** of the served production build, taken after the Suspense fallback clears.

- Captures: `docs/progress/ui-reconciliation/{before,after}/login-{trainer,management,parent}.{png,json}`
- Harness: `scripts/ui-reconciliation/capture-login.mjs`, 1440 × 1024 (the frames' native size), headless Chrome over CDP, loopback-only.
- The `.json` beside each capture holds **computed styles read out of the rendered DOM**, located by production hooks and semantic roles — never by class name, which would make the probe a restatement of the source rather than a measurement of the render.

> ⛔ **The export was read for VALUES ONLY.** No export markup, class name, DOM structure, absolute position or fixed pixel layout entered any component.

**No database was reached.** `/login` is public, renders no governed projection, and the harness never submits the form. The S-3 trip-wire measured **ZERO non-loopback TCP peers** across 7 samples of the served process tree on every capture run — which matters here because `.env.local` in this clone configures the **hosted** dev project, so "did the capture stay local" is a question with a real answer rather than an assumption. Verified without printing any value: it references `poblcfbxxzgarclchzkx`, references no local Supabase, and references the frozen `zjukuffiuzkbiblmnuwl` **not at all**.

> ⚠️ **The trip-wire caught the harness itself, twice, and both are recorded rather than smoothed over.** Its first revision sampled **after** stopping the server, so a recycled Windows PID attributed unrelated connections to the served tree. Corrected to sample a **live** tree — and it then read a genuine non-zero: one transient `443/ESTABLISHED` peer held only while a browser drove the page, which serving the same routes to a non-browser client reduced to zero. That localised it to the **Next dev overlay's update check**, not the application and not a database — no Postgres or pooler port appeared in any sample. The harness now serves the **production build**, which has no dev overlay, so the finding is removed at its source rather than annotated.

---

## 2. `TRUE-DRIFT` RESOLVED — 15

**Phase 1 (14).** Brand→column gap 40→25px · a uniform **18px** column rhythm replacing 20/16/28px · "Sign in as" 13px/700→12.5px/600 · label→segments 10→9px · segment track gains the frame's **4px** gutter and its `surface-muted` fill · segments 14px/700→12.5px at a 9px radius, elevation dropped · heading 32px/800→**27px/700** · heading→description 6→5px · description 14→13px · field labels 13px/700→12.5px/600 · credential controls →**11px radius, 14 × 15px padding, visible hairline** · checkbox 16→18px · submit →**14.5px/600 at an 11px radius with 15px padding** · footer note 13px centred→**12px LEFT-ALIGNED** · the four backdrop discs unified to the frame's single **380px** size at its four measured positions.

**Phase 2 (1).** The current segment's weight, 500 → **600**. See §4.

**Phase 3 (0).** None. Every AUTH-03 delta was already satisfied; the parent variant renders the current segment in slot 3 (x = 788) with the frame's white fill and `#1B2A4A`. **A phase that finds nothing left to change is a result, not a skipped phase** — the comparison was run and is recorded above.

### 2.1 ⚠️ One drift needed a CSS rule, not a utility — and the difference was measured

The credential controls kept computing **10px / 12px / 14px** with `rounded-[…]`, `px-[…]` and `py-[…]` correctly written on them. `.form-field` is an **unlayered** rule and `@import "tailwindcss"` emits utilities into `@layer utilities`; **an unlayered rule outranks every rule in every layer**, so the utilities were generated, matched, and silently lost the cascade. This is the same trap recorded at F-01b, resurfacing in a new place.

Fixed narrowly as `.form-field.auth-field` in `app/globals.css`. **`.form-field` was deliberately not moved into a layer** — that would change the cascade for every consumer across the application at once, far outside this phase.

**This was only caught because the build side is a measurement of the rendered DOM.** A source-level comparison would have reported the drift as resolved.

---

## 3. `REGISTERED-OMISSION` PRESERVED — 8, none changed

Phase 1's MUST-NOT-CHANGE list applies unchanged to Phases 2 and 3 (plan §4).

| # | Preserved | Citation |
|---|---|---|
| 1 | **The `role` query is presentation only** — it grants no role, session, permission or destination, is not a parameter of the sign-in action, and an unrecognised value falls back to Trainer and grants nothing | A-046 |
| 2 | **`Remember me` stays a `disabled` checkbox with NO `name`**, never submitted. ⛔ The frame draws it **CHECKED and filled pink**; that was deliberately not copied — painting it active would claim a behaviour that does not exist | A-045; plan §4 |
| 3 | **`Forgot password?` stays inert**, not a link, with its screen-reader unavailability note. The frame draws it as live brand-pink link text; the build keeps a muted treatment | plan §4 |
| 4 | **The sign-in failure message stays ONE closed two-valued message** — wrong password, unknown email, deactivated account and missing/ambiguous membership remain indistinguishable in the DOM | `GLOBAL_UI_RULES` §2; plan §4 |
| 5 | **The password stays uncontrolled** — input → `FormData` → the server action, never React state, a URL or a log. The reveal control toggles the `type` attribute and nothing else | plan §4 |
| 6 | **The "Role selection is presentation only" governance note stays.** It is a **required addition** the frames do not draw: a login screen must not imply that choosing a role grants it | A-046; `GLOBAL_UI_RULES` §2 |
| 7 | ⛔ **No logo or tagline asset invented.** The frames carry the academy's 400 × 153 raster wordmark and *"Where Confident Leaders Are Made"*; neither has a recorded disposition. The approved in-repo mark stands. **This is a recorded asset dependency and MUST NOT be classified `TRUE-DRIFT`** | A-013 via A-022.2; plan §2 amendment 5 |
| 8 | **The brand mark is non-interactive on all three** — a pre-authentication screen offers no route into any workspace | F3, pinned by `three-role-browser-smoke.mjs` |

**Also deliberately not ported:** the frames' `oscar.hansen@school.edu` placeholder, present on all three. It is **Figma mock data**, which `CLAUDE.md` §7.2 forbids porting, and ADR-6 requires synthetic data only. The build keeps role-scoped `.invalid` placeholders (RFC 2606).

**Also deliberately not followed — the frame's colours.** Measured on the rendered production DOM, the frames' quiet text runs **2.041 – 3.492:1**, below the 4.5:1 SC 1.4.3 requires. Three build values were *also* failing at ~3.07:1 before this phase and were deepened to `neutral-on`, the F-01c adjudication applied to these surfaces. **No token VALUE was redefined.**

| Pair | Measured now |
|---|---|
| heading · field label · current segment | **14.059:1** |
| description · footer note · `Forgot password?` | **5.558:1** |
| resting segment · governance note | **5.101:1** |
| submit label on its fill | **4.517:1** |

**All nine pairs clear AA.** The frame's `#EC4B96` action fill would be **3.492:1** and is not used; `design-foundation.assertions.ts` holds that pair ≥ 4.5:1 as a standing invariant.

---

## 4. ⚠️ THE THREE RATIFIED FRAMES DISAGREE — recorded, not silently picked

The current segment's font weight is **500 in AUTH-01, 600 in AUTH-02, 500 in AUTH-03**.

That is a **frame-vs-frame** difference. Plan §3.1 is explicit that this plan's "drift" means **BUILD vs FRAME only** and *"never frame-vs-frame or pack-vs-pack"*, so no rule in the plan resolves it.

**600 was applied, to all three.** Reasons, in order:

1. Phase 1 set both states to 500 **and** dropped the current segment's elevation, which left the **fill** as the only thing separating the current segment from its neighbours — a distinction carried by colour alone.
2. Weight restores a genuine non-colour cue (`GLOBAL_UI_RULES` §7, WCAG 1.4.1), alongside `aria-current="page"`.
3. **AUTH-02 ratifies exactly that value**, so the applied value is a frame value, not an invention.
4. One shared control keeps one treatment. A per-role weight would encode the role into presentation, and the role here is **presentation only** (A-046).

This is **not** classified `NEW-QUESTION`: it is a visual detail among ratified assets, not a governance question, and the plan empowers a phase to reconcile visuals. It is recorded here and in the component so the Operator can reverse it in one line.

---

## 5. Verification

| Check | Result |
|---|---|
| `tsc --noEmit` | **0** |
| `eslint .` | **0** |
| `next build` | **0** — route census **17**, unchanged across all three phases |
| `authentication-browser-smoke.mjs` | **PASSED — 12 checks**, all three roles: shared shell · labelled fields, labelled checkbox, `h1` · reveal toggles type only and stores no value · per-role selection state, non-disclosure, real sign-in form, **no destination in the DOM** · keyboard operability, real reveal button, **visible focus indicator** · unknown/absent/malformed role queries fall back and grant nothing · walking the role query escalates nothing · **responsive usability at 1440, 1024, 900 and 480px** · **zero uncaught console errors** |
| SC 1.4.3 | measured on the rendered DOM, **9/9 pairs ≥ 4.5:1** |
| Governed surfaces | **none touched** — no schema, migration, RPC, server action, DTO, projection, grant, policy, audit action or route |
| Capture trip-wire | **ZERO** non-loopback peers, every run |

---

## 6. Carried, unresolved — bounded and declared

| Item | Class | Disposition |
|---|---|---|
| The academy wordmark and tagline | **Recorded asset dependency** | ⛔ Not `TRUE-DRIFT`. No approved asset exists; none may be invented. **Operator-owned** |
| `Remember me` checkbox **corner radius** | **`TRUE-DRIFT`, unresolved — cosmetic, native control** | The frame draws a 5px-radius rounded square. `rounded-[0.3125rem]` is present on the element and **is emitted** in the production CSS, yet the control computes `0px`: Chrome paints a native checkbox itself while `appearance` is `auto`. Resolving it means replacing the native control with a custom-drawn one — added complexity for a **disabled, inert, never-submitted** affordance, and a real risk of making it look interactive, which §3 item 2 forbids. Its **size** (18px) does match. Recorded rather than forced |
| The frames' `Poppins` type family | Not pursued | The project references **no external font, icon CDN or remote stylesheet** by standing rule, and `design-foundation.assertions.ts` asserts it. The local stack stands |

**Nothing in Phases 1–3 was classified `NEW-QUESTION`.**
