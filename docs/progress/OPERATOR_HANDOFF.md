# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> ⛔ **NOT A TRACKER · NOT AUTHORITY · DERIVED.** Every line is reproduced or mechanically
> reduced from `STATUS.md`, `BUILD_NOTES.md`, `PORTAL_COMPLETION_PLAN.md`, `git`, or a live
> measurement. **Where this and `STATUS.md` disagree, `STATUS.md` WINS and this file is STALE.**
> Written at every stop and **OVERWRITTEN, never appended** (`FINAL_MVP_G06_GROUNDING_RULING.md` §H-8).

**Regenerated:** 2026-08-15 · branch `develop` · HEAD `3197f31` · ✅ **`P2-6R` and `RULING A` both
COMPLETE** · ⏸ **two rulings waiting on you, neither blocking `P2-10`.**

## ⚠️ §15.8.1 FRESHNESS SWEEP

**Every open item re-verified against current state. Nothing copied forward. Three lapses found.**

| Carried previously | Re-measured now |
|---|---|
| `P2-6R` **PARTIAL**, upload inert | ⛔ **LAPSED — COMPLETE.** You ruled route (b); upload is built and proved end to end. **No control on screen `14` is inert** |
| The upload-transport ruling **OPEN** | ⛔ **LAPSED — RULED.** `T-P44` unchanged, not one character |
| `origin/develop` = `df15ad9`, `P2-8` unpushed | ⛔ **LAPSED (corrected at `9a374e6`).** `git ls-remote` says **`288d261`** — `P2-8` **is** pushed. Corrected in `STATUS.md` FIRST, then derived here |
| `D-10` **intermittent** | ✅ **STILL TRUE. CARRIED.** Not re-run; a flaky check closes on a diagnosed cause, never on a run of green |
| `AR-4-14` `KNOWN-RED` · `AR-4-17` escalated | ✅ **BOTH STILL TRUE. CARRIED**, unchanged |
| `S3-T1-r` · `S3-00` · `B-G06-DET-1` · §10 Phase 1 exit (c) · `09`/`C2C-007` · the mojibake repair · `test:continuity`/`test:exit-condition-b` | ✅ **ALL STILL TRUE. CARRIED**, unchanged |
| VISUAL walk = `11`, `14`, `17`, `25` | ✅ **STILL `NOT-RUN`.** ⚠️ **`14` and `11` have BOTH CHANGED since you walked them** — see below |

---

## ⏸ WHAT NEEDS YOU — two rulings, neither blocking

### 1. ⛔ `Strengths & Focus Areas` on screen `18` — **B, ANSWERED**. `P2-9` waits on this.

**It is a DERIVED RATING SUMMARY, not OD-4 panel text.** Measured from the `.png`:

| Bucket | Chips | Colour |
|---|---|---|
| `STRENGTHS` | Eye contact · Emotional expression · Body language | green |
| `AREAS TO GROW` | Vocal projection · Tonality | amber |

⛔ **Cross-checked against the Skill Breakdown on the same frame: the three `STRENGTHS` chips are
the three HIGHEST bars, the two `AREAS TO GROW` chips the two LOWEST.** ▶ **The same per-dimension
rating data, thresholded into two buckets.**

⚠️ **THE NAME IS A TRAP.** `OD-4`'s `Strengths` is narrative prose about **one session's report**;
this is **dimension names partitioned by rating across a TERM**. Matching on the word alone would
build a rating projection while believing it was already-governed report content.

⚠️ **The `.md` alone would not have settled it** — *"separates strong criteria from areas needing
attention"* fits both readings and never says the tags are dimension names. §7.4.1 working exactly
as written.

⛔ **IT IS ALREADY RULED OUT TWICE.** `C-9` — `18` is a **profile** surface, and the plan's own
`P2-9` row already bars Skill Breakdown on that exact ground; this is the same data coarser.
`G-2` — **the `GC-6` register row already names *"Strongest / Focus area"***.

▶ **MY RECOMMENDATION: DO NOT BUILD. `REGISTERED-OMISSION`.**
⚠️ **The cost, stated:** screen `18` loses **both** right-column analytics cards. `Q-27`'s precedent
applies — Profile Details promotes up, **no filler card**, and the absence is `EXPECTED` at visual
acceptance rather than a regression.
⚠️ **Three more rating projections on that frame, flagged now rather than at build time:**
`ASSESSMENTS 24`, `ATTENDANCE 96%`, and the Reports table's `GRADE` column.

### 2. ⏸ A BARE-WORD RATING DETECTOR — and I did **not** touch it

My non-resumability copy read *"it starts again from the **beginning**"* and turned `PLMa-RATINGS`
red: that leg matches the four rating labels **as bare words**.

⛔ **I reworded the sentence and left the detector alone**, on your `AR-4` reasoning — *"a rule
relaxed to fit one frame stops measuring the next"* — because narrowing a detector so my sentence
passes is the same move from the other direction.

▶ **But the shape is a real finding, and `A-052` names it explicitly.** `CLAUDE.md` §3.4
**prohibits** a bare-word regex over those four words, because *"at the beginning of the session"*
is valid English. ⚠️ **It will trip again, late, on a phase with nothing to do with ratings.**
A rule question, like `AR-4`.

### 3. ⏸ `AR-4` second instance — still open, unchanged.

### 4. Push · `:3000`

⛔ **Six commits ahead, none pushed** (`6c18a71` … `3197f31`). Your authorization reads *"develop
only, **this phase**"*.
`:3000` still held by your walk server, so `prove:stage2-routes` / `prove:stage3-authenticated` are
**`NOT-RUN`, not passing**. ⚠️ **I will need it clear to exercise Next's Server Action body
pipeline — `bodySizeLimit` is the one part of the upload that is `NOT-RUN`.**

---

## ✅ `P2-6R` COMPLETE — the transport, ruled (b)

⛔ **`T-P44` is unchanged, not one character.** The relay needs no widening: the upload runs on the
**caller's own request-scoped client**, and ADR-3 records that the database role follows the
**credential**, not the code location — so the one storage INSERT policy gates it exactly as it
would a browser.

⚠️ **`bodySizeLimit` is DERIVED.** The multipart envelope was **measured at its worst case —
1,070 bytes** (255-byte filename, 200-char display name, longest ruled MIME type, Next's
`$ACTION_ID`). 25 MiB therefore requires 26,215,470; **set to 26,218,496 = ceiling + 4 KiB**, 3.8×
the envelope and 0.016% above the ceiling. ⛔ **Not rounded to `26mb`** — a transport limit generous
enough to admit a file the database will refuse turns a clean rejection into a 25 MiB round trip
that fails at the end.

⛔ **Three port members, not evidence's four.** `D-5`'s ticket/attach split exists because its bytes
**bypass** the server; here they come through it, so splitting buys nothing and costs a window in
which an object sits in the bucket referenced by no row.

⚠️ **Non-resumability is stated AT THE CONTROL, permanently** — *"Uploads do not resume — an
interrupted upload must be started again from scratch."*

**`prove:portal-p2-6r-e2e` — 18 legs PASS:** file to bucket as management · ⛔ **TRAINER REFUSED by
the same policy (the control)** · row written · **type and size read off the STORED object** ·
exactly one `material.attached` · the signed URL **actually returns the bytes** · read emits
nothing · removal with `material.removed` · object deletable · fixture unmoved. ⚠️ `audit_events`
**deliberately not restored** — a proof that could unwind an append-only hash chain would disprove
the chain.

## ✅ `RULING A` COMPLETE — the dashboard reads ENROLLED

**Census UNMOVED: tables 30 · enums 12 · policies 30 · registry 23 · functions 62**, asserted 8×
at apply time and re-measured after.

⚠️ **The hard part was the rename-that-isn't.** `totalStudents` kept its name and changed its
meaning, and **both readings were 13 at HEAD** — so *"total students is 13"* would have passed
against the **old** function too. ⛔ **`RAa-2` CONSTRUCTS the divergence**: withdrawing one learner
moved the tile **13 → 12 while `public.students` stayed 13**. ▶ It **fails against the pre-ruling
function**, which is the only proof that could tell them apart.

⚠️ **It found a constraint nobody had named:** `enrolments_active_timestamp_chk` refuses an inactive
row with a NULL `withdrawn_at` — **the database will not let a withdrawal be a bare flag flip**.

**Four things broke, every one a gate working:** `PDS-2`/`PDS-3` failed to **COMPILE** (⛔ a dropped
`OUT` parameter cannot be silently ignored by a SQL consumer — *"leaving it unread is the option
that rots"*) · two stage-3 legs asserted the removed caption (§12.11, fixed same pass) ·
**`PLM-5` went red on a CORRECT database — §12.8 SIXTH INSTANCE**, repaired as **floors** ·
`PLMa-RATINGS`, above.

**Your observation, recorded as asked:** removing the parameter leaves this function doing work the
other three boundaries could have done. Its remaining justification is **one round trip instead of
three**, not knowledge the others lack — ▶ **so a fourth tile is a reason to ask whether that tile
already has a boundary, not to widen this one.**

## ⚠️ THE GATE-DISCIPLINE PATTERN (§12.13) — twice in consecutive phases

`P2-6` shipped a surface over an unwired write path; `P2-8` shipped **and pushed** with a lint
error. ⛔ **The common shape: I ran the suite I had just written and reported the phase on it.**
Both new suites were green and honest about what they measured. ▶ **The defect is the inference
from *my suite is green* to *the phase is complete*.** Every boundary now runs lint, tsc, build and
the standing rule suites before any completion claim.

**§12.14** — the shell-heredoc rule, which then **fired on its own author within the hour**: the
`P2-6R` commit was first attempted as two heredocs in one `bash -c` and died at parse. Nothing ran,
verified before retrying.

---

## STATE

| | |
|---|---|
| Branch · worktree · HEAD | `develop` · main worktree · `3197f31` · clean |
| Pushed | `origin/develop` = `288d261`. ⛔ **6 commits ahead, unpushed** |
| Containers | **dev 9 · mvp 0** ⛔ demonstration stack never started or queried |
| Ports | `:3000` held by your walk server; untouched by me |
| Migrations added | **1** — `20260815090000_portal_ruling_a_dashboard_enrolled.sql` (Ruling A, pre-authorized) |
| Census | tables **30** · enums **12** · policies **30** · registry **23** · functions **62** — registry UNMOVED |
| Portal suites | `p2-6` · `p2-6r` · `p2-6r-e2e` · `p2-7` · `p2-8` · `ruling-a` — **all PASS** |
| `tsc --noEmit` · `next build` · `lint` | clean · clean · **0 errors** |
| `T-P44` / `T-P44c` · `prove:no-secrets` | **PASS, unchanged** · **CLEAN** |
| Deliberately red | `prove:artefact-read` **48 PASS · 2 FAIL** · `prove:serving-discipline` (`D-10`, intermittent) |
| `NOT-RUN` | `bodySizeLimit` (browser leg) · `prove:stage2-routes` · `prove:stage3-authenticated` · VISUAL on `11`/`14`/`17`/`25` |
| ⏸ Next | **`P2-10` (`23` Trainers)** — no dependency. `P2-9` blocked on ruling 1 above |
