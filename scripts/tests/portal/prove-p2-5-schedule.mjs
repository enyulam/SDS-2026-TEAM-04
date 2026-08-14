#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-5 -- runner for prove-p2-5-schedule.sql, plus the
// CODE-SIDE bars that no SQL leg can reach.
// =====================================================================
// ⛔ THIS PHASE SHIPS NO MIGRATION. That is a claim, not a convenience,
//    and it is asserted rather than assumed: `P25a-NOMIG` fails if a
//    migration file dated into this phase appears.
//
// ⚠️ THE REGISTRY IS REPORTED, NOT PINNED AS THIS PHASE'S CLAIM. `P2-3`
//    moving it 19 -> 21 fired three earlier suites that each pinned the
//    global total, because a phase-scoped claim written as a global
//    absolute measures every OTHER phase's behaviour. The SQL side asserts
//    21 because it is asserting that THIS phase moved nothing from the
//    state it found; this runner reports the census.
//
// ⛔ Exit code is the only verdict.
//
// Run: npm run prove:portal-p2-5
// =====================================================================

import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { assertConfigProjectId, resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";
import { unpairedMigrations, uncalledFunctions } from "./rpc-call-rule.mjs";
import { emittedLegs } from "./suite-output-rule.mjs";
import { stripComments } from "./artefact-read-rule.mjs";
import { ratingLeaks, proveNarrowing } from "./rating-leak-rule.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { projectId: PROJECT_ID, dbContainer: DB_CONTAINER } = resolveLocalTarget();
assertConfigProjectId(
  (readFileSync(join(ROOT, "supabase", "config.toml"), "utf8").match(/^\s*project_id\s*=\s*"([^"]+)"/m) ?? [])[1] ?? "",
  PROJECT_ID,
);

const SUITE = join(ROOT, "scripts", "tests", "portal", "prove-p2-5-schedule.sql");

const COUNTS = `SELECT (SELECT count(*) FROM public.class_sessions)
  || '|' || (SELECT count(*) FROM public.class_session_assignments)
  || '|' || (SELECT count(*) FROM public.audit_events)
  || '|' || (SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='class_sessions');`;

const CENSUS = `SELECT (SELECT count(*) FROM supabase_migrations.schema_migrations)
  || '|' || (SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE')
  || '|' || (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public')
  || '|' || (SELECT count(DISTINCT typname) FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND typtype='e')
  || '|' || (SELECT count(*) FROM pg_policies WHERE schemaname='public')
  || '|' || (SELECT array_length(public.audit_action_registry(),1));`;

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

const passes = (out.match(/PASS P25-/g) ?? []).length;
const fails = (out.match(/FAIL P25-/g) ?? []).length;

console.log("");

check(
  emittedLegs(out, "P25"),
  `the SQL suite ACTUALLY RAN and emitted its own P25- legs (${out.trim().length} chars of output) -- without this, the two checks below are trivially true of an unreachable database`,
);
check(
  !emittedLegs("", "P25")
    && !emittedLegs("Error: No such container: supabase_db_absent", "P25")
    && !emittedLegs("NOTICE: PASS P26-1 something from another suite", "P25")
    && emittedLegs("NOTICE:  PASS P25-1  non-vacuity", "P25"),
  "P25a-EMPTY CONTROL: the shared emitted-output guard REJECTS an empty result, REJECTS a non-empty docker error carrying no legs, REJECTS another suite's legs, and ACCEPTS a real one",
);
check(!/^ERROR/m.test(out), "the SQL suite ran to completion without an error");
check(fails === 0, `no failing SQL leg (${fails} FAIL)`);
check(passes === 7, `all SEVEN SQL legs EXECUTED (${passes}/7) -- an unrun leg is NOT-RUN, never PASS`);
check(
  before === after && before !== "",
  `the database is UNMOVED and was actually read (${before} -> ${after}) -- the suite really created a control table, added a control column and rolled both back. ⚠️ The class_sessions COLUMN COUNT is in the probe deliberately: row counts alone would not notice the ADD COLUMN`,
);

// ---------------------------------------------------------------------
// ⛔ NO MIGRATION. Asserted, not assumed.
// ---------------------------------------------------------------------
const migrations = readdirSync(join(ROOT, "supabase", "migrations")).filter((f) => f.endsWith(".sql"));
// ⛔ THE COUNT PIN IS SCOPED TO THIS PHASE'S WINDOW, not to the whole tree.
//
// ▶ The ORIGINAL REASON FOR PINNING A COUNT IS SOUND AND IS KEPT: *"a migration
//   added under an unrelated filename would pass the name test alone."* What was
//   wrong was the SCOPE -- `migrations.length === 30` measured every migration
//   any FUTURE phase would ever add, so `P2-6`'s authorized file broke a suite
//   that has nothing to do with it. Fifth instance of §12.8's class.
//
// ⚠️ The boundary is the first migration dated AFTER `P2-5` shipped. Everything
//    below it is `P2-5`'s window and is frozen at 30; everything at or above it
//    belongs to a later phase and is deliberately UNCOUNTED HERE.
const P25_WINDOW_END = "20260814090000"; // `P2-6` lesson materials -- the first file after this phase
const inWindow = migrations.filter((f) => f < P25_WINDOW_END);
check(
  migrations.filter((f) => /p2_5|schedule/i.test(f)).length === 0 && inWindow.length === 30,
  `P25a-NOMIG ⛔ THIS PHASE SHIPS NO MIGRATION, and the claim is MEASURED: ${inWindow.length} migration files exist in this phase's window and NONE of the ${migrations.length} in the tree names p2_5 or schedule. ⚠️ The count guard is KEPT (a file added under an unrelated name passes the name test alone) but SCOPED to the window, so a later phase's authorized migration is not this suite's failure`,
);

const census = psql(["-c", CENSUS]).stdout.trim();
const [migrationRows, tables, functions, enums, policies, registry] = census.split("|");
// ⛔ FLOORS, NOT EQUALITIES -- and the rewrite is the FIFTH instance of §12.8's
//    phase-scoped-claim class, caught the moment `P2-6` legitimately moved the
//    census 29 -> 30 tables and the registry 21 -> 23.
//
// ⚠️ THIS FILE'S OWN HEADER ALREADY STATED THE RULE -- *"the registry is
//    REPORTED, not pinned as this phase's claim"* -- while the code three lines
//    down pinned `registry === "21"`. ▶ A CORRECT RULE WRITTEN IN A COMMENT AND
//    CONTRADICTED BY THE CODE BESIDE IT is the same defect as the plan rule
//    §7.4.1 records: the rule existed and was not followed.
//
// ⛔ Bumping 29 -> 30 and 21 -> 23 would have been the WRONG repair. It re-arms
//    the identical trap for `P2-7` and teaches that the fix for a phase-scoped
//    claim is to keep re-fitting it to other phases' work.
//
// ▶ WHAT `P2-5` CAN HONESTLY CLAIM is that it REMOVED nothing its projection
//   depends on. A later phase ADDING a table, policy or registry string is
//   legal and is none of this suite's business; a later phase DELETING one
//   would genuinely break the six-table read this phase proves. Floors assert
//   exactly that and nothing more.
//
// ⚠️ `enums` stays an EQUALITY on purpose. `P2-5` claims it added no enum, and
//    every phase since has been authorized at zero enums -- so a change in
//    either direction is a finding, not routine additive drift.
const floors = { tables: 29, policies: 30, registry: 21 };
check(
  Number(tables) >= floors.tables && enums === "12" &&
    Number(policies) >= floors.policies && Number(registry) >= floors.registry,
  `P25a-CENSUS ⛔ NOTHING THIS PHASE'S PROJECTION DEPENDS ON WAS REMOVED: tables >= ${floors.tables} (${tables}) | policies >= ${floors.policies} (${policies}) | registry >= ${floors.registry} (${registry}) | enums == 12 (${enums}). ⚠️ FLOORS, not equalities -- a later phase's legal ADDITION is not this suite's business, and pinning the global total made it measure every OTHER phase's behaviour. Reported: ${migrationRows} migrations, ${functions} functions`,
);

// ---------------------------------------------------------------------
// ⛔ THE CODE-SIDE BARS. No SQL leg can reach these.
// ---------------------------------------------------------------------
// ⚠️ COMMENTS ARE STRIPPED FIRST -- the standing requirement since a
// raw-`<select>` scan matched THREE OF ITS OWN EXPLANATORY COMMENTS,
// including a sentence saying the thing would have to be invented. This
// file's own header names `Showcase` and `Assist.` repeatedly; scanning it
// unstripped would fail the suite on its own prose.
const SOURCES = [
  ["features/management/management-schedule.tsx", null],
  ["server/modules/class-session/schedule.ts", null],
  ["server/modules/integration-adapter/adapter-dtos.ts", "AdapterManagementScheduleDto"],
];
const scheduleCode = stripComments(
  readFileSync(join(ROOT, "features", "management", "management-schedule.tsx"), "utf8"),
);
const serverCode = stripComments(
  readFileSync(join(ROOT, "server", "modules", "class-session", "schedule.ts"), "utf8"),
);

const BARRED = [
  ["Showcase", /\bShowcase\b/],
  ["Assist./Asst.", /\bAss?ist?\.\s/],
  ["Main: prefix", /Main:\s/],
  ["Junior", /\bJunior\b/],
];
const leaked = BARRED.filter(([, pattern]) => pattern.test(scheduleCode) || pattern.test(serverCode))
  .map(([name]) => name);
check(
  leaked.length === 0,
  `P25a-BARS ⛔ NONE of the four barred strings survives in the built code with comments stripped: Showcase (GC-13), Assist./Asst. (A-014/G-7), the Main: prefix, Junior (A-016/A-026/A-054). Leaked: ${leaked.length ? leaked.join(", ") : "none"}`,
);
check(
  BARRED.every(([, pattern]) =>
    pattern.test("Showcase") || pattern.test("Assist. Sam Ong") || pattern.test("Main: Sam Ong") || pattern.test("Junior · Public Speaking"),
  ) && BARRED.filter(([, p]) => p.test("Assist. Sam Ong")).length === 1,
  "P25a-BARSc CONTROL: every one of the four detectors MATCHES the frame's own string, and the Assist. detector matches exactly one of the four samples -- so P25a-BARS is a measurement, not four regexes that can never fire",
);

// ⛔ THE RATING BAR (`C-9`, `G-2`) -- there must be no field one could arrive in.
const ratingHits = ratingLeaks(serverCode);
check(
  ratingHits.length === 0,
  `P25a-RATINGS ⛔ the schedule projection names NO rating vocabulary in any RATING-SHAPED context (${ratingHits.map((h) => `${h.term} [${h.context}]`).join(", ") || "none"}) -- C-9 confines the nine ratings to report DETAIL surfaces and G-2 bars every roll-up, and this DTO has no field one could arrive in`,
);
const narrowing = proveNarrowing();
check(
  narrowing.ok,
  `P25a-RATINGSc CONTROL: the NARROWED detector fires on every real-rating sample and on NO ordinary-English sample (missed: ${narrowing.missed.join("; ") || "none"}; false positives: ${narrowing.falsePositives.join("; ") || "none"}) -- ⛔ bare-word matching over the four labels is PROHIBITED by A-052/§3.4, and a narrowing is a LOOSENING until it is proven in BOTH directions`,
);

// ⛔ NO DUPLICATED EVENT RECORD (`A-016`) -- the projection must READ, never WRITE.
const writes = /\.(insert|update|upsert|delete)\s*\(/.test(serverCode);
check(
  !writes,
  "P25a-PROJECTION ⛔ the schedule module performs NO insert, update, upsert or delete -- A-016: calendars are PROJECTIONS of class-session records, and management and trainer calendars must not store separate duplicated event records",
);
check(
  /\.(insert|update|upsert|delete)\s*\(/.test("client.from('x').insert({})"),
  "P25a-PROJECTIONc CONTROL: the same write detector MATCHES a planted `.insert({})`",
);

check(
  SOURCES.every(([file, needle]) => {
    const source = readFileSync(join(ROOT, file), "utf8");
    return source.length > 200 && (needle === null || source.includes(needle));
  }),
  `P25a-READ CONTROL: all ${SOURCES.length} scanned sources were READ and are the right files -- without this, every negative leg above is equally true of an unreadable path`,
);

// ---------------------------------------------------------------------
// ⛔ THE STANDING RULE, MECHANIZED -- shared across every portal migration.
// ---------------------------------------------------------------------
const { declared, uncalled } = uncalledFunctions(ROOT);
check(
  uncalled.length === 0,
  `P25a-CALL ⛔ all ${declared} function(s) declared by the portal migrations are still CALLED by their paired suite (${uncalled.length} uncalled${uncalled.length ? `: ${uncalled.join(", ")}` : ""}) -- this phase declares none, and the rule is re-run so a phase that adds no migration cannot silently break an earlier one's pairing`,
);
const unpaired = unpairedMigrations(ROOT);
check(
  unpaired.length === 0,
  `P25a-PAIR ⛔ every portal-era migration still has a paired suite (${unpaired.length} unpaired${unpaired.length ? `: ${unpaired.join(", ")}` : ""})`,
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
process.exit(bad === 0 ? 0 : 1);
