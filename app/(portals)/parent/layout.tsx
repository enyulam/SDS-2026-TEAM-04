import type { ReactNode } from "react";
import { ParentPortalShell } from "@/components/layout/portal-shell";
import { FixturePhysicalTestRuntime } from "@/features/trainer/trainer-fixture-runtime";

export default function ParentLayout({ children }: { readonly children: ReactNode }) {
  return (
    <FixturePhysicalTestRuntime role="parent">
      <ParentPortalShell>{children}</ParentPortalShell>
    </FixturePhysicalTestRuntime>
  );
}
