import { ManagementCreateParentScreen } from "@/features/management/management-create-parent-screen";

/**
 * Screen `21` — Create Parent Account (`P2-13`), at its canonical route
 * `/management/students/create-parent-account` (inventory §7.2).
 *
 * ⚠️ A CHILD OF `/management/students`, whose rail item dropped `exact` at
 * `P2-9` — so this resolves to exactly one active item and no rail change is
 * needed. Verified, not assumed (`C2C-002`).
 */
export default function ManagementCreateParentPage() {
  return <ManagementCreateParentScreen />;
}
