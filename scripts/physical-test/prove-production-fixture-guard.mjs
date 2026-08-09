#!/usr/bin/env node
// =====================================================================
// PROVE THE PRODUCTION FIXTURE GUARD FIRES — both directions
// =====================================================================
//
// Run: node scripts/physical-test/prove-production-fixture-guard.mjs
//      npm run prove:production-fixture-guard
//
// `next.config.ts` refuses a PRODUCTION build carrying
// `NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE=1`. This proves that refusal is REAL
// by running an actual `next build` twice:
//
//   NEGATIVE  fixture mode = "1"    -> the build MUST FAIL, and the failure
//                                      must be OUR authored refusal, not an
//                                      unrelated error that happens to be
//                                      non-zero.
//   POSITIVE  fixture mode = EMPTY  -> the build MUST SUCCEED.
//
// ⚠️ THE POSITIVE LEG IS NOT OPTIONAL. A guard that refuses everything also
// passes the negative leg, and would block the real deployment. Only the two
// legs together show the guard discriminates.
//
// SERVING DISCIPLINE: both builds run with the three AI provider selectors
// OVERWRITTEN by the S-1 neutralising literal, so no build can resolve a real
// provider key. No outward request is made by either leg.
//
// EXIT: 0 both legs as expected · 1 otherwise.
// =====================================================================

import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const NEUTRAL = 'disabled-by-best-coach-serving-discipline-s1'
const REFUSAL_MARKER = 'PRODUCTION BUILD REFUSED'

const legs = []
const record = (state, id, detail) => {
  legs.push({ state, id, detail })
  console.log(`  ${state.padEnd(4)} ${id}  ${detail}`)
}

function build(fixtureMode) {
  const r = spawnSync('npm', ['run', 'build'], {
    cwd: ROOT,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      BEST_COACH_ASSERT_PRODUCTION: '1',
      NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE: fixtureMode,
      // S-1: overwritten, never deleted (@next/env refills a DELETED key
      // from .env.local, but never overrides one that is already present).
      LLM_PROVIDER: NEUTRAL,
      LLM_MODEL: NEUTRAL,
      LLM_API_KEY: NEUTRAL,
      NEXT_TELEMETRY_DISABLED: '1',
    },
  })
  return { status: r.status, output: `${r.stdout ?? ''}${r.stderr ?? ''}` }
}

console.log('--- NEGATIVE LEG: fixture mode = "1" — the build MUST be refused ---')
const neg = build('1')
if (neg.status === 0) {
  record('FAIL', 'G-NEG', 'the production build SUCCEEDED with fixture mode ON. The guard does not fire')
} else if (!neg.output.includes(REFUSAL_MARKER)) {
  // Non-zero for the wrong reason is not a passing guard.
  record('FAIL', 'G-NEG', `the build failed (exit ${neg.status}) but NOT with the authored refusal; the cause is something else`)
} else {
  record('PASS', 'G-NEG', `the production build was REFUSED (exit ${neg.status}) by the authored guard`)
}

console.log('\n--- POSITIVE LEG: fixture mode = EMPTY — the build MUST succeed ---')
const pos = build('')
if (pos.status !== 0) {
  record('FAIL', 'G-POS', `the production build FAILED (exit ${pos.status}) with fixture mode empty; the guard blocks a legitimate deployment`)
} else if (pos.output.includes(REFUSAL_MARKER)) {
  record('FAIL', 'G-POS', 'the build succeeded but still emitted the refusal marker')
} else {
  record('PASS', 'G-POS', 'the production build SUCCEEDED with fixture mode empty')
}

const failed = legs.filter((l) => l.state === 'FAIL')
console.log(`\n=== PRODUCTION FIXTURE GUARD: ${legs.length - failed.length} PASS · ${failed.length} FAIL ===`)
if (failed.length === 0) {
  console.log('The guard DISCRIMINATES: it refuses fixture mode in production and permits a clean build.')
}
process.exit(failed.length === 0 ? 0 : 1)
