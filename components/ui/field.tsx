import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

/**
 * Shared form-field primitives (F1).
 *
 * The frozen references use one field treatment across login, search, observation notes and
 * wording editors: a soft filled control with no heavy border, a bold label above it, and a
 * pink focus ring. Validation copy is rendered as text and wired with `aria-describedby` —
 * never colour alone.
 *
 * These are presentation primitives. Client-side validation display here is a UX
 * convenience only; the server remains authoritative (ADR-3).
 */

export function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
  className = "",
}: {
  readonly id: string;
  readonly label: string;
  readonly hint?: string;
  readonly error?: string;
  readonly required?: boolean;
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-small font-bold text-ink-strong">
        {label}
        {required && (
          <span className="ml-1 text-brand-800" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-small text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-small font-semibold text-danger-on">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({
  className = "",
  invalid = false,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { readonly invalid?: boolean }) {
  return (
    <input
      {...props}
      aria-invalid={invalid || undefined}
      className={`form-field ${className}`}
    />
  );
}

export function TextArea({
  className = "",
  invalid = false,
  rows = 5,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { readonly invalid?: boolean }) {
  return (
    <textarea
      {...props}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={`form-field resize-y leading-6 ${className}`}
    />
  );
}

export function Select({
  className = "",
  invalid = false,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { readonly invalid?: boolean }) {
  /*
   * ⛔ THE CHEVRON GEOMETRY LIVES IN `.select-field`, NOT IN UTILITIES.
   * `bg-no-repeat`, `bg-[length:…]`, `bg-[right_…]` and `pr-10` were written
   * here first: they were emitted into `@layer utilities`, lost the cascade to
   * unlayered `.form-field`, and the chevron TILED a dozen times across the
   * control. Measured in a browser, then moved to `app/globals.css`, where an
   * unlayered modifier outranks the utility layer.
   */
  return (
    <select
      {...props}
      aria-invalid={invalid || undefined}
      className={`form-field select-field cursor-pointer appearance-none ${className}`}
      style={{
        // Inline chevron, so no icon CDN or remote asset is required.
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238a93a8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
    >
      {children}
    </select>
  );
}

/** Search control from the reference header strip. */
export function SearchInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={`relative ${className}`}>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.2-3.2" />
        </svg>
      </span>
      {/*
        ⛔ THE LEADING GUTTER LIVES IN `.search-field`, NOT IN `pl-10`. The
        utility was emitted and lost the cascade to unlayered `.form-field`,
        so text began at `14px` — exactly where the magnifier begins — and ran
        underneath it. The icon is a LEADING AFFORDANCE the frame draws;
        entered text must clear it.
      */}
      <input
        {...props}
        type={props.type ?? "search"}
        className="form-field search-field"
      />
    </div>
  );
}
