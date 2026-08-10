# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> **NOT A TRACKER · NOT AUTHORITY · DERIVED** (`CLAUDE.md` §15.8 / `FINAL_MVP_G06_GROUNDING_RULING.md` §H-8). Written at every stop and **OVERWRITTEN, never appended**. It **originates nothing** and is **not a fifth layer of §15.1** — **where this and `docs/progress/STATUS.md` disagree, `STATUS.md` wins and this file is stale.**
> Regenerated **2026-08-11**, after the facts below were written to `STATUS.md`, `BUILD_NOTES.md` and the plan — never before, or it would originate them. Contains **no credential**.

---

## ⛔ WHICH WORKSPACE IS THIS — read before anything else

| | |
|---|---|
| **Workspace** | **DEVELOPMENT CLONE**, branch **`develop`**. **NOT the demonstration workspace** |
| **Local stack** | ✅ **`best-coach-dev` on 544xx** — api **54421** · db **54422** · containers `supabase_*_best-coach-dev` |
| ⛔ **FROZEN, OFF LIMITS** | The demonstration workspace, its still-running local stack **`best-coach-mvp` on 543xx**, hosted project **`zjukuffiuzkbiblmnuwl`**, and the frozen deployment **`best-coach-mvp.vercel.app`** |
| ⛔ **Git** | **No push. No merge. No `main`. `develop` only.** |
| ⚠️ **Credential** | The **hosted dev** database password was exposed in a session transcript on 2026-08-11 by a regex allow-list over env var names. **The Operator is rotating it.** Cause and rule are in `BUILD_NOTES.md` |

---

## ▶ WHERE THIS STOPPED

✅ **The `rejected query → empty result` sweep is COMPLETE. All 16 sites closed**, measured at **0 exact-shape** and **0 error-discarded** across `server/modules`.

⛔ **STOPPED BY OPERATOR INSTRUCTION.** The **ratified-decisions document** comes next, **with its own bounded instruction**.

⚠️ **Do not act on the document alone.** Amending ratified authority is a `CLAUDE.md` §12 stop-and-ask: it needs an instruction naming the **exact files and corrections**, uses **annotate-never-delete**, and is **never** carried by a standing authorization (§15.11). **A ratified decision is the INPUT to that instruction, not the instruction.**

---

## Position

| Field | Value |
|---|---|
| **HEAD** | `cd55b11` on `develop`, working tree **clean** (plus this continuity commit) |
| **Commits, per module boundary** | first fix `46310b9` (1 site) · `report-workflow` `6910ff2` (7) · ratchet `d5c7f6c` · `management-view` `334d3c6` (3) · `parent-view` `cd55b11` (4) |
| **Proofs** | **`npm run prove:hero-all` — 17/17 `PASS`**, verified by **exit code** |
| **Other gates** | `tsc` **0** · `eslint` **0 errors** (2 pre-existing warnings) · `build` **0** · route census **17** · `post-login-destinations` **PASS** |
| **Database** | **UNTOUCHED** — 21 migrations · 27 tables · 42 functions · 12 enums · 29 policies |
| **`.env.local`** | **NOT touched.** The app still reads hosted dev until you repoint it |

---

## What the sweep closed

`readRows(context, run)` decides the three cases **once**: a rejection, a `!data`-without-error (⛔ **not an observed emptiness**), and rows. ⚠️ **The defect was a repeated SHAPE, not a typo** — hand-writing the block sixteen times would have left sixteen chances to write it wrong again.

**The three worst silent emptinesses it removed:**

1. **The roster's carry-over read.** A rejection became *"there is no previous session"*, so the roster rendered **every learner with no carried-over focus and looked entirely normal** — `CLAUDE.md` §10 **Phase 1 exit condition (c)** silently not holding.
2. **The management queue spine.** Screen `29` would have said **"No reports waiting"** while trainer-approved reports sat unreviewed — **a governed review step made invisible** (A-033).
3. **The parent link read.** A rejection told a parent **no learner is linked to their account** — a false statement about their own family. ▶ **The clearer the empty state, the more convincing the lie.**

⛔ **One read was deliberately NOT swept.** The per-pair `report_get_canonical` call keeps `if (error) continue` — **that silence IS the R-C2-6 non-disclosure**, since a parent must not distinguish *"not yours"* from *"nothing submitted"* by the shape of the answer. **A uniform sweep would have broken the thing it protects.** Pinned by `P-5`/`P-5b`.

---

## ⚠️ Three things worth your attention

1. **Two pins fired, both correctly** — `Q-7`'s counts and `prove:hero-13`'s exact-line check. **Both failed rather than following the code silently**, which is why they are written as exact matches. `Q-7` is now a **ratchet**: it fails if either count RISES.
2. **I defeated my own rule with a pipe.** `prove:hero-all … | tail -2 && git commit` — a pipeline's exit status is the last command's, so a commit landed over a **failing** sweep, in the very commit adding the exit-code discipline. ▶ **Never place a pipe between a verdict and the decision that consumes it.** Fixed forward; every check since redirects to a file and tests the exit status.
3. **The reachability gate is proven, not assumed.** A deliberate type error was written into the project, both gate legs **failed**, and the probe was removed with `tsc` verified clean. *A gate never seen to fail is a gate nobody has tested.*

---

## ⛔ Carried / still `NOT-RUN`

- **RENDERED CAPTURE `NOT-RUN`** on every authenticated surface.
- **`NOT APPLICABLE (G-1)`** on the three unframed surfaces — a **ruled disposition**, never a pass, never a gap.
- **`B-C2-1`** untouched. **`NEW-QUESTION`: none.**
- **Nothing pushed. No remote write of any kind.**
- ⚠️ **The app still reads hosted dev**, which is 4 migrations behind. Repointing to local dev is **your** change to `.env.local`, plus a dev-server restart.

---

## Reading order for the next session

`CLAUDE.md` → `FINAL_MVP_AUTHORITY_LOCK.md` and the operator rulings → `FINAL_MVP_EXECUTION_PLAN.md` → **`docs/progress/STATUS.md`** → recent `docs/progress/BUILD_NOTES.md` → `docs/plan/HERO_CHAIN_COMPLETION_PLAN.md`, whose **§12 now carries twenty disciplines** and is the part of that closed plan with a life after closure.

⚠️ **Then verify the recorded state against the repository** (§15.3) — existence governs facts.
