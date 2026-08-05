# B.E.S.T Coach — MVP Specification v3 Amendment 006

**Status:** **Ratified by orchestrator**
**Ratification date:** 2026-08-05 23:20 (Asia/Singapore)
**Clauses:** **A-049 … A-055**

**Amends:** `BEST_Coach_Complete_MVP_Specification_v3.md` (this repository, `docs/spec/`) and, **only where explicitly named**, `BEST_Coach_MVP_Specification_v3_Amendment_002.md`, `BEST_Coach_MVP_Specification_v3_Amendment_003.md` and `BEST_Coach_MVP_Specification_v3_Amendment_004.md`

> **Clause-continuity check.** The highest clause in any committed instrument is **A-048** (Amendment 005). No clause in the range **A-049 … A-055** is used anywhere in the committed tree. **A-049 … A-055 is therefore the correct next range, and this is Amendment 006.** No ratified instrument was renumbered, edited or overwritten to produce it.

> **This amendment is the output of the vocabulary-reconciliation checkpoint reserved by Amendment 005 A-048.** A-048 states: *"The competency-rating vocabulary is not amended by this amendment. `Emerging` → `Developing` → `Secure` → `Advanced` and its polarity bands are governed by a separate vocabulary-reconciliation checkpoint."* **Amendment 006 discharges that reservation.** A-048 is **fulfilled, not superseded**, and **no other Amendment 005 clause is named, altered or weakened.**

---

## Relationship to Specification v3 and Amendments 001–005

Specification v3 remains the **authoritative baseline** for this build. Amendment 001 (**A-001 … A-013**), Amendment 002 (**A-014 … A-024**), Amendment 003 (**A-025 … A-032**), Amendment 004 (**A-033 … A-040**) and Amendment 005 (**A-041 … A-048**) remain in force **except for the specific clauses named in the supersession table below**.

This amendment ratifies a change to the **four-level competency-rating vocabulary — the labels only** — together with every derived ruling a label change alone cannot settle: behavioural-anchor disposition, polarity-band assignment, AI leak-detection treatment, the exact authorized schema change, the boundary against the unrelated Class Grade vocabulary, and documentary authority.

### Rules of precedence for this amendment

1. Every v3 clause not named here remains in force, unchanged.
2. **Amendment 006 names no Amendment 001 clause.** A-001 … A-013 are untouched, and every evidence, audit and continuity safeguard applies unweakened.
3. Amendment 002 is superseded **only** for its explicit retention of the four previous ratings. **A-016's Class Grade vocabulary is expressly not named and expressly not changed.** A-014, A-015, A-016, A-017, A-018, A-019, A-020, A-021, A-022, A-023 and A-024 remain **fully active**.
4. Amendment 003 **A-026 is superseded for the four `competency_rating` labels and for nothing else.** A-026's enum-versus-reference-table doctrine, its Class Grade ruling and every other vocabulary it governs are **preserved unchanged**. **A-031's enum, table and seed-row counts are not superseded** — a label rename changes no count.
5. Amendment 004 **A-040 is extended additively, and only by the exact bounded change named in A-053.** A-040's Step 7I additions and A-032's non-authorization rule remain binding.
6. **Amendment 005 is not superseded in any respect.** A-048's reservation is **discharged**; the 36-screen inventory, the canonical routes, the twelve-screen physical-test subset, the deferral boundary, the visual-authority precedence, the authentication rulings and the hierarchy mapping are all **untouched**.
7. **A later amendment wins only for the clauses it explicitly supersedes.** Where Amendment 006 names a clause, Amendment 006 governs it. Where it does not, v3-as-amended-by-001-002-003-004-005 governs.
8. Specification v3 and Amendments 001–005 are **never edited in place**. All six remain byte-for-byte unchanged. Superseded rules are superseded **explicitly, here** — historical records are never rewritten to conceal a prior decision.
9. `CLAUDE.md`, the Implementation Plan, the Figma matrix, the final UI inventory, the physical-test contract, the assessment-write baseline and the lifecycle baselines must agree with v3 as amended by 001–006; where any still contains superseded wording, the governing amendment prevails and the stale text is historical.

**Precedence (highest first):** **v3 → ratified amendments (001, 002, 003, 004, 005, then 006 for the clauses each names) → `CLAUDE.md` → Implementation Plan → Figma Design 2 → `STATUS.md` → `BUILD_NOTES.md` → temporary migration tracker → the 48-hour physical-test contract.**

### Scope statement — read this before treating this amendment as permission to build

Amendment 006 governs **assessment vocabulary, behavioural-anchor disposition, polarity semantics, AI leak-detection treatment and the exact authorized schema change**. It is **not an implementation authorization**. It applies no migration, regenerates no type, edits no application code and runs nothing. Amendment 003 A-032's non-authorization rule applies in full.

**The migration authorized by A-053 may not be authored, staged or applied until the orchestrator authorizes that checkpoint separately.** The bounded implementation sequence is `docs/plan/COMPETENCY_VOCABULARY_RECONCILIATION_PLAN.md`, whose **V2** (backend/database) and **V3** (frontend) checkpoints each require their own authorization.

**A label change is not a framework change.** The nine dimensions, the mandatory-nine rule (A-017), the assessment instrument, the report lifecycle and every governance control attached to a rating are untouched.

---

## Supersession and precedence table

| Clause | v3 section(s) / clause superseded | Effect on Amendments 001–005 | Other active documents affected | Effect |
|---|---|---|---|---|
| **A-049** | **§3.2**'s four-level scale statement; **§3.3** rubric table, for the **label column of rows 1, 3 and 4 only**; **§3.5** decision 2, and decision 3's map expressed in the old labels; **§8**'s chip-rating wording; **§20**'s `competency_rating` enum list; the **glossary** four-level-scale entry. **Consequentially re-anchored, not independently superseded:** §3's `rated Emerging→Advanced` diagram edge and §12.1's `movement across Emerging→Advanced` aggregate wording, which name the scale endpoints and follow the ratings automatically | **Amendment 002's explicit retention of the four previous ratings superseded**; **Amendment 003 A-026's `competency_rating` label list superseded**; A-031 counts unchanged; **no Amendment 001, 004 or 005 clause named** | `CLAUDE.md` §5; Implementation Plan; Step 7F baseline; Step 7I baseline; physical-test contract; assessment-write baseline; final UI inventory | The four competency-rating labels become **`Beginning` → `Developing` → `Mastering` → `Mastered`** (storage `beginning`, `developing`, `mastering`, `mastered`). **Arity, ordinal position and low-to-high direction unchanged.** `Developing` unchanged in label and position |
| **A-050** | **§3.3** rubric-anchor **text** — named to confirm it is **not** changed | none | `CLAUDE.md` §5; framework constants; frontend fixture anchors | **All four behavioural anchors carry forward positionally, verbatim.** Semantics do not change because labels changed. Emerging→Beginning · Developing→Developing · Secure→Mastering · Advanced→Mastered |
| **A-051** | **§3.3** polarity column and **§12.1**'s polarity derivation, for their label keys only | none | `CLAUDE.md` §5 polarity bullet; grounding pipeline | **`beginning` → `needs_support` · `developing` → `developing` · `mastering` → `positive` · `mastered` → `positive`.** Level 3 **retains** `positive`; level 4 remains the exceeds-expectations level |
| **A-052** | **§12.1** step 3, insofar as the raw-label leak guard is read as permitting a bare-word match | none; **§12's grounding non-negotiable strengthened, not relaxed** | `CLAUDE.md` §3.4, §4; grounding validation; AI provider prompt; audit-payload privacy assertions | **Contextual attribution detection is authorized; blanket rejection of ordinary label words is prohibited.** Ordinary prose using *beginning*, *mastering*, *mastered* or *mastery* remains **legal**. Achievement-language detection **retains** `mastered`/`mastery` |
| **A-053** | **A-040's** exhaustive Step 7I change list, extended **additively and only** by the change named below | **A-040 extended; A-031 counts unchanged; A-032 binding** | `CLAUDE.md` §6.1; Implementation Plan Gate G1; migration trackers; reconciliation plan V2 | Authorizes **exactly three `ALTER TYPE public.competency_rating RENAME VALUE` statements** in **one** future forward migration, behind a **fail-closed in-transaction zero-row guard**. **No type, table, enum-count, policy or function-count change.** **Not an implementation authorization** |
| **A-054** | none — this clause **preserves and disambiguates** | **A-016's and A-026's Class Grade vocabulary preserved unchanged and reaffirmed** | `CLAUDE.md` §6, §6.1; Figma matrix; frontend contracts; fixtures | **Class Grade remains `Beginner` / `Intermediate` / `Advanced` (`beginner`, `intermediate`, `advanced`), unchanged and unaffected.** **Global keyword replacement is expressly prohibited** |
| **A-055** | none — this clause **resolves a documentary-authority ambiguity** | none | `governance-source/`; repository `docs/` | The **in-repository copies are authoritative**. `governance-source/` is a **non-authoritative mirror/reference source** and may never override a repository instrument |

---

## A-049 — The ratified competency-rating vocabulary

**The four competency-rating labels are `Beginning` → `Developing` → `Mastering` → `Mastered`.**

| Ordinal | Storage value | Display label | Replaces | Polarity band (A-051) |
|---:|---|---|---|---|
| 1 | `beginning` | Beginning | `emerging` / Emerging | `needs_support` |
| 2 | `developing` | Developing | *(unchanged)* | `developing` |
| 3 | `mastering` | Mastering | `secure` / Secure | `positive` |
| 4 | `mastered` | Mastered | `advanced` / Advanced | `positive` |

**Operator decision and rationale.** The orchestrator ratified this vocabulary at the Vocabulary Governance Checkpoint V1 on 2026-08-05. The previous labels described *states of security* (`Emerging` → `Secure`); the ratified labels describe *progress toward mastery* (`Beginning` → `Mastered`), which reads more naturally to trainers and parents and states the same four behavioural thresholds in the academy's own idiom. **The instrument, thresholds and ordering are unchanged; only the words change.**

**What does not change.** The scale remains **four levels**, **ordered low to high**, applied to **all nine dimensions**, **all nine mandatory** (A-017). The enum remains named `public.competency_rating`. Its **physical sort order is unchanged**. **`developing` is unchanged in both value and ordinal position**, which is why the migration authorized by A-053 performs **exactly three** renames rather than four.

**Why an amendment was required, and was not optional.** Amendment 002 did not merely inherit the previous vocabulary — it **affirmatively re-ratified** it. Amendment 003 A-026 then bound those labels into the ratified enum inventory, and Amendment 004 A-040 fixed an exhaustive list of permitted schema changes that did not include a `competency_rating` label change. A label change therefore could **not** be made as an implementation decision, and **was not**.

**The 4-level → 3-level term-report map** (v3 §3.5 decision 3) is restated in the ratified vocabulary as **Mastered → Excellent · Mastering → Good · Developing → Needs Improvement · Beginning → Needs Improvement**. It carries the **same status it already had — a proposed default, trainer-overridable, used only when term generation is built** (v3 §3.6, §28). Restating it in the new labels **neither ratifies nor advances it**, and term-report generation remains out of MVP scope.

**No fifth level exists or may be created.** The scale is exactly four.

---

## A-050 — Behavioural anchors carry forward positionally, verbatim

**All four §3.3 behavioural anchors are preserved verbatim and re-keyed positionally.** The semantics do not change merely because the labels change.

| Ordinal | Ratified label | Behavioural anchor — **verbatim from Specification v3 §3.3, unchanged** |
|---:|---|---|
| 1 | **Beginning** | Requires frequent prompting, modelling, and support to demonstrate the skill consistently. |
| 2 | **Developing** | Demonstrates the skill with some guidance and increasing confidence, but consistency may still vary. |
| 3 | **Mastering** | Demonstrates the skill independently and consistently across most classroom activities and presentations. |
| 4 | **Mastered** | Exceeds the expected level: strong confidence, natural expression, independent application, consistent across different contexts. |

**The authoritative wording is Specification v3 §3.3's, preserved character-for-character.** Where any summary, briefing or restatement of these anchors differs in wording from v3 §3.3, **v3 §3.3's wording governs** and the summary is a paraphrase. This clause changes **no threshold** and introduces **no fifth level**.

**`Mastered` remains the exceeds-expectations level.** Its anchor is unchanged, so the level-4 threshold is exactly what it has always been.

**The anchors have no schema column** (assessment-write baseline §2.3, U-ASM-2). They are **framework constants**, carried from the framework module into the AI skeleton (§12.1 step 1) and into the dimension DTO consumed by the UI. **Two copies exist** — one backend, one frontend — and they must remain **byte-identical**; V4 verifies this. A rating is **never** passed to the LLM without its anchor (`CLAUDE.md` §5).

---

## A-051 — Ratified polarity bands

| Storage value | Polarity band |
|---|---|
| `beginning` | `needs_support` |
| `developing` | `developing` |
| `mastering` | `positive` |
| `mastered` | `positive` |

**`Mastering` remains `positive`.** This is a ruling, and it is recorded as one. **Polarity derives from the ratified behavioural anchor, not from the progressive grammatical form of the label.** Level 3's anchor describes *independent, consistent demonstration across most classroom activities and presentations* — legitimately positive, and unchanged by A-050. Demoting `mastering` to the `developing` band because the word ends in *-ing* would **silently narrow what the AI may describe as a strength across every report**, a substantive behavioural change introduced under cover of a rename. Amendment 006 does not permit that.

**Consequence.** Only `beginning` carries `needs_support`. A `mastering` or `mastered` dimension may be presented as a strength; a `beginning` dimension may **never** be (§12.1 step 3).

**Polarity is derived in more than one place** — the backend framework constant, the frontend contract, and any inline re-derivation in a test harness. **Every derivation must agree with this table exactly.** A divergence is a defect, not a variant, and V4 verifies agreement.

---

## A-052 — AI language and contextual leak detection

**§12's grounding non-negotiable is unchanged and is strengthened here, not relaxed.** A draft whose language contradicts a rating's polarity band must still be **rejected by the system**, provably, before anything is persisted (`CLAUDE.md` §4 non-negotiable 1).

### Ordinary prose is legal

The following are **ordinary contextual prose and must remain legal** in parent-facing output:

- "at the beginning of the session";
- "is mastering sentence flow";
- "has mastered maintaining eye contact";
- "demonstrates mastery of vocal projection".

### A bare-word leak regex is prohibited

**A guard equivalent to `\b(beginning|developing|mastering|mastered)\b` is expressly prohibited.** The ratified vocabulary contains **ordinary English words** — *beginning* is temporal, *mastering* and *mastered* are common praise. A bare-word guard would reject valid parent-facing prose at a governance gate, converting a leak guard into a rejecter of normal English. The previous vocabulary tolerated a bare-word guard only because `emerging`, `secure` and `advanced` essentially never occur in report prose; **that tolerance does not carry over, and a word-list substitution is not an acceptable implementation of this clause.**

### What must be detected

The future grounding implementation must detect **explicit rating attribution or taxonomy disclosure**, including contexts such as:

- `rating: Mastered`;
- `rated as Beginning`;
- `Mastering level`;
- `assessment level is Developing`;
- **isolated raw labels presented as rating values**;
- **explicit disclosure of the internal four-level taxonomy.**

**Amendment 006 authorizes contextual attribution detection and prohibits blanket rejection of ordinary label words.**

### Achievement-language detection is unchanged

**`mastered` and `mastery` are retained as achievement-language concepts** for polarity-contradiction detection. They are genuine achievement language regardless of what the enum is called, and removing them would weaken contradiction detection for exactly the phrasing a model is most likely to produce. **The attribution rule and the achievement rule serve different purposes and are resolved separately.** A phrase such as *"has mastered maintaining eye contact"* is legal prose under the attribution rule **and** must still be **caught by polarity-contradiction detection** where it describes a `beginning` dimension.

### Audit-payload privacy detection

**Any audit, privacy or leak assertion that enumerates rating labels literally must be updated in the same implementation checkpoint as the enum migration** (V2). An assertion left pinned to the previous labels **continues to pass while checking for values that no longer exist** — a silent degradation to a false negative that announces nothing when it occurs. **This is the highest-risk failure mode of this amendment and is a V2 exit condition.**

---

## A-053 — The exact authorized schema change

**Authorized: exactly three enum-label renames, in one future forward migration, and nothing else.**

```
ALTER TYPE public.competency_rating RENAME VALUE 'emerging' TO 'beginning';
ALTER TYPE public.competency_rating RENAME VALUE 'secure'   TO 'mastering';
ALTER TYPE public.competency_rating RENAME VALUE 'advanced' TO 'mastered';
```

**`developing` is unchanged and is not renamed.** Three statements effect the whole change.

**Rename, not replacement — and the reason is ordering.** PostgreSQL cannot drop an enum label, so add-and-drop is unavailable. `RENAME VALUE` leaves `pg_enum.enumsortorder` and every label OID untouched, so **existing stored rows require no `UPDATE` and no table rewrite**, and the ordinal semantics survive exactly. A create-new-type-and-swap strategy is **not authorized** and **not required**.

### The zero-row precondition — mandatory, fail-closed, in-transaction

**The migration must prove zero rows, in the same transaction, in at least:**

- `public.report_versions`;
- `public.report_version_ratings`;
- `public.observation_ratings`.

**If the precondition does not hold, the migration must `RAISE EXCEPTION` and abort rather than rename.** The guard is a **fail-closed proof executed at migration time**, never an assumption inherited from documentation.

**Why the report tables are load-bearing.** **Report-content hash v1 includes the textual enum labels.** The hash serializes each rating's label text with an octet-length prefix, so renaming a label changes the hash of a logically identical report — `'secure'` at 6 bytes becomes `'mastering'` at 9. Any pre-existing `report_versions` row would become **permanently unreproducible**: a stored-content-hash anomaly, classified as a data-integrity incident, on a **frozen immutable row that can never be repaired**. The ratified **Option B assessment boundary** holds the report and version tables at zero rows, which is precisely what makes this change safe today.

**`observation_ratings` is included** because it is the other rating-bearing table and its contents feed the hash inputs on the next version write; proving it empty keeps the guard total rather than partial.

### Explicitly not authorized

**No type, table, enum-count, policy or function-count change is authorized by this amendment.** Specifically excluded: any new enum, table, column, constraint, index, policy, grant, function, trigger or seed row; any hash-envelope version change; any table rewrite; any data migration; and any change to `class_grade_code`.

**Counts are unchanged.** A label rename alters no enum count, table count, function count or seed-row count, so **A-031's inventory and A-040's counts stand as written.**

### Irreversibility

The rename is symmetrically reversible **while the guarded tables are empty**. Once any `report_versions` row is written afterwards, reversal recreates the same hash problem in the opposite direction. **The change is effectively one-way from the first report version onward**, which is why it belongs in the current zero-row window. **The safe window is open as of this ratification and closes on the first report version created.**

### Ordering

Generated database types are **regenerated from the migrated schema, never hand-edited** (ADR-8). Frontend rating contracts and fixtures follow the backend. The vocabulary-pinned assertions of A-052 ship **in the same checkpoint** as the rename. The full sequence is `docs/plan/COMPETENCY_VOCABULARY_RECONCILIATION_PLAN.md`.

**This clause authorizes the shape of the change. It does not authorize performing it.** V2 requires its own orchestrator authorization. **Do not implement the migration under this amendment.**

---

## A-054 — Class Grade is a different vocabulary and is not changed

**Class Grade remains `Beginner` / `Intermediate` / `Advanced`, with canonical values `beginner`, `intermediate`, `advanced` — unchanged, unaffected and reaffirmed** (A-016, A-026).

`class_grade_code` and `competency_rating` are **two distinct enums governing two distinct concepts**. They coincidentally shared the token `advanced`. After this amendment they share nothing.

**Must not be altered:**

- `class_grade_code`;
- class-grade fixtures and their exact-match seed assertion;
- class-grade UI labels;
- class-grade tests;
- **ordinary uses** of `advanced`, `secure`, `emerging`, `beginning`, `mastering` or `mastered` that are **not** competency-rating labels.

**Binding consequences:**

- **`Advanced` is no longer a competency rating and remains a Class Grade.** An occurrence of `Advanced` must be classified by **its actual context**, never by keyword.
- **A fourth Class Grade remains not creatable** (A-026), and the three centre-owned Class Grade seed rows are untouched.
- **"Class Grade" remains the canonical term**; "Academic Level" is not.
- **Global keyword replacement is expressly prohibited.** No search-and-replace over `advanced`, `secure`, `emerging`, `beginning`, `mastering` or `mastered` may be performed anywhere in this codebase or its documentation on the strength of this amendment. Class-grade labels, ordinary prose, unrelated identifiers, quoted superseded text and historical records must survive it unchanged.

**Also expressly untouched:** the separate End-of-Term Performance Report instrument and its `Excellent` / `Good` / `Needs Improvement` scale (v3 §28) — a **different instrument**, whose generator remains out of MVP scope.

---

## A-055 — Documentary authority

**The copies inside `SDS Project Final (BEST Coach)` are the authoritative repository sources.** `docs/spec/`, `docs/plan/`, `docs/progress/` and the repository-root `CLAUDE.md` govern. They are version-controlled, they are what `CLAUDE.md` §1's precedence table addresses by repo-relative path, and they are what every worktree inherits.

**The workspace folder `governance-source/` is a non-authoritative mirror / reference source.** It is outside every Git repository and is **not** a source of truth for any clause.

**A divergent `governance-source` copy may never override the repository's `CLAUDE.md`, specification, amendment or Implementation Plan.**

**Mirror status, documented at ratification** (inspection only — no mirror file was read for content beyond what this record required, and none was synchronized):

| Mirror file | Repository counterpart | Status |
|---|---|---|
| `BEST_Coach_Complete_MVP_Specification_v3.md` | `docs/spec/…v3.md` | **Byte-identical** (SHA-256 match) |
| `CLAUDE.md` | repository-root `CLAUDE.md` | **Divergent — mirror is stale**, 42,828 B against the repository's 114,043 B |
| `BEST_Coach_Implementation_Plan.md` | `docs/plan/…Implementation_Plan.md` | **Divergent — mirror is stale**, 24,307 B against the repository's 86,714 B |

**Both divergent mirror files are substantially smaller than their repository counterparts and are therefore earlier copies, not later ones.** No repository content exists only in the mirror. **No mirror file was synchronized, edited or retired in this checkpoint** — no existing mirror procedure requires it, and none was invented.

---

## What Amendment 006 explicitly does NOT change

- It does **not** amend Specification v3 or Amendments 001–005 except for the clauses named in its supersession table.
- It does **not** supersede any Amendment 005 clause. **A-048 is discharged; A-041 … A-047 are untouched** — the 36-screen inventory, canonical routes, twelve-screen physical-test subset, 24-screen deferral, visual-authority precedence, authentication rulings and hierarchy mapping all stand exactly as ratified.
- It does **not** change the **Class Grade** vocabulary, the term-report instrument, or any other closed vocabulary.
- It does **not** change the nine dimensions, the mandatory-nine rule, the assessment instrument, or any behavioural **anchor text** or threshold.
- It does **not** change the report lifecycle, the eight-value status set, the transition set, the freeze point, the immutable-version rule, dual approval provenance or the audit chain.
- It does **not** change the management editing boundary, the parent boundary, notification triggers, or any privacy, approval, evidence or PDPA control.
- It does **not** weaken grounding validation — A-052 **strengthens** it.
- It does **not** change any enum, table, function or seed-row **count**.
- It does **not** create, move, delete or restyle any application code, route or component.
- It does **not** authorize any checkpoint, and it does **not** authorize applying the A-053 migration.
- It does **not** advance or ratify the 4-level → 3-level term-report map, which keeps the status it already had.

---

## Items resolved by this amendment

**Every item carried by the draft is closed by an operator ruling. No `TBD`, placeholder or open decision remains.**

| # | Item as drafted | Ruling |
|---|---|---|
| **R-A6-1** | Whether `Mastered` means *mastery attained* rather than v3's *exceeds the expected level* | **CLOSED — A-050.** Anchors carry forward **positionally and verbatim**; semantics do not change because labels changed. `Mastered` **remains the exceeds-expectations level**. No threshold moved and no fifth level exists |
| **R-A6-2** | `governance-source/` content divergence, previously unexamined | **CLOSED — A-055.** Repository sources are authoritative; the mirror is non-authoritative. Divergence measured: the two divergent mirror files are **smaller and therefore earlier**, so no repository content exists only in the mirror. **Nothing was synchronized** |
| **R-A6-3** | Exact rating-attribution matching strategy for the leak guard | **CLOSED — A-052.** Contextual attribution and taxonomy-disclosure detection is **authorized**; a bare-word regex is **prohibited**; the required detection contexts are enumerated; ordinary prose is **legal**; `mastered`/`mastery` are **retained** as achievement language |
| **R-A6-4** | Zero-row precondition verification | **CLOSED — A-053.** A **fail-closed in-transaction guard** over `report_versions`, `report_version_ratings` and `observation_ratings` is **mandatory**, and the migration **aborts rather than renames** if it does not hold |
| **R-A6-5** | Whether the two independent rating-union declarations should be unified | **CLOSED — deliberately not unified in this change.** Backend and frontend keep separate declarations; **V4 verifies exact agreement** as a gate. Unifying them is an architectural change out of scope here and is not required for correctness |

---

*Ratified 2026-08-05 23:20 Asia/Singapore as the output of the vocabulary-reconciliation checkpoint reserved by Amendment 005 A-048. No SQL, migration, generated type, application code, fixture or test was authored, changed or run to produce this amendment; no Supabase, Docker, migration, fixture, build, application server or browser automation was run; no secret value was inspected; no `governance-source` mirror file was synchronized; and Specification v3 and Amendments 001, 002, 003, 004 and 005 remain byte-for-byte unchanged.*
