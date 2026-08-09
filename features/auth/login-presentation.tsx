"use client";

import { useActionState } from "react";
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
import {
  signInFormAction,
  type SignInFormState,
} from "@/server/modules/identity-access/actions";
import type { SessionRole } from "@/lib/frontend/contracts/physical-test";

/**
 * Login presentation for the three frozen references — AUTH-01 `546:370`, AUTH-02 `459:13`
 * and AUTH-03 `546:413` — reconstructed at FRONTEND RECONSTRUCTION F2, validated per role at
 * F3, F10 and F13, and wired to real Supabase Auth sign-in at F16-A.
 *
 * ## The role query selects presentation only (A-046)
 *
 * `?role=trainer|management|parent` changes which segment reads as selected and which
 * placeholder is shown. That is the whole of its effect. It grants **no** role, **no**
 * session and **no** permission, and — since F16-A — it does not choose a destination
 * either: the post-sign-in redirect is issued by the server from the role it derived from
 * the caller's own live membership row. The query parameter is not a parameter of
 * `signInFormAction` and cannot reach it. An unrecognised or absent value falls back to the
 * Trainer presentation and likewise grants nothing.
 *
 * ## Password handling
 *
 * The password field is uncontrolled. Its value travels input → `FormData` → the
 * `signInFormAction` server action → `signInAction` → Supabase Auth, and nowhere else. It is
 * never held in React state, never placed in a URL, never logged and never present in
 * anything the action returns.
 *
 * ## Non-disclosure
 *
 * Every failed sign-in renders ONE message from ONE branch, so the DOM is byte-identical
 * whether the email is unknown, the password is wrong, the account is deactivated, or the
 * membership is missing or ambiguous. The action returns a two-valued status precisely so no
 * finer distinction exists to render. Nothing here reveals whether an account exists, which
 * accounts exist, which children are linked to a Parent, or any report, roster or lifecycle
 * datum.
 */

/** Placeholders are synthetic and `.invalid` by construction (RFC 2606). */
const emailPlaceholders: Readonly<Record<SessionRole, string>> = {
  trainer: "trainer@fixture.invalid",
  management: "management@fixture.invalid",
  parent: "parent@fixture.invalid",
};

const INITIAL_STATE: SignInFormState = { status: "idle" };

/**
 * The single failure message. There is exactly one, by design: it must not be possible to
 * tell the four failure causes apart from the rendered output.
 */
const SIGN_IN_FAILURE_MESSAGE =
  "We could not sign you in. Check your email and password and try again, or contact your school administrator.";

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

  const [state, formAction, pending] = useActionState(
    signInFormAction,
    INITIAL_STATE,
  );

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
        <BrandMark portalLabel="iSpeak Academy" size="large" interactive={false} />
      </div>

      {/*
        The three role variants share one heading ("Sign in"), so assistive technology would
        otherwise announce all three identically. The region carries a role-specific
        accessible name instead, which distinguishes them without altering visible copy and
        without implying the role has been granted — it names a presentation, not an
        authority. Added at F3 and reused verbatim by F10, F13 and F16-A.
      */}
      <section
        aria-labelledby="login-heading"
        aria-label={`Sign in — ${active.label} portal presentation`}
        data-role-presentation={activeRole}
        /*
         * PHASE 1 — the export sets a 25px gap between the brand slot and the
         * form column; the build carried 40px.
         */
        className="mt-[1.5625rem]"
      >
        <p id="signin-as-label" className="text-[0.78125rem] font-semibold text-ink-strong">
          Sign in as
        </p>
        <RoleSegmentedControl activeRole={activeRole} labelId="signin-as-label" />

        <AuthHeading
          id="login-heading"
          title="Sign in"
          description="Welcome back — enter your credentials to continue."
        />

        {/*
          A real form bound to a real server action. There is no hidden role input and no
          destination in this markup: the server decides where a successful sign-in lands.
        */}
        <form action={formAction} data-auth-form="sign-in">
          <EmailField
            placeholder={emailPlaceholders[activeRole]}
            describedBy="auth-governance-note"
          />
          <PasswordField describedBy="auth-governance-note" />
          <CredentialOptionsRow />

          {/*
            NOT IN THE FRAME, AND IT STAYS. The governance note is a required
            addition (A-046): the frame draws a role selector with no statement
            of what selecting a role does, and a login screen must not imply
            that choosing a role grants it. Its colour is `neutral-on` for the
            SC 1.4.3 reason recorded on `AuthHeading`.
          */}
          <p
            id="auth-governance-note"
            className="mt-[1.125rem] rounded-[0.6875rem] bg-surface-muted px-3.5 py-2.5 text-[0.8125rem] leading-5 text-neutral-on"
          >
            <strong className="block font-bold text-ink-strong">
              Role selection is presentation only
            </strong>
            Signing in uses your own credentials and grants no authority by itself. Your
            access is derived on the server from your identity and your live membership, on
            every request. Selecting a role changes presentation only. It never authenticates
            or authorizes.
          </p>

          {state.status === "error" && (
            <p
              role="alert"
              data-auth-error="true"
              className="mt-[1.125rem] rounded-[0.6875rem] bg-danger-soft px-3.5 py-2.5 text-[0.8125rem] leading-5 text-danger-on"
            >
              {SIGN_IN_FAILURE_MESSAGE}
            </p>
          )}

          {/*
            PHASE 1 — the frame's action is 15px vertical padding, an 11px
            radius and a 14.5px/600 label; the build had 14px/20px padding, a
            10px radius and 14px/700.

            THE FILL IS NOT THE FRAME'S AND MUST NOT BE CHANGED TO IT. The
            frame paints `#EC4B96`, on which a white label measures 3.492:1 —
            below SC 1.4.3. `brand-700` measures 4.517:1, and
            `design-foundation.assertions.ts` holds "white label on the primary
            action fill >= 4.5:1" as a standing invariant.
          */}
          <button
            type="submit"
            data-auth-submit="sign-in"
            disabled={pending}
            className="mt-[1.125rem] flex min-h-13 w-full items-center justify-center rounded-[0.6875rem] bg-brand-700 px-5 py-[0.9375rem] text-[0.90625rem] font-semibold text-white shadow-raised transition hover:bg-brand-800 disabled:opacity-70"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <AuthFooterNote>
          Need access? Contact your school administrator.
        </AuthFooterNote>
      </section>
    </AuthShell>
  );
}
