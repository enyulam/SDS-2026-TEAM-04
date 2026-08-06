/**
 * Public Supabase configuration — CLIENT-SAFE.
 *
 * This module is safe to import from a Client Component. It references only the
 * two browser-visible environment variables and never touches any secret.
 *
 * Environment-selection contract:
 * - `NEXT_PUBLIC_SUPABASE_URL` is the SINGLE active-target selector. Exactly one
 *   URL/key pair is loaded per build/runtime; the application never holds
 *   simultaneous local and hosted credential sets.
 * - Classification is structural only. Offline validation CANNOT cryptographically
 *   prove that an opaque key belongs to a particular Supabase URL/project.
 *   Actual connection and identity proof belong to later runtime / Auth checkpoints.
 *
 * This module does not decode JWTs, does not infer or expose a hosted project
 * reference, does not log, and never places an environment value in an error.
 *
 * ---------------------------------------------------------------------------
 * THE SUPABASE RUNTIME PROFILE (operator ruling R-C2-5)
 * ---------------------------------------------------------------------------
 * There are EXACTLY TWO profiles and no others:
 *
 *   `default`         — project `best-coach-mvp`,    local API port 54321
 *   `f17-disposable`  — project `bc-f17-disposable`, local API port 55421
 *
 * The `default` profile is what EVERY existing caller gets, because it is what
 * an ABSENT profile variable resolves to. Nothing about the normal local or
 * hosted configuration is changed, widened or softened by this module: a local
 * target is still accepted on port 54321 and only 54321 unless the disposable
 * profile is explicitly active, and a hosted `https://*.supabase.co` target is
 * still accepted exactly as before.
 *
 * WHERE THE DECISION LIVES, AND WHY IT LIVES HERE.
 *
 * The profile is read from `process.env.BEST_COACH_SUPABASE_RUNTIME_PROFILE` —
 * a variable that is deliberately NOT prefixed `NEXT_PUBLIC_`. That prefix is
 * the only thing that makes a variable reach a browser bundle in this
 * framework, so the profile is STRUCTURALLY unreadable in the browser: in any
 * client context the expression below evaluates to `undefined` and the profile
 * therefore resolves to `default`, which authorizes port 54321 and NOTHING
 * else. The disposable port can only ever be authorized by a value present in
 * a SERVER-SIDE CHILD-PROCESS ENVIRONMENT.
 *
 * It follows that the profile is not selectable through a query parameter, a
 * cookie, a header, a request body, a form, `localStorage`, `sessionStorage`
 * or any UI control. This module reads no request, no browser API and no
 * storage of any kind; `process.env` is its only input. Setting the variable
 * requires the ability to start the server process, which is not a capability
 * any browser-side input has.
 *
 * The decision is placed in THIS module rather than in a separate server-only
 * one because this is the single place the active target is classified, and
 * every server entry point already funnels through it —
 * `server/platform/env.ts`, `server/platform/supabase/request.ts` and
 * `proxy.ts`. Splitting the profile away from the classification would create
 * a second place where a target can be accepted, which is exactly the shape of
 * defect this ruling exists to prevent. Placing it here also means the check
 * FAILS CLOSED in a browser rather than being merely absent there.
 *
 * EVERY REJECTION IS A REAL, CODED FAILURE (all authored in the existing
 * `E_PUB_*` taxonomy):
 *
 *   E_PUB_PROFILE_UNKNOWN            the profile variable is present with a
 *                                    value that is not one of the two names
 *                                    (including blank and wrong-case values)
 *   E_PUB_DISPOSABLE_PORT_UNAUTHORIZED
 *                                    the disposable local port was requested
 *                                    while the disposable profile is NOT active
 *   E_PUB_PROFILE_TARGET_CANONICAL   the canonical local port was requested
 *                                    while the disposable profile IS active
 *   E_PUB_PROFILE_TARGET_NOT_LOCAL   the disposable profile is active and the
 *                                    target is not a loopback address — this is
 *                                    what rejects a hosted `*.supabase.co`
 *                                    target, any other non-loopback hostname,
 *                                    and a linked-project fallback, all of
 *                                    which are non-loopback by construction
 *   E_PUB_URL_LOCAL_PORT             any local port other than the one the
 *                                    active profile authorizes
 */

export type SupabaseEnvironment = "local" | "hosted";

/** Key families: `modern` = opaque `sb_*` keys; `legacy` = JWT-form keys. */
export type SupabaseKeyFamily = "modern" | "legacy";

/**
 * The two — and only two — authorized Supabase runtime profiles.
 * There is no third value and no wildcard.
 */
export type SupabaseRuntimeProfile = "default" | "f17-disposable";

export interface PublicSupabaseConfig {
  readonly environment: SupabaseEnvironment;
  /** Normalized origin form of NEXT_PUBLIC_SUPABASE_URL (no path/query). */
  readonly url: string;
  readonly publishableKey: string;
}

const LOCAL_HOSTNAMES = new Set(["127.0.0.1", "localhost", "::1"]);

/** The canonical local Supabase API port — project `best-coach-mvp`. */
const CANONICAL_LOCAL_API_PORT = "54321";
/** The F17 disposable local Supabase API port — project `bc-f17-disposable`. */
const DISPOSABLE_LOCAL_API_PORT = "55421";

const DEFAULT_PROFILE: SupabaseRuntimeProfile = "default";
const DISPOSABLE_PROFILE: SupabaseRuntimeProfile = "f17-disposable";

/**
 * The closed profile -> authorized-local-port map. It has exactly two entries.
 * A local port that is not the active profile's entry is refused; there is no
 * "any localhost port" branch anywhere in this file.
 */
const AUTHORIZED_LOCAL_API_PORT: Readonly<Record<SupabaseRuntimeProfile, string>> = {
  default: CANONICAL_LOCAL_API_PORT,
  "f17-disposable": DISPOSABLE_LOCAL_API_PORT,
};

const HOSTED_HOST_SUFFIX = ".supabase.co";

const MODERN_PUBLISHABLE_PREFIX = "sb_publishable_";
const MODERN_SECRET_PREFIX = "sb_secret_";
/** JWT shape only — three base64url segments. The payload is NEVER decoded. */
const JWT_SHAPE = /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

/**
 * Throws a diagnostic error that contains ONLY the variable name, an expectation
 * category, and a stable internal error code — never an environment value.
 */
function fail(code: string, variableName: string, expectation: string): never {
  throw new Error(`[${code}] ${variableName} ${expectation}`);
}

function requireNonBlank(variableName: string, raw: string | undefined, code: string): string {
  if (typeof raw !== "string" || raw.trim() === "") {
    fail(code, variableName, "must be present and non-blank");
  }
  return raw.trim();
}

/**
 * Classify a key by family without decoding it.
 * Returns null when the key matches no accepted structural shape.
 */
export function classifyKeyFamily(rawKey: string): SupabaseKeyFamily | null {
  if (rawKey.startsWith(MODERN_PUBLISHABLE_PREFIX) || rawKey.startsWith(MODERN_SECRET_PREFIX)) {
    return "modern";
  }
  if (JWT_SHAPE.test(rawKey)) {
    return "legacy";
  }
  return null;
}

/**
 * Resolve the active Supabase runtime profile.
 *
 * ABSENT MEANS DEFAULT, so every existing caller — every build, every hosted
 * deployment, every ordinary local run — is bit-for-bit unchanged.
 *
 * PRESENT MEANS EXACT. A present variable must spell one of the two profile
 * names exactly (surrounding whitespace is trimmed, nothing else). A blank
 * value, a wrong-case value, an abbreviation or any other string is a
 * MALFORMED profile and is refused rather than silently treated as default —
 * a malformed value means the operator intended something this module cannot
 * identify, and guessing which of the two stacks they meant is precisely the
 * failure mode that must not exist.
 *
 * The direct `process.env.BEST_COACH_SUPABASE_RUNTIME_PROFILE` reference is
 * deliberate and never a dynamic lookup: it is a SERVER-SIDE child-process
 * environment input, it carries no `NEXT_PUBLIC_` prefix, and it is therefore
 * never inlined into, readable from or settable by a browser bundle.
 */
export function resolveSupabaseRuntimeProfile(): SupabaseRuntimeProfile {
  const raw = process.env.BEST_COACH_SUPABASE_RUNTIME_PROFILE;
  if (typeof raw !== "string") {
    return DEFAULT_PROFILE;
  }
  const value = raw.trim();
  if (value === DEFAULT_PROFILE) return DEFAULT_PROFILE;
  if (value === DISPOSABLE_PROFILE) return DISPOSABLE_PROFILE;
  fail(
    "E_PUB_PROFILE_UNKNOWN",
    "BEST_COACH_SUPABASE_RUNTIME_PROFILE",
    'must be exactly "default" or "f17-disposable" when it is set at all',
  );
}

function parsePublicUrl(raw: string): URL {
  try {
    return new URL(raw);
  } catch {
    return fail("E_PUB_URL_UNPARSEABLE", "NEXT_PUBLIC_SUPABASE_URL", "must be a valid absolute URL");
  }
}

/**
 * Deterministically validate and classify the active public Supabase target.
 * Direct `process.env.NEXT_PUBLIC_*` references are used (never dynamic indexing)
 * so Next.js can statically inline the browser-visible values.
 */
export function getPublicSupabaseConfig(): PublicSupabaseConfig {
  // Resolved FIRST, before any target is classified: a malformed profile must
  // stop the process rather than silently falling back to a target rule.
  const profile = resolveSupabaseRuntimeProfile();

  const rawUrl = requireNonBlank(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "E_PUB_URL_MISSING",
  );
  const rawKey = requireNonBlank(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    "E_PUB_KEY_MISSING",
  );

  const parsed = parsePublicUrl(rawUrl);
  // Strip IPv6 brackets so "[::1]" compares equal to "::1".
  const host = parsed.hostname.replace(/^\[/, "").replace(/\]$/, "");
  const isLoopback = LOCAL_HOSTNAMES.has(host);

  /*
   * The disposable profile is a LOCAL-ONLY profile. While it is active the only
   * acceptable target is the disposable loopback API, so every non-loopback
   * target is refused here — before the hosted classification below can accept
   * one. That single rejection covers a hosted `*.supabase.co` URL, any other
   * non-loopback hostname, and a linked-project fallback, because a linked
   * project is by construction a hosted, non-loopback target.
   */
  if (profile === DISPOSABLE_PROFILE && !isLoopback) {
    fail(
      "E_PUB_PROFILE_TARGET_NOT_LOCAL",
      "NEXT_PUBLIC_SUPABASE_URL",
      "must be a loopback address while the f17-disposable runtime profile is active",
    );
  }

  let environment: SupabaseEnvironment;
  if (isLoopback) {
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      fail("E_PUB_URL_PROTOCOL", "NEXT_PUBLIC_SUPABASE_URL", "must use http: or https: for a local target");
    }

    /*
     * The two cross-profile refusals, stated separately so each has its own
     * code and its own test rather than collapsing into one ambiguous verdict.
     */
    if (parsed.port === DISPOSABLE_LOCAL_API_PORT && profile !== DISPOSABLE_PROFILE) {
      fail(
        "E_PUB_DISPOSABLE_PORT_UNAUTHORIZED",
        "NEXT_PUBLIC_SUPABASE_URL",
        "must not use the F17 disposable API port unless the f17-disposable runtime profile is set in the server process environment",
      );
    }
    if (parsed.port === CANONICAL_LOCAL_API_PORT && profile === DISPOSABLE_PROFILE) {
      fail(
        "E_PUB_PROFILE_TARGET_CANONICAL",
        "NEXT_PUBLIC_SUPABASE_URL",
        "must not use the canonical API port while the f17-disposable runtime profile is active",
      );
    }
    if (parsed.port !== AUTHORIZED_LOCAL_API_PORT[profile]) {
      fail(
        "E_PUB_URL_LOCAL_PORT",
        "NEXT_PUBLIC_SUPABASE_URL",
        "local target must use the Supabase API port authorized by the active runtime profile",
      );
    }
    environment = "local";
  } else if (parsed.protocol === "https:" && host.endsWith(HOSTED_HOST_SUFFIX)) {
    environment = "hosted";
  } else {
    return fail(
      "E_PUB_URL_UNSUPPORTED",
      "NEXT_PUBLIC_SUPABASE_URL",
      "must be a supported local (127.0.0.1|localhost|::1 on the port the active runtime profile authorizes) or hosted (https://*.supabase.co) target",
    );
  }

  // A secret key must never appear in the browser-visible publishable variable.
  if (rawKey.startsWith(MODERN_SECRET_PREFIX)) {
    fail("E_PUB_KEY_IS_SECRET", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "must not contain a secret-key prefix");
  }
  if (classifyKeyFamily(rawKey) === null) {
    fail(
      "E_PUB_KEY_SHAPE",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "must be a current sb_publishable_ key or a legacy JWT-form key",
    );
  }

  return {
    environment,
    url: parsed.origin,
    publishableKey: rawKey,
  };
}
