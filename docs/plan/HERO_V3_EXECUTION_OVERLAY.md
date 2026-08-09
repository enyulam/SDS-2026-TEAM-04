# HERO EXECUTION OVERLAY — v3

**Derived and written to disk 2026-08-09** under explicit Operator instruction, from the v2
overlay plus the two in-run scope corrections. **It supersedes v2 in full.** v2 is conversation
history and will be lossily summarised at every compaction; this file is the governing overlay.

> **Instrument class:** procedural planning artefact (`CLAUDE.md` §1). **It authorizes nothing
> that current authority does not already authorize**, creates no product rule and relaxes no
> gate. Where it and a ratified instrument disagree, **the ratified instrument wins**.
> Authority order is unchanged: spec + amendments → Authority Lock and operator rulings →
> `CLAUDE.md` → `docs/plan/` baselines → ratified implementation contract → Figma (lowest).

---

## 0. THE CONSTRAINT

**Demonstration in 48 hours** (recorded 2026-08-09). The demonstration requires the **COMPLETE
hero chain**, ending at a **Parent viewing the submitted read-only report**.

⚠️ **Management and Parent are IN SCOPE.** **No transition in the chain may be mocked.** Real
governed database · real state machine · real audit · real RLS · throughout.

**If forced to choose under time pressure: a governed backend chain proven server-side beats a
polished Trainer UI with no lifecycle behind it.** Do not fake a lifecycle to reach the end of
the scenario.

---

## 1. WHAT v2 GOT WRONG — not merely stale

Recorded because the Operator asked for judgement, not just deletion. **Acting on any of these
today would cause harm, not just waste.**

| v2 content | Why it is WRONG now |
|---|---|
| **"Trainer slice before Management; Management before Parent"** and the three parallel **TRAINER / MANAGEMENT / PARENT HERO TRACKS** | **Expressly disregarded by the Operator.** It would build three UI tracks against an unbuilt backend. v3 sequences **backend across the whole chain first, then UI across the whole chain** (§3). |
| Hero scenario **step 9 — evidence upload** | Contradicts **H-5**, which puts evidence media **OUT of the hero slice**. The scenario runs 1–39 **with step 9 omitted**. Storage buckets, storage policies, evidence tables, evidence RPCs, signed-URL minting and evidence UI are **not created in this window**, and the Step 7H audit registry **stays at 16**. |
| The implicit premise that **grounding is sufficient once a real provider is enabled** | **Measured false.** `B-G06-DET-1`: rule 3 is lexical and matches **only 3 of 18** positive formulations about a `needs_support` dimension. The fixture emits none of that vocabulary, so the hero path is safe — **that bound expires the instant a real provider is enabled.** |
| **"Expected HEAD `16b7710`"**, the expected-phase block, and the **stale worktree block** | Superseded by measurement. Both 48H worktree directories are **absent from disk**; branches remain reachable via `frozen/48h-backend-402b0b6` and `frozen/48h-frontend-6762b5c`; `CLOSED_BY_NONUSE_POLICY` unaffected. |
| **TASK ZERO** (create and index the G-06 ruling) | **DISCHARGED.** `FINAL_MVP_G06_GROUNDING_RULING.md` exists and is indexed. **Do not re-create or re-index it.** |
| The full **G06-1 … G06-8 ratification block** and the **C4/C5/C6/C7/C8 defect list** | **IMPLEMENTED and PROVEN** at `P1-T09` (`prove-g06-grounding.mjs`, 201 checks). Carrying them forward invites re-implementation of shipped work. |

---

## 2. CURRENT STATE AND OPEN GATES

**`G-07` is OPEN — Operator ruling, 2026-08-09.** `CLAUDE.md` §10 **Phase 1 exit conditions
(a), (b) and (c) are demonstrated.** The following are carried **PENDING, not blocking**:

- the **22 unswept harnesses** — `NOT SWEPT — DEFERRED POST-REHEARSAL`, a **recorded**
  disposition under the HERO-FIRST RESEQUENCING RULING, not a novel one;
- suites not re-run in one session;
- **`build`** — ⚠️ **must be green before the automated-green hero checkpoint**;
- **`CLAUDE.md` §3 persona sign-offs.**

**Ratified reporting vocabulary (H-4). Write exactly this, and nothing stronger:**

```
PHASE 1 — IN PROGRESS
HERO-CRITICAL SUBSET — PASS
NON-HERO TASKS — PENDING
```

⛔ **Never write "PHASE 1 COMPLETE". Never write "Operator Accepted"** — `PASS` is a session
evidence verdict; `Accepted` is Operator-set only (§14.1, §15.6, §15.11).

**Open, and not to be resolved autonomously:** `B-C2-1` (`run-c2` order-dependent failure —
**OPEN · UNDIAGNOSED**, linked to hero negative control **K**) · `B-G06-DET-1` (detector
coverage — **OPEN · UNRATIFIED**; **do not widen the lexicon, do not propose a fix**) · rule 4
extended to `developing` · inverse rule 4b · narrowing `DIMENSION_TERMS.audience_awareness`.

---

## 3. SEQUENCING — backend across the whole chain, then UI across the whole chain

⛔ **Do NOT complete the Trainer track before starting Management.**

### STAGE 1 — backend for the ENTIRE chain, end to end

Attendance write path · assessment persistence (nine dimensions, observations) · draft transport
(**R-27: zero client `EXECUTE` on `report_store_draft`, permanently**) · `report_source_map` ·
Trainer approval transition · Management pending read · Management **wording-only** edit ·
Approve & Submit · canonical submitted version · **Parent submitted read with the Q-27 payload
boundary enforced at the projection layer**.

**EXIT:** the full lifecycle proven **server-side, no UI**, real database, **audit chain valid**,
submitted version persisted. **Commit.** ⚠️ **This alone is a demonstrable result if the window
closes.**

### STAGE 2 — thinnest viable UI, in chain order, all three roles

- **Trainer:** session entry → roster → attendance → nine ratings → observations → save →
  request draft → review → edit → approve.
- **Management:** pending list → detail → approve & submit.
- **Parent:** reports list → submitted detail, **OD-4 panels only**.

**Visually thin is ACCEPTABLE. Governance is NOT.** Q-27 binding · Management wording-only
authority binding · **no raw ratings in the Parent payload**.

### STAGE 3 — hero E2E under §7.4a, then `build`, then the checkpoint tag

### Parallelism — DECISION RECORDED: **SEQUENTIAL, from one baseline**

**No role worktrees.** The setup cost — ownership manifest, three worktrees, serialized
validation, three integrations — does not pay back inside 48 hours at this size. v2 itself
states **parallelism is an optimization, not a correctness requirement**, and sequential from a
single baseline is authorized and likely faster here. *(Revisit only if the window widens.)*

---

## 4. CARRIED FORWARD VERBATIM — still in force

### 4.1 Assessment evidence — OUT of the hero slice (H-5)

Evidence media remains a **Final MVP completion requirement** with the **Trainer** as ruled
uploader (Authority Lock §8, §8.1). It is **not** part of the hero slice and **does not gate the
hero lifecycle**. In this window: **no** storage bucket, storage policy, evidence table, evidence
RPC, signed-URL minting or evidence UI. **The Step 7H audit registry stays at 16 strings** —
Amendment 008 / A-057 ratifies `evidence.uploaded` and `evidence.accessed` but **authorizes no
implementation**. Every evidence task is recorded `NON-HERO — PENDING`; none is marked `PASS`;
none is removed from the plan. **Every A-001 / A-003 / A-004 safeguard remains fully in force.**

### 4.2 Authentication in automated runs (H-6)

Fixture passwords may be entered **only** through no-echo interactive stdin at an
Operator-controlled terminal (`CLAUDE.md` §11, absolute). An unattended session **cannot**
perform a real password sign-in.

Browser hero legs authenticate by **ADMIN-MINTED SESSION**
(`auth.admin.generateLink({ type: 'magiclink' })`). **This is authorized.** Every login /
logout / re-login step is recorded as:

```
ADMIN-MINTED SESSION — password sign-in NOT-RUN (Operator credential required)
```

⚠️ **An admin-minted session is NEVER a sign-in proof, a login proof, or evidence that
authentication works. It proves post-authentication behaviour only.**
`prove-disposable-identity-linkage.mjs`'s real `signInWithPassword` leg **stays NOT-RUN** and
must not be weakened or worked around. The real sign-in leg belongs to the Operator's manual
rehearsal.

### 4.3 Hero-path non-negotiables — do not trade any of these for speed

Real PostgreSQL persistence · the current state machine · append-only audit · atomic
transition **+** audit in the same transaction · optimistic concurrency where governed ·
authoritative Trainer assessment re-read · **grounding validation before a draft is trusted or
displayed** · server-only governance writes · RLS / relationship isolation · Trainer-only
assessment facts · **AI drafts only** · Trainer review and approval · Management review **after**
Trainer approval · **Management wording-only** authority · Management cannot change ratings,
attendance, observations, assessment facts, evidence ownership or Trainer notes · **Parent
visibility ONLY after `submitted`** · Parent receives the canonical narrative only · **Parent
receives ZERO raw nine-dimension ratings at the PAYLOAD BOUNDARY, excluded at the projection
layer, never by CSS** · **Q-27 enforced** · evidence never enters the AI prompt · no plaintext
credentials · service-role boundary intact · no fake scan state · no fake human-testing
evidence · **`report_store_draft` keeps ZERO client `EXECUTE`, permanently (R-27)**.

**If the only way to make the demo work appears to require weakening one of these: STOP.**

### 4.4 Real-provider rule

**REAL PROVIDER CALLS: ZERO AUTHORIZED.** Use the deterministic/fixture provider. **Do not infer
authorization from an API key existing in `.env.local`** — a key is a capability, not an
authorization, and neither is a stale environment variable. **Never claim a real-provider proof.**

### 4.5 §7.4a MANDATORY SERVING DISCIPLINE

- **S-1** — Overwrite `LLM_PROVIDER`, `LLM_MODEL`, `LLM_API_KEY` in **every served child
  process** with a **proven-unratified literal**, and **READ THEM BACK**. ⚠️ **NEVER DELETE
  THEM** — `@next/env` silently refills a deleted key from `.env.local`, which is the exact
  mistake that produced the earlier billed run.
- **S-2** — Assert `BEST_COACH_RUN_REAL_PROVIDER_LEG` is **UNSET** before every
  `run-integration.mjs` invocation. Its presence is a **HALT**, not an authorization.
- **S-3** — Arm the outward-call trip-wire. Record any refused attempt as a finding.
- **S-4** — If a task cannot satisfy S-1/S-2, **it is not a local task. Stop.**

**Validation is a GLOBAL MUTEX** — no two suites run concurrently anywhere in the workspace; a
collision produces a **silent false green**.

### 4.6 The false-green rule, as extended

A leg is evidence only if it **EXECUTED**, every selector **MATCHED**, and **no assertion was
vacuous**. An aborted, skipped, zero-match or vacuous leg is **NOT-RUN**, never `PASS`.
**An assertion is evidence only if it has been demonstrated capable of FAILING.** Before
reporting any harness result, confirm no assertion is vacuous by construction: no iteration over
a scalar · no comparison against a hand-transcribed literal where the live source is queryable ·
no check whose subject could be `undefined` without failing. **Prefer re-derivation from the
live catalogue over any transcribed shape.**

### 4.7 The three permitted endings

**A** the complete local hero path is automatically **and** browser verified and ready for the
Operator's manual rehearsal · **B** a genuine non-inheritable hard Operator gate is encountered ·
**C** remaining context is insufficient to safely begin **and finish** the next security-critical
operation. **Do not stop after ordinary tasks merely to report progress.**

### 4.8 H-8 — the handoff artifact

At **every** stop and any checkpoint where control is handed back, also write
`docs/progress/OPERATOR_HANDOFF.md`, **OVERWRITTEN, never appended**, **strictly derived**.
Specification: `FINAL_MVP_G06_GROUNDING_RULING.md` §H-8.

### 4.9 Hard stops that remain

New product/governance semantics · real credentials · destructive canonical reset ·
**`supabase db reset` — never** · real or paid provider call · hosted Supabase · public
deployment · **public tunnel or anything making this machine externally reachable** · remote
creation or push · human participant action · production or real child data · publication or
submission · a plan-invalidating Critical/High finding · **editing ratified authority outside an
explicit bounded per-run instruction**.

---

## 5. NEXT ACTION

**STAGE 1**, per §3. Before writing anything, verify actual state (`CLAUDE.md` §15.3) and
inventory what is already proven — **do not assume a thing is missing because the plan lists
it**. Re-read `CLAUDE.md`, `STATUS.md` and `FINAL_MVP_G06_GROUNDING_RULING.md` from disk after
any context compaction.
