#!/usr/bin/env node
// =====================================================================
// HERO PHASE 2 -- runner for prove-2-parent-report-list.sql
// =====================================================================
// The SQL suite drives a report to `submitted` inside ONE transaction and
// ends in ROLLBACK. This runner makes "nothing was committed" part of the
// PROOF rather than an external observation: it measures the governed
// counts before and after and FAILS if any moved.
//
// It also carries P2-7, which has no SQL half: the parent-facing LIST DTO
// is a TypeScript disclosure surface, so it is pinned in TypeScript --
// exactly as the migration pins the RPC's return type by name. A rating,
// hash, revision, status or correction field appearing there would reach a
// Parent client whatever the database returned.
//
// Container name is DERIVED through the local-target guard -- unconditional
// HARD DENY of the frozen demonstration project, then a fail-closed pin.
//
// Run: npm run prove:hero-2
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

const SUITE = join(ROOT, "scripts", "tests", "hero", "prove-2-parent-report-list.sql");
const CONTRACT = join(ROOT, "lib", "frontend", "contracts", "physical-test.ts");

const COUNTS = `SELECT (SELECT count(*) FROM public.reports)
  || '|' || (SELECT count(*) FROM public.report_versions)
  || '|' || (SELECT count(*) FROM public.audit_events)
  || '|' || (SELECT count(*) FROM public.audit_chain_heads)
  || '|' || (SELECT count(*) FROM public.class_sessions)
  || '|' || (SELECT count(*) FROM public.parent_student_links WHERE is_active);`;

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
// P2-7 -- the parent-facing LIST DTO is exactly its authorized field set.
// ---------------------------------------------------------------------
// Two independent assertions, because either alone is weak: an exact-set
// match catches a field being ADDED, and the prohibited-substring scan
// catches a field being added under a name the exact set was then edited
// to accept. The second is the one that survives a careless edit to the
// first.
const AUTHORIZED = [
  "studentId", "studentDisplayName", "sessionId", "sessionDate", "submittedAt",
  "classGradeLabel", "classModuleTitle", "lessonNumber", "lessonTitle", "trainerDisplayName",
];
const PROHIBITED = [
  "rating", "grade_band", "gradeBand", "overall", "hash", "revision",
  "correction", "status", "term", "evidence", "observation", "note", "draft", "audit",
];

const contractSource = readFileSync(CONTRACT, "utf8");
const dtoBody = (contractSource.match(
  /export type ParentReportListItemDto = \{([\s\S]*?)\n\};/,
) ?? [])[1];
const dtoFields = dtoBody === undefined
  ? null
  : [...dtoBody.matchAll(/^\s*readonly\s+([A-Za-z0-9_]+)\s*[?:]/gm)].map((m) => m[1]);

// ⚠️ `classGradeLabel` legitimately contains "grade", so the scan is over a
// deliberately narrow prohibited list and is case-insensitive on the rest.
const leaked = (dtoFields ?? []).filter((f) =>
  PROHIBITED.some((bad) => f.toLowerCase().includes(bad.toLowerCase())),
);

let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad++;
  console.log(`${ok ? "PASS   " : "FAIL   "} ${msg}`);
};

const passes = (out.match(/PASS P2-/g) ?? []).length;
const fails = (out.match(/FAIL P2-/g) ?? []).length;
const errored = /^ERROR/m.test(out);

console.log("");
check(!errored, "the suite ran to completion without a SQL error");
check(fails === 0, `no failing leg (${fails} FAIL)`);
// ⚠️ A pinned literal, not `passes > 0`. Comparing a count to itself is
// vacuous, and a suite that aborted after two legs would otherwise look green.
check(passes === 6, `all SIX SQL legs EXECUTED (${passes}/6) -- an unrun leg is NOT-RUN, never PASS`);
check(before === after, `the canonical database is BYTE-UNMOVED (${before} -> ${after})`);
check(dtoFields !== null, "P2-7a: ParentReportListItemDto was located in the frontend contract");
check(
  dtoFields !== null
    && dtoFields.length === AUTHORIZED.length
    && AUTHORIZED.every((f) => dtoFields.includes(f)),
  `P2-7b: the parent list DTO is EXACTLY its ${AUTHORIZED.length} authorized fields (found ${dtoFields?.length ?? "none"})`,
);
check(
  leaked.length === 0,
  `P2-7c: no rating, hash, revision, status, correction or evidence field on the parent list DTO${leaked.length ? ` (found: ${leaked.join(", ")})` : ""}`,
);

console.log(
  bad === 0
    ? "\nRESULT: PASS -- Phase 2 parent report list proven; non-vacuity measured, three refusals hold, nothing committed."
    : `\nRESULT: FAIL -- ${bad} check(s) failed.`,
);
process.exit(bad === 0 ? 0 : 1);
