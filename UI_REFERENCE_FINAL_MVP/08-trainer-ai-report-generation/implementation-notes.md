# 08 - Trainer AI Report Generation - implementation notes

**Append-only.** Add a new entry at the bottom for every implementation checkpoint touching this screen. Never edit or delete an existing entry - a superseded entry is corrected by a later entry that says so.

---

## Entry template - copy below the last entry

```
Timestamp (Asia/Singapore):
Source branch:
Starting commit:
Screen ID:                     08
Existing route audited:
Components preserved:
Components replaced:
Components created:
DTO and port changes:
Fixture changes:
Backend dependencies discovered:
Vocabulary dependencies:
Governance blockers:
Browser viewport:
Before screenshot:             implementation-before.png
After screenshot:              implementation-after.png
Validation:
Ending commit:
Acceptance status:
```

**Rules.**

- Record a missing backend path or a missing governance decision as a **dependency**. Never invent it.
- Record a frame-versus-governance discrepancy. Never resolve it locally.
- Synthetic data only in any captured screenshot.
- One bounded screen checkpoint, or one tightly coupled shared-shell checkpoint, per commit.

---

## Entries

```
Timestamp (Asia/Singapore):    2026-08-06
Source branch:                 feat/48h-frontend
Starting commit:               d1883db9cd977f294747f4baad728d1be5bcebda
Screen ID:                     08
Checkpoint:                    F-01a — bounded WCAG 2.2 AA accessibility correction.
                               NOT a screen reconstruction. This screen's visual acceptance
                               status is unchanged and remains Not started.
Existing route audited:        /trainer/reports/[reportId]/generate
Components preserved:          all — no component was replaced, created, moved or restructured
Components replaced:           none
Components created:            none
DTO and port changes:          none
Fixture changes:               none
Backend dependencies discovered: none new
Vocabulary dependencies:       none. No rating label, Class Grade label or copy string was touched.
                               Amendment 006 V3 remains pending and unauthorized.
Governance blockers:           none
Change made on this screen:    features/trainer/trainer-draft-generation.tsx:142
                               bg-brand-600 (#ec4899, 3.53:1 on white text — live AA failure)
                               -> bg-brand-700 (#d6357a, 4.517:1 measured — passes AA)
                               hover:bg-brand-500 (#f472b6, 2.65:1 — failing worse than rest)
                               -> hover:bg-brand-800 (#b02a63, 6.255:1 measured — passes AA)
                               This is the same primary-action pair the F1 foundation already
                               uses in components/ui/button.tsx and components/ui/state-panel.tsx.
                               No token VALUE in app/globals.css was changed.
Excluded, deliberately:        components/brand/brand-mark.tsx:46 (logotype — WCAG-exempt, R-B8
                               requires the approved mark unaltered) and
                               features/trainer/trainer-assessment.tsx:212 (progress-bar fill
                               carrying no text). Both verified untouched in the diff.
Browser viewport:              1440 x 1100 (measurement run); browser smoke suites at their own
                               recorded viewports
Before screenshot:             not captured — this checkpoint proposes no visual acceptance and
                               changes no layout; contrast was measured numerically instead
After screenshot:              not captured — see above
Validation:                    all 12 frozen reference.png SHA-256 verified unchanged before and
                               after; tsc --noEmit exit 0; eslint . exit 0; npm run build exit 0
                               with route census unchanged at 16; compiled
                               design-foundation.assertions.ts exit 0; trainer-browser-smoke.mjs
                               exit 0; three-role-browser-smoke.mjs exit 0;
                               authentication-browser-smoke.mjs exit 0; git diff --check exit 0;
                               zero uncaught browser-console/runtime errors. Measurements at
                               UI_REFERENCE_FINAL_MVP/_checkpoint-evidence/F-01a/
Ending commit:                 the commit created by
                               "fix(frontend): use an accessible brand token for white-label
                               actions (WCAG 2.2 AA)"
Acceptance status:             Not started (unchanged) — F-01a claims no screen visually accepted
Recorded, not fixed:           text-brand-600 (#ec4899) remains in use as FOREGROUND text on
                               white (3.53:1) and on brand-100 (3.84:1) surfaces. That is a
                               further AA failure, outside this checkpoint's owned paths, and is
                               reported for separate authorization rather than swept in.
```

```
Timestamp (Asia/Singapore):    2026-08-06
Source branch:                 feat/48h-frontend
Starting commit:               50e0ee286d7083bd6dbe201bca56009d73ae65c4 (tree clean at start)
Screen ID:                     08
Checkpoint:                    FRONTEND RECONSTRUCTION F8 — Trainer AI Report Generation.
                               OUTCOME: BLOCKED — OPERATOR DECISION REQUIRED.
                               NO application code was written. No commit was created.
                               The worktree was left exactly as found.
Existing route audited:        /trainer/reports/[reportId]/generate
                               (app/(portals)/trainer/reports/[reportId]/generate/page.tsx ->
                               features/trainer/trainer-draft-generation.tsx)
Components preserved:          all — nothing replaced, created, moved or restructured
Components replaced:           none
Components created:            none
DTO and port changes:          none
Fixture changes:               none

PRIMARY BLOCKER — rating vocabulary (F6 / Amendment 006 V3 not landed)

  The premise that this screen "renders no rating value" is FALSE against the frozen
  reference. reference.png node 784:340 renders competency rating labels in two places
  in the right rail:

    1. Report Details -> "Overall Grade: Mastering"
    2. PERFORMANCE SUMMARY -> a four-tile per-dimension rating grid:
         SPEECH -> MASTERING          TONALITY -> MASTERED
         EYE CONTACT -> BEGINNING     AUDIENCE AWARENESS -> DEVELOPING

  These are Amendment 006 A-049 competency labels, not Class Grade labels (the Class
  row reads "Junior . Public Speaking"; no Beginner/Intermediate/Advanced appears).

  The frontend union in lib/frontend/contracts/physical-test.ts:1-8 is still
  RATING_LEVELS = emerging | developing | secure | advanced — the expected pre-V3 state,
  which FRONTEND_RECONSTRUCTION_PLAN.md section 5 (F6) says must not be "fixed" without
  the V3 authorization, and CLAUDE.md section 12 (Amendment 006) lists implementing
  frontend labels without V2/V3 authorization as a stop-and-ask.

  Both available options are prohibited inside this checkpoint:
    - rendering Beginning/Developing/Mastering/Mastered = performing Frontend V3
      without its authorization (CLAUDE.md section 12; GLOBAL_UI_RULES 12.5);
    - rendering emerging/developing/secure/advanced = contradicting BOTH the frozen
      reference and Amendment 006, which the plan states explicitly for the sibling
      rating-bearing screen at F7.
    - omitting the Performance Summary panel = silently resolving a frame-versus-
      governance conflict, which section 1.3 of GLOBAL_UI_RULES forbids.

  This is corroborated independently: FRONTEND_RECONSTRUCTION_TRACKER.md already
  records F8 dependency "F6 . F7", status "Blocked by F6", and F7 itself is unstarted.

SECONDARY BLOCKERS — recorded, not invented, not worked around

  B1. Term-report framing. The card header reads "Term Report — Alicia Gomez /
      Public Speaking . Term 1, 2035 . Parent copy". End-of-term report GENERATION is
      explicitly out of MVP scope (CLAUDE.md section 5 and section 8; GLOBAL_UI_RULES
      section 4 "Term-report generation is out of MVP scope and separately governed").
      The governed surface at this route is the nine-dimension session draft, not a
      term report. Frame-versus-governance discrepancy; the rule wins; recorded here.

  B2. Class Video Evidence upload zone ("Drag & drop class recordings or click to
      upload, MP4/MOV up to 500MB each"). Evidence scope AND uploader are UNRESOLVED
      (Amendment 002 A-014); evidence schema is excluded from Step 7E and assigned to
      "later evidence work"; no evidence upload path exists in the frontend port. The
      only evidence token in lib/frontend/contracts/physical-test.ts is the boolean
      checklist item evidenceConfirmed, which is not media upload. Building this zone
      would invent backend behaviour and would risk silently transferring the deferred
      TA upload permission to the trainer, which A-014 expressly forbids. DEPENDENCY.

  B3. Report Details field inventory. The frame shows Name / Class / Lesson
      ("4 . Expressive Delivery") / Term ("Term 1 . 2026") / Overall Grade.
      DraftGenerationContextDto exposes only reportId, studentDisplayName,
      observationLockVersion and status. Lesson, Term, Class label and Overall Grade
      have no governed projection field. Visible field definitions missing =
      stop-and-ask (CLAUDE.md section 7.2). DEPENDENCY.

  B4. "Confirm & Submit" as a trainer primary control, with no Quality Checklist
      anywhere in the frame. The trainer action is Approve, gated on the three-item
      version-scoped checklist, and the trainer PUBLISHES NOTHING (A-033, A-036,
      GLOBAL_UI_RULES section 3). The frame's own subcopy "This sends to the
      management for final approval" is consistent with trainer_approved, but the
      control label and the absent checklist gate are not. Also note this screen is
      the GENERATION screen; approval belongs to screen 10 (F9). Frame-versus-
      governance discrepancy, recorded; the rule wins.

  B5. Four editable panels on the generation screen. Editing and the panel DTO belong
      to the review/edit surfaces (screen 10 / F9). Whether ID 08 legitimately carries
      an editable panel surface is a scope question the frame alone cannot authorize
      (Amendment 005: screen presence is not authorization). Recorded for the operator.

Backend dependencies discovered: evidence media upload path (B2); trainer report-details
                               projection carrying Lesson / Term / Class label / overall
                               grade (B3). Neither invented, stubbed or faked.
Vocabulary dependencies:       F6 / Amendment 006 Frontend V3 — hard gate, see PRIMARY.
                               No rating label, Class Grade label or copy string was
                               touched. No global keyword replacement performed (A-054).
Governance blockers:           PRIMARY + B1 + B2 + B4 above.
Browser viewport:              not rendered — no code change to render; per
                               FRONTEND_RECONSTRUCTION_PLAN.md section 10, no speculative
                               change was made
Before screenshot:             not captured — blocked before implementation began
After screenshot:              not captured — blocked before implementation began
Validation:                    reference.png SHA-256 verified
                               3160524f41fc84cd20e7f5bf8f2b9e6a1215354c17faf5b3b31644d54eae20c4
                               (172,209 bytes) before AND after — unchanged.
                               Baseline only, on an unmodified tree:
                               node_modules/.bin/tsc.cmd --noEmit exit 0;
                               node_modules/.bin/eslint.cmd . exit 0.
                               npm run build, the three browser smoke suites and
                               git diff --check were NOT run: zero lines of code changed,
                               so they would have re-measured the F-14 baseline and
                               proved nothing about this checkpoint. Stated plainly
                               rather than reported as if they validated work.
Ending commit:                 NONE — no commit was created. git status --porcelain empty.
Acceptance status:             Not started (unchanged). F8 claims no screen visually accepted.
```

```
Timestamp (Asia/Singapore):    2026-08-06
Source branch:                 feat/48h-frontend
Starting commit:               b80b29566525a3f8e106f67c5846ba0365f90541
Screen ID:                     08
Checkpoint:                    F-08 RETRY — full visual reconstruction to node 784:340.
                               Supersedes the immediately preceding BLOCKED entry: that
                               entry's finding was ACCEPTED and its PRIMARY blocker (the
                               ratified vocabulary not being live on the branch) was
                               DISCHARGED by F6, commit 5dcbeeb, verified. The remaining
                               blockers were NOT resolved here — they were handled by
                               governance-wins-and-record, the F-14 / F-11 treatment.
Existing route audited:        /trainer/reports/[reportId]/generate — PINNED. The canonical
                               route
                               /trainer/schedule/[sessionId]/student-roster/[studentId]/
                               grade-student/ai-report-generation and its "replace after
                               integration; pinned path preserved as a redirect" treatment
                               remain UNEXECUTED and require their own authorization.
                               No route was created, moved, renamed or redirected.
Components preserved:          the pinned route and its page wrapper; the fixture-port /
                               AiDraftProvider boundary; deterministic grounding; explicit
                               provider selection with no silent choice; the governed draft
                               store/cancel path; the single-flight generation guard; and
                               the four smoke-load-bearing strings "Draft rejected safely",
                               "Retry once", "Grounded draft ready" and "Review four-panel
                               report".
Components replaced:           the whole presentation of features/trainer/
                               trainer-draft-generation.tsx. The previous single-column
                               max-w-3xl banner/card stack became the frame's two-column
                               composition: page title + breadcrumb + pink Back pill +
                               lifecycle pill; a generated-draft card (square avatar, pink
                               "AI Draft — <learner>" title, class/date/working-version
                               subtitle, four icon-led bullet-led panels with a per-panel
                               edit affordance); the Class Video Evidence region; and a
                               right rail of Report Details, Performance Summary and the
                               frame's dark action panel. The local GeneratingCard and
                               PageIntro helpers were replaced by PageHeader + DetailRow.
Components created:            none shared. PANEL_PRESENTATION and RATING_TILE_STYLE are
                               local presentation maps kept byte-identical in intent to the
                               screen-10 surface so one governed panel or rating never
                               changes identity between two Trainer screens. No new shared
                               primitive, token, icon or component was added.
DTO and port changes:          NONE. lib/frontend/contracts/, lib/frontend/fixtures/ and
                               lib/frontend/physical-test-port.ts are byte-unchanged. The
                               rail and tiles are read through the EXISTING governed
                               projections getTrainerWorkingReport + listTrainerSessions,
                               called only AFTER a validated draft is stored.
Fixture changes:               none.
Backend dependencies discovered:
                               D-1 TERM-REPORT GENERATION. The frame is a Term Report
                               ("Term Report — Alicia Gomez · Public Speaking · Term 1,
                               2035 · Parent copy"). End-of-term report GENERATION is
                               expressly out of MVP scope (CLAUDE.md sections 5 and 8;
                               v3 section 28) — the End-of-Term Performance Report is a
                               separate 7-criteria / Excellent-Good-Needs Improvement
                               instrument whose evidence is captured now and whose
                               generator is not built. NOT BUILT. Recorded as a dependency:
                               if the frame is meant to be authoritative this is an
                               amendment, not a frontend fix.
                               D-2 LESSON and TERM. No governed Trainer projection carries
                               a lesson number, lesson title or term. Omitted, and the
                               omission is stated on screen.
                               D-3 EVIDENCE UPLOAD/READ. PhysicalTestPort exposes no
                               evidence path in either direction; the evidence schema is
                               outside the Step 7E boundary. No uploader invented.
                               D-4 REFUSED-GENERATION ROUTING. DraftGenerationContextDto
                               carries no sessionId/studentId, so the validation state
                               cannot link to the assessment surface. It routes to the
                               schedule and says why, rather than guessing a route.
Vocabulary dependencies:       DISCHARGED. F6 (commit 5dcbeeb) landed the ratified
                               vocabulary on this branch, so this rating-bearing TRAINER
                               surface renders Beginning / Developing / Mastering /
                               Mastered from the single declared RATING_DISPLAY_LABELS map
                               (A-049) — never a hand-written label. Class Grade remains
                               Beginner / Intermediate / Advanced, is a DIFFERENT unchanged
                               vocabulary (A-054), and marks itself
                               data-vocabulary="class-grade" so a token guard classifies by
                               ACTUAL CONTEXT. NO global keyword replacement over
                               advanced/secure/emerging/beginning/mastering/mastered was
                               performed anywhere.
Governance blockers:           NONE outstanding. Four frame-versus-governance conflicts
                               were resolved BY GOVERNANCE and RECORDED, never silently:
                               D1 TERM REPORT / "Parent copy" — term generation out of
                                  scope (above); and "Parent copy" is a lifecycle claim
                                  only management's Approve & Submit can make (A-033).
                                  Both omitted; reconstructed as the governed per-session
                                  draft surface.
                               D3 CLASS VIDEO EVIDENCE — the frame draws a working
                                  drag-and-drop uploader with an "MP4, MOV · up to 500MB
                                  each" policy. Evidence scope AND uploader are UNRESOLVED
                                  (A-014), no governed upload path exists, and
                                  "Evidence Pending" is deliberately not a stored status
                                  (A-036). Region KEPT and rendered INERT with a visible,
                                  programmatically associated reason. No uploader invented;
                                  the format and size limits omitted rather than fabricated
                                  as unratified policy.
                               D4/D5 REPORT DETAILS — Lesson and Term omitted (D-2 above).
                                  "Overall Grade: Mastering" omitted OUTRIGHT: a single
                                  headline rating would be a DERIVED ASSESSMENT FACT this
                                  frontend computed, the class of claim A-034/A-035 reserve
                                  to the governed assessment, and the 9-to-7 roll-up and
                                  4-to-3 scale map remain PROVISIONAL (CLAUDE.md section 5)
                                  and belong to the unbuilt term generator anyway. The nine
                                  governed snapshots are shown instead.
                               D7 "CONFIRM & SUBMIT" / "SAVE AS DRAFT" — contradicts the
                                  ratified two-stage workflow (A-033, A-036) three ways:
                                  the Trainer action is APPROVE not submit; THE TRAINER
                                  DOES NOT PUBLISH; and the gate is the three-item
                                  version-scoped Quality Checklist the frame draws nowhere.
                                  The GOVERNED action was implemented instead — the panel
                                  hands off to Review & Approve and states the gate and the
                                  two-stage sequence plainly. "Save as draft" omitted: the
                                  validated draft is already stored as an immutable version
                                  by generation, so a second save affordance would be an
                                  invented mutation.
                               Also recorded: D2 the frame's Overview/Strengths/Areas to
                               Grow/Remarks headings are not a rename of the governed four
                               panels (F9 D2 treatment); D6 the four Performance Summary
                               tiles are reproduced across ALL NINE mandatory dimensions
                               (A-017) because no governed rule selects a subset; D8 the
                               REVIEW & APPROVE rail and D9 the left nav are outside owned
                               paths.
                               THE STOP CONDITION WAS EVALUATED AND DID NOT FIRE: after the
                               omissions a governed screen genuinely remained, so it was
                               built rather than re-blocked.
AI governance:                 Grounding runs BEFORE any draft reaches this screen
                               (CLAUDE.md section 4, non-negotiable 1) — requestDraft is
                               the whole RPC-3 to grounding to RPC-4/RPC-5 path, a
                               rejection returns generation_failure, and the rejected
                               wording is NEVER rendered. Panels and ratings are read back
                               only AFTER a stored validated draft exists, so unvalidated
                               model output is never displayed. The content hash is never
                               rendered (A-038). AI never approves, submits or publishes.
                               The failure state preserves the assessment and offers one
                               bounded retry as a designed recovery (spec section 15), not
                               a generic error toast.
States built:                  loading, drafting (all forward actions disabled), grounding
                               failure + bounded retry, nine-rating validation refusal
                               (no retry offered — retrying cannot satisfy the
                               precondition), empty (generation succeeded but the governed
                               projection returned nothing readable; nothing reconstructed
                               from the generation response), non-disclosing unavailable,
                               and the settled ready state the frame draws.
Browser viewport:              1400 x 2000 CSS px, production build (next build +
                               next start on port 3308) — never a cold dev server.
Before screenshot:             implementation-before.png — NOT captured. The pre-existing
                               surface was never frozen at this checkpoint and no
                               speculative capture was fabricated.
After screenshot:              ai-report-generation.png and generation-first-failure.png,
                               written OUTSIDE Git to
                               UI_REFERENCE_FINAL_MVP\_checkpoint-evidence\F-08\.
                               Synthetic fixture data only.
Validation:                    reference.png SHA-256
                               3160524f41fc84cd20e7f5bf8f2b9e6a1215354c17faf5b3b31644d54eae20c4
                               (172,209 bytes) verified BEFORE and unchanged AFTER.
                               npx tsc --noEmit exit 0; npx eslint . exit 0;
                               npm run build exit 0 with the ROUTE CENSUS UNCHANGED at 17
                               application routes plus /_not-found;
                               node tests/frontend/trainer-browser-smoke.mjs exit 0;
                               node tests/frontend/three-role-browser-smoke.mjs exit 0;
                               node tests/frontend/authentication-browser-smoke.mjs exit 0;
                               git diff --check exit 0. All three smokes ran against the
                               production build with ZERO uncaught browser-console/runtime
                               errors. The smoke now proves in the production DOM that no
                               panel and no rating renders while the draft stands rejected,
                               that no term-report or "Parent copy" framing appears, that
                               no Confirm & Submit or Save as draft control exists, that no
                               Lesson/Term/Overall Grade row exists, that the evidence
                               region is inert with no uploader, and that all nine ratified
                               rating tiles clear 4.5:1 (measured 5.134:1 - 5.733:1).
                               One harness correction: the screen-10 hand-off waited on the
                               text "Quality Checklist", which screen 08 now legitimately
                               names in its hand-off copy; the wait is now keyed on the
                               three real checklist inputs. Found by the suite failing.
Ending commit:                 the commit created by
                               "feat(frontend): reconstruct trainer AI report generation"
Acceptance status:             Proposed visually accepted — pending operator review.
```


---

## GOVERNANCE CONFLICTS RECORDED - 2026-08-08 (Final MVP Phase A2, operator ruling Q-24)

**These are conflicts between the ratified Figma reference for this screen and B.E.S.T governance. Governance WINS. Do not build the reference behaviour described below.**

Source of record: `UI_REFERENCE_FINAL_MVP/FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md` (GC register, declared authoritative by `FINAL_MVP_AUTHORITY_LOCK.md` section 28.2). The `reference/` tree is VISUAL rank 1 but FUNCTIONAL rank 5 (lowest) - it cannot override a functional, privacy or security rule.

- **GC-1 — The frame shows a Term Report marked "Parent copy" with "Confirm & Submit" / "Save as draft". Term generation is OUT of MVP scope (CLAUDE.md sections 5/8; spec section 28). A-033: the trainer does not publish, and only Management may make a parent-facing claim. A-036 governs the eight report_status values. DO NOT BUILD term generation or a trainer publish control here.**

**No authoritative visual bytes (PNG or HTML) were altered by this recording.**


### UI RECONCILIATION plan Phase 6 (`F-UI-DRIFT-1` bucket (c)) — 2026-08-10

```
Timestamp (Asia/Singapore):    2026-08-10
Source branch:                 develop (DEVELOPMENT CLONE)
Starting commit:               1c93a4f
Screen ID:                     08
Existing route audited:        Yes. Route unchanged. Route census 17, unchanged.
Components preserved:          components/ui/* byte-unchanged. REPORT_PANEL_CONFIG and every
                               non-happy-path branch byte-unchanged in behaviour.
Components replaced/created:   None.
DTO and port changes:          NONE.   Fixture changes: NONE.   CSS: none.
Vocabulary dependencies:       None new.
Governance blockers:           NEW-QUESTION: none. INCOMPLETE: none.

SCOPE:                         Visual reconciliation ONLY against
                               UI_REFERENCE_FINAL_MVP/reference/Trainer - AI Report
                               Generation/ (A-056). The .html export was read for VALUES ONLY.

WHAT THIS FRAME LEAVES COMPARABLE:
                               MOST OF THIS FRAME IS GOVERNANCE-BLOCKED, and that is the
                               phase's defining fact. Its title block, its third panel heading,
                               its Report Details rows, its four-tile Performance Summary, its
                               whole action stack and its evidence uploader are ALL registered
                               divergences. Only the geometry and type of the surviving regions
                               were reconciled.

TRUE-DRIFT RESOLVED:           13. Full table: docs/plan/UI_RECONCILIATION_BATCH_3_ADJUDICATION.md
                               Phase 6 section 6.2.

REGISTERED-OMISSION PRESERVED: 10, ZERO CHANGED - D1 not a term report and no "Parent copy";
                               D2 OD-4 canonical panel headings, NOT the frame's "Areas to
                               Grow"; D3 evidence region inert with a reason and NO uploader,
                               format or size limit invented (the Trainer IS the ruled
                               uploader; the path is UNBUILT, not undecided); D4 no Lesson or
                               Term rows; D5 no "Overall Grade"; D6 ALL NINE governed snapshots
                               rather than the frame's arbitrary four; D7 no "Confirm & Submit"
                               and no "Save as draft" - the Trainer approves and does not
                               publish; D8/D9 rails are Phase 0; D10 the drafting, failure-and-
                               retry, nine-rating-refusal, empty and disabled states ALL
                               SURVIVE - no branch removed, only heading type moved.
                               VERIFIED TWO WAYS: each divergence comment intact, AND every
                               prohibited frame string ("Term Report", "Parent copy", "Areas to
                               Grow", "Overall Grade", "Confirm & Submit", "Save as draft",
                               "500MB", "MP4") grepped in the component and found ONLY inside
                               those comments, NEVER in rendered JSX.
                               Reported as a SEPARATE list from TRUE-DRIFT (plan 6.5).

Browser viewport:              n/a - see below.
Before/After screenshot:       NOT CAPTURED.
                               *** RENDERED CAPTURE IS **NOT-RUN**, WITH ITS REASON. ***
                               Screen 08 is AUTHENTICATED; reaching a governed database here is
                               a CLAUDE.md 12 stop-and-ask no current authorization carries. No
                               capture manufactured; no hosted or paid service contacted.
                               NOT-RUN is not PASS.
                               ALSO NOT CAPTURED: each non-happy-path state as its own view,
                               which the build plan asks for. Their EXISTENCE is verified in
                               source; their APPEARANCE is not.
Validation:                    tsc 0 - eslint 0 - build 0 - route census 17 UNCHANGED
                               emitted-CSS verification 14/14 OK
                               reference.png SHA-256 3160524f... verified UNCHANGED.
                               No governed surface touched. No dependency added.
Ending commit:                 recorded in docs/progress/STATUS.md and in the adjudication
                               Commits table (filled one phase late).
Acceptance status:             PASS is this session EVIDENCE verdict only.
                               Accepted is OPERATOR-SET ONLY and has NOT been set.
```

---

## 2026-08-10 — HERO CHAIN **PHASE 6** — `08` Trainer AI Report Generation (development clone, `develop`)

**Track:** hero chain completion, plan §8 Phase 6. **Branch/worktree:** `develop` / none. **Starting HEAD:** `ef65a5d`.

### Scope

The frame's **Lesson** row in Report Details, built from the governed session projection. **Class context was already there**, so the row is the whole visible delta. NULL still means NOT RECORDED and the row disappears entirely.

**D4's lesson half is DISCHARGED** — it recorded that no lesson field existed on any governed Trainer projection, correctly, and was deliberately not invented around. **D4's term half and D5's Overall Grade are NOT discharged and never will be** (G-4, G-2).

### ⚠️ The on-screen reason was WRONG once lesson landed, and copy is not cosmetic here

The note under Report Details read: *"Lesson number, term and a single overall grade are **not carried by any governed Trainer projection**, so they are omitted rather than estimated."*

Once Phase 0B/4 landed, that sentence was **false about lesson** — and, worse, it kept attributing the **term** and **overall grade** omissions to a **missing field** when both are now **ruled out**: **G-4** (a display label is not worth building the substrate an §8-deferred roadmap item needs) and **G-2** (permanently excluded on all four surfaces that draw it; on a Trainer surface a roll-up is a derived assessment fact this frontend would be computing).

▶ **"We don't have the data" and "we are not allowed to show this" are different statements, and only one of them was still true.** Leaving the weaker one invites a later phase to "fix" a gap that is a decision. The note now says the term and overall grade are **deliberately** not shown, and that the nine governed ratings **are** the assessment. **`P6-6` asserts the old sentence is gone**, so it cannot drift back.

### `08` carries the most ruled-out material of any frame in the chain — so the omissions are what this suite guards

**All preserved, and each is one line away from being reinstated by a later phase "matching the frame better"** — which plan §12 item 1 calls a phase **FAILURE** even when the result looks closer to the design:

⛔ **Term** (G-4) · ⛔ **Overall Grade** (G-2) · ⛔ **the 500MB evidence uploader** (G-8 — *"the frame's 500MB is never implemented in any form"*; ~~G-05 sets 50 MiB if evidence is ever authorized~~ ✅ **`C-16` sets 100 MiB; corrected 2026-08-12, bounded Operator instruction. Evidence has since been authorized (`D-5`) and shipped — ⛔ but this `REGISTERED-OMISSION` is UNCHANGED: G-8 keeps the uploader off THIS screen**) · ⛔ **"Confirm & Submit"** and ⛔ **"Save as draft"** (A-033/A-036 — **the trainer approves and does not publish**, and the stored draft already exists via the governed store path, so a second save affordance would be an invented mutation) · ⛔ the frame's **four-tile** Performance Summary, still rendered across **all nine** governed snapshots (A-017).

**`P6-5` additionally refuses term and roll-up at the DATA layer** — no such field exists on the session DTO to bind a row to.

### ⚠️ A THIRD mis-scoped search today — and this one was a FALSE POSITIVE

`P6-4`'s Overall Grade leg was first written `/Overall Grade/i` and **FAILED — against this screen's own sentence saying a single overall grade is deliberately NOT shown.**

▶ **That is the A-052 failure exactly**, in a new place: **a bare keyword match rejects legitimate prose**, which is precisely why A-052 prohibits that shape for the rating-label guard. **A screen that EXPLAINS an omission necessarily names it.** The patterns now target the **shape of a violation** — a `label="…"` row binding — and never the phrase.

⚠️ **And because an absence assertion can pass on a broken pattern**, a new leg **`P6-4b`** runs the same matcher against a row that **is** rendered (`Name`). If it cannot find that, it cannot be trusted to fail to find `Term`.

▶ **Three mis-scoped searches in one day, in three directions:** the emitted-CSS check reported a **false MISSING** (minifier rewrites); `P5-5` reported a **false FAIL** (regex captured only a parameter list); `P6-4` reported a **false VIOLATION** (keyword matched prose). **Same root: a search is evidence about the code only once it is proven discriminating.** All three now carry a leg that proves the search itself.

### Verification

- **`npm run prove:hero-6` — 12 legs, all PASS, 0 FAIL.** Source- and contract-scoped, and **says so**: the lesson column's readability under RLS is proven by `prove:hero-3` / `prove:hero-4` and is **not re-proven here**. It touches no database and writes nothing.
  - ⚠️ **`P6-1a`/`P6-1b` are NON-VACUITY legs and run first** — every other leg is an **absence** assertion, and an absence assertion over an empty string passes perfectly.
  - Comments are **stripped before every absence scan**: this file documents the prohibitions at length, so a naive scan would flag the very comments recording why there is no violation.
- **`prove:hero-4` re-run — still PASS**, so the Phase 4 G-3 boundary is intact after this change.
- `tsc` **0** · `eslint` **0 errors** (2 pre-existing warnings) · `build` **0** · **route census 17** · `session-eligibility` / `portal-navigation-active-state` / `post-login-destinations` **PASS** · **emitted-CSS verified**, **no new class** — stylesheet still **45,748 bytes**.
- **No database object, migration, DTO field or projection added.** Migrations **20**, unchanged.

### Carried

**RENDERED CAPTURE `NOT-RUN`.** `B-C2-1` untouched. **`NEW-QUESTION`: none.**

### Commit / next

⛔ **STOP. Phase 7 is `F-S6-REVIEW-1` (Trainer Review & Approve) and the Operator wants its plan reported BEFORE it is built.**
