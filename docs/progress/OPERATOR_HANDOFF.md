# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> ⛔ **NOT A TRACKER · NOT AUTHORITY · DERIVED.** Every line is reproduced or mechanically
> reduced from `STATUS.md`, `BUILD_NOTES.md`, `PORTAL_COMPLETION_PLAN.md`, `git`, or a live
> measurement. **Where this and `STATUS.md` disagree, `STATUS.md` WINS and this file is STALE.**
> Written at every stop and **OVERWRITTEN, never appended** (`FINAL_MVP_G06_GROUNDING_RULING.md` §H-8).

**Regenerated:** 2026-08-13, after your walkthrough. **Defects 1 and 2 fixed and measured;
defect 3 reported and HELD for your ruling.** ⏸ Nothing built for defect 3.

---

## ⛔ FRESHNESS REPORT (`CLAUDE.md` §15.8.1) — re-verified, not carried

| Carried claim | Method | Result |
|---|---|---|
| **VISUAL acceptance `NOT-RUN` on `12` · `13` · `26` · `27`** | your walkthrough | ⚠️ **PARTLY LAPSED, AND IT IS YOUR CALL, NOT MINE.** You walked all four: `12` **correct in full**, and every frame match on `13`/`26`/`27` confirmed. ⛔ I do **not** record any of them as visually accepted — `Accepted` is Operator-set only |
| *"`26`/`27` backend integration unproven by walk"* | your walkthrough | ⛔ **LAPSED** — you confirmed Level and Term persist correctly |
| `prove:stage2-routes` exits 0 | re-run twice | ⛔ **LAPSED — now `NOT-RUN`.** Next 16 allows ONE `next dev` per directory and one is running (**PID 24124, port 3000, started 04:51**). It appeared **between the passing battery and your walk**, so it is almost certainly your own walk server. ⛔ **NOT KILLED.** `next build` 0 and `next start` served the measurement suite — a lock, not a regression |
| `R-7` — `P2-6`'s `C-7` gate | read at HEAD | ✅ **STILL TRUE** — still the only open `C-7` item |
| `B-G06-DET-1` open | no verdict produced | ✅ **STILL TRUE** |
| §10 Phase 1 exit condition **(c)** unproven | ⚠️ **not re-measured** | ✅ **CARRIED, and stated as carried** |
| `09` refuses its canonical route (`C2C-007`) | read at HEAD | ✅ **STILL TRUE** |
| `test:continuity` · `test:exit-condition-b` blocked by `B-STAGE3-2` | not re-run | ✅ **CARRIED** |
| **136 mojibake sequences / 41 files** | not re-measured | ⚠️ **CARRIED AS UNREPRODUCED** |
| `main` untouched | `git ls-remote` | ✅ **STILL TRUE** — `5eb84bc` |

---

## ✅ DEFECT 1 — the chevron tiled. FIXED, AND DIAGNOSED BY MEASUREMENT

You named three possible causes. **The measurement discriminates them**, so this is not an
argument. `getComputedStyle` in headless Chrome, on the shipped markup, **before any change**:

```
background-repeat: repeat   ·  background-size: auto
background-position: 0% 0%  ·  appearance: none
```

▶ **`appearance: none` eliminates two of the three outright.** The reset DID take, and there is
no native chevron underneath. **The cause is the first: the background image TILES.**

**Why.** `.form-field` is **unlayered** and declares the `background` **SHORTHAND**, which resets
repeat, size and position. Tailwind emits its utilities into `@layer utilities`, and an unlayered
rule outranks every rule in every layer — so `bg-no-repeat`, `bg-[length:1.15rem]` and
`bg-[right_0.75rem_center]` were generated, matched and **silently lost**. Only the chevron
survived, because it is an **inline** style.

⚠️ **`app/globals.css` already documented this exact trap at `F-01b`**, with `.auth-field` and
`.notes-field` as its remedy. **Fixed at the shared control the same way: `.form-field.select-field`.**
⛔ Written as utilities on the element it would have looked correct in review and changed nothing.

**Measured after:** `no-repeat · 18.4px · calc(100% - 12px) 50% · appearance: none · padding-right: 40px`.

## ✅ DEFECT 2 — the magnifier did not clear. FIXED

Same trap, one line away. **Before:** `padding-inline-start: 14px` — the `.form-field` padding
shorthand — against an icon at `left: 14px`, `16px` wide. Text began **exactly where the icon
begins**. **After:** `40px`. Fixed at the shared control as `.form-field.search-field`.

## ⛔ NO OTHER SELECT CARRIES THE TREATMENT — measured

`SC-3` scans **85 sources** and asserts no select outside the shared control combines
`form-field` with `appearance-none`. **Five raw `<select>` elements legitimately exist elsewhere**
(`management-report-review`, `management-reports-queue`, `parent-reports-list`, `trainer-roster`,
`trainer-schedule`); each was read, none carries it. ⚠️ Routing them through the shared component
is a change to five screens **outside this authorization** and was **not** done.

---

## ⏸ DEFECT 3 — ANSWERED FROM THE `.png`, NOTHING BUILT

**Question: does the frame draw a dedicated back affordance, and in what position?**

## ⛔ NO. NOT ON ANY OF THE THREE.

| Screen | Header, as the `.png` draws it | Back control |
|---|---|---|
| **`13`** | breadcrumb `Classes / Junior · Public Speaking` at **`11.50px`**, **ABOVE** the `22px` title `Class Overview`; bell + `OH` identity on the right | ⛔ **NONE** |
| **`26`** | `22px` title `Add Class`, breadcrumb `Classes / Add Class` at **`12.50px`** **BELOW** it; bell + identity right | ⛔ **NONE** |
| **`27`** | `22px` title `Edit Class`, breadcrumb `Classes / Junior Public Speaking / Edit` at **`12.50px`** **BELOW** it; bell + identity right | ⛔ **NONE** |

**Corroboration, per artefact:**

* **`.png`** — the header band on all three holds a two-line title stack at the left and the
  bell + identity strip at the right. **No arrow, no chevron, no button, in any position.**
* **`.html`** — the header is one `space-between` row with **exactly two children**: the title
  stack and the identity strip. **The string `Back` occurs in none of the three files** (nor in
  `12`'s).
* **`screen.md`** — records no back control for any of the three.

**What the frames DO draw that leads backward:**

1. **The breadcrumb's first segment, `Classes`** — on all three. It is muted `11.50px`/`12.50px`
   text, and in this build it **is** a live link to `/management/classes`. ▶ This is your
   *"a route exists; it simply does not read as a back control."*
2. **The persistent left rail**, with `Classes` active on all three — a route to screen `12`,
   **not** to the previous screen.
3. **`Cancel`, inside the card footer on `26` and `27` only** — it returns to Classes, but it
   reads as *discard*, and `13` has no equivalent.

⚠️ **TWO FURTHER FACTS MEASURED WHILE ANSWERING, both relevant to whatever you rule:**

* **`13`'s breadcrumb is ABOVE the title in the frame and BELOW it in this build.** `26` and `27`
  match the frame (below). This is real drift on `13` alone and I have **not** touched it.
* **Screen `12` renders NO breadcrumb at all**, though its frame draws `Management / Classes`
  above the title. Reported as a fact, not as a challenge to your acceptance of `12`.

⛔ **I have built nothing for defect 3 and will not until you rule.** The trainer portal's
`Back to Schedule` was not consulted.

---

## Suites at this boundary, by exit code

| Suite | Result |
|---|---|
| `prove:shared-controls` (new) | ✅ **exit 0 — 8 PASS · 0 FAIL**, browser measurement + stale-build guard + three detector controls |
| `prove:artefact-read` · `p2-1` · `p2-2-create` · `p2-2b` · `p2-3` · `p2-4` · `prove:hero-all` · `test:integration` · `prove:encoding` · `prove:no-secrets` · `tsc` · `eslint` · `next build` | ✅ **all 0** |
| `prove:stage2-routes` | ⛔ **`NOT-RUN`** — blocked by the running `next dev` lock (see freshness report). **Not a regression, and not killed** |
| `test:continuity` · `test:exit-condition-b` | ⛔ **`NOT-RUN`** — `B-STAGE3-2` |
| **VISUAL acceptance** | ⛔ **Operator-set only. Not claimed here** |

⚠️ **Four instrument defects were found and fixed before any reading was trusted** — the
extractor measured a wrapper `div`; the `<select` scan read **comments**; the extractor then read
the **new fix comment** and reported `appearance: auto`, which looked like the fix regressing the
product; and the first post-fix run measured a **stale bundle**. ▶ **A scan over prose is not a
scan over code — third instance this session.** `SC-1`'s own assertion was also wrong once while
the product was right: Chrome **resolves** `right 0.75rem center` to `calc(100% - 12px) 50%`.

---

## Next permitted action

⏸ **HELD on your ruling for defect 3**, then your re-walk, then **`P2-5` (`25` Management
Schedule)** — a calendar **projection**, gated by `GC-13`: no `Showcase`, no duplicated event
record (`A-016`).

⛔ **Carried by nothing above:** any hosted or billable action · a fixture reload · editing
ratified authority · a push to `main` · public deployment · human testing · final submission ·
**the mojibake repair run** · **any query against the demonstration stack on 543xx** · and
**killing the running `next dev` server**.
