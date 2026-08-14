# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> ⛔ **NOT A TRACKER · NOT AUTHORITY · DERIVED.** Every line is reproduced or mechanically
> reduced from `STATUS.md`, `BUILD_NOTES.md`, `PORTAL_COMPLETION_PLAN.md`, `git`, or a live
> measurement. **Where this and `STATUS.md` disagree, `STATUS.md` WINS and this file is STALE.**
> Written at every stop and **OVERWRITTEN, never appended** (`FINAL_MVP_G06_GROUNDING_RULING.md` §H-8).

**Regenerated:** 2026-08-14 · branch `develop` · ✅ **`P2-8` COMPLETE** · ⏸ **stopped on ONE rule
question that is yours, plus the four-screen visual walk.**

## ⚠️ §15.8.1 FRESHNESS SWEEP

**Every open item re-verified against current state. Nothing copied forward.**

| Carried previously | Re-measured now |
|---|---|
| `D-10` **LAPSED** (my call at `P2-7`) | ⛔ **THAT CALL WAS WRONG AND IS WITHDRAWN.** `prove:serving-discipline` is **RED AGAIN** — port `3419` **free**, process tree surviving, the original signature. ▶ **`D-10` is INTERMITTENT, not resolved.** ⚠️ The error was **evidentiary**: two consecutive passes cannot establish that a flaky check has resolved, and both were taken moments after a teardown had cleared the machine. **A flaky check is closed by a diagnosed cause, never by a run of green.** **CARRIED** |
| `AR-4-14` `KNOWN-RED` | ✅ **STILL TRUE, and now joined by a SECOND instance — see below.** `prove:artefact-read`: **48 PASS · 2 FAIL** |
| `S3-T1-r` | ✅ **STILL TRUE. CARRIED.** Remedy known (`?month=`); authorization missing |
| `09` refuses its canonical route (`C2C-007`) | ✅ **STILL TRUE. CARRIED** — route file still absent |
| The mojibake repair | ✅ **STILL TRUE. CARRIED** — 1 occurrence in `STATUS.md`, unchanged from HEAD |
| `S3-00` · `B-G06-DET-1` · §10 Phase 1 exit (c) · `test:continuity`/`test:exit-condition-b` (`B-STAGE3-2`) | ✅ **STILL TRUE. CARRIED**, unchanged |
| `P2-7` complete, `P2-8` next | ⛔ **LAPSED — `P2-8` is now COMPLETE.** `P2-9` is next |

---

## ⏸ WHAT NEEDS YOU

### 1. ⛔ `AR-4` — THE SECOND INSTANCE. This is the rule question you reserved.

> Your `P2-6` ruling: *"If a later frame hits the same wall, bring it to me; two instances would
> make it a rule problem rather than a frame accident."*

**A second frame has hit it.** `AR-4` requires **≥6 distinct** cited values with **≥2 fractional**.
Screen `17` can honestly cite **five, of which one is fractional**.

- The frame carries exactly three fractional values — `10.50px`, `12.50px`, `13.50px`. **Only
  `12.50px` belongs to this screen**; `10.50px` is the shell's `Management Portal`, and `13.50px`
  is the shell's sidebar nav whose only other use is the **unbuilt** `Add Parent`.
- ⚠️ **A sixth value was cited and a leg rejected it.** `999px` was in my first draft; `AR-5`
  failed it because the component uses `rounded-full` — **quoted, not built to**. That is precisely
  the move your screen-`14` ruling refused, and **the rule caught it rather than me.**

⛔ **Every route to green refused, on your own reasoning:** icon geometry is fabricating evidence,
rewriting the shell touches accepted screens, lowering the threshold stops measuring the next frame.
⛔ **NOT recorded as a second `KNOWN-RED`** — your ruling forbids that.

**Related, recorded not fixed:** the frame's row avatar is `36px`; the shared `Avatar` offers
`24/32/40/44/48/58` and has no `36px`. `small` (32px) is used, because adding a size touches a
shared control on accepted screens.

### 2. ⏸ THE VISUAL WALK IS NOW FOUR SCREENS — `11`, `14`, `17`, `25`

All four `NOT-RUN`. **This is the boundary you asked to be told about.**

### 3. Push

⛔ **`P2-8` IS COMMITTED BUT NOT PUSHED.** Your authorization read *"develop only, **this
phase**"* and covered `P2-7`; `P2-8` is a new phase, so it does not carry.

---

## ✅ WHAT SHIPPED: `P2-8`, screen `17` Management Students

**No schema — measured, not assumed.** Zero migrations, columns, policies, grants, RPCs. All eight
tables carry an `authenticated` SELECT **grant**, **RLS enabled** and a permissive SELECT
**policy** (three layers), exercised **both directions**: management reads 13 learners, the parent
reads exactly the 8 they hold an active link to, and zero unlinked learners leak.

⚠️ **§12.10 paid for itself on the very next phase.** The plan records *"guardian name and contact
need columns"* — true of `parent_profiles` — but the NAME lives on `accounts.display_name` and
management already reads every hop. **A schema authorization would have been requested for a column
that was never needed.** (Not discharged for `P2-12`/`P2-13`, which *create* a parent.)

**Five refusals:** the `Overall` rating chip column (`C-9`, whose register row names `P2-8`, **and**
`G-2` — **absent, not empty**; a leg proves no rating column is even reachable) · `ID 2025-113` (no
column) · `Junior` (not a ratified grade) · `Register Student`/`Add Parent` (end at `P2-12`/`P2-13`)
· `View more ›` (ends at `P2-9`).

⚠️ **Two defects the shared controls caught.** My first draft reinvented `Avatar`, `SearchInput` and
`Select`; the avatar copy tinted **by row index**, so a learner changed colour when the filter
reordered the table — the shared `Avatar` tints deterministically from the name. And the type scale
was **guessed before it was measured**: I had `13.5px`/`13px`, the frame has `13px`/`12.50px`,
inverted.

---

## STATE

| | |
|---|---|
| Branch · worktree | `develop` · main worktree |
| Pushed | `origin/develop` = `df15ad9` (`P2-7`). ⛔ `P2-8` committed locally, **not pushed** |
| Containers | **dev 9 · mvp 0** ⛔ demonstration stack never started or queried |
| Ports | `:3000` untouched all session |
| Migrations added by `P2-8` | **none** |
| Audit registry | **23, unmoved** |
| Portal + hero + rule suites | **39 / 39 green** |
| `prove:portal-p2-8` | **PASS** (7 SQL legs + 18 code-side checks) |
| Route census | **22 → 23**, rewritten with screen `17` named |
| Deliberately red | `prove:artefact-read` **48 PASS · 2 FAIL** (`AR-4-14` ruled `KNOWN-RED`; **`AR-4-17` escalated**) · `prove:serving-discipline` (`D-10`, **intermittent**) |
| `tsc --noEmit` · `npm run build` | clean; the build lists `/management/students` |
