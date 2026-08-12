#!/usr/bin/env node
// =====================================================================
// HERO PHASE 7 -- runner for prove-7-follow-up-save.sql
// =====================================================================
// ⛔ THIS IS NOT THE CARRY-OVER PROOF AND DOES NOT DISCHARGE IT.
// `npm run test:continuity` proves a note saved on screen `07` appears as
// the NEXT session's previous focus (`CLAUDE.md` §10 Phase 1 exit (c)); it
// was re-run and PASSED at `459be14`, BEFORE this write path existed. This
// runner proves the REVIEW SURFACE'S SAVE PATH. Two claims, two verdicts,
// recorded apart (plan §9.3 rules 2 and 4).
//
// The SQL suite runs inside ONE transaction ending in ROLLBACK. This runner
// makes "nothing was committed" part of the PROOF: it measures the governed
// counts before and after and FAILS if any moved.
//
// It also carries P7-7, the SURFACE half, which has no SQL equivalent: the
// database cannot tell whether the screen reaches the function, whether the
// field is genuinely editable, or whether the client sends more than it
// should.
//
// Container name is DERIVED through the local-target guard -- unconditional
// HARD DENY of the frozen demonstration project, then a fail-closed pin.
//
// Run: npm run prove:hero-7
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

const SUITE = join(ROOT, "scripts", "tests", "hero", "prove-7-follow-up-save.sql");
// ⛔ The pair is MINTED, not borrowed (Operator ruling 2026-08-11). The
// prelude is CONCATENATED rather than `\i`-included: the SQL is piped to
// psql over `docker exec -i`, so the container cannot see this repository.
const PRELUDE = join(ROOT, "scripts", "tests", "hero", "_isolated-fixture.sql");
const REVIEW = join(ROOT, "features", "trainer", "trainer-report-review.tsx");

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

// ---------------------------------------------------------------------
// P7-7 -- THE SURFACE HALF. No SQL equivalent exists for any of it.
// ---------------------------------------------------------------------
// Comments are stripped first: this component documents the D-2 ruling at
// length, so a scan over the raw text would match the prose explaining the
// change rather than the code making it. Third time this precaution has been
// needed today, and the migration's own H7-6 needed it too.
const review = readFileSync(REVIEW, "utf8");
const rendered = review.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

const editable = /<textarea[\s\S]{0,400}?id=\{coachNotesId\}/.test(rendered);
const wired = rendered.includes("port.saveFollowUpNotes(");
const callSite = (rendered.match(/saveFollowUpNotes\(\{[\s\S]{0,300}?\}\)/) ?? [""])[0];
const twoFields = callSite.includes("reportId") && callSite.includes("followUpNotes");
const noExtras = callSite !== "" && !/rating|lockVersion|versionId|contentHash|status/i.test(callSite);
const seeded = rendered.includes("coachNotesDraft ?? report.coachNotes");

let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad++;
  console.log(`${ok ? "PASS   " : "FAIL   "} ${msg}`);
};

const passes = (out.match(/PASS P7-/g) ?? []).length;
const fails = (out.match(/FAIL P7-/g) ?? []).length;
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
  emittedLegs(out, "P7"),
  `the SQL suite ACTUALLY RAN and emitted its own P7- legs (${out.trim().length} chars of output) -- without this, the assertions below are satisfied by an unreachable database`,
);

check(fails === 0, `no failing leg (${fails} FAIL)`);
// ⚠️ A pinned literal, not `passes > 0`. A suite that aborted after two legs
// would otherwise look green.
check(passes === 6, `all SIX SQL legs EXECUTED (${passes}/6) -- an unrun leg is NOT-RUN, never PASS`);
// ⚠️ The last count field is an MD5 over every follow-up note, not a row
// count: this suite WRITES to that column, so a row count would not notice a
// value that failed to roll back.
check(before === after, `the canonical database is BYTE-UNMOVED, note contents included (${before} -> ${after})`);
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

check(editable, "P7-7a: the Coach Notes field is a real <textarea>, not a read-only <p> -- D-2 implemented, not merely ruled");
check(wired, "P7-7b: it is wired to the GOVERNED port method `port.saveFollowUpNotes`");
check(callSite !== "", "P7-7c: the call site was LOCATED -- P7-7d/e below measure it rather than an empty string");
check(twoFields, "P7-7d: the call carries the report identity and the note");
check(noExtras, `P7-7e: ⛔ and NOTHING else -- no rating, lock version, version id, hash or status crosses the client boundary${noExtras ? "" : ` (found in: ${callSite.replace(/\s+/g, " ")})`}`);
check(seeded, "P7-7f: the field is SEEDED from the governed value, never from \"\" -- §6 requires it always loaded, never blanked, and an empty initial draft could silently ERASE the note feeding the carry-over");

console.log(
  bad === 0
    ? "\nRESULT: PASS -- F-S6-REVIEW-1 built and proven: the governed save writes one column and nothing else, three non-trainer callers are refused identically, and the surface reaches it.\n        ⛔ This says NOTHING about the carry-over proof, which passed separately at 459be14."
    : `\nRESULT: FAIL -- ${bad} check(s) failed.`,
);
process.exit(bad === 0 ? 0 : 1);
