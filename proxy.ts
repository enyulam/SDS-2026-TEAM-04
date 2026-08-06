/**
 * `proxy.ts` — SERVER-SIDE PORTAL AUTHORIZATION (F16-B), layer 1 of 2.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS FILE IS NAMED `proxy.ts` AND NOT `middleware.ts`
 * ---------------------------------------------------------------------------
 * This project runs Next.js 16.2.10 (`package.json` -> "next": "16.2.10"). In
 * this version the request-interception file convention was RENAMED from
 * `middleware` to `proxy`. Verified against the installed package, not from
 * memory:
 *
 *  - `next/dist/lib/constants.js` defines BOTH names:
 *      `const MIDDLEWARE_FILENAME = 'middleware'`  (line 287)
 *      `const PROXY_FILENAME      = 'proxy'`       (line 289)
 *
 *  - `next/dist/build/index.js` detects both at the convention level and, if
 *    BOTH files exist, THROWS a hard build error (line 645):
 *      `Both middleware file "./middleware.ts" and proxy file "./proxy.ts" are
 *       detected. Please use "./proxy.ts" only.`
 *    If only `middleware` is present it still builds but emits a deprecation
 *    via `warnOnce` (line 651):
 *      `The "middleware" file convention is deprecated. Please use "proxy"
 *       instead.`
 *    => `proxy.ts` is the only spelling that neither errors nor warns.
 *    => `middleware.ts` MUST NEVER be created in this repository, and the two
 *       files must never coexist.
 *
 *  - The proxy runtime is **Node.js and is not configurable**:
 *    `next/dist/build/entries.js` line 231 routes `isProxyFile(page)` to
 *    `params.onServer()` and returns — there is no `onEdgeServer()` branch and
 *    no `pageRuntime` check, unlike the legacy `isMiddlewareFile` branch just
 *    below it (lines 235-243) which still honours `nodejs` vs edge. Because the
 *    proxy is a Node.js server entry, it can import the ordinary server
 *    identity module directly (see below) instead of duplicating its rule.
 *
 *  - `next/server` exports the current types `NextProxy` / `ProxyConfig`
 *    (`next/server.d.ts`); `NextMiddleware` / `MiddlewareConfig` are the same
 *    types re-exported under `@deprecated` aliases.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS FILE ENFORCES
 * ---------------------------------------------------------------------------
 * 1. SESSION CONTINUITY. It builds a request-scoped Supabase client with
 *    `@supabase/ssr`'s `createServerClient` using the getAll/setAll cookie pair,
 *    and PROPAGATES every refreshed auth cookie onto the outgoing response. The
 *    proxy is one of the few places Next.js permits cookie writes (a Server
 *    Component render silently swallows them — see
 *    `server/platform/supabase/request.ts`), so this is what keeps a session
 *    alive across navigations rather than expiring mid-flow.
 *
 * 2. AUTHORITY FROM LIVE SERVER STATE. It calls the SAME authority every other
 *    surface uses — `resolveSessionIdentity` from
 *    `server/modules/identity-access/session-core.ts`: `auth.getUser()`
 *    (round-trips to the Auth server, so a forged or stale cookie fails here)
 *    -> the single active `accounts` row -> the single active
 *    `centre_memberships` row -> `centres`. That module deliberately imports no
 *    `next/*` and no `server-only`, so it loads cleanly in the Node.js proxy
 *    runtime; NO alternative or weakened rule is invented here.
 *
 * 3. THE `role` QUERY PARAMETER GRANTS NOTHING (A-046, Amendment 005). This
 *    file never reads `request.nextUrl.searchParams` at all. Authorization is a
 *    function of the resolved membership row and the requested path prefix
 *    only.
 *
 * 4. NON-DISCLOSING DENIALS.
 *      - Unauthenticated (or unresolvable) caller on any portal route ->
 *        redirect to `/login`, with NO reason encoded: no `?error=`, no
 *        `?from=`, no header, no body. "No session", "no active account",
 *        "no membership" and "two memberships" are byte-identical outcomes.
 *      - Authenticated caller with the WRONG role for the requested portal ->
 *        redirect to that caller's OWN portal root. The response never reveals
 *        that the target path exists, never names a missing permission, and
 *        carries no protected data of any kind.
 *
 * 5. `/login` STAYS REACHABLE while unauthenticated, and an ALREADY-signed-in
 *    caller is bounced to their own server-derived portal so nobody can sit on
 *    a login form with a live session. `/` is NOT matched here — it keeps its
 *    F16-A behaviour in `app/page.tsx`.
 *
 * ---------------------------------------------------------------------------
 * DEFENCE IN DEPTH — THIS FILE IS NOT THE ONLY GUARD
 * ---------------------------------------------------------------------------
 * Route protection must not depend on a single matcher being right. The same
 * decision is re-taken SERVER-SIDE inside each portal layout
 * (`app/(portals)/{trainer,management,parent}/layout.tsx`) via
 * `requirePortalAccess()` in
 * `server/modules/identity-access/portal-guard.ts`. If this matcher were
 * mis-scoped, mis-ordered or removed entirely, the layout guard would still
 * re-resolve identity from live server state and redirect. Neither layer is a
 * client-side rendering check.
 *
 * ---------------------------------------------------------------------------
 * FAIL-CLOSED
 * ---------------------------------------------------------------------------
 * Nothing here is wrapped in a catch-all. If configuration or transport throws,
 * the request errors and NO portal markup is produced — a thrown proxy is a
 * closed door, not an open one. Swallowing it would be the only way to
 * accidentally serve a portal to an unresolved caller.
 *
 * The elevated service-role client (`server/platform/supabase/elevated.ts`) is
 * NOT imported here, directly or transitively: every read below runs under the
 * caller's own RLS scope with the publishable key.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getPublicSupabaseConfig } from "@/lib/supabase/public-config";
import {
  resolveSessionIdentity,
  type SessionRole,
} from "@/server/modules/identity-access/session-core";
import { portalHomeForRole } from "@/server/modules/identity-access/portal-destinations";

/** The unauthenticated entry surface. Never carries a denial reason. */
const LOGIN_PATH = "/login";

/**
 * Path prefix -> the role that alone may enter it. Keyed by `SessionRole`, so
 * the only value that can ever be compared against a prefix is a role the
 * SERVER derived from a live membership row.
 */
const PORTAL_PREFIXES: readonly (readonly [string, SessionRole])[] = [
  ["/trainer", "trainer"],
  ["/management", "management"],
  ["/parent", "parent"],
];

/** The portal a path belongs to, or null if the path is not a portal route. */
function portalForPath(pathname: string): SessionRole | null {
  for (const [prefix, role] of PORTAL_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return role;
  }
  return null;
}

interface PendingCookie {
  readonly name: string;
  readonly value: string;
  readonly options: CookieOptions;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  const portal = portalForPath(pathname);
  const isLogin = pathname === LOGIN_PATH;

  // Nothing else is matched, but a matcher change must not silently create an
  // unguarded pass-through with no session refresh either.
  if (!portal && !isLogin) return NextResponse.next({ request });

  // Refreshed auth cookies are collected here and replayed onto whichever
  // response we end up returning (pass-through OR redirect), so a session that
  // rotates during a denied navigation is still persisted correctly.
  const pending: PendingCookie[] = [];

  const { url, publishableKey } = getPublicSupabaseConfig();
  const client = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          // Update the inbound request too, so a downstream Server Component
          // render in this same pass sees the refreshed session.
          request.cookies.set(name, value);
          pending.push({ name, value, options: options ?? {} });
        }
      },
    },
  });

  // The single authority. Identical chain to every Server Action and RSC read.
  const identity = await resolveSessionIdentity(client);

  const respond = (response: NextResponse): NextResponse => {
    for (const { name, value, options } of pending) {
      response.cookies.set(name, value, options);
    }
    return response;
  };

  const redirectTo = (path: string): NextResponse => {
    // A fresh URL built from the request origin ONLY. No search parameters are
    // carried over, so no denial reason and no caller-supplied `role` survives.
    const destination = new URL(path, request.nextUrl.origin);
    return respond(NextResponse.redirect(destination));
  };

  if (isLogin) {
    // Unresolved callers may use the login form; resolved ones are sent to the
    // portal their own membership row entitles them to.
    if (identity.outcome !== "success") return respond(NextResponse.next({ request }));
    return redirectTo(portalHomeForRole(identity.data.role));
  }

  // Portal route from here on.
  if (identity.outcome !== "success") {
    // `unauthenticated` and `unauthorized` are deliberately the SAME response.
    return redirectTo(LOGIN_PATH);
  }

  if (identity.data.role !== portal) {
    // Wrong role. The caller is returned to their own portal root — this
    // discloses nothing about the requested path, not even that it exists.
    return redirectTo(portalHomeForRole(identity.data.role));
  }

  return respond(NextResponse.next({ request }));
}

/**
 * Matcher — the three portal prefixes and the login route.
 *
 * The bare prefixes are listed alongside `/:path*` explicitly rather than
 * relying on `:path*` also matching the zero-segment case, so `/trainer`
 * (the compatibility redirect onto `/trainer/schedule`), `/management` and
 * `/parent` are unambiguously covered.
 *
 * `/` is intentionally absent: `app/page.tsx` already performs the same
 * server-side resolution there (F16-A) and matching it here would only
 * duplicate that redirect.
 */
export const config = {
  matcher: [
    "/trainer",
    "/trainer/:path*",
    "/management",
    "/management/:path*",
    "/parent",
    "/parent/:path*",
    "/login",
  ],
};
