#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-10 -- screen `23` Management Trainers. NO SCHEMA.
// =====================================================================
// ⛔ THE "NO SCHEMA" CLAIM IS MEASURED, NOT INHERITED. `P2-8` reached the same
//    conclusion for a different set of tables; repeating it by analogy would be
//    exactly the §12.10 mistake in reverse -- assuming a fact instead of
//    checking it. Every table is re-measured here at THREE layers (grant, RLS,
//    permissive SELECT policy) and the RLS scoping is exercised in BOTH
//    directions.
//
// ⛔ Exit code is the only verdict.
//
// Run: npm run prove:portal-p2-10
// =====================================================================

import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { assertConfigProjectId, resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";
import { unpairedMigrations, rpcsWithoutApplicationCaller, isProvablyInternal } from "./rpc-call-rule.mjs";
import { stripComments } from "./artefact-read-rule.mjs";
import { extractQueries, unknownColumns } from "./projection-column-rule.mjs";
import { ratingLeaks, proveNarrowing } from "./rating-leak-rule.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { projectId: PROJECT_ID, dbContainer: DB_CONTAINER } = resolveLocalTarget();
assertConfigProjectId(
  (readFileSync(join(ROOT, "supabase", "config.toml"), "utf8").match(/^\s*project_id\s*=\s*"([^"]+)"/m) ?? [])[1] ?? "",
  PROJECT_ID,
);

let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad++;
  console.log(`${ok ? "PASS" : "FAIL"}    ${msg}`);
};
const psql = (sql) =>
  (spawnSync("docker", ["exec", "-i", DB_CONTAINER, "psql", "--no-psqlrc", "-U", "postgres", "-d", "postgres", "-tAX", "-c", sql], {
    encoding: "utf8",
  }).stdout ?? "").trim();

const MGMT = "d0000000-0000-4000-8000-000000000001";
const PARENT = "d0000000-0000-4000-8000-000000000003";
const claims = (sub) => `{"sub":"${sub}","role":"authenticated"}`;

// ---------------------------------------------------------------------
// PT-0 -- NON-VACUITY.
// ---------------------------------------------------------------------
const trainerMemberships = Number(
  psql("SELECT count(*) FROM public.centre_memberships WHERE role='trainer' AND status='active';"),
);
check(
  trainerMemberships > 0,
  `PT-0   NON-VACUITY: the fixture holds ${trainerMemberships} ACTIVE trainer membership(s) — zero would make every leg below vacuously true`,
);

// ---------------------------------------------------------------------
// PT-1 -- NO MIGRATION. Asserted, not assumed.
// ---------------------------------------------------------------------
const migrations = readdirSync(join(ROOT, "supabase", "migrations")).filter((f) => f.endsWith(".sql"));
check(
  migrations.length > 10 && migrations.filter((f) => /p2_10|trainer_list|trainers/i.test(f)).length === 0,
  `PT-1   ⛔ THIS PHASE SHIPS NO MIGRATION — ${migrations.length} files in the tree and NONE names p2_10, trainer_list or trainers. ⚠️ The floor guards the leg: an unreadable directory would otherwise satisfy the "none named" half trivially`,
);

// ---------------------------------------------------------------------
// PT-2 -- ALL SEVEN TABLES ARE READABLE AT THREE LAYERS. This is the
//         claim "no schema needed" actually rests on.
// ---------------------------------------------------------------------
const TABLES = [
  "centre_memberships",
  "accounts",
  "trainer_profiles",
  "class_session_assignments",
  "class_sessions",
  "class_modules",
  "enrolments",
];
const layers = psql(`
SELECT t.tbl || '=' ||
  (SELECT count(*) FROM information_schema.role_table_grants g
    WHERE g.table_schema='public' AND g.table_name=t.tbl AND g.grantee='authenticated' AND g.privilege_type='SELECT')
  || ',' || (SELECT c.relrowsecurity::int FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
             WHERE n.nspname='public' AND c.relname=t.tbl)
  || ',' || (SELECT count(*) FROM pg_policies p WHERE p.schemaname='public' AND p.tablename=t.tbl
             AND p.cmd IN ('SELECT','ALL') AND p.permissive='PERMISSIVE')
FROM (VALUES ${TABLES.map((t) => `('${t}')`).join(",")}) AS t(tbl);`);
const bad3 = layers
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((line) => {
    const [, v] = line.split("=");
    const [grant, rls, pol] = (v ?? "").split(",").map(Number);
    return !(grant >= 1 && rls === 1 && pol >= 1);
  });
check(
  bad3.length === 0 && layers.split(/\r?\n/).filter(Boolean).length === TABLES.length,
  `PT-2   ⛔ ALL ${TABLES.length} TABLES CARRY GRANT + RLS + A PERMISSIVE SELECT POLICY (offenders: ${bad3.join("; ") || "none"}). ⚠️ CAPABILITY, not policy NAME — P2-8's first draft matched \`LIKE '%management%'\` and failed 7 of 8 against a CORRECT schema, because a policy admitting any active member need not say "management" in its name`,
);

// ---------------------------------------------------------------------
// PT-3 -- BOTH DIRECTIONS. RLS scoping is exercised, not asserted.
// ---------------------------------------------------------------------
/*
 * ⚠️ THE PARENT IS THE NEGATIVE, AND THE FIRST DRAFT'S CHOICE OF TRAINER WAS
 * WORTHLESS. That draft compared management's count against a TRAINER's and
 * asserted `trainer <= management`. ▶ Both read **1**, so the leg passed while
 * discriminating NOTHING — the fixture holds exactly one trainer, and `1 <= 1`
 * is true of a table with no policy at all. **A control that cannot come out
 * differently is not a control**, which is §12.15's family seen from the RLS
 * side. The PARENT reads ZERO trainer memberships and only their OWN account,
 * so the comparison can actually fail.
 */
const reads = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(MGMT)}', true);
SELECT 'MGMT_T=' || count(*) FROM public.centre_memberships WHERE role='trainer';
SELECT 'MGMT_A=' || count(*) FROM public.accounts;
SELECT set_config('request.jwt.claims', '${claims(PARENT)}', true);
SELECT 'PARENT_T=' || count(*) FROM public.centre_memberships WHERE role='trainer';
SELECT 'PARENT_A=' || count(*) FROM public.accounts;
ROLLBACK;`);
const g = (k) => Number((reads.match(new RegExp(`^${k}=(\\d+)$`, "m")) ?? [])[1] ?? NaN);
check(
  g("MGMT_T") > 0 && g("MGMT_A") > 1,
  `PT-3   MANAGEMENT reads ${g("MGMT_T")} trainer membership(s) and ${g("MGMT_A")} account(s) — the read the screen depends on actually resolves`,
);
check(
  g("PARENT_T") === 0 && g("PARENT_A") < g("MGMT_A"),
  `PT-3b  ⛔ DISCRIMINATING CONTROL: a PARENT reads ${g("PARENT_T")} trainer membership(s) and only ${g("PARENT_A")} account against management's ${g("MGMT_A")}. ▶ Without a negative that can differ, PT-3 would be equally true of a table with no policy at all`,
);
/*
 * ⚠️ A LIMIT, STATED RATHER THAN LEFT FOR A READER TO INFER FROM A GREEN RUN:
 * the fixture holds ONE trainer, so this suite never exercises ordering, the
 * search filter across several names, or a `deactivated` row. Those branches
 * are reachable only against richer data and are NOT claimed here.
 */
check(
  trainerMemberships >= 1,
  `PT-3c  ⚠️ STATED LIMIT: the fixture holds ${trainerMemberships} active trainer, so ORDERING, multi-name SEARCH and the \`deactivated\` chip are NOT exercised by this suite. ▶ Recorded as unproven rather than implied by a green run`,
);

// ---------------------------------------------------------------------
// PT-3d -- ⛔ THE LEG PT-3/PT-3b NEVER WERE.
// ---------------------------------------------------------------------
/*
 * ⛔ OPERATOR RULING, 2026-08-16, RECORDED VERBATIM BECAUSE IT NAMES THE DEFECT
 * PRECISELY: *"a control repaired for 'can this come out differently' is not
 * repaired for 'does this exercise the code the screen runs.'"*
 *
 * `PT-3b`'s first draft compared management against a TRAINER and both read 1,
 * so it discriminated nothing. It was repaired to compare against a PARENT,
 * which DOES discriminate — and the repair fixed the wrong axis. ▶ Both legs
 * run RAW SQL: they prove the TABLES are readable and never call
 * `listManagementTrainersCore`, so screen `23` shipped a query naming
 * `class_session_assignments.membership_id` — a column that does not exist —
 * and every leg here stayed green while the page showed no trainers at all.
 *
 * ⚠️ THE QUERIES BELOW ARE EXTRACTED FROM THE PROJECTION SOURCE, NEVER RETYPED.
 * A hand-copied query is a second definition free to drift from the first,
 * which is the defect this project keeps recording; deriving them means this
 * leg cannot pass while the real code is wrong.
 */
const PROJECTION = "server/modules/class-session/trainer-list-projections.ts";
const projQueries = extractQueries(readFileSync(join(ROOT, PROJECTION), "utf8"));
check(
  projQueries.length >= 4,
  `PT-3d0 ⚠️ NON-VACUITY FIRST: ${projQueries.length} quer(ies) extracted from ${PROJECTION} — ▶ if the parser returned nothing, PT-3d below would validate an EMPTY SET and report a green meaning "the projection has no queries"`,
);

const catalogueRaw = psql(
  "SELECT table_name || '|' || column_name FROM information_schema.columns WHERE table_schema='public';",
);
const catalogue = new Map();
for (const line of catalogueRaw.split("\n")) {
  const [t, c] = line.trim().split("|");
  if (!t || !c) continue;
  if (!catalogue.has(t)) catalogue.set(t, new Set());
  catalogue.get(t).add(c);
}
const unknown = unknownColumns(projQueries, catalogue);
check(
  catalogue.size >= 20 && unknown.length === 0,
  `PT-3d  ⛔ EVERY COLUMN THE PROJECTION NAMES EXISTS: ${unknown.length} unknown reference(s)${unknown.length ? " — " + unknown.map((u) => `${u.table}.${u.column} [${u.where}]`).join(", ") : ""} — ▶ this is the leg that would have caught the empty Trainers list, and neither PT-3 nor PT-3b could, because both read the TABLES rather than the CODE`,
);

/*
 * ⛔ AND THE READ MUST ACTUALLY RESOLVE AS THE MANAGEMENT CALLER. Column
 * existence is necessary and not sufficient: a correct name behind a missing
 * grant or policy still returns nothing.
 */
const assignmentQuery = projQueries.find((q) => q.table === "class_session_assignments");
const resolved = assignmentQuery
  ? psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(MGMT)}', true);
SELECT 'ASSIGNED=' || count(*) FROM public.class_session_assignments a
  WHERE a.${assignmentQuery.filters[0] ?? "trainer_membership_id"} IN (
    SELECT id FROM public.centre_memberships WHERE role='trainer' AND status='active');
ROLLBACK;`)
  : "";
const assignedRows = Number((resolved.match(/^ASSIGNED=(\d+)$/m) ?? [])[1] ?? NaN);
check(
  assignmentQuery !== undefined && assignedRows > 0,
  `PT-3e  ⛔ …AND IT RESOLVES FOR A REAL MANAGEMENT CALLER: the projection's own filter column (\`${assignmentQuery?.filters[0] ?? "NONE EXTRACTED"}\`) returns ${assignedRows} assignment row(s) — ▶ a name that exists but reaches nothing renders the same empty page`,
);

// ---------------------------------------------------------------------
// PT-4 -- THE CODE-SIDE BARS.
// ---------------------------------------------------------------------
const SOURCES = [
  "features/management/management-trainers-screen.tsx",
  "server/modules/class-session/trainer-list-projections.ts",
  "app/(portals)/management/trainers/page.tsx",
];
check(
  SOURCES.every((f) => existsSync(join(ROOT, ...f.split("/")))),
  `PT-4   all three source layers exist (${SOURCES.length}) — a missing file would make every scan below vacuous`,
);
const built = SOURCES.map((f) => stripComments(readFileSync(join(ROOT, ...f.split("/")), "utf8"))).join("\n");

const leaked = ratingLeaks(built);
check(
  leaked.length === 0,
  `PT-4a  ⛔ NO RATING VOCABULARY in any rating-shaped context (${leaked.map((h) => `${h.term} [${h.context}]`).join(", ") || "none"}) — C-9 confines the nine to report DETAIL surfaces and this projection reads no rating table at all`,
);
const narrowing = proveNarrowing();
check(
  narrowing.ok,
  `PT-4b  CONTROL: the narrowed detector fires on every real-rating sample and no ordinary-English sample (missed: ${narrowing.missed.join("; ") || "none"}; false positives: ${narrowing.falsePositives.join("; ") || "none"})`,
);

/*
 * ⛔ THE THREE REFUSALS, EACH ASSERTED WHERE IT ACTUALLY LIVES.
 * ⚠️ `On leave` and the email are asserted against the DTO and the projection —
 * NOT only the component — because a component that merely omits a field can be
 * changed by one line, while a type with no field to put it in cannot.
 */
const contracts = stripComments(readFileSync(join(ROOT, "lib", "frontend", "contracts", "physical-test.ts"), "utf8"));
const trainerDto = contracts.slice(
  contracts.indexOf("export type ManagementTrainerRowDto"),
  contracts.indexOf("export type ManagementTrainerListDto"),
);
/*
 * ⚠️ PT-5 AND PT-5b ARE INVERTED, IN THE SAME PASS AS THE RULING THAT INVERTED THEM
 * (§12.11). They previously asserted the email's ABSENCE at both layers, which was
 * correct while the question was open and is FALSE the moment it was answered — a
 * leg left behind would have gone red on a correct build and read like a leak.
 *
 * ⛔ WHAT THEY ASSERT NOW IS NOT "the email is present" — that is one line and proves
 * nothing. They assert THE WIDENING IS EXACTLY ONE COLUMN WIDE at every layer, which
 * is the part a later phase could quietly lose.
 */
check(
  /readonly email: string \| null/.test(trainerDto),
  "PT-5   ✅ THE DTO CARRIES `email: string | null` — Operator-ruled 2026-08-15: an identifier a manager already typed is not a disclosure to that manager. ⛔ `| null` is load-bearing: NULL means NOT RECORDED and the line is OMITTED (hero 0B)",
);
check(
  /normalized_email/.test(built) && !/auth_user_id/.test(built) && !/select\(\s*"\*/.test(built),
  "PT-5b  and the PROJECTION reads `normalized_email` — ⛔ AND NOTHING ELSE FROM `accounts`: no `auth_user_id`, no `select(\"*\")`. The ruling widened ONE column, and the audience boundary is where the widening stops",
);
const screen = stripComments(readFileSync(join(ROOT, "features", "management", "management-trainers-screen.tsx"), "utf8"));
check(
  /row\.email === null \? null :/.test(screen) && /row\.email\.toLowerCase\(\)\.includes\(needle\)/.test(screen),
  "PT-5c  ⛔ AND THE SCREEN OMITS THE LINE ON NULL rather than rendering an empty one (hero 0B), ⚠️ and the SEARCH was widened in the same pass — the field the row displays is the field the search matches, so a result is always explainable by something on screen (§12.11)",
);
check(
  !/on\s*leave/i.test(built) && !/On leave/.test(trainerDto),
  "PT-6   ⛔ NO `On leave` ANYWHERE — GC-12. `centre_membership_status` has exactly three members and none is a leave state; inventing one would be an enum from a frame (A-022) that also changes what assignment means",
);
const statusValues = psql(
  "SELECT string_agg(enumlabel, ',' ORDER BY enumsortorder) FROM pg_enum e JOIN pg_type t ON t.oid=e.enumtypid WHERE t.typname='centre_membership_status';",
);
check(
  statusValues === "pending,active,deactivated",
  `PT-6b  and the LIVE ENUM confirms it: ${statusValues} — three members, measured in the catalogue rather than read off the migration`,
);

check(
  !/>\s*Edit\s*</.test(screen),
  "PT-7   ⛔ NO `Edit` CONTROL — there is no Edit-Trainer screen in the ratified 36, so it has no destination at all. ▶ A control that leads nowhere is the P2-6 defect (§12.12); ABSENT is correct, and `disabled` would be wrong because it can never become live",
);
/*
 * ⚠️ PT-7b IS INVERTED BY `P2-11`, IN THE SAME PASS THAT INVERTED IT (§12.11).
 * It asserted `Add Trainer` was DISABLED with a stated reason, which was correct
 * while screen `24` did not exist and is false now that it does. ▶ A leg left
 * behind would have gone red on a correct build; a DISCLOSURE left behind would
 * have been worse — a working button still promising it "arrives with screen 24".
 */
check(
  /href="\/management\/trainers\/add"/.test(screen)
    && !/disabled/.test(screen)
    && !/arrives with screen 24/.test(screen),
  "PT-7b  ✅ `Add Trainer` IS NOW A LIVE LINK to /management/trainers/add — ⛔ and the `arrives with screen 24` disclosure is GONE, retired by the phase that made it false. The distinction from `Edit` still holds: disabled meant \"not yet\", absent means \"not a thing\"",
);

// ---------------------------------------------------------------------
// PT-8 -- THE PILL IS DERIVED, and pending is excluded.
// ---------------------------------------------------------------------
const projection = stripComments(
  readFileSync(join(ROOT, "server", "modules", "class-session", "trainer-list-projections.ts"), "utf8"),
);
check(
  /staffCount: trainers\.length/.test(projection),
  "PT-8   the `n staff` pill is COUNTED FROM THE ROWS it sits above — a pill and its table must never be able to disagree (the P2-7/P2-8 rule)",
);
check(
  /status === "active" \|\| m\.status === "deactivated"/.test(projection) || /!== "pending"/.test(projection),
  "PT-8b  ⛔ `pending` IS EXCLUDED — A-027: a profile that has not completed activation is not an active login identity. Listing one would assert a person works here because an email was sent",
);
check(
  /is_active/.test(projection),
  "PT-8c  and the student count counts ACTIVE enrolments only — the Ruling A boundary applied on its own merits: a withdrawn learner is not one of this trainer's students",
);

// ---------------------------------------------------------------------
// PT-9 -- THE STANDING RULES STILL HOLD.
// ---------------------------------------------------------------------
check(
  unpairedMigrations(ROOT).length === 0,
  `PT-9   every portal-era migration still has a paired suite (${unpairedMigrations(ROOT).join(", ") || "none unpaired"})`,
);
const wiring = rpcsWithoutApplicationCaller(ROOT, () => false);
const stillUnwired = wiring.unwired.filter((n) => !isProvablyInternal(n));
check(
  wiring.declaredCount > 0 && stillUnwired.length === 0,
  `PT-9b  and every portal-era RPC is still reachable from application code (${wiring.declaredCount} declared; unwired beyond the two provably-internal: ${stillUnwired.join(", ") || "none"})`,
);

// ---------------------------------------------------------------------
// PT-10 -- THE NAV ITEM ARRIVED WITH ITS SCREEN.
// ---------------------------------------------------------------------
const nav = readFileSync(join(ROOT, "components", "layout", "portal-navigation.ts"), "utf8");
check(
  /href: "\/management\/trainers"/.test(nav),
  "PT-10  the `Trainers` rail item exists — and it arrived WITH its route, which is the standing rule: a rail item pointing at a 404 is worse than an absent one",
);
check(
  existsSync(join(ROOT, "app", "(portals)", "management", "trainers", "page.tsx")),
  "PT-10b and the route file it points at actually exists, measured rather than assumed from the nav entry",
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
process.exit(bad === 0 ? 0 : 1);
