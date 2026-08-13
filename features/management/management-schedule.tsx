"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeading } from "@/components/ui/page-heading";
import { SearchInput } from "@/components/ui/field";
import { StatePanel } from "@/components/ui/state-panel";
import { asFailure, type ResourceState } from "@/features/trainer/resource-state";
import { usePhysicalTestPort } from "@/features/portal/portal-runtime-context";
import type { ManagementScheduleDto, ScheduleSessionSummaryDto } from "@/lib/frontend/contracts/physical-test";

/**
 * Screen `25` — Management Schedule (PORTAL COMPLETION PLAN phase `P2-5`).
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ARTEFACTS OPENED FOR THIS BUILD (`CLAUDE.md` §7.4.1 — every claim names one)
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *   · `reference/Management - Schedule/Management - Schedule.png`   — geometry and visual truth
 *   · `reference/Management - Schedule/Management - Schedule.html`  — every measured value below
 *   · `UI_REFERENCE_FINAL_MVP/25-management-schedule/screen.md`     — governance and provenance
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⚠️ WHAT THE `.png` DRAWS
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * A page header (`Schedule` + `All classes and sessions across the academy` + a `Search
 * schedule` field), then a two-column body: a large calendar card on the left and a
 * `Schedule Details` panel on the right. The calendar card carries `March 2035` with a
 * chevron, a `Month` pill on the right, a `Sun`–`Sat` label row, and a 6×7 grid whose
 * gridlines are the container colour showing through a `1px` gap. Out-of-month cells are
 * filled `#F5F6FA` with a muted number; in-month cells are white. Today's number sits in a
 * filled circle. Event chips stack inside a cell, each a two-line block of title + start
 * time. The details panel shows the selected date, then one card per session with a badge, a
 * title, and rows for date, time, location and trainer.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ FOUR THINGS THE FRAME DRAWS THAT ARE NOT BUILT. EVERY ONE IS RULED, NOT DRIFT
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *
 * 1. ⛔ THE `Showcase` BADGE AND ITS CHIP COLOUR. `GC-13` bars Showcase outright. The
 *    `.html` carries THREE chip treatments, not two: `#FCE7F0`/`#EC4B96`,
 *    `#B5E5E8`/`#2B8F96`, and a third, `#DCF2F3`/`#3FBAC2`, used for the 5:00 PM
 *    `Junior · Speech and Drama` chip — which is exactly the session the details panel
 *    labels `Showcase`. ▶ The colour is not decoration there; it ENCODES the barred type.
 *    `REGISTERED-OMISSION`, and it NEVER ENDS — it waits on no data and no phase.
 *    ⚠️ It is also structural: `session_type`, `event_type` and `showcase` return ZERO
 *    columns across the whole schema, measured at HEAD.
 *
 * 2. ⛔ `Assist. Sam Ong` / `Asst. Sam Ong` IN THE DETAILS CARDS. A Teaching Assistant
 *    field. `A-014` defers the TA persona and `G-7` binds `centre_membership_role` against
 *    extension. ⚠️ HERE IT IS ALSO INEXPRESSIBLE: `class_session_assignments.trainer_role`
 *    IS `centre_membership_role`, whose only values are `management` / `trainer` / `parent`,
 *    so no assistant could be persisted even if it were permitted. Two independent grounds.
 *    `REGISTERED-OMISSION`, NEVER ENDS.
 *
 * 3. ⛔ THE `Main:` PREFIX ON THE TRAINER ROW. A CONSEQUENCE of (2), recorded rather than
 *    quietly dropped. The word exists in the frame only to contrast with `Assist.`; with no
 *    assistant possible, `Main:` is a distinction with nothing on its other side, and
 *    keeping it would imply a second slot the product does not have. The trainer's name is
 *    rendered plain, behind the same person icon the frame draws.
 *
 * 4. ⛔ THE FRAME'S `Junior` GRADE. The ratified Class Grade vocabulary is `Beginner` /
 *    `Intermediate` / `Advanced` (`A-016`; `A-026`/`A-054`), fixed by three deterministic
 *    seed rows, and `A-054` prohibits global keyword replacement over it. ⚠️ Every label is
 *    READ from `class_grades.display_name`, never written as a literal here, so a fourth
 *    value cannot appear even by editing this file.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ ONE ELEMENT OMITTED FOR ABSENCE OF DATA, WHICH IS A DIFFERENT THING ENTIRELY
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * The frame's `Studio 2` / `Studio 4` location row. `class_sessions.room` EXISTS — measured
 * at HEAD, `text`, nullable — and is NULL on all 17 sessions in the governed fixture. Hero
 * 0B: NULL means NOT RECORDED, so the ELEMENT IS OMITTED. ⛔ Never `—`, never `TBD`, never
 * an invented default: a placeholder would assert that a room question was asked and
 * answered. ▶ This is NOT a `REGISTERED-OMISSION` — nothing is refused. The capability is
 * live and the row appears the moment any session carries a room. `26` and `27` already
 * write the column.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⚠️ TWO JUDGEMENT CALLS, STATED SO THEY CAN BE OVERTURNED RATHER THAN DISCOVERED
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *
 * A. THE MONTH CONTROL'S CONTENTS. The frame draws a chevron beside `March 2035` and
 *    enumerates no options — the same shape as screen `12`'s `···`, whose ruling was
 *    *"build the affordance, and if its contents are undefined by the frame, it opens to
 *    nothing rather than to invented items."* ▶ A calendar with no way to change month is
 *    not usable, and unlike the `···` the FUNCTION here is unambiguous. So it is built, and
 *    its contents are MEASURED rather than invented: every entry is a month this centre
 *    demonstrably has sessions in, plus the current month. ⛔ No guessed range, no arbitrary
 *    ±12 window.
 *
 * B. CHIP COLOUR. With Showcase removed (1), the `.html`'s remaining two treatments differ
 *    between two different Class Modules — `Public Speaking` pink, `Speech and Drama` teal —
 *    while the barred third was a lighter SHADE of its module's hue. The readable rule is
 *    therefore *hue = module, shade = type*; dropping the type drops the shade and leaves
 *    hue-per-module standing. Assignment is deterministic by module id, so a module keeps
 *    its colour across renders. ⚠️ COLOUR CARRIES NO MEANING HERE and the palette CYCLES —
 *    two modules may share a hue, which is honest, and is stated because a reader who
 *    believed colour encoded a session type would be reading back exactly the concept
 *    `GC-13` removed.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ THIS SCREEN IS A PROJECTION. `A-016`: calendars project class-session records and their
 * assignments, and *"management and trainer calendars must not store separate duplicated
 * event records."* No event table, no cache, no denormalized copy — the server module says
 * the same thing at the other end.
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⛔ NOTHING HERE IS AN ASSESSMENT FACT. No rating, roll-up, average, observation, attendance
 * value, evidence reference, trainer note or report status — `C-9` and `G-2`, and the DTO
 * carries no field one could arrive in.
 *
 * ⚠️ EVERY GEOMETRIC VALUE IS CITED FROM `Management - Schedule.html` and is verified by
 * `prove:artefact-read`, which fails if a cited value is absent from that file or unused here.
 */

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

/**
 * The two chip treatments measured in the `.html`, MINUS the Showcase third.
 * See judgement call B above — hue distinguishes modules and means nothing else.
 */
const CHIP_PALETTES = [
  { surface: "bg-[#FCE7F0]", ink: "text-[#EC4B96]" },
  { surface: "bg-[#B5E5E8]", ink: "text-[#2B8F96]" },
] as const;

/** `YYYY-MM-DD` in LOCAL time — never `toISOString`, which shifts the day across UTC. */
function isoDate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function monthKey(date: Date): string {
  return isoDate(date).slice(0, 7);
}

/** The Sun–Sat cells covering a whole month, including its leading and trailing spill. */
function monthGrid(month: string): { date: Date; inMonth: boolean }[] {
  const [year, monthNumber] = month.split("-").map(Number);
  const first = new Date(year, monthNumber - 1, 1);
  const start = new Date(year, monthNumber - 1, 1 - first.getDay());
  const cells: { date: Date; inMonth: boolean }[] = [];
  for (let index = 0; index < 42; index += 1) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    cells.push({ date, inMonth: date.getMonth() === monthNumber - 1 });
  }
  /*
   * ⚠️ TRAILING EMPTY WEEKS ARE DROPPED, and the frame is why: `March 2035`
   * renders FIVE rows, not six. A fixed 6×7 would add a blank week to most
   * months and change the card's height between months for no reason.
   */
  while (cells.length > 35 && cells.slice(-7).every((cell) => !cell.inMonth)) cells.splice(-7);
  return cells;
}

/** `14:30:00` -> `2:30 PM`. Returns `null` for a value that is not recorded. */
function clockLabel(value: string | null): string | null {
  if (!value) return null;
  const [rawHour, rawMinute] = value.split(":");
  const hour = Number(rawHour);
  if (!Number.isFinite(hour)) return null;
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${rawMinute ?? "00"} ${suffix}`;
}

function longDate(date: Date): string {
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export function ManagementSchedule({ initialMonth }: { readonly initialMonth?: string }) {
  const port = usePhysicalTestPort();
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(() => initialMonth ?? monthKey(today));
  const [state, setState] = useState<ResourceState<ManagementScheduleDto>>({ kind: "loading" });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [monthMenuOpen, setMonthMenuOpen] = useState(false);

  const cells = useMemo(() => monthGrid(month), [month]);
  const windowStart = cells.length > 0 ? isoDate(cells[0].date) : `${month}-01`;
  const windowEnd = cells.length > 0 ? isoDate(cells[cells.length - 1].date) : `${month}-28`;

  useEffect(() => {
    let cancelled = false;
    /*
     * ⚠️ NO SYNCHRONOUS `setState` HERE. Resetting to `loading` on entry looks
     * right and is a cascading render; the month change already re-runs this
     * effect, and the previous month's grid staying up for one fetch is the
     * same behaviour every other screen in this product has.
     */
    /*
     * ⛔ THE WHOLE VISIBLE WINDOW IS FETCHED, not just the month. The grid
     * draws spill days from the neighbouring months and they carry real
     * sessions; fetching `month-01`..`month-31` would render those cells
     * EMPTY while sessions sit in them — a calendar that silently lies about
     * a date it is showing.
     */
    void port.readManagementSchedule(windowStart, windowEnd).then((result) => {
      if (cancelled) return;
      setState(result.outcome === "success"
          ? { kind: "ready" as const, data: result.data }
          : { kind: "failed" as const, result: asFailure(result) });
    });
    return () => {
      cancelled = true;
    };
  }, [port, windowStart, windowEnd]);

  const data = state.kind === "ready" ? state.data : null;

  const visible = useMemo(() => {
    if (!data) return [] as readonly ScheduleSessionSummaryDto[];
    const needle = query.trim().toLowerCase();
    if (needle === "") return data.sessions;
    /*
     * ⚠️ A FILTER OVER WHAT IS ALREADY LOADED, never a second query. The
     * frame draws `Search schedule` inside the calendar view, and a search
     * that re-queried could return rows outside the month being shown.
     */
    return data.sessions.filter((session) =>
      `${session.classGradeLabel ?? ""} ${session.moduleTitle} ${session.trainerDisplayNames.join(" ")}`
        .toLowerCase()
        .includes(needle),
    );
  }, [data, query]);

  const byDate = useMemo(() => {
    const map = new Map<string, ScheduleSessionSummaryDto[]>();
    for (const session of visible) {
      const list = map.get(session.sessionDate) ?? [];
      list.push(session);
      map.set(session.sessionDate, list);
    }
    return map;
  }, [visible]);

  /** Stable per-module colour. See judgement call B — it means nothing else. */
  const paletteFor = useMemo(() => {
    const order = [...new Set((data?.sessions ?? []).map((session) => session.classModuleId))].sort();
    return (classModuleId: string) =>
      CHIP_PALETTES[Math.max(0, order.indexOf(classModuleId)) % CHIP_PALETTES.length];
  }, [data]);

  const monthOptions = useMemo(() => {
    const months = new Set(data?.monthsWithSessions ?? []);
    months.add(monthKey(today));
    months.add(month);
    return [...months].sort();
  }, [data, month, today]);

  const selected = selectedDate ? byDate.get(selectedDate) ?? [] : [];
  const selectedAsDate = selectedDate ? new Date(`${selectedDate}T00:00:00`) : null;
  const todayIso = isoDate(today);

  return (
    <div className="flex flex-col gap-6">
      <PageHeading
        breadcrumb={<span>Management / Schedule</span>}
        title="Schedule"
        description="All classes and sessions across the academy"
        actions={
          <SearchInput
            className="w-full max-w-[280px]"
            aria-label="Search schedule"
            placeholder="Search schedule"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        }
      />

      {state.kind === "loading" ? <LoadingSkeleton rows={8} label="Loading the schedule" /> : null}
      {/* ⛔ NEVER "no classes scheduled" — a rejected read is not an empty academy (`Q-7`). */}
      {state.kind === "failed" ? (
        <StatePanel
          result={state.result}
          title="The schedule could not be loaded"
          homeHref="/management/dashboard"
          homeLabel="Return to Management workspace"
        />
      ) : null}

      {data ? (
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
          {/* The calendar card. `.html`: radius 18px, 1px #EDEFF4 outline, 16px internal gap. */}
          <section className="flex min-w-0 flex-1 flex-col gap-4 rounded-[18px] bg-surface p-[18px] outline outline-1 -outline-offset-1 outline-line">
            <div className="flex items-center justify-between gap-3">
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-[10px] px-1 py-1 text-[17px] font-bold text-ink transition hover:bg-surface-muted"
                  aria-expanded={monthMenuOpen}
                  aria-haspopup="listbox"
                  onClick={() => setMonthMenuOpen((open) => !open)}
                >
                  {MONTH_NAMES[Number(month.slice(5, 7)) - 1]} {month.slice(0, 4)}
                  <Icon name="chevronDown" size={18} />
                </button>
                {monthMenuOpen ? (
                  <ul
                    className="absolute left-0 top-full z-10 mt-1 max-h-64 min-w-[190px] overflow-auto rounded-[12px] bg-surface p-1 shadow-lg outline outline-1 -outline-offset-1 outline-line"
                    role="listbox"
                    aria-label="Select a month"
                  >
                    {monthOptions.map((option) => (
                      <li key={option}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={option === month}
                          className={`w-full rounded-[8px] px-3 py-2 text-left text-[12px] font-semibold transition hover:bg-surface-muted ${
                            option === month ? "text-brand-700" : "text-ink"
                          }`}
                          onClick={() => {
                            setMonth(option);
                            setSelectedDate(null);
                            setMonthMenuOpen(false);
                          }}
                        >
                          {MONTH_NAMES[Number(option.slice(5, 7)) - 1]} {option.slice(0, 4)}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              {/*
               * ⚠️ THE FRAME DRAWS EXACTLY ONE VIEW PILL — `Month`. No Week and no Day view
               * is built: a second pill would be a control the frame does not draw and a
               * view nothing specifies. It is rendered as static text, not a button,
               * because a control that switches to nothing is worse than a label.
               */}
              <div className="rounded-[10px] bg-surface p-[3px]">
                <span className="block rounded-[8px] px-[14px] py-[7px] text-[12px] font-semibold text-ink">
                  Month
                </span>
              </div>
            </div>

            {/* `.html`: the weekday row is a 7-track flex with a 1px gap and 8px left padding. */}
            <div className="flex gap-px">
              {WEEKDAY_LABELS.map((label) => (
                <div key={label} className="flex-1 pb-1 pl-2">
                  <span className="text-[11.5px] font-semibold text-ink-subtle">{label}</span>
                </div>
              ))}
            </div>

            {/*
             * `.html`: the grid's own background is `#EDEFF4` and the cells sit on it with a
             * `1px` gap, so the gridlines ARE the container showing through. Radius 12px.
             */}
            <div className="overflow-hidden rounded-[12px] bg-line">
              <div className="grid grid-cols-7 gap-px">
                {cells.map(({ date, inMonth }) => {
                  const iso = isoDate(date);
                  const sessions = byDate.get(iso) ?? [];
                  const isToday = iso === todayIso;
                  return (
                    <button
                      key={iso}
                      type="button"
                      onClick={() => setSelectedDate(iso)}
                      aria-label={`${longDate(date)}, ${sessions.length} session${sessions.length === 1 ? "" : "s"}`}
                      aria-pressed={selectedDate === iso}
                      className={`flex min-h-[92px] flex-col items-start gap-1 p-[7px] text-left transition ${
                        inMonth ? "bg-surface hover:bg-surface-muted" : "bg-canvas"
                      } ${selectedDate === iso ? "outline outline-2 -outline-offset-2 outline-brand-500" : ""}`}
                    >
                      {isToday ? (
                        <span className="flex size-6 items-center justify-center rounded-full bg-brand-600 text-[12px] font-bold text-white">
                          {date.getDate()}
                        </span>
                      ) : (
                        <span
                          className={
                            inMonth
                              ? "text-[12.5px] font-semibold text-ink"
                              : "text-[12px] font-medium text-ink-subtle"
                          }
                        >
                          {date.getDate()}
                        </span>
                      )}
                      {sessions.map((session) => {
                        const palette = paletteFor(session.classModuleId);
                        return (
                          <span
                            key={session.classSessionId}
                            className={`flex w-full flex-col gap-px rounded-[7px] py-[5px] pl-[7px] pr-[6px] ${palette.surface}`}
                          >
                            <span className={`truncate text-[10.5px] font-semibold ${palette.ink}`}>
                              {session.classGradeLabel ? `${session.classGradeLabel} · ` : ""}
                              {session.moduleTitle}
                            </span>
                            {/* Omitted entirely when the time is not recorded (hero 0B). */}
                            {clockLabel(session.startTime) ? (
                              <span className={`text-[9px] font-medium ${palette.ink}`}>
                                {clockLabel(session.startTime)}
                              </span>
                            ) : null}
                          </span>
                        );
                      })}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* `Schedule Details`. `.html`: 18px radius card, 16px gap, 15px title. */}
          <aside className="flex w-full flex-col gap-4 rounded-[18px] bg-surface p-[18px] outline outline-1 -outline-offset-1 outline-line xl:w-[330px] xl:shrink-0">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[15px] font-semibold text-ink">Schedule Details</h2>
              {selectedDate ? (
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="rounded-full p-1 text-ink-subtle transition hover:bg-surface-muted"
                  aria-label="Close schedule details"
                >
                  <Icon name="close" size={18} />
                </button>
              ) : null}
            </div>

            {selectedAsDate ? (
              <p className="text-[12.5px] font-medium text-ink-muted">
                {WEEKDAY_FULL[selectedAsDate.getDay()]}, {selectedAsDate.getDate()}{" "}
                {MONTH_NAMES[selectedAsDate.getMonth()]}
              </p>
            ) : (
              <p className="text-[12.5px] font-medium text-ink-muted">
                Select a day to see its sessions.
              </p>
            )}

            {selectedAsDate && selected.length === 0 ? (
              <p className="text-[12px] font-medium text-ink-subtle">Nothing scheduled on this day.</p>
            ) : null}

            {selected.map((session) => {
              const palette = paletteFor(session.classModuleId);
              const start = clockLabel(session.startTime);
              const end = clockLabel(session.endTime);
              return (
                <article
                  key={session.classSessionId}
                  className={`flex flex-col gap-[11px] rounded-[16px] px-4 py-[15px] ${palette.surface}`}
                >
                  {/*
                   * ⚠️ ONE BADGE, AND IT READS `Class`. The frame's second badge is
                   * `Showcase` and is barred by `GC-13`; this one is not a type
                   * selector, because there is no type field to select from.
                   */}
                  <span className="inline-flex w-fit items-center rounded-full bg-surface px-[10px] py-1">
                    <span className={`text-[10px] font-semibold ${palette.ink}`}>Class</span>
                  </span>
                  <h3 className={`text-[15.5px] font-bold ${palette.ink}`}>
                    {session.classGradeLabel ? `${session.classGradeLabel} · ` : ""}
                    {session.moduleTitle}
                  </h3>
                  <dl className="flex flex-col gap-2">
                    <DetailRow icon="calendar" ink={palette.ink} value={longDate(selectedAsDate!)} />
                    {start ? (
                      <DetailRow
                        icon="clock"
                        ink={palette.ink}
                        value={end ? `${start} – ${end}` : start}
                      />
                    ) : null}
                    {/* OMITTED when `room` is NULL — hero 0B, never a placeholder. */}
                    {session.room ? <DetailRow icon="pin" ink={palette.ink} value={session.room} /> : null}
                    {/*
                     * ⛔ NO `Main:` PREFIX AND NO `Assist.` ROW — see omissions 2 and 3.
                     * A session with no assignment renders NO trainer row at all, which is
                     * a real governed state, not a missing value.
                     */}
                    {session.trainerDisplayNames.map((name) => (
                      <DetailRow key={name} icon="user" ink={palette.ink} value={name} />
                    ))}
                  </dl>
                </article>
              );
            })}
          </aside>
        </div>
      ) : null}
    </div>
  );
}

const WEEKDAY_FULL = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
] as const;

function DetailRow({
  icon,
  ink,
  value,
}: {
  readonly icon: "calendar" | "clock" | "pin" | "user";
  readonly ink: string;
  readonly value: string;
}) {
  return (
    <div className="flex items-center gap-[9px]">
      <span className={ink}>
        <Icon name={icon} size={15} />
      </span>
      <dd className={`text-[12px] font-medium ${ink}`}>{value}</dd>
    </div>
  );
}
