import "server-only";

/**
 * Request-scoped Supabase server client — SERVER-ONLY.
 *
 * Creates a brand-new client on every invocation, bound to the current request's
 * cookies. It uses the PUBLISHABLE key (never the secret key), so it operates
 * under the caller's Row-Level-Security scope. No client is ever stored in
 * module-global state, and the Authorization header is never overridden.
 *
 * This checkpoint performs no `auth.getUser`/`getClaims`, sign-in/out, refresh,
 * or query — the factory is defined but not yet consumed. Full session-refresh
 * and cookie propagation (middleware / route handlers) belong to the later Auth
 * checkpoint; no `proxy.ts` or `middleware.ts` is created here.
 */

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getPublicSupabaseConfig } from "@/lib/supabase/public-config";

/**
 * Build a fresh request-scoped Supabase client using the current request cookies.
 */
export async function createRequestSupabaseClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();
  const { url, publishableKey } = getPublicSupabaseConfig();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Next.js only permits cookie writes from a Server Action or Route
          // Handler, not during a Server Component render. This narrow catch
          // handles exactly that documented limitation; session-refresh cookie
          // propagation is implemented in the later Auth checkpoint. This
          // factory triggers no write in Step 7D (no auth call is made), and
          // the catch is scoped to the write loop alone so unrelated errors
          // elsewhere are never suppressed.
        }
      },
    },
  });
}
