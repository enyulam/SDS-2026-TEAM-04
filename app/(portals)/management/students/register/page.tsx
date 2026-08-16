import { ManagementRegisterStudentScreen } from "@/features/management/management-register-student-screen";

/**
 * Screen `20` — Register New Student (`P2-12`), at its canonical route
 * `/management/students/register` (inventory §7.2).
 *
 * ⚠️ A CHILD OF `/management/students`, whose rail item dropped `exact` at
 * `P2-9` — so this route already resolves to exactly one active item, and no
 * rail change is needed. Verified, not assumed (`C2C-002`).
 */
export default function ManagementRegisterStudentPage() {
  return <ManagementRegisterStudentScreen />;
}
