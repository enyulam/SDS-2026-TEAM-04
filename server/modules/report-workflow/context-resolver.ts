/**
 * R-22 — the governed report-context resolver core.
 *
 * THE DEFECT THIS CLOSES. The frontend port declares three report-shaped
 * reads keyed by a REPORT IDENTIFIER — `getTrainerWorkingReport(reportId)`,
 * `getDraftGenerationContext(reportId)` and `getManagementReview(reportId)`
 * — while the governed reads behind them (`report_get_working`,
 * `report_get_management_review`) are keyed by the pair
 * `(p_class_session_id, p_student_id)`. Without a server-side translation
 * the real adapter could only be composed by having the CLIENT supply a
 * session id and a student id next to the report id, and a client-supplied
 * key is an unverified assertion about which report is meant. That is
 * prohibited: authority here is re-derived by the database from `auth.uid()`
 * on every call and is never carried in a parameter.
 *
 * MECHANISM. This core is a thin, non-deciding pass-through to the governed
 * boundary `public.report_resolve_context(p_report_id)`. It takes the
 * REQUEST-SCOPED authenticated client (the caller's own credential, hence
 * the `authenticated` database role and a resolving `auth.uid()`), and never
 * the elevated/service-role client — `server/platform/supabase/elevated.ts`
 * is not imported here and must never be. Every predicate is applied INSIDE
 * the database, per call, and is re-proved independently by whichever
 * governed read consumes the pair afterwards.
 *
 * THE ONLY INPUT IS THE GOVERNED REPORT IDENTIFIER plus the caller's live
 * session. No centre, session or student identifier is accepted from the
 * client, so a caller cannot pair a report it may read with a session or
 * student it may not.
 *
 * NON-DISCLOSURE. The RPC answers every denial — unknown id, wrong centre,
 * wrong role, inactive membership, a parent asking about a report that has
 * never been submitted — with the SAME zero-row result and no error. This
 * core maps that single outcome to the single non-disclosing `unauthorized`
 * result, exactly as `mapSqlErrorToResult` maps the database's own
 * "not found or not permitted" code. "No such report" and "not permitted"
 * are therefore byte-indistinguishable at the action boundary too.
 */

import type { ActionResult } from "@/server/contracts/action-result";
import { mapSqlErrorToResult } from "@/server/contracts/action-result";
import { firstRow, type RpcCaller } from "@/server/modules/report-workflow/rpc-types";
import type { Database } from "@/server/db/database.types";

/** The governed boundary's row shape — exactly two identifiers. */
export type ReportContextRow =
  Database["public"]["Functions"]["report_resolve_context"]["Returns"][number];

/**
 * The resolved pair. It carries NOTHING else — no status, lock version,
 * version id, hash, revision number, timestamp, rating, correction metadata
 * or centre id — because the boundary returns nothing else to carry.
 */
export interface ReportContextDto {
  readonly sessionId: string;
  readonly studentId: string;
}

/**
 * A malformed identifier is rejected BEFORE it reaches the database, and it
 * is rejected with the SAME `unauthorized` outcome as a well-formed id the
 * caller may not resolve. Letting it through would surface a driver-level
 * `invalid input syntax for type uuid` error, which is a distinguishable
 * answer and therefore a disclosure channel of its own.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function resolveReportContextCore(
  caller: RpcCaller,
  reportId: string,
): Promise<ActionResult<ReportContextDto>> {
  if (typeof reportId !== "string" || !UUID.test(reportId)) {
    return { outcome: "unauthorized" };
  }

  const { data, error } = await caller.rpc("report_resolve_context", {
    p_report_id: reportId,
  });
  if (error) return mapSqlErrorToResult(error.code, error.message);

  const row = firstRow<ReportContextRow>(data);
  // Zero rows is the one non-disclosing denial for every reason at once.
  if (!row || !row.class_session_id || !row.student_id) {
    return { outcome: "unauthorized" };
  }

  return {
    outcome: "success",
    data: { sessionId: row.class_session_id, studentId: row.student_id },
  };
}
