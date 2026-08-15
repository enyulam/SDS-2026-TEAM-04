import { ManagementClassStatisticsScreen } from "@/features/management/management-class-statistics-screen";

/** Screen `16` — Management Class Statistics (`P2-16`, `PARTIAL`). */
export default async function ManagementClassStatisticsPage({
  params,
}: {
  params: Promise<{ classModuleId: string }>;
}) {
  const { classModuleId } = await params;
  return <ManagementClassStatisticsScreen classModuleId={classModuleId} />;
}
