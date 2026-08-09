// =====================================================================
// B.E.S.T Coach — Step 7F: local synthetic fixture loader
// =====================================================================
// LOCAL DISPOSABLE DEVELOPMENT DATABASE ONLY.
//
// Usage:
//   npm run fixtures:local              clean load
//   npm run fixtures:local -- --reload  bounded reload, then clean load
//
// Governing authority: docs/plan/STEP_7F_SYNTHETIC_FIXTURE_BASELINE.md
// (ratified 2026-08-03), which is subordinate to Specification v3, its
// amendments, CLAUDE.md and the Implementation Plan.
//
// ABSOLUTE RULES ENFORCED BY THIS FILE
//  * Passwords are read ONLY from an interactive, no-echo TTY. There is no
//    environment-variable path, no CLI path, no file path, no default and
//    no generated password.
//  * No credential is ever printed, logged, serialized, written to a file,
//    or attached to an error. Captured CLI stdout/stderr is never rendered
//    and never interpolated into an exception.
//  * No pattern-based redaction is used anywhere; credential-bearing
//    streams are simply never surfaced.
//  * `.env.local` is never read. dotenv is never used.
//  * Auth users are created only through the supported Auth Admin API with
//    caller-supplied ratified UUIDs. There is no SQL against `auth.users`,
//    no `password_hash`, and no unsupported cast.
//  * The loader refuses to run against anything but the local stack, and
//    contains no login, link, --linked, db push/pull/dump or hosted
//    fallback of any kind.
// =====================================================================

import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import os from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------
// Ratified constants. Every value below is a fixed literal from the
// ratified fixture baseline. Nothing here is generated at runtime.
// ---------------------------------------------------------------------

const PROJECT_ID = 'best-coach-mvp'
const DB_CONTAINER = 'supabase_db_best-coach-mvp'
const EXPECTED_API_PORT = 54321
const EXPECTED_DB_PORT = 54322
const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '[::1]'])

// There is deliberately no Student Auth identity: `students` carries no
// auth or account linkage column at all.
const IDENTITIES = [
  { key: 'management', label: 'Management', email: 'management.fixture@example.test', authId: 'd0000000-0000-4000-8000-000000000001' },
  { key: 'trainer',    label: 'Trainer',    email: 'trainer.fixture@example.test',    authId: 'd0000000-0000-4000-8000-000000000002' },
  { key: 'parent',     label: 'Parent',     email: 'parent.fixture@example.test',     authId: 'd0000000-0000-4000-8000-000000000003' },
]

const FIXTURE_EMAILS = new Set(IDENTITIES.map((i) => i.email))

// Existence probes for the clean-load preflight: one representative fixed
// UUID per fixture table, all ratified literals.
const FIXTURE_PROBES = [
  ['accounts', 'id', 'c0000000-0000-4000-8000-000000000001'],
  ['centre_memberships', 'id', 'c1000000-0000-4000-8000-000000000001'],
  ['trainer_profiles', 'membership_id', 'c1000000-0000-4000-8000-000000000002'],
  ['parent_profiles', 'membership_id', 'c1000000-0000-4000-8000-000000000003'],
  ['students', 'id', 'c2000000-0000-4000-8000-000000000001'],
  ['parent_student_links', 'id', 'c3000000-0000-4000-8000-000000000001'],
  ['class_modules', 'id', 'c4000000-0000-4000-8000-000000000001'],
  ['class_sessions', 'id', 'c5000000-0000-4000-8000-000000000001'],
  ['enrolments', 'id', 'c6000000-0000-4000-8000-000000000001'],
  ['class_session_assignments', 'id', 'c7000000-0000-4000-8000-000000000001'],
  ['attendance', 'id', 'c8000000-0000-4000-8000-000000000001'],
  ['observations', 'id', 'c9000000-0000-4000-8000-000000000001'],
  ['observation_ratings', 'id', 'ca000000-0000-4000-8000-000000000001'],
]

const CANONICAL_BEGIN = '<<<BEST_COACH_FIXTURE_CANONICAL_BEGIN>>>'
const CANONICAL_END = '<<<BEST_COACH_FIXTURE_CANONICAL_END>>>'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..', '..')

// ---------------------------------------------------------------------
// Safe output. Only phase labels, PASS/FAIL labels, counts, the final
// checksum and a completion message may ever reach a stream.
// ---------------------------------------------------------------------

const say = (message) => process.stdout.write(`${message}\n`)
const phase = (message) => say(`\n[ ${message} ]`)
const pass = (message) => say(`  PASS  ${message}`)
const info = (message) => say(`  ....  ${message}`)

/**
 * A failure that is safe to surface. The message is authored here and
 * never derived from captured output, an Auth response body, a connection
 * string or any credential-bearing value.
 */
class SafeError extends Error {
  constructor(message) {
    super(message)
    this.name = 'SafeError'
  }
}

// ---------------------------------------------------------------------
// Argument parsing. Only `--reload` is accepted; anything else aborts
// before any mutation.
// ---------------------------------------------------------------------

function parseArgs(argv) {
  const args = argv.slice(2)
  if (args.length === 0) return { reload: false }
  if (args.length === 1 && args[0] === '--reload') return { reload: true }
  throw new SafeError('Unsupported argument. Usage: npm run fixtures:local [-- --reload]')
}

// ---------------------------------------------------------------------
// Project resolution and local-only guards.
// ---------------------------------------------------------------------

function readConfigToml() {
  const configPath = join(REPO_ROOT, 'supabase', 'config.toml')
  if (!existsSync(configPath)) {
    throw new SafeError('supabase/config.toml was not found; run this from the MVP repository.')
  }
  return readFileSync(configPath, 'utf8')
}

/** Read `port` from a named top-level TOML section, e.g. [api] or [db]. */
function tomlSectionPort(toml, section) {
  const lines = toml.split(/\r?\n/)
    const marker = `[${section}]`
  let inSection = false
  for (const raw of lines) {
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

function tomlProjectId(toml) {
  const match = /^project_id\s*=\s*"([^"]+)"/m.exec(toml)
  return match ? match[1] : null
}

function assertProjectGuards() {
  // Never linked: a project reference must not exist.
  if (existsSync(join(REPO_ROOT, 'supabase', '.temp', 'project-ref'))) {
    throw new SafeError('A Supabase project reference exists. This loader is local-only and refuses to run on a linked project.')
  }

  const toml = readConfigToml()

  const projectId = tomlProjectId(toml)
  if (projectId !== PROJECT_ID) {
    throw new SafeError(`Unexpected project id in supabase/config.toml (expected "${PROJECT_ID}").`)
  }

  const apiPort = tomlSectionPort(toml, 'api')
  if (apiPort !== EXPECTED_API_PORT) {
    throw new SafeError(`Unexpected [api] port in supabase/config.toml (expected ${EXPECTED_API_PORT}).`)
  }

  const dbPort = tomlSectionPort(toml, 'db')
  if (dbPort !== EXPECTED_DB_PORT) {
    throw new SafeError(`Unexpected [db] port in supabase/config.toml (expected ${EXPECTED_DB_PORT}).`)
  }

  return { apiPort, dbPort }
}

// Platform -> candidate CLI binary packages, mirroring the resolution the
// project-local `supabase` shim performs itself.
const CLI_PLATFORM_PACKAGES = {
  darwin: { arm64: ['darwin-arm64'], x64: ['darwin-x64'] },
  linux: { arm64: ['linux-arm64', 'linux-arm64-musl'], x64: ['linux-x64', 'linux-x64-musl'] },
  win32: { arm64: ['windows-arm64'], x64: ['windows-x64'] },
}

/**
 * Resolve the project-local, version-pinned Supabase CLI.
 *
 * Windows correctness note: `node_modules/.bin/supabase.cmd` is a BATCH
 * shim, and Node refuses to spawn `.cmd`/`.bat` without `shell: true`
 * (EINVAL). Building a shell command string is exactly what we must not do,
 * so we instead resolve the PACKAGE-LOCAL NATIVE EXECUTABLE that the shim
 * itself would exec — `@supabase/cli-<platform>/bin/supabase[.exe]` — and
 * spawn it directly with `shell: false`.
 *
 * If the native package is unavailable, we fall back to running the
 * project-local shim through THIS Node runtime (`process.execPath` plus
 * `node_modules/supabase/dist/supabase.js`). That is deterministic, uses a
 * fixed argument array, and still involves no shell parsing at all.
 *
 * Never a global install, never `npx`, never PowerShell, never an
 * interpolated shell string, and never an environment-supplied override
 * (`SUPABASE_CLI_BINARY_OVERRIDE` is deliberately NOT honoured here).
 */
function resolveLocalCli() {
  const requireFromRepo = createRequire(join(REPO_ROOT, 'package.json'))
  const platformMap = CLI_PLATFORM_PACKAGES[process.platform]
  const candidates = platformMap ? platformMap[os.arch()] ?? [] : []
  const ext = process.platform === 'win32' ? '.exe' : ''

  for (const suffix of candidates) {
    try {
      const pkgDir = dirname(requireFromRepo.resolve(`@supabase/cli-${suffix}/package.json`))
      const binPath = join(pkgDir, 'bin', `supabase${ext}`)
      if (existsSync(binPath)) {
        return { command: binPath, prefixArgs: [], form: `package-local native executable (@supabase/cli-${suffix})` }
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

function assertLocalApiUrl(rawUrl, expectedPort) {
  let parsed
  try {
    parsed = new URL(rawUrl)
  } catch {
    // The URL itself is not echoed: a malformed value could carry anything.
    throw new SafeError('The local API URL reported by the CLI could not be parsed.')
  }
  if (!LOOPBACK_HOSTS.has(parsed.hostname)) {
    throw new SafeError('The reported API URL is not a loopback address. This loader refuses any non-local target.')
  }
  const port = parsed.port === '' ? (parsed.protocol === 'https:' ? 443 : 80) : Number(parsed.port)
  if (port !== expectedPort) {
    throw new SafeError(`The reported API port does not match supabase/config.toml (expected ${expectedPort}).`)
  }
  return rawUrl
}

// ---------------------------------------------------------------------
// Credential acquisition. Both streams are piped and neither is ever
// rendered. Only two fields are read out of the parsed object, which is
// then dropped; it is never logged or serialized.
// ---------------------------------------------------------------------

function captureLocalStatus(cli, expectedApiPort) {
  const result = spawnSync(cli.command, [...cli.prefixArgs, 'status', '-o', 'json'], {
    cwd: REPO_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
  })

  if (result.error) {
    throw new SafeError('Could not invoke the project-local Supabase CLI.')
  }
  if (result.status !== 0) {
    // Captured stderr is deliberately NOT interpolated: it can embed keys.
    throw new SafeError(
      `The local Supabase stack does not appear to be running (CLI exit ${result.status}). ` +
        'Start it yourself, then re-run. This loader never starts or stops Supabase.',
    )
  }

  let parsed
  try {
    parsed = JSON.parse(result.stdout)
  } catch {
    throw new SafeError('The CLI status output could not be parsed as JSON.')
  }

  // Field names are not secrets; values are read for exactly two keys.
  const pick = (...names) => {
    for (const name of names) {
      const value = parsed?.[name]
      if (typeof value === 'string' && value.length > 0) return value
    }
    return null
  }

  const apiUrl = pick('API_URL', 'api_url', 'apiUrl')
  const serviceRoleKey = pick('SERVICE_ROLE_KEY', 'service_role_key', 'serviceRoleKey')

  if (!apiUrl) throw new SafeError('The CLI status output did not contain a local API URL field.')
  if (!serviceRoleKey) throw new SafeError('The CLI status output did not contain a service-role key field.')

  const checkedUrl = assertLocalApiUrl(apiUrl, expectedApiPort)

  // `parsed` and `result` go out of scope here and are never returned,
  // logged or serialized.
  return { apiUrl: checkedUrl, serviceRoleKey }
}

// ---------------------------------------------------------------------
// No-echo password entry. Interactive TTY only. Terminal state is
// restored on every success, failure and cancellation path.
//
// Raw-mode keyboard input arrives as Buffers and is interpreted here as
// NUMBERS. The stream is deliberately left in Buffer mode: calling
// setEncoding() would deliver strings instead, and every numeric byte
// comparison below would then be permanently false — Enter would be
// silently ignored and Ctrl+C would be swallowed into the buffer.
// ---------------------------------------------------------------------

const KEY_CTRL_C = 0x03
const KEY_BACKSPACE = 0x08
const KEY_LINE_FEED = 0x0a
const KEY_CARRIAGE_RETURN = 0x0d
const KEY_DELETE = 0x7f
const KEY_FIRST_PRINTABLE = 0x20

const LINE_PENDING = 'pending'
const LINE_SUBMITTED = 'submitted'
const LINE_EMPTY = 'empty'
const LINE_CANCELLED = 'cancelled'

/**
 * Pure interpreter for one hidden input line.
 *
 * It owns no stream, performs no I/O and prints nothing, so its behaviour
 * can be exercised with synthetic byte sequences without a TTY and without
 * a password. Input accumulates as raw bytes and is decoded as UTF-8 only
 * when the finished line is taken, so multi-byte characters survive intact.
 */
function createSecretLineReader() {
  const bytes = []
  let status = LINE_PENDING
  let terminator = null
  let absorbedLineFeed = false

  const feedByte = (byte) => {
    if (status !== LINE_PENDING) {
      // Everything after a terminal outcome is ignored. A line feed that
      // immediately follows the carriage return of a CRLF pair is absorbed
      // here, which is what stops it reaching the following prompt.
      if (byte === KEY_LINE_FEED && terminator === KEY_CARRIAGE_RETURN) absorbedLineFeed = true
      return
    }
    if (byte === KEY_CTRL_C) {
      bytes.length = 0
      terminator = byte
      status = LINE_CANCELLED
      return
    }
    if (byte === KEY_CARRIAGE_RETURN || byte === KEY_LINE_FEED) {
      terminator = byte
      status = bytes.length === 0 ? LINE_EMPTY : LINE_SUBMITTED
      return
    }
    if (byte === KEY_BACKSPACE || byte === KEY_DELETE) {
      // Remove one whole character, including any UTF-8 continuation bytes.
      while (bytes.length > 0 && (bytes[bytes.length - 1] & 0xc0) === 0x80) bytes.pop()
      bytes.pop()
      return
    }
    if (byte < KEY_FIRST_PRINTABLE) return // every other control byte is ignored
    bytes.push(byte)
  }

  return {
    /**
     * Feed one chunk, byte by byte. Buffers and Uint8Arrays are the normal
     * form; a string is accepted defensively and read by character code.
     */
    feed(chunk) {
      if (typeof chunk === 'string') {
        for (let i = 0; i < chunk.length; i += 1) feedByte(chunk.charCodeAt(i) & 0xff)
      } else {
        for (let i = 0; i < chunk.length; i += 1) feedByte(chunk[i])
      }
      return status
    },
    get status() {
      return status
    },
    get terminator() {
      return terminator
    },
    /** True once the line feed of a CRLF pair has been consumed here. */
    get absorbedLineFeed() {
      return absorbedLineFeed
    },
    /** Cancel from a source other than the keyboard, such as SIGINT. */
    cancel() {
      if (status === LINE_PENDING) {
        bytes.length = 0
        status = LINE_CANCELLED
      }
      return status
    },
    /** Hand over the assembled line once, clearing the buffer. */
    take() {
      const secret = Buffer.from(bytes).toString('utf8')
      bytes.length = 0
      return secret
    },
    clear() {
      bytes.length = 0
    },
  }
}

/**
 * Prompt once per identity, in the fixed order Management, Trainer, Parent.
 * No echo, no confirmation, no length feedback, no defaults and no
 * alternative source.
 *
 * One raw-mode session, one `data` listener and one temporary `SIGINT`
 * handler serve all three prompts. Holding a single listener across the
 * sequence is what guarantees a stray line feed cannot be delivered to the
 * next prompt and submit it as empty.
 */
async function promptForPasswords() {
  const input = process.stdin

  if (!input.isTTY || typeof input.setRawMode !== 'function') {
    throw new SafeError('An interactive terminal is required to enter fixture passwords.')
  }

  const wasRaw = input.isRaw === true

  let reader = null
  let settle = null
  let skipLineFeed = false
  let cancelledBetweenPrompts = false

  const complete = (status) => {
    if (settle === null) return
    const deliver = settle
    settle = null
    deliver(status)
  }

  const onData = (chunk) => {
    let bytes = typeof chunk === 'string' ? Buffer.from(chunk, 'latin1') : chunk
    if (skipLineFeed) {
      skipLineFeed = false
      if (bytes.length > 0 && bytes[0] === KEY_LINE_FEED) bytes = bytes.slice(1)
    }
    if (bytes.length === 0) return
    if (reader === null || settle === null) return // between prompts: discarded
    if (reader.feed(bytes) !== LINE_PENDING) {
      skipLineFeed = reader.terminator === KEY_CARRIAGE_RETURN && !reader.absorbedLineFeed
      complete(reader.status)
    }
  }

  const onSigint = () => {
    if (reader !== null && settle !== null) {
      complete(reader.cancel())
      return
    }
    cancelledBetweenPrompts = true
  }

  const readLine = (promptText) =>
    new Promise((resolveLine) => {
      reader = createSecretLineReader()
      settle = resolveLine
      process.stdout.write(promptText)
      input.resume()
    })

  const cancelled = () => new SafeError('Cancelled at the password prompt. Nothing was created.')

  const secrets = new Map()

  input.setRawMode(true)
  input.on('data', onData)
  process.on('SIGINT', onSigint)

  try {
    for (const identity of IDENTITIES) {
      if (cancelledBetweenPrompts) throw cancelled()
      // The prompt names the role only. No password value is ever echoed.
      const status = await readLine(`  ${identity.label} fixture password (input hidden): `)
      process.stdout.write('\n')
      if (status === LINE_CANCELLED) throw cancelled()
      if (status === LINE_EMPTY) {
        throw new SafeError('An empty password was entered. Aborting rather than selecting another path.')
      }
      secrets.set(identity.key, reader.take())
    }
    if (cancelledBetweenPrompts) throw cancelled()
    return secrets
  } catch (error) {
    secrets.clear()
    throw error
  } finally {
    if (reader !== null) reader.clear()
    reader = null
    settle = null
    input.removeListener('data', onData)
    process.removeListener('SIGINT', onSigint)
    try {
      input.setRawMode(wasRaw)
    } catch {
      // Restoring the terminal must never mask the original outcome.
    }
    // ALWAYS pause. `isPaused()` reports false for a stdin nothing has touched
    // yet (readableFlowing is null, not false), so a "restore whatever we
    // found" conditional never fires, and the resume() in readLine() would
    // leave the stdin handle referenced. That keeps the Node event loop alive
    // after the run has finished, which is what forced an operator Ctrl+C.
    input.pause()
  }
}

// ---------------------------------------------------------------------
// Local SQL execution channel: docker exec -i into the local container's
// own psql. SQL arrives on stdin; no database password is ever passed as
// an argument; both streams are captured.
// ---------------------------------------------------------------------

// Fixed psql argument prefix, used identically by every SQL invocation.
// `--no-psqlrc` matters for correctness as well as safety: a stray
// ~/.psqlrc inside the container could change output formatting and
// silently corrupt the canonical checksum region.
// The role and database are the local Supabase defaults: the Step 7E
// migration and all 22 tables are `postgres`-owned, and with RLS enabled,
// zero policies and zero client grants, `postgres` is the only role that
// can apply or verify this data. Authentication is the container's local
// socket trust, so NO password is passed, prompted for, or embedded.
// `VERBOSITY=verbose` makes psql prefix every server error with its
// five-character SQLSTATE. Only that code is ever extracted (see below); it
// carries no message text, no row data and no connection detail, and it is
// what distinguishes a syntax error from a constraint violation when a
// failure raises no authored marker at all. Verbosity affects stderr only,
// so the canonical checksum region on stdout is untouched.
const PSQL_PREFIX = [
  'psql',
  '--no-psqlrc',
  '--username=postgres',
  '--dbname=postgres',
  '--set=ON_ERROR_STOP=1',
  '--set=VERBOSITY=verbose',
  '--quiet',
]

/**
 * Only strings this project authored may be surfaced from psql's stderr.
 * This is an ALLOW-LIST of our own assertion markers, not redaction of an
 * untrusted stream: nothing outside these authored prefixes is ever shown.
 */
const AUTHORED_SQL_DIAGNOSTIC = /(FAIL [A-Z]\d+:|Step 7F (?:load|cleanup)[^:]*aborted:|Step 7F: )/

/**
 * The SQLSTATE of a server error, and nothing else on the line. A raw
 * PostgreSQL failure (a syntax error, a constraint violation) carries no
 * authored marker, so without this the loader could only report an exit
 * code. The code alone is surfaced — never the accompanying message.
 */
const SQLSTATE_CODE = /ERROR:\s+([0-9A-Z]{5}):/

function assertContainerRunning() {
  const result = spawnSync('docker', ['ps', '--filter', `name=^/${DB_CONTAINER}$`, '--format', '{{.Names}}'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
  })
  if (result.error) throw new SafeError('Docker is not available on PATH.')
  if (result.status !== 0) throw new SafeError(`Could not query Docker for the local database container (exit ${result.status}).`)
  if (result.stdout.trim() !== DB_CONTAINER) {
    throw new SafeError(
      `The local database container "${DB_CONTAINER}" is not running. ` +
        'Start the local stack yourself, then re-run. This loader never starts or stops Supabase.',
    )
  }
}

/**
 * Run a SQL file through the container's psql.
 * `psqlVars` are internal booleans only — never user input, never secrets.
 */
function runSqlFile(relativePath, psqlVars = {}) {
  const sqlPath = join(HERE, relativePath)
  if (!existsSync(sqlPath)) throw new SafeError(`Missing fixture SQL file: scripts/fixtures/${relativePath}`)
  const sql = readFileSync(sqlPath, 'utf8')

  // Argument ARRAY only — never an interpolated shell string. No host
  // connection string, no password, and SQL only ever arrives on stdin.
  const args = ['exec', '-i', DB_CONTAINER, ...PSQL_PREFIX]
  for (const [name, value] of Object.entries(psqlVars)) {
    args.push(`--set=${name}=${value}`)
  }

  const result = spawnSync('docker', args, {
    input: sql,
    stdio: ['pipe', 'pipe', 'pipe'],
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
    maxBuffer: 32 * 1024 * 1024,
  })

  if (result.error) throw new SafeError('Could not execute SQL through the local database container.')

  // The raw psql error stream is NEVER rendered. Only lines carrying an
  // assertion marker this project authored are extracted, and only the
  // authored marker text itself is surfaced.
  if (result.status !== 0) {
    const lines = (result.stderr || '').split(/\r?\n/)

    const authored = lines
      .map((line) => {
        const match = AUTHORED_SQL_DIAGNOSTIC.exec(line)
        return match ? line.slice(match.index).trim() : null
      })
      .filter((line) => line !== null)

    // Distinct SQLSTATEs only, so a cascade of identical codes stays short.
    // Nothing but the five-character code itself is taken from the line.
    const states = [...new Set(lines.map((line) => SQLSTATE_CODE.exec(line)?.[1]).filter(Boolean))]

    const detail = [...authored, ...states.map((code) => `SQLSTATE ${code}`)].slice(0, 12)

    // Naming the file and the selected operation costs nothing and is the
    // difference between a diagnosable failure and a bare exit code.
    const operation = Object.entries(psqlVars)
      .filter(([, value]) => value === 'true')
      .map(([name]) => name)
      .join(', ')

    throw new SafeError(
      `SQL step failed: scripts/fixtures/${relativePath}` +
        `${operation ? ` (${operation})` : ''} — psql exit ${result.status}.` +
        `${detail.length > 0 ? `\n${detail.join('\n')}` : ''}`,
    )
  }

  return result.stdout || ''
}

/** Count fixture rows still present, using the ratified fixed UUIDs only. */
function countExistingFixtureRows() {
  const unions = FIXTURE_PROBES.map(
    ([table, column, id]) => `SELECT '${table}' AS t, count(*) AS c FROM public.${table} WHERE ${column} = '${id}'`,
  ).join(' UNION ALL ')

  const args = ['exec', '-i', DB_CONTAINER, ...PSQL_PREFIX, '--tuples-only', '--no-align', '--field-separator=|']
  const result = spawnSync('docker', args, {
    input: `SELECT t, c FROM (${unions}) AS probes ORDER BY t;\n`,
    stdio: ['pipe', 'pipe', 'pipe'],
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
  })
  if (result.error || result.status !== 0) {
    throw new SafeError('Could not run the fixture preflight query against the local database.')
  }

  let total = 0
  for (const line of (result.stdout || '').split(/\r?\n/)) {
    const parts = line.trim().split('|')
    if (parts.length === 2 && /^\d+$/.test(parts[1])) total += Number(parts[1])
  }
  return total
}

/**
 * Count P1-T09a expansion rows.
 *
 * The expansion deliberately uses UUID prefixes DISJOINT from the ratified
 * `cN000000-` family (e2… students, e4… modules, e5… sessions, e6…
 * enrolments, e7… assignments, e8… attendance, e9… observations, ea…
 * ratings) so it stays invisible to the canonical fixture checksum. That
 * same disjointness is why the ratified FIXTURE_PROBES above cannot see it,
 * and why this separate probe is required rather than a wider one.
 */
function countExpansionRows() {
  const probes = [
    ['students', 'e2'],
    ['class_modules', 'e4'],
    ['class_sessions', 'e5'],
    ['enrolments', 'e6'],
    ['class_session_assignments', 'e7'],
    ['attendance', 'e8'],
    ['observations', 'e9'],
    ['observation_ratings', 'ea'],
  ]
  const unions = probes
    .map(([table, prefix]) => `SELECT count(*) AS c FROM public.${table} WHERE id::text LIKE '${prefix}______-%'`)
    .join(' UNION ALL ')

  const args = ['exec', '-i', DB_CONTAINER, ...PSQL_PREFIX, '--tuples-only', '--no-align']
  const result = spawnSync('docker', args, {
    input: `SELECT sum(c) FROM (${unions}) AS expansion_probes;\n`,
    stdio: ['pipe', 'pipe', 'pipe'],
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
  })
  if (result.error || result.status !== 0) {
    // Fail CLOSED. An unreadable probe must never be treated as "zero rows",
    // because that is precisely the reading that lets the wedge through.
    throw new SafeError('Could not run the P1-T09a expansion preflight query against the local database.')
  }
  const raw = (result.stdout || '').trim().split(/\r?\n/)[0].trim()
  if (!/^\d+$/.test(raw)) return 0 // sum() over zero rows returns empty, which is a legitimate zero.
  return Number(raw)
}

// ---------------------------------------------------------------------
// Auth Admin operations. Supported methods only.
// ---------------------------------------------------------------------

function makeAdminClient(apiUrl, serviceRoleKey) {
  return createClient(apiUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  })
}

/**
 * Locate fixture Auth users by EXACT normalized equality against the three
 * complete reserved emails. No prefix, suffix, wildcard or domain-wide
 * matching, and no remembered mapping file.
 */
async function findFixtureAuthUsers(admin) {
  const matched = []
  const perPage = 1000
  for (let page = 1; page <= 100; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) throw new SafeError('Could not list local Auth users through the Auth Admin API.')
    const users = data?.users ?? []
    for (const user of users) {
      const email = typeof user.email === 'string' ? user.email.trim().toLowerCase() : ''
      if (FIXTURE_EMAILS.has(email)) matched.push({ id: user.id, email })
    }
    if (users.length < perPage) break
  }

  if (matched.length > IDENTITIES.length) {
    throw new SafeError(`Found ${matched.length} fixture Auth users, which exceeds the ratified maximum of ${IDENTITIES.length}. Aborting.`)
  }
  return matched
}

/** Hard-delete only the exact ids supplied. Never a broad sweep. */
async function deleteAuthUsers(admin, users) {
  let deleted = 0
  for (const user of users) {
    const { error } = await admin.auth.admin.deleteUser(user.id, false)
    if (error) throw new SafeError('Could not delete a fixture Auth user through the Auth Admin API.')
    deleted += 1
  }
  return deleted
}

/**
 * Create the three Auth users with caller-supplied ratified UUIDs, then
 * assert the returned identity matches exactly. A mismatch aborts and
 * compensates; it never adapts and never generates another UUID.
 */
async function createAuthUsers(admin, secrets) {
  const created = []
  for (const identity of IDENTITIES) {
    const password = secrets.get(identity.key)
    if (typeof password !== 'string' || password.length === 0) {
      throw new SafeError(`No password was captured for the ${identity.label} fixture identity.`)
    }

    const { data, error } = await admin.auth.admin.createUser({
      id: identity.authId,
      email: identity.email,
      password,
      email_confirm: true,
    })

    if (error) {
      // The Auth error object is never surfaced: it can echo the request.
      throw Object.assign(new SafeError(`Auth creation failed for the ${identity.label} fixture identity.`), { created })
    }

    const user = data?.user
    if (!user || user.id !== identity.authId) {
      throw Object.assign(
        new SafeError(
          `The Auth service returned a different id than the ratified literal for the ${identity.label} fixture identity. ` +
            'Aborting rather than adapting: the ratified design requires deterministic Auth UUIDs.',
        ),
        { created: user ? [...created, { id: user.id, email: identity.email }] : created },
      )
    }

    const returnedEmail = typeof user.email === 'string' ? user.email.trim().toLowerCase() : ''
    if (returnedEmail !== identity.email) {
      throw Object.assign(
        new SafeError(`The Auth service returned a different email than the reserved address for the ${identity.label} fixture identity.`),
        { created: [...created, { id: user.id, email: returnedEmail }] },
      )
    }

    created.push({ id: user.id, email: identity.email })
  }
  return created
}

/** Compensating rollback for Auth users created during THIS run only. */
async function compensate(admin, created) {
  if (created.length === 0) return { compensated: true, remaining: 0 }
  try {
    await deleteAuthUsers(admin, created)
    return { compensated: true, remaining: 0 }
  } catch {
    return { compensated: false, remaining: created.length }
  }
}

// ---------------------------------------------------------------------
// Canonical checksum. SHA-256 over the canonical region emitted by
// verify-local-fixtures.sql, computed with Node's built-in crypto.
// ---------------------------------------------------------------------

function canonicalChecksum(verifyStdout) {
  const lines = verifyStdout.split(/\r?\n/)
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

// ---------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------

async function main() {
  const { reload } = parseArgs(process.argv)

  phase('Guards')
  const { apiPort } = assertProjectGuards()
  const cli = resolveLocalCli()
  pass('local-only guards satisfied (no project reference, ports match, project id matches)')
  info(`CLI resolved as: ${cli.form}`)

  assertContainerRunning()
  pass(`local database container "${DB_CONTAINER}" is running`)

  phase('Local connection')
  const { apiUrl, serviceRoleKey } = captureLocalStatus(cli, apiPort)
  pass('local API URL and service-role key captured into process memory only')

  const admin = makeAdminClient(apiUrl, serviceRoleKey)

  // -------------------------------------------------------------------
  // P1-T09a EXPANSION GUARD — runs BEFORE either path, and mutates nothing.
  //
  // The P1-T09a fixture expansion (scripts/fixtures/local_fixtures_expansion.sql)
  // attaches rows to the RATIFIED trainer membership c1000000-…-002 under
  // ON DELETE RESTRICT. local_fixtures.sql's teardown deletes exactly that
  // membership, so a --reload with expansion rows present dies mid-teardown
  // on a foreign-key violation.
  //
  // Why that is worse than an ordinary failure: this script is the ONLY way
  // to recreate the three synthetic Auth identities, it requires three
  // no-echo passwords that only the Operator can type (CLAUDE.md §11), and
  // `supabase db reset` is prohibited outright. An Operator who hit this
  // would be wedged on the one path no agent can run for them.
  //
  // So this fails CLOSED, before the teardown starts, and names the exact
  // remediation command rather than leaving them to diagnose an FK error.
  const expansionRows = countExpansionRows()
  if (expansionRows > 0) {
    throw new SafeError(
      `${expansionRows} P1-T09a expansion row(s) are present. They foreign-key to the ratified ` +
        'trainer membership under ON DELETE RESTRICT, so the fixture teardown would fail partway ' +
        'through.\n\nRemove them first, then re-run this command:\n\n' +
        '  docker exec -i supabase_db_best-coach-mvp psql --no-psqlrc --username=postgres ' +
        '--dbname=postgres -v do_expand=false -v do_expand_cleanup=true ' +
        '< scripts/fixtures/local_fixtures_expansion.sql\n\n' +
        'Nothing was created, deleted or modified by this run.',
    )
  }
  pass('no P1-T09a expansion row is present; the fixture teardown path is unobstructed')

  if (reload) {
    phase('Reload — bounded teardown')
    runSqlFile('local_fixtures.sql', { do_cleanup: 'true', do_load: 'false' })
    pass('fixture domain rows deleted in reverse-FK order; Step 7E seed boundary re-asserted')

    const existing = await findFixtureAuthUsers(admin)
    const removed = await deleteAuthUsers(admin, existing)
    pass(`fixture Auth users removed: ${removed} (matched by exact reserved email only)`)
  }

  phase('Clean-load preflight')
  const existingAuth = await findFixtureAuthUsers(admin)
  if (existingAuth.length > 0) {
    throw new SafeError(
      `${existingAuth.length} fixture Auth user(s) already exist. ` +
        'Re-run with `-- --reload` to replace the fixture. Nothing was created, deleted or modified.',
    )
  }
  const existingRows = countExistingFixtureRows()
  if (existingRows > 0) {
    throw new SafeError(
      `${existingRows} fixture domain row(s) already exist. ` +
        'Re-run with `-- --reload` to replace the fixture. Nothing was created, deleted or modified.',
    )
  }
  pass('no fixture Auth user and no fixture domain row exists')

  phase('Fixture passwords')
  info('entered on this terminal only; never stored, printed, logged or transmitted')
  const secrets = await promptForPasswords()

  phase('Auth identities')
  let created = []
  try {
    created = await createAuthUsers(admin, secrets)
    pass(`3 Auth users created with the ratified deterministic UUIDs`)
  } catch (error) {
    secrets.clear()
    const partial = Array.isArray(error?.created) ? error.created : []
    const { compensated, remaining } = await compensate(admin, partial)
    if (!compensated) {
      throw new SafeError(
        `${error.message}\n` +
          `Compensation failed: ${remaining} fixture Auth user(s) may remain. ` +
          'Re-run with `-- --reload` to remove them.',
      )
    }
    throw new SafeError(`${error.message}\nCompensation succeeded: no fixture Auth user remains.`)
  } finally {
    // Passwords are not retained beyond the Auth creation phase.
    secrets.clear()
  }

  phase('Domain fixture')
  try {
    runSqlFile('local_fixtures.sql', { do_cleanup: 'false', do_load: 'true' })
    pass('25 application-domain rows loaded in one transaction')
  } catch (error) {
    const { compensated, remaining } = await compensate(admin, created)
    if (!compensated) {
      throw new SafeError(
        `${error.message}\n` +
          `Compensation failed: ${remaining} fixture Auth user(s) may remain. ` +
          'Re-run with `-- --reload` to remove them.',
      )
    }
    throw new SafeError(`${error.message}\nCompensation succeeded: no fixture Auth user remains; the domain transaction rolled back.`)
  }

  phase('Verification')
  let verifyOut
  try {
    verifyOut = runSqlFile('verify-local-fixtures.sql')
  } catch (error) {
    // The fixture loaded and COMMITTED; verification is an assertion about
    // it, and every negative test rolls itself back. Deleting the fixture
    // here would destroy the evidence needed to diagnose the failure, so the
    // bounded compensation is REPORTED rather than performed.
    throw new SafeError(
      `${error.message}\n` +
        'No compensation was performed: the 3 fixture Auth users and 25 domain rows remain loaded, ' +
        'so the failure can be diagnosed against real state. ' +
        'Re-run with `-- --reload` to replace them.',
    )
  }
  pass('positive assertions, negative tests and residue proof all passed')

  const { rows, sha256 } = canonicalChecksum(verifyOut)
  say('')
  say(`  Auth users ............ 3`)
  say(`  Domain rows ........... 25`)
  say(`  Canonical rows ........ ${rows}`)
  say(`  Canonical SHA-256 ..... ${sha256}`)
  say('')
  say('Local synthetic fixture is loaded and verified.')
}

main()
  .catch((error) => {
    const message = error instanceof SafeError ? error.message : 'The fixture loader failed.'
    process.stderr.write(`\nFAILED: ${message}\n`)
    process.exitCode = 1
  })
  .finally(() => {
    // Nothing may keep the event loop alive once the run is over. stdin is
    // resumed during password entry, and a referenced stdin handle makes the
    // process wait for input that will never arrive -- setting process.exitCode
    // does not force an exit. This is the last line of defence for both the
    // success and the failure path.
    process.stdin.pause()
    if (typeof process.stdin.unref === 'function') process.stdin.unref()
  })
