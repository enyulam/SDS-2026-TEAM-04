import { ManagementLessonStatisticsScreen } from "@/features/management/management-lesson-statistics-screen";

/**
 * Screen `15` Management Lesson Statistics, at its CANONICAL route
 * `/management/classes/[classModuleId]/sessions/[sessionId]/lesson-statistics`
 * (ratified inventory, screen `15`; Figma node `690:2`).
 *
 * ⚠️ NO ROUTE TREATMENT. The pack records no implemented route, so nothing is
 * moved, redirected, aliased or replaced.
 *
 * ⛔ THE `Classes` RAIL ITEM ALREADY DROPPED `exact` AT `P2-2`, so this deeper
 * child needs no navigation change — verified rather than assumed, because
 * `C2C-002` has now bitten three rail items in three phases.
 */
export default async function ManagementLessonStatisticsPage({
  params,
}: {
  params: Promise<{ classModuleId: string; sessionId: string }>;
}) {
  const { classModuleId, sessionId } = await params;
  return (
    <ManagementLessonStatisticsScreen classModuleId={classModuleId} classSessionId={sessionId} />
  );
}
