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

  /*
   * PHASE 0 — the rail lockup is measured off `reference/Trainer - Schedule/`'s
   * export, which is the same lockup in all three portal frames: a 38 x 38 tile
   * at an 11px radius, a 10px gap, a 19px/700 wordmark and a 10.5px/500
   * subtitle. The previous values (40px tile, 12px radius, 12px gap, 18px/800
   * wordmark, 11px subtitle) were close but derived rather than read.
   *
   * `large` is UNCHANGED and deliberately so. It serves the authentication
   * brand slot, where the frame carries the academy's own 400 x 153 raster
   * wordmark — an asset with no recorded disposition. There is no measurable
   * spec for the in-repo stand-in to be reconciled against, so tuning its
   * proportions toward a frame it is not the asset for would be invention, not
   * reconciliation. See the recorded asset dependency below.
   */
  const content = (
    <>
      <span
        aria-hidden="true"
        className={`grid place-items-center bg-brand-600 text-white shadow-raised ${
          large ? "size-14 rounded-xl" : "size-[2.375rem] rounded-[0.6875rem]"
        }`}
      >
        <Icon name="cap" size={large ? 28 : 22} />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span
            className={`block tracking-tight text-ink-strong ${
              large ? "text-[1.75rem] font-extrabold" : "text-[1.1875rem] font-bold"
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
            className={`block text-neutral-on ${
              large ? "text-body font-semibold" : "text-[0.65625rem] font-medium"
            }`}
          >
            {portalLabel ?? "iSpeak Academy"}
          </span>
        </span>
      )}
    </>
  );

  const className = `inline-flex items-center no-underline ${
    large ? "gap-4" : "gap-2.5"
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
