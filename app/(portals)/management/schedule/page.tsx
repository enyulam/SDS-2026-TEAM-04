import { ManagementSchedule } from "@/features/management/management-schedule";

/**
 * Screen `25` Management Schedule, at its CANONICAL route
 * `/management/schedule` (`25-management-schedule/screen.md` §1).
 *
 * ⛔ No route is moved, renamed, redirected or aliased by this phase — one new
 * route at the ratified path, and nothing else.
 *
 * ⚠️ `?month=YYYY-MM` IS A VIEW SELECTOR AND NOTHING MORE. It chooses which
 * month the calendar opens on; it reaches no row RLS would otherwise refuse,
 * because the centre comes from the caller's own membership. The same
 * presentation-only reading `A-045` gives the `role` query parameter — and,
 * as there, it is NEVER authority. A malformed value is IGNORED rather than
 * corrected, so a bad link opens on today's month instead of a guessed one.
 */
export default async function ManagementSchedulePage({
  searchParams,
}: {
  readonly searchParams: Promise<{ readonly month?: string }>;
}) {
  const { month } = await searchParams;
  const valid = typeof month === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
  return <ManagementSchedule initialMonth={valid ? month : undefined} />;
}
