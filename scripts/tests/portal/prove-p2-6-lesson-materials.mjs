#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-6 -- runner for prove-p2-6-lesson-materials.sql, plus
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
// Run: npm run prove:portal-p2-6
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

const SUITE = join(ROOT, "scripts", "tests", "portal", "prove-p2-6-lesson-materials.sql");

const COUNTS = `SELECT (SELECT count(*) FROM public.class_session_materials)
  || '|' || (SELECT count(*) FROM public.audit_events)
  || '|' || (SELECT count(*) FROM storage.objects)
  || '|' || (SELECT count(*) FROM storage.buckets);`;

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

const passes = (out.match(/PASS PLM-/g) ?? []).length;
const fails = (out.match(/FAIL PLM-/g) ?? []).length;

console.log("");

check(
  emittedLegs(out, "PLM"),
  `the SQL suite ACTUALLY RAN and emitted its own PLM- legs (${out.trim().length} chars of output) -- without this, every check below is trivially true of an unreachable database`,
);
check(
  !emittedLegs("", "PLM")
    && !emittedLegs("Error: No such container: supabase_db_absent", "PLM")
    && !emittedLegs("NOTICE: PASS P26-1 something from prove-p2-4 (the suite that OWNS the P26- prefix)", "PLM")
    && emittedLegs("NOTICE:  PASS PLM-1  non-vacuity", "PLM"),
  "PLMa-EMPTY CONTROL: the shared emitted-output guard REJECTS an empty result, REJECTS a non-empty docker error carrying no legs, REJECTS another suite's legs, and ACCEPTS a real one",
);
check(!/^ERROR/m.test(out), "the SQL suite ran to completion without an error");
check(fails === 0, `no failing SQL leg (${fails} FAIL)`);
check(passes === 8, `all EIGHT SQL legs EXECUTED (${passes}/8) -- an unrun leg is NOT-RUN, never PASS`);
check(
  before === after && before !== "",
  `PLMa-ROLLBACK the database is UNMOVED and was actually read (${before} -> ${after}) -- the suite attached a material, emitted two audit events, created two storage objects and rolled ALL of it back. ⚠️ storage.objects is in the probe deliberately: a material-row count alone would not notice a leaked object`,
);

// ---------------------------------------------------------------------
// ⛔ THIS PHASE'S OWN MIGRATION DELTA, asserted exactly.
// ---------------------------------------------------------------------
const migrations = readdirSync(join(ROOT, "supabase", "migrations")).filter((f) => f.endsWith(".sql"));
const mine = migrations.filter((f) => /p2_6|lesson_materials/i.test(f));
check(
  mine.length === 1,
  `PLMa-ONEMIG ⛔ THIS PHASE SHIPS EXACTLY ONE MIGRATION (${mine.length}: ${mine.join(", ") || "none"}) -- the authorization named one file, and a second would be schema nobody stated in advance`,
);

const census = psql(["-c", CENSUS]).stdout.trim();
const [migrationRows, tables, enums, policies, registry, storagePolicies] = census.split("|");
check(
  Number(tables) >= 30 && enums === "12" && Number(policies) >= 30 && Number(registry) >= 23
    && Number(storagePolicies) >= 2,
  `PLMa-CENSUS ⛔ THE AUTHORIZED DELTA LANDED AND NOTHING WAS REMOVED: tables >= 30 (${tables}) | enums == 12 (${enums}) | public policies >= 30 (${policies}) | registry >= 23 (${registry}) | storage policies >= 2 (${storagePolicies}). ⚠️ FLOORS, not equalities -- pinning global totals is what made P2-5 fail on THIS phase authorized work. enums stays an equality because every phase since has been authorized at ZERO enums, so movement in either direction is a finding. Reported: ${migrationRows} migrations`,
);

// ⛔ ZERO POLICIES AND ZERO CLIENT GRANTS ON THE NEW TABLE -- re-asserted from
//    the runner as well as the SQL side, because these two are the whole
//    reason the table is RPC-only.
const tableGuard = psql(["-c",
  `SELECT (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename='class_session_materials')
   || '|' || (SELECT count(*) FROM information_schema.role_table_grants WHERE table_schema='public'
              AND table_name='class_session_materials' AND grantee IN ('authenticated','anon','PUBLIC','service_role'));`,
]).stdout.trim();
check(
  tableGuard === "0|0",
  `PLMa-RPCONLY ⛔ class_session_materials carries ZERO policies and ZERO client grants (${tableGuard}) -- every read and write is a reviewed SECURITY DEFINER RPC`,
);

// ---------------------------------------------------------------------
// ⛔ THE CODE-SIDE BARS. No SQL leg can reach these.
// ---------------------------------------------------------------------
// ⚠️ COMMENTS ARE STRIPPED FIRST -- the standing requirement since a scan
// matched THREE OF ITS OWN EXPLANATORY COMMENTS. This file's own header and
// the component's header both name `KEY FOCUS` and `Junior` repeatedly;
// scanning unstripped would fail the suite on its own prose.
const SOURCES = [
  ["features/management/management-lesson-plans.tsx", "Slides not uploaded yet"],
  ["server/modules/class-session/lesson-plans.ts", "readLessonPlansCore"],
  ["app/(portals)/management/classes/[classModuleId]/lesson-plans/page.tsx", "ManagementLessonPlans"],
];
const builtCode = SOURCES.map(([file]) => stripComments(readFileSync(join(ROOT, file), "utf8"))).join("\n");

// ⛔ KEY FOCUS -- RAISED AND DECLINED. The single most important bar in this phase.
const KEY_FOCUS = [/key[_\s-]?focus/i, /focus[_\s-]?chips/i, /KEY FOCUS POINTS/i];
const leakedFocus = KEY_FOCUS.filter((rx) => rx.test(builtCode));
check(
  leakedFocus.length === 0,
  `PLMa-KEYFOCUS ⛔ NO KEY FOCUS anywhere in the built code (${leakedFocus.length} hit) -- RAISED BY THIS PHASE AND DECLINED BY THE OPERATOR: D-4 names no author, no authoring surface exists, and a read for a field nobody can write is a permanently empty panel. ⚠️ observations.focus_chips is barred by the same list because it is a DIFFERENT field (post-session observation, not lesson-plan intent -- G-3)`,
);
check(
  KEY_FOCUS.some((rx) => rx.test('<div className="KEY FOCUS POINTS">')) &&
    KEY_FOCUS.some((rx) => rx.test("session.key_focus")) &&
    KEY_FOCUS.some((rx) => rx.test("observations.focus_chips")),
  "PLMa-KEYFOCUSc CONTROL: all three detectors MATCH a planted sample -- the frame's own label, a `key_focus` column read, and the `focus_chips` field that must not be substituted -- so PLMa-KEYFOCUS is a measurement, not three regexes that can never fire",
);

// ⛔ THE FRAME'S BARRED STRINGS.
const BARS = [
  ["Junior", /\bJunior\b/],
  ["Assist./Asst.", /\bAss(?:is|')?t\.?\s/i],
  ["Showcase", /\bShowcase\b/i],
  ["6-week persuasive speaking unit", /persuasive speaking unit/i],
];
const leakedBars = BARS.filter(([, rx]) => rx.test(builtCode)).map(([name]) => name);
check(
  leakedBars.length === 0,
  `PLMa-BARS ⛔ NONE of the four barred strings survives in the built code with comments stripped: Junior (A-016/A-026/A-054), Assist./Asst. (A-014/G-7), Showcase (GC-13), and the frame's class description (C-14/A-022). Leaked: ${leakedBars.join(", ") || "none"}`,
);
check(
  BARS.every(([, rx]) =>
    rx.test("Junior · Public Speaking Assist. Sam Ong Showcase 6-week persuasive speaking unit")),
  "PLMa-BARSc CONTROL: every one of the four detectors MATCHES the frame's own strings, so PLMa-BARS is a measurement",
);

// ⛔ NO RATING VOCABULARY (`C-9`, `G-2`).
/*
 * ⚠️ NARROWED 2026-08-15 BY OPERATOR RULING, AND THIS SCREEN IS WHY. The
 * bare-word version turned RED on screen `14`'s own honest copy -- *"an
 * interrupted upload must be started again from the beginning"* -- which is
 * exactly the false positive `A-052` prohibits.
 */
const leakedRatings = ratingLeaks(builtCode);
check(
  leakedRatings.length === 0,
  `PLMa-RATINGS ⛔ the lesson-plan surface names NO rating vocabulary in any RATING-SHAPED context (${leakedRatings.map((h) => `${h.term} [${h.context}]`).join(", ") || "none"}) -- C-9 confines the nine ratings to report DETAIL surfaces and G-2 bars every roll-up, and this DTO has no field one could arrive in`,
);
const narrowing = proveNarrowing();
check(
  narrowing.ok,
  `PLMa-RATINGSc CONTROL: the NARROWED detector fires on every real-rating sample and on NO ordinary-English sample (missed: ${narrowing.missed.join("; ") || "none"}; false positives: ${narrowing.falsePositives.join("; ") || "none"}) -- ⛔ one of its must-NOT-fire samples is THIS SCREEN'S non-resumability notice, so the regression that produced the ruling is pinned`,
);

// ⛔ THE PROJECTION WRITES NOTHING. Attach and remove are governed mutations
//    that belong in a server action, not in a read module.
const serverCode = stripComments(
  readFileSync(join(ROOT, "server", "modules", "class-session", "lesson-plans.ts"), "utf8"),
);
check(
  !/\.(insert|update|upsert|delete)\s*\(/.test(serverCode)
    && !/material_(attach_confirm|remove)/.test(serverCode),
  "PLMa-PROJECTION ⛔ the lesson-plan module performs NO insert, update, upsert or delete AND calls neither governed mutation RPC -- a projection that could also write is how a read RPC quietly becomes a write path",
);
check(
  /\.(insert|update|upsert|delete)\s*\(/.test("client.from('x').insert({})")
    && /material_(attach_confirm|remove)/.test('client.rpc("material_remove")'),
  "PLMa-PROJECTIONc CONTROL: both detectors MATCH a planted `.insert({})` and a planted `material_remove` call",
);

// ⛔ hero `0B` -- THE OMIT PATH IS REAL, not an accident of empty data.
check(
  /lessonNumber !== null/.test(builtCode) && /session\.room/.test(builtCode),
  "PLMa-OMIT ⛔ the component GUARDS on `lessonNumber !== null` and carries `room` as an omittable part -- hero `0B`: NULL means NOT RECORDED, so the ELEMENT is omitted rather than rendered empty or invented as `Lesson 1`",
);

check(
  SOURCES.every(([file, needle]) => {
    const source = readFileSync(join(ROOT, file), "utf8");
    return source.length > 200 && (needle === null || source.includes(needle));
  }),
  `PLMa-READ CONTROL: all ${SOURCES.length} scanned sources were READ and are the right files -- without this, every negative leg above is equally true of an unreadable path`,
);

// ---------------------------------------------------------------------
// ⛔ THE STANDING RULE, MECHANIZED -- shared across every portal migration.
// ---------------------------------------------------------------------
const { declared, uncalled } = uncalledFunctions(ROOT);
check(
  uncalled.length === 0,
  `PLMa-CALL ⛔ all ${declared} function(s) declared by the portal migrations are CALLED by their paired suite (${uncalled.length} uncalled${uncalled.length ? `: ${uncalled.join(", ")}` : ""}) -- this phase declares SIX: the four material RPCs, the storage predicate, and audit_action_registry re-declared with CREATE OR REPLACE. A declared-but-uncalled function is schema nobody proved`,
);
const unpaired = unpairedMigrations(ROOT);
check(
  unpaired.length === 0,
  `PLMa-PAIR ⛔ every portal-era migration still has a paired suite (${unpaired.length} unpaired${unpaired.length ? `: ${unpaired.join(", ")}` : ""})`,
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
process.exit(bad === 0 ? 0 : 1);
