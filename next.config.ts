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

// =====================================================================
// P2-6R — THE SERVER-ACTION BODY CEILING FOR LESSON-MATERIAL UPLOADS
// =====================================================================
//
// ⛔ WHY THIS EXISTS AT ALL. The Operator ruled the material upload transport
// to be a SERVER-ACTION RELAY rather than a browser-direct upload:
//
//   *"I scoped that exception to `evidence-upload.ts` SPECIFICALLY, and route
//    (a) needs precisely the widening I refused. The guard firing is the guard
//    working."*
//
// `T-P44` admits exactly one client module to `lib/supabase/browser`, and a
// second one would have needed a fresh ruling. ▶ The relay needs NO widening:
// the storage policy is `FOR INSERT TO authenticated`, and ADR-3 records that
// **the database role follows the CREDENTIAL, not the code location** — so a
// server action carrying the caller's own cookies is the same `authenticated`
// principal the policy already gates, and
// `app_management_may_attach_material` re-derives live authority on the INSERT.
//
// ⚠️ THE FIGURE IS MEASURED, NOT GUESSED. `bodySizeLimit` defaults to 1 MB,
// which refuses every material. The ceiling is 25 MiB = 26,214,400 bytes, and a
// Server Action carries the file inside a multipart envelope. Built at its
// WORST CASE — a 255-byte filename, a 200-char display name, the longest ruled
// MIME type and Next's `$ACTION_ID` field — that envelope measures
// **1,070 bytes**. So 25 MiB actually requires 26,215,470.
//
//   26,214,400  the ruled ceiling (enforced in THREE places server-side: the
//               `CHECK` constraint, the bucket's own `file_size_limit`, and
//               `material_attach_confirm` reading the STORED object)
//   +    4,096  headroom — 3.8x the measured envelope, 0.016% above the ceiling
//   ==========
//   26,218,496
//
// ⛔ IT IS NOT ROUNDED UP TO 26mb OR 32mb. A limit generous enough to pass a
// file the database will then refuse moves the refusal from a clean, immediate
// framework rejection to a 25 MiB upload that fails at the end — and the
// Operator's instruction was *"what 25 MiB actually requires and no more"*.
//
// ⚠️ THIS IS NOT A SECOND SIZE GATE, and must never be treated as one. It is a
// TRANSPORT ceiling. The authoritative refusal is the database's, in all three
// of the places above; this only stops a body that could not possibly be valid
// from being buffered at all.
const MATERIAL_CEILING_BYTES = 25 * 1024 * 1024;
const MULTIPART_HEADROOM_BYTES = 4096;

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: MATERIAL_CEILING_BYTES + MULTIPART_HEADROOM_BYTES,
    },
  },
};

export default nextConfig;
