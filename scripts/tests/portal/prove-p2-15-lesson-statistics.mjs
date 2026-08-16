#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-15 -- screen `15` Management Lesson Statistics.
// ⛔ ZERO FUNCTIONS AND ZERO GRANTS ADDED, UNDER A BATCH THAT PERMITS THEM.
// =====================================================================
// ⚠️ THE BATCH AUTHORIZATION PRE-APPROVES read-side SECURITY DEFINER
//    functions and their minimum matching EXECUTE grants. ▶ THIS PHASE ADDS
//    NONE, and `PL-1` asserts that as a MEASUREMENT rather than leaving it as
//    a claim in a report: the governed
//    `report_list_management_class_status` already returns per-session rows
//    carrying `report_id` and `report_state`, so "assessed" and "submitted"
//    are read from the SAME governed definition screen `13` uses and the two
//    can never drift.
//
// ⛔ FIVE OF THE FRAME'S SIX CARDS ARE PROHIBITED (`GC-6`, on grounds `C-9`
//    and `G-2`), and `PL-5`/`PL-6` assert their absence at the TYPE and at the
//    SCREEN. `PL-7` is the companion required by the plan's vacuity family:
//    a prohibition proof needs a leg proving the surface still EXISTS.
//
// ⛔ Exit code is the only verdict.
//
// Run: npm run prove:portal-p2-15
// =====================================================================

import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { assertConfigProjectId, resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";
import { unpairedMigrations, rpcsWithoutApplicationCaller, isProvablyInternal } from "./rpc-call-rule.mjs";
import { stripComments } from "./artefact-read-rule.mjs";
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
const grab = (blob, key) => (blob.match(new RegExp(key + "=([^ \\n]*)")) ?? [])[1] ?? "";

const MGMT = "d0000000-0000-4000-8000-000000000001";
const TRAINER = "d0000000-0000-4000-8000-000000000002";
const claims = (sub) => `{"sub":"${sub}","role":"authenticated"}`;

// ---------------------------------------------------------------------
// ⛔ PL-1 -- NO SCHEMA. Asserted, not claimed — and the batch is what makes
//           it worth asserting: a read function here would have been
//           trivially authorizable, so "we added none" is a decision.
// ---------------------------------------------------------------------
const migrations = readdirSync(join(ROOT, "supabase", "migrations")).filter((f) => f.endsWith(".sql"));
check(
  migrations.length > 30 && migrations.filter((f) => /p2_15|lesson_stat/i.test(f)).length === 0,
  `PL-1   ⛔ THIS PHASE SHIPS NO MIGRATION — ${migrations.length} files and NONE names p2_15 or lesson_stat. ⚠️ §12.10 for the fifth phase: \`report_list_management_class_status\` already answers every count this screen may show, and a second read would have been a second definition of "assessed"`,
);
const census = psql(`
SELECT 'T=' || (SELECT pg_catalog.count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE')
    || ' E=' || (SELECT pg_catalog.count(DISTINCT t.typname) FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typtype='e')
    || ' P=' || (SELECT pg_catalog.count(*) FROM pg_catalog.pg_policies WHERE schemaname='public')
    || ' R=' || (SELECT pg_catalog.array_length(public.audit_action_registry(),1));`);
check(
  // re-pinned 23 -> 24 at P2-14 (Operator authorization, 2026-08-16, admin.student_updated); STILL AN EQUALITY, deliberately
  census === "T=30 E=12 P=30 R=24",
  `PL-1b  census UNMOVED: ${census} — no table, column, enum, policy, client grant or audit string`,
);

// ---------------------------------------------------------------------
// PL-2 -- THE READ IT DEPENDS ON RESOLVES, as a real management caller.
//         ⛔ The `P2-9` lesson applied: a governed read is only proven by
//         calling it past every gate against fixture data.
// ---------------------------------------------------------------------
/*
 * ⚠️ THE MODULE IS RESOLVED AS OWNER, BEFORE THE ROLE SWITCH, AND THE FIRST
 * DRAFT GOT THIS WRONG IN AN INSTRUCTIVE WAY: it picked the module inside the
 * `authenticated` transaction by joining `public.reports` — which is exactly
 * the table this whole phase exists because clients cannot read. ▶ **The guard
 * fired on the test rather than on the build**, `permission denied for table
 * reports`, which is the deny leg proving itself from an unexpected direction.
 */
const targetModule = psql(`
SELECT m.id FROM public.class_modules m
  JOIN public.class_sessions cs ON cs.class_module_id = m.id
  JOIN public.reports r ON r.class_session_id = cs.id
 LIMIT 1;`);
const live = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(MGMT)}', true);
SELECT 'ROWS=' || pg_catalog.count(*) || ' SESSIONS=' || pg_catalog.count(DISTINCT class_session_id)
    || ' ASSESSED=' || pg_catalog.count(report_id)
  FROM public.report_list_management_class_status('${targetModule}'::uuid);
ROLLBACK;`);
check(
  Number(grab(live, "ROWS")) > 0 && Number(grab(live, "SESSIONS")) > 0,
  `PL-2   the governed read resolves for management: ${live.replace(/\r?\n/g, " ")} — ⚠️ NON-VACUITY, and it is real: a module with zero rows would make every count below trivially correct`,
);
check(
  Number(grab(live, "ASSESSED")) > 0,
  `PL-2b  and at least one row carries a report (${grab(live, "ASSESSED")}) — the "assessed" count has something to count, so a zero on this screen would mean something`,
);

// ---------------------------------------------------------------------
// ⛔ PL-3 -- THE DENY, WITH A CONTROL THAT DISCRIMINATES.
// ---------------------------------------------------------------------
const deny = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(TRAINER)}', true);
SELECT 'T_SESSIONS=' || pg_catalog.count(*) FROM public.class_sessions;
SELECT 'T_STATUS=' || pg_catalog.count(*)
  FROM public.report_list_management_class_status((SELECT id FROM public.class_modules LIMIT 1));
ROLLBACK;`);
check(
  Number(grab(deny, "T_SESSIONS")) > 0,
  `PL-3   ⛔ THE POSITIVE HALF: the TRAINER reads ${grab(deny, "T_SESSIONS")} class session(s) — a real session and a real policy, so the zero below is the gate rather than blindness`,
);
check(
  grab(deny, "T_STATUS") === "0",
  `PL-3b  ⛔ AND THE NEGATIVE HALF: that same identity gets ${grab(deny, "T_STATUS")} rows from the management status read — the screen's counts are unreachable to a trainer, inside the function`,
);

// ---------------------------------------------------------------------
// PL-4 -- THE SOURCE LAYERS EXIST.
// ---------------------------------------------------------------------
const FILES = [
  "server/modules/management-view/lesson-statistics-projections.ts",
  "features/management/management-lesson-statistics-screen.tsx",
  "app/(portals)/management/classes/[classModuleId]/sessions/[sessionId]/lesson-statistics/page.tsx",
];
const present = FILES.filter((f) => existsSync(join(ROOT, ...f.split("/"))));
check(present.length === FILES.length, `PL-4   all ${FILES.length} layers exist (${present.length}) — a missing file would make every scan below vacuous`);
const projection = stripComments(
  readFileSync(join(ROOT, "server", "modules", "management-view", "lesson-statistics-projections.ts"), "utf8"),
);
const screen = stripComments(
  readFileSync(join(ROOT, "features", "management", "management-lesson-statistics-screen.tsx"), "utf8"),
);

// ---------------------------------------------------------------------
// ⛔ PL-5 -- THE FIVE PROHIBITED CARDS HAVE NO FIELD IN THE TYPE.
// ---------------------------------------------------------------------
const contracts = stripComments(readFileSync(join(ROOT, "lib", "frontend", "contracts", "physical-test.ts"), "utf8"));
const dto = contracts.slice(
  contracts.indexOf("export type LessonStatisticsDto"),
  contracts.indexOf("export type ManagementStudentListDto"),
);
const dtoHits = ["rating", "average", "distribution", "strongest", "focus", "overall", "assistant", "skill"].filter(
  (t) => new RegExp(t, "i").test(dto),
);
check(
  dto.length > 100 && dtoHits.length === 0,
  `PL-5   ⛔ THE TYPE HAS NO FIELD FOR ANY PROHIBITED CARD (${dto.length} chars; offenders: ${dtoHits.join(", ") || "none"}): no Skill Averages, no Status Distribution, no Class Average, no Strongest/Focus/Overall, no Assistant. ▶ The refusal is in the TYPE, which a component cannot undo`,
);

// ---------------------------------------------------------------------
// ⛔ PL-6 -- AND THE SCREEN RENDERS NONE OF THEM.
// ---------------------------------------------------------------------
const screenHits = [
  [/Skill Averages/, "Skill Averages"],
  [/Status Distribution/, "Status Distribution"],
  [/Class Average/, "Class Average"],
  [/>\s*Overall\s*</, "an Overall column"],
  [/Assistant\s*·/, "an Assistant card"],
  [/(beginning|developing|mastering|mastered)/i, "a rating label"],
].filter(([rx]) => rx.test(screen));
check(
  screenHits.length === 0,
  `PL-6   ⛔ THE SCREEN RENDERS NONE OF THE FIVE (offenders: ${screenHits.map(([, w]) => w).join("; ") || "none"}) — GC-6: "do not add a rating badge, bar, column, tile or chip"`,
);

/*
 * ⛔ PL-7 -- THE COMPANION THE VACUITY FAMILY REQUIRES.
 *
 * ⚠️ Operator-ruled at `P2-9`: *"a prohibition proof needs a companion proving
 * the thing still exists."* PL-5 and PL-6 are both ABSENCE assertions, and
 * BOTH are perfectly satisfied by an empty screen file. ▶ This asserts the
 * counts that survived are actually rendered.
 */
check(
  /enrolledCount/.test(screen) &&
    /presentCount/.test(screen) &&
    /assessedCount/.test(screen) &&
    /submittedCount/.test(screen) &&
    /trainerName/.test(screen),
  "PL-7   ⚠️ AND THE SURVIVING SURFACE STILL RENDERS — enrolled, present, assessed, submitted and the trainer are all consumed. ▶ Without this leg an EMPTY screen would satisfy PL-5 and PL-6 perfectly, which is the family the plan records beside the empty-string and zero-row entries",
);
check(
  /not built/.test(screen) && /Assistant trainer/.test(screen),
  "PL-7b  ⛔ AND THE FIVE OMISSIONS ARE DISCLOSED ON THE PAGE, not in a source comment (§12.12) — a screen that quietly drops five of six cards looks unfinished; one that says which and why is honestly complete",
);

// ---------------------------------------------------------------------
// PL-8 -- THE COUNTS ARE COUNTS, AND READ FROM THE GOVERNED DEFINITION.
// ---------------------------------------------------------------------
check(
  /readClassStatusRowsCore/.test(projection) && !/observation_ratings|competency_rating/.test(projection),
  "PL-8   ⛔ THE PROJECTION REUSES THE GOVERNED READ and touches no rating table — `assessed` and `submitted` come from the same definition screen `13` uses, so the two surfaces cannot disagree",
);
check(
  /reportId !== null/.test(projection) && /reportState === "submitted"/.test(projection),
  'PL-8b  and both counts are derived from the returned rows rather than re-queried — "assessed" is `reportId !== null`, which is structural: `assessment_save_complete_and_open_report` is the only path that persists an observation and it opens the report in the same transaction',
);

// ---------------------------------------------------------------------
// PL-9 -- THE STANDING RULES.
// ---------------------------------------------------------------------
const leaks = ratingLeaks([screen, projection].join("\n"));
check(
  leaks.length === 0,
  `PL-9   ⛔ NO RATING VOCABULARY in any rating-shaped context (${leaks.map((l) => `${l.context}:${l.term}`).join("; ") || "none"})`,
);
const narrowing = proveNarrowing();
check(
  narrowing.ok,
  `PL-9b  CONTROL: the narrowed detector fires on every real-rating sample and no ordinary-English sample (missed: ${narrowing.missed.join(", ") || "none"}; false positives: ${narrowing.falsePositives.join(", ") || "none"})`,
);
check(
  unpairedMigrations(ROOT).length === 0,
  `PL-10  every portal-era migration still has a paired suite (${unpairedMigrations(ROOT).join(", ") || "none unpaired"})`,
);
const wiring = rpcsWithoutApplicationCaller(ROOT, () => false);
const stillUnwired = wiring.unwired.filter((n) => !isProvablyInternal(n));
check(
  stillUnwired.length === 0,
  `PL-10b and every portal-era RPC is reachable from application code (${wiring.declaredCount} declared; unwired beyond the provably-internal: ${stillUnwired.join(", ") || "none"})`,
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed checks)`);
process.exit(bad === 0 ? 0 : 1);
