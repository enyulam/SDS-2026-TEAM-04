# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> **NOT A TRACKER · NOT AUTHORITY · DERIVED** (`CLAUDE.md` §15.8 / `FINAL_MVP_G06_GROUNDING_RULING.md` §H-8). Written at every stop and **OVERWRITTEN, never appended**. It **originates nothing** and is **not a fifth layer of §15.1** — **where this and `docs/progress/STATUS.md` disagree, `STATUS.md` wins and this file is stale.**
> Regenerated **2026-08-10**. Contains **no credential**.

---

## ⛔ WHICH WORKSPACE IS THIS — read before anything else

| | |
|---|---|
| **Workspace** | **DEVELOPMENT CLONE**, branch **`develop`**. **NOT the demonstration workspace** |
| **Local stack** | ✅ **`best-coach-dev` on 544xx** — api **54421** · db **54422** · containers `supabase_*_best-coach-dev` |
| ⛔ **FROZEN, OFF LIMITS** | The demonstration workspace, its **still-running local stack `best-coach-mvp` on 543xx**, and hosted project **`zjukuffiuzkbiblmnuwl`**. **Never connect to any of them.** Both are now **hard-denied in code**, unconditionally and non-overridably |
| **Hosted target (configured, NOT contacted)** | `poblcfbxxzgarclchzkx` — Supabase, `ap-southeast-1` |
| ⛔ **Git** | **No push. No merge. No `main`. `develop` only.** |

⚠️ **`STATUS.md` opens with a CURRENT EXECUTION STATE block for THIS clone**, above the demonstration-workspace `📌` block. Read the clone block; everything below it is history and is not about this repository.

---

## ▶ WHERE THIS STOPPED

✅ **`B-STAGE3-2` is CLOSED. Nothing blocks Plan Phase 0A.**

**Stopped on Operator instruction.** The Operator will **authorize Plan Phase 0A in a fresh session**.

**Outstanding Operator `Accepted`: none.**

---

## Position

| | |
|---|---|
| Branch / worktree / tree | `develop` / none / **clean** |
| HEAD | resolve with `git rev-parse HEAD` — five commits this day, latest `5f2118a` plus this continuity commit |
| Ahead of `origin/develop` | **NONE pushed** |
| Authorization in force | ⛔ **NONE.** No implementation authorization; **no `STANDING_LOCAL_EXECUTION_AUTHORIZATION`.** Every one of the hero plan's twelve phases needs explicit Operator authorization before any code is written |
| Database | ✅ Local **`best-coach-dev`** loaded and verified. The frozen `zjukuffiuzkbiblmnuwl` and the demonstration local stack were **never contacted** |

---

## ✅ `B-STAGE3-2` — CLOSED, Operator-executed

`npm run fixtures:local` **all green** against `supabase_db_best-coach-dev`: **3 Auth identities · 25 domain rows · 28 canonical rows**, canonical SHA **`6bdff280…c576`**, residue proof passed.

**Independently re-measured afterwards:** `audit_events` **0** · `audit_chain_heads` **0** · `reports` **0** · `report_versions` **0**. ⚠️ **The dirt is gone, not re-hidden** — those four counts were the whole of `B-STAGE3-2`. `verify-local-fixtures.sql` **exit 0**, all 7 negative tests correctly rejected, no residue, boundaries intact.

## ✅ The OWED ACL proof is DISCHARGED

`npm run prove:trusted-store-acl` — **9 PASS · 0 NOT-PASS.** `report_store_draft` **owner-only**, **zero client `EXECUTE`** for `anon` / `authenticated` / `service_role`, the control leg **discriminating**, `BYPASSRLS` at platform baseline.

⚠️ It had been **`UNMEASURED` (0 PASS · 9 NOT-PASS)** while the stack was down, and was **never reported as passing**. That mattered: the suite's own negative control is designed so a zero-row reading is `UNMEASURED`, never a pass.

## ✅ `P1-T09a` expansion applied — and the accidental DOUBLE-APPLY measured

⚠️ The Operator invoked it **twice**. **Measured, not reasoned from the guard's intent:**

| Family | Rows | Expected |
|---|---|---|
| `students` `e2` · `class_modules` `e4` · `class_sessions` `e5` | **6 · 2 · 3** | 6 · 2 · 3 |
| `enrolments` `e6` · `assignments` `e7` · `attendance` `e8` | **6 · 3 · 6** | 6 · 3 · 6 |
| `observations` `e9` · `observation_ratings` `ea` | **1 · 9** | 1 · 9 |
| **TOTAL** | **36** | **36** |

Whole-table totals exact too — `auth.users` **3** · students **7** · sessions **4** · observations **2** · ratings **18** — and **zero duplicates** on every natural key.

✅ **36 rows, NOT 72. NO DUPLICATION. NOTHING TO CLEAN.**

**Two independent reasons it could not duplicate:** the load block's precondition guard raises `Expansion aborted: % expansion rows already exist` when the `e2`/`e4`/`e5` sum is non-zero — **it measures 11 now**; and there is **no `ON CONFLICT` anywhere, with fixed-literal ids**, so a second load hits a primary-key violation and aborts.

⚠️ **One observation left unexplained rather than rationalized:** an aborted psql transaction prints `ERROR` then `ROLLBACK` at the `COMMIT`, yet `COMMIT` was reported. Which invocation produced the output that was read could not be reconstructed. **The database is the authority and it says 36.**

⚠️ **Standing consequence:** with expansion rows present the loader **refuses `--reload`** — they foreign-key the ratified trainer membership under `ON DELETE RESTRICT`. To reload the base fixture, run the expansion cleanup first (`do_expand=false`, `do_expand_cleanup=true`).

---

## ✅ Local isolation — the hazard that produced all of this

Renaming `project_id` to `best-coach-dev` broke three assertions and left **one production line pointing at the frozen database**.

| Fix | State |
|---|---|
| **Ports** — this clone moved to a disjoint **544xx** block | ✅ Both stacks run side by side. **No `supabase stop` was ever run against any project** |
| **`lib/supabase/public-config.ts`** — closed port allow-list | ✅ Left at 54321 it would have **refused this repo's own stack, or authorized the app to talk to the FROZEN one** |
| ⚠️ **`server/modules/ai-drafting/trusted-store.ts:34`** — was `const CONTAINER = "supabase_db_best-coach-mvp"` | ✅ **FIXED.** `storeDraft` docker-execs as `postgres` to write `report_version` rows — a draft generated here would have written a governed version **into the demonstration database** |
| **`scripts/physical-test/prove-trusted-store-acl.mjs:27`** — same literal | ✅ **FIXED.** It would have read the **demonstration** database's ACLs and reported them as this repository's |
| **Three broken assertions** + `server/platform/local-target.ts` | ✅ Guarded: unconditional **HARD DENY** of `best-coach-mvp`, then a fail-closed pin from **`BEST_COACH_LOCAL_PROJECT_ID`**; container names **derived**, never literal |

**Proofs:** `prove-local-target-guard.mjs` **31 passed · 0 failed · exit 0** — deny in seven shapes, through five entry points, absent/blank/malformed pins, deny-before-shape ordering, and a **drift assertion** that both guards' frozen id, shape pattern and variable name are character-identical. Deny confirmed firing **from `trusted-store`'s own path before `docker` is spawned**. Resolution is **lazy**, so `npm run build` exits **0** with no pin in the environment — the hosted deployment cannot crash on a variable it does not have. `tsc` 0 · `eslint` 0 · `prove:stage2-routes` **PASS, 17**.

⚠️ **The recorded general principle: DENY IDENTITY, NOT PORTS OR SPELLINGS.** Ports get reassigned and container names are derived; identity is the only stable thing to guard.

**Sweep of `app/` `lib/` `server/`:** `trusted-store.ts:34` was the **only** container-name literal, the only `docker` invocation and the only live `best-coach-mvp` value in production code. **No frozen hosted ref anywhere.**

## ✅ R-C2-5 — the TEST was amended, the RULING was not

Operator ruling: **the port number in R-C2-5 is workspace-scoped.** It names 54321 because one workspace existed when it was written; its binding content is **the pinning, not the digits**. `run-runtime-profile.mjs` now reads the `[api]` port from `supabase/config.toml`. Was **7 failing cases; now exit 0**. ⚠️ **Tighter, not looser** — it now fails if `public-config.ts` and the stack it must reach ever disagree, which a hardcoded number could never detect.

---

## The hero chain plan — twelve phases, by screen

`docs/plan/HERO_CHAIN_COMPLETION_PLAN.md` (revision 2). **`0A`** staff-identity projection · **`0B`** session metadata migration (`lesson_number`, `lesson_title`, `room`) · **`1`** `33` Parent Class Report · **`2`** `32` Parent Reports · **`3`** `05` · **`4`** `06` · **`5`** `07` · **`6`** `08` · **`7`** Trainer Review & Approve · **`8`** Trainer wording editor · **`9`** `29` · **`10`** `19` · **`11`** Management wording editor.

Each delivers projection → server action → frontend → end-to-end **before the next begins**. **Why the parent screens go first:** `CanonicalReportDto` carries **`panels` and `submittedAt` and nothing else** — the report page cannot say which class or session it is about, or name the learner in its own heading.

**All eight governance collisions are RULED** (`FINAL_MVP_HERO_CHAIN_RULINGS.md`, indexed at Authority Lock §2.3): `G-1` leave unframed · `G-2` ⛔ Overall Grade permanently excluded · `G-3` ✅ lesson number/title, ⛔ KEY FOCUS chips · `G-4` ⛔ term · `G-5` ✅ trainer name on Parent · `G-6` ✅ room · `G-7` ✅ `Main:`, ⛔ `Assist.` · `G-8` ⛔ evidence out.

---

## ⛔ STILL `NOT-RUN` / OWED

1. ⚠️ **The Phase 6a runtime carry-over re-proof — OWED, but UNBLOCKED FOR THE FIRST TIME since Batch 3.** The expansion supplies the second class session it needs. Backs **`CLAUDE.md` §10 Phase 1 exit (c)**. ⚠️ **Plan §9.3: it must run FIRST, on the code as it stands before Phase 7 changes anything**, and must never be conflated with `F-S6-REVIEW-1`.
2. **Rendered captures on all ten authenticated screens.** The Operator walkthrough is point-in-time and **does not substitute**.
3. Every disposable-stack harness · every real-provider leg · password sign-in · `design-foundation.assertions.ts` (no runner).

## ⚠️ One item flagged, awaiting your decision

**`CLAUDE.md` was NOT edited** during the ruling propagation. No ruling strictly requires it — the Authority Lock outranks it for Final-MVP-defining questions and now carries all eight. **The one arguable candidate:** `G-3`'s **KEY FOCUS prohibition** in **§12's stop-and-ask list**, since §14.0 makes §12 the list that binds and a session building screen `06` reads §12 well before Lock §13.

## Carried, untouched

`F-S6-REVIEW-1` (now scheduled as plan Phase 7) · `F-DEMO-1` · `F-EVIDENCE-SCOPE-1` · `B-C2-1` / `B-C2-2` · `F-REGION-1` · `F-STAGE3-1` (screen `09`) · the academy asset dependency (Operator-owned; **never** `TRUE-DRIFT`) · `OD-3` · the `Remember me` checkbox radius · **`Sign out` stays** (ruled 2026-08-10).

**Gates:** §3 persona sign-offs **NOT RECORDED**; no `CLAUDE.md` §10 phase-gate exit may be declared met. README and deployment instructions **still not written**. `B-G06-DET-1` — ⛔ **do not widen the lexicon.**

---

## Reading order for the next session

`CLAUDE.md` → `FINAL_MVP_AUTHORITY_LOCK.md` and operator rulings — ⚠️ **including `FINAL_MVP_HERO_CHAIN_RULINGS.md`** → `FINAL_MVP_EXECUTION_PLAN.md` → **`STATUS.md`** → recent `BUILD_NOTES.md` → **`docs/plan/HERO_CHAIN_COMPLETION_PLAN.md`** → `docs/plan/UI_RECONCILIATION_BATCH_3_ADJUDICATION.md`. ⚠️ **A reading order, not a precedence order** — precedence is `CLAUDE.md` §1. **Then verify state against the repository before acting** (§15.3).
