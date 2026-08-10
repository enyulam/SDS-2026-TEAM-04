"use server";

/**
 * The contract §5.1 server actions — SERVER-ONLY wrappers binding each core
 * to the request-scoped authenticated Supabase client. Every action:
 *   - carries the CALLER'S OWN credential (the `authenticated` role) into
 *     the governed RPC, which re-derives all authority from auth.uid();
 *   - performs NO direct table mutation — the only writes are the RPCs;
 *   - adds no authority: no role query parameter, header or route value is
 *     read anywhere in this file.
 *
 * `reopenSubmitted` (RPC-12) is DELIBERATELY ABSENT: post-submission
 * correction initiation is deferred (contract §3/§5.1) and must not be
 * wired to a participant-reachable control.
 */

import { createRequestSupabaseClient } from "@/server/platform/supabase/request";
import { getServerConfig } from "@/server/platform/env";
import type { ActionResult } from "@/server/contracts/action-result";
import {
  saveObservationCore,
  getTrainerObservationCore,
  type SaveObservationInput,
  type SaveObservationSuccess,
  type TrainerObservationDto,
} from "@/server/modules/observation/core";
import {
  managementApproveAndSubmitCore,
  managementEditWordingCore,
  managementReturnToTrainerCore,
  saveTrainerEditCore,
  trainerApproveCore,
  updateTrainerChecklistCore,
  type ManagementApproveAndSubmitInput,
  type ManagementApproveAndSubmitSuccess,
  type ManagementEditWordingInput,
  type ManagementEditWordingSuccess,
  type ManagementReturnInput,
  type ManagementReturnSuccess,
  type SaveTrainerEditInput,
  type SaveTrainerEditSuccess,
  type TrainerApproveInput,
  type TrainerApproveSuccess,
  type UpdateTrainerChecklistInput,
} from "@/server/modules/report-workflow/core";
import {
  requestDraftCore,
  type RequestDraftInput,
  type RequestDraftSuccess,
} from "@/server/modules/ai-drafting/request-draft-core";
import { OpenAiDraftProvider } from "@/server/modules/ai-drafting/provider";
import { createTrustedDraftStore } from "@/server/modules/ai-drafting/trusted-store-transport";
import { emitDraftDiagnostic } from "@/server/modules/ai-drafting/draft-diagnostics";
import type { TrustedDraftStore } from "@/server/modules/ai-drafting/trusted-store";
import { readRows } from "@/server/platform/query-diagnostics";

export async function saveObservation(
  input: SaveObservationInput,
): Promise<ActionResult<SaveObservationSuccess>> {
  const client = await createRequestSupabaseClient();
  return saveObservationCore(client, input);
}

export async function getTrainerObservation(
  sessionId: string,
  studentId: string,
): Promise<ActionResult<TrainerObservationDto>> {
  const client = await createRequestSupabaseClient();
  return getTrainerObservationCore(client, sessionId, studentId);
}

export async function requestDraft(
  input: RequestDraftInput,
): Promise<ActionResult<RequestDraftSuccess>> {
  const client = await createRequestSupabaseClient();

  // The trusted channel's claims come from the VERIFIED session, never from
  // the request body; a caller with no session fails here, before anything.
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData?.user) {
    // Previously a silent early return. A draft that never happens because the
    // session was not accepted looked identical, in every log, to one that was
    // never requested.
    emitDraftDiagnostic({ reportId: "(unresolved)", attempt: 0, maxAttempts: 0, result: "unauthenticated" });
    return { outcome: "unauthenticated" };
  }

  // Participant path: the REAL provider, unconditionally (gate G-19). The
  // deterministic fixture provider is constructed only by automated tests,
  // never here — there is no switch to flip.
  let provider: OpenAiDraftProvider;
  let trustedStore: TrustedDraftStore;
  try {
    const config = getServerConfig();
    provider = new OpenAiDraftProvider({
      apiKey: config.llm.apiKey,
      model: config.llm.model,
    });
    // Resolved HERE, before any provider call, so a misconfigured transport
    // costs nothing. Deferring it to the store step would burn a billable
    // generation and only then discover the draft cannot be persisted.
    // It FAILS CLOSED: absent, blank or unknown throws (no default).
    trustedStore = createTrustedDraftStore();
  } catch (configError: unknown) {
    // ⚠️ THIS CATCH WAS EMPTY. The comment claimed a server-side diagnostic
    // "stays server-side" — there was none, so the EARLIEST failure in the
    // whole drafting path was the one failure nobody could see. It returned a
    // neutral message, wrote nothing, touched no lifecycle state, and left an
    // operator with a POST 200 and no explanation.
    //
    // Every message reaching here is authored by env.ts / llm-config.ts /
    // trusted-store-transport.ts and NAMES A VARIABLE, NEVER A VALUE — that is
    // a property of those modules, not a hope about this one.
    emitDraftDiagnostic({
      reportId: "(unresolved)",
      attempt: 0,
      maxAttempts: 0,
      result: "not_configured",
      reasons: [configError instanceof Error ? configError.message : "unknown configuration failure"],
    });
    return {
      outcome: "generation_failure",
      retryable: false,
      message: "Draft generation is not configured on this environment.",
    };
  }

  /*
   * ⚠️ THE LEARNER'S NAME IS READ HERE, BEFORE `requestDraftCore`, AND A
   * REJECTION FAILS THE ACTION.
   *
   * It used to be read inside the `readStudentDisplayName` callback, which
   * never destructured `error` — and `request-draft-core` substitutes
   * `"the student"` for a null. ⛔ So a REJECTED read did not merely lose a
   * name: it sent a prompt built from a placeholder to the LLM, produced a
   * real draft addressing "the student", and persisted it as a governed
   * `report_version`. Nothing downstream could tell that from a learner whose
   * name is genuinely unrecorded.
   *
   * ⚠️ Hoisting it keeps the fix INSIDE this module. The alternative was to
   * widen `RequestDraftDeps.readStudentDisplayName` to carry a failure
   * channel, which would have rippled a contract change through
   * `ai-drafting`'s governed core — grounding, idempotency and persistence —
   * to fix a read that belongs to this module. **The null fallback survives
   * for its legitimate case** (a genuinely absent name); what no longer
   * reaches it is a rejection.
   */
  const studentRows = await readRows<{ full_name?: string }>(
    "requestDraft:students",
    () => client.from("students").select("id, full_name").eq("id", input.studentId),
  );
  if (!studentRows.ok) return { outcome: "unavailable" };
  const studentDisplayName = studentRows.rows[0]?.full_name ?? null;

  return requestDraftCore(
    {
      db: client,
      provider,
      trustedStore,
      authUserSub: userData.user.id,
      readStudentDisplayName: async () => studentDisplayName,
    },
    input,
  );
}

export async function saveTrainerEdit(
  input: SaveTrainerEditInput,
): Promise<ActionResult<SaveTrainerEditSuccess>> {
  const client = await createRequestSupabaseClient();
  return saveTrainerEditCore(client, input);
}

export async function updateTrainerChecklist(
  input: UpdateTrainerChecklistInput,
): Promise<ActionResult<{ reportId: string }>> {
  const client = await createRequestSupabaseClient();
  return updateTrainerChecklistCore(client, input);
}

export async function trainerApprove(
  input: TrainerApproveInput,
): Promise<ActionResult<TrainerApproveSuccess>> {
  const client = await createRequestSupabaseClient();
  return trainerApproveCore(client, input);
}

export async function managementEditWording(
  input: ManagementEditWordingInput,
): Promise<ActionResult<ManagementEditWordingSuccess>> {
  const client = await createRequestSupabaseClient();
  return managementEditWordingCore(client, input);
}

export async function managementReturnToTrainer(
  input: ManagementReturnInput,
): Promise<ActionResult<ManagementReturnSuccess>> {
  const client = await createRequestSupabaseClient();
  return managementReturnToTrainerCore(client, input);
}

export async function managementApproveAndSubmit(
  input: ManagementApproveAndSubmitInput,
): Promise<ActionResult<ManagementApproveAndSubmitSuccess>> {
  const client = await createRequestSupabaseClient();
  return managementApproveAndSubmitCore(client, input);
}
