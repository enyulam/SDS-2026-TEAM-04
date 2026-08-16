#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-16 -- screen `16` Management Class Statistics. COMPLETE.
// =====================================================================
// ⚠️ HEADER CORRECTED 2026-08-16 IN THE SAME PASS AS THE RULING (§12.11).
//    It read "ZERO FUNCTIONS AND ZERO GRANTS ADDED" and "ONE SENTENCE IS
//    HELD". ▶ Both were TRUE while slot 2 was held and are FALSE now.
//
// ⛔ FUNCTIONS AND GRANTS ADDED, NAMED NOT COUNTED (`PC16-1c` asserts it):
//      `public.report_class_improved_dimension(uuid)` -- ONE `EXECUTE` grant
//      `public.competency_score(competency_rating)`   -- NO grant, by design
//    And nothing else: no table, column, enum, policy or audit string.
//
// ✅ §12.10 STILL BOUGHT MOST OF THE SCREEN. Slots 1 and 3, the three counts
//    and the follow-up table add NOTHING -- they read
//    `report_class_health_summary` (built at `P2-4`) and
//    `report_list_management_class_status`. ▶ Reusing the first is MANDATORY,
//    not economical: `CLAUDE.md` §6 requires "the exact same computation ...
//    never computed two different ways".
//
// ⛔ ALL THREE CARDS THE FRAME DRAWS ARE REFUSED (`GC-6` on `C-9` and `G-2`).
// ✅ AND TWO PANELS THE FRAME OMITS ARE BUILT, by ruling `C-17`.
// ✅ SLOT 2 IS BUILT BY OPERATOR RULING, 2026-08-16 -- and the permission
//    rests on the SHAPE, not on §6: *"its output is a dimension name and never
//    a value. That is `D-2`'s exact structure ... `G-2` bars a roll-up RATING.
//    A dimension name is not a rating."* `PC16-8`/`8b` assert that shape in
//    `VP-4`'s form; `PC16-8f` CONSTRUCTS the divergence so the computation is
//    actually exercised (§12.15).
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
/* ⚠️ DELIMITER-BRACKETED, because `grab`'s `([^ \n]*)` STOPS AT THE FIRST
   SPACE and silently truncated a live measurement to its first word. */
const between = (blob, key) => (blob.match(new RegExp(key + "<([^>]*)>")) ?? [])[1] ?? "";
const read = (rel) => readFileSync(join(ROOT, ...rel.split("/")), "utf8");

const MGMT = "d0000000-0000-4000-8000-000000000001";
const TRAINER = "d0000000-0000-4000-8000-000000000002";
const claims = (sub) => `{"sub":"${sub}","role":"authenticated"}`;

// ---------------------------------------------------------------------
// ⛔ PC16-1 -- NO SCHEMA, ASSERTED NOT CLAIMED.
// ---------------------------------------------------------------------
/*
 * ⚠️ CORRECTED 2026-08-16 IN THE SAME PASS AS THE RULING (§12.11).
 *
 * ⛔ THIS LEG PREVIOUSLY ASSERTED "THIS PHASE SHIPS NO MIGRATION", and that
 * was TRUE when slot 2 was held. ▶ The Operator then RULED SLOT 2 BUILDABLE,
 * so the phase now ships exactly two migrations, and leaving the old assertion
 * would have made the suite enforce a state the ruling had superseded.
 *
 * ✅ WHAT §12.10 STILL BOUGHT, AND IT IS MOST OF THE SCREEN: slots 1 and 3,
 * the three counts and the follow-up table all still add NOTHING — they read
 * `report_class_health_summary` (built at `P2-4`) and
 * `report_list_management_class_status`. ⛔ And reusing the first is MANDATORY,
 * not economical: `CLAUDE.md` §6 requires *"the exact same computation …
 * never computed two different ways"*.
 */
const migrations = readdirSync(join(ROOT, "supabase", "migrations")).filter((f) => f.endsWith(".sql"));
const mine = migrations.filter((f) => /p2_16/i.test(f));
check(
  mine.length === 2 && mine.some((f) => /improved_dimension\.sql$/.test(f)) && mine.some((f) => /_fix\.sql$/.test(f)),
  `PC16-1 this phase ships exactly TWO migrations, and the second is a forward correction under R-1: ${mine.join(", ") || "(none)"}`,
);
const added = psql(`
SELECT 'FNS<' || string_agg(p.proname, ',' ORDER BY p.proname) || '>'
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname IN ('competency_score','report_class_improved_dimension');
SELECT 'HELPER_GRANTS<' || pg_catalog.count(*) || '>' FROM information_schema.role_routine_grants
 WHERE specific_schema='public' AND routine_name='competency_score' AND grantee IN ('authenticated','anon','PUBLIC','service_role');`);
check(
  between(added, "FNS") === "competency_score,report_class_improved_dimension" && between(added, "HELPER_GRANTS") === "0",
  `PC16-1c ⛔ THE FUNCTIONS AND GRANTS ADDED, NAMED NOT COUNTED: \`report_class_improved_dimension(uuid)\` with ONE \`EXECUTE\` to \`authenticated\`, and \`competency_score(competency_rating)\` with **${between(added, "HELPER_GRANTS")} grants** — ⚠️ the helper is ungranted deliberately: it is called only from inside \`SECURITY DEFINER\` bodies, which run as owner, so granting it would widen the client surface for no caller`,
);
check(
  Number(psql(`SELECT pg_catalog.count(*) FROM (SELECT p.prosrc FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.prokind='f' AND p.proname <> 'competency_score') z WHERE z.prosrc ~ 'WHEN\\s+''mastering''\\s+THEN\\s+75';`)) === 0,
  "PC16-1d ⛔ AND `D-2`'s MAPPING IS STILL HELD IN EXACTLY ONE PLACE — ⚠️ `D-2` REQUIRES that, and a second inline `CASE` here would have been both a direct violation and the \"second definition free to drift\" defect §12.10 keeps catching. The existing trend function was recreated by FORWARD migration to call the shared helper",
);
const census = psql(`
SELECT 'T=' || (SELECT pg_catalog.count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE')
    || ' E=' || (SELECT pg_catalog.count(DISTINCT t.typname) FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typtype='e')
    || ' P=' || (SELECT pg_catalog.count(*) FROM pg_catalog.pg_policies WHERE schemaname='public')
    || ' R=' || (SELECT pg_catalog.array_length(public.audit_action_registry(),1));`);
check(
  // re-pinned 23 -> 24 at P2-14 (Operator authorization, 2026-08-16, admin.student_updated); STILL AN EQUALITY, deliberately
  census === "T=30 E=12 P=30 R=24",
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
/*
 * ✅ PC16-8 -- SLOT 2, BUILT BY OPERATOR RULING 2026-08-16 (previously HELD).
 *
 * ⛔ THE RULING'S GROUND, ASSERTED RATHER THAN QUOTED: the permission does NOT
 * rest on `CLAUDE.md` §6 mandating the sentence. It rests on the SHAPE --
 * *"its input is ratings across children; its output is a dimension name and
 * never a value. That is `D-2`'s exact structure … `G-2` bars a roll-up
 * RATING. A dimension name is not a rating."* ▶ So the legs below assert the
 * SHAPE, in `VP-4`'s form: the returned type carries no rating value, band or
 * score, and the surface renders none.
 */
const slot2 = psql(`
SELECT 'RESULT<' || pg_catalog.pg_get_function_result(p.oid) || '>'
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname='report_class_improved_dimension';
SELECT 'GRANTS<' || pg_catalog.count(*) || '>' FROM information_schema.role_routine_grants
 WHERE specific_schema='public' AND routine_name='report_class_improved_dimension' AND grantee='authenticated' AND privilege_type='EXECUTE';`);
const slot2Result = between(slot2, "RESULT");
check(
  slot2Result === "TABLE(improved_dimension dimension_code, sessions_considered integer)",
  `PC16-8 ⛔ THE RETURNED SHAPE IS PINNED STRING-FOR-STRING (\`VP-4\`'s form): \`${slot2Result}\` — one dimension IDENTIFIER and one count, and **there is no column here capable of carrying a rating, a band or a score**`,
);
check(
  !/(rating|band|score|beginning|developing|mastering|mastered|percent|avg|delta)/i.test(slot2Result) &&
    between(slot2, "GRANTS") === "1",
  `PC16-8b ⛔ …no rating-family term appears in that result type at all, and it carries exactly ${between(slot2, "GRANTS")} EXECUTE grant to \`authenticated\``,
);
check(
  /improvedDimension/.test(proj) && /improvedDimension/.test(contracts) && !/insightTrendHeld/.test(contracts),
  "PC16-8c slot 2 is carried through the projection and the contract as a DIMENSION LABEL, and the old held-flag is gone",
);
/*
 * ⚠️ THE PROHIBITION IS ON RENDERING A NUMBER, NOT ON THE WORD "average".
 * The first form banned `/average/i` outright and went red on the disclosure
 * sentence *"never averaged across a class"* — ▶ **a refusal being explained
 * is not the thing being refused**, and a check that cannot tell those apart
 * would push the screen toward saying less about what it does not do.
 */
const rendered = stripComments(screen);
check(
  /is improving across recent sessions/.test(rendered) &&
    /Not enough session data yet to identify a trend/.test(rendered),
  "PC16-8d ✅ THE SURFACE RENDERS §6's SENTENCE AND ITS UNDER-TWO-SESSIONS REPLACEMENT VERBATIM",
);
check(
  !/toFixed|\{[^}]*(delta|Score|Average|Avg)[^}]*\}|%`|>\s*\{[^}]*percent/i.test(rendered),
  "PC16-8d2 ⛔ …and NO computed number reaches the page — no `toFixed`, no interpolated delta, score, average or percentage. ▶ `D-2`'s constraint holds for slot 2 exactly as it does for the trend line: the value is computed server-side and never rendered to any role",
);

/*
 * ⛔ PC16-8e/8f -- THE MAIN PATH IS EXERCISED, BY CONSTRUCTING THE DIVERGENCE.
 * ⚠️ §12.15, and the zero-row vacuity member: EVERY fixture module has fewer
 * than two SUBMITTED sessions, so without this leg the function's whole
 * computation is unreached and only its `< 2` floor is ever proven. ▶ A second
 * session is promoted to `submitted` INSIDE A ROLLED-BACK TRANSACTION.
 */
const floorCase = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(MGMT)}', true);
SELECT 'FLOOR<' || coalesce(r.improved_dimension::text,'(null)') || '|' || r.sessions_considered || '>'
  FROM public.report_class_improved_dimension('${targetModule}'::uuid) r;
ROLLBACK;`);
check(
  between(floorCase, "FLOOR").startsWith("(null)|"),
  `PC16-8e §6's FLOOR is real on this fixture: \`${between(floorCase, "FLOOR")}\` — fewer than two submitted sessions yields a NULL dimension and the count, ⚠️ **a ROW rather than an empty set**, because an empty set is the REFUSAL signal and the caller must tell the two apart`,
);
const constructed = psql(`
BEGIN;
UPDATE public.reports SET status='submitted'
 WHERE id IN (
   SELECT rp.id FROM public.reports rp
     JOIN public.class_sessions cs ON cs.id = rp.class_session_id
     JOIN public.class_modules cm ON cm.id = cs.class_module_id
    WHERE cm.title LIKE '%Module B%' AND rp.status <> 'submitted'
      AND cs.id NOT IN (SELECT cs2.id FROM public.class_sessions cs2 JOIN public.reports r2 ON r2.class_session_id=cs2.id WHERE r2.status='submitted')
    LIMIT 2);
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(MGMT)}', true);
SELECT 'BUILT<' || coalesce(r.improved_dimension::text,'(null)') || '|' || r.sessions_considered || '>'
  FROM public.class_modules m CROSS JOIN LATERAL public.report_class_improved_dimension(m.id) r
 WHERE m.title LIKE '%Module B%';
ROLLBACK;`);
const built = between(constructed, "BUILT");
const NINE_CODES = ["body","emotion","speech","tonality","eye_contact","vocal_projection","emotional_expression","sentence_flow","audience_awareness"];
/*
 * ⛔ PC16-8g -- THE RECREATED TREND STILL RETURNS THE SAME VALUES.
 *
 * ⚠️ THIS MIGRATION RECREATED `report_management_student_trend`, swapping its
 * INLINE `CASE` for a call to the shared `competency_score` helper -- because
 * `D-2` requires its mapping to live in ONE place and a second inline copy
 * would have been a direct violation. ▶ **That is a real regression risk**:
 * a mapping extracted wrongly changes every score silently, and the shape
 * assertions above would all still pass.
 *
 * ⛔ SO THE VALUES ARE PINNED, NOT THE SHAPE. `44.44` and `63.89` are the
 * same figures `PS-3c` measured before the extraction — and they sit STRICTLY
 * BETWEEN band floors, so a constant, an off-by-one mapping or an unmapped
 * NULL would each move them.
 *
 * ⚠️ AND THE RPC-CALLER RULE IS WHAT FORCED THIS LEG. It observed that the
 * migration declares a function its paired suite never called, which is
 * exactly right: **the phase that changes a function is the phase that must
 * prove it still works.**
 */
const learner = psql(`SELECT 'SID<' || o.student_id || '>' FROM public.observations o GROUP BY o.student_id ORDER BY pg_catalog.count(*) DESC LIMIT 1;`);
const trend = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(MGMT)}', true);
SELECT 'SCORES<' || coalesce(string_agg(t.session_score::text, ',' ORDER BY t.session_date), '(none)') || '>'
  FROM public.report_management_student_trend('${between(learner, "SID")}'::uuid) t;
ROLLBACK;`);
check(
  between(trend, "SCORES") === "44.44,63.89",
  `PC16-8g ⛔ THE RECREATED TREND IS VALUE-IDENTICAL: \`${between(trend, "SCORES")}\` — ▶ the \`D-2\` mapping was extracted into a shared helper and **every score is unchanged**, which no shape assertion above could have told you`,
);

check(
  built.endsWith("|2") && NINE_CODES.includes(built.split("|")[0]),
  `PC16-8f ⛔ AND WITH TWO SUBMITTED SESSIONS THE COMPUTATION RUNS AND NAMES A REAL DIMENSION: \`${built || "(none)"}\` — ▶ it is one of the nine canonical codes, computed INSIDE the database from ratings across children, and **what crossed the boundary is an identifier and a count**. The transaction rolled back`,
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
