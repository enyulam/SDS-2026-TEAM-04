#!/usr/bin/env node
// =====================================================================
// F-ATTENDANCE-INIT-1 -- runner for prove-f-attendance-init-1.sql.
// =====================================================================
// The SQL half proves the defect reproduces, that the fix's call shape
// works, that the initialize is audited exactly once, and that a refused
// save materializes nothing. This half proves the SURFACE halves the
// database cannot see:
//
//   * a learner with NO attendance row is offered NO assessment path;
//   * an unrecorded learner renders DISTINGUISHABLY from a recorded one;
//   * the control sends `present` for an unrecorded learner instead of the
//     opposite of a state that was never recorded.
//
// ⛔ Exit code is the only verdict.
//
// Run: npm run prove:f-attendance-init-1
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

const PRELUDE = join(ROOT, "scripts", "tests", "hero", "_isolated-fixture.sql");
const SUITE = join(ROOT, "scripts", "tests", "portal", "prove-f-attendance-init-1.sql");

// ⚠️ BYTE-IDENTICAL to pg_temp.runner_counts() in the suite.
const COUNTS = `SELECT (SELECT count(*) FROM public.attendance)
  || '|' || (SELECT count(*) FROM public.observations)
  || '|' || (SELECT count(*) FROM public.audit_events)
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
const passes = (out.match(/PASS FA-/g) ?? []).length;
const fails = (out.match(/FAIL FA-/g) ?? []).length;

let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad++;
  console.log(`${ok ? "PASS   " : "FAIL   "} ${msg}`);
};

console.log("");
check(!/^ERROR/m.test(out), "the suite ran to completion without a SQL error");
check(fails === 0, `no failing leg (${fails} FAIL)`);
check(passes === 9, `all NINE legs EXECUTED (${passes}/9) -- an unrun leg is NOT-RUN, never PASS`);
check(before === after, `the canonical database is UNMOVED (${before} -> ${after})`);
check(
  during !== "" && during !== before,
  `the counts MOVED mid-transaction (${before} -> ${during} -> ${after}) -- both sides built by the SAME four-field shape`,
);

// ---------------------------------------------------------------------
// THE SURFACE HALF. ⚠️ Comments stripped first -- this component documents
// the defect at length, so an unstripped scan would match the paragraph
// EXPLAINING the fix rather than the code that performs it. That has
// produced a false verdict every time it was skipped in this project.
// ---------------------------------------------------------------------
const roster = readFileSync(join(ROOT, "features", "trainer", "trainer-roster.tsx"), "utf8")
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");

// ⛔ PROOF 1 -- a learner with NO attendance row is offered NO assessment path.
const gate = roster.slice(roster.indexOf("function resolveAction"));
check(
  /if\s*\(!entry\.attendanceRecorded\)\s*\{[\s\S]{0,200}kind:\s*"inert"/.test(gate),
  "a learner with NO attendance row resolves to an INERT action -- the surface stops offering a path the server refuses",
);
// ⚠️ ITS CONTROL. The gate must sit BEFORE the report-state switch, or a
// learner at `no_report` would still fall through to the `assess` branch.
check(
  gate.indexOf("!entry.attendanceRecorded") < gate.indexOf("switch (entry.reportState)"),
  "CONTROL: the attendance gate precedes the report-state switch, so no branch can route around it",
);

// ⛔ PROOF 2 -- an unrecorded learner renders DISTINGUISHABLY.
check(
  /Present — not yet recorded/.test(roster),
  "an unrecorded learner renders as `Present — not yet recorded`, distinct from a recorded `Present`",
);
check(
  /data-attendance-recorded=/.test(roster),
  "the distinction is exposed structurally, not only as styling",
);
// ⚠️ ITS CONTROL, AND IT IS THE ACCESSIBILITY ONE. The three states must
// differ as TEXT. If colour were the only carrier this passes SC 1.4.1 only
// by accident.
check(
  /\{absent \? "Absent" : entry\.attendanceRecorded \? "Present" : "Present — not yet recorded"\}/.test(roster),
  "CONTROL: all three states differ in TEXT, so colour is not carrying the meaning alone (SC 1.4.1)",
);

// ⛔ PROOF 3 -- the control sends `present` for an unrecorded learner.
check(
  /newStatus:\s*!entry\.attendanceRecorded\s*\?\s*"present"/.test(roster),
  "an unrecorded learner is sent `present` -- the write hole is closed",
);
check(
  /Confirm \$\{entry\.displayName\} present/.test(roster),
  "the control NAMES the intent it now sends, rather than describing a flip",
);
// ⚠️ ITS CONTROL. The toggle must still be a toggle for a RECORDED learner.
check(
  /entry\.attendanceState === "absent"\s*\?\s*"present"\s*:\s*"absent"/.test(roster),
  "CONTROL: a RECORDED learner still toggles both ways -- the fix added an intent, it did not replace the toggle",
);

// ⛔ PROOF 4 -- FIX D IS A STANDING PROHIBITION, and the guard is untouched.
const save = readFileSync(
  join(ROOT, "supabase", "migrations", "20260806090000_assessment_governed_persistence.sql"),
  "utf8",
);
check(
  /ERRCODE = 'BC102'/.test(save) && /a MISSING ROW FAILS CLOSED/.test(save),
  "step 7's fail-closed attendance guard is UNTOUCHED -- the assessment never materializes its own precondition",
);
check(
  !/INSERT INTO public\.attendance/.test(save),
  "the assessment save contains NO attendance INSERT (fix D, standing prohibition)",
);
check(
  /INSERT INTO public\.attendance/.test("INSERT INTO public.attendance (centre_id)"),
  "CONTROL: the attendance-INSERT pattern FIRES against text that contains one",
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
process.exit(bad === 0 ? 0 : 1);
