"use client";

/**
 * The PORTAL COMPOSITION ROOT (F16-C, gate G-19).
 *
 * Every portal layout mounts this and nothing else. It composes the REAL
 * participant adapter by default and unconditionally — there is no fallback
 * to the fixture, no runtime toggle, and no input from the request.
 *
 * The deterministic fixture is reachable ONLY when the environment variable
 * `NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE=1` is set in the SERVER ENVIRONMENT the
 * app is started in (see `lib/frontend/adapters/adapter-mode.ts` for the full
 * record). Where it is not set, `FIXTURE_MODE_ENABLED` is `false`,
 * `DevFixtureRuntime` is `null`, and the fixture module is never imported,
 * never constructed and never rendered. This file imports the fixture
 * composition LAZILY and NEVER statically, which is what keeps it off the
 * synchronous participant load path and what lets the governance scan assert
 * that no participant-path file imports the fixture.
 *
 * `role` is PRESENTATION ONLY here, exactly as everywhere else (A-046,
 * Amendment 005): it selects the fixture's synthetic persona in fixture mode
 * and is otherwise unused. It grants nothing. Real authority is server-derived
 * on every request by `proxy.ts` and by each layout's `requirePortalAccess`.
 */

import dynamic from "next/dynamic";
import { useMemo, useState, type ReactNode } from "react";
import { FIXTURE_MODE_ENABLED } from "@/lib/frontend/adapters/adapter-mode";
import { createRealParticipantPhysicalTestPort } from "@/lib/frontend/adapters/real-participant-port";
import type { RealParticipantPhysicalTestPort } from "@/lib/frontend/physical-test-port";
import type { SessionRole } from "@/lib/frontend/contracts/physical-test";
import { PortalRuntimeProvider } from "@/features/portal/portal-runtime-context";

/**
 * `null` wherever the server environment did not explicitly opt in.
 *
 * CORRECTED AT F16-C1. The earlier note here claimed the bundler folds this
 * comparison to `false` and drops the dynamic import so that "the fixture
 * chunk is never emitted". That is NOT what happens, and the emitted client
 * chunk contains this comparison verbatim. What is actually true:
 *  - `process.env.NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE` is read AT RUNTIME, on
 *    the server from the process environment and in the browser from the
 *    bundler's `process` shim. The read happens ONCE, here at module scope;
 *  - the fixture chunk IS EMITTED into the build output. While the flag is
 *    off, `dynamic()` is never called, so that chunk is never fetched, never
 *    evaluated and never rendered — but it is present in the artefact;
 *  - consequently a REBUILD IS NOT REQUIRED to change the mode: the same
 *    build runs as a participant build with the variable unset and in fixture
 *    mode with it set to "1" before `next start`. The boundary is the server
 *    environment, nothing else.
 *
 * The security property is unchanged and is the one that matters: fixture mode
 * is off unless the deploying OPERATOR sets that variable. No query parameter,
 * cookie, header, request value or UI control can enable it. When it IS on it
 * is visibly identified — `PortalShell` renders a persistent fixture banner on
 * every portal surface, keyed off `port.identity.kind ===
 * "deterministic_fixture"`, which the real participant adapter can never
 * report.
 *
 * The condition is still written as the RAW `process.env.NEXT_PUBLIC_*`
 * comparison rather than the imported `FIXTURE_MODE_ENABLED` constant so that
 * the gating variable is legible at the one site that performs the dynamic
 * import; `FIXTURE_MODE_ENABLED` states the same rule once for everything that
 * needs to reason about the mode.
 */
const DevFixtureRuntime =
  process.env.NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE === "1"
    ? dynamic(
        () =>
          import("@/features/dev-fixture/fixture-runtime").then(
            (module) => module.DevFixtureRuntime,
          ),
      )
    : null;

function RealParticipantRuntime({ children }: { readonly children: ReactNode }) {
  // One port per portal mount. It is stateless — it holds no data, no cache
  // and no session; every call is a fresh governed Server Action.
  const [port] = useState<RealParticipantPhysicalTestPort>(() =>
    createRealParticipantPhysicalTestPort(),
  );
  const value = useMemo(
    () => ({ port, dataRevision: 0, resetFixture: null }),
    [port],
  );
  return <PortalRuntimeProvider value={value}>{children}</PortalRuntimeProvider>;
}

export function PhysicalTestRuntime({
  children,
  role,
}: {
  readonly children: ReactNode;
  readonly role: SessionRole;
}) {
  if (FIXTURE_MODE_ENABLED && DevFixtureRuntime) {
    return <DevFixtureRuntime role={role}>{children}</DevFixtureRuntime>;
  }
  return <RealParticipantRuntime>{children}</RealParticipantRuntime>;
}
