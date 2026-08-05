import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly variant?: "primary" | "secondary" | "ghost" | "danger";
  readonly size?: "small" | "medium" | "large";
};

const variants = {
  primary:
    "border-brand-600 bg-brand-600 text-white shadow-sm hover:border-brand-500 hover:bg-brand-500 disabled:border-slate-300 disabled:bg-slate-300 disabled:text-slate-500",
  secondary:
    "border-line bg-white text-navy-800 hover:border-brand-500 hover:bg-brand-100 disabled:border-line disabled:bg-slate-100 disabled:text-slate-400",
  ghost:
    "border-transparent bg-transparent text-ink-muted hover:bg-slate-100 hover:text-navy-900 disabled:text-slate-400",
  danger:
    "border-danger-700 bg-danger-700 text-white hover:bg-red-800 disabled:border-slate-300 disabled:bg-slate-300 disabled:text-slate-500",
} as const;

const sizes = {
  small: "min-h-9 px-3 py-1.5 text-sm",
  medium: "min-h-11 px-4 py-2.5 text-sm",
  large: "min-h-12 px-5 py-3 text-base",
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
      className={`inline-flex items-center justify-center gap-2 rounded-xl border font-bold transition disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
