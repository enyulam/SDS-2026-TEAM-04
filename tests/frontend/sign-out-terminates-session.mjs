#!/usr/bin/env node
/**
 * =====================================================================
 * SIGN-OUT — THE SESSION IS GENUINELY TERMINATED SERVER-SIDE (C2C-023)
 * =====================================================================
 *
 * THE DEFECT UNDER TEST. There was NO sign-out control anywhere in the
 * application, on any of the three portals. `signOutAction` had been written
 * since F16-A and had exactly two references in the repository — its own
 * definition and one documentation mention — so it had no consumer. ADR-4
 * makes the session the sole carrier of authority; a real login with no way to
 * end that session on a shared or family device is an incomplete flow.
 *
 * WHAT THIS SUITE PROVES
 *
 *   S-1  The control EXISTS on all three authenticated portal shells (one
 *        shared `RolePortalShell` renders all three), in both the desktop rail
 *        and the mobile header, and it is a real `<form>` posting a SERVER
 *        ACTION — never a `<Link>`. A link to `/login` would navigate away
 *        while leaving the session fully alive, and the proxy would bounce the
 *        caller straight back into the portal.
 *
 *   S-2  The action terminates the session SERVER-SIDE — `auth.signOut()` on
 *        the request-scoped server client, inside a Server Action, which is one
 *        of the few contexts Next.js honours the auth-cookie clears in — and
 *        then redirects to the constant login path. It reads no caller-supplied
 *        value and touches no elevated client.
 *
 *   S-3  THE BEHAVIOURAL PROOF, against the REAL local Supabase Auth server:
 *        a real session is established for the trainer fixture identity, the
 *        `auth.sessions` row is MEASURED present (the positive control — a
 *        probe that cannot see a live session proves nothing when it later sees
 *        none), `signOut()` is called, and the row is measured GONE. Session
 *        termination is therefore observed in the authentication server's own
 *        state, not inferred from a cleared cookie.
 *
 *   S-4  A protected route is NOT REACHABLE without a session: over real HTTP,
 *        a portal route answers a redirect to `/login` and serves no portal
 *        markup — the "afterwards" state S-3 puts the caller into.
 *
 * NO PASSWORD IS HANDLED ANYWHERE IN THIS FILE. The real session in S-3 comes
 * from the Auth admin magiclink -> verifyOtp channel already accepted in
 * `run-integration.mjs` and `run-c3-bypass.mjs`. Nothing is created, reset or
 * destroyed; no key, token, cookie or connection string is printed, logged,
 * persisted or interpolated into any message.
 *
 * READ-ONLY AGAINST THE CANONICAL DATABASE. S-3 signs a session in and out
 * again, which touches `auth.sessions` and nothing else. The canonical census
 * — reports, versions, ratings, corrections, observations, audit events,
 * chain heads, `auth.users` and migrations — is measured BEFORE and AFTER and
 * must be byte-identical.
 *
 * Run (with a production server already listening):
 *   BEST_COACH_APP_ORIGIN=http://127.0.0.1:3411 \
 *     node tests/frontend/sign-out-terminates-session.mjs
 * =====================================================================
 */

import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));
const CONTAINER = "supabase_db_best-coach-mvp";
const CANONICAL = "postgres";
const APP_ORIGIN = (process.env.BEST_COACH_APP_ORIGIN ?? "http://127.0.0.1:3000").replace(
  /\/+$/,
  "",
);

/** Step 7F fixture identity. No credential is associated with it here. */
const TRAINER_SUB = "d0000000-0000-4000-8000-000000000002";
const TRAINER_EMAIL = "trainer.fixture@example.test";

const CENSUS = `
SELECT (SELECT count(*) FROM public.reports)
  || '|' || (SELECT count(*) FROM public.report_versions)
  || '|' || (SELECT count(*) FROM public.report_version_ratings)
  || '|' || (SELECT count(*) FROM public.report_correction_requests)
  || '|' || (SELECT count(*) FROM public.observations)
  || '|' || (SELECT count(*) FROM public.observation_ratings)
  || '|' || (SELECT count(*) FROM public.audit_events)
  || '|' || (SELECT count(*) FROM public.audit_chain_heads)
  || '|' || (SELECT count(*) FROM auth.users)
  || '|' || (SELECT count(*) FROM supabase_migrations.schema_migrations);`;

let failures = 0;
const fail = (id, message) => {
  failures += 1;
  console.error(`FAIL ${id}: ${message}`);
};
const pass = (id, message) => console.log(`PASS ${id} -- ${message}`);

function psql(sql) {
  return new Promise((resolve) => {
    const p = spawn(
      "docker",
      [
        "exec",
        "-i",
        CONTAINER,
        "psql",
        "--no-psqlrc",
        "--username=postgres",
        `--dbname=${CANONICAL}`,
        "--quiet",
        "--set=ON_ERROR_STOP=1",
        "-t",
        "-A",
        "-F|",
      ],
      { stdio: ["pipe", "pipe", "pipe"] },
    );
    let out = "";
    let err = "";
    p.stdout.on("data", (d) => {
      out += d;
    });
    p.stderr.on("data", (d) => {
      err += d;
    });
    p.on("close", (code) => resolve({ code, out: out.trim(), err: err.trim() }));
    p.stdin.end(sql);
  });
}

async function q(sql) {
  const r = await psql(sql);
  if (r.code !== 0) throw new Error(`psql failed:\n${r.err}`);
  return r.out;
}

/**
 * The local stack's connection values, captured from project-local CLI
 * structured output into process memory only (CLAUDE.md §11). Never echoed,
 * never serialized, never interpolated into an error.
 */
function loadLocalStack() {
  return new Promise((resolve) => {
    const p = spawn("npx", ["--no-install", "supabase", "status", "--output", "json"], {
      cwd: REPO_ROOT,
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
        if (!["127.0.0.1", "localhost", "::1"].includes(host)) {
          resolve(null);
          return;
        }
        resolve(url && publishable && secret ? { url, publishable, secret } : null);
      } catch {
        resolve(null);
      }
    });
  });
}

const stripComments = (source) =>
  source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

// =====================================================================
// S-1  The control exists on all three shells and is a real form.
// =====================================================================
{
  const shell = stripComments(
    await readFile(join(REPO_ROOT, "components", "layout", "portal-shell.tsx"), "utf8"),
  );
  const problems = [];

  // One `RolePortalShell` renders all three portals; each wrapper must use it,
  // so "on all three portals" is a structural fact rather than three copies.
  for (const wrapper of ["PortalShell", "ManagementPortalShell", "ParentPortalShell"]) {
    const re = new RegExp(`export function ${wrapper}\\b[\\s\\S]{0,400}?RolePortalShell`);
    if (!re.test(shell)) problems.push(`${wrapper} does not render the shared RolePortalShell`);
  }
  if (!shell.includes("signOutFormAction")) {
    problems.push("the shell does not bind the sign-out server action at all");
  }
  if (!/<form\s+action=\{signOutFormAction\}/.test(shell)) {
    problems.push(
      "the sign-out control is not a <form action={signOutFormAction}> — a link or a client handler would navigate away while leaving the session alive",
    );
  }
  if (!/<button\s+type="submit"/.test(shell)) {
    problems.push("the sign-out control has no submit button, so the form cannot be activated");
  }
  const railAndHeader = [...shell.matchAll(/<SignOutControl\s+variant="(rail|header)"/g)].map(
    (m) => m[1],
  );
  if (!railAndHeader.includes("rail") || !railAndHeader.includes("header")) {
    problems.push(
      `the sign-out control renders in [${railAndHeader.join(", ") || "no"}] surface(s); it must render in BOTH the desktop rail and the mobile header, or it is unreachable below the lg breakpoint`,
    );
  }
  if (!/Sign out/.test(shell)) {
    problems.push("the sign-out control carries no visible text label");
  }
  if (problems.length > 0) {
    fail("S-1", problems.join("; "));
  } else {
    pass(
      "S-1",
      "all three portal wrappers render the one shared RolePortalShell, and that shell renders a real <form action={signOutFormAction}> with a visible submit button in BOTH the desktop rail and the mobile header",
    );
  }
}

// =====================================================================
// S-2  The action terminates server-side and returns to the login surface.
// =====================================================================
{
  const actions = stripComments(
    await readFile(
      join(REPO_ROOT, "server", "modules", "identity-access", "actions.ts"),
      "utf8",
    ),
  );
  const problems = [];
  if (!actions.startsWith('"use server"')) {
    problems.push("actions.ts is not a server module, so the form action would not run on the server");
  }
  const signOut = /export async function signOutAction\([\s\S]*?\n}/.exec(actions)?.[0] ?? "";
  const signOutForm = /export async function signOutFormAction\([\s\S]*?\n}/.exec(actions)?.[0] ?? "";
  if (!/createRequestSupabaseClient\(\)/.test(signOut) || !/auth\.signOut\(\)/.test(signOut)) {
    problems.push(
      "signOutAction does not call auth.signOut() on the request-scoped server client, so nothing is terminated server-side",
    );
  }
  if (!/signOutAction\(\)/.test(signOutForm)) {
    problems.push("signOutFormAction does not invoke the governed signOutAction");
  }
  if (!/redirect\(\s*["'`]\/login["'`]\s*\)/.test(signOutForm)) {
    problems.push(
      "signOutFormAction does not redirect to the constant /login path, so the caller is not returned to the login surface",
    );
  }
  if (/portalHomeForRole/.test(signOutForm)) {
    problems.push(
      "signOutFormAction resolves a portal destination; after sign-out there is no role, and redirecting into a portal would immediately bounce",
    );
  }
  if (/elevated/i.test(signOut) || /elevated/i.test(signOutForm)) {
    problems.push("the sign-out path references the elevated service-role client");
  }
  if (problems.length > 0) {
    fail("S-2", problems.join("; "));
  } else {
    pass(
      "S-2",
      "signOutFormAction runs in a \"use server\" module, invokes the governed signOutAction which calls auth.signOut() on the request-scoped client, redirects to the constant /login path, resolves no portal destination and touches no elevated client",
    );
  }
}

// =====================================================================
// S-3  BEHAVIOURAL — the session row is created, then destroyed, in the
//      authentication server's own state. No password is involved.
// =====================================================================
const censusBefore = await q(CENSUS);
{
  const sessionCount = () =>
    q(`SELECT count(*) FROM auth.sessions WHERE user_id = '${TRAINER_SUB}';`);

  const before = await sessionCount();
  const stack = await loadLocalStack();
  if (!stack) {
    fail(
      "S-3",
      "the local stack connection values could not be read from the project-local CLI; the behavioural leg did not run",
    );
  } else {
    const admin = createClient(stack.url, stack.secret, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    // A real local sign-in WITHOUT handling any password: the Auth admin API
    // mints a one-time magiclink token and verifying it yields an ordinary
    // session. Nothing is created, reset or destroyed.
    const link = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: TRAINER_EMAIL,
    });
    if (link.error || !link.data?.properties?.hashed_token) {
      fail("S-3", "a real session could not be established for the trainer fixture identity");
    } else {
      const client = createClient(stack.url, stack.publishable, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      });
      const verified = await client.auth.verifyOtp({
        type: "magiclink",
        token_hash: link.data.properties.hashed_token,
      });
      if (verified.error || verified.data?.user?.id !== TRAINER_SUB) {
        fail("S-3", "the trainer session could not be verified");
      } else {
        const live = await sessionCount();
        const signedOut = await client.auth.signOut();
        const after = await sessionCount();
        const stillUser = await client.auth.getUser();

        /*
         * `signOutAction` calls `auth.signOut()` with NO arguments, which is
         * Supabase's GLOBAL scope: every session belonging to the identity is
         * revoked, not merely the calling one. That is the production
         * behaviour, so it is the behaviour measured here — which is why the
         * expectation after sign-out is ZERO live sessions for the identity
         * rather than "one fewer". Any pre-existing session for this fixture
         * identity is residue from an earlier local run, is not part of the
         * canonical fixture pin (`auth.sessions` appears in no pinned census),
         * and its removal is the correct consequence of a global sign-out.
         *
         * The positive control is the sign-in itself: the count must RISE, or
         * the probe cannot see a live session and its later absence would
         * prove nothing at all.
         */
        if (Number(live) <= Number(before)) {
          fail(
            "S-3",
            `the positive control failed: auth.sessions for the identity went ${before} -> ${live} on sign-in; the probe cannot see a live session, so its later absence would prove nothing`,
          );
        } else if (signedOut.error) {
          fail("S-3", "auth.signOut() reported an error");
        } else if (Number(after) !== 0) {
          fail(
            "S-3",
            `after sign-out auth.sessions for the identity is ${after}; a global sign-out must leave ZERO — the session was NOT terminated server-side`,
          );
        } else if (!stillUser.error && stillUser.data?.user) {
          fail(
            "S-3",
            "the signed-out client still resolves a user against the Auth server, so the session outlived the sign-out",
          );
        } else {
          pass(
            "S-3",
            `against the REAL local Auth server: establishing a session moved auth.sessions for the identity ${before} -> ${live} (the positive control), the production global signOut() left ${after}, and the same client can no longer resolve a user — the termination is observed in the authentication server's own state, not inferred from a cleared cookie`,
          );
        }
      }
    }
  }
}

// =====================================================================
// S-4  A protected route is not reachable without a session.
// =====================================================================
{
  const PROTECTED = ["/trainer/schedule", "/management/reports", "/parent/reports"];
  const results = [];
  let reachable = false;
  let unreachableServer = false;
  for (const path of PROTECTED) {
    let response;
    try {
      response = await fetch(`${APP_ORIGIN}${path}`, { redirect: "manual" });
    } catch {
      unreachableServer = true;
      break;
    }
    const location = response.headers.get("location") ?? "";
    const toLogin = new URL(location || path, APP_ORIGIN).pathname === "/login";
    const body = response.status >= 300 && response.status < 400 ? "" : await response.text();
    const leaksPortal = body.includes('aria-label="Trainer navigation"') ||
      body.includes('aria-label="Management navigation"') ||
      body.includes('aria-label="Parent navigation"');
    results.push(`${path} -> ${response.status}${toLogin ? " /login" : ` ${location || "(no redirect)"}`}`);
    if (!(response.status >= 300 && response.status < 400 && toLogin) || leaksPortal) {
      reachable = true;
    }
  }
  if (unreachableServer) {
    fail(
      "S-4",
      `no server answered at ${APP_ORIGIN}; start a production build with \`npx next start\` and set BEST_COACH_APP_ORIGIN. This leg is NOT skipped — an unmeasured boundary is not a proven one.`,
    );
  } else if (reachable) {
    fail(
      "S-4",
      `a protected route answered something other than a redirect to /login without a session: ${results.join(", ")}`,
    );
  } else {
    pass(
      "S-4",
      `without a session every protected portal route redirects to /login and serves no portal navigation landmark (${results.join(", ")}) — the state sign-out returns the caller to`,
    );
  }
}

// =====================================================================
// The canonical database is exactly as it was.
// =====================================================================
{
  const censusAfter = await q(CENSUS);
  if (censusBefore !== censusAfter) {
    fail(
      "canonical",
      `the canonical database changed during the run (${censusBefore} -> ${censusAfter})`,
    );
  } else {
    console.log(
      `\nCanonical database untouched: reports|versions|version_ratings|corrections|observations|ratings|events|heads|auth|migrations = ${censusAfter}`,
    );
  }
}

console.log("");
if (failures > 0) {
  console.error(`Sign-out suite: ${failures} failure(s).`);
  process.exitCode = 1;
} else {
  console.log("Sign-out suite: all proofs passed.");
}
