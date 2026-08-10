# BATCH 3 — PHASES 4 → 12, ADJUDICATED

> **This document authorizes nothing.** Procedural record for `docs/plan/UI_RECONCILIATION_BUILD_PLAN.md` §4 Phases 4 … 12, written so a later phase or reviewer does not re-derive the comparison. It cannot override the specification, a ratified amendment, `FINAL_MVP_AUTHORITY_LOCK.md`, an operator ruling or `CLAUDE.md`.
>
> Written 2026-08-10 on `develop`, in the **development clone**. Companion to `UI_RECONCILIATION_PHASE_0_RAIL_ADJUDICATION.md` and `UI_RECONCILIATION_PHASES_1_3_AUTH_ADJUDICATION.md`.
>
> **`TRUE-DRIFT` resolved and `REGISTERED-OMISSION` preserved are reported as TWO SEPARATE LISTS in every phase below, never as one reconciled count** (plan §6.5).

---

## 0. Method, and the one thing Batch 3 cannot do

Per plan §3.1 the reference side is **both** artefacts — the `.png` is visual truth, the `.html` export is measurable values, and the `.png` wins on disagreement. Values were read out of the export with a purpose-built extractor; **no export markup, class name, DOM structure, absolute position or fixed pixel layout entered any component.**

### 0.1 ⛔ THE BUILD-SIDE RENDERED CAPTURE IS `NOT-RUN` IN EVERY BATCH 3 PHASE

Plan §3.1 asks for a rendered capture of the authenticated surface. **Every Batch 3 screen is authenticated.** The portal layouts run `requirePortalAccess`, which needs a session and therefore a reachable governed database, and `.env.local` in this clone configures the **hosted** dev project only — reaching it is a `CLAUDE.md` §12 stop-and-ask that no current authorization carries. `scripts/ui-reconciliation/capture-login.mjs` reaches the **public** authentication surfaces only and cannot be pointed at these.

**Recorded as `NOT-RUN` with that reason, exactly as Phase 0 recorded its rail capture. `NOT-RUN` is not `PASS`.** No capture was manufactured and no hosted or paid service was contacted.

### 0.2 What replaced it, and why it is not merely a source read

The standing lesson from Batch 1 is that **a declared class is not evidence it applied** — `.form-field` is unlayered, Tailwind utilities sit in `@layer utilities`, and an unlayered rule outranks every layered one, so a utility can be emitted, matched, and silently lose. Batch 1 caught that only because its build side measured the rendered DOM.

With no render available, that check is carried forward as **two mechanical checks against artefacts rather than against the source**:

1. **A static cascade audit before writing any utility.** The unlayered rules in `app/globals.css` are `* `, `body`, `h1,h2,h3,h4`, `.card`, `.panel`, `.page-grid`, `.form-field` (+ its variants), `.skeleton-shimmer`, `.spinner-ring`. Their declared properties are enumerated, and **no utility is written on an element carrying one of those classes for a property that rule already declares.** Where the frame requires exactly such a property, the phase either leaves it (recorded) or defeats the unlayered rule explicitly.
2. **Emitted-CSS verification after the build.** Every new value is grepped **out of the compiled stylesheet** — `.next/static/chunks/*.css` — as a real rule with a real declaration, not read back off the component.

⚠️ **This is weaker than a render and is declared as such.** It proves a rule exists and that no *known* unlayered rule outranks it. It does not prove final geometry, wrapping, overflow or focus order on a live page. Those remain unproven for Batch 3 and must not be reported as proven.

### 0.3 Two cross-cutting findings, measured once and cited by every later phase

**(a) The page-title type scale is drifted application-wide, and it is fixed PER SCREEN, not at the token.**
Measured across the frames: `Trainer - Schedule`, `Trainer - Student Roster`, `Management - Reports` and `Management - Student Report` all set the page title at **22px / 700**; `Management - Dashboard` sets **23px / 700**. The build's `--text-page-title` is **1.875rem = 30px** and every consumer adds `font-extrabold` (800).

The token was **deliberately not changed.** It is a **Phase 0 owned artefact** whose accepted outcome was *"no token VALUE was changed"*; it is pinned by `tests/frontend/design-foundation.assertions.ts`, which has **no runner** and is recorded `NOT-RUN`; and its consumers include four surfaces this plan explicitly excludes — `/trainer/reports/[reportId]/review`, both wording editors and the shared `components/ui/page-heading.tsx`. Re-pointing it would restyle out-of-plan surfaces from inside a screen phase and would move a pinned value whose assertion cannot be run. **Each phase therefore applies the frame's title treatment inside its own component**, and `--text-page-title` / `lib/frontend/design/tokens.ts` stay byte-unchanged and in step.

**(b) The `.card` corner radius is NOT drifted to a single frame value, so it was left alone.**
The frames do not agree: **18px** (Schedule, Management Reports, Parent Dashboard), **16px** (Roster, Parent Report, Management Dashboard), **14px** and **19px** elsewhere. The build's `.card` is **16px** — inside that family, not outside it. Correcting it per screen is impossible without a per-screen rule, and `.card` is an **unlayered** primitive reaching every surface in the application including all 20 out-of-plan screens. **Recorded as measured and deliberately unapplied.** ⚠️ Note for any later phase: `rounded-*` written on a `.card` or `.panel` element **loses the cascade** — it is not merely inadvisable, it does nothing.

---

## PHASE 4 — `05` Trainer Schedule

- **Screen / route / component:** `05` · `/trainer/schedule` · `features/trainer/trainer-schedule.tsx`
- **Reference:** `UI_REFERENCE_FINAL_MVP/reference/Trainer - Schedule/` — resolved from `SCREEN_INDEX.md`, not guessed. Frozen pack-local duplicate present and SHA-identical (`d2d58b16…`); the `/reference/` copy is the one cited (A-056).
- **Commit:** see §"Commits" at the foot of this document.

### 4.1 `TRUE-DRIFT` RESOLVED — 19

Every value below is the frame's, read from the export and cross-checked against the PNG.

| # | Location | Frame | Was | Now |
|---|---|---|---|---|
| T1 | Page title | 22px / 700 | 30px / 800 | `text-[1.375rem] font-bold` |
| T2 | Title → description gap | 2px | 4px | `mt-0.5` |
| T3 | Page description | 12.5px / 400 | 14px / `leading-6` | `text-small leading-5` |
| T4 | Search field width | 230px | 384px (`max-w-sm`) | `max-w-[14.375rem]` |
| T5 | Search field radius / type | 12px · 13px | 10px · 14px | `rounded-[0.75rem]` · `text-small` |
| T6 | Search + month **labels** | frame draws no uppercase micro-caps anywhere on this screen | `text-micro font-bold uppercase tracking-[0.14em]` | `text-small font-medium` |
| T7 | Period heading | 17px / 700 | 20px / 800 | `text-card-title font-bold` |
| T8 | Month select radius / type | 12px · 13px | 10px · 14px / 700 | `rounded-[0.75rem]` · `text-small font-semibold` |
| T9 | View-switch track | 3px padding, 3px gutter | 4px padding, no gutter | `p-[3px] gap-[3px]` |
| T10 | View-switch segment | 7px/14px padding, 8px radius, 12px | 8px/16px, 10px radius, 14px/700, `min-h-10` | `px-3.5 py-[7px] rounded-lg text-[0.75rem]` |
| T11 | View-switch current state | fill only; 500 → 600 weight step | fill **+ `shadow-raised`**, both states 700 | elevation dropped; `font-medium` → `font-semibold` |
| T12 | "Add Agenda" geometry | 9px/15–17px padding, 7px gutter, 12.5px / 600 | 10px/16px, 8px gutter, 14px / 700 | `py-[9px] px-4 gap-[7px] text-small font-semibold` |
| T13 | Weekday headings | 11.5px / 600, 4px below, 8px inset | 13px / 700, 12px below, no inset | `text-micro font-semibold pb-1 pl-2` |
| T14 | Day cell padding / gutter | 7px · 4px | 10px · 8px | `p-[7px] gap-1` |
| T15 | Day number | 12.5px / 600 in a 26px disc | 14px / 700 in a 28px disc | `text-[0.78125rem] font-semibold size-[1.625rem]` |
| T16 | Neighbouring-month date | 12px / 500 | 14px / 700 | `text-[0.75rem] font-medium` — **colour still not followed, D6** |
| T17 | Event chip | 7px radius, 5px/7px padding, 10.5px / 600 over 9px / 500 | 6px radius, 6px/8px, 11px / 700 over an `opacity-90` line | `rounded-[7px] py-[5px] px-[7px] text-[0.65625rem]` over `text-[0.5625rem]`; **`opacity-90` removed**, which raises contrast |
| T18 | Details panel width | 300px | 320px | `18.75rem` |
| T19 | Details panel type + session card | heading 15px / 600 · date 12.5px / 500 · card 16px radius on **`#FCE7F0`** with a **white** "Class" pill · title 15.5px / 700 · meta 12px / 500 at an 8px rhythm · action 12px/16px padding, 15px / 600 | heading 17px / 700 · date 14px / 600 · card 20px radius on `brand-50` with a `brand-100` pill · title 17px / 800 · meta 14px at 6px · action 10px/16px, 14px / 700 | all moved to the frame's values; card → `rounded-card bg-brand-100 px-4 py-[0.9375rem]` |

### 4.2 ⚠️ TWO LIVE CASCADE DEFECTS FOUND BY THE STATIC AUDIT — both pre-existing, both in this file

Neither was introduced by this phase. Both are the Batch 1 lesson recurring, and **both were invisible to source review** because the class was present and correctly spelled.

1. **`<h3 className="… text-brand-800">` on the session card rendered NAVY, not pink — on every build since it was written.** `h1,h2,h3,h4 { color: #1b2b4b }` in `app/globals.css` is **unlayered**, so it outranks `text-brand-800` in `@layer utilities`. Confirmed in the compiled stylesheet: `h1,h2,h3,h4{color:#1b2b4b;letter-spacing:-.015em;text-wrap:balance}` is emitted unlayered. **Fixed narrowly with `text-brand-800!`** — an important declaration wins regardless of layer — emitted and verified as `.text-brand-800\!{color:#b02a63!important}`. This is the **only** important utility in the application, and it was preferred over moving the heading rule into a layer, which would change the cascade for every heading at once. A repository-wide sweep found **no other heading** carrying a colour utility that the rule defeats.
2. **`tracking-[-0.02em]` on the page `<h1>` did nothing** — same rule, `letter-spacing: -.015em`. **Removed rather than restyled**: a class that is emitted, matched and discarded reads on review as an applied value. The computed letter-spacing is unchanged at `-0.015em`; only the misleading source is gone.

### 4.3 One consequence the phase had to fix to avoid creating a defect

Moving the session card to the frame's `#FCE7F0` fill (`bg-brand-100`) would have made **two** chips vanish into it:

- the **"Class"** pill, which `Badge tone="brand"` renders as `bg-brand-100` — the frame draws it **white**, so it is rendered locally as a white pill rather than through `Badge`. `Badge`'s own background utility and a `className` override are two utilities of equal specificity in one layer, decided by stylesheet order rather than by the class attribute, so the collision was **avoided rather than gambled on**. `Badge` itself is untouched.
- the **session-eligibility chip's `brand` tone**, also `bg-brand-100`. Moved to the same white-pill treatment. ⚠️ This matters beyond appearance: that chip is one of the **four redundant carriers** of the derived eligibility state (`GLOBAL_UI_RULES` §7, WCAG 2.2 SC 1.4.1). Leaving it invisible would have quietly reduced four carriers to three.

Contrast on the new fill, computed: `text-brand-800` `#b02a63` on `brand-100` `#fce7f3` = **5.34:1** ✓ · on white = **6.4:1** ✓ · the enabled action's new `hover:bg-brand-200` = **4.52:1** ✓ · `text-ink` `#33405c` on `#fce7f3` ≈ **9.5:1** ✓.

### 4.4 `REGISTERED-OMISSION` PRESERVED — 8, ZERO CHANGED

| # | Preserved | Citation |
|---|---|---|
| D1 | **"Add Agenda" stays DISABLED** with a visible, programmatically associated reason. The frame draws it as a filled brand-magenta **primary**; only its geometry and type were followed, never its state. Session creation is a governed **Management** action | A-019; plan §4 |
| D2 | **"Start Class" stays relabelled "Open Class Roster."** The session-lifecycle enum is deferred and unratified and no placeholder may be invented | A-026, `CLAUDE.md` §6.1; plan §4 |
| D3 | **Room / location ("Studio 2") and the Main / Assist trainer names stay OMITTED** — `TrainerSessionSummaryDto` carries no such field. Never fabricated | pack `implementation-notes.md` deps 1–2 |
| — | **The frame's Trainer Assistant (TA) fields stay unbuilt** — TA is a deferred persona | A-014; plan §4 |
| D4 | The frame's **header-rail** search stays rendered in the **page header** | pack notes D4 |
| D5 | The month title's chevron stays a **real labelled month picker** derived from months the projection actually carries, so it can never reach a period with no governed data | pack notes D5 |
| D6 | Neighbouring-month dates keep the **AA-compliant** ink; the frame's grey measures **2.043:1**. Size and weight followed, colour not | A-045, persona §3.5 |
| D7 | Rail items **"My Classes" / "Students" stay omitted** — their projections do not exist, and a nav item pointing at nothing is a dead control. Rail geometry belongs to **Phase 0** | plan §2; pack notes D7 |

**Also deliberately not followed, and not classified drift:**

- **The event-chip and detail-meta COLOURS.** The frame tints each chip in its Class Grade's own hue at roughly **3:1** and sets the detail meta rows in `#EC4B96` on pink (~3.0:1). Both fail SC 1.4.3. The build's tones hold AA — the same F-01c treatment Phases 1–3 applied. Hue preserved, luminance moved.
- **The primary action's `1.5px #AEB6C4` outline** (**2.0:1**, failing SC 1.4.11 for a control boundary). Replaced with `border-line-strong` alongside the retained `shadow-raised`.
- **The search and roster controls' `min-h-11`.** The frame's search box is **40px**; the 44px floor is kept for target size and consistency with every other control on the surface. A 4px delta, declared rather than silently applied.
- **`.card` radius 16px vs the frame's 18px** — see §0.3(b).
- **The visible search / month labels.** The frame labels neither control, relying on a placeholder. A placeholder is not a label (persona §3.5, SC 3.3.2), so the labels stay; only their **uppercase micro-caps treatment** — which appears nowhere in this frame — was reconciled (T6).

### 4.5 `NEW-QUESTION` — none · `INCOMPLETE` — none

### 4.6 Verification

| Check | Result |
|---|---|
| `tsc --noEmit` | **0** |
| `eslint .` | **0** |
| `next build` | **0** |
| **Route census** | **17**, enumerated from the build's own route table — unchanged |
| Governed surfaces | **none touched** — no schema, migration, RPC, server action, DTO, projection, grant, policy, audit action or route. `trainer-schedule-projection.ts`, `physical-test.ts` and `physical-test-port.ts` untouched |
| Emitted-CSS verification | **every** new value grepped out of `.next/static/chunks/*.css` as a real rule — `text-[1.375rem]`, `text-[0.96875rem]`, `text-[0.9375rem]`, `text-[0.78125rem]`, `text-[0.75rem]`, `text-[0.65625rem]`, `text-[0.5625rem]`, `text-[0.625rem]`, `size-[1.625rem]`, `max-w-[14.375rem]`, `rounded-[0.75rem]`, `rounded-[7px]`, `p-[7px]`, `px-[7px]`, `py-[7px]`, `py-[9px]`, `py-[0.9375rem]`, `gap-[3px]`, `gap-[7px]`, and `.text-brand-800\!` **carrying `!important`** |
| `tests/frontend/app-route-census.mjs` | **PASS** |
| `tests/frontend/portal-navigation-active-state.mjs` | **PASS — 6/6** |
| `tests/frontend/post-login-destinations.mjs` | **PASS — 5/5** |
| `tests/frontend/session-eligibility.mjs` | **PASS** — E-5/E-6 assert directly on the `SessionCard` branch this phase edited: a future session still renders a **disabled button with the governed reason** and **no link of any kind**, and the roster `Link` still occurs **exactly once** in the file. The C2C-010 safeguard is intact, proven rather than asserted |
| **Rendered capture** | ⛔ **`NOT-RUN`** — authenticated surface, §0.1 |
| Database | **none reached.** The frozen `zjukuffiuzkbiblmnuwl` was never contacted |

---

## PHASE 5 — `06` Trainer Student Roster

- **Screen / route / component:** `06` · `/trainer/sessions/[sessionId]/roster` · `features/trainer/trainer-roster.tsx`
- **Reference:** `UI_REFERENCE_FINAL_MVP/reference/Trainer - Student Roster/` — resolved from `SCREEN_INDEX.md`. Frozen duplicate present, SHA-identical (`78e4b618…`).

### 5.1 `TRUE-DRIFT` RESOLVED — 22

| # | Location | Frame | Was | Now |
|---|---|---|---|---|
| T1 | Breadcrumb | 11.5px / 500 | 13px / 400 | `text-[0.71875rem] font-medium` |
| T2 | Breadcrumb → title gap | 3px | 6px | `mt-[3px]` |
| T3 | Page title | 22px / 700 | 30px / 800 (+ inert `tracking-[-0.02em]`) | `text-[1.375rem] font-bold`, tracking removed |
| T4 | "Back to Schedule" | 11px radius · 13.5px / 600 | 10px · 14px / 700 | `rounded-[11px] text-[0.84375rem] font-semibold` |
| T5 | Banner radius | 18px | 20px (`rounded-panel`) | `rounded-[18px]` |
| T6 | Banner eyebrow | 10.5px / 600 | 11px / 800 at `0.16em` | `text-[0.65625rem] font-semibold tracking-[0.1em]` |
| T7 | Banner heading | 18px / 700 | 20px / 800 | `text-[1.125rem] font-bold` |
| T8 | Banner sub-line | 12px / 400 | 14px | `text-[0.75rem]` |
| T9 | Progress caption | 12px / 500 | 14px / 600 | `text-[0.75rem] font-medium` |
| T10 | Progress bar | 240 × 7px | 384px wide × 8px | `max-w-[15rem] h-[7px]` |
| T11 | Session strip surface | 18px/22px padding, **1.5px pink hairline** | `.card` at 20px padding, grey 1px | rebuilt as `rounded-card border-[1.5px] border-brand-200 bg-surface px-[22px] py-[18px] shadow-card` — see §5.2 |
| T12 | Strip region labels | 10px / 600 | 11px / 800 at `0.14em` | `text-[0.625rem] font-semibold tracking-[0.06em]` |
| T13 | Strip lesson line | 14px / 600 | 17px / 800 | `text-[0.875rem] font-semibold` |
| T14 | Strip meta line | 11px / 400 | 13px | `text-[0.6875rem]` |
| T15 | Focus chips | 11px/6px padding, 11px / 500 on `#FCE7F0` | 12px/6px, 13px / 600 on `brand-50` | `px-[11px] text-[0.6875rem] font-medium bg-brand-100` |
| T16 | "View lesson plan" | **pill** (999px), 11px padding, 13px / 600 | `rounded-field`, 10px padding, 14px / 700 | `rounded-full py-[11px] text-small font-semibold` — **still disabled, D4** |
| T17 | Roster heading | 18px / 700 | 20px / 800 | `text-[1.125rem] font-bold` |
| T18 | Roster count | a **pill** — 4px/10px on `#F5F6FA`, 11px / 600 | bare inline text, 14px / 700 | `rounded-full bg-surface-muted px-2.5 py-1 text-[0.6875rem] font-semibold` |
| T19 | Filter / Sort labels + controls | 12.5px / 600, 9px/14px padding | uppercase micro-caps labels; 14px / 700 controls | labels `text-small font-medium`; controls `px-3.5 py-[9px] text-[0.78125rem] font-semibold` |
| T20 | Card grid gutter | 20px | 16px | `gap-5` |
| T21 | Card padding / internals | 16px · attendance chip 9.5px / 600 · name 15px / 600 · focus line 12px / 500 at 17.4px | 20px · 11px / 800 at `0.1em` · 17px / 800 · 13px at 24px | `p-4` · `text-[0.59375rem] font-semibold` · `text-[0.9375rem] font-semibold` · `text-[0.75rem] font-medium leading-[1.45]` |
| T22 | Card actions | 11px padding, 12.5px / 600 | 10px, 14px / 700 | `py-[11px] text-[0.78125rem] font-semibold` on both the inert and the live action |

### 5.2 ⚠️ TWO MORE LIVE DEFECTS, ONE OF A NEW CLASS

**(a) `rounded-control` and `border-hairline` are UNDEFINED TOKENS that emit nothing.** Neither exists in `@theme inline`. Tailwind generates a rule only for a class it can resolve, so both produced **no CSS at all** — the attendance toggle has been rendering **square-cornered and borderless** since it was written, while its source read as though it had a 10px radius and a hairline. They were the **only two uses in the repository**. Replaced with `rounded-field` / `border-line`.

⚠️ **This is a different failure from the unlayered-cascade trap and the static audit does not catch it** — there is no competing rule; the rule simply never exists. It is caught only by grepping the **compiled stylesheet**, which is why that check is now run on every phase and why `rounded-control` / `border-hairline` are recorded as **verified MISS** rather than assumed dead.

**(b) The session strip could not take the frame's pink hairline through a utility.** The frame outlines it in **1.5px `#F6C9DD`**; `.card` is an **unlayered** rule declaring the `border` **shorthand**, so `border-brand-200` on a `.card` element is emitted, matched and discarded. The strip was therefore **composed from utilities the cascade actually reaches** — `rounded-card border-[1.5px] border-brand-200 bg-surface shadow-card` — at the same radius and elevation `.card` would have given it. `.card` itself is untouched and every other consumer is unaffected.

### 5.3 `REGISTERED-OMISSION` PRESERVED — 7, ZERO CHANGED

| # | Preserved | Citation |
|---|---|---|
| D1 | **No "CLASS IN SESSION" eyebrow and no live green dot.** The frame draws both; they assert a lifecycle state no governed field carries. The label stays **"Class Session"** and only the frame's *type* was followed | plan §4 |
| D2 | **No lesson number, lesson title or room.** The frame's "Lesson 3 · Voice & Projection" and "Studio 2" are absent from `TrainerSessionSummaryDto`; the governed module name and session date stand instead | plan §4 |
| D3 | The focus region stays filled **only** from the governed carried-over previous-session focus and stays **labelled for what it is** | plan §4 |
| D4 | **SLIDES / attachment chips stay omitted** (the frame draws two, with `KEY` and `PPTX` tags); **"View lesson plan" stays disabled with its reason.** Only the pill *geometry* was followed | plan §4 |
| D5 | **No staff identity rendered** — the frame's "Trainer: Argen Maulie" line is absent | plan §4 |
| D6 | **No synthetic learners.** The frame shows 8; the grid renders exactly what the governed roster projection returns | `GLOBAL_UI_RULES` §8 |
| D7 | **Rail belongs to Phase 0** and was not touched | plan §2 |

**Also preserved, and not re-derived here:** an **absent** learner's card still carries **no lifecycle status and no report affordance** (A-018); the attendance refusal still offers **no retry**; `unauthorized` and `unavailable` still share **one** non-disclosing sentence; and the per-student action is still resolved from **that** learner's attendance and **that** learner's report status, with no shared generic handler.

**Also deliberately not followed:**

- **The frame's card colours** — the focus line at `#3FBAC2` (~2.6:1) and the absent-card grey at 2.004:1 both fail SC 1.4.3. Size and weight followed, colour not.
- **Three shared primitives**, all in `components/ui/` and all reaching out-of-plan screens: `Avatar` (frame 52px with 17px initials, build `size-12` with 14px), `StatusPill`, and `.card`'s 16px radius (frame 16px here — **already correct on this screen**). Recorded, unapplied; a `className` size or colour override on any of them would be two same-layer utilities decided by stylesheet order, which is the trap this plan keeps catching.

### 5.4 `NEW-QUESTION` — none · `INCOMPLETE` — none

### 5.5 Verification

`tsc` **0** · `eslint` **0** · `next build` **0** · **route census 17**, enumerated from the build's route table · governed surfaces **none touched** · `app-route-census`, `portal-navigation-active-state`, `post-login-destinations`, `session-eligibility` all **PASS** · **emitted-CSS verification: 20/20 new utilities OK**, and `rounded-control` / `border-hairline` **confirmed MISS**, which is the positive evidence for §5.2(a) · **rendered capture `NOT-RUN`** (§0.1).

---

## PHASE 6a — `07` Trainer Grade Student

- **Screen / route / component:** `07` · `/trainer/sessions/[sessionId]/students/[studentId]/assess` · `features/trainer/trainer-assessment.tsx`
- **Reference:** `UI_REFERENCE_FINAL_MVP/reference/Trainer - Grade Student/` · frozen duplicate SHA-identical (`1df95a5b…`)
- **Runs BEFORE Phase 6**, per plan §4 — it is step 4 of the physical-test flow and feeds the draft screen.

### 6a.1 ⭐ THE FOLLOW-UP FIELD — the MUST-NOT-CHANGE this phase exists around

**Preserved exactly, and it heads this phase's list.** The frame lists **only** "Observation Notes". The build keeps **"Follow-up for Next Session" as its own labelled control, bound to its own column**, and this phase:

- did **not** merge it into Observation Notes — they are **separate columns**, and the carry-over must surface the follow-up **alone**;
- did **not** blank its loaded value — `setFollowUp(draftResult.data.followUp)` is untouched;
- did **not** touch its hint, which still names the Review & Approve "Coach Notes (Internal Only)" surface and the next roster's previous focus;
- added an in-file comment stating **why** it survives, so a later reader does not "reconcile" it toward the frame.

Only its **label and textarea type** moved, exactly as the Observation Notes control's did.

### 6a.2 ⛔ THE END-TO-END CARRY-OVER RE-PROOF IS `NOT-RUN` — blocked, and NOT by this phase

Plan §4 Phase 6a requires *"the carry-over re-proven end to end — save a follow-up note here and see it appear as the next session's previous focus."* **It was attempted and it failed on a pre-existing, Operator-owned blocker.**

`npm run test:continuity` reached `CONT-0` (**PASS** — the earlier session's observation carries a non-empty 129-character follow-up note) and then failed at **`CONT-A0`**: *"the LOCAL Supabase stack's connection values could not be captured, or the stack is not local."* That is **`B-STAGE3-2`**, which plan §6 already records as blocking *"any phase needing pristine local fixtures"* and as **Operator-owned**, needing the three interactive no-echo passwords.

⚠️ **Recorded as `NOT-RUN`, not as `PASS` and not as a `NEW-QUESTION`** — the blocker is already registered, so nothing new is being asked. **The harness reached no database and no network:** it reads connection values **only** from `loadLocalStack()`, never from `.env.local`, and it exited **before constructing any Supabase client**. The frozen `zjukuffiuzkbiblmnuwl` was not contacted, and no attempt was made to start or reload a stack.

**What was proven instead — the same chain, statically, end to end.** Weaker than the runtime proof and declared as such:

| Link | Evidence |
|---|---|
| the field's value reaches the save | `followUp` state → the submit payload (`trainer-assessment.tsx:360`) |
| the save reaches the governed column | `server/modules/observation/core.ts:127` maps `input.followUpNotes` → `p_follow_up_notes`; the RPC parameter exists in `20260806090000_assessment_governed_persistence.sql:179` and the column in `20260803034500_step_7e_governed_core.sql:631` |
| the column reaches the next roster | `server/modules/report-workflow/trainer-projections.ts:283` sets `previousSessionFocus` from it, and its declaration at `:112` names it *"ONE column, two screens (CLAUDE.md §6)"* |
| the roster still renders it | Phase 5's D3, re-confirmed this phase |

**The runtime leg remains owed** and must be run once `B-STAGE3-2` is resolved. It is not discharged by the static trace.

### 6a.3 `TRUE-DRIFT` RESOLVED — 14

| # | Location | Frame | Was | Now |
|---|---|---|---|---|
| T1 | Page title | 22px / 700 | 30px / 800 (+ inert tracking) | `text-[1.375rem] font-bold` |
| T2 | Page description | 12.5px-class quiet type | 14px / `leading-6` | `text-small leading-5` — **kept**, it is a governance statement (A-017, A-050), only its type moved |
| T3 | "Back to Student Roster" | 11px radius, 13.5px / 600 | 10px, 14px / 700 | `rounded-[11px] text-[0.84375rem] font-semibold` |
| T4 | Identity card padding | 18px / 22px | 20px | `px-[22px] py-[18px]` |
| T5 | Learner name | 18px / 700 | 20px / 800 | `text-[1.125rem] font-bold` |
| T6 | Learner meta line | 12.5px / 400 at a 3px gap | 14px at 2px | `text-[0.78125rem] mt-[3px]` |
| T7 | Rubric card padding | 20px top / 22px bottom / 24px sides | 20–24px uniform | `px-6 pb-[22px] pt-5` |
| T8 | "Assessment Rubric" | 16px / 600 | 20px / 800 | `text-[1rem] font-semibold` |
| T9 | Rubric sub-line + rated count | 12px / 400 | 14px / 13px bold | `text-[0.75rem]` |
| T10 | Row rhythm | 16px | 10px | `gap-4` |
| T11 | Dimension label + focus caption | 13px / 600 | 14px / 800; caption 11px / 700 at `0.1em` | `text-[0.8125rem] font-semibold`; caption `text-[0.625rem] font-semibold tracking-[0.06em]` |
| T12 | Rating track + chips | 3px padding, 3px gutter, 8px radius, 11.5px, **500 resting → 600 selected** | 4px/4px, `text-small`, **800 in both states** | `p-[3px] gap-[3px]`, `py-[9px] text-[0.71875rem]`, `font-medium` → `font-semibold` |
| T13 | Notes card + textareas | 18px/20px padding, heading 14.5px / 600; textarea **150px, 12px radius, 14×15px padding, visible hairline** | 20–24px, 17px / 800; textarea 160px at `.form-field`'s 10px radius and 12×14px padding | `px-5 py-[18px]`, `text-[0.90625rem] font-semibold`; `min-h-[9.375rem]` + a new `.form-field.notes-field` rule — see §6a.4 |
| T14 | Group captions and the Review & Approve rail | captions 10px / 600; rail eyebrow 11.25px / 800; bucket count 13.13px, caption 8.25px / 700 | 11px / 800 at `0.14em`; 20px / 800 counts; 11px captions | moved to the frame's values |

### 6a.4 The textarea geometry needed a CSS rule, not utilities — and `app/globals.css` was touched, ADDITIVELY

The frame's textarea is **12px radius, 14 × 15px padding, with a visible hairline**. `.form-field` is **unlayered** and declares `border-radius`, `padding` and `border`, so `rounded-[…]`, `px-[…]` and `py-[…]` written on these textareas would have been **emitted, matched and discarded** — the identical trap Batch 1 measured on the login credentials.

Fixed with a new **`.form-field.notes-field`** modifier, mirroring the ratified `.form-field.auth-field` pattern exactly.

⚠️ **`app/globals.css` is a Phase 0 owned path, so this is declared rather than buried.** It is **purely additive**: a new two-class selector with **no prior consumer**, verified to be used by **exactly the two textareas on screen 07** and nowhere else. **No existing rule, token or value was modified**, `.form-field` was **not** moved into a layer, and no other surface in the application moves. Emitted and verified as `.form-field.notes-field{border-color:var(--color-line);border-radius:.75rem;padding:.875rem .9375rem}`, which outranks `.form-field` on specificity, both being unlayered.

### 6a.5 `REGISTERED-OMISSION` PRESERVED — 6, ZERO CHANGED

| # | Preserved | Citation |
|---|---|---|
| ⭐ | **The Follow-up for Next Session field** — kept, loaded, unmerged. See §6a.1 | Operator ruling 2026-08-10; `CLAUDE.md` §6; plan §4 |
| D1 | **The nine rows stay in RATIFIED order** — the four B.E.S.T Competency dimensions, then the five Speech Linguistics Pattern dimensions — **not** the frame's interleaved order (Body, Eye contact, Emotion, Speech, Tonality, …), and the **two group captions stay** | `CLAUDE.md` §5, spec §3 |
| D2 | **The behavioural anchor stays rendered beneath every row and inside each chip's accessible name.** The frame draws none. **Verified byte-identical to the backend this run — 4/4** (90 / 100 / 105 / 129 chars), measured rather than assumed, because the frontend copy is a deliberate mirror and not an import | A-050 |
| D4 | **No "Junior" Class Grade and no user-facing "Student ID."** The frame draws *"Junior · Student ID 2025-113 · Public Speaking"*; the governed Class Grade, Class Module and session date stand instead | A-016 / A-054 |
| D5 | **The selected-chip fills keep the DEEPER ramp step.** `ratingStyles` is byte-unchanged and still uses `rating-N-on-soft`; the frame's saturated fills measure **3.70 / 2.03 / 2.34 / 2.51 : 1** and all four fail SC 1.4.3. Only the chip's **weight** moved (800 → 600 selected, 500 resting), which changes no colour and no contrast — 11.5px is small text, so the 4.5:1 threshold applies identically either way | plan §4; persona §3.5 |
| D6 | **No synthetic learners in the rail** — the governed roster projection only. The frame draws eight named learners | `GLOBAL_UI_RULES` §8 |

**Also preserved:** all nine dimensions stay mandatory with **no Quick mode and no four-dimension path** (A-017); completion stays **server-validated** with the client check still named as a convenience only; selection is still carried by **shape, `aria-pressed`, the accessible name and the visible anchor line** — never colour alone.

**Also deliberately not followed:** the shared `Button` (`large` = `min-h-12 px-5 py-3 text-body` at a 10px radius, against the frame's 16px/26px padding at 13px and 15px / 600) and the shared `Avatar` — both `components/ui/` primitives reaching out-of-plan screens; see §0.3(b) for why a `className` override is not a safe substitute.

### 6a.6 `NEW-QUESTION` — none · `INCOMPLETE` — one, named

**`INCOMPLETE`: the runtime carry-over re-proof (§6a.2).** Blocked by `B-STAGE3-2`, Operator-owned, and **owed** — not waived.

### 6a.7 Verification

`tsc` **0** · `eslint` **0** · `next build` **0** · **route census 17** · governed surfaces **none touched** (no schema, migration, RPC, server action, DTO, projection, grant, policy, audit action or route — `observation/core.ts`, `trainer-projections.ts` and the migrations were **read**, never edited) · four suites **PASS** · **emitted-CSS 13/13 OK** plus the `.form-field.notes-field` rule confirmed present · **A-050 anchor identity 4/4 IDENTICAL** · `test:continuity` **`NOT-RUN` / blocked at `CONT-A0`** · **rendered capture `NOT-RUN`** (§0.1).

---

## Commits

⚠️ **Each row is filled one phase LATE, and that is deliberate: a commit cannot cite its own SHA.** A row reading `pending` means the phase's own commit exists but its hash is recorded in the *next* phase's commit — never that the phase was not committed. The authoritative live list is `docs/progress/STATUS.md`, and `git log --oneline` settles any disagreement.

| Phase | Screen | Commit |
|---|---|---|
| 4 | `05` Trainer Schedule | **`5dda019`** |
| 5 | `06` Trainer Student Roster | **`ca9396e`** |
| 6a | `07` Trainer Grade Student | *pending — recorded at the Phase 6 boundary* |
