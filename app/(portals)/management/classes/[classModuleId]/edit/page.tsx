import { ManagementEditClass } from "@/features/management/management-edit-class";

/**
 * Screen `27` Management Edit Class, at its CANONICAL route
 * `/management/classes/[classModuleId]/edit`
 * (`docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md:193`).
 *
 * ⚠️ The segment name is `classModuleId` because the entity is the CLASS
 * MODULE (`A-016`) — there is no `classes` entity between Class Grade and Class
 * Module, and naming the segment `classId` would put one back in the URL.
 *
 * ⛔ No route is moved, renamed, redirected or aliased by this phase.
 */
export default async function ManagementEditClassPage({
  params,
}: {
  readonly params: Promise<{ readonly classModuleId: string }>;
}) {
  const { classModuleId } = await params;
  return <ManagementEditClass classModuleId={classModuleId} />;
}
