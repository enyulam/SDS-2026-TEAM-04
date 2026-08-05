/**
 * Shared avatar primitive (F1).
 *
 * Every frozen reference identifies a person with a tinted initials chip — circular in the
 * header identity strip and lists, rounded-square on roster cards. The tint is derived
 * deterministically from the supplied initials so the same person reads consistently
 * without any stored colour and without any personal datum beyond what is already shown.
 */

const palette = [
  "bg-brand-100 text-brand-800",
  "bg-info-soft text-info-on",
  "bg-warning-soft text-warning-on",
  "bg-success-soft text-success-on",
  "bg-neutral-soft text-neutral-on",
] as const;

const sizes = {
  small: "size-8 text-micro",
  medium: "size-10 text-small",
  large: "size-12 text-body",
} as const;

/** Deterministic, order-independent tint selection. Carries no meaning and no status. */
function tintFor(seed: string): string {
  let total = 0;
  for (let index = 0; index < seed.length; index += 1) {
    total += seed.charCodeAt(index);
  }
  return palette[total % palette.length];
}

export function initialsFrom(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function Avatar({
  displayName,
  size = "medium",
  shape = "circle",
  muted = false,
  className = "",
}: {
  readonly displayName: string;
  readonly size?: keyof typeof sizes;
  readonly shape?: "circle" | "square";
  /** Inert presentation for rows the current role cannot act on. */
  readonly muted?: boolean;
  readonly className?: string;
}) {
  const initials = initialsFrom(displayName);
  const tint = muted ? "bg-neutral-soft text-ink-subtle" : tintFor(initials);
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center font-bold ${
        shape === "circle" ? "rounded-full" : "rounded-xl"
      } ${sizes[size]} ${tint} ${className}`}
    >
      {initials}
    </span>
  );
}
