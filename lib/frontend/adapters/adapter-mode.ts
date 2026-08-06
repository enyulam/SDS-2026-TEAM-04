/**
 * G-19 — the ONE selector that decides which `PhysicalTestPort` a portal is
 * composed with.
 *
 * THE RULE. The participant adapter is the DEFAULT and the fallback. The
 * deterministic fixture is reachable only when a development / test
 * environment variable is set, in the SERVER ENVIRONMENT, to exactly `"1"`:
 *
 *     NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE=1
 *
 * WHAT CANNOT ENABLE IT. There is deliberately no other input:
 *  - no query parameter (`?role=`, `?fixture=`, anything) — the `role`
 *    parameter is PRESENTATION ONLY and grants nothing (A-046, Amendment 005);
 *  - no cookie, header or request value of any kind;
 *  - no UI control, no localStorage entry, no runtime toggle;
 *  - no server-derived value — authority never selects an adapter.
 *
 * THE ACTUAL MECHANISM, STATED HONESTLY (corrected at F16-C1; the earlier
 * wording here claimed a build-time fold that does not happen). This module
 * reads `process.env.NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE` and nothing else,
 * and it reads it AT RUNTIME:
 *  - the read is a genuine `process.env` lookup — on the server from the Node
 *    process environment, in the browser from the `process` shim the bundler
 *    provides. It is NOT folded to a literal `false` and the branch below is
 *    NOT statically dead. Reading the emitted client chunk shows the
 *    comparison verbatim;
 *  - it is evaluated ONCE, at module scope, so the value is fixed for the life
 *    of the process/page and there is no per-render, per-request or
 *    per-caller input to it;
 *  - the fixture runtime sits behind a dynamic `import()` in
 *    `features/portal/physical-test-runtime.tsx`. That chunk IS PRESENT in the
 *    build output. It is never fetched and never evaluated while the flag is
 *    off, but it is not absent from the artefact and must not be described as
 *    if it were.
 *
 * THE TRUE SECURITY PROPERTY, AND ITS TRUE BOUNDARY. Fixture mode is OFF
 * unless the deploying operator sets the variable in the server environment.
 * It cannot be enabled by a query parameter, cookie, header, request value or
 * any UI control — nothing an untrusted caller controls reaches this
 * expression. The boundary is the deployment environment, and only that.
 *
 * A REBUILD IS NOT REQUIRED TO CHANGE IT. Because the read is a runtime one,
 * the SAME build can be started in fixture mode by setting the variable before
 * `next start`, and started in participant mode by not setting it. Do not
 * write, or rely on, any claim to the contrary: an artefact audit alone does
 * not establish the mode a deployment runs in — the server environment does.
 *
 * VISIBILITY. Enabling the flag is not enough to make a fixture screenshot
 * pass for a real one: when it is on, `PortalShell` renders a persistent
 * fixture banner on every portal surface, keyed off the PORT'S OWN identity
 * (`identity.kind === "deterministic_fixture"`), which the real adapter can
 * never report.
 */

/** The exact, single accepted value. Any other value — including `"true"`, `"yes"` or `""` — is off. */
const FIXTURE_MODE_ON = "1";

export const FIXTURE_MODE_ENV_VAR = "NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE" as const;

/**
 * `true` only where the server environment explicitly opted in. Evaluated once
 * at module scope, from a runtime `process.env` read, so there is no
 * per-render, per-request input a caller could influence.
 */
export const FIXTURE_MODE_ENABLED: boolean =
  process.env.NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE === FIXTURE_MODE_ON;
