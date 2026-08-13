/**
 * INTEGRATED-ROUTE AND SECURITY VALIDATION — F16-D.
 *
 * This suite proves the SECURITY BOUNDARIES that F16-A (real authentication and root
 * routing), F16-B (server-side portal authorization) and F16-C (governed participant
 * adapter) put in place. It runs against a REAL PRODUCTION BUILD served by
 * `next start`, over the network, plus headless Chrome driven over raw CDP — exactly the
 * harness style already used by `tests/frontend/three-role-browser-smoke.mjs` and
 * `tests/frontend/authentication-browser-smoke.mjs`. No test runner, no Playwright, no
 * Vitest, no new dependency: plain `node tests/frontend/integrated-route-security.mjs`.
 *
 * ---------------------------------------------------------------------------
 * NO CREDENTIAL IS INVOLVED, AND NONE IS NEEDED
 * ---------------------------------------------------------------------------
 * CLAUDE.md §11 is binding: this file requests, accepts, embeds, prints and persists NO
 * password, token, API key, service-role key or JWT secret. There is no environment
 * variable password path and no fixture credential here, and there never will be.
 *
 * Every assertion below therefore proves DENIAL and STRUCTURE, never a successful
 * sign-in. That is not a weaker test — it is the correct one. A route guard is only
 * interesting when it says no, and "says no identically to everyone who is not entitled"
 * is precisely the property that a valid password would stop us from observing.
 *
 * The legs that genuinely require a live authenticated session — the six authenticated
 * CROSS-ROLE denials — are NOT faked, NOT skipped silently and NOT approximated. They are
 * enumerated explicitly in `F17_DEFERRED` below, printed on every run, and belong to the
 * operator-assisted F17 runner where a real operator supplies a real credential
 * interactively. This suite instead proves the SHAPE of that guard by static inspection of
 * `proxy.ts` and the three portal layouts, so that what F17 exercises is already known to
 * exist, to be duplicated across two independent layers, and to be non-disclosing.
 *
 * ---------------------------------------------------------------------------
 * USAGE
 * ---------------------------------------------------------------------------
 *   npm run build
 *   npx next start -p 3414
 *   BEST_COACH_APP_ORIGIN=http://127.0.0.1:3414 node tests/frontend/integrated-route-security.mjs
 *
 * Environment:
 *   BEST_COACH_APP_ORIGIN   default http://127.0.0.1:3000
 *   CHROME_PATH             default the standard Windows Chrome location
 *
 * Exit code is 0 only if every assertion passed. One line per assertion is printed with a
 * stable `SEC-nn` identifier, so a diff between two runs is meaningful.
 *
 * IMPORTANT: run this against a build made WITHOUT `NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE=1`.
 * SEC-08 asserts the fixture is absent; a fixture-mode build is expected to fail it, and
 * that failure is the assertion working, not a defect.
 */

import { spawn } from "node:child_process";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const APP_ORIGIN = (process.env.BEST_COACH_APP_ORIGIN ?? "http://127.0.0.1:3000").replace(
  /\/+$/,
  "",
);
const CHROME_PATH =
  process.env.CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const DEBUG_PORT = 9347;
const REPO_ROOT = fileURLToPath(new URL("../../", import.meta.url));

/* ===========================================================================
 * ROUTE CENSUS — the 17 routes this build ships (`next build` route table).
 * ========================================================================= */

/**
 * Opaque, well-formed but non-existent identifiers for the dynamic segments.
 *
 * They are literal constants, not fixture keys: no route below is ever expected to RESOLVE
 * them. That is deliberate — an unauthenticated caller must be denied BEFORE the id is ever
 * looked at, so a guard that only rejected unknown ids would fail these assertions.
 */
const OPAQUE_ID = "00000000-0000-4000-8000-000000000001";
const OPAQUE_ID_2 = "00000000-0000-4000-8000-000000000002";
const OPAQUE_ID_3 = "00000000-0000-4000-8000-000000000003";

/**
 * The 14 CANONICAL portal routes. `/trainer` and `/management` are deliberately NOT in this
 * list: both are compatibility redirects and each is asserted separately (SEC-12, SEC-12b) so
 * that its preservation is a named requirement rather than an incidental pass.
 *
 * ⚠️ `/management` MOVED INTO THAT CLASS AT `P2-7`. Screen `11` took `/management/dashboard`
 * as its canonical route and `/management` became a redirect toward it, built to the same
 * R-B1 precedent `/trainer` already sets. ▶ The canonical entry below is therefore the
 * DASHBOARD, and the bare prefix is carried by `MANAGEMENT_COMPAT_ROUTE`. Leaving `/management`
 * in this list would have asserted a canonical route that no longer renders anything.
 */
const PORTAL_ROUTES = [
  "/trainer/schedule",
  "/trainer/reports",
  `/trainer/reports/${OPAQUE_ID}/edit`,
  `/trainer/reports/${OPAQUE_ID}/generate`,
  `/trainer/reports/${OPAQUE_ID}/review`,
  `/trainer/sessions/${OPAQUE_ID_2}/roster`,
  `/trainer/sessions/${OPAQUE_ID_2}/students/${OPAQUE_ID_3}/assess`,
  "/management/dashboard",
  "/management/reports",
  `/management/reports/${OPAQUE_ID}/edit`,
  `/management/reports/${OPAQUE_ID}/review`,
  "/parent",
  "/parent/reports",
  `/parent/students/${OPAQUE_ID_3}/sessions/${OPAQUE_ID_2}/report`,
];

/** The compatibility redirect, preserved by operator ruling R-B1 (`app/(portals)/trainer/page.tsx`). */
const TRAINER_COMPAT_ROUTE = "/trainer";

/** The second compatibility redirect, added at `P2-7` on the same R-B1 precedent (`app/(portals)/management/page.tsx`). */
const MANAGEMENT_COMPAT_ROUTE = "/management";

/** Everything the proxy guards: the 14 canonical portal routes plus BOTH compatibility aliases. */
const GUARDED_ROUTES = [...PORTAL_ROUTES, TRAINER_COMPAT_ROUTE, MANAGEMENT_COMPAT_ROUTE];

/** The two non-portal routes. `/` is guarded by `app/page.tsx`; `/login` is the open door. */
const ROOT_ROUTE = "/";
const LOGIN_ROUTE = "/login";

/**
 * 14 canonical portal + 2 compatibility + `/` + `/login` = the 18 routes `next build` lists.
 *
 * ⚠️ 17 -> 18 AT `P2-7`, and the increment is REAL rather than bookkeeping: screen `11` ADDED
 * `/management/dashboard` without removing `/management`, which still ships as the redirect.
 * ▶ Rewritten with the new route NAMED, never bumped silently -- a census that moves without
 * saying what moved stops being evidence.
 */
const CANONICAL_ROUTE_COUNT = 18;

/** A-046, Amendment 005: this parameter is PRESENTATION ONLY and grants nothing. */
const ROLE_QUERIES = ["trainer", "management", "parent"];

/* ===========================================================================
 * F17-DEFERRED REGISTER
 * ========================================================================= */

/**
 * Legs that CANNOT be proven without a valid password, listed so that nothing is silently
 * missing. These are not written here, not stubbed here and not approximated here.
 *
 * Each names the static evidence this suite DOES provide for the same guard, so the F17
 * runner is confirming behaviour whose structure is already pinned.
 */
const F17_DEFERRED = [
  {
    id: "F17-X01",
    leg: "Trainer session requesting /management/** is redirected to /trainer/schedule",
    staticEvidence: "SEC-13 (proxy role mismatch) + SEC-14 (management layout guard literal)",
  },
  {
    id: "F17-X02",
    leg: "Trainer session requesting /parent/** is redirected to /trainer/schedule",
    staticEvidence: "SEC-13 + SEC-14 (parent layout guard literal)",
  },
  {
    id: "F17-X03",
    leg: "Management session requesting /trainer/** is redirected to /management",
    staticEvidence: "SEC-13 + SEC-14 (trainer layout guard literal)",
  },
  {
    id: "F17-X04",
    leg: "Management session requesting /parent/** is redirected to /management",
    staticEvidence: "SEC-13 + SEC-14 (parent layout guard literal)",
  },
  {
    id: "F17-X05",
    leg: "Parent session requesting /trainer/** is redirected to /parent",
    staticEvidence: "SEC-13 + SEC-14 (trainer layout guard literal)",
  },
  {
    id: "F17-X06",
    leg: "Parent session requesting /management/** is redirected to /parent",
    staticEvidence: "SEC-13 + SEC-14 (management layout guard literal)",
  },
  {
    id: "F17-X07",
    leg: "An authenticated caller on /login is bounced to their OWN server-derived portal",
    staticEvidence: "SEC-13 (proxy /login branch reads identity, never the role query)",
  },
  {
    id: "F17-X08",
    leg: "Management portal DOM carries no protected assessment substance WITH a live session",
    staticEvidence: "SEC-18 (no substance in any denied body) + three-role-browser-smoke.mjs",
  },
  {
    id: "F17-X09",
    leg: "Parent report DOM shows only the four canonical panels + submitted_at WITH a live session",
    staticEvidence: "SEC-18 + three-role-browser-smoke.mjs assertParentSurfaceClean",
  },
  {
    id: "F17-X10",
    leg: "A signed-in caller's adapter identity renders as real_participant_adapter, not fixture",
    staticEvidence: "SEC-08 (no fixture marker in any body) + SEC-16 (composition root)",
  },
];

/* ===========================================================================
 * NON-DISCLOSURE VOCABULARY
 * ========================================================================= */

/**
 * Markers that identify the DETERMINISTIC FIXTURE. If any of these reaches a participant
 * response, the fixture was composed — which in a build without the flag is impossible by
 * construction and must therefore be caught loudly.
 *
 * The six `Learner *` names are the fixture roster
 * (`lib/frontend/fixtures/physical-test-fixture.ts`); they double as the student-name probe
 * for SEC-18, because they are the ONLY student names that exist anywhere in this codebase.
 */
const FIXTURE_MARKERS = [
  "deterministic_fixture",
  "browser_session_only",
  "Deterministic fixture mode",
  "Reset fixture",
  "createDeterministicFixturePhysicalTestPort",
  "Learner Aster",
  "Learner Birch",
  "Learner Cedar",
  "Learner Delta",
  "Learner Ember",
  "Learner Fern",
];

/**
 * PROTECTED SUBSTANCE that must never appear in a DENIED response.
 *
 * These are deliberately PRECISE markers, not bare English words. `app/layout.tsx` ships a
 * static site description ("Trainer-led B.E.S.T. observation and report review workspace.")
 * and the framework's own 404 copy; matching bare "observation", "report" or "trainer"
 * would flag that prose and teach a future maintainer to loosen the rule. What is matched
 * instead is the machine form each datum actually takes — a column name, a data attribute,
 * a serialized field, an enum literal — which is what a real leak would look like.
 */
const PROTECTED_SUBSTANCE = [
  // Content hash and revision/version metadata (A-021, A-038, A-048).
  "content_hash",
  "contentHash",
  "data-content-hash",
  "revision_number",
  "revisionNumber",
  "data-revision",
  "version_id",
  "versionId",
  "data-version-id",
  // Raw rating labels as enum literals, plus the rating carrier attributes.
  "data-rating",
  "data-rating-level",
  "rating_level",
  "ratingLevel",
  '"beginning"',
  '"developing"',
  '"mastering"',
  '"mastered"',
  // Observation substance and evidence chips.
  "observation_text",
  "observationText",
  "data-observation",
  "term_evidence",
  "termEvidence",
  "evidence_chip",
  "evidenceChip",
  "data-chip",
  // Quality checklist and correction reason.
  "quality_checklist",
  "qualityChecklist",
  "correction_reason",
  "correctionReason",
  "data-correction",
  // Lifecycle status literals — a denial must never reveal that a report exists at all.
  "trainer_approved",
  "needs_edit",
  "draft_ready",
  "observation_saved",
  "management_submitted",
  "data-report-status",
  // Audit internals and identity of other people.
  "audit_log",
  "auditLog",
  "actor_account_id",
  "actorAccountId",
  "report_versions",
  "report_version_ratings",
  "student_display_name",
  "studentDisplayName",
  // The elevated service-role surface must never be named in a response.
  "SUPABASE_SERVICE_ROLE_KEY",
  "service_role",
];

/**
 * Markers that only a RENDERED PORTAL produces. Their presence in a response to an
 * unauthenticated caller means the guard let markup through, regardless of status code.
 */
const PORTAL_CONTENT_MARKERS = [
  "data-adapter-kind",
  "data-portal-shell",
  "real_participant_adapter",
  "Sign out",
];

/* ===========================================================================
 * ASSERTION LEDGER
 * ========================================================================= */

const results = [];
let failures = 0;

function check(id, description, condition, detail = "") {
  const ok = condition === true;
  if (!ok) failures += 1;
  results.push({ id, description, ok });
  const suffix = ok ? "" : ` — ${detail || "condition was false"}`;
  console.log(`${ok ? "PASS" : "FAIL"} ${id} ${description}${suffix}`);
}

/** Lowercased substring scan. Returns the terms that were found, so failures name them. */
function findTerms(haystack, terms) {
  const lower = haystack.toLowerCase();
  return terms.filter((term) => lower.includes(term.toLowerCase()));
}

/* ===========================================================================
 * HTTP LAYER
 * ========================================================================= */

/**
 * A single request that NEVER follows a redirect.
 *
 * Following it would destroy the evidence: the whole point is the status and `Location` of
 * the denial itself, and a followed redirect would report the login page's 200 instead.
 */
async function probe(path) {
  const response = await fetch(`${APP_ORIGIN}${path}`, {
    redirect: "manual",
    headers: { accept: "text/html" },
  });
  const body = await response.text();
  return {
    path,
    status: response.status,
    location: response.headers.get("location"),
    body,
  };
}

/** Every response this run observed, for the whole-corpus scans (SEC-08, SEC-17, SEC-18). */
const denialCorpus = [];

async function probeAndCollect(path) {
  const result = await probe(path);
  denialCorpus.push(result);
  return result;
}

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${APP_ORIGIN}${LOGIN_ROUTE}`, { redirect: "manual" });
      if (response.status < 500) {
        await response.text();
        return;
      }
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`No server answering at ${APP_ORIGIN} — start it with \`npx next start\``);
}

await waitForServer();
console.log(`# integrated-route-security against ${APP_ORIGIN}`);
console.log("# no credential is read, typed, embedded, logged or transmitted by this suite");
console.log("");

/* ---------------------------------------------------------------------------
 * SEC-01 — root redirect (F16-A).
 * ------------------------------------------------------------------------- */

const rootProbe = await probeAndCollect(ROOT_ROUTE);
check(
  "SEC-01",
  "GET / unauthenticated redirects to /login",
  rootProbe.status >= 300 &&
    rootProbe.status < 400 &&
    rootProbe.location === LOGIN_ROUTE,
  `got ${rootProbe.status} location=${JSON.stringify(rootProbe.location)}`,
);
check(
  "SEC-02",
  "GET / carries no denial reason in its Location (non-disclosing)",
  rootProbe.location === LOGIN_ROUTE,
  `Location was ${JSON.stringify(rootProbe.location)} — it must be exactly "/login", with no ?error=, ?from= or ?reason=`,
);

/* ---------------------------------------------------------------------------
 * SEC-03 / SEC-04 — unauthenticated portal denial across all 14 canonical routes.
 * ------------------------------------------------------------------------- */

const portalDenials = new Map();
for (const route of GUARDED_ROUTES) {
  portalDenials.set(route, await probeAndCollect(route));
}

const wrongStatus = GUARDED_ROUTES.filter((route) => {
  const probeResult = portalDenials.get(route);
  return !(probeResult.status >= 300 && probeResult.status < 400);
});
check(
  "SEC-03",
  `all ${PORTAL_ROUTES.length} canonical portal routes + the /trainer alias deny unauthenticated (3xx, never 200)`,
  wrongStatus.length === 0,
  `routes that did not redirect: ${wrongStatus.join(", ")}`,
);

const wrongLocation = GUARDED_ROUTES.filter(
  (route) => portalDenials.get(route).location !== LOGIN_ROUTE,
);
check(
  "SEC-04",
  "every portal denial points at exactly /login with no reason encoded",
  wrongLocation.length === 0,
  `routes with a different Location: ${wrongLocation
    .map((route) => `${route} -> ${JSON.stringify(portalDenials.get(route).location)}`)
    .join(", ")}`,
);

const leakedPortalMarkup = GUARDED_ROUTES.filter(
  (route) => findTerms(portalDenials.get(route).body, PORTAL_CONTENT_MARKERS).length > 0,
);
check(
  "SEC-05",
  "no portal denial body contains rendered portal markup",
  leakedPortalMarkup.length === 0,
  `routes leaking portal markup: ${leakedPortalMarkup.join(", ")}`,
);

/**
 * All fifteen guarded denials must be INDISTINGUISHABLE from one another. If
 * `/parent/reports` denied differently from `/management/reports`, the response would
 * reveal which portals exist and which route shapes are real.
 */
const denialSignatures = new Set(
  GUARDED_ROUTES.map((route) => {
    const probeResult = portalDenials.get(route);
    return `${probeResult.status}|${probeResult.location}|${probeResult.body}`;
  }),
);
check(
  "SEC-06",
  "all guarded denials are byte-identical to each other (route existence is not disclosed)",
  denialSignatures.size === 1,
  `${denialSignatures.size} distinct denial signatures: ${[...denialSignatures]
    .map((signature) => JSON.stringify(signature.slice(0, 80)))
    .join(" || ")}`,
);

/* ---------------------------------------------------------------------------
 * SEC-07 — the `role` query grants nothing (A-046, Amendment 005).
 * ------------------------------------------------------------------------- */

const escalationFailures = [];
for (const route of GUARDED_ROUTES) {
  const baseline = portalDenials.get(route);
  for (const role of ROLE_QUERIES) {
    const withQuery = await probeAndCollect(`${route}?role=${role}`);
    const identical =
      withQuery.status === baseline.status &&
      withQuery.location === baseline.location &&
      withQuery.body === baseline.body;
    if (!identical) {
      escalationFailures.push(
        `${route}?role=${role} -> ${withQuery.status} ${JSON.stringify(withQuery.location)} (baseline ${baseline.status} ${JSON.stringify(baseline.location)})`,
      );
    }
  }
}
check(
  "SEC-07",
  `?role= on every guarded route is BYTE-IDENTICAL to the no-query denial (${GUARDED_ROUTES.length} routes x ${ROLE_QUERIES.length} roles)`,
  escalationFailures.length === 0,
  escalationFailures.join(" | "),
);

/**
 * `/` is not proxy-matched — it is denied inside `app/page.tsx` — so its 307 carries the
 * framework's own RSC error document, and that document ECHOES the request URL back into
 * the flight payload. That echo is the ONLY permitted difference, and it is a framework
 * artefact carrying no authority. Everything that constitutes the denial (status,
 * Location) must still be byte-identical, and the bodies must be identical once the
 * echoed query is normalised away — so a real divergence anywhere else still fails.
 */
const normaliseRootBody = (body) =>
  body
    .replace(/\?role=(?:trainer|management|parent)/g, "")
    .replace(/__PAGE__\?\{.*?\}/g, "__PAGE__");

const rootEscalationFailures = [];
for (const role of ROLE_QUERIES) {
  const withQuery = await probeAndCollect(`${ROOT_ROUTE}?role=${role}`);
  if (
    withQuery.status !== rootProbe.status ||
    withQuery.location !== rootProbe.location ||
    normaliseRootBody(withQuery.body) !== normaliseRootBody(rootProbe.body)
  ) {
    rootEscalationFailures.push(
      `/?role=${role} -> ${withQuery.status} ${JSON.stringify(withQuery.location)}`,
    );
  }
}
check(
  "SEC-08",
  "?role= on / produces an identical denial (status, Location and body modulo the framework's URL echo)",
  rootEscalationFailures.length === 0,
  rootEscalationFailures.join(" | "),
);

/* ---------------------------------------------------------------------------
 * SEC-09 / SEC-10 — route census.
 * ------------------------------------------------------------------------- */

const loginProbe = await probeAndCollect(LOGIN_ROUTE);
check(
  "SEC-09",
  "/login stays reachable (200) for an unauthenticated caller",
  loginProbe.status === 200,
  `got ${loginProbe.status}`,
);

const unexpected404 = [...GUARDED_ROUTES, ROOT_ROUTE, LOGIN_ROUTE].filter(
  (route) => (portalDenials.get(route) ?? (route === "/" ? rootProbe : loginProbe)).status === 404,
);
check(
  "SEC-10",
  `all ${CANONICAL_ROUTE_COUNT} canonical routes resolve — none 404s unexpectedly`,
  unexpected404.length === 0 &&
    GUARDED_ROUTES.length + 2 === CANONICAL_ROUTE_COUNT,
  `404s: ${unexpected404.join(", ")}; counted ${GUARDED_ROUTES.length + 2} routes, expected ${CANONICAL_ROUTE_COUNT}`,
);

/**
 * The control for SEC-10. If a genuinely unknown path ALSO produced a redirect, the 3xx
 * responses above would prove nothing — they could be a blanket catch-all rather than a
 * guard. A 404 here is what makes every assertion above meaningful.
 */
const unknownProbe = await probe("/definitely-not-a-route-f16d-control");
check(
  "SEC-11",
  "an unknown path 404s (proving the portal 3xx responses are a guard, not a catch-all)",
  unknownProbe.status === 404,
  `got ${unknownProbe.status} location=${JSON.stringify(unknownProbe.location)}`,
);

/**
 * `/trainer` must keep working as the compatibility alias (operator ruling R-B1). Its
 * unauthenticated behaviour is — correctly — the same `/login` denial as every other portal
 * route, because authorization runs BEFORE the alias resolves. That the alias itself is
 * preserved is therefore proven from source, which is the only place it is observable
 * without a session.
 */
const trainerEntrySource = await readFile(
  join(REPO_ROOT, "app", "(portals)", "trainer", "page.tsx"),
  "utf8",
);
check(
  "SEC-12",
  "/trainer is preserved as a compatibility redirect toward /trainer/schedule",
  portalDenials.get(TRAINER_COMPAT_ROUTE).location === LOGIN_ROUTE &&
    /redirect\(\s*["']\/trainer\/schedule["']\s*\)/.test(trainerEntrySource),
  `unauthenticated Location=${JSON.stringify(portalDenials.get(TRAINER_COMPAT_ROUTE).location)}; source redirect present=${/redirect\(\s*["']\/trainer\/schedule["']\s*\)/.test(trainerEntrySource)}`,
);

/**
 * ⛔ AND THE SAME PROOF FOR `/management`, SEPARATELY NAMED. Screen `11` moved the Management
 * home to `/management/dashboard` at `P2-7` and left `/management` as the alias. Its
 * unauthenticated behaviour is likewise the `/login` denial -- authorization runs BEFORE the
 * alias resolves -- so the alias itself is again proven FROM SOURCE.
 *
 * ▶ Written as its own leg rather than folded into SEC-12, because a single leg covering both
 * would pass while one of the two redirects was silently deleted.
 */
const managementEntrySource = await readFile(
  join(REPO_ROOT, "app", "(portals)", "management", "page.tsx"),
  "utf8",
);
const managementRedirectPresent = /redirect\(\s*["']\/management\/dashboard["']\s*\)/.test(managementEntrySource);
check(
  "SEC-12b",
  "/management is preserved as a compatibility redirect toward /management/dashboard",
  portalDenials.get(MANAGEMENT_COMPAT_ROUTE).location === LOGIN_ROUTE && managementRedirectPresent,
  `unauthenticated Location=${JSON.stringify(portalDenials.get(MANAGEMENT_COMPAT_ROUTE).location)}; source redirect present=${managementRedirectPresent}`,
);

/* ---------------------------------------------------------------------------
 * SEC-13 .. SEC-16 — the SHAPE of the cross-role guard, by static inspection.
 *
 * An unauthenticated request cannot exercise the wrong-role branch: it is denied one step
 * earlier. Rather than fake a session, these assertions pin the STRUCTURE of the guard, so
 * that the F17 operator-assisted run is confirming a mechanism already known to exist.
 * ------------------------------------------------------------------------- */

const proxySource = await readFile(join(REPO_ROOT, "proxy.ts"), "utf8");

/**
 * Strip comments before asserting an ABSENCE.
 *
 * These modules are heavily documented, and the documentation legitimately NAMES the things
 * the code must not do — `proxy.ts` says in prose "This file never reads
 * `request.nextUrl.searchParams` at all". A naive whole-file scan would read that sentence
 * as the violation it denies, and the only ways to "fix" that are to delete the
 * documentation or to weaken the rule. Neither is acceptable, so the scan looks at code.
 *
 * `//` is only treated as a line comment when it is not preceded by `:`, so a `http://` or
 * `https://` inside a string literal survives.
 */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1");
}

const proxyCode = stripComments(proxySource);

check(
  "SEC-13",
  "proxy.ts denies a wrong-role caller, derives authority server-side, and never reads the role query",
  /export\s+(?:async\s+)?function\s+proxy\s*\(/.test(proxyCode) &&
    proxyCode.includes("resolveSessionIdentity") &&
    /identity\.data\.role\s*!==\s*portal/.test(proxyCode) &&
    proxyCode.includes("portalHomeForRole") &&
    !proxyCode.includes("searchParams") &&
    !/["']role["']\s*\]|get\(\s*["']role["']\s*\)/.test(proxyCode),
  "proxy.ts (comments stripped) must export `proxy`, call resolveSessionIdentity, branch on identity.data.role !== portal, redirect via portalHomeForRole, and read neither searchParams nor a `role` key",
);

/**
 * The matcher must cover every guarded prefix INCLUDING the bare prefix. `/trainer` (the
 * compatibility alias), `/management` and `/parent` are separate matcher entries from
 * `/:path*`, and dropping one would leave a portal root relying on the layout guard alone.
 */
const matcherEntries = [
  "/trainer",
  "/trainer/:path*",
  "/management",
  "/management/:path*",
  "/parent",
  "/parent/:path*",
  "/login",
];
const missingMatcher = matcherEntries.filter(
  (entry) => !proxyCode.includes(`"${entry}"`),
);
check(
  "SEC-13b",
  "the proxy matcher covers all three portal prefixes, their bare roots, and /login",
  missingMatcher.length === 0,
  `matcher entries missing from proxy.ts: ${missingMatcher.join(", ")}`,
);

const layoutGuards = [
  ["trainer", join(REPO_ROOT, "app", "(portals)", "trainer", "layout.tsx")],
  ["management", join(REPO_ROOT, "app", "(portals)", "management", "layout.tsx")],
  ["parent", join(REPO_ROOT, "app", "(portals)", "parent", "layout.tsx")],
];
const missingLayoutGuard = [];
for (const [role, path] of layoutGuards) {
  const source = stripComments(await readFile(path, "utf8"));
  const guarded = new RegExp(
    `requirePortalAccess\\(\\s*["']${role}["']\\s*\\)`,
  ).test(source);
  if (!guarded) missingLayoutGuard.push(role);
}
check(
  "SEC-14",
  "each portal layout independently re-guards with its OWN literal role (second layer, not the proxy's)",
  missingLayoutGuard.length === 0,
  `layouts missing requirePortalAccess("<own role>"): ${missingLayoutGuard.join(", ")}`,
);

const guardSource = stripComments(
  await readFile(
    join(REPO_ROOT, "server", "modules", "identity-access", "portal-guard.ts"),
    "utf8",
  ),
);
check(
  "SEC-15",
  "portal-guard.ts denies unresolved callers to /login and wrong-role callers to their own portal",
  guardSource.includes("resolveSessionIdentity") &&
    /redirect\(\s*["']\/login["']\s*\)/.test(guardSource) &&
    /identity\.data\.role\s*!==\s*portal/.test(guardSource) &&
    guardSource.includes("portalHomeForRole"),
  "portal-guard.ts must re-resolve identity and carry both denial branches",
);

/**
 * Next.js 16 renamed the request-interception convention. `middleware.ts` is deprecated and
 * the two files may never coexist — `next/dist/build/index.js` throws if both are present.
 * If a future change reintroduced `middleware.ts`, layer 1 would silently change semantics.
 */
let middlewareExists = true;
try {
  await readFile(join(REPO_ROOT, "middleware.ts"), "utf8");
} catch {
  middlewareExists = false;
}
check(
  "SEC-16",
  "the guard lives in proxy.ts only — no middleware.ts exists alongside it (Next 16 convention)",
  middlewareExists === false,
  "middleware.ts is present; Next.js 16.2.10 throws when both conventions exist",
);

/* ---------------------------------------------------------------------------
 * SEC-17 / SEC-18 — whole-corpus scans over every response observed above.
 * ------------------------------------------------------------------------- */

const fixtureLeaks = [];
for (const response of denialCorpus) {
  const found = findTerms(response.body, FIXTURE_MARKERS);
  if (found.length > 0) fixtureLeaks.push(`${response.path}: ${found.join(", ")}`);
}
check(
  "SEC-17",
  `fixture isolation — no fixture banner, identity or roster marker in any of the ${denialCorpus.length} responses observed`,
  fixtureLeaks.length === 0,
  fixtureLeaks.join(" | "),
);

const substanceLeaks = [];
for (const response of denialCorpus) {
  const found = findTerms(response.body, PROTECTED_SUBSTANCE);
  if (found.length > 0) substanceLeaks.push(`${response.path}: ${found.join(", ")}`);
}
check(
  "SEC-18",
  `no denied response leaks protected substance (hash, rating, observation, chip, checklist, status, audit, student name) across ${denialCorpus.length} responses`,
  substanceLeaks.length === 0,
  substanceLeaks.join(" | "),
);

/**
 * A denial must not carry a reason in ANY channel, not only in the path. A `?error=`,
 * `?reason=`, `?from=` or `?next=` on the redirect target would distinguish "unknown
 * account" from "wrong password" from "no membership" — precisely what must stay
 * indistinguishable.
 */
const reasonBearing = denialCorpus.filter(
  (response) =>
    typeof response.location === "string" &&
    /[?&](error|reason|from|next|redirect|denied|code)=/i.test(response.location),
);
check(
  "SEC-19",
  "no denial Location carries a reason, origin or return-to parameter",
  reasonBearing.length === 0,
  reasonBearing.map((response) => `${response.path} -> ${response.location}`).join(", "),
);

/* ===========================================================================
 * BROWSER LAYER — headless Chrome over raw CDP, same pattern as
 * `tests/frontend/three-role-browser-smoke.mjs`.
 * ========================================================================= */

const profileDirectory = await mkdtemp(join(tmpdir(), "best-coach-sec-chrome-"));
const chrome = spawn(
  CHROME_PATH,
  [
    "--headless=new",
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${profileDirectory}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "--disable-component-update",
    "--disable-default-apps",
    "--disable-gpu",
    "--window-size=1440,1024",
    "about:blank",
  ],
  { stdio: "ignore", windowsHide: true },
);
chrome.unref();

let socket;
let messageId = 0;
const pending = new Map();
const consoleErrors = [];

function send(method, params = {}) {
  messageId += 1;
  const id = messageId;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression) {
  const response = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (response.result?.exceptionDetails) {
    throw new Error(`Evaluate failed: ${response.result.exceptionDetails.text}`);
  }
  return response.result?.result?.value;
}

async function navigate(path) {
  await send("Page.navigate", { url: `${APP_ORIGIN}${path}` });
  await new Promise((resolve) => setTimeout(resolve, 1200));
}

async function findPageTarget() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
      const targets = await response.json();
      const page = targets.find((target) => target.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome is not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Chrome did not expose a page target");
}

let browserFailure = null;
try {
  const wsUrl = await findPageTarget();
  socket = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
      return;
    }
    if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
      consoleErrors.push(
        message.params.args?.map((arg) => arg.value ?? arg.description ?? "").join(" ") ??
          "console error",
      );
    }
    if (message.method === "Runtime.exceptionThrown") {
      consoleErrors.push(message.params.exceptionDetails?.text ?? "uncaught exception");
    }
    if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
      consoleErrors.push(message.params.entry.text);
    }
  });

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");

  /**
   * The browser legs. `/` and every portal root are navigated for real, so the FOLLOWED
   * redirect is exercised end to end — a browser, not a fetch, resolving the guard.
   */
  const browserRoutes = [
    LOGIN_ROUTE,
    ROOT_ROUTE,
    `${ROOT_ROUTE}?role=management`,
    "/trainer",
    "/management",
    "/management/dashboard",
    "/parent",
    "/management/reports?role=management",
    "/parent/reports?role=parent",
  ];

  const landedElsewhere = [];
  const domOffenders = [];
  const domFixtureLeaks = [];
  const domSubstanceLeaks = [];

  for (const route of browserRoutes) {
    await navigate(route);

    const landing = await evaluate("location.pathname");
    if (route !== LOGIN_ROUTE && landing !== LOGIN_ROUTE) {
      landedElsewhere.push(`${route} landed on ${landing}`);
    }

    /**
     * The Management/Parent DOM exclusions, in the same form
     * `three-role-browser-smoke.mjs` asserts them: no rating/dimension/evidence/hash/
     * version/correction carrier attribute, and no embedded media element, anywhere in the
     * rendered production DOM. Applied here to every surface reachable WITHOUT a session.
     */
    const offenders = await evaluate(`
      (() => {
        const attributes = [
          "data-rating", "data-rating-level", "data-dimension", "data-dimension-code",
          "data-evidence-state", "data-evidence-url", "data-content-hash", "data-version-id",
          "data-revision", "data-report-status", "data-correction", "data-chip",
          "data-observation", "data-checklist",
        ];
        const found = [];
        for (const element of document.body.querySelectorAll("*")) {
          const tag = element.tagName.toLowerCase();
          if (["video", "iframe", "audio", "source", "track", "embed", "object"].includes(tag)) {
            found.push("media:" + tag);
            continue;
          }
          for (const attribute of attributes) {
            if (element.hasAttribute(attribute)) found.push(tag + "[" + attribute + "]");
          }
        }
        return found;
      })()
    `);
    if (Array.isArray(offenders) && offenders.length > 0) {
      domOffenders.push(`${route}: ${offenders.join(", ")}`);
    }

    const text = await evaluate("document.body.innerText");
    const html = await evaluate("document.documentElement.outerHTML");
    const fixtureFound = findTerms(`${text}\n${html}`, FIXTURE_MARKERS);
    if (fixtureFound.length > 0) domFixtureLeaks.push(`${route}: ${fixtureFound.join(", ")}`);
    const substanceFound = findTerms(html, PROTECTED_SUBSTANCE);
    if (substanceFound.length > 0) {
      domSubstanceLeaks.push(`${route}: ${substanceFound.join(", ")}`);
    }
  }

  check(
    "SEC-20",
    "in a real browser, every portal navigation (with and without ?role=) lands on /login",
    landedElsewhere.length === 0,
    landedElsewhere.join(" | "),
  );
  check(
    "SEC-21",
    "no session-free surface renders a rating, dimension, evidence, hash, version, correction or media carrier",
    domOffenders.length === 0,
    domOffenders.join(" | "),
  );
  check(
    "SEC-22",
    "no session-free rendered DOM contains a fixture identity, banner or roster marker",
    domFixtureLeaks.length === 0,
    domFixtureLeaks.join(" | "),
  );
  check(
    "SEC-23",
    "no session-free rendered DOM contains protected assessment substance",
    domSubstanceLeaks.length === 0,
    domSubstanceLeaks.join(" | "),
  );
  check(
    "SEC-24",
    "browser console is clean — consoleErrors is empty across every navigated route",
    consoleErrors.length === 0,
    consoleErrors.join(" | "),
  );
} catch (error) {
  browserFailure = error;
  check("SEC-20", "browser layer executed", false, String(error?.message ?? error));
} finally {
  try {
    if (socket && socket.readyState === 1) await send("Browser.close");
  } catch {
    // The browser may already be gone.
  }
  try {
    socket?.close();
  } catch {
    // Nothing to close.
  }
  // Belt and braces: never leave a headless Chrome behind, even if Browser.close failed.
  try {
    if (chrome.exitCode === null) chrome.kill();
  } catch {
    // Already exited.
  }
}

/* ===========================================================================
 * SUMMARY
 * ========================================================================= */

console.log("");
console.log("# F17-DEFERRED — legs that require a VALID SESSION and are NOT proven here.");
console.log("# They are not faked, not stubbed and not approximated. The operator-assisted");
console.log("# F17 runner owns them. Static evidence for each guard's shape is named.");
for (const deferred of F17_DEFERRED) {
  console.log(`  ${deferred.id}  ${deferred.leg}`);
  console.log(`             static evidence here: ${deferred.staticEvidence}`);
}

const passed = results.filter((result) => result.ok).length;
console.log("");
console.log(
  JSON.stringify(
    {
      result: failures === 0 ? "passed" : "failed",
      origin: APP_ORIGIN,
      assertions: results.length,
      passed,
      failed: failures,
      httpResponsesInspected: denialCorpus.length,
      canonicalRoutes: CANONICAL_ROUTE_COUNT,
      guardedPortalRoutes: GUARDED_ROUTES.length,
      f17Deferred: F17_DEFERRED.length,
      credentialUsed: false,
      browserFailure: browserFailure ? String(browserFailure.message ?? browserFailure) : null,
    },
    null,
    2,
  ),
);

process.exit(failures === 0 ? 0 : 1);
