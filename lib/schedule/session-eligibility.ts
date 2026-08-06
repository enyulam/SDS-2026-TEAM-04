/**
 * SESSION ELIGIBILITY — a DERIVED time comparison, never a stored status.
 * (Run C3-A Phase 2b, C2C-010 / C2C-011.)
 *
 * ============================================================================
 * WHAT THIS IS NOT
 * ============================================================================
 *
 * It is NOT a session-lifecycle enum, column or status. Amendment 003 A-026 is
 * explicit: "Session-lifecycle and audit vocabularies are deferred because
 * their values are not yet ratified — do not invent a placeholder enum." No
 * database object is added or read here and no new vocabulary is introduced.
 * The three values below are a PRESENTATION classification computed from two
 * facts the governed trainer projection already returns — `date` and
 * `startTime` — against a clock. They authorize nothing.
 *
 * ============================================================================
 * THE CLOCK IS THE ONE THE DATABASE USES
 * ============================================================================
 *
 * The governed RPCs pin their comparison to Asia/Singapore. The refusal they
 * raise is BC017 / BC104, "report: the scheduled session start has not been
 * reached", and it is evaluated as
 * `(now() AT TIME ZONE 'Asia/Singapore')` against the session's own
 * `session_date` + `starts_at`. This module derives the SAME comparison from
 * the SAME pinned zone, so the surface and the server agree by construction
 * rather than by coincidence. The server remains authoritative (ADR-3): this
 * changes what the trainer is offered, never what the database permits.
 *
 * ============================================================================
 * WHY "PAST" IS ELIGIBLE, AND WHY THAT IS NOT AN OVERSIGHT
 * ============================================================================
 *
 * BC017/BC104 refuse EXACTLY ONE condition: the scheduled start has NOT been
 * reached. A session whose start is behind us — this morning's, or last
 * Tuesday's — is fully assessable, and the governed test fixtures depend on
 * that (every seeded lifecycle in the project uses a past-dated session). So
 * the inert state is `future`, and `past` is a distinguishable but WORKING
 * state. Treating `past` as inert would invent a lock the spec does not have
 * and would break the trainer's ability to write up a class after it ended.
 */

/** The three derived states. Ordered as a trainer experiences them. */
export type SessionEligibility = "past" | "eligible" | "future";

export const SINGAPORE_TIME_ZONE = "Asia/Singapore";

/**
 * "Now", as the pinned Asia/Singapore clock sees it: the calendar date and the
 * minute of the day. Both are read out of one `Intl` formatting of one
 * `Date`, so the date and the time can never be taken from two different
 * instants across a midnight boundary.
 */
export type SingaporeInstant = {
  readonly isoDate: string;
  readonly minutesOfDay: number;
};

const PARTS_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: SINGAPORE_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function singaporeInstant(at: Date = new Date()): SingaporeInstant {
  const parts = new Map(
    PARTS_FORMAT.formatToParts(at).map((part) => [part.type, part.value]),
  );
  const isoDate = `${parts.get("year")}-${parts.get("month")}-${parts.get("day")}`;
  const minutesOfDay = Number(parts.get("hour")) * 60 + Number(parts.get("minute"));
  return { isoDate, minutesOfDay };
}

/**
 * Minutes-of-day for a `HH:MM` (or `HH:MM:SS`) clock time. An UNPARSEABLE or
 * MISSING time returns null rather than 0: the adapter reports a missing
 * `starts_at` as the empty string and never as an invented time, and treating
 * "unknown" as midnight would silently make an unscheduled session look
 * started. A null start is classified conservatively below.
 */
export function minutesOfClockTime(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/**
 * Classify one session against the pinned clock.
 *
 * A session with NO usable start time on a FUTURE date is `future`; on today
 * or earlier it is treated as started, because the database's own refusal is
 * keyed on `starts_at` and a session row carrying none cannot trip it. That is
 * the conservative direction: this module never renders an entry point inert
 * that the server would in fact accept.
 */
export function deriveSessionEligibility(
  session: { readonly date: string; readonly startTime: string },
  now: SingaporeInstant = singaporeInstant(),
): SessionEligibility {
  if (session.date > now.isoDate) return "future";
  if (session.date < now.isoDate) return "past";
  const start = minutesOfClockTime(session.startTime);
  if (start === null) return "eligible";
  return start > now.minutesOfDay ? "future" : "eligible";
}

/**
 * The visible treatment per state.
 *
 * COLOUR IS NEVER THE ONLY CARRIER (GLOBAL_UI_RULES §7, WCAG 2.2 SC 1.4.1).
 * Each state carries, independently of colour: a distinct TEXT label, a
 * distinct SHAPE glyph, and — where the state is inert — a governed reason
 * rendered as prose and associated programmatically with the control it
 * explains. A reader who cannot perceive the tints still receives all three
 * distinctions in words.
 */
export const SESSION_ELIGIBILITY_PRESENTATION: Readonly<
  Record<
    SessionEligibility,
    {
      readonly label: string;
      readonly glyph: string;
      readonly tone: "brand" | "success" | "neutral";
      readonly inert: boolean;
      /** Prose shown wherever the state disables an entry point. */
      readonly reason: string | null;
    }
  >
> = {
  past: {
    label: "Completed",
    glyph: "✓",
    tone: "neutral",
    inert: false,
    reason: null,
  },
  eligible: {
    label: "In session today",
    glyph: "●",
    tone: "success",
    inert: false,
    reason: null,
  },
  future: {
    label: "Not started yet",
    glyph: "◔",
    tone: "brand",
    inert: true,
    /*
     * The governed reason, in the trainer's words rather than the database's.
     * The server's own refusal is BC017/BC104 — "report: the scheduled session
     * start has not been reached" — and it stays authoritative; this is the
     * designed state that stops the trainer reaching it after nine ratings
     * (spec §15: failure and recovery are designed experiences, not generic
     * error banners).
     */
    reason:
      "This Class Session has not started yet. Assessment opens at its scheduled start time; the governed save refuses any earlier attempt.",
  },
};
