import { Suspense } from "react";
import { LoginPresentation } from "@/features/auth/login-presentation";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <p className="text-body text-ink-muted" role="status">
          Loading login presentation…
        </p>
      }
    >
      <LoginPresentation />
    </Suspense>
  );
}
