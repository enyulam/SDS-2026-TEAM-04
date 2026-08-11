/**
 * P1-2b — THE RESUMABLE UPLOAD TRANSPORT (client-side, browser only).
 *
 * =====================================================================
 * ⛔ THIS IS THE ONE PLACE A BROWSER IN THIS PROJECT WRITES DIRECTLY TO
 *    SUPABASE. IT IS A REASONED, BOUNDED EXCEPTION TO ADR-3.
 * =====================================================================
 *
 * WHY THE EXCEPTION EXISTS. ADR-3 puts governed writes in server code. A 100 MB
 * video relayed through a Server Action is neither resumable nor within the
 * framework's body limits, and a trainer on a classroom network is exactly the
 * caller who needs a transfer that survives a dropped connection. ▶ **So the
 * BYTES go direct and the GOVERNED ACT does not.**
 *
 * ⛔ WHAT THE CLIENT CAN ACTUALLY WRITE, STATED EXACTLY — this list is the
 *    exception's boundary, and nothing here may be widened without a ruling:
 *
 *   . an OPAQUE OBJECT — no schema, no governed meaning, no lifecycle;
 *   . into a PRIVATE bucket — `public = false`, and no SELECT, UPDATE or
 *     DELETE policy exists for ANY role, so nothing can be read back through
 *     RLS by anyone, including the uploader;
 *   . at a path it must prove TRAINER AUTHORITY over — the first path segment
 *     is the report id and `app_trainer_may_attach_evidence` resolves that
 *     authority LIVE on the INSERT (ADR-4), never from a claim or a ticket;
 *   . GOVERNED BY NOTHING until `confirmEvidenceAttach` attaches it. Until
 *     that server call succeeds the object is referenced by no row and
 *     reachable by no read path. ▶ **It is bytes with a name.**
 *
 * ⚠️ THE TICKET IS NOT A CAPABILITY. It carries an id and a path the server
 *    minted; forging one buys nothing, because the policy re-derives authority
 *    from the path itself on every INSERT.
 *
 * ⚠️ AN ABANDONED UPLOAD LEAVES AN ORPHANED OBJECT, AND THAT IS A STATED
 *    LIMITATION. `npm run sweep:evidence-orphans` collects them — ⛔ MANUALLY.
 *    No scheduler exists in this project and adding one is hosted work, which
 *    is a `CLAUDE.md` §12 stop-and-ask. **Nothing in this file, and nothing on
 *    the surface it serves, may imply the sweeper runs by itself.**
 *
 * ⛔ NO CREDENTIAL IS CONSTRUCTED, STORED OR LOGGED HERE. The bearer token is
 *    the caller's own live session, read from the browser client at call time
 *    and passed straight to the request. It is never persisted, never placed
 *    in a message and never returned.
 */

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { getPublicSupabaseConfig } from "@/lib/supabase/public-config";
import type { EvidenceUploadTicketDto } from "@/lib/frontend/contracts/physical-test";

/**
 * ⚠️ NOT A TUNING KNOB. Supabase's resumable endpoint requires exactly 6 MiB
 * parts for every chunk but the last; a different size is refused by the TUS
 * server. The server states it on the ticket and this file consumes it.
 */
const TUS_VERSION = "1.0.0";

export type EvidenceUploadProgress = {
  readonly sentBytes: number;
  readonly totalBytes: number;
};

/**
 * ⛔ EVERY OUTCOME IS NAMED, AND `refused` IS DELIBERATELY DISTINCT FROM
 * `failed`. A refusal is the governance layer working; a failure is the
 * network. Collapsing them would teach a trainer to retry a refusal, which is
 * the behaviour the size ceiling was surfaced to prevent.
 */
export type EvidenceUploadOutcome =
  | { readonly outcome: "success" }
  | { readonly outcome: "refused" }
  | { readonly outcome: "failed" };

function encodeMetadata(entries: ReadonlyArray<readonly [string, string]>): string {
  return entries
    .map(([k, v]) => `${k} ${globalThis.btoa(unescape(encodeURIComponent(v)))}`)
    .join(",");
}

/**
 * Upload one file to the ticket's path, resumably.
 *
 * ⚠️ RESUMPTION IS THE POINT, SO IT IS IMPLEMENTED RATHER THAN CLAIMED. On a
 * failed `PATCH` the client asks the server (`HEAD`) where it actually got to
 * and continues from THAT offset — never from a locally remembered one, which
 * would silently corrupt the object whenever the two disagreed.
 */
export async function uploadEvidenceResumable(
  file: File,
  ticket: EvidenceUploadTicketDto,
  onProgress?: (p: EvidenceUploadProgress) => void,
  signal?: AbortSignal,
): Promise<EvidenceUploadOutcome> {
  // Client-side guards are UX ONLY. The bucket row, the storage service, the
  // `CHECK` constraint and `evidence_attach_confirm` all re-check server-side,
  // and the attach reads the size and type from the STORED OBJECT.
  if (file.size <= 0 || file.size > ticket.maxBytes) return { outcome: "refused" };

  const { url } = getPublicSupabaseConfig();
  const endpoint = `${url}/storage/v1/upload/resumable`;

  const session = await createBrowserSupabaseClient().auth.getSession();
  const token = session.data.session?.access_token;
  if (!token) return { outcome: "refused" };

  const authHeaders: Record<string, string> = {
    authorization: `Bearer ${token}`,
    "tus-resumable": TUS_VERSION,
  };

  let location: string;
  try {
    const created = await fetch(endpoint, {
      method: "POST",
      signal: signal ?? null,
      headers: {
        ...authHeaders,
        "upload-length": String(file.size),
        "upload-metadata": encodeMetadata([
          ["bucketName", ticket.bucket],
          ["objectName", ticket.objectPath],
          ["contentType", file.type],
          ["cacheControl", "3600"],
        ]),
        // ⛔ NEVER UPSERT. An existing object at this key must not be silently
        // replaced: the key encodes a report and an evidence id, and
        // overwriting one would swap the clip under an attached row.
        "x-upsert": "false",
      },
    });
    // 4xx here is the POLICY or the bucket refusing — the ceiling, a path the
    // caller has no authority over, a submitted report, a wrong mime type.
    if (created.status >= 400 && created.status < 500) return { outcome: "refused" };
    const loc = created.headers.get("location");
    if (!created.ok || !loc) return { outcome: "failed" };
    location = new URL(loc, endpoint).toString();
  } catch {
    return { outcome: "failed" };
  }

  let offset = 0;
  let consecutiveFailures = 0;

  while (offset < file.size) {
    const end = Math.min(offset + ticket.chunkBytes, file.size);
    let response: Response;
    try {
      response = await fetch(location, {
        method: "PATCH",
        signal: signal ?? null,
        headers: {
          ...authHeaders,
          "content-type": "application/offset+octet-stream",
          "upload-offset": String(offset),
        },
        body: file.slice(offset, end),
      });
    } catch {
      // ⚠️ ASK THE SERVER, DO NOT ASSUME. A locally remembered offset that
      // disagrees with the server's produces a corrupt object that uploads
      // "successfully" — the worst possible failure mode for evidence.
      consecutiveFailures += 1;
      if (consecutiveFailures > 3) return { outcome: "failed" };
      const resumed = await resolveOffset(location, authHeaders, signal);
      if (resumed === null) return { outcome: "failed" };
      offset = resumed;
      continue;
    }

    if (response.status >= 400 && response.status < 500) return { outcome: "refused" };
    if (!response.ok) {
      consecutiveFailures += 1;
      if (consecutiveFailures > 3) return { outcome: "failed" };
      const resumed = await resolveOffset(location, authHeaders, signal);
      if (resumed === null) return { outcome: "failed" };
      offset = resumed;
      continue;
    }

    consecutiveFailures = 0;
    const reported = Number(response.headers.get("upload-offset"));
    offset = Number.isFinite(reported) && reported > offset ? reported : end;
    onProgress?.({ sentBytes: offset, totalBytes: file.size });
  }

  return { outcome: "success" };
}

async function resolveOffset(
  location: string,
  headers: Record<string, string>,
  signal?: AbortSignal,
): Promise<number | null> {
  try {
    const head = await fetch(location, { method: "HEAD", headers, signal: signal ?? null });
    if (!head.ok) return null;
    const value = Number(head.headers.get("upload-offset"));
    return Number.isFinite(value) && value >= 0 ? value : null;
  } catch {
    return null;
  }
}
