/**
 * =====================================================================
 * THE REAL SHIPPED ROUTE CENSUS, READ FROM THE APP TREE
 * =====================================================================
 *
 * WHY THIS EXISTS (Run C3-A Phase 2b, item D findings 2 and 3).
 *
 * Two suites asserted against a route list HAND-AUTHORED INSIDE THE TEST while
 * describing it as the application's census:
 *
 *   * `post-login-destinations.mjs` D-5 carried a literal `SHIPPED_ROUTES` set
 *     and reported the result as "the shipped 17-route census". It was a
 *     restatement of the census, not a reading of it — a route added, removed
 *     or renamed in `app/` would not move it, and D-5 would keep passing
 *     against a census that no longer existed.
 *   * `portal-navigation-active-state.mjs` asserted over a hand-authored
 *     `ROUTES` list whose own header claimed it covered `/trainer`,
 *     `/management` and `/parent` "in their own right". `/trainer` was SILENTLY
 *     ABSENT, and nothing failed — the list could not notice its own gap.
 *
 * A test that restates the thing it is meant to measure cannot fail when the
 * thing changes. This module enumerates `app/**\/page.tsx` and derives the
 * routes the way the App Router does, so both suites read the same real tree.
 *
 * DERIVATION RULES (App Router, exactly):
 *   * a route is a directory containing `page.tsx`;
 *   * ROUTE GROUPS — a path segment wrapped in parentheses, e.g. `(auth)` or
 *     `(portals)` — organise files and contribute NOTHING to the URL;
 *   * dynamic segments keep their bracket form (`[reportId]`), because that is
 *     how `next build` prints them and how a census is compared;
 *   * `app/page.tsx` is `/`.
 *
 * `/_not-found` is deliberately NOT included: it is a framework-generated
 * route with no `page.tsx` of its own, so it is not something this repository
 * ships as a page.
 *
 * It touches no database, no network, no browser and no credential.
 * =====================================================================
 */

import { readdir } from "node:fs/promises";
import { join, posix } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));
const APP_DIR = join(REPO_ROOT, "app");

const isRouteGroup = (segment) => segment.startsWith("(") && segment.endsWith(")");

async function walk(directory, urlSegments, found) {
  const entries = await readdir(directory, { withFileTypes: true });
  if (entries.some((entry) => entry.isFile() && entry.name === "page.tsx")) {
    found.push(urlSegments.length === 0 ? "/" : `/${urlSegments.join("/")}`);
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    await walk(
      join(directory, entry.name),
      isRouteGroup(entry.name) ? urlSegments : [...urlSegments, entry.name],
      found,
    );
  }
}

/**
 * Every route this application ships, derived from the app tree. Sorted, so
 * two readings of the same tree are always comparable.
 */
export async function shippedRoutes() {
  const found = [];
  await walk(APP_DIR, [], found);
  if (found.length === 0) {
    // Never report "no routes" as a clean reading: an empty census would make
    // every membership assertion below it vacuously true.
    throw new Error(
      `No page.tsx was found anywhere under ${APP_DIR}. The route census could not be read, so nothing derived ` +
        "from it may be asserted.",
    );
  }
  return found.sort();
}

/**
 * The portal routes only — the three authenticated portal sub-trees. These are
 * the routes the portal rail has to light exactly one navigation item on.
 */
export async function shippedPortalRoutes() {
  return (await shippedRoutes()).filter((route) =>
    ["/trainer", "/management", "/parent"].some(
      (prefix) => route === prefix || route.startsWith(`${prefix}/`),
    ),
  );
}

/**
 * Substitute a concrete value for every dynamic segment, so a derived route can
 * be handed to a pathname matcher. The values are opaque identifiers; nothing
 * in the matcher reads them, and no database is consulted.
 */
export function concreteRoute(route) {
  return route
    .split("/")
    .map((segment) =>
      segment.startsWith("[") && segment.endsWith("]")
        ? `${posix.basename(segment.slice(1, -1))}-fixture`
        : segment,
    )
    .join("/");
}
