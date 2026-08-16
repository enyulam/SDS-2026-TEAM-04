/**
 * ⛔ THE CREDENTIAL DETECTOR — ONE DEFINITION, TWO CONSUMERS.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * ⚠️ EXTRACTED 2026-08-17, NOT REWRITTEN. Operator ruling, on the serving
 * flake: *"capture the child's stderr to a scratch file, scan it for
 * credential shapes with THE EXISTING DETECTOR."*
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ▶ **The alternative was a second copy of these patterns**, which is the
 * divergence this project rules against — and here it would be worse than
 * cosmetic: a credential detector that drifts from the canonical one is a
 * silent hole, green on both sides while one of them has stopped matching.
 *
 * ⛔ EVERY LINE BELOW MOVED VERBATIM from `prove-no-secrets.mjs`, which now
 * imports it. **That script's own positive controls are what prove the
 * extraction faithful** — its planted `sb_secret_…` value, its blob-scan
 * control, and its one-character boundary control all now exercise THIS
 * module. If the move broke anything, `prove:no-secrets` goes red.
 *
 * ⛔ NO VALUE IS EVER RETURNED, PRINTED OR SERIALIZED. `scanText` reports a
 * KIND and a CLASS and never the matched text (`CLAUDE.md` §11).
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const SHAPES = [
  ["JWT (three dot-separated base64url segments)", /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  ["Supabase secret key", /\bsb_secret_[A-Za-z0-9_-]{20,}/],
  ["Supabase publishable key", /\bsb_publishable_[A-Za-z0-9_-]{20,}/],
  ["OpenAI / Anthropic style key", /\bsk-(ant-)?[A-Za-z0-9_-]{24,}/],
  ["GitHub personal access token", /\b(ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{22,})/],
  ["AWS access key id", /\bAKIA[0-9A-Z]{16}\b/],
  ["Postgres URL carrying a password", /\bpostgres(ql)?:\/\/[^\s:/@]+:[^\s@]{6,}@/],
  ["PEM private key block", /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/],
  ["Supabase legacy service_role key literal", /"?service_role"?\s*[:=]\s*["'][A-Za-z0-9._-]{30,}["']/],
];

/**
 * ⚠️ `.env.example` is TRACKED ON PURPOSE and holds placeholders. It is
 * excluded from SHAPE matching only — exact-containment against the live
 * values still runs on it, because a real value pasted into the example
 * file is precisely the mistake this gate exists to catch.
 */
export const SHAPE_EXEMPT = new Set([
  ".env.example",
  "scripts/publication/prove-no-secrets.mjs",
  "scripts/publication/credential-shapes.mjs",
]);

export const BENIGN_LITERALS = [
  "sb_publishable_synthetic_shape_fixture", // run-runtime-profile.mjs:53 — adjudicated
  "sb_secret_synthetic_shape_fixture", // run-runtime-profile.mjs:54 — adjudicated
];

/**
 * ⛔ THE BOUNDARY IS NOT DECORATION — ITS CONTROL CAUGHT A REAL DEFECT.
 *
 * The first implementation was `text.split(lit).join(token)`, and the
 * one-character control failed immediately: `…fixtureX` still contains
 * `…fixture` as a substring, so a REAL key that merely BEGAN with the
 * adjudicated string would have been silently suppressed. ▶ **An exact-string
 * exemption implemented by substring replacement is a PREFIX rule wearing an
 * exact-string label** — precisely the kind of quiet widening this whole
 * instrument exists to refuse.
 */
export const BENIGN_RE = BENIGN_LITERALS.map(
  (lit) => new RegExp(`(?<![A-Za-z0-9_-])${lit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-z0-9_-])`, "g"),
);

export const neutralize = (text) => {
  let out = text;
  for (const re of BENIGN_RE) out = out.replace(re, "<ADJUDICATED-BENIGN-LITERAL>");
  return out;
};

export const IDENTIFIER_VARS = new Set([
  "BEST_COACH_HOSTED_PROJECT_REF", // 20-char ref; the subdomain of a public URL
  "NEXT_PUBLIC_SUPABASE_URL", // NEXT_PUBLIC_* is browser-visible by design
  "BEST_COACH_HOSTED_SUPABASE_URL", // likewise a public https://<ref>.supabase.co
]);

export function loadLiveSecrets(root) {
  const p = join(root, ".env.local");
  if (!existsSync(p)) return [];
  const out = [];
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = /^([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line.trim());
    if (!m) continue;
    const name = m[1];
    const value = m[2].replace(/^["']|["']$/g, "");
    if (value.length >= 20) out.push({ name, value });
  }
  return out;
}

/**
 * Build the scanner over a set of live values.
 *
 * ⛔ Returns `{ kind, cls }` records and NEVER the matched text.
 */
export function makeScanText(live) {
  return function scanText(text, path) {
    const hits = [];
    for (const { name, value } of live) {
      if (text.includes(value)) {
        hits.push({
          kind: `LIVE VALUE of ${name}`,
          cls: IDENTIFIER_VARS.has(name) ? "IDENTIFIER" : "CREDENTIAL",
        });
      }
    }
    if (!SHAPE_EXEMPT.has(path)) {
      const scannable = neutralize(text);
      for (const [label, re] of SHAPES) if (re.test(scannable)) hits.push({ kind: label, cls: "CREDENTIAL" });
    }
    return hits;
  };
}
