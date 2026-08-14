# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> ⛔ **NOT A TRACKER · NOT AUTHORITY · DERIVED.** Every line is reproduced or mechanically
> reduced from `STATUS.md`, `BUILD_NOTES.md`, `PORTAL_COMPLETION_PLAN.md`, `git`, or a live
> measurement. **Where this and `STATUS.md` disagree, `STATUS.md` WINS and this file is STALE.**
> Written at every stop and **OVERWRITTEN, never appended** (`FINAL_MVP_G06_GROUNDING_RULING.md` §H-8).

**Regenerated:** 2026-08-15 · branch `develop` · HEAD `a76afa0` · **pushed and verified from origin**
· ✅ **`P2-9` complete under the batch** · ⏸ **`P2-12` … `P2-14` are WRITE paths and stop.**

## ⚠️ §15.8.1 FRESHNESS SWEEP

**Every open item, blocker and stated limit re-verified. Nothing copied forward. Two lapses.**

| Carried previously | Re-measured now |
|---|---|
| `P2-9` BLOCKED on schema | ⛔ **LAPSED — AUTHORIZED AND COMPLETE.** Two read functions, two grants |
| Pushed = `d6b0305` | ⛔ **LAPSED.** `origin/develop` = **`a76afa0`** = local HEAD, read from origin. `origin/main` = `5eb84bc`, **UNTOUCHED** |
| `Phone` / `Employee ID` on `24` | ✅ **STILL OPEN. CARRIED** — no column exists; still your decision |
| The 7-day invitation lifetime | ✅ **STILL A DISCLOSED DEFAULT. CARRIED** — no instrument names a duration |
| `AR-4-14` + `AR-4-17` | ✅ **STILL TRUE. CARRIED** — the only open **rule** question |
| `D-10` intermittent | ✅ **STILL TRUE. CARRIED.** Not re-run: a flaky check closes on a diagnosed cause, never on a run of green |
| `S3-T1-r` · `S3-00` · `B-G06-DET-1` · §10 Phase 1 exit (c) · `09`/`C2C-007` · the mojibake repair · `test:continuity`/`test:exit-condition-b` | ✅ **ALL STILL TRUE. CARRIED** |
| VISUAL walk `NOT-RUN` | ✅ **STILL TRUE** — now **seven**: `11`, `14`, `17`, **`18`**, `23`, `24`, `25` |

---

## ⏸ THE NEXT STOP, STATED EARLY: `P2-12` … `P2-14` ARE **WRITE** PATHS

Your batch is *"any phase needing ONLY read-side schema"*. ▶ `P2-12` (`20` Register Student),
`P2-13` (`21` Create Parent Account) and `P2-14` (`22` Edit Student) each need a **write** RPC —
measured: **no create or update path exists for a student or a parent**, exactly as none existed for
a trainer before `P2-11`. ⛔ **They fall outside the batch and will stop for you, stated with tables,
columns, policies, grants and audit strings.**

✅ **`P2-15` (`15` Lesson Statistics) and `P2-16` (`16` Class Statistics) ARE inside the batch** —
both are read-only aggregates. **That is where I go next**, so the three write phases stop **once,
together**, rather than three times.

---

## ✅ `P2-9` — SCREEN `18` MANAGEMENT STUDENT PROFILE

### Functions and grants added under the batch — **named, not counted**

| Function | Grant |
|---|---|
| `public.report_management_student_trend(uuid)` | `EXECUTE` → `authenticated` |
| `public.report_management_student_reports(uuid)` | `EXECUTE` → `authenticated` |

⛔ **And nothing else.** No table, column, enum, policy, client table grant or audit string. Census
`T=30 E=12 P=30 R=23`. **`PS-5b` proves ZERO client table grants** on `observations`,
`observation_ratings`, `reports` and `report_versions`.

⚠️ **TWO functions rather than the one proposed, and the reason is your own ruling.** One function
returning `jsonb` would have made *"assert the returned shape"* **impossible** — you cannot assert a
shape over an opaque blob. ✅ **And one FEWER than proposed**, by §12.10: the `ASSESSMENTS` tile is
`trend.length`, because `A-017` makes all nine mandatory and the RPC drops any session without
exactly nine.

### The ruled assertion, four deep

`VP-4a` pins both result types **string for string** · `VP-4b` bars every rating / band / panel /
hash name from the result types · `VP-4c` keeps `V-4`'s body bar **minus the rating family only** ·
⛔ **`PS-4b` scans the returned VALUES**, because a `text` column can carry `Mastering` without the
shape ever changing.

⚠️ **`V-4`'s verbatim form would have failed this migration on its own correct implementation** —
the ruling *is* that this body aggregates ratings. Your wording named the right locus, and moving
the assertion there made it **stricter**: four checks where `V-4` had one, and the strongest cannot
be satisfied by anything but the exact contract.

### `D-2` never rendered — three layers

`PS-7b` bars `toFixed`, a `%`-suffixed score in a text node, the score in an `aria-label` **or** a
`title` (⚠️ **a screen reader is a role**), the score as element content, and any band label.
⛔ **`PS-7c` asserts the chart STILL RENDERS** — an emptied chart satisfies every prohibition
perfectly. **`PS-3c` makes the value falsifiable**: the mixed fixture yields **`44.44` and `63.89`**,
strictly between band floors and **not on one**, so a constant, an unmapped `NULL` or a
count-instead-of-average would all fail.

### Eight refusals on that screen

Skill Breakdown (`GC-6`/`C-9`) · Strengths chips (your ruling — they are the Breakdown thresholded) ·
Reports `GRADE` (`G-2`) · `Generate Term Report` (`C-11`) · the TA line (`A-014`) · `Date of birth`,
`Contact`, `Student ID` (**no column**, measured) · `Good standing` (not a concept anywhere) ·
`Edit` **disabled-with-a-reason** — ⚠️ **unlike screen `23`'s ABSENT one**, because `22` Edit
Student **exists** in the ratified 36 and lands at `P2-14`.

---

## ⛔ THE RULE YOU PUT IN §12 HAS A CEILING — FOUND BY THE VERY NEXT PHASE

`P2-11`'s closure was *"every migration declaring a function executes it at apply time."* ▶ **`P2-9`
shipped a function that PASSED that leg and still raised for a real caller**:

```
ERROR:  column cg.label does not exist
```

⚠️ **`VP-2` executed both functions and failed closed CORRECTLY.** But an owner-probe returns at the
**first gate**, this body sits behind **three**, and `plpgsql` resolves lazily. ⛔ **`P2-11`'s defect
was caught by that leg only because its failing statement was THREE LINES PAST the gate** — luck of
placement, not coverage, and reading it as coverage is exactly what `P2-9` did.

> ### ⛔ **THE RULE HAS TWO LEGS AND NEITHER SUBSTITUTES FOR THE OTHER.**
> **1. Apply time** — proves resolution **up to the first gate**, and that the gate fails closed.
> **2. The paired suite** — executes it **as a real authorized caller, past every gate, against
> fixture data**. **Only this reaches the body.**

`PS-3`/`PS-3b` are leg 2 and are what caught this. Corrected forward under `R-1`; `VQ-2` now runs
the failing query verbatim at apply time. ▶ **Recorded in plan §26.1. `CLAUDE.md` §12's text stays
correct as written — it is a floor, and this is its ceiling.**

---

## ✅ THE `exact: true` TRAP, CAUGHT BY LOOKING

`Classes` hit `C2C-002` at `P2-2`; `Trainers` at `P2-11`, found by a red leg after the ratchet went
unread for a phase. ▶ **`Students` would have hit it here, and it was checked before the child route
shipped.** ⛔ **A rail item is `exact` only while it has no child route, and shipping a child is the
moment to check.**

✅ **And the route ratchet fired *during* this phase** — red on the same run that shipped screen
`18`, read, and moved before the phase closed. ▶ **That is §12.13's correction working:** the gate
was always fine; what changed is that it ran at the end of the phase that touched its subject.

⚠️ **Your framing is recorded in plan §25.2 as the general rule:** *an unread gate does not just miss
its own finding, it masks whatever it would have surfaced.* The route census's own finding was one
missing expectation — cheap. What it hid was a **blank sidebar on a real page**, invisible to `tsc`,
to `lint`, to the build and to the page itself.

---

## STATE

| | |
|---|---|
| Branch · worktree · HEAD | `develop` · main worktree · `a76afa0` · clean |
| Pushed | ✅ **`origin/develop` = `a76afa0` = local HEAD**, read back from origin |
| `main` | **UNTOUCHED** — `5eb84bc`, verified from origin |
| Containers | **dev 9 · mvp 0** ⛔ demonstration stack never started or queried |
| Ports | `:3000` held by your walk server; untouched by me |
| Migrations added this stretch | **4** — `P2-11` + its `R-1` fix, `P2-9` + its `R-1` fix |
| Census | tables **30** · enums **12** · policies **30** · registry **23** |
| Portal suites | `p2-1` … `p2-11` + `ruling-a` — **all 15 PASS** |
| Navigation census | **all proofs passed**; 26 routes, 28 with aliases |
| `tsc` · `build` · `lint` · `prove:encoding` | clean · clean · **0 errors** · PASS |
| `T-P44`/`T-P44c` · `prove:no-secrets` | **PASS, unchanged** · **CLEAN** |
| Deliberately red | `prove:artefact-read` (`AR-4-14`/`AR-4-17`) · `prove:serving-discipline` (`D-10`) |
| `NOT-RUN` | `bodySizeLimit` (browser leg) · `prove:stage2-routes` · `prove:stage3-authenticated` · VISUAL on `11`/`14`/`17`/`18`/`23`/`24`/`25` |
| ⏭ Next | **`P2-15` (`15` Lesson Statistics)** then **`P2-16` (`16` Class Statistics)** — both read-only, both inside the batch. ⏸ **`P2-12`/`13`/`14` will stop together**, as write paths |
