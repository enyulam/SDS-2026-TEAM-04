/**
 * G-19 — the ONE selector that decides which `PhysicalTestPort` a portal is
 * composed with.
 *
 * THE RULE. The participant adapter is the DEFAULT and the fallback. The
 * deterministic fixture is reachable only when a build-time development /
 * test configuration flag is set to exactly `"1"`:
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
 * This module reads `process.env.NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE` and
 * nothing else, and it reads it as a BUILD-TIME literal. Next.js inlines
 * `NEXT_PUBLIC_*` at compile time, so in a normal build the expression below
 * folds to `false` and the fixture branch is statically dead. A participant
 * deployment that simply never sets the variable cannot reach fixture
 * composition at all — the absence of the flag is a safe default, not an
 * omission.
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
 * `true` only in a build that explicitly opted in. Evaluated once, from the
 * inlined literal, so there is no per-render input a caller could influence.
 */
export const FIXTURE_MODE_ENABLED: boolean =
  process.env.NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE === FIXTURE_MODE_ON;
