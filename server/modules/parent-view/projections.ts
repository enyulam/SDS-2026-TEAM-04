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
import { readRows, type QueryOutcome } from "@/server/platform/query-diagnostics";
import { firstRow, type CanonicalReportRow } from "@/server/modules/report-workflow/rpc-types";
import type { AppDatabase } from "@/server/db/app-database";

/** Row shape of `report_get_canonical_context` (hero Phase 1). */
interface CanonicalContextRow {
  readonly student_display_name: string;
  readonly class_grade_label: string;
  readonly class_module_title: string;
  readonly session_date: string;
  readonly lesson_number: number | null;
  readonly lesson_title: string | null;
  readonly trainer_display_name: string | null;
}

/**
 * A row of the parent's submitted-report list — hero Phase 2 (screen `32`).
 *
 * ⛔ The five context fields are display context the frame names and
 * governance permits: Class Grade, Class Module, lesson number/title (G-3)
 * and the assigned trainer (G-5, expressly permitted on a Parent surface
 * because it is NOT a rating and NOT derived from one). NOTHING here is a
 * rating in any vocabulary (Q-27, G-2), an observation, a trainer note, a
 * draft, AI history, a content hash, a REVISION NUMBER, a lifecycle status
 * or an audit row, and nothing discloses that a correction cycle is or was
 * underway. Adding any of those is a §12 stop-and-ask.
 *
 * ⚠️ NULL MEANS NOT RECORDED — render by OMITTING the element. Never
 * "Lesson 1", never "TBC", never a placeholder dash.
 */
export interface ParentReportListItemDto {
  readonly studentId: string;
  readonly studentDisplayName: string;
  readonly sessionId: string;
  readonly sessionDate: string;
  readonly submittedAt: string;
  readonly classGradeLabel: string | null;
  readonly classModuleTitle: string | null;
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
  readonly trainerDisplayName: string | null;
}

export type AvailabilityState = "available" | "none_yet" | "linked_unavailable";

/**
 * Display context for the canonical report — hero Phase 1.
 *
 * ⛔ Every field here is display context the frame names and governance
 * permits. NOTHING in this shape is a rating (Q-27, G-2), an observation, a
 * trainer note, a draft, AI history, a content hash, a REVISION NUMBER, a
 * lifecycle status or an audit row, and nothing discloses that a correction
 * cycle is or was underway. Adding any of those here is a §12 stop-and-ask,
 * and the database refuses them independently — `report_get_canonical_context`
 * returns exactly seven columns and its own assertion H1-6 pins their names.
 *
 * ⚠️ `lessonNumber`, `lessonTitle` and `trainerDisplayName` are nullable, and
 * NULL means NOT RECORDED. Render by OMITTING the element — never "Lesson 1",
 * never "TBC", never a placeholder dash.
 */
export interface CanonicalReportContextDto {
  readonly studentDisplayName: string;
  readonly classGradeLabel: string;
  readonly classModuleTitle: string;
  readonly sessionDate: string;
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
  readonly trainerDisplayName: string | null;
}

export interface CanonicalReportDto {
  readonly panels: {
    readonly overview: string;
    readonly strengths: string;
    readonly areasForDevelopment: string;
    readonly remarks: string;
  };
  readonly submittedAt: string;
  /**
   * `null` when the context read returned nothing. The panels are the
   * governed content and never depend on this — see `getCanonicalReportCore`.
   */
  readonly context: CanonicalReportContextDto | null;
}

/**
 * ⛔ THE MOST CONSEQUENTIAL SILENT EMPTINESS IN THE WHOLE SWEEP, BECAUSE OF
 * WHAT CONSUMES IT.
 *
 * Both reads discarded `error`. `getParentAvailabilityCore` branches on
 * `linked.length === 0` → **`none_yet`**, which the Parent Dashboard renders
 * as **"No learner linked to this account yet"**.
 *
 * ▶ So a REJECTED read told a parent, in plain language, **that no learner is
 * linked to their account** — a false statement about their own family
 * relationship, produced by a database fault they could neither see nor act
 * on. The copy fix that made that sentence honest is precisely what made this
 * read's failure mode dangerous: the clearer the empty state, the more
 * convincing the lie.
 *
 * ⚠️ Returning `unavailable` here does NOT weaken R-C2-6. The parent-facing
 * denial stays a single indistinguishable outcome; what changes is that a
 * FAULT is no longer reported as a FACT about the family.
 */
async function listLinkedStudents(
  client: SupabaseClient<AppDatabase>,
): Promise<QueryOutcome<Array<{ studentId: string; displayName: string }>>> {
  const links = await readRows<{ student_id: string }>(
    "listLinkedStudents:parent_student_links",
    () =>
      client
        .from("parent_student_links")
        .select("student_id, is_active")
        .eq("is_active", true),
  );
  if (!links.ok) return { ok: false };

  const ids = links.rows.map((l) => l.student_id);
  // A genuinely OBSERVED absence of links — the read succeeded and returned
  // none. This is the only case that may legitimately produce `none_yet`.
  if (ids.length === 0) return { ok: true, rows: [] };

  const students = await readRows<{ id: string; full_name: string }>(
    "listLinkedStudents:students",
    () => client.from("students").select("id, full_name").in("id", ids),
  );
  if (!students.ok) return { ok: false };

  const names = new Map(students.rows.map((s) => [s.id, s.full_name]));
  return {
    ok: true,
    rows: ids.map((id) => ({ studentId: id, displayName: names.get(id) ?? "Student" })),
  };
}

/**
 * The one display-context read, shared by R-9 (the list) and R-11 (the
 * detail) — hero Phase 2 factored it out of R-11 rather than writing a
 * second copy.
 *
 * ⚠️ ONE GATE, NOT TWO. `report_get_canonical_context` mirrors RPC-13's
 * authorization step for step, which is what stops it becoming a side
 * channel that discloses a report the canonical read refuses (R-C2-6).
 * Every caller reaches it through this function, so there is exactly one
 * place that gate could ever drift — and a list-shaped second RPC would
 * have created a second one.
 *
 * ⚠️ FAIL-SOFT IS DELIBERATE, AND SAFE ONLY BECAUSE OF THE CALL ORDER.
 * Both callers invoke this only AFTER the canonical read has already
 * succeeded for the same pair, so this call cannot widen what the caller
 * may see; it can only fail to decorate it. Context is presentation, and
 * losing it must never withhold — or silently drop from the list — the
 * governed narrative a parent is entitled to. A missing context renders as
 * omitted elements, never as a denial and never as a placeholder.
 */
async function readCanonicalContext(
  client: SupabaseClient<AppDatabase>,
  sessionId: string,
  studentId: string,
): Promise<CanonicalReportContextDto | null> {
  try {
    const ctx = await client.rpc("report_get_canonical_context", {
      p_class_session_id: sessionId,
      p_student_id: studentId,
    });
    if (ctx.error) return null;
    const c = firstRow<CanonicalContextRow>(ctx.data);
    if (!c) return null;
    return {
      studentDisplayName: c.student_display_name,
      classGradeLabel: c.class_grade_label,
      classModuleTitle: c.class_module_title,
      sessionDate: c.session_date,
      lessonNumber: c.lesson_number ?? null,
      lessonTitle: c.lesson_title ?? null,
      trainerDisplayName: c.trainer_display_name ?? null,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------
// R-9 — the submitted-report list
// ---------------------------------------------------------------------
export async function listParentReportsCore(
  client: SupabaseClient<AppDatabase>,
): Promise<ActionResult<readonly ParentReportListItemDto[]>> {
  const identity = await requireRole(client, "parent");
  if (identity.outcome !== "success") return identity;

  const linked = await listLinkedStudents(client);
  /*
   * ⛔ A rejection here must never become an empty report list: through
   * `getParentAvailabilityCore` that renders as "No report published yet" for
   * a family whose report HAS been published — withholding a submitted report
   * from the audience it was published to.
   */
  if (!linked.ok) return { outcome: "unavailable" };

  const out: ParentReportListItemDto[] = [];
  for (const student of linked.rows) {
    const enrolments = await readRows<{ class_module_id: string }>(
      "listParentReportsCore:enrolments",
      () => client.from("enrolments").select("class_module_id").eq("student_id", student.studentId),
    );
    if (!enrolments.ok) return { outcome: "unavailable" };

    for (const enrolment of enrolments.rows) {
      const sessions = await readRows<{ id: string; session_date: string }>(
        "listParentReportsCore:class_sessions",
        () =>
          client
            .from("class_sessions")
            .select("id, session_date")
            .eq("class_module_id", enrolment.class_module_id)
            .order("session_date", { ascending: true }),
      );
      if (!sessions.ok) return { outcome: "unavailable" };

      for (const session of sessions.rows) {
        const { data, error } = await client.rpc("report_get_canonical", {
          p_class_session_id: session.id,
          p_student_id: student.studentId,
        });
        if (error) continue; // non-disclosing: an unreachable pair is simply absent
        const row = firstRow<CanonicalReportRow>(data);
        if (!row) continue; // zero rows = nothing submitted for this pair

        /*
         * Hero Phase 2. Read SECOND, and only for a pair that has ALREADY
         * resolved a canonical submitted version — so the context read adds
         * display fields to a row the parent boundary has already admitted
         * and can never admit a row of its own. Reachability stays exactly
         * where it was: `latest_submitted_version_id` and a live
         * `parent_student_links` row, both re-derived inside RPC-13.
         *
         * The extra round trip is per MATCHED row, not per candidate
         * session — the enumeration above already costs one call per
         * session and the matched set is a small subset of it.
         */
        const context = await readCanonicalContext(client, session.id, student.studentId);
        out.push({
          studentId: student.studentId,
          studentDisplayName: student.displayName,
          sessionId: session.id,
          sessionDate: session.session_date,
          submittedAt: row.submitted_at,
          classGradeLabel: context?.classGradeLabel ?? null,
          classModuleTitle: context?.classModuleTitle ?? null,
          lessonNumber: context?.lessonNumber ?? null,
          lessonTitle: context?.lessonTitle ?? null,
          trainerDisplayName: context?.trainerDisplayName ?? null,
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
  client: SupabaseClient<AppDatabase>,
): Promise<ActionResult<AvailabilityState>> {
  const identity = await requireRole(client, "parent");
  if (identity.outcome !== "success") return identity;

  const linked = await listLinkedStudents(client);
  /*
   * ⛔ `none_yet` IS A CLAIM ABOUT THE FAMILY, NOT A FALLBACK. It renders as
   * "No learner linked to this account yet". Only an OBSERVED absence of
   * links may produce it; a rejected read is `unavailable`.
   */
  if (!linked.ok) return { outcome: "unavailable" };
  if (linked.rows.length === 0) return { outcome: "success", data: "none_yet" };
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
  client: SupabaseClient<AppDatabase>,
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

  // Display context — hero Phase 1, moved to the shared reader at Phase 2.
  //
  // ⚠️ The ordering matters and is not incidental. The canonical read above
  // is the governance boundary; this call cannot widen it, because
  // `report_get_canonical_context` mirrors that same gate step for step and
  // is reached only after it has already succeeded. A caller who was refused
  // above has already returned. The fail-soft rationale lives on
  // `readCanonicalContext` and is now stated once for both callers.
  const context = await readCanonicalContext(client, sessionId, studentId);

  return {
    outcome: "success",
    data: {
      panels: {
        overview: row.overview,
        strengths: row.strengths,
        areasForDevelopment: row.areas_for_development,
        remarks: row.remarks,
      },
      submittedAt: row.submitted_at,
      context,
    },
  };
}
