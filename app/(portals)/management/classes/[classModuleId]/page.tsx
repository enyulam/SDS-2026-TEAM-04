import { ManagementClassOverview } from "@/features/management/management-class-overview";

/**
 * Screen `13` Management Class Overview, at its CANONICAL route
 * `/management/classes/[classModuleId]`
 * (`docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md:179`).
 *
 * ⚠️ The segment is `classModuleId` because the entity is the CLASS MODULE
 * (`A-016`); `classId` would put a prohibited `classes` entity into the URL.
 * It is the SAME segment screen `27` uses one level deeper, which is why both
 * resolve from one folder.
 *
 * ⛔ No route is moved, renamed, redirected or aliased by this phase.
 */
export default async function ManagementClassOverviewPage({
  params,
}: {
  readonly params: Promise<{ readonly classModuleId: string }>;
}) {
  const { classModuleId } = await params;
  return <ManagementClassOverview classModuleId={classModuleId} />;
}
