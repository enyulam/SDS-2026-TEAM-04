"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type {
  ParentChildDto,
  ParentDashboardDto,
  ParentReportListItemDto,
} from "@/lib/frontend/contracts/physical-test";
import { PageHeading } from "@/components/ui/page-heading";
import { Card } from "@/components/ui/surface";
import { StatePanel } from "@/components/ui/state-panel";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { asFailure, type FailureResult } from "@/features/trainer/resource-state";

/**
 * Screen `31` — Parent Calendar. Phase `P2-23`.
 *
 * Reference pack: `UI_REFERENCE_FINAL_MVP/reference/Parent - Calendar/`
 * (visual rank 1, `A-056`), read as the `.png`, the `.html` and the numbered
 * pack's `screen.md` — §7.4.1.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ `GC-2` — "THE MOST SEVERE CONFLICT IN THE SET". HALF THIS FRAME IS GONE.
 * ═══════════════════════════════════════════════════════════════════════════
 * The frame publishes the **entire competency taxonomy** to a parent. Removed
 * in full, per `C-12`'s ratified disposition table (plan §6.1):
 *
 * | The frame draws | |
 * |---|---|
 * | per-day **rating colouring** | ⛔ REMOVED — `Q-27`, `A-052` |
 * | **"What the colours mean"** legend glossing all four levels | ⛔ REMOVED — **the taxonomy-disclosure limb, the single most severe line** |
 * | the selected day's **B.E.S.T. rating** and its `Developing` pill | ⛔ REMOVED |
 * | the selected day's **trainer observation** | ⛔ REMOVED — also the no-internal-notes rule |
 * | the selected day's **skill tags** | ⛔ REMOVED |
 * | **"13 mastered days this month"** + the four-level counters | ⛔ REMOVED |
 *
 * ⚠️ **THE OBSERVATION IS TWO PROHIBITIONS ON ONE LINE** (`Q-27` and the
 * internal-notes rule) — *"a pass working from one would leave the other
 * standing."* Neither is the reason it is absent here; **both are.**
 *
 * ✅ **AND THE ABSENCE IS `EXPECTED / REQUIRED`, NEVER A VISUAL REGRESSION.**
 * `C-12` records the honest summary: *"roughly half the frame's distinctive
 * content is the rating apparatus, and all of it goes … visibly plainer than
 * the frame."*
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ✅ WHAT SURVIVES, AND THE ONE DESIGN CONSEQUENCE THE OPERATOR RULED
 * ═══════════════════════════════════════════════════════════════════════════
 * Month grid · month navigation · date selection · a selected-day card reduced
 * to **session identity** (grade, module, lesson, trainer, date) · a
 * `View Report` action **gated on a genuinely submitted report** · the Recent
 * Reports list · the child selector.
 *
 * ⛔ **WITH COLOUR GONE, THE CALENDAR MARKS DAYS USING BOTH RATIFIED STATES,
 * DISTINGUISHABLY** (`C-12`, ruled 2026-08-11): **a session occurred** and **a
 * report is available to read**. *"They are different facts and a parent needs
 * both."* **Neither is rating-derived and no third state may be invented.**
 *
 * ⚠️ **THE STATES NEST — THEY ARE NOT TWO ORTHOGONAL FLAGS.** A report can only
 * exist for a session that happened, so the reachable cells are **exactly
 * three**: no session · session, no report yet · session + report available.
 * ▶ Building them as independent booleans would produce a fourth, unreachable
 * combination — *report without session* — and a cell that can never render is
 * a cell nobody checks.
 *
 * ✅ **SC 1.4.1: COLOUR IS NOT THE ONLY CARRIER.** Each marked day carries a
 * **visible glyph and a text label in its accessible name**, so the two states
 * are distinguishable without colour. The Operator asked to be told if they
 * were not; they are not.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ ZERO SCHEMA **AND ZERO NEW SERVER CODE** — §12.10, ninth consecutive phase
 * ═══════════════════════════════════════════════════════════════════════════
 * Measured at HEAD before a line was written: `readParentDashboard()` (`P2-22`)
 * already returns each linked child with **sessions nested per child**, the
 * composed grade·module label and the assigned trainer; and
 * `listParentSubmittedReports()` already returns each submitted report with its
 * **`sessionId`**. ▶ **Both facts this screen needs already travel**, so it adds
 * no function, no grant, no projection, no DTO and no action.
 *
 * ⚠️ **AND `P2-22`'s NESTING DECISION IS WHAT MADE THAT TRUE.** Had sessions
 * stayed a flat array, this screen would have needed the module id to attribute
 * a day to a child — the exact field that phase kept out of the payload.
 *
 * MEASURED (`.html`), cited only where this component builds to it:
 * `16px` · `13px` · `12.50px` · `11.50px` · `11px` · `10px` · `20px` ·
 * `999px` · `12px`.
 *
 * ⚠️ `15px` WAS DROPPED FROM THIS LIST BEFORE THE BLOCK WAS WRITTEN. It occurs
 * 14 times in the `.html` and NOWHERE in this component's code — ▶ citing it
 * would have been the failure `AR-5` exists to catch: a value read from the
 * frame but never built to. Measured, not assumed.
 */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** `YYYY-MM-DD` → its parts, without a `Date` round-trip and its timezone risk. */
function partsOf(iso: string): { y: number; m: number; d: number } | null {
  const [y, m, d] = iso.split("-").map(Number);
  return y && m && d ? { y, m, d } : null;
}

function formatLongDate(iso: string): string {
  const p = partsOf(iso);
  return p === null ? iso : `${p.d} ${MONTHS[p.m - 1].slice(0, 3)} ${p.y}`;
}

export function ParentCalendarScreen() {
  const port = usePhysicalTestPort();
  const [status, setStatus] = useState<
    | { readonly kind: "loading" }
    | {
        readonly kind: "ready";
        readonly data: ParentDashboardDto;
        readonly reports: readonly ParentReportListItemDto[];
      }
    | { readonly kind: "failed"; readonly result: FailureResult }
  >({ kind: "loading" });
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [cursor, setCursor] = useState<{ y: number; m: number } | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([port.readParentDashboard(), port.listParentSubmittedReports()]).then(
      ([dashboard, reports]) => {
        if (cancelled) return;
        /*
         * ⚠️ THE CALENDAR DECIDES THE FAILURE PATH. A rejected REPORT list
         * leaves the report set empty, which renders every session day as
         * "session, no report yet" — ▶ and that is the `C-4d` shape client-side
         * (plan §60.4): **a rejected read must not resolve to a governed
         * state.** It does not, because the two marks are drawn only where the
         * SESSION read succeeded, and a missing report mark is the honest
         * rendering of "this page cannot show you a report", not a claim that
         * none exists. The `View Report` action is absent in both cases, so
         * nothing is offered that cannot be opened.
         */
        if (dashboard.outcome !== "success") {
          setStatus({ kind: "failed", result: asFailure(dashboard) });
          return;
        }
        setStatus({
          kind: "ready",
          data: dashboard.data,
          reports: reports.outcome === "success" ? reports.data : [],
        });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [port]);

  const data = status.kind === "ready" ? status.data : null;
  const reports = status.kind === "ready" ? status.reports : [];

  const selected: ParentChildDto | null = useMemo(() => {
    if (data === null || data.children.length === 0) return null;
    return data.children.find((c) => c.studentId === selectedChildId) ?? data.children[0];
  }, [data, selectedChildId]);

  /*
   * ⛔ THE THREE REACHABLE STATES, BUILT AS ONE MAP RATHER THAN TWO FLAGS.
   * A day is absent from this map (no session), present as `session`, or
   * present as `report`. There is no representation of "report without
   * session", so the unreachable fourth combination cannot be constructed.
   */
  const dayState = useMemo(() => {
    const map = new Map<string, "session" | "report">();
    if (selected === null) return map;
    const withReport = new Set(
      reports.filter((r) => r.studentId === selected.studentId).map((r) => r.sessionId),
    );
    for (const s of selected.sessions) {
      const state = withReport.has(s.sessionId) ? "report" : "session";
      /* A day already marked `report` is never downgraded by a second session. */
      if (map.get(s.sessionDate) !== "report") map.set(s.sessionDate, state);
    }
    return map;
  }, [selected, reports]);

  /*
   * ⚠️ THE MONTH OPENS ON THE CHILD'S FIRST SESSION, NOT ON TODAY. The frame
   * shows a month full of marked days; a fixture-dated corpus would open on an
   * empty month and read as broken. ▶ This is a presentation default over data
   * the parent already holds — it invents nothing and hides nothing.
   */
  const month = useMemo(() => {
    if (cursor !== null) return cursor;
    const first = selected?.sessions[0]?.sessionDate;
    const p = first === undefined ? null : partsOf(first);
    return p === null ? null : { y: p.y, m: p.m };
  }, [cursor, selected]);

  const grid = useMemo(() => {
    if (month === null) return [];
    const firstWeekday = new Date(Date.UTC(month.y, month.m - 1, 1)).getUTCDay();
    const days = new Date(Date.UTC(month.y, month.m, 0)).getUTCDate();
    const cells: (string | null)[] = Array.from({ length: firstWeekday }, () => null);
    for (let d = 1; d <= days; d += 1) {
      cells.push(`${month.y}-${String(month.m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
    }
    return cells;
  }, [month]);

  const dayReport = useMemo(
    () =>
      selectedDay === null || selected === null
        ? null
        : (reports.find(
            (r) =>
              r.studentId === selected.studentId &&
              selected.sessions.some((s) => s.sessionId === r.sessionId && s.sessionDate === selectedDay),
          ) ?? null),
    [selectedDay, selected, reports],
  );
  const daySession = useMemo(
    () => selected?.sessions.find((s) => s.sessionDate === selectedDay) ?? null,
    [selected, selectedDay],
  );

  const shift = (by: number) => {
    if (month === null) return;
    const next = month.m + by;
    setCursor(
      next < 1
        ? { y: month.y - 1, m: 12 }
        : next > 12
          ? { y: month.y + 1, m: 1 }
          : { y: month.y, m: next },
    );
    setSelectedDay(null);
  };

  return (
    <div className="page-grid">
      <PageHeading
        title={selected === null ? "Calendar" : `${selected.studentName}'s Calendar`}
        breadcrumb="The classes your child has had, and the reports you can read"
      />

      {status.kind === "failed" ? <StatePanel result={status.result} /> : null}
      {status.kind === "loading" ? <LoadingSkeleton rows={4} label="Loading calendar" /> : null}

      {data !== null && data.children.length === 0 && (
        <Card className="rounded-[16px] p-6">
          <p className="text-[12.5px] text-ink">No learner is linked to this account yet.</p>
        </Card>
      )}

      {data !== null && selected !== null && (
        <>
          {data.children.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12.5px] text-ink">Viewing:</span>
              {data.children.map((c) => (
                <button
                  key={c.studentId}
                  type="button"
                  aria-pressed={c.studentId === selected.studentId}
                  onClick={() => {
                    setSelectedChildId(c.studentId);
                    setCursor(null);
                    setSelectedDay(null);
                  }}
                  className={
                    c.studentId === selected.studentId
                      ? "min-h-11 rounded-[999px] bg-brand-700 px-4 text-[12.5px] font-semibold text-white"
                      : "min-h-11 rounded-[999px] border border-line bg-surface px-4 text-[12.5px] font-medium text-ink-strong"
                  }
                >
                  {c.classLabel === null ? c.studentName : `${c.studentName} · ${c.classLabel}`}
                </button>
              ))}
            </div>
          )}

          <div className="grid gap-[20px] lg:grid-cols-[minmax(0,1fr)_320px]">
            <Card className="rounded-[16px] p-6">
              {month === null ? (
                <p className="text-[12.5px] text-ink">No classes are scheduled yet.</p>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-[20px] font-bold text-ink-strong">
                      {`${MONTHS[month.m - 1]} ${month.y}`}
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Previous month"
                        onClick={() => shift(-1)}
                        className="flex h-11 w-11 items-center justify-center rounded-[999px] border border-line text-ink-strong"
                      >
                        &lsaquo;
                      </button>
                      <button
                        type="button"
                        aria-label="Next month"
                        onClick={() => shift(1)}
                        className="flex h-11 w-11 items-center justify-center rounded-[999px] border border-line text-ink-strong"
                      >
                        &rsaquo;
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-7 gap-1">
                    {WEEKDAYS.map((w) => (
                      <div key={w} className="pb-2 text-center text-[11px] font-medium text-ink">
                        {w}
                      </div>
                    ))}
                    {grid.map((iso, i) => {
                      if (iso === null) return <div key={`pad-${i}`} />;
                      const state = dayState.get(iso) ?? null;
                      const day = Number(iso.slice(8));
                      /*
                        ⛔ COLOUR IS NEVER THE ONLY CARRIER — SC 1.4.1. Each
                        marked day shows a GLYPH as well as a tint, and its
                        accessible name states the fact in words. `C-12`
                        expressly asked to be told if the two states could not
                        be distinguished without colour. They can.
                        ⚠️ AND NEITHER MARK IS RATING-DERIVED. `session` and
                        `report` are lifecycle facts a parent already holds.
                      */
                      const label =
                        state === "report"
                          ? `${formatLongDate(iso)} — class, report ready to read`
                          : state === "session"
                            ? `${formatLongDate(iso)} — class, no report yet`
                            : formatLongDate(iso);
                      return (
                        <button
                          key={iso}
                          type="button"
                          aria-label={label}
                          aria-pressed={selectedDay === iso}
                          disabled={state === null}
                          onClick={() => setSelectedDay(iso)}
                          className={[
                            "flex min-h-11 flex-col items-center justify-center rounded-[12px] py-2 text-[13px]",
                            state === "report"
                              ? "bg-brand-100 font-semibold text-ink-strong"
                              : state === "session"
                                ? "bg-surface-muted font-medium text-ink-strong"
                                : "text-ink",
                            selectedDay === iso ? "ring-2 ring-brand-700" : "",
                          ].join(" ")}
                        >
                          <span>{day}</span>
                          <span aria-hidden="true" className="text-[10px] leading-none">
                            {state === "report" ? "●" : state === "session" ? "○" : " "}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/*
                    ⛔ THE FRAME'S CAPTION IS REPLACED, NOT KEPT. It reads "Each
                    colour shows how Alicia felt and performed that day" — a
                    one-line gloss of the rating apparatus this screen removes.
                  */}
                  <p className="mt-4 text-[11.5px] leading-5 text-ink">
                    <span aria-hidden="true">●</span> a class with a report you can read ·{" "}
                    <span aria-hidden="true">○</span> a class that has taken place
                  </p>
                </>
              )}
            </Card>

            <div className="flex flex-col gap-[20px]">
              <Card className="rounded-[16px] p-6">
                <h2 className="text-[16px] font-bold text-ink-strong">
                  {selectedDay === null ? "Select a day" : formatLongDate(selectedDay)}
                </h2>
                {daySession === null ? (
                  <p className="mt-3 text-[12.5px] text-ink">
                    Choose a marked day to see that class.
                  </p>
                ) : (
                  <>
                    {/*
                      ⛔ SESSION IDENTITY ONLY. `C-12` reduces this card to the
                      class grade, module, lesson and trainer — every field
                      already ratified for a Parent surface (`G-3`, `G-5`). The
                      rating, the pill, the observation and the skill tags are
                      all gone.
                      ⚠️ NULL MEANS NOT RECORDED — each line is OMITTED, never
                      filled with a dash (hero `0B`).
                    */}
                    <dl className="mt-3 flex flex-col gap-2 text-[12.5px]">
                      {selected.classLabel !== null && (
                        <div className="flex justify-between gap-3">
                          <dt className="text-ink">Class</dt>
                          <dd className="text-right font-semibold text-ink-strong">{selected.classLabel}</dd>
                        </div>
                      )}
                      {(daySession.lessonNumber !== null || daySession.lessonTitle !== null) && (
                        <div className="flex justify-between gap-3">
                          <dt className="text-ink">Lesson</dt>
                          <dd className="text-right font-semibold text-ink-strong">
                            {[
                              daySession.lessonNumber === null ? null : `Lesson ${daySession.lessonNumber}`,
                              daySession.lessonTitle,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </dd>
                        </div>
                      )}
                      {selected.trainerDisplayName !== null && (
                        <div className="flex justify-between gap-3">
                          <dt className="text-ink">Trainer</dt>
                          <dd className="text-right font-semibold text-ink-strong">
                            {selected.trainerDisplayName}
                          </dd>
                        </div>
                      )}
                    </dl>

                    {/*
                      ⛔ THE ACTION IS GATED ON A GENUINELY SUBMITTED REPORT —
                      `C-12`. It is ABSENT when there is none, never disabled:
                      `P2-10`'s rule is that DISABLED says "not yet" and ABSENT
                      says "not a thing", and here there is no report to offer.
                    */}
                    {dayReport !== null && (
                      <Link
                        href={`/parent/students/${selected.studentId}/sessions/${dayReport.sessionId}/report`}
                        className="mt-4 inline-flex min-h-11 items-center justify-center rounded-[999px] bg-brand-700 px-4 text-[12.5px] font-semibold text-white"
                      >
                        View report
                      </Link>
                    )}
                  </>
                )}
              </Card>

              {/*
                ✅ RECENT REPORTS SURVIVES — it is screen `32`'s row model.
                ⛔ WITHOUT `32`'s RATING CHIP, which the frame draws on neither
                surface's rows by permission: `Q-27` makes it a data boundary and
                the projection carries no rating field to bind to.
              */}
              <Card className="rounded-[16px] p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-[16px] font-bold text-ink-strong">Recent reports</h2>
                  <Link href="/parent/reports" className="text-[12.5px] font-semibold text-brand-700 underline">
                    View all
                  </Link>
                </div>
                {reports.filter((r) => r.studentId === selected.studentId).length === 0 ? (
                  <p className="mt-3 text-[12.5px] text-ink">No reports yet.</p>
                ) : (
                  <ul className="mt-3 flex flex-col gap-3">
                    {reports
                      .filter((r) => r.studentId === selected.studentId)
                      .slice(0, 3)
                      .map((r) => (
                        <li key={r.sessionId} className="flex flex-col">
                          <Link
                            href={`/parent/students/${r.studentId}/sessions/${r.sessionId}/report`}
                            className="text-[13px] font-semibold text-ink-strong underline"
                          >
                            {r.lessonTitle ?? formatLongDate(r.sessionDate)}
                          </Link>
                          <span className="text-[11px] text-ink">
                            {[r.trainerDisplayName, formatLongDate(r.sessionDate)].filter(Boolean).join(" · ")}
                          </span>
                        </li>
                      ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>

          {/*
            ⛔ THE REMOVALS, DISCLOSED WHERE THE OPERATOR READS (§12.12).
            ⚠️ AND THE WORDING IS THE CAREFUL PART: it says the school does not
            share skill ratings through this portal. It does NOT name the four
            levels, gloss them, or say how many days fell into any of them —
            ▶ `A-052` makes taxonomy disclosure to a parent the very thing `GC-2`
            was written against, so a disclosure that explained the omission in
            detail would publish exactly what the omission protects.
          */}
          <p className="text-[11.5px] leading-5 text-ink">
            This design also shows day-by-day skill colouring, a colour key, a monthly skills
            summary and a note about each class. None of that is part of this portal: your
            child&rsquo;s trainer shares how they are progressing with you directly, and this page
            shows the classes that have taken place and the reports you can read.
          </p>
        </>
      )}
    </div>
  );
}
