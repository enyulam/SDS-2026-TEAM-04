"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Icon } from "@/components/ui/icon";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { StatePanel } from "@/components/ui/state-panel";
import type {
  ReportPanelsDto,
  TrainerWorkingReportDto,
} from "@/lib/frontend/contracts/physical-test";
import { REPORT_PANEL_CONFIG } from "./report-panel-config";
import { asFailure, type ResourceState } from "./resource-state";
import { usePhysicalTestPort } from "./trainer-fixture-runtime";

/**
 * Trainer wording editor — the `/trainer/reports/[reportId]/edit` sub-surface of screen 10
 * (FRONTEND RECONSTRUCTION F9 / operator checkpoint F-09).
 *
 * OPEN ROUTE DECISION OD-3, RECORDED AND NOT RESOLVED HERE. Whether this path becomes a
 * canonical sub-route of ID 10 or receives its own inventory ID once a frame exists is recorded
 * at `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md` §7.4 as an operator decision, and the
 * route treatment lands at F-16. Nothing here creates, moves, renames or redirects a route.
 *
 * NO FROZEN FRAME EXISTS FOR THIS SURFACE. `reference.png` covers node `664:9`, the review
 * surface only. Rather than invent a frame (`GLOBAL_UI_RULES` §8 stop-and-ask), this checkpoint
 * restyles the editor onto the SHARED F1 foundation the review surface uses — tokens, card
 * surfaces, field treatment and button primitives that already exist — and changes no behaviour,
 * no field, no label and no governed call. That is presentation convergence with its sibling
 * surface, not a reconstruction, and this surface is NOT proposed as visually accepted.
 *
 * GOVERNANCE PRESERVED VERBATIM (Amendment 004 A-035 … A-037):
 *
 *  - EVERY ACCEPTED CONTENT CHANGE CREATES A NEW IMMUTABLE VERSION. A trainer edit never mutates
 *    a frozen approval snapshot in place, and a successful save resets the quality checklist so
 *    review and approval are required again for the new text.
 *  - ONLY THE FOUR PARENT-FACING PANELS ARE EDITABLE. No rating, observation, attendance record,
 *    evidence item or internal note is reachable from this surface.
 *  - A RETURNED REPORT CANNOT BE REAPPROVED AS-IS. The correction path produces a fresh
 *    correction version, or an EXPLICIT reaffirmation naming the open correction request — a
 *    silent byte-identical save is rejected server-side, so "the trainer checked and stood by
 *    the assessment" is never recorded the same way as "the trainer did nothing".
 *  - OPENING, CLOSING OR CANCELLING THIS EDITOR IS NON-MUTATING.
 */
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
  const reviewHref = `/trainer/reports/${resource.data.reportId}/review`;

  return (
    <form className="page-grid" onSubmit={save} noValidate>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-page-title font-extrabold tracking-[-0.02em] text-ink-strong">
            {returned ? "Correct Report Wording" : "Edit Report Wording"}
          </h1>
          <nav aria-label="Breadcrumb" className="mt-1">
            <ol className="flex flex-wrap items-center gap-x-2 text-small text-neutral-on">
              <li>
                <Link
                  href={reviewHref}
                  className="font-semibold text-neutral-on underline-offset-4 hover:text-brand-800"
                >
                  Student Report
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>{resource.data.studentDisplayName}</li>
            </ol>
          </nav>
          <p className="mt-3 max-w-2xl text-body leading-6 text-ink">
            {returned
              ? "Correct the flagged assessment fact through the governed Trainer workflow, or explicitly reaffirm it after checking. Either path creates a fresh immutable version and a fresh quality checklist."
              : "Edit only the four report panels. A successful save creates a fresh immutable version and resets the quality checklist, so this exact text is reviewed and approved again."}
          </p>
        </div>
        <Link
          href={reviewHref}
          className="mt-1 inline-flex min-h-11 shrink-0 items-center gap-2 rounded-field bg-brand-100 px-4 py-2.5 text-body font-bold text-brand-800 no-underline transition hover:bg-brand-200"
        >
          <Icon name="chevronLeft" size={16} />
          Back
        </Link>
      </header>

      {returned && resource.data.openCorrection && (
        <FeedbackBanner tone="warning" title="Management concern to resolve">
          <strong>{formatScope(resource.data.openCorrection.issueScope)}</strong>
          {resource.data.openCorrection.dimensionCode
            ? ` · ${formatDimension(resource.data.openCorrection.dimensionCode)}`
            : ""}
          <span className="mt-1 block">{resource.data.openCorrection.reason}</span>
          <Link
            href={`/trainer/sessions/${resource.data.sessionId}/students/${resource.data.studentId}/assess`}
            className="mt-3 inline-flex min-h-11 items-center rounded-field bg-warning-on px-4 py-2.5 text-body font-bold text-white no-underline hover:bg-[#6f4d05]"
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
          <label key={panel.key} data-panel-editor={panel.key} className="card block p-5">
            <span className="block text-card-title font-extrabold text-ink-strong">
              {panel.label}
            </span>
            <span className="mt-1 block text-small leading-6 text-neutral-on">
              {panel.supporting}
            </span>
            <textarea
              className="form-field mt-4 min-h-44 resize-y text-body leading-7"
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

      <section className="card flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <p className="text-small leading-6 text-ink">
            Opening, closing or cancelling this editor is non-mutating. Only a successful save
            creates a new immutable version, and that save resets all three checklist items.
          </p>
          {returned && (
            <fieldset className="mt-4 grid gap-2">
              <legend className="text-body font-extrabold text-ink-strong">
                Correction outcome
              </legend>
              <label className="flex items-start gap-2.5 text-body text-ink">
                <input
                  type="radio"
                  name="correction-mode"
                  className="mt-1 accent-[#b02a63]"
                  value="corrected"
                  checked={correctionMode === "corrected"}
                  onChange={() => setCorrectionMode("corrected")}
                />
                I corrected the flagged assessment or report content.
              </label>
              <label className="flex items-start gap-2.5 text-body text-ink">
                <input
                  type="radio"
                  name="correction-mode"
                  className="mt-1 accent-[#b02a63]"
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
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <Link
            href={reviewHref}
            className="inline-flex min-h-12 items-center justify-center rounded-field border border-line bg-surface px-5 py-3 text-body font-bold text-ink-strong no-underline shadow-raised transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800"
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
