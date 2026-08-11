# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> **NOT A TRACKER · NOT AUTHORITY · DERIVED** (`CLAUDE.md` §15.8 / `FINAL_MVP_G06_GROUNDING_RULING.md` §H-8). Written at every stop and **OVERWRITTEN, never appended**. It **originates nothing** and is **not a fifth layer of §15.1** — **where this and `docs/progress/STATUS.md` disagree, `STATUS.md` wins and this file is stale.**
> Regenerated **2026-08-11**, after the facts below were written to `STATUS.md`, `BUILD_NOTES.md`, the plan and the amended authority — never before, or it would originate them. Contains **no credential**.

---

## ⛔ WHICH WORKSPACE IS THIS — read before anything else

| | |
|---|---|
| **Workspace** | **DEVELOPMENT CLONE**, branch **`develop`**. **NOT the demonstration workspace** |
| **Local stack** | ✅ **`best-coach-dev` on 544xx** — api **54421** · db **54422**. `.env.local` points here |
| ⛔ **FROZEN, OFF LIMITS** | The demonstration workspace, its stack **`best-coach-mvp` on 543xx**, hosted **`zjukuffiuzkbiblmnuwl`**, and **`best-coach-mvp.vercel.app`** |
| ⛔ **Git** | **No push. No merge. No `main`. `develop` only.** |

---

## ✅ WHERE THIS STOPPED

**`docs/plan/PORTAL_COMPLETION_PLAN.md` exists (rev 1). Its eighteen collisions `C-1` … `C-18` are ALL RULED. Four amendments are propagated. Plan phase `P1-1a` — the stale `A-038`/`GC-6` sweep — is EXECUTED AND COMMITTED.**

⛔ **STOPPED BY OPERATOR INSTRUCTION.** ⛔ **NOTHING ELSE IS BUILT.** `D-1` … `D-5` are implemented nowhere: no table, enum, column, bucket, policy, RPC, grant, audit action string, migration, route or screen.

| | |
|---|---|
| **HEAD** | **`8be2403`** on `develop`, working tree **clean**. Two commits this run: `e502600`, `8be2403` |
| **Gates** | `tsc` **0** · `eslint` **0 errors** (2 pre-existing warnings) · `build` **0** · route census **17** · encoding + table-integrity **19/19 clean** |
| **Database** | ⛔ **UNTOUCHED.** No migration written or applied. ⚠️ **Audit registry still live at 16** — `A-057` has never been implemented |

---

## ▶ THREE DECISIONS OWED, IN THE ORDER THEY BLOCK WORK

### 1. ⛔ `R-4a` — the `C-4` collapse question. **Blocks `P1-2`, and therefore the whole evidence chain.**

**`evidence.uploaded` and `evidence.attached` appear to be ONE governed action.** Under `D-5` the Trainer uploads **at assessment time**, and the object is **tagged to exactly one session report** and **can never be moved or reused** — so the upload *is* the attach. **`A-029` requires one event per governed action**, a rule `A-057`'s own supersession table lists as preserved.

▶ **If collapsed, the registry is `16 → 19` instead of `16 → 20`.** **Nothing is baked in** — the live registry is 16 and `A-057` has never been implemented, so this stays a cheap, clean ruling. Recorded at `A-057.1a`.

### 2. ⛔ `A-002` — deliberately not ruled. **Blocks `P1-5`.**

*"Actual parent evidence access is first implemented and tested in **Phase 2**, never Phase 1"*, and `CLAUDE.md` §10 Phase 2 has not been entered. **You reserved this for its own question when Part 1 reaches it** — it is carried, not forgotten.

### 3. ⛔ `P1-1b` — the `D-1` projection half. **Not authorized.**

The authorization named *"the stale `GC-6`/`A-038` sweep"*, so **the narrower reading was taken**: the projection extension and its **new management-only read** were not built. That half adds a reviewed `SECURITY DEFINER` function and a grant — a `CLAUDE.md` §12 change.

⚠️ **One design constraint already fixed for whenever it is authorized:** the ratings must **not** be added to `report_get_canonical`, which dispatches on role and serves parent, trainer and management from one body. That would put them one branch from a Parent session and make **`Q-27` depend on a conditional**.

---

## ⚠️ THE TWO FINDINGS FROM THIS RUN WORTH YOUR ATTENTION

### 1. `C-4` — holding it was right, and the reason is worth keeping

The first ruling said *"add `evidence.attached`/`evidence.removed`, 16 → 18"* while `A-057` already ratified a **different** pair, also 16 → 18. ▶ **The `replace` reading would have satisfied the instruction exactly as written and silently deleted `evidence.accessed`** — the only trace that a signed URL to a child's video was minted, for whom and when. **It would have looked like compliance.**

⚠️ **A ruling with an internal arithmetic inconsistency is a stop-and-ask, not a puzzle to solve.** Now recorded in the instrument itself.

### 2. ⛔ The sweep's own detector was broken, and only its control revealed it

The tree-wide completeness scan alternated **`management|MANAGEMENT`** and **missed `Management`** — title case, which is what the files actually use. It reported **"0 uncorrected claims"** while matching almost nothing.

Caught by a **deliberate non-vacuity control** the detector was required to MATCH. Fixed, the same scan found **four more sites**, all in `CLOSED`/`HISTORICAL` instruments and **left alone by rule**. **True count: 20 claims — 16 corrected, 4 preserved.**

▶ **Fourth direction of this project's recurring defect, and the worst.** After false `MISSING`, false `FAIL` and false `VIOLATION`, this is a **false `CLEAN`** — **nobody re-checks a sweep that reports nothing left to do.** Now binding: a sweep carries a control proving its detector can fire, and completeness is scanned **across the tree**, never only across the list it was handed.

**And the register itself was under-measured by one:** **screen `19`'s own pack** had to move in the **opposite direction** — its notes still said Management never reads ratings, on the one screen where `D-1` **lifts** that.

---

## ⛔ Explicitly unchanged

- **`Q-27` does not move.** Nothing this run grants Parent a single field. `30`'s "This Term's Skills" card remains `DO_NOT_IMPLEMENT`.
- **`G-2` permanent**, on its two surviving grounds. **`A-014`** TA persona deferred; `centre_membership_role` not extended.
- **The content-hash rule was NOT amended** — only its 4⁹ rationale lapsed, and only for Management. **Widening it is a §12 stop-and-ask.**
- **Management may VIEW, never EDIT** — an assessment-level disagreement is a return to the trainer.
- **§8.1's original ground has NOT lapsed.** The canonical PDFs still require no parent-facing evidence projection; `D-5` rests on **client consent confirmed with the academy**, a different basis.
- **`A-057`'s prohibition RE-ARMS AT FOUR.** A fifth evidence action is a fresh stop-and-ask.

## ⚠️ Carried

- **The silent-save reproduction is still owed a walk** — steps in `BUILD_NOTES.md`; carry it into the manual re-walk between Part 1 and Part 2.
- **`RENDERED CAPTURE` `NOT-RUN`** on every authenticated surface · **`NOT APPLICABLE (G-1)`** on the three unframed ones.
- **Phase 8/11 gap stands** — `prove:hero-8/11` compare shells and would pass if either editor could not save at all.
- **`test:integration` 47/3/3, exit 1** — suite staleness, product correct; `run-integration.mjs:517` calls `pass("INT-A5")` unconditionally after both `fail()`s. Fix before Part 2 so it can gate.
- ⛔ **`09` refuses its canonical route** (`C2C-007`) — `P2-21`, first.
- **`A-044` is knowingly unmet for screen `28`** — ruled, deliberate, recorded so it is never read as an oversight.
- ⚠️ **`prove:hero-all` was NOT re-run this session** — no source behaviour changed (comments only), and `tsc`/`eslint`/`build` all passed. **Report it as `NOT-RUN`, never as passing.**

## ▶ Next

⛔ **NONE. STOPPED.** Rule `R-4a`, `A-002` or `P1-1b` — in that order of impact — and Part 1 continues from there.
