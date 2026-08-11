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

/**
 * ⚠️ THE SHORT-TTL SERVER-MINTED SIGNED URL — A-001 gate 6.
 *
 * 120 seconds. Long enough for a `<video>` element to begin streaming, short
 * enough that a URL copied out of devtools is dead before it is useful. It is
 * deliberately NOT hours: the URL is a bearer capability, and its lifetime is
 * the only thing bounding who can replay it once it has left this process.
 */
export const EVIDENCE_URL_TTL_SECONDS = 120;

/**
 * Authorize one view, record it, and mint the URL.
 *
 * ⛔ THE ORDER IS LOAD-BEARING AND MUST NOT BE "OPTIMIZED". Authorization and
 * the audit event happen FIRST, inside one governed RPC, and only then is a
 * URL minted. Minting first and auditing afterwards would leave a live URL
 * behind whenever the audit write failed — `evidence.accessed` is the ONLY
 * trace that a URL to a child's video ever existed, and it matters more now
 * that `C-3` removed scanning.
 *
 * ⛔ THE OBJECT KEY IS DERIVED HERE, SERVER-SIDE, AND NEVER CROSSES THE
 * BOUNDARY (A-001 gate 7). The RPC returns a report id and a media type; the
 * path is reconstructed from them and handed straight to the signer.
 *
 * ⛔ NO DOWNLOAD AFFORDANCE (D-5). `createSignedUrl` is called WITHOUT the
 * `download` option, so the URL carries no attachment disposition. Adding it
 * would create the download control D-5 refuses for every role, Parent
 * included — and it would do so invisibly, in an options object.
 */
export async function mintEvidenceViewUrlCore(
  client: SupabaseClient,
  elevated: SupabaseClient,
  evidenceId: string,
): Promise<ActionResult<{ readonly url: string; readonly expiresInSeconds: number }>> {
  const guard = await resolveSessionIdentity(client);
  if (guard.outcome !== "success") return guard;

  // ⚠️ The role check refuses nobody the RPC would admit; it only stops a
  // request reaching the RPC with no identity at all. The gate is the RPC's,
  // resolved live in the database on every call (ADR-4).
  const { data, error } = await client.rpc("evidence_record_access", { p_evidence_id: evidenceId });
  if (error) return { outcome: "unavailable" };

  const row = Array.isArray(data) ? data[0] : data;
  // ⛔ A REFUSAL IS `unauthorized`, NOT AN EMPTY PLAYER. The RPC answers every
  // denial with the same shape, and no reason is disclosed to the caller.
  if (!row || row.o_authorized !== true) return { outcome: "unauthorized" };

  const path = evidenceObjectPath(row.o_report_id, evidenceId, row.o_media_type);
  if (!path) return { outcome: "unavailable" };

  const signed = await elevated.storage
    .from(EVIDENCE_BUCKET)
    .createSignedUrl(path, EVIDENCE_URL_TTL_SECONDS);
  if (signed.error || !signed.data?.signedUrl) return { outcome: "unavailable" };

  return {
    outcome: "success",
    data: { url: signed.data.signedUrl, expiresInSeconds: EVIDENCE_URL_TTL_SECONDS },
  };
}
