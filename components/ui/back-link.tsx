import Link from "next/link";
import { Icon } from "@/components/ui/icon";

/**
 * The product's ONE back control.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * ⚠️ EXTRACTED, NOT INVENTED — 2026-08-13, under an Operator ruling
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 * The trainer portal already solved this on `trainer-roster` ("Back to Schedule") and
 * `trainer-assessment` ("Back to Student Roster"). Their class strings were **byte-identical**,
 * measured before extraction, so both were re-pointed here with **provably zero visual change**.
 *
 * ⛔ Operator ruling: *"use the trainer portal's existing pattern rather than inventing a new
 * one — the product already solves this … a second treatment for the same act is the
 * divergence I keep ruling against."* ▶ Creating a shared component and leaving the originals
 * inline would have made FOUR definitions of one control, not one.
 *
 * ⚠️ ONE CALL SITE IS DELIBERATELY NOT RE-POINTED. `trainer-draft-generation.tsx` carries a
 * VARIANT (`rounded-field`, `text-body`, `font-bold`) rather than a copy. Re-pointing it would
 * CHANGE a Part 1 screen's appearance, which is a visual change on a surface outside this
 * authorization. **Recorded, not silently normalised** — it needs its own ruling.
 */
export function BackLink({
  href,
  label,
}: {
  readonly href: string;
  /** The destination, e.g. `Classes`. Rendered as "Back to <label>". */
  readonly label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[11px] bg-brand-100 px-4 py-2.5 text-[0.84375rem] font-semibold text-brand-800 no-underline transition hover:bg-brand-200"
    >
      <Icon name="chevronLeft" size={16} />
      Back to {label}
    </Link>
  );
}
