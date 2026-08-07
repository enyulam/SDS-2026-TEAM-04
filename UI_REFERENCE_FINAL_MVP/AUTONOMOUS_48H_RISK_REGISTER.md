# Autonomous 48-Hour Sprint — Risk Register

**Produced at:** RUN A, 2026-08-06 (Asia/Singapore).
**Status:** Planning artefact. A risk listed here is not authorization to accept it.

**Blocking status** — `BLOCKING` means Run B must not proceed past the named gate until the risk is closed or the operator accepts it in writing.

---

## R-01 · Report-hash invalidation

| | |
|---|---|
| **Probability** | Low **now**, rising to near-certain if V2 is deferred past any real lifecycle run |
| **Severity** | **Critical — permanently irreversible** |
| **Trigger** | Any `report_versions` row created before the enum rename. Sources: F-16/F-17 walkthroughs, integration suite Part 3, or a manual lifecycle exercise against the canonical database. |
| **Mechanism** | `report_content_hash_v1` casts the enum to text and **prefixes its byte length** (`…lifecycle.sql:468–472`, shape `body:V:6:secure`). All three renames change bytes; two change length. The function is `IMMUTABLE` and argument-pure, so no ordering trick insulates it. `content_hash` is `NOT NULL`, CHECK-constrained, and frozen at trainer approval. |
| **Blast radius** | Every pre-rename `content_hash` becomes unreproducible. Surfaced by `report_trainer_approve` step 8 and `report_management_approve_and_submit` step 7, both of which treat a mismatch as a data-integrity anomaly. **`report_wording_hash_v1` is unaffected** — it covers the four panels only. |
| **Prevention** | **Authorize and land V2 before any report data exists.** Do not run the integration suite's lifecycle part against the canonical database until V2 is in. |
| **Detection** | The fail-closed in-transaction guard aborts the migration; `SELECT count(*) FROM report_versions`. |
| **Recovery** | **None for affected rows.** Only prevention works. |
| **Owner** | Backend implementer / operator (OD-2) |
| **Blocking** | **BLOCKING — Phase 1 entry** |

---

## R-02 · Zero-row window closure — the `observation_ratings` conflict

| | |
|---|---|
| **Probability** | **Certain** — it is the current state, not a forecast |
| **Severity** | High (blocks V2 on first attempt) |
| **Trigger** | Running the V2 migration against the canonical fixture database |
| **Mechanism** | Amendment 006's zero-row precondition and R-A6-4 mandate a guard over `report_versions`, `report_version_ratings` **and `observation_ratings`**. The ratified Step 7F fixture inserts **9 `observation_ratings` rows** and its own loader guard *requires* them (four levels represented, ≥1 `emerging`, ≥1 `advanced`). The two ratified artefacts were authored for different purposes and have never been executed together. |
| **Prevention** | Answer **OD-6 before authorizing V2**. Recommended: apply the rename on a **clean schema apply before fixture load**, then reload fixtures carrying the new labels — V2 already owns `local_fixtures.sql`, so this needs no amendment and satisfies A-053 literally. |
| **Detection** | The guard aborts in-transaction, by design. It is working correctly when it fires. |
| **Recovery** | Non-destructive: the transaction rolls itself back. **Do not weaken the guard, delete fixture rows ad hoc, or "run it on a fresh DB and call it done."** Narrowing the guard requires **an amendment** — no plan document may narrow an amendment-level clause. |
| **Owner** | Operator (OD-6) |
| **Blocking** | **BLOCKING — B-V2-1 entry** |

---

## R-03 · Backend/frontend vocabulary divergence

| | |
|---|---|
| **Probability** | Medium |
| **Severity** | High |
| **Trigger** | V2 and V3 authored by different agents at different times |
| **Mechanism** | The backend `RATING_LEVELS` and the frontend contract are **independent declarations with no shared import**. The reconciliation plan itself calls this "the single most likely residual defect". Rubric anchors are duplicated too, and A-050 requires them **verbatim**. |
| **Prevention** | Pin V2's exact union text **and anchor bytes** into the F-06 brief. Land V2 first. |
| **Detection** | V4 verifications 1–3: byte comparison, not side-by-side reading. |
| **Recovery** | Forward corrective commit on the lagging branch. |
| **Owner** | Frontend implementer / orchestrator |
| **Blocking** | BLOCKING — F-06 exit |

---

## R-04 · Class Grade accidental replacement

| | |
|---|---|
| **Probability** | Medium-High (a global replace is the obvious shortcut) |
| **Severity** | High |
| **Trigger** | Any find-and-replace over `advanced`, `secure`, `emerging`, `beginning`, `mastering`, `mastered` |
| **Mechanism** | Class Grade remains `Beginner`/`Intermediate`/`Advanced` and is a **different vocabulary** (A-054). Hazard sites: `database.types.ts:1745, 1904` (`class_grade_code`), `20260803034500:86, 1032, 1086`, the frontend `classGrade` union in the same file as the rating union, and ordinary prose such as `run-concurrency.mjs:487` "lock_version advanced by". |
| **Prevention** | **A-054 expressly prohibits global keyword replacement.** Every change made by inspecting context. Generated types **regenerated, never hand-edited** — which makes `class_grade_code` survive automatically. |
| **Detection** | Byte comparison of all Class Grade artefacts before and after; `rg class_grade_code` diff. |
| **Recovery** | Forward corrective commit. |
| **Owner** | Backend and frontend implementers |
| **Blocking** | BLOCKING — V2 and F-06 exit |

---

## R-05 · Contextual leak detection — false positives and false negatives

| | |
|---|---|
| **Probability** | **Certain if V2 ships without replacing the mechanism** |
| **Severity** | High |
| **Trigger** | The rename alone |
| **Mechanism** | `grounding.ts:50` is verbatim `/\b(emerging|developing|secure|advanced)\b/i` — the construct A-052 prohibits. After the rename it becomes exactly `\b(beginning|developing|mastering|mastered)\b`, the literally prohibited form, and would reject A-052's enumerated legal sentences including "has mastered maintaining eye contact". **A false positive already exists today**: `developing` is in the alternation, so "the student is developing confidence" is already rejected. **False negative risk**: `asm-suite.sql:983`'s audit-privacy regex still enumerates the superseded labels and would **pass falsely** if V2 lands without updating it. |
| **Prevention** | Replace with attribution/taxonomy detection keyed on **context** (`rating: <label>`, `rated as <label>`, `<label> level`, a label standing alone as a value, disclosure of the four-level set). **Retain** `mastered`/`mastery` in achievement-language detection. Ship the audit-privacy assertion **in the same checkpoint** as the migration (A-052). |
| **Detection** | Two tests, both required: attribution forms rejected **and** ordinary prose accepted. **The second does not exist today** — and `run-integration.mjs:283–286` currently asserts the *opposite*, locking in the prohibited behaviour. It must be **rewritten, not extended**. |
| **Recovery** | Forward corrective commit; no data damage. |
| **Owner** | Backend implementer |
| **Blocking** | **BLOCKING — B-V2-2 exit** |

---

## R-06 · Route breakage

| | |
|---|---|
| **Probability** | Low-Medium |
| **Severity** | Medium-High |
| **Trigger** | Executing canonical route moves before the physical test, or an unlicensed route addition |
| **Mechanism** | Six core screens sit on pinned paths the contract §4 fixes. Screens 33 and 08 currently sit on paths that **match the read-RPC key better than the canonical routes do** — moving early would force building the `reportId` → `(sessionId, studentId)` resolver twice. |
| **Prevention** | **Pinned routes govern the physical test** (§4.1; inventory §7.2 "Replace after integration"). Only F-04 and F-16 may move the census. The one route change F-16 should make is `/` → `/login`. |
| **Detection** | "Route census unchanged at 16" is asserted at every checkpoint. **An unexplained census move is stop-and-report.** |
| **Recovery** | `git revert` forward; re-anchor the tracker's starting commits. |
| **Owner** | Frontend / integration implementer |
| **Blocking** | Non-blocking if OD-5 is answered "after integration" |

---

## R-07 · Fixture-auth mistaken for real auth

| | |
|---|---|
| **Probability** | **Medium-High** — the surface already looks like a login screen |
| **Severity** | **Critical** |
| **Trigger** | Treating F2/F3/F10/F13 as satisfying G-1, or running the walkthrough in fixture mode |
| **Mechanism** | The delivered login performs no authentication: the primary action is a `<Link>` to `/trainer`, credential fields default `disabled`, and the suite's own header states it asserts **no authentication behaviour**. **Worse: no portal route has any guard** — verified, `grep` over `app/(portals)` returns nothing — so every workspace route is reachable by typing the URL with no identity. The login screen is a decorative doorway beside an open wall. Backend real auth exists (`signInWithPassword`, live membership resolution, sign-out on missing authority) but has **no route, no middleware and no UI**. |
| **Prevention** | G-19 forbids fixture mode for the primary walkthrough. F-16 must deliver: ported `identity-access`, `middleware.ts`, a guard on **every** portal route, a real `<form action={signInAction}>`, and a **server-derived** post-auth destination that ignores `?role=`. |
| **Detection** | Assert `identity.participantEligible === true` on every portal surface; attempt an unauthenticated direct URL hit on each portal route and require a non-disclosing denial. |
| **Recovery** | None at test time — a participant test run on fixture auth proves nothing and must be re-run. |
| **Owner** | Integration implementer |
| **Blocking** | **BLOCKING — F-17 entry** |

---

## R-08 · Management assessment-substance exposure

| | |
|---|---|
| **Probability** | **Medium-High if reference 19 is implemented faithfully** |
| **Severity** | **Critical** |
| **Trigger** | F-12 built to the frame |
| **Mechanism** | Reference 19 carries a **PERFORMANCE SUMMARY grid of per-dimension ratings** (SPEECH/MASTERING, TONALITY/MASTERED, EYE CONTACT/BEGINNING, AUDIENCE AWARENESS/DEVELOPING), an **"Overall Grade: Mastering"** row, a **"Report for: Parent \| Management" toggle**, a **"Save as draft"** action and a **Class Video Evidence** player. `CLAUDE.md:263` states Management "never reads … raw per-dimension ratings"; `:225` forbids it "on **any** row, `trainer_approved` included"; `:263` states "There is no `kind` enum and no `audience` column on a version". **This conflict is recorded nowhere.** |
| **Prevention** | Answer **OD-7**. The rule wins; the frame is recorded as deviating. Management reads exactly the four parent-facing panels of the final-review candidate and nothing else. |
| **Detection** | A **negative** DOM assertion that no per-dimension rating token renders on any Management surface. Does not exist today. |
| **Recovery** | Revert; the rule wins; the frame stays recorded as deviating. |
| **Owner** | Operator (OD-7) / frontend implementer |
| **Blocking** | **BLOCKING — F-12 entry** |

---

## R-09 · Parent rating exposure

| | |
|---|---|
| **Probability** | Medium |
| **Severity** | **Critical** |
| **Trigger** | F-14 or F-15 built to the frame |
| **Mechanism** | Three distinct disclosures, **only one recorded**: (a) reference 33's per-dimension grid — **recorded and ratified** at F1; (b) reference 33's "Overall Grade: Mastering" and its prose attributions ("Assessed as **Mastered** in eye contact…", "progress these skills to the **Mastering** band") — **unrecorded**; (c) reference 32's per-report aggregate chips reading "Mastering"/"Developing" — **unrecorded**, and the tracker states F14's blocker is "None known". The screenshot-validation report cleared 32 as "overall grade only — no per-dimension rating grid", which is literally true and materially incomplete. |
| **Prevention** | Answer **OD-8**. **No Parent rating primitive may be created** — F1 already refused to create one. The current code is already compliant: the parent report renders exactly the four governed panels. |
| **Detection** | A **negative** assertion that no rating token renders on any Parent surface. Does not exist today; it is the single highest-value missing frontend test. |
| **Recovery** | Revert; record the deviation; propose no re-freeze of the reference. |
| **Owner** | Operator (OD-8) / frontend implementer |
| **Blocking** | **BLOCKING — F-14 and F-15 entry** |

---

## R-10 · Figma-versus-governance conflict resolved by an agent

| | |
|---|---|
| **Probability** | Medium |
| **Severity** | High |
| **Trigger** | An agent applying "frozen reference first" precedence without reading the governance ladder |
| **Mechanism** | Visual authority is `reference.png` → node-specific Figma → implementation, **but Figma never bypasses governance** (A-045). At least **six** live conflicts exist across references 19, 32 and 33, plus the panel-set mismatch (frames show Overview/Strengths/Areas to Grow/Remarks; the governed set is Today's Strength/Next Focus/Practice Suggestion/Session Takeaway) and the `#ec4899` contrast deviation. |
| **Prevention** | Restate the conflict explicitly in each checkpoint brief. **"Record the discrepancy; the rule wins."** Never resolve a frame-versus-rule conflict during correction. |
| **Detection** | Step-report review; the frame-deviation section must be non-empty for 19, 32 and 33. |
| **Recovery** | Revert; re-record. |
| **Owner** | Frontend implementer / orchestrator |
| **Blocking** | BLOCKING — F-12, F-14, F-15 exit |

---

## R-11 · Multiple writers in one worktree

| | |
|---|---|
| **Probability** | Low-Medium |
| **Severity** | High |
| **Trigger** | Two agents spawned against the same worktree |
| **Mechanism** | The two worktrees share one object store but hold **separate index/HEAD/reflog**, so cross-worktree concurrency is safe. **Intra-worktree concurrency is not**: two writers race the same index and working tree. |
| **Prevention** | One writer per worktree, enforced at contract item 1 — assert `git rev-parse HEAD` equals the tracker's recorded starting commit **and** `git status --porcelain` is empty. A second writer fails one of these within seconds. Disjoint path ownership is the static guarantee. |
| **Detection** | `.git/worktrees/<name>/index` mtime moving unexpectedly. |
| **Recovery** | Stop both; enumerate with `git status`/`git diff`; **leave the tree as-is**; commit only genuinely complete bounded work. Never `reset` or `stash`. |
| **Owner** | Orchestrator |
| **Blocking** | BLOCKING — every phase |

---

## R-12 · Stale generated types

| | |
|---|---|
| **Probability** | Medium |
| **Severity** | Medium-High |
| **Trigger** | Hand-editing `database.types.ts`, or regenerating before the migration applies |
| **Mechanism** | ADR-8 makes generated types authoritative for application data types. Hand-editing breaks the guarantee and would also let `class_grade_code` drift. |
| **Prevention** | `supabase gen types typescript --local` **after** the migration applies. **Never hand-edit.** |
| **Detection** | Diff review: the file must change only in the enum union; `class_grade_code` must be byte-identical. |
| **Recovery** | Regenerate. |
| **Owner** | Backend implementer |
| **Blocking** | BLOCKING — B-V2-1 exit |

---

## R-13 · Integration merge conflicts

| | |
|---|---|
| **Probability** | **Low textually, High semantically** |
| **Severity** | Medium-High |
| **Trigger** | M-1 / M-2 |
| **Mechanism** | Changed-file overlap between the branches is **empty** (36 vs 69 files, `comm -12` empty), and `merge-base` equals `main`'s HEAD — so textual conflict risk is effectively nil. The real work is **semantic**: `SaveObservationInput` is structurally different on the two sides; `TrainerWorkingReportDto` lacks `sessionDate` on the backend; `classGrade` is a literal union on the frontend and `string` on the backend; `ManagementQueueRowDto.status` is wide on the backend and narrow on the frontend; `getDimensions()` and `getDraftGenerationContext()` have **no backend equivalent**. |
| **Prevention** | Merge order pinned: **backend first, frontend second** (§12 steps 5–7). Budget merge time for DTO reconciliation, not for conflict resolution. Resolve divergences **at the backend boundary** — §5.3 forbids the frontend importing generated database types. |
| **Detection** | Typecheck on the merged tree; the fixture-contract assertion proving the port surface is fully implemented. |
| **Recovery** | Forward corrective commit. |
| **Owner** | Integration implementer |
| **Blocking** | BLOCKING — F-16 entry |

---

## R-14 · Visual acceptance without evidence

| | |
|---|---|
| **Probability** | Medium |
| **Severity** | Medium |
| **Trigger** | A tracker cell reading `Pass` before the command ran; or "looks right" standing in for comparison |
| **Mechanism** | **No suite compares the rendered app to any `reference.png`.** All three smokes capture screenshots to a temp directory and never diff them. The reference-fidelity module hashes only the **reference pack itself** — proving the references are unmodified, saying nothing about resemblance. Screenshot comparison is currently human eyeballing. Fidelity assertions exist for the **three auth screens only**. |
| **Prevention** | Extend the reference-fidelity module to the remaining nine screens. The tracker already forbids `Pass` without an exit-0 command. |
| **Detection** | Evidence auditor: claim → artefact → verdict. |
| **Recovery** | Re-run and re-record. |
| **Owner** | Visual verifier / evidence auditor |
| **Blocking** | BLOCKING — F-17 exit |

---

## R-15 · Incomplete physical-test rehearsal

| | |
|---|---|
| **Probability** | Medium-High under time pressure |
| **Severity** | High |
| **Trigger** | Participants arriving before a full scripted dry run passes |
| **Mechanism** | §12 steps 9–15 place database reset+seed, canonical verifier, concurrency suite, typecheck/lint/build, dry run and blocker repair **all before** participant testing. **No end-to-end Trainer → Management → Parent walkthrough exists as a single command today** — it is approximated by a DB-layer suite plus two UI suites in separate processes on separate branches. Also: **no single checkout can run the full matrix today**; the merge is the first moment the complete suite co-exists, i.e. it runs together for the first time at the highest-risk moment. |
| **Prevention** | Treat the dry run as Phase 7's last exit criterion. Schedule the DB-free static scans and integration Part 1 **first and in parallel** — notably the A-052 fix, which needs **no database at all**. |
| **Detection** | G-21 (no uncaught console errors) plus the per-gate record. |
| **Recovery** | Delay participants. A run on an unrehearsed build produces unusable evidence. |
| **Owner** | UAT verifier |
| **Blocking** | **BLOCKING — participant testing** |

---

## R-16 · Academy-wordmark fidelity gap

| | |
|---|---|
| **Probability** | Certain (it is the current state) |
| **Severity** | **Low** |
| **Trigger** | Operator expecting frame-exact branding |
| **Mechanism** | All three auth frames carry a raster academy wordmark with **no asset disposition**, and `GLOBAL_UI_RULES.md` §8 forbids copying it or re-drawing a logo ad hoc. The approved in-repo mark occupies the brand slot. This is a **governance-correct refusal, not a defect**. |
| **Prevention** | Operator disposition (PORT / REBUILD / REJECT). |
| **Detection** | Already recorded at tracker F2 blocker (a). |
| **Recovery** | Swap the asset once disposed. |
| **Owner** | Operator |
| **Blocking** | **Non-blocking.** It has not blocked four checkpoints; it will not block more. Defer to F-16. |

---

## R-17 · Silent false green from port collision *(added at Run A)*

| | |
|---|---|
| **Probability** | **Medium-High** if any two test agents are scheduled together |
| **Severity** | High |
| **Trigger** | Two validation runs at once, anywhere in the workspace |
| **Mechanism** | Both worktrees serve `http://127.0.0.1:3000`. `APP_ORIGIN` has an env override; **`DEBUG_PORT` (9331/9332/9345) has none.** One process binds; the other's assertions execute against the **wrong worktree's application** and pass or fail meaninglessly. This is worse than a crash — it is a silent false green. |
| **Prevention** | Validation is a **global mutex**: one test agent workspace-wide, never concurrent with a writer in the same worktree. |
| **Detection** | Pre-flight port check on 3000/9331/9332/9345 before spawning. |
| **Recovery** | Discard the run and re-run serially. No repository mutation needed. |
| **Owner** | Orchestrator |
| **Blocking** | BLOCKING — every validation gate |

---

## R-18 · Missing governance tests treated as passing *(added at Run A)*

| | |
|---|---|
| **Probability** | Medium |
| **Severity** | High |
| **Trigger** | Declaring readiness on the strength of suites that do not test what is assumed |
| **Mechanism** | Of the six governance tests the governing documents name: **parent cross-child negative RLS — ABSENT**, and **unwritable today** (fixtures hold one student, one parent link, one centre; adding rows moves the pinned canonical checksum). **Cross-centre management isolation — ABSENT.** **Ordinary-prose acceptance — ABSENT**, and the current test asserts the opposite. **Duplicate-AI-submission — PARTIAL**: it asserts the returned id is identical, never `count(*) = 1`, so a path that inserted a second row and returned the first id would pass. **Parent canonical read — PARTIAL**: correct in the migration, but no catalogue assertion covers it. Only the A-010 audit-denial test and the grounding contradiction test are fully present. |
| **Prevention** | Write the missing tests **before** declaring readiness. Fixture changes and the checksum re-baseline must be scheduled as **one atomic unit with operator sign-off**. |
| **Detection** | Named-requirement audit; the evidence auditor. |
| **Recovery** | Write the test; re-run; re-baseline the checksum once, deliberately. |
| **Owner** | Backend implementer / operator (OD-9) |
| **Blocking** | BLOCKING — F-17 exit |

---

## R-19 · Live WCAG 2.2 AA failure on seven primary actions *(added at Run A)*

| | |
|---|---|
| **Probability** | **Certain — it is the current state** |
| **Severity** | Medium-High |
| **Trigger** | Already live |
| **Mechanism** | F1 resolved the frame's pink against accessibility: `#ec4899` gives 3.53:1 under white label text, so the accessible fill `#d6357a` (4.52:1) was introduced. **The fix landed in tokens as `brand-700` but the components still use `brand-600`.** Seven components render white-label buttons on `bg-brand-600`: `management-dashboard.tsx:105`, `management-report-review.tsx:137`, `management-reports-queue.tsx:115`, `management-wording-editor.tsx:94`, `parent-dashboard.tsx:91`, `parent-reports-list.tsx:82`, `returned-reports-queue.tsx:61`. Separately, `RATING_RAMP` has **zero consumers** — the assessment chips use ad-hoc Tailwind classes that the 46 F1 assertions never contrast-verified. |
| **Prevention** | Fix at F-16 (or earlier where a checkpoint already owns the file). Route the rating chips through `RATING_RAMP` at F-07. |
| **Detection** | Rendered-page contrast checking. **Nothing today tests the real DOM against WCAG** — the 46 assertions test **token pairs**, not pages. Lighthouse is mandated by A-009 and absent. |
| **Recovery** | Token swap; re-verify. |
| **Owner** | Frontend / integration implementer |
| **Blocking** | BLOCKING — F-17 exit |

---

## Summary — blocking risks by gate

| Gate | Blocking risks |
|---|---|
| **Phase 1 entry** | R-01, R-02 |
| **B-V2 exits** | R-04, R-05, R-12 |
| **F-06 exit** | R-03, R-04 |
| **F-12 entry** | R-08 |
| **F-14 / F-15 entry** | R-09 |
| **F-12/14/15 exit** | R-10 |
| **F-16 entry** | R-13 |
| **F-17 entry** | R-07 |
| **F-17 exit** | R-14, R-18, R-19 |
| **Participant testing** | R-15 |
| **Every phase** | R-11, R-17 |

---

---

## Run B additions — opened at Phase 0 by the main orchestrator

| ID | Risk | Severity | Evidence | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|
| **R-20** | **Hard-coded `7`-migration pins are more numerous than any prior inventory recorded.** Run A named two; Phase 0 found a third; the independent backend verifier exposed **three more in runtime SQL suites** — six in total. The V2 migration moves the census to 8, so each unreconciled pin is a red gate. | **High** | Direct grep at `4b58c6b0` (three `.mjs`); backend verifier at `e5a66d7` (three `.sql`) | `.mjs` trio reconciled by **B-V2-1**. SQL trio named explicitly in their owners' assignments: `asm-suite.sql:156` → **B-V2-2**; `verify-local-fixtures.sql:379` and `lifecycle-canonical.sql:233` → **B-V2-3**. All six fall inside already-owned paths, so no contract widened. Verified census: **8 migrations, 26 tables, 31 functions, 12 enums, 29 policies**. | backend implementer | **Partially mitigated — 3 of 6 done at `e5a66d7`; remaining 3 assigned** |
| **R-25** | **My own Phase 0 pin search was `.mjs`-shaped and missed the SQL suites.** The same blind spot could hide other stale pins or stale vocabulary in `.sql` files that no `.mjs` grep will surface. | **Medium** | R-20's three-to-six correction | Vocabulary sweep re-run across `--include=*.sql` as well as `*.mjs`/`*.ts`, identifying `local_fixtures.sql`, `verify-local-fixtures.sql`, `asm-suite.sql`, `lifecycle-canonical.sql`, `run-assessment.mjs`, `run-integration.mjs`, `grounding.ts`, `provider.ts`. All eight are inside B-V2-2/B-V2-3 owned paths and are named explicitly in those assignments. | main orchestrator | **Mitigated — sweep widened** |
| **R-26** | **A verifier run against a partially-landed coordinated checkpoint produces a FAIL that is structurally correct but easy to misread as a defect in the work that did land.** The Backend V2 verifier graded `e5a66d7` alone and returned `pass=false` with six Critical findings — every one of them owned by B-V2-2 or B-V2-3, which had not executed. | **Medium** | Verifier verdict at `e5a66d7`; cause was an orchestrator `args`-marshalling defect that skipped both remaining implementers | The Backend V2 verifier is re-run **only after B-V2-3 commits**, per the operator ruling that the three commits form one coordinated checkpoint. The premature verdict is retained as evidence — it independently confirms B-V2-1 is sound and supplied exact file:line targets now fed into B-V2-2 and B-V2-3. **A premature FAIL must never be recorded against B-V2-1 in the final report.** | main orchestrator | **Mitigated — verdict reclassified as a mid-checkpoint diagnostic** |
| **R-21** | **The `bg-brand-600` AA defect is larger than recorded.** Run A states seven sites; twelve exist. Remediating only seven leaves live AA failures on Parent and Management surfaces. | **Medium** | `grep -n bg-brand-600` at `d1883db9` → 12 hits across 11 components | **F-01a** scoped to the 10 text-bearing sites across 9 components. Two exclusions recorded with reasons (logotype exemption; decorative fill). See tracker §7.1. | frontend implementer | **Mitigated at Phase 0** |
| **R-22** | **The read-RPC arity mismatch has no backend owner.** A `reportId` → `(class_session_id, student_id)` resolver does not exist. The fixture masks it; the real adapter cannot. Treating it as a frontend cast would fabricate a key. | **High** | `physical-test-port.ts:62,77` vs governed RPC signatures | Added to **both** F-16 scope and backend correction scope. A resolver is a backend deliverable. Six frontend call sites enumerated in tracker §7.3. | integration + backend | **IN REMEDIATION at Run C1 Phase C2 (2026-08-06).** Root cause confirmed by direct schema inspection: `public.reports` carries **both** `class_session_id` and `student_id` and constrains them with `reports_session_student_key UNIQUE (class_session_id, student_id)`, so `reportId → (class_session_id, student_id)` is a **total, well-defined single-row lookup** — the map exists in the schema, only the governed accessor was missing. Remedy: a new SECURITY DEFINER RPC `public.report_resolve_context(p_report_id uuid) RETURNS TABLE(class_session_id uuid, student_id uuid)`, granted to `authenticated` only, resolving the caller from `auth.uid()` and their single active membership in the report's own centre, dispatching on role with the **same predicates as `report_get_canonical`** (trainer → `app_trainer_reaches_session`; management → centre-scoped, no status gate so correction tracking still navigates; parent → `app_parent_reaches_student` **and** `latest_submitted_version_id IS NOT NULL`). Returns **exactly two uuid columns and nothing else**; every denial is a zero-row return, never an error. **No frontend cast and no fabricated key.** See the Run C1 report §5. |
| **R-23** | **Guarded migration ordering is the single point of failure for R-B3.** If fixtures load before the enum rename, the zero-row guard aborts; if the guard is weakened to compensate, Amendment 006 is breached. | **High** | Pre-reset census: `observation_ratings` = 9 rows in old vocabulary | Strict ordered replay: reset → migrations (guard runs on empty table) → updated fixtures → post-reset census. **No manual row deletion. No guard amendment.** Deliberate-violation abort transcript is required success evidence. | backend implementer | **Open — B-V2-1 exit gate** |
| **R-24** | **Effort level of the main orchestrator cannot be introspected from inside the session.** The operator requested High. The model is confirmed `claude-opus-5[1m]`; effort is a session setting not readable at runtime. | **Low** | Environment block confirms model only | Declared openly to the operator before any work was assigned. **Subagent** model and effort are set explicitly per call and are verifiable in the workflow script. No substitution was made. | main orchestrator | **Declared — operator may verify via `/config`** |

| **R-27** | **OPERATOR-ONLY BLOCKER — Backend V2's database-dependent verification cannot complete autonomously.** `supabase db reset` at B-V2-1 destroyed the three ratified synthetic Auth identities. `auth.users` now holds **one orphan row**, `trainer.fixture@example.test` under the **non-ratified** UUID `b86fddc1-768e-428d-bd4d-ffb40d20bab7` (ratified: `d0000000-0000-4000-8000-000000000002`), and `public.accounts` is **0**. `npm run fixtures:local` aborts at its clean-load preflight; the only sanctioned recovery, `-- --reload`, prompts for fixture passwords via `promptForPasswords()`, which throws when `stdin.isTTY` is false. | **High** | Verified directly: `auth.users`=1, `accounts`=0, `observation_ratings`=0, migrations=8 | **None available to an autonomous agent, by design.** `CLAUDE.md` §11 "Fixture credentials — absolute" permits **no** environment-variable path, **no** default, **no** generated-and-discarded value and **no** file source, and forbids requesting or transmitting a password in chat in either direction. Inserting into `auth.users`, supplying a `password_hash`, or weakening the loader preflight are each independently prohibited (§12 Step 7F). **No workaround was attempted and none may be.** | **OPERATOR** | **RESOLVED BY THE OPERATOR — 2026-08-06, recorded at Run C1 Phase C0.** The operator ran `npm run fixtures:local -- --reload` from an interactive local terminal. **Independently reproduced by the Run C1 orchestrator without handling any credential**, by re-running `scripts/fixtures/verify-local-fixtures.sql` through the loader's own `docker exec -i … psql` channel and recomputing the SHA-256 in Node: `auth.users` = **3** with the ratified UUIDs `d0000000-0000-4000-8000-00000000000{1,2,3}` (management/trainer/parent), `public.accounts` = **3** each bound to its ratified `auth_user_id`, `centre_memberships` = 3 active (one per role, one centre), **25 application-domain rows**, **28 canonical rows**, canonical fixture SHA-256 = **`6bdff280e550503d212832c2fd1099ac45880c2bc430bfdff8f92a3b35ffc576`**, `report_versions` = 0, `report_version_ratings` = 0, `competency_rating` = `[beginning, developing, mastering, mastered]`, `class_grade_code` = `[beginner, intermediate, advanced]` (unchanged), 8 migrations applied. **No password was requested, displayed, logged, saved or transmitted at any point**, and none is persisted anywhere. R-27 no longer blocks anything. |
| **R-28** | **Unlayered CSS silently voids Tailwind utilities on every form control.** `app/globals.css:154-159` declares an **unlayered** `button, input, textarea, select { font: inherit; color: inherit; }`. Unlayered CSS outranks every `@layer` rule, so Tailwind's `.text-white` / `.font-bold` — emitted into `@layer utilities` — are dropped on **every** `<button>` in the application. `<Button variant="primary">` measured **#1b2b4b on #d6357a = 3.113:1** in the rendered DOM: a live AA failure on the app's most important action control. Buttons that appear correct only inherit white from a dark ancestor. | **High** | Measured in a production build on two independent surfaces by the independent verifier | **F-01b** — bounded correction moving the reset so utilities win, with before/after contrast **measured in the rendered DOM**, plus a collateral sweep over controls that were silently relying on inheritance. **Pre-existing** (introduced at `84b4518`, not by F-01a's `6e8816e`) but it defeated F-01a's load-bearing claim, so the lane was halted until it is fixed. | frontend implementer | **Open — F-01b assigned; F-11 gated behind it** |
| **R-29** | **A declared Tailwind class was accepted as evidence of a rendered result.** F-01a's workstream log asserted contrast was "measured, not asserted from the token table" while the app's primary action was never measured and in fact failed. The token pair was correct; the rendered pair was not. | **Medium** | R-28's root cause | Every frontend verifier contract now requires accessibility to be **measured in the rendered DOM in a production build**, with the explicit instruction that *a declared Tailwind class is not evidence it applied*. | main orchestrator | **Mitigated — verifier contract strengthened** |

### Summary — Run B blocking additions

| Gate | Blocking risks |
|---|---|
| **B-V2-1 exit** | R-20, R-23 |
| **F-01a exit** | R-21 |
| **F-16 entry** | R-22 |

---

*Produced at Run A, 2026-08-06. Run B additions appended by the main orchestrator at Phase 0, 2026-08-06, from direct verification. No repository file, Git state, database or screenshot was modified.*

---

## Run C1 reconciliation — appended at Phase C0, 2026-08-06

Historical rows above are **not rewritten**. Only current-state cells were corrected, each marked in place. This section records the resulting risk posture.

### Status changes

| Risk | Was | Now | Basis |
|---|---|---|---|
| **R-27** fixture credential | **OPEN — blocking** | **RESOLVED** | Operator ran the reload interactively; independently reproduced by the orchestrator with **no credential handled** — canonical SHA-256 `6bdff280…c576`, 28 canonical rows, 3 ratified Auth UUIDs, 25 domain rows |
| **R-22** read-RPC arity | **Open — carried into F-16** | **IN REMEDIATION at C2** | `reports_session_student_key UNIQUE (class_session_id, student_id)` makes the resolution total; a governed resolver RPC is being added as a backend deliverable |
| **R-23** guarded migration ordering | **Open — B-V2-1 exit gate** | **CLOSED** | The ordered replay completed; `verify-fresh-apply` proves all migrations apply cleanly from empty and the fixture database is catalogue-identical |

### Backend V2 database-dependent verification — no longer blocked, now EXECUTED

Every gate that Run B recorded as blocked solely because fixtures were absent has now been run. Exit codes are recorded in the Run C1 report §3. **One gate failed, and only one**: `run-canonical.mjs` failed on the **stale checksum pin** `d6a314b4…b87517` at line 36, which Run B §8.7 predicted and deliberately declined to guess. The true post-Amendment-006 value was **derived by running the verifier**, not precomputed, and reconciled in one bounded commit.

### Risks opened at Run C1

| ID | Risk | Severity | Evidence | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|
| **R-30** | **The function/EXECUTE census moves for the first time since it was pinned.** Adding the resolver RPC moves 31 → 32 functions, 23 → 24 `authenticated` EXECUTE grants and 8 → 9 migrations. Six or more pins hard-code these numbers across three suites; every unreconciled pin is a red gate, and `COMPETENCY_VOCABULARY_RECONCILIATION_PLAN.md:164` makes a moving census a stop-and-report condition. | **Medium** | Census pin inventory taken at Run C1 Phase 0 | The census move is **explicitly authorized** by the Run C1 operator directive §7 ("function and authenticated-EXECUTE census is updated wherever pinned"), so it is a reconciliation, not a violation. Every pin site was enumerated before the change and re-greped after. An independent verifier replays migrations from empty and re-reads the live census. | backend implementer + verifier | **Mitigated — reconciled and independently verified** |
| **R-31** | **A resolver is an inherent disclosure surface.** Any function mapping an opaque id to a pair can become an existence oracle if its denial is distinguishable from its success, or if it is less restrictive than the projections it feeds. | **High** | Design review at Run C1 Phase C2 | The resolver returns **exactly two uuid columns**, applies the **same** role predicates as `report_get_canonical`, adds a **stricter** parent gate (`latest_submitted_version_id IS NOT NULL`, so a parent cannot resolve an unsubmitted report), and makes **every** denial an identical zero-row return with no error and no message. It is therefore strictly less disclosing than every projection that already ships. Proven adversarially by the independent verifier against unknown-id, wrong-role, wrong-centre, unlinked-parent, pre-submission-parent and unauthenticated callers. | backend implementer + verifier | **Mitigated — bounded by design and proven** |
| **R-32** | **Route protection is the single point of failure for F-16.** Every portal route is currently reachable without identity. A guard that is client-side only, or that trusts the `role` query parameter, would look correct and prove nothing. | **High** | Run B §10 — no guard exists on any route | Server-side enforcement via the framework mechanism the **installed** Next.js 16.2.10 expects — `proxy.ts` (evidence: `next/dist/lib/constants.js` defines both conventions; `next/dist/build/index.js` makes having **both** a hard build error and warns that `middleware` is deprecated). Membership is resolved from live server state on every request; the `role` query parameter is presentation only and is proven to grant nothing. | integration writer | **Open — F16-B** |
| **R-33** | **The secure F17 runner handles three real passwords.** A runner that logged, serialized, screenshotted or persisted one — or that accepted one from a non-TTY, an environment variable or a file — would breach `CLAUDE.md` §11 irreversibly. | **High** | Runner is new code at Run C1 §10 | Modelled directly on the accepted `scripts/fixtures/load-local-fixtures.mjs` credential discipline: no-echo interactive TTY only, hard refusal on a non-TTY, no env/file/default/generated path, process memory only, never interpolated into an error, both streams captured and never rendered, **no pattern-based redaction**. Independently security-reviewed before delivery. **The runner is delivered for the operator to execute; it is never run autonomously, and no password is ever requested through chat.** | integration writer + security reviewer | **Open — operator-assisted by design** |

### Blocking risks by gate, after Run C1 Phase C0

| Gate | Blocking risks |
|---|---|
| **Backend V2 acceptance** | *(none — R-27 and R-23 closed; all gates executed)* |
| **F-16 entry** | *(none — R-22 in remediation at C2, which lands before F-16 needs it)* |
| **F-16 exit** | R-32 |
| **F-17** | R-33 *(operator-assisted by design, not a defect)* |

*Appended by the Run C1 main orchestrator, 2026-08-06, from direct verification. No credential appears anywhere in this document.*
