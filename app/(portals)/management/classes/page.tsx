import { ManagementClasses } from "@/features/management/management-classes";

/**
 * Screen `12` Management Classes, at its CANONICAL route
 * `/management/classes` (`12-management-classes/screen.md` §1).
 *
 * ⛔ No route is moved, renamed, redirected or aliased by this phase — one new
 * route at the ratified path, and nothing else.
 */
export default function ManagementClassesPage() {
  return <ManagementClasses />;
}
