/**
 * THE DETERMINISTIC FIXTURE'S SESSION DATES, DERIVED FROM A PINNED REFERENCE.
 * (Run C3-A Phase 2b — the known dependency C2C-010 surfaced.)
 *
 * The three fixture sessions used to carry the absolute dates 2026-08-05,
 * 2026-08-07 and 2026-08-04. Their MEANING — "today", "a future session", "a
 * past session" — therefore drifted with the wall clock: on 2026-08-05 the
 * middle one was two days ahead; on 2026-08-08 all three were behind. Any
 * eligibility test written against them would have silently changed what it
 * asserted as time passed, and a test whose meaning moves is worse than no
 * test at all.
 *
 * The reference is the CURRENT instant on the SAME pinned Asia/Singapore clock
 * the governed RPCs compare against, and each session is expressed as an
 * OFFSET from it, so the three eligibility classes are stable forever:
 *
 *   TODAY, already started  ->  `eligible`. The start time is derived too — the
 *                               hour before the reference hour, clamped at
 *                               00:00 — so the session has ALWAYS begun, at
 *                               00:30 as much as at 23:30. A fixed "14:00"
 *                               would have read `future` every morning and
 *                               `eligible` every afternoon, which is exactly
 *                               the drift being removed.
 *   TOMORROW                ->  `future`, at every hour of every day.
 *   YESTERDAY               ->  `past`, at every hour of every day. Still
 *                               ASSESSABLE: BC017/BC104 refuse only a start not
 *                               yet reached.
 *
 * What is deterministic here is the RELATIONSHIP, which is the property under
 * test. The absolute dates were never what anything asserted; they only looked
 * stable.
 *
 * THE DERIVATION IS A PURE FUNCTION OF THE INSTANT, and that is deliberate. A
 * module-level constant would be computed once at import, so a test could only
 * ever exercise the hour it happened to run in — it could sweep a simulated day
 * and learn nothing, because the arms would still be pinned to the real load
 * hour. Taking the instant as a parameter lets the fixture pass the real clock
 * and a test pass 1440 simulated ones, both through the SAME code.
 *
 * It also lives OUTSIDE the fixture file so a test can read the three arms
 * without importing the fixture's browser-facing port class.
 */

import { singaporeInstant, type SingaporeInstant } from "@/lib/schedule/session-eligibility";

function offsetDays(reference: SingaporeInstant, days: number): string {
  const [year, month, day] = reference.isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

/** `HH:00` for the hour before the reference hour, clamped so it never wraps. */
function startedHour(reference: SingaporeInstant): string {
  const hour = Math.max(0, Math.floor(reference.minutesOfDay / 60) - 1);
  return `${String(hour).padStart(2, "0")}:00`;
}

function plusNinetyMinutes(clock: string): string {
  const [hours, minutes] = clock.split(":").map(Number);
  const total = Math.min(23 * 60 + 59, hours * 60 + minutes + 90);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export type FixtureSessionDates = {
  readonly eligible: { readonly date: string; readonly startTime: string; readonly endTime: string };
  readonly future: { readonly date: string; readonly startTime: string; readonly endTime: string };
  readonly past: { readonly date: string; readonly startTime: string; readonly endTime: string };
};

export function fixtureSessionDates(
  reference: SingaporeInstant = singaporeInstant(),
): FixtureSessionDates {
  const eligibleStart = startedHour(reference);
  return {
    eligible: {
      date: reference.isoDate,
      startTime: eligibleStart,
      endTime: plusNinetyMinutes(eligibleStart),
    },
    future: { date: offsetDays(reference, 1), startTime: "16:00", endTime: "17:30" },
    past: { date: offsetDays(reference, -1), startTime: "17:00", endTime: "18:30" },
  };
}

/** The three arms of one derivation, as a list, in the shape the classifier consumes. */
export function fixtureEligibilityArms(
  reference: SingaporeInstant = singaporeInstant(),
): readonly { readonly date: string; readonly startTime: string; readonly expected: string }[] {
  const dates = fixtureSessionDates(reference);
  return [
    { date: dates.eligible.date, startTime: dates.eligible.startTime, expected: "eligible" },
    { date: dates.future.date, startTime: dates.future.startTime, expected: "future" },
    { date: dates.past.date, startTime: dates.past.startTime, expected: "past" },
  ];
}
