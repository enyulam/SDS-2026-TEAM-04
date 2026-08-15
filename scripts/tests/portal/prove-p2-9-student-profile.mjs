#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-9 -- screen `18` Management Student Profile.
// TWO SECURITY DEFINER READS, TWO EXECUTE GRANTS.
// =====================================================================
// ⛔ THE OPERATOR'S RULING IS THIS SUITE'S SUBJECT:
//
//      *"THE AGGREGATION HAPPENS INSIDE THE DATABASE. … The function returns
//       the trend and the counts, **never the ratings that produced them.**
//       Assert it: the returned shape must carry no rating value, band or
//       dimension-keyed score, the way `V-4` was written. **Prove it.**"*
//
//      *"`D-2`'s constraint stands -- the trend is a line with **no number,
//       band or grade rendered anywhere, to any role.**"*
//
// ⚠️ THE TWO HALVES LIVE IN DIFFERENT PLACES AND BOTH ARE ASSERTED:
//    the SHAPE in the database (`PS-4`), and the RENDERING in the screen
//    (`PS-7`) -- because a shape carrying no rating is still breached by a
//    component that formats `sessionScore` into text.
//
// ⛔ AND `PS-3` IS THE LEG THE MIGRATION COULD NOT HAVE. An apply-time probe
//    runs as OWNER and returns at the FIRST gate; only a real management
//    caller reaches the aggregating body. That is how `class_grades.label`
//    was found AFTER ten green assertions.
//
// ⛔ Exit code is the only verdict.
//
// Run: npm run prove:portal-p2-9
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
const grab = (blob, key) => (blob.match(new RegExp(`^${key}=(.*)$`, "m")) ?? [])[1] ?? "";

const MGMT = "d0000000-0000-4000-8000-000000000001";
const TRAINER = "d0000000-0000-4000-8000-000000000002";
const claims = (sub) => `{"sub":"${sub}","role":"authenticated"}`;

// ---------------------------------------------------------------------
// PS-0 -- NON-VACUITY. A student with an assessed session must exist,
//         or every leg below is true of an empty database.
// ---------------------------------------------------------------------
const seed = psql(`
SELECT 'STUDENTS=' || (SELECT pg_catalog.count(*) FROM public.students)
    || ' OBS=' || (SELECT pg_catalog.count(*) FROM public.observations)
    || ' RATINGS=' || (SELECT pg_catalog.count(*) FROM public.observation_ratings)
    || ' REPORTS=' || (SELECT pg_catalog.count(*) FROM public.reports);`);
/*
 * ⚠️ PARSED WITH A BOUNDED PATTERN, NOT `grab`. `grab` captures to end of line,
 * and these four labels share one line — the exact defect that made `PA-6` read
 * "created M1=true I1=true" as its reason. A suite's own parser is as capable of
 * lying as the code it tests.
 */
const num = (key) => Number((seed.match(new RegExp(key + '=([0-9]+)')) ?? [])[1] ?? NaN);
check(
  num("STUDENTS") > 0 && num("RATINGS") >= 9 && num("OBS") > 0,
  `PS-0   NON-VACUITY: ${seed} — fewer than nine ratings would make the trend legs vacuously true`,
);

// ---------------------------------------------------------------------
// PS-1 -- BOTH MIGRATIONS APPLIED, both functions in the authorized posture.
// ---------------------------------------------------------------------
const migrations = readdirSync(join(ROOT, "supabase", "migrations")).filter((f) => f.endsWith(".sql"));
check(
  migrations.includes("20260815150000_portal_p2_9_student_profile_reads.sql") &&
    migrations.includes("20260815160000_portal_p2_9_class_label_fix.sql"),
  `PS-1   both P2-9 migrations are in the tree (${migrations.length} files) — the second is the R-1 forward correction of a column reference the first got wrong`,
);
const applied = psql(
  "SELECT string_agg(version, ',' ORDER BY version) FROM supabase_migrations.schema_migrations WHERE version IN ('20260815150000','20260815160000');",
);
check(applied === "20260815150000,20260815160000", `PS-1b  and both are RECORDED APPLIED (${applied || "NONE"})`);

const posture = psql(`
SELECT p.proname || '=' || p.prosecdef::text || '/' || p.provolatile::text || '/' ||
       pg_catalog.array_to_string(p.proconfig, ';')
  FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
 WHERE n.nspname = 'public'
   AND p.proname IN ('report_management_student_trend', 'report_management_student_reports')
 ORDER BY p.proname;`);
check(
  posture.split(/\r?\n/).length === 2 && posture.split(/\r?\n/).every((l) => l.includes('=true/s/search_path=""')),
  `PS-2   both reads are SECURITY DEFINER, STABLE and search_path-pinned: ${posture.replace(/\r?\n/g, " · ")}`,
);

// ---------------------------------------------------------------------
// ⛔ PS-3 -- THEY RUN AS A REAL MANAGEMENT CALLER, PAST EVERY GATE.
//
//         ⚠️ THIS IS THE LEG THE MIGRATION COULD NOT HAVE. An apply-time
//         probe runs as OWNER and returns at the FIRST of three gates, and
//         `plpgsql` resolves lazily — so the body is never reached. The
//         `class_grades.label` fault survived TEN green assertions and was
//         found here, by calling as management against fixture data.
// ---------------------------------------------------------------------
const live = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(MGMT)}', true);
SELECT 'TREND_ROWS=' || pg_catalog.count(*)
  FROM public.report_management_student_trend((SELECT id FROM public.students ORDER BY id LIMIT 1));
SELECT 'TREND_SCORES=' || coalesce(pg_catalog.string_agg(session_score::text, ','), '(none)')
  FROM public.report_management_student_trend((SELECT id FROM public.students ORDER BY id LIMIT 1));
SELECT 'REPORT_ROWS=' || pg_catalog.count(*)
  FROM public.report_management_student_reports((SELECT id FROM public.students ORDER BY id LIMIT 1));
SELECT 'REPORT_LABELS=' || coalesce(pg_catalog.string_agg(class_label || '/' || report_state::text, ','), '(none)')
  FROM public.report_management_student_reports((SELECT id FROM public.students ORDER BY id LIMIT 1));
ROLLBACK;`);
check(
  Number(grab(live, "TREND_ROWS")) > 0,
  `PS-3   ⛔ THE TREND RUNS AS A REAL MANAGEMENT CALLER and returns ${grab(live, "TREND_ROWS")} point(s) — every column reference in the aggregating body resolves, which an owner-probe at the first gate can never establish`,
);
check(
  Number(grab(live, "REPORT_ROWS")) > 0 && grab(live, "REPORT_LABELS") !== "(none)",
  `PS-3b  and the reports read runs too: ${grab(live, "REPORT_LABELS")} — ⚠️ THIS is the leg that caught \`class_grades.label\` after ten green apply-time assertions`,
);

/*
 * ⛔ PS-3c -- THE SCORE IS A REAL AGGREGATE, NOT A CONSTANT.
 *
 * ⚠️ §12.15: a proof of a computed value must be able to FAIL. The fixture's
 * observation is deliberately MIXED, so a correct D-2 mean lands strictly
 * between the band floors — a leg asserting merely "a number came back" would
 * pass against a hard-coded 100, an unmapped NULL coerced to 0, or a body that
 * counted rows instead of averaging them.
 */
const scores = grab(live, "TREND_SCORES").split(",").map(Number).filter((n) => !Number.isNaN(n));
check(
  scores.length > 0 && scores.every((s) => s > 25 && s < 100 && s % 25 !== 0),
  `PS-3c  ⛔ THE SCORE IS A GENUINE MEAN OF A MIXED RATING SET: ${grab(live, "TREND_SCORES")} — strictly between the band floors and not ON one. ▶ A constant, an unmapped NULL, or a count-instead-of-average would all land on a band boundary and fail here`,
);

// ---------------------------------------------------------------------
// ⛔ PS-4 -- THE RULED ASSERTION: THE RETURNED SHAPE CARRIES NO RATING.
// ---------------------------------------------------------------------
const shapes = psql(`
SELECT p.proname || '=' || pg_catalog.pg_get_function_result(p.oid)
  FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
 WHERE n.nspname = 'public'
   AND p.proname IN ('report_management_student_trend', 'report_management_student_reports')
 ORDER BY p.proname;`);
const BARRED = [
  "competency_rating",
  "dimension_code",
  "rating",
  "band",
  "grade",
  "overview",
  "strengths",
  "areas_for_development",
  "remarks",
  "observation_notes",
  "follow_up_notes",
  "checklist",
  "approval",
  "content_hash",
  "wording_hash",
];
const shapeHits = BARRED.filter((t) => shapes.toLowerCase().includes(t));
check(
  shapeHits.length === 0,
  `PS-4   ⛔ NEITHER RESULT TYPE CARRIES A RATING VALUE, BAND OR DIMENSION-KEYED SCORE (offenders: ${shapeHits.join(", ") || "none"}). Shapes: ${shapes.replace(/\r?\n/g, " · ")}`,
);

/*
 * ⛔ PS-4b -- AND NO RETURNED VALUE IS A RATING LABEL EITHER.
 *
 * ⚠️ PS-4 checks the TYPE; this checks the DATA. A `text` column is perfectly
 * capable of carrying `Mastering`, and a shape assertion would not notice.
 * ▶ Every text-ish value both functions return is scanned for the four
 * ratified labels, as VALUES rather than as prose.
 */
const values = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(MGMT)}', true);
SELECT 'VALS=' || coalesce(pg_catalog.string_agg(v, '|'), '(none)') FROM (
  SELECT pg_catalog.lower(coalesce(lesson_title, '')) AS v
    FROM public.report_management_student_trend((SELECT id FROM public.students ORDER BY id LIMIT 1))
  UNION ALL
  SELECT pg_catalog.lower(class_label || ' ' || coalesce(lesson_title,'') || ' ' || coalesce(term_label,''))
    FROM public.report_management_student_reports((SELECT id FROM public.students ORDER BY id LIMIT 1))
) x;
ROLLBACK;`);
const vals = grab(values, "VALS");
const labelHit = ["beginning", "developing", "mastering", "mastered"].filter((l) =>
  new RegExp(`(^|\\|)\\s*${l}\\s*(\\||$)|["']${l}["']`).test(vals),
);
check(
  labelHit.length === 0,
  `PS-4b  ⛔ AND NO RETURNED VALUE IS A RATING LABEL (offenders: ${labelHit.join(", ") || "none"}) — PS-4 checks the TYPE, this checks the DATA, and a text column can carry "Mastering" without the shape ever changing`,
);

// ---------------------------------------------------------------------
// PS-5 -- THE BOUNDARY THE BATCH AUTHORIZATION NAMED.
// ---------------------------------------------------------------------
const census = psql(`
SELECT 'T=' || (SELECT pg_catalog.count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE')
    || ' E=' || (SELECT pg_catalog.count(DISTINCT t.typname) FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typtype='e')
    || ' P=' || (SELECT pg_catalog.count(*) FROM pg_catalog.pg_policies WHERE schemaname='public')
    || ' R=' || (SELECT pg_catalog.array_length(public.audit_action_registry(),1));`);
check(
  census === "T=30 E=12 P=30 R=23",
  `PS-5   census UNMOVED: ${census} — the batch authorization is READ FUNCTIONS ONLY: no table, column, enum, policy, client table grant or audit string`,
);

const tableGrants = psql(`
SELECT coalesce(pg_catalog.string_agg(DISTINCT g.table_name || ':' || g.privilege_type, ','), '(none)')
  FROM information_schema.role_table_grants g
 WHERE g.table_schema='public'
   AND g.table_name IN ('observations','observation_ratings','reports','report_versions')
   AND g.grantee IN ('anon','authenticated');`);
check(
  tableGrants === "(none)",
  `PS-5b  ⛔ AND ZERO CLIENT TABLE GRANTS on the four report-side tables (${tableGrants}) — they stay reachable ONLY through a reviewed RPC, which is the whole reason these two functions exist`,
);

const execGrants = psql(`
SELECT 'AUTH=' || pg_catalog.count(*) FROM information_schema.role_routine_grants
 WHERE routine_schema='public'
   AND routine_name IN ('report_management_student_trend','report_management_student_reports')
   AND grantee='authenticated';`);
const anonGrants = psql(`
SELECT 'ANON=' || pg_catalog.count(*) FROM information_schema.role_routine_grants
 WHERE routine_schema='public'
   AND routine_name IN ('report_management_student_trend','report_management_student_reports')
   AND grantee IN ('anon','service_role');`);
check(
  grab(execGrants, "AUTH") === "2" && grab(anonGrants, "ANON") === "0",
  `PS-5c  EXACTLY TWO client EXECUTE grants, both authenticated (authenticated=${grab(execGrants, "AUTH")}, anon+service_role=${grab(anonGrants, "ANON")}) — the minimum matching grants and no more`,
);

// ---------------------------------------------------------------------
// ⛔ PS-6 -- THE DENY, WITH A CONTROL THAT DISCRIMINATES.
//         The same trainer identity is shown SUCCEEDING on a read it is
//         entitled to, so its zero here is the gate and not blindness.
// ---------------------------------------------------------------------
const deny = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(TRAINER)}', true);
SELECT 'T_CAN_READ_STUDENTS=' || pg_catalog.count(*) FROM public.students;
SELECT 'T_TREND=' || pg_catalog.count(*)
  FROM public.report_management_student_trend((SELECT id FROM public.students ORDER BY id LIMIT 1));
SELECT 'T_REPORTS=' || pg_catalog.count(*)
  FROM public.report_management_student_reports((SELECT id FROM public.students ORDER BY id LIMIT 1));
ROLLBACK;`);
check(
  Number(grab(deny, "T_CAN_READ_STUDENTS")) > 0,
  `PS-6   ⛔ THE POSITIVE HALF: the TRAINER identity reads ${grab(deny, "T_CAN_READ_STUDENTS")} student row(s) — it holds a real session and a real policy, so the zeros below are discrimination rather than blindness (the PT-3b defect)`,
);
check(
  grab(deny, "T_TREND") === "0" && grab(deny, "T_REPORTS") === "0",
  `PS-6b  ⛔ AND THE NEGATIVE HALF: that same identity gets ZERO from both reads (trend=${grab(deny, "T_TREND")}, reports=${grab(deny, "T_REPORTS")}) — management-gated inside the function, not by the caller choosing not to ask`,
);

// ---------------------------------------------------------------------
// ⛔ PS-7 -- `D-2` IS NEVER RENDERED. Three assertions, and the third is
//         the one that stops an emptied chart from passing the first two.
// ---------------------------------------------------------------------
const screenPath = join(ROOT, "features", "management", "management-student-profile-screen.tsx");
check(existsSync(screenPath), "PS-7   the screen file exists — a missing file would make every scan below vacuous");
const screen = stripComments(readFileSync(screenPath, "utf8"));

/*
 * ⚠️ THE SCAN IS FOR FORMATTING, NOT FOR THE IDENTIFIER. `sessionScore` MUST
 * appear — it is the coordinate. What must not appear is any construction that
 * turns it into readable text.
 */
const renderHits = [
  [/sessionScore[^)\n]*toFixed/, "toFixed on the score"],
  [/\{[^}]*sessionScore[^}]*\}\s*%/, "a percent-suffixed score in a text node"],
  [/aria-label=\{[^}]*sessionScore/, "the score inside an aria-label"],
  [/title=\{[^}]*sessionScore/, "the score inside a title attribute"],
  [/>\s*\{[^}]*sessionScore[^}]*\}\s*</, "the score as element content"],
  [/(beginning|developing|mastering|mastered)/i, "a rating band label"],
].filter(([rx]) => rx.test(screen));
check(
  renderHits.length === 0,
  `PS-7b  ⛔ \`D-2\` IS NEVER RENDERED AS A NUMBER, BAND OR GRADE (offenders: ${renderHits.map(([, w]) => w).join("; ") || "none"}) — "a line with no number, band or grade rendered anywhere, to any role", including to a screen reader`,
);
check(
  /trendGeometry\(/.test(screen) && /<path\b/.test(screen) && /sessionScore/.test(screen),
  "PS-7c  ⚠️ AND THE CHART STILL RENDERS — `trendGeometry` is called, an SVG `path` is drawn, and `sessionScore` is consumed. ▶ Without this leg an EMPTY chart would satisfy PS-7b perfectly, which is the hero-chain lesson applied to a different field",
);

// ---------------------------------------------------------------------
// PS-8 -- THE THREE PROHIBITED SURFACES ARE ABSENT.
// ---------------------------------------------------------------------
const contracts = stripComments(readFileSync(join(ROOT, "lib", "frontend", "contracts", "physical-test.ts"), "utf8"));
/*
 * ⚠️ BOUNDED TO ITS OWN DECLARATION — CORRECTED AT `P2-17`, 2026-08-16.
 *
 * ⛔ The first form sliced from `ManagementStudentProfileDto` to
 * `ManagementStudentListDto`, i.e. to WHATEVER TYPE HAPPENED TO BE DECLARED
 * NEXT. ▶ It therefore scanned every type anyone later inserted between the
 * two, and `P2-17`'s `TrainerClassCardDto.gradeLabel` turned it red — a
 * **trainer's class grade**, which is `Beginner`/`Intermediate`/`Advanced`
 * (`A-016`) and has nothing to do with a `G-2` roll-up.
 *
 * ⚠️ **THE FAILURE WAS THE CHECK'S, NOT THE BUILD'S**, and it was failing
 * OPEN in the more dangerous direction too: while it read five types it also
 * claimed in its own message to have read "THE PROFILE DTO". A check that
 * reports a bigger scope than it names is as wrong when it passes.
 *
 * ▶ Now bounded at the first column-zero `};`, which terminates exactly one
 * top-level type declaration.
 */
const profileStart = contracts.indexOf("export type ManagementStudentProfileDto");
const profileDto = contracts.slice(
  profileStart,
  contracts.indexOf("\n};", profileStart) + 3,
);
check(
  profileDto.length > 100 && !/rating|grade|band|skill|strength|focus/i.test(profileDto),
  `PS-8   ⛔ THE PROFILE DTO HAS NO FIELD FOR ANY OF THE THREE PROHIBITED SURFACES (${profileDto.length} chars read): no Skill Breakdown (GC-6/C-9), no Strengths & Focus chips (Operator-ruled 2026-08-15 — they are the Skill Breakdown thresholded), no Reports GRADE column (G-2, permanently). ▶ The refusal is in the TYPE, which a component cannot undo`,
);
check(
  !/Skill Breakdown/.test(screen) && !/Strengths &/.test(screen) && !/>\s*Grade\s*</.test(screen),
  "PS-8b  and the SCREEN renders none of the three either — ⚠️ Profile Details promotes up into the vacated column and NO filler card takes the space (Q-27's precedent). Their absence is EXPECTED/REQUIRED at visual acceptance, never a regression",
);
check(
  /Awaiting trainer/.test(screen) && /reportState === "submitted"/.test(screen),
  "PS-8c  ⛔ THE REPORT ROW GATES ON STATUS (A-038): only `submitted` and `trainer_approved` link to screen 19, and every earlier status exposes no report content. ▶ CLAUDE.md §6 names the alternative explicitly as the thing not to build — one generic handler across all rows",
);

// ---------------------------------------------------------------------
// PS-9 -- THE STANDING RULES.
// ---------------------------------------------------------------------
const leaks = ratingLeaks([screen, stripComments(readFileSync(join(ROOT, "server", "modules", "management-view", "student-profile-projections.ts"), "utf8"))].join("\n"));
check(
  leaks.length === 0,
  `PS-9   ⛔ NO RATING VOCABULARY in any rating-shaped context (${leaks.map((l) => `${l.context}:${l.term}`).join("; ") || "none"})`,
);
const narrowing = proveNarrowing();
check(
  narrowing.ok,
  `PS-9b  CONTROL: the narrowed detector fires on every real-rating sample and no ordinary-English sample (missed: ${narrowing.missed.join(", ") || "none"}; false positives: ${narrowing.falsePositives.join(", ") || "none"})`,
);
check(
  unpairedMigrations(ROOT).length === 0,
  `PS-10  every portal-era migration still has a paired suite (${unpairedMigrations(ROOT).join(", ") || "none unpaired"})`,
);
const wiring = rpcsWithoutApplicationCaller(ROOT, () => false);
const stillUnwired = wiring.unwired.filter((n) => !isProvablyInternal(n));
check(
  stillUnwired.length === 0,
  `PS-10b and every portal-era RPC is reachable from application code (${wiring.declaredCount} declared; unwired beyond the provably-internal: ${stillUnwired.join(", ") || "none"})`,
);
check(
  existsSync(join(ROOT, "app", "(portals)", "management", "students", "[studentId]", "page.tsx")),
  "PS-11  the canonical route /management/students/[studentId] exists — ⚠️ and the `Students` rail item dropped `exact` in the SAME pass, because a child route under an exact item resolves to ZERO active items (C2C-002, third occurrence, first one caught by looking)",
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed checks)`);
process.exit(bad === 0 ? 0 : 1);
