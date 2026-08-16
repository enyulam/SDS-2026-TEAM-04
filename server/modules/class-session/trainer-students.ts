import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppDatabase } from "@/server/db/app-database";

/**
 * `P2-20` — screen `04` Trainer Students.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ARTEFACTS OPENED (`CLAUDE.md` §7.4.1 — every claim names one)
 * ═══════════════════════════════════════════════════════════════════════════
 *   · `reference/Trainer - Students/Trainer - Students.png`   — geometry
 *   · `reference/Trainer - Students/Trainer - Students.html`  — measured values
 *   · `UI_REFERENCE_FINAL_MVP/04-trainer-students/screen.md`  — §8 and `GC-7`
 *
 * ⛔ ONE GOVERNED READ, `report_list_trainer_students()`, AND NO RATING IN IT.
 * The frame's `Level` column is refused twice over — `GC-7` in this pack's own
 * notes, and `G-2` independently, since one chip for a learner's whole history
 * is a roll-up. The refusal is enforced in the SQL, not here: nothing in the
 * DTO below can carry a rating because nothing upstream returns one.
 */

export interface TrainerStudentRowDto {
  readonly studentId: string;
  readonly studentName: string;
  readonly initials: string;
  readonly classModuleId: string;
  readonly classLabel: string;
  /**
   * ⚠️ NULL MEANS **NOT ASSESSED**, and the screen renders the frame's own
   * `—` for it (hero `0B`). It is never rendered as a zero, a blank or a
   * guessed date.
   */
  readonly lastAssessed: string | null;
}

export interface TrainerStudentsDto {
  /** ⛔ DISTINCT LEARNERS, never the row count — a student in two of the trainer's modules is one learner. */
  readonly studentCount: number;
  readonly rows: readonly TrainerStudentRowDto[];
  readonly classes: readonly { readonly classModuleId: string; readonly classLabel: string }[];
}

/**
 * Two capitals from the learner's name, or one where there is only one word.
 * ⚠️ Derived from the NAME, never from a row index — `P2-8` shipped an
 * index-keyed derivation and a learner changed identity when the list reordered.
 */
function initialsOf(name: string): string {
  const parts = name.split(/\s+/).filter((part) => part.length > 0);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export async function readTrainerStudentsCore(
  client: SupabaseClient<AppDatabase>,
): Promise<{ readonly ok: true; readonly data: TrainerStudentsDto } | { readonly ok: false }> {
  const result = await client.rpc("report_list_trainer_students");
  if (result.error !== null) return { ok: false };

  const raw = (result.data ?? []) as {
    student_id: string;
    student_name: string;
    class_module_id: string;
    class_label: string;
    last_assessed: string | null;
  }[];

  const rows = raw.map((row) => ({
    studentId: row.student_id,
    studentName: row.student_name,
    initials: initialsOf(row.student_name),
    classModuleId: row.class_module_id,
    classLabel: row.class_label,
    lastAssessed: row.last_assessed,
  }));

  /*
   * ⛔ DISTINCT LEARNERS, AND THE COMMENT IS NOT THE PROOF — `PT20-7` asserts
   * this Set exists and that no `rows.length` reaches the count. `P2-19`
   * shipped a comment claiming exactly this over code that did the other
   * thing, and a correct comment on incorrect code is worse than none.
   */
  const studentCount = new Set(rows.map((row) => row.studentId)).size;

  const byModule = new Map<string, string>();
  for (const row of rows) byModule.set(row.classModuleId, row.classLabel);
  const classes = [...byModule.entries()]
    .map(([classModuleId, classLabel]) => ({ classModuleId, classLabel }))
    .sort((a, b) => a.classLabel.localeCompare(b.classLabel));

  return { ok: true, data: { studentCount, rows, classes } };
}
