# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> **NOT A TRACKER · NOT AUTHORITY · DERIVED** (`CLAUDE.md` §15.8 / `FINAL_MVP_G06_GROUNDING_RULING.md` §H-8). Written at every stop and **OVERWRITTEN, never appended**. It **originates nothing** and is **not a fifth layer of §15.1** — **where this and `docs/progress/STATUS.md` disagree, `STATUS.md` wins and this file is stale.**
> Regenerated **2026-08-11**, after the facts below were written to `STATUS.md`, `BUILD_NOTES.md` and the plan — never before, or it would originate them. Contains **no credential**.

---

## ⛔ WHICH WORKSPACE IS THIS — read before anything else

| | |
|---|---|
| **Workspace** | **DEVELOPMENT CLONE**, branch **`develop`**. **NOT the demonstration workspace** |
| **Local stack** | ✅ **`best-coach-dev` on 544xx** — api **54421** · db **54422**. `.env.local` points here |
| ⛔ **FROZEN, OFF LIMITS** | The demonstration workspace, its local stack **`best-coach-mvp` on 543xx**, hosted **`zjukuffiuzkbiblmnuwl`**, and **`best-coach-mvp.vercel.app`** |
| ⛔ **Git** | **No push. No merge. No `main`. `develop` only.** |
| ⚠️ **Credential** | The **hosted dev** database password was exposed in a transcript on 2026-08-11 by a regex allow-list over env var names. **Operator rotating.** Cause and rule in `BUILD_NOTES.md` |

---

## ✅ WHERE THIS STOPPED

**`prove:hero-all` is 17/17, verified by exit code.** The four SQL suites your manual walkthrough had broken are green again — **without deleting anything of yours.**

⛔ **STOPPED BY OPERATOR INSTRUCTION.** The **ratified-decisions document** comes next, **with its own bounded instruction**. ⚠️ **Do not act on the document alone** — amending ratified authority is a `CLAUDE.md` §12 stop-and-ask needing an instruction naming the exact files and corrections; **a ratified decision is the INPUT to that instruction, not the instruction.**

---

## What the fix actually is

`prove:hero-1/2/7/9` used to take a `(session, student)` pair with `ORDER BY … LIMIT 1` and insert a report for it — so **the suites depended on the state of a database a human uses.** A shared prelude now **MINTS** the whole subject inside the existing `ROLLBACK`: student, enrolment, session, trainer assignment, parent link, observation and nine mixed ratings.

▶ **The collision is structurally impossible now** — a session minted a statement ago cannot already have a report — and the rollback-based non-mutation proof still runs **against the real database**, which is exactly what the clone would have cost.

⛔ **Your three report rows are untouched and verified present** (`2c4bb887` submitted · `723a6837` submitted · `e751c809` draft_ready).

---

## ⚠️ FOUR THINGS WORTH YOUR ATTENTION

### 1. Byte-unmoved is now a measurement, not a tautology

You required it still measure the canonical database and still be **capable of failing**. ⛔ `before === after` is also what a counting query that observes **nothing** returns — so a widened count that silently matched no table would have passed forever.

Each suite now emits the **same counts mid-transaction** and the runner asserts they differ:

```
3|6|24|1|0|1|7|7|3  ->  4|7|24|1|1|2|8|8|4  ->  3|6|24|1|0|1|7|7|3
```

The counts were also **widened** to `students`, `enrolments` and `observations` so they cover the rows the minting creates. **Leakage was measured, not assumed:** eight runs leave every count identical and `students LIKE 'Isolated Fixture%'` returns **0**.

### 2. The schema refused three more shapes, and was right all three times

Ambiguous `centre_id` (an `OUT` parameter *and* a column on four of these tables — fixed by using locals throughout, which removes the **class** of error rather than the occurrence) · `pg_catalog.current_date` (a keyword, not a function) · `d.display_order` (the column is `sort_order`). ▶ **A guess about a column name is not a measurement.** Those suites already carried a sentence about three earlier refusals; **it is six for six now.**

### 3. `P2-4` was measuring the fixture's shape as well as the rule

It counted the parent's **entire** list and required zero — silently assuming that parent had exactly one linked learner. Yours now also has a real submitted report for a different learner, so the leg failed **while the rule it tests held perfectly**. Scoped to the minted learner, **plus a live-link reading taken first** so the zero is only reachable from a non-zero.

### 4. ⛔ The patch silently skipped two of the four

The discriminating leg was inserted by matching each runner's byte-unmoved **prose**; `prove-7` and `prove-9` word theirs differently and were **skipped** — their SQL emitted the marker and nothing read it, leaving the tautology intact. Caught by counting the marker in all four files. ▶ **Verify a bulk edit by counting the result in every target, never by trusting the patch's own report.**

---

## ⚠️ Still red, and out of this ruling's scope

**`test:integration` stays at 47 `PASS` / 3 `FAIL`.** `INT-A5` has the **identical root cause** — it asserts *"before approval/submission"* against a pair that now holds a submitted report. **The same remedy would close it. It was not in this ruling and remains reported, not fixed.** `INT-Q27` is stale against ratified hero Phase 2 (`context` carries class/module/lesson/trainer — **no rating in any vocabulary**, so Q-27's prohibition is untouched).

---

## Position

| Field | Value |
|---|---|
| **HEAD** | `develop`, working tree **clean** at the fixture-isolation commit plus this continuity commit |
| **Gates** | `tsc` **0** · `eslint` **0 errors** (2 pre-existing warnings) · `build` **0** · route census **17** |
| **Proofs** | ✅ **`prove:hero-all` 17/17 by exit code** · ⚠️ `test:integration` 47/3/3, exit 1 — see above |
| **Database** | **UNTOUCHED** — 21 migrations · 27 tables · 42 functions · 12 enums · 29 policies. Your three walkthrough reports intact |
| **Dev server** | running on **3000** against the local stack |

## ⛔ Carried

- **RENDERED CAPTURE `NOT-RUN`** on every authenticated surface · **`NOT APPLICABLE (G-1)`** on the three unframed ones.
- ⚠️ **The silent-save reproduction is still owed a walk** — three signals now separate the two candidates; steps are in `BUILD_NOTES` and unchanged.
- ⚠️ **Phase 8/11 gap stands:** structural consistency is neither a visual nor a functional acceptance.
- Plan §12 now carries **23 disciplines**; three added this turn, including *"can fail" and "did fail" are different measurements*.
- **Nothing pushed. No remote write of any kind.** Screens `11` and `30` untouched.

## ▶ Next

⛔ **NONE. STOPPED.** The ratified-decisions document, with its own bounded instruction.
