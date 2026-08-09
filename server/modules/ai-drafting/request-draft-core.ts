/**
 * `requestDraft` orchestration — the owner of report-lifecycle entry
 * (assessment baseline §1.3, contract §5.1) and of the ratified generation
 * sequence (B2 task §3):
 *
 *   ensure/create report (RPC-1) → mark observation saved (RPC-2)
 *     → request drafting (RPC-3) → AiDraftProvider (trusted boundary)
 *       → deterministic schema + grounding validation
 *         → internal draft store (RPC-4, trusted channel) ONLY after
 *           validation succeeds — otherwise cancel (RPC-5).
 *
 * Guarantees carried here:
 * - There is NO path where AI output reaches storage — and therefore no
 *   path where it reaches a trainer's screen — without grounding having run
 *   first (CLAUDE.md §4 non-negotiable 1).
 * - ONE bounded retry (contract §6.2 item 4): a rejected or failed first
 *   generation is regenerated once; a second failure cancels the draft
 *   (drafting → observation_saved) so no false `draft_ready` ever exists.
 * - Repeated completion attempts are idempotent: a report already at
 *   `draft_ready` returns its existing state; a concurrent duplicate store
 *   resolves to the committed winner rather than erroring the caller.
 * - Audit truthfulness: T0/T1/T2 events are emitted by the RPCs that
 *   actually perform them, in their own transactions — never fabricated.
 */

import type { ActionResult } from "@/server/contracts/action-result";
import { mapSqlErrorToResult } from "@/server/contracts/action-result";
import {
  FRAMEWORK_DIMENSIONS,
  POLARITY_BANDS,
  RUBRIC_ANCHORS,
} from "@/server/modules/framework/dimensions";
import { getTrainerObservationCore, type TrainerObservationDto } from "@/server/modules/observation/core";
import type { AiDraftProvider, AiDraftRequest, ReportPanels } from "@/server/modules/ai-drafting/provider";
import { resolveMaxDraftAttempts, DRAFT_MAX_ATTEMPTS_VAR } from "@/server/modules/ai-drafting/draft-attempts";
import { emitDraftDiagnostic } from "@/server/modules/ai-drafting/draft-diagnostics";
import { validateGrounding, deriveSourceMap } from "@/server/modules/ai-drafting/grounding";
import type { TrustedDraftStore } from "@/server/modules/ai-drafting/trusted-store";
import {
  firstRow,
  type ReportCreateRow,
  type RequestDraftRow,
  type RpcCaller,
  type StatusLockRow,
  type WorkingReportRow,
} from "@/server/modules/report-workflow/rpc-types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface RequestDraftInput {
  readonly sessionId: string;
  readonly studentId: string;
}

export interface RequestDraftDependencies {
  readonly db: RpcCaller;
  readonly provider: AiDraftProvider;
  readonly trustedStore: TrustedDraftStore;
  /** The VERIFIED auth user id of the caller (auth.getUser), for the trusted channel's claims. */
  readonly authUserSub: string;
  /** RLS-scoped student display-name read — injected so the core stays transport-free. */
  readonly readStudentDisplayName: (studentId: string) => Promise<string | null>;
}

export interface RequestDraftSuccess {
  readonly reportId: string;
  readonly status: "draft_ready";
  readonly lockVersion: number;
  readonly versionId: string;
  readonly contentHash: string;
}

export async function requestDraftCore(
  deps: RequestDraftDependencies,
  input: RequestDraftInput,
): Promise<ActionResult<RequestDraftSuccess>> {
  if (!UUID_RE.test(input.sessionId) || !UUID_RE.test(input.studentId)) {
    return { outcome: "validation", message: "A valid session and student are required.", fields: [] };
  }
  const { db } = deps;

  // 1 — the saved observation is the ground truth. It must exist and be
  //     complete before any lifecycle step runs.
  const observation = await getTrainerObservationCore(db, input.sessionId, input.studentId);
  if (observation.outcome !== "success") return observation;
  const saved = observation.data;
  if (!saved.observationExists || !saved.isComplete || saved.observationId === null || saved.observationLockVersion === null) {
    return {
      outcome: "validation",
      message: "Save the complete nine-dimension assessment before requesting a draft.",
      fields: [],
    };
  }

  // 2 — current lifecycle position (zero rows = no report yet).
  const working = await db.rpc("report_get_working", {
    p_class_session_id: input.sessionId,
    p_student_id: input.studentId,
  });
  if (working.error) return mapSqlErrorToResult(working.error.code, working.error.message);
  const state = firstRow<WorkingReportRow>(working.data);

  let reportId: string;
  let lockVersion: number;
  let observationLockVersion = saved.observationLockVersion;

  if (state === null) {
    const created = await db.rpc("report_create", {
      p_class_session_id: input.sessionId,
      p_student_id: input.studentId,
      p_observation_id: saved.observationId,
    });
    if (created.error) return mapSqlErrorToResult(created.error.code, created.error.message);
    const row = firstRow<ReportCreateRow>(created.data);
    if (!row) return { outcome: "unexpected_failure", message: "The operation could not be completed." };
    reportId = row.report_id;
    lockVersion = row.lock_version;
    const marked = await db.rpc("report_mark_observation_saved", {
      p_report_id: reportId,
      p_expected_lock_version: lockVersion,
    });
    if (marked.error) return mapSqlErrorToResult(marked.error.code, marked.error.message);
    lockVersion = (firstRow<StatusLockRow>(marked.data) as StatusLockRow).lock_version;
  } else {
    reportId = state.report_id;
    lockVersion = state.lock_version;
    switch (state.status) {
      case "incomplete": {
        const marked = await db.rpc("report_mark_observation_saved", {
          p_report_id: reportId,
          p_expected_lock_version: lockVersion,
        });
        if (marked.error) return mapSqlErrorToResult(marked.error.code, marked.error.message);
        lockVersion = (firstRow<StatusLockRow>(marked.data) as StatusLockRow).lock_version;
        break;
      }
      case "observation_saved":
      case "drafting":
        break;
      case "draft_ready":
        // Idempotent repeated completion: the draft already exists.
        return {
          outcome: "success",
          data: {
            reportId,
            status: "draft_ready",
            lockVersion,
            versionId: state.current_version_id,
            contentHash: state.content_hash,
          },
        };
      default:
        // needs_edit / trainer_approved / submitted: generation is not the
        // governed path from here (corrections go through the trainer edit).
        return {
          outcome: "stale_state",
          message: "This report has moved past drafting. Reload to continue from its current state.",
        };
    }
  }

  // 3 — request drafting (T2) unless a prior attempt already left the
  //     report at `drafting` (crash recovery: re-enter the provider stage).
  if (state === null || state.status === "incomplete" || state.status === "observation_saved") {
    const requested = await db.rpc("report_request_draft", {
      p_report_id: reportId,
      p_expected_lock_version: lockVersion,
    });
    if (requested.error) return mapSqlErrorToResult(requested.error.code, requested.error.message);
    const row = firstRow<RequestDraftRow>(requested.data);
    if (!row) return { outcome: "unexpected_failure", message: "The operation could not be completed." };
    lockVersion = row.lock_version;
    observationLockVersion = row.observation_lock_version;
  }

  // 4 — the bounded generation loop: one attempt plus ONE retry, each pass
  //     running schema validation (inside the provider) then deterministic
  //     grounding. Nothing is persisted until both pass.
  const studentDisplayName = (await deps.readStudentDisplayName(input.studentId)) ?? "the student";
  const aiRequest = buildAiRequest(reportId, observationLockVersion, studentDisplayName, saved);

  let panels: ReportPanels | null = null;
  let failure: ActionResult<never> | null = null;

  // The ratified bound is 2 (one attempt plus one retry) and an ABSENT
  // variable still means 2 — production behaviour is unchanged. Only a
  // PRESENT-but-malformed value throws.
  let maxAttempts: number;
  try {
    maxAttempts = resolveMaxDraftAttempts();
  } catch (attemptsError: unknown) {
    // ⚠️ THIS CATCH WAS SILENT, AND I INTRODUCED IT IN THE SAME COMMIT THAT
    // ADDED THE DIAGNOSTICS. It sits EXACTLY between the gather (the student
    // read on line 179) and the provider loop below, and its signature is
    // precisely what was observed in the deployed run: HTTP 200, gather
    // complete, NO outbound provider call, NO further state transition, and
    // NOTHING emitted. Fourth instance in this run of "a fail-closed path
    // whose cause is invisible".
    //
    // The raw value is reported because it is a COUNT, not a credential —
    // and the whole failure mode here is a value that LOOKS right (a "1"
    // carrying a trailing newline or space reads identically in a dashboard
    // but is not the string "1").
    const raw = process.env[DRAFT_MAX_ATTEMPTS_VAR];
    emitDraftDiagnostic({
      reportId,
      attempt: 0,
      maxAttempts: 0,
      result: "attempt_cap_unparseable",
      reasons: [
        attemptsError instanceof Error ? attemptsError.message : "unknown attempt-cap failure",
        `${DRAFT_MAX_ATTEMPTS_VAR} present=${raw !== undefined}` +
          (raw === undefined
            ? ""
            : ` length=${raw.length} trimmedEqualsOne=${raw.trim() === "1"} json=${JSON.stringify(raw)}`),
      ],
      ratings: saved.ratings.map((r) => ({ dimensionCode: r.dimensionCode, rating: r.rating })),
    });
    return {
      outcome: "generation_failure",
      retryable: false,
      message: "Draft generation is not configured on this environment.",
    };
  }

  const diagRatings = saved.ratings.map((r) => ({ dimensionCode: r.dimensionCode, rating: r.rating }));

  for (let attempt = 1; attempt <= maxAttempts && panels === null; attempt += 1) {
    const outcome = await deps.provider.generate(aiRequest);
    if (outcome.kind === "ok") {
      const verdict = validateGrounding(outcome.panels, {
        studentDisplayName,
        ratings: saved.ratings.map((r) => ({
          dimensionCode: r.dimensionCode,
          displayName: r.displayName,
          rating: r.rating,
        })),
      });
      // SERVER-SIDE diagnostics only. `verdict.reasons` and the panel text
      // were previously computed and discarded, leaving a fail-closed check
      // with no diagnosable cause. This records them and changes NO gate, NO
      // lexicon and NO threshold — the decision below is byte-identical.
      emitDraftDiagnostic({
        reportId,
        attempt,
        maxAttempts,
        result: verdict.ok ? "ok" : "grounding_rejected",
        reasons: verdict.ok ? [] : verdict.reasons,
        panels: outcome.panels as unknown as Record<string, string>,
        ratings: diagRatings,
        usage: (outcome.metadata?.usage ?? null) as Record<string, number> | null,
      });
      if (verdict.ok) {
        panels = outcome.panels;
      } else {
        failure = {
          outcome: "generation_failure",
          retryable: true,
          message: "The generated draft did not match the saved assessment and was rejected.",
        };
      }
    } else if (outcome.kind === "provider_failure") {
      emitDraftDiagnostic({ reportId, attempt, maxAttempts, result: "provider_failure", ratings: diagRatings });
      failure = {
        outcome: "generation_failure",
        retryable: outcome.retryable,
        message: "Draft generation is temporarily unavailable.",
      };
      if (!outcome.retryable) break;
    } else {
      emitDraftDiagnostic({
        reportId, attempt, maxAttempts, result: "malformed",
        reasons: [outcome.kind === "schema_rejected" ? outcome.detail : String(outcome.kind)],
        ratings: diagRatings,
      });
      failure = {
        outcome: "generation_failure",
        retryable: true,
        message: "The generated draft was malformed and was rejected.",
      };
    }
  }

  // 5 — failure leaves NO false draft_ready: cancel back to
  //     observation_saved with the assessment fully preserved.
  if (panels === null) {
    const cancelled = await db.rpc("report_cancel_draft", {
      p_report_id: reportId,
      p_expected_lock_version: lockVersion,
    });
    // The cancel is best-effort state hygiene; the reported outcome is the
    // generation failure either way, and a cancel CAS miss simply means a
    // concurrent action already moved the report.
    void cancelled;
    return failure ?? {
      outcome: "generation_failure",
      retryable: true,
      message: "Draft generation failed.",
    };
  }

  // 6 — the internal draft-storage path, reached ONLY after validation.
  // The spec §20 source trace is derived from the ACCEPTED panels — after
  // `validateGrounding` returned ok, never before — using the SAME frozen
  // lexicon and matcher that validation itself read, so the trace can never
  // claim a derivation grounding did not see. It travels with the store call
  // and is written in that call's own transaction.
  const sourceMapJson = JSON.stringify(
    deriveSourceMap(panels).map((e) => ({
      output_section: e.outputSection,
      dimension_code: e.dimensionCode,
    })),
  );
  const stored = await deps.trustedStore.storeDraft({
    authUserSub: deps.authUserSub,
    reportId,
    expectedLockVersion: lockVersion,
    observationLockVersion,
    overview: panels.overview,
    strengths: panels.strengths,
    areasForDevelopment: panels.areasForDevelopment,
    remarks: panels.remarks,
    sourceMapJson,
  });
  if (!stored.ok) {
    if (stored.sqlState === "BC004" || stored.sqlState === "BC003") {
      // A concurrent completion won. Idempotency: return the committed state
      // if it is a real draft_ready; otherwise report staleness.
      const reread = await db.rpc("report_get_working", {
        p_class_session_id: input.sessionId,
        p_student_id: input.studentId,
      });
      const row = firstRow<WorkingReportRow>(reread.data);
      if (!reread.error && row && row.status === "draft_ready") {
        return {
          outcome: "success",
          data: {
            reportId,
            status: "draft_ready",
            lockVersion: row.lock_version,
            versionId: row.current_version_id,
            contentHash: row.content_hash,
          },
        };
      }
    }
    return mapSqlErrorToResult(stored.sqlState);
  }

  return {
    outcome: "success",
    data: {
      reportId,
      status: "draft_ready",
      lockVersion: stored.lockVersion,
      versionId: stored.versionId,
      contentHash: stored.contentHash,
    },
  };
}

function buildAiRequest(
  reportId: string,
  observationLockVersion: number,
  studentDisplayName: string,
  saved: TrainerObservationDto,
): AiDraftRequest {
  return {
    reportId,
    observationLockVersion,
    studentDisplayName,
    ratings: FRAMEWORK_DIMENSIONS.map((dim) => {
      const rating = saved.ratings.find((r) => r.dimensionCode === dim.code);
      // isComplete = true guarantees all nine exist; the fallback is typing
      // hygiene, not a reachable path.
      const level = rating?.rating ?? "developing";
      return {
        dimensionCode: dim.code,
        displayName: dim.displayName,
        rating: level,
        anchorText: RUBRIC_ANCHORS[level],
        polarityBand: POLARITY_BANDS[level],
      };
    }),
    strengthChips: saved.strengthChips,
    focusChips: saved.focusChips,
    trainerNotes: saved.observationNotes,
    followUpNotes: saved.followUpNotes,
  };
}
