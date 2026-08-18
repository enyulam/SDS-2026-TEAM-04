#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-13 -- screen `21` Create Parent Account.
// ⛔ ONE WRITE RPC AND ONE GRANT, AS AUTHORIZED. NAMED, NOT COUNTED:
//      · function  public.admin_create_parent(text, text, uuid[])
//      · grant     EXECUTE ON that function TO authenticated
//    ✅ ZERO NEW AUDIT STRINGS -- `admin.profile_created`, `invitation.created`
//    and `admin.parent_link_changed` were ALL already in the ratified 23.
//
// ⛔ Exit code is the only verdict.
//
// Run: npm run prove:portal-p2-13
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
const MIGRATION = "20260816180000_portal_p2_13_admin_create_parent.sql";

// ---------------------------------------------------------------------
// ⛔ PN-A -- WHAT THIS PHASE ADDED.
// ---------------------------------------------------------------------
const sql = read(`supabase/migrations/${MIGRATION}`);
const declared = [...sql.matchAll(/CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+public\.([a-z0-9_]+)/gi)].map((m) => m[1]);
const grants = [...sql.matchAll(/GRANT\s+EXECUTE\s+ON\s+FUNCTION\s+public\.([a-z0-9_]+)[^;]*TO\s+([a-z_]+)/gi)].map(
  (m) => `${m[1]}→${m[2]}`,
);
check(
  readdirSync(join(ROOT, "supabase", "migrations")).filter((f) => /p2_13/i.test(f)).length === 1 &&
    declared.length === 1 &&
    declared[0] === "admin_create_parent",
  `PN-A ⛔ ONE migration, ONE function: [${declared.join(",") || "none"}]`,
);
check(
  grants.length === 1 && grants[0] === "admin_create_parent→authenticated",
  `PN-Aa ⛔ ONE grant: [${grants.join(",") || "none"}]`,
);
check(
  !/CREATE\s+TABLE|ALTER\s+TABLE|CREATE\s+TYPE|ALTER\s+TYPE|CREATE\s+POLICY|GRANT\s+(SELECT|INSERT|UPDATE|DELETE)/i.test(
    sql,
  ),
  "PN-Ab ⛔ no table, column, enum, policy or client table grant",
);
const census = psql(`
SELECT 'C<' || (SELECT pg_catalog.count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE')
    || '|' || (SELECT pg_catalog.count(DISTINCT t.typname) FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typtype='e')
    || '|' || (SELECT pg_catalog.count(*) FROM pg_catalog.pg_policies WHERE schemaname='public')
    || '|' || (SELECT pg_catalog.array_length(public.audit_action_registry(),1)) || '>';
SELECT 'ALREADY<' || (public.audit_action_registry() @> ARRAY['admin.profile_created','invitation.created','admin.parent_link_changed'])::text || '>';`);
check(
  between(census, "C") === "30|12|30|24" && between(census, "ALREADY") === "true",
  `PN-Ac ⛔ census UNMOVED at ${between(census, "C")} — all THREE emitted strings were ALREADY ratified (${between(census, "ALREADY")})`,
);

// ---------------------------------------------------------------------
// ⛔ PN-B -- POSTURE.
// ---------------------------------------------------------------------
const posture = psql(`
SELECT 'POSTURE<' || p.prosecdef::text || '|' || p.provolatile::text || '|' || coalesce(array_to_string(p.proconfig,','),'none') || '>'
  FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='public' AND p.proname='admin_create_parent';
SELECT 'LIVEGRANTS<' || coalesce(string_agg(g.grantee || ':' || g.privilege_type, ',' ORDER BY g.grantee),'none') || '>'
  FROM information_schema.role_routine_grants g
 WHERE g.routine_schema='public' AND g.routine_name='admin_create_parent' AND g.grantee <> 'postgres';`);
check(
  between(posture, "POSTURE") === 'true|v|search_path=""',
  `PN-B ⛔ SECURITY DEFINER + VOLATILE + \`search_path = ''\`: ${between(posture, "POSTURE")}`,
);
check(
  between(posture, "LIVEGRANTS") === "authenticated:EXECUTE",
  `PN-Ba ⛔ exactly one live grant: ${between(posture, "LIVEGRANTS")}`,
);

// ---------------------------------------------------------------------
// ⛔ PN-C -- THE GOVERNED WRITE, AS REAL MANAGEMENT, ROLLED BACK.
// ⚠️ Audit rows are read after `RESET ROLE` INSIDE the transaction:
//    `audit_events` carries no grant to `authenticated`, and the HINT offering
//    `GRANT SELECT ... TO authenticated` is a trap.
// ---------------------------------------------------------------------
const run = psql(`
SELECT 'BEFORE<' || (SELECT pg_catalog.count(*) FROM public.accounts) || '|'
    || (SELECT pg_catalog.count(*) FROM public.parent_student_links) || '|'
    || (SELECT pg_catalog.count(*) FROM public.audit_events) || '>';
BEGIN;
CREATE TEMP TABLE _mark ON COMMIT DROP AS
  SELECT action, pg_catalog.count(*) AS n FROM public.audit_events
   WHERE action IN ('admin.profile_created','invitation.created','admin.parent_link_changed') GROUP BY action;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(MANAGEMENT)}', true);
SELECT 'CREATED<' || r.o_reason || '|' || r.o_links || '|' || (r.o_membership_id IS NOT NULL)::text
    || '|' || (r.o_invitation_id IS NOT NULL)::text || '>'
  FROM public.admin_create_parent('Walkthrough Guardian','wg.p213@example.test',
       ARRAY(SELECT s.id FROM public.students s ORDER BY s.full_name LIMIT 2), NULL) r;
SELECT 'R_NOSTU<' || (SELECT o_reason FROM public.admin_create_parent('A','a@b.co', ARRAY[]::uuid[], NULL)) || '>';
SELECT 'R_UNKNOWN<' || (SELECT o_reason FROM public.admin_create_parent('A','a@b.co', ARRAY['00000000-0000-4000-8000-000000000000'::uuid], NULL)) || '>';
SELECT 'R_BADMAIL<' || (SELECT o_reason FROM public.admin_create_parent('A','nope', ARRAY[]::uuid[], NULL)) || '>';
SELECT 'R_INUSE<' || (SELECT o_reason FROM public.admin_create_parent('A',
    (SELECT a.normalized_email FROM public.accounts a WHERE a.status='active' ORDER BY a.created_at LIMIT 1),
    ARRAY(SELECT s.id FROM public.students s LIMIT 1), NULL)) || '>';
RESET ROLE;
SELECT 'PENDING<' || (SELECT m.status::text FROM public.centre_memberships m ORDER BY m.created_at DESC LIMIT 1) || '>';
SELECT 'AUTHNULL<' || (SELECT (a.auth_user_id IS NULL)::text FROM public.accounts a ORDER BY a.created_at DESC LIMIT 1) || '>';
SELECT 'EMITTED<' || coalesce(string_agg(d.action || ':' || d.n, ',' ORDER BY d.action), '(none)') || '>'
  FROM (SELECT a.action, pg_catalog.count(*) - coalesce(pg_catalog.max(m.n), 0) AS n
          FROM public.audit_events a
          LEFT JOIN _mark m ON m.action = a.action
         WHERE a.action IN ('admin.profile_created','invitation.created','admin.parent_link_changed')
         GROUP BY a.action
        HAVING pg_catalog.count(*) - coalesce(pg_catalog.max(m.n), 0) > 0) d;
SELECT 'LEAK<' || pg_catalog.count(*) || '>' FROM public.audit_events
 WHERE payload::text ILIKE '%wg.p213%' OR payload::text ILIKE '%Walkthrough%'
    OR coalesce(target_label,'') ILIKE '%Walkthrough%' OR coalesce(target_label,'') ILIKE '%example.test%';
ROLLBACK;
SELECT 'AFTER<' || (SELECT pg_catalog.count(*) FROM public.accounts) || '|'
    || (SELECT pg_catalog.count(*) FROM public.parent_student_links) || '|'
    || (SELECT pg_catalog.count(*) FROM public.audit_events) || '>';`);
check(
  between(run, "CREATED") === "created|2|true|true",
  `PN-C ⛔ REAL MANAGEMENT, PAST EVERY GATE: ${between(run, "CREATED")} — account, PENDING membership, profile, invitation and TWO links in one transaction`,
);
check(
  between(run, "EMITTED") === "admin.parent_link_changed:2,admin.profile_created:1,invitation.created:1",
  `PN-Ca ⛔ FOUR audit events across THREE ratified strings: ${between(run, "EMITTED")} — ⚠️ ONE PER LINK, deliberately: each link is separately revocable and \`A-029\`'s correction-by-new-event needs a prior event per child`,
);
check(
  between(run, "PENDING") === "pending" && between(run, "AUTHNULL") === "true",
  `PN-Cb ⛔ the membership is \`${between(run, "PENDING")}\` and \`auth_user_id\` is NULL (${between(run, "AUTHNULL")}) — ▶ **a profile is not a login** (\`A-020\`), and activation is the RECIPIENT's act, never management's`,
);
check(
  between(run, "LEAK") === "0",
  `PN-Cc ⛔ NEITHER THE NAME NOR THE EMAIL REACHES A LABEL OR PAYLOAD (${between(run, "LEAK")}) — ▶ NON-VACUOUS: the rows were created under both, so a leak would have matched`,
);
check(
  between(run, "R_NOSTU") === "no_students" &&
    between(run, "R_UNKNOWN") === "unknown_student" &&
    between(run, "R_BADMAIL") === "invalid_email" &&
    between(run, "R_INUSE") === "email_in_use",
  `PN-Cd ⛔ FOUR DISTINCT GOVERNED REFUSALS: no_students=${between(run, "R_NOSTU")} · unknown_student=${between(run, "R_UNKNOWN")} · invalid_email=${between(run, "R_BADMAIL")} · email_in_use=${between(run, "R_INUSE")} — ⚠️ \`no_students\` matters most: a parent linked to no child gets a login that opens onto an empty portal, because \`parent_student_links\` is the ONLY thing that makes any report reachable for them`,
);
check(
  between(run, "AFTER") === between(run, "BEFORE"),
  `PN-Ce …and the whole exercise LEFT NOTHING BEHIND: ${between(run, "BEFORE")} → ${between(run, "AFTER")} (accounts|links|audit)`,
);

// ---------------------------------------------------------------------
// ⛔ PN-D -- A TRAINER IS REFUSED, AND THE REFUSAL WRITES NOTHING.
// ---------------------------------------------------------------------
const asTrainer = psql(`
BEGIN;
SELECT 'T_ACC_BEFORE<' || pg_catalog.count(*) || '>' FROM public.accounts;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(TRAINER)}', true);
SELECT 'T<' || r.o_reason || '|' || (r.o_membership_id IS NULL)::text || '>'
  FROM public.admin_create_parent('No','no@x.co', ARRAY(SELECT s.id FROM public.students s LIMIT 1), NULL) r;
RESET ROLE;
SELECT 'T_ACC_AFTER<' || pg_catalog.count(*) || '>' FROM public.accounts;
ROLLBACK;`);
check(
    // ⛔ UNCHANGED, NOT A CONSTANT. Re-aimed 2026-08-19, same root as PE-6 and
  //    PS-3: the claim is 'a denied attempt changed NOTHING', and a pinned
  //    absolute total says that only while nobody uses the product. An
  //    Operator walk on 2026-08-18 moved it and the leg went red on a fact it
  //    was never about.
  // ⚠️ BEFORE-vs-AFTER IS ALSO STRICTLY STRONGER: a pin is satisfied by a
  //    denied attempt that changed the count to some other constant.
  between(asTrainer, "T") === "not_permitted|true" &&
    between(asTrainer, "T_ACC_AFTER") === between(asTrainer, "T_ACC_BEFORE"),
  `PN-D ⛔ a TRAINER holding the same EXECUTE grant is refused and NOTHING was written: ${between(asTrainer, "T")}, accounts UNCHANGED at ${between(asTrainer, "T_ACC_BEFORE")} → ${between(asTrainer, "T_ACC_AFTER")} — ▶ the grant is reachability, never authorization`,
);

// ---------------------------------------------------------------------
// ⛔ PN-E -- THE DECOY, AND THE THREE OMISSIONS, AT THREE LAYERS.
// ---------------------------------------------------------------------
const decoy = psql(`
SELECT 'CHECK<' || pg_catalog.pg_get_constraintdef(c.oid) || '>'
  FROM pg_catalog.pg_constraint c
  JOIN pg_catalog.pg_class t ON t.oid = c.conrelid
 WHERE t.relname = 'parent_student_links' AND pg_catalog.pg_get_constraintdef(c.oid) ILIKE '%parent_role%'
   AND c.contype = 'c' LIMIT 1;`);
check(
  /'parent'/.test(between(decoy, "CHECK")),
  `PN-E ⚠️ THE DECOY, MEASURED AT SOURCE: \`parent_student_links.parent_role\` is pinned by \`${between(decoy, "CHECK")}\` — ▶ it reads exactly like the frame's \`Relationship\` field and would REFUSE \`Mother\`. Living register entry 1 (plan §37.1), consulted before the write path was written`,
);
const bodyStart = sql.indexOf("$fn$");
const body = stripComments(sql.slice(bodyStart, sql.indexOf("$fn$;", bodyStart + 4))).replace(/--[^\n]*/g, " ");
check(
  !/\brelationship\b|\bmother\b|\bphone\b|\bsend_invite\b/i.test(body),
  "PN-Ea ⛔ LAYER 1, THE SQL: the body names no relationship, phone or invite toggle",
);
const contracts = read("lib/frontend/contracts/physical-test.ts");
const dtoStart = contracts.indexOf("export type CreateParentInput");
const dtoBody = contracts.slice(dtoStart, contracts.indexOf("\n};", dtoStart));
check(
  dtoStart > 0 &&
    dtoBody.length < 900 &&
    /phone?: string | null/.test(dtoBody) &&
    !/relationship|sendInvite/i.test(stripComments(dtoBody)),
  `PN-Eb ⛔ LAYER 2, THE DTO: four fields, over ${dtoBody.length} bounded chars — phone IS present and OPTIONAL (C-14 ruled it onto accounts); relationship and the invite switch are NOT. ▶ Asserted POSITIVELY, so a later REMOVAL of phone fails here too, not only a later addition`,
);
const screen = read("features/management/management-create-parent-screen.tsx");
const stripped = stripComments(screen);
const DISCLOSURE = /<p className="text-\[12px\] leading-5 text-ink">[\s\S]*?<\/p>/g;
const disclosures = stripped.match(DISCLOSURE) ?? [];
const rendered = stripped.replace(DISCLOSURE, "");
check(
  disclosures.length === 1,
  `PN-Ec ⚠️ the on-page disclosure is SET ASIDE before the prohibition is scanned (${disclosures.length}) — the \`PT19-6\` defect`,
);
check(
  !/Relationship|Send email invite|Search Trainer|Junior|ID 20dd-/.test(rendered),
  "PN-Ed ⛔ LAYER 3, THE SCREEN: no Relationship, no Send-email-invite switch, no Search Trainer caption, no Junior, no ID 2025-113 — ⚠️ Phone is REMOVED from this prohibition by C-14 and is now BUILT; every other refusal stands",
);
check(
  /relationship to the child/i.test(screen) && /no email is\s*\n?\s*sent/i.test(screen),
  "PN-Ee …and both REMAINING omissions are named ON THE PAGE (§12.12) — ⚠️ narrowed from three by C-14: a page still saying the system holds no phone number, beside a working phone field, is a stale note on a live screen",
);

// ---------------------------------------------------------------------
// ⚠️ PN-F -- THE PROHIBITIONS REFUSE THINGS THAT EXIST.
// ---------------------------------------------------------------------
const frameHtml = read(
  "UI_REFERENCE_FINAL_MVP/reference/Management - Create Parents Account/Management - Create Parents Account.html",
);
const drawn = ["Relationship", "Mother", "Phone", "Send email invite", "Search Trainer", "Junior", "ID 2025-113"].map(
  (t) => `${t}:${frameHtml.split(t).length - 1}`,
);
check(
  drawn.every((d) => !d.endsWith(":0")),
  `PN-F ⚠️ THE FRAME REALLY DRAWS ALL SEVEN — [${drawn.join(", ")}] — ▶ so every refusal above refuses something that EXISTS (the \`PS-7c\` lesson)`,
);

// ---------------------------------------------------------------------
// PN-G -- THE LAYERS, THE ROUTE, THE REGISTER, THE FIXTURE.
// ---------------------------------------------------------------------
const FILES = [
  "server/modules/identity-access/parent-account-creation.ts",
  "features/management/management-create-parent-screen.tsx",
  "app/(portals)/management/students/create-parent-account/page.tsx",
];
check(FILES.every((f) => existsSync(join(ROOT, ...f.split("/")))), `PN-G all ${FILES.length} layers exist`);
check(
  /```artefact-read[\s\S]*?screen: 21/.test(
    read("UI_REFERENCE_FINAL_MVP/21-management-create-parents-account/implementation-notes.md"),
  ),
  "PN-Ga ✅ the artefact-read block exists — REQUIRED by `AR-1b`",
);
const fixture = read("lib/frontend/fixtures/physical-test-fixture.ts");
check(
  /outcome: "unavailable"/.test(
    fixture.slice(fixture.indexOf("async createParentAccount"), fixture.indexOf("async createParentAccount") + 300),
  ),
  "PN-Gb ⛔ the FIXTURE REFUSES — a fabricated success would tell an operator a guardian has portal access to a named child when no account, membership, invitation or link exists anywhere",
);
check(
  /nothing has left this system/i.test(screen),
  "PN-Gc ⛔ and the success banner says NOTHING WAS SENT — ▶ external delivery is deferred, and a message implying an email went out leaves an academy waiting for one",
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed check${bad === 1 ? "" : "s"})`);
process.exit(bad === 0 ? 0 : 1);
