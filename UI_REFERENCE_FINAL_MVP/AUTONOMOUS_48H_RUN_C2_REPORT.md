# AUTONOMOUS 48H — RUN C2 REPORT

**First-draft recovery · disposable F17 harness · UI architecture reconciliation**

- **Run:** C2 (continuation of the 48-hour functional sprint)
- **Date:** 2026-08-06 → 2026-08-07 (Asia/Singapore)
- **Orchestrator:** Opus, effort High. **Every subagent:** Opus, effort Medium, set explicitly on every call.
- **Scope boundary:** this run does **not** begin the final-submission, GitHub-publication or GCP-deployment phase. No remote was added; nothing was pushed.

This report covers the originally-authorized phases **C2-A / C2-B / C2-C / C2-D** *and* the operator-authorized continuation under rulings **R-C2-5**, **R-C2-6** and **R-C2-7**. It is a single issued report, not an addendum, because no Run C2 report had been issued before the continuation was authorized.

---

## 1. Starting baselines

All verified **before** any implementation agent was assigned. No drift of any kind.

| Item | Required | Verified |
|---|---|---|
| Main branch / HEAD | `main` / `629965d…` | `629965d2fa40705e095bf76df55f08fd50c4cba4`, subject `docs(integration): record Run C1 F16 checkpoint and continuity state`, clean |
| Run C1 ancestry | 9 commits ancestors of HEAD | **9/9 confirmed** |
| Backend worktree | `feat/48h-backend` @ `402b0b6f…` | exact, clean |
| Frontend worktree | `feat/48h-frontend` @ `6762b5c5…` | exact, clean |
| Frozen demo | `main` @ `8d4acf4a…`, tag intact | exact, clean; `demo-freeze-step14-2026-07-21` → `8d4acf4a` |
| Accepted screenshots | 12 unchanged | **12/12 SHA-256 match** |
| Route census | 17 | 17 |
| Local Supabase project | `best-coach-mvp` | only stack running; ports loopback |
| Hosted project reference | none active | `supabase/.temp/` holds no `project-ref` |
| Canonical fixture checksum | `6bdff280…ffc576` | **exact**, 28 canonical rows |
| `reports` / `report_versions` / `report_version_ratings` / `audit_events` | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 |
| Auth users | 3 ratified deterministic identities | 3 |

No unexpected Git drift, no screenshot drift, no non-synthetic data, no canonical residue. Nothing was reset, restored, stashed, discarded or rebased at any point in this run.

---

## 2. Operator rulings recorded

All recorded in `AUTONOMOUS_48H_EXECUTION_TRACKER.md` **before** the implementation they govern.

| Ruling | Substance | Tracker |
|---|---|---|
| **R-C2-1** | Report creation belongs to the complete assessment save; atomic; real id returned; client may never fabricate an id | §9 |
| **R-C2-2** | Disposable lifecycle environment mandatory; canonical stays pristine; G-18 defined as checksum + zero residue before/after | §9 |
| **R-C2-3** | Management has one primary Reports destination; Pending/Approved are internal filters | §9 |
| **R-C2-4** | AI completion boundary; G-6 must never PASS on fixture/hard-coded/fake output | §9 |
| **R-C2-5** | Exactly two Supabase runtime profiles; fail closed on everything else; profile not browser-selectable | §10 |
| **R-C2-6** | Parent non-disclosing denial is a blocking Run C2 security fix | §11 |
| **R-C2-7** | A-14 must prove an ordered transition, not a stale final status | §11 |

**A finding on R-C2-4 that changed what this run could attempt:** a ratified provider decision *already existed* in authoritative documents — decision **D-072** ratifies model `gpt-5.6-terra`, checkpoint **CP-1** is recorded *satisfied* with provider `openai` (`docs/plan/PHYSICAL_TEST_SLICE_48H.md:416`, `docs/progress/STATUS.md:112`), and `server/platform/env.ts:22-23` pins both. R-C2-4 therefore permitted use of that decision rather than a provider-selection stop. G-6 was nonetheless never marked PASS — see §14.

---

## 3. First-report design

**One new SQL function, one new migration, no existing migration/RPC/grant/policy/projection changed.**

The atomic boundary is a single `SECURITY DEFINER` plpgsql composer, `public.assessment_save_complete_and_open_report(...)`, called **once** by the server. In one PostgreSQL transaction it:

1. delegates the assessment write verbatim to the ratified `public.assessment_save_observation`;
2. calls the ratified `public.report_create` (arc **T0**, `∅ → incomplete`), catching `BC014` and re-reading the winner's row `FOR UPDATE`;
3. if and only if the report is at `incomplete`, calls `public.report_mark_observation_saved` (arc **T1**, `incomplete → observation_saved`);
4. returns the **real** report id.

It is a **composer, not a new authority**. It walks only already-ratified transition arcs, so no amendment to the fourteen-pair legal transition set was required. It adds no predicate and no privilege: every authorization check and all three write gates belong to the composed functions and are re-derived from `auth.uid()` on each of the three calls. Committed shell: `status = 'observation_saved'`, `lock_version = 2`, `current_cycle_version_id = NULL`, `latest_submitted_version_id = NULL`.

**Escalation containment:** `SET search_path = ''` with every reference schema-qualified; no dynamic SQL; authority is never a parameter (centre, module, enrolment, membership, observation and status are all derived); `EXECUTE` granted to `authenticated` only after an explicit `REVOKE ALL … FROM PUBLIC, anon, service_role, authenticator`. Each property is asserted by the migration's own post-apply assertions.

---

## 4. Transaction and concurrency proof

**Atomicity is genuine, not claimed.** The verifier counted the call sites itself: `saveObservationCore` issues **exactly one** `db.rpc` on the save path (`server/modules/observation/core.ts:119`), and the adapter's former read-back was removed with a static pin forbidding its return. A PostgREST `rpc()` runs the function in one transaction and nested plpgsql calls join it, so the observations upsert, the nine rating rows, the `reports` INSERT, the status advance and both audit rows commit or roll back as one unit. **No atomicity is asserted across two PostgREST round trips anywhere.**

**Concurrency rests on a real database mechanism.** The exclusion is the **pre-existing** `reports_session_student_key UNIQUE (class_session_id, student_id)` — the migration adds no constraint, it *uses* the one already there. There is **no read-then-write window**: the composer never SELECTs `reports` before attempting creation. A loser blocks on the unique index, wakes on the winner's commit, raises `unique_violation` → `BC014`, and the handler resolves into the winner's committed row under `FOR UPDATE`, returning it as an ordinary success with `report_created = false`.

Catching `BC014` is safe because `report_create` performs **all** authorization and **all three** write gates *before* its INSERT — reaching the conflict handler is itself proof of entitlement; an unauthorized caller is refused many statements earlier.

**Measured, both legs:**
- **Leg B (deterministic, advisory-lock ordered, sleep-free):** actor A held an uncommitted `report_create`; actor B's composer blocked on the unique index; A committed; B's inner call raised `BC014`; **B returned exactly A's report id** with `report_created = false`; one row; chain intact.
- **Leg A (interleaving-independent):** exactly one of two simultaneous composer calls committed, the surviving row's id equalled that actor's returned id, the other received an authored code (`BC113` on the recorded run), count = 1.

---

## 5. First-report commits

| SHA | Subject |
|---|---|
| `659dcea47f4ea86e0cbd15d5c267082a60e3355b` | `feat(db): atomic complete-assessment save opens the report shell (R-C2-1)` |
| `07e5a9ea7f0daf7ca0d90e23e299ce6b0b9da2d7` | `feat(trainer): route the first complete assessment to the real report id (R-C2-1)` |

17 files, +2014 / −53. Within the two-commit budget. Subjects deviate from the operator's *suggested* subjects (`feat(workflow)…` / `test(workflow)…`) because the actual split is database-boundary+proofs then server+client wiring; suggested subjects were explicitly suggestions, and the deviation is recorded.

**Disclosed deviations, all self-reported by the writer:**
1. **The design's trap inventory was materially incomplete.** It named 3 files needing census-pin updates; **6 further pins across 4 files** break the moment the migration applies. Constants were moved to the census the migration actually produces; **no assertion was weakened, narrowed, skipped or deleted**.
2. `scripts/tests/step-7i/lifecycle-canonical.sql` appears in commit 1 despite the design's own exclusion list — **census constants only, no test case added**; `run-canonical.mjs` still reproduces the fixture checksum byte-identically twice.
3. Two design defects corrected with evidence (an assertion that was factually wrong against the live catalogue; a commit split that could not have been green).
4. The writer caught **two of its own defects** via the sweep and strengthened the assertions rather than retrying to green.

---

## 6. Independent verifier verdict

**ACCEPT_WITH_FINDINGS.** All 11 sweep commands exit 0 in the verifier's *own* runs.

| Dimension | Verdict |
|---|---|
| Atomicity | **GENUINE** — one `db.rpc`; partial commit impossible |
| Concurrency | **SOUND** — real unique constraint; no interleaving defeats it |
| Non-disclosure | **VERIFIED at the message level** — all four `BC101` raise sites byte-identical; the test compares the entire `SQLSTATE\|MESSAGE` string across unauthenticated / management / parent / wrong-centre / non-existent, all five byte-identical |
| SQL / grants / RLS | No policy added, dropped or altered; `EXECUTE` to `authenticated` only |
| Test honesty | No existing assertion weakened beyond the authorised mechanical census updates |

Findings: 4 × Low, 5 × Informational. None blocking. The Low items are the `lifecycle-canonical.sql` inclusion, the commit split, a concurrency-leg assertion that accepts `BC014` as a loser code (mitigated: leg B proves that branch deterministically), and two audit-chain assertions treating an empty result as verified.

---

## 7. Screen 07 → 08 route proof

**PROVEN LIVE, in a real browser, against a real database.** This began the run as static-only evidence and ended it as a live proof.

Driven in headless Chrome over CDP against the app served on the disposable stack: navigate to the assess route → wait for the instrument itself to report `data-rated-count="9"` (refusing anything less) → type both governed note fields through the native `HTMLTextAreaElement` value setter with a real bubbling `input` event → click the enabled submit control → poll `location.pathname` to a **rejecting** 60 s deadline (no fixed sleep).

**Result:** the browser navigated to `/trainer/reports/<uuid>/generate`, and that id was compared against the id the **disposable database** holds for `(class_session_id, student_id)`: exactly one row, **ids equal**, status `observation_saved`, `lock_version 2`.

**Non-fabrication proven positively (A-15 PASS):** the disposable database held **0** report rows for the pair before the save (the run aborts if not); the pre-save document contained **no** `/trainer/reports/<uuid>/` route anywhere in its `outerHTML`; the id that appeared is a well-formed v4 UUID equal to the committed row's. *A value that existed nowhere the client could read before the save cannot have been constructed by the client.*

**Ordered evidence per R-C2-7 (A-14 PASS):** the report row is polled in the same loop as the pathname and every distinct `(status, on-screen-07?)` reading is appended in order. `openedAtObservationSaved` requires `statusTimeline[0].status === 'observation_saved'` — the **first** status the run ever read. An empty timeline fails; a first reading of `drafting` fails. A second instrument requires the `audit_events` sequence for the report id, ordered by `seq_no`. **A-14 was not broadened** to accept `drafting` without ordering.

---

## 8. Disposable-environment architecture

A **second, complete local Supabase stack** — deliberately not a second database inside the canonical container, because the writable walkthrough needs real Auth sessions and real PostgREST, and sharing canonical Auth would create and delete Auth users *on the canonical stack*, exactly the residue R-C2-2 forbids.

| Aspect | Value |
|---|---|
| Project id | `bc-f17-disposable` |
| Containers | `supabase_{db,kong,auth,rest,studio,pg_meta,inbucket}_bc-f17-disposable` (7; realtime/storage/edge-runtime/analytics disabled — a service not started cannot leak a port) |
| Ports | API 55421, DB 55422, Studio 55423, Inbucket 55424, shadow 55420, app 3418, CDP 9418 — the 554xx band chosen so no digit transposition of a 543xx canonical port can collide |
| Workdir | `os.tmpdir()/best-coach-f17-disposable-<pid>` — **outside the repository**, config generated there, deleted at teardown |
| Migrations | the ten committed files copied and **each SHA-256 verified byte-identical** after copy; never forked, edited or reordered |
| Fixtures/identities | committed `local_fixtures.sql` loaded verbatim; three **separate** synthetic `@f17-disposable.example.test` identities |
| Adapter | real adapter, **fixture mode OFF**, proven from the served DOM |
| Canonical config | `supabase/config.toml` read only, never written; the harness refuses to run if `supabase/.temp/project-ref` exists |

**Runtime profile (R-C2-5):** selector `BEST_COACH_SUPABASE_RUNTIME_PROFILE`, **no `NEXT_PUBLIC_` prefix**, read as a direct (never dynamic) reference in `lib/supabase/public-config.ts`, resolved **before** any target classification. Absent ⇒ `default`, so every existing caller is unchanged. Each rejection carries its own authored code: `E_PUB_PROFILE_UNKNOWN`, `E_PUB_DISPOSABLE_PORT_UNAUTHORIZED`, `E_PUB_PROFILE_TARGET_CANONICAL`, `E_PUB_URL_LOCAL_PORT`, `E_PUB_PROFILE_TARGET_NOT_LOCAL` (which covers hosted *and* linked-project fallback, since a linked project is non-loopback by construction).

**Not browser-selectable — measured, not asserted:** 28 emitted client bundles scanned, **not one** carries a Supabase URL, host, or the public URL variable name; `lib/supabase/browser.ts` is imported by nothing. A committed regression test (**T-P44**) now pins that, and its liveness was proved by a deliberate negative control (importing the browser client made T-P44 fail; the edit was reverted and the tree confirmed clean).

**Runner ownership** is pinned in `docs/plan/F17_RUNNER_GATE_OWNERSHIP.md`: `run-f17.mjs` owns the canonical read-only/auth gates and is **byte-untouched** (`git diff 629965d -- scripts/physical-test/run-f17.mjs` = **0 lines**, verified repeatedly); `run-f17-disposable.mjs` owns the disposable writable lifecycle. Primitives were duplicated (Option B) rather than extracted, because extraction would have had to turn pinned security literals into parameters — a semantic change to a security control.

**No npm dependency was added** (`package-lock.json` untouched).

---

## 9. Disposable commands

| Command | Password? | TTY? | Purpose |
|---|---|---|---|
| `node scripts/physical-test/prove-disposable-isolation.mjs` (`npm run physical-test:f17-isolation`) | none | no | Autonomous isolation + teardown proof, I-1…I-20 |
| `node scripts/physical-test/prove-disposable-app.mjs` (`npm run physical-test:f17-app`) | none | no | Autonomous app-served browser proof, A-1…A-22 + gates |
| `node scripts/physical-test/run-f17-disposable.mjs --preflight-only` | none | no | Read-only preflight; provisions nothing, prompts for nothing |
| `node scripts/physical-test/run-f17-disposable.mjs` | **three, interactive** | **yes** | The one operator command for the writable walkthrough |
| `--help` on all | none | no | Usage, including the exit-code contract |

**Argument refusal verified with credential-shaped arguments** (`--password=hunter2`, `--password "Tr0ub4dor&3-SECRET"`): exit 1, and the rejected argument is **not echoed back**. Non-TTY invocation refuses with exit 1 and provisions nothing.

**Exit-code contract** (added after review): `0` all owned gates proved · `1` a gate failed or the run aborted · `2` nothing failed but owned gates unproved · `130` interrupted.

---

## 10. Isolation and teardown proof

`prove-disposable-isolation.mjs` **really provisions and really tears down** — 20/20 PASS, exit 0. Highlights:

- **I-5** ten committed migrations copied outside the repository, each byte-verified by SHA-256.
- **I-11** the disposable database holds 0 reports, 0 audit events, 0 Auth users — a fresh schema from committed migrations, **not a copy or share** of canonical data.
- **I-12 / I-13 / I-14** every canonical container still running and healthy, all four canonical ports still accepting TCP, and the canonical fixture checksum, census, migration list and Auth id set **identical while the disposable stack was up**.
- **I-17** teardown released every disposable port, proven by **two independent instruments** (refuses connection *and* is re-bindable).
- **I-19** canonical re-read **independently** after teardown: checksum unchanged, residue zero.

Teardown is scoped by a module-level literal project id — `supabase stop --project-id bc-f17-disposable --no-backup`. `--all` is never used. Teardown runs on success, failure, exception and SIGINT, and issues the stop even when `supabase start` fails part-way (via a `startAttempted` flag set *before* the call).

---

## 11. Security-review result

Three independent security reviews across the run. **No Critical. No High.**

| Review | Verdict |
|---|---|
| C2-B harness | ACCEPT_WITH_FINDINGS — *"NO ESCAPE PATH FOUND"* for credentials |
| R-C2-5 config path | ACCEPT_WITH_FINDINGS |
| R-C2-6 parent denial | ACCEPT_WITH_FINDINGS |

**Credential ingress:** the three role passwords have exactly one path — an interactive no-echo TTY, guarded twice. `process.env` is read in only five places across the new files, none a password path; `argv` is read only by the two `parseArgs` functions. No env, argument, file, default or generated password path exists.

**The autonomous browser proof uses no password at all.** Sessions are **admin-minted** against the disposable stack's own Auth Admin API. That is strictly stronger than a generated password because no password exists — and, correctly, **G-1 is not claimed from it** (see §13).

**Open Medium finding (§22, item 3):** a **response-time side channel** still distinguishes "no report for this pair" from "a report exists but you may not read it" at the governed RPC. Bodies, statuses, headers and shapes are identical; elapsed time is not. **R-C2-6 item 6 is therefore not confirmed.**

**Open Low:** at the *raw PostgREST* boundary the unauthenticated case remains distinguishable (HTTP 401 + `WWW-Authenticate: Bearer` + SQLSTATE 42501). It is closed one layer up, at the Server Action.

---

## 12. Gate-honesty review

Four independent false-PASS reviews. **The first one REJECTED the harness, and it was right.**

| Round | Verdict | Consequence |
|---|---|---|
| C2-B initial | **REJECT** | Two High false-PASS findings |
| C2-B after remediation | ACCEPT_WITH_FINDINGS | Both Highs CLOSED |
| R-C2-5 proof | ACCEPT_WITH_FINDINGS | G-14 exposed as unproven |
| R-C2-6/7 remediation | ACCEPT_WITH_FINDINGS | G-14 and A-14 both survive attack |

**The three defects that mattered, all found by review and none by the writers:**

1. **G-17 stamped PASS on an empty audit table.** The canonical runner's guard was lost when primitives were duplicated. Because the lifecycle could not run, this was a **live false PASS on every run**. Now requires four positive measurements together, including `sum(events_checked)` equalling the `audit_events` row count. The re-reviewer executed the runner's exact statements read-only and confirmed the NOT-RUN branch fires on an empty table.
2. **H-1 stamped PASS from unmeasured empty arrays** on the failed-`supabase start` path — failing open exactly where orphaned containers are most likely. `null` now means *not measured* and can never satisfy the gate.
3. **G-14 stamped PASS while both compared denials were the "nothing exists" case.** No report existed for either arm, so parent isolation from an existing foreign report was entirely undecided. Now a seed (`g14-isolation-seed.sql`) drives **three real governed lifecycles to `submitted`** before any arm is captured, and all six pairwise denial comparisons must be byte-identical.

**Ledger mechanism verified sound:** `gate()` rejects unknown ids, rejects a second decision for the same id (so a FAIL can never be overwritten to PASS), and rejects verdicts outside PASS/FAIL/NOT-RUN. `closeLedger()` stamps every unrecorded id NOT-RUN. No rendering path can invent a PASS.

---

## 13. Gates runnable before AI activation

From the final app-served proof (**exit 0**, 22/22 checks PASS, 8 gates PASS, 0 FAIL):

| Gate | Verdict | Evidence |
|---|---|---|
| **G-2** Server-derived role and centre authority | **PASS** | served application, real sessions |
| **G-5** Real observation persistence | **PASS** | marker strings typed in the browser read back verbatim from the disposable database |
| **G-14** Parent isolation, non-disclosing denial | **PASS** | three real submitted reports seeded; all six pairwise denial comparisons byte-identical; positive control renders and differs |
| **G-17** No audit-chain corruption | **PASS** | non-empty audit evidence, `events_checked` reconciled to the row count |
| **G-18** Canonical remains pristine | **PASS** | independent re-read after teardown |
| **G-20** Typecheck / lint / build | **PASS** | all three exit 0 inside the run |
| **G-21** No uncaught browser console errors | **PASS** | measured across visited pages |
| **H-1** Process hygiene | **PASS** | measured post-teardown, not inferred |

Plus, independent of the browser: the whole isolation proof (I-1…I-20), the entire R-C2-5 runtime-profile suite, the C2-A suite including the two-actor concurrency proof, the assessment suite (45 proofs), correction-tracking, static scan, canonical lifecycle and fresh-migration replay.

---

## 14. Gates blocked specifically by the missing real provider

**G-6 — Real AI generation and grounding — NOT-RUN.**

It is written at **exactly one call site**, an **unconditional NOT-RUN**. **There is no G-6 PASS branch implemented at all.** (An earlier build report claimed a PASS branch gated on the served application; that claim was wrong and is corrected here.) Fixture text, a hard-coded string, a fake provider, a cached or replayed response, an empty body, a 200 with no content and a silent fallback are each unreachable for the same structural reason: no code path reads generated content, so none can conclude anything about it.

The evidence contract a future PASS must satisfy is recorded in `F17_RUNNER_GATE_OWNERSHIP.md` §4 and is **differential**: two generations from materially different rating profiles must differ; neither may equal any pinned fixture panel; and the report must reach `draft_ready` through the real `request_draft` path, which cancels rather than stores an ungrounded response.

**Gates that depend on the full lifecycle and therefore remain NOT-RUN:** G-3, G-4, G-7, G-8, G-9, G-10, G-11, G-12, G-13, G-15, G-16, G-19 — each with an authored reason in the ledger, none guessed, none able to become PASS by accident.

**G-1 (real three-role authentication) is NOT-RUN by design.** The autonomous proof authenticates by **admin-minted session**, which is a real Supabase session with real JWT claims exercised through the real app and real RLS — enough for the authenticated browser gates — but it is **not a password sign-in**, so it is not represented as one. G-1 remains owned by the operator's interactive run.

### ⚠️ One unintended external provider call occurred

On an **earlier intermediate run**, before the current control existed, the report reached `drafting` — meaning `requestDraftCore` was entered and the real provider path was exercised. That single execution may have transmitted the real `LLM_API_KEY` to OpenAI.

The root cause is worth recording because the obvious fix failed: the harness originally **deleted** the three LLM selectors from the child environment, but **`@next/env` refills absent keys from the application's own `.env.local`**, silently undoing the deletion. The control is now an **overwrite** with a non-credential literal, so `getServerConfig()` refuses on the provider check before any provider object is constructed. Independently verified as real and structural. No further call has occurred.

The key went to its legitimate, ratified recipient over TLS and was never printed, logged or persisted — so this is not a credential leak. It was, however, an **unauthorized outward-facing action**, and it is recorded here as an operator matter.

---

## 15. UI architecture reconciliation summary

Delivered: **`RUN_C2_UI_ARCHITECTURE_RECONCILIATION.md`** (150 KB) — 48 findings deduplicated from 65 raw across five independent read-only auditors (Trainer, Management, Parent, cross-cutting routing, governance-vs-UI), then verified by a synthesis agent that re-read every cited file for Critical/High rows.

| Severity | Count | | Disposition | Count |
|---|---|---|---|---|
| Critical | 2 | | defect requiring correction | 24 |
| High | 8 | | governance overrides Figma | 8 |
| Medium | 12 | | deferred outside the 48-hour sprint | 8 |
| Low | 12 | | must match Figma | 4 |
| Informational | 14 | | approved compatibility alias | 2 |

**Honesty discipline held:** 8 auditor claims were **rejected** as unverifiable (including Figma-pixel claims where no `reference.png` was opened), 21 items recorded as **undetermined** with the exact resolving action, and four areas recorded as **clean** rather than padded into findings. 12 findings still require operator approval.

**Nothing in the matrix was implemented**, except the separately-authorized screen 07 → 08 transition, which is recorded at C2C-046 as *in flight under Run C2 Phase C2-A* rather than as an open defect.

---

## 16. Major route / navigation discrepancies

| Id | Severity | Finding |
|---|---|---|
| **C2C-001** | High | Management sidebar declares **two** primary Reports destinations where R-C2-3 permits one |
| **C2C-002** | High | Sidebar active-item computation is a **no-op ternary** — both branches identical: two `aria-current` on `/management/reports`, **zero on 8 of 14** canonical portal routes |
| **C2C-004** | High | Management Reports has **no Approved/`submitted` filter and no projection could back one** — after Approve & Submit, no Management surface can show the report just published |
| **C2C-010** | High | **No session-start eligibility anywhere on any Trainer surface** — the trainer completes all nine ratings before `BC017`/`BC104` refuses the save |
| **C2C-012** | High | Post-login sends Management and Parent to **deferred screens 11 and 30** instead of ratified core screens 29 and 32 |
| **C2C-007** | Medium | `/trainer/reports` — the bare canonical route refuses to render |
| **C2C-016** | Medium | Screen 10 breadcrumb sends every report into the correction queue |
| **C2C-018/019** | Medium | Fixture-era copy (*"This fixture…"*, *"immutable fixture version"*) rendered as fact in the participant build |
| **C2C-031** | Medium | `trainer_approved` labelled two different ways inside the Management portal |
| **C2C-023** | Medium | **No sign-out control exists anywhere in the application** |
| **C2C-013** | Medium | The Parent cross-family RLS negative test does not exist |

**Recorded clean, not padded:** C2C-035 (all seven Parent-prohibited classes are **never fetched**, not merely unrendered), C2C-036 (Management governance boundary over assessment substance **holds**), C2C-040 (unsubmitted content unreachable by construction; denial non-disclosing), C2C-048 (queue columns with no governed source correctly withheld).

---

## 17. Centralized Management Reports disposition (R-C2-3)

**The ruling is half satisfied, and the unsatisfied half is one file.**

**Page half — already SATISFIED.** `/management/reports` is a single route whose sub-state comes from an internal filter chip navigating by query parameter onto the same route (`management-reports-queue.tsx:78`, `:167-179`), and a bare `/management/reports` renders correctly on its `trainer_approved` default.

**Sidebar half — VIOLATED.** `components/layout/portal-shell.tsx:69-89` declares two primary Reports destinations ("Pending review", "Corrections"), both carrying `path: "/management/reports"`, and neither labelled "Reports". `:192` reads `const active = item.exact ? pathname === item.path : pathname === item.path` — **both branches identical**. Consequently **two** items go active on the Reports page and **zero** on `/review` and `/edit`, which is exactly what R-C2-3 forbids.

**The fix is three edits in one file, no new route:** collapse the two rail entries to one "Reports" item without `?status=`; make the ternary's branches differ so `exact` becomes load-bearing (`pathname === item.path || pathname.startsWith(item.path + "/")`); derive the mobile header's active state from the same computation. Because `PortalShell`, `ManagementPortalShell` and `ParentPortalShell` are one-line wrappers over a single `RolePortalShell`, the same line-192 repair simultaneously fixes zero-active-item on **eight deep routes across all three portals**. No test pins the current labels, so nothing breaks on the relabel.

**Open half of the ruling.** R-C2-3 names "Pending **and Approved**" as the internal filters. The implementation has **no Approved filter and no projection capable of backing one**. Two auditors disagreed on whether that is a defect; the matrix publishes the disagreement (C2C-004) rather than resolving it. **This needs an operator decision.**

---

## 18. Canonical database before / after proof

**Byte-identical across the entire run**, measured by me independently at the start, after each phase, and at exit.

| Measure | Before (baseline) | After (C2-D exit) |
|---|---|---|
| Fixture SHA-256 | `6bdff280…ffc576` | **`6bdff280…ffc576`** |
| Canonical rows | 28 | **28** |
| `reports` | 0 | **0** |
| `report_versions` | 0 | **0** |
| `report_version_ratings` | 0 | **0** |
| `audit_events` | 0 | **0** |
| `audit_chain_heads` | 0 | **0** |
| `observations` | 1 | **1** |
| `auth.users` | 3 | **3** |
| Applied migrations | 10 (was 9 at baseline) | 10 |

**Not one audit row was ever committed to canonical** — which matters because `audit_events` is `UPDATE`/`DELETE`-blocked by trigger, so a single stray row would have been permanent and unrepairable.

The **only** canonical change is the schema advance from the one committed C2-A migration (9 → 10 applied; 32 → 33 public functions; 24 → 25 functions with `authenticated` EXECUTE). That is required by `verify-fresh-apply.mjs`, which proves canonical is **catalogue-identical to a fresh application of all ten committed migrations**. Fixture data, residue and identities are untouched. **Zero** stray `bc_%`, `%disposable%` or `%scratch%` databases remain.

---

## 19. Tests and exit codes

Final C2-D sweep on `main`, run by me after all agents released the repository:

| Command | Exit |
|---|---|
| `npx tsc --noEmit` | **0** |
| `npm run lint` | **0** |
| `npm run build` | **0** |
| `node scripts/tests/step-7i/static-scan.mjs` | **0** |
| `node scripts/tests/config/run-runtime-profile.mjs` | **0** |
| `node scripts/tests/c2/run-c2.mjs` | **0** |
| `node scripts/tests/assessment/run-assessment.mjs` | **0** |
| `node scripts/tests/step-7i/run-canonical.mjs` | **0** |
| `node scripts/tests/step-7i/verify-fresh-apply.mjs` | **0** |

Also green in agent runs: `run-correction-tracking.mjs` (0), `prove-disposable-isolation.mjs` (0, 20/20), `prove-disposable-app.mjs` (**0**, 22/22 checks, 8 gates PASS, 0 FAIL), `run-f17-disposable.mjs --help` (0) and `--preflight-only` (2, the honest unproved-gates code), `npm run physical-test:f17 -- --preflight-only` (0).

**A pre-existing defect surfaced and was deliberately not patched.** `run-canonical.mjs` failed with `class_sessions_time_order_chk` — because `lifecycle-canonical.sql:1217` derives `ends_at = starts_at + 1 hour` from the current local clock, and between 23:00 and 24:00 Asia/Singapore that wraps past midnight. I reproduced it at 23:51 local. `git diff` over `scripts/tests/step-7i/` is **0 lines**, so it predates all Run C2 work and fires on any branch. The file was **not edited**; the suite was re-run at 00:35 and passes. It needs a deterministic fix (clamp or offset the derived time) — recorded as an open item.

---

## 20. Final Git states

| Repository | Branch | HEAD | Tree |
|---|---|---|---|
| Main MVP | `main` | `4dd701eb66ec9aef3e6727d9848337fa35c8ca51` | **clean** |
| Backend worktree | `feat/48h-backend` | `402b0b6f25828775bcc2a3d30f418b90b898aa80` | **clean, untouched** |
| Frontend worktree | `feat/48h-frontend` | `6762b5c59d41cdeaaaa0bc410a4fe28a1d31cebe` | **clean, untouched** |
| Frozen demo | `main` | `8d4acf4abc5039c24da01be773ab1a5e4916080f` | **clean, tag intact** |

**Ten commits on `main` above `629965d`:**

| # | SHA | Subject |
|---|---|---|
| 1 | `659dcea` | feat(db): atomic complete-assessment save opens the report shell (R-C2-1) |
| 2 | `07e5a9e` | feat(trainer): route the first complete assessment to the real report id (R-C2-1) |
| 3 | `2f23e8b` | feat(physical-test): provision disposable F17 environment (R-C2-2) |
| 4 | `5d57388` | feat(physical-test): run writable lifecycle on disposable stack (R-C2-2/4) |
| 5 | `f74f872` | test(physical-test): prove disposable isolation and teardown (R-C2-2) |
| 6 | `1e7e40c` | fix(physical-test): make disposable F17 gates fail closed on absent evidence |
| 7 | `f0304f3` | fix(physical-test): authorize exact disposable Supabase runtime profile |
| 8 | `3c19197` | test(physical-test): prove the app served against the disposable stack (R-C2-5) |
| 9 | `85d6280` | fix(parent-view): one non-disclosing denial for the canonical read (R-C2-6) |
| 10 | `4dd701e` | test(physical-test): seed G-14's isolation half and prove A-14's order (R-C2-6/7) |

**Exit hygiene:** no app server, no Chrome, no test process; zero disposable containers, volumes, databases or ports; canonical 54321-54324 still serving; **no credential printed or persisted** (all evidence artifacts scanned for JWT-, key- and connection-string-shaped tokens: **zero hits**). No remote configured; nothing pushed.

---

## 21. Exact next operator action

**Run the interactive disposable walkthrough yourself, in a terminal:**

```
node scripts/physical-test/run-f17-disposable.mjs
```

It will prompt three times, hidden, for the Trainer / Management / Parent passwords of the **disposable** synthetic identities (`*@f17-disposable.example.test`) — not the canonical fixture passwords. This is the only path that can decide **G-1**, and it exercises the lifecycle gates the autonomous proof declares it does not decide. Preview it first with `--preflight-only` (no password, no TTY needed, provisions nothing).

Then make **five decisions**, listed in §22.

---

## 22. Remaining blockers before the 48-hour sprint may be marked complete

| # | Blocker | Severity | Owner |
|---|---|---|---|
| 1 | **G-6 — no real AI provider generation has been proved.** R-C2-4 makes this a hard completion gate. The provider is ratified (D-072) and the key is present, but no PASS branch is implemented and no grounded draft has been generated | **Blocking** | Operator + implementation |
| 2 | **G-1 — real three-role password authentication** is unproved; requires your interactive run | **Blocking** | Operator |
| 3 | **Parent denial response-time side channel.** Bodies, statuses, headers and shapes are identical; elapsed time is not, so **R-C2-6 item 6 is not confirmed** | Medium | Operator decision |
| 4 | **Raw PostgREST unauthenticated case** still distinguishable (401 + `WWW-Authenticate` + SQLSTATE 42501); closed only at the Server Action layer | Low | Operator decision |
| 5 | **`assessment_save_observation` complete-save bypass** — the non-atomic predecessor RPC retains `authenticated` EXECUTE and is directly reachable via PostgREST, so a caller bypassing the application can persist a complete assessment **without opening a report shell** | Medium | **OPEN — carried since C2-A** |
| 6 | **`server/db/database.types.ts` not regenerated** — the new RPC is absent from the generated schema types | Low | **OPEN — carried since C2-A** |
| 7 | **`lifecycle-canonical.sql:1217` 23:00-hour time defect** — needs a deterministic clamp/offset | Low | **OPEN** |
| 8 | **Management "Approved" filter does not exist** and no projection could back it (C2C-004); R-C2-3's second half is unimplementable without one | High | **Operator decision required** |
| 9 | **R-C2-3 sidebar fix** not implemented (C2C-001/002) — three edits in one file, deliberately not done because this run was read-only for UI | High | Authorization needed |
| 10 | **No session-start eligibility on any Trainer surface** (C2C-010) — a real flow break | High | Authorization needed |
| 11 | **12 UI findings still require operator approval**; 21 undetermined items need resolution | Mixed | Operator |
| 12 | **One unintended external provider call** occurred before the control existed (§14) | Informational | Operator awareness |

**The final-MVP-submission readiness document has deliberately not been created**, per the run directive.

---

*Produced by the Run C2 main orchestrator, 2026-08-07. Every claim in this report was verified directly or is attributed to the independent reviewer who made it. No credential appears anywhere in this document.*
