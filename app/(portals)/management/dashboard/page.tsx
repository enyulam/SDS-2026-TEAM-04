import { ManagementDashboardScreen } from "@/features/management/management-dashboard-screen";

/**
 * Screen `11` Management Dashboard, at its CANONICAL route
 * `/management/dashboard` (ratified inventory, screen `11`).
 *
 * ⚠️ The surface previously lived at `/management`, which is now a
 * COMPATIBILITY REDIRECT onto this route — the same treatment `R-B1` ratified
 * for `/trainer` -> `/trainer/schedule`, and built to that precedent rather
 * than to a new pattern.
 */
export default function ManagementDashboardPage() {
  return <ManagementDashboardScreen />;
}
