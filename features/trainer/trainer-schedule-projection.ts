/**
 * Trainer schedule date projection (FRONTEND RECONSTRUCTION F4 / operator checkpoint F-04).
 *
 * GOVERNANCE — this is the single most important thing about this module.
 *
 * "Calendars are projections of class-session records and their assignments", and
 * "management and trainer calendars must not store separate duplicated event records"
 * (`CLAUDE.md` §6, Amendment 002 A-016; Amendment 005 A-047; `GLOBAL_UI_RULES` §3).
 *
 * Everything below is a PURE FUNCTION over the class-session rows the governed trainer
 * projection already returned (`PhysicalTestPort.listTrainerSessions()`). There is no event
 * record, no agenda record, no calendar entity, no second store, no persistence and no
 * mutation anywhere in this file. Nothing here can name a class session the governed
 * projection did not already return, so the trainer-assignment boundary is preserved by
 * construction: the projection is server-proved upstream and this module only re-buckets
 * what it handed back.
 *
 * All date arithmetic is performed in UTC so a viewer's local zone can never shift a
 * session onto a neighbouring day. The `date` field of `TrainerSessionSummaryDto` is a
 * plain `YYYY-MM-DD` calendar date, not an instant.
 */

import type { TrainerSessionSummaryDto } from "@/lib/frontend/contracts/physical-test";

export const SCHEDULE_VIEW_MODES = ["day", "week", "month"] as const;

export type ScheduleViewMode = (typeof SCHEDULE_VIEW_MODES)[number];

/** One calendar day of the projection. */
export type ScheduleDay = {
  /** `YYYY-MM-DD`. */
  readonly isoDate: string;
  readonly dayOfMonth: number;
  /** `YYYY-MM`. */
  readonly monthKey: string;
  /** False for the leading/trailing days a month grid borrows from its neighbours. */
  readonly inFocusMonth: boolean;
  /** The governed class sessions falling on this day, earliest start time first. */
  readonly sessions: readonly TrainerSessionSummaryDto[];
};

const MS_PER_DAY = 86_400_000;

function startOfDayUtc(isoDate: string): number {
  return Date.parse(`${isoDate}T00:00:00Z`);
}

function isoDateOf(epochMs: number): string {
  return new Date(epochMs).toISOString().slice(0, 10);
}

export function monthKeyOf(isoDate: string): string {
  return isoDate.slice(0, 7);
}

/** Sessions bucketed by calendar date, each bucket ordered by start time then module name. */
export function indexSessionsByDate(
  sessions: readonly TrainerSessionSummaryDto[],
): ReadonlyMap<string, readonly TrainerSessionSummaryDto[]> {
  const index = new Map<string, TrainerSessionSummaryDto[]>();
  for (const session of sessions) {
    const bucket = index.get(session.date);
    if (bucket) bucket.push(session);
    else index.set(session.date, [session]);
  }
  for (const bucket of index.values()) {
    bucket.sort(
      (left, right) =>
        left.startTime.localeCompare(right.startTime) ||
        left.moduleName.localeCompare(right.moduleName),
    );
  }
  return index;
}

/** Every `YYYY-MM` that carries at least one assigned session, earliest first. */
export function listScheduleMonthKeys(
  sessions: readonly TrainerSessionSummaryDto[],
): readonly string[] {
  return [...new Set(sessions.map((session) => monthKeyOf(session.date)))].sort();
}

/**
 * The deterministic default focus date: the earliest assigned session.
 *
 * Deliberately derived from the projection rather than from "today" so the surface renders
 * identically in every environment, in every timezone and in every diagnostic capture.
 */
export function defaultFocusIsoDate(
  sessions: readonly TrainerSessionSummaryDto[],
): string | null {
  let earliest: string | null = null;
  for (const session of sessions) {
    if (earliest === null || session.date < earliest) earliest = session.date;
  }
  return earliest;
}

/** The first day of `monthKey` carrying a session, else the first of that month. */
export function firstFocusDateInMonth(
  sessions: readonly TrainerSessionSummaryDto[],
  monthKey: string,
): string {
  const inMonth = sessions
    .filter((session) => monthKeyOf(session.date) === monthKey)
    .map((session) => session.date)
    .sort();
  return inMonth[0] ?? `${monthKey}-01`;
}

function buildDayAt(
  epochMs: number,
  focusMonthKey: string,
  index: ReadonlyMap<string, readonly TrainerSessionSummaryDto[]>,
): ScheduleDay {
  const isoDate = isoDateOf(epochMs);
  const monthKey = monthKeyOf(isoDate);
  return {
    isoDate,
    dayOfMonth: new Date(epochMs).getUTCDate(),
    monthKey,
    inFocusMonth: monthKey === focusMonthKey,
    sessions: index.get(isoDate) ?? [],
  };
}

/**
 * A Sunday-first month grid, trimmed to the number of weeks the month actually needs —
 * five for a 31-day month starting on a Thursday, as the frozen reference shows.
 */
export function buildMonthWeeks(
  sessions: readonly TrainerSessionSummaryDto[],
  monthKey: string,
): readonly (readonly ScheduleDay[])[] {
  const index = indexSessionsByDate(sessions);
  const firstOfMonth = startOfDayUtc(`${monthKey}-01`);
  const leadingBlanks = new Date(firstOfMonth).getUTCDay();
  const year = Number(monthKey.slice(0, 4));
  const month = Number(monthKey.slice(5, 7));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const weekCount = Math.ceil((leadingBlanks + daysInMonth) / 7);

  const weeks: ScheduleDay[][] = [];
  for (let week = 0; week < weekCount; week += 1) {
    const days: ScheduleDay[] = [];
    for (let offset = 0; offset < 7; offset += 1) {
      const cursor =
        firstOfMonth + (week * 7 + offset - leadingBlanks) * MS_PER_DAY;
      days.push(buildDayAt(cursor, monthKey, index));
    }
    weeks.push(days);
  }
  return weeks;
}

/** The Sunday-first week containing `isoDate`, in the focus month of `isoDate`. */
export function buildWeekDays(
  sessions: readonly TrainerSessionSummaryDto[],
  isoDate: string,
): readonly ScheduleDay[] {
  const index = indexSessionsByDate(sessions);
  const focusMonthKey = monthKeyOf(isoDate);
  const anchor = startOfDayUtc(isoDate);
  const weekStart = anchor - new Date(anchor).getUTCDay() * MS_PER_DAY;
  return Array.from({ length: 7 }, (_, offset) =>
    buildDayAt(weekStart + offset * MS_PER_DAY, focusMonthKey, index),
  );
}

/** The single day `isoDate`. */
export function buildSingleDay(
  sessions: readonly TrainerSessionSummaryDto[],
  isoDate: string,
): ScheduleDay {
  return buildDayAt(
    startOfDayUtc(isoDate),
    monthKeyOf(isoDate),
    indexSessionsByDate(sessions),
  );
}

/* ---------------------------------------------------------------------------
 * Presentation formatting. Locale `en-SG`, timezone UTC — matched to the formatting
 * already used by the delivered trainer surfaces.
 * ------------------------------------------------------------------------- */

export const WEEKDAY_HEADINGS = [
  { short: "Sun", long: "Sunday" },
  { short: "Mon", long: "Monday" },
  { short: "Tue", long: "Tuesday" },
  { short: "Wed", long: "Wednesday" },
  { short: "Thu", long: "Thursday" },
  { short: "Fri", long: "Friday" },
  { short: "Sat", long: "Saturday" },
] as const;

export function formatMonthLabel(monthKey: string): string {
  return new Intl.DateTimeFormat("en-SG", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${monthKey}-01T00:00:00Z`));
}

export function formatFullDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-SG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

export function formatShortDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

export function formatWeekLabel(days: readonly ScheduleDay[]): string {
  const first = days[0];
  const last = days[days.length - 1];
  if (!first || !last) return "";
  return `${formatShortDate(first.isoDate)} – ${formatShortDate(last.isoDate)}`;
}

/** `"14:00"` -> `"2:00 PM"`. Accepts `HH:MM` and `HH:MM:SS`. */
export function formatClockTime(value: string): string {
  const [hours, minutes] = value.split(":");
  const hour = Number(hours);
  if (!Number.isFinite(hour)) return value;
  const suffix = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minutes ?? "00"} ${suffix}`;
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${formatClockTime(startTime)} – ${formatClockTime(endTime)}`;
}
