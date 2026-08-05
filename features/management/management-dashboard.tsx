"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/trainer/trainer-fixture-runtime";
import type { ManagementQueueRowDto } from "@/lib/frontend/contracts/physical-test";

type DashboardData = {
  readonly pending: readonly ManagementQueueRowDto[];
  readonly corrections: readonly ManagementQueueRowDto[];
};

export function ManagementDashboard() {
  const port = usePhysicalTestPort();
  const [state, setState] = useState<ResourceState<DashboardData>>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    void Promise.all([
      port.listManagementPendingReviews(),
      port.listManagementCorrectionTracking(),
    ]).then(([pending, corrections]) => {
      if (!active) return;
      if (pending.outcome !== "success") {
        setState({ kind: "failed", result: asFailure(pending) });
      } else if (corrections.outcome !== "success") {
        setState({ kind: "failed", result: asFailure(corrections) });
      } else {
        setState({ kind: "ready", data: { pending: pending.data, corrections: corrections.data } });
      }
    });
    return () => {
      active = false;
    };
  }, [port]);

  if (state.kind === "loading") {
    return <LoadingSkeleton label="Loading Management workspace" rows={3} />;
  }
  if (state.kind === "failed") {
    return (
      <StatePanel
        result={state.result}
        homeHref="/management"
        homeLabel="Return to Management workspace"
      />
    );
  }

  return (
    <div className="page-grid">
      <PageHeading
        eyebrow="Management · final quality review"
        title="Review centre reports"
        description="Complete the final wording review, return assessment-fact concerns to the Trainer, or submit an accepted report."
      />

      {state.data.pending.length > 0 && (
        <FeedbackBanner tone="warning" title="Reports are waiting for final review">
          {state.data.pending.length} {state.data.pending.length === 1 ? "report is" : "reports are"}{" "}
          ready in the durable review queue.
        </FeedbackBanner>
      )}

      <section className="grid gap-4 sm:grid-cols-2" aria-label="Management queue summary">
        <QueueCard
          label="Pending final review"
          count={state.data.pending.length}
          href="/management/reports?status=trainer_approved"
          action="Open review queue"
        />
        <QueueCard
          label="Corrections in progress"
          count={state.data.corrections.length}
          href="/management/reports?status=needs_edit"
          action="Open correction tracking"
        />
      </section>
    </div>
  );
}

function QueueCard({
  label,
  count,
  href,
  action,
}: {
  readonly label: string;
  readonly count: number;
  readonly href: string;
  readonly action: string;
}) {
  return (
    <article className="card p-5 sm:p-6">
      <p className="text-sm font-bold text-ink-muted">{label}</p>
      <p className="mt-2 text-4xl font-black text-navy-950">{count}</p>
      <Link
        href={href}
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-500"
      >
        {action}
      </Link>
    </article>
  );
}
