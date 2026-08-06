import type { ReactNode } from "react";
import { PortalShell } from "@/components/layout/portal-shell";
import { TrainerFixtureRuntime } from "@/features/trainer/trainer-fixture-runtime";
import { requirePortalAccess } from "@/server/modules/identity-access/portal-guard";

/**
 * Trainer portal layout — carries the SECOND server-side authorization layer
 * (F16-B). `proxy.ts` at the repository root is the first. `requirePortalAccess`
 * re-resolves identity from live server state and redirects a non-trainer
 * caller, so a proxy matcher misconfiguration alone cannot expose this portal.
 * The check runs before any child renders and is not a client-side check.
 */
export default async function TrainerLayout({ children }: { readonly children: ReactNode }) {
  await requirePortalAccess("trainer");

  return (
    <TrainerFixtureRuntime>
      <PortalShell>{children}</PortalShell>
    </TrainerFixtureRuntime>
  );
}
