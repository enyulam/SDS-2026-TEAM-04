import type { ReactNode } from "react";
import { ManagementPortalShell } from "@/components/layout/portal-shell";
import { FixturePhysicalTestRuntime } from "@/features/trainer/trainer-fixture-runtime";

export default function ManagementLayout({ children }: { readonly children: ReactNode }) {
  return (
    <FixturePhysicalTestRuntime role="management">
      <ManagementPortalShell>{children}</ManagementPortalShell>
    </FixturePhysicalTestRuntime>
  );
}
