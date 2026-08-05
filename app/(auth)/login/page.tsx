import { Suspense } from "react";
import { LoginPresentation } from "@/features/auth/login-presentation";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-blue-100">Loading login presentation…</div>}>
      <LoginPresentation />
    </Suspense>
  );
}
