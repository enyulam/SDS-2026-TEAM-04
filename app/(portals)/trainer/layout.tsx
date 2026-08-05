import type { ReactNode } from "react";
import { PortalShell } from "@/components/layout/portal-shell";
import { TrainerFixtureRuntime } from "@/features/trainer/trainer-fixture-runtime";

export default function TrainerLayout({ children }: { readonly children: ReactNode }) {
  return (
    <TrainerFixtureRuntime>
      <PortalShell>{children}</PortalShell>
    </TrainerFixtureRuntime>
  );
}
