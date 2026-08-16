#!/usr/bin/env node
// =====================================================================
// ⛔ C-14 — THE GUARDIAN PRECEDENCE RULE, IN BOTH DIRECTIONS
// =====================================================================
// Operator ruling, 2026-08-16, option (c), and its two required assertions
// VERBATIM:
//
//   "The rule: a linked account always wins; the free-text fields are what
//    registration captured before a link existed. Assert it — a test where
//    both exist and disagree, proving the account value is shown. Also assert
//    the columns are never written after a link exists."
//
// ⛔ TWO SIDES OF ONE RULE, AND A GATE THAT PROVED ONLY ONE WOULD BE HALF A
//    GATE — the `prove:ledger-current` lesson, applied here deliberately:
//
//      READ  — with a link present, the ACCOUNT's value is the one shown, even
//              when the free-text column holds something different.
//      WRITE — with a link present, the free-text columns CANNOT BE WRITTEN.
//              `admin_update_student` REFUSES (`guardian_locked`).
//
//    ▶ The write half is what makes the read half durable: if the columns
//      stayed writable, the two copies could be edited apart, and the read
//      rule would merely be HIDING a divergence rather than preventing one.
//
// ⚠️ THE DIVERGENCE IS CONSTRUCTED, THEN ROLLED BACK. Every statement runs in
//    ONE transaction ending in `ROLLBACK`, so the fixture is unchanged. The
//    construction is deliberate: no fixture student currently has BOTH a link
//    and a conflicting free-text guardian, so a leg that only READ live data
//    would be vacuously true — it would find no disagreement to resolve.
//
// ⚠️ STATED LIMIT, NOT IMPLIED — SEE `CG-6`. The read rule lives in
//    TypeScript, and this project has no TS runner in its suites. The SQL legs
//    here EXECUTE; the TypeScript leg is a SOURCE assertion with an inversion
//    control. That is weaker and is said so, rather than left to be assumed
//    from a green run.
//
// ⛔ Exit code is the only verdict. An unreachable stack is NOT-RUN (exit 2).
//
// Run: npm run prove:c14-guardian
// =====================================================================

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { assertConfigProjectId, resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const { projectId: PROJECT_ID, dbContainer: DB_CONTAINER } = resolveLocalTarget();
assertConfigProjectId(
  (readFileSync(join(ROOT, "supabase", "config.toml"), "utf8").match(/^\s*project_id\s*=\s*"([^"]+)"/m) ?? [])[1] ?? "",
  PROJECT_ID,
);

let bad = 0;
const check = (ok, msg) => {
  if (!ok) bad += 1;
  console.log(`${ok ? "PASS" : "FAIL"}    ${msg}`);
};
const psql = (sql) =>
  (
    spawnSync(
      "docker",
      ["exec", "-i", DB_CONTAINER, "psql", "--no-psqlrc", "-U", "postgres", "-d", "postgres", "-tAX", "-c", sql],
      { encoding: "utf8" },
    ).stdout ?? ""
  ).trim();
const grab = (blob, key) => (blob.match(new RegExp(`^${key}=(.*)$`, "m")) ?? [])[1] ?? "";

const MGMT = "d0000000-0000-4000-8000-000000000001";
const claims = (sub) => `{"sub":"${sub}","role":"authenticated"}`;

// The two values that must disagree. Fixed literals — §12.17: a sentinel drawn
// from live data is not a sentinel, and a control derived from the state under
// test inherits its faults.
const FREE_TEXT_NAME = "CG-PRELINK-NAME";
const FREE_TEXT_PHONE = "CG-PRELINK-PHONE";

// ---------------------------------------------------------------------
// CG-0 -- NON-VACUITY. A linked student must exist, or every leg is true
//         of a database with nothing to resolve.
// ---------------------------------------------------------------------
const seed = psql(`
SELECT 'LINKED=' || (SELECT pg_catalog.count(*) FROM public.parent_student_links WHERE is_active)
    || E'\\nSTUDENTS=' || (SELECT pg_catalog.count(*) FROM public.students WHERE is_active)
    || E'\\nCOLS=' || (SELECT pg_catalog.count(*) FROM information_schema.columns
                       WHERE table_schema='public' AND table_name='students'
                         AND column_name IN ('date_of_birth','guardian_name','guardian_contact'));`);
const linked = Number(grab(seed, "LINKED"));
const cols = Number(grab(seed, "COLS"));
if (seed === "" || Number.isNaN(linked)) {
  console.log("NOT-RUN  the stack is unreachable — an absent database cannot prove a precedence rule");
  process.exit(2);
}
check(
  linked > 0 && Number(grab(seed, "STUDENTS")) > 0 && cols === 3,
  `CG-0   ⚠️ NON-VACUITY FIRST: ${linked} active parent link(s), ${grab(seed, "STUDENTS")} active student(s), ${cols}/3 \`C-14\` columns present — ▶ with zero links there is no precedence to decide and every leg below would pass meaning nothing`,
);

// ---------------------------------------------------------------------
// ⛔ CG-1 / CG-2 -- THE READ HALF. Both sources exist and DISAGREE.
// ---------------------------------------------------------------------
/*
 * ⚠️ THE SAME TRANSACTION BUILDS THE DIVERGENCE AND READS IT BACK, then rolls
 * it back. Reading a value this transaction did not write would prove nothing
 * about a conflict, because no conflict exists in the fixture.
 */
const read = psql(`
BEGIN;
UPDATE public.students SET guardian_name = '${FREE_TEXT_NAME}', guardian_contact = '${FREE_TEXT_PHONE}'
 WHERE id = (SELECT l.student_id FROM public.parent_student_links l WHERE l.is_active ORDER BY l.student_id LIMIT 1);

SELECT 'ACCOUNT_NAME=' || coalesce(a.display_name, '(none)')
  FROM public.parent_student_links l
  JOIN public.centre_memberships m ON m.id = l.parent_membership_id
  JOIN public.accounts a ON a.id = m.account_id
 WHERE l.is_active
 ORDER BY l.student_id
 LIMIT 1;

SELECT 'FREE_TEXT_NAME=' || coalesce(s.guardian_name, '(none)')
    || E'\\nFREE_TEXT_PHONE=' || coalesce(s.guardian_contact, '(none)')
  FROM public.students s
 WHERE s.id = (SELECT l.student_id FROM public.parent_student_links l WHERE l.is_active ORDER BY l.student_id LIMIT 1);
ROLLBACK;`);
const accountName = grab(read, "ACCOUNT_NAME");
check(
  accountName !== "" &&
    accountName !== "(none)" &&
    grab(read, "FREE_TEXT_NAME") === FREE_TEXT_NAME &&
    accountName !== FREE_TEXT_NAME,
  `CG-1   ⛔ BOTH SOURCES EXIST AND DISAGREE: the linked account says "${accountName}", the pre-link column says "${grab(read, "FREE_TEXT_NAME")}" — ▶ the precedence rule now has something real to decide, which is exactly what a leg over unmodified fixture data could not establish`,
);

const rolledBack = psql(`
SELECT 'RESIDUE=' || pg_catalog.count(*) FROM public.students
 WHERE guardian_name = '${FREE_TEXT_NAME}' OR guardian_contact = '${FREE_TEXT_PHONE}';`);
check(
  grab(rolledBack, "RESIDUE") === "0",
  `CG-2   ⛔ AND THE CONSTRUCTION LEFT NO RESIDUE: ${grab(rolledBack, "RESIDUE")} row(s) still carry the sentinel — ▶ a suite that mutates the fixture and does not prove the rollback is a suite that quietly changes what every LATER suite measures`,
);

// ---------------------------------------------------------------------
// ⛔ CG-3 / CG-4 -- THE WRITE HALF, EXECUTED. This one is not a source read.
// ---------------------------------------------------------------------
/*
 * ⛔ A REFUSAL IS THE ASSERTION. `admin_update_student` refuses rather than
 * silently ignoring a guardian value once a link exists — the design choice
 * that makes the rule ASSERTABLE at all. A silent ignore would return `saved`
 * and be indistinguishable from a write that took.
 */
const write = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(MGMT)}', true);

SELECT 'LOCKED=' || o_reason FROM public.admin_update_student(
  (SELECT l.student_id FROM public.parent_student_links l WHERE l.is_active ORDER BY l.student_id LIMIT 1),
  'Probe', 'Child',
  (SELECT pg_catalog.array_agg(e.class_module_id) FROM public.enrolments e
    WHERE e.is_active AND e.student_id = (SELECT l.student_id FROM public.parent_student_links l WHERE l.is_active ORDER BY l.student_id LIMIT 1)),
  NULL, '${FREE_TEXT_NAME}', NULL);

SELECT 'UNWRITTEN=' || coalesce(s.guardian_name, '(null)')
  FROM public.students s
 WHERE s.id = (SELECT l.student_id FROM public.parent_student_links l WHERE l.is_active ORDER BY l.student_id LIMIT 1);
ROLLBACK;`);
check(
  grab(write, "LOCKED") === "guardian_locked",
  `CG-3   ⛔ THE WRITE IS REFUSED ONCE A LINK EXISTS: \`admin_update_student\` returned "${grab(write, "LOCKED") || "NOTHING — the call did not execute"}", expected \`guardian_locked\` — ▶ EXECUTED, not read from source, and a refusal traverses the whole body`,
);
check(
  grab(write, "UNWRITTEN") !== FREE_TEXT_NAME,
  `CG-4   ⛔ AND THE COLUMN IS UNCHANGED: it holds "${grab(write, "UNWRITTEN")}", not the rejected value — ▶ a function can return a refusal AFTER writing; this is the leg that separates "reported refused" from "did not write"`,
);

// ---------------------------------------------------------------------
// ⛔ CG-5 -- THE CONTROL: THE REFUSAL DISCRIMINATES.
// ---------------------------------------------------------------------
/*
 * ⚠️ WITHOUT THIS, `CG-3` IS SATISFIED BY A FUNCTION THAT REFUSES EVERYTHING.
 * The same call with `NULL` guardian values must SUCCEED — the linked case
 * must block the guardian fields and nothing else, or the ruling would have
 * made a linked learner uneditable.
 */
const control = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(MGMT)}', true);
SELECT 'ALLOWED=' || o_reason FROM public.admin_update_student(
  (SELECT l.student_id FROM public.parent_student_links l WHERE l.is_active ORDER BY l.student_id LIMIT 1),
  'Probe', 'Child',
  (SELECT pg_catalog.array_agg(e.class_module_id) FROM public.enrolments e
    WHERE e.is_active AND e.student_id = (SELECT l.student_id FROM public.parent_student_links l WHERE l.is_active ORDER BY l.student_id LIMIT 1)),
  NULL, NULL, NULL);
ROLLBACK;`);
check(
  grab(control, "ALLOWED") === "saved",
  `CG-5   ⛔ CONTROL — THE LOCK IS NARROW: the same linked learner saves normally when the guardian fields are \`null\` ("${grab(control, "ALLOWED") || "NOTHING"}") — ▶ without this, \`CG-3\` would be equally satisfied by a function that refused every edit to a linked learner`,
);

// ---------------------------------------------------------------------
// CG-6 -- THE TYPESCRIPT HALF, AND ITS STATED LIMIT.
// ---------------------------------------------------------------------
const projection = readFileSync(
  join(ROOT, "server", "modules", "management-view", "student-profile-projections.ts"),
  "utf8",
);
const NAME_RULE = "guardianName: guardians ?? row.guardian_name";
const CONTACT_RULE = "guardianContact: guardians !== null ? null : row.guardian_contact";
const INVERTED = "guardianName: row.guardian_name ?? guardians";
check(
  projection.includes(NAME_RULE) && projection.includes(CONTACT_RULE) && !projection.includes(INVERTED),
  `CG-6   the shipped projection applies the ruled precedence — the ACCOUNT value first (\`${NAME_RULE}\`) and the pre-link contact suppressed entirely once linked (\`${CONTACT_RULE}\`), with the INVERTED form absent`,
);
console.log(
  `INFO    CG-6b  ⚠️ STATED LIMIT: \`CG-6\` is a SOURCE assertion, not an execution. This project's suites have no TypeScript runner, so the read rule cannot be exercised the way \`CG-3\` exercises the write rule. ▶ What makes the gap tolerable is that the WRITE half IS executed: with the columns unwritable after a link, the read rule has no divergence left to hide.`,
);

// ---------------------------------------------------------------------
// CG-7 -- THE EDITOR AGREES WITH THE SERVER.
// ---------------------------------------------------------------------
const editor = readFileSync(join(ROOT, "features", "management", "management-edit-student-screen.tsx"), "utf8");
check(
  /profile\?\.guardianLinked \|\| guardianName\.trim\(\)\.length === 0 \? null/.test(editor) &&
    /profile\.guardianLinked \?/.test(editor),
  "CG-7   screen `22` sends `null` for both guardian fields when linked AND does not render them — ⛔ NOT a disabled input: `P2-10`'s rule is that DISABLED means \"not yet\" and ABSENT means \"not a thing\", and a linked guardian has no writable counterpart at all",
);
check(
  /setDateOfBirth\(one\.data\.dateOfBirth \?\? ""\)/.test(editor),
  "CG-8   ⛔ AND THE EDITOR LOADS THE DATE OF BIRTH BEFORE SAVING IT. `admin_update_student` takes it as a FULL REPLACEMENT, so a blank form would send `null` and WIPE A CHILD'S DATE OF BIRTH ON A RENAME — silently, reporting success",
);

// ---------------------------------------------------------------------
// ⛔ CG-9 -- ALL FOUR NEW SIGNATURES EXECUTE, AS A REAL MANAGEMENT CALLER.
// ---------------------------------------------------------------------
/*
 * ⛔ THIS IS THE §26.1 LEG, AND IT IS THE ONE THE MIGRATION CANNOT HAVE. The
 * migration's own `C14W-3` calls each function as OWNER, where
 * `app_current_account_id()` is NULL and every one returns at its FIRST gate.
 * That proves the body RESOLVES; it does not prove the body WORKS. Only a real
 * management caller reaches the inserts, the audit calls and the new columns.
 *
 * ⚠️ AND IT IS WHAT THE PAIRING RULE ASKS FOR. `20260816230000` declares four
 * functions, and `uncalledFunctions` requires the paired suite to call every
 * one — not the most interesting one.
 *
 * ⚠️ EVERY ROW IS ROLLED BACK. `CG-10` proves it, because a suite that creates
 * a student, a parent account and a trainer invitation on every run would
 * change what every LATER suite measures.
 */
const all4 = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(MGMT)}', true);

SELECT 'STUDENT=' || o_reason || '|' || coalesce(o_enrolments::text, '?')
  FROM public.admin_create_student(
    'CG', 'Probe',
    ARRAY[(SELECT id FROM public.class_modules ORDER BY id LIMIT 1)],
    DATE '2018-08-14', '${FREE_TEXT_NAME}', '${FREE_TEXT_PHONE}');

SELECT 'DOB_WRITTEN=' || coalesce(s.date_of_birth::text, '(null)')
    || E'\\nGUARDIAN_WRITTEN=' || coalesce(s.guardian_name, '(null)')
    || E'\\nCONTACT_WRITTEN=' || coalesce(s.guardian_contact, '(null)')
  FROM public.students s WHERE s.full_name = 'CG Probe';

SELECT 'UPDATE=' || o_reason FROM public.admin_update_student(
  (SELECT id FROM public.students WHERE full_name = 'CG Probe'),
  'CG', 'Probe',
  ARRAY[(SELECT id FROM public.class_modules ORDER BY id LIMIT 1)],
  DATE '2019-01-02', 'CG-EDITED', NULL);

SELECT 'DOB_EDITED=' || coalesce(s.date_of_birth::text, '(null)')
    || E'\\nGUARDIAN_EDITED=' || coalesce(s.guardian_name, '(null)')
  FROM public.students s WHERE s.full_name = 'CG Probe';

SELECT 'PARENT=' || o_reason FROM public.admin_create_parent(
  'CG Guardian', 'cg.probe@example.test',
  ARRAY[(SELECT id FROM public.students WHERE full_name = 'CG Probe')],
  '+65 8000 0001');

SELECT 'TRAINER=' || o_reason FROM public.admin_create_trainer(
  'CG Trainer', 'cg.trainer@example.test', '+65 8000 0002');

SELECT 'PHONES=' || coalesce(pg_catalog.string_agg(a.phone, ',' ORDER BY a.phone), '(none)')
  FROM public.accounts a WHERE a.normalized_email IN ('cg.probe@example.test', 'cg.trainer@example.test');
ROLLBACK;`);
check(
  grab(all4, "STUDENT") === "created|1" &&
    grab(all4, "UPDATE") === "saved" &&
    grab(all4, "PARENT") === "created" &&
    grab(all4, "TRAINER") === "created",
  `CG-9   ⛔ ALL FOUR REBUILT SIGNATURES EXECUTE PAST EVERY GATE: create_student=${grab(all4, "STUDENT") || "NOTHING"} · update_student=${grab(all4, "UPDATE") || "NOTHING"} · create_parent=${grab(all4, "PARENT") || "NOTHING"} · create_trainer=${grab(all4, "TRAINER") || "NOTHING"} — ▶ the migration's own apply-time probe runs as OWNER and returns at the FIRST gate, so it proves RESOLUTION, never that the body works`,
);
check(
  grab(all4, "DOB_WRITTEN") === "2018-08-14" &&
    grab(all4, "GUARDIAN_WRITTEN") === FREE_TEXT_NAME &&
    grab(all4, "CONTACT_WRITTEN") === FREE_TEXT_PHONE &&
    grab(all4, "DOB_EDITED") === "2019-01-02" &&
    grab(all4, "GUARDIAN_EDITED") === "CG-EDITED",
  `CG-9b  ⛔ AND THE THREE NEW COLUMNS ARE ACTUALLY WRITTEN, on create AND on edit: created ${grab(all4, "DOB_WRITTEN")}/${grab(all4, "GUARDIAN_WRITTEN")}/${grab(all4, "CONTACT_WRITTEN")} then edited to ${grab(all4, "DOB_EDITED")}/${grab(all4, "GUARDIAN_EDITED")} — ▶ a signature can accept three parameters and DISCARD them, which every structural assertion would still call a pass`,
);
check(
  grab(all4, "PHONES") === "+65 8000 0001,+65 8000 0002",
  `CG-9c  ⛔ AND \`accounts.phone\` IS WRITTEN BY BOTH ACCOUNT PATHS: ${grab(all4, "PHONES") || "NOTHING"} — ▶ non-vacuous in both directions: parent and trainer are separate functions and a fix to one proves nothing about the other`,
);

const residue = psql(`
SELECT 'LEFT=' || (SELECT pg_catalog.count(*) FROM public.students WHERE full_name = 'CG Probe')
    || '|' || (SELECT pg_catalog.count(*) FROM public.accounts
                WHERE normalized_email IN ('cg.probe@example.test', 'cg.trainer@example.test'));`);
check(
  grab(residue, "LEFT") === "0|0",
  `CG-10  ⛔ AND CG-9 LEFT NOTHING BEHIND: ${grab(residue, "LEFT")} (students|accounts) — ▶ a suite that creates a learner, a guardian account and a trainer invitation on every run silently changes what every LATER suite measures`,
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed checks)`);
process.exit(bad === 0 ? 0 : 1);
