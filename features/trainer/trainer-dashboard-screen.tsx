"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { MonthCalendar } from "@/components/ui/month-calendar";
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

/**
 * The frame's `2h ago` / `4h ago` / `Yesterday`.
 *
 * ⛔ IT DEGRADES TO AN ABSOLUTE DATE RATHER THAN INVENTING PRECISION. Past a
 * week, *"8 days ago"* tells a trainer less than the date does, and hero `0B`
 * governs the unparseable case: an unreadable timestamp renders NOTHING, never
 * a placeholder that looks like a real one.
 */
function relativeTime(iso: string, nowMs: number): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "";
  const mins = Math.floor((nowMs - then) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return iso.slice(0, 10);
}

export function TrainerDashboardScreen() {
  const port = usePhysicalTestPort();
  const [state, setState] = useState<ResourceState<TrainerDashboardDto>>({ kind: "loading" });
  /*
   * ⚠️ `now` IS SAMPLED ONCE, IN AN EFFECT, NOT DURING RENDER. A `useMemo(() =>
   * Date.now(), [])` reads the same once per mount in practice and the lint
   * caught it correctly anyway: `Date.now` during render is impure, and an
   * output that can differ between two renders of the same state is exactly
   * what makes a rendered assertion unreliable.
   * ⛔ `null` until the effect runs, and hero `0B` governs that window: the
   * timestamp element is OMITTED rather than shown as a placeholder.
   */
  const [nowMs, setNowMs] = useState<number | null>(null);
  useEffect(() => {
    /*
     * ⚠️ SAMPLED IN A TASK, NOT SYNCHRONOUSLY IN THE EFFECT. A synchronous
     * `setState` here triggers a cascading render, which the lint flags and
     * which is real: the first paint would be discarded immediately. The clock
     * is deliberately NOT part of the first paint — `null` renders no timestamp
     * (hero `0B`), and the value arrives on the next tick.
     */
    const id = setTimeout(() => setNowMs(Date.now()), 0);
    return () => clearTimeout(id);
  }, []);
  const todayIso = useMemo(() => {
    if (nowMs === null) return null;
    const d = new Date(nowMs);
    return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
  }, [nowMs]);

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
                        <div className="flex items-baseline justify-between gap-3">
                          <p className="text-[13px] font-semibold text-ink-strong">{r.studentName}</p>
                          {/*
                            ⛔ THE FRAME DRAWS A RELATIVE TIMESTAMP ON EVERY ROW
                            (`2h ago`, `4h ago`, `Yesterday`) and it was unrendered
                            while `updatedAt` was ALREADY on the DTO and already
                            returned by `report_list_trainer_reports()` — §12.10
                            again: the row already carried it.
                            ⚠️ It is a LIFECYCLE timestamp, not assessment
                            substance. The frame's rating chips and rating prose on
                            these same rows stay REFUSED (`GC-7`; `G-2`; `A-052`).
                          */}
                          {nowMs === null ? null : (
                            <span className="shrink-0 text-[11px] text-ink-muted">{relativeTime(r.updatedAt, nowMs)}</span>
                          )}
                        </div>
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
              {/*
                ⛔ ONE CONSTRUCTION, SHARED WITH THE MANAGEMENT DASHBOARD (Operator
                ruling, 2026-08-16). The month is an INPUT initialised to today and
                the sessions merely decorate it. ▶ The local `MonthGrid` this
                replaces derived its month from `dates[0]`, so an empty month
                produced no grid at all — and with the fixture aged out of its own
                calendar (plan §34) that is the NORMAL state, not an edge case.
                ⚠️ `monthLabel` is no longer rendered here: the calendar names its
                own focused month, and two month captions that can disagree is the
                defect one construction exists to remove.
              */}
              <Card className="p-5">
                {todayIso === null ? (
                  <LoadingSkeleton rows={2} label="Loading your calendar" />
                ) : (
                  <MonthCalendar
                    sessionDates={data.monthSessionDates}
                    today={todayIso}
                    label="Your sessions"
                  />
                )}
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

