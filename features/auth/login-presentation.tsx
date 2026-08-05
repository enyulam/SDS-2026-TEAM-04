"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BrandMark } from "@/components/brand/brand-mark";
import {
  AuthFooterNote,
  AuthHeading,
  AuthShell,
} from "@/components/auth/auth-shell";
import {
  AUTH_ROLES,
  RoleSegmentedControl,
} from "@/components/auth/role-segmented-control";
import {
  CredentialOptionsRow,
  EmailField,
  PasswordField,
} from "@/components/auth/credential-fields";
import type { SessionRole } from "@/lib/frontend/contracts/physical-test";

/**
 * Login presentation for the three frozen references — AUTH-01 `546:370`, AUTH-02 `459:13`
 * and AUTH-03 `546:413` — reconstructed at FRONTEND RECONSTRUCTION F2 and validated per role
 * at F3, F10 and F13.
 *
 * ## The role query selects presentation only (A-046)
 *
 * `?role=trainer|management|parent` changes which segment reads as selected, the placeholder
 * shown, and which fixture workspace the action opens. It grants **no** role, **no** session
 * and **no** permission. Authority is server-derived from a real Supabase Auth identity and
 * live membership, on every request. An unrecognised or absent value falls back to the
 * Trainer presentation and likewise grants nothing.
 *
 * ## Non-disclosure
 *
 * Nothing here reveals whether an account exists, which accounts exist, which children are
 * linked to a Parent, or any report, roster or lifecycle datum. No error state distinguishes
 * "unknown account" from "wrong password" — that distinction is never surfaced.
 */

const fixtureHomes: Readonly<Record<SessionRole, string>> = {
  trainer: "/trainer",
  management: "/management",
  parent: "/parent",
};

/** Placeholders are synthetic and `.invalid` by construction (RFC 2606). */
const emailPlaceholders: Readonly<Record<SessionRole, string>> = {
  trainer: "trainer@fixture.invalid",
  management: "management@fixture.invalid",
  parent: "parent@fixture.invalid",
};

function presentationRole(value: string | null): SessionRole {
  return AUTH_ROLES.some((role) => role.value === value)
    ? (value as SessionRole)
    : "trainer";
}

export function LoginPresentation() {
  const searchParams = useSearchParams();
  const activeRole = presentationRole(searchParams.get("role"));
  const active =
    AUTH_ROLES.find((role) => role.value === activeRole) ?? AUTH_ROLES[0];

  return (
    <AuthShell>
      <div className="flex justify-center">
        {/*
          The frozen frames carry the academy's own raster wordmark. That asset has no
          recorded PORT / REFERENCE ONLY / REBUILD / REJECT disposition, and
          GLOBAL_UI_RULES.md §8 forbids both copying an undispositioned asset and re-drawing
          a logo ad hoc. The approved in-repo mark is therefore used in the frame's brand
          slot, and the missing asset is recorded as a dependency.
        */}
        <BrandMark portalLabel="iSpeak Academy" size="large" />
      </div>

      <section aria-labelledby="login-heading" className="mt-10">
        <p id="signin-as-label" className="text-small font-bold text-ink-strong">
          Sign in as
        </p>
        <RoleSegmentedControl activeRole={activeRole} labelId="signin-as-label" />

        <AuthHeading
          id="login-heading"
          title="Sign in"
          description="Welcome back — enter your credentials to continue."
        />

        <EmailField
          placeholder={emailPlaceholders[activeRole]}
          describedBy="auth-disabled-note"
        />
        <PasswordField describedBy="auth-disabled-note" />
        <CredentialOptionsRow />

        <p
          id="auth-disabled-note"
          className="mt-4 rounded-field bg-surface-muted px-3.5 py-2.5 text-small leading-5 text-ink-muted"
        >
          <strong className="block font-bold text-ink-strong">
            Frontend Round F2 fixture
          </strong>
          Credential entry is disabled because real authentication is deliberately not
          implemented in this frontend fixture. This presentation performs no sign-in and
          grants no authority. Selecting a role changes presentation only. It never
          authenticates or authorizes.
        </p>

        <Link
          href={fixtureHomes[activeRole]}
          data-fixture-entry={activeRole}
          className="mt-4 flex min-h-13 w-full items-center justify-center rounded-field bg-brand-700 px-5 py-3.5 text-body font-bold text-white no-underline shadow-raised transition hover:bg-brand-800"
        >
          Open {active.label} fixture workspace
        </Link>

        <AuthFooterNote>
          Need access? Contact your school administrator.
        </AuthFooterNote>
      </section>
    </AuthShell>
  );
}
