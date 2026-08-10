#!/usr/bin/env node
// =====================================================================
// HERO PHASE 1 -- runner for prove-1-canonical-context.sql
// =====================================================================
// The SQL suite drives a report to `submitted` inside ONE transaction and
// ends in ROLLBACK. This runner makes "nothing was committed" part of the
// PROOF rather than an external observation: it measures the four governed
// counts before and after and FAILS if any moved.
//
// Container name is DERIVED through the local-target guard -- unconditional
// HARD DENY of the frozen demonstration project, then a fail-closed pin.
//
// Run: npm run prove:hero-1
// =====================================================================

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { assertConfigProjectId, resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { projectId: PROJECT_ID, dbContainer: DB_CONTAINER } = resolveLocalTarget();
assertConfigProjectId(
  (readFileSync(join(ROOT, "supabase", "config.toml"), "utf8").match(/^\s*project_id\s*=\s*"([^"]+)"/m) ?? [])[1] ?? "",
  PROJECT_ID,
);

const SUITE = join(ROOT, "scripts", "tests", "hero", "prove-1-canonical-context.sql");
// ⛔ The pair is MINTED, not borrowed (Operator ruling 2026-08-11). The
// prelude is CONCATENATED rather than `\i`-included: the SQL is piped to
// psql over `docker exec -i`, so the container cannot see this repository.
const PRELUDE = join(ROOT, "scripts", "tests", "hero", "_isolated-fixture.sql");

const COUNTS = `SELECT (SELECT count(*) FROM public.reports)
  || '|' || (SELECT count(*) FROM public.report_versions)
  || '|' || (SELECT count(*) FROM public.audit_events)
  || '|' || (SELECT count(*) FROM public.audit_chain_heads)
  || '|' || (SELECT count(*) FROM public.class_sessions WHERE lesson_number IS NOT NULL)
  || '|' || (SELECT count(*) FROM public.parent_student_links WHERE is_active)
  || '|' || (SELECT count(*) FROM public.students)
  || '|' || (SELECT count(*) FROM public.enrolments)
  || '|' || (SELECT count(*) FROM public.observations);`;

function psql(args, input) {
  return spawnSync("docker", ["exec", "-i", DB_CONTAINER, "psql", "--no-psqlrc", "-U", "postgres",
    "-d", "postgres", "-At", ...args], { input, encoding: "utf8", shell: false });
}

const before = psql(["-c", COUNTS]).stdout.trim();
console.log(`governed counts BEFORE: ${before}`);

const run = psql([], `${readFileSync(PRELUDE, "utf8")}
${readFileSync(SUITE, "utf8")}`);
const out = `${run.stdout}\n${run.stderr}`;
for (const line of out.split(/\r?\n/)) {
  if (/^(NOTICE|WARNING|ERROR)/.test(line.trim())) console.log(`  ${line.trim()}`);
}

const after = psql(["-c", COUNTS]).stdout.trim();
console.log(`governed counts AFTER : ${after}`);

const passes = (out.match(/PASS P1-/g) ?? []).length;
const fails = (out.match(/FAIL P1-/g) ?? []).length;
const errored = /^ERROR/m.test(out);

let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad++;
  console.log(`${ok ? "PASS   " : "FAIL   "} ${msg}`);
};

console.log("");
check(!errored, "the suite ran to completion without a SQL error");
check(fails === 0, `no failing leg (${fails} FAIL)`);
// ⚠️ A pinned literal, not `passes > 0`. Comparing a count to itself is
// vacuous, and a suite that aborted after two legs would otherwise look green.
check(passes === 7, `all SEVEN legs EXECUTED (${passes}/7) -- an unrun leg is NOT-RUN, never PASS`);
check(before === after, `the canonical database is BYTE-UNMOVED (${before} -> ${after})`);
/*
 * ⛔ THE LEG THAT STOPS THE ONE ABOVE BEING A TAUTOLOGY. `before === after`
 * is also what a counting query that observes NOTHING returns. The suite
 * emits the SAME counts mid-transaction, while its minted rows exist; if
 * that reading is not different, the query is blind and the byte-unmoved
 * claim measured nothing.
 */
const during = (out.match(/DURING-COUNTS ([0-9|]+)/) ?? [])[1] ?? "";
check(
  during !== "" && during !== before,
  `DISCRIMINATING -- the count query MOVED inside the transaction (${before} -> ${during} -> ${after}), so "unmoved" is a restoration actually measured`,
);

console.log(
  bad === 0
    ? "\nRESULT: PASS -- Phase 1 context proven, and S-8 (the G-5 parent PERMIT leg) is CLOSED."
    : `\nRESULT: FAIL -- ${bad} check(s) failed.`,
);
process.exit(bad === 0 ? 0 : 1);
