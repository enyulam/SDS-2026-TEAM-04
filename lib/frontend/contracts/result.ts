export type UiFieldError = {
  readonly path: string;
  readonly message: string;
};

export type UiActionResult<T> =
  | { readonly outcome: "success"; readonly data: T }
  | {
      readonly outcome: "validation";
      readonly message: string;
      readonly fields: readonly UiFieldError[];
    }
  | { readonly outcome: "unauthenticated" }
  | { readonly outcome: "unauthorized" }
  | { readonly outcome: "unavailable" }
  | { readonly outcome: "stale_state"; readonly message: string }
  | {
      readonly outcome: "generation_failure";
      readonly retryable: boolean;
      readonly message: string;
    }
  | { readonly outcome: "retryable_failure"; readonly message: string }
  | { readonly outcome: "unexpected_failure"; readonly message: string };
