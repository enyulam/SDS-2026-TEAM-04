import type { ReactNode } from "react";
import { AuthBackdrop } from "@/components/auth/auth-shell";

/**
 * Authentication route-group layout (FRONTEND RECONSTRUCTION F2).
 *
 * The provisional dark authentication presentation identified at F1 is retired here. The
 * three frozen login references all render on a plain white page carrying four pale
 * decorative discs — not on the portal canvas grey and not on a dark surface.
 */
export default function AuthLayout({ children }: { readonly children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-surface px-4 py-8 text-ink sm:px-6">
      <AuthBackdrop />
      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center">
        {children}
      </div>
    </main>
  );
}
