# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> ⛔ **NOT A TRACKER · NOT AUTHORITY · DERIVED.** Every line is reproduced or mechanically
> reduced from `STATUS.md`, `BUILD_NOTES.md`, `PORTAL_COMPLETION_PLAN.md`, `git`, or a live
> measurement. **Where this and `STATUS.md` disagree, `STATUS.md` WINS and this file is STALE.**
> Written at every stop and **OVERWRITTEN, never appended** (`FINAL_MVP_G06_GROUNDING_RULING.md` §H-8).

**Regenerated:** 2026-08-14 · branch `develop` · ✅ **`P2-7` COMPLETE — screen `11` built and proven.**

## ⚠️ §15.8.1 FRESHNESS SWEEP

**Every open item, blocker and limit re-verified against current state before deriving. Nothing
copied forward from the previous handoff.**

| Carried previously | Re-measured now |
|---|---|
| `P2-7` stated and stopped at two gates | ⛔ **LAPSED — you ruled both.** `P2-7` is **COMPLETE** |
| `D-10` red, "needs a diagnosis" | ⛔ **LAPSED. `prove:serving-discipline` now exits 0, `PASS` on two consecutive runs.** ▶ The original diagnosis was **right**, which is why it cleared: it was reporting a **real surviving `node.exe`**, not a false red. That process has exited. ⚠️ Recorded as *lapsed*, **not as "never a problem"** — a future run leaving a process behind will correctly go red again. **Nothing was changed to achieve this** |
| `AR-4-14` `KNOWN-RED` | ✅ **STILL TRUE. CARRIED.** `prove:artefact-read` re-run: **44 PASS · 1 FAIL**, verdict unchanged and deliberately failing |
| `S3-T1-r` | ✅ **STILL TRUE. CARRIED.** Re-measured as the **sole** stage-3 FAIL. Remedy known (`?month=`); authorization missing |
| `09` refuses its canonical route (`C2C-007`) | ✅ **STILL TRUE. CARRIED** — the route file is still absent on disk |
| The mojibake repair | ✅ **STILL TRUE. CARRIED** — `STATUS.md` carries **1** occurrence, unchanged from HEAD; this session introduced none |
| `S3-00` · `B-G06-DET-1` · §10 Phase 1 exit (c) · `test:continuity` / `test:exit-condition-b` (`B-STAGE3-2`) | ✅ **STILL TRUE. CARRIED**, unchanged |

▶ **One item had LAPSED (`D-10`) and it was corrected in `STATUS.md` FIRST, then re-derived here** —
correcting only the handoff would have reproduced the defect, because the next derivation reads the
source again. ⚠️ **It would otherwise have been carried into a third handoff as an open blocker that
was not blocking anything.**

---

## ✅ WHAT SHIPPED: `P2-7`, screen `11` Management Dashboard

Both §16 gates were ruled and executed. Screen `11` answers at its canonical route
**`/management/dashboard`**; **`/management` is preserved as a compatibility redirect** on the
ratified `R-B1` precedent.

| Ruling | Executed as |
|---|---|
| **1 — chips AND row descriptions, one leak** | Row carries **learner · session date · status** only. **Both omissions cited together at the same site**, descriptions named as **assessment substance, not a copy preference**. Guards bar the **vocabulary**, so one detector catches chip and sentence alike |
| **2 — `Approved` → `Submitted`** | Third Step 7I1D-R2 sighting, cited **as an Operator ruling** |
| **3 — schema, centre scope** | `20260814140000`: **1** `SECURITY DEFINER` read · **0** tables/columns/enums/policies/client-grants · **registry unmoved at 23** · four `V-4` bars **plus a control proving each fires** |
| **4 — route option 2** | Canonical route + redirect + rail re-pointed to the **destination** |

⚠️ **A second migration `20260814141000` is a FORWARD COMMENT CORRECTION under `R-1`**, not a second
change — the first said *"screen 14"* where the screen is `11`, and an applied migration is
corrected forward, never edited.

---

## ⛔ THE ONE FINDING WORTH YOUR TIME: a defect no SQL leg could see

**This phase's seven SQL legs were ALL GREEN while all four KPI tiles rendered the refusal em dash
in the browser.**

- `report_centre_dashboard_summary` is `RETURNS record` → PostgREST returns a **bare object**.
- Its peer `report_class_health_summary` is `SETOF record` → an **array**.
- The consumer read `rows[0]` → `undefined` every call → **failed closed**.

⚠️ **Failing closed is what hid it.** The surface rendered its refusal state, which looks
deliberate — `Q-7`'s em dash was a *correct* control reporting a *false* condition.

⚠️ **No SQL leg could have caught it:** `SELECT … FROM f()` reads both shapes identically. The
existing rule closes *"a structural assertion cannot prove a function RUNS"*; **this is the next gap
out**, and only the painted page could see it.

**Caught by** the new `S3-M8-live` leg · **fixed with** `readMaybeRow`, the already-ratified helper
(**code only, no schema change**) · **mechanized as `PDSa-SHAPE`**, reading `proretset` from
`pg_proc`, with a control. ▶ **All 9 RPC consumers in the codebase now match** — the defect was
isolated to this one read.

⚠️ **The new rule's own first draft was wrong and is recorded that way:** it compared `proretset`
against `"t"` where the cast yields `true`/`false`, reporting **five mismatches that were not real**.
Caught because one contradicted a catalogue reading taken minutes earlier and **the contradiction
was checked against the database rather than believed** — and **its control refused to certify at
the same moment**.

---

## ⏸ WHAT NEEDS YOU

1. **VISUAL acceptance on `11`, `14` and `25`** — all three `NOT-RUN`. You said you would walk them
   together rather than start the server for two screens. **Tell me when you want `:3000` clear.**
2. **`S3-T1-r`** — remedy is known (`?month=`, exactly as `S3-M6` already does it); only the
   authorization is missing.
3. **`AR-4-14`** stays `KNOWN-RED` by your ruling. ⚠️ **A second frame hitting the same wall is a
   stop-and-ask, not a second `KNOWN-RED`.**

**Nothing is blocked on you to continue** — `P2-8` is next in plan order, and every schema change
still stops for your authorization.

---

## STATE

| | |
|---|---|
| Branch · worktree | `develop` · main worktree |
| Containers | **dev 9 · mvp 0** ⛔ the demonstration stack was never started or queried |
| Ports | `:3000` untouched all session. `:3423` used for one route-security run and **released** |
| Migrations added | 2 (`20260814140000`, `20260814141000` — the second a comment-only `R-1` correction) |
| Audit registry | **23, unmoved** |
| Portal + hero suites | **34 / 34 green** |
| `prove:portal-p2-7` | **PASS** (0 failed checks) |
| stage 3 | **43 PASS · 1 FAIL · 2 NOT-RUN** — the FAIL is the carried `S3-T1-r` |
| `integrated-route-security` | **26 / 26**, `canonicalRoutes: 18`, `guardedPortalRoutes: 16` |
| Deliberately red | `prove:artefact-read` (`AR-4-14`, `KNOWN-RED`). ⚠️ `AR-4-11` — **this phase's own artefact citation — PASSES** |
| `tsc --noEmit` · `npm run build` | clean; the build lists `/management/dashboard` |
