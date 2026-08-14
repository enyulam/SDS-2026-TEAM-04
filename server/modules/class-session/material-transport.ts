import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActionResult } from "@/server/contracts/action-result";
import { readMaybeRow } from "@/server/platform/query-diagnostics";
import { resolveSessionIdentity } from "@/server/modules/identity-access/session-core";

/**
 * `P2-6R` — the APPLICATION layer over the lesson-materials functions.
 *
 * ⛔ WHY THIS FILE EXISTS. `P2-6` shipped the database half complete and
 * correct — one table, a private bucket, a storage policy, five functions, all
 * granted — and **shipped a surface over an unwired write path**. Three of the
 * five were named in the application ONLY INSIDE COMMENTS, so the upload,
 * download and remove controls rendered permanently disabled. ▶ The Operator
 * learned it by clicking the button. `PDTa-WIRED` now fails any RPC that no
 * application code reaches, and this file is what makes these three pass
 * HONESTLY rather than by exemption.
 *
 * ⛔ NO SCHEMA. Not one migration, column, policy, grant or function. The
 * database layer was already right; only the path to it was missing.
 *
 * ⚠️ THE GOVERNED ACT IS THE ATTACH, NOT THE UPLOAD — the same rule `D-5`
 * records for evidence. Until `material_attach_confirm` succeeds the uploaded
 * object is referenced by no row and reachable by no read path, and the audit
 * event fires from the attach, never from the transfer.
 *
 * ⛔ MANAGEMENT ONLY, EVERY PATH. A lesson material is `D-4` teaching material
 * owned by the centre, not learner data — the mirror image of evidence, which
 * is TRAINER-only. Neither role inherits the other's capability by proximity.
 */

/** The eight ruled MIME types, and the extension each object must carry. */
const MATERIAL_TYPES: Readonly<Record<string, string>> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/msword": "doc",
  "image/png": "png",
  "image/jpeg": "jpg",
  "text/plain": "txt",
};

/**
 * ⛔ 25 MiB, and it is stated here ONLY as a client-side courtesy. The bucket
 * row, the `CHECK` constraint and `material_attach_confirm` each re-check it
 * server-side against the STORED object, so a caller cannot declare a small
 * file and upload a large one.
 */
export const MATERIAL_MAX_BYTES = 26_214_400;
/*
 * ⚠️ NO CHUNK SIZE. `D-5`'s evidence transport carries `chunkBytes` because a
 * resumable TUS upload requires exactly 6 MiB parts. ⛔ THE RELAY IS NOT
 * RESUMABLE and has no parts, so there is deliberately no constant here to
 * imply otherwise — a leftover `chunkBytes` would be the stale-restatement
 * family (§12.11), describing a mechanism this file does not have.
 */
export const MATERIAL_BUCKET = "lesson-materials";
export const MATERIAL_URL_TTL_SECONDS = 120;

export interface MaterialViewUrl {
  readonly url: string;
  readonly mediaType: string;
  readonly expiresInSeconds: number;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/**
 * Derive the one object path the storage policy will admit.
 *
 * ⛔ THE PATH SHAPE IS THE POLICY'S, NOT THIS FILE'S. The policy admits exactly
 * `<class_session_id>/<material_id>.<ext>` with both segments UUIDs, and
 * `material_attach_confirm` finds the object by that same prefix. ▶ A path built
 * any other way is refused by the DATABASE, so this function cannot widen access
 * by getting it wrong — it can only fail to work.
 *
 * ⛔ THE MATERIAL ID IS MINTED HERE AND NEVER ACCEPTED FROM A CALLER. A
 * caller-chosen id could be aimed at another session's key space.
 *
 * ⚠️ INTERNAL. It is deliberately NOT a port member — see `uploadMaterialCore`.
 */
export function mintMaterialObjectPath(
  classSessionId: string,
  mediaType: string,
): { readonly materialId: string; readonly objectPath: string } | null {
  const extension = MATERIAL_TYPES[mediaType];
  if (extension === undefined) return null;
  if (!UUID.test(classSessionId)) return null;
  const materialId = globalThis.crypto.randomUUID();
  return { materialId, objectPath: `${classSessionId}/${materialId}.${extension}` };
}

/**
 * ⛔ THE WHOLE UPLOAD, IN ONE SERVER ACTION — `P2-6R`, Operator-ruled 2026-08-15.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * ⚠️ WHY THIS IS ONE CALL AND NOT THE TICKET → UPLOAD → ATTACH SPLIT EVIDENCE
 *    USES. THE SPLIT EXISTED TO SERVE A BROWSER-DIRECT UPLOAD, AND THERE IS NO
 *    LONGER ONE.
 * ═══════════════════════════════════════════════════════════════════════════
 * `D-5`'s three-step shape is right when the BYTES bypass the server: the
 * ticket is the only thing the server can hand out in advance, and the attach is
 * the only place the governed act can happen afterwards. ▶ **Here the bytes come
 * through the server anyway.** Splitting the same round trip into two would buy
 * nothing and would COST something real: a window in which an object sits in the
 * bucket referenced by no row, reachable by no read, and cleanable by no
 * caller. ⛔ One call has no such window.
 *
 * ⛔ THE UPLOAD RUNS ON THE CALLER'S OWN REQUEST-SCOPED CLIENT, NEVER THE
 *    ELEVATED ONE. That is the entire reason this needed no `T-P44` widening:
 *    ADR-3 records that *"the database role follows the credential, not the code
 *    location"*, so this INSERT is the `authenticated` principal the storage
 *    policy already gates, and `app_management_may_attach_material` re-derives
 *    live management authority over the session named in the path. ▶ Using the
 *    elevated client here would BYPASS that policy entirely and would be a
 *    governance defect, not an optimisation.
 *
 * ⚠️ NOT RESUMABLE, AND THE SURFACE SAYS SO. A dropped upload restarts from the
 *    beginning. `D-5`'s resumable transport was reasoned from 100 MB classroom
 *    video over classroom wifi; a 25 MiB document is a different problem.
 */
export async function uploadMaterialCore(
  client: SupabaseClient,
  elevated: SupabaseClient,
  classSessionId: string,
  file: File,
  displayName: string,
): Promise<ActionResult<{ readonly materialId: string }>> {
  const guard = await resolveSessionIdentity(client);
  if (guard.outcome !== "success") return guard;
  // ⛔ MANAGEMENT ONLY. A trainer DOWNLOADS a material and never attaches one.
  if (guard.data.role !== "management") return { outcome: "unauthorized" };

  /*
   * ⚠️ EVERY CHECK BELOW IS A UX-HONEST REFUSAL, NOT A GATE. The bucket's own
   * `file_size_limit`, the `CHECK` constraint and `material_attach_confirm`
   * reading the STORED object each re-enforce the ceiling and the type list
   * server-side. ▶ Refusing here only means the caller gets a clean answer
   * instead of a 25 MiB round trip that fails at the end.
   */
  if (file.size <= 0 || file.size > MATERIAL_MAX_BYTES) return { outcome: "unavailable" };
  const trimmed = displayName.trim();
  if (trimmed.length === 0 || trimmed.length > 200) return { outcome: "unavailable" };

  const minted = mintMaterialObjectPath(classSessionId, file.type);
  if (minted === null) return { outcome: "unavailable" };

  const stored = await client.storage.from(MATERIAL_BUCKET).upload(minted.objectPath, file, {
    contentType: file.type,
    // ⛔ NEVER UPSERT. The key encodes a session and a material id; overwriting
    // one would swap the file under an already-attached row.
    upsert: false,
  });
  // A 4xx here IS the policy refusing — a session the caller has no authority
  // over, or a path shape the predicate rejects. It is not reported as an error.
  if (stored.error) return { outcome: "unauthorized" };

  const attached = await attachMaterialCore(client, classSessionId, minted.materialId, trimmed);
  if (attached.outcome !== "success") {
    /*
     * ⛔ THE OBJECT IS CLEANED UP RATHER THAN ORPHANED. The bucket carries an
     * INSERT policy and no DELETE policy, so the caller cannot remove what it
     * just wrote — the elevated client does it. ⚠️ THAT IS NOT A POLICY BYPASS:
     * it deletes an object this same call created moments ago, which is
     * referenced by no row and readable by nobody. ▶ Leaving it would be an
     * orphan in a private bucket with no sweeper.
     */
    await elevated.storage.from(MATERIAL_BUCKET).remove([minted.objectPath]);
    return attached;
  }
  return { outcome: "success", data: { materialId: minted.materialId } };
}

interface AttachRow {
  readonly o_attached: boolean | null;
}
interface SignedRow {
  readonly o_object_path: string | null;
  readonly o_media_type: string | null;
}
interface RemoveRow {
  readonly o_removed: boolean | null;
  readonly o_object_path: string | null;
}

/**
 * The governed attach.
 *
 * ⛔ `readMaybeRow`, NOT `readRows` — all three RPCs are `RETURNS record`, so
 * PostgREST resolves them to a BARE OBJECT. `P2-7` lost a whole surface of KPI
 * tiles to exactly this, and `PDSa-SHAPE` now fails the build for it.
 */
export async function attachMaterialCore(
  client: SupabaseClient,
  classSessionId: string,
  materialId: string,
  displayName: string,
): Promise<ActionResult<{ readonly materialId: string }>> {
  if (!UUID.test(classSessionId) || !UUID.test(materialId)) return { outcome: "unavailable" };
  const trimmed = displayName.trim();
  if (trimmed.length === 0 || trimmed.length > 200) return { outcome: "unavailable" };

  const found = await readMaybeRow<AttachRow>("attachMaterialCore:material_attach_confirm", () =>
    client.rpc("material_attach_confirm", {
      p_class_session_id: classSessionId,
      p_material_id: materialId,
      p_display_name: trimmed,
    }),
  );
  if (!found.ok) return { outcome: "unavailable" };
  /*
   * ⛔ `false` IS A REFUSAL, AND IT IS REPORTED AS ONE (Q-7). The RPC returns
   * `false` when the caller is not management for that centre, the object is
   * missing, the MIME type is outside the ruled eight or the size exceeds the
   * ceiling — every one of those is the governance layer working. It never
   * throws, so a caller that ignored the boolean would report SUCCESS on a
   * REFUSED attach and leave an unreferenced object behind it.
   */
  if (found.rows?.o_attached !== true) return { outcome: "unauthorized" };
  return { outcome: "success", data: { materialId } };
}

/**
 * The read path: resolve the object through the governed RPC, then mint a
 * SHORT-TTL SERVER-MINTED signed URL.
 *
 * ⚠️ TWO CLIENTS, DELIBERATELY — the same split `P1-5` uses for evidence. The
 * REQUEST client carries the caller's own identity, so the RPC's live gate
 * applies. The ELEVATED client only SIGNS a path the RPC has already
 * authorized; ⛔ it never decides who may view, and it is never reached before
 * authorization succeeds.
 */
export async function materialViewUrlCore(
  client: SupabaseClient,
  elevated: SupabaseClient,
  materialId: string,
): Promise<ActionResult<MaterialViewUrl>> {
  if (!UUID.test(materialId)) return { outcome: "unavailable" };

  const found = await readMaybeRow<SignedRow>("materialViewUrlCore:material_signed_path", () =>
    client.rpc("material_signed_path", { p_material_id: materialId }),
  );
  if (!found.ok) return { outcome: "unavailable" };
  const path = found.rows?.o_object_path ?? null;
  const mediaType = found.rows?.o_media_type ?? null;
  // A refusal returns NULLs — never an empty string, and never a guessed path.
  if (path === null || mediaType === null) return { outcome: "unauthorized" };

  const signed = await elevated.storage
    .from(MATERIAL_BUCKET)
    .createSignedUrl(path, MATERIAL_URL_TTL_SECONDS);
  if (signed.error || !signed.data?.signedUrl) return { outcome: "unavailable" };
  return {
    outcome: "success",
    data: {
      url: signed.data.signedUrl,
      mediaType,
      expiresInSeconds: MATERIAL_URL_TTL_SECONDS,
    },
  };
}

/**
 * Remove a material.
 *
 * ⚠️ THE ROW IS REMOVED BY THE RPC, WHICH ALSO EMITS `material.removed`; the
 * OBJECT is deleted afterwards with the elevated client, because the bucket
 * carries an INSERT policy and no DELETE policy. ▶ Order matters and it is not
 * arbitrary: the governed row-and-audit removal commits FIRST, so a failed
 * object delete leaves an ORPHANED OBJECT in a private bucket rather than a
 * surviving row pointing at nothing a reader could fetch.
 */
export async function removeMaterialCore(
  client: SupabaseClient,
  elevated: SupabaseClient,
  materialId: string,
): Promise<ActionResult<{ readonly removed: boolean }>> {
  if (!UUID.test(materialId)) return { outcome: "unavailable" };

  const found = await readMaybeRow<RemoveRow>("removeMaterialCore:material_remove", () =>
    client.rpc("material_remove", { p_material_id: materialId }),
  );
  if (!found.ok) return { outcome: "unavailable" };
  if (found.rows?.o_removed !== true) return { outcome: "unauthorized" };

  const path = found.rows.o_object_path;
  if (path !== null) {
    // Best-effort: the governed removal has already committed.
    await elevated.storage.from(MATERIAL_BUCKET).remove([path]);
  }
  return { outcome: "success", data: { removed: true } };
}
