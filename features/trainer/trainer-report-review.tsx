"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Icon, IconTile, type IconName } from "@/components/ui/icon";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { StatePanel } from "@/components/ui/state-panel";
import { StatusPill } from "@/components/ui/status-pill";
import type {
  ChecklistDto,
  DimensionCode,
  RatingLevel,
  TrainerApproveSuccess,
  TrainerSessionSummaryDto,
  TrainerWorkingReportDto,
} from "@/lib/frontend/contracts/physical-test";
import { RATING_DISPLAY_LABELS } from "@/lib/frontend/fixtures/dimensions";
import type { UiActionResult } from "@/lib/frontend/contracts/result";
import { REPORT_PANEL_CONFIG } from "./report-panel-config";
import { asFailure, type ResourceState } from "./resource-state";
import { usePhysicalTestPort, usePortalRuntime } from "@/features/portal/portal-runtime-context";

/**
 * Screen 10 — Trainer Student Report (FRONTEND RECONSTRUCTION F9 / operator checkpoint F-09).
 *
 * Route: `/trainer/reports/[reportId]/review` — the PINNED implemented path. The canonical
 * route recorded for this screen is `/trainer/reports/[reportId]` and its ratified treatment is
 * "add the canonical index route; `/review` and `/edit` remain governed sub-surfaces"
 * (`screen.md` §1; inventory §7.2). That index route lands at F-16, so NO route is created,
 * moved, renamed or redirected here. OD-3 — whether `/trainer/reports/[reportId]/edit` becomes a
 * canonical sub-route of ID 10 or receives its own inventory ID once a frame exists (inventory
 * §7.4) — is RECORDED and deliberately NOT resolved here.
 *
 * Current Final MVP visual authority is `UI_REFERENCE_FINAL_MVP/reference/Trainer - Student Report/`
 * (Amendment 007 A-056, which supersedes the A-045 ordering). The pack-local
 * `UI_REFERENCE_FINAL_MVP/10-trainer-student-report/reference.png` (node `664:9`) is an
 * optional frozen duplicate, SHA-identical to it. See CLAUDE.md §7.4 and
 * FINAL_MVP_AUTHORITY_LOCK.md §2.4 for the ladder and for governed deviations.
 * Figma never bypasses governance (A-045, preserved by A-056): where the
 * frame and a ratified rule disagree the RULE WINS, the prohibited thing is OMITTED, and the
 * divergence is RECORDED in this screen's `implementation-notes.md` and in the workstream log —
 * never silently resolved.
 *
 * GOVERNANCE BOUNDARIES HELD HERE (Amendment 004 A-033 … A-038):
 *
 *  - TRAINER APPROVAL PUBLISHES NOTHING. The action is "Approve"; it commits
 *    `draft_ready | needs_edit -> trainer_approved` and freezes that version. Neither the button
 *    copy, the confirmation dialog nor the success banner claims publication, parent visibility
 *    or a parent notification — the parent is NOT notified at this step (A-033).
 *  - THE APPROVE GATE IS REAL, AND THE DISABLED BUTTON IS NOT THE GATE. The control renders
 *    visually disabled until all three Quality Checklist items are checked, and the copy states
 *    plainly that the server re-verifies all three FOR THE EXACT VERSION being approved. A
 *    disabled button with no server gate is not a gate, so nothing here implies otherwise
 *    (`CLAUDE.md` §6; A-036). `expectedVersionId`, `expectedLockVersion` and
 *    `expectedContentHash` are all carried on the approve call so the server can refuse a
 *    version drift.
 *  - A TRAINER EDIT RESETS THE CHECKLIST AND REQUIRES REVIEW AND APPROVAL AGAIN, and every
 *    accepted content change creates a NEW IMMUTABLE VERSION — a frozen approval snapshot is
 *    never mutated in place (A-021, A-037). The returned-report path therefore refuses
 *    reapproval of the returned version itself and routes to a fresh correction or an explicit
 *    reaffirmation version; a silent byte-identical save is rejected server-side (A-035/A-036).
 *  - THE CONTENT HASH IS NEVER RENDERED. It is carried to the server as a concurrency proof and
 *    is never shown, because the hash covers the four panels PLUS the nine ratings (A-038).
 *  - THE NINE RATING SNAPSHOTS ARE TRAINER-INTERNAL. This is the Trainer's own source check
 *    against the assessment substance. The management and parent boundaries are unchanged and
 *    are proved separately: no competency-rating token reaches those surfaces.
 *  - The Class Grade rendered in the breadcrumb and rail (Beginner / Intermediate / Advanced) is
 *    a DIFFERENT, unchanged vocabulary (A-054) and marks itself `data-vocabulary="class-grade"`
 *    so a rating-token guard classifies it by ACTUAL CONTEXT rather than by keyword.
 *
 * FRAME-VERSUS-GOVERNANCE DIVERGENCES (recorded, not resolved locally):
 *
 *  D1 "Official report" (the report-card subtitle). At `/review` the version on screen is the
 *     Trainer's WORKING version, awaiting approval and then management's final review. Only
 *     management's Approve & Submit makes a version canonical and parent-visible (A-033), so
 *     "Official report" would be a false claim about lifecycle state. The subtitle names the
 *     governed status instead.
 *  D2 ✅ RESOLVED — NO LONGER A DEVIATION (OD-4, Operator ruling 2026-08-07; implemented at
 *     P1-T07). The frame's headings "Overview / Strengths / Areas for Development / Remarks"
 *     ARE the governed four panels. They agree.
 *
 *     The struck reasoning was: the frame's headings are not a rename of the governed four,
 *     "Overview" and "Remarks" have no governed counterpart, and inventing a mapping would
 *     silently redefine what each stored field means to a parent — recorded for operator
 *     adjudication. THAT REASONING WAS CORRECT WHEN WRITTEN, and it is preserved here rather
 *     than deleted because it is why the adjudication was raised at all.
 *
 *     The adjudication has since been ISSUED, AND IT WENT THE OTHER WAY. The Operator did not
 *     rename four fields; the Operator DEFINED four concepts and superseded the old model
 *     outright. Today's Strength / Next Focus / Practice Suggestion / Session Takeaway are
 *     SUPERSEDED_BY_OD-4_FINAL_REPORT_MODEL. Nothing is silently redefined: the meanings are
 *     written down in the ruling, M13 migrated the storage, and the AI generates these four
 *     DIRECTLY — a relabelling shim is expressly prohibited.
 *
 *     The ratified third label is "Areas for Development", NOT "Areas to Grow".
 *  D3 "Class Video Evidence" with a player and recording metadata.
 *     ⚠️ CITATION CORRECTED 2026-08-10. This read "Evidence scope AND the uploading role are
 *     UNRESOLVED (Amendment 002 A-014)". True when written, SUPERSEDED 2026-08-08: evidence
 *     media IS a Final MVP requirement and the Operator named the TRAINER as the uploader
 *     (`FINAL_MVP_AUTHORITY_LOCK.md` §8; `CLAUDE.md` §1.1). The treatment is UNCHANGED and its
 *     accurate reason is that the path is UNBUILT, not undecided: `PhysicalTestPort` exposes no
 *     evidence read or upload path, and `Evidence Pending` is deliberately not a stored status
 *     (A-036). The region is KEPT with the frame's label and rendered INERT with a visible,
 *     programmatically associated reason — the F-04 D1 / F-11 "Send Reminder to Trainer"
 *     treatment. No uploader is invented, and the frame's duration, format and "Recorded …"
 *     metadata are omitted rather than fabricated.
 *  D4 Report Details rows "Lesson" and "Term". No lesson-number, lesson-title or term field
 *     exists on any governed Trainer projection. Omitted rather than fabricated.
 *  D5 Report Details row "Overall Grade: Mastering". No governed overall or roll-up competency
 *     grade exists — a single headline rating would be a DERIVED ASSESSMENT FACT this frontend
 *     computed, which is exactly the class of claim A-034/A-035 reserve to the governed
 *     assessment. Omitted; the nine governed snapshots are shown instead.
 *  D6 "Performance Summary" draws FOUR tiles (Speech, Tonality, Eye Contact, Audience
 *     Awareness). No governed rule selects four of the nine, and all nine are mandatory
 *     (A-017), so the frame's tile composition is reproduced across ALL NINE governed
 *     snapshots rather than an invented subset.
 *  D7 The frame shows only the approved end state — it draws no Quality Checklist, no Approve
 *     control, no returned-correction state and no internal Coach Notes. Those are governed
 *     functionality this screen must preserve (`screen.md` §6), so they are built and are
 *     rendered for the states in which they apply. "Report sent to management for approval" is
 *     the `trainer_approved` state and is correct and expected.
 *  D8 The frame's left rail lists Dashboard / My Classes / Students / Reports / Schedule and
 *     highlights Reports. That rail is `components/layout/portal-shell.tsx`, outside this
 *     checkpoint's owned paths; its items are the routes that actually exist. The relationship
 *     is carried by the breadcrumb and the Back control the frame also draws.
 *
 * CARRY-OVER DEFECT FIXED HERE (raised by the F-06 verifier). The nine per-dimension rating
 * labels rendered `text-brand-600` — a single brand pink for all four states, measuring 3.53:1
 * on white in the production DOM and FAILING SC 1.4.3. They now carry the ordinal-keyed
 * `rating-N-on-soft` foreground on the matching `rating-N-soft` fill: the pairs the F1
 * foundation deepened specifically to clear 4.5:1, re-measured for all four states in the
 * rendered production DOM by `tests/frontend/trainer-browser-smoke.mjs`. Colour is never the
 * only carrier — every tile states its level in text (`GLOBAL_UI_RULES` §7).
 */

const checklistConfig = [
  {
    key: "evidenceConfirmed",
    label: "Evidence confirms rating",
    supporting: "The saved observation supports the assessment substance in this version.",
  },
  {
    key: "aiDraftReviewed",
    label: "AI Draft reviewed",
    supporting: "Every parent-facing panel has been read and checked against source notes.",
  },
  {
    key: "privacyChecked",
    label: "Privacy check passed",
    supporting: "No internal Trainer note or unnecessary identifying detail appears in the panels.",
  },
] as const satisfies readonly {
  readonly key: keyof ChecklistDto;
  readonly label: string;
  readonly supporting: string;
}[];

/**
 * Icon and tint per governed panel, in the frame's order. Presentation only — this carries no
 * lifecycle, polarity or assessment meaning, and every icon is reused from the approved set
 * rather than re-drawn ad hoc (`GLOBAL_UI_RULES` §8).
 */
const PANEL_PRESENTATION: Readonly<
  Record<
    (typeof REPORT_PANEL_CONFIG)[number]["key"],
    { readonly icon: IconName; readonly tone: "brand" | "info" | "success" | "warning" }
  >
> = {
  // 🔴 RE-ASSIGNED AT THE P1-T08 REVIEW. These were carried over
  // POSITIONALLY when the keys were renamed, shifting every treatment down
  // one slot: Overview took the success tick and Strengths -- the panel that
  // is by definition positive demonstrated capability -- rendered in the
  // WARNING tone. Both independent reviewers flagged it. A positional
  // carry-over is a relabelling shim in the presentation layer, which is
  // exactly what OD-4 prohibits. Assigned below from what each panel MEANS.
  overview: { icon: "document", tone: "info" },
  strengths: { icon: "check", tone: "success" },
  areasForDevelopment: { icon: "chevronRight", tone: "warning" },
  remarks: { icon: "reports", tone: "brand" },
};

/**
 * The four-step competency ramp, ordinal position 1..4, low to high. Amendment 006 A-049
 * governs the LABELS; this map is level -> ordinal colour pair only. Each pair is a deliberate
 * WCAG 2.2 AA foreground/background pair from the F1 foundation, and each is re-measured in the
 * production DOM rather than reasoned about.
 */
const RATING_TILE_STYLE: Readonly<Record<RatingLevel, string>> = {
  beginning: "bg-rating-1-soft text-rating-1-on-soft",
  developing: "bg-rating-2-soft text-rating-2-on-soft",
  mastering: "bg-rating-3-soft text-rating-3-on-soft",
  mastered: "bg-rating-4-soft text-rating-4-on-soft",
};

type ReportView = {
  readonly report: TrainerWorkingReportDto;
  /** The governed Class Session this report belongs to, or null when the projection omits it. */
  readonly session: TrainerSessionSummaryDto | null;
};

export function TrainerReportReview() {
  const params = useParams<{ reportId: string }>();
  const searchParams = useSearchParams();
  const port = usePhysicalTestPort();
  const { dataRevision } = usePortalRuntime();
  const [resource, setResource] = useState<ResourceState<ReportView>>({ kind: "loading" });
  const [checklistSaving, setChecklistSaving] = useState<keyof ChecklistDto | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approvalResult, setApprovalResult] = useState<
    UiActionResult<TrainerApproveSuccess> | null
  >(null);
  const evidenceNoteId = useId();

  useEffect(() => {
    let active = true;
    void Promise.all([
      port.getTrainerWorkingReport(params.reportId),
      port.listTrainerSessions(),
    ]).then(([reportResult, sessionsResult]) => {
      if (!active) return;
      if (reportResult.outcome !== "success") {
        setResource({ kind: "failed", result: asFailure(reportResult) });
        return;
      }
      /*
       * The Class Session lookup is a NARROWING read over the same governed projection the
       * schedule and roster surfaces use. A miss omits the rail's Class row; it never
       * fabricates one, and it never blocks the report itself.
       */
      const session =
        sessionsResult.outcome === "success"
          ? (sessionsResult.data.find(
              (item) => item.sessionId === reportResult.data.sessionId,
            ) ?? null)
          : null;
      setResource({ kind: "ready", data: { report: reportResult.data, session } });
    });
    return () => {
      active = false;
    };
  }, [dataRevision, params.reportId, port]);

  const checklistComplete = useMemo(() => {
    if (resource.kind !== "ready") return false;
    const { checklist } = resource.data.report;
    return checklistConfig.every((item) => checklist[item.key] === true);
  }, [resource]);

  async function toggleChecklist(key: keyof ChecklistDto) {
    if (resource.kind !== "ready") return;
    const { report, session } = resource.data;
    setChecklistSaving(key);
    setActionError(null);
    const checklist: ChecklistDto = {
      evidenceConfirmed: report.checklist.evidenceConfirmed === true,
      aiDraftReviewed: report.checklist.aiDraftReviewed === true,
      privacyChecked: report.checklist.privacyChecked === true,
      [key]: report.checklist[key] !== true,
    };
    const result = await port.updateTrainerChecklist({
      reportId: report.reportId,
      expectedVersionId: report.versionId,
      checklist,
    });
    setChecklistSaving(null);
    if (result.outcome === "success") {
      setResource({ kind: "ready", data: { report: result.data, session } });
    } else {
      setActionError(
        "message" in result
          ? result.message
          : "The checklist could not be updated. Reload the report to continue.",
      );
    }
  }

  async function approve() {
    if (resource.kind !== "ready") return;
    setApproving(true);
    setApprovalResult(null);
    const { report, session } = resource.data;
    const result = await port.trainerApprove({
      reportId: report.reportId,
      expectedLockVersion: report.lockVersion,
      expectedVersionId: report.versionId,
      expectedContentHash: report.contentHash,
    });
    setApproving(false);
    setApprovalResult(result);
    if (result.outcome === "success") {
      setApprovalDialog(false);
      const refreshed = await port.getTrainerWorkingReport(report.reportId);
      if (refreshed.outcome === "success") {
        setResource({ kind: "ready", data: { report: refreshed.data, session } });
      }
    }
  }

  if (resource.kind === "loading") return <LoadingSkeleton label="Loading report review" rows={5} />;
  if (resource.kind === "failed") return <StatePanel result={resource.result} />;

  const { report, session } = resource.data;
  const returned = report.status === "needs_edit" && report.openCorrection?.status === "open";
  const corrected = report.status === "draft_ready" && report.openCorrection?.status === "resolved";
  const trainerApproved = report.status === "trainer_approved";
  const canEdit = report.status === "draft_ready" && !returned;
  const canApprove = canEdit && checklistComplete;
  const checkedCount = checklistConfig.filter(
    (item) => report.checklist[item.key] === true,
  ).length;

  return (
    <div className="page-grid">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-page-title font-extrabold tracking-[-0.02em] text-ink-strong">
            Student Report
          </h1>
          <nav aria-label="Breadcrumb" className="mt-1">
            <ol className="flex flex-wrap items-center gap-x-2 text-small text-neutral-on">
              <li>
                <Link
                  href="/trainer/reports?status=needs_edit"
                  className="font-semibold text-neutral-on underline-offset-4 hover:text-brand-800"
                >
                  Reports
                </Link>
              </li>
              {session && (
                <>
                  <li aria-hidden="true">/</li>
                  <li data-vocabulary="class-grade">{session.classGrade}</li>
                </>
              )}
              <li aria-hidden="true">/</li>
              <li>{report.studentDisplayName}</li>
            </ol>
          </nav>
          <Link
            href={`/trainer/sessions/${report.sessionId}/roster`}
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

      {searchParams.get("saved") === "1" && (
        <FeedbackBanner tone="success" title="Wording changes saved">
          A fresh immutable fixture version was created and all three checklist items were
          reset for review of this exact text.
        </FeedbackBanner>
      )}

      {searchParams.get("saved") === "correction" && corrected && (
        <FeedbackBanner tone="success" title="Fresh correction version created">
          The Management concern is resolved on a new immutable version. All three checklist
          items are fresh and Trainer reapproval is required before it returns to final review.
        </FeedbackBanner>
      )}

      {returned && report.openCorrection && (
        <FeedbackBanner tone="warning" title="Returned for Trainer correction">
          <strong>{formatIssueScope(report.openCorrection.issueScope)}</strong>
          {report.openCorrection.dimensionCode
            ? ` · ${formatDimension(report.openCorrection.dimensionCode)}`
            : ""}
          <span className="mt-1 block">{report.openCorrection.reason}</span>
          <span className="mt-1 block font-bold">
            The frozen approved version cannot be reapproved. A fresh correction or explicit
            reaffirmation version is required.
          </span>
          <span className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/trainer/sessions/${report.sessionId}/students/${report.studentId}/assess`}
              className="inline-flex min-h-11 items-center rounded-field bg-warning-on px-4 py-2.5 text-body font-bold text-white no-underline hover:bg-[#6f4d05]"
            >
              Review assessment
            </Link>
            <Link
              href={`/trainer/reports/${report.reportId}/edit`}
              className="inline-flex min-h-11 items-center rounded-field border border-warning-on px-4 py-2.5 text-body font-bold text-warning-on no-underline hover:bg-white/60"
            >
              Correct or reaffirm
            </Link>
          </span>
        </FeedbackBanner>
      )}

      {actionError && (
        <FeedbackBanner tone="error" title="Checklist update failed">{actionError}</FeedbackBanner>
      )}
      {approvalResult && approvalResult.outcome !== "success" && "message" in approvalResult && (
        <FeedbackBanner tone="error" title="Approval was not saved">
          {approvalResult.message}
        </FeedbackBanner>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,21rem)] xl:items-start">
        <div className="grid gap-5">
          {/* The official class-report card — the frame's primary surface. */}
          <section className="card overflow-hidden" aria-labelledby="class-report-heading">
            <div className="flex items-center gap-3.5 border-b border-line px-5 py-5 sm:px-6">
              <Avatar displayName={report.studentDisplayName} size="large" shape="square" />
              <div className="min-w-0">
                {/*
                 * The heading colour sits on an inner `span`. `app/globals.css` still declares
                 * `h1, h2, h3, h4 { color: #1b2b4b }` UNLAYERED (the defect recorded at F-01b,
                 * in a file outside this checkpoint's owned paths), and an unlayered rule
                 * outranks every rule in `@layer utilities` — so a `text-*` utility on the
                 * heading element itself is generated, matches, and silently loses the cascade.
                 */}
                <h2 id="class-report-heading">
                  <span className="text-card-title font-extrabold text-brand-800">
                    Class Report — {report.studentDisplayName}
                  </span>
                </h2>
                {/* D1 — the frame's "Official report" claim is replaced by the governed status. */}
                <p className="mt-0.5 text-small font-semibold text-neutral-on">
                  {session && (
                    <>
                      <span data-vocabulary="class-grade">{session.classGrade}</span>
                      {" · "}
                      {session.moduleName}
                      {" · "}
                    </>
                  )}
                  {formatDate(report.sessionDate)} · Trainer working version
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
                    <div className="min-w-0">
                      <h3>
                        <span className="text-body font-extrabold text-ink-strong">
                          {panel.label}
                        </span>
                      </h3>
                      <p className="mt-2 flex gap-2.5 text-body font-semibold leading-7 text-ink">
                        {/* Decorative bullet — the frame's marker. Meaning is carried by text. */}
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
          </section>

          {/* D3 — frame region kept, rendered inert. No uploader and no metadata invented. */}
          <section className="card p-5 sm:p-6" aria-labelledby="class-video-evidence-heading">
            <h2 id="class-video-evidence-heading">
              <span className="text-card-title font-extrabold text-ink-strong">
                Class Video Evidence
              </span>
            </h2>
            <p className="mt-1 text-small text-neutral-on">
              Session recording from this class
            </p>
            <div
              data-evidence-state="unavailable"
              className="mt-4 grid min-h-44 place-items-center rounded-panel border border-dashed border-line-strong bg-surface-muted px-6 py-10 text-center"
            >
              <div>
                <button
                  type="button"
                  disabled
                  aria-describedby={evidenceNoteId}
                  className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-field border border-line bg-surface px-4 py-2.5 text-body font-bold text-ink-subtle"
                >
                  Play session recording
                  <Icon name="chevronRight" size={16} />
                </button>
                <p
                  id={evidenceNoteId}
                  className="mx-auto mt-3 max-w-md text-small leading-6 text-ink"
                >
                  No class video evidence is available in this workspace. Evidence scope and the
                  uploading role remain an unresolved governance decision, and no governed
                  evidence record or upload path exists — so this control is inactive rather
                  than simulated.
                </p>
              </div>
            </div>
          </section>

          {/* D7 — governed, Trainer-only, and drawn nowhere in the frame. */}
          <section className="card p-5 sm:p-6" aria-labelledby="coach-notes-heading">
            <div className="flex flex-wrap items-center gap-3">
              <h2 id="coach-notes-heading">
                <span className="text-card-title font-extrabold text-ink-strong">
                  Coach Notes (Internal Only)
                </span>
              </h2>
              <span className="inline-flex min-h-7 items-center rounded-full bg-danger-soft px-2.5 py-1 text-micro font-extrabold uppercase tracking-[0.1em] text-danger-on">
                Never parent-visible
              </span>
            </div>
            <p className="mt-4 rounded-card bg-surface-muted p-4 text-body leading-7 text-ink">
              {report.coachNotes || "No follow-up note was recorded."}
            </p>
            <p className="mt-3 text-small leading-6 text-neutral-on">
              This is the same Follow-up for Next Session field saved during assessment.
            </p>
          </section>

          <section className="card p-5 sm:p-6" aria-labelledby="quality-checklist-heading">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 id="quality-checklist-heading">
                  <span className="text-card-title font-extrabold text-ink-strong">
                    Quality Checklist
                  </span>
                </h2>
                <p className="mt-1 text-small text-neutral-on">
                  All three attestations apply to this exact Trainer-reviewed text.
                </p>
              </div>
              <span className="text-micro font-extrabold uppercase tracking-[0.12em] text-neutral-on">
                {checkedCount} / 3 complete
              </span>
            </div>

            <div className="mt-5 grid gap-3">
              {checklistConfig.map((item) => {
                const checked = report.checklist[item.key] === true;
                return (
                  <label
                    key={item.key}
                    className={`flex cursor-pointer items-start gap-3 rounded-card border p-4 transition ${
                      checked ? "border-success-on/25 bg-success-soft" : "border-line bg-surface"
                    } ${trainerApproved || returned ? "cursor-not-allowed opacity-70" : ""}`}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 size-5 accent-[#2a7248]"
                      checked={checked}
                      onChange={() => void toggleChecklist(item.key)}
                      disabled={checklistSaving !== null || trainerApproved || returned}
                    />
                    <span>
                      <span className="block text-body font-extrabold text-ink-strong">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-small leading-6 text-ink">
                        {item.supporting}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-small leading-6 text-ink">
                Trainer approval freezes this version and sends it to management for final
                review. It does not make the report parent-visible. The server re-checks all
                three attestations for this exact version before it accepts the approval.
              </p>
              {returned ? (
                <Button size="large" disabled>Fresh correction version required</Button>
              ) : trainerApproved ? (
                <Button size="large" disabled>Approved for management review</Button>
              ) : (
                <div className="shrink-0 sm:text-right">
                  <Button size="large" disabled={!canApprove} onClick={() => setApprovalDialog(true)}>
                    Approve
                  </Button>
                  {!checklistComplete && (
                    <span className="mt-2 block text-small font-bold text-danger-on">
                      Disabled until all three checks are complete
                    </span>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right rail — the frame's Report Details, Performance Summary and status stack. */}
        <aside className="grid content-start gap-5" aria-label="Report detail">
          <section className="card p-5" aria-labelledby="report-details-heading">
            <h2 id="report-details-heading">
              <span className="text-card-title font-extrabold text-ink-strong">
                Report Details
              </span>
            </h2>
            <dl className="mt-3 divide-y divide-line text-body">
              <DetailRow label="Name" value={report.studentDisplayName} />
              {session && (
                <DetailRow
                  label="Class"
                  value={
                    <>
                      <span data-vocabulary="class-grade">{session.classGrade}</span>
                      {" · "}
                      {session.moduleName}
                    </>
                  }
                />
              )}
              <DetailRow label="Session date" value={formatDate(report.sessionDate)} />
              <DetailRow label="Version" value={`Revision ${report.revisionNumber}`} />
              <DetailRow label="Status" value={<StatusPill status={report.status} />} />
            </dl>
            {/*
             * D4 / D5 — "Lesson", "Term" and "Overall Grade" are drawn in the frame and are
             * omitted here. The reason is stated on screen rather than left as a silent gap.
             */}
            <p className="mt-4 text-small leading-6 text-ink">
              Lesson number, term and a single overall grade are not carried by any governed
              Trainer projection, so they are omitted rather than estimated.
            </p>
          </section>

          {/* D6 — the frame's tile composition across ALL NINE governed snapshots. */}
          <section className="card p-5" aria-labelledby="performance-summary-heading">
            <h2 id="performance-summary-heading">
              <span className="text-micro font-extrabold uppercase tracking-[0.12em] text-neutral-on">
                Performance Summary
              </span>
            </h2>
            <p className="mt-1.5 text-small leading-6 text-ink">
              Trainer source check across the nine governed dimensions. Internal assessment
              substance — not a parent summary.
            </p>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {report.ratingSnapshots.map((rating) => (
                <li
                  key={rating.dimensionCode}
                  className={`rounded-card px-3.5 py-3 ${RATING_TILE_STYLE[rating.rating]}`}
                >
                  <span className="block text-micro font-bold uppercase tracking-[0.1em] text-ink">
                    {rating.displayName}
                  </span>
                  <span
                    data-rating-level={rating.rating}
                    className="mt-1 block text-body font-extrabold uppercase tracking-[0.04em]"
                  >
                    {RATING_DISPLAY_LABELS[rating.rating]}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {canEdit && (
            <Link
              href={`/trainer/reports/${report.reportId}/edit`}
              className="inline-flex min-h-12 items-center justify-center rounded-field border border-line bg-surface px-5 py-3 text-body font-bold text-ink-strong no-underline shadow-raised transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
            >
              {corrected ? "Review correction wording" : "Edit wording"}
            </Link>
          )}

          {trainerApproved && (
            <section
              className="rounded-card bg-success-soft px-4 py-3.5 text-success-on"
              role="status"
            >
              <p className="flex items-center gap-2 text-body font-extrabold">
                <Icon name="check" size={16} />
                Report sent to management for approval
              </p>
              <p className="mt-1 text-small leading-6">
                Trainer approval saved — nothing published. This exact Trainer-reviewed version
                is now awaiting management&apos;s final quality review
                {report.openCorrection?.status === "resolved" ? " again" : ""}. Parent visibility
                is unchanged and no parent notification was promised or sent.
              </p>
            </section>
          )}
        </aside>
      </div>

      {approvalDialog && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-accent-ink/70 p-4" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="approve-dialog-title"
            className="w-full max-w-lg rounded-panel bg-surface p-6 shadow-overlay sm:p-8"
          >
            <IconTile tone="brand" size="large">
              <Icon name="check" size={20} />
            </IconTile>
            <h2 id="approve-dialog-title" className="mt-5">
              <span className="text-section-title font-extrabold text-ink-strong">
                {`Approve ${report.studentDisplayName}'s report?`}
              </span>
            </h2>
            <p className="mt-3 text-body leading-7 text-ink">
              This sends the Trainer-approved version to management for final quality review.
              It does not publish the report and does not notify a parent.
            </p>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="secondary" size="large" onClick={() => setApprovalDialog(false)} disabled={approving}>
                Cancel
              </Button>
              <Button size="large" onClick={() => void approve()} disabled={approving}>
                {approving ? "Approving…" : "Approve for management review"}
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  readonly label: string;
  readonly value: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <dt className="text-small text-neutral-on">{label}</dt>
      <dd className="text-right text-body font-bold text-ink-strong">{value}</dd>
    </div>
  );
}

function formatIssueScope(scope: "rating" | "observation" | "derived_assessment_fact") {
  return {
    rating: "Rating review",
    observation: "Observation review",
    derived_assessment_fact: "Assessment-fact review",
  }[scope];
}

function formatDimension(dimension: DimensionCode) {
  return dimension
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
