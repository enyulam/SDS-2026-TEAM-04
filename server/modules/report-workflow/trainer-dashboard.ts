import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { readTrainerMyClassesCore, type TrainerClassCardDto } from "@/server/modules/class-session/trainer-my-classes";

/**
 * `P2-19` — screen `01` Trainer Dashboard.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ ONE GOVERNED READ ADDED, AND IT IS DELIBERATELY NOT `report_get_working`
 * ═══════════════════════════════════════════════════════════════════════════
 * `reports`, `report_versions` and `observations` are all `grants=0,
 * policies=0` — measured — so `Pending Reviews` and `My Recent Report` have no
 * path without a governed read. ▶ Everything else the screen needs is already
 * reachable, and **`P2-17`'s projection returns the classes and the learner
 * counts unchanged** (§12.10's eighth outing).
 *
 * ⛔ **`report_get_working` RETURNS FULL WORKING CONTENT**, and reusing it to
 * render two dashboard tiles would ship report **bodies** into a landing-page
 * payload — the `Q-27`-shaped error `P2-9` avoided one phase over.
 * `report_list_trainer_reports()` returns identifiers, a status and a
 * timestamp.
 *
 * ⚠️ **THE TRAINER AUTHORED THESE REPORTS**, so this is not a disclosure gate
 * — they can already read their own working content. ▶ What the read is
 * careful about is **volume and shape**: a landing page should carry the least
 * that answers it.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ TWO OF THE FRAME'S SIX REGIONS ARE REFUSED
 * ═══════════════════════════════════════════════════════════════════════════
 * 1. ⛔ **`My Recent Report`'s RATING CHIPS** — `Mastering` / `Beginning` /
 *    `Developing`, one per row. **`GC-7`**: *"this pack's own `screen.md` §8
 *    declares the screen **'Not rating-bearing'** … **DO NOT BUILD the rating
 *    column**."* ⚠️ **AND THE PROSE FALLS WITH THEM** — *"Mastered eye contact,
 *    clear projection"* and *"Beginning on pacing and flow"* are **ratings
 *    attributed in words** (`A-052`'s contextual-attribution shape), leaking
 *    the same fact in a form a chip-shaped check would miss.
 *    ▶ **A second, independent ground:** one chip standing for a whole report
 *    is a **roll-up**, which `G-2` excludes on every surface **regardless of
 *    audience**. The trainer authored the ratings — the point is that **no
 *    roll-up exists to render**.
 *    ✅ **What survives is a real surface:** learner, class, when — *what did
 *    I just send?*
 * 2. ⛔ **`Today's Schedule`'s `13:30 Staff Meeting · Staff Room`** — there is
 *    **no staff-meeting entity**. `A-016`: *"calendars are projections of
 *    class-session records … must not store separate duplicated event
 *    records."* Building it needs a second event entity, the shape `GC-13`
 *    barred on screen `25`. **`REGISTERED-OMISSION`, disclosed on the page.**
 *
 * ⚠️ **`Start Class` is NOT in that class** — it navigates to the session
 * roster, which exists and is live. A real control with a real destination.
 *
 * ⚠️ **The frame's calendar reads `March 2035`** — a frame artefact nine years
 * out, not a requirement. The built calendar shows real months.
 *
 * MEASURED VALUES (from the `.html`): KPI card `padding 17px`, `radius 16px`,
 * `1px #EDEFF4`; KPI label `11.50px/500 #8A93A6`, value `22px/700 #1B2A4A`.
 * The "now" schedule row is navy `#1B2A4A` with white `12.50px/600` and
 * `#FCE7F0 10.50px/500`; its `Start Class` chip is `110×40`, `radius 11px`,
 * `#FCE7F0` on `#1B2A4A` text at `13px/600`. Other rows sit on `#F5F6FA` at
 * `radius 12px`.
 */

export interface TrainerRecentReportDto {
  readonly reportId: string;
  readonly classSessionId: string;
  readonly studentId: string;
  readonly studentName: string;
  readonly classLabel: string;
  readonly sessionDate: string;
  /** ⛔ A LIFECYCLE STATUS, never a rating. */
  readonly reportState: string;
  readonly updatedAt: string;
}

export interface TrainerTodaySessionDto {
  readonly classSessionId: string;
  readonly classLabel: string;
  readonly startsAt: string | null;
  readonly room: string | null;
  /** True for the session whose window contains now — the frame's navy row. */
  readonly isNow: boolean;
}

export interface TrainerDashboardDto {
  readonly displayName: string | null;
  readonly classCount: number;
  readonly studentCount: number;
  /** Reports awaiting THIS trainer's action: `draft_ready` + `needs_edit`. */
  readonly pendingReviews: number;
  readonly classes: readonly TrainerClassCardDto[];
  readonly recent: readonly TrainerRecentReportDto[];
  readonly today: readonly TrainerTodaySessionDto[];
  /** Session dates in the displayed month — the calendar's dots. */
  readonly monthSessionDates: readonly string[];
  readonly monthLabel: string;
}

type ReportRow = {
  report_id: string;
  class_session_id: string;
  session_date: string;
  student_id: string;
  student_name: string;
  class_label: string;
  report_state: string;
  updated_at: string;
};

/** ⛔ Reports the trainer still has to act on. */
const PENDING = new Set(["draft_ready", "needs_edit"]);

export async function readTrainerDashboardCore(
  client: SupabaseClient,
  nowIso: string,
): Promise<{ readonly ok: true; readonly data: TrainerDashboardDto } | { readonly ok: false }> {
  const todayIso = nowIso.slice(0, 10);

  const [classes, reports, account] = await Promise.all([
    /*
     * ⛔ REUSED WHOLE, NOT RE-DERIVED. `P2-17` already answers "which classes,
     * how many learners" through the same assignment spine (`A-016`), so a
     * second query here would be a second definition of a trainer's own class
     * list — free to disagree with screen `02` about what they teach.
     */
    readTrainerMyClassesCore(client, todayIso, null),
    client.rpc("report_list_trainer_reports"),
    client.from("accounts").select("display_name").limit(1).maybeSingle(),
  ]);

  if (!classes.ok) return { ok: false };
  const reportRows = (reports.data ?? []) as ReportRow[];

  /*
   * ⚠️ THE CLASS LIST IS TERM-SCOPED AND THE DASHBOARD IS NOT.
   * `readTrainerMyClassesCore` filters to one term; the counts here are the
   * frame's `My Classes` and `Total Students`, which read as "what I teach",
   * not "what I teach this term". ▶ Passing `null` takes the term containing
   * today, which is the same default screen `02` opens on — so the two
   * surfaces agree, which matters more than either reading in isolation.
   */
  const cards = classes.data.cards;

  const today = await readTodaySessions(client, todayIso, nowIso);
  const monthDates = await readMonthSessionDates(client, todayIso);
  const distinctLearners = await countDistinctLearners(client, cards.map((c) => c.classModuleId));

  return {
    ok: true,
    data: {
      displayName: ((account.data as { display_name: string | null } | null)?.display_name ?? "").trim() || null,
      classCount: cards.length,
      /*
       * ⛔ DISTINCT LEARNERS, not the sum of per-class counts.
       *
       * ⚠️ THE FIRST DRAFT OF THIS LINE WAS `cards.reduce((n, c) => n +
       * c.studentCount, 0)` — **under this exact comment**, which already named
       * the hazard. A learner enrolled in two of this trainer's modules is ONE
       * student, and summing reports a roster larger than the academy has.
       * ▶ **A correct comment sitting on incorrect code is worse than no
       * comment**: it reads as a decision already taken, so the next reader
       * checks the reasoning rather than the arithmetic.
       */
      studentCount: distinctLearners,
      pendingReviews: reportRows.filter((r) => PENDING.has(r.report_state)).length,
      classes: cards,
      /*
       * ⛔ THREE ROWS, matching the frame. The read returns them already
       * ordered by `updated_at DESC` inside the database.
       */
      recent: reportRows.slice(0, 3).map((r) => ({
        reportId: r.report_id,
        classSessionId: r.class_session_id,
        studentId: r.student_id,
        studentName: r.student_name,
        classLabel: r.class_label,
        sessionDate: r.session_date,
        reportState: r.report_state,
        updatedAt: r.updated_at,
      })),
      today,
      monthSessionDates: monthDates,
      monthLabel: new Date(`${todayIso}T00:00:00Z`).toLocaleDateString("en-SG", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }),
    },
  };
}

/**
 * ⛔ DISTINCT `student_id` ACROSS THE TRAINER'S MODULES.
 *
 * ⚠️ The per-card counts cannot be summed, because a learner enrolled in two
 * of this trainer's modules would be counted twice. ▶ The fixture makes this
 * measurable rather than theoretical: 13 learners exist and the per-card counts
 * sum higher, so the two readings genuinely differ here.
 */
async function countDistinctLearners(
  client: SupabaseClient,
  moduleIds: readonly string[],
): Promise<number> {
  if (moduleIds.length === 0) return 0;
  const rows = await client
    .from("enrolments")
    .select("student_id")
    .in("class_module_id", [...moduleIds])
    .eq("is_active", true);
  return new Set(((rows.data ?? []) as { student_id: string }[]).map((r) => r.student_id)).size;
}

async function readTodaySessions(
  client: SupabaseClient,
  todayIso: string,
  nowIso: string,
): Promise<readonly TrainerTodaySessionDto[]> {
  const assignments = await client
    .from("class_session_assignments")
    .select("class_session_id")
    .eq("is_active", true);
  const ids = ((assignments.data ?? []) as { class_session_id: string }[]).map((a) => a.class_session_id);
  if (ids.length === 0) return [];

  const sessions = await client
    .from("class_sessions")
    .select("id, class_module_id, starts_at, ends_at, room")
    .in("id", ids)
    .eq("session_date", todayIso)
    .order("starts_at");
  const rows = (sessions.data ?? []) as {
    id: string;
    class_module_id: string;
    starts_at: string | null;
    ends_at: string | null;
    room: string | null;
  }[];
  if (rows.length === 0) return [];

  const modules = await client
    .from("class_modules")
    .select("id, title, class_grade_id")
    .in("id", [...new Set(rows.map((r) => r.class_module_id))]);
  const modRows = (modules.data ?? []) as { id: string; title: string; class_grade_id: string }[];
  const grades = await client
    .from("class_grades")
    .select("id, display_name")
    .in("id", [...new Set(modRows.map((m) => m.class_grade_id))]);
  const gradeById = new Map(
    ((grades.data ?? []) as { id: string; display_name: string }[]).map((g) => [g.id, g.display_name]),
  );
  const modById = new Map(modRows.map((m) => [m.id, m]));

  const clock = nowIso.slice(11, 19);
  return rows.map((r) => {
    const mod = modById.get(r.class_module_id);
    const grade = mod ? (gradeById.get(mod.class_grade_id) ?? "") : "";
    return {
      classSessionId: r.id,
      classLabel: [grade, mod?.title ?? ""].filter((v) => v.length > 0).join(" · "),
      startsAt: r.starts_at,
      room: r.room,
      /*
       * ⛔ "NOW" IS A MEASURED WINDOW, NOT THE FIRST ROW. The frame highlights
       * one row and labels it `Now`; picking the first would label a finished
       * 08:00 class as in progress at 15:00.
       */
      isNow: r.starts_at !== null && r.ends_at !== null && r.starts_at <= clock && clock < r.ends_at,
    };
  });
}

async function readMonthSessionDates(
  client: SupabaseClient,
  todayIso: string,
): Promise<readonly string[]> {
  const first = `${todayIso.slice(0, 7)}-01`;
  const d = new Date(`${first}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + 1);
  const nextFirst = d.toISOString().slice(0, 10);

  const assignments = await client
    .from("class_session_assignments")
    .select("class_session_id")
    .eq("is_active", true);
  const ids = ((assignments.data ?? []) as { class_session_id: string }[]).map((a) => a.class_session_id);
  if (ids.length === 0) return [];

  const sessions = await client
    .from("class_sessions")
    .select("session_date")
    .in("id", ids)
    .gte("session_date", first)
    .lt("session_date", nextFirst);
  return [...new Set(((sessions.data ?? []) as { session_date: string }[]).map((s) => s.session_date))].sort();
}
