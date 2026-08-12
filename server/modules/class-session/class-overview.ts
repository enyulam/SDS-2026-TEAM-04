import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { readRows, type QueryOutcome } from "@/server/platform/query-diagnostics";

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
