import Link from "next/link";
import { Icon } from "@/components/ui/icon";

/**
 * The portal a linked brand mark returns to. Supplied by the shell that renders the mark,
 * never assumed by the mark itself — see `BrandMarkProps` below.
 */
export type BrandHome = {
  /** Canonical home route of the portal the mark is rendered in. */
  readonly href: string;
  /** Portal name used to build the accessible name, e.g. "Management". */
  readonly portal: string;
};

/**
 * `home` is REQUIRED whenever the mark is interactive and PROHIBITED when it is not.
 *
 * This shape is deliberate. Before F-01c the destination and accessible name were a
 * hardcoded `/trainer` + "B.E.S.T. Coach Trainer home" inside this component, and the same
 * component renders in the Trainer, Management and Parent shells — so on `/parent/reports`
 * and `/management/reports` the FIRST keyboard tab stop announced itself as "Trainer home"
 * and navigated a Parent or Management user into the Trainer portal. It granted no
 * authority (no auth exists yet) but it was a real navigation and assistive-technology
 * defect, and it would become authorization-adjacent the moment F-16 wires real guards.
 * Making `home` a required prop of the interactive variant means a caller cannot silently
 * inherit another role's destination: there is no default to fall back to.
 */
type BrandMarkProps = {
  readonly compact?: boolean;
  /** Quiet subtitle beneath the product name, e.g. "Trainer Portal". Presentation only. */
  readonly portalLabel?: string;
  readonly size?: "default" | "large";
} & (
  | {
      /** Interactive: the mark is a link into the portal it is rendered in. */
      readonly interactive?: true;
      readonly home: BrandHome;
    }
  | {
      /**
       * Non-interactive: the mark renders as plain content rather than a link.
       *
       * Pre-authentication screens use this, set at F3 and PRESERVED here: a
       * pre-authentication screen must offer no route into any workspace, so no `home` is
       * accepted in this variant at all.
       */
      readonly interactive: false;
      readonly home?: undefined;
    }
);

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
 */
export function BrandMark(props: BrandMarkProps) {
  const { compact = false, portalLabel, size = "default" } = props;
  const large = size === "large";

  const content = (
    <>
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
          {/*
            F-01c — SC 1.4.3. `text-ink-muted` (#8a93a8) measured 3.079:1 against the white
            sidebar and login surfaces in the rendered production DOM, below the 4.5:1 the
            micro/body sizes here require. Moved to `text-neutral-on` (#5f6880), the darker
            token this codebase already uses for quiet secondary text (table headers,
            captions, breadcrumbs). No token VALUE is redefined.
          */}
          <span
            className={`block font-semibold text-neutral-on ${
              large ? "text-body" : "text-micro"
            }`}
          >
            {portalLabel ?? "iSpeak Academy"}
          </span>
        </span>
      )}
    </>
  );

  const className = `inline-flex items-center no-underline ${
    large ? "gap-4" : "gap-3"
  } rounded-lg`;

  if (props.interactive === false) {
    return (
      <span className={className} role="img" aria-label="B.E.S.T. Coach">
        {content}
      </span>
    );
  }

  // Destination and accessible name both derive from the portal the mark is rendered in.
  return (
    <Link
      href={props.home.href}
      className={className}
      aria-label={`B.E.S.T. Coach ${props.home.portal} home`}
    >
      {content}
    </Link>
  );
}
