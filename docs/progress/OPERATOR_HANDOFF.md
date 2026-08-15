# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> ⛔ **NOT A TRACKER · NOT AUTHORITY · DERIVED.** Every line is reproduced or mechanically
> reduced from `STATUS.md`, `BUILD_NOTES.md`, `PORTAL_COMPLETION_PLAN.md`, `git`, or a live
> measurement. **Where this and `STATUS.md` disagree, `STATUS.md` WINS and this file is STALE.**
> Written at every stop and **OVERWRITTEN, never appended** (`FINAL_MVP_G06_GROUNDING_RULING.md` §H-8).

**Regenerated:** 2026-08-16 · branch `develop` · HEAD `8faa641` + this commit · **pushed and verified
from origin** · ✅ **all three rulings executed** · ⏸ **ONE thing waits on you.**

## ⚠️ §15.8.1 FRESHNESS SWEEP — re-verified, not carried forward

| Carried previously | Re-measured now |
|---|---|
| `P2-16` `PARTIAL`, slot 2 HELD | ⛔ **LAPSED — RULED AND BUILT.** The phase is COMPLETE |
| `P2-16` "ZERO functions and grants" | ⛔ **LAPSED and corrected at source** (§12.11). Two functions now; see below |
| `S3-T1-r` open, cause undiagnosed | ✅ **DIAGNOSED — fixture vintage.** Ruled: record, do not re-date |
| `stage2` / `stage3` `NOT-RUN` | ✅ **RAN last checkpoint.** `stage2` PASS (17); `stage3` 44 PASS · 1 FAIL (`S3-T1-r`) · 2 NOT-RUN |
| `Phone` / `Employee ID` on `24` | ✅ **STILL OPEN — and now costed** (§35.4): 1 column plus a placement decision |
| The 7-day invitation lifetime | ✅ **STILL A DISCLOSED DEFAULT. CARRIED** |
| `AR-4-14` + `AR-4-17` | ✅ **STILL TRUE. CARRIED** — and now the ONLY open rule question again, since slot 2 is ruled |
| `D-10` · `prove:artefact-read` · `prove:serving-discipline` | ✅ **STILL RED, RE-MEASURED** (exit 1 each) |
| `S3-00` · `B-G06-DET-1` · §10 Phase 1 exit (c) · `09`/`C2C-007` · mojibake · `test:continuity`/`test:exit-condition-b` | ✅ **ALL STILL TRUE. CARRIED** |
| VISUAL walk `NOT-RUN` | ⚠️ **TEN**: `11`, `14`, `17`, `18`, `23`, `24`, `25`, `15`, `16`, `02` |

---

## ⛔ BEFORE YOU WALK: TWO THINGS THAT LOOK LIKE DEFECTS AND ARE NOT

**1. The fixture is time-pinned and the product is not** (plan §34, your ruling). Sessions are
**2026-01/02/03 only**; today is **2026-08-15**; `Term 3, 2026` contains **0** sessions; there are
**0** upcoming sessions anywhere. ▶ Screen `02` shows *"You have no assigned classes in Term 3,
2026"* — **correct**. **Select `Term 1, 2026`.** The pink `Next session:` line **never renders, in any
term**.

**2. ⚠️ NEW, found while scanning for decoys: `class_sessions.lesson_title` and `.room` are NULL in
17 of 17 rows.** ▶ Screen `02`'s schedule line renders **weekday only**; screen `15`'s lesson strip
shows neither title nor room. **A column existing is not evidence the datum does.**

---

## ✅ RULING 1 — `P2-16` SLOT 2 IS BUILT

**Functions and grants added, named not counted:**

| Function | Grant |
|---|---|
| `public.report_class_improved_dimension(uuid)` | `EXECUTE` → `authenticated` |
| `public.competency_score(competency_rating)` | ⛔ **NONE, by design** |

⛔ **And nothing else.** Census `T=30 E=12 P=30 R=23`.

**Your reasoning is carried into four places** — the migration header, the `COMMENT ON`, the DTO and
the screen — **none of which cites §6 as the ground**, so a later phase cannot read the mandate as the
permission. ▶ **A future slot mandating a NUMBER would not inherit it.**

⛔ **`D-2`'s mapping had to move, and not moving it would have broken a ruling.** Measured first: it
lived in exactly one place, and `D-2` **requires** that. Extracted to `competency_score`; the existing
trend **recreated by forward migration** to call it; `PI-2`/`PJ-3` assert at apply time that nothing
else inlines it. **The helper is ungranted** — it runs only inside `SECURITY DEFINER` bodies, so
granting it would widen the client surface for no caller.

⛔ **§26.1's ceiling proved itself a SECOND time, in the phase that ruled on it.** The first migration
applied with **seven PASS notices, one of which EXECUTED the function**, and it still could not run:
`CREATE TABLE AS is not allowed in a non-volatile function`. As `postgres` the body returns at its
**first gate**, twenty lines above the fault. ⚠️ **The cause is general — a `STABLE` function may not
`CREATE TABLE AS`, both halves are individually correct, and `CREATE FUNCTION` accepts the pair
without complaint.**

⚠️ **Two legs earned their place.** `PC16-8f` **constructs** the divergence (every fixture module has
<2 submitted sessions, so the computation was otherwise unreachable) → **`eye_contact | 2`**.
`PC16-8g` is the regression leg **the RPC-caller rule forced**: the recreated trend is
**value-identical, `44.44, 63.89`** — which **no shape assertion could have told you**.

**Three cases, the third deliberate:** §6's replacement sentence verbatim under two sessions · the
dimension sentence · and ⚠️ **enough data but nothing improved, which §6 does not specify** — reported,
not resolved silently, failing toward saying less.

---

## ✅ RULING 2 — FIXTURE DATES RECORDED, NOT RE-DATED

Recorded as its own item with your framing verbatim: **the fixture is pinned in time and the product
is not, so every date-relative surface degrades silently as the calendar moves** (plan §34). It
diagnoses `S3-T1-r`, carried open for weeks with no cause — failing since roughly **April 2026**
because the selector pins February while the schedule defaults to the current month. **Awaiting your
bounded re-dating run.**

---

## ⏸ RULING 3 — `P2-12`/`13`/`14` STATED IN FULL. **THIS IS WHAT WAITS ON YOU** (plan §35)

⛔ **No table, column, enum, policy or client table grant for any of the three.** `P2-12` and `P2-13`:
one write RPC + one grant each, **zero new audit strings** — the registry already carries every action
they perform. **`P2-14` alone** needs `admin.student_updated`, **23 → 24**; whether **withdraw** shares
it is an open sub-question I did not decide.

### ⛔ THE DECOY REGISTER — **SEVEN**, NOT ONE

A systematic scan of every `CHECK` pinning a column to a single literal found the whole family. **Every
one is a composite-FK component, not a semantic field.**

| Column | Pinned to | Why it is a near-miss |
|---|---|---|
| `parent_student_links.parent_role` | `'parent'` | the one you flagged — `21`'s `Relationship` fails its CHECK |
| ⚠️ **`trainer_profiles.membership_role`** | `'trainer'` | ⛔ **the most dangerous after it**: `GC-11` bars screen `24`'s Role dropdown, and **this is the column someone would reach for to build it** |
| `parent_profiles.membership_role` | `'parent'` | same, parent side |
| `class_session_assignments.trainer_role` | `'trainer'` | **a natural place to try to seat an `Assist.`/TA**, which `A-014` bars |
| `observations.trainer_role` | `'trainer'` | same shape on the assessment record |
| `attendance.recorded_by_role` | `NULL`/`'trainer'` | reads like *"who marked attendance"* and **semantically is** — but can never say `management` |
| `invitations.invited_by_role` · `report_correction_requests.requester_role`/`resolver_role` · `report_versions.submitted_by_role` | `'management'`/`'trainer'` | the last **pinned by `A-040` deliberately** |

▶ **The rule: before writing to a `*_role` column, read its `CHECK`.**

### THE FIELDS WITH NO COLUMNS, COSTED INDIVIDUALLY

| Field | Cost | Note |
|---|---|---|
| First / Last name | ✅ nothing | joined into `full_name` |
| **Date of birth** | 1 column | ⚠️ personal data; `C-13` already permits it on `30` |
| **Gender** | **1 enum + 1 column** | ⛔ **never raised before; the vocabulary is an unmade product decision** |
| **`Student ID`** | 1 column + 1 unique index + **a generation rule** | ⚠️ **the most-drawn missing field in the estate — SIX screens** |
| **Guardian name/contact/email/address** | 4 columns **+ a second, unlinked guardian** | ⛔ **RECOMMEND REFUSE** — `21` already creates the guardian properly |
| **Photo** | a bucket + policies + transport | ⛔ `C-15` defers; largest by far |
| **`Relationship`** | 1 enum + 1 column | ⛔ **not `parent_role`** |
| **`Phone`** | 1 column + a placement decision | accounts (one per person) vs profile (one per role) |
| **`22`'s *"undone within 30 days"*** | ⛔ **not a column — a RETENTION MECHANISM** | withdrawal is buildable today; **recommend build it, drop the sentence** |

✅ **Correction to my earlier statement:** `accounts.normalized_email` **also exists** (NOT NULL, with
a validating CHECK, already written by `admin_create_trainer`) — **the durable home is `accounts`**.

---

## ⏸ `P2-19` MEASURED, NOT BUILT (plan §36) — AND I SAY SO PLAINLY

⚠️ **I stopped at a phase boundary with room for a measurement but not for a six-region screen plus
its suite.** ▶ **Starting it and abandoning it half-built would have been worse than a clean stop.**

⛔ **Two of its cards are already refused.** `My Recent Report`'s rating chips — `GC-7`: *"this pack's
own `screen.md` §8 declares the screen **'Not rating-bearing'** … **DO NOT BUILD the rating
column**"* — ⚠️ **and the prose falls with them**, since *"Mastered eye contact"* is a rating
attributed in words (`A-052`). ▶ A second ground reaches the chip anyway: one chip for a whole report
is a **roll-up**, `G-2`, **regardless of audience**. And `Today's Schedule` draws **`13:30 Staff
Meeting`**, for which **there is no entity** — `A-016` makes calendars projections of
`class_sessions`, so building it needs the second event entity `GC-13` barred on `25`.

**Data path measured:** classes, counts, today's sessions and the calendar are all reachable — ✅
**`P2-17`'s projection already returns the first two.** ⛔ `Pending Reviews` and `My Recent Report`
are **not**: `reports`, `report_versions`, `observations` are all `grants=0, policies=0`. ▶ Needs one
governed trainer-scoped read **under the batch** — ⚠️ **but not by reusing `report_get_working`**,
which returns full working content and would ship report bodies into a landing-page payload.

---

## ⛔ AND THE §12 RULE YOU ASKED FOR IS IN

**"A gate is read from its exit code, never from its output"** — recorded in `CLAUDE.md` §12 beside
the migration rule, with the three instances as one family: `| tail && commit` (pipeline status is
the last command's) · `| sed || echo` (`sed` always exits 0) · `| grep "Compiled"` (⛔ **the matched
phrase was TRUE and the build had FAILED**). **`PS-8` reading 4.7× what it named is recorded with
it:** *a check that reports a wider scope than it claims is as wrong when it passes.*

---

## STATE

| | |
|---|---|
| Branch · HEAD | `develop` · main worktree · **clean** |
| `main` | **UNTOUCHED** — `5eb84bc`, verified from origin |
| Containers | **dev 9 · mvp 0** ⛔ demonstration stack never started or queried |
| Ports | `:3000` free |
| Migrations this stretch | **2** (`P2-16` slot 2 + its R-1 forward fix) |
| Census | tables **30** · enums **12** · policies **30** · registry **23** |
| Portal suites | **26 — ALL PASS, verified by EXIT CODE** |
| Navigation census | **PASS** — 29 canonical routes, 31 with aliases, 11 rail items |
| `tsc` · `build` · `lint` · `prove:encoding` · `prove:no-secrets` | exit 0 · exit 0 · 0 errors · PASS · CLEAN |
| Deliberately red | `prove:artefact-read` · `prove:serving-discipline` — both re-measured |
| `NOT-RUN` | `bodySizeLimit` · `S3-MUT` · `S3-A-password` · **VISUAL on ten screens** |
| ⏭ Next | **`P2-19` build** (measured, one read needed), then `P2-20`. ⏸ `P2-12`/`13`/`14` await your ruling; `P2-18` awaits the `G-3`/`D-4` answer; the fixture re-dating awaits its own run |
