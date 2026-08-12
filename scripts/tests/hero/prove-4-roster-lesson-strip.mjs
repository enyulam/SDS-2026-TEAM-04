#!/usr/bin/env node
// =====================================================================
// HERO PHASE 4 -- runner for prove-4-roster-lesson-strip.sql
// =====================================================================
// The SQL suite writes lesson identity and a room inside ONE transaction
// and ends in ROLLBACK. This runner makes "nothing was committed" part of
// the PROOF: it measures the governed counts -- including how many sessions
// carry lesson metadata -- before and after, and FAILS if any moved.
//
// It also carries P4-7, which has no SQL half and is the leg that matters
// most on this screen. G-3 prohibits rendering lesson-plan intent into the
// governed carried-over focus. THE DATABASE CANNOT ENFORCE THAT: both
// values are legitimately readable by the same trainer on the same page,
// and the violation would happen entirely in JSX -- invisibly, because the
// strip would still look correct. So the boundary is asserted where it
// would actually be crossed: in the component source, scoped to the
// carried-focus block itself.
//
// Container name is DERIVED through the local-target guard -- unconditional
// HARD DENY of the frozen demonstration project, then a fail-closed pin.
//
// Run: npm run prove:hero-4
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

const SUITE = join(ROOT, "scripts", "tests", "hero", "prove-4-roster-lesson-strip.sql");
const ROSTER = join(ROOT, "features", "trainer", "trainer-roster.tsx");
const CONTRACT = join(ROOT, "lib", "frontend", "contracts", "physical-test.ts");

const COUNTS = `SELECT (SELECT count(*) FROM public.reports)
  || '|' || (SELECT count(*) FROM public.report_versions)
  || '|' || (SELECT count(*) FROM public.audit_events)
  || '|' || (SELECT count(*) FROM public.class_sessions WHERE lesson_number IS NOT NULL)
  || '|' || (SELECT count(*) FROM public.class_sessions WHERE room IS NOT NULL)
  || '|' || (SELECT count(*) FROM public.observations WHERE follow_up_notes IS NOT NULL);`;

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
// P4-7 -- ⛔ G-3 AT THE RENDER LAYER, scoped to where it would be crossed.
// ---------------------------------------------------------------------
const roster = readFileSync(ROSTER, "utf8");
const FOCUS_LABEL = "<StripLabel>Focus carried over from the previous session</StripLabel>";
const focusStart = roster.indexOf(FOCUS_LABEL);
// The block runs from its own label to the NEXT StripLabel — i.e. exactly the
// region that renders the governed carried-over focus and nothing else.
const nextLabel = focusStart < 0 ? -1 : roster.indexOf("<StripLabel>", focusStart + FOCUS_LABEL.length);
const focusBlock = focusStart < 0 ? null : roster.slice(focusStart, nextLabel < 0 ? roster.length : nextLabel);

const LESSON_TOKENS = ["lessonLabel", "lessonNumber", "lessonTitle", "KEY FOCUS", "keyFocus"];
const intruders = focusBlock === null
  ? []
  : LESSON_TOKENS.filter((token) => focusBlock.includes(token));

// The block must still render the governed field — asserting only "no lesson
// token" would pass on a block that had stopped rendering the focus at all,
// which is the same defect wearing the opposite sign.
const stillRendersFocus = focusBlock !== null && focusBlock.includes("carriedFocus");

const contract = readFileSync(CONTRACT, "utf8");
const sessionDto = (contract.match(/export type TrainerSessionSummaryDto = \{([\s\S]*?)\n\};/) ?? [])[1] ?? "";
const rosterDto = (contract.match(/export type RosterEntryDto = \{([\s\S]*?)\n\};/) ?? [])[1] ?? "";
const sessionFields = [...sessionDto.matchAll(/^\s*readonly\s+([A-Za-z0-9_]+)\s*[?:]/gm)].map((m) => m[1]);
const rosterFields = [...rosterDto.matchAll(/^\s*readonly\s+([A-Za-z0-9_]+)\s*[?:]/gm)].map((m) => m[1]);
const PROHIBITED = ["keyFocus", "key_focus", "focusChips", "lessonFocus", "slides", "attachments", "lessonPlan"];
const leaked = sessionFields.filter((f) =>
  PROHIBITED.some((bad) => f.toLowerCase().includes(bad.toLowerCase())),
);

let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad++;
  console.log(`${ok ? "PASS   " : "FAIL   "} ${msg}`);
};

const passes = (out.match(/PASS P4-/g) ?? []).length;
const fails = (out.match(/FAIL P4-/g) ?? []).length;
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
  emittedLegs(out, "P4"),
  `the SQL suite ACTUALLY RAN and emitted its own P4- legs (${out.trim().length} chars of output) -- without this, the assertions below are satisfied by an unreachable database`,
);

check(fails === 0, `no failing leg (${fails} FAIL)`);
// ⚠️ A pinned literal, not `passes > 0`. Comparing a count to itself is
// vacuous, and a suite that aborted after two legs would otherwise look green.
check(passes === 6, `all SIX SQL legs EXECUTED (${passes}/6) -- an unrun leg is NOT-RUN, never PASS`);
check(before === after, `the canonical database is BYTE-UNMOVED (${before} -> ${after})`);
check(focusBlock !== null, "P4-7a: the carried-over focus block was LOCATED in the roster source");
check(
  stillRendersFocus,
  "P4-7b: that block still renders the GOVERNED carried-over focus (`carriedFocus`) -- an empty block would pass 7c for the wrong reason",
);
check(
  intruders.length === 0,
  `P4-7c: ⛔ NO lesson identity or KEY FOCUS token inside the governed focus block${intruders.length ? ` (found: ${intruders.join(", ")})` : ""}`,
);
check(
  sessionFields.includes("lessonNumber") && sessionFields.includes("lessonTitle"),
  "P4-7d: the session DTO carries the Phase 4 lesson fields",
);
check(
  rosterFields.includes("previousSessionFocus"),
  "P4-7e: `RosterEntryDto.previousSessionFocus` is still the governed carry-over field and was not replaced",
);
check(
  leaked.length === 0,
  `P4-7f: ⛔ no KEY FOCUS, slides, attachment or lesson-plan field on the session DTO${leaked.length ? ` (found: ${leaked.join(", ")})` : ""}`,
);

console.log(
  bad === 0
    ? "\nRESULT: PASS -- Phase 4 lesson strip proven; the G-3 boundary holds in the schema, in the contract AND in the JSX; nothing committed."
    : `\nRESULT: FAIL -- ${bad} check(s) failed.`,
);
process.exit(bad === 0 ? 0 : 1);
