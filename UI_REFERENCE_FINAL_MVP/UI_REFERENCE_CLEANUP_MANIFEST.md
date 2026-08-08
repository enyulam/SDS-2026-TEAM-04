# UI_REFERENCE_FINAL_MVP — Cleanup Manifest

**Created:** 2026-08-07 (Asia/Singapore) at the Final MVP Submission Readiness Audit.
**Baseline:** main HEAD `139d753`, working tree clean.
**Status:** Proposal only. **Nothing was moved, renamed, copied, deleted, archived or modified to produce this document. No `_archive` directory was created.**

---

## 0. Headline

> ## The proposed archive manifest is **EMPTY**. Zero files are proposed for archival.

This is a substantive finding, not an evasion. Applying the audit's own rules — never archive authoritative final material, never archive ambiguous files, never archive accepted sprint evidence or anything that could be needed as submission evidence, never archive a file another file references — eliminates every candidate in the pack. The reasoning is given file-by-file in §5.

**Two things require attention and neither is a cleanup action:**

1. **A data-integrity incident** in `AUTH-01-trainer-login/SCREENSHOT_REQUIRED.txt` (§2). Highest priority.
2. **Seven items requiring an operator ruling** (§6), chiefly the undeclared `reference/` tree.

---

## 1. Inventory

| Metric | Value |
|---|---:|
| Total files | **341** |
| Total directories | 95 |
| Total size | **19,463,843 B (18.56 MiB)** |

| Extension | Count | | Group | Files | Bytes |
|---|---:|---|---|---:|---:|
| `.md` | 133 | | Pack root (governing docs + reports) | 22 | 839,970 |
| `.png` | 118 | | 36 screen-pack folders | 120 | 2,497,007 |
| `.txt` | 38 | | `reference/` (37 folders) | 111 | 5,892,087 |
| `.html` | 35 | | `_checkpoint-evidence/` (19 folders) | 88 | 10,234,779 |
| `.json` | 14 | | | | |
| `.mjs` | 3 | | | | |

```
UI_REFERENCE_FINAL_MVP/
├── [22 root files]
├── 01-trainer-dashboard/ … 33-parent-class-report/     (33 pack folders)
├── AUTH-01-trainer-login/ AUTH-02-management-login/ AUTH-03-parent-login/
├── reference/            (37 Figma-export folders)
└── _checkpoint-evidence/ (19 folders: F1 F2 F3 F10 F11 F13 F16 F17
                           F-01a F-01b F-04 F-05 F-06 F-07 F-08 F-09 F-12 F-14 F-15)
```

> **Counting note.** These figures exclude the two documents this audit itself produced (`FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md` and this manifest), which now also sit in the pack root. Including them, the tree holds 343 files across 24 root files.

Every one of the 36 packs contains exactly `screen.md`, `implementation-notes.md`, `SCREENSHOT_REQUIRED.txt`; **12** additionally contain `reference.png`.

### 1.1 Integrity check — PASSED

SHA-256 was recomputed for all 12 present `reference.png` files and compared against the `sha256` recorded per screen in `UI_PACK_MANIFEST.json`. **12 / 12 match. No frozen reference has drifted.**

---

## 2. ⚠️ DATA-INTEGRITY INCIDENT — requires operator decision before any cleanup runs

**File:** `UI_REFERENCE_FINAL_MVP\AUTH-01-trainer-login\SCREENSHOT_REQUIRED.txt`

| Property | This file | Every other `SCREENSHOT_REQUIRED.txt` |
|---|---|---|
| Size | **1,792 B** | 833 – 937 B |
| Modified | **2026-08-07 01:30** | 2026-08-05 23:47 |
| Content | Unrelated coursework about a **"SPORTSTER"** sports marketplace — platform strategy, transaction fees, multi-homing policy, week-by-week strategy notes | The Figma export instruction with node ID, file key and `/design/` URL |

**The AUTH-01 Figma export instruction has been overwritten in place.** A workspace-wide grep for `SPORTSTER` returns **exactly one hit — this file**, and at the time `UI_REFERENCE_FINAL_MVP` was outside every git repository, so no version-control copy of the original exists. *(Location superseded 2026-08-08 — the tree is now in-repo. **The finding is unchanged:** git history begins after the overwrite, so no pre-contamination copy exists there either.)* (The instruction's *content* is nonetheless fully reconstructible — see below — so "overwritten" is the accurate word, not "lost".)

**Was anything else *written* at that moment? No** — the nearest neighbouring modification times in the pack are `AUTONOMOUS_48H_RUN_C2_REPORT.md` at 01:13 and `_checkpoint-evidence/F17/gate-ledger.md` at 07:17.

⚠️ **Correction (2026-08-07): the incident is NOT isolated in the sense that matters.** The original scan looked only at *modification* times, and only inside `UI_REFERENCE_FINAL_MVP`. Widening to *birth* times across the workspace root shows a **second foreign-module artefact arrived 35 minutes earlier**:

| Artefact | Birth (created on this disk) | Modify | Reading |
|---|---|---|---|
| `00-PeakPalate-Master.mp4` (58.4 MB) | **2026-08-07 00:55:39** | 2026-08-06 22:49:23 | Birth *later* than modify = **copied in with the source timestamp preserved**; authored elsewhere |
| `AUTH-01/SCREENSHOT_REQUIRED.txt` | — | **2026-08-07 01:30:46** | The SPORTSTER paste |

**Two foreign-module artefacts entered this workspace within 35 minutes on the night of 6–7 August.** R1 should therefore be re-scoped from *"what else was written at 01:30?"* to **"what else arrived that night, and does any of it belong to another module?"** This materially raises the contamination risk for any Phase A2 cleanup, and it is corroborating evidence that the user works across several modules whose material transits this one workspace.

**Assessment.** This has the signature of an accidental save into the wrong path — unrelated coursework written over the placeholder. **The displaced content is not project material and may be work that is still needed elsewhere.** For that reason it has been left completely untouched, and no action is proposed.

**Recoverability of what was lost: complete.** AUTH-01's metadata survives in two independent places —
- `UI_PACK_MANIFEST.json:156-157` — `"figmaNodeId": "546:370"`, `"figmaUrl": "…node-id=546-370&m=dev"`
- `SCREEN_INDEX.md:30` — node `546:370`, route `/login?role=trainer`, Core, flow order 1

`AUTH-01-trainer-login/reference.png` itself is **unaffected** and its SHA-256 matches the manifest.

**Operator decisions required (R1).** Was this an accidental paste? Should the SPORTSTER text be recovered to its intended location first? Should the placeholder then be reconstructed from the manifest? Should the incident be recorded in `CHANGE_LOG.md`? **Was anything else written at 2026-08-07 01:30?**

**Why this blocks cleanup.** A cleanup script that trusts modification times would treat this as the **newest and most authoritative file in the entire pack**. No automated cleanup may run over this directory until R1 is resolved.

---

## 3. Manifest / disk cross-check

### 3.1 Declared in manifest, absent from disk

**None at folder level** — all 36 `folder` values resolve to real directories.

At *file* level, all 36 screens declare `"referenceScreenshot": "reference.png"` but **24 of those files do not exist**: screens `01, 02, 03, 04, 09, 11, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 25, 26, 27, 28, 30, 31`.

✅ **RESOLVED 2026-08-08 (Phase A2, Q-16 — R6 closed).** The 24 phantom paths were **nulled**: the manifest now declares `"referenceScreenshot": "reference.png"` on exactly the 12 packs that hold a local duplicate and `null` on the other 24, with **0 declared-vs-disk mismatches**. ⚠️ **And the framing below was itself misleading**: those 24 screens were never without a visual reference — each has a ratified frame in `UI_REFERENCE_FINAL_MVP/reference/` (mapping published in `SCREEN_INDEX.md`). What was absent was only the **optional pack-local duplicate**. *Historical text follows.* This is **expected and honestly documented** (README line 52; `SCREENSHOT_CHECKLIST.md` §B state the 24 deferred exports are intentionally not yet produced). It is a **manifest-schema weakness, not a missing file**: the field is unconditional and does not distinguish "declared filename" from "present file", so a machine consumer 404s on 24 declared paths. Carried as **R6**.

### 3.2 On disk, not declared in the manifest

| Directory | Files | Bytes | Status |
|---|---:|---:|---|
| **`reference/`** | 111 | 5,892,087 | **Undeclared by `UI_PACK_MANIFEST.json`, `SCREEN_INDEX.md` and the README — and unreferenced by any file in the workspace.** Carried as **R2** |
| `_checkpoint-evidence/` | 88 | 10,234,779 | Undeclared in the manifest, but *referenced* by `CHANGE_LOG.md` lines 200 and 301 |

Ten root files are absent from the README's "Files in this pack root" table — **nine `AUTONOMOUS_48H_*.md` files** plus `RUN_C2_UI_ARCHITECTURE_RECONCILIATION.md`. These were added after the README was written: **the README is stale, the files are not extraneous.** Carried as **R7**.

---

## 4. Classification

### 4.1 AUTHORITATIVE FINAL — do not archive

| File / group | Inbound refs | Reason |
|---|---:|---|
| `CHANGE_LOG.md` | 52 | Named governing document |
| `FRONTEND_RECONSTRUCTION_PLAN.md` | 26 | **The** operational plan, F0…F17. Not superseded |
| `GLOBAL_UI_RULES.md` | 19 | Governing document; constrains every screen |
| `FRONTEND_RECONSTRUCTION_TRACKER.md` | 12 | Live status record; modified 2026-08-06 |
| `CORE_SCREENSHOT_VALIDATION_REPORT.md` | 11 | Validation evidence for the 12 frozen references |
| `SCREEN_INDEX.md` | 10 | The 36-screen index |
| `48H_CORE_SLICE.md` | 8 | Defines the 12-screen core slice |
| `AUTONOMOUS_48H_EXECUTION_TRACKER.md` | 7 | **Most recently modified file in the pack (2026-08-07 13:05)** |
| `FRONTEND_STEP_REPORT_TEMPLATE.md` | 5 | Mandatory 20-part checkpoint report template |
| `IMPLEMENTATION_WORKFLOW.md` | 4 | Governing workflow |
| `README.md`, `SCREENSHOT_CHECKLIST.md`, `UI_PACK_MANIFEST.json` | 3 each | Governing documents |
| `AUTONOMOUS_48H_RISK_REGISTER.md`, `AUTONOMOUS_48H_RUN_B_FINAL_REPORT.md`, `AUTONOMOUS_48H_RUN_C1_REPORT.md`, `AUTONOMOUS_48H_RUN_C2_REPORT.md`, `RUN_C2_UI_ARCHITECTURE_RECONCILIATION.md` | 1–2 each | **Accepted sprint evidence — cumulative, not superseding.** *(Filenames given in full — a cleanup script fed an abbreviated form would match nothing.)* |
| 36 × `screen.md` | — | Per-screen governing context |
| 36 × `implementation-notes.md` | — | Append-only record. **16 substantive (8,240–38,722 B), 20 live empty templates (1,156–1,174 B)**. **All 36 are md5-unique.** The four deferred screens carrying substantive records are **01, 09, 11, 30** — i.e. the three MAJOR screens plus 01 |
| 12 × `reference.png` | — | The frozen validated targets; 12/12 SHA match |
| 35 × `SCREENSHOT_REQUIRED.txt` | — | See §4.5 — **24 are live unmet TODOs** |
| `_checkpoint-evidence/**` (88 files) | — | Sprint checkpoint evidence, F1–F17 |

### 4.2 INTERMEDIATE — historical value, still not archivable

| File | Bytes | Reason not archived |
|---|---:|---|
| `AUTONOMOUS_48H_MASTER_PLAN.md` | 23,528 | Run A planning artefact. Records the contract under which autonomous work ran |
| `AUTONOMOUS_48H_TASK_GRAPH.md` | 19,857 | Run A companion |
| `AUTONOMOUS_48H_AGENT_CONTRACTS.md` | 18,499 | **Zero inbound references** — but zero references makes it *unused*, not *unneeded*. It records the agent contracts and prohibitions the sprint was executed under: exactly what an academic governance submission needs |
| `AUTONOMOUS_48H_FINAL_REPORT_TEMPLATE.md` | 10,238 | Template; the final report has not yet been written from it |

### 4.3 OBSOLETE

**None identified.** No file in the pack declares itself superseded, and no file declares another superseded. Every `supersede` / `replaced by` match in the pack refers to *vocabulary labels* (`emerging`/`secure`/`advanced`) or to UI components — never to a file.

**The supersession question is resolved:** `FRONTEND_RECONSTRUCTION_PLAN` (what the F-checkpoints are) · `FRONTEND_RECONSTRUCTION_TRACKER` (their live status; tracker line 3 declares itself *governed by* the plan) · `AUTONOMOUS_48H_*` (an **orthogonal axis** — the multi-agent runs that execute those checkpoints). `AUTONOMOUS_48H_RUN_C1_REPORT.md` line 7 states it directly: *"This report does **not** rewrite `AUTONOMOUS_48H_RUN_B_FINAL_REPORT.md`. It is the successor record."* Successor means cumulative, not superseding. **These are complementary, not competing.**

### 4.4 DUPLICATE — proven by hash, and none is disposable

**Group D1 — 12 pairs, 1,832,298 B (1.75 MiB) of byte-identical redundancy.** Each pack `reference.png` is MD5-identical to its counterpart in `reference/`:

| Pack copy | `reference/` copy | MD5 |
|---|---|---|
| `05-trainer-schedule/reference.png` | `Trainer - Schedule/…png` | `a25f5ef6…f928` |
| `06-trainer-student-roster/reference.png` | `Trainer - Student Roster/…png` | `0505a496…71e0` |
| `07-trainer-grade-student/reference.png` | `Trainer - Grade Student/…png` | `d6dc77be…cd63` |
| `08-trainer-ai-report-generation/reference.png` | `Trainer - AI Report Generation/…png` | `e2b85ed1…5d63` |
| `10-trainer-student-report/reference.png` | `Trainer - Student Report/…png` | `a58772b5…5065` |
| `19-management-student-report/reference.png` | `Management - Student Report/…png` | `3f67dd65…d2c2` |
| `29-management-reports/reference.png` | `Management - Reports/…png` | `7cccfebd…6613` |
| `32-parent-reports/reference.png` | `Parent - Report/…png` | `ed5e8b01…5b78` |
| `33-parent-class-report/reference.png` | `Parent - Class Report/…png` | `f8f9a9b0…3110` |
| `AUTH-01-trainer-login/reference.png` | `Auth 01 - Trainer - Login/…png` | `63b87f58…7b05` |
| `AUTH-02-management-login/reference.png` | `Auth 02 - Mangement - Login/…png` | `3d81401e…a15b` |
| `AUTH-03-parent-login/reference.png` | `Auth 03 - Parent - Login/…png` | `59b7a1d5…d11b` |

**This proves `reference/` is the provenance source of the 12 frozen references.** Neither side is redundant *in role*: the pack copy is the SHA-pinned governed target named in `UI_PACK_MANIFEST.json`; the `reference/` copy is its origin, carrying the HTML and MD context. **Removing either breaks a governed guarantee. Not proposed for deduplication.**

**Group D2 — 3 pairs, 200,575 B, across checkpoints:**

| A | B | MD5 |
|---|---|---|
| `F2/auth-01-trainer.png` | `F3/auth-01-trainer.png` | `efa4061d…a6da` |
| `F2/auth-02-management.png` | `F10/auth-02-management.png` | `1ae9fa29…27b4` |
| `F2/auth-03-parent.png` | `F13/auth-03-parent.png` | `02e5a04b…6dd6` |

Duplicates *as bytes*, **not as evidence**. F2, F3, F10 and F13 are four distinct checkpoints, named together in `CHANGE_LOG.md` line 301. Deduplicating would destroy the per-checkpoint evidence chain and remove a reviewer's ability to confirm each checkpoint captured its own. **Not proposed.**

**Negative finding worth recording:** the 24 stub `implementation-notes.md` files look near-identical (1,156–1,174 B) but **all 36 are md5-unique** — each embeds its own screen ID. They are **not** duplicates.

### 4.5 `SCREENSHOT_REQUIRED.txt` — live TODOs, not dead placeholders

| Bucket | Count | Detail |
|---|---:|---|
| **LIVE — screenshot genuinely absent** | **24** | The 24 deferred screens. Trailer reads `Deferred - required for final-MVP completion after physical test`. **Real outstanding work items** |
| **STALE text — screenshot present** | **11** | Packs 05, 06, 07, 08, 10, 19, 29, 32, 33, AUTH-02, AUTH-03 have a validated `reference.png` but their trailer still reads `Missing - required before physical-test visual reconstruction`, contradicting `SCREEN_INDEX.md:86` and the manifest. **Stale text, not a dead file** — the body still carries the exact Figma node ID needed for re-export. Carried as **R5** |
| **CORRUPTED** | **1** | AUTH-01 — §2 |

**None is obsolete.** Archiving any would delete the only per-folder record of the exact Figma node to re-export from — a loss AUTH-01 has already suffered.

### 4.6 AMBIGUOUS — explicitly NOT proposed for archival

Per the audit rule, ambiguous files are listed for human ruling and never archived.

| Item | Why ambiguous |
|---|---|
| `AUTH-01-trainer-login/SCREENSHOT_REQUIRED.txt` | §2 — corrupted, no backup, contains unrelated user content |
| **`reference/`** (111 files, 5.89 MB) | Undeclared by every governing document **and** unreferenced by any file in the workspace — yet demonstrably the provenance of the 12 SHA-pinned frozen references and the only candidate source for the 24 unmet TODOs. Governance status genuinely undetermined |
| `reference/Auth 04 - All Users - Forgot Password/` (3 files, 35,573 B) | A fully designed screen with **no pack folder, no inventory ID and no node ID**, outside the ratified 36 |
| ~~`reference/Management - Students/….txt` (46,166 B) and `reference/Trainer - Students/….txt` (37,574 B)~~ **→ both now `.html`** | ~~HTML content under a `.txt` extension with no sibling `.html`. Any `*.html` consumer silently skips screens 04 and 17~~ **✅ R4 CLOSED 2026-08-08 (Phase A2, operator ruling Q-25).** Renamed to `.html` with **bytes unchanged** (pre/post SHA-256 identical). `reference/` now holds **37 `.html` and zero `.txt`**, so no `*.html` consumer skips screens 04 or 17 |
| The 24 stub `implementation-notes.md` | Structurally mandated by README line 49, md5-unique, append-targets for future checkpoints. Listed only so a reader does not mistake them for dead files. **Not archivable** |

---

## 5. Proposed archive manifest

### 5.1 Pre-check — does an authoritative archive structure already exist?

**No.** A workspace-wide search (depth 4) for `*archive*`, `*_deprecated*`, `*superseded*`, `*frozen*` returned **zero hits**. `UI_REFERENCE_FINAL_MVP\_archive` does not exist. There is no existing convention to prefer, so the nominated destination stands:

```
UI_REFERENCE_FINAL_MVP\_archive\pre-final-reference-pack\
```

### 5.2 The manifest

> ### EMPTY — zero files, zero bytes proposed for archival.

| Candidate considered | Why NOT proposed |
|---|---|
| `reference/` (111 files, 5.89 MB) — undeclared, unreferenced | **AMBIGUOUS** → the rule forbids archiving ambiguous files. It is also the proven provenance of the 12 SHA-pinned references and the only source for the 24 live TODOs. Archiving it would strand every deferred screenshot task |
| The 12 duplicate `reference.png` pairs (1,832,298 B proven redundant) | Neither side is redundant in role — one is the SHA-pinned governed target, the other its origin plus HTML/MD context |
| The 3 byte-identical checkpoint PNGs | **Accepted sprint evidence.** Four distinct checkpoints; deduplication destroys the evidence chain. Rule forbids |
| The 4 INTERMEDIATE `AUTONOMOUS_48H_*` planning docs (72 KB) | The sprint's own tracker was modified **today**; F16 is explicitly "not fully accepted"; F17's gate ledger updated 2026-08-07 07:17. These record the contracts and risk acceptances the autonomous work ran under — precisely what a governance submission needs. Rule: never archive potential submission evidence |
| `AUTONOMOUS_48H_AGENT_CONTRACTS.md` (0 inbound refs) | Zero references makes it *unused*, not *unneeded*. Same submission-evidence rule |
| 36 × `SCREENSHOT_REQUIRED.txt` | 24 live TODOs; the other 11 carry the Figma node IDs needed for re-export |
| 24 stub `implementation-notes.md` | Mandated by README, md5-unique, append-targets |
| Anything in `SDS Project Sprint 2` | **FROZEN DEMO — §7. Not touched, not proposed, not surveyed for modification** |

**Premise, stated correctly.** Inbound-reference count is **not** by itself a soundness criterion for archival — archiving *relocates* a file, it does not delete it, so a broken reference is a path-update problem, not proof of unarchivability. Taken literally, "referenced ⇒ unarchivable" would make every referenced file in every repository permanently frozen.

The correct premise is narrower and still yields the same answer here: **every root document is either a named governing instrument or live sprint evidence for a sprint whose tracker was written to on the audit date**, and relocating any of them would break citation paths across an *unclosed* audit chain for no compensating benefit. That is why nothing in the pack root qualifies — not the reference count itself.

*(Counting method, since the document should be reproducible: counts are of files within `UI_REFERENCE_FINAL_MVP` containing the filename as a literal string, excluding self-reference. A second pass produced slightly lower figures — 50/22/11/12/9/9/6/4/0 against the table's 52/26/19/12/11/10/8/7/0 — directionally identical, but the discrepancy is unresolved and the table should be treated as indicative, not exact.)*

---

## 6. Requires human ruling — NOT proposed for archival

| # | Item | Ruling needed | Bytes |
|---|---|---|---:|
| **R1** | `AUTH-01/SCREENSHOT_REQUIRED.txt` corrupted with unrelated SPORTSTER content, 2026-08-07 01:30, no backup | **Highest priority.** Accidental paste? Recover the displaced content to its intended home first? Reconstruct the placeholder from `UI_PACK_MANIFEST.json:156-157` (node `546:370`)? Record in `CHANGE_LOG.md`? **Was anything else written at that time?** | 1,792 |
| **R2** | `reference/` — 111 files, undeclared and unreferenced, bulk-imported 2026-08-06 21:52 | **Declare it** in `UI_PACK_MANIFEST.json` / README as the provenance store (**recommended** — its PNGs demonstrably produced the 12 frozen references), or rule it an unsanctioned import? ⚠️ **Coupled to the screen plan:** that document places Figma-export material on the *functional* authority ladder's lowest rank and concludes visual reconciliation of a deferred screen is not currently possible. If R2 declares `reference/` authoritative provenance, that conclusion must be re-examined — a frozen reference must still be *frozen and SHA-pinned*, so declaring provenance does **not** by itself populate visual-authority rank 1 | 5,892,087 |
| **R3** | `reference/Auth 04 - All Users - Forgot Password/` | Is password recovery a **scope gap** in the ratified 36-screen inventory, or an out-of-scope export? Adding a 37th screen requires an amendment. Tracked as OD-1 in the screen reconciliation plan | 35,573 |
| **R4** | Two HTML documents carrying a `.txt` extension (screens 04, 17) | Export accident or deliberate? Any `*.html` consumer silently skips both screens | 83,740 |
| **R5** | 11 stale `SCREENSHOT_REQUIRED.txt` trailers claiming `Missing` for screens that have a validated reference | Correct the trailers, or accept the drift? They contradict `SCREEN_INDEX.md:86` and the manifest | ~9,700 |
| ~~**R6**~~ ✅ **CLOSED 2026-08-08** | ~~`UI_PACK_MANIFEST.json` declares `referenceScreenshot` for all 36 including the 24 absent~~ | ~~Add a presence flag, or accept the 404s?~~ **Resolved in Phase A2 under Q-16: the 24 phantom paths were nulled.** The manifest now carries `"referenceScreenshot": "reference.png"` on exactly the **12** packs that hold a local duplicate and `null` on the other **24** — verified on disk, **0 declared-vs-disk mismatches**. The field's meaning is settled: *optional pack-local frozen duplicate*, never "the current visual reference". The current reference for all 36 is the mapped `/reference/` pack, published in `SCREEN_INDEX.md` (2026-08-08). | **No action outstanding** |
| **R7** | README "Files in this pack root" omits 10 root files and both subdirectories | Update the README, or accept it as a point-in-time scaffold record? | — |

---

## 7. Risk notes, and the frozen demo

### 7.1 What would break if the empty manifest were overridden

| If archived | What is lost |
|---|---|
| `reference/` | The 24 live TODOs lose their only candidate source; the 12 frozen references lose their provenance chain; **37 hand-written screen-design `.md` narratives — the design intent for 24 unbuilt screens — exist nowhere else in the workspace**; the 35 HTML fragments carrying exact px dimensions and CSS custom-property tokens exist nowhere else |
| Any `_checkpoint-evidence/` folder | F17 was still being written on 2026-08-07; `CHANGE_LOG.md` 200/301 cite these paths; F16's evidence is itself an index-to-elsewhere, so removing it orphans the pointer |
| Any `AUTONOMOUS_48H_*` doc | Breaks the audit chain of a sprint whose tracker was modified today; C1/C2 cross-cite B |
| The 3 byte-identical checkpoint PNGs | Four checkpoints lose independently-captured evidence that merely happens to be pixel-identical |
| Any `SCREENSHOT_REQUIRED.txt` | Loses the per-screen Figma node ID required for re-export — **AUTH-01's is already lost** |

### 7.2 Frozen demo — located, read-only, untouched

```
C:\Users\enyul\Vibe Studio\B.E.S.T-Coach-Workspace\SDS Project Sprint 2\
```

A separate git repository, clean, pinned by annotated tag `demo-freeze-step14-2026-07-21` → commit `8d4acf4`. It holds its own `reference/` folder (18 files, 9 demo-era screens: `dashboard`, `dashboard_v2`, `login_page`, `class_roster`, `best_assessment`, `review_and_approve`, `approve_confirmation`, `edit_report`, `locked_session`).

A name-and-size comparison against `UI_REFERENCE_FINAL_MVP/reference` shows the two are **completely disjoint — zero overlapping filenames**. They are unrelated generations, so the frozen demo creates no duplication with the final pack.

**The frozen demo is NOT proposed for archival, deduplication, or any change whatsoever.** It is also the home of `AGENTS.md`, `DEMO_BUILD_PLAN.md` and `progress_tracking.md`, which `CLAUDE.md:560` rules are *"migration provenance only and never govern the MVP."*

### 7.3 Legacy material elsewhere — informational, none proposed

| Location | Note |
|---|---|
| `complete mvp screens compiled figma list.txt` (7,932 B, workspace root) | Predates the pack scaffold by ~2 h; likely the input to `SCREEN_INDEX.md`. Intermediate. Outside target scope |
| `BEST_COACH_DEMO_TO_MVP_MIGRATION_TRACKER.md` (409 KB) | Live migration record. Outside target scope |
| `_c4-lifecycle-evidence/`, `_f17-disposable-evidence/`, `_g6-activation-evidence/` | Live sprint evidence ledgers. **Outside every git repository** — see the submission readiness plan |
| `governance-source/` (3 files) | Ruled a **non-authoritative mirror** by Amendment 006 A-055. Outside target scope; do not submit from it |
| `worktrees/backend-48h`, `worktrees/frontend-48h` | Live git worktrees. Outside target scope; untouched |
| `00-PeakPalate-Master.mp4` (58.4 MB, workspace root) | Filename matches no project artefact and a workspace-wide grep for "PeakPalate" returns zero textual references. **Flagged only — not classified, not proposed for any action.** Confirm before treating it as a project deliverable |

---

## 8. Recommended sequence — when cleanup is eventually authorized

1. **Resolve R1 first.** No automated cleanup may run over this directory until the AUTH-01 incident is settled, because a script trusting mtimes would treat the corrupted file as the pack's newest and most authoritative.
2. **Rule R2.** Declaring `reference/` (recommended) converts 111 ambiguous files into authoritative provenance and removes the largest open question in the pack.
3. **Then R3–R7** — the documentation-consistency items, each of which is an edit to a manifest or README, not a move or a delete.
4. **Only then reconsider archival.** On today's evidence there is still nothing to archive; that may change once the sprint formally closes and the 24 deferred references are exported.

---

## 9. Confirmation

**Nothing was moved, renamed, copied, deleted, archived or modified.** No `_archive` directory was created. Every command run against this tree was read-only (`find`, `ls`, `cat`, `head`, `grep`, `diff`, hashing, `wc`). No network call was made. The frozen demo at `SDS Project Sprint 2` was not modified and is not proposed for any change. **The proposed archive manifest is deliberately empty.**

---

*Produced at the Final MVP Submission Readiness Audit, 2026-08-07, against main HEAD `139d753` with a clean working tree.*
