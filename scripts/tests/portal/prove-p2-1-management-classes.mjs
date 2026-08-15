#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-1 -- runner for prove-p2-1-management-classes.sql.
// =====================================================================
// The SQL half proves the DATA path discriminates and that this phase
// genuinely needs no schema. This half proves what SQL cannot see:
//
//   * THE THREE RULED OMISSIONS ARE ABSENT FROM THE SURFACE -- the TA
//     `Asst.` slot (A-014/G-7, NEVER ENDS), the `X / 12 Lessons done`
//     counter (ends when D-3/D-4 data arrives) and the frame's `Junior`
//     tab (A-016/A-054).
//   * EACH ABSENCE SCAN CAN ACTUALLY FIRE. ⛔ A scan proving a token is
//     absent is trivially satisfied by a file it never read, by a regex
//     that matches nothing, and by an empty string. Every absence leg
//     below is paired with a CONTROL the detector must MATCH.
//   * THE SUBJECT EXISTS. An absence assertion over a surface that renders
//     no cards at all is the S-8 shape: the card block is located and
//     proven to render the fields it should.
//   * NOTHING WAS COMMITTED and every SQL leg EXECUTED -- a pinned leg
//     count. An unrun leg is NOT-RUN, never PASS.
//
// ⛔ Exit code is the only verdict, and no pipe sits between the verdict
//    and the decision that consumes it.
//
// Run: npm run prove:portal-p2-1
// =====================================================================

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { assertConfigProjectId, resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";
import { emittedLegs } from "./suite-output-rule.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { projectId: PROJECT_ID, dbContainer: DB_CONTAINER } = resolveLocalTarget();
assertConfigProjectId(
  (readFileSync(join(ROOT, "supabase", "config.toml"), "utf8").match(/^\s*project_id\s*=\s*"([^"]+)"/m) ?? [])[1] ?? "",
  PROJECT_ID,
);

const SUITE = join(ROOT, "scripts", "tests", "portal", "prove-p2-1-management-classes.sql");

const COUNTS = `SELECT (SELECT count(*) FROM public.class_modules)
  || '|' || (SELECT count(*) FROM public.class_grades)
  || '|' || (SELECT count(*) FROM public.enrolments)
  || '|' || (SELECT count(*) FROM public.class_session_assignments)
  || '|' || (SELECT count(*) FROM public.audit_events);`;

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
// The SQL half.
// ---------------------------------------------------------------------
const before = psql(["-c", COUNTS]).stdout.trim();
const run = psql([], readFileSync(SUITE, "utf8"));
const out = `${run.stdout}\n${run.stderr}`;
for (const line of out.split(/\r?\n/)) {
  if (/^(NOTICE|WARNING|ERROR)/.test(line.trim())) console.log(`  ${line.trim()}`);
}
const after = psql(["-c", COUNTS]).stdout.trim();

const passes = (out.match(/PASS P21-/g) ?? []).length;
const fails = (out.match(/FAIL P21-/g) ?? []).length;

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
  emittedLegs(out, "P21"),
  `the SQL suite ACTUALLY RAN and emitted its own P21- legs (${out.trim().length} chars of output) -- without this, the assertions below are satisfied by an unreachable database`,
);

check(!/^ERROR/m.test(out), "the SQL suite ran to completion without an error");
check(fails === 0, `no failing SQL leg (${fails} FAIL)`);
check(passes === 9, `all NINE SQL legs EXECUTED (${passes}/9) -- an unrun leg is NOT-RUN, never PASS`);
check(
  before === after && before !== "",
  `the database is UNMOVED and was actually read (${before} -> ${after}) -- this phase writes nothing`,
);

// ---------------------------------------------------------------------
// THE SOURCE HALF.
// ---------------------------------------------------------------------
const F = (...parts) => join(ROOT, ...parts);
const strip = (f) =>
  readFileSync(f, "utf8")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

const SCREEN_PATH = F("features", "management", "management-classes.tsx");
const screen = strip(SCREEN_PATH);
const projection = strip(F("server", "modules", "class-session", "class-list-projections.ts"));
const adapter = strip(F("server", "modules", "integration-adapter", "participant-actions.ts"));

// ⛔ P21a-0 -- THE SUBJECT EXISTS. Every absence leg below is trivially true
// of an empty string, and this project has already had a READ-ONLY leg report
// PASS against a block its matcher never located.
check(
  screen.length > 800 && /activeStudentCount/.test(screen) && /classGradeLabel/.test(screen),
  `P21a-0  the screen source was READ and renders the card's own fields (${screen.length} comment-stripped chars) -- without this every absence below is true of nothing`,
);

// ---------------------------------------------------------------------
// The three ruled omissions, each with a control the detector MUST match.
// ---------------------------------------------------------------------
const TA = /\bAsst\.?|\bAssist(ant)?\b|\bTeaching Assistant\b|\bTA\b/;
check(!TA.test(screen), "P21a-1  ⛔ NO TA / `Asst.` slot on the surface (A-014, G-7) -- REGISTERED-OMISSION, NEVER ENDS");
check(
  TA.test("Asst. Nadia Rahman"),
  "P21a-1c CONTROL: the TA detector MATCHES the frame's own `Asst. Nadia Rahman` -- it can fire",
);

const LESSONS_DONE = /Lessons?\s+done|\/\s*12\b/i;
check(
  !LESSONS_DONE.test(screen),
  "P21a-2  ⛔ NO `X / 12 Lessons done` counter -- REGISTERED-OMISSION, ENDS WHEN D-3/D-4 DATA ARRIVES (P2-2/P2-6). A denominator invented now is a fabricated fact",
);
check(
  LESSONS_DONE.test("8 / 12 Lessons done"),
  "P21a-2c CONTROL: the lesson-progress detector MATCHES the frame's own `8 / 12 Lessons done`",
);

const JUNIOR = /\bJunior\b/;
check(
  !JUNIOR.test(screen),
  "P21a-3  ⛔ THE FRAME'S `Junior` TAB IS NOT BUILT and `Beginner` is not a relabel of it (A-016, A-054) -- the tabs are read from class_grades, never from a literal here",
);
check(JUNIOR.test("Junior"), "P21a-3c CONTROL: the `Junior` detector MATCHES that literal");

// ⛔ …and the tabs really are data-driven, which is what makes P21a-3
// structural rather than a promise: a fourth grade cannot appear by editing
// this component.
check(
  /data\.grades\.map/.test(screen) && !/"Beginner"|'Beginner'/.test(screen),
  "P21a-4  the level tabs are RENDERED FROM `data.grades`, and no grade label is hard-coded in the component",
);

// ---------------------------------------------------------------------
// C-9 / G-2 / Q-27 -- no assessment fact reaches this LIST surface.
// ---------------------------------------------------------------------
const RATING_TOKEN = /\bbeginning\b|\bdeveloping\b|\bmastering\b|\bmastered\b|Overall Grade|ratingSnapshots|RATING_TILE_STYLE|\bdimensionCode\b/i;
check(
  !RATING_TOKEN.test(screen),
  "P21a-5  ⛔ NO rating vocabulary, roll-up or dimension token on the surface (C-9: a LIST is not report detail; G-2: a roll-up is excluded everywhere)",
);
check(
  RATING_TOKEN.test("rating: Mastering") && RATING_TOKEN.test("Overall Grade"),
  "P21a-5c CONTROL: the rating detector MATCHES both a rating label and the excluded roll-up heading",
);
check(
  projection.length > 800 && !RATING_TOKEN.test(projection),
  "P21a-6  ⛔ the PROJECTION carries no rating token either, and it was READ -- the exclusion is at the governed read, not in the client, because hiding a value the client already holds is not a boundary",
);

// ---------------------------------------------------------------------
// Q-7 -- a rejected query is not an empty result.
// ---------------------------------------------------------------------
const readRowsSites = (projection.match(/readRows</g) ?? []).length;
check(
  readRowsSites === 7,
  `P21a-7  every one of the projection's ${readRowsSites} reads goes through \`readRows\` (Q-7) -- pinned at 7; a new bare \`.from(...)\` moves this number`,
);
check(
  /if \(!grades\.ok\) return \{ ok: false \}/.test(projection) &&
    /if \(!modules\.ok\) return \{ ok: false \}/.test(projection) &&
    /if \(!enrolments\.ok\) return \{ ok: false \}/.test(projection),
  "P21a-8  ⛔ THE SPINE FAILS CLOSED: a rejected grades, modules or enrolments read returns `{ ok: false }`, never an empty academy",
);
check(
  /return \{ outcome: "unavailable" \}/.test(
    strip(F("server", "modules", "management-view", "projections.ts")).split("listManagementClassesCore")[1] ?? "",
  ),
  "P21a-9  …and the management gate turns that rejection into `unavailable`, so \"No classes yet\" is never rendered over a failed read",
);

// ---------------------------------------------------------------------
// The adapter mapper is an ALLOW-LIST.
// ---------------------------------------------------------------------
const mapper = adapter.split("adapterListManagementClasses")[1]?.split("export async function")[0] ?? "";
check(mapper.length > 200, "P21a-10 the adapter mapper block was LOCATED (the leg below is not true of an empty slice)");
/*
 * ⚠️ THE FIRST FORM OF THIS DETECTOR WAS `/\.\.\.row\b/`, AND IT FAILED ON
 * CORRECT CODE. It matched `[...row.trainerDisplayNames]` -- an ARRAY COPY,
 * not an object spread, and the exact opposite of the defect it hunts.
 *
 * ▶ Recorded rather than quietly narrowed: a search is evidence about the
 * code only once it is proven DISCRIMINATING, and this one proved it by
 * going red on a file that was already right. What it must catch is an
 * OBJECT spread — `...row,` or `...row }` — which is the shape that would
 * carry an unnamed field through to the client.
 */
const OBJECT_SPREAD = /\.\.\.(row|grade)\s*[,}]/;
check(
  !OBJECT_SPREAD.test(mapper) && /classModuleId: row\.classModuleId/.test(mapper),
  "P21a-11 ⛔ the adapter maps ONE FIELD AT A TIME with no object spread -- a field the projection grows later cannot reach the client until someone names it",
);
check(
  OBJECT_SPREAD.test("{ ...row, extra: 1 }") &&
    OBJECT_SPREAD.test("{ ...row }") &&
    !OBJECT_SPREAD.test("[...row.trainerDisplayNames]"),
  "P21a-11c CONTROL: the spread detector MATCHES both object-spread forms and does NOT match the array copy that made its first form fire wrongly",
);

// ---------------------------------------------------------------------
// The route, and the navigation census that now covers it.
// ---------------------------------------------------------------------
check(
  existsSync(F("app", "(portals)", "management", "classes", "page.tsx")),
  "P21a-12 screen `12` answers at its CANONICAL route /management/classes (12-management-classes/screen.md §1)",
);

const nav = spawnSync(
  "node",
  ["--import", "./scripts/tests/integration/alias-loader.mjs", "tests/frontend/portal-navigation-active-state.mjs"],
  { cwd: ROOT, encoding: "utf8", shell: false },
);
check(
  nav.status === 0,
  `P21a-13 the portal navigation suite exits 0 with the new route (exit ${nav.status}) -- exactly one active rail item on /management/classes`,
);
/*
 * ⛔ THE RATCHET WENT RED AT `P2-10` AND STAYED RED FOR A WHOLE PHASE, AND
 * THAT IS THE FINDING — §12.13's THIRD INSTANCE. `/management/trainers`
 * shipped, this census immediately reported *"1 shipped portal route has NO
 * expectation and was therefore never asserted"*, and `P2-10` was reported
 * complete WITHOUT `prove:portal-p2-1` being re-run. ▶ **The gate worked; it
 * was not read.** It is recorded here rather than quietly corrected, because
 * the pattern is about which suites get run at the end of a phase, not about
 * this number.
 *
 * ⚠️ THE PIN MOVED 16 → 17 AT `P2-2`, 17 → 18 AT `P2-3`, 18 → 19 AT
 * `P2-4`, 19 → 20 AT `P2-5`, 20 → 21 AT `P2-6`, 21 → 22 AT `P2-7`, 22 → 23 AT `P2-8`,
 * THEN 23 → 24 AT `P2-10` AND 24 → 25 AT `P2-11` — the last two together, in the
 * pass that noticed — AND 25 → 26 AT `P2-9`, AND 26 → 27 AT `P2-15`.
 *
 * ✅ **AND `P2-9` IS THE FIRST TIME THIS LEG FIRED *DURING* A PHASE RATHER THAN
 * A PHASE LATE.** It went red on the same run that shipped
 * `/management/students/[studentId]`, was read, and was moved before the phase
 * closed. ▶ That is the whole of §12.13's correction: **the gate was always
 * working; what changed is that it was run at the end of the phase that
 * touched its subject.** AND IT WAS REWRITTEN
 * EACH TIME RATHER THAN DELETED. Screen `26` shipped at
 * `/management/classes/add-class`, screen `27` at
 * `/management/classes/[classModuleId]/edit`, screen `25` at
 * `/management/schedule` and screen `14` at
 * `/management/classes/[classModuleId]/lesson-plans` screen `11` at
 * `/management/dashboard` and screen `17` at `/management/students`, so the app
 * tree really does carry seven more routes than it did at `P2-1`. ⚠️ `P2-7` ADDED a route without removing one:
 * `/management` still ships, now as a COMPATIBILITY REDIRECT, so the census
 * counts both. ▶ The property this leg protects is
 * unchanged and is why it stays an EXACT number rather than a `>=`: the nav
 * census must be READING the tree, and a floor would keep passing if it
 * silently stopped. Every new screen deliberately edits this line — that is the
 * ratchet, not friction.
 *
 * ⛔ THIS IS A ROUTE CENSUS, NOT A PROJECT CENSUS. It moves when a route ships
 * and for no other reason; the four "nothing was added" schema invariants live
 * in each phase's own suite, and the single global FUNCTION ratchet lives in
 * `prove-2-parent-report-list.sql` `P2-6`. A ratchet in five places is five
 * chances to relax the wrong one.
 */
check(
  /all 29 portal routes derived from app\/\*\*\/page\.tsx carry an expectation/.test(nav.stdout ?? ""),
  "P21a-14 …and its census READ 29 routes from the app tree (16 + `26` at P2-2 + `27` at P2-3 + `13` at P2-4 + `25` at P2-5 + `14` at P2-6 + `11` at P2-7 + `17` at P2-8 + `23` at P2-10 + `24` at P2-11 + `18` at P2-9 + `15` at P2-15 + `16` at P2-16 + `02` at P2-17) -- the ratchet SAW the new route rather than passing over a list that never mentioned it",
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
process.exit(bad === 0 ? 0 : 1);
