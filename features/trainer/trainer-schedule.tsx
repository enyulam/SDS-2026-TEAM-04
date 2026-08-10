"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { StatePanel } from "@/components/ui/state-panel";
import type { TrainerSessionSummaryDto } from "@/lib/frontend/contracts/physical-test";
import {
  SESSION_ELIGIBILITY_PRESENTATION,
  deriveSessionEligibility,
  singaporeInstant,
  type SessionEligibility,
} from "@/lib/schedule/session-eligibility";
import { asFailure, type ResourceState } from "./resource-state";
import { usePhysicalTestPort, usePortalRuntime } from "@/features/portal/portal-runtime-context";
import {
  SCHEDULE_VIEW_MODES,
  WEEKDAY_HEADINGS,
  buildMonthWeeks,
  buildSingleDay,
  buildWeekDays,
  defaultFocusIsoDate,
  firstFocusDateInMonth,
  formatFullDate,
  formatMonthLabel,
  formatTimeRange,
  formatWeekLabel,
  listScheduleMonthKeys,
  monthKeyOf,
  type ScheduleDay,
  type ScheduleViewMode,
} from "./trainer-schedule-projection";

/**
 * Screen 05 — Trainer Schedule (FRONTEND RECONSTRUCTION F4 / operator checkpoint F-04).
 *
 * Route: `/trainer/schedule` — the canonical Trainer entry route created by operator ruling
 * R-B1, which resolves the long-open decision U-A5-1 (inventory §7.3). `/trainer` is
 * preserved as a compatibility redirect onto this route; no working route was deleted.
 *
 * Current Final MVP visual authority is `UI_REFERENCE_FINAL_MVP/reference/Trainer - Schedule/`
 * (Amendment 007 A-056, which supersedes the A-045 ordering). The pack-local
 * `UI_REFERENCE_FINAL_MVP/05-trainer-schedule/reference.png` (node `591:9`) is an optional
 * frozen duplicate, SHA-identical to it. See CLAUDE.md §7.4 and FINAL_MVP_AUTHORITY_LOCK.md
 * §2.4 for the ladder and for governed deviations.
 *
 * GOVERNANCE BOUNDARIES HELD HERE:
 *
 *  - The calendar is a PROJECTION of the class-session rows the governed trainer projection
 *    already returned (A-016, A-047, `GLOBAL_UI_RULES` §3). No event record, agenda record,
 *    calendar entity or second store exists — see `trainer-schedule-projection.ts`.
 *  - Only sessions the trainer is assigned to can appear, because the only input is
 *    `port.listTrainerSessions()`, whose assignment check is proved upstream. Search and the
 *    view switch NARROW what that projection returned; they can never widen it.
 *  - No lifecycle transition, permission or mutation is authorized by a control drawn on the
 *    frame. Screen presence is not authorization.
 *  - Not rating-bearing (`screen.md` §8): this surface renders no competency-rating
 *    vocabulary, so it carries no F6 / Amendment 006 V3 dependency. The Class Grade
 *    vocabulary it does render — Beginner / Intermediate / Advanced — is a DIFFERENT,
 *    unchanged vocabulary (A-054) and is marked as such where it renders alone.
 *
 * Frame-versus-governance divergences are recorded in
 * `UI_REFERENCE_FINAL_MVP/05-trainer-schedule/implementation-notes.md`, never silently
 * resolved. The two that shape this file:
 *
 *  D1 "Add Agenda" — no create-session path exists on `PhysicalTestPort`, and session
 *     creation is a governed MANAGEMENT action (A-019). The control keeps the frame's label
 *     and is rendered DISABLED with a visible, programmatically associated reason, exactly
 *     as F-11 handled "Send Reminder to Trainer". Nothing is invented and nothing is faked.
 *  D2 "Start Class" — the frame's primary detail action implies a session-lifecycle
 *     transition. The session-lifecycle enum is DEFERRED and unratified (`CLAUDE.md` §6.1,
 *     A-026: "do not invent a placeholder enum"). The control is therefore relabelled to
 *     name the governed action it actually performs — trainer session selection into the
 *     roster, the behaviour that already existed on `/trainer` and is preserved here.
 *
 * C2C-010 — SESSION-START ELIGIBILITY IS NOW SURFACED, and it is a DERIVED time
 * comparison, not a status. Before this checkpoint no Trainer surface distinguished a
 * session that had started from one that had not: every SessionCard rendered an identically
 * enabled roster link, so a trainer could enter a FUTURE session, complete all nine ratings,
 * and only then be refused by BC104 at save time. `session-eligibility.ts` derives past /
 * eligible / future from `date` + `startTime` against the SAME pinned Asia/Singapore clock
 * the governed RPCs use; a `future` session renders its entry point INERT with the governed
 * reason attached programmatically, exactly as D1's "Add Agenda" already does. The server
 * gates are untouched and remain authoritative (ADR-3).
 */

/**
 * Presentation tone per Class Grade. Class Grade is unchanged by Amendment 006
 * (A-054). F16-C: `classGrade` is now the DISPLAY NAME the database holds, so
 * the map is keyed by string with an explicit neutral default — an unrecognised
 * grade renders in the brand tone rather than crashing or being renamed.
 */
const CLASS_GRADE_TONE: Readonly<Record<string, "brand" | "info" | "success">> = {
  Beginner: "brand",
  Intermediate: "info",
  Advanced: "success",
};

function classGradeTone(classGrade: string): "brand" | "info" | "success" {
  return CLASS_GRADE_TONE[classGrade] ?? "brand";
}

const CHIP_TONE = {
  brand: "bg-brand-100 text-brand-800",
  info: "bg-info-soft text-info-on",
  success: "bg-success-soft text-success-on",
} as const;

const VIEW_LABEL: Readonly<Record<ScheduleViewMode, string>> = {
  day: "Day",
  week: "Week",
  month: "Month",
};

export function TrainerSchedule() {
  const port = usePhysicalTestPort();
  const { dataRevision } = usePortalRuntime();
  const searchParams = useSearchParams();
  const searchId = useId();
  const monthId = useId();
  const agendaNoteId = useId();

  const [state, setState] = useState<
    ResourceState<readonly TrainerSessionSummaryDto[]>
  >({ kind: "loading" });
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ScheduleViewMode>("month");
  const [focusIso, setFocusIso] = useState<string | null>(null);
  const [selectedIso, setSelectedIso] = useState<string | null>(null);

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

  const allSessions = useMemo(
    () => (state.kind === "ready" ? state.data : []),
    [state],
  );

  /** The `?preview=empty` diagnostic delivered with the previous surface is preserved. */
  const projected = useMemo(
    () => (searchParams.get("preview") === "empty" ? [] : allSessions),
    [allSessions, searchParams],
  );

  const visibleSessions = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return projected;
    return projected.filter(
      (session) =>
        session.moduleName.toLocaleLowerCase().includes(needle) ||
        session.classGrade.toLocaleLowerCase().includes(needle),
    );
  }, [projected, query]);

  const monthKeys = useMemo(
    () => listScheduleMonthKeys(projected),
    [projected],
  );

  const derivedFocus = useMemo(() => {
    if (focusIso) return focusIso;
    return defaultFocusIsoDate(projected) ?? `${new Date().toISOString().slice(0, 7)}-01`;
  }, [focusIso, projected]);

  const focusMonthKey = monthKeyOf(derivedFocus);
  const monthOptions = useMemo(
    () => [...new Set([...monthKeys, focusMonthKey])].sort(),
    [focusMonthKey, monthKeys],
  );

  const monthWeeks = useMemo(
    () => buildMonthWeeks(visibleSessions, focusMonthKey),
    [focusMonthKey, visibleSessions],
  );
  const weekDays = useMemo(
    () => buildWeekDays(visibleSessions, derivedFocus),
    [derivedFocus, visibleSessions],
  );
  const singleDay = useMemo(
    () => buildSingleDay(visibleSessions, derivedFocus),
    [derivedFocus, visibleSessions],
  );

  const detailDay = useMemo<ScheduleDay | null>(() => {
    if (view === "day") return singleDay;
    if (!selectedIso) return null;
    return buildSingleDay(visibleSessions, selectedIso);
  }, [selectedIso, singleDay, view, visibleSessions]);

  function selectDay(isoDate: string) {
    setSelectedIso(isoDate);
    setFocusIso(isoDate);
  }

  function changeMonth(monthKey: string) {
    const next = firstFocusDateInMonth(projected, monthKey);
    setFocusIso(next);
    setSelectedIso(null);
  }

  const periodLabel =
    view === "day"
      ? formatFullDate(derivedFocus)
      : view === "week"
        ? formatWeekLabel(weekDays)
        : formatMonthLabel(focusMonthKey);

  if (state.kind === "loading") {
    return <LoadingSkeleton label="Loading the assigned Trainer schedule" rows={4} />;
  }
  if (state.kind === "failed") return <StatePanel result={state.result} />;

  return (
    <div className="page-grid">
      {/*
        PHASE 4 (plan §4) — the page header carries the frame's measured type scale:
        title 22px/700, description 12.5px/400 at a 2px gap. `tracking-[-0.02em]` was
        REMOVED rather than restyled: `h1..h4 { letter-spacing: -0.015em }` in
        globals.css is UNLAYERED, so a tracking utility on a heading is emitted,
        matched and silently loses the cascade. Leaving a class that does nothing
        reads as an applied value on review. See the Phase 4 adjudication §2.1.
      */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[1.375rem] font-bold text-ink-strong">Schedule</h1>
          <p className="mt-0.5 text-small leading-5 text-ink">
            Your classes, sessions and meetings
          </p>
        </div>
        <div className="w-full max-w-[14.375rem]">
          <label
            htmlFor={searchId}
            className="mb-1 block text-small font-medium text-neutral-on"
          >
            Search schedule
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search schedule"
            className="min-h-11 w-full rounded-[0.75rem] border border-line bg-surface px-3.5 py-2.5 text-small text-ink-strong placeholder:text-neutral-on"
          />
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_18.75rem]">
        {/* `min-w-0` keeps the wide month grid scrolling inside its own container rather
            than widening the page — GLOBAL_UI_RULES §6. */}
        <section className="card min-w-0 overflow-hidden" aria-labelledby="schedule-period">
          <div className="flex flex-col gap-4 border-b border-line px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2
                id="schedule-period"
                className="text-card-title font-bold text-ink-strong"
              >
                {periodLabel}
              </h2>
              <label
                htmlFor={monthId}
                className="mt-1.5 block text-small font-medium text-neutral-on"
              >
                Month shown
              </label>
              <select
                id={monthId}
                value={focusMonthKey}
                onChange={(event) => changeMonth(event.target.value)}
                className="mt-1 min-h-11 rounded-[0.75rem] border border-line bg-surface px-3 py-2 text-small font-semibold text-ink-strong"
              >
                {monthOptions.map((monthKey) => (
                  <option key={monthKey} value={monthKey}>
                    {formatMonthLabel(monthKey)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div
                role="group"
                aria-label="Schedule view"
                className="inline-flex gap-[3px] rounded-field bg-surface-muted p-[3px]"
              >
                {SCHEDULE_VIEW_MODES.map((mode) => {
                  const active = view === mode;
                  return (
                    /*
                     * The frame carries the current segment on FILL ALONE — no
                     * elevation. Dropping the elevation to match it would leave
                     * colour as the only cue, so the frame's own 500 → 600 weight
                     * step is what distinguishes the two states, alongside
                     * `aria-pressed`. Same reasoning as Phases 1–3 §4: a
                     * non-colour carrier is required (GLOBAL_UI_RULES §7,
                     * WCAG 2.2 SC 1.4.1), and 600 is a ratified frame value.
                     */
                    <button
                      key={mode}
                      type="button"
                      data-schedule-view={mode}
                      data-selected={active ? "true" : "false"}
                      aria-pressed={active}
                      onClick={() => setView(mode)}
                      className={`rounded-lg px-3.5 py-[7px] text-[0.75rem] transition ${
                        active
                          ? "bg-surface font-semibold text-ink-strong"
                          : "bg-transparent font-medium text-neutral-on hover:text-ink-strong"
                      }`}
                    >
                      {VIEW_LABEL[mode]}
                    </button>
                  );
                })}
              </div>

              {/* D1 — governed affordance, no governed backing. Label kept, behaviour not invented. */}
              <button
                type="button"
                disabled
                aria-describedby={agendaNoteId}
                className="inline-flex min-h-10 cursor-not-allowed items-center gap-[7px] rounded-field border border-line bg-surface-muted px-4 py-[9px] text-small font-semibold text-ink-subtle"
              >
                <span aria-hidden="true">+</span>
                Add Agenda
              </button>
            </div>
          </div>

          <p id={agendaNoteId} className="px-5 pt-3 text-small leading-6 text-ink sm:px-6">
            Creating a Class Session is a governed Management action, and no create-session
            path exists for a Trainer. &ldquo;Add Agenda&rdquo; is inactive rather than
            simulated.
          </p>

          <div className="overflow-x-auto px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
            {view === "day" ? (
              <DayAgenda day={singleDay} />
            ) : (
              <CalendarGrid
                weeks={view === "month" ? monthWeeks : [weekDays]}
                selectedIso={selectedIso}
                onSelectDay={selectDay}
                caption={
                  view === "month"
                    ? `Class sessions in ${formatMonthLabel(focusMonthKey)}`
                    : `Class sessions for ${formatWeekLabel(weekDays)}`
                }
              />
            )}
          </div>

          {visibleSessions.length === 0 && (
            <p
              role="status"
              className="border-t border-line px-5 py-4 text-body leading-6 text-ink sm:px-6"
            >
              {projected.length === 0
                ? "No Class Sessions are assigned to this Trainer."
                : "No assigned Class Session matches this search."}
            </p>
          )}
        </section>

        <ScheduleDetails
          day={detailDay}
          onClose={view === "day" ? null : () => setSelectedIso(null)}
        />
      </div>
    </div>
  );
}

function CalendarGrid({
  weeks,
  selectedIso,
  onSelectDay,
  caption,
}: {
  readonly weeks: readonly (readonly ScheduleDay[])[];
  readonly selectedIso: string | null;
  readonly onSelectDay: (isoDate: string) => void;
  readonly caption: string;
}) {
  return (
    <table className="w-full min-w-[46rem] table-fixed border-collapse">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr>
          {WEEKDAY_HEADINGS.map((weekday) => (
            /*
             * The full weekday name is supplied as the column header's accessible name
             * rather than as an `sr-only` span. `sr-only` is absolutely positioned, so
             * inside this horizontally scrolling table it escapes the scroll container's
             * clipping and extends `documentElement.scrollWidth` past the viewport at
             * narrow widths — i.e. it makes the PAGE scroll horizontally, which
             * `GLOBAL_UI_RULES` §6 forbids. `aria-label` names the column without adding
             * any laid-out box.
             */
            <th
              key={weekday.short}
              scope="col"
              aria-label={weekday.long}
              className="border-b border-line pb-1 pl-2 text-left text-micro font-semibold text-neutral-on"
            >
              {weekday.short}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {weeks.map((week) => (
          <tr key={week[0]?.isoDate ?? "week"}>
            {week.map((day) => (
              <td
                key={day.isoDate}
                className="h-40 border-b border-r border-line align-top last:border-r-0"
              >
                <DayCell
                  day={day}
                  selected={day.isoDate === selectedIso}
                  onSelect={onSelectDay}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DayCell({
  day,
  selected,
  onSelect,
}: {
  readonly day: ScheduleDay;
  readonly selected: boolean;
  readonly onSelect: (isoDate: string) => void;
}) {
  if (!day.inFocusMonth) {
    return (
      <div className="h-full bg-surface-muted p-[7px]">
        {/* D6 — the frame renders the borrowed neighbouring-month dates in a very light
            grey that measures 2.043:1 on this fill. A date is text that carries meaning,
            so the AA floor wins over the frame: hue preserved, luminance moved (A-045).
            The frame's SIZE and WEIGHT (12px/500) are followed; only its colour is not. */}
        <span className="text-[0.75rem] font-medium text-neutral-on">{day.dayOfMonth}</span>
      </div>
    );
  }

  return (
    <button
      type="button"
      data-schedule-day={day.isoDate}
      aria-current={selected ? "date" : undefined}
      aria-label={`${formatFullDate(day.isoDate)}. ${describeDay(day)}`}
      onClick={() => onSelect(day.isoDate)}
      className={`flex h-full w-full flex-col gap-1 p-[7px] text-left transition ${
        selected
          ? "bg-brand-50 ring-2 ring-inset ring-brand-700"
          : "bg-surface hover:bg-surface-subtle"
      }`}
    >
      <span
        aria-hidden="true"
        className={`inline-flex size-[1.625rem] items-center justify-center rounded-full text-[0.78125rem] font-semibold ${
          selected ? "bg-brand-700 text-white" : "text-ink-strong"
        }`}
      >
        {day.dayOfMonth}
      </span>
      <span className="flex w-full flex-col gap-1" aria-hidden="true">
        {day.sessions.map((session) => (
          /*
           * Chip type follows the frame exactly (10.5px title over a 9px time at a
           * 7px radius). Its COLOUR does not: the frame tints each chip in the
           * Class Grade's own hue at roughly 3:1, and these tones hold AA. The
           * `opacity-90` the time line used to carry was dropped — the frame gives
           * both lines one colour, and removing it raises contrast rather than
           * lowering it.
           */
          <span
            key={session.sessionId}
            className={`block truncate rounded-[7px] px-[7px] py-[5px] text-[0.65625rem] font-semibold ${
              CHIP_TONE[classGradeTone(session.classGrade)]
            }`}
          >
            <span className="block truncate">
              {session.classGrade} · {session.moduleName}
            </span>
            <span className="mt-px block text-[0.5625rem] font-medium">
              {formatTimeRange(session.startTime, session.endTime).split(" – ")[0]}
            </span>
          </span>
        ))}
      </span>
    </button>
  );
}

function DayAgenda({ day }: { readonly day: ScheduleDay }) {
  if (day.sessions.length === 0) {
    return (
      <p role="status" className="text-body leading-6 text-ink">
        No assigned Class Session on {formatFullDate(day.isoDate)}.
      </p>
    );
  }
  return (
    <ul className="grid gap-3">
      {day.sessions.map((session) => (
        <li key={session.sessionId}>
          <SessionCard session={session} />
        </li>
      ))}
    </ul>
  );
}

function ScheduleDetails({
  day,
  onClose,
}: {
  readonly day: ScheduleDay | null;
  readonly onClose: (() => void) | null;
}) {
  return (
    <aside
      aria-labelledby="schedule-details-heading"
      className="card h-fit p-5 xl:sticky xl:top-6"
    >
      <div className="flex items-start justify-between gap-3">
        <h2
          id="schedule-details-heading"
          className="text-[0.9375rem] font-semibold text-ink-strong"
        >
          Schedule Details
        </h2>
        {onClose && day && (
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-field text-neutral-on hover:bg-surface-muted hover:text-ink-strong"
          >
            <Icon name="close" size={16} />
            <span className="sr-only">Clear the selected day</span>
          </button>
        )}
      </div>

      {!day ? (
        <p role="status" className="mt-3 text-body leading-6 text-ink">
          Select a day in the calendar to see the Class Sessions assigned to you on that
          date.
        </p>
      ) : (
        <>
          <p className="mt-1 text-small font-medium text-ink">
            {formatFullDate(day.isoDate)}
          </p>
          {day.sessions.length === 0 ? (
            <p role="status" className="mt-4 text-body leading-6 text-ink">
              No assigned Class Session on this date.
            </p>
          ) : (
            <ul className="mt-4 grid gap-4">
              {day.sessions.map((session) => (
                <li key={session.sessionId}>
                  <SessionCard session={session} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </aside>
  );
}

function SessionCard({ session }: { readonly session: TrainerSessionSummaryDto }) {
  /*
   * Derived on render from the live pinned clock. It is deliberately NOT held in
   * state and not memoised across the session list: a value cached at mount would
   * keep claiming "not started yet" after the start time passed.
   */
  const eligibility: SessionEligibility = deriveSessionEligibility(session, singaporeInstant());
  const presentation = SESSION_ELIGIBILITY_PRESENTATION[eligibility];
  const reasonId = `session-state-${session.sessionId}`;
  return (
    <article
      className="rounded-card bg-brand-100 px-4 py-[0.9375rem]"
      data-session-eligibility={eligibility}
    >
      <span className="flex flex-wrap items-center gap-2">
        {/*
          The frame draws this as a WHITE pill on the pink card, so it is rendered
          here rather than through `Badge`: the shared tone map has no white-on-tint
          tone, and a `className` override would collide with `Badge`'s own
          background utility — two utilities of equal specificity in the same layer,
          decided by stylesheet order rather than by the class attribute. That is the
          same "declared is not applied" trap this plan keeps catching, so it is
          avoided rather than gambled on.
        */}
        <span className="inline-flex min-h-6 items-center rounded-full bg-surface px-2.5 py-1 text-[0.625rem] font-semibold text-brand-800">
          Class
        </span>
        {/*
          COLOUR IS NOT THE ONLY CARRIER (GLOBAL_UI_RULES §7, WCAG 2.2 SC 1.4.1). The
          state is stated in WORDS ("Completed" / "In session today" / "Not started
          yet"), given a distinct SHAPE glyph, and — when inert — accompanied by the
          governed reason in prose below. The tint is the fourth, redundant carrier.
        */}
        <span
          data-session-state-label={eligibility}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-micro font-bold ${
            ELIGIBILITY_CHIP[presentation.tone]
          }`}
        >
          <span aria-hidden="true">{presentation.glyph}</span>
          {presentation.label}
        </span>
      </span>
      {/*
        ⚠️ `text-brand-800!` is IMPORTANT deliberately, and it is the only important
        utility in the application. `h1..h4 { color: #1b2b4b }` in globals.css is
        UNLAYERED, and Tailwind emits utilities into `@layer utilities`, so an
        unlayered rule outranks every layered one: the plain `text-brand-800` this
        heading carried before was generated, matched, and lost — the title rendered
        NAVY while the source said pink, on every build since it was written. An
        important declaration wins regardless of layer, and it is scoped to this one
        element rather than by moving the heading rule into a layer, which would
        change the cascade for every heading in the application at once.
      */}
      <h3 className="mt-2.5 text-[0.96875rem] font-bold text-brand-800!">
        {session.moduleName}
      </h3>
      <dl className="mt-3 grid gap-2 text-[0.75rem] font-medium text-ink">
        <div className="flex gap-2">
          <dt className="font-semibold">Date</dt>
          <dd>{formatFullDate(session.date)}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-semibold">Time</dt>
          <dd>{formatTimeRange(session.startTime, session.endTime)}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-semibold">Class Grade</dt>
          <dd data-vocabulary="class-grade">{session.classGrade}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-semibold">Roster</dt>
          <dd>
            {session.studentCount}{" "}
            {session.studentCount === 1 ? "learner" : "learners"}
          </dd>
        </div>
        {/*
          HERO PHASE 3 — the frame's "Studio 2" and "Main: Sam Ong".

          The dependency recorded at checkpoint F-04 ("the frame's session
          room/location and its Main / Assist. trainer names exist on no
          governed field and are omitted rather than fabricated") is now
          DISCHARGED for two of those three by G-6 and G-7. It was correctly
          recorded at the time and deliberately not invented around — the
          rulings closed a booked gap rather than opening new scope.

          ⚠️ NULL MEANS NOT RECORDED, SO THE WHOLE ROW DISAPPEARS. Never "TBC",
          never a dash standing in for a value. The frame renders these as bare
          lines; they are rendered here as `<dt>`/`<dd>` pairs to match the
          accepted structure of the four rows above, which is why the frame's
          literal "Main:" prefix becomes the term "Main".

          ⛔ NO `Assist.` ROW — G-7, a REGISTERED-OMISSION on this screen and
          preserved. A second staff role is not a label: it means extending
          `centre_membership_role`, an enum carrying AUTHORIZATION vocabulary,
          and it would reintroduce the TA persona A-014 defers. The projection
          carries one name, and there is no second field for a row to bind to.
        */}
        {session.room === null ? null : (
          <div className="flex gap-2">
            <dt className="font-semibold">Room</dt>
            <dd>{session.room}</dd>
          </div>
        )}
        {session.trainerDisplayName === null ? null : (
          <div className="flex gap-2">
            <dt className="font-semibold">Main</dt>
            <dd>{session.trainerDisplayName}</dd>
          </div>
        )}
      </dl>
      {/*
        D2 — the frame's "Start Class" is relabelled to the governed action it performs.
        C2C-010 — and for a session whose scheduled start has not been reached there is
        NO ENABLED ROSTER OR ASSESS PATH AT ALL. The control is a disabled button, not a
        styled link: a link would still be followable by keyboard, by middle-click and by
        the browser's own address bar. Hiding it would be worse — the trainer would not
        know why the class they can see cannot be opened — so it renders visibly inert
        with the governed reason associated by `aria-describedby`.
      */}
      {presentation.inert ? (
        <>
          <button
            type="button"
            disabled
            aria-describedby={reasonId}
            data-roster-entry="inert"
            className="mt-4 inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-field border border-line bg-surface-muted px-4 py-3 text-[0.9375rem] font-semibold text-ink-subtle"
          >
            Open Class Roster
            <span className="sr-only"> for {session.moduleName}</span>
          </button>
          <p id={reasonId} className="mt-2 text-small leading-6 text-ink">
            {presentation.reason}
          </p>
        </>
      ) : (
        <Link
          href={`/trainer/sessions/${session.sessionId}/roster`}
          data-roster-entry="enabled"
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-field border border-line-strong bg-surface px-4 py-3 text-[0.9375rem] font-semibold text-brand-800 no-underline shadow-raised transition hover:bg-brand-200"
        >
          Open Class Roster
          <span className="sr-only"> for {session.moduleName}</span>
        </Link>
      )}
    </article>
  );
}

/**
 * Chip tints per derived state. Redundant with the label and the glyph, never alone.
 *
 * PHASE 4: the `brand` tint moved from `bg-brand-100` to the card's own white pill
 * treatment because the SessionCard fill itself became `bg-brand-100` this phase —
 * `bg-brand-100` on `bg-brand-100` is an invisible chip, and the state would then have
 * been carried by the glyph and the label alone with no boundary at all.
 */
const ELIGIBILITY_CHIP: Readonly<Record<"brand" | "success" | "neutral", string>> = {
  brand: "bg-surface text-brand-800",
  success: "bg-success-soft text-success-on",
  neutral: "bg-neutral-soft text-neutral-on",
};

function describeDay(day: ScheduleDay): string {
  if (day.sessions.length === 0) return "No assigned Class Session.";
  const now = singaporeInstant();
  return day.sessions
    .map(
      (session) =>
        /*
         * The derived state is carried into the calendar cell's ACCESSIBLE NAME as
         * well, so a screen-reader user learns which sessions are open before
         * choosing a day rather than after opening one.
         */
        `${session.classGrade} ${session.moduleName}, ${formatTimeRange(
          session.startTime,
          session.endTime,
        )}, ${SESSION_ELIGIBILITY_PRESENTATION[deriveSessionEligibility(session, now)].label}`,
    )
    .join(". ");
}
