"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useId, useState, type ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Icon, IconTile, type IconName } from "@/components/ui/icon";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { StatePanel } from "@/components/ui/state-panel";
import { StatusPill } from "@/components/ui/status-pill";
import { REPORT_PANEL_CONFIG } from "@/features/trainer/report-panel-config";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import {
  DIMENSION_CODES,
  type CanonicalReportDto,
  type CorrectionRequestDto,
  type DimensionCode,
  type ManagementReviewDto,
} from "@/lib/frontend/contracts/physical-test";
import type { UiActionResult } from "@/lib/frontend/contracts/result";

/**
 * Screen 19 — Management Student Report (FRONTEND RECONSTRUCTION F12 / operator checkpoint F-12).
 *
 * Route: `/management/reports/[reportId]/review` — the PINNED implemented path, with
 * `/management/reports/[reportId]/edit` as its governed wording-only sub-surface. The canonical
 * route recorded for this screen is `/management/students/[studentId]/reports/[reportId]`
 * (`screen.md` §1; inventory §7.2) and its treatment is route-migration work. NO route is
 * created, moved, renamed or redirected here.
 *
 * Current Final MVP visual authority is `UI_REFERENCE_FINAL_MVP/reference/Management - Student Report/`
 * (Amendment 007 A-056, which supersedes the A-045 ordering). The pack-local
 * `UI_REFERENCE_FINAL_MVP/19-management-student-report/reference.png` (node `648:330`) is an
 * optional frozen duplicate, SHA-identical to it. See CLAUDE.md §7.4 and
 * FINAL_MVP_AUTHORITY_LOCK.md §2.4 for the ladder and for governed deviations.
 *
 * ============================================================================================
 * OPERATOR RULING R-B5 — GOVERNANCE OVERRIDES THIS FROZEN SCREENSHOT.
 * ============================================================================================
 *
 * Reference 19 draws MULTIPLE PROHIBITED ELEMENTS. Figma never bypasses governance: the RULE
 * WINS, the prohibited thing is OMITTED, and the divergence is RECORDED in this screen's
 * `implementation-notes.md`, in the workstream log and in the checkpoint return. The frame is
 * used ONLY for shell, spacing, typography and the allowed parent-facing wording panels.
 *
 * OMITTED, each because a ratified rule forbids it on a Management surface:
 *
 *  P1 "Report for: Parent / Management" audience toggle. There is no `kind` enum and no
 *     `audience` column on a version — canonicity comes from the aggregate's pointer and
 *     audience comes from AUTHORIZATION, never from an attribute on the row (A-038). A toggle
 *     would assert a per-audience artefact this system deliberately does not have, and would
 *     imply Management can preview a second, differently-scoped rendering of the same report.
 *  P2 "Performance Summary" — the raw per-dimension rating grid. Management never reads raw
 *     per-dimension ratings (A-038; `CLAUDE.md` §6; GLOBAL_UI_RULES §4). This is the same class
 *     of leak already caught once on the Parent surface. NOTHING on this screen renders a
 *     competency-rating token, and `tests/frontend/three-role-browser-smoke.mjs` proves it
 *     structurally, not by eye.
 *  P3 "Overall Grade: Mastering" in Report Details. No governed overall or roll-up competency
 *     grade exists, and computing one here would manufacture a DERIVED ASSESSMENT FACT this
 *     frontend invented — reserved to the governed assessment (A-034/A-035) — while also
 *     disclosing rating substance P2 forbids.
 *  P4 Trainer observations, Trainer notes, and any assessment-editing control. Management never
 *     modifies a rating, observation, attendance record, evidence item, Trainer note or any
 *     underlying assessment fact (A-034). A rating/observation/assessment-fact issue is ALWAYS
 *     a RETURN, never a Management edit — that is the "Return assessment concern" path below.
 *  P5 "Class Video Evidence" and attendance substance. Evidence scope and the uploading role
 *     are UNRESOLVED (A-014) and no governed evidence read path exists — but even if one did,
 *     evidence and attendance substance are outside Management's read (A-038). Screen 10 keeps
 *     this region INERT for the Trainer; here it is OMITTED OUTRIGHT, because inert-with-reason
 *     is the treatment for an unbacked affordance, not for a prohibited one.
 *  P6 "Save as draft". No governed Management draft state exists — the eight authorized
 *     `report_status` values contain none (A-036), and the only Management write to content is
 *     the bounded wording save on the `/edit` sub-surface. A control implying a private
 *     Management draft would encode UI presence as a lifecycle fact.
 *
 * THE CONTENT HASH IS NEVER RENDERED, AND NEVER WILL BE (A-038). The content hash covers the
 * four panels PLUS the nine ratings; a reader holding the panels and that hash recovers the
 * exact per-dimension grid in 4^9 = 262,144 trials. This screen holds only `wordingHash` — the
 * SEPARATE, domain-separated proof over the four parent-facing panels alone — and even that is
 * carried to the server as a concurrency proof and is NOT displayed.
 *
 * WHAT MANAGEMENT MAY DO HERE, and nothing else (Amendment 004 A-034, A-038):
 *
 *  - EDIT PARENT-FACING WORDING ONLY — grammar, clarity, tone, presentation — across the four
 *    parent-facing panels, on the `/edit` sub-surface.
 *  - RETURN a substantive concern to the Trainer with an exact reason.
 *  - Perform the final APPROVE & SUBMIT: the one user action that performs two transitions in
 *    one transaction, `trainer_approved -> approved -> submitted`, with no committed
 *    `approved`-only residue. It is the ONLY action that makes a report parent-visible (A-033).
 *
 * Management reads exactly two things: the final-review candidate while `trainer_approved`, and
 * the canonical submitted version. Never a pre-trainer-approval draft, never AI generation
 * history, never audit rows. `getManagementReview` returns `unavailable` for every other status,
 * and that refusal is server-side — this screen's rendering is not the boundary.
 *
 * FURTHER FRAME-VERSUS-GOVERNANCE DIVERGENCES (recorded, not resolved locally):
 *
 *  D1 ✅ RESOLVED — NO LONGER A DEVIATION (OD-4, Operator ruling 2026-08-07; implemented at
 *     P1-T07). The governed four parent-facing panels are Overview / Strengths / Areas for
 *     Development / Remarks (`REPORT_PANEL_CONFIG`), and the frame agrees on all four.
 *
 *     The struck reasoning was: the frame's headings are not a rename of the governed four,
 *     "Overview" and "Remarks" have no governed counterpart, and adopting them would silently
 *     redefine what each stored field means to a parent — the same D2 adjudication F-09 raised
 *     on screen 10. It was correct when written and is preserved rather than deleted.
 *
 *     The adjudication has since been ISSUED AND WENT THE OTHER WAY: the Operator defined four
 *     concepts rather than renaming four fields, and superseded the old model outright.
 *
 *     ONE THING THIS FRAME STILL GETS WRONG: it draws the third heading as "Areas to Grow".
 *     That is the MINORITY VARIANT and is expressly ruled NOT canonical (Authority Lock
 *     §15.1) — the `/reference/` tree is internally inconsistent on exactly this label. The
 *     ratified label is "Areas for Development". Here the frame loses and the rule wins.
 *
 *     Management's editorial right is unchanged by OD-4: WORDING ONLY, on exactly these four
 *     panels. OD-4 renames and re-means them; it neither widens nor narrows the A-034
 *     allow-list, whose arity stays at exactly four.
 *  D2 The report-card subtitle "Public Speaking · Term 1, 2035 · Management copy". "Management
 *     copy" is the same per-audience artefact claim as P1 and is replaced by the governed
 *     lifecycle state. Class-module, lesson and term fields are carried by NO governed
 *     Management projection and are omitted rather than fabricated.
 *  D3 The frame's four section glyphs (alert circle, star, arrow, heart) are not in the approved
 *     asset set. Approved icons are reused rather than re-drawing an icon ad hoc
 *     (GLOBAL_UI_RULES §8), matching the mapping screen 10 already uses.
 *  D4 The frame's per-section pencil affordance is honoured as a link to the governed
 *     wording-only editor. It edits nothing in place: every accepted content change creates a
 *     new immutable version (A-037), and the boundary is the four panels (A-034).
 *  D5 The left rail is `components/layout/portal-shell.tsx`, outside this checkpoint's owned
 *     paths — the same adjudication F-05, F-09 and F-11 recorded. The relationship is carried by
 *     the breadcrumb and the Back control the frame also draws.
 *  D6 The frame's approve-panel copy "This makes the report no longer editable, and sends
 *     notification to the parents" is replaced by the ratified description. No dedicated mockup
 *     exists for the confirmation and NONE MAY BE INVENTED beyond it (`CLAUDE.md` §6).
 */

const dimensionLabels: Readonly<Record<DimensionCode, string>> = {
  body: "Body",
  emotion: "Emotion",
  speech: "Speech",
  tonality: "Tonality",
  eye_contact: "Eye Contact",
  vocal_projection: "Vocal Projection",
  emotional_expression: "Emotional Expression",
  sentence_flow: "Sentence Flow",
  audience_awareness: "Audience Awareness",
};

/**
 * Icon and tint per governed panel, in the frame's order. Presentation only — this carries no
 * lifecycle, polarity or assessment meaning. Identical to the mapping screen 10 uses, so the two
 * report surfaces stay one visual system.
 */
const PANEL_PRESENTATION: Readonly<
  Record<
    (typeof REPORT_PANEL_CONFIG)[number]["key"],
    { readonly icon: IconName; readonly tone: "brand" | "info" | "success" | "warning" }
  >
> = {
  overview: { icon: "check", tone: "success" },
  strengths: { icon: "chevronRight", tone: "warning" },
  areasForDevelopment: { icon: "reports", tone: "info" },
  remarks: { icon: "document", tone: "brand" },
};

type ActionFailure = Exclude<UiActionResult<unknown>, { outcome: "success" }>;

/**
 * C2C-004 — this ONE route serves BOTH of the exactly two things A-038 permits
 * Management to read, and nothing else:
 *
 *   kind "candidate"  the final-review candidate while the report is
 *                     `trainer_approved`. Mutating: wording edit, return to
 *                     trainer, Approve & Submit.
 *   kind "published"  the canonical SUBMITTED version. READ ONLY — no edit
 *                     link, no return control, no Approve & Submit, and no
 *                     concurrency value to carry, because there is no
 *                     operation to perform on a published report.
 *
 * Neither is a pre-approval draft, and no third kind exists. The two are
 * resolved by two DIFFERENT governed reads and are never conflated: the
 * published read refuses a `trainer_approved` report and the candidate read
 * refuses a `submitted` one, each with the same non-disclosing outcome a
 * missing report gets. No second route is created (R-C2-3).
 */
type PublishedView = {
  readonly report: CanonicalReportDto;
  readonly studentDisplayName: string | null;
  readonly sessionDate: string | null;
};

type ReviewView = {
  readonly report: ManagementReviewDto;
  /**
   * Learner identity, narrowed out of the SAME governed pending-review projection the queue
   * (screen 29) already reads. It is not a second read of report content, and a miss omits the
   * name rather than fabricating one — the ratified Approve & Submit confirmation names the
   * learner, so the identity has to come from a governed projection or not at all.
   */
  readonly studentDisplayName: string | null;
  readonly sessionDate: string | null;
};

export function ManagementReportReview() {
  const params = useParams<{ reportId: string }>();
  const port = usePhysicalTestPort();
  const boundaryNoteId = useId();
  const [resource, setResource] = useState<ResourceState<ReviewView>>({ kind: "loading" });
  const [published, setPublished] = useState<PublishedView | null>(null);
  const [dialog, setDialog] = useState<"return" | "submit" | null>(null);
  const [issueScope, setIssueScope] = useState<CorrectionRequestDto["issueScope"]>(
    "derived_assessment_fact",
  );
  const [dimensionCode, setDimensionCode] = useState<DimensionCode | "">("");
  const [reason, setReason] = useState("");
  const [working, setWorking] = useState(false);
  const [actionFailure, setActionFailure] = useState<ActionFailure | null>(null);
  const [completed, setCompleted] = useState<"returned" | "submitted" | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([
      port.getManagementReview(params.reportId),
      port.listManagementPendingReviews(),
      port.listManagementSubmittedReports(),
    ]).then(async ([reviewResult, queueResult, submittedRows]) => {
      if (!active) return;
      const row =
        queueResult.outcome === "success"
          ? (queueResult.data.find((item) => item.reportId === params.reportId) ?? null)
          : null;
      if (reviewResult.outcome !== "success") {
        /*
         * C2C-004. The candidate read returns the SAME non-disclosing
         * `unavailable` for "no such report", "not permitted" and "already
         * published", so a miss here is not yet a denial — the published read
         * below is the second of Management's two lawful reads. Any other
         * outcome (unauthenticated, a transport fault) is reported as-is
         * rather than retried against a different boundary.
         */
        if (reviewResult.outcome !== "unavailable") {
          setResource({ kind: "failed", result: asFailure(reviewResult) });
          return;
        }
        const publishedResult = await port.getManagementSubmittedReport(params.reportId);
        if (!active) return;
        if (publishedResult.outcome !== "success") {
          setResource({ kind: "failed", result: asFailure(reviewResult) });
          return;
        }
        const identity =
          submittedRows.outcome === "success"
            ? (submittedRows.data.find((item) => item.reportId === params.reportId) ?? null)
            : null;
        setPublished({
          report: publishedResult.data,
          studentDisplayName: identity?.studentDisplayName ?? null,
          sessionDate: identity?.sessionDate ?? null,
        });
        setResource({ kind: "failed", result: { outcome: "unavailable" } });
        return;
      }
      setResource({
        kind: "ready",
        data: {
          report: reviewResult.data,
          studentDisplayName: row?.studentDisplayName ?? null,
          sessionDate: row?.sessionDate ?? null,
        },
      });
    });
    return () => {
      active = false;
    };
  }, [params.reportId, port]);

  if (resource.kind === "loading") {
    return <LoadingSkeleton label="Loading final review" rows={5} />;
  }
  if (resource.kind === "failed") {
    if (published) return <PublishedReport view={published} />;
    return (
      <StatePanel
        result={resource.result}
        homeHref="/management"
        homeLabel="Return to Management workspace"
      />
    );
  }

  const { report, studentDisplayName, sessionDate } = resource.data;
  const learner = studentDisplayName ?? "this learner";

  async function returnReport() {
    setWorking(true);
    setActionFailure(null);
    const result = await port.managementReturnToTrainer({
      reportId: params.reportId,
      expectedLockVersion: report.lockVersion,
      expectedVersionId: report.versionId,
      issueScope,
      ...(issueScope === "rating" && dimensionCode ? { dimensionCode } : {}),
      reason,
    });
    setWorking(false);
    if (result.outcome === "success") {
      setDialog(null);
      setCompleted("returned");
    } else {
      setActionFailure(result);
    }
  }

  async function approveAndSubmit() {
    setWorking(true);
    setActionFailure(null);
    const result = await port.managementApproveAndSubmit({
      reportId: params.reportId,
      expectedLockVersion: report.lockVersion,
      expectedVersionId: report.versionId,
      /*
       * The wording proof — a SEPARATE, domain-separated hash over the four parent-facing
       * panels only (A-038). It is carried so the server can refuse a wording drift; it is
       * never rendered, and the report CONTENT hash never reaches this surface at all.
       */
      expectedWordingHash: report.wordingHash,
    });
    setWorking(false);
    if (result.outcome === "success") {
      setDialog(null);
      setCompleted("submitted");
    } else {
      setActionFailure(result);
    }
  }

  if (completed) {
    return (
      <div className="page-grid">
        <FeedbackBanner
          tone="success"
          title={completed === "submitted" ? "Report submitted" : "Returned to the Trainer"}
        >
          {completed === "submitted"
            ? "The final report is published. Exactly these four parent-facing panels are now available through the linked family view, the linked parent has been notified, and the student record is updated."
            : "The report left the pending queue with your exact reason attached. It is not parent-visible, and the Trainer must correct or explicitly reaffirm on a new version before it returns to final review."}
        </FeedbackBanner>
        <div>
          <Link
            href={
              completed === "submitted"
                ? "/management/reports?status=trainer_approved"
                : "/management/reports?status=needs_edit"
            }
            className="inline-flex min-h-11 items-center justify-center rounded-field bg-brand-700 px-4 py-2.5 text-body font-bold text-white no-underline hover:bg-brand-800"
          >
            {completed === "submitted" ? "Return to pending review" : "Open correction tracking"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-grid" data-testid="management-safe-review">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-page-title font-extrabold tracking-[-0.02em] text-ink-strong">
            Student Report
          </h1>
          <nav aria-label="Breadcrumb" className="mt-1">
            <ol className="flex flex-wrap items-center gap-x-2 text-small text-neutral-on">
              <li>
                <Link
                  href="/management/reports?status=trainer_approved"
                  className="font-semibold text-neutral-on underline-offset-4 hover:text-brand-800"
                >
                  Reports
                </Link>
              </li>
              {studentDisplayName && (
                <>
                  <li aria-hidden="true">/</li>
                  <li>{studentDisplayName}</li>
                </>
              )}
              <li aria-hidden="true">/</li>
              <li>Final review</li>
            </ol>
          </nav>
          <Link
            href="/management/reports?status=trainer_approved"
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-field bg-brand-100 px-4 py-2.5 text-body font-bold text-brand-800 no-underline transition hover:bg-brand-200"
          >
            <Icon name="chevronLeft" size={16} />
            Back
          </Link>
        </div>
        <div className="shrink-0 sm:pt-2">
          <StatusPill status={report.status} />
        </div>
      </header>

      {actionFailure && (
        <FeedbackBanner tone="error" title={failureTitle(actionFailure)}>
          {failureMessage(actionFailure)}
        </FeedbackBanner>
      )}

      {report.openCorrectionStatus === "resolved" && (
        <FeedbackBanner tone="info" title="Your earlier concern was addressed">
          The Trainer answered the concern you returned on a new immutable version and approved it
          again. This is that version.
        </FeedbackBanner>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,21rem)] xl:items-start">
        <div className="grid gap-5">
          {/* The class-report card — the frame's primary surface, panels only. */}
          <section
            className="card overflow-hidden"
            aria-labelledby="class-report-heading"
            aria-describedby={boundaryNoteId}
          >
            <div className="flex items-center gap-3.5 border-b border-line px-5 py-5 sm:px-6">
              <Avatar displayName={learner} size="large" shape="square" />
              <div className="min-w-0">
                {/*
                 * Heading colour sits on an inner `span`: `app/globals.css` still declares
                 * `h1, h2, h3, h4 { color: #1b2b4b }` UNLAYERED (the F-01b defect, in a file
                 * outside this checkpoint's owned paths), and an unlayered rule outranks every
                 * rule in `@layer utilities`.
                 */}
                <h2 id="class-report-heading">
                  <span className="text-card-title font-extrabold text-brand-800">
                    Class Report — {learner}
                  </span>
                </h2>
                {/* D2 — the frame's "Management copy" claim replaced by the governed state. */}
                <p className="mt-0.5 text-small font-semibold text-neutral-on">
                  {sessionDate ? `${formatDate(sessionDate)} · ` : ""}
                  Final-review candidate · awaiting your decision
                </p>
              </div>
            </div>

            <div className="divide-y divide-line">
              {REPORT_PANEL_CONFIG.map((panel) => {
                const presentation = PANEL_PRESENTATION[panel.key];
                return (
                  <article
                    key={panel.key}
                    data-report-panel={panel.key}
                    className="flex gap-4 px-5 py-5 sm:px-6"
                  >
                    <IconTile tone={presentation.tone} size="small">
                      <Icon name={presentation.icon} size={15} />
                    </IconTile>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3>
                          <span className="text-body font-extrabold text-ink-strong">
                            {panel.label}
                          </span>
                        </h3>
                        {/* D4 — the frame's pencil, mapped to the governed wording-only editor. */}
                        <Link
                          href={`/management/reports/${params.reportId}/edit`}
                          className="-mt-1.5 -me-1.5 inline-flex min-h-11 shrink-0 items-center rounded-field px-2.5 py-2 text-small font-bold text-brand-800 no-underline hover:bg-brand-50"
                        >
                          Edit
                          <span className="sr-only"> {panel.label} wording</span>
                        </Link>
                      </div>
                      <p className="mt-1 flex gap-2.5 text-body font-semibold leading-7 text-ink">
                        {/* Decorative marker — meaning is carried by text (GLOBAL_UI_RULES §7). */}
                        <span
                          aria-hidden="true"
                          className="mt-2.5 block size-1.5 shrink-0 rounded-full bg-brand-600"
                        />
                        <span>{report.panels[panel.key]}</span>
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>

            <p
              id={boundaryNoteId}
              className="border-t border-line bg-surface-muted px-5 py-4 text-small leading-6 text-ink sm:px-6"
            >
              These four parent-facing panels are the whole of this review. Wording changes stay
              inside them; anything that would need the assessment itself to change is a return to
              the Trainer, never a Management edit.
            </p>
          </section>
        </div>

        {/* Right rail — the frame's Report Details and approval stack, prohibited cards omitted. */}
        <aside className="grid content-start gap-5" aria-label="Report detail">
          <section className="card p-5" aria-labelledby="report-details-heading">
            <h2 id="report-details-heading">
              <span className="text-card-title font-extrabold text-ink-strong">
                Report Details
              </span>
            </h2>
            <dl className="mt-3 divide-y divide-line text-body">
              {studentDisplayName && <DetailRow label="Name" value={studentDisplayName} />}
              {sessionDate && <DetailRow label="Session date" value={formatDate(sessionDate)} />}
              <DetailRow label="Status" value={<StatusPill status={report.status} />} />
            </dl>
            {/*
             * P3 / D2 — the frame's "Overall Grade", "Lesson" and "Term" rows are omitted. The
             * omission is stated on screen rather than left as a silent gap, but it is stated
             * WITHOUT naming the prohibited row: the browser suite asserts that phrase never
             * renders on a Management surface, and an explanatory sentence is not worth
             * weakening the assertion that proves the leak stayed closed. The full reason is
             * recorded in this file's header, in `implementation-notes.md` and in the
             * workstream log, which is where operator ruling R-B5 requires it.
             */}
            <p className="mt-4 text-small leading-6 text-ink">
              Nothing beyond the four parent-facing panels forms part of this review. Lesson and
              term are not carried by any governed Management projection, so they are omitted
              rather than estimated.
            </p>
          </section>

          {/* The frame's dark "Ready to approve?" panel — its "Save as draft" control omitted (P6). */}
          <section
            className="rounded-panel bg-accent-ink p-5 text-white shadow-overlay"
            aria-labelledby="final-decision-heading"
          >
            <h2 id="final-decision-heading">
              <span className="text-card-title font-extrabold text-white">Ready to approve?</span>
            </h2>
            <p className="mt-2 text-small leading-6 text-white/85">
              Approve &amp; Submit publishes the final report, notifies the linked parent, and
              updates the student record. It is the only action that makes this report
              parent-visible.
            </p>
            <div className="mt-5 grid gap-2.5">
              <button
                type="button"
                onClick={() => setDialog("submit")}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-field bg-brand-700 px-5 py-3 text-body font-bold text-white transition hover:bg-brand-800"
              >
                <Icon name="check" size={16} />
                Approve &amp; Submit
              </button>
              <button
                type="button"
                onClick={() => setDialog("return")}
                className="inline-flex min-h-12 items-center justify-center rounded-field border border-white/35 bg-transparent px-5 py-3 text-body font-bold text-white transition hover:bg-white/10"
              >
                Return assessment concern
              </button>
              <Link
                href={`/management/reports/${params.reportId}/edit`}
                /* Tertiary action. Kept underlined at rest: inside the dark panel it is the one
                   control with no border or fill, so the underline — not colour — is what marks
                   it as an affordance (GLOBAL_UI_RULES §7). */
                className="inline-flex min-h-12 items-center justify-center rounded-field px-5 py-3 text-body font-bold text-white underline underline-offset-4 transition hover:bg-white/10"
              >
                Edit wording
              </Link>
            </div>
            <p className="mt-4 text-small leading-6 text-white/85">
              The server independently re-verifies your authorization, the Trainer approval behind
              this exact version and your wording proof before it accepts either decision.
            </p>
          </section>
        </aside>
      </div>

      {dialog === "return" && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-accent-ink/70 p-4"
          role="presentation"
        >
          <section
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-panel bg-surface p-6 shadow-overlay sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="return-report-title"
          >
            <h2 id="return-report-title">
              <span className="text-section-title font-extrabold text-ink-strong">
                Return an assessment-fact concern
              </span>
            </h2>
            <p className="mt-3 text-body leading-7 text-ink">
              Use this only for a rating, observation, or derived assessment fact that needs
              Trainer review. Grammar, clarity, tone, and presentation belong in the wording
              editor.
            </p>

            <fieldset className="mt-6 grid gap-2">
              <legend className="text-body font-extrabold text-ink-strong">
                Exact issue scope
              </legend>
              {(
                [
                  ["rating", "Rating"],
                  ["observation", "Observation"],
                  ["derived_assessment_fact", "Derived assessment fact"],
                ] as const
              ).map(([value, label]) => (
                <label
                  key={value}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-card border border-line px-3.5 py-2.5 text-body font-bold text-ink-strong"
                >
                  <input
                    type="radio"
                    name="issue-scope"
                    className="size-4 accent-[#b02a63]"
                    value={value}
                    checked={issueScope === value}
                    onChange={() => {
                      setIssueScope(value);
                      if (value !== "rating") setDimensionCode("");
                    }}
                  />
                  {label}
                </label>
              ))}
            </fieldset>

            {issueScope === "rating" && (
              <label className="mt-5 block text-body font-extrabold text-ink-strong">
                Affected dimension
                <select
                  className="form-field mt-2"
                  value={dimensionCode}
                  onChange={(event) => setDimensionCode(event.target.value as DimensionCode | "")}
                  required
                >
                  <option value="">Choose one dimension</option>
                  {DIMENSION_CODES.map((code) => (
                    <option key={code} value={code}>
                      {dimensionLabels[code]}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="mt-5 block text-body font-extrabold text-ink-strong">
              Correction reason
              <textarea
                className="form-field mt-2 min-h-32 resize-y"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                maxLength={2000}
                required
              />
              <span className="mt-1 block text-right text-small font-medium text-neutral-on">
                {reason.length} / 2,000
              </span>
            </label>

            {actionFailure && (
              <div className="mt-5">
                <FeedbackBanner tone="error" title={failureTitle(actionFailure)}>
                  {failureMessage(actionFailure)}
                </FeedbackBanner>
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="secondary" size="large" onClick={() => setDialog(null)} disabled={working}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="large"
                onClick={() => void returnReport()}
                disabled={working || !reason.trim() || (issueScope === "rating" && !dimensionCode)}
              >
                {working ? "Returning…" : "Return to Trainer"}
              </Button>
            </div>
          </section>
        </div>
      )}

      {dialog === "submit" && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-accent-ink/70 p-4"
          role="presentation"
        >
          <section
            className="w-full max-w-lg rounded-panel bg-surface p-6 shadow-overlay sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-report-title"
          >
            <IconTile tone="brand" size="large">
              <Icon name="check" size={20} />
            </IconTile>
            {/*
             * D6 — the ratified confirmation. No dedicated mockup exists for it and none may be
             * invented beyond this description (`CLAUDE.md` §6, A-033).
             */}
            <h2 id="submit-report-title" className="mt-5">
              <span className="text-section-title font-extrabold text-ink-strong">
                {`Approve and submit ${learner}'s report?`}
              </span>
            </h2>
            <p className="mt-3 text-body leading-7 text-ink">
              This will publish the final report, notify the linked parent, and update the student
              record.
            </p>
            {actionFailure && (
              <div className="mt-5">
                <FeedbackBanner tone="error" title={failureTitle(actionFailure)}>
                  {failureMessage(actionFailure)}
                </FeedbackBanner>
              </div>
            )}
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="secondary" size="large" onClick={() => setDialog(null)} disabled={working}>
                Cancel
              </Button>
              <Button size="large" onClick={() => void approveAndSubmit()} disabled={working}>
                {working ? "Submitting…" : "Approve & Submit"}
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { readonly label: string; readonly value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-small text-neutral-on">{label}</dt>
      <dd className="text-right text-body font-bold text-ink-strong">{value}</dd>
    </div>
  );
}

function failureTitle(result: ActionFailure) {
  return result.outcome === "stale_state" ? "This review changed" : "Action not completed";
}

function failureMessage(result: ActionFailure) {
  if ("message" in result) return result.message;
  return "This item isn't available. No additional details can be shown.";
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

/**
 * C2C-004 — the CANONICAL SUBMITTED report, rendered for Management read-only.
 *
 * WHAT THIS SURFACE DELIBERATELY DOES NOT CARRY, and why each absence is
 * structural rather than a styling choice:
 *
 *  - NO wording-editor link, NO return-to-trainer control and NO Approve &
 *    Submit. A published report has no governed operation. The port method
 *    behind this view returns the CANONICAL report shape — four panels and a
 *    publication time — so there is no lock version, no version id and no
 *    wording hash on this surface for a mutation to be built from.
 *  - NO per-dimension rating, NO trainer note, NO checklist or approval
 *    internal and NO content hash. A-038 forbids all of them to Management at
 *    every status, `submitted` included, and the governed read carries no
 *    column that could hold one.
 */
function PublishedReport({ view }: { readonly view: PublishedView }) {
  const learner = view.studentDisplayName ?? "this learner";
  return (
    <div className="page-grid" data-testid="management-published-report">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link
            href="/management/reports?status=submitted"
            className="inline-flex min-h-11 items-center gap-1 text-body font-bold text-brand-800 no-underline hover:text-brand-700"
          >
            <span aria-hidden="true">‹</span> Approved reports
          </Link>
          <h1 className="mt-1 text-page-title font-extrabold tracking-[-0.02em] text-ink-strong">
            {learner}
          </h1>
          <p className="mt-1 text-body leading-6 text-ink">
            Published {formatSubmitted(view.report.submittedAt)}
            {view.sessionDate ? ` · Class Session ${formatSessionDate(view.sessionDate)}` : ""}
          </p>
        </div>
        <StatusPill status="submitted" />
      </header>

      <FeedbackBanner tone="info" title="This report is published and read-only">
        These are the four parent-facing panels the linked family sees. A published report has no
        Management operation: there is no wording edit, no return to the Trainer and no further
        approval. Correcting a published report is a governed reopen, not an edit here.
      </FeedbackBanner>

      <section className="card overflow-hidden p-0" aria-label="Submitted report">
        <div className="grid gap-6 px-5 py-6 sm:gap-7 sm:px-7 sm:py-7">
          {REPORT_PANEL_CONFIG.map((panel) => {
            const presentation = PANEL_PRESENTATION[panel.key];
            return (
              <article key={panel.key} className="flex items-start gap-4">
                <IconTile tone={presentation.tone} size="medium">
                  <Icon name={presentation.icon} size={18} />
                </IconTile>
                <div className="min-w-0 flex-1">
                  <h2 className="text-body font-extrabold text-ink-strong">{panel.label}</h2>
                  <p className="mt-2 text-body leading-7 text-ink">
                    {view.report.panels[panel.key]}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function formatSubmitted(value: string) {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Singapore",
  }).format(new Date(value));
}

function formatSessionDate(value: string) {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Singapore",
  }).format(new Date(`${value}T00:00:00+08:00`));
}
