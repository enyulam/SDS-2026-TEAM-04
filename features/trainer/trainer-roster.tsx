"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { StatusPill } from "@/components/ui/status-pill";
import type {
  RosterEntryDto,
  TrainerSessionSummaryDto,
} from "@/lib/frontend/contracts/physical-test";
import { useFixtureRuntime, usePhysicalTestPort } from "./trainer-fixture-runtime";
import { asFailure, type ResourceState } from "./resource-state";

type RosterView = {
  readonly session: TrainerSessionSummaryDto;
  readonly roster: readonly RosterEntryDto[];
};

export function TrainerRoster() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;
  const port = usePhysicalTestPort();
  const { fixtureRevision } = useFixtureRuntime();
  const [state, setState] = useState<ResourceState<RosterView>>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    void Promise.all([port.listTrainerSessions(), port.getSessionRoster(sessionId)]).then(
      ([sessionsResult, rosterResult]) => {
        if (!active) return;
        if (sessionsResult.outcome !== "success") {
          setState({ kind: "failed", result: asFailure(sessionsResult) });
          return;
        }
        if (rosterResult.outcome !== "success") {
          setState({ kind: "failed", result: asFailure(rosterResult) });
          return;
        }
        const session = sessionsResult.data.find((item) => item.sessionId === sessionId);
        if (!session) {
          setState({ kind: "failed", result: { outcome: "unavailable" } });
          return;
        }
        setState({ kind: "ready", data: { session, roster: rosterResult.data } });
      },
    );
    return () => {
      active = false;
    };
  }, [fixtureRevision, port, sessionId]);

  if (state.kind === "loading") return <LoadingSkeleton label="Loading session roster" rows={4} />;
  if (state.kind === "failed") return <StatePanel result={state.result} />;

  const { session, roster } = state.data;
  const present = roster.filter((item) => item.attendanceState === "present").length;
  const completed = roster.filter((item) =>
    ["trainer_approved", "submitted"].includes(item.reportState),
  ).length;

  return (
    <div className="page-grid">
      <nav aria-label="Breadcrumb" className="text-sm font-bold text-ink-muted">
        <Link href="/trainer/schedule" className="hover:text-brand-600">Schedule</Link>
        <span aria-hidden="true" className="px-2">/</span>
        <span>Session roster</span>
      </nav>
      <PageHeading
        eyebrow={`${session.classGrade} · ${formatDate(session.date)}`}
        title={session.moduleName}
        description={`${session.startTime}–${session.endTime} · ${present} present · ${completed} trainer-approved or submitted`}
      />

      {roster.length === 0 ? (
        <section className="card px-6 py-12 text-center">
          <h2 className="text-xl font-black text-navy-950">No learners enrolled</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-muted">
            This Class Session currently has an empty roster projection.
          </p>
        </section>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2" aria-label="Session learners">
          {roster.map((entry, index) => (
            <article key={entry.studentId} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-11 shrink-0 place-items-center rounded-2xl bg-navy-900 text-sm font-black text-white"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-black text-navy-950">{entry.displayName}</h2>
                    <p className="mt-0.5 text-xs font-bold uppercase tracking-[0.1em] text-ink-muted">
                      {entry.attendanceState}
                    </p>
                  </div>
                </div>
                <StatusPill status={entry.reportState} />
              </div>

              <div className="mt-5 rounded-2xl bg-surface-muted p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink-muted">
                  Previous session focus
                </p>
                <p className="mt-2 text-sm leading-6 text-ink">
                  {entry.previousSessionFocus ?? "No previous focus is available yet."}
                </p>
              </div>

              <div className="mt-5">{renderAction(sessionId, entry)}</div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

function renderAction(sessionId: string, entry: RosterEntryDto) {
  if (entry.attendanceState === "absent") {
    return (
      <button className="min-h-11 w-full cursor-not-allowed rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-extrabold text-slate-500" disabled>
        Absent · assessment unavailable
      </button>
    );
  }
  if (entry.reportState === "trainer_approved") {
    return (
      <button className="min-h-11 w-full cursor-not-allowed rounded-xl bg-indigo-100 px-4 py-2.5 text-sm font-extrabold text-indigo-700" disabled>
        Awaiting management final review
      </button>
    );
  }
  if (entry.reportState === "draft_ready" || entry.reportState === "needs_edit") {
    return (
      <Link
        href={`/trainer/reports/${entry.reportId}/review`}
        className="flex min-h-11 w-full items-center justify-center rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-navy-800"
      >
        {entry.reportState === "needs_edit" ? "Review returned report" : "Review draft"}
      </Link>
    );
  }
  if (entry.reportState === "observation_saved" && entry.reportId) {
    return (
      <Link
        href={`/trainer/reports/${entry.reportId}/generate`}
        className="flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-brand-800"
      >
        Generate report draft
      </Link>
    );
  }
  return (
    <Link
      href={`/trainer/sessions/${sessionId}/students/${entry.studentId}/assess`}
      className="flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-brand-800"
    >
      Start nine-dimension assessment
    </Link>
  );
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-SG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
