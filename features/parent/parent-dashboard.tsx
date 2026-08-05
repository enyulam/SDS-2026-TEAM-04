"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/trainer/trainer-fixture-runtime";
import type {
  AvailabilityStateDto,
  ParentReportListItemDto,
} from "@/lib/frontend/contracts/physical-test";

type DashboardData = {
  readonly availability: AvailabilityStateDto;
  readonly reports: readonly ParentReportListItemDto[];
};

export function ParentDashboard() {
  const port = usePhysicalTestPort();
  const searchParams = useSearchParams();
  const [state, setState] = useState<ResourceState<DashboardData>>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    void Promise.all([port.getParentAvailability(), port.listParentSubmittedReports()]).then(
      ([availability, reports]) => {
        if (!active) return;
        if (availability.outcome !== "success") {
          setState({ kind: "failed", result: asFailure(availability) });
        } else if (reports.outcome !== "success") {
          setState({ kind: "failed", result: asFailure(reports) });
        } else {
          setState({
            kind: "ready",
            data: { availability: availability.data, reports: reports.data },
          });
        }
      },
    );
    return () => {
      active = false;
    };
  }, [port]);

  if (state.kind === "loading") {
    return <LoadingSkeleton label="Loading family report availability" rows={3} />;
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

  const preview = searchParams.get("preview");
  const availability: AvailabilityStateDto =
    preview === "none"
      ? "none_yet"
      : preview === "linked_unavailable"
        ? "linked_unavailable"
        : state.data.availability;

  return (
    <div className="page-grid" data-testid="parent-dashboard">
      <PageHeading
        eyebrow="Parent workspace"
        title="Family reports"
        description="Open reports that are ready for your linked learner."
      />

      {availability === "available" ? (
        <>
          <FeedbackBanner tone="success" title="A report is available">
            {state.data.reports.length} {state.data.reports.length === 1 ? "report is" : "reports are"}{" "}
            ready to view.
          </FeedbackBanner>
          <section className="card p-6 sm:p-7">
            <h2 className="text-2xl font-black text-navy-950">Ready to read</h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Visit the report list to open the latest available family report.
            </p>
            <Link
              href="/parent/reports"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-500"
            >
              View available reports
            </Link>
          </section>
        </>
      ) : (
        <section className="card px-6 py-12 text-center" role="status">
          <h2 className="text-xl font-black text-navy-950">
            {availability === "linked_unavailable" ? "Family view unavailable" : "No reports available yet"}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-ink-muted">
            {availability === "linked_unavailable"
              ? "This family view cannot be shown right now. Try again later."
              : "When a report is ready for your linked learner, it will appear here."}
          </p>
        </section>
      )}
    </div>
  );
}
