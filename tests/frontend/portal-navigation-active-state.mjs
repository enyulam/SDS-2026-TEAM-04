#!/usr/bin/env node
/**
 * =====================================================================
 * PORTAL NAVIGATION — EXACTLY ONE CURRENT ITEM ON EVERY CANONICAL ROUTE
 * (Run C3-A Phase 2, items C2C-001 / C2C-002 / C2C-003)
 * =====================================================================
 *
 * WHAT THIS PROVES
 *
 *   1. Operator ruling R-C2-3, structural half: the MANAGEMENT rail declares
 *      EXACTLY ONE primary Reports destination, named "Reports", at
 *      `/management/reports` with NO query string. Two separate primary
 *      destinations for Pending and Corrections are PROHIBITED.
 *
 *   2. R-C2-3, deep-link half, plus GLOBAL_UI_RULES §7 / WCAG 2.2: on EVERY
 *      one of the 14 canonical portal routes, and on BOTH ratified
 *      `?status=` compatibility aliases, EXACTLY ONE navigation item is the
 *      current page — and it is the EXPECTED item. A bare count of one would
 *      pass with the wrong item highlighted, so the item is pinned by label.
 *
 *   3. The `exact` flag is LOAD-BEARING. Before this run, `portal-shell.tsx:192`
 *      read `item.exact ? pathname === item.path : pathname === item.path` —
 *      both branches identical — so `exact` was dead code, TWO Management items
 *      were current on `/management/reports`, and ZERO items were current on
 *      8 of the 14 canonical portal routes. This suite asserts a case that
 *      distinguishes the two branches (`/management` must NOT light up on
 *      `/management/reports`), so a regression to one shared expression FAILS.
 *
 * WHY IT IS NOT A BROWSER SUITE
 *
 *   Since F16-B every portal route is guarded server-side by `proxy.ts` plus a
 *   per-portal layout guard, both resolving a LIVE session. Driving a browser
 *   through them requires a valid credential, and `CLAUDE.md` §11 prohibits
 *   this harness from requesting, accepting, printing or persisting one. The
 *   authenticated browser legs are, and remain, the operator-assisted F17
 *   runner's (F17-X01…X10). This suite therefore exercises the PRODUCTION
 *   navigation table and the PRODUCTION derivation directly — the exact
 *   `roleConfig` and `isNavigationItemActive` that `portal-shell.tsx` renders
 *   from, imported, never restated — so the rule under test cannot drift from
 *   the rule that ships.
 *
 * It touches NO database, NO network and NO credential.
 *
 * Run: node --import ./scripts/tests/integration/alias-loader.mjs \
 *        tests/frontend/portal-navigation-active-state.mjs
 * =====================================================================
 */

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

import {
  isNavigationItemActive,
  roleConfig,
} from "@/components/layout/portal-navigation";
import { concreteRoute, shippedPortalRoutes } from "./app-route-census.mjs";

const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));

let failures = 0;
const fail = (id, message) => {
  failures += 1;
  console.error(`FAIL ${id}: ${message}`);
};
const pass = (id, message) => console.log(`PASS ${id} -- ${message}`);

/**
 * THE ROUTE LIST IS DERIVED FROM THE APP TREE, NOT HAND-AUTHORED.
 *
 * Run C3-A Phase 2b, item D finding 3: this suite used to assert over a
 * literal `ROUTES` array whose own header claimed it covered `/trainer`,
 * `/management` and `/parent` "in their own right". `/trainer` was SILENTLY
 * ABSENT and nothing failed, because a hand-authored list cannot notice its
 * own gap. A route added to `app/` tomorrow would be equally invisible.
 *
 * `shippedPortalRoutes()` enumerates `app/**\/page.tsx` and derives the routes
 * the App Router way. Every derived portal route MUST appear in the expectation
 * table below; an unexpected route is a FAILURE (N-0), never a silent skip, and
 * a stale expectation naming a route that no longer ships is a FAILURE too.
 *
 * Each expectation is one of exactly two kinds:
 *
 *   { role, label }  the route renders the portal shell, and `label` is the
 *                    rail item that MUST be the single current page.
 *   { redirectsTo }  the route renders NO shell: its page redirects before any
 *                    navigation is emitted. The exemption is PROVEN by reading
 *                    the page source and requiring the redirect to be there —
 *                    it is not a way of excusing a route from the assertion.
 */
const EXPECTED_BY_ROUTE = new Map([
  // Trainer.
  ["/trainer", { redirectsTo: "/trainer/schedule" }],
  ["/trainer/schedule", { role: "trainer", label: "Schedule" }],
  ["/trainer/sessions/[sessionId]/roster", { role: "trainer", label: "Schedule" }],
  [
    "/trainer/sessions/[sessionId]/students/[studentId]/assess",
    { role: "trainer", label: "Schedule" },
  ],
  ["/trainer/reports", { role: "trainer", label: "Returned reports" }],
  ["/trainer/reports/[reportId]/generate", { role: "trainer", label: "Returned reports" }],
  ["/trainer/reports/[reportId]/review", { role: "trainer", label: "Returned reports" }],
  ["/trainer/reports/[reportId]/edit", { role: "trainer", label: "Returned reports" }],
  // Management.
  ["/management", { role: "management", label: "Dashboard" }],
  ["/management/reports", { role: "management", label: "Reports" }],
  ["/management/reports/[reportId]/review", { role: "management", label: "Reports" }],
  ["/management/reports/[reportId]/edit", { role: "management", label: "Reports" }],
  // Parent.
  ["/parent", { role: "parent", label: "Home" }],
  ["/parent/reports", { role: "parent", label: "Reports" }],
  [
    "/parent/students/[studentId]/sessions/[sessionId]/report",
    { role: "parent", label: "Reports" },
  ],
]);

/**
 * The ratified `?status=` compatibility aliases. These are NOT routes — they
 * are query spellings of a route the census already carries — so they are
 * listed separately and each names the shipped route it must resolve onto.
 * `usePathname()` never sees a query string, which is precisely why an alias
 * has to resolve to the same single active item as its bare route.
 */
const ALIASES = [
  ["trainer", "/trainer/reports?status=needs_edit", "/trainer/reports", "Returned reports"],
  ["management", "/management/reports?status=trainer_approved", "/management/reports", "Reports"],
  ["management", "/management/reports?status=needs_edit", "/management/reports", "Reports"],
  ["management", "/management/reports?status=submitted", "/management/reports", "Reports"],
];

const shipped = await shippedPortalRoutes();

const pathnameOf = (route) => route.split("?")[0];

/** The page file backing a derived route pattern, for the redirect proof. */
async function readPageSource(routePattern) {
  const segments = routePattern.split("/").filter((segment) => segment.length > 0);
  // Route groups are invisible in the URL, so the file may sit under either
  // portal group. Both candidates are tried and a miss is reported, never
  // swallowed.
  const candidates = [
    join(REPO_ROOT, "app", "(portals)", ...segments, "page.tsx"),
    join(REPO_ROOT, "app", ...segments, "page.tsx"),
  ];
  for (const candidate of candidates) {
    try {
      return await readFile(candidate, "utf8");
    } catch {
      // Try the next candidate.
    }
  }
  return null;
}

// ---------------------------------------------------------------------
// N-0  Every route the app tree ships is covered, and nothing stale is
//      asserted. A missing expectation FAILS; it is never a silent skip.
// ---------------------------------------------------------------------
{
  const uncovered = shipped.filter((route) => !EXPECTED_BY_ROUTE.has(route));
  const stale = [...EXPECTED_BY_ROUTE.keys()].filter((route) => !shipped.includes(route));
  // An alias is a query spelling of a REAL route. An alias whose base route
  // does not ship is an alias onto nothing.
  const orphanAliases = ALIASES.filter(([, , base]) => !shipped.includes(base)).map(
    ([, alias, base]) => `${alias} (base ${base})`,
  );
  if (uncovered.length > 0 || stale.length > 0 || orphanAliases.length > 0) {
    fail(
      "N-0",
      [
        uncovered.length > 0
          ? `${uncovered.length} shipped portal route(s) have NO expectation in this suite and were therefore never asserted: ${uncovered.join(", ")}`
          : null,
        stale.length > 0
          ? `${stale.length} expectation(s) name a route this application no longer ships: ${stale.join(", ")}`
          : null,
        orphanAliases.length > 0
          ? `${orphanAliases.length} ?status= alias(es) have no shipped base route: ${orphanAliases.join(", ")}`
          : null,
      ]
        .filter(Boolean)
        .join("; "),
    );
  } else {
    pass(
      "N-0",
      `all ${shipped.length} portal routes derived from app/**/page.tsx carry an expectation, every one of the ${ALIASES.length} ratified ?status= aliases resolves onto a shipped base route, and no expectation names a route that no longer ships — the route list is READ from the app tree, not restated inside this test`,
    );
  }
}

// ---------------------------------------------------------------------
// N-0b A redirect-only exemption is PROVEN, not asserted. A route excused
//      from the active-item rule must really redirect.
// ---------------------------------------------------------------------
{
  const problems = [];
  for (const [route, expectation] of EXPECTED_BY_ROUTE) {
    if (!("redirectsTo" in expectation)) continue;
    const source = await readPageSource(route);
    if (source === null) {
      problems.push(`${route}: its page source could not be read, so the exemption is unproven`);
      continue;
    }
    const target = expectation.redirectsTo.replace(/[/\-]/g, "\\$&");
    if (!new RegExp(`redirect\\(\\s*["'\`]${target}["'\`]\\s*\\)`).test(source)) {
      problems.push(
        `${route}: claimed redirect-only, but its page does not redirect to ${expectation.redirectsTo}. A route that renders the shell must name the rail item it makes current, not be excused from the rule.`,
      );
    }
  }
  const exempt = [...EXPECTED_BY_ROUTE].filter(([, e]) => "redirectsTo" in e);
  if (problems.length > 0) {
    fail("N-0b", problems.join("; "));
  } else {
    pass(
      "N-0b",
      `all ${exempt.length} redirect-only route(s) (${exempt.map(([r, e]) => `${r} -> ${e.redirectsTo}`).join(", ")}) really do redirect before any navigation is rendered, so their exemption from the single-active-item rule is measured rather than claimed`,
    );
  }
}

/**
 * The rows the active-item assertions run over: every shipped shell-rendering
 * route with its dynamic segments made concrete, plus the ratified aliases.
 */
const ROUTES = [
  ...shipped
    .map((route) => [route, EXPECTED_BY_ROUTE.get(route)])
    .filter(([, expectation]) => expectation && "label" in expectation)
    .map(([route, expectation]) => [expectation.role, concreteRoute(route), expectation.label]),
  ...ALIASES.map(([role, alias, , label]) => [role, concreteRoute(alias), label]),
];

// ---------------------------------------------------------------------
// N-1  R-C2-3 structural half: ONE primary Reports destination.
// ---------------------------------------------------------------------
{
  const management = roleConfig.management.navigation;
  const reportsDestinations = management.filter(
    (item) => item.href.split("?")[0] === "/management/reports",
  );
  const labels = management.map((item) => item.label);
  if (reportsDestinations.length !== 1) {
    fail(
      "N-1",
      `the Management rail declares ${reportsDestinations.length} primary /management/reports destination(s) [${reportsDestinations.map((i) => i.label).join(", ")}]; R-C2-3 permits EXACTLY ONE`,
    );
  } else if (reportsDestinations[0].label !== "Reports") {
    fail(
      "N-1",
      `the single Management Reports destination is labelled "${reportsDestinations[0].label}"; R-C2-3 and the frame record both name it "Reports"`,
    );
  } else if (reportsDestinations[0].href !== "/management/reports") {
    fail(
      "N-1",
      `the Management Reports rail href is "${reportsDestinations[0].href}"; it must carry NO query string — Pending, Corrections and Approved are internal page filters, not rail destinations`,
    );
  } else {
    pass(
      "N-1",
      `the Management rail declares EXACTLY ONE primary Reports destination — "Reports" -> /management/reports with no query string — among [${labels.join(" | ")}] (R-C2-3)`,
    );
  }
}

// ---------------------------------------------------------------------
// N-2  Exactly one current item, and the RIGHT one, on every route.
// ---------------------------------------------------------------------
{
  const problems = [];
  for (const [role, route, expectedLabel] of ROUTES) {
    const pathname = pathnameOf(route);
    const current = roleConfig[role].navigation.filter((item) =>
      isNavigationItemActive(item, pathname),
    );
    if (current.length !== 1) {
      problems.push(
        `${route}: ${current.length} current item(s) [${current.map((i) => i.label).join(", ") || "none"}]; expected exactly 1 ("${expectedLabel}")`,
      );
    } else if (current[0].label !== expectedLabel) {
      problems.push(
        `${route}: the current item is "${current[0].label}"; expected "${expectedLabel}"`,
      );
    }
  }
  if (problems.length > 0) {
    fail("N-2", `${problems.length} route(s) violate R-C2-3:\n  - ${problems.join("\n  - ")}`);
  } else {
    pass(
      "N-2",
      `all ${ROUTES.length} canonical portal routes and ?status= aliases across the Trainer, Management and Parent rails resolve to EXACTLY ONE current navigation item, and in every case it is the expected item`,
    );
  }
}

// ---------------------------------------------------------------------
// N-3  Every canonical route is covered, and every rail item is reachable
//      as the current item of at least one of them. A rail item no route
//      can ever light up is a destination with no home.
// ---------------------------------------------------------------------
{
  const uncovered = [];
  for (const [role, config] of Object.entries(roleConfig)) {
    for (const item of config.navigation) {
      const covered = ROUTES.some(
        ([r, route, label]) =>
          r === role && label === item.label && isNavigationItemActive(item, pathnameOf(route)),
      );
      if (!covered) uncovered.push(`${role}/"${item.label}"`);
    }
  }
  const total = Object.values(roleConfig).reduce((n, c) => n + c.navigation.length, 0);
  if (uncovered.length > 0) {
    fail("N-3", `rail item(s) that no asserted route makes current: ${uncovered.join(", ")}`);
  } else {
    pass(
      "N-3",
      `every one of the ${total} rail items across the three portals is the current item on at least one asserted canonical route — no rail item is unreachable and none is untested`,
    );
  }
}

// ---------------------------------------------------------------------
// N-4  `exact` is LOAD-BEARING — the two ternary branches must DIFFER.
//      This is the regression guard for the original defect: with both
//      branches identical, an exact item and a non-exact item behave the
//      same, and this leg fails.
// ---------------------------------------------------------------------
{
  const dashboard = roleConfig.management.navigation.find((i) => i.label === "Dashboard");
  const reports = roleConfig.management.navigation.find((i) => i.label === "Reports");
  const schedule = roleConfig.trainer.navigation.find((i) => i.label === "Schedule");
  // A missing item is a FAILURE of this leg, never a crash that skips it: a
  // suite that aborts here would report no verdict at all for the very
  // regression it exists to catch.
  const missing = [
    ["management/Dashboard", dashboard],
    ["management/Reports", reports],
    ["trainer/Schedule", schedule],
  ]
    .filter(([, item]) => !item)
    .map(([name]) => name);
  const checks = missing.length > 0 ? [] : [
    [
      "an EXACT item does not match its sub-tree",
      dashboard?.exact === true && isNavigationItemActive(dashboard, "/management/reports") === false,
    ],
    [
      "an EXACT item still matches its own path",
      isNavigationItemActive(dashboard, "/management") === true,
    ],
    [
      "a NON-EXACT item matches its own path",
      isNavigationItemActive(reports, "/management/reports") === true,
    ],
    [
      "a NON-EXACT item matches its sub-tree",
      isNavigationItemActive(reports, "/management/reports/report-birch/review") === true,
    ],
    [
      "a NON-EXACT item does not match a sibling that merely shares its prefix string",
      isNavigationItemActive(reports, "/management/reportsomething") === false,
    ],
    [
      "a declared `owns` sub-tree is attributed to its item",
      isNavigationItemActive(schedule, "/trainer/sessions/s1/roster") === true,
    ],
    [
      "an undeclared sibling sub-tree is NOT attributed",
      isNavigationItemActive(schedule, "/trainer/reports") === false,
    ],
  ];
  const broken = checks.filter(([, ok]) => !ok).map(([name]) => name);
  if (missing.length > 0) {
    fail(
      "N-4",
      `the rail item(s) this leg discriminates on are absent from the production table: ${missing.join(", ")}. The exact/non-exact distinction could not be exercised.`,
    );
  } else if (broken.length > 0) {
    fail(
      "N-4",
      `the exact/non-exact distinction is not load-bearing: ${broken.join("; ")}. If both branches of the active ternary are the same expression, the \`exact\` flag documents behaviour the code does not have — the condition that hid C2C-002.`,
    );
  } else {
    pass(
      "N-4",
      `\`exact\` is load-bearing: exact items match strictly, non-exact items match their sub-tree but not a mere string-prefix sibling, and declared \`owns\` prefixes are attributed to their item and to no other (${checks.length} discriminating cases)`,
    );
  }
}

console.log("");
if (failures > 0) {
  console.error(`Portal navigation active-state suite: ${failures} failure(s).`);
  process.exitCode = 1;
} else {
  console.log("Portal navigation active-state suite: all proofs passed.");
}
