import { ManagementAddTrainerScreen } from "@/features/management/management-add-trainer-screen";

/**
 * Screen `24` Management Add Trainer, at its CANONICAL route
 * `/management/trainers/add` (ratified inventory, screen `24`; Figma node
 * `544:292`).
 *
 * ⚠️ NO ROUTE TREATMENT. The pack records `Current implemented route: — (no
 * implemented route)`, so nothing is moved, redirected, aliased or replaced.
 *
 * ⛔ NOT A NAVIGATION ITEM. It is reached from screen `23`'s `Add Trainer`
 * control and from nowhere else — the frame draws six rail items and this is
 * not one of them.
 */
export default function ManagementAddTrainerPage() {
  return <ManagementAddTrainerScreen />;
}
