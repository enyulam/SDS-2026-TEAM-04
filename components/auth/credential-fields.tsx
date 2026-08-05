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
 * ## Why the inputs are disabled
 *
 * Real Supabase Auth sign-in is delivered on `feat/48h-backend` and is **not** wired into
 * this frontend branch. Presenting an enabled credential form that authenticates nothing
 * would invite a real password into a field that goes nowhere. The delivered behaviour —
 * disabled inputs plus an explicit note — is therefore preserved, and the disabled state is
 * one the frozen frames' own state inventory calls for. Enabling these fields is
 * FRONTEND RECONSTRUCTION F16 (real adapter and route integration), not an authentication
 * checkpoint.
 */

export function EmailField({
  placeholder,
  disabled = true,
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
        aria-describedby={describedBy}
        className="form-field mt-2 min-h-12"
      />
    </div>
  );
}

export function PasswordField({
  disabled = true,
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
 * Both affordances are presentation at this checkpoint: neither persists a session, and the
 * recovery link is not wired, because a recovery flow is governed by Supabase Auth and is
 * not delivered on this branch. Rendering either one authorizes nothing — screen presence is
 * not authorization (A-045).
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
          className="size-4 shrink-0 accent-[#d6357a]"
        />
        <label htmlFor={id} className="text-small text-ink">
          Remember me
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
          title="Password recovery is delivered by Supabase Auth and is not wired on this branch."
        >
          Forgot password?
        </span>
      )}
    </div>
  );
}
