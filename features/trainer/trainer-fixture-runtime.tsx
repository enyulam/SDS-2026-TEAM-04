"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createDeterministicFixturePhysicalTestPort,
  type DeterministicFixturePhysicalTestPort,
} from "@/lib/frontend/fixtures/physical-test-fixture";
import type { PhysicalTestPort } from "@/lib/frontend/physical-test-port";
import type { SessionRole } from "@/lib/frontend/contracts/physical-test";

type RuntimeValue = {
  readonly port: PhysicalTestPort;
  readonly fixtureRevision: number;
  readonly resetFixture: () => void;
};

const RuntimeContext = createContext<RuntimeValue | null>(null);

export function FixturePhysicalTestRuntime({
  children,
  role,
}: {
  readonly children: ReactNode;
  readonly role: SessionRole;
}) {
  const [fixturePort] = useState<DeterministicFixturePhysicalTestPort>(() =>
    createDeterministicFixturePhysicalTestPort(role),
  );
  const [fixtureRevision, setFixtureRevision] = useState(0);
  const resetFixture = useCallback(() => {
    fixturePort.reset();
    setFixtureRevision((value) => value + 1);
  }, [fixturePort]);
  const value = useMemo(
    () => ({ port: fixturePort, fixtureRevision, resetFixture }),
    [fixturePort, fixtureRevision, resetFixture],
  );

  return <RuntimeContext.Provider value={value}>{children}</RuntimeContext.Provider>;
}

export function TrainerFixtureRuntime({ children }: { readonly children: ReactNode }) {
  return (
    <FixturePhysicalTestRuntime role="trainer">{children}</FixturePhysicalTestRuntime>
  );
}

export function usePhysicalTestPort(): PhysicalTestPort {
  const runtime = useContext(RuntimeContext);
  if (!runtime) {
    throw new Error("PhysicalTestPort must be used inside TrainerFixtureRuntime.");
  }
  return runtime.port;
}

export function useFixtureRuntime() {
  const runtime = useContext(RuntimeContext);
  if (!runtime) {
    throw new Error("Fixture runtime must be used inside TrainerFixtureRuntime.");
  }
  return runtime;
}
