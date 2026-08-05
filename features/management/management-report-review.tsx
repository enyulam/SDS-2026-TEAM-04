"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { REPORT_PANEL_CONFIG } from "@/features/trainer/report-panel-config";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/trainer/trainer-fixture-runtime";
import {
  DIMENSION_CODES,
  type CorrectionRequestDto,
  type DimensionCode,
  type ManagementReviewDto,
} from "@/lib/frontend/contracts/physical-test";
import type { UiActionResult } from "@/lib/frontend/contracts/result";

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

type ActionFailure = Exclude<UiActionResult<unknown>, { outcome: "success" }>;

export function ManagementReportReview() {
  const params = useParams<{ reportId: string }>();
  const port = usePhysicalTestPort();
  const [resource, setResource] = useState<ResourceState<ManagementReviewDto>>({ kind: "loading" });
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
    void port.getManagementReview(params.reportId).then((result) => {
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
  }, [params.reportId, port]);

  if (resource.kind === "loading") {
    return <LoadingSkeleton label="Loading safe final review" rows={5} />;
  }
  if (resource.kind === "failed") {
    return (
      <StatePanel
        result={resource.result}
        homeHref="/management"
        homeLabel="Return to Management workspace"
      />
    );
  }

  const report = resource.data;

  async function returnReport() {
    if (resource.kind !== "ready") return;
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
            ? "The accepted four-panel report is now available through the linked family view."
            : "The item left the pending queue and is now tracked as a bounded assessment-fact concern."}
        </FeedbackBanner>
        <div>
          <Link
            href={
              completed === "submitted"
                ? "/management/reports?status=trainer_approved"
                : "/management/reports?status=needs_edit"
            }
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-500"
          >
            {completed === "submitted" ? "Return to pending review" : "Open correction tracking"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-grid" data-testid="management-safe-review">
      <PageHeading
        eyebrow="Management · safe final review"
        title="Review parent-facing wording"
        description="Review only the four family-facing panels, refine wording when needed, or raise a bounded assessment-fact concern."
      />

      {actionFailure && (
        <FeedbackBanner tone="error" title={failureTitle(actionFailure)}>
          {failureMessage(actionFailure)}
        </FeedbackBanner>
      )}

      <section className="grid gap-4 lg:grid-cols-2" aria-label="Four parent-facing report panels">
        {REPORT_PANEL_CONFIG.map((panel) => (
          <article key={panel.key} className="card p-5 sm:p-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-600">
              {panel.label}
            </p>
            <p className="mt-3 text-sm leading-7 text-ink">{report.panels[panel.key]}</p>
          </article>
        ))}
      </section>

      <section className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h2 className="text-xl font-black text-navy-950">Final quality decision</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-muted">
            Wording changes stay inside these four panels. Assessment-fact concerns go back to the Trainer.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/management/reports/${params.reportId}/edit`}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-navy-800 hover:border-brand-500 hover:bg-brand-100"
          >
            Edit wording
          </Link>
          <Button variant="secondary" onClick={() => setDialog("return")}>
            Return assessment concern
          </Button>
          <Button onClick={() => setDialog("submit")}>Approve &amp; Submit</Button>
        </div>
      </section>

      {dialog === "return" && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy-950/70 p-4" role="presentation">
          <section
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-7"
            role="dialog"
            aria-modal="true"
            aria-labelledby="return-report-title"
          >
            <h2 id="return-report-title" className="text-2xl font-black text-navy-950">
              Return an assessment-fact concern
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Use this only for a rating, observation, or derived assessment fact that needs Trainer review. Grammar, clarity, tone, and presentation belong in the wording editor.
            </p>

            <fieldset className="mt-5 grid gap-2">
              <legend className="text-sm font-extrabold text-navy-900">Exact issue scope</legend>
              {([
                ["rating", "Rating"],
                ["observation", "Observation"],
                ["derived_assessment_fact", "Derived assessment fact"],
              ] as const).map(([value, label]) => (
                <label key={value} className="flex min-h-11 items-center gap-3 rounded-xl border border-line px-3 py-2 text-sm font-bold text-navy-900">
                  <input
                    type="radio"
                    name="issue-scope"
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
              <label className="mt-5 block text-sm font-extrabold text-navy-900">
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

            <label className="mt-5 block text-sm font-extrabold text-navy-900">
              Correction reason
              <textarea
                className="form-field mt-2 min-h-32 resize-y"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                maxLength={2000}
                required
              />
              <span className="mt-1 block text-right text-xs font-medium text-ink-muted">
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

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button variant="ghost" onClick={() => setDialog(null)} disabled={working}>
                Cancel
              </Button>
              <Button
                variant="danger"
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
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy-950/70 p-4" role="presentation">
          <section
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-7"
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-report-title"
          >
            <h2 id="submit-report-title" className="text-2xl font-black text-navy-950">
              Approve &amp; Submit this report?
            </h2>
            <p className="mt-3 text-sm leading-6 text-ink-muted">
              This final Management action makes exactly these four panels available through the linked family view.
            </p>
            {actionFailure && (
              <div className="mt-5">
                <FeedbackBanner tone="error" title={failureTitle(actionFailure)}>
                  {failureMessage(actionFailure)}
                </FeedbackBanner>
              </div>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDialog(null)} disabled={working}>
                Cancel
              </Button>
              <Button onClick={() => void approveAndSubmit()} disabled={working}>
                {working ? "Submitting…" : "Approve & Submit"}
              </Button>
            </div>
          </section>
        </div>
      )}
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
