"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ A MONTH WITH MARKINGS — NEVER A RENDERING OF MARKINGS
 * ═══════════════════════════════════════════════════════════════════════════
 * Operator ruling, 2026-08-16: *"build the trainer calendar from a focus month
 * initialised to today, decorated by sessions, exactly as management's does.
 * The frame draws a month with markings, not a rendering of markings. One
 * construction, shared."*
 *
 * ⚠️ THE DEFECT THIS REPLACES, STATED SO IT CANNOT BE REINTRODUCED. The trainer
 * dashboard derived its month FROM THE DATA — `const first =
 * dates[0].slice(0, 7)` — and early-returned a sentence when `dates` was empty.
 * ▶ With no sessions there was no `dates[0]`, therefore no month, therefore
 * **no grid at all**, while management's identical-looking calendar rendered
 * fine in the same state. The fixture has aged out of its own calendar (plan
 * §34), so *"no sessions this month"* is the NORMAL state, not an edge case.
 *
 * ⛔ THE MONTH IS AN INPUT, NOT AN OUTPUT. `focus` is initialised to today and
 * moved only by the caller pressing a chevron; `sessionDates` decorate it.
 * An empty `sessionDates` yields a full, correct, undecorated month.
 *
 * ⚠️ AND IT IS A PROJECTION OF CLASS SESSIONS (`A-016`) — it stores nothing and
 * duplicates no event record.
 */

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
/* The frame's own header row: single letters, Sunday first. */
const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const pad = (n: number) => `${n}`.padStart(2, "0");

export type MonthFocus = { readonly year: number; readonly month: number };

export type MonthCalendarProps = {
  /**
   * ISO `YYYY-MM-DD` dates carrying a session. ⛔ May be empty — that is a
   * month with no markings, not a reason to withhold the month.
   */
  readonly sessionDates: readonly string[];
  /** Today, as ISO `YYYY-MM-DD`, so "today" is testable rather than ambient. */
  readonly today: string;
  /** Accessible name, since two calendars can appear in one portal. */
  readonly label: string;
  /**
   * ⛔ NAVIGATION IS OPT-IN, AND THE REASON IS HONESTY RATHER THAN TASTE.
   *
   * The management dashboard REFETCHES its schedule for the focused month, so
   * its chevrons change what the calendar knows. The trainer dashboard's read
   * (`report_list_trainer_reports`) takes **no month parameter** and returns one
   * month's dates — ▶ giving it chevrons would paint later months **undecorated
   * and indistinguishable from genuinely empty ones**, which is a calendar that
   * lies rather than a calendar that is limited.
   *
   * ⚠️ So a caller that cannot refetch passes nothing and gets NO chevrons. This
   * is a `REGISTERED-OMISSION` on screen `01`, not a defect: giving the trainer
   * month navigation requires a month-parameterised read, which is schema and
   * therefore its own authorization.
   */
  readonly focus?: MonthFocus;
  readonly onFocusChange?: (next: MonthFocus) => void;
};

export function MonthCalendar({
  sessionDates,
  today,
  label,
  focus: controlledFocus,
  onFocusChange,
}: MonthCalendarProps) {
  const [uncontrolled] = useState(() => {
    const now = new Date(`${today}T00:00:00`);
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const focus = controlledFocus ?? uncontrolled;
  const navigable = controlledFocus !== undefined && onFocusChange !== undefined;

  /*
   * ⛔ MARKED DAYS ARE SCOPED TO THE FOCUSED MONTH, and that is deliberate
   * rather than incidental: keying a `Set` on the day-of-month alone would let
   * a session on the 3rd of ANOTHER month light up the 3rd of this one. The
   * management screen's own version compared only the day, which was safe only
   * while its query happened to be month-scoped — a correctness dependency
   * living outside the component that draws it.
   */
  const prefix = `${focus.year}-${pad(focus.month + 1)}-`;
  const marked = useMemo(
    () =>
      new Set(
        sessionDates
          .filter((d) => d.startsWith(prefix))
          .map((d) => Number(d.slice(8, 10))),
      ),
    [sessionDates, prefix],
  );

  const cells = useMemo(() => {
    const first = new Date(focus.year, focus.month, 1);
    const daysInMonth = new Date(focus.year, focus.month + 1, 0).getDate();
    const out: (number | null)[] = Array.from({ length: first.getDay() }, () => null);
    for (let day = 1; day <= daysInMonth; day += 1) out.push(day);
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [focus]);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[14.5px] font-bold text-ink">
          {MONTH_NAMES[focus.month]} {focus.year}
        </h2>
        {navigable ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={`${label}: previous month`}
              onClick={() =>
                onFocusChange(
                  focus.month === 0
                    ? { year: focus.year - 1, month: 11 }
                    : { year: focus.year, month: focus.month - 1 },
                )
              }
              className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-line text-ink-muted transition hover:bg-surface-muted"
            >
              <Icon name="chevronLeft" size={14} />
            </button>
            <button
              type="button"
              aria-label={`${label}: next month`}
              onClick={() =>
                onFocusChange(
                  focus.month === 11
                    ? { year: focus.year + 1, month: 0 }
                    : { year: focus.year, month: focus.month + 1 },
                )
              }
              className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-line text-ink-muted transition hover:bg-surface-muted"
            >
              <Icon name="chevronRight" size={14} />
            </button>
          </div>
        ) : null}
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center" role="grid" aria-label={label}>
        {WEEKDAY_LABELS.map((day, index) => (
          <span key={`${day}-${index}`} className="text-[10px] font-semibold text-ink-subtle">
            {day}
          </span>
        ))}
        {cells.map((day, index) => {
          if (day === null) return <span key={`pad-${index}`} className="h-8" aria-hidden="true" />;
          const iso = `${prefix}${pad(day)}`;
          const isToday = iso === today;
          const hasSession = marked.has(day);
          return (
            <span
              key={iso}
              /*
               * ⚠️ The marking is announced, not left to colour alone — two
               * states are conveyed here and `SC 1.4.1` applies to both.
               */
              aria-label={hasSession ? `${iso}, has a session` : undefined}
              className={`flex h-8 w-8 items-center justify-center justify-self-center rounded-full text-[12.5px] ${
                isToday
                  ? "bg-brand-500 font-bold text-white"
                  : hasSession
                    ? "bg-brand-100 font-semibold text-brand-700"
                    : "text-ink-muted"
              }`}
            >
              {day}
            </span>
          );
        })}
      </div>
    </div>
  );
}
