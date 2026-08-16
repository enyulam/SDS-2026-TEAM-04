#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-14 -- screen `22` Edit Student.
// ⛔ WHAT WAS ADDED, NAMED NOT COUNTED:
//      · audit string  'admin.student_updated'   -- registry 23 -> 24
//      · function      public.admin_update_student(uuid, text, text, uuid[])
//      · function      public.admin_withdraw_student(uuid)
//      · grant         EXECUTE on each, to authenticated
//    NO table, column, enum, policy or client table grant.
//
// ⛔ EXACTLY ONE STRING, AND THE WITHDRAWAL SHARES IT. `PE-1c` asserts
//    `admin.student_withdrawn` was NOT minted: a withdrawal is a student state
//    change plus one enrolment change per class, and both already have names.
//
// ⛔ Exit code is the only verdict.
//
// Run: npm run prove:portal-p2-14
// =====================================================================

import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { assertConfigProjectId, resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";
import { stripComments } from "./artefact-read-rule.mjs";

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

const MANAGEMENT = "d0000000-0000-4000-8000-000000000001";
const TRAINER = "d0000000-0000-4000-8000-000000000002";
const claims = (sub) => `{"sub":"${sub}","role":"authenticated"}`;
const MIGRATION = "20260816200000_portal_p2_14_admin_update_student.sql";

// ---------------------------------------------------------------------
// ⛔ PE-1 -- THE AUTHORIZED REGISTRY EXTENSION, AND ONLY IT.
// ---------------------------------------------------------------------
const sql = read(`supabase/migrations/${MIGRATION}`);
const registry = psql(`
SELECT 'N<' || pg_catalog.array_length(public.audit_action_registry(),1) || '>';
SELECT 'HAS<' || (public.audit_action_registry() @> ARRAY['admin.student_updated'])::text || '>';
SELECT 'NOSECOND<' || (public.audit_action_registry() @> ARRAY['admin.student_withdrawn'])::text || '>';
SELECT 'SITES<' || pg_catalog.count(*) || '>' FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='audit_action_registry';`);
check(
  between(registry, "N") === "24" && between(registry, "HAS") === "true",
  `PE-1 ⛔ THE REGISTRY IS EXACTLY 24 and carries \`admin.student_updated\` — the string AND the count were stated in advance and authorized before the migration was written`,
);
check(
  between(registry, "NOSECOND") === "false",
  `PE-1c ⛔ AND NO SECOND STRING WAS MINTED: \`admin.student_withdrawn\` is absent (${between(registry, "NOSECOND")}) — ▶ a withdrawal is a student STATE CHANGE plus one \`admin.enrolment_changed\` per class, and both already have names. \`A-029\` counts ACTIONS; a second name for a named action is the defect the \`evidence.uploaded\` collapse closed`,
);
check(
  between(registry, "SITES") === "1",
  `PE-1d ⛔ ONE DECLARATION SITE (${between(registry, "SITES")}) — \`P1-2\` consolidated it, and two copies of a registry is how one of them silently stops enforcing`,
);
const census = psql(`
SELECT 'C<' || (SELECT pg_catalog.count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE')
    || '|' || (SELECT pg_catalog.count(DISTINCT t.typname) FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typtype='e')
    || '|' || (SELECT pg_catalog.count(*) FROM pg_catalog.pg_policies WHERE schemaname='public') || '>';`);
check(
  between(census, "C") === "30|12|30",
  `PE-1e ⛔ NOTHING ELSE MOVED: tables|enums|policies = ${between(census, "C")}`,
);
check(
  !/CREATE\s+TABLE|ALTER\s+TABLE|CREATE\s+TYPE|ALTER\s+TYPE|CREATE\s+POLICY|GRANT\s+(SELECT|INSERT|UPDATE|DELETE)/i.test(
    sql,
  ),
  "PE-1f ⛔ and the file declares no table, column, enum, policy or client table grant",
);

// ---------------------------------------------------------------------
// ⛔ PE-2 -- A-057 IS AMENDED IN THE C-4 SHAPE, IN THE RATIFIED AMENDMENT.
// ---------------------------------------------------------------------
const amendment = read("docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_008.md");
check(
  /admin\.student_updated/.test(amendment) && /23\s*(?:→|->)\s*24/.test(amendment),
  "PE-2 ⛔ `A-057` IS AMENDED AT SOURCE: `docs/spec/…Amendment_008.md` names `admin.student_updated` and records `23 → 24` — ▶ the Operator required the amendment *in the C-4 shape*, and a registry extension recorded only in a migration would leave the ratified instrument disagreeing with the database",
);
check(
  /~~/.test(amendment) && /2026-08-16/.test(amendment),
  "PE-2a ✅ …by ANNOTATE-NEVER-DELETE, dated — the superseded count is struck and preserved inline, never overwritten (`CLAUDE.md` §12's one permitted exception, under the bounded instruction that authorized this phase)",
);

// ---------------------------------------------------------------------
// ⛔ PE-3 -- BOTH PATHS, AS REAL MANAGEMENT, ROLLED BACK.
// ⚠️ THE STUDENT IS PINNED IN A TEMP TABLE. The first draft re-selected
//    `ORDER BY full_name LIMIT 1` after the rename and silently addressed a
//    DIFFERENT child on the second call — a probe whose subject moved between
//    calls, the same shape as `PDTa-ACTIONS` one phase earlier.
// ---------------------------------------------------------------------
const run = psql(`
SELECT 'BEFORE<' || (SELECT pg_catalog.count(*) FROM public.students WHERE is_active) || '|'
    || (SELECT pg_catalog.count(*) FROM public.enrolments WHERE is_active) || '|'
    || (SELECT pg_catalog.count(*) FROM public.audit_events) || '>';
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(MANAGEMENT)}', true);
CREATE TEMP TABLE pinned AS SELECT s.id FROM public.students s WHERE s.is_active ORDER BY s.full_name LIMIT 1;
SELECT 'RENAME<' || r.o_reason || '|' || r.o_name_changed::text || '|' || r.o_added || '|' || r.o_removed || '>'
  FROM public.admin_update_student((SELECT id FROM pinned), 'Renamed', 'Learner',
       ARRAY(SELECT e.class_module_id FROM public.enrolments e WHERE e.student_id=(SELECT id FROM pinned) AND e.is_active), NULL, NULL, NULL) r;
SELECT 'NOOP<' || r.o_reason || '|' || r.o_name_changed::text || '|' || r.o_added || '|' || r.o_removed || '>'
  FROM public.admin_update_student((SELECT id FROM pinned), 'Renamed', 'Learner',
       ARRAY(SELECT e.class_module_id FROM public.enrolments e WHERE e.student_id=(SELECT id FROM pinned) AND e.is_active), NULL, NULL, NULL) r;
RESET ROLE;
SELECT 'AFTER_NOOP<' || pg_catalog.count(*) || '>' FROM public.audit_events WHERE action='admin.student_updated';
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(MANAGEMENT)}', true);
SELECT 'MOVE<' || r.o_reason || '|' || r.o_added || '|' || r.o_removed || '>'
  FROM public.admin_update_student((SELECT id FROM pinned), 'Renamed', 'Learner',
       ARRAY(SELECT cm.id FROM public.class_modules cm ORDER BY cm.title LIMIT 2), NULL, NULL, NULL) r;
SELECT 'WITHDRAW<' || r.o_reason || '|' || r.o_removed || '>'
  FROM public.admin_withdraw_student((SELECT id FROM pinned)) r;
SELECT 'R_NOCLASS<' || (SELECT o_reason FROM public.admin_update_student(
    (SELECT s.id FROM public.students s WHERE s.is_active ORDER BY s.full_name DESC LIMIT 1),'A','B',ARRAY[]::uuid[], NULL, NULL, NULL)) || '>';
SELECT 'R_UNKNOWN<' || (SELECT o_reason FROM public.admin_withdraw_student('00000000-0000-4000-8000-000000000000')) || '>';
SELECT 'R_WITHDRAWN<' || (SELECT o_reason FROM public.admin_update_student((SELECT id FROM pinned),'A','B',
    ARRAY(SELECT cm.id FROM public.class_modules cm LIMIT 1), NULL, NULL, NULL)) || '>';
RESET ROLE;
SELECT 'DEACTIVATED<' || (SELECT (NOT s.is_active AND s.deactivated_at IS NOT NULL)::text FROM public.students s WHERE s.id=(SELECT id FROM pinned)) || '>';
SELECT 'STILL_EXISTS<' || (SELECT pg_catalog.count(*) FROM public.students s WHERE s.id=(SELECT id FROM pinned)) || '>';
SELECT 'ENROL_KEPT<' || (SELECT pg_catalog.count(*) FROM public.enrolments e WHERE e.student_id=(SELECT id FROM pinned)) || '>';
SELECT 'LEAK<' || pg_catalog.count(*) || '>' FROM public.audit_events
 WHERE payload::text ILIKE '%Renamed%' OR coalesce(target_label,'') ILIKE '%Renamed%';
SELECT 'CHAIN<' || ok::text || '|' || events_checked || '>' FROM public.audit_verify_chain() LIMIT 1;
ROLLBACK;
SELECT 'AFTER<' || (SELECT pg_catalog.count(*) FROM public.students WHERE is_active) || '|'
    || (SELECT pg_catalog.count(*) FROM public.enrolments WHERE is_active) || '|'
    || (SELECT pg_catalog.count(*) FROM public.audit_events) || '>';`);
check(
  between(run, "RENAME") === "saved|true|0|0",
  `PE-3 ⛔ REAL MANAGEMENT, PAST EVERY GATE — rename: ${between(run, "RENAME")} (reason|nameChanged|added|removed)`,
);
check(
  between(run, "NOOP") === "saved|false|0|0",
  `PE-3a ⛔ A SECOND IDENTICAL SAVE CHANGES NOTHING: ${between(run, "NOOP")} — ⚠️ the student is PINNED in a temp table, and the first draft was not: re-selecting \`ORDER BY full_name LIMIT 1\` after the rename addressed a DIFFERENT child, so the no-op leg reported \`nameChanged=true\` over a second rename. ▶ A probe whose subject moved between calls, one phase after \`PDTa-ACTIONS\``,
);
check(
  between(run, "MOVE") === "saved|2|1",
  `PE-3b ⛔ enrolments ADDED AND WITHDRAWN in one call: ${between(run, "MOVE")} (reason|added|removed) — ▶ non-vacuous in BOTH directions`,
);
check(
  between(run, "WITHDRAW") === "withdrawn|2",
  `PE-3c ⛔ the withdrawal removed ${between(run, "WITHDRAW")} — every remaining active enrolment`,
);
check(
  between(run, "R_NOCLASS") === "no_classes" && between(run, "R_UNKNOWN") === "unknown_student",
  `PE-3d ⛔ governed refusals: no_classes=${between(run, "R_NOCLASS")} · unknown_student=${between(run, "R_UNKNOWN")} — ⚠️ \`no_classes\` matters on an EDIT too: a save must not be able to leave a learner enrolled in nothing, which is a state no roster shows`,
);
/*
 * ⚠️ THIS LEG EXISTS BECAUSE THE FIRST DRAFT GOT A BETTER ANSWER THAN IT
 * ASKED FOR. The `no_classes` probe originally ran against the PINNED student
 * — after the withdrawal — and returned `unknown_student`, so the leg went
 * red. ▶ The function was right and the probe was wrong: the edit path's
 * existence gate is `AND s.is_active`, so a withdrawn learner is not editable
 * at all, and that gate fires BEFORE the class validation.
 *
 * ⛔ Rather than move the probe and lose the observation, the correct probe was
 * moved to an active learner AND the accidental finding kept as its own
 * assertion: it is the only leg that proves the withdrawal took effect on the
 * STUDENT ROW rather than only on the enrolments.
 */
check(
  between(run, "R_WITHDRAWN") === "unknown_student",
  `PE-3e ⛔ AND A WITHDRAWN LEARNER IS NOT EDITABLE: the same call that succeeded before the withdrawal now returns \`${between(run, "R_WITHDRAWN")}\` — ▶ the edit path's gate is \`AND s.is_active\` and it fires FIRST, so withdrawal is proved to have taken effect on the STUDENT ROW, not merely on the enrolments`,
);

// ---------------------------------------------------------------------
// ⛔ PE-4 -- WITHDRAWAL DEACTIVATES; IT NEVER DELETES.
// ---------------------------------------------------------------------
check(
  between(run, "DEACTIVATED") === "true" &&
    between(run, "STILL_EXISTS") === "1" &&
    Number(between(run, "ENROL_KEPT")) > 0,
  `PE-4 ⛔ the student row STILL EXISTS (${between(run, "STILL_EXISTS")}), is deactivated with a timestamp (${between(run, "DEACTIVATED")}), and its ${between(run, "ENROL_KEPT")} enrolment row(s) are RETAINED as withdrawn — ▶ reports, observations and audit rows all reference these, and \`A-029\`'s durable actor FKs are \`RESTRICT\` precisely so history cannot be erased by a delete`,
);
check(
  between(run, "LEAK") === "0",
  `PE-4a ⛔ the child's name reaches NO label or payload (${between(run, "LEAK")}) — ▶ NON-VACUOUS: the row was renamed to it, so a leak would have matched. What is recorded is THAT it changed`,
);
check(
  between(run, "AFTER") === between(run, "BEFORE"),
  `PE-4b …and the whole exercise LEFT NOTHING BEHIND: ${between(run, "BEFORE")} → ${between(run, "AFTER")}`,
);

// ---------------------------------------------------------------------
// ⛔ PE-5 -- A NO-OP SAVE EMITS NOTHING, AND THE CHAIN STILL VERIFIES.
// ---------------------------------------------------------------------
check(
  between(run, "AFTER_NOOP") === "1",
  `PE-5 ⛔ after ONE rename and ONE identical re-save, exactly ${between(run, "AFTER_NOOP")} \`admin.student_updated\` event exists — ▶ a save that altered nothing emits NOTHING: \`A-029\` records governed ACTIONS, and putting "management edited this child" into an immutable log over a no-op would make the log say something untrue`,
);
const chain = between(run, "CHAIN").split("|");
check(
  chain[0] === "true" && Number(chain[1]) > 100,
  `PE-5a ⛔ THE HASH CHAIN VERIFIES after the registry extension AND after these writes: ok=${chain[0]} over ${chain[1]} events — ⚠️ **THE COUNT IS THE NON-VACUITY LEG THE OPERATOR REQUIRED**: \`audit_verify_chain\` over ZERO events returns \`ok = true\`, so a green with \`events_checked = 0\` would prove nothing at all`,
);

// ---------------------------------------------------------------------
// ⛔ PE-6 -- A TRAINER IS REFUSED ON BOTH PATHS, AND WRITES NOTHING.
// ---------------------------------------------------------------------
const asTrainer = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(TRAINER)}', true);
SELECT 'U<' || (SELECT o_reason FROM public.admin_update_student((SELECT s.id FROM public.students s WHERE s.is_active LIMIT 1),'X','Y',ARRAY(SELECT cm.id FROM public.class_modules cm LIMIT 1), NULL, NULL, NULL)) || '>';
SELECT 'W<' || (SELECT o_reason FROM public.admin_withdraw_student((SELECT s.id FROM public.students s WHERE s.is_active LIMIT 1))) || '>';
RESET ROLE;
SELECT 'T_EVENTS<' || pg_catalog.count(*) || '>' FROM public.audit_events WHERE action='admin.student_updated';
SELECT 'T_ACTIVE<' || pg_catalog.count(*) || '>' FROM public.students WHERE is_active;
ROLLBACK;`);
check(
  between(asTrainer, "U") === "not_permitted" &&
    between(asTrainer, "W") === "not_permitted" &&
    between(asTrainer, "T_EVENTS") === "0" &&
    between(asTrainer, "T_ACTIVE") === "13",
  `PE-6 ⛔ a TRAINER holding both EXECUTE grants is refused on BOTH paths (update=${between(asTrainer, "U")}, withdraw=${between(asTrainer, "W")}), emitted ${between(asTrainer, "T_EVENTS")} events and left ${between(asTrainer, "T_ACTIVE")} learners active — ▶ the grant is reachability, never authorization, and a denied attempt must not record an action that never happened`,
);

// ---------------------------------------------------------------------
// ⛔ PE-7 -- THE 30-DAY PROMISE IS DROPPED, AT EVERY LAYER.
// ---------------------------------------------------------------------
const screen = read("features/management/management-edit-student-screen.tsx");
const stripped = stripComments(screen);
const DISCLOSURE = /<p className="text-\[11\.5px\] leading-5 text-ink">[\s\S]*?<\/p>/g;
const rendered = stripped.replace(DISCLOSURE, "");
check(
  !/30 day|thirty day|be undone|undo/i.test(rendered),
  "PE-7 ⛔ NO 30-DAY WINDOW AND NO UNDO PROMISE ON THE SCREEN — Operator ruling: build the withdrawal, drop the sentence. ▶ *A retention promise with no mechanism is a lie with a deadline*, and retention is Phase 4",
);
const frameHtml = read("UI_REFERENCE_FINAL_MVP/reference/Management - Edit Student/Management - Edit Student.html");
check(
  frameHtml.split("undone within 30 days").length - 1 > 0,
  `PE-7a ⚠️ THE FRAME REALLY MAKES THE PROMISE (${frameHtml.split("undone within 30 days").length - 1}×) — ▶ so the check above refuses something that EXISTS (the \`PS-7c\` lesson)`,
);
check(
  /Nothing is deleted/i.test(screen) && /re-enrolling them is a management action/i.test(screen),
  "PE-7b ✅ …and what replaces it is TRUE AND CARRIES NO DEADLINE: nothing is deleted, and re-enrolment is a management action. ▶ A statement about the data, not a promise about time",
);
check(
  !/gender|home address|photo|ID 20dd-/i.test(rendered),
  "PE-7c ⛔ and the FOUR remaining no-column fields are ABSENT from the form, not disabled — ⚠️ narrowed from seven by C-14. Date of birth and the guardian pair are now BUILT, and the guardian pair additionally DISAPPEARS once a parent account is linked, which is a different thing from being refused",
);
check(
  /gender, a student reference number, a photograph/i.test(screen),
  "PE-7d …with all FOUR named ON THE PAGE (§12.12)",
);

// ---------------------------------------------------------------------
// PE-8 -- THE LAYERS, THE REGISTER, THE FIXTURE, AND §12.10.
// ---------------------------------------------------------------------
const FILES = [
  "server/modules/identity-access/student-edit.ts",
  "features/management/management-edit-student-screen.tsx",
  "app/(portals)/management/students/[studentId]/edit/page.tsx",
];
check(FILES.every((f) => existsSync(join(ROOT, ...f.split("/")))), `PE-8 all ${FILES.length} layers exist`);
check(
  readdirSync(join(ROOT, "supabase", "migrations")).filter((f) => /p2_14/i.test(f)).length === 1,
  "PE-8a exactly one migration for this phase",
);
check(
  /readManagementStudentProfile\(studentId\)/.test(screen) && /listManagementClasses\(\)/.test(screen),
  "PE-8b ⚠️ §12.10 FOR THE TENTH CONSECUTIVE PHASE: the form prefills from the EXISTING profile read and the EXISTING class list — no new read was added",
);
check(
  /```artefact-read[\s\S]*?screen: 22/.test(read("UI_REFERENCE_FINAL_MVP/22-management-edit-student/implementation-notes.md")),
  "PE-8c ✅ the artefact-read block exists — REQUIRED by `AR-1b`",
);
const fixture = read("lib/frontend/fixtures/physical-test-fixture.ts");
check(
  /outcome: "unavailable"/.test(
    fixture.slice(fixture.indexOf("async withdrawStudent"), fixture.indexOf("async withdrawStudent") + 300),
  ),
  "PE-8d ⛔ the FIXTURE REFUSES the withdrawal — ⚠️ the worst thing on this screen to fake: a fabricated success would tell an operator a child is off every roster while they remain on all of them",
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
process.exit(bad === 0 ? 0 : 1);
