#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-20 -- screen `04` Trainer Students.
// ⛔ ONE FUNCTION AND ONE GRANT ADDED, UNDER THE BATCH. NAMED, NOT COUNTED:
//      · function  public.report_list_trainer_students()
//      · grant     EXECUTE ON public.report_list_trainer_students() TO authenticated
//    NO table, column, enum, policy, client table grant, write path or audit
//    string. `PT20-1c` measures the census unmoved as the proof.
//
// ⛔ THE FRAME'S `Level` COLUMN IS REFUSED TWICE OVER -- `GC-7` in this pack's
//    own notes, and `G-2` independently (one chip for a whole assessment
//    history is a roll-up, on every surface regardless of audience). The
//    refusal is asserted at THREE layers, because each can widen without the
//    others noticing: the SQL body, the DTO, and the rendered screen.
//
// ⛔ Exit code is the only verdict.
//
// Run: npm run prove:portal-p2-20
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
const between = (blob, key) => (blob.match(new RegExp(key + "<([^>]*)>")) ?? [])[1] ?? "";
const read = (rel) => readFileSync(join(ROOT, ...rel.split("/")), "utf8");

const TRAINER = "d0000000-0000-4000-8000-000000000002";
const PARENT = "d0000000-0000-4000-8000-000000000003";
const claims = (sub) => `{"sub":"${sub}","role":"authenticated"}`;
const MIGRATION = "20260816140000_portal_p2_20_trainer_students.sql";

// ---------------------------------------------------------------------
// ⛔ PT20-1 -- WHAT THIS PHASE ADDED, NAMED RATHER THAN COUNTED.
// ---------------------------------------------------------------------
const migrations = readdirSync(join(ROOT, "supabase", "migrations")).filter((f) => f.endsWith(".sql"));
const sql = read(`supabase/migrations/${MIGRATION}`);
const declared = [...sql.matchAll(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+public\.([a-z0-9_]+)/gi)].map((m) => m[1]);
const grants = [...sql.matchAll(/GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.([a-z0-9_]+)[^;]*TO\s+([a-z_]+)/gi)].map(
  (m) => `${m[1]}→${m[2]}`,
);
check(
  migrations.filter((f) => /p2_20/i.test(f)).length === 1 &&
    declared.length === 1 &&
    declared[0] === "report_list_trainer_students",
  `PT20-1 ⛔ ONE migration, ONE function: [${declared.join(",") || "none"}]`,
);
check(
  grants.length === 1 && grants[0] === "report_list_trainer_students→authenticated",
  `PT20-1a ⛔ ONE grant: [${grants.join(",") || "none"}]`,
);
check(
  !/CREATE\s+TABLE|ALTER\s+TABLE|CREATE\s+TYPE|ALTER\s+TYPE|CREATE\s+POLICY|GRANT\s+(SELECT|INSERT|UPDATE|DELETE)/i.test(
    sql,
  ),
  "PT20-1b ⛔ and the file declares NO table, column, enum, policy or client table grant — read off the file, not off a summary of it",
);
const census = psql(`
SELECT 'T=' || (SELECT pg_catalog.count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE')
    || ' E=' || (SELECT pg_catalog.count(DISTINCT t.typname) FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typtype='e')
    || ' P=' || (SELECT pg_catalog.count(*) FROM pg_catalog.pg_policies WHERE schemaname='public')
    || ' R=' || (SELECT pg_catalog.array_length(public.audit_action_registry(),1));`);
check(census === "T=30 E=12 P=30 R=23", `PT20-1c census UNMOVED, registry included: ${census}`);

// ---------------------------------------------------------------------
// ⛔ PT20-2 -- SECURITY POSTURE, FROM THE CATALOGUE.
// ---------------------------------------------------------------------
const posture = psql(`
SELECT 'POSTURE<' || p.prosecdef::text || '|' || p.provolatile::text || '|' || coalesce(array_to_string(p.proconfig,','),'none') || '>'
  FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname='report_list_trainer_students';
SELECT 'LIVEGRANTS<' || coalesce(string_agg(g.grantee || ':' || g.privilege_type, ',' ORDER BY g.grantee),'none') || '>'
  FROM information_schema.role_routine_grants g
 WHERE g.routine_schema='public' AND g.routine_name='report_list_trainer_students' AND g.grantee <> 'postgres';
SELECT 'RESULT<' || pg_catalog.pg_get_function_result(p.oid) || '>'
  FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname='report_list_trainer_students';`);
check(
  between(posture, "POSTURE") === 'true|s|search_path=""',
  `PT20-2 ⛔ SECURITY DEFINER + STABLE + \`search_path = ''\`: ${between(posture, "POSTURE")}`,
);
check(
  between(posture, "LIVEGRANTS") === "authenticated:EXECUTE",
  `PT20-2a ⛔ EXACTLY ONE live grant, not \`anon\` and not \`PUBLIC\`: ${between(posture, "LIVEGRANTS")}`,
);
check(
  between(posture, "RESULT") ===
    "TABLE(student_id uuid, student_name text, class_module_id uuid, class_label text, last_assessed date)",
  `PT20-2b ⛔ the result type is pinned string-for-string — ▶ a silently widened projection is exactly how a rating column would arrive later: ${between(posture, "RESULT")}`,
);

// ---------------------------------------------------------------------
// ⛔ PT20-3 -- EXECUTED AS A REAL TRAINER, PAST BOTH GATES.
// ⚠️ §26.1's ceiling: the migration's `PL-7` runs as `postgres`, returns at
//    GATE 1, and proves resolution over about a tenth of the body.
// ---------------------------------------------------------------------
const asTrainer = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(TRAINER)}', true);
SELECT 'ROWS<' || pg_catalog.count(*) || '>' FROM public.report_list_trainer_students();
SELECT 'STUDENTS<' || pg_catalog.count(DISTINCT student_id) || '>' FROM public.report_list_trainer_students();
SELECT 'MODULES<' || pg_catalog.count(DISTINCT class_module_id) || '>' FROM public.report_list_trainer_students();
SELECT 'ASSESSED<' || pg_catalog.count(*) FILTER (WHERE last_assessed IS NOT NULL) || '>' FROM public.report_list_trainer_students();
SELECT 'UNASSESSED<' || pg_catalog.count(*) FILTER (WHERE last_assessed IS NULL) || '>' FROM public.report_list_trainer_students();
SELECT 'LABELLED<' || pg_catalog.count(*) FILTER (WHERE student_name IS NOT NULL AND class_label LIKE '%·%') || '>' FROM public.report_list_trainer_students();
ROLLBACK;`);
const rows = Number(between(asTrainer, "ROWS"));
check(
  rows > 0 && Number(between(asTrainer, "MODULES")) > 1,
  `PT20-3 ⛔ THE FUNCTION RUNS FOR A REAL TRAINER, PAST BOTH GATES: ${rows} row(s) across ${between(asTrainer, "MODULES")} module(s)`,
);
check(
  between(asTrainer, "LABELLED") === String(rows),
  `PT20-3a …and every row carries the learner name and the composed grade·module label the screen renders (${between(asTrainer, "LABELLED")}/${rows}) — ▶ the four joins past the gates are REACHED, not merely declared`,
);

// ---------------------------------------------------------------------
// ⚠️ PT20-3b -- `last_assessed` IS NON-VACUOUS IN **BOTH** DIRECTIONS.
// ⛔ A date column that is never NULL proves nothing about the dash, and one
//    that is always NULL proves nothing about the date. Both must occur.
// ---------------------------------------------------------------------
const assessed = Number(between(asTrainer, "ASSESSED"));
const unassessed = Number(between(asTrainer, "UNASSESSED"));
check(
  assessed > 0 && unassessed > 0 && assessed + unassessed === rows,
  `PT20-3b ⚠️ ${assessed} row(s) carry a date and ${unassessed} carry NULL — ▶ the frame's own \`—\` case is EXERCISED rather than assumed, and neither branch is vacuous`,
);

// ---------------------------------------------------------------------
// ⛔ PT20-3c -- THE SCOPE, CONSTRUCTED. Same shape as `PT19-3c`.
// ⚠️ THE POSITIVE LEG CANNOT SHOW THIS EITHER: the fixture's one trainer is
//    assigned to every session, so the function returning every enrolment is
//    exactly what an UNSCOPED query returns. The divergence is manufactured
//    inside a transaction and rolled back.
// ---------------------------------------------------------------------
/*
 * ⚠️ THE TARGET MODULE IS READ FROM THE FUNCTION'S OWN OUTPUT, AND THE FIRST
 * DRAFT DID NOT DO THAT — it picked a module by `ORDER BY class_module_id
 * LIMIT 1` and happened to select `Beginner - Dance`, which holds **13 of the
 * 17 active assignments and ZERO enrolments**. ▶ Deactivating all thirteen
 * changed the function's output by NOTHING, and this leg went red.
 *
 * ⛔ A CONSTRUCTION THAT REMOVES SOMETHING NOTHING DEPENDS ON HAS CONSTRUCTED
 * NOTHING. A weaker assertion — `after <= rows` — would have PASSED on it and
 * reported the scope proved. The exact expected drop is what caught it.
 */
const target = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(TRAINER)}', true);
SELECT 'TARGET<' || class_module_id || '>' || 'TARGET_ROWS<' || n || '>'
  FROM (SELECT class_module_id, pg_catalog.count(*) AS n
          FROM public.report_list_trainer_students()
         GROUP BY class_module_id
         ORDER BY n, class_module_id LIMIT 1) t;
ROLLBACK;`);
const targetId = between(target, "TARGET");
const targetRows = Number(between(target, "TARGET_ROWS"));
const constructed = psql(`
SELECT 'ALL_ENROL<' || pg_catalog.count(*) || '>' FROM public.enrolments WHERE is_active;
BEGIN;
UPDATE public.class_session_assignments a
   SET is_active = false, unassigned_at = now()
 WHERE a.class_session_id IN (SELECT cs.id FROM public.class_sessions cs WHERE cs.class_module_id = '${targetId}');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(TRAINER)}', true);
SELECT 'AFTER<' || pg_catalog.count(*) || '>' FROM public.report_list_trainer_students();
SELECT 'AFTER_MODULES<' || pg_catalog.count(DISTINCT class_module_id) || '>' FROM public.report_list_trainer_students();
ROLLBACK;
SELECT 'RESTORED<' || pg_catalog.count(*) || '>' FROM public.class_session_assignments WHERE is_active;`);
const after = Number(between(constructed, "AFTER"));
check(
  between(constructed, "ALL_ENROL") === String(rows) &&
    targetRows > 0 &&
    after === rows - targetRows &&
    Number(between(constructed, "AFTER_MODULES")) === Number(between(asTrainer, "MODULES")) - 1,
  `PT20-3c ⛔ CONSTRUCTED, WITH THE EXACT EXPECTED DROP: the trainer reads ${rows} of ${between(constructed, "ALL_ENROL")} active enrolments — IDENTICAL to the whole table, so the scope is invisible until forced. Removing the assignments of one module the function ACTUALLY REPORTS (${targetRows} row(s)) drops it to ${after} across ${between(constructed, "AFTER_MODULES")} module(s). ▶ \`class_session_assignments\` is LOAD-BEARING (\`A-016\`) — and the target is read from the function's OWN output because the first draft picked \`Beginner - Dance\`, which holds 13 of 17 assignments and ZERO enrolments, so removing all thirteen changed nothing`,
);
check(
  between(constructed, "RESTORED") === "17",
  `PT20-3d …and the construction left NOTHING behind: ${between(constructed, "RESTORED")} active assignments after ROLLBACK, the count it started at`,
);
const asParent = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(PARENT)}', true);
SELECT 'PROWS<' || pg_catalog.count(*) || '>' FROM public.report_list_trainer_students();
ROLLBACK;`);
check(
  between(asParent, "PROWS") === "0",
  `PT20-3e ⛔ a PARENT holding the same grant reads ${between(asParent, "PROWS")} rows — ⚠️ and the parent is a MEANINGFUL control here for a reason worth stating: through RLS the fixture parent legitimately reads 8 \`students\` rows, so "the parent sees fewer students" would prove nothing. **Through this function they see none**, because the trainer gate refuses them outright (\`Q-7\`: the refusal IS zero rows)`,
);

// ---------------------------------------------------------------------
// ⛔ PT20-4 -- THE `Level` COLUMN, REFUSED AT THREE LAYERS.
// ---------------------------------------------------------------------
/* ⚠️ BOUNDED TO THE `$$` BODY — the `PT19-4` defect: an end-of-file slice
   sweeps in the migration's own assertions, which NAME the forbidden tokens
   in order to prove their absence, and the check then reads the proof of the
   prohibition as a breach of it. */
const bodyStart = sql.indexOf("$$", sql.indexOf("CREATE OR REPLACE FUNCTION public.report_list_trainer_students"));
const body = sql.slice(bodyStart, sql.indexOf("$$", bodyStart + 2));
check(
  !/\br\.rating\b|competency_rating|competency_score|\bband\b|\bscore\b/i.test(stripComments(body)),
  "PT20-4 ⛔ LAYER 1, THE SQL: the body selects no rating, band or score",
);
check(
  /EXISTS \(\s*SELECT 1 FROM public\.observation_ratings/.test(body),
  "PT20-4a ⚠️ …and the ratings table is reached ONLY as an EXISTENCE semi-join — ▶ \"an assessment happened on this date\" is not \"the assessment said X\", and an observation row with no ratings saved must not be dated as assessed",
);
const contracts = read("lib/frontend/contracts/physical-test.ts");
const dtoStart = contracts.indexOf("export type TrainerStudentRowDto");
/* ⚠️ BOUNDED AT THE FIRST COLUMN-ZERO `};` — the `PS-8` defect. */
const dtoBody = contracts.slice(dtoStart, contracts.indexOf("\n};", dtoStart));
check(
  dtoStart > 0 && dtoBody.length < 800 && !/rating|level|band|score|mastery/i.test(stripComments(dtoBody)),
  `PT20-4b ⛔ LAYER 2, THE DTO: no rating, level, band or score field over ${dtoBody.length} bounded chars`,
);
const screen = read("features/trainer/trainer-students-screen.tsx");
const stripped = stripComments(screen);
const DISCLOSURE = /<p className="text-\[11\.5px\] leading-5 text-ink">[\s\S]*?<\/p>/g;
const disclosures = stripped.match(DISCLOSURE) ?? [];
const rendered = stripped.replace(DISCLOSURE, "");
check(
  disclosures.length === 1,
  `PT20-4c ⚠️ the on-page disclosure is IDENTIFIED AND SET ASIDE before any prohibition is scanned (${disclosures.length}) — ▶ §12.12 REQUIRES that sentence, and a prohibition scanned over a page obliged to describe the prohibition fires on its own compliance (\`PT19-6\`)`,
);
check(
  ratingLeaks(rendered).length === 0 && !/>\s*Level\s*</.test(rendered),
  `PT20-4d ⛔ LAYER 3, THE SCREEN: no rating vocabulary and no \`Level\` heading (${ratingLeaks(rendered).map((l) => l.term).join(",") || "none"}) — **absent, not empty**: no heading, no cell, no dash, no softened replacement`,
);

// ---------------------------------------------------------------------
// ⚠️ PT20-5 -- THE PROHIBITIONS REFUSE SOMETHING THAT EXISTS.
// ---------------------------------------------------------------------
const frameHtml = read("UI_REFERENCE_FINAL_MVP/reference/Trainer - Students/Trainer - Students.html");
const drawn = ["Mastering", "Developing", "Mastered", "Beginning", "Level", "ID 2025-113"].map(
  (t) => `${t}:${frameHtml.split(t).length - 1}`,
);
check(
  drawn.every((d) => !d.endsWith(":0")),
  `PT20-5 ⚠️ THE FRAME REALLY DRAWS ALL SIX — [${drawn.join(", ")}] in the pack's \`.html\` — ▶ so the refusals above refuse something that EXISTS, rather than passing because nobody proposed it (the \`PS-7c\` lesson)`,
);
check(
  /GC-7/.test(read("UI_REFERENCE_FINAL_MVP/04-trainer-students/implementation-notes.md")),
  "PT20-5a …and `GC-7` is recorded in this pack's OWN notes, so the refusal is the pack's, not this phase's opinion of the frame",
);

// ---------------------------------------------------------------------
// ⚠️ PT20-6 -- `ID 2025-113` HAS NO COLUMN: CITED, NOT INVENTED.
// ---------------------------------------------------------------------
const studentCols = psql(`
SELECT 'COLS<' || string_agg(column_name, ',' ORDER BY ordinal_position) || '>'
  FROM information_schema.columns WHERE table_schema='public' AND table_name='students';`);
check(
  !/code|external|reference|roll|display_id/i.test(between(studentCols, "COLS")),
  `PT20-6 ⚠️ \`students\` holds NO external code column — measured: ${between(studentCols, "COLS")}`,
);
check(
  !/studentId\}/.test(rendered.replace(/key=\{[^}]*\}/g, "")),
  "PT20-6a ⛔ …and the UUID is NOT rendered in its place — that would put a governed internal identifier where the frame intends a human roll number, and would LOOK correct. **Cited, not disabled**",
);

// ---------------------------------------------------------------------
// ⚠️ PT20-7 -- DISTINCT LEARNERS, AND THE COMMENT IS NOT THE PROOF.
// ---------------------------------------------------------------------
const core = read("server/modules/class-session/trainer-students.ts");
check(
  /new Set\(rows\.map\(\(row\) => row\.studentId\)\)\.size/.test(core) && !/studentCount: rows\.length/.test(core),
  "PT20-7 ⚠️ the header count is DISTINCT LEARNERS, asserted as CODE not as a comment — ▶ `P2-19` shipped a comment claiming exactly this over code that summed instead, and a correct comment on incorrect code is worse than none because it stops the next reader looking",
);
check(
  /function initialsOf\(name: string\)/.test(core) && !/\[(i|index|idx)\]/.test(stripComments(core)),
  "PT20-7a ⚠️ initials are derived from the NAME, never a row index — `P2-8`'s defect, where a learner changed identity when the list reordered",
);

// ---------------------------------------------------------------------
// ✅ PT20-8 -- THE RAIL, THE ROUTE AND THE REGISTER.
// ---------------------------------------------------------------------
const nav = read("components/layout/portal-navigation.ts");
const item = nav.slice(nav.indexOf('href: "/trainer/students"'), nav.indexOf('href: "/trainer/schedule"'));
check(
  item.includes('label: "Students"') && /exact:\s*true/.test(item),
  "PT20-8 ✅ the trainer rail declares `Students`, `exact` on a MEASURED ground: screen `10` Trainer Student Report is at `/trainer/reports/[reportId]`, a child of Reports — nothing in the ratified 36 hangs under this route (`C2C-002`)",
);
const FILES = [
  "server/modules/class-session/trainer-students.ts",
  "features/trainer/trainer-students-screen.tsx",
  "app/(portals)/trainer/students/page.tsx",
];
check(FILES.every((f) => existsSync(join(ROOT, ...f.split("/")))), `PT20-8a all ${FILES.length} layers exist`);
check(
  /```artefact-read[\s\S]*?screen: 04/.test(read("UI_REFERENCE_FINAL_MVP/04-trainer-students/implementation-notes.md")),
  "PT20-8b ✅ and the artefact-read block exists — ⚠️ the FIRST phase for which it was REQUIRED rather than remembered: `AR-1b` shipped one phase earlier, so omitting it would have failed the run rather than waiting to be noticed",
);
const fixture = read("lib/frontend/fixtures/physical-test-fixture.ts");
check(
  /outcome: "unavailable"/.test(fixture.slice(fixture.indexOf("async readTrainerStudents"), fixture.indexOf("async readTrainerStudents") + 300)),
  "PT20-8c ⛔ the FIXTURE REFUSES — invented learner names on a trainer's own roster, and a manufactured `last assessed` date claiming an assessment happened, are both worse than an honest unavailable",
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
process.exit(bad === 0 ? 0 : 1);
