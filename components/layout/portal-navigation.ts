/**
 * THE PORTAL NAVIGATION TABLE AND THE SINGLE ACTIVE-ITEM DERIVATION.
 *
 * Extracted out of `portal-shell.tsx` at Run C3-A Phase 2 (C2C-001 / C2C-002 /
 * C2C-003) for one reason: the rail is the SAME data and the SAME rule for all
 * three portals, and operator ruling R-C2-3 is an assertion ABOUT that rule
 * ("deep links … MUST render … with ONE active sidebar item"). Keeping it in a
 * plain `.ts` module means the production table and the production derivation
 * can be imported and exercised directly by a test, instead of being restated
 * — and therefore drifting — inside one.
 *
 * This module holds NO rendering and no React import. `portal-shell.tsx`
 * consumes it; nothing else does.
 */

import type { IconName } from "@/components/ui/icon";
import type { SessionRole } from "@/lib/frontend/contracts/physical-test";

export type NavigationItem = {
  readonly href: string;
  readonly label: string;
  readonly path: string;
  /**
   * C2C-002. `exact` is LOAD-BEARING. It used to be dead: both branches of the
   * active ternary in `portal-shell.tsx:192` were the identical expression
   * `pathname === item.path`, so the flag documented behaviour the code did not
   * have — which is exactly the condition that hid the defect. An `exact` item
   * matches its own path and nothing below it; a non-exact item also owns its
   * whole sub-tree.
   */
  readonly exact?: boolean;
  /**
   * C2C-002. Additional route prefixes this rail item is the parent of, for
   * sub-trees that do not sit UNDER the item's own path. `/trainer/sessions/*`
   * (roster, assess) is entered from Schedule and belongs to Schedule; the
   * parent canonical report at `/parent/students/*` is the Reports list's own
   * detail view. Prefix matching alone would still leave those three routes
   * with ZERO active items. Ownership is DECLARED per item, never inferred.
   */
  readonly owns?: readonly string[];
  /** Presentation only — icons were added at F1 and change no destination. */
  readonly icon?: IconName;
};

export type PortalNavigationConfig = {
  readonly label: string;
  readonly home: string;
  readonly navigation: readonly NavigationItem[];
};

/**
 * C2C-002 / C2C-003 — the SINGLE active-item derivation, shared by the desktop
 * rail and the `lg:hidden` mobile header so both emit exactly one
 * `aria-current="page"` (R-C2-3; GLOBAL_UI_RULES §7 / WCAG 2.2). The mobile
 * header previously computed no active state at all.
 */
export function isNavigationItemActive(item: NavigationItem, pathname: string): boolean {
  const ownsPath = (base: string) => pathname === base || pathname.startsWith(`${base}/`);
  const own = item.exact ? pathname === item.path : ownsPath(item.path);
  return own || (item.owns ?? []).some(ownsPath);
}

export const roleConfig: Readonly<Record<SessionRole, PortalNavigationConfig>> = {
  trainer: {
    label: "Trainer",
    /**
     * F-04 / operator ruling R-B1: `/trainer/schedule` is the canonical Trainer entry
     * route and `/trainer` is preserved as a compatibility redirect onto it. The rail
     * therefore names Schedule — the destination it actually reaches — rather than a
     * "Dashboard" item that would redirect away from the dashboard. Screen `01` Trainer
     * Dashboard is a DEFERRED post-48-hour screen whose canonical route is
     * `/trainer/dashboard` (inventory §7.2); it gets its own checkpoint and its own item.
     */
    home: "/trainer/schedule",
    navigation: [
      {
        href: "/trainer/schedule",
        label: "Schedule",
        path: "/trainer/schedule",
        exact: true,
        /*
         * The roster and the assessment surface are entered FROM the schedule and
         * have no rail item of their own (screens 02/04 are deferred, A-044).
         * Attributing `/trainer/sessions/*` to Schedule is what gives those two
         * deep routes exactly one active item instead of zero.
         */
        owns: ["/trainer/sessions"],
        icon: "calendar",
      },
      {
        href: "/trainer/reports?status=needs_edit",
        label: "Returned reports",
        path: "/trainer/reports",
        icon: "reports",
      },
    ],
  },
  management: {
    label: "Management",
    home: "/management",
    navigation: [
      {
        href: "/management",
        label: "Dashboard",
        path: "/management",
        exact: true,
        icon: "dashboard",
      },
      /*
       * C2C-001 / operator ruling R-C2-3. Management has EXACTLY ONE primary
       * Reports destination. The rail used to declare TWO — "Pending review" ->
       * `?status=trainer_approved` and "Corrections" -> `?status=needs_edit` —
       * which R-C2-3 prohibits outright, and which also made TWO items active
       * simultaneously because they shared one `path`.
       *
       * Pending, Corrections and Approved are INTERNAL page filters on the
       * centralized queue, reached through the in-page filter chip. The rail
       * href carries NO query string: the page's own default supplies
       * `trainer_approved`. The two `?status=` spellings remain WORKING DEEP
       * LINKS — they are ratified compatibility aliases
       * (`29-management-reports/screen.md:18`) — and no second route exists or
       * may be created for them.
       */
      /*
       * P2-1 — screen `12` Management Classes, at its canonical route.
       *
       * ⚠️ `exact` DROPPED AT `P2-2`, AND THE PIN WAS REWRITTEN RATHER THAN
       * DELETED. It read: *"`exact: true` and NO `owns`. The class OVERVIEW
       * (screen `13`) and class CREATION (screen `26`) are separate screens in
       * later phases, and declaring ownership of a sub-tree that does not exist
       * yet would be a claim about routes this build does not ship."*
       *
       * ▶ THAT REASONING DID NOT LAPSE — IT WAS SATISFIED. `26` shipped at
       * `/management/classes/add-class`, so the sub-tree now exists and
       * ownership is a measured fact rather than a forward claim. Screen `13`
       * (`P2-4`) will land under the same base and is covered by the same
       * non-exact match.
       *
       * ⛔ Without this the Add Class route would render with ZERO active rail
       * items — the exact defect `C2C-002` caught, in the same file.
       *
       * ⛔ The frame's rail also draws Students, Trainers and Schedule. Those
       * are screens `17`, `23` and `25` — later phases with no shipped route,
       * and a rail item pointing at a 404 is worse than an absent one. They
       * arrive with their screens.
       */
      {
        href: "/management/classes",
        label: "Classes",
        path: "/management/classes",
        icon: "calendar",
      },
      {
        href: "/management/reports",
        label: "Reports",
        path: "/management/reports",
        icon: "reports",
      },
    ],
  },
  parent: {
    label: "Parent",
    home: "/parent",
    navigation: [
      { href: "/parent", label: "Home", path: "/parent", exact: true, icon: "dashboard" },
      {
        href: "/parent/reports",
        label: "Reports",
        path: "/parent/reports",
        /*
         * The canonical class report a parent opens from the list lives at
         * `/parent/students/[studentId]/sessions/[sessionId]/report`, outside
         * `/parent/reports`. It is the Reports list's detail view, so Reports
         * owns it; without this the detail route had zero active items.
         */
        owns: ["/parent/students"],
        icon: "document",
      },
    ],
  },
};
