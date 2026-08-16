import { TrainerDashboardScreen } from "@/features/trainer/trainer-dashboard-screen";

/**
 * Screen `01` — Trainer Dashboard (`P2-19`), at its canonical route
 * `/trainer/dashboard` (inventory §7.2).
 *
 * ⚠️ `/trainer` REMAINS THE `R-B1` COMPATIBILITY REDIRECT ONTO
 * `/trainer/schedule` and is NOT repointed here. Changing where `/trainer`
 * lands is a routing decision with its own authorization — the same treatment
 * `/management` got at `P2-7`, where the redirect was preserved rather than
 * silently moved once the dashboard existed.
 */
export default function TrainerDashboardPage() {
  return <TrainerDashboardScreen />;
}
