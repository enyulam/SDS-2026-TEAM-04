# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> **NOT A TRACKER · NOT AUTHORITY · DERIVED** (`CLAUDE.md` §15.8 / `FINAL_MVP_G06_GROUNDING_RULING.md` §H-8). Written at every stop and **OVERWRITTEN, never appended**. It **originates nothing** and is **not a fifth layer of §15.1** — **where this and `docs/progress/STATUS.md` disagree, `STATUS.md` wins and this file is stale.**
> Regenerated **2026-08-11**, after the facts below were written to `STATUS.md` and `BUILD_NOTES.md` — never before, or it would originate them. Contains **no credential**.

---

## ⛔ WHICH WORKSPACE IS THIS — read before anything else

| | |
|---|---|
| **Workspace** | **DEVELOPMENT CLONE**, branch **`develop`**. **NOT the demonstration workspace** |
| **Local stack** | ✅ **`best-coach-dev` on 544xx** — api **54421** · db **54422**. `.env.local` now points here |
| ⛔ **FROZEN, OFF LIMITS** | The demonstration workspace, its local stack **`best-coach-mvp` on 543xx**, hosted **`zjukuffiuzkbiblmnuwl`**, and **`best-coach-mvp.vercel.app`** |
| ⛔ **Git** | **No push. No merge. No `main`. `develop` only.** |
| ⚠️ **Credential** | The **hosted dev** database password was exposed in a transcript on 2026-08-11 by a regex allow-list over env var names. **Operator rotating.** Cause and rule in `BUILD_NOTES.md` |

---

## ✅ THE HEADLINE — THE DEFECT YOU REPORTED DOES NOT EXIST

**Your wording edits SAVED. All three of them.** Both trainer edits and the management wording edit are in the database as new immutable versions, with correct authorship, `report_version.created` audit events, changed content hashes and advanced pointers. The read RPCs return them today.

▶ **You were one step from filing a data-loss defect against a system that lost nothing.**

⚠️ Your management edit went to **`strengths`**, not `remarks` — my first comparison checked only `remarks` and wrongly reported it unchanged.

⛔ **And my first diagnosis was wrong in a way worth knowing.** I reported the management editor as having **no status guard**. It has one, in the **adapter** (`participant-actions.ts:688`), one layer above where the trainer's sits. I had measured the RPC **directly over PostgREST**, bypassing that adapter, and then described the result as the application's behaviour. **I measured a layer and reported it as the system.** You authorized a fix for that non-defect; **I refused to build it** rather than encode a defect that isn't there.

---

## What was done — four commits, in your order

| | Commit | |
|---|---|---|
| 1 | — | ⛔ **REFUSED** — premise false, both editors are guarded. See above |
| 2 | **`ade7d45`** | `test:integration` wired and **run** |
| 3 | **`835067f`** | the `→ null` shape closed; `Q-7` widened to three shapes |
| 4 | **`5e37e74`** | the silent half made observable |
| + | **`d89d52f`** | `INT-A5` no longer prints `PASS` for a leg that failed; both rulings recorded |

---

## ⚠️ THREE THINGS THAT NEED YOUR ATTENTION

### 1. `prove:hero-all` is **13/17**, and your walkthrough is why

`prove:hero-1 / 2 / 7 / 9` fail with `duplicate key … reports_session_student_key` and **0 legs executed** — they create a report for a fixture pair that **now already has one**.

**Measured, not assumed:** the last all-green commit `948011b` is **18:58:32 UTC**; your three reports were created at **19:37, 19:55 and 20:00 UTC**. This batch is TypeScript-only and cannot affect a SQL suite.

⚠️ **Same root cause as the integration suite's `INT-A5`**, found an hour earlier by a completely different route: **the canonical dev database is shared between your manual walkthroughs and the automated suites, and a manual walk silently invalidates their preconditions.** All four rolled back cleanly — the database is byte-unmoved.

⛔ **I did not repair it.** The repair is deleting those report rows, and **they are your evidence and the subject of this diagnosis.** Removing them to make a suite green would destroy the record to protect the instrument. ▶ **You ruled: isolation, never deletion.** The options are in this turn's report; **nothing was built.**

### 2. Coverage that could not be invoked — and what it said once it could

`run-integration.mjs`, the **only** harness exercising both wording saves end to end, **was wired to no npm script**. It now runs: **47 `PASS` · 3 `FAIL` · exit 1**, zero non-loopback requests, the billable leg **skipped by default and recorded as skipped, never passed**.

**All 3 failures are suite staleness, reported not fixed per your instruction** — `INT-A5` ×2 (same fixture-pollution cause) and `INT-Q27`, which pins a Parent DTO shape that **hero Phase 2 ratified a change to**. `context` carries class/module/lesson/trainer — **no rating in any vocabulary** — so Q-27's actual prohibition is untouched. ⛔ The suite also called `pass("INT-A5")` **unconditionally** after both `fail()`s, printing two `FAIL`s and then a `PASS` — **fixed in `d89d52f`** (`PASS` 48 → 47). ⚠️ A static scan suggested **49** ids could do this; **in the real run exactly one did**. *"Can print both" and "did print both" are different measurements.*

### 3. Widening the ratchet found three more sites than the two you named

`Q-7d` failed on its first run naming three sites in `integration-adapter` nobody had listed. The worst: ⛔ **`adapterSaveTrainerEdit` reported a governed correction request as RESOLVED when the read that was supposed to confirm it had been REJECTED** — under a comment reading *"Observed, not asserted."*

▶ **A ratchet pinned to the defect you found does not protect you from the same defect wearing a different return value.**

---

## ▶ HOW TO REPRODUCE THE SILENT SAVE — the walk that will settle it

Your failing attempts left **no trace anywhere**, because a submit that never dispatches produces no server record at all. Two candidates remained and nothing could separate them. **I did not guess.** Three signals now make all three outcomes distinguishable:

1. Open the browser console **before** navigating (`F12` → Console, `Verbose`/`debug` visible).
2. Trainer report at `draft_ready` → **Edit**. The line beside the button should read **"No changes yet"**.
3. Type one character. It must become **"Ready to save."** ⛔ **If it does not, that is candidate 1** — the button never enables and the click can never dispatch.
4. Click **Save changes**. Expect `[trainer-report-editor] dispatching`, then `returned {outcome: …}`.
5. **Console empty** → candidate 1. **Only `submit-ignored`** → candidate 2 (component not `ready`). **`dispatching` with nothing in the server log** → a third possibility neither candidate covered.
6. Repeat on a `trainer_approved` report → Management **Edit wording**.

**Report whichever of the three you see.**

---

## ⛔ TWO RULINGS RECORDED, AND ONE ANSWER YOU STILL OWE

**StatePanel — stays non-disclosing.** Recorded **at the guard** (`participant-actions.ts:688`), not only in the log, so a later phase reading the silence as a missing error message sees that it is ruled.

**Shared database — isolation, never deletion.** Your three report rows are untouched. **`prove:hero-1/2/7/9` stay red** until you choose an approach; the shapes are in this turn's report and **nothing was built**.

## Position

| Field | Value |
|---|---|
| **HEAD** | `d89d52f` on `develop` (plus this continuity commit), working tree **clean** |
| **Gates** | `tsc` **0** · `eslint` **0 errors** (2 pre-existing warnings) · `build` **0** · route census **17** |
| **Proofs** | **`prove:hero-all` 13/17** — see item 1 · **`test:integration` 47 `PASS` / 3 `FAIL` / 3 `RECORDED`, exit 1** — see item 2 |
| **Database** | **UNTOUCHED by this batch** — 21 migrations · 27 tables · 42 functions · 12 enums · 29 policies. Your three walkthrough reports are intact |
| **Dev server** | running on **3000** against the local stack |

## ⛔ Carried

- **RENDERED CAPTURE `NOT-RUN`** on every authenticated surface · **`NOT APPLICABLE (G-1)`** on the three unframed ones.
- ⚠️ **Phase 8/11 gap recorded:** structural consistency is **neither a visual nor a functional acceptance**. `prove:hero-8/11` would pass unchanged if either editor could not save at all; they passed here **only because both changed symmetrically**.
- **Nothing pushed. No remote write of any kind.** Screens `11` and `30` untouched.

## ▶ Next

⛔ **NONE. STOPPED.** The **ratified-decisions document**, with its own bounded instruction. ⚠️ **Do not act on the document alone** — a ratified decision is the **input** to that instruction, not the instruction.

**Two open items only you can settle:** whether the management `unavailable` StatePanel should name *"already submitted"* (an **A-038** disclosure decision, and I will not move that boundary unasked), and how the canonical fixture database should be shared between manual walks and automated suites.
