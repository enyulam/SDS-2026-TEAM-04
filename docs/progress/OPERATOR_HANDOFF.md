# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> **NOT A TRACKER · NOT AUTHORITY · DERIVED** (`CLAUDE.md` §15.8 / `FINAL_MVP_G06_GROUNDING_RULING.md` §H-8). Written at every stop and **OVERWRITTEN, never appended**. It **originates nothing** and is **not a fifth layer of §15.1** — **where this and `docs/progress/STATUS.md` disagree, `STATUS.md` wins and this file is stale.**
> Regenerated **2026-08-11**, after the facts below were written to `STATUS.md`, `BUILD_NOTES.md` and the plan — never before, or it would be originating them. Contains **no credential**.

---

## ⛔ WHICH WORKSPACE IS THIS — read before anything else

| | |
|---|---|
| **Workspace** | **DEVELOPMENT CLONE**, branch **`develop`**. **NOT the demonstration workspace** |
| **Local stack** | ✅ **`best-coach-dev` on 544xx** — api **54421** · db **54422** · containers `supabase_*_best-coach-dev` |
| ⛔ **FROZEN, OFF LIMITS** | The demonstration workspace, its **still-running local stack `best-coach-mvp` on 543xx**, hosted project **`zjukuffiuzkbiblmnuwl`**, and the frozen deployment **`best-coach-mvp.vercel.app`**. All hard-denied in code, non-overridably |
| ⛔ **Git** | **No push. No merge. No `main`. `develop` only.** |

---

## ▶ WHERE THIS STOPPED

✅ **`docs/plan/HERO_CHAIN_COMPLETION_PLAN.md` is CLOSED — COMPLETE.** All eleven phases Operator-accepted: 0A/0B/1 and 2–6 on 2026-08-10; **7, 8, 9, 10, 11 on 2026-08-11**.

⛔ **STOPPED BY OPERATOR INSTRUCTION. NOTHING STARTED, AND NOTHING MAY BE.** The Operator is walking the chain manually and will then send **a set of client-ratified decisions that amend ratified authority**.

⚠️ **The next session must not treat those decisions as self-executing.** **Amending ratified authority is a `CLAUDE.md` §12 stop-and-ask** — it needs its **own bounded instruction naming the exact files and corrections**, uses the ratified **annotate-never-delete** method, and is **never** carried by a batch or standing authorization (§15.11). **`CLAUDE.md` itself is never editable under a standing authorization.** A ratified decision arriving is the *input* to that instruction, not the instruction.

---

## Position

| Field | Value |
|---|---|
| **HEAD** | on `develop`, working tree **clean**. Resolve with `git rev-parse HEAD` |
| **Accepted 2026-08-11** | **P7 `2fecad9` · P8 `607023d` · P9 `fa7df59` · P10 `8044d87` · P11 `a95f89d`** |
| **Database, final for this plan** | 21 migrations · 27 tables · **42 functions** · 12 enums · 29 policies. Governed rows `reports` 0 · `report_versions` 0 · `audit_events` 0 |
| **What the whole batch added** | **One function** (Phase 7 `assessment_save_follow_up_notes`) and **three nullable columns** (Phase 0B). Phases 2–6 and 8–11 added **no database object at all** |
| **Proofs** | **`npm run prove:hero-all` — 12/12 `PASS`**, none contradicting its own exit code |
| **Other suites** | `portal-navigation-active-state` **PASS** · `post-login-destinations` **PASS** · `tsc` **0** · `eslint` **0 errors** (2 pre-existing warnings) · `build` **0** · route census **17** |

---

## ⛔ The finding that outranks everything else in this record

**A suite reported `PASS` having never executed a single check.**

Extending the Phase 8/11 harness introduced **backticks inside a template literal**. That is a syntax error: **the module never parsed, and Node never ran one of its fourteen legs.** The regression sweep in use was `npm run prove:hero-$n | grep -o "RESULT: [A-Z]*"` — and **Node's `SyntaxError` report echoes the offending source line**, which *was* the success message, containing the literal text `RESULT: PASS`. The grep matched it.

▶ **The harness's own success string became the evidence of its success.**

⚠️ **Why it outranks the earlier instances of this family** (`bool_and` over zero rows, the `CANONICAL_CONTAINERS` inversion, the S-8 gate denying everyone): those defects lived in the **measured object** and could falsify **one leg of one proof**. This one lived in the **MEASURING INSTRUMENT**, so it **would have contaminated every boundary the sweep ran at** — and nothing in the sweep could ever have caught it.

⛔ **The rule: never decide a suite's verdict by matching its output. Exit code is the only verdict.** A process that died before running anything can print any string it contains; a non-zero exit with no output is a **failure**, never a pass.

✅ **Closure, Operator-ruled as right and as applying to every future suite:** `npm run prove:hero-all` decides each verdict from exit status alone (treating a signal-kill `null` as failure), **plus a self-check that fails any suite exiting 0 while printing `RESULT: FAIL`** — the two signals must agree. ▶ **Adding a new proof includes adding it to that sweep; a suite outside it is a suite whose verdict nobody is checking.**

**Nothing shipped wrong** — the fixed file's fourteen legs all pass, and every Phase 8/11 conclusion rests on the re-run keyed off exit status. But it was caught by habit, not by design. The mechanism removes the luck. Full entry: `BUILD_NOTES.md`, 2026-08-11.

---

## ✅ Two patterns ruled this session — plan §12 items 17, 18 and 16

1. **Refusing to widen a gate is only half the pattern** *(item 18)*. Phase 9 wanted four fields `report_get_canonical_context` returns exactly, and that read is gated on a submitted version two of `29`'s three queue modes never have. A narrower read was built instead of dropping the precondition — **and `P9-3` asserts the precondition is still present**, so §12's *never weaken the thing that refused* is **checked by the suite rather than promised in a comment**. ▶ **The other half is leaving behind a check that fails if someone later widens it.**

2. **An omission's stated reason must say whether it ends when data arrives, or never ends** *(item 16)*. ⚠️ A data-availability omission and a ruled omission are **indistinguishable on a rendered page** — the reason is the only thing carrying the difference. *"The projection carries no term field"* **implies the filter would exist if the data did**, which is how a permanent refusal gets quietly reclassified as a temporary gap and "completed" in good faith by the next phase. **Two instances this batch:** the `29` disabled Term chip and `19`'s Report Details note.

---

## ⛔ Carried / still `NOT-RUN` — not waived by closure

- **RENDERED CAPTURE `NOT-RUN`** on **every** authenticated surface. Closing a plan does not run a capture, and this must never be reported otherwise.
- **`NOT APPLICABLE (G-1)`** on the three unframed surfaces — a **ruled disposition**, never a pass and never a gap. ⚠️ **The green foundation-consistency proof does not convert it into a visual acceptance.**
- **`B-C2-1`** untouched. **`NEW-QUESTION`: none.**
- **Nothing pushed. No remote write of any kind.**

---

## Reading order for the next session

`CLAUDE.md` → `FINAL_MVP_AUTHORITY_LOCK.md` and the operator rulings (including `FINAL_MVP_HERO_CHAIN_RULINGS.md`) → `FINAL_MVP_EXECUTION_PLAN.md` → **`docs/progress/STATUS.md`** → recent `docs/progress/BUILD_NOTES.md` → `docs/plan/HERO_CHAIN_COMPLETION_PLAN.md`, whose **§12 carries eighteen disciplines and is the part of that plan with a life after closure**.

⚠️ **Then verify the recorded state against the repository** (§15.3) — existence governs facts.
