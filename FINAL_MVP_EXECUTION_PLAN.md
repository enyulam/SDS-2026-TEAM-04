# FINAL MVP EXECUTION PLAN — B.E.S.T Coach

> **Document class:** EXECUTION PLAN (`CLAUDE.md` §15.1, layer 2 of 4).
> **This document authorizes nothing.** It converts already-ratified authority into an executable
> sequence. Every phase below still requires its own explicit Operator authorization to begin, and
> the plan's existence is not that authorization.
>
> **Created:** 2026-08-08 · **Created at HEAD:** `dff7a693a2e5c755bb6d809a3b158385f7397605` · branch `main`
>
> **Status at creation:** Phase B implementation **NOT STARTED**. Nothing hosted has ever been
> contacted. Zero git remotes. This plan is the deliverable of a planning-only run that made
> **zero** application, schema, migration, test or behaviour changes.

---

## 1. PURPOSE

This is the single operational roadmap from the accepted pre-execution baseline to a complete,
submitted Final MVP. It exists so that a **fresh Claude Code session with no conversational
memory** can, after separate Operator authorization, resume execution correctly from whatever
state the repository is actually in.

It is **not** a product specification. It does not restate the product. Where a fact is governed
elsewhere, this plan **cites** rather than duplicates — because a duplicated rule is a rule that
will drift.

**What this plan is for:**

- deciding *what may be worked on next*, and in what order;
- knowing *what must be serialized* and *what may run in parallel*;
- knowing *where an Operator must be stopped for*;
- knowing *what "done" means* for each unit and for the project;
- knowing *how to recover* when a unit fails halfway.

**What this plan is not for:** re-deciding settled questions. Every decision indexed in
`FINAL_MVP_AUTHORITY_LOCK.md` is closed. Reopening one is a `CLAUDE.md` §12 stop-and-ask, not a planning act.

---

## 2. AUTHORITY

### 2.1 Precedence (restated from `CLAUDE.md` §1 and Authority Lock §2.4, §29)

> ~~One deliberate difference from the sources: rank 1 reads **Amendments 001–007**, because
> Amendment 007 / A-056 is ratified. `CLAUDE.md` §1 and Lock §29 both still enumerate **001–006** —
> that staleness is real and P0-T04 exists to correct it.~~ **✅ DISCHARGED 2026-08-08 — P0-T04 executed
> the correction under bounded Operator instruction G-00a, so `CLAUDE.md` §1 and Lock §2.2/§29/§31
> now enumerate the full set and no longer disagree with this table.** Rank 1 now reads
> **Amendments 001–008**: **Amendment 008 / `A-057`** was ratified 2026-08-08 under the Phase-0
> ruling set (G-05 item 6) and adds exactly two evidence audit actions. Everything else below
> matches the sources.

Explicit Operator rulings outrank everything. Below them, the **functional ladder**:

| Rank | Source |
|---|---|
| 0 | The two canonical submission PDFs in `FINAL_SUBMISSION_BRIEF/` (never edited) |
| 1 | `docs/spec/BEST_Coach_Complete_MVP_Specification_v3.md` + Amendments **001–008**, for the clauses each names |
| **2** | **`FINAL_MVP_AUTHORITY_LOCK.md` and the ruling instruments it indexes** (OD-4, **the Phase-0 ruling set `FINAL_MVP_PHASE0_OPERATOR_RULINGS.md` — added 2026-08-08**, Q-4, Q-27, Q-28, PA-OD-1/5/5b/8/9, R-27, …). Lock §4: *"Where any other workspace document disagrees with this file on a Final-MVP-defining question, this file governs."* |
| 3 | `CLAUDE.md` |
| 4 | `docs/plan/BEST_Coach_Implementation_Plan.md` (procedural; cannot override the spec — A-012) |
| 5 | The `docs/plan/` lifecycle and authorization baselines + the ratified 36-screen inventory |
| 6 | The ratified implementation contract — **the applied migrations** (Lock §29 treats these as one rank). **A migration does NOT outrank the specification** |
| 7 | `UI_REFERENCE_FINAL_MVP/reference/` prose and Figma (**lowest** on the functional ladder) |

The **visual ladder** is separate (A-045 as amended by **A-056** / Amendment 007):

1. `UI_REFERENCE_FINAL_MVP/reference/<mapped pack>/` — primary current visual source, all 36 screens
2. the governed pack's **optional** frozen local `reference.png` (12 of 36; never outranks 1; its
   absence is **not** a missing reference)
3. node-specific Figma context, only where no ratified `/reference/` asset exists
4. existing frontend implementation

**Existence governs facts; precedence governs rules.** A document never outranks a file that
demonstrably exists on disk (`CLAUDE.md` §15.3).

### 2.2 Reading order for a fresh session

`CLAUDE.md` → `FINAL_MVP_AUTHORITY_LOCK.md` + operator rulings → **this file** → `docs/progress/STATUS.md`
→ recent `docs/progress/BUILD_NOTES.md` → track-specific plans and evidence. **Then verify the
recorded state against reality before acting.**

### 2.3 Resolving whether an amendment clause is still current

Apply in this order (Authority Lock §2.4, `CLAUDE.md` §1):

1. **Supersession is clause-level, never instrument-level.**
2. **The later instrument's own supersession table is the authority** — read it there, never from a
   summary. (`CLAUDE.md`'s summary of Amendment 004 was itself found wrong three ways.)
3. A clause is superseded **only if a later ratified instrument names it**.
4. **Superseded text is never deleted from the ratified source.** It stays in place; the
   supersession lives in the later instrument. Historical amendment files are immutable
   instruments — **do not retroactively edit an old amendment merely to add an inbound
   supersession banner.**
5. Resolve conflicts by the ladder in §2.1.
6. Facts vs rules — see §2.1's closing line.

**Worked example, and the only one currently live:** A-045's three-rank *visual ladder* is
superseded by **A-056 / Amendment 007**. Everything else in A-045 — the two-ladder separation, the
functional ladder, *Figma-never-bypasses-governance*, the frame-versus-rule rule, and its
preservation of A-022.2/A-013 — **remains binding. A-045 is not obsolete.**
`docs/spec/…Amendment_005.md` still carries the original ladder text, unedited, deliberately.

### 2.4 Standing product authorities this plan preserves

Not restated in full; cited so no task may contradict them.

| Subject | Authority | Binding shape |
|---|---|---|
| Roles | Lock §4 | Exactly three: **Management · Trainer · Parent**. No TA, admin, super-admin or HQ tier |
| Hierarchy | Lock §3, A-016 | **Centre → Class Grade → Class Module → Class Session**. No `classes` entity |
| Nine dimensions | Lock §9 | Body · Emotion · Speech · Tonality · Eye Contact · Vocal Projection · Emotional Expression · Sentence Flow · Audience Awareness |
| Ratings | Lock §11, A-049 | **Beginning · Developing · Mastering · Mastered** (stored lowercase). Never conflate with Class Grade (`beginner`/`intermediate`/`advanced`). Bare-word rating regex prohibited (A-052); global keyword replacement prohibited (A-054) |
| Report statuses | Lock §6, A-036 | `incomplete · observation_saved · drafting · draft_ready · needs_edit · trainer_approved · approved · submitted`. **Eight. No ninth.** `approved` is transient-in-transaction and never commits — the user-facing "Approved" referent is `submitted` |
| Lifecycle | Lock §6 | 14 legal transitions; `submitted → needs_edit` is T12 and preserved. Every **forward** transition re-proves attendance-present and session-start, fail-closed |
| Attendance | Lock §7, A-018 | Default **Present**; **Trainer-only** toggle; absent learner receives **no report**; Management/Parent cannot modify; direct RPC must not bypass; auditable |
| Evidence | Lock §8, §8.1 | **REQUIRED**. Trainer uploads/owns. Private storage, short-TTL server-minted signed URLs. Management review-only. **Parent projection ruled OUT.** Evidence **never** automatically enters the AI prompt |
| AI authority | Lock §12 | Drafts narrative **only**. Never rates, approves, submits or publishes |
| OD-4 report model | OD-4 ruling, Lock §15.1 | One uniform model: **Overview · Strengths · Areas for Development · Remarks**, across AI, Trainer, Management and Parent. Role differences are authority/lifecycle differences, never panel semantics |
| Q-27 | Lock §15.2 | Parent Dashboard nine-dimension card **DO_NOT_IMPLEMENT** — and a **data** boundary, not CSS |
| Management edit scope | A-034, A-021 | **Wording-only**, exactly the four parent-facing panels. Cannot touch any assessment fact |
| Deployment | Lock §22.1, §22.2 | **Next.js → Vercel → hosted Supabase.** The GCP/Cloud Run platform mandate is **superseded** and must not be recreated |
| Region | **ADR-1, ADR-6**, Lock §23 | **ADR-6 pins the region to Singapore for database, Storage and compute, from project creation. This is a locked ADR — `CLAUDE.md` §2: "these are decided … do not propose alternatives unless the orchestrator explicitly reopens the decision."** Express the *obligation* platform-neutrally (it binds Postgres, Storage and compute equally, on whatever platform). ⚠️ **No region requirement comes from the submission brief** — "Singapore" appears in neither PDF. It is entirely an internal obligation and must **never** be presented as an academic one |
| `report_store_draft` | R-27 | **Zero client EXECUTE, permanently.** No later checkpoint may grant it |

---

## 3. EXECUTION PRINCIPLES

**E-1 — Verify, never trust.** Every phase begins by verifying branch, HEAD, working tree,
worktrees and local/hosted service state against reality. Recorded status is a hypothesis. The
Phase A2 audit was performed with the local database **down**, so every census figure in it is
statically derived — anything depending on the live catalogue must be re-derived, not cited.

**E-2 — A gate is `PASS`, `FAIL` or `NOT-RUN`.** There is no fourth value and no default. An
absent document, an unread value, an empty collector or an unanswered command yields `FAIL` or
`NOT-RUN`, never a verdict. **`Accepted` is Operator-set only.** A Main-Orchestrator `PASS` is a
readiness claim backed by evidence, not an acceptance.

**E-3 — Fail closed.** Every authorization, projection and negative control denies by default. A
green test whose detector never activates is a **failure**, not a pass (see §8, Phase 1).

**E-4 — Serialize anything that shares state.** Migrations, authorization contracts, generated
types, governance logs and shared UI shell files are single-writer, always. Parallelism is a
latency optimization, never a correctness risk worth taking.

**E-5 — One writer per worktree, disjoint paths, declared in advance.** A cross-owned edit is a
**blocker reported before modification**, never an edit made and mentioned afterwards.

**E-6 — Validation is a global mutex.** No two test agents run anywhere in the workspace at once.
Collisions produce silent false greens.

**E-7 — Leaving the machine needs its own authorization.** Cost is not the trigger — *leaving this
machine is*. Being inside an authorized implementation phase carries **no** authorization to
provision, deploy, spend or push.

**E-8 — Never work around a fail-closed refusal by weakening the thing that refused.**

**E-9 — Evidence over assertion.** Subagents return evidence; they never redefine authority. Never
accept a claim because a subagent returned it — in Phase A, 3 of 6 subagent claims were corrected.

**E-10 — Annotate, never delete.** Superseded governance text is struck and annotated in place with
its ruling and date. Historical evidence and ratified amendments are never rewritten.

**E-11 — Forward-only recovery.** The only history-touching operation compatible with SHA-cited
evidence is `git revert`. Never `reset`, `rebase`, `amend`, force-push, or `supabase db reset`.

**E-12 — Declare what was not done.** Scope carve-outs, skipped legs and untested paths are
recorded as `NOT-RUN` with a reason. Silent truncation reads as coverage.

---

## 4. ACCEPTED BASELINE

> **Two baselines, both true, used for different things — do not conflate them.**
>
> | Baseline | SHA | What it is |
> |---|---|---|
> | **Plan-authoring baseline** | **`dff7a693a2e5c755bb6d809a3b158385f7397605`** | The HEAD this plan was **written against**, verified 2026-08-08. Every "current state" fact in the table below was observed at this commit. It is a **historical fact and is never rewritten**. |
> | **First committed-plan baseline** | **`f53cae2853c4151d2a38ec29524573eed1af2e7b`** — `docs(plan): add final MVP execution plan` | The commit at which this plan **first existed in the repository**. Superseded by any later correction commit to the plan; the **currently recorded** committed-plan baseline is the one `STATUS.md` names. |
>
> **Execution always begins from ACTUAL current HEAD**, after verifying every commit between the
> recorded committed-plan baseline and it. Neither SHA above is a target to check out, reset to, or
> restore. A HEAD that is **not a descendant** of the recorded committed-plan baseline is a halt
> (P0-T01).

**State observed at the plan-authoring baseline** (re-verify at P0-T01; do not cite this table as
current):

| Fact | Verified value |
|---|---|
| Repository | `SDS Project Final (BEST Coach)` |
| Branch | `main` |
| **HEAD** | **`dff7a693a2e5c755bb6d809a3b158385f7397605`** — `docs(governance): supersede stale UI authority ladder` |
| Working tree | **CLEAN** (`git status --porcelain -uall` empty) — *as at the authoring baseline, i.e. before this plan was written and committed* |
| Git remotes | **0** — nothing has ever been pushed |
| Worktrees | **1** — `main` only |
| Branches | `main`, `feat/48h-backend`, `feat/48h-frontend` (the latter two `CLOSED_BY_NONUSE_POLICY`) |
| Tags | 4 — `final-mvp/phase-a2-complete-2026-08-08`, `final-mvp/pre-phase-a2-cleanup-2026-08-08`, `frozen/48h-backend-402b0b6`, `frozen/48h-frontend-6762b5c` |
| Migrations | **12** applied files |
| Governed UI packs | **36** |
| `/reference/` packs | **37** (33 product + 3 governed auth counterparts + 1 reference-only Forgot Password) |
| Routes | 17 `page.tsx`, 5 `layout.tsx`, **0** route handlers |
| Attendance write path | **ABSENT** — zero `CREATE FUNCTION` matching attendance in any migration |
| Evidence / Storage | **ABSENT** — zero tables, zero buckets, zero policies, zero UI |
| Management bootstrap | **ABSENT** — no RPC mutates memberships, accounts or invitations |
| Draft transport | `docker exec` into hardcoded container `supabase_db_best-coach-mvp` — **local-only, on the live participant path** |
| `npm test` | **ABSENT** — no vitest/jest/playwright installed, no CI, no `.assertions.ts` runner |
| Hosted | **NONE** — no Supabase project, no Vercel, no GCP, no remote |
| Frozen demo | External, read-only, `8d4acf4abc5039c24da01be773ab1a5e4916080f` — untouched |
| PeakPalate | `FOREIGN_REFERENCE_RETAINED_BY_OPERATOR` / `KEEP_IN_PLACE` — foreign, not a submission artefact, not contamination |

**Environment prerequisite (not repository governance).** `core.longpaths` is **unset** on this
machine; the longest tracked path is 113 characters, so the current repository works. A future
Windows clone or worktree should keep its root **shallow**. If a checkout ever fails on path
length, the Operator may enable Git long-path support or relocate to a shallower root. **A session
must never mutate the Operator's global or system Git configuration.**

---

## 5. PHASE OVERVIEW

| # | Phase | Nature | Locality | Authorization to ENTER | Parallelism |
|---|---|---|---|---|---|
| **0** | Execution baseline / lock | Verify, reconcile, arm long-lead gates | LOCAL | **G-00** — explicit | Read-only fan-out |
| **1** | OD-4 contract foundation | Migration + contracts + AI + controls | LOCAL | Explicit, or in-range §7.6 — **PLUS the separate OD-4 Phase B authorization (`CLAUDE.md` §12); a range grant is not it** | **Serial** (single writer) |
| **2** | Backend governance completion | Attendance · evidence · storage · bootstrap · auth · hosted transport | LOCAL | **G-07** — explicit, or in-range §7.6 | **Serial** for migrations; limited parallel for non-DDL |
| **3** | Final frontend reconstruction | Shared shell, then three role tracks | LOCAL | **G-10** — explicit, or in-range §7.6 | **Parallel after `P3_ROLE_TRACK_BASELINE`** (§7.3) |
| **4** | Local integration / acceptance | Full local proof incl. C4 re-proof | LOCAL | Explicit, or in-range §7.6 | Parallel read-only reviewers; serial validation runs |
| **5** | Bounded real-provider re-proof | G-6 against final AI contract + transport | ⚠️ **LOCAL INFRA + GATED PAID EXTERNAL CALL** | **G-15 then G-16 — HARD. Never inheritable, per invocation** | Serial |
| **6** | Hosted Supabase | Provision, migrate, configure, bootstrap | **HOSTED** | **G-17 — HARD, credentials** | Serial |
| **7** | Vercel deployment | First public deployment | **PUBLIC** | **G-19 — HARD, public** | Serial |
| **8** | Production UAT | Three-role governed lifecycle on hosted | **HOSTED** | **HARD** (plus G-16d/f paid legs) | Limited parallel per role |
| **9** | Human usability testing | Real participants, observed behaviour | **HUMAN** | **G-21 — HARD, human subjects** | Recruitment armed at Phase 0; **Phase 9 itself never runs early** |
| **10** | Final submission / presentation | Artefacts, scan, push, submit | **PUBLIC / EXTERNAL** | **G-25, G-26 — HARD, push & submit** | Parallel authoring |

**99 actionable tasks across 11 phases.** Task IDs are stable labels, **not an execution sequence** —
**Phases 2 and 3 in particular execute in a different order from their numbering**, each for a
reason stated at its own header. Read every task's `Depends on`, never the number.

**Execution-locality classification — three bands, not two:**

- **Phases 0–4 are LOCAL** — but ⚠️ **"local" is NOT the same as "non-billable", and assuming it is
  has already cost this project a real provider call.** `server/modules/report-workflow/actions.ts`
  constructs the **real** `OpenAiDraftProvider` **unconditionally** on the participant path (gate
  G-19 — *"there is no switch to flip"*), and the machine's `.env.local` carries ratified LLM
  selectors. **Therefore any locally served non-fixture build is a billable surface**, and a
  browser test that clicks "Save & Generate" bills. This is not hypothetical:
  `prove-disposable-app.mjs` records that *"a deleted selector is silently restored from the
  application's own file and the real provider becomes reachable again — **which is exactly what
  happened on an earlier run of this proof, whose report reached `drafting`**."*
  **Phases 0–4 are non-billable ONLY under the mandatory serving discipline in §7.4a.** That
  discipline is what makes the range eligible for a standing local execution authorization (§7.6) —
  not the phase number.
- **Phase 5 runs on LOCAL application and infrastructure but contains a GATED EXTERNAL, BILLABLE
  PROVIDER INTERACTION.** ⚠️ **It is therefore NOT local-only.** P5-T02 makes real, paid OpenAI
  requests. It is outside any standing local authorization and requires **G-16**, obtained
  immediately before invocation and never inherited.
- **Phases 6–10 involve HOSTED, PUBLIC, EXTERNAL, HUMAN and SUBMISSION systems** as applicable —
  each with its own non-inheritable gate.

Nothing in 5–10 may begin before Phase 4 exit, and nothing in 6–10 before Phase 5 completes, with
the single exception of the Phase 9 **recruitment** gate, which is armed at Phase 0 because it is
the longest-lead item in the project (Lock §26.5) and is gated on nothing. **Arming recruitment
does not advance Phase 9, and no part of Phase 9 executes early.**

Principle **E-7** is unchanged and governs all three bands: *cost is not the trigger — leaving this
machine is*, and a paid call is a stop regardless of where the code that makes it runs.

### 5.1 Relationship to the ratified §10 phase model and A-024

> ⚠️ **THE PHASE NUMBERS IN THIS PLAN ARE THIS PLAN'S OWN, AND THEY COLLIDE WITH `CLAUDE.md` §10.**
> Both numberings are live and they mean different things. `CLAUDE.md` §10 Phase 2 is **Evidence**;
> this plan's Phase 2 is **backend governance completion**. `CLAUDE.md` §10 Phase 3 is **Management
> read breadth**; this plan's Phase 3 is **frontend reconstruction**. `CLAUDE.md` §10 Phase 4 is
> **PDPA hardening & ops**; this plan's Phase 4 is **local acceptance**.
> **Every unqualified "Phase N" in this document is a plan phase.** A `CLAUDE.md` phase is always
> written as "`CLAUDE.md` §10 Phase N". Never satisfy one by citing the other.

This plan is an **execution decomposition inside** the already-ratified phase model, not a
replacement for it. `CLAUDE.md` §10's phase gates and A-024's 13-step sequence remain binding, and
"do not reorder or parallelize across phases" is unchanged.

**A-024 step → plan task mapping** (the audit trail that keeps the ratified sequence checkable):

| A-024 step | Discharged by |
|---|---|
| 1 — foundation / auth scaffolding | Already delivered (Steps 7E–7J); re-verified P0-T02 |
| 2 — hierarchy foundations | **P2-T07a** (governed administration write layer) |
| 3 — identity / invitation | **P2-T07b** (invitation lifecycle), P2-T09 (hardening first) |
| 4 — management setup and creation flows | **P2-T07a** (contracts) + P3-T04 packs 20, 21, 22, 24, 26, 27 |
| 5 — trainer assignment / calendar | **P2-T07a** + P3-T03 (05), P3-T04 (25) |
| 6 — enrolment / roster | **P2-T07a** + P3-T03 (06) |
| 7 — attendance | **P2-T01**, P2-T02, P3-T03 |
| 8 — nine-dimension assessment | Delivered; re-proven P4-T04 |
| 9 — AI draft / review / edit / approval (**the whole two-stage workflow**, per A-033) | P1-T08, P1-T09, P3-T03, **P3-T04** (management review stage) |
| 10 — shared submitted-report projection | P1-T07, P3-T02 |
| 11 — parent invitation / activation / linked view | **P2-T07b** + P3-T02 |
| 12 — management report view and remaining screens (**in addition to** step 9, not instead of) | P3-T04 |
| 13 — three-flow integration and UAT | P4-T04, **P8** (three flows: Management, Trainer, Parent — TA deferred) |

Two consequences the task ordering below already honours:

- **The Management final-review stage is part of the report slice, not the late UI phase.** The
  review surface, the wording-only edit, return-to-trainer and Approve & Submit belong with the
  governed report workflow. Their **server contracts** are Phase 1/2 work; only their **visual
  reconstruction** is Phase 3.
- **A-024 interleaves backend and UI per flow.** Where this plan groups by layer, each task record
  names the A-024 step it discharges so the ratified sequence stays auditable.

### 5.2 Calendar reality — flagged, not resolved by this plan

The submission timetable is Week 13 Final Presentation **10–16 Aug 2026** and Week 14 Final
Submission **17–23 Aug 2026**; the plan is created **2026-08-08**. A fully serial traversal of
Phases 0–10 does not fit that window. This is a genuine scoping problem and it is **the Operator's
to resolve, not the plan's** — this document therefore delivers the complete governed scope and
marks the compressible tracks rather than silently descoping.

The **mandatory dependency chain — every phase, none skippable** — is:

```
P0 → P1 → P2 → P3 → P4 → P5 → P6 → P7 → P8 → P9 → P10
```

**Every arrow is a real entry condition stated by the phase it points at.** No phase may be
bypassed, and **no phase may be satisfied by a reduced "minimum acceptance" reading of the phase
before it** — a phase's exit condition is the one that phase declares, not a smaller one chosen to
keep a schedule. Specifically:

- **P3 is mandatory before P4.** P4-T04 (the C4 re-proof) depends on P3-T06, and P4's route,
  visual, accessibility and projection proofs are proofs *of the reconstructed frontend*.
- **P5 is mandatory before P6.** G-6 must be re-proven against the final OD-4 AI contract and the
  final draft transport before hosted work builds on them; P6-T07b then closes the pooled leg P5
  declares `NOT-RUN`.
- **P9 is mandatory before P10.** The brief requires usability testing **and documented
  improvements made as a result**; P10-T04 and P10-T08 both consume P9's findings register and its
  remediation trace. Arming recruitment early does not discharge Phase 9.

**Two legitimately parallel branches, shown rather than omitted:**

```
  ├─ HUMAN TRACK  — armed at P0-T07 (recruitment/consent, longest lead, gated on nothing)
  │                 runs alongside P1…P8, and CONVERGES AT P9. Arming ≠ completing.
  │
  └─ ARTEFACT TRACK — the P10 authoring tasks that do not depend on the built system
                      (P10-T04 Design Workbook, parts of P10-T01/T02/T03) may be drafted
                      early — but ONLY under their own explicit authorization: they sit
                      OUTSIDE a Phases 0-4 range and no standing local authorization
                      reaches them. P10-T07 scan -> P10-T09 push -> P10-T11 submit remain
                      terminal and depend on everything above.
```

The administration and invitation write layers (P2-T07a / P2-T07b) are **on** the chain and not
optional: without them there is no permitted way to create a hosted UAT scenario, and six
Management screens have no server contract.

⚠️ **This chain is the schedule problem, stated honestly.** It is not a menu. Shortening it means
the Operator explicitly descoping something from the list below — not the plan quietly reading an
entry condition down.

The **compressible** tracks, in the order a triage should consider them:

1. Phase 3's **24 deferred portal screens** (A-044 scope; **narrowing requires an amendment**). Four
   of the 24 are partially implemented, but A-044 requires that partial existence be *"recorded per
   screen rather than the screen being reclassified as complete"* — so the compressible unit is 24,
   not 20.
2. Evidence media breadth — the ruled requirement is Trainer upload with private storage and
   Management review-only; the three *additional* upload surfaces in Lock §8.2 (student photo,
   trainer photo, lesson materials) are separate media classes and are not the ruled requirement.
3. Phase 9 depth — the brief mandates usability testing with *documented improvements* but
   specifies **no participant count, no consent protocol and no instrument**. Depth is a choice.

**Do not act on this triage without an Operator ruling.** It is recorded here so the conversation
can happen with the real dependency graph in front of it.

---

## 6. DEPENDENCY MAP

### 6.1 Phase-level graph

```
        ┌──────────────────────────────── P0  EXECUTION BASELINE / LOCK ─────────────────────────────┐
        │  verify · reconcile status · re-derive live catalogue · arm long-lead gates                │
        └───────────┬──────────────────────────────────────────────────────────┬────────────────────┘
                    │                                                          │
                    ▼                                                          ▼  (armed at P0,
        P1  OD-4 CONTRACT FOUNDATION   ── serial, single writer ──                 executes at P9)
        migration 13 · V2 hashes · RPC re-signature · types ·                  ┌──────────────────┐
        AI schema+prompt · grounding rule 4 · 9 fail-open guards ·             │ P9 RECRUITMENT   │
        anchor-existence controls · fixtures + test estate                     │ GATE (human)     │
                    │                                                          └────────┬─────────┘
                    ▼                                                                   │
        P2  BACKEND GOVERNANCE COMPLETION  ── migrations strictly serial ──              │
        auth hardening FIRST → bootstrap → administration + invitations →                │
        attendance → evidence + storage → hosted draft channel                            │
        server-action exposure · membership-less RPC sweep                                │
                    │                                                                    │
                    ▼                                                                    │
        P3  FINAL FRONTEND RECONSTRUCTION                                                │
        P3-T00 SHARED FOUNDATION  →  P3-T05a Q-27 DATA BOUNDARY   (both serial, on main) │
                    ▼                                                                    │
        P3_ROLE_TRACK_BASELINE = accepted main HEAD after BOTH  ── resolved at P3-T01 ──  │
                    ├──────────────┬──────────────┐                                      │
                    ▼              ▼              ▼                                      │
              Track T          Track M        Track P/A     ── parallel worktrees ──      │
              (Trainer)     (Management)   (Parent+Auth)                                  │
                    └──────────────┴──────────────┘                                      │
                    ▼  integration merge order: P/A → T → M                               │
        P4  LOCAL INTEGRATION / ACCEPTANCE  ── C4 re-proof · full suites ──               │
                    │                                                                     │
                    ▼                                                                     │
        P5  G-6 REAL-PROVIDER RE-PROOF        ⛔ OPERATOR · PAID                          │
                    │                                                                     │
                    ▼                                                                     │
        P6  HOSTED SUPABASE                   ⛔ OPERATOR · CREDENTIALS                    │
                    │                                                                     │
                    ▼                                                                     │
        P7  VERCEL DEPLOYMENT                 ⛔ OPERATOR · PUBLIC                         │
                    │                                                                     │
                    ▼                                                                     ▼
        P8  PRODUCTION UAT  ────────────────────────────────────────────────►  P9  HUMAN USABILITY
                    │                                                                     │
                    └───────────────────────────┬─────────────────────────────────────────┘
                                                ▼
                                    P10  FINAL SUBMISSION / PRESENTATION
                                         ⛔ OPERATOR · PUSH · SUBMIT
```

### 6.2 What must remain strictly serial

| # | Serialization point | Why |
|---|---|---|
| **S1** | **All migrations, globally.** One writer, one at a time. **The order is the Phase 2 execution order, not the task numbering** — see the Phase 2 header. One migration per task; **no two tasks share a slot** | Timestamp collisions, catalogue-census assertions, and the pinned migration count. See §6.5 |
| **S2** | **The report semantic contract** (OD-4 columns, both hash serializers, the eight report RPC signatures, generated types) | A second concurrent writer would produce two incompatible report models. This is why Phase 1 completes before Phase 3 forks |
| **S3** | **Generated types.** `server/db/database.types.ts` is regenerated only by the migration writer, only after a migration lands | Hand-editing generated types is prohibited (A-053, `CLAUDE.md` §12) |
| **S4** | **Authorization/security changes** — grants, revokes, RLS, role creation, `config.toml` auth | Two racing auth migrations can leave a window where a role holds privilege it must never hold |
| **S5** | **Test-suite execution, workspace-wide** | E-6 global mutex. Concurrent runs produce silent false greens |
| **S6** | **The shared UI shell** — `components/layout/portal-navigation.ts`, `components/layout/portal-shell.tsx`, `app/globals.css`, `app/layout.tsx` | Single-file multi-role ownership; cannot be split by role. Landed at P3-T00 **before** the tracks fork |
| **S7** | **Canonical records** — `docs/progress/STATUS.md`, `docs/progress/BUILD_NOTES.md`, `UI_REFERENCE_FINAL_MVP/SCREEN_INDEX.md`, `CHANGE_LOG.md`, `GLOBAL_UI_RULES.md`, `FRONTEND_RECONSTRUCTION_TRACKER.md` | One designated log writer per checkpoint, reconciled only from `main` |
| **S8** | **Hosted provisioning, public deployment, billable calls** | Each is an Operator gate. Serializing is a scheduling rule, never a licence to proceed |

### 6.3 What may run in parallel

| Window | Parallel units | Condition |
|---|---|---|
| Phase 0 | Read-only analysis/audit agents | Always safe |
| Phase 1 | Read-only reviewers alongside the single writer | Writer owns all mutation |
| Phase 2 | Non-DDL work (server actions, port mutators, module code, tests) alongside the **current** migration | Only one migration in flight; no two tasks edit the same module |
| **Phase 3** | **Track T · Track M · Track P/A** in separate fresh worktrees | **Only after BOTH P3-T00 AND P3-T05a have landed on `main` and passed their checks** — that commit is `P3_ROLE_TRACK_BASELINE`, and all three worktrees fork from it; disjoint file ownership declared; merge order fixed |
| Phase 4 | Read-only adversarial reviewers | Validation runs themselves remain serial (S5) |
| Phase 8 | Per-role UAT observation | Only after the shared lifecycle leg completes in order |
| Phase 10 | Artefact authoring (README, diagrams, workbook, site, video) | Disjoint files; the final scan and push remain serial and gated |

### 6.4 Unsafe parallelizations — explicitly prohibited

- ❌ Two writers changing migrations, in any two worktrees, ever.
- ❌ Two writers changing the report semantic contract or the panel model simultaneously.
- ❌ Auth/security migrations racing each other or racing `config.toml` auth changes.
- ❌ Frontend tracks independently defining report types. **All three tracks consume the Phase 1
  contract; none may extend it.** A track that needs a contract change stops and reports.
- ❌ Any hosted, provider or deployment work before Phase 4 acceptance.
- ❌ Two test agents running anywhere in the workspace at once.
- ❌ Any track editing `STATUS.md` or `BUILD_NOTES.md` outside its designated log-writer window.

### 6.5 Migration serialization protocol (binding)

Every migration-adding task **must**, in the same commit:

1. Take the next free timestamp; never reuse or backdate one.
2. Carry the **P-1 ownership guard** (`current_user = 'postgres'` preflight). Two existing
   migrations lack it (`20260803034500`, `20260806160000`) — remediate those separately at **P2-T13
   (Migration ownership-guard remediation)**,
   never by editing them retroactively into the new file's scope.
3. **Re-emit signature-qualified `REVOKE`/`GRANT` for every function whose signature it changes.**
   All existing grants are signature-qualified, so a renamed parameter list silently orphans them.
4. Update **every pinned census** it moves. This is the largest single source of avoidable failure
   in Phase 1 and 2, so it is enumerated rather than described:
   - **Migration-count pins (currently `12`) — 10 hard count sites**: `static-scan.mjs:46` ·
     `c3-static.mjs:88` · `ct-static.mjs:156` · `verify-fresh-apply.mjs:174` and `:214` ·
     `verify-local-fixtures.sql:428` and `:431-437` · `asm-suite.sql:169` ·
     `lifecycle-canonical.sql:242` and `:243-245`. **Two of these enumerate all twelve version
     strings literally** — that is a list edit, not a number edit.
   - **Three pins that are not counts and will not be fixed by updating a number**:
     `ct-static.mjs:25/157` and `c3-static.mjs:96` pin the *newest* migration filename; and
     **`c2-static.mjs:116` pins an ordinal (`index !== all.length - 3`)** — a new migration shifts
     the composer's position and fails `T-C2-S2` for a reason no count change addresses.
   - **`ct-static.mjs`'s SHA loop (`:158-168`) is dynamic and `slice(0,-1)`-scoped and survives a
     new migration untouched.** What breaks there is the length guard `:156` and the last-file
     guard `:157`.
   - **The zero-EXECUTE assertion set — EIGHT carriers, and a grep for any one identifier finds at
     most four of them**, because they use three different spellings plus two that use no variable
     at all: `20260805090500_…:3053` (`v_zero_exec`) · `20260806090000_…:675`,
     `20260806103000_…:404`, `20260807113000_…:344` (**`v_7i_zero_exec`**) ·
     `scripts/tests/step-7i/lifecycle-canonical.sql:376` (**`v_zero`**) ·
     `scripts/fixtures/verify-local-fixtures.sql:668-677` (**an inline `IN`-list, no variable**) ·
     `scripts/tests/assessment/asm-suite.sql:236-240` (**a `proname IN (…)` +
     `has_function_privilege` check, T-ASM-42**) · ~~**`scripts/tests/correction-tracking/
     ct-static.mjs:214` (a JS literal array scanning migration TEXT for `GRANT … TO` — the ONLY
     authoring-time static scan that would catch a stray `GRANT … ON FUNCTION
     report_content_hash_v2 … TO authenticated` in a new migration file; leave it un-updated and V2
     has no static-scan coverage at all).**~~ 🔴 **CORRECTED 2026-08-09 — PLAN DEFECT PD-2. That
     claim is FALSE.** `ct-static.mjs` pins `MIG_NAME = '20260806103000_management_correction_
     tracking.sql'` at `:20` and tests `bodyCode`, read from **that one already-applied migration**.
     It never reads a new migration, so it could **never** have caught a stray V2 grant in M13, and
     adding the V2 names to its array yields **exactly zero** coverage. **Superseded by
     `T7I-OD4-GRANT` in `scripts/tests/step-7i/static-scan.mjs`**, whose predicates live in the pure
     module `scripts/tests/step-7i/od4-grant-guard.mjs`: it reads **every `.sql` in
     `supabase/migrations`, including the migration being authored**, discovers the serializers
     rather than hard-coding them, and fails on a `GRANT` reaching any owner-only function from
     `PUBLIC`, `anon`, `authenticated`, `service_role` or `authenticator`. It is **anchor-pinned**
     (`EXPECTED_SERIALIZERS`), so it fails loudly rather than passing vacuously if the naming
     convention drifts — **re-pin that count in the same commit that adds a serializer (2 today, 4
     once M13 lands)**. Its firing proof is `scripts/tests/step-7i/prove-od4-grant-guard.mjs`, which
     imports the **shipped** predicates and is **run by `run-canonical.mjs`**, so it cannot rot as
     an orphan. **It was deliberately NOT bolted onto `ct-static.mjs`:** making a correction-tracking
     test responsible for global migration security would couple unrelated concerns and would leave
     the guard pinned to one historical file again.

     ⚠️ **Stated honestly, because two rounds of adversarial review were needed to reach this.** The
     first version was a keyword matcher and **nine bypasses passed it green** — among them
     `GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated` and
     `ALTER DEFAULT PRIVILEGES … GRANT EXECUTE ON FUNCTIONS TO authenticated`, the latter being the
     **mirror image of the corpus's own hardening statement** at `20260803034500_…:52-53`. Its
     firing proof could also not tell a working guard from one mutated to scan only the newest file.
     Both are fixed: `redact()` is now a **single-pass scanner** (sequenced regexes cannot handle
     interleaved comment/string/dollar-quote contexts — the attempt consumed **91%** of
     `20260805090500_…` because `--` prose in this corpus is full of apostrophes), the guard detects
     **blanket, default-privilege, dynamic-SQL and role-chaining** forms, the proof plants a
     violation **mid-corpus**, and a **missing-REVOKE** check covers the hazard no GRANT scan can
     see: a new `postgres`-owned function defaults to `PUBLIC EXECUTE`, so a serializer created
     without a REVOKE ships client-executable with **no GRANT statement anywhere to find**.
     **It remains a static text scan, not a SQL parser — a NECESSARY, not sufficient, control.**
     Role chaining is heuristic, only `supabase/migrations/*.sql` is in scope, and the runtime
     catalogue assertions in M13 and carriers 5–7 remain the authority on the live ACL.
     **Two of the eight hard-assert `IF v_n <> 4`** (`lifecycle-canonical.sql:428`,
     `verify-local-fixtures.sql:676`) — adding the two V2 serializers takes the set to 6 and both
     **fail loudly** unless re-pinned. ⚠️ A **fourth** spelling exists, `v_7h_zero_exec`
     (`20260806090000:679`, `20260806103000:408`, `20260807113000:348`) — it holds the **7H audit**
     set, not the serializer set, so it does **not** take V2; do not update it by mistake, and do
     not let its existence make a grep look conclusive. ~~**Update all eight and re-pin both arity
     assertions.**~~

     🔴 **CORRECTED 2026-08-09 under bounded Operator authorization — PLAN DEFECT PD-1. "Update all
     eight" was WRONG and must not be followed.** Carriers **1–4 live inside already-applied
     migrations** (`20260805090500_…:3053` · `20260806090000_…:675` · `20260806103000_…:404` ·
     `20260807113000_…:344`). **They are IMMUTABLE HISTORICAL INSTRUMENTS and must remain
     byte-identical.** Two independent reasons, both proved: (a) `CLAUDE.md` §12 forbids editing an
     applied migration, and `ct-static.mjs:166` / `c3-static.mjs:107` hard-fail with the literal
     message *"an applied migration must never be edited"*; (b) **it would break the fresh-apply
     proof** — `20260805090500_…:3125` loops `FOREACH v_name IN ARRAY (v_granted || v_zero_exec)`
     asserting each named function **EXISTS**, and on a fresh apply that block runs **before** M13
     creates the V2 serializers, so naming them there makes the migration fail. **Their inability to
     mention a future function is CORRECT, not a gap.** **Only carriers 5–7 — the reusable
     current-state test/fixture layer — are updated** (`lifecycle-canonical.sql` ·
     `verify-local-fixtures.sql` · `asm-suite.sql`), and both `<> 4` arity assertions are re-pinned
     to the evidenced current count. **Carrier 8 is NOT updated**: PD-2 below establishes that
     `ct-static.mjs:214` reads only one already-applied migration, so adding the V2 names there is
     **vacuous**, and its role passes to `T7I-OD4-GRANT`. **Never edit a historical migration assertion merely to make a
     count agree.**

     **The four assertion classes, which this clause previously conflated:**

     | Class | Where | Rule |
     |---|---|---|
     | **HISTORICAL MIGRATION-RESIDENT** | inside an applied migration | **Immutable point-in-time proof. NEVER updated for a future function.** |
     | **CURRENT REUSABLE** | `lifecycle-canonical.sql` · `verify-local-fixtures.sql` · `asm-suite.sql` (re-derive exact paths before editing) | Updated whenever the governed **current** catalogue changes |
     | **NEW-MIGRATION END ASSERTIONS** | the migration being authored | Proves the **current** catalogue immediately after that migration. **M13 must assert the complete current zero-client-EXECUTE set itself.** ⚠️ **Scope it explicitly — "the zero-EXECUTE set" is ambiguous and the carriers disagree.** M13 asserts the **Step 7I serializer/owner-only set, which becomes SIX**: `report_store_draft` · `app_parent_reaches_student` · `report_content_hash_v1` · `report_wording_hash_v1` · **`report_content_hash_v2`** · **`report_wording_hash_v2`**. That is **not** the same as "every function without `authenticated` EXECUTE" — measured live there are **9** such functions today (11 after M13), because the **7H audit set** (`audit_append_event`, `audit_verify_chain`, `audit_canonical_json`, `audit_block_mutation`, held by `v_7h_zero_exec`) and `assessment_save_observation` are also owner-only but belong to **different** governed sets. `asm-suite.sql:236-240` deliberately asserts **8** (7I + 7H). **Do not merge these sets.** |
     | **AUTHORING-TIME STATIC GRANT GUARD** | see PD-2 below | Must inspect the migration **actually being authored**, or the complete current corpus |
   - Function census (currently 34), and table/enum/policy counts wherever pinned.
5. Add end-of-migration catalogue assertions in the established style, and **never copy a stale
   deny-list forward**.
6. Regenerate `server/db/database.types.ts` and commit it with the migration.
7. Run `verify-fresh-apply.mjs` before the checkpoint commit.

**Migration order is fixed, and it is the EXECUTION order, not the task numbering:**

`OD-4 contract` (Phase 1) → `auth-adjacent DDL, if any` → `management bootstrap` →
`administration write layer` → `invitation lifecycle` → `attendance` → `evidence + storage` →
`hosted draft channel` → `report_source_map / session_logs, if ruled required`.

**One migration per task. No two tasks share a slot.** Filenames take their timestamp at creation;
this plan assigns no filenames. Where an older draft of this document used "M13…M17" labels, the
ordering above supersedes them.

### 6.6 Human and Operator dependencies

| Dependency | Blocks | Armed at |
|---|---|---|
| Plan authorization | Everything | Now |
| Usability participants | P9 | **P0** (longest lead) |
| Evidence sub-rulings (`scan_status`, retention, size limit, A-038 reconciliation, consent instrument) | P2 evidence tasks | P0 |
| Attendance control visual disposition (no ratified frame draws one) | P2-T02, P3 Track T | P0 |
| Notification-surface scope ruling (`notifications` is `DEFERRED_BY_RATIFIED_DECISION`) | P3-T04's two notification families | P0 |
| Audit-registry extension for evidence (requires an amendment) | P2 evidence audit | P0 |
| Grounding rule-4 rule set ratification | P1 close-out | P1 |
| Provider spend authorization | **P5, and again at P6-T07b, P7-T04, P8-T02, P8-T03, P9-T03, P10-T06, P10-T10** | Immediately before **each** — never inherited (G-16 … G-16h) |
| Supabase account + credentials + **region confirmation** (ADR-6 pins Singapore; confirming, not selecting) | P6 | Before P6 |
| Vercel account + project | P7 | Before P7 |
| GitHub Classroom invite URL + team number | P10 | Before P10 |
| Submission action | P10 close | P10 |

---

## 7. MULTI-AGENT EXECUTION POLICY, WORKTREES, AND AUTONOMY

### 7.1 Roles

| Actor | Mandate | May write? |
|---|---|---|
| **The Operator** | The human. Ratifies, accepts, authorizes, spends, deploys, submits | n/a |
| **Main Orchestrator** | The lead session. Integration owner. **The only writer on `main`** | Yes, on `main` |
| **Read-only subagents** | Analysis, audit, verification, adversarial review, census, evidence collection | **Never** |
| **Writer subagents** | Exactly one per fresh isolated worktree, disjoint path ownership, inside an authorized implementation phase | Yes, only inside their own worktree |

Subagents are **read-only everywhere, always**, with that one exception. Authorizing an
implementation phase does not by itself lift the read-only default. A Claude session may not
ratify and may not accept its own work. `Acceptance-gate evaluation` means evaluating and
reporting — never accepting.

**4–8 concurrent subagents** is a reasonable working range for decomposable work. Optimize for the
shortest *safe* time-to-completion, never for agent count.

### 7.2 Worktree strategy

**Prohibited absolutely:** `feat/48h-backend`, `feat/48h-frontend`, and their old physical
directories (already removed). They are `CLOSED_BY_NONUSE_POLICY`. Their corpora predate the Phase
A corrections and OD-4 and still describe the **superseded** report panels. Never take a contract,
status, precedence chain or panel model from a worktree copy. **Neither branch may be deleted** —
both are anchored by `frozen/*` tags.

**Every new worktree must:**

1. be created **fresh from the current accepted `main` integration baseline** (never from an older
   SHA, never from a frozen branch). For Phase 3 that baseline has a name and a definition —
   **`P3_ROLE_TRACK_BASELINE`**, see §7.3;
2. have **exactly one writer, ever**;
3. declare **disjoint file ownership in advance** — a cross-owned edit is a blocker reported
   *before* modification;
4. have its position in the **merge order pinned in advance**;
5. be merged only **after its track acceptance passes**;
6. have its **physical directory deleted after integration**, with the branch and commits preserved
   (tag first if the branch is fully merged, because removal lifts git's refusal to delete a
   checked-out branch);
7. keep its **path shallow** — see the `core.longpaths` prerequisite in §4.

**Worktrees are used only where they materially reduce elapsed time.** That is true for exactly one
window in this plan: **Phase 3's three role tracks.** Phases 0, 1, 2, 4–10 are single-writer on
`main`, because their work is either serial by nature (migrations, contracts, security) or gated
(hosted, deployment, submission). Creating a worktree for serial work adds risk and buys nothing.

### 7.3 Phase 3 track ownership (the only parallel window)

| Track | Branch | Owns | Governed packs |
|---|---|---|---|
| **P/A** | `feat/final-mvp-parent-auth` | `features/parent/**`, `features/auth/**`, `components/auth/**`, `app/(auth)/**`, `app/(portals)/parent/**` | 30–33, AUTH-01/02/03 |
| **T** | `feat/final-mvp-trainer` | `features/trainer/**`, `app/(portals)/trainer/**` | 01–10 |
| **M** | `feat/final-mvp-management` | `features/management/**`, `app/(portals)/management/**` | 11–27, 29 (28 out of scope) |

**Merge order: P/A → T → M.** Smallest surface first, largest last, so conflict resolution happens
against the most-settled baseline.

#### `P3_ROLE_TRACK_BASELINE` — the one SHA all three worktrees fork from

**Definition, not a literal:**

```
P3_ROLE_TRACK_BASELINE
  = the current accepted `main` HEAD AFTER BOTH
      P3-T00  (shared foundation)          — landed and passed its checks
    AND
      P3-T05a (Q-27 projection-layer data boundary) — landed and passed its checks
```

**Do not hard-code a SHA here.** It is not knowable when this plan is written; it is resolved at
P3-T01 by reading `git rev-parse HEAD` on `main` once both tasks are in and green, and it is
**recorded in `STATUS.md` at that moment** so a resuming session can verify the tracks actually
forked from it.

**All three worktrees fork from that same commit.** Not from P3-T00's commit — from the later one.
P3-T05a lands the structural exclusion of the nine ratings from every parent-reachable projection,
DTO, RPC result and client payload; if Track P/A forked before it, P3-T05 (the UI half) would be
unsatisfiable inside the track, because its remaining data dependencies live in `server/**` and in
frozen contracts the track may not write. **Forking early does not merely inconvenience the track —
it makes a mandatory Q-27 acceptance criterion unreachable without breaking the ownership model.**

*(This changes nothing about Q-27 itself. Q-27's ruling, its five acceptance criteria and its
`DO_NOT_IMPLEMENT` scope are untouched — only the point in the graph at which its data half lands
is stated precisely.)*

**OWNERSHIP IS CLOSED-WORLD: anything not listed as owned above is FROZEN.** There is no
unclaimed middle ground. A track may write only inside its own owned globs.

**Frozen — landed on `main` at or before `P3_ROLE_TRACK_BASELINE`, then untouchable for the
duration:**

```
components/layout/portal-navigation.ts     ← trainer/management/parent branches in ONE object
components/layout/portal-shell.tsx         ← all three portal shells exported from one module
app/globals.css · app/layout.tsx · app/page.tsx · app/favicon.ico
components/ui/** · components/brand/**
features/portal/** · features/dev-fixture/**
lib/frontend/contracts/** · lib/frontend/design/** · lib/frontend/physical-test-port.ts
lib/frontend/adapters/** · lib/frontend/fixtures/**
lib/schedule/** · lib/supabase/**
proxy.ts                                   ← see below
server/**                                  ← no UI track writes server code, ever
```

**Two files must be MOVED OUT of `features/trainer/**` at P3-T00, because they sit inside Track T's
owned glob while all three tracks import them — the exact cross-owned edit `CLAUDE.md` §14.3 condition 3
prohibits:**

| File | Real importers |
|---|---|
| `features/trainer/report-panel-config.ts` | **6** — `management-report-review`, `management-wording-editor` (Track M) · `parent-canonical-report` (Track P/A) · `trainer-draft-generation`, `trainer-report-editor`, `trainer-report-review` (Track T) |
| `features/trainer/resource-state.ts` | **15**, across all three tracks |

Relocate both to a shared location (e.g. `lib/frontend/report/` and `lib/frontend/state/`) at
P3-T00 and freeze them there. Without this, Track P/A merges first and must either ship stale OD-4
labels or edit a Track-T file.

**`proxy.ts` is frozen and load-bearing.** It is the Next 16 request-interception convention —
there is no `middleware.ts` and the two may never coexist — and it is **layer 1 of 2 of server-side
portal authorization**. It hardcodes all three tracks' prefixes and its route matcher. P3-T06 moves
six core-slice routes and P4-T07 asserts every guarded route is guarded at all four layers, so
`proxy.ts` must be updated **by the Main Orchestrator on `main`, in step with P3-T06** — never by a
track.

**`server/modules/integration-adapter/participant-actions.ts` is frozen** and is the single funnel
all three tracks' data flows pass through. Track T's attendance-mutator wiring (P3-T03) needs a
change there: that is a **named exception**, executed by the Main Orchestrator on `main` at the
same time as P2-T02's port contract, not by the track.

A track that needs a change in a frozen file **stops and reports it to the Main Orchestrator**,
which makes the change on `main` and rebases the tracks. It does not make the change itself.

The three AUTH packs share one route and one shell — they are **one work item**, not three.

### 7.4 Autonomy model

Once the Operator has authorized a specific phase, the following are **permitted autonomously**
within it:

- inspect the repository and re-derive live state;
- create fresh local worktrees per §7.2 where this plan calls for them;
- edit local application code, docs and tests;
- author migrations locally and apply them to the local stack;
- start/stop the local Supabase stack and run non-destructive local tests, builds, lint, `tsc`;
- run local browser-driven tests against a locally served app — **only under §7.4a**;
- make local commits at coherent checkpoints;
- merge accepted local tracks into `main`;
- update `STATUS.md` and append to `BUILD_NOTES.md`;
- launch read-only reviewer subagents;
- fix implementation defects that do not change governance.

**Stop for the Operator when reaching any of these — a Claude session never services its own
stop-and-ask.** ⚠️ **This table is a working subset. `CLAUDE.md` §12's full enumeration binds in
addition and is not reproduced here** — it includes, among many others: adding a ninth
`report_status`; returning a content hash to Parent or Management; extending the Step 7H audit
registry; granting client `EXECUTE` on `report_store_draft`, either hash serializer, or
`app_parent_reaches_student`; hand-editing generated types; a bare-word rating regex; creating a
table or enum `CLAUDE.md` §6.1 does not list; restoring `DEFAULT` on `report_version_approvals.approver_role`;
implementing Management Term Report (ID 28); and inventing a Figma frame for any U-25 family.
**Read `CLAUDE.md` §12 in full before any implementation phase.**

| # | Condition |
|---|---|
| 1 | A genuinely new product or governance choice, or anything requiring an amendment |
| 2 | Unexpected destructive cleanup, deletion, move, rename or archival of protected material |
| 3 | Production credentials of any kind |
| 4 | Hosted Supabase provisioning, linking, or any hosted action |
| 5 | Any paid or external AI-provider invocation. **No standing authorization to spend exists**; a prior G-6 authorization did **not** carry forward |
| 6 | The first public Vercel deployment, and any subsequent public deployment |
| 7 | Human participant recruitment, consent, or any testing with real people |
| 8 | Adding a git remote, or any push |
| 9 | Final submission |
| 10 | A Critical or High finding that invalidates this execution plan. **Finding one is not a licence to re-plan** |
| 11 | **Editing ratified authority at all** (`docs/spec/**`, the Authority Lock, an operator ruling, `CLAUDE.md`) — **including bounded annotate-never-delete**, which `CLAUDE.md` §12 says *"requires an explicit bounded operator instruction **for the run**"*. A plan-authoring instruction is not an execution-run instruction |
| 12 | Legal, privacy or PDPA ambiguity. ADR-6 synthetic-data-only is absolute — **the moment real child data is loaded, the deferral becomes a breach** |
| 13 | Re-attempting a failed destructive, billable, security-sensitive or production-facing operation |
| 14 | Start of a session where `STATUS.md`/`BUILD_NOTES.md` disagree with the repository — reconcile first |
| **15** | **Serving the application, running any browser-driven suite, or invoking `run-integration.mjs` WITHOUT §7.4a's S-1/S-2 proven for that run.** The real provider is constructed unconditionally, so an unguarded local serve is a **billable** surface — treat it exactly like a paid call |

**Do not stop** for ordinary implementation decisions already governed by current authority. A
blocked checkpoint reported honestly is a good outcome; a silently narrowed one is not.

### 7.4a MANDATORY SERVING DISCIPLINE — the control that makes Phases 0–4 non-billable

> **This is a binding precondition on every local task that serves the application or runs a
> browser-driven suite, and on every task that invokes `run-integration.mjs`. Without it, the
> "Phases 0–4 are local" claim is false and a standing authorization becomes a spend authorization.**

**Why it is needed.** `report-workflow/actions.ts` constructs the real provider unconditionally on
the participant path — by design, **Phase A gate G-19**: *"there is no switch to flip."* Fixture mode is a
*runtime* env read, and `tests/frontend/integrated-route-security.mjs` (which P4-T07 requires)
explicitly demands a build made **without** it. So the Phase 4 suite mandates a non-fixture served
build, and in that build a trainer draft click bills.

**S-1 — Neutralize the selectors in every served child process.** Before serving the app for any
local test, **overwrite** `LLM_PROVIDER`, `LLM_MODEL` and `LLM_API_KEY` in the child environment
with a proven-unratified literal, and **read them back to confirm**. Use the
`prove-disposable-app.mjs` pattern verbatim.
⚠️ **Never DELETE them — `@next/env` silently refills a deleted key from `.env.local`.** Deletion is
the exact mistake that produced the earlier billed run. Overwriting also means the Operator's real
key never enters the served process at all.

**S-2 — `run-integration.mjs` runs with the real-provider leg OFF, always, in Phases 0–4.** Its
opt-in is a **bare environment variable** (`BEST_COACH_RUN_REAL_PROVIDER_LEG=1`) or a flag — **no
TTY, no per-call confirmation, no phrase**. An exported variable surviving from an earlier G-6
session silently re-enables billing. **Assert the variable is unset before every invocation**;
treat its presence as a **halt**, not as an authorization. *A key is a capability, not an
authorization — and so is a stale env var.*

**S-3 — Arm an outward-call trip-wire wherever the harness supports one**, and record any refused
attempt as a finding rather than noise.

**S-4 — If a task cannot satisfy S-1/S-2, it is not a local task.** Stop and obtain **G-16**. Do not
proceed on the reasoning that the phase number is inside the authorized range.

**Acceptance for any Phase 0–4 task that serves the app:** the selector overwrite is proven by
read-back in the run record, and the run reports **zero** outward provider requests.

### 7.5 Commit policy

- Commit at **coherent checkpoints** — one contract, one module, one screen, one passing suite —
  not per trivial edit.
- Message form: `type(scope): summary`, citing spec section / amendment clause where relevant,
  e.g. `feat(report-workflow): OD-4 four-panel contract (OD-4 ruling, A-034)`.
- **Never** commit secrets, real participant data, or raw private AI content.
- **Never** `push`, add a remote, `reset`, `rebase`, `amend`, force, `stash`, `tag` (without
  authorization), `gc`, `prune`, or `checkout` another branch in a working tree holding work.
- **Never** rewrite accepted history. Forward `git revert` only.
- During a documentation/governance/analysis run, **do not commit** — leave the diff for review.
  During an authorized *implementation* phase, checkpoint commits are expected.
- **No push until explicitly authorized** (P10-T09).

**Checkpoint commit sequence across the plan:** baseline/status reconciliation → OD-4 contract
foundation → each backend migration + its module → shared UI foundation → each role track merge →
integration acceptance → deployment configuration → docs/submission.

### 7.6 `STANDING_LOCAL_EXECUTION_AUTHORIZATION` — continuing across local phase boundaries

> ⚠️ **THIS SECTION AUTHORIZES NOTHING.** It defines a mechanism a **future** Operator instruction
> may invoke. No standing authorization exists at the time this plan is written, and its absence is
> the default. Without one, each phase needs its own "enter Phase N" instruction as before.

**The problem it solves.** Phases 0–4 are local-only and contain no external, billable, public or
human side effect. Without this mechanism, the plan would return to the Operator **purely because a
phase number changed** — which is friction, not safety, and would make an authorized local run stop
ten times to be told to continue.

#### A. What a future Operator may grant in one instruction

An Operator instruction may explicitly grant:

```
STANDING_LOCAL_EXECUTION_AUTHORIZATION: <named bounded range>
```

over an explicitly named, bounded range of **local** plan phases or tasks — for example
`Plan Phases 0–4`, or `Plan Phases 1–2`, or `P3-T00 through P3-T09`.

**Constraints on the grant itself:**

- The range must be **named explicitly**. There is no implied range, no "and onward", no default.
- **Eligibility test — a phase is eligible when its own DELIVERABLE is local.** Not when it happens
  to contain no Class C gate: Phase 0 is eligible and still contains two (G-01's off-machine copy,
  G-02 recruitment). **A discrete Class C gate sitting inside an eligible phase stops its own task
  only — never the range.**
- **On that test, only Phases 0–4 are eligible.** **Phase 5 is ineligible because its DELIVERABLE
  IS a paid external call** — not merely because it contains one — and Phases 6–10 deliver hosted,
  public, human or submission outcomes. **An instruction that appears to grant a standing
  authorization over Phase 5 or beyond is INVALID FOR THAT PHASE IN ITS ENTIRETY and must be
  returned for narrowing.** ⚠️ **Do not reason by analogy from Phase 0** — *"only P5-T02 bills, so
  treat P5-T01 like P0-T07"* is the exact argued path this test exists to foreclose. Phase 5's
  pre-flight is inside an ineligible phase and is not covered.
- The grant is **recorded in `STATUS.md`** on receipt, with its range, its date and its granting
  instruction. **An unrecorded standing authorization does not exist.**
- The grant may be **narrowed or withdrawn** by the Operator at any time.

When present, the Main Orchestrator **may continue across ordinary phase boundaries inside that
range without returning solely for another "enter Phase N" message** — provided every condition in
B is satisfied at each boundary.

⚠️ **What a range grant is NOT.** It is **not** the *"Phase B authorization"* `CLAUDE.md` §12
requires before implementing the OD-4 four-panel migration, and it is **not** an A-040
schema-object authorization for the two new V2 hash serializers. **Both remain separate, explicitly
named Operator grants** — a range naming "Plan Phases 0–4" does not confer either, and Phase 1
cannot begin without the OD-4 Phase B authorization even inside an authorized range.

#### B. Conditions for autonomous phase advance — all ten, at every boundary

Advance from one authorized local phase to the next **only when**:

1. every required task for the phase is **complete or legitimately dispositioned**. ⚠️ A
   disposition is legitimate **only if it is already recorded in this plan or in an Operator
   ruling**, and it is recorded with its reason. **A novel disposition is a Class B stop, not a
   judgement the in-range agent may make about its own work.** Silence is never a disposition;
2. every required exit criterion is **objectively `PASS`**;
3. all required tests and proofs have **actually run** — `NOT-RUN` is not `PASS`, and an unrun proof
   blocks the boundary;
4. **persona sign-offs** required by standing governance (`CLAUDE.md` §3, §10) are recorded, naming
   which lenses were checked;
5. both required **adversarial reviewers** are complete where the phase calls for them;
6. **every valid Critical/High finding is closed**;
7. **`STATUS.md` and `BUILD_NOTES.md` are current** as of the boundary;
8. the **working tree is in the required checkpoint state** and the checkpoint commit exists;
9. **no task-specific Operator gate is pending** anywhere in the completed phase or at the entry of
   the next;
10. **no new governance, product or security decision is required** to proceed.

**This is conditional continuation on evidence. It is never Claude accepting its own work.** The
vocabulary distinction is absolute and unchanged:

| Term | Who sets it | Meaning |
|---|---|---|
| **`PASS`** | The Main Orchestrator | An **evidence-backed readiness result**. Sufficient to continue **inside** an authorized range. |
| **`Accepted`** | **The Operator only** | Formal acceptance. **Claude may never write, imply or fabricate an Operator acceptance record**, and a standing authorization does not create one. |

A standing authorization permits **continuation after `PASS`**. It does not convert `PASS` into
`Accepted`, and outstanding `Accepted` marks remain outstanding and are reported at the end of the
run.

**Reconciliation with the phase-exit rows — stated honestly.** Exactly **three** gates were
reclassified when this mechanism was introduced, and only these three:

- **G-07 (Phase 1 exit)** and **G-10 (Phase 2 exit)** — previously plain `YES`, now **Class A**.
  Both existed *solely* for routine local phase progression, which is the friction this mechanism
  exists to remove.
- **G-11 (worktree creation)** — previously plain `YES`, now **Class A**, and only because
  `CLAUDE.md` §12 already carries an explicit carve-out: *"`git worktree add` — including with
  `-b` — is permitted where `CLAUDE.md` §14.3 requires a new isolated worktree."* This plan requires exactly
  these three worktrees. **The carve-out covers creation only — deletion remains an Operator
  decision (P3-T07).**

**No other gate changed class, and no task-specific Operator DECISION or ACCEPTANCE was
reclassified.** G-13 (per-pack visual acceptance) and G-14 (C4 acceptance) were briefly drafted as
A/B hybrids and are **restored to Class B**: they are task-specific acceptances, they satisfy
condition 9's *"no task-specific Operator gate is pending"* only when granted, and `CLAUDE.md`
§15.11 — which outranks this plan — recognises **no hybrid gate**. See §10's classification.

#### C. Hard gates that NEVER inherit

⚠️ **THIS LIST IS NOT EXHAUSTIVE.** `CLAUDE.md` §12's full enumeration binds **in addition**, and
**nothing in §12 is inheritable by any standing authorization.** Read §12 in full before relying on
the table below. A standing local authorization **must not carry across, satisfy, imply or shorten**
any of these, and each remains an immediate stop:

| # | Never inherited |
|---|---|
| 1 | A genuinely new governance, product or security ruling |
| 2 | **Editing ratified authority — never inherited from a range grant, in any form.** The single permitted exception is `CLAUDE.md` §12's ratified **annotate-never-delete** method (strike · preserve inline · cite the ruling · date it), and even that **requires its own explicit bounded Operator instruction issued FOR THAT RUN, naming the exact files and the exact corrections** — as Phase A and OD-4 each received. A multi-phase range grant is **not** such an instruction. **`CLAUDE.md` itself is never editable under a standing authorization.** Any other edit method is prohibited outright |
| 3 | Destructive or protected-material operations not already separately authorized |
| 4 | Credentials of any kind |
| 5 | Hosted Supabase provisioning, linking, or **any** hosted action |
| 6 | **External or paid AI/provider invocation — per invocation, never inherited, not from a range, not from an earlier gate, not from a configured key.** ⚠️ Includes a **locally served build that has not satisfied §7.4a** |
| 6a | **Any action with a cost** — a paid tier, a paid resource, a paid SMTP or captcha plan, a domain registration, enabling any external service (`CLAUDE.md` §12). Not only AI spend |
| 7 | Public Vercel deployment |
| 8 | Human recruitment, consent or testing |
| 9 | External publication |
| 10 | Adding a git remote |
| 11 | Push |
| 12 | Final submission |
| 13 | Re-attempting a failed billable, hosted, destructive, **security-sensitive** or **production-facing** operation |
| 13a | **Legal, privacy or PDPA ambiguity.** ADR-6 synthetic-data-only is absolute |
| 13b | Any history-touching git operation — `reset`, `rebase`, `amend`, force, `stash`, `tag`, `gc`, `prune`, `checkout` in a tree holding work — and **`supabase db reset`**, ever |
| 14 | Any Critical/High finding that invalidates the plan itself |

**Hosted, public, human, push and submission authorizations are additionally non-inheritable across
session boundaries — unconditionally.** A grant obtained in one session is not in force in the next.

#### D. Resume behaviour under a standing authorization

At the start of **every** session, verify actual repository and environment state **first** (§9.3).
A standing local authorization may then be resumed **only if all four hold**:

1. its **authorized range is still recorded** in `STATUS.md`;
2. **actual state agrees with the continuity records** — any disagreement is reconciled before work;
3. the **current task lies inside that range**;
4. **no hard gate from C is pending**.

If any fails, the standing authorization is **not** in force for this session; report and ask.

**Never auto-resume** a `PAID`, `HOSTED`, `PUBLIC`, `HUMAN`, `PUSH` or `SUBMISSION` task, **or an
interrupted destructive one** — this list is stated here in full and is **not** narrowed by any
other section. The reasoning: an acceptance of `NOT-RUN` may mean the side effect **already
happened** without being recorded.

⚠️ **The carve-out keys off CAPABILITY, not off the recorded gate class.** A task whose steps can
reach an external host, a paid provider, a credential, or a filesystem-destructive command is
**non-auto-resumable regardless of its recorded Operator gate** — including tasks recorded
`Operator gate — NO`. Establish what actually happened externally, report it, and re-obtain the
gate.

#### E. Relationship to `CLAUDE.md`

`CLAUDE.md` §10's rule — *"do not start the next phase until the orchestrator has confirmed the
current phase's exit condition is met"* — governs the **ratified `CLAUDE.md` §10 phase model**, and
is unchanged. This mechanism operates on **this plan's own finer execution phases**, which §5.1
already establishes are a different numbering. `CLAUDE.md` **§15.11** records the mechanism in
standing governance so the two cannot drift apart.

---

## 8. PHASES AND TASKS

Task record fields: **Objective · Authority · Depends on · Files/systems · Owner · Steps ·
Negative controls · Acceptance · Tests/proofs · Commit · Rollback · Operator gate · Stop.**

Where a task's file list says *"re-derive"*, the enumeration in this plan is a starting hypothesis
from the 2026-08-08 analysis, not a contract — verify against the tree at execution time.

> ⚠️ **§7.4a BINDS EVERY TASK BELOW THAT SERVES THE APPLICATION, DRIVES A BROWSER, OR INVOKES
> `run-integration.mjs` — whether or not that task's record repeats it.** The real provider is
> constructed unconditionally on the participant path, so an unguarded local serve is a **billable**
> surface and §7.4 condition 15 makes it a stop. Prove S-1 (selector overwrite **with read-back**,
> never deletion) and S-2 (`BEST_COACH_RUN_REAL_PROVIDER_LEG` asserted unset) **in the run record**,
> and report **zero outward provider requests**. A task record that omits the citation has not
> waived the requirement.

---

### PHASE 0 — EXECUTION BASELINE / LOCK

**Nature:** verification, reconciliation, and arming the long-lead human gates. **No product work.
No migration. No application change.**

**PHASE 0 ENTRY** — Operator authorization of this plan (**G-00**), which may also carry a
`STANDING_LOCAL_EXECUTION_AUTHORIZATION` range (§7.6).
**Exit condition:** actual repository and environment state is known, recorded and reconciled; the
recovery procedure exists; long-lead Operator inputs are requested.

---

**P0-T01 — Baseline verification and execution lock**

- **Objective** — Establish that the repository is at the accepted starting state before any work.
- **Authority** — `CLAUDE.md` §15.3 (verify, never trust); E-1.
- **Depends on** — Plan authorization.
- **Files/systems** — Git only. No file modified.
- **Owner** — Main Orchestrator, `main`.
- **Steps** — 1) `git rev-parse HEAD`, `git status --porcelain -uall`, `git branch -a`,
  `git remote -v`, `git worktree list`, `git tag`. 2) Compare against §4, **reading its two
  baselines correctly** — `dff7a693…` is the **plan-authoring** baseline (a historical fact about
  when the plan was written) and `f53cae2…`, or the corrected descendant that supersedes it, is the
  **first committed-plan** baseline. **Execution always begins from ACTUAL current HEAD.** 3) If
  HEAD has advanced beyond the recorded committed-plan baseline, **do not assume drift is
  corruption** — read every intervening commit and record what it changed. 4) If the tree is dirty,
  classify every path before touching it; some historical dirty files carry ratified corrections
  and must never be blanket-restored.
- **Negative controls** — An unexpected remote, an unexpected worktree, or a HEAD that is **not a
  descendant of the recorded committed-plan baseline** each **halt** the phase. A dirty tree halts
  **unless every dirty path is classified and accounted for**. ⚠️ Do **not** expect
  `FINAL_MVP_EXECUTION_PLAN.md` to appear as an uncommitted change — **it is committed**; if it
  shows as modified or untracked at Phase 0, that is an unexplained divergence and a halt, not the
  expected state.
- **Acceptance** — Verified branch/HEAD/tree/remotes/worktrees/tags recorded verbatim.
- **Tests/proofs** — Command transcripts.
- **Commit** — None.
- **Rollback** — n/a.
- **Operator gate** — NO (but a failed control escalates).
- **Stop** — Any divergence from §4 that is not explained by a readable commit.

---

**P0-T02 — Local environment bring-up and live-catalogue re-derivation**

- **Objective** — Bring the local stack up and re-derive the database census **from the live
  catalogue**, because the Phase A2 audit was performed with the database down and every figure in
  it is statically derived from migration text.
- **Authority** — E-1; A2 audit §2 STATED LIMITATION; `STATUS.md` local-environment row.
- **Depends on** — P0-T01.
- **Files/systems** — Docker Desktop, Supabase CLI 2.109.1, Node ≥24 <25; no repository file.
- **Owner** — Main Orchestrator.
- **Steps** — 1) Start Docker and the local Supabase stack. 2) Confirm all 12 migrations applied.
  3) Query the live catalogue for: table/enum/function/policy/trigger counts; `report_status`
  members; **`report_store_draft`'s literal `proacl`** (recorded as `{postgres=X/postgres}` but
  never actually read); the `authenticated` EXECUTE census; `service_role`'s function count.
  4) Confirm `report_versions` and `report_version_ratings` row counts — the "empty" claim is a
  restated 2026-08-06 fixture-reload fact, **not re-queried since**, and Phase 1 depends on it.
  5) If seeding is needed, `npm run fixtures:local` — **this requires the Operator at a keyboard**:
  the loader accepts credentials only through an interactive no-echo prompt, never an env var, a
  file or a default. Request it rather than attempting it. 6) Record every figure.
- **Negative controls** — A census figure that disagrees with the static record is a **finding**,
  not a rounding error; record both and reconcile before Phase 1. If `report_versions` is
  **non-empty**, the OD-4 migration's risk profile changes materially — stop and report.
- **Acceptance** — Live census recorded; deltas against the static record enumerated.
- **Tests/proofs** — Catalogue query output; `verify-local-fixtures.sql`.
- **Commit** — None (findings go to `BUILD_NOTES.md` at P0-T05).
- **Rollback** — Stop the stack.
- **Operator gate** — NO.
- **Stop** — `report_versions` non-empty; or `report_store_draft`'s live ACL is anything other than
  owner-only.

---

**P0-T03 — Test-baseline re-establishment**

- **Objective** — Know which gates currently pass, before changing anything.
- **Authority** — E-2; `STATUS.md` regression row.
- **Depends on** — P0-T02.
- **Files/systems** — None modified.
- **Owner** — Main Orchestrator. **Serial (S5).**
- **Steps** — 1) `npx tsc --noEmit`, `npm run lint`, `npm run build`. 2) **Enumerate the whole test
  estate first and classify every file `INCLUDED` or `NOT-RUN + reason`** (E-12) — the historically
  cited "five portable static suites" is both incomplete and wrong in one entry:
  **portable and asserting**: `asm-static.mjs`, `c2-static.mjs`, `c3-static.mjs`,
  `step-7i/static-scan.mjs`, and **`correction-tracking/ct-static.mjs`** (identically portable and
  routinely omitted) · **also portable**: `run-runtime-profile.mjs` (the only suite with an npm
  `test:` alias), `census-provider-constructors.mjs`, `failure-safety.mjs`, `session-eligibility.mjs`,
  `post-login-destinations.mjs`, `portal-navigation-active-state.mjs` ·
  ⚠️ **`tests/frontend/app-route-census.mjs` is NOT a suite** — it is a helper module exporting
  `shippedRoutes()`/`shippedPortalRoutes()`/`concreteRoute()` for two other suites, with no
  top-level execution and no failing exit path. Running it exits 0 unconditionally, so recording it
  as a `PASS` is exactly the fail-open ledger row E-3 exists to prevent. Cite it as a *dependency*,
  never as a gate · **not previously enumerated anywhere**: `authentication-browser-smoke.mjs`,
  `prove-g17-chain-controls.mjs` (audit-chain controls), `prove-disposable-app.mjs` (**hosts gate
  G-22**), `prove-disposable-isolation.mjs`, `prove-disposable-identity-linkage.mjs`,
  `run-f17.mjs`, `run-f17-disposable.mjs`, plus `scripts/tests/integration/alias-loader.mjs`, the
  `@/` resolver **required to launch five of the suites named below**.
  3) With the stack up: `run-canonical.mjs`, `run-concurrency.mjs`, `verify-fresh-apply.mjs`,
  `run-assessment.mjs`, `run-c2.mjs`, `run-c3-bypass.mjs`, `run-correction-tracking.mjs`,
  `run-management-approved.mjs`, `run-integration.mjs` (default: real-provider leg **off**).
  4) With the app served **under §7.4a S-1/S-2, proven by read-back**:
  `integrated-route-security.mjs` — currently `NOT_RUN`.
  5) Record every result as `PASS`/`FAIL`/`NOT-RUN` with its exit code.
- **Negative controls** — Do **not** start a paid provider, a hosted service or an external call to
  make any suite green. `NOT-RUN` is an honest verdict.
- **Acceptance** — A complete baseline ledger. Any pre-existing `FAIL` is triaged before Phase 1.
- **Tests/proofs** — The ledger itself.
- **Commit** — None.
- **Rollback** — n/a.
- **Operator gate** — NO.
- **Stop** — A pre-existing `FAIL` that indicates the accepted baseline is not actually green.

---

**P0-T04 — Governance register reconciliation (documentation only)**

- **Objective** — Close the known-stale registers that would misdirect a fresh session, using
  annotate-never-delete.
- **Authority** — `CLAUDE.md` §15.7; E-10; Authority Lock §2.4.
- **Depends on** — P0-T01.
- **Files/systems** — `FINAL_MVP_AUTHORITY_LOCK.md` (§2.2, §29, §31.2a), `CLAUDE.md` (§1 precedence
  line, §9 repo comment), `UI_REFERENCE_FINAL_MVP/SCREEN_INDEX.md:~150`,
  `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` §7.3 cross-check, `docs/progress/STATUS.md`.
- **Owner** — Main Orchestrator, `main`. Designated log writer.
- **Steps** — 1) **Amendment count is stale by one**: three Lock sites and two `CLAUDE.md` sites
  still enumerate "Amendments 001–006" while Amendment 007 / A-056 is ratified and cited elsewhere
  in both files. Annotate each. 2) `SCREEN_INDEX.md` still asserts ID 05 has no implemented route;
  `app/(portals)/trainer/schedule/page.tsx` exists (ruling R-B1, checkpoint F-04). Strike and
  annotate. 3) `STATUS.md` internal contradictions: the Current-track row still names an already-
  completed "Next"; the worktree-removal ruling block still says removal was not performed while
  the Worktrees row records it executed. 4) Record that Lock §11's warning about `CLAUDE.md:180`
  is discharged by Phase A2 correction S-06.
- **Negative controls** — **Do not edit ratified amendment text.** Do not add inbound supersession
  banners to `Amendment_005.md` — that convention question is Operator-held and open. Do not delete
  any superseded text.
- **Acceptance** — No active register enumerates the amendment set incorrectly; no active document
  asserts a route gap that is closed.
- **Tests/proofs** — Diff review; `tsc`/`lint`/`build` unchanged (documentation-only).
- **Commit** — `docs(governance): reconcile stale registers before execution`.
- **Rollback** — `git revert`.
- **Operator gate** — **YES.** `CLAUDE.md` §12 permits annotate-never-delete only under *"an
  explicit bounded operator instruction **for the run**"*, and the instruction that authored this
  plan is not an instruction to execute it. Obtain a bounded instruction naming these files and
  these corrections.
- **Stop** — Any correction that would change meaning rather than record a supersession; or the
  absence of a bounded instruction for the run.

---

**P0-T05 — Continuity records reset to the execution model**

- **Objective** — Make `STATUS.md` describe Phase-B execution rather than the documentation era,
  and open the `BUILD_NOTES.md` execution log.
- **Authority** — `CLAUDE.md` §15.2, §15.4; A-008.
- **Depends on** — P0-T01…T04.
- **Files/systems** — `docs/progress/STATUS.md`, `docs/progress/BUILD_NOTES.md`.
- **Owner** — Main Orchestrator (sole log writer).
- **Steps** — 1) **Replace** the `STATUS.md` current-state block (never stack a new one above the
  old) with the §9 checkpoint schema. 2) Append a `BUILD_NOTES.md` entry in the established format.
  3) Record the live census from P0-T02 and the gate ledger from P0-T03.
- **Negative controls** — `BUILD_NOTES.md` is append-only and never rewritten. Never log a secret,
  a credential or real participant data. Never paste a subagent transcript.
- **Acceptance** — A fresh session reading `STATUS.md` alone knows the phase, HEAD, gates and next
  task.
- **Tests/proofs** — Read-back by a read-only reviewer instructed to find any claim not supported
  by the repository.
- **Commit** — folded into P0-T04's checkpoint or its own.
- **Rollback** — `git revert`.
- **Operator gate** — NO.
- **Stop** — n/a.

---

**P0-T06 — Recovery and rollback procedure**

- **Objective** — Guarantee every later phase can return to a known-good state.
- **Authority** — E-11; §11.
- **Depends on** — P0-T01.
- **Files/systems** — Git tags; the two existing off-machine snapshots.
- **Owner** — Main Orchestrator.
- **Steps** — 1) Request Operator authorization for **one** annotated baseline tag,
  `final-mvp/execution-baseline-<sha>`, at the plan-authorization HEAD. 2) Confirm the two
  preservation snapshots (OneDrive + `D:`) are current. 3) Record §11's per-track rollback table as
  the operative procedure. 4) Re-raise that **0 remotes still dominates every risk in this
  project** — 3+ GB of graded work exists as a single copy on one Windows disk.
- **Negative controls** — Tag creation is an Operator decision. Do not create it unasked.
- **Acceptance** — Baseline anchor exists (or its absence is recorded as an accepted risk); §11 is
  the agreed procedure.
- **Tests/proofs** — `git tag` output.
- **Commit** — None.
- **Rollback** — n/a.
- **Operator gate** — **YES** (tag creation; off-machine copy).
- **Stop** — Operator declines an anchor **and** declines an off-machine copy.

---

**P0-T07 — Arm the human-usability recruitment gate**

- **Objective** — Start the longest-lead item in the project on day one.
- **Authority** — Lock §26.5 (*"gated on nothing and is the longest-lead item in the entire
  project; it should start before any implementation work"*); Lock §26.1; brief §6/§8.
- **Depends on** — Plan authorization only.
- **Files/systems** — None. Recruitment and consent live **outside product code**.
- **Owner** — Operator (Claude prepares materials only).
- **Steps** — 1) Present the Operator with what Phase 9 will need and when. 2) Record that the
  brief requires *usability testing with real or representative users*, *observed behaviour not
  just opinions*, and **documented improvements made as a result** — so testing must land early
  enough for the improvement leg to be real. 3) Record explicitly that the brief specifies **no
  participant count, no consent process and no research protocol**; the plan must not invent one.
  4) Draft nothing that implies participants exist.
- **Negative controls** — **Never fabricate a participant, a session, a finding or a consent
  record.** Never relabel C1/C2/C3/C4/G-6, browser tests, integration tests or synthetic fixtures
  as human usability testing — this is absolute (Lock §26.4).
- **Acceptance** — The Operator holds a dated request naming what is needed and by when.
- **Tests/proofs** — n/a.
- **Commit** — None.
- **Rollback** — n/a.
- **Operator gate** — **YES**.
- **Stop** — n/a (the gate stays open until P9).

---

**P0-T08 — Open the external-input register**

- **Objective** — Convert unknown external facts into dated, tracked requests rather than vague
  blockers.
- **Authority** — Lock Appendix (operator-held facts); §14 of this plan.
- **Depends on** — Plan authorization.
- **Files/systems** — This document's §14 (External-Input Register), kept current.
- **Owner** — Main Orchestrator; answers are Operator-held.
- **Steps** — Present §14 in full and record which items block which phases.
- **Negative controls** — **Do not guess** a team number, a deadline, an invite URL or an account.
  Mark unknowns as unknown.
- **Acceptance** — Every row has a WHEN/WHY/BLOCKING answer or is explicitly still open.
- **Tests/proofs** — n/a.
- **Commit** — With P0-T04.
- **Rollback** — n/a.
- **Operator gate** — **YES** (answers).
- **Stop** — n/a.

---

**P0-T09 — Resolve the scoping contradictions that block Phase 2**

- **Objective** — Close three recorded contradictions that would otherwise be silently resolved by
  whoever implements first.
- **Authority** — Phase A §II.1 G-28 vs G-4/PA-OD-6; Lock §§656–657; Lock §8.2; Lock §7.
- **Depends on** — P0-T01.
- **Files/systems** — None (rulings only).
- **Owner** — Operator, on Claude's evidence.
- **Steps** — Present each with the evidence on both sides:
  1. **`report_source_map`** — ⚠️ **Part II of the reconciliation governs, and its G-28 classifies
     this `REQUIRED_FOR_FINAL_MVP … genuinely required and unbuilt`**, as does Lock §20.2. The
     contrary *"do not build"* reading comes from **G-4 and the withdrawn PA-OD-6, both in Part I,
     which the document's own banner marks HISTORICAL.** So the question put to the Operator is
     **not** "required or not" — it is **which checkpoint owns it and when**. Do not present the
     Part I reading as a live alternative.
  2. **`session_logs`** — classified `GENUINELY MISSING … the one true orphan`, with no owner named.
     Lock §20.2 already rules it non-blocking; confirm the owning checkpoint or an explicit deferral.
  3. **Attendance control visual disposition** — **no ratified frame in the 36 draws an attendance
     control.** Needs an explicit A-013 → A-022.4 disposition before Track T can build one.
  4. **Notification surfaces** — Lock §20.2 records `notifications` as
     `DEFERRED_BY_RATIFIED_DECISION`: *"no notification table, enum, RPC, audit action or delivery
     mechanism exists,"* and creating one is a `CLAUDE.md` §12 stop-and-ask. Two of the eight U-25 families
     (staff notification, parent notification) are notification surfaces. Rule whether they are in
     Final MVP scope; until ruled, **both are blocked** and P3-T04 must not build them.
- **Negative controls** — Building either table "just in case" is a schema change without
  authority. Inventing an attendance affordance from no frame is a `CLAUDE.md` §12 stop-and-ask. Creating any
  notification table, enum, RPC or audit action before a ruling is a `CLAUDE.md` §12 stop-and-ask.
- **Acceptance** — Four written dispositions.
- **Tests/proofs** — n/a.
- **Commit** — Recorded into the Authority Lock by the Operator's instruction, not by inference.
- **Rollback** — n/a.
- **Operator gate** — **YES**.
- **Stop** — Phase 2's corresponding tasks cannot start unresolved.

---

**P0-T10 — Evidence-media pre-rulings**

- **Objective** — Obtain the four open evidence sub-rulings and the audit-registry decision before
  any evidence code is designed.
- **Authority** — Phase A G-23; Lock §8, §8.2, §21; `CLAUDE.md` §12 (extending the Step 7H audit
  registry is a standing stop-and-ask).
- **Depends on** — P0-T01.
- **Files/systems** — None.
- **Owner** — Operator.
- **Steps** — Present for ruling: 1) `scan_status` vocabulary (**no ratified vocabulary exists
  anywhere**). 2) Retention period. 3) ~~The **500MB vs 50MiB** conflict (`config.toml` currently
  says `50MiB`).~~ ✅ **CLOSED — `C-16` ruled 100 MiB (`104857600`), 2026-08-11; corrected 2026-08-12
  under a bounded Operator instruction. ⚠️ The parenthetical was DOUBLY false by the end: the
  conflict was settled AND `config.toml`'s global now reads `100MiB`.** 4) A-038 reconciliation for Management evidence review. 5) **The `consent_records`
  instrument** — structurally mandatory the moment evidence media ships, because A-001 gate 2 means
  a written policy cannot gate a signed URL, and the table does not exist. 6) **Whether the Step 7H
  audit action registry may be extended for evidence — this requires an amendment.** 7) Whether
  Lock §8.2's three further upload surfaces (student photo — **PDPA-live, a child's identity
  photograph**; trainer photo; lesson materials) are in Final MVP scope; they are separate media
  classes requiring separate buckets and policies and **must not be folded into the evidence
  bucket**.
- **Negative controls** — Do not invent format, size or count limits. Do not extend the audit
  registry without an amendment. Do not build a consent surface that implies real data.
- **Acceptance** — Seven written dispositions, or an explicit deferral with its consequence stated.
- **Tests/proofs** — n/a.
- **Commit** — By Operator instruction.
- **Rollback** — n/a.
- **Operator gate** — **YES**.
- **Stop** — **P2-T03, T04 and T05 cannot start unresolved** (the evidence tasks). P2-T06, P2-T07,
  P2-T07a/b/c, P2-T09 and P2-T10 proceed without these rulings.

---

**PHASE 0 EXIT** — Baseline verified and recorded · live census re-derived · gate ledger
established · stale registers reconciled · `STATUS.md`/`BUILD_NOTES.md` current · recovery anchor
decided · recruitment gate armed · external register open · scoping and evidence rulings requested.
**Operator confirms exit before Phase 1 begins.**

---

### PHASE 1 — OD-4 CONTRACT FOUNDATION

**Nature:** the cross-cutting semantic change, serialized **before** any parallel UI work, so the
three role tracks consume one settled contract instead of inventing three.

**Why first:** `report_versions` is empty, which is the preferred point to migrate — *and this does
not reduce the regression obligation*. Any integration or UAT pass that creates report versions
before OD-4 lands makes an already-hard change harder. OD-4 also **reopens** the AI structured-
output, grounding, persistence, review, projection, **G-6** and **C4** contracts, so it cannot be a
late one-shot.

**PHASE 1 ENTRY** — Phase 0 exit; authorization to execute Phase 1 (explicit, or in-range under
§7.6). ⚠️ **Plus the OD-4 Phase B authorization `CLAUDE.md` §12 requires** — a range grant is not
that authorization (§7.6-A).
**Owner:** Main Orchestrator, single writer, on `main`. **No worktrees. No parallel writers.**

---

**P1-T01 — Re-derive the OD-4 change surface**

- **Objective** — Produce the authoritative, current list of every site carrying the superseded
  four-concept model.
- **Authority** — OD-4 ruling; Lock §15.1; A2 audit §6.1.
- **Depends on** — Phase 0 exit.
- **Files/systems** — Whole tree (read-only).
- **Owner** — Main Orchestrator + read-only census subagents.
- **Steps** — 1) Enumerate every occurrence of `todays_strength`/`todaysStrength`, `next_focus`/
  `nextFocus`, `practice_suggestion`/`practiceSuggestion`, `session_takeaway`/`sessionTakeaway`,
  and the English labels. 2) Classify each: SQL storage · SQL function signature · SQL function
  body · deny-list literal · generated type · TS contract · TS mapping · UI label · fixture prose ·
  test assertion · governance prose. 3) Separate **fail-closed** sites (which will break loudly)
  from **fail-open** sites (which will go silently vacuous). 4) **Do not trust the line numbers in
  the OD-4 ruling's frontend rows — several have drifted by 2–7 lines.** Re-derive.
- **Negative controls** — A site classified "governance prose" must not be edited; historical
  instruments are immutable.
- **Acceptance** — A complete classified inventory, larger-or-equal to the recorded ≈203
  occurrences across 17 application files plus 44 in generated types plus ≈227 across 16 test
  files. A materially *smaller* result means the census is wrong.
- **Tests/proofs** — The inventory, reproducible by command.
- **Commit** — None (feeds P1-T02+).
- **Rollback** — n/a.
- **Operator gate** — NO.
- **Stop** — Inventory materially smaller than the recorded surface.

---

**P1-T02 — Design migration M13: the OD-4 schema and report contract**

- **Objective** — Design, before writing, the complete DDL for the four-panel model.
- **Authority** — OD-4 ruling §§1–4; A-040 (bounded additive schema exception); Lock §15.1.
- **Depends on** — P1-T01; P0-T02 (`report_versions` confirmed empty).
- **Files/systems** — Design artefact only.
- **Owner** — Main Orchestrator.
- **Steps** — Specify: 1) `report_versions` column change to `overview`, `strengths`,
  `areas_for_development`, `remarks`. 2) Relaxation of `report_versions_content_hash_version_chk`
  from `= 1` to `IN (1, 2)` — **preserving the constraint name**, which is asserted by name at
  `20260805090500_…:3229` and re-checked by `verify-fresh-apply.mjs`. 3) **New parallel** `report_content_hash_v2` and
  `report_wording_hash_v2` — new domain-separation lines, new field-name array, `content_version`
  value `'2'`, identical envelope grammar (length-prefixed, LF-terminated, **no normalization,
  trimming or case folding**), identical hard-coded nine-dimension order, identical nine-non-NULL
  arity raise, `IMMUTABLE PARALLEL SAFE SECURITY INVOKER SET search_path = ''`, **zero client
  EXECUTE**. 4) Re-signature of every affected RPC: `report_store_draft`, `report_save_edit`,
  `report_management_edit_wording`, `report_get_canonical`, `report_get_working`,
  `report_get_management_review`, plus the re-hash call sites in `report_trainer_approve`,
  `report_management_approve_and_submit`, `report_reopen_submitted`. 5) Every version-creating
  INSERT writes `content_hash_version = 2`. 6) **Re-emission of every signature-qualified
  REVOKE/GRANT** for the **six** changed signatures — all six carry panel columns (four as IN
  parameters, three in `RETURNS TABLE`): **six REVOKEs, five GRANTs**, because `report_store_draft`
  is REVOKE-only and keeps zero client EXECUTE under R-27. 7) Addition of the two new serializers
  to ~~**all EIGHT** zero-EXECUTE assertion carriers enumerated at §6.5 item 4 — **not six; six is the
  new arity value, not the carrier count** — **and re-pinning both `<> 4` arity assertions to 6**.
  Missing the eighth (`ct-static.mjs:214`) ships V2 with **no authoring-time static-scan coverage**.~~
  🔴 **CORRECTED 2026-08-09 — PD-1/PD-2, see §6.5 item 4.** Add them to the **CURRENT REUSABLE**
  carriers **only** — carriers **5–8** — and re-pin both `<> 4` arity assertions to the evidenced
  current count. **Carriers 1–4 are inside applied migrations and MUST remain byte-identical**;
  naming a future function there breaks the fresh-apply proof. **M13 carries its own current-state
  zero-client-EXECUTE assertion**, which is where the post-M13 six-function set is proved.
  **Authoring-time grant coverage is `T7I-OD4-GRANT`** (`static-scan.mjs` +
  `od4-grant-guard.mjs`), which reads the whole corpus — **not** `ct-static.mjs:214`, which reads
  only one already-applied migration and never could have covered M13.
- **Negative controls** — **V1's body, `v_names` array, domain string, signature, ACL and COMMENT
  must not change.** V1 is preserved as historical semantics. **No historical-row backmigration is
  invented** — no production data requires one. `report_store_draft` keeps zero client EXECUTE
  (R-27) — granting it is a `CLAUDE.md` §12 stop-and-ask. The management wording allow-list stays **exactly
  four columns** — neither widened nor narrowed.
- **Acceptance** — A design an independent reviewer can check against the ruling clause by clause.
- **Tests/proofs** — Design review by a read-only adversarial reviewer.
- **Commit** — None.
- **Rollback** — n/a.
- **Operator gate** — ~~**YES.**~~ **✅ SATISFIED 2026-08-08 — G-05a RULED; see the gate register.** The ruling is the V2-parallel disposition below, and the three stale carriers named at the end of this paragraph (**OD-4 §5.1, Lock §15.1, `CLAUDE.md` §6/§12**) were **closed on 2026-08-08** as this paragraph directed. ~~⚠️ **OD-4 §5.1 (the content-hash envelope) is an OPEN Phase B
  ruling — its own words are "Recorded, not decided"** — and `CLAUDE.md` §12 makes it a
  stop-and-ask to *"redefine **or increment** the content-hash envelope without ruling §5.1."*
  Incrementing `content_hash_version` to 2 is exactly that. The nearest disposition is cleanup
  manifest **Q-6** (`DEFERRED_TO_PHASE_B_TECHNICAL_PROOF` — V2 semantics with the four OD-4 keys,
  `_v1` bodies preserved unchanged), which was **never propagated back into OD-4 §5.1, Lock §15.1
  or `CLAUDE.md` §12**. Present Q-6 for confirmation as the §5.1 ruling, and close the three stale
  carriers under P0-T04's bounded instruction.~~ *(Treated identically to P1-T09, which gates the
  other open sub-ruling from the same OD-4 §5 — **and P1-T09 / G-06 remains genuinely OPEN**.)*
- **Stop** — ~~No §5.1 ruling in hand;~~ **(the §5.1 ruling IS in hand — G-05a, 2026-08-08)** or any design element that would redefine V1 or grant a new
  EXECUTE. ~~⚠️ **Also stop on the G-05a premise break:** the ruling assumed no local V1 row survives; **one does** (blocker **B-P0-2**), and it must be treated as present and **never silently relabelled or mutated**.~~ *(✅ **DISCHARGED 2026-08-09.** The premise break is closed: the Operator resolved **B-P0-2** by authorizing a fresh local reconstruction (**D-0C**), which was executed, and **`report_versions` = 0** is now measured live — **no local V1 row survives**. This Stop condition no longer applies. G-05a item 7's protection for a future **real production** V1 row is untouched and remains binding.)*

---

**P1-T03 — Write and apply migration M13**

- **Objective** — Land the OD-4 contract in the database.
- **Authority** — P1-T02 design; §6.5 migration protocol.
- **Depends on** — P1-T02.
- **Files/systems** — new `supabase/migrations/<ts>_od4_report_contract.sql`; ~~**all eight**
  zero-EXECUTE assertion carriers~~ 🔴 **CORRECTED 2026-08-09 — PD-1. "All eight" was WRONG here
  too, and this is the highest-risk place it survived: an implementer scoping M13 reads
  Files/systems first, and it contradicted this same task's own Negative control three lines below
  (*"Do **not** edit a previously applied migration"*).** The correct scope is: **the CURRENT
  REUSABLE carriers 5–7 only** — `scripts/tests/step-7i/lifecycle-canonical.sql` (arity `<> 4` at
  `:428` → **6**) · `scripts/fixtures/verify-local-fixtures.sql` (arity `<> 4` at `:676` → **6**) ·
  `scripts/tests/assessment/asm-suite.sql` — **plus M13's own end-of-migration assertion**, which is
  where the post-M13 set is proved. **Carriers 1–4 are migration-resident and MUST remain
  byte-identical.** **Carrier 8 (`ct-static.mjs:214`) is NOT updated** — PD-2 established it reads
  only one already-applied migration, so adding V2 names there is vacuous; its role is taken by
  **`T7I-OD4-GRANT`**, and the `EXPECTED_SERIALIZERS` pin in `scripts/tests/step-7i/static-scan.mjs`
  must be re-pinned **2 → 4** in this same commit; and every pinned census array (§6.5 item 4); every pinned
  migration count (12 → 13).
- **Owner** — Main Orchestrator, sole migration writer.
- **Steps** — Per §6.5, all seven protocol items. Then apply locally and run
  `verify-fresh-apply.mjs`. 🔴 **ADDED 2026-08-09 — PD-1: §6.5 item 5 says only "add end-of-migration
  catalogue assertions in the established style", which is too generic to convey the requirement
  this task must satisfy.** M13 **must** carry its own end-of-migration assertion pinning the
  **post-M13 Step 7I owner-only set at SIX** (see §6.5 item 4's class table for the exact six and
  for why that is not the same as "every function without `authenticated` EXECUTE"). It **must**
  also pin the **V1 freeze** across all of `prosrc` (EOL-canonicalized per F-P0-3),
  `pg_get_function_identity_arguments`, `pg_get_function_result`, `proargnames`, `provolatile`,
  `proparallel`, `prosecdef`, `proconfig`, owner, literal `proacl` and
  `obj_description(oid,'pg_proc')` — a `prosrc` digest alone misses signature, ACL and COMMENT, and
  `verify-fresh-apply` is structurally blind to a V1 change because M13 runs on **both** sides of
  its comparison.
- **Negative controls** — Do **not** copy any deny-list forward unchanged (see P1-T04). Do **not**
  edit a previously applied migration. Carry the P-1 ownership guard.
- **Acceptance** — Migration applies from scratch; all end-of-migration catalogue assertions pass;
  census pins updated everywhere.
- **Tests/proofs** — `verify-fresh-apply.mjs`; `run-canonical.mjs`; `static-scan.mjs`.
- **Commit** — `feat(db): OD-4 four-panel report contract and V2 hash serializers`.
- **Rollback** — §11 R-1 (forward-fix migration; local reset only, never hosted).
- **Operator gate** — NO.
- **Stop** — Any assertion that cannot be made to pass without weakening it.

---

**P1-T04 — Re-derive the nine fail-open OD-4 guards and prove each one FIRES**

- **Objective** — Convert nine deny-lists from "green and vacuous" back into working detectors.
- **Authority** — Lock §15.1; cleanup manifest **Q-7** (*"Acceptance requires proving each negative
  control can FIRE"*); A2 audit §6.2 (**count corrected from five to nine after adversarial
  review** — `STATUS.md`'s "five" is superseded).
- **Depends on** — P1-T03.
- **Files/systems** — the nine sites, re-derived at execution time. The 2026-08-08 enumeration:
  `scripts/tests/step-7i/static-scan.mjs` (T7I-18 and T7I-R22, two sites) ·
  `scripts/tests/correction-tracking/ct-static.mjs` (T-CT-S3) ·
  `scripts/tests/correction-tracking/ct-suite.sql` (T-CT-13) ·
  `scripts/tests/management-approved/run-management-approved.mjs` (MA-8 — **emits an affirmatively
  false PASS**) · `20260806103000_management_correction_tracking.sql` (M6) ·
  `20260806190000_report_context_resolver.sql` (X5) ·
  `20260807113000_management_submitted_list.sql` (S6, and its `pg_proc.prosrc` regex S8).
  Four are inside already-applied migrations and must be **re-asserted in M13**, never edited in
  place.
- **Owner** — Main Orchestrator.
- **Steps** — 1) Update each deny-list. ⚠️ **Q-7 also requires "catalog-derived detection
  preferred" — prefer deriving the forbidden column set from the live catalogue over hard-coding
  literal names, because a literal list re-creates the identical fail-open on the *next* rename.**
  Where literals are retained, record the reason. 2) For **each of the nine**, construct a
  deliberate violation and demonstrate the control **raises**. 3) Record the firing proof per
  control. 4) Note the systemic sibling: `static-scan.mjs`'s `T7I-40` skips `elevated.ts` itself,
  so deleting that file makes the gate pass vacuously — **the pattern is systemic, not incidental
  to OD-4**; record it even if out of scope.
- **Negative controls** — **This task's whole point is the negative control.** A control that
  cannot be made to fire is a `FAIL`, not a pass. This exact failure mode already bit this project
  once, at the A-053 rename, where `POLARITY_BANDS[rating]` became `undefined` and the polarity
  rule was silently skipped while the suite reported green.
- **Acceptance** — **9 of 9 proven capable of firing**, each with its violation case recorded.
- **Tests/proofs** — Per-control firing transcripts, retained as evidence.
- **Commit** — `test(od4): re-derive nine fail-open guards with firing proofs`.
- **Rollback** — `git revert`.
- **Operator gate** — NO.
- **Stop** — Any control that cannot be demonstrated firing.

---

**P1-T05 — Anchor-existence controls: preserve fail-closed, add missing anchors**

- **Objective** — Keep the project's only reliable rename detectors, and stop a deleted file from
  producing a vacuous pass.
- **Authority** — Cleanup manifest **Q-26** (*"Negative controls must assert their anchor exists
  and fail closed. Never a vacuous PASS."*); Lock §15.1.
- **Depends on** — P1-T03.
- **Files/systems** — `scripts/tests/step-7i/lifecycle-canonical.sql` (T7I-39 exact result
  signature; T7I-51 exact parameter list) and the other exact-equality anchors.
- **Owner** — Main Orchestrator.
- **Steps** — 1) Update T7I-39's expected `report_get_canonical` result signature to the four OD-4
  panels + `submitted_at`, **keeping it exact-string equality**. 2) Update T7I-51's expected
  `report_management_edit_wording` parameter list, keeping exact equality — this is the
  machine-checkable form of the A-034 four-column allow-list and its arity check is what enforces
  it. 3) Add anchor-existence assertions so that a *missing* function, file or object fails closed
  rather than reporting zero matches.
- **Negative controls** — **Never soften an exact-equality anchor to a `LIKE` or substring form.**
  Doing so converts the detector into a tenth fail-open guard.
- **Acceptance** — Anchors updated, still exact, and each proven to fail when its anchor is absent.
- **Tests/proofs** — Deliberate-absence runs.
- **Commit** — With P1-T04.
- **Rollback** — `git revert`.
- **Operator gate** — NO.
- **Stop** — Any anchor weakened to make a suite green.

---

**P1-T06 — Regenerate database types**

- **Objective** — Bring generated types to the post-M13 catalogue, closing the pre-existing drift
  at the same time.
- **Authority** — A-053, `CLAUDE.md` §12 (hand-editing generated types is prohibited); A2 §11.6.
- **Depends on** — P1-T03.
- **Files/systems** — `server/db/database.types.ts`.
- **Owner** — Main Orchestrator.
- **Steps** — 1) Regenerate from the live local database. 2) Confirm the OD-4 shapes. 3) Confirm
  the **pre-existing drift** is closed: `report_list_management_submitted` was missing entirely
  while `management-view/projections.ts` already called it.
- **Negative controls** — **Never hand-edit.** If regeneration is impossible (Docker down), stop —
  do not patch.
- **Acceptance** — File is generator output; both OD-4 and the pre-existing gap are present.
- **Tests/proofs** — `npx tsc --noEmit`.
- **Commit** — With P1-T03 (§6.5 item 6).
- **Rollback** — §11 **R-4** (regenerate from the prior migration set; never hand-edit).
- **Operator gate** — NO.
- **Stop** — Regeneration unavailable.

---

**P1-T07 — TypeScript contract migration (types and mappings only, no visual work)**

- **Objective** — Move every server and shared contract to the OD-4 model so Phase 3 tracks have
  one settled type to consume.
- **Authority** — OD-4 ruling §3 (*"exactly one canonical report narrative model across all three
  roles"*).
- **Depends on** — P1-T06.
- **Files/systems** — `server/modules/report-workflow/{core,rpc-types,trainer-projections,
  context-resolver,projection-actions}.ts` · `server/modules/{management-view,parent-view}/
  projections.ts` · `server/modules/integration-adapter/adapter-dtos.ts` ·
  `server/modules/ai-drafting/trusted-store.ts` · `lib/frontend/contracts/physical-test.ts` ·
  `features/trainer/report-panel-config.ts` (**the sole source of the four English labels, consumed
  by three screens — the single highest-leverage file in this task**).
- **Owner** — Main Orchestrator.
- **Steps** — 1) Rename the contract types and their mappings. 2) Set the canonical English labels:
  **Overview · Strengths · Areas for Development · Remarks**. 3) Note that `trusted-store.ts`'s SQL
  GUCs are already positional (`bc.p1`…`bc.p4`), so only the TypeScript field names change — keep
  it that way. 4) Update the stale deviation comments in `trainer-report-review.tsx` and
  `management-report-review.tsx`, which still assert that *"'Overview' and 'Remarks' have no
  governed counterpart"* and *"recorded for operator adjudication"* — **that adjudication has been
  issued and went the other way**; one also uses *"Areas to Grow"*, which the ruling explicitly
  rules is **not** the canonical name.
- **Negative controls** — The label is **"Areas for Development"**, not "Areas to Grow". Three
  different panel-length ceilings currently coexist (`core.ts` 4000, schema 1200, runtime 1200) —
  record the discrepancy; do not silently unify it without deciding which is governed.
- **Acceptance** — `tsc` clean; no superseded identifier remains in application source.
- **Tests/proofs** — `npx tsc --noEmit`; `npm run lint`; `npm run build`; the P1-T01 inventory
  re-run returns zero application-source hits.
- **Commit** — `refactor(contracts): OD-4 panel model across server and shared contracts`.
- **Rollback** — `git revert`.
- **Operator gate** — NO.
- **Stop** — A contract change that would require a schema change not in M13.

---

**P1-T08 — AI schema, prompt and parser contract**

- **Objective** — Make the AI generate the four canonical outputs **directly**.
- **Authority** — OD-4 ruling §4: *"must generate the four canonical semantic outputs directly"* and
  *"must NOT generate the old four concepts internally and relabel them at the UI — a relabelling
  shim is expressly prohibited."*
- **Depends on** — P1-T07.
- **Files/systems** — `server/modules/ai-drafting/provider.ts` (`ReportPanels`, `PANEL_KEYS`,
  `RESPONSE_SCHEMA`, `SYSTEM_PROMPT`, `validatePanelShape`, `DeterministicFixtureDraftProvider`) ·
  `server/modules/ai-drafting/request-draft-core.ts` (pass-through).
- **Owner** — Main Orchestrator.
- **Steps** — 1) `PANEL_KEYS` and `RESPONSE_SCHEMA` to the four OD-4 keys; `strict: true` and
  `additionalProperties: false` preserved. 2) **Re-author `SYSTEM_PROMPT`.** It currently teaches
  *no* panel semantics at all — rule 6 says only *"Return ONLY the four requested fields"*, leaning
  entirely on key names. Under OD-4 the model must be told what each panel means: Overview may
  synthesize and is **not restricted to positive observations**; Strengths is positive demonstrated
  capability; Areas for Development names capabilities needing support; **Remarks is subject to
  grounding in full and is not a place for unsupported claims**. 3) Keep `validatePanelShape`'s
  exact key-count assertion at **4**. 4) Rewrite the fixture provider's four sentences — its prose
  currently *encodes the superseded semantics*, and relabelling it would bake the old model into
  every fixture run and every harness asserting against it. 5) Leave the request schema, timeout,
  bounded one-retry, redaction posture and outcome union unchanged.
- **Negative controls** — No relabelling shim, at any layer. No evidence media enters the prompt
  (the drafting path has zero evidence surface today — **actively preserve that**). AI still never
  rates, approves, submits or publishes.
- **Acceptance** — Schema, prompt, validator and fixture all express OD-4 natively.
- **Tests/proofs** — `census-provider-constructors.mjs`; `failure-safety.mjs`;
  `run-negative-controls.mjs`; `run-integration.mjs` with the real-provider leg **off**.
- **Commit** — `feat(ai): OD-4 native drafting contract`.
- **Rollback** — `git revert`.
- **Operator gate** — NO.
- **Stop** — Any design that keeps old concepts internally.

---

**P1-T09 — Grounding rule 4 re-derivation**

- **Objective** — Replace the one grounding rule that is hard-keyed to the single-positive-panel
  model, by **design** rather than rename.
- **Authority** — OD-4 ruling §5.2 (*"The correct new rule set is a design decision, not a rename …
  must be designed and proven with a deliberate contradiction case before it ships"*);
  `CLAUDE.md` §12 makes *retargeting rule 4 at `overview` by rename* an explicit stop-and-ask.
- **Depends on** — P1-T08.
- **Files/systems** — `server/modules/ai-drafting/grounding.ts`.
- **Owner** — Main Orchestrator (design), Operator (ratification).
- **Steps** — 1) Rules 1, 2, 3 and 5 iterate `PANEL_KEYS` and migrate mechanically — verify, do not
  assume. 2) Rule 4 currently reads one named property and forbids presenting a `needs_support`
  dimension as *the* strength. Under OD-4 that panel splits three ways: **Strengths** is where the
  rule belongs, essentially unchanged; **Overview** may legitimately carry developmental context,
  so retargeting there **false-rejects correctly-grounded drafts**; **Areas for Development** is
  *expected* to name non-positive dimensions and the rule must **not** extend there; **Remarks** is
  grounded in full but has no ruled polarity posture — an unruled gap to name. 3) Re-derive the
  "support framing" escape condition too: it is currently evaluated over the whole panel, and words
  like *develop*, *practice*, *building* are ordinary vocabulary inside a strengths narrative.
  4) Build a **deliberate contradiction case** and prove the new rule set rejects it and accepts
  the legitimate developmental-context case. 5) Fix or record the standing fail-open at rule 3:
  an unmapped rating yields `undefined` and the rule is **silently skipped** — the same shape as
  the A-053 incident.
- **Negative controls** — A rename is prohibited. A rule set that cannot demonstrate both a true
  rejection and a true acceptance is not proven.
- **Acceptance** — Ratified rule set; both proof cases pass; the fail-open at rule 3 closed or
  explicitly recorded.
- **Tests/proofs** — Contradiction-case suite; `run-integration.mjs` (**real-provider leg OFF**, per §7.4a S-2).
- **Commit** — `feat(ai): re-derived OD-4 grounding rules`.
- **Rollback** — `git revert`.
- **Operator gate** — **YES** — ratification of the rule set (design and proof may be built
  autonomously and presented).
- **Stop** — Operator has not ratified the rule set.

---

**P1-T09a — Additive fixture expansion (prerequisite for the grounding proof)**

- **Objective** — Grow the Step 7F fixture to the shape the grounding-contradiction and continuity
  proofs actually require.
- **Authority** — `CLAUDE.md` §11, verbatim: the broader shape — *"**2 trainers, 2 class modules,
  3–4 enrolled students per module, 2 parent accounts, and a second Class Session for
  previous-focus continuity**"* — is *"deferred, not deleted … **required as a later additive
  fixture expansion before the Phase 1 grounding-validation contradiction proof … and the
  session-to-session continuity proof can be demonstrated. Do not treat the Step 7F minimum as the
  final fixture.**"*
- **Depends on** — P1-T03.
- **Files/systems** — `scripts/fixtures/local_fixtures.sql`, `verify-local-fixtures.sql`,
  `scripts/fixtures/load-local-fixtures.mjs`.
- **Owner** — Main Orchestrator.
- **Steps** — Extend additively to the §11 shape. Re-pin the fixture census assertions **from a
  passing run**, never by guessing.
- **Negative controls** — **Additive only** — do not alter the ratified Step 7F minimum's existing
  rows. Synthetic data only (ADR-6). No plaintext password in any fixture artefact.
- **Acceptance** — The expanded fixture loads and verifies; **P1-T09's contradiction case and
  `CLAUDE.md` §10 Phase 1 exit condition (c) — *"a session's follow-up note appears as the next
  session's previous focus"* — are both demonstrable against it.**
- **Tests/proofs** — `verify-local-fixtures.sql`; the continuity demonstration.
- **Commit** — `test(fixtures): additive expansion for grounding and continuity proofs`.
- **Rollback** — `git revert`; reload the prior fixture.
- **Operator gate** — NO (the loader's credential prompt is Operator-driven, per P0-T02).
- **Stop** — Any non-additive change to the ratified minimum.

---

**P1-T10 — Fixture and test-estate migration**

- **Objective** — Move every fixture and harness to OD-4 without weakening a single assertion.
- **Authority** — E-3; §6.5 item 4.
- **Depends on** — P1-T04, T05, T08, T09.
- **Files/systems** — ≈16 test files / ≈227 occurrences, re-derived. Known: `lifecycle-canonical.sql`
  (~72 occurrences, including its own FAIL-message text) · `run-concurrency.mjs` ·
  `c2-suite.sql`, `ma-suite.sql`, `ct-suite.sql`, `g14-isolation-seed.sql` (the shared `whash`
  helper) · `fixture-lifecycle.assertions.ts` · `trainer-browser-smoke.mjs` ·
  `g6-harness/{failure-safety,run-negative-controls}.mjs` · `activate-g6.mjs` (G-6 comparators) ·
  `prove-governed-lifecycle.mjs` (C4) · `run-integration.mjs` ·
  `lib/frontend/fixtures/physical-test-fixture.ts` (**keys *and* prose encode the old model**).
- **Owner** — Main Orchestrator.
- **Steps** — 1) Migrate keys **and prose**. 2) Re-pin every count the new migration moves.
  3) Re-derive the canonical fixture SHA-256 pins **from a successful verifier run — never by
  guessing**. 4) Update `ct-static.mjs`'s migration byte-identity and file-count assertions.
- **Negative controls** — Never soften an assertion to make it pass. Never guess a pin.
- **Acceptance** — Full local suite green with every count and pin re-derived from evidence.
- **Tests/proofs** — The whole local suite (S5 serial).
- **Commit** — `test(od4): migrate fixture and proof estate to the four-panel model`.
- **Rollback** — `git revert`.
- **Operator gate** — NO.
- **Stop** — A pin that cannot be derived from a passing run.

---

**P1-T11 — Phase 1 acceptance**

- **Objective** — Prove the contract foundation before anything forks off it.
- **Authority** — E-2; `CLAUDE.md` §14.6 (two independent adversarial reviewers for high-risk
  phases).
- **Depends on** — P1-T01…T10.
- **Owner** — Main Orchestrator + two read-only adversarial reviewers.
- **Steps** — 1) `tsc` / `lint` / `build`. 2) Every local SQL suite + `verify-fresh-apply` +
  concurrency. 3) The nine firing proofs and the anchor-existence proofs re-run. 4) Two independent
  reviewers instructed to **falsify**: one on OD-4 semantic fidelity, one on control integrity and
  migration safety. 5) Remediate every valid Critical/High before `PASS`. 6) **Demonstrate
  `CLAUDE.md` §10 Phase 1's three exit conditions**: (a) a polarity-contradicting draft is rejected
  by the system; (b) an approved report's content is recoverable from its audit trail by hash;
  (c) **a session's follow-up note appears as the next session's previous focus** — (c) has no
  other owner in this plan and requires P1-T09a's fixture. 7) **Record the persona sign-offs**
  `CLAUDE.md` §3 requires before any phase-gate exit is declared met, naming which lenses were
  checked.
- **Negative controls** — A reviewer finding "no issues" on first pass is itself suspicious for a
  change this size; require the reviewers to state what they attempted and failed to break.
- **Acceptance** — All gates `PASS`; all three §10 Phase 1 exit conditions demonstrated; persona
  sign-offs recorded; both reviews closed; `STATUS.md` and `BUILD_NOTES.md` updated.
- **Tests/proofs** — Full ledger.
- **Commit** — `chore(checkpoint): OD-4 contract foundation PASS (Operator Accepted outstanding)`.
- **Rollback** — §11 R-2.
- **Operator gate** — **G-07 · CLASS A (local progression).** Requires an explicit Operator
  authorization to enter Phase 2 **unless** a `STANDING_LOCAL_EXECUTION_AUTHORIZATION` (§7.6) whose
  range covers Phase 2 is in force — in which case advance is permitted on meeting all ten §7.6-B
  conditions. **This never converts the phase's `PASS` into an Operator `Accepted`.**
- **Stop** — Any unresolved Critical/High.

---

**PHASE 1 EXIT** — One settled report contract exists end to end: schema, V2 hashes, RPCs, types,
AI schema and prompt, grounding, and a proof estate whose negative controls are **demonstrated
capable of firing**. **This is the precondition for any parallel UI work.**

---

### PHASE 2 — BACKEND GOVERNANCE COMPLETION

**Nature:** everything the governed product requires that has no implementation at all. Migrations
are **strictly serial**. Non-DDL work may proceed alongside the current migration where files are
disjoint.

**PHASE 2 ENTRY** — Phase 1 exit (G-07); authorization to execute Phase 2 (explicit, or in-range
under §7.6).

> **The P0-T09 and P0-T10 rulings gate their DEPENDENT TASKS, not phase entry** — P0-T09 items 1–2
> gate P2-T06, item 3 gates P2-T02, item 4 gates P3-T04; P0-T10 gates P2-T03…T05. Auth hardening
> (P2-T09), bootstrap (P2-T07) and the administration/invitation layers (P2-T07a/T07b) proceed
> without them, which is what §14 rows 14–17 already record.

> **⚠️ EXECUTION ORDER — this differs from the task numbering, and the order is load-bearing.**
> Task IDs are stable labels, not a sequence. Execute in this order:
>
> `P2-T09 (auth hardening) → P2-T07 (bootstrap) → P2-T08 (seed trap) → P2-T07a (administration
> write layer) → P2-T07b (invitation lifecycle) → P2-T07c (management read/statistics projections)
> → P2-T01/T02 (attendance) → P2-T03…T06 (evidence) → P2-T10 (draft transport) → P2-T11 → P2-T12 →
> P2-T13 → P2-T14`
>
> **Auth hardening comes first.** Lock §17.6 requires email confirmations enabled *"before any
> invitation/claim flow is designed"*, and A-027 makes the normalized email the acceptance-time
> proof — so with confirmations off, an attacker can pre-squat an address that a future claim flow
> will treat as proof of ownership. Bootstrap and the invitation lifecycle are both claim
> mechanisms. Designing either before confirmations are on inverts the control.
>
> **Migration slot order follows the execution order**, one migration in flight at a time, each
> taking the next free timestamp at creation: auth-adjacent DDL (if any) → bootstrap →
> administration + invitations → attendance → evidence + storage → draft channel. The earlier
> "M13…M17" labels in §6.5 are logical slots, not filenames, and **no two tasks may share a slot.**

---

**P2-T01 — Attendance write path**

- **Objective** — Give the Trainer a genuine governed write path to set Present/Absent.
- **Authority** — A-018 **ACTIVE**; Lock §7; Phase A **G-22** (*"FINAL RULING: REQUIRED"*);
  A-024 step 7.
- **Depends on** — Phase 1 exit.
- **Files/systems** — new migration; `server/modules/attendance/` (new); a server action;
  `lib/frontend/physical-test-port.ts`; `lib/frontend/adapters/real-participant-port.ts`.
- **Owner** — Main Orchestrator, sole migration writer.
- **Steps** — 1) A `SECURITY DEFINER` RPC with `SET search_path = ''` that: re-derives the caller's
  single active **trainer** membership; proves `app_trainer_reaches_session`; proves active
  enrolment; performs the upsert on `(class_session_id, student_id)`; populates
  `recorded_by_membership_id` and `recorded_by_role` (currently **never populated by anything**);
  and emits `attendance.changed` in the **same transaction**. 2) Server action + port mutator.
  3) Signature-qualified REVOKE/GRANT to `authenticated` only.
  4) ⚠️ **Verify that roster initialization actually happened — "Present by default" is delivered by
  P2-T07a, not here.** A *missing* attendance row **fails closed** (`BC015`: *"a missing row fails
  closed"*), and today the only attendance rows in existence come from
  `scripts/fixtures/local_fixtures.sql`. On hosted, where no fixture loader is permitted, an
  un-initialized roster leaves **every learner un-assessable until manually toggled** — the opposite
  of A-018's default. The toggle RPC cannot fix that, because the toggle is the manual action.
  Confirm P2-T07a's initialization on a fresh database before accepting this task.
- **Negative controls** — **Do not add a fourth attendance RLS policy** — assertions pin
  `('attendance', 3)` in at least **three** places (two migration-resident plus
  `scripts/fixtures/verify-local-fixtures.sql:334`), and the 29-policy census is a fourth knock-on.
  Route the write through the definer RPC. Management and Parent must be **denied**
  (`BC101`-class). An **absent** learner must remain unable to reach assessment or receive a
  report — the forward-transition attendance gate and `BC015`/`BC102` must still fire. A **missing**
  attendance row must continue to fail closed. A direct RPC call must not bypass authorization.
  **A-028: attendance for a submitted report cannot be changed to `Absent`** — prove that refusal.
  Populating `recorded_by_membership_id`/`recorded_by_role` breaks three standing NULL assertions
  (`local_fixtures.sql:489-490`, `verify-local-fixtures.sql:236`) — update them in step; the role
  is pinned to `'trainer'` by `attendance_recorded_by_role_pinned_chk`.
- **Acceptance** — On a **fresh** database every enrolled learner in an eligible session is
  `present` without manual action; Trainer can set Present and Absent; both emit exactly one audit
  event; the chain verifies; Management and Parent are denied at the database; absent-learner
  refusals hold; the submitted-report refusal fires.
- **Tests/proofs** — New attendance suite; `run-canonical.mjs`; `audit_verify_chain`; the
  absent-learner negative control from C4's N-1.
- **Commit** — `feat(attendance): governed trainer write path with audit (A-018)`.
- **Rollback** — §11 R-1.
- **Operator gate** — NO (the ruling exists; the **visual** disposition is P0-T09 item 3).
- **Stop** — Any design needing a fourth RLS policy or a client-side DML grant.

---

**P2-T02 — Attendance control surface (server-side contract only)**

- **Objective** — Define the port/action contract the Track T control will bind to, without
  inventing a visual.
- **Authority** — P0-T09 item 3 disposition; A-022.4.
- **Depends on** — P2-T01; P0-T09.
- **Files/systems** — `lib/frontend/contracts/physical-test.ts`; port; adapter.
- **Owner** — Main Orchestrator (contract) — the visual is Track T in Phase 3.
- **Steps** — Add the mutator to the port contract with its result union; leave rendering to
  Phase 3.
- **Negative controls** — **No attendance affordance is invented from no frame.** If P0-T09 item 3
  is unresolved, the contract still lands but the control does not.
- **Acceptance** — Contract compiles; a fixture-mode call round-trips.
- **Tests/proofs** — `tsc`; fixture contract assertions.
- **Commit** — With P2-T01.
- **Rollback** — `git revert`.
- **Operator gate** — Inherits P0-T09.
- **Stop** — Building UI before the disposition exists.

---

**P2-T03 — Evidence media data model**

- **Objective** — The table and audit surface for Trainer-owned assessment evidence.
- **Authority** — Lock §8; Phase A **G-23** (*"REQUIRED. Trainer uploads."*); P0-T10 rulings.
- **Depends on** — P2-T01; **P0-T10 items 1–6**.
- **Files/systems** — new migration; `server/modules/evidence/` (new).
- **Owner** — Main Orchestrator.
- **Steps** — 1) An evidence table associating each object with **learner + session + assessment**,
  with the uploader pinned to a trainer membership by composite FK in the established style.
  2) Whatever `scan_status`, retention and size the P0-T10 rulings set. 3) Audit emission **only if
  the registry extension was amended** — otherwise record the gap; the registry currently has 16
  ratified actions and extending it is a stop-and-ask.
- **Negative controls** — No parent-facing column, projection or join. Evidence must not become an
  AI input — the drafting path has **zero** evidence surface and that must be preserved actively.
  Do not extend the audit registry without an amendment. Do not fold Lock §8.2's other media
  classes into this table.
- **Acceptance** — Model applies; census pins updated; parent projections provably cannot reach it.
- **Tests/proofs** — `verify-fresh-apply`; a new evidence suite; a parent-projection negative test.
- **Commit** — `feat(evidence): governed evidence media model`.
- **Rollback** — §11 R-1.
- **Operator gate** — Inherits P0-T10.
- **Stop** — Missing rulings; or audit emission without an amendment.

---

**P2-T04 — Private Storage bucket and policies**

- **Objective** — A genuinely private bucket with governed access.
- **Authority** — Lock §8, §21 (public buckets prohibited; short-TTL server-minted signed URLs
  only).
- **Depends on** — P2-T03.
- **Files/systems** — storage policies; `supabase/config.toml` storage block (all bucket blocks are
  currently commented out).
- **Owner** — Main Orchestrator.
- **Steps** — 1) Define the private bucket and its policies so access is **authenticated and
  role/membership governed**. 2) Keep the local definition parameterized so Phase 6 applies the
  same posture hosted — **local readiness is not hosted readiness**. 3) Signed-URL minting is
  server-side only, short-TTL.
- **Negative controls** — Bucket is **never public**. No anonymous read. No client-minted URL. No
  service-role widening — `service_role` carries `BYPASSRLS` and holds EXECUTE on **zero** functions
  by standing rule; that must not change.
- **Acceptance** — Unauthenticated and wrong-role reads **fail**; the governed read succeeds.
- **Tests/proofs** — Storage negative-control matrix (the A-003 must-fail set).
- **Commit** — `feat(storage): private evidence bucket and governed policies`.
- **Rollback** — §11 **R-6**.
- **Operator gate** — NO locally; hosted application is P6.
- **Stop** — Any configuration that makes the bucket publicly readable.

---

**P2-T05 — Evidence upload / read / delete governance**

- **Objective** — The three governed operations, exactly as authorized and no wider.
- **Authority** — Lock §8; A-001 (~~**armed but unactivated**~~ ✅ **ACTIVATED 2026-08-11 by `D-5`; parent access is Part 1 `P1-5` under the 2026-08-12 `A-002` ruling**); A-003 (prohibited-path exit; the
  *permitted* leg for parent access is **stood down**).
- **Depends on** — P2-T04.
- **Files/systems** — evidence RPCs; `server/modules/evidence/`; server actions; port.
- **Owner** — Main Orchestrator.
- **Steps** — 1) Trainer upload/own. 2) Management **review-only** — read where necessary, never
  alter. 3) Delete governed by whatever the P0-T10 ruling authorized; if unruled, **do not build a
  delete path**. 4) Build the **A-003 must-fail matrix**: every prohibited path proven to fail
  closed.
- **Negative controls** — **Parent receives no internal evidence** — no DTO, no projection, no RPC
  result, no signed URL, no client payload. Management cannot alter. A membership-less identity is
  refused. Evidence never reaches the AI prompt.
- **Acceptance** — The permitted paths work; **every** prohibited path fails closed with evidence.
- **Tests/proofs** — A-003 matrix; parent-projection leak test at the **projection layer**, not the
  DOM. **A-004's Parent-UAT both-directions obligation** is set up here and discharged at P8-T04:
  its *refusal* leg is **not** evidence-conditional — drafts, internal notes, raw per-dimension
  ratings and AI draft history are absent from the parent view regardless of evidence scope.
- **Commit** — `feat(evidence): governed upload, review and access controls`.
- **Rollback** — §11 **R-6**.
- **Operator gate** — Inherits P0-T10.
- **Stop** — Any path that would give a Parent session evidence access.

---

**P2-T06 — `report_source_map` and `session_logs` disposition execution**

- **Objective** — Build, or record as ruled-out, per P0-T09.
- **Authority** — P0-T09 items 1–2.
- **Depends on** — P0-T09.
- **Owner** — Main Orchestrator.
- **Steps** — If ruled required, design and land in **its own migration slot** under §6.5 — never
  sharing a slot with P2-T03/T04, since §6.2 S1 permits one migration writer at a time and §6.5
  requires a fresh timestamp per migration. If ruled out, record the ruling in the Authority Lock
  by Operator instruction and close the contradiction.
- **Negative controls** — Do not build either speculatively.
- **Acceptance** — Either built and proven, or closed in writing.
- **Tests/proofs** — As applicable.
- **Commit** — As applicable.
- **Rollback** — §11 R-1.
- **Operator gate** — Inherits P0-T09.
- **Stop** — Unresolved.

---

**P2-T07 — Management bootstrap mechanism**

- **Objective** — Make a fresh hosted database enterable. This is *"the single hardest blocker;
  without it a fresh hosted database is permanently unusable, because a centre with no active
  management membership can publish no report."*
- **Authority** — Lock §5, §17.7; N-4 / CP-5; cleanup manifest **Q-5** (*"narrow,
  owner-controlled, fail-closed, idempotent, auditable. Migrations must never auto-grant
  membership."*).
- **Depends on** — **P2-T09 (auth hardening — confirmations must be on before any claim mechanism
  is designed)**; **serial** on migrations.
- **Files/systems** — new migration; possibly an owner-only admin channel; `supabase/config.toml`.
- **Owner** — Main Orchestrator.
- **Steps** — 1) Design an **owner/operator-controlled** channel that creates exactly one active
  management membership, **idempotently**, **fail-closed**, and **auditable** via
  `membership.bootstrap` (currently a reserved action string with **zero emitters**). 2) It must be
  **unreachable from any normal browser client**. 3) **Resolve the recorded rank-2 tension**
  between `CLAUDE.md:163`'s "with the service role" and A-030 / Lock §5.7's "never reachable by
  `authenticated` or `service_role`" — the two meet head-on here and Phase B must decide. Present
  the resolution rather than assuming one. 4) Credentials only via interactive no-echo prompt —
  **hosted provisioning can never be a pipeline step**.
- **Negative controls** — **A migration must never auto-grant a membership.** No plaintext password
  is stored, displayed, emailed or logged. `service_role` must not gain EXECUTE. The channel must
  not be a general-purpose membership-mutation RPC.
- **Acceptance** — On a fresh database, the Operator can create exactly one management membership;
  a second run is a no-op; the event is audited; no client can invoke it.
- **Tests/proofs** — Fresh-apply + bootstrap on a disposable stack; a negative test proving
  `authenticated` and `service_role` cannot reach it.
- **Commit** — `feat(identity): operator-controlled management bootstrap`.
- **Rollback** — §11 **R-1** (the migration) **and R-5** (this is an identity/security change — an
  auth rollback is never partial).
- **Operator gate** — **YES** — the `CLAUDE.md:163` vs §5.7 resolution is a governance choice.
- **Stop** — Any design reachable by a browser client or auto-granting on migrate.

---

**P2-T08 — Close the `seed.sql` trap (C-9)**

- **Objective** — Remove a latent auto-execution hazard before hosted provisioning.
- **Authority** — Phase A **C-9** (*"Ready — config change, needs authorization"*, still
  **unapplied**).
- **Depends on** — P2-T07 (the two interact).
- **Files/systems** — `supabase/config.toml` `[db.seed]`.
- **Owner** — Main Orchestrator.
- **Steps** — `[db.seed] enabled = true` with `sql_paths = ["./seed.sql"]` while `supabase/seed.sql`
  **does not exist** — and the fixture baseline records that absence as *deliberate*. Disable the
  block, or reconcile it with the bootstrap decision.
- **Negative controls** — **Do not create `supabase/seed.sql`.** Creating it is forbidden and the
  config would auto-execute it.
- **Acceptance** — No configuration path can auto-execute an unreviewed seed.
- **Tests/proofs** — Fresh-apply run.
- **Commit** — With P2-T07.
- **Rollback** — `git revert`.
- **Operator gate** — NO.
- **Stop** — n/a.

---

**P2-T07a — Governed management administration write layer**

- **Objective** — Build the A-019 / A-024 steps 2–6 administration write paths. **Without these,
  the product cannot create a centre's teaching data at all, and three later tasks are
  unsatisfiable.**
- **Authority** — A-019 (management administration scope); A-024 steps 2, 3, 4, 5, 6; Lock §17.8.
- **Depends on** — P2-T07 (a management membership must exist before management can administer).
- **Files/systems** — new migration(s); `server/modules/class-session/` and siblings (all
  **ABSENT** today); server actions; port; adapter.
- **Owner** — Main Orchestrator. **Serial** on migrations.
- **Why this exists** — Verified at source: **zero** `INSERT INTO` exists in any migration for
  `class_modules`, `class_sessions`, `students`, `enrolments`, `invitations`, `centre_memberships`,
  `accounts`, `parent_student_links` or `class_session_assignments`; **all 29 RLS policies are
  `FOR SELECT`** and there is **not one INSERT/UPDATE/DELETE policy in the entire schema**; and
  Lock §145 records *"the entire invitation lifecycle is unbuilt."* The only identity-creation path
  is the local fixture loader, which **structurally refuses to run outside the local stack** — and
  P8-T01 forbids using it against hosted. Without this task: **P6-T10 names an invitation path that
  does not exist · P8-T01 cannot create its UAT scenario by any permitted means · Track M (P3-T04)
  owns six creation/edit screens (20, 21, 22, 24, 26, 27) with no server contract and its first act
  would be a blocker report.**
- **Steps** — 1) `SECURITY DEFINER` RPCs, `SET search_path = ''`, one per governed administration
  action: create class module · create class session · create student · enrol / withdraw · assign /
  unassign trainer · link / unlink parent to student · create trainer and parent profiles.
  2) Each re-derives an **active management membership** and refuses otherwise. 3) Each emits its
  registered audit action — `admin.module_created`, `admin.session_created`,
  `admin.trainer_assigned`, `admin.student_created`, `admin.enrolment_changed`,
  `admin.parent_link_changed`, `admin.profile_created` — **all seven are already in the ratified
  16-action registry with zero emitters**, so no registry extension and no amendment is required.
  4) Signature-qualified REVOKE/GRANT to `authenticated` only.
  5) ⚠️ **Own the attendance roster initialization.** A-018's wording is *"when a valid class-session
  roster **is initialized**, each enrolled student is Present by default"* — so the natural trigger
  is **session creation and enrolment, which this task builds**, not the trainer's toggle. Initialize
  `present` rows over active enrolments idempotently (`ON CONFLICT DO NOTHING`) at those two points,
  and prove it on a fresh database. Without this, `BC015`'s *"a missing row fails closed"* makes
  every learner un-assessable until manually toggled — the opposite of default-Present. **P2-T01
  depends on this behaviour existing.** — the
  zero-client-DML posture (A-030) is absolute; every write goes through a definer RPC. Trainer and
  Parent must be refused on every one. No centre picker, no HQ tier, no second centre (A-015).
  No `classes` entity between hierarchy levels (A-016). The audit registry must **not** be
  extended — if an action seems to need a new string, stop and ask.
- **Acceptance** — Management can build a complete teaching scenario through governed paths alone;
  Trainer and Parent are refused on every RPC; every action audits exactly once and the chain
  verifies.
- **Tests/proofs** — A new administration suite; `audit_verify_chain`; role-refusal matrix; a
  membership-less refusal check on the new RPCs, **folded into P2-T12** (which runs later — do not
  cite it as already-passed evidence here).
- **Commit** — `feat(admin): governed management administration write layer (A-019, A-024 2-6)`.
- **Rollback** — §11 **R-1**.
- **Operator gate** — NO (A-019 is ratified); **YES** if any action appears to need a registry
  extension.
- **Stop** — Any design adding a DML policy, a DML grant, or a new audit action string.

---

**P2-T07b — Invitation lifecycle**

- **Objective** — Build the create / revoke / reissue / accept lifecycle that turns an invitation
  into an active membership.
- **Authority** — A-020 (identity ≠ profile; invitations; **no plaintext password stored,
  displayed or emailed**); A-027 (the normalized email is the acceptance-time proof); Lock §5,
  §17.8; A-024 steps 3 and 11.
- **Depends on** — **P2-T09 (confirmations MUST be on first)**; P2-T07a.
- **Files/systems** — new migration; `server/modules/identity-access/**`; server actions.
- **Owner** — Main Orchestrator. **Serial** on migrations and on §6.2 S4.
- **Steps** — 1) RPCs for invitation create, revoke, reissue and accept, over the existing
  `invitations` table — which already has **no token or secret column of any kind**, by design.
  2) Acceptance binds the authenticated identity's **confirmed** normalized email to the pending
  invitation and activates the membership. 3) Emit `invitation.created`, `invitation.revoked`,
  `invitation.reissued`, `membership.role_changed` — all four already registered with zero
  emitters. 4) Parent activation and parent-student linkage complete A-024 step 11.
- **Negative controls** — **Acceptance must require a confirmed email**, otherwise the pre-squat
  attack A-027 exposes is live. **No plaintext password is ever stored, displayed, emailed or
  logged.** No token column may be added to `invitations` without an amendment. A revoked or
  expired invitation must not be acceptable. An invitation must not self-elevate a role.
- **Acceptance** — A trainer and a parent can be invited, accept, and reach their own portal; every
  prohibited path fails closed; a pre-squatted unconfirmed address **cannot** accept.
- **Tests/proofs** — Invitation lifecycle suite including the pre-squat negative test; audit chain.
- **Commit** — `feat(identity): governed invitation lifecycle (A-020, A-027)`.
- **Rollback** — §11 **R-5** (this is an identity change — roll back whole, never partially).
- **Operator gate** — NO. **Stop** — Confirmations not yet enabled; or any plaintext credential.

---

**P2-T07c — Governed management read and statistics projections**

- **Objective** — Land **every management-facing read projection Track M needs but may not write**:
  the deterministic aggregation behind the two **mandated-but-undrawn** panels, **and** the
  administrative-read breadth packs 12, 14, 17, 18 and 20–27 depend on.
- **Authority** — `CLAUDE.md` §6 (Class Health Summary's literal exhaustive four-condition table;
  Management Insight's fixed three-slot template over a nine-row lookup; "Students Needing
  Follow-up"); A-019; A-024 step 12; A-038 (row-level status gating).
- **Depends on** — P2-T07a (the entities these aggregate over must be creatable).
- **Why this exists** — Same failure mode P2-T07a closed for the *write* screens, unclosed for the
  *read* ones. Verified at source: `server/modules/management-view/projections.ts` exports only
  report-workflow projections — queue rows, review DTOs, corrections, submitted lists. **Nothing
  statistical exists**, no Phase 1 or Phase 2 task creates it, and `server/**` is frozen to the
  tracks under §7.3's closed-world rule. Without this, **P3-T04's step 4 is unbuildable and Track
  M's first act on packs 13 and 16 is a blocker report.**
- **Files/systems** — `server/modules/management-view/projections.ts`; the management port surface.
- **Owner** — Main Orchestrator. Non-DDL, so it may run alongside the current migration.
- **Steps** — 0) ⚠️ **Land the management ADMINISTRATIVE-READ projections first.** P2-T07a builds
  the *write* RPCs (create/enrol/assign/link); **it builds no reads**, and
  `server/modules/management-view/projections.ts` today exports only report-workflow shapes. Track M
  therefore has no projection for the **management calendar** (pack 12 — A-019 explicitly requires
  *"see created sessions in the management calendar"*), class modules and sessions, lesson plans
  (14), students (17), student profile (18), or the read side of the creation/edit screens (20–27).
  Land them, centre-scoped, with **A-038's row-level status gating** applied to every per-student
  action row. **Without this, Track M stops on contact for eleven more packs — the same failure mode
  this task exists to close.** 1) **Class Health Summary** (pack 13): evaluate `CLAUDE.md` §6's four conditions **top
  to bottom, first match wins, exactly one result** — no fifth condition, no escalation tier for how
  long a report has been pending. 2) **Management Insight** (pack 16): the three slots — main
  follow-up area, most-improved dimension (with the *"Not enough session data yet"* fallback below
  two sessions), and the fixed per-dimension recommended-action lookup. 3) **"Students Needing
  Follow-up."** 4) Compute the **main follow-up area identically for both panels** — `CLAUDE.md` §6
  requires the same fact stated consistently and **never computed two different ways**. 5) Aggregate
  over **`submitted`** reports (both panels were corrected from "approved" at Step 7I1D-R2, because
  `approved` never commits and has an empty referent at aggregate level).
- **Negative controls** — **No LLM, ever, on either panel** — expanding them into AI-authored prose
  silently pulls the deferred Weekly Class Health Brief into scope. **No raw per-dimension rating
  reaches Management** (A-038 stands). No freeform generation. No sixth condition or tenth lookup
  row invented.
- **Acceptance** — Both panels computable from governed data; the shared follow-up-area fact
  provably identical across the two; **every Track M pack has a governed read projection it can
  consume from inside its own owned globs**; Trainer and Parent refused; no pre-trainer-approval
  content reachable by Management.
- **Tests/proofs** — Deterministic aggregation suite covering all four Class Health conditions and
  the fallback branch; role-refusal matrix.
- **Commit** — `feat(management): deterministic read and statistics projections`.
- **Rollback** — `git revert`.
- **Operator gate** — NO (`CLAUDE.md` §6 specifies both panels exhaustively). **YES** if either
  panel appears to need a condition, slot or lookup row §6 does not list.
- **Stop** — Any temptation to generate either panel's prose.

---

**P2-T09 — Auth and signup production hardening (local configuration)**

- **Objective** — Close the identity hazards **before** any claim/invitation flow is designed.
- **Authority** — Lock §17.6, §30.2; Phase A **G-24**; A-027 (the normalized email is the
  acceptance-time proof).
- **Depends on** — **Phase 1 exit. This is the FIRST task of Phase 2** — it must precede P2-T07,
  P2-T07a and P2-T07b, all of which are claim mechanisms.
- **Files/systems** — `supabase/config.toml` auth block; `server/modules/identity-access/**`.
- **Owner** — Main Orchestrator. **Serial (S4).**
- **Steps** — Address each, with the hosted value applied in Phase 6:
  1. `enable_signup = true` at two sites → **disable or hook-gate**.
  2. `enable_confirmations = false` → **enable confirmations**. This is the load-bearing one:
     *"anyone with the project URL and the publishable key can mint an auto-confirmed identity with
     an arbitrary, unverified email,"* and because A-027 makes that email the acceptance proof, an
     attacker can **pre-squat an address a future claim flow will treat as proof of ownership.
     This must be closed before the invitation flow is designed, not after.**
  3. Captcha — no `[auth.captcha]` block exists; decide a provider.
  4. `site_url = http://127.0.0.1:3000` vs `additional_redirect_urls = ["https://127.0.0.1:3000"]`
     — **loopback, and inconsistent in scheme**. Parameterize for hosted.
  5. `minimum_password_length = 6`, no complexity → raise.
  6. MFA disabled; no session timebox — decide and record.
  7. SMTP entirely commented out; local Inbucket only, 2 emails/hour — a real provider is required
     before confirmations or invitations can function hosted.
  8. `db.network_restrictions` allow-all `0.0.0.0/0` + `::/0` (currently inert behind
     `enabled = false`) and TLS off — both are local-only postures.
- **Negative controls** — **No plaintext password** is ever stored, displayed, emailed or logged.
  The `role` query parameter remains presentation-only and is never authority. Do not design the
  invitation claim flow before confirmations are on.
- **Acceptance** — Every item above is either changed or has a recorded decision with its reason.
- **Tests/proofs** — Local auth smoke; `run-runtime-profile.mjs`; a pre-squat negative test.
- **Commit** — `feat(auth): production identity hardening baseline`.
- **Rollback** — §11 **R-5**.
- **Operator gate** — **YES** for captcha provider and SMTP provider selection (external services).
- **Stop** — Designing a claim flow with confirmations off.

---

**P2-T10 — Hosted-compatible draft-storage transport**

- **Objective** — Replace the `docker exec` transport without weakening the R-27 boundary. This is
  the single biggest deployability blocker in the server layer.
- **Authority** — **PA-OD-9 / G-21 — RATIFIED**: *"a dedicated minimally-privileged login role over
  a direct pooled connection."* Lock §18.1–§18.5; R-27.
- **Depends on** — P2-T09 (auth/security serialized); Phase 1 (the AI contract is settled).
  The OD-4 rename and this transport replacement **must be sequenced, not merged**.
- **Files/systems** — new migration (definer wrapper + `bc_draft_channel` role); replacement store
  (~60 lines) alongside `server/modules/ai-drafting/trusted-store.ts`;
  `server/modules/report-workflow/actions.ts:~103` (which constructs `LocalTrustedDraftStore`
  **unconditionally on the live participant path**); **the second copy of the transport SQL inside
  `scripts/physical-test/prove-governed-lifecycle.mjs`, which must be updated in step**.
- **Owner** — Main Orchestrator. **Serial.**
- **Steps** — 1) Inspect the **live** `proacl` for `report_store_draft` first (P0-T02) — the
  recorded `{postgres=X/postgres}` was inferred, never read. 2) Create the postgres-owned
  `SECURITY DEFINER` wrapper and the dedicated login role.
  3) ⚠️ **The wrapper must RESOLVE AND MATCH the report's own trainer — not merely accept a
  server-supplied subject.** Lock §18.2 item 1a is explicit: the wrapper *"must resolve the
  report's **own** legitimate trainer (via `reports.class_session_id` → `class_session_assignments`,
  or `reports.observation_id` → its recorder) and **refuse unless the supplied `sub` matches**"* —
  which *"collapses the residual from 'as any trainer in any centre' to 'as the one trainer who
  already owns that report.'"* Passing the verified `auth.getUser()` subject is what the **current**
  transport already does, and Lock §18.2a states plainly that it is insufficient: *"whoever holds
  the credential chooses the subject — unless the wrapper verifies it, which §18.2.1a now
  requires."* **Do not accept the narrowed residual without implementing the narrowing.**
  4) Keep panel values **out of band from SQL text** — parameters, never concatenation.
  5) **Carry a `proacl`-text assertion in the 7H style.** Binding, because
  `GRANT bc_draft_channel TO authenticator` would be **undetectable by all three existing checks**:
  `authenticator` is `NOINHERIT` and all three use `has_function_privilege`. 6) The grant must be a
  **direct `GRANT`, never `ALTER DEFAULT PRIVILEGES`**. 7) Create the role **`NOBYPASSRLS`, with no
  table privileges of any kind**, holding EXECUTE on the wrapper and nothing else (Lock §18.2 item
  2) — assert both `rolbypassrls = false` and the empty table-privilege set. 8) Add a
  `child.on("error")` handler equivalent — the current store has none, so a missing binary degrades
  to an opaque `XXCHN`.
- **Negative controls** — **`report_store_draft` keeps zero client EXECUTE.** The replacement must
  **not** be "grant it to `service_role` and call it from the server". **`GRANT bc_draft_channel TO
  authenticated` is the catastrophic direction and is explicitly PROHIBITED** (Lock §18.5 break
  condition 2) — assert against it by name, alongside the `authenticator` direction.
  `authenticated` must still receive `42501` on `report_store_draft`. Grounding must remain
  unbypassable by any client role. The residual that remains after the §18.2.1a narrowing —
  grounding bypassable by *possession of the channel credential*, acting only as that report's own
  trainer — is **a stated, accepted residual, not a gate failure**; record it, do not paper over it.
- **Acceptance** — A draft stores through the new channel locally; `report_store_draft`'s ACL is
  literally unchanged; the `proacl`-text assertion passes **and fires on a planted grant in both
  the `authenticator` and `authenticated` directions**; a **planted subject mismatch is refused**;
  the role is provably `NOBYPASSRLS` with zero table privileges.
- **Tests/proofs** — `run-canonical.mjs` (T7I-4 still gives `42501`); the new `proacl` assertion
  with a planted-violation firing proof; `run-integration.mjs` (**real-provider leg OFF**, §7.4a S-2).
- **Commit** — `feat(ai): hosted-compatible governed draft transport (PA-OD-9)`.
- **Rollback** — §11 **R-7**.
- **Operator gate** — NO locally; the hosted credential is P6.
- **Stop** — Any design granting client EXECUTE, or one whose ACL assertion cannot be shown firing.

---

**P2-T11 — Server-action exposure proof**

- **Objective** — Know the real POST-addressable surface **before** deleting or extracting any
  export.
- **Authority** — Cleanup manifest **Q-8** (*"Phase B must prove actual Next 16 server-reference
  exposure before deciding"*); **B4-01**.
- **Depends on** — Phase 1 (contracts settled).
- **Files/systems** — `server/modules/report-workflow/{actions,projection-actions}.ts`;
  `server/modules/identity-access/actions.ts`; the build's server-reference manifest.
- **Owner** — Main Orchestrator.
- **Steps** — 1) Prove from build output which exports actually become action IDs. The hypothesis:
  `report-workflow/actions.ts` **is** imported (for `requestDraft`), so all 9 of its exports —
  including `managementApproveAndSubmit`, the sole publication transition — become addressable,
  plus 3 unconsumed exports in `identity-access/actions.ts`; **11 emitted-but-unconsumed
  endpoints**. `projection-actions.ts` has **zero importers**, so it emits nothing — 10 dead
  exports, not exposed surface. 2) Decide per module: extract, delete, or retain with a recorded
  rationale. 3) Note the mitigation that already holds — each is a thin wrapper over a
  `SECURITY DEFINER` RPC that re-derives authority from `auth.uid()`, so **reachability is not
  escalation**; and note the gap that does not — `adapterManagementEditWording`,
  `adapterManagementReturnToTrainer` and `adapterManagementApproveAndSubmit` run **without any
  `requireRole`**, leaving the database RPC as the sole authorization layer for those paths.
- **Negative controls** — **Do not delete an export before the exposure proof exists.** Extracting
  `requestDraft` would break the provider-constructor allow-list census — update it in step.
- **Acceptance** — A proven surface list and a recorded decision per module.
- **Tests/proofs** — Build-manifest inspection; `census-provider-constructors.mjs`;
  `integrated-route-security.mjs`.
- **Commit** — `refactor(server): reconcile server-action exposure surface`.
- **Rollback** — `git revert`.
- **Operator gate** — NO.
- **Stop** — Deletion proposed without proof.

---

**P2-T12 — Membership-less RPC sweep**

- **Objective** — Close a named pre-hosted-go-live gap.
- **Authority** — Lock §27 / Appendix: *"A sweep of all 25 RPCs by a brand-new, membership-less
  self-signup identity has not been executed. It should be, before hosted go-live."*
- **Depends on** — P2-T09, P2-T10.
- **Owner** — Main Orchestrator.
- **Steps** — Create a fresh identity with **no membership** and call **every** `authenticated`-
  granted RPC (25 today; more after Phase 2). Record each result and its SQLSTATE. **Split the
  expected behaviour into two classes — they are not the same and conflating them manufactures
  false Criticals:**
  - **19 governed RPCs must RAISE** (permission or governance error).
  - **6 authorization helper predicates** — `app_current_account_id`,
    `app_has_active_membership`, `app_is_own_membership`, `app_is_own_active_membership`,
    `app_trainer_reaches_session`, `app_trainer_reaches_module` — are RLS predicates whose
    *correct* membership-less behaviour is to return `false`/`NULL` **without raising** (Lock §5.2).
    For these the control is: returns falsey **and exposes no oracle** (no distinguishable message,
    timing or error that reveals whether a target exists).
- **Negative controls** — A governed RPC that answers is a **Critical**. A helper that raises, or
  that discloses existence, is also a finding.
- **Depends on** — **every Phase 2 task that adds an RPC** — P2-T07, P2-T07a, P2-T07b, P2-T01,
  P2-T03…T05, P2-T10. This task executes **last but one** in the Phase 2 order for that reason.
- **Acceptance** — **Every governed RPC in the FINAL Phase 2 grant set raises** — 19 as of the
  pre-Phase-2 baseline, and materially more after P2-T07a/T07b; **re-derive the count from the live
  catalogue at execution time rather than passing at 19.** The 6 helper predicates return falsey
  with no oracle. All enumerated.
- **Tests/proofs** — Sweep transcript retained as evidence.
- **Commit** — `test(security): membership-less RPC refusal sweep`.
- **Rollback** — n/a.
- **Operator gate** — NO.
- **Stop** — Any RPC that answers.

---

**P2-T13 — Migration ownership-guard remediation**

- **Objective** — Prove the ownership posture for the two migrations lacking the P-1 guard.
- **Authority** — Phase A §6 item 3 (*"Only 10 of 12 migrations carry the guard"* —
  `20260803034500` and `20260806160000` have none).
- **Depends on** — the final migration in Phase 2 having landed.
- **Owner** — Main Orchestrator.
- **Steps** — Prove the posture for those two **without editing applied migrations**; hosted
  application is forward-only and one-shot on a fresh project, so the proof must be an assertion,
  not a retrofit.
- **Negative controls** — Never edit an applied migration.
- **Acceptance** — Ownership posture proven for **all** migrations.
- **Tests/proofs** — `verify-fresh-apply`; catalogue ownership assertion.
- **Commit** — With the Phase 2 checkpoint.
- **Rollback** — `git revert`.
- **Operator gate** — NO.
- **Stop** — n/a.

---

**P2-T14 — Phase 2 acceptance**

- **Objective** — Prove the backend is governed-complete before the UI forks.
- **Depends on** — P2-T01…T13, **explicitly including the lettered tasks P2-T07a, P2-T07b and
  P2-T07c** — a numeric range does not name them.
- **Owner** — Main Orchestrator + two read-only adversarial reviewers (security; migration safety).
- **Steps** — Full local suite; the new attendance, evidence, storage, bootstrap, administration,
  invitation and transport proofs; every negative-control matrix; `audit_verify_chain` complete +
  head-checked; two falsification reviews; remediate all valid Critical/High; **record the persona
  sign-offs `CLAUDE.md` §3 requires before any phase-gate exit is declared met**.
- **Acceptance** — All `PASS`; persona sign-offs recorded; reviews closed; continuity records
  updated.
- **Commit** — `chore(checkpoint): backend governance completion PASS (Operator Accepted outstanding)`.
- **Rollback** — §11 R-2.
- **Operator gate** — **G-10 · CLASS A (local progression).** Same rule as G-07: satisfiable
  in-range under §7.6 on all ten conditions; otherwise an explicit Phase 3 authorization is
  required. `Accepted` remains Operator-only.
- **Stop** — Any unresolved Critical/High.

---

**PHASE 2 EXIT** — Signup/confirmation hardened **first** · a fresh database is enterable · the
governed administration and invitation write layers exist (A-024 steps 2–6 and 11) · **every
management read projection exists, including the two mandated-but-undrawn panels (Class Health
Summary, Management Insight) and the administrative reads packs 12/14/17/18/20–27 need** · attendance
initializes Present-by-default, writes and audits · evidence media exists with private storage and
a proven must-fail matrix · the draft transport is hosted-capable with R-27 literally intact and
the §18.2.1a subject match enforced · the server-action surface is known · membership-less
identities are refused everywhere.

---
### PHASE 3 — FINAL FRONTEND RECONSTRUCTION

**Nature:** the only phase with parallel writers. **Current state is 5 packs complete, 6 complete
at a non-canonical route, 5 partial, 20 absent** — 20 of 33 portal screens have no implementation
at all, and **no screen is marked visually aligned**.

**PHASE 3 ENTRY** — three conditions, none of which is a Phase 3 task:

1. **Phase 2 exit satisfied** (G-10);
2. **authorization to execute Phase 3 satisfied** under the execution-authorization model —
   either a phase-specific Operator authorization, or a **standing local execution authorization
   (§7.6)** whose named range covers Phase 3 and whose advance conditions are all met;
3. **no unresolved blocking gate** — in particular P0-T09 item 3 (attendance control disposition)
   and item 4 (notification-surface scope) for the tracks that depend on them.

> ⚠️ **P3-T00 is NOT an entry condition — it is the first task inside this phase.** Requiring it to
> enter the phase that contains it would be circular. **P3-T00 (and P3-T05a) are prerequisites to
> the ROLE-TRACK FORK at P3-T01, not to entering Phase 3.**

**Intra-phase order is serial → parallel → serial:**
`P3-T00 → P3-T05a → P3-T01 (fork) → Tracks P/A · T · M → **P3-T07 (merge)** → **P3-T06 (route
canonicalization + `proxy.ts`, on merged `main`)** → P3-T08 → P3-T09`.

> ⚠️ **P3-T07 precedes P3-T06**, despite the numbering. P3-T06 rewrites `app/(portals)/**` — the
> tracks' owned globs — on `main`; before the merge those reconstructed route files exist only on
> the track branches, so the moves cannot be made and its acceptance cannot be evaluated. The
> Phase 3 exit paragraph already reads merge-first.

> ### ⚠️ PHASE 3 SHARED PRECONDITION — binding on ALL THREE tracks
>
> **1. The recorded governance-conflict register applies to every track, not just Management.**
> **19 of the 36 governed packs carry a `GOVERNANCE CONFLICTS RECORDED` block** — items the
> reference frame draws that governance forbids. They are **pre-identified do-not-build items**,
> and their absence is `EXPECTED`, never a regression. They are **not** confined to Management:
> `01`, `04`, `08`, `09` are **Track T**; `30`, `31`, `33` are **Track P/A**; the remaining twelve
> are Management packs — **of which pack `28` is out of MVP scope and owned by no track**, so Track
> M reads eleven. Before writing a line, each track reads the `implementation-notes.md` of every
> pack it owns.
>
> **2. Every track carries the Lock §15 parent/role leak table for its own packs**, which is a
> *separate* register from the per-pack GC blocks and is in places **wider than them**. Two rows
> that no pack block covers, both Track P/A:
> - **`Parent - Calendar.md:13`** — Lock §15 calls it *"the **worst single line** — a rating **plus
>   a trainer observation** on a parent surface, which also breaches the no-internal-notes rule."*
>   Pack 31's GC-2 block covers ratings, pills, chips, counters and the legend — **not** the
>   trainer observation.
> - **`Parent - Calendar.md:23`**, of which Lock §15 warns *"a remediation pass working only from
>   `:13` would leave it standing."*
>
> **3. `Parent - Dashboard.md:20`'s Profile Details carries two further defects** that Q-27 does
> **not** resolve and that no pack block records — see P3-T05.
>
> **4. Notification surfaces are BLOCKED** until P0-T09 item 4 is ruled (Lock §20.2:
> `notifications` is `DEFERRED_BY_RATIFIED_DECISION`; no table, enum, RPC, audit action or delivery
> mechanism exists, and creating one is a `CLAUDE.md` §12 stop-and-ask).

---

**P3-T00 — Shared foundation checkpoint (serial, on `main`, before any fork)**

- **Objective** — Land every file the three tracks would otherwise collide on, so the fork is safe.
- **Authority** — §6.2 S6; `CLAUDE.md` §14.3 condition 3 (disjoint path ownership).
- **Depends on** — Phase 2 exit.
- **Files/systems** — `components/layout/portal-navigation.ts` (**the highest-risk file in the
  repo — trainer/management/parent branches live in one object in one file**) ·
  `components/layout/portal-shell.tsx` (all three portal shells exported from one module) ·
  `app/globals.css` · `app/layout.tsx` · `components/ui/**` · `components/brand/**` ·
  `features/portal/**` · `lib/frontend/**`.
- **Owner** — Main Orchestrator. **Single writer.**
- **Steps** — 1) **Fix the unlayered-CSS root cause.** `app/globals.css` declares `*`, `body`,
  `h1`–`h4`, `:focus-visible`, `::selection`, `.card`, `.panel`, `.form-field` **unlayered**, so
  they outrank every Tailwind utility; `h1..h4 { color: #1b2b4b }` defeats a `text-white` heading
  on a dark panel. The inner-`<span>` workaround is **the most-replicated workaround in the
  codebase** and its root cause is unfixed. Move these into `@layer base` and remove the
  workarounds. Left unfixed, this silently defeats per-track utility work. 2) **Add the skip
  link** — `<main id="main-content">` already exists at `portal-shell.tsx`; **nothing anchors to
  it**, so WCAG 2.4.1 Bypass Blocks fails on every portal page. This is a ~5-line fix. 3) Add
  route-level `loading.tsx`, `error.tsx`, `not-found.tsx` and `global-error.tsx` — **all four are
  absent from the entire `app/` tree**, and 5 of 7 `<Suspense>` boundaries pass `fallback={null}`.
  4) Decide **adopt-or-supersede** for the 10 unused design primitives (`field.tsx`, `surface.tsx`
  et al. currently have 0 importers while features hand-roll markup) — cleanup manifest Q-9.
  5) Fix `StatePanel`'s default `homeHref` of `/trainer`, which leaks into parent and management
  surfaces at several shared call sites. 6) Resolve the contrast failures already measured and
  recorded (`text-brand-600` at 3.53:1 on white).
  7) ⚠️ **Relocate the two cross-owned files out of `features/trainer/**` and freeze them** (§7.3):
  `report-panel-config.ts` (**6 importers across all three tracks**) and `resource-state.ts`
  (**15 importers across all three tracks**). Both currently sit inside Track T's owned glob while
  Tracks M and P/A import them — the exact cross-owned edit `CLAUDE.md` §14.3 condition 3 prohibits. Move them
  to shared locations before the fork. 8) Record the **closed-world ownership rule** and the frozen
  list, including `proxy.ts`, `server/**`, `lib/**` and `app/page.tsx`.
- **Negative controls** — No role-specific behaviour is added here. No pack is implemented here.
- **Acceptance** — `tsc`/`lint`/`build` green; skip link works by keyboard; every route segment has
  loading/error/not-found; no unlayered global outranks a utility.
- **Tests/proofs** — `app-route-census.mjs`; keyboard traversal; a contrast check.
- **Commit** — `feat(ui): shared portal foundation, route states and skip link`.
- **Rollback** — `git revert`; tracks have not forked yet.
- **Operator gate** — NO.
- **Stop** — Any change a role track would need to alter later.

---

**P3-T01 — Create the three fresh worktrees**

- **Objective** — Fork safely from the accepted baseline.
- **Authority** — `CLAUDE.md` §14.3, §14.3a; §7.2 of this plan.
- **Depends on** — **P3-T00 AND P3-T05a**, both landed on `main` and both passed their checks.
- **Owner** — Main Orchestrator.
- **Steps** — 1) Confirm P3-T00 and P3-T05a are both in and green. 2) **Resolve
  `P3_ROLE_TRACK_BASELINE`** = `git rev-parse HEAD` on `main` at that moment (§7.3), and **record
  the resolved SHA in `STATUS.md`** so a resuming session can verify where the tracks actually
  forked from. 3) Create `feat/final-mvp-parent-auth`, `feat/final-mvp-trainer`,
  `feat/final-mvp-management`, **each from that same resolved SHA**, in shallow paths. 4) Record
  the ownership table (§7.3) and the merge order **P/A → T → M** before any writer starts.
- **Negative controls** — **Never reuse `feat/48h-backend`, `feat/48h-frontend` or their old
  directories.** Never branch from a `frozen/*` tag. **Do not fork from P3-T00's commit if P3-T05a
  landed after it** — a fork predating P3-T05a makes P3-T05 unsatisfiable inside Track P/A. If the
  three worktrees are ever found at different SHAs, that is a **halt**, not a rebase-and-continue.
- **Acceptance** — Three worktrees, **all three at the identical resolved
  `P3_ROLE_TRACK_BASELINE` SHA** (verify with `git worktree list`, not by assumption), that SHA
  recorded in `STATUS.md`, ownership table and merge order recorded.
- **Tests/proofs** — `git worktree list`.
- **Commit** — n/a.
- **Rollback** — `git worktree remove` (nothing written yet).
- **Operator gate** — **G-11 · CLASS A (local progression).** `CLAUDE.md` §12 carves out
  `git worktree add` where `CLAUDE.md` §14.3 requires a new isolated worktree, and this plan requires exactly
  these three. In-range under §7.6, create them and record the resolved baseline; outside a
  standing authorization, confirm with the Operator first.
- **Stop** — Any writer starting before ownership is recorded.

---

**P3-T02 — Track P/A: Parent and Auth reconstruction**

- **Objective** — Packs 30–33 and AUTH-01/02/03 to visual and functional acceptance.
- **Authority** — A-041…A-044; the §2.1 visual ladder; Lock §15.2 (Q-27); Lock §28.
- **Depends on** — P3-T01.
- **Files/systems** — owned set per §7.3.
- **Owner** — Writer subagent, `feat/final-mvp-parent-auth`.
- **Steps** — 1) Resolve each pack's `/reference/` counterpart **from
  `UI_REFERENCE_FINAL_MVP/SCREEN_INDEX.md`'s authoritative 36-row table — never by guessing from
  the folder name.** Three are not derivable: `32-parent-reports` → `Parent - Report` (**singular**),
  `AUTH-02-management-login` → `Auth 02 - Mangement - Login` (**misspelled on disk — do not
  correct it**), `02-trainer-my-classes` → `Trainer -  My Classes` (**two spaces**). 2) Build to
  the reference, honouring each pack's `screen.md` prohibitions. 3) The three AUTH packs share one
  route and one shell — **one work item, not three**. 4) Build loading/empty/validation/error/
  success/disabled states, not only the happy path.
- **Negative controls** — **Q-27 — its data half is discharged at P3-T05a (before this track forks)
  and its UI half at P3-T05, both inside this track's scope; neither is Track M's.** Parent must
  receive **no** aggregate rating chip —
  the reference draws one on every report row and it is deliberately not implemented. No
  per-dimension grid, no "Overall grade" chip. **`Auth 04 - All Users - Forgot Password` has no
  governed counterpart, no screen ID, no Figma node, and is NOT screen 37 — do not implement it and
  do not create a pack for it.** The inert "Forgot password?" link is a recorded visual conflict
  where the pack wins.
- **Acceptance** — Per pack: visual acceptance against `/reference/`, functional acceptance against
  `screen.md`, privacy acceptance, and all six UI states.
- **Tests/proofs** — Per-pack acceptance checklist; browser smoke; `app-route-census`.
- **Commit** — Per pack or per coherent group, on the track branch.
- **Rollback** — §11 R-3.
- **Operator gate** — NO within the track; merge is P3-T07.
- **Stop** — Any need to edit a frozen shared file.

---

**P3-T03 — Track T: Trainer reconstruction**

- **Objective** — Packs 01–10 to acceptance, including the attendance control.
- **Authority** — As P3-T02; plus A-018 and the P0-T09 item-3 disposition.
- **Depends on** — P3-T01; P2-T02 (attendance port contract).
- **Owner** — Writer subagent, `feat/final-mvp-trainer`.
- **Steps** — 1) Packs 01–10 per the mapping. 2) **Wire the attendance control to the real
  mutation** — today the roster has an attendance *filter* (local `useState`, correctly a view
  concern) and a **read-only** server-sourced value with no write path anywhere in the stack.
  3) Migrate the three Trainer report surfaces to OD-4 labels (already contract-migrated at
  P1-T07 — this is presentation). 4) Build the evidence upload surface where the packs place it
  (08, 10) — the regions are currently deliberately inert with *"NO UPLOADER IS INVENTED"* comments
  whose stated rationale is now superseded by the ruling, though the behaviour was correct pending
  Phase B.
- **Negative controls** — **No attendance affordance may be invented if P0-T09 item 3 is
  unresolved** — no ratified frame draws one. Trainer remains the only role that can toggle
  attendance. The assessment path stays blocked for an absent learner. Nine dimensions remain
  mandatory; Quick mode is removed completely and must not reappear.
- **Acceptance** — As P3-T02, plus: attendance toggle writes, audits and is refused for other roles.
- **Tests/proofs** — Per-pack checklists; `trainer-browser-smoke.mjs`; attendance suite.
- **Commit** — Per pack, on the track branch.
- **Rollback** — §11 R-3.
- **Operator gate** — Inherits P0-T09 item 3.
- **Stop** — Inventing an attendance frame.

---

**P3-T04 — Track M: Management reconstruction, including the wording-only editor surface**

- **Objective** — Packs 11–27 and 29 to acceptance, plus the derived governed management surfaces.
- **Authority** — As P3-T02; A-034; cleanup manifest **Q-20**; Lock §28.4 (U-25).
- **Depends on** — P3-T01; **P2-T07a** (the six creation/edit screens' write contracts) and
  **P2-T07c** (every management read projection, including the two mandated panels). Track M cannot
  write `server/**`, so both must be on `main` before the fork.
- **Owner** — Writer subagent, `feat/final-mvp-management`.
- **Steps** — 1) Packs 11–27, 29. **Pack 28 (Management Term Report) is separately governed and out
  of MVP scope — implementing it is a stop-and-ask.** 2) Build the derived governed surfaces for
  the U-25 blocked design families — management review queue, final review, wording-only editor,
  return-to-trainer dialog, correction tracking, final Approve & Submit. **Zero U-25 design
  artefacts exist anywhere on disk and `/reference/` closes none of them.** Under the Q-20 pattern
  these inherit the nearest authoritative Management report shell and **do not become new
  authoritative Figma screens**. ⚠️ **The remaining two U-25 families — staff notification and
  parent notification — are BLOCKED** pending P0-T09 item 4; do not build them.
  3) Keep the wording editor genuinely wording-only in presentation, matching the server contract.
  4) ⚠️ **Build the two MANDATED-BUT-UNDRAWN management panels** — their server-side aggregation is
  landed by **P2-T07c**, which this track depends on and may not write itself. `CLAUDE.md` §6 ratifies **Class
  Health Summary** (pack 13) as a literal, exhaustive four-condition table and **Management
  Insight** (pack 16) as a fixed three-slot template over a nine-row lookup, plus *"Students
  Needing Follow-up"*. Phase A records screen 16 as *"the most inverted screen in the pack —
  everything drawn is prohibited; the mandated 'Management Insight' … and 'Students Needing
  Follow-up' are **undrawn**"*, and G-23 notes pack 13's Class Health Summary is now **unblocked**.
  **Their absence from `/reference/` is not authority to skip them** — a reference-driven build
  omits them and a reference-driven visual sweep passes. Both carry an explicit anti-AI guardrail:
  neither may be expanded into AI-authored prose, which would pull the deferred Weekly Class Health
  Brief into scope. **No LLM, ever, on either panel.**
- **Negative controls** — **Inventing a Figma frame, node ID or field for any U-25 family is a `CLAUDE.md` §12
  stop-and-ask.** ~~Management must never see raw per-dimension assessment data — A-038's bar stands
  and **Q-27 grants Management nothing**.~~ ✅ **CORRECTED 2026-08-11 (operator ruling `C-18`,
  `FINAL_MVP_PORTAL_DECISIONS.md` §C).** **`A-038`'s bar NO LONGER STANDS in the Management
  direction:** operator ruling **`D-1`** (2026-08-11) permits Management to **VIEW the nine
  per-dimension ratings, READ ONLY**, on a **report detail surface** only (**`C-9`**), rendering
  **all nine** (**`C-10`**). ⛔ **Management may VIEW, never EDIT** — an assessment-level
  disagreement is a **return to the trainer**. ⛔ **`Q-27` still grants Management nothing and the
  PARENT boundary does not move by one field.** **GC counts, stated precisely — the register is not
  Management-only:** **GC-6** (per-dimension rating surfaces the frame draws but governance forbids)
  appears in seven packs, of which **five are in-scope Management** — `11, 15, 16, 17, 18`; the
  other two are `28` (out of scope) and `30` (Track P/A). **GC-7** appears in four packs but **only
  one is Management** — `17`; the other three (`01, 04, 09`) are **Track T** and are handled at
  P3-T03. Across the estate **19 of 36 packs carry a recorded `GOVERNANCE CONFLICTS RECORDED`
  block — pre-identified do-not-build items, not omissions** — and **Track M reads eleven of them**,
  pack 28's belonging to a pack no track owns. A content hash is never returned to Management or
  Parent. Management edits must remain wording-only — enforcement is the RPC signature, not the UI.
- **Acceptance** — As P3-T02, plus: every recorded GC conflict is deliberately not implemented and
  recorded as `EXPECTED`, not as a regression.
- **Tests/proofs** — Per-pack checklists; management browser smoke; `run-management-approved.mjs`.
- **Commit** — Per pack, on the track branch.
- **Rollback** — §11 R-3.
- **Operator gate** — NO within the track; U-25 invention is a stop.
- **Stop** — Any invented frame or any management surface exposing a rating.

---

**P3-T05a — Parent read-projection layer: Q-27 data boundary AND the projections Track P/A cannot build (serial, on `main`)**

- **Objective** — Land **every parent-facing read projection Track P/A will need but may not
  write**, with Q-27's data boundary structural from the start. ⚠️ **Scope widened after adversarial
  review:** the rating *exclusion* alone is not enough. Two Track P/A obligations require parent
  projections that **do not exist today** and live in `server/**` (never in Track P/A's globs) and
  in frozen contracts — so without them the track hits §7.3's "stop on contact" rule on **mandatory**
  work, exactly as it would have on Q-27 criterion 4:
  1. **P3-T05 criterion 2 — Profile Details** must be *built*, and `server/modules/parent-view/
     projections.ts` today exports only report-list, availability and canonical-report shapes. No
     profile projection exists.
  2. **P3-T02 / pack 31 — Parent Calendar**, whose Lock §15 remediation the Phase 3 shared
     precondition makes mandatory, has no parent calendar projection at all.
- **Authority** — **Lock §15.2**: *"Parent users must not receive the nine-dimension assessment
  ratings through the Parent experience at all"* — excluded from Parent-facing **DTOs and
  projections**, **RPC results**, **APIs and server actions**, and **any client payload reachable
  by a Parent session**. *"Fetching the ratings into the Parent client and hiding them with CSS is
  a violation, not a compliance path … the exclusion happens at the governed projection/data
  layer."*
- **Depends on** — P3-T00. **Executed on `main` immediately after P3-T00 and before the tracks
  fork — it is the second half of `P3_ROLE_TRACK_BASELINE` (§7.3).**
- **Files/systems** — `server/modules/parent-view/projections.ts`;
  `server/modules/integration-adapter/adapter-dtos.ts`;
  `lib/frontend/contracts/physical-test.ts`; `lib/frontend/physical-test-port.ts`;
  `lib/frontend/adapters/real-participant-port.ts`; the parent-reachable RPC surface. **All of these
  are `server/**` or on §7.3's frozen list — which is precisely why this task exists.**
- **Owner** — **Main Orchestrator, on `main`.** Not a track.
- **Steps** — 1) Prove, from the type and RPC surface rather than by reading the UI, that no
  parent-reachable DTO, projection, RPC result, server action or client payload can carry a
  dimension rating. 2) Where the current shape merely *happens* not to include them, make the
  exclusion **structural** so a later widening cannot reintroduce it silently. 3) Add a firing-
  proven negative test. 4) **Land the parent profile-details projection** carrying only the governed
  fields — Guardian, Class, assigned Trainer, enrolment date — and **structurally excluding the
  three fields Lock §15 records as defects: the child's date of birth, contact details, and the
  "Trainer Assistant (TA)" field.** 5) **Land the parent calendar projection** for pack 31, with the
  Lock §15 leaks structurally excluded — **no rating, no rating-derived colouring, and no trainer
  observation**, `Parent - Calendar.md:13` being *"the worst single line"* and `:23` the one a
  remediation working only from `:13` would leave standing. 6) Extend the port contract and adapter
  so Track P/A can consume all of it without touching a frozen file.
- **Negative controls** — The test must **fail** when a rating field is deliberately planted into a
  parent projection. A test that passes on both the compliant and the planted shape proves nothing.
  **The same planted-field proof is required for DOB, contact details, the TA field and a trainer
  observation** — each must be shown to be structurally unrepresentable, not merely absent today.
- **Acceptance** — Structural exclusion proven at the projection/RPC layer with every planted-field
  case demonstrated failing; **and Track P/A can satisfy P3-T05 criterion 2 and pack 31 entirely
  inside its own owned globs.** If it cannot, this task is incomplete and the fork must not happen.
- **Tests/proofs** — Parent-projection leak test (contract + runtime), retained as evidence.
- **Commit** — `feat(parent): governed parent read projections with structural exclusions (Q-27, Lock §15)`.
- **Rollback** — `git revert`.
- **Operator gate** — NO (ruled); **any deviation is a stop**.
- **Stop** — Any rating reachable by a Parent session by any path.

---

**P3-T05 — Q-27 Parent Dashboard acceptance (mandatory carry-forward)**

- **Objective** — Discharge the five acceptance criteria the Authority Lock **requires** this plan
  to carry.
- **Authority** — **Lock §15.2, verbatim mandatory carry-forward.** Q-27 ratified 2026-08-08.
- **Depends on** — **P3-T05a** (defined above, and executed before the fork); P3-T02.
- **Files/systems** — `features/parent/parent-dashboard.tsx` **only** — this task is the UI half.
- **Owner** — Track P/A writer; verified by the Main Orchestrator.
- ⚠️ **Split, because the data half cannot be executed by this owner.** Criterion 4 is a
  projection-layer obligation touching `server/modules/parent-view/projections.ts` and
  `lib/frontend/contracts/physical-test.ts` — `server/**` is not in Track P/A's owned globs at all
  and `lib/frontend/contracts/**` is frozen, so by §7.3's own rule the assigned writer must **stop
  on contact**. The data half is therefore **P3-T05a**, owned by the Main Orchestrator on `main`
  and executed **before** the tracks fork.
- **The five criteria — all five must pass:**
  1. The Parent Dashboard **matches the authoritative reference** at
     `UI_REFERENCE_FINAL_MVP/reference/Parent - Dashboard/` **except** for the operator-ratified
     omission of the **complete** "This Term's Skills" card.
  2. **Profile Details promotes upward into the vacated space.** Concretely: the main column is a
     vertical flex stack of two cards with a 22px gap; deleting child #1 makes Profile Details
     child #1 and it reflows to the top, flush under the header row, at the same left edge and full
     main-column width. **No positional CSS is written — removing the card is the move.** Note that
     Profile Details is currently **also absent** from the implementation and must be built.
     ⚠️ **Build it EXCLUDING three fields the reference draws.** `Parent - Dashboard.md:20` lists
     *"date of birth, Parent, contact, Class, assigned Trainer, **Trainer Assistant (TA)**, and
     enrolment date."* Lock §15's table records **two separate defects** in that line — *a child's
     date of birth and contact details on a parent surface*, against Lock §15's four-prose-panels-only
     rule; and a **"Trainer Assistant (TA)" field**, when Lock §4 records there is no TA role and the TA
     flow is deferred under A-014. **Lock §15.2 states expressly that Q-27 does not resolve them**,
     and pack 30's `implementation-notes.md` records no conflict for them — **Lock §15's table is
     the only record, so it must be carried here or the defect ships.** Their omission is
     `EXPECTED / REQUIRED`. Do not edit the reference to remove them.
  3. **No replacement rating visualization** of any kind is exposed.
  4. **Parent-facing data projections contain no nine-dimension ratings — proved at the
     projection/RPC layer, not by inspecting the DOM.**
  5. **Trainer and Management rating behaviour is unaffected** — neither widened nor narrowed.
- **Negative controls** — **Partial compliance is non-compliance.** It is not sufficient to hide
  the labels, obscure the values, render empty bars, collapse values while retaining the container,
  rename the card, or substitute another visualization. **The entire card is absent** — its title,
  all nine dimension labels, all bars, all rating-derived visual state. **Fetching the ratings into
  the Parent client and hiding them with CSS is a violation, not a compliance path.** Do not leave
  an intentional blank rectangle and do not invent a replacement card to fill the space. The
  right-hand Calendar / Upcoming structure is unchanged. **Do not modify the reference source** —
  `Parent - Dashboard.md` still describes the card and that text stands as historical.
- **Acceptance** — The card's absence is recorded as **`EXPECTED / REQUIRED`** — never as
  `MISSING IMPLEMENTATION` and never as a `VISUAL REGRESSION`.
- **Tests/proofs** — A projection-layer assertion that no parent-reachable DTO, RPC result, server
  action or client payload contains a dimension rating; a visual comparison recording the omission
  as expected.
- **Commit** — With Track P/A.
- **Rollback** — `git revert`.
- **Operator gate** — NO (ruled); **any deviation is a stop**.
- **Stop** — Any rating reaching a Parent session by any path.

---

**P3-T06 — Route canonicalization**

- **Objective** — Close the nine recorded route mismatches and the six unmapped implemented routes.
- **Authority** — `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` §7.2/§7.4 (the authority for
  canonical routes); Q-23; Q-20.
- **Depends on** — **P3-T07 (the merge)**. Executed on merged `main`, not at fork time: before the
  merge the reconstructed route files exist only on the track branches. This also avoids three
  tracks moving routes at once.
- **Files/systems** — `app/(portals)/**`; **`proxy.ts`** — its `PORTAL_PREFIXES` and route matcher
  hardcode the paths being moved, and it is **layer 1 of 2 of server-side portal authorization**
  (there is no `middleware.ts`, and the two may never coexist); **`scripts/physical-test/
  prove-governed-lifecycle.mjs`**, which hardcodes `/login`, `/trainer`, `/trainer/reports`,
  `/management/reports`, `/parent/reports` and `/assess`.
- **Owner** — Main Orchestrator at integration. **`proxy.ts` is frozen to the tracks and is
  updated here, in step with the route moves — never by a track.**
- **Steps** — Apply the recorded compatibility treatment per row: six core-slice mismatches
  (06, 07, 08, 10, 19, 33) replaced with pinned redirects where recorded; three dashboards
  (01, 11, 30) keep the existing bare route as a redirect. Screens 08 and 33 need server-side key
  resolution (`(sessionId, studentId)` ↔ `reportId`). **Route tallies in Lock §28.6 are explicitly
  unreliable — re-derive the mapping from the route list, not from the recorded totals.**
- **Negative controls** — **Executing a route-compatibility treatment without authorization is a
  stop-and-ask**, as is creating, moving or restyling a route in a documentation checkpoint. No
  route may be left dead. The inventory records **no dead routes today** — do not create one.
- **Acceptance** — Every canonical route resolves; every legacy route redirects; census unchanged
  or explained.
- **Tests/proofs** — `app-route-census.mjs`; `integrated-route-security.mjs`;
  `post-login-destinations.mjs`.
- **Commit** — `refactor(routes): canonical route reconciliation`.
- **Rollback** — `git revert`.
- **Operator gate** — **YES** (route-compatibility execution).
- **Stop** — Unauthorized route treatment.

---

**P3-T07 — Track integration**

- **Objective** — Merge three tracks into `main` without losing an acceptance.
- **Authority** — §7.2 items 4–6; §6.2 S6/S7.
- **Depends on** — Each track's acceptance.
- **Owner** — Main Orchestrator (only shared-`main` writer).
- **Steps** — Merge in the pinned order **P/A → T → M**. After each merge: `tsc`/`lint`/`build`,
  route census, and the merged track's acceptance re-run. Resolve conflicts on `main` only. Delete
  each physical worktree after its merge; **preserve the branch and its commits**, tagging first if
  the branch is fully merged (removal lifts git's refusal to delete a checked-out branch).
- **Negative controls** — Never resolve a conflict by taking one side blindly in a governed file.
  Never merge a track whose acceptance is `NOT-RUN`.
- **Acceptance** — `main` builds; all three tracks' acceptances hold post-merge.
- **Tests/proofs** — Post-merge full static suite after each merge.
- **Commit** — One merge commit per track.
- **Rollback** — §11 R-3.
- **Operator gate** — **PARTIAL. Merging and conflict resolution: NO.** ⚠️ **Worktree DELETION and
  the anchor TAG that must precede it: YES — Class B.** `CLAUDE.md` §12's carve-out covers
  `git worktree add` **only** — *"creating or deleting a worktree is otherwise an Operator
  decision"* — and `CLAUDE.md` §12 separately bars an unauthorized `tag`. Obtain both in one instruction, ideally
  the same one that grants G-11. **Leaving the worktrees in place until the gate is granted is the safe
  default — but PHASE 3 EXIT and §7.2 item 6 both require removal, so this gate must be obtained
  before the phase closes, not skipped.**
- **Stop** — An acceptance that does not survive the merge; or deletion/tagging without that
  authorization.

---

**P3-T08 — Accessibility remediation**

- **Objective** — Meet the stated WCAG 2.2 AA bar on the reconstructed surfaces.
- **Authority** — `CLAUDE.md` §3.5; A-009 (Lighthouse first).
- **Depends on** — P3-T07.
- **Files/systems** — dialogs in `trainer-report-review.tsx`, `management-report-review.tsx`;
  shared shell.
- **Owner** — Main Orchestrator.
- **Steps** — Close the recorded gaps: **skip link** (landed at P3-T00 — verify it survived);
  **dialog focus trap** — three modals correctly declare `role="dialog"`/`aria-modal` but there is
  **no focus on open, no restoration on close, no `inert`/`aria-hidden` on the background**, and
  the repo-wide `.focus()` count is 1 and not in a dialog; **Escape-to-close** — zero keyboard
  handlers exist anywhere; **route-change focus management**; the open contrast failures.
- **Negative controls** — Do not alter the WCAG-exempt logotype (R-B8).
- **Acceptance** — Keyboard-only traversal of all three portals succeeds; dialogs trap and restore
  focus; Escape closes; no AA contrast failure on a reconstructed surface.
- **Tests/proofs** — Lighthouse/axe run; manual keyboard traversal recorded.
- **Commit** — `fix(a11y): focus management, dialog semantics and contrast`.
- **Rollback** — `git revert`.
- **Operator gate** — NO.
- **Stop** — n/a.

---

**P3-T09 — Visual acceptance sweep**

- **Objective** — Record a per-pack visual verdict against the current authoritative source.
- **Authority** — A-056 visual ladder; each pack's `screen.md` §10; Lock §28.2/§28.3.
- **Depends on** — P3-T07, T08.
- **Owner** — Main Orchestrator + read-only reviewers.
- **Steps** — For each of the 36 packs: compare against `reference/<mapped pack>/` at frozen native
  dimensions; record verdict, before/after, and **every governed deviation as `EXPECTED`** with its
  ruling ID (Q-27, the 19 packs' GC conflicts, the U-25 derived surfaces).
- **Negative controls** — **A governed omission is never a regression.** Do not alter any
  `/reference/` byte to make a comparison pass — 74/74 files are SHA-verified and a live Figma
  re-export is prohibited where a ratified asset exists. Do not create a pack for `Auth 04`.
- **Acceptance** — **35 verdicts** — one per governed pack actually in implementation scope. **Pack
  28 (Management Term Report) is out of scope and has no builder; record it `NOT-RUN — out of MVP
  scope (separately governed)` rather than manufacturing a verdict.** Each other pack is `PASS` or
  an explicitly ruled deviation. Persona sign-off recorded.
- **Tests/proofs** — The sweep record; `/reference/` SHA re-verification.
- **Commit** — `docs(ui): visual acceptance sweep PASS (Operator Accepted outstanding)`.
- **Rollback** — n/a.
- **Operator gate** — **G-13 · CLASS B.** Record the evidence-backed `PASS` per pack; **the
  Operator's per-pack `Accepted` is a genuine task-specific acceptance and no standing authorization
  satisfies it.** It must be granted before any pack's visual verdict is cited as submission
  evidence, and while pending it blocks the Phase 3 boundary. **Never write an acceptance record on
  the Operator's behalf.**
- **Stop** — Any deviation without a ruling.

---

**PHASE 3 EXIT** — Three tracks merged; canonical routes and `proxy.ts` reconciled; Q-27 discharged
with all five criteria (data half at P3-T05a, UI half at P3-T05); route states and accessibility
closed; 35 visual verdicts recorded plus pack 28 declared out of scope; every worktree removed and
every branch preserved.

---

### PHASE 4 — LOCAL INTEGRATION / ACCEPTANCE

**Nature:** the last fully local gate. Nothing hosted may begin until this passes.

**PHASE 4 ENTRY** — Phase 3 exit; authorization to execute Phase 4 (explicit, or in-range under
§7.6). **Validation is a global mutex (S5).**

---

**P4-T01 — Build and static integrity**

- **Steps** — `npx tsc --noEmit`; `npm run lint`; `npm run build` (every route resolves); the
  portable static suites. **Acceptance:** exit 0 across the board, route count explained.
  **Operator gate:** NO. **Rollback:** `git revert`. **Stop:** any non-zero exit.

---

**P4-T02 — Executable test entry point**

- **Objective** — Make `npm test` mean something, and make the four `.assertions.ts` files
  genuinely executable or replace them with equivalent executable governed tests.
- **Authority** — Cleanup manifest **Q-10** (*"Four `.assertions.ts` kept. Never reported as
  passing without a real runner."*); **B4-04**; Phase A Track 5.
- **Depends on** — P4-T01.
- **Files/systems** — `package.json`; `tests/frontend/*.assertions.ts`; a `TESTING.md`.
- **Owner** — Main Orchestrator.
- **Steps** — 1) Add a credential-free `npm test` tier aggregating the portable suites. 2) The four
  `.assertions.ts` files are **type-checked but never executed**: `tsconfig.json` sets
  `noEmit: true`, nothing imports them, **three of the four use extensionless relative specifiers
  that Node's ESM resolver rejects** (only `auth-reference-fidelity.assertions.ts` is clean), and
  their own docblock claims a compile path that **does not exist**. Note that
  `fixture-contract.assertions.ts` is **purely compile-time** — its body is `void`-discards of
  type-level checks — so "make it executable" is incoherent for that file: it must be **replaced**
  by a runtime equivalent or reclassified honestly as a type-level check. Wire a real runner for
  the rest, or replace them. 3) Add a
  documented full tier requiring Docker.
- **Negative controls** — **Any past claim that these passed is unsupported and must not be
  repeated.** An aggregator that wires the suites **without** the P1-T04/T05 firing proofs would
  ship the fail-open pattern into CI — do not do that.
- **Acceptance** — `npm test` runs and is honest about what it does and does not cover.
- **Tests/proofs** — `npm test` on a clean checkout with no credentials.
- **Commit** — `test: credential-free test entry point`.
- **Operator gate** — NO. **Stop:** claiming coverage the tier does not have.

---

**P4-T03 — Database, RLS, RPC and concurrency**

- **Steps** — Every SQL suite; `verify-fresh-apply.mjs`; `run-concurrency.mjs`;
  `prove-clock-hour-determinism.mjs`. Re-run the P2-T12 membership-less sweep against the **final**
  RPC set. **Negative controls:** the known wall-clock non-determinism between 23:00–24:00 SGT must
  be handled or declared, not discovered by a marker. **Acceptance:** all `PASS`.
  **Operator gate:** NO. **Stop:** any refusal that does not fire.

---

**P4-T04 — C4 governed-lifecycle re-proof**

- **Objective** — Re-prove the flagship lifecycle gate, which **OD-4 reopened**.
- **Authority** — `CLAUDE.md` §14.7 (*"implementing OD-4 will reopen … G-6 and C4"*); Lock §27.
- **Depends on** — P4-T03; **P3-T06 explicitly** (see step 1b).
- **Files/systems** — `scripts/physical-test/prove-governed-lifecycle.mjs` (2,196 lines; 29 ledger
  lines = 14 lifecycle legs + 15 negative controls).
- **Owner** — Main Orchestrator. **Serial.**
- **Steps** — 1) Update the harness for OD-4 **and** for the P2-T10 transport — it holds a **second
  copy of the transport SQL** that must move in step.
  1b) ⚠️ **Also update it for the Phase 3 reconstruction, which is the larger reopening cause.**
  The harness is genuinely browser-driven over raw CDP and carries **~115 selector/CDP references,
  23 DOM-text/`data-testid` selectors and six hardcoded route literals**. Between P2-T10 and here,
  the plan rebuilds all three role UIs across three tracks and **moves six core-slice routes** at
  P3-T06 (two of which change key shape). **Re-derive every selector and every route literal
  against the post-P3-T06 canonical route table. A selector that no longer matches is a `FAIL`,
  never a skip.** 2) Re-run all 29 ledger lines.
  3) **Capture screenshots this time** — the prior run captured **zero**, and 13 of 29 items had no
  raw diagnostic. 4) Re-declare the scope carve-outs **accurately**: leg **L-4 of 29** is
  core-driven rather than browser-driven, with three declared deviations (fixture provider injected
  in place of OpenAI; a superuser `psql` transport so no client GRANT or RLS is exercised on that
  one step; `authUserSub` supplied literally rather than through `auth.getUser()`). The correct
  citation is *"leg L-4 of 29 is not browser-driven, with three compensated deviations"* — **never
  "the run was not browser-driven."** 5) Add the new negative controls: attendance write
  authorization, evidence privacy, parent no-rating projection.
- **Negative controls** — N-11 (canonical database byte-identical before and after), N-12 (no
  residue), N-15 (real participant adapter, not fixture), N-10 (no external provider call possible
  from the served process) must all still hold. **N-10 is discharged by §7.4a S-1's selector
  overwrite — record the read-back proof, not the intention.**
- **Acceptance** — 29+ lines, no `FAIL`, no silent default, carve-outs declared in both the ledger
  **and** the summary.
- **Tests/proofs** — The C4 ledger plus screenshots.
- **Commit** — `test(c4): governed lifecycle re-proof under OD-4 and the new transport`.
- **Rollback** — n/a (proof run).
- **Operator gate** — **G-14 · CLASS B.** Record `PASS` on the 29+ ledger; **the Operator's
  `Accepted` on the C4 re-proof is task-specific and is not satisfiable by a standing
  authorization.** Pending until granted.
- **Stop** — Any ledger line `FAIL`; any deviation not declared.

---

**P4-T05 — Governed product acceptance rules, proven individually**

- **Objective** — Make §12's critical rules explicit test artefacts rather than implicit properties.
- **Depends on** — P4-T04.
- **Owner** — Main Orchestrator + read-only reviewers.
- **Steps** — Prove each of §12's **22** rules with a named test. Specifically: parent receives **no**
  nine-dimension ratings **at the projection layer**; parent receives no internal evidence; an
  **absent** learner receives no report and no assessment path; Management cannot modify any
  assessment fact; the wording-only edit is genuinely wording-only **at the RPC signature**;
  trainer approval precedes management approval; `approved` precedes `submitted`; AI never rates,
  approves, submits or publishes; evidence storage is private; audit adjacency is correct; role and
  membership rules fail closed; no plaintext password exists anywhere; the service-role secret is
  server-only; the draft transport creates no authority bypass.
- **Negative controls** — Each rule needs a **failing** case as well as a passing one.
- **Acceptance** — Every §12 row has a named, passing, firing-proven test.
- **Commit** — `test(governance): critical product acceptance matrix`.
- **Operator gate** — NO. **Stop:** any rule provable only by inspection.

---

**P4-T06 — Audit continuity**

- **Steps** — `audit_verify_chain` complete + head-checked across every centre touched; confirm
  exactly-once emission per governed action; confirm the new `attendance.changed` emitter (and
  evidence emitters if amended) appear and chain correctly; confirm **no PII in any audit label or
  payload**. **Operator gate:** NO. **Stop:** any chain break or duplicate.

---

**P4-T07 — Route, access-control and projection census**

- **Steps** — ⚠️ **Serve under §7.4a** — this is the task §7.4a exists for: this suite explicitly
  requires a build made **without** fixture mode, which is exactly the billable configuration.
  Then: `integrated-route-security.mjs` against that served origin (**currently `NOT_RUN`**);
  `three-role-browser-smoke.mjs`; `sign-out-terminates-session.mjs`;
  `portal-navigation-active-state.mjs`; per-role projection diff. **Acceptance:** every guarded
  route guarded at all four layers; unauthenticated and unauthorized remain byte-identical
  responses. **Operator gate:** NO.

---

**P4-T08 — Phase 4 acceptance and adversarial review**

- **Steps** — Two independent read-only reviewers instructed to falsify: (1) product/governance/UI;
  (2) technical/security/execution. Remediate every valid Critical/High. **Record the persona
  sign-offs (`CLAUDE.md` §3).** Update `STATUS.md` and `BUILD_NOTES.md`. **Acceptance:** all matrix
  rows owned by Phase 4 are `PASS`; persona sign-offs recorded; both reviews closed. **Report every
  outstanding Operator `Accepted` (G-13 per-pack, G-14) as still outstanding.** **Commit:** `chore(checkpoint): local acceptance PASS (Operator Accepted outstanding)`. **Operator gate:** **YES** (phase
  exit). ⚠️ **G-15 · CLASS B/C — a HARD STOP that no standing local authorization can satisfy**,
  because it is simultaneously the terminus of the eligible local range (Phases 0–4) and the gate
  for **everything hosted**. Even under a `Plan Phases 0–4` grant, **stop here and return to the
  Operator.** **Stop:** any unresolved Critical/High.

---

**PHASE 4 EXIT** — The system is locally complete, locally proven, and C4 is re-proven under the
new contracts. **This is the precondition for every remaining phase.**

---

### PHASE 5 — BOUNDED REAL-PROVIDER RE-PROOF (G-6)

**PHASE 5 ENTRY** — Operator authorization; **Phase 4 exit (G-15)**; and **G-16 obtained
immediately before P5-T02 itself**, separately from phase entry.

**Nature:** ⚠️ **NOT a local-only phase.** It runs on local application code and local
infrastructure, but its core task **makes real, paid, external OpenAI requests** — so it sits
outside every standing local execution authorization by construction (§7.6-A, §7.6-C item 6).
**The entry gate must be re-obtained immediately before execution** — a prior authorization never
carries forward, not from an earlier G-16, not from a phase range, not from a configured key.

---

**P5-T01 — Pre-flight (non-billable)**

- **Steps** — `node scripts/physical-test/activate-g6.mjs --dry-run`;
  `census-provider-constructors.mjs`; `failure-safety.mjs`; `run-negative-controls.mjs`; confirm
  the ratified selectors validate; confirm the outward-fetch trip-wire arms on **every** run before
  any mode branch. **Acceptance:** dry-run clean, zero outward calls. **Operator gate:** NO.
  **Stop:** any refused outward attempt recorded by the trip-wire.

---

**P5-T02 — G-6 real-provider activation**

- **Objective** — Re-prove G-6 against the **final** OD-4 AI contract, the **final** draft-storage
  transport, and the final provider integration.
- **Authority** — Lock §18.5 (*"acceptance is closed to the docker transport only — must be
  re-proven against the replacement channel"*); `CLAUDE.md` §14.7 (OD-4 reopens G-6); §7.4 condition 5 and `CLAUDE.md` §12's spending bullet.
- **Depends on** — P4-T08; P2-T10.
- ⚠️ **Scope limit that must be declared, not discovered.** The ratified transport is *"a dedicated
  minimally-privileged login role over **a direct pooled connection**"* (PA-OD-9), and Lock §18.2
  item 4 specifies the Supabase pooler in **transaction mode**. Locally, `supabase/config.toml`
  sets `[db.pooler] enabled = false`, and the hosted channel role does not exist until P6-T07.
  **P5-T02 therefore exercises the wrapper and the role over a local direct connection; the pooler
  leg is `NOT-RUN` here, with that reason recorded.** The pooled-transport leg is proven at
  **P6-T07b**, which is a separate gated run with its own ledger. **P7-T04 is a validation task and
  must never be treated as carrying G-6 evidence.**
- **Owner** — Operator authorizes; Main Orchestrator executes.
- **Steps** — 1) **Obtain explicit Operator authorization immediately before invoking.** 2) Run
  `--activate-real-provider` — the byte-exact flag; no `=1`, `=true` or `=yes` variant is accepted.
  3) Requires an **interactive TTY**; there is no non-interactive path, not an environment
  variable, not a piped answer, not a CI runner. 4) Confirm each call at the visible per-call
  prompt. 5) **Two confirmed generations, each covering UP TO TWO real requests** — the harness's own
  wording is *"at minimum 2 and at most 4 real, billable requests in total, never more."* **State
  that RANGE to the Operator, never a single number.** Each confirmation covers both attempts of
  `requestDraftCore`'s bounded retry, so a confirmation can never silently become a third call for
  that report. 6) Compute G-6
  **only** from the sixteen ledger conditions.
- **Negative controls** — The trip-wire refuses any host that is neither loopback nor the single
  allowed host, and records refusals. `LLM_API_KEY` is inherited from the shell and **never** read
  into a file, printed, logged or persisted. Provider error objects are never surfaced — they can
  embed request headers.
- **Acceptance** — 16/16 conditions; both drafts reach `draft_ready` **through the new governed
  transport**; grounding still unbypassable by any client role; `report_store_draft`'s ACL still
  literally owner-only; audit chain verifies.
- **Tests/proofs** — The G-6 ledger; the refused-request record.
- **Commit** — `test(g6): real-provider re-proof under the final contract and transport`.
- **Rollback** — n/a (an external call cannot be rolled back — which is why the gate is immediate).
- **Operator gate** — **YES — PAID. Per-invocation. Never inferred from an earlier authorization.**
- **Stop** — Missing authorization; no TTY; unratified selectors; any trip-wire refusal.

---

**P5-T03 — Evidence and scope declaration**

- **Depends on** — P5-T02.
- **Steps** — Record the ledger and **declare the scope honestly**: these are *"sixteen G-6
  **evidence** conditions"*, not sixteen real-provider conditions — at least four are structural or
  static rather than runtime provider tests, and conditions 9 and 13 are structural. **Acceptance:**
  the summary and the ledger say the same thing. **Operator gate:** NO. **Stop:** any summary that
  overclaims.

---

**PHASE 5 EXIT** — P5-T01 pre-flight clean with zero outward calls · **P5-T02 `PASS` on all 16 G-6
conditions**, both drafts reaching `draft_ready` through the new governed transport, with
`report_store_draft`'s ACL literally unchanged and grounding unbypassable · P5-T03's honest scope
declaration recorded, including the **pooler leg declared `NOT-RUN` and assigned to P6-T07b**.

---

### PHASE 6 — HOSTED SUPABASE

**Nature:** the first time anything leaves this machine. **Operator/credential gate.** Getting the
region wrong means **re-provisioning, not reconfiguring** — it is one-shot at project creation.

**PHASE 6 ENTRY** — Operator authorization (**G-17**) **plus** credentials; **Phase 4 exit (G-15)**;
and **Phase 5 exit as defined immediately above** — not a reduced reading of it.

---

**P6-T01 — Provisioning plan and region decision**

- **Steps** — Present the provisioning plan and the **ADR-6 region confirmation** for the Operator
  to **confirm, not select** — ADR-1 and ADR-6 pin Singapore for database, Storage **and** compute,
  and reopening a locked ADR would require an amendment. Express the *obligation* platform-neutrally
  (it binds all three surfaces equally, on whatever platform). Record explicitly that **no region
  requirement comes from the submission brief** — this is an internal obligation and must never be
  presented as an academic one. Record that **no file in the repository pins the region**; it rests
  on a human checklist step at creation, one-shot and not recoverable in place.
  **Operator gate:** **YES.** **Stop:** provisioning without a recorded region confirmation.

---

**P6-T02 — Project creation with creation-time region evidence**

- **Steps** — Operator creates the hosted project. Capture **reproducible evidence of the region at
  creation**, not a later attestation. **Acceptance:** gate **G-SG** — the ADR-6 Singapore pin
  verified at creation for database, Storage and compute. **Rollback:** §11 **R-10** (not
  recoverable in place — delete and re-provision). **Operator gate:** **YES.**
  **Stop:** region unverifiable, or not the ADR-6 region.

---

**P6-T03 — Forward-only migration deployment**

- **Steps** — Apply all migrations to the fresh hosted project **in order, forward-only**, under
  the ownership guard. Replay and re-prove the grant and RLS posture from the hosted catalogue.
  Verify the audit chain on the hosted instance. **Negative controls:** **never** plan a
  destructive production reset as normal recovery; **never** run `supabase db reset` against
  hosted. **Acceptance:** all migrations apply cleanly; posture re-proven from the live hosted
  catalogue, not from migration text. **Rollback:** §11 **R-9** (forward-fix migration; never a
  hosted reset). **Operator gate:** **YES.**

---

**P6-T04 — Auth configuration**

- **Steps** — Apply the P2-T09 decisions hosted: signup policy; **confirmations on**; captcha;
  password policy; MFA decision; session timebox; **hosted `site_url` and redirect allow-list with
  consistent scheme** (the local pair currently disagrees: `http` vs `https`); rate limits.
  **Negative controls:** no loopback URL survives into hosted config. **Acceptance:** a pre-squat
  attempt fails hosted. **Operator gate:** **YES.**

---

**P6-T05 — Production SMTP**

- **Steps** — Configure a real provider (`[auth.email.smtp]` is entirely commented out today; local
  Inbucket only, 2 emails/hour). **Acceptance:** a confirmation email is delivered.
  **Operator gate:** **YES** (external service).

---

**P6-T06 — Private Storage hosted**

- **Steps** — Create the private bucket and apply the P2-T04 policies hosted. Re-run the A-003
  must-fail matrix **against hosted**. **Negative controls:** bucket never public; no anonymous
  read; signed URLs short-TTL and server-minted. **Acceptance:** every prohibited path fails closed
  hosted. **Operator gate:** **YES.**

---

**P6-T07 — Hosted draft channel**

- **Steps** — Create the dedicated minimally-privileged login role hosted; store its credential as
  a server-only secret; verify the **`proacl`-text assertion** against the hosted catalogue.
  **Acceptance:** gate **G-AI** — a draft stores on hosted through the replacement channel with
  `report_store_draft` still at zero client EXECUTE and grounding unbypassable by any client role.
  Record the accepted residual: grounding remains bypassable **by possession of the channel
  credential**. **Negative controls:** the role must **not** be granted to `authenticator`, and
  **must never be granted to `authenticated`** — Lock §18.5 calls that *"the catastrophic
  direction"*; the grant must be direct, never `ALTER DEFAULT PRIVILEGES`; the role is
  `NOBYPASSRLS` with zero table privileges. **Operator gate:** **YES.**
  **Stop:** the assertion cannot be verified from the hosted catalogue.

---

**P6-T07b — G-6 pooled-transport leg (hosted)**

- **Objective** — Close the scope limit P5-T02 declares: prove the AI drafting path over the
  **ratified pooled connection**, which cannot exist locally.
- **Authority** — PA-OD-9 (*"a direct **pooled** connection"*); Lock §18.2 item 4 (Supabase pooler,
  transaction mode); Lock §18.5 gate **G-AI**.
- **Depends on** — P6-T07; P5-T02 complete.
- **Steps** — Run the G-6 harness against the hosted deployment over the pooled channel, with its
  own 16-condition ledger. Bounded call count, per-call visible confirmation, trip-wire armed.
- **Negative controls** — As P5-T02. `report_store_draft` ACL unchanged; grounding unbypassable by
  any client role; subject-mismatch refusal fires.
- **Acceptance** — G-6 `PASS` over the pooled transport, with the ledger recording which conditions
  are runtime and which are structural.
- **Rollback** — n/a (external call).
- **Operator gate** — **YES — PAID, per-invocation, never inherited (G-16b).**
- **Stop** — No authorization; or the pooler leg cannot be exercised.

---

**P6-T08 — Management bootstrap execution**

- **Steps** — Execute P2-T07's owner-controlled bootstrap against hosted, via an interactive
  no-echo prompt. Verify the audit event. Verify idempotency by a second run.
  **Negative controls:** **no plaintext password anywhere**; not a pipeline step; no client can
  invoke it. **Acceptance:** exactly one active management membership exists.
  **Operator gate:** **YES.** **Stop:** any auto-grant.

---

**P6-T09 — Environment separation, secrets and network posture**

- **Steps** — Separate local/hosted environments and secrets; **`SUPABASE_SECRET_KEY` and the
  channel credential are server-only, never `NEXT_PUBLIC_`**; **record one of the three
  network-restriction outcomes the Authority Lock mandates evaluating — (a) a Vercel static-egress
  mechanism is used and the allow-list is applied, (b) restrictions are applied to every source
  *except* the draft channel, or (c) restrictions are not applied, *with the reason stated*.
  Choosing (c) without recording why leaves the Lock's own stated residual entirely unmitigated**;
  enable TLS; verify the six-variable validation binds to the correct project (`env.ts` currently
  **disclaims any proof** that the credentials bind to the selected project). **Negative controls:**
  no secret in a commit, a log, an audit payload or a build artefact. **Operator gate:** **YES.**

---

**P6-T10 — Production role identities**

- **Depends on** — P6-T08; **P2-T07b** (the invitation lifecycle this task consumes does not exist
  before it).
- **Steps** — Pre-provision the three governed UAT/demo identities (Management, Trainer, Parent) as
  a **strategy**, not a seed: Management via the P2-T07 bootstrap, Trainer and Parent via the
  P2-T07b invitation lifecycle, with credentials delivered out of band. **Negative controls:** **no plaintext password stored,
  displayed, emailed, logged or committed**; no fixture loader against hosted — the local loader
  structurally refuses to run outside the local stack and that must not be relaxed.
  **Acceptance:** all three sign in hosted and land on their own portal. **Operator gate:** **YES.**

---

**PHASE 6 EXIT** — A hosted project in a recorded region, all migrations applied forward-only,
posture re-proven from the live hosted catalogue, auth hardened, private storage governed, the
draft channel proven, management bootstrapped, and three role identities usable.

---

### PHASE 7 — VERCEL DEPLOYMENT

**PHASE 7 ENTRY** — Operator authorization; **Phase 6 exit** — a hosted project in the recorded
region, all migrations applied forward-only with the posture re-proven from the live hosted
catalogue, auth hardened, private Storage governed, the draft channel proven (G-AI), management
bootstrapped, and three role identities usable.

**Nature:** the first public deployment. **Public-exposure gate.**

---

**P7-T01 — Deployment configuration**

- **Depends on** — Phase 6 exit.
- **Steps** — `next.config.ts` is currently an **empty scaffold** — add security headers and CSP,
  `poweredByHeader: false`. Set `export const runtime = "nodejs"` explicitly on **any route
  touching the draft transport** (never Edge). Set `maxDuration` to cover the 60-second provider
  timeout. Set the function region per the P6-T01 decision. **`output: "standalone"` is not needed**
  — that was a Cloud Run artefact and the GCP mandate is superseded. Replace the stock
  `create-next-app` favicon, which would otherwise serve the Next.js default mark on the public
  URL. **Operator gate:** NO. **Stop:** any Edge runtime on a transport route.

---

**P7-T02 — Production environment variables**

- **Steps** — Set hosted Supabase URL and publishable key; server-only secret key; LLM selectors and
  key; **assert `NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE` is UNSET** — it is a *runtime* env read, so
  the same build can start in fixture mode without a rebuild. **Negative controls:** no secret in a
  `NEXT_PUBLIC_` variable; no secret in the repository. **Operator gate:** **YES.**
  **Stop:** fixture mode reachable in production.

---

**P7-T03 — First public deployment**

- **Steps** — Build and deploy. **Acceptance:** a stable public HTTPS URL resolves.
  **Rollback:** §11 **R-8** (Vercel rollback to the prior deployment; the hosted database is *not*
  rolled back with it). **Operator gate:** **YES — FIRST PUBLIC DEPLOYMENT.**
  **Stop:** no authorization.

---

**P7-T04 — Post-deployment reconciliation and validation**

- **Steps** — Add the production origin to the hosted Auth redirect allow-list and `site_url`;
  confirm all three roles sign in **on the hosted origin**; run
  `integrated-route-security.mjs` against the public URL (**it runs credential-free — this is its
  highest-value use**); confirm the governed lifecycle completes end-to-end hosted; confirm **no
  application module spawns a container CLI** in the deployed runtime; verify the AI feature is
  functional in the deployed environment. **Acceptance:** public URL, three-role sign-in, hosted
  lifecycle, AI functional. **Operator gate:** NO. **Stop:** the draft path fails hosted — that
  means P2-T10 or P6-T07 is incomplete.
- ⚠️ **"Verify the AI feature is functional" is a REAL PAID CALL.** On the deployed build there is
  no fixture path: the participant action constructs the real provider **unconditionally** (gate
  G-19 — *"there is no switch to flip"*), and P7-T02 sets live LLM selectors with fixture mode
  asserted unset. **Operator gate for that step: YES — PAID (G-16c), per-invocation, never
  inherited.** State the expected call count before invoking. The rest of P7-T04 is ungated, and
  this step is **not** a substitute for the G-6 ledger (see P5-T02's scope note and P6-T07b).

---

**PHASE 7 EXIT** — A publicly accessible, working deployment on the ratified architecture, with the
AI feature functional in the deployed system.

---
### PHASE 8 — PRODUCTION UAT

**Nature:** technical acceptance of the deployed system by all three governed roles. **This is NOT
human usability research** — the two must never be conflated, and neither may be reported as the
other (Lock §26.4, absolute).

**PHASE 8 ENTRY** — Operator authorization; **Phase 7 exit** — a publicly accessible deployment
with all three roles signing in on the hosted origin.

---

**P8-T01 — UAT preparation**

- **Depends on** — Phase 7 exit; **P2-T07a and P2-T07b** — without the governed administration and
  invitation write layers there is **no permitted way** to create this scenario, because the only
  other identity/data creation path is the local fixture loader, which structurally refuses to run
  outside the local stack and is forbidden here.
- **Steps** — Confirm the three pre-provisioned hosted identities; prepare a seeded but **synthetic**
  academic scenario (centre, grade, module, sessions, learners, enrolments) through **governed
  write paths only** (P2-T07a); record the UAT script from A-024 step 13 and A-024's **three**
  flows —
  Management, Trainer, Parent (the "all four UAT scripts" reading was corrected at C-8; **A-024
  governs and the answer is three**; TA is deferred).
- **Negative controls** — **ADR-6 synthetic data only. The moment real child data is loaded, the
  deferral becomes a breach.** No fixture loader against hosted. No plaintext credential in any
  artefact.
- **Acceptance** — A runnable scenario and a written script.
- **Operator gate** — NO. **Stop:** any real personal data.

---

**P8-T02 — Trainer flow**

- **Steps** — Sign in → open an eligible session roster → **attendance** (confirm default Present;
  set one learner Absent; confirm the audit event) → **upload evidence** for a present learner →
  record observations, notes and **all nine ratings** → request an **AI draft** → review → **edit**
  → complete the quality checklist → **approve**.
- **Acceptance** — Report reaches `trainer_approved`; **nothing is published**; every step audited
  exactly once.
- **Operator gate** — **YES — PAID (G-16d)** for the *"request an AI draft"* step only: hosted
  drafting is a live billable provider call with no fixture path. Obtain authorization immediately
  before, state the expected call count, and remember the bounded retry means one authorization
  covers up to two attempts. The remaining steps are ungated.
- **Stop** — Any step that cannot complete hosted; or an unauthorized draft request.

---

**P8-T03 — Management flow**

- **Steps** — Sign in → see the report in the pending queue → **review** → perform a **wording-only
  edit** of the four panels → confirm the nine ratings are preserved verbatim → exercise **return
  to trainer** on a second report and confirm the trainer sees the requirement, revises and
  re-approves (**and can never reapprove the returned version**) → **Approve & Submit**.
- **Acceptance** — First report reaches `submitted`; the correction path completes; audit adjacency
  correct.
- **Operator gate** — NO. **Stop:** any management write reaching an assessment fact.

---

**P8-T04 — Parent flow**

- **Steps** — Sign in → read **only** the submitted report → confirm the narrative is the canonical
  OD-4 four-panel model → confirm the dashboard shows **no** ratings card and Profile Details sits
  at the top of the main column.
- **Acceptance** — Parent sees the submitted narrative and nothing else. **A-004 requires BOTH
  directions** — record what is visible *and* the refusals: no draft, no internal or trainer note,
  no raw per-dimension rating, no AI draft history, no evidence, no content hash.
- **Operator gate** — NO. **Stop:** any internal data on a parent surface.

---

**P8-T05 — Hosted negative controls and isolation**

- **Steps** — Verify hosted: **no raw nine-dimension ratings reach a Parent** (proved at the
  projection/RPC layer, not the DOM) · **no evidence reaches a Parent** · role isolation across all
  three portals · **an absent learner receives no report and no assessment path** · unauthorized
  RPC and Storage reads **fail** · a membership-less identity is refused on every RPC · the audit
  chain verifies complete and head-checked hosted · the correction path is intact · state persists
  across sessions and sign-outs · sign-out terminates the session for all three roles.
- **Negative controls** — Each must be demonstrated **failing** where it should fail. A pass with
  an inert detector is a `FAIL`.
- **Acceptance** — Every control fires.
- **Operator gate** — NO. **Stop:** any control that cannot be made to fire.

---

**P8-T06 — UAT document**

- **Steps** — Produce the UAT record A-024 requires. **Declare scope honestly** — strong execution
  evidence has historically existed without being called UAT; this closes that. Record every
  carve-out as `NOT-RUN` with a reason.
- **Negative controls** — **Never describe UAT as usability testing.** Never describe an
  agent-driven script as a human session. The vocabulary `participant`, `real_participant_adapter`
  and *"participant eligible: yes"* are **software identifiers** that read as human-subject
  language to an outside examiner — the control is a **submission glossary entry**, because the
  historical evidence that contains them must not be rewritten.
- **Acceptance** — A UAT document traceable to committed evidence.
- **Commit** — `docs(uat): production UAT record`.
- **Operator gate** — **YES** (acceptance). **Stop:** any overclaim.

---

**PHASE 8 EXIT** — The complete governed lifecycle is proven on the real hosted deployment, by all
three roles, with every isolation and privacy control demonstrated firing.

---

### PHASE 9 — HUMAN USABILITY TESTING

**Nature:** research with real people. **This is not technical UAT and no amount of C1–C4, G-6,
browser-test, integration-test or synthetic-fixture evidence substitutes for a single real
participant.** Currently **zero human usability evidence exists** in this workspace.

**PHASE 9 ENTRY** — Operator authorization (**G-21**); **Phase 8 exit**; and the P0-T07 recruitment
request already **issued** to the Operator.

> ⚠️ **Participants are NOT an entry condition — they are P9-T01's OUTPUT, and P9-T01 is the first
> task inside this phase.** Requiring them to enter the phase that produces them would be circular,
> the same shape as the P3-T00 defect. What must be true to enter is that Phase 8 is done and the
> Operator is ready to proceed with human subjects.

The recruitment gate was armed at P0-T07 because this is the longest-lead item in the project and is
gated on nothing — **arming it neither enters this phase nor discharges it**.

---

**P9-T01 — Participant recruitment and consent (Operator-led)**

- **Steps** — Operator recruits **real or representative users** and handles consent. Claude
  prepares materials only.
- **Negative controls** — **Never fabricate a participant, a session, a consent record or a
  finding.** Recruitment and consent stay **outside product code** unless the current brief
  requires otherwise — it does not. **The brief specifies no participant count, no consent process
  and no research protocol; the plan does not invent one.** Any protocol depth beyond the brief is
  a deliberate choice, not a requirement, and must not be presented as one.
- **Acceptance** — Participants confirmed with consent handled.
- **Operator gate** — **YES — HUMAN SUBJECTS.** **Stop:** no participants.

---

**P9-T02 — Protocol, tasks and metrics**

- **Steps** — Define per-role task scenarios against the deployed system, mapped to the brief's
  focus areas: **usability** (is it easy and intuitive to navigate), **clarity** (do users
  understand what to do at each step), **breakdown points** (confusion, friction, drop-off), and
  **recovery** (how the service guides users when things go wrong). Define observation metrics.
  Include an explicit evaluation of **whether the AI feature improves the experience**, which the
  brief asks for directly.
- **Negative controls** — **Observe behaviour, not just opinions** — the brief is explicit.
- **Acceptance** — A written protocol.
- **Operator gate** — NO. **Stop:** a protocol that only collects opinions.

---

**P9-T03 — Sessions and observation**

- **Steps** — Run the sessions against the **hosted deployment**. Capture evidence per the consent
  obtained.
- **Negative controls** — No real child data. No participant PII in the repository, in
  `BUILD_NOTES.md`, or in any submission artefact beyond what consent covers.
- **Acceptance** — Sessions completed and observed.
- **Operator gate** — **YES.** **Stop:** consent boundary reached.

---

**P9-T04 — Findings register**

- **Steps** — Record findings with severity: **target users identified**, **key findings
  documented**, **major usability issues identified**. Separate observation from interpretation.
- **Acceptance** — A findings register traceable to sessions.
- **Commit** — `docs(usability): findings register`.
- **Operator gate** — NO.

---

**P9-T05 — Iteration and re-demonstration**

- **Objective** — Discharge the leg the rubric actually grades.
- **Steps** — Implement remediations for the findings the Operator selects, redeploy, and
  **demonstrate the improved prototype**. The brief requires **"improvements made based on testing
  documented"** and the presentation rubric grades **Testing & Iteration** on evidence of
  refinement — so testing without a visible improvement leg scores as minimal.
- **Negative controls** — A remediation that changes governed behaviour is a `CLAUDE.md` §12 stop-and-ask, not
  a usability fix.
- **Acceptance** — A traceable line from finding → change → redeployed system.
- **Commit** — Per remediation.
- **Operator gate** — **YES** if a remediation touches governance; NO otherwise.
- **Stop** — A finding that can only be fixed by changing a governed rule.

---

**P9-T06 — Terminology control**

- **Steps** — Add a **submission glossary** that defines `participant`, `real participant adapter`,
  `physical test` and `walkthrough` as **software/verification terms**, so no marker infers human
  subjects where there were none. One historical instance of the defect exists and **cannot be
  corrected** because historical records are never rewritten — naming it in the glossary is the
  only available control, so that no submission text ever quotes it as usability evidence.
- **Negative controls** — Do not purge or rewrite historical evidence. The control is a glossary,
  not a find-and-replace.
- **Acceptance** — Glossary present in the submission package; no submission text relabels
  automated evidence as human evidence.
- **Commit** — With P10.
- **Operator gate** — NO. **Stop:** any submission text that overclaims.

---

**PHASE 9 EXIT** — Real participants, real tasks, real findings, and **documented improvements
made as a result** — with no document implying human subjects where there were none.

---

### PHASE 10 — FINAL SUBMISSION / PRESENTATION

**Nature:** artefacts, integrity scan, push, submit. **The largest remaining gap here is not a
deployment gap** — the Design Workbook / Final Report and its supporting research artefacts do not
exist in this workspace at all.

**PHASE 10 ENTRY** — Operator authorization; **Phase 8 exit AND Phase 9 exit**. ⚠️ **Phase 9
completion is mandatory** — the brief requires usability testing *and documented improvements made
as a result*, and P10-T04/T08 consume P9's findings register and remediation trace. Arming
recruitment at P0-T07 does not discharge it.

---

**P10-T01 — README replacement**

- **Steps** — Replace the untouched `create-next-app` boilerplate (36 lines, unmodified since repo
  init) with a real README: what B.E.S.T Coach is; the three roles; the governed two-stage report
  workflow; **the AI feature** (a separately graded deliverable the current README does not
  mention); the architecture; prerequisites (Docker Desktop, Supabase CLI, Node ≥24 <25); the six
  environment variables; migrations; **`npm run fixtures:local` and its interactive no-echo
  password prompt — a marker cannot seed without knowing this**; the test tiers; **npm only** (the
  boilerplate advertises yarn/pnpm/bun against a project pinning `npm@11.13.0`). Remove the
  boilerplate "Deploy on Vercel" marketing text and replace it with the real deployment section.
- **Acceptance** — A clean clone reaches a running app using only committed documentation.
- **Commit** — `docs: project README`. **Operator gate:** NO.

---

**P10-T02 — Deployment instructions**

- **Steps** — A runbook covering hosted Supabase provisioning (including the one-shot region step),
  migration deployment, auth and SMTP configuration, private storage, the draft-channel role and
  its secret, management bootstrap, Vercel configuration and environment variables, and the
  post-deploy redirect reconciliation. **Acceptance:** a third party could reproduce the deployment
  from this document alone. **Commit:** `docs: deployment instructions`. **Operator gate:** NO.

---

**P10-T03 — Architecture diagrams**

- **Steps** — Produce system architecture diagrams reflecting the **ratified** architecture:
  Next.js → Vercel → hosted Supabase, with the governed RPC boundary, the audit chain, the AI
  drafting path and the draft channel. Refresh the stale diagrams to the current amendments.
  **Negative controls:** **do not revive GCP/Cloud Run in any diagram.** No diagram may show a
  client reaching `report_store_draft`. **Acceptance:** diagrams match the deployed system.
  **Commit:** `docs: architecture diagrams`. **Operator gate:** NO.

---

**P10-T04 — Design Workbook / Final Report**

- **Objective** — Close the single largest submission gap.
- **Authority** — Lock §25.6: *"Component 1 of 6 — the Design Workbook / Final Report — does not
  exist in this workspace, nor do the service blueprint, the user journey map, the stakeholder
  analysis, the persona set, or the Miro/Figma board links. This is the single largest submission
  gap and it is not a deployment gap."*
- **Steps** — Document the design journey from problem discovery to solution: problem statement,
  stakeholder analysis, user research findings, user journey map, service blueprint, key design
  decisions and iterations, testing findings, improvements made from testing, and links to
  supporting Miro/Figma boards. Include the **continuity narrative** the brief asks for — how the
  project evolved across the term's earlier deliverables and mentor feedback.
- **Negative controls** — **Do not fabricate research that did not happen.** Where an artefact does
  not exist, say so and describe what was actually done. Do not present internal verification as
  user research.
- **Acceptance** — Complete against the brief's checklist, with every claim traceable.
- **Commit** — `docs: design workbook`. **Operator gate:** NO (content is Operator-reviewed).
- **Stop** — Any section that would require inventing evidence.

---

**P10-T05 — Google Site**

- **Steps** — Assemble the central hub: the Design Workbook / Final Report, system architecture
  diagrams, the service blueprint, the **live application URL**, the GitHub repository link, and
  the 2-minute video. **Rollback:** §11 **R-11**. **Operator gate:** **YES** (external publication).
  **Stop:** publishing before the P10-T07 scan.

---

**P10-T06 — Two-minute project video**

- **Steps** — Record a 2-minute video demonstrating the deployed system: the complete end-to-end
  journey and the AI feature. **Negative controls:** demonstrate the **deployed** system, not
  localhost, wherever the brief's live-URL requirement applies. No secret, no credential and no
  real personal data on screen. **Rollback:** §11 **R-11**. **Operator gate:** **YES** (publication).

---

**P10-T07 — Final integrity, secret and third-party-content scan**

- **Objective** — The hard precondition on publishing anything.
- **Authority** — Readiness plan §8.3 precondition 1 (**still unmet**); Lock §31.1 (PA-OD-8);
  Lock §25.6.
- **Steps** — Run a **fresh, dated** secret, redaction **and third-party-content** scan over all
  four trees. Two prior scans do **not** discharge this: one was credential-shaped only and
  narrowly scoped, and the other covered staged repository content and never touched the
  out-of-repo trees. **A credential regex would never flag prose coursework.** Specifically
  confirm: no `LLM_API_KEY`, `SUPABASE_SECRET_KEY` or channel credential anywhere in tracked
  content or history; no participant PII; **no foreign or unrelated coursework content** anywhere
  in the 343-file UI estate — this matters because **the tree is already committed, so pushing
  `main` publishes all of it**, including the 88 `_checkpoint-evidence` artefacts. The exposure
  point has moved from "none of it ships" to "all of it ships", and the trigger is the push.
- **Negative controls** — PeakPalate is `KEEP_IN_PLACE` foreign reference material — **not a
  deliverable, not the project video, not to be moved or pushed**, and **not** to be reported as
  unresolved contamination. The frozen demo stays external and read-only.
- **Acceptance** — A dated scan report with zero findings, or every finding remediated.
- **Commit** — `docs: pre-publication integrity scan`.
- **Operator gate** — NO to run; **YES** to accept.
- **Stop** — **Any finding blocks the push.**

---

**P10-T08 — Submission package assembly**

- **Steps** — Assemble against the mandatory register:

  | # | Artefact | State at plan creation |
  |---|---|---|
  | 1 | **GitHub Classroom repository** (`SDS-2026-Team-XX`) | Not started — 0 remotes; team number unknown |
  | 2 | **README** | Boilerplate |
  | 3 | **Deployment instructions** | Absent |
  | 4 | **Google Site** | Absent |
  | 5 | **2-minute video** | Absent |
  | 6 | **Architecture diagrams** | Stale/absent |

  Plus the further brief-mandated items governance already records: the **Design Workbook / Final
  Report** (Lock §25.6 calls it component 1 of 6), the **AI feature** as a graded deliverable in
  its own right, **testing results** with documented improvements, the **final presentation**
  checklist, and the **continuity** narrative across the term's earlier deliverables.
- **Negative controls** — **Do not invent the team number or the exact deadline.** Both are
  Operator-held; the submission *week* is known, the exact date and time are not. Mark external
  unknowns explicitly rather than guessing.
- **Acceptance** — Every artefact exists, or its absence is an explicitly recorded Operator
  decision. **Operator gate:** NO.

---

**P10-T09 — GitHub Classroom remote and final push**

- **Steps** — Confirm the commit identity matches the submitting GitHub account. Add the remote.
  Push. **Depends on:** P10-T07 accepted with zero findings.
- **Negative controls** — **Push is the exposure point.** No push before the scan. Confirm
  repository visibility with the Operator before pushing, since the estate ships with the branch.
- **Acceptance** — The repository is pushed and reachable.
- **Operator gate** — **YES — REMOTE AND PUSH.** **Stop:** missing invite URL; unscanned tree;
  unconfirmed identity or visibility.

---

**P10-T10 — Presentation and demonstration readiness**

- **Steps** — Rehearse within the allocated time. Prepare to demonstrate: the working prototype,
  the complete end-to-end journey, the AI feature, testing findings, and the improvements made from
  testing. Run the final deployment checklist: the live link is accessible; the main flow works;
  the AI feature responds; **no broken links or missing pages**; the demo runs without errors;
  internet tested; a backup demonstration prepared. **Be able to explain the deployment approach
  and its constraints during the presentation** — this is one of the four obligations that transfer
  onto the substitute platform, and it should be prepared deliberately rather than improvised.
  Also discharge the brief's own hard requirement that the team **be able to explain the service,
  the flow and the AI feature** — recorded as *"the most operationally significant requirement in
  either PDF for an agent-built codebase"*, and previously omitted.
- **Negative controls** — *"The AI feature responds"* is a **real billable call** on the deployed
  build (no fixture path, **Phase A gate G-19**). Rehearsal repetitions cost money.
- **Acceptance** — A rehearsed, working demonstration.
- **Operator gate** — **YES — PAID (G-16e)** for each AI-feature rehearsal/demo call; NO for the
  rest. **Stop:** any broken flow on the public URL.

---

**P10-T11 — Final submission**

- **Steps** — Submit per the course channel. **Operator gate:** **YES — SUBMISSION.**
  **Stop:** anything in the Definition of Done unmet and unrecorded.

---

**PHASE 10 EXIT** — Every required artefact exists, the integrity scan is clean, the repository is
pushed, the presentation is rehearsed, and the submission is made.

---

## 9. CONTINUITY AND RESUME MODEL

The plan must survive a session ending mid-task, badly.

### 9.1 Canonical records

| Layer | File | Discipline |
|---|---|---|
| Authority | `FINAL_MVP_AUTHORITY_LOCK.md` + rulings | Amended only by Operator instruction |
| **Execution plan** | **this file** | Edited only when the *roadmap* changes, never as a journal |
| Current status | `docs/progress/STATUS.md` | **Snapshot — replace the block, never stack** |
| Historical log | `docs/progress/BUILD_NOTES.md` | **Append-only, never rewritten**, even when superseded |

**Do not create a competing tracker, status file or execution log.** Neither `STATUS.md` nor
`BUILD_NOTES.md` is functional authority.

### 9.2 Required checkpoint record

Every meaningful checkpoint records, in `STATUS.md` (replacing) and `BUILD_NOTES.md` (appending):

1. current **phase and task ID**;
2. **branch** and **worktrees** (paths, owners, branches);
3. **HEAD** (full SHA);
4. **working-tree state** — clean, or every dirty path classified;
5. **completed acceptance gates**, each `PASS`/`FAIL`/`NOT-RUN` with its evidence pointer;
6. **pending gates**;
7. **blockers**, in the `CLAUDE.md` §15.5 schema, with blast radius recorded as *neither passing nor failing*;
8. the **next exact task**, by ID;
9. **whether hosted, provider and human actions are currently authorized** — and that a prior
   authorization does **not** carry forward;
10. **starting HEAD → ending HEAD**, migration/schema changes (or an explicit "none"), reviewer
    findings and their remediation, Operator decisions received, environment changes, and
    cleanup/rollback state (whether any partial mutation occurred);
11. **any `STANDING_LOCAL_EXECUTION_AUTHORIZATION` in force** — its **named range**, its date and
    its granting instruction. **An unrecorded standing authorization does not exist** (§7.6-A), and
    a session that cannot find the range recorded must not assume one;
12. **every outstanding Operator `Accepted`** that a `PASS` did not and cannot produce — per-pack
    visual (G-13), C4 (G-14), and any other **Class B** gate reached during the run;
13. once resolved, the **`P3_ROLE_TRACK_BASELINE` SHA** and the three worktree branches forked from
    it, so a resuming session can verify the fork point rather than trust it.

**Never record** an API key, password, service-role key, authorization header, connection string,
other secret, real participant data, or raw private AI content. Verdicts, counts, routes and public
checksums only. **Never paste a subagent transcript. Subagents never write project logs.**

### 9.3 Resume procedure

1. Read `CLAUDE.md` → Authority Lock + rulings → **this file** → `STATUS.md` → recent
   `BUILD_NOTES.md`.
2. **Verify against reality:** `git rev-parse HEAD`, `git status --porcelain -uall`,
   `git branch -a`, `git worktree list`, `git remote -v`, `git tag`; Docker/Supabase state; hosted
   state if any.
3. **Do not assume the previous session stopped cleanly.** Specifically check for: a worktree with
   uncommitted work; a migration applied locally but uncommitted (or committed but unapplied); a
   regenerated types file out of step with the migration set; a half-merged track; a hosted change
   with no local record; and — the most dangerous state — **an irreversible task interrupted
   between its side effect and its ledger**: money already spent with no G-6 ledger, a hosted
   project created with no record, a deployment live with no entry, an email sent, a push landed.
4. **If recorded state and actual state disagree, pause and reconcile before doing any work.**
   Existence governs facts. Never continue from stale status.
5. Confirm the current phase is still authorized — either by an explicit phase authorization, or by
   a recorded `STANDING_LOCAL_EXECUTION_AUTHORIZATION` that passes **all four** §7.6-D resume
   conditions (range still recorded · state agrees with the records · current task inside the range
   · no hard gate pending). If any fails, **the standing authorization is not in force this
   session** — report and ask. **Authorization never carries forward across a session boundary for
   hosted, provider, human, public, push or submission actions.**
6. Resume at the recorded next task ID, or at the start of the interrupted task if its acceptance
   is `NOT-RUN`. ⚠️ **Carve-out — never auto-resume a task that is PAID, HOSTED, PUBLIC, HUMAN, PUSH or
   SUBMISSION, or an interrupted DESTRUCTIVE one. Key this off CAPABILITY, not off the recorded
   gate class** — a task recorded `Operator gate — NO` that can still reach an external host, a
   paid provider, a credential or a destructive command is equally non-auto-resumable. For those, an acceptance of `NOT-RUN` means the side effect may
   *already have happened* without being recorded, and §7.4 condition 13 makes re-attempting a
   failed billable, hosted, destructive or production-facing operation a stop-and-ask. Establish
   what actually happened externally, report it, and **re-obtain the gate** — a blind rerun spends
   money twice or provisions a second project whose region cannot be fixed in place.

### 9.4 Completion vocabulary

`NOT_STARTED · IN_PROGRESS · BLOCKED · AWAITING_OPERATOR · IMPLEMENTED_AWAITING_VERIFICATION ·
PASS · SUPERSEDED`. **Code existing is not work being complete.** Only the Operator marks anything
`Accepted`.

---

## 10. OPERATOR GATE REGISTER

> **Naming.** Gates in this register are the **plan's own** and are written `G-nn`. Several Phase A
> and Authority-Lock gates reuse the same shape — **Phase A G-6** (real provider), **G-19** (no
> external call from the served process), **G-20** (census), **G-21** (PA-OD-9), **G-22**
> (attendance), **G-23** (evidence), **G-24** (auth/bootstrap), **G-SG** (region), **G-AI** (hosted
> draft channel). Those are always written **"Phase A G-nn"**, "**G-SG**" or "**G-AI**" in this
> document. A bare `G-nn` always means this table.

**Every gate carries a CLASS, so a fresh session can tell at a glance what will actually make it
return to the Operator during an authorized local run:**

| Class | Meaning | Behaviour under an in-range `STANDING_LOCAL_EXECUTION_AUTHORIZATION` (§7.6) |
|---|---|---|
| **A — LOCAL PROGRESSION** | A routine local phase-entry/exit control, or an action `CLAUDE.md` §12 already carves out. No external side effect, no new decision, **no acceptance**. | **Satisfiable in-range** by meeting all ten §7.6-B conditions. Claude records `PASS` and continues. |
| **B — OPERATOR DECISION** | A genuine, task-specific decision, ruling or formal acceptance that only the Operator can make. | **Not satisfiable by any standing authorization. Blocks its task until answered.** |
| **C — HARD EXTERNAL** | Leaves the machine, spends money, involves a human subject, or publishes. | **Never inherited, by anything, ever** — not by a range, not by an earlier grant, not across a session boundary. Per-invocation where marked. |

| Gate | Where | Class | Nature |
|---|---|---|---|
| G-00 | Authorize this plan | **B** | Entry authorization. May itself carry a `STANDING_LOCAL_EXECUTION_AUTHORIZATION` range |
| **G-00a** | **P0-T04** | **B** | **Bounded annotate-never-delete instruction for the run** (`CLAUDE.md` §12). Never inherited from a range unless the granting instruction names it explicitly |
| G-01 | P0-T06 | **B / C** | Baseline tag (**B** — tag creation is an Operator decision; `CLAUDE.md` §12 bars an unauthorized `tag`) **and off-machine copy (C — it leaves the machine)** |
| G-02 | P0-T07 | **C** | **Human participant recruitment** (armed early; arming ≠ executing Phase 9) |
| G-03 | P0-T08 | **B** | External-input answers |
| G-04 | P0-T09 | **B** | `report_source_map` · `session_logs` · attendance visual disposition · notification scope — **hard until answered** |
| G-05 | P0-T10 | **B** | Seven evidence pre-rulings, incl. the **audit-registry amendment** — **hard until answered** |
| **G-05a** | **P1-T02** | **B** | **OD-4 §5.1 content-hash envelope ruling** — ~~(confirm Q-6’s V2-parallel disposition) — **hard until answered**~~ **✅ ANSWERED 2026-08-08. CLOSED.** The Operator ruled the V2-parallel disposition: **V1 frozen byte/semantically · PARALLEL V2 serializers · new versions at `content_hash_version = 2` · CHECK widened to `1 or 2` · no backmigration · no silent relabelling of a future production V1 row · `report_store_draft` keeps zero client EXECUTE.** Carrier: `FINAL_MVP_PHASE0_OPERATOR_RULINGS.md` |
| G-06 | P1-T09 | **B** | Grounding rule-4 rule set ratification — **hard until answered** |
| **G-07** | **P1-T11** | **A** | **Phase 1 exit** — routine local progression |
| G-08 | P2-T07 | **B** | Bootstrap design — the `CLAUDE.md:163` vs §5.7 authority resolution |
| G-09 | P2-T09 | **B** | Captcha and SMTP provider selection (external services) |
| **G-10** | **P2-T14** | **A** | **Phase 2 exit** — routine local progression |
| **G-11** | **P3-T01** | **A** | Worktree creation — this plan requires it; confirm and proceed in-range |
| G-12 | P3-T06 | **B** | Route-compatibility execution — a ratified Amendment 005 stop-and-ask |
| **G-12a** | **P3-T07** | **B** | **Worktree DELETION and its anchor TAG.** `CLAUDE.md` §12's carve-out covers `git worktree add` **only** — *"creating or deleting a worktree is otherwise an Operator decision"* — and §12 separately bars an unauthorized `tag`. Merging itself is ungated |
| G-13 | P3-T09 | **B** | **Per-pack visual acceptance — a task-specific Operator acceptance.** Claude records the evidence-backed `PASS`; the Operator grants `Accepted`. **Pending until granted, and it blocks the Phase 3 boundary under §7.6-B condition 9** |
| G-14 | P4-T04 | **B** | **C4 re-proof acceptance** — task-specific. Claude records `PASS` on the 29+ ledger; the Operator grants `Accepted`. **Pending until granted** |
| **G-15** | **P4-T08** | **B / C** | **Phase 4 exit — the terminus of the eligible local range AND the gate for everything hosted. A HARD STOP even under a Phases 0–4 standing authorization**, because crossing it leaves the authorized range |
| G-16 | P5-T02 | **C** | **PAID provider invocation — per invocation, immediately before, never inherited** |
| **G-16b** | **P6-T07b** | **C** | **PAID** — the G-6 pooled-transport leg |
| **G-16c** | **P7-T04** | **C** | **PAID** — the "AI feature functional hosted" verification call |
| **G-16d** | **P8-T02** | **C** | **PAID** — the hosted UAT AI-draft request |
| **G-16e** | **P10-T10** | **C** | **PAID** — each AI-feature rehearsal and demonstration call |
| **G-16f** | **P8-T03** | **C** | **PAID** — the second report's AI draft (the return-to-trainer leg needs one) |
| **G-16g** | **P9-T03** | **C** | **PAID** — participant sessions exercising the AI feature. **The largest uncontrolled spend surface in the plan**: participants × drafts. Budget and authorize a call ceiling before the first session |
| **G-16h** | **P10-T06** | **C** | **PAID** — AI-feature calls made while recording the video |
| G-17 | P6-T01…T10 | **C** | **Hosted provisioning and credentials** (each sub-gate independently) |
| G-18 | P7-T02 | **C** | Production secrets |
| G-19 | P7-T03 | **C** | **First public deployment** |
| G-20 | P8-T06 | **B** | UAT acceptance (Operator `Accepted`, hosted phase) |
| G-21 | P9-T01 / T03 | **C** | **Human subjects** |
| G-22 | P9-T05 | **B** | Governance-touching remediation |
| G-23 | P10-T05 / T06 | **C** | External publication |
| G-24 | P10-T07 | **B** | Integrity-scan acceptance — **hard precondition on the push** |
| G-25 | P10-T09 | **C** | **Remote and push** |
| G-26 | P10-T11 | **C** | **Final submission** |

**Count: 37 gates — 3 Class A · 16 Class B · 16 Class C · 2 B/C (G-01, G-15).** There are **no
A/B hybrids**; a gate is either satisfiable in-range or it is not.

Under a `Plan Phases 0–4` standing authorization, **the gates that will actually stop an autonomous
run are:** G-00a · G-01 · G-02 (the moment anything touches recruitment) · G-03 · G-04 · G-05 ·
G-05a · G-06 · G-08 · G-09 · G-12 · **G-12a** · **G-13** · **G-14** · and **G-15 at the range
terminus**.
Everything Class C is beyond the range by construction. **Only G-07, G-10 and G-11 are crossed
autonomously.**

Plus the 14 standing stop conditions in §7.4 — and, through condition 11's note, the **full**
`CLAUDE.md` §12 enumeration — all of which apply **inside** any phase.

⚠️ **On the paid gates specifically: G-16 through G-16h — all eight — exist because the build has
no fixture path.** The participant action constructs the real provider unconditionally (Phase A gate **G-19**,
*"there is no switch to flip"* — not this table's G-19). **Every hosted exercise of the AI feature
costs money**, including ones that look like validation or rehearsal — and so does **a locally
served build that has not satisfied §7.4a**. Authorization is **per invocation and never
inherited** — not from an earlier gate, not from being inside an authorized phase, not from a
configured API key. *A key is a capability, not an authorization.*

---

## 11. ROLLBACK AND RECOVERY

**Principle: forward-safe.** Production migrations are forward-only. **A destructive production
reset is never normal recovery.**

| ID | Risk | Rollback |
|---|---|---|
| **R-1** | **Local migration** | Local: `supabase stop` → recreate the local stack → reapply from scratch → `verify-fresh-apply`. **Never `supabase db reset` on a stack holding evidence.** Committed migrations are corrected by a **new forward migration**, never by editing an applied file. ⛔ **AMENDED 2026-08-16 UNDER AN EXPLICIT OPERATOR INSTRUCTION NAMING THIS ROW: EVERY R-1 APPLICATION RECONCILES THE CLI MIGRATION LEDGER IN THE SAME PASS.** Applying a migration with `docker exec … psql -f` does **not** write `supabase_migrations.schema_migrations` — `psql` does not know that table exists — so the file and the database agree while the **history** silently diverges. ▶ **Apply, then record** (`supabase migration repair --status applied <version> --local`), and confirm with **`npm run prove:ledger-current`** before the pass closes. ⚠️ **MEASURED, NOT HYPOTHETICAL: it recurred EIGHT TIMES UNNOTICED** — 38 ledger rows against 46 files — because **nothing in this project reads the ledger**: every census assertion, every suite and every gate measures the **catalogue**, so the database was right, all 24 portal suites were green, and the divergence was invisible to all of them. ⛔ **A record nothing reads is a record that rots in silence**, the same shape as the stale `database.types.ts` one layer over; **both were authoritative artefacts consulted by nothing.** The consequence was that **incremental application broke** — `supabase migration up` re-ran eight live migrations and died on assertions true at their own HEAD. ⚠️ **Rebuild-from-empty was UNTESTED, not broken**: every registry assertion across the set is monotonic in sequence (`19 → 21 → 23 → 24`), so each holds at its own point in a from-empty replay — **that is the accurate claim, and the stronger one would have been wrong.** *(Full diagnosis: `docs/plan/PORTAL_COMPLETION_PLAN.md` §52. This amendment ADDS an obligation and removes nothing — the sentences above it are unchanged and still binding.)* |
| **R-2** | **Checkpoint regression** | `git revert` the checkpoint commit. Never `reset`, `rebase`, `amend` or force |
| **R-3** | **Worktree / track integration** | Before merge: discard the worktree, recreate fresh from `main`, re-apply. After merge: `git revert` the merge commit; the track branch survives and can be re-merged after fixing |
| **R-4** | **Generated types** | Regenerate from the current migration set. **Never hand-edit.** If regeneration is unavailable, revert the migration rather than patch the types |
| **R-5** | **Auth / security change** | Revert the configuration and re-run the security suite **before** doing anything else. An auth rollback is never partial — half-reverted auth is worse than either state |
| **R-6** | **Storage policies** | Revert to the prior policy set and re-run the full A-003 must-fail matrix. **A storage rollback is not complete until every prohibited path is re-proven failing** |
| **R-7** | **Draft-storage transport** | The legacy local store remains available as a **local-only** fallback until the replacement is proven. Roll back by reverting the store construction, **never** by granting `report_store_draft` to a client role |
| **R-8** | **Deployment configuration** | Vercel rollback to the prior deployment. **Note the asymmetry: this does not roll back the hosted database.** Re-verify redirect URLs and env vars after any rollback |
| **R-9** | **Hosted migration failure** | Diagnose and apply a **forward-fix migration**. Do not reset the hosted database. If the schema is unrecoverable *and* no real data exists, re-provisioning a fresh project is preferable to a destructive reset — and the region decision must be re-made deliberately, not inherited |
| **R-10** | **Region set wrongly** | **Not recoverable in place.** Delete and re-provision. This is why P6-T01/T02 gate it |
| **R-11** | **Published artefact** | Unpublish the Site/video; a push cannot be unpublished — which is why P10-T07 precedes P10-T09 unconditionally |

**Preservation, standing:** two verified snapshots on two independent physical devices, plus git
bundles. **0 remotes remains the single largest standing risk to the project** — several GB of
graded work exists as one copy on one disk.

**Register integrity check (run whenever §11 or the task list changes):** every `R-n` in the table
above must be cited by at least one task, and every `§11 R-n` citation in a task must resolve to
the row it means. This check exists because the table was renumbered after the tasks were first
written and eight citations were off by one — a rollback pointer that resolves to the wrong
procedure is worse than none, because it will be followed.

---

## 12. CRITICAL PRODUCT ACCEPTANCE RULES

Twenty-two rules. Explicit, testable, and each owned by a named task. **None of these may be
satisfied by inspection alone**, and each needs a **failing** case as well as a passing one.

| # | Rule | Proven at |
|---|---|---|
| 1 | **AI never rates.** | P1-T08, P4-T05 |
| 2 | **AI never approves, submits or publishes.** | P1-T08, P4-T05 |
| 3 | **Management cannot modify assessment facts.** | P4-T05, P8-T03 |
| 4 | **The management wording-only edit remains genuinely wording-only** — enforced by the RPC signature, with the nine ratings copied verbatim from the trainer-approved source. | P4-T05, P8-T03 |
| 5 | **Parent receives the submitted narrative only, as governed.** | P4-T05, P8-T04 |
| 6 | **Parent cannot receive raw nine-dimension ratings** — excluded at the projection layer, not by CSS. | **P3-T05a** (the data boundary), P3-T05 (the UI), P4-T05, P8-T05 |
| 7 | **Parent cannot receive internal evidence.** | P2-T05, P8-T05 |
| 8 | **An absent student cannot receive a report.** | P2-T01, P4-T04 (N-1), P8-T05 |
| 9 | **Evidence storage is private.** | P2-T04, P6-T06 |
| 10 | **Evidence ownership and learner/session/assessment association are correct.** | P2-T03, P8-T02 |
| 11 | **Trainer approval precedes Management approval.** | P4-T04, P8-T03 |
| 12 | **`approved` precedes `submitted`** (and `approved` never commits). | P4-T03, P8-T03 |
| 13 | **Audit events and adjacency remain correct**, exactly once per governed action. | P4-T06, P8-T05 |
| 14 | **Role and membership rules fail closed.** | P2-T12, P4-T07, P8-T05 |
| 15 | **No plaintext passwords**, anywhere, ever. | P2-T09, P6-T08, P6-T10 |
| 16 | **The service-role secret is server-only.** | P6-T09, P7-T02 |
| 17 | **The draft-storage production transport creates no authority bypass** — `report_store_draft` keeps zero client EXECUTE. | P2-T10, P5-T02, P6-T07 |
| 18 | **Management has no code path to a pre-trainer-approval draft, an internal/trainer note, a raw per-dimension rating, or AI draft history** (`CLAUDE.md` §10 Phase 3 exit condition; A-038). | P4-T05, P4-T07 |
| 19 | **No content hash is ever returned to Parent or Management** (Amendment 004 stop-and-ask; A-038). | P4-T05 |
| 20 | **Parent UAT proves BOTH directions** — what is visible *and* what is refused. A-004's refusal leg is not evidence-conditional: drafts, internal notes, raw per-dimension ratings and AI draft history are absent from the parent view regardless of evidence scope. | P2-T05, P4-T05, **P8-T04** |
| 21 | **A duplicate AI job produces no second `report_version`** — ADR-5's idempotency obligation, currently discharged by lifecycle-state idempotency rather than an idempotency key; `CLAUDE.md` §3.6 requires an automated test. | P4-T03, P4-T05 |
| 22 | **Centre isolation holds with the same rigour as parent isolation** (`CLAUDE.md` §3.1). | P4-T07, P8-T05 |

---

## 13. ACCEPTANCE MATRIX

`L` = local · `H` = hosted · `B` = both. **Final proof** names the phase that owns the verdict.

| Type | Scope | Final proof | Notes |
|---|---|---|---|
| **Type safety** | B | P4-T01 (L), P7-T04 (H build) | `tsc --noEmit` exit 0 |
| **Lint** | L | P4-T01 | |
| **Build** | B | P4-T01 (L), P7-T03 (H) | every route resolves |
| **Unit / static** | L | P4-T02 | credential-free `npm test` tier |
| **Database** | B | P4-T03 (L), P6-T03 (H) | fresh-apply; posture re-proven from the live hosted catalogue |
| **RLS** | B | P4-T03, P6-T03 | **zero DML policies** is the invariant. The *count* is 29 today and Phase 2 raises it (evidence tables, storage policies) — re-derive it at proof time; do not pin the pre-Phase-2 number as the criterion |
| **RPC** | B | P4-T03, P6-T03 | signature-qualified grants re-emitted after every rename |
| **Auth** | B | P4-T07 (L), P6-T04 (H) | signup, confirmations, captcha, redirects, pre-squat refusal |
| **Storage** | B | P2-T04 (L), **P6-T06 (H)** | A-003 must-fail matrix must pass **hosted** |
| **Audit** | B | P4-T06 (L), P8-T05 (H) | complete + head-checked |
| **Report lifecycle** | B | P4-T04 (L), P8-T02–T04 (H) | 14 transitions; T12 preserved |
| **Concurrency** | L | P4-T03 | CAS / optimistic-lock behaviour |
| **AI contract** | B | P1-T08/T09 (L), **P5-T02** (real) | grounding runs before any persistence |
| **G-6 real provider** | **B** | **P5-T02** (local direct connection) **+ P6-T07b** (hosted pooled transport) | P5-T02 declares the pooler leg `NOT-RUN` (`[db.pooler] enabled = false` locally; the channel role does not exist until P6-T07). **P7-T04 is a validation task and carries no G-6 evidence** |
| **Administration & invitations** | B | P2-T07a / P2-T07b (L), **P8-T01/T03 (H)** | A-024 steps 2–6 and 11; without these the hosted UAT scenario cannot be created by any permitted means |
| **Management read & statistics** | L | **P2-T07c** (contracts), **P3-T04** (surfaces) | Class Health Summary and Management Insight are **mandated by `CLAUDE.md` §6 and UNDRAWN in `/reference/`** — a reference-driven build omits them and a reference-driven sweep passes. **No LLM on either.** Plus the administrative reads packs 12/14/17/18/20–27 consume |
| **C4 governed lifecycle** | L | **P4-T04** | reopened by OD-4; re-proof with screenshots |
| **Role access** | B | P4-T07, P8-T05 | four enforcement layers |
| **Parent projection** | B | **P3-T05a**, P4-T05, P8-T05 | proved at the projection/RPC layer, never the DOM. P3-T05 owns only the UI half |
| **Attendance** | B | P2-T01 (L), P8-T02 (H) | write path, audit, absent-learner refusal |
| **Evidence media** | B | P2-T05 (L), **P6-T06 / P8-T05 (H)** | privacy proven hosted |
| **Visual acceptance** | L | **P3-T09** | **35 verdicts + pack 28 `NOT-RUN` (out of MVP scope)**; governed omissions recorded as `EXPECTED` |
| **Accessibility** | L | P3-T08 | skip link, focus trap, Escape, contrast |
| **Hosted UAT** | **H** | **P8-T06** | three governed roles, full lifecycle |
| **Human usability** | **H** | **P9-T04 / T05** | real participants **plus documented improvements** |
| **Submission** | H | **P10-T08 / T11** | six-artefact register plus the brief's further mandatory items |

---

## 14. EXTERNAL-INPUT REGISTER

Unresolved inputs that only the Operator or an external party can supply. **None of these is a
vague blocker — each has a phase and an answer to "can local work continue?"**

| # | Input | When needed | Why needed | Local work continues before it? |
|---|---|---|---|---|
| 1 | **Team number** for `SDS-2026-Team-XX` | P10 | Repository naming; submission identity. **Unknown — `XX` is never filled in anywhere; recorded as an Operator-held fact** | **YES** |
| 2 | **Exact submission deadline and time** | P10 | Scheduling. The submission **week** (17–23 Aug 2026) and presentation week (10–16 Aug 2026) are known; **the exact date, time and timezone are not** | **YES** |
| 3 | **GitHub Classroom invite / assignment URL** | P10-T09 | Cannot add a remote without it. Absent from the workspace | **YES** |
| 4 | **Repository visibility** (public/private) | P10-T09 | The push publishes the full 343-file estate | **YES** |
| 5 | **Final presentation duration** | P10-T10 | Rehearsal. Brief says only "within the allocated time" | **YES** |
| 6 | **Supabase account + project creation** | P6 | Nothing hosted exists | **YES** — through Phase 5 |
| 7 | **Supabase credentials** (project URL, keys, DB password) | P6 | Migration deployment and configuration | **YES** |
| 8 | **Region CONFIRMATION** (not a choice) | P6-T01 | **ADR-6 pins Singapore** for database, Storage and compute. **One-shot at creation; not recoverable in place.** Reopening ADR-6 would require an amendment — the Operator is confirming, not selecting. ⚠️ No region requirement comes from the brief | **YES** |
| 9 | **SMTP provider + credentials** | P6-T05 | Confirmations and invitations cannot function hosted without one | **YES** |
| 10 | **Captcha provider** | P2-T09 / P6-T04 | Signup hardening | **YES** — the decision can be recorded and applied later |
| 11 | **Vercel account + project** | P7 | Public hosting | **YES** |
| 12 | **Paid provider spend authorization** | P5-T02 | **No standing authorization exists; a prior G-6 authorization did not carry forward** | **YES** — Phases 0–4 need no provider call |
| 13 | **Human participants + consent** | P9 | **Longest-lead item in the project; gated on nothing** | **YES** — but starting late is the main schedule risk |
| 14 | **Evidence sub-rulings** (scan_status, retention, size, A-038 reconciliation, consent instrument, audit-registry amendment, §8.2 scope) | P2-T03…T05 | Seven open decisions | **PARTIALLY** — Phase 1 and the non-evidence Phase 2 tasks continue |
| 15 | **`report_source_map` / `session_logs` dispositions** | P2-T06 | An unreconciled contradiction inside one governance document | **PARTIALLY** |
| 16 | **Attendance control visual disposition** | P2-T02 / P3-T03 | **No ratified frame draws an attendance control** | **PARTIALLY** — the write path lands regardless |
| 17 | **Bootstrap authority resolution** (`CLAUDE.md:163` vs A-030 / §5.7) | P2-T07 | Two rank-2 clauses meet head-on | **PARTIALLY** |
| 18 | **Grounding rule-4 rule set ratification** | P1-T09 | *"a design decision, not a rename"* | **PARTIALLY** — everything else in Phase 1 continues |
| 19 | **LLM region / DPA** | P6 | *"recorded nowhere — an open gap"*; a fourth compute surface the residency obligation has not addressed | **YES** |
| 20 | **Teaching-team deployment approval — documentary form** | P10-T10 | Recorded as `OPERATOR_CONFIRMED_TEACHING_TEAM_DEPLOYMENT_APPROVAL` (2026-08-08). ⚠️ **This is an operator-reported external confirmation; no documentary evidence exists in this workspace and none may ever be fabricated.** The ruling governs; what is needed is the ability to **name the deployment approach and its constraints at the presentation** | **YES** |
| 21 | **Final submission action** | P10-T11 | Only the Operator submits | **YES** |
| 22 | **Off-machine copy / remote for preservation** | P0-T06 | 0 remotes; several GB on one disk | **YES** — but the risk is standing |
| 23 | **CHIPS 1–4 and Sprint 1 source material** | P10-T04 | The brief requires a continuity narrative across the term's earlier deliverables. **No CHIPS 1–4 and no Sprint 1 material exists anywhere in this workspace** — it is Operator-held or must be reconstructed from outside it. Do not fabricate it | **YES** |
| 24 | **Notification-surface scope ruling** | P0-T09 item 4 / P3-T04 | `notifications` is `DEFERRED_BY_RATIFIED_DECISION`; two U-25 families are notification surfaces and are blocked until ruled | **PARTIALLY** — the other six U-25 surfaces proceed |

---

## 15. DEFINITION OF FINAL MVP COMPLETE

**The project is not complete because the local application builds.** All of the following must
hold, each with positive evidence.

**Governed implementation**

1. The OD-4 four-panel model is the **only** report narrative model across AI, Trainer, Management
   and Parent — no relabelling shim at any layer.
2. V2 hash serialization ships **in parallel** with V1; V1's bodies, signatures, ACLs and comments
   are unchanged.
3. All **nine** OD-4 fail-open guards are re-derived and **each is demonstrated capable of
   firing**; the anchor-existence controls fail **closed** and are proven to.
4. Attendance has a genuine governed Trainer write path with audit; an absent learner receives no
   report.
5. Evidence media exists: private storage, Trainer-owned, correctly associated to learner, session
   and assessment; Management review-only; **no Parent projection**; never an automatic AI input.
6. A fresh database is enterable through an owner-controlled, fail-closed, auditable, idempotent
   management bootstrap that **no migration auto-grants and no browser client can reach**, and
   Management can then build a complete teaching scenario — modules, sessions, students,
   enrolments, trainer assignments, parent links — through **governed write paths** (A-019,
   A-024 steps 2–6), with the invitation lifecycle working end to end (A-020, A-027).
7. The draft-storage transport is hosted-capable with `report_store_draft` at **zero client
   EXECUTE**, verified by a `proacl`-text assertion proven to fire.
8. All three role UIs are reconstructed against the current `/reference/` authority, with every
   governed omission recorded as `EXPECTED` — **and the two `CLAUDE.md` §6 panels that `/reference/`
   does NOT draw (Class Health Summary, Management Insight, plus "Students Needing Follow-up") are
   built to their literal ratified tables, with no LLM involved.**
9. **Q-27's five acceptance criteria are all discharged.**

**Local acceptance**

10. `tsc`, `lint`, `build` clean; a meaningful `npm test` exists and is honest about its coverage;
    the `.assertions.ts` files are executable or replaced by executable equivalents.
11. The full database, RLS, RPC, lifecycle, concurrency and audit suites pass locally.
12. **C4 is re-proven** under the new contracts, with screenshots and accurately declared carve-outs.
13. Every rule in §12 has a named, passing, firing-proven test.

**Bounded real-provider proof**

14. **G-6 is re-proven** against the final OD-4 AI contract, the final transport and the real
    provider, under per-invocation Operator authorization, with the scope declared honestly —
    local direct connection at P5-T02 and the **pooled hosted transport at P6-T07b**, the latter
    closing the leg the former declares `NOT-RUN`.

**Hosted**

15. A hosted Supabase project exists in a recorded region verified **at creation**, with all
    migrations applied forward-only and the posture re-proven from the live hosted catalogue.
16. Auth is hardened hosted; private Storage's must-fail matrix passes **hosted**; the draft channel
    is proven hosted (**G-AI**); management is bootstrapped; three role identities work.
17. A **publicly accessible** Vercel deployment serves the application with the **AI feature
    functional in the deployed system**, and no application module spawns a container CLI.

**Production UAT**

18. The complete governed lifecycle completes hosted across all three roles, with every isolation,
    privacy and audit control demonstrated firing, recorded in a UAT document that does not
    overclaim.

**Human usability evidence**

19. Real participants, observed behaviour, a findings register — **and documented improvements made
    as a result**, demonstrable on the deployed system. No automated evidence is relabelled as
    human evidence, and a glossary prevents the inference.

**Submission**

20. All six mandatory artefacts exist, plus the Design Workbook / Final Report, the AI-feature
    deliverable, the testing results and the continuity narrative.
21. A **fresh, dated** secret, redaction and third-party-content scan over all four trees returns
    clean — **before** the push.
22. README and deployment instructions let a third party reproduce the documented tier unaided.
23. The repository is pushed to GitHub Classroom under Operator authorization, with the commit
    identity and visibility confirmed.
24. The presentation is rehearsed, the deployment checklist passes, and the deployment approach can
    be explained.
25. **The Operator has submitted.**

**Explicitly OUT of this Definition of Done, declared rather than omitted** (E-12):

- **`CLAUDE.md` §10 Phase 4 — PDPA hardening & operations — is `NOT-RUN`.** That includes **A-007's
  independent, retention-locked external audit mirror**, alerting, and the incident runbook. The
  PDPA *tables* (`consent_records`, `retention_policies`, `erasure_requests`) are legitimately
  deferred under Lock §20.3 and none may be created without an amendment. **The mirror, alerting
  and runbook have no deferral instrument**, so they are declared out of Final MVP scope here,
  pending an Operator ruling — not silently skipped. ADR-6's synthetic-data-only rule is what keeps
  the obligation dormant, and **the moment real child data is loaded, the deferral becomes a
  breach.**
- **Pack 28 (Management Term Report)** — separately governed, out of MVP scope.
- **Teaching Assistant** — deferred under A-014; not a completion gate.
- **Notifications** — `DEFERRED_BY_RATIFIED_DECISION`, with the two U-25 notification surfaces
  blocked pending P0-T09 item 4.
- ~~**Parent evidence projection** — ruled OUT (Lock §8.1); A-001's gates stay armed but unactivated.~~ ✅ **REVERSED 2026-08-12.** `D-5` ruled it IN, `C-1` superseded Lock §8.1, `A-002` places it in **Part 1** (`P1-5`). **A-001's gates are LIVE**; every refusal leg is unchanged, `A-003`'s `unscanned` leg is **`NOT APPLICABLE (C-3)`**, and **`A-004`'s both-direction UAT is HUMAN and the Operator's to run**.

**Anything unmet must be recorded as unmet, with its reason. A gap declared honestly is a result; a
gap papered over is a failure.**

---

## 16. QUICK REFERENCE — WHAT A FRESH SESSION SHOULD DO FIRST

1. Read `CLAUDE.md`, then the Authority Lock and rulings, then this file, then `STATUS.md`, then
   recent `BUILD_NOTES.md`.
2. Verify branch, HEAD, tree, worktrees, remotes, tags, and local/hosted service state **against
   reality**.
3. If they disagree with the records, **stop and reconcile** (§9.3).
4. Find the recorded next task ID in `STATUS.md`. Confirm its phase is authorized — explicitly, or
   by a recorded `STANDING_LOCAL_EXECUTION_AUTHORIZATION` passing all four §7.6-D conditions.
5. Check §7.4 **and §7.4a**: does the task hit a stop condition, and does it serve the app or drive
   a browser? Check §10: what **class** is its gate?
   **A** → continue in-range. **B** → stop and ask. **C** → stop and ask, every time.
6. Execute. Record per §9.2. Commit per §7.5.
7. **Never** push, provision, deploy, spend, or test with humans without a gate in §10 being
   opened for **that specific action, at that time**.

**The one-line rule:** *inside a recorded local range, a `PASS` lets you continue; outside it, or at
any Class B or Class C gate, you stop — and you never write `Accepted` for the Operator.*

---

*End of `FINAL_MVP_EXECUTION_PLAN.md`. This document plans work; it authorizes none of it.*



