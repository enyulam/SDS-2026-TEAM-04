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

## 5. The former app-target blocker — resolved by operator ruling R-C2-5

Until R-C2-5 the disposable runner could not serve the application against the disposable stack. Two binding constraints conflicted:

- R-C2-2's isolation requirement forbids the disposable API port from being `54321`;
- `lib/supabase/public-config.ts` classified a loopback `NEXT_PUBLIC_SUPABASE_URL` as a valid local target **only** on port `54321`, failing `E_PUB_URL_LOCAL_PORT` otherwise.

Widening that pin was an operator decision, not a runner's. **Operator ruling R-C2-5 made it**, and it is deliberately narrow: there are now **exactly two** Supabase runtime profiles and no others.

| Profile | Project | Local API port |
|---|---|---|
| `default` (the value an **absent** profile variable resolves to) | `best-coach-mvp` | `54321` |
| `f17-disposable` | `bc-f17-disposable` | `55421` |

The profile is read from `process.env.BEST_COACH_SUPABASE_RUNTIME_PROFILE` inside `lib/supabase/public-config.ts` — the one place the active target is already classified. It is **not** a `NEXT_PUBLIC_` variable, which is the only thing that would put it into a browser bundle, so it is structurally unreadable and unsettable from the browser and resolves to `default` in any client context. It is a **server-side child-process environment input only**: not a query parameter, cookie, header, request body, form, `localStorage`, `sessionStorage` or UI control.

Each of the ruling's fail-closed cases is a real coded rejection, tested one case per assertion by `scripts/tests/config/run-runtime-profile.mjs` (`npm run test:runtime-profile`):

| Case | Code |
|---|---|
| a disposable URL without the disposable profile active | `E_PUB_DISPOSABLE_PORT_UNAUTHORIZED` |
| a canonical URL while the disposable profile is active | `E_PUB_PROFILE_TARGET_CANONICAL` |
| any local port other than `54321` or `55421` | `E_PUB_URL_LOCAL_PORT` |
| a malformed or unknown profile value (including blank and wrong-case) | `E_PUB_PROFILE_UNKNOWN` |
| any non-loopback hostname while the disposable profile is active | `E_PUB_PROFILE_TARGET_NOT_LOCAL` |
| a hosted `https://*.supabase.co` target while the disposable profile is active | `E_PUB_PROFILE_TARGET_NOT_LOCAL` |
| a linked-project fallback (hosted and non-loopback by construction) while the disposable profile is active | `E_PUB_PROFILE_TARGET_NOT_LOCAL` |

The normal configuration is **not** weakened: with the profile variable absent, a loopback target is still accepted on `54321` and only `54321`, and a hosted `https://*.supabase.co` target is still accepted exactly as before.

**The interactive disposable runner `run-f17-disposable.mjs` is unchanged by R-C2-5.** It still keeps its TTY-only, no-echo, operator-typed password prompts, still records the app-dependent gates `NOT-RUN`, and still serves no application. Serving the application against the disposable stack belongs to a separate autonomous script; this ruling authorizes the configuration that makes it possible, and changes no runner.

## 6. `prove-disposable-app.mjs` — the autonomous app-served proof

`scripts/physical-test/prove-disposable-app.mjs` (`npm run physical-test:f17-app`) provisions the disposable stack, **serves the application against it** with the `f17-disposable` profile set in the **child process environment only**, drives headless Chrome over CDP on port 9418, proves the **live screen 07 → 08 transition** through the real report identifier the server returned, tears everything down, and re-reads the canonical database.

It is a **third autonomous script**, not a runner. `run-f17.mjs` and `run-f17-disposable.mjs` are both byte-untouched by it.

**Authentication — minted sessions, no password.** The three disposable identities are created through the disposable stack's own Auth Admin API **without a `password` field**; sessions are minted admin-side (`generateLink` → `verifyOtp` on a cookie-writing `@supabase/ssr` client). **No password is created, stored, typed or used anywhere on that path** — which is why it needs no TTY, and why it is stronger than a generated password would have been. A structural refusal (`assertDisposableApiTarget`) runs before any admin client is constructed, so the path is incapable of targeting the canonical stack.

**What it decides, and what it deliberately does not:**

| | Gates |
|---|---|
| Decided from positive evidence | G-2, G-5, G-14, G-17, G-18, G-20, G-21, H-1 |
| `NOT-RUN`, admin mint is not a password sign-in | **G-1** — stays owned by the interactive operator runs |
| `NOT-RUN`, no real AI provider is activated (R-C2-5 step 7) | **G-6** |
| `NOT-RUN`, decided elsewhere on its own disposable database | G-4, G-11 |
| `NOT-RUN`, half-decidable — the fixture-mode half is positively satisfied and stated, the concurrency half is not run here | G-19 |
| `NOT-RUN`, the lifecycle beyond 07 → 08 is not driven | G-3, G-7, G-8, G-9, G-10, G-12, G-13, G-15, G-16 |

Its own `A-1 … A-20` ledger carries the environment and lifecycle evidence: isolation, the passwordless identities, the served binding, the live transition and the id read-back, teardown, and the canonical before/during/after readings.
