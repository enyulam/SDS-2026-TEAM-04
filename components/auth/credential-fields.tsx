"use client";

import { useId, useState } from "react";

/**
 * Credential field presentation shared by the three frozen login references
 * (FRONTEND RECONSTRUCTION F2).
 *
 * ## Password handling
 *
 * The visibility control toggles the input's `type` attribute and nothing else. The field is
 * **uncontrolled** — no password value is ever read into React state, written to a fixture,
 * persisted, logged, echoed back or included in any captured evidence. There is no `value`
 * prop and no change handler by design, so there is no code path on which a password could
 * leave the input element.
 *
 * ## The credential fields are enabled (F16-A)
 *
 * Until F16 these two inputs defaulted to `disabled`, because real Supabase Auth sign-in
 * lived only on `feat/48h-backend` and an enabled form would have invited a real password
 * into a field that went nowhere. That is no longer true: `signInAction` performs the real
 * local Supabase Auth password sign-in, so the fields default to ENABLED and the form posts
 * to it. The `disabled` prop is retained — a caller that has no wired action can still pass
 * `disabled` explicitly — it simply no longer defaults to `true`.
 *
 * `required` follows the enabled state, so the browser's own constraint validation prompts
 * for an empty field without the server having to say which field was empty.
 *
 * The password remains uncontrolled: it goes input → FormData → `signInAction` and reaches
 * no other code path.
 */

export function EmailField({
  placeholder,
  disabled = false,
  describedBy,
}: {
  readonly placeholder: string;
  readonly disabled?: boolean;
  readonly describedBy?: string;
}) {
  const id = useId();
  return (
    <div className="mt-5">
      <label htmlFor={id} className="block text-small font-bold text-ink-strong">
        Email
      </label>
      <input
        id={id}
        name="email"
        type="email"
        autoComplete="username"
        placeholder={placeholder}
        disabled={disabled}
        required={!disabled}
        aria-describedby={describedBy}
        className="form-field mt-2 min-h-12"
      />
    </div>
  );
}

export function PasswordField({
  disabled = false,
  describedBy,
}: {
  readonly disabled?: boolean;
  readonly describedBy?: string;
}) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="mt-4">
      <label htmlFor={id} className="block text-small font-bold text-ink-strong">
        Password
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          name="password"
          // Toggling this attribute is the entire behaviour of the reveal control. The value
          // is never read, stored or transmitted by this component.
          type={revealed ? "text" : "password"}
          autoComplete="current-password"
          placeholder="••••••••••"
          disabled={disabled}
          required={!disabled}
          aria-describedby={describedBy}
          className="form-field min-h-12 pr-12"
        />
        <button
          type="button"
          onClick={() => setRevealed((current) => !current)}
          aria-pressed={revealed}
          aria-controls={id}
          className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-[0.5rem] text-ink-muted transition hover:text-ink-strong"
        >
          <span className="sr-only">
            {revealed ? "Hide password" : "Show password"}
          </span>
          <EyeGlyph revealed={revealed} />
        </button>
      </div>
    </div>
  );
}

/** Inline SVG — this project references no icon package, CDN or remote asset. */
function EyeGlyph({ revealed }: { readonly revealed: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.75" />
      {revealed && <path d="m4 20 16-16" />}
    </svg>
  );
}

/**
 * The "Remember me" / "Forgot password?" row from the frozen frames.
 *
 * BOTH affordances stay NON-INTERACTIVE at F16-A, deliberately, and both remain visible so
 * the reconstruction still matches the frozen frames:
 *
 * - **Remember me** is a `disabled` checkbox with no name, so it is never submitted and can
 *   never influence anything. Session lifetime is owned entirely by the approved
 *   `@supabase/ssr` cookie session; building a second, custom persistence mechanism beside it
 *   is not authorized and is not done. An enabled checkbox here would claim a behaviour that
 *   does not exist, which is exactly what A-045 forbids.
 * - **Forgot password?** is inert text, not a link, unless a caller passes an explicit
 *   `recoveryHref`. No password-recovery workflow is created by this checkpoint; recovery is
 *   a Supabase Auth flow that has not been authorized or delivered.
 *
 * Each carries a visible-on-hover `title` and a screen-reader-only note stating that it is
 * not available, so neither silently pretends to work. Rendering either one authorizes
 * nothing — screen presence is not authorization (A-045).
 */
export function CredentialOptionsRow({
  disabled = true,
  recoveryHref,
}: {
  readonly disabled?: boolean;
  readonly recoveryHref?: string;
}) {
  const id = useId();
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <span className="flex items-center gap-2">
        <input
          id={id}
          type="checkbox"
          disabled={disabled}
          // No `name`: this control contributes nothing to the submitted form.
          className="size-4 shrink-0 accent-[#d6357a]"
        />
        <label
          htmlFor={id}
          className="text-small text-ink"
          title={
            disabled
              ? "Session length is managed by the approved Supabase session. This option is not available."
              : undefined
          }
        >
          Remember me
          {disabled && <span className="sr-only"> — not available</span>}
        </label>
      </span>
      {recoveryHref ? (
        <a
          href={recoveryHref}
          className="text-small font-bold text-brand-800 no-underline hover:underline"
        >
          Forgot password?
        </a>
      ) : (
        <span
          className="text-small font-bold text-ink-subtle"
          title="Password recovery is not available here. Contact your school administrator."
        >
          Forgot password?
          <span className="sr-only"> — not available</span>
        </span>
      )}
    </div>
  );
}
