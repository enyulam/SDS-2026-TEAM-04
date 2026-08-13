# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> ⛔ **NOT A TRACKER · NOT AUTHORITY · DERIVED.** Every line is reproduced or mechanically
> reduced from `STATUS.md`, `BUILD_NOTES.md`, `PORTAL_COMPLETION_PLAN.md`, `git`, or a live
> measurement. **Where this and `STATUS.md` disagree, `STATUS.md` WINS and this file is STALE.**
> Written at every stop and **OVERWRITTEN, never appended** (`FINAL_MVP_G06_GROUNDING_RULING.md` §H-8).

**Regenerated:** 2026-08-13, after the hover defect. **All of it executed. Nothing is blocked.**
⏸ Held for your re-walk before `P2-5`.

---

## ⛔ FRESHNESS REPORT (`CLAUDE.md` §15.8.1) — re-verified at this commit, not carried

| Carried claim | Method | Result |
|---|---|---|
| *"`prove:stage2-routes` and `prove:stage3-authenticated` `NOT-RUN` on the `:3000` dev lock"* | **re-run** | ⛔ **LAPSED — YOU CLEARED IT. BOTH RUN, BOTH EXIT 0.** This was the last handoff's one open ask; it is discharged and must not be carried again |
| *"the chevron and search fixes are accepted"* | your re-walk | ⚠️ **PARTIALLY LAPSED** — the base chevron holds; **hover regressed** and is now fixed |
| *"`SC-6` catches the `F-01b` trap"* | re-measured | ⚠️ **WAS TRUE AND INSUFFICIENT.** It scanned class strings only; the defect was in a CSS state rule. Extended, plus two new legs |
| `R-7` — `P2-6`'s `C-7` gate | read at HEAD | ✅ **STILL TRUE** — still the only open `C-7` item |
| `B-G06-DET-1` open | no verdict produced | ✅ **STILL TRUE** |
| §10 Phase 1 exit condition **(c)** unproven | ⚠️ **not re-measured this run** | ✅ **CARRIED, and stated as carried** |
| `09` refuses its canonical route (`C2C-007`) | read at HEAD | ✅ **STILL TRUE** |
| `test:continuity` · `test:exit-condition-b` blocked by `B-STAGE3-2` | not re-run | ✅ **CARRIED** |
| **136 mojibake sequences / 41 files** | not re-measured | ⚠️ **CARRIED AS UNREPRODUCED** |
| `trainer-draft-generation`'s `BackLink` variant | unchanged | ✅ **STILL OPEN** — awaiting its own ruling |
| `main` untouched | `git ls-remote` | ✅ **STILL TRUE** — `5eb84bc` |

⚠️ **Two claims lapsed this run and both were corrected at source before this file was derived.**

---

## ⛔ THE DEFECT — MEASURED FIRST, EXPLAINED SECOND

`CSS.forcePseudoState` — DevTools' own *Force element state* — so the **browser** resolved the
cascade rather than a model of it in JavaScript.

| State | `background-repeat` · `-size` · `-position` | |
|---|---|---|
| rest | `no-repeat` · `18.4px` · `calc(100% - 12px) 50%` | ✅ |
| **`:hover`** | **`repeat` · `auto` · `0% 0%`** | ⛔ **REGRESSED** |
| `:focus` · `:disabled` · `[aria-invalid]` | `no-repeat` · `18.4px` · `calc(100% - 12px) 50%` | ✅ survived |

**Your reading of the shape was exactly right, and the arithmetic is why.**
`.form-field:hover:not(:disabled)` is **`(0,3,0)`** and beats `.form-field.select-field`'s
`(0,2,0)` unconditionally. The other three states are themselves `(0,2,0)` and lose to the
modifier **on source order alone** — the modifier sits later in the file.
▶ **Three of the four were saved by line ordering, not by design.**

✅ **FIXED AT THE ROOT.** The `background` SHORTHAND is gone from the base rule **and all four
state rules**, replaced by `background-color`. ⚠️ Chasing it with `.form-field.select-field:hover`
would have fixed **one** state and left the next state rule anyone adds to break it again.

**Provably safe for every consumer rather than assumed:** `SC-4` proves nothing else paints a
background image; `SC-6` proves nothing combines `.form-field` with a `bg-*`/`p*-`/`border-*`
utility. Nothing relied on the shorthand's resets.

---

## ⛔ THE MORE IMPORTANT HALF — the check that missed it

> *"If it only inspects base-state declarations, it will keep missing state variants."*

| Leg | Now measures | Its control |
|---|---|---|
| **`SC-6`** | class strings, **including variant prefixes** — `hover:bg-*`, `focus:p*-`, `disabled:border-*`, `focus-visible:*`, stacked | **`SC-6c`** plants **5** offenders, **2 of them state variants** — the plant you required |
| **`SC-9`** *(new)* | **`app/globals.css` itself** — no `.form-field` STATE rule may use the `background`/`padding`/`border` SHORTHAND | **`SC-9c`** plants the defect's own shape; the longhand state rule and the base rule beside it must **not** match |
| **`SC-9b`** *(new)* | no element carries **two** `.form-field` modifiers | **`SC-9bc`** plants a two-modifier element |
| **`SC-7`** ×4 | the chevron under **hover · focus · disabled · invalid** | **`SC-8c`** |
| **`SC-8`** | the search fill and hairline **under hover** | **`SC-8c`** |

⛔ **`SC-6` alone could never have caught this.** It scans **component class strings**; the defect
was in a **CSS state rule**, where no class string could reveal it. Widening it was necessary and
**not sufficient** — hence `SC-9`.

⚠️ **`SC-9` IS NARROWER THAN A BLANKET BAN, AND I WANT THAT ON THE RECORD.** A first cut barred
the shorthand everywhere and failed on two provably harmless rules: the base `.form-field` at
`(0,1,0)`, which **loses** to every modifier and is the value modifiers exist to override; and
`.form-field.notes-field`, a modifier declaring its **own** padding. A STATE rule is different in
kind — it co-applies with whatever modifier is present **and outranks it**.
⛔ **The exemption is measured, not trusted: `SC-9b` proves the two-modifier case cannot arise.**

---

## ⛔ A SIXTH INSTRUMENT DEFECT — AND THE FIRST GREEN RUN WAS ENTIRELY VACUOUS

The first post-fix run reported **`SC-7-hover` PASS** and **`SC-8` PASS**. **Both measured nothing.**

`.form-field` declares `transition: … background-color 160ms ease`, and `getComputedStyle`
returns the **currently animated** value — so a read taken immediately after forcing `:hover`
returns the value from **before** the hover. In the output that is **indistinguishable from
forcing that never applied**.

▶ **It also explains why the earlier run looked sound.** Before the root fix the hover rule used
the SHORTHAND, and repeat/size/position are **not** in the transition list — they snapped
instantly, so the tiling was measurable at once. **The moment the fix left only `background-color`
changing, every state read went silently stale.**

⛔ **`SC-8c` failed loudly**, on a bare `.form-field` whose hover tint is known:
`rgb(244,245,249)` → `rgb(244,245,249)`. After waiting out the transition:
`rgb(244,245,249)` → **`rgb(238,240,246)`**.

⚠️ **A state suite without a control proving the forcing applies is not a weaker measurement — it
is not a measurement at all**, and it would have shipped to you as a clean green run.

**A seventh, in the battery:** six scripts invoked as `prove:p2-*` all exited non-zero. **They are
named `prove:portal-p2-*`; nothing was failing.** A non-zero exit from a name that does not exist
reads exactly like a regression.

---

## ✅ YOUR SECOND QUESTION, ANSWERED BY MEASUREMENT

*"were `bg-surface` and `border-line` also lost in any state variant, or only at rest?"*

**Only at rest.** Under forced hover the **hairline survives** at `rgb(237, 239, 245)`. The fill
moves to `rgb(238, 240, 246)` — the product-wide `.form-field:hover` tint, **designed, not a loss**.

---

## Suites at this boundary, by exit code

| Suite | Result |
|---|---|
| `prove:shared-controls` | ✅ **exit 0 — 21 PASS · 0 FAIL** |
| `prove:stage2-routes` | ✅ **exit 0 — 17 checks** |
| `prove:stage3-authenticated` | ✅ **exit 0 — 34 PASS · 0 FAIL · 2 `NOT-RUN`** |
| `prove:artefact-read` · `prove:encoding` · `prove:no-secrets` | ✅ all 0 |
| `prove:portal-p2-1` · `-composed` · `p2-2-create` · `p2-2b` · `p2-3` · `p2-4` · `portal-34` · `portal-5-composed` | ✅ all 0 |
| `prove:hero-all` · `test:integration` · `test:g06-grounding` · `test:runtime-profile` | ✅ all 0 |
| `tsc` · `eslint` · `next build` | ✅ all 0 |
| `test:continuity` · `test:exit-condition-b` | ⛔ **`NOT-RUN`** — `B-STAGE3-2` |
| **VISUAL acceptance** | ⛔ Operator-set only. **Not claimed** |

⛔ **No migration. No schema change. Audit registry unmoved at 21.**

---

## Next permitted action

⏸ **You re-walk `12`, `13`, `26`, `27`.** Then **`P2-5` (`25` Management Schedule)** — a calendar
**projection**, gated by `GC-13`: no `Showcase`, no duplicated event record (`A-016`).

⛔ **Carried by nothing above:** any hosted or billable action · a fixture reload · editing
ratified authority · a push to `main` · public deployment · human testing · final submission ·
**the mojibake repair run** · **any query against the demonstration stack on 543xx** ·
`trainer-draft-generation`'s `BackLink` variant.
