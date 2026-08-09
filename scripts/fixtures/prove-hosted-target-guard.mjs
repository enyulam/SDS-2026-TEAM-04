#!/usr/bin/env node
// =====================================================================
// PROVE THE HOSTED TARGET GUARD — the deny fires, and the detector can fire
// =====================================================================
//
// Run: node --env-file=.env.local scripts/fixtures/prove-hosted-target-guard.mjs
//
// Asserts two properties of `hosted-target-guard.mjs`:
//
//   1. HARD DENY. No tool can be pointed at the frozen demonstration project
//      by any route — the env var, a smuggled connection string, or a
//      case-variant spelling of either.
//   2. FAIL CLOSED. An absent, blank or malformed expected ref refuses
//      rather than defaulting to anything.
//
// ---------------------------------------------------------------------
// ⚠️ THE PREDICATE, AND WHY IT IS NOT A TEXT MATCH
// ---------------------------------------------------------------------
// The first version of this check asserted that the output CONTAINED
// "REFUSED" or "HARD DENY". That predicate is wrong in both directions. It
// reported FAILURE for three cases that had refused correctly but worded the
// refusal differently — and, far worse, it would have reported SUCCESS for
// any tool that printed the word "REFUSED" while going on to connect anyway.
// It tested the wording of a message, not the behaviour of a guard.
//
// This is the SEVENTH instance of that class in this project (the Operator's
// count; see the BUILD_NOTES entry for the prior six). Every one of them was
// an assertion that could not fail.
//
// The predicate here is behavioural:
//
//      REFUSED  ==  nonzero exit  AND  no server contact
//
// Both halves are required. A nonzero exit alone could mean the tool reached
// the database and failed afterwards; absence of contact alone could mean the
// tool silently did nothing and exited 0.
//
// ---------------------------------------------------------------------
// ⚠️ NON-VACUITY
// ---------------------------------------------------------------------
// A contact detector that has never seen contact is not evidence. The final
// control runs the real dev target and REQUIRES the detector to FIRE. If that
// control does not observe contact, every refusal above is unproven and this
// harness exits nonzero — because at that point "no contact" would be
// indistinguishable from "the detector is broken".
//
// EXIT: 0 all controls hold · 1 any control fails.
// =====================================================================

import { spawnSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..', '..')

const FROZEN = 'zjukuffiuzkbiblmnuwl'
const FROZEN_UPPER = FROZEN.toUpperCase()

/** A syntactically valid target that resolves to the frozen project. */
const FROZEN_DB = `postgresql://postgres.${FROZEN}:pw@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`
const FROZEN_DB_UPPER = `postgresql://postgres.${FROZEN_UPPER}:pw@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`
const FROZEN_API = `https://${FROZEN}.supabase.co`

const TOOLS = {
  preflight: 'scripts/fixtures/hosted-preflight.mjs',
  push: 'scripts/fixtures/hosted-db-push.mjs',
  probe: 'scripts/fixtures/hosted-state-probe.mjs',
  loader: 'scripts/fixtures/load-hosted-fixtures.mjs',
  assessment: 'scripts/physical-test/hosted-setup-assessment.mjs',
}

/**
 * Evidence that the tool actually reached a database or the Supabase API.
 * Each string is emitted only AFTER a successful round trip.
 */
const CONTACT_MARKERS = [
  'Identity of the server actually reached',
  'Catalogue census',
  'PostgreSQL 1',
  'migration(s) are applied',
  'Auth identities',
  'Connecting to remote database',
  'Remote database is up to date',
  'Would push these migrations',
  'DOMAIN FIXTURES',
  'supabase_migrations.schema_migrations',
]

const say = (m) => process.stdout.write(`${m}\n`)

/** Never render a value that could carry a credential. */
function redact(text) {
  const secrets = [
    process.env.BEST_COACH_HOSTED_DB_URL,
    process.env.BEST_COACH_HOSTED_SECRET_KEY,
    process.env.LLM_API_KEY,
    FROZEN_DB,
    FROZEN_DB_UPPER,
  ].filter((s) => typeof s === 'string' && s.length > 0)
  let out = text
  for (const s of secrets) out = out.split(s).join('[REDACTED]')
  return out
}

function run(toolKey, env) {
  const r = spawnSync(process.execPath, [join(REPO_ROOT, TOOLS[toolKey])], {
    env: { ...process.env, ...env },
    encoding: 'utf8',
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 120000,
  })
  const output = `${r.stdout ?? ''}${r.stderr ?? ''}`
  return {
    code: r.status,
    output,
    contacted: CONTACT_MARKERS.filter((m) => output.includes(m)),
  }
}

/** Strip every hosted variable, so a case controls exactly what it sets. */
const CLEAN = {
  BEST_COACH_HOSTED_PROJECT_REF: undefined,
  BEST_COACH_HOSTED_DB_URL: undefined,
  BEST_COACH_HOSTED_SUPABASE_URL: undefined,
  BEST_COACH_HOSTED_SECRET_KEY: undefined,
  BEST_COACH_HOSTED_PUBLISHABLE_KEY: undefined,
}

/** Enough non-target variables for each tool to reach its target guard. */
const CREDS = {
  BEST_COACH_HOSTED_SECRET_KEY: 'sb_secret_placeholder',
  BEST_COACH_HOSTED_PUBLISHABLE_KEY: 'sb_publishable_placeholder',
}

let pass = 0
let fail = 0

function mustRefuse(label, toolKey, env) {
  const r = run(toolKey, { ...CLEAN, ...env })
  const refused = r.code !== 0 && r.contacted.length === 0
  if (refused) {
    say(`  ✅ REFUSED   exit=${r.code}  no-contact   ${label}`)
    pass += 1
    return
  }
  fail += 1
  say(`  ❌ NOT REFUSED  exit=${r.code}  contact=[${r.contacted.join(', ') || 'none'}]   ${label}`)
  say(redact(r.output).split('\n').slice(0, 8).map((l) => `        ${l}`).join('\n'))
}

say('\n=== A. The frozen ref requested explicitly, on every tool ===')
for (const key of Object.keys(TOOLS)) {
  mustRefuse(`${key} — env ref = frozen`, key, {
    ...CREDS,
    BEST_COACH_HOSTED_PROJECT_REF: FROZEN,
    BEST_COACH_HOSTED_DB_URL: FROZEN_DB,
    BEST_COACH_HOSTED_SUPABASE_URL: FROZEN_API,
  })
}

say('\n=== B. A permitted ref, with the frozen ref smuggled into the target ===')
const DEV_REF_SHAPED = 'aaaaaaaaaaaaaaaaaaaa'
for (const key of ['preflight', 'push', 'probe', 'loader']) {
  mustRefuse(`${key} — ref permitted, DB URL carries frozen`, key, {
    ...CREDS,
    BEST_COACH_HOSTED_PROJECT_REF: DEV_REF_SHAPED,
    BEST_COACH_HOSTED_DB_URL: FROZEN_DB,
    BEST_COACH_HOSTED_SUPABASE_URL: `https://${DEV_REF_SHAPED}.supabase.co`,
  })
}
mustRefuse('assessment — ref permitted, API URL carries frozen', 'assessment', {
  ...CREDS,
  BEST_COACH_HOSTED_PROJECT_REF: DEV_REF_SHAPED,
  BEST_COACH_HOSTED_SUPABASE_URL: FROZEN_API,
})

say('\n=== C. Case-variant spellings (DNS is case-insensitive; the deny must be too) ===')
mustRefuse('preflight — UPPERCASE frozen ref in env', 'preflight', {
  BEST_COACH_HOSTED_PROJECT_REF: FROZEN_UPPER,
  BEST_COACH_HOSTED_DB_URL: FROZEN_DB,
})
mustRefuse('preflight — UPPERCASE frozen ref in DB URL', 'preflight', {
  BEST_COACH_HOSTED_PROJECT_REF: DEV_REF_SHAPED,
  BEST_COACH_HOSTED_DB_URL: FROZEN_DB_UPPER,
})

say('\n=== D. Fail closed — no default target ===')
mustRefuse('preflight — expected ref ABSENT', 'preflight', { BEST_COACH_HOSTED_DB_URL: FROZEN_DB })
mustRefuse('preflight — expected ref BLANK', 'preflight', {
  BEST_COACH_HOSTED_PROJECT_REF: '   ',
  BEST_COACH_HOSTED_DB_URL: FROZEN_DB,
})
mustRefuse('preflight — expected ref MALFORMED', 'preflight', {
  BEST_COACH_HOSTED_PROJECT_REF: 'not-a-ref',
  BEST_COACH_HOSTED_DB_URL: FROZEN_DB,
})

say('\n=== E. NON-VACUITY — the contact detector must be able to fire ===')
say('     Without this, every "no contact" above could mean a broken detector.')
const realRef = process.env.BEST_COACH_HOSTED_PROJECT_REF
const realDb = process.env.BEST_COACH_HOSTED_DB_URL
if (!realRef || !realDb) {
  say('  ❌ CANNOT PROVE — run with --env-file=.env.local so a real target is available.')
  fail += 1
} else if (realDb.toLowerCase().includes(FROZEN)) {
  say('  ❌ REFUSING TO RUN — the configured target is the frozen project.')
  fail += 1
} else {
  const r = run('preflight', {
    BEST_COACH_HOSTED_PROJECT_REF: realRef,
    BEST_COACH_HOSTED_DB_URL: realDb,
  })
  if (r.contacted.length > 0) {
    say(`  ✅ DETECTOR FIRES   observed: ${r.contacted.slice(0, 3).join(', ')}`)
    say('     So "no contact" in A–D is a measurement, not an artefact.')
    pass += 1
  } else {
    say('  ❌ DETECTOR NEVER FIRED against a real target — A–D are UNPROVEN.')
    say(redact(r.output).split('\n').slice(0, 8).map((l) => `        ${l}`).join('\n'))
    fail += 1
  }
}

say(`\nPASS=${pass}  FAIL=${fail}`)
process.exit(fail === 0 ? 0 : 1)
