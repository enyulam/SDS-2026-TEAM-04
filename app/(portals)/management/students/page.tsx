import { ManagementStudentsScreen } from "@/features/management/management-students-screen";

/**
 * Screen `17` Management Students, at its CANONICAL route `/management/students`
 * (ratified inventory, screen `17`; Figma node `510:9`).
 *
 * ⚠️ NO ROUTE TREATMENT. Unlike `P2-7`, this screen had no implemented route to
 * move — `/management/students` did not exist at HEAD — so nothing is
 * redirected, aliased or replaced, and no accepted screen's navigation moves.
 */
export default function ManagementStudentsPage() {
  return <ManagementStudentsScreen />;
}
