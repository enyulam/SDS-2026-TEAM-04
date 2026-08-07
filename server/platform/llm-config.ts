/**
 * The ratified LLM selector check — deliberately WITHOUT `server-only`.
 *
 * This is the LLM slice of `server/platform/env.ts`'s `getServerConfig()`,
 * factored out so it can be imported directly by a plain Node physical-test
 * script (Run C3-C's G-6 activation harness), the same way
 * `server/modules/ai-drafting/provider.ts`, `grounding.ts` and
 * `framework/dimensions.ts` already are — none of those carry `server-only`
 * either, because they hold no Supabase secret and are pure business logic,
 * safe to execute outside a Next.js request. `env.ts` keeps its own
 * `server-only` guard (it also validates `SUPABASE_SECRET_KEY`, which stays
 * behind that guard) and calls `requireRatifiedLlmConfig()` here so there is
 * exactly one implementation of the provider/model equality check, never two
 * literal copies of "openai" / "gpt-5.6-terra" that could drift apart.
 *
 * `LLM_API_KEY` is read for PRESENCE-and-pass-through only: its value is
 * returned to the caller (which hands it, unmodified, to exactly one
 * `OpenAiDraftProvider` constructor) and is never printed, logged, hashed
 * visibly, or placed in an error message anywhere in this file.
 */

const ACCEPTED_LLM_PROVIDER = "openai";
const ACCEPTED_LLM_MODEL = "gpt-5.6-terra";

export interface RatifiedLlmConfig {
  readonly provider: typeof ACCEPTED_LLM_PROVIDER;
  readonly model: typeof ACCEPTED_LLM_MODEL;
  readonly apiKey: string;
}

/** Diagnostic error containing only a code, the variable name, and an expectation — never a value. */
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
 * Validate `LLM_PROVIDER` and `LLM_MODEL` by STRICT EQUALITY against the
 * ratified literals (never presence-only — that was Run C3-A's Phase 2b
 * defect: a configured selector is not the same thing as a VERIFIED one),
 * and require `LLM_API_KEY` to be present. Returns the ratified selectors
 * plus the key, ready to hand to exactly one `OpenAiDraftProvider`.
 */
export function requireRatifiedLlmConfig(): RatifiedLlmConfig {
  const provider = requireNonBlank("LLM_PROVIDER", process.env.LLM_PROVIDER, "E_SRV_LLM_PROVIDER_MISSING");
  if (provider !== ACCEPTED_LLM_PROVIDER) {
    fail("E_SRV_LLM_PROVIDER", "LLM_PROVIDER", "must equal the accepted project provider");
  }

  const model = requireNonBlank("LLM_MODEL", process.env.LLM_MODEL, "E_SRV_LLM_MODEL_MISSING");
  if (model !== ACCEPTED_LLM_MODEL) {
    fail("E_SRV_LLM_MODEL", "LLM_MODEL", "must equal the accepted project model");
  }

  const apiKey = requireNonBlank("LLM_API_KEY", process.env.LLM_API_KEY, "E_SRV_LLM_KEY_MISSING");

  return Object.freeze({
    provider: ACCEPTED_LLM_PROVIDER,
    model: ACCEPTED_LLM_MODEL,
    apiKey,
  });
}
