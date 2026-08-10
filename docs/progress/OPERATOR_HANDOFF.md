# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> **NOT A TRACKER · NOT AUTHORITY · DERIVED** (`CLAUDE.md` §15.8 / `FINAL_MVP_G06_GROUNDING_RULING.md` §H-8). Written at every stop and **OVERWRITTEN, never appended**. It **originates nothing** and is **not a fifth layer of §15.1** — **where this and `docs/progress/STATUS.md` disagree, `STATUS.md` wins and this file is stale.**
> Regenerated **2026-08-10**. Contains **no credential**.

---

## ⛔ WHICH WORKSPACE IS THIS — read before anything else

| | |
|---|---|
| **Workspace** | **DEVELOPMENT CLONE**, branch **`develop`**. **NOT the demonstration workspace** |
| **Hosted target (configured, NOT contacted)** | **`poblcfbxxzgarclchzkx`** — Supabase, `ap-southeast-1` |
| ⛔ **FROZEN, OFF LIMITS** | The demonstration workspace and hosted project **`zjukuffiuzkbiblmnuwl`**. **Never connect to that ref.** If any value read resolves to it — **STOP and tell the Operator** |
| ⛔ **Git** | **No push. No merge. No `main`. `develop` only.** Local commits at phase boundaries are expected |

⚠️ **`STATUS.md` opens with a CURRENT EXECUTION STATE block for THIS clone**, above the demonstration-workspace `📌` block. Read the clone block; everything below it is history and is not about this repository.

---

## ▶ NEXT AUTHORIZED ACTION — BATCH 3, AND IT IS AUTHORIZED NOW

**Start plan Phase 4 and run through Phase 12, autonomously, committing at EVERY phase boundary.** No further Operator authorization is needed to begin.

`docs/plan/UI_RECONCILIATION_BUILD_PLAN.md` §4 is the phase list. In order:

| # | Screen | Route · component | Reference pack |
|---|---|---|---|
| **4** | `05` Trainer Schedule | `/trainer/schedule` · `features/trainer/trainer-schedule.tsx` | `Trainer - Schedule` |
| **5** | `06` Trainer Student Roster | `/trainer/sessions/[sessionId]/roster` · `trainer-roster.tsx` | `Trainer - Student Roster` |
| **6a** | `07` Trainer Grade Student | `…/students/[studentId]/assess` · `trainer-assessment.tsx` | `Trainer - Grade Student` |
| **6** | `08` Trainer AI Report Generation | `/trainer/reports/[reportId]/generate` · `trainer-draft-generation.tsx` | `Trainer - AI Report Generation` |
| **7** | `29` Management Reports | `/management/reports` · `management-reports-queue.tsx` | `Management - Reports` |
| **8** | `19` Management Student Report | `/management/reports/[reportId]/review` · `management-report-review.tsx` | `Management - Student Report` |
| **9** | `32` Parent Reports | `/parent/reports` · `parent-reports-list.tsx` | `Parent - Report` *(singular)* |
| **10** | `33` Parent Class Report | `/parent/students/…/report` · `parent-canonical-report.tsx` | `Parent - Class Report` |
| **11** | `30` Parent Dashboard | `/parent` · `parent-dashboard.tsx` | `Parent - Dashboard` |
| **12** | `11` Management Dashboard | `/management` · `management-dashboard.tsx` | `Management - Dashboard` |

**Phase 6a runs BEFORE Phase 6.** **Phase 13 (`01`) is CUT** — the component must not be deleted. **Out of the plan entirely:** `09`, `10`, the two wording editors and `/trainer/reports/[reportId]/review` (§1.3, §1.4), and the 20 unimplemented screens.

⚠️ **Resolve every reference pack from `UI_REFERENCE_FINAL_MVP/SCREEN_INDEX.md`, never by guessing the folder name.** Three are underivable: `32` → `Parent - Report` (singular), `AUTH-02` → `Auth 02 - **Mangement** - Login` (misspelled on disk — **do not correct it**), `02` → `Trainer -  My Classes` (two spaces).

### Rules that do not relax in Batch 3

- **`NEW-QUESTION` is a HARD STOP.** Never a judgement a phase makes about its own work.
- **A phase that changes a `REGISTERED-OMISSION` has FAILED — revert and report**, even if the result matches the frame better.
- **One screen per phase, one phase at a time. Commit at every phase boundary, never mid-phase.**
- **§0.0 governs direction:** frame wins where no ratified rule speaks; where one does, keep the divergence and cite it. The existing build is **not** a baseline to preserve.
- **The `.html` export is a source of VALUES, not markup.** No ported markup, absolute positioning, fixed pixel layout, export class names or lifted DOM. Copying structure is a phase failure.
- **No governed surface changes** — no schema, migration, RPC, server action, DTO, projection, grant, policy, audit action or route. **Route census must stay 17.**
- **No logo or tagline asset may be invented** — a recorded asset dependency, never `TRUE-DRIFT`.
- Batch 3 carries **NO hosted, paid, public, human, push or submission authority**, and every `CLAUDE.md` §12 stop-and-ask binds inside it exactly as outside.
- `PASS` is your evidence verdict; **`Accepted` is Operator-set only.** Never write or imply one.

---

## Position

| | |
|---|---|
| Branch / worktree | `develop` / none |
| HEAD | resolve with `git rev-parse HEAD` |
| Tree | clean at handoff |
| Ahead of `origin/develop` | **12 commits, NONE pushed** |
| Database | **none written this session.** The frozen project was **never contacted** |

## ✅ BATCH 1 — ACCEPTED BY THE OPERATOR, 2026-08-10

| Phase | Commit | State |
|---|---|---|
| **0** shared chrome baseline | **`3010b63`** | ✅ **ACCEPTED** |
| **1** `AUTH-01` Trainer Login | **`ea5d32b`** | ✅ **ACCEPTED** |
| **2** `AUTH-02` Management Login | **`02218ba`** | ✅ **ACCEPTED** |
| **3** `AUTH-03` Parent Login | **`71953fa`** | ✅ **ACCEPTED** |

**The first `Accepted` marks in this clone.** Set by the Operator, superseding the earlier session `PASS` verdicts.

**Result, as two lists that are never merged:** `TRUE-DRIFT` resolved **25** (10 / 14 / 1 / 0) · `REGISTERED-OMISSION` preserved **12, zero changed** · `NEW-QUESTION` **none** · `INCOMPLETE` **none** · census **17** throughout.

## ✅ The Phase 0 `NOT-RUN` is CLOSED — by Operator manual verification

**The Operator verified the rail by hand across all three portals; it renders correctly on every screen.**

⚠️ **Recorded as OPERATOR MANUAL VERIFICATION, NOT as a harness pass.** **No automated capture of the rail exists** — nothing was re-run and no suite covers it, so **this must never be cited as evidence that a rail regression would be caught.** It is a point-in-time observation of the rail at `3010b63`; it does not transfer to a later change to `portal-shell.tsx`, `portal-navigation.ts` or `brand-mark.tsx`, and it does not cover hover, focus or responsive collapse.

## ⚠️ THREE THINGS BATCH 3 MUST CARRY FORWARD

1. **A declared class is not evidence it applied.** `.form-field` is **UNLAYERED**; Tailwind utilities sit in `@layer utilities`, so `rounded-[…]`/`px-[…]`/`py-[…]` written on such an element are **emitted, matched, and silently lose the cascade** — the control kept computing its old geometry while every source-level check looked correct. Same class as **F-01b** and **F-01c**. Caught only because the build side is a **measurement of the rendered DOM**. **Any phase restyling a `.form-field`, `.card` or `.panel` element must verify the COMPUTED value, not the class list.** The narrow fix pattern is `.form-field.auth-field`; **do not move `.form-field` into a layer** — that changes the cascade for every consumer at once.
2. **A comment broke a MUST-NOT-CHANGE.** An explanatory comment placed *between* the glyph and the `Sign out` label failed `sign-out-terminates-session` S-1, which pins `/>` → `Sign out` → `<` inside the form. It changed no rendered output; source review would not reliably have caught it. **A suite did.** Run the mechanical suites during a phase, not as end-of-phase ceremony.
3. **✅ RULED — `Sign out` stays.** The frame draws `Logout`. Operator ruling 2026-08-10: **`TRUE-DRIFT`, deliberately NOT applied**, because two **accepted** proofs pin that exact string as how they locate the production control (`sign-out-terminates-session` S-1; `prove-disposable-app` G-22), and renaming would retarget accepted evidence to make a caption match. **No longer an open item — a later phase must not reconcile it toward the frame.**

## Contrast, for the record

Three authentication colours were **already failing** SC 1.4.3 at ~**3.07:1** and now measure **5.101 – 5.558:1**, by re-pointing the failing nodes at the existing darker `neutral-on`. ⚠️ **NO TOKEN VALUE WAS REDEFINED** — `--color-ink-muted` is unchanged and still serves placeholders, disabled controls and muted avatars. The frames are lighter still (2.041 – 3.492:1) and were deliberately not followed. All nine measured pairs clear AA.

## How to produce build-side evidence

`node scripts/ui-reconciliation/capture-login.mjs <before|after>` captures the **authentication** surfaces only (public, no database), serving the **production build** under the §7.4a discipline with the S-3 trip-wire armed. It writes a PNG plus a **computed-style JSON** per role to `docs/progress/ui-reconciliation/{before,after}/`.

⚠️ **Batch 3's screens are all AUTHENTICATED, so that harness does not reach them** — the portal layouts run `requirePortalAccess`, which needs a session and therefore a reachable governed database, and `.env.local` here configures the **hosted** dev project only (a §12 stop-and-ask no current authorization carries). **Expect to record rendered captures as `NOT-RUN` with the reason, exactly as Phase 0 did** — and to verify by frame-vs-source measurement, the mechanical suites, and the build. **`NOT-RUN` is not `PASS`.** Do not manufacture a capture, and do not reach a hosted or paid service to obtain one.

## ⛔ NOT-RUN, none carried forward as green

Every disposable-stack harness · every real-provider leg · **password sign-in** · `design-foundation.assertions.ts` (no runner — pre-existing; its relative extensionless import does not resolve under Node ESM).

**Suites that DO run**, via `--experimental-strip-types` plus the existing alias loader: `portal-navigation-active-state` (6/6) · `post-login-destinations` (5/5) · `sign-out-terminates-session` (4/4, needs a server on `127.0.0.1:3000` and `BEST_COACH_APP_ORIGIN`) · `authentication-browser-smoke` (12 checks, same server requirement).

## Carried, untouched

`F-S6-REVIEW-1` (functional, **explicitly out of this plan**) · `F-UI-DRIFT-1` buckets (a) blocked / (b) done / **(c) Phases 0–3 accepted, 4–12 authorized and not started** · `F-DEMO-1` · `F-EVIDENCE-SCOPE-1` · `B-STAGE3-2` · `B-C2-1`/`B-C2-2` · `F-REGION-1` · `F-STAGE3-1` · the `project_id` fallout · the **academy asset dependency** (Operator-owned) · the identity-row/page-title baseline · the `Remember me` native checkbox radius.

## Gates and unratified decisions

**§3 persona sign-offs — NOT RECORDED**; no `CLAUDE.md` §10 phase-gate exit may be declared met. **README and deployment instructions — still not written.** `B-G06-DET-1` — ⛔ **do not widen the lexicon.**

## Reading order for the next session

`CLAUDE.md` → `FINAL_MVP_AUTHORITY_LOCK.md` and operator rulings → `FINAL_MVP_EXECUTION_PLAN.md` → **`STATUS.md` (workspace header, then the CURRENT EXECUTION STATE block)** → recent `BUILD_NOTES.md` → **`docs/plan/UI_RECONCILIATION_BUILD_PLAN.md`** → **`docs/plan/UI_RECONCILIATION_PHASE_0_RAIL_ADJUDICATION.md`** (cite it for the rail instead of re-deriving it) → **`docs/plan/UI_RECONCILIATION_PHASES_1_3_AUTH_ADJUDICATION.md`**. ⚠️ **A reading order, not a precedence order** — precedence is `CLAUDE.md` §1. **Then verify state against the repository before acting** (§15.3).
