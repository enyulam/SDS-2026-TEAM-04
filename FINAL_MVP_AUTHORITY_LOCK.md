# FINAL MVP AUTHORITY LOCK

**This document is the canonical Final MVP baseline for Phase A2 and Phase B.**
Where any other workspace document disagrees with this file on a Final-MVP-defining question, this file governs — except where a *higher* authority is cited inline (the canonical PDFs, the specification and its ratified amendments, or an explicit operator ruling). This lock records decisions; it does not create requirements of its own.

---

## 1. LOCK METADATA

| Field | Value |
|---|---|
| Lock created | **2026-08-07**, Asia/Singapore |
| Branch | `main` |
| MVP HEAD (full) | `139d7533c126acc6a5162d0fcb889e86e80ed59e` |
| MVP HEAD (short) | `139d753` |
| Git remotes | **0** — nothing has ever been pushed |
| Frozen demo | `SDS Project Sprint 2` @ `8d4acf4abc5039c24da01be773ab1a5e4916080f`, working tree clean |
| Repository state at lock time | **Dirty by design — documentation only.** `git status --porcelain -uall` in the app repo returns **exactly three lines, all `.md`**. ~~Two further edited documents sit at the **workspace root, which is not a git repository at all** — they are therefore not tracked, not staged, and **not reachable by `git restore`**.~~ ✅ **SUPERSEDED 2026-08-08 (§1.1): those documents were moved into the repository and are now tracked, staged and `git restore`-able. This row records the state at lock time and is retained as history.** |

**Accepted validation baseline.**

- **Run C3-C / G-6 — PASS.** All 16 real-provider evidence conditions passed.
- **Run C4 — PASS.** Complete governed Trainer → Management → Parent lifecycle accepted.
- **48-hour physical-test sprint — formally accepted.** No unresolved Critical/High sprint-validation findings.

**Documentation-dirty state.** *(State at lock time. ✅ The "outside any git repository" premise below was ended on 2026-08-08 — see §1.1. Retained as history.)* **Three tracked files** in the app repo carry uncommitted Phase A corrections and are reversible with `git restore`. ~~**Three further documents outside any git repository**~~ **Three further documents** were written or edited: `FINAL_MVP_PHASE_A_GOVERNANCE_RECONCILIATION.md` and this Authority Lock (workspace root), and `UI_REFERENCE_FINAL_MVP/CORE_SCREENSHOT_VALIDATION_REPORT.md` (**not** at the root — inside the UI pack). **None of the three is tracked, staged, or revertible by git.** *(An earlier draft said "two further documents… at the workspace root", which was wrong on both the count and one location.)* No application code, migration, schema, fixture, runtime config or database state is modified anywhere.

| File | Nature of change |
|---|---|
| `SDS Project Final (BEST Coach)/CLAUDE.md` | Phase A: PDPA §3.1 strikethrough (C-1), two §6.1 census annotations (C-2), Step 7F prohibition struck (C-3) |
| `SDS Project Final (BEST Coach)/docs/progress/STATUS.md` | Phase A: CP-3 OPEN→CLOSED ×2 (C-6), CP-4 correction (C-7); this run: current-census block (C-12) |
| `SDS Project Final (BEST Coach)/docs/plan/BEST_Coach_Implementation_Plan.md` | Phase A: "all four UAT scripts" → three, per A-024 (C-8) |
| `UI_REFERENCE_FINAL_MVP/CORE_SCREENSHOT_VALIDATION_REPORT.md` | This run: C-10 research-integrity correction (two edits) |
| `FINAL_MVP_PHASE_A_GOVERNANCE_RECONCILIATION.md` | Untracked working document (workspace root) — *true at lock time; see §1.1* |

### 1.1 ✅ CANONICAL LOCATION — this lock now lives INSIDE the main MVP repository (2026-08-08)

**The repository-boundary normalization of 2026-08-08 folded all ACTIVE Final MVP governance and UI authority into `SDS Project Final (BEST Coach)/`, which is now the canonical execution boundary.** This file, the OD-4 ruling, the Phase A / Phase A2 instruments, the submission readiness plan and the entire `UI_REFERENCE_FINAL_MVP/` estate resolve from the **repository root**. Paths in this document are **repository-relative**.

**The table above and every other dated record in this lock are HISTORICAL SNAPSHOTS and are deliberately left intact** — where one says "(workspace root)", "untracked" or "outside every git repository", it correctly records where that file sat *at the time of writing*. **Those are not current operational paths and must not be followed as such.** The old workspace-root copies were removed once byte-identity and a commit were proven; a workspace-root copy of any of these is not authority.

**Still intentionally outside this repository** (citing their external path remains correct): `FINAL_SUBMISSION_BRIEF/` — the two canonical submission PDFs, **never edited, never moved** (§31.1) · the frozen demo `SDS Project Sprint 2/` · `00-PeakPalate-Master.mp4` (Q-2, `KEEP_IN_PLACE`) · `governance-source/` (A-055 non-authoritative mirror; a hash-assertion target whose path must stay stable) · `BEST_COACH_DEMO_TO_MVP_MIGRATION_TRACKER.md` · `complete mvp screens compiled figma list.txt` (§31.12a — redundantly preserved in `docs/plan/`) · the three `_*-evidence/` trees · all OneDrive and `D:` preservation snapshots.

**Relocation changed no semantics.** Q-27, Q-28, OD-4, the 36 governed packs, the 37 `/reference/` packs and every GC conflict are byte-unchanged apart from the location corrections recorded in `docs/progress/BUILD_NOTES.md`. **The known `/reference/` instruction-layer gaps are NOT repaired by this move and remain open** for the UI Reference Authority Synchronization.

---

## 2. AUTHORITY SOURCES

### 2.1 The two canonical submission PDFs

Both were read **in full** on 2026-08-07 and are sound: text-based, uncorrupted, and the intended documents.

| PDF | Pages | Created | Role |
|---|---|---|---|
| `FINAL_SUBMISSION_BRIEF/Complete_Project_and_Module_Brief.pdf` | **19** | 19 Apr 2026 | Course handout — the **only** source of dates, weightings and rubrics |
| `FINAL_SUBMISSION_BRIEF/Project_Final_Deliverables.pdf` | **6** | **4 Aug 2026** | Final submission checklist — the **operative specification of what to hand in** |

Module: **60.004 Service Design Studio**, Teaching Team **2026**, cohort `SDS-2026`, 7 teams. The institution is **not named in either document** and must not be asserted as quoted fact.

**Precedence between the two PDFs.** The Deliverables PDF is **3.5 months newer** and governs submission content. Where they conflict on *what to submit*, Deliverables wins. Where the Brief is the sole source (all dates, all weightings, all rubrics, testing method), the Brief governs. Neither PDF is edited by this project, ever.

### 2.2 Ratified product and governance authority

- `docs/spec/BEST_Coach_Complete_MVP_Specification_v3.md` — the specification.
- Amendments **001–006** (`docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_00{1..6}.md`), all active.
- `CLAUDE.md` — operating constitution.
- Lifecycle/authorization baselines under `docs/plan/` (Step 7E/7F/7G/7H/7I, assessment write baseline, physical-test slice).
- `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` — the ratified 36-screen inventory.
- `docs/progress/STATUS.md`, `docs/progress/BUILD_NOTES.md` — continuity records.

### 2.3 Explicit operator rulings (2026-08-07)

The operator's rulings issued this run are **the highest authority on the questions they address**, and are recorded verbatim in substance throughout this lock: the **GCP override** (§22), attendance and evidence media (§7, §8), the auth/account model (§5), final UI authority (§28), deployment (§22), foreign-content preservation (§31), usability consent (§26), and the delegation of PA-OD-1 (§19) and PA-OD-9 (§18) to the orchestrator.

**Added 2026-08-08 — the two 48H worktrees are `CLOSED_BY_NONUSE_POLICY`** (§31, item 11). The Operator ruled `worktrees/backend-48h` and `worktrees/frontend-48h` **historical/frozen implementation artefacts**: their stale governance files may not be modified, **neither may be used for any future Final MVP implementation**, and future parallel worktrees are created **fresh from accepted `main` after Phase A2 and after `FINAL_MVP_EXECUTION_PLAN.md` exists**. Phase A2 may inspect them read-only and classify them; removal requires five proofs plus explicit Operator approval and **is not authorized**. Full text: `CLAUDE.md` §14.3a.

**Added 2026-08-07 — `OD-4`, the Final MVP report semantics** (§15.1). The operator ratified **Overview · Strengths · Areas for Development · Remarks** as the canonical report narrative model, superseding Today's Strength / Next Focus / Practice Suggestion / Session Takeaway. The canonical instrument is **`FINAL_MVP_OD4_REPORT_SEMANTICS_RULING.md`** at the **repository root** (~~workspace root~~ — moved 2026-08-08, §1.1), which also carries the read-only implementation inventory and the Phase B migration register.

### 2.4 The two authority ladders — A-045, and they are NOT one ladder

Amendment 005 A-045 (`…Amendment_005.md:44`, `:134-152`) ratifies **two distinct ladders**. Collapsing them is a governance error.

**VISUAL authority** (highest first) — ✅ **RECONCILED 2026-08-08, see §28.1a**: **1. `UI_REFERENCE_FINAL_MVP/reference/<mapped pack>/`** (the ratified current visual source for all 36 governed screens) → **2. the governed pack's optional frozen local `reference.png` duplicate**, held by 12 of 36 and SHA-identical to (1); it never outranks (1), and its **absence is not a missing reference** → **3.** node-specific Figma context, **only where no ratified `/reference/` asset exists** → **4.** existing frontend implementation.

~~**VISUAL authority** (highest first): 1. frozen `reference.png` → 2. node-specific Figma context → 3. existing frontend implementation.~~ ⚠️ **That original A-045 wording predates the promotion of `reference/` to visual rank 1 by operator ruling PA-OD-5/5b (§28.1).** Left as written it ranks a file that **24 of the 36 governed packs do not have** above the ratified frame they all do have. **This lock — not the amendment text — is the instrument that records the reconciliation** (§2.3): `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_005.md` §A-045 is **unedited and still carries the original ladder**, and is **superseded on this point only**. Everything else in A-045 — the two-ladder separation itself, and what a frame is and is not authoritative for — **stands unchanged and is restated below**.

**FUNCTIONAL / SECURITY / PRIVACY authority** (highest first): 1. specification + active amendments → 2. `CLAUDE.md` → 3. lifecycle and authorization baselines → 4. ratified implementation contract → 5. **Figma (lowest)**.

A-045:150 — a frame is authoritative for *"visual layout, visual hierarchy, component composition, visible fields, screen labels, microcopy, page relationships … visual states and responsive behaviour where explicitly shown"* and is **never** authoritative for *"database schema, foreign-key design, RLS, server authorization, report lifecycle, audit behaviour, Auth implementation, AI governance, persistence architecture, state-machine rules or transaction boundaries."*

A-045:152 — *"Where a frame and a ratified rule disagree, the ratified rule wins and the discrepancy is recorded"* — never quietly reconciled.

### 2.5 Active ADRs

ADR-1 … ADR-8 all remain in force. Amendment 003 (`:336`) states precisely: *"ADR-1, ADR-2, ADR-4, ADR-5, ADR-6, ADR-7 and ADR-8 are unchanged. **ADR-3 is narrowed for exactly one read path (A-030)** and otherwise stands."* — **ADR-3 is narrowed, not unchanged**, and A-030 is the clause producing the zero-client-DML posture that §5, §21 and §24 depend on. *(An earlier draft said all eight were unchanged.)*

Load-bearing here: **ADR-2** (modular monolith, *one deployable* — do-not-re-litigate, `CLAUDE.md:63`), **ADR-3 as narrowed by A-030**, **ADR-5** (async deferred), **ADR-6** (Singapore region; synthetic data during prototyping), **ADR-7** (branch-scoped single-tier management), **ADR-8** (no ORM — note ADR-8 originates in **Amendment 002 A-023**, not in spec §16, which stops at ADR-7).

---

## 3. FINAL PRODUCT HIERARCHY

**Centre → Class Grade → Class Module → Class Session.**

Ratified by Amendment 002 A-016. The specification's older single `classes` entity is **not absent — it is superseded by a hierarchy.** Precisely: A-016's supersession row maps *"`classes` → `class_sessions` naming"*, while `class_grades` and `class_modules` are **new hierarchy levels**, not renames of `classes`. Both Amendment 002 and Amendment 005 **forbid treating a `classes` entity as sitting between them**. *(An earlier draft called this a straight rename; the classification "not an absence" was right, the mapping was not.)*

Class Grade labels (Beginner / Intermediate / Advanced) are a **different vocabulary** from the rating vocabulary in §11 and must never be conflated.

A `student` has **no auth identity by design** — `public.students` deliberately carries no `auth_user_id` column, making a student login structurally impossible.

---

## 4. ROLES

Exactly three: **Trainer · Management · Parent.** Enum `public.centre_membership_role`. There is no TA, no admin, no super-admin, and no HQ/corporate tier (ADR-7 rejected the latter explicitly for this MVP). The Teaching Assistant flow is **deferred** (A-014).

Capabilities and prohibitions are specified per role in §13 (Trainer), §14 (Management) and §15 (Parent).

---

## 5. AUTH / ACCOUNT MODEL — *operator-ruled; the MODEL is locked, the mechanism is Phase B*

1. **Supabase Auth provides identity only.** Authorization is RLS + server guards; `CLAUDE.md` — authentication ≠ authorization.
2. **Creating an Auth identity grants NOTHING.** No B.E.S.T membership, no role, no centre. Verified today by **four** proofs — and the fourth is the decisive one:
   - zero triggers on `auth.users`;
   - **all 29 RLS policies are `SELECT`-only** (zero INSERT/UPDATE/DELETE/ALL policies exist anywhere);
   - `authenticated` holds only `SELECT` on 13 tables, with `anon`, `service_role`, `authenticator` and `PUBLIC` holding **zero table privileges**;
   - ⚠️ **and, decisively, the in-function guards.** The RLS and grant posture is **not** what protects a membership-less identity: `authenticated` holds `EXECUTE` on 25 `SECURITY DEFINER` functions, which bypass RLS by construction and are exposed by PostgREST to any identity holding the role — including `assessment_save_complete_and_open_report`, which is `VOLATILE` and writes. Precisely: **19 governed RPCs re-derive account + active membership + relationship before any write and fail closed**; the **other 6 are the Step 7G caller-scoped `STABLE` predicate helpers**, which perform no write and return `false`/`NULL` for a membership-less caller, exposing no oracle. *(An earlier draft claimed all 25 re-derive membership and relationship. That is false for the six helpers — `app_current_account_id()` derives account only, and `app_is_own_membership` deliberately omits the membership-active check because that is its sibling's job. The conclusion holds; the proof as written did not.)*
   
   **Honest limit on the evidence:** Run C3-A exercised **real-role JWTs** — identities that already hold memberships. A sweep of all 25 RPCs by a brand-new, membership-less self-signup identity **has not been executed**. It should be, before hosted go-live.
3. Role resolves at request time by **DB lookup under the caller's own RLS**, never from a JWT claim: `auth.getUser()` → exactly one active `accounts` row → exactly one active `centre_memberships` row. Zero matches and ≥2 matches are both `unauthorized` — *ambiguous identity is no identity*.
4. **Public users must never self-select or self-grant** Management, Trainer, centre membership, class membership, Parent-to-child linkage, arbitrary learner access, or any other privileged relationship.
5. **If a public signup flow exists, it may create only an UNPRIVILEGED or PENDING identity.** Public signup is **not required** for the Final MVP — neither canonical PDF mentions signup, registration, or account creation. Demo/UAT uses pre-provisioned identities.
6. **The `role` query parameter is presentation-only and carries no authority whatsoever** (A-046). Verified correctly implemented.
7. **First Management bootstrap must be operator-controlled and SERVER-ONLY** — narrowly scoped, auditable, fail-closed, idempotent where practical. Never reachable by `authenticated` or `service_role`.
8. Once authorized Management exists, it provisions later users: **Trainer assignment is Management-controlled**; **Parent linkage is Management-controlled or uses a secure invitation/claim mechanism that cannot permit arbitrary learner selection**.
9. **No service-role secret may ever reach a browser.** Verified clean today.
10. **No application table may store a raw token, OTP, password, access token, refresh token, or secret hash** (A-027) — enforced by *the absence of any column capable of holding one*.
11. **Three pre-provisioned demo/UAT identities** — one Management, one Trainer, one Parent — are the ratified demonstration model.
12. **Shared credentials are prohibited** (A-015/A-046). **No plaintext generated password is ever stored, displayed or emailed (A-020).** *(A-020's text names those three; "logged" is this project's own stricter operational rule from the fixture-credential discipline, not part of A-020 — an earlier draft merged them into one citation. Both apply; only the first is A-020.)*

**Known live gaps (Phase B, recorded not fixed):** public signup is currently **enabled** in `supabase/config.toml` with confirmations off — see §30.2; **no Management bootstrap mechanism exists at all** (N-4/CP-5); the entire invitation lifecycle is unbuilt; `supabase/seed.sql` is declared in config but absent.

---

## 6. REPORT LIFECYCLE

**The eight ratified `report_status` values, in order:**

`incomplete` → `observation_saved` → `drafting` → `draft_ready` → `needs_edit` → `trainer_approved` → `approved` → `submitted`

**14 legal transitions.** `approved` is **transient within a transaction and never commits** — RPC-11 performs both updates in one transaction with no exception block and no savepoint. The governed referent of a user-facing "Approved" filter is therefore **`submitted`**.

**Transition authority.**

Trainer assessment → AI draft → Trainer edit/review → **Trainer approval** → Management review → wording-only edit **OR** return for correction → **Management approve/submit** → Parent visibility.

- Every **forward** transition re-proves attendance-present and the scheduled session start, fail-closed.
- Non-forward transitions (draft cancel, reopen) deliberately skip the attendance gate: *mid-cycle absence retains existing work but blocks progression*.
- Every state transition and its audit write **commit in the same transaction** — a standing non-negotiable.
- CAS optimistic locking on `lock_version` guards every governed write.
- **No ninth status may be added**, including any "in management review" convenience state or an `Evidence Pending` value. Both are expressly ratified out.

---

## 7. ATTENDANCE — *operator-ruled: REQUIRED in the Final MVP; A-018 is ACTIVE*

**Rules.**

- Attendance **defaults to `Present`** for every enrolled student on roster initialization.
- The **Trainer** may toggle an individual learner `Present` ↔ `Absent` through the governed application.
- Attendance is a **Trainer-owned assessment fact**.
- An **absent learner receives NO report**; absence must never produce or expose a fabricated assessment or report.
- **Management cannot modify attendance. Parent cannot modify attendance.**
- Lifecycle and report generation must respect absence.
- **Direct API/RPC access must not bypass these rules.**
- Attendance changes must be **auditable**.

**Already satisfied (no work required).** The data model is complete and correct: enum `attendance_status` (`present`/`absent`, no third value); `status … NOT NULL DEFAULT 'present'`; `UNIQUE (class_session_id, student_id)`; composite FKs forcing session↔centre↔module↔enrolment agreement; and `attendance_recorded_by_role_pinned_chk`, which makes a **non-trainer recorder structurally unrepresentable**. Absence-respect is enforced fail-closed on report creation (`BC015`) and assessment save (`BC102`), with a **missing row failing closed** — absence of evidence is not evidence of presence. Management/Parent write-prohibition needs no new work: `authenticated` holds `SELECT` only, and all three attendance policies are `SELECT`.

**The exact remaining gap → §Phase B.** **No write path exists in the application** — no RPC, no server action, no port mutator, no UI control (the roster renders an inert badge, not a disabled control). *(Rows are nonetheless written by fixture and physical-test scripts running as `postgres`; the precise claim is that no **application** path exists.)* `attendance.changed` is registered in the audit registry with **zero emitters**, so the auditability clause is presently vacuous. Roster initialization currently creates Present rows only in fixtures.

**Blocking design question, recorded not invented:** **no Figma frame in the ratified 36 draws an attendance control.** The frame draws state only. Under the **A-013 → A-022.4** disposition discipline, restated inside A-045, this needs an explicit design disposition — the screen-06 pack correctly refused to invent one. *(An earlier draft cited A-041 here; A-041 is the 36-screen inventory and says nothing about dispositions.)* Note also that adding a fourth attendance RLS policy would fail two migration-time assertions pinning `('attendance', 3)`; routing the write through a `SECURITY DEFINER` RPC avoids this and matches project doctrine.

---

## 8. EVIDENCE MEDIA — *operator-ruled: REQUIRED in the Final MVP*

A-014's evidence sub-clause recorded the uploader as **UNRESOLVED** (U-09/U-10/U-11) and forbade any agent from inventing one. **The operator — not an agent — has now named the Trainer**, discharging that prohibition.

**A-001 is ARMED but UNACTIVATED for the parent surface. A-003's and A-004's *permitted* legs are BOTH STOOD DOWN**; their *prohibited/refusal* legs remain fully required.

A-003 is a Phase 2 exit condition expressed as **prohibited vs permitted** paths; A-004 requires Parent UAT to test **both** directions. §8.1 removes the parent surface, so **neither permitted leg has anything to exercise**. Both re-arm with Phase 2. Every refusal case — unauthorized, unrelated-child, pre-`Submitted`, unconsented, unscanned, expired-URL, direct-storage-path, public-access — **remains required and must fail closed**.

*(Two successive drafts got this wrong: the first declared all three "ARMED and binding", inconsistent with §8.1; the second corrected A-004 but left A-003 — structurally identical, and sitting in the same sentence — untouched.)*

**Rules.**

- **Trainer uploads** assessment evidence. Evidence is **Trainer-owned assessment material**.
- Evidence belongs to the relevant **learner / session / assessment**.
- **Governed PRIVATE storage.** Production target is private hosted Supabase Storage. **Publicly readable evidence buckets are prohibited.**
- **Client-side service-role credentials are prohibited.**
- Access is authorized through authenticated **role / centre / session relationships**, via **short-TTL, server-minted signed URLs only**. Direct bucket access, raw storage-path access and public-object access remain prohibited.
- **Management may review** evidence where necessary for governed report review, but **may NOT change it**.
- **Parent does NOT receive internal evidence** — see the ruling below.
- **Evidence must NOT automatically enter the AI drafting prompt.** This is satisfied today (the drafting path has zero evidence surface) and must be actively preserved.
- Deletion/retention must respect authoritative PDPA rules (§20).
- File-format/size/count limits must come from canonical authority. **Do not invent constraints.**

**§19 already ratifies the posture:** *"Storage | Supabase Storage, Singapore | Private buckets; backend-minted signed URLs only."*

### 8.1 RULING — the Parent evidence projection is **OUT** of the Final MVP

The operator's rule is conditional: Parent receives no internal evidence *"unless the canonical PDFs explicitly require a parent-facing evidence projection."* **Both PDFs were read in full. Neither requires — or even mentions — a parent-facing evidence projection, assessment evidence media, or any learner-video capability.** The condition is not met.

*(Stated precisely, because an earlier draft over-reached: the word "evidence" does occur in both PDFs, meaning **research evidence from usability testing**, and "video" occurs in the Deliverables meaning **the 2-minute project video**. Neither sense is assessment evidence media. The trigger condition is unmet on the correct reading, not on a keyword count.)*

This is **consistent with, not contrary to, the amendments** — though the precise status is worth stating accurately. A-001's parent-evidence access is **not merely "permitted"**: `CLAUDE.md:284` records it as *"a **confirmed feature**, not a leak — but only under specific gating"*, and Amendment 001 says *"the feature stands, precisely because it is fully gated."* Its correct status is **conditional and UNRESOLVED under A-014**, not permissive.

What makes the ruling sound is **A-002**, which puts the Phase 1 parent report **text-only** and assigns *"actual parent evidence access… first implemented and tested in Phase 2, never Phase 1."* The operator has not activated Phase 2, and an operator ruling outranks the amendment stack in any case. *(An earlier draft described A-001 as "permits but never mandates", which understated it.)*

**Therefore:** screen 33's "Watch Together" region stays omitted; no media element is rendered on any parent surface. A-001's seven gates remain **armed but unactivated**, and apply in full should evidence ever reach a parent surface.

**The exact remaining gap → §Phase B.** Everything is net-new: zero storage buckets exist (verified live), zero storage policies, zero evidence tables, and the only Storage API reference in the entire repository is a commented-out config line. Four screen packs (08, 10, 19 and — now excluded — 33) describe **class-video evidence** regions; three are rendered deliberately inert, one omitted.

### 8.2 ⚠️ THREE FURTHER UPLOAD SURFACES — different media classes, and one of them is PDPA-live

The ratified visual authority draws **three upload surfaces that are NOT assessment evidence** and that §8 and §21 do not cover. An earlier draft scoped storage entirely to Trainer-owned assessment evidence and planned a single bucket; that is insufficient.

| Surface | Pack | Media class |
|---|---|---|
| **Student photo** | `Management - Register Student.md:12,28` (*"Photo upload area"* / *"Upload a student photo"*) | ⚠️ **identity photograph of a child** |
| **Trainer photo** | `Management - Add Trainer.md:12,27` | staff identity photograph |
| **Lesson slides & materials** | `Management - Lesson Plan Management.md:18,32,40`; `Trainer - Lesson Plan.md:24` | teaching material |

**The student photo is the serious one.** §20.4's load-bearing condition is that PDPA obligations stay dormant *only* while data is synthetic — and the governing rule is *"never use real names, **photos**, or anything resembling actual children."* **A student-photo capture surface is therefore PDPA-live the moment it holds a real image**, and it routes to the `consent_records` instrument that §20.3 records as unbuilt. It is not covered by A-001's evidence gates, which are scoped to assessment evidence.

**Rulings for Phase B:** these are **separate media classes requiring separate buckets and separate policies** — do not fold them into the evidence bucket. `Management - Add Trainer.md:21` supplies a **third** uncanonical format/size source (*"supported image formats and maximum file size"*), compounding the `500MB`/`50MiB` conflict in §21 — none of the three is ratified authority. And per A-022, **do not schema a field from a frame**: screens 20, 21, 24 and 26 carry unratified field inventories (gender, home address, photo, employee ID) that must not be built from the frame alone.

**Preconditions that are rulings, not implementation details:** `scan_status` (A-001 gate 5) has **no ratified vocabulary anywhere**; the `evidence_media` consent scope (gate 2) has **no table** (§20); and the frame's `MP4, MOV · up to 500MB each` conflicts with `config.toml`'s `file_size_limit = "50MiB"`. Adding an evidence audit action requires an amendment — extending the Step 7H registry is a standing stop-and-ask.

**A-038 is NOT a blocker — an earlier draft manufactured one.** A-038's Management row names only report content, notes, ratings, checklists, approvals, AI history and audit rows; **evidence appears in neither of its columns**. And `CLAUDE.md:263` — rank 2 on the functional ladder — still reads that Management reads *"…plus approved completion/evidence/statistics."* **Management review of approved evidence is already inside its read boundary. No reconciliation is required, and no operator ruling is owed on it.**

---

## 9. THE NINE B.E.S.T DIMENSIONS

Recorded exactly:

1. **Body**
2. **Emotion**
3. **Speech**
4. **Tonality**
5. **Eye Contact**
6. **Vocal Projection**
7. **Emotional Expression**
8. **Sentence Flow**
9. **Audience Awareness**

Persisted in `assessment_dimensions` (enum `dimension_code`, grouped by `dimension_group`). Every governed assessment save requires **exactly nine ratings**.

---

## 10. B.E.S.T GLOSS

The four top-level terms are used as: **Body · Emotion · Speech · Tonality**.

**NO ADDITIONAL EXPANDED GLOSS RATIFIED.**

No canonical source defines a fuller acronym expansion. **No prose expansion may be manufactured** to make the letters form a slogan. This does not block the lock and never did — `CLAUDE.md:186` already permits building against the default terms. The two "operator decisions" previously raised on this point were **manufactured and are withdrawn**.

---

## 11. RATING VOCABULARY

**Beginning · Developing · Mastering · Mastered** (enum `competency_rating`; canonical stored values are lowercase — `beginning`/`developing`/`mastering`/`mastered`).

**Mastering and Mastered are both positive progression levels.** Ratified by Amendment 006 **A-051** (*"`Mastering` remains `positive`. This is a ruling…"*); A-049's table column is merely *headed* "Polarity band (A-051)". *(An earlier draft attributed this to A-049.)*

⚠️ **A LIVE DOCUMENTATION DISCREPANCY, RECORDED NOT SILENTLY RECONCILED (A-045:152).** The rename **has landed** — migration `20260806160000_competency_vocabulary_rename.sql` performed it, and the live enum carries the four values above. But **`CLAUDE.md:180` still states the opposite**: *"no database, backend, frontend, fixture, generated type or test has been changed yet… Until V2 lands, the database still stores the old labels — **do not 'fix' a mismatch you find between code and this section without that authorization**."* (restated at `:492`).

That wording actively instructs future agents **not** to correct the mismatch. **The database is right; `CLAUDE.md:180` is stale.** It was not corrected in this run because doing so touches the same V2/A-053 authorization chain that §19 ratifies, and the correction belongs with that chain rather than as a drive-by edit. **Phase B must reconcile it.** Until then, this section is authoritative over `CLAUDE.md:180`.

*(An earlier draft added "restated at `:492`". That is a **different** statement — `:492` concerns fixture files still carrying superseded values — and the quoted sentence occurs exactly once, at `:180`. Since this section declares itself authoritative over the cited line, the false second citation mattered.)*

⚠️ **Never confuse these with Class Grade labels** — *Beginner · Intermediate · Advanced* — which describe a class cohort, not a competency. Bare-word rating regex detection is expressly prohibited (A-052); leak detection must be contextual.

---

## 12. AI AUTHORITY

The AI **drafts only**. It does **not** rate, **not** approve, **not** submit, **not** publish.

- **Structured-output validation** — provider-side JSON-schema (`strict: true`) *plus* independent deterministic re-validation of shape, key count, non-emptiness and length, applied regardless of provider.
- **Grounding validation** — deterministic, closed lexicons, no model consulted. A false verdict produces a generation failure and **never reaches the store**.
- **Fail-closed** — network, timeout, non-OK, unparseable and ungrounded outcomes all refuse. Failure leaves **no false `draft_ready`**; the flow cancels the draft rather than stranding a report.
- **R-27** — `report_store_draft` holds **zero client EXECUTE, permanently**. Verified live: `proacl = {postgres=X/postgres}`. This is the grounding-bypass prevention control. No later checkpoint may grant it without reopening R-27.
- The provider is called **only from server code**, never from the client. Error objects are never surfaced (they could embed request headers).
- Nine ratings and all assessment facts are **Trainer-authored**; the AI never originates them.

**Canonical brief alignment:** the AI feature is *required* by both PDFs and must *"solve a real user problem, be integrated into the main user flow, and improve the user experience or decision-making"*, and must be **functional in the deployed version** — not only locally.

⚠️ **OD-4 (§15.1) changes the AI's OUTPUT SEMANTICS and nothing else in this section.** The Final MVP drafting contract must generate the four canonical outputs **directly** — `overview` · `strengths` · `areas_for_development` · `remarks` — and must **not** generate the four superseded concepts internally and relabel them at the UI; a relabelling shim is expressly prohibited. All four outputs remain schema-validated, grounded in governed Trainer assessment facts, fail-closed, Trainer-editable, Management wording-editable, canonically persisted and read-only-projected to the Parent after submission. **Every other clause above is unchanged**: the AI still drafts only, R-27 still holds `report_store_draft` at zero client EXECUTE permanently, and the nine ratings and all assessment facts remain Trainer-authored. ⚠️ **The grounding pipeline is not a rename**: rule 4 is hard-keyed to the old single-positive-panel model and must be **re-derived**, because `Overview` may legitimately carry developmental context and `Areas for Development` is expected to name non-positive dimensions — see `FINAL_MVP_OD4_REPORT_SEMANTICS_RULING.md` §5.2.

---

## 13. TRAINER AUTHORITY

The Trainer owns the assessment facts:

- **Attendance** (§7) — Present/Absent toggle.
- **Observations** — chips, observation notes, follow-up notes, term-evidence notes.
- **Ratings** — all nine dimensions.
- **Trainer notes.**
- **Evidence** (§8) — upload and ownership.
- **Report review and edit** at `draft_ready`/`needs_edit`.
- **Trainer approval** — the transition to `trainer_approved`.

Every one of these is re-proved server-side against a live active trainer membership plus a live assignment path to the session. UI hiding is never the boundary.

---

## 14. MANAGEMENT AUTHORITY

Management is the **publisher**, with a deliberately narrow editorial right:

- **Review** submitted-for-review reports for its own centre (ADR-7: exactly one centre per management account).
- **Wording-only report changes** — the four parent-facing prose panels **only**. ***(Since OD-4, those four are **Overview · Strengths · Areas for Development · Remarks** — §15.1. The allow-list's **arity is unchanged at exactly four**; OD-4 renames and re-means the panels and **neither widens nor narrows** the allow-list. The ratified "columns not quantity" trade (§19 / A-004:119) stands, and changing the arity remains a stop-and-ask.)***
- **Return for correction** — with an issue scope and reason.
- **Approve and submit.**
- **Review evidence** where necessary for governed report review (§8) — *review only*.

**Management CANNOT modify:** ratings · attendance · observations · Trainer notes · evidence · any assessment fact.

Writes outside the four wording fields are **rejected server-side**, not merely hidden. Management holds no draft state and no "Save as draft" — that would require a ninth status (§6).

⚠️ Four `reference` packs describe a broader management right (*"only Management may edit the published report"*) and a "Save as draft" control. On the **functional ladder** the ratified rule wins and the pack loses. See §28.2.

---

## 15. PARENT PROJECTION

The Parent receives the **submitted canonical narrative only**, read-only:

- The four prose panels — **Overview · Strengths · Areas for Development · Remarks** — from the canonical submitted version. ***(Updated 2026-08-07 by operator ruling **OD-4**. This previously read "Today's Strength, Next Focus, Practice Suggestion, Session Takeaway"; that model is **SUPERSEDED_BY_OD-4_FINAL_REPORT_MODEL**. See §15.1 and `FINAL_MVP_OD4_REPORT_SEMANTICS_RULING.md`. The implementation still carries the old column and field names — that is a registered Phase B migration, not a contradiction of this line.)***
- **No preapproval versions, no drafts, no AI draft history.**
- **No internal trainer notes.**
- **No internal evidence** (§8.1 — ruled out of the Final MVP).
- **No per-dimension rating grid, in any form or wording** — this is a *caught leak* and is prohibited absolutely. The "simplified performance summary" requirement is satisfied by the prose panels; a second panel restating per-dimension ratings, **even with softened wording, recreates the same leak**. ⚠️ **EXTENDED 2026-08-08 by operator ruling Q-27 (§15.2): this is no longer only a report-surface rule and no longer only a UI rule.** The nine dimension ratings must be excluded from **every** Parent surface — Dashboard included — and from **Parent-facing DTOs, projections, RPC results, server actions and client payloads**. **CSS hiding is not exclusion.**
- **No Management or Trainer controls.**
- Parent reads are gated on a live `parent_student_links` row and a report that has actually reached `submitted`.

⚠️ **This is the most dangerous conflict in the corpus.** Four `reference` packs — now the ratified *visual* authority — describe parent-side rating exposure. **They are not all the same defect, and the distinction matters for remediation:**

| Pack | Line | What it describes | Kind |
|---|---|---|---|
| `Parent - Dashboard.md` | **`:5`**, `:11`, `:19` | **`:5` — the screen-purpose line itself: *"Gives a Parent an overview of the selected Student's **current B.E.S.T. Ratings**…"*** *(added 2026-08-08 under Q-27; an earlier draft registered only `:11`/`:19`, so a remediation pass driven from this table would not have seen the purpose line)* · plus the **"This Term's Skills"** card — ratings for body, eye contact, emotion, speech, tonality, vocal projection, emotional expression, sentence flow, audience awareness — **all nine dimensions**, with rating bars | **per-dimension grid — the exact caught leak.** ✅ **CLOSED BY OPERATOR RULING Q-27, 2026-08-08 (§15.2): the COMPLETE card is `DO_NOT_IMPLEMENT`** — title, labels, bars, rating-derived state and any replacement visualization. Profile Details promotes upward. **Visual acceptance treats its absence as EXPECTED/REQUIRED.** |
| `Parent - Class Report.md` | `:21` | a "Performance Summary" of **four** dimensions | **per-dimension grid — the exact caught leak** |
| `Parent - Calendar.md` | `:6`, `:16`, `:22` | a B.E.S.T Rating **colour legend** | per-dimension grid **in another encoding** |
| `Parent - Calendar.md` | **`:13`** | progress card with *"B.E.S.T. Rating, **observation**, and skill tags"* | **worst single line** — a rating **plus a trainer observation** on a parent surface, which also breaches the no-internal-notes rule |
| `Parent - Calendar.md` | **`:23`** | *"The selected-day card displays **a trainer observation** and the assessed skills for that date"* | **second observation leak** — same breach as `:13`, on the same surface, and a remediation pass working only from `:13` would leave it standing |
| `Parent - Calendar.md` | `:24` | *"the number of **mastered days**"* | rating-vocabulary aggregate on a parent surface |
| **`Parent - Dashboard.md`** | **`:20`** | *"Profile Details displays **date of birth**, Parent, contact, Class, assigned Trainer, **Trainer Assistant (TA)**, and enrolment date"* | ⚠️ **two separate defects, both missed by every prior pass**: a child's **date of birth and contact details** on a parent surface, against §15's four-prose-panels-only rule; and a **"Trainer Assistant (TA)"** field, when §4 records there is no TA role and the TA flow is **deferred under A-014** |
| `Parent - Report.md` | `:6`, `:13`, `:21` | **one overall rating per report row** | **a different defect** — aggregate exposure, not a per-dimension grid |

**All lose on the functional/privacy ladder.** *(An earlier draft classed the `Parent - Report.md` rows under "the per-dimension rating leak"; they are a single overall rating and are wrong in kind, not in degree. It also missed `Parent - Calendar.md:13`, which is the most serious line of the set.)*

**Two management packs carry the identical four-dimension Performance Summary** — `Management - Student Report.md:24` and `Management - Term Report.md:24`. On a management surface that is not a parent leak, but it is recorded here so the pattern is not mistaken for parent-only.

**Severity correction on the Calendar legend.** An earlier draft called `:6/:16/:22` merely *"a B.E.S.T Rating colour legend"*. The screen reconciliation plan rates it **GC-2 — the most severe conflict in its set** — because it publishes **the entire competency taxonomy** to a parent, engaging **A-052 (taxonomy disclosure)**. Recorded at that severity here.

Also noted for Phase A2: `reference/Parent - Report/Parent - Report.md:1` carries the **wrong H1** — `# Auth 03 - Parent - Reports` — in a document now ratified as visual authority. A metadata defect, not a governance one.

### 15.1 ✅ **OD-4 — RATIFIED BY OPERATOR, 2026-08-07.** The four canonical report panels

**This decision is CLOSED.** The operator ruled it on 2026-08-07, inside the time-box, while `report_versions` was still empty. The canonical instrument is **`FINAL_MVP_OD4_REPORT_SEMANTICS_RULING.md`** (**repository root** since the 2026-08-08 boundary normalization; ~~workspace root~~); this section records the ruling and its consequences for the lock.

**The four canonical Final MVP report narrative panels are:**

| Panel | Canonical meaning |
|---|---|
| **Overview** | A general narrative summary of the learner's performance/session. **May** synthesize strengths, overall performance and developmental context; **not restricted to positive observations.** |
| **Strengths** | Positive demonstrated capabilities, behaviours, progress or performance, supported by the Trainer's governed assessment facts. |
| **Areas for Development** | Specific capabilities, behaviours or performance areas that would benefit from continued development/support. |
| **Remarks** | Additional relevant report commentary that does not belong in the other three. **Not** an unrestricted place for unsupported claims — grounding and governance apply in full. |

**Today's Strength · Next Focus · Practice Suggestion · Session Takeaway are SUPERSEDED_BY_OD-4_FINAL_REPORT_MODEL.** This is a **semantic-model change, not a cosmetic relabel**: the old concepts are not preserved as the canonical model merely because they are what is currently implemented.

**One canonical model across all three roles.** Trainer sees and edits these four; Management reviews the same four and remains **wording-only**, unable to change ratings, attendance, observations, Trainer notes, evidence or any assessment fact; Parent receives the same four from the final submitted canonical report, **read-only**. Role differences concern **authority and lifecycle state, not panel semantics.**

**The prior objection is discharged, not overridden.** This lock and G-10 both declined the frame headings because *"Overview" and "Remarks" have no governed counterpart, so adopting them would silently redefine what each stored field means.* That was correct. The operator has now **defined the four concepts explicitly** rather than renaming four fields, and G-10's own reasoning said adopting the frame *"would be an amendment, not an adjudication"* — **an explicit operator ruling is the instrument that discharges that** (§2.3), and it has been issued. Nothing is silent: the meanings are written and the storage migration is registered.

⚠️ **A conflict inside the ratified visual authority, resolved by the ruling and recorded here for the first time.** The `reference` tree is **internally inconsistent** on the third label: `Parent - Class Report.md:11` and `Trainer - Student Report.md:12` read **Areas for Development**, while `Management - Student Report.md:11`, `Trainer - AI Report Generation.md:14` and `Management - Term Report.md:11` read *Areas to Grow*. **The ratified label is `Areas for Development`.** The screen reconciliation plan at `:396` stated the minority variant and has been corrected.

**Implementation status — this ruling authorizes nothing.** The database, RPCs, types, prompt, grounding, fixtures, UI and tests all still carry the superseded names. That is a **registered Phase B migration** (`FINAL_MVP_OD4_REPORT_SEMANTICS_RULING.md` §4–§5), not a contradiction of this section. Two items there are **genuine open Phase B rulings**: the content-hash envelope version (the panel names are literal bytes inside both SHA-256 preimages, and `content_hash_version` is pinned by `CHECK (= 1)`), and the re-derivation of grounding rule 4, which is hard-keyed to the old single-positive-panel model and would **false-reject** correctly-grounded drafts if simply retargeted at `overview`.

**`report_versions` is empty** — corroborated by the Run C1 fixture-reload verification (`STATUS.md`: *"`report_versions` 0, `report_version_ratings` 0"*). **This is the preferred point to migrate, before real report data exists. It does NOT reduce the regression-verification obligation** (§27 and the ruling's §8).

⚠️ **A FAIL-OPEN HAZARD, found by the OD-4 propagation's adversarial review and recorded here because it is a governance control, not a test detail.** **Five hard-coded deny-lists** name the four superseded columns for the sole purpose of **proving report content does not leak** and that a committed version is not mutated: `static-scan.mjs:209` (T7I-18) · `static-scan.mjs:385` (T7I-R22) · `management_submitted_list.sql:353` and its `pg_proc.prosrc` regex at `:490` · `report_context_resolver.sql:305` · `management_correction_tracking.sql:413`. **A renamed column with a stale deny-list leaves every one of these assertions passing green while detecting nothing** — an `UPDATE public.report_versions SET overview = …` would pass T7I-18 outright. This project has already been bitten by precisely this failure mode once, at the A-053 rename (`STATUS.md`, Backend V2: `POLARITY_BANDS[rating]` became `undefined` and the polarity rule was **silently skipped** while the suite reported green). **Each of the five must be re-derived and demonstrated FIRING**, and the OD-4 migration's own end-of-migration assertions must not copy a stale list forward.

**Affects screens 08, 10, 19** (and 33's omitted region), plus the AI contract, storage, RPCs, both hash serializers, all three role UIs, and the C3/G-6 and C4 harnesses.

⚠️ **Do not confuse `OD-4` with `PA-OD-4`.** They are unrelated: **OD-4 is this panel-semantics ruling and is now CLOSED — RATIFIED**; **PA-OD-4** was the B.E.S.T acronym gloss, **withdrawn as manufactured** (§10).

See §28.2.

### 15.2 ✅ **Q-27 — RATIFIED BY OPERATOR, 2026-08-08.** Parent Dashboard: the nine-dimension rating card is DO_NOT_IMPLEMENT

**This is an intentional Final MVP GOVERNANCE OVERRIDE of a specific element of the ratified Parent Dashboard visual reference. It is not a temporary implementation omission, and it is not a request to edit Figma.**

**The element.** `reference/Parent - Dashboard/Parent - Dashboard.md:11` and `:19` describe a card titled **"This Term's Skills"** displaying the learner's **nine B.E.S.T. dimensions** — Body · Eye Contact · Emotion · Speech · Tonality · Vocal Projection · Emotional Expression · Sentence Flow · Audience Awareness — **with performance/rating bars**. The frame draws it as a nine-row bar chart. This is the same element already registered as **GC-3** in `UI_REFERENCE_FINAL_MVP/FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md` §5.

**Q-27 does not replace GC-3 — it supersedes it in scope and raises it from a conflict finding to a positive operator ruling.** GC-3 said *do not build the bar chart*. **Q-27 rules that the COMPLETE CARD is absent from the Final MVP Parent Dashboard**, including:

- its **title**;
- **all nine dimension labels**;
- **all progress/rating bars**;
- **all rating-derived visual state**;
- **any equivalent replacement visualization** of those nine ratings.

**Partial compliance is non-compliance.** It is **not** sufficient to hide the labels, obscure the values, render empty bars, collapse the values while retaining the container, rename the card, or substitute another ratings visualization. **The entire card is absent.**

**What remains authoritative.** The rest of the Parent Dashboard reference stands, subject to existing governance: page title and subtitle, Parent sidebar/navigation, selected-child selector, Parent identity/header controls, **Profile Details**, calendar, upcoming events, the surrounding shell, spacing/style/components, and other already-ratified interactions. *(Note: `Parent - Dashboard.md:20`'s Profile Details field list carries its own two pre-existing defects — child date of birth and contact details on a parent surface, and a "Trainer Assistant (TA)" field against §4 and A-014. **Q-27 does not resolve those**; they remain recorded in §15's table above and are unaffected either way by this ruling.)*

**Layout consequence — mandatory, not incidental.** When the card is omitted, **Profile Details promotes upward into the vacated main-column space** under the existing layout system. **Do not leave an intentional blank rectangle** where the card used to be, and **do not invent a replacement card solely to fill the space.** The right-hand Calendar / Upcoming structure is unchanged. The screen must remain visually coherent with the authoritative reference.

#### The Parent data boundary — this ruling is not merely visual

**Parent users must not receive the nine-dimension assessment ratings through the Parent experience at all.** The Final MVP implementation must exclude them from:

- Parent Dashboard UI · Parent Reports UI · **any** Parent-visible page state;
- **Parent-facing DTOs and projections**;
- **Parent-facing RPC results**;
- **Parent-facing APIs and server actions**;
- **any client payload reachable by a Parent session**.

**Fetching the ratings into the Parent client and hiding them with CSS is a violation, not a compliance path.** This is the same principle §15 already applies to the content hash and `CLAUDE.md` §6 already applies to the Parent Feedback Report: **the exclusion happens at the governed projection/data layer.** *(`hiding an Edit button is not authorization` — `CLAUDE.md` §6. Hiding a rating bar is not exclusion.)*

#### What Q-27 does NOT change

- **Trainer and Management rating AUTHORITY is unchanged — neither widened nor narrowed.** §9, §11, §13 and §14 are untouched, and that expressly **includes A-038's standing bar on Management reading raw per-dimension assessment data**, and GC-5/GC-6, which remain live conflicts. **Q-27 grants Management nothing.** Read precisely: the Trainer continues to author the nine ratings under §13; Management's authority over them remains exactly what A-034/A-038 already allow and no more. This ruling concerns **Parent visibility only** — it is **not** a general prohibition on ratings, and it must not be quoted in either direction as a change to the Trainer or Management boundary.
- **OD-4 is unchanged.** The Parent continues to receive the submitted canonical narrative — **Overview · Strengths · Areas for Development · Remarks** (§15.1) — under existing governance. Q-27 modifies **no** panel, meaning or lifecycle.
- **Untouched:** Trainer assessment ratings, attendance, observations, evidence, Trainer notes, Management review authority, the report lifecycle, and AI authority.

#### Reference authority and the deviation record

**No authoritative visual bytes were altered to record this ruling** — not the Parent Dashboard PNG, not the Figma source, not the HTML render, not the historical Figma provenance. `reference/Parent - Dashboard/` remains VISUAL rank 1 for the remainder of the screen (§28.2). **Q-27 changes what is built, never what the reference says.**

**Visual acceptance treats the absence of this card as `EXPECTED / REQUIRED`** — **never** as `MISSING IMPLEMENTATION` and **never** as a `VISUAL REGRESSION`. A future reviewer comparing the implementation to the frame will find the card missing; that finding is **correct and closed by this section.**

#### Carried forward to `FINAL_MVP_EXECUTION_PLAN.md` (not yet created)

When the Execution Plan is written it **MUST** carry an explicit Parent Dashboard acceptance criterion equivalent to:

1. match the authoritative Parent Dashboard reference **except** for the operator-ratified omission of the complete "This Term's Skills" nine-dimension ratings card;
2. **promote Profile Details upward** into the vacated space;
3. expose **no replacement rating visualization**;
4. **verify Parent-facing data projections contain no nine-dimension ratings** — proved at the projection/RPC layer, not by inspecting the DOM;
5. **verify Trainer/Management rating behaviour remains unaffected.**

---

## 16. LOCAL SUPABASE BASELINE — what is already validated

Supabase is **actively used and is not mocked or disabled**. The development environment is the full local Docker stack: real Postgres 17, real GoTrue Auth, real PostgREST, real Storage, real Kong, real Studio, real migrations, real RLS, real SECURITY DEFINER RPCs, real password authentication, real audit-chain behaviour.

**Validated locally:**

- **12 migrations applied**, fresh-apply equivalence independently proven on disposable stacks.
- **29 RLS policies**, all `SELECT`, deny-by-default.
- **34 SECURITY DEFINER / INVOKER functions** with pinned empty `search_path`, owner `postgres`.
- **R-27 holds in the running database**, not merely in comments.
- **SHA-256 hash-chained append-only audit** (`BESTCOACH-AUDIT-V1`, per-centre domain-separated genesis), with `audit_verify_chain` reporting ok/complete/head-checked.
- **Real password authentication** through the real `signInWithPassword` path with three real Auth identities and real memberships.
- **Run C4** — the complete governed Trainer → Management → Parent lifecycle, browser-driven against the real adapter.
- **Run C3-C / G-6** — 16/16 real-provider conditions, including grounded drafts stored through the governed transition.
- **Run C3-A bypass suite** — direct PostgREST/RPC attempts from real role JWTs refused **at the database**.

**This is a local baseline. Nothing hosted has ever been contacted, provisioned or validated.**

---

## 17. HOSTED SUPABASE TARGET — production requirements

No hosted Supabase project is linked or in use. `supabase/.temp/project-ref` is absent; CLI operations have remained local-only; no migration or fixture has been applied to a hosted project.

Required for production:

1. **Provision the hosted project** in the **Singapore** region (§23), verified explicitly at creation — never assumed, never left at a wizard default.
2. **Apply the 12 migrations** to hosted.
3. **Verify RLS** — all 29 policies present and denying by default.
4. **Verify RPCs** — the full function baseline (§19), grants and revokes intact, R-27 preserved.
5. **Private Storage** — create the evidence bucket with `public = false`; author `storage.objects` policies (currently **zero exist**); verify no public URL resolves.
6. **Production Auth configuration** — disable or hook-gate public signup; enable email confirmations **before** any invitation/claim flow is designed; raise password minimum length and set complexity; set real `site_url` and exact-match redirect URLs (and fix the current `http`/`https` mismatch).
7. **Management bootstrap** (§5.7) — the single hardest blocker; without it a fresh hosted database is permanently unusable, because a centre with no active management membership can publish no report.
8. **Production role/account provisioning** — the three demo/UAT identities, then the governed invitation lifecycle.
9. **Replace local/docker-only runtime mechanisms** — principally the draft-storage transport (§18).
10. **Production-safe AI draft persistence** (§18).
11. **Secrets and environment configuration** (§24).
12. **Separate Supabase projects for staging and production** — never one project shared across environments.
13. **Production lifecycle UAT**, authorization/security regression, and public-URL verification.
14. **Load no real student/parent data** until the PDPA mechanisms in §20 are confirmed working in production.

---

## 18. HOSTED DRAFT-STORAGE TRANSPORT — **PA-OD-9 RATIFIED**

The operator delegated this decision to the orchestrator where the evidence identifies one clearly superior approach. **It does. Ratified below.**

### 18.1 The problem

`server/modules/ai-drafting/trusted-store.ts` reaches `report_store_draft` by `spawn("docker", …)` into a **hardcoded container name**, executing as `postgres` over container-local trust. This cannot work on hosted Supabase behind Vercel. Worse, `LocalTrustedDraftStore` is constructed by shipped `"use server"` application code, so a deployed build **fails at runtime with no build-time or type-level signal**.

### 18.2 RATIFIED — a postgres-owned definer channel reached by a dedicated minimally-privileged login role

**The decisive structural fact: the currently-accepted, G-6-passing transport already *is* a direct `postgres`-role Postgres session.** `docker exec … psql --username=postgres` and a Supavisor TLS connection differ **only in how the credential is supplied**. The SQL, the identity mechanism (`request.jwt.claims` → `auth.uid()`), the in-function authority re-derivation and the audit chain are unchanged.

**R-27 itself specifies the shape of the replacement.** `…7i_report_lifecycle.sql:1003-1005`, verbatim:

> *"The later AI checkpoint owns the trusted generation-completion channel that invokes it: **a postgres-owned SECURITY DEFINER caller whose grounding obligation that checkpoint carries.**"*

**The ratified shape follows that sentence exactly:**

1. A new **postgres-owned `SECURITY DEFINER` wrapper** (`SET search_path = ''`) is the trusted channel. It takes the subject and the four panels, sets `request.jwt.claims` **transaction-locally**, and calls `report_store_draft`. **The checkpoint that builds it carries the grounding obligation.**
   ⚠️ **1a. The wrapper MUST VERIFY the subject, not trust it.** `report_store_draft` derives everything else from the report row — **the subject is the only free variable**, and that is the whole of §18.2a's residual. The wrapper must therefore resolve the report's *own* legitimate trainer (via `reports.class_session_id` → `class_session_assignments`, or `reports.observation_id` → its recorder) and **refuse unless the supplied `sub` matches**. This costs **nothing on any of the eight priorities**: no schema object, no signing secret, no second deployable, no client grant. It **collapses the residual from "as any trainer in any centre" to "as the one trainer who already owns that report."** *(Added after review — an earlier draft considered only wholesale alternatives and missed this narrowing entirely.)*
2. A dedicated `LOGIN` role — e.g. `bc_draft_channel` — **`NOBYPASSRLS`, no table privileges of any kind**, holding `EXECUTE` on **the wrapper only**.
3. The role is **explicitly NOT granted to `authenticator`** and **never made a member of `authenticated`**, so PostgREST can never assume it and no browser can reach it.
4. The Vercel **Node** runtime connects with this role via the Supabase pooler in **transaction mode**. `export const runtime = "nodejs"`; `maxDuration` covering the 60 s provider timeout.

**⚠️ `report_store_draft` IS NEVER GRANTED TO ANYTHING.** Its ACL remains literally `{postgres=X/postgres}`.

This matters because R-27's prohibition is **unqualified**: *"NO LATER CHECKPOINT MAY GRANT EXECUTE ON THIS FUNCTION without reopening R-27 and `CLAUDE.md` section 4"* (`…7i_report_lifecycle.sql:1010-1011`). There is no grantee exception — and **at `:3026-3029` of the same migration** the authors write an explicitly *conditional* grant permission for `app_parent_reaches_student` (*"A later checkpoint MAY grant it — but only TOGETHER WITH the policy or client consumer that needs it"*), proving they knew how to scope one and chose not to here. *(An earlier draft said "eleven lines below"; the correct locator is ~2,020 lines below. The argument is unaffected; the locator was wrong.)* **An earlier draft of this lock claimed R-27 permits a grant to a "non-client" role. It does not, and that draft was corrected.** By granting only on the wrapper, the prohibition is never triggered and no reopening is required.

**What genuinely improves:** fail-closed behaviour (real driver SQLSTATEs replace regex-scraping stderr and an ignored child exit code); transaction integrity (a real `BEGIN … COMMIT` with transaction-local `set_config` beats today's session-scoped GUC plus `DO` block); auditability is bit-identical.

### 18.2a ⚠️ THE RESIDUAL RISK, STATED PLAINLY

**Object privilege narrows; exposure widens. Both are true and the second was under-priced in an earlier draft.**

- `docker exec` into a container-local socket is reachable **only from the host process**. A pooler login role is reachable **from the public internet by anyone holding the connection string**.
- The channel sets the subject from the server's own `auth.getUser()` result, so **whoever holds the credential chooses the subject** — unless the wrapper verifies it, which §18.2.1a now requires.
- **The capability, stated precisely.** An earlier draft wrote *"store report content into any report in any centre, as any trainer"*, which over-alarmed. `report_store_draft`'s own guards bound it hard: the report must be **`status = 'drafting'`** (BC004), `lock_version` must match (BC003), the observation's `lock_version` must match (BC019), **exactly nine ratings must exist** (BC018), **attendance must be `present`** (BC015), the session start must have passed (BC017), content must be non-degenerate (BC020), and **no version may already exist** (BC024 — so **once only, per report**). The honest statement is: *"store **the first** draft version into a report **currently in `drafting`**, impersonating a trainer who legitimately reaches it"* — and with §18.2.1a, only the trainer who **already owns that report**.
- Consequently **possession of the channel credential remains a grounding bypass** within those bounds, because grounding runs in TypeScript upstream of the channel. Precision matters here because §18.5's Gate G-AI is written against this text.

**This is not a regression introduced by this decision.** The same property holds today: anyone with host access to the container can call `report_store_draft` as `postgres` with arbitrary text and an arbitrary subject. Grounding has always been unbypassable *by client roles*, never *by anyone*. What changes is the reachability of the credential, and that is the honest cost of deploying at all.

**Therefore the channel connection string is a §24 secret of the highest class** — server-only, never `NEXT_PUBLIC_`, rotatable, and never present in any client bundle or log.

**The permanent fix is out of scope for the Final MVP and is recorded as the named mitigation path:** move grounding into the database, or require a grounding proof the wrapper verifies, so that the credential alone is insufficient. Either would make grounding unbypassable *by anyone*. Both were considered and rejected for this MVP (§18.3); the trade is recorded here rather than hidden.

### 18.3 Options considered and rejected — with the reason

**The decision priority order, stated so the reasoning below is checkable** (operator-supplied, in rank order):

1. preserve accepted governance · 2. preserve fail-closed behaviour · 3. preserve auditability · 4. preserve transaction integrity · 5. keep privileged secrets server-only · 6. work naturally with hosted Supabase + Vercel · 7. minimise reopening C3/C4 controls · 8. minimise unnecessary architecture complexity.

**Under a different priority order the answer changes**, and that is worth stating: if secret-exposure minimisation were ranked first, the Edge Function option would win. It is ranked fifth.

| Option | Rejected because |
|---|---|
| **Definer-chain wrapper granted to `authenticated`** | A **client-callable** wrapper taking four arbitrary text fields **is materially the surface R-27 exists to close**. Fails priority 1. ⚠️ *Correction: an earlier draft claimed `FINAL_MVP_SUBMISSION_READINESS_PLAN.md:202` proposed this and was superseded. **It did not, and it is not.** That line reads: "Must preserve R-27 — **do not grant client EXECUTE on `report_store_draft`**. A dedicated definer chain is the indicated shape." It proposes a definer chain **while forbidding a client grant** — which is exactly §18.2's ratified design. `:202` is **CONFIRMED, not superseded**; only the grant-to-`authenticated` variant is rejected.* |
| **Grounding-proof token** | Replaces a privilege guarantee with a cryptographic one; introduces a signing secret plus replay/TTL correctness as governance-critical controls. A subtle bug is a silent grounding bypass with no privilege signal. Also adds a schema object beyond the ratified inventory. |
| **Service-role client calling the RPC** | Requires granting EXECUTE to `service_role`, violating R-27 and the standing rule *"NOTHING IS GRANTED TO service_role, EVER"* — sourced at `STEP_7I_REPORT_LIFECYCLE_BASELINE.md:338` and the migration comment at `…7i:3182` (**functional rank 3**, not `CLAUDE.md`, where an earlier draft implied it lives). Would fail assertion **B8** outright. `service_role` is `BYPASSRLS`. Worst available combination. ⚠️ **Note a rank-2 tension Phase B must resolve:** `CLAUDE.md:163` reads *"State transitions, approvals, and evidence-URL minting happen only in server code **with the service role**"* — which A-030 narrows to *"server-only, limited to concrete Auth-admin or system operations"*. §5.7's bootstrap rule (*"never reachable by `authenticated` or `service_role`"*) will meet this clause head-on. |
| **Grounding moved into the database** | Structurally strongest, but grants a client-callable grounding+store RPC — trips R-27 explicitly — and requires porting A-052 contextual detection to SQL, creating two grounding implementations that can silently drift. |
| **Supabase Edge Function holding the privilege** | The only option keeping the DB credential entirely out of Vercel config, and **genuinely the best on secret exposure** — which §18.2a now identifies as the real residual risk. **Rejected on priority 1 over priority 5**, because it adds a second deployable with its own authentication boundary, against ADR-2's *"one deployable"* (marked do-not-re-litigate at `CLAUDE.md:63`). ⚠️ **Honest caveat:** ADR-2's subject is the *application's internal shape* — *"Modular-monolith discipline is preserved by isolating domain logic in a server-only layer"* — and ADR-1 already adopts Supabase *"as one platform"*. Whether a platform-native function counts as "a second deployable" is a **judgement, not an ADR-2 holding**. **If the operator weights secret exposure above governance preservation, this ruling should be revisited — it is the one option that would survive that reweighting.** Recorded explicitly so it is visible as priced, not overlooked. |
| **Do not deploy the AI draft step** | The honest zero-risk baseline. Rejected: both canonical PDFs **require a functional AI feature in the deployed version**. |

### 18.4 A correction to the PA-OD-9 record

The recorded option table priced the direct-connection family as *"Introduces a superuser credential."* **This is factually wrong.** Verified live: `postgres | rolsuper=false | rolbypassrls=true`. On Supabase, `postgres` is a **non-superuser, BYPASSRLS, object-owning role**. The mispricing biased the record against the option the evidence favours, and the ratified narrow-role variant reduces the blast radius far below even that.

### 18.5 Binding conditions on implementation

- **Gate G-AI, reworded to what is actually achievable:** a draft must store on hosted through the replacement channel with **`report_store_draft`'s ACL still literally `{postgres=X/postgres}`** and **grounding unbypassable by any client role**. Grounding remains **bypassable by possession of the channel credential** (§18.2a) — that is a stated, accepted residual, not a gate failure, and it is equally true of the currently-accepted transport. *(An earlier draft wrote "grounding still unbypassable" without qualification. That gate was unsatisfiable by any transport that keeps grounding in TypeScript, including the one already accepted.)*
- **G-6 must be re-proven against the new channel.** The C3-C acceptance is explicitly closed to the docker transport only.
- `scripts/physical-test/prove-governed-lifecycle.mjs` holds a **second copy** of the same transport SQL; it will drift unless updated with the first.
- **⚠️ THREE BREAK CONDITIONS — and the most dangerous one is INVISIBLE to every assertion in the repository.** An earlier draft stated this in the *wrong direction*; the corrected form is binding:
  - **`GRANT authenticated TO bc_draft_channel`** (client role → channel role) gives the channel role the 13 table SELECTs and 25 client RPCs. Undesirable, but it does **not** expose the wrapper to browsers. *This is the direction the earlier draft warned about — the less important one.*
  - **`GRANT bc_draft_channel TO authenticated`** (channel role → client role) makes **every browser session able to execute the wrapper**. This is the catastrophic direction and **must be prohibited explicitly**.
  - **`GRANT bc_draft_channel TO authenticator`** — the grant PostgREST would actually need — is **UNDETECTABLE BY ALL THREE EXISTING CHECKS.** Verified live: `authenticator` **is** a member of `authenticated`, `anon` and `service_role`, yet `has_function_privilege('authenticator', …)` returns **false**, because `authenticator` is **`NOINHERIT`** (`rolinherit = f`). All three checks use `has_function_privilege`, so this grant would silently expose the wrapper to every browser identity **with zero test failures**.
  
  **The migration authors already knew this.** `20260804213000_step_7h_audit_chain.sql:1164-1166` says so outright — *"authenticator memberships are NOINHERIT, so the ACL text is the honest check"* — and that migration uses `relacl::text` matching for exactly this reason.
  
  **BINDING REQUIREMENT:** the wrapper must carry a **`proacl`-text assertion** in the 7H style, not a `has_function_privilege` check. `has_function_privilege` **cannot see a NOINHERIT membership** and must not be relied on as the wrapper's guard.
- The grant must be a **direct `GRANT`, never `ALTER DEFAULT PRIVILEGES`** — two migrations pin `defaclacl::text = '{postgres=X/postgres}'` as an **exact string**, and a further assertion pins exactly three postgres default-ACL rows.
- **Provenance of the zero-EXECUTE checks, cited precisely:** the migration-time assertion is **B7** at `20260805090500_step_7i_report_lifecycle.sql:3162`; the other two are **not** migration assertions — A35 lives at `scripts/fixtures/verify-local-fixtures.sql:659-678` and T7I-4 at `scripts/tests/step-7i/lifecycle-canonical.sql:365-444`. *(Note: a second, unrelated **B7** exists at `20260804213000:1164` governing audit-table ACLs — do not confuse them.)* **No check anywhere compares `report_store_draft`'s `proacl` to a literal or counts its grantees.**
- One new migration moves the pinned migration count 12 → 13 in **eight** files. Mechanical. **The function census moves 34 → 35** (the wrapper is a function) and must be updated wherever pinned. A-040 is not implicated either way — `Amendment_004.md:407` states *"Functions are outside this clause."*

---

## 19. DATABASE / FUNCTIONS — **PA-OD-1 RATIFIED**

### 19.1 The ratified Final MVP census

**12 migrations · 26 tables · 34 functions · 12 enums · 29 RLS policies · 25 `authenticated` EXECUTE · 9 owner-only functions.**

Verified three independent ways on 2026-08-07: the migration files on disk, the live catalogue, and the applied-migration table. **All 34 function names are distinct — there is no `CREATE OR REPLACE` and no `DROP FUNCTION` anywhere in the migration set**, so 34 is exact and not an artefact of redefinition.

### 19.2 The historical 28 — and what it is not

`docs/plan/STEP_7I_REPORT_LIFECYCLE_BASELINE.md` §5.0 records a **closed Step 7I snapshot of 28 functions**, asserted in-source at `20260805090500_step_7i_report_lifecycle.sql:3119`. That assertion runs *during* that migration and is a **point-in-time gate, not a permanent quantity cap**. The Step 7I baseline is a historical snapshot and **cannot serve as the standing Final MVP inventory**. §19.1 above is now that inventory.

### 19.3 The six functions beyond the snapshot — all RATIFIED

Delta is exactly **+6, −0**. No snapshot function was dropped, renamed or redefined. All six are `SECURITY DEFINER`, owner `postgres`, `SET search_path = ''`, and revoked from `PUBLIC`/`anon`/`service_role`/`authenticator`.

| Function | Origin | Authority |
|---|---|---|
| `assessment_save_observation` | `20260806090000` | Ratified assessment write baseline (CP-2/CP-4). **Strictest posture of the six** — EXECUTE later revoked from `authenticated`; now owner-only, reachable solely as a delegate |
| `assessment_get_trainer_observation` | `20260806090000` | Same baseline, ASM-2; `STABLE`; management/parent denied unconditionally (`BC101`) |
| `report_list_management_corrections` | `20260806103000` | Physical-test slice R-7; `STABLE`; **zero arguments — cross-centre access is unrepresentable**; zero `RAISE` in body, so every denial is a byte-identical zero-row return |
| `report_resolve_context` | `20260806190000` | Run B R-22; `STABLE`; returns exactly two uuid columns; cannot act as an existence oracle |
| `assessment_save_complete_and_open_report` | `20260806220000` | **Operator ruling R-C2-1**, recorded before implementation — the strongest authority of the six. Walks only T0/T1; emits no audit event of its own |
| `report_list_management_submitted` | `20260807113000` | **Operator ruling R-C2-3** + C2C-004; `STABLE`; zero arguments; content-free |

**Verdict: RATIFY.** All six are additive, traceable to accepted migration and governance history, and none touches the lifecycle graph, the audit registry, R-27, or A-038's status gate. Five are `STABLE` or delegate to already-ratified RPCs; the one that mutates report state was mandated by a pre-implementation operator ruling.

⚠️ **HONEST NOTE, STRENGTHENED AFTER REVIEW — `report_list_management_submitted` is weaker than an earlier draft admitted.**

An earlier draft cited *"operator ruling R-C2-3 + C2C-004"* and called the shortfall *"a documentation/ratification gap."* On inspection:

- **R-C2-3 rules on rail/route shape only** — it says nothing about a projection, and **the migration's own authority chain does not cite it**. Its cited authorities are the spec, amendments, `CLAUDE.md`, the plan, the Step 7I baseline and C2C-004.
- **C2C-004's own row records `Operator approval needed = Yes`**, requiring the operator to state whether R-C2-3's "Approved" is generic phrasing or a requirement for a third filter.
- **The build order forbade starting:** *"Nothing in Wave 2 or later should start before the R-C2-3 'Approved' question (U-2) … are answered."* **U-2 was never answered.**

**The accurate characterisation is therefore: an unanswered blocking question that was built through, not a documentation gap.** The object itself remains bounded, `STABLE`, zero-argument, content-free and behind the same zero-row denial posture as its accepted sibling — so **the ratification stands on the technical merits**, and no code change is required. But the operator should know it is ratifying *through* an unanswered gate, not merely tidying paperwork. **This is the single weakest link in the §19 ratification and it is named so the operator can reverse it if they disagree.**

---

## 20. PDPA / DATA GOVERNANCE

### 20.1 The §3.1 vs §6.1 contradiction — RESOLVED

The contradiction is **in `CLAUDE.md`, not in the specification** (spec v3 has no §6.1). §3.1 (a security-persona checklist) asserted that `consent_records`, `retention_policies` and `erasure_requests` *"exist from the Phase 0 schema"*. §6.1 — which declares itself *"authoritative over any older spec §20 table name or shape"* — omits all three from its exact inventory.

**§6.1 wins. Do not build.** The filesystem settles it independently: all three return **zero references across all 12 migrations** and are absent from the live catalogue. §3.1's claim was falsifiable and false. No amendment amends either section; Amendment 004 states directly that **no PDPA object is created**. Creating one would be a stop-and-ask violation.

### 20.2 Table rulings

Five commonly-cited "missing" tables — `users`, `classes`, `parent_child_links`, `trainer_class_assignments`, `management_centre_assignments` — are **renames, not absences** (→ `accounts` + `centre_memberships`, `class_grades` + `class_modules`, `parent_student_links`, `class_session_assignments`, and `centre_memberships` with `role='management'`). Classifying them as missing is itself an error.

**Nine tables are genuinely absent:**

| Table | Ruling |
|---|---|
| `evidence` | **DEFERRED_BY_RATIFIED_DECISION** — owner named; now activated by §8, so this becomes Phase B build scope |
| `ai_jobs` | **DEFERRED_BY_RATIFIED_DECISION** — owner named ("later AI work") |
| `consent_records` | **DEFERRED_BY_RATIFIED_DECISION** — Phase 4. **Becomes structurally mandatory the moment evidence media ships** (A-001 gate 2: a written policy cannot gate a signed URL) |
| `retention_policies` | **DEFERRED_BY_RATIFIED_DECISION** — Phase 4 |
| `erasure_requests` | **DEFERRED_BY_RATIFIED_DECISION** — Phase 4 |
| `notifications` | **DEFERRED_BY_RATIFIED_DECISION** — U-31; no notification table, enum, RPC, audit action or delivery mechanism exists |
| `term_reports` | **NOT_REQUIRED** — term-report generation is explicitly out of MVP scope. The spec's "schema-ready" wording is overridden by A-032's later, more specific no-placeholder rule; the evidence-accrual purpose is already met by `observations.term_evidence_notes` |
| `report_source_map` | **REQUIRED_FOR_FINAL_MVP** — Phase 1 **scope** and an Appendix-B integrity-critical instrument (source-tracing for "Compare with Notes"). Owned and non-blocking for this lock, but genuinely required and unbuilt. *(An earlier draft called it a Phase 1 **exit condition**; the spec's three named exit conditions do not include it.)* |
| `session_logs` | **GENUINELY MISSING** — in scope per the specification, no substitute exists, and **no deferral instrument covers it**. Its owning phase sits outside the Final MVP slice, so it does not block; recorded honestly as the one true orphan |

**Create none of them now.** Every one either has a named owning checkpoint or falls under the stop-and-ask rule.

### 20.3 The three PDPA instruments

**Consent · Retention · Erasure.** All three: **DEFERRED_BY_RATIFIED_DECISION**, Phase 4, nothing built.

- **Consent must be BUILT, not written** — it must be versioned, timestamped and gate evidence upload at request time; an unconsented access path is a must-fail test case.
- **Erasure must be BUILT** — the specification requires server *endpoints*, and data must be genuinely removed or anonymized, not flagged.
- **Retention is HYBRID** — the window *values* are a policy decision requiring a Singapore privacy professional; the *enforcement* (scheduled purge) is product.
- **Data minimisation is already IMPLEMENTED_DIFFERENTLY** and enforced in schema and design, not by policy.
- **Breach readiness** — the runbook is a document; the audit trail beneath it is **built and live**; the external retention-locked mirror is Phase 4.

### 20.4 ⚠️ The load-bearing condition

**The absence of all three instruments is lawful ONLY because ADR-6 confines the system to synthetic data:** *"During prototyping, only synthetic/seed data is used, keeping PDPA obligations dormant until real records are handled."* Enforced operationally — *never use real names, photos, or anything resembling actual children*.

**The moment real child data is loaded, the deferral becomes a breach.** This interacts directly with §26: a usability study run on real participants must not put participant data into the product. `CLAUDE.md` already rules that such data **lives outside the product entirely**.

### 20.5 An open residency gap

The specification requires an **LLM region / DPA** *"chosen to avoid uncontrolled cross-border transfer of child data."* **No document in this workspace records either.** This is an open gap that becomes live the moment real data enters a prompt. Recorded, not resolved — it is a Phase B decision, and §20.4 keeps it dormant meanwhile.

---

## 21. STORAGE

- **Private buckets only.** The evidence bucket must be created with `public = false`. Publicly readable evidence buckets are prohibited.
- **Backend-minted, short-TTL signed URLs are the only access path.** Direct bucket access, raw storage-path access and public-object access are prohibited.
- **No client-side service-role credential, ever.**
- Object paths must be non-guessable and must **not leak child identity in the key**.
- `allowed_mime_types` and `file_size_limit` must be set from ratified authority — **not** from the reference pack's HTML, which is design intent rather than authority. The `500MB` / `50MiB` conflict must be resolved by ruling before implementation.
- Write and read paths go through `SECURITY DEFINER` RPCs plus `storage.objects` policies; **no INSERT/UPDATE/DELETE grant to `authenticated`** on evidence metadata.
- Management: **review-only**. Parent: **excluded** (§8.1).
- Deletion must remove both the storage object and the metadata row, orphaning neither, subject to §20.

**Current state: zero buckets, zero storage policies, zero objects.** The prohibition on public buckets is presently satisfied only vacuously.

---

## 22. DEPLOYMENT ARCHITECTURE

### 22.1 The ratified production architecture

```
NEXT.JS APPLICATION  →  VERCEL  →  HOSTED SUPABASE
```

**Vercel** provides publicly accessible Next.js hosting, the production server runtime, and the public HTTPS endpoint. **Hosted Supabase** provides production Postgres, Auth, private Storage, RLS, RPCs and audit/data services.

**The final product must be publicly accessible and usable.**

### 22.2 GCP — superseded, with precision about *what* is superseded

**Operator ruling: requirements specifically mandating Google Cloud Platform, GCP, Google Cloud Run, App Engine, Cloud Functions, Firebase Hosting or another specifically Google-hosted application deployment are KNOWN OUTDATED and are SUPERSEDED.** They must not be treated as unresolved conflicts, must not block this lock, and must not be preserved as ACTIVE Final MVP deployment requirements.

**Eleven GCP-bearing passages were located across both PDFs** and each is classified `CANONICAL_BUT_SUPERSEDED_BY_OPERATOR_GCP_OVERRIDE` — **in every case only the platform clause is superseded.** Each is paired below with the surviving requirement it was attached to.

*Two precision notes.* **Row 10 is a framing, not a mandate** — its "superseded clause" is the *framing of GCP as the default*, so the count of true **platform mandates is at most ten**; eleven is the count of GCP-bearing passages. **Row 6's surviving requirement is the weakest of the set**: the Brief's Database row is marked neither *Required* nor *Compulsory* (unlike `AI Feature (Required)` and `Deployment (Compulsory)`), and its text is a Notes-column description. Treat "hosted storage for user data" as **permitted and satisfied**, not as an obligation the brief imposes — §25.5's discipline applies here too.

⚠️ **THE "NO PARAGRAPH DISCARDED" CLAIM ABOVE IS TRUE ONLY BECAUSE §25.3a EXISTS — READ THEM TOGETHER.** In an earlier draft the claim was **false in practice**: several requirements sitting on the very pages whose GCP rows are superseded (Brief pp. 11–12, including the hard-Required *"You must be able to explain: your service · your flow · your AI feature"*) had not been carried anywhere. They are restored at **§25.3a**. This marker is placed inline because a reader consulting §22.2 alone would otherwise be misled by its own headline.

| # | Superseded platform clause | Surviving ACTIVE requirement |
|---|---|---|
| 1 | Brief p.1 — "deploy a working solution **on GCP**" | Deploy a working solution |
| 2 | Brief p.10 §10 — "a live deployed system **on Google Cloud (GCP)**" | **A live deployed system** |
| 3 | Brief p.10 §12 — heading qualifier + "be deployed using **GCP services**" | Deployment Requirement stands: public link · complete E2E journey · **functional AI in the deployed version** |
| 4 | Brief p.11 — Firebase Hosting / Cloud Run / App Engine / Cloud Functions | Architectural shape (frontend host + backend for app logic/APIs + light functions); **Minimum Deployment Expectation**; **Testing Before Final Presentation** |
| 5 | Brief p.12 — "Deployment (Compulsory) — **GCP (Firebase, Cloud Run, App Engine)**" | **"Deployment (Compulsory)"** and "Final product must be deployed and accessible via a public link" |
| 6 | Brief p.12 — "Database — **Firebase (Firestore)**" | Hosted storage for user data, inputs, responses, logs — **product-agnostic; Supabase satisfies it** |
| 7 | Brief p.12 — "AI Feature — … / **Google ML APIs**" | AI feature required. **OpenAI API is non-Google and is NOT superseded** |
| 8 | Deliverables p.2 — "Live **Google Cloud** application URL" | **Live application URL** on the Google Site |
| 9 | Deliverables p.2 — "expected to deploy … **on GCP**" + "Successfully deployed on GCP" | Complete and functional service; **publicly accessible application URL**; working prototype; complete E2E journey; **functional AI feature in the deployed system**; core workflow demonstrable without errors |
| 10 | Deliverables pp.2–3 — framing GCP as the default | **The Alternative Deployment route itself is NOT superseded — it is the surviving compliance path** |
| 11 | Deliverables p.4 — "**Google Cloud** deployment link is accessible" | **Deployment link is accessible** + all six other pre-demo checks |

### 22.3 ⚠️ The most important finding in the whole GCP reconciliation

**The newer canonical PDF contains its own sanctioned non-GCP route.** `Project_Final_Deliverables.pdf` pp.2–3, *"Alternative Deployment (Client Projects)"*:

> *"For projects where deployment on Google Cloud Platform is not feasible due to client infrastructure, organisational policies, security requirements, or existing enterprise systems, your team should demonstrate that the solution has been deployed or integrated within the client's environment (**or an equivalent production/staging environment**)."*

It also softens the Brief's absolute *"must"* to *"expected to"*. **The operator's override therefore does not put this project outside the canon — it aligns it with the newer of the two canonical documents.**

⚠️ **But the route carries an eligibility precondition, and the honest reading is narrower than an earlier draft allowed.** The clause is headed **"Alternative Deployment (Client Projects)"** — the scoping qualifier matters — and is available *"for projects where deployment on GCP is not feasible due to **client infrastructure, organisational policies, security requirements, or existing enterprise systems**"*, asking for deployment *"within the **client's** environment (or an equivalent production/staging environment)."*

Its four illustrative examples are: *"Client's internal server or cloud platform · Client's staging or testing environment · Existing enterprise platform or system · Organisation-hosted application."* **Vercel matches none of the four.**

The operator's stated reason — that the GCP mandates are *known outdated* — **is not one of the four named grounds** either. An earlier draft called *"or an equivalent production/staging environment"* *"genuinely broad"*; read against the section heading and the four examples, it more naturally parses as **equivalent to the client's environment**, not as a free-standing carve-out. That is the less favourable reading and it is recorded here rather than the flattering one. Additionally, Deliverables p.2 retains a hard checkbox *"☐ Successfully deployed on Google Cloud Platform (GCP)"* which **will be visibly unmet**.

**This does not weaken the override — the operator's ruling governs.** It sharpens §22.4: because obligation 4 requires the approach to be *explained at the final presentation*, **an eligibility reason must be nameable**, and the unmet checkbox should be acknowledged rather than left to be noticed. This is presentation preparation, not a governance blocker.

**Four obligations transfer onto the substitute platform and are ACTIVE:**

1. The deployed system is accessible **[within the client's environment]** — the bracketed words are in the canonical text and an earlier draft dropped them.
2. The deployment supports the **complete end-to-end user journey**.
3. The **AI feature is functional** in the deployed environment.
4. **The deployment approach and constraints are clearly explained during the final presentation.**

And the underlying rule, stripped of platform: *"The objective is to demonstrate **actual implementation**, rather than only showing a local prototype or development environment."* **Localhost is not acceptable.**

### 22.4 ✅ ~~An outstanding non-technical operator action~~ → **CLOSED 2026-08-08**

> **`OPERATOR_CONFIRMED_TEACHING_TEAM_DEPLOYMENT_APPROVAL` (2026-08-08).** The operator confirms the deployment approach **has been discussed with and accepted by the teaching team**. The B.E.S.T Coach Final MVP is approved to deploy on **Vercel + hosted Supabase**. **This item is no longer outstanding, and is no longer the highest-urgency action in this lock.**
>
> ⚠️ **This is an operator-reported EXTERNAL confirmation. No documentary evidence of it exists in this workspace — no email, no minutes, no transcript — and none may ever be fabricated.** The claim rests on the operator's statement, and must always be presented that way.
>
> *Historical text follows, retained unrewritten. Its "today is 7 Aug 2026" is stale.*

> *"If your team is unable to deploy on GCP, please **discuss your deployment approach with the teaching team in advance**."*

The override removes the *platform* obligation. It does **not** remove this *notification* step. This is a **human action the orchestrator cannot perform**, and it is time-critical: the Final Presentation window is **10–16 Aug 2026** and today is **7 Aug 2026**. It does not block this lock, but it is surfaced here as the single most time-sensitive item in the document.

### 22.5 On the authority for Vercel — stated precisely

Spec §19 records: *"| Hosting | **Vercel (Singapore)** or Cloud Run `asia-southeast1` | Compute near data per ADR-6. |"* — Vercel is **one of two co-equal options** the specification already offers.

**No governance document *ratifies* Vercel; the specification *permits* it and the operator *ratifies* it.** The operator's ruling exercises a choice §19 already contained, which is precisely why it creates no conflict. The authority is the operator's, and this lock says so rather than over-claiming a spec mandate.

### 22.6 Vercel deployment requirements

- Serve the Next.js app; **Node runtime** (not Edge) on any route touching the draft transport (§18).
- `export const runtime = "nodejs"` set explicitly; `maxDuration` covering the 60 s provider timeout.
- Public HTTPS endpoint with a stable public URL for submission.
- Environment configuration per §24; **`NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE` must be asserted unset** — fixture mode is a runtime env read, so the same build can start in fixture mode without a rebuild.
- Function region per §23.
- `next.config.ts` is currently **empty scaffold** — it carries no environment, region, or security-header policy today.

---

## 23. REGION / ENVIRONMENT

### 23.1 Data residency — genuine, and NOT a GCP artefact

ADR-6: *"Database **and** compute run in/near Singapore."* Reinforced platform-neutrally in at least four further places, including the §22 data-residency row (*"Supabase project (Postgres + Storage) in Singapore; compute in/near Singapore"*), `CLAUDE.md` (*"Region-pin everything to Singapore — database, storage, compute"*), and a §27 non-negotiable. **Amendment 003 confirms ADR-6 unchanged and in force.**

**Binding on hosted Supabase (Postgres + Storage): YES**, unambiguously and platform-neutrally. Supabase's Singapore region satisfies it directly; the governance names *Singapore*, never a cloud SKU.

**Binding on COMPUTE: YES — and this is not a translated GCP leftover.** The compute obligation is asserted three times in platform-neutral language *before any platform is named*. The string `asia-southeast1` appears **exactly once in the application repository** (`spec:518`), as one of two co-equal options whose rationale column reads *"Compute near data per ADR-6"*. *(Workspace-wide there are ~14 occurrences — three duplicate copies of that same spec row in `governance-source/` and the two worktrees, plus governance-document discussion including this sentence. An earlier draft said "exactly once in the entire repository", which overstated it; the inference is unaffected.)* Retiring Cloud Run retires the string; it does not retire ADR-6. **Since §19 itself names "Vercel (Singapore)", selecting a Singapore function region implements an existing clause rather than inventing one.**

**Two honest qualifications:** the wording is *"in/near Singapore"*, not "must not leave Singapore" — a proximity and transfer-hygiene rule, not a hard localisation mandate; and the **LLM region/DPA gap (§20.5) is a fourth, unaddressed compute surface**.

**No requirement to deploy in Singapore comes from the canonical PDFs.** Neither mentions region, residency or locality. This requirement is **entirely internal** and must not be presented as an academic one.

**No file in the repository pins the region.** `supabase/config.toml` is local-only and carries no region setting; the hosted region is set at project creation. The requirement rests on a human checklist step — precisely the *"free to set now, painful to migrate later"* risk ADR-6 names.

### 23.2 Environment separation

- **Dev / staging / prod are separate Supabase projects, never schemas within one project.** Staging and production must never share a project.
- Seed UUIDs are fixed literals and identical across every environment.
- The full pre-production checklist is re-run against staging before promotion.
- **Real student/parent data only after the PDPA mechanisms in §20 are confirmed working in production.**
- **Current posture: exactly one environment — local Docker.** No staging project, no production project, no CI, no hosting provider configured. The separation requirement is **not violated; it is simply not yet exercised.**
- `[db.network_restrictions]` is currently disabled with `allowed_cidrs = ["0.0.0.0/0"]` — inert locally, but **must not be carried to a hosted project**.

⚠️ **§23.2 and §18.2a must be reconciled at implementation time, and an earlier draft left them contradicting each other.** §18.2a names the internet-reachable pooler credential as the *whole* residual risk and offers no network control; this section mandates a network control without noticing that **Vercel's serverless egress is not static**, so a CIDR allow-list cannot straightforwardly admit it.

**Ruling:** network restrictions **are** the cheapest available mitigation for §18.2a's residual and **must be evaluated explicitly**, not silently dropped. Phase B must record one of: (a) a Vercel static-egress mechanism is used and the allow-list is applied; (b) restrictions are applied to every source *except* the draft channel; or (c) restrictions are not applied, **with the reason stated**. Choosing (c) without recording why would leave the lock's own stated residual entirely unmitigated.

---

## 24. PRODUCTION SECRETS

**Client-safe public values** (may be inlined into the browser bundle):
`NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

**Server-only privileged values** (must never carry a `NEXT_PUBLIC_` prefix, never be committed, never be logged, never appear in an error):
`SUPABASE_SECRET_KEY` · `LLM_API_KEY` · (new, per §18) the draft-channel connection string

**Non-secret server config:** `LLM_PROVIDER` · `LLM_MODEL`
**Dev-only:** `NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE` — **must be unset in production**

**Rules.**

- **No service-role key in any client bundle, ever.** Verified clean: the elevated client factory is `server-only` and currently has **zero consumers**; the browser Supabase client is imported by nothing, enforced by a standing test.
- **`service_role` holds zero table privileges and zero function EXECUTE** in the database, and nothing may ever grant to it. Static gates fail any migration that tries.
- Naming discipline is **structural, not conventional** — the two true secrets carry no public prefix, so Next.js cannot inline them.
- Production values are set through the hosting provider's secret management, never committed. `.gitignore` covers `.env*` with a `!.env.example` exception; `.env.local` is untracked and has never been committed.
- Key-family validation already fails fast at boot on a half-migrated environment.
- **No secret value may be read, printed, logged or reported** by any agent or process, in either direction.

---

## 25. FINAL SUBMISSION REQUIREMENTS

Derived directly from both canonical PDFs. **The 11 superseded platform clauses are enumerated and independently checkable at §22.2.** A full extraction pass this run counted **146 requirements, 135 ACTIVE, 0 contradicted** — those two aggregate figures come from that pass's own working register, which was **not persisted to the workspace and is therefore not independently verifiable from this document**. They are reported as provenance, not as verified counts. *(This matters because the closing note claims every count was verified against the filesystem or the database; these two are the exception, and saying so is the point.)*

### 25.1 The six-component submission package (Deliverables PDF)

**1 — Design Workbook / Final Report.** Must document the complete design journey from problem discovery to final solution: problem statement · stakeholder analysis · user research findings · user journey map · **service blueprint** · key design decisions and iterations · testing findings · improvements made based on testing · **links to supporting Miro and/or Figma boards**.

**2 — Source Code (GitHub Classroom).** Repository **`SDS-2026-Team-XX`** · latest source pushed · **`README.md` completed** · **deployment instructions included** · required project resources committed.

**3 — Google Site** — the **central hub of the entire submission**. Must carry: the report · **system architecture diagrams** · service blueprint · **live application URL** · **GitHub repository link** · **2-minute project video**.

**4 — Working Prototype & Deployment.** Publicly accessible application URL · working or clickable prototype · complete end-to-end user journey · **functional AI feature integrated into the deployed system** · core workflow demonstrable without errors.

**5 — AI Feature.** Must solve a real user problem · be integrated into the main user flow · improve the user experience or decision-making.

**6 — Testing Results.** See §26.

**Plus:** a **Final Presentation Checklist** and a **Final Deployment Checklist** (link accessible · main flow works · AI responds correctly · no broken links or missing pages · demonstrable without errors · internet tested · backup demonstration prepared).

**Plus the continuity requirement:** the submission must show continuity from **CHIPS deliverables · Sprint 1 · Sprint 2 · Usability Testing · weekly teaching-team and industry-mentor feedback**, demonstrating *"how your team refined the solution through evidence, iteration, and feedback."*

### 25.2 Dates, weightings and rubrics (Brief PDF only)

| Milestone | Window |
|---|---|
| Week 12 — "Final deck + demo ready" | **3–9 Aug 2026** *(current week)* |
| **Week 13 — Final Presentation (Physical), Project Showcase at Library — 40%** | **10–16 Aug 2026** |
| **Week 14 — Final Submission** (report, documentation, code, deployed system) | **17–23 Aug 2026** |

**Weightings:** CHIPS 10% · Sprint 1 20% · Sprint 2 20% · **Final Presentation 40%** · Attendance & Participation 10% · Course Survey 2%. **The Brief prints "Total 102%"** — this is the canonical document's own arithmetic and is recorded, not corrected.

**Grading scale:** 1 Basic/Weak · 2 Good/Satisfactory · 3 Strong/Excellent. No letter grades, no bands, no stated aggregation rule.

The Final Presentation rubric assesses: Problem & Insights · Service Design · Prototype · AI Feature · **Testing & Iteration** (top band: *"Clear evidence of refinement"*) · Communication.

**No mark or weighting is attached to the Week-14 Final Submission or to any Deliverables item.**

### 25.3 Required technology

**Figma is Required** for wireframes and prototypes. **An AI API is Required** — the Brief's tools table names *"OpenAI API / Google ML APIs"* under a hard "Required", so **OpenAI is also a named non-Google product under a Required row** (the Google option alone is superseded). **GitHub Classroom** and **Google Sites** are required by virtue of §25.1. Miro/FigJam recommended; Flask explicitly optional. **No language, framework or runtime is mandated.** Note the tools table is headed *"Tools (Recommended)"* yet contains "Required" and "Compulsory" cells — the header understates two hard requirements.

### 25.3a ADDITIONAL ACTIVE REQUIREMENTS — carried here because an earlier draft omitted them

⚠️ §22.2 claims *"no paragraph or section was discarded."* An adversarial pass found that claim **partly false in practice**: several requirements sitting on Brief pp.11–12 — the very pages whose GCP clauses are superseded — were not carried anywhere. That is exactly the failure mode the claim denies. They are restored here as **ACTIVE**:

- **Reliability under normal usage** — *"you are responsible for ensuring that… your system performs reliably under normal usage."* (Brief p.11, the page whose GCP row is superseded.)
- **Scope discipline, stated four ways** — *"Keep your implementation simple and focused on core functionality"* · *"**You are not required to build a complex system**"* · *"A clear, working prototype is preferred over a complex but unstable one"* (Brief p.12) · *"**You are not designing an app. You are designing a service experience**… A technically complex system is not required"* (Brief p.2). **For a governance corpus this elaborate, this is a material canonical instruction and it points the opposite way.**
- **⚠️ The team must be able to EXPLAIN the work** — Brief §16, under a hard **"Required"**: *"You must be able to explain: **your service · your flow · your AI feature**."* The same section permits AI code generation, debugging, prototyping and UI development. **This is the most operationally significant requirement in either PDF for an agent-built codebase, and it was omitted.**
- **Handling of real-world scenarios and failure** — Brief §15 assesses *"handling of real-world scenarios"*; Sprint 2 assesses *"Handling of Failure Scenarios"*; CHIPS 4 requires **3–5 failure scenarios** with response design; Sprint 1 requires **at least 3** realistic breakdown cases.
- **Final Presentation Checklist, enumerated** — working prototype demonstrated · complete end-to-end journey demonstrated · AI feature demonstrated · testing findings presented · improvements from testing explained · **presentation rehearsed and within the allocated time**.
- **Grading Criteria — all six** (Brief §15), not the one an earlier draft quoted: **problem clarity · user understanding · service design quality · usability and flow · handling of real-world scenarios · iteration and improvement**.
- **Attendance & Participation rubric** (10%, Brief p.15) — Attendance · Preparation · Engagement · **Response to Feedback**. A graded component with a published rubric; §25.2 recorded the weight but not the criteria. ⚠️ **This is course attendance and has nothing to do with the product's learner-attendance feature (§7).**
- **Key Expectations** (Brief §18, five items) — focus on real users · design the full-service experience · anticipate real-world scenarios · integrate AI meaningfully · show continuous progress.
- ⚠️ **"A visually impressive interface is not enough"** (Brief p.2) — the counterpart to the scope-discipline bullets above, and the line aimed most directly at this workspace's investment profile.
- **AI-feature acceptable examples** include *"text summarisation or analysis"* — the category this project's AI drafting occupies.
- **Four named reference projects** with Google Site and video URLs (Deliverables pp.5–6), setting the expected standard — *"for inspiration only and should not be copied"* — plus the pointer *"can also check from Week 1 folder"*, an untapped course resource given §25.6's Design Workbook gap.

### 25.4 ⚠️ Silences — things that are NOT requirements

Do not let any of these be asserted as canonical:

**Supabase** (also Postgres, SQL, AWS, Azure, Vercel, Docker, CI/CD) · **any usability participant count** · **any report length, word count, page count, format or template** · **any final-presentation duration** · **any video format spec** (only "2-minute") · **any calendar-date deadline or submission time** (week ranges only) · **any upload portal, ZIP, or file-naming convention** · **any licence, data-protection or PII requirement** · **any Singapore region requirement**.

**Corrected wording on three of these.** An earlier draft said performance, security and accessibility requirements *"appear zero times."* That is **false as stated**: the Brief does require the system to *"perform reliably under normal usage"* (now §25.3a), and the Deliverables PDF uses the phrase *"security requirements"* in the Alternative Deployment clause. The accurate statement is: **no *quantified* performance, test-coverage, linting or accessibility target is set anywhere.**

### 25.5 Requirements previously asserted on the brief's authority that must STOP being so presented

Hosted Supabase · Singapore region · dev/staging/prod separation · production secrets management · UAT · terminology purge · `npm test`/`TESTING.md` · evidence committed to the repo · LICENCE. **All nine are `NOT_MENTIONED_BY_CANONICAL_BRIEF`.** Several remain worth doing on internal governance or research-integrity grounds — the terminology purge especially — but **not on the brief's authority**.

### 25.6 Verified submission gaps

**Scope of this verification: the workspace only.** Material may exist in Miro, Figma, Google Drive or a course LMS that this audit cannot see. Nothing below asserts an artefact does not exist *anywhere* — only that it is not in this workspace.

- **`README.md` is untouched `create-next-app` boilerplate** — it does not satisfy "README.md completed" or "Deployment instructions included".
- **Zero git remotes; nothing has ever been pushed.** GitHub Classroom submission is entirely unstarted.
- **`SDS-2026-Team-XX`** — the team number is an operator-held fact not present in the workspace.
- **The exact submission deadline must be obtained from the official course channel**; the Brief gives week ranges only and notes the schedule may adjust.
- The Google Site, the 2-minute video, and the system architecture diagrams do not exist here.
- ⚠️ **Component 1 of 6 — the Design Workbook / Final Report — does not exist in this workspace**, nor do the service blueprint, the user journey map, the stakeholder analysis, the persona set, or the Miro/Figma board links. **This is the single largest submission gap and it is not a deployment gap.**
- ⚠️ **No CHIPS 1–4 material and no Sprint 1 material exists anywhere in the workspace** — only Sprint 2 (§29). The Deliverables PDF requires demonstrated continuity from *all* of CHIPS, Sprint 1, Sprint 2 and Usability Testing.
- **Zero human usability evidence** (§26.4).

**Weighted honestly against the rubric:** the deployment chain this workspace has optimised for is one row of a six-row Final Presentation rubric. **Problem & Insights, Service Design, Testing & Iteration and Communication are four more** — and the design-process artefacts feeding them are the ones missing. For a *Service Design Studio* module, that is where the marks are.

---

## 26. USABILITY REQUIREMENTS — *human evaluation, not technical verification*

### 26.1 What the canon actually requires

**Human usability testing is unambiguously required and is graded.**

> *"You must test your solution with users and document your findings. You are expected to: conduct usability testing with **real or representative users** · **observe user behaviour (not just ask for opinions)** · identify breakdowns, confusion, and friction points · evaluate whether your AI feature improves the experience."*

> *"Your final submission should include evidence from usability testing: User testing completed · **Target users identified** · Key findings documented · Major usability issues identified · Improvements made based on testing documented."*

**Focus areas:** Usability · Clarity · Breakdown Points · **Recovery** (how the service guides users when things go wrong).

**Iteration is mandated and graded** — the loop is test → findings → improvements → demonstrate the improved prototype. Retesting is not explicitly required.

### 26.2 ⚠️ NO PARTICIPANT COUNT IS MANDATED — ANYWHERE

The word **"participant" does not occur once in either PDF.** There is no minimum, maximum or recommended number, no recruitment criterion, no session protocol and no task script. **No mandatory participant count may be invented, and any number in circulation is self-imposed, not canonical.**

Likewise **not required by the brief**: SUS or any named instrument · think-aloud · time-on-task · task success or error rates · session recordings · screen captures · transcripts · consent forms · ethics approval. These are legitimate *choices*; they are not obligations, and must not be presented as such.

The one binding **method** constraint is *"observe user behaviour (not just ask for opinions)"* — a questionnaire-only or interview-only study does not satisfy the requirement.

### 26.3 Consent and research-data retention — *operator-ruled: OUTSIDE the product*

Human usability-study consent and research-data retention are handled through the **usability-study protocol, participant consent, research evidence management, and study-data retention/deletion** — **not** by adding participant-consent administration functionality to the application.

This is consistent with §20.4: participant data must not enter the product, because the product's PDPA instruments are deferred and its compliance rests on the synthetic-data rule.

### 26.4 ⚠️ THE ANTI-SUBSTITUTION RULE — absolute

**Runs C1, C2, C3, C4, G-6, automated browser tests, integration tests and synthetic fixtures must NEVER be relabelled as human usability testing.** They are technical verification. They prove the system behaves correctly; they prove nothing about whether a human can use it.

**Current state: ZERO human usability evidence exists in this workspace.** Confirmed by filename sweep, content sweep, media sweep and directory listing. The only human action in the entire corpus is an operator typing fixture passwords and confirmation phrases — administrative, yielding no usability data.

**Corrections applied this run (C-10):** `UI_REFERENCE_FINAL_MVP/CORE_SCREENSHOT_VALIDATION_REPORT.md` claimed at line 47 that an AI agent's inspection of PNG files *"is a human-equivalent usability judgement"*, under a section headed *"Visual usability validation summary"*. **Both were corrected** — the document is automated image inspection with no human observer and no user attempting any task, and it is now explicitly marked as **not** usability-testing evidence.

⚠️ **ONE INSTANCE OF THE SAME DEFECT REMAINS LIVE AND CANNOT BE CORRECTED.** `UI_REFERENCE_FINAL_MVP/AUTONOMOUS_48H_RUN_B_FINAL_REPORT.md:372` states: *"Comparison was **structured human-equivalent review by an independent agent** against the frozen frame…"* — the same *"human-equivalent"* framing C-10 struck, describing an AI agent's inspection.

It is **not corrected**, and deliberately so: §29 classifies that report **HISTORICAL_EVIDENCE** and §31 forbids rewriting historical records. The document does disclose the agent and the limit in the same breath, which is why it was not classed with C-10. **Naming it here is the only available control**, and it is named so that no submission text ever quotes that sentence as evidence of usability review.

**Remaining terminology hazard for Phase A2:** `real_participant_adapter`, `participantEligible` and similar identifiers are **code symbols**, not claims of human testing, and are not changed by this lock. But any submission prose drawing on those artefacts must not let "participant" imply a human subject.

### 26.5 The critical path

**Participant recruitment is gated on nothing and is the longest-lead item in the entire project.** It should start before any implementation work.

---

## 27. ACCEPTED TECHNICAL VALIDATION — and its explicit limits

### 27.1 Run C3-C / G-6 — PASS

**Proves:** all 16 real-provider evidence conditions; both reports reached `draft_ready` through the governed trusted-store transition; real provider calls made; **zero outward requests refused by the trip-wire**; exactly the expected five-event audit pattern per report (10 events), with `audit_verify_chain` reporting ok, complete mode, head checked; grounded drafts originated from real governed observation writes.

**Explicit limitations:** the ledger's own wording is *"sixteen **G-6 evidence conditions**"* — **not sixteen real-provider conditions**; at least four are structural or static rather than runtime provider tests. 16/16 PASS is correct; the characterisation "16 real-provider conditions" is not, and an earlier draft used it. **Nothing hosted was contacted.** The acceptance is **closed to the docker transport only** — G-6 **must be re-proven** against the replacement channel (§18.5).

The sentence *"No further real provider call is authorized by this record"* is genuine but lives in `UI_REFERENCE_FINAL_MVP/AUTONOMOUS_48H_EXECUTION_TRACKER.md:765` — a **self-authored tracker classified HISTORICAL_EVIDENCE by §29** — not in the G-6 ledger. An earlier draft attributed it to the ledger. It is quoted here with its true provenance.

### 27.2 Run C4 — PASS

**Proves:** the complete governed Trainer → Management → Parent lifecycle on a disposable stack; exactly one report shell opened at `observation_saved` with nine persisted ratings; management's well-formed nine-rating write **denied** (`BC101`); management's attempt to read the raw rating grid **denied**; the served application confirmed running the real adapter, not fixtures. **Most legs were browser-driven — but not all** (see below).

**Explicit limitations — the evidence declares THREE deviations on leg L-4, not one.** Quoting `_c4-lifecycle-evidence/c4-lifecycle-ledger.md:16` in full rather than in part:

> *"**THIS STEP IS NOT BROWSER-DRIVEN** and differs from a participant run in exactly three declared ways: **the deterministic fixture provider replaces OpenAI** (Run C4 forbids an external call and the served action constructs the real provider unconditionally — G-19, no switch); **the database channel is a superuser psql transport into the disposable container, so no client GRANT or RLS policy is exercised on this one step**; and **`authUserSub` is the fixture literal rather than the wrapper's `auth.getUser()` result**."*

*(An earlier draft of this lock reported only the second deviation and described the whole run as browser-driven. The two omitted deviations are the consequential ones: **the AI provider was not real on that leg**, and **the identity was a fixture literal, not a verified subject** — which is precisely the mechanism §18 carries forward into hosted. An authority lock must not be less candid than the evidence it cites.)*

**And the mitigating remainder of that same ledger line, which must not be truncated either** — a section whose thesis is candour cannot stop at the damaging half: *"The RPC still re-derives every relationship from the claims set on that channel. The real-provider path is proven by G-6 (Run C3-C); the RLS/GRANT path is proven by `run-integration.mjs` under real JWTs and by every other leg here through the served application."* The three deviations are real **and** separately compensated; both facts belong in the record.

Also: disposable local stack only, and **script-driven throughout — no human user** (§26.4). On terminology, note that the ledger's word *"superuser"* is loose: the role is `postgres`, which is object-owning and `BYPASSRLS` but **`rolsuper=false`** (§18.4). The substantive point — no client GRANT or RLS policy is exercised on that leg — stands.

### 27.3 What none of it proves

**No hosted environment has ever been validated. No human has ever used this system.** Neither run is usability evidence (§26.4), and neither substitutes for the canonical usability-testing requirement.

---

## 28. FINAL UI AUTHORITY

### 28.1 The protected source

**`UI_REFERENCE_FINAL_MVP\reference`** is the Final MVP UI authority, per operator ruling.

**It contains 37 pack directories, not 36.** Verified directly on the filesystem. The 37th is **`Auth 04 - All Users - Forgot Password`** — a fully designed screen with **no pack folder, no inventory ID and no Figma node ID**, sitting outside the ratified 36. The operator's brief inherited "36" from the ratified *screen inventory*, where it is correct, and applied it to the *directory*, where it is not. **Both numbers are right in their own frame: 36 governed screens, 37 design-asset packs.**

Each pack carries `.md` + `.png` + an HTML render. ~~Two packs — `Management - Students` and `Trainer - Students` — have their render saved with a **`.txt` extension containing valid HTML** (see §31).~~ **✅ RESOLVED 2026-08-08 (Final MVP Phase A2, operator ruling Q-25): both were renamed to `.html` with bytes unchanged. All 37 packs now carry `.md` + `.png` + `.html`, and `reference/` holds zero `.txt`.**

**Provenance is proven for 12 of 37 — and NOT for the other 25.** All **12** frozen `reference.png` files in the legacy numbered/AUTH packs are **SHA-256-identical** to their `reference/` counterparts (all twelve hashed, not sampled; e.g. `AUTH-01` = `b1ad24e4f414ece9…`, `33-parent-class-report` = `2aaeb446065f8360…`). For **those twelve packs**, `reference/` is demonstrably the provenance source of visual-authority rank 1. **That conclusion does not generalise to the remaining 25**, which have no second copy and no independent corroboration (§31.5).

⚠️ **Recorded because the operator ruling promotes this folder and the fact is material:** the entire `reference/` tree was **bulk-imported on 2026-08-06 at 21:52:36** — all 37 folders carry that identical birth timestamp. It is **undeclared by `UI_PACK_MANIFEST.json`, `SCREEN_INDEX.md` and the pack README**, and the cleanup manifest's open item **R2 asks whether to declare it authoritative provenance or rule it an unsanctioned import — R2 remains unresolved.** The operator's ruling settles its *authority*; it does not settle its *provenance*, and the SHA identity above settles provenance only for the twelve.

**Scope of the "clean" claim in §31.1:** that `reference/` is free of contamination rests on a **keyword search for `SPORTSTER`/`PeakPalate`**, not on a provenance audit. It is accurate as far as it goes — and §8.1 of this same document rejects keyword-count reasoning, so the limit is stated rather than glossed. Note also that the import (21:52) and the two foreign-artefact events (00:55 and 01:30 the following morning) fall within one overnight window; the cleanup manifest recommends re-scoping the incident question from *"what else was written at 01:30?"* to **"what else arrived that night, and does any of it belong to another module?"** That re-scoping is **adopted here as binding on Phase A2.**

### 28.1a ✅ The instruction layer now matches this ruling (2026-08-08)

**§28.1 promoted `reference/` to Final MVP visual authority, but that promotion had never reached the documents an implementing agent actually opens.** Until 2026-08-08 all 36 governed `screen.md` files ranked *"this folder's frozen `reference.png`"* first and never mentioned `reference/` at all; `SCREEN_INDEX.md` stated **24 times** that *"no frozen reference exists"*; and the 24 packs without a local duplicate carried a `SCREENSHOT_REQUIRED.txt` ordering a **live Figma re-export**. A fresh agent could therefore be told three times over that a ratified frame it already had did not exist.

**Closed by the Final UI Reference Authority Synchronization.** No ruling in this section changed — only its propagation:

- the visual ladder in all 36 `screen.md`, in `GLOBAL_UI_RULES.md` §1.1 and in `CLAUDE.md` (§1, §7 A-045 and the new §7.4) now ranks **`reference/<mapped pack>/` first**, with a pack-local `reference.png` demoted to an **optional frozen duplicate / integrity anchor** that never outranks it and whose absence is not a missing reference;
- the **authoritative 36-row governed→`/reference/` mapping is published in `SCREEN_INDEX.md`**, including the three names that cannot be derived (`Parent - Report`, `Auth 02 - **Mangement** - Login`, `Trainer -  My Classes` with two spaces) — **none of which may be renamed**;
- **live re-export is prohibited** where a ratified `/reference/` asset exists, preserving §28.3's protection against post-freeze canvas drift;
- **`Auth 04 - All Users - Forgot Password` remains `EXTRA_REFERENCE_ONLY_AUTH_FLOW_PACK`** — 36 governed screens, 37 reference packs, **not screen 37** (Q-4), no invented node or ID.

**No `/reference/` PNG, HTML or Markdown byte was altered** — 74/74 visual files verified SHA-256-identical. **§28.2's boundary below is untouched:** pack Markdown gains no functional rank, and the fourteen GC conflicts stand.

### 28.2 ⚠️ THE BOUNDARY — visual authority only

**Promoting `reference/` to Final MVP UI authority promotes it on the VISUAL ladder only. Its Markdown does NOT become functional, security or privacy authority.** Under A-045 the pack prose sits at **rank 5 — the lowest** — of the functional ladder and loses to the specification, the amendments and `CLAUDE.md` on every functional point.

**This boundary is load-bearing, not theoretical.** **Fourteen** functional conflicts are enumerated as **GC-1 … GC-14** at `UI_REFERENCE_FINAL_MVP/FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md:358`. *(Two summary documents, including an earlier draft of this lock, said "twelve"; the document that actually lists them says fourteen, and it is authoritative here. Under-counting would have left two governance conflicts unrecorded in the canonical baseline.)*

The most serious describe **exactly the parent per-dimension rating leak that `CLAUDE.md:284` records as already caught and fixed once** (§15). Others would grant Management a broader editing right than A-034 allows (§14), add a management "Save as draft" requiring a ninth status (§6), and implement the out-of-scope Term Report. **In every case the ratified rule wins, the pack loses, and the discrepancy is recorded here rather than silently reconciled.**

**Exact counts for the management-editing conflict, since a single figure misleads:**

- *"only Management may edit the published report"* **in some form — 5 packs**: `Management - Reports.md:38` · `Management - Student Report.md:41` · `Management - Term Report.md:40` · `Parent - Class Report.md:35` · `Trainer - Student Report.md:26`
- **the exact phrase — 2 packs**: `Management - Student Report.md:41` · `Management - Term Report.md:40`
- *"Save as draft"* — **3 packs**: `Management - Student Report.md:16,39` · `Management - Term Report.md:16,38` · `Trainer - AI Report Generation.md:19,44`
- **Union 6 · intersection 2.** *(An earlier draft said "four packs", which is none of these figures.)*

⚠️ **One `reference` claim has since been PROMOTED rather than overruled — the four report panel headings.** Under **OD-4** (§15.1, ratified 2026-08-07) the operator adopted *Overview · Strengths · Areas for Development · Remarks* **as governance, not merely as visual authority**. That is the single exception to this section's boundary, and it holds **because an operator ruling was issued** (§2.3) — **not** because a pack's prose won on the functional ladder. Nothing else in `reference/` gains functional rank, and the fourteen GC conflicts above are unaffected. Note also that the tree is **internally inconsistent** on the third label (*Areas for Development* in two packs, *Areas to Grow* in three); the ruling settles it as **Areas for Development**.

⚠️ **A VISUAL-ladder carve-out — the first of its kind — added 2026-08-08 by operator ruling Q-27 (§15.2).** Everything above concerns the *functional* ladder. **Q-27 is different: it rules that an element drawn in the rank-1 visual frame must NOT be built.** On **screen 30 (Parent Dashboard)** the complete **"This Term's Skills"** nine-dimension ratings card is **`DO_NOT_IMPLEMENT`**, Profile Details promotes upward into the vacated space, and **visual acceptance treats the card's absence as `EXPECTED / REQUIRED`, never as a regression.** §28.3 below (*"where the pack WINS"*) does **not** apply to that element. **This is a bounded, single-element carve-out** — it does not demote `reference/` generally, and the frame remains VISUAL rank 1 for the rest of screen 30 and for every other screen. See §15.2 for the full ruling and the Parent data boundary it carries.

Two pack statements were checked and **cleared**: the password-visibility toggle (a client-side reveal of the user's own input is not storage or display of a generated secret) and the invite-link-sets-own-password flow (that is the compliant pattern). The role-selector tabs are **already correctly implemented** as presentation-only.

### 28.3 Visual conflicts — where the pack WINS

On the visual ladder the frozen frame outranks the implementation. Recorded deviations: the academy raster wordmark (see §28.5), a "Remember me" state mismatch, an inert "Forgot password?" link, and an implementation-added governance note appearing in no frame. **The last is a genuine two-ladder collision** — the correct resolution is to keep the A-046 guarantee while contesting only the visible string, never to delete the guarantee.

### 28.4 U-25 — vacuous, and still blocked

The eight U-25 "blocked design families" (management review queue, final review, wording-only editor, return-to-trainer dialog, correction tracking, final approve & submit, staff notification, parent notification) are **not files, not directories, and not design assets** — every reference is a textual mention in a governance document. **Zero U-25 design artefacts exist anywhere on disk.**

The operator's clause demoting "unmapped/unframed U-25 designs outside `reference`" is therefore **vacuously satisfied — there is nothing to demote.** The live constraint is the opposite one and is **unchanged**: inventing a frame, node ID or field for any of the eight remains prohibited, and `reference/` closes **zero** U-25 families.

### 28.5 Branding — CLOSED

**Use the accepted repository B.E.S.T mark.** It is code, not an asset file: an inline SVG glyph plus live text, in `components/brand/brand-mark.tsx`. **There is no `public/` directory in the repository at all** — zero static image, SVG, favicon or font assets ship.

⚠️ **One correction:** the repository *does* ship exactly one static asset — **`app/favicon.ico`, git-tracked, 25,931 bytes, still the stock `create-next-app` icon.** Under the App Router that is precisely where a favicon lives, and it is emitted to `.next/static/media/`. **The deployed public URL will therefore serve the Next.js default mark in the browser tab.** A branding item for Phase B, not a blocker. *(An earlier draft said "zero static image, SVG, favicon or font assets ship", which was false in the one case that is publicly visible.)*

The academy's own raster wordmark shown in the three login frames **does not exist on disk in any form**. Its absence is correctly handled today: the code neither fabricates nor ports an undispositioned asset, and records the deviation in two places. **Per the operator's ruling this is closed — do not block the Final MVP waiting for it.**

### 28.6 Route reconciliation

**17 `page.tsx` routes · 5 `layout.tsx` · 0 API route handlers** — these four figures are directly verified.

**The screen-side tallies do not reconcile cleanly and are reported as approximate.** An earlier draft asserted "six exact matches · eight mismatches · twenty-one not implemented · one orphan pack", which sums to 35 against a ratified 36-screen inventory, and whose mapped-plus-unmapped total exceeds the verified 17 `page.tsx` files. The categories overlap (some screens share one route; three "mismatches" are redirect treatments rather than true divergences) and were double-counted. **Phase B should re-derive the mapping from the route list rather than trusting these totals.** What *is* verified: **6 exact matches** (AUTH-01/02/03 on the shared login shell, 09, 29, 32), **1 newly-resolved** (ID 05), **1 orphan pack** (`Auth 04`), and the mismatch register at inventory §7.2/§7.3 as corrected below.

**Two corrections to the ratified inventory, both verified directly against the filesystem:**

- The inventory's claim that *"No frozen `reference.png` exists yet for any of the 36 screens"* is **FALSE — 12 exist**, all SHA-matched. Left uncorrected, this would let a future reader deny that visual-authority rank 1 is populated at all.
- §7.3's *"ID 05 Trainer Schedule has no implemented route — operator decision required"* is **STALE**. `app/(portals)/trainer/schedule/page.tsx` exists, created by checkpoint F-04 under operator ruling R-B1. The coverage gap is **closed**.
- §7.4's register of unmapped implemented routes lists **5; there are 6** — the root route `app/page.tsx` is absent from it.

### 28.7 Live UI defect — C2C-007, CONFIRMED

`features/trainer/returned-reports-queue.tsx:36-38` renders an "unavailable" panel unless `?status=needs_edit` is present. **At its bare canonical URL `/trainer/reports`, screen 09 renders nothing at all** — a *route-level* failure that the ratified inventory records only as content incompleteness. The management sibling shows the correct ratified pattern at `management-reports-queue.tsx:97` (`?? "trainer_approved"`).

**Aggravating:** the trainer component's effect fetches unconditionally *before* the guard, so it performs a privileged read, receives the data, and then discards it behind the panel. Management guards the effect itself.

**A full sweep of all 11 `searchParams.get` call sites confirms C2C-007 is a singleton** *of that anti-pattern*. The remaining sites either default correctly or gate only additive fixture/banner behaviour.

**⚠️ C2C-007 is not the only live UI defect — C2C-006 is rated HIGH by the same register and an earlier draft omitted it.** On screen **08**, the refusal branch **does not distinguish `stale_state`**: a stale-state refusal renders copy claiming the draft was rejected safely and the report stayed at Observation Saved. The register's own note is the point — *"on the screen whose whole purpose is proving refusals are honest."*

This bears directly on §12, which asserts *"failure leaves no false `draft_ready`; the flow cancels the draft rather than stranding a report."* That remains true **of the server**. C2C-006 says the **UI copy asserts that outcome in a case where it may not hold** — an honesty defect on the refusal surface, not a lifecycle defect. Both must be fixed in Phase B.

---

## 29. DOCUMENT CLASSIFICATION

**Scope note: this section classifies only the documents this lock depends on. It is NOT a workspace classification — that is Phase A2's job.**

**ACTIVE_AUTHORITATIVE** — ⚠️ *this is a classification of currency, NOT a flattening of the §2.4 ladder. Rank notes are binding.*

- Both canonical PDFs — **rank 0**; nothing in this workspace outranks them on submission questions
- This Authority Lock
- spec v3 · Amendments 001–006 — **functional rank 1**
- `CLAUDE.md` — **functional rank 2**
- `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` and the lifecycle/authorization baselines — **functional rank 3**
- **The 12 migrations — functional rank 4** (*"ratified implementation contract"*). **A migration does NOT outrank the specification.** *(An earlier draft listed the migrations here with no rank note, which would have licensed a future agent to cite a migration against the spec. Note the separate, narrower principle established in Phase A — that a document cannot outrank a file that demonstrably **exists on disk** — which is about **facts**, not about **rules**. Precedence governs rules; existence governs facts.)*
- `UI_REFERENCE_FINAL_MVP/reference/` — **VISUAL rank 1 only; functional rank 5 (lowest)**, per §28.2
- `UI_REFERENCE_FINAL_MVP/GLOBAL_UI_RULES.md` — UI discipline; supporting, not a functional authority

**ACTIVE_SUPPORTING**
`docs/progress/STATUS.md` · `docs/progress/BUILD_NOTES.md` · `docs/plan/BEST_Coach_Implementation_Plan.md` · the Step 7E/7F/7G/7H/7I baselines · `FINAL_MVP_SUBMISSION_READINESS_PLAN.md` · `FINAL_MVP_PHASE_A_GOVERNANCE_RECONCILIATION.md` · `UI_REFERENCE_FINAL_MVP/FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md` (**sole holder of GC-1…GC-14, OD-1…OD-6 and the C2C register**) · `UI_REFERENCE_FINAL_MVP/UI_REFERENCE_CLEANUP_MANIFEST.md` (**sole holder of R1…R7**) · `UI_REFERENCE_FINAL_MVP/UI_PACK_MANIFEST.json` and `SCREEN_INDEX.md` (**the two Figma node records §31.1 depends on**)

**ACTIVE_SUPPORTING — with a currency caveat**
`UI_REFERENCE_FINAL_MVP/CORE_SCREENSHOT_VALIDATION_REPORT.md` — edited this run (C-10, §26.4) and the source of the 12-file SHA verification (§28.1). ⚠️ **Partly stale:** its §4 asserts *"0 additional image files of any kind anywhere in the pack"*, which is now false — the 37 `reference/` PNGs and the checkpoint captures both postdate it. Cite it for the SHA verification and the C-10 record; **do not cite its image census**. *(An earlier draft left this document unclassified while depending on it in two sections.)*

**HISTORICAL_EVIDENCE** *(preserved, never rewritten)*
`_g6-activation-evidence/` · `_c4-lifecycle-evidence/` · `_f17-disposable-evidence/` · `UI_REFERENCE_FINAL_MVP/AUTONOMOUS_48H_*` reports and trackers · `RUN_C2_UI_ARCHITECTURE_RECONCILIATION.md` · `CHANGE_LOG.md` · `BEST_COACH_DEMO_TO_MVP_MIGRATION_TRACKER.md` · dated census entries inside `STATUS.md` · `UI_REFERENCE_FINAL_MVP/_checkpoint-evidence/`

**FROZEN_BASELINE**
`SDS Project Sprint 2/` @ `8d4acf4` — **simultaneously the frozen demo AND the Sprint 2 continuity deliverable** the canonical brief requires (§25.1). Doubly protected. · The 12 frozen `reference.png` files · `worktrees/backend-48h` · `worktrees/frontend-48h`

**SUPERSEDED**
The 11 GCP platform mandates (§22.2) — *superseded as requirements, preserved as canonical text; the PDFs are never edited* · The Step 7I 28-function snapshot **as a standing inventory** (§19.2) · `CLAUDE.md` §3.1's PDPA-table sentence (§20.1) · The `reference` packs' **functional** claims (§28.2)

⚠️ **Removed from this list after review:** `FINAL_MVP_SUBMISSION_READINESS_PLAN.md:202` was wrongly marked superseded by an earlier draft. It says *"do not grant client EXECUTE on `report_store_draft`. A dedicated definer chain is the indicated shape"* — which **is** the ratified design. It is **CONFIRMED** (§18.3).

---

## 30. KNOWN SUPERSEDED REQUIREMENTS

1. **The obsolete GCP / Cloud Run / Firebase Hosting / App Engine / Cloud Functions deployment mandate** — 11 clauses, superseded by operator override; each paired with its surviving requirement (§22.2). Historical records describing GCP as an earlier plan remain historical evidence and **must not be falsified**.
2. **Firebase (Firestore) as the named database** — superseded as a product; the underlying hosted-storage requirement survives and Supabase satisfies it.
3. **"Google ML APIs"** — superseded as one of two options; **OpenAI is not superseded**.
4. **The Step 7I 28-function count as a permanent cap** — superseded by §19.1's ratified 34.
5. **`CLAUDE.md` §3.1's claim that three PDPA tables exist** — factually false, struck (§20.1).
6. **`CLAUDE.md` §6.1's "Exactly 22 tables / Exactly 10 enums" read as a project census** — it was always Step-7E-scoped; live census is 26/12 (§19.1).
7. **Superseded UI families** — the 36 legacy numbered packs are **demoted as visual authority** in favour of `reference/`, but their `implementation-notes.md`, `screen.md` and node records are **unique, irreplaceable and must not be deleted** (§31).
8. **The inventory's "no frozen reference.png exists" and "ID 05 has no implemented route"** — both falsified (§28.6).
9. **The A-014 evidence deferral and the prohibition on naming an uploader** — discharged by operator ruling (§8). `CLAUDE.md`'s *"do not invent a replacement uploader"* clause needs reconciliation, or future agents will read it as still binding.
10. **PA-OD-4 (B.E.S.T gloss) and PA-OD-6 (`report_source_map` ownership)** — withdrawn as manufactured decisions.
11. **PA-OD-7 as a conflict** — dissolved; §19 already offered Vercel (§22.5).

### 30.2 Live configuration that contradicts this lock and must be fixed in Phase B

**`supabase/config.toml` currently sets `enable_signup = true` (twice) with `enable_confirmations = false`**, and the running GoTrue container confirms `GOTRUE_DISABLE_SIGNUP=false` / `GOTRUE_MAILER_AUTOCONFIRM=true`. Anyone with the project URL and the publishable key can mint an **auto-confirmed identity with an arbitrary, unverified email**.

**Not currently critical** — the identity gains nothing (§5.2) and the app ships no browser Supabase client. **But the forward hazard is specific and serious:** A-027 makes the normalized email the *acceptance-time proof* for invitations, so an attacker can **pre-squat an address that a future claim flow will treat as proof of ownership**. This must be closed **before** the invitation flow is designed, not after.

*This lock records the defect; it does not fix it. `config.toml` is runtime configuration and was out of scope for this run.*

---

## 31. PHASE A2 PROTECTIONS — material that must NEVER be deleted without explicit operator authority

**Scope note: this section covers deletion, moving, archiving AND renaming.** §31.2 authorises exactly one rename inside the ratified visual-authority tree; every other rename is equally prohibited without authority.

1. **The canonical PDFs** — `FINAL_SUBMISSION_BRIEF/` in full. Never edited, never moved, never rewritten.
2. **This Authority Lock.**
2a. **⚠️ `SDS Project Final (BEST Coach)/docs/spec/` in full — spec v3 and Amendments 001–006 — and `CLAUDE.md`.** These are **functional ladder ranks 1 and 2**, the top two rungs of the authority this entire lock rests on. *(An earlier draft of §31 omitted both, protecting the migrations and the screen packs while leaving the governing specification unlisted. That was the most consequential gap in the protection list.)* Also protected: `docs/plan/` and `docs/progress/` in full.
3. **The entire `UI_REFERENCE_FINAL_MVP/reference/` tree** — all 37 packs, all files. Includes `Auth 04 - All Users - Forgot Password` **despite having no inventory ID**: it is live evidence for an open decision, and deleting it destroys the record that ruling needs.
4. **✅ RESOLVED 2026-08-08 (Phase A2, Q-25) — the two renders are now `.html`.** `reference/Management - Students/Management - Students.html` and `reference/Trainer - Students/Trainer - Students.html`, **renamed with bytes unchanged** (pre/post SHA-256 identical). **The hazard described below is closed: `reference/` now contains zero `.txt` files, so no `.txt`-class sweep can reach them.** They remain protected as the sole visual authority for screens 04 and 17. ⚠️ **Note the count correction:** §31's scope note said §31.2 authorises *"exactly **one** rename"*; the operator ruled that a **count error** and authorized **both** (Q-25). *Historical text follows.* ~~The two `.txt` renders — `reference/Management - Students/Management - Students.txt` and `reference/Trainer - Students/Trainer - Students.txt`. **These contain valid HTML.**~~ A cleanup pass filtering on `.md`/`.png`/`.html` will silently delete them and destroy the only renders of screens 04 and 17. **This is the highest-probability accidental loss in the entire tree. They need a rename, never a delete.**
5. **All 12 frozen `reference.png` files.** Byte-recoverable from `reference/` — but only if `reference/` survives. **Never delete both copies.**
   ⚠️ **And note the asymmetry §28.1 does not state: only 12 of the 37 `reference/` PNGs are duplicated. The other 25 exist in exactly one place, with no second copy and no recorded hash.** Provenance is *proven* for 12 and *unproven* for 25. Those 25 are the most irreplaceable files in the tree and have the least protection — **Phase A2 should hash and back them up before anything else.**
6. **All 36 `implementation-notes.md` and `screen.md` files** — the only per-screen record of recorded deviations.
7. **All 36 `SCREENSHOT_REQUIRED.txt` files, including the contaminated AUTH-01 one** — each is the only per-folder record of the exact Figma node to re-export from.
8. **The 12 migrations** and everything under `supabase/`.
9. **Accepted evidence** — `_g6-activation-evidence/`, `_c4-lifecycle-evidence/`, `_f17-disposable-evidence/`, `UI_REFERENCE_FINAL_MVP/_checkpoint-evidence/`.
10. **The frozen demo — `SDS Project Sprint 2/` @ `8d4acf4`.** Doubly protected: it is both the frozen baseline **and** the Sprint 2 artefact underpinning the continuity narrative the Deliverables PDF requires (§25.1). *(Precisely: Sprint 2 was assessed in Week 9, so deleting this folder does not destroy a graded artefact — it destroys the evidence for the continuity requirement. An earlier draft overstated this.)*
11. **✅ UPDATED 2026-08-08 (Final MVP Phase A2) — THE PHYSICAL DIRECTORIES HAVE BEEN REMOVED, WITH OPERATOR APPROVAL. THE BRANCHES AND COMMITS ARE PERMANENTLY PRESERVED.**

    **The durable anchors — record these SHAs; they are the point of this entry:**

    | Branch | Commit | Annotated tag |
    |---|---|---|
    | `feat/48h-backend` | `402b0b6f25828775bcc2a3d30f418b90b898aa80` | **`frozen/48h-backend-402b0b6`** |
    | `feat/48h-frontend` | `6762b5c59d41cdeaaaa0bc410a4fe28a1d31cebe` | **`frozen/48h-frontend-6762b5c`** |

    **Why the tags exist.** Git refuses to delete a branch that is checked out in a worktree. **Removing the worktree lifts that protection**, and because both branches are fully merged into `main` (0 commits ahead), a plain `git branch -d` would then succeed **with no warning and no force flag**. The tags make these commits reachable **independently of the mutable branch refs**. *(This record was mandated by the Phase A2 cleanup manifest's own precondition 6 and was initially left unwritten — caught by adversarial review.)*

    **Also preserved:** portable git bundles containing all branches and tags, verified *"records a complete history"*, stored at **two** independent preservation snapshots. Historical content remains readable via `git show <branch>:<path>` — e.g. `git show feat/48h-backend:docs/progress/STATUS.md` returns 121,648 bytes.

    **Everything below still stands and is UNCHANGED:** both remain **`CLOSED_BY_NONUSE_POLICY`** — **neither may be used for ANY future Final MVP implementation**, and neither's stale governance corpus may be treated as current. All future parallel worktrees are created **fresh from the accepted `main` baseline**, after `FINAL_MVP_EXECUTION_PLAN.md` is established. **Neither branch may be deleted.**

    *Historical text follows.* ~~**`worktrees/backend-48h` and `worktrees/frontend-48h`** — untouched, and must remain so.~~ **⚠️ EXTENDED BY OPERATOR RULING, 2026-08-08 — `CLOSED_BY_NONUSE_POLICY`.** Both are **HISTORICAL / FROZEN IMPLEMENTATION ARTEFACTS**. Beyond the existing no-touch protection, **neither may be used for ANY future Final MVP implementation**, and **neither's stale `CLAUDE.md`, `STATUS.md` or other governance files may be modified** — their corpora predate the Phase A corrections and the OD-4 ruling, so a session launched inside one would load a superseded contract. **All future parallel implementation worktrees are created fresh from the accepted `main` baseline, after Phase A2 and after `FINAL_MVP_EXECUTION_PLAN.md` is established.** **Phase A2 is authorized to inspect them READ-ONLY and classify them**, and may later **propose** removal of the physical directories only on proof of all five conditions — branches/commits still reachable from the main repository · no unique required evidence exists only inside the physical worktree · no effect on the frozen demo · included in the cleanup manifest · **explicit Operator approval**. **Removal is NOT authorized by that ruling.** Full text: `CLAUDE.md` §14.3a.
12. **Historical audit evidence and provenance** — the `AUTONOMOUS_48H_*` family, `CHANGE_LOG.md`, the migration tracker, `governance-source/`. These are **cumulative successor records, not superseding**; no file in the pack declares itself or any other superseded.
12a. **⚠️ THE SOLE-COPY GOVERNANCE DOCUMENTS — never delete, move, rename or archive one.** ✅ **RATIONALE UPDATED 2026-08-08 (repository-boundary normalization): ~~none of these is in any git repository, so none is recoverable after deletion~~ — every item below except the two that remain at the workspace root is now TRACKED, so byte-level git recovery exists.** **The prohibition is UNCHANGED and absolute** — it never rested only on irrecoverability: these are sole-copy instruments whose *content* has no second source, and git preserves only what it was given. An earlier draft protected the migrations and the screen packs while leaving these unlisted:
   - **`UI_REFERENCE_FINAL_MVP/FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md`** — the **sole** enumeration of conflicts **GC-1…GC-14** (which §28.2 declares authoritative), of screen-plan open decisions **OD-1…OD-6** (**OD-4 is now RULED — §15.1**), and of the **C2C** defect register. Losing it loses the only copy of all three.
   - **`UI_REFERENCE_FINAL_MVP/UI_REFERENCE_CLEANUP_MANIFEST.md`** — the sole record of open rulings **R1…R7** and of the empty-archive determination.
   - **`UI_REFERENCE_FINAL_MVP/GLOBAL_UI_RULES.md`** — the rule forbidding frame fabrication and undispositioned asset copying.
   - **`UI_REFERENCE_FINAL_MVP/UI_PACK_MANIFEST.json`** and **`SCREEN_INDEX.md`** — the two independent Figma node records on which §31.1's AUTH-01 reconstruction path depends. **If both are lost, AUTH-01 cannot be reconstructed at all.**
   - **`UI_REFERENCE_FINAL_MVP/CORE_SCREENSHOT_VALIDATION_REPORT.md`** — subject of C-10 and source of the 12-file SHA verification.
   - **`FINAL_MVP_SUBMISSION_READINESS_PLAN.md`** and **`FINAL_MVP_PHASE_A_GOVERNANCE_RECONCILIATION.md`** — classified ACTIVE_SUPPORTING in §29. ✅ **RELOCATED 2026-08-08 to the repository root** by the repository-boundary normalization; ~~(workspace root)~~. **They are now git-tracked, so the "ungit'd" premise of this §31.12a bullet no longer applies to them** — the protection against deleting, moving, renaming or archiving them is **unchanged and still binding**.
   - **`complete mvp screens compiled figma list.txt`** (workspace root) — 33 Figma node URLs. *Lower priority: redundantly preserved in `docs/plan/FIGMA_DESIGN_2_SCREEN_IMPLEMENTATION_MATRIX.md`, which item 2a already covers.*
13. **Preserved foreign coursework — until independent backup is verified.** See §31.1.

### 31.1 PA-OD-8 — foreign-content preservation policy, RATIFIED

**The finding.** `UI_REFERENCE_FINAL_MVP/AUTH-01-trainer-login/SCREENSHOT_REQUIRED.txt` — 1,792 bytes, SHA-256 `30d7ba77cf0559a34725472729f7ae727d108ff565ed6e6c6e2893db0d3c993a` — contains a foreign **"SPORTSTER"** platform-strategy essay belonging to a different module. Separately, `00-PeakPalate-Master.mp4` (58,387,212 bytes) sits at the **workspace root**, not in the UI tree, and matches no project artefact.

**Blast radius is exactly one file.** `reference/` is completely clean — zero contamination hits across all its files. **No PNG or HTML is contaminated anywhere.** Critically, `AUTH-01-trainer-login` is a **sibling of `reference/`, not a member of it**, so the contaminated file sits in a directory that is not independently authoritative — and `AUTH-01`'s visual authority is intact and independently recoverable from `reference/`, byte-identical. **Nothing authoritative was lost**; the contamination destroyed only a Figma export instruction, and that node ID is preserved in two other places.

**The policy, binding on Phase A2:**

1. **Preserve source bytes until independent backups exist.** Nothing is destroyed.
2. Before any deletion, create **TWO verified preservation copies OUTSIDE** the B.E.S.T-Coach-Workspace, in genuinely independent locations where available.
3. Compute SHA-256 for the **original, copy 1 and copy 2**, and **verify byte identity of the copies** — not merely of the original.
4. Record only **safe preservation metadata** in the Phase A2 cleanup manifest — never the foreign content itself.
5. Reconstruct the legitimate B.E.S.T `AUTH-01` reference **only from valid B.E.S.T authority** (the recorded Figma node), never by editing the foreign text.
6. **Removal from the active workspace occurs ONLY AFTER** two copies are verified, the manifest is produced, **and the operator explicitly approves cleanup**.
7. Foreign material must **never be pushed into the B.E.S.T repository** — this is a hard precondition on the GitHub Classroom submission (§25.6), which is a **graded, potentially public** repository.
8. Foreign material must **not remain mixed into authoritative B.E.S.T Final MVP UI material** after approved cleanup.
9. ✅ **`00-PeakPalate-Master.mp4` — RULED 2026-08-08 (operator ruling OR-PA2-1 / Q-2). Its ownership question is CLOSED and it is EXEMPT from the removal half of this policy.** Final classification **`FOREIGN_REFERENCE_RETAINED_BY_OPERATOR`**; action **`KEEP_IN_PLACE`**. It is foreign to B.E.S.T and is **not** a 60.004 submission artefact, but the operator **intentionally retains it** as reference material for separate later work. **It must NOT be deleted, removed, moved, renamed, archived, transcoded or altered**, and it stays at its existing workspace-root path with bytes unchanged. It was backed up to **both** Phase A2 preservation snapshots as ordinary retained reference material. It remains **excluded from B.E.S.T authority, the B.E.S.T repository and B.E.S.T submission packaging**, and is **not authoritative for B.E.S.T**. ⚠️ **Its continued presence must never be reported as unresolved contamination.** ~~Its ownership is an **outstanding operator question** — it may be the operator's own work from another module, or it may not.~~

**No preservation copy was created during this run** — no such non-destructive action was separately authorized. The policy is locked; execution belongs to Phase A2.

### 31.2 ⚠️ The binding sequencing constraint

**No automated cleanup may run over `UI_REFERENCE_FINAL_MVP` until the AUTH-01 incident is resolved.**

⚠️ **The justification must be stated at the correct scope, because the stronger version is false.** The contaminated file is **NOT** the newest file in the pack. Measured 2026-08-07: it is **sixth**, behind `CORE_SCREENSHOT_VALIDATION_REPORT.md` (19:53), `FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md` (19:00), `UI_REFERENCE_CLEANUP_MANIFEST.md` (18:54), `AUTONOMOUS_48H_EXECUTION_TRACKER.md` (13:05) and `_checkpoint-evidence/F17/gate-ledger.md` (07:17). *(This exact overstatement was identified and struck in the previous Phase A pass and then **re-introduced** into an earlier draft of this lock. It is recorded here so it is not re-introduced a third time. The source manifest contradicts itself on the same page, naming a 07:17 neighbour and then asserting "newest in the entire pack" regardless.)*

**What is true, and still sufficient:** it is the newest file **within its own pack folder**, and the newest among the **36 screen-pack folders**. A cleanup pass that ranks *within* a pack folder by mtime — a natural way to pick a "current" artefact — would select the SPORTSTER contamination over genuine material.

**The binding rule is therefore unchanged:** Phase A2 must resolve the incident first, then sort by content and governance status, **never by mtime at any scope.**

**Three further cleanup-manifest rulings remain open and must be routed, not dropped** (an earlier draft resolved R1–R4 and silently omitted the rest):

- **R5 — 11 stale `SCREENSHOT_REQUIRED.txt` trailers** claim `Missing` for screens that *do* have a validated reference, contradicting `SCREEN_INDEX.md`. ⚠️ **This directly undercuts §31.7's rationale for protecting those files**: some of them assert the opposite of the truth. Protect them still — but Phase A2 must reconcile the trailers rather than trust them.
- **R6 — `UI_PACK_MANIFEST.json` declares `referenceScreenshot` for all 36**, including the 24 that have none, so any machine consumer 404s on 24 paths.
- **R7 — open.**

**The prior audit's proposed archive manifest is deliberately EMPTY, and that is the correct outcome.** Applying its own rules — never archive authoritative final material, ambiguous files, accepted sprint evidence, or anything another file references — eliminated every candidate. **For `UI_REFERENCE_FINAL_MVP`, the correct Phase A2 action is to delete nothing.** The two real actions are: **rename the two `.txt` renders to `.html`**, and **resolve the AUTH-01 incident**.

---

## APPENDIX — RESIDUAL ITEMS THAT DO NOT BLOCK THIS LOCK

These are recorded so nothing is lost.

~~⚠️ **One exception, added after review: `OD-4` (§15.1) IS a genuine operator decision, and it is time-boxed.** It does not block this lock — the governed panel names are already implemented and are what §15 ratifies — but it becomes **irreversible once `report_versions` holds a row**, and it is the one item here that a later ruling cannot recover.~~ ✅ **RULED 2026-08-07 — `OD-4` IS CLOSED.** The operator ratified *Overview · Strengths · Areas for Development · Remarks* as the Final MVP report semantics, inside the time-box, while `report_versions` was still empty. See §15.1 and `FINAL_MVP_OD4_REPORT_SEMANTICS_RULING.md`. **What remains is a registered Phase B implementation migration, not an open decision** — with two genuine Phase B sub-rulings inside it (the content-hash envelope version; the grounding rule-4 re-derivation). Everything else below is an operator-held fact, a human action, or a Phase B implementation choice.

| Item | Nature | Urgency |
|---|---|---|
| ~~**Discuss the non-GCP deployment approach with the teaching team in advance** (§22.4)~~ ✅ **CLOSED 2026-08-08** | `OPERATOR_CONFIRMED_TEACHING_TEAM_DEPLOYMENT_APPROVAL` — Vercel + hosted Supabase accepted. ⚠️ **Operator-reported external confirmation; no workspace documentary evidence exists and none may be fabricated** | ~~HIGHEST~~ **NONE — resolved** |
| ~~**⚠️ `OD-4` — the four parent panel headings** (§15.1)~~ ✅ **CLOSED — RATIFIED 2026-08-07** | ~~Genuine operator decision, IRREVERSIBLE once `report_versions` is non-empty~~ → **Ruled inside the time-box; now a registered Phase B migration** (`FINAL_MVP_OD4_REPORT_SEMANTICS_RULING.md`) | ~~HIGHEST~~ → **Migrate while `report_versions` is still empty** |
| **The Design Workbook and the design-process artefacts** (§25.6) | Submission component 1 of 6, absent from the workspace | **HIGHEST — where the marks are** |
| Student-photo capture surface is PDPA-live (§8.2) | Phase B ruling; interacts with §20.4 | High |
| Screen-plan `R5`/`R6`/`R7` cleanup rulings (§31.2) | Phase A2 rulings | Medium |
| `C2C-006` refusal-copy honesty defect on screen 08 (§28.7) | Phase B fix | Medium |
| **Begin usability-participant recruitment** (§26.5) | Human action; longest lead time in the project, gated on nothing | **HIGHEST** |
| Team number for `SDS-2026-Team-XX` (§25.6) | Operator-held fact | High |
| Exact submission deadline and final-presentation duration (§25.4) | Must come from the official course channel | High |
| ~~`00-PeakPalate-Master.mp4` ownership (§31.1)~~ ✅ **CLOSED 2026-08-08 (OR-PA2-1 / Q-2)** | **`FOREIGN_REFERENCE_RETAINED_BY_OPERATOR` · `KEEP_IN_PLACE`.** Foreign to B.E.S.T and not a submission artefact, but **intentionally retained** by the operator for separate later work. Byte-identical, unmoved; backed up to both snapshots; **excluded from B.E.S.T authority, repo and submission** | **NONE — resolved.** Its presence is **not** unresolved contamination |
| LLM region / DPA (§20.5) | Phase B decision; dormant under synthetic data | Medium |
| `500MB` vs `50MiB` evidence size limit (§21) | Phase B ruling | Medium |
| Membership-less sweep of all 25 `authenticated` RPCs (§5.2) | Test gap — never executed | Medium — before hosted go-live |
| `scan_status` vocabulary (§8) | Phase B ruling; must come from authority, not invention | Medium |
| Attendance-toggle design disposition (§7) | No frame exists; needs explicit disposition | Medium |

---

**END OF AUTHORITY LOCK**

*Created by the main orchestrator, 2026-08-07, from the reconciled evidence of eight parallel read-only subagents, then subjected to an independent adversarial falsification pass and two independent final reviews. Direct first-hand verification was performed on both canonical PDFs, the live database catalogue, the migration set, the UI reference tree and the route list.*

*Every **schema and filesystem** count in this document was verified against the running database or the filesystem. **Two figures are not independently verifiable and are flagged as such at §25** (the 146/135 requirement aggregates). Where an earlier draft of this lock was found to be wrong, the correction is recorded inline with what the draft said — the errors are not silently removed, because a baseline that hides its own revision history cannot be audited.*

**Review history — three independent adversarial passes, and every one found real defects.**

*Pass 1 (falsification):* the R-27 grant analysis and the ratified transport shape (§18) · the residual-risk disclosure (§18.2a) · the membership-less-identity proof (§5.2) · the three declared C4 deviations (§27.2) · the functional-conflict count, twelve → **fourteen** (§28.2) · A-004's stood-down leg (§8) · the manufactured A-038 blocker, removed (§8) · omitted canonical requirements restored (§25.3a) · the ladder-preserving document classification (§29) · the specification and `CLAUDE.md` added to the protection list (§31).

*Pass 2 (UI / submission / usability / cleanup):* **the time-boxed `OD-4` panel-heading decision, absent entirely (§15.1)** · the AUTH-01 mtime premise, false and **re-introduced after being struck once before** (§31.2) · `reference/` as an undeclared bulk import with **R2 unresolved**, and provenance proven for 12 of 37 only (§28.1) · **three further upload surfaces including a PDPA-live student photo** (§8.2) · two missed parent leaks — `Parent - Dashboard.md:20` and `Parent - Calendar.md:23` (§15) · a still-live *"human-equivalent"* claim that cannot be corrected (§26.4) · the ungit'd governance documents added to protection (§31.12a) · `C2C-006` (§28.7) · rulings R5–R7 routed (§31.2) · the Alternative Deployment eligibility reading corrected to the narrower one (§22.3).

*Pass 3 (governance / security / hosted):* ⚠️ **the PA-OD-9 break condition stated in the wrong direction, and the `NOINHERIT` blind spot that makes the dangerous grant invisible to every assertion in the repository (§18.5)** · `FINAL_MVP_SUBMISSION_READINESS_PLAN.md:202` wrongly marked superseded when it states the ratified design (§18.3, §29) · **A-003's permitted leg, missed in the same sentence where A-004's was corrected (§8)** · the subject-verification narrowing adopted into the design (§18.2.1a) · the 19-vs-25 RPC proof (§5.2) · `report_list_management_submitted`'s authority downgraded from "documentation gap" to **"an unanswered blocking question built through"** (§19.3) · the §23.2/§18.2a network-restriction contradiction (§23.2) · the capability statement de-overstated (§18.2a) · plus locator, citation and provenance corrections throughout.

**Every correction is recorded inline with what the superseded draft said.** A baseline that hides its own revision history cannot be audited, and three passes each found errors the previous one missed.
