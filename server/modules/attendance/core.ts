/**
 * Attendance core — the server half of the governed Trainer Present/Absent
 * control (A-018, A-026; Operator ruling G-04 item 3, which classifies the
 * control as a GOVERNED FUNCTIONAL INSERTION on the existing Trainer roster
 * surface, not a new screen).
 *
 * There is exactly ONE write path, `public.attendance_set_status`, and this
 * module is a thin, non-authoritative wrapper over it. Every authorization
 * decision, every gate and the audit append live in the database:
 *
 *   * the actor is THE SINGLE active `trainer` membership of the caller's
 *     account in the SESSION'S OWN centre, with live session reach
 *     re-derived on each call — so management (A-034 forbids management
 *     touching attendance) and parent are closed by the same predicate that
 *     authorizes the trainer, and both receive the same non-disclosing
 *     answer;
 *   * A-018's Present default is materialized by the COLUMN DEFAULT, not by
 *     this file and not by the RPC body;
 *   * `attendance.changed` (registry E4 — the Step 7H registry is NOT
 *     extended) is appended in the SAME transaction as the write;
 *   * A-026's one governed refusal — a move to `absent` once a version has
 *     been submitted — is enforced there, not here.
 *
 * NOTHING IS RE-DECIDED HERE. This module validates only the SHAPE of its
 * own arguments, so a malformed call fails before a pointless round trip. It
 * adds no predicate, and removing it would cost a caller nothing it is
 * entitled to.
 *
 * ⚠️ `expectedStatus` is the caller's belief about the CURRENT record, and
 * `undefined` means "I believe there is no record yet". It is NOT optional in
 * the "leave it out if you don't care" sense: omitting it against a record
 * that exists is answered `stale_state`, exactly as a wrong value would be.
 * There is no force mode.
 */

import type { ActionResult } from "@/server/contracts/action-result";
import { mapSqlErrorToResult } from "@/server/contracts/action-result";
import { firstRow, type RpcCaller } from "@/server/modules/report-workflow/rpc-types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The complete two-value vocabulary (A-026). There is no third state. */
export const ATTENDANCE_STATUSES = ["present", "absent"] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export function isAttendanceStatus(value: unknown): value is AttendanceStatus {
  return typeof value === "string" && (ATTENDANCE_STATUSES as readonly string[]).includes(value);
}

export interface SetAttendanceStatusInput {
  readonly sessionId: string;
  readonly studentId: string;
  /** The caller's belief about the committed record; `undefined` = "no record yet". */
  readonly expectedStatus?: AttendanceStatus;
  readonly newStatus: AttendanceStatus;
}

export interface SetAttendanceStatusSuccess {
  readonly attendanceId: string;
  /** The status the DATABASE reports, never one asserted by TypeScript. */
  readonly status: AttendanceStatus;
  /** True when this call materialized A-018's Present default for the pair. */
  readonly initialized: boolean;
  /**
   * False when the call was a confirmed no-op — authorized, answered, and
   * deliberately NOT audited, because A-029 records governed ACTIONS and a
   * no-op is not one. A caller must not report "saved" on the strength of
   * `outcome: "success"` alone if it wants to distinguish the two.
   */
  readonly changed: boolean;
}

interface AttendanceSetRow {
  readonly attendance_id: string;
  readonly status: string;
  readonly initialized: boolean;
  readonly changed: boolean;
}

export async function setAttendanceStatusCore(
  db: RpcCaller,
  input: SetAttendanceStatusInput,
): Promise<ActionResult<SetAttendanceStatusSuccess>> {
  if (!UUID_RE.test(input.sessionId) || !UUID_RE.test(input.studentId)) {
    return { outcome: "validation", message: "The request was not valid.", fields: [] };
  }
  if (!isAttendanceStatus(input.newStatus)) {
    return { outcome: "validation", message: "The request was not valid.", fields: [] };
  }
  if (input.expectedStatus !== undefined && !isAttendanceStatus(input.expectedStatus)) {
    return { outcome: "validation", message: "The request was not valid.", fields: [] };
  }

  const { data, error } = await db.rpc("attendance_set_status", {
    p_class_session_id: input.sessionId,
    p_student_id: input.studentId,
    p_expected_status: input.expectedStatus ?? null,
    p_new_status: input.newStatus,
  });
  if (error) return mapSqlErrorToResult(error.code, error.message);

  const row = firstRow<AttendanceSetRow>(data);
  // A missing row after a non-error RPC is an integrity incident, not an
  // authorization outcome, and it is NOT smoothed over: returning a
  // fabricated success here is exactly the class of defect that let four
  // literal "undefined" panels commit green earlier in this project.
  if (!row || !isAttendanceStatus(row.status)) {
    return { outcome: "unexpected_failure", message: "The operation could not be completed." };
  }

  return {
    outcome: "success",
    data: {
      attendanceId: row.attendance_id,
      status: row.status,
      initialized: row.initialized === true,
      changed: row.changed === true,
    },
  };
}
