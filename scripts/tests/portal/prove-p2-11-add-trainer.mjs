#!/usr/bin/env node
// =====================================================================
// PORTAL PHASE P2-11 -- screen `24` Management Add Trainer.
// ONE SECURITY DEFINER FUNCTION, ONE EXECUTE GRANT.
// =====================================================================
// ⛔ THE OPERATOR NAMED THE HARD PART OF THIS PHASE, AND IT IS NOT THE
//    CREATION -- it is the BOUNDARY:
//
//      *"Assert the boundary: the function must not widen anything beyond
//       the invitation it creates. No grant to authenticated on invitations,
//       accounts or centre_memberships -- they stay SELECT-only. **Prove the
//       deny with a control that discriminates, and do NOT let it read like
//       PT-3b.**"*
//
// ⚠️ `PT-3b` PASSED WHILE PROVING NOTHING: it compared management's count
//    against a trainer's, both read 1, and `1 <= 1` is equally true of a table
//    with no policy at all. ▶ THE FIX IS NOT "a better number". It is that
//    **the SAME caller must be shown SUCCEEDING somewhere the policy permits**,
//    so a zero is DISCRIMINATION rather than BLINDNESS -- the `D1a-6` shape.
//    `PA-4` and `PA-5` are built that way and say so in their own output.
//
// ⛔ Exit code is the only verdict.
//
// Run: npm run prove:portal-p2-11
// =====================================================================

import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { assertConfigProjectId, resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";
import { unpairedMigrations, rpcsWithoutApplicationCaller, isProvablyInternal } from "./rpc-call-rule.mjs";
import { stripComments } from "./artefact-read-rule.mjs";
import { ratingLeaks, proveNarrowing } from "./rating-leak-rule.mjs";

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
const run = (sql) => {
  const r = spawnSync(
    "docker",
    ["exec", "-i", DB_CONTAINER, "psql", "--no-psqlrc", "-U", "postgres", "-d", "postgres", "-tAX", "-c", sql],
    { encoding: "utf8" },
  );
  return { out: (r.stdout ?? "").trim(), err: (r.stderr ?? "").trim() };
};
const psql = (sql) => run(sql).out;

const MGMT = "d0000000-0000-4000-8000-000000000001";
const TRAINER = "d0000000-0000-4000-8000-000000000002";
const claims = (sub) => `{"sub":"${sub}","role":"authenticated"}`;
const grab = (blob, key) => (blob.match(new RegExp(`^${key}=(.*)$`, "m")) ?? [])[1] ?? "";

// ---------------------------------------------------------------------
// PA-0 -- THE MIGRATION IS APPLIED, and the function exists as authorized.
// ---------------------------------------------------------------------
const migrations = readdirSync(join(ROOT, "supabase", "migrations")).filter((f) => f.endsWith(".sql"));
check(
  migrations.includes("20260815120000_portal_p2_11_admin_create_trainer.sql"),
  `PA-0   the P2-11 migration is in the tree (${migrations.length} files)`,
);
const applied = psql(
  "SELECT version FROM supabase_migrations.schema_migrations WHERE version = '20260815120000';",
);
check(applied === "20260815120000", `PA-0b  and it is RECORDED APPLIED (${applied || "NOT APPLIED"})`);

const fnShape = psql(`
SELECT 'ARGS=' || pg_catalog.pg_get_function_identity_arguments(p.oid) ||
       ' SECDEF=' || p.prosecdef ||
       ' PATH=' || pg_catalog.array_to_string(p.proconfig, ';') ||
       ' SET=' || p.proretset
  FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
 WHERE n.nspname = 'public' AND p.proname = 'admin_create_trainer';`);
check(
  fnShape.includes("SECDEF=t") && fnShape.includes('PATH=search_path=""') && fnShape.includes("SET=f"),
  `PA-1   admin_create_trainer is SECURITY DEFINER with search_path pinned and proretset=false: ${fnShape}`,
);
/*
 * ⚠️ `proretset = false` IS NOT COSMETIC. PostgREST resolves a non-set
 * `RETURNS record` to a BARE OBJECT, so an application reading it as an array
 * finds `undefined` on a call that succeeded. The application layer uses
 * `firstRpcRow`, which accepts both; PA-1 pins the shape it was written for.
 */

// ---------------------------------------------------------------------
// PA-2 -- EXACTLY ONE FUNCTION AND ONE GRANT WERE ADDED.
// ---------------------------------------------------------------------
const grants = psql(`
SELECT 'AUTH=' || pg_catalog.has_function_privilege('authenticated','public.admin_create_trainer(text, text)','EXECUTE')::text
    || ' ANON=' || pg_catalog.has_function_privilege('anon','public.admin_create_trainer(text, text)','EXECUTE')::text;`);
check(
  grants === "AUTH=true ANON=false",
  `PA-2   the ONE grant, and only the one: ${grants} -- an anon EXECUTE would let an unauthenticated caller create staff`,
);

const src = readFileSync(
  join(ROOT, "supabase", "migrations", "20260815120000_portal_p2_11_admin_create_trainer.sql"),
  "utf8",
);
const grantLines = src.split(/\r?\n/).filter((l) => /^\s*GRANT\b/i.test(l));
const ddl = src.split(/\r?\n/).filter((l) => /^\s*(CREATE|ALTER)\s+(TABLE|TYPE|POLICY|INDEX)\b/i.test(l));
check(
  grantLines.length === 1 && ddl.length === 0,
  `PA-2b  and the FILE agrees: ${grantLines.length} GRANT statement, ${ddl.length} table/type/policy/index DDL -- the authorization was "no table, column, enum, policy"`,
);

// ---------------------------------------------------------------------
// PA-3 -- THE CENSUS DID NOT MOVE.
// ---------------------------------------------------------------------
const census = psql(`
SELECT 'T=' || (SELECT pg_catalog.count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE')
    || ' E=' || (SELECT pg_catalog.count(DISTINCT t.typname) FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public' AND t.typtype='e')
    || ' P=' || (SELECT pg_catalog.count(*) FROM pg_catalog.pg_policies WHERE schemaname='public')
    || ' R=' || (SELECT pg_catalog.array_length(public.audit_action_registry(),1));`);
check(
  // re-pinned 23 -> 24 at P2-14 (Operator authorization, 2026-08-16, admin.student_updated); STILL AN EQUALITY, deliberately
  census === "T=30 E=12 P=30 R=24",
  `PA-3   census UNMOVED: ${census} (expected T=30 E=12 P=30 R=24) -- "Registry unmoved, since both strings exist" was explicit`,
);

// ---------------------------------------------------------------------
// ⛔ PA-4 -- THE DENY, WITH A CONTROL THAT DISCRIMINATES.
//
// A leg that only reports "the write was refused" is worthless: a broken
// connection, a typo'd table name and a correct policy all produce it. ▶ THE
// SAME SESSION, IN THE SAME TRANSACTION, IS SHOWN **READING** EACH TABLE
// SUCCESSFULLY -- so the zero on the write is the POLICY discriminating, not
// the session being blind.
// ---------------------------------------------------------------------
/*
 * ⚠️ THREE SEPARATE PROBES, NOT ONE `DO` BLOCK. A `DO` block can only report
 * through `RAISE`, and `RAISE NOTICE` goes to STDERR while `RAISE EXCEPTION`
 * aborts the transaction and discards every label printed before it. ▶ Each
 * probe is its own transaction, and the REFUSAL IS READ OFF `psql`'s OWN
 * ERROR STREAM — the database's words, not a string this suite composed.
 */
const WRITE_PROBES = [
  {
    id: "accounts",
    sql: `INSERT INTO public.accounts (display_name, normalized_email)
          VALUES ('PA4 probe', 'pa4.probe@example.test');`,
  },
  {
    id: "centre_memberships",
    sql: `INSERT INTO public.centre_memberships (account_id, centre_id, role, status)
          SELECT a.id, c.id, 'trainer', 'pending'
            FROM public.accounts a, public.centres c LIMIT 1;`,
  },
  {
    id: "invitations",
    sql: `INSERT INTO public.invitations
            (centre_id, membership_id, invited_by_membership_id, invited_by_role,
             email_normalized, status, expires_at)
          SELECT c.id, m.id, m.id, 'management', 'pa4.probe@example.test', 'pending',
                 pg_catalog.now() + '1 day'::interval
            FROM public.centres c, public.centre_memberships m LIMIT 1;`,
  },
];

const probe = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(MGMT)}', true);
SELECT 'READ_ACC=' || pg_catalog.count(*) FROM public.accounts;
SELECT 'READ_MEM=' || pg_catalog.count(*) FROM public.centre_memberships;
SELECT 'READ_PROF=' || pg_catalog.count(*) FROM public.trainer_profiles;
ROLLBACK;`);
const readAcc = Number(grab(probe, "READ_ACC"));
const readMem = Number(grab(probe, "READ_MEM"));
const readProf = Number(grab(probe, "READ_PROF"));
check(
  readAcc > 0 && readMem > 0 && readProf > 0,
  `PA-4   ⛔ THE POSITIVE HALF OF THE DENY. The SAME management identity READS accounts=${readAcc}, centre_memberships=${readMem}, trainer_profiles=${readProf} — all non-zero. ▶ Without this, every refusal below is indistinguishable from a session that can see nothing at all (the PT-3b defect)`,
);

const writeResults = WRITE_PROBES.map(({ id, sql }) => {
  const r = run(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(MGMT)}', true);
${sql}
ROLLBACK;`);
  const denied = /permission denied/i.test(r.err);
  const inserted = /^INSERT 0 [1-9]/m.test(r.out) || /^INSERT 0 [1-9]/m.test(r.err);
  return { id, denied, inserted, note: denied ? "permission denied" : inserted ? "INSERTED" : "other" };
});
check(
  writeResults.every((w) => w.denied && !w.inserted),
  `PA-4b  ⛔ AND THE NEGATIVE HALF: that same identity is REFUSED on every write — ${writeResults
    .map((w) => `${w.id}:${w.note}`)
    .join(" · ")}. ▶ It reads and cannot write, which is exactly what "SELECT-only" has to mean, and the refusal is PostgreSQL's own message rather than a verdict this suite composed`,
);

// ---------------------------------------------------------------------
// PA-5 -- THE PRIVILEGE SETS, PINNED PER TABLE AS EXACT SETS.
// ---------------------------------------------------------------------
const privs = psql(`
SELECT e.tbl || '=' || coalesce(
         (SELECT pg_catalog.string_agg(DISTINCT g.privilege_type::text, ',' ORDER BY g.privilege_type::text)
            FROM information_schema.role_table_grants g
           WHERE g.table_schema='public' AND g.table_name::text = e.tbl AND g.grantee='authenticated'),
         '(none)')
  FROM (VALUES ('invitations'),('accounts'),('centre_memberships'),('trainer_profiles')) AS e(tbl);`);
const expected = {
  invitations: "(none)",
  accounts: "SELECT",
  centre_memberships: "SELECT",
  trainer_profiles: "SELECT",
};
const wrong = Object.entries(expected).filter(([t, want]) => grab(privs, t) !== want);
check(
  wrong.length === 0,
  `PA-5   ⛔ EXACT PRIVILEGE SETS, not floors: ${privs.replace(/\r?\n/g, " · ")} (offenders: ${wrong.map(([t]) => t).join(", ") || "none"}). ⚠️ Note invitations holds NO grant at all — narrower than the authorization's wording, and pinned to what is TRUE rather than to the paraphrase`,
);

// ---------------------------------------------------------------------
// PA-6 -- THE GOVERNED CREATION ACTUALLY WORKS, end to end, and is UNDONE.
//         ⚠️ Run inside a rolled-back transaction: this suite must leave the
//         fixture byte-identical, and a trainer created here would show up on
//         screen `23` forever.
// ---------------------------------------------------------------------
const created = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(MGMT)}', true);
SELECT 'R1=' || coalesce(o_reason,'(null)') || ' M1=' || (o_membership_id IS NOT NULL)::text || ' I1=' || (o_invitation_id IS NOT NULL)::text
  FROM public.admin_create_trainer('Pa6 Probe', 'PA6.Probe@Example.Test');
SELECT 'ACCOUNTS=' || pg_catalog.count(*) FROM public.accounts a
 WHERE a.normalized_email = 'pa6.probe@example.test' AND a.auth_user_id IS NULL;
SELECT 'MEMBERSHIP=' || coalesce(pg_catalog.string_agg(m.role::text || '/' || m.status::text, ','), '(none)')
  FROM public.centre_memberships m
  JOIN public.accounts a ON a.id = m.account_id
 WHERE a.normalized_email = 'pa6.probe@example.test';
SELECT 'PROFILE=' || pg_catalog.count(*) FROM public.trainer_profiles p
  JOIN public.centre_memberships m ON m.id = p.membership_id
  JOIN public.accounts a ON a.id = m.account_id
 WHERE a.normalized_email = 'pa6.probe@example.test';
RESET ROLE;
SELECT 'INVITE=' || coalesce(pg_catalog.string_agg(i.status::text, ','), '(none)')
  FROM public.invitations i WHERE i.email_normalized = 'pa6.probe@example.test';
SELECT 'TTL_DAYS=' || pg_catalog.round(extract(epoch FROM (i.expires_at - i.created_at)) / 86400)::text
  FROM public.invitations i WHERE i.email_normalized = 'pa6.probe@example.test';
SELECT 'EVENTS=' || coalesce(pg_catalog.string_agg(e.action, ',' ORDER BY e.seq_no), '(none)')
  FROM public.audit_events e
 WHERE e.action IN ('admin.profile_created','invitation.created')
   AND e.occurred_at > pg_catalog.now() - '1 minute'::interval;
SELECT 'LEAK=' || pg_catalog.count(*) FROM public.audit_events e
 WHERE e.occurred_at > pg_catalog.now() - '1 minute'::interval
   AND (e.target_label ILIKE '%probe%' OR e.payload_canonical ILIKE '%probe%'
        OR e.target_label ILIKE '%example.test%' OR e.payload_canonical ILIKE '%example.test%');
ROLLBACK;`);
check(
  created.includes("R1=created") && created.includes("M1=true") && created.includes("I1=true"),
  `PA-6   the governed creation SUCCEEDS for management: ${grab(created, "R1")}`,
);
check(
  grab(created, "ACCOUNTS") === "1",
  `PA-6b  ⛔ the account exists with auth_user_id NULL (${grab(created, "ACCOUNTS")} row) — A-020/A-025: a profile is NOT a login, and the count is filtered ON that NULL rather than merely hoping for it`,
);
check(
  grab(created, "MEMBERSHIP") === "trainer/pending" && grab(created, "PROFILE") === "1",
  `PA-6c  ⛔ the membership is PINNED trainer at PENDING (${grab(created, "MEMBERSHIP")}) with its profile row (${grab(created, "PROFILE")}) — GC-11 bars a caller-chosen role; A-027 bars an active one`,
);
check(
  grab(created, "INVITE") === "pending" && grab(created, "TTL_DAYS") === "7",
  `PA-6d  the invitation is pending with a ${grab(created, "TTL_DAYS")}-day lifetime. ⚠️ STATED, NOT RULED: no instrument names an invitation duration; 7 days is this build's disclosed default and lives in one constant`,
);
check(
  grab(created, "EVENTS") === "admin.profile_created,invitation.created",
  `PA-6e  ⛔ EXACTLY TWO EVENTS, IN ORDER: ${grab(created, "EVENTS")} — A-029 counts ACTIONS, and a profile coming into existence is a different action from an invitation being issued against it`,
);
check(
  grab(created, "LEAK") === "0",
  `PA-6f  ⛔ NEITHER THE NAME NOR THE EMAIL REACHES AN AUDIT LABEL OR PAYLOAD (${grab(created, "LEAK")} hits) — CLAUDE.md §12 makes that a stop-and-ask, and this leg searches for the probe's OWN strings, so a zero here is a real absence rather than a query that matched nothing`,
);

// ---------------------------------------------------------------------
// PA-7 -- THE REFUSALS. ⛔ A non-management caller, and the duplicate.
// ---------------------------------------------------------------------
const refusals = psql(`
BEGIN;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '${claims(TRAINER)}', true);
SELECT 'TRAINER=' || coalesce(o_reason,'(null)') || '/' || (o_membership_id IS NULL)::text
  FROM public.admin_create_trainer('Should Not Exist', 'pa7.trainer@example.test');
SELECT set_config('request.jwt.claims', '${claims(MGMT)}', true);
SELECT 'DUP=' || coalesce(t.o_reason,'(null)')
  FROM (SELECT a.normalized_email AS e FROM public.accounts a WHERE a.status='active' LIMIT 1) s
  CROSS JOIN LATERAL public.admin_create_trainer('Duplicate Probe', s.e) t;
SELECT 'BADMAIL=' || coalesce(o_reason,'(null)')
  FROM public.admin_create_trainer('Bad Mail', 'not-an-address');
SELECT 'NONAME=' || coalesce(o_reason,'(null)')
  FROM public.admin_create_trainer('   ', 'pa7.noname@example.test');
RESET ROLE;
SELECT 'RESIDUE=' || pg_catalog.count(*) FROM public.accounts a
 WHERE a.normalized_email LIKE 'pa7.%@example.test';
ROLLBACK;`);
check(
  grab(refusals, "TRAINER") === "not_permitted/true",
  `PA-7   ⛔ A TRAINER IS REFUSED by the same function management just used: ${grab(refusals, "TRAINER")}. ▶ This is the discriminating pair — the identical call, one caller through, one refused`,
);
check(
  grab(refusals, "DUP") === "email_in_use",
  `PA-7b  a duplicate active email is a GOVERNED REASON, not a raised unique violation: ${grab(refusals, "DUP")} (A-027 — never a second identity)`,
);
check(
  grab(refusals, "BADMAIL") === "invalid_email" && grab(refusals, "NONAME") === "invalid_name",
  `PA-7c  and the two validation refusals are distinct: ${grab(refusals, "BADMAIL")} / ${grab(refusals, "NONAME")} — ⛔ each returns NULL ids, so a refusal is never an empty success (Q-7)`,
);
check(
  grab(refusals, "RESIDUE") === "0",
  `PA-7d  ⛔ NO PARTIAL ROW SURVIVES A REFUSAL (${grab(refusals, "RESIDUE")}) — the four inserts are one transaction, so a rejected invitation cannot leave an orphan account behind`,
);

// ---------------------------------------------------------------------
// PA-8 -- THE FIXTURE IS UNMOVED. Every write above rolled back.
// ---------------------------------------------------------------------
const after = psql(`
SELECT 'ACC=' || (SELECT pg_catalog.count(*) FROM public.accounts)
    || ' MEM=' || (SELECT pg_catalog.count(*) FROM public.centre_memberships)
    || ' INV=' || (SELECT pg_catalog.count(*) FROM public.invitations)
    || ' PROF=' || (SELECT pg_catalog.count(*) FROM public.trainer_profiles);`);
check(
  !/probe/i.test(psql("SELECT pg_catalog.string_agg(display_name, ',') FROM public.accounts;") ?? ""),
  `PA-8   ⛔ THE FIXTURE IS BYTE-CLEAN: no probe account survives. Live counts ${after}`,
);

// ---------------------------------------------------------------------
// PA-9 -- THE CODE-SIDE BARS.
// ---------------------------------------------------------------------
/*
 * ⛔ THE CONTRACTS FILE IS SLICED, NOT SCANNED WHOLE, AND THE REASON MATTERS.
 * `physical-test.ts` legitimately carries the rating types for the REPORT
 * DETAIL surfaces `C-9` permits — scanning it entire would fire the detector on
 * correct code and teach the next reader that a red leak leg is normal noise.
 * ▶ A detector that cries wolf is worse than none, which is the same reasoning
 * that produced the narrowing ruling.
 */
const SOURCES = [
  "server/modules/identity-access/trainer-invitation.ts",
  "features/management/management-add-trainer-screen.tsx",
];
const present = SOURCES.filter((f) => existsSync(join(ROOT, ...f.split("/"))));
check(present.length === SOURCES.length, `PA-9   all ${SOURCES.length} source layers exist — a missing file would make every scan below vacuous`);
const built = present.map((f) => stripComments(readFileSync(join(ROOT, ...f.split("/")), "utf8"))).join("\n");

const leaks = ratingLeaks(built);
check(
  leaks.length === 0,
  `PA-9a  ⛔ NO RATING VOCABULARY in any rating-shaped context (${leaks.map((l) => `${l.context}:${l.term}`).join("; ") || "none"}) — the pack's own §8 says this screen is not rating-bearing`,
);
const narrowing = proveNarrowing();
check(
  narrowing.ok,
  `PA-9b  CONTROL: the narrowed detector fires on every real-rating sample and no ordinary-English sample (missed: ${narrowing.missed.join(", ") || "none"}; false positives: ${narrowing.falsePositives.join(", ") || "none"})`,
);

/*
 * ⛔ THE FIVE REFUSALS, ASSERTED WHERE THEY LIVE. ⚠️ Over the TYPES, not the
 * component: a screen that merely declines to render a field is one line from
 * carrying it; a type with nowhere to put one is not.
 */
const contracts = stripComments(readFileSync(join(ROOT, "lib", "frontend", "contracts", "physical-test.ts"), "utf8"));
const input = contracts.slice(
  contracts.indexOf("export type CreateTrainerInput"),
  contracts.indexOf("export type TrainerInvitationOutcomeDto"),
);
check(
  input.length > 40 && !/role|phone|employee|photo|avatar|classIds/i.test(input),
  `PA-10  ⛔ THE INPUT TYPE CARRIES THREE FIELDS AND NO FOURTH (${input.length} chars): no role (GC-11 — \`Assistant Trainer\` is not in the enum, so it is UNPERSISTABLE), no phone, no employee id (⚠️ NO COLUMN EXISTS — the one open Operator decision here), no photo (C-15 adjacent), no class ids (A-016 — assignment is SESSION-level)`,
);
const outcome = contracts.slice(
  contracts.indexOf("export type TrainerInvitationOutcomeDto"),
  contracts.indexOf("export type TrainerInvitationOutcomeDto") + 400,
);
check(
  !/password|token|secret|otp/i.test(outcome),
  "PA-10b ⛔ AND THE OUTCOME TYPE RETURNS NO CREDENTIAL — two ids and a reason. A-020/A-027: no plaintext password is ever stored, displayed, emailed or logged, and there is no column that could hold one",
);

const screen = stripComments(readFileSync(join(ROOT, "features", "management", "management-add-trainer-screen.tsx"), "utf8"));
check(
  /not collected/.test(screen) && /Assign classes/.test(screen) && /Employee ID/.test(screen),
  "PA-11  ⛔ THE OMISSIONS ARE DISCLOSED ON THE PAGE, not only in a source comment (§12.12) — a screen that silently drops four drawn fields looks finished; one that states them is honestly partial",
);
check(
  /pending/.test(screen) && /own password/.test(screen) && /not built yet/.test(screen),
  "PA-11b and the success copy is HONEST IN THREE PLACES: the membership is PENDING (not staff yet), the recipient sets their OWN password (never one we made), and the invitation EMAIL IS NOT SENT — external delivery is deferred, and claiming otherwise would leave an academy waiting",
);

// ---------------------------------------------------------------------
// PA-12 -- THE STANDING RULES STILL HOLD.
// ---------------------------------------------------------------------
check(
  unpairedMigrations(ROOT).length === 0,
  `PA-12  every portal-era migration still has a paired suite (${unpairedMigrations(ROOT).join(", ") || "none unpaired"})`,
);
const wiring = rpcsWithoutApplicationCaller(ROOT, () => false);
const stillUnwired = wiring.unwired.filter((n) => !isProvablyInternal(n));
check(
  stillUnwired.length === 0,
  `PA-12b and every portal-era RPC is reachable from application code (${wiring.declaredCount} declared; unwired beyond the provably-internal: ${stillUnwired.join(", ") || "none"}) — ⚠️ THIS is the leg that would have caught admin_create_trainer shipping with no caller`,
);
check(
  existsSync(join(ROOT, "app", "(portals)", "management", "trainers", "add", "page.tsx")),
  "PA-13  the canonical route /management/trainers/add exists — ⚠️ and screen 23's `Add Trainer` was made a LIVE LINK in the same pass, with its `arrives with screen 24` disclosure retired (§12.11)",
);

console.log(`\nRESULT: ${bad === 0 ? "PASS" : "FAIL"}  (${bad} failed checks)`);
process.exit(bad === 0 ? 0 : 1);
