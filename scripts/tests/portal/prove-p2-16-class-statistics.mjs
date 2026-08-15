#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-16 -- screen `16` Management Class Statistics. PARTIAL.
// ⛔ ZERO FUNCTIONS AND ZERO GRANTS ADDED, UNDER A BATCH THAT PERMITS THEM.
// =====================================================================
// ⚠️ §12.10 FOR THE SIXTH PHASE RUNNING. Two governed reads already shipped
//    answer everything this screen may show:
//    `report_class_health_summary` (built at `P2-4`) and
//    `report_list_management_class_status`. ▶ And reusing the first is
//    MANDATORY, not economical: `CLAUDE.md` §6 requires slot 1 to be "the
//    exact same computation ... never computed two different ways".
//
// ⛔ ALL THREE CARDS THE FRAME DRAWS ARE REFUSED (`GC-6` on `C-9` and `G-2`).
// ✅ AND TWO PANELS THE FRAME OMITS ARE BUILT, by ruling `C-17`.
// ⏸ ONE SENTENCE IS HELD -- slot 2, the average-rating-change trend -- and
//    `PC16-8` asserts it is DISCLOSED ON THE PAGE rather than silently absent.
//
// ⛔ Exit code is the only verdict.
//
// Run: npm run prove:portal-p2-16
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
const grab = (blob, key) => (blob.match(new RegExp(key + "=([^ \\n]*)")) ?? [])[1] ?? "";
const read = (rel) => readFileSync(join(ROOT, ...rel.split("/")), "utf8");

const MGMT = "d0000000-0000-4000-8000-000000000001";
const TRAINER = "d0000000-0000-4000-8000-000000000002";
const claims = (sub) => `{"sub":"${sub}","role":"authenticated"}`;

// ---------------------------------------------------------------------
// ⛔ PC16-1 -- NO SCHEMA, ASSERTED NOT CLAIMED.
// ---------------------------------------------------------------------
const migrations = readdirSync(join(ROOT, "supabase", "migrations")).filter((f) => f.endsWith(".sql"));
check(
  migrations.length > 30 && migrations.filter((f) => /p2_16|class_stat/i.test(f)).length === 0,
  `PC16-1 ⛔ THIS PHASE SHIPS NO MIGRATION — ${migrations.length} files and NONE names p2_16 or class_stat. ⚠️ §12.10 for the SIXTH phase: \`report_class_health_summary\` already computes slot 1, and \`CLAUDE.md\` §6 REQUIRES that exact computation be reused rather than restated`,
);
const census = psql(`
SELECT 'T=' || (SELECT pg_catalog.count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE')
    || ' E=' || (SELECT pg_catalog.count(DISTINCT t.typname) FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typtype='e')
    || ' P=' || (SELECT pg_catalog.count(*) FROM pg_catalog.pg_policies WHERE schemaname='public')
    || ' R=' || (SELECT pg_catalog.array_length(public.audit_action_registry(),1));`);
check(
  census === "T=30 E=12 P=30 R=23",
  `PC16-1b census UNMOVED: ${census} — no table, column, enum, policy, client grant or audit string`,
);

// ---------------------------------------------------------------------
// PC16-2 -- BOTH GOVERNED READS RESOLVE AS A REAL MANAGEMENT CALLER,
//           PAST EVERY GATE, AGAINST FIXTURE DATA (the §26.1 second leg).
// ⚠️ The module is resolved AS OWNER, before the role switch -- the `P2-15`
//    lesson: a subquery over `public.reports` inside the `authenticated`
//    transaction is refused, and the failure looks like a product defect.
// ---------------------------------------------------------------------
const targetModule = psql(`
SELECT m.id FROM public.class_modules m
  JOIN public.class_sessions cs ON cs.class_module_id = m.id
  JOIN public.reports r ON r.class_session_id = cs.id
 LIMIT 1;`);
check(
  /^[0-9a-f-]{36}$/i.test(targetModule),
  `PC16-2 a fixture module with at least one report exists (${targetModule || "(none)"}) — ⚠️ NON-VACUITY: every count below would be trivially correct over an empty module`,
);

const live = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(MGMT)}', true);
SELECT 'STATUS_ROWS=' || pg_catalog.count(*) || ' ASSESSED=' || pg_catalog.count(report_id)
  FROM public.report_list_management_class_status('${targetModule}'::uuid);
SELECT 'HEALTH_ROWS=' || pg_catalog.count(*) || ' TAG=' || coalesce(pg_catalog.max(main_follow_up_area), '(null)')
  FROM public.report_class_health_summary('${targetModule}'::uuid);
ROLLBACK;`);
check(
  Number(grab(live, "STATUS_ROWS")) > 0 && Number(grab(live, "ASSESSED")) > 0,
  `PC16-2b the status read resolves for management: rows=${grab(live, "STATUS_ROWS")} assessed=${grab(live, "ASSESSED")}`,
);
check(
  Number(grab(live, "HEALTH_ROWS")) === 1,
  `PC16-2c the health read resolves for management and returns exactly one row (${grab(live, "HEALTH_ROWS")}) — ⛔ slot 1 comes from HERE and from nowhere else`,
);

// ---------------------------------------------------------------------
// ⛔ PC16-3 -- THE TAG IS NOT A DIMENSION CODE, AND THE MAPPING IS THE DEFECT
//             THIS CHECK EXISTS TO CATCH.
// ⚠️ Measured: `focus_chips` holds free display text ("Vocal projection"),
//    while the nine dimension CODES are `body … audience_awareness`. A
//    `code in TABLE` lookup would match NOTHING, every time, and render a
//    panel with its first sentence silently missing.
// ---------------------------------------------------------------------
/*
 * ⚠️ READ LINE-BY-LINE, NOT THROUGH `grab`. The first draft used
 * `grab(blob,"CHIPS")`, whose `([^ \n]*)` STOPS AT THE FIRST SPACE — so
 * `Eye contact|Vocal projection` arrived as `Eye`, and the check passed while
 * asserting over a truncated value. ▶ Fourth instance of that regex family in
 * this suite set, and the first where it silently NARROWED a live measurement
 * rather than breaking one.
 */
const chipLines = psql(`
SELECT 'CHIPS<' || coalesce(string_agg(DISTINCT c, '|'), '(none)') || '>' FROM (SELECT unnest(focus_chips) AS c FROM public.observations) z;
SELECT 'CODES<' || string_agg(code::text, '|' ORDER BY sort_order) || '>' FROM public.assessment_dimensions;`);
const between = (blob, key) => (blob.match(new RegExp(key + "<([^>]*)>")) ?? [])[1] ?? "";
const chips = between(chipLines, "CHIPS").split("|").filter(Boolean);
const codes = between(chipLines, "CODES").split("|").filter(Boolean);
check(
  chips.length > 0 && codes.length === 9 && chips.every((c) => !codes.includes(c)),
  `PC16-3 ⛔ THE CONTROL FOR THE MAPPING: measured \`focus_chips\` = [${chips.join(", ")}] against the nine dimension CODES [${codes.join(", ")}] — ▶ NOT ONE CHIP IS A CODE, so a code-keyed lookup would silently match NOTHING and render a panel with its first sentence missing, with no error anywhere. This is why \`resolveDimensionKey\` normalises against the display NAME`,
);
const proj = read("server/modules/management-view/class-statistics-projections.ts");
check(
  /function resolveDimensionKey/.test(proj) && /DIMENSION_LABEL\[key\]\.toLowerCase\(\)/.test(proj),
  "PC16-3b the projection resolves by normalised display NAME (`resolveDimensionKey` compares against `DIMENSION_LABEL[key]`), not by raw code",
);
check(
  !/rawTag in DIMENSION_LABEL/.test(proj),
  "PC16-3c ⛔ AND THE DEFECTIVE FORM IS ABSENT — no `rawTag in DIMENSION_LABEL`",
);

/*
 * ⛔ PC16-3d/3e -- THE MAPPING IS EXERCISED BY LIVE DATA, NOT ONLY GUARDED.
 * ⚠️ The fixture module used above returns a NULL tag, so every assertion so
 * far is satisfied by the "no tag" branch — the zero-row member of the vacuity
 * family. ▶ A module whose tag is NON-NULL is selected deliberately.
 */
const tagged = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(MGMT)}', true);
SELECT 'LIVETAG<' || h.main_follow_up_area || '>'
  FROM public.class_modules m CROSS JOIN LATERAL public.report_class_health_summary(m.id) h
 WHERE h.main_follow_up_area IS NOT NULL LIMIT 1;
ROLLBACK;`);
const liveTag = between(tagged, "LIVETAG");
const norm = (v) => v.trim().toLowerCase().replace(/[\s_]+/g, "");
const labels = [...proj.matchAll(/^\s{2}\w+: "([A-Z][^"]*)",$/gm)].map((m) => m[1]);
const matched = labels.filter((l) => norm(l) === norm(liveTag));
check(
  liveTag !== "" && matched.length === 1,
  `PC16-3d ⛔ NON-VACUITY FOR THE MAPPING ITSELF: a real module returns \`${liveTag || "(none)"}\`, and it normalises to EXACTLY ONE of the nine labels in the projection (${matched.join(",") || "none"}) — ▶ the "no tag" branch is not the only branch this build can reach`,
);
const sentenceFor = (label) => {
  const k = label.toLowerCase().replace(/\s+/g, "_");
  const m = proj.match(new RegExp("^\\s{2}" + k + ":\\s*\\n?\\s*\"([^\"]+)\",", "m"));
  return m === null ? "" : m[1];
};
check(
  matched.length === 1 && sentenceFor(matched[0]).length > 20,
  `PC16-3e …and that dimension has a §6 recommended-action sentence to render: "${matched.length === 1 ? sentenceFor(matched[0]) : "(unresolved)"}" — ▶ slot 1 and slot 3 both reach real text on real data`,
);

// ---------------------------------------------------------------------
// ⛔ PC16-4 -- THE DENY, WITH A CONTROL THAT DISCRIMINATES.
// ---------------------------------------------------------------------
const deny = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(TRAINER)}', true);
SELECT 'T_SESSIONS=' || pg_catalog.count(*) FROM public.class_sessions;
SELECT 'T_STATUS=' || pg_catalog.count(*) FROM public.report_list_management_class_status('${targetModule}'::uuid);
SELECT 'T_HEALTH=' || pg_catalog.count(*) FROM public.report_class_health_summary('${targetModule}'::uuid);
ROLLBACK;`);
check(
  Number(grab(deny, "T_SESSIONS")) > 0,
  `PC16-4 ⛔ THE POSITIVE HALF: the TRAINER reads ${grab(deny, "T_SESSIONS")} class session(s) — a real identity against real policies, so the zeroes below are the gate rather than blindness`,
);
check(
  grab(deny, "T_STATUS") === "0" && grab(deny, "T_HEALTH") === "0",
  `PC16-4b ⛔ AND THE NEGATIVE HALF: that same identity gets status=${grab(deny, "T_STATUS")} health=${grab(deny, "T_HEALTH")} — BOTH panels are unreachable to a trainer, inside the functions`,
);

// ---------------------------------------------------------------------
// PC16-5 -- THE SOURCE LAYERS EXIST AND ARE WIRED.
// ---------------------------------------------------------------------
const FILES = [
  "server/modules/management-view/class-statistics-projections.ts",
  "features/management/management-class-statistics-screen.tsx",
  "app/(portals)/management/classes/[classModuleId]/class-statistics/page.tsx",
];
const present = FILES.filter((f) => existsSync(join(ROOT, ...f.split("/"))));
check(present.length === FILES.length, `PC16-5 all ${FILES.length} layers exist (${present.length})`);

const screen = read("features/management/management-class-statistics-screen.tsx");
const contracts = read("lib/frontend/contracts/physical-test.ts");
const overview = read("features/management/management-class-overview.tsx");

// ---------------------------------------------------------------------
// ⛔ PC16-6 -- THE THREE REFUSED CARDS, AT THE TYPE AND AT THE SCREEN.
// ---------------------------------------------------------------------
const dtoStart = contracts.indexOf("export type ClassStatisticsDto");
const dtoBody = contracts.slice(dtoStart, contracts.indexOf("};", dtoStart));
const BANNED_TYPE = ["rating", "average", "avg", "skill", "distribution", "overall", "strongest", "focusArea", "band", "score", "grade"];
const typeHits = BANNED_TYPE.filter((w) => new RegExp(w, "i").test(stripComments(dtoBody)));
check(
  typeHits.length === 0,
  `PC16-6 ⛔ THE DTO CARRIES NO RATING, AVERAGE, DISTRIBUTION OR ROLL-UP FIELD (${typeHits.length ? typeHits.join(",") : "none"}) — refused by NOT BEING WRITTEN DOWN, which survives a later column appearing upstream`,
);
const leaks = ratingLeaks(stripComments(screen));
check(
  leaks.length === 0,
  `PC16-6b ⛔ AND NO RATING VOCABULARY REACHES THE SCREEN (${leaks.length ? leaks.map((l) => l.term).join(",") : "none"})`,
);
check(
  !/82%|Skill Averages|Ongoing Performance|Status Distribution/.test(stripComments(screen)),
  "PC16-6c ⛔ none of the frame's three card titles nor its `82% avg` is rendered",
);

// ---------------------------------------------------------------------
// ✅ PC16-7 -- AND THE TWO MANDATED PANELS ARE ACTUALLY THERE.
// ⚠️ The vacuity companion: `PC16-6` is satisfied perfectly by a blank page.
// ---------------------------------------------------------------------
check(
  /Management Insight/.test(screen) && /Students Needing Follow-up/.test(screen),
  "PC16-7 ✅ BOTH PANELS `C-17` MANDATES RENDER — ⚠️ the companion `PC16-6` needs: a blank screen satisfies every prohibition above perfectly",
);
check(
  /remains the main follow-up area/.test(screen) && /Recommended next action:/.test(screen),
  "PC16-7b slot 1 and slot 3 render `CLAUDE.md` §6's sentences verbatim",
);
const NINE = [
  "posture and gesture awareness",
  "facial-expression practice",
  "sentence structure and clarity",
  "vocal tone and pitch-control",
  "partner-facing eye contact",
  "speaking to the back of the room",
  "emotional-expression role-play",
  "pacing and sentence-flow",
  "varying delivery for different listeners",
];
const missing = NINE.filter((s) => !proj.includes(s));
check(
  missing.length === 0,
  `PC16-7c ⛔ ALL NINE of §6's lookup sentences are present verbatim (${missing.length} missing) — a fixed table, never generated prose, because generating it would pull the §8-deferred Weekly Class Health Brief into scope`,
);
check(
  !/openai|anthropic|generate|llm|prompt/i.test(stripComments(proj)),
  "PC16-7d ⛔ and NO model is reachable from this projection — the panel is a lookup and an aggregate",
);

// ---------------------------------------------------------------------
// ⏸ PC16-8 -- THE HELD SENTENCE IS DISCLOSED WHERE THE OPERATOR READS.
// ---------------------------------------------------------------------
check(
  /insightTrendHeld/.test(proj) && /insightTrendHeld/.test(contracts),
  "PC16-8 slot 2 is carried as a FIELD through the projection and the contract, not left as a comment",
);
check(
  /One sentence of this panel is not built/.test(screen) && !/toFixed|improving across recent sessions/.test(stripComments(screen)),
  "PC16-8b ⏸ AND IT IS DISCLOSED ON THE PAGE (§12.12a) while the held sentence itself is NOT rendered — ⛔ not an empty sentence, not a silent two-sentence panel pretending to be the mandated three",
);

// ---------------------------------------------------------------------
// ⛔ PC16-9 -- `A-038`'s GATE IS CHECKED PER ROW, INDEPENDENTLY.
// ---------------------------------------------------------------------
const rowAction = screen.slice(screen.indexOf("function RowAction"));
check(
  /reportState === "submitted"/.test(rowAction) &&
    /reportState === "trainer_approved"/.test(rowAction) &&
    /reportState === null \|\| row\.reportId === null/.test(rowAction) &&
    /Send Reminder to Trainer/.test(rowAction),
  "PC16-9 ⛔ all four `A-038` outcomes are checked independently — `CLAUDE.md` §6 forbids one generic view-report handler shared across rows and screens",
);
check(
  /reportId !== null && r\.reportState !== "submitted"/.test(proj),
  "PC16-9b ⛔ AND THE TABLE IS SELECTED BY REPORT STATUS, never by rating — a rating-based selection would be `C-9`",
);

// ---------------------------------------------------------------------
// ✅ PC16-10 -- THE LAPSED INERT REASON WAS CORRECTED IN THE SAME PASS (§12.11).
// ---------------------------------------------------------------------
check(
  !/reason="Class statistics arrive with screen 16\."/.test(overview),
  "PC16-10 ✅ screen `13`'s INERT `View Overall Class Statistics` is gone — its stated reason lapsed the moment screen `16` shipped, and §12.11 requires the correction in the SAME pass",
);
check(
  /\/class-statistics`}/.test(overview),
  "PC16-10b and it is now a real link — ⚠️ screen `16` has NO other inbound route, because the frame's per-row `Stats ›` column is AUTHORIZATION B and unbuilt",
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed checks)`);
process.exit(bad === 0 ? 0 : 1);
