import type { ReactNode } from "react";
import { ManagementPortalShell } from "@/components/layout/portal-shell";
import { PhysicalTestRuntime } from "@/features/portal/physical-test-runtime";
import { requirePortalAccess } from "@/server/modules/identity-access/portal-guard";

/**
 * Management portal layout — carries the SECOND server-side authorization layer
 * (F16-B). `proxy.ts` at the repository root is the first. `requirePortalAccess`
 * re-resolves identity from live server state and redirects a non-management
 * caller, so a proxy matcher misconfiguration alone cannot expose this portal.
 * The check runs before any child renders and is not a client-side check.
 *
 * F16-C — this layout composes the REAL PARTICIPANT ADAPTER via
 * `PhysicalTestRuntime`, the single composition root (gate G-19). The
 * deterministic fixture is unreachable from here unless the BUILD set
 * `NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE=1`; no request input can select it.
 */
export default async function ManagementLayout({ children }: { readonly children: ReactNode }) {
  await requirePortalAccess("management");

  return (
    <PhysicalTestRuntime role="management">
      <ManagementPortalShell>{children}</ManagementPortalShell>
    </PhysicalTestRuntime>
  );
}
