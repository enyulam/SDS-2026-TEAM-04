#!/usr/bin/env node
// =====================================================================
// HOSTED fixture loader — the Step 7F synthetic baseline, on the hosted
// Supabase project ONLY
// =====================================================================
//
// Run: node scripts/fixtures/load-hosted-fixtures.mjs
//      npm run fixtures:hosted
//
// Loads the SAME ratified synthetic fixture the local loader loads —
// `local_fixtures.sql` (3 Auth identities + 25 domain rows, Step 7F) and the
// P1-T09a additive expansion — into the HOSTED project, so the deployed
// system has a governed dataset to demonstrate.
//
// ---------------------------------------------------------------------
// THE GOVERNANCE IT INHERITS, UNWEAKENED (`CLAUDE.md` §11, absolute)
// ---------------------------------------------------------------------
//  * SYNTHETIC IDENTITIES ONLY. The same three `*.fixture@example.test`
//    addresses and the same three caller-supplied deterministic UUIDs. No
//    real name, no real child, no real address, ever.
//  * PASSWORDS COME ONLY FROM AN INTERACTIVE NO-ECHO TTY. There is no
//    environment path, no file path, no argument path, no default and no
//    generated-and-discarded value. Missing input ABORTS the run.
//  * NO PASSWORD IS EVER written to a file, printed, logged, placed in an
//    error, or reported to the operator — in either direction.
//  * Identities are created through the Auth ADMIN API. Nothing is inserted
//    into `auth.users` directly and no `password_hash` is ever supplied.
//
// ---------------------------------------------------------------------
// ⚠️ IT REFUSES ANY TARGET THAT IS NOT THE RATIFIED HOSTED PROJECT
// ---------------------------------------------------------------------
// The project ref below is PINNED IN SOURCE. Every supplied target — the API
// URL and the database connection string — must carry that exact ref, and a
// mismatch aborts BEFORE anything is created. This is what stops a fixture
// load, or a `--reload` teardown, from ever landing on a different project.
//
// It additionally refuses a LOOPBACK target outright: the local database has
// its own loader, and pointing this one at it would bypass that loader's own
// guards.
//
// EXIT: 0 loaded and verified · 1 refused, cancelled or failed.
// =====================================================================

import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'
import { createClient } from '@supabase/supabase-js'
import { promptForSecrets, SecretPromptError } from './secret-prompt.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..', '..')

/**
 * ⚠️ THE PINNED HOSTED PROJECT. Operator-supplied, 2026-08-09. Every target
 * must carry this exact ref or the run aborts before creating anything.
 */
const HOSTED_PROJECT_REF = 'zjukuffiuzkbiblmnuwl'

/** Local-only variables. NEVER committed, NEVER `NEXT_PUBLIC_`, NEVER printed. */
const VAR_URL = 'BEST_COACH_HOSTED_SUPABASE_URL'
const VAR_SECRET = 'BEST_COACH_HOSTED_SECRET_KEY'
const VAR_DB = 'BEST_COACH_HOSTED_DB_URL'

/** The ratified Step 7F identities — synthetic, deterministic, unchanged. */
const IDENTITIES = [
  { key: 'management', label: 'Management', email: 'management.fixture@example.test', authId: 'd0000000-0000-4000-8000-000000000001' },
  { key: 'trainer', label: 'Trainer', email: 'trainer.fixture@example.test', authId: 'd0000000-0000-4000-8000-000000000002' },
  { key: 'parent', label: 'Parent', email: 'parent.fixture@example.test', authId: 'd0000000-0000-4000-8000-000000000003' },
]

class SafeError extends Error {}

const say = (m) => process.stdout.write(`${m}\n`)
const phase = (m) => say(`\n[ ${m} ]`)
const pass = (m) => say(`  PASS  ${m}`)
const info = (m) => say(`  ....  ${m}`)

// ---------------------------------------------------------------------
// Target guards. Every one runs BEFORE anything is created.
// ---------------------------------------------------------------------

function requireVar(name) {
  const raw = process.env[name]
  if (typeof raw !== 'string' || raw.trim() === '') {
    throw new SafeError(
      `${name} must be present and non-blank. Set it in .env.local (never committed, never NEXT_PUBLIC_).`,
    )
  }
  return raw.trim()
}

/** The API URL must be `https://<ref>.supabase.co`, and must not be loopback. */
function assertHostedApiUrl(raw) {
  let url
  try {
    url = new URL(raw)
  } catch {
    throw new SafeError(`${VAR_URL} is not a valid URL.`)
  }
  if (url.protocol !== 'https:') throw new SafeError(`${VAR_URL} must be https.`)
  if (/^(127\.|localhost|\[?::1\]?)/.test(url.hostname)) {
    throw new SafeError(
      `${VAR_URL} points at LOOPBACK. The local database has its own loader; this one refuses it.`,
    )
  }
  const expected = `${HOSTED_PROJECT_REF}.supabase.co`
  if (url.hostname !== expected) {
    throw new SafeError(
      `REFUSED: ${VAR_URL} resolves to "${url.hostname}", not the pinned project "${expected}". Nothing was created.`,
    )
  }
  return url.origin
}

/**
 * The connection string must carry the pinned ref. Supabase pooled strings
 * carry it in the USERNAME (`postgres.<ref>`); direct strings carry it in the
 * HOST (`db.<ref>.supabase.co`). Both forms are accepted, anything else is not.
 *
 * The string itself is never printed — only the decision.
 */
function assertHostedDbUrl(raw) {
  let url
  try {
    url = new URL(raw)
  } catch {
    throw new SafeError(`${VAR_DB} is not a valid connection URL.`)
  }
  if (!/^postgres(ql)?:$/.test(url.protocol)) {
    throw new SafeError(`${VAR_DB} must be a postgres:// connection string.`)
  }
  if (/^(127\.|localhost|\[?::1\]?)/.test(url.hostname)) {
    throw new SafeError(`${VAR_DB} points at LOOPBACK. Refused — the local database has its own loader.`)
  }
  const inUser = decodeURIComponent(url.username).includes(HOSTED_PROJECT_REF)
  const inHost = url.hostname.includes(HOSTED_PROJECT_REF)
  if (!inUser && !inHost) {
    throw new SafeError(
      `REFUSED: ${VAR_DB} does not carry the pinned project ref "${HOSTED_PROJECT_REF}" ` +
        'in either its username or its host. Nothing was created.',
    )
  }
  return { pooled: url.port === '6543', where: inUser ? 'username' : 'host' }
}

// ---------------------------------------------------------------------
// SQL channel
// ---------------------------------------------------------------------

function connect(dbUrl) {
  return postgres(dbUrl, {
    prepare: false,
    max: 1,
    idle_timeout: 20,
    connect_timeout: 15,
    onnotice: () => {},
    debug: false,
  })
}

/**
 * Run a committed fixture file as ONE multi-statement request, which is what
 * keeps its own transaction control and its `DO $$ ... $$` assertion blocks
 * behaving exactly as they do under psql locally.
 */
async function runSqlFile(sql, relativePath, replacements = {}) {
  let text = readFileSync(join(REPO_ROOT, 'scripts', 'fixtures', relativePath), 'utf8')
  // The local loader passes psql `-v` variables; postgres.js has no psql
  // variable layer, so the two switches the fixture exposes are substituted
  // here as literal booleans. No user or credential value is ever substituted.
  for (const [name, value] of Object.entries(replacements)) {
    if (!/^(true|false)$/.test(value)) throw new SafeError(`refusing to substitute a non-boolean for :${name}`)
    text = text.split(`:'${name}'`).join(`'${value}'`).split(`:${name}`).join(value)
  }
  await sql.unsafe(text)
}

// ---------------------------------------------------------------------
// main
// ---------------------------------------------------------------------

async function main() {
  const reload = process.argv.includes('--reload')

  phase('Target guards — every one runs BEFORE anything is created')
  const apiUrl = assertHostedApiUrl(requireVar(VAR_URL))
  const secretKey = requireVar(VAR_SECRET)
  const dbUrl = requireVar(VAR_DB)
  const db = assertHostedDbUrl(dbUrl)
  pass(`API target is the pinned project ${HOSTED_PROJECT_REF}.supabase.co`)
  pass(`database target carries the pinned ref in its ${db.where}`)
  if (db.pooled) {
    info('the connection is the TRANSACTION pooler (6543); fixture DML is fine on it')
  }
  if (secretKey.startsWith('sb_publishable_')) {
    throw new SafeError(`${VAR_SECRET} is a PUBLISHABLE key. The admin API needs the secret key.`)
  }

  const admin = createClient(apiUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })

  phase('Preflight — the project must be empty of fixture rows unless --reload')
  const sql = connect(dbUrl)
  try {
    const [{ count: migrations }] = await sql`
      SELECT count(*)::int AS count FROM supabase_migrations.schema_migrations`
    if (migrations === 0) {
      throw new SafeError('NO MIGRATIONS are applied to this project. Apply the 17 migrations first (step d).')
    }
    pass(`${migrations} migration(s) are applied`)

    const [{ count: existing }] = await sql`
      SELECT count(*)::int AS count FROM public.accounts
       WHERE id = 'c0000000-0000-4000-8000-000000000001'::uuid`
    if (existing > 0 && !reload) {
      throw new SafeError('Fixture rows already exist. Re-run with --reload to tear down and reload.')
    }

    phase('Passwords — interactive, no-echo, no alternative source')
    say('  Three passwords, one per synthetic identity. Nothing is echoed.')
    say('  They are never stored, logged, or written anywhere.')
    const secrets = await promptForSecrets(IDENTITIES.map((i) => [i.key, i.label]))

    if (reload) {
      phase('Teardown')
      await runSqlFile(sql, 'local_fixtures.sql', { do_cleanup: 'true', do_load: 'false' })
      pass('domain fixture rows removed')
      for (const identity of IDENTITIES) {
        const { error } = await admin.auth.admin.deleteUser(identity.authId)
        if (error && !/not.?found/i.test(error.message)) {
          throw new SafeError(`could not remove the ${identity.label} identity`)
        }
      }
      pass('synthetic Auth identities removed')
    }

    phase('Synthetic Auth identities — created through the ADMIN API')
    for (const identity of IDENTITIES) {
      const { error } = await admin.auth.admin.createUser({
        // The caller-supplied deterministic UUID: the fixture SQL writes it
        // INLINE into accounts.auth_user_id and then asserts the link exists.
        id: identity.authId,
        email: identity.email,
        password: secrets.get(identity.key),
        email_confirm: true,
      })
      if (error) {
        // The error's message could echo request detail; only the role is named.
        throw new SafeError(`could not create the ${identity.label} identity.`)
      }
      pass(`${identity.label} identity created (${identity.email})`)
    }
    secrets.clear()

    phase('Domain fixtures')
    await runSqlFile(sql, 'local_fixtures.sql', { do_cleanup: 'false', do_load: 'true' })
    pass('Step 7F baseline loaded (25 domain rows)')
    await runSqlFile(sql, 'local_fixtures_expansion.sql')
    pass('P1-T09a additive expansion loaded')

    phase('Verification — the committed verifier, unmodified')
    await runSqlFile(sql, 'verify-local-fixtures.sql')
    pass('every fixture assertion passed on the hosted project')

    const [census] = await sql`
      SELECT (SELECT count(*)::int FROM public.accounts) AS accounts,
             (SELECT count(*)::int FROM public.students) AS students,
             (SELECT count(*)::int FROM public.observations) AS observations,
             (SELECT count(*)::int FROM public.reports) AS reports,
             (SELECT count(*)::int FROM public.audit_events) AS audit_events`
    phase('Census')
    say(`  accounts=${census.accounts} students=${census.students} observations=${census.observations} ` +
      `reports=${census.reports} audit_events=${census.audit_events}`)
  } finally {
    await sql.end({ timeout: 5 })
  }

  say('\nHOSTED FIXTURES LOADED. No password was written, printed or returned.')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    // Only authored messages reach the operator. A driver or API error object
    // could carry a connection string or request detail and is never surfaced.
    const authored = error instanceof SafeError || error instanceof SecretPromptError
    process.stderr.write(`\nREFUSED / FAILED: ${authored ? error.message : 'an unexpected error occurred.'}\n`)
    process.exit(1)
  })
