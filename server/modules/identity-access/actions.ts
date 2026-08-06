"use server";

/**
 * Authentication server actions — SERVER-ONLY (the "use server" directive
 * plus the request-scoped client; no elevated client is ever touched here).
 *
 * - `signInAction` performs the real local Supabase Auth password sign-in.
 *   The password transits ONLY through the auth call: it is never logged,
 *   never persisted, never echoed into an error and never stored anywhere
 *   by this code (CLAUDE.md §11 fixture-credential rules).
 * - The `role` query parameter on the login route is PRESENTATION ONLY
 *   (contract §4) — it is deliberately not a parameter of any action here,
 *   so it cannot influence authority even by accident.
 * - Failure outcomes are non-disclosing: a wrong password, an unknown email
 *   and a deactivated account all resolve to the same `unauthenticated`.
 * - Session-refresh cookie writes happen inside these actions (Next.js
 *   permits cookie writes in Server Actions), which is why every governed
 *   call in the slice flows through an action rather than a bare RSC read.
 */

import { createRequestSupabaseClient } from "@/server/platform/supabase/request";
import type { ActionResult } from "@/server/contracts/action-result";
import {
  resolveSessionIdentity,
  toSessionUserDto,
  type SessionUserDto,
} from "@/server/modules/identity-access/session-core";

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
