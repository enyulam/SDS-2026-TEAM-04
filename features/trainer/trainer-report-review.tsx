"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { StatusPill } from "@/components/ui/status-pill";
import type {
  ChecklistDto,
  DimensionCode,
  RatingLevel,
  TrainerApproveSuccess,
  TrainerWorkingReportDto,
} from "@/lib/frontend/contracts/physical-test";
import type { UiActionResult } from "@/lib/frontend/contracts/result";
import { REPORT_PANEL_CONFIG } from "./report-panel-config";
import { asFailure, type ResourceState } from "./resource-state";
import { useFixtureRuntime, usePhysicalTestPort } from "./trainer-fixture-runtime";

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

const ratingLabels: Readonly<Record<RatingLevel, string>> = {
  emerging: "Emerging",
  developing: "Developing",
  secure: "Secure",
  advanced: "Advanced",
};

export function TrainerReportReview() {
  const params = useParams<{ reportId: string }>();
  const searchParams = useSearchParams();
  const port = usePhysicalTestPort();
  const { fixtureRevision } = useFixtureRuntime();
  const [resource, setResource] = useState<ResourceState<TrainerWorkingReportDto>>({
    kind: "loading",
  });
  const [checklistSaving, setChecklistSaving] = useState<keyof ChecklistDto | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [approvalDialog, setApprovalDialog] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approvalResult, setApprovalResult] = useState<
    UiActionResult<TrainerApproveSuccess> | null
  >(null);

  useEffect(() => {
    let active = true;
    void port.getTrainerWorkingReport(params.reportId).then((result) => {
      if (!active) return;
      setResource(
        result.outcome === "success"
          ? { kind: "ready", data: result.data }
          : { kind: "failed", result: asFailure(result) },
      );
    });
    return () => {
      active = false;
    };
  }, [fixtureRevision, params.reportId, port]);

  const checklistComplete = useMemo(() => {
    if (resource.kind !== "ready") return false;
    return checklistConfig.every((item) => resource.data.checklist[item.key] === true);
  }, [resource]);

  async function toggleChecklist(key: keyof ChecklistDto) {
    if (resource.kind !== "ready") return;
    const report = resource.data;
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
      setResource({ kind: "ready", data: result.data });
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
    const report = resource.data;
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
        setResource({ kind: "ready", data: refreshed.data });
      }
    }
  }

  if (resource.kind === "loading") return <LoadingSkeleton label="Loading report review" rows={5} />;
  if (resource.kind === "failed") return <StatePanel result={resource.result} />;

  const report = resource.data;
  const returned = report.status === "needs_edit" && report.openCorrection?.status === "open";
  const corrected = report.status === "draft_ready" && report.openCorrection?.status === "resolved";
  const trainerApproved = report.status === "trainer_approved";
  const canEdit = report.status === "draft_ready" && !returned;
  const canApprove = canEdit && checklistComplete;

  return (
    <div className="page-grid">
      <nav aria-label="Breadcrumb" className="text-sm font-bold text-ink-muted">
        <Link href="/trainer" className="hover:text-brand-600">Dashboard</Link>
        <span aria-hidden="true" className="px-2">/</span>
        <span>Report review</span>
      </nav>

      <PageHeading
        eyebrow="Trainer review · four parent-facing panels"
        title={report.studentDisplayName}
        description="Review AI-authored wording against the saved observation. Trainer approval sends this version to management; it does not publish."
        actions={<StatusPill status={report.status} />}
      />

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
              className="inline-flex min-h-10 items-center rounded-xl bg-warning-800 px-3.5 py-2 text-sm font-bold text-white hover:bg-amber-900"
            >
              Review assessment
            </Link>
            <Link
              href={`/trainer/reports/${report.reportId}/edit`}
              className="inline-flex min-h-10 items-center rounded-xl border border-warning-800 px-3.5 py-2 text-sm font-bold text-warning-800 hover:bg-white/60"
            >
              Correct or reaffirm
            </Link>
          </span>
        </FeedbackBanner>
      )}

      {trainerApproved && (
        <FeedbackBanner tone="success" title="Trainer approval saved — nothing published">
          This exact Trainer-reviewed version is now awaiting management&apos;s final quality review
          {report.openCorrection?.status === "resolved" ? " again" : ""}.
          Parent visibility is unchanged and no parent notification was promised or sent.
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

      <section aria-labelledby="report-panels-heading">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="report-panels-heading" className="text-xl font-black text-navy-950">
              Report wording
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              These four panels form the parent-facing report content after final management submission.
            </p>
          </div>
          {canEdit && (
            <Link
              href={`/trainer/reports/${report.reportId}/edit`}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-extrabold text-navy-800 hover:border-brand-500 hover:bg-brand-100"
            >
              {corrected ? "Review correction wording" : "Edit wording"}
            </Link>
          )}
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {REPORT_PANEL_CONFIG.map((panel, index) => (
            <article key={panel.key} className="card overflow-hidden">
              <div className="border-b border-line bg-surface-muted px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-xl bg-navy-900 text-xs font-black text-white" aria-hidden="true">
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-black text-navy-950">{panel.label}</h3>
                </div>
              </div>
              <p className="px-5 py-5 text-[0.95rem] leading-7 text-ink">
                {report.panels[panel.key]}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
        <article className="card p-5 sm:p-6">
          <h2 className="text-xl font-black text-navy-950">Coach Notes (Internal Only)</h2>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-danger-700">
            Never parent-visible
          </p>
          <p className="mt-4 rounded-2xl bg-surface-muted p-4 text-sm leading-6 text-ink">
            {report.coachNotes || "No follow-up note was recorded."}
          </p>
          <p className="mt-3 text-xs leading-5 text-ink-muted">
            This is the same Follow-up for Next Session field saved during assessment.
          </p>
        </article>

        <details className="card p-5 sm:p-6">
          <summary className="cursor-pointer text-base font-black text-navy-950">
            Trainer source check · nine ratings
          </summary>
          <p className="mt-2 text-xs leading-5 text-ink-muted">
            Internal assessment substance for Trainer comparison only. This is not a parent summary.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {report.ratingSnapshots.map((rating) => (
              <li key={rating.dimensionCode} className="flex items-center justify-between gap-3 rounded-xl bg-surface-muted px-3 py-2 text-xs">
                <span className="font-bold text-navy-900">{rating.displayName}</span>
                <span className="font-extrabold text-brand-600">{ratingLabels[rating.rating]}</span>
              </li>
            ))}
          </ul>
        </details>
      </section>

      <section className="card p-5 sm:p-6" aria-labelledby="quality-checklist-heading">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 id="quality-checklist-heading" className="text-xl font-black text-navy-950">
              Quality Checklist
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              All three attestations apply to this exact Trainer-reviewed text.
            </p>
          </div>
          <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-ink-muted">
            {checklistConfig.filter((item) => report.checklist[item.key] === true).length} / 3 complete
          </span>
        </div>

        <div className="mt-5 grid gap-3">
          {checklistConfig.map((item) => {
            const checked = report.checklist[item.key] === true;
            return (
              <label
                key={item.key}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                  checked ? "border-green-300 bg-success-100" : "border-line bg-white"
                } ${trainerApproved || returned ? "cursor-not-allowed opacity-70" : ""}`}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 size-5 accent-green-700"
                  checked={checked}
                  onChange={() => void toggleChecklist(item.key)}
                  disabled={checklistSaving !== null || trainerApproved || returned}
                />
                <span>
                  <span className="block text-sm font-extrabold text-navy-950">{item.label}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-ink-muted">{item.supporting}</span>
                </span>
              </label>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-xs leading-5 text-ink-muted">
            Trainer approval freezes this version and sends it to management final review.
            It does not make the report parent-visible.
          </p>
          {returned ? (
            <Button size="large" disabled>Fresh correction version required</Button>
          ) : trainerApproved ? (
            <Button size="large" disabled>Approved for management review</Button>
          ) : (
            <div className="sm:text-right">
              <Button size="large" disabled={!canApprove} onClick={() => setApprovalDialog(true)}>
                Approve
              </Button>
              {!checklistComplete && (
                <span className="mt-2 block text-xs font-bold text-danger-700">
                  Disabled until all three checks are complete
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {approvalDialog && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy-950/70 p-4" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="approve-dialog-title"
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="grid size-12 place-items-center rounded-2xl bg-brand-100 text-lg font-black text-brand-600" aria-hidden="true">
              ✓
            </div>
            <h2 id="approve-dialog-title" className="mt-5 text-2xl font-black text-navy-950">
              {`Approve ${report.studentDisplayName}'s report?`}
            </h2>
            <p className="mt-3 text-sm leading-6 text-ink-muted">
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
