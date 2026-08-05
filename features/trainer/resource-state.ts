import type { UiActionResult } from "@/lib/frontend/contracts/result";

export type FailureResult = Exclude<UiActionResult<never>, { outcome: "success" }>;

export type ResourceState<T> =
  | { readonly kind: "loading" }
  | { readonly kind: "ready"; readonly data: T }
  | { readonly kind: "failed"; readonly result: FailureResult };

export function asFailure<T>(result: Exclude<UiActionResult<T>, { outcome: "success" }>): FailureResult {
  return result;
}
