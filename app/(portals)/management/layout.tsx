import type { ReactNode } from "react";
import { ManagementPortalShell } from "@/components/layout/portal-shell";
import { FixturePhysicalTestRuntime } from "@/features/trainer/trainer-fixture-runtime";
import { requirePortalAccess } from "@/server/modules/identity-access/portal-guard";

/**
 * Management portal layout — carries the SECOND server-side authorization layer
 * (F16-B). `proxy.ts` at the repository root is the first. `requirePortalAccess`
 * re-resolves identity from live server state and redirects a non-management
 * caller, so a proxy matcher misconfiguration alone cannot expose this portal.
 * The check runs before any child renders and is not a client-side check.
 */
export default async function ManagementLayout({ children }: { readonly children: ReactNode }) {
  await requirePortalAccess("management");

  return (
    <FixturePhysicalTestRuntime role="management">
      <ManagementPortalShell>{children}</ManagementPortalShell>
    </FixturePhysicalTestRuntime>
  );
}
