import { ManagementTrainersScreen } from "@/features/management/management-trainers-screen";

/**
 * Screen `23` Management Trainers, at its CANONICAL route `/management/trainers`
 * (ratified inventory, screen `23`; Figma node `544:9`).
 *
 * ⚠️ NO ROUTE TREATMENT. `/management/trainers` did not exist at HEAD — the pack
 * records `Current implemented route: — (no implemented route)` — so nothing is
 * moved, redirected, aliased or replaced, and no accepted screen's navigation
 * changes.
 */
export default function ManagementTrainersPage() {
  return <ManagementTrainersScreen />;
}
