"use client";

/**
 * The PORTAL COMPOSITION ROOT (F16-C, gate G-19).
 *
 * Every portal layout mounts this and nothing else. It composes the REAL
 * participant adapter by default and unconditionally — there is no fallback
 * to the fixture, no runtime toggle, and no input from the request.
 *
 * The deterministic fixture is reachable ONLY when the build-time flag
 * `NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE=1` was set (see
 * `lib/frontend/adapters/adapter-mode.ts`). In a build without it,
 * `FIXTURE_MODE_ENABLED` is `false`, `DevFixtureRuntime` is `null`, and the
 * fixture module is never loaded, never constructed and never rendered. This
 * file imports the fixture composition LAZILY and NEVER statically, which is
 * also what keeps it out of the participant bundle graph and what lets the
 * governance scan assert that no participant-path file imports the fixture.
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
 * `null` in every build that did not explicitly opt in.
 *
 * The condition is written as the RAW `process.env.NEXT_PUBLIC_*` comparison
 * rather than as the imported `FIXTURE_MODE_ENABLED` constant on purpose:
 * Next.js substitutes `NEXT_PUBLIC_*` with a build-time literal, so in a
 * participant build this folds to `false` and the bundler can drop the whole
 * dynamic import — the fixture chunk is then never emitted, never fetched and
 * never evaluated. `FIXTURE_MODE_ENABLED` states the same rule once, for
 * anything that needs to reason about the mode without tripping the fold.
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
