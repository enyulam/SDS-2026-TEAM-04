# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> ⛔ **NOT A TRACKER · NOT AUTHORITY · DERIVED.** Every line is reproduced or mechanically
> reduced from `STATUS.md`, `BUILD_NOTES.md`, the stop report, `git`, or the live database.
> **Where this and `STATUS.md` disagree, `STATUS.md` WINS and this file is STALE.**
> Written at every stop and **OVERWRITTEN, never appended** (`FINAL_MVP_G06_GROUNDING_RULING.md` §H-8).

**Regenerated:** 2026-08-12, at the `P2-1` analysis checkpoint — before any `P2-1` code was written.

---

## ⛔ FRESHNESS REPORT (`CLAUDE.md` §15.8.1) — what was re-verified, and what had lapsed

**Re-verified against current state, not copied forward:**

| Carried claim | Method | Result |
|---|---|---|
| `R-4a` blocking `P1-2`…`P1-5` | live `audit_action_registry()` + Amendment 008 | ⛔ **LAPSED** — ruled by `C-4` on 2026-08-11; registry is **19**; all four phases built and Operator-walked |
| Pooled URL "not verified working" | Operator walkthrough exercises the trusted-store write | ⛔ **LAPSED** (previous regeneration) — corrected |
| `report_evidence` "never held a row" | Operator attached a clip locally | ⛔ **LAPSED** (previous regeneration) — corrected, scoped **LOCAL** |
| Phase 1 exit condition (c) unproven | hosted `follow_up_notes` measured NULL; fixture still Step 7F minimum | ✅ **STILL TRUE** — carried |
| `B-G06-DET-1` open | no automated verdict produced since | ✅ **STILL TRUE** — carried |
| `P2-2`/`P2-6` `C-7` schema gates | `PORTAL_COMPLETION_PLAN.md` §2.3 `R-7` | ✅ **STILL TRUE** — carried |
| `main` untouched | `git ls-remote` | ✅ **STILL TRUE** — `5eb84bc` |

⚠️ **Every lapsed item was corrected in its SOURCE record before this file was derived** — `CLAUDE.md`, `PORTAL_COMPLETION_PLAN.md` and `BUILD_NOTES.md` — because correcting only the handoff reproduces the defect.

---

## Position

| | |
|---|---|
| **HEAD** | **`05774a3`** — *docs: correct the ten stale 50 MiB sites and two lapsed limits in the handoff*. ⚠️ **Derived at `05774a3`; the commit CARRYING this file is its immediate successor** — a derived artifact cannot name its own SHA, so verify with `git log -1` |
| **Branch** | `develop` |
| **Tree** | **CLEAN** (`git status --porcelain -uall` empty) |
| **Remote** | `origin` → `github.com/enyulam/best-coach-mvp` (**PRIVATE**) · `develop` = **`05774a3`** (pushed, verified from `origin`) · `main` = **`5eb84bc`, UNTOUCHED** |
| **Tags** | `best-coach-part-1-complete` · `hero-feature-baseline` · `stage3-authenticated-green` |
| **Worktrees** | **ONE** — the main checkout on `develop`. `worktrees/` does not exist |
| **Migrations** | **25 on disk · 25 applied LOCAL · 25 applied HOSTED DEV** — ordered ledgers byte-identical |

## Environments

| | |
|---|---|
| **Hosted dev DB** | `poblcfbxxzgarclchzkx` (Supabase, `ap-southeast-1`). 28 tables · 49 functions · 12 enums · 29 `public` policies · 1 `storage` policy · 3 `auth.users` |
| **Deployed dev app** | **`https://best-coach-dev.vercel.app`** — Vercel `best-coach-dev`, production branch **`develop`**, latest production deployment **READY at `0b7b547`**; a build for `05774a3` was triggered by its push |
| ⛔ **FROZEN, OFF LIMITS** | `best-coach-mvp.vercel.app` (on `main`) and hosted `zjukuffiuzkbiblmnuwl`. Verified byte-identical to its captured baseline after every step this session |
| **Fixtures (hosted)** | **Step 7F MINIMUM ONLY** — 1 learner, 1 session, 1 module, 9 ratings. The report is at `observation_saved`, `lock_version 4`, `report_versions 0` |

## Current phase — PART 2, `P2-1` ANALYSIS COMPLETE, CODE NOT STARTED

**23 buildable phases `P2-1`…`P2-23`; `P2-24` (`28` Term Report) DEFERRED by `C-11`.**

**`P2-1` (`12` Management Classes) — frame read, delta classified, NO SCHEMA NEEDED** (management
`SELECT` policies **and** matching `authenticated` grants exist on all six tables, measured at HEAD).
Classification: `NEEDS NEW PROJECTION` + `NEEDS NEW SERVER ACTION`.

⛔ **Three governance divergences found in the frame — each would have been built wrong from it:**
1. The frame's level tab reads **`Junior`**; ratified vocabulary is **`Beginner`** (A-016, A-054).
2. **`Asst. <name>` is a TA field — PROHIBITED** (`A-014`, `G-7`). `REGISTERED-OMISSION`, **never ends**.
3. **`X / 12 Lessons done`** needs lesson data that arrives with `D-3`/`D-4`. `REGISTERED-OMISSION`,
   **ends when data arrives**.

⛔ **Schema gates ahead, `AWAITING_OPERATOR`:** `P2-2` and `P2-6` under `R-7`/`C-7`.

### Part 1 — verified, and its limits

✅ **VERIFIED END TO END ON THE DEPLOYED DEV ENVIRONMENT** by Operator walkthrough at `f2200e8`,
hosted dev at 25 migrations: trainer start class → … → linked parent viewing the session report.

**Outstanding, and NOT covered by that walkthrough:**

- ⛔ **`CLAUDE.md` §10 Phase 1 exit condition (c) is UNPROVEN, not passed.** The hosted fixture is
  the Step 7F minimum and `observations.follow_up_notes` was **measured NULL** — no note to carry,
  no second session to carry it to. **The chain the walkthrough covered does not contain (c).**
- The broader §11 fixture (2 trainers, 2 modules, 3–4 learners, 2 parents, **a second session**)
  is **deferred**, and is exactly what (c) requires.
- The walkthrough is **POINT-IN-TIME** against `f2200e8`. Any later commit, migration, fixture or
  environment change **reopens it**; no later state inherits it (`CLAUDE.md` §14.7).

## Which ending fired

**Ending C — remaining context insufficient to begin AND finish `P2-1`.** Stopped **before writing any
`P2-1` code**. ⚠️ **Nothing is half-built:** §3 requires each phase to deliver its screen COMPLETE —
projection, server action, frontend, verification — before the next begins. The frame read, the three
divergences and the delta classification are the phase's **analysis step**, recorded in
`BUILD_NOTES.md`, so the next session starts from measurement rather than from the frame.

## Suites and proofs that RAN this session

| Suite | Result |
|---|---|
| `npm run prove:no-secrets` | **exit 0, ×3.** CLEAN — 0 credentials · 87 occurrences / 13 locations all ADJUDICATED · 4 controls fired · `develop` never moved |
| `npm run fixtures:hosted-preflight` | **exit 1 BY DESIGN** — "NOT EMPTY" is the correct verdict for a populated project; used as a census, not a gate |
| `npm run fixtures:hosted-push --dry-run`, then live | **exit 0.** 8 migrations applied, each reporting its own in-file assertions (`H0A-1..7`, `H0B-1..10`, `H1-1..7`, `H7-1..8`, `D1-1..9`, `E1-E10`, `P5-1..5`, `T1..T5`) |
| Post-push census vs local | **PASS** — 25/28/49/12, identical ordered ledgers |
| `report_cancel_draft` (governed RPC) | **PASS** — `drafting`→`observation_saved`, `lock_version` 3→4, +1 audit event, 9 ratings and the observation intact |
| Evidence file-size restatement sweep | **PASS — ZERO LIVE STALE ASSERTIONS**, 687 tracked files. Classified: 21 ANNOTATED (struck in place, preserved by design) · 7 EXEMPT (append-only log · the superseding ruling itself · a commented-out config example) · **0 LIVE**. ⚠️ **A RAW count cannot reach zero under annotate-never-delete**, so the classifier carries a control proving it separates a live claim from an annotated one. Its first control caught the detector matching the tail of a one-hundred-and-fifty-MiB string |

## NOT-RUN this session, with reasons — never merged with the above

| Not run | Reason |
|---|---|
| `npm run build` · unit · integration · Playwright | Not invoked. **No application code changed this session** — every commit is docs/governance except the publication register |
| Local hero E2E and negative controls | Not invoked; superseded in evidentiary value for Part 1 by the Operator's deployed walkthrough, which does **not** substitute for them as automated proof |
| Grounding detector vs real provider prose (**`B-G06-DET-1`**) | **NO automated verdict produced.** Only as proven as the walkthrough's own drafts |
| Fixture load / expansion | **Withheld by explicit Operator instruction.** The three synthetic passwords stayed unused |
| Assertion-vacuity sweep | **NOT RUN this session, per harness.** Not carried forward from any prior session |

## Open gates · undiagnosed · unratified

- ✅ **The ten stale `50 MiB` restatements are CORRECTED (2026-08-12, bounded Operator instruction
  authorizing all ten).** Annotate-never-delete throughout. `AUTHORITY_LOCK.md:1353` — which carried
  a **settled** question as an **OPEN register row**, inviting a session to re-decide what `C-16`
  ruled — is **CLOSED as RULED**. `PORTAL_COMPLETION_PLAN.md:324`'s false **"measured"** claim is
  struck: `config.toml` reads `100MiB` globally. **Zero live stale assertions remain**; raw string
  hits persist **by design**, because annotate-never-delete preserves the struck text.
- **`B-G06-DET-1`** — open, and untested against real provider prose by any automated harness.
- **Standing credential-custody rule (Operator, 2026-08-12):** credentials go into files and
  dashboards **by the Operator**; the session reads and verifies; **never through chat, either
  direction.** Consequence: the session cannot assert the *contents* of Operator-placed values —
  only their presence and their metadata.

## Claims made earlier in this run that execution does NOT prove

- ⛔ **TWO LIMITS THAT LAPSED BEFORE THIS FILE WAS FIRST READ — corrected 2026-08-12 on Operator
  report.** ⚠️ **The irony is recorded deliberately: a handoff written to LEAD WITH ITS LIMITS
  carried two limits that had ALREADY LAPSED at the moment of writing.** Both were true when
  drafted and false when read — **the same stale-restatement shape this project has now caught
  seven times, occurring inside the very artifact built to prevent it.** ▶ **The lesson is
  structural, not clerical: an artifact is only as current as its LAST DERIVATION, and this one
  was derived from records written before the Operator's walkthrough had finished.**
  - ~~`SUPABASE_DB_POOLED_URL` is verified REPLACED, not verified WORKING.~~ ✅ **VERIFIED WORKING.**
    The Operator drove the full chain on `best-coach-dev.vercel.app`, which **exercises the
    trusted-store write through that pooled URL**. `updatedAt > createdAt` only ever proved
    modification; **the walkthrough is the execution that proves the connection string functions.**
  - ~~`report_evidence` is 0 rows … no evidence object has ever been written in any environment.~~
    ✅ **FALSE — a clip was attached LOCALLY during the Part 1 walkthrough**, so the evidence
    substrate has now been exercised end to end. ⚠️ **Scope, precisely: LOCAL. The HOSTED
    `report_evidence` was 0 rows when last measured**, and no hosted evidence write is claimed.
- The `pgdelta-target-ca.crt` error during the migration push is a **post-push catalogue-caching**
  failure, **not** a migration outcome — which is why the push was verified **by census, not by
  exit code**.

## Next permitted action

**Write `P2-1`'s code** — projection → server action → frontend → verification, in that order (§3:
server-side precedes the frontend that consumes it). **Its analysis is done and recorded; no gate
stands in front of it.** Honour the three registered omissions above. **Then `P2-2`, which DOES hit a
`C-7` schema gate and must STOP with its tables, columns, policies and grants stated.**

**Prerequisites already satisfied:** tree clean · `develop` pushed and verified from `origin` ·
`main` untouched · hosted dev schema-current · deployed dev app READY at `4cfb57f` · publication
gate CLEAN.

⛔ **Not carried by anything above, and each needing its own Operator authorization:** any hosted or
billable operation · fixture reload or expansion · editing ratified authority · a push to `main` ·
public deployment · human testing · final submission.
