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
 */

export type SupabaseEnvironment = "local" | "hosted";

/** Key families: `modern` = opaque `sb_*` keys; `legacy` = JWT-form keys. */
export type SupabaseKeyFamily = "modern" | "legacy";

export interface PublicSupabaseConfig {
  readonly environment: SupabaseEnvironment;
  /** Normalized origin form of NEXT_PUBLIC_SUPABASE_URL (no path/query). */
  readonly url: string;
  readonly publishableKey: string;
}

const LOCAL_HOSTNAMES = new Set(["127.0.0.1", "localhost", "::1"]);
const LOCAL_SUPABASE_API_PORT = "54321";
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

  let environment: SupabaseEnvironment;
  if (LOCAL_HOSTNAMES.has(host)) {
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      fail("E_PUB_URL_PROTOCOL", "NEXT_PUBLIC_SUPABASE_URL", "must use http: or https: for a local target");
    }
    if (parsed.port !== LOCAL_SUPABASE_API_PORT) {
      fail("E_PUB_URL_LOCAL_PORT", "NEXT_PUBLIC_SUPABASE_URL", "local target must use the Supabase API port 54321");
    }
    environment = "local";
  } else if (parsed.protocol === "https:" && host.endsWith(HOSTED_HOST_SUFFIX)) {
    environment = "hosted";
  } else {
    return fail(
      "E_PUB_URL_UNSUPPORTED",
      "NEXT_PUBLIC_SUPABASE_URL",
      "must be a supported local (127.0.0.1|localhost|::1 on port 54321) or hosted (https://*.supabase.co) target",
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
