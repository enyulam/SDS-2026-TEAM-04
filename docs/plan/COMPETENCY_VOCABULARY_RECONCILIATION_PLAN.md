# B.E.S.T Coach — Competency Vocabulary Reconciliation Plan

**Status:** Implementation baseline — **procedural, subordinate to Amendment 006**
**Created:** 2026-08-05 23:20 (Asia/Singapore), at Vocabulary Governance Checkpoint **V1**
**Governing instrument:** `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_006.md` (**A-049 … A-055**)

---

## 0. What this document is, and is not

This is the **bounded implementation sequence** for the vocabulary ratified by Amendment 006:

**`Beginning` → `Developing` → `Mastering` → `Mastered`** (storage `beginning`, `developing`, `mastering`, `mastered`), replacing `emerging` / `developing` / `secure` / `advanced`.

**It is procedural and subordinate.** It cannot override the specification, any amendment, `CLAUDE.md`, or the Implementation Plan. Where it appears to disagree with Amendment 006, **Amendment 006 governs**.

**It is not an authorization.** Each of **V2**, **V3** and **V4** requires its **own explicit orchestrator authorization** before any file it names is touched. Amendment 003 A-032's non-authorization rule applies in full.

**V1 is complete.** V1 was governance only: Amendment 006 ratified, active instructions reconciled, canonical progress recorded. **No application code, SQL, fixture, generated type or test was changed in V1, and no database was touched.**

### The rule that governs every checkpoint below

**Global keyword replacement is prohibited** (A-054). Every change is made by **inspecting context** and changing **only** competency-rating labels. The following must survive untouched:

- **Class Grade** — `Beginner` / `Intermediate` / `Advanced`, `class_grade_code`, its fixtures, seed assertion, UI labels and tests;
- **ordinary prose** using *beginning*, *mastering*, *mastered*, *mastery*, *secure*, *emerging* or *advanced*;
- **historical records** and quoted superseded text;
- the **End-of-Term Performance Report** instrument and its `Excellent` / `Good` / `Needs Improvement` scale;
- unrelated identifiers (for example `lock_version advanced`, `insecure` Docker TCP references).

### The window

**The safe migration window is open and closes on the first `report_versions` row.** Report-content hash v1 serializes the textual enum labels, so a rename after report data exists produces permanently unreproducible hashes on frozen immutable rows (A-053). **V2 should not be deferred past the creation of report data.**

---

## 1. Checkpoint V2 — Backend / database

**Branch:** `feat/48h-backend`
**Requires:** its own orchestrator authorization
**Precondition:** Amendment 006 merged into the branch; worktree clean

### 1.1 Owned paths

```
supabase/migrations/<new timestamp>_competency_vocabulary_rename.sql   (new file only)
server/modules/framework/dimensions.ts
server/modules/ai-drafting/provider.ts
server/modules/ai-drafting/grounding.ts
server/modules/ai-drafting/request-draft-core.ts
server/db/database.types.ts                     (regenerated, never hand-edited)
scripts/fixtures/local_fixtures.sql
scripts/fixtures/verify-local-fixtures.sql
scripts/tests/assessment/asm-suite.sql
scripts/tests/assessment/run-assessment.mjs
scripts/tests/step-7i/lifecycle-canonical.sql
scripts/tests/integration/run-integration.mjs
docs/workstreams/48H_BACKEND_PROGRESS.md
```

**Explicitly not owned by V2:** any existing applied migration file · `class_grade_code` and every class-grade artefact · any frontend path · any `docs/spec/` instrument · any Amendment 001–006 file.

### 1.2 Sequence

1. **Forward enum-rename migration** — one **new** file. Exactly three `ALTER TYPE public.competency_rating RENAME VALUE` statements: `emerging`→`beginning`, `secure`→`mastering`, `advanced`→`mastered`. **`developing` is not renamed.** **Never edit an applied migration.**
2. **Zero-row guards** — a **fail-closed, in-transaction** guard preceding the renames, proving zero rows in at least `report_versions`, `report_version_ratings` and `observation_ratings`. **`RAISE EXCEPTION` and abort if the precondition does not hold.** The guard is a proof, never an assumption.
3. **Backend rating union** — `RATING_LEVELS` and the derived `RatingLevel` type.
4. **Rubric anchors** — re-key `RUBRIC_ANCHORS` positionally. **Anchor text is verbatim-unchanged** (A-050). Changing a single character of anchor prose is out of scope.
5. **Polarity mapping** — `POLARITY_BANDS`: `beginning`→`needs_support`, `developing`→`developing`, `mastering`→`positive`, `mastered`→`positive` (A-051). Also correct any **inline re-derivation** in a test harness so it agrees exactly.
6. **Provider schema and prompt** — the inline rating union in the provider contract, and the prompt rule naming the raw labels.
7. **Contextual grounding** — implement **attribution and taxonomy-disclosure detection** per A-052. **A bare-word regex is prohibited.** Ordinary prose stays legal; `mastered` / `mastery` are **retained** in achievement-language detection.
8. **Audit-payload privacy detection** — update every assertion that enumerates rating labels literally. **This ships in the same checkpoint as the migration** (A-052).
9. **Fixtures** — seeded rating rows and any load-abort assertion requiring a spread across levels.
10. **Assessment tests** (T-ASM), **lifecycle tests** (Step 7I), **integration tests** — literals, and the intent of any rating-mutation or parity probe.
11. **Generated database types** — **regenerate from the migrated schema.** Never hand-edit (ADR-8).

### 1.3 Exit conditions

- Migration applies to a **local disposable database only**, and **aborts** when the zero-row guard is violated — proven by deliberately violating it.
- Grounding contradiction test **fails closed**: a `beginning` dimension described in achievement language is **rejected by the system**, not eyeballed.
- Ordinary prose — "at the beginning of the session", "has mastered maintaining eye contact" — is **accepted**, proving no bare-word regression.
- The audit-payload privacy assertion detects the **new** labels; a deliberately planted new-label payload is caught.
- Generated types show the new union; no hand edit.
- **Class Grade artefacts are byte-unchanged** — verified, not assumed.
- Enum, table, function and seed-row **counts unchanged**; verifier census passes.

### 1.4 Stopping conditions

**Stop and report without proceeding if:** the zero-row guard fails on a real database; any `report_versions` row exists; a hash anomaly appears; the enum rename fails; counts change; a class-grade artefact would need to change; or the contradiction test cannot be made to fail closed.

---

## 2. Checkpoint V3 — Frontend

**Branch:** `feat/48h-frontend`
**Requires:** its own orchestrator authorization
**Precondition:** V2 complete and merged, or its rating union pinned; worktree clean

### 2.1 Owned paths

```
lib/frontend/contracts/physical-test.ts
lib/frontend/fixtures/dimensions.ts
lib/frontend/fixtures/physical-test-fixture.ts
features/trainer/trainer-assessment.tsx
features/trainer/trainer-report-review.tsx
tests/frontend/trainer-browser-smoke.mjs
tests/frontend/three-role-browser-smoke.mjs
docs/workstreams/48H_FRONTEND_PROGRESS.md
```

**Explicitly not owned by V3:** any backend path · any migration · any `class_grade_code` artefact or `classGrade` union · any `docs/spec/` instrument.

### 2.2 Sequence

1. **Frontend rating union** — `RATING_LEVELS` / `RatingLevel` in the contracts module. **Leave the `classGrade` union in the same file untouched** — it is Class Grade, not a rating.
2. **Frontend anchors** — re-key positionally; text **byte-identical to the backend copy** (A-050).
3. **Fixture ratings** — the nine-dimension rating sets. **Leave `classGrade` fixture values untouched.**
4. **Assessment controls** — the rating label map and the chip control.
5. **Review labels** — the rating label map on the trainer review surface.
6. **Help text** — the instruction naming the four selectable levels, rewritten as prose.
7. **Grounding-rejection prose** — the user-visible rejection message naming a rating. **Rewrite as a sentence**, not by string substitution.
8. **Browser and DOM assertions** — visible-label assertions in both smoke suites.
9. **Class-grade vocabulary — unchanged.** `Beginner` / `Intermediate` / `Advanced` stay exactly as they are.
10. **Rating colour ordering — unchanged.** The four-step severity ramp transfers by **key rename only**: level 1 red, level 2 amber, level 3 teal, level 4 green. **Do not re-map, re-order or re-tokenize the ramp** unless contrast verification finds a defect, in which case fix only the failing pair and record it.

### 2.3 Exit conditions

- Assessment control renders the four ratified labels in ratified order.
- Colour ramp unchanged in ordering and token values; WCAG 2.2 AA contrast re-verified for all four states.
- Both smoke suites pass against the new labels.
- Frontend anchors **byte-identical** to backend anchors.
- **Class-grade labels and `classGrade` unions byte-unchanged** — verified.
- No backend or migration path touched.

### 2.4 Stopping conditions

**Stop and report if:** a contrast pair fails and cannot be fixed without a token change; a fixture cannot express the new union without a backend change; or any change would require touching a class-grade artefact.

---

## 3. Checkpoint V4 — Cross-branch integration

**Branch:** post-merge integration branch or checkpoint
**Requires:** its own orchestrator authorization
**Precondition:** V2 and V3 complete

### 3.1 Verifications

1. **Rating unions agree exactly** — the backend framework constant and the frontend contract declare the same four values in the same order. They are **independent declarations with no shared import**, so this is the single most likely residual defect.
2. **Anchor copies agree verbatim** — backend and frontend anchor text compared **byte-for-byte**, not read side by side.
3. **Polarity mappings agree** — the backend constant, the frontend contract, any inline test-harness re-derivation, and Amendment 006 A-051 all agree.
4. **Clean migration replay** — every migration replays in order from a clean checkout onto a disposable database, including the zero-row guard.
5. **Canonical database census** — enum labels and their physical sort order; enum, table, function and seed-row counts unchanged from the ratified inventory.
6. **No report hash anomaly** — no stored `content_hash` is unreproducible; the hash function reproduces its inputs under the new labels.
7. **Real three-role flow** — trainer assessment → grounded AI draft → trainer approval → management review → Approve & Submit → parent view, exercised end to end with the new vocabulary.

### 3.2 Exit conditions

All seven verifications pass, **Class Grade is confirmed unchanged**, and no application-owned path outside the V2/V3 owned lists was modified.

### 3.3 Stopping conditions

**Stop and report if:** the unions or anchors diverge; migration replay fails; a census count moves; any hash anomaly appears; or the three-role flow cannot complete.

---

## 4. Checkpoint summary

| Checkpoint | Scope | Branch | Status |
|---|---|---|---|
| **V1** | Governance — Amendment 006, active-instruction reconciliation, progress records | `main` | **Complete (2026-08-05)** |
| **V2** | Backend / database | `feat/48h-backend` | **Pending — requires authorization** |
| **V3** | Frontend | `feat/48h-frontend` | **Pending — requires authorization** |
| **V4** | Cross-branch integration | integration checkpoint | **Pending — requires authorization** |

**Do not merge either implementation branch into `main` as part of this sequence.** Governance propagates `main` → branches; implementation returns by its own authorized route.

---

*Created 2026-08-05 at Vocabulary Governance Checkpoint V1. Procedural and subordinate to Amendment 006. No SQL, application code, fixture, generated type or test was changed to produce it, and no database, container, build or server was run.*
