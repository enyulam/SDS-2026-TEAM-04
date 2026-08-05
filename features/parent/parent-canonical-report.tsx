"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { REPORT_PANEL_CONFIG } from "@/features/trainer/report-panel-config";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/trainer/trainer-fixture-runtime";
import type { CanonicalReportDto } from "@/lib/frontend/contracts/physical-test";

export function ParentCanonicalReport() {
  const params = useParams<{ sessionId: string; studentId: string }>();
  const port = usePhysicalTestPort();
  const [state, setState] = useState<ResourceState<CanonicalReportDto>>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    void port.getCanonicalReport(params.sessionId, params.studentId).then((result) => {
      if (!active) return;
      setState(
        result.outcome === "success"
          ? { kind: "ready", data: result.data }
          : { kind: "failed", result: asFailure(result) },
      );
    });
    return () => {
      active = false;
    };
  }, [params.sessionId, params.studentId, port]);

  if (state.kind === "loading") {
    return <LoadingSkeleton label="Loading family report" rows={5} />;
  }
  if (state.kind === "failed") {
    return (
      <StatePanel
        result={state.result}
        homeHref="/parent"
        homeLabel="Return to Parent workspace"
      />
    );
  }

  return (
    <div className="page-grid" data-testid="parent-canonical-report">
      <PageHeading
        eyebrow={`Available ${formatDate(state.data.submittedAt)}`}
        title="Learner progress report"
        description="A concise family-facing summary from this class session."
      />
      <section className="grid gap-4 lg:grid-cols-2" aria-label="Family report panels">
        {REPORT_PANEL_CONFIG.map((panel) => (
          <article key={panel.key} className="card p-5 sm:p-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-600">
              {panel.label}
            </p>
            <p className="mt-3 text-sm leading-7 text-ink">{state.data.panels[panel.key]}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Singapore",
  }).format(new Date(value));
}
