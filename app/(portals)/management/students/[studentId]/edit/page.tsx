import { ManagementEditStudentScreen } from "@/features/management/management-edit-student-screen";

/**
 * Screen `22` — Edit Student (`P2-14`), at its canonical route
 * `/management/students/[studentId]/edit` (inventory §7.2).
 *
 * ⚠️ A child of `/management/students`, whose rail item dropped `exact` at
 * `P2-9` — so this resolves to one active item. Verified (`C2C-002`).
 */
export default async function ManagementEditStudentPage({
  params,
}: {
  readonly params: Promise<{ readonly studentId: string }>;
}) {
  const { studentId } = await params;
  return <ManagementEditStudentScreen studentId={studentId} />;
}
