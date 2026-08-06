import type { ButtonHTMLAttributes } from "react";

/**
 * Shared button primitive (F1).
 *
 * The frozen references use one filled pink primary action across all three portals, a
 * white bordered secondary, a soft pink tertiary for back/inline affordances, and reserve a
 * red treatment for destructive actions only.
 *
 * Disabled state is a real `disabled` attribute with a visibly inert treatment — the
 * references show gated primary actions rendered visually disabled. That remains a UX
 * convenience only; the server independently re-verifies every governed gate (ADR-3).
 */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly variant?: "primary" | "secondary" | "soft" | "ghost" | "danger" | "onDark";
  readonly size?: "small" | "medium" | "large";
};

const variants = {
  primary:
    "border-transparent bg-brand-700 text-white shadow-raised hover:bg-brand-800 active:bg-brand-800 disabled:bg-neutral-soft disabled:text-ink-subtle disabled:shadow-none",
  secondary:
    "border-line bg-surface text-ink-strong shadow-raised hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 disabled:bg-surface-muted disabled:text-ink-subtle disabled:shadow-none",
  soft: "border-transparent bg-brand-100 text-brand-800 hover:bg-brand-200 disabled:bg-neutral-soft disabled:text-ink-subtle",
  ghost:
    "border-transparent bg-transparent text-ink-muted hover:bg-surface-muted hover:text-ink-strong disabled:text-ink-subtle",
  danger:
    "border-transparent bg-danger-on text-white hover:bg-[#8f2618] disabled:bg-neutral-soft disabled:text-ink-subtle",
  /** For use inside the dark accent panel only. */
  onDark:
    "border-white/25 bg-transparent text-white hover:bg-white/10 disabled:border-white/10 disabled:text-white/40",
} as const;

const sizes = {
  small: "min-h-9 px-3 py-1.5 text-small",
  medium: "min-h-11 px-4 py-2.5 text-body",
  large: "min-h-12 px-5 py-3 text-body",
} as const;

export function Button({
  className = "",
  variant = "primary",
  size = "medium",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-field border font-bold transition disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
