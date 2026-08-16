# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> ⛔ **NOT A TRACKER · NOT AUTHORITY · DERIVED.** Every line is reproduced or mechanically
> reduced from `STATUS.md`, `BUILD_NOTES.md`, `PORTAL_COMPLETION_PLAN.md`, `git`, or a live
> measurement. **Where this and `STATUS.md` disagree, `STATUS.md` WINS and this file is STALE.**
> Written at every stop and **OVERWRITTEN, never appended** (`FINAL_MVP_G06_GROUNDING_RULING.md` §H-8).

**Regenerated:** 2026-08-16 · branch `develop` · **pushed and verified from origin** ·
⛔ **STOPPED FOR YOUR WALK. `P2-21` NOT STARTED.**

## ⚠️ §15.8.1 FRESHNESS SWEEP — re-verified, not carried forward

| Carried previously | Re-measured now |
|---|---|
| `P2-12`/`P2-13`/`P2-14` await your ruling | ⛔ **LAPSED — all three AUTHORIZED, BUILT, PROVEN and PUSHED** |
| Census registry **23** | ⛔ **LAPSED — 24.** Re-measured against the live database, not restated |
| "`prove:artefact-read` red on the two ruled `KNOWN-RED`s" | ⛔ **LAPSED — THREE.** `AR-4-21` is new, escalated below |
| "five suites pinned `R=23`" | ⛔ **LAPSED — NINE.** Found by sweeping all 24, not by the list I was holding |
| `P2-19` measured not built | ⛔ **LAPSED — BUILT** (plan §40) |
| `P2-20` next | ⛔ **LAPSED — BUILT** (plan §45) |
| VISUAL walk `NOT-RUN` on ten screens | ⚠️ **NOW FIFTEEN**: `11`, `14`, `15`, `16`, `17`, `18`, `23`, `24`, `25`, `02`, `01`, `04`, `20`, `21`, `22` — measured from the completion rows, **and counted from the list rather than restated** (§44) |
| `Phone` / `Employee ID` on `24` | ✅ **STILL OPEN. CARRIED** |
| The 7-day invitation lifetime | ✅ **STILL A DISCLOSED DEFAULT. CARRIED** |
| `AR-4-14` + `AR-4-17` ruled `KNOWN-RED` | ✅ **STILL TRUE, RE-MEASURED. CARRIED** |
| `D-10` · `prove:serving-discipline` | ✅ **STILL RED, RE-MEASURED** (exit 1) |
| Fixture time-pinning · `S3-T1-r` | ✅ **STILL TRUE. Awaiting your bounded re-dating run** |
| `S3-00` · `B-G06-DET-1` · §10 Phase 1 exit (c) · `09`/`C2C-007` · mojibake · `test:continuity`/`test:exit-condition-b` | ✅ **ALL STILL TRUE. CARRIED** |

---

## ⛔ TWO RULINGS YOU SAID YOU OWE ME AT THIS STOP

**1. `C-12`, before `P2-23`** (screen `31` Parent Reports). Nothing is blocked until that phase, so
this is a scheduling question, not a blocker today.

**2. The `G-3`/`D-4` scope answer, before `P2-18`** (screen `03` Trainer Lesson Plan). ⚠️ **This one
has a shape worth restating before you rule**, because the two rulings point opposite ways at the
same pixel:

- **`G-3`** prohibits **KEY FOCUS chips**, **SLIDES** attachment chips and **View lesson plan** as
  drawn, and prohibits lesson-plan focus reaching *"the roster's carried-over previous-session focus
  line or any surface that presents the governed focus"*.
- **`D-4`** then **narrowed that**: KEY FOCUS chips are **PERMITTED in a distinct visual position with
  a distinct label**, as part of the lesson-materials feature.
- ▶ **`CLAUDE.md` §12 records the surviving rule as being about POSITION, not content:** *"two
  different things in one position silently replaces a governed field with an ungoverned one, and the
  substitution is invisible on the rendered page."* It protects **§10 Phase 1 exit condition (c)**.
- ⛔ **`D-4` authorizes no schema, column, bucket, RPC or route** — the lesson-materials feature needs
  its own explicit authorization.

**The question I need answered:** screen `03` **is** the lesson-plan surface. Does `D-4`'s
"distinct visual position with a distinct label" carve-out mean screen `03` may render lesson-plan
focus **as its own primary content** (it is not the roster, and there is no governed
previous-session-focus line on it), or does `G-3`'s prohibition still bar the chips on this screen
too? ⛔ **I did not decide it, and `P2-18` cannot start until you do.**

---

## WHAT SHIPPED SINCE YOUR LAST WALK — SIX SCREENS

| Phase | Screen | Route | Functions + grants | Registry |
|---|---|---|---|---|
| `P2-19` | `01` Trainer Dashboard | `/trainer/dashboard` | `report_list_trainer_reports()` · 1 grant | unmoved |
| `P2-20` | `04` Trainer Students | `/trainer/students` | `report_list_trainer_students()` · 1 grant | unmoved |
| `P2-12` | `20` Register Student | `/management/students/register` | `admin_create_student(text,text,uuid[])` · 1 grant | ⛔ **unmoved — zero new strings** |
| `P2-13` | `21` Create Parent Account | `/management/students/create-parent-account` | `admin_create_parent(text,text,uuid[])` · 1 grant | ⛔ **unmoved — zero new strings** |
| `P2-14` | `22` Edit Student | `/management/students/[studentId]/edit` | `admin_update_student(uuid,text,text,uuid[])` · `admin_withdraw_student(uuid)` · 2 grants | ⚠️ **23 → 24** |

⛔ **Across all five: no table, no column, no enum, no policy, no client table grant.**

**One new audit string in total, `admin.student_updated`.** `P2-12` and `P2-13` added **none** —
measured first: every action they perform already had a name, and `A-029` makes a second name for one
action a §12 stop-and-ask. **`A-057` amended in the `C-4` shape** (`Amendment_008.md` §A-057.2a),
recording `19 → 21 → 23 → 24`.

### ⛔ Your open sub-question is decided: the withdrawal SHARES the string

`admin.student_withdrawn` was **not** minted. A withdrawal sets `is_active = false` on a learner row —
a **state change on the student record**. ▶ **A second string would have recorded which UI control was
pressed, and `A-029` registers actions.** `PO-1` asserts the string is present **and** that no second
string appeared.

⛔ **`22`'s *"can be undone within 30 days"* appears nowhere** — a retention mechanism (Phase 4), not a
column. The withdrawal is built; the promise is not made.

---

## ⛔ BEFORE YOU WALK: THINGS THAT LOOK LIKE DEFECTS AND ARE NOT

**1. The fixture is time-pinned and the product is not** (plan §34, your ruling). Sessions are
**2026-01/02/03 only**; `Term 3, 2026` contains **0** sessions; there are **0** upcoming sessions
anywhere. ▶ Screen `02` shows *"You have no assigned classes in Term 3, 2026"* — **correct**.
**Select `Term 1, 2026`.** The pink `Next session:` line **never renders, in any term**, and screen
`01`'s dashboard inherits the same property.

**2. `class_sessions.lesson_title` and `.room` are NULL in 17 of 17 rows.** Screen `02`'s schedule
line renders **weekday only**; `15`'s lesson strip shows neither. **A column existing is not evidence
the datum does.**

**3. Refusals are ON THE PAGE, not hidden** (§12.12). On `20`/`22`: `Date of birth`, `Gender`,
`Student ID`, the four guardian fields and `Photo` — **none has a column**. On `21`: `Relationship`
is absent and **`Send email invite` is inert by construction**, because no email is sent anywhere.
On `04`: the frame's `Level` column is refused at three layers.

**4. `21` has no `Relationship` field, and the reason is a decoy you should know about.**
`parent_student_links.parent_role` **looks** like it and is a composite-FK component typed
`centre_membership_role` with `CHECK (parent_role = 'parent')`. ▶ Writing `Mother` there would have
shipped a relationship into a role column pinned to one literal. Seven columns of that shape exist
(plan §37.3); ⚠️ **`class_grades.code` is the most dangerous of them** — one letter from the refused
rating vocabulary, and sourcing from it would have shipped a Class Grade dressed as a rating with the
frame looking satisfied.

---

## ⏸ `AR-4-21` — THE FRACTIONAL-VALUE WALL, THIRD INSTANCE, FIRST WITH **ZERO** (plan §49)

`AR-4` demands **≥6 distinct and ≥2 FRACTIONAL** cited values, because a session cannot guess
`13.50px`. Screen `21` cites **7 distinct, 0 fractional**; `AR-4-14` and `AR-4-17` each carry **1**.

⚠️ **Measured before escalating, because *"the frame has none"* would have been the easy answer and is
FALSE — the `.html` carries 38 distinct fractional values.** ⛔ **Every one belongs to a shared
control:** `1.67px`×16, `0.83px`×15, `2.50px`×13, `5.83px`×10, `11.67px`×7 are **inside 20×20 icon
glyph constructions**, and all seven `13.50px` are the **shared sidebar rail's labels**.

▶ Satisfying it needs either **restyling a shared control to make a check go green** — refused once at
`AR-5-20`, where the resolution was *"cite less, never restyle a shared control"* — or **citing values
the component does not use**, which `AR-5` would fail and which would be fabrication if it did not.
⛔ **Not fixed.** ▶ **Zero, with the cause measured to a shared control, shows the wall is a
STRUCTURAL property of certain frames rather than a near-miss.**

---

## ⛔ THREE DEFECTS IN MY OWN APPARATUS, RECORDED BECAUSE THEY OUTRANK THE SCREENS

**1. The registry pin was in NINE suites and I re-ran FIVE** (plan §48.1). I identified five,
re-pinned, re-ran **those five**, and reported the set closed. The stop sweep ran all 24 and found
**four more red** on the identical cause. ▶ **I re-ran the suites I expected to be affected, so I
found the suites I expected to be affected.** ⚠️ The false-`CLEAN` lesson in a new medium — and **the
list being mine rather than someone else's is what made it feel like a measurement.** All 24 now
exit 0.

**2. A quoting fault, fourth instance — and it generalizes past shells** (plan §47.1). The re-pin
script was §12.14-compliant (`writeFileSync`, no shell string) and still broke two suites: its note
contained **backticks** and was inserted **inside JavaScript template literals**. ▶ **§12.14 names the
shell, but the defect is INSERTION INTO A QUOTED CONTEXT WITHOUT ESCAPING FOR THAT CONTEXT.** It
failed **loudly**, which is the lucky direction §47 recorded the same day.

**3. A stale sentence I wrote minutes earlier, caught by the gate and not by me** (§12.11). The
`BUILD_NOTES` entry said `prove:artefact-read` was red on *"the two ruled `KNOWN-RED`s only"* —
**carried forward from the previous entry rather than measured**, and false when written. Corrected
in the same pass. ▶ **Exactly the §15.8.1 defect, committed inside the very entry that documents
§15.8.1 compliance.**

---

## POSITION

**19 of 24 Part 2 phases complete. FIVE remain, FOUR buildable.**

| Phase | Screen | Status |
|---|---|---|
| `P2-18` | `03` Trainer Lesson Plan | ⏸ **BLOCKED on your `G-3`/`D-4` scope answer** |
| `P2-21` | `09` | ✅ buildable under the batch — ⚠️ `C2C-007` first |
| `P2-22` | `30` Parent Dashboard | ✅ buildable under the batch |
| `P2-23` | `31` Parent Reports | ✅ buildable — ⏸ **owes your `C-12` ruling** |
| `P2-24` | `28` Term Report | ⛔ **DO NOT BUILD** (`C-11`); `A-044` noted and unmet deliberately |

**Write-path schema still needed by:** ⛔ **none of the four.** `P2-21`, `P2-22` and `P2-23` are
read-side and the `P2-9 → P2-16` batch covers them; `P2-18`'s scope is unruled so its schema question
is moot until you answer. ▶ **Every remaining buildable phase is inside an authorization you have
already given.**

---

## STATE

| | |
|---|---|
| Branch · HEAD | `develop` · main worktree · **clean at the stop** |
| Pushed | ✅ `origin/develop` = local `HEAD`, **read back from origin**, not from push output |
| `main` | ⛔ **UNTOUCHED** — `5eb84bc`, verified from origin |
| Containers | **dev 9 · mvp 0** ⛔ demonstration stack never started or queried |
| Migrations | **45** files; **3** applied this stretch (`P2-12`, `P2-13`, `P2-14`) |
| Live census | tables **30** · enums **12** · policies **30** · **registry 24** · functions **73** — queried directly, not restated |
| Portal suites | **24 — ALL PASS, each verified by EXIT CODE** |
| Route census | **34** routes read from the app tree |
| `tsc` · `lint` · `build` · `prove:no-secrets` | **0** · **0** · **0** · **0** |
| Deliberately red | `prove:artefact-read` (⚠️ **THREE** now) · `prove:serving-discipline` (`D-10`) |
| `NOT-RUN` | `bodySizeLimit` browser leg · `S3-MUT` · `S3-A-password` · **VISUAL on every screen** |
| ⏭ Next | ⛔ **NOTHING. STOPPED FOR YOUR WALK.** Then `C-12`, the `G-3`/`D-4` answer, and `P2-21` |
