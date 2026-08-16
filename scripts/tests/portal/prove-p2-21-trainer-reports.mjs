#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-21 -- screen `09` Trainer Reports.
//
// ⛔ ZERO FUNCTIONS AND ZERO GRANTS. NAMED AS AN EMPTY LIST, NOT AS A
//    COUNT OF ZERO: this phase added no function, no grant, no table, no
//    column, no enum, no policy, no client table grant, no write path and
//    no audit string. §12.10 for the EIGHTH consecutive phase -- the row
//    already carried what the screen needed, and `PT21-1` measures that
//    at the catalogue rather than asserting it in prose.
//
// ⛔ THE PHASE EXISTS TO FIX `C2C-007`. `/trainer/reports` is screen `09`'s
//    canonical route and it answered only `?status=needs_edit`, returning
//    `unavailable` otherwise -- ▶ **the canonical route refused itself**.
//    `PT21-5` proves the branch, and proves the alias four live links
//    depend on is PRESERVED rather than moved.
//
// ⛔ TWO OF THE FRAME'S COLUMNS ARE REFUSED BY THIS PACK'S OWN REGISTER
//    (`GC-7` the `Level` column, `GC-8` the `In session`/`Draft` chips).
//    Asserted at THREE layers, because each can widen without the others
//    noticing: the function's RESULT TYPE, the DTO, and the rendered page.
//
// ⛔ Exit code is the only verdict.
//
// Run: npm run prove:portal-p2-21
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

// ---------------------------------------------------------------------
// ⛔ PT21-1 -- ZERO SCHEMA, MEASURED TWO WAYS.
// ⚠️ "No migration file" alone would be weak: a phase can move the
//    catalogue without adding a file to the migrations directory (a
//    `psql` run against the container does it). The census is the
//    independent leg.
// ---------------------------------------------------------------------
const migrations = readdirSync(join(ROOT, "supabase", "migrations")).filter((f) => f.endsWith(".sql"));
check(
  migrations.filter((f) => /p2_21/i.test(f)).length === 0,
  `PT21-1 ⛔ ZERO migration files for this phase, named as an empty list: [${migrations.filter((f) => /p2_21/i.test(f)).join(",") || "none"}]`,
);
const census = psql(`
SELECT 'CENSUS<T=' || (SELECT pg_catalog.count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE')
    || ' E=' || (SELECT pg_catalog.count(DISTINCT t.typname) FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typtype='e')
    || ' P=' || (SELECT pg_catalog.count(*) FROM pg_catalog.pg_policies WHERE schemaname='public')
    || ' R=' || (SELECT pg_catalog.array_length(public.audit_action_registry(),1))
    || ' F=' || (SELECT pg_catalog.count(*) FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public') || '>';`);
check(
  /*
   * ⚠️ RE-PINNED `F=74` -> `F=75` AT `P2-18`, WHICH ADDED EXACTLY ONE
   * read-side function (`trainer_list_session_materials`) under the same
   * batch authorization. ▶ SECOND CONSECUTIVE PHASE THIS PIN HAS CAUGHT,
   * which is the argument for putting the function count in it.
   *
   * ⚠️ PREVIOUSLY RE-PINNED `F=73` -> `F=74` AT `P2-22`, WHICH ADDED ONE
   * READ-SIDE FUNCTION — and the re-pin is the evidence, not the maintenance.
   *
   * ▶ **THIS LEG CAUGHT THE VERY NEXT PHASE, ONE PHASE AFTER IT WAS WRITTEN.**
   * The function count went into the pin because a read-side function is what
   * the standing batch PRE-AUTHORIZES, and therefore what a phase could add
   * without anyone noticing. It was not a hypothetical.
   */
  between(census, "CENSUS") === "T=30 E=12 P=30 R=24 F=75",
  `PT21-1a ⛔ …and the CATALOGUE is unmoved for THIS phase, functions INCLUDED: ${between(census, "CENSUS")} — ▶ the function count is in the pin deliberately, because a read-side function is exactly what this phase was PRE-AUTHORIZED to add and therefore exactly what an unmeasured phase could add without noticing`,
);

// ---------------------------------------------------------------------
// ⛔ PT21-2 -- THE FUNCTION IT REUSES ALREADY EXISTED, WITH THE SHAPE
//    THIS SCREEN NEEDS. §12.10 measured, not assumed.
// ---------------------------------------------------------------------
const posture = psql(`
SELECT 'POSTURE<' || p.prosecdef::text || '|' || p.provolatile::text || '|' || coalesce(array_to_string(p.proconfig,','),'none') || '>'
  FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname='report_list_trainer_reports';
SELECT 'LIVEGRANTS<' || coalesce(string_agg(g.grantee || ':' || g.privilege_type, ',' ORDER BY g.grantee),'none') || '>'
  FROM information_schema.role_routine_grants g
 WHERE g.routine_schema='public' AND g.routine_name='report_list_trainer_reports' AND g.grantee <> 'postgres';
SELECT 'RESULT<' || pg_catalog.pg_get_function_result(p.oid) || '>'
  FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname='report_list_trainer_reports';
SELECT 'ORIGIN<' || (SELECT pg_catalog.count(*) FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='report_list_trainer_reports') || '>';`);
check(
  between(posture, "POSTURE") === 'true|s|search_path=""',
  `PT21-2 ⛔ SECURITY DEFINER + STABLE + empty search_path: ${between(posture, "POSTURE")}`,
);
check(
  between(posture, "LIVEGRANTS") === "authenticated:EXECUTE" && between(posture, "ORIGIN") === "1",
  `PT21-2a ⛔ EXACTLY ONE live grant and EXACTLY ONE function of that name — not anon, not PUBLIC, and no OVERLOAD: ${between(posture, "LIVEGRANTS")} / ${between(posture, "ORIGIN")} definition(s)`,
);
check(
  between(posture, "RESULT") ===
    "TABLE(report_id uuid, class_session_id uuid, session_date date, student_id uuid, student_name text, class_label text, report_state report_status, updated_at timestamp with time zone)",
  `PT21-2b ⛔ LAYER 1 OF THE RATING REFUSAL, AND THE §12.10 EVIDENCE IN ONE: the result type is pinned string-for-string. It carries the eight columns this screen renders and NO rating column — ▶ so the frame's Level column has nothing to read even if a later component asked, and the phase genuinely did not need to widen anything: ${between(posture, "RESULT")}`,
);
const definedAt = migrations.filter((f) => /report_list_trainer_reports/.test(read(`supabase/migrations/${f}`)));
check(
  definedAt.length === 1 && /p2_19/i.test(definedAt[0]),
  `PT21-2c ⚠️ …and it was defined at an EARLIER phase, named: ${definedAt.join(",") || "none"} — ▶ "the row already carried it" is a claim about history, so it is read from the migration that made it, not from this phase's own notes`,
);

// ---------------------------------------------------------------------
// ⛔ PT21-3 -- EXECUTED AS A REAL TRAINER, AND REFUSED FOR A PARENT.
// ---------------------------------------------------------------------
const asTrainer = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(TRAINER)}', true);
SELECT 'ROWS<' || pg_catalog.count(*) || '>' FROM public.report_list_trainer_reports();
SELECT 'STATES<' || string_agg(DISTINCT report_state::text, ',' ORDER BY report_state::text) || '>' FROM public.report_list_trainer_reports();
SELECT 'LABELS<' || pg_catalog.count(DISTINCT class_label) || '>' FROM public.report_list_trainer_reports();
SELECT 'NAMED<' || pg_catalog.count(*) FILTER (WHERE student_name IS NOT NULL AND class_label LIKE '%·%') || '>' FROM public.report_list_trainer_reports();
ROLLBACK;`);
const rows = Number(between(asTrainer, "ROWS"));
const states = between(asTrainer, "STATES").split(",").filter(Boolean);
check(
  rows > 0 && between(asTrainer, "NAMED") === String(rows),
  `PT21-3 ⛔ THE FUNCTION RUNS FOR A REAL TRAINER: ${rows} report(s), every one carrying the learner name and the composed grade·module label the table renders`,
);
check(
  Number(between(asTrainer, "LABELS")) > 1,
  `PT21-3a ⚠️ …across ${between(asTrainer, "LABELS")} distinct class labels — ▶ the frame's "Filter by class" chips are non-vacuous: a single-label fixture would let a broken filter pass`,
);
const asParent = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(PARENT)}', true);
SELECT 'PROWS<' || pg_catalog.count(*) || '>' FROM public.report_list_trainer_reports();
ROLLBACK;`);
check(
  between(asParent, "PROWS") === "0",
  `PT21-3b ⛔ a PARENT holding the same grant reads ${between(asParent, "PROWS")} rows — the trainer gate refuses them outright (Q-7: the refusal IS zero rows)`,
);

// ---------------------------------------------------------------------
// ⛔ PT21-4 -- `GC-8`: THE STATUS CHIPS ARE THE REAL `A-036` STATES.
// ⚠️ NON-VACUITY IN BOTH DIRECTIONS. A fixture where every report sat in
//    one state would let a hard-coded chip pass; one where no state
//    repeated would let a per-row literal pass.
// ---------------------------------------------------------------------
const AUTHORIZED = [
  "incomplete",
  "observation_saved",
  "drafting",
  "draft_ready",
  "needs_edit",
  "trainer_approved",
  "approved",
  "submitted",
];
check(
  states.length > 1 && states.every((s) => AUTHORIZED.includes(s)),
  `PT21-4 ⛔ the states this screen renders are ${states.length} DISTINCT members of A-036's eight — [${states.join(", ")}] — ▶ the frame's "In session" and "Draft" are neither among them nor a renaming of them, which is what GC-8 refuses`,
);
const enumValues = psql(`
SELECT 'ENUM<' || string_agg(e.enumlabel, ',' ORDER BY e.enumsortorder) || '>'
  FROM pg_catalog.pg_enum e JOIN pg_catalog.pg_type t ON t.oid = e.enumtypid
 WHERE t.typname = 'report_status';`);
check(
  between(enumValues, "ENUM").split(",").length === 8 &&
    between(enumValues, "ENUM").split(",").every((v) => AUTHORIZED.includes(v)),
  `PT21-4a ⛔ …and the enum itself still holds EXACTLY A-036's eight, so this phase did not smuggle a ninth in to encode UI presence: ${between(enumValues, "ENUM")}`,
);

// ---------------------------------------------------------------------
// ⚠️ PT21-5 -- `C2C-007`: THE CANONICAL ROUTE ANSWERS, AND THE ALIAS
//    FOUR LIVE LINKS DEPEND ON IS PRESERVED RATHER THAN MOVED.
// ---------------------------------------------------------------------
const routeFile = read("features/trainer/trainer-reports-route.tsx");
const routeCode = stripComments(routeFile);
check(
  /searchParams\.get\("status"\) === "needs_edit"/.test(routeCode) &&
    /<ReturnedReportsQueue \/>/.test(routeCode) &&
    /<TrainerReportsScreen \/>/.test(routeCode),
  "PT21-5 ⛔ the canonical route BRANCHES: ?status=needs_edit keeps the returned-correction queue, and the bare route now renders screen 09 instead of returning unavailable",
);
check(
  !/role|claim|permission|isTrainer|membership/i.test(routeCode),
  "PT21-5a ⛔ …and the branch reads the QUERY ONLY — no role, claim, permission or membership is consulted here. A-045: a query parameter is presentation selection, never authority",
);
const ALIAS_LINKS = ["features/trainer/trainer-dashboard.tsx", "features/trainer/trainer-report-review.tsx"];
const aliasHits = ALIAS_LINKS.filter((f) => read(f).includes('/trainer/reports?status=needs_edit'));
check(
  aliasHits.length === 2,
  `PT21-5b ⚠️ …and BOTH live links into the alias still point at it (${aliasHits.length}/2) — ▶ the compatibility alias is the pack's own ratified shape, so preserving it is the requirement; a phase that "cleaned up" the query would have broken two working links to fix one`,
);
const queuePath = "features/trainer/returned-reports-queue.tsx";
check(
  existsSync(join(ROOT, ...queuePath.split("/"))),
  `PT21-5c ⚠️ …and the queue component is NOT deleted or moved (${queuePath}) — the fix adds a branch, it does not replace a working surface`,
);

// ---------------------------------------------------------------------
// ⛔ PT21-6 -- `GC-7`: THE `Level` COLUMN, REFUSED AT THE DTO AND THE PAGE.
//    (Layer 1, the result type, is `PT21-2b`.)
// ---------------------------------------------------------------------
const contracts = read("lib/frontend/contracts/physical-test.ts");
const dtoStart = contracts.indexOf("export type TrainerReportRowDto");
/*
 * ⚠️ BOUNDED AT THE FIRST COLUMN-ZERO `};` — the `PS-8` defect, and the
 * `prove:all` Finding-4 lesson one layer down: a slice that runs to the
 * next declaration measures a wider population than it names.
 *
 * ⛔ AND THE LENGTH FLOOR IS NOT DECORATION. The first draft looked for
 * `export interface`, found nothing, and `dtoStart` came back `-1` — which
 * made the slice EMPTY, and an empty string satisfies every prohibition
 * scanned over it. ▶ The leg went red only because `dtoStart > 0` was
 * asserted; without a floor, a vanished DTO reads exactly like a clean one.
 */
const dtoBody = contracts.slice(dtoStart, contracts.indexOf("\n};", dtoStart));
check(
  dtoStart > 0 && dtoBody.length > 400 && dtoBody.length < 1600 && !/rating|level|band|score|mastery/i.test(stripComments(dtoBody)),
  `PT21-6 ⛔ LAYER 2, THE DTO: no rating, level, band, score or mastery field over ${dtoBody.length} bounded chars — ▶ the refusal lives in the TYPE, so a component cannot render one by choosing to`,
);
const screen = read("features/trainer/trainer-reports-screen.tsx");
const stripped = stripComments(screen);
const DISCLOSURE = /<p className="text-\[11px\] leading-5 text-ink">[\s\S]*?<\/p>/g;
const disclosures = stripped.match(DISCLOSURE) ?? [];
const rendered = stripped.replace(DISCLOSURE, "");
check(
  disclosures.length === 1,
  `PT21-6a ⚠️ the on-page disclosure is IDENTIFIED AND SET ASIDE before any prohibition is scanned (${disclosures.length}) — ▶ §12.12 REQUIRES that sentence, and a prohibition scanned over a page obliged to describe the prohibition fires on its own compliance (PT19-6)`,
);
check(
  ratingLeaks(rendered).length === 0 && !/>\s*Level\s*</.test(rendered),
  `PT21-6b ⛔ LAYER 3, THE SCREEN: no rating vocabulary and no Level heading (${ratingLeaks(rendered).map((l) => l.term).join(",") || "none"}) — absent, not empty: no heading, no cell, no dash, no softened replacement`,
);
check(
  /In session|"Draft"|>Draft</.test(disclosures[0] ?? "") === false ||
    /<strong>In session<\/strong>/.test(disclosures[0] ?? ""),
  "PT21-6c ⚠️ …and where the disclosure names the refused chips it does so as PROSE inside the disclosure, which is the one place §12.12 requires them",
);

// ---------------------------------------------------------------------
// ⚠️ PT21-7 -- THE PROHIBITIONS REFUSE SOMETHING THAT EXISTS.
// ---------------------------------------------------------------------
const frameHtml = read("UI_REFERENCE_FINAL_MVP/reference/Trainer - Reports/Trainer - Reports.html");
const drawn = ["Mastering", "Developing", "Mastered", "Beginning", "Level", "In session", "Draft", "Junior"].map(
  (t) => `${t}:${frameHtml.split(t).length - 1}`,
);
check(
  drawn.every((d) => !d.endsWith(":0")),
  `PT21-7 ⚠️ THE FRAME REALLY DRAWS ALL EIGHT — [${drawn.join(", ")}] in the pack's .html — ▶ so the refusals above refuse something that EXISTS, rather than passing because nobody proposed it (the PS-7c lesson)`,
);
const notes = read("UI_REFERENCE_FINAL_MVP/09-trainer-reports/implementation-notes.md");
check(
  /GC-7/.test(notes) && /GC-8/.test(notes),
  "PT21-7a …and BOTH refusals are recorded in this pack's OWN register, so neither is this phase's opinion of the frame",
);
check(
  !/Junior/.test(rendered),
  "PT21-7b ⛔ and the frame's Junior chip label is NOT rendered — it is not a ratified Class Grade (A-016, A-054, whose three are Beginner/Intermediate/Advanced), so the chips are built from the rows' own labels and counts instead",
);

// ---------------------------------------------------------------------
// ⚠️ PT21-8 -- THE `Lesson` COLUMN IS BUILT AND MEASURABLY EMPTY.
// ⛔ RECORDED RATHER THAN DISCOVERED LATER. A column that renders nothing
//    on every row looks identical to a broken one, so the FIXTURE fact is
//    asserted here: if a session ever gains lesson data, this leg goes red
//    and the next reader learns the emptiness was never a defect.
// ---------------------------------------------------------------------
const lessons = psql(`
SELECT 'LESSONS<' || pg_catalog.count(*) FILTER (WHERE lesson_number IS NOT NULL OR lesson_title IS NOT NULL)
    || '/' || pg_catalog.count(*) || '>' FROM public.class_sessions;`);
check(
  between(lessons, "LESSONS") === "0/17",
  `PT21-8 ⚠️ ${between(lessons, "LESSONS")} sessions carry lesson data — ▶ the Lesson column is EMPTY ON EVERY ROW today, and that is a FIXTURE fact, not a defect: the columns exist, a trainer may read them, and screens 13, 15 and 25 read the same two`,
);
check(
  /lessonNumber === null && r\.lessonTitle === null/.test(stripped) && !/Lesson —|Lesson -|"Lesson TBC"/.test(stripped),
  "PT21-8a ⛔ …and the cell is OMITTED when both are null — hero 0B: never a dash, never a placeholder, never a fabricated number",
);
const core = read("server/modules/report-workflow/trainer-reports-projections.ts");
check(
  /if \(sessions\.ok\)/.test(core) && !/if \(!sessions\.ok\) return \{ ok: false \}/.test(core),
  "PT21-8b ⚠️ a REJECTED lesson read degrades to an empty map rather than failing the screen (Q-7) — ▶ correct here ONLY because the lesson line is omitted either way; were it a filled placeholder the two cases would have to be told apart, and that reasoning is in the source beside the code",
);

// ---------------------------------------------------------------------
// ⛔ PT21-9 -- THE VIEW LINK TARGETS A ROUTE THAT EXISTS. MEASURED.
// ⚠️ The frame's `View ›` points at screen `10`, whose canonical route is
//    `/trainer/reports/[reportId]` — and NO bare index page exists there.
//    Linking to the canonical route would have shipped a 404: the SAME
//    defect class as the `C2C-007` this phase exists to fix.
// ---------------------------------------------------------------------
const reportIdDir = join(ROOT, "app", "(portals)", "trainer", "reports", "[reportId]");
const subRoutes = readdirSync(reportIdDir);
check(
  !existsSync(join(reportIdDir, "page.tsx")) && subRoutes.includes("review"),
  `PT21-9 ⛔ MEASURED, NOT PREFERRED: [reportId] has NO page.tsx and carries [${subRoutes.join(", ")}] — ▶ so /trainer/reports/<id> is a 404 today and the View link must not point at it`,
);
check(
  /href=\{`\/trainer\/reports\/\$\{r\.reportId\}\/review`\}/.test(stripped),
  "PT21-9a …and the link targets /review, the sub-route that exists — ⚠️ building the index route would be building screen 10, which is not this phase. Recorded, not invented",
);

// ---------------------------------------------------------------------
// ✅ PT21-10 -- THE RAIL, THE LAYERS AND THE REGISTER.
// ---------------------------------------------------------------------
const nav = read("components/layout/portal-navigation.ts");
const navCode = stripComments(nav);
const item = navCode.slice(navCode.indexOf('href: "/trainer/reports"'), navCode.indexOf('href: "/trainer/reports"') + 260);
check(
  navCode.includes('href: "/trainer/reports"') && item.includes('label: "Reports"'),
  "PT21-10 ✅ the trainer rail points at the CANONICAL route and is labelled Reports — it read /trainer/reports?status=needs_edit and Returned reports, which named the alias as though it were the screen",
);
check(
  !/exact:\s*true/.test(item),
  "PT21-10a ✅ …and it is deliberately NOT exact: screen 10 lives at /trainer/reports/[reportId]/review, a genuine child of this route, so the rail item should stay lit while a trainer is inside a report (C2C-002)",
);
const FILES = [
  "server/modules/report-workflow/trainer-reports-projections.ts",
  "features/trainer/trainer-reports-screen.tsx",
  "features/trainer/trainer-reports-route.tsx",
  "app/(portals)/trainer/reports/page.tsx",
];
check(FILES.every((f) => existsSync(join(ROOT, ...f.split("/")))), `PT21-10b all ${FILES.length} layers exist`);
check(
  /```artefact-read[\s\S]*?screen: 09/.test(notes),
  "PT21-10c ✅ the artefact-read block exists — ⚠️ and screen 09 left the frozen PRE_GATE list to earn it, the only direction that list may move. It was exempt because its canonical ROUTE had shipped; what that route shipped was C2C-007",
);
const fixture = read("lib/frontend/fixtures/physical-test-fixture.ts");
const fixtureSlice = fixture.slice(fixture.indexOf("async readTrainerReports"), fixture.indexOf("async readTrainerReports") + 320);
check(
  /outcome: "unavailable"/.test(fixtureSlice),
  "PT21-10d ⛔ the FIXTURE REFUSES — invented learner names against invented report states, on a screen whose whole subject is which of A-036's states a report is in, would be worse than an honest unavailable",
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
process.exit(bad === 0 ? 0 : 1);
