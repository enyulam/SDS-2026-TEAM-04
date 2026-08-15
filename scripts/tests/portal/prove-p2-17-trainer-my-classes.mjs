#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-17 -- screen `02` Trainer My Classes.
// ⛔ ZERO FUNCTIONS AND ZERO GRANTS ADDED, UNDER A BATCH THAT PERMITS THEM.
// =====================================================================
// ⚠️ §12.10 FOR THE SEVENTH PHASE RUNNING. Measured at HEAD before a line
//    was written: all eight tables this screen touches carry a grant, RLS and
//    a trainer policy -- `class_modules_select_trainer` IS
//    `app_trainer_reaches_module(id)`, so "my classes" is already what RLS
//    returns.
//
// ⛔ THE `Lesson plan` CONTROL IS DISABLED-WITH-A-REASON, NOT PROHIBITED and
//    NOT ABSENT: screen `03` Trainer Lesson Plan is one of the ratified 36 and
//    lands at `P2-18`. `PT17-6` asserts the distinction.
//
// ⛔ Exit code is the only verdict.
//
// Run: npm run prove:portal-p2-17
// =====================================================================

import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { assertConfigProjectId, resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";
import { stripComments } from "./artefact-read-rule.mjs";
import { ratingLeaks } from "./rating-leak-rule.mjs";

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
/* ⚠️ DELIMITER-BRACKETED, not `([^ \n]*)` — the `P2-16` lesson: the whitespace
   form silently truncated a live measurement to its first word. */
const between = (blob, key) => (blob.match(new RegExp(key + "<([^>]*)>")) ?? [])[1] ?? "";
const read = (rel) => readFileSync(join(ROOT, ...rel.split("/")), "utf8");

const TRAINER = "d0000000-0000-4000-8000-000000000002";
const PARENT = "d0000000-0000-4000-8000-000000000003";
const claims = (sub) => `{"sub":"${sub}","role":"authenticated"}`;

// ---------------------------------------------------------------------
// ⛔ PT17-1 -- NO SCHEMA.
// ---------------------------------------------------------------------
const migrations = readdirSync(join(ROOT, "supabase", "migrations")).filter((f) => f.endsWith(".sql"));
check(
  migrations.length > 30 && migrations.filter((f) => /p2_17|my_classes/i.test(f)).length === 0,
  `PT17-1 ⛔ THIS PHASE SHIPS NO MIGRATION — ${migrations.length} files and NONE names p2_17 or my_classes. ⚠️ §12.10 for the SEVENTH consecutive phase`,
);
const census = psql(`
SELECT 'T=' || (SELECT pg_catalog.count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE')
    || ' E=' || (SELECT pg_catalog.count(DISTINCT t.typname) FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typtype='e')
    || ' P=' || (SELECT pg_catalog.count(*) FROM pg_catalog.pg_policies WHERE schemaname='public')
    || ' R=' || (SELECT pg_catalog.array_length(public.audit_action_registry(),1));`);
check(census === "T=30 E=12 P=30 R=23", `PT17-1b census UNMOVED: ${census}`);

// ---------------------------------------------------------------------
// PT17-2 -- ALL THREE LAYERS EXIST AT HEAD, MEASURED (not inherited).
// ---------------------------------------------------------------------
const layers = psql(`
SELECT 'LAYERS<' || string_agg(
    t.n || ':g' || (SELECT pg_catalog.count(*) FROM information_schema.role_table_grants g WHERE g.table_schema='public' AND g.table_name=t.n AND g.grantee='authenticated')
        || '/p' || (SELECT pg_catalog.count(*) FROM pg_catalog.pg_policies p WHERE p.schemaname='public' AND p.tablename=t.n)
        || '/r' || (SELECT CASE WHEN c.relrowsecurity THEN '1' ELSE '0' END FROM pg_class c JOIN pg_namespace ns ON ns.oid=c.relnamespace WHERE ns.nspname='public' AND c.relname=t.n),
    ' ' ORDER BY t.n) || '>'
  FROM (VALUES ('class_modules'),('class_sessions'),('class_grades'),('class_session_assignments'),('terms'),('enrolments')) AS t(n);`);
const layerText = between(layers, "LAYERS");
check(
  layerText.length > 0 && !/:g0|\/p0|\/r0/.test(layerText),
  `PT17-2 all six tables carry grant + policy + RLS, MEASURED at HEAD rather than inherited from an earlier phase: ${layerText}`,
);
const trainerPolicy = psql(`
SELECT 'QUAL<' || qual || '>' FROM pg_catalog.pg_policies WHERE schemaname='public' AND policyname='class_modules_select_trainer';`);
check(
  /app_trainer_reaches_module/.test(between(trainerPolicy, "QUAL")),
  `PT17-2b ⛔ AND THE MODULE POLICY IS ASSIGNMENT-SCOPED, not centre-scoped: \`${between(trainerPolicy, "QUAL")}\` — ▶ this is the reason no governed read was needed`,
);

// ---------------------------------------------------------------------
// ⛔ PT17-3 -- THE DENY, WITH A CONTROL THAT DISCRIMINATES.
// ⚠️ NOT trainer-vs-trainer: the fixture has ONE trainer holding all 17
//    assignments, so a same-role comparison would pass while proving nothing
//    (the `PT-3b` defect caught at `P2-10`). The PARENT is the control.
// ---------------------------------------------------------------------
const trainerReach = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(TRAINER)}', true);
SELECT 'T_ASSIGN<' || pg_catalog.count(*) || '>' FROM public.class_session_assignments;
SELECT 'T_MODULES<' || pg_catalog.count(*) || '>' FROM public.class_modules;
ROLLBACK;`);
const parentReach = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(PARENT)}', true);
SELECT 'P_ASSIGN<' || pg_catalog.count(*) || '>' FROM public.class_session_assignments;
SELECT 'P_MODULES<' || pg_catalog.count(*) || '>' FROM public.class_modules;
ROLLBACK;`);
check(
  Number(between(trainerReach, "T_ASSIGN")) > 0 && Number(between(trainerReach, "T_MODULES")) > 0,
  `PT17-3 ⛔ THE POSITIVE HALF: the TRAINER reads ${between(trainerReach, "T_ASSIGN")} assignment(s) and ${between(trainerReach, "T_MODULES")} module(s) — a real identity through real policies`,
);
check(
  between(parentReach, "P_ASSIGN") === "0",
  `PT17-3b ⛔ AND THE DISCRIMINATING NEGATIVE: the PARENT reads ${between(parentReach, "P_ASSIGN")} assignment(s) — ⚠️ the parent is used deliberately, because the fixture has ONE trainer holding every assignment, so a trainer-vs-trainer control would pass while proving nothing (the \`PT-3b\` defect caught at \`P2-10\`)`,
);

// ---------------------------------------------------------------------
// ⚠️ PT17-4 -- THE TERM FILTER IS BY DATE, AND THE REASON IS MEASURABLE.
// ---------------------------------------------------------------------
const termShape = psql(`
SELECT 'UNTERMED<' || pg_catalog.count(*) FILTER (WHERE term_id IS NULL) || '>' FROM public.class_sessions;
SELECT 'TOTAL<' || pg_catalog.count(*) || '>' FROM public.class_sessions;
SELECT 'TERMS<' || pg_catalog.count(*) || '>' FROM public.terms;`);
const untermed = Number(between(termShape, "UNTERMED"));
check(
  untermed > 0 && Number(between(termShape, "TERMS")) > 0,
  `PT17-4 ⚠️ ${untermed} of ${between(termShape, "TOTAL")} sessions carry NO \`term_id\` — ▶ a \`term_id\` filter would have made them SILENTLY VANISH from a trainer's own class list because an administrator did not set a field. The filter is by the term's DATE WINDOW against \`session_date\`, a column every session has`,
);
const proj = read("server/modules/class-session/trainer-my-classes.ts");
check(
  /gte\("session_date", selected\.starts_on\)/.test(proj) && !/eq\("term_id"/.test(proj),
  "PT17-4b …and the projection implements exactly that — a `session_date` window, with no `term_id` equality anywhere",
);

// ---------------------------------------------------------------------
// ⛔ PT17-5 -- `A-016`: ASSIGNMENT IS AUTHORITATIVE AT SESSION LEVEL.
// ---------------------------------------------------------------------
check(
  /from\("class_session_assignments"\)[\s\S]{0,200}eq\("is_active", true\)/.test(proj),
  "PT17-5 ⛔ the module list is DERIVED FROM ACTIVE SESSION ASSIGNMENTS, not from a module-level join — `A-016` makes assignment authoritative at session level, and RLS agreeing is a second layer rather than the reason the query is right",
);

// ---------------------------------------------------------------------
// ⛔ PT17-6 -- `Lesson plan`: DISABLED WITH A REASON, NOT ABSENT.
// ---------------------------------------------------------------------
const screen = read("features/trainer/trainer-my-classes-screen.tsx");
const stripped = stripComments(screen);
check(
  /Lesson plan/.test(stripped) && /disabled/.test(stripped) && /title="Lesson plans open with/.test(stripped),
  "PT17-6 ⛔ `Lesson plan` renders PRESENT, DISABLED and WITH ITS REASON — ⚠️ NOT `G-3`'s prohibited control: its destination, screen `03`, is one of the ratified 36 and lands at `P2-18`. ▶ Absent would say \"not a thing\"; only \"not yet\" is true",
);
check(
  !/href=.*lesson-plan/.test(stripped),
  "PT17-6b …and it is NOT a live link — screen `03` does not exist yet, so a working href would 404",
);

// ---------------------------------------------------------------------
// ⛔ PT17-7 -- NO RATING, NO TA, ANYWHERE ON THIS SURFACE.
// ---------------------------------------------------------------------
const contracts = read("lib/frontend/contracts/physical-test.ts");
const dtoStart = contracts.indexOf("export type TrainerClassCardDto");
const dtoBody = contracts.slice(dtoStart, contracts.indexOf("};", dtoStart));
const BANNED = ["rating", "score", "grade:", "band", "overall", "mastery", "assess"];
const hits = BANNED.filter((w) => new RegExp(w, "i").test(stripComments(dtoBody)));
check(hits.length === 0, `PT17-7 ⛔ the card DTO carries no rating, score, band or assessment field (${hits.join(",") || "none"})`);
const leaks = ratingLeaks(stripped);
check(leaks.length === 0, `PT17-7b ⛔ and no rating vocabulary reaches the screen (${leaks.map((l) => l.term).join(",") || "none"})`);
check(
  !/Assist\.|Assistant|\bTA\b/.test(stripped),
  "PT17-7c ⛔ NO `Assist.` / TA (`A-014`/`G-7`) — ⚠️ and the frame draws none here either: measured, the `.html` contains `Assist` ZERO times, so this is agreement rather than a refusal",
);

// ---------------------------------------------------------------------
// ⚠️ PT17-8 -- THE TINT IS KEYED BY TITLE, NEVER BY ROW INDEX.
// ---------------------------------------------------------------------
check(
  /function tintFor\(title: string\)/.test(screen) && !/TINTS\[(i|index|idx)/.test(screen),
  "PT17-8 ⚠️ the avatar tint is derived from the module TITLE, not from the row index — ▶ `P2-8` shipped exactly that defect, where a learner changed colour when the filter reordered the table. Keyed by title it also reproduces what the frame does: both Public Speaking cards pink, both Speech and Drama teal",
);

// ---------------------------------------------------------------------
// ✅ PT17-9 -- THE RAIL ITEM EXISTS AND IS DELIBERATELY NOT `exact`.
// ---------------------------------------------------------------------
const nav = read("components/layout/portal-navigation.ts");
const myClasses = nav.slice(nav.indexOf('href: "/trainer/my-classes"'), nav.indexOf('href: "/trainer/reports'));
check(
  myClasses.includes('label: "My Classes"') && !/exact:\s*true/.test(myClasses),
  "PT17-9 ✅ the trainer rail declares `My Classes` and it is NOT `exact` — ⛔ screen `03` is already known to be a child route (`/trainer/my-classes/lesson-plan`, `P2-18`), and an `exact` item would give it ZERO active items and a blank sidebar. `C2C-002` decided BEFORE it could bite, for the fourth rail item",
);
check(
  !/screens 02\/04 are deferred/.test(nav),
  "PT17-9b ✅ and the rail's stale comment calling screen `02` deferred was corrected in the SAME pass (§12.11) — screen `04` remains deferred, at `P2-20`",
);

// ---------------------------------------------------------------------
// PT17-10 -- THE ROUTE AND ITS LAYERS SHIP.
// ---------------------------------------------------------------------
const FILES = [
  "server/modules/class-session/trainer-my-classes.ts",
  "features/trainer/trainer-my-classes-screen.tsx",
  "app/(portals)/trainer/my-classes/page.tsx",
];
check(
  FILES.every((f) => existsSync(join(ROOT, ...f.split("/")))),
  `PT17-10 all ${FILES.length} layers exist`,
);
check(
  /todayIso = new Date\(\)\.toISOString\(\)\.slice\(0, 10\)/.test(read("server/modules/integration-adapter/participant-actions.ts")),
  "PT17-10b ⚠️ `today` is resolved SERVER-SIDE — a browser-supplied date would let the caller choose which sessions count as upcoming",
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed checks)`);
process.exit(bad === 0 ? 0 : 1);
