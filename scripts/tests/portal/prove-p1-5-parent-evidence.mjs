#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P1-5 -- runner for prove-p1-5-parent-evidence.sql.
// =====================================================================
// The SQL half proves the GATE discriminates: unauthorized, unrelated
// child, pre-submitted, direct storage path, public object, the permitted
// leg, and that a denied access emits nothing. This half proves the four
// things the database cannot see:
//
//   * THE EXPIRED URL. A TTL is a property of the MINTED URL, and SQL
//     never sees one. This half mints a 1-second URL, waits past it, and
//     proves the object is refused -- with a control that fetches a live
//     URL for the SAME object and gets it. Without that control the
//     expiry leg is equally true of a path that never worked.
//   * NOTHING WAS COMMITTED -- governed counts before/during/after, both
//     sides built by the SAME six-field shape.
//   * EVERY LEG ACTUALLY EXECUTED -- a pinned leg count.
//   * THE SURFACE. D-5's no-download, the ABSENCE of an impossibility
//     claim, mint-on-play rather than mint-on-render, and Q-27 unmoved.
//
// ⛔ NOT PROVEN HERE, AND NOT CLAIMED ANYWHERE:
//   * A-004's BOTH-DIRECTION PARENT UAT -- human, and the Operator's to
//     perform. It is NOT-RUN. This runner exiting 0 says nothing about it.
//   * A-003's UNSCANNED leg -- NOT APPLICABLE under C-3, never PASS.
//
// ⛔ Exit code is the only verdict.
//
// Run: npm run prove:portal-5
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
const SUITE = join(ROOT, "scripts", "tests", "portal", "prove-p1-5-parent-evidence.sql");
const MIGRATION = join(
  ROOT, "supabase", "migrations", "20260812150000_portal_p1_5_parent_evidence_arm.sql",
);

// ⚠️ BYTE-IDENTICAL to pg_temp.runner_counts() in the suite.
const COUNTS = `SELECT (SELECT count(*) FROM public.reports)
  || '|' || (SELECT count(*) FROM public.report_evidence)
  || '|' || (SELECT count(*) FROM public.audit_events)
  || '|' || (SELECT count(*) FROM storage.objects)
  || '|' || (SELECT count(*) FROM storage.buckets)
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
const passes = (out.match(/PASS P5a-/g) ?? []).length;
const fails = (out.match(/FAIL P5a-/g) ?? []).length;

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
  emittedLegs(out, "P5a"),
  `the SQL suite ACTUALLY RAN and emitted its own P5a- legs (${out.trim().length} chars of output) -- without this, the assertions below are satisfied by an unreachable database`,
);

check(!/^ERROR/m.test(out), "the suite ran to completion without a SQL error");
check(fails === 0, `no failing leg (${fails} FAIL)`);
check(passes === 11, `all ELEVEN legs EXECUTED (${passes}/11) -- an unrun leg is NOT-RUN, never PASS`);
check(before === after, `the canonical database is UNMOVED (${before} -> ${after})`);
check(
  during !== "" && during !== before,
  `the counts MOVED mid-transaction (${before} -> ${during} -> ${after}) -- both sides built by the SAME six-field shape`,
);

// ---------------------------------------------------------------------
// THE EXPIRED-URL LEG. ⚠️ THE ONLY LEG THAT CANNOT LIVE IN SQL.
//
// A signed URL's expiry is carried in the token the STORAGE API mints, so
// the only way to prove an expired one is refused is to hold one and use
// it. This uses the service role to place a throwaway object OUTSIDE the
// governed `<centre>/<report>/…` key shape, mints two URLs for it, and
// removes it again -- with the storage counts above proving the canonical
// database is unmoved either way.
// ---------------------------------------------------------------------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.log("FAIL    the expiry legs could not run -- local Supabase env values are absent");
  console.log("\nRESULT: FAIL  (environment)");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const PROBE_KEY = "_proof/p1-5-expiry-probe.bin";
const PROBE_BODY = new Uint8Array([0x42, 0x45, 0x53, 0x54]);

// ⚠️ THE FIRST SHAPE OF THIS UPLOAD FAILED, AND THE FAILURE WAS THE BUCKET
// DOING ITS JOB: `application/octet-stream` was refused 415 by the bucket's
// own `allowed_mime_types`. Recorded rather than worked around -- it is a
// live control, so it is measured as one immediately below.
const rejected = await admin.storage
  .from("evidence")
  .upload(`${PROBE_KEY}.bin`, PROBE_BODY, { contentType: "application/octet-stream" });
check(
  rejected.error !== null && String(rejected.error?.message ?? "").includes("mime type"),
  "the bucket's OWN allow-list refuses a non-video upload (415) -- C-16's ceiling is not the only per-bucket control",
);

const uploaded = await admin.storage
  .from("evidence")
  .upload(PROBE_KEY, PROBE_BODY, { contentType: "video/mp4", upsert: true });
check(!uploaded.error, "an object exists to sign -- the expiry legs below are not vacuous");

const shortLived = await admin.storage.from("evidence").createSignedUrl(PROBE_KEY, 1);
const longLived = await admin.storage.from("evidence").createSignedUrl(PROBE_KEY, 120);

// ⛔ CONTROL FIRST. If a LIVE url for this exact object does not fetch,
// then the expiry leg below proves nothing -- it would be measuring a
// broken path, not an expired token.
const liveFetch = longLived.data?.signedUrl
  ? await fetch(longLived.data.signedUrl)
  : { status: 0, ok: false };
check(
  liveFetch.ok,
  `CONTROL: a LIVE signed URL for the same object FETCHES (HTTP ${liveFetch.status}) -- so a refusal below is the TTL, not the path`,
);

// The token carries the window explicitly. Reading it proves the TTL was
// the short one and not a coincidence of timing.
const claim = (() => {
  try {
    const token = new URL(shortLived.data?.signedUrl ?? "", SUPABASE_URL).searchParams.get("token");
    return JSON.parse(Buffer.from((token ?? "").split(".")[1] ?? "", "base64url").toString("utf8"));
  } catch { return {}; }
})();
check(
  typeof claim.exp === "number" && typeof claim.iat === "number" && claim.exp - claim.iat === 1,
  `the short-lived URL's own token declares a ONE-SECOND window (exp - iat = ${claim.exp - claim.iat})`,
);

// ⛔ PUBLIC OBJECT, at the transport layer, and DELIBERATELY WHILE THE
// OBJECT EXISTS. The SQL half proves the bucket ROW is not public; this
// proves the service refuses the unsigned URL. ⚠️ Run after the removal it
// would have been equally true of a key that was never there -- which is
// the vacuity this ordering exists to prevent, and the live control above
// is what makes the distinction measurable.
const publicFetch = await fetch(`${SUPABASE_URL}/storage/v1/object/public/evidence/${PROBE_KEY}`);
check(
  !publicFetch.ok,
  `PUBLIC OBJECT: the unsigned public URL is REFUSED (HTTP ${publicFetch.status}) for an object that DEMONSTRABLY EXISTS`,
);

await new Promise((resolve) => { setTimeout(resolve, 2500); });

const expiredFetch = shortLived.data?.signedUrl
  ? await fetch(shortLived.data.signedUrl)
  : { status: 0, ok: true };
check(
  !expiredFetch.ok,
  `EXPIRED URL: the same object is REFUSED once the window closes (HTTP ${expiredFetch.status})`,
);

const removed = await admin.storage.from("evidence").remove([PROBE_KEY]);
check(!removed.error, "the probe object was removed -- the bucket is left as it was found");
check(
  psql(["-c", `SELECT count(*) FROM storage.objects WHERE name = '${PROBE_KEY}';`]).stdout.trim() === "0",
  "and the removal is CONFIRMED at the catalogue, not assumed from the API's reply",
);

// ---------------------------------------------------------------------
// THE MIGRATION'S OWN TEXT. Comments stripped -- this migration documents
// at length what it retires and why, and an unstripped scan would match
// the paragraph rather than the code.
// ---------------------------------------------------------------------
const migration = readFileSync(MIGRATION, "utf8").replace(/^\s*--.*$/gm, "");
check(
  /ELSIF v_role = 'parent'/.test(migration) &&
    (migration.match(/app_parent_reaches_student/g) ?? []).length >= 2,
  "the parent arm exists on BOTH RPCs and both route through app_parent_reaches_student",
);
check(
  (migration.match(/latest_submitted_version_id IS NULL/g) ?? []).length >= 2,
  "and BOTH arms gate on a SUBMITTED report -- the link alone is never enough",
);
// ⛔ E9's RETIREMENT. This one leg reads the UNSTRIPPED text on purpose: the
// requirement is that the retirement be RECORDED, and a record lives in
// prose. Retiring an assertion silently is how a guard disappears without
// anyone deciding it should.
const migrationRaw = readFileSync(MIGRATION, "utf8");
check(
  /\bE9\b/.test(migrationRaw) && /RETIRED|retirement/i.test(migrationRaw),
  "E9 is retired IN THIS FILE and the retirement is stated, not performed quietly",
);
check(
  /CREATE OR REPLACE FUNCTION public\.evidence_list_for_report/.test(migration) &&
    /CREATE OR REPLACE FUNCTION public\.evidence_record_access/.test(migration),
  "and it is retired by REDEFINING both functions it guarded -- replaced, never dropped",
);

// ---------------------------------------------------------------------
// THE SURFACE HALF.
// ---------------------------------------------------------------------
const strip = (f) =>
  readFileSync(join(ROOT, ...f), "utf8")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

const screen33 = strip(["features", "parent", "parent-canonical-report.tsx"]);

check(
  /<video/.test(screen33) && /data-evidence-player=/.test(screen33),
  "screen 33 renders a real player element for the clip",
);
check(
  /controlsList="nodownload"/.test(screen33) && /disablePictureInPicture/.test(screen33),
  "D-5: no download affordance and no detach affordance, for the Parent as for every other role",
);
// ⛔ THE ABSENCE THAT MATTERS. D-5 requires the limitation STATED, not denied.
check(
  !/cannot be downloaded|impossible to download|cannot be saved|can(?:'|&rsquo;)t be downloaded/i.test(screen33),
  "and the copy claims NO technical impossibility anywhere on the surface",
);
check(
  /Class Video Evidence/.test("Class Video Evidence cannot be downloaded") &&
    /cannot be downloaded/i.test("Class Video Evidence cannot be downloaded"),
  "CONTROL: the impossibility pattern FIRES against text that contains the claim",
);
// ⚠️ MINT ON PLAY, NOT ON RENDER. One mint is one `evidence.accessed`, so a
// mint the page performs by itself would record an access nobody asked for.
check(
  /onClick=\{\(\) => void play\(\)\}/.test(screen33) && !/useEffect[\s\S]{0,200}mintEvidenceViewUrl/.test(screen33),
  "the URL is minted on PLAY, never on render -- one recorded access = one human request",
);
check(
  /preload="none"/.test(screen33),
  "and the element itself fetches nothing until asked",
);
// ⛔ Q-27, on the surface P1-5 just added a media region to.
check(
  !/Overall Grade/.test(screen33) &&
    !/\b(beginning|developing|mastering|mastered)\b/i.test(
      screen33.replace(/EvidencePlayer|ParentEvidenceClipDto/g, ""),
    ),
  "Q-27 UNMOVED: no Overall Grade and no rating vocabulary on the parent surface",
);
check(
  /\b(mastering)\b/i.test("rated as Mastering"),
  "CONTROL: the rating-vocabulary pattern FIRES against text that contains a label",
);

// ---------------------------------------------------------------------
// ⛔ THE COMPOSED SERVER PATH. Spawned from here rather than left as its own
// script, because THIS suite is the one that shipped without it: P1-5 proved
// the RPC and scanned the surface, and nothing ran the TypeScript in between
// — where the defect actually was. A separate npm script is a thing someone
// forgets to run; a leg inside the suite it protects is not.
// ---------------------------------------------------------------------
const composed = spawnSync(
  process.execPath,
  [
    "--conditions=react-server",
    "--import", "./scripts/tests/integration/alias-loader.mjs",
    join(ROOT, "scripts", "tests", "portal", "prove-p1-5-composed-parent-read.mjs"),
  ],
  { cwd: ROOT, encoding: "utf8", shell: false, env: process.env },
);
for (const line of `${composed.stdout}`.split(/\r?\n/)) {
  if (/^(PASS|FAIL)/.test(line)) console.log(`  ${line}`);
}
check(
  composed.status === 0,
  "THE COMPOSED SERVER PATH RUNS: a linked parent reaches the clip through the actual TypeScript, not only through the RPC",
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
console.log(
  "\nNOT-RUN, and NOT claimed by this runner:\n" +
  "  * A-004 both-direction Parent UAT -- HUMAN, the Operator's to perform.\n" +
  "  * A-003 unscanned leg -- NOT APPLICABLE under C-3.",
);
process.exit(bad === 0 ? 0 : 1);
