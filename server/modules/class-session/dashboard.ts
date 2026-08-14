import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { readMaybeRow, type QueryOutcome } from "@/server/platform/query-diagnostics";

/**
 * `P2-7` — screen `11` Management Dashboard KPI tiles.
 *
 * ⛔ ONE ROUND TRIP FOR ALL FOUR, and that is deliberate rather than tidy.
 * Three of the four tiles could be sourced from already-accepted boundaries;
 * only `assessed` needs the new read. ▶ But four tiles fetched four ways can
 * DISAGREE WITH EACH OTHER across the gap between the calls, and a dashboard
 * whose own numbers contradict each other is worse than one that is briefly
 * stale. One call cannot be internally inconsistent.
 *
 * ⛔ `submitted`, NOT `approved`. Under `A-036` `approved` is
 * TRANSIENT-IN-TRANSACTION and never commits, so the frame's `Approved` tile
 * has an empty referent and would read ZERO FOREVER — a KPI that can only
 * ever report zero asserts a measurement that does not exist. Operator
 * ruling, 2026-08-14; the same correction already applied to Class Health
 * Summary and Management Insight at Step 7I1D-R2, and this is its THIRD
 * sighting. Migration assertion `W-5` fails the build if anybody "restores
 * fidelity" by counting the transient status.
 *
 * ⛔ NOTHING HERE IS AN ASSESSMENT FACT — three integers, and there is no
 * field one could arrive in. Migration assertion `W-4` fails the build if the
 * read so much as NAMES a rating, panel field, trainer note, checklist value
 * or hash, matched as a BARE SUBSTRING so it catches the next rating column
 * nobody has written yet; `W-4c` proves each detector fires against a planted
 * sample, so the four absences are measurements rather than four patterns
 * that can never match.
 */
/**
 * ⛔ THREE, NOT FOUR — `Ruling A`, Operator, 2026-08-15.
 *
 * `assessedStudents` was DROPPED AT THE SOURCE: *"drop the parameter properly.
 * A forward migration under `R-1`, not an edit. **Leaving it unread is the
 * option that rots.**"* ▶ Removing it here alone would have left the RPC
 * returning a fourth integer nothing consumed — exactly the shape somebody
 * later finds and re-surfaces, assuming it was wanted.
 *
 * ⚠️ AND `totalStudents` CHANGED MEANING WITHOUT CHANGING NAME, which is the
 * more dangerous half. It now counts **DISTINCT ACTIVE ENROLMENTS**, not
 * centre-resident `students` rows. ⛔ **The two were IDENTICAL at HEAD — both
 * 13, measured** — so nothing on this screen would have looked wrong until the
 * first learner withdrew.
 */
export type DashboardSummaryDto = {
  /** ⛔ ENROLLED (active) — never centre-resident. The names coincide; the numbers will not. */
  readonly totalStudents: number;
  readonly pendingApproval: number;
  readonly submittedReports: number;
};

type SummaryRow = {
  o_total_students: number | null;
  o_pending_approval: number | null;
  o_submitted_reports: number | null;
};

/**
 * ⛔ FAILS CLOSED, AND THE NULL IS THE MECHANISM. The RPC returns NULLs — not
 * zeroes — to any caller without an active management membership, so a
 * REFUSAL can never be rendered as a centre with no learners (`Q-7`).
 * Measured both directions: management reads `13 · 2 · 4` — three integers
 * since `Ruling A`, where it was `13 · 10 · 2 · 4` — and a trainer reads `NULL`.
 *
 * ⛔ `readMaybeRow`, NOT `readRows` — AND THE DIFFERENCE WAS A LIVE DEFECT, not
 * a style choice. This function is `RETURNS record` (`proretset = false`), so
 * PostgREST resolves it to a BARE OBJECT. Its nearest peer,
 * `report_class_health_summary`, is `SETOF record` and resolves to an ARRAY.
 * ▶ Reading `rows[0]` off the object yielded `undefined` on EVERY call, this
 * read failed closed every time, and all four tiles rendered the refusal em
 * dash. `readMaybeRow` is the ratified helper for exactly this — it accepts
 * either shape, and it exists because two earlier governed RPC reads hit the
 * same wall.
 *
 * ⚠️ WHY NO SQL LEG CAUGHT IT, recorded because the gap is the lesson: in SQL,
 * `SELECT … FROM f()` reads BOTH shapes identically, so a suite that calls the
 * function proves it RUNS and still says nothing about what the CLIENT
 * receives. `S3-M8-live` caught it on the painted page, which is the only
 * place the difference is observable.
 */
export async function readDashboardSummaryCore(
  client: SupabaseClient,
): Promise<QueryOutcome<DashboardSummaryDto>> {
  const found = await readMaybeRow<SummaryRow>("readDashboardSummaryCore", () =>
    client.rpc("report_centre_dashboard_summary"),
  );
  if (!found.ok) return { ok: false };
  const row = found.rows;
  if (
    row === null ||
    row.o_total_students === null ||
    row.o_pending_approval === null ||
    row.o_submitted_reports === null
  ) {
    return { ok: false };
  }
  return {
    ok: true,
    rows: {
      totalStudents: row.o_total_students,
      pendingApproval: row.o_pending_approval,
      submittedReports: row.o_submitted_reports,
    },
  };
}
