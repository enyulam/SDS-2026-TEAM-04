# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> **NOT A TRACKER · NOT AUTHORITY · DERIVED** (`CLAUDE.md` §15.8 / `FINAL_MVP_G06_GROUNDING_RULING.md` §H-8). Written at every stop and **OVERWRITTEN, never appended**. It **originates nothing** — **where this and `docs/progress/STATUS.md` disagree, `STATUS.md` wins and this file is stale.**
> Regenerated **2026-08-11**, after the facts below were written to `STATUS.md`, `BUILD_NOTES.md`, the plan and the amended authority. Contains **no credential**.

---

## ⛔ WHICH WORKSPACE IS THIS

| | |
|---|---|
| **Workspace** | **DEVELOPMENT CLONE**, branch **`develop`**. **NOT the demonstration workspace** |
| **Local stack** | ✅ **`best-coach-dev` on 544xx** — api **54421** · db **54422** |
| ⛔ **FROZEN, OFF LIMITS** | The demonstration workspace, its stack on **543xx**, hosted **`zjukuffiuzkbiblmnuwl`**, **`best-coach-mvp.vercel.app`** |
| ⛔ **Git** | **No push. No merge. No `main`. `develop` only.** Nothing pushed |

---

## ✅ WHERE THIS STOPPED

**`P1-1b` IS BUILT AND PROVEN.** `public.report_get_management_ratings(uuid, uuid)` — SECURITY DEFINER, `STABLE`, `search_path` pinned, **one `authenticated` EXECUTE**, no table/enum/policy. **`C-4` is collapsed to THREE strings, registry `16 → 19`.**

⛔ **THE FRONTEND IS NOT BUILT, DELIBERATELY.** The authorization was for *"the `D-1` management-only read"*. **Screen `19` renders no rating today** — the read exists and nothing consumes it. That is a stopping point, not an incomplete phase.

| | |
|---|---|
| **HEAD** | **`7c717a8`** on `develop`, tree **clean**. Four commits this run: `e502600` · `8be2403` · `dc29d9d` · `7c717a8` |
| **Gates** | ✅ **`prove:hero-all` 17/17 by exit code** · ✅ **`prove:portal-1` exit 0** (9 SQL legs + 10 runner checks) · `tsc` **0** · `eslint` **0 errors** · `build` **0** · route census **17** |
| **Database** | ⚠️ **ONE migration applied locally** (`supabase migration up`, ⛔ never `db reset`) — **22 migrations · 27 tables · 43 functions · 12 enums · 29 policies**. Governed rows **byte-unmoved**. **Audit registry still live at 16** |

---

## ▶ WHAT `P1-1b` PROVED

Non-vacuity **first** — a version with nine ratings exists and management reads them. Then **trainer, parent and anon each read zero**. Then ⚠️ **the control you required**: the same probe re-read as management *after* the three denials, so the zeros are proven to be **discrimination, not blindness**. `D1a-7` proves `C-9` at the **data** layer — a `needs_edit` report returns nothing even to management. `D1a-9` proves **both management reads go dark together**. `D1a-8` proves **`Q-27` did not move**.

⚠️ **A separate function was chosen over widening the review RPC, and the trade is recorded.** `report_get_working` already carries `ratings jsonb`, and `R-C2-6` warns a second RPC is a second gate — but widening changes a **return type** on the RPC the **proven** screen `19` path depends on. The side-channel risk is **mitigated, not ignored**: `D1-6` pins both gates to the same predicate, and `D1a-9` proves they refuse together.

---

## ⛔ THREE DEFECTS IN MY OWN INSTRUMENTS, ALL CAUGHT BY THE HARNESS

1. **The first deny leg mutated `public.reports` as `authenticated`** and got `permission denied`. ▶ **The refusal was correct and the fix was NOT a grant** — deny-by-default (`A-030`), and granting it to make a suite run is what §12 forbids. Setup now runs as owner; only the READ is impersonated.
2. ⛔ **The *counts-moved-mid-transaction* leg was passing for the wrong reason** — it compared a **nine-field** prelude string against the runner's **six-field** one, so it passed because *the formats differ*. **A false green in the leg whose whole job is to stop `before = after` being a tautology.** ▶ **A comparison is only evidence when both sides measure the same thing.**
3. **`prove:hero-2`'s `P2-6` census pin fired** at 42 → 43. ⛔ **Updated with its reason named, never removed.**

---

## ▶ DECISIONS OWED

| # | Question | Blocks |
|---|---|---|
| **1** | **`C-7`** — per-phase table-family authorizations (evidence, terms, materials) | ⛔ **`P1-2`** and the evidence chain |
| **2** | **`A-002`** — parent evidence is Phase 2 work. ⚠️ **You reserved this for its own question**; it is carried, not forgotten | ⛔ **`P1-5`** |
| **3** | **The screen `19` frontend** that would consume the new read | the visible half of `D-1` |

✅ **`R-4a` is CLOSED** by the collapse ruling.

---

## ⛔ Explicitly unchanged

- **`Q-27` does not move** — proven at the data layer this run, not asserted.
- **`G-2` permanent** · **`A-014`** TA persona deferred · **the content-hash rule unamended**.
- **Management may VIEW, never EDIT** — an assessment-level disagreement is a return to the trainer.
- **`A-057`'s prohibition re-arms at THREE.** ⛔ **Do not reintroduce `evidence.uploaded`** — a second name for one action is the defect the collapse closed.

## ⚠️ Carried

- **The silent-save reproduction is still owed a walk** — steps in `BUILD_NOTES.md`; carry into the Part 1 → Part 2 re-walk.
- ⚠️ **Authority Lock §19.1's "ratified census" reads `15 migrations · 36 functions`** — reality was **21 · 42** *before* this phase and is **22 · 43** now. **The divergence predates this work**; correcting a ratified instrument was outside `P1-1b`'s scope. **Recorded, not silently repaired.**
- **`RENDERED CAPTURE` `NOT-RUN`** on every authenticated surface · **`NOT APPLICABLE (G-1)`** on the three unframed ones.
- **Phase 8/11 gap stands** · **`test:integration` 47/3/3, exit 1** (suite staleness; `run-integration.mjs:517` calls `pass("INT-A5")` unconditionally) · ⛔ **`09` refuses its canonical route** (`C2C-007`) · **`A-044` knowingly unmet for `28`**.

## ▶ Next

⛔ **NONE. STOPPED.**
