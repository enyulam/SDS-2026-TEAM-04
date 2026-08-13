import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { readRows, type QueryOutcome } from "@/server/platform/query-diagnostics";

/**
 * `P2-5` — screen `25` Management Schedule.
 *
 * ═════════════════════════════════════════════════════════════════════════
 * ⛔ THIS IS A PROJECTION. THERE IS NO CALENDAR TABLE AND NONE MAY BE MADE.
 * ═════════════════════════════════════════════════════════════════════════
 * `A-016`: *"calendars are projections of class-session records and their
 * assignments"*, and *"management and trainer calendars must not store
 * separate duplicated event records."* `GC-13` carries the same bar. Every
 * value below is READ from `class_sessions` and its existing relations; this
 * module creates, caches and denormalizes nothing.
 *
 * ⚠️ NO MIGRATION AND NO SCHEMA CHANGE — MEASURED AT HEAD BEFORE A LINE WAS
 * WRITTEN, at BOTH layers. `class_sessions`, `class_modules`, `class_grades`,
 * `class_session_assignments`, `centre_memberships` and `accounts` each carry
 * a management `SELECT` policy AND a matching `authenticated` `SELECT` grant
 * (`class_sessions_select_management` is centre-scoped through
 * `app_has_active_membership`). ▶ That is why this is a direct RLS-scoped
 * read like screen `12`, and not the two `SECURITY DEFINER` reads screen `13`
 * needed — there, `reports` and `observations` carry zero of both.
 *
 * ⛔ NOTHING HERE IS AN ASSESSMENT FACT. No rating, roll-up, average,
 * observation, attendance value, evidence reference, trainer note, checklist
 * value, content hash or report status — `C-9` bars per-dimension ratings
 * from a list surface and `G-2` bars every roll-up everywhere, so there is no
 * field one could arrive in.
 */

/**
 * One dated class session, as the calendar sees it.
 *
 * ⛔ `room`, `startTime` and `endTime` are `null` WHERE NOT RECORDED and the
 * surface OMITS the element (hero 0B). Measured at HEAD: `room` is NULL on
 * all 17 fixture sessions, so the frame's `Studio 2` row is simply absent —
 * never `—`, never `TBD`, and never an invented default. The COLUMN exists;
 * the VALUE does not.
 */
export type ScheduleSessionDto = {
  readonly classSessionId: string;
  readonly classModuleId: string;
  readonly sessionDate: string;
  readonly startTime: string | null;
  readonly endTime: string | null;
  readonly room: string | null;
  readonly moduleTitle: string;
  readonly classGradeLabel: string | null;
  /**
   * The DISTINCT trainers assigned to THIS session.
   *
   * ⛔ Plural because `A-016` makes assignment authoritative at class-session
   * level — NEVER because one of them could be an assistant. `trainer_role`
   * is typed `centre_membership_role`, whose only values are `management`,
   * `trainer` and `parent`: an assistant is not merely deferred here, it is
   * STRUCTURALLY INEXPRESSIBLE. See the `Assist.` omission in the component.
   */
  readonly trainerDisplayNames: readonly string[];
};

export type ScheduleDto = {
  /** Sessions inside the requested window, ascending by date then start time. */
  readonly sessions: readonly ScheduleSessionDto[];
  /**
   * Every `YYYY-MM` in which this centre has at least one session.
   *
   * ⚠️ THIS IS WHY THE MONTH CONTROL OFFERS WHAT IT OFFERS. The frame draws a
   * chevron beside `March 2035` and enumerates NO options — the same shape as
   * screen `12`'s `···`, whose ruling was *"build the affordance, and if its
   * contents are undefined by the frame, it opens to nothing rather than to
   * invented items."* ▶ Here the contents are NOT invented: every entry is a
   * month this centre demonstrably has sessions in, derived from the rows
   * themselves. A month list assembled from a guessed range would be the
   * invention that ruling bars.
   */
  readonly monthsWithSessions: readonly string[];
};

interface SessionRow {
  readonly id: string;
  readonly class_module_id: string;
  readonly session_date: string;
  readonly starts_at: string | null;
  readonly ends_at: string | null;
  readonly room: string | null;
}

interface ModuleRow {
  readonly id: string;
  readonly title: string;
  readonly class_grade_id: string;
}

interface GradeRow {
  readonly id: string;
  readonly display_name: string;
}

interface AssignmentRow {
  readonly class_session_id: string;
  readonly trainer_membership_id: string;
}

interface MembershipRow {
  readonly id: string;
  readonly account_id: string;
}

interface AccountRow {
  readonly id: string;
  readonly display_name: string | null;
}

interface DateOnlyRow {
  readonly session_date: string;
}

/**
 * The centre's sessions between two dates, plus the months that hold any.
 *
 * ⚠️ TWO READS OVER `class_sessions`, AND THE SECOND IS DELIBERATE. The
 * ranged read backs the visible grid; the date-only read backs the month
 * control. Deriving the month list from the ranged rows would offer only
 * months already being looked at, which makes the control useless — and
 * widening the range to "everything" would pull every session's full row
 * into memory to render one. ▶ The cost is a second query returning ONE
 * column; the alternative is an aggregate, which would need an RPC, which
 * would need a migration, which this phase does not have.
 */
export async function readCentreScheduleCore(
  client: SupabaseClient,
  fromDate: string,
  toDate: string,
): Promise<QueryOutcome<ScheduleDto>> {
  const sessions = await readRows<SessionRow>("readCentreScheduleCore:class_sessions", () =>
    client
      .from("class_sessions")
      .select("id, class_module_id, session_date, starts_at, ends_at, room")
      .gte("session_date", fromDate)
      .lte("session_date", toDate)
      .order("session_date", { ascending: true })
      .order("starts_at", { ascending: true, nullsFirst: false }),
  );
  if (!sessions.ok) return { ok: false };

  const allDates = await readRows<DateOnlyRow>("readCentreScheduleCore:month_index", () =>
    client.from("class_sessions").select("session_date").order("session_date", { ascending: true }),
  );
  if (!allDates.ok) return { ok: false };
  const monthsWithSessions = [...new Set(allDates.rows.map((row) => row.session_date.slice(0, 7)))];

  if (sessions.rows.length === 0) {
    return { ok: true, rows: { sessions: [], monthsWithSessions } };
  }

  const moduleIds = [...new Set(sessions.rows.map((row) => row.class_module_id))];
  const modules = await readRows<ModuleRow>("readCentreScheduleCore:class_modules", () =>
    client.from("class_modules").select("id, title, class_grade_id").in("id", moduleIds),
  );
  if (!modules.ok) return { ok: false };
  const moduleById = new Map(modules.rows.map((row) => [row.id, row]));

  const grades = await readRows<GradeRow>("readCentreScheduleCore:class_grades", () =>
    client
      .from("class_grades")
      .select("id, display_name")
      .in("id", [...new Set(modules.rows.map((row) => row.class_grade_id))]),
  );
  if (!grades.ok) return { ok: false };
  const gradeById = new Map(grades.rows.map((row) => [row.id, row.display_name]));

  const assignments = await readRows<AssignmentRow>("readCentreScheduleCore:assignments", () =>
    client
      .from("class_session_assignments")
      .select("class_session_id, trainer_membership_id")
      .in("class_session_id", sessions.rows.map((row) => row.id))
      .eq("is_active", true),
  );
  if (!assignments.ok) return { ok: false };

  const nameByMembership = new Map<string, string>();
  if (assignments.rows.length > 0) {
    const memberships = await readRows<MembershipRow>("readCentreScheduleCore:memberships", () =>
      client
        .from("centre_memberships")
        .select("id, account_id")
        .in("id", [...new Set(assignments.rows.map((row) => row.trainer_membership_id))]),
    );
    if (!memberships.ok) return { ok: false };
    const accounts = await readRows<AccountRow>("readCentreScheduleCore:accounts", () =>
      client
        .from("accounts")
        .select("id, display_name")
        .in("id", [...new Set(memberships.rows.map((row) => row.account_id))]),
    );
    if (!accounts.ok) return { ok: false };
    const nameByAccount = new Map(accounts.rows.map((row) => [row.id, row.display_name]));
    for (const membership of memberships.rows) {
      const name = nameByAccount.get(membership.account_id);
      /*
       * ⛔ A membership whose account name is unreadable contributes NOTHING,
       * never a placeholder. An assignment the reader cannot resolve is an
       * unknown trainer; rendering `—` beside a real session would state that
       * nobody is assigned, which is a different governed fact.
       */
      if (name) nameByMembership.set(membership.id, name);
    }
  }

  const namesBySession = new Map<string, string[]>();
  for (const assignment of assignments.rows) {
    const name = nameByMembership.get(assignment.trainer_membership_id);
    if (!name) continue;
    const list = namesBySession.get(assignment.class_session_id) ?? [];
    if (!list.includes(name)) list.push(name);
    namesBySession.set(assignment.class_session_id, list);
  }

  const projected: ScheduleSessionDto[] = sessions.rows.map((row) => {
    const classModule = moduleById.get(row.class_module_id);
    return {
      classSessionId: row.id,
      classModuleId: row.class_module_id,
      sessionDate: row.session_date,
      startTime: row.starts_at,
      endTime: row.ends_at,
      room: row.room,
      /*
       * ⚠️ A module whose row did not come back is rendered by its ABSENCE of
       * a title, not by a fabricated one. It cannot normally happen — the
       * session's own policy already proved the centre — but "cannot happen"
       * is not a reason to write a value nobody read.
       */
      moduleTitle: classModule?.title ?? "",
      classGradeLabel: classModule ? gradeById.get(classModule.class_grade_id) ?? null : null,
      trainerDisplayNames: namesBySession.get(row.id) ?? [],
    };
  });

  return { ok: true, rows: { sessions: projected, monthsWithSessions } };
}
