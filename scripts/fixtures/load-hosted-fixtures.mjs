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

import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'
import { createClient } from '@supabase/supabase-js'
import { promptForSecrets, SecretPromptError } from './secret-prompt.mjs'
import {
  TargetRefused,
  assertHostedApiUrl,
  assertHostedDbUrl,
  requireVar,
  resolveHostedProjectRef,
} from './hosted-target-guard.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..', '..')

/**
 * ⚠️ THE EXPECTED HOSTED PROJECT, resolved from the environment and guarded by
 * `hosted-target-guard.mjs`: the frozen demonstration project is denied
 * unconditionally, and a missing or malformed ref REFUSES rather than defaults.
 * Every target — the API URL and the database connection string — must carry
 * the resolved ref or the run aborts before creating anything.
 */
// Resolved at module load so nothing else in this file can run first. The
// refusal is rendered here rather than thrown, because a top-level throw
// escapes main()'s handler and would surface a stack trace instead of the
// refusal — correct behaviour, unreadable presentation.
let HOSTED_PROJECT_REF
try {
  HOSTED_PROJECT_REF = resolveHostedProjectRef()
} catch (error) {
  if (!(error instanceof TargetRefused)) throw error
  process.stderr.write(`\nREFUSED: ${error.message}\n`)
  process.exit(1)
}

/** Local-only variables. NEVER committed, NEVER `NEXT_PUBLIC_`, NEVER printed. */
const VAR_URL = 'BEST_COACH_HOSTED_SUPABASE_URL'
const VAR_SECRET = 'BEST_COACH_HOSTED_SECRET_KEY'
const VAR_DB = 'BEST_COACH_HOSTED_DB_URL'

/**
 * THE psql TRANSPORT. psql is needed because the ratified fixture files use
 * psql CLIENT-SIDE directives (`\set`, `\if`/`\else`/`\endif`) that the server
 * has never heard of — see `runSqlFile` below. It is a transport, never a
 * target: every --dbname URI points at the HOSTED database.
 *
 * DEFAULT: a THROWAWAY container (`docker run --rm`). It borrows no existing
 * stack, so it cannot disturb one. This matters when another workspace's local
 * Supabase project is running on the same machine — the previous behaviour
 * (`docker exec` into a fixed container name) reached into whichever stack
 * happened to own that name, which is a cross-workspace dependency nothing
 * here actually needs.
 *
 * OPT-IN: set BEST_COACH_PSQL_CONTAINER to `docker exec` into a named running
 * container instead. Useful where outbound networking is only available from
 * inside an existing stack.
 *
 * The image major version must match the hosted server (17.x).
 */
const PSQL_CONTAINER = process.env.BEST_COACH_PSQL_CONTAINER?.trim() || null
const PSQL_IMAGE = process.env.BEST_COACH_PSQL_IMAGE?.trim() || 'public.ecr.aws/supabase/postgres:17.6.1.143'

/** The ratified Step 7F identities — synthetic, deterministic, unchanged. */
const IDENTITIES = [
  { key: 'management', label: 'Management', email: 'management.fixture@example.test', authId: 'd0000000-0000-4000-8000-000000000001' },
  { key: 'trainer', label: 'Trainer', email: 'trainer.fixture@example.test', authId: 'd0000000-0000-4000-8000-000000000002' },
  { key: 'parent', label: 'Parent', email: 'parent.fixture@example.test', authId: 'd0000000-0000-4000-8000-000000000003' },
]

class SafeError extends TargetRefused {}

const say = (m) => process.stdout.write(`${m}\n`)
const phase = (m) => say(`\n[ ${m} ]`)
const pass = (m) => say(`  PASS  ${m}`)
const info = (m) => say(`  ....  ${m}`)

// ---------------------------------------------------------------------
// Target guards live in `hosted-target-guard.mjs` and are imported above.
// Every one runs BEFORE anything is created.
// ---------------------------------------------------------------------

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
 * Run a committed fixture file through REAL psql, against the hosted database.
 *
 * ---------------------------------------------------------------------
 * ⚠️ WHY NOT THE DRIVER — THIS IS THE FIRST-CONTACT FAILURE, DIAGNOSED
 * ---------------------------------------------------------------------
 * The first version sent the file through `postgres.js` `sql.unsafe()` and
 * failed immediately. The cause was NOT the `DO $$ … $$` blocks or the
 * multi-statement request: the ratified fixture is written FOR psql and uses
 * psql CLIENT-SIDE directives — `\set ON_ERROR_STOP on`, and `\if
 * :do_cleanup` / `\else` / `\endif` control flow. Those are interpreted by
 * the psql client; the SERVER has never heard of `\if`, so the very first
 * line is a syntax error.
 *
 * The fix is NOT to preprocess that control flow in JavaScript. Doing so
 * would mean reimplementing psql's conditional parser against a RATIFIED
 * fixture whose exact execution semantics are part of what was accepted — a
 * divergence risk with no upside.
 *
 * Instead the file runs through the SAME psql it was written for, supplied by
 * a container whose psql major version matches the hosted server's 17.x. It is
 * a transport, not a target: the `--dbname` URI points at the HOSTED database
 * throughout, and no local database is ever read or written by this path.
 *
 * ⚠️ CONSEQUENCE, STATED PLAINLY: this loader requires DOCKER to be running,
 * because that is where psql lives. It is an operator-run local tool, so that
 * is acceptable — but it is a real prerequisite, not an implementation detail.
 * By default it starts a THROWAWAY container and borrows no existing stack, so
 * a local Supabase project does NOT need to be up.
 *
 * The connection URI is passed as an ARGV ELEMENT with `shell: false`, so no
 * shell ever parses the password. SQL arrives on stdin exactly as the local
 * loader does it.
 */
function runSqlFile(dbUrl, relativePath, psqlVars = {}) {
  const text = readFileSync(join(REPO_ROOT, 'scripts', 'fixtures', relativePath), 'utf8')
  // Either transport passes the connection URI as an ARGV ELEMENT with
  // shell:false, so no shell ever parses the password.
  const args = PSQL_CONTAINER
    ? ['exec', '-i', PSQL_CONTAINER, 'psql', '--no-psqlrc', '--quiet', '--dbname', dbUrl]
    : ['run', '--rm', '-i', PSQL_IMAGE, 'psql', '--no-psqlrc', '--quiet', '--dbname', dbUrl]
  for (const [name, value] of Object.entries(psqlVars)) {
    if (!/^[a-z_]+$/.test(name) || !/^(true|false)$/.test(value)) {
      throw new SafeError(`refusing to pass a non-boolean psql variable: ${name}`)
    }
    args.push('-v', `${name}=${value}`)
  }
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn('docker', args, { stdio: ['pipe', 'pipe', 'pipe'], shell: false })
    let out = ''
    let err = ''
    child.stdout.on('data', (d) => {
      out += d
    })
    child.stderr.on('data', (d) => {
      err += d
    })
    child.on('error', () =>
      rejectRun(
        new SafeError(
          PSQL_CONTAINER
            ? `could not start psql — is the container "${PSQL_CONTAINER}" running?`
            : `could not start psql — is Docker running, and is the image "${PSQL_IMAGE}" available?`,
        ),
      ),
    )
    child.on('close', (code) => {
      if (code === 0) return resolveRun(out)
      // psql's stderr carries the SQLSTATE, the message and the line number.
      // It is committed fixture SQL, not a credential — but it is still
      // guarded by exact containment before it is surfaced.
      const safeErr = err.includes(dbUrl) ? '[REDACTED — contained the connection string]' : err.trim()
      rejectRun(new SafeError(`psql exited ${code} running ${relativePath}:\n${safeErr}`))
    })
    child.stdin.end(text)
  })
}

// ---------------------------------------------------------------------
// main
// ---------------------------------------------------------------------

async function main() {
  const reload = process.argv.includes('--reload')
  /**
   * Run ONLY the committed verifier against the hosted project.
   *
   * Exists because the first hosted run loaded the 25 baseline rows and then
   * died on the expansion step, leaving the fixture LOADED BUT UNVERIFIED. The
   * only thing outstanding was the verification, and re-running the whole
   * loader to reach it would have demanded `--reload` (whose teardown DELETES)
   * and a needless re-typing of three passwords.
   *
   * It prompts for nothing and writes nothing.
   */
  const verifyOnly = process.argv.includes('--verify-only')

  phase('Target guards — every one runs BEFORE anything is created')
  const apiUrl = assertHostedApiUrl(requireVar(VAR_URL), HOSTED_PROJECT_REF, VAR_URL)
  const secretKey = requireVar(VAR_SECRET)
  const dbUrl = requireVar(VAR_DB)
  const db = assertHostedDbUrl(dbUrl, HOSTED_PROJECT_REF, VAR_DB)
  pass('the frozen demonstration project is denied unconditionally')
  pass(`API target is the expected project ${HOSTED_PROJECT_REF}.supabase.co`)
  pass(`database target carries the expected ref in its ${db.where}`)
  info(
    PSQL_CONTAINER
      ? `psql transport: docker exec into "${PSQL_CONTAINER}" (a transport, never a target)`
      : `psql transport: throwaway container from "${PSQL_IMAGE}" — no existing stack is touched`,
  )
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

    if (verifyOnly) {
      phase('Verification ONLY — the committed verifier, unmodified. No prompt, no write.')
      if (existing === 0) throw new SafeError('No fixture rows are present; there is nothing to verify.')
      await runSqlFile(dbUrl, 'verify-local-fixtures.sql')
      pass('every fixture assertion passed on the hosted project')
      const [c] = await sql`
        SELECT (SELECT count(*)::int FROM public.accounts) AS accounts,
               (SELECT count(*)::int FROM public.students) AS students,
               (SELECT count(*)::int FROM public.observations) AS observations,
               (SELECT count(*)::int FROM public.observation_ratings) AS ratings,
               (SELECT count(*)::int FROM public.reports) AS reports,
               (SELECT count(*)::int FROM public.audit_events) AS audit_events`
      phase('Census')
      say(`  accounts=${c.accounts} students=${c.students} observations=${c.observations} ` +
        `observation_ratings=${c.ratings} reports=${c.reports} audit_events=${c.audit_events}`)
      say('\nHOSTED FIXTURES VERIFIED. Nothing was written and no password was requested.')
      return
    }

    if (existing > 0 && !reload) {
      throw new SafeError(
        'Fixture rows already exist. Use --verify-only to verify them without writing, ' +
          'or --reload to tear down and reload (which DELETES the Auth identities).',
      )
    }

    phase('Passwords — interactive, no-echo, no alternative source')
    say('  Three passwords, one per synthetic identity. Nothing is echoed.')
    say('  They are never stored, logged, or written anywhere.')
    const secrets = await promptForSecrets(IDENTITIES.map((i) => [i.key, i.label]))

    if (reload) {
      phase('Teardown')
      await runSqlFile(dbUrl, 'local_fixtures.sql', { do_cleanup: 'true', do_load: 'false' })
      pass('domain fixture rows removed')
      for (const identity of IDENTITIES) {
        const { error } = await admin.auth.admin.deleteUser(identity.authId)
        if (error && !/not.?found/i.test(error.message)) {
          throw new SafeError(`could not remove the ${identity.label} identity`)
        }
      }
      pass('synthetic Auth identities removed')
    }

    phase('Synthetic Auth identities — through the ADMIN API, IDEMPOTENT')
    // ⚠️ CREATE-OR-UPDATE, deliberately, and NOT delete-and-recreate.
    //
    // The first hosted run created all three identities and then failed on the
    // domain fixtures, so a re-run meets three identities that already exist.
    // Making that a hard failure would force `--reload`, whose teardown DELETES
    // Auth users — a destructive step to recover from a non-destructive fault.
    //
    // Setting the password on the existing row instead reaches the same end
    // state, destroys nothing, and keeps the deterministic UUID stable, which
    // matters because the fixture SQL writes that UUID INLINE into
    // `accounts.auth_user_id` and then ASSERTS the link exists.
    for (const identity of IDENTITIES) {
      const created = await admin.auth.admin.createUser({
        id: identity.authId,
        email: identity.email,
        password: secrets.get(identity.key),
        email_confirm: true,
      })
      if (!created.error) {
        pass(`${identity.label} identity created (${identity.email})`)
        continue
      }
      // Already present — set the password on the existing row.
      const updated = await admin.auth.admin.updateUserById(identity.authId, {
        email: identity.email,
        password: secrets.get(identity.key),
        email_confirm: true,
      })
      if (updated.error || updated.data?.user?.id !== identity.authId) {
        // Neither error object is surfaced; both could echo request detail.
        throw new SafeError(
          `could not create or update the ${identity.label} identity. ` +
            'It exists but could not be updated, so its password is unknown — nothing further was attempted.',
        )
      }
      pass(`${identity.label} identity already existed — password set on the existing row (${identity.email})`)
    }
    secrets.clear()

    phase('Domain fixtures')
    await runSqlFile(dbUrl, 'local_fixtures.sql', { do_cleanup: 'false', do_load: 'true' })
    pass('Step 7F baseline loaded (25 domain rows)')

    // ⚠️ THE P1-T09a EXPANSION IS DELIBERATELY NOT LOADED HERE.
    //
    // An earlier version of this loader loaded it and failed on the fixture's
    // own mode guard, which demands `-v do_expand=true`. The right response
    // was NOT to pass that variable: it was to notice that THE LOCAL LOADER
    // NEVER LOADS THE EXPANSION EITHER. `load-local-fixtures.mjs` only COUNTS
    // expansion rows and REFUSES `--reload` while any are present; the
    // expansion is applied by the operator as a separate, explicit psql
    // invocation. This loader had invented a step its local counterpart does
    // not have, and wiring in `do_expand` would have entrenched the invention.
    //
    // It is also not needed for the hero chain, which runs entirely on the
    // BASELINE `c`-family rows — the chain's own session and student ids are
    // `c5000000-…` and `c2000000-…`. The expansion adds the disjoint
    // `e`-family: a second trainer, further modules and students, a second
    // parent, and a SECOND class session. Only the session-to-session
    // previous-focus continuity proof genuinely requires it.
    //
    // To add it deliberately, as a separate operator step:
    //   docker run --rm -i public.ecr.aws/supabase/postgres:17.6.1.143 psql --no-psqlrc \
    //     --dbname "<hosted url>" -v do_expand=true -v do_expand_cleanup=false \
    //     < scripts/fixtures/local_fixtures_expansion.sql
    info('P1-T09a expansion NOT loaded — the local loader does not load it either, and the hero chain does not need it')

    phase('Verification — the committed verifier, unmodified')
    await runSqlFile(dbUrl, 'verify-local-fixtures.sql')
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

/**
 * Render a failure WITHOUT erasing its cause.
 *
 * ⚠️ THE FIRST VERSION OF THIS HANDLER PRINTED "an unexpected error occurred"
 * FOR EVERY NON-AUTHORED ERROR. That was a real defect, of the same class as
 * a check that reports CLEAN because its own query failed: it suppressed
 * exactly the information needed to act, and turned a diagnosable SQL fault
 * into an unanalysable one.
 *
 * The original reasoning — "a driver error could carry a connection string" —
 * is true only of CONNECTION errors. A PostgreSQL *server* error carries
 * structured fields (`code`, `position`, `where`, `detail`, `hint`) plus the
 * statement text, and here that statement is COMMITTED FIXTURE SQL, which is
 * public by construction.
 *
 * So the fields are surfaced, and the credential is excluded BY EXACT
 * CONTAINMENT rather than by pattern-based redaction, which §11 forbids
 * relying on: any rendered string that contains the connection string, its
 * password, or the secret key is replaced wholesale.
 */
function renderFailure(error) {
  const secrets = [process.env[VAR_DB], process.env[VAR_SECRET], process.env[VAR_URL]]
    .filter((s) => typeof s === 'string' && s.length > 0)
  let password = null
  try {
    password = decodeURIComponent(new URL(process.env[VAR_DB] ?? '').password) || null
  } catch {
    password = null
  }
  if (password) secrets.push(password)

  const safe = (value) => {
    if (value === undefined || value === null) return null
    const text = String(value)
    return secrets.some((s) => text.includes(s)) ? '[REDACTED — contained a credential]' : text
  }

  // SafeError extends TargetRefused, so this covers both the local refusals
  // and every refusal raised by the shared target guard.
  if (error instanceof TargetRefused || error instanceof SecretPromptError) {
    return `REFUSED / FAILED: ${error.message}`
  }

  const lines = ['FAILED — the underlying cause follows, verbatim:']
  const pg = error ?? {}
  for (const [label, key] of [
    ['message ', 'message'],
    ['code    ', 'code'],
    ['severity', 'severity_local'],
    ['detail  ', 'detail'],
    ['hint    ', 'hint'],
    ['where   ', 'where'],
    ['schema  ', 'schema_name'],
    ['table   ', 'table_name'],
    ['column  ', 'column_name'],
    ['constrnt', 'constraint_name'],
    ['position', 'position'],
    ['file:line', 'file'],
    ['routine ', 'routine'],
  ]) {
    const v = safe(pg[key])
    if (v !== null && v !== '') lines.push(`  ${label} : ${v}`)
  }

  // The failing statement, with the exact fault position marked.
  const query = safe(pg.query)
  if (query) {
    const pos = Number(pg.position)
    if (Number.isFinite(pos) && pos > 0) {
      const start = Math.max(0, pos - 300)
      const end = Math.min(query.length, pos + 300)
      lines.push(`  --- failing statement, around character ${pos} of ${query.length} ---`)
      lines.push(query.slice(start, pos - 1))
      lines.push(`  >>> HERE >>> ${query.slice(pos - 1, pos + 60)}`)
      lines.push(query.slice(pos + 60, end))
    } else {
      lines.push('  --- failing statement (first 1200 chars) ---')
      lines.push(query.slice(0, 1200))
    }
  }
  if (lines.length === 1 && pg.stack) lines.push(safe(pg.stack) ?? '')
  return lines.join('\n')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    process.stderr.write(`\n${renderFailure(error)}\n`)
    process.exit(1)
  })
