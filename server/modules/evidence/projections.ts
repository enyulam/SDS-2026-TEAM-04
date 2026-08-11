/**
 * Evidence read/write projections — D-5's per-child, per-session video
 * evidence, phase P1-2.
 *
 * ~~⛔ THE PARENT ARM DOES NOT EXIST HERE, DELIBERATELY. A-002 is UNRULED and
 * the Operator reserved it for P1-5.~~ ✅ **STRUCK 2026-08-12 — A-002 WAS RULED
 * FORWARD AND P1-5 BUILT THE ARM.** It was added to `evidence_list_for_report`
 * and to this file together, with its own permit leg, exactly as the struck
 * text said it would be. ⚠️ Preserved rather than deleted because the reason
 * it gave is still the standing rule: **building an unreachable branch is the
 * S-8 shape** — it looks proven because the legs around it pass, while the one
 * path that matters has never returned a row.
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
   * ⛔ THE ROLE CHECK HERE IS NOT THE AUTHORIZATION. The real gate is the
   * RPC's own live predicate, which resolves session assignment, centre
   * membership and — since P1-5 — the parent link and the submitted-report
   * condition, in the database on every call (ADR-4).
   *
   * ⚠️ IT ADMITS `parent` NOW, AND THAT IS A CORRECTION, NOT A WIDENING.
   * ~~It refused `parent` early because A-002 was unruled and there was no
   * parent arm to reach.~~ A-002 was ruled forward on 2026-08-12 and P1-5
   * built the arm; leaving the early refusal here would have made this
   * function the one place a permitted parent read still died — ▶ **a stale
   * guard in a caller silently outranking the corrected RPC beneath it**,
   * which is the restatement defect wearing a different hat.
   * ⛔ THE PARENT'S GATE IS THE RPC'S, AND IT IS STRICTLY NARROWER than this
   * check: linked learner only, submitted report only.
   */
  const guard = await resolveSessionIdentity(client);
  if (guard.outcome !== "success") return guard;

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

// =====================================================================
// P1-2b — THE UPLOAD TRANSPORT.
// =====================================================================

/**
 * ⚠️ SUPABASE'S RESUMABLE ENDPOINT REQUIRES EXACTLY 6 MiB CHUNKS for every
 * part but the last. This is not a tuning knob: a different size is rejected
 * by the TUS server, so it is stated once here and consumed by the client.
 */
export const EVIDENCE_UPLOAD_CHUNK_BYTES = 6 * 1024 * 1024;

export const EVIDENCE_MEDIA_TYPES: readonly string[] = ["video/mp4", "video/quicktime"];

export type EvidenceUploadTicket = {
  readonly evidenceId: string;
  readonly reportId: string;
  readonly bucket: string;
  readonly objectPath: string;
  readonly maxBytes: number;
  readonly chunkBytes: number;
};

/**
 * ⛔ A TICKET IS AN IDENTITY AND A PATH. IT IS NOT AN AUTHORIZATION.
 *
 * This mints the evidence id and derives the object key server-side, so the
 * client never chooses either. But nothing here is what stops an unauthorized
 * upload: ▶ **a forged ticket buys nothing**, because `storage.objects`' one
 * INSERT policy re-derives trainer authority over the report named in the
 * FIRST PATH SEGMENT, live, on the actual INSERT (ADR-4).
 *
 * ⚠️ THE CHECKS BELOW ARE THERE TO FAIL EARLY AND SAY WHY. Deleting them would
 * not widen access; it would only move a refusal from a clear message to an
 * opaque storage error after a 100 MB upload has already run.
 *
 * ⛔ THE ADR-3 EXCEPTION LIVES HERE, AND THIS IS ITS EXACT SHAPE. The browser
 * writes DIRECTLY to storage under RLS — the only governed-adjacent client
 * write in the project. What it can write is bounded to: an OPAQUE OBJECT ·
 * into a PRIVATE bucket (no SELECT/UPDATE/DELETE policy exists for any role) ·
 * at a path it must prove TRAINER AUTHORITY over · GOVERNED BY NOTHING until
 * `evidence_attach_confirm` attaches it. Until that call the object is
 * referenced by no row and reachable by no read path — it is bytes with a
 * name. **The governed act is the attach, and the attach is server-side.**
 */
export async function createEvidenceUploadTicketCore(
  client: SupabaseClient,
  reportId: string,
  mediaType: string,
  byteSize: number,
): Promise<ActionResult<EvidenceUploadTicket>> {
  const guard = await resolveSessionIdentity(client);
  if (guard.outcome !== "success") return guard;
  // Trainer only (D-5). Management may never attach — `CLAUDE.md` §6 forbids a
  // management write reaching evidence, and that is not a D-5 choice.
  if (guard.data.role !== "trainer") return { outcome: "unauthorized" };

  if (!EVIDENCE_MEDIA_TYPES.includes(mediaType)) return { outcome: "unavailable" };
  if (!Number.isInteger(byteSize) || byteSize <= 0 || byteSize > EVIDENCE_MAX_BYTES) {
    return { outcome: "unavailable" };
  }

  // ⛔ The evidence id is minted HERE. A client-chosen id could be aimed at
  // another report's key space; the path is derived from this pair and nothing
  // else, and the policy parses the report id back out of it.
  const evidenceId = globalThis.crypto.randomUUID();
  const objectPath = evidenceObjectPath(reportId, evidenceId, mediaType);
  if (!objectPath) return { outcome: "unavailable" };

  return {
    outcome: "success",
    data: {
      evidenceId,
      reportId,
      bucket: EVIDENCE_BUCKET,
      objectPath,
      maxBytes: EVIDENCE_MAX_BYTES,
      chunkBytes: EVIDENCE_UPLOAD_CHUNK_BYTES,
    },
  };
}

/**
 * The governed attach. ⛔ THIS is the act that makes an uploaded object into
 * evidence — the upload before it created nothing governed at all.
 *
 * ⚠️ THE REASON IS DISCLOSED ONLY AFTER AUTHORIZATION SUCCEEDS. Every
 * authorization failure collapses to `not_permitted` inside the RPC, so a
 * caller never learns whether a report exists or merely lies beyond them. The
 * discriminating reasons (`already_attached`, `too_large`, `object_missing`,
 * `object_ambiguous`, `unsupported_type`) are diagnostics for someone already
 * proven to be the authoring trainer — the same principle that put the size
 * ceiling on the surface: a trainer who cannot tell why an upload failed will
 * retry it.
 */
export type EvidenceAttachOutcome = {
  readonly attached: boolean;
  readonly reason: string;
};

export async function confirmEvidenceAttachCore(
  client: SupabaseClient,
  reportId: string,
  evidenceId: string,
): Promise<ActionResult<EvidenceAttachOutcome>> {
  const guard = await resolveSessionIdentity(client);
  if (guard.outcome !== "success") return guard;

  const { data, error } = await client.rpc("evidence_attach_confirm", {
    p_report_id: reportId,
    p_evidence_id: evidenceId,
  });
  if (error) return { outcome: "unavailable" };

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { outcome: "unavailable" };

  return {
    outcome: "success",
    data: { attached: row.o_attached === true, reason: String(row.o_reason ?? "not_permitted") },
  };
}

/**
 * Withdraw evidence. ⛔ TRAINER ONLY, AND NOT LIMITED TO PRE-SUBMITTED
 * (Operator ruling) — removal WITHDRAWS media rather than editing an approved
 * artefact, and a wrong clip that reached a parent must be pullable.
 *
 * ⚠️ ROW FIRST, OBJECT SECOND, AND THE ORDER IS DELIBERATE. The RPC deletes
 * the row and returns the path; the object is deleted afterwards with the
 * elevated client, because removing the backing file needs the Storage API.
 * A dangling ROW pointing at a deleted object would be worse than an orphaned
 * OBJECT pointing at nothing — and the sweeper collects the latter.
 *
 * ⛔ A FAILED OBJECT DELETE DOES NOT UNDO THE REMOVAL. The governed fact is
 * "this evidence is withdrawn", and that fact is committed with its audit
 * event before the file is touched. Reporting failure here would tell the
 * trainer the clip is still attached when it is not.
 */
export async function removeEvidenceCore(
  client: SupabaseClient,
  elevated: SupabaseClient,
  evidenceId: string,
): Promise<ActionResult<{ readonly removed: boolean }>> {
  const guard = await resolveSessionIdentity(client);
  if (guard.outcome !== "success") return guard;
  if (guard.data.role !== "trainer") return { outcome: "unauthorized" };

  const { data, error } = await client.rpc("evidence_remove", { p_evidence_id: evidenceId });
  if (error) return { outcome: "unavailable" };

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || row.o_removed !== true) return { outcome: "unauthorized" };

  if (typeof row.o_object_path === "string" && row.o_object_path.length > 0) {
    await elevated.storage.from(EVIDENCE_BUCKET).remove([row.o_object_path]);
  }

  return { outcome: "success", data: { removed: true } };
}
