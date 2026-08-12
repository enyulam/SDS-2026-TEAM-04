import { ManagementAddClass } from "@/features/management/management-add-class";

/**
 * Screen `26` Management Add Class, at its CANONICAL route
 * `/management/classes/add-class` (`26-management-add-class/screen.md` §1).
 *
 * ⛔ No route is moved, renamed, redirected or aliased by this phase — one new
 * route at the ratified path, and nothing else. ⚠️ The path is taken from the
 * ratified inventory, NOT invented from the frame's `Classes / Add Class`
 * breadcrumb.
 */
export default function ManagementAddClassPage() {
  return <ManagementAddClass />;
}
