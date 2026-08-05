import Link from "next/link";
import { Icon } from "@/components/ui/icon";

/**
 * Shared brand mark (F1; `size` added at F2 for the authentication brand slot).
 *
 * The frozen portal references place a filled pink rounded tile holding a graduation-cap
 * glyph beside the product name, with the portal name as a quiet subtitle beneath it. The
 * three login references give the brand a larger, centred slot, which `size="large"` serves.
 *
 * **Recorded dependency.** The login frames carry the academy's own raster wordmark. That
 * asset has no `PORT` / `REFERENCE ONLY` / `REBUILD` / `REJECT` / `NOT APPLICABLE`
 * disposition, and `GLOBAL_UI_RULES.md` §8 forbids both copying an undispositioned asset and
 * re-drawing a logo ad hoc. The approved in-repo mark is therefore used in that slot until
 * the operator records a disposition.
 *
 * The link destination and accessible name are unchanged from the delivered implementation.
 */
export function BrandMark({
  compact = false,
  portalLabel,
  size = "default",
}: {
  readonly compact?: boolean;
  /** Quiet subtitle beneath the product name, e.g. "Trainer Portal". Presentation only. */
  readonly portalLabel?: string;
  readonly size?: "default" | "large";
}) {
  const large = size === "large";
  return (
    <Link
      href="/trainer"
      className={`inline-flex items-center no-underline ${large ? "gap-4" : "gap-3"} rounded-lg`}
      aria-label="B.E.S.T. Coach Trainer home"
    >
      <span
        aria-hidden="true"
        className={`grid place-items-center rounded-xl bg-brand-600 text-white shadow-raised ${
          large ? "size-14" : "size-10"
        }`}
      >
        <Icon name="cap" size={large ? 28 : 20} />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span
            className={`block font-extrabold tracking-tight text-ink-strong ${
              large ? "text-[1.75rem]" : "text-lg"
            }`}
          >
            B.E.S.T. Coach
          </span>
          <span
            className={`block font-semibold text-ink-muted ${
              large ? "text-body" : "text-micro"
            }`}
          >
            {portalLabel ?? "iSpeak Academy"}
          </span>
        </span>
      )}
    </Link>
  );
}
