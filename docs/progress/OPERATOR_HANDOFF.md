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
| ⛔ **Git** | **No push. No merge. No `main`. `develop` only.** |

⚠️ **`STATUS.md` opens with a CURRENT EXECUTION STATE block for THIS clone**, above the demonstration-workspace `📌` block. Read the clone block; everything below it is history and is not about this repository.

---

## ▶ WHERE THIS STOPPED

✅ **`docs/plan/HERO_CHAIN_COMPLETION_PLAN.md` is WRITTEN (revision 2). PLANNING ONLY — NOTHING WAS BUILT.**

**Stopped on Operator instruction.** The Operator will **authorize Phase 0A in a fresh session**.

⚠️ **Before that, `B-STAGE3-2` should be cleared.** It is `OPERATOR-ONLY`, it blocks **every** end-to-end verification in the new plan, and the Operator asked to clear it *before* Phase 0A rather than discover it mid-phase. **The exact five steps are plan §7.2** — summarized below.

---

## Position

| | |
|---|---|
| Branch / worktree | `develop` / none |
| HEAD | **`b3cdc64`** — **unmoved at both ends of this run** |
| Working tree | ⚠️ **DIRTY, DELIBERATELY — three uncommitted files.** `docs/plan/HERO_CHAIN_COMPLETION_PLAN.md` (new) · `docs/progress/STATUS.md` · `docs/progress/BUILD_NOTES.md`. **`CLAUDE.md` §12: during a documentation, governance or analysis run, do not commit — leave the diff for Operator review.** Say the word and it will be committed |
| Ahead of `origin/develop` | **22 commits, NONE pushed** |
| Governed surfaces | **NONE touched.** No schema, migration, RPC, server action, DTO, projection, grant, policy, audit action or route |
| Database | **None read, none written.** No hosted or paid service contacted; the frozen project never referenced |
| Authorization in force | ⛔ **NONE.** Batch 3 is spent. **No `STANDING_LOCAL_EXECUTION_AUTHORIZATION` exists** |
| Outstanding Operator `Accepted` | **None** |

---

## ✅ THE EIGHT GOVERNANCE COLLISIONS — ALL RULED, 2026-08-10

Reported first, as a separate list, then ruled. **Settled — no phase re-opens one, and no phase designs around one.**

| | Ruling |
|---|---|
| **G-1** three unframed hero surfaces | **LEAVE UNFRAMED.** Functional completion covers all eleven routes; **visual acceptance covers the eight framed screens only.** The three are `NOT APPLICABLE (G-1)` — ⚠️ **a ruled disposition, never a `NOT-RUN`, never a defect** |
| **G-2** "Overall Grade" | ⛔ **NO — all four surfaces, PERMANENTLY, not deferred** |
| **G-3** lesson identity | ✅ **BUILD** number + title · ⛔ **KEY FOCUS chips OUT** |
| **G-4** term | ⛔ **NO** — a label is not worth the substrate an §8-deferred item needs |
| **G-5** trainer name on a Parent surface | ✅ **YES** — not a rating, not derived from one |
| **G-6** room | ✅ **YES** |
| **G-7** staff slots | ✅ **`Main:` built** · ⛔ **`Assist.` out; `centre_membership_role` NOT extended** |
| **G-8** evidence | ⛔ **CONFIRMED OUT.** The frame's "500MB" is never implemented |

**Screen `11` confirmed OUT of hero scope** — management completes the workflow without ever loading `/management`. The rating chip goes with it to the portal plan.

⚠️ **Five of the eight rulings REMOVE work.** The surviving new-build surface: three columns of schema, one identity projection, context fields on four existing projections, one narrow governed write. **Nothing in the plan computes an assessment fact.**

---

## ⚠️ ONE ITEM LEFT OPEN RATHER THAN ACTIONED — Operator's to decide

**`CLAUDE.md` §15.7** requires a ruling that changes product behaviour to be propagated into an **active authority document**, and says a progress log must **never** be its sole authority.

**G-2 permanently excludes a product feature. G-3 and G-6 authorize schema.** They currently live only in `STATUS.md`, `BUILD_NOTES.md` and the plan — **all procedural or continuity, none of them authority.**

⚠️ **Propagating them means editing ratified authority, which §12 permits only under an explicit bounded Operator instruction issued FOR THAT RUN.** No such instruction was given, so **nothing was edited.** Reported, not actioned — the same discipline Phase A and OD-4 ran under.

---

## ⛔ `B-STAGE3-2` — WHAT IS NEEDED FROM YOU

**All LOCAL. Nothing hosted, billable or pushed. No credential ever reaches a session, a file, a log or a report.**

| # | Action |
|---|---|
| **1** | **Start the local Supabase stack** and leave it running. Every harness calls `supabase status -o json` and aborts if it is down. **No password** |
| **2** | ⚠️ **Decide and perform the reset path.** ⛔ **Never `supabase db reset`.** An in-place `--reload` **cannot** clear the four `audit_events` rows — the append-only trigger refuses `postgres` too, and **must not be disabled** (§12). The precedent is **your own `D-0C` ruling**: a bounded LOCAL-only fresh reconstruction re-applying all 12 migrations under **R-1** semantics. ⚠️ **No session may choose or perform this** |
| **3** | **`npm run fixtures:local`** in your own terminal — prompts **three times, no-echo**. ⚠️ **Never paste a password in either direction; send only the exit code and the verifier verdict** |
| **4** | **Confirm `verify-local-fixtures.sql` passes, assertion `A19` in particular.** A19 is the one that failed — it is the signal the blocker is genuinely closed |
| **5** | ✅ *Optional, for Phase 4's roster breadth:* apply `scripts/fixtures/local_fixtures_expansion.sql`. ⚠️ **It already exists** (`P1-T09a`), is **strictly additive and independently appliable**, and supplies **the second Class Session the continuity re-proof needs**. **Apply it AFTER step 4** — the loader refuses `--reload` while expansion rows are present |

**Measured damage:** `reports` 0 → 1 · `audit_events` 0 → 4 · `audit_chain_heads` 0 → 1 · fixture attendance `recorded_by_*` non-NULL → **A19 fails**. **Blast radius:** `readCanonical()` throws before `assertCanonicalPristine`, so **all six disposable-stack harnesses abort** and every `TEMPLATE postgres` clone inherits the dirt.

**If it stays blocked:** Phases 0A and 0B can be authored and committed — a migration and a projection are code. ⚠️ **But no phase can reach `PASS`**, so work would accumulate unverified. That is the pattern that produced the four defects Batch 3 found.

---

## The plan in one screen

**Twelve phases, by screen never by layer.** Each delivers projection → server action → frontend → end-to-end verification **before the next begins**. No frontend-first pass, no trailing integration phase.

**`0A`** staff-identity projection · **`0B`** session metadata migration (`lesson_number`, `lesson_title`, `room`) · **`1`** `33` Parent Class Report · **`2`** `32` Parent Reports · **`3`** `05` · **`4`** `06` · **`5`** `07` · **`6`** `08` · **`7`** Trainer Review & Approve · **`8`** Trainer wording editor · **`9`** `29` · **`10`** `19` · **`11`** Management wording editor.

⚠️ **Phase 0 SPLIT into 0A/0B because of your own G-3 ruling.** You approved parent-screens-first on the basis that they were the only ungated deliverable — true while G-3 was unruled. Ruling **G-3 = BUILD** gave them a lesson deliverable, and screen `32`'s **row title *is* the lesson title**, so both now need the lesson schema. **Your intent is preserved — the parent screens still go first.**

**Why the parent screens are worst:** `CanonicalReportDto` carries **`panels` and `submittedAt` and nothing else** — the report page cannot state which class or session it is about, and cannot name the learner in its own heading.

⚠️ **Every one of the twelve phases needs your explicit authorization before any code is written** (plan §11).

---

## ⚠️ PHASE 7 AND THE OWED RE-PROOF STAY SEPARATE

Both touch `observations.follow_up_notes`. **Different claims, proven independently.**

- **The owed Phase 6a re-proof** backs **`CLAUDE.md` §10 Phase 1 exit (c)** — a note saved on `07` appears as the next session's previous focus. ⛔ **OWED**; proven statically only, which does not discharge it.
- **Phase 7 / `F-S6-REVIEW-1`** backs **§6** — `/review` loads that value into an editable field with a save path.

⚠️ **The re-proof runs FIRST, on the code before Phase 7 changes anything** — proving carry-over *after* adding a second write path proves the new path, not the original gate. **Neither may ever be reported as discharging the other.**

Plan §9.2 records a **recommendation, not a decision**: a narrow governed write that reads the observation server-side and updates only `follow_up_notes`, rather than round-tripping nine ratings through the client. It needs its own authorization and inherits the CP-2/CP-4 boundary — **no Step 7H event, registry stays at 16.**

---

## Provenance of the plan — audited, because you asked

✅ **`reference/*.png` and `reference/*.html`: YES for all eight framed hero screens.** Every `.html` was **re-extracted 2026-08-10**, not recalled across the context compaction. **No screen's frame content was derived without its `.html`**, so nothing needed re-deriving on that ground.

⚠️ **The numbered packs' `screen.md` was NOT read at first drafting.** Read for all eight before revision 2. **It was the real gap** — it carries *Prohibited invention* and *Dependencies*, which the `.png` and `.html` cannot. Three changes followed:

1. **A missing prohibition** — screens `32` **and** `33` both bar disclosing *"that a correction cycle is or was underway"*. **Constrains Phases 1 and 2**, the two sequenced first.
2. **G-6 and G-7 were already recorded dependencies** at checkpoint **F-04** on screen `05` — the rulings **discharge** them rather than open them.
3. **`PHYSICAL_TEST_SLICE_48H.md` §5.5 was checked, not assumed** — class, module, lesson and trainer are **not** on the absolute Management-DTO exclusion list, so the Phase 9 columns are permitted. **Evidence-backed now, not assumed.**

**Second check, unprompted:** each `screen.md` calls its RPCs *"delivered on `feat/48h-backend`"* — a **`CLOSED_BY_NONUSE_POLICY`** branch. **Enumerated from the migrations instead**; all fifteen are at HEAD.

**Standing lesson added to the plan (§12 item 8): read the numbered pack's `screen.md`, not only the `/reference/` artefacts.**

---

## ⛔ STILL `NOT-RUN` — none of it carried forward as green

1. **Rendered captures on all ten authenticated screens** — need a reachable governed database, a §12 stop-and-ask. ⚠️ **The Operator walkthrough is point-in-time manual verification and does NOT substitute.**
2. **The Phase 6a runtime carry-over re-proof** — ⛔ **OWED**, blocked at `CONT-A0` by `B-STAGE3-2`.
3. Every disposable-stack harness · every real-provider leg · password sign-in · `design-foundation.assertions.ts` (no runner) · `test:continuity`.

---

## Carried, untouched

`F-S6-REVIEW-1` (now **scheduled** as plan Phase 7) · `F-DEMO-1` · `F-EVIDENCE-SCOPE-1` · **`B-STAGE3-2`** · `B-C2-1` / `B-C2-2` · `F-REGION-1` · `F-STAGE3-1` (screen `09`) · the `project_id` fallout · the **academy asset dependency** (Operator-owned; **never** `TRUE-DRIFT`) · `OD-3` · the `Remember me` native checkbox radius · **`Sign out` stays** (ruled 2026-08-10 — a later phase must not reconcile it toward the frame's `Logout`).

**Gates:** §3 persona sign-offs **NOT RECORDED**; no `CLAUDE.md` §10 phase-gate exit may be declared met. README and deployment instructions **still not written**. `B-G06-DET-1` — ⛔ **do not widen the lexicon.**

⚠️ **The `CLAUDE.md` §6 amendment draft is unapplied** and may change what `F-S6-REVIEW-1` binds to. **Phase 7 should not start before it is ruled.**

---

## Reading order for the next session

`CLAUDE.md` → `FINAL_MVP_AUTHORITY_LOCK.md` and operator rulings → `FINAL_MVP_EXECUTION_PLAN.md` → **`STATUS.md`** → recent `BUILD_NOTES.md` → **`docs/plan/HERO_CHAIN_COMPLETION_PLAN.md`** → `docs/plan/UI_RECONCILIATION_BATCH_3_ADJUDICATION.md` (cite it instead of re-deriving Batch 3) → the two earlier adjudications. ⚠️ **A reading order, not a precedence order** — precedence is `CLAUDE.md` §1. **Then verify state against the repository before acting** (§15.3) — ⚠️ **expect a dirty tree; three files are uncommitted by design.**
