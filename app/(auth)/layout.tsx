import type { ReactNode } from "react";

export default function AuthLayout({ children }: { readonly children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-navy-950 px-4 py-8 text-white sm:px-6 sm:py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 15% 15%, rgba(77,124,240,.28), transparent 32%), radial-gradient(circle at 88% 80%, rgba(42,188,178,.16), transparent 28%)",
        }}
      />
      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl items-center justify-center">
        {children}
      </div>
    </main>
  );
}
