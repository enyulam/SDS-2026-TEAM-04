import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { readRows, readRpcRows } from "@/server/platform/query-diagnostics";
import type { AppDatabase } from "@/server/db/app-database";

/**
 * `P2-21` — screen `09` Trainer Reports.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ ZERO FUNCTIONS AND ZERO GRANTS. §12.10 FOR THE EIGHTH CONSECUTIVE PHASE.
 * ═══════════════════════════════════════════════════════════════════════════
 * Measured at HEAD before a line was written:
 *
 *   · `report_list_trainer_reports()` — added at `P2-19` for the dashboard —
 *     already returns **every** report this trainer authored, not a slice:
 *     `report_id · class_session_id · session_date · student_id · student_name
 *     · class_label · report_state · updated_at`. The dashboard takes the most
 *     recent few; this screen takes all of them. ▶ **The row already carried
 *     it.**
 *   · `class_sessions` is directly readable by a trainer under RLS —
 *     **17 rows visible**, measured — including `lesson_number` and
 *     `lesson_title`, which is where the frame's `Lesson` column comes from.
 *
 * ⚠️ **SO THE LESSON IS JOINED IN THE APPLICATION, NOT ADDED TO THE RPC.**
 * Widening `report_list_trainer_reports()` would have been a `DROP` + `CREATE`
 * of a function the dashboard also calls — and the batch authorization covers
 * read-side functions, so it was *permitted*. It was not *needed*, and a
 * signature change nobody needs is a second caller to keep in step forever.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⛔ TWO OF THE FRAME'S COLUMNS ARE REFUSED, BOTH BY THIS PACK'S OWN REGISTER
 * ═══════════════════════════════════════════════════════════════════════════
 * 1. ⛔ **`Level`** — the frame draws `Mastering` / `Developing` / `Mastered` /
 *    `Beginning`, one per row. **`GC-7`**, verbatim from
 *    `09-trainer-reports/implementation-notes.md`: *"Ratings shown in a
 *    'Level'/chips column although screen.md section 8 declares the screen
 *    'Not rating-bearing'. GOVERNANCE WINS. **DO NOT BUILD.**"* ▶ The refusal
 *    is held **in the DTO**, which carries no rating field to populate — a
 *    component that declined to render one would be one line from carrying it.
 *
 * 2. ⛔ **The `In session` and `Draft` status chips** — **`GC-8`**: *"Only
 *    `submitted` is among the eight authorized `report_status` values
 *    (`A-036`). A status must never be added to encode UI presence. **DO NOT
 *    BUILD the extra chips.**"* ▶ What renders instead is the **real**
 *    `report_state`, which is one of `A-036`'s eight. Measured in the fixture:
 *    `submitted` 4 · `draft_ready` 6 · `trainer_approved` 2 — so the frame's
 *    three-chip vocabulary is not even a renaming of what exists.
 *
 * ⚠️ **AND THE `Level` COLUMN IS NOT A LAYOUT LICENCE.** Its cell is left out;
 * the remaining columns are not stretched to reclaim the space (the `20`/`24`
 * rule: a refused field leaves a gap).
 */

export interface TrainerReportRowDto {
  readonly reportId: string;
  readonly classSessionId: string;
  readonly studentId: string;
  readonly studentName: string;
  readonly classLabel: string;
  readonly sessionDate: string;
  /**
   * ⛔ `A-036`'s eight, whichever the database actually reports. NEVER the
   * frame's `In session` / `Draft` (`GC-8`).
   */
  readonly reportState: string;
  readonly updatedAt: string;
  /**
   * ⚠️ `null` WHERE THE SESSION CARRIES NO LESSON — omitted, never invented
   * (hero `0B`). **Measured 2026-08-16: 0 of 17 sessions in the fixture carry
   * a `lesson_number` or a `lesson_title`, so this is `null` on every row
   * today.** That is a FIXTURE fact, not a defect in this projection or the
   * schema; screens `13`, `15` and `25` read the same two columns.
   */
  readonly lessonNumber: number | null;
  readonly lessonTitle: string | null;
}

export interface TrainerReportsDto {
  readonly reports: readonly TrainerReportRowDto[];
  /** The frame's `Filter by class` chips: label + count, derived from the rows. */
  readonly classes: readonly { readonly label: string; readonly count: number }[];
  readonly total: number;
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

type SessionRow = {
  id: string;
  lesson_number: number | null;
  lesson_title: string | null;
};

export async function readTrainerReportsCore(
  client: SupabaseClient<AppDatabase>,
): Promise<{ readonly ok: true; readonly data: TrainerReportsDto } | { readonly ok: false }> {
  const reports = await readRpcRows<ReportRow>(
    "readTrainerReportsCore:report_list_trainer_reports",
    () => client.rpc("report_list_trainer_reports"),
  );
  if (!reports.ok) return { ok: false };

  /*
   * ⚠️ A REJECTED LESSON READ IS NOT "NO LESSONS" (`Q-7`). It resolves to an
   * empty map, so every row's lesson is `null` — the SAME rendering as a
   * session that genuinely carries none, which is correct here precisely
   * because the frame's lesson line is omitted rather than filled either way.
   * ▶ Were it a filled placeholder, the two cases would have to be told apart.
   */
  const sessionIds = [...new Set(reports.rows.map((r) => r.class_session_id))];
  const lessons = new Map<string, SessionRow>();
  if (sessionIds.length > 0) {
    const sessions = await readRows<SessionRow>("readTrainerReportsCore:class_sessions", () =>
      client
        .from("class_sessions")
        .select("id, lesson_number, lesson_title")
        .in("id", sessionIds),
    );
    if (sessions.ok) for (const s of sessions.rows) lessons.set(s.id, s);
  }

  /*
   * ⛔ NEWEST FIRST, WHICH IS THE FRAME'S OWN DEFAULT (`Newest first`). Sorted
   * on `updated_at` — the last time the report changed — rather than
   * `session_date`, because a correction returned and re-approved today belongs
   * at the top of a list a trainer uses to find their own work.
   */
  const rows = [...reports.rows]
    .sort((a, b) => (a.updated_at < b.updated_at ? 1 : a.updated_at > b.updated_at ? -1 : 0))
    .map((r) => {
      const lesson = lessons.get(r.class_session_id) ?? null;
      return {
        reportId: r.report_id,
        classSessionId: r.class_session_id,
        studentId: r.student_id,
        studentName: r.student_name,
        classLabel: r.class_label,
        sessionDate: r.session_date,
        reportState: r.report_state,
        updatedAt: r.updated_at,
        lessonNumber: lesson?.lesson_number ?? null,
        lessonTitle: lesson?.lesson_title ?? null,
      };
    });

  /*
   * ⚠️ THE CHIP COUNTS ARE DERIVED FROM THE ROWS, NEVER READ SEPARATELY. A
   * second query would be free to disagree with the table it labels — the
   * `P2-17` reasoning applied to a filter. Ordered by count then label so the
   * order is deterministic rather than insertion-dependent.
   */
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r.classLabel, (counts.get(r.classLabel) ?? 0) + 1);

  return {
    ok: true,
    data: {
      reports: rows,
      classes: [...counts.entries()]
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
      total: rows.length,
    },
  };
}
