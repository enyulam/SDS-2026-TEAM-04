"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback-banner";
import { Avatar } from "@/components/ui/avatar";
import { Icon, IconButtonSurface } from "@/components/ui/icon";
import type {
  SessionRole,
  SessionUserDto,
} from "@/lib/frontend/contracts/physical-test";
import {
  usePhysicalTestPort,
  usePortalRuntime,
} from "@/features/portal/portal-runtime-context";

import {
  isNavigationItemActive,
  roleConfig,
} from "@/components/layout/portal-navigation";
import { signOutFormAction } from "@/server/modules/identity-access/actions";

/**
 * C2C-023 — THE SIGN-OUT CONTROL, on ALL THREE authenticated portal shells.
 *
 * Before this checkpoint there was NO sign-out control anywhere in the
 * application. `signOutAction` had been fully written since F16-A and had
 * exactly two references in the whole repository: its own definition and one
 * documentation mention. It had no consumer. The frozen frame for screen 32
 * draws a Logout row in the Parent rail, and `implementation-notes.md` recorded
 * its absence as D4 attributed to A-044 deferral — reasoning that covers the
 * deferred Overview and Calendar destinations but NOT Logout, which depends on
 * nothing deferred.
 *
 * IT IS A REAL FORM POSTING A SERVER ACTION, not a link and not a client-side
 * state clear. That matters: the termination has to happen on the server, under
 * the caller's own request-scoped client, and the auth cookies have to be
 * cleared in a context Next.js honours cookie writes in. A `<Link href="/login">`
 * would navigate away while leaving the session fully alive — the proxy would
 * simply bounce the caller straight back into the portal.
 *
 * This shell is a client component; `signOutFormAction` is imported from a
 * `"use server"` module, which is exactly how a client component is permitted
 * to bind one.
 *
 * The role/centre authority model is untouched. This control ends a session; it
 * never grants, derives or names authority, and it carries no role, centre,
 * identifier or return path — there is nothing on it for a caller to influence.
 */
function SignOutControl({ variant }: { readonly variant: "rail" | "header" }) {
  return (
    <form
      action={signOutFormAction}
      /*
       * PHASE 0 — `mt-auto` moved onto the form itself. The frame ends the rail
       * with a flex spacer and then a single row, with no divider above it and
       * no block between it and the navigation.
       */
      className={variant === "rail" ? "mt-auto pt-6" : "shrink-0"}
    >
      <button
        type="submit"
        data-testid="sign-out"
        className={
          variant === "rail"
            ? "flex min-h-11 w-full items-center gap-3 rounded-nav px-3 py-2 text-[0.84375rem] font-medium text-neutral-on transition hover:bg-surface-muted hover:text-ink-strong"
            : "flex min-h-11 items-center gap-2 rounded-nav px-2.5 py-2 text-small font-semibold text-neutral-on hover:bg-surface-muted hover:text-ink-strong"
        }
      >
        {/*
          ⚠️ THE VISIBLE LABEL IS "Sign out" AND MUST STAY "Sign out", AND
          NOTHING MAY BE INSERTED BETWEEN THE GLYPH AND THE LABEL.

          The frame draws "Logout". That difference is recorded as unresolved
          TRUE-DRIFT rather than applied, because two ACCEPTED proofs pin this
          exact string as the way they locate the production control —
          `tests/frontend/sign-out-terminates-session.mjs` S-1, which requires
          `/>` whitespace `Sign out` `<` INSIDE the form, and
          `prove-disposable-app.mjs` G-22, which refuses unless the control it
          clicked reports "Sign out". Renaming the label to match a caption
          would silently retarget accepted evidence.

          This comment sat BELOW the glyph in its first form and broke S-1 on
          its own — the pinned pattern needs the label to follow the `/>`
          directly. The suite caught it, which is the suite working.
        */}
        <Icon name="logout" size={variant === "rail" ? 20 : 18} />
        Sign out
      </button>
    </form>
  );
}

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
  const { resetFixture, dataRevision } = usePortalRuntime();
  /*
   * G-19 — the fixture banner is keyed off the COMPOSED PORT'S OWN identity, not
   * off the environment flag and not off a prop. The participant adapter reports
   * `real_participant_adapter` and can never report `deterministic_fixture`, so
   * there is no build in which a simulated surface renders without the banner and
   * none in which a real surface renders with it.
   */
  const fixtureIdentity =
    port.identity.kind === "deterministic_fixture" ? port.identity : null;
  const [user, setUser] = useState<SessionUserDto | null>(null);
  /**
   * WHETHER THE IDENTITY READ HAS SETTLED — not whether it succeeded.
   *
   * This shell renders `user?.displayName ?? "Loading…"` in three places (the
   * rail footer, the desktop header and the avatar's initials), each filled by
   * a Server Action that resolves AFTER mount. Until it settles, the shell is
   * mid-render, and any capture of the document at that moment is a capture of
   * a transient state.
   *
   * That is not a cosmetic concern. The G-14 parent-isolation proof compares
   * WHOLE canonical-report documents byte for byte and requires every denial to
   * be indistinguishable. Its own wait watched only the report region, so the
   * two round-trips — this identity read and the page's report read — raced:
   * one denial could be captured with the identity resolved and another with
   * "Loading…" still in the rail, and the gate failed intermittently on a
   * difference that had nothing to do with parent isolation.
   *
   * The state is therefore published on the DOM as a settled/pending flag the
   * harness can wait on explicitly, with a rejecting deadline, instead of
   * sleeping and hoping. It carries no identity, no role and no centre — only
   * whether the read has come back — so it discloses nothing, and it is set on
   * BOTH outcomes: a failed identity read settles the shell just as a
   * successful one does, and must not hang a reader forever.
   */
  const [sessionSettled, setSessionSettled] = useState(false);
  const config = roleConfig[role];

  useEffect(() => {
    let active = true;
    void port.getSessionUser().then((result) => {
      if (!active) return;
      if (result.outcome === "success") setUser(result.data);
      setSessionSettled(true);
    });
    return () => {
      active = false;
    };
  }, [port, dataRevision]);

  function handleReset() {
    // Unreachable in participant mode: `resetFixture` is null unless the
    // deterministic fixture is the composed port.
    if (!resetFixture) return;
    resetFixture();
    router.push(config.home);
    router.refresh();
  }

  return (
    // 15.625rem is LAYOUT_TOKENS.sidebarWidth — the reference sidebar width at 1440px.
    <div
      data-session-user={sessionSettled ? "settled" : "pending"}
      className="min-h-screen bg-canvas lg:grid lg:grid-cols-[15.625rem_minmax(0,1fr)]"
    >
      {/*
        PHASE 0 — rail geometry measured off the `/reference/` exports, which
        agree across the Trainer, Management and Parent frames: 250px wide
        (already `LAYOUT_TOKENS.sidebarWidth`), 20px side padding, 28px top,
        24px bottom, and NO right border — the frame separates the white rail
        from the canvas by contrast alone.
      */}
      <aside className="hidden min-h-screen bg-surface px-5 pb-6 pt-7 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="px-2">
          {/*
            F-01c — the brand mark is the FIRST keyboard tab stop in this shell, and this
            shell renders on all three portals. Its destination and accessible name are
            therefore derived from `config`, never hardcoded: Trainer -> `/trainer/schedule`
            (the canonical route created at F-04), Management -> `/management`,
            Parent -> `/parent`. `BrandHome` is a required prop of the interactive variant,
            so there is no default for a caller to inherit another role's workspace from.
          */}
          <BrandMark
            portalLabel={`${config.label} Portal`}
            home={{ href: config.home, portal: config.label }}
          />
        </div>
        {/*
          F-01c — SC 1.4.3, measured in the rendered production DOM, not asserted from the
          token table. The inactive rail link rendered `text-ink-muted` (#8a93a8) on the
          white sidebar at 3.079:1 and the workspace eyebrow rendered `text-ink-subtle`
          (#a6aec0) at 2.225:1; both are normal-size text needing 4.5:1. Every failing node
          in this shell moves to `text-neutral-on` (#5f6880) — an EXISTING darker token
          already used across this codebase for quiet secondary text, and one of the `on`
          values F1 deepened specifically to clear 4.5:1. No token VALUE is redefined, so
          `ink-muted` and `ink-subtle` keep serving their other consumers (disabled controls,
          placeholders, muted avatars) untouched. The active link stays `text-brand-800` and
          the hover stays `text-ink-strong`; only the resting colour moves.
        */}
        {/*
          PHASE 0 — item metrics from the same exports: 44px row, 12px side
          padding, 12px radius, 12px gap, a 20px glyph and a 13.5px label. The
          frame also carries WEIGHT as a second, non-colour cue for the current
          item (500 resting, 600 active), which the build did not: it set 600 on
          every row and distinguished the active one by colour alone. Weight is
          now part of the active treatment, alongside `aria-current` and the
          tint (GLOBAL_UI_RULES §7 — never colour alone).

          The COLOURS deliberately do not match the frame and must not be
          "fixed" to it. The frame's resting label is #8A93A6 on white (3.09:1)
          and its active label is #EC4B96 on #FCE7F0 (2.97:1); both fail SC
          1.4.3 for normal-size text. The build keeps `text-neutral-on` and
          `text-brand-800`, and `tests/frontend/design-foundation.assertions.ts`
          holds the active pair at >= 4.5:1 as a standing token invariant.
        */}
        <nav aria-label={`${config.label} navigation`} className="mt-8 space-y-2">
          {config.navigation.map((item) => {
            const active = isNavigationItemActive(item, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-nav px-3 py-2 text-[0.84375rem] no-underline transition ${
                  active
                    ? "bg-brand-100 font-semibold text-brand-800"
                    : "font-medium text-neutral-on hover:bg-surface-muted hover:text-ink-strong"
                }`}
              >
                {item.icon && <Icon name={item.icon} size={20} />}
                {item.label}
              </Link>
            );
          })}
        </nav>
        {/*
          PHASE 0 — the rail footer's workspace eyebrow, account name and centre
          name are REMOVED. Every in-scope frame ends the rail with a spacer and
          a single row, and places the signed-in identity in the top-right of
          the content column instead — where this shell already renders it, so
          nothing is lost, only de-duplicated. No harness reads the removed
          block; `data-session-user` (the settled/pending flag the disposable
          proof waits on) is on the shell root and is untouched, and the
          "Trainer Portal" / "Management Portal" / "Parent Portal" strings that
          `prove-stage3-authenticated.mjs` pins as Tier-1 selectors come from the
          brand lockup above, not from here.
        */}
        <SignOutControl variant="rail" />
      </aside>

      <div className="min-w-0">
        <header className="flex min-h-16 items-center justify-between border-b border-line bg-surface px-4 lg:hidden">
          <BrandMark compact home={{ href: config.home, portal: config.label }} />
          <nav
            aria-label={`Mobile ${config.label} navigation`}
            className="flex gap-1.5 text-small"
          >
            {/*
              C2C-003 — the mobile header used to carry only a `className` and
              computed NO active state, so below the `lg` breakpoint the current
              location was not represented in navigation at all. It now shares
              `isNavigationItemActive` with the desktop rail, so exactly one item
              is current in BOTH navigations. The active treatment is not colour
              alone: `aria-current="page"` carries it programmatically and the
              background block carries it visually (GLOBAL_UI_RULES §7).
            */}
            {config.navigation.map((item) => {
              const active = isNavigationItemActive(item, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-nav px-2.5 py-2 font-semibold no-underline ${
                    active
                      ? "bg-brand-100 text-brand-800"
                      : "text-neutral-on hover:bg-surface-muted hover:text-ink-strong"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {/*
            C2C-023 — the sign-out control sits OUTSIDE the navigation landmark
            in both shells. It is not a destination and must not be counted as
            one: the `nav` landmark's job is to enumerate the portal's pages,
            and exactly one of those is the current page.
          */}
          <SignOutControl variant="header" />
        </header>

        {/*
          PHASE 0 — the content column's own padding and rhythm, from the same
          exports: 28px sides, 24px top and bottom, and an 18px gap between
          stacked blocks (previously 28px vertical padding and 20/24px gaps).
        */}
        <main
          id="main-content"
          className="mx-auto w-full max-w-content-max px-4 py-5 sm:px-7 sm:py-6"
        >
          <div className="mb-[1.125rem] hidden items-center justify-end gap-3 lg:flex">
            <IconButtonSurface>
              <Icon name="bell" size={18} />
            </IconButtonSurface>
            <span className="flex items-center gap-3">
              <Avatar displayName={user?.displayName ?? "B C"} size="medium" />
              <span className="leading-tight">
                <span className="block text-body font-bold text-ink-strong">
                  {user?.displayName ?? "Loading…"}
                </span>
                <span className="block text-small text-neutral-on">{config.label}</span>
              </span>
            </span>
          </div>

          {fixtureIdentity && (
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
          )}
          <div className="mt-[1.125rem]">{children}</div>
          {/*
            * ⚠️ INTERNAL PROVENANCE FOOTER — STAFF SURFACES ONLY.
            *
            * It names the composed adapter, participant eligibility and the
            * persistence mode. That is build/test provenance, not product
            * information, and a PARENT must never be shown it: the parent
            * surface is the one audience with no operational relationship to
            * this system, and internal adapter naming on it reads as a leak
            * even though it discloses no report data.
            *
            * The "local Supabase" wording is additionally STALE on a hosted
            * deployment — `persistence` is a hardcoded constant on the real
            * participant adapter meaning "a real Supabase database" rather
            * than "browser session only", written when only the local stack
            * existed. It is NOT re-derived from the environment, so it says
            * "local" wherever it renders.
            *
            * Suppressed for `parent` ONLY. Trainer and Management are
            * deliberately UNCHANGED — narrowing their provenance evidence is
            * an Operator decision, not a tidy-up.
            */}
          {/*
            * ⚠️ PROVENANCE MARKER — PRESENT BUT NOT VISIBLE (staff portals).
            *
            * The VISIBLE text is gone: it named the composed adapter and a
            * persistence mode reading "local Supabase", which is a hardcoded
            * adapter constant meaning "a real Supabase database" and is never
            * re-derived from the environment. On a projector that reads as a
            * defect even though the hosted app is demonstrably on the hosted
            * database.
            *
            * ⚠️ THE ELEMENT AND ITS `data-adapter-kind` ATTRIBUTE MUST STAY.
            * `prove-disposable-app` and `prove-governed-lifecycle` read that
            * attribute OUT OF THE SERVED DOM as the G-19 proof that a real
            * surface composed the real adapter, and both FAIL CLOSED when it
            * is missing. Deleting the node would silently destroy accepted
            * evidence to remove a caption. The adapter itself is UNTOUCHED —
            * this is a presentation change only.
            *
            * The PARENT surface renders no marker at all, deliberately: a
            * parent has no operational relationship to this system and its
            * payload should carry no adapter naming, visible or not.
            */}
          {role === "parent" ? null : (
            <footer hidden data-adapter-kind={port.identity.kind} />
          )}
        </main>
      </div>
    </div>
  );
}
