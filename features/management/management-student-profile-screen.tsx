"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import { PageHeading } from "@/components/ui/page-heading";
import { BackLink } from "@/components/ui/back-link";
import { Card } from "@/components/ui/surface";
import { StatePanel } from "@/components/ui/state-panel";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type {
  ManagementStudentProfileDto,
  StudentTrendPointDto,
} from "@/lib/frontend/contracts/physical-test";

/**
 * Screen `18` — Management Student Profile. Phase `P2-9`.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARTEFACTS OPENED FOR THIS BUILD (`CLAUDE.md` §7.4.1 — every claim names one)
 * ═══════════════════════════════════════════════════════════════════════════
 *   · `reference/Management - Student Profile/….png`   — geometry and visual truth
 *   · `reference/Management - Student Profile/….html`  — every measured value below
 *   · `UI_REFERENCE_FINAL_MVP/18-management-student-profile/screen.md`
 *     and its `implementation-notes.md`                — governance and provenance
 *
 * ⛔ **THE NUMBERED PACK'S NOTES ARE WHAT DECIDE THIS SCREEN.** `GC-6` is
 * recorded there in full, with its grounds re-attributed under `C-18`, and it
 * ends: *"do not add a rating badge, bar, column, tile or chip, and do not read
 * `D-1` as permitting one here."* A build derived from the frame alone would
 * have shipped three prohibited surfaces.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ THREE THINGS THE FRAME DRAWS PROMINENTLY THAT ARE PROHIBITED
 * ═══════════════════════════════════════════════════════════════════════════
 * 1. **Skill Breakdown** — nine labelled bars, one per dimension. ⛔ `GC-6` /
 *    `C-9`: `D-1` permits management to read the nine on **report DETAIL
 *    surfaces only**, and a profile is not one. *"Ratings on a list or a
 *    statistics surface is a different disclosure shape — it invites comparison
 *    between children, which is not what I authorized."*
 * 2. **Strengths & Focus Areas** — six chips. ⛔ Operator-ruled 2026-08-15, on
 *    a measurement: the three green chips are the three highest bars and the
 *    two amber the two lowest, so **the chips are the Skill Breakdown
 *    thresholded** — the same rating data in coarser form.
 * 3. **The Reports `GRADE` column** — `Mastering` / `Developing` per row.
 *    ⛔ `G-2`, permanently. A roll-up rating is excluded on **every** surface.
 *
 * ▶ **`Q-27`'s PRECEDENT GOVERNS THE LAYOUT:** Profile Details promotes up into
 * the vacated right column, and **no blank rectangle and no invented filler
 * card** takes the place of what was removed. Their absence is
 * **`EXPECTED / REQUIRED`** at visual acceptance, never a regression.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ✅ WHAT IS PERMITTED, AND WHY EACH SURVIVED
 * ═══════════════════════════════════════════════════════════════════════════
 * · **`ATTENDANCE 96%`** — Operator-ruled PERMITTED: *"attendance is not a
 *   rating."* Computed from `attendance` rows, which management may read.
 * · **`ASSESSMENTS 24`** — Operator-ruled PERMITTED: *"a count of assessments
 *   is not an assessment."* ⚠️ It is `trend.length`, not a separate read —
 *   §12.10, and `A-017` is what makes the two identical.
 * · **`CLASSES 3`** — a count of active enrolments, same ground.
 * · **The Growth Trend** — **`D-2`**, whose entire purpose is this graph
 *   (`C-8`: screen `18` is its only framed host).
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ `D-2`'s HARD CONSTRAINT, ENFORCED HERE BECAUSE HERE IS WHERE RENDERING IS
 * ═══════════════════════════════════════════════════════════════════════════
 * > *"The trend is a line with no number, band or grade rendered anywhere, to
 * > any role."*
 *
 * ▶ **`sessionScore` reaches ONLY geometry.** It is consumed by
 * `trendGeometry()` into `x`/`y` coordinates and an SVG path, and appears in
 * **no text node, no `aria-label`, no `title`, and no tooltip.** ⛔ There is no
 * `toFixed`, no `%` suffix and no band lookup in this file, and the suite
 * asserts all of that — plus that the chart still renders, because an emptied
 * chart would satisfy every prohibition perfectly.
 *
 * ⚠️ **THE ACCESSIBLE NAME IS DELIBERATELY SHAPE-ONLY.** A screen reader is a
 * role like any other, so announcing "78 percent" would breach the same rule
 * the visual layer obeys. The chart is labelled by what it IS — a trend across
 * dated sessions — and the axis carries the DATES, which are not ratings.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️ FOUR FIELDS WITH NO COLUMN, AND ONE CONTROL WITH NO DESTINATION YET
 * ═══════════════════════════════════════════════════════════════════════════
 * `students` is `id · centre_id · full_name · is_active · created_at ·
 * updated_at · deactivated_at`, measured — so **`Date of birth`**, **`Contact`**
 * and **`Student ID 2025-113`** have nowhere to live, and **`Good standing`**
 * is not a concept anywhere in this system. All four are disclosed on the page
 * (§12.12), not dropped silently.
 *
 * ⛔ **`Generate Term Report` IS NOT BUILT** — `C-11` defers screen `28` and
 * term-report generation is out of MVP scope (§8). It has no destination and
 * gets no control.
 *
 * ⚠️ **`Edit` DIFFERS FROM SCREEN `23`'s, AND THE DIFFERENCE DECIDES IT.**
 * `22` Edit Student EXISTS in the ratified 36 and lands at `P2-14`, so this
 * control has a **known future destination** → **disabled with a stated
 * reason**, exactly as `Add Trainer` was. Screen `23`'s `Edit` had no
 * destination at all and stayed **absent**. ▶ *Disabled means "not yet";
 * absent means "not a thing".*
 *
 * ⛔ **NO TRAINER ASSISTANT LINE** in Classes Enrolled — the frame draws one,
 * `A-014`/`G-7` prohibit the persona, and the DTO carries one `trainerName`.
 *
 * MEASURED VALUES (from the `.html`): page title and learner name `22px/700` ·
 * card titles `16px/600` · KPI value `26px/700` · KPI label `10px/600` ·
 * `Reports` header row `13.50px/500` · `4 reports` `12px/400` · chips
 * `12px/600` · card radius `18px`, chip radius `999px`.
 */

/**
 * ⛔ GEOMETRY ONLY. This is the sole consumer of `sessionScore` in this file,
 * and it converts the value into coordinates before anything can render it.
 *
 * ⚠️ The band floor is `0` and the ceiling `100` — `D-2`'s own range — rather
 * than the data's min/max, so a flat run of identical scores draws a FLAT line
 * instead of being rescaled into a dramatic one. A trend that exaggerates is a
 * different claim from the one the data supports.
 */
function trendGeometry(points: readonly StudentTrendPointDto[]): {
  readonly path: string;
  readonly dots: readonly { readonly x: number; readonly y: number }[];
} {
  if (points.length === 0) return { path: "", dots: [] };
  const W = 640;
  const H = 190;
  const PAD = 10;
  const step = points.length === 1 ? 0 : (W - PAD * 2) / (points.length - 1);
  const dots = points.map((p, i) => ({
    x: PAD + step * i,
    y: H - PAD - (Math.min(100, Math.max(0, p.sessionScore)) / 100) * (H - PAD * 2),
  }));
  const path = dots.map((d, i) => `${i === 0 ? "M" : "L"}${d.x.toFixed(1)} ${d.y.toFixed(1)}`).join(" ");
  return { path, dots };
}

export function ManagementStudentProfileScreen({ studentId }: { readonly studentId: string }) {
  const port = usePhysicalTestPort();
  const [state, setState] = useState<ResourceState<ManagementStudentProfileDto>>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    void port.readManagementStudentProfile(studentId).then((result) => {
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
  }, [port, studentId]);

  const data = state.kind === "ready" ? state.data : null;

  return (
    <div className="page-grid">
      <div>
        <PageHeading
          title="Student Profile"
          actions={<BackLink href="/management/students" label="Students" />}
        />
        <p className="mt-0.5 text-[12.5px] text-ink">
          <Link href="/management/students" className="underline hover:text-brand-700">
            Students
          </Link>{" "}
          / Profile
        </p>
      </div>

      {state.kind === "failed" ? <StatePanel result={state.result} /> : null}
      {state.kind === "loading" ? <LoadingSkeleton rows={5} label="Loading student profile" /> : null}

      {data !== null && (
        <>
          <Card className="flex flex-wrap items-center gap-4 p-5">
            <Avatar displayName={data.fullName} size="large" />
            <div className="min-w-0 flex-1">
              <h2 className="text-[22px] font-bold text-ink-strong">{data.fullName}</h2>
              <p className="mt-0.5 text-[12.5px] text-ink">
                {data.classes.map((c) => `${c.gradeLabel} · ${c.title}`).join("  ·  ") || "Not enrolled"}
                {data.guardianName !== null && ` · Guardian: ${data.guardianName}`}
              </p>
            </div>
            {/*
              ✅ ENABLED 2026-08-19 — AND IT SHOULD HAVE BEEN ENABLED AT `P2-14`.

              ⚠️ THE ORIGINAL NOTE WAS CORRECT AND WENT STALE: *"disabled with a
              stated reason … `22` Edit Student EXISTS in the ratified 36 and lands
              at `P2-14`, so this control has a known destination and WILL become
              live."* ▶ `P2-14` BUILT screen `22` AND LEFT THIS LOCKED, so the
              screen and its route both existed while the only affordance that
              reaches them stayed shut. **Built and unreachable is worse than
              unbuilt** — nothing reports it, and the work looks done.

              ⛔ THE PATTERN ONLY DISCHARGES IF SOMEONE DISCHARGES IT. Disabled-
              with-a-reason is right, and it carries a debt that memory does not
              pay: it worked at `P2-18` only because the same phase built the
              destination. `PS18-EDIT` in this screen's suite now fails whenever a
              named destination's route exists and the control is still disabled.

              ⛔ `Generate Term Report` still gets no control at all — `C-11`
              defers `28`, and `23`'s `Edit` is absent for the same reason: no
              destination, so no affordance.
            */}
            <Link
              href={`/management/students/${encodeURIComponent(studentId)}/edit`}
              className="inline-flex min-h-11 items-center rounded-[10px] border border-line px-4 text-[13px] font-semibold text-ink no-underline transition hover:bg-neutral-soft"
            >
              Edit
              <span className="sr-only"> {data.fullName}</span>
            </Link>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <Kpi
              label="Attendance"
              value={
                data.attendanceTotal === 0
                  ? "—"
                  : `${Math.round((data.attendancePresent / data.attendanceTotal) * 100)}%`
              }
              tone="teal"
            />
            {/*
              ⚠️ `trend.length`, NOT A SEPARATE READ (§12.10). `A-017` makes all nine
              dimensions mandatory and the RPC drops any session without exactly
              nine, so a session is either assessed or absent from the trend — the
              count the rows already carry IS the count this tile wants.
            */}
            <Kpi label="Assessments" value={String(data.trend.length)} tone="brand" />
            <Kpi label="Classes" value={String(data.classes.length)} tone="ink" />
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <section className="flex flex-col gap-4">
              <Card className="p-5">
                <h3 className="text-[16px] font-semibold text-ink-strong">Growth Trend</h3>
                <GrowthTrend points={data.trend} />
              </Card>

              {/*
                ⛔ THE SKILL BREAKDOWN CARD IS NOT HERE, AND ITS ABSENCE IS REQUIRED.
                `GC-6` on this pack: "do not add a rating badge, bar, column, tile or
                chip". ▶ Nothing replaces it and no filler card takes its space —
                `Q-27`'s precedent, where the vacated area is simply not occupied.
              */}
            </section>

            <section className="flex flex-col gap-4">
              {/*
                ⛔ `Strengths & Focus Areas` IS NOT HERE EITHER. Operator-ruled on a
                measurement: the three green chips are the three highest bars and the
                two amber the two lowest, so the card IS the Skill Breakdown
                thresholded. ▶ Profile Details promotes up into the space (`Q-27`).
              */}
              <Card className="p-5">
                <h3 className="text-[16px] font-semibold text-ink-strong">Profile Details</h3>
                <dl className="mt-3 flex flex-col gap-2.5 text-[12.5px]">
                  <Detail label="Guardian" value={data.guardianName} />
                  <Detail label="Enrolled" value={formatMonth(data.enrolledOn)} />
                  <Detail label="Status" value={data.isActive ? "Active" : "Withdrawn"} />
                </dl>
                {/*
                  ⛔ FOUR DRAWN FIELDS DISCLOSED, NOT DROPPED (§12.12). `students`
                  carries no date of birth, no contact number and no student code —
                  measured — and `Good standing` is not a concept anywhere.
                */}
                <p className="mt-3 border-t border-line pt-3 text-[11.5px] leading-5 text-ink">
                  Date of birth, contact number and student ID are not recorded by this system yet,
                  and the design&rsquo;s standing badge has no equivalent here.
                </p>
              </Card>

              <Card className="p-5">
                <h3 className="text-[16px] font-semibold text-ink-strong">Classes Enrolled</h3>
                {data.classes.length === 0 ? (
                  <p className="mt-2 text-[12.5px] text-ink">Not enrolled in any class module.</p>
                ) : (
                  <ul className="mt-3 flex flex-col gap-3">
                    {data.classes.map((c) => (
                      <li key={c.classModuleId} className="flex items-start gap-3">
                        <Avatar displayName={c.title} size="small" />
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-ink-strong">
                            {c.title} · {c.gradeLabel}
                          </p>
                          {/*
                            ⛔ ONE TRAINER. The frame draws a Trainer Assistant line;
                            `A-014`/`G-7` make TA a deferred persona, and the DTO has
                            no field for one. ⚠️ Each element is omitted when null
                            rather than shown empty (hero `0B`).
                          */}
                          {(c.schedule !== null || c.trainerName !== null) && (
                            <p className="text-[12px] text-ink">
                              {[c.schedule, c.trainerName].filter((v) => v !== null).join(" · ")}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </section>
          </div>

          <ReportsTable rows={data.reports} studentId={data.studentId} />
        </>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  tone,
}: {
  readonly label: string;
  readonly value: string;
  readonly tone: "teal" | "brand" | "ink";
}) {
  const colour = tone === "teal" ? "text-[#2AA7A0]" : tone === "brand" ? "text-brand-700" : "text-ink-strong";
  return (
    <Card className="p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.6px] text-ink">{label}</p>
      <p className={`mt-1 text-[26px] font-bold ${colour}`}>{value}</p>
    </Card>
  );
}

function Detail({ label, value }: { readonly label: string; readonly value: string | null }) {
  // ⛔ NULL OMITS THE ROW (hero `0B`): NULL means NOT RECORDED, and an empty
  //    value would assert that the field is known to be blank.
  if (value === null) return null;
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink">{label}</dt>
      <dd className="font-semibold text-ink-strong">{value}</dd>
    </div>
  );
}

/**
 * ⛔ THE `D-2` TREND. A LINE, AND NOTHING ELSE.
 *
 * `sessionScore` enters `trendGeometry` and leaves as `x`/`y`. **It is never
 * placed in a text node, an `aria-label`, a `title` or a tooltip.** The axis
 * carries DATES, which are not ratings.
 */
function GrowthTrend({ points }: { readonly points: readonly StudentTrendPointDto[] }) {
  const { path, dots } = trendGeometry(points);
  if (points.length === 0) {
    return (
      <p className="mt-3 text-[12.5px] text-ink">
        No assessed sessions yet, so there is no trend to show.
      </p>
    );
  }
  return (
    <figure className="mt-3">
      <svg
        viewBox="0 0 640 190"
        role="img"
        aria-label={`Progress trend across ${points.length} assessed session${points.length === 1 ? "" : "s"}`}
        className="h-[190px] w-full"
      >
        <path d={path} fill="none" stroke="#EC4B96" strokeWidth="2.5" strokeLinecap="round" />
        {dots.map((d, i) => (
          <circle key={points[i].classSessionId} cx={d.x} cy={d.y} r="3.5" fill="#EC4B96" />
        ))}
      </svg>
      <figcaption className="mt-1 flex flex-wrap justify-between gap-2 text-[10px] text-ink">
        {points.map((p) => (
          <span key={p.classSessionId}>{p.sessionDate}</span>
        ))}
      </figcaption>
    </figure>
  );
}

/**
 * ⛔ NO `GRADE` COLUMN — `G-2`, permanently, and the DTO has no field for one.
 *
 * ⚠️ THE CHEVRON IS GATED ON STATUS, ROW BY ROW (`A-038`). `submitted` and
 * `trainer_approved` link to screen `19`; **every earlier status exposes no
 * report content at all** and gets no link. ▶ `CLAUDE.md` §6 names the
 * alternative explicitly as the thing not to build: *"do not implement this as
 * one generic 'view report' handler shared across all rows regardless of
 * status."*
 */
function ReportsTable({
  rows,
  studentId,
}: {
  readonly rows: readonly {
    readonly reportId: string;
    readonly sessionDate: string;
    readonly classLabel: string;
    readonly lessonTitle: string | null;
    readonly termLabel: string | null;
    readonly reportState: string;
  }[];
  readonly studentId: string;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className="text-[16px] font-semibold text-ink-strong">Reports</h3>
        <span className="text-[12px] text-ink">
          {rows.length} report{rows.length === 1 ? "" : "s"}
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="px-5 pb-6 text-[13px] text-ink">No reports have been started for this learner yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left">
            <thead>
              <tr className="border-t border-[#F3F5F9] text-[11px] font-semibold uppercase tracking-[0.4px] text-ink">
                <th className="px-5 py-2">Class</th>
                <th className="px-5 py-2">Date</th>
                <th className="px-5 py-2">Details</th>
                <th className="px-5 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const readable = r.reportState === "submitted" || r.reportState === "trainer_approved";
                const details = [r.lessonTitle, r.termLabel].filter((v) => v !== null).join(" · ");
                return (
                  <tr key={r.reportId} className="border-t border-[#F3F5F9]">
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-ink-strong">{r.classLabel}</td>
                    <td className="px-5 py-3.5 text-[12.5px] text-ink">{r.sessionDate}</td>
                    <td className="px-5 py-3.5 text-[12.5px] text-ink">{details || "—"}</td>
                    <td className="px-5 py-3.5 text-[12.5px]">
                      {readable ? (
                        <Link
                          href={`/management/students/${studentId}/reports/${r.reportId}`}
                          className="font-semibold text-brand-700 underline hover:text-brand-800"
                        >
                          View report
                        </Link>
                      ) : (
                        <span className="text-ink">Awaiting trainer</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function formatMonth(value: string | null): string | null {
  if (value === null) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-SG", { month: "short", year: "numeric", timeZone: "UTC" });
}
