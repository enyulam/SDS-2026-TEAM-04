#!/usr/bin/env node
// =====================================================================
// PORTAL PHASES P1-3 + P1-4 -- runner for prove-p1-34-evidence-review.sql.
// =====================================================================
// The SQL half proves the read discriminates and that Approve & Submit is
// NOT gated on viewing. This half proves what the database cannot see:
//
//   * ⛔ NO DOWNLOAD AFFORDANCE IN THE BUILT CLIENT CHUNKS, measured in
//     the BUNDLE and not in the source. Source is what someone intended;
//     ▶ the bundle is what the browser is handed, and a `download`
//     attribute introduced by a wrapper, a default prop or a transform
//     appears only there.
//   * THE STALE INERT COPY IS GONE from the trainer review surface.
//   * ONE SHARED PLAYER, used by all three surfaces.
//   * NOTHING WAS COMMITTED -- counts before/during/after, both sides
//     built by the SAME five-field shape.
//
// ⚠️ `prove:hero-8/11` COMPARE SHELLS. They would pass unchanged if either
//    editor could not save at all, so they are NOT evidence for these two
//    surfaces and are not cited as such anywhere.
//
// ⛔ A-004's both-direction Parent UAT -- HUMAN, the Operator's. NOT-RUN.
//
// Run: npm run prove:portal-34
// =====================================================================

import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { assertConfigProjectId, resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";
import { emittedLegs } from "./suite-output-rule.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { projectId: PROJECT_ID, dbContainer: DB_CONTAINER } = resolveLocalTarget();
const CONFIG = readFileSync(join(ROOT, "supabase", "config.toml"), "utf8");
assertConfigProjectId((CONFIG.match(/^\s*project_id\s*=\s*"([^"]+)"/m) ?? [])[1] ?? "", PROJECT_ID);

const PRELUDE = join(ROOT, "scripts", "tests", "hero", "_isolated-fixture.sql");
const SUITE = join(ROOT, "scripts", "tests", "portal", "prove-p1-34-evidence-review.sql");

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
const passes = (out.match(/PASS P34-/g) ?? []).length;
const fails = (out.match(/FAIL P34-/g) ?? []).length;

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
  emittedLegs(out, "P34"),
  `the SQL suite ACTUALLY RAN and emitted its own P34- legs (${out.trim().length} chars of output) -- without this, the assertions below are satisfied by an unreachable database`,
);

check(!/^ERROR/m.test(out), "the suite ran to completion without a SQL error");
check(fails === 0, `no failing leg (${fails} FAIL)`);
check(passes === 8, `all EIGHT legs EXECUTED (${passes}/8) -- an unrun leg is NOT-RUN, never PASS`);
check(before === after, `the canonical database is UNMOVED (${before} -> ${after})`);
check(
  during !== "" && during !== before,
  `the counts MOVED mid-transaction (${before} -> ${during} -> ${after}) -- both sides built by the SAME five-field shape`,
);

// ---------------------------------------------------------------------
// ⛔ THE BUILT CLIENT CHUNKS. Source is intent; the bundle is what ships.
// ---------------------------------------------------------------------
const CHUNKS = join(ROOT, ".next", "static", "chunks");
check(existsSync(CHUNKS), "a production build exists to measure -- without it every bundle leg below is vacuous");

let bundle = "";
if (existsSync(CHUNKS)) {
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".js")) bundle += readFileSync(full, "utf8");
    }
  };
  walk(CHUNKS);
}
check(bundle.length > 0, `the chunk corpus was read (${Math.round(bundle.length / 1024)} KB)`);

// ⚠️ NON-VACUITY FIRST. If the player never reached the bundle, every
// absence leg below is trivially true — the S-8 shape, and the exact defect
// that let a read-only assertion pass against an empty string one phase ago.
check(
  bundle.includes("nodownload"),
  "the player IS in the built bundle (`nodownload` present) -- so the absence legs below are about the real artefact",
);
check(
  bundle.includes("disablePictureInPicture") || bundle.includes("disableRemotePlayback") ||
    /disablePictureInPicture/i.test(bundle),
  "the detach affordance is disabled in the built bundle too",
);

// ⛔ THE ABSENCE THAT MATTERS. A `download` attribute on a media element, or
// a `download` option handed to `createSignedUrl`, is what D-5 forbids.
check(
  !/\bdownload\s*:\s*(true|"|')/.test(bundle),
  "NO `download` option reaches the client bundle -- D-5's refused control cannot arrive inside an options object",
);
check(
  /\bdownload\s*:\s*(true|"|')/.test(`x={download:true}`),
  "CONTROL: the download-option pattern FIRES against text that contains one",
);

// ---------------------------------------------------------------------
// THE SOURCE HALF -- the stale copy, and the single shared player.
// ---------------------------------------------------------------------
const strip = (f) =>
  readFileSync(join(ROOT, ...f), "utf8")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

const trainerReview = strip(["features", "trainer", "trainer-report-review.tsx"]);
const mgmtReview = strip(["features", "management", "management-report-review.tsx"]);
const screen08 = strip(["features", "trainer", "trainer-draft-generation.tsx"]);
const viewer = strip(["components", "ui", "evidence-viewer.tsx"]);

// ⛔ THE STALE INERT BLOCK. Every clause of it was true when written and is
// now false — the file-scope restatement defect for the third phase running.
check(
  !/No class video evidence is available in this workspace/.test(trainerReview) &&
    !/no governed evidence record or upload path exists/.test(trainerReview),
  "the trainer review surface's PRE-P1-2 inert copy is GONE -- it claimed no evidence record and no upload path exist, and both shipped",
);
check(
  /No class video evidence is available in this workspace/.test(
    "No class video evidence is available in this workspace.",
  ),
  "CONTROL: the stale-copy pattern FIRES against text that contains it",
);

// ONE player, three surfaces. Three copies is how one of them quietly
// acquires an attribute the other two forbid.
for (const [label, src] of [
  ["screen 08 (trainer attach)", screen08],
  ["the trainer review surface", trainerReview],
  ["screen 19 (management review)", mgmtReview],
]) {
  check(
    /evidence-viewer/.test(src),
    `${label} renders the ONE shared player rather than its own <video>`,
  );
  check(
    !/<video/.test(src),
    `${label} declares NO <video> of its own -- three copies is how one acquires a download attribute nobody re-checked`,
  );
}

// ⛔ D-5's retrievability sentence, and the absence of an impossibility claim.
check(
  /no download control for any role/i.test(viewer) && /technically retrievable/i.test(viewer),
  "the shared player STATES there is no download control and that the stream stays retrievable",
);
check(
  !/cannot be downloaded|impossible to download|cannot be saved/i.test(
    viewer + trainerReview + mgmtReview + screen08,
  ),
  "NO surface claims technical impossibility",
);

// ⛔ C-5 — the non-gate, recorded in the surface's own code as the plan requires.
check(
  /enforced by\s*\n?\s*\*?\s*nothing/i.test(
    readFileSync(join(ROOT, "features", "management", "management-report-review.tsx"), "utf8"),
  ),
  "C-5's wording is recorded IN THE MANAGEMENT SURFACE'S OWN CODE -- visibility required, attestation absent, enforced by nothing",
);
check(
  !/checklist/i.test(mgmtReview.replace(/checklist_evidence_confirmed/g, "")),
  "the management surface builds NO checklist item -- A-036's three-item gate stays a TRAINER instrument",
);

// ⛔ The P5 note's wrong A-038 citation, struck.
const mgmtRaw = readFileSync(join(ROOT, "features", "management", "management-report-review.tsx"), "utf8");
check(
  /STRUCK 2026-08-12 AT P1-3/.test(mgmtRaw) && /IT CALLED A PERMITTED READ PROHIBITED/.test(mgmtRaw),
  "the P5 note's claim that A-038 bars management from evidence is STRUCK and preserved, with the reason recorded",
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
console.log(
  "\nNOT-RUN, and NOT claimed by this runner:\n" +
  "  * A-004 both-direction Parent UAT -- HUMAN, the Operator's to perform.\n" +
  "  * prove:hero-8/11 compare SHELLS and are not evidence for either surface.",
);
process.exit(bad === 0 ? 0 : 1);
