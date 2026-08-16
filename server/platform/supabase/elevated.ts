import "server-only";

/**
 * Elevated (service) Supabase client — SERVER-ONLY.
 *
 * WARNING: this client authenticates with the Supabase secret key and therefore
 * BYPASSES Row-Level Security. It must only be constructed and used AFTER a
 * server-side authorization decision has already confirmed the caller is
 * permitted to perform the operation. It must never be given a user session,
 * user JWT, or request cookies, and must never be reachable from client code
 * (enforced by `server-only`). It is named "elevated"/"service" deliberately —
 * this MVP has no administrator persona.
 *
 * This checkpoint performs no query and no administrative operation; the factory
 * is defined but not yet consumed.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerConfig } from "@/server/platform/env";
import type { AppDatabase } from "@/server/db/app-database";

/**
 * Build a fresh, session-free elevated Supabase client. Session persistence,
 * automatic refresh, and URL session detection are all disabled so the client
 * holds no user session state.
 */
export function createElevatedSupabaseClient(): SupabaseClient<AppDatabase> {
  const config = getServerConfig();

  return createClient<AppDatabase>(config.supabase.url, config.supabase.secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
