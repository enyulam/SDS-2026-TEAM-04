# FINAL MVP PHASE A2 — CLEANUP MANIFEST

> ## ✅ EXECUTED 2026-08-08 UNDER EXPLICIT OPERATOR AUTHORIZATION
>
> **This manifest is no longer a pending proposal. The authorized subset was executed on 2026-08-08** after two verified preservation snapshots, a governance checkpoint commit, frozen worktree tags and verified portable git bundles. **All 26 Q-items are dispositioned — see §Q-DISPOSITIONS. No item below remains an open blocker.**
>
> **Executed:** 58 stale-segment rewrites (**S-57 withdrawn, not applied**; 4 not-stale guards untouched) · AUTH-01 byte-exact preservation + reconstruction · 2 `.txt`→`.html` renames (bytes unchanged) · 11 screenshot-trailer corrections · `UI_PACK_MANIFEST.json` reconciliation · GC-1…GC-14 recorded into 19 packs · **2 physical worktree directories removed** (branches, tags and commits preserved).
>
> **Explicitly NOT executed:** zero file deletions · zero archival · zero application-source changes · zero schema/DB changes · **PeakPalate retained in place, byte-identical, under operator ruling OR-PA2-1**.
>
> **Superseded by operator ruling:** every `PRESERVE_FOREIGN_THEN_REMOVE` proposal for PeakPalate; the Q-3 teaching-team blocker; and BATCH 3's archival proposal.

**Instrument type:** Proposal register — **now an executed record.**
**Produced:** 2026-08-08, Asia/Singapore.
**Companion:** `FINAL_MVP_PHASE_A2_WORKSPACE_AUDIT.md` (evidence, method and reconciliations).
**Status:** **AWAITING OPERATOR APPROVAL.** No proposed action here is authorized. Every destructive row additionally requires the preconditions stated in its batch.

**Authorizes nothing.** No file was created, modified, moved, renamed, archived or deleted to produce this manifest, other than this file and its companion audit.

---

## 0. HOW TO READ THIS MANIFEST

**Proposed actions:** `KEEP` · `ARCHIVE` · `DELETE` · `REMOVE_STALE_SEGMENT` · `REWRITE_ACTIVE_SEGMENT` · `REMOVE_WORKTREE` · `PRESERVE_FOREIGN_THEN_REMOVE` · `NO_ACTION_AMBIGUOUS`.

**Three global constraints bind every row:**

1. **§31.2 sequencing freeze** — no automated cleanup may run over `UI_REFERENCE_FINAL_MVP` until AUTH-01 is resolved. **Never sort by mtime at any scope.**
2. **0 remotes on every repository.** Anything outside a git repo is **unrecoverable** after deletion. Each row's `REVERSIBLE?` cell reflects this, not an assumption of backup.
3. **No cleanup rule may treat `.txt` as a deletable class** — see B0-07.

**Headline: 0 files are proposed for deletion.** The only destructive proposals are two worktree *directory* removals (fully reconstructible from surviving branch refs) and two foreign artefacts that already have verified external copies.

---

## BATCH 0 — NO-TOUCH PROTECTED MATERIAL

**Contents:** everything in Authority Lock §31.1–§31.13, plus five additions this audit proves necessary.
**Prerequisite:** none. **Rollback:** n/a. **Validation:** confirm presence and hashes before and after any later batch runs.

| ID | PATH | CLASSIFICATION | WHY PROTECTED | ACTION |
|---|---|---|---|---|
| B0-01 | `FINAL_SUBMISSION_BRIEF/` (2 PDFs, 369,382 B) | ACTIVE_AUTHORITATIVE rank 0 | Sole external submission authority; nothing outranks it | **KEEP** |
| B0-02 | `FINAL_MVP_AUTHORITY_LOCK.md`, `FINAL_MVP_OD4_REPORT_SEMANTICS_RULING.md` | ACTIVE_AUTHORITATIVE | Canonical Final MVP baseline + the operator ruling on report semantics | **KEEP** |
| B0-03 | `SDS Project Final (BEST Coach)/docs/spec/` in full, `CLAUDE.md`, `docs/plan/`, `docs/progress/` | ACTIVE_AUTHORITATIVE ranks 1–3 | The top rungs of the authority ladder this entire lock rests on | **KEEP** |
| B0-04 | `UI_REFERENCE_FINAL_MVP/reference/` — all 37 packs, all 111 files | ACTIVE_AUTHORITATIVE (VISUAL rank 1) | Ratified Final MVP UI authority (PA-OD-5/5b). Includes `Auth 04` despite having no inventory ID — it is live evidence for open decision OD-1 | **KEEP** |
| B0-05 | ⚠️ **The 25 unduplicated `reference/` PNGs** | ACTIVE_AUTHORITATIVE | **Single copies, no second copy anywhere, no recorded hash.** ✅ *(2026-08-08: ~~outside every git repository~~ — they are now tracked in the main repository, so byte-recovery via git exists. The "single copy" point stands: git preserves the bytes it was given, not a pre-contamination original.)* Most irreplaceable files in the workspace; they serve the 24 screens with no frozen reference | **KEEP — and back up first (§Recommended Pre-Action)** |
| B0-06 | The 12 frozen `reference.png` files in the screen packs | FROZEN_BASELINE | SHA-pinned in `UI_PACK_MANIFEST.json`; byte-recoverable from `reference/` **only if `reference/` survives** | **KEEP — never delete both copies** |
| B0-07 | ⚠️ `reference/Management - Students/Management - Students.txt` (46,166 B) · `reference/Trainer - Students/Trainer - Students.txt` (37,574 B) | ACTIVE_AUTHORITATIVE | **These contain valid HTML.** Sole visual authority for screens 04 and 17; no sibling `.html` exists. A `.txt`-class sweep destroys both | **KEEP — rename only (B1-18)** |
| B0-08 | All 36 `screen.md` · all 36 `implementation-notes.md` · all 36 `SCREENSHOT_REQUIRED.txt` | ACTIVE_AUTHORITATIVE / ACTIVE_SUPPORTING / HISTORICAL_EVIDENCE | Only per-screen deviation record; only per-folder Figma re-export key. **All 108 hash-unique** — the 20 stub notes each embed their own screen ID and are **not** duplicates. 🔴 **Reconciliation with B6-01, added after adversarial review:** §31.7 protects all 36 *"including the contaminated AUTH-01 one"*, yet B6-01 proposes removing that instance — an apparent contradiction the first draft never addressed. **The reconciliation: §31.7's rationale for that one file is void**, because the Figma node record it existed to protect was **destroyed by the paste**; §31.1 governs it instead. **So: 35 of 36 unconditionally; the AUTH-01 instance is governed by BATCH 6.** ⚠️ Two `implementation-notes.md` (packs 30, 31) are **known-incomplete** against the GC register — see Q-24 | **KEEP (35 of 36 here)** |
| B0-09 | The 12 migrations and everything under `supabase/` | FROZEN_BASELINE | Applied, one commit each, never edited post-application. Historical reproducibility artefacts | **KEEP — never edit or delete an applied migration** |
| B0-10 | ⚠️ The full 95-file evidence estate — `_g6-activation-evidence/`, `_c4-lifecycle-evidence/`, `_f17-disposable-evidence/`, `UI_REFERENCE_FINAL_MVP/_checkpoint-evidence/` | HISTORICAL_EVIDENCE | **Not one file is in any git repository. No deletion is reversible.** Includes the only real-provider evidence (G-6) and the only pre-OD-4 / pre-remediation UI captures | **KEEP ALL — 10,309,554 B (10.3 MB)** |
| B0-11 | `SDS Project Sprint 2/` @ `8d4acf4` | FROZEN_BASELINE | Doubly protected: frozen demo **and** the Sprint 2 continuity artefact. **The only surviving sprint artefact** — no CHIPS 1–4, no Sprint 1 material exists anywhere | **KEEP** |
| B0-12 | ⚠️ `SDS Project Sprint 2/.env.local` (179 B) | FROZEN_BASELINE | Gitignored and untracked — **exists in no git object anywhere**. Single copy on disk | **KEEP — do not alter (readiness plan `:480`)** |
| B0-12a | 🔴 ⚠️ **`SDS Project Final (BEST Coach)/.env.local` (539 B)** | ACTIVE_SUPPORTING | **Added after adversarial review — this audit's own method could not see it.** Ignored by `.gitignore:34` (`.env*`), so `git status --untracked-files=all` reports it as *nothing*, which is why §9.1's clean-tree finding concealed it. It is the **live local-stack configuration for the only working environment**, and the draft-storage transport depends on that stack. Unrecoverable | **KEEP — do not alter; back up (Pre-Action)** |
| B0-13 | The ungit'd governance documents — `FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md` (sole holder of GC-1…GC-14, OD-1…OD-6, C2C register) · `UI_REFERENCE_CLEANUP_MANIFEST.md` (sole holder of R1…R7) · `GLOBAL_UI_RULES.md` · `UI_PACK_MANIFEST.json` + `SCREEN_INDEX.md` (**the two Figma node records AUTH-01 reconstruction depends on — if both are lost, AUTH-01 cannot be reconstructed at all**) · `CORE_SCREENSHOT_VALIDATION_REPORT.md` · `FINAL_MVP_SUBMISSION_READINESS_PLAN.md` · `FINAL_MVP_PHASE_A_GOVERNANCE_RECONCILIATION.md` | ACTIVE_AUTHORITATIVE / ACTIVE_SUPPORTING | None is in any git repository; none is recoverable after deletion | **KEEP** |
| B0-13a | 🔴 ⚠️ **`UI_REFERENCE_FINAL_MVP/CHANGE_LOG.md`** (37,563 B) | ACTIVE_AUTHORITATIVE | **Added after adversarial review — §31.12 protects it by name and the first draft of this batch dropped it.** Not decorative: `FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md:395` cites `CHANGE_LOG.md:321` as one of four places the OD-1 deviation-recording discharge is evidenced, and **B6-01's own precondition (4) requires the AUTH-01 incident to be recorded in it**. Ungit'd | **KEEP** |
| B0-13b | 🔴 ⚠️ **The `AUTONOMOUS_48H_*` family (9 files) and `RUN_C2_UI_ARCHITECTURE_RECONCILIATION.md`** (149,977 B) | HISTORICAL_EVIDENCE (2 are ACTIVE_SUPPORTING) | **Added after adversarial review.** §31.12 protects the family by name; §29:1033 classifies `RUN_C2…` HISTORICAL_EVIDENCE. Two members are **not** historical at all — `AUTONOMOUS_48H_EXECUTION_TRACKER.md` and `AUTONOMOUS_48H_FINAL_REPORT_TEMPLATE.md` are live. Ungit'd | **KEEP** |
| B0-13c | 🔴 ⚠️ **`complete mvp screens compiled figma list.txt`** (7,932 B) | SUPERSEDED_ARCHIVE **but §31.12a-protected** | **Added after adversarial review.** §31.12a:1094 protects it explicitly; the first draft enumerated §31.12a's other six bullets and silently dropped this one, then proposed it for archival in B3-01. See the corrected B3-01 | **KEEP by default** |
| B0-14 | `governance-source/` (3 files) | HISTORICAL_EVIDENCE | Protected §31.12. Its spec hash `64d54aa2…` is the **assertion target of 9+ accepted checkpoints** — removing it makes those unverifiable | **KEEP — never load as a session contract** |
| B0-15 | `BEST_COACH_DEMO_TO_MVP_MIGRATION_TRACKER.md` (411,300 B) | HISTORICAL_EVIDENCE | Sole+mirrored holder of decision register **D-1 … D-317**, cited by ID throughout the Lock. Its own banner forbids deletion, move, rename or archival | **KEEP** |
| B0-16 | ⚠️ `server/platform/supabase/elevated.ts` · `lib/supabase/browser.ts` | UNUSED_IMPLEMENTATION_ARTIFACT **(intentional)** | Unimported **by design** — but 🔴 **the rationale below is corrected after adversarial review; the earlier version was false for one of the two files and cited three wrong lines.** **`elevated.ts`:** `static-scan.mjs:501` **`continue`s past the file itself** and only inspects *other* files for an import — so deleting it makes **T7I-40 pass vacuously** and still emit its success line at `:578`. It fails **OPEN**, silently, not closed. ⚠️ **This is a ninth instance of the §6.2 fail-open pattern, sitting inside this manifest's own protected-material rationale.** **`browser.ts`:** genuinely anchored — `run-runtime-profile.mjs:540-547` (`readRequired`: *"a renamed or deleted anchor is a regression, not an absence of offenders"*) reached from `:568-570` and `:620`. The previously cited `:551` is a declaration, `:592` a comment, `:637` a name scan that also fails open | **KEEP — verdict unchanged, reasoning corrected** |
| B0-17 | `worktrees/backend-48h`, `worktrees/frontend-48h` — the **branch refs and commits** | FROZEN_BASELINE | Distinct from the physical directories (BATCH 5). Refs must survive any directory removal | **KEEP REFS PERMANENTLY** |

---

## BATCH 1 — LOW-RISK ACTIVE-DOCUMENT STALE SEGMENTS

**Contents: 59 stale segments + 4 recorded-as-NOT-stale + 2 renames = 63 segments examined.** **Action is `REWRITE_ACTIVE_SEGMENT`, never deletion** — the corpus uses annotate-never-delete (strike through, date, cite the ruling).

⚠️ **Count corrected after adversarial review.** An earlier draft advertised "63 stale segments" while listing 59 IDs. The four absent IDs are **not lost rows** — they are the four the governance audit deliberately classified **NOT stale** and recorded only so a careless pass would not flag them: **`S-23`** (`STATUS.md:203`, old vocabulary inside a dated section), **`S-24`** (`STATUS.md:80/:228/:601`, the 28-function figure already ruled a closed snapshot at `:54`), **`S-49`** (`FINAL_MVP_PHASE_A_GOVERNANCE_RECONCILIATION.md:251-261`, the GC-11 **correction** itself), **`S-54`** (`FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md:395`, OD-1's *"Auth 04 does not become a 37th screen"* — correct and load-bearing). **All four are `KEEP`. The actionable register is 59.**
**Prerequisite:** ✅ **UPDATED 2026-08-08 (repository-boundary normalization).** All three — `FINAL_MVP_SUBMISSION_READINESS_PLAN.md`, `FINAL_MVP_PHASE_A_GOVERNANCE_RECONCILIATION.md` and `FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md` — are **now tracked in the main repository**; back them up under normal git discipline. ~~They are outside every git repo. `CLAUDE.md:44`: *"Treat every edit to them as unbackable."*~~ **That premise is spent** — see `CLAUDE.md` §9.1 (§-anchored deliberately: the old `CLAUDE.md:44` line-pin no longer resolves).
**Rollback:** `git restore <path>` — now available for **all** of them. ~~**none** for the three ungit'd documents.~~
**Validation:** re-run the special scans; confirm stale-GCP count 14→0, stale-28 count 3→0, dead STOP-AND-ASK count 6→0.

### 1A · `CLAUDE.md` — 12 segments (functional rank 2, highest-impact)

| ID | LINE | WHY STALE | AUTHORITATIVE REPLACEMENT | RISK | REV? |
|---|---|---|---|---|---|
| **S-01** | 78 | 🔴 *"who uploads it if it does — is UNRESOLVED. Do not invent a replacement uploader"* — operator ruled evidence **REQUIRED** and **named the Trainer** | Authority Lock §8:178, §8.1 | **HIGH** — blocks a ratified deliverable | Yes |
| **S-02** | 303 | 🔴 Same, A-014 conditional framing | Authority Lock §8 | **HIGH** | Yes |
| **S-03** | 303 | Presents parent evidence video as an active in-scope feature | Authority Lock §8.1 — **ruled OUT** of the Final MVP | MED | Yes |
| **S-04** | 482 | 🔴 Same as S-01, Phase 2 framing | Authority Lock §8 | **HIGH** | Yes |
| **S-05** | 237 | Rule is correct; only its A-014 rationale is stale. **Do not delete the rule** | Authority Lock §6, §8 | LOW | Yes |
| **S-06** | 199 | 🔴 *"the database still stores the old labels"* — the rename migration is at HEAD | STATUS.md:48; Phase A G-20 | **HIGH** — misstates live schema | Yes |
| **S-07** | 511 | Fixtures reconciled in the V2 third commit | STATUS.md:74 | MED | Yes |
| **S-08** | 54 | *"Step 7I remains unstarted and unauthorized"* — both 7I migrations are at HEAD | Authority Lock §19.1 | **HIGH** | Yes |
| **S-09** | 471 | Labelled **CURRENT** and false — 7F was authorized, executed, verified, accepted (`e197f91`). `:520` already carries the correction; `:471` does not | CLAUDE.md:520 | **HIGH** — "CURRENT" defeats the reader's guard | Yes |
| **S-10** | 311 | Same 7F claim, reads as an active boundary statement | Phase A G-5 | MED | Yes |
| **S-12** | 60 | *"per-screen frames not yet installed"* — 36 packs + `reference/` exist, 12 SHA-verified | Authority Lock §28.1 | MED | Yes |
| **S-13** | 429 | `/spec` list omits ratified Amendments **005** and **006** | Authority Lock §2.2 | LOW | Yes |
| **S-11** | 62 | Phase A C-3 ruled the four registry mentions *"left intact as historical record"*, but a §1 source-of-truth **table row** is not obviously a registry | — | LOW | **NO_ACTION_AMBIGUOUS** |

### 1B · `docs/progress/STATUS.md` — 3 material + 1 borderline
Top block (lines 9–70) is current and verified. The staleness sits **below** it and is **not** covered by the file's own historical disclaimer at `:44`, which scopes itself to the `_Last updated:` entries only.

| ID | LINE | WHY STALE | RISK |
|---|---|---|---|
| **S-19** | 88–91 | 🔴 *"Lifecycle stage: Phase 0 in progress … report lifecycle, governed business RPCs and generated types are **not started**"* under a heading reading **"Current project state"** — directly contradicted by the same file at `:15` and `:48` | **HIGH** — one file asserts two contradictory current states |
| **S-20** | 126 | Same claim restated | HIGH |
| **S-21** | 93–94 | *"Current checkpoint"* is four checkpoints out of date | MED |
| **S-22** | 198 | 🔴 **RE-GRADED LOW → HIGH after adversarial review.** Verbatim: *"No frozen `reference.png` exists for any of the 36 screens, so **no screen is classified `Implemented and visually aligned`**."* This is the **identical falsehood** graded HIGH as S-14 — **12 exist**, all SHA-matched. The earlier draft downgraded it on the reasoning that it sits in a dated section; that reasoning is wrong twice over: the `:44` disclaimer scopes itself to lines 72–84 only, and the section at `:189` carries **no** historical banner, so the claim is covered by **no** disclaimer at all. Worse, `STATUS.md:181-182` in the same file already carry `~~…~~ CLOSED. Corrected 2026-08-07` annotations — the file's own convention is to annotate, and `:198` was simply skipped. **Leaving a HIGH falsehood uncorrected in the canonical current-status document while correcting the same falsehood in a rank-3 inventory is backwards.** The corpus method (strike + date + cite) destroys no historical evidence | **HIGH** — `REWRITE_ACTIVE_SEGMENT`, same treatment as S-14 |

**Explicitly NOT stale:** `STATUS.md:80/:228/:601` ("28 functions") and `:203` (old vocabulary) — dated sections, and `:54` already rules the 28 a *"closed Step 7I snapshot, not a quantity cap."* **KEEP.**

### 1C · `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` — 5 segments (rank 3)

| ID | LINE | WHY STALE | RISK |
|---|---|---|---|
| **S-14** | 62 | 🔴 *"No frozen `reference.png` exists yet for any of the 36 screens"* — **ruled FALSE, 12 exist**, all SHA-matched. Left uncorrected it lets a reader deny visual-authority rank 1 is populated at all | **HIGH** |
| **S-15** | 392 | *"ID 05 Trainer Schedule has no implemented route"* — `app/(portals)/trainer/schedule/page.tsx` exists (F-04, ruling R-B1). Verified on disk | MED — keeps a closed decision open |
| **S-16** | 417 | 🔴 §8.1 *"Delivered on `feat/48h-backend` (not yet merged to main)"* — it **is** on main; the branch is 0 commits ahead and `CLOSED_BY_NONUSE_POLICY` | **HIGH** — points implementers at a frozen worktree |
| **S-17** | 404–411 | §7.4 lists **5** unmapped implemented routes; there are **6** — `app/page.tsx` is absent | LOW |
| **S-18** | 98, 161 | Per-row repetition of S-16 | MED |

### 1D · `FINAL_MVP_SUBMISSION_READINESS_PLAN.md` — 17 segments ⚠️ **UNGIT'D**
Largest concentration in the corpus. Its currency notice at `:10` scopes itself to **§0 and §1 only**; §5, §6, §7.0 and §10 carry none and read as live planning.

| ID | LINE(S) | WHY STALE | RISK |
|---|---|---|---|
| **S-25** | 254 | 🔴 Section heading *"## 6. GCP deployment prerequisites"* — ratified target is **Vercel + hosted Supabase** | **HIGH** |
| **S-26** | 256 | Frames the gap entirely in GCP artefacts Vercel does not need | MED |
| **S-27** | 258 | 🔴 **Dead escalation** — *"Escalated to an operator ruling… needs a ruling before Phase F"*. **The ruling was issued** (G-29) | **HIGH** — a live trap |
| **S-28** | 260 | First clause correct (**KEEP**); closing clause still treats GCP as binding | MED |
| **S-29** | 230 | 🔴 *"GCP region must be `asia-southeast1`"* inside **live acceptance gate G-SG**. Data residency survives; the GCP binding does not | **HIGH** |
| **S-30** | 250 | Secret Manager premised on the superseded §6 | MED |
| **S-31** | 264 | Container/standalone/build-pipeline prerequisites are Cloud-Run-shaped | MED |
| **S-32** | 301 | 🔴 Row 9 *"GCP deployment"* of the consolidated requirement register — the single checklist | **HIGH** |
| **S-33** | 405 | Track-B dependency diagram node *"D4. Secrets + GCP"* | MED |
| **S-34** | 445 | 🔴 *"### Phase F — GCP deployment"* — a named phase of the execution order | **HIGH** |
| **S-35** | 446 | 🔴 Phase F body | **HIGH** |
| **S-36** | 188 | 🔴 *"Nothing — do not build"* for storage/evidence. Now a **wrong instruction** — evidence REQUIRED, Trainer uploads, private hosted Supabase Storage | **HIGH** |
| **S-37** | 374 | Dead open-conflict row for A-014 | HIGH |
| **S-38** | 372, 413 | 🔴 **Dead STOP-AND-ASK SA-1** — ruled twice (Phase A G-1; Lock §20.1 "RESOLVED") | MED |
| **S-39** | 415 | 🔴 **Dead STOP-AND-ASK SA-3** — ruled: *"REQUIRED. A-018 ACTIVE."* The "or descope" branch is gone | MED |
| **S-41** | 205 | P4 bootstrap — model is locked (Lock §5, 12 points); mechanism is Phase B. Still a blocker, no longer an undecided model | LOW |
| **S-40** | 49 | Stale citation (`CLAUDE.md:98`, now `:117` and struck). Mitigated — inside the `:10` currency notice | LOW — `NO_ACTION_AMBIGUOUS` |

**All 17: `REVERSIBLE? = NO`.**

### 1E · `FINAL_MVP_PHASE_A_GOVERNANCE_RECONCILIATION.md` — 7 segments ⚠️ **UNGIT'D**
Part II supersedes Part I wholesale, but **Part I carries no inline strike** — the reverse of the method used everywhere else in this corpus.

| ID | LINE(S) | WHY STALE | RISK |
|---|---|---|---|
| **S-42** | 9–12 | 🔴 Opens with **"🔴 FINAL_MVP_AUTHORITY_LOCK.md WAS NOT CREATED"** — reversed 327 lines later at `:336`. The Lock exists (144,769 B, verified) | **HIGH** |
| **S-43** | 59 | 🔴 *"Live:"* list of PA-OD-1…PA-OD-9 — **every item is closed**; `:506` says *"No Final-MVP-defining operator decision remains open"* | **HIGH** |
| **S-44** | 168–176 | 🔴 Dead operator gate presenting **Cloud Run `asia-southeast1`** as a live selectable branch. Dissolved at `:500` | **HIGH** |
| **S-45** | 49 | G-16 row superseded by G-29 | MED |
| **S-46** | 309 | 🔴 §7 row 6 lists four discharged/dissolved prerequisites. **§7 is the de facto execution plan** until `FINAL_MVP_EXECUTION_PLAN.md` exists | **HIGH** |
| **S-47** | 67 | *"The binding inventory is the Step 7I baseline's **28 functions**"* — superseded by the same file at `:365`. **Also imprecise:** `:3323` is a `RAISE NOTICE`, not an assertion; the assertion is at `:3119`. Both lines exist and say 28 — this is wording, not a factual conflict | MED |
| **S-48** | 219–237 | C-4 and C-5 shown **HELD**; Part II §II.2 records both **UNBLOCKED** | MED |

**All 7: `REVERSIBLE? = NO`.**

### 1F · `FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md` — 4 segments ⚠️ **UNGIT'D**

| ID | LINE | WHY STALE | RISK |
|---|---|---|---|
| **S-50** | 484 | *"does not resolve any of the six open operator decisions"* — contradicts its own corrected `:383` (*"five open, one RULED"*). **This file is the sole enumeration of OD-1…OD-6**, so a stale count propagates | MED |
| **S-51** | 470 | Gate R0 *"All six ODs ruled"* — one is discharged | LOW |
| **S-52** | 367 | GC-4 conclusion (omit) is now **more** firmly correct; only the *"evidence unresolved"* rationale is stale | LOW |

🔴 **All 4 of §1F: `REVERSIBLE? = NO` — added after adversarial review.** `FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md` is in no git repository and is the **sole copy of three registers** (GC-1…GC-14, OD-1…OD-6, the C2C defect register — B0-13). It is the highest-consequence ungit'd file in BATCH 1 and was the only sub-section without an irreversibility marker. **Back it up before editing.**
| **S-53** | 374 | ⚠️ **Reworded after adversarial review — the first draft said "withdrawn grounds", which is a governance hazard out of all proportion to a 3-row edit.** A-020 and A-025 are **fully active** (`…Amendment_004.md:23`: *"A-020's identity model … remains fully active"*; `:24`: *"A-025 … remains fully active"*) — A-025 is the identity/membership model the entire schema rests on. GC-11 cites them **misapplied**, not withdrawn: `FINAL_MVP_PHASE_A_GOVERNANCE_RECONCILIATION.md:257` re-attributes because they prohibit a `role` **column on `accounts`**, not a **selector on a creation form**; the actual grounds are narrower and stronger — *"`Assistant Trainer` is not a member of `centre_membership_role`"*. The underlying edit remains justified | MED |

### 1G · `docs/plan/` baselines — 9 segments

| ID | PATH:LINE | WHY STALE | RISK |
|---|---|---|---|
| **S-55** | `COMPETENCY_VOCABULARY_RECONCILIATION_PLAN.md:173-175` | 🔴 V2/V3 marked *"Pending — requires authorization"*; **both executed**. And the Branch column **assigns future work to two frozen `CLOSED_BY_NONUSE_POLICY` branches**. Cited live by `CLAUDE.md:199, :511, :562` | **HIGH** |
| **S-56** | `STEP_7I_REPORT_LIFECYCLE_BASELINE.md:341` | ⚠️ **Narrowed after adversarial review.** The line reads *"**Post-migration** `public` function census = 28 … This is the number T7I-2 asserts"* — that is **frozen history**, the same class §5.1 exempts for the in-migration occurrences, and it is **not** stale. What *is* actionable is only that **the file carries no HISTORICAL scope banner** while sitting at functional rank 3. **Add a banner; do not edit the 28** | LOW *(downgraded from MED)* |
| ~~**S-57**~~ | ~~`STEP_7I_REPORT_LIFECYCLE_BASELINE.md:336`~~ | 🔴 **WITHDRAWN — `NOT_STALE`. This row was wrong and would have corrupted a rank-3 baseline.** The line self-scopes in its own sentence: *"Total `authenticated` EXECUTE grants = 14 … **This counts only functions Step 7I creates**; the six Step 7G helper grants already in place are untouched and are not part of this figure."* Corroborated in frozen SQL at `…step_7i_report_lifecycle.sql:3159` (*"expected 20 (6 Step 7G helpers + 14 Step 7I RPCs)"*). **14 is correct in its frame; 25 is the workspace total — this is precisely the two-frames error §3.1 of the audit identifies and condemns, committed by this manifest.** At most, append a forward cross-reference; **never edit the 14** | **WITHDRAWN** |
| **S-58** | `PHYSICAL_TEST_SLICE_48H.md:583` | ⚠️ **Split after adversarial review — the row bundled two different things.** *"**No implementation exists today**"* **is genuinely stale** (12 migrations / 34 functions at HEAD; the two assessment RPCs it says don't exist **do**). But *"the ratified Step 7I counts of 5 migrations, 28 functions and 75 tests"* is a **correctly-scoped frozen-history figure** and must be left alone. **Correct the first clause only** | MED (first clause) / **KEEP** (second) |
| **S-59** | `PHYSICAL_TEST_SLICE_48H.md` header | *"ratified but not yet implemented"* — V2/V3 landed | MED |
| **S-60** | `BEST_Coach_Implementation_Plan.md:13` | Step 7E completed 2026-08-03 (`252ef9b`) | MED |
| **S-61** | `BEST_Coach_Implementation_Plan.md:19` | 🔴 *"Step 7I remains unstarted and unauthorized"* — Phase A C-4's exact target, UNBLOCKED, never applied | **HIGH** |
| **S-62** | `BEST_Coach_Implementation_Plan.md:126, 155, 255, 258` | *"Step 7F remains unauthorized and unstarted"* ×4, unannotated | MED |
| **S-63** | `BEST_Coach_Implementation_Plan.md:3` | Companion list omits Amendments 004/005/006 | LOW |

⚠️ **`BEST_Coach_Implementation_Plan.md` carries the ratified C-8 correction (`STATUS.md:21`). DO NOT `git restore` this file** — edit it forward only.

### 1H · The two renames — **the highest-value action in this manifest**

| ID | PATH | ACTION | WHY | RISK IF SKIPPED |
|---|---|---|---|---|
| **B1-18** | `reference/Management - Students/Management - Students.txt` → `.html` | **RENAME** | It is Figma-export HTML misnamed `.txt`; sole visual authority for screen 17 | 🔴 A `.txt`-class sweep destroys it irreversibly |
| **B1-19** | `reference/Trainer - Students/Trainer - Students.txt` → `.html` | **RENAME** | Same, screen 04 | 🔴 Same |

⚠️ **Precondition 1: §31.2 freeze — AUTH-01 must be resolved before any operation touches `UI_REFERENCE_FINAL_MVP`.**

🔴 **Precondition 2 — added after adversarial review: the Authority Lock authorises these renames in the SINGULAR.** `:1071` reads *"§31.2 authorises exactly **one** rename inside the ratified visual-authority tree; every other rename is equally prohibited without authority"*, while `:1077` (§31 item 4) protects **two** files and says *"They need a rename, never a delete."* §31.2 itself (`:1117-1125`) is solely the AUTH-01 mtime constraint and mentions no rename at all. **Either the Lock's count is wrong or the second rename is unauthorized.** The first draft resolved this silently in its own favour; it is now routed as **Q-25**.

🔴 **Precondition 3 — validation, which the first draft omitted entirely.** After the renames: `find reference -name '*.html' | wc -l` → **37** (from 35); `find reference -name '*.txt'` → **empty**; SHA-256 of both files **unchanged** across the rename (`c9fc75ac3b913974…`, `68c8654ffd1a86a7…`).

🔴 **Precondition 4 — five documents become false the moment the renames run, and NONE is in the S-01…S-63 register:**
- `UI_REFERENCE_FINAL_MVP/FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md:57` — *"Two folders lack HTML … carry a `.txt` instead."*
- `UI_REFERENCE_FINAL_MVP/UI_REFERENCE_CLEANUP_MANIFEST.md:208` and `:266` — *"the 35 HTML fragments"*
- `FINAL_MVP_AUTHORITY_LOCK.md:940` and `:1077` — **rank 1**
- **This manifest's own B0-07** — *"no sibling `.html` exists"*

**Nothing resolves either file by its `.txt` path** — independently confirmed: `UI_PACK_MANIFEST.json` contains no `.txt` or `.html` token at all, and no script, harness or test reads the `reference/` tree. **The rename is code-safe; it is the documentation that must follow it.**

---

## BATCH 2 — VERIFIED DUPLICATES / TEMPORARY ARTEFACTS

**Contents: 77 duplicate groups / 186 files. PROPOSED DELETIONS: ZERO.**
**Prerequisite:** none — nothing is proposed. **Rollback:** n/a. **Validation:** n/a.

| ID | GROUP | COUNT | VERDICT | ACTION |
|---|---|---|---|---|
| B2-01 | Worktree ↔ worktree | 33 groups | FROZEN_BASELINE — co-equal checkouts of one commit; canonical = neither | **KEEP** |
| B2-02 | Screen-pack `reference.png` ↔ `reference/` PNG | 12 groups (1,832,298 B) | **ACTIVE_SUPPORTING, not DUPLICATE.** Both sides referenced; deduplicating **breaks `UI_PACK_MANIFEST.json`'s SHA guarantee** | **KEEP** |
| B2-03 | `_checkpoint-evidence` F2↔F3, F2↔F10, F2↔F13 | 3 groups (200,575 B) | HISTORICAL_EVIDENCE — **the identical hash IS the finding**. Deleting either side leaves F3, F10, F13 **completely empty**, erasing that those checkpoints produced evidence | **KEEP** |
| B2-04 | Inside the frozen demo | 3 groups | FROZEN_BASELINE. (Noted: `dashboard_v2` is byte-identical to `dashboard` — the "v2" is not a revision) | **KEEP** |
| B2-05 | `governance-source` spec v3 ↔ `docs/spec` spec v3 | 1 group (64,987 B) | Byte-exact. `governance-source` hash `64d54aa2…` is the **assertion target of 9+ accepted checkpoints** | **KEEP BOTH** |
| B2-06 | `local_fixtures.sql`, `run-concurrency.mjs`, `favicon.ico` ×4 | 3 groups | APP canonical; worktree sides FROZEN_BASELINE; favicon is a per-repo build asset | **KEEP** |
| B2-07 | `supabase/.temp/pgdelta/*.json` — **NOT a duplicate group** | 2 files (2×2,237,850 B) | 🔴 **Removed from the duplicate register after adversarial review.** Hashes are `97d22067d23a0b35…` and `1df68780f02dde79…` — **different**. The first draft grouped them on filename + identical length, which is exactly what this manifest's own discipline forbids (*"`DUPLICATE` requires a hash match"*). They are **two distinct regenerable caches** from when only 3 migrations existed. **Gitignored** | **KEEP (ignore)** — local-only, no action needed |
| B2-08 | Orphan/scratch/temp sweep (`.tmp .bak .orig .rej .swp .DS_Store Thumbs.db desktop.ini .lnk ~ .log .old .save`, `Copy of *`, `* (1).*`) | **0 hits across all 91,779 files** | Nothing exists | **NO ACTION** |

**Batch 2 conclusion: there is no duplicate or temporary-artefact cleanup work in this workspace.**

---

## BATCH 3 — SUPERSEDED PLANS / UI / DOCUMENTS FOR ARCHIVE

**Contents:** 4 items. **PROPOSED DELETIONS: ZERO.** Only one genuine archive candidate exists, and its value is 8 KB.
**Prerequisite:** operator confirmation that archival (not deletion) is wanted at all.
**Rollback:** restore from the archive location. **Validation:** confirm no inbound reference breaks.

| ID | PATH | SIZE | CLASSIFICATION | AUTHORITATIVE REPLACEMENT | ACTION | RISK | REV? |
|---|---|---|---|---|---|---|---|
| B3-01 | `complete mvp screens compiled figma list.txt` | 7,932 B | SUPERSEDED_ARCHIVE **— but §31.12a-protected** | `docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md` — a **strict superset** (37 node URLs; all 33 ids present, independently re-verified: 0 IDs in the list but not the matrix) + `SCREEN_INDEX.md` + `UI_PACK_MANIFEST.json` | 🔴 **KEEP (revised from ARCHIVE after adversarial review).** ⚠️ **Authority Lock `:1071`: *"this section covers deletion, moving, archiving AND renaming"*, and `:1094` protects this file by name under §31.12a. Archiving it therefore requires the same explicit operator authority as deleting it — the first draft proposed archival without disclosing that.** The content case for archival is sound; the governance case is not. It is in no git repository | Very low content risk; **governance risk was undisclosed** | Yes (content recoverable from the matrix) |
| B3-02 | `governance-source/CLAUDE.md` | 42,828 B | SUPERSEDED_ARCHIVE | `SDS Project Final (BEST Coach)/CLAUDE.md` (157,762 B) | **KEEP** — protected §31.12; hash-asserted by D-035/D-202/D-211 | Must **never** be loaded as a session contract (states the superseded one-stage workflow) | No |
| B3-03 | `governance-source/BEST_Coach_Implementation_Plan.md` | 24,307 B | SUPERSEDED_ARCHIVE | `docs/plan/BEST_Coach_Implementation_Plan.md` (87,744 B) | **KEEP** — same | Same | No |
| B3-04 | `_checkpoint-evidence/F17/gate-ledger.md` | 4,484 B | SUPERSEDED_ARCHIVE | `_f17-disposable-evidence/disposable-gate-ledger.md` (21 gates decided) | **KEEP IN PLACE — NEVER CITE.** ⚠️ A `--preflight-only` run: **22/22 gates NOT-RUN**, no server started, no browser started, end-checksum not read. **It decides nothing.** The risk is citation, not existence; it is the only record the preflight path was exercised | HIGH if cited | **No — untracked** |

⚠️ **Correcting a plausible assumption:** the `AUTONOMOUS_48H_*` (9 files) and `FRONTEND_RECONSTRUCTION_*` (3 files) families **are not superseded and are not archive candidates.** Tested directly and the hypothesis fails in both directions: `FRONTEND_RECONSTRUCTION_TRACKER.md` carries live F-checkpoint status and `AUTONOMOUS_48H_EXECUTION_TRACKER.md` carries an open execution register — **by content, this sprint is not closed** *(an earlier draft rested this on their 2026-08-08 modification times, which breaks this manifest's own Global Constraint 1; the conclusion is unchanged but the grounds are now content, not mtime)*; `AUTONOMOUS_48H_FINAL_REPORT_TEMPLATE.md` is a template whose report is not yet written; and the two families are **orthogonal axes**, not generations — `RUN_C1_REPORT.md:7` states verbatim that it *"does **not** rewrite"* Run B. **No file in `UI_REFERENCE_FINAL_MVP` declares itself or any other superseded** — proven by grep, not assumed.

---

## BATCH 4 — UNUSED IMPLEMENTATION ARTEFACTS

**Contents:** 8 application-source items + 2,857 build-cache files. **PROPOSED DELETIONS: ZERO** — every row is KEEP or AMBIGUOUS.
**Prerequisite:** operator rulings on B4-01…B4-04 before any of them may be touched.
**Rollback:** `git restore` — **all of BATCH 4 is tracked and reversible**, unlike most of this manifest.
**Validation after any action:** `npx tsc --noEmit`; run the 6 portable suites (`asm-static`, `c2-static`, `c3-static`, `static-scan`, `app-route-census`, `integrated-route-security`); 🔴 **plus `scripts/tests/g6-harness/census-provider-constructors.mjs`** *(added after adversarial review — Q-8's proposed extraction breaks it, and neither `tsc` nor any of the 6 portable suites can detect that)*; confirm all 17 routes still resolve.

| ID | PATH | LINES | WHAT | CONVENTIONS RULED OUT | ACTION | RISK | REV? |
|---|---|---|---|---|---|---|---|
| B4-01 | `server/modules/report-workflow/projection-actions.ts` | whole file (90) | 10 read Server Actions, **0 importers** — fully superseded by `integration-adapter/participant-actions.ts` (F16-C) | Form-action/prop binding (an unimported `"use server"` module registers no action ID) · dynamic import (only one exists, pointing elsewhere) · barrels (**zero `index.ts` exist repo-wide**) · test-only (0 hits) | **NO_ACTION_AMBIGUOUS** — recommend DELETE after confirmation | LOW | **Yes** |
| B4-02 | `server/modules/report-workflow/actions.ts` | 8 of 9 exports | ⚠️ Because the module **is** imported (for `requestDraft`), Next registers **all 9 exports as live Server Action endpoints** — 8 unreferenced but reachable POST surface | Grepped all `action={`, all `<form>`, all prop passing; test hits are comments and port-member names, not imports | **NO_ACTION_AMBIGUOUS** — see Q-7 | **MEDIUM** — reachable endpoints; each still re-derives authority server-side, so not a hole, but unreviewed | Yes |
| B4-03 | `components/ui/field.tsx` · `components/ui/surface.tsx` | 245 total | 10 F1 design primitives, 0 importers; features hand-roll their markup | JSX-by-string impossible; Tailwind scans the file but never mounts the components | **NO_ACTION_AMBIGUOUS** — see Q-8. Prefer **adopting** over deleting | LOW | Yes |
| B4-04 | `tests/frontend/*.assertions.ts` ×4 | 28.1 KB | ⚠️ **Unexecutable** — `tsconfig.json` `noEmit: true`, no build output, no TS runner, nothing imports them. Their own docblock claims a compile path that **does not exist** | — | **KEEP — wire a runner.** Any past claim they passed is unsupported | MED | Yes |
| B4-05 | `features/trainer/trainer-dashboard.tsx` | 198 | Screen-01 dashboard, no route mounts it | `app/(portals)/trainer/page.tsx:16-17` **documents the deferral verbatim** *(citation corrected from `:19-20` after review — those lines are the redirect body)*: retained for the deferred screen 01 checkpoint | **KEEP** — ratified deferral | LOW | Yes |
| B4-06 | `server/platform/supabase/elevated.ts` · `lib/supabase/browser.ts` | 65 | Unimported **by design**; 4 governance assertions fail if anything imports them | — | **KEEP** — see B0-16 | **MED to delete** (breaks assertions) | Yes |
| B4-07 | `getSessionUserAction` · `FIXTURE_MODE_ENV_VAR` · `makeAssessmentRatings` · `Constants` | 4 symbols | Unreferenced symbols; `Constants` is in a **generated** file and would be re-emitted | | **KEEP** (low value either way) | LOW | Yes |
| B4-08 | `_checkpoint-evidence/F-01b/*.mjs` ×3 | 27 KB | Ad-hoc capture/measure scripts living **in the untracked evidence folder** | — | **KEEP IN PLACE** — they document the method that produced the JSON beside them. ⚠️ **Untracked — unrecoverable** | LOW | **No** |
| B4-09 | All `.next` build caches ×4 | 2,857 files / **886 MB** | UNUSED_IMPLEMENTATION_ARTIFACT — fully regenerable | — | **KEEP** (or clear locally at zero risk; not a governance action) | Nil | Yes (rebuild) |

**Rejected candidates — recorded so they are not re-flagged:** `features/dev-fixture/fixture-runtime.tsx` (reachable via the repo's single `import()`); `lib/frontend/design/tokens.ts` (imported by `badge.tsx:2`); `listManagementSubmittedFromRpc`, `indexSessionsByDate`, `formatShortDate`, `formatClockTime`, `SINGAPORE_TIME_ZONE`, `PortalRuntimeContext` (all consumed **inside their own module** — an initial cross-file scan false-flagged them); and **15 of the 34 DB functions** not called from app TS (`app_*` are RLS predicates, `audit_*` are trigger internals, `*_hash_v1` are called from inside other SQL functions, `report_reopen_submitted` is **deliberately unwired**).

---

## BATCH 5 — STALE FEATURE WORKTREES

**Contents:** the two physical worktree directories. **Branch refs and commits are NOT in scope and must survive (B0-17).**

> ## ✅ EXECUTED 2026-08-08 — BATCH 5 IS COMPLETE AND WAS FULLY AUTHORIZED
>
> **Both physical worktree directories were removed on 2026-08-08 via `git worktree remove`, under explicit operator approval, after all preconditions passed.** *(Corrected after adversarial review, which correctly found the most irreversible action of the phase was still recorded here as "proposal only" and "NOT authorized" — a future session reading this register could not have told the removal was sanctioned.)*
>
> **Verified after removal:** `git worktree list` contains only `main` · `.git/worktrees/` is empty · `git fsck` reports no corruption · `feat/48h-backend` → `402b0b6f25828775bcc2a3d30f418b90b898aa80` and `feat/48h-frontend` → `6762b5c59d41cdeaaaa0bc410a4fe28a1d31cebe` both resolve · annotated tags `frozen/48h-backend-402b0b6` and `frozen/48h-frontend-6762b5c` resolve · `git show feat/48h-backend:docs/progress/STATUS.md` returns 121,648 bytes · **~1.59 GB reclaimed.** **Neither branch was deleted.**

| ID | PATH | BRANCH @ SHA | FOOTPRINT | ACTION | RISK | REV? |
|---|---|---|---|---|---|---|
| B5-01 | `worktrees/backend-48h` | `feat/48h-backend` @ `402b0b6` | 689 MB / 22,444 files (**~6 MB real content**) | ✅ **REMOVE_WORKTREE — EXECUTED 2026-08-08** | Realised; branch + tag + commits preserved | Yes — `git worktree add` from the surviving ref or tag |
| B5-02 | `worktrees/frontend-48h` | `feat/48h-frontend` @ `6762b5c` | 957 MB / 23,270 files (**~3 MB real content**) | ✅ **REMOVE_WORKTREE — EXECUTED 2026-08-08** | Realised; branch + tag + commits preserved | Yes — same |

**Total reclaimable: ~1,646 MB** (1,352 MB `node_modules`, 285 MB `.next`).

**All four proof legs are PROVEN for both** (evidence in audit §10.2): clean working tree with only machine-derived disk-only files · loose branch refs stored in the parent `.git`, untouched by `worktree remove` · `rev-list --count main..branch` = **0** and `diff main...branch --stat` **empty** · every `.md`/`.sql` tracked, so no document exists only on disk.

**PRECONDITIONS — all five required by `CLAUDE.md:665-669` and Authority Lock §31.11:**
1. ✅ Branches and commits remain reachable from the main repository — **proven**
2. ✅ No unique required evidence exists only inside the physical worktree — **proven by full disk-vs-`ls-files` enumeration**
3. ✅ No effect on the frozen demo — **proven; separate repository**
4. ✅ Included in the cleanup manifest — **this row**
5. ✅ **Explicit Operator approval — GIVEN 2026-08-08.** *(This row previously read "NOT GIVEN … expressly NOT authorized". That was correct when written and is now superseded: the operator explicitly approved removal of the two physical worktree directories in the Phase A2 execution instruction, conditional on Gates 2–5 passing. All four gates passed.)*
6. 🔴 ⬜ **NEW, added after adversarial review — tag both commits before removal.** Today git **refuses** to delete a branch checked out in a worktree. **Removing the worktrees silently removes that protection**, and because both branches are fully merged, `git branch -d feat/48h-backend` then succeeds **with no warning and no force flag**. BATCH 5's entire safety case is *"the refs survive"*, and the removal measurably lowers the barrier to destroying them — which the first draft did not disclose. **Create annotated tags `frozen/48h-backend-402b0b6` and `frozen/48h-frontend-6762b5c` first**, so the commits stay reachable independently of the mutable branch refs, and record both SHAs in Authority Lock §31.11. Zero cost, converts a silently-deletable ref into a durable anchor.

⚠️ **Independent caveat, weighted heavily: 0 remotes.** The refs survive removal and live in `SDS Project Final (BEST Coach)/.git`, so recoverability is genuinely unchanged by the removal itself. But nothing anywhere is backed up off-machine, which raises the cost of *any* error to unrecoverable. **Recommendation: establish a remote or an off-machine copy before approving BATCH 5** — the removals are low-risk; the absence of backup is high-risk independently of them.

**Post-removal validation:** `git worktree list` shows only `main`; `git show-ref` still resolves both branch SHAs **and both new `frozen/*` tags**; `git show feat/48h-backend:docs/progress/STATUS.md` still returns 121,648 bytes.

🔴 **Three documents name the worktree directories by filesystem path** *(added after adversarial review)* — `_checkpoint-evidence/F-06/backend-frontend-vocabulary-parity.json:3,4,5` (**untracked evidence**), `05-trainer-schedule/implementation-notes.md:46`, `07-trainer-grade-student/implementation-notes.md:171`. **None breaks** — the referenced content is tracked and retrievable via `git show feat/48h-backend:<path>` — but F-06's provenance re-verification changes method after removal, and that should be recorded in `CHANGE_LOG.md` rather than discovered later.

---

## BATCH 6 — FOREIGN_CONTAMINATED MATERIAL

**Contents:** 2 artefacts. **Both now have verified external preservation — which the governance record states they do not.**

| ID | PATH | SIZE / SHA-256 | EXTERNAL PRESERVATION | ACTION | RISK | REV? |
|---|---|---|---|---|---|---|
| B6-01 | `UI_REFERENCE_FINAL_MVP/AUTH-01-trainer-login/SCREENSHOT_REQUIRED.txt` | 1,792 B · `30D7BA77CF0559A3…` (MD5 `FA2AE6578AF8B642…`) | **2 copies**, byte-identical to each other, each a **strict superset** (+1,050 chars) — `…OneDrive - SUTD\The Design of Digital Platforms\Sportster Context.txt` and `…\Documents\ChatGPT\HASS - Sportster\project-info\…\Sportster Context.txt`, both SHA-256 `73F4A9FCB58A806C…`. **Orchestrator-verified: `EXTERNAL_STARTSWITH_CONTAMINATED = True`** | 🔴 **PRESERVE_FOREIGN_THEN_REMOVE — `BLOCKED_PENDING_VERIFIED_PRESERVATION` *and* pending operator ruling (Q-1).** *Both, not either — corrected after adversarial review; §31.1.2 is unconditional* | Reconstruction dependency **NONE** — node `546:370` survives in `UI_PACK_MANIFEST.json:156-157` **and** `SCREEN_INDEX.md:30`, both confirmed present | **No** |
| B6-02 | `00-PeakPalate-Master.mp4` | 58,387,212 B · `F80D2128489DE47F…` | ✅ **Now backed up to BOTH Phase A2 preservation snapshots**, each hash-verified against the source. A third byte-identical copy remains at `Downloads\Telegram Desktop\` | ✅ **`KEEP_IN_PLACE` — classification `FOREIGN_REFERENCE_RETAINED_BY_OPERATOR`** *(operator ruling **OR-PA2-1**, 2026-08-08). **The earlier `PRESERVE_FOREIGN_THEN_REMOVE` proposal and the Q-2 removal gate are SUPERSEDED and WITHDRAWN.*** The file is **foreign to B.E.S.T but intentionally retained by the operator as reference material for separate later work** | Foreign to B.E.S.T · **excluded from B.E.S.T authority, repository and submission packaging** · not a B.E.S.T deliverable · zero B.E.S.T references · zero `remotion` hits workspace-wide. **Its presence is NOT unresolved contamination** | **n/a — nothing is removed** |

### ⚠️ What this batch corrects in the governance record

`FINAL_MVP_PHASE_A_GOVERNANCE_RECONCILIATION.md:51` asserts the SPORTSTER text is *"The only copy in existence"*; `:182` asserts it is *"not under OneDrive."* **Both are refuted by hash evidence.** The stated rationale for the blocker — that overwriting destroys the operator's work for another module — **does not hold.** The workspace copy is the **truncated, discarded** version of a document saved more completely 73 seconds later to its correct home.

Also requiring amendment: `UI_REFERENCE_CLEANUP_MANIFEST.md:69` (*"no version-control copy… exists"* — true but misleading) and `FINAL_MVP_SUBMISSION_READINESS_PLAN.md:285` (*"the name suggests an unrelated project"* — now confirmed, with provenance and an external copy).

### What the external supersets do and do not establish

- ✅ **They retire the governance record's stated rationale.** The claim that overwriting destroys the operator's coursework is refuted — the text survives more completely elsewhere, twice.
- ❌ **They do not satisfy §31.1.2.** The exact 1,792 raw bytes exist nowhere outside the workspace (the externals are CRLF and 1,089 bytes longer), and **both sit under the same OneDrive tenant root** — two paths, one volume, one cloud replica. **That is not two independent locations** in any disaster-recovery sense.
- ⚠️ **Creating the required copies is out of scope for this read-only phase.** Execution belongs to Phase A2 proper, on operator approval.

**The genuine open question is narrow:** may the pre-existing supersets serve as *one* of the two required copies, or are byte-exact copies of the original 1,792 bytes required? **Either way, at least one copy must go to a volume outside OneDrive before anything is removed.**

### 🔴 §31.1 IS RATIFIED AND UNCONDITIONAL — corrected after adversarial review

An earlier draft of this batch treated the pre-existing external copies as **satisfying** the preservation requirement, and offered the operator a branch in which **no copy is ever created**. That is not a standard the Authority Lock offers. §31.1 is titled *"PA-OD-8 — foreign-content preservation policy, **RATIFIED**"* and its clauses are unconditional:

- `:1106` §31.1.2 — *"Before any deletion, create **TWO verified preservation copies OUTSIDE** the B.E.S.T-Coach-Workspace, in genuinely independent locations where available."*
- `:1110` §31.1.6 — *"Removal … occurs **ONLY AFTER** two copies are verified…"*
- `:1113` §31.1.9 — *"**`00-PeakPalate-Master.mp4` is covered by this policy**"* — so §31.1.2 binds B6-02 by name.
- `:1115` — *"**No preservation copy was created during this run** … The policy is locked; **execution belongs to Phase A2**."* Execution was **deferred, not waived.**

The "where available" escape does not apply: independent locations are trivially available. **"Reading A" was an audit construction, not a ratified standard, and it is withdrawn as a basis for skipping copy creation.** What the external supersets genuinely establish is narrower and still valuable: **the operator's coursework is not at risk of loss**, which retires the *rationale* the governance record gave for the blocker — not the blocker itself.

**Preconditions for B6-01 removal:** (1) operator answers Q-1; (2) **two verified copies exist, at least one on a volume outside the OneDrive tenant**, with SHA-256 recorded for original and both copies — required by §31.1.2/§31.1.6 **regardless of how Q-1 is answered**; (3) AUTH-01 placeholder reconstructed **only** from node `546:370`, never by editing the foreign text; (4) incident recorded in `UI_REFERENCE_FINAL_MVP/CHANGE_LOG.md` (protected as B0-13a); (5) explicit operator approval.

**Preconditions for B6-02 removal:** (1) operator answers Q-2; (2) 🔴 **a second copy placed on a volume separate from `C:`, hash-verified against `F80D2128…`, before removal** — the single Telegram-cache copy does not satisfy §31.1.2, and the earlier draft's claim that *"the preservation precondition is already met"* was wrong; (3) explicit operator approval.

⚠️ **Foreign material must never be pushed into the B.E.S.T repository** (§31.1.7) — the GitHub Classroom repo is graded and potentially public.

---

## BATCH 7 — AMBIGUOUS / OPERATOR DECISION REQUIRED

**Contents:** 19 items. **No cleanup is permitted on any of them.** Ordered by urgency.

| ID | ITEM | EXACT OPERATOR QUESTION |
|---|---|---|
| **Q-1** | 🔴 AUTH-01 preservation standard | *"Your SPORTSTER coursework is **not** at risk — it survives outside the workspace in two places, inside a larger file (`Sportster Context.txt`, SHA-256 `73F4A9FC…`) containing 100% of the workspace text plus 1,050 characters, saved 73 seconds after the mis-paste. **But §31.1.2 still requires two verified preservation copies before any removal, and that requirement is unconditional.** Both existing copies sit under the same OneDrive tenant, so they are not independent. **The narrow question: may those pre-existing supersets count as one of the two required copies, or do you want byte-exact copies of the original 1,792 bytes? Either way, one copy must go to a volume outside OneDrive before removal — and this read-only phase cannot create it.**"* |
| **Q-2** | 🔴 PeakPalate ownership **and preservation** | *"`00-PeakPalate-Master.mp4` (58,387,212 B, 1:50, Remotion 4.0.506) arrived via Telegram Desktop, where a byte-identical copy still sits. It has zero references in B.E.S.T and no Remotion toolchain exists anywhere in this workspace. **Two questions: (a) is it unrelated to your 60.004 submission? (b) §31.1.9 puts it under the same two-copy policy, and the Telegram cache folder is one copy on the same volume that Telegram auto-manages — where should the second, independent copy go?** I will not treat the Telegram copy as sufficient preservation."* |
| **Q-3** | 🔴 **Teaching-team deployment discussion** | *"The rank-0 Deliverables PDF expects GCP and scopes its alternative-deployment route to teams that **'discuss your deployment approach with the teaching team in advance.'** A workspace ruling cannot by itself satisfy a rank-0 PDF requirement. **I found no evidence anywhere that this conversation has occurred. The presentation window opens 10 Aug 2026 — two days from now.**"* |
| **Q-4** | 🔴 36 vs 37 / OD-1 | *"Confirm 37 is the `reference/` **pack** count only and the ratified **screen** inventory remains 36 — or cite the amendment admitting Auth 04 as screen 37. **No 36→37 edit will be made without one**, since it would require inventing a Figma node ID that A-022 forbids."* |
| **Q-5** | 🔴 N-4 Management bootstrap | *"`seed.sql` is **deliberately** absent (`STEP_7F_SYNTHETIC_FIXTURE_BASELINE.md:369`) to keep a tracked-file→hosted-DB path closed — yet no mechanism exists to create the first Management membership. **Which is authorized: (a) a new migration with a guarded idempotent INSERT; (b) a one-shot owner-only `management_bootstrap()` RPC; (c) a manual SQL-Editor runbook with no repo artefact; or (d) other? And does the choice reopen the 'no tracked file seeds a hosted database' rule?**"* |
| **Q-6** | 🔴 OD-4 hash-serializer versioning | *"`report_content_hash_v1` and `report_wording_hash_v1` embed the four old field names as **literal JSON keys**, so stored hashes are bound to them. **Do we (a) rename columns while freezing the `_v1` keys — preserving historical verifiability at the cost of permanent name/key divergence; or (b) add `_v2` serializers — and if so, what happens to hashes already stored: recompute, dual-store, or accept a verification discontinuity?**"* |
| **Q-7** | 🔴 OD-4 fail-open deny-lists — **NINE sites, not seven** | *"**Nine** sites deny-list the four panel names as **string literals** and will fail **OPEN** on rename — two more than the first draft found (`ct-suite.sql:176-179` and `run-management-approved.mjs:159-161`, both in runnable suites, the latter emitting an **affirmatively false PASS**). A tenth instance of the same pattern guards `elevated.ts`. **Must the OD-4 migration re-derive all nine against the new names AND demonstrate each one FIRING (not merely passing), and should the pattern change from literal names to a catalog-derived column list so no future rename can silently defeat it?**"* |
| **Q-8** | `report-workflow/actions.ts` 8 exports | *"Because the module is imported for `requestDraft`, Next registers all 9 exports as live Server Action endpoints. **Intentional second action surface, or an unnoticed side effect of the F16-C migration? If the latter, extract `requestDraft` so the other 8 stop being emitted?**"* 🔴 **Constraint discovered in adversarial review — the obvious remedy is not free.** `scripts/tests/g6-harness/census-provider-constructors.mjs:59-66` holds an **allow-list** naming `server/modules/report-workflow/actions.ts` as a permitted provider-constructor site. Extracting `requestDraft` moves `new OpenAiDraftProvider(` (`actions.ts:85`) and `new LocalTrustedDraftStore()` (`:103`) into a module **not on that list**, so the census **fails closed** — correctly, but unexpectedly. The file's own header warns: *"Adding a fourth entry here requires the SAME orchestrator authorization a new activation path would need in the first place — this file is not the place to quietly widen it."* **Any extraction therefore needs a same-commit `ALLOWED_CONSTRUCTOR_FILES` amendment under that authorization.** ⚠️ Separately: the claim that all 9 exports become live endpoints is **asserted from Next 16 semantics, not demonstrated** — proving it needs a build's server-reference manifest, which this read-only phase cannot produce |
| **Q-9** | `field.tsx` / `surface.tsx` | *"Were these F1 primitives the intended design system that screens were to migrate onto (pending adoption), or superseded by hand-rolled markup (safely deletable)? **No ratification note exists either way.**"* |
| **Q-10** | `.assertions.ts` ×4 | *"These cannot execute — `noEmit: true`, no runner, nothing imports them, and their claimed compile path does not exist. **Were they ever run? If not, any past claim that they passed is unsupported. Recommend wiring a runner rather than deleting.**"* |
| **Q-11** | Missing C3 narrative | *"**No `AUTONOMOUS_48H_RUN_C3_REPORT.md` exists anywhere**, yet `FINAL_MVP_AUTHORITY_LOCK.md:412` cites Run C3-A as accepted evidence. C1, C2 and B all have narrative reports. **Was one ever written?**"* |
| **Q-12** | `docs/plan/` baseline rank (C-5) | *"`CLAUDE.md` §1 seats the `docs/plan/` lifecycle baselines at **active rank 3**; Phase A G-20 says the Step 7I baseline is **HISTORICAL_EVIDENCE**. **None of the five carries a HISTORICAL banner.** Which governs — or shall five banners be added?"* |
| **Q-13** | `PHYSICAL_TEST_SLICE_48H.md` status (C-4) | *"`CLAUDE.md:33` calls it *'an active procedural contract'*; `:600` calls those documents *'the historical record of the 48-hour sprint'*. **This determines whether S-58/S-59 are stale or historical.**"* |
| **Q-14** | `reference/` panel-count inconsistency (**new — unrecorded anywhere**) | *"`reference/` is inconsistent on **panel count**, not only label: `Management - Term Report.md:11` and `Trainer - AI Report Generation.md:14` describe **three** panels, with Remarks as a separate input in the latter. OD-4 ratified **four**. **Does the four-panel model apply uniformly to those two screens?**"* |
| **Q-15** | R5 — 11 stale `SCREENSHOT_REQUIRED.txt` trailers | *"Eleven trailers read `Missing` for screens that **do** have a validated reference, contradicting `SCREEN_INDEX.md:86`. **Correct the trailer text, or accept the drift?** The Figma node ID must survive either way."* |
| **Q-16** | R6 — `UI_PACK_MANIFEST.json` | *"It declares `referenceScreenshot` for all 36 including the 24 that have none, so any machine consumer 404s on 24 paths."* |
| **Q-17** | R2/R3/R7 + Auth 04 | *"R2 is now **resolved** by PA-OD-5/5b (the prior manifest called `reference/` too ambiguous to touch; it is now ratified authority). **R3 (Auth 04 scope) and R7 remain open. OD-1 remains open and is one of FIVE — see Q-20…Q-23.**"* |
| **Q-20** | 🔴 **OD-5 — the wording-only editor has NO Figma frame** *(added after adversarial review; the first draft dropped four of the five open ODs)* | *"`/management/reports/[reportId]/edit` is described by `FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md:399` as **'the MVP's central control'** and it has **no Figma frame of any kind**. `GLOBAL_UI_RULES` §8 forbids fabricating one. **How is it to be dispositioned?** It is one of **eight blocked design families**, six of which the physical-test walkthrough exercises — i.e. **the entire management half of the story a demo must tell has no designed visual authority** (`:402`)."* |
| **Q-21** | 🔴 **OD-6 — both available workarounds are prohibited** | *"The academy raster wordmark on all three login frames needs `PORT` / `REFERENCE ONLY` / `REBUILD` / `REJECT`. `:400`: **§8 forbids both copying it and re-drawing it, so both available workarounds are prohibited until this is ruled.** `:454` records OD-6 as R2's remaining decision gate. This is a hard block, not a preference."* |
| **Q-22** | **OD-2 — login visual acceptance** | *"Do three separately-frozen, separately-SHA'd login references discharge against **one route captured at three `?role=` URL states**? The *route* question is already ruled — one shell is permitted. This is the **visual-acceptance** question only (`:396`)."* |
| **Q-23** | **OD-3 — sub-route identity** | *"Is `/trainer/reports/[reportId]/edit` a canonical sub-route of ID 10, or does it take its own inventory ID once a frame exists? Recorded and **deliberately** unresolved at F16 (`:397`)."* |
| **Q-25** | 🔴 **One rename or two?** *(added after adversarial review)* | *"`FINAL_MVP_AUTHORITY_LOCK.md:1071` authorises *'exactly **one** rename inside the ratified visual-authority tree'*, but `:1077` protects **two** HTML-in-`.txt` files and says both *'need a rename, never a delete'*. **Is the Lock's count an error, or is only one of the two renames authorized — and which?** I will not resolve a rank-1 inconsistency in my own favour."* |
| **Q-26** | 🔴 **Ninth/tenth fail-open guard: `elevated.ts`** | *"`static-scan.mjs:501` skips `elevated.ts` itself and only checks other files for an import, so **deleting the module makes T7I-40 pass vacuously while still printing its success line**. The same is true of the `createBrowserSupabaseClient` name scan at `run-runtime-profile.mjs:637`. **Should these negative controls assert that their anchor file EXISTS — the way `readRequired` at `run-runtime-profile.mjs:540-547` already does for `browser.ts`?**"* |
| **Q-24** | GC recording in the packs | *"`FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md:454` calls recording all fourteen GC conflicts in the affected packs' `implementation-notes.md` **'the highest-leverage, lowest-cost action in this plan'** — because packs 30 and 31 currently carry **no** recorded conflict, so **nothing stops a future agent from building GC-2 and GC-3 as drawn**. This manifest touches only GC-4 and GC-11. **Is completing the other twelve in Phase A2 scope, or deferred?**"* |
| **Q-18** | Amendment 006 R-A6-2 reasoning | *"A-055's conclusion is correct but its stated reasoning is **invalid** — 'smaller therefore earlier therefore subset' does not follow. A real line-set subtraction found **79 + 53 mirror-only lines**, all verified pre-amendment wording. **Record the corrected proof, or leave as-is since the ruling stands?**"* |
| **Q-19** | `participant` terminology | *"`real_participant_adapter` / 'Participant eligible: yes' are accurate software identifiers that **read as human-subject language** to an examiner. They are frozen in untracked evidence §31 forbids rewriting. **Confirm the purge applies to source code and submission text only, with a glossary entry as the control for frozen evidence?**"* |

---

## RECOMMENDED PRE-ACTION — BEFORE ANY BATCH RUNS

**This is a copy-out, not a cleanup, and it is the single operation most worth doing first.**

⚠️ **Rewritten after adversarial review.** The earlier version enumerated three narrow targets and thereby **excluded roughly 300 protected files — including the Authority Lock itself, both canonical PDFs, the migration tracker, `governance-source/`, and every `screen.md` / `implementation-notes.md` / `SCREENSHOT_REQUIRED.txt` in the UI tree.** Because **there is no `.git` at the workspace root**, none of that is in any repository, and "establish a remote" would have covered **none** of it. A single broad copy-out strictly dominates a curated list and removes the risk that BATCH 0 is itself incomplete.

**Do this one operation, before any batch runs:**

1. 🔴 ⚠️ **SUPERSEDED ON SCOPE 2026-08-08 by the repository-boundary normalization — DO NOT RUN THE EXCLUSION LIST BELOW AS WRITTEN.** The governance corpus and the whole `UI_REFERENCE_FINAL_MVP/` tree now live **inside** `SDS Project Final (BEST Coach)/`, so excluding that directory would exclude **the very material this step exists to protect** — the exact inversion of its stated intent. **The current form of this instruction is: copy the workspace root INCLUDING `SDS Project Final (BEST Coach)/` (excluding only `node_modules`, `.next` and `.git`), plus `SDS Project Sprint 2/`.** *Historical text follows.* ~~**Copy the entire workspace root, excluding `SDS Project Final (BEST Coach)`, `SDS Project Sprint 2`, `worktrees/`, and all `node_modules` / `.next`**~~ — approximately **350 files / ~75 MB**, plus the 58 MB video. This single sweep captures: the Authority Lock and OD-4 ruling · both canonical PDFs · the full `UI_REFERENCE_FINAL_MVP` tree including the **25 unduplicated PNGs** and the **2 HTML-in-`.txt` renders** · the **95-file evidence estate** · `governance-source/` · the migration tracker · every ungit'd governance document. **Hash everything on write.**
2. 🔴 **Separately copy the two `.env.local` files** — `SDS Project Final (BEST Coach)/.env.local` (539 B) and `SDS Project Sprint 2/.env.local` (179 B). Both are **gitignored**, so they are invisible to `git status --untracked-files=all` and are excluded from step 1's exclusions. Neither exists in any git object.
3. 🔴 **Establish a remote or an off-machine copy for the four repositories.** 3.28 GB including graded continuity evidence exists as one copy on one disk. This dominates every risk in this manifest and is independent of anything proposed here.

**Sequencing note:** steps 1–2 make findings C-1, H-1 and H-6 non-fatal *even if this manifest's protected list is still incomplete*, and they cost minutes. Do them first.

---

## SUMMARY OF PROPOSED ACTIONS

| Action | Count | Notes |
|---|---|---|
| **KEEP** | ~91,700 files | The overwhelming majority |
| **REWRITE_ACTIVE_SEGMENT** | **58** | BATCH 1 (59 listed, **S-57 withdrawn** after review); + 4 recorded-not-stale = 63 examined |
| **RENAME** (`.txt` → `.html`) | **2** | Highest-value; prevents irreversible loss. ⚠️ Gated on the §31.2 one-vs-two question (Q-25) |
| **ARCHIVE** | **0** | B3-01 revised to KEEP — it is §31.12a-protected and §31's scope note covers archiving |
| **REMOVE_WORKTREE** | **2** *(proposal only)* | ~1,646 MB; **5th precondition unmet** |
| **PRESERVE_FOREIGN_THEN_REMOVE** | **2** | Both `BLOCKED_PENDING_VERIFIED_PRESERVATION` **and** pending operator ruling |
| **NO_ACTION_AMBIGUOUS** | **24** | BATCH 7 |
| 🔴 **DELETE** | **0 unconditional** | ⚠️ **Corrected after adversarial review — the earlier row read "No file is proposed for deletion", which is false at the approval surface.** Conditional and individually gated: **2 file removals** (B6-01, B6-02) and **2 directory removals** (B5-01/02, together **45,714 files**). For B6-01 the manifest's own analysis states the exact 1,792 bytes exist nowhere else. **Each requires explicit operator approval plus its stated preconditions; none is authorized here.** |

**The correct Phase A2 outcome is to delete nothing unconditionally, correct 58 stale segments, rename 2 files, and — first — back up the workspace root in a single sweep.**

---

## Q-DISPOSITIONS — ALL 26 CLOSED (operator rulings, 2026-08-08)

**BATCH 7 contains exactly 26 Q-items (Q-1 … Q-26).** Any earlier total of 19 or 24 is superseded.

| Q | Disposition | Outcome |
|---|---|---|
| **Q-1** | `RESOLVED_BY_OPERATOR` | Strict **byte-exact** preservation. Two verified copies (OneDrive + D:), then reconstruction from node `546:370`. **DONE.** |
| **Q-2** | `RESOLVED_BY_OPERATOR` | **PeakPalate `KEEP_IN_PLACE`** — `FOREIGN_REFERENCE_RETAINED_BY_OPERATOR`. Backed up to both snapshots, **not moved, not altered**. Removal proposal **withdrawn**. |
| **Q-3** | `RESOLVED_BY_OPERATOR` | `OPERATOR_CONFIRMED_TEACHING_TEAM_DEPLOYMENT_APPROVAL`. Vercel + hosted Supabase approved. ⚠️ **Operator-reported external confirmation — no workspace documentary evidence exists and none was fabricated.** |
| **Q-4** | `RESOLVED_BY_OPERATOR` | **36 governed screens · 37 reference packs.** Auth 04 does **not** become screen 37. No Figma node invented. |
| **Q-5** | `DEFERRED_TO_PHASE_B_TECHNICAL_PROOF` | Management bootstrap: narrow, owner-controlled, fail-closed, idempotent, auditable. **Migrations must never auto-grant membership.** Operator-controlled admin channel preferred. |
| **Q-6** | `DEFERRED_TO_PHASE_B_TECHNICAL_PROOF` | **V2 hash semantics** with keys `overview · strengths · areas_for_development · remarks`. **`_v1` bodies preserved unchanged.** No historical-data migration invented — no production rows exist. |
| **Q-7** | `DEFERRED_TO_PHASE_B_TECHNICAL_PROOF` | All **nine** guards re-derived at OD-4 implementation. **Acceptance requires proving each negative control can FIRE.** Catalog-derived detection preferred. **Not modified in Phase A2.** |
| **Q-8** | `KEEP_NO_CLEANUP_ACTION` | Eight exports **kept**. Phase B must prove actual Next 16 server-reference exposure before deciding. If `requestDraft` moves, the provider-constructor allow-list is amended in the same governed change. |
| **Q-9** | `KEEP_NO_CLEANUP_ACTION` | `field.tsx` / `surface.tsx` kept; Final UI implementation decides adopt-or-supersede. |
| **Q-10** | `KEEP_NO_CLEANUP_ACTION` | Four `.assertions.ts` kept. **Never reported as passing without a real runner.** |
| **Q-11** | `RESOLVED_BY_EXISTING_AUTHORITY` | **No C3 narrative fabricated.** If needed later, a clearly labelled `RECONSTRUCTED C3 EVIDENCE SUMMARY` built strictly from surviving accepted evidence. |
| **Q-12** | `RESOLVED_BY_OPERATOR` | Historical-scope banners added to `STEP_7I_REPORT_LIFECYCLE_BASELINE.md`, `PHYSICAL_TEST_SLICE_48H.md`, `COMPETENCY_VOCABULARY_RECONCILIATION_PLAN.md`, `BEST_Coach_Implementation_Plan.md`. **Correctly-scoped historical figures preserved — the Step 7I 28-function snapshot and the Step-7I-created 14 `authenticated` grants were NOT rewritten.** |
| **Q-13** | `RESOLVED_BY_OPERATOR` | `PHYSICAL_TEST_SLICE_48H.md` classified **`HISTORICAL_PROCEDURAL_EVIDENCE`**. Only the actively-instructing *"No implementation exists today"* was corrected. |
| **Q-14** | `RESOLVED_BY_OPERATOR` | **Four-panel model ratified uniformly** across Trainer, Management, Parent. Reference Markdown describing three panels is **functionally superseded**. **No PNG/HTML bytes altered.** |
| **Q-15** | `RESOLVED_BY_OPERATOR` | 11 stale trailers corrected. Figma node IDs, provenance and history preserved. **Verified: 12 packs hold a screenshot, exactly 12 claim one — zero mismatches. None manufactured.** |
| **Q-16** | `RESOLVED_BY_OPERATOR` | 24 phantom `referenceScreenshot` paths nulled; `screenCount: 36` and the 12 validated frozen relationships preserved. **Nothing manufactured.** |
| **Q-17** | `RESOLVED_BY_EXISTING_AUTHORITY` | R2 closed by PA-OD-5/5b. **R3 and R7 carried to the execution plan** — they block nothing here. |
| **Q-18** | `RESOLVED_BY_OPERATOR` | A-055 ruling kept; corrected proof recorded as annotation. **History not falsified.** |
| **Q-19** | `RESOLVED_BY_OPERATOR` | `real_participant_adapter` and frozen identifiers **not renamed**. Submission material must distinguish technical adapters from **human usability participants**; glossary is the control. |
| **Q-20** | `DEFERRED_TO_PHASE_B_TECHNICAL_PROOF` | Management wording-only editor: **derived governed implementation authorized**, inheriting the nearest authoritative Management report shell. **Does not become a new authoritative Figma screen.** Management still cannot change ratings, attendance, observations, trainer notes, evidence or any assessment fact. |
| **Q-21** | `RESOLVED_BY_OPERATOR` | Use the accepted repository B.E.S.T mark. **OD-6 no longer blocks** — the deadlock where both workarounds were prohibited is broken. |
| **Q-22** | `RESOLVED_BY_OPERATOR` | One governed auth route may render three role states; each still independently visually validated. |
| **Q-23** | `RESOLVED_BY_OPERATOR` | `/trainer/reports/[reportId]/edit` is a **canonical sub-route/state of screen ID 10**; no new screen ID without explicit future authority. |
| **Q-24** | `RESOLVED_BY_OPERATOR` | **GC-1…GC-14 recorded into 19 packs.** Packs 30 and 31 previously carried none — nothing had stopped an agent building GC-2/GC-3 as drawn. **No visual bytes altered.** |
| **Q-25** | `RESOLVED_BY_OPERATOR` | The Authority Lock's singular count was a **count error**. **Both** renames authorized and executed, **bytes unchanged**. Falsified documents updated. |
| **Q-26** | `DEFERRED_TO_PHASE_B_TECHNICAL_PROOF` | Negative controls must **assert their anchor exists** and **fail closed**. Never a vacuous PASS. Phase B test-hardening. |

### ⚠️ Q-ID CONTINUATION — issued AFTER Phase A2 closure (registered here only to prevent ID collision)

**Batch 7's count of 26 is correct and is NOT amended.** Q-27 and Q-28 are **not** Batch 7 items and were **not** part of Phase A2. They were issued by the operator on **2026-08-08, after** the Phase A2 completion tag `final-mvp/phase-a2-complete-2026-08-08`, during the **final pre-execution-plan governance synchronization**. They are recorded here because this table is the **sole registry of `Q-` identifiers**, and a future agent assigning "the next Q" must not reuse 27 or 28.

| Q | Disposition | Outcome | Canonical instrument |
|---|---|---|---|
| **Q-27** | `RESOLVED_BY_OPERATOR` | **Parent Dashboard: the complete "This Term's Skills" nine-dimension ratings card is `DO_NOT_IMPLEMENT`** — title, labels, bars, rating-derived state and any replacement visualization. Profile Details promotes upward. Parent-facing **projections/DTOs/RPCs/payloads** must exclude the nine ratings — **CSS hiding is not exclusion**. Trainer/Management ratings **unaffected**; OD-4 **unchanged**. **No visual bytes altered.** | `FINAL_MVP_AUTHORITY_LOCK.md` §15.2 |
| **Q-28** | `RESOLVED_BY_OPERATOR` | **Structured UTF-8 write safeguard.** The PowerShell 5.1 `ConvertTo-Json` round-trip and `Set-Content -Encoding UTF8` write path — the one that corrupted `UI_PACK_MANIFEST.json` and BOM-stamped 11 `SCREENSHOT_REQUIRED.txt` files in Phase A2 — is **prohibited** for structured/BOM-less-UTF-8 project files. Standing operational rule, with mandatory post-write verification. | `CLAUDE.md` §11 |

---

**Intentionally deferred to `FINAL_MVP_EXECUTION_PLAN.md`:** **the Windows clone/long-path operational prerequisite** — `core.longpaths` is unset and the longest tracked path is 113 chars, so the active repository works and **this is not a current blocker**; the plan should state that clone/worktree roots be kept reasonably shallow and that, if path-length checkout failures occur, the **operator** may enable Git long-path support or relocate the clone (**a clone-side environment setting, never a repository invariant, and never changed by a session on the operator's behalf**) · **the five Q-27 Parent Dashboard acceptance criteria — reference-minus-card · Profile Details promoted upward · no replacement ratings visualization · Parent-facing projections proved rating-free AT THE DATA LAYER · Trainer/Management ratings proved unaffected (`FINAL_MVP_AUTHORITY_LOCK.md` §15.2, and the plan MUST carry them)** · Management bootstrap · OD-4 schema/column migration · V2 hash serializers · Overview grounding-rule re-derivation · the nine OD-4 fail-open guards · anchor-existence negative controls · server-action exposure proof · executable assertion runner · Management derived wording-only editor · attendance write path · evidence-media implementation · hosted draft-storage transport · hosted Supabase · Vercel deployment · production UAT · human usability testing.

---

## ADVERSARIAL REVIEW RECORD

Two independent read-only reviewers attacked this manifest and its companion audit. **Reviewer 1 (authority / historical loss): 2 CRITICAL, 8 HIGH, 8 MEDIUM, 5 LOW. Reviewer 2 (technical dependency): 0 CRITICAL, 4 HIGH, 5 MEDIUM, 6 LOW.** Both returned *"not safe to hand to an operator as written."* **All CRITICAL and HIGH findings are closed above; the material MEDIUM and LOW findings are closed too.**

**What survived both attacks unchanged** — every hash, the AUTH-01 superset proof, the PeakPalate hash match, all four BATCH 5 proof legs, the evidence-estate tracking claim, the code-safety of both renames, B4-01's zero-importer finding, the 36→37 refusal (backed verbatim by Amendments 004/005/006), and roughly 50 sampled BATCH 1 quotations with **zero** citation drift.

**What the reviews changed, and why it mattered:**

| Finding | Effect |
|---|---|
| **BATCH 0 was incomplete** | `CHANGE_LOG.md`, the `AUTONOMOUS_48H_*` family, `RUN_C2…`, `complete mvp screens compiled figma list.txt` and **`SDS Project Final (BEST Coach)/.env.local`** were all §31-protected or single-copy and all missing. **A protected list treated as exhaustive but isn't is more dangerous than none.** |
| **S-57 was wrong and would have corrupted a rank-3 baseline** | The line self-scopes to *"only functions Step 7I creates"*. Editing 14→25 would have committed **precisely the two-frames error this audit condemns in §3.1**. Withdrawn. |
| **Both preservation blockers were weaker than ratified §31.1 permits** | §31.1.2/§31.1.6 are unconditional and §31.1.9 binds PeakPalate by name. The "Reading A / Reading B" framing offered a branch in which **no copy is ever created**. Withdrawn; both escalated to `BLOCKED_PENDING_VERIFIED_PRESERVATION`. |
| **`elevated.ts`'s protection rested on a false mechanism** | Deleting it makes T7I-40 pass **vacuously** — a further instance of the very fail-open pattern the audit calls its most serious finding, sitting inside the audit's own protected-material rationale. |
| **Seven deny-lists were actually nine** | Two workstreams each found one half of a matched SQL/JS pair and neither reconciled them. One of the missed sites emits an **affirmatively false PASS**. |
| **The summary table said nothing gets deleted** | BATCH 5 + BATCH 6 remove 45,716 files. The last section is the approval surface; it now says so. |
| **Four open operator decisions were dropped** | OD-2, OD-3, OD-5 and OD-6 appeared nowhere. OD-5 governs *"the MVP's central control"*; OD-6 blocks both available workarounds. |
| **The pre-action backup under-scoped by ~300 files** | Including the Authority Lock itself and both canonical PDFs. Replaced with one broad sweep that dominates any curated list. |
| **Q-8's obvious remedy is not free** | Extracting `requestDraft` trips an allow-list census that **none** of BATCH 4's validation suites would have caught. |
| **The manifest broke its own disciplines twice** | B2-07 grouped two different hashes as a duplicate; two rows used mtime as evidence. Both corrected on content. |
