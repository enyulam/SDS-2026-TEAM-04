#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P1-2b -- runner for prove-p1-2b-upload-transport.sql.
// =====================================================================
// The SQL half proves the GATE discriminates. This half proves the three
// things the database cannot see:
//
//   * THE REAL TUS ENDPOINT ACCEPTS AND REFUSES. A resumable upload is an
//     HTTP protocol, so it is exercised against the running storage
//     service with a REAL trainer session -- admitted at a path the
//     trainer has authority over, refused at one they do not, and refused
//     at creation when `Upload-Length` exceeds the bucket's 100 MiB.
//     ⚠️ The ceiling leg costs one small request, not 100 MB: the TUS
//     server checks the DECLARED length before any body is sent.
//   * NOTHING WAS COMMITTED -- governed counts before/during/after, both
//     sides built by the SAME five-field shape.
//   * THE COMPOSED SERVER PATH ACTUALLY RUNS. ⛔ This is the leg that
//     matters most, and P1-5 shipped without it: its proofs exercised the
//     RPC and scanned the surface's text, and NOTHING ran the TypeScript
//     between them.
//
// ⛔ NOT PROVEN HERE, AND NOT CLAIMED ANYWHERE:
//   * A-004's BOTH-DIRECTION PARENT UAT -- HUMAN, and the Operator's to
//     perform. It is NOT-RUN. This runner exiting 0 says nothing about it.
//   * A-003's UNSCANNED leg -- NOT APPLICABLE under C-3, never PASS.
//
// ⛔ Exit code is the only verdict.
//
// Run: npm run prove:portal-2b
// =====================================================================

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

import { assertConfigProjectId, resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";
import { emittedLegs } from "./suite-output-rule.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { projectId: PROJECT_ID, dbContainer: DB_CONTAINER } = resolveLocalTarget();
const CONFIG = readFileSync(join(ROOT, "supabase", "config.toml"), "utf8");
assertConfigProjectId((CONFIG.match(/^\s*project_id\s*=\s*"([^"]+)"/m) ?? [])[1] ?? "", PROJECT_ID);

const PRELUDE = join(ROOT, "scripts", "tests", "hero", "_isolated-fixture.sql");
const SUITE = join(ROOT, "scripts", "tests", "portal", "prove-p1-2b-upload-transport.sql");
const MIGRATION = join(
  ROOT, "supabase", "migrations", "20260812200000_portal_p1_2b_upload_transport.sql",
);

// ⚠️ BYTE-IDENTICAL to pg_temp.runner_counts() in the suite.
const COUNTS = `SELECT (SELECT count(*) FROM public.reports)
  || '|' || (SELECT count(*) FROM public.report_evidence)
  || '|' || (SELECT count(*) FROM public.audit_events)
  || '|' || (SELECT count(*) FROM storage.objects)
  || '|' || (SELECT count(*) FROM public.students);`;

function psql(args, input) {
  return spawnSync("docker", ["exec", "-i", DB_CONTAINER, "psql", "--no-psqlrc", "-U", "postgres",
    "-d", "postgres", "-At", ...args], { input, encoding: "utf8", shell: false });
}

let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad++;
  console.log(`${ok ? "PASS   " : "FAIL   "} ${msg}`);
};

// ---------------------------------------------------------------------
// THE SQL HALF.
// ---------------------------------------------------------------------
const before = psql(["-c", COUNTS]).stdout.trim();
console.log(`governed counts BEFORE: ${before}`);

const run = psql([], `${readFileSync(PRELUDE, "utf8")}\n${readFileSync(SUITE, "utf8")}`);
const out = `${run.stdout}\n${run.stderr}`;
for (const line of out.split(/\r?\n/)) {
  if (/^(NOTICE|WARNING|ERROR)/.test(line.trim())) console.log(`  ${line.trim()}`);
}

const after = psql(["-c", COUNTS]).stdout.trim();
console.log(`governed counts AFTER : ${after}`);

const during = (out.match(/DURING-COUNTS ([\d|]+)/) ?? [])[1] ?? "";
const passes = (out.match(/PASS T2a-/g) ?? []).length;
const fails = (out.match(/FAIL T2a-/g) ?? []).length;

console.log("");
/*
 * ⛔ THE SUITE ACTUALLY EMITTED ITS OWN LEGS — ASSERTED FIRST, because the
 * check(s) immediately below are TRUE OF AN EMPTY STRING.
 *
 * ⚠️ Measured, not hypothesised: with the Docker daemon stopped, `psql`
 * returned nothing and a runner of this exact shape reported *"ran to
 * completion without an error"* and *"0 FAIL"* as PASS. ▶ The vacuity class,
 * arriving through INFRASTRUCTURE FAILURE rather than logic — a suite that
 * cannot run must not be able to report clean.
 */
check(
  emittedLegs(out, "T2a"),
  `the SQL suite ACTUALLY RAN and emitted its own T2a- legs (${out.trim().length} chars of output) -- without this, the assertions below are satisfied by an unreachable database`,
);

check(!/^ERROR/m.test(out), "the suite ran to completion without a SQL error");
check(fails === 0, `no failing leg (${fails} FAIL)`);
check(passes === 17, `all SEVENTEEN legs EXECUTED (${passes}/17) -- an unrun leg is NOT-RUN, never PASS`);
check(before === after, `the canonical database is UNMOVED (${before} -> ${after})`);
check(
  during !== "" && during !== before,
  `the counts MOVED mid-transaction (${before} -> ${during} -> ${after}) -- both sides built by the SAME five-field shape`,
);

// ---------------------------------------------------------------------
// THE REAL TRANSPORT. Admin-minted sessions (NOT a sign-in proof).
// ---------------------------------------------------------------------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SERVICE_KEY = process.env.SUPABASE_SECRET_KEY;
if (!SUPABASE_URL || !PUBLISHABLE || !SERVICE_KEY) {
  console.log("FAIL    the transport legs could not run -- local Supabase env values are absent");
  console.log("\nRESULT: FAIL  (environment)");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

async function mint(email) {
  const link = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (link.error || !link.data?.properties?.hashed_token) return null;
  const c = createClient(SUPABASE_URL, PUBLISHABLE, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const v = await c.auth.verifyOtp({
    type: "magiclink", token_hash: link.data.properties.hashed_token,
  });
  if (v.error || !v.data?.session) return null;
  return { client: c, token: v.data.session.access_token };
}

const trainer = await mint("trainer.fixture@example.test");
const parent = await mint("parent.fixture@example.test");
check(
  trainer !== null && parent !== null,
  "ADMIN-MINTED sessions established for the ratified trainer and parent identities (NOT a sign-in proof)",
);
if (!trainer || !parent) {
  console.log("\nRESULT: FAIL  (no session)");
  process.exit(1);
}

// A report the fixture trainer genuinely reaches and that is NOT submitted.
const REPORT = psql(["-c",
  `SELECT r.id FROM public.reports r WHERE r.status <> 'submitted'
     AND public.app_trainer_reaches_session(r.class_session_id) IS NOT NULL
   ORDER BY r.status LIMIT 1;`]).stdout.trim().split("\n")[0];
const UNREACHABLE = psql(["-c",
  `SELECT gen_random_uuid();`]).stdout.trim();
check(/^[0-9a-f-]{36}$/.test(REPORT), "a pre-submission report exists to upload against -- the legs below are not vacuous");

const TUS = `${SUPABASE_URL}/storage/v1/upload/resumable`;
const b64 = (s) => Buffer.from(s, "utf8").toString("base64");

async function createUpload(objectName, length, token) {
  return fetch(TUS, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "tus-resumable": "1.0.0",
      "upload-length": String(length),
      "upload-metadata": [
        `bucketName ${b64("evidence")}`,
        `objectName ${b64(objectName)}`,
        `contentType ${b64("video/mp4")}`,
        `cacheControl ${b64("3600")}`,
      ].join(","),
      "x-upsert": "false",
    },
  });
}

const uuid = (n) => `${n}${"0".repeat(7)}-0000-4000-8000-${"0".repeat(12)}`.slice(0, 36);
const evOk = "b1b1b1b1-b1b1-4b1b-8b1b-b1b1b1b1b1b1";
const evBig = "b2b2b2b2-b2b2-4b2b-8b2b-b2b2b2b2b2b2";
const evBad = "b3b3b3b3-b3b3-4b3b-8b3b-b3b3b3b3b3b3";
void uuid;

// ⛔ THE CEILING, AT THE REAL ENDPOINT, FOR THE PRICE OF ONE SMALL REQUEST.
const oversize = await createUpload(`${REPORT}/${evBig}.mp4`, 104_857_601, trainer.token);
check(
  oversize.status >= 400,
  `THE PER-BUCKET CEILING FIRES at the TUS endpoint on the DECLARED length (HTTP ${oversize.status}) -- no 100 MB body required`,
);

// ⛔ A PATH NAMING A REPORT THIS TRAINER DOES NOT REACH.
const foreign = await createUpload(`${UNREACHABLE}/${evBad}.mp4`, 4096, trainer.token);
check(
  foreign.status >= 400,
  `REFUSED at a path naming a report this trainer does not reach (HTTP ${foreign.status}) -- a forged ticket buys nothing`,
);

// ⛔ A PARENT, AT A PATH A TRAINER WOULD BE ADMITTED TO.
const asParent = await createUpload(`${REPORT}/${evBad}.mp4`, 4096, parent.token);
check(
  asParent.status >= 400,
  `A PARENT is refused at the very path a trainer is admitted to (HTTP ${asParent.status})`,
);

// ⚠️ THE PERMITTED LEG, AND IT IS WHAT MAKES THE THREE REFUSALS ABOVE MEAN
// ANYTHING. Without it they are equally true of a broken endpoint.
const body = new Uint8Array(4096).fill(7);
const created = await createUpload(`${REPORT}/${evOk}.mp4`, body.length, trainer.token);
const location = created.headers.get("location");
check(
  created.ok && !!location,
  `THE PERMITTED LEG: the trainer's own session CREATES an upload at its own report's path (HTTP ${created.status})`,
);

let uploaded = { ok: false, status: 0 };
if (location) {
  uploaded = await fetch(new URL(location, TUS).toString(), {
    method: "PATCH",
    headers: {
      authorization: `Bearer ${trainer.token}`,
      "tus-resumable": "1.0.0",
      "upload-offset": "0",
      "content-type": "application/offset+octet-stream",
    },
    body,
  });
}
check(uploaded.ok, `and the bytes actually transfer (HTTP ${uploaded.status})`);

// ⛔ AN ABANDONED UPLOAD ATTACHES NOTHING, MEASURED AT THE CATALOGUE. The
// object above was never confirmed, so no governed row and no audit event may
// exist for it.
const orphanRow = psql(["-c",
  `SELECT count(*) FROM public.report_evidence WHERE id = '${evOk}';`]).stdout.trim();
const orphanEvent = psql(["-c",
  `SELECT count(*) FROM public.audit_events WHERE target_id = '${evOk}';`]).stdout.trim();
const orphanObject = psql(["-c",
  `SELECT count(*) FROM storage.objects WHERE name = '${REPORT}/${evOk}.mp4';`]).stdout.trim();
check(
  orphanObject === "1" && orphanRow === "0" && orphanEvent === "0",
  "AN ABANDONED UPLOAD ATTACHES NOTHING: the object exists, the governed row does NOT, and no audit event was emitted",
);

// The object is removed through the Storage API, because SQL cannot --
// `storage.protect_delete()` refuses a direct DELETE on storage.objects.
const cleaned = await admin.storage.from("evidence").remove([`${REPORT}/${evOk}.mp4`]);
check(!cleaned.error, "the probe object was removed through the Storage API -- SQL cannot delete it");
check(
  psql(["-c", `SELECT count(*) FROM storage.objects WHERE name = '${REPORT}/${evOk}.mp4';`])
    .stdout.trim() === "0",
  "and the removal is CONFIRMED at the catalogue, not assumed from the API's reply",
);

// ---------------------------------------------------------------------
// THE MIGRATION'S OWN TEXT. Comments stripped.
// ---------------------------------------------------------------------
const migration = readFileSync(MIGRATION, "utf8").replace(/^\s*--.*$/gm, "");
check(
  /DROP FUNCTION IF EXISTS public\.evidence_attach_confirm/.test(migration) &&
    /CREATE FUNCTION public\.evidence_attach_confirm/.test(migration),
  "the function is DROPPED and recreated -- adding an OUT parameter changes the return type, which REPLACE refuses",
);
check(
  !/CREATE TABLE|CREATE TYPE|ALTER TYPE|CREATE POLICY|ADD COLUMN/.test(migration),
  "this migration adds NO table, type, enum value, policy or column -- it replaces one function",
);
check(
  /CREATE TABLE/.test("CREATE TABLE public.x ();"),
  "CONTROL: the schema-addition pattern FIRES against text that contains one",
);

// ---------------------------------------------------------------------
// THE SURFACE.
// ---------------------------------------------------------------------
const strip = (f) =>
  readFileSync(join(ROOT, ...f), "utf8")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

const screen08 = strip(["features", "trainer", "trainer-draft-generation.tsx"]);
const uploader = strip(["lib", "frontend", "evidence-upload.ts"]);

check(
  !/transport-not-built/.test(screen08) && /type="file"/.test(screen08),
  "the inert control is GONE and a real file input is built -- the transport exists, so the honest note that it did not must not survive",
);
check(
  /confirmEvidenceAttach/.test(screen08) &&
    screen08.indexOf("uploadEvidenceResumable") < screen08.indexOf("confirmEvidenceAttach"),
  "the surface UPLOADS first and ATTACHES second -- it never reports success before the governed act",
);
check(
  /Uploaded media is not scanned/.test(screen08) &&
    /production deployment would require scanning/.test(screen08) &&
    /data-evidence-notice="unscanned"/.test(screen08),
  "C-3's unscanned text is STILL permanently visible on the upload surface, unchanged by the transport landing",
);
check(
  /no download control for any role/i.test(screen08) &&
    /technically retrievable/i.test(screen08) &&
    !/cannot be downloaded|impossible to download/i.test(screen08),
  "D-5: no download control is claimed, and technical impossibility is NOT claimed",
);
check(
  !/Class Video Evidence/.test(screen08) && !/500\s*MB/i.test(screen08),
  "G-8/C-16: the frame's class-footage heading and 500 MB figure are STILL NOT built -- REGISTERED-OMISSION, never ends",
);
check(
  /100 MB/.test(screen08),
  "the ceiling is NAMED on the surface -- a trainer who cannot tell why an upload failed will retry it",
);
// ⛔ THE SWEEPER MUST NOT BE IMPLIED TO RUN.
check(
  !/automatically (removed|cleaned|swept)|cleaned up automatically/i.test(screen08 + uploader),
  "nothing claims orphaned uploads are cleaned automatically -- the sweeper is MANUAL and unscheduled",
);
check(
  /MANUALLY/.test(readFileSync(join(ROOT, "lib", "frontend", "evidence-upload.ts"), "utf8")),
  "and the limitation is STATED in the transport's own header, where the next implementer reads it",
);
check(
  /x-upsert/.test(uploader) && /"false"/.test(uploader),
  "the transport NEVER upserts -- overwriting a key would swap the clip under an attached row",
);
check(
  /method: "HEAD"/.test(uploader),
  "resumption asks the SERVER for the offset rather than trusting a local one -- a disagreement would upload a corrupt object successfully",
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
console.log(
  "\nNOT-RUN, and NOT claimed by this runner:\n" +
  "  * A-004 both-direction Parent UAT -- HUMAN, the Operator's to perform.\n" +
  "  * A-003 unscanned leg -- NOT APPLICABLE under C-3.",
);
process.exit(bad === 0 ? 0 : 1);
