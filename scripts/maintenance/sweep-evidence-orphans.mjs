#!/usr/bin/env node
// =====================================================================
// EVIDENCE ORPHAN SWEEPER — portal phase P1-2, D-5.
// =====================================================================
// ⛔ WHY THIS EXISTS. C-16 requires RESUMABLE upload, which requires the
// client to write directly to Storage under one narrow RLS policy. An upload
// that is never confirmed therefore leaves an OBJECT WITH NO ROW — invisible
// to every read path, referenced by nothing, and consuming storage forever.
//
// The Operator asked what a sweeper would cost. The honest answer, in two
// halves:
//
//   * THE SCRIPT IS CHEAP — this file. So it is built.
//   * ⛔ THE AUTOMATION IS NOT. There is no scheduler in this project: no
//     cron, no queue, no Edge Function, no CI runner with credentials.
//     Adding one is HOSTED work, and hosted provisioning is a CLAUDE.md §12
//     stop-and-ask. So this runs MANUALLY, and that is a STATED limitation
//     rather than a hidden one.
//
// ⚠️ WHAT IT WILL AND WILL NOT DELETE. It deletes an object only when ALL of:
//   . it lives in the `evidence` bucket;
//   . NO `public.report_evidence` row references its path;
//   . it is older than the grace window, so an upload still in flight — a
//     resumable upload can legitimately take many minutes on classroom wifi —
//     is never swept out from under a trainer mid-transfer.
//
// ⛔ IT NEVER TOUCHES A GOVERNED ROW. It reads `report_evidence` and writes
// nothing to it. A row whose object has vanished is NOT repaired here: that
// is a different failure with a different answer, and silently deleting the
// row would destroy the audit trail's referent.
//
// ⚠️ It reads NEXT_PUBLIC_SUPABASE_URL -- the LOCAL stack URL, which is what
// .env.local carries -- and never BEST_COACH_HOSTED_SUPABASE_URL. This is a
// local maintenance tool; pointing it at a hosted project is a §12 stop-and-ask.
//
// Run: npm run sweep:evidence-orphans          (report only, the default)
//      npm run sweep:evidence-orphans -- --delete
// =====================================================================

import { spawnSync } from "node:child_process";

import { createClient } from "@supabase/supabase-js";

import { resolveLocalTarget } from "../fixtures/local-target-guard.mjs";

const { dbContainer: DB_CONTAINER } = resolveLocalTarget();

const BUCKET = "evidence";
const GRACE_MINUTES = 120;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

// ⛔ REFUSE RATHER THAN GUESS. A missing credential must never fall back to a
// weaker client that silently sweeps nothing and reports success.
if (!url || !secret) {
  console.error(
    "REFUSED: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must both be present. " +
      "Refusing rather than running with a weaker client, which would report a clean sweep having swept nothing.",
  );
  process.exit(2);
}

const doDelete = process.argv.includes("--delete");
const client = createClient(url, secret, { auth: { persistSession: false } });

const cutoff = new Date(Date.now() - GRACE_MINUTES * 60_000);

// Every object under the bucket. Paths are `{report_id}/{evidence_id}.{ext}`,
// so the listing is one level of folders and one level of files.
const objects = [];
const { data: folders, error: folderError } = await client.storage.from(BUCKET).list("", { limit: 1000 });
if (folderError) {
  console.error(`REFUSED: could not list ${BUCKET}: ${folderError.message}`);
  process.exit(2);
}
for (const folder of folders ?? []) {
  const { data: files, error } = await client.storage.from(BUCKET).list(folder.name, { limit: 1000 });
  if (error) {
    console.error(`REFUSED: could not list ${BUCKET}/${folder.name}: ${error.message}`);
    process.exit(2);
  }
  for (const f of files ?? []) objects.push({ path: `${folder.name}/${f.name}`, createdAt: f.created_at });
}

/*
 * ⛔ THE ROW SET IS READ AS THE OWNER, THROUGH psql — NOT THROUGH PostgREST.
 *
 * The first shape of this script called `client.from("report_evidence")` with
 * the secret key and got `permission denied for table report_evidence`.
 * ▶ THE REFUSAL WAS CORRECT AND THE FIX WAS NOT A GRANT. `report_evidence`
 * holds ZERO client privileges for every role including `service_role` —
 * that is the deny-by-default posture (A-030) that migration assertion E3
 * exists to protect, and widening it so a maintenance script could run is
 * precisely what CLAUDE.md §12 forbids.
 *
 * A fifth SECURITY DEFINER function would also have worked, and was rejected:
 * the C-7 ruling approved a family of four, and adding a database object so a
 * local script is more convenient is not what that ruling authorized.
 *
 * So this reads the way every proof runner in this project reads — owner-side,
 * through the local container. ⚠️ That is also why this tool is LOCAL ONLY.
 */
const readRows = spawnSync(
  "docker",
  ["exec", "-i", DB_CONTAINER, "psql", "--no-psqlrc", "-U", "postgres", "-d", "postgres", "-At",
    "-c", "SELECT storage_object_path FROM public.report_evidence;"],
  { encoding: "utf8", shell: false },
);
if (readRows.status !== 0) {
  // ⚠️ A FAILED READ IS NOT AN EMPTY RESULT (Q-7). Treating it as empty here
  // would make EVERY object look like an orphan and delete the lot.
  console.error(`REFUSED: could not read report_evidence: ${(readRows.stderr || "").trim()}`);
  process.exitCode = 2;
  throw new Error("refused");
}
const referenced = new Set(readRows.stdout.split(/\r?\n/).map((s) => s.trim()).filter(Boolean));

const orphans = objects.filter(
  (o) => !referenced.has(o.path) && (!o.createdAt || new Date(o.createdAt) < cutoff),
);
const inFlight = objects.filter((o) => !referenced.has(o.path) && !orphans.includes(o));

console.log(`objects: ${objects.length} · referenced: ${referenced.size} · orphans: ${orphans.length} · within grace: ${inFlight.length}`);
for (const o of orphans) console.log(`  ORPHAN  ${o.path}  (${o.createdAt ?? "unknown time"})`);

if (!doDelete) {
  console.log(orphans.length ? "\nreport only — pass --delete to remove them" : "\nnothing to sweep");
  process.exit(0);
}

if (orphans.length === 0) {
  console.log("\nnothing to delete");
  process.exit(0);
}

const { error: removeError } = await client.storage.from(BUCKET).remove(orphans.map((o) => o.path));
if (removeError) {
  console.error(`FAILED: ${removeError.message}`);
  process.exit(1);
}
console.log(`\ndeleted ${orphans.length} orphaned object(s)`);
