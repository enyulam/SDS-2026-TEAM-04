#!/usr/bin/env node
// =====================================================================
// PROVE THE TRUSTED-DRAFT TRANSPORT SELECTION FAILS CLOSED
// =====================================================================
//
// Run: npm run prove:trusted-transport-selection
//
// The Operator's ruling requires selection between the local and hosted
// trusted-draft transports to be "explicit and server-only, and must fail
// closed on an unknown or absent value".
//
// Fail-closed is easy to claim and easy to get wrong: a `?? "local"` default
// anywhere in the chain silently converts a MISSING setting into a WRONG
// choice, and the symptom appears at the last step of the AI feature rather
// than at configuration time. So this measures every rejection case, not just
// the two accepted ones.
//
// ⚠️ THE ACCEPTING CASES ARE PART OF THE PROOF. A resolver that threw on
// everything would pass all five rejection legs while breaking the product
// entirely. Only both directions together show it DISCRIMINATES.
//
// `--conditions=react-server` is how `server-only` resolves to its own no-op
// build. That is the package's documented mechanism, so neither the module
// under test nor the shared alias loader is modified to accommodate a test.
//
// EXIT: 0 all legs as expected · 1 otherwise.
// =====================================================================

const VAR = 'BEST_COACH_TRUSTED_DRAFT_TRANSPORT'

const mod = await import('@/server/modules/ai-drafting/trusted-store-transport')

/** [label, value, expected] — `undefined` means the variable is unset. */
const CASES = [
  ['ABSENT', undefined, 'THREW'],
  ['BLANK', '', 'THREW'],
  ['WRONG CASE', 'Local', 'THREW'],
  ['UPPER', 'HOSTED', 'THREW'],
  ['UNKNOWN', 'staging', 'THREW'],
  // Whitespace is NOT trimmed into acceptance: a padded value is a
  // configuration mistake and is refused rather than guessed at.
  ['PADDED', ' local ', 'THREW'],
  ['local', 'local', 'local'],
  ['hosted', 'hosted', 'hosted'],
]

let failures = 0
for (const [label, value, expected] of CASES) {
  if (value === undefined) delete process.env[VAR]
  else process.env[VAR] = value

  let got
  try {
    got = mod.requireTrustedTransport()
  } catch {
    got = 'THREW'
  }

  const ok = got === expected
  if (!ok) failures += 1
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(11)} -> ${String(got).padEnd(7)} (expected ${expected})`)
}

const rejected = CASES.filter(([, , e]) => e === 'THREW').length
const accepted = CASES.length - rejected

console.log(`\n=== TRANSPORT SELECTION: ${CASES.length - failures} PASS · ${failures} FAIL ===`)
if (failures === 0) {
  console.log(
    `FAIL-CLOSED PROVEN and DISCRIMINATING: ${rejected} rejection case(s) throw, ` +
      `${accepted} exact literal(s) resolve. There is no default.`,
  )
}
process.exit(failures === 0 ? 0 : 1)
