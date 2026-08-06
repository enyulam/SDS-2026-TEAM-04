"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import type { ReturnedReportQueueItemDto } from "@/lib/frontend/contracts/physical-test";
import { asFailure, type ResourceState } from "./resource-state";
import { usePhysicalTestPort, usePortalRuntime } from "@/features/portal/portal-runtime-context";

export function ReturnedReportsQueue() {
  const searchParams = useSearchParams();
  const port = usePhysicalTestPort();
  const { dataRevision } = usePortalRuntime();
  const [resource, setResource] = useState<
    ResourceState<readonly ReturnedReportQueueItemDto[]>
  >({ kind: "loading" });

  useEffect(() => {
    let active = true;
    void port.listReturnedReports().then((result) => {
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
  }, [dataRevision, port]);

  if (searchParams.get("status") !== "needs_edit") {
    return <StatePanel result={{ outcome: "unavailable" }} />;
  }
  if (resource.kind === "loading") return <LoadingSkeleton label="Loading returned reports" rows={2} />;
  if (resource.kind === "failed") return <StatePanel result={resource.result} />;

  const reports = searchParams.get("preview") === "empty" ? [] : resource.data;

  return (
    <div className="page-grid">
      <PageHeading
        eyebrow="Returned work · needs edit"
        title="Trainer correction queue"
        description="Assessment-level issues returned by management appear here. The returned approved version remains frozen and cannot be reapproved."
      />

      {reports.length === 0 ? (
        <section className="card px-6 py-14 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-success-100 text-lg font-black text-success-700" aria-hidden="true">
            ✓
          </span>
          <h2 className="mt-5 text-xl font-black text-navy-950">No returned reports</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-muted">
            There are no open correction requests in this fixture view.
          </p>
          <Link href="/trainer/schedule" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-800">
            Return to schedule
          </Link>
        </section>
      ) : (
        <section className="grid gap-4" aria-label="Reports returned for Trainer correction">
          {reports.map((report) => (
            <article key={report.reportId} className="card overflow-hidden">
              <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-extrabold text-orange-900">
                      Returned
                    </span>
                    <span className="text-xs font-bold text-ink-muted">
                      Session {formatDate(report.sessionDate)}
                    </span>
                  </div>
                  <h2 className="mt-3 text-xl font-black text-navy-950">{report.studentDisplayName}</h2>
                  <p className="mt-2 text-sm font-extrabold text-warning-800">
                    {formatScope(report.correction.issueScope)}
                    {report.correction.dimensionCode
                      ? ` · ${formatDimension(report.correction.dimensionCode)}`
                      : ""}
                  </p>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-muted">
                    {report.correction.reason}
                  </p>
                </div>
                <Link
                  href={`/trainer/reports/${report.reportId}/review`}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-navy-800"
                >
                  Open correction detail
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

function formatScope(scope: ReturnedReportQueueItemDto["correction"]["issueScope"]) {
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

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
