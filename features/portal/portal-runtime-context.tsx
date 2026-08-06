"use client";

/**
 * The `PhysicalTestPort` a portal subtree is composed with, plus the two
 * pieces of runtime state the surfaces need.
 *
 * This module deliberately holds NO composition: it neither constructs the
 * real adapter nor imports the deterministic fixture. Both providers import
 * it, which is what lets the fixture live behind a lazily-loaded, flag-gated
 * boundary while every consumer keeps one stable import (G-19).
 */

import { createContext, useContext, type ReactNode } from "react";
import type { PhysicalTestPort } from "@/lib/frontend/physical-test-port";

export type PortalRuntimeValue = {
  readonly port: PhysicalTestPort;
  /**
   * Bumped whenever the composed data source has been reset underneath the
   * surfaces, so effects can re-read. In participant mode nothing can reset a
   * governed database from the browser, so it stays at 0 forever.
   */
  readonly dataRevision: number;
  /**
   * NON-NULL ONLY in deterministic-fixture mode. The participant adapter
   * exposes no reset of any kind — there is no browser-reachable control that
   * could discard governed data.
   */
  readonly resetFixture: (() => void) | null;
};

export const PortalRuntimeContext = createContext<PortalRuntimeValue | null>(null);

export function PortalRuntimeProvider({
  value,
  children,
}: {
  readonly value: PortalRuntimeValue;
  readonly children: ReactNode;
}) {
  return <PortalRuntimeContext.Provider value={value}>{children}</PortalRuntimeContext.Provider>;
}

export function usePortalRuntime(): PortalRuntimeValue {
  const runtime = useContext(PortalRuntimeContext);
  if (!runtime) {
    throw new Error("The physical-test port must be used inside PhysicalTestRuntime.");
  }
  return runtime;
}

export function usePhysicalTestPort(): PhysicalTestPort {
  return usePortalRuntime().port;
}
