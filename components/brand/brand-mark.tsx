import Link from "next/link";
import { Icon } from "@/components/ui/icon";

/**
 * Shared brand mark (F1).
 *
 * The frozen references place a filled pink rounded tile holding a graduation-cap glyph
 * beside the product name, with the portal name as a quiet subtitle beneath it.
 *
 * The link destination and accessible name are unchanged from the delivered
 * implementation. F1 restyles the mark only — it must not alter a navigation destination.
 */
export function BrandMark({
  compact = false,
  portalLabel,
}: {
  readonly compact?: boolean;
  /** Quiet subtitle beneath the product name, e.g. "Trainer Portal". Presentation only. */
  readonly portalLabel?: string;
}) {
  return (
    <Link
      href="/trainer"
      className="inline-flex items-center gap-3 rounded-lg no-underline"
      aria-label="B.E.S.T. Coach Trainer home"
    >
      <span
        aria-hidden="true"
        className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white shadow-raised"
      >
        <Icon name="cap" size={20} />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-lg font-extrabold tracking-tight text-ink-strong">
            B.E.S.T. Coach
          </span>
          <span className="block text-micro font-semibold text-ink-muted">
            {portalLabel ?? "iSpeak Academy"}
          </span>
        </span>
      )}
    </Link>
  );
}
