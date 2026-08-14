import { ManagementStudentProfileScreen } from "@/features/management/management-student-profile-screen";

/**
 * Screen `18` Management Student Profile, at its CANONICAL route
 * `/management/students/[studentId]` (ratified inventory, screen `18`; Figma
 * node `649:9`).
 *
 * ⚠️ NO ROUTE TREATMENT. The pack records `Current implemented route: — (no
 * implemented route)`, so nothing is moved, redirected, aliased or replaced.
 *
 * ⛔ SHIPPING THIS CHILD ROUTE IS WHY THE `Students` RAIL ITEM DROPPED `exact`
 * IN THE SAME PASS. Under `exact: true` a child resolves to ZERO active rail
 * items and the sidebar goes blank — `C2C-002`, which `Classes` hit at `P2-2`
 * and `Trainers` at `P2-11`. **Caught by looking this time, not by a red leg.**
 */
export default async function ManagementStudentProfilePage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  return <ManagementStudentProfileScreen studentId={studentId} />;
}
