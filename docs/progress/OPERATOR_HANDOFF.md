# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> ⛔ **NOT A TRACKER · NOT AUTHORITY · DERIVED.** Every line is reproduced or mechanically
> reduced from `STATUS.md`, `BUILD_NOTES.md`, `PORTAL_COMPLETION_PLAN.md`, `git`, or a live
> measurement. **Where this and `STATUS.md` disagree, `STATUS.md` WINS and this file is STALE.**
> Written at every stop and **OVERWRITTEN, never appended** (`FINAL_MVP_G06_GROUNDING_RULING.md` §H-8).

**Regenerated:** 2026-08-13, after your back-affordance ruling. **All of it executed.**
⏸ Held for your re-walk.

---

## ⚠️ ONE THING I NEED FROM YOU — YOU OFFERED IT, AND IT IS NOW

**Please clear the `next dev` server on `:3000`.** Both `prove:stage2-routes` **and**
`prove:stage3-authenticated` serve in `mode: 'dev'`, and Next 16 permits **one dev server per
directory**. ⛔ **I have not killed it** — it is your walk server. Every other suite is green;
these two are `NOT-RUN` purely on the lock.

---

## ⛔ FRESHNESS REPORT (`CLAUDE.md` §15.8.1) — re-verified, not carried

| Carried claim | Method | Result |
|---|---|---|
| *"No frame draws a back affordance — HELD for a ruling"* | your ruling | ⛔ **LAPSED — RULED AND BUILT.** An Operator addition on usability grounds, cited as such in all three components |
| *"`13`'s breadcrumb is above in the frame, below in the build"* | your ruling | ⛔ **LAPSED — RULED `TRUE-DRIFT` AND FIXED** |
| *"`12` renders no breadcrumb"* | your ruling | ⛔ **LAPSED — RULED AND FIXED.** *"My acceptance of `12` was a walkthrough, not a measurement"* |
| `prove:stage2-routes` `NOT-RUN` on the dev lock | re-run | ✅ **STILL TRUE, AND NOW WIDER** — `prove:stage3-authenticated` is blocked by the same lock. Both need `:3000` cleared |
| `R-7` — `P2-6`'s `C-7` gate | read at HEAD | ✅ **STILL TRUE** — still the only open `C-7` item |
| `B-G06-DET-1` open | no verdict produced | ✅ **STILL TRUE** |
| §10 Phase 1 exit condition **(c)** unproven | ⚠️ **not re-measured** | ✅ **CARRIED, and stated as carried** |
| `09` refuses its canonical route (`C2C-007`) | read at HEAD | ✅ **STILL TRUE** |
| `test:continuity` · `test:exit-condition-b` blocked by `B-STAGE3-2` | not re-run | ✅ **CARRIED** |
| **136 mojibake sequences / 41 files** | not re-measured | ⚠️ **CARRIED AS UNREPRODUCED** |
| `main` untouched | `git ls-remote` | ✅ **STILL TRUE** — `5eb84bc` |

---

## ✅ THE BACK AFFORDANCE — extracted, not invented

**The control I reused:** `trainer-roster`'s **"Back to Schedule"** and `trainer-assessment`'s
**"Back to Student Roster"** — a `Link` in the page header's right slot, `bg-brand-100`
`text-brand-800`, `rounded-[11px]`, `min-h-11`, `chevronLeft` icon, `Back to <target>` label.

⚠️ **Their class strings were BYTE-IDENTICAL**, compared programmatically before anything moved
— which is what makes re-pointing both **provably zero visual change** rather than a hope.
Extracted to **`components/ui/back-link.tsx`**; both originals now call it. ▶ A shared component
with the originals left inline would have made **four** definitions of one control.

⛔ **`trainer-draft-generation` is deliberately NOT re-pointed and is reported, not normalised.**
It carries a **variant** (`rounded-field`, `text-body`, `font-bold`), and changing it would alter
a **Part 1** screen's appearance. That needs its own ruling.

| Screen | Target | Label |
|---|---|---|
| `13` | `12` | Back to Classes |
| `26` | `12` | Back to Classes |
| `27` | **`13`** | **Back to Class Overview** — the class it edits, and the only inbound route to `27` |

⛔ **Cited in all three components as an OPERATOR ADDITION ON USABILITY GROUNDS, NOT A FRAME
MATCH**, with your reasoning quoted, so a later visual pass does not remove it for fidelity.
⛔ **The breadcrumb is neither removed nor duplicated.**

## ✅ THE TWO BREADCRUMB DRIFTS — both fixed

* **`13`** — moved **ABOVE** the title, at the frame's `11.50px` with `gap: 3px`.
  ⚠️ **`26` and `27` were left alone**: their frames genuinely draw it **below**, at `12.50px`.
  "Fixing" them to match `13` would have been the inverse error.
* **`12`** — breadcrumb `Management / Classes` added above the title.

Both carried by a new **`breadcrumb`** slot on `PageHeading`. ⚠️ A **second** above-title slot,
deliberately not `eyebrow`: that one is an uppercase brand-coloured **label** with four live
consumers; this is a muted navigational **path** carrying a link.

---

## ⛔ `F-01b` RECURRED, AND IS NOW MECHANICAL — AND IT PAID FOR ITSELF IMMEDIATELY

**Stated plainly, as you asked.** `app/globals.css` **already carried a full paragraph** naming
this cascade trap, explaining that Tailwind emits utilities into `@layer utilities`, that an
unlayered rule outranks them, and that `.auth-field` / `.notes-field` were the remedy.
**The next two controls were still written with utilities.** ▶ Prose in the very file being
edited did not prevent the defect it described.

✅ **`SC-6`** fails any element whose class string names `form-field` beside a `bg-*`, `p*-`
**or `border-*`** utility, and the message names the remedy so the fix is never a guess.
⚠️ **Border is included though your ruling said *"background or padding"*** — `.form-field`
declares all three shorthands, and naming two would leave the third to recur.

**It found two more live losses on its first run**, on the same search control, neither visible
to a DOM proof nor caught by your walk:

| | Frame draws | Rendered before | Now |
|---|---|---|---|
| fill | `white` | **`rgb(244, 245, 249)`** — `bg-surface` lost | `rgb(255, 255, 255)` |
| hairline | `1px #EDEFF4` | **`rgba(0, 0, 0, 0)`** — `border-line` lost | `rgb(237, 239, 245)` |

## ⛔ COMMENT-STRIPPING IS NOW STANDING, NOT PER-SUITE

One shared `stripComments()`, imported, never copied. ▶ **The third instance is the memorable
one:** the raw-`<select>` scan reported **eight** offenders, of which **three were COMMENTS** —
including **my own sentence explaining that a `<select>` would have to be invented**. The
detector matched the prose in which the thing was explained.

**A fifth tooling defect this stretch**, caught by reading the result: a shell heredoc ate a
backticked comment through command substitution, leaving `// ⚠️ , not : the Operator ruled` in a
proof file. The **pin** was correct; only its explanation was destroyed. Repaired.

---

## Suites at this boundary, by exit code

| Suite | Result |
|---|---|
| `prove:shared-controls` | ✅ **exit 0 — 11 PASS · 0 FAIL** |
| `prove:artefact-read` | ✅ **exit 0 — 30 PASS**; `12`/`13` now also cite `11.50px` and `3px` |
| `p2-1` · `-composed` · `p2-2-create` · `p2-2b` · `p2-3` · `p2-4` · `prove:hero-all` · `test:integration` · `test:g06-grounding` · `test:runtime-profile` · `prove:encoding` · `prove:no-secrets` · `tsc` · `eslint` · `next build` | ✅ **all 0** |
| `prove:stage2-routes` · `prove:stage3-authenticated` | ⛔ **BOTH `NOT-RUN`** — the `:3000` dev lock. **Not killed.** Needed now |
| `test:continuity` · `test:exit-condition-b` | ⛔ **`NOT-RUN`** — `B-STAGE3-2` |
| **VISUAL acceptance** | ⛔ Operator-set only. Not claimed |

---

## Next permitted action

⏸ **You clear `:3000`; I run the two dev-mode suites; you re-walk all four.** Then **`P2-5`
(`25` Management Schedule)** — a calendar **projection**, gated by `GC-13`: no `Showcase`, no
duplicated event record (`A-016`).

⛔ **Carried by nothing above:** any hosted or billable action · a fixture reload · editing
ratified authority · a push to `main` · public deployment · human testing · final submission ·
**the mojibake repair run** · **any query against the demonstration stack on 543xx** · and
**killing the running `next dev` server**.
