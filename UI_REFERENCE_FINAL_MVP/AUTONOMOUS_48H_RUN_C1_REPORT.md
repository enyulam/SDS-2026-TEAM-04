# Autonomous Run C1 — Post-Run-B Backend Acceptance and F16 Real Integration

**Produced by the Run C1 main orchestrator, 2026-08-06 (Asia/Singapore), in the external UI pack, outside every Git repository.**

**No credential appears anywhere in this document. No fixture password was requested, accepted, displayed, logged, saved or transmitted at any point during this run, in either direction.**

This report does **not** rewrite `AUTONOMOUS_48H_RUN_B_FINAL_REPORT.md`. It is the successor record. Where it corrects a Run B statement, it says so and names the evidence.

---

## 0. Verdict up front

**Backend V2 is ACCEPTED.** Every gate Run B recorded as blocked has been executed; the only failure was the stale canonical checksum pin Run B deliberately refused to guess, and it was reconciled by deriving the value from a successful verifier run.

**R-22 is CLOSED.** A governed report-context resolver was implemented, independently verified, and adversarially proven non-disclosing, then merged to `main` without conflict.

**F-16 is IMPLEMENTATION COMPLETE — operator-assisted valid-login proof pending.** Real authentication, server-side route protection on every portal route, the real 23-member adapter, the root route and fixture isolation all landed as four separately-committed subcheckpoints, three of them independently verified before the next began.

**F-17 has NOT been run, and this run did not run it.** It requires three fixture passwords that may only be entered at a no-echo prompt on an operator-controlled terminal. A secure runner was built, hardened twice, and security-reviewed twice; it is ready for the operator.

**Physical-test readiness: NOT READY** — see §23. Three blockers remain, one of which needs an operator ruling rather than an agent decision.

**No fixture password was requested, accepted, displayed, logged, saved or transmitted at any point in this run, in either direction.**

### Terminal state of this run

**RUN C1 PARTIAL — OPERATOR AUDIT REQUIRED.**

This is deliberately **not** `RUN C1 COMPLETE — SECURE F17 OPERATOR WALKTHROUGH READY`, and the distinction is the honest one.

F16 **is** implementation-complete and satisfies every validation gate the directive lists (§11): all four subcommits exist, `main` is clean, TypeScript, ESLint and the production build pass, the route census is recorded at 17, fixtures remain verified, the backend suites are green, the real-auth negative tests pass without any valid password, direct unauthenticated portal access is denied, fixture mode is isolated, the root starter is gone, `RealParticipantPhysicalTestPort` is implemented with all 23 members accounted for, report-version residue is zero, no screenshot changed, and the frozen demo is untouched.

**But the F17 walkthrough cannot yet run end to end**, so calling it "ready" would send the operator into a wall. Two things stand in the way, and neither is the operator simply typing three passwords:

1. **The first-draft dead end (§22 item 3)** breaks the twelve-screen flow at the 07 → 08 transition. A trainer completing a first assessment has no UI path to draft generation. This needs an **operator ruling** on where report creation belongs — the F16-C writer was right to refuse to invent one.
2. **Twelve of the twenty-one gates cannot be decided by the runner as designed (§22 item 2)**, because each needs a governed write whose permanently uncleanable audit event would contradict G-18 on the same database. A disposable-database walkthrough harness is separate, separately-authorized work.

The secure F17 runner **is** ready, twice-reviewed and twice-hardened, and the operator can run it now for the gates it does decide — G-1, G-2, G-11, G-14, G-17, G-18, G-19, G-20, G-21 and H-1. It simply is not the whole physical test.

If the operator judges that items 1 and 2 are out of scope for this checkpoint and that the runner's subset is the intended deliverable, then this run's terminal state can be re-read as `RUN C1 COMPLETE — SECURE F17 OPERATOR WALKTHROUGH READY`. **That is the operator's call, not mine, which is exactly why this ends at OPERATOR AUDIT REQUIRED.**


---

## 1. Starting baselines — verified, no drift

Every value below was read directly, not carried forward.

| Repository | Path | Branch | HEAD | Tree |
|---|---|---|---|---|
| Main MVP | `SDS Project Final (BEST Coach)` | `main` | `68ba4976ba9c5f19e54274a39877c77a854ca2bd` | clean |
| Backend worktree | `worktrees/backend-48h` | `feat/48h-backend` | `ec5be5737fa848f4e4069b359f0344e3a0cc989e` | clean |
| Frontend worktree | `worktrees/frontend-48h` | `feat/48h-frontend` | `6762b5c59d41cdeaaaa0bc410a4fe28a1d31cebe` | clean |
| Frozen demo | `SDS Project Sprint 2` | `main` | `8d4acf4abc5039c24da01be773ab1a5e4916080f` | clean |

**Ratified merge commits, present and in the ratified order:**

1. backend — `0c9fbe4823fd8e94e12826919169ee3fd3a95d38` · `merge(48h): integrate feat/48h-backend into main (Run B Phase 5, merge 1 of 2)`
2. frontend — `68ba4976ba9c5f19e54274a39877c77a854ca2bd` · `merge(48h): integrate feat/48h-frontend into main (Run B Phase 5, merge 2 of 2)`

**Backend V2 commits, all three present:**

| SHA | Subject |
|---|---|
| `e5a66d7906edff0bb3d5007bfac826441af4ef1c` | `feat(backend): rename competency rating vocabulary behind a fail-closed zero-row guard (Amendment 006 A-053)` |
| `103f433f37854de47adc548c02a20668c600cfa0` | `feat(backend): replace bare-word rating leak guard with contextual attribution detection (A-052)` |
| `ec5be5737fa848f4e4069b359f0344e3a0cc989e` | `test(backend): reconcile fixtures, assessment, lifecycle and integration suites to the ratified vocabulary` |

**Frozen demo tag** `demo-freeze-step14-2026-07-21` intact — an annotated tag object dereferencing to `8d4acf4abc5039c24da01be773ab1a5e4916080f`.

### 1.1 Screenshots — 12 of 12 unchanged

Exactly **12** `reference.png` files exist. All twelve SHA-256 values were recomputed and compared as a set against `CORE_SCREENSHOT_VALIDATION_REPORT.md`: **12/12 match, zero drift.**

| Screen | SHA-256 |
|---|---|
| `05-trainer-schedule` | `d2d58b16b1ee2d68123ae87f58bc3aa2e586d2a1df925a84d231990564ff2ceb` |
| `06-trainer-student-roster` | `78e4b618ed154ced8be68f8997903a8fd30e2f99f962ae08a01345e67e13659a` |
| `07-trainer-grade-student` | `1df95a5bacae3c07bf3f0dfd0940f2dcf6637b2e539634baab5498588d13199d` |
| `08-trainer-ai-report-generation` | `3160524f41fc84cd20e7f5bf8f2b9e6a1215354c17faf5b3b31644d54eae20c4` |
| `10-trainer-student-report` | `e64291dc80a2af7378635a3daffe63952899768c41493e8a185da12119b4f730` |
| `19-management-student-report` | `394d8475498602aee27675d8437ee9395316c45da986b5a8f4db46a9ef94e6f0` |
| `29-management-reports` | `eddda3b14c7e34747b237545116a6fb91e356ec3c9155fc7f8f28e00bae54c19` |
| `32-parent-reports` | `90e368c17826bb114173ec5f40f9421eaa33d81aa2032bd0e8a97db01e370aea` |
| `33-parent-class-report` | `2aaeb446065f8360ed6b3804490c7843d96e1e5e534e754ed738c61dd6adea67` |
| `AUTH-01-trainer-login` | `b1ad24e4f414ece90d7a1b091e516a44163f28856e7898a60db288f487a56da1` |
| `AUTH-02-management-login` | `fcc3db9377a1b1175984bc90732c588e58bd05269d767af2ee69ed8d42668483` |
| `AUTH-03-parent-login` | `fcd4d4edcebadd20d6ebca43b181538631fe791fab06007a389120f56853b85c` |

### 1.2 Environment — local-only, synthetic-only

- **No unexpected modified, staged or untracked path in any of the four repositories** — `git status --porcelain` was empty in all four.
- **Local Supabase stack is local-only.** Ten containers under project `best-coach-mvp`; every published port is loopback (`54321` API/Kong, `54322` DB, `54323` Studio, `54324` Inbucket). `supabase/config.toml` pins `api_url = "http://127.0.0.1"`.
- **No remote Supabase project reference is active.** `supabase/.temp/` contains no `project-ref`; the project is not linked.
- **No non-synthetic data.** All three identities use the RFC 6761 reserved `.test` TLD (`management.fixture@example.test`, `trainer.fixture@example.test`, `parent.fixture@example.test`), which cannot resolve to a real mailbox. The single student is `Fixture Student One`; the single centre is `iSpeak Academy`.

**No drift was found. No reset, restore, stash, discard or rebase was performed at any point in this run.**

---

## 2. Fixture-reload verification — independently reproduced

The operator ran `npm run fixtures:local -- --reload` interactively before this run began. **I did not run it, did not need a password, and never handled one.**

Verification method: the reload state was reproduced **through the loader's own channel** — `scripts/fixtures/verify-local-fixtures.sql` executed via `docker exec -i supabase_db_best-coach-mvp psql …` (local socket trust, no password passed anywhere), with the canonical region extracted between the two sentinels and hashed in Node with `crypto.createHash('sha256')`, exactly as `load-local-fixtures.mjs:782-802` does. This is an independent reproduction, not a re-reading of the operator's report.

| Claim | Required | Observed | Result |
|---|---|---|---|
| Auth-user count | 3 | 3 | ✅ |
| Deterministic Auth UUIDs | ratified | `d0000000-0000-4000-8000-000000000001` management · `…0002` trainer · `…0003` parent | ✅ |
| `public.accounts` count | 3 | 3, each bound to its ratified `auth_user_id` | ✅ |
| Role memberships | 1 each, active, one centre | management / trainer / parent, all `active`, all centre `b0000000-…-000000000001` | ✅ |
| Application-domain rows | 25 | 25 | ✅ |
| Canonical rows | 28 | 28 | ✅ |
| Canonical fixture SHA-256 | `6bdff280e550503d212832c2fd1099ac45880c2bc430bfdff8f92a3b35ffc576` | identical | ✅ |
| `report_versions` | 0 | 0 | ✅ |
| `report_version_ratings` | 0 | 0 | ✅ |
| Competency enum | `beginning, developing, mastering, mastered` | exactly that, in `enumsortorder` | ✅ |
| Class Grade | `beginner, intermediate, advanced` | exactly that, unchanged | ✅ |

`verify-local-fixtures.sql` itself exited **0**, meaning all Section A positive assertions passed, all Section C negative tests were correctly rejected, and Section D proved the rollback left no residue.

**Domain-row arithmetic (25).** `accounts` 3 · `centre_memberships` 3 · `trainer_profiles` 1 · `parent_profiles` 1 · `students` 1 · `parent_student_links` 1 · `class_modules` 1 · `class_sessions` 1 · `enrolments` 1 · `class_session_assignments` 1 · `attendance` 1 · `observations` 1 · `observation_ratings` 9 = **25**. The remaining 13 non-zero rows are schema-seeded reference data (`centres` 1, `class_grades` 3, `assessment_dimensions` 9) and are correctly outside the domain count. Applied migrations at this point: **8**.

**Credential handling.** No password was requested, displayed, logged, saved or transmitted. Nothing in this workspace persists one: not a file, not an environment variable, not a log, not an evidence pack, not a tracker, not a message. `auth.sessions` was 0 and `auth.identities` was 3 — no session material was created by this verification.

**R-27 is resolved.** It no longer blocks Backend V2 acceptance, F16 or F17.

---

## 3. Backend V2 final acceptance — every gate executed

All gates run from the backend worktree at `ec5be573`. Run B recorded the fixture-dependent gates as BLOCKED; they are now executed.

| # | Gate | Command | Exit |
|---|---|---|---|
| 1 | Step 7I static scan | `node scripts/tests/step-7i/static-scan.mjs` | **0** |
| 2 | Assessment static | `node scripts/tests/assessment/asm-static.mjs` | **0** |
| 3 | Correction-tracking static | `node scripts/tests/correction-tracking/ct-static.mjs` | **0** |
| 4 | Fresh migration application / replay | `node scripts/tests/step-7i/verify-fresh-apply.mjs` | **0** |
| 5 | Canonical dual run + checksum reproduction + local fixture verification | `node scripts/tests/step-7i/run-canonical.mjs` | **1 → 0** after the bounded fix (§4) |
| 6 | Assessment suite | `node scripts/tests/assessment/run-assessment.mjs` | **0** — 45 T-ASM proofs |
| 7 | Correction-tracking suite | `node scripts/tests/correction-tracking/run-correction-tracking.mjs` | **0** — 19 proofs |
| 8 | Step 7I concurrency R(C) | `node scripts/tests/step-7i/run-concurrency.mjs` | **0** — all six two-actor pairings |
| 9 | Integration suite Parts 1 + 2 + 3 | `node --import ./scripts/tests/integration/alias-loader.mjs scripts/tests/integration/run-integration.mjs` | **0** |
| 10 | TypeScript | `npx tsc --noEmit` | **0** |
| 11 | ESLint | `npm run lint` | **0** |

**Parts 2 and 3 both executed.** `run-integration.mjs` has no part-selection flag: Part 1 always runs; Part 2 runs against the canonical database and returns a handle only if it can establish three real sessions from the ratified Auth identities; Part 3 runs **only if Part 2 succeeded**. Part 3 ran, which is itself proof that the three fixture Auth identities exist with their ratified UUIDs. Part 2 established those sessions via the Auth Admin magiclink → `verifyOtp` path — **no password was handled**.

### 3.1 The specific properties required

| Property | State | Evidence |
|---|---|---|
| Amendment 006 labels exercised, not merely mentioned | ✅ | `beginning/developing/mastering/mastered` appear as live values in `lifecycle-canonical.sql` (7/7/30/9), `run-integration.mjs` (10/5/10/9), `asm-suite.sql` (4/4/9/4), `run-assessment.mjs` (3/4/4/3), `verify-local-fixtures.sql` (7/4/5/7), `local_fixtures.sql` (5/2/3/5). Every surviving old-vocabulary occurrence was audited and is benign: comments, Class Grade `advanced` (which A-054 mandates stays), and the **deliberate** retention of the old labels inside `asm-suite.sql:999`'s audit-payload leak regex so stale payloads still trip it. No test asserts against a dead enum label. |
| Fail-open polarity defect remains fixed | ✅ | `run-integration.mjs:259-267` **INT-G0**, a fail-closed precondition proving every fixture rating resolves to a live `POLARITY_BANDS` member *before* any grounding proof runs; plus `:297-300` INT-G3 now requires the rejection to come from the **polarity** rule specifically, closing the second fail-open route where a green could be an attribution-rule accident. |
| Ordinary-prose and contextual-attribution tests assert meaningfully | ✅ | **INT-G4** (`:303-311`) drives the real `validateGrounding` and asserts on the *reason string* (`"attributed to the student"`), so a rejection by any other rule fails the test. **INT-G6** (`:313-324`) is adversarially constructed: two sentences embed all three label words in legal English, with ratings chosen (`body=mastered`, `sentence_flow=mastering`) so the polarity rule cannot fire either — isolating the false-positive property. Together they form a genuine two-sided pin; neither is trivially satisfiable. Neither is a stub. |
| RLS negative — Management cross-centre | ✅ **PRESENT, twice** | `lifecycle-canonical.sql:3011-3027` (`FAIL T7I-26: WRONG-CENTRE management read the canonical report` + `… reached RPC-15`) and `ct-suite.sql:401-446` (unrelated-centre and deactivated-membership legs). |
| RLS negative — Parent cross-child | ⚠️ **ABSENT as literally specified** — see §17 | The ratified Step 7F fixture contains **exactly one student**, so no parent-linked-to-A-reads-B test can exist against it. The nearest surviving proofs are the **unlinked-parent** negative (`lifecycle-canonical.sql:2989-2995`, `FAIL T7I-26: an UNLINKED parent read the canonical report`), the cross-centre link write-rejection (`verify-local-fixtures.sql:1111-1128` `FAIL N3`), and `run-integration.mjs:389-391` INT-A3. This is a **fixture-shape limitation, not a code defect**, and it is recorded rather than papered over. |
| Application-role audit-denial | ✅ | `lifecycle-canonical.sql:415-458`, the `SET LOCAL ROLE authenticated` block: `FAIL T7I-4: report_store_draft as authenticated gave %, expected 42501`, plus the two hash functions, `app_parent_reaches_student`, and DML legs T7I-52 / T7I-18 / T7I-3. Catalogue analogue `run-integration.mjs:419-422` INT-A6 (42501 for all three real JWTs). **Narrow gap recorded:** no test attempts INSERT/UPDATE/DELETE on `public.audit_events` *itself* under the `authenticated` role — the denial is proven for the report family, not for the audit tables under the application role. |
| Report-content-hash | ✅ | `lifecycle-canonical.sql:628-648` — determinism, NULL≠empty distinguishability, domain separation from the wording hash; constraint existence at `:304-307`; leakage negatives at `:490-497`, `:542` (`FAIL T7I-39: RPC-13 leaks content_hash or revision_number`). |
| Wording-hash | ✅ | Same block: role denial `:432-433`, required exposure `FAIL T7I-39: RPC-15 does not expose wording_hash` `:502-503`, domain separation `:647-648`, CAS enforcement via `expectedWordingHash` in `run-integration.mjs:626,776`. |
| Correction-tracking tests | ✅ | `run-correction-tracking.mjs` exit 0 — 19 proofs including T-CT-11 (during an open correction the parent still reads the previous canonical submitted version and reaches no correction metadata at all). |
| AI-grounding (A-052) | ✅ | Part 1 INT-G0…INT-G6 against `server/modules/ai-drafting/grounding.ts:54`. |
| Audit-payload privacy | ✅ **two independent proofs** | `lifecycle-canonical.sql:3264-3330` T7I-62 (six-generic-label allow-list; needle sweep over student name, every `display_name`, every `normalized_email`, the correction reason; email-regex sweep) and `asm-suite.sql:987-1005` T-ASM-34 (exact six-key inventory, prose/chip/rating/PII regex, generic-label check). Plus `lifecycle-canonical.sql:2196-2212` T7I-53. |
| Generated database-type reproducibility | ✅ | `npx --no-install supabase gen types typescript --local` re-run after the C2 migration and diffed against the committed file; the only delta is the new resolver entry. Never hand-edited (ADR-8). |
| Fresh migration application | ✅ | `verify-fresh-apply.mjs` exit 0 — all migrations apply cleanly, in order, from a database with no project objects, and the fixture database is **catalogue-identical** to a fresh application. |

### 3.2 Report-version residue

**Zero, before and after.** `run-correction-tracking.mjs` prints its own canonical census after teardown: `reports|versions|corrections|events|heads|auth|migrations = 0|0|0|0|0|3|8`.

No suite leaves a canonical report version behind. The canonical database is written by **nothing**: `lifecycle-canonical.sql` contains **65 `ROLLBACK` statements and no `COMMIT`** — every test is a rolled-back decoy, and where a block must survive its own internal failure it raises a `BCRBK` sentinel rather than committing. The suites that genuinely do commit (`run-assessment` 7 events, `run-correction-tracking` 16, `run-concurrency` 62, `run-integration` Part 3 16) each operate on a **disposable** database (`bc_asm`, `bc_ct`, `bc_7i_conc`, `bc_b2`) that is `DROP DATABASE`'d in a teardown that also runs on the abort path. Part 2 is asserted strictly read-only against canonical.

Final canonical state after the entire run: `report_versions` = **0**, `report_version_ratings` = **0**.

---

## 4. Canonical checksum result

Run B §8.7 recorded the pin at `run-canonical.mjs:36` as stale and **deliberately declined to guess it**, on the grounds that inventing a checksum would be worse than leaving a known-stale pin. That judgement was correct.

The value was **derived by running the verifier**, never precomputed from source:

```
FAIL the canonical fixture checksum is 6bdff280e550503d212832c2fd1099ac45880c2bc430bfdff8f92a3b35ffc576,
     expected d6a314b40bb5eb1bc3169097e2a9cb03858791498ca5137a43050cee36b87517
```

| | Value |
|---|---|
| Superseded pin | `d6a314b40bb5eb1bc3169097e2a9cb03858791498ca5137a43050cee36b87517` |
| Reconciled pin | `6bdff280e550503d212832c2fd1099ac45880c2bc430bfdff8f92a3b35ffc576` |
| Canonical rows | **28 — unchanged** |

**Why it moved:** the Amendment 006 rename rewrote three `observation_ratings` labels inside the canonical region (`secure`→`mastering`, `emerging`→`beginning`, `advanced`→`mastered`). **Label text only.** No fixture row was added, removed or reordered — which is exactly why the row count is unchanged at 28.

The value was reproduced **three times independently**: by me during Phase C1 verification, by the backend implementer (`PASS canonical fixture checksum -- 28 rows, … reproduced identically on two runs`), and by the independent backend verifier. It also matches the operator's reported reload value.

The correction touched **only** the assertion constant and its adjacent comment block. `git diff ec5be57..dce8737 -- scripts/tests/step-7i/run-canonical.mjs` is a single hunk; `CANONICAL_BEGIN`/`CANONICAL_END` and every other line are untouched, and no other test file is in that commit.

---

## 5. Backend resolver — design and tests

### 5.1 The defect (R-22)

`lib/frontend/physical-test-port.ts` declares three reads keyed by a **report identifier** — `getTrainerWorkingReport(reportId)` (line 62), `getDraftGenerationContext(reportId)` (65) and `getManagementReview(reportId)` (77). The governed RPCs they must resolve through, `public.report_get_working` and `public.report_get_management_review`, are keyed `(p_class_session_id, p_student_id)`. **No server-side resolver existed.** The fixture satisfied the single-argument shape, so the mismatch was invisible until the real adapter was composed. Treating it as a frontend cast would fabricate a key, which is prohibited.

### 5.2 Why the resolution is total

`public.reports` carries **both** columns and constrains them together:

```
reports_pkey                 PRIMARY KEY (id)
reports_session_student_key  UNIQUE (class_session_id, student_id)
```

So `reportId → (class_session_id, student_id)` is a **well-defined, total, single-row lookup**. The map already existed in the schema; only the governed accessor was missing.

### 5.3 The design

`supabase/migrations/20260806190000_report_context_resolver.sql` creates **exactly one function and nothing else** — no table, enum, column, constraint, index, policy, trigger, view, table grant or DML, and no `CREATE OR REPLACE` of anything existing.

```sql
public.report_resolve_context(p_report_id uuid)
  RETURNS TABLE (class_session_id uuid, student_id uuid)
  LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
```

Body, in order: resolve the caller via `app_current_account_id()` → load the report row by primary key → resolve the caller's **single active membership in that report's own centre** (the `array_agg` + `HAVING count(*) = 1` fail-closed idiom `report_get_canonical` already uses) → role dispatch → return the pair.

**Role dispatch mirrors `report_get_canonical`, with one deliberate difference and one deliberate addition:**

| Role | Predicate | Rationale |
|---|---|---|
| trainer | `app_trainer_reaches_session(report's session)` | identical to RPC-13 and RPC-14 |
| management | permitted — the single active management membership of that centre **is** the predicate; **no status gate** | management correction tracking legitimately surfaces reports at `draft_ready` and `needs_edit`, and those rows carry a report id that must be resolvable. RPC-15's own zero-row posture at those statuses is **untouched**, so resolving the pair discloses nothing gated — the gate stays on the **content** read, where it always was. |
| parent | `app_parent_reaches_student(report's student)` **AND** `latest_submitted_version_id IS NOT NULL` | **stricter than the mirror.** RPC-13 resolves content exclusively through that pointer; without the second conjunct a parent could learn the existence and session of a report that has never been submitted. Nothing about an unsubmitted report is parent-facing. |
| any other | return zero rows | no branch defaults to permit |

**Every requirement in the directive is met:**

- **No frontend cast, no fabricated key** — the only parameter is the governed report identifier.
- **No trusted client-supplied centre, session or student identifier** — there is no such parameter; the pair is read from the report row and the centre comes from the report, never the request.
- **Resolution is server-side from the governed report identifier and current authenticated membership** — `auth.uid()` on every call.
- **Cross-centre and cross-role access fails non-disclosingly** — every denial is a bare `RETURN`. The body contains **no `RAISE` at all**, so "no such report", "another centre", "wrong role", "parent, never submitted" and "membership inactive" are one byte-identical zero-row answer. It cannot be used as an existence oracle.
- **Management receives no protected assessment substance; Parent receives submitted canonical narrative only; no raw rating or observation payload enters either projection** — structurally guaranteed: the return type is **two uuid columns**. There is no column for a status, lock_version, version id, content or wording hash, revision number, timestamp, rating, observation, chip, checklist, approval, correction metadata, panel — or even the centre id, which the body resolves internally and deliberately does not project. These are *unrepresentable*, not filtered.
- **Migration is the source of truth** — the RPC exists only in the migration.
- **Service-role access remains server-only** — `REVOKE ALL … FROM PUBLIC, anon, service_role, authenticator`, then `GRANT EXECUTE … TO authenticated` only, signature-qualified.
- **Generated types regenerated, never hand-edited** — `npx --no-install supabase gen types typescript --local`, +7 lines, in alphabetical position.
- **No existing lifecycle transition changed** — `git diff ec5be57..HEAD -- supabase/migrations/` shows **only** the new file.

It **grants no new reach**: every predicate it applies is one the downstream RPC re-proves independently. Removing it would cost no caller access to any fact they are entitled to — only the ability to name that fact by report id.

The migration additionally carries a `postgres`-only guard, a pre-change precondition block (31-function census, the three required helpers, the pair-keyed signatures still pair-keyed, the name free) and **ten catalogue-derived post-apply assertions X1–X10** covering the object inventory, the function's exact posture, the exact projection, a forbidden-field blocklist, the EXECUTE census, and the absence of RAISE/dynamic SQL/DML.

### 5.4 Census move — authorized and reconciled

| | Before | After |
|---|---|---|
| Tables | 26 | 26 |
| **Functions** | **31** | **32** |
| Enums | 12 | 12 |
| Policies | 29 | 29 |
| **Migrations** | **8** | **9** |
| **`authenticated` EXECUTE** | **23** | **24** |

Pins reconciled in seven files: `verify-fresh-apply.mjs` (file count, packed census string, pass message, **and an already-stale header comment that claimed 28 functions / 20 EXECUTE against a live 31 / 23**), `static-scan.mjs`, `ct-static.mjs`, `lifecycle-canonical.sql`, `asm-suite.sql`, `ct-suite.sql`, `verify-local-fixtures.sql`. One pin (`verify-local-fixtures.sql` D5) was found only when `run-canonical.mjs` went red on it — reported plainly rather than quietly fixed.

### 5.5 Tests

**Static** — a new leg `T7I-R22` in `static-scan.mjs` with five sub-assertions: exactly one function and no other object; DEFINER + STABLE + plpgsql + empty `search_path`; signature-qualified REVOKE-before-GRANT with `authenticated` the only grantee and none of the four forbidden ones; the exact two-identifier signature plus a forbidden-column blocklist; no RAISE and no DML in the body.

**Runtime** — `INT-R0` (Part 2, read-only on canonical): an unknown report id returns zero rows and no error for all three real-JWT roles, byte-identical across roles and across two ghost UUIDs. `INT-R1`–`INT-R6` (Part 3, disposable): the assigned trainer resolves the correct pair with a shape of exactly two columns; same-centre management resolves it **while RPC-15's gate is proven still shut**; the linked parent gets zero rows before submission and the correct pair after; an unauthenticated caller and a trainer with a withdrawn assignment both get zero rows (reach restored on reinstatement); wrong-centre management gets zero rows via the T7I-26 decoy-centre idiom.

`verify-local-fixtures.sql` A35 also gained a per-function contract check and an exact-projection check for the resolver.

### 5.6 Independent verification — PASS

An independent backend verifier that did not write the code re-executed **all eleven** gates (every one exit 0), replayed migrations from empty, re-derived the checksum, read the SQL line by line, and produced **its own** adversarial denial proof on a throwaway disposable clone driven through `SET request.jwt.claims`:

```
P0  CONTROL assigned trainer                rows=1  c5000000-…001/c2000000-…001
P1  trainer NOT assigned to the session     rows=0
P2  management of a DIFFERENT centre        rows=0
P2b CONTROL management of the SAME centre   rows=1
P3  parent NOT linked to the student        rows=0
P4  LINKED parent, never submitted          rows=0
P4b CONTROL linked parent AFTER submission  rows=1
P5  UNAUTHENTICATED (no claims)             rows=0
P6  UNKNOWN report uuid (entitled trainer)  rows=0
P7  DEACTIVATED trainer membership          rows=0
```

All six denials returned the identical literal `[]` — same payload, no error, no SQLSTATE. `psql` ran with `ON_ERROR_STOP on` and exited 0, so no denial path raised anything. The three positive controls prove the probes are live and each predicate is load-bearing; **P4b in particular proves the parent denial at P4 was the live `latest_submitted_version_id` predicate, not a blanket role rule** — the same parent and the same report id resolve once a submitted version exists.

Runtime grant enforcement was also confirmed: `SET ROLE anon` / `service_role` / `authenticator` → `ERROR: permission denied for function report_resolve_context`; `SET ROLE authenticated` → 0 rows, no error. `PROACL` holds exactly two entries. Live census confirmed 32 functions / 24 `authenticated` EXECUTE / 0 for anon, service_role, authenticator and PUBLIC.

**Verdict: PASS. No Critical, High or Medium defect.** Three Low observations were recorded — the management no-status-gate widening (reasoned, bounded to the caller's own centre, requires already holding an unguessable report uuid, and RPC-15's gate verified untouched), a provenance caveat since resolved by re-execution, and the pre-existing stale header comment now corrected. The verifier also confirmed the moved pins **strengthened** the gates: no assertion was deleted or loosened, and `T7I-R22` is new.

The verifier stated as **unverified** (not assumed): the frontend content claims in the backend workstream log (SHAs confirmed to resolve to real commit objects, content not inspected — the frontend worktree is out of its scope); the fixture reload path itself (not run, per the credential rules); and the HTTP/PostgREST transport (its role testing used `psql` with `SET request.jwt.claims`, matching the repo's own harness).

---

## 6. Backend continuation commits

| SHA | Subject |
|---|---|
| `dce873707efe2c81d3a27a3839fdb4105ca01af8` | `test(backend): reconcile post-vocabulary canonical proof` |
| `e75b922d42374f77c79549c3058d68edde450870` | `feat(backend): add governed report context resolver` |
| `402b0b6f25828775bcc2a3d30f418b90b898aa80` | `test(backend): verify report context resolution boundaries` |

Three commits on `feat/48h-backend`, parent chain `ec5be57 ← dce8737 ← e75b922 ← 402b0b6`. Within the "no more than two bounded commits" limit for C2 (two), plus the one bounded C1 commit. **No empty commit was created.** The full range touches 13 files, all under `docs/`, `scripts/`, `server/` and `supabase/` — **no frontend path, no `app/` path**.

---

## 7. Backend-to-main merge

**Merge commit: `70a04be737d22744ee1fa7ee91e7867c5a4bbc01`**
`merge(48h): integrate Run C1 backend continuation into main (checksum reconcile + governed report context resolver)`

Ordinary non-destructive `--no-ff` merge. **No rebase. No conflict.** Both trees were confirmed clean immediately before. 13 files changed, 1193 insertions, 47 deletions; two new files (`server/modules/report-workflow/context-resolver.ts`, the resolver migration). **The frontend worktree was not touched.**

### 7.1 Verification of `main` after the merge

| Gate | Exit |
|---|---|
| `npx tsc --noEmit` | **0** |
| `npm run lint` | **0** |
| `npm run build` (production) | **0** |
| `node scripts/tests/step-7i/verify-fresh-apply.mjs` (migration replay) | **0** |
| `node scripts/tests/correction-tracking/ct-static.mjs` | **0** |
| `node scripts/tests/assessment/asm-static.mjs` | **0** |
| `node --import ./scripts/tests/integration/alias-loader.mjs scripts/tests/integration/run-integration.mjs` (fixture verification + Parts 1-3) | **0** |
| `node scripts/tests/step-7i/static-scan.mjs` | **1** — see §7.2 |
| `node scripts/tests/step-7i/run-canonical.mjs` | **1** — same single cause |

### 7.2 A pre-existing red gate on `main`, discovered — not caused by this merge

```
FAIL T7I-40: lib/frontend/fixtures/physical-test-fixture.ts assigns a report status in TypeScript
```

`run-canonical.mjs` fails for this one reason only, because it invokes the static scan.

**Proof that it predates this merge**, established by reading the tree at `68ba4976` without modifying anything:

- the scan rule already walked `lib/` at `68ba497` — `git show 68ba497:scripts/tests/step-7i/static-scan.mjs` line 355 `const allAppFiles = [...serverFiles, ...walk(join(ROOT, 'app')), ...walk(join(ROOT, 'lib'))]` and line 382 the same `fail('T7I-40', …)`;
- the six offending assignments already existed at `68ba497` — `git show 68ba497:lib/frontend/fixtures/physical-test-fixture.ts` lines 959, 1027, 1118, 1195, 1310, 1352.

**Why nobody saw it.** Run B ran `static-scan.mjs` after **merge 1** (backend on main), where it passed — the frontend fixture did not yet exist on that tree. After **merge 2** (frontend on main), Run B §7.2 verified only `tsc`, `eslint`, `npm run build` and the browser smokes. The scan was never re-run on the fully merged tree, so the gate went red silently at `68ba497` and stayed red.

This is a genuine finding about `main`, recorded here rather than quietly repaired. Its disposition is F16-C, §10.

---

---

## 8. F16 subcommits

All four landed on `main`, each separately committed and — for A, B and C — **independently verified by an agent that did not write it, before the next began**.

| Subcheckpoint | SHA | Subject | Verifier verdict |
|---|---|---|---|
| **F16-A** | `a649c47186b9e94c30da042df4592b23eeb830e3` | `feat(integration): wire real authentication and root routing` | **PASS** — 12/12 checks, 0 Critical, 0 High |
| **F16-B** | `b4aaa8935932ed6ec8f246ad3b5ae6580dc7b3bd` | `feat(integration): enforce server-side portal authorization` | **PASS** — 0 Critical, 0 High |
| **F16-C** | `ad451af` | `feat(integration): connect governed physical-test adapter` | **PASS** — 0 Critical, 0 High, 3 non-blocking defects |
| **F16-D** | `e84371b` | `test(integration): prove authenticated route boundaries` | the suite is itself the verification — 25/25 assertions PASS |

F16-D was gated on tracked changes existing; it added one 986-line file and **no dependency**.

---

## 9. Authentication state

**Real local Supabase Auth sign-in is wired and working.**

| Requirement | State | Evidence |
|---|---|---|
| Real sign-in | ✅ | A real `<form action={formAction}>` bound via `useActionState(signInFormAction, …)` to a `"use server"` action that delegates to the pre-existing `signInAction` → `client.auth.signInWithPassword`. |
| Credential fields enabled | ✅ | `credential-fields.tsx:35,64` now default `disabled = false`, with `required={!disabled}`. The verifier's own live CDP probe across all five role variants: `emailDisabled:false, pwDisabled:false, pwType:"password", pwValueAttr:false`. |
| Accurate primary-action text | ✅ | **"Sign in"**, a real `<button type="submit">`. The old `<Link>` reading *"Open Trainer fixture workspace"* and the `fixtureHomes` map are deleted. The writer checked the frozen reference `AUTH-01-trainer-login/reference.png` — its primary CTA also reads "Sign in", so reference and governance agree and there is no discrepancy to record. |
| Session establishment | ✅ | @supabase/ssr cookie session, refreshed and propagated by `proxy.ts`. |
| Server-derived membership and role | ✅ | `resolveSessionIdentity` → `portalHomeForRole(result.data.role)`. `portalHomeForRole` is keyed by the **type** `SessionRole`, so a destination can only be obtained by holding a role the server itself derived; no string→destination lookup is exported. |
| Query parameter is presentation only | ✅ | `grep 'get("role")'` across `app components features lib server` → **exactly one hit**, `login-presentation.tsx:82`, consumed only by `AUTH_ROLES.find`, a `data-` attribute, the segmented control and an email placeholder. It is not a parameter of `signInFormAction`; the form submits exactly `["email","password"]` with zero hidden inputs (live-verified). `?role=admin` falls back to the trainer presentation and still yields zero portal hrefs. |
| Non-disclosing errors | ✅ | `SignInFormState = { status: "idle" \| "error" }` — a **closed two-valued type with no channel for a discriminator**. `validation`, `unauthenticated` (which already merges wrong-password / unknown-email / deactivated inside `signInAction`) and `unauthorized` (no membership / ambiguous membership) all collapse at one point, into one render branch and one message. **Live-proved without typing any password**: the verifier cleared `required`, submitted an empty form, and observed `errorCount:1`, one generic message, `bodyMentionsField:false`, URL unchanged, `CONSOLE_EVENTS=[]`. |
| No credential logging or persistence | ✅ | Full path: uncontrolled `<input name="password">` (no `value`, no `onChange`) → `formData.get("password")` → a local → `signInWithPassword`. `grep -rnE "console\.\|localStorage\|sessionStorage"` over `app components features server` → **zero hits**. `signInFormAction` returns only `{status:"error"}` or redirects. No throw carries it; no file write; no URL. |
| Root routing | ✅ | `app/page.tsx` is now `async function RootRoute(): Promise<never>` — no JSX at all. Unauthenticated/unauthorized → `redirect("/login")`; authenticated → `redirect(portalHomeForRole(role))`. Live: `GET /` → **307 → `/login`**. |
| create-next-app starter removed | ✅ | Grep for `next.svg`, `vercel.com`, `To get started`, `create-next-app` across `app components features lib server` → one hit, a doc comment recording the replacement. The five template SVGs were deleted after grepping each for references. |

**Secondary controls, as directed.** *Forgot password?* — kept as an inert `<span>`; **no password-recovery workflow was created**. *Remember me* — kept for frame fidelity but **disabled and given no `name`**, so it is never submitted and can influence nothing; an `sr-only` "— not available" states this. **No custom persistence was added**; the approved @supabase/ssr cookie session remains the only session mechanism.

One consequence the writer flagged honestly: React 19's form-action reset clears the email field along with the password on a failed sign-in. Echoing the email back through action state was rejected — it would place a caller-supplied, credential-adjacent value into a serialized object for no governance benefit.

---

## 10. Route-protection state

**Two independent server-side layers.**

**Layer 1 — `proxy.ts` at the repository root.** This is the correct convention for the **installed** Next.js 16.2.10, established by evidence rather than preference: `next/dist/lib/constants.js` defines both `MIDDLEWARE_FILENAME` and `PROXY_FILENAME`; `next/dist/build/index.js` **throws** if both files exist and emits a deprecation warning if only `middleware` is present; the proxy runtime is `nodejs` and is not configurable. **`middleware.ts` does not exist anywhere** — verified by `find` at every depth including `src/`. The build reports `ƒ Proxy (Middleware)` with **no deprecation warning**.

The proxy resolves identity from **live server state** via `auth.getUser()` and the accounts/centre_memberships chain — not from raw cookie claims, not from a JWT decode, not from any client-controlled header — refreshes and propagates session cookies on the response, and **ignores the `role` query parameter entirely for authorization**. Unauthenticated → a bare `/login`. Wrong role → the caller's own portal root. No `?error=`, no `?from=`, no reason header, no reason body. It contains no `try/catch` at all, so it is fail-closed.

**Layer 2 — per-layout guards.** Each of the three portal layouts re-resolves identity server-side with its **own literal role**, so a proxy misconfiguration alone cannot expose a portal.

**Live proof, unauthenticated, by three independent agents.** Every portal route denies:

- Verifier B — all portal routes 307 → `/login`, no leak in any body.
- Verifier C — 9 requests including three portal roots and `?role=` / `?fixture=1` variants → all **307 → `/login`**, 6-byte bodies, fixture-marker hits **0**.
- The F16-D suite — **65 HTTP responses inspected**, 15 guarded portal routes, **25/25 assertions PASS**.

**Role-query escalation fails.** SEC-07 proves **full byte-identity** — status, Location *and* body — for all 15 proxy-guarded routes × 3 role values, with no normalisation at all.

**`/trainer` remains a compatibility redirect** toward the canonical `/trainer/schedule`; `app/(portals)/trainer/page.tsx` is unmodified. **Route census: 17, unchanged. No working route was deleted.** SEC-11 confirms an unknown path still 404s, which proves the 3xx responses are a guard and not a catch-all.

### 10.1 One documented weakening, disclosed by the author

`/` is denied in `app/page.tsx` rather than in the proxy, so its 307 carries Next's RSC error document, which echoes the request URL into the flight payload — bodies differ by 57 bytes under `?role=`. SEC-08 therefore asserts byte-identical **status and Location**, plus body identity **after normalising away the echoed `?role=<value>`**. The author verified the divergence is *only* that echo, and stated plainly that the alternative — asserting status and Location alone on `/` — is strictly weaker. All 15 **proxy-guarded** routes are compared with no normalisation whatsoever.

### 10.2 Route aliases — deliberately NOT created, with the reason

The six canonical target paths recorded in `FRONTEND_RECONSTRUCTION_TRACKER.md` Table A (`/trainer/schedule/[sessionId]/student-roster`, `…/grade-student`, `…/ai-report-generation`, the `/trainer/reports/[reportId]` index, `/management/students/[studentId]/reports/[reportId]`, `/parent/reports/[reportId]`) **do not exist and were not created.** Each is a screen-level route move that would touch reconstructed screens, and this run is directed not to redo the twelve core screen reconstructions. The twelve-screen flow is navigable on the 17 existing routes. This exclusion is recorded, not silent, and is carried into §21.

---

## 11. Root-route state

`/` is a dynamic server route that renders nothing and redirects. Unauthenticated → `/login` (307, live-verified on three separate servers by three separate agents). Authenticated → the server-derived portal home. The create-next-app starter is gone along with its five template SVGs; `public/` is now empty apart from the retained `app/favicon.ico`.

---

## 12. Adapter state

**`RealParticipantPhysicalTestPort` is implemented.** `lib/frontend/adapters/real-participant-port.ts`, with `identity` typed as `Extract<PhysicalTestAdapterIdentity, {kind:"real_participant_adapter"}>` — so the fixture kind is **not expressible** — carrying `participantEligible: true` and `persistence: "local_supabase"`.

**All 23 members are accounted for.** The independent verifier built its **own** table from `lib/frontend/physical-test-port.ts` rather than copying the writer's, and its count agrees: **0 stubbed, 0 blanket-`unsupported`, 0 fabricated or hard-coded data returns.** Every member is backed by a governed server action in `server/modules/integration-adapter/participant-actions.ts`. Every status literal appears only as a comparison, an RPC expected-state argument, or a returned-state verification — never as an assignment. Where an RPC's returned state disagrees with expectation, the adapter downgrades to `unavailable` / `stale_state` rather than asserting a transition.

**The governed resolver is used.** All three reportId-keyed reads take **only** a report id from the client and resolve server-side:

```
const context = await resolveContext(client, reportId);
if (context.outcome !== "success") return context;
… getTrainerWorkingReportCore(client, context.data.sessionId, context.data.studentId)
```

The same shape appears for draft generation, management review, and the four reportId-keyed writes. `getSessionRoster`, `getAssessmentDraft` and `getCanonicalReport` take a pair by design and are each re-authorized inside their own governed core. **No client-supplied session or student id is ever paired with a client-supplied report id.** No fabricated key exists anywhere.

**No elevated client on any participant path.** `grep -rn "from .*elevated|createElevated|serviceRole|SERVICE_ROLE"` over `app components features lib server`, excluding the module itself → **zero matches**; the only textual hits are prose in doc comments. The static scan's own elevated-import leg walks all of `server/` unfiltered and passes.

**Management correction tracking carries all three statuses** — `trainer_approved`, `needs_edit` and `draft_ready` — verified at three independent layers: `narrowQueueRows`, the projection passing `report_status` straight from `report_list_management_corrections`, and the frontend union.

**Lifecycle rules preserved.** No `.sql`, migration or `supabase/` path appears in the diff. No RPC was introduced or renamed. `trainerApprove` returns `published:false`; `managementEditWording` touches the four panels only; `managementApproveAndSubmit` is the only publication path. The integration suite's INT-L9 confirms the parent reads exactly the four submitted panels plus `submitted_at`.

---

## 13. Fixture-isolation state

| Property | State |
|---|---|
| Off by default | ✅ `.env.example` sets it empty; the name does not appear in `.env.local` (name-presence count 0 — **no value was read**) |
| Explicit dev/test selector only | ✅ a single module, `lib/frontend/adapters/adapter-mode.ts`, comparing `process.env.NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE === "1"` |
| Not enableable from a participant surface | ✅ exhaustive grep for `FIXTURE_MODE` / `fixtureMode` / `dev-fixture` over `app components features lib server scripts .env.example` finds **no** query-param, cookie, header, `localStorage` or UI-control read |
| Real adapter composed by default | ✅ all three portal layouts mount `PhysicalTestRuntime`, which constructs `createRealParticipantPhysicalTestPort()` unconditionally on the default path |
| Visibly identified when on | ✅ the banner is keyed off `port.identity.kind === "deterministic_fixture"`, **not** off the flag — and the real adapter cannot report that kind. A footer prints the live identity via `data-adapter-kind` |
| Unreachable from real-auth navigation | ✅ live: 65 HTTP responses across three agents, **0 fixture markers**; SEC-17 and SEC-22 assert this in both HTTP bodies and rendered DOM |
| Hard-coded fixture composition removed from the integrated path | ✅ `features/trainer/trainer-fixture-runtime.tsx` deleted (a module, not a route — all 17 routes remain) |

### 13.1 The T7I-40 reconciliation — a strict strengthening

The pre-existing red gate (§7.2) was resolved **by narrowing the scan to the governed path, not by editing the fixture's string literals**. The verifier confirmed the fixture still contains its 6 status assignments (`grep -c` → 6) and that the exclusion is exactly `lib/frontend/fixtures/` and no broader — no `server/` or `app/` path became exempt, and the elevated-import loop still walks `server/` unfiltered.

**The price of the exclusion was paid.** A new leg (d) fails on any import of the fixture from a participant path, plus four assertions pinning the composition root. The verifier **demonstrated it actually fires**: it created a probe file importing the fixture, observed `FAIL T7I-40: features/management/__verify_probe.ts imports the deterministic fixture on a participant path` with exit 1, removed it, and confirmed exit 0 and a clean tree.

**`static-scan.mjs` and `run-canonical.mjs` now both exit 0 on `main`.** The pre-existing red discovered at §7.2 is genuinely resolved.

### 13.2 The recorded justification was partly false — caught, and corrected

The F16-C writer's comments in `adapter-mode.ts` and `physical-test-runtime.tsx` claimed Next.js inlines the flag at build time, that the branch is "statically dead", and that "the fixture chunk is then never emitted". The independent verifier read the **emitted client chunk** and found a literal runtime `process.env` read, with the fixture runtime behind a dynamic import that **is** present in the build output. Turbopack performs no such fold.

Behaviour is correct and was proven live, but the consequence the comment explicitly denied is real: **this build can be flipped into fixture mode by setting the environment variable at `next start` time, without a rebuild.** That is a documentation-truth defect sitting on a security justification, and it was corrected in a bounded follow-up commit rather than left in the tree (§14). The F17 runner additionally enforces G-19 at runtime, by starting its server with the variable absent from the child environment *and* asserting that the served pages report the real adapter identity.

---

## 14. Bounded correction after F16-C verification

**Commit `0bc8a3a` — `fix(integration): correct fixture-mode isolation record and scan scope`.** 4 files, +153/−46.

**D1 — a false security claim, corrected.** Both headers now state the truth: the `process.env.NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE` read is a genuine **runtime** lookup (Node env on the server, bundler `process` shim in the browser), evaluated once at module scope; the branch is **not** statically dead; the fixture chunk **is emitted** into the build output and is merely never fetched while the flag is off. Both now say explicitly that **a rebuild is NOT required to change the mode**, that the same build starts in either mode, and therefore that **an artefact audit alone does not establish the mode a deployment runs in**. The adjacent "keeps it out of the participant bundle graph" claim became "keeps it **off the synchronous participant load path**", and the same stale "build-time flag" wording inside the scan's own T7I-40 rationale and one failure message was fixed. The writer reconfirmed the underlying fact on its own build: `grep -rl NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE .next/static` matches a real emitted chunk. **Zero behaviour change; no attempt was made to force a fold.**

The re-reviewing agent confirmed independently that a repo-wide grep for `build-time fold|folded to a literal|not in the bundle|out of the participant bundle` now returns **only the three negating sentences** — no surviving false claim anywhere.

**D2 — the exemption and the assertion now coincide.** The writer chose to **narrow** the (a)/(b)/(c) exclusion to the single fixture module rather than widen leg (d) to the directory — and the reason is load-bearing: `lib/frontend/fixtures/dimensions.ts` is legitimately imported by three participant-path surfaces for `RATING_DISPLAY_LABELS`, so widening (d) would have failed all three. Under the narrowing those imports stay legal and `dimensions.ts` is now scanned by (a)/(b)/(c) on its own merits (it holds no status assignment, no `lock_version` mutation, no `.from()`). Leg (d)'s regex is now built from the same `FIXTURE_MODULE` constant, so the exempted set and the asserted set are **literally the same string**.

**Both legs were proven to fire.** Two probe files were created — one in the fixtures directory assigning a status, one on a participant path importing the fixture — and the scan exited 1 with both expected failures. **The first is precisely the gap D2 describes: under the old directory-wide exclusion it would have been silently exempt.** Both probes were deleted and the scan returned to exit 0 with a clean tree.

**D3 — partially addressed, with the limit stated.** `readSessionDate` and `readStudentName` now return `string | null`, no longer discard the PostgREST error, and return `null` for a failed, denied or zero-row read alike, so the caller can distinguish "not read" from a genuine value. The display substitution moved to the call sites behind two named constants. The writer **declined** to carry the distinction to the surface and said why: `sessionDate` and `studentDisplayName` are non-nullable in the ratified adapter DTO contract, so an explicit empty marker requires a contract change that was out of scope; and converting a failed read into an `unavailable` outcome is a live behaviour change on an RLS-dependent path it could not exercise. Net effect: identical observable behaviour, failure now distinguishable at the seam.

---

## 15. Real-auth tests completed WITHOUT passwords

Everything in this section was proven with **no valid credential of any kind**.

| Proof | Where | Result |
|---|---|---|
| Root `/` redirects unauthenticated to `/login` | SEC-01/02 + three independent live servers | 307 → `/login` |
| All 14 portal routes + the `/trainer` alias deny | SEC-03/04/05 | 3xx, never 200; no portal markup in any body |
| All guarded denials byte-identical to each other | SEC-06 | identical |
| `?role=` escalation fails — **full byte-identity** (status, Location *and* body), 15 routes × 3 roles | SEC-07 | identical, no normalisation |
| `/login` reachable unauthenticated | SEC-09 | 200 |
| All 17 canonical routes resolve; an unknown path still 404s | SEC-10/11 | proves the 3xx are a guard, not a catch-all |
| `/trainer` preserved as a compatibility redirect | SEC-12 | toward `/trainer/schedule` |
| `proxy.ts` never reads the role query; authority is server-derived | SEC-13/13b | static proof over comment-stripped source |
| Each layout re-guards with its **own** literal role | SEC-14/15 | independent second layer |
| No `middleware.ts` alongside `proxy.ts` | SEC-16 | Next 16 convention respected |
| Fixture isolation — 0 fixture markers across 65 HTTP responses | SEC-17/22 | isolated |
| No protected substance in any denied response | SEC-18/23 | 65 responses scanned |
| No denial Location carries `error`/`reason`/`from`/`next`/`redirect` | SEC-19 | non-disclosing |
| Every portal navigation in a real browser lands on `/login` | SEC-20 | CDP |
| No session-free surface renders a rating, dimension, evidence, hash, version, correction or media carrier | SEC-21 | clean |
| Browser console clean | SEC-24 | `consoleErrors === []` |
| Sign-in failure is non-disclosing | F16-A verifier, live | empty form submitted → one generic message, `bodyMentionsField:false`, console `[]` |
| Fixture identity preflight | F17 runner `--preflight-only` | 3 auth users, 3 ratified UUIDs bound to active accounts and matching-role memberships, one centre, residue 0, checksum `6bdff280…c576` over 28 rows |

**`{ "result":"passed", "assertions":25, "passed":25, "failed":0, "httpResponsesInspected":65, "canonicalRoutes":17, "guardedPortalRoutes":15, "f17Deferred":10, "credentialUsed":false }`**

The suite's honesty was itself tested: the author built a throwaway negative control that added `"Sign in"` and `"__next_f"` to the forbidden list, confirmed SEC-18 and SEC-23 **failed** and the process exited 1, then deleted it. The corpus scans genuinely read response bodies and rendered DOM rather than passing vacuously.

---

## 16. Tests still requiring valid passwords

These are **not written, not faked, and not claimed**. They are enumerated in the F16-D suite's own deferred register and printed on every run.

| Id | Leg | Why it needs a credential |
|---|---|---|
| F17-X01…X03 | Trainer blocked from Management and Parent; Management blocked from Trainer and Parent; Parent blocked from Trainer and Management | requires three live sessions |
| F17-X04 | A valid session routes to its own portal | requires sign-in |
| F17-X05 | `/login` while authenticated bounces to the caller's own portal | requires a session |
| F17-X06 | Session-cookie refresh replay through the proxy | requires a session |
| F17-X07 | The authorized `/trainer` → `/trainer/schedule` chain (the unauthenticated leg denies first, correctly) | requires a session |
| F17-X08/X09 | Management and Parent DOM exclusions on **authenticated** surfaces | the surfaces are unreachable without a session |
| F17-X10 | The success paths of all 23 port members | every one is behind identity |

Verifier B and Verifier C both stated plainly that they verified the authenticated branches **by code inspection only**. Verifier B additionally declined to copy the repository tree when doing so would have involved copying `.env.local`. That is the correct instinct and it is recorded as a credit, not a gap.

---

## 17. Secure F17 runner

**Path:** `scripts/physical-test/run-f17.mjs` (in-repository, 1851 lines, no dependency added).
**Commit:** `5b52082` — `feat(physical-test): add secure operator-assisted F17 walkthrough runner`, hardened at a follow-up commit (§18).
**Operator instructions:** `UI_REFERENCE_FINAL_MVP/_checkpoint-evidence/F17/README.md` (outside Git).

### The exact operator command

```
cd "C:\Users\enyul\Vibe Studio\B.E.S.T-Coach-Workspace\SDS Project Final (BEST Coach)"
npm run physical-test:f17
```

Two forms that are safe to run at any time and prompt for nothing:

```
npm run physical-test:f17 -- --help
npm run physical-test:f17 -- --preflight-only
```

Prerequisites the operator must satisfy first: the local Supabase stack up, the fixture loaded, ports **3417** and **9417** free, and Chrome installed (or `CHROME_PATH` set). **Run it directly in a terminal you control** — not through a task runner, an IDE run button, SSH into a shared box, or CI.

It prompts exactly three times, in order — Trainer, Management, Parent — each with **echo disabled**; nothing appears as you type, not even asterisks. Backspace and Delete work; Ctrl+C aborts.

### Every mandated property, and how it is met

| Requirement | How |
|---|---|
| Local Supabase only | four independent non-overridable guards from fixed literals: no `supabase/.temp/project-ref`; `project_id == "best-coach-mvp"` with ports 54321/54322 from `config.toml`; the running `supabase_db_best-coach-mvp` container; and `assertLoopbackUrl` on both the API and DB URLs requiring hostname ∈ {127.0.0.1, localhost, ::1} **and** the exact port. `SUPABASE_URL` appears nowhere in the file. The CLI is resolved package-locally, never via `npx` or a shell string. No `login`, `link`, `--linked`, `db push/pull/dump`. |
| Requires an interactive TTY | doubled and not spoofable from outside the process: `main` checks `process.stdin.isTTY`, and `promptForPasswords` independently checks `!input.isTTY \|\| typeof input.setRawMode !== 'function'`. On piped stdin `setRawMode` is `undefined`, so forging `isTTY` still aborts |
| Prompts separately for all three | three prompts, in order, each labelled by role only |
| Hides all input | `setRawMode(true)` — the real termios/console echo kill, not a rendering trick. Nothing is written for typed bytes; there are no asterisks |
| Process memory only | a local `Map`; `secrets.delete()` per identity in a `finally`, `secrets.clear()` in an outer `finally` and on the prompt-error path, `bytes.length = 0` after each read. Never placed on the run context, never returned, never passed to `JSON.stringify` |
| Never logs, serializes, screenshots or persists | only five write sites exist, all carrying authored text; the two file writes are the gate ledger (built from titles, verdicts, authored reasons, ports and public checksums) and a PNG of an already-authenticated portal. A non-`SafeError` is collapsed to a fixed string, so a library error carrying a request body cannot print. Every child stream is captured and left unread |
| Rejects non-TTY | verified by execution — exit 1, naming no credential and offering no alternative input path |
| Stops on identity mismatch | preflight asserts 3 `auth.users`, the three ratified UUIDs each bound to one active account and one active matching-role membership, all one centre — **before prompting for anything** |
| Starts and stops its own app server | dedicated port 3417, verified free first, killed via `taskkill /PID … /T /F` so the `next start` worker goes with the parent |
| Owns its browser/CDP port | dedicated port 9417, verified free first |
| Verifies no lingering processes | gate `H-1`, in a `.then()` that runs whether `main` resolved, threw, or was never reached |
| Records G-1 … G-21 individually | `gate()` refuses an unknown id, a duplicate verdict and an invalid verdict; `closeLedger()` defaults undecided gates to **NOT-RUN, never PASS**; the run exits 1 if any gate is FAIL |
| Redacted evidence outside Git | `UI_REFERENCE_FINAL_MVP/_checkpoint-evidence/F17/` |
| Prints no credential-bearing URL, request or payload | the auth failure message is authored and names only the role, with the Supabase `error` object never surfaced because it can echo the request; captured CLI stderr is never interpolated; psql surfaces only an exit code |
| No pattern-based redaction | confirmed: the single `.replace` in the file is markdown pipe-escaping on an authored string. Streams are never surfaced at all |

### Two design decisions the operator should know

**The browser never sees a password.** The runner does not type into the login form. It builds an `@supabase/ssr` client over an **in-memory cookie jar**, calls `signInWithPassword` in Node, and installs only the resulting session cookies into Chrome via `Network.setCookie`. So the cookie names and encoding are produced by the exact library the application reads them with, and the password never touches the browser, the CDP socket, a URL or a child-process argument. Sign-in is still a real GoTrue password verification with the returned id asserted equal to the ratified UUID — which is what G-1 is about.

**Twelve gates are recorded NOT-RUN as a governance conclusion, not fatigue.** G-3, G-4, G-5, G-6, G-7, G-8, G-9, G-10, G-12, G-13, G-15 and half of G-16 each require a **governed write**. Every governed write commits an audit event that Step 7H makes permanently uncleanable — `audit_block_mutation()` raises unconditionally on UPDATE/DELETE with no owner exemption and no session-variable bypass — and moves rows inside the canonical checksum region. **A runner that both walked the lifecycle and asserted G-18 "the canonical verifier database remains pristine" would irreversibly destroy the very property it claims to prove, on the same database.** `run-concurrency.mjs` already records exactly this reasoning as U-7I-21, which is why the R(C) proofs live on a separate disposable database. So the runner performs **no governed write against the canonical database**, and each of those gates carries NOT-RUN with the write requirement, the G-18 conflict and the disposable-database remedy named. The independent reviewer examined this argument and agreed it is the correct call. **A disposable-database walkthrough harness is the missing piece and is separate, separately-authorized work** — carried into §21.

### What the runner does decide

G-1 (three real sign-ins, each asserting its ratified UUID) · G-2 (per live session: own portal reached, both foreign portals denied, `/login` bounced, `?role=` changed nothing — this is F17-X01…X07 actually exercised) · G-11 and G-19(b) from `run-concurrency.mjs` on its own disposable database · G-14 from a live parent session comparing a non-existent pair against the real fixture student it is not entitled to read, asserting byte-identical documents · G-17 from the read-only `audit_verify_chain()` across every centre chain · G-18 by recomputing the canonical checksum at the end against both the opening reading and the pinned literal · G-19(a) by deleting the fixture flag from the child environment **and** asserting the served pages report `data-adapter-kind="real_participant_adapter"` — precisely because §13.2 established the flag is a runtime read, so the environment alone proves nothing and the page must be asked · G-20 from `tsc`/`lint`/`build` exit codes · G-21 from the CDP console collector · plus `H-1`, the hygiene gate.

### 17.1 Two independent security reviews, and what they cost

The runner was reviewed twice by agents that did not write it. **Both returned PASS — safe for the operator to run manually — and neither found a credential-escape path.** The first review's summary is worth quoting, because it is the load-bearing claim:

> "The runner is, on the credential axis, the strongest artefact I have read in this repository: it has exactly one input path (raw-mode TTY), one consumer (`signInWithPassword`), zero interpolation sites, zero serialization sites, zero file sinks, and it deliberately does **not** redact — it never renders the streams at all."

All eight credential legs came back **not possible**, each with quoted evidence. The reviewer also checked the library layer, confirming `@supabase/auth-js` logs only when `settings.debug` is truthy, which the runner never sets.

**But the reviews found real defects elsewhere — in the honesty of the verdicts.** Five Medium, and they mattered because the ledger this runner writes *is* the operator's F17 checkpoint record:

| Defect | What was wrong |
|---|---|
| **C-1** | G-14 could report **PASS having compared nothing** — `evaluate()` returned `undefined` on any CDP error, and `undefined === undefined` satisfied its byte-equality |
| **C-2** | G-2 accepted a **failed navigation as a correct redirect** — the navigate result's `errorText` was discarded and a fixed 1200 ms sleep meant a stale document could be read as proof of denial. The failure mode biased toward PASS |
| **C-3** | G-21 had **no positive proof its collector was live** — a CDP error on `Runtime.enable` left `consoleErrors` empty and G-21 passed with a collector that was never attached |
| **D-1** | H-1 reported **PASS with port release assumed, not verified**, on exactly the failure paths where a leak is most likely — literally "ports - and - are released" |
| **D-2** | Ctrl+C after startup **verified no port and wrote no ledger**, contradicting both the help text and the operator README |

These were fixed at `ab1c761`, the re-review confirmed C-1, C-2, C-3, D-1, D-3 and E-1 **FIXED** — and then found **two regressions the hardening had introduced**: an abort-path race that computed H-1's verdict and silently discarded it, and an early Ctrl+C that wrote a near-empty ledger **over the evidence pack's real one**. Those were fixed at `e8318f2`, each reproduced against the verbatim shipped source in both its old failing and new correct form.

**The hardening agent also corrected the reviewer.** The review modelled C-2 as "a failed navigation leaves the previous document"; on this Chrome a failed navigation *commits a 187 KB error document*. So the defect was **worse** than described — the old code fed a `chrome-error` page into G-14's byte comparison and the fixture-marker scan as if it were a portal.

**No gate anywhere defaults to PASS.** `gate()` refuses an unknown id, a duplicate verdict and an invalid verdict; `closeLedger()` defaults undecided gates to NOT-RUN; the run exits 1 on any FAIL without clobbering 130 on abort. The re-review confirmed this block **byte-identical** across all three commits.

**One item is knowingly left open.** `navigateRaw` accepts `Page.frameStoppedLoading`, which is per-frame, so a sub-frame could satisfy the wait before the main document finishes. Fixing it means threading a frame id through CDP machinery every other primitive depends on — outside a bounded fix. It **fails closed**: a partially-rendered read is rejected by the document assertion. Recorded, not hidden.

---

## 18. Tracker corrections

All made in the external pack. **No historical record was rewritten**; only current-state cells that were false were corrected, each marked in place.

| # | Correction | Where |
|---|---|---|
| 1 | R-27 resolved by the operator fixture reload, with the independent reproduction recorded | risk register, R-27 row + Run C1 section |
| 2 | Backend V2 database-dependent verification: **blocked → pending execution → executed** | execution tracker §8.3 |
| 3 | F-08 completed at `bda9cad6854ffec768200d58a8666bb0038ab2b2` | frontend tracker Table B |
| 4 | The **missing F8 commit SHA** — the cell carried only the commit subject, the only such cell in the table | frontend tracker Table B |
| 5 | F8's stale **"Blocked — not attempted"** — it recorded the *first* attempt (which was correct to block) and was never updated after the successful retry, leaving the tracker contradicting `bda9cad` | frontend tracker Table C |
| 6 | The route rows describe **future canonical targets, not existing routes** — six of them have never existed; a full target-versus-actual mapping is now recorded beneath Table A | frontend tracker Table A |
| 7 | The stale backend-workstream claim that **"the frontend still carries the superseded labels"** — false since `5dcbeeb`, merged at `68ba497` | corrected **inside** backend commit `dce8737`, because that file is tracked and could not be corrected from the external pack |
| 8 | F-16 **not started → in progress → implementation complete** | frontend tracker Table B, execution tracker §8.7 |
| 9 | F-17 **not run**, and explicitly operator-assisted by design | frontend tracker Table B, execution tracker §8.7 |
| 10 | Fixture passwords remain **operator-only and non-persisted** | execution tracker §8.2 |

Risks **R-30** (census move), **R-31** (resolver as a disclosure surface), **R-32** (route protection as F16's single point of failure) and **R-33** (the F17 runner handling three real passwords) were opened at Phase C0 and are recorded with their mitigations. **R-23** was closed.

---

## 19. Final database census

Read-only, after every suite had run and torn down.

| Metric | Value |
|---|---|
| `auth.users` | **3** — the ratified UUIDs `d0000000-0000-4000-8000-00000000000{1,2,3}` |
| `public.accounts` | **3**, each bound to its ratified `auth_user_id`, all `active` |
| `centre_memberships` | **3** active — one management, one trainer, one parent, one centre |
| Application-domain rows | **25** |
| Total `public` rows | **38** (25 domain + 13 schema-seeded reference) |
| Canonical rows | **28** |
| Canonical fixture SHA-256 | **`6bdff280e550503d212832c2fd1099ac45880c2bc430bfdff8f92a3b35ffc576`** — identical to the opening reading |
| Applied migrations | **9** |
| Tables / functions / enums / policies / `authenticated` EXECUTE | **26 / 32 / 12 / 29 / 24** |
| `competency_rating` | `beginning, developing, mastering, mastered` |
| `class_grade_code` | `beginner, intermediate, advanced` — unchanged |

**The fixture is byte-identical to how the operator left it.** Nothing in this run wrote a canonical row.

---

## 20. Report-version residue

| | Value |
|---|---|
| `public.report_versions` | **0** |
| `public.report_version_ratings` | **0** |
| `public.reports` | **0** |
| `public.audit_events` | **0** |

Zero at the start, zero at the end, and confirmed independently by the backend implementer, the independent backend verifier, the F16-C verifier and me. Every committing suite operated on a disposable database (`bc_asm`, `bc_ct`, `bc_7i_conc`, `bc_b2`, `bc_7i_freshapply`, plus the verifier's own `r22_verif`), each dropped in a teardown that also runs on the abort path.

---

## 21. Final Git states

| Repository | Branch | HEAD | Tree |
|---|---|---|---|
| **Main MVP** | `main` | **`629965d`** | clean |
| **Backend worktree** | `feat/48h-backend` | **`402b0b6f25828775bcc2a3d30f418b90b898aa80`** | clean |
| **Frontend worktree** | `feat/48h-frontend` | **`6762b5c59d41cdeaaaa0bc410a4fe28a1d31cebe`** | clean — **untouched, identical to the starting baseline** |
| **Frozen demo** | `main` | **`8d4acf4abc5039c24da01be773ab1a5e4916080f`** | clean — **unchanged**, tag `demo-freeze-step14-2026-07-21` intact |

### Commits created by this run

**On `feat/48h-backend` (3):**

| SHA | Subject |
|---|---|
| `dce8737` | `test(backend): reconcile post-vocabulary canonical proof` |
| `e75b922` | `feat(backend): add governed report context resolver` |
| `402b0b6` | `test(backend): verify report context resolution boundaries` |

**On `main` (9):**

| SHA | Subject |
|---|---|
| `70a04be` | `merge(48h): integrate Run C1 backend continuation into main …` |
| `a649c47` | `feat(integration): wire real authentication and root routing` |
| `b4aaa89` | `feat(integration): enforce server-side portal authorization` |
| `ad451af` | `feat(integration): connect governed physical-test adapter` |
| `e84371b` | `test(integration): prove authenticated route boundaries` |
| `0bc8a3a` | `fix(integration): correct fixture-mode isolation record and scan scope` |
| `5b52082` | `feat(physical-test): add secure operator-assisted F17 walkthrough runner` |
| `ab1c761` | `fix(physical-test): make F17 gate verdicts and teardown fail closed` |
| `e8318f2` | `fix(physical-test): record F17 abort-path hygiene verdict truthfully` |
| `629965d` | `docs(integration): record Run C1 F16 checkpoint and continuity state` |

**No push, no remote configured, no rebase, no reset, no stash, no discard, no empty commit.**

### Final gate sweep on `main` at `629965d`

| Gate | Exit |
|---|---|
| `npx tsc --noEmit` | **0** |
| `npm run lint` | **0** |
| `npm run build` | **0** |
| `node scripts/tests/step-7i/static-scan.mjs` | **0** |
| `node scripts/tests/step-7i/run-canonical.mjs` | **0** |
| `node scripts/tests/step-7i/verify-fresh-apply.mjs` | **0** |
| `node scripts/tests/assessment/asm-static.mjs` | **0** |
| `node scripts/tests/correction-tracking/ct-static.mjs` | **0** |
| integration suite, Parts 1+2+3 | **0** |
| `node tests/frontend/integrated-route-security.mjs` | **0** — 25/25, 65 responses, `credentialUsed: false` |

**12 of 12 `reference.png` SHA-256 values still match the accepted validation report.** No screenshot changed.

**Hygiene:** no application server, browser or test process left running; every port used by this run verified released (3411, 3412, 3413, 3414, 3418, 3419, 3421-3426, and the CDP ports); no half-applied migration — `verify-fresh-apply.mjs` replays all 9 cleanly from empty and confirms the live database is catalogue-identical.

---

## 22. Exact remaining physical-test blockers

Ordered by whether they block the test.

| # | Blocker | Owner | Blocks the test? |
|---|---|---|---|
| 1 | **The F17 walkthrough has not been run.** G-1 … G-21 are unrecorded. It requires the three fixture passwords, which may only be entered at a no-echo prompt on an operator-controlled terminal. The runner is built, hardened, twice-security-reviewed and ready: `npm run physical-test:f17` | **OPERATOR** | **YES** |
| 2 | **Twelve gates cannot be decided by the runner as designed** — G-3, G-4, G-5, G-6, G-7, G-8, G-9, G-10, G-12, G-13, G-15 and half of G-16 each need a **governed write**, which commits a permanently uncleanable audit event and moves rows inside the canonical checksum region, contradicting G-18. **A disposable-database lifecycle walkthrough harness is the missing piece** and is separate, separately-authorized work | backend + integration | **YES** — these include G-8, G-9, G-12, G-13 and G-15, any of whose failure forces NOT READY |
| 3 | **The first-draft dead end.** `saveObservation` returns `reportId: null` for a pair with no report yet, and no route keys draft generation by `(sessionId, studentId)` — only `/trainer/reports/[reportId]/generate` exists. **A trainer completing a first assessment has no UI path to draft generation.** The F16-C writer was right to refuse to call `report_create` from the save path; this needs an operator ruling on where report creation belongs | integration + operator ruling | **YES** — it breaks the twelve-screen flow at screen 07 → 08 |
| 4 | **Every authenticated test leg is unproven** — cross-role denial with a live session, `/login`-while-authenticated, the authorized `/trainer` chain, and the success paths of all 23 port members. Enumerated as F17-X01…X10 | operator, via the F17 runner | **YES** |
| 5 | Parent **cross-child** RLS negative is ABSENT as literally specified — the ratified Step 7F fixture has exactly one student, so the test cannot exist against it. The unlinked-parent, cross-centre-link and assessment-read negatives all pass. **A fixture-shape limitation, not a code defect** — the deferred broader fixture (2 trainers, 2 modules, 3-4 students, 2 parents) would close it | backend + fixture expansion | No — but it is an unproven boundary |
| 6 | No test attempts INSERT/UPDATE/DELETE on `public.audit_events` **itself** under the `authenticated` role. Denial is proven for the report family, not for the audit tables under the application role | backend | No |
| 7 | The six **canonical route migrations** were deliberately not performed (§10.2) — they would touch reconstructed screens | frontend, post-test | No |
| 8 | `navigateRaw` accepts `Page.frameStoppedLoading`, which is per-frame. Fails closed; fixing it means changing shared CDP machinery | integration | No |
| 9 | Carried from Run B, unchanged: `brand-700` primary actions pass by 0.017; no skip-to-content bypass link (SC 2.4.1); `avatar.tsx` muted variant 2.004:1; `page-heading.tsx` description at 2.828:1 | frontend | No |

**Critical path to a physical test: 3 → 2 → 1.** Item 3 needs an operator ruling before the flow is walkable end to end; item 2 needs a disposable-database harness before twelve governance gates can be decided at all; item 1 is the operator's and cannot be delegated.

---

## 23. Physical-test readiness verdict

# NOT READY

**and that is the honest answer, not a cautious one.** F-16 closed the entire Run B blocking set — real authentication, server-side route protection on every portal route, the real adapter with all 23 members, the root route, and fixture isolation — and every one of those is proven by an independent agent that did not write it. But:

- **F-17 has not been run**, and not-run is not better than failing; it is simply unproven, and is reported as unproven.
- **Twelve of the twenty-one gates cannot be decided by the runner as designed**, for a sound governance reason. That reason does not make them decided.
- **The first-draft dead end breaks the twelve-screen flow** at the 07 → 08 transition, and needs an operator ruling rather than an agent's guess.

**What is genuinely ready:** Backend V2 accepted with every gate executed; the governed report-context resolver implemented, independently verified and adversarially proven non-disclosing; the backend continuation merged to `main` without conflict; F-16 implemented in four independently-verified subcheckpoints; a 25-assertion route-security suite passing with **no credential**; fixture mode isolated and proven absent across 65 live responses; and a secure, twice-reviewed, twice-hardened F17 runner ready for the operator.

**F-16 status: `Implementation complete — operator-assisted valid-login proof pending`.** It is **not** fully accepted and must not be recorded as such.

---

## Appendix A — honesty checks

| Check | Result |
|---|---|
| Does every `Pass` name the command behind it? | ✅ §3, §7.1, §21 |
| Are ABSENT tests listed rather than omitted? | ✅ §3.1 (Parent cross-child, audit-table role denial), §16, §22 |
| Are NOT-RUN gates recorded as NOT-RUN rather than inferred? | ✅ §17 — twelve gates, each with its reason |
| Is the pre-existing defect distinguished from one this run caused? | ✅ §7.2, proven at `68ba4976` by direct read |
| Was any governance scan weakened? | Narrowed once (T7I-40), with a **compensating assertion demonstrated firing** — §13.1 |
| Was a false claim shipped and then caught? | ✅ §13.2 — caught by a verifier reading the emitted bundle, corrected at `0bc8a3a` |
| Did verification find defects inspection missed? | ✅ five Medium in the F17 runner, then two more introduced by the fix — §17.1 |
| Was any credential requested, printed or persisted? | ❌ **None, at any point, in either direction** |
| Do any tests require a password to pass? | ❌ None. Every test written in this run passes without one |
| Is the frontend worktree untouched? | ✅ `6762b5c`, identical to baseline |
| Is the frozen demo unchanged? | ✅ `8d4acf4`, tag intact |

---

## Appendix B — orchestrator errors, stated plainly

1. **A heredoc quoting failure** while appending to this report produced a shell parse error; recovered by writing through a file instead. No content was lost or corrupted.
2. **Two subagents produced a malformed commit subject** by using PowerShell here-string syntax inside the Bash tool (`@ feat(...)`). Both detected it themselves and amended in place before the commit was verified. Subjects are byte-exact.
3. **I combined the F16-A and F16-B verifications into the sequence as designed but did not verify F16-D independently** — the suite is its own verification, and I re-ran it myself at `629965d`. That is weaker than the A/B/C treatment and is recorded rather than glossed.
4. **The first security review claimed "6 Medium" but enumerated 5.** I used the enumerated list. A miscount in a summary line, with no effect on what was fixed.

---

*Produced by the Run C1 main orchestrator, 2026-08-06 Asia/Singapore, in the external UI pack outside every Git repository. No credential appears anywhere in this document.*
