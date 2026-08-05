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
  const [resource, setResource] = useState<ResourceState<TrainerWorkingReportDto>>({ kind: "loading" });
  const [panels, setPanels] = useState<ReportPanelsDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void port.getTrainerWorkingReport(params.reportId).then((result) => {
      if (!active) return;
      if (result.outcome !== "success") {
        setResource({ kind: "failed", result: asFailure(result) });
        return;
      }
      if (result.data.status !== "draft_ready" || result.data.openCorrection?.status === "open") {
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
    setSaving(true);
    setError(null);
    const result = await port.saveTrainerEdit({
      reportId: resource.data.reportId,
      expectedLockVersion: resource.data.lockVersion,
      expectedVersionId: resource.data.versionId,
      panels,
    });
    setSaving(false);
    if (result.outcome === "success") {
      router.push(`/trainer/reports/${resource.data.reportId}/review?saved=1`);
      return;
    }
    setError(
      "message" in result
        ? result.message
        : "The wording changes could not be saved. Reload the report to continue.",
    );
  }

  if (resource.kind === "loading") return <LoadingSkeleton label="Loading Trainer wording editor" rows={4} />;
  if (resource.kind === "failed") return <StatePanel result={resource.result} />;
  if (!panels) return null;

  return (
    <form className="page-grid" onSubmit={save} noValidate>
      <nav aria-label="Breadcrumb" className="text-sm font-bold text-ink-muted">
        <Link href={`/trainer/reports/${resource.data.reportId}/review`} className="hover:text-brand-600">
          Report review
        </Link>
        <span aria-hidden="true" className="px-2">/</span>
        <span>Edit wording</span>
      </nav>
      <PageHeading
        eyebrow="Trainer wording editor"
        title={resource.data.studentDisplayName}
        description="Edit only the four report panels. A successful save creates a fresh immutable fixture version and resets the quality checklist."
      />

      {error && <FeedbackBanner tone="error" title="Changes were not saved">{error}</FeedbackBanner>}

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
        <p className="max-w-xl text-xs leading-5 text-ink-muted">
          Opening, closing, or cancelling this editor is non-mutating. Only a successful
          save creates a new version.
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Link
            href={`/trainer/reports/${resource.data.reportId}/review`}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-line bg-white px-5 py-3 text-base font-bold text-navy-800 hover:border-brand-500 hover:bg-brand-100"
          >
            Cancel
          </Link>
          <Button type="submit" size="large" disabled={!changed || saving}>
            {saving ? "Saving new version…" : "Save changes & return to review"}
          </Button>
        </div>
      </section>
    </form>
  );
}
