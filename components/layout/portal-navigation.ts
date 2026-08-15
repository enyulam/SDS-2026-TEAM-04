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
         * have no rail item of their own. Attributing `/trainer/sessions/*` to
         * Schedule is what gives those two deep routes exactly one active item
         * instead of zero.
         *
         * ⚠️ CORRECTED AT `P2-17`, 2026-08-16 (§12.11): this read *"screens
         * 02/04 are deferred, A-044"*. ▶ **Screen `02` is no longer deferred —
         * it ships in this phase and has its own item below.** Screen `04`
         * Trainer Students remains deferred, at `P2-20`.
         */
        owns: ["/trainer/sessions"],
        icon: "calendar",
      },
      {
        /*
         * `P2-17` — screen `02` Trainer My Classes.
         *
         * ⛔ NOT `exact`, DELIBERATELY, AND DECIDED BEFORE IT COULD BITE.
         * `C2C-002` has now hit three rail items in three phases — `Classes`
         * at `P2-2`, `Trainers` at `P2-11`, and `Students` was caught by
         * looking at `P2-9`. ▶ **Screen `03` Trainer Lesson Plan is a child of
         * this route** (`/trainer/my-classes/lesson-plan`, `P2-18`), so an
         * `exact` item here would give that child ZERO active items and a
         * blank sidebar the moment it ships. **A rail item is `exact` only
         * while it has no child route, and this one already knows it has one.**
         */
        href: "/trainer/my-classes",
        label: "My Classes",
        path: "/trainer/my-classes",
        /*
         * ⚠️ `document`, NOT the frame's open-book glyph, and NOT `calendar`.
         * The frame draws a book icon; `IconName` has no book, and adding one
         * is an ASSET needing an `A-013` disposition — the same treatment
         * `P2-10` recorded when the monitor glyph became `cap`.
         * ▶ `calendar` is deliberately avoided even though the MANAGEMENT
         * `Classes` item uses it: on this rail `calendar` already belongs to
         * Schedule, and reusing it would put the same glyph on two items.
         * Recorded as a visual divergence rather than resolved silently.
         */
        icon: "document",
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
    /*
     * `P2-7` / Operator ruling 2026-08-14 (option 2): `/management/dashboard` is the
     * canonical Management entry route and `/management` is preserved as a compatibility
     * redirect onto it. ⚠️ THE RAIL NAMES THE DESTINATION, NOT THE REDIRECT — exactly as
     * the Trainer rail does under `R-B1`. A rail item pointing at a route that redirects
     * away would make "Dashboard" NEVER be the current item, because the URL the browser
     * settles on is never the one the item declares.
     * ⛔ Only the TARGET moves. The label, icon and position are unchanged, so no accepted
     * screen's rail changes appearance and none of them IS `/management`.
     */
    home: "/management/dashboard",
    navigation: [
      {
        href: "/management/dashboard",
        label: "Dashboard",
        path: "/management/dashboard",
        exact: true,
        icon: "dashboard",
      },
      /*
       * P2-8 — screen `17` Management Students, at its canonical route.
       *
       * ⚠️ `exact: true` and NO `owns`. Student registration (`20`), parent
       * creation (`21`) and student edit (`22`) are screens in `P2-12`…`P2-14`
       * with no shipped route, and declaring ownership of a sub-tree that does
       * not exist yet would be a claim about routes this build does not ship —
       * the same reasoning `Classes` carried until `P2-2` satisfied it.
       *
       * ⛔ POSITIONED SECOND, as the frame's own sidebar draws it: Dashboard,
       * Students, Trainers, Classes, Schedule, Reports. Trainers is absent
       * because `23` has no route; its slot is not held open with a placeholder.
       */
      {
        href: "/management/students",
        label: "Students",
        path: "/management/students",
        /*
         * ⛔ `exact` DROPPED AT `P2-9`, when screen `18` shipped at
         * `/management/students/[studentId]`. ⚠️ **THE SAME `C2C-002` TRAP
         * `Trainers` HIT ONE PHASE AGO, CAUGHT BEFORE IT SHIPPED THIS TIME** —
         * under `exact: true` a child route resolves to **ZERO** active rail
         * items and the sidebar goes blank on a page that plainly belongs to
         * Students.
         *
         * ▶ `Classes` hit it at `P2-2` and `Trainers` at `P2-11`; this is the
         * third occurrence, and the only one found by LOOKING rather than by a
         * red assertion. **The pattern is: a rail item is `exact` only while it
         * has no child route, and shipping a child is the moment to check.**
         */
        icon: "user",
      },
      /*
       * P2-10 — screen `23` Management Trainers, at its canonical route.
       *
       * ✅ THE SLOT ABOVE SAID *"Trainers is absent because `23` has no route;
       * its slot is not held open with a placeholder."* ▶ **That reasoning did
       * not lapse — it was SATISFIED.** The route now exists, so the item
       * arrives with its screen, exactly as the rule said it would.
       *
       * ⚠️ `exact: true` and NO `owns`. Trainer creation (`24`) is `P2-11` and
       * ships no route yet, and there is no Edit-Trainer screen in the ratified
       * 36 at all — so claiming a sub-tree would be a claim about routes this
       * build does not have.
       *
       * ⛔ THIRD IN THE RAIL, as the frame's own sidebar draws it: Dashboard,
       * Students, Trainers, Classes, Schedule, Reports.
       */
      {
        href: "/management/trainers",
        label: "Trainers",
        path: "/management/trainers",
        /*
         * ⛔ `exact` WAS DROPPED AT `P2-11`, when screen `24` shipped at
         * `/management/trainers/add`. ⚠️ This is the `C2C-002` defect, and
         * `Classes` already hit it once at `P2-2`: under `exact: true` a child
         * route resolves to **ZERO** active rail items, so the sidebar goes
         * blank on a page that plainly belongs to Trainers.
         *
         * ▶ It was CAUGHT rather than reasoned about: `N-2` reported
         * *"0 current item(s) [none]; expected exactly 1"* the first time the
         * child route was asserted. **The rule that the item arrives WITH its
         * route is what makes that assertion exist at all.**
         */
        /*
         * ⚠️ A RECORDED VISUAL DIVERGENCE, NOT A CHOICE MADE QUIETLY. The frame
         * draws a MONITOR glyph for this item; the shared `Icon` set has no
         * `monitor`, and `cap` (the graduation cap already in the set) is the
         * nearest teaching-staff mark. ▶ Adding a new glyph is an ASSET, and
         * `A-013`/`A-022.2` require an Operator disposition before one is copied
         * in — so the existing set wins and the divergence is written down.
         */
        icon: "cap",
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
       *
       * ✅ SCHEDULE ARRIVED AT `P2-5`, exactly as that sentence anticipated,
       * and it is added below rather than by rewriting the sentence: the rule
       * did not lapse, it was SATISFIED. ~~⛔ Students (`17`) and Trainers
       * (`23`) still have no shipped route and still get no item.~~
       *
       * ✅ STUDENTS ARRIVED AT `P2-8` — same mechanism, recorded the same way.
       * Screen `17` now ships `/management/students`, so the item arrives WITH
       * its screen exactly as the rule required. ⛔ TRAINERS (`23`) STILL HAS NO
       * SHIPPED ROUTE AND STILL GETS NO ITEM; it arrives at `P2-10`.
       *
       * ⚠️ The struck sentence is preserved rather than deleted because it is
       * the RULE, not a status line: *"a rail item pointing at a 404 is worse
       * than an absent one"* is what still governs Trainers.
       */
      {
        href: "/management/classes",
        label: "Classes",
        path: "/management/classes",
        icon: "calendar",
      },
      /*
       * P2-5 — screen `25` Management Schedule, at its canonical route.
       *
       * ⚠️ `exact: true` AND NO `owns`. Nothing sits under `/management/schedule`
       * and nothing is planned to: the calendar is a PROJECTION whose chips
       * lead to a class, which belongs to Classes. Declaring ownership of a
       * sub-tree that does not exist would be a claim about routes this build
       * does not ship — the pin `P2-2` had to rewrite on the Classes item.
       */
      {
        href: "/management/schedule",
        label: "Schedule",
        path: "/management/schedule",
        exact: true,
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
