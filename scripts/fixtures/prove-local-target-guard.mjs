// =====================================================================
// PROOF — the local target guard denies the frozen demonstration project
// =====================================================================
//
// The twin of `prove-hosted-target-guard.mjs`. Proves BOTH properties:
//
//   1. the HARD DENY fires on the frozen project id, in every shape it can
//      arrive in, and cannot be reached around;
//   2. the POSITIVE PIN fails closed on absent, blank and malformed input.
//
// It touches no database, no container, no network and no file. It only
// calls the guard with values and asserts the outcome.
//
// Run: node scripts/fixtures/prove-local-target-guard.mjs
// =====================================================================

import { readFileSync } from 'node:fs'

import {
  LocalTargetRefused,
  VAR_LOCAL_PROJECT_ID,
  assertConfigProjectId,
  denyFrozenLocal,
  localDbContainer,
  resolveLocalProjectId,
  resolveLocalTarget,
} from './local-target-guard.mjs'

let passed = 0
let failed = 0

function refuses(label, fn, mustMention) {
  try {
    fn()
  } catch (error) {
    if (!(error instanceof LocalTargetRefused)) {
      console.log(`  FAIL  ${label} — threw ${error?.constructor?.name}, not LocalTargetRefused`)
      failed += 1
      return
    }
    if (mustMention && !error.message.includes(mustMention)) {
      console.log(`  FAIL  ${label} — refused, but the message never says "${mustMention}"`)
      failed += 1
      return
    }
    console.log(`  PASS  ${label}`)
    passed += 1
    return
  }
  console.log(`  FAIL  ${label} — DID NOT REFUSE`)
  failed += 1
}

function allows(label, fn, expected) {
  try {
    const actual = fn()
    if (expected !== undefined && actual !== expected) {
      console.log(`  FAIL  ${label} — got "${actual}", expected "${expected}"`)
      failed += 1
      return
    }
    console.log(`  PASS  ${label}`)
    passed += 1
  } catch (error) {
    console.log(`  FAIL  ${label} — refused when it should have allowed: ${error.message}`)
    failed += 1
  }
}

const saved = process.env[VAR_LOCAL_PROJECT_ID]
const withVar = (value, fn) => () => {
  if (value === undefined) delete process.env[VAR_LOCAL_PROJECT_ID]
  else process.env[VAR_LOCAL_PROJECT_ID] = value
  return fn()
}

console.log('\n1. HARD DENY — the frozen demonstration project, in every shape\n')

refuses('bare frozen project id', () => denyFrozenLocal('best-coach-mvp', 'test'), 'HARD DENY')
refuses('frozen db container name', () => denyFrozenLocal('supabase_db_best-coach-mvp', 'test'), 'HARD DENY')
refuses('frozen kong container name', () => denyFrozenLocal('supabase_kong_best-coach-mvp', 'test'), 'HARD DENY')
refuses('UPPERCASE frozen id', () => denyFrozenLocal('BEST-COACH-MVP', 'test'), 'HARD DENY')
refuses('MiXeD case frozen id', () => denyFrozenLocal('Best-Coach-MVP', 'test'), 'HARD DENY')
refuses('frozen id embedded in a longer string', () => denyFrozenLocal('x_best-coach-mvp_y', 'test'), 'HARD DENY')
refuses('a sibling container never seen before', () => denyFrozenLocal('supabase_vector_best-coach-mvp', 'test'), 'HARD DENY')

console.log('\n2. HARD DENY — reached through every public entry point\n')

refuses('via the environment variable', withVar('best-coach-mvp', resolveLocalProjectId), 'HARD DENY')
refuses('via resolveLocalTarget()', withVar('best-coach-mvp', resolveLocalTarget), 'HARD DENY')
refuses('via localDbContainer()', () => localDbContainer('best-coach-mvp'), 'HARD DENY')
refuses('via a drifted config.toml', () => assertConfigProjectId('best-coach-mvp', 'best-coach-dev'), 'HARD DENY')
refuses(
  'even when config.toml AND the pin both say frozen',
  () => assertConfigProjectId('best-coach-mvp', 'best-coach-mvp'),
  'HARD DENY',
)

console.log('\n3. POSITIVE PIN — fails closed\n')

refuses('absent variable', withVar(undefined, resolveLocalProjectId), 'must be present')
refuses('blank variable', withVar('', resolveLocalProjectId), 'must be present')
refuses('whitespace-only variable', withVar('   ', resolveLocalProjectId), 'must be present')
refuses('malformed — uppercase', withVar('Best-Coach-Dev', resolveLocalProjectId), 'malformed')
refuses('malformed — leading hyphen', withVar('-best-coach-dev', resolveLocalProjectId), 'malformed')
refuses('malformed — space inside', withVar('best coach dev', resolveLocalProjectId), 'malformed')
refuses('malformed — shell metacharacter', withVar('dev;rm -rf /', resolveLocalProjectId), 'malformed')
refuses('malformed — single character', withVar('d', resolveLocalProjectId), 'malformed')
refuses('config.toml disagrees with the pin', () => assertConfigProjectId('some-other-stack', 'best-coach-dev'), 'expects')
refuses('config.toml has no project_id at all', () => assertConfigProjectId(null, 'best-coach-dev'), 'expects')

console.log('\n4. THE LEGITIMATE PATH still works\n')

allows('valid id resolves', withVar('best-coach-dev', resolveLocalProjectId), 'best-coach-dev')
allows('container is DERIVED, not literal', () => localDbContainer('best-coach-dev'), 'supabase_db_best-coach-dev')
allows('matching config.toml passes', () => assertConfigProjectId('best-coach-dev', 'best-coach-dev'), 'best-coach-dev')
allows(
  'resolveLocalTarget returns both',
  withVar('best-coach-dev', () => JSON.stringify(resolveLocalTarget())),
  '{"projectId":"best-coach-dev","dbContainer":"supabase_db_best-coach-dev"}',
)

console.log('\n5. ORDER — deny beats shape, so the caller is told the real problem\n')

refuses(
  'a frozen id that is ALSO malformed reports the DENY, not the shape',
  withVar('BEST-COACH-MVP', resolveLocalProjectId),
  'HARD DENY',
)

console.log('\n6. NO DRIFT between the script guard and the production guard\n')

// ⚠️ THE GUARD EXISTS ONCE PER RUNTIME, AND THAT IS STATED RATHER THAN HIDDEN.
// Scripts run under plain Node and cannot import TypeScript; the production
// module ships inside the Next.js server bundle and must not depend on
// `scripts/`, which is not deployed. So there are two files.
//
// They cannot silently diverge, because this leg reads BOTH as text and
// asserts the two load-bearing values are character-identical. A future edit
// that weakens one and forgets the other FAILS HERE.
{
  const scriptSrc = readFileSync(new URL('./local-target-guard.mjs', import.meta.url), 'utf8')
  const prodSrc = readFileSync(new URL('../../server/platform/local-target.ts', import.meta.url), 'utf8')

  const grab = (src, name, re) => {
    const m = re.exec(src)
    if (!m) throw new Error(`could not read ${name}`)
    return m[1]
  }
  const pairs = [
    [
      'the frozen demonstration project id',
      /const FROZEN_DEMO_PROJECT_ID = ["']([^"']+)["']/,
    ],
    ['the project-id shape pattern', /const PROJECT_ID_SHAPE = \/(.+?)\/;?\s*$/m],
    ['the environment variable name', /VAR_LOCAL_PROJECT_ID = ["']([^"']+)["']/],
  ]
  for (const [label, re] of pairs) {
    const a = grab(scriptSrc, `${label} (script)`, re)
    const b = grab(prodSrc, `${label} (production)`, re)
    if (a === b) {
      console.log(`  PASS  ${label} is identical in both guards — "${a}"`)
      passed += 1
    } else {
      console.log(`  FAIL  ${label} DRIFTED — script "${a}" vs production "${b}"`)
      failed += 1
    }
  }

  // The production guard must also still be the ONLY place production code
  // can obtain a local container name.
  const literal = /["'`]supabase_db_[a-z0-9]/.test(prodSrc.replace(/^\s*[/*].*$/gm, ''))
  if (literal) {
    console.log('  FAIL  the production guard carries a literal container name outside its comments')
    failed += 1
  } else {
    console.log('  PASS  the production guard derives every container name; no literal outside comments')
    passed += 1
  }
}

if (saved === undefined) delete process.env[VAR_LOCAL_PROJECT_ID]
else process.env[VAR_LOCAL_PROJECT_ID] = saved

console.log(`\n${'='.repeat(60)}`)
console.log(`  ${passed} passed · ${failed} failed`)
console.log(`${'='.repeat(60)}\n`)
process.exit(failed === 0 ? 0 : 1)
