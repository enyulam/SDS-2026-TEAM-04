#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-19 -- screen `01` Trainer Dashboard.
// ⛔ ONE FUNCTION AND ONE GRANT ADDED, UNDER THE BATCH. NAMED, NOT COUNTED:
//      · function  public.report_list_trainer_reports()
//      · grant     EXECUTE ON public.report_list_trainer_reports() TO authenticated
//    NO table, column, enum, policy, client table grant, write path or audit
//    string. `PT19-1b` measures the census UNMOVED as the proof of that.
//
// ⛔ TWO OF THE FRAME'S SIX REGIONS ARE REFUSED, AND BOTH REFUSALS ARE
//    DISCLOSED ON THE PAGE (§12.12):
//      1. `My Recent Report`'s rating chips AND its prose -- `GC-7` (the pack's
//         own `screen.md` §8: "Not rating-bearing ... DO NOT BUILD the rating
//         column") and, independently, `G-2` (one chip for a whole report is a
//         roll-up, on every surface).
//      2. `13:30 Staff Meeting` -- no such entity; `A-016` makes calendars
//         projections of class sessions, and a second event entity is the shape
//         `GC-13` barred on screen `25`.
//
// ⛔ Exit code is the only verdict.
//
// Run: npm run prove:portal-p2-19
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
   form silently truncated a live measurement to its first word and the check
   PASSED on the truncation. */
const between = (blob, key) => (blob.match(new RegExp(key + "<([^>]*)>")) ?? [])[1] ?? "";
const read = (rel) => readFileSync(join(ROOT, ...rel.split("/")), "utf8");

const TRAINER = "d0000000-0000-4000-8000-000000000002";
const PARENT = "d0000000-0000-4000-8000-000000000003";
const claims = (sub) => `{"sub":"${sub}","role":"authenticated"}`;
const MIGRATION = "20260816120000_portal_p2_19_trainer_reports.sql";

// ---------------------------------------------------------------------
// ⛔ PT19-1 -- WHAT THIS PHASE ADDED, NAMED RATHER THAN COUNTED.
// ---------------------------------------------------------------------
const migrations = readdirSync(join(ROOT, "supabase", "migrations")).filter((f) => f.endsWith(".sql"));
const mine = migrations.filter((f) => /p2_19/i.test(f));
const sql = read(`supabase/migrations/${MIGRATION}`);
const declared = [...sql.matchAll(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+public\.([a-z0-9_]+)/gi)].map((m) => m[1]);
const grants = [...sql.matchAll(/GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.([a-z0-9_]+)[^;]*TO\s+([a-z_]+)/gi)].map(
  (m) => `${m[1]}→${m[2]}`,
);
check(
  mine.length === 1 && declared.length === 1 && declared[0] === "report_list_trainer_reports",
  `PT19-1 ⛔ ONE migration, ONE function: [${declared.join(",") || "none"}] — the batch requires the LIST, not a count`,
);
check(
  grants.length === 1 && grants[0] === "report_list_trainer_reports→authenticated",
  `PT19-1a ⛔ ONE grant: [${grants.join(",") || "none"}]`,
);
check(
  !/CREATE\s+TABLE|ALTER\s+TABLE|CREATE\s+TYPE|ALTER\s+TYPE|CREATE\s+POLICY|GRANT\s+(SELECT|INSERT|UPDATE|DELETE)/i.test(
    sql,
  ),
  "PT19-1b ⛔ and the file declares NO table, column, enum, policy or client table grant — the batch's ceiling read off the file rather than off a summary of it",
);
const census = psql(`
SELECT 'T=' || (SELECT pg_catalog.count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE')
    || ' E=' || (SELECT pg_catalog.count(DISTINCT t.typname) FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typtype='e')
    || ' P=' || (SELECT pg_catalog.count(*) FROM pg_catalog.pg_policies WHERE schemaname='public')
    || ' R=' || (SELECT pg_catalog.array_length(public.audit_action_registry(),1));`);
check(
  census === "T=30 E=12 P=30 R=23",
  `PT19-1c census UNMOVED — ⚠️ INCLUDING THE AUDIT REGISTRY AT 23: this phase is a READ and emits no governed action, so `+
    `\`A-029\`'s one-event-per-action rule has nothing to register: ${census}`,
);

// ---------------------------------------------------------------------
// ⛔ PT19-2 -- SECURITY POSTURE, MEASURED FROM THE CATALOGUE.
// ---------------------------------------------------------------------
const posture = psql(`
SELECT 'POSTURE<' || p.prosecdef::text || '|' || p.provolatile::text || '|' || coalesce(array_to_string(p.proconfig,','),'none') || '>'
  FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname='report_list_trainer_reports';
SELECT 'LIVEGRANTS<' || coalesce(string_agg(g.grantee || ':' || g.privilege_type, ',' ORDER BY g.grantee),'none') || '>'
  FROM information_schema.role_routine_grants g
 WHERE g.routine_schema='public' AND g.routine_name='report_list_trainer_reports' AND g.grantee <> 'postgres';`);
check(
  between(posture, "POSTURE") === 'true|s|search_path=""',
  `PT19-2 ⛔ SECURITY DEFINER + STABLE + \`search_path = ''\`: ${between(posture, "POSTURE")} — ⚠️ \`s\` is STABLE, and \`P2-16\` is why it is asserted: a STABLE body that tries to \`CREATE\` is accepted by \`CREATE FUNCTION\` and fails only when a real caller reaches the statement`,
);
check(
  between(posture, "LIVEGRANTS") === "authenticated:EXECUTE",
  `PT19-2b ⛔ EXACTLY ONE live grant and it is not \`anon\` or \`PUBLIC\`: ${between(posture, "LIVEGRANTS")}`,
);

// ---------------------------------------------------------------------
// ⛔ PT19-3 -- EXECUTED AS A REAL TRAINER, PAST EVERY GATE.
// ⚠️ §26.1's ceiling: the migration's own `PK-6` calls this function as
//    `postgres`, where `app_current_account_id()` is NULL, so it returns at the
//    FIRST of two gates having proved resolution over about a tenth of the
//    body. THIS is the leg that reaches the joins and the projection.
// ---------------------------------------------------------------------
const asTrainer = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(TRAINER)}', true);
SELECT 'ROWS<' || pg_catalog.count(*) || '>' FROM public.report_list_trainer_reports();
SELECT 'STATES<' || string_agg(DISTINCT r.report_state::text, ',' ORDER BY r.report_state::text) || '>' FROM public.report_list_trainer_reports() r;
SELECT 'NAMED<' || pg_catalog.count(*) FILTER (WHERE r.student_name IS NOT NULL AND r.class_label IS NOT NULL) || '>' FROM public.report_list_trainer_reports() r;
ROLLBACK;`);
check(
  Number(between(asTrainer, "ROWS")) > 0 && between(asTrainer, "STATES").length > 0,
  `PT19-3 ⛔ THE FUNCTION RUNS FOR A REAL TRAINER, PAST BOTH GATES: ${between(asTrainer, "ROWS")} row(s), states [${between(asTrainer, "STATES")}]`,
);
check(
  between(asTrainer, "NAMED") === between(asTrainer, "ROWS"),
  `PT19-3a …and every row carries the learner and class labels the screen renders (${between(asTrainer, "NAMED")}/${between(asTrainer, "ROWS")}) — ▶ the joins past the gates are REACHED, not merely declared`,
);

// ---------------------------------------------------------------------
// ⛔ PT19-3b -- THE DISCRIMINATING NEGATIVE, AND WHY IT IS THE PARENT.
// ---------------------------------------------------------------------
const asParent = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(PARENT)}', true);
SELECT 'PROWS<' || pg_catalog.count(*) || '>' FROM public.report_list_trainer_reports();
ROLLBACK;`);
check(
  between(asParent, "PROWS") === "0",
  `PT19-3b ⛔ a PARENT holding the same grant reads ${between(asParent, "PROWS")} rows — ⚠️ the parent is the control deliberately: the fixture has ONE trainer holding all 17 assignments, so a trainer-vs-trainer comparison would pass while proving nothing (the \`PT-3b\` defect caught at \`P2-10\`). ▶ And \`Q-7\`: the refusal IS zero rows, not an error that would disclose that reports exist`,
);

// ---------------------------------------------------------------------
// ⚠️ PT19-3c -- THE ASSIGNMENT SCOPE, CONSTRUCTED (§12.15).
// ⛔ THE POSITIVE LEG ALONE PROVES NOTHING HERE, and saying so is the point:
//    the fixture's single trainer is assigned to EVERY session, so the function
//    returning all 12 reports is exactly what an UNSCOPED query would return.
//    ▶ The divergence has to be MANUFACTURED: deactivate one assignment inside
//    a transaction and the count must FALL. Rolled back; nothing persists.
// ---------------------------------------------------------------------
const constructed = psql(`
SELECT 'TOTAL<' || pg_catalog.count(*) || '>' FROM public.reports;
BEGIN;
UPDATE public.class_session_assignments a
   SET is_active = false, unassigned_at = now()
 WHERE a.class_session_id = (SELECT rp.class_session_id
                               FROM public.reports rp
                               JOIN public.class_session_assignments x
                                 ON x.class_session_id = rp.class_session_id AND x.is_active
                              ORDER BY rp.class_session_id LIMIT 1);
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(TRAINER)}', true);
SELECT 'AFTER<' || pg_catalog.count(*) || '>' FROM public.report_list_trainer_reports();
ROLLBACK;
SELECT 'RESTORED<' || pg_catalog.count(*) || '>' FROM public.class_session_assignments WHERE is_active;`);
const rows = Number(between(asTrainer, "ROWS"));
const after = Number(between(constructed, "AFTER"));
check(
  between(constructed, "TOTAL") === String(rows) && after > 0 && after < rows,
  `PT19-3c ⚠️ CONSTRUCTED: the trainer reads ${rows} of ${between(constructed, "TOTAL")} reports — IDENTICAL to the whole table, so the scope is invisible until it is forced. Deactivating ONE assignment drops the function to ${after}. ▶ The \`class_session_assignments\` join is LOAD-BEARING (\`A-016\`), proved by divergence rather than by agreement`,
);
check(
  between(constructed, "RESTORED") === "17",
  `PT19-3d …and the construction left NOTHING behind: ${between(constructed, "RESTORED")} active assignments after ROLLBACK, the count it started at`,
);

// ---------------------------------------------------------------------
// ⛔ PT19-4 -- NO PANEL, NOTE, HASH OR RATING CROSSES THE BOUNDARY.
// ⚠️ Asserted at THREE layers, because each can be widened without the others
//    noticing: the SQL body, the DTO, and the rendered screen.
// ---------------------------------------------------------------------
/*
 * ⚠️ BOUNDED TO THE `$$`-DELIMITED BODY, AND THE FIRST DRAFT WAS NOT.
 * Slicing to end-of-file swept in the migration's own assertion block — which
 * NAMES every forbidden column in order to prove the body omits them. ▶ The
 * check then read the PROOF OF THE PROHIBITION as a BREACH of it. Same family
 * as `PC16-8d` ("a refusal being explained is not the thing being refused"),
 * and as `PS-8`'s over-wide slice.
 */
const bodyStart = sql.indexOf("$$", sql.indexOf("CREATE OR REPLACE FUNCTION public.report_list_trainer_reports"));
const body = sql.slice(bodyStart, sql.indexOf("$$", bodyStart + 2));
const FORBIDDEN_COLS = [
  "overview",
  "strengths",
  "areas_for_development",
  "remarks",
  "content_hash",
  "wording_hash",
  "follow_up_notes",
  "trainer_notes",
  "rating",
];
const bodyHits = FORBIDDEN_COLS.filter((c) => new RegExp(`\\b${c}\\b`, "i").test(stripComments(body)));
check(
  bodyHits.length === 0,
  `PT19-4 ⛔ the SQL body names no panel, note, hash or rating column (${bodyHits.join(",") || "none"}) — ▶ refused by NOT BEING WRITTEN DOWN, which survives a column appearing upstream later`,
);
const contracts = read("lib/frontend/contracts/physical-test.ts");
const dtoStart = contracts.indexOf("export type TrainerRecentReportDto");
/* ⚠️ BOUNDED AT THE FIRST COLUMN-ZERO `};` — the `PS-8` defect: an unbounded
   slice read 4.7x what it named, and a check reporting a wider scope than it
   claims is as wrong when it passes. */
const dtoBody = contracts.slice(dtoStart, contracts.indexOf("\n};", dtoStart));
const dtoHits = FORBIDDEN_COLS.filter((c) => new RegExp(c.replace(/_/g, "[_]?"), "i").test(stripComments(dtoBody)));
check(
  dtoStart > 0 && dtoHits.length === 0 && dtoBody.length < 900,
  `PT19-4b ⛔ and the DTO carries none of them either, over ${dtoBody.length} bounded chars (${dtoHits.join(",") || "none"})`,
);

// ---------------------------------------------------------------------
// ⛔ PT19-5 -- `GC-7`: THE RATING CHIPS *AND* THE PROSE.
// ---------------------------------------------------------------------
const screen = read("features/trainer/trainer-dashboard-screen.tsx");
const stripped = stripComments(screen);
/*
 * ⛔ THE DISCLOSURE PARAGRAPHS ARE REMOVED BEFORE ANY PROHIBITION IS SCANNED.
 * §12.12 requires the refusal to be stated ON THE PAGE, and a prohibition
 * check that reads the page cannot then treat that sentence as the breach.
 * ▶ `PT19-6` failed exactly this way on its first run: "This design also lists
 * a staff meeting" tripped the ban on `Staff Meeting`. ⚠️ The stripper asserts
 * it removed BOTH, so it can never quietly become a no-op that hides a real row.
 */
const DISCLOSURE = /<p className="mt-3 text-\[11\.5px\] leading-5 text-ink">[\s\S]*?<\/p>/g;
const disclosures = stripped.match(DISCLOSURE) ?? [];
const rendered = stripped.replace(DISCLOSURE, "");
check(
  disclosures.length === 2,
  `PT19-4c ⚠️ the two on-page disclosures are IDENTIFIED AND SET ASIDE before any prohibition is scanned (${disclosures.length} found) — ▶ a stripper that matched nothing would silently turn every ban below into a scan of the whole file again`,
);
const leaks = ratingLeaks(rendered);
check(
  leaks.length === 0,
  `PT19-5 ⛔ NO rating vocabulary reaches the screen (${leaks.map((l) => l.term).join(",") || "none"}) — \`GC-7\`: the pack's own \`screen.md\` §8 says "Not rating-bearing ... DO NOT BUILD the rating column", and \`G-2\` bars a roll-up on every surface independently`,
);
/*
 * ⚠️ THE COMPANION THAT MAKES THE PROHIBITION NON-VACUOUS. A ban proves
 * nothing if the frame never drew the thing — the `PS-7c` lesson. Measured in
 * `reference/Trainer - Dashboard/Trainer - Dashboard.html`, the artefact that
 * carries values (§7.4.1): each of these appears ONCE there and ZERO times in
 * the build.
 */
const frameHtml = read("UI_REFERENCE_FINAL_MVP/reference/Trainer - Dashboard/Trainer - Dashboard.html");
const drawn = ["Mastered", "eye contact", "Staff Meeting", "Staff Room"].map(
  (t) => `${t}:${frameHtml.split(t).length - 1}`,
);
check(
  drawn.every((d) => !d.endsWith(":0")),
  `PT19-5b0 ⚠️ THE FRAME REALLY DRAWS ALL FOUR — [${drawn.join(", ")}] in the pack's \`.html\` — ▶ so the two bans below refuse something that EXISTS, rather than passing because nobody ever proposed it`,
);
check(
  !/Mastered|clear projection/i.test(rendered),
  "PT19-5b ⛔ AND THE PROSE FALLS WITH THE CHIPS — the frame's \"Mastered eye contact, clear projection\" is a rating attributed in words (`A-052`), leaking the same fact in a form a chip-shaped check would step straight over",
);
check(
  /Assessment ratings are\s*\n?\s*shown on a report, not on a summary list/.test(screen),
  "PT19-5c ⛔ and the omission is DISCLOSED WHERE THE OPERATOR READS (§12.12), not only in a comment — a refusal nobody can see on the page is indistinguishable from an oversight",
);

// ---------------------------------------------------------------------
// ⛔ PT19-6 -- THE STAFF-MEETING ROW: ABSENT, AND SAID SO.
// ---------------------------------------------------------------------
check(
  !/Staff Meeting|Staff Room/i.test(rendered),
  "PT19-6 ⛔ no `13:30 Staff Meeting · Staff Room` row — there is no staff-meeting entity, and `A-016` makes calendars PROJECTIONS of class sessions. Building it needs a second event entity, the exact shape `GC-13` barred on screen `25`",
);
check(
  /Only teaching sessions are recorded in this\s*\n?\s*system/.test(screen),
  "PT19-6b …disclosed on the page (§12.12)",
);

// ---------------------------------------------------------------------
// ⚠️ PT19-7 -- THE THREE KPI NUMBERS MEAN WHAT THEY SAY.
// ---------------------------------------------------------------------
const core = read("server/modules/report-workflow/trainer-dashboard.ts");
check(
  /function countDistinctLearners/.test(core) && !/studentCount\s*\+/.test(stripComments(core)),
  "PT19-7 ⚠️ `Total Students` counts DISTINCT learners rather than summing the per-class counts — ▶ a learner enrolled in two modules would otherwise be counted twice, and the comment saying so sat on code that summed until it was measured. A correct comment on incorrect code is worse than no comment",
);
check(
  /const PENDING = new Set\(\["draft_ready", "needs_edit"\]\)/.test(core),
  "PT19-7b ⚠️ `Pending Reviews` is exactly the two states awaiting THIS trainer — `draft_ready` and `needs_edit`. ⛔ NOT `trainer_approved`, which is with management, and NOT `submitted`, which is done: a KPI that counted those would tell a trainer they have work they do not have",
);
const pending = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(TRAINER)}', true);
SELECT 'PENDING<' || pg_catalog.count(*) FILTER (WHERE r.report_state IN ('draft_ready','needs_edit')) || '>' FROM public.report_list_trainer_reports() r;
ROLLBACK;`);
check(
  Number(between(pending, "PENDING")) > 0 && Number(between(pending, "PENDING")) < rows,
  `PT19-7c …and the count is NON-VACUOUS AND NOT THE WHOLE LIST: ${between(pending, "PENDING")} pending of ${rows} — ▶ a filter that happened to match everything would render the same number as no filter at all`,
);

// ---------------------------------------------------------------------
// ⚠️ PT19-8 -- THE CLOCK IS THE SERVER'S.
// ---------------------------------------------------------------------
check(
  /readTrainerDashboardCore\(client, new Date\(\)\.toISOString\(\)\)/.test(
    read("server/modules/integration-adapter/participant-actions.ts"),
  ),
  "PT19-8 ⚠️ `now` is resolved SERVER-SIDE — a browser-supplied clock would let the caller choose which session reads as \"Now\" and which month the calendar projects",
);
check(
  /isNow: r\.starts_at !== null && r\.ends_at !== null && r\.starts_at <= clock && clock < r\.ends_at/.test(core),
  "PT19-8b ⚠️ and \"Now\" is the row whose OWN WINDOW CONTAINS the clock — ⛔ NOT the first row, which is what the frame's single highlighted row invites: that would label a finished 08:00 class as in progress at 15:00. ▶ NULL on either bound yields `false`, so an unrecorded time is never silently \"now\" (hero `0B`)",
);

// ---------------------------------------------------------------------
// ✅ PT19-9 -- THE RAIL ITEM, AND `C2C-002` DECIDED RATHER THAN INHERITED.
// ---------------------------------------------------------------------
const nav = read("components/layout/portal-navigation.ts");
const item = nav.slice(nav.indexOf('href: "/trainer/dashboard"'), nav.indexOf('href: "/trainer/schedule"'));
check(
  item.includes('label: "Dashboard"') && /exact:\s*true/.test(item),
  "PT19-9 ✅ the trainer rail declares `Dashboard`, and it IS `exact` — ⚠️ the choice `C2C-002` punishes when made by habit, made here on a measured ground: the ratified 36 allocates no `/trainer/dashboard/*` screen, so there is no child for it to acquire",
);
/*
 * ⚠️ ASSERTED AS "CORRECTED", NOT AS "ABSENT", AND THE DIFFERENCE IS THE WHOLE
 * POINT. The annotate-never-delete method REQUIRES the superseded sentence to
 * be preserved inline, so a check demanding the phrase be gone would forbid the
 * very method it is meant to verify — and would be satisfied by DELETING the
 * history. ▶ Third instance in this suite of a check unable to tell a thing
 * from a statement about it; it went red on the first run for exactly that.
 */
const staleClaims = nav.split("Dashboard is a DEFERRED post-48-hour screen").length - 1;
check(
  staleClaims === 1 && /CORRECTED AT `P2-19`, 2026-08-16 \(§12\.11\)/.test(nav),
  `PT19-9b ✅ the rail's stale "screen \`01\` is deferred" comment was corrected in the SAME pass (§12.11) — ⛔ PRESERVED INLINE exactly once (${staleClaims}) and carrying its correction marker, rather than deleted: a check that demanded its ABSENCE would be satisfied by erasing the record`,
);
check(
  /home: "\/trainer\/schedule"/.test(nav),
  "PT19-9c ⛔ `home` is UNCHANGED at `/trainer/schedule` — screen `01` existing does not by itself decide where the portal LANDS, and `R-B1` ruled that route",
);

// ---------------------------------------------------------------------
// PT19-10 -- THE LAYERS SHIP, AND THE FIXTURE REFUSES RATHER THAN INVENTS.
// ---------------------------------------------------------------------
const FILES = [
  "server/modules/report-workflow/trainer-dashboard.ts",
  "features/trainer/trainer-dashboard-screen.tsx",
  "app/(portals)/trainer/dashboard/page.tsx",
];
check(FILES.every((f) => existsSync(join(ROOT, ...f.split("/")))), `PT19-10 all ${FILES.length} layers exist`);
const fixture = read("lib/frontend/fixtures/physical-test-fixture.ts");
const fixtureFn = fixture.slice(fixture.indexOf("async readTrainerDashboard"));
check(
  /outcome: "unavailable"/.test(fixtureFn.slice(0, 260)),
  "PT19-10b ⛔ the FIXTURE REFUSES rather than manufacturing a dashboard — a fabricated `Pending Reviews` would tell a trainer they have work they do not, which is the one number on this screen a person acts on",
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
process.exit(bad === 0 ? 0 : 1);
