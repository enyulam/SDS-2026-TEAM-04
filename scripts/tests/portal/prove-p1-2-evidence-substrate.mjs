#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P1-2 -- runner for prove-p1-2-evidence-substrate.sql.
// =====================================================================
// The SQL half proves the gates discriminate and that the ceiling, the
// bucket invariant and chain verification all actually fire. This half
// proves what the database cannot see:
//
//   * NOTHING WAS COMMITTED -- governed counts before and after, with the
//     mid-transaction reading asserted to DIFFER. ⚠️ Both sides are built
//     by the SAME six-field shape. A comparison is only evidence when both
//     sides measure the same thing -- P1-1b's anti-tautology leg passed
//     because a nine-field string was compared against a six-field one.
//   * EVERY LEG ACTUALLY EXECUTED -- a pinned leg count.
//   * THE C-3 TEXT IS ON THE SURFACE -- comment-stripped, so a comment
//     explaining the obligation cannot satisfy it.
//
// ⛔ Exit code is the only verdict.
//
// Run: npm run prove:portal-2
// =====================================================================

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { assertConfigProjectId, resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { projectId: PROJECT_ID, dbContainer: DB_CONTAINER } = resolveLocalTarget();
const CONFIG = readFileSync(join(ROOT, "supabase", "config.toml"), "utf8");
assertConfigProjectId((CONFIG.match(/^\s*project_id\s*=\s*"([^"]+)"/m) ?? [])[1] ?? "", PROJECT_ID);

const PRELUDE = join(ROOT, "scripts", "tests", "hero", "_isolated-fixture.sql");
const SUITE = join(ROOT, "scripts", "tests", "portal", "prove-p1-2-evidence-substrate.sql");
const MIGRATION = join(ROOT, "supabase", "migrations", "20260812090000_portal_d5_evidence_substrate.sql");

// ⚠️ BYTE-IDENTICAL to pg_temp.runner_counts() in the suite. If these two
// ever drift, the "counts moved" leg becomes true of any two runs.
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
const passes = (out.match(/PASS P2a-/g) ?? []).length;
const fails = (out.match(/FAIL P2a-/g) ?? []).length;

let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad++;
  console.log(`${ok ? "PASS   " : "FAIL   "} ${msg}`);
};

console.log("");
check(!/^ERROR/m.test(out), "the suite ran to completion without a SQL error");
check(fails === 0, `no failing leg (${fails} FAIL)`);
check(passes === 18, `all EIGHTEEN legs EXECUTED (${passes}/18) -- an unrun leg is NOT-RUN, never PASS`);
check(before === after, `the canonical database is UNMOVED (${before} -> ${after})`);
check(
  during !== "" && during !== before,
  `the counts MOVED mid-transaction (${before} -> ${during} -> ${after}) -- both sides built by the SAME six-field shape`,
);
// ⚠️ The bucket the suite creates to make the invariant fire must NOT survive.
// storage.protect_delete() refuses a direct DELETE, so ROLLBACK is the only
// thing that removes it -- and this is the leg that proves it did.
check(
  psql(["-c", "SELECT count(*) FROM storage.buckets WHERE id = 'probe-deferred-photo';"]).stdout.trim() === "0",
  "the invariant's probe bucket did NOT survive -- ROLLBACK removed what protect_delete() forbids deleting",
);
check(
  psql(["-c", "SELECT count(*) FROM storage.buckets WHERE id = 'evidence' AND public = false AND file_size_limit = 104857600;"]).stdout.trim() === "1",
  "the evidence bucket is PRIVATE and carries C-16's 100 MiB on its own row",
);

// ---------------------------------------------------------------------
// The migration's own text. ⚠️ Comments stripped first: this migration
// DOCUMENTS at length what it refuses to build, so an unstripped scan would
// match the paragraph promising there is no parent arm rather than the code
// that has none.
// ---------------------------------------------------------------------
const migration = readFileSync(MIGRATION, "utf8").replace(/^\s*--.*$/gm, "");

check(
  !/\b(student_id|class_session_id)\b/.test(migration.slice(
    migration.indexOf("CREATE TABLE public.report_evidence"),
    migration.indexOf("CREATE INDEX report_evidence_centre_idx"),
  )),
  "report_evidence declares NO student_id and NO class_session_id -- the omission IS the control",
);
// ⚠️ SCOPED TO DDL, AND THE FIRST SHAPE OF THIS LEG WAS WRONG. A whole-file
// scan for `consent_records` matched assertion E10 -- the assertion whose
// entire job is to PROVE no such table exists. Same family as the regex that
// captured a parameter list: the check was reading the sentence that documents
// the thing rather than the thing. A prohibition is scanned in the DDL, never
// in the prose that defends it.
const tableBlock = migration.slice(
  migration.indexOf("CREATE TABLE public.report_evidence"),
  migration.indexOf("CREATE INDEX report_evidence_centre_idx"),
);
check(
  !/CREATE TABLE[\s\S]{0,60}consent_records/i.test(migration) &&
    !/(scan|consent|status)\w*\s+(text|boolean|public\.)/i.test(tableBlock),
  "no consent_records table and no scan/consent/status COLUMN -- C-2 and C-3 at the DDL, not in the prose",
);
check(
  /GRANT EXECUTE[\s\S]{0,160}TO authenticated/.test(migration) && !/\bTO anon\b/.test(migration),
  "grants go to `authenticated` only -- no anon anywhere",
);
check(
  !/GRANT (SELECT|INSERT|UPDATE|DELETE)[\s\S]{0,80}ON TABLE public\.report_evidence/.test(migration),
  "report_evidence has NO client table grant -- it belongs in the reports class, reached only by RPC",
);
// ⚠️ NON-VACUITY for the four absence scans above.
const PROBE = `student_id uuid class_session_id uuid
CREATE TABLE public.consent_records (
  scan_status text NOT NULL
GRANT EXECUTE ON FUNCTION x TO anon;
GRANT SELECT ON TABLE public.report_evidence TO authenticated;`;
check(
  /\b(student_id|class_session_id)\b/.test(PROBE) &&
    /CREATE TABLE[\s\S]{0,60}consent_records/i.test(PROBE) &&
    /(scan|consent|status)\w*\s+(text|boolean|public\.)/i.test(PROBE) &&
    /\bTO anon\b/.test(PROBE) &&
    /GRANT (SELECT|INSERT|UPDATE|DELETE)[\s\S]{0,80}ON TABLE public\.report_evidence/.test(PROBE),
  "CONTROL: every absence pattern above FIRES against text that contains the thing",
);

// ---------------------------------------------------------------------
// THE SURFACE HALF. Comments stripped, for the same reason.
// ---------------------------------------------------------------------
const strip = (f) =>
  readFileSync(join(ROOT, ...f), "utf8")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

const screen08 = strip(["features", "trainer", "trainer-draft-generation.tsx"]);

// ⛔ C-3's UI-text obligation. This is the acceptance leg, not a nicety.
check(
  /Uploaded media is not scanned/.test(screen08) &&
    /production deployment would require scanning/.test(screen08),
  "C-3: the upload surface STATES that media is not scanned and that production would require it",
);
check(
  /data-evidence-notice="unscanned"/.test(screen08),
  "the unscanned notice is a permanent element, not a tooltip or a disclosure",
);
// ⛔ D-5's retrievability limitation, stated and never denied.
check(
  /no download control for any role/i.test(screen08) &&
    /technically retrievable/i.test(screen08) &&
    !/cannot be downloaded|impossible to download/i.test(screen08),
  "D-5: no download control is claimed, and technical impossibility is NOT claimed",
);
// ⛔ G-8 and C-16: the frame's refused class framing and its 500 MB.
check(
  !/Class Video Evidence/.test(screen08) && !/500\s*MB/i.test(screen08),
  "G-8/C-16: the frame's class-footage heading and 500 MB figure are NOT built -- REGISTERED-OMISSION, never ends",
);
check(
  /100 MB/.test(screen08),
  "the ceiling is NAMED on the surface -- a trainer who cannot tell why an upload failed will retry it",
);
// CONTROL for the two absence scans above.
check(
  /Class Video Evidence/.test("Class Video Evidence up to 500MB each"),
  "CONTROL: the refused-framing pattern FIRES against text that contains it",
);

// ⛔ THIS LEG'S PIN MOVED, AND THE LEG WAS REWRITTEN RATHER THAN DELETED.
//
// It read: "A-002: the evidence module carries NO parent arm -- deliberately
// not built, not built-and-unreachable", scanning `projections.ts` for the
// word `parent`. That was TRUE and LOAD-BEARING while A-002 deferred parent
// access to Phase 2. ⚠️ On 2026-08-12 the Operator ruled A-002 forward and
// P1-5 BUILT the arm, so the old leg would now fail for the RIGHT reason --
// which is exactly the case where deleting a leg quietly loses a measurement.
//
// What the leg protects is unchanged: the mint must be a GOVERNED call, not
// a client-reachable path to the elevated client. So it now measures the
// property that actually still holds -- authorization happens in the RPC
// BEFORE anything is signed, and the elevated client only ever signs.
const evidenceModule = strip(["server", "modules", "evidence", "projections.ts"]);
const mintBody = evidenceModule.slice(evidenceModule.indexOf("export async function mintEvidenceViewUrlCore"));
check(
  mintBody.indexOf("evidence_record_access") > 0 &&
    mintBody.indexOf("evidence_record_access") < mintBody.indexOf("createSignedUrl"),
  "the governed RPC authorizes and audits BEFORE anything is signed -- the elevated client signs, it never decides",
);
check(
  !/download\s*:/.test(mintBody),
  "D-5: no `download` option is passed to createSignedUrl -- the control D-5 refuses cannot appear inside an options object",
);
check(
  /download\s*:/.test("createSignedUrl(p, 60, { download: true })"),
  "CONTROL: the download-option pattern FIRES against a call that passes one",
);

// config.toml's local raise, and the reason it is not the boundary.
check(
  /file_size_limit\s*=\s*"100MiB"/.test(CONFIG),
  "config.toml's LOCAL cap is 100MiB -- without it the ceiling cannot be proven locally",
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
process.exit(bad === 0 ? 0 : 1);
