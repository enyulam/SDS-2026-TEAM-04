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
 *
 * ---------------------------------------------------------------------
 * R-C2-6 — THE PARENT DENIAL IS ONE ANSWER, AND ONLY ONE
 * ---------------------------------------------------------------------
 * Operator ruling R-C2-6 requires that every Parent-facing denial of the
 * canonical read be INDISTINGUISHABLE — same application outcome, same
 * body, same error code and message, same projected shape — across all of:
 * a non-existent (session, student) pair; an existing report belonging to
 * another child; an existing report in another centre; an existing but NOT
 * SUBMITTED report; an inactive or absent parent membership; and an
 * unauthenticated caller of the same endpoint.
 *
 * That is enforced HERE, at the server-side boundary, and in the database
 * — not in a frontend message. See `CANONICAL_READ_DENIED` below for what
 * was actually disclosing and what closing it cost.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActionResult } from "@/server/contracts/action-result";
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
/**
 * THE ONE NON-DISCLOSING DENIAL OF THE CANONICAL READ (operator ruling
 * R-C2-6). Every path out of `getCanonicalReportCore` that is not a
 * successful canonical read returns THIS EXACT VALUE — one outcome, no
 * message, no field list, no code, no discriminator of any kind.
 *
 * It is a frozen module constant rather than an object literal repeated at
 * each return site, for the same reason the Trainer-side assessment RPC
 * carries a BYTE-IDENTICAL message at all four of its BC101 raise sites: a
 * single authored value cannot drift apart at one site and become an
 * oracle, and a test can compare the WHOLE result rather than selected
 * fields.
 *
 * WHY EVERY SQL ERROR COLLAPSES HERE TOO, and why this is not a loss of
 * signal. `mapSqlErrorToResult` is deliberately expressive — it separates
 * BC001 (`unauthorized`) from BC002 (`unavailable`) from a transport fault
 * (`retryable_failure`) from anything else (`unexpected_failure`), each
 * with its own authored message, and `components/ui/state-panel.tsx`
 * renders three visibly DIFFERENT panels across that union. On this read
 * that expressiveness is a disclosure channel:
 *
 *   * `report_get_canonical` holds `EXECUTE` for `authenticated` ONLY —
 *     `PUBLIC`, `anon`, `service_role` and `authenticator` are revoked. An
 *     UNAUTHENTICATED caller of this same endpoint therefore receives
 *     SQLSTATE 42501 from PostgREST, which fell through to
 *     `unexpected_failure` + "The operation could not be completed." and
 *     rendered "Something went wrong";
 *   * an AUTHENTICATED-BUT-DENIED caller receives the RPC's zero-row
 *     outcome, which returned `unavailable` and rendered "This item isn't
 *     available".
 *
 * Those two are the SAME EVENT — "you may not read this" — and they were
 * telling a caller which of the two it was. That is exactly what R-C2-6
 * item 2's sixth bullet forbids, and collapsing every non-success to one
 * value is what closes it. Retryability is not signalled here: this is a
 * VIEW-ONLY read that the surface re-issues on navigation, so nothing is
 * lost but the discriminator.
 *
 * The database half of the boundary is already uniform and stays that way —
 * RPC-13 answers ALL SIX denial cases (non-existent pair, another child,
 * another centre, not submitted, inactive/absent parent membership,
 * unauthenticated) with the SAME ZERO ROWS, and
 * `scripts/tests/c2/c2-suite.sql` T-C2-9 pins that byte-for-byte.
 */
const CANONICAL_READ_DENIED: ActionResult<never> = { outcome: "unavailable" };

export async function getCanonicalReportCore(
  client: SupabaseClient,
  sessionId: string,
  studentId: string,
): Promise<ActionResult<CanonicalReportDto>> {
  // Any of the three roles may read the canonical version (A-030); the RPC
  // itself decides reach. No role pre-check here beyond authentication —
  // adding one would duplicate authority the database already owns.
  let data: unknown;
  try {
    const response = await client.rpc("report_get_canonical", {
      p_class_session_id: sessionId,
      p_student_id: studentId,
    });
    // The error object is deliberately NOT inspected, forwarded, mapped or
    // logged: its code and message are the discriminators this boundary
    // exists to withhold.
    if (response.error) return CANONICAL_READ_DENIED;
    data = response.data;
  } catch {
    // A thrown transport fault is the same single answer. Nothing about the
    // thrown value reaches the caller.
    return CANONICAL_READ_DENIED;
  }
  const row = firstRow<CanonicalReportRow>(data);
  if (!row) return CANONICAL_READ_DENIED;
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
