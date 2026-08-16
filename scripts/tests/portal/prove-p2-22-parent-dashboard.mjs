#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-22 -- screen `30` Parent Dashboard.
//
// ⛔ ONE FUNCTION AND ONE GRANT ADDED, UNDER THE BATCH. NAMED, NOT COUNTED:
//      · function  public.parent_get_child_trainer(uuid)
//      · grant     EXECUTE ON public.parent_get_child_trainer(uuid) TO authenticated
//    NO table, column, enum, policy, client table grant, write path or audit
//    string. `P22-1c` measures the rest of the census unmoved as the proof.
//
// ⛔ `Q-27` IS A DATA BOUNDARY AND IS ASSERTED AT FOUR LAYERS, because each
//    can widen without the others noticing: the DATABASE (a parent is refused
//    the rating tables at the GRANT layer), the FUNCTION's result type, the
//    DTO, and the rendered page.
//
// ⛔ THE ROUTE STOP WAS RULED (Operator, 2026-08-17, option 3): canonical
//    `/parent/dashboard`, `/parent` a compatibility redirect on the ratified
//    `R-B1` precedent, rail retargeted `Home` -> `Overview`. `P22-9` asserted
//    the route's ABSENCE while the stop was open and now asserts the RULED
//    SHAPE -- ▶ the leg was written to go red the moment the route shipped,
//    and it did, which is what brought it back to be rewritten.
//
// ⛔ Exit code is the only verdict.
//
// Run: npm run prove:portal-p2-22
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
const psqlAll = (sql) => {
  const r = spawnSync("docker", ["exec", "-i", DB_CONTAINER, "psql", "--no-psqlrc", "-U", "postgres", "-d", "postgres", "-tAX", "-c", sql], {
    encoding: "utf8",
  });
  return `${r.stdout ?? ""}\n${r.stderr ?? ""}`;
};
const between = (blob, key) => (blob.match(new RegExp(key + "<([^>]*)>")) ?? [])[1] ?? "";
const read = (rel) => readFileSync(join(ROOT, ...rel.split("/")), "utf8");

const PARENT = "d0000000-0000-4000-8000-000000000003";
const TRAINER = "d0000000-0000-4000-8000-000000000002";
const claims = (sub) => `{"sub":"${sub}","role":"authenticated"}`;
const MIGRATION = "20260817090000_portal_p2_22_parent_child_trainer.sql";

// ---------------------------------------------------------------------
// ⛔ P22-1 -- WHAT THIS PHASE ADDED, NAMED RATHER THAN COUNTED.
// ---------------------------------------------------------------------
const migrations = readdirSync(join(ROOT, "supabase", "migrations")).filter((f) => f.endsWith(".sql"));
const sql = read(`supabase/migrations/${MIGRATION}`);
const declared = [...sql.matchAll(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+public\.([a-z0-9_]+)/gi)].map((m) => m[1]);
const grants = [...sql.matchAll(/GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.([a-z0-9_]+)[^;]*TO\s+([a-z_]+)/gi)].map(
  (m) => `${m[1]}=>${m[2]}`,
);
check(
  migrations.filter((f) => /p2_22/i.test(f)).length === 1 && declared.length === 1 && declared[0] === "parent_get_child_trainer",
  `P22-1 ⛔ ONE migration, ONE function: [${declared.join(",") || "none"}]`,
);
check(
  grants.length === 1 && grants[0] === "parent_get_child_trainer=>authenticated",
  `P22-1a ⛔ ONE grant: [${grants.join(",") || "none"}]`,
);
check(
  !/CREATE\s+TABLE|ALTER\s+TABLE|CREATE\s+TYPE|ALTER\s+TYPE|CREATE\s+POLICY|GRANT\s+(SELECT|INSERT|UPDATE|DELETE)/i.test(sql),
  "P22-1b ⛔ and the file declares NO table, column, enum, policy or client table grant — read off the file, not off a summary of it",
);
const census = psql(`
SELECT 'C<T=' || (SELECT pg_catalog.count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE')
    || ' E=' || (SELECT pg_catalog.count(DISTINCT t.typname) FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typtype='e')
    || ' P=' || (SELECT pg_catalog.count(*) FROM pg_catalog.pg_policies WHERE schemaname='public')
    || ' R=' || (SELECT pg_catalog.array_length(public.audit_action_registry(),1))
    || ' F=' || (SELECT pg_catalog.count(*) FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public') || '>';`);
check(
  between(census, "C") === "T=30 E=12 P=30 R=24 F=74",
  `P22-1c census: everything unmoved EXCEPT the function count, which moved by exactly one (73 -> 74): ${between(census, "C")}`,
);

// ---------------------------------------------------------------------
// ⛔ P22-2 -- SECURITY POSTURE AND THE PINNED RESULT TYPE.
// ---------------------------------------------------------------------
const posture = psql(`
SELECT 'POSTURE<' || p.prosecdef::text || '|' || p.provolatile::text || '|' || coalesce(array_to_string(p.proconfig,','),'none') || '>'
  FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname='parent_get_child_trainer';
SELECT 'LIVEGRANTS<' || coalesce(string_agg(g.grantee || ':' || g.privilege_type, ',' ORDER BY g.grantee),'none') || '>'
  FROM information_schema.role_routine_grants g
 WHERE g.routine_schema='public' AND g.routine_name='parent_get_child_trainer';
SELECT 'RESULT<' || pg_catalog.pg_get_function_result(p.oid) || '>'
  FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname='parent_get_child_trainer';
SELECT 'DEFS<' || pg_catalog.count(*) || '>' FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname='parent_get_child_trainer';`);
check(
  between(posture, "POSTURE") === 'true|s|search_path=""',
  `P22-2 ⛔ SECURITY DEFINER + STABLE + empty search_path: ${between(posture, "POSTURE")}`,
);
check(
  between(posture, "LIVEGRANTS") === "authenticated:EXECUTE,postgres:EXECUTE" && between(posture, "DEFS") === "1",
  `P22-2a ⛔ THE GRANT SET IS EXACT, NOT MERELY PRESENT — PostgreSQL grants EXECUTE to PUBLIC by default on a new function, so a presence check passes with PUBLIC beside authenticated: ${between(posture, "LIVEGRANTS")} / ${between(posture, "DEFS")} definition(s), no overload`,
);
check(
  between(posture, "RESULT") === "TABLE(trainer_display_name text)",
  `P22-2b ⛔ LAYER 2 OF Q-27: the result type is ONE text column, pinned string-for-string — ▶ a widened projection is exactly how a rating column would arrive later: ${between(posture, "RESULT")}`,
);

// ---------------------------------------------------------------------
// ⛔ P22-3 -- Q-27 LAYER 1, THE DATABASE ITSELF.
// ⚠️ THE STRONGEST LEG IN THIS SUITE, AND IT IS NOT MINE: a parent is refused
//    the rating tables at the GRANT layer, so the boundary holds even against
//    application code that asked for a rating on purpose.
// ---------------------------------------------------------------------
const ratingReach = psqlAll(`
BEGIN; SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(PARENT)}', true);
SELECT pg_catalog.count(*) FROM public.observation_ratings;
ROLLBACK;`);
const ratingReach2 = psqlAll(`
BEGIN; SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(PARENT)}', true);
SELECT pg_catalog.count(*) FROM public.report_version_ratings;
ROLLBACK;`);
check(
  /permission denied for table observation_ratings/.test(ratingReach) &&
    /permission denied for table report_version_ratings/.test(ratingReach2),
  "P22-3 ⛔ LAYER 1: a PARENT session is refused BOTH rating tables with `permission denied for table` — a GRANT-layer refusal, not an RLS filter that returns zero rows. ▶ The nine ratings cannot reach a Parent session even if this application asked for them (Q-27)",
);
/*
 * ⚠️ BOUNDED TO THE `$` BODY, AND THE FIRST DRAFT WAS NOT.
 *
 * It scanned `stripComments(sql)` — but `stripComments` removes JAVASCRIPT
 * comments (`//`, `/* *\/`) and SQL uses `--`. ▶ So the whole migration's
 * PROSE stayed in the subject, and the file's own explanation of why it
 * carries no rating was read as it carrying one. **§12.13's shape: the check
 * fired on the documentation of its own compliance.**
 */
const fnBody = sql.slice(sql.indexOf("AS $"), sql.indexOf("$;"));
const sqlCode = fnBody.replace(/--[^\n]*/g, " ").replace(/\/\*[\s\S]*?\*\//g, " ");
check(
  sqlCode.length > 200 && !/observation_ratings|report_version_ratings|competency_rating|\brating\b/i.test(sqlCode),
  `P22-3a …and the function BODY — ${sqlCode.length} chars with SQL comments stripped, not JS ones — names no rating table, type or column`,
);

// ---------------------------------------------------------------------
// ⛔ P22-4 -- EXECUTED AS A REAL PARENT, NON-VACUOUS IN BOTH DIRECTIONS.
// ---------------------------------------------------------------------
const asParent = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(PARENT)}', true);
SELECT 'CHILDREN<' || pg_catalog.count(*) || '>' FROM public.students;
SELECT 'WITH<' || pg_catalog.count(*) || '>' FROM public.students s, LATERAL public.parent_get_child_trainer(s.id) t;
SELECT 'NAMES<' || coalesce(string_agg(DISTINCT t.trainer_display_name, ','), 'none') || '>' FROM public.students s, LATERAL public.parent_get_child_trainer(s.id) t;
ROLLBACK;`);
const children = Number(between(asParent, "CHILDREN"));
const withTrainer = Number(between(asParent, "WITH"));
check(
  children > 1 && withTrainer > 0 && withTrainer < children,
  `P22-4 ⛔ THE FUNCTION RUNS FOR A REAL PARENT AND IS NON-VACUOUS IN BOTH DIRECTIONS: ${withTrainer} of ${children} linked children resolve a trainer — ▶ a fixture where every child resolved one would prove nothing about the omitted row, and one where none did would prove nothing about the trainer`,
);
check(
  between(asParent, "NAMES") !== "none" && !/^\s*$/.test(between(asParent, "NAMES")),
  `P22-4a …and the name is a real account display name, not an empty string: [${between(asParent, "NAMES")}]`,
);

// ---------------------------------------------------------------------
// ⛔ P22-5 -- THE GATE, CONSTRUCTED. A REFUSAL IS ZERO ROWS.
// ⚠️ THE POSITIVE LEG CANNOT SHOW THIS: the parent reads only their own
//    children through RLS anyway, so passing a reachable id proves nothing
//    about the gate. The divergence is manufactured.
// ---------------------------------------------------------------------
const unreachable = psql(`
SELECT 'OTHER<' || s.id || '>' FROM public.students s
 WHERE NOT EXISTS (
   SELECT 1 FROM public.parent_student_links l
     JOIN public.centre_memberships m ON m.id = l.parent_membership_id
     JOIN public.accounts a ON a.id = m.account_id
    WHERE l.student_id = s.id AND l.is_active AND a.auth_user_id = '${PARENT}')
 ORDER BY s.id LIMIT 1;`);
const otherId = between(unreachable, "OTHER");
const gate = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(PARENT)}', true);
SELECT 'DENIED<' || pg_catalog.count(*) || '>' FROM public.parent_get_child_trainer('${otherId}');
ROLLBACK;
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(TRAINER)}', true);
SELECT 'TRAINER_ROWS<' || pg_catalog.count(*) || '>' FROM public.parent_get_child_trainer('${otherId}');
ROLLBACK;`);
check(
  otherId.length === 36 && between(gate, "DENIED") === "0",
  `P22-5 ⛔ CONSTRUCTED: a real student this parent has NO live link to (${otherId.slice(0, 8)}…) returns ${between(gate, "DENIED")} rows — ▶ the refusal IS zero rows (Q-7), never an error and never a partial answer`,
);
check(
  between(gate, "TRAINER_ROWS") === "0",
  `P22-5a …and a TRAINER holding the same grant reads ${between(gate, "TRAINER_ROWS")} rows through this function — the parent gate refuses every other role outright`,
);

// ---------------------------------------------------------------------
// ⛔ P22-6 -- §12.10: FIVE OF THE SIX PROFILE ROWS NEEDED NOTHING.
// ---------------------------------------------------------------------
const reach = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(PARENT)}', true);
SELECT 'RLS<students=' || (SELECT pg_catalog.count(*) FROM public.students)
    || ' enrolments=' || (SELECT pg_catalog.count(*) FROM public.enrolments)
    || ' modules=' || (SELECT pg_catalog.count(*) FROM public.class_modules)
    || ' grades=' || (SELECT pg_catalog.count(*) FROM public.class_grades)
    || ' sessions=' || (SELECT pg_catalog.count(*) FROM public.class_sessions)
    || ' assignments=' || (SELECT pg_catalog.count(*) FROM public.class_session_assignments)
    || ' trainer_profiles=' || (SELECT pg_catalog.count(*) FROM public.trainer_profiles) || '>';
ROLLBACK;`);
const rls = between(reach, "RLS");
check(
  /students=[1-9]/.test(rls) && /enrolments=[1-9]/.test(rls) && /grades=[1-9]/.test(rls) && /sessions=[1-9]/.test(rls),
  `P22-6 ⚠️ §12.10 MEASURED: the parent already reaches everything Profile Details needs EXCEPT one row — ${rls}`,
);
check(
  /assignments=0/.test(rls) && /trainer_profiles=0/.test(rls),
  `P22-6a ⛔ …and the Trainer row is the ONE that was genuinely unreachable — ${rls.match(/assignments=\d+ trainer_profiles=\d+/)?.[0]} — ▶ which is why this phase added a function for that row and nothing else`,
);
const dobFill = psql(`
SELECT 'FILL<dob=' || pg_catalog.count(*) FILTER (WHERE date_of_birth IS NOT NULL)
    || ' guardian=' || pg_catalog.count(*) FILTER (WHERE guardian_name IS NOT NULL)
    || ' contact=' || pg_catalog.count(*) FILTER (WHERE guardian_contact IS NOT NULL)
    || ' of=' || pg_catalog.count(*) || '>' FROM public.students;`);
check(
  between(dobFill, "FILL") === "dob=0 guardian=0 contact=0 of=13",
  `P22-6b ⚠️ THE THREE C-14 COLUMNS ARE EMPTY ON EVERY FIXTURE ROW — ${between(dobFill, "FILL")} — ▶ so three Profile Details rows are OMITTED on every child today. A FIXTURE fact, asserted so that filling one turns this leg red and the next reader learns the emptiness was never a defect`,
);

// ---------------------------------------------------------------------
// ⛔ P22-7 -- Q-27 LAYERS 3 AND 4: THE DTO AND THE PAGE.
// ---------------------------------------------------------------------
const contracts = read("lib/frontend/contracts/physical-test.ts");
const dtoStart = contracts.indexOf("export type ParentChildDto");
/* ⚠️ BOUNDED AT THE FIRST COLUMN-ZERO `};` — the `PS-8` defect. The length
   floor is the `PT21-6` lesson: an EMPTY slice satisfies every prohibition
   scanned over it, so a vanished DTO would read exactly like a clean one. */
const dtoBody = contracts.slice(dtoStart, contracts.indexOf("\n};", dtoStart));
/*
 * ⚠️ THE FIELD LIST IS ASSERTED, NOT A CHARACTER FLOOR — and the first draft
 * used a floor of 400 against a declaration that measures 394. It went red on
 * a correct DTO.
 *
 * ▶ The floor was there to catch a slice that ended EARLY (the `PT21-6`
 * lesson: an empty string satisfies every prohibition scanned over it). But a
 * guessed number measures nothing about completeness — **naming the eight
 * fields does**, and it also fails if a field is silently dropped, which a
 * length check never would.
 */
const EXPECTED_FIELDS = [
  "studentId", "studentName", "classLabel", "dateOfBirth",
  "guardianName", "guardianContact", "enrolledAt", "trainerDisplayName", "sessions",
];
const missingFields = EXPECTED_FIELDS.filter((f) => !new RegExp(`readonly ${f}\\??:`).test(dtoBody));
check(
  dtoStart > 0 &&
    missingFields.length === 0 &&
    !/rating|level|band|score|mastery|skill/i.test(stripComments(dtoBody)),
  `P22-7 ⛔ LAYER 3, THE DTO: all ${EXPECTED_FIELDS.length} expected fields present (missing: ${missingFields.join(", ") || "none"}) and NO rating, level, band, score, mastery or skill field, over ${dtoBody.length} bounded chars`,
);
const screen = read("features/parent/parent-dashboard-screen.tsx");
const stripped = stripComments(screen);
/* ⚠️ The class attribute may carry layout utilities BEFORE the type ones
     (`mt-4 text-[11px] …`); the first draft anchored on the exact string and
     matched only one of the two blocks. */
const DISCLOSURE = /<p className="[^"]*text-\[11px\][^"]*">[\s\S]*?<\/p>/g;
const disclosures = stripped.match(DISCLOSURE) ?? [];
const rendered = stripped.replace(DISCLOSURE, "");
check(
  disclosures.length === 2,
  `P22-7a ⚠️ the two on-page prose blocks are IDENTIFIED AND SET ASIDE before any prohibition is scanned (${disclosures.length}) — ▶ §12.12 requires the refusal disclosure, and a prohibition scanned over a page obliged to describe the prohibition fires on its own compliance`,
);
check(
  ratingLeaks(rendered).length === 0 && !/This Term|Skills/.test(rendered),
  `P22-7b ⛔ LAYER 4, THE PAGE: no rating vocabulary and no "This Term's Skills" title (${ratingLeaks(rendered).map((l) => l.term).join(",") || "none"}) — the COMPLETE card is absent: no title, no nine labels, no bars, no container`,
);
const NINE = ["Body", "Eye contact", "Emotion", "Speech", "Tonality", "Vocal projection", "Emotional expression", "Sentence flow", "Audience awareness"];
const leaked = NINE.filter((d) => new RegExp(`>\\s*${d}\\s*<|"${d}"`).test(rendered));
check(
  leaked.length === 0,
  `P22-7c ⛔ …and NOT ONE of the nine dimension labels appears as rendered text (${leaked.join(", ") || "none"}) — asserted by NAME rather than by a generic detector, because Q-27 removes these nine specifically`,
);
/*
 * ⚠️ THE FIRST DRAFT MATCHED `/progress/i` AND WENT RED ON THE PAGE TITLE.
 * The frame's own heading is "Alicia's Progress"; the word is the screen's
 * SUBJECT, not a bar. ▶ A false red on correct code is not the safe direction
 * merely because it is loud — it is how a gate stops being read (§12.13,
 * §12.18). The detector now names the SHAPES a bar actually takes.
 */
const BAR_SHAPES = /role="progressbar"|<progress|<meter|aria-valuenow|style=\{\{[^}]*width|w-\[\$\{|ProgressBar|RatingBar/;
check(
  !BAR_SHAPES.test(rendered),
  "P22-7d ⛔ …and no bar, meter or computed-width element survives — `rendering empty bars` and `collapsing the values while keeping the container` are both named as non-compliance, so the SHAPE is refused as well as the values",
);

// ---------------------------------------------------------------------
// ⚠️ P22-8 -- THE PROHIBITIONS REFUSE SOMETHING THAT EXISTS.
// ---------------------------------------------------------------------
const frameHtml = read("UI_REFERENCE_FINAL_MVP/reference/Parent - Dashboard/Parent - Dashboard.html");
const drawn = ["This Term", "Body", "Audience awareness", "Junior", "Grade 7", "Parent–Teacher", "Trainer"].map(
  (t) => `${t}:${frameHtml.split(t).length - 1}`,
);
check(
  drawn.every((d) => !d.endsWith(":0")),
  `P22-8 ⚠️ THE FRAME REALLY DRAWS ALL SEVEN — [${drawn.join(", ")}] in the pack's .html — ▶ so the refusals above refuse something that EXISTS rather than passing because nobody proposed it (the PS-7c lesson)`,
);
check(
  !/Junior|Grade 7|Parent–Teacher|Parent-Teacher/.test(rendered),
  "P22-8a ⛔ and NONE of them is rendered: `Junior` and `Grade 7` are not ratified Class Grades (A-016, A-054), and `Parent–Teacher Meeting` is a SECOND EVENT ENTITY beside the class session — GC-13's family, refused by A-016",
);
const notes = read("UI_REFERENCE_FINAL_MVP/30-parent-dashboard/implementation-notes.md");
check(
  /Q-27/.test(notes) && /DO_NOT_IMPLEMENT/.test(notes),
  "P22-8b …and Q-27 is recorded in this pack's OWN register as `DO_NOT_IMPLEMENT`, so the omission is the ruling's, not this phase's reading of the frame",
);
const packNote = read("UI_REFERENCE_FINAL_MVP/reference/Parent - Dashboard/Parent - Dashboard.md");
check(
  /Trainer Assistant \(TA\)/.test(packNote) && frameHtml.split("Assist").length - 1 === 0 && !/Assist/.test(rendered),
  "P22-8c ⚠️ §7.4.1 MEASURED ON A LIVE DISAGREEMENT: the pack's PROSE NOTE claims Profile Details shows a `Trainer Assistant (TA)` row; the .html contains `Assist` ZERO times and the .png draws none. ▶ A note-derived build would have added a field A-014 prohibits — the exact failure §7.4.1 was written after",
);

// ---------------------------------------------------------------------
// ⛔ P22-9 -- THE ROUTE IS NOT BUILT, AND THAT IS ASSERTED.
// ⚠️ A stated stop that no gate measures is indistinguishable from an
//    omission nobody noticed. This leg goes RED the moment the route ships,
//    which is the reminder to come back and remove it.
// ---------------------------------------------------------------------
const routePage = read("app/(portals)/parent/dashboard/page.tsx");
const entryPage = read("app/(portals)/parent/page.tsx");
const nav = stripComments(read("components/layout/portal-navigation.ts"));
const parentRail = nav.slice(nav.indexOf("parent: {"), nav.indexOf("parent: {") + 420);
check(
  /<ParentDashboardScreen \/>/.test(routePage),
  "P22-9 ✅ THE CANONICAL ROUTE /parent/dashboard RENDERS SCREEN 30 — the stop stated at plan §57.6 was RULED option 3 on 2026-08-17",
);
check(
  /redirect\("\/parent\/dashboard"\)/.test(entryPage) && !/<Parent/.test(entryPage),
  "P22-9a ⛔ …and /parent is a COMPATIBILITY REDIRECT that renders nothing — R-B1's shape, the THIRD and LAST portal root after /trainer and /management. The file is deliberately NOT deleted: /parent is a destination delivered surfaces already link to",
);
check(
  /home: "\/parent\/dashboard"/.test(parentRail) &&
    /href: "\/parent\/dashboard", label: "Overview"/.test(parentRail) &&
    !/href: "\/parent",/.test(parentRail),
  "P22-9b ⛔ AND THE RAIL MOVED WITH IT, WHICH IS THE RULING'S OWN REASON — portal home and the first item both name the DESTINATION. ▶ Leaving the rail at /parent while the screen lives elsewhere would manufacture EXACTLY the navigation dead end P2-21 closed one phase earlier: an item naming one surface and reaching another",
);
/*
 * ✅ THE ORPHANED COPY WAS RULED AND REHOUSED — 2026-08-17.
 *
 * This leg was written to pin an OPEN situation: `/parent` used to render
 * `features/parent/parent-dashboard.tsx`, the R-10 availability card, and the
 * route ruling left that Operator-ruled copy rendered by no route. ▶ **It went
 * red the moment the move landed — by throwing `ENOENT` on a file that no
 * longer exists — which is exactly the reminder it was written to be.**
 *
 * The Operator ruled the destination: screen `32`, the reports list, *"because
 * the state is 'do you have reports yet', and that is where a parent asks the
 * question."* The copy is preserved **VERBATIM** — rehoused, not re-decided.
 *
 * ⚠️ THE PIN NOW POINTS AT `32`, which is what it must pin: the ruled strings
 * living on a surface that SHIPS. It reds again if either branch is reworded.
 */
const host = read("features/parent/parent-reports-list.tsx");
const RULED_COPY = [
  "No report published yet",
  "No learner linked to this account yet",
  "Nothing is wrong and there is nothing to retry",
  "Your centre’s management links a learner to your account.",
];
const missingCopy = RULED_COPY.filter((c) => !host.includes(c));
check(
  missingCopy.length === 0 && !existsSync(join(ROOT, "features", "parent", "parent-dashboard.tsx")),
  `P22-9c ✅ THE RULED THREE-STATE COPY NOW LIVES ON SCREEN 32 (missing: ${missingCopy.join(" | ") || "none"}) and the orphaned host is gone. ⚠️ VERBATIM, NOT REWRITTEN — it was Operator-ruled once and this pass rehoused it; \`prove:hero-13\` was RETARGETED rather than rewritten for the same reason, so a changed word still reds`,
);
check(
  /*
   * ⚠️ FIFTH FALSE RED OF THIS FAMILY, AND THE SAME ROOT AS THE OTHER FOUR:
   * this leg first matched `/availabilityState\)/` — a shape the source never
   * takes, because the value is read as `: availabilityState;`. ▶ The detector
   * was written against the CONCEPT ("the component holds the state") and run
   * against the TEXT. It now names the two expressions that actually carry the
   * governed behaviour.
   */
  /getParentAvailability\(\)/.test(host) &&
    /availability\.outcome === "success" \? availability\.data : null/.test(host) &&
    /: availabilityState;/.test(host),
  "P22-9d ⛔ …and screen 32 reads the availability state ITSELF rather than inheriting a claim — ⚠️ a REJECTED availability read leaves it null and renders the neutral heading, never `none_yet`, because telling a parent no learner is linked to their account on the strength of a database fault is the exact defect `C-4d` closed server-side",
);

// ---------------------------------------------------------------------
// ✅ P22-10 -- THE LAYERS, THE FIXTURE AND THE REGISTER.
// ---------------------------------------------------------------------
const FILES = [
  "server/modules/parent-view/parent-dashboard-projections.ts",
  "features/parent/parent-dashboard-screen.tsx",
];
check(FILES.every((f) => existsSync(join(ROOT, ...f.split("/")))), `P22-10 all ${FILES.length} built layers exist`);
const core = read("server/modules/parent-view/parent-dashboard-projections.ts");
/* ⚠️ `stripComments` FIRST: this module DELIBERATELY names the removed helper
     in the comment explaining why it was removed, and the first draft read
     that record as the helper still being there. */
const coreCode = stripComments(core);
check(
  /readonly sessions: readonly ParentUpcomingSessionDto\[\];/.test(coreCode) && !/sessionsForChild/.test(coreCode),
  "P22-10a ⛔ SESSIONS ARE NESTED PER CHILD, NOT A FLAT ARRAY WITH A HELPER — the first draft carried `sessionsForChild(data, studentId)` that IGNORED its own studentId and returned everything; ▶ it would have shown one child's timetable under another child's name, on a screen whose whole subject is which child you are looking at",
);
/*
 * ⚠️ BOUNDED TO THE THREE EXPORTED DTOs, AND THE FIRST DRAFT WAS NOT — it
 * sliced from `ParentDashboardDto` to end-of-file, which sweeps in the
 * private ROW types (`EnrolmentRow`, `SessionRow`), whose `class_module_id`
 * is the database column they exist to describe. ▶ It reported a wider scope
 * than it named, which is as wrong when it passes.
 */
const dtoRegion = EXPECTED_FIELDS.length > 0
  ? coreCode.slice(coreCode.indexOf("export interface ParentChildDto"), coreCode.indexOf("type StudentRow"))
  : "";
check(
  dtoRegion.length > 200 && !/class_module_id/.test(dtoRegion),
  `P22-10b …and no module id travels in the exported DTOs (${dtoRegion.length} bounded chars) — a parent needs to know WHEN their child has class, not which internal module it hangs from`,
);
const fixture = read("lib/frontend/fixtures/physical-test-fixture.ts");
const slice = fixture.slice(fixture.indexOf("async readParentDashboard"), fixture.indexOf("async readParentDashboard") + 260);
check(
  /outcome: "unavailable"/.test(slice),
  "P22-10c ⛔ the FIXTURE REFUSES — invented values here are not a placeholder, they are a fabricated PERSONAL RECORD (date of birth, guardian, contact) about a named child",
);
check(
  /```artefact-read[\s\S]*?screen: 30/.test(notes),
  "P22-10d ✅ the artefact-read block exists and screen `30` left UNMEASURED by being BUILT under the rule, the only exit that list has",
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
process.exit(bad === 0 ? 0 : 1);
