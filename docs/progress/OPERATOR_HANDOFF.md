# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> ⛔ **NOT A TRACKER · NOT AUTHORITY · DERIVED.** Every line is reproduced or mechanically
> reduced from `STATUS.md`, `BUILD_NOTES.md`, `PORTAL_COMPLETION_PLAN.md`, `git`, or a live
> measurement. **Where this and `STATUS.md` disagree, `STATUS.md` WINS and this file is STALE.**
> Written at every stop and **OVERWRITTEN, never appended** (`FINAL_MVP_G06_GROUNDING_RULING.md` §H-8).

**Regenerated:** 2026-08-15 · branch `develop` · HEAD `25aadae` · **pushed and verified from origin**
· ✅ **two phases complete** · ⚠️ **two real defects found, both recorded rather than quietly fixed.**

## ⚠️ §15.8.1 FRESHNESS SWEEP

**Every open item, blocker and stated limit re-verified against current state. Nothing copied
forward. Three lapses found; two new items opened.**

| Carried previously | Re-measured now |
|---|---|
| `P2-11` BLOCKED on its schema gate | ⛔ **LAPSED — AUTHORIZED AND COMPLETE.** One function, one grant, exactly as stated |
| The trainer email OPEN | ⛔ **LAPSED — RULED PERMITTED.** Shipped across six layers |
| Pushed = `3e3b316`; `47735ce` pending | ⛔ **LAPSED.** `origin/develop` = **`ca5cb87`** = local HEAD, read back **from origin**. `origin/main` = `5eb84bc`, **UNTOUCHED** |
| `AR-4-14` + `AR-4-17` | ✅ **STILL TRUE. CARRIED** — **the only open rule question**, re-run and still red |
| `D-10` intermittent | ✅ **STILL TRUE. CARRIED.** Not re-run: a flaky check closes on a diagnosed cause, never on a run of green |
| `S3-T1-r` · `S3-00` · `B-G06-DET-1` · §10 Phase 1 exit (c) · `09`/`C2C-007` · the mojibake repair · `test:continuity`/`test:exit-condition-b` | ✅ **ALL STILL TRUE. CARRIED**, unchanged |
| VISUAL walk `NOT-RUN` | ✅ **STILL TRUE** — now **six** screens: `11`, `14`, `17`, `23`, **`24`**, `25`. ⚠️ `23` **changed** since you last saw it (the email, and `Add Trainer` went live) |
| — | 🆕 **`Phone` / `Employee ID` on screen `24` — ONE DECISION FOR YOU.** Below |
| — | 🆕 **The 7-day invitation lifetime — a DISCLOSED DEFAULT, not a ruling.** Below |

---

## ⛔ THE STOP: `P2-9` (`18` Student Profile) NEEDS SCHEMA. STATED, NOTHING WRITTEN.

⚠️ **First, a correction: screen `18` is Management STUDENT PROFILE, not "Class Statistics."** I
carried that label into my last two messages. `16` is Class Statistics (`P2-16`).

**Measured, not assumed.** `students`, `enrolments`, `attendance`, `terms`, `parent_student_links`,
`parent_profiles` and `accounts` **all carry a management SELECT grant AND policy** — so Profile
Details, Classes Enrolled and the attendance tile need **nothing**. ⛔ But `observations`,
`observation_ratings`, `reports` and `report_versions` are **`grant=0, policies=0`** — reachable
only through a `SECURITY DEFINER` RPC. ▶ Three elements have **no path at all**: the **`ASSESSMENTS`
count**, the **`D-2` Growth Trend**, and the **Reports table**.

⚠️ **AND THE EXISTING RPC MUST NOT BE REUSED FOR THE TREND.** `report_get_management_ratings` is
granted and returns `TABLE(dimension_code, display_name, sort_order, rating)` — **the nine
per-dimension ratings**. Calling it once per session to build a trend would ship the nine into a
**profile-surface payload**, which `C-9` bars, and which is the `Q-27` error exactly: *"do not fetch
them into the client and hide them."* ⛔ **The new read must aggregate INSIDE the database and
return `D-2`'s score only.**

| | |
|---|---|
| **Tables · Columns · Enums · Policies** | ⛔ **NONE** |
| **Audit strings** | ⛔ **NONE** — it is a READ. Registry stays **23** |
| **Functions** | **ONE** — a student-keyed cross-session management read, `SECURITY DEFINER`, `search_path=''` |
| **Grants** | **ONE** — `EXECUTE` to `authenticated` |

▶ **The plan's own `P2-9` row already calls for exactly this**: *"`D-2` host **+ a management
cross-session read**"*, marked ✅ REQUIRED under `C-8`/`C-9`.

⛔ **NOTHING ELSE ON THAT SCREEN NEEDS A RULING — all of it is already disposed:** `Skill Breakdown`
⛔ `GC-6`/`C-9` (*"do not add a rating badge, bar, column, tile or chip"*) · `Strengths & Focus
Areas` ⛔ your ruling of this morning · Reports `GRADE` ⛔ `G-2`, permanently · `Generate Term
Report` ⛔ `C-11` · TA in Classes Enrolled ⛔ `A-014` · **`Date of birth`, `Contact`, `Student ID`
have NO COLUMN** (`students` is `id · centre_id · full_name · is_active · created_at · updated_at ·
deactivated_at`, and nothing else) and **`Good standing` is not a concept anywhere** — four
omissions to disclose, not four questions.

⚠️ **`Edit` DIFFERS FROM SCREEN `23`'s, AND THE DIFFERENCE DECIDES THE TREATMENT.** `22` Edit
Student **exists** in the ratified 36 and lands at `P2-14`, so this control has a **known future
destination** — **disabled with a stated reason**, exactly as `Add Trainer` was. Screen `23`'s
`Edit` had no destination at all and stayed **absent**.

---

## ⏸ SO YOU CAN AUTHORIZE A BATCH IF YOU PREFER — `P2-9` … `P2-16` **ALL** NEED SCHEMA

Measured, not projected: `P2-12` `20` Register Student · `P2-13` `21` Create Parent · `P2-14` `22`
Edit Student — **no create or update path exists for a student or a parent**, exactly as none
existed for a trainer before `P2-11`. `P2-15` `15` Lesson Statistics and `P2-16` `16` Class
Statistics both aggregate over `observations` (and `16`'s Management Insight needs `focus_chips`),
which is `grant=0, policies=0`.

▶ **`P2-17` (`02` Trainer My Classes) is the first phase needing NONE** — all eight of its tables
carry a grant **and** a trainer policy at HEAD. **That is where I go next unless you say otherwise.**

---

## ⏸ TWO MORE THINGS FOR YOU — neither blocking

### 1. `Phone` and `Employee ID` on screen `24` — ⛔ **NO COLUMN EXISTS ANYWHERE**

Measured across `accounts`, `centre_memberships`, `trainer_profiles` and `invitations`. ▶ **This is
the one item on that screen that is a genuine decision rather than a governance refusal:** no rule
forbids a staff phone number or a payroll id — there is simply **nowhere to put one**, and two
columns is a schema change of its own.

The other four omissions are **not** decisions and are settled: `Role` is `GC-11` (`Assistant
Trainer` is not in the enum, so it is **unpersistable**) · `Photo` has no column, bucket or policy
(`C-15` cited as adjacent precedent, not stretched) · `Assign Classes` is `A-016` (assignment is
**session**-level; the chips are **modules**, aimed at a `pending` membership).

⚠️ **All five are disclosed ON THE PAGE**, not in a source comment (§12.12), and a suite leg fails
the build if that disclosure is removed.

### 2. The **7-day invitation lifetime** — ⚠️ **STATED, NOT RULED**

`A-027` makes application-invitation expiry a real mechanism, separate from Auth-link expiry — and
**no instrument names a duration**, measured across the tree before writing. **7 days is this
build's choice**, held in one named constant so a ruling changes one line.

### 3. `AR-4` second instance — the only open **rule** question, unchanged.

---

## ✅ WHAT SHIPPED

**THE TRAINER EMAIL, ruled permitted.** Six layers, **one column wide**. ⚠️ `PT-5`/`PT-5b` asserted
the field's **absence** and were **inverted in the same pass** — a leg left behind would have gone
red on a correct build and read like a leak. ⛔ **What they assert now is not "the email is
present"** — that is one line and proves nothing — but that **the widening is exactly one column
wide at every layer**: no `auth_user_id`, no `select("*")`. Rendered in `text-ink`, not the frame's
`#AEB6C4` (**2.041:1** against SC 1.4.3's 4.5:1 floor) — the `F-01c` treatment, **no token
redefined**. ⚠️ **§7.4.1 again:** the pack's `.md` names **no email anywhere** while the `.png` draws
one under every name and the `.html` carries eight — **a note-derived build would never have raised
the question, and your ruling would not exist.**

**`P2-11` — screen `24`.** One `SECURITY DEFINER` function, one `EXECUTE` grant. Census **T=30 E=12
P=30 R=23**, unmoved. Four rows in one transaction; **no credential of any kind**, and neither the
name nor the email reaches an audit label or payload.

⛔ **YOUR BOUNDARY, PROVEN WITH A CONTROL THAT DISCRIMINATES.** `PA-4` shows the **same management
identity READING** all three tables; `PA-4b` shows **that same identity REFUSED on every write**,
read off **PostgreSQL's own error stream** rather than a verdict the suite composed. `PA-5` pins the
four privilege sets as **exact sets** — ⚠️ and **`invitations` holds NO grant at all**, *narrower*
than your wording, so the expectation is pinned to **what is true** rather than to the paraphrase.

---

## ⚠️ TWO DEFECTS THIS PHASE SURFACED — both recorded, neither quietly fixed

### 1. ⛔ **A migration that verifies its own SHAPE has not verified that it WORKS**

`20260815120000` **applied cleanly, printed NINE PASS notices, and shipped a function that could not
run**: `pg_catalog.coalesce(text, unknown) does not exist`.

Two mechanisms lined up. **`plpgsql` does not resolve function names at `CREATE` time** — and the
**same file's earlier** `position(… IN …)` fault *was* caught, because it was a **syntax** error
rather than a **resolution** one. ▶ **The two are indistinguishable while writing and opposite at
runtime.** And **all nine assertions were structural** — signature, posture, grant, privilege sets,
census — so **not one called the function**, and every one was true of a body that raises on its
first statement.

✅ **Corrected by forward migration `20260815130000` (`R-1`, never an edit)**, which adds the missing
**kind**: **`PC-10` EXECUTES the function** and requires the fail-closed `not_permitted` — it runs as
owner, so the caller gate returns **three lines before** the failing statement, which is exactly
enough coverage and writes nothing. `PC-11` generalises to the class.

▶ **New standing rule (plan §25.1): every migration that declares a function must EXECUTE it at
apply time.** ⚠️ What caught it was `prove:portal-p2-11` — the only proof that calls the function as
a **real caller in a real role**.

### 2. ⛔ **§12.13's THIRD instance — the route ratchet was red for a whole phase**

`/management/trainers` shipped at `P2-10`; the navigation census reported the missing expectation
**immediately**; and **`P2-10` was reported complete without `prove:portal-p2-1` being re-run.**

| # | Phase | Gate not run | Shipped anyway |
|---|---|---|---|
| 1 | `P2-6` | RPC-caller rule | a surface over three unwired write paths |
| 2 | `P2-8` | `lint` | an **error**, committed AND pushed |
| 3 | `P2-10` | `prove:portal-p2-1` | a route no expectation covered |

⛔ **The gate worked every time. It was not read.** ▶ Three consecutive phases makes it a pattern
about **which suites run at the end of a phase**: a phase is complete when **every suite whose
subject it touched** is green, and adding a route touches the route census whether or not the
phase's name mentions navigation.

⚠️ **AND IT HID A REAL DEFECT.** With the child route finally asserted, `N-2` reported
**`/management/trainers/add`: 0 current item(s)** — the rail item carried `exact: true`, so the
sidebar went **blank** on a page that plainly belongs to Trainers. **That is `C2C-002`, which
`Classes` already hit at `P2-2`.**

---

## STATE

| | |
|---|---|
| Branch · worktree · HEAD | `develop` · main worktree · `25aadae` · clean |
| Pushed | ✅ **`origin/develop` = `25aadae` = local HEAD**, read back **from origin** |
| `main` | **UNTOUCHED** — `5eb84bc`, verified from origin |
| Containers | **dev 9 · mvp 0** ⛔ demonstration stack never started or queried |
| Ports | `:3000` held by your walk server; untouched by me |
| Migrations added | **2** — `20260815120000` (`P2-11`) and `20260815130000` (its `R-1` forward correction) |
| Census | tables **30** · enums **12** · policies **30** · registry **23** · functions **63** |
| Portal suites | `p2-1` · `p2-2` · `p2-2b` · `p2-3` · `p2-4` · `p2-5` · `p2-6` · `p2-6r` · `p2-6r-e2e` · `p2-7` · `p2-8` · `p2-10` · `p2-11` · `ruling-a` — **all 14 PASS** |
| Navigation census | **all proofs passed**; 25 routes, 27 routes-and-aliases |
| `tsc --noEmit` · `next build` · `lint` · `prove:encoding` | clean · clean · **0 errors** · PASS |
| `T-P44`/`T-P44c` · `prove:no-secrets` | **PASS, unchanged** · **CLEAN** |
| Deliberately red | `prove:artefact-read` (`AR-4-14`/`AR-4-17`) · `prove:serving-discipline` (`D-10`, intermittent) |
| `NOT-RUN` | `bodySizeLimit` (browser leg) · `prove:stage2-routes` · `prove:stage3-authenticated` · VISUAL on `11`/`14`/`17`/`23`/`24`/`25` |
| ⏭ Next | ⏸ **`P2-9` IS BLOCKED ON A SCHEMA AUTHORIZATION** — stated below. **`P2-17` (`02` Trainer My Classes) needs none** and is where I go if you would rather not batch |
