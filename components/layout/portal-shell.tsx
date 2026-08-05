"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import type { SessionUserDto } from "@/lib/frontend/contracts/physical-test";
import {
  useFixtureRuntime,
  usePhysicalTestPort,
} from "@/features/trainer/trainer-fixture-runtime";

const navigation = [
  { href: "/trainer", label: "Dashboard", exact: true },
  {
    href: "/trainer/reports?status=needs_edit",
    label: "Returned reports",
    exact: false,
  },
] as const;

export function PortalShell({ children }: { readonly children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const port = usePhysicalTestPort();
  const { resetFixture, fixtureRevision } = useFixtureRuntime();
  const [user, setUser] = useState<SessionUserDto | null>(null);

  useEffect(() => {
    let active = true;
    void port.getSessionUser().then((result) => {
      if (active && result.outcome === "success") setUser(result.data);
    });
    return () => {
      active = false;
    };
  }, [port, fixtureRevision]);

  function handleReset() {
    resetFixture();
    router.push("/trainer");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="hidden min-h-screen bg-navy-950 px-5 py-6 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <BrandMark />
        <nav aria-label="Trainer navigation" className="mt-10 space-y-2">
          {navigation.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname === "/trainer/reports";
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center rounded-xl px-3.5 py-2.5 text-sm font-bold transition ${
                  active
                    ? "bg-white text-navy-950"
                    : "text-blue-100 hover:bg-navy-800 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-blue-300/20 bg-navy-900 p-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-blue-200">
            Trainer workspace
          </p>
          <p className="mt-2 text-sm font-bold">{user?.displayName ?? "Loading…"}</p>
          <p className="mt-0.5 text-xs text-blue-200">
            {user?.centreDisplayName ?? "Synthetic centre"}
          </p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex min-h-16 items-center justify-between bg-navy-950 px-4 text-white lg:hidden">
          <BrandMark compact />
          <nav aria-label="Mobile Trainer navigation" className="flex gap-2 text-sm">
            <Link href="/trainer" className="rounded-lg px-2.5 py-2 font-bold hover:bg-navy-800">
              Home
            </Link>
            <Link
              href="/trainer/reports?status=needs_edit"
              className="rounded-lg px-2.5 py-2 font-bold hover:bg-navy-800"
            >
              Returns
            </Link>
          </nav>
        </header>

        <main id="main-content" className="mx-auto w-full max-w-[90rem] px-4 py-5 sm:px-6 sm:py-7 xl:px-10">
          <FeedbackBanner
            tone="fixture"
            title="Deterministic fixture mode — not the participant adapter"
            actions={
              <Button
                variant="secondary"
                size="small"
                onClick={handleReset}
                className="border-blue-300/30 bg-white/10 text-white hover:bg-white/20"
              >
                Reset fixture
              </Button>
            }
          >
            Simulated Trainer data and browser-session actions only. No authentication,
            Supabase write, server action, lifecycle audit, notification, or publication
            occurs in this mode.
          </FeedbackBanner>
          <div className="mt-6">{children}</div>
          <footer className="mt-10 border-t border-line py-5 text-xs text-ink-muted">
            Adapter: <strong>deterministic_fixture</strong> · Participant eligible:{" "}
            <strong>no</strong> · Persistence: <strong>browser session only</strong>
          </footer>
        </main>
      </div>
    </div>
  );
}
