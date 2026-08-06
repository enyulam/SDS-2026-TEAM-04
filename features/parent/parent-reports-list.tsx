"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import { Icon, IconTile } from "@/components/ui/icon";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/trainer/trainer-fixture-runtime";
import type { ParentReportListItemDto } from "@/lib/frontend/contracts/physical-test";

/**
 * Screen 32 — Parent Reports list (FRONTEND RECONSTRUCTION F14 / operator checkpoint F-14).
 *
 * Visual authority (Amendment 005 A-045): the frozen
 * `UI_REFERENCE_FINAL_MVP/32-parent-reports/reference.png` (node `533:180`) -> the
 * node-specific Figma frame -> the previous implementation. Reconstructed here as the
 * frame's page title, "Viewing <child>" affordance, "All Reports" section heading and a
 * stack of white report rows — tinted document tile, title, meta line, right-aligned
 * primary "View" action.
 *
 * GOVERNANCE OVERRIDES THE FROZEN SCREENSHOT — operator ruling R-B6, and this is the whole
 * point of this screen. The frame draws an AGGREGATE RATING CHIP on every row
 * ("Mastering", "Developing"). It is DELIBERATELY NOT IMPLEMENTED. A Parent receives the
 * submitted canonical narrative ONLY. No aggregate rating chip, no per-dimension rating, no
 * observation, no correction history, no content hash, no version metadata and no audit
 * internal renders on this surface, in any form or wording (CLAUDE.md §6; A-021; A-038;
 * A-048; GLOBAL_UI_RULES §5). The frame is used for shell, spacing, typography and layout
 * and for nothing else. The deviation is recorded in `implementation-notes.md`, in
 * `docs/workstreams/48H_FRONTEND_PROGRESS.md` and in the checkpoint report — Figma never
 * bypasses governance, and the divergence is recorded, never silently resolved.
 *
 * Reachability is the governed projection's, not this component's: `listParentSubmittedReports`
 * returns only the canonical submitted version `reports.latest_submitted_version_id` names,
 * for students reachable through a live `parent_student_links` row. The child affordance
 * below narrows the rows that projection ALREADY returned. It is a presentation control over
 * live links only — never a picker over the centre's students — and it reaches no other
 * student, report or version.
 */

export function ParentReportsList() {
  const port = usePhysicalTestPort();
  const searchParams = useSearchParams();
  const childSelectId = useId();
  const [selectedStudentId, setSelectedStudentId] = useState("all");
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

  const rows = useMemo(() => {
    if (state.kind !== "ready") return [];
    if (searchParams.get("preview") === "empty") return [];
    return state.data;
  }, [searchParams, state]);

  /**
   * The linked-child affordance is derived from the rows the governed projection returned,
   * so it can never name a student the authenticated Parent has no live link to.
   */
  const linkedChildren = useMemo(() => {
    const seen = new Map<string, string>();
    for (const row of rows) {
      if (!seen.has(row.studentId)) seen.set(row.studentId, row.studentDisplayName);
    }
    return [...seen].map(([studentId, displayName]) => ({ studentId, displayName }));
  }, [rows]);

  const visibleRows = useMemo(
    () =>
      selectedStudentId === "all"
        ? rows
        : rows.filter((row) => row.studentId === selectedStudentId),
    [rows, selectedStudentId],
  );

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

  const selectedChild =
    linkedChildren.find((child) => child.studentId === selectedStudentId) ??
    (linkedChildren.length === 1 ? linkedChildren[0] : undefined);

  return (
    <div className="page-grid" data-testid="parent-report-list">
      {/*
        The subtitle is rendered here rather than through PageHeading's `description` prop:
        that prop resolves to `text-ink-muted` (#8a93a8), which measures below the 4.5:1 AA
        floor for normal-size text on this canvas. `components/ui/page-heading.tsx` is
        outside this checkpoint's owned paths, so the shared primitive is left untouched and
        the failure stays recorded for a separate foundation authorization (as at F11).
      */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <PageHeading title="Reports" />
          <p className="mt-1 max-w-2xl text-body leading-6 text-ink">
            {selectedChild
              ? `Reports you've received for ${selectedChild.displayName}.`
              : "Reports you've received for your linked learners."}
          </p>
        </div>

        {linkedChildren.length > 0 && (
          <div className="shrink-0 rounded-card border border-line bg-surface px-4 py-2.5 shadow-raised">
            {linkedChildren.length === 1 ? (
              <>
                <p className="block text-micro font-semibold text-ink">Viewing</p>
                <p className="mt-0.5 text-body font-bold text-ink-strong">
                  {linkedChildren[0].displayName}
                </p>
              </>
            ) : (
              <>
                <label
                  className="block text-micro font-semibold text-ink"
                  htmlFor={childSelectId}
                >
                  Viewing
                </label>
                <select
                  id={childSelectId}
                  value={selectedStudentId}
                  onChange={(event) => setSelectedStudentId(event.target.value)}
                  className="mt-0.5 block cursor-pointer border-0 bg-transparent p-0 text-body font-bold text-ink-strong"
                >
                  <option value="all">All linked learners</option>
                  {linkedChildren.map((child) => (
                    <option key={child.studentId} value={child.studentId}>
                      {child.displayName}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        )}
      </div>

      {visibleRows.length === 0 ? (
        <section className="card px-6 py-12 text-center" role="status">
          <h2 className="text-section-title font-extrabold text-ink-strong">
            No reports available yet
          </h2>
          <p className="mt-2 text-body text-ink">
            When a report is ready for your linked learner, it will appear here.
          </p>
        </section>
      ) : (
        <section aria-labelledby="parent-all-reports" className="grid gap-4">
          <h2
            id="parent-all-reports"
            className="text-section-title font-extrabold text-ink-strong"
          >
            All Reports
          </h2>

          {visibleRows.map((report) => (
            <article
              key={`${report.sessionId}:${report.studentId}`}
              className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-5"
            >
              <IconTile tone="brand" size="large">
                <Icon name="document" size={20} />
              </IconTile>

              <div className="min-w-0 flex-1">
                {/*
                  The frame's row title is a lesson/topic name and its meta line carries
                  class grade, class module, lesson number and trainer name. The governed
                  Parent projection carries none of those fields, so they are OMITTED rather
                  than fabricated (GLOBAL_UI_RULES §10) and recorded as a dependency. The row
                  is titled with the governed student name — which also keeps the existing
                  three-role smoke assertion on this heading valid.
                */}
                <h2 className="text-card-title font-extrabold text-ink-strong">
                  {report.studentDisplayName}
                </h2>
                <p className="mt-1 text-small text-ink">
                  Session {formatDate(report.sessionDate)} · Received{" "}
                  {formatDateTime(report.submittedAt)}
                </p>
              </div>

              <Link
                href={`/parent/students/${report.studentId}/sessions/${report.sessionId}/report`}
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-field bg-brand-700 px-5 py-2.5 text-body font-bold text-white no-underline hover:bg-brand-800"
              >
                View
                <span className="sr-only">
                  {" "}
                  {report.studentDisplayName}&apos;s report for{" "}
                  {formatDate(report.sessionDate)}
                </span>
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
