#!/usr/bin/env node
// =====================================================================
// HERO PHASE 0A -- the staff-identity read path
// =====================================================================
// Proves `public.class_session_staff_identity(uuid)` authorizes per call
// and returns exactly one field, for exactly the callers entitled to it.
//
// WHAT MAKES THIS NON-VACUOUS. The discriminating property is that the
// SAME session id yields a NAME for trainer and management and NOTHING
// for parent and anon. A function that always returned rows would fail
// S-3/S-4; one that always returned nothing would fail S-1/S-2. Neither
// direction can pass by accident, and S-0 measures the fixture first so
// a zero-row fixture is reported as NOT-RUN rather than as a pass.
//
// AUTHENTICATION: ADMIN-MINTED SESSION. Password sign-in is NOT-RUN
// (Operator credential required). Per FINAL_MVP_G06_GROUNDING_RULING.md
// §H-6 the magiclink admin path proves POST-AUTHENTICATION behaviour
// ONLY and is never a sign-in proof.
//
// READ-ONLY. Creates, updates and deletes nothing. No provider is
// constructed and no outward request is made.
//
// Run: node --env-file=.env.local scripts/tests/hero/prove-0a-staff-identity.mjs
// =====================================================================

import { spawn, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

import { assertConfigProjectId, resolveLocalTarget } from "../../fixtures/local-target-guard.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

// Guarded: HARD DENY of the frozen demonstration project, then a
// fail-closed pin. Container name DERIVED, never literal.
const { projectId: PROJECT_ID, dbContainer: DB_CONTAINER } = resolveLocalTarget();
assertConfigProjectId(
  (readFileSync(join(ROOT, "supabase", "config.toml"), "utf8").match(/^\s*project_id\s*=\s*"([^"]+)"/m) ?? [])[1] ?? "",
  PROJECT_ID,
);

const IDENTITIES = {
  trainer: "trainer.fixture@example.test",
  management: "management.fixture@example.test",
  parent: "parent.fixture@example.test",
};

const NONEXISTENT_SESSION = "00000000-0000-4000-8000-0000000000ff";

let failures = 0;
let notRun = 0;
const pass = (id, msg) => console.log(`PASS    ${id} -- ${msg}`);
const fail = (id, msg) => {
  failures += 1;
  console.log(`FAIL    ${id} -- ${msg}`);
};
const skip = (id, msg) => {
  notRun += 1;
  console.log(`NOT-RUN ${id} -- ${msg}`);
};

function psql(sql) {
  const r = spawnSync(
    "docker",
    ["exec", "-i", DB_CONTAINER, "psql", "--no-psqlrc", "-U", "postgres", "-d", "postgres", "-At", "-F|", "-c", sql],
    { encoding: "utf8", shell: false },
  );
  if (r.status !== 0) throw new Error(`psql failed: ${r.stderr}`);
  return r.stdout.replace(/\n$/, "");
}

function loadLocalStack() {
  return new Promise((resolve) => {
    const p = spawn("npx", ["--no-install", "supabase", "status", "--output", "json"], {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"],
      shell: process.platform === "win32",
    });
    let out = "";
    p.stdout.on("data", (d) => {
      out += d;
    });
    p.on("close", () => {
      try {
        const status = JSON.parse(out.slice(out.indexOf("{")));
        const url = status.API_URL;
        const publishable = status.PUBLISHABLE_KEY || status.ANON_KEY;
        const secret = status.SECRET_KEY || status.SERVICE_ROLE_KEY;
        const host = url ? new URL(url).hostname : "";
        if (!["127.0.0.1", "localhost", "::1"].includes(host)) return resolve(null);
        resolve(url && publishable && secret ? { url, publishable, secret } : null);
      } catch {
        resolve(null);
      }
    });
  });
}

console.log("HERO PHASE 0A -- STAFF-IDENTITY READ PATH");
console.log("AUTH: ADMIN-MINTED SESSION -- password sign-in NOT-RUN\n");

// ---------------------------------------------------------------------
// S-0 -- fixture preconditions, measured. Everything below compares
// against values DERIVED HERE, never against a constant in this file.
// ---------------------------------------------------------------------
const sessions = psql(
  `SELECT cs.id, COALESCE(a.display_name, '')
     FROM public.class_sessions cs
     LEFT JOIN public.class_session_assignments csa
       ON csa.class_session_id = cs.id AND csa.is_active
     LEFT JOIN public.centre_memberships m ON m.id = csa.trainer_membership_id
     LEFT JOIN public.accounts a ON a.id = m.account_id
    ORDER BY cs.session_date;`,
)
  .split("\n")
  .filter(Boolean)
  .map((l) => {
    const [id, name] = l.split("|");
    return { id, name };
  });

const assigned = sessions.filter((s) => s.name.length > 0);
if (assigned.length === 0) {
  skip("S-0", "no session has an active assignment; every leg below would be vacuous");
  console.log("\nRESULT: NOT-RUN");
  process.exit(1);
}
const SUBJECT = assigned[0];
pass("S-0", `${sessions.length} session(s), ${assigned.length} with an active assignment; subject expects "${SUBJECT.name}"`);

const submittedCount = Number(psql(`SELECT count(*) FROM public.reports WHERE status = 'submitted';`));

const stack = await loadLocalStack();
if (!stack) {
  fail("S-A0", "the LOCAL Supabase stack's connection values could not be captured, or the stack is not local");
  console.log("\nRESULT: FAIL");
  process.exit(1);
}

const admin = createClient(stack.url, stack.secret, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

async function mint(email) {
  const link = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (link.error || !link.data?.properties?.hashed_token) return null;
  const c = createClient(stack.url, stack.publishable, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const v = await c.auth.verifyOtp({ type: "magiclink", token_hash: link.data.properties.hashed_token });
  if (v.error || !v.data?.user) return null;
  return c;
}

const clients = {};
for (const [role, email] of Object.entries(IDENTITIES)) {
  clients[role] = await mint(email);
  if (!clients[role]) {
    fail("S-A0", `could not mint a session for the ratified ${role} identity`);
    console.log("\nRESULT: FAIL");
    process.exit(1);
  }
}
pass("S-A0", "ADMIN-MINTED sessions established for trainer, management and parent (NOT a sign-in proof)");

const call = async (client, sessionId) =>
  client.rpc("class_session_staff_identity", { p_session_id: sessionId });

// ---------------------------------------------------------------------
// S-1 / S-2 -- the two PERMIT grounds that the fixture can exercise.
// ---------------------------------------------------------------------
for (const role of ["trainer", "management"]) {
  const { data, error } = await call(clients[role], SUBJECT.id);
  if (error) {
    fail(`S-${role === "trainer" ? 1 : 2}`, `${role} call errored: ${error.message}`);
    continue;
  }
  const rows = Array.isArray(data) ? data : [];
  if (rows.length !== 1) {
    fail(`S-${role === "trainer" ? 1 : 2}`, `${role} received ${rows.length} row(s); expected exactly 1`);
  } else if (rows[0].trainer_display_name !== SUBJECT.name) {
    fail(
      `S-${role === "trainer" ? 1 : 2}`,
      `${role} received ${JSON.stringify(rows[0].trainer_display_name)}; expected ${JSON.stringify(SUBJECT.name)}`,
    );
  } else {
    pass(`S-${role === "trainer" ? 1 : 2}`, `${role} reads the assigned trainer's display name exactly`);
  }
}

// ---------------------------------------------------------------------
// S-3 -- PARENT DENY. G-5 permits the name only where a report for this
// session has actually been PUBLISHED. With none submitted, the parent
// must receive nothing.
// ---------------------------------------------------------------------
{
  const { data, error } = await call(clients.parent, SUBJECT.id);
  const rows = Array.isArray(data) ? data : [];
  if (error) {
    fail("S-3", `parent call errored: ${error.message}`);
  } else if (submittedCount !== 0) {
    skip("S-3", `${submittedCount} submitted report(s) exist, so this deny leg is not the state it was written for`);
  } else if (rows.length !== 0) {
    fail("S-3", `parent received ${rows.length} row(s) with no submitted report; the G-5 gate did not hold`);
  } else {
    pass("S-3", "parent receives NOTHING while no report for the session is submitted (G-5 gate holds)");
  }
}

// ---------------------------------------------------------------------
// S-4 -- ANONYMOUS. No account, no ground, no rows.
// ---------------------------------------------------------------------
{
  const anon = createClient(stack.url, stack.publishable, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await call(anon, SUBJECT.id);
  const rows = Array.isArray(data) ? data : [];
  if (error) {
    // A hard denial at the grant layer is also an acceptable refusal.
    pass("S-4", `anonymous caller refused at the privilege layer (${error.code ?? "error"})`);
  } else if (rows.length !== 0) {
    fail("S-4", `anonymous caller received ${rows.length} row(s); expected 0`);
  } else {
    pass("S-4", "anonymous caller receives no rows");
  }
}

// ---------------------------------------------------------------------
// S-5 -- a session that does not exist yields nothing, and yields it the
// SAME way a denial does. No "no such session" signal.
// ---------------------------------------------------------------------
{
  const { data, error } = await call(clients.trainer, NONEXISTENT_SESSION);
  const rows = Array.isArray(data) ? data : [];
  if (error) fail("S-5", `nonexistent-session call errored: ${error.message}`);
  else if (rows.length !== 0) fail("S-5", `received ${rows.length} row(s) for a nonexistent session`);
  else pass("S-5", "a nonexistent session is indistinguishable from a denial -- zero rows, no error");
}

// ---------------------------------------------------------------------
// S-6 -- SHAPE. Exactly three fields leave the function. This is the leg
// that would catch an email, account status, auth id or centre id being
// added to the projection later.
// ---------------------------------------------------------------------
{
  const { data } = await call(clients.trainer, SUBJECT.id);
  const rows = Array.isArray(data) ? data : [];
  if (rows.length !== 1) {
    skip("S-6", "no row to inspect; the shape assertion did not run");
  } else {
    const keys = Object.keys(rows[0]).sort();
    const expected = ["class_session_id", "trainer_display_name", "trainer_membership_id"];
    if (JSON.stringify(keys) !== JSON.stringify(expected)) {
      fail("S-6", `returned fields ${JSON.stringify(keys)}; expected exactly ${JSON.stringify(expected)}`);
    } else {
      pass("S-6", "exactly three fields returned -- no email, status, auth id or centre id");
    }
  }
}

// ---------------------------------------------------------------------
// S-7 -- G-7 STRUCTURALLY. No session may yield two staff rows. Checked
// across EVERY session, as management, so it is not a single-row sample.
// ---------------------------------------------------------------------
{
  let worst = 0;
  let checked = 0;
  for (const s of sessions) {
    const { data, error } = await call(clients.management, s.id);
    if (error) continue;
    checked += 1;
    worst = Math.max(worst, (Array.isArray(data) ? data : []).length);
  }
  if (checked === 0) skip("S-7", "no session could be read as management; the G-7 assertion did not run");
  else if (worst > 1) fail("S-7", `a session returned ${worst} staff rows; G-7 prohibits a second slot`);
  else pass("S-7", `all ${checked} session(s) return at most one staff row -- no \`Assist.\` surface exists`);
}

// ---------------------------------------------------------------------
// The G-5 PERMIT leg cannot be exercised by this fixture.
// ---------------------------------------------------------------------
if (submittedCount === 0) {
  skip(
    "S-8",
    "the G-5 parent PERMIT leg needs a report at `submitted`; producing one means driving the governed " +
      "two-stage workflow against the CANONICAL fixture database -- the exact mutation class that caused " +
      "B-STAGE3-2. Mutating legs belong on the disposable stack. DENY is proven at S-3; PERMIT is unproven.",
  );
}

console.log("\n---------------------------------------------------------------");
console.log(`Phase 0A staff identity: ${failures} failure(s), ${notRun} NOT-RUN.`);
if (failures > 0) {
  console.log("RESULT: FAIL");
  process.exit(1);
}
console.log("RESULT: PASS (with the NOT-RUN leg named above, which is NOT a pass).");
