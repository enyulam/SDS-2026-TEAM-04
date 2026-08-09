import type { NextConfig } from "next";

// =====================================================================
// PRODUCTION BUILD ASSERTION — the deterministic fixture must never ship
// =====================================================================
//
// `NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE=1` composes the deterministic browser
// fixture: it persists NOTHING to Supabase, signs NOBODY in, and calls NO AI.
// A production deployment carrying it would look like a working system and
// satisfy none of the graded requirements — the failure would surface in
// front of an audience, not in a test.
//
// Hiding that risk behind a checklist item is not a control. This FAILS THE
// BUILD, so the mistake cannot reach a URL.
//
// ⚠️ THE ASSERTION IS PROVEN TO FIRE, not merely written. See
// `scripts/physical-test/prove-production-fixture-guard.mjs`, which runs a
// real `next build` in BOTH directions: fixture-mode ON must FAIL, and
// fixture-mode EMPTY must SUCCEED. A guard that has only ever been observed
// passing is indistinguishable from a guard that never runs.
//
// PRODUCTION is `VERCEL_ENV === "production"`. `BEST_COACH_ASSERT_PRODUCTION`
// exists ONLY so the guard can be exercised locally by that proof; it is
// never set in any deployment, and setting it cannot WEAKEN the guard — it
// can only turn it ON somewhere it would otherwise be off.
// ---------------------------------------------------------------------

const FIXTURE_MODE_VAR = "NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE";
const FIXTURE_MODE_ON = "1";

const isProductionBuild =
  process.env.VERCEL_ENV === "production" ||
  process.env.BEST_COACH_ASSERT_PRODUCTION === "1";

if (isProductionBuild && process.env[FIXTURE_MODE_VAR] === FIXTURE_MODE_ON) {
  throw new Error(
    `PRODUCTION BUILD REFUSED: ${FIXTURE_MODE_VAR}=${FIXTURE_MODE_ON}.\n\n` +
      "The deterministic fixture persists nothing, signs nobody in and calls no AI.\n" +
      "Shipping it to a public URL would present a non-functional system as a working one.\n\n" +
      `Unset ${FIXTURE_MODE_VAR} (or leave it empty) in the Production environment and rebuild.`,
  );
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
