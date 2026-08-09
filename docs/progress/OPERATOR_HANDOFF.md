# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> **NOT A TRACKER · NOT AUTHORITY · DERIVED** (`CLAUDE.md` §15.8 / `FINAL_MVP_G06_GROUNDING_RULING.md` §H-8). Written at every stop and **OVERWRITTEN, never appended**. It **originates nothing** and is **not a fifth layer of §15.1** — **where this and `docs/progress/STATUS.md` disagree, `STATUS.md` wins and this file is stale.**
> Regenerated **2026-08-10**. Contains **no credential**.

---

## ⛔ WHICH WORKSPACE IS THIS — read before anything else

| | |
|---|---|
| **Workspace** | **DEVELOPMENT CLONE**, branch **`develop`**. **NOT the demonstration workspace** |
| **Hosted target** | **`poblcfbxxzgarclchzkx`** — Supabase, `ap-southeast-1` |
| ⛔ **FROZEN, OFF LIMITS** | The demonstration workspace and hosted project **`zjukuffiuzkbiblmnuwl`**. **Never connect to that ref.** If any value read resolves to it — **STOP and tell the Operator** |
| **Demonstration build** | Tagged **`hero-feature-baseline` → `a0f48b9`** in the **demonstration workspace**. Frozen |
| ⛔ **Git** | **No push to `main`. No merge. `develop` only**, until the Operator says otherwise |

⚠️ **`STATUS.md` and `BUILD_NOTES.md` came across from the demonstration workspace.** `STATUS.md` now opens with a workspace header; **everything below that header still describes the demonstration project** except the 2026-08-10 entries.

---

## Ending that fired

**Planning stop, by instruction.** Not a gate and not a context limit. The Operator ordered plan amendments, a read-only §6 investigation, a set of follow-up tasks, then an explicit stop: *"I will authorize Batch 1 in a fresh session, which will read the handoff, `STATUS.md` and the plan from disk."*

## Position

| | |
|---|---|
| Branch / worktree | `develop` / none |
| HEAD | resolve with `git rev-parse HEAD` — the 2026-08-10 planning commit |
| Tree | clean at handoff |
| Ahead of `origin/develop` | **5 commits, none pushed** |
| Local database | none reached this session |
| Hosted dev DB | **17 migrations · 27 tables · 39 functions · 12 enums · 29 policies · RLS on 27/27 · 27 `authenticated` EXECUTE, 0 `anon`/`service_role`/`PUBLIC`** |
| Fixtures | **3 synthetic identities + 25 baseline domain rows.** ⚠️ `Amelia Tan`, `Ethan Wong`, `Priya Menon` are **demonstration-only** and appear in **no fixture SQL** — they will never exist here |

## Commits this session, oldest first

| SHA | What |
|---|---|
| `29ba601` | Hosted target guard retargeted; `project_id` → `best-coach-dev` |
| `83779dc` | Behavioural deny predicate + the **7th** false-predicate record |
| `fed3ea4` | Five superseded `A-014` citations corrected; screens 30 and 11 documented |
| `60da075` | Reconciliation plan **v2**; `STATUS.md` workspace header |
| *(this)* | Plan **v3**; §6 draft amendment; the **8th** false-predicate instance fixed |

## ▶ NEXT AUTHORIZED ACTION

**NONE until the Operator authorizes BATCH 1 — Phase 0 only** (`docs/plan/UI_RECONCILIATION_BUILD_PLAN.md` §5.1).

**No phase has been started.** Phase 0 is shared chrome — the rail, brand mark and tokens — and is a prerequisite because no screen owns them. Complete → commit → **STOP for review**. Batch 2 (Phases 1–3) needs Phase 0 **accepted** first.

## Batched-UI reporting state (§6.5) — nothing to report yet

| Field | Value |
|---|---|
| Phases completed | **0** |
| `TRUE-DRIFT` resolved | **none — no phase run** |
| `REGISTERED-OMISSION` preserved | **none — no phase run** |
| `NEW-QUESTION` raised | **none** |
| Commit at phase boundary | **none** |

## Operator rulings received this session

1. **Capture on screen `07` STAYS.** The assessment save is `observations.follow_up_notes`' only writer; removal would empty the previous-focus carry-over, blank the AI prompt's follow-up context and **void Phase 1 exit condition (c)**. **Screen 07 UNBLOCKED** as **Phase 6a**, with the Follow-up field recorded as a **`REGISTERED-OMISSION`, not drift**.
2. **Screen `10` RECLASSIFIED** to **`CANNOT BE VISUALLY ACCEPTED`** (plan §1.4). Decided from the routes: **there is no `reports/[reportId]` index route**, so `/review` is the only trainer report detail surface and it carries a workflow the frame does not describe.
3. **§6 amendment drafted, NOT applied.** `docs/plan/DRAFT_CLAUDE_MD_S6_FOLLOWUP_AMENDMENT.md`. **Decision `D-2` — read-only / editable / absent — is OPEN and was deliberately not decided.** **`CLAUDE.md` is unmodified.**
4. **Plan v2 accepted**; §0.0's two-defaults table named as the amendment that matters.
5. **Premise correction accepted in full** — screen 10's frame is a completed-report VIEW, not the Review & Approve workflow.

## What is proven this session

- **Numbered packs do not hold older designs.** All **12** packs with a frozen `reference.png` are **SHA-256 identical** to their `/reference/` counterpart — **12 identical · 0 different · 0 missing** — and independently **12/12 match their `UI_PACK_MANIFEST.json` pins**. **"Drift" therefore means BUILD vs FRAME only.**
- **The hosted target guard denies the frozen project unconditionally** and the deny cannot be disabled: `npm run prove:hosted-target-guard` → **16 PASS / 0 FAIL**, including a **non-vacuity control** that requires the contact detector to fire against a real target.
- **Zero surviving stale `A-014` citations**, verified by a **concept** sweep with a non-vacuity control (the same sweep finds the site at pre-fix `HEAD`).

## ⚠️ EIGHTH false-predicate instance — found in my own verification

Bucket (b) reported *"zero stale citations remaining."* **Wrong** — a sixth existed and was **user-visible** (`trainer-report-review.tsx:504-507`). The sweep grepped **the five phrasings already known**, so it could only confirm what was already found. Same class as the seventh. **Fixed this session**; recorded in `BUILD_NOTES.md`.

## Suites RUN this session, with exit codes

`tsc --noEmit` **0** · `eslint .` **0** · concept sweep **0 surviving** (detector proven live) · 12/12 pack hashes · 12/12 manifest pins.

## NOT-RUN this session, with reasons

**`build`** — no route or component structure changed; the only code change is one user-visible string. · **Every harness** (`prove-stage3-authenticated`, the disposable hero E2E and negative controls A–M, the browser/C4 harnesses, `run-integration`, `run-canonical`, `run-c2`, `prove-g06-grounding`) — **not run and NOT carried forward as green.** · **Password sign-in — NOT-RUN**; every session in every harness is admin-minted, which is never a sign-in proof. · **No database was reached at all.**

## Open items — carried, not fixed

| ID | Item |
|---|---|
| `F-S6-REVIEW-1` | **NEW.** `/review` renders the follow-up note as a **read-only `<p>` with no save path**, so §6's edit-after-seeing-the-draft safeguard **is not implemented**. **Functional defect, not drift.** Travels with `D-2` |
| `F-UI-DRIFT-1` | Bucket (a) blocked pending `D-2`; (b) **done**; (c) is the plan, **not started** |
| `F-DEMO-1` | Draft page auto-dispatches on mount; no generate button |
| `F-EVIDENCE-SCOPE-1` | No parent-side evidence placeholder — **correct**; Authority Lock §8.1 rules the parent projection **out**. Any parent evidence surface is a §12 stop-and-ask |
| `B-STAGE3-2` | Canonical **local** fixture DB dirtied; needs the Operator's three interactive no-echo passwords. **Demonstration workspace concern** |
| `B-C2-1` · `B-C2-2` | Open, undiagnosed / deliberately unfixed. Negative control **K NOT SATISFIED** |
| `F-REGION-1` · `F-STAGE3-1` | Recorded. `F-STAGE3-1` now also owns screen **09** |
| **`project_id` fallout** | Three hard assertions now refuse in this clone (`load-local-fixtures.mjs:164`, `disposable-stack.mjs:671`, `run-f17.mjs:456`) and **~25 references hard-code `supabase_db_best-coach-mvp`**, including `trusted-store.ts:34`. **Carried by instruction — do not fix piecemeal** |

## Gates and unratified decisions

**§3 persona sign-offs — NOT RECORDED**; no §10 phase-gate exit may be declared met. **No Operator `Accepted` mark has been written or implied by any session.** **README and deployment instructions — still not written.** `B-G06-DET-1` — rule 3's detector matched 3 of 18 formulations; ⛔ **do not widen the lexicon.**

## Reading order for the next session

`CLAUDE.md` → `FINAL_MVP_AUTHORITY_LOCK.md` and operator rulings → `FINAL_MVP_EXECUTION_PLAN.md` → **`STATUS.md` (its workspace header first)** → recent `BUILD_NOTES.md` → **`docs/plan/UI_RECONCILIATION_BUILD_PLAN.md`**. ⚠️ **A reading order, not a precedence order** — precedence is `CLAUDE.md` §1. **Then verify state against the repository before acting** (§15.3).
