#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-12 -- screen `20` Register New Student.
// ⛔ ONE WRITE RPC AND ONE GRANT, AS AUTHORIZED. NAMED, NOT COUNTED:
//      · function  public.admin_create_student(text, text, uuid[])
//      · grant     EXECUTE ON that function TO authenticated
//    ✅ ZERO NEW AUDIT STRINGS -- `admin.student_created` and
//    `admin.enrolment_changed` were BOTH already in the ratified 23.
//
// ⚠️ FIRST EMISSION OF EITHER STRING IN THE PROJECT'S HISTORY. Both were
//    ratified at Step 7H and had never been written by any code path, so this
//    suite is also the first evidence they are usable at all.
//
// ⛔ Exit code is the only verdict.
//
// Run: npm run prove:portal-p2-12
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
const MIGRATION = "20260816160000_portal_p2_12_admin_create_student.sql";

// ---------------------------------------------------------------------
// ⛔ PM-A -- WHAT THIS PHASE ADDED, NAMED RATHER THAN COUNTED.
// ---------------------------------------------------------------------
const sql = read(`supabase/migrations/${MIGRATION}`);
const declared = [...sql.matchAll(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+public\.([a-z0-9_]+)/gi)].map((m) => m[1]);
const grants = [...sql.matchAll(/GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.([a-z0-9_]+)[^;]*TO\s+([a-z_]+)/gi)].map(
  (m) => `${m[1]}→${m[2]}`,
);
check(
  readdirSync(join(ROOT, "supabase", "migrations")).filter((f) => /p2_12/i.test(f)).length === 1 &&
    declared.length === 1 &&
    declared[0] === "admin_create_student",
  `PM-A ⛔ ONE migration, ONE function: [${declared.join(",") || "none"}]`,
);
check(
  grants.length === 1 && grants[0] === "admin_create_student→authenticated",
  `PM-Aa ⛔ ONE grant: [${grants.join(",") || "none"}]`,
);
check(
  !/CREATE\s+TABLE|ALTER\s+TABLE|CREATE\s+TYPE|ALTER\s+TYPE|CREATE\s+POLICY|GRANT\s+(SELECT|INSERT|UPDATE|DELETE)/i.test(
    sql,
  ),
  "PM-Ab ⛔ no table, column, enum, policy or client table grant — read off the file",
);
const census = psql(`
SELECT 'C<' || (SELECT pg_catalog.count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE')
    || '|' || (SELECT pg_catalog.count(DISTINCT t.typname) FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typtype='e')
    || '|' || (SELECT pg_catalog.count(*) FROM pg_catalog.pg_policies WHERE schemaname='public')
    || '|' || (SELECT pg_catalog.array_length(public.audit_action_registry(),1)) || '>';
SELECT 'ALREADY<' || (public.audit_action_registry() @> ARRAY['admin.student_created','admin.enrolment_changed'])::text || '>';`);
check(
  between(census, "C") === "30|12|30|23" && between(census, "ALREADY") === "true",
  `PM-Ac ⛔ census UNMOVED at ${between(census, "C")} — ⚠️ **INCLUDING THE REGISTRY AT 23**: both strings this function emits were ALREADY ratified (${between(census, "ALREADY")}), and \`A-029\` makes a second name for an action that has one a §12 stop-and-ask`,
);

// ---------------------------------------------------------------------
// ⛔ PM-B -- POSTURE. ⚠️ VOLATILE, not STABLE — this one writes.
// ---------------------------------------------------------------------
const posture = psql(`
SELECT 'POSTURE<' || p.prosecdef::text || '|' || p.provolatile::text || '|' || coalesce(array_to_string(p.proconfig,','),'none') || '>'
  FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname='admin_create_student';
SELECT 'LIVEGRANTS<' || coalesce(string_agg(g.grantee || ':' || g.privilege_type, ',' ORDER BY g.grantee),'none') || '>'
  FROM information_schema.role_routine_grants g
 WHERE g.routine_schema='public' AND g.routine_name='admin_create_student' AND g.grantee <> 'postgres';`);
check(
  between(posture, "POSTURE") === 'true|v|search_path=""',
  `PM-B ⛔ SECURITY DEFINER + VOLATILE + \`search_path = ''\`: ${between(posture, "POSTURE")}`,
);
check(
  between(posture, "LIVEGRANTS") === "authenticated:EXECUTE",
  `PM-Ba ⛔ exactly one live grant, not \`anon\` or \`PUBLIC\`: ${between(posture, "LIVEGRANTS")}`,
);

// ---------------------------------------------------------------------
// ⛔ PM-C -- THE GOVERNED WRITE, EXECUTED AS REAL MANAGEMENT, ROLLED BACK.
// ⚠️ §26.1's ceiling: the migration's `PM-8` runs as `postgres` and returns
//    `not_permitted` at GATE 1. Everything below — the inserts, the audit
//    calls, the hash chain — is reached only here.
//
// ⚠️ AND THE AUDIT ROWS ARE READ AFTER `RESET ROLE`, INSIDE THE SAME
//    TRANSACTION. `audit_events` carries NO grant to `authenticated`, so the
//    first draft of this leg died on `permission denied for table
//    audit_events` with a HINT offering `GRANT SELECT ... TO authenticated`.
//    ⛔ THAT HINT IS A TRAP: taking it would make the audit log client-readable
//    to satisfy a test. The same trap as `PL-2` at `P1-1b`.
// ---------------------------------------------------------------------
const run = psql(`
SELECT 'BEFORE_STUDENTS<' || pg_catalog.count(*) || '>' FROM public.students;
SELECT 'BEFORE_AUDIT<' || pg_catalog.count(*) || '>' FROM public.audit_events;
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(MANAGEMENT)}', true);
SELECT 'CREATED<' || r.o_reason || '|' || r.o_enrolments || '|' || (r.o_student_id IS NOT NULL)::text || '>'
  FROM public.admin_create_student('Walkthrough','Registered',
       ARRAY(SELECT cm.id FROM public.class_modules cm ORDER BY cm.title LIMIT 2)) r;
SELECT 'R_UNKNOWN<' || (SELECT o_reason FROM public.admin_create_student('A','B', ARRAY['00000000-0000-4000-8000-000000000000'::uuid])) || '>';
SELECT 'R_NOCLASS<' || (SELECT o_reason FROM public.admin_create_student('A','B', ARRAY[]::uuid[])) || '>';
SELECT 'R_NONAME<' || (SELECT o_reason FROM public.admin_create_student('','B', ARRAY[]::uuid[])) || '>';
RESET ROLE;
SELECT 'AUDIT_NOW<' || pg_catalog.count(*) || '>' FROM public.audit_events;
SELECT 'EMITTED<' || string_agg(t.action || ':' || t.n, ',' ORDER BY t.action) || '>'
  FROM (SELECT action, pg_catalog.count(*) AS n FROM public.audit_events
         WHERE action IN ('admin.student_created','admin.enrolment_changed') GROUP BY action) t;
SELECT 'NAME_LEAK<' || pg_catalog.count(*) || '>' FROM public.audit_events
 WHERE payload::text ILIKE '%Walkthrough%' OR coalesce(target_label,'') ILIKE '%Walkthrough%';
ROLLBACK;
SELECT 'AFTER_STUDENTS<' || pg_catalog.count(*) || '>' FROM public.students;
SELECT 'AFTER_AUDIT<' || pg_catalog.count(*) || '>' FROM public.audit_events;`);
check(
  between(run, "CREATED") === "created|2|true",
  `PM-C ⛔ REAL MANAGEMENT, PAST EVERY GATE: ${between(run, "CREATED")} — one student and TWO enrolments in one transaction`,
);
const auditDelta = Number(between(run, "AUDIT_NOW")) - Number(between(run, "BEFORE_AUDIT"));
check(
  auditDelta === 3 && between(run, "EMITTED") === "admin.enrolment_changed:2,admin.student_created:1",
  `PM-Ca ⛔ THREE audit events for three governed actions (${auditDelta}): ${between(run, "EMITTED")} — ⚠️ ONE PER ENROLMENT, deliberately: each enrolment is separately mutable, and \`A-029\`'s correction-by-new-event needs a prior event per module to correct`,
);
check(
  between(run, "NAME_LEAK") === "0",
  `PM-Cb ⛔ THE CHILD'S NAME REACHES NO LABEL OR PAYLOAD (${between(run, "NAME_LEAK")}) — \`A-029\` data minimization, and \`CLAUDE.md\` §12 makes a child's name in an audit label a STOP-AND-ASK. ▶ The name is NON-VACUOUSLY present: the row was created under it, so a leak would have matched`,
);
check(
  between(run, "R_UNKNOWN") === "unknown_class" &&
    between(run, "R_NOCLASS") === "no_classes" &&
    between(run, "R_NONAME") === "invalid_name",
  `PM-Cc ⛔ THREE DISTINCT GOVERNED REFUSALS, not one generic failure: unknown_class=${between(run, "R_UNKNOWN")} · no_classes=${between(run, "R_NOCLASS")} · invalid_name=${between(run, "R_NONAME")} — ⚠️ \`unknown_class\` is a REFUSAL rather than a skipped row: enrolling into three of four requested classes and reporting success would be a lie the caller cannot see`,
);
check(
  between(run, "AFTER_STUDENTS") === between(run, "BEFORE_STUDENTS") &&
    between(run, "AFTER_AUDIT") === between(run, "BEFORE_AUDIT"),
  `PM-Cd …and the whole exercise LEFT NOTHING BEHIND: students ${between(run, "BEFORE_STUDENTS")}→${between(run, "AFTER_STUDENTS")}, audit ${between(run, "BEFORE_AUDIT")}→${between(run, "AFTER_AUDIT")}`,
);

// ---------------------------------------------------------------------
// ⛔ PM-D -- THE DISCRIMINATING NEGATIVE: A TRAINER IS REFUSED.
// ---------------------------------------------------------------------
const asTrainer = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(TRAINER)}', true);
SELECT 'T_REASON<' || r.o_reason || '|' || (r.o_student_id IS NULL)::text || '>'
  FROM public.admin_create_student('Should','NotExist',
       ARRAY(SELECT cm.id FROM public.class_modules cm ORDER BY cm.title LIMIT 1)) r;
RESET ROLE;
SELECT 'T_AUDIT<' || pg_catalog.count(*) || '>' FROM public.audit_events WHERE action='admin.student_created';
ROLLBACK;`);
check(
  between(asTrainer, "T_REASON") === "not_permitted|true",
  `PM-D ⛔ a TRAINER holding the same EXECUTE grant is refused: ${between(asTrainer, "T_REASON")} — ▶ the grant is reachability, never authorization; the function re-resolves management live (\`ADR-4\`)`,
);
check(
  between(asTrainer, "T_AUDIT") === "0",
  `PM-Da ⛔ AND THE REFUSAL EMITTED NOTHING (${between(asTrainer, "T_AUDIT")} events) — ⚠️ a denied attempt must not write an audit row: it would record an action that never happened`,
);

// ---------------------------------------------------------------------
// ⛔ PM-E -- NO FIELD WITHOUT A COLUMN IS INVENTED, AT THREE LAYERS.
// ---------------------------------------------------------------------
const MISSING = ["date_of_birth", "gender", "guardian", "home_address", "photo", "student_code"];
const bodyStart = sql.indexOf("$fn$");
const body = sql.slice(bodyStart, sql.indexOf("$fn$;", bodyStart + 4));
check(
  MISSING.every((f) => !new RegExp(`\\b${f}`, "i").test(stripComments(body))),
  "PM-E ⛔ LAYER 1, THE SQL: the body names no DOB, gender, guardian, address, photo or student code",
);
const contracts = read("lib/frontend/contracts/physical-test.ts");
const dtoStart = contracts.indexOf("export type RegisterStudentInput");
/* ⚠️ BOUNDED AT THE FIRST COLUMN-ZERO `};` — the `PS-8` defect. */
const dtoBody = contracts.slice(dtoStart, contracts.indexOf("\n};", dtoStart));
check(
  dtoStart > 0 &&
    dtoBody.length < 400 &&
    MISSING.every((f) => !new RegExp(f.replace(/_/g, "[_]?"), "i").test(stripComments(dtoBody))),
  `PM-Ea ⛔ LAYER 2, THE DTO: three fields only, over ${dtoBody.length} bounded chars — ▶ a DTO field with nowhere to go is how an invented column starts`,
);
const screen = read("features/management/management-register-student-screen.tsx");
const stripped = stripComments(screen);
const DISCLOSURE = /<p className="text-\[11\.5px\] leading-5 text-ink">[\s\S]*?<\/p>/g;
const disclosures = stripped.match(DISCLOSURE) ?? [];
const rendered = stripped.replace(DISCLOSURE, "");
check(
  disclosures.length === 1,
  `PM-Eb ⚠️ the on-page disclosure is SET ASIDE before the prohibition is scanned (${disclosures.length}) — the \`PT19-6\` defect: §12.12 REQUIRES that sentence`,
);
check(
  !/<input|<TextInput/.test(rendered.replace(/id="(first|last)-name"[\s\S]{0,400}?\/>/g, "")) ||
    (rendered.match(/<TextInput/g) ?? []).length === 2,
  `PM-Ec ⛔ LAYER 3, THE SCREEN: exactly TWO inputs render (${(rendered.match(/<TextInput/g) ?? []).length}) — ▶ **CITED, NOT DISABLED**: a greyed field implies it is coming; an absent one with a stated reason says what is true`,
);
check(
  /date of birth, gender, student reference number/i.test(screen) &&
    /guardian name, contact, email and home address/i.test(screen),
  "PM-Ed …and all seven omissions are named ON THE PAGE (§12.12), not only in a comment",
);

// ---------------------------------------------------------------------
// ⚠️ PM-F -- THE CHIPS COME FROM DATA, AND `Junior` IS NOT A GRADE.
// ---------------------------------------------------------------------
const frameHtml = read("UI_REFERENCE_FINAL_MVP/reference/Management - Register Student/Management - Register Student.html");
check(
  frameHtml.split("Junior").length - 1 > 0,
  `PM-F ⚠️ the frame really draws \`Junior\` (${frameHtml.split("Junior").length - 1}×) — ▶ so the check below refuses something that EXISTS`,
);
check(
  !/\bJunior\b/.test(rendered) && /data\.classes\.map/.test(rendered),
  "PM-Fa ⛔ …and no grade or class label is written LITERALLY in this component: the chips render from `data.classes`, so a fourth grade cannot appear by editing the screen (`A-016`, `A-054`; the `P2-1` registered omission)",
);
check(
  /listManagementClasses\(\)/.test(screen),
  "PM-Fb ⚠️ §12.10 FOR THE NINTH CONSECUTIVE PHASE: the class list is the EXISTING `listManagementClasses()` read — the row already carried it, so no second read was added",
);

// ---------------------------------------------------------------------
// PM-G -- THE LAYERS, THE ROUTE AND THE REGISTER.
// ---------------------------------------------------------------------
const FILES = [
  "server/modules/identity-access/student-registration.ts",
  "features/management/management-register-student-screen.tsx",
  "app/(portals)/management/students/register/page.tsx",
];
check(FILES.every((f) => existsSync(join(ROOT, ...f.split("/")))), `PM-G all ${FILES.length} layers exist`);
check(
  /```artefact-read[\s\S]*?screen: 20/.test(
    read("UI_REFERENCE_FINAL_MVP/20-management-register-student/implementation-notes.md"),
  ),
  "PM-Ga ✅ the artefact-read block exists — REQUIRED by `AR-1b`, not remembered",
);
const fixture = read("lib/frontend/fixtures/physical-test-fixture.ts");
check(
  /outcome: "unavailable"/.test(
    fixture.slice(fixture.indexOf("async registerStudent"), fixture.indexOf("async registerStudent") + 300),
  ),
  "PM-Gb ⛔ the FIXTURE REFUSES — ⚠️ and a WRITE is where refusing matters most: a fabricated success would tell an operator a child is registered and enrolled when no row exists anywhere",
);
check(
  /if \(!result\.ok\) return \{ outcome: "unavailable" \}/.test(
    read("server/modules/integration-adapter/participant-actions.ts").slice(
      read("server/modules/integration-adapter/participant-actions.ts").indexOf("adapterRegisterStudent"),
    ),
  ),
  "PM-Gc ⛔ a governed REFUSAL is reported as `unavailable`, never as a success carrying a reason — ▶ the screen must not be able to render \"registered\" over a row that does not exist",
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
process.exit(bad === 0 ? 0 : 1);
