/**
 * Assessment (observation) cores — `saveObservation` and the trainer
 * observation read, over the two governed assessment RPCs.
 *
 * `saveObservation` persists the observation and its NINE governed ratings
 * AND, in the SAME database transaction, ensures that exactly ONE report
 * shell exists for the (class_session_id, student_id) pair, returning its
 * REAL identifier (operator ruling R-C2-1). Both durable effects belong to
 * one RPC — `assessment_save_complete_and_open_report` — so atomicity is
 * genuine and is never claimed across separate PostgREST calls. The shell
 * lands at `observation_saved` with no version, no draft, no approval and
 * no parent visibility; drafting (RPC-3) remains `requestDraft`'s.
 */

import type { ActionResult } from "@/server/contracts/action-result";
import { mapSqlErrorToResult } from "@/server/contracts/action-result";
import {
  FRAMEWORK_DIMENSIONS,
  isDimensionCode,
  isRatingLevel,
  type DimensionCode,
  type RatingLevel,
} from "@/server/modules/framework/dimensions";
import {
  firstRow,
  type AssessmentSaveAndOpenRow,
  type RpcCaller,
  type TrainerObservationRow,
} from "@/server/modules/report-workflow/rpc-types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NOTE_MAX = 8000;
const CHIP_MAX = 120;
const CHIPS_MAX = 20;

export interface SaveObservationInput {
  readonly sessionId: string;
  readonly studentId: string;
  /** Jointly present (update) or jointly absent (create) — mirrored from the RPC's CAS pair. */
  readonly expectedObservationId?: string;
  readonly expectedLockVersion?: number;
  readonly strengthChips: readonly string[];
  readonly focusChips: readonly string[];
  readonly observationNotes: string;
  readonly followUpNotes: string;
  readonly termEvidenceNotes: string;
  readonly ratings: ReadonlyArray<{ readonly dimensionCode: string; readonly rating: string }>;
}

export interface SaveObservationSuccess {
  readonly observationId: string;
  readonly observationLockVersion: number;
  readonly isComplete: true;
  /**
   * The REAL report identifier the database returned. Never null, never
   * constructed here, never derived from the session/student pair.
   */
  readonly reportId: string;
  /** The status the DATABASE reports. Never asserted by TypeScript. */
  readonly reportStatus: string;
  readonly reportLockVersion: number;
  /** True when this call opened the shell; false when one already existed. */
  readonly reportCreated: boolean;
}

function invalid(message: string, path: string): ActionResult<never> {
  return { outcome: "validation", message, fields: [{ path, message }] };
}

export async function saveObservationCore(
  db: RpcCaller,
  input: SaveObservationInput,
): Promise<ActionResult<SaveObservationSuccess>> {
  if (!UUID_RE.test(input.sessionId)) return invalid("A valid session is required.", "sessionId");
  if (!UUID_RE.test(input.studentId)) return invalid("A valid student is required.", "studentId");
  const hasId = input.expectedObservationId !== undefined;
  const hasLock = input.expectedLockVersion !== undefined;
  if (hasId !== hasLock) {
    return invalid("The expected observation and lock version must be supplied together.", "expectedObservationId");
  }
  if (hasId && !UUID_RE.test(input.expectedObservationId as string)) {
    return invalid("A valid identifier is required.", "expectedObservationId");
  }

  // ALL NINE dimensions, exactly once each, each with a governed rating
  // (A-017 — there is no partial-completion or four-dimension path). The
  // database re-validates every one of these; this shape check exists so an
  // incomplete form gets a field-level validation outcome, not a raw error.
  if (!Array.isArray(input.ratings) || input.ratings.length !== FRAMEWORK_DIMENSIONS.length) {
    return invalid("All nine dimensions must be rated.", "ratings");
  }
  const seen = new Set<DimensionCode>();
  for (const entry of input.ratings) {
    if (!isDimensionCode(entry.dimensionCode)) return invalid("An unrecognised dimension was supplied.", "ratings");
    if (seen.has(entry.dimensionCode)) return invalid("Each dimension may be rated once.", "ratings");
    seen.add(entry.dimensionCode);
    if (!isRatingLevel(entry.rating)) {
      return invalid("Each dimension needs one of the four governed ratings.", `ratings.${entry.dimensionCode}`);
    }
  }

  for (const [path, chips] of [["strengthChips", input.strengthChips], ["focusChips", input.focusChips]] as const) {
    if (!Array.isArray(chips) || chips.length > CHIPS_MAX || chips.some((c) => typeof c !== "string" || c.length > CHIP_MAX)) {
      return invalid("The selected chips were not valid.", path);
    }
  }
  for (const [path, note] of [
    ["observationNotes", input.observationNotes],
    ["followUpNotes", input.followUpNotes],
    ["termEvidenceNotes", input.termEvidenceNotes],
  ] as const) {
    if (typeof note !== "string" || note.length > NOTE_MAX) {
      return invalid("A note exceeds the permitted length.", path);
    }
  }

  // ONE rpc call, ONE transaction. The observation write and the report-shell
  // ensure succeed together or not at all (R-C2-1).
  const { data, error } = await db.rpc("assessment_save_complete_and_open_report", {
    p_class_session_id: input.sessionId,
    p_student_id: input.studentId,
    p_expected_observation_id: hasId ? input.expectedObservationId : null,
    p_expected_lock_version: hasLock ? input.expectedLockVersion : null,
    p_strength_chips: input.strengthChips,
    p_focus_chips: input.focusChips,
    p_observation_notes: input.observationNotes === "" ? null : input.observationNotes,
    p_follow_up_notes: input.followUpNotes === "" ? null : input.followUpNotes,
    p_term_evidence_notes: input.termEvidenceNotes === "" ? null : input.termEvidenceNotes,
    p_ratings: input.ratings.map((r) => ({ dimension_code: r.dimensionCode, rating: r.rating })),
  });
  if (error) return mapSqlErrorToResult(error.code, error.message);
  const row = firstRow<AssessmentSaveAndOpenRow>(data);
  // A missing report id is a failure, NEVER a fabricated or empty identifier.
  if (!row || !row.observation_id || !row.report_id) {
    return { outcome: "unexpected_failure", message: "The operation could not be completed." };
  }
  return {
    outcome: "success",
    data: {
      observationId: row.observation_id,
      observationLockVersion: row.observation_lock_version,
      isComplete: true,
      reportId: row.report_id,
      reportStatus: row.report_status,
      reportLockVersion: row.report_lock_version,
      reportCreated: row.report_created,
    },
  };
}

// ---------------------------------------------------------------------
// getTrainerObservation — the ASM-2 read wrapper (CP-4).
// ---------------------------------------------------------------------
export interface TrainerObservationDto {
  readonly observationExists: boolean;
  readonly observationId: string | null;
  readonly observationLockVersion: number | null;
  readonly strengthChips: readonly string[];
  readonly focusChips: readonly string[];
  readonly observationNotes: string;
  readonly followUpNotes: string;
  readonly termEvidenceNotes: string;
  readonly ratings: ReadonlyArray<{
    readonly dimensionCode: DimensionCode;
    readonly displayName: string;
    readonly group: string;
    readonly rating: RatingLevel;
  }>;
  readonly isComplete: boolean;
}

export async function getTrainerObservationCore(
  db: RpcCaller,
  sessionId: string,
  studentId: string,
): Promise<ActionResult<TrainerObservationDto>> {
  if (!UUID_RE.test(sessionId) || !UUID_RE.test(studentId)) {
    return { outcome: "validation", message: "A valid session and student are required.", fields: [] };
  }
  const { data, error } = await db.rpc("assessment_get_trainer_observation", {
    p_class_session_id: sessionId,
    p_student_id: studentId,
  });
  if (error) return mapSqlErrorToResult(error.code, error.message);
  const row = firstRow<TrainerObservationRow>(data);
  if (!row) return { outcome: "unexpected_failure", message: "The operation could not be completed." };

  const ratings = Array.isArray(row.ratings)
    ? (row.ratings as Array<{ dimension_code: string; display_name: string; group_code: string; rating: string }>)
        .filter((r) => isDimensionCode(r.dimension_code) && isRatingLevel(r.rating))
        .map((r) => ({
          dimensionCode: r.dimension_code as DimensionCode,
          displayName: r.display_name,
          group: r.group_code,
          rating: r.rating as RatingLevel,
        }))
    : [];

  return {
    outcome: "success",
    data: {
      observationExists: row.observation_exists,
      observationId: row.observation_id,
      observationLockVersion: row.lock_version,
      strengthChips: row.strength_chips ?? [],
      focusChips: row.focus_chips ?? [],
      observationNotes: row.observation_notes ?? "",
      followUpNotes: row.follow_up_notes ?? "",
      termEvidenceNotes: row.term_evidence_notes ?? "",
      ratings,
      isComplete: row.is_complete,
    },
  };
}
