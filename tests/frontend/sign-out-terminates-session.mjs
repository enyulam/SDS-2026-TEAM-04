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
 *   S-3  THE BEHAVIOURAL PROOF IS RELOCATED, and this leg keeps that
 *        relocation falsifiable. It used to establish and revoke real Auth
 *        sessions against the CANONICAL stack, and it exercised the SDK's
 *        `signOut()` on a client THIS TEST constructed rather than the
 *        production `signOutFormAction` path. Both are fixed by moving the
 *        measurement to `prove-disposable-app.mjs` gate G-22, where a real
 *        browser CLICKS the production control on the application served
 *        against the DISPOSABLE stack and `auth.sessions` is read in the
 *        DISPOSABLE Auth server. S-3 now asserts that gate exists, decides,
 *        targets the production control and reads the disposable database —
 *        and that THIS suite no longer establishes a session anywhere.
 *
 *   S-4  A protected route is NOT REACHABLE without a session: over real HTTP,
 *        a portal route answers a redirect to `/login` and serves no portal
 *        markup — the "afterwards" state S-3 puts the caller into.
 *
 * NO PASSWORD IS HANDLED ANYWHERE IN THIS FILE, and no session is established
 * or revoked by it at all any more. No key, token, cookie or connection string
 * is printed, logged, persisted or interpolated into any message.
 *
 * READ-ONLY AGAINST THE CANONICAL DATABASE. This suite now performs no Auth
 * operation whatsoever; the canonical census — reports, versions, ratings,
 * corrections, observations, audit events, chain heads, `auth.users` and
 * migrations — is still measured BEFORE and AFTER and must be byte-identical,
 * which is what makes "this suite mutates nothing" a measurement.
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

const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));
const CONTAINER = "supabase_db_best-coach-mvp";
const CANONICAL = "postgres";
const APP_ORIGIN = (process.env.BEST_COACH_APP_ORIGIN ?? "http://127.0.0.1:3000").replace(
  /\/+$/,
  "",
);

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

  /*
   * SCOPED TO THE SIGN-OUT FORM ITSELF (Run C3-A Phase 2b, item D finding 4).
   *
   * The submit-button and label checks used to scan the WHOLE shell file, so
   * ANY submit button and ANY occurrence of the words "Sign out" anywhere in
   * that file satisfied them — including a control that has nothing to do with
   * signing out. A sign-out form that lost its button would still have passed
   * as long as some other control in the same file had one. The checks now run
   * against the extracted `<form action={signOutFormAction}> … </form>` markup
   * ONLY: the button, its type and the visible label must be INSIDE the form
   * that posts the action, which is the only place they mean anything.
   */
  const form = /<form\s+action=\{signOutFormAction\}[\s\S]*?<\/form>/.exec(shell)?.[0] ?? null;
  if (form === null) {
    problems.push(
      "the sign-out control is not a <form action={signOutFormAction}>…</form> — a link or a client handler would navigate away while leaving the session alive",
    );
  } else {
    if (!/<button\b[\s\S]*?type="submit"/.test(form)) {
      problems.push(
        "the sign-out form contains no submit button, so the form cannot be activated; a submit button elsewhere in the shell does not activate this form",
      );
    }
    if (!/>\s*Sign out\s*</.test(form)) {
      problems.push(
        "the sign-out form carries no visible \"Sign out\" text label inside it; the words appearing elsewhere in the shell name a different control",
      );
    }
    if (!/data-testid="sign-out"/.test(form)) {
      problems.push(
        "the sign-out form's control carries no `data-testid=\"sign-out\"`; the disposable behavioural proof (G-22) locates the production control by that hook and would silently target something else without it",
      );
    }
  }

  const railAndHeader = [...shell.matchAll(/<SignOutControl\s+variant="(rail|header)"/g)].map(
    (m) => m[1],
  );
  if (!railAndHeader.includes("rail") || !railAndHeader.includes("header")) {
    problems.push(
      `the sign-out control renders in [${railAndHeader.join(", ") || "no"}] surface(s); it must render in BOTH the desktop rail and the mobile header, or it is unreachable below the lg breakpoint`,
    );
  }
  if (problems.length > 0) {
    fail("S-1", problems.join("; "));
  } else {
    pass(
      "S-1",
      "all three portal wrappers render the one shared RolePortalShell, and that shell renders a real <form action={signOutFormAction}> whose OWN markup carries the submit button, the visible \"Sign out\" label and the `sign-out` test hook, in BOTH the desktop rail and the mobile header",
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
// S-3  THE BEHAVIOURAL PROOF LIVES ON A DISPOSABLE STACK AND EXERCISES THE
//      PRODUCTION PATH. This leg proves it is really there and really wired
//      to the production control — it does not restate the measurement.
// =====================================================================
const censusBefore = await q(CENSUS);
{
  /*
   * WHAT MOVED, AND WHY (Run C3-A Phase 2b, item D finding 4).
   *
   * S-3 used to establish and revoke REAL Auth sessions against the CANONICAL
   * stack, and it exercised the SDK's `signOut()` on a client THIS TEST
   * constructed. Both were wrong:
   *
   *   * the canonical stack is the one stack this project treats as sacred,
   *     and a test that signs identities in and out of it is mutating it, even
   *     though `auth.sessions` sits outside the pinned census; and
   *   * `signOutFormAction` — the Server Action the shell's `<form>` posts,
   *     which calls the governed `signOutAction` on the request-scoped server
   *     client and then redirects — was never invoked. The measurement was of
   *     the Supabase SDK, not of this application's sign-out.
   *
   * The measurement now lives in `scripts/physical-test/prove-disposable-app.mjs`
   * as gate G-22, where a real browser CLICKS the production control on the
   * application served against the DISPOSABLE stack and `auth.sessions` is read
   * in the DISPOSABLE Auth server. This leg's job is to make that relocation
   * FALSIFIABLE: if the gate is deleted, renamed, or stops clicking the
   * production control, this fails here rather than leaving a suite that
   * quietly no longer proves anything behavioural.
   */
  const proof = stripComments(
    await readFile(
      join(REPO_ROOT, "scripts", "physical-test", "prove-disposable-app.mjs"),
      "utf8",
    ),
  );
  const problems = [];
  if (!/\bGATE_TITLES[\s\S]*?\['G-22',/.test(proof)) {
    problems.push("the disposable app proof declares no G-22 gate, so the relocated behavioural proof does not exist");
  }
  if (!/gateFrom\(\s*\n?\s*'G-22'/.test(proof) && !/gate\(\s*'G-22'/.test(proof)) {
    problems.push("the disposable app proof never decides G-22");
  }
  if (!/form button\[data-testid="sign-out"\]/.test(proof)) {
    problems.push(
      "G-22 does not locate the PRODUCTION sign-out control (a submit button inside the shell's sign-out form); it cannot be exercising the production path",
    );
  }
  if (!/auth\.sessions WHERE user_id/.test(proof)) {
    problems.push("G-22 does not read auth.sessions, so it measures no server-side termination");
  }
  if (!/DISPOSABLE_DB_CONTAINER,\s*\n?\s*`SELECT count\(\*\)::text FROM auth\.sessions/.test(proof)) {
    problems.push(
      "G-22's auth.sessions reading is not taken from the DISPOSABLE database container; the behavioural leg must not touch the canonical stack",
    );
  }
  /*
   * And this suite itself must no longer establish a session anywhere. A
   * relocation that left the old sign-in behind would be an addition, not a
   * move.
   */
  const selfSource = await readFile(fileURLToPath(import.meta.url), "utf8");
  const self = stripComments(selfSource);
  /*
   * The needles are assembled from fragments ON PURPOSE. A literal
   * `".generateLink("` written out here would itself be a match, and the check
   * would fail against its own source no matter what the file did — an
   * unfalsifiable assertion in the opposite direction.
   *
   * `.signOut(` is deliberately NOT one of the needles: S-2 legitimately quotes
   * it in prose when describing what `signOutAction` must call. The three
   * needles below are the ones that can only appear in code that builds a
   * Supabase client and establishes a session, which is the thing that moved.
   */
  const FORBIDDEN = ["create" + "Client(", ".generate" + "Link(", ".verify" + "Otp("];
  for (const forbidden of FORBIDDEN) {
    if (self.includes(forbidden)) {
      problems.push(
        `this suite still calls ${forbidden}, so it still establishes or revokes a real session against the canonical stack`,
      );
    }
  }
  if (problems.length > 0) {
    fail("S-3", problems.join("; "));
  } else {
    pass(
      "S-3",
      "the behavioural proof is relocated to prove-disposable-app.mjs gate G-22, where the PRODUCTION control (a submit button inside the shell's <form action={signOutFormAction}>) is clicked in a real browser against the DISPOSABLE stack and auth.sessions is measured in the DISPOSABLE Auth server — and this suite itself no longer establishes or revokes any session on the canonical stack",
    );
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
