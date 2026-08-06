import type { ReactNode } from "react";
import type { StatusTone } from "@/lib/frontend/design/tokens";

/**
 * Shared badge / status chip (F1).
 *
 * The frozen references use one pill shape across every portal for lifecycle status,
 * attendance state, class-grade tags and focus tags. Tone is presentation only — this
 * component maps no lifecycle status, no rating and no permission to a tone. Callers
 * decide the tone, so no governed vocabulary is encoded here.
 */

const tones: Readonly<Record<StatusTone, string>> = {
  neutral: "bg-neutral-soft text-neutral-on",
  brand: "bg-brand-100 text-brand-800",
  info: "bg-info-soft text-info-on",
  success: "bg-success-soft text-success-on",
  warning: "bg-warning-soft text-warning-on",
  danger: "bg-danger-soft text-danger-on",
};

const sizes = {
  small: "min-h-6 px-2 py-0.5 text-micro",
  medium: "min-h-7 px-2.5 py-1 text-small",
} as const;

export function Badge({
  tone = "neutral",
  size = "medium",
  icon,
  className = "",
  children,
}: {
  readonly tone?: StatusTone;
  readonly size?: keyof typeof sizes;
  readonly icon?: ReactNode;
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold ${tones[tone]} ${sizes[size]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}

/**
 * Outlined tag used in the references for filter chips and lesson focus tags.
 * Presentation only.
 */
export function Tag({
  className = "",
  children,
}: {
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-small font-semibold text-ink ${className}`}
    >
      {children}
    </span>
  );
}
