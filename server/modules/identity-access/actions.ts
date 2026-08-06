"use server";

/**
 * Authentication server actions — SERVER-ONLY (the "use server" directive
 * plus the request-scoped client; no elevated client is ever touched here).
 *
 * - `signInAction` performs the real local Supabase Auth password sign-in.
 *   The password transits ONLY through the auth call: it is never logged,
 *   never persisted, never echoed into an error and never stored anywhere
 *   by this code (CLAUDE.md §11 fixture-credential rules).
 * - `signInFormAction` is the thin `FormData` adapter the login form binds to.
 *   It reads the two fields out of the request body, hands them straight to
 *   `signInAction`, and returns a state object that carries NEITHER the email
 *   NOR the password — only a single `status`. Nothing it returns, and nothing
 *   it redirects to, is derived from anything the client supplied.
 * - The `role` query parameter on the login route is PRESENTATION ONLY
 *   (contract §4) — it is deliberately not a parameter of any action here,
 *   so it cannot influence authority even by accident.
 * - Failure outcomes are non-disclosing: a wrong password, an unknown email
 *   and a deactivated account all resolve to the same `unauthenticated`.
 * - Session-refresh cookie writes happen inside these actions (Next.js
 *   permits cookie writes in Server Actions), which is why every governed
 *   call in the slice flows through an action rather than a bare RSC read.
 */

import { redirect } from "next/navigation";
import { createRequestSupabaseClient } from "@/server/platform/supabase/request";
import type { ActionResult } from "@/server/contracts/action-result";
import {
  resolveSessionIdentity,
  toSessionUserDto,
  type SessionUserDto,
} from "@/server/modules/identity-access/session-core";
import { portalHomeForRole } from "@/server/modules/identity-access/portal-destinations";

export async function signInAction(
  email: string,
  password: string,
): Promise<ActionResult<SessionUserDto>> {
  if (typeof email !== "string" || email.trim() === "" || typeof password !== "string" || password === "") {
    return {
      outcome: "validation",
      message: "Email and password are required.",
      fields: [
        ...(email?.trim() ? [] : [{ path: "email", message: "Required" }]),
        ...(password ? [] : [{ path: "password", message: "Required" }]),
      ],
    };
  }

  const client = await createRequestSupabaseClient();
  const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
  if (error) {
    // Non-disclosing: never distinguish unknown email / wrong password /
    // deactivated identity, and never surface the provider's message.
    return { outcome: "unauthenticated" };
  }

  // Authority comes from the live domain rows, not from the fact a login
  // succeeded: an Auth identity with no active account/membership is signed
  // out again and denied.
  const identity = await resolveSessionIdentity(client);
  if (identity.outcome !== "success") {
    await client.auth.signOut();
    return identity.outcome === "unauthenticated" ? identity : { outcome: "unauthorized" };
  }
  return { outcome: "success", data: toSessionUserDto(identity.data) };
}

/**
 * The state the login form renders from.
 *
 * It is a CLOSED, two-valued status and nothing else. It deliberately carries
 * no email, no password, no field list, no provider message and no outcome
 * discriminator, so a wrong password, an unknown email, a deactivated account
 * and a missing/ambiguous membership are all byte-identical to the client —
 * there is no shape in which the difference could survive.
 */
export type SignInFormState = { readonly status: "idle" | "error" };

/**
 * `FormData` adapter for the login form (bound via `useActionState`).
 *
 * On success it redirects to the portal for the role the SERVER derived from
 * the live membership row. The `role` query parameter is not read here, is not
 * a parameter of this function, and cannot reach `portalHomeForRole`.
 *
 * The password is read out of `FormData` into a local and passed directly to
 * `signInAction`. It is never logged, never returned, never placed in a URL and
 * never stored.
 */
export async function signInFormAction(
  _previous: SignInFormState,
  formData: FormData,
): Promise<SignInFormState> {
  const emailEntry = formData.get("email");
  const passwordEntry = formData.get("password");

  const result = await signInAction(
    typeof emailEntry === "string" ? emailEntry : "",
    typeof passwordEntry === "string" ? passwordEntry : "",
  );

  // Every non-success outcome — validation, unauthenticated, unauthorized and
  // any transport failure — collapses to the one status. The caller learns
  // only that sign-in did not happen.
  if (result.outcome !== "success") {
    return { status: "error" };
  }

  redirect(portalHomeForRole(result.data.role));
}

export async function signOutAction(): Promise<ActionResult<null>> {
  const client = await createRequestSupabaseClient();
  await client.auth.signOut();
  return { outcome: "success", data: null };
}

/** The server-derived session user for the shell (`SessionUserDto`). */
export async function getSessionUserAction(): Promise<ActionResult<SessionUserDto>> {
  const client = await createRequestSupabaseClient();
  const identity = await resolveSessionIdentity(client);
  if (identity.outcome !== "success") return identity;
  return { outcome: "success", data: toSessionUserDto(identity.data) };
}
