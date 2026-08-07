#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach -- G-6 harness: failure-safety static proof (condition 13)
// =====================================================================
// Proves OpenAiDraftProvider.generate() leaves no false "ok" outcome on
// timeout, invalid JSON, or a provider failure response -- WITHOUT making
// any network call. `globalThis.fetch` is monkey-patched to a LOCAL stub
// for the duration of this process only; nothing here ever resolves a
// hostname or opens a socket. Run standalone or as a subprocess of
// `scripts/physical-test/activate-g6.mjs` (which shells out to this file
// before either real generation, in both --dry-run and
// --activate-real-provider mode).
//
// Run: node --import ../integration/alias-loader.mjs scripts/tests/g6-harness/failure-safety.mjs
// =====================================================================

import { OpenAiDraftProvider } from "@/server/modules/ai-drafting/provider.ts";

let failures = 0;
const fail = (id, msg) => { failures += 1; console.error(`FAIL ${id}: ${msg}`); };
const pass = (id, msg) => console.log(`PASS ${id}${msg ? " -- " + msg : ""}`);

const SAMPLE_REQUEST = {
  reportId: "00000000-0000-4000-8000-000000000000",
  observationLockVersion: 1,
  studentDisplayName: "Fixture Student",
  ratings: [
    { dimensionCode: "body", displayName: "Body", rating: "mastered", anchorText: "anchor", polarityBand: "positive" },
  ],
  strengthChips: [],
  focusChips: [],
  trainerNotes: "",
  followUpNotes: "",
};

async function withStubFetch(stub, run) {
  const original = globalThis.fetch;
  globalThis.fetch = stub;
  try {
    return await run();
  } finally {
    globalThis.fetch = original;
  }
}

async function main() {
  const provider = new OpenAiDraftProvider({ apiKey: "sk-test-not-real", model: "gpt-5.6-terra", timeoutMs: 50 });

  // 1 -- a hung request that never resolves before the provider's own
  //      AbortController timeout must produce a retryable provider_failure,
  //      never "ok" and never an unhandled rejection.
  {
    // Never resolves on its own; only the AbortSignal ends it, exactly like
    // a real hung TCP connection would leave fetch() to the signal.
    const stub = (_input, init) => new Promise((_resolvePromise, rejectPromise) => {
      init?.signal?.addEventListener("abort", () => {
        const err = new Error("The operation was aborted.");
        err.name = "AbortError";
        rejectPromise(err);
      });
    });
    const outcome = await withStubFetch(stub, () => provider.generate(SAMPLE_REQUEST));
    if (outcome.kind !== "provider_failure" || outcome.retryable !== true) {
      fail("FS-1", `a timed-out request gave ${JSON.stringify(outcome)}, expected {kind: provider_failure, retryable: true}`);
    } else pass("FS-1", "a timeout is classified as a retryable provider_failure, never ok");
  }

  // 2 -- invalid JSON in the response body must produce schema_rejected,
  //      never ok, and never throw past the provider boundary.
  {
    const stub = async () => ({
      ok: true,
      status: 200,
      json: async () => ({ choices: [{ message: { content: "{not valid json" } }] }),
    });
    const outcome = await withStubFetch(stub, () => provider.generate(SAMPLE_REQUEST));
    if (outcome.kind !== "schema_rejected") {
      fail("FS-2", `malformed JSON content gave ${JSON.stringify(outcome)}, expected schema_rejected`);
    } else pass("FS-2", "unparseable model output is schema_rejected, never ok");
  }

  // 3 -- a non-ok HTTP response (5xx) must produce a retryable
  //      provider_failure; a non-ok 4xx (non-429) must be non-retryable.
  {
    const stub500 = async () => ({ ok: false, status: 503, json: async () => ({}) });
    const outcome500 = await withStubFetch(stub500, () => provider.generate(SAMPLE_REQUEST));
    const stub401 = async () => ({ ok: false, status: 401, json: async () => ({}) });
    const outcome401 = await withStubFetch(stub401, () => provider.generate(SAMPLE_REQUEST));
    if (outcome500.kind !== "provider_failure" || outcome500.retryable !== true) {
      fail("FS-3a", `a 503 gave ${JSON.stringify(outcome500)}, expected retryable provider_failure`);
    } else pass("FS-3a", "a 503 is a retryable provider_failure");
    if (outcome401.kind !== "provider_failure" || outcome401.retryable !== false) {
      fail("FS-3b", `a 401 gave ${JSON.stringify(outcome401)}, expected non-retryable provider_failure`);
    } else pass("FS-3b", "a 401 is a non-retryable provider_failure");
  }

  // 4 -- output that fails the panel schema (missing key, empty field, extra
  //      key) is schema_rejected even when the JSON itself parses cleanly.
  {
    const stub = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify({ todaysStrength: "", nextFocus: "x", practiceSuggestion: "x", sessionTakeaway: "x" }) } }],
      }),
    });
    const outcome = await withStubFetch(stub, () => provider.generate(SAMPLE_REQUEST));
    if (outcome.kind !== "schema_rejected") {
      fail("FS-4", `an empty required field gave ${JSON.stringify(outcome)}, expected schema_rejected`);
    } else pass("FS-4", "an empty required panel field is schema_rejected");
  }

  // 5 -- a well-formed, valid response is "ok" with metadata attached and
  //      NO secret-shaped field anywhere in the outcome (defence in depth:
  //      the outcome object itself must never carry a header, key or token).
  {
    const stub = async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        id: "resp_test123",
        model: "gpt-5.6-terra",
        usage: { prompt_tokens: 42, completion_tokens: 7, total_tokens: 49 },
        choices: [{
          message: {
            content: JSON.stringify({
              todaysStrength: "a", nextFocus: "b", practiceSuggestion: "c", sessionTakeaway: "d",
            }),
          },
        }],
      }),
    });
    const outcome = await withStubFetch(stub, () => provider.generate(SAMPLE_REQUEST));
    const serialized = JSON.stringify(outcome).toLowerCase();
    const secretShaped = /authorization|bearer|sk-test-not-real|apikey|api_key/.test(serialized);
    if (outcome.kind !== "ok" || !outcome.metadata || outcome.metadata.requestId !== "resp_test123" || outcome.metadata.usage?.totalTokens !== 49) {
      fail("FS-5", `a valid response gave ${JSON.stringify(outcome)}, expected ok with populated metadata`);
    } else if (secretShaped) {
      fail("FS-5", "the outcome object contains a secret-shaped value");
    } else pass("FS-5", "a valid response is ok with redacted, non-secret metadata (request id + token usage), no key material present");
  }

  console.log("");
  console.log(`Failure-safety static proof: ${5 - (failures > 0 ? 1 : 0)}`);
  if (failures > 0) {
    console.error(`\n${failures} failure(s).`);
    process.exitCode = 1;
  } else {
    console.log("All failure-safety checks passed. Zero network calls were made.");
    process.exitCode = 0;
  }
}

main().catch((error) => {
  console.error(`FAIL FS-UNEXPECTED: ${error instanceof Error ? error.message : "unknown error"}`);
  process.exitCode = 1;
});
