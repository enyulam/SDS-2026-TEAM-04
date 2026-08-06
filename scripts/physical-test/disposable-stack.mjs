// =====================================================================
// B.E.S.T Coach — the DISPOSABLE F17 Supabase stack
// =====================================================================
// Operator ruling R-C2-2: the full writable F17 lifecycle must run against
// a SEPARATE DISPOSABLE LOCAL Supabase environment, and the canonical
// `best-coach-mvp` fixture database must remain pristine.
//
// This module provisions, describes and destroys that environment. It is
// imported by `run-f17-disposable.mjs` (the writable walkthrough) and by
// `prove-disposable-isolation.mjs` (the autonomous isolation proof). It is
// NOT imported by `run-f17.mjs`, which stays byte-untouched.
//
// ---------------------------------------------------------------------
// WHY THIS IS A SEPARATE STACK AND NOT A SEPARATE DATABASE
// ---------------------------------------------------------------------
// `scripts/tests/c2/run-c2.mjs` and `scripts/tests/step-7i/run-concurrency.mjs`
// clone a disposable DATABASE inside the canonical CONTAINER. That is right
// for a SQL-only proof, and it is deliberately not enough here: the writable
// walkthrough needs real Supabase Auth sessions and real PostgREST calls, so
// it needs its own Auth service, its own Kong, its own JWT issuer and its own
// data volume. Sharing the canonical container's Auth would mean creating and
// deleting Auth users on the canonical stack, which is exactly the residue
// R-C2-2 forbids.
//
// ---------------------------------------------------------------------
// ABSOLUTE RULES ENFORCED BY THIS FILE
// ---------------------------------------------------------------------
//  * `supabase/config.toml` is NEVER read for mutation and NEVER written.
//    It is read ONLY to assert that the canonical project id and the
//    canonical ports are still what `run-f17.mjs`'s assertProjectGuards()
//    relies on — and to assert that the disposable identifiers COLLIDE WITH
//    NONE of them.
//  * The disposable stack lives in a workdir OUTSIDE the repository, under
//    the OS temp directory. Nothing it contains is ever committed.
//  * The migrations replayed there are BYTE-IDENTICAL COPIES of the ten
//    committed `supabase/migrations/*.sql`, verified by SHA-256 after the
//    copy. They are never forked, edited or reordered.
//  * `.env.local` is NEVER read, by any code path in this module. The
//    disposable stack's API URL and keys come from the disposable CLI's OWN
//    `status -o json`, are held in process memory, and are never printed,
//    serialized, written or interpolated into a message.
//  * Teardown targets the disposable project id EXPLICITLY
//    (`stop --project-id <disposable> --no-backup`). `--all` is never used:
//    it would stop the canonical stack.
//  * Captured child stdout/stderr is DISCARDED. Only exit codes and values
//    this file authored ever reach a stream.
// =====================================================================

import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import net from 'node:net'
import os from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
export const REPO_ROOT = resolve(HERE, '..', '..')

// ---------------------------------------------------------------------
// The canonical environment — SACRED. Every value is a fixed literal and
// this module only ever asserts them, never changes them.
// ---------------------------------------------------------------------

export const CANONICAL_PROJECT_ID = 'best-coach-mvp'
export const CANONICAL_DB_CONTAINER = 'supabase_db_best-coach-mvp'
export const CANONICAL_API_PORT = 54321
export const CANONICAL_DB_PORT = 54322
export const CANONICAL_STUDIO_PORT = 54323
export const CANONICAL_INBUCKET_PORT = 54324

/** Every container the canonical stack owns. None of these is ever touched. */
export const CANONICAL_CONTAINERS = [
  'supabase_db_best-coach-mvp',
  'supabase_studio_best-coach-mvp',
  'supabase_pg_meta_best-coach-mvp',
  'supabase_edge_runtime_best-coach-mvp',
  'supabase_storage_best-coach-mvp',
  'supabase_rest_best-coach-mvp',
  'supabase_realtime_best-coach-mvp',
  'supabase_inbucket_best-coach-mvp',
  'supabase_auth_best-coach-mvp',
  'supabase_kong_best-coach-mvp',
]

export const EXPECTED_CANONICAL_CHECKSUM =
  '6bdff280e550503d212832c2fd1099ac45880c2bc430bfdff8f92a3b35ffc576'
export const EXPECTED_CANONICAL_ROWS = 28
export const EXPECTED_CANONICAL_MIGRATIONS = 10
const CANONICAL_BEGIN = '<<<BEST_COACH_FIXTURE_CANONICAL_BEGIN>>>'
const CANONICAL_END = '<<<BEST_COACH_FIXTURE_CANONICAL_END>>>'

// ---------------------------------------------------------------------
// The disposable environment. Every identifier is DISTINCT from every
// canonical identifier, and `assertNoCollision()` proves it rather than
// asserting it in prose.
// ---------------------------------------------------------------------

export const DISPOSABLE_PROJECT_ID = 'bc-f17-disposable'
export const DISPOSABLE_DB_CONTAINER = `supabase_db_${DISPOSABLE_PROJECT_ID}`

/** 554xx, so no digit-transposition of a 543xx canonical port can collide. */
export const DISPOSABLE_API_PORT = 55421
export const DISPOSABLE_DB_PORT = 55422
export const DISPOSABLE_STUDIO_PORT = 55423
export const DISPOSABLE_INBUCKET_PORT = 55424
export const DISPOSABLE_SHADOW_PORT = 55420

/** The disposable application port. Never 3000 (the operator's), never 3417 (run-f17.mjs's). */
export const DISPOSABLE_APP_PORT = 3418
/** The disposable CDP port. Never 9417 (run-f17.mjs's), never 9332/9347 (older harnesses'). */
export const DISPOSABLE_DEBUG_PORT = 9418

export const DISPOSABLE_PUBLISHED_PORTS = [
  DISPOSABLE_API_PORT,
  DISPOSABLE_DB_PORT,
  DISPOSABLE_STUDIO_PORT,
  DISPOSABLE_INBUCKET_PORT,
]

/** Ports this module refuses to take, whatever it is asked. */
const FORBIDDEN_PORTS = new Set([
  3000,
  3417,
  9417,
  CANONICAL_API_PORT,
  CANONICAL_DB_PORT,
  CANONICAL_STUDIO_PORT,
  CANONICAL_INBUCKET_PORT,
])

/**
 * The disposable Auth identities. These are SEPARATE synthetic identities:
 * a distinct email per role and a password typed separately, for this stack
 * only, at this run's own prompt.
 *
 * The UUIDs are the committed fixture's OWN structural literals, because
 * `scripts/fixtures/local_fixtures.sql` writes them INLINE into
 * `accounts.auth_user_id` and then ASSERTS all three links exist. A UUID is
 * not a credential: it is a public, committed, non-secret join key, and
 * reusing it is what lets the disposable stack replay the committed fixture
 * VERBATIM instead of forking it. What is NOT reused is the thing that
 * actually authenticates — the address and the password.
 */
export const DISPOSABLE_IDENTITIES = [
  {
    key: 'trainer',
    label: 'Trainer',
    email: 'trainer.disposable@f17-disposable.example.test',
    authId: 'd0000000-0000-4000-8000-000000000002',
    role: 'trainer',
    home: '/trainer',
    landing: '/trainer/schedule',
    accountId: 'c0000000-0000-4000-8000-000000000002',
  },
  {
    key: 'management',
    label: 'Management',
    email: 'management.disposable@f17-disposable.example.test',
    authId: 'd0000000-0000-4000-8000-000000000001',
    role: 'management',
    home: '/management',
    landing: '/management',
    accountId: 'c0000000-0000-4000-8000-000000000001',
  },
  {
    key: 'parent',
    label: 'Parent',
    email: 'parent.disposable@f17-disposable.example.test',
    authId: 'd0000000-0000-4000-8000-000000000003',
    role: 'parent',
    home: '/parent',
    landing: '/parent',
    accountId: 'c0000000-0000-4000-8000-000000000003',
  },
]

/** The canonical identities' addresses. Asserted ABSENT from the disposable set. */
const CANONICAL_EMAILS = new Set([
  'management.fixture@example.test',
  'trainer.fixture@example.test',
  'parent.fixture@example.test',
])

export const FIXTURE_MODE_VARIABLE = 'NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE'

// ---------------------------------------------------------------------
// Safe output and safe failure.
// ---------------------------------------------------------------------

export const say = (message) => process.stdout.write(`${message}\n`)
export const phase = (message) => say(`\n[ ${message} ]`)
export const pass = (message) => say(`  PASS  ${message}`)
export const info = (message) => say(`  ....  ${message}`)
export const warn = (message) => say(`  !!    ${message}`)

/**
 * A failure that is safe to surface. Its message is AUTHORED in this
 * repository and is never derived from captured output, an Auth response, a
 * connection value, an environment value or anything a credential could
 * have reached. This is a deliberate copy of `run-f17.mjs`'s class rather
 * than a shared import — see the header of `run-f17-disposable.mjs` for the
 * Option-A/Option-B reasoning.
 */
export class SafeError extends Error {
  constructor(message) {
    super(message)
    this.name = 'SafeError'
  }
}

// ---------------------------------------------------------------------
// Child processes. stdout and stderr are captured and DISCARDED: only an
// exit code leaves these functions. There is no path by which captured
// output can reach a stream, a message, an error or a file.
// ---------------------------------------------------------------------

export function runCapturedExitCode(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  })
  if (result.error) return { status: null, spawnFailed: true }
  // `result.stdout` / `result.stderr` go out of scope here, unread.
  return { status: result.status, spawnFailed: false }
}

/**
 * Resolve the project-local, version-pinned Supabase CLI exactly as
 * `run-f17.mjs` and `scripts/fixtures/load-local-fixtures.mjs` do: the
 * package-local NATIVE executable if present, otherwise the project-local
 * shim run through THIS Node runtime. Never a global install, never npx,
 * never a shell string, never an environment-supplied override.
 */
const CLI_PLATFORM_PACKAGES = {
  darwin: { arm64: ['darwin-arm64'], x64: ['darwin-x64'] },
  linux: { arm64: ['linux-arm64', 'linux-arm64-musl'], x64: ['linux-x64', 'linux-x64-musl'] },
  win32: { arm64: ['windows-arm64'], x64: ['windows-x64'] },
}

export function resolveLocalCli() {
  const requireFromRepo = createRequire(join(REPO_ROOT, 'package.json'))
  const platformMap = CLI_PLATFORM_PACKAGES[process.platform]
  const candidates = platformMap ? (platformMap[os.arch()] ?? []) : []
  const ext = process.platform === 'win32' ? '.exe' : ''

  for (const suffix of candidates) {
    try {
      const pkgDir = dirname(requireFromRepo.resolve(`@supabase/cli-${suffix}/package.json`))
      const binPath = join(pkgDir, 'bin', `supabase${ext}`)
      if (existsSync(binPath)) {
        return {
          command: binPath,
          prefixArgs: [],
          form: `package-local native executable (@supabase/cli-${suffix})`,
        }
      }
    } catch {
      // Try the next candidate package.
    }
  }

  const shim = join(REPO_ROOT, 'node_modules', 'supabase', 'dist', 'supabase.js')
  if (existsSync(shim)) {
    return { command: process.execPath, prefixArgs: [shim], form: 'project-local shim via this Node runtime' }
  }
  throw new SafeError('The project-local Supabase CLI could not be resolved under node_modules.')
}

// ---------------------------------------------------------------------
// Docker. Every query is a fixed argument array; no shell, ever.
// ---------------------------------------------------------------------

/** Container names currently RUNNING, as a Set. */
export function runningContainers() {
  const result = spawnSync('docker', ['ps', '--format', '{{.Names}}'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
  })
  if (result.error) throw new SafeError('Docker is not available on PATH.')
  if (result.status !== 0) throw new SafeError(`Could not query Docker for running containers (exit ${result.status}).`)
  return new Set(
    (result.stdout || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0),
  )
}

/** Container names in ANY state, including exited. Used to prove absence. */
export function allContainers() {
  const result = spawnSync('docker', ['ps', '-a', '--format', '{{.Names}}'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
  })
  if (result.error) throw new SafeError('Docker is not available on PATH.')
  if (result.status !== 0) throw new SafeError(`Could not query Docker for all containers (exit ${result.status}).`)
  return new Set(
    (result.stdout || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0),
  )
}

/** Docker volume names in any state. Used to prove the data volume is gone. */
export function allVolumes() {
  const result = spawnSync('docker', ['volume', 'ls', '--format', '{{.Name}}'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
  })
  if (result.error) throw new SafeError('Docker is not available on PATH.')
  if (result.status !== 0) throw new SafeError(`Could not query Docker for volumes (exit ${result.status}).`)
  return new Set(
    (result.stdout || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0),
  )
}

/** The `docker inspect` health state of one container, or null if unknown. */
export function containerHealth(name) {
  const result = spawnSync(
    'docker',
    ['inspect', '--format', '{{.State.Status}}|{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}', name],
    { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', windowsHide: true, shell: false },
  )
  if (result.error || result.status !== 0) return null
  const [state, health] = (result.stdout || '').trim().split('|')
  if (!state) return null
  return { state, health: health || 'none' }
}

// ---------------------------------------------------------------------
// SQL channel: `docker exec -i <container> psql`, SQL on stdin. NO database
// password is passed, prompted for, embedded or stored — the container
// authenticates on local socket trust. stderr is captured and never
// rendered; only an authored message and the psql exit code survive.
// ---------------------------------------------------------------------

const PSQL_PREFIX = [
  'psql',
  '--no-psqlrc',
  '--username=postgres',
  '--dbname=postgres',
  '--set=ON_ERROR_STOP=1',
  '--quiet',
]

export function psqlRows(container, sql) {
  const args = ['exec', '-i', container, ...PSQL_PREFIX, '--tuples-only', '--no-align', '--field-separator=|']
  const result = spawnSync('docker', args, {
    input: sql,
    stdio: ['pipe', 'pipe', 'pipe'],
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
    maxBuffer: 32 * 1024 * 1024,
  })
  if (result.error) throw new SafeError(`Could not execute SQL through the container "${container}".`)
  if (result.status !== 0) {
    throw new SafeError(`A query against "${container}" failed (psql exit ${result.status}).`)
  }
  return (result.stdout || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.split('|'))
}

export function psqlFileStdout(container, absolutePath, psqlVars = {}) {
  if (!existsSync(absolutePath)) throw new SafeError('A required SQL file is missing.')
  const args = ['exec', '-i', container, ...PSQL_PREFIX]
  for (const [name, value] of Object.entries(psqlVars)) args.push(`--set=${name}=${value}`)
  const result = spawnSync('docker', args, {
    input: readFileSync(absolutePath, 'utf8'),
    stdio: ['pipe', 'pipe', 'pipe'],
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
    maxBuffer: 32 * 1024 * 1024,
  })
  if (result.error) throw new SafeError(`Could not execute a SQL file through the container "${container}".`)
  if (result.status !== 0) {
    throw new SafeError(`A SQL file failed against "${container}" (psql exit ${result.status}).`)
  }
  return result.stdout || ''
}

// ---------------------------------------------------------------------
// The canonical census. Recorded BEFORE the disposable stack exists and
// RE-READ INDEPENDENTLY after teardown, so "the canonical database is
// unchanged" is a MEASUREMENT and never a claim.
// ---------------------------------------------------------------------

/**
 * Thirteen SEPARATE columns, joined in JavaScript. They are deliberately not
 * concatenated in SQL: `psqlRows` already splits on `|`, so a `|`-joined
 * single column would arrive as thirteen fields whose first element is only
 * the report count — a census that silently reported one number as if it
 * were the whole reading.
 */
const CENSUS_COLUMNS = 13
const CANONICAL_CENSUS_SQL = `
SELECT (SELECT count(*) FROM public.reports),
       (SELECT count(*) FROM public.report_versions),
       (SELECT count(*) FROM public.report_version_ratings),
       (SELECT count(*) FROM public.report_correction_requests),
       (SELECT count(*) FROM public.observations),
       (SELECT count(*) FROM public.observation_ratings),
       (SELECT count(*) FROM public.audit_events),
       (SELECT count(*) FROM public.audit_chain_heads),
       (SELECT count(*) FROM auth.users),
       (SELECT count(*) FROM supabase_migrations.schema_migrations),
       (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
          WHERE n.nspname = 'public'),
       (SELECT count(*) FROM pg_tables WHERE schemaname = 'public'),
       (SELECT count(*) FROM pg_policies WHERE schemaname = 'public');`

/** Compute the fixture checksum over the verifier's canonical region. */
export function fixtureChecksum(container) {
  const stdout = psqlFileStdout(container, join(REPO_ROOT, 'scripts', 'fixtures', 'verify-local-fixtures.sql'))
  const lines = stdout.split(/\r?\n/)
  const start = lines.indexOf(CANONICAL_BEGIN)
  const end = lines.indexOf(CANONICAL_END)
  if (start === -1 || end === -1 || end <= start) {
    throw new SafeError('The verification output did not contain a well-formed canonical region.')
  }
  const canonical = lines
    .slice(start + 1, end)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
  if (canonical.length === 0) throw new SafeError('The canonical region was empty.')
  return {
    rows: canonical.length,
    sha256: createHash('sha256').update(`${canonical.join('\n')}\n`, 'utf8').digest('hex'),
  }
}

/**
 * The full canonical reading: census counts, the fixture checksum, the
 * applied-migration list and the three Auth user ids. Every field is a
 * count, a public checksum or a committed literal — nothing a credential
 * could occupy.
 */
export function readCanonical() {
  const fields = psqlRows(CANONICAL_DB_CONTAINER, CANONICAL_CENSUS_SQL)[0]
  if (!Array.isArray(fields) || fields.length !== CENSUS_COLUMNS) {
    throw new SafeError(`The canonical census query did not return the expected ${CENSUS_COLUMNS} fields.`)
  }
  const census = fields.join('|')
  const migrations = psqlRows(
    CANONICAL_DB_CONTAINER,
    'SELECT string_agg(version, \',\' ORDER BY version) FROM supabase_migrations.schema_migrations;',
  )[0]?.[0]
  const authUsers = psqlRows(
    CANONICAL_DB_CONTAINER,
    'SELECT COALESCE(string_agg(id::text, \',\' ORDER BY id::text), \'none\') FROM auth.users;',
  )[0]?.[0]
  const checksum = fixtureChecksum(CANONICAL_DB_CONTAINER)
  const [
    reports,
    versions,
    versionRatings,
    corrections,
    observations,
    observationRatings,
    auditEvents,
    chainHeads,
    users,
    appliedMigrations,
  ] = fields

  return {
    census,
    migrations: migrations ?? '',
    authUsers: authUsers ?? '',
    checksum,
    counts: {
      reports: Number(reports),
      reportVersions: Number(versions),
      reportVersionRatings: Number(versionRatings),
      corrections: Number(corrections),
      observations: Number(observations),
      observationRatings: Number(observationRatings),
      auditEvents: Number(auditEvents),
      chainHeads: Number(chainHeads),
      authUsers: Number(users),
      appliedMigrations: Number(appliedMigrations),
    },
  }
}

/**
 * Assert the canonical reading is the ratified pristine state. Used BEFORE
 * the disposable stack is created: if the canonical database is already
 * dirty, nothing this run does could prove it was not this run's fault, so
 * the run stops rather than starting anything.
 */
export function assertCanonicalPristine(reading, when) {
  const failures = []
  if (reading.checksum.sha256 !== EXPECTED_CANONICAL_CHECKSUM) failures.push('fixture checksum')
  if (reading.checksum.rows !== EXPECTED_CANONICAL_ROWS) failures.push(`canonical rows (${reading.checksum.rows})`)
  if (reading.counts.reports !== 0) failures.push(`reports=${reading.counts.reports}`)
  if (reading.counts.reportVersions !== 0) failures.push(`report_versions=${reading.counts.reportVersions}`)
  if (reading.counts.reportVersionRatings !== 0) {
    failures.push(`report_version_ratings=${reading.counts.reportVersionRatings}`)
  }
  if (reading.counts.auditEvents !== 0) failures.push(`audit_events=${reading.counts.auditEvents}`)
  if (reading.counts.chainHeads !== 0) failures.push(`audit_chain_heads=${reading.counts.chainHeads}`)
  if (reading.counts.observations !== 1) failures.push(`observations=${reading.counts.observations}`)
  if (reading.counts.authUsers !== 3) failures.push(`auth.users=${reading.counts.authUsers}`)
  if (reading.counts.appliedMigrations !== EXPECTED_CANONICAL_MIGRATIONS) {
    failures.push(`applied migrations=${reading.counts.appliedMigrations}`)
  }
  if (failures.length > 0) {
    throw new SafeError(
      `The canonical fixture database is not in its ratified pristine state ${when}: ${failures.join(', ')}. ` +
        'Nothing was provisioned.',
    )
  }
}

/** Compare two canonical readings field by field, returning authored differences. */
export function diffCanonical(before, after) {
  const differences = []
  if (before.checksum.sha256 !== after.checksum.sha256) differences.push('the fixture checksum changed')
  if (before.checksum.rows !== after.checksum.rows) {
    differences.push(`the canonical row count changed (${before.checksum.rows} -> ${after.checksum.rows})`)
  }
  if (before.census !== after.census) differences.push(`the census changed (${before.census} -> ${after.census})`)
  if (before.migrations !== after.migrations) differences.push('the applied-migration list changed')
  if (before.authUsers !== after.authUsers) differences.push('the set of Auth user ids changed')
  return differences
}

// ---------------------------------------------------------------------
// Collision refusal. Every disposable identifier is PROVEN distinct from
// every canonical identifier before anything is provisioned.
// ---------------------------------------------------------------------

function tomlSectionPort(toml, section) {
  const marker = `[${section}]`
  let inSection = false
  for (const raw of toml.split(/\r?\n/)) {
    const line = raw.trim()
    if (line.startsWith('[')) {
      inSection = line === marker
      continue
    }
    if (!inSection) continue
    const match = /^port\s*=\s*(\d+)/.exec(line)
    if (match) return Number(match[1])
  }
  return null
}

/**
 * Assert the canonical `supabase/config.toml` still says what `run-f17.mjs`
 * relies on, and that this module changes none of it. This is a READ. This
 * file contains no code that writes to the repository's `supabase/`
 * directory at all.
 */
export function assertCanonicalConfigUntouched() {
  const configPath = join(REPO_ROOT, 'supabase', 'config.toml')
  if (!existsSync(configPath)) {
    throw new SafeError('supabase/config.toml was not found; run this from the MVP repository.')
  }
  const toml = readFileSync(configPath, 'utf8')
  const projectId = /^project_id\s*=\s*"([^"]+)"/m.exec(toml)?.[1] ?? null
  if (projectId !== CANONICAL_PROJECT_ID) {
    throw new SafeError(`supabase/config.toml no longer pins project id "${CANONICAL_PROJECT_ID}".`)
  }
  if (tomlSectionPort(toml, 'api') !== CANONICAL_API_PORT) {
    throw new SafeError(`supabase/config.toml no longer pins [api] port ${CANONICAL_API_PORT}.`)
  }
  if (tomlSectionPort(toml, 'db') !== CANONICAL_DB_PORT) {
    throw new SafeError(`supabase/config.toml no longer pins [db] port ${CANONICAL_DB_PORT}.`)
  }
  if (existsSync(join(REPO_ROOT, 'supabase', '.temp', 'project-ref'))) {
    throw new SafeError(
      'A Supabase project reference exists. This harness is local-only and refuses to run on a linked project.',
    )
  }
  return { sha256: createHash('sha256').update(toml, 'utf8').digest('hex'), bytes: toml.length }
}

/**
 * Prove — not assert in prose — that no disposable identifier collides with
 * a canonical one. A collision here would be the exact failure R-C2-2 exists
 * to prevent, so it stops the run before anything is provisioned.
 */
export function assertNoCollision() {
  if (DISPOSABLE_PROJECT_ID === CANONICAL_PROJECT_ID) {
    throw new SafeError('The disposable project id equals the canonical project id.')
  }
  for (const name of CANONICAL_CONTAINERS) {
    if (name.endsWith(`_${DISPOSABLE_PROJECT_ID}`)) {
      throw new SafeError('A canonical container name is derived from the disposable project id.')
    }
  }
  for (const port of [...DISPOSABLE_PUBLISHED_PORTS, DISPOSABLE_SHADOW_PORT, DISPOSABLE_APP_PORT, DISPOSABLE_DEBUG_PORT]) {
    if (FORBIDDEN_PORTS.has(port)) {
      throw new SafeError(`Port ${port} is reserved by the canonical stack or by run-f17.mjs and will not be taken.`)
    }
  }
  const allDisposablePorts = [
    ...DISPOSABLE_PUBLISHED_PORTS,
    DISPOSABLE_SHADOW_PORT,
    DISPOSABLE_APP_PORT,
    DISPOSABLE_DEBUG_PORT,
  ]
  const unique = new Set(allDisposablePorts)
  if (unique.size !== allDisposablePorts.length) {
    throw new SafeError('Two disposable ports are the same value.')
  }
  for (const identity of DISPOSABLE_IDENTITIES) {
    if (CANONICAL_EMAILS.has(identity.email)) {
      throw new SafeError('A disposable identity reuses a canonical fixture email address.')
    }
  }
  return {
    projectId: DISPOSABLE_PROJECT_ID,
    ports: [...unique].sort((a, b) => a - b),
    emails: DISPOSABLE_IDENTITIES.length,
  }
}

// ---------------------------------------------------------------------
// Ports.
// ---------------------------------------------------------------------

export function isPortFree(port) {
  return new Promise((settle) => {
    const server = net.createServer()
    server.once('error', () => settle(false))
    server.once('listening', () => server.close(() => settle(true)))
    server.listen(port, '127.0.0.1')
  })
}

export async function assertPortFree(port, what) {
  if (!(await isPortFree(port))) {
    throw new SafeError(
      `Port ${port} (${what}) is already in use. The disposable stack owns its own ports and refuses to share one.`,
    )
  }
}

export async function waitForPortReleased(port, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    if (await isPortFree(port)) return true
    if (Date.now() >= deadline) return false
    await new Promise((r) => setTimeout(r, 250))
  }
}

/**
 * Does something ACCEPT a TCP connection on this loopback port?
 *
 * This is the instrument used for "the port is still served" and for "the
 * port is really gone", and a bind test is deliberately NOT used for either.
 * Docker publishes on 0.0.0.0; on Windows a bind to the specific address
 * 127.0.0.1 SUCCEEDS while Docker holds 0.0.0.0 on the same port, so
 * `isPortFree()` reports a published, actively-serving port as free. That
 * made a bind test say the running canonical stack was not running.
 *
 * A completed connect is positive evidence that a listener is there; a
 * refused connect is positive evidence that none is. Nothing is written to
 * the socket and nothing is read from it — no byte of any protocol, and
 * therefore nothing a credential could occupy, ever enters this process.
 */
export function portAnswers(port, timeoutMs = 2_000) {
  return new Promise((settle) => {
    const socket = new net.Socket()
    let done = false
    const finish = (answered) => {
      if (done) return
      done = true
      socket.destroy()
      settle(answered)
    }
    socket.setTimeout(timeoutMs)
    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(false))
    socket.once('error', () => finish(false))
    socket.connect(port, '127.0.0.1')
  })
}

/** Assert a canonical published port is STILL served — i.e. the stack is still up. */
export async function assertPortStillHeld(port, what) {
  if (!(await portAnswers(port))) {
    throw new SafeError(`The canonical ${what} port ${port} accepts no connection; the canonical stack is not running.`)
  }
}

/**
 * Wait until a port answers NOTHING. Used at teardown: a released port is
 * one no listener answers on, which is a stronger and more portable claim
 * than "it can be bound".
 */
export async function waitForPortSilent(port, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    if (!(await portAnswers(port, 750))) return true
    if (Date.now() >= deadline) return false
    await new Promise((r) => setTimeout(r, 250))
  }
}

// ---------------------------------------------------------------------
// The disposable workdir. Synthesized OUTSIDE the repository, from the
// COMMITTED migrations, and destroyed at teardown.
// ---------------------------------------------------------------------

export function disposableWorkdir() {
  return join(os.tmpdir(), `best-coach-f17-disposable-${process.pid}`)
}

/**
 * The disposable `config.toml`. It is written into the TEMP workdir and
 * never into the repository. Every port is a disposable literal; every
 * service the walkthrough does not need is disabled, because a service that
 * is not started cannot leak a port or a container.
 *
 * `[db] major_version` is pinned to 17 to match the canonical stack, so the
 * ten committed migrations replay against the same PostgreSQL major version
 * they were accepted on.
 */
function disposableConfigToml() {
  return `# GENERATED — the disposable F17 stack (operator ruling R-C2-2).
# This file lives in a TEMP workdir, never in the repository, and is deleted
# at teardown. The repository's supabase/config.toml is NEVER modified.
project_id = "${DISPOSABLE_PROJECT_ID}"

[api]
enabled = true
port = ${DISPOSABLE_API_PORT}
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[api.tls]
enabled = false

[db]
port = ${DISPOSABLE_DB_PORT}
shadow_port = ${DISPOSABLE_SHADOW_PORT}
major_version = 17

[db.pooler]
enabled = false

[db.migrations]
enabled = true

# No seed file is used. The disposable stack is seeded by the SAME committed
# scripts/fixtures/local_fixtures.sql the canonical stack was seeded with,
# applied explicitly after startup so the load is observable and assertable.
[db.seed]
enabled = false

[realtime]
enabled = false

[studio]
enabled = true
port = ${DISPOSABLE_STUDIO_PORT}
api_url = "http://127.0.0.1"

[local_smtp]
enabled = true
port = ${DISPOSABLE_INBUCKET_PORT}

[storage]
enabled = false

[auth]
enabled = true
site_url = "http://127.0.0.1:${DISPOSABLE_APP_PORT}"
jwt_expiry = 3600
enable_refresh_token_rotation = true
refresh_token_reuse_interval = 10
enable_signup = true
enable_anonymous_sign_ins = false
minimum_password_length = 6

[auth.email]
enable_signup = true
enable_confirmations = false
secure_password_change = false

[edge_runtime]
enabled = false

[analytics]
enabled = false
`
}

/**
 * Copy the ten committed migrations into the disposable workdir and VERIFY
 * each copy is byte-identical to its source by SHA-256. Source fidelity is
 * not a comment here: a copy that differs by one byte stops the run.
 */
function copyCommittedMigrations(workdir) {
  const sourceDir = join(REPO_ROOT, 'supabase', 'migrations')
  const targetDir = join(workdir, 'supabase', 'migrations')
  mkdirSync(targetDir, { recursive: true })

  const names = readdirSync(sourceDir)
    .filter((name) => name.endsWith('.sql'))
    .sort()
  if (names.length !== EXPECTED_CANONICAL_MIGRATIONS) {
    throw new SafeError(
      `Expected ${EXPECTED_CANONICAL_MIGRATIONS} committed migrations, found ${names.length}. ` +
        'The disposable stack replays the committed set exactly; it does not guess.',
    )
  }

  const digests = []
  for (const name of names) {
    const sourcePath = join(sourceDir, name)
    const targetPath = join(targetDir, name)
    copyFileSync(sourcePath, targetPath)
    const sourceDigest = createHash('sha256').update(readFileSync(sourcePath)).digest('hex')
    const targetDigest = createHash('sha256').update(readFileSync(targetPath)).digest('hex')
    if (sourceDigest !== targetDigest) {
      throw new SafeError(`The copied migration ${name} is not byte-identical to its committed source.`)
    }
    digests.push({ name, sha256: sourceDigest })
  }
  return digests
}

export function createDisposableWorkdir() {
  const workdir = disposableWorkdir()
  rmSync(workdir, { recursive: true, force: true })
  mkdirSync(join(workdir, 'supabase'), { recursive: true })
  writeFileSync(join(workdir, 'supabase', 'config.toml'), disposableConfigToml(), 'utf8')
  const migrations = copyCommittedMigrations(workdir)
  return { workdir, migrations }
}

export function destroyDisposableWorkdir() {
  try {
    rmSync(disposableWorkdir(), { recursive: true, force: true })
    return true
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------
// Stack lifecycle.
// ---------------------------------------------------------------------

/**
 * Start the disposable stack. Its stdout and stderr are CAPTURED AND
 * DISCARDED: the CLI prints the local API keys on success, and this harness
 * never renders a key. Only the exit code survives.
 */
export function startDisposableStack(cli, workdir) {
  const started = Date.now()
  const result = runCapturedExitCode(cli.command, [...cli.prefixArgs, '--workdir', workdir, 'start'], {
    cwd: workdir,
    timeout: 15 * 60 * 1000,
  })
  if (result.spawnFailed) throw new SafeError('Could not invoke the project-local Supabase CLI for the disposable stack.')
  if (result.status !== 0) {
    throw new SafeError(
      `The disposable Supabase stack failed to start (CLI exit ${result.status}). ` +
        'Its output is captured and discarded by design, because the CLI prints local keys on success.',
    )
  }
  return { elapsedMs: Date.now() - started }
}

/**
 * Capture the disposable stack's API URL and keys into PROCESS MEMORY ONLY.
 *
 * These values come from the DISPOSABLE stack's own `status -o json` and
 * from nowhere else. `.env.local` is not read — not here, not anywhere in
 * this module. Nothing returned by this function is ever printed,
 * serialized, written to a file or interpolated into a message: the caller
 * hands it straight to a Supabase client or to a child process environment.
 */
export function captureDisposableStatus(cli, workdir) {
  const result = spawnSync(cli.command, [...cli.prefixArgs, '--workdir', workdir, 'status', '-o', 'json'], {
    cwd: workdir,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
  })
  if (result.error) throw new SafeError('Could not invoke the project-local Supabase CLI for the disposable stack.')
  if (result.status !== 0) {
    // Captured stderr is deliberately NOT interpolated: it can embed keys.
    throw new SafeError(`The disposable Supabase stack did not report status (CLI exit ${result.status}).`)
  }

  let parsed
  try {
    parsed = JSON.parse(result.stdout)
  } catch {
    throw new SafeError('The disposable CLI status output could not be parsed as JSON.')
  }

  // Field NAMES are not secrets; VALUES are read for exactly four keys and
  // the parsed object is dropped here.
  const pick = (...names) => {
    for (const name of names) {
      const value = parsed?.[name]
      if (typeof value === 'string' && value.length > 0) return value
    }
    return null
  }

  const apiUrl = pick('API_URL', 'api_url', 'apiUrl')
  const publishableKey = pick('PUBLISHABLE_KEY', 'publishable_key', 'ANON_KEY', 'anon_key')
  const secretKey = pick('SECRET_KEY', 'secret_key', 'SERVICE_ROLE_KEY', 'service_role_key')
  const serviceRoleKey = pick('SERVICE_ROLE_KEY', 'service_role_key')

  if (!apiUrl) throw new SafeError('The disposable CLI status output did not contain an API URL field.')
  if (!publishableKey) throw new SafeError('The disposable CLI status output did not contain a publishable key field.')
  if (!secretKey) throw new SafeError('The disposable CLI status output did not contain a secret key field.')
  if (!serviceRoleKey) throw new SafeError('The disposable CLI status output did not contain a service-role key field.')

  // The API URL is the one value that is safe to structurally verify, and it
  // is verified against the DISPOSABLE port — never the canonical one.
  let url
  try {
    url = new URL(apiUrl)
  } catch {
    throw new SafeError('The disposable API URL reported by the CLI could not be parsed.')
  }
  if (!['127.0.0.1', 'localhost', '::1', '[::1]'].includes(url.hostname)) {
    throw new SafeError('The disposable API URL is not a loopback address. This harness refuses every non-local target.')
  }
  if (Number(url.port) !== DISPOSABLE_API_PORT) {
    throw new SafeError(
      `The disposable API URL port is not ${DISPOSABLE_API_PORT}. Refusing: this run must not talk to the canonical stack.`,
    )
  }
  if (Number(url.port) === CANONICAL_API_PORT) {
    throw new SafeError('The disposable API URL points at the CANONICAL API port. Refusing outright.')
  }

  return { apiUrl, publishableKey, secretKey, serviceRoleKey }
}

/**
 * Stop and REMOVE the disposable stack, targeting its project id
 * EXPLICITLY. `--all` is never used and never will be: it would stop the
 * canonical stack, which this ruling requires be left running and untouched.
 * `--no-backup` deletes the data volume, so no disposable data survives.
 */
export function stopDisposableStack(cli, workdir) {
  const args = [...cli.prefixArgs]
  if (workdir && existsSync(workdir)) args.push('--workdir', workdir)
  args.push('stop', '--project-id', DISPOSABLE_PROJECT_ID, '--no-backup')
  const result = runCapturedExitCode(cli.command, args, { timeout: 5 * 60 * 1000 })
  return result.status
}

/** Every disposable container currently present, in any state. */
export function disposableContainersPresent() {
  const suffix = `_${DISPOSABLE_PROJECT_ID}`
  return [...allContainers()].filter((name) => name.endsWith(suffix)).sort()
}

/** Every disposable volume currently present. */
export function disposableVolumesPresent() {
  return [...allVolumes()].filter((name) => name.includes(DISPOSABLE_PROJECT_ID)).sort()
}

/** The disposable stack's own migration and schema census. */
export function readDisposableCensus() {
  const migrations = psqlRows(
    DISPOSABLE_DB_CONTAINER,
    "SELECT string_agg(version, ',' ORDER BY version) FROM supabase_migrations.schema_migrations;",
  )[0]?.[0]
  const fields = psqlRows(DISPOSABLE_DB_CONTAINER, CANONICAL_CENSUS_SQL)[0]
  if (!Array.isArray(fields) || fields.length !== CENSUS_COLUMNS) {
    throw new SafeError(`The disposable census query did not return the expected ${CENSUS_COLUMNS} fields.`)
  }
  return {
    migrations: migrations ?? '',
    census: fields.join('|'),
    appliedMigrations: Number(fields[9]),
    publicFunctions: Number(fields[10]),
    publicTables: Number(fields[11]),
    publicPolicies: Number(fields[12]),
    reports: Number(fields[0]),
    auditEvents: Number(fields[6]),
    authUsers: Number(fields[8]),
  }
}
