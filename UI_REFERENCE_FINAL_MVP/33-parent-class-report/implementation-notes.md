# 33 - Parent Class Report - implementation notes

**Append-only.** Add a new entry at the bottom for every implementation checkpoint touching this screen. Never edit or delete an existing entry - a superseded entry is corrected by a later entry that says so.

---

## Entry template - copy below the last entry

```
Timestamp (Asia/Singapore):
Source branch:
Starting commit:
Screen ID:                     33
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

### FRONTEND RECONSTRUCTION F15 — operator checkpoint F-15

```
Timestamp (Asia/Singapore):    2026-08-06
Source branch:                 feat/48h-frontend
Starting commit:               9feedb08338ee64b67fba20a5a39bc904ad96e5d
Screen ID:                     33
Existing route audited:        Yes - /parent/students/[studentId]/sessions/[sessionId]/report
                               (the pinned implemented route). Reads through the governed port
                               method getCanonicalReport(sessionId, studentId), which resolves
                               via app_parent_reaches_student and returns the canonical
                               SUBMITTED version only. NO route was created, moved, renamed or
                               redirected. The canonical /parent/reports/[reportId] route with
                               server-side pair resolution remains UNEXECUTED - it is F16
                               route-migration work and needs its own authorization.
Components preserved:          The route page wrapper; the port call and its resource-state
                               machine; LoadingSkeleton; StatePanel for the failed, unavailable
                               and denied states (unavailable and denied copy stays
                               byte-identical and non-disclosing); REPORT_PANEL_CONFIG as the
                               single source of the four governed panel keys and labels; the
                               data-testid="parent-canonical-report" hook.
Components replaced:           The provisional two-column card grid (grid lg:grid-cols-2, one
                               bordered card per panel with an uppercase brand eyebrow) and the
                               "Learner progress report" page heading. Replaced by the frame's
                               structure: page title "Class Report" + received meta line; one
                               white report card with a bordered header row (tinted document
                               tile, "Class Report", submitted meta); and a vertical stack of
                               four narrative sections, each a soft tinted icon tile + bold
                               heading + a single bulleted prose paragraph.
Components created:            PANEL_PRESENTATION (per-panel tone + icon map, in the frame's
                               tint rhythm) and a local PanelIcon (star / arrowUp / target /
                               heart) inline in the owned file. components/ui/icon.tsx is
                               OUTSIDE the owned paths and itself records that screen-specific
                               icons belong to their own checkpoint, so it was NOT extended.
DTO and port changes:          NONE. CanonicalReportDto still carries exactly `panels` and
                               `submittedAt`. No field, DTO, port method, permission, adapter
                               or fixture was added or changed.
Fixture changes:               NONE.
Backend dependencies discovered:
                               (1) LEARNER NAME, CLASS GRADE, CLASS MODULE, LESSON and TERM.
                                   The frame's identity header ("Class Report - Alicia Gomez")
                                   and its "Report Details" sidebar (Name / Class / Lesson /
                                   Term) have NO governed source - CanonicalReportDto carries
                                   none of them. OMITTED rather than fabricated or back-derived
                                   from a route parameter (GLOBAL_UI_RULES 10). Recorded as a
                                   dependency, never invented.
                               (2) PARENT EVIDENCE MEDIA. No governed path exists. Access would
                                   require submitted status AND the evidence_media consent
                                   scope AND a short-TTL server-minted signed URL scoped to the
                                   parent_student_links row (A-001) - and beyond that, evidence
                                   scope and the UPLOADER are UNRESOLVED (A-014). Recorded, not
                                   invented, not stubbed.
Vocabulary dependencies:       NONE. Screen 33 is not rating-bearing (screen.md 8), so F15
                               carries no F6 dependency. No Class Grade artefact was touched
                               and NO keyword replacement over advanced / secure / emerging /
                               beginning / mastering / mastered was performed (A-054).
Governance blockers:           None unresolved. SIX frame-versus-governance deviations are
                               RECORDED, not resolved locally - the first four are the
                               deliberate omissions operator ruling R-B6 requires:

                               D1  THE "PERFORMANCE SUMMARY" PER-DIMENSION GRID - OMITTED.
                                   The frame draws four raw dimension:rating cells (SPEECH /
                                   MASTERING, TONALITY / MASTERED, EYE CONTACT / BEGINNING,
                                   AUDIENCE AWARENESS / DEVELOPING) on a PARENT surface. This
                                   is the already-caught leak CLAUDE.md 6 names by name: "No
                                   per-dimension rating grid on the Parent Feedback Report, in
                                   any form or wording - this is a caught leak, fix it." NOT
                                   recreated in any form, softened wording included. The
                                   "simplified performance summary" requirement is met by the
                                   four prose panels and by nothing else. This also discharges
                                   the conflict F1 recorded and deferred to this checkpoint.
                               D2  "OVERALL GRADE: MASTERING" - OMITTED. An aggregate
                                   competency grade is a rating value; no Parent surface
                                   renders a rating token in either vocabulary (A-021, A-048,
                                   GLOBAL_UI_RULES 5).
                               D3  THE PROSE RATING ATTRIBUTIONS - NOT PORTED. The frame's copy
                                   reads "Assessed as Mastered in eye contact ... and Mastering
                                   in body language", "currently assessed as Developing", "to
                                   progress these skills to the Mastering band". That is
                                   explicit rating attribution and taxonomy disclosure -
                                   exactly the form A-052 authorises detecting. The panels
                                   render the governed submitted narrative the port returns;
                                   nothing is written over it.
                               D4  THE "WATCH TOGETHER" EVIDENCE VIDEO - OMITTED, and no media
                                   element renders on this surface at all. See the evidence
                                   dependency above. Omitted rather than faked or rendered
                                   inert, because no governed port method backs it.
                               D5  THE "REPORT DETAILS" SIDEBAR - NOT RECONSTRUCTED. Its
                                   Overall Grade row is prohibited outright (D2) and its
                                   Name / Class / Lesson / Term rows have no governed source.
                               D6  The page subtitle is rendered locally rather than through
                                   PageHeading's `description` prop, which resolves to
                                   text-ink-muted #8a93a8 and fails the 4.5:1 AA floor. The
                                   shared primitive is outside the owned paths and was left
                                   untouched; the failure stays recorded (as at F11 and F14).

                               THE STOP CONDITION WAS EVALUATED EXPLICITLY AND DID NOT FIRE:
                               none of the per-dimension grid, the Overall Grade, a prose
                               rating attribution or the evidence video was implemented.

                               NOTE ON STARTING STATE: the previous implementation was checked
                               BEFORE any change and was ALREADY COMPLIANT - it rendered the
                               four governed panels and nothing else. F-15 was therefore a
                               FIDELITY RECONSTRUCTION whose obligation was to raise visual
                               fidelity without INTRODUCING a leak, not to remove one.
Browser viewport:              1440 x 1100 (headless Chrome, production build)
Before screenshot:             implementation-before.png (not captured - the pre-F15 state is
                               recoverable from commit 9feedb08)
After screenshot:              _checkpoint-evidence/F-15/implementation-after.png
                               (plus parent-reports-list.png; written OUTSIDE Git)
Validation:                    reference.png SHA-256 2aaeb446...dea67 verified BEFORE any work
                               and UNCHANGED AFTER (1440 x 1340, 293,726 bytes).
                               npx tsc --noEmit                                  - exit 0
                               npx eslint .                                      - exit 0
                               npm run build                                     - exit 0;
                                 ROUTE CENSUS UNCHANGED at 17 application routes
                                 plus /_not-found - none added, removed or renamed
                               node tests/frontend/three-role-browser-smoke.mjs  - exit 0
                               node tests/frontend/trainer-browser-smoke.mjs     - exit 0
                               node tests/frontend/authentication-browser-smoke.mjs - exit 0
                               git diff --check                                  - exit 0
                               All three smokes ran against a PRODUCTION BUILD (next build +
                               next start on ports 3115/3118), never a cold dev server.
                               ZERO uncaught browser-console/runtime errors.

                               REQUIRED NEGATIVE ASSERTION - and it is proven FALSIFIABLE, not
                               merely green. tests/frontend/three-role-browser-smoke.mjs now
                               carries assertParentSurfaceClean(label), applied to EVERY Parent
                               surface (report list before and after submission, Parent home,
                               canonical detail). It proves in the rendered production DOM that
                               no rating token, no per-dimension grid, no overall grade, no
                               evidence media, no correction history, no content hash and no
                               version metadata renders, and pins the detail to exactly the
                               four governed panel headings in order. It is deliberately NOT a
                               bare-word prose regex - A-052 prohibits one, because "at the
                               beginning of the session" and "has mastered maintaining eye
                               contact" are legal parent-facing prose. It detects the form
                               A-052 authorises: a LEAF element whose ENTIRE text is one raw
                               label or dimension name, plus rating / evidence / hash / version
                               data attributes, plus any video, iframe, audio, source, track,
                               embed or object element.
                               FALSIFIABILITY PROOF: an "Overall Grade" row, a "Mastering"
                               chip, an "Eye Contact" dimension cell and a video element were
                               deliberately injected and rebuilt; the suite failed with
                               'Parent canonical DOM leaked forbidden text: Mastering' and
                               then, with the vocabulary token removed, 'rendered a prohibited
                               internal element: dimension-cell:span="eye contact",
                               media:video'. The injection was reverted and the final
                               production build re-verified green.

                               Synthetic fixture data only in every capture.
Ending commit:                 The commit created by
                               `feat(frontend): reconstruct parent class report`
Acceptance status:             Proposed visually accepted - awaiting operator review, including
                               confirmation that the R-B6 omission set (D1-D4) is complete and
                               correctly classified.
```

---

## GOVERNANCE CONFLICTS RECORDED - 2026-08-08 (Final MVP Phase A2, operator ruling Q-24)

**These are conflicts between the ratified Figma reference for this screen and B.E.S.T governance. Governance WINS. Do not build the reference behaviour described below.**

Source of record: `UI_REFERENCE_FINAL_MVP/FINAL_MVP_SCREEN_RECONCILIATION_PLAN.md` (GC register, declared authoritative by `FINAL_MVP_AUTHORITY_LOCK.md` section 28.2). The `reference/` tree is VISUAL rank 1 but FUNCTIONAL rank 5 (lowest) - it cannot override a functional, privacy or security rule.

- **GC-4 — PERFORMANCE SUMMARY grid, "Overall Grade", prose rating attributions, "Watch Together" video. A-021/A-048; A-034/A-035. Evidence is now RULED required with the Trainer as uploader, but the PARENT EVIDENCE PROJECTION IS RULED OUT of the Final MVP (Authority Lock section 8.1), so "Watch Together" stays omitted on a positive ruling. A-001 remains armed but unactivated. ALREADY CORRECTLY OMITTED — keep it omitted.**

**No authoritative visual bytes (PNG or HTML) were altered by this recording.**

