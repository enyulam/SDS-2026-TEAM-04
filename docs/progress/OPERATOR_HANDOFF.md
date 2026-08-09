# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> **NOT A TRACKER · NOT AUTHORITY · DERIVED.** Every line is reproduced or mechanically reduced
> from `STATUS.md`, `BUILD_NOTES.md`, the session stop report, `git`, and the live database. It
> originates nothing, adds no field, makes no judgement. **Where this and `STATUS.md` disagree,
> `STATUS.md` wins and this file is stale.** Overwritten at every stop (H-8). No secrets.

**Stop:** 2026-08-09 Asia/Singapore · **Ending fired: C** (context insufficient to begin *and
finish* Stage 2's first security-critical operation — the §7.4a **S-1** overwrite → read-back
that guards a billable surface)

## 1. Repository and environment

| Field | Value |
|---|---|
| Branch | `main` |
| HEAD at stop | resolve with `git rev-parse HEAD` — this file is inside the commit. Prior checkpoints this run: `83d7af1` → `dd8daa7` → `4de8293` |
| Working tree | CLEAN at stop |
| Remotes | **0** — nothing has ever been pushed |
| Worktrees | **1** (`main`). `worktrees/` absent from disk |
| Migrations | **17 on disk · 17 applied** (was 15) |
| Live census | **27 tables · 12 enums · 39 functions · 29 policies · 27 `authenticated` EXECUTE** · owner-only includes both draft-store writers |
| Data state | `auth.users` 3 · canonical `report_versions` 0 · canonical `audit_events` 0 · domain rows 61 |
| Local Supabase | UP. `supabase db reset` **never used** — forward `migration up` only |
| Provider · hosted · human · public · push · submission | **NO to all six** |

## 2. Phase and task

**Plan Phase 1 — OD-4 contract foundation.** `P1-T01…P1-T10` complete (`PASS`). **`P1-T11` IN
PROGRESS**, executing the **HERO V3 EXECUTION OVERLAY**, whose **STAGE 1 IS COMPLETE**.
⚠️ `PASS` is a session evidence verdict, **not** `Operator Accepted`; no session has written or
implied that mark. Plan-phase numbering, **not** `CLAUDE.md` §10.

**Ratified vocabulary (H-4):** PHASE 1 — IN PROGRESS · HERO-CRITICAL SUBSET — PASS ·
NON-HERO TASKS — PENDING.

## 3. What STAGE 1 delivered, and its exit condition

**EXIT MET:** the full lifecycle proven server-side against the real governed database — real
state machine, real audit, real RLS, no mocked transition — audit chain valid, submitted
canonical version persisted, committed. **`run-integration.mjs` exit 0, 49 `PASS`, 0 failures.**

**Eight of Stage 1's ten enumerated items were already shipped** and were re-proven, not
rebuilt (overlay §5: *do not assume a thing is missing because the plan lists it*). **Two were
net-new:**

| Migration | What it closes |
|---|---|
| `20260809210000_attendance_governed_write_path` | `attendance` had three SELECT policies and **no INSERT/UPDATE policy** — writable by nobody — so the fixture's hand-seeded row was satisfying `report_create`'s BC015 gate. Attendance is the **FIRST governed write of the whole report lifecycle**, so its entry condition was a harness artefact. `attendance_set_status` is now the only write path. **The harness INSERT was removed**, so the entire lifecycle rests on the governed write |
| `20260809220000_report_source_map` | Spec §20's **[KEY]** trace, `REQUIRED_FOR_FINAL_MVP` under **G-04 item 1**, absent from every migration until now. **NO enum** (a CHECK over the four `report_versions` panel column names — an enum §6.1 does not list is a §12 stop-and-ask). **`report_store_draft` byte-untouched, ZERO client EXECUTE preserved (R-27)**: the map is written by a second owner-only function inside the trusted channel's **same `DO` block / same transaction** |

## 4. Suites that RAN this session, serially, with exit codes

| Suite | Exit |
|---|---|
| `npx tsc --noEmit` | **0** |
| `npx eslint .` | **0** (one warning found and fixed by deleting the dead constant, not suppressed) |
| `run-integration.mjs` | **0** — 49 PASS, 0 failures |
| `run-canonical.mjs` | **0** — all proofs; canonical DB pristine |
| `verify-fresh-apply.mjs` | **0** — 17/17 apply from a **stripped** database in canonical order; canonical DB catalogue-equivalent to a fresh apply, **0 canonicalized differences** |
| `run-assessment.mjs` | **0** (45/45) |
| `run-c3-bypass.mjs` | **0** |
| `run-correction-tracking.mjs` | **0** |
| `run-concurrency.mjs` | **0** |
| `run-management-approved.mjs` | **0** |
| `prove-clock-hour-determinism.mjs` | **0** |
| `run-exit-condition-b.mjs` | **0** |
| `prove-od4-grant-guard.mjs` | **0** |
| `prove-g06-grounding.mjs` | **0** — 201 checks |
| `run-c2.mjs` | **0** — all proofs, T-C2-4(A) included |

## 5. NOT-RUN this session, with reasons — NOT merged with §4, NOT carried forward

| Item | Reason |
|---|---|
| `build` | A **Stage 3** gate, and Stage 2 changes the frontend next, so running it now measures a tree about to change. ⚠️ **Must be green before the automated-green hero checkpoint (G-07)** |
| `prove-governed-lifecycle.mjs` · `trainer-browser-smoke.mjs` · `three-role-browser-smoke.mjs` | Still **NEVER EXECUTED**. Need the disposable stack, a served app and a browser under §7.4a. **The C4 repair remains UNPROVEN** |
| `prove-disposable-identity-linkage.mjs` | Real `signInWithPassword` needs an Operator credential; stays NOT-RUN by design and must not be weakened |
| Every real-provider leg | **REAL PROVIDER: ZERO AUTHORIZED** |
| §3 persona sign-offs | Not recorded. No §10 phase-gate exit may be declared met without them |
| The other **22** harnesses' vacuity sweep | `NOT SWEPT — DEFERRED POST-REHEARSAL` (recorded disposition, HERO-FIRST RESEQUENCING RULING) |

## 6. Open gates, blockers, unratified decisions

| ID | State |
|---|---|
| **`B-C2-1`** `run-c2` flake | **OPEN · UNDIAGNOSED · NOT REPRODUCED THIS SESSION.** The authorized bounded look is **DONE and CARRIED**. ⚠️ **The serialization hypothesis is FALSIFIED AS STATED, by measurement:** `run-concurrency.mjs` allocates gates **7001–7004**; **`7301` appears in exactly ONE file in the tree** (`run-c2.mjs`), so the two cannot collide on it, and a live query found **ZERO advisory locks held cluster-wide**. **No replacement cause is asserted.** `run-c2` passing once does not close a flake, and on its earlier run the static scan **aborted before the runtime legs**, so those legs were NOT-RUN. ⚠️ **Hero negative control K remains NOT SATISFIED** |
| **`B-C2-2`** *(new)* | **OPEN · RECORDED · DELIBERATELY NOT FIXED.** `waitGranted`'s `pg_locks` predicate has **no `database` filter** and `pg_locks` is cluster-wide, so a same-objid advisory lock in any other database would satisfy the wait — a false-**GREEN** direction. Not repaired: changing the coordination primitive while the flake is undiagnosed could mask it |
| **`B-G06-DET-1`** detector coverage | **OPEN · UNRATIFIED.** A measured detector-**coverage** finding, not a residual. Rule 3 is lexical; **only 3 of 18** measured positive formulations about a `needs_support` dimension are matched — **15 unmatched**. ⛔ **Do not widen the lexicon. Do not propose a fix.** The Operator will rule before the demonstration rehearsal. **The bound containing it — the fixture emits none of that vocabulary — EXPIRES the moment a real provider is enabled** |
| **G-07** (P1-T11 → Phase 2 entry) | **OPEN.** In range of the standing local authorization; Phase 1 has not reached `PASS` |
| Unratified, still stop-and-ask | rule 4 extended to `developing` · inverse **rule 4b** · narrowing `DIMENSION_TERMS.audience_awareness` |
| Authorization in force | `STANDING_LOCAL_EXECUTION_AUTHORIZATION`, **Plan Phases 0–4, LOCAL only** (2026-08-08) · **HERO-FIRST RESEQUENCING RULING** (H-1…H-8) |

## 7. Recorded-not-fixed, and the clause preventing the fix

| Item | Blocking clause |
|---|---|
| M13's `schema_migrations` row has an empty `name` | Cosmetic; Operator instruction forbids altering canonical DB state to tidy it |
| `CLAUDE.md` §14.3a prose still describes worktree directories as inspectable | Corrected by annotation 2026-08-09; a deeper rewrite needs its own bounded §12 instruction |
| **`report_source_map`'s `field` half is absent** | **A STATED SCOPE BOUND, not a defect.** No derivation exists from ratified anchors, and a reserved-but-unpopulated `source_kind`/`source_field` pair is the placeholder column §12 forbids |
| `B-C2-2` | See §6 — fixing it could mask `B-C2-1` |

## 8. Claims in this run that are NOT proven by execution

- **The three browser/C4 harnesses remain NOT-RUN.** Nothing this session changed that. **The C4 repair is still verified only by static selector/catalogue agreement.**
- **`B-C2-1` is not diagnosed.** One passing run is not a diagnosis, and no cause is claimed.
- **`build` has not been run.** Its last green is a prior session's measurement and is not carried forward.

## 9. Exact next permitted action

**STAGE 2 of `docs/plan/HERO_V3_EXECUTION_OVERLAY.md`** — the thinnest viable UI, in chain
order, all three roles: **Trainer** session entry → roster → attendance → nine ratings →
observations → save → request draft → review → edit → approve · **Management** pending list →
detail → approve & submit · **Parent** reports list → submitted detail, **OD-4 panels only**.
**Visually thin is ACCEPTABLE. Governance is NOT** — Q-27 binding, Management wording-only
authority binding, no raw ratings in the Parent payload.

⚠️ **§7.4a `S-1` EXECUTES AT THE START OF STAGE 2**, where the served app first appears:
overwrite `LLM_PROVIDER` / `LLM_MODEL` / `LLM_API_KEY` in **every served child process** with a
proven-unratified literal and **READ THEM BACK** — **never delete them** (`@next/env` silently
refills a deleted key from `.env.local`, the exact mistake behind the earlier billed run). Then
**S-2** assert `BEST_COACH_RUN_REAL_PROVIDER_LEG` UNSET · **S-3** arm the outward-call
trip-wire · **S-4** if S-1/S-2 cannot be satisfied, it is not a local task — stop.

**S-1 correctly did NOT apply to Stage 1** (no served child process). **S-2 and S-3 DID apply
and were executed**, because `run-integration.mjs` imports and can construct
`OpenAiDraftProvider`; `INT-PG` observed **ZERO non-loopback requests**.

Validation remains a **global mutex**, serial only. Every login leg is recorded as
**"ADMIN-MINTED SESSION — password sign-in NOT-RUN (Operator credential required)"** and is
**never** described as a sign-in proof. Per-leg proof required that the leg **EXECUTED**, every
selector **MATCHED**, and **no assertion was vacuous**; an aborted, skipped, zero-match or
vacuous leg is **NOT-RUN**, never `PASS`.
