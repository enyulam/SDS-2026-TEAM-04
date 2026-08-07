import "server-only";

/**
 * Server environment validation — SERVER-ONLY.
 *
 * Validates all six approved environment-variable names and returns a typed,
 * immutable configuration object. Private values are read here and never
 * exported through a client-safe module, never logged, never mutated back onto
 * `process.env`, and never placed in an error message. JWTs are not decoded and
 * no network request is made. Structural validation does NOT prove that the
 * opaque credentials belong to the selected Supabase URL/project — connection
 * and identity proof belong to later runtime / Auth checkpoints.
 */

import {
  classifyKeyFamily,
  getPublicSupabaseConfig,
  type SupabaseEnvironment,
  type SupabaseKeyFamily,
} from "@/lib/supabase/public-config";
import { requireRatifiedLlmConfig, type RatifiedLlmConfig } from "@/server/platform/llm-config";

export { requireRatifiedLlmConfig, type RatifiedLlmConfig } from "@/server/platform/llm-config";

const MODERN_PUBLISHABLE_PREFIX = "sb_publishable_";

export interface ServerConfig {
  readonly supabase: {
    readonly environment: SupabaseEnvironment;
    readonly url: string;
    readonly publishableKey: string;
    readonly secretKey: string;
    readonly keyFamily: SupabaseKeyFamily;
  };
  readonly llm: RatifiedLlmConfig;
}

/** Diagnostic error containing only a code, the variable name, and an expectation. */
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
 * Validate the six approved environment variables and return the immutable
 * server configuration. Reuses the public target classification so the active
 * environment is decided in exactly one place.
 */
export function getServerConfig(): ServerConfig {
  // Reuse the public target classification (URL + publishable key).
  const publicConfig = getPublicSupabaseConfig();

  const secretKey = requireNonBlank(
    "SUPABASE_SECRET_KEY",
    process.env.SUPABASE_SECRET_KEY,
    "E_SRV_SECRET_MISSING",
  );
  if (secretKey.startsWith(MODERN_PUBLISHABLE_PREFIX)) {
    fail("E_SRV_SECRET_IS_PUBLISHABLE", "SUPABASE_SECRET_KEY", "must not contain a publishable-key prefix");
  }

  const secretFamily = classifyKeyFamily(secretKey);
  if (secretFamily === null) {
    fail("E_SRV_SECRET_SHAPE", "SUPABASE_SECRET_KEY", "must be a current sb_secret_ key or a legacy JWT-form key");
  }
  const publishableFamily = classifyKeyFamily(publicConfig.publishableKey);
  if (publishableFamily === null || secretFamily !== publishableFamily) {
    fail(
      "E_SRV_KEY_FAMILY_MISMATCH",
      "SUPABASE_SECRET_KEY",
      "must use the same key family as NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }
  if (secretKey === publicConfig.publishableKey) {
    fail("E_SRV_KEY_REUSE", "SUPABASE_SECRET_KEY", "must not be identical to the publishable key");
  }

  const llm = requireRatifiedLlmConfig();

  return Object.freeze({
    supabase: Object.freeze({
      environment: publicConfig.environment,
      url: publicConfig.url,
      publishableKey: publicConfig.publishableKey,
      secretKey,
      keyFamily: secretFamily,
    }),
    llm: Object.freeze(llm),
  });
}
