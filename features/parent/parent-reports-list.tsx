"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/trainer/trainer-fixture-runtime";
import type { ParentReportListItemDto } from "@/lib/frontend/contracts/physical-test";

export function ParentReportsList() {
  const port = usePhysicalTestPort();
  const searchParams = useSearchParams();
  const [state, setState] = useState<ResourceState<readonly ParentReportListItemDto[]>>({
    kind: "loading",
  });

  useEffect(() => {
    let active = true;
    void port.listParentSubmittedReports().then((result) => {
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
  }, [port]);

  if (state.kind === "loading") {
    return <LoadingSkeleton label="Loading available family reports" rows={4} />;
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

  const reports = searchParams.get("preview") === "empty" ? [] : state.data;

  return (
    <div className="page-grid" data-testid="parent-report-list">
      <PageHeading
        eyebrow="Parent · reports"
        title="Available reports"
        description="Reports ready for learners linked to this family view."
      />

      {reports.length === 0 ? (
        <section className="card px-6 py-12 text-center" role="status">
          <h2 className="text-xl font-black text-navy-950">No reports available yet</h2>
          <p className="mt-2 text-sm text-ink-muted">
            When a report is ready for your linked learner, it will appear here.
          </p>
        </section>
      ) : (
        <section className="grid gap-4" aria-label="Available family reports">
          {reports.map((report) => (
            <article key={`${report.sessionId}:${report.studentId}`} className="card p-5 sm:flex sm:items-center sm:justify-between sm:gap-5">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-600">
                  Session {formatDate(report.sessionDate)}
                </p>
                <h2 className="mt-1 text-xl font-black text-navy-950">
                  {report.studentDisplayName}
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Available {formatDateTime(report.submittedAt)}
                </p>
              </div>
              <Link
                href={`/parent/students/${report.studentId}/sessions/${report.sessionId}/report`}
                className="mt-4 inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-800 sm:mt-0"
              >
                Open report
              </Link>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Singapore",
  }).format(new Date(`${value}T00:00:00+08:00`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Singapore",
  }).format(new Date(value));
}
