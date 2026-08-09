# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> **DERIVED ARTIFACT (§15.8 / `FINAL_MVP_G06_GROUNDING_RULING.md` §H-8).** Written at every stop and **OVERWRITTEN, never appended**. It **originates nothing** and is **not a fifth layer of §15.1** — where this file and `docs/progress/STATUS.md` disagree, **`STATUS.md` wins**.
> Generated **2026-08-10**. Contains **no credential**.

## Project · phase · position

**B.E.S.T Coach Final MVP.** Hero-execution overlay, post-Stage-3, in the deployment track. The Week-13 Final Presentation is the target; deployment is compulsory (public URL, complete end-to-end journey, **functional AI feature in the deployed system**).

**Position: the hero chain is COMPLETE and verified twice** — by database query and by Operator browser walkthrough of all three portals. The Operator is now **rehearsing on it**. No further surface changes are authorized.

| | |
|---|---|
| Branch / worktree | `main` / none (`git worktree list` returns one entry) |
| HEAD | **`a0f48b9`** |
| Working tree | clean at handoff |
| Demo URL | **`https://best-coach-mvp.vercel.app`** — the alias, serving `a0f48b9` |
| Hosted DB | Supabase `zjukuffiuzkbiblmnuwl`, **ap-southeast-1 (Singapore)**, 17 migrations applied |
| Model | `gpt-5.6-terra`, function region `iad1` |

⚠️ **Demo ONLY on the alias.** Every deployment is `target: production` with its own immutable URL; per-deployment URLs are frozen snapshots and carry none of the recent fixes.

## What is proven

**The full governed lifecycle ran end to end on the deployed system** for learner **`Amelia Tan`** (`report 0381f34f-5d6c-4547-88e5-3d518562b21f`): `observation_saved → drafting → draft_ready → trainer_approved → submitted`. `report_version_approvals` holds **both** a `trainer` and a `management` row; 2 `report_versions`; the parent report renders four OD-4 panels with **no ratings** (Q-27 held).

**Real AI drafting works in the deployed system.** One call, **ACCEPT**, `reasons: []`, 1,308 tokens, persisted through the hosted trusted store (`report_versions` 1, `report_version_ratings` 9, `report_source_map` 15). **B-G06-DET-1 answered in the direction that matters:** grounding did **not** false-reject legitimate real-provider prose; both `beginning` dimensions appeared in Areas for Development, neither claimed as a strength.

**Fallback for the stage:** report **`4876bc9f-4e58-41ab-a253-822fcb024120`** (Fixture Student One) sits at **`draft_ready`, `lock_version` 8**, deliberately untouched. If a live AI call fails on stage, continue from this already-drafted report.

**R-27 intact throughout.** `report_store_draft` owner-only, zero client EXECUTE, no `service_role` grant, no `BYPASSRLS` — re-verified by measurement (`current_user = postgres`, function owner `postgres`, `has_function_privilege` true).

## Standing open items — CARRY, DO NOT FIX

| ID | Item |
|---|---|
| `F-DEMO-1` | The draft page **auto-dispatches on mount; there is no generate button**. A demonstration problem, not a defect. Awaiting Operator ruling. |
| `F-UI-DRIFT-1` | Deployed frontend built against an **earlier Figma iteration across multiple screens** (named instance: Coach/Internal Notes segment removed in the newer design, still in the build). **Some divergences are DATA-BOUND** — Coach Notes binds `observations.follow_up_notes`, one column on two screens, interacting with next-session continuity. **Single batched pass POST-DEMONSTRATION.** Full enumeration not done. |
| `F-EVIDENCE-SCOPE-1` | **No parent-side video evidence placeholder.** Class video is *class* footage — other children appear — so parent-side evidence needs a **per-child scoping decision that has not been made**. The trainer-side inactive control correctly names the gap. Aligns with Authority Lock §8.1 (parent evidence projection out of Final MVP; A-001 armed-and-unactivated). Any parent evidence surface is a §12 stop-and-ask. |
| `B-STAGE3-2` | Canonical local fixture DB dirtied by governed mutations (`audit_events` irreversible by design). **Post-demo cleanup.** |
| `B-C2-1` | Open, undiagnosed. **Negative control K remains NOT SATISFIED.** Not to be closed. |
| `B-C2-2` | Open, deliberately unfixed. |
| `F-REGION-1` | Function in `iad1`, requests from Singapore, database in Singapore. Functional, cross-region. Recorded only. |

## Consequence to be aware of (not to fix now)

The visible provenance caption was removed from all portals; the `data-adapter-kind` **marker element is retained on Trainer and Management** because `prove-disposable-app` and `prove-governed-lifecycle` read it out of the served DOM as the G-19 real-adapter proof and fail closed without it. **The parent surface now carries no marker at all** (deliberate). Any G-19 harness leg that expected a marker on *parent* will report it missing — a known consequence of the parent-diagnostics removal, not a regression of the adapter.

## Discharged this session

`T-DIAG-REMOVE` — the temporary `/api/diag-draft` route, its caller harness, and `BEST_COACH_DIAG_ROUTE` in **both** environments are all removed; verified live (framework 404, not the handler's gate string). `T7-RECLASSIFIED` — the (g) save-leg FAIL was a harness timing defect; product behaviour correct, verified by Operator walkthrough. `M2` likewise recorded PASS on Operator evidence.

## Not done, and known

README and deployment instructions are **not written**. §3 persona sign-offs are **not recorded**. Password sign-in is **NOT-RUN** everywhere — every session in every harness is **admin-minted**, which is never a sign-in proof.
