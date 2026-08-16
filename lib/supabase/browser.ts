/**
 * Browser-safe Supabase client — CLIENT-SAFE.
 *
 * Uses only the public URL and publishable key. It never imports anything under
 * `server/` and never references a private environment variable. Reads made
 * through this client are expected to be
 * Row-Level-Security scoped (ADR-3); no privileged operation is possible here.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseConfig } from "@/lib/supabase/public-config";
import type { AppDatabase } from "@/server/db/app-database";

// Module-level browser singleton: repeated calls in the browser reuse one client.
let browserClient: SupabaseClient<AppDatabase> | undefined;

/**
 * Return the browser Supabase client, creating it once per browser context.
 * No query and no authentication are performed here.
 */
export function createBrowserSupabaseClient(): SupabaseClient<AppDatabase> {
  if (browserClient) {
    return browserClient;
  }

  const { url, publishableKey } = getPublicSupabaseConfig();
  browserClient = createBrowserClient<AppDatabase>(url, publishableKey);
  return browserClient;
}
