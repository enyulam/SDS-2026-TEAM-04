#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-8 -- runner for prove-p2-8-students.sql, plus the
// code-side bars no SQL leg can reach.
// =====================================================================
// ⚠️ THE CENSUS IS ASSERTED AS FLOORS, never as global equalities --
//    pinning whole-database totals is what broke six suites at `P2-6`.
//
// ⛔ Exit code is the only verdict.
//
// Run: npm run prove:portal-p2-8
// =====================================================================

import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { assertConfigProjectId, resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";
import {
  unpairedMigrations,
  uncalledFunctions,
  rpcShapeMismatches,
  rpcsWithoutApplicationCaller,
} from "./rpc-call-rule.mjs";
import { emittedLegs } from "./suite-output-rule.mjs";
import { stripComments } from "./artefact-read-rule.mjs";
import { ratingLeaks, proveNarrowing } from "./rating-leak-rule.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { projectId: PROJECT_ID, dbContainer: DB_CONTAINER } = resolveLocalTarget();
assertConfigProjectId(
  (readFileSync(join(ROOT, "supabase", "config.toml"), "utf8").match(/^\s*project_id\s*=\s*"([^"]+)"/m) ?? [])[1] ?? "",
  PROJECT_ID,
);

const SUITE = join(ROOT, "scripts", "tests", "portal", "prove-p2-8-students.sql");

const COUNTS = `SELECT (SELECT count(*) FROM public.students)
  || '|' || (SELECT count(*) FROM public.enrolments)
  || '|' || (SELECT count(*) FROM public.parent_student_links)
  || '|' || (SELECT count(*) FROM public.audit_events);`;

const CENSUS = `SELECT (SELECT count(*) FROM supabase_migrations.schema_migrations)
  || '|' || (SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE')
  || '|' || (SELECT count(DISTINCT typname) FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND typtype='e')
  || '|' || (SELECT count(*) FROM pg_policies WHERE schemaname='public')
  || '|' || (SELECT array_length(public.audit_action_registry(),1))
  || '|' || (SELECT count(*) FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public');`;

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

const passes = (out.match(/PASS PDT-\d+/g) ?? []).length;
const fails = (out.match(/FAIL PDT-\d+/g) ?? []).length;

console.log("");

check(
  emittedLegs(out, "PDT"),
  `the SQL suite ACTUALLY RAN and emitted its own PDT- legs (${out.trim().length} chars) -- without this every check below is trivially true of an unreachable database`,
);
check(
  !emittedLegs("", "PDT")
    && !emittedLegs("Error: No such container: supabase_db_absent", "PDT")
    && !emittedLegs("NOTICE: PASS PDS-1 something from prove-p2-7", "PDT")
    && emittedLegs("NOTICE:  PASS PDT-1  non-vacuity", "PDT"),
  "PDTa-EMPTY CONTROL: the shared guard REJECTS an empty result, REJECTS a docker error carrying no legs, REJECTS another suite's legs, and ACCEPTS a real one",
);
check(!/^ERROR/m.test(out), "the SQL suite ran to completion without an error");
check(fails === 0, `no failing SQL leg (${fails} FAIL)`);
check(passes === 7, `all SEVEN SQL legs EXECUTED (${passes}/7) -- an unrun leg is NOT-RUN, never PASS`);
check(
  before === after && before !== "",
  `PDTa-ROLLBACK the database is UNMOVED and was actually read (${before} -> ${after}) -- this phase writes nothing at all`,
);

// ---------------------------------------------------------------------
// ⛔ THIS PHASE'S CENTRAL CLAIM: IT SHIPS NO MIGRATION.
// ---------------------------------------------------------------------
const migrations = readdirSync(join(ROOT, "supabase", "migrations")).filter((f) => f.endsWith(".sql"));
const mine = migrations.filter((f) => /p2_8/i.test(f));
check(
  mine.length === 0,
  `PDTa-NOMIG THIS PHASE SHIPS NO MIGRATION (${mine.length} found${mine.length ? `: ${mine.join(", ")}` : ""}) -- screen 17 needed no schema, and PDT-2 is what that rests on. ⚠️ SCOPED TO THIS PHASE'S OWN FILES, never to a global migration total: pinning the total is the §12.8 defect that broke six suites at P2-6`,
);

const census = psql(["-c", CENSUS]).stdout.trim();
const [migrationRows, tables, enums, policies, registry, functions] = census.split("|");
check(
  Number(tables) >= 30 && enums === "12" && Number(policies) >= 30 && Number(registry) >= 23
    && Number(functions) >= 62,
  `PDTa-CENSUS NOTHING WAS ADDED OR REMOVED: tables >= 30 (${tables}) | enums == 12 (${enums}) | policies >= 30 (${policies}) | registry >= 23 (${registry}) | public functions >= 62 (${functions}). FLOORS, not equalities. Reported: ${migrationRows} migrations`,
);

// ---------------------------------------------------------------------
// THE CODE-SIDE BARS.
// ---------------------------------------------------------------------
const SOURCES = [
  ["features/management/management-students-screen.tsx", "All Students"],
  ["server/modules/class-session/student-list-projections.ts", "listManagementStudentsCore"],
  ["app/(portals)/management/students/page.tsx", "ManagementStudentsScreen"],
];
check(
  SOURCES.every(([file, needle]) => {
    const path = join(ROOT, file);
    return existsSync(path) && readFileSync(path, "utf8").includes(needle);
  }),
  `PDTa-READ CONTROL: all ${SOURCES.length} scanned sources EXIST and are the right files -- without this every absence below is equally true of a path that was never read`,
);
const builtCode = SOURCES.map(([file]) => stripComments(readFileSync(join(ROOT, file), "utf8"))).join("\n");

/*
 * ⛔ THE PHASE'S CENTRAL BAR. The frame's `Overall` column is a rating chip on
 * every row; `C-9`'s own register row names `P2-8`, and `G-2` bars every
 * roll-up permanently. `PDT-7` proves no rating column is even reachable; this
 * proves the SURFACE names none of the vocabulary either.
 */
const leaked = ratingLeaks(builtCode);
check(
  leaked.length === 0,
  `PDTa-RATINGS screen 17 names NO rating vocabulary in any RATING-SHAPED context (${leaked.map((h) => `${h.term} [${h.context}]`).join(", ") || "none"}) -- the frame's Overall column and the pack note's "current B.E.S.T. Rating" are REFUSED under C-9 (whose register row names P2-8) and G-2`,
);
const narrowing = proveNarrowing();
check(
  narrowing.ok,
  `PDTa-RATINGSc CONTROL: the NARROWED detector fires on every real-rating sample -- ⚠️ including \`<span class="chip">Mastering</span>\`, the frame's OWN chip shape, which is a must-fire entry -- and on NO ordinary-English sample (missed: ${narrowing.missed.join("; ") || "none"}; false positives: ${narrowing.falsePositives.join("; ") || "none"})`,
);

/*
 * ⛔ AND THE COLUMN IS ABSENT, NOT EMPTY. An `Overall` heading with blank cells
 * reads "not wired yet" and invites a later phase to fill it; an absent column
 * reads "not permitted". The `P2-3` day-strip ruling drew exactly this line.
 */
check(
  !/>\s*Overall\s*</.test(builtCode) && !/"Overall"/.test(builtCode),
  "PDTa-NOCOL the `Overall` column HEADING is absent from the markup, not present-and-empty -- a blank column advertises a control that is prohibited, which is the distinction the P2-3 day-strip ruling drew",
);

/* ⛔ NO STUDENT CODE. `PDT-3` proves no column exists; this proves the surface invents none. */
check(
  !/ID 20\d\d-|studentCode|student_code|\bID \$\{/.test(builtCode),
  "PDTa-NOCODE screen 17 renders NO student code -- the frame draws `ID 2025-113` and `students` has no column for it (PDT-3), so inventing one would be schema inferred from a frame (A-022)",
);
check(
  /ID 20\d\d-/.test("ID 2025-113"),
  "PDTa-NOCODEc CONTROL: the code detector MATCHES the frame's own literal",
);

/* ⛔ NO UNRATIFIED CLASS GRADE. `Junior` is not one (A-016, A-026/A-054). */
check(
  !/\bJunior\b/.test(builtCode) && !/"Beginner"|'Beginner'/.test(builtCode),
  "PDTa-GRADE no `Junior` reaches the surface AND no grade label is hard-coded -- every label is READ from class_grades, so a fourth grade cannot appear by editing a component",
);
check(/\bJunior\b/.test("Junior · Public Speaking"), "PDTa-GRADEc CONTROL: the `Junior` detector fires");

/*
 * ⏸ THE TWO ACTIONS ARE OMITTED, NOT WIRED TO NOWHERE. Screens `20`/`21` are
 * `P2-12`/`P2-13` and neither route exists. A control pointing at a 404 is the
 * defect the Operator named at `P2-3`.
 */
const registerRoute = existsSync(join(ROOT, "app/(portals)/management/students/register/page.tsx"));
/*
 * ⚠️ THE PATH WAS WRONG, AND IT PASSED — CORRECTED AT `P2-13`, 2026-08-16.
 * This probe looked for `app/(portals)/management/parents/page.tsx`. Screen
 * `21`’s ratified canonical route is
 * `/management/students/create-parent-account` (inventory §7.2), so when
 * `P2-13` shipped it, this leg went on reporting `route=false` and stayed
 * GREEN while the omission’s end condition had already arrived.
 *
 * ▶ **A CHECK WHOSE SUBJECT MOVED IS WORSE THAN ONE THAT FAILS**: the failing
 * form announces itself, and this form is indistinguishable from a check that
 * is working. Same asymmetry as plan §47.
 *
 * ⛔ THE PATH IS NOW DERIVED FROM THE RATIFIED INVENTORY, not restated here,
 * so a route that moves again cannot leave this probe pointing at nothing.
 */
const inventoryText = readFileSync(join(ROOT, "docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md"), "utf8");
const parentRouteFromInventory =
  (inventoryText.match(/^\|\s*21\s*\|[^|]*\|[^|]*\|[^|]*\|\s*`([^`]+)`/m) ?? [])[1] ?? "";
/*
 * ⛔ THE DERIVATION MUST NOT BE ABLE TO YIELD NOTHING. An empty match would
 * make `parentRoute` permanently `false` and this leg permanently green — the
 * exact failure being corrected. `PDTa-ACTIONSd` asserts it resolved.
 */
const parentRoute =
  parentRouteFromInventory.length > 0 &&
  existsSync(join(ROOT, `app/(portals)${parentRouteFromInventory}/page.tsx`));
const registerShown = /Register Student/.test(builtCode);
const parentShown = /Add Parent/.test(builtCode);
/*
 * ⚠️ CORRECTED AT `P2-12`, 2026-08-16 (§12.11, and §44's shape in a PROOF).
 * This leg's own message said *"if a later phase ships those routes this leg
 * still passes; it is the CONTROL WITHOUT A DESTINATION that is barred"* —
 * and its assertion was `!registerRoute && !parentRoute && !rendered`, which
 * **fails the moment a route ships**. ▶ The message and the code disagreed,
 * and the message was the correct one. **A correct comment sitting on
 * incorrect code is worse than no comment**, and here it sat on a proof.
 *
 * ⛔ THE BARRED THING IS ONE-DIRECTIONAL AND PER CONTROL: `rendered → the
 * destination exists`. Omitting a control whose route exists is a lapsed
 * omission, not a breach — but it IS a §12.11 correction, which is exactly
 * how `Register Student` came to be built in this pass.
 */
check(
  (!registerShown || registerRoute) && (!parentShown || parentRoute),
  `PDTa-ACTIONS ⛔ NEITHER CONTROL POINTS AT A ROUTE THAT DOES NOT EXIST — Register Student: shown=${registerShown} route=${registerRoute} · Add Parent: shown=${parentShown} route=${parentRoute}. ▶ A control pointing at a 404 is the defect the Operator named at \`P2-3\`; a control ABSENT while its route exists is a lapsed omission for §12.11, not a breach of this leg`,
);
check(
  registerRoute === registerShown,
  `PDTa-ACTIONSb ✅ …and \`Register Student\`'s omission ENDED exactly when \`P2-12\` shipped its route (route=${registerRoute}, shown=${registerShown}) — ⚠️ **THE PROOF NOTICED, NOT A READER**: this leg went red on the run that shipped \`/management/students/register\`, which is a lift condition written to FIRE rather than to be remembered`,
);
check(
  parentRoute === parentShown,
  `PDTa-ACTIONSc ✅ \`Add Parent\`'s omission ENDED when \`P2-13\` shipped screen \`21\` (route=${parentRoute}, shown=${parentShown}) — ⚠️ **AND THIS LEG WAS SILENTLY GREEN UNTIL \`P2-13\` LOOKED**: it probed \`app/(portals)/management/parents/page.tsx\`, while the ratified route is \`${parentRouteFromInventory}\`. ▶ **A CHECK WHOSE SUBJECT MOVED IS WORSE THAN ONE THAT FAILS** — the failing form announces itself; this form is indistinguishable from a check that works (plan §47's asymmetry)`,
);
check(
  parentRouteFromInventory.length > 0,
  `PDTa-ACTIONSd ⚠️ NON-VACUITY: the route was DERIVED from the ratified inventory rather than restated here, and it resolved to \`${parentRouteFromInventory || "NOTHING"}\` — ▶ an empty derivation would make \`parentRoute\` permanently false and this pair permanently green, which is the exact failure being corrected`,
);

/* ⛔ NO DIRECT CLIENT DML, and no write of any kind: screen 17 is a read. */
check(
  !/\.(insert|update|upsert|delete)\s*\(/.test(builtCode),
  "PDTa-READONLY screen 17 writes NOTHING -- it is a list surface, and registration/edit are separate phases with their own authorization",
);

/* The shared controls, not a second copy of each. */
check(
  /from "@\/components\/ui\/avatar"/.test(readFileSync(join(ROOT, SOURCES[0][0]), "utf8")) &&
    /SearchInput|Select/.test(builtCode) &&
    !/AVATAR_TONES/.test(builtCode),
  "PDTa-SHARED the screen uses the SHARED Avatar / SearchInput / Select rather than local copies -- the first draft reinvented all three, and its avatar picked a tint BY ROW INDEX, so a learner changed colour when the filter reordered the table. The shared Avatar tints deterministically from the name",
);

// ---------------------------------------------------------------------
// THE STANDING RULES, MECHANIZED.
// ---------------------------------------------------------------------
const { declared, uncalled } = uncalledFunctions(ROOT);
check(
  uncalled.length === 0,
  `PDTa-CALL all ${declared} function(s) declared by the portal migrations are CALLED by their paired suite (${uncalled.length} uncalled${uncalled.length ? `: ${uncalled.join(", ")}` : ""})`,
);
const unpaired = unpairedMigrations(ROOT);
check(
  unpaired.length === 0,
  `PDTa-PAIR every portal-era migration still has a paired suite (${unpaired.length} unpaired${unpaired.length ? `: ${unpaired.join(", ")}` : ""})`,
);

const SETOF = psql(["-c",
  "SELECT p.proname || '=' || p.proretset FROM pg_catalog.pg_proc p "
  + "JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public';"]).stdout.trim();
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
  `PDTa-SHAPE all ${inspected} RPC consumer(s) match their function's RESULT SHAPE (${mismatches.join("; ") || "no mismatch"}) -- the rule P2-7's own defect produced`,
);

/*
 * ⛔ PDTa-WIRED -- THE GATE THE `P2-6` DISCLOSURE FAILURE FORCED.
 *
 * Operator ruling, 2026-08-14: *"every RPC declared in a migration must be
 * called from APPLICATION code -- a port method, adapter action or server
 * action -- not only from its SQL suite. A function reachable only from a test
 * is an unwired write path."*
 *
 * ⛔ THE EXEMPTION IS PROVEN FROM THE LIVE CATALOGUE, NEVER DECLARED. A
 * function with no application caller passes ONLY if it is shown to be
 * INTERNAL -- the predicate of an RLS policy, or read by another function's
 * body. An allow-list would let the next unwired path be waved through by
 * adding a name to it.
 *
 * ⚠️ MATCHED WITH `strpos`, NOT `LIKE`. The first draft used
 * `LIKE '%' || name || '%'`, and in SQL LIKE the UNDERSCORE IS A
 * SINGLE-CHARACTER WILDCARD -- so `material_remove` matched the audit string
 * `material.removed` and would have been EXEMPTED BY ITS OWN DETECTOR. A
 * matcher that silently wildcards fails toward "fine".
 */
const INTERNAL = psql(["-c",
  "SELECT p.proname || '=' || ("
  + "  (SELECT count(*) FROM pg_policies pol WHERE strpos(coalesce(pol.qual,'') || coalesce(pol.with_check,''), p.proname) > 0)"
  + "+ (SELECT count(*) FROM pg_proc p2 JOIN pg_namespace n2 ON n2.oid = p2.pronamespace"
  + "    WHERE n2.nspname = 'public' AND p2.proname <> p.proname AND strpos(coalesce(p2.prosrc,''), p.proname) > 0)"
  + ") FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public';"]).stdout.trim();
const internalRefs = new Map(
  INTERNAL.split(/\r?\n/).filter(Boolean).map((line) => {
    const [name, count] = line.split("=");
    return [name, Number(count) > 0];
  }),
);
const isInternal = (fn) => internalRefs.get(fn) === true;
const wiring = rpcsWithoutApplicationCaller(ROOT, isInternal);
check(
  internalRefs.size > 0 && wiring.unwired.length === 0,
  `PDTa-WIRED every one of the ${wiring.declaredCount} portal-era RPC(s) is reachable from APPLICATION code, or is PROVABLY INTERNAL (${wiring.internal.join(", ") || "none"} — policy predicates and functions read by other function bodies). UNWIRED: ${wiring.unwired.join(", ") || "none"}. ⛔ A function reachable only from its SQL suite is an unwired write path, which is exactly what P2-6 shipped`,
);

/*
 * ⛔ THE CONTROL: A PLANTED DECLARED-BUT-UNCALLED FUNCTION MUST FAIL THE RULE.
 * Without it, `unwired.length === 0` is equally true of a rule that can never
 * fire -- and this rule exists precisely because two earlier rules passed over
 * the defect.
 */
const planted = rpcsWithoutApplicationCaller(
  ROOT,
  () => false, // nothing is internal, so an uncalled function has nowhere to hide
  [{ migration: "20260814090000_portal_p2_6_lesson_materials.sql", suite: "prove-p2-6-lesson-materials.sql" }],
);
check(
  planted.unwired.length > 0,
  `PDTa-WIREDc CONTROL: told nothing is internal, the rule FIRES on the P2-6 migration and names ${planted.unwired.length} uncalled function(s) — so PDTa-WIRED is a measurement, not a predicate that always passes`,
);
check(
  rpcsWithoutApplicationCaller(ROOT, () => true, [
    { migration: "20260814090000_portal_p2_6_lesson_materials.sql", suite: "prove-p2-6-lesson-materials.sql" },
  ]).unwired.length === 0,
  "PDTa-WIREDc2 CONTROL: and told everything is internal it reports NONE — so the exemption is what decides the verdict, not the scan failing to read the sources",
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
process.exit(bad === 0 ? 0 : 1);
