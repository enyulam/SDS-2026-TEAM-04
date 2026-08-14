# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> ⛔ **NOT A TRACKER · NOT AUTHORITY · DERIVED.** Every line is reproduced or mechanically
> reduced from `STATUS.md`, `BUILD_NOTES.md`, `PORTAL_COMPLETION_PLAN.md`, `git`, or a live
> measurement. **Where this and `STATUS.md` disagree, `STATUS.md` WINS and this file is STALE.**
> Written at every stop and **OVERWRITTEN, never appended** (`FINAL_MVP_G06_GROUNDING_RULING.md` §H-8).

**Regenerated:** 2026-08-15 · branch `develop` · HEAD `47735ce` · ✅ **four phases complete since
your last message** · ⛔ **stopped at `P2-11`'s schema gate.**

## ⚠️ §15.8.1 FRESHNESS SWEEP

**Every open item re-verified against current state. Nothing copied forward. Four lapses found.**

| Carried previously | Re-measured now |
|---|---|
| `P2-6R` PARTIAL, upload inert | ⛔ **LAPSED — COMPLETE.** Transport ruled (b), built, proved end to end. No control on `14` is inert |
| The upload-transport ruling OPEN | ⛔ **LAPSED — RULED.** `T-P44` unchanged, not one character |
| `B` / `Strengths & Focus Areas` OPEN | ⛔ **LAPSED — RULED.** Not built; `P2-9` unblocked |
| The bare-word rating detector OPEN | ⛔ **LAPSED — RULED and NARROWED**, proven in both directions |
| `AR-4-14` `KNOWN-RED` · `AR-4-17` escalated | ✅ **BOTH STILL TRUE. CARRIED**, unchanged — **the only open rule question** |
| `D-10` intermittent | ✅ **STILL TRUE. CARRIED.** Not re-run; a flaky check closes on a diagnosed cause, never on a run of green |
| `S3-T1-r` · `S3-00` · `B-G06-DET-1` · §10 Phase 1 exit (c) · `09`/`C2C-007` · the mojibake repair · `test:continuity`/`test:exit-condition-b` | ✅ **ALL STILL TRUE. CARRIED**, unchanged |
| VISUAL walk | ✅ **STILL `NOT-RUN`** — now **five** screens: `11`, `14`, `17`, `23`, `25`. ⚠️ `11` and `14` have **changed** since you walked them |

---

## ⛔ THE STOP: `P2-11` (`24` Add Trainer) NEEDS SCHEMA. STATED, NOTHING WRITTEN.

**Measured, not assumed:** there is **no create path of any kind**. `invitations` has **NO grant to
`authenticated` at all**; `accounts` and `centre_memberships` are **SELECT-only**; and no
`admin_create_*` function exists — the only `admin_*` RPC is `admin_assign_session_trainer`.

✅ **THE AUDIT STRINGS ALREADY EXIST — measured in the live registry, not proposed.**
`admin.profile_created` and `invitation.created` are both present. ⛔ **The registry does NOT move.**

**PROPOSED, and awaiting your authorization:**

| | |
|---|---|
| **Tables** | ⛔ **NONE created.** Rows inserted into four EXISTING tables: `accounts`, `centre_memberships`, `trainer_profiles`, `invitations` |
| **Columns** | ⛔ **NONE** |
| **Enums** | ⛔ **NONE** |
| **Policies** | ⛔ **NONE** — the write is a `SECURITY DEFINER` RPC, so the tables stay SELECT-only to clients |
| **Grants** | **ONE** — `GRANT EXECUTE ON FUNCTION public.admin_create_trainer(text, text) TO authenticated` |
| **Functions** | **ONE** — `admin_create_trainer(p_display_name text, p_email text)`, `SECURITY DEFINER`, `search_path=''` |
| **Audit strings** | ⛔ **NONE added.** Emits the two that already exist, **one event per governed action** (`A-029`) |

**What the function would do, in one transaction:** re-resolve live management membership → insert
`accounts` with **`auth_user_id` NULL** (⛔ a profile is not a login — `A-020`/`A-025`) → insert
`centre_memberships` at **`pending`** → insert `trainer_profiles` → insert `invitations` with the
normalized email and `expires_at` → emit `admin.profile_created` and `invitation.created`.

⛔ **It stores no token, OTP, password or secret hash** (`A-027` — the tables have no column that
could hold one). ⛔ **It creates no Auth user** — Supabase Auth owns the credential, and the
recipient establishes their own.

⚠️ **ONE THING I WOULD NEED YOU TO SETTLE WITH IT:** the frame for `24` draws a **photo** field,
which `C-15` defers, and possibly a role selector. I will state both against the `.png` when you
authorize the phase.

---

## ⏸ ALSO WAITING ON YOU — neither blocking

### 1. The trainer EMAIL on screen `23` — raised, built closed, **recommend PERMIT**

The frame draws an email under each name. `accounts.normalized_email` **already exists and is
readable** — nothing is missing. ▶ The pack says *"Do not expose authentication details"*, and an
email **is** the Auth login identifier, so I **built it closed**: the refusal lives **in the DTO**,
which has no field for one, rather than in a component that chooses not to render it.

▶ **I recommend permitting it.** Management **supplies** the email when inviting the trainer
(`A-020`), so it discloses nothing they do not already hold; it is **staff** data, not learner data;
`A-027`'s prohibited-secret list does not include it; and a directory that cannot separate two
identically-named trainers is materially worse. **One sentence adds the field.**

### 2. `AR-4` second instance — the only open **rule** question, unchanged.

---

## ✅ WHAT SHIPPED — four phases

**`P2-6R`** — the upload transport, ruled **(b)**. `T-P44` unchanged. `bodySizeLimit` **derived**:
the multipart envelope measured at **1,070 bytes** worst case, so the limit is **26,218,496** =
ceiling + 4 KiB, 3.8× the envelope. **Three port members, not evidence's four** — the ticket/attach
split exists because `D-5`'s bytes bypass the server, and here they do not. Non-resumability stated
**at the control, permanently**. **18 end-to-end legs**, including the **trainer refused by the same
policy**.

**`RULING A`** — the dashboard reads **ENROLLED**; `o_assessed_students` dropped by forward
migration; tile removed. ⛔ **The hard part was the rename-that-isn't**: both readings were **13**,
so `RAa-2` **constructs** the divergence — withdrawing a learner moves the tile **13 → 12** while
`students` stays **13**. It **fails against the pre-ruling function**. Found a constraint nobody had
named: **the database will not let a withdrawal be a bare flag flip**.

**The rating detector, narrowed.** ⛔ **Attribution, not adjacency — `A-052`'s own legal example
(*"has mastered maintaining eye contact"*) puts the label four words from a dimension name**, so an
adjacency rule would have re-created the very false positive the ruling removes. Grammar, not
distance. Proven **both directions on every run**; the screen-`14` sentence is pinned as a
must-NOT-fire sample rather than avoided by rewording alone.

**`P2-10`** — screen `23`, **no schema**, seven tables re-measured at three layers. Three refusals,
each a different kind: `On leave` (`GC-12`, and the enum agrees) · `Edit` **absent, not disabled**
(▶ *disabled means "not yet"; absent means "not a thing"*) · the email, raised. ⚠️ **A control that
passed while proving nothing**, caught same-pass: `PT-3b` compared management against a trainer and
**both read 1**; rewritten to the **parent** (0 vs 3).

---

## STATE

| | |
|---|---|
| Branch · worktree · HEAD | `develop` · main worktree · `47735ce` · clean |
| Pushed | `origin/develop` = `3e3b316` at the last push; **`47735ce` pending this checkpoint's push** |
| `main` | **UNTOUCHED** — `5eb84bc`, verified from origin |
| Containers | **dev 9 · mvp 0** ⛔ demonstration stack never started or queried |
| Ports | `:3000` held by your walk server; untouched by me |
| Migrations added since your last message | **1** — `20260815090000_portal_ruling_a_dashboard_enrolled.sql` (Ruling A, pre-authorized) |
| Census | tables **30** · enums **12** · policies **30** · registry **23** · functions **62** |
| Portal suites | `p2-5` · `p2-6` · `p2-6r` · `p2-6r-e2e` · `p2-7` · `p2-8` · `p2-10` · `ruling-a` — **all PASS** |
| `tsc --noEmit` · `next build` · `lint` | clean · clean · **0 errors** |
| `T-P44`/`T-P44c` · `prove:no-secrets` | **PASS, unchanged** · **CLEAN** |
| Deliberately red | `prove:artefact-read` (`AR-4-14`/`AR-4-17`) · `prove:serving-discipline` (`D-10`, intermittent) |
| `NOT-RUN` | `bodySizeLimit` (browser leg) · `prove:stage2-routes` · `prove:stage3-authenticated` · VISUAL on `11`/`14`/`17`/`23`/`25` |
| ⏸ Next | **`P2-11` — BLOCKED on the schema authorization above.** `P2-9` is unblocked and could run first if you prefer |
