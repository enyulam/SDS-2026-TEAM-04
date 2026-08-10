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
import { assertConfigProjectId, resolveLocalTarget } from '../fixtures/local-target-guard.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
export const REPO_ROOT = resolve(HERE, '..', '..')

// ---------------------------------------------------------------------
// The canonical environment — SACRED. Every value is a fixed literal and
// this module only ever asserts them, never changes them.
// ---------------------------------------------------------------------

// ⚠️ "CANONICAL" MEANS *THIS REPOSITORY'S* LOCAL STACK — and since the
// development clone took its own project id, that is no longer the stack the
// former literals named. The demonstration workspace's stack is still running
// under `best-coach-mvp`, so a literal here would point this harness's
// "sacred, never modified" assertions at the FROZEN database.
//
// Resolved through the guard instead: hard-deny of the frozen project first,
// then a positive pin from BEST_COACH_LOCAL_PROJECT_ID.
const CANONICAL_TARGET = resolveLocalTarget()
export const CANONICAL_PROJECT_ID = CANONICAL_TARGET.projectId
export const CANONICAL_DB_CONTAINER = CANONICAL_TARGET.dbContainer
export const CANONICAL_API_PORT = 54421
export const CANONICAL_DB_PORT = 54422
export const CANONICAL_STUDIO_PORT = 54423
export const CANONICAL_INBUCKET_PORT = 54424

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
// (Moved 10 -> 11 at Run C3-A Phase 1. The eleventh committed migration is
// the single-entry-point closure: one REVOKE and no object at all, so the
// fixture checksum and the 28-row canonical region above are UNMOVED.)
// (Moved 11 -> 12 at Run C3-A Phase 2b, C2C-004. The twelfth committed
// migration adds EXACTLY ONE read function — the governed Management
// submitted-report list — and one authenticated EXECUTE grant. It creates no
// table, enum, label, policy or row, so the fixture checksum and the 28-row
// canonical region above are again UNMOVED.)
// (Moved 12 -> 14 at P1-T03, OD-4. The thirteenth migration is the OD-4
// four-panel report contract: it replaces four report_versions columns and
// adds EXACTLY TWO functions -- the V2 content and wording serializers, both
// owner-only with zero client EXECUTE -- so functions go 34 -> 36 while
// tables, enums, policies and the authenticated EXECUTE census are all
// UNMOVED. The fourteenth is the envelope-version forward fix: a single
// CREATE OR REPLACE that creates no object at all, so the census and the
// 28-row canonical region above are again UNMOVED.
//
// ⚠️ This pin was missed by the M13 sweep AND by the first M14 sweep, and was
// found only by adversarial review. It is a migration-count census pin of the
// class §6.5 item 4 governs, but it is a BARE SYMBOLIC CONSTANT rather than a
// numeric literal sitting next to the word "migration", so greps written for
// the other ten pins do not surface it. It is exported and consumed at 11
// call sites across 6 harnesses, 4 of which are npm entry points, and it
// fails CLOSED -- every disposable-stack run aborts until it is re-pinned.
// RE-PIN IT IN THE SAME COMMIT AS ANY NEW MIGRATION.)
// (Moved 14 -> 15 at the M15 default-removal checkpoint. M15 removes the
// report_versions.content_hash_version DATABASE DEFAULT by Operator ruling:
// it adds and drops NO object, so functions/tables/enums/policies and the
// fixture checksum are all UNMOVED -- only the migration count changes.)
//
// (Moved 15 -> 17 at STAGE 3, clearing blocker B-STAGE3-1. M16 is the
// governed attendance write path; M17 is report_source_map. Stage 1 added
// both and MISSED this pin -- the third time it has been missed -- so every
// disposable-stack run had been aborting.
//
// ⚠️ THIS VALUE WAS DERIVED FROM A LIVE READING, NOT TRANSCRIBED. It is
// `readCanonical().counts.appliedMigrations` measured against the running
// canonical container, which returned 17, matching the 17 committed .sql
// files on disk. The fixture checksum was RE-MEASURED in the same reading
// rather than assumed unmoved by two DDL-only migrations: it came back
// 6bdff280...c576 over 28 rows, byte-identical to the pin above. That is a
// MEASUREMENT, not an assumption -- and see EXPECTED_CANONICAL_OBSERVATIONS
// below for the pin in this same function where "assumed unmoved" was in
// fact WRONG.)
export const EXPECTED_CANONICAL_MIGRATIONS = 17

/**
 * Whole-table `public.observations` count in the ratified canonical baseline.
 *
 * ⚠️ 2, NOT 1. The P1-T09a additive expansion
 * (`scripts/fixtures/local_fixtures_expansion.sql`) adds a SECOND observation
 * in the deliberately-disjoint `e9000000-%` UUID family, so the whole-table
 * count is 2 while the base Step 7F fixture contributes 1.
 *
 * This pin went stale SILENTLY and for a subtle reason worth stating, because
 * it is the reason a checksum match is NOT evidence that a count is unmoved:
 * the fixture checksum is PREFIX-SCOPED (`id::text LIKE 'cN000000-%'`), by
 * explicit design, so the expansion is INVISIBLE to it. The checksum
 * therefore still matches byte-for-byte while this count has moved 1 -> 2.
 * A harness that trusted the checksum to cover the census would pass the
 * checksum branch and then abort here with no obvious cause.
 *
 * Exported so the second consumer (`prove-disposable-app.mjs`, the A-19
 * post-teardown residue re-read) shares ONE definition instead of repeating a
 * bare `=== 1` literal, which is exactly how this drifted out of step.
 */
export const EXPECTED_CANONICAL_OBSERVATIONS = 2
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

/**
 * Read a PostgreSQL boolean out of a `psql` field.
 *
 * `--tuples-only --no-align` renders a BARE boolean as `t`/`f`, but an
 * EXPLICIT `::text` cast renders it as `true`/`false`. Both spellings occur
 * in the queries this repository issues, and a reader that accepted only one
 * of them would silently treat every measured `true` as `false` — an absence
 * of evidence dressed up as evidence of absence. That is not hypothetical:
 * it is the defect this helper exists to make unrepeatable.
 *
 * Anything that is neither spelling returns `null`, so an UNREADABLE field
 * can never be mistaken for a measured `false`. Callers must therefore test
 * `=== true` / `=== false` and treat `null` as "not measured".
 */
export function readBoolean(field) {
  if (field === 't' || field === 'true') return true
  if (field === 'f' || field === 'false') return false
  return null
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
  if (reading.counts.observations !== EXPECTED_CANONICAL_OBSERVATIONS) {
    failures.push(`observations=${reading.counts.observations} (expected ${EXPECTED_CANONICAL_OBSERVATIONS})`)
  }
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
  // Frozen-project hard deny first, then the positive pin. A config that has
  // drifted to the demonstration project is refused as a DENY, not reported
  // as a pin mismatch — the two mean very different things here.
  assertConfigProjectId(/^project_id\s*=\s*"([^"]+)"/m.exec(toml)?.[1] ?? null, CANONICAL_PROJECT_ID)
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
 *
 * NO LOOPBACK PIN IS WRITTEN HERE BECAUSE NONE CAN BE. See
 * `PUBLISHED_PORT_BIND_LIMITATION`: the installed CLI's schema has no bind,
 * host or listen key, so every port below is a bare integer published on all
 * interfaces. The limitation is measured and recorded, not hidden.
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
 * Copy the committed migrations into the disposable workdir and VERIFY each
 * copy is byte-identical to its source by SHA-256. Source fidelity is not a
 * comment here: a copy that differs by one byte stops the run.
 */
function copyCommittedMigrations(workdir) {
  const sourceDir = join(REPO_ROOT, 'supabase', 'migrations')
  const targetDir = join(workdir, 'supabase', 'migrations')
  mkdirSync(targetDir, { recursive: true })

  const names = readdirSync(sourceDir)
    .filter((name) => name.endsWith('.sql'))
    .sort()
  if (names.length !== EXPECTED_CANONICAL_MIGRATIONS) {
    // ⚠️ THE RE-PIN INSTRUCTION LIVES IN THE FAILURE, NOT ONLY IN A COMMENT.
    // A comment saying "re-pin this" has now been missed THREE times (M13,
    // M14, and M16/M17), because the pin is a bare symbolic constant that
    // greps for a numeric literal next to the word "migration" do not
    // surface. Whoever adds migration N+1 will not read the comment -- but
    // they CANNOT avoid reading this, because it fails closed on their very
    // first disposable run. So it names the exact edit sites and the exact
    // way to DERIVE the new values rather than transcribe them.
    throw new SafeError(
      `Expected ${EXPECTED_CANONICAL_MIGRATIONS} committed migrations, found ${names.length}. ` +
        'The disposable stack replays the committed set exactly; it does not guess.\n\n' +
        'A migration was added without re-pinning the census. To clear this:\n' +
        '  1. Bring the CANONICAL stack up, then take a LIVE reading -- do not\n' +
        '     transcribe a number, and do not assume a DDL-only migration left\n' +
        '     the fixture unmoved (that assumption has been wrong before):\n' +
        '       node -e "import(process.argv[1]).then(async m => {\n' +
        '         const r = m.readCanonical();\n' +
        '         console.log(r.counts, r.checksum);\n' +
        '       })" ./scripts/physical-test/disposable-stack.mjs\n' +
        '  2. Re-pin, in scripts/physical-test/disposable-stack.mjs, EVERY field\n' +
        '     the reading moved -- not just the migration count:\n' +
        '       EXPECTED_CANONICAL_MIGRATIONS    (counts.appliedMigrations)\n' +
        '       EXPECTED_CANONICAL_CHECKSUM      (checksum.sha256)\n' +
        '       EXPECTED_CANONICAL_ROWS          (checksum.rows)\n' +
        '       EXPECTED_CANONICAL_OBSERVATIONS  (counts.observations)\n' +
        '     ⚠️ The checksum is PREFIX-SCOPED, so a checksum that still matches\n' +
        '     does NOT prove the whole-table counts are unmoved. Check each one.\n' +
        '  3. Add a dated re-pin note above the constant, recording that the\n' +
        '     value was MEASURED and what the reading returned.',
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
  const restart = denyDisposableAutoRestart()
  return { elapsedMs: Date.now() - started, restart }
}

/**
 * DISPOSABLE RESIDUE HAZARD — a STOPPED disposable container AUTO-RESTARTED.
 *
 * The Supabase CLI creates its containers with a Docker restart policy of
 * `unless-stopped`. That policy is evaluated by the Docker DAEMON, not by this
 * harness: if a run is killed hard (SIGKILL, a host reboot, Docker Desktop
 * restarting) the container can be left in a state the daemon considers
 * eligible for restart, and it comes back on its own — with its NAMED VOLUME
 * still attached, so it comes back with its data. That is a disposable stack
 * outliving the run that owned it, which is exactly the thing the disposable
 * design exists to make impossible.
 *
 * The restart policy is not expressible in the generated `config.toml` (the
 * CLI's embedded schema defines no such key and rejects one it does not know),
 * so it is REMOVED IMMEDIATELY AFTER CREATION instead, with `docker update
 * --restart=no`, targeted BY NAME at containers whose name ends in the
 * disposable project suffix and at no others. A canonical container can
 * therefore never be reached by this call: the suffix `_${DISPOSABLE_PROJECT_ID}`
 * is asserted distinct from the canonical project id by `assertNoCollision()`
 * before anything is provisioned.
 *
 * The result is REPORTED, never assumed: each container's effective policy is
 * re-read from `docker inspect` afterwards, so "auto-restart is off" is a
 * measurement rather than the absence of an error.
 */
export function denyDisposableAutoRestart() {
  const containers = disposableContainersPresent()
  const policies = []
  for (const name of containers) {
    runCapturedExitCode('docker', ['update', '--restart=no', name], { timeout: 60 * 1000 })
    policies.push({ name, policy: containerRestartPolicy(name) })
  }
  return {
    containers: containers.length,
    policies,
    allDisabled: containers.length > 0 && policies.every((entry) => entry.policy === 'no'),
  }
}

/** The effective Docker restart policy of one container, or null if unknown. */
export function containerRestartPolicy(name) {
  const result = spawnSync(
    'docker',
    ['inspect', '--format', '{{.HostConfig.RestartPolicy.Name}}', name],
    { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', windowsHide: true, shell: false },
  )
  if (result.error || result.status !== 0) return null
  const value = (result.stdout || '').trim()
  // Docker reports an absent policy as the empty string; both mean "no".
  return value.length === 0 ? 'no' : value
}

/**
 * The belt-and-braces half of teardown: after the CLI has been asked to stop
 * and remove the disposable project, FORCE-REMOVE anything still carrying the
 * disposable name — the container first, then its NAMED VOLUME.
 *
 * `supabase stop --no-backup` is the primary mechanism and is unchanged. This
 * exists because that call can only remove what it still recognises as its own
 * project: a container the daemon restarted after the CLI's workdir was gone,
 * or a volume left behind when the CLI exited non-zero, is invisible to it and
 * survives — which is precisely the residue that was found.
 *
 * TARGETING IS BY THE DISPOSABLE SUFFIX AND NOTHING ELSE. `docker rm` is never
 * issued with `--all`, a filter, a prune or a wildcard, and never against a
 * name this module did not derive from `DISPOSABLE_PROJECT_ID`.
 */
export function forceRemoveDisposableResidue() {
  const removedContainers = []
  for (const name of disposableContainersPresent()) {
    runCapturedExitCode('docker', ['rm', '--force', '--volumes', name], { timeout: 60 * 1000 })
    removedContainers.push(name)
  }
  const removedVolumes = []
  for (const name of disposableVolumesPresent()) {
    runCapturedExitCode('docker', ['volume', 'rm', '--force', name], { timeout: 60 * 1000 })
    removedVolumes.push(name)
  }
  // Re-read from Docker rather than trusting the calls above.
  return {
    attemptedContainers: removedContainers,
    attemptedVolumes: removedVolumes,
    remainingContainers: disposableContainersPresent(),
    remainingVolumes: disposableVolumesPresent(),
  }
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
  /*
   * The CLI call above is the PRIMARY mechanism and is unchanged. The sweep
   * that follows removes what the CLI can no longer see as its own — a
   * container the Docker daemon restarted on its own, or a named volume left
   * behind by a non-zero CLI exit. Both were observed as surviving residue.
   * It is targeted by the disposable suffix only; see
   * `forceRemoveDisposableResidue`.
   */
  forceRemoveDisposableResidue()
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

/**
 * DOCUMENTED, ACCEPTED LIMITATION — the disposable stack's published ports
 * bind on ALL interfaces, not on loopback only, for the duration of a run.
 *
 * This was checked against the INSTALLED CLI rather than assumed. The
 * project-local Supabase CLI (devDependency `supabase` 2.109.1) embeds its
 * own `config.toml` schema, and every port it exposes there — `api.port`,
 * `db.port`, `db.shadow_port`, `db.pooler.port`, `studio.port`,
 * `local_smtp.port` — is a bare INTEGER. The schema carries no bind address,
 * no host, no listen address and no interface key at any level, and the CLI
 * rejects a key its schema does not define, so a loopback restriction CANNOT
 * BE EXPRESSED in the generated config. The CLI publishes through Docker,
 * which binds 0.0.0.0 by default.
 *
 * It is therefore recorded as an accepted limitation rather than silently
 * left: the runner MEASURES the actual bindings with `disposablePortBindings()`
 * while the stack is up and writes them into its ledger. The exposure is
 * bounded — the stack exists only for the duration of one run, is torn down
 * with `--no-backup` on every exit path, and holds only synthetic fixture
 * data — but it is real while the run is in progress, and an operator reading
 * the ledger is told so in these words.
 */
export const PUBLISHED_PORT_BIND_LIMITATION =
  `the installed Supabase CLI's config schema exposes published ports as bare integers only — it has no bind, host, ` +
  `listen or interface key at any level — so the disposable stack's ports ${DISPOSABLE_PUBLISHED_PORTS.join(', ')} ` +
  'are published by Docker on ALL interfaces (0.0.0.0) for the duration of a run and cannot be pinned to loopback ' +
  'through configuration; this is an accepted, documented limitation, measured and recorded rather than left silent'

/**
 * The ACTUAL published-port bindings of the disposable containers, as Docker
 * reports them. Names and port mappings only — no protocol byte is read and
 * nothing a credential could occupy is examined. Returns an empty array if
 * Docker cannot be queried, so a caller can distinguish "measured" from
 * "unavailable" by checking the length against the containers it expects.
 */
export function disposablePortBindings() {
  const result = spawnSync('docker', ['ps', '-a', '--format', '{{.Names}}\t{{.Ports}}'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
  })
  if (result.error || result.status !== 0) return []
  const suffix = `_${DISPOSABLE_PROJECT_ID}`
  return (result.stdout || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [name, ports] = line.split('\t')
      return { name: (name || '').trim(), ports: (ports || '').trim() }
    })
    .filter((entry) => entry.name.endsWith(suffix) && entry.ports.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name))
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

// ---------------------------------------------------------------------
// Disposable identity linkage. ONE implementation, shared by the
// interactive runner and by its autonomous regression proof, so what is
// proven is the code that actually ships.
// ---------------------------------------------------------------------

/**
 * The committed fixture's single centre. `public.centre_memberships` is the
 * SOLE authority for role, so the linkage check reads role and centre from
 * there and not from the account row.
 */
export const FIXTURE_CENTRE_ID = 'b0000000-0000-4000-8000-000000000001'

/**
 * MEASURE the disposable identity linkage. Nothing here is asserted from the
 * absence of a throw: every clause below is a value read back out of the
 * DISPOSABLE database and compared to an expectation authored in this file.
 *
 * WHY THIS EXISTS. The previous per-row read-back asked psql for
 * `(u.id IS NOT NULL)::text` and then tested the field against `'t'`. An
 * explicit `::text` cast of a boolean renders `true`, never `t`, so that
 * test was false for EVERY row on EVERY run — including runs whose linkage
 * was perfect. It reported the FIRST identity in `DISPOSABLE_IDENTITIES` as
 * unlinked and stopped the run before authentication. The remedy is not to
 * relax the assertion: it is to read the data correctly and then ask MORE of
 * it. This function no longer asks the weak question "is anything joined?"
 * at all. It requires each account row to carry the EXACT expected Auth id.
 *
 * Returns { ok, failures, measured }. `failures` holds authored strings that
 * name a ROLE and a STRUCTURAL fact only; no address, id, token or Auth
 * error object is ever placed in one.
 */
export function verifyDisposableIdentityLinkage() {
  const expectedCount = DISPOSABLE_IDENTITIES.length
  const failures = []

  const counts = psqlRows(
    DISPOSABLE_DB_CONTAINER,
    'SELECT (SELECT count(*) FROM public.accounts)::text, ' +
      '(SELECT count(*) FROM auth.users)::text, ' +
      '(SELECT count(DISTINCT auth_user_id) FROM public.accounts)::text, ' +
      '(SELECT count(*) FROM public.accounts WHERE auth_user_id IS NULL)::text, ' +
      '(SELECT count(*) FROM public.accounts a LEFT JOIN auth.users u ON u.id = a.auth_user_id ' +
      'WHERE u.id IS NULL)::text;',
  )[0]
  if (!Array.isArray(counts) || counts.length !== 5) {
    throw new SafeError('The disposable identity-linkage census did not return the expected 5 fields.')
  }
  const measured = {
    accounts: Number(counts[0]),
    authUsers: Number(counts[1]),
    distinctAuthIds: Number(counts[2]),
    accountsWithoutAuthId: Number(counts[3]),
    danglingAccounts: Number(counts[4]),
    rows: 0,
  }

  if (measured.accounts !== expectedCount) {
    failures.push(`public.accounts holds ${measured.accounts} row(s); exactly ${expectedCount} are required`)
  }
  if (measured.authUsers !== expectedCount) {
    failures.push(`auth.users holds ${measured.authUsers} row(s); exactly ${expectedCount} are required`)
  }
  if (measured.distinctAuthIds !== expectedCount) {
    failures.push(
      `the account rows reference ${measured.distinctAuthIds} DISTINCT Auth id(s); ${expectedCount} are required, ` +
        'so two roles would otherwise share one identity',
    )
  }
  if (measured.accountsWithoutAuthId !== 0) {
    failures.push(`${measured.accountsWithoutAuthId} account row(s) carry no auth_user_id at all`)
  }
  if (measured.danglingAccounts !== 0) {
    failures.push(
      `${measured.danglingAccounts} account row(s) point at an auth.users id that does not exist on this stack`,
    )
  }

  const rows = new Map(
    psqlRows(
      DISPOSABLE_DB_CONTAINER,
      'SELECT a.id::text, a.normalized_email, COALESCE(a.auth_user_id::text, \'none\'), ' +
        "COALESCE(u.id::text, 'none'), COALESCE(u.email, 'none'), COALESCE(m.role::text, 'none'), " +
        "COALESCE(m.centre_id::text, 'none') " +
        'FROM public.accounts a ' +
        'LEFT JOIN auth.users u ON u.id = a.auth_user_id ' +
        "LEFT JOIN public.centre_memberships m ON m.account_id = a.id AND m.status = 'active' " +
        'ORDER BY a.id;',
    )
      .filter((row) => row.length === 7)
      .map((row) => [
        row[0],
        { email: row[1], accountAuthId: row[2], authUserId: row[3], authEmail: row[4], role: row[5], centre: row[6] },
      ]),
  )
  measured.rows = rows.size
  if (rows.size !== expectedCount) {
    failures.push(`the per-row linkage read returned ${rows.size} readable row(s); ${expectedCount} are required`)
  }

  const seenAuthIds = new Set()
  for (const identity of DISPOSABLE_IDENTITIES) {
    const row = rows.get(identity.accountId)
    if (row === undefined) {
      failures.push(`the ${identity.label} account row was not found after the fixture load`)
      continue
    }
    if (row.email !== identity.email) {
      failures.push(
        `the ${identity.label} account row does not carry its disposable address after the re-point ` +
          '(the stored value is deliberately not reported)',
      )
    }
    if (row.accountAuthId !== identity.authId) {
      failures.push(
        `the ${identity.label} account row's auth_user_id is not the id created for the ${identity.label} ` +
          'disposable Auth user',
      )
    }
    if (row.authUserId !== identity.authId) {
      failures.push(
        `the ${identity.label} account row does not resolve to the ${identity.label} disposable auth.users row`,
      )
    }
    if (row.authEmail !== identity.email) {
      failures.push(
        `the auth.users row the ${identity.label} account resolves to does not carry the ${identity.label} ` +
          'disposable address, so it is not the identity this run created',
      )
    }
    if (row.role !== identity.role) {
      failures.push(`the ${identity.label} account has no ACTIVE centre_memberships row with the ${identity.role} role`)
    }
    if (row.centre !== FIXTURE_CENTRE_ID) {
      failures.push(`the ${identity.label} account's active membership is not in the committed fixture centre`)
    }
    seenAuthIds.add(row.authUserId)
  }
  if (seenAuthIds.size !== expectedCount) {
    failures.push(
      `the ${expectedCount} roles resolved to ${seenAuthIds.size} distinct auth.users id(s); they must not be shared`,
    )
  }

  // No account row may point anywhere OUTSIDE the intended disposable set.
  const expectedIds = new Set(DISPOSABLE_IDENTITIES.map((identity) => identity.authId))
  for (const [accountId, row] of rows) {
    if (!expectedIds.has(row.accountAuthId)) {
      const known = DISPOSABLE_IDENTITIES.some((identity) => identity.accountId === accountId)
      failures.push(
        `${known ? 'a known' : 'an unexpected'} account row points at an Auth id outside the intended ` +
          'disposable set',
      )
    }
  }

  return { ok: failures.length === 0, failures, measured }
}

/**
 * The same measurement, failing CLOSED. One authored message, roles only.
 */
export function assertDisposableIdentityLinkage() {
  const report = verifyDisposableIdentityLinkage()
  if (!report.ok) {
    throw new SafeError(
      `The disposable account rows are not correctly linked to this run's disposable Auth users: ` +
        `${report.failures.join('; ')}.`,
    )
  }
  return report
}
