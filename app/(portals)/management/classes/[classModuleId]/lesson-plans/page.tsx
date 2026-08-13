import { ManagementLessonPlans } from "@/features/management/management-lesson-plans";

/**
 * Screen `14` Management Lesson Plan Management, at its CANONICAL route
 * `/management/classes/[classModuleId]/lesson-plans`
 * (`docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md`, screen `14`).
 *
 * ⚠️ The segment is `classModuleId` because the entity is the CLASS MODULE
 * (`A-016`); `classId` would put a prohibited `classes` entity into the URL.
 * It is the SAME segment screens `13` and `27` use, which is why all three
 * resolve from one folder.
 *
 * ⛔ No route is moved, renamed, redirected or aliased by this phase.
 */
export default async function ManagementLessonPlansPage({
  params,
}: {
  readonly params: Promise<{ readonly classModuleId: string }>;
}) {
  const { classModuleId } = await params;
  return <ManagementLessonPlans classModuleId={classModuleId} />;
}
