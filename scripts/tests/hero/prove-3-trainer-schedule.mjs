#!/usr/bin/env node
// =====================================================================
// HERO PHASE 3 -- runner for prove-3-trainer-schedule.sql
// =====================================================================
// The SQL suite writes a `room` value inside ONE transaction and ends in
// ROLLBACK. This runner makes "nothing was committed" part of the PROOF
// rather than an external observation: it measures the governed counts --
// including the number of sessions carrying a room -- before and after, and
// FAILS if any moved.
//
// It also carries P3-7, which has no SQL half: `Assist.` is prohibited by
// G-7, and the strongest form of that prohibition is that the schedule DTO
// has NO SECOND STAFF FIELD for a row to bind to. A database that returns
// one name cannot stop a frontend inventing a second slot; this can.
//
// Container name is DERIVED through the local-target guard -- unconditional
// HARD DENY of the frozen demonstration project, then a fail-closed pin.
//
// Run: npm run prove:hero-3
// =====================================================================

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { assertConfigProjectId, resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";
import { emittedLegs } from "../portal/suite-output-rule.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { projectId: PROJECT_ID, dbContainer: DB_CONTAINER } = resolveLocalTarget();
assertConfigProjectId(
  (readFileSync(join(ROOT, "supabase", "config.toml"), "utf8").match(/^\s*project_id\s*=\s*"([^"]+)"/m) ?? [])[1] ?? "",
  PROJECT_ID,
);

const SUITE = join(ROOT, "scripts", "tests", "hero", "prove-3-trainer-schedule.sql");
const CONTRACT = join(ROOT, "lib", "frontend", "contracts", "physical-test.ts");

const COUNTS = `SELECT (SELECT count(*) FROM public.reports)
  || '|' || (SELECT count(*) FROM public.report_versions)
  || '|' || (SELECT count(*) FROM public.audit_events)
  || '|' || (SELECT count(*) FROM public.audit_chain_heads)
  || '|' || (SELECT count(*) FROM public.class_sessions)
  || '|' || (SELECT count(*) FROM public.class_sessions WHERE room IS NOT NULL)
  || '|' || (SELECT count(*) FROM public.class_session_assignments WHERE is_active);`;

function psql(args, input) {
  return spawnSync("docker", ["exec", "-i", DB_CONTAINER, "psql", "--no-psqlrc", "-U", "postgres",
    "-d", "postgres", "-At", ...args], { input, encoding: "utf8", shell: false });
}

const before = psql(["-c", COUNTS]).stdout.trim();
console.log(`governed counts BEFORE: ${before}`);

const run = psql([], readFileSync(SUITE, "utf8"));
const out = `${run.stdout}\n${run.stderr}`;
for (const line of out.split(/\r?\n/)) {
  if (/^(NOTICE|WARNING|ERROR)/.test(line.trim())) console.log(`  ${line.trim()}`);
}

const after = psql(["-c", COUNTS]).stdout.trim();
console.log(`governed counts AFTER : ${after}`);

// ---------------------------------------------------------------------
// P3-7 -- ⛔ G-7 AT THE CONTRACT LAYER: there is NO second staff field.
// ---------------------------------------------------------------------
// The SQL half (P3-4) proves the database returns at most one name. That is
// not sufficient on its own: a frontend can invent a second slot and fill it
// from anything. This pins the DTO the schedule actually consumes — the
// two Phase 3 fields must be present, and NO field may look like an
// assistant, a second trainer or a roll-up rating (G-2 applies here too).
const REQUIRED = ["room", "trainerDisplayName"];
const PROHIBITED = [
  "assist", "secondary", "coTrainer", "co_trainer", "trainer2", "trainers",
  "overall", "rating", "grade_band", "gradeBand", "keyFocus", "key_focus",
  "slides", "lessonPlan", "term",
];

const contractSource = readFileSync(CONTRACT, "utf8");
const dtoBody = (contractSource.match(
  /export type TrainerSessionSummaryDto = \{([\s\S]*?)\n\};/,
) ?? [])[1];
const dtoFields = dtoBody === undefined
  ? null
  : [...dtoBody.matchAll(/^\s*readonly\s+([A-Za-z0-9_]+)\s*[?:]/gm)].map((m) => m[1]);

// ⚠️ Case-insensitive, and deliberately narrow: `classGrade` legitimately
// contains "grade", and `trainerDisplayName` legitimately contains "trainer",
// so the list names the shapes that would be violations rather than the words
// that appear in legitimate fields.
const leaked = (dtoFields ?? []).filter((f) =>
  PROHIBITED.some((bad) => f.toLowerCase().includes(bad.toLowerCase())),
);
const missing = (dtoFields ?? []).length === 0
  ? REQUIRED
  : REQUIRED.filter((f) => !dtoFields.includes(f));

let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad++;
  console.log(`${ok ? "PASS   " : "FAIL   "} ${msg}`);
};

const passes = (out.match(/PASS P3-/g) ?? []).length;
const fails = (out.match(/FAIL P3-/g) ?? []).length;
const errored = /^ERROR/m.test(out);

console.log("");
check(!errored, "the suite ran to completion without a SQL error");
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
  emittedLegs(out, "P3"),
  `the SQL suite ACTUALLY RAN and emitted its own P3- legs (${out.trim().length} chars of output) -- without this, the assertions below are satisfied by an unreachable database`,
);

check(fails === 0, `no failing leg (${fails} FAIL)`);
// ⚠️ A pinned literal, not `passes > 0`. Comparing a count to itself is
// vacuous, and a suite that aborted after two legs would otherwise look green.
check(passes === 6, `all SIX SQL legs EXECUTED (${passes}/6) -- an unrun leg is NOT-RUN, never PASS`);
check(before === after, `the canonical database is BYTE-UNMOVED (${before} -> ${after})`);
check(dtoFields !== null, "P3-7a: TrainerSessionSummaryDto was located in the frontend contract");
check(
  missing.length === 0,
  `P3-7b: the schedule DTO carries both Phase 3 fields${missing.length ? ` (missing: ${missing.join(", ")})` : ""}`,
);
check(
  leaked.length === 0,
  `P3-7c: ⛔ NO second staff slot, roll-up rating, KEY FOCUS, slides or term field on the schedule DTO${leaked.length ? ` (found: ${leaked.join(", ")})` : ""}`,
);

console.log(
  bad === 0
    ? "\nRESULT: PASS -- Phase 3 room and `Main:` trainer proven under RLS as the trainer; `Assist.` refused in the database AND in the contract; nothing committed."
    : `\nRESULT: FAIL -- ${bad} check(s) failed.`,
);
process.exit(bad === 0 ? 0 : 1);
