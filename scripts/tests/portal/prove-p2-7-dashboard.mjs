#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-7 -- runner for prove-p2-7-dashboard.sql, plus
// the CODE-SIDE bars that no SQL leg can reach.
// =====================================================================
// ⚠️ THE CENSUS IS ASSERTED AS FLOORS PLUS THIS PHASE'S OWN DELTA, never
//    as global equalities. `P2-5` pinned `tables === 29` and
//    `registry === 21`, and this phase's authorized migration broke both --
//    the FIFTH instance of §12.8's phase-scoped-claim class. ▶ Repeating
//    that shape here would break `P2-7` exactly the same way.
//
// ⛔ Exit code is the only verdict.
//
// Run: npm run prove:portal-p2-7
// =====================================================================

import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { assertConfigProjectId, resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";
import { unpairedMigrations, uncalledFunctions, rpcShapeMismatches } from "./rpc-call-rule.mjs";
import { emittedLegs } from "./suite-output-rule.mjs";
import { stripComments } from "./artefact-read-rule.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { projectId: PROJECT_ID, dbContainer: DB_CONTAINER } = resolveLocalTarget();
assertConfigProjectId(
  (readFileSync(join(ROOT, "supabase", "config.toml"), "utf8").match(/^\s*project_id\s*=\s*"([^"]+)"/m) ?? [])[1] ?? "",
  PROJECT_ID,
);

const SUITE = join(ROOT, "scripts", "tests", "portal", "prove-p2-7-dashboard.sql");

const COUNTS = `SELECT (SELECT count(*) FROM public.audit_events)
  || '|' || (SELECT count(*) FROM public.students)
  || '|' || (SELECT count(*) FROM public.observations)
  || '|' || (SELECT count(*) FROM information_schema.role_table_grants
             WHERE table_schema='public' AND table_name='observations' AND grantee='authenticated');`;

const CENSUS = `SELECT (SELECT count(*) FROM supabase_migrations.schema_migrations)
  || '|' || (SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE')
  || '|' || (SELECT count(DISTINCT typname) FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND typtype='e')
  || '|' || (SELECT count(*) FROM pg_policies WHERE schemaname='public')
  || '|' || (SELECT array_length(public.audit_action_registry(),1))
  || '|' || (SELECT count(*) FROM pg_policies WHERE schemaname='storage');`;

function psql(args, input) {
  return spawnSync("docker", ["exec", "-i", DB_CONTAINER, "psql", "--no-psqlrc", "-U", "postgres",
    "-d", "postgres", "-At", ...args], { input, encoding: "utf8", shell: false });
}

let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad++;
  console.log(`${ok ? "PASS   " : "FAIL   "} ${msg}`);
};


const before = psql(["-c", COUNTS]).stdout.trim();
const run = psql([], readFileSync(SUITE, "utf8"));
const out = `${run.stdout}\n${run.stderr}`;
for (const line of out.split(/\r?\n/)) {
  if (/^(NOTICE|WARNING|ERROR)/.test(line.trim())) console.log(`  ${line.trim()}`);
}
const after = psql(["-c", COUNTS]).stdout.trim();

const passes = (out.match(/PASS PDS-\d+/g) ?? []).length;
const fails = (out.match(/FAIL PDS-\d+/g) ?? []).length;

console.log("");

check(
  emittedLegs(out, "PDS"),
  `the SQL suite ACTUALLY RAN and emitted its own PDS- legs (${out.trim().length} chars) -- without this, every check below is trivially true of an unreachable database`,
);
check(
  !emittedLegs("", "PDS")
    && !emittedLegs("Error: No such container: supabase_db_absent", "PDS")
    && !emittedLegs("NOTICE: PASS PLM-1 something from prove-p2-6", "PDS")
    && emittedLegs("NOTICE:  PASS PDS-1  non-vacuity", "PDS"),
  "PDSa-EMPTY CONTROL: the shared emitted-output guard REJECTS an empty result, REJECTS a docker error carrying no legs, REJECTS another suite's legs, and ACCEPTS a real one",
);
check(!/^ERROR/m.test(out), "the SQL suite ran to completion without an error");
check(fails === 0, `no failing SQL leg (${fails} FAIL)`);
check(passes === 7, `all SEVEN SQL legs EXECUTED (${passes}/7) -- an unrun leg is NOT-RUN, never PASS`);
check(
  before === after && before !== "",
  `PDSa-ROLLBACK the database is UNMOVED and was actually read (${before} -> ${after}) -- the observations GRANT COUNT is in the probe deliberately: PDS-7 plants and revokes one, and a row-count-only probe would not notice a leaked grant`,
);

// ---------------------------------------------------------------------
// THIS PHASE'S OWN DELTA.
// ---------------------------------------------------------------------
const migrations = readdirSync(join(ROOT, "supabase", "migrations")).filter((f) => f.endsWith(".sql"));
const mine = migrations.filter((f) => /p2_7/i.test(f));
check(
  mine.length === 2,
  `PDSa-MIG THIS PHASE SHIPS EXACTLY TWO MIGRATIONS (${mine.length}: ${mine.join(", ") || "none"}) -- the authorized read, and a FORWARD COMMENT CORRECTION under R-1. The second exists because the first said "screen 14" where the screen is 11, and an APPLIED migration is corrected forward, never edited`,
);

const census = psql(["-c", CENSUS]).stdout.trim();
const [migrationRows, tables, enums, policies, registry, storagePolicies] = census.split("|");
check(
  Number(tables) >= 30 && enums === "12" && Number(policies) >= 30 && Number(registry) >= 23
    && Number(storagePolicies) >= 2,
  `PDSa-CENSUS NOTHING WAS REMOVED and this phase added NO STRUCTURE: tables >= 30 (${tables}) | enums == 12 (${enums}) | public policies >= 30 (${policies}) | registry >= 23 (${registry}) | storage policies >= 2 (${storagePolicies}). FLOORS, not equalities -- pinning global totals is what broke six suites at P2-6. Reported: ${migrationRows} migrations`,
);

// ---------------------------------------------------------------------
// THE CODE-SIDE BARS. No SQL leg can reach these.
// ---------------------------------------------------------------------
const SOURCES = [
  ["features/management/management-dashboard-screen.tsx", "Reports waiting for approval"],
  ["server/modules/class-session/dashboard.ts", "readDashboardSummaryCore"],
  ["app/(portals)/management/dashboard/page.tsx", "ManagementDashboardScreen"],
  ["app/(portals)/management/page.tsx", "redirect"],
];
const builtCode = SOURCES.map(([file]) => stripComments(readFileSync(join(ROOT, file), "utf8"))).join("\n");

/*
 * THE PHASE'S CENTRAL BAR -- ONE LEAK WITH TWO RENDERINGS.
 *
 * The frame draws a RATING CHIP on every approval row AND a one-line
 * DESCRIPTION carrying the same vocabulary in prose. Operator ruling: they
 * are ONE leak, and removing either alone leaves it in place while making the
 * panel LOOK clean. This leg therefore bars the VOCABULARY, which catches
 * both renderings with one detector -- a chip and a sentence are the same
 * string to a scanner.
 */
const RATING_TERMS = ["beginning", "developing", "mastering", "mastered", "competency_rating", "overallGrade", "ratingLevel"];
const leakedRatings = RATING_TERMS.filter((term) => new RegExp(term, "i").test(builtCode));
check(
  leakedRatings.length === 0,
  `PDSa-RATINGS the dashboard names NO rating vocabulary in ANY form (${leakedRatings.join(", ") || "none"}) -- neither as a CHIP nor inside a PROSE DESCRIPTION. C-9 confines the nine ratings to report DETAIL surfaces and G-2 bars every roll-up; the frame draws BOTH renderings and the Operator ruled them ONE leak`,
);
check(
  RATING_TERMS.some((t) => new RegExp(t, "i").test("Mastered eye contact, clear projection"))
    && RATING_TERMS.some((t) => new RegExp(t, "i").test("Beginning on sentence flow & pace")),
  "PDSa-RATINGSc CONTROL: the term list MATCHES the frame's OWN two row descriptions verbatim -- so PDSa-RATINGS is a measurement against the exact strings that would leak, not a regex that can never fire",
);

/*
 * ⛔ PDSa-CLASS -- THE ROW CARRIES THE CLASS, and it is asserted as a RULE rather
 * than as a string.
 *
 * The Operator's ruling enumerates FOUR identifying facts on the approval row:
 * learner, CLASS, session, status. Three were built at the first pass and the
 * class was not -- caught by re-reading the ruling against the shipped row.
 *
 * ⚠️ NO MODULE TITLE IS PINNED. The fixture's titles are what it HAPPENS to hold,
 * and pinning one would re-arm the exact §12.8 trap that made `P22-4` go red
 * BECAUSE THE PRODUCT WORKED. This leg asserts the MECHANISM instead: the row
 * reads the class from the resolved map, and it OMITS rather than placeholders.
 *
 * ⛔ AND IT BARS THE PLACEHOLDER EXPLICITLY. `hero 0B` says an absent value is an
 * omitted element, never a fabricated one -- so "Unknown class", "No class" or a
 * bare dash standing in for an unresolved title is a defect, not a fallback.
 */
const classResolved = /row\.classModuleTitle/.test(builtCode);
const classPlaceholder = /Unknown class|No class|Class unavailable|Untitled class/i.test(builtCode);
check(
  classResolved && !classPlaceholder,
  `PDSa-CLASS the approval row identifies the CLASS, read straight off the row the governed queue already decorates (resolved=${classResolved}), and NO placeholder stands in for an unresolved title (placeholder=${classPlaceholder}) -- hero 0B omits, never invents. The Operator's ruling names FOUR identifying facts: learner, CLASS, session, status`,
);
check(
  /Unknown class|No class|Class unavailable|Untitled class/i.test("Unknown class")
    && !/Unknown class|No class|Class unavailable|Untitled class/i.test("Beginner Public Speaking"),
  "PDSa-CLASSc CONTROL: the placeholder detector MATCHES a planted placeholder and does NOT match a real module title -- so PDSa-CLASS discriminates",
);

/*
 * ⛔ AND THE CLASS DID NOT ARRIVE BY WIDENING A SHARED DTO. `ManagementQueueRowDto`
 * feeds THREE ACCEPTED SCREENS (reports queue, correction tracking, submitted
 * list); adding a field to it would change their data shape to label a row on
 * this one. The class is read through the ACCEPTED SCHEDULE BOUNDARY instead, and
 * this leg fails if a later phase "tidies" that into the shared DTO.
 */
const queueDto = readFileSync(join(ROOT, "lib/frontend/contracts/physical-test.ts"), "utf8");
/*
 * ⛔ SLICED TO THE TYPE'S OWN CLOSING BRACE, not to a character count. The first
 * draft took a fixed 900-char window and MISSED the field it was looking for,
 * because `classModuleTitle` sits near the end of the declaration. ▶ A window
 * chosen by a magic number measures the window, not the type.
 */
const dtoStart = queueDto.indexOf("export type ManagementQueueRowDto");
const queueDtoBlock = queueDto.slice(dtoStart, queueDto.indexOf("\n};", dtoStart));
check(
  queueDtoBlock.length > 200 && /classModuleTitle\?:/.test(queueDtoBlock),
  `PDSa-DTO the class is the SHARED DTO's OWN pre-existing optional field (${queueDtoBlock.length} chars read) -- hero chain Phase 9 added \`classModuleTitle\` as a "session IDENTITY and SCHEDULING fact", already cleared against the exclusion list, and \`listManagementPendingReviewCore\` already decorates every row with it. ⛔ THIS PHASE ADDED NO FIELD, NO READ, NO RPC AND NO SCHEMA -- the first attempt fetched it through the schedule boundary and was removed once the row was found to carry it already`,
);

check(
  !/approvedReports|approvedCount|"Approved"/.test(builtCode) && /Submitted/.test(builtCode),
  "PDSa-SUBMITTED the KPI reads `Submitted`, and NO `Approved` count exists -- under A-036 `approved` is transient-in-transaction and never commits, so the frame's tile would read ZERO FOREVER (third sighting of the Step 7I1D-R2 defect)",
);

check(
  !/\.(insert|update|upsert|delete)\s*\(/.test(builtCode)
    && !/calendar_events|session_type|showcase/i.test(builtCode),
  "PDSa-PROJECTION the dashboard WRITES NOTHING and names no calendar/event/showcase entity -- Today's Events is P2-5's schedule projection filtered to today, not a second event store (GC-13, A-016)",
);
check(
  /\.(insert|update|upsert|delete)\s*\(/.test("client.from('x').insert({})")
    && /calendar_events|session_type|showcase/i.test("from('calendar_events')"),
  "PDSa-PROJECTIONc CONTROL: both detectors MATCH a planted sample",
);

const BARS = [["Grade 8", /\bGrade \d/], ["Hall A", /\bHall [A-Z]\b/], ["Assist./Asst.", /\bAss(?:is|')?t\.?\s/i]];
const leakedBars = BARS.filter(([, rx]) => rx.test(builtCode)).map(([n]) => n);
check(
  leakedBars.length === 0,
  `PDSa-BARS none of the frame's unratified strings survives: Grade 8 (A-016/A-026/A-054 -- the grade is READ from class_grades), Hall A (room exists but is NULL on all 17 sessions -- hero 0B omits it), Assist./Asst. (A-014/G-7). Leaked: ${leakedBars.join(", ") || "none"}`,
);
check(
  BARS.every(([, rx]) => rx.test("Grade 8 Speaking Assessments - Hall A - Assist. Sam Ong")),
  "PDSa-BARSc CONTROL: every detector MATCHES the frame's own strings",
);

// THE ROUTE MOVE, MEASURED.
const redirectSource = readFileSync(join(ROOT, "app/(portals)/management/page.tsx"), "utf8");
check(
  /redirect\(\s*"\/management\/dashboard"\s*\)/.test(redirectSource),
  "PDSa-REDIRECT `/management` really REDIRECTS to `/management/dashboard` -- built to the ratified R-B1 precedent (`/trainer` -> `/trainer/schedule`), not a new pattern. A rail item may only name the DESTINATION if the old route actually redirects",
);
const nav = readFileSync(join(ROOT, "components/layout/portal-navigation.ts"), "utf8");
check(
  !/home:\s*"\/management"/.test(nav) && /home:\s*"\/management\/dashboard"/.test(nav),
  "PDSa-RAIL the Management rail names the DESTINATION, not the redirect -- a rail item pointing at a route that redirects away would make `Dashboard` NEVER be the current item, because the URL the browser settles on is never the one the item declares",
);

check(
  SOURCES.every(([file, needle]) => {
    const source = readFileSync(join(ROOT, file), "utf8");
    return source.length > 100 && (needle === null || source.includes(needle));
  }),
  `PDSa-READ CONTROL: all ${SOURCES.length} scanned sources were READ and are the right files -- without this, every negative leg above is equally true of an unreadable path`,
);

// ---------------------------------------------------------------------
// THE STANDING RULES, MECHANIZED.
// ---------------------------------------------------------------------
const { declared, uncalled } = uncalledFunctions(ROOT);
check(
  uncalled.length === 0,
  `PDSa-CALL all ${declared} function(s) declared by the portal migrations are CALLED by their paired suite (${uncalled.length} uncalled${uncalled.length ? `: ${uncalled.join(", ")}` : ""})`,
);
/*
 * ⛔ PDSa-SHAPE -- THE RULE THIS PHASE'S OWN DEFECT PRODUCED.
 *
 * `report_centre_dashboard_summary` is `RETURNS record`, so PostgREST hands the
 * client a BARE OBJECT; its nearest peer `report_class_health_summary` is
 * `SETOF record` and hands back an ARRAY. Reading `rows[0]` off the object gave
 * `undefined` on every call, the read FAILED CLOSED, and all four KPI tiles
 * rendered the refusal em dash on a page whose seven SQL legs were green.
 *
 * ⚠️ NO SQL LEG COULD HAVE CAUGHT IT -- `SELECT … FROM f()` reads both shapes
 * identically. `S3-M8-live` caught it on the painted page. This leg makes the
 * class mechanical so the next single-record RPC cannot repeat it.
 *
 * ⛔ `proretset` IS READ FROM `pg_proc`, never parsed from the migration text:
 * the catalogue is what PostgREST itself reads.
 */
const SETOF = psql(["-c",
  "SELECT p.proname || '=' || p.proretset FROM pg_catalog.pg_proc p "
  + "JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public';"]).stdout.trim();
/*
 * ⚠️ `flag` IS `true`/`false`, NOT `t`/`f`. psql DISPLAYS a boolean column as
 * `t`, but `'x' || p.proretset` casts the boolean TO TEXT, which spells it out.
 * ▶ The first draft compared against `"t"`, so EVERY function read as
 * non-set-returning and the rule reported five mismatches that were not real —
 * including `report_class_health_summary`, which the catalogue says IS
 * set-returning. Caught because that contradiction was checked against the
 * database rather than believed. ⛔ Anything other than the two known spellings
 * is left UNDEFINED, so an unparsed line SKIPS the site instead of silently
 * asserting it is a bare record.
 */
const setReturning = new Map(
  SETOF.split(/\r?\n/).filter(Boolean).flatMap((line) => {
    const [name, flag] = line.split("=");
    if (flag === "true") return [[name, true]];
    if (flag === "false") return [[name, false]];
    return [];
  }),
);
const { inspected, mismatches } = rpcShapeMismatches(ROOT, (fn) => setReturning.get(fn));
check(
  setReturning.size > 0 && inspected > 0 && mismatches.length === 0,
  `PDSa-SHAPE all ${inspected} RPC consumer(s) match their function's RESULT SHAPE (${mismatches.join("; ") || "no mismatch"}) -- a RETURNS record function resolves to a bare object and must be read with readMaybeRow, never readRows. Read ${setReturning.size} function(s) from pg_proc`,
);
check(
  rpcShapeMismatches(ROOT, (fn) => (fn === "report_centre_dashboard_summary" ? true : setReturning.get(fn))).mismatches.length === 0
    && rpcShapeMismatches(ROOT, () => false).mismatches.length > 0,
  "PDSa-SHAPEc CONTROL: told every function is a bare record, the rule FIRES on the readRows consumers it then finds -- so PDSa-SHAPE is a measurement and not a pattern that can never match",
);

const unpaired = unpairedMigrations(ROOT);
check(
  unpaired.length === 0,
  `PDSa-PAIR every portal-era migration still has a paired suite (${unpaired.length} unpaired${unpaired.length ? `: ${unpaired.join(", ")}` : ""})`,
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
process.exit(bad === 0 ? 0 : 1);
