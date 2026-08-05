import type { ReactNode } from "react";

export default function AuthLayout({ children }: { readonly children: ReactNode }) {
  return (
    // The authentication frames are reconstructed at FRONTEND RECONSTRUCTION F2/F3. Until
    // then this layout keeps the provisional login presentation legible by supplying the
    // dark accent surface it was authored against, retinted to the brand hue (F1).
    <main className="relative min-h-screen overflow-hidden bg-accent-ink px-4 py-8 text-white sm:px-6 sm:py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 15% 15%, rgba(236,72,153,.24), transparent 32%), radial-gradient(circle at 88% 80%, rgba(47,189,189,.14), transparent 28%)",
        }}
      />
      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] max-w-6xl items-center justify-center">
        {children}
      </div>
    </main>
  );
}
