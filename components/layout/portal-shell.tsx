"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Avatar } from "@/components/ui/avatar";
import { Icon, IconButtonSurface, type IconName } from "@/components/ui/icon";
import type {
  SessionRole,
  SessionUserDto,
} from "@/lib/frontend/contracts/physical-test";
import {
  useFixtureRuntime,
  usePhysicalTestPort,
} from "@/features/trainer/trainer-fixture-runtime";

type NavigationItem = {
  readonly href: string;
  readonly label: string;
  readonly path: string;
  readonly exact?: boolean;
  /** Presentation only — icons were added at F1 and change no destination. */
  readonly icon?: IconName;
};

const roleConfig: Readonly<
  Record<
    SessionRole,
    {
      readonly label: string;
      readonly home: string;
      readonly navigation: readonly NavigationItem[];
    }
  >
> = {
  trainer: {
    label: "Trainer",
    /**
     * F-04 / operator ruling R-B1: `/trainer/schedule` is the canonical Trainer entry
     * route and `/trainer` is preserved as a compatibility redirect onto it. The rail
     * therefore names Schedule — the destination it actually reaches — rather than a
     * "Dashboard" item that would redirect away from the dashboard. Screen `01` Trainer
     * Dashboard is a DEFERRED post-48-hour screen whose canonical route is
     * `/trainer/dashboard` (inventory §7.2); it gets its own checkpoint and its own item.
     */
    home: "/trainer/schedule",
    navigation: [
      {
        href: "/trainer/schedule",
        label: "Schedule",
        path: "/trainer/schedule",
        exact: true,
        icon: "calendar",
      },
      {
        href: "/trainer/reports?status=needs_edit",
        label: "Returned reports",
        path: "/trainer/reports",
        icon: "reports",
      },
    ],
  },
  management: {
    label: "Management",
    home: "/management",
    navigation: [
      {
        href: "/management",
        label: "Dashboard",
        path: "/management",
        exact: true,
        icon: "dashboard",
      },
      {
        href: "/management/reports?status=trainer_approved",
        label: "Pending review",
        path: "/management/reports",
        icon: "reports",
      },
      {
        href: "/management/reports?status=needs_edit",
        label: "Corrections",
        path: "/management/reports",
        icon: "document",
      },
    ],
  },
  parent: {
    label: "Parent",
    home: "/parent",
    navigation: [
      { href: "/parent", label: "Home", path: "/parent", exact: true, icon: "dashboard" },
      {
        href: "/parent/reports",
        label: "Reports",
        path: "/parent/reports",
        icon: "document",
      },
    ],
  },
};

export function PortalShell({ children }: { readonly children: ReactNode }) {
  return <RolePortalShell role="trainer">{children}</RolePortalShell>;
}

export function ManagementPortalShell({ children }: { readonly children: ReactNode }) {
  return <RolePortalShell role="management">{children}</RolePortalShell>;
}

export function ParentPortalShell({ children }: { readonly children: ReactNode }) {
  return <RolePortalShell role="parent">{children}</RolePortalShell>;
}

function RolePortalShell({
  children,
  role,
}: {
  readonly children: ReactNode;
  readonly role: SessionRole;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const port = usePhysicalTestPort();
  const { resetFixture, fixtureRevision } = useFixtureRuntime();
  const [user, setUser] = useState<SessionUserDto | null>(null);
  const config = roleConfig[role];

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
    router.push(config.home);
    router.refresh();
  }

  return (
    // 15.625rem is LAYOUT_TOKENS.sidebarWidth — the reference sidebar width at 1440px.
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[15.625rem_minmax(0,1fr)]">
      <aside className="hidden min-h-screen border-r border-line bg-surface px-4 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="px-1.5">
          <BrandMark portalLabel={`${config.label} Portal`} />
        </div>
        <nav aria-label={`${config.label} navigation`} className="mt-9 space-y-1.5">
          {config.navigation.map((item) => {
            const active = item.exact ? pathname === item.path : pathname === item.path;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-nav px-3.5 py-2.5 text-body font-semibold no-underline transition ${
                  active
                    ? "bg-brand-100 text-brand-800"
                    : "text-ink-muted hover:bg-surface-muted hover:text-ink-strong"
                }`}
              >
                {item.icon && <Icon name={item.icon} size={18} />}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-line pt-4">
          <p className="px-3.5 text-micro font-bold uppercase tracking-[0.14em] text-ink-subtle">
            {config.label} workspace
          </p>
          <p className="mt-2 px-3.5 text-body font-bold text-ink-strong">
            {user?.displayName ?? "Loading…"}
          </p>
          <p className="mt-0.5 px-3.5 text-small text-ink-muted">
            {user?.centreDisplayName ?? "Synthetic centre"}
          </p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex min-h-16 items-center justify-between border-b border-line bg-surface px-4 lg:hidden">
          <BrandMark compact />
          <nav
            aria-label={`Mobile ${config.label} navigation`}
            className="flex gap-1.5 text-small"
          >
            {config.navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-nav px-2.5 py-2 font-semibold text-ink-muted no-underline hover:bg-surface-muted hover:text-ink-strong"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <main
          id="main-content"
          className="mx-auto w-full max-w-content-max px-4 py-5 sm:px-6 sm:py-7 xl:px-7"
        >
          <div className="mb-5 hidden items-center justify-end gap-3 lg:flex">
            <IconButtonSurface>
              <Icon name="bell" size={18} />
            </IconButtonSurface>
            <span className="flex items-center gap-3">
              <Avatar displayName={user?.displayName ?? "B C"} size="medium" />
              <span className="leading-tight">
                <span className="block text-body font-bold text-ink-strong">
                  {user?.displayName ?? "Loading…"}
                </span>
                <span className="block text-small text-ink-muted">{config.label}</span>
              </span>
            </span>
          </div>

          <FeedbackBanner
            tone="fixture"
            title="Deterministic fixture mode — not the participant adapter"
            actions={
              <Button variant="onDark" size="small" onClick={handleReset}>
                Reset fixture
              </Button>
            }
          >
            Simulated {config.label} data and browser-session actions only. No real sign-in,
            server write, external notification, or publication occurs in this mode.
          </FeedbackBanner>
          <div className="mt-6">{children}</div>
          <footer className="mt-10 border-t border-line py-5 text-small text-ink-muted">
            Adapter: <strong>deterministic_fixture</strong> · Participant eligible:{" "}
            <strong>no</strong> · Persistence: <strong>browser session only</strong>
          </footer>
        </main>
      </div>
    </div>
  );
}
