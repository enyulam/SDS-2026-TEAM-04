"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import { Icon, IconTile } from "@/components/ui/icon";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { StatePanel } from "@/components/ui/state-panel";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type { ParentReportListItemDto } from "@/lib/frontend/contracts/physical-test";

/**
 * Screen 32 — Parent Reports list (FRONTEND RECONSTRUCTION F14 / operator checkpoint F-14).
 *
 * Current Final MVP visual authority is `UI_REFERENCE_FINAL_MVP/reference/Parent - Report/`
 * (Amendment 007 A-056, which supersedes the A-045 ordering). The pack-local
 * `UI_REFERENCE_FINAL_MVP/32-parent-reports/reference.png` (node `533:180`) is an optional
 * frozen duplicate, SHA-identical to it. See CLAUDE.md §7.4 and FINAL_MVP_AUTHORITY_LOCK.md
 * §2.4 for the ladder and for governed deviations. Reconstructed here as the
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
 * ⚠️ HERO PHASE 2 — the frame's row title and meta line are now built, and the rating chip is
 * NOT. Those two facts belong together: the F-14 reconstruction omitted the title, the class,
 * the lesson and the trainer because no governed field carried them, and omitted the chip
 * because governance forbids it. Phase 0A/0B/2 discharged the first reason for four of those
 * five elements — Class Grade, Class Module, lesson number/title (G-3) and the assigned
 * trainer (G-5, expressly permitted on a Parent surface because it is NOT a rating and NOT
 * derived from one). ⛔ THE CHIP'S REASON IS UNTOUCHED AND PERMANENT (Q-27, G-2), and the
 * projection carries no rating field for it to bind to. A dependency being discharged for the
 * fields beside it is never evidence the prohibited one moved.
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
   *
   * Hero Phase 2 adds the frame's Class Grade to it ("Alicia Gomez · Junior"). ⚠️ It is
   * rendered ONLY when every row for that child agrees on one grade, and omitted otherwise.
   * A learner may be enrolled in modules of different Class Grades, and the frame — drawn for
   * a single child in a single grade — does not say which one wins. Omitting an ambiguous
   * value is the same discipline as omitting a NULL one: never fabricate, never pick.
   */
  const linkedChildren = useMemo(() => {
    const seen = new Map<string, { displayName: string; grades: Set<string> }>();
    for (const row of rows) {
      const entry = seen.get(row.studentId) ?? {
        displayName: row.studentDisplayName,
        grades: new Set<string>(),
      };
      if (row.classGradeLabel) entry.grades.add(row.classGradeLabel);
      seen.set(row.studentId, entry);
    }
    return [...seen].map(([studentId, entry]) => ({
      studentId,
      displayName: entry.displayName,
      classGradeLabel: entry.grades.size === 1 ? [...entry.grades][0] : null,
    }));
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
        homeHref="/parent/dashboard"
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
          <p className="mt-0.5 max-w-2xl text-small leading-5 text-ink">
            {selectedChild
              ? `Reports you've received for ${selectedChild.displayName}.`
              : "Reports you've received for your linked learners."}
          </p>
        </div>

        {linkedChildren.length > 0 && (
          <div className="shrink-0 rounded-card border border-line bg-surface px-4 py-2.5 shadow-raised">
            {linkedChildren.length === 1 ? (
              <>
                <p className="block text-[0.59375rem] font-medium text-ink">Viewing</p>
                <p className="mt-0.5 text-[0.78125rem] font-semibold text-ink-strong">
                  {linkedChildren[0].classGradeLabel
                    ? `${linkedChildren[0].displayName} · ${linkedChildren[0].classGradeLabel}`
                    : linkedChildren[0].displayName}
                </p>
              </>
            ) : (
              <>
                <label
                  className="block text-[0.59375rem] font-medium text-ink"
                  htmlFor={childSelectId}
                >
                  Viewing
                </label>
                <select
                  id={childSelectId}
                  value={selectedStudentId}
                  onChange={(event) => setSelectedStudentId(event.target.value)}
                  className="mt-0.5 block cursor-pointer border-0 bg-transparent p-0 text-[0.78125rem] font-semibold text-ink-strong"
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
            className="text-[1.0625rem] font-bold text-ink-strong"
          >
            All Reports
          </h2>

          {visibleRows.map((report) => {
            /*
              HERO PHASE 2 — the frame's row title and meta line, over governed fields.
              The dependency this component recorded at F-14 ("the governed Parent
              projection carries none of those fields") is now DISCHARGED: Phase 0B added
              the lesson columns, Phase 0A the staff-identity read path, and Phase 2 carries
              both plus Class Grade and Class Module onto `ParentReportListItemDto`.

              ⚠️ NULL MEANS NOT RECORDED, SO THE SEGMENT IS OMITTED. Every part below is
              dropped when its field is null — never "Lesson 1", never "TBC", never a dash
              standing in for a value. The meta line is assembled from whatever survived,
              so a session with no lesson metadata renders a shorter line rather than a
              line full of placeholders.

              ⛔ STILL OMITTED, and re-verified this phase: the frame's PER-ROW RATING CHIP
              ("Mastering" / "Developing"). Q-27 makes the nine ratings a DATA boundary on
              every Parent surface and G-2 permanently excludes any roll-up rating — a
              per-row chip is the most compressed possible restatement of the grid. The
              projection carries no rating field for it to bind to, so this is refused at
              the data layer and not merely unrendered here.
            */
            const rowTitle = report.lessonTitle ?? report.studentDisplayName;

            /*
              The learner's name appears in the meta line ONLY when the title is no longer
              carrying it AND more than one child is linked. The frame is drawn for a single
              child, so it never faces this case; with two linked learners and "All linked
              learners" selected, lesson-titled rows would otherwise be indistinguishable by
              child. This adds no field and discloses nothing new — it re-places a name the
              row already showed.
            */
            const metaParts = [
              rowTitle !== report.studentDisplayName && linkedChildren.length > 1
                ? report.studentDisplayName
                : null,
              report.classGradeLabel,
              report.classModuleTitle,
              report.lessonNumber === null ? null : `Lesson ${report.lessonNumber}`,
              report.trainerDisplayName,
              // Pre-existing content, preserved rather than dropped: the session date was
              // accepted on this surface at F-14 and reconciled in Batch 3. The frame shows
              // only "Received", and removing an accepted element is outside this phase's
              // delta set — two sessions of one module can share a lesson title, so the
              // class day still distinguishes them.
              `Session ${formatDate(report.sessionDate)}`,
              `Received ${formatDateTime(report.submittedAt)}`,
            ].filter((part): part is string => part !== null && part.length > 0);

            return (
            <article
              key={`${report.sessionId}:${report.studentId}`}
              className="card flex flex-col gap-4 px-5 py-[18px] sm:flex-row sm:items-center sm:gap-4"
            >
              <IconTile tone="brand" size="large">
                <Icon name="document" size={20} />
              </IconTile>

              <div className="min-w-0 flex-1">
                <h2 className="text-[1rem] font-semibold text-ink-strong">{rowTitle}</h2>
                <p className="mt-[3px] text-[0.75rem] text-ink">{metaParts.join(" · ")}</p>
              </div>

              <Link
                href={`/parent/students/${report.studentId}/sessions/${report.sessionId}/report`}
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-field bg-brand-700 px-4 py-2.5 text-[0.78125rem] font-semibold text-white no-underline hover:bg-brand-800"
              >
                View
                <span className="sr-only">
                  {" "}
                  {report.studentDisplayName}&apos;s report for{" "}
                  {formatDate(report.sessionDate)}
                </span>
              </Link>
            </article>
            );
          })}
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
