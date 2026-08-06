# F17 — which runner owns which acceptance gate

**Status:** Shared implementation contract — created 2026-08-06 (Asia/Singapore), Round C2 Phase C2-B.
**Purpose:** Pin, unambiguously, which of the two physical-test runners decides each of the 21 acceptance gates in `docs/plan/PHYSICAL_TEST_SLICE_48H.md` §13, and on which database.

## 0. Precedence

This document is subordinate to every governing document named in `PHYSICAL_TEST_SLICE_48H.md` §0 and can amend none of them. It adds no gate, removes no gate and weakens no gate. It records **ownership** only.

It exists because operator ruling **R-C2-2** split one runner's job across two environments, and an unrecorded split is how a gate ends up owned by nobody and quietly assumed to have passed.

## 1. The two runners

| | `scripts/physical-test/run-f17.mjs` | `scripts/physical-test/run-f17-disposable.mjs` |
|---|---|---|
| Name | **the canonical runner** | **the disposable runner** |
| Database | the canonical fixture database, project `best-coach-mvp` | its own stack, project `bc-f17-disposable` |
| Writes | **none.** No governed write, ever. | the full writable lifecycle, on the disposable stack only |
| Ports | API 54321 / DB 54322 / Studio 54323 / Inbucket 54324; app 3417; CDP 9417 | API 55421 / DB 55422 / Studio 55423 / Inbucket 55424; app 3418; CDP 9418 |
| Identities | the three canonical fixture addresses | three **separate** `@f17-disposable.example.test` addresses, with their own operator-typed passwords |
| Passwords | interactive no-echo TTY only | interactive no-echo TTY only |
| Command | `npm run physical-test:f17` | `node scripts/physical-test/run-f17-disposable.mjs` |

A third script, `scripts/physical-test/prove-disposable-isolation.mjs`, **decides no acceptance gate.** It proves the disposable environment can be provisioned, is isolated, and is completely removed — and it needs no password and no terminal, so it can run autonomously.

**The canonical runner is not deprecated, replaced or weakened by the disposable runner.** It is byte-untouched by Phase C2-B. Its `G-18` gate and its `LIFECYCLE_NOT_RUN` reason are the reason the disposable runner exists at all: a governed write on the canonical database appends an audit event that Step 7H makes permanently uncleanable, which would break the canonical checksum irreversibly.

## 2. Gate ownership

“Owner” means: the runner whose verdict for that gate is the one the checkpoint reads. Where both runners record a verdict, both are real, and both must hold.

| Gate | Owner | Notes |
|---|---|---|
| G-1 Real three-role authentication | **both** | canonical runner against the canonical Auth service; disposable runner against the disposable Auth service with the separate identities |
| G-2 Server-derived role and centre authority | **canonical runner** | needs the served application; the disposable runner records its own instance only if the served application is reachable |
| G-3 Complete Trainer→Management→Parent lifecycle | **disposable runner** | requires governed writes; forbidden on canonical |
| G-4 All nine ratings required | **disposable runner** | requires a governed write |
| G-5 Real observation persistence | **disposable runner** | requires a governed write |
| G-6 Real AI generation and grounding | **disposable runner** | requires a governed write **and** a real provider call — see §4 |
| G-7 Deterministic retry/failure handling | **disposable runner** | requires a governed write |
| G-8 Trainer approval does not publish | **disposable runner** | requires a governed write |
| G-9 Management wording-only enforcement (server-side, UI bypassed) | **disposable runner** | requires a governed write |
| G-10 Substantive changes require return and reapproval | **disposable runner** | requires governed writes |
| G-11 Stale-state and duplicate-action rejection | **both** | canonical runner decides it from the Step 7I concurrency proofs, which already run on their own disposable *database*; disposable runner may decide it in the live lifecycle |
| G-12 Returned and preapproved reports remain parent-invisible | **disposable runner** | requires a governed write |
| G-13 Parent sees only the submitted canonical report | **disposable runner** | requires a submission |
| G-14 Parent isolation and non-disclosing denial | **canonical runner** | decided read-only, with a live parent session, by byte-comparing two denials |
| G-15 Management cannot access preapproval draft content | **disposable runner** | requires a draft to exist |
| G-16 Exactly two ordered state-change audit events | **disposable runner** | the canonical runner can verify only the residue half read-only, and records the other half NOT-RUN |
| G-17 No audit-chain corruption | **both** | each verifies its own database with `public.audit_verify_chain()` |
| G-18 Canonical verifier database remains pristine | **both, differently** | canonical runner: unchanged across its own read-only run. Disposable runner (per R-C2-2): the canonical database has the same verified checksum and zero report/version/audit residue **before and after the disposable lifecycle executes** |
| G-19 Concurrency proofs on the disposable database; fixture mode not used for the primary walkthrough | **both** | canonical runner decides the concurrency half and asserts served pages report the real adapter. Disposable runner must **positively** assert the walkthrough ran against the disposable stack **and** that fixture mode was off — not merely that it was configured off |
| G-20 Typecheck, lint, build | **both** | identical commands, exit codes only |
| G-21 Browser console has no uncaught errors | **canonical runner** | the disposable runner records its own instance only if it can serve the application |
| H-1 Process hygiene | **both** | each verifies the removal of what it itself started |

## 3. Fail-closed discipline, in both runners

Both runners share the same ledger discipline, and it is not decorative:

- a gate is recorded **once**; a second decision is a defect and throws;
- a gate is `PASS`, `FAIL` or `NOT-RUN` — there is no fourth value and no default;
- every gate left undecided when the run ends is stamped `NOT-RUN` with an authored reason by `closeLedger()`, so **a gate that is never reached can never end up PASS**;
- no gate reaches `PASS` without positive evidence that the thing happened. An absent document, an unread value, an empty collector and an unanswered command all produce `FAIL` or an abort, never a verdict reached on evidence that was not collected.

## 4. G-6 — why it cannot pass on anything but a real call

Operator ruling **R-C2-4** ratifies the existing decision (`openai` / `gpt-5.6-terra`, decision D-072, checkpoint CP-1) and forbids reporting G-6 `PASS` on fixture text, hard-coded output, a deterministic fake provider, a cached value, an empty response or an unverified assumption that a call succeeded.

The disposable runner enforces that structurally:

1. The only code path that can reach `PASS` for G-6 is the one that requires the **served application** to have performed the generation. There is no other branch, so no configuration, environment value or argument can reach `PASS` on its own.
2. A configured provider is explicitly **not** treated as a called provider. When `LLM_PROVIDER`, `LLM_MODEL` and `LLM_API_KEY` are all correctly present but no generation ran, the recorded verdict is `NOT-RUN` with exactly that distinction stated.
3. When the ratified selectors are not configured, the recorded reason is an explicit **provider-not-configured** stop.
4. `LLM_API_KEY` is tested for **presence only**. Its value is never assigned, printed, hashed, written or placed in an error.

The evidence a future PASS must carry, for the same reason, is differential rather than existential: two generations from two materially different rating profiles must produce **different** persisted panels, neither may equal any pinned deterministic-fixture panel string, and the report must have reached `draft_ready` through the real `request_draft` path — a path that cancels the draft rather than storing an empty or ungrounded response. A fixture, a cache and a hard-coded string each fail at least one of those independently.

## 5. Open blocker — recorded, not worked around

**The disposable runner cannot currently serve the application against the disposable stack, and therefore cannot decide the gates that need it.**

Two binding constraints conflict:

- R-C2-2's isolation requirement forbids the disposable API port from being `54321`;
- `lib/supabase/public-config.ts` classifies a loopback `NEXT_PUBLIC_SUPABASE_URL` as a valid local target **only** on port `54321`, failing `E_PUB_URL_LOCAL_PORT` otherwise.

Both cannot hold at once. Widening that pin is a change to a committed product control and is an **operator decision**, not a runner's, so the disposable runner detects the conflict, states it once, and records every affected gate `NOT-RUN` with that exact reason. It does not soften the check, does not choose a non-loopback hostname, and does not reuse the canonical port.

Everything that does **not** depend on the served application — provisioning, migration replay, the separate synthetic identities, real three-role authentication against the disposable Auth service, the disposable audit chain, the canonical before/after protection, teardown and hygiene — is unaffected and is decided normally.
