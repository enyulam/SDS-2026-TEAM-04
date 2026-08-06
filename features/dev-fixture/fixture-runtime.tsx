"use client";

/**
 * DEVELOPMENT / TEST TOOLING ONLY — the deterministic-fixture composition.
 *
 * G-19. This is the ONLY module outside `lib/frontend/fixtures/**` and
 * `tests/**` that is permitted to import the deterministic fixture, and
 * `scripts/tests/step-7i/static-scan.mjs` leg T7I-40(d) FAILS the build's
 * governance scan if any other file imports it.
 *
 * It is reachable in exactly one way: a build in which
 * `NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE=1` was set, in which case
 * `features/portal/physical-test-runtime.tsx` lazily loads it. It is OFF by
 * default, there is no query parameter, cookie, header or UI control that can
 * turn it on, and no real-auth navigation reaches it — the portal layouts
 * compose the participant adapter unconditionally in a normal build.
 *
 * When it IS composed, `components/layout/portal-shell.tsx` renders a
 * persistent fixture banner on EVERY portal surface, keyed off the port's own
 * `identity.kind`, so a fixture screenshot cannot be mistaken for a real one.
 */

import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  createDeterministicFixturePhysicalTestPort,
  type DeterministicFixturePhysicalTestPort,
} from "@/lib/frontend/fixtures/physical-test-fixture";
import { PortalRuntimeProvider } from "@/features/portal/portal-runtime-context";
import type { SessionRole } from "@/lib/frontend/contracts/physical-test";

export function DevFixtureRuntime({
  children,
  role,
}: {
  readonly children: ReactNode;
  readonly role: SessionRole;
}) {
  const [fixturePort] = useState<DeterministicFixturePhysicalTestPort>(() =>
    createDeterministicFixturePhysicalTestPort(role),
  );
  const [dataRevision, setDataRevision] = useState(0);
  const resetFixture = useCallback(() => {
    fixturePort.reset();
    setDataRevision((value) => value + 1);
  }, [fixturePort]);
  const value = useMemo(
    () => ({ port: fixturePort, dataRevision, resetFixture }),
    [fixturePort, dataRevision, resetFixture],
  );

  return <PortalRuntimeProvider value={value}>{children}</PortalRuntimeProvider>;
}
