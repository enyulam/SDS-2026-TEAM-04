"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeading } from "@/components/ui/page-heading";
import { BackLink } from "@/components/ui/back-link";
import { Card } from "@/components/ui/surface";
import { StatePanel } from "@/components/ui/state-panel";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type { ClassStatisticsDto, ClassOverviewRowDto } from "@/lib/frontend/contracts/physical-test";

/**
 * Screen `16` — Management Class Statistics. Phase `P2-16`. **`PARTIAL`.**
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARTEFACTS OPENED (`CLAUDE.md` §7.4.1 — every claim names one)
 * ═══════════════════════════════════════════════════════════════════════════
 *   · `reference/Management - Class Statistics/….png`   — geometry
 *   · `reference/Management - Class Statistics/….html`  — measured values
 *   · `UI_REFERENCE_FINAL_MVP/16-management-class-statistics/` — `screen.md`
 *     and `implementation-notes.md`, where `GC-6` and `GC-10` live
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ ALL THREE CARDS THE FRAME DRAWS ARE REFUSED …
 * ═══════════════════════════════════════════════════════════════════════════
 * 1. ⛔ **Skill Averages** — nine labelled percentage bars, *"Class average
 *    across rubric criteria — Term 1"*. `GC-6` on **`C-9`** and on **`G-2`**.
 * 2. ⛔ **Ongoing Performance** — a donut reading **`82% avg`** legended
 *    `Mastering 15 · Mastered 8 · Developing 6 · Beginning 3`. ▶ The four
 *    ratified rating labels as values; the average is `G-2` **and** `D-2`.
 * 3. ⛔ **Student Breakdown's `Strongest` / `Focus area` / `Overall`** — `G-2`
 *    names those limbs; a rating chip per child in a comparison table is
 *    `C-9`'s harm verbatim. `Student ID` has no column (fifth screen to draw it).
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ✅ … AND TWO PANELS THE FRAME OMITS ARE BUILT, BY RULING `C-17`
 * ═══════════════════════════════════════════════════════════════════════════
 * `GC-10` records the omission; **`C-17` rules** *"GOVERNANCE WINS. Build the
 * two panels `CLAUDE.md` mandates. Record them as governance-mandated additions
 * the frame omits, cited."* ⛔ **Neither is ever AI-authored prose** — slot 1 is
 * a database aggregate, slot 3 a fixed nine-row lookup, the table a status
 * filter. Generating this text would pull the §8-deferred Weekly Class Health
 * Brief into scope.
 *
 * ⏸ **SLOT 2 IS HELD AND SAID SO ON THE PAGE** (§12.12a), not in this comment.
 *
 * MEASURED VALUES (from the `.html`): page title `22px/700` · breadcrumb
 * `12px/400` · card titles `16px/600` · card radius `18px` · table header
 * `11.50px/500` on `#8A93A8` · row name `13px/600`.
 */

export function ManagementClassStatisticsScreen({ classModuleId }: { readonly classModuleId: string }) {
  const port = usePhysicalTestPort();
  const [state, setState] = useState<ResourceState<ClassStatisticsDto>>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    void port.readClassStatistics(classModuleId).then((result) => {
      if (cancelled) return;
      setState(
        result.outcome === "success"
          ? { kind: "ready" as const, data: result.data }
          : { kind: "failed" as const, result: asFailure(result) },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [port, classModuleId]);

  const data = state.kind === "ready" ? state.data : null;
  const overviewHref = `/management/classes/${classModuleId}`;

  return (
    <div className="page-grid">
      <div>
        <PageHeading
          breadcrumb={
            <>
              <Link href="/management/classes" className="underline hover:text-brand-700">
                Classes
              </Link>
              {data !== null && ` / ${data.classLabel} / Statistics`}
            </>
          }
          title="Class Statistics"
          actions={<BackLink href={overviewHref} label="Class Overview" />}
        />
      </div>

      {state.kind === "failed" ? (
        <StatePanel result={state.result} homeHref={overviewHref} homeLabel="Return to Class Overview" />
      ) : null}
      {state.kind === "loading" ? <LoadingSkeleton rows={3} label="Loading class statistics" /> : null}

      {data !== null && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Kpi label="Students" value={String(data.enrolledCount)} />
            <Kpi label="Assessed" value={`${data.assessedCount} / ${data.enrolledCount}`} />
            <Kpi label="Reports submitted" value={`${data.submittedCount} / ${data.assessedCount}`} />
          </div>

          {/*
            ✅ MANAGEMENT INSIGHT — a governance-mandated addition the frame
            OMITS (`GC-10`, ruled by `C-17`). ⛔ Fixed sentences, no model.
          */}
          <Card className="p-5">
            <h2 className="text-[16px] font-semibold text-ink-strong">Management Insight</h2>
            <p className="mt-0.5 text-[11.5px] text-ink">
              Required by governance; not drawn in this screen&rsquo;s design.
            </p>
            <div className="mt-3 flex flex-col gap-2 text-[13px] leading-6 text-ink-strong">
              {/*
                ⛔ NULL OMITS THE SENTENCE (hero `0B`). With no submitted report
                carrying an improvement-focus tag there is no main follow-up
                area — and asserting one would be a fabricated finding.
              */}
              {data.mainFollowUpDimension === null ? (
                <p className="text-ink">
                  No submitted report yet carries an improvement-focus tag, so there is no main
                  follow-up area for this class.
                </p>
              ) : (
                <p>{data.mainFollowUpDimension} remains the main follow-up area.</p>
              )}

              {/*
                ⏸ SLOT 2 — HELD, AND DISCLOSED WHERE THE OPERATOR READS.
                ⛔ NOT an empty sentence and NOT a silent two-sentence panel
                pretending to be the mandated three.
              */}
              <p className="rounded-[10px] bg-[#FFF6E5] px-3 py-2 text-[12.5px] leading-5 text-ink-strong">
                <strong>One sentence of this panel is not built.</strong> The most-improved-dimension
                trend is computed from average rating change across the class, and whether that
                survives the standing exclusion on roll-ups is an open decision. It is left out
                rather than approximated.
              </p>

              {data.recommendedAction !== null && (
                <p>Recommended next action: {data.recommendedAction}</p>
              )}
            </div>
          </Card>

          {/*
            ✅ STUDENTS NEEDING FOLLOW-UP — the second mandated addition.
            ⛔ Selected by REPORT STATUS, never by rating.
          */}
          <Card className="p-5">
            <h2 className="text-[16px] font-semibold text-ink-strong">Students Needing Follow-up</h2>
            <p className="mt-0.5 text-[11.5px] text-ink">
              Reports started but not yet submitted. Required by governance; not drawn in this
              screen&rsquo;s design.
            </p>
            {data.followUpRows.length === 0 ? (
              <p className="mt-3 text-[12.5px] text-ink">
                Every started report in this class has been submitted.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse">
                  <thead>
                    <tr className="text-left text-[11.5px] font-medium text-ink-muted">
                      <th className="pb-2">Student</th>
                      <th className="pb-2">Session</th>
                      <th className="pb-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.followUpRows.map((row) => (
                      <tr key={`${row.classSessionId}:${row.studentId}`} className="border-t border-line">
                        <td className="py-3 text-[13px] font-semibold text-ink-strong">
                          {row.studentDisplayName}
                        </td>
                        <td className="py-3 text-[12.5px] text-ink">{row.sessionDate}</td>
                        <td className="py-3">
                          <RowAction row={row} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/*
            ⛔ THE THREE REFUSED CARDS, DISCLOSED ON THE PAGE (§12.12).
            ▶ `Q-27`'s precedent: nothing fills the vacated space.
          */}
          <Card className="p-5">
            <h2 className="text-[16px] font-semibold text-ink-strong">
              This design&rsquo;s three analytics panels are not built
            </h2>
            <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-[12.5px] leading-5 text-ink">
              <li>
                <strong>Skill averages</strong> and the <strong>ongoing-performance</strong> chart —
                assessment ratings are shown on a report, never averaged across a class.
              </li>
              <li>
                <strong>Student breakdown</strong>&rsquo;s strongest, focus-area and overall columns —
                learners are not compared to one another.
              </li>
              <li>
                <strong>Student ID</strong> is not recorded anywhere in this system.
              </li>
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}

/**
 * ⛔ `A-038`'s PER-ROW GATE, CHECKED INDEPENDENTLY — the same four outcomes
 * screen `13` uses. `CLAUDE.md` §6 names this table and screen `13`'s together
 * and forbids *"one generic 'view report' handler shared across all
 * rows/screens regardless of status."*
 *
 * ⚠️ A `No Report` row can never appear here — the projection excludes it —
 * but the branch is kept so the gate is complete on its own terms rather than
 * relying on an upstream filter to stay correct.
 */
function RowAction({ row }: { readonly row: ClassOverviewRowDto }) {
  if (row.reportState === null || row.reportId === null) {
    return (
      <span className="text-[12.5px] text-ink" aria-label="No action available">
        —
      </span>
    );
  }

  if (row.reportState === "submitted") {
    return (
      <Link
        href="/management/reports?status=submitted"
        className="inline-flex min-h-11 items-center text-[12.5px] font-semibold text-brand-700 underline"
      >
        View submitted report
      </Link>
    );
  }

  if (row.reportState === "trainer_approved") {
    return (
      <Link
        href={`/management/reports/${row.reportId}/review`}
        className="inline-flex min-h-11 items-center text-[12.5px] font-semibold text-brand-700 underline"
      >
        Open final review
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled
      title="Reminders are not available yet — no notification path is in scope."
      className="inline-flex min-h-11 cursor-not-allowed items-center rounded-field border border-line px-3 py-1.5 text-[12.5px] font-semibold text-neutral-on"
    >
      Send Reminder to Trainer
    </button>
  );
}

function Kpi({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <Card className="p-5">
      <p className="text-[12px] text-ink">{label}</p>
      <p className="mt-1 text-[26px] font-bold text-ink-strong">{value}</p>
    </Card>
  );
}
