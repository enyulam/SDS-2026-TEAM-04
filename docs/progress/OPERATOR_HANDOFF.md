# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> ⛔ **NOT A TRACKER · NOT AUTHORITY · DERIVED.** Every line is reproduced or mechanically
> reduced from `STATUS.md`, `BUILD_NOTES.md`, `PORTAL_COMPLETION_PLAN.md`, `git`, or a live
> measurement. **Where this and `STATUS.md` disagree, `STATUS.md` WINS and this file is STALE.**
> Written at every stop and **OVERWRITTEN, never appended** (`FINAL_MVP_G06_GROUNDING_RULING.md` §H-8).

**Regenerated:** 2026-08-15 · branch `develop` · HEAD `9a374e6` · ⏸ **`P2-6R` is `PARTIAL` — the
upload transport is ruled and building; the surface is not yet complete.**

## ⚠️ §15.8.1 FRESHNESS SWEEP

**Every open item re-verified against current state. Nothing copied forward. Two lapses found.**

| Carried previously | Re-measured now |
|---|---|
| `origin/develop` = `df15ad9`, **`P2-8` not pushed** | ⛔ **LAPSED, AND IT HAD BEEN WRONG THROUGH TWO PUSHES.** `git ls-remote` says **`origin/develop` = `288d261`** — `P2-8` **is** pushed. ✅ **Corrected in `STATUS.md` FIRST** (the source, commit `9a374e6`), then derived here, per §15.8.1 step 2 |
| `P2-9` is next | ⛔ **LAPSED.** You ordered the screen `14` repair first. **`P2-6R` ran and is `PARTIAL`; `P2-9` does not start until it closes** |
| `D-10` **intermittent** | ✅ **STILL TRUE. CARRIED.** Not re-run; a flaky check is closed by a diagnosed cause, never by a run of green |
| `AR-4-14` `KNOWN-RED` · `AR-4-17` escalated | ✅ **BOTH STILL TRUE. CARRIED.** `prove:artefact-read` unchanged at **48 PASS · 2 FAIL** |
| `S3-T1-r` · `S3-00` · `B-G06-DET-1` · §10 Phase 1 exit (c) · `09`/`C2C-007` · the mojibake repair · `test:continuity`/`test:exit-condition-b` | ✅ **ALL STILL TRUE. CARRIED**, unchanged |
| VISUAL walk = four screens (`11`, `14`, `17`, `25`) | ✅ **STILL TRUE and still `NOT-RUN`.** ⚠️ **Screen `14` has CHANGED since you walked it** — Download and Remove went inert → live |

---

## ⏸ WHAT NEEDS YOU

### 1. `:3000`

Still held by your walk server, so `prove:stage2-routes` and `prove:stage3-authenticated` are
**`NOT-RUN`, not passing**. ⚠️ **I will need it clear to prove the upload end to end through the
browser.** I will say when.

### 2. ⛔ `AR-4` — THE SECOND INSTANCE. Still open, unchanged.

Your `P2-6` ruling reserved this: *"two instances would make it a rule problem rather than a frame
accident."* **`AR-4-17` is the second.** Nothing moved; no threshold touched.

### 3. Push

⛔ **TWO COMMITS AHEAD, NEITHER PUSHED** — `6c18a71` (`P2-6R`) and `9a374e6` (this correction). Your
authorization reads *"develop only, **this phase**"* and does not carry across phases.

---

## ✅ RULED THIS SESSION: THE UPLOAD TRANSPORT IS **(b)**, THE SERVER-ACTION RELAY

> **Operator, 2026-08-15:** *"I scoped that exception to `evidence-upload.ts` SPECIFICALLY, and
> route (a) needs precisely the widening I refused. **The guard firing is the guard working.**"*

⛔ **Route (a) — browser-direct resumable — is REFUSED**, and `T-P44` stays exactly as written.
✅ **Route (b) needs no widening**: the storage policy is `FOR INSERT TO authenticated`, and ADR-3
records that *"the database role follows the credential, not the code location"* — so a server
relay carrying the caller's own cookies is the **same principal** the policy already gates.

⚠️ **NON-RESUMABILITY IS A RECORDED LIMITATION, STATED ON THE SURFACE** in the same register as the
unscanned notice: *a dropped upload retries from the start.* Your instruction: **the copy must not
imply otherwise.**

---

## ✅ WHAT SHIPPED SO FAR: `P2-6R` — the screen `14` repair (`6c18a71`)

**The defect, stated plainly.** `P2-6` shipped screen `14` over an **unwired write path**: three
RPCs granted to `authenticated`, named in the application **only inside comments**, behind three
permanently `disabled` buttons — and reported **COMPLETE**, with the limit disclosed in a source
comment and **nowhere you read**. You found it by clicking the button.

**Gate first, as you ordered.** `rpcsWithoutApplicationCaller` fails any portal-era RPC no
application file calls. Its exemption is **proven from the live catalogue**, never declared — and
matched with `strpos` rather than `LIKE`, because **SQL `LIKE`'s underscore is a single-character
wildcard** and `material_remove` would otherwise have matched the audit string `material.removed`
and been **exempted by its own detector**. **14 declared · 3 unwired · 2 provably internal** → now
**0 unwired**, both controls firing.

**Built.** Transport (`server-only`; `readMaybeRow` throughout, since all three are
`RETURNS record`) · four Server Actions · DTOs both sides · four port members · real-adapter
bindings · four fixture **refusals** · Download and Remove wired to real handlers, with a **re-read**
rather than a local splice. ⛔ **No schema — not one DDL statement**, and two legs pin it.

`prove:portal-p2-6r` **PASS** (22 checks, 2 controls) · lint/tsc/build clean.

## ⛔ STILL INERT, AND THIS IS THE §12.12 DISCLOSURE

**The Upload control does not work yet.** Route (b) is ruled but not built. **Screen `14` is
`PARTIAL`, not complete**, and no other part of it is inert.

---

## ⚠️ THE GATE-DISCIPLINE PATTERN — TWICE IN CONSECUTIVE PHASES (§12.13)

| Phase | Reported | Never run |
|---|---|---|
| `P2-6` | COMPLETE | no gate asked *does application code reach these RPCs* |
| `P2-8` | COMPLETE, **committed AND PUSHED** | `npm run lint` — a `@next/next` **ERROR**, caught on the next phase's routine run |

⛔ **The common shape: I ran the suite I had just written and reported the phase on it.** Both new
suites were green and honest about what they measured. ▶ **The defect is the inference from *my
suite is green* to *the phase is complete*** — valid only if the standing gates ran too.
⚠️ **And the second one reached `origin`.** The push authorization is per-phase precisely so that
boundary is a moment of attention.

**§12.14** — second shell-heredoc failure, recorded. File content is written with the `Write` tool.
The failure mode is not *"it errors"* but *"it writes something subtly different and reports
success"*.

---

## STATE

| | |
|---|---|
| Branch · worktree · HEAD | `develop` · main worktree · `9a374e6` · clean |
| Pushed | `origin/develop` = `288d261`. ⛔ **2 commits ahead, unpushed** |
| Containers | **dev 9 · mvp 0** ⛔ demonstration stack never started or queried |
| Ports | `:3000` held by your walk server; untouched by me |
| Migrations added | **none** |
| Audit registry | **23, unmoved** |
| `prove:portal-p2-6r` | **PASS** — 22 checks, 2 controls |
| `prove:portal-p2-8` (`PDTa-WIRED`) | **PASS** — 3 unwired → 0; both controls fire |
| `prove:portal-p2-6` · `test:runtime-profile` | **PASS** · `T-P44`/`T-P44c` **PASS** |
| `prove:no-secrets` | **CLEAN** |
| `tsc --noEmit` · `next build` · `lint` | clean · clean · **0 errors** |
| Deliberately red | `prove:artefact-read` **48 PASS · 2 FAIL** · `prove:serving-discipline` (`D-10`, intermittent) |
| `NOT-RUN` | `prove:stage2-routes` · `prove:stage3-authenticated` (`:3000`) · VISUAL on `11`/`14`/`17`/`25` |
| ⏸ In flight | **Upload via route (b)**, then **Ruling A**, then **report B's Strengths question** |
