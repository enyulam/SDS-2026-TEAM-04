# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> ⛔ **NOT A TRACKER · NOT AUTHORITY · DERIVED.** Every line is reproduced or mechanically
> reduced from `STATUS.md`, `BUILD_NOTES.md`, `PORTAL_COMPLETION_PLAN.md`, `git`, or a live
> measurement. **Where this and `STATUS.md` disagree, `STATUS.md` WINS and this file is STALE.**
> Written at every stop and **OVERWRITTEN, never appended** (`FINAL_MVP_G06_GROUNDING_RULING.md` §H-8).

**Regenerated:** 2026-08-16 · branch `develop` · HEAD `eeb4a31` · **pushed and verified from origin**
· ✅ **`P2-15`, `P2-16`, `P2-17` all complete** · ⏸ **THREE THINGS WAIT ON YOU.**

## ⚠️ §15.8.1 FRESHNESS SWEEP — **THREE LAPSES, AND ONE OF THEM WAS A BLOCKER THAT WASN'T**

**Every open item, blocker and stated limit re-verified against current state. Nothing copied forward.**

| Carried previously | Re-measured now |
|---|---|
| `prove:stage2-routes` · `prove:stage3-authenticated` **NOT-RUN** — *"`:3000` held by your walk server"* | ⛔ **LAPSED. `:3000` IS FREE.** ▶ **Both were RUN.** `stage2` **PASS, 17 checks**. `stage3` **44 PASS · 1 FAIL · 2 NOT-RUN** — and it now covers **44** legs where the last record covered 34 |
| `S3-T1-r` carried as an open failure, cause undiagnosed | ⛔ **DIAGNOSED — IT IS FIXTURE VINTAGE, NOT A DEFECT.** See below |
| Pushed = `a76afa0` | ⛔ **LAPSED.** `origin/develop` = **`eeb4a31`**, read from origin. `origin/main` = `5eb84bc`, **UNTOUCHED** |
| `Phone` / `Employee ID` on `24` | ✅ **STILL OPEN. CARRIED** — no column exists; still your decision |
| The 7-day invitation lifetime | ✅ **STILL A DISCLOSED DEFAULT. CARRIED** |
| `AR-4-14` + `AR-4-17` | ⚠️ **STILL TRUE BUT NO LONGER THE ONLY ONE** — `P2-16`'s slot 2 is now a second open rule question |
| `D-10` intermittent · `prove:serving-discipline` red | ✅ **STILL RED, RE-MEASURED** (exit 1). Not closed on a run of green — a flaky check closes on a diagnosed cause |
| `prove:artefact-read` red (`AR-4-14`/`AR-4-17`) | ✅ **STILL RED, RE-MEASURED** (exit 1) |
| `S3-00` · `B-G06-DET-1` · §10 Phase 1 exit (c) · `09`/`C2C-007` · the mojibake repair · `test:continuity`/`test:exit-condition-b` | ✅ **ALL STILL TRUE. CARRIED** |
| VISUAL walk `NOT-RUN` | ⚠️ **NOW TEN**: `11`, `14`, `17`, `18`, `23`, `24`, `25`, **`15`**, **`16`**, **`02`** |

---

## ⛔ READ THIS BEFORE YOU WALK ANYTHING: **THE FIXTURE HAS AGED OUT OF ITS OWN CALENDAR**

**Measured, not inferred:**

| | Measured |
|---|---|
| Every fixture `class_sessions.session_date` | **2026-01, 2026-02, 2026-03 — nothing else** |
| Today | **2026-08-15** |
| Term containing today | **`Term 3, 2026`** |
| Sessions in that term | **0** |
| Upcoming sessions anywhere | **0** |

⛔ **Screen `02` Trainer My Classes will render its EMPTY STATE** — *"You have no assigned classes in
Term 3, 2026"*. ▶ **That is CORRECT behaviour over stale fixture data, not a defect.**
**Select `Term 1, 2026` in the dropdown to see populated cards.**

⛔ **The frame's pink `Next session:` line will never appear over this fixture, on any card, in any
term** — there are no upcoming sessions at all, and hero `0B` omits a NULL rather than showing it
empty.

✅ **AND IT EXPLAINS `S3-T1-r`**, which has been carried as an open failure without a cause:
`/trainer/schedule` is asserted against the selectors *"Class sessions in February 2026"* and
*"Fixture Module A"*. The schedule defaults to the **current** month, which genuinely has no
sessions. ▶ **A date-pinned assertion over data that does not move.** It has almost certainly been
failing for this reason since roughly April 2026.

⛔ **I DID NOT FIX IT**, on three independent grounds: re-dating fixtures is a **fixture change
needing its own authorization**; it would invalidate every other suite pinning a fixture date; and
**silently defaulting screen `02` to a different term would be dishonest** — *"no classes this term"*
is true, and hiding that to avoid an empty-looking screen asserts something the trainer never asked
for. ⚠️ **The decision is yours:** re-date the fixture around today (what a demo needs), rewrite the
date-pinned assertions to be relative, or both.

---

## ⏸ THE THREE THINGS THAT WAIT ON YOU

### 1. `P2-12` · `P2-13` · `P2-14` — stated in full as a set (plan §29)

**`P2-12` and `P2-13` share ONE shape. `P2-14` is the outlier, and only because of the registry.**

| | Table | Column | Enum | Policy | Client grant | **Write RPC** | **EXECUTE** | **Audit string** |
|---|---|---|---|---|---|---|---|---|
| **`P2-12`** `20` Register Student | — | — | — | — | — | **1** `admin_create_student` | **1** | ✅ **0 NEW** |
| **`P2-13`** `21` Create Parent Account | — | — | — | — | — | **1** `admin_create_parent` | **1** | ✅ **0 NEW** |
| **`P2-14`** `22` Edit Student | — | — | — | — | — | **1–2** `admin_update_student` (+ withdraw) | **1–2** | ⛔ **1 NEW → registry 23 → 24** |

⚠️ **The registry already anticipated two of the three, and I checked rather than assumed:**
`admin.student_created` · `admin.enrolment_changed` · `admin.profile_created` · `invitation.created`
· `admin.parent_link_changed` **all already exist**. ⛔ `P2-14` alone needs
**`admin.student_updated`** — there is `admin.module_updated` and `admin.session_updated` and no
student equivalent.

**Fields with NO columns — the real decision, and NOT schema I am proposing:** `Date of birth` ·
`Gender` (no column, no enum, never raised before) · `Student ID` (**the fifth screen to draw it**) ·
`Guardian name/contact/email/home address` (⚠️ **and these are screen `21`'s job — collecting them on
`20` would create a second, unlinked copy of the guardian**) · `Photo` (`C-15`) · **`Relationship`**
on `21` ⚠️ **which has a DECOY**: `parent_student_links.parent_role` looks like it and is
`centre_membership_role` CHECK-pinned to `'parent'`, a composite-FK component — ▶ **reading it as
`Relationship` would have shipped `Mother` into a role column** · `Phone` (same open question as
`24`'s). ⚠️ **`22`'s *"Can be undone within 30 days"* has NO mechanism** — the withdrawal is
buildable, the 30-day window is not recorded anywhere.

### 2. `P2-16`'s Management Insight **slot 2** (plan §28.3)

`CLAUDE.md` §6 mandates *"the dimension with the largest positive **average-rating change** between
the first half and second half"*. ⛔ **That is computed from rating values, averaged across children,
differenced over time** — and `G-2` excludes roll-ups permanently on every surface.

⚠️ **Both readings are serious.** Excluded: its INPUT is the nine ratings across children, which is
what `C-9` keeps off a statistics surface. Permitted: its **OUTPUT is a DIMENSION NAME** — never a
value, band or number — which is exactly the structure you **authorized** in `D-2`.

**Slots 1 and 3 are BUILT** (slot 1 reuses `report_class_health_summary`, which §6 *requires*).
**Slot 2 is held and disclosed on the page.**

### 3. `P2-18` (`03` Trainer Lesson Plan) — a `G-3`/`D-4` scope question

`G-3` prohibits SLIDES and the lesson-plan control **as drawn on `06`**; `D-4` narrows that only for
materials **tagged to a specific class session**. Screen `03` is module-level. ⚠️ **Not measured in
depth yet** — flagged so it is not mistaken for ready.

---

## ✅ WHAT SHIPPED THIS STRETCH — THREE PHASES, **ZERO SCHEMA IN ALL THREE**

**Functions and grants added under the batch, named not counted: `P2-15` NONE · `P2-16` NONE ·
`P2-17` NONE.** Census unmoved throughout at **`T=30 E=12 P=30 R=23`**.

▶ **§12.10 for the fifth, sixth and seventh consecutive phases.** On `P2-16` reuse was not merely
economical — **`CLAUDE.md` §6 REQUIRES it**: slot 1 must be *"the exact same computation … never
computed two different ways"*.

| Screen | What it refused |
|---|---|
| **`15`** Lesson Statistics | **5 of 6 cards** — Skill Averages · the Status Distribution donut · `Class Average 82%` · Strongest/Focus/Overall · Trainer & Assistant. **Six counts survive** |
| **`16`** Class Statistics · **`PARTIAL`** | **ALL 3 drawn cards** — and **2 panels the frame OMITS are BUILT** under `C-17` |
| **`02`** Trainer My Classes | rating chips, `Assist.`/TA, the frame's `Junior` grade literal |

### ⚠️ AND I GOT `P2-16` MATERIALLY WRONG BEFORE MEASURING — SELF-CORRECTED

I first wrote `P2-16` up as a **hard stop on a new question**, because the pack's `GC-10` records two
mandated panels the frame omits. ⛔ **`C-17` ALREADY RULED IT** — *"GOVERNANCE WINS. Build the two
panels"* — and **`P2-4` had already built its half**, using the very function that computes slot 1.

> ⛔ **THE RULE IT EARNS: a conflict register records that a conflict EXISTED; it is not evidence the
> conflict is still OPEN.** Check the ruling set before escalating a register row.

---

## ⛔ FOUR DEFECTS IN MY OWN CHECKING, AND THEY ARE THE BEST FINDINGS HERE

1. ⛔ **I WAS READING BUILD SUCCESS OUT OF A `grep`, AND IT SAID `Compiled successfully` ON A BUILD
   THAT FAILED.** Next.js prints that line and *then* type-checks; the worker exited **1** several
   lines later. ▶ **`npm run build | grep Compiled` is a substring search that returns true on
   failure.** **Every gate is now read from its EXIT CODE.** *(Re-verified: the tree builds clean by
   exit code, so the code is sound — the METHOD was not.)*
2. **I typechecked, then edited, then did not re-typecheck.** The rail edit landed after `tsc` and
   broke the build. ▶ **A green gate is green for the tree it ran against, not the one you ship.**
3. ⛔ **A PROOF SLICE THAT READ 4.7× WHAT IT NAMED.** `P2-9`'s `PS-8` sliced the contracts file to
   *whatever type was declared next*; `P2-17` inserted three types into that gap and a trainer's
   **class grade** turned it red. ⚠️ **It had been failing the dangerous way all along — 2090
   characters read while its message claimed "THE PROFILE DTO".** Bounded: **441**.
   > ⛔ **A check that reports a bigger scope than it names is as wrong when it passes.**
4. ⚠️ **The `grab` regex truncated a live measurement** — `([^ \n]*)` cut `Eye contact|Vocal
   projection` to **`Eye`**, and the check **passed while asserting over the truncated value**.
   Fourth instance of that family, first that NARROWED rather than broke.

**And a real mapping defect §12.10 caught:** `P2-16`'s first draft keyed its lookup by dimension
**code**, but `focus_chips` holds **free display text** (`Eye contact`). ▶ A code-keyed lookup would
have matched **nothing, every time**, rendering Management Insight with two sentences silently
missing — **no error, no exception, no red test**.

---

## STATE

| | |
|---|---|
| Branch · worktree · HEAD | `develop` · main worktree · `eeb4a31` · **clean** |
| Pushed | ✅ **`origin/develop` = `eeb4a31`**, read back from origin |
| `main` | **UNTOUCHED** — `5eb84bc`, verified from origin |
| Containers | **dev 9 · mvp 0** ⛔ demonstration stack never started or queried |
| Ports | ⚠️ **`:3000` is now FREE** — your walk server is no longer running |
| Migrations added this stretch | **ZERO** |
| Census | tables **30** · enums **12** · policies **30** · registry **23** |
| Portal suites | **26 — ALL PASS, verified by EXIT CODE** (not by grep) |
| Navigation census | **PASS** — 29 canonical routes, 31 with aliases, **11 rail items** |
| `tsc` · `build` · `lint` · `prove:encoding` | exit 0 · exit 0 · **0 errors** (4 pre-existing warnings) · PASS |
| `prove:no-secrets` | **CLEAN** |
| `prove:stage2-routes` | ✅ **PASS, 17 checks** — newly run |
| `prove:stage3-authenticated` | **44 PASS · 1 FAIL (`S3-T1-r`, fixture vintage) · 2 NOT-RUN** — newly run |
| Deliberately red | `prove:artefact-read` (`AR-4-14`/`AR-4-17`) · `prove:serving-discipline` (`D-10`) — **both re-measured red** |
| `NOT-RUN` | `bodySizeLimit` (browser leg) · `S3-MUT` · `S3-A-password` · **VISUAL on ten screens** |
| ⏭ Next | ⏸ **STOPPED at a clean phase boundary.** `P2-19` (`01` Trainer Dashboard) and `P2-20` (`04` Trainer Students) are read-only and would continue under the batch; `P2-18` needs the `G-3`/`D-4` answer; `P2-12`/`13`/`14` and `P2-16` slot 2 need your rulings |
