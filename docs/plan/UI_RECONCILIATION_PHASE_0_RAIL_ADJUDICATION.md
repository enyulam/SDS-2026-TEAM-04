# PHASE 0 — SHARED CHROME ADJUDICATION

> **This document authorizes nothing.** It is the written rail adjudication `docs/plan/UI_RECONCILIATION_BUILD_PLAN.md` §2 requires as Phase 0's done-criterion, so that **every later phase CITES it instead of re-deriving it**. It cannot override the specification, a ratified amendment, `FINAL_MVP_AUTHORITY_LOCK.md`, an operator ruling or `CLAUDE.md`.
>
> Written 2026-08-10 on `develop`, in the **development clone**. Batch 1 (Phases 0–3) was authorized by the Operator to run consecutively without an intervening acceptance.

---

## 0. What Phase 0 owns, and what it does not

**Owned paths:** `components/layout/portal-shell.tsx` · `components/layout/portal-navigation.ts` · `components/brand/brand-mark.tsx` · the token scale (`app/globals.css`, `lib/frontend/design/tokens.ts`).

**Why it exists.** The rail, the brand mark and the token scale are owned by **no screen**. Four registered entries (`06` D7, `08` D8/D9, `10` D8, `19` D5) each record a rail divergence and each resolve it identically — *"outside this checkpoint's owned paths"*. Without Phase 0 every screen phase re-raises the same finding and none is permitted to fix it.

**Outcome: no token VALUE was changed, and `portal-navigation.ts` was not modified at all.** The rail item set is unchanged, so no route was created, moved, renamed or redirected. The census is unchanged at **17 shipped routes** (plus the framework's `/_not-found`), enumerated from `app/**/page.tsx` on this run rather than restated.

---

## 1. Reference side — where the measured values come from

Per plan §3.1 the reference side is **both** artefacts, with distinct roles: the `.png` is **visual truth**, the `.html` export is **measurable values**. Where they disagree the `.png` wins.

The rail is drawn identically in every in-scope frame. Values below are read from `UI_REFERENCE_FINAL_MVP/reference/Trainer - Schedule/Trainer - Schedule.html`, and cross-checked against the Management and Parent frames.

> ⛔ **The export was read for VALUES ONLY.** No export markup, class name, DOM structure, absolute position or fixed pixel layout entered any component. Every value below landed in the existing Tailwind token scale and the existing semantic markup.

| Element | Frame value |
|---|---|
| Rail width | **250px** |
| Rail padding | **28px** top · **24px** bottom · **20px** sides |
| Rail background | white; **no right border** — the canvas `#F5F6FA` separates it by contrast alone |
| Brand row | padding-left **8px**, gap **10px** |
| Brand tile | **38 × 38**, radius **11px**, fill `#EC4B96` |
| Wordmark / subtitle | **19px / 700** · **10.5px / 500** |
| Brand → first nav item | **32px** (8px gap + 16px spacer + 8px gap) |
| Nav item | height **44px** · side padding **12px** · radius **12px** · gap **12px** · glyph **20px** · label **13.5px** |
| Nav item weight | **500 resting · 600 active** |
| Nav item gap | **8px** |
| Active item | tint `#FCE7F0`, label `#EC4B96` |
| Rail footer | flex spacer, then **one row**, padding-left 12px, gap 12px, glyph 20px, label 13.5px/500. **No divider, no identity block** |
| Content column | side padding **28px** · vertical **24px** · **18px** gap between stacked blocks |

---

## 2. Build side — what evidence exists, and what does not

| Evidence | State |
|---|---|
| `tsc --noEmit` | **0** |
| `eslint .` | **0** |
| `next build` | **0** — route census **17**, unchanged |
| `portal-navigation-active-state.mjs` | **6/6 PASS** — see §5 |
| `post-login-destinations.mjs` | **5/5 PASS** |
| `sign-out-terminates-session.mjs` | **4/4 PASS** |
| Contrast, measured per pair | §3 |
| Login-surface rendered capture | **taken** — `docs/progress/ui-reconciliation/{before,after}/` |
| **Rail rendered capture** | ⛔ ~~**NOT-RUN — see §6. Not a pass, and not silently omitted.**~~ ✅ **CLOSED 2026-08-10 by OPERATOR MANUAL VERIFICATION — see §6. Recorded as Operator verification, NOT as a harness pass.** |

---

## 3. ⭐ THE RAIL'S COLOURS DELIBERATELY DO NOT MATCH THE FRAME

**This is the single thing a later phase is most likely to get wrong.** The frame's rail palette fails WCAG 2.2 AA SC 1.4.3 for normal-size text in four places. The build's darker values are **governance-wins divergences and must be preserved**, exactly as the already-registered `07` D5 chip-contrast adjudication preserved the deeper rating ramp.

Measured this run:

| Pair | Frame | Build | Required |
|---|---|---|---|
| Active nav label on its tint | `#EC4B96` on `#FCE7F0` = **2.965:1** ❌ | `brand-800` on `brand-100` = **5.321:1** ✅ | 4.5:1 |
| Resting nav label on the white rail | `#8A93A6` = **3.086:1** ❌ | `neutral-on` = **5.558:1** ✅ | 4.5:1 |
| Brand subtitle on white | `#AEB6C4` = **2.041:1** ❌ | `neutral-on` = **5.558:1** ✅ | 4.5:1 |
| White label on the primary action fill | `#EC4B96` = **3.492:1** ❌ | `brand-700` = **4.517:1** ✅ | 4.5:1 |

The first pair is additionally a **standing token invariant**: `tests/frontend/design-foundation.assertions.ts` asserts `contrast(BRAND_TOKENS[800], BRAND_TOKENS[100]) >= 4.5`. Restoring the frame's colour would not merely regress contrast — it would falsify a declared invariant.

⚠️ **A later phase that "reconciles" any of these four to the frame has failed, not succeeded.**

---

## 4. What Phase 0 changed — `TRUE-DRIFT`, resolved

Presentational only. No data fetched, no governed call, DTO, projection, RPC, server action, schema object, migration or route touched.

1. **Rail padding** `px-4 py-6` → `px-5 pt-7 pb-6` (20 / 28 / 24px).
2. **Rail right border removed** — the frame carries none.
3. **Nav item gap** 6px → **8px**.
4. **Brand → nav gap** 36px → **32px**.
5. **Brand row inset** 6px → **8px**.
6. **Nav item metrics** — side padding 14px → **12px**; glyph 18 → **20px**; label 14px → **13.5px**.
7. **Nav item weight is now part of the active treatment** — 500 resting / 600 active. The build previously set 600 on every row and distinguished the current item **by colour and `aria-current` only**; weight adds the frame's own non-colour cue (`GLOBAL_UI_RULES` §7).
8. **Brand lockup** — tile 40 → **38px**, radius 12 → **11px**, glyph 20 → **22px**, gap 12 → **10px**, wordmark 18px/800 → **19px/700**, subtitle 11px/600 → **10.5px/500**.
9. **Rail footer identity block REMOVED** — the workspace eyebrow, account name and centre name. Every in-scope frame ends the rail with a spacer and **one row**, and puts the signed-in identity in the **top-right of the content column**, where this shell already renders it. De-duplication, not loss.
10. **Content column** — 28px sides, 24px vertical, **18px** block rhythm.

---

## 5. MUST-NOT-CHANGE — re-confirmed item by item

| # | Constraint | Citation | State |
|---|---|---|---|
| 1 | Rail items remain **the routes that actually exist**; a frame item pointing at an unbuilt screen is not a licence to create a route | A-045; inventory §7; plan §2 | ✅ `portal-navigation.ts` **unmodified**. The frame draws Dashboard · My Classes · Students · Reports · Schedule; screens `01`/`02`/`03` are **deferred** (A-044) and stay unbuilt |
| 2 | Route census unchanged | plan §2 | ✅ **17**, enumerated from the app tree by `app-route-census.mjs` |
| 3 | ⛔ **No logo or tagline asset invented** | A-013 via A-022.2; plan §2 amendment 5 | ✅ The approved in-repo mark stands. The academy wordmark and *"Where Confident Leaders Are Made"* remain a **recorded asset dependency**, **NOT `TRUE-DRIFT`** — see §7 |
| 4 | Parent rail's **Logout** row and its deferred Overview/Calendar destinations keep their recorded treatment | plan §2 | ✅ The sign-out control renders in **both** the desktop rail and the mobile header; no deferred destination was added |
| 5 | Exactly **one** current rail item on every route | R-C2-3; `GLOBAL_UI_RULES` §7 | ✅ `portal-navigation-active-state.mjs` — 15 portal routes + 4 ratified `?status=` aliases each resolve to exactly one item; `exact` and `owns` proven load-bearing across 7 discriminating cases |
| 6 | Management declares exactly **one** primary Reports destination | R-C2-3 | ✅ N-1 PASS |
| 7 | The four contrast divergences of §3 | persona §3.5; `design-foundation.assertions.ts` | ✅ Preserved |
| 8 | `data-adapter-kind` G-19 marker, parent-suppressed | `prove-disposable-app` / `prove-governed-lifecycle` fail closed without it | ✅ Untouched |
| 9 | `data-session-user` settled/pending flag | `prove-disposable-app.mjs` waits on it | ✅ Untouched, on the shell root |
| 10 | `"Trainer Portal"` / `"Management Portal"` / `"Parent Portal"` | Tier-1 selectors, `prove-stage3-authenticated.mjs:502-505` | ✅ Still rendered — they come from the **brand lockup**, not the removed footer block. The frame draws the same subtitle |
| 11 | The visible **`Sign out`** label, inside the form, immediately after the glyph | `sign-out-terminates-session.mjs` S-1; `prove-disposable-app.mjs` G-22 | ✅ **See §7** — this is the one place the frame was NOT followed |

**No `REGISTERED-OMISSION` was changed by Phase 0.**

---

## 6. ~~⛔ NOT-RUN~~ ✅ CLOSED BY OPERATOR MANUAL VERIFICATION — the rail's own rendered capture

> ### ✅ CLOSED 2026-08-10 — OPERATOR MANUAL VERIFICATION
>
> **The Operator verified the rail by hand across all three portals and reports that it renders correctly on every screen.** That closes the gap this section recorded.
>
> ⚠️ **It is recorded as OPERATOR MANUAL VERIFICATION, and deliberately NOT as a harness pass.** The distinction is not pedantry and must survive into any later citation:
>
> - **No automated capture of the rail exists.** Nothing was re-run, nothing turned green, and no suite now covers this. A later session must not cite this closure as evidence that a rail regression would be *caught* — it would not be.
> - It is a **point-in-time human observation** of the rail as built at `3010b63`, not a standing gate. It does not transfer to a later change to `portal-shell.tsx`, `portal-navigation.ts` or `brand-mark.tsx`.
> - The **hover, focus and responsive-collapse** behaviours named below were not separately enumerated by the verification and remain unproven by machine.
>
> **What it does establish, and it is the thing that mattered:** the rail's rendered geometry — the one Phase 0 claim resting on source-to-token resolution rather than on a render — is confirmed correct on all three portals by the only party who could reach an authenticated surface in this clone.
>
> **The reasoning below is retained unedited** as the record of *why* the automated capture could not be taken. Every constraint in it still holds: the portal layouts still guard, `.env.local` still configures only the hosted project, and a future automated rail capture still needs its own authorization.

Plan §2 requires *"rail capture diffed against ≥3 in-scope frames"*. **It was not taken, and Phase 0 does not claim it.**

**Why.** The rail renders only inside `app/(portals)/*/layout.tsx`, each of which runs `requirePortalAccess` **before any child renders**. That needs a real session, therefore a reachable governed database. In this clone:

- **`.env.local` configures the HOSTED dev project only** — verified this run without printing any value: it references `poblcfbxxzgarclchzkx`, references **no** local Supabase, and references the frozen `zjukuffiuzkbiblmnuwl` **not at all**. Driving an authenticated surface would therefore contact a **hosted** backend, which is a `CLAUDE.md` §12 stop-and-ask that this batch's authorization does not carry and that §15.11 makes non-inheritable.
- The local Docker stack still carries the **demonstration** `project_id` (`supabase_db_best-coach-mvp`), so `supabase status` refuses under this clone's `best-coach-dev`; `B-STAGE3-2` and the recorded `project_id` fallout are both **carry, do not fix**.

**What was done instead, and its limits.** The frame side is fully measured (§1); the build side is verified by source-to-token resolution, a clean production build, and three suites that read the **real** navigation table rather than a restatement (§5). The brand lockup — a Phase 0 artefact — **is** capture-verified, because it renders on the login surfaces Phases 1–3 captured.

**What is therefore unproven:** the rail's rendered geometry, its hover/focus treatment in a live browser, and its responsive collapse. **`NOT-RUN` is not `PASS`.**

---

## 7. Carried, unresolved, and recorded — not swept up

| Item | Class | Disposition |
|---|---|---|
| Academy wordmark and the *"Where Confident Leaders Are Made"* tagline | **Recorded asset dependency** | ⛔ **MUST NOT be classified `TRUE-DRIFT`** (plan §2, amendment 5). No approved asset exists; drawing a mark, setting the tagline as text, or substituting any other asset would **invent an approved asset** — a §12 stop-and-ask and a plan failure. The approved in-repo mark stands. **Operator-owned** |
| Rail wordmark reads **`B.E.S.T. Coach`**; the frame reads **`iSpeak`** | **Same recorded asset dependency** | Not treated as drift. Plan §2 already adjudicates it — *"the approved in-repo mark stands"*. `iSpeak Academy` is the seeded centre display name (§6.1), not an approved product wordmark, and swapping the product name for it is a brand decision no phase may take |
| Sign-out label: build **`Sign out`**, frame **`Logout`** | ✅ **RULED 2026-08-10 — `TRUE-DRIFT`, DELIBERATELY NOT APPLIED. CLOSED, not carried.** | **Operator ruling: the judgement recorded here stands and the label stays `Sign out`.** Reason, unchanged: two **accepted** proofs pin the exact string as the way they locate the production control — `sign-out-terminates-session.mjs` S-1 (`/>` → `Sign out` → `<` inside the form) and `prove-disposable-app.mjs` G-22 (refuses unless the control it clicked reports `Sign out`). Renaming the label would **retarget accepted evidence to make a caption match**, which is the wrong trade for a word. ⚠️ **This is a ruled divergence now, not an open item** — a later phase must not "resolve" it toward the frame, and the divergence is recorded rather than silently dropped (plan §5.2 rule 8) |
| The identity cluster sits on its own row **above** the page title; the frame puts it on the **same baseline** as the title | **`TRUE-DRIFT`, UNRESOLVED — out of Phase 0's owned paths** | The page title is rendered by **each screen's** component, not the shell. Aligning them requires touching every screen and would collide with Phases 4–12. Bounded coverage, declared |
| The frame's header **search field** | Not chrome | Screen-specific (Schedule); belongs to Phase 4 |
| The `lg:hidden` mobile header | **Required addition** | The frames draw no mobile variant; responsive operability is required (persona §3.5, `GLOBAL_UI_RULES`). Retained, and it now shares the single active-item derivation |
| `design-foundation.assertions.ts` | **NOT-RUN** | No runner — a **pre-existing** condition recorded in `BUILD_NOTES.md`, not introduced here: its relative extensionless import does not resolve under Node ESM. Its Phase 0-relevant invariant was measured directly instead (§3). Fixing the runner is outside a presentation reconciliation |

**Nothing above was classified `NEW-QUESTION`.** Each is either already adjudicated by the plan, or a bounded scope declaration.
