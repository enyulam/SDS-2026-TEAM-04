"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { REPORT_PANEL_CONFIG } from "@/features/trainer/report-panel-config";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/trainer/trainer-fixture-runtime";
import type {
  ManagementReviewDto,
  ReportPanelsDto,
} from "@/lib/frontend/contracts/physical-test";
import type { UiActionResult } from "@/lib/frontend/contracts/result";

type ActionFailure = Exclude<UiActionResult<unknown>, { outcome: "success" }>;

export function ManagementWordingEditor() {
  const params = useParams<{ reportId: string }>();
  const port = usePhysicalTestPort();
  const [resource, setResource] = useState<ResourceState<ManagementReviewDto>>({ kind: "loading" });
  const [panels, setPanels] = useState<ReportPanelsDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [failure, setFailure] = useState<ActionFailure | null>(null);

  useEffect(() => {
    let active = true;
    void port.getManagementReview(params.reportId).then((result) => {
      if (!active) return;
      if (result.outcome === "success") {
        setResource({ kind: "ready", data: result.data });
        setPanels(result.data.panels);
      } else {
        setResource({ kind: "failed", result: asFailure(result) });
      }
    });
    return () => {
      active = false;
    };
  }, [params.reportId, port]);

  const changed = useMemo(
    () =>
      resource.kind === "ready" &&
      panels !== null &&
      JSON.stringify(resource.data.panels) !== JSON.stringify(panels),
    [panels, resource],
  );

  if (resource.kind === "failed") {
    return (
      <StatePanel
        result={resource.result}
        homeHref="/management"
        homeLabel="Return to Management workspace"
      />
    );
  }
  if (resource.kind === "loading" || !panels) {
    return <LoadingSkeleton label="Loading wording editor" rows={5} />;
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (resource.kind !== "ready" || !panels) return;
    setSaving(true);
    setFailure(null);
    const result = await port.managementEditWording({
      reportId: params.reportId,
      expectedLockVersion: resource.data.lockVersion,
      expectedVersionId: resource.data.versionId,
      expectedWordingHash: resource.data.wordingHash,
      panels,
    });
    setSaving(false);
    if (result.outcome === "success") setSaved(true);
    else setFailure(result);
  }

  if (saved) {
    return (
      <div className="page-grid">
        <FeedbackBanner tone="success" title="Wording changes saved">
          A new final-review candidate was created from the four parent-facing panels. It is still awaiting Management submission.
        </FeedbackBanner>
        <div>
          <Link
            href={`/management/reports/${params.reportId}/review`}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-500"
          >
            Return to safe review
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="page-grid" onSubmit={save} noValidate>
      <PageHeading
        eyebrow="Management · wording only"
        title="Refine parent-facing wording"
        description="Edit grammar, clarity, tone, or presentation only. Any assessment-fact concern belongs in the bounded return path."
      />

      {failure && (
        <FeedbackBanner tone="error" title={failure.outcome === "stale_state" ? "This review changed" : "Wording not saved"}>
          {"message" in failure
            ? failure.message
            : "This item isn't available. No additional details can be shown."}
        </FeedbackBanner>
      )}

      <section className="grid gap-4 lg:grid-cols-2" aria-label="Four-panel wording editor">
        {REPORT_PANEL_CONFIG.map((panel) => (
          <label key={panel.key} className="card block p-5 sm:p-6">
            <span className="text-sm font-extrabold text-navy-950">{panel.label}</span>
            <span className="mt-1 block text-xs leading-5 text-ink-muted">{panel.supporting}</span>
            <textarea
              className="form-field mt-3 min-h-40 resize-y"
              value={panels[panel.key]}
              onChange={(event) =>
                setPanels((current) =>
                  current ? { ...current, [panel.key]: event.target.value } : current,
                )
              }
              required
            />
          </label>
        ))}
      </section>

      <div className="flex flex-wrap justify-end gap-2">
        <Link
          href={`/management/reports/${params.reportId}/review`}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-bold text-navy-800 hover:border-brand-500 hover:bg-brand-100"
        >
          Cancel
        </Link>
        <Button type="submit" size="large" disabled={!changed || saving}>
          {saving ? "Saving wording…" : "Save wording changes"}
        </Button>
      </div>
    </form>
  );
}
