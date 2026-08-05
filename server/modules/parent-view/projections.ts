/**
 * Parent read projections — R-9 (submitted-report list), R-10 (availability)
 * and R-11 (canonical submitted detail) of contract §5.2.
 *
 * The parent boundary is UNCHANGED AND ABSOLUTE (A-021/A-038): every report
 * fact flows through `report_get_canonical` (RPC-13), which resolves
 * EXCLUSIVELY through `latest_submitted_version_id` — a trainer-approved-
 * but-unsubmitted version is unreachable BY CONSTRUCTION, not by a status
 * test — and returns exactly the four panels plus `submitted_at`. No
 * per-dimension rating grid, status value, hash, revision count or
 * correction fact of any kind exists in any shape this module returns, and
 * nothing here can disclose that a correction cycle is underway.
 *
 * Enumeration runs over the parent's OWN Step 7G scope: live
 * `parent_student_links`, the linked students, and their enrolled sessions.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActionResult } from "@/server/contracts/action-result";
import { mapSqlErrorToResult } from "@/server/contracts/action-result";
import { requireRole } from "@/server/modules/identity-access/session-core";
import { firstRow, type CanonicalReportRow } from "@/server/modules/report-workflow/rpc-types";

export interface ParentReportListItemDto {
  readonly studentId: string;
  readonly studentDisplayName: string;
  readonly sessionId: string;
  readonly sessionDate: string;
  readonly submittedAt: string;
}

export type AvailabilityState = "available" | "none_yet" | "linked_unavailable";

export interface CanonicalReportDto {
  readonly panels: {
    readonly todaysStrength: string;
    readonly nextFocus: string;
    readonly practiceSuggestion: string;
    readonly sessionTakeaway: string;
  };
  readonly submittedAt: string;
}

async function listLinkedStudents(
  client: SupabaseClient,
): Promise<Array<{ studentId: string; displayName: string }>> {
  const { data: links } = await client
    .from("parent_student_links")
    .select("student_id, is_active")
    .eq("is_active", true);
  const ids = ((links ?? []) as Array<{ student_id: string }>).map((l) => l.student_id);
  if (ids.length === 0) return [];
  const { data: students } = await client.from("students").select("id, full_name").in("id", ids);
  const names = new Map(
    ((students ?? []) as Array<{ id: string; full_name: string }>).map((s) => [s.id, s.full_name]),
  );
  return ids.map((id) => ({ studentId: id, displayName: names.get(id) ?? "Student" }));
}

// ---------------------------------------------------------------------
// R-9 — the submitted-report list
// ---------------------------------------------------------------------
export async function listParentReportsCore(
  client: SupabaseClient,
): Promise<ActionResult<readonly ParentReportListItemDto[]>> {
  const identity = await requireRole(client, "parent");
  if (identity.outcome !== "success") return identity;

  const out: ParentReportListItemDto[] = [];
  for (const student of await listLinkedStudents(client)) {
    const { data: enrolments } = await client
      .from("enrolments")
      .select("class_module_id")
      .eq("student_id", student.studentId);
    for (const enrolment of (enrolments ?? []) as Array<{ class_module_id: string }>) {
      const { data: sessions } = await client
        .from("class_sessions")
        .select("id, session_date")
        .eq("class_module_id", enrolment.class_module_id)
        .order("session_date", { ascending: true });
      for (const session of (sessions ?? []) as Array<{ id: string; session_date: string }>) {
        const { data, error } = await client.rpc("report_get_canonical", {
          p_class_session_id: session.id,
          p_student_id: student.studentId,
        });
        if (error) continue; // non-disclosing: an unreachable pair is simply absent
        const row = firstRow<CanonicalReportRow>(data);
        if (!row) continue; // zero rows = nothing submitted for this pair
        out.push({
          studentId: student.studentId,
          studentDisplayName: student.displayName,
          sessionId: session.id,
          sessionDate: session.session_date,
          submittedAt: row.submitted_at,
        });
      }
    }
  }
  return { outcome: "success", data: out };
}

// ---------------------------------------------------------------------
// R-10 — availability, expressed as a state
// ---------------------------------------------------------------------
export async function getParentAvailabilityCore(
  client: SupabaseClient,
): Promise<ActionResult<AvailabilityState>> {
  const identity = await requireRole(client, "parent");
  if (identity.outcome !== "success") return identity;

  const linked = await listLinkedStudents(client);
  if (linked.length === 0) return { outcome: "success", data: "none_yet" };
  const reports = await listParentReportsCore(client);
  if (reports.outcome !== "success") return reports;
  return {
    outcome: "success",
    data: reports.data.length > 0 ? "available" : "linked_unavailable",
  };
}

// ---------------------------------------------------------------------
// R-11 — the canonical submitted detail
// ---------------------------------------------------------------------
export async function getCanonicalReportCore(
  client: SupabaseClient,
  sessionId: string,
  studentId: string,
): Promise<ActionResult<CanonicalReportDto>> {
  // Any of the three roles may read the canonical version (A-030); the RPC
  // itself decides reach. No role pre-check here beyond authentication —
  // adding one would duplicate authority the database already owns.
  const { data, error } = await client.rpc("report_get_canonical", {
    p_class_session_id: sessionId,
    p_student_id: studentId,
  });
  if (error) return mapSqlErrorToResult(error.code, error.message);
  const row = firstRow<CanonicalReportRow>(data);
  if (!row) return { outcome: "unavailable" };
  return {
    outcome: "success",
    data: {
      panels: {
        todaysStrength: row.todays_strength,
        nextFocus: row.next_focus,
        practiceSuggestion: row.practice_suggestion,
        sessionTakeaway: row.session_takeaway,
      },
      submittedAt: row.submitted_at,
    },
  };
}
