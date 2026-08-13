#!/usr/bin/env node
/**
 * =====================================================================
 * POST-LOGIN DESTINATIONS — THE RATIFIED CORE SCREEN, NOT A DEFERRED ONE
 * (Run C3-A Phase 2, item C2C-012)
 * =====================================================================
 *
 * THE DEFECT UNDER TEST. `server/modules/identity-access/portal-destinations.ts`
 * sent `management` to `/management` and `parent` to `/parent`. Both are
 * DEFERRED placeholder dashboards — screen 11 Management Dashboard and screen 30
 * Parent Dashboard, classified Deferred / "not in the physical-test flow", with
 * no frozen reference. Flow steps 7→8 and 10→11 of the ratified twelve-screen
 * walkthrough each therefore acquired an unratified intermediate screen.
 *
 * WHAT THIS PROVES
 *   D-1  Each role's post-login destination is the RATIFIED next core screen
 *        named in `48H_CORE_SLICE.md` — AUTH-01 → 05 Trainer Schedule,
 *        AUTH-02 → 29 Management Reports (`/management/reports`), AUTH-03 →
 *        32 Parent Reports (`/parent/reports`).
 *   D-2  No destination is a deferred dashboard. `/management` and `/parent`
 *        specifically are asserted absent as LANDING targets — they remain
 *        reachable routes and rail destinations, which is a different thing.
 *   D-3  The Trainer destination stays the ratified R-B1 compatibility alias
 *        `/trainer`, which `app/(portals)/trainer/page.tsx` redirects to
 *        `/trainer/schedule`. Hardcoding the schedule route here would bypass
 *        and quietly devalue that ratified redirect.
 *   D-4  Every consumer resolves through the ONE table. `app/page.tsx`,
 *        `proxy.ts`, `portal-guard.ts` and `actions.ts` must each import
 *        `portalHomeForRole` and must contain NO destination literal of their
 *        own — that is what makes "update every consumer consistently" a
 *        structural property rather than a promise.
 *   D-5  Every destination is a route this application actually ships, against
 *        the census ENUMERATED from `app/**\/page.tsx` on this run.
 *
 * It touches NO database, NO network, NO browser and NO credential.
 *
 * Run: node --import ./scripts/tests/integration/alias-loader.mjs \
 *        tests/frontend/post-login-destinations.mjs
 * =====================================================================
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

import { portalHomeForRole } from "@/server/modules/identity-access/portal-destinations";
import { shippedRoutes } from "./app-route-census.mjs";

const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));

let failures = 0;
const fail = (id, message) => {
  failures += 1;
  console.error(`FAIL ${id}: ${message}`);
};
const pass = (id, message) => console.log(`PASS ${id} -- ${message}`);

/**
 * The ratified landing target per role, with the flow row it comes from.
 * Read out of `48H_CORE_SLICE.md` ("Next screen" per AUTH screen, plus the
 * canonical route in the same file's flow table) BEFORE this change was made.
 */
const RATIFIED = [
  ["trainer", "/trainer", "AUTH-01 → 05 Trainer Schedule (via the R-B1 /trainer alias)"],
  ["management", "/management/reports", "AUTH-02 → 29 Management Reports"],
  ["parent", "/parent/reports", "AUTH-03 → 32 Parent Reports"],
];

/** The deferred dashboards no sign-in may land on (C2C-012). */
// `P2-7`: the Management dashboard moved to its canonical route and
// `/management` now redirects onto it. BOTH are listed, deliberately — landing
// on the redirect reaches the dashboard just as surely as landing on it
// directly, so guarding only one would leave the other open.
const DEFERRED_DASHBOARDS = new Set(["/management", "/management/dashboard", "/parent"]);

/**
 * THE ROUTE CENSUS IS READ, NOT RESTATED.
 *
 * Run C3-A Phase 2b, item D finding 2: D-5 used to carry a hand-authored set
 * of route literals and then report the verdict as "the shipped 17-route
 * census". It was a restatement of the census, not a reading of it — a route
 * added, removed or renamed under `app/` would not move it, so D-5 could not
 * fail for the very reason it exists. `shippedRoutes()` enumerates
 * `app/**\/page.tsx` and derives each route the App Router way; the number
 * below is therefore measured on every run rather than asserted in prose.
 */
const SHIPPED_ROUTES = new Set(await shippedRoutes());

// ---------------------------------------------------------------------
// D-1  Each role lands on its ratified core destination.
// ---------------------------------------------------------------------
{
  const wrong = RATIFIED.filter(([role, expected]) => portalHomeForRole(role) !== expected).map(
    ([role, expected, provenance]) =>
      `${role} lands on ${portalHomeForRole(role)}; ${provenance} requires ${expected}`,
  );
  if (wrong.length > 0) {
    fail("D-1", wrong.join("; "));
  } else {
    pass(
      "D-1",
      `all three roles land on the ratified next CORE screen: ${RATIFIED.map(([r]) => `${r} -> ${portalHomeForRole(r)}`).join(", ")}`,
    );
  }
}

// ---------------------------------------------------------------------
// D-2  No sign-in lands on a deferred dashboard.
// ---------------------------------------------------------------------
{
  const landing = ["trainer", "management", "parent"].map((role) => [
    role,
    portalHomeForRole(role),
  ]);
  const deferred = landing.filter(([, destination]) => DEFERRED_DASHBOARDS.has(destination));
  if (deferred.length > 0) {
    fail(
      "D-2",
      `${deferred.map(([r, d]) => `${r} -> ${d}`).join(", ")} land(s) on a DEFERRED dashboard (screen 11 / screen 30, "not in the physical-test flow"); the post-authentication destination must be the next core screen`,
    );
  } else {
    pass(
      "D-2",
      "no role's post-login destination is a deferred dashboard; /management and /parent remain reachable routes and rail destinations but are no longer landing targets",
    );
  }
}

// ---------------------------------------------------------------------
// D-3  Trainer keeps the ratified R-B1 alias, and it still redirects.
// ---------------------------------------------------------------------
{
  const trainerLanding = portalHomeForRole("trainer");
  const aliasSource = await readFile(
    join(REPO_ROOT, "app", "(portals)", "trainer", "page.tsx"),
    "utf8",
  );
  const redirects = /redirect\(\s*["'`]\/trainer\/schedule["'`]\s*\)/.test(aliasSource);
  if (trainerLanding !== "/trainer") {
    fail(
      "D-3",
      `the Trainer destination is ${trainerLanding}; it must stay the ratified R-B1 compatibility alias /trainer so the alias remains authoritative`,
    );
  } else if (!redirects) {
    fail(
      "D-3",
      "app/(portals)/trainer/page.tsx no longer redirects /trainer onto /trainer/schedule, so the Trainer landing alias resolves to nothing",
    );
  } else {
    pass(
      "D-3",
      "the Trainer destination is the ratified /trainer alias and app/(portals)/trainer/page.tsx still redirects it onto /trainer/schedule (screen 05)",
    );
  }
}

// ---------------------------------------------------------------------
// D-4  Every consumer resolves through the ONE table — no local literal.
// ---------------------------------------------------------------------
{
  const CONSUMERS = [
    ["app/page.tsx", join(REPO_ROOT, "app", "page.tsx")],
    ["proxy.ts", join(REPO_ROOT, "proxy.ts")],
    [
      "server/modules/identity-access/portal-guard.ts",
      join(REPO_ROOT, "server", "modules", "identity-access", "portal-guard.ts"),
    ],
    [
      "server/modules/identity-access/actions.ts",
      join(REPO_ROOT, "server", "modules", "identity-access", "actions.ts"),
    ],
  ];
  /*
   * Comments are stripped first. Every one of these files DISCUSSES the portal
   * paths in prose, and a scan that counted a comment would be unfalsifiable.
   */
  const stripComments = (source) =>
    source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
  const problems = [];
  for (const [name, path] of CONSUMERS) {
    const code = stripComments(await readFile(path, "utf8"));
    if (!code.includes("portalHomeForRole")) {
      problems.push(`${name} does not resolve its destination through portalHomeForRole`);
    }
    /*
     * A LOCAL DESTINATION is a redirect whose target is a hardcoded portal
     * path. The check is deliberately scoped to redirect CALLS, not to the
     * appearance of a portal path anywhere in the file: `proxy.ts` legitimately
     * carries `/trainer`, `/management` and `/parent` in `PORTAL_PREFIXES`,
     * which is the path->role MATCHER, a different table with a different job.
     * A blunt substring scan would flag that and be unfalsifiable noise.
     */
    const localRedirects = [
      ...code.matchAll(/redirect(?:To)?\(\s*["'`](\/(?:trainer|management|parent)[^"'`]*)["'`]/g),
    ].map((match) => match[1]);
    for (const target of localRedirects) {
      problems.push(
        `${name} redirects to the hardcoded portal path "${target}"; a second copy of this table is exactly how the four consumers drift apart`,
      );
    }
  }
  if (problems.length > 0) {
    fail("D-4", problems.join("; "));
  } else {
    pass(
      "D-4",
      `all ${CONSUMERS.length} consumers (app/page.tsx, proxy.ts, portal-guard.ts, actions.ts) resolve through the single portalHomeForRole table and none carries a destination literal of its own`,
    );
  }
}

// ---------------------------------------------------------------------
// D-5  Every destination is a route this build actually ships.
// ---------------------------------------------------------------------
{
  const unshipped = ["trainer", "management", "parent"]
    .map((role) => [role, portalHomeForRole(role)])
    .filter(([, destination]) => !SHIPPED_ROUTES.has(destination));
  if (unshipped.length > 0) {
    fail(
      "D-5",
      `destination(s) that are not in the shipped route census: ${unshipped.map(([r, d]) => `${r} -> ${d}`).join(", ")}`,
    );
  } else {
    pass(
      "D-5",
      `every post-login destination is a route in the shipped ${SHIPPED_ROUTES.size}-route census, and that census was ENUMERATED from app/**/page.tsx on this run rather than restated inside this test`,
    );
  }
}

console.log("");
if (failures > 0) {
  console.error(`Post-login destination suite: ${failures} failure(s).`);
  process.exitCode = 1;
} else {
  console.log("Post-login destination suite: all proofs passed.");
}
