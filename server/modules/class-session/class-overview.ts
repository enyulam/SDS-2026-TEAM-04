import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { readMaybeRow, readRows, type QueryOutcome } from "@/server/platform/query-diagnostics";

/*
 * ⛔ THE FOUR CONDITIONS LIVE IN `lib/shared/class-health.ts`, NOT HERE. They
 * were declared in this file first, and the deterministic fixture then needed
 * the same verdict — which it cannot import, because this module is
 * `server-only`. ▶ Two copies of a ratified closed set is how one surface
 * quietly gains a fifth condition, so it was EXTRACTED rather than repeated.
 */
export { classHealthVerdict } from "@/lib/shared/class-health";

/**
 * `P2-4` — screen `13` Management Class Overview.
 *
 * ⛔ EVERYTHING HERE COMES THROUGH TWO REVIEWED `SECURITY DEFINER` RPCs, and
 * that is not a style choice. `reports`, `observations` and `report_evidence`
 * carry **zero policies and zero client grants**, measured at HEAD — so
 * unlike screen `12`, this surface cannot be a direct RLS-scoped read. The
 * class-shaped data (module, sessions, trainers) still is.
 *
 * ⛔ WHAT NEVER ARRIVES HERE, and is enforced in the database rather than by
 * this file's good behaviour: panel text, trainer notes, checklist or
 * approval internals, a content hash, and **any rating at all** (`C-9` keeps
 * `D-1`'s nine per-dimension ratings on report DETAIL surfaces; `G-2` bars
 * every roll-up everywhere). Migration assertion `V-4` fails the build if
 * either RPC so much as names one.
 */

export type ClassOverviewSessionDto = {
  readonly classSessionId: string;
  readonly sessionDate: string;
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
  readonly reportedCount: number;
  readonly submittedCount: number;
  readonly learnerCount: number;
};

export type ClassOverviewRowDto = {
  readonly classSessionId: string;
  readonly sessionDate: string;
  /**
   * ⚠️ CARRIED ON EVERY ROW, and NULL where not recorded (hero 0B). The
   * first draft summarised sessions from a row type that did not carry these
   * at all, so the timeline would have rendered a permanently null lesson --
   * an invented "Lesson 1" is exactly what hero 0B forbids, and a silently
   * null one is how you end up writing it.
   */
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
  readonly studentId: string;
  readonly studentDisplayName: string;
  readonly reportId: string | null;
  /** ⚠️ NULL means **No Report** — never "not started", never a dash. */
  readonly reportState: string | null;
  readonly evidenceCount: number;
};

/**
 * The Class Health Summary `CLAUDE.md` §6 mandates and the frame omits
 * (`C-17`).
 *
 * ⛔ `mainFollowUpArea` IS ONE STRING, BY OPERATOR RULING. The winning tag is
 * computed **inside the database** so that no per-child `focus_chips` ever
 * crosses the boundary: *"Minimise what crosses the boundary, not what is
 * displayed."* ⚠️ Returning the underlying tags for a "richer breakdown" is
 * **prohibited** and is a §12 stop-and-ask, not an enhancement.
 */
export type ClassHealthDto = {
  readonly pendingReports: number;
  readonly evidenceMissing: number;
  readonly submittedReports: number;
  readonly totalReports: number;
  readonly mainFollowUpArea: string | null;
};

type StatusRow = {
  class_session_id: string;
  session_date: string;
  lesson_number: number | null;
  lesson_title: string | null;
  student_id: string;
  student_display_name: string;
  report_id: string | null;
  report_state: string | null;
  evidence_count: number;
};

type HealthRow = {
  pending_reports: number;
  evidence_missing: number;
  submitted_reports: number;
  total_reports: number;
  main_follow_up_area: string | null;
};

/**
 * The per-session, per-learner status grid behind `A-038`'s row gating.
 *
 * ⛔ THE SPINE FAILS CLOSED. A rejected call is `{ ok: false }`, never an
 * empty class — rendering "no learners" over a refused read would tell
 * management the roster is empty when it is merely unreadable (`Q-7`).
 */
export async function readClassStatusRowsCore(
  client: SupabaseClient,
  classModuleId: string,
): Promise<QueryOutcome<readonly ClassOverviewRowDto[]>> {
  const found = await readRows<StatusRow>("readClassStatusRowsCore", () =>
    client.rpc("report_list_management_class_status", { p_class_module_id: classModuleId }),
  );
  if (!found.ok) return { ok: false };
  return {
    ok: true,
    rows: found.rows.map((row) => ({
      classSessionId: row.class_session_id,
      sessionDate: row.session_date,
      lessonNumber: row.lesson_number,
      lessonTitle: row.lesson_title,
      studentId: row.student_id,
      studentDisplayName: row.student_display_name,
      reportId: row.report_id,
      reportState: row.report_state,
      evidenceCount: row.evidence_count,
    })),
  };
}

export async function readClassHealthCore(
  client: SupabaseClient,
  classModuleId: string,
): Promise<QueryOutcome<ClassHealthDto | null>> {
  const found = await readRows<HealthRow>("readClassHealthCore", () =>
    client.rpc("report_class_health_summary", { p_class_module_id: classModuleId }),
  );
  if (!found.ok) return { ok: false };
  const row = found.rows[0];
  // ⚠️ ZERO ROWS IS A REFUSAL OR AN UNKNOWN MODULE, deliberately
  // indistinguishable, and it resolves to `null` rather than to a summary of
  // zeroes. A fabricated "0 pending, 0 missing" would render condition 4 —
  // "On Track — all reports and evidence complete" — over a class the caller
  // could not read at all.
  return { ok: true, rows: row === undefined ? null : {
    pendingReports: row.pending_reports,
    evidenceMissing: row.evidence_missing,
    submittedReports: row.submitted_reports,
    totalReports: row.total_reports,
    mainFollowUpArea: row.main_follow_up_area,
  } };
}

/**
 * ═════════════════════════════════════════════════════════════════════════
 * THE FRAME'S HEADER CARD AND ITS TWO STAT TILES (rebuild, 2026-08-13)
 * ═════════════════════════════════════════════════════════════════════════
 * ⚠️ NO MIGRATION AND NO RPC. `class_modules`, `class_grades`,
 * `class_sessions`, `class_session_assignments`, `enrolments` and
 * **`attendance`** each carry a management SELECT policy AND a matching
 * `authenticated` SELECT grant, **measured at HEAD before this was written**
 * (`attendance_select_management` is centre-scoped through
 * `app_has_active_membership`). ▶ That is why this is a direct RLS-scoped
 * read like screen `12`, while the report grid above needs the two
 * `SECURITY DEFINER` reads: `reports` and `observations` carry **zero**
 * policies and **zero** grants.
 *
 * ⛔ EVERY FIELD IS `null` WHERE NOT RECORDED, AND THE SURFACE OMITS THE
 * ELEMENT (hero 0B). A class with no attendance rows has **no attendance
 * tile** — never `0%`, which is a measured fact about a class nobody
 * attended, and never `—`.
 */
export type ClassHeaderDto = {
  readonly classModuleId: string;
  readonly title: string;
  readonly classGradeLabel: string | null;
  readonly isActive: boolean;
  /** Distinct weekdays the module actually meets, derived from session dates. */
  readonly meetingDays: readonly string[];
  /** Only where EVERY session agrees; otherwise `null` and the segment is omitted. */
  readonly startTime: string | null;
  readonly endTime: string | null;
  readonly room: string | null;
  readonly learnerCount: number;
  /** `null` when NO attendance has been recorded at all — not `0`. */
  readonly attendancePercent: number | null;
  readonly trainerDisplayNames: readonly string[];
};

interface ModuleRow {
  readonly id: string;
  readonly title: string;
  readonly class_grade_id: string;
  readonly is_active: boolean;
}

interface GradeRow {
  readonly id: string;
  readonly display_name: string;
}

interface HeaderSessionRow {
  readonly id: string;
  readonly session_date: string;
  readonly starts_at: string | null;
  readonly ends_at: string | null;
  readonly room: string | null;
}

interface AttendanceRow {
  readonly status: string;
}

interface EnrolmentRow {
  readonly student_id: string;
}

interface AssignmentRow {
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

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** One value where every session agrees, otherwise `null`. */
function agreed<T>(values: readonly (T | null)[]): T | null {
  const present = values.filter((value): value is T => value !== null && value !== "");
  if (present.length === 0 || present.length !== values.length) return null;
  const distinct = new Set(present);
  return distinct.size === 1 ? present[0] : null;
}

export async function readClassHeaderCore(
  client: SupabaseClient,
  classModuleId: string,
): Promise<QueryOutcome<ClassHeaderDto | null>> {
  const classModule = await readMaybeRow<ModuleRow>("readClassHeaderCore:class_modules", () =>
    client.from("class_modules").select("id, title, class_grade_id, is_active").eq("id", classModuleId),
  );
  if (!classModule.ok) return { ok: false };
  // ⚠️ "No such module" and "not your centre" are ONE value, deliberately.
  if (!classModule.rows) return { ok: true, rows: null };

  const grade = await readMaybeRow<GradeRow>("readClassHeaderCore:class_grades", () =>
    client.from("class_grades").select("id, display_name").eq("id", classModule.rows!.class_grade_id),
  );
  if (!grade.ok) return { ok: false };

  const sessions = await readRows<HeaderSessionRow>("readClassHeaderCore:class_sessions", () =>
    client
      .from("class_sessions")
      .select("id, session_date, starts_at, ends_at, room")
      .eq("class_module_id", classModuleId)
      .order("session_date", { ascending: true }),
  );
  if (!sessions.ok) return { ok: false };

  const enrolments = await readRows<EnrolmentRow>("readClassHeaderCore:enrolments", () =>
    client.from("enrolments").select("student_id").eq("class_module_id", classModuleId).eq("is_active", true),
  );
  if (!enrolments.ok) return { ok: false };

  const attendance = await readRows<AttendanceRow>("readClassHeaderCore:attendance", () =>
    client.from("attendance").select("status").eq("class_module_id", classModuleId),
  );
  if (!attendance.ok) return { ok: false };

  const trainers = await readTrainerNames(
    client,
    sessions.rows.map((row) => row.id),
  );

  const present = attendance.rows.filter((row) => row.status === "present").length;

  return {
    ok: true,
    rows: {
      classModuleId: classModule.rows.id,
      title: classModule.rows.title,
      classGradeLabel: grade.rows ? grade.rows.display_name : null,
      isActive: classModule.rows.is_active,
      meetingDays: [
        ...new Set(sessions.rows.map((row) => WEEKDAYS[new Date(`${row.session_date}T00:00:00Z`).getUTCDay()])),
      ],
      startTime: agreed(sessions.rows.map((row) => (row.starts_at ? row.starts_at.slice(0, 5) : null))),
      endTime: agreed(sessions.rows.map((row) => (row.ends_at ? row.ends_at.slice(0, 5) : null))),
      room: agreed(sessions.rows.map((row) => row.room)),
      learnerCount: new Set(enrolments.rows.map((row) => row.student_id)).size,
      /*
       * ⛔ ZERO ATTENDANCE ROWS IS `null`, NOT `0`. `0%` asserts that a class
       * met and nobody came; `null` says nothing was recorded, and hero 0B
       * makes the surface omit the tile entirely rather than invent either.
       */
      attendancePercent:
        attendance.rows.length === 0 ? null : Math.round((present / attendance.rows.length) * 100),
      trainerDisplayNames: trainers,
    },
  };
}

/**
 * ⚠️ EVERY DISTINCT TRAINER ACROSS THIS MODULE'S SESSIONS, not one.
 * `A-016` makes assignment authoritative at CLASS-SESSION level, so a module
 * legitimately carries different trainers on different sessions. The frame
 * draws one name because its synthetic class has one; the rule is the plural.
 * ⚠️ The chain FAILS SOFT — an unresolvable name is omitted and the class
 * still renders.
 */
async function readTrainerNames(
  client: SupabaseClient,
  sessionIds: readonly string[],
): Promise<readonly string[]> {
  if (sessionIds.length === 0) return [];
  const assignments = await readRows<AssignmentRow>("readClassHeaderCore:class_session_assignments", () =>
    client
      .from("class_session_assignments")
      .select("trainer_membership_id")
      .eq("is_active", true)
      .in("class_session_id", sessionIds),
  );
  if (!assignments.ok || assignments.rows.length === 0) return [];

  const membershipIds = [...new Set(assignments.rows.map((row) => row.trainer_membership_id))];
  const memberships = await readRows<MembershipRow>("readClassHeaderCore:centre_memberships", () =>
    client.from("centre_memberships").select("id, account_id").in("id", membershipIds),
  );
  if (!memberships.ok || memberships.rows.length === 0) return [];

  const accounts = await readRows<AccountRow>("readClassHeaderCore:accounts", () =>
    client.from("accounts").select("id, display_name").in("id", memberships.rows.map((row) => row.account_id)),
  );
  if (!accounts.ok) return [];
  return [
    ...new Set(
      accounts.rows
        .map((row) => row.display_name)
        .filter((name): name is string => typeof name === "string" && name.length > 0),
    ),
  ];
}

/**
 * Collapse the status grid into the frame's weekly lesson timeline.
 *
 * ⚠️ `reportedCount` and `submittedCount` are DIFFERENT NUMBERS and both are
 * carried: the frame draws "reports sent", which is the submitted figure, but
 * the summary's four conditions branch on how many are still pending. One
 * number could not serve both.
 */
export function summariseSessions(
  rows: readonly ClassOverviewRowDto[],
): readonly ClassOverviewSessionDto[] {
  const bySession = new Map<string, ClassOverviewSessionDto>();
  for (const row of rows) {
    const seen = bySession.get(row.classSessionId);
    const next: ClassOverviewSessionDto = {
      classSessionId: row.classSessionId,
      sessionDate: row.sessionDate,
      lessonNumber: row.lessonNumber,
      lessonTitle: row.lessonTitle,
      learnerCount: (seen?.learnerCount ?? 0) + 1,
      reportedCount: (seen?.reportedCount ?? 0) + (row.reportId === null ? 0 : 1),
      submittedCount: (seen?.submittedCount ?? 0) + (row.reportState === "submitted" ? 1 : 0),
    };
    bySession.set(row.classSessionId, next);
  }
  return [...bySession.values()];
}
