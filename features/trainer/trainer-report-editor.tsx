"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import type {
  ReportPanelsDto,
  TrainerWorkingReportDto,
} from "@/lib/frontend/contracts/physical-test";
import { REPORT_PANEL_CONFIG } from "./report-panel-config";
import { asFailure, type ResourceState } from "./resource-state";
import { usePhysicalTestPort } from "./trainer-fixture-runtime";

export function TrainerReportEditor() {
  const params = useParams<{ reportId: string }>();
  const router = useRouter();
  const port = usePhysicalTestPort();
  const [resource, setResource] = useState<ResourceState<TrainerWorkingReportDto>>({
    kind: "loading",
  });
  const [panels, setPanels] = useState<ReportPanelsDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [correctionMode, setCorrectionMode] = useState<"corrected" | "reaffirmed">(
    "corrected",
  );

  useEffect(() => {
    let active = true;
    void port.getTrainerWorkingReport(params.reportId).then((result) => {
      if (!active) return;
      if (result.outcome !== "success") {
        setResource({ kind: "failed", result: asFailure(result) });
        return;
      }
      const returned =
        result.data.status === "needs_edit" && result.data.openCorrection?.status === "open";
      if (result.data.status !== "draft_ready" && !returned) {
        setResource({ kind: "failed", result: { outcome: "unavailable" } });
        return;
      }
      setPanels(result.data.panels);
      setResource({ kind: "ready", data: result.data });
    });
    return () => {
      active = false;
    };
  }, [params.reportId, port]);

  const changed = useMemo(() => {
    if (resource.kind !== "ready" || !panels) return false;
    return JSON.stringify(resource.data.panels) !== JSON.stringify(panels);
  }, [panels, resource]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (resource.kind !== "ready" || !panels) return;
    const returned =
      resource.data.status === "needs_edit" &&
      resource.data.openCorrection?.status === "open";
    setSaving(true);
    setError(null);
    const result = await port.saveTrainerEdit({
      reportId: resource.data.reportId,
      expectedLockVersion: resource.data.lockVersion,
      expectedVersionId: resource.data.versionId,
      panels,
      ...(returned && correctionMode === "reaffirmed" && resource.data.openCorrection
        ? { reaffirmCorrectionRequestId: resource.data.openCorrection.id }
        : {}),
    });
    setSaving(false);
    if (result.outcome === "success") {
      router.push(
        `/trainer/reports/${resource.data.reportId}/review?saved=${result.data.correctionResolved ? "correction" : "1"}`,
      );
      return;
    }
    setError(
      "message" in result
        ? result.message
        : "The new version could not be saved. Reload the report to continue.",
    );
  }

  if (resource.kind === "loading") {
    return <LoadingSkeleton label="Loading Trainer report editor" rows={4} />;
  }
  if (resource.kind === "failed") return <StatePanel result={resource.result} />;
  if (!panels) return null;

  const returned =
    resource.data.status === "needs_edit" && resource.data.openCorrection?.status === "open";

  return (
    <form className="page-grid" onSubmit={save} noValidate>
      <nav aria-label="Breadcrumb" className="text-sm font-bold text-ink-muted">
        <Link href={`/trainer/reports/${resource.data.reportId}/review`} className="hover:text-brand-600">
          Report review
        </Link>
        <span aria-hidden="true" className="px-2">/</span>
        <span>{returned ? "Correction" : "Edit wording"}</span>
      </nav>
      <PageHeading
        eyebrow={returned ? "Trainer correction · fresh version required" : "Trainer wording editor"}
        title={resource.data.studentDisplayName}
        description={
          returned
            ? "Correct the flagged assessment fact through the governed Trainer workflow, or explicitly reaffirm it after checking. Either path creates a fresh version and checklist."
            : "Edit only the four report panels. A successful save creates a fresh immutable fixture version and resets the quality checklist."
        }
      />

      {returned && resource.data.openCorrection && (
        <FeedbackBanner tone="warning" title="Management concern to resolve">
          <strong>{formatScope(resource.data.openCorrection.issueScope)}</strong>
          {resource.data.openCorrection.dimensionCode
            ? ` · ${formatDimension(resource.data.openCorrection.dimensionCode)}`
            : ""}
          <span className="mt-1 block">{resource.data.openCorrection.reason}</span>
          <Link
            href={`/trainer/sessions/${resource.data.sessionId}/students/${resource.data.studentId}/assess`}
            className="mt-3 inline-flex min-h-10 items-center rounded-xl bg-warning-800 px-3.5 py-2 text-sm font-bold text-white hover:bg-amber-900"
          >
            Review the nine-dimension assessment
          </Link>
        </FeedbackBanner>
      )}

      {error && (
        <FeedbackBanner tone="error" title="New version was not saved">
          {error}
        </FeedbackBanner>
      )}

      <section className="grid gap-4 xl:grid-cols-2" aria-label="Four report panel editors">
        {REPORT_PANEL_CONFIG.map((panel) => (
          <label key={panel.key} className="card block p-5">
            <span className="text-lg font-black text-navy-950">{panel.label}</span>
            <span className="mt-1 block text-xs leading-5 text-ink-muted">{panel.supporting}</span>
            <textarea
              className="form-field mt-4 min-h-44 resize-y leading-6"
              value={panels[panel.key]}
              onChange={(event) =>
                setPanels((current) =>
                  current ? { ...current, [panel.key]: event.target.value } : current,
                )
              }
              aria-required="true"
            />
          </label>
        ))}
      </section>

      <section className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <p className="text-xs leading-5 text-ink-muted">
            Opening, closing, or cancelling this editor is non-mutating. Only a successful
            save creates a new version.
          </p>
          {returned && (
            <fieldset className="mt-4 grid gap-2">
              <legend className="text-sm font-extrabold text-navy-900">Correction outcome</legend>
              <label className="flex items-start gap-2 text-sm text-ink">
                <input
                  type="radio"
                  name="correction-mode"
                  value="corrected"
                  checked={correctionMode === "corrected"}
                  onChange={() => setCorrectionMode("corrected")}
                />
                I corrected the flagged assessment or report content.
              </label>
              <label className="flex items-start gap-2 text-sm text-ink">
                <input
                  type="radio"
                  name="correction-mode"
                  value="reaffirmed"
                  checked={correctionMode === "reaffirmed"}
                  onChange={() => setCorrectionMode("reaffirmed")}
                  disabled={changed}
                />
                I re-checked the concern and explicitly reaffirm the current content.
              </label>
            </fieldset>
          )}
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Link
            href={`/trainer/reports/${resource.data.reportId}/review`}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-line bg-white px-5 py-3 text-base font-bold text-navy-800 hover:border-brand-500 hover:bg-brand-100"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            size="large"
            disabled={
              (!returned && !changed) ||
              saving ||
              (returned && correctionMode === "reaffirmed" && changed)
            }
          >
            {saving
              ? "Saving new version…"
              : returned
                ? correctionMode === "reaffirmed"
                  ? "Create reaffirmation version"
                  : "Create correction version"
                : "Save changes & return to review"}
          </Button>
        </div>
      </section>
    </form>
  );
}

function formatScope(scope: "rating" | "observation" | "derived_assessment_fact") {
  return {
    rating: "Rating review",
    observation: "Observation review",
    derived_assessment_fact: "Assessment-fact review",
  }[scope];
}

function formatDimension(dimension: string) {
  return dimension
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}
