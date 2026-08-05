"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/trainer/trainer-fixture-runtime";
import type { ManagementQueueRowDto } from "@/lib/frontend/contracts/physical-test";

export function ManagementReportsQueue() {
  const port = usePhysicalTestPort();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") ?? "trainer_approved";
  const acceptedStatus = status === "trainer_approved" || status === "needs_edit";
  const mode = status === "needs_edit" ? "corrections" : "pending";
  const [state, setState] = useState<ResourceState<readonly ManagementQueueRowDto[]>>({
    kind: "loading",
  });

  useEffect(() => {
    let active = true;
    if (!acceptedStatus) return;
    const request =
      status === "needs_edit"
        ? port.listManagementCorrectionTracking()
        : port.listManagementPendingReviews();
    void request.then((result) => {
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
  }, [acceptedStatus, port, status]);

  if (!acceptedStatus) {
    return (
      <StatePanel
        result={{ outcome: "unavailable" }}
        homeHref="/management"
        homeLabel="Return to Management workspace"
      />
    );
  }

  if (state.kind === "loading") {
    return <LoadingSkeleton label="Loading Management report queue" rows={4} />;
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

  const rows = searchParams.get("preview") === "empty" ? [] : state.data;
  const pending = mode === "pending";

  return (
    <div className="page-grid">
      <PageHeading
        eyebrow="Management queue"
        title={pending ? "Pending final review" : "Correction tracking"}
        description={
          pending
            ? "Trainer-approved reports waiting for Management's final quality review."
            : "Assessment-fact concerns returned to the Trainer stay visible here until reapproval."
        }
      />

      {rows.length === 0 ? (
        <section className="card px-6 py-12 text-center" role="status">
          <h2 className="text-xl font-black text-navy-950">
            {pending ? "No reports waiting" : "No corrections in progress"}
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            {pending
              ? "The final-review queue is clear in this fixture view."
              : "There are no open returned items in this fixture view."}
          </p>
        </section>
      ) : (
        <section className="grid gap-4" aria-label={pending ? "Pending reports" : "Returned reports"}>
          {rows.map((row) => (
            <article key={row.reportId} className="card p-5 sm:flex sm:items-center sm:justify-between sm:gap-5">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-brand-600">
                  Session {formatDate(row.sessionDate)}
                </p>
                <h2 className="mt-1 text-xl font-black text-navy-950">
                  {row.studentDisplayName}
                </h2>
                {!pending && (
                  <div className="mt-3 max-w-2xl rounded-xl bg-warning-100 px-4 py-3 text-sm text-warning-800">
                    <p className="font-extrabold">
                      {formatIssueScope(row.openCorrectionScope)} · {row.openCorrectionStatus}
                    </p>
                    {row.openCorrectionReason && <p className="mt-1 leading-6">{row.openCorrectionReason}</p>}
                  </div>
                )}
              </div>
              {pending ? (
                <Link
                  href={`/management/reports/${row.reportId}/review`}
                  className="mt-4 inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-500 sm:mt-0"
                >
                  Open safe review
                </Link>
              ) : (
                <span className="mt-4 inline-flex rounded-full bg-warning-100 px-3 py-1.5 text-xs font-extrabold text-warning-800 sm:mt-0">
                  Awaiting Trainer response
                </span>
              )}
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

function formatIssueScope(scope: ManagementQueueRowDto["openCorrectionScope"]) {
  if (!scope) return "Assessment-fact concern";
  return {
    rating: "Rating concern",
    observation: "Observation concern",
    derived_assessment_fact: "Derived assessment fact",
  }[scope];
}
