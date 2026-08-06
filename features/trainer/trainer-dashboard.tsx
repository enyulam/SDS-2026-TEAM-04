"use client";

/**
 * Trainer landing surface, delivered by Round F2.
 *
 * RETAINED, NOT DELETED. At checkpoint F-04 (operator ruling R-B1) `/trainer` became a
 * compatibility redirect onto the canonical `/trainer/schedule`, so this component is
 * currently unmounted. Its session-selection function is preserved on the Schedule surface
 * (`screen.md` §6). It is kept for screen `01` Trainer Dashboard — a DEFERRED post-48-hour
 * screen (A-044) whose canonical route is `/trainer/dashboard` (inventory §7.2) and which
 * gets its own reconstruction checkpoint. Deleting it here would discard delivered work
 * that checkpoint will need.
 */

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { reportStatusLabel } from "@/components/ui/status-pill";
import type { TrainerSessionSummaryDto } from "@/lib/frontend/contracts/physical-test";
import { usePhysicalTestPort, usePortalRuntime } from "@/features/portal/portal-runtime-context";
import { asFailure, type ResourceState } from "./resource-state";

export function TrainerDashboard() {
  const port = usePhysicalTestPort();
  const { dataRevision } = usePortalRuntime();
  const searchParams = useSearchParams();
  const [state, setState] = useState<
    ResourceState<readonly TrainerSessionSummaryDto[]>
  >({ kind: "loading" });

  useEffect(() => {
    let active = true;
    void port.listTrainerSessions().then((result) => {
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
  }, [port, dataRevision]);

  if (state.kind === "loading") {
    return <LoadingSkeleton label="Loading assigned Trainer sessions" rows={3} />;
  }
  if (state.kind === "failed") return <StatePanel result={state.result} />;

  const sessions = searchParams.get("preview") === "empty" ? [] : state.data;
  const totalLearners = sessions.reduce((sum, item) => sum + item.studentCount, 0);
  const returnedCount = sessions.reduce(
    (sum, item) => sum + (item.countsByReportState.needs_edit ?? 0),
    0,
  );

  return (
    <div className="page-grid">
      <PageHeading
        eyebrow="Trainer workspace"
        title="Good afternoon, Trainer Fixture"
        description="Review assigned Class Sessions, continue assessment work, and send completed reports to management for final review."
      />

      <section className="grid gap-3 sm:grid-cols-3" aria-label="Assigned work summary">
        <Metric label="Assigned sessions" value={sessions.length} />
        <Metric label="Learners on roster" value={totalLearners} />
        <Metric label="Returned reports" value={returnedCount} tone={returnedCount ? "attention" : "default"} />
      </section>

      {returnedCount > 0 && (
        <FeedbackBanner
          tone="warning"
          title="A report needs your attention"
          actions={
            /*
              F-01c — `bg-warning-800` and `hover:bg-amber-900` named a token this project
              never defines (`app/globals.css` declares `--color-warning-soft` and
              `--color-warning-on`, no `warning` numeric ramp), so Tailwind emitted NO rule
              and this control rendered its declared white label on the inherited
              `bg-warning-soft` banner — white on #fef3d7, about 1.1:1. Moved to the defined
              `bg-warning-on` (#8a6106) with the same hover pair F-09 already established on
              `trainer-report-review.tsx` and `trainer-report-editor.tsx`; white on #8a6106
              measures 5.537:1.
            */
            <Link
              href="/trainer/reports?status=needs_edit"
              className="inline-flex min-h-10 items-center rounded-xl bg-warning-on px-3.5 py-2 text-sm font-bold text-white hover:bg-[#6f4d05]"
            >
              Open returned queue
            </Link>
          }
        >
          Management has returned one assessment-level issue. The existing approved
          version stays frozen; a fresh correction version is required before reapproval.
        </FeedbackBanner>
      )}

      <section aria-labelledby="sessions-heading">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 id="sessions-heading" className="text-xl font-black text-navy-950">
              Assigned Class Sessions
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Session dates and rosters are fixture projections in this round.
            </p>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="card px-6 py-12 text-center">
            <p className="text-lg font-extrabold text-navy-950">No assigned sessions</p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-muted">
              There are no Class Sessions assigned to this Trainer in the selected fixture view.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {sessions.map((session) => (
              <article key={session.sessionId} className="card overflow-hidden">
                <div className="border-b border-line bg-surface-muted px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-extrabold text-brand-600">
                      {session.classGrade}
                    </span>
                    <span className="text-xs font-bold text-ink-muted">
                      {formatDate(session.date)}
                    </span>
                  </div>
                  <h3 className="mt-3 text-xl font-black text-navy-950">{session.moduleName}</h3>
                  <p className="mt-1 text-sm text-ink-muted">
                    {session.startTime}–{session.endTime} · {session.studentCount}{" "}
                    {session.studentCount === 1 ? "learner" : "learners"}
                  </p>
                </div>
                <div className="px-5 py-4">
                  <div className="flex min-h-7 flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-ink-muted">
                    {Object.entries(session.countsByReportState).length === 0 ? (
                      <span>No report work yet</span>
                    ) : (
                      Object.entries(session.countsByReportState).map(([status, count]) => (
                        <span key={status}>
                          {count} {reportStatusLabel(status as keyof typeof session.countsByReportState)}
                        </span>
                      ))
                    )}
                  </div>
                  <Link
                    href={`/trainer/sessions/${session.sessionId}/roster`}
                    className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-navy-800"
                  >
                    Open session roster
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  tone = "default",
}: {
  readonly label: string;
  readonly value: number;
  readonly tone?: "default" | "attention";
}) {
  return (
    <div className={`card px-5 py-4 ${tone === "attention" ? "border-amber-300" : ""}`}>
      <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink-muted">{label}</p>
      {/* F-01c — same undefined `warning-800` token as above; `text-warning-on` is defined. */}
      <p className={`mt-2 text-3xl font-black ${tone === "attention" ? "text-warning-on" : "text-navy-950"}`}>
        {value}
      </p>
    </div>
  );
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-SG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
