"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeading } from "@/components/ui/page-heading";
import { Card } from "@/components/ui/surface";
import { StatePanel } from "@/components/ui/state-panel";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type { TrainerDashboardDto, TrainerRecentReportDto } from "@/lib/frontend/contracts/physical-test";

/**
 * Screen `01` — Trainer Dashboard. Phase `P2-19`.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARTEFACTS OPENED (`CLAUDE.md` §7.4.1 — every claim names one)
 * ═══════════════════════════════════════════════════════════════════════════
 *   · `reference/Trainer - Dashboard/….png`   — geometry
 *   · `reference/Trainer - Dashboard/….html`  — measured values
 *   · `UI_REFERENCE_FINAL_MVP/01-trainer-dashboard/implementation-notes.md`
 *     — where `GC-7` lives
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ TWO OF THE SIX REGIONS ARE REFUSED
 * ═══════════════════════════════════════════════════════════════════════════
 * 1. ⛔ **`My Recent Report`'s RATING CHIPS AND ITS PROSE.** `GC-7`: the pack's
 *    own `screen.md` §8 declares this screen **"Not rating-bearing"** —
 *    *"DO NOT BUILD the rating column."* ⚠️ **The prose falls with the chips**:
 *    *"Mastered eye contact, clear projection"* is a rating attributed in
 *    words (`A-052`), leaking the same fact in a form a chip-shaped check
 *    would miss. ▶ And independently, one chip for a whole report is a
 *    **roll-up** — `G-2`, on every surface, **regardless of audience**.
 * 2. ⛔ **`13:30 Staff Meeting · Staff Room`.** There is no staff-meeting
 *    entity; `A-016` makes calendars projections of class sessions. Building
 *    it needs a second event entity, the shape `GC-13` barred on `25`.
 *
 * ⚠️ **`Start Class` is NOT refused** — it goes to the session roster, which
 * exists. The frame's `March 2035` is an artefact; the calendar shows real
 * months.
 *
 * MEASURED (`.html`): KPI `padding 17px`, `radius 16px`, `1px #EDEFF4`, label
 * `11.50px/500`, value `22px/700` · the now-row navy `#1B2A4A`, title white
 * `12.50px/600`, sub `#FCE7F0 10.50px/500` · `Start Class` `radius 11px`,
 * `#FCE7F0`, text `13px/600` · other rows `#F5F6FA`, `radius 12px`.
 */

export function TrainerDashboardScreen() {
  const port = usePhysicalTestPort();
  const [state, setState] = useState<ResourceState<TrainerDashboardDto>>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    void port.readTrainerDashboard().then((result) => {
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
  }, [port]);

  const data = state.kind === "ready" ? state.data : null;

  return (
    <div className="page-grid">
      <div>
        {/*
          ⚠️ THE GREETING OMITS THE NAME WHEN IT IS NOT KNOWN, rather than
          rendering "Good morning, " with nothing after it (hero `0B`).
        */}
        <PageHeading title={data?.displayName != null ? `Good morning, ${data.displayName}` : "Good morning"} />
      </div>

      {state.kind === "failed" ? (
        <StatePanel result={state.result} homeHref="/trainer/schedule" homeLabel="Go to Schedule" />
      ) : null}
      {state.kind === "loading" ? <LoadingSkeleton rows={3} label="Loading your dashboard" /> : null}

      {data !== null && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Kpi label="My Classes" value={String(data.classCount)} />
            <Kpi label="Total Students" value={String(data.studentCount)} />
            <Kpi label="Pending Reviews" value={String(data.pendingReviews)} />
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
            <div className="flex flex-col gap-5">
              <Card className="p-5">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-[16px] font-semibold text-ink-strong">My Classes</h2>
                  <Link href="/trainer/my-classes" className="text-[12.5px] font-semibold text-brand-700 underline">
                    View all
                  </Link>
                </div>
                {data.classes.length === 0 ? (
                  <p className="mt-3 text-[12.5px] text-ink">No classes are scheduled in this term.</p>
                ) : (
                  <ul className="mt-3 flex flex-col">
                    {data.classes.map((c) => (
                      <li key={c.classModuleId} className="border-t border-line py-3 first:border-t-0">
                        <p className="text-[13px] font-semibold text-ink-strong">{c.displayLabel}</p>
                        <p className="text-[11.5px] text-ink">
                          {[`${c.studentCount} ${c.studentCount === 1 ? "student" : "students"}`, c.scheduleSummary]
                            .filter((v) => v !== null && v !== "")
                            .join(" · ")}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              {/*
                ⛔ NO RATING CHIP AND NO RATING PROSE ON ANY ROW (`GC-7`, and
                `G-2` independently). Learner, class, when — and a link.
              */}
              <Card className="p-5">
                <div className="flex items-baseline justify-between">
                  <h2 className="text-[16px] font-semibold text-ink-strong">My Recent Reports</h2>
                  <Link href="/trainer/reports" className="text-[12.5px] font-semibold text-brand-700 underline">
                    View all
                  </Link>
                </div>
                {data.recent.length === 0 ? (
                  <p className="mt-3 text-[12.5px] text-ink">You have not started any reports yet.</p>
                ) : (
                  <ul className="mt-3 flex flex-col">
                    {data.recent.map((r) => (
                      <li key={r.reportId} className="border-t border-line py-3 first:border-t-0">
                        <p className="text-[13px] font-semibold text-ink-strong">{r.studentName}</p>
                        <p className="text-[11.5px] text-ink">
                          {r.classLabel} · {r.sessionDate} · {stateLabel(r)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 text-[11.5px] leading-5 text-ink">
                  This design shows a performance level beside each learner. Assessment ratings are
                  shown on a report, not on a summary list.
                </p>
              </Card>
            </div>

            <div className="flex flex-col gap-5">
              <Card className="p-5">
                <h2 className="text-[16px] font-semibold text-ink-strong">{data.monthLabel}</h2>
                <MonthGrid dates={data.monthSessionDates} monthLabel={data.monthLabel} />
              </Card>

              <Card className="p-5">
                <h2 className="text-[16px] font-semibold text-ink-strong">Today&rsquo;s Schedule</h2>
                {data.today.length === 0 ? (
                  <p className="mt-3 text-[12.5px] text-ink">You have no sessions scheduled today.</p>
                ) : (
                  <ul className="mt-3 flex flex-col gap-2">
                    {data.today.map((s) =>
                      s.isNow ? (
                        <li
                          key={s.classSessionId}
                          className="flex items-center justify-between gap-3 rounded-[12px] bg-[#1B2A4A] px-3 py-2.5"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-[12.5px] font-semibold text-white">{s.classLabel}</p>
                            <p className="text-[10.5px] font-medium text-[#FCE7F0]">
                              {[s.room, "Now"].filter((v) => v !== null && v !== "").join(" · ")}
                            </p>
                          </div>
                          <Link
                            href={`/trainer/sessions/${s.classSessionId}/roster`}
                            className="inline-flex min-h-11 shrink-0 items-center rounded-[11px] bg-[#FCE7F0] px-3 text-[13px] font-semibold text-[#1B2A4A] no-underline"
                          >
                            Start Class
                          </Link>
                        </li>
                      ) : (
                        <li
                          key={s.classSessionId}
                          className="flex items-baseline gap-3 rounded-[12px] bg-[#F5F6FA] px-3 py-2.5"
                        >
                          <span className="text-[12.5px] font-semibold text-ink-strong">
                            {s.startsAt === null ? "—" : s.startsAt.slice(0, 5)}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[12.5px] font-semibold text-ink-strong">
                              {s.classLabel}
                            </span>
                            {s.room !== null && <span className="text-[10.5px] text-ink">{s.room}</span>}
                          </span>
                        </li>
                      ),
                    )}
                  </ul>
                )}
                {/*
                  ⛔ THE STAFF-MEETING ROW, DISCLOSED ON THE PAGE (§12.12).
                */}
                <p className="mt-3 text-[11.5px] leading-5 text-ink">
                  This design also lists a staff meeting. Only teaching sessions are recorded in this
                  system.
                </p>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * ⛔ A LIFECYCLE STATUS IN PLAIN WORDS — never a rating.
 *
 * ⚠️ The vocabulary is deliberately about the REPORT, not the learner:
 * "Awaiting your review" describes where the work sits. A label describing the
 * child would be the thing `GC-7` refuses, in different clothes.
 */
function stateLabel(r: TrainerRecentReportDto): string {
  switch (r.reportState) {
    case "draft_ready":
      return "Awaiting your review";
    case "needs_edit":
      return "Returned for correction";
    case "trainer_approved":
      return "With management";
    case "submitted":
      return "Submitted";
    default:
      return "In progress";
  }
}

function Kpi({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <Card className="rounded-[16px] p-[17px]">
      <p className="text-[11.5px] font-medium text-ink">{label}</p>
      <p className="mt-1 text-[22px] font-bold text-ink-strong">{value}</p>
    </Card>
  );
}

/**
 * The frame's month grid. ⛔ A PROJECTION OF CLASS SESSIONS (`A-016`) — it
 * stores nothing and duplicates no event record.
 */
function MonthGrid({ dates, monthLabel }: { readonly dates: readonly string[]; readonly monthLabel: string }) {
  if (dates.length === 0) {
    return (
      <p className="mt-3 text-[12.5px] text-ink">No sessions are scheduled in {monthLabel}.</p>
    );
  }
  const first = `${dates[0].slice(0, 7)}-01`;
  const start = new Date(`${first}T00:00:00Z`);
  const daysInMonth = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0)).getUTCDate();
  const lead = start.getUTCDay();
  const marked = new Set(dates.map((d) => Number(d.slice(8, 10))));

  return (
    <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px]">
      {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
        <span key={`${d}${i}`} className="py-1 text-ink-muted">
          {d}
        </span>
      ))}
      {Array.from({ length: lead }, (_, i) => (
        <span key={`lead${i}`} aria-hidden="true" />
      ))}
      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
        <span
          key={day}
          className={
            marked.has(day)
              ? "rounded-full bg-brand-100 py-1 font-semibold text-brand-700"
              : "py-1 text-ink"
          }
        >
          {day}
        </span>
      ))}
    </div>
  );
}
