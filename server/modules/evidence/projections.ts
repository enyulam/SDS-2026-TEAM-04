/**
 * Evidence read/write projections — D-5's per-child, per-session video
 * evidence, phase P1-2.
 *
 * ⛔ THE PARENT ARM DOES NOT EXIST HERE, DELIBERATELY. A-002 is UNRULED and
 * the Operator reserved it for P1-5. Building an unreachable parent branch
 * now is the S-8 shape exactly: it looks proven because the legs around it
 * pass, while the one path that matters has never returned a row. When A-002
 * is ruled, the arm is added to `evidence_list_for_report` and to this file
 * together, with its own permit leg.
 *
 * ⛔ NO STORAGE PATH CROSSES THIS BOUNDARY OUTWARD. `evidence_list_for_report`
 * returns none, and `evidence_record_access` returns only the report id and
 * media type. The object key is DERIVED here, server-side, and handed to the
 * signing call — never to a client (A-001 gate 7).
 *
 * ⛔ NO DOWNLOAD AFFORDANCE IS PRODUCED ANYWHERE IN THIS MODULE (D-5). The
 * signed URL is minted for streaming; the product provides no download
 * control and does not claim technical impossibility.
 */

import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActionResult } from "@/server/contracts/action-result";
import { resolveSessionIdentity } from "@/server/modules/identity-access/session-core";
import { readRows } from "@/server/platform/query-diagnostics";

/**
 * ⚠️ C-16's ceiling, restated here so the surface can NAME it in a refusal.
 * A trainer who cannot tell why an upload failed will retry it, which is the
 * worst outcome on a classroom network. This constant is a MESSAGE source,
 * never the boundary: the boundary is the bucket row, the CHECK constraint
 * and `evidence_attach_confirm`, all three server-side.
 */
export const EVIDENCE_MAX_BYTES = 104_857_600;
export const EVIDENCE_MAX_LABEL = "100 MB";
export const EVIDENCE_BUCKET = "evidence";

/**
 * ⛔ THE C-3 LIMITATION, IN THE PRODUCT'S OWN WORDS. C-3 removed the scan gate
 * because no scanning infrastructure exists and none will be built, and ruled
 * that the absence be recorded in the instrument AND in the UI's own text.
 * ▶ An honest absence beats a satisfied-looking gate — and a gate removed in
 * an instrument but not surfaced in the product is neither.
 *
 * ⚠️ This string is part of P1-2's ACCEPTANCE, not decoration. It is asserted
 * present on the upload surface by `prove:portal-2`, against comment-stripped
 * source, so a comment explaining the obligation cannot satisfy it.
 */
export const EVIDENCE_UNSCANNED_NOTICE =
  "Uploaded media is not scanned for malware or harmful content. " +
  "A production deployment would require scanning before real media is handled.";

const MEDIA_EXTENSIONS: Readonly<Record<string, string>> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
};

export type EvidenceItemDto = {
  readonly id: string;
  readonly mediaType: string;
  readonly byteSize: number;
  readonly createdAt: string;
};

type EvidenceRow = {
  id: string;
  media_type: string;
  byte_size: number;
  created_at: string;
};

/**
 * The object key, derived rather than stored-and-returned. The storage policy
 * reads the FIRST path segment as the report id and resolves trainer authority
 * over it live, so this shape is load-bearing rather than cosmetic.
 */
export function evidenceObjectPath(
  reportId: string,
  evidenceId: string,
  mediaType: string,
): string | null {
  const ext = MEDIA_EXTENSIONS[mediaType];
  return ext ? `${reportId}/${evidenceId}.${ext}` : null;
}

/** Read the evidence attached to one report. Trainer or management only. */
export async function listEvidenceCore(
  client: SupabaseClient,
  sessionId: string,
  studentId: string,
): Promise<ActionResult<readonly EvidenceItemDto[]>> {
  /*
   * ⚠️ TWO ROLES, SO `requireRole` DOES NOT FIT — it pins exactly one, and
   * D-5 gives this read to the authoring trainer AND to management (which
   * must VIEW the clip before Approve & Submit).
   *
   * ⛔ THE ROLE CHECK HERE IS NOT THE AUTHORIZATION. It refuses `parent`
   * early so no parent request ever reaches the RPC — A-002 is unruled and
   * there is no parent arm to reach. The real gate is the RPC's own live
   * predicate, which resolves session assignment and centre membership in
   * the database on every call (ADR-4). Deleting this check would not widen
   * access; it would only make a parent's refusal arrive later.
   */
  const guard = await resolveSessionIdentity(client);
  if (guard.outcome !== "success") return guard;
  if (guard.data.role !== "trainer" && guard.data.role !== "management") {
    return { outcome: "unauthorized" };
  }

  const rows = await readRows<EvidenceRow>("listEvidenceCore:evidence_list_for_report", () =>
    client.rpc("evidence_list_for_report", {
      p_class_session_id: sessionId,
      p_student_id: studentId,
    }),
  );
  // ⚠️ Q-7: a rejected query is not an empty result. An empty evidence list is
  // exactly the shape a refused read would take on this surface.
  if (!rows.ok) return { outcome: "unavailable" };

  return {
    outcome: "success",
    data: rows.rows.map((r) => ({
      id: r.id,
      mediaType: r.media_type,
      byteSize: r.byte_size,
      createdAt: r.created_at,
    })),
  };
}
