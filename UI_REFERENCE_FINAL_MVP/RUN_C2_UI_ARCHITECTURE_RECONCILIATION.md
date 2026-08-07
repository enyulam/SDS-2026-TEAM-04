# Run C2 — UI Architecture Reconciliation Matrix (Phase C2-C)

**Date:** 2026-08-06
**Run / phase:** Autonomous 48H Run C2, Phase C2-C (read-only architecture audit and reconciliation)
**Authorship:** Synthesis agent, Phase C2-C, consolidating five independent read-only slice auditors (Trainer, Management, Parent, Routing/Navigation, Governance/Lifecycle).
**Repository audited:** `SDS Project Final (BEST Coach)` on `main`.
**UI / evidence pack:** `UI_REFERENCE_FINAL_MVP`.

## Implementation statement — read this first

**This run IMPLEMENTED NONE of the findings in this document.**

Phase C2-C was strictly read-only. No application source, route, component, migration, screen file, screenshot or governance record was created, modified or deleted by this phase. No build, dev server, test suite, browser or database command was run. The single file written by this phase is this document.

**The one exception, which is not a finding here:** the server-side complete-assessment save creating a report shell, and the screen 07 → screen 08 navigation using the returned real report id, are **in flight under Run C2 Phase C2-A** as a separately authorized narrow change. That transition is recorded at **C2C-046** as *in flight*, not as an open defect, and no disposition is requested for it.

---

## 1. Scope and method

### What was read

| Category | Sources |
|---|---|
| Governing contract | `CLAUDE.md` (grepped by topic: §0, §4, §5, §6, §6.1, §7, §11 and the A-018 / A-026 / A-030 / A-033 – A-038 / A-040 / A-044 / A-046 / A-049 – A-055 clauses) |
| UI pack authority | `48H_CORE_SLICE.md`, `SCREEN_INDEX.md`, `GLOBAL_UI_RULES.md`, `FRONTEND_RECONSTRUCTION_PLAN.md`, `FRONTEND_RECONSTRUCTION_TRACKER.md` (including the target-versus-actual block beneath Table A), `AUTONOMOUS_48H_RUN_C1_REPORT.md`, `AUTONOMOUS_48H_RUN_B_FINAL_REPORT.md`, per-screen `screen.md` and `implementation-notes.md` for screens 01, 05–11, 19, 29–33 and AUTH-01/02/03 |
| Repository docs | `docs/plan/STEP_7I_REPORT_LIFECYCLE_BASELINE.md`, `docs/progress/STATUS.md`, `docs/plan/*` as cited per finding |
| Application source | all 17 census routes and their `page.tsx`; all five `layout.tsx`; `proxy.ts`; `components/layout/portal-shell.tsx`; `components/ui/state-panel.tsx`, `status-pill.tsx`, `icon.tsx`, `loading-skeleton.tsx`, `brand-mark.tsx`; all `features/{auth,trainer,management,parent,portal}/*`; `server/modules/{identity-access,report-workflow,observation,management-view,parent-view,integration-adapter}/*`; `server/contracts/action-result.ts`; `lib/frontend/{physical-test-port.ts,contracts/physical-test.ts,adapters/*,fixtures/*}` |
| Database (as text only) | `supabase/migrations/*.sql` — read as files; **no database was queried** |
| Tests (as text only) | `tests/frontend/*.mjs`, `scripts/tests/step-7i/lifecycle-canonical.sql` — read as files; **no test was executed** |

### What was NOT done

- No build, dev server, browser, Chrome/CDP session, screenshot capture or DOM measurement.
- No database, `psql`, `docker exec`, Supabase CLI or migration execution. Every SQL claim is a claim about **file text**, not about observed database behaviour.
- No test execution. Every "test exists" claim is a claim that a named assertion appears in a file.
- **No `reference.png` was opened.** Every "Figma intent" column in this document is taken from the **textual** record — `screen.md` §1–§10, `implementation-notes.md` deviation blocks, tracker Table A/D, `48H_CORE_SLICE.md` — never from pixels. Claims that rest on a frame's visual content are marked accordingly and appear in §9 Rejected claims or §10 Undetermined where they could not be sourced textually.
- No visual-fidelity, contrast or viewport verification of any kind.

### Verification discipline applied by this synthesis

Every **Critical** and **High** finding, and **every finding touching ruling R-C2-3**, was independently re-read in the cited file by this agent before publication. Claims that survived verification are published with the verbatim line quoted. Claims that did not survive verbatim verification were corrected in place or moved to §9 Rejected claims. Nothing in §4–§7 is published on an auditor's word alone.

### Binding ruling in force

> **R-C2-3 (operator, Run C2).** Management has exactly ONE primary Reports destination: `/management/reports`. Pending and Approved are INTERNAL page filters or tabs. Two separate primary sidebar destinations for Pending and Approved are PROHIBITED. Deep links may use query parameters or governed internal state but MUST render inside the same centralized Reports page with ONE active sidebar item.

### Route census used as ground truth

The 17 routes supplied by the operator were treated as the verified census. No finding in this document assumes a route outside that census exists.

---

## 2. Summary index

Disposition key: **MF** = must match Figma · **GOF** = governance overrides Figma · **ACA** = approved compatibility alias · **DEF** = defect requiring correction · **DEFER** = deferred outside the 48-hour sprint.

| id | area | severity | classification | disposition | operator approval needed |
|---|---|---|---|---|---|
| **C2C-001** | Management sidebar — two primary Reports destinations (R-C2-3) | Critical | structural | DEF | No |
| **C2C-002** | Sidebar active-item computation — dead ternary, two active / zero active | High | functional | DEF | No |
| **C2C-003** | Mobile header nav — duplicated rail, no active state | Medium | routing | DEF | No |
| **C2C-004** | Management Reports — no Approved/`submitted` filter and no projection behind one | High | functional | DEF | **Yes** |
| **C2C-005** | Management Reports — unknown `?status=` renders a denial panel | Medium | routing | DEF | No |
| **C2C-006** | Management Reports — `?status=needs_edit` selector misnames the rows it renders | Medium | functional | DEF | **Yes** |
| **C2C-007** | `/trainer/reports` — bare canonical route refuses to render | High | routing | DEF | **Yes** |
| **C2C-008** | Screen 08 — governed `requestDraft` auto-fires on mount | High | functional | MF | No |
| **C2C-009** | Screen 08 — stale-state failure branch asserts untrue lifecycle facts | High | functional | DEF | No |
| **C2C-010** | Screens 05/06 — no session-start eligibility anywhere on the Trainer surfaces | Critical | functional | DEF | **Yes** |
| **C2C-011** | Screen 07 — assessment surface not gated on entry (attendance / start) | High | functional | DEF | No |
| **C2C-012** | Post-login destination — Management and Parent land on deferred dashboards | High | routing | MF | **Yes** |
| **C2C-013** | Parent cross-family RLS negative test does not exist | High | functional | DEF | **Yes** |
| **C2C-014** | Governance record — CLAUDE.md §5 and STATUS.md assert Amendment 006 unimplemented | High | structural | DEF | **Yes** |
| **C2C-015** | Screen 05 — schedule opens on the earliest assigned session, not today | Medium | functional | DEF | No |
| **C2C-016** | Screen 10 — breadcrumb sends every report into the correction queue | Medium | routing | DEF | No |
| **C2C-017** | Screen 07 — no breadcrumb, unlike its three sibling nested routes | Medium | structural | MF | No |
| **C2C-018** | Trainer copy — "This fixture…" rendered as fact in the participant build | Medium | functional | DEF | No |
| **C2C-019** | Screen 10 — "immutable fixture version" save banner in the participant build | Medium | functional | DEF | No |
| **C2C-020** | `?preview=` parameters suppress governed data in the participant build | Medium | functional | DEF | No |
| **C2C-021** | Screen 10 — `needs_edit` with no open correction is a dead end with a false reason | Medium | functional | DEF | **Yes** |
| **C2C-022** | Trainer rail — "Returned reports" label exists in no frame and no inventory row | Medium | structural | GOF | **Yes** |
| **C2C-023** | Parent portal — no sign-out control anywhere in the application | Medium | functional | DEF | **Yes** |
| **C2C-024** | No route-level `error.tsx` / `not-found.tsx` anywhere in `app/` | Medium | functional | DEF | No |
| **C2C-025** | Malformed dynamic route parameters render a second, distinguishable failure panel | Low | functional | DEF | No |
| **C2C-026** | Screen 19 — review/edit breadcrumb loses the originating filter; editor has none | Low | visual | DEF | No |
| **C2C-027** | Screen 33 — no return affordance from the report back to the list | Low | visual | DEF | No |
| **C2C-028** | Trainer schedule/roster — a null clock time renders as "12:00 AM" | Low | visual | DEF | No |
| **C2C-029** | `StatePanel` defaults to `/trainer`; two Suspense boundaries render blank | Low | structural | DEF | No |
| **C2C-030** | `approved` carries a user-facing label ("Finalising") for a never-committed state | Low | visual | DEF | No |
| **C2C-031** | `trainer_approved` is labelled two different ways inside the Management portal | Low | visual | DEF | No |
| **C2C-032** | Management pending-review projection is O(sessions × students) per page view | Low | functional | DEFER | **Yes** |
| **C2C-033** | Parent report enumeration fans out per session and runs twice on the dashboard | Low | functional | DEFER | No |
| **C2C-034** | T12 `submitted → needs_edit` has no UI path; `submitted` reads as terminal | Low | functional | DEFER | **Yes** |
| **C2C-035** | Parent portal — all seven prohibited classes are NEVER FETCHED | Informational | functional | GOF | No |
| **C2C-036** | Management review/editor — governance boundary over assessment substance HELD | Informational | functional | GOF | No |
| **C2C-037** | R-7b silent byte-identical rejection is enforced server-side | Informational | functional | GOF | No |
| **C2C-038** | Trainer approval publishes nothing; Approve & Submit is the sole publisher | Informational | functional | GOF | No |
| **C2C-039** | Hash, version and audit exposure closed on Management and Parent surfaces | Informational | functional | GOF | No |
| **C2C-040** | Parent — unsubmitted content unreachable by construction; denial non-disclosing | Informational | functional | GOF | No |
| **C2C-041** | AUTH-01/02/03 — `?role=` presentation-only; two independent server guards | Informational | functional | GOF | No |
| **C2C-042** | Six canonical target routes named in Table A have never existed | Informational | routing | DEFER | No |
| **C2C-043** | `/trainer`, `/management`, `/parent` compatibility aliases | Informational | routing | ACA | No |
| **C2C-044** | `derived_assessment_fact` frontend spelling of `assessment_fact` | Informational | functional | ACA | No |
| **C2C-045** | Screens 30/31/33 canonical-route divergences are ratified-deferred | Informational | routing | DEFER | No |
| **C2C-046** | Screen 07 → 08 first-report creation — **in flight under Run C2 Phase C2-A** | Informational | functional | DEFER | No |
| **C2C-047** | Route graph is closed — 17 routes, 0 orphans, 0 dead targets | Informational | routing | GOF | No |
| **C2C-048** | Management queue columns/filters with no governed source, correctly withheld | Informational | visual | DEFER | No |

---

## 3. Severity and disposition counts

**Total published findings: 48.**

### By severity

| Severity | Count |
|---|---|
| Critical | 2 |
| High | 8 |
| Medium | 12 |
| Low | 12 |
| Informational | 14 |

### By disposition

| Disposition | Count |
|---|---|
| defect requiring correction | 24 |
| governance overrides Figma | 8 |
| deferred outside the 48-hour sprint | 8 |
| must match Figma | 4 |
| approved compatibility alias | 2 |
| *(informational clean records are counted within the above)* | — |

### By classification

| Classification | Count |
|---|---|
| functional | 26 |
| routing | 10 |
| structural | 6 |
| visual | 6 |

### Operator approval still required

**12 findings** carry `operator approval needed = Yes`: C2C-004, C2C-006, C2C-007, C2C-010, C2C-012, C2C-013, C2C-014, C2C-021, C2C-022, C2C-023, C2C-032, C2C-034. These are consolidated in §11.

---

## 4. THE MANAGEMENT CENTRALIZED REPORTS DISPOSITION

This section is the operator-facing verdict on ruling R-C2-3. Three of the five auditors (Management, Routing, Governance) raised it independently; all three were re-verified line-by-line by this agent against the live source.

### 4.1 What R-C2-3 requires

1. Exactly **one** primary Reports destination in the Management sidebar: `/management/reports`.
2. Pending and Approved are **internal page filters or tabs**, not destinations.
3. Two separate primary sidebar destinations for Pending and Approved are **prohibited**.
4. A deep link may carry a query parameter or governed internal state, but must render **inside the same centralized Reports page** with **ONE active sidebar item**.

### 4.2 What the implementation actually does — verified verbatim

**The page half of the ruling is already SATISFIED.** `/management/reports` is a single route. Its sub-state is chosen by an internal filter chip rendered inside the page, and the chip navigates by query parameter onto the same route:

- `features/management/management-reports-queue.tsx:78` — `const status = searchParams.get("status") ?? "trainer_approved";` (the page has a working default, so a bare `/management/reports` renders).
- `:167-179` — a single `FilterChip` labelled "Queue status" whose `onChange` runs `router.push(`/management/reports?status=${next}`)`, with options `{trainer_approved: "Pending final review"}` and `{needs_edit: "Correction tracking"}`.
- `:90-92` — the two governed projections are selected by that same parameter: `status === "needs_edit" ? port.listManagementCorrectionTracking() : port.listManagementPendingReviews()`.

**The sidebar half of the ruling is VIOLATED.** `components/layout/portal-shell.tsx:69-89` declares three Management rail items, of which **two are Reports destinations**:

```
{ href: "/management",                              label: "Dashboard",      path: "/management",         exact: true, icon: "dashboard" },
{ href: "/management/reports?status=trainer_approved", label: "Pending review", path: "/management/reports",             icon: "reports"   },
{ href: "/management/reports?status=needs_edit",       label: "Corrections",    path: "/management/reports",             icon: "document"  },
```

No item is labelled "Reports". Both Reports items are rendered as top-level `<Link>` entries inside the single `<nav aria-label="Management navigation">` at `:190`, visually indistinguishable in weight from Dashboard. The identical pair is emitted a second time in the `lg:hidden` mobile header at `:230-238`.

**The active-item requirement is VIOLATED in both directions**, because of one line:

```
portal-shell.tsx:192   const active = item.exact ? pathname === item.path : pathname === item.path;
portal-shell.tsx:197   aria-current={active ? "page" : undefined}
```

Both ternary branches are the identical expression. Consequently:

- On `/management/reports` (under **either** `?status=` value), **both** Reports items evaluate `active === true` — they share `path: "/management/reports"` — so **two** elements carry `aria-current="page"` and **two** render the active `bg-brand-100 text-brand-800` treatment. R-C2-3 requires one.
- On `/management/reports/[reportId]/review` and `/management/reports/[reportId]/edit` the pathname is not equal to `/management/reports`, so **zero** rail items are active. R-C2-3's "deep links … MUST render … with ONE active sidebar item" is therefore unachievable for any Reports sub-state today.

**A third, non-violating duplication exists and should not be confused with the ruling.** `features/management/management-dashboard.tsx:71-82` renders two in-page `QueueCard`s pointing at the same two query URLs. These are page content, not sidebar destinations, and R-C2-3 speaks to the rail. They are recorded here for completeness only; they become mildly redundant once the rail collapses but are not prohibited.

### 4.3 The precise change that would satisfy R-C2-3

Three edits, all in one file, plus one label:

1. **`components/layout/portal-shell.tsx:77-88`** — replace the two entries with one:
   `{ href: "/management/reports", label: "Reports", path: "/management/reports", icon: "reports" }`.
   No `?status=` on the rail href — the page's own default at `management-reports-queue.tsx:78` supplies `trainer_approved`.
2. **`components/layout/portal-shell.tsx:192`** — make the two branches differ so `exact` becomes load-bearing:
   `const active = item.exact ? pathname === item.path : pathname === item.path || pathname.startsWith(item.path + "/");`
   This keeps Dashboard (`exact: true`) matching only `/management`, and makes the single Reports item active across `/management/reports`, both `?status=` filters, `/review` and `/edit`.
3. **`components/layout/portal-shell.tsx:230-238`** — derive the mobile header's active state from the same computation and emit `aria-current` there too. The mobile duplication of the two Reports items resolves automatically, since both blocks map the same `config.navigation` array.

**What must NOT be done:** no second route may be created; the two `?status=` values must remain working deep links (they are ratified compatibility aliases at `29-management-reports/screen.md:18`); and the two governed projections must be neither widened nor narrowed.

**Cost and risk.** The rail and the active computation are centralized: `PortalShell`, `ManagementPortalShell` and `ParentPortalShell` (`portal-shell.tsx:106-116`) are three one-line wrappers over a single `RolePortalShell`. R-C2-3 compliance is therefore a **single-site change**, and the same line-192 fix simultaneously repairs the zero-active-item condition on the eight deep routes across all three portals. A grep of `tests/` and `scripts/` surfaced no assertion pinning the labels "Pending review" or "Corrections", so no test breaks on the relabel.

### 4.4 The open half of the ruling — "Approved"

R-C2-3 names **"Pending and Approved"** as the internal filters. The implementation has **no Approved filter and no projection capable of backing one** (verified: `features/management/management-reports-queue.tsx:79` accepts only `trainer_approved` and `needs_edit`; `lib/frontend/physical-test-port.ts:71-76` declares only `listManagementPendingReviews()` and `listManagementCorrectionTracking()` for Management). Under A-036 the governed referent of "Approved" can only be `submitted`, since `approved` never commits. **Two auditors disagreed on whether this is a defect** — the Management auditor reported it High; the Routing auditor explicitly declined to report it, citing `29-management-reports/screen.md` §5/§10, which require only that pending review and correction tracking "are both represented". This synthesis publishes it as **C2C-004, High, operator approval required**, and records the disagreement rather than resolving it. It is the single largest functional gap in the Management flow: after Approve & Submit, no Management surface can show the report that was just published.

---

## 5. Findings — Trainer portal

### C2C-010 — Screens 05/06: no session-start eligibility anywhere on the Trainer surfaces

| | |
|---|---|
| **Area / screen** | Screen 05 Trainer Schedule (`/trainer/schedule`), continuing into screen 06 roster entry |
| **Figma intent** | `48H_CORE_SLICE.md` and `05-trainer-schedule/screen.md` describe node `591:9` as a Day/Week/Month calendar with a Schedule Details panel and a primary per-session action, implying the trainer picks the session happening now. **No frame draws a locked session** — the frozen frames were not opened by this audit. |
| **Governed intent** | Spec v3 §297 / §26: "future sessions are locked for assessment". The database enforces it: `supabase/migrations/20260805090500_step_7i_report_lifecycle.sql:738` (and :842, :950, :1082, :1391, :1750) `RAISE EXCEPTION USING ERRCODE = 'BC017', MESSAGE = 'report: the scheduled session start has not been reached'`; `20260806090000_assessment_governed_persistence.sql:263` the BC104 twin. `GLOBAL_UI_RULES` §7 requires these to be designed states, not generic errors. |
| **Current implementation** | No Trainer surface distinguishes past, present or future sessions. `features/trainer/trainer-schedule.tsx:588` renders `<Link href={`/trainer/sessions/${session.sessionId}/roster`}>` with **no eligibility condition anywhere in the file**; the only `new Date()` in the file is a month fallback at `:159`. Every SessionCard is identically enabled. A trainer can enter a future session, complete all nine ratings, and only then be refused by BC104 at save time. |
| **Severity** | **Critical** |
| **Classification** | functional |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Derive past / today / future from `session.date` + `startTime` against the Asia/Singapore clock the RPCs pin; distinguish the three visually **and** in text (colour must not be the only carrier); render the roster/assess entry for a not-yet-started session as inert with the governed reason, matching the treatment already used for "Add Agenda" and "View lesson plan". Do **not** invent a session-lifecycle enum (A-026) — this is a derived time comparison, not a stored status. Leave the server gates untouched; they remain authoritative (ADR-3). |
| **Affected routes / files** | `app/(portals)/trainer/schedule/page.tsx`; `features/trainer/trainer-schedule.tsx`; `features/trainer/trainer-schedule-projection.ts` |
| **Dependencies** | None — `date`, `startTime`, `endTime` are already on `TrainerSessionSummaryDto`. Shares a clock with C2C-015. |
| **Test required** | Browser assertion that a session dated after the pinned Asia/Singapore now renders a distinguishable "not yet started" treatment with no enabled roster/assess path, and that a session dated today renders the enabled path. |
| **Operator approval needed** | **Yes** — the operator may accept the server-side BC017/BC104 refusal as sufficient for the physical test and defer the UI treatment. The spec mandates the lock but names no UI treatment. |

### C2C-011 — Screen 07: assessment surface is not gated on entry

| | |
|---|---|
| **Area / screen** | Screen 07 Trainer Grade Student (`/trainer/sessions/[sessionId]/students/[studentId]/assess`) |
| **Figma intent** | Silent — node `784:679` is recorded as drawing only the settled rubric; no locked or ineligible state is recorded in the pack. |
| **Governed intent** | `CLAUDE.md` §6 / A-018: "Absence must never create or expose a fabricated assessment or report." Spec §26: future sessions are locked. Spec §15: failure and recovery are designed experiences. |
| **Current implementation** | The route is fully reachable and fillable by direct URL for an absent learner or a future session. The load path at `features/trainer/trainer-assessment.tsx:220-264` fetches the draft and dimensions and applies **no attendance and no session-start condition** before rendering the rubric. `adapterGetAssessmentDraft` likewise applies no gate. The refusal surfaces only after the POST, as BC102 / BC104 mapped to a `validation` outcome and rendered as a generic banner. The trainer enters all nine ratings before learning the work cannot be saved. *(Correction to the source auditor's wording: attendance conditions DO exist in this file at `:756`, `:830`, `:856`, `:908` — but they govern the `ReviewApproveRail`'s list of **other** learners, not the audited learner's rubric. See §9.)* |
| **Severity** | **High** |
| **Classification** | functional |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Resolve attendance and scheduled start before rendering the rubric, and render a governed, non-disclosing ineligible state naming the reason. Server gates unchanged. |
| **Affected routes / files** | `app/(portals)/trainer/sessions/[sessionId]/students/[studentId]/assess/page.tsx`; `features/trainer/trainer-assessment.tsx`; `server/modules/integration-adapter/participant-actions.ts` |
| **Dependencies** | None — attendance is already on `RosterEntryDto`, session date/time on `TrainerSessionSummaryDto`. |
| **Test required** | Deep-link the assess route for (a) an absent learner and (b) a future session; assert the rubric is not rendered, the governed ineligible state is, and no rating control is focusable. |
| **Operator approval needed** | No |

### C2C-008 — Screen 08: governed `requestDraft` auto-fires on mount

| | |
|---|---|
| **Area / screen** | Screen 08 Trainer AI Report Generation (`/trainer/reports/[reportId]/generate`) |
| **Figma intent** | `48H_CORE_SLICE.md` screen 08: "Required user action \| Request a grounded AI draft, then store or cancel it." The frame draws a settled end state with explicit user-initiated actions. |
| **Governed intent** | `GLOBAL_UI_RULES` §1.3: screen presence is not authorization — a control authorizes a mutation, and a mutation should be initiated by a human act. A-037: every accepted content change creates a new immutable version. |
| **Current implementation** | Verified verbatim at `features/trainer/trainer-draft-generation.tsx:240-254`: a `useEffect` resolves the context and then calls `void generate(result.data)` unconditionally. There is **no Request control and no Cancel control anywhere on the surface**. Any refresh, back-navigation or deep link re-invokes a governed write. |
| **Severity** | **High** |
| **Classification** | functional |
| **Disposition** | **must match Figma** |
| **Required disposition** | Render the pre-generation state with an explicit "Generate draft" primary action and a Cancel path, firing `requestDraft` only from that click. The auto-fire must be **removed**, not debounced. |
| **Affected routes / files** | `features/trainer/trainer-draft-generation.tsx:240-254` |
| **Dependencies** | None |
| **Test required** | Load the generate route; assert no `requestDraft` call occurs until the primary action is activated, and that a second load with the draft already stored performs no write. |
| **Operator approval needed** | No |

### C2C-009 — Screen 08: stale-state failure branch asserts lifecycle facts that are untrue

| | |
|---|---|
| **Area / screen** | Screen 08, failure state |
| **Figma intent** | Silent — the frame draws only the settled end state (recorded as D10). |
| **Governed intent** | Spec §15 / `GLOBAL_UI_RULES` §7: failure states must be accurate designed experiences. `CLAUDE.md` §4 non-negotiable 1 distinguishes a grounding rejection from every other refusal. No banner may assert a lifecycle position the server did not report. |
| **Current implementation** | Re-entering `/generate` on a report already at `draft_ready` re-fires `requestDraft`, which the RPC refuses (it requires `observation_saved`), producing a `stale_state` outcome. The branch at `trainer-draft-generation.tsx:308` computes `const isValidation = state.result.outcome === "validation";` — false for `stale_state` — so `:322` renders the title **"Draft rejected safely"** and `:335` renders **"The report stayed at Observation Saved and the saved ratings, notes and follow-up are untouched. Grounding runs before the trainer sees anything…"**. Both statements are untrue for a stale-state refusal on a `draft_ready` report. The "Retry once" button renders disabled with no explanation (`:338-345`, `retryable` is false for a non-`generation_failure` outcome). |
| **Severity** | **High** |
| **Classification** | functional |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Branch on all three refusal classes (`validation`, `stale_state`, `generation_failure`) and give the stale-state case its own accurate copy plus a route to the review surface. |
| **Affected routes / files** | `features/trainer/trainer-draft-generation.tsx:300-364` |
| **Dependencies** | C2C-008 removes the common trigger but not this branch defect. |
| **Test required** | Force a `stale_state` result from `requestDraft`; assert the rendered title and body do not claim "Draft rejected safely" or "The report stayed at Observation Saved". |
| **Operator approval needed** | No |

### C2C-007 — `/trainer/reports`: the bare canonical route refuses to render

| | |
|---|---|
| **Area / screen** | Trainer reports route — also screen 09's canonical route (`SCREEN_INDEX.md`: screen 09 Trainer Reports, `/trainer/reports`, node `783:59`, Deferred) |
| **Figma intent** | The frame for screen 09 is a Trainer reports list, not a correction queue. Screen 09 is recorded Deferred. |
| **Governed intent** | A-042 fixes canonical routes and requires deep links to resolve. `09-trainer-reports/screen.md:18-19` records `/trainer/reports` as the canonical route with `?status=needs_edit` **preserved as a compatibility alias** — i.e. the query form is the alias, not the only entry. R-C2-3's principle reads the same way for a role's report list. |
| **Current implementation** | Verified verbatim at `features/trainer/returned-reports-queue.tsx:36-38`: `if (searchParams.get("status") !== "needs_edit") { return <StatePanel result={{ outcome: "unavailable" }} />; }`. The bare canonical route therefore renders "This item isn't available". The sidebar (`portal-shell.tsx:59`) and the trainer dashboard (`trainer-dashboard.tsx:92`) link **only** to the alias, so the canonical route is unreachable from any in-app control and dead if typed or bookmarked. The canonical/alias relationship recorded in `screen.md` is inverted. |
| **Severity** | **High** |
| **Classification** | routing |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Default the missing parameter exactly as the Management queue already does (`management-reports-queue.tsx:78`, `searchParams.get("status") ?? "trainer_approved"`), so the bare route renders the queue and `?status=needs_edit` demotes to the filter it is documented to be. A full screen 09 build stays Deferred scope (A-044) and is **not** required here. |
| **Affected routes / files** | `app/(portals)/trainer/reports/page.tsx`; `features/trainer/returned-reports-queue.tsx:36-38`; `components/layout/portal-shell.tsx:59` |
| **Dependencies** | Blocks C2C-016 (breadcrumb target) and C2C-022 (rail relabel). |
| **Test required** | Request `/trainer/reports` with no query string as an authenticated trainer; assert a rendered queue or empty state, not the unavailable panel. |
| **Operator approval needed** | **Yes** — whether the Trainer report list is one destination with internal filters (mirroring R-C2-3) while screen 09 remains Deferred is an operator call; R-C2-3 rules only on Management. |

### C2C-015 — Screen 05: schedule opens on the earliest assigned session, not today

| | |
|---|---|
| **Area / screen** | Screen 05 Trainer Schedule — default focus date |
| **Figma intent** | Node `591:9` is recorded as a month view with a month label and picker — a working calendar a trainer opens to find today's class. |
| **Governed intent** | Governance silent on the default focus; persona §3.8 requires the service blueprint's trainer-led flow to hold. |
| **Current implementation** | The default focus is deliberately the **earliest** assigned session: `features/trainer/trainer-schedule-projection.ts:83-97` returns the minimum `session.date`, with the stated rationale "Deliberately derived from the projection rather than from 'today' so the surface renders identically in every environment, in every timezone and in every diagnostic capture." A trainer with a term of history opens on the oldest month. |
| **Severity** | Medium |
| **Classification** | functional |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Default the focus to the current Asia/Singapore date, falling back to the nearest assigned session; keep the deterministic focus behind a diagnostic or fixture path if a stable screenshot is still needed. |
| **Affected routes / files** | `features/trainer/trainer-schedule-projection.ts:83-97`; `features/trainer/trainer-schedule.tsx:157-160` |
| **Dependencies** | Shares the pinned clock with C2C-010. |
| **Test required** | With sessions spanning three months, assert the schedule opens on the month containing today. |
| **Operator approval needed** | No |

### C2C-016 — Screen 10: breadcrumb sends every report into the correction queue

| | |
|---|---|
| **Area / screen** | Screen 10 Trainer Student Report — breadcrumb |
| **Figma intent** | Node `664:9` is recorded as drawing a breadcrumb above the Student Report title, ascending to the Trainer reports list. |
| **Governed intent** | Governance silent on breadcrumb targets; `GLOBAL_UI_RULES` §1.3 makes page relationships Figma-authoritative. |
| **Current implementation** | `features/trainer/trainer-report-review.tsx:304` sets `href="/trainer/reports?status=needs_edit"` with the visible label "Reports" at `:307`, for **every** report regardless of status. A `draft_ready` or `trainer_approved` report claims an ancestor page that by construction cannot contain it; following it lands the trainer in a queue where that report is absent. |
| **Severity** | Medium |
| **Classification** | routing |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Point the "Reports" crumb at the bare `/trainer/reports` once C2C-007 lands. Until then either drop the crumb or make its target status-aware. |
| **Affected routes / files** | `features/trainer/trainer-report-review.tsx:303-308` |
| **Dependencies** | C2C-007 |
| **Test required** | Assert the breadcrumb target of a `draft_ready` report resolves to a page that lists that report. |
| **Operator approval needed** | No |

### C2C-017 — Screen 07: no breadcrumb, unlike its three sibling nested routes

| | |
|---|---|
| **Area / screen** | Screen 07 Trainer Grade Student — header |
| **Figma intent** | The Trainer flow frames carry a breadcrumb on the nested surfaces; screens 06, 08 and 10 each implement one. |
| **Governed intent** | Governance silent. `GLOBAL_UI_RULES` §7 requires a logical, discoverable navigation structure. |
| **Current implementation** | Screen 07 is the only nested Trainer route with no breadcrumb. Its header carries only an `h1` and a "Back to Student Roster" pill (`trainer-assessment.tsx:355-372`, confirmed: the string "Back to Student Roster" appears at `:370` and no `nav`/Breadcrumb element appears in that block). Compare `trainer-roster.tsx:223` `<nav aria-label="Breadcrumb">`, `trainer-draft-generation.tsx:677-690`, `trainer-report-review.tsx:300-319`. |
| **Severity** | Medium |
| **Classification** | structural |
| **Disposition** | **must match Figma** |
| **Required disposition** | Add the breadcrumb in the shape its siblings use — Schedule / \<Class Grade · Module\> / \<learner\> — reusing the already-loaded `session` and `draft.studentDisplayName`. |
| **Affected routes / files** | `features/trainer/trainer-assessment.tsx:355-372` |
| **Dependencies** | None — `session` is already resolved in the same component. |
| **Test required** | Assert `nav[aria-label="Breadcrumb"]` is present on all four nested Trainer routes with a resolvable first crumb. |
| **Operator approval needed** | No |

### C2C-018 — Trainer copy: "This fixture…" rendered as fact in the participant build

| | |
|---|---|
| **Area / screen** | Screen 07 — save-gate copy |
| **Figma intent** | Silent — the frame carries no such sentence. |
| **Governed intent** | `CLAUDE.md` §0 and `GLOBAL_UI_RULES` §1.3 require screen copy to be true of the running system. F16-C composes the **real participant adapter** on every portal build unless the operator sets the fixture flag, and the fixture banner is the only sanctioned fixture disclosure. |
| **Current implementation** | `features/trainer/trainer-assessment.tsx:570` renders, with no adapter condition: "…This fixture deliberately returns one retryable save error on the first complete submission so recovery can be reviewed without losing the form." In the participant build this is false — the real adapter injects no such error. |
| **Severity** | Medium |
| **Classification** | functional |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Remove the sentence from the participant path, or gate it on `port.identity.kind === "deterministic_fixture"` — the same signal `PortalShell` already uses for the fixture banner (`portal-shell.tsx:136-137`). |
| **Affected routes / files** | `features/trainer/trainer-assessment.tsx:570` |
| **Dependencies** | None |
| **Test required** | Assert the string "This fixture" appears nowhere in the rendered DOM of any Trainer route in a participant build. |
| **Operator approval needed** | No |

### C2C-019 — Screen 10: "immutable fixture version" save banner in the participant build

| | |
|---|---|
| **Area / screen** | Screen 10 — post-save confirmation |
| **Figma intent** | Silent |
| **Governed intent** | A-037 makes the created version real and immutable in the participant build; naming it a "fixture version" misstates what the governed save did. |
| **Current implementation** | `features/trainer/trainer-report-review.tsx:333-338` renders "A fresh immutable **fixture** version was created and all three checklist items were reset for review of this exact text." |
| **Severity** | Medium |
| **Classification** | functional |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Drop the word "fixture". The remaining sentence is accurate for both adapters. |
| **Affected routes / files** | `features/trainer/trainer-report-review.tsx:333-338` |
| **Dependencies** | None |
| **Test required** | Same DOM assertion as C2C-018, extended to the `?saved=1` state of the review route. |
| **Operator approval needed** | No |

### C2C-021 — Screen 10: `needs_edit` with no open correction is a dead end with a false reason

| | |
|---|---|
| **Area / screen** | Screen 10 — returned-report revision |
| **Figma intent** | Silent — the frame draws only the approved end state. |
| **Governed intent** | A-036: `needs_edit` is also the exit from `submitted`. A-035 permits `needs_edit → trainer_approved` for a version carrying no approval of its own. So `needs_edit` with no open correction request is a legal, reachable state. |
| **Current implementation** | `trainer-report-review.tsx:284-288`: `const returned = report.status === "needs_edit" && report.openCorrection?.status === "open"; … const canEdit = report.status === "draft_ready" && !returned; const canApprove = canEdit && checklistComplete;`. For `needs_edit` with no open correction, `returned` and `canEdit` are both false: no "Edit wording" link renders, the correction banner does not render, and the Approve button renders permanently disabled beneath "Disabled until all three checks are complete" (`:570-573`) — shown **even when all three are complete**, because `canApprove` depends on `canEdit`. The editor route refuses the same state outright (`trainer-report-editor.tsx:70-75`). The trainer has no path forward and is told the wrong reason. |
| **Severity** | Medium |
| **Classification** | functional |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Handle the state explicitly: allow the editor to open, and either enable approval per A-035 or render an accurate reason. Decouple the "all three checks" message from the status gate. |
| **Affected routes / files** | `features/trainer/trainer-report-review.tsx:284-291, 561-575`; `features/trainer/trainer-report-editor.tsx:70-75` |
| **Dependencies** | None |
| **Test required** | Put a report at `needs_edit` with no open correction and assert either a working edit path or an accurate blocked-state reason, and that the "Disabled until all three checks are complete" string does not render when all three are true. |
| **Operator approval needed** | **Yes** — whether this state is reachable in the seeded data could not be confirmed without a database read (see §10). |

### C2C-022 — Trainer rail: "Returned reports" label exists in no frame and no inventory row

| | |
|---|---|
| **Area / screen** | Trainer sidebar — primary items |
| **Figma intent** | The Trainer frames are recorded (tracker Table D row F4, and the D-notes in the feature files) as drawing a five-item rail: Dashboard / My Classes / Students / Reports / Schedule. |
| **Governed intent** | A-044: screens 01, 02, 04 and 09 are post-48-hour deferred scope. Tracker Table D F4: "the rail's My Classes / Students items depend on the Trainer-scoped class and student projections missing for screens 02/04 … and were not added." `GLOBAL_UI_RULES` §10: a missing governed read path is a dependency, never invented. |
| **Current implementation** | Verified at `components/layout/portal-shell.tsx:50-64`: exactly two items — "Schedule" → `/trainer/schedule` (`exact: true`) and "Returned reports" → `/trainer/reports?status=needs_edit`. Three Figma items are **correctly** withheld as deferred/unbacked. The second item's label appears in no frame and in no ratified inventory row; screen 09's inventory name is "Trainer Reports". |
| **Severity** | Medium |
| **Classification** | structural |
| **Disposition** | **governance overrides Figma** |
| **Required disposition** | Confirm and record the two-item rail for the 48-hour slice. Rename the second item to the ratified screen-09 name ("Reports") once C2C-007 lands, so the rail names a destination rather than a filter. |
| **Affected routes / files** | `components/layout/portal-shell.tsx:39-65` |
| **Dependencies** | C2C-007 must land first — the rail cannot be relabelled "Reports" while the bare route denies. |
| **Test required** | Assert the trainer rail renders exactly the operator-confirmed item set and every href resolves for an authenticated trainer. |
| **Operator approval needed** | **Yes** — "Returned reports" can be classified as neither Figma-faithful nor an approved alias without an operator record. |

### C2C-028 — Trainer schedule/roster: a null clock time renders as "12:00 AM"

| | |
|---|---|
| **Area / screen** | Screens 05 and 06 — session time presentation |
| **Figma intent** | The frame prints a time range per session. |
| **Governed intent** | `GLOBAL_UI_RULES` §10: a missing governed value is recorded, never invented. `class_sessions.starts_at` / `ends_at` are `time NULL`. |
| **Current implementation** | The adapter maps a null clock time to the empty string with the explicit comment "A missing clock time is reported as the empty string, never as an invented time" (`participant-actions.ts:280-283`). But the frontend contract declares `startTime: string` and the formatter has no empty branch: `trainer-schedule-projection.ts:232-238` does `const hour = Number(hours); if (!Number.isFinite(hour)) return value;` — and `Number("")` is `0`, which is finite. A session with no scheduled time therefore renders "12:00 AM – 12:00 AM" on the card and calendar chip, and "–" between two empty strings in the roster banner. |
| **Severity** | Low |
| **Classification** | visual |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Give `formatClockTime`/`formatTimeRange` an explicit empty-value branch that omits the time row rather than printing a midnight the database does not hold. |
| **Affected routes / files** | `features/trainer/trainer-schedule-projection.ts:231-243`; `features/trainer/trainer-schedule.tsx:468, 571`; `features/trainer/trainer-roster.tsx:282` |
| **Dependencies** | None |
| **Test required** | Project a session with null `starts_at`; assert no "12:00 AM" string is rendered. |
| **Operator approval needed** | No |

---

## 6. Findings — Management portal

### C2C-001 — Management sidebar declares two primary Reports destinations (R-C2-3 violation)

| | |
|---|---|
| **Area / screen** | Management sidebar, rendered on all four Management routes |
| **Figma intent** | `29-management-reports/implementation-notes.md:298-303` records the frame verbatim: "The frame's left navigation rail lists six destinations (Dashboard, Students, Trainers, Classes, Schedule, **Reports**). The shell renders the three that exist." **One** Reports item. *(The frame's own pixels were not opened by this audit; the quotation above is the textual record.)* |
| **Governed intent** | **R-C2-3**: exactly ONE primary Reports destination; two separate primary sidebar destinations for Pending and Approved are PROHIBITED. `29-management-reports/screen.md:18` records the ratified treatment as one route with `?status=trainer_approved` and `?status=needs_edit` preserved as **compatibility aliases** — aliases of one destination, not two destinations. |
| **Current implementation** | `components/layout/portal-shell.tsx:69-89` declares three primary items, two of which are Reports destinations: `{href:"/management/reports?status=trainer_approved", label:"Pending review", path:"/management/reports"}` and `{href:"/management/reports?status=needs_edit", label:"Corrections", path:"/management/reports"}`. No item is labelled "Reports". The pair is duplicated in the mobile header at `:230-238`. The **page** is already correctly centralized (see §4.2). |
| **Severity** | **Critical** |
| **Classification** | structural |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Collapse to one primary item labelled "Reports" pointing at `/management/reports`; demote Pending / Corrections to the existing in-page filter chip. Apply the same collapse to the mobile block. **Create no second route.** Full change specified in §4.3. |
| **Affected routes / files** | `components/layout/portal-shell.tsx:66-89` (desktop), `:230-239` (mobile); rendered on `/management`, `/management/reports`, `/management/reports/[reportId]/review`, `/management/reports/[reportId]/edit` via `app/(portals)/management/layout.tsx` |
| **Dependencies** | None. The page, the route and the internal filter all already exist. A grep over `tests/` and `scripts/` found no assertion pinning the labels "Pending review" or "Corrections". |
| **Test required** | DOM assertion that `nav[aria-label="Management navigation"]` contains exactly one link whose pathname is `/management/reports`, with accessible name "Reports". Extend `tests/frontend/three-role-browser-smoke.mjs`, which already visits `/management` and `/management/reports?status=trainer_approved`. |
| **Operator approval needed** | No — R-C2-3 is binding and the frame record agrees. |
| **Raised by** | Management, Routing and Governance slices independently. |

### C2C-004 — Management Reports has no Approved/`submitted` filter, and no projection could back one

| | |
|---|---|
| **Area / screen** | Screen 29 Management Reports |
| **Figma intent** | The Management auditor reports the frame as showing Approved rows with a "View report" action. **This audit did not open the frame** — see §9. The textual record in `29-management-reports/screen.md` §5/§10 requires only that pending review and correction tracking "are both represented". |
| **Governed intent** | R-C2-3 names "Pending and **Approved**" as the two internal filters. A-038 permits Management to read exactly two things: the final-review candidate at `trainer_approved`, and the canonical submitted version. Under A-036, "Approved" can only mean the governed `submitted` status, since `approved` never commits. |
| **Current implementation** | Verified: `features/management/management-reports-queue.tsx:79` — `const acceptedStatus = status === "trainer_approved" \|\| status === "needs_edit";`; `:175-178` offers exactly two options. **No backing read exists**: `lib/frontend/physical-test-port.ts:71-76` declares only `listManagementPendingReviews()` and `listManagementCorrectionTracking()` for Management. Consequently no submitted centre report is reachable from any Management surface after Approve & Submit, and the success banner returns the user to `?status=trainer_approved` where the just-published report no longer appears. |
| **Severity** | **High** |
| **Classification** | functional |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Add an "Approved" (governed: `submitted`) option to the **same in-page filter chip**, backed by a new governed Management submitted-list projection reading only the canonical submitted version (A-038). Until that projection exists, record it as a named backend dependency on `29-management-reports/screen.md` §7 rather than faking it client-side. **Do NOT satisfy this with a second route or a second sidebar item (R-C2-3).** |
| **Affected routes / files** | `features/management/management-reports-queue.tsx:79, 174-178`; `lib/frontend/physical-test-port.ts:71-79`; `server/modules/management-view/projections.ts` (no submitted-list projection); `features/management/management-report-review.tsx:283-289` |
| **Dependencies** | Blocked on a governed Management submitted-report list projection/RPC — backend work with its own authorization. |
| **Test required** | After Approve & Submit, `/management/reports?status=submitted` lists exactly the just-published report for the caller's own centre and zero rows for a wrong-centre management caller; the row's action opens the canonical submitted report, never a pre-approval draft. |
| **Operator approval needed** | **Yes** — two auditors disagreed on whether this is a defect (see §4.4). The operator must state whether R-C2-3's "Approved" is generic phrasing or a requirement for a third filter. |

### C2C-005 — Management Reports: an unknown `?status=` renders a denial panel

| | |
|---|---|
| **Area / screen** | Screen 29 — deep-link robustness |
| **Figma intent** | Silent — the frame shows a Status chip and gives no behaviour for an unrecognised value. |
| **Governed intent** | R-C2-3 permits deep links by query parameter but requires them to render inside the centralized Reports page. `GLOBAL_UI_RULES` §89 requires unavailable/denied states to be non-disclosing; it does **not** require an unknown *filter* value to be treated as a denial. |
| **Current implementation** | `management-reports-queue.tsx:120-128`: any `?status=` outside `{trainer_approved, needs_edit}` short-circuits the whole page into `<StatePanel result={{ outcome: "unavailable" }} />` — "This item isn't available … No additional details can be shown." A stale bookmark, or `?status=submitted`, therefore reads to Management as a denied report, and the Reports page and its filter chip disappear entirely. |
| **Severity** | Medium |
| **Classification** | routing |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Treat an unrecognised `?status=` as the default filter and render the page normally, exactly as the missing-parameter case already does at `:78`. Reserve the unavailable panel for governed read failures, not filter parsing. |
| **Affected routes / files** | `features/management/management-reports-queue.tsx:78-80, 120-128` |
| **Dependencies** | Interacts with C2C-004 — adding a `submitted` filter also removes one live cause of this. |
| **Test required** | `/management/reports?status=nonsense` renders the Reports heading, the filter chip and the default pending queue. |
| **Operator approval needed** | No |

### C2C-006 — `?status=needs_edit` names a status but selects a queue that renders two statuses

| | |
|---|---|
| **Area / screen** | Screen 29 — correction-tracking queue |
| **Figma intent** | Silent; the frame draws a generic filter strip. |
| **Governed intent** | The URL and the on-screen filter must describe the governed facts they claim to. `needs_edit` and `draft_ready` are distinct ratified statuses; the correction-tracking queue is defined by the presence of a correction request, not by a single status. |
| **Current implementation** | The parameter is named and valued as a report status, and the option is labelled "Correction tracking" (`management-reports-queue.tsx:177`), but the projection it selects legitimately returns rows at **both** `needs_edit` and `draft_ready`: `ROW_PRESENTATION` at `:42-58` renders `needs_edit` as "Returned to Trainer" and `draft_ready` as "Corrected · awaiting Trainer reapproval", and `ManagementQueueRowDto["status"]` is the three-value union. A URL asserting `status=needs_edit` therefore renders rows that are not at `needs_edit`. |
| **Severity** | Medium |
| **Classification** | functional |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Rename the selector so it names the queue rather than a status (e.g. `?queue=corrections` / `?queue=pending`), keeping the current spellings as the ratified compatibility aliases recorded at `29-management-reports/screen.md:18`. Neither projection may be widened or narrowed. |
| **Affected routes / files** | `features/management/management-reports-queue.tsx:78-92, 167-179`; `components/layout/portal-shell.tsx:78, 84`; `features/management/management-dashboard.tsx:74, 80`; `features/management/management-report-review.tsx:284-285, 307, 324` |
| **Dependencies** | Should land with C2C-001 so the alias set changes once. |
| **Test required** | Load the corrections queue against a fixture holding one returned and one corrected report; assert both rows render while the selector no longer asserts a single status only one row holds. |
| **Operator approval needed** | **Yes** — renaming a ratified compatibility alias needs the operator's nod. |

### C2C-026 — Screen 19: review/edit breadcrumb loses the originating filter; the editor has none

| | |
|---|---|
| **Area / screen** | Screen 19 Management Student Report and the wording editor |
| **Figma intent** | Frame `648:330` is recorded as drawing a breadcrumb and a Back control on the review surface. **No frame covers `/edit`** — it is one of the eight families recorded `Blocked — new design required`. |
| **Governed intent** | R-C2-3 requires Reports sub-states to read as one destination. Governance otherwise silent on breadcrumb targets. |
| **Current implementation** | `features/management/management-report-review.tsx:307` (breadcrumb) and `:324` (Back pill) both hardcode `href="/management/reports?status=trainer_approved"`, regardless of the filter the user arrived from. `features/management/management-wording-editor.tsx:145-151` renders only a Back link to `/review` with no `<nav aria-label="Breadcrumb">`, so on `/edit` the trail from Reports is lost — compounded by no rail item being active there (C2C-002). |
| **Severity** | Low |
| **Classification** | visual |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Carry the originating filter through review and edit (a preserved `?status=` or `?from=`), and add the Reports › Student › Final review › Edit wording breadcrumb to the wording editor. No new route. |
| **Affected routes / files** | `features/management/management-report-review.tsx:303-329`; `features/management/management-wording-editor.tsx:137-152` |
| **Dependencies** | Reads better after C2C-001 and C2C-002 land. |
| **Test required** | Opening a report from the corrections filter and pressing Back returns to that filter; `/management/reports/<id>/edit` renders a breadcrumb whose first item links to `/management/reports`. |
| **Operator approval needed** | No |

### C2C-031 — `trainer_approved` is labelled two different ways inside the Management portal

| | |
|---|---|
| **Area / screen** | Screen 29 queue vs screen 19 review surface |
| **Figma intent** | Silent on the governed status word. |
| **Governed intent** | One governed status should read consistently within one portal; A-036 names `trainer_approved` "the persisted management-review state". |
| **Current implementation** | The queue labels it "Awaiting final review" from its own local map (`management-reports-queue.tsx:44`), while the review surface renders the shared, trainer-oriented `StatusPill`, which labels it "With management" (`components/ui/status-pill.tsx:12`), at `management-report-review.tsx:332` and `:443`. "With management" is written from the trainer's vantage point and reads oddly to the management reader it is shown to. |
| **Severity** | Low |
| **Classification** | visual |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Make `StatusPill` role-aware, or have the management review surface use "Awaiting final review". No status value changes. |
| **Affected routes / files** | `features/management/management-report-review.tsx:332, 443`; `components/ui/status-pill.tsx:12`; `features/management/management-reports-queue.tsx:44` |
| **Dependencies** | None |
| **Test required** | Assert the string rendered for `trainer_approved` on `/management/reports` and on the review surface is identical. |
| **Operator approval needed** | No |

### C2C-032 — Management pending-review projection is O(sessions × students) per page view

| | |
|---|---|
| **Area / screen** | `/management` dashboard and every review page open |
| **Figma intent** | Silent |
| **Governed intent** | Governance silent on query shape; ADR-3 and the §5.5 exclusions are satisfied. This is an engineering-quality observation, not a governance one. |
| **Current implementation** | `server/modules/management-view/projections.ts:91-123` (`listCentrePairs`) issues one `enrolments` query per class session and one `students` query per uncached student; `:141-163` then issues one `report_get_management_review` RPC per (session, student) pair. The dashboard calls this plus correction tracking on every load, and the review surface calls the **same full enumeration** on every report open purely to obtain the learner's display name and session date (`management-report-review.tsx:183-203`). |
| **Severity** | Low |
| **Classification** | functional |
| **Disposition** | **deferred outside the 48-hour sprint** |
| **Required disposition** | Post-sprint: a governed projection returning the learner identity alongside the review candidate, so the review surface stops enumerating the whole centre to render one name. Do **not** paper over it with a client-side cache that could serve a stale or cross-report name. |
| **Affected routes / files** | `server/modules/management-view/projections.ts:91-163`; `features/management/management-report-review.tsx:181-208`; `features/management/management-dashboard.tsx:22-40` |
| **Dependencies** | Requires a governed projection change — backend work. |
| **Test required** | Round-trip count assertion on `/management` and on a review page, plus proof the learner name still comes from a governed projection and is omitted rather than fabricated on a miss. |
| **Operator approval needed** | **Yes** — a backend projection change needs its own authorization. |

### C2C-036 — Management governance boundary over assessment substance is HELD *(clean)*

| | |
|---|---|
| **Area / screen** | Screen 19 review surface and the wording editor |
| **Figma intent** | Frame `648:330` is recorded as **drawing prohibited elements**: an audience toggle, a per-dimension Performance Summary grid, "Overall Grade: Mastering", trainer observations/notes, class video evidence and "Save as draft". |
| **Governed intent** | A-034 / A-038: Management may overwrite parent-facing narrative wording only, and the server must reject anything else even when the UI is bypassed. Operator ruling R-B5 directed these frame elements be omitted and the divergence recorded. |
| **Current implementation** | **Held at both layers.** The wording editor renders exactly the four `REPORT_PANEL_CONFIG` textareas (`management-wording-editor.tsx:165-184`) and nothing else. The review surface renders only the four panels plus name/session-date/status and enumerates omissions P1–P6 with their governing clauses (`management-report-review.tsx:46-80, 379-419`). Server-side **the allow-list is the RPC signature**: `report_management_edit_wording` is called with exactly four panel parameters (`server/modules/report-workflow/core.ts:254-263`), so a Management write outside the four parent-facing panels is structurally unexpressible. The read is status-gated (`participant-actions.ts:507`) and only the domain-separated `wordingHash` — never the content hash — reaches Management. |
| **Severity** | Informational |
| **Classification** | functional |
| **Disposition** | **governance overrides Figma** |
| **Required disposition** | **No change.** Preserve this shape when C2C-001 and C2C-004 are implemented — in particular, an Approved/`submitted` filter must not introduce a second, ungated Management content read. |
| **Affected routes / files** | as cited above |
| **Dependencies** | None |
| **Test required** | Already covered structurally by `assertManagementSurfaceClean()` across five Management surface states (tracker Table C, F12). Re-run after any rail or filter change. |
| **Operator approval needed** | No |

### C2C-048 — Management queue columns and filters with no governed source, correctly withheld *(clean)*

| | |
|---|---|
| **Area / screen** | Screen 29 — frame chips and columns |
| **Figma intent** | The frame is recorded as drawing "All terms" and "All classes" chips and Class / Lesson / Trainer / Submitted columns. |
| **Governed intent** | `GLOBAL_UI_RULES` §10 and `CLAUDE.md` §7.2 prohibit inventing a field to satisfy a frame; missing backend capability is recorded as a dependency. |
| **Current implementation** | Correctly dispositioned already. `ManagementQueueRowDto` carries no term, class, lesson or trainer field, so the term and class chips render **disabled with a programmatically associated reason** (`management-reports-queue.tsx:187-202, 235-239`) and those columns are omitted; "Submitted" is rendered as "Session" because a `trainer_approved` report has no submission timestamp. "Send Reminder to Trainer" renders with its `CLAUDE.md` §6 mandated label but disabled, with the stated reason that no governed reminder path exists. |
| **Severity** | Informational |
| **Classification** | visual |
| **Disposition** | **deferred outside the 48-hour sprint** |
| **Required disposition** | No change. Keep the four recorded dependencies open rather than closing them by fabrication. |
| **Affected routes / files** | `features/management/management-reports-queue.tsx:181-239, 437-446`; `29-management-reports/implementation-notes.md:250-272` |
| **Dependencies** | Backend: term/class fields on the queue projection; a governed trainer-reminder path. |
| **Test required** | Assert the inert chips and the reminder button stay disabled with visible, programmatically associated reasons, and that no term/class/lesson/trainer value renders on any row. |
| **Operator approval needed** | No |

---

## 7. Findings — Parent portal

### C2C-013 — The Parent cross-family RLS negative test does not exist

| | |
|---|---|
| **Area / screen** | Screens 32 and 33 — cross-family isolation proof |
| **Figma intent** | Silent |
| **Governed intent** | `CLAUDE.md:130` (verified in the persona §3.6 checklist): "An automated (negative) test proves a parent's RLS-scoped query cannot return another child's report." `32-parent-reports/screen.md` §14 and `33-parent-class-report/screen.md` §14: a Parent may select only among children linked to that authenticated Parent. |
| **Current implementation** | The **code** boundary is correct and layered: `app_parent_reaches_student` (`20260805090500_step_7i_report_lifecycle.sql:548-572`) requires an active parent membership owning an ACTIVE `parent_student_links` row for exactly that student and is called at RPC-13's parent branch; enumeration starts from the caller's own live links (`server/modules/parent-view/projections.ts:44-58`); four independent RLS policies scope every supporting read. What does **not** exist is the automated negative the contract requires: the ratified fixture contains exactly ONE student, so no parent-linked-to-A-reads-B assertion can be written. Verified in `AUTONOMOUS_48H_RUN_C1_REPORT.md:756`: "Parent **cross-child** RLS negative is ABSENT as literally specified — the ratified Step 7F fixture has exactly one student, so the test cannot exist against it … **A fixture-shape limitation, not a code defect** … **No — but it is an unproven boundary**." |
| **Severity** | **High** |
| **Classification** | functional |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Expand the fixture to at least two parents and two students in the same centre and add the linked-parent-reads-OTHER-family negative alongside the existing unlinked-parent negative (T7I-26). This is **fixture work, not a code change** — no parent-path source file should move. If it cannot land inside the window, it must be carried as an explicitly **UNPROVEN boundary** in the physical-test sign-off, never as a passing gate. |
| **Affected routes / files** | `scripts/fixtures/local_fixtures.sql`; `scripts/fixtures/verify-local-fixtures.sql`; `scripts/tests/step-7i/lifecycle-canonical.sql`. Boundary code under audit: `20260805090500_step_7i_report_lifecycle.sql:548-572`; `server/modules/parent-view/projections.ts:44-58` |
| **Dependencies** | Fixture expansion — the pre-existing dependency BD-2 recorded at F-14. No code dependency. |
| **Test required** | Under the fixture parent's own JWT, `report_get_canonical(other_family_session, other_family_student)` must return zero rows, with a positive control on the parent's OWN child proving the probe is live. |
| **Operator approval needed** | **Yes** — expanding the ratified Step 7F fixture is itself governed (`CLAUDE.md` §11: the broader shape is deferred, not deleted, and Step 7F deviation requires authorization). |

### C2C-023 — No sign-out control exists anywhere in the application

| | |
|---|---|
| **Area / screen** | Parent portal shell (and, because the shell is shared, all three portals) |
| **Figma intent** | The frozen frame for screen 32 (`533:180`) is recorded as drawing a left rail carrying Overview / Calendar / Reports **and a Logout row**. |
| **Governed intent** | Governance silent on a logout control specifically, but `CLAUDE.md` ADR-4 makes the session the sole carrier of authority, and the required Parent flow is a **real login** — a real login with no way to end the session on a shared or family device is an incomplete flow. |
| **Current implementation** | Verified: `components/layout/portal-shell.tsx:91-102` defines the Parent rail as exactly two items (Home, Reports); the identity block at `:210-220` and the header strip at `:246-258` render name, centre and avatar with **no action**. A governed server action is already fully written — `server/modules/identity-access/actions.ts:114` `signOutAction()` — and a `logout` icon already exists in the shared set, but a repository-wide grep for `signOutAction` returns **exactly two hits: its own definition and one documentation mention**. It has no consumer. `32-parent-reports/implementation-notes.md:260-262` records the missing Logout row as D4 and justifies the rail by A-044 deferral — reasoning that covers Overview and Calendar (deferred screens 30 and 31) but **not** Logout, which depends on nothing deferred. |
| **Severity** | Medium |
| **Classification** | functional |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Wire the existing `signOutAction` to a Logout control in `portal-shell.tsx`. Invent no new server behaviour. If the operator prefers to defer, D4 must be amended so it stops attributing the missing Logout row to A-044. |
| **Affected routes / files** | `components/layout/portal-shell.tsx` (shared by all three portals); `server/modules/identity-access/actions.ts:114-117` |
| **Dependencies** | Operator ruling on touching the shared shell — `portal-shell.tsx` was declared outside the owned paths at F-11, F-14 and F-15, so no screen checkpoint has been authorized to modify it. |
| **Test required** | A signed-in Parent activates Logout, is returned to `/login`, and a subsequent GET of `/parent/reports` redirects to `/login` rather than rendering. |
| **Operator approval needed** | **Yes** |

### C2C-027 — Screen 33: no return affordance from the report back to the list

| | |
|---|---|
| **Area / screen** | Screen 33 Parent Class Report |
| **Figma intent** | Frame `627:9` carries a page title and meta line; the pack's notes for screen 33 record no breadcrumb or Back pill (unlike screens 10 and 19, whose tracker entries name "the Student Report header with breadcrumb and Back pill"). |
| **Governed intent** | Governance silent — `GLOBAL_UI_RULES` §5 imposes no breadcrumb requirement on Parent surfaces. |
| **Current implementation** | The success state renders no breadcrumb, no Back control and no link of any kind: `features/parent/parent-canonical-report.tsx:120-172` is a heading, a meta line and four panels, and no `Link` is imported in the file. A return affordance appears **only** in the failure state, via `StatePanel`'s `homeHref="/parent"` — the dashboard, not the list the user arrived from. |
| **Severity** | Low |
| **Classification** | visual |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Add a Back-to-Reports affordance to the success state pointing at `/parent/reports`, matching screens 10 and 19. Alternatively record explicitly in `33-parent-class-report/implementation-notes.md` that the frame carries no breadcrumb and the omission is intentional. |
| **Affected routes / files** | `features/parent/parent-canonical-report.tsx:120-132` |
| **Dependencies** | None |
| **Test required** | From the parent report list, open a report and assert a keyboard-reachable control returning to `/parent/reports`. |
| **Operator approval needed** | No |

### C2C-033 — Parent report enumeration fans out per session and runs twice on the dashboard

| | |
|---|---|
| **Area / screen** | Screens 30 and 32 |
| **Figma intent** | Silent |
| **Governed intent** | Governance silent on query shape; it constrains reach, not cost. |
| **Current implementation** | `server/modules/parent-view/projections.ts:69-98` issues one `enrolments` query per linked student, one `class_sessions` query per enrolment, then one `report_get_canonical` RPC **per session** — a fan-out that grows with the number of sessions the child's modules have ever held, not with the number of submitted reports. `getParentAvailabilityCore` at `:105-119` calls that whole routine again, and the dashboard invokes both in one `Promise.all` (`parent-dashboard.tsx:29`), so one dashboard load performs the entire fan-out twice. Reach is unaffected — the per-session RPC is precisely what makes each row individually authorized. |
| **Severity** | Low |
| **Classification** | functional |
| **Disposition** | **deferred outside the 48-hour sprint** |
| **Required disposition** | Record, do not fix under time pressure. Any later fix must **not** become a client-side or TypeScript-side filter over a wider query — the correct shape is a governed list RPC applying `app_parent_reaches_student` and the `latest_submitted_version_id` predicate set-wise inside the database. At minimum, have the dashboard derive availability from the single list result it already fetches. |
| **Affected routes / files** | `server/modules/parent-view/projections.ts:69-98, 105-119`; `features/parent/parent-dashboard.tsx:29` |
| **Dependencies** | A new governed list RPC would be a migration needing its own authorization; the dashboard de-duplication needs none. |
| **Test required** | With a fixture carrying a full term of sessions, assert a bounded number of round trips and identical rows. |
| **Operator approval needed** | No |

### C2C-035 — Parent portal: all seven prohibited classes are NEVER FETCHED *(clean)*

| | |
|---|---|
| **Area / screen** | All Parent surfaces (screens 30/32/33 + shell) |
| **Figma intent** | The frozen frames for 32 (`533:180`) and 33 (`627:9`) are recorded as **drawing prohibited content** — an aggregate rating chip per row on 32, and on 33 a four-cell dimension:rating grid, "Overall Grade: Mastering", prose rating attributions and a "Watch Together" video. |
| **Governed intent** | `CLAUDE.md:284`: "No per-dimension rating grid on the Parent Feedback Report, in any form or wording — this is a caught leak, fix it." `CLAUDE.md:264`: never return a report content hash to a parent or management (panels + hash brute-forces the nine-dimension grid in 4⁹ trials). `GLOBAL_UI_RULES` §5: no hash, revision number, correction reason, trainer note, draft, AI history or audit row reaches a parent surface; nothing may disclose that a correction cycle is or was underway; no edit affordance exists. |
| **Current implementation** | **All seven prohibited classes are NEVER FETCHED — not fetched-and-hidden**, which is the stronger posture. Every parent report fact flows through one RPC whose SQL return type cannot express them: `report_get_canonical`'s `RETURNS TABLE` is literally `todays_strength, next_focus, practice_suggestion, session_takeaway, submitted_at`. The two DTOs are five and two fields wide. The three parent pages are client components receiving only those DTOs, so no wider server payload is serialized. Error strings are constant literals. `reports`, `report_versions`, `report_version_ratings`, `observations` and friends carry **zero** `authenticated` privilege under migration-time assertion A8; `audit_events` and `report_correction_requests` are REVOKEd outright. The only interactive elements on Parent surfaces are a `<select>` over already-returned linked children, "View" links and "View available reports". |
| **Severity** | Informational |
| **Classification** | functional |
| **Disposition** | **governance overrides Figma** |
| **Required disposition** | **No change.** Record the confirmed posture and keep the Figma-versus-governance deviations recorded in `32-parent-reports/implementation-notes.md` D1 and `parent-canonical-report.tsx:24-67` omissions 1–4 as the standing justification. |
| **Affected routes / files** | the three Parent routes and their features; `server/modules/parent-view/projections.ts`; `lib/frontend/contracts/physical-test.ts`; `20260805090500_step_7i_report_lifecycle.sql`; `20260803154500_step_7g_relationship_authorization.sql` |
| **Dependencies** | None |
| **Test required** | Present: `tests/frontend/three-role-browser-smoke.mjs:494-560` `assertParentSurfaceClean` on four Parent surface states. **Not yet covered:** a payload-level assertion that the Server Action response bodies contain exactly the declared DTO keys (carried to §10). |
| **Operator approval needed** | No |

### C2C-040 — Parent: unsubmitted content unreachable by construction; denial non-disclosing *(clean)*

| | |
|---|---|
| **Area / screen** | Parent portal — reachability and denial |
| **Figma intent** | Silent |
| **Governed intent** | `CLAUDE.md:263`: parents only ever see the canonical submitted version the aggregate's `latest_submitted_version_id` points to, for students in their `parent_student_links`. `GLOBAL_UI_RULES:89`: denial must not reveal whether a student, report or link exists. |
| **Current implementation** | Holds **by construction rather than by a status test**: RPC-13 returns early at `20260805090500_step_7i_report_lifecycle.sql:2735` (`IF v_r.latest_submitted_version_id IS NULL THEN RETURN; END IF;`) and then resolves content solely from that pointer, so `trainer_approved`-but-unsubmitted, `needs_edit` and pre-submission drafts are unreachable with no status branch a future edit could weaken. The list projection treats both an error and a zero-row answer as simple absence. RPC-13's body contains **no `RAISE` at all** — every refusal is a bare `RETURN` — and `unavailable` and `unauthorized` collapse to byte-identical `StatePanel` copy. During an open correction the parent continues to read the previous canonical version and reaches no correction metadata. |
| **Severity** | Informational |
| **Classification** | functional |
| **Disposition** | **governance overrides Figma** |
| **Required disposition** | No change. **Note for Phase C2-A:** creating a report shell moves no pointer, so it cannot make anything parent-visible — the `latest_submitted_version_id IS NULL` early return covers a shell exactly as it covers a draft. No parent-path change is implied by that transition. |
| **Affected routes / files** | `20260805090500_step_7i_report_lifecycle.sql:2688-2745`; `server/modules/parent-view/projections.ts:63-99, 124-150`; `components/ui/state-panel.tsx:42-66` |
| **Dependencies** | None |
| **Test required** | Present: T7I-56, T7I-25 (×2), T7I-54, T7I-67 and T-CT-11 in `lifecycle-canonical.sql`. |
| **Operator approval needed** | No |

### C2C-045 — Screens 30/31/33 canonical-route divergences are ratified-deferred *(not defects)*

| | |
|---|---|
| **Area / screen** | Screen 33 pinned route; screen 30 `/parent` vs `/parent/dashboard`; screen 31 Parent Calendar |
| **Figma intent** | `33-parent-class-report/screen.md` §1 records canonical `/parent/reports/[reportId]`, treatment "Replace after integration; pinned path preserved as a redirect". `30-parent-dashboard/screen.md` §1 records `/parent/dashboard` with `/parent` preserved as a redirect. `31-parent-calendar/screen.md` §1 records "(no implemented route)". |
| **Governed intent** | The tracker's target-versus-actual block beneath Table A: "The Route column records the ratified CANONICAL TARGET … Six cells name a canonical path that has never been created… **Nothing here is a defect: the divergence is by design and was carried deliberately.**" Both screens 30 and 31 record "48-hour core membership: No — deferred until after the physical test" (A-044). |
| **Current implementation** | Screen 33 is served at `/parent/students/[studentId]/sessions/[sessionId]/report`, keyed on (studentId, sessionId) because RPC-13 is keyed on that pair. `/parent` serves the dashboard directly; `/parent/dashboard` does not exist and no redirect exists. `/parent/calendar` does not exist, and the Parent rail correctly does **not** offer a Calendar item — an item pointing at a non-existent route would be the worse outcome. |
| **Severity** | Informational |
| **Classification** | routing |
| **Disposition** | **deferred outside the 48-hour sprint** |
| **Required disposition** | **No action, and this must not be reported as a defect.** Do not create `/parent/dashboard` or `/parent/calendar` in this sprint. The screen-33 migration remains deferred and needs its own authorization. |
| **Affected routes / files** | `app/(portals)/parent/page.tsx`; `app/(portals)/parent/students/[studentId]/sessions/[sessionId]/report/page.tsx` |
| **Dependencies** | Screen 33's migration is buildable when authorized — `report_resolve_context` already exists and dispatches by role. |
| **Test required** | None now. Post-sprint: the pinned path still resolves via redirect and the new canonical path resolves the pair server-side without accepting a caller-supplied student id. |
| **Operator approval needed** | No |

---

## 8. Findings — cross-cutting

### C2C-002 — Sidebar active-item computation: a dead ternary producing two active items or none

| | |
|---|---|
| **Area / screen** | All three portals — shared navigation shell |
| **Figma intent** | Every frame highlights exactly one rail item per screen (recorded as D7 at F-05, D8 at F-07, D9 at F-08, and in frame `527:170` for Management). |
| **Governed intent** | **R-C2-3**: a Reports deep link must render "with ONE active sidebar item". `GLOBAL_UI_RULES` §7 and WCAG 2.2 require `aria-current="page"` to identify a single current location, with colour never the only carrier. |
| **Current implementation** | Verified verbatim at `components/layout/portal-shell.tsx:192`: `const active = item.exact ? pathname === item.path : pathname === item.path;` — **both branches are the identical expression**, so the `exact` flag declared at `:24` and set on three items (`:55`, `:74`, `:95`) is **dead code**, and matching is always strict equality. Two consequences: (a) on `/management/reports` **two** items are active simultaneously, since both carry `path: "/management/reports"` (`:80`, `:86`) — emitting two `aria-current="page"` attributes at `:197`; (b) on every deep sub-route in all three portals **zero** items are active — that is 8 of the 14 canonical portal routes: both Management report sub-routes, five Trainer sub-routes and the Parent report detail. |
| **Severity** | **High** |
| **Classification** | functional |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Make the branches differ so `exact` becomes load-bearing: `item.exact ? pathname === item.path : pathname === item.path \|\| pathname.startsWith(item.path + "/")`. Schedule / Dashboard / Home stay exact; Reports items match their sub-tree. Leaving a flag that documents behaviour the code does not have is the condition that hid this defect. |
| **Affected routes / files** | `components/layout/portal-shell.tsx:20-27, 55, 74, 95, 190-208` — one file, one line, all three portals (the rail is centralized in `RolePortalShell`, `:106-124`) |
| **Dependencies** | Land with C2C-001 — the prefix fix alone would leave two Management items active. |
| **Test required** | For each of the 8 deep portal routes and both Management filters, assert exactly one `[aria-current="page"]` in the portal nav and that it is the expected parent item. |
| **Operator approval needed** | No |
| **Raised by** | Trainer, Management, Routing and Governance slices independently. |

### C2C-003 — Mobile header nav duplicates the rail and computes no active state

| | |
|---|---|
| **Area / screen** | All three portals below the `lg` breakpoint |
| **Figma intent** | Silent — the frozen frames are desktop-width. |
| **Governed intent** | R-C2-3 requires ONE active sidebar item; `GLOBAL_UI_RULES:112` requires colour never be the only carrier of meaning. |
| **Current implementation** | `components/layout/portal-shell.tsx:230-238` renders a second copy of `config.navigation` in the `lg:hidden` header. The `<Link>` carries only `className` — **no `aria-current`, no `active` computation at all** — so below the breakpoint the current location is not represented in navigation. Because it maps the same array, it also reproduces the two Management Reports destinations. |
| **Severity** | Medium |
| **Classification** | routing |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Share one active-item derivation between the desktop rail and the mobile header so both emit exactly one `aria-current="page"`. The Management duplication resolves automatically once C2C-001 lands. |
| **Affected routes / files** | `components/layout/portal-shell.tsx:224-240` |
| **Dependencies** | C2C-001 and C2C-002 (same config array, same derivation). |
| **Test required** | At a 480 px viewport, assert exactly one `[aria-current="page"]` in the mobile nav on `/management/reports` and on a Trainer review sub-route. |
| **Operator approval needed** | No |

### C2C-012 — Post-login destination sends Management and Parent to deferred dashboards

| | |
|---|---|
| **Area / screen** | AUTH-02 → screen 29; AUTH-03 → screen 32 |
| **Figma intent** | `48H_CORE_SLICE.md` AUTH-02: "Next screen \| 29 Management Reports"; AUTH-03: "Next screen \| 32 Parent Reports"; AUTH-01: "Next screen \| 05 Trainer Schedule". |
| **Governed intent** | A-043: the twelve screens are contiguous flow order 1–12. `SCREEN_INDEX.md` classifies screen 11 Management Dashboard and screen 30 Parent Dashboard as Deferred / "Not in the physical-test flow". The post-authentication destination should be the next **core** screen, not a deferred one. |
| **Current implementation** | Verified verbatim: `server/modules/identity-access/portal-destinations.ts:20-24` — `const PORTAL_HOME: Readonly<Record<SessionRole, string>> = { trainer: "/trainer", management: "/management", parent: "/parent" };`. This one table drives `app/page.tsx:40`, `proxy.ts:194, 206`, `portal-guard.ts:68` and `actions.ts:107`. **Trainer resolves correctly** — `/trainer` is the R-B1 compatibility alias and `app/(portals)/trainer/page.tsx:20` redirects to `/trainer/schedule`. **Management** lands on the screen-11 dashboard (deferred, no frozen reference) instead of screen 29 at flow order 8. **Parent** lands on the screen-30 dashboard (deferred) instead of screen 32 at flow order 11. Both walkthroughs remain navigable, but flow steps 7→8 and 10→11 each acquire an unratified intermediate deferred screen. |
| **Severity** | **High** |
| **Classification** | routing |
| **Disposition** | **must match Figma** |
| **Required disposition** | Operator's choice, and only the operator's: either (a) change `PORTAL_HOME` to `management: "/management/reports"` and `parent: "/parent/reports"` so the destination is the ratified next core screen, or (b) issue a ruling analogous to R-B1 accepting the dashboard fold for the physical test and recording that the walkthrough steps through it. **The current state matches neither the core slice nor a recorded ruling.** Do not restyle either dashboard toward its deferred frame inside this sprint. |
| **Affected routes / files** | `server/modules/identity-access/portal-destinations.ts:20-24`; consumers `app/page.tsx:40`, `proxy.ts:194, 206`, `portal-guard.ts:68`, `actions.ts:107`; landing pages `app/(portals)/management/page.tsx`, `app/(portals)/parent/page.tsx` |
| **Dependencies** | None technically. Interacts with C2C-043 — if the destination changes, `/management` and `/parent` stop being flow-bearing. |
| **Test required** | An authenticated-leg assertion that a Management sign-in ends at the ratified destination and a Parent sign-in likewise, matching `48H_CORE_SLICE.md` flow orders 8 and 11. |
| **Operator approval needed** | **Yes** |
| **Note** | The Parent auditor read this as a documentation nuance rather than a routing defect, since the required Parent flow the operator specified is "login → dashboard notification → Reports list". That reading is recorded; it strengthens option (b) for Parent while leaving Management open. |

### C2C-014 — The governance record asserts Amendment 006 vocabulary work is unimplemented; it has landed and merged

| | |
|---|---|
| **Area / screen** | Standing governance record (`CLAUDE.md` §5; `docs/progress/STATUS.md`) |
| **Figma intent** | Silent |
| **Governed intent** | `CLAUDE.md` is "the standing contract … read by Claude Code at the start of every session"; `CLAUDE.md` §11 requires `STATUS.md` be updated "with what is now true". A-053 requires V2 and V3 each to be separately authorized. |
| **Current implementation** | **Both records are false against the tree.** `CLAUDE.md` §5 still states: "Amendment 006 ratifies the vocabulary … but **no database, backend, frontend, fixture, generated type or test has been changed yet.** … Until V2 lands, the database still stores the old labels — **do not 'fix' a mismatch you find between code and this section without that authorization.**" `STATUS.md:518` states: "Backend V2 stays **Blocked** … **Frontend V3 remains separately authorized and unstarted.**" Verified against the tree: `supabase/migrations/20260806160000_competency_vocabulary_rename.sql` **exists on disk**; `server/db/database.types.ts:1753` declares `competency_rating: "beginning" \| "developing" \| "mastering" \| "mastered"`; the frontend renders those labels. `FRONTEND_RECONSTRUCTION_TRACKER.md:113` records "Backend V2 committed (`e5a66d7`, `103f433`, `ec5be57`) and merged at `0c9fbe4`; Frontend V3 committed (`5dcbeeb`) and merged at `68ba497`". A future session reading the standing contract will be told not to trust the code it is looking at. |
| **Severity** | **High** |
| **Classification** | structural |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Reconcile `CLAUDE.md` §5 and `STATUS.md`'s live "Next permitted action" to the merged state, retaining the superseded text only inside a clearly dated Historical block, as `STATUS.md` already does elsewhere. **This is a documentation reconciliation, not a code change**, and it must be operator-approved because `CLAUDE.md` is the standing contract. |
| **Affected routes / files** | `CLAUDE.md` §5 ("Implementation status" bullet); `docs/progress/STATUS.md:512, 518`; consequentially `48H_CORE_SLICE.md` vocabulary-implementation rows and the per-screen §8 blocks |
| **Dependencies** | None |
| **Test required** | Grep `CLAUDE.md` and the live `STATUS.md` section for "V3 remains" / "has been changed yet" and assert zero hits outside a block explicitly marked Historical. |
| **Operator approval needed** | **Yes** |

### C2C-020 — `?preview=` parameters suppress governed data in the participant build

| | |
|---|---|
| **Area / screen** | Trainer schedule, Trainer reports, Trainer dashboard, Management reports queue, Parent dashboard, Parent reports list |
| **Figma intent** | Silent — no such control or state exists in any frame. |
| **Governed intent** | A-046 and `GLOBAL_UI_RULES` §11: a query parameter carries no authority and selects **presentation** only. It does not follow that a query parameter may suppress governed data in a participant build. `GLOBAL_UI_RULES:126` prohibits porting prototype shortcuts. |
| **Current implementation** | Six live branches, none adapter-gated: `trainer-schedule.tsx:138` (`searchParams.get("preview") === "empty" ? [] : allSessions`), `returned-reports-queue.tsx:42`, `trainer-dashboard.tsx:57`, `management-reports-queue.tsx:108`, `parent-dashboard.tsx:62-68` (`preview=none` forces `none_yet`, `preview=linked_unavailable` forces that state), `parent-reports-list.tsx:69`. **Direction of travel is safe** — every branch can only suppress, never manufacture or widen; no value can produce an "available" state or a row the projection did not return. But the rendered state becomes a function of caller input, a stale link could silently hide an entire queue during the physical test, and only one of the six values (`?preview=empty` on screen 32) is documented in the pack. |
| **Severity** | Medium |
| **Classification** | functional |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Gate every branch on `port.identity.kind === "deterministic_fixture"`, **or** remove them and drive the empty-state screenshots from fixture data that genuinely returns zero rows. If any are retained, all six must be documented in the relevant `implementation-notes.md` with an assertion that no value can widen reach, and the `?preview=empty` case must render a visible banner naming it. Note the Management value is exercised by `tests/frontend/three-role-browser-smoke.mjs:913`, which needs another way to reach an empty queue if removed. |
| **Affected routes / files** | the six files/lines above; `UI_REFERENCE_FINAL_MVP/30-parent-dashboard/implementation-notes.md`; `.../32-parent-reports/implementation-notes.md`; `.../29-management-reports/implementation-notes.md:193-195` |
| **Dependencies** | The browser smoke test's empty-state leg. |
| **Test required** | Request each preview URL in a participant build and assert the real governed rows still render; or, if retained as fixture-only, assert the banner is present whenever rows are suppressed. |
| **Operator approval needed** | No — though `29-management-reports/implementation-notes.md` records the Management one as an audited, preserved diagnostic, so its removal should be noted to the F-11 owner. |

### C2C-024 — No route-level `error.tsx`, `not-found.tsx` or `loading.tsx` anywhere in `app/`

| | |
|---|---|
| **Area / screen** | All 17 routes |
| **Figma intent** | Silent — no frame covers a route-level error or 404 boundary. |
| **Governed intent** | `GLOBAL_UI_RULES:89`: unavailable and denied states must remain non-disclosing. `:114`: "Loading, empty, error and success states are announced, not only drawn." Each core `screen.md` §10 repeats that these states are built, not only the happy path. |
| **Current implementation** | The **in-page** pattern is consistent and good: `components/ui/state-panel.tsx` maps every non-success outcome to fixed copy, collapsing `unauthorized` and `unavailable` into one byte-identical branch, and `loading-skeleton.tsx` serves the loading state; all 11 feature surfaces route through them. But a full listing of `app/` shows only `page.tsx`, `layout.tsx`, `globals.css` and `favicon.ico` — **no `error.tsx`, no `global-error.tsx`, no `not-found.tsx`, no `loading.tsx` at any depth**. So (a) an uncaught throw inside a portal route escapes to Next's built-in error page, outside `PortalShell` and outside the governed copy; (b) an unknown path under a portal prefix falls to the default `/_not-found`, also outside the shell (`integrated-route-security.mjs` SEC-11 relies on that bare 404 to prove the guards are not a catch-all, so the 404 exists but is untreated); (c) there is no streaming loading boundary, so each surface re-implements its own skeleton. |
| **Severity** | Medium |
| **Classification** | functional |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Add at minimum `app/(portals)/error.tsx` and `app/not-found.tsx` rendering inside the portal shell and reusing `StatePanel`'s fixed non-disclosing copy. The boundary must **not** interpolate any thrown message, matching `server/contracts/action-result.ts:121-128` ("The raw driver message is NEVER forwarded"). |
| **Affected routes / files** | `app/` (absence); all 17 routes |
| **Dependencies** | None |
| **Test required** | Request an unknown path under each portal prefix while authenticated and assert the governed not-found treatment renders inside the shell; force a throw in one portal page and assert the fixed copy with no thrown-message text in the body. |
| **Operator approval needed** | No |

### C2C-025 — Malformed dynamic route parameters render a second, distinguishable failure panel

| | |
|---|---|
| **Area / screen** | Screen 33 report route; trainer roster read; the two adapter helper selects |
| **Figma intent** | Silent |
| **Governed intent** | `33-parent-class-report/screen.md` §14 and `GLOBAL_UI_RULES:89`: unavailable and denied states must remain non-disclosing and must not reveal whether a student, report or link exists. |
| **Current implementation** | Existence non-disclosure **holds** for well-formed inputs: a wrong-family pair, a non-existent pair and an unsubmitted report all collapse to zero rows and one panel. The residual is narrower and real: `features/parent/parent-canonical-report.tsx:81, 87` passes both route params straight to the RPC with no UUID validation, so a malformed identifier produces PostgreSQL `22P02`, falls to `action-result.ts:121-128`'s default branch and renders the visibly **different** panel "Something went wrong / The operation could not be completed." The same gap exists in `getSessionRosterCore` and at `participant-actions.ts:188, 200`. This distinguishes *malformed* from *valid*, not one real resource from another — it is **not** an enumeration oracle — but it is precisely the channel `server/modules/report-workflow/context-resolver.ts:59-73` was written to close ("Letting it through would surface a driver-level `invalid input syntax for type uuid` error, which is a distinguishable answer and therefore a disclosure channel of its own"), and the rule is applied inconsistently. |
| **Severity** | Low |
| **Classification** | functional |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Apply the context-resolver's UUID pre-check uniformly, returning the same `unavailable` outcome for a malformed value, so shape-invalid and shape-valid-but-unreachable are indistinguishable everywhere as they already are on the `reportId` path. |
| **Affected routes / files** | `features/parent/parent-canonical-report.tsx:81-98`; `server/modules/parent-view/projections.ts:124-138`; `server/modules/report-workflow/trainer-projections.ts` (`getSessionRosterCore`); `server/modules/integration-adapter/participant-actions.ts:184-206, 290-295, 547-555` |
| **Dependencies** | None |
| **Test required** | Request the report route with (a) a malformed studentId, (b) a well-formed non-existent pair, (c) a well-formed other-family pair, and assert the three rendered documents are byte-identical. |
| **Operator approval needed** | No |

### C2C-029 — `StatePanel` defaults to the Trainer portal; two Suspense boundaries render blank

| | |
|---|---|
| **Area / screen** | Shared UI primitive + two Trainer routes |
| **Figma intent** | Silent |
| **Governed intent** | Governance silent, but this is the identical defect class the project already fixed once: `components/brand/brand-mark.tsx:15-27` records that a hardcoded `/trainer` default in a component shared by all three shells meant "on `/parent/reports` and `/management/reports` the FIRST keyboard tab stop announced itself as 'Trainer home' and navigated a Parent or Management user into the Trainer portal." |
| **Current implementation** | `components/ui/state-panel.tsx:9-10` still carries `homeHref = "/trainer"` and `homeLabel = "Return to Trainer workspace"` as **defaults**. Every Management and Parent consumer passes an explicit override (eight call sites verified), so there is **no live cross-portal leak today**. All eight Trainer consumers rely on the default, so every Trainer error/denied state routes to the compatibility alias `/trainer` rather than canonical `/trainer/schedule`, adding a redirect hop on every failure path. The latent hazard is that the next non-Trainer consumer omitting the prop silently inherits a Trainer destination. Separately, the two `Suspense` boundaries wrapping the query-parameter-reading surfaces use `fallback={null}` (`app/(portals)/trainer/schedule/page.tsx:13`, `app/(portals)/trainer/reports/page.tsx:6`), so those pages render completely blank during the streamed segment. |
| **Severity** | Low |
| **Classification** | structural |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Make `homeHref`/`homeLabel` **required** props — the same remedy `brand-mark.tsx` applied at F-01c ("there is no default to fall back to") — and point the Trainer call sites at canonical `/trainer/schedule`. Give the two Suspense boundaries a real labelled skeleton fallback. |
| **Affected routes / files** | `components/ui/state-panel.tsx:9-10` and its eight Trainer consumers; `app/(portals)/trainer/schedule/page.tsx:13`; `app/(portals)/trainer/reports/page.tsx:6` |
| **Dependencies** | None |
| **Test required** | Type-level required-props check; DOM assertion that the Trainer denied-state panel links to `/trainer/schedule` and no Parent or Management denied state contains an href beginning `/trainer`; a non-empty labelled loading region on `/trainer/schedule`. |
| **Operator approval needed** | No |

### C2C-030 — `approved` carries a user-facing label for a state that never commits

| | |
|---|---|
| **Area / screen** | Cross-portal status vocabulary |
| **Figma intent** | The frame's own status words on screen 29 ("Approved" / "Needs approval") are recorded as **mock data** that the ratified statuses override. Node `664:9` shows "Report sent to management for approval" for the trainer's approved state, which is separately and correctly implemented at `trainer-report-review.tsx:664`. |
| **Governed intent** | A-036 and baseline R-8: "`approved` remains transient-in-transaction only … **no operation ever commits with `status = 'approved'`**." A-036 also forbids adding an "in management review" status. |
| **Current implementation** | `components/ui/status-pill.tsx` maps every ratified status to a user-facing word and **adds no status**, which is correct. Two observations: `:13` declares `approved: "Finalising"` with a success tint at `:29` for a state no governed read model can return; and `features/trainer/trainer-assessment.tsx:184` lists it as a reachable step state (`states: ["approved","submitted"]`), with `trainer-roster.tsx:126-131` assigning it a sort ordinal. This is unreachable presentation, not an active leak — but it publishes to a trainer the claim that a resting "Finalising" state exists, which governance says it cannot. |
| **Severity** | Low |
| **Classification** | visual |
| **Disposition** | **defect requiring correction** |
| **Required disposition** | Keep the exhaustive record type (removing the key breaks `Record<DisplayStatus, …>` totality) but annotate it in-file as structurally unreachable per R-8, and fold `approved` into the `submitted` step rather than presenting it as its own attainable stage. Do not invent a ninth label and do not delete the enum value. |
| **Affected routes / files** | `components/ui/status-pill.tsx:13, 29`; `features/trainer/trainer-assessment.tsx:184`; `features/trainer/trainer-roster.tsx:126-131` |
| **Dependencies** | None |
| **Test required** | Type-level assertion that no governed port method can return `approved`; assert the trainer step tracker shows the same number of stages at `trainer_approved` and at `submitted`. |
| **Operator approval needed** | No |

### C2C-034 — T12 `submitted → needs_edit` has no UI path; `submitted` reads as terminal

| | |
|---|---|
| **Area / screen** | Post-submission correction |
| **Figma intent** | Silent — correction tracking and trainer reapproval are among the eight families recorded `Blocked — new design required`. |
| **Governed intent** | Baseline §3.2 T12 and A-028: `submitted → needs_edit` is the ONLY exit from submitted, it creates a clone version, and the previously submitted version stays canonical during correction. |
| **Current implementation** | The RPC exists in the database (`report_reopen_submitted`, present in `server/db/database.types.ts:1675`) but has **no server action and no UI control anywhere** — `server/modules/report-workflow/actions.ts:12-14` records the omission as deliberate: "`reopenSubmitted` (RPC-12) is DELIBERATELY ABSENT: post-submission correction initiation is deferred … and must not be wired to a participant-reachable control." Consequence: once a report is `submitted`, the UI presents no correction affordance, so a published error has no in-app remedy, and the twelve-screen slice cannot demonstrate T12. |
| **Severity** | Low |
| **Classification** | functional |
| **Disposition** | **deferred outside the 48-hour sprint** |
| **Required disposition** | No change during the sprint. **Record explicitly that the ratified fourteen-pair transition set is only thirteen-pair reachable through the UI**, so no acceptance report claims full lifecycle coverage. |
| **Affected routes / files** | `server/modules/report-workflow/actions.ts:12-14`; `server/db/database.types.ts:1675`; no route in the census exposes it |
| **Dependencies** | The deferred management-review design family and its own authorization. |
| **Test required** | n/a this sprint. When built: assert reopen creates a clone at the next `revision_number` while `latest_submitted_version_id` is unchanged. |
| **Operator approval needed** | **Yes** — to record the coverage limitation in the acceptance report. |

### C2C-037 — R-7b silent byte-identical rejection is enforced server-side *(clean)*

| | |
|---|---|
| **Area / screen** | Returned-report path, trainer reapproval |
| **Figma intent** | Silent — no frame exists for trainer reapproval after correction (blocked family). |
| **Governed intent** | Baseline R-7b / `CLAUDE.md` §6: "a **silent** byte-identical save is rejected with a named authored error, so 'the trainer checked and stood by the assessment' is never recorded identically to 'the trainer did nothing'." |
| **Current implementation** | **Enforced, server-side, in the database.** `20260805090500_step_7i_report_lifecycle.sql:1426-1433` computes `v_identical` over the four panels with `IS NOT DISTINCT FROM` and raises `BC021` when `v_r.status = 'needs_edit' AND v_identical AND p_reaffirm_correction_request_id IS NULL`. A supplied reaffirmation id is independently validated at `:1415-1424` to name THIS report's OPEN request. The complementary R-7a prior-approval gate is at `:1770-1776` (`BC011`) and fires **before any INSERT**. The trainer UI sends `reaffirmCorrectionRequestId` only when the explicit reaffirmation radio is chosen (`trainer-report-editor.tsx:102-104`) and disables that radio once the panels change (`:241`). The deterministic fixture mirrors the same rejection, so neither port can bypass it. |
| **Severity** | Informational |
| **Classification** | functional |
| **Disposition** | **governance overrides Figma** |
| **Required disposition** | No change. Recorded as the positive verification requested. |
| **Affected routes / files** | as cited |
| **Dependencies** | None |
| **Test required** | Call `report_save_edit` from `needs_edit` with the four panels byte-equal and the reaffirmation id NULL; assert SQLSTATE `BC021` and that no `report_versions` row was inserted. |
| **Operator approval needed** | No |

### C2C-038 — Trainer approval publishes nothing; Approve & Submit is the sole publisher *(clean)*

| | |
|---|---|
| **Area / screen** | Screens 08, 10, 19 |
| **Figma intent** | Screen 08's frame draws "Confirm & Submit" and "Parent copy"; both were **correctly overridden and recorded** (tracker `:161`, D1/D7) because they are lifecycle claims only management's Approve & Submit can make. |
| **Governed intent** | A-033 / A-036: trainer Approve commits `draft_ready\|needs_edit → trainer_approved`, freezes the version, "**does not publish anything**", and its modal must **not** claim the parent will be notified. Management's Approve & Submit is the one action performing `trainer_approved → approved → submitted` in one transaction. |
| **Current implementation** | Correct on every path read. Trainer: the dialog reads "This sends the Trainer-approved version to management for final quality review. It does not publish the report and does not notify a parent." (`trainer-report-review.tsx:694-695`); the button reads "Approve for management review" (`:702`); the success banner reads "Trainer approval saved — nothing published … Parent visibility is unchanged and no parent notification was promised or sent." (`:667-670`); the frozen-version case is blocked with "Fresh correction version required" (`:562`). Management: `management-report-review.tsx:470-472` — "Approve & Submit publishes the final report, notifies the linked parent … It is the only action that makes this report parent-visible". Server-side, `reopenSubmitted` is deliberately not wired. |
| **Severity** | Informational |
| **Classification** | functional |
| **Disposition** | **governance overrides Figma** |
| **Required disposition** | No change. |
| **Affected routes / files** | `features/trainer/trainer-report-review.tsx:556-570, 657-703`; `features/management/management-report-review.tsx:466-490, 630-660`; `server/modules/report-workflow/actions.ts:12-14` |
| **Dependencies** | None |
| **Test required** | Assert no trainer-reachable surface renders "publish", "parent will be notified" or "parent-visible" as an outcome of Approve, and that trainer approval leaves `latest_submitted_version_id` unchanged. |
| **Operator approval needed** | No |

### C2C-039 — Hash, version and audit exposure closed on Management and Parent surfaces *(clean)*

| | |
|---|---|
| **Area / screen** | Immutability / versioning surface across all three portals |
| **Figma intent** | Screen 19's frame draws "Overall Grade" and a per-dimension grid; both omitted under operator ruling R-B5. |
| **Governed intent** | A-038: never return a report content hash to a parent or to management; management's proof uses a separate, domain-separated hash over the four parent-facing panels only. |
| **Current implementation** | Closed on every surface read. Management's DTO carries `wordingHash` and **no** `contentHash` (`server/modules/management-view/projections.ts:26-33, 66-81`). The parent DTO is exactly `{panels, submittedAt}`. `contentHash` and `revisionNumber` reach the **trainer only**, which is permitted — the trainer already holds the nine ratings the hash covers. There is **no version-history list anywhere**; the only version surface is a single "Revision N" detail row on two trainer screens. No audit row, `entry_hash`, `prev_hash` or audit action reaches any client payload. |
| **Severity** | Informational |
| **Classification** | functional |
| **Disposition** | **governance overrides Figma** |
| **Required disposition** | No change. |
| **Affected routes / files** | `server/modules/management-view/projections.ts:26-33, 66-81`; `server/modules/parent-view/projections.ts:10`; `lib/frontend/contracts/physical-test.ts:149-219`; `features/trainer/trainer-draft-generation.tsx:568`; `features/trainer/trainer-report-review.tsx:604` |
| **Dependencies** | None |
| **Test required** | Static assertion that no type reachable from a management or parent port method contains `contentHash`, `entryHash`, `prevHash` or `revisionNumber`. |
| **Operator approval needed** | No |

### C2C-041 — AUTH-01/02/03: `?role=` is presentation-only and two independent server guards hold *(clean)*

| | |
|---|---|
| **Area / screen** | Root route, login route, all portal layouts |
| **Figma intent** | AUTH-01/02/03 are three role-query variants of a single login presentation; `48H_CORE_SLICE.md:43`: "The role query selects presentation only." |
| **Governed intent** | ADR-4: authorization is decided by RLS plus server-side guards, never by token claims and never by hiding UI. A-046: the role query parameter grants nothing. |
| **Current implementation** | Verified compliant. `app/page.tsx` renders no markup (`Promise<never>`; every path is a redirect) and routes on the server-derived role. `proxy.ts:60-63` states and implements that it "never reads `request.nextUrl.searchParams` at all"; `portal-guard.ts` takes no role parameter; `actions.ts:107` redirects using `portalHomeForRole(result.data.role)`. `features/auth/login-presentation.tsx:74-78` uses `?role=` only to pick a segment and an email placeholder, falling back to trainer presentation for an unrecognised value. Sign-in failure renders **one message from one branch**, so unknown email, wrong password, deactivated account and missing/ambiguous membership are byte-identical. Each portal layout independently calls `requirePortalAccess("<literal>")`, so a proxy misconfiguration alone cannot expose a portal, and `proxy.ts:203-207` returns a wrong-role caller to their own portal root, disclosing not even that the requested path exists. |
| **Severity** | Informational |
| **Classification** | functional |
| **Disposition** | **governance overrides Figma** |
| **Required disposition** | No change. The one gap in the authentication story is the absent sign-out control — C2C-023. |
| **Affected routes / files** | `app/page.tsx`; `app/(auth)/login/page.tsx`; `features/auth/login-presentation.tsx`; `server/modules/identity-access/{actions.ts,portal-guard.ts,portal-destinations.ts}`; `proxy.ts`; the three portal layouts |
| **Dependencies** | None |
| **Test required** | Present: Run C1 gate G-2; `integrated-route-security.mjs` SEC-07 (byte-identity across 15 guarded routes × 3 role values) and SEC-08. The residual `?role=` echo on `/` is already recorded and bounded in Run C1 §10.1 — it discloses only the caller's own supplied value. |
| **Operator approval needed** | No |

### C2C-042 — Six canonical target routes named in Table A have never existed *(not defects)*

| | |
|---|---|
| **Area / screen** | Screens 06, 07, 08, 10, 19, 33 canonical route targets |
| **Figma intent** | `SCREEN_INDEX.md` records canonical routes `/trainer/schedule/[sessionId]/student-roster`, `…/grade-student`, `…/ai-report-generation`, `/trainer/reports/[reportId]`, `/management/students/[studentId]/reports/[reportId]`, `/parent/reports/[reportId]`. |
| **Governed intent** | `FRONTEND_RECONSTRUCTION_TRACKER.md:57-70`, the target-versus-actual block: "The Route column records the ratified CANONICAL TARGET … Six cells name a canonical path that has never been created… **Nothing here is a defect**"; `:70`: "The six canonical-path migrations above are explicitly NOT performed at Run C1 and remain deferred… No working route is deleted." |
| **Current implementation** | All six are absent from the census, exactly as the block predicts, and each screen is served at its pinned implemented path. All six pinned paths were verified to exist and to be linked. Run C1 §10.2: "The twelve-screen flow is navigable on the 17 existing routes." |
| **Severity** | Informational |
| **Classification** | routing |
| **Disposition** | **deferred outside the 48-hour sprint** |
| **Required disposition** | No action. Each migration is a screen-level route move requiring its own authorization; open operator decision 5 (tracker `:182`) governs the timing and is unanswered. |
| **Affected routes / files** | None existing; the six absent paths above |
| **Dependencies** | Open operator decisions 3, 4 and 5 (tracker `:180-182`). |
| **Test required** | None now. When executed, `integrated-route-security.mjs` `CANONICAL_ROUTE_COUNT` (currently 17) and `PORTAL_ROUTES` must be updated in the same change and each preserved path asserted as a redirect. |
| **Operator approval needed** | No |

### C2C-043 — `/trainer`, `/management`, `/parent` compatibility aliases

| | |
|---|---|
| **Area / screen** | The three portal root routes |
| **Figma intent** | `01-trainer-dashboard/screen.md` §1, `11-management-dashboard/screen.md` §1 and `30-parent-dashboard/screen.md` §1 all record "Preserve existing route as redirect — /X redirects to /X/dashboard". |
| **Governed intent** | Operator ruling **R-B1** (tracker `:7`) supersedes the trainer half: `/trainer/schedule` is the canonical Trainer entry route and `/trainer` is preserved as a compatibility redirect. **No equivalent ruling exists for `/management` or `/parent`.** |
| **Current implementation** | `/trainer` is a pure redirect (`app/(portals)/trainer/page.tsx:20` `redirect("/trainer/schedule")`) — approved and correct under R-B1. `/management` and `/parent` instead **render** the deferred dashboards, because their canonical `/management/dashboard` and `/parent/dashboard` targets do not exist and so the recorded redirect cannot be executed. This is the "preserve existing route" half executed without the redirect half — internally consistent with the deferred posture, and both routes are guarded, but it is not the treatment the inventory records. |
| **Severity** | Informational |
| **Classification** | routing |
| **Disposition** | **approved compatibility alias** |
| **Required disposition** | No correction this sprint. Record that `/management` and `/parent` serve screens 11 and 30 in place rather than redirecting, and that the recorded redirect becomes executable only when the deferred canonical dashboards exist. If the operator adopts option (a) of C2C-012, these two routes stop being flow-bearing entirely. |
| **Affected routes / files** | `app/(portals)/{trainer,management,parent}/page.tsx` |
| **Dependencies** | Deferred screens 11 and 30; interacts with C2C-012. |
| **Test required** | Existing coverage adequate — `integrated-route-security.mjs` asserts both are guarded and SEC-09 asserts `/trainer`'s redirect is preserved. |
| **Operator approval needed** | No |

### C2C-044 — `derived_assessment_fact` is a single-point frontend spelling of `assessment_fact`

| | |
|---|---|
| **Area / screen** | Correction issue-scope vocabulary |
| **Figma intent** | Silent — no frame exists for any management-review or correction surface. |
| **Governed intent** | Baseline §4.5 fixes the closed enum as `rating · observation · assessment_fact`, and the migration creates exactly that (`20260805090500_step_7i_report_lifecycle.sql:148-152`). |
| **Current implementation** | The frontend contract spells the third value `derived_assessment_fact` (`lib/frontend/contracts/physical-test.ts:137`), rendered as "Derived assessment fact" / "Assessment-fact review" across five components. **This is not uncontrolled drift**: the translation happens exactly once, in both directions, at `server/modules/integration-adapter/participant-actions.ts:129-135`, and is documented at `adapter-dtos.ts:52-57` as a deliberate contract spelling. The governed enum is never widened and the DB value is never written from the frontend spelling. |
| **Severity** | Informational |
| **Classification** | functional |
| **Disposition** | **approved compatibility alias** |
| **Required disposition** | No change. Confirm the alias remains single-point: any new call site must go through `toAdapterScope`/`toDbScope` rather than comparing the raw string. |
| **Affected routes / files** | `lib/frontend/contracts/physical-test.ts:137`; `server/modules/integration-adapter/participant-actions.ts:125-135`; `server/modules/integration-adapter/adapter-dtos.ts:52-57`; `server/modules/report-workflow/core.ts:307` |
| **Dependencies** | None |
| **Test required** | Static assertion that `"derived_assessment_fact"` appears in no file under `server/modules/report-workflow/` and `"assessment_fact"` in no file under `features/`. |
| **Operator approval needed** | No |

### C2C-046 — Screen 07 → 08 first report creation — **IN FLIGHT UNDER RUN C2 PHASE C2-A**

| | |
|---|---|
| **Area / screen** | Screen 07 save → screen 08 entry |
| **Figma intent** | `48H_CORE_SLICE.md`: screen 07's next screen is 08; the save action leads into AI generation. |
| **Governed intent** | A-036 and the ratified operator ruling that report creation belongs to `requestDraft` (RPC-1), so saving an assessment does not itself advance the report lifecycle. |
| **Current implementation** | **This transition is being changed concurrently under Run C2 Phase C2-A as a separately authorized narrow change and is NOT reported here as a defect.** The **surrounding** navigation was audited and is sound, and should survive the fix unchanged: the success banner renders the continue link only when a real `reportId` came back (`trainer-assessment.tsx:449-461`), routes to `/edit` for a correction and `/generate` otherwise, and states the honest reason when there is none; the roster and rail action resolvers branch per learner on the actual report status and emit no path for a state naming no reachable report. |
| **Severity** | Informational |
| **Classification** | functional |
| **Disposition** | **deferred outside the 48-hour sprint** *(in flight under Run C2 Phase C2-A)* |
| **Required disposition** | **No action in this audit.** After C2-A lands, re-verify that the assessment success banner reaches the `reportId !== null` branch and that the roster's `no_report`/`incomplete` → `observation_saved` transition then routes to `/generate` with the real id. |
| **Affected routes / files** | `features/trainer/trainer-assessment.tsx:437-469`; `features/trainer/trainer-roster.tsx:556-611`; `server/modules/observation/core.ts`; `server/modules/integration-adapter/participant-actions.ts:608-619` |
| **Dependencies** | Run C2 Phase C2-A |
| **Test required** | After C2-A: save all nine ratings on an eligible present learner and assert the success banner renders a "Continue to AI draft" link whose href carries the report id the server returned. |
| **Operator approval needed** | No |

### C2C-047 — The route graph is closed: 17 routes, 0 orphans, 0 dead targets *(clean)*

| | |
|---|---|
| **Area / screen** | Cross-cutting route reachability |
| **Figma intent** | `48H_CORE_SLICE.md` defines the contiguous 1–12 flow; each `screen.md` §1 records its implemented route. |
| **Governed intent** | Run C1 §10.2: "The twelve-screen flow is navigable on the 17 existing routes." |
| **Current implementation** | Every internal `href`, `redirect` and `router.push` across `app/`, `components/` and `features/` (31 distinct sites) was enumerated and resolved against the census. **Every one resolves; nothing 404s; no route is orphaned.** All 17 routes are accounted for — 14 canonical portal routes, `/trainer` as the R-B1 alias, `/` and `/login`. The only conditional edge is screen 07 → 08, which is C2C-046. Additionally, sidebar rendering and active-item derivation are centralized in a single `RolePortalShell` (`portal-shell.tsx:106-124`), and the three portal layouts declare their `requirePortalAccess` guards independently with their own literals — deliberate defence-in-depth, not duplicated authority. That centralization is why C2C-001, C2C-002 and C2C-003 all resolve in one file. |
| **Severity** | Informational |
| **Classification** | routing |
| **Disposition** | **governance overrides Figma** |
| **Required disposition** | No action. Record that the route graph is closed and that R-C2-3 compliance is a single-site change. |
| **Affected routes / files** | all 17 census routes; 31 navigation sites; the five `layout.tsx` files |
| **Dependencies** | None |
| **Test required** | `tests/frontend/integrated-route-security.mjs` already asserts `CANONICAL_ROUTE_COUNT = 17` and that an unknown path 404s (SEC-11). A link-graph crawl asserting every rendered internal href resolves would make this permanent rather than point-in-time. |
| **Operator approval needed** | No |

---

## 9. Rejected claims

Claims raised by an auditor that this synthesis could **not** confirm, or confirmed only in part. None of these is published as a finding in the form the auditor stated it.

| # | Claim as raised | Slice | Verification result | Action taken |
|---|---|---|---|---|
| **R-1** | "`trainer-assessment.tsx` has no attendance or date condition on any render path." | trainer | **Partially false.** Attendance conditions DO exist in that file at `:756`, `:830`, `:856` and `:908`. Re-read confirms they govern the `ReviewApproveRail` — the side rail counting and listing **other** learners in the session — and explicitly exclude absent learners from every bucket ("Absent learners are counted in NO bucket — absence exposes no report state (A-018)"). The audited learner's own load path (`:220-264`) and rubric render carry **no** attendance or session-start condition. | The underlying finding stands and is published as **C2C-011**; the supporting sentence was corrected in place and the correction is footnoted in that row. |
| **R-2** | Frame `527:170` "renders five green Approved rows with a 'View report ›' action", establishing that the frame intends Approved reports to be listed and openable. | management | **Unverified.** This audit did not open any `reference.png` (read-only, no rendering pass). The textual pack record — `29-management-reports/screen.md` §5/§10 — requires only that pending review and correction tracking "are both represented", and `implementation-notes.md` D1 records the frame's status vocabulary as mock data without addressing a missing Approved **list**. | The Figma-intent half is marked unverified inside **C2C-004**; the code half (no filter, no projection) is confirmed and published. The finding rests on R-C2-3's wording, not on the frame. |
| **R-3** | Frame `527:170` "draws exactly ONE 'Reports' rail item, highlighted active." | management, routing | **Sourced textually, not visually.** The claim is supported verbatim by `29-management-reports/implementation-notes.md:298-303` ("the frame's left navigation rail lists six destinations (Dashboard, Students, Trainers, Classes, Schedule, Reports)"), which this agent re-read. The pixels were not inspected. | Published in **C2C-001** with the textual citation and an explicit note that the frame was not opened. The finding does not depend on it — R-C2-3 is binding on its own. |
| **R-4** | The double-`aria-current` and zero-`aria-current` conditions "render in the production DOM". | management, routing, governance | **Confirmed by source, not by DOM.** `portal-shell.tsx:192` and the two identical `path` values at `:80`/`:86` were re-read and are unambiguous, but no browser was run. | Published as **C2C-002** with the derivation stated as source-level. A single browser assertion at the four Management URLs would close it; carried to §10. |
| **R-5** | The Management auditor reported the missing Approved/`submitted` filter as a **High defect**; the Routing auditor explicitly **declined** to report it, citing `29-management-reports/screen.md` §5/§10. | management vs routing | **Both readings are defensible on the evidence.** The code facts are identical and confirmed; the disagreement is purely about whether R-C2-3's word "Approved" is normative. | Published as **C2C-004** with `operator approval needed = Yes` and the disagreement recorded verbatim in §4.4. Not resolved by this synthesis. |
| **R-6** | Any claim about visual fidelity, contrast ratios, viewport behaviour or pixel-level match against a frozen `reference.png`. | trainer, management, parent | **Not attempted by any auditor and not attempted here.** No PNG was opened, no build was rendered, no contrast pair was measured. | No visual-fidelity finding is published. Carried to §10 as an outstanding verification pass. |
| **R-7** | "A `needs_edit` report with no open correction request occurs in the seeded data." | trainer | **Unconfirmed.** The state is established as *legal* from A-035/A-036 and the client dead-end is confirmed in source, but confirming occurrence requires a database read, which is prohibited in this phase. | **C2C-021** is published on the legality + code-path evidence only, with `operator approval needed = Yes` and the occurrence question carried to §10. |
| **R-8** | "`report_list_management_corrections` emits both `needs_edit` and `draft_ready`." | governance | **Inferred, not read.** The auditor read the function's 90-line governing header but explicitly did not read the body's `WHERE` clause; the inference comes from the frontend union at `physical-test.ts:190` and the `ROW_PRESENTATION` map. | **C2C-006** is published on the frontend evidence, which is confirmed and sufficient for the finding (the UI renders both labels under a single-status URL). The SQL predicate is carried to §10. |

---

## 10. Undetermined items

Carried forward verbatim from the auditors where they returned UNDETERMINED, plus items this synthesis could not close. **Each states exactly what is needed.**

| # | Undetermined | Needed to resolve |
|---|---|---|
| **U-1** | **Visual fidelity of every screen against its frozen `reference.png`.** No PNG was opened and no build was rendered in any slice or in this synthesis. Every "Figma intent" column here is textual. | A rendering pass at the reference viewports against a production build, with the frozen PNG SHA-256 checksums verified first, and re-measurement of the contrast pairs recorded at checkpoints F-04…F-09. |
| **U-2** | **Whether R-C2-3's "Approved" names a required third internal filter** on `/management/reports`, or is generic phrasing for "whatever the internal filters are". Drives C2C-004 entirely, and would require a new governed Management submitted-list projection that does not exist. | One operator statement. |
| **U-3** | **Runtime confirmation of the double-active / zero-active sidebar behaviour** in the production DOM (C2C-002). Confirmed by source reading, not by DOM measurement. | Run `tests/frontend/three-role-browser-smoke.mjs` against a production build with an added assertion counting `[aria-current="page"]` in each portal nav at the four Management URLs and the eight deep routes. |
| **U-4** | **Whether screen 09 Trainer Reports is intended to remain Deferred while `/trainer/reports` is occupied by the returned-correction queue** (C2C-007, C2C-022). R-C2-3 rules only on Management. | An operator ruling on whether the Trainer report list is one destination with internal filters, mirroring R-C2-3. |
| **U-5** | **Whether the Trainer surfaces must render a past/present/future distinction inside the 48-hour slice**, or whether the server-side BC017/BC104 refusal is accepted as sufficient (C2C-010). The spec requires the lock but names no UI treatment, and no frozen frame draws a locked session. | An operator call. Downgrading C2C-010 to deferred is entirely legitimate. |
| **U-6** | **Whether a `needs_edit` report with no open correction request actually occurs in the seeded data** (C2C-021). Legality established; occurrence not. | A database read, prohibited in this phase. |
| **U-7** | **The exact Trainer rail item set the operator wants** for the physical test (C2C-022). "Returned reports" appears in no frame and no inventory row. | An operator record classifying it as either Figma-faithful or an approved alias. |
| **U-8** | **Whether an operator ruling exists that previously ratified the two-item Management rail.** Greps of the tracker, the C1 report and `GLOBAL_UI_RULES` for "sidebar", "aria-current", "Pending review" and "Corrections" found none. R-C2-3 supersedes any such ruling in any case. | A pointer to the checkpoint that ratified the rail composition, if one exists — in which case C2C-001 would be re-classified as "governance overrides Figma" rather than a defect. |
| **U-9** | **Whether operator ruling R-B5 or any later ruling also speaks to the Management RAIL** (as opposed to screen 19's frame content). `29-management-reports/implementation-notes.md` D5 explicitly leaves the rail untouched as out-of-owned-paths. | A pointer to a rail-scoped ruling, if one exists. |
| **U-10** | **Whether a Management submitted-report LIST projection exists anywhere outside the read paths.** `physical-test-port.ts`, `management-view/projections.ts` and the adapter's management exports were checked; none found. | A grep of the migrations for a `report_list_management_*` function other than `report_list_management_corrections`. |
| **U-11** | **The exact status predicate inside `public.report_list_management_corrections`** (C2C-006 / rejected claim R-8). The governing header was read; the body's `WHERE` clause was not. | Read `supabase/migrations/20260806103000_management_correction_tracking.sql` function body line-by-line. Read-only; simply not spent. |
| **U-12** | **Whether `/management` and `/parent` should convert to redirects** toward their canonical dashboards (C2C-043), and relatedly which post-login destination the operator wants (C2C-012). No ruling equivalent to R-B1 exists for either. | An operator ruling. |
| **U-13** | **Open operator decisions 3 and 4** (tracker `:180-181`): whether `/trainer/reports/[reportId]/edit` becomes a canonical sub-route of screen 10 or takes its own inventory ID; whether `/management/reports/[reportId]/review`'s two governed surfaces separate. Both recorded OPEN; both `/edit` routes exist and are linked today. | Operator answers; the tracker states these must be answered by the operator, not by a checkpoint. |
| **U-14** | **Whether an uncaught render error inside a portal route leaks any request or row detail** (C2C-024). There is no `error.tsx`, so the fallback is Next's built-in page, whose production output for this build was not observed. | Force a throw in one portal page against a production build and capture the response body. |
| **U-15** | **Whether the Server Action HTTP response bodies for the three parent reads contain exactly the declared DTO keys.** Proved by type and by SQL return shape; no actual response body was captured. | A network-level assertion over the POST responses for the three parent adapter actions, checking the JSON key set against `ParentReportListItemDto` and `CanonicalReportDto`. |
| **U-16** | **Whether a parent's browser can in fact invoke the trainer/management server actions.** `real-participant-port.ts:78-99` imports every adapter action into a module the parent's client bundle loads; whether the action IDs are emitted for an unreferenced action was not confirmed from a built bundle. Consequence is bounded either way — RPC-14's trainer-membership gate and `requireRole` both fail closed, and T7I-67 proves the linked-parent denial in the database. | Grep the production client chunk served to `/parent` for the action IDs of `adapterGetTrainerWorkingReport` and `adapterManagementApproveAndSubmit`. |
| **U-17** | **Whether the multi-child "Viewing" selector on screen 32 renders correctly.** The ratified fixture links exactly one child (dependency BD-2), so `parent-reports-list.tsx:138-159` is type-checked but has never executed against data. | A fixture with two students linked to one parent, then a rendered check that the selector filters rows and that no unlinked student can appear in it. |
| **U-18** | **Whether the `submitted_at` value shown on both Parent surfaces is an acceptable residual inference channel.** A parent noting the "Received" date and later seeing it change can infer republication, which is adjacent to `GLOBAL_UI_RULES:88`. `submitted_at` is nonetheless a mandated column of RPC-13's return contract, so the field is governed, not invented. **This is a governance question, not a code question.** | An operator ruling: accept the residual channel, or show only the ORIGINAL first-submission timestamp. |
| **U-19** | **Whether the vocabulary-implementation cells in the UI pack** (`48H_CORE_SLICE.md` lines 126/150/174/246 and the per-screen §8 blocks) are a frozen point-in-time record or live status. They read as live status and are now false. | An operator statement. If the pack is frozen at its authoring date, only the `CLAUDE.md` and `STATUS.md` halves of C2C-014 stand. |
| **U-20** | **Whether the deterministic fixture port or the real participant adapter is the composed port in the build that will be physically tested.** Both exist and both enforce the R-7b gate, so no finding depends on the answer — but "the server enforces this" is only literally true on the real-adapter build. | Read the runtime env selection in `lib/frontend/adapters/adapter-mode.ts` and the environment it resolves against, and state which mode the physical test runs under. |
| **U-21** | **The primary amendment texts were not read directly.** Specification v3, Amendments 001–006 and `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` were consulted through `CLAUDE.md`'s and the `screen.md` files' citations of them. | If any finding must rest on primary amendment text rather than `CLAUDE.md`'s summary, read that source directly before acting on it. |

---

## 11. Required flow reconciliation

Verdicts: **Supported** (works end to end today) · **Partially supported** (reachable, but a published finding degrades or misstates it) · **Not supported** (no path exists).

### 11.1 Trainer flow

| # | Required step | Verdict | Blocking / degrading finding ids |
|---|---|---|---|
| T1 | Real Supabase sign-in at AUTH-01, non-disclosing single failure branch | **Supported** | — (verified clean, C2C-041) |
| T2 | Land on the Trainer schedule (screen 05) | **Supported** | — (`/trainer` → `/trainer/schedule`, C2C-043) |
| T3 | Find today's class on the schedule | **Partially supported** | C2C-015 (opens on the earliest session), C2C-028 (null times render 12:00 AM) |
| T4 | Distinguish an eligible session from a locked future one | **Not supported** | **C2C-010** |
| T5 | Open the class roster (screen 06); see attendance | **Supported** | — |
| T6 | Enter the assessment for a present learner (screen 07) | **Partially supported** | C2C-011 (no entry gate — a future/absent learner is fully fillable), C2C-017 (no breadcrumb), C2C-018 (false fixture copy) |
| T7 | Rate all nine dimensions, mandatory, with anchors | **Supported** | — |
| T8 | Save the observation, server-validated | **Supported** | — |
| T9 | Continue to AI draft generation with the real report id (screen 08) | **In flight** | **C2C-046 — in flight under Run C2 Phase C2-A** |
| T10 | Request a grounded draft as an explicit act, with a cancel path | **Not supported** | **C2C-008** (fires automatically on mount; no Request, no Cancel) |
| T11 | Understand a refusal accurately when generation is refused | **Partially supported** | **C2C-009** (stale-state branch asserts untrue lifecycle facts) |
| T12 | Review the four panels and edit wording (screen 10) | **Supported** | — |
| T13 | Approve, gated on the three-item checklist, publishing nothing | **Supported** | — (verified clean, C2C-038) |
| T14 | Find a returned report and correct it | **Partially supported** | **C2C-007** (bare `/trainer/reports` denies), C2C-016 (breadcrumb), C2C-022 (rail label) |
| T15 | Reapprove after correction; a silent byte-identical save is refused | **Supported** | — (verified clean, C2C-037) |
| T16 | Handle `needs_edit` with no open correction request | **Not supported** | **C2C-021** (dead end with a false reason) |
| T17 | Know where you are in the portal (active rail item) | **Not supported** on any nested route | **C2C-002**, C2C-003 |
| T18 | Sign out | **Not supported** | **C2C-023** |

### 11.2 Management flow

| # | Required step | Verdict | Blocking / degrading finding ids |
|---|---|---|---|
| M1 | Real Supabase sign-in at AUTH-02 | **Supported** | — (C2C-041) |
| M2 | Land on the ratified next core screen (29 Management Reports) | **Partially supported** | **C2C-012** (lands on the deferred screen-11 dashboard) |
| M3 | Reach Reports from ONE primary sidebar destination | **Not supported** | **C2C-001** |
| M4 | See exactly one active sidebar item on Reports and its sub-states | **Not supported** | **C2C-002** (two active on the index, zero on `/review` and `/edit`), C2C-003 |
| M5 | Filter Pending review internally on that page | **Supported** | — |
| M6 | Filter Corrections internally on that page | **Partially supported** | C2C-006 (the selector misnames the rows it renders) |
| M7 | Filter **Approved** (governed `submitted`) internally on that page | **Not supported** | **C2C-004** (no filter and no projection behind one) |
| M8 | See all authorized centre reports, and only authorized ones | **Partially supported** | C2C-004 — pre-submission reads are correctly gated; submitted reports are invisible |
| M9 | Open a `trainer_approved` report's final-review surface (screen 19) | **Supported** | — |
| M10 | Be structurally unable to touch ratings, observations, attendance, evidence or trainer notes | **Supported** | — (verified clean, C2C-036) |
| M11 | Edit the four parent-facing panels only | **Supported** | — |
| M12 | Return a report to the trainer for an assessment-fact issue | **Supported** | — |
| M13 | Approve & Submit as the sole publish path | **Supported** | — (verified clean, C2C-038) |
| M14 | See the report you just published | **Not supported** | **C2C-004** |
| M15 | Return to the filter you came from after review/edit | **Partially supported** | C2C-026 |
| M16 | Survive a stale or hand-typed Reports deep link | **Partially supported** | C2C-005 (unknown `?status=` renders a denial panel) |
| M17 | Correct a report after submission (T12) | **Not supported** | C2C-034 (deliberately deferred) |
| M18 | Sign out | **Not supported** | **C2C-023** |

### 11.3 Parent flow

| # | Required step | Verdict | Blocking / degrading finding ids |
|---|---|---|---|
| P1 | Real Supabase sign-in at AUTH-03 | **Supported** | — (C2C-041) |
| P2 | Land somewhere that surfaces a new-report notification | **Supported** *(as a derived availability banner)* | C2C-012 recorded as a documentation nuance for Parent; the in-app notification surface is a Blocked-new-design family and correctly not invented |
| P3 | See the reports list (screen 32), only for linked children | **Supported** | — |
| P4 | Open a submitted report (screen 33) | **Supported** | — |
| P5 | Never see ratings, observations, hashes, versions, corrections, audit internals or edit controls | **Supported** — NEVER FETCHED, not fetched-and-hidden | — (verified clean, C2C-035) |
| P6 | Never reach an unsubmitted report | **Supported** — unreachable by construction | — (verified clean, C2C-040) |
| P7 | Receive an identical, non-disclosing response for denial and absence | **Supported** for well-formed input | C2C-025 (malformed params render a second, distinguishable panel) |
| P8 | Have cross-family isolation **proven** | **Not supported** — code correct, proof absent | **C2C-013** |
| P9 | Return from a report to the list | **Not supported** in-page | C2C-027 |
| P10 | Have one primary Reports rail destination (Parent analogue of R-C2-3) | **Supported** | — (rail is exactly Home + Reports) |
| P11 | Sign out | **Not supported** | **C2C-023** |
| P12 | Use the multi-child selector | **Undetermined** | U-17 (fixture links one child; branch never executed) |

---

## 12. Recommended sequencing for a future implementation run

Each wave is independently shippable. Dependencies are strict — a later wave assumes its predecessors landed.

### Wave 0 — Operator decisions (blocking, no code)
Answer the twelve items in §13. **Nothing in Wave 2 or later should start before the R-C2-3 "Approved" question (U-2), the post-login destination question (C2C-012) and the `/trainer/reports` question (C2C-007/U-4) are answered.** Reconcile the governance record (**C2C-014**) first, because a future session reading `CLAUDE.md` §5 today is instructed not to trust the vocabulary code it is looking at.

### Wave 1 — The navigation shell (one file, highest value/risk ratio)
1. **C2C-001** collapse the two Management rail entries to one "Reports" item (desktop + mobile).
2. **C2C-002** fix the dead ternary at `portal-shell.tsx:192` — this simultaneously repairs zero-active-item on all 8 deep routes in all three portals.
3. **C2C-003** share the derivation with the mobile header.
4. **C2C-023** wire the existing `signOutAction` to a Logout control *(same file; needs the shared-shell ownership ruling first)*.

**Dependency note:** 1 and 2 must land together — the prefix fix alone leaves two Management items active, and the collapse alone leaves `/review` and `/edit` with no active item. This wave fully satisfies R-C2-3's sidebar half.

### Wave 2 — Route and entry-point correctness
5. **C2C-007** make bare `/trainer/reports` render (default the parameter, mirroring `management-reports-queue.tsx:78`).
6. **C2C-022** relabel the Trainer rail item to "Reports" *(depends on 5)*.
7. **C2C-016** repoint the screen-10 breadcrumb *(depends on 5)*.
8. **C2C-005** treat an unknown `?status=` as the default filter.
9. **C2C-012** apply the operator's post-login decision.
10. **C2C-024** add `app/(portals)/error.tsx` and `app/not-found.tsx` reusing `StatePanel` copy.

### Wave 3 — Governed-state truthfulness on the Trainer path
11. **C2C-008** replace the screen-08 auto-fire with an explicit Generate + Cancel.
12. **C2C-009** branch the failure state on all three refusal classes *(land after 11 — 11 removes the common trigger, 12 fixes the branch)*.
13. **C2C-011** gate the assessment surface on entry (attendance + scheduled start).
14. **C2C-010** surface session-start eligibility on screens 05/06 *(shares the pinned Asia/Singapore clock with 13 and 15; operator-gated per U-5)*.
15. **C2C-015** default the schedule focus to today.
16. **C2C-021** handle `needs_edit` with no open correction.

### Wave 4 — Copy and diagnostics honesty
17. **C2C-018**, **C2C-019** remove or adapter-gate the fixture copy.
18. **C2C-020** gate or remove the six `?preview=` branches *(coordinate with `three-role-browser-smoke.mjs:913`)*.
19. **C2C-030**, **C2C-031** status vocabulary corrections.
20. **C2C-028** empty-clock-time branch.
21. **C2C-025** uniform UUID pre-check.
22. **C2C-029** required `StatePanel` props + real Suspense fallbacks.
23. **C2C-017**, **C2C-026**, **C2C-027** breadcrumb and return-affordance gaps.

### Wave 5 — Backend-dependent, separately authorized
24. **C2C-013** fixture expansion + the parent cross-family negative. *(Highest governance value in this wave — it closes the one boundary `CLAUDE.md:130` names that is currently unproven.)*
25. **C2C-004** governed Management submitted-list projection + the Approved filter *(only if the operator answers U-2 affirmatively; must not become a second route or a second rail item)*.
26. **C2C-006** rename the queue selector *(coordinate with 25 so the alias set changes once)*.
27. **C2C-032**, **C2C-033** projection round-trip reductions.

### Deferred, explicitly not in any wave
**C2C-034** (T12 UI path), **C2C-042** (six canonical route migrations), **C2C-045** (screens 30/31/33 route targets), **C2C-048** (Management queue columns/filters awaiting backend fields). All four are ratified-deferred and must not be closed by fabrication.

---

## 13. Operator decisions still required

| # | Decision | Findings gated | Why it cannot be decided by a checkpoint |
|---|---|---|---|
| **D-1** | Does R-C2-3's word **"Approved"** require a third internal filter over `submitted` reports on `/management/reports`? | **C2C-004**, C2C-006 | Two auditors read the same evidence oppositely. A new governed Management projection is backend work the current adapter cannot express. |
| **D-2** | Should the post-login destination for **Management** (and **Parent**) be the ratified next core screen (`/management/reports`, `/parent/reports`), or is the dashboard fold accepted for the physical test under a ruling analogous to R-B1? | **C2C-012**, C2C-043 | The current state matches neither the core slice nor any recorded ruling. |
| **D-3** | Should bare **`/trainer/reports`** render (one destination with internal filters, mirroring R-C2-3) while screen 09 stays Deferred? | **C2C-007**, C2C-016, C2C-022 | R-C2-3 rules only on Management. Screen 09's inventory row is Deferred while its canonical route is occupied. |
| **D-4** | Must the **Trainer surfaces render a past/present/future session distinction** inside the 48-hour slice, or is the server-side BC017/BC104 refusal sufficient for the physical test? | **C2C-010** | The spec mandates the lock but names no UI treatment, and no frozen frame draws a locked session. |
| **D-5** | What is the **ratified Trainer rail item set and labelling** for the physical test? ("Returned reports" appears in no frame and no inventory row.) | **C2C-022** | It can be classified as neither Figma-faithful nor an approved alias without an operator record. |
| **D-6** | May `components/layout/portal-shell.tsx` — declared **outside the owned paths** at F-11, F-14 and F-15 — be modified, and by whom? | **C2C-001**, C2C-002, C2C-003, **C2C-023** | Every navigation-shell fix in Wave 1 lands in a file no screen checkpoint has been authorized to touch. **This is the single highest-leverage decision in this list.** |
| **D-7** | May the **Step 7F fixture be expanded** to two parents and two students so the cross-family negative can be written? If not, is the boundary carried as explicitly **UNPROVEN** in the physical-test sign-off? | **C2C-013** | `CLAUDE.md` §11 defers rather than deletes the broader fixture shape, and Step 7F deviation is separately governed. |
| **D-8** | Approve reconciling **`CLAUDE.md` §5 and `STATUS.md`** to the merged Amendment 006 state, retaining the superseded text in a dated Historical block. | **C2C-014** | `CLAUDE.md` is the standing contract; it may not be edited on a checkpoint's own authority. Related: are the pack's vocabulary-status cells frozen or live (U-19)? |
| **D-9** | May the ratified **`?status=` compatibility aliases be renamed** to queue names (`?queue=corrections`)? | **C2C-006** | The current spellings are recorded as ratified aliases at `29-management-reports/screen.md:18`. |
| **D-10** | Is a **`needs_edit` report with no open correction request** expected to occur, and if so should approval be enabled per A-035 or blocked with an accurate reason? | **C2C-021** | Occurrence could not be confirmed without a prohibited database read. |
| **D-11** | Is a **changed "Received" date** on a Parent surface an acceptable residual inference channel, or should Parent surfaces show only the original first-submission timestamp? | U-18 | A governance question about a mandated RPC-13 return column, not a code question. |
| **D-12** | Authorize the **post-sprint projection work** (Management learner-identity projection, Parent governed list RPC) and record that **T12 is UI-unreachable**, so no acceptance report claims full lifecycle coverage. | **C2C-032**, C2C-033, **C2C-034** | Both are migrations/backend changes needing their own authorization; the coverage limitation must be stated by the operator in the sign-off. |

Additionally, the following **pre-existing open decisions** in `FRONTEND_RECONSTRUCTION_TRACKER.md` remain unanswered and touch the route census: decision 3 (`:180` — whether `/trainer/reports/[reportId]/edit` is a canonical sub-route of screen 10 or takes its own inventory ID), decision 4 (`:181` — whether `/management/reports/[reportId]/review`'s two governed surfaces separate), and decision 5 (`:182` — whether the six canonical route moves happen before the physical test or after integration). See C2C-042 and U-13.

---

*End of Run C2 Phase C2-C reconciliation. This document records findings only. No finding in it was implemented by this phase.*
