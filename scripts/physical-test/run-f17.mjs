#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach — F17: secure, operator-assisted physical-test runner
// =====================================================================
// LOCAL DISPOSABLE DEVELOPMENT STACK ONLY.
//
// Usage:
//   npm run physical-test:f17                 the operator-assisted run
//   npm run physical-test:f17 -- --help       what it does, in full
//   npm run physical-test:f17 -- --preflight-only
//                                             read-only preflight, no prompt
//
// Governing authority: docs/plan/PHYSICAL_TEST_SLICE_48H.md §13 (the 21
// acceptance gates), which is subordinate to Specification v3, its
// amendments, CLAUDE.md and the Implementation Plan. CLAUDE.md §11
// ("Fixture credentials — absolute") is binding on every line below.
//
// ---------------------------------------------------------------------
// ABSOLUTE RULES ENFORCED BY THIS FILE
// ---------------------------------------------------------------------
//  * Fixture passwords are read ONLY from an interactive, no-echo TTY.
//    There is NO environment-variable path, NO command-line path, NO file
//    path, NO default and NO generated password. Missing input aborts.
//  * A password is held in a local variable, handed to exactly one call
//    (`auth.signInWithPassword`), and dropped. It is never placed in an
//    object that is logged, serialized, returned, thrown or written; never
//    interpolated into a message, a URL or a template string; and never
//    sent to the browser, to a child process argument or to an evidence
//    file.
//  * No credential-bearing stream is ever rendered. Child stdout and
//    stderr are captured and DISCARDED — only an exit code survives.
//  * NO pattern-based redaction is used anywhere. Filtering a
//    credential-bearing stream has already failed once in this project;
//    the rule here is that such a stream is never surfaced at all.
//  * `.env.local` is never read. dotenv is never used. Local connection
//    values are captured into process memory only, from the project-local
//    CLI's structured output, and are never echoed or serialized.
//  * The runner refuses anything but the local stack: project id, database
//    container and loopback API/DB hosts are all verified, and there is no
//    login, link, --linked, db push/pull/dump or hosted fallback.
//    That claim is about THIS RUNNER'S OWN channel, and it is stated no more
//    widely than it is true. The application the runner serves with
//    `next start` loads its own `.env.local`, whose values this file never
//    reads — so the runner cannot assert what the served app's
//    NEXT_PUBLIC_SUPABASE_URL says. What it DOES assert, without reading a
//    value: every http(s) ORIGIN the exercised pages actually requested is
//    loopback (origins only — never a path, query or header). A divergent
//    Supabase URL would additionally break the project-ref-scoped session
//    cookie names and fail G-1/G-2 loudly rather than silently, and this
//    runner performs no governed write in any case.
//  * NO GOVERNED WRITE is performed against the canonical fixture
//    database. That is not timidity, it is gate G-18: the canonical
//    verifier database must remain pristine, and a lifecycle walkthrough
//    that committed a governed mutation would break its checksum
//    irreversibly (audit events are append-only and uncleanable — Step 7H).
//    The lifecycle-substance gates are therefore recorded NOT-RUN with
//    that reason rather than guessed. See the ledger notes below.
// =====================================================================

import { spawn, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import net from 'node:net'
import os from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServerClient } from '@supabase/ssr'

// ---------------------------------------------------------------------
// Ratified constants. Every value here is a fixed literal.
// ---------------------------------------------------------------------

const PROJECT_ID = 'best-coach-mvp'
const DB_CONTAINER = 'supabase_db_best-coach-mvp'
const EXPECTED_API_PORT = 54321
const EXPECTED_DB_PORT = 54322
const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '[::1]'])

/** A dedicated application port. Never 3000 — that belongs to the operator. */
const DEFAULT_APP_PORT = 3417
/** A dedicated CDP port, distinct from every existing harness (9332/9347). */
const DEFAULT_DEBUG_PORT = 9417
const FORBIDDEN_APP_PORTS = new Set([3000, 54321, 54322])

/**
 * The three deterministic fixture identities, exactly as
 * `scripts/fixtures/load-local-fixtures.mjs` created them. The UUIDs are
 * ratified literals: an identity that does not match its own UUID and role
 * stops the run BEFORE anything is prompted for.
 *
 * Prompt order is Trainer → Management → Parent, the order of the governed
 * lifecycle itself.
 */
const IDENTITIES = [
  {
    key: 'trainer',
    label: 'Trainer',
    email: 'trainer.fixture@example.test',
    authId: 'd0000000-0000-4000-8000-000000000002',
    role: 'trainer',
    home: '/trainer',
    landing: '/trainer/schedule',
  },
  {
    key: 'management',
    label: 'Management',
    email: 'management.fixture@example.test',
    authId: 'd0000000-0000-4000-8000-000000000001',
    role: 'management',
    home: '/management',
    landing: '/management',
  },
  {
    key: 'parent',
    label: 'Parent',
    email: 'parent.fixture@example.test',
    authId: 'd0000000-0000-4000-8000-000000000003',
    role: 'parent',
    home: '/parent',
    landing: '/parent',
  },
]

/** The portal prefixes each role must be DENIED, derived from the table above. */
const PORTAL_PREFIXES = ['/trainer', '/management', '/parent']

/**
 * The state the pristine fixture starts in. `report_versions` and
 * `report_version_ratings` are EMPTY: Step 7I's migration adds no report row
 * and the Step 7F fixture creates none. If either is non-zero at start, a
 * governed write already happened here and the canonical database is no
 * longer pristine — that stops the run before any prompt.
 */
const EXPECTED_START_REPORT_VERSIONS = 0
const EXPECTED_START_REPORT_VERSION_RATINGS = 0

/**
 * The accepted post-Amendment-006 canonical fixture checksum, pinned
 * identically in `scripts/tests/step-7i/run-canonical.mjs`. G-18 compares
 * against this AND against the run's own opening reading.
 */
const EXPECTED_CANONICAL_CHECKSUM =
  '6bdff280e550503d212832c2fd1099ac45880c2bc430bfdff8f92a3b35ffc576'
const EXPECTED_CANONICAL_ROWS = 28
const CANONICAL_BEGIN = '<<<BEST_COACH_FIXTURE_CANONICAL_BEGIN>>>'
const CANONICAL_END = '<<<BEST_COACH_FIXTURE_CANONICAL_END>>>'

/** The fixture-mode selector. It is UNSET in the child environment (G-19). */
const FIXTURE_MODE_VARIABLE = 'NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE'
const REAL_ADAPTER_KIND = 'real_participant_adapter'

/**
 * Markers that identify the deterministic fixture, matching
 * `tests/frontend/integrated-route-security.mjs`. Any of these on an
 * authenticated portal surface fails G-19.
 */
const FIXTURE_MARKERS = [
  'deterministic_fixture',
  'browser_session_only',
  'Deterministic fixture mode',
  'Reset fixture',
  'createDeterministicFixturePhysicalTestPort',
  'Learner Aster',
  'Learner Birch',
  'Learner Cedar',
  'Learner Delta',
  'Learner Ember',
  'Learner Fern',
]

/** Well-formed identifiers that resolve to nothing. Used for G-14's pair. */
const OPAQUE_STUDENT = '00000000-0000-4000-8000-0000000000a1'
const OPAQUE_SESSION = '00000000-0000-4000-8000-0000000000a2'
/** The fixture's REAL student and session — real, and not this parent's to read. */
const FIXTURE_STUDENT = 'c2000000-0000-4000-8000-000000000001'
const FIXTURE_SESSION = 'c5000000-0000-4000-8000-000000000001'

/**
 * Deadlines. NOTHING that talks to the browser is unbounded: a dropped socket
 * or a wedged renderer must end the run, not hold the server, Chrome and both
 * ports open forever with no ledger written.
 */
const CDP_TIMEOUT_MS = 20_000
const NAVIGATION_TIMEOUT_MS = 30_000
const CONSOLE_LIVENESS_TIMEOUT_MS = 5_000

/**
 * The shortest thing that can honestly be called a rendered document. A
 * document shorter than this, or one that is not a complete <html> element,
 * is treated as "not obtained" rather than compared. Its BYTES are never
 * printed — only this length bound and the structural verdict are.
 */
const MINIMUM_DOCUMENT_BYTES = 200

/**
 * The literal the console-collector liveness self-test emits and looks for.
 * It is authored here, contains nothing sensitive, and the collected text is
 * still never rendered — only whether the collector saw it.
 */
const CONSOLE_LIVENESS_TOKEN = 'best-coach-f17-console-collector-liveness-probe'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..', '..')

const DEFAULT_EVIDENCE_DIR = resolve(
  REPO_ROOT,
  '..',
  'UI_REFERENCE_FINAL_MVP',
  '_checkpoint-evidence',
  'F17',
)

const DEFAULT_CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

// ---------------------------------------------------------------------
// Safe output. Only phase labels, gate ids, verdicts, authored reasons,
// counts, route paths, exit codes and public checksums reach a stream.
// ---------------------------------------------------------------------

const say = (message) => process.stdout.write(`${message}\n`)
const phase = (message) => say(`\n[ ${message} ]`)
const pass = (message) => say(`  PASS  ${message}`)
const info = (message) => say(`  ....  ${message}`)

/**
 * A failure that is safe to surface. Its message is AUTHORED here and is
 * never derived from captured output, an auth response, a connection value
 * or anything a password could have reached.
 */
class SafeError extends Error {
  constructor(message) {
    super(message)
    this.name = 'SafeError'
  }
}

// ---------------------------------------------------------------------
// The gate ledger. Every gate gets its own line, one of PASS / FAIL /
// NOT-RUN, and a one-line authored reason. A gate is never defaulted,
// inferred or guessed: a gate this runner cannot decide is NOT-RUN.
// ---------------------------------------------------------------------

const GATE_TITLES = new Map([
  ['G-1', 'Real three-role authentication'],
  ['G-2', 'Server-derived role and centre authority'],
  ['G-3', 'Complete Trainer→Management→Parent lifecycle'],
  ['G-4', 'All nine ratings required'],
  ['G-5', 'Real observation persistence'],
  ['G-6', 'Real AI generation and grounding'],
  ['G-7', 'Deterministic retry/failure handling'],
  ['G-8', 'Trainer approval does not publish'],
  ['G-9', 'Management wording-only enforcement, rejected server-side even when the UI is bypassed'],
  ['G-10', 'Substantive changes require return and trainer reapproval'],
  ['G-11', 'Stale-state and duplicate-action rejection'],
  ['G-12', 'Returned and preapproved reports remain parent-invisible'],
  ['G-13', 'Parent sees only the submitted canonical report (latest_submitted_version_id only)'],
  ['G-14', 'Parent isolation and non-disclosing denial'],
  ['G-15', 'Management cannot access preapproval draft content'],
  ['G-16', 'Final submission produces exactly two ordered state-change audit events, no committed approved residue'],
  ['G-17', 'No audit-chain corruption'],
  ['G-18', 'Canonical verifier database remains pristine'],
  ['G-19', 'Concurrency proofs on the disposable database AND fixture mode unused for the primary walkthrough'],
  ['G-20', 'Typecheck, lint and build pass'],
  ['G-21', 'Browser console has no uncaught errors during the dry run'],
  ['H-1', 'Process hygiene — this run leaves no server, no browser and no held port behind'],
])

const ledger = new Map()

/** Record a verdict once. A second attempt to decide a gate is a defect. */
function gate(id, verdict, reason) {
  if (!GATE_TITLES.has(id)) throw new SafeError(`Unknown gate id: ${id}`)
  if (ledger.has(id)) throw new SafeError(`Gate ${id} was decided twice.`)
  if (!['PASS', 'FAIL', 'NOT-RUN'].includes(verdict)) {
    throw new SafeError(`Gate ${id} was given an unsupported verdict.`)
  }
  ledger.set(id, { verdict, reason })
}

/** Decide a gate from a boolean, with a distinct reason for each outcome. */
function gateFrom(id, ok, passReason, failReason) {
  gate(id, ok ? 'PASS' : 'FAIL', ok ? passReason : failReason)
}

/**
 * Every gate left undecided when the run ends becomes NOT-RUN with an
 * authored reason. Nothing is ever defaulted to PASS.
 */
function closeLedger(defaultReason) {
  for (const id of GATE_TITLES.keys()) {
    if (!ledger.has(id)) ledger.set(id, { verdict: 'NOT-RUN', reason: defaultReason })
  }
}

/**
 * The standing reason for the lifecycle-substance gates.
 *
 * These gates require a governed WRITE — an observation, a draft, an
 * approval, a wording edit, a return, a submission. Every such write commits
 * an append-only audit event that Step 7H makes permanently uncleanable, and
 * it changes the fixture rows the canonical checksum covers. Performing one
 * here would break G-18 on the very database G-18 is about. So this runner
 * performs no governed write, and reports these gates honestly as NOT-RUN.
 */
const LIFECYCLE_NOT_RUN =
  'requires a governed write; this runner performs none against the canonical fixture database because G-18 requires it to stay pristine and Step 7H audit events are uncleanable — decide this on a disposable database'

// ---------------------------------------------------------------------
// Arguments. There is deliberately NO argument that carries, names or
// points at a credential, and an unknown argument aborts before anything.
// ---------------------------------------------------------------------

const HELP = `
B.E.S.T Coach — F17 operator-assisted physical-test runner

  npm run physical-test:f17
  npm run physical-test:f17 -- --help
  npm run physical-test:f17 -- --preflight-only

WHAT IT DOES, IN ORDER
  1. Refuses unless the local stack is the target: supabase/config.toml
     project id "${PROJECT_ID}", the [api] port ${EXPECTED_API_PORT}, the [db] port
     ${EXPECTED_DB_PORT}, a loopback API host, the running container
     "${DB_CONTAINER}", and no linked project reference.
  2. Read-only identity preflight through the container's own psql (local
     socket trust — no database password is passed, prompted for or stored):
     exactly three auth.users; the three ratified UUIDs each bound to an
     ACTIVE accounts row; exactly one ACTIVE centre_memberships row each with
     the matching role; all three in ONE centre; report_versions and
     report_version_ratings at their expected starting values; and the
     canonical fixture checksum recorded.
     IF ANY IDENTITY DOES NOT MATCH ITS UUID AND ROLE, THE RUN STOPS HERE,
     BEFORE ANYTHING IS PROMPTED FOR.
  3. G-20: npx tsc --noEmit, npm run lint, npm run build. Output is captured
     and discarded; only the exit code is used.
  4. Starts its OWN production server (next start) on port ${DEFAULT_APP_PORT}, bound to
     127.0.0.1, on a port it verified was free first, with
     ${FIXTURE_MODE_VARIABLE} explicitly ABSENT from the child
     environment (G-19).
  5. Starts its OWN headless Chrome on CDP port ${DEFAULT_DEBUG_PORT}, verified free first.
  6. Prompts, separately and with echo disabled, for the Trainer, then
     Management, then Parent fixture password. Each is handed to exactly one
     Supabase sign-in call and dropped.
  7. Drives the authenticated security, isolation and console gates in a real
     browser, captures non-credential screenshots, then decides G-11/G-19 by
     running the Step 7I concurrency proofs on a DISPOSABLE database. Every
     browser step is bounded by a deadline and FAILS CLOSED: a navigation that
     errored, a page value that could not be read and a console collector that
     could not catch its own deliberate probe all produce FAIL or an abort,
     never a verdict reached on evidence that was not collected.
  8. Stops the server and the browser on every exit path — including Ctrl+C —
     verifies both ports are released and neither process survives, and writes
     a REDACTED gate ledger outside this repository.

WHAT IT WILL NEVER DO
  * Read a password from an environment variable, a command-line argument, a
    file, a default or a generated value. There is no such code path.
  * Print, log, serialize, write, transmit or interpolate a password
    anywhere, on any path, including every failure path.
  * Render the stdout or stderr of any child process.
  * Screenshot a login form, filled or otherwise.
  * Perform a governed write against the canonical fixture database.
  * Contact, link to, or fall back to any non-local target on its OWN channel,
    and it aborts if a page the served application rendered requested any
    non-loopback origin. It does not read the served application's .env.local,
    so it makes no claim about a value it has never seen.

OPTIONS
  --help            print this and exit 0.
  --preflight-only  run steps 1-2 only. Read-only, prompts for nothing,
                    needs no terminal, and decides no gate that requires a
                    session.

NON-CREDENTIAL ENVIRONMENT (all optional; none may carry a secret)
  BEST_COACH_F17_APP_PORT      application port      (default ${DEFAULT_APP_PORT})
  BEST_COACH_F17_DEBUG_PORT    Chrome CDP port       (default ${DEFAULT_DEBUG_PORT})
  BEST_COACH_F17_EVIDENCE_DIR  evidence directory    (default the external pack)
  CHROME_PATH                  headless Chrome binary

ABORTING
  Press Ctrl+C at any point, including at a password prompt. The run stops,
  the server and the browser are killed, both ports are then verified released
  by re-binding them, H-1 is recorded from that verification, the gate ledger
  is written with whatever was decided, and nothing captured is printed. The
  exit code is 130. The abort path does not wait for the run to settle: it is
  the same teardown the normal path uses, and it runs exactly once.
`

function parseArgs(argv) {
  const args = argv.slice(2)
  const options = { help: false, preflightOnly: false }
  for (const arg of args) {
    if (arg === '--help' || arg === '-h') options.help = true
    else if (arg === '--preflight-only') options.preflightOnly = true
    else {
      // The argument is NOT echoed back. An operator who mistyped a password
      // onto the command line must not see it repeated to the terminal.
      throw new SafeError(
        'Unsupported argument. This runner accepts only --help and --preflight-only. ' +
          'There is no argument that supplies a password, and there never will be.',
      )
    }
  }
  return options
}

// ---------------------------------------------------------------------
// Local-only guards.
// ---------------------------------------------------------------------

function readConfigToml() {
  const configPath = join(REPO_ROOT, 'supabase', 'config.toml')
  if (!existsSync(configPath)) {
    throw new SafeError('supabase/config.toml was not found; run this from the MVP repository.')
  }
  return readFileSync(configPath, 'utf8')
}

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

function assertProjectGuards() {
  if (existsSync(join(REPO_ROOT, 'supabase', '.temp', 'project-ref'))) {
    throw new SafeError(
      'A Supabase project reference exists. This runner is local-only and refuses to run on a linked project.',
    )
  }
  const toml = readConfigToml()
  const projectId = /^project_id\s*=\s*"([^"]+)"/m.exec(toml)?.[1] ?? null
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

const CLI_PLATFORM_PACKAGES = {
  darwin: { arm64: ['darwin-arm64'], x64: ['darwin-x64'] },
  linux: { arm64: ['linux-arm64', 'linux-arm64-musl'], x64: ['linux-x64', 'linux-x64-musl'] },
  win32: { arm64: ['windows-arm64'], x64: ['windows-x64'] },
}

/**
 * Resolve the project-local, version-pinned Supabase CLI, exactly as
 * `scripts/fixtures/load-local-fixtures.mjs` does: the package-local NATIVE
 * executable if present, otherwise the project-local shim run through THIS
 * Node runtime. Never a global install, never npx, never a shell string, and
 * never an environment-supplied override.
 */
function resolveLocalCli() {
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

function assertLoopbackUrl(rawUrl, expectedPort, what) {
  let parsed
  try {
    parsed = new URL(rawUrl)
  } catch {
    // The value itself is NOT echoed: a malformed one could carry anything.
    throw new SafeError(`The ${what} reported by the CLI could not be parsed.`)
  }
  if (!LOOPBACK_HOSTS.has(parsed.hostname)) {
    throw new SafeError(
      `The reported ${what} is not a loopback address. This runner refuses every non-local target.`,
    )
  }
  const port = parsed.port === '' ? (parsed.protocol === 'https:' ? 443 : 80) : Number(parsed.port)
  if (port !== expectedPort) {
    throw new SafeError(`The reported ${what} port does not match supabase/config.toml (expected ${expectedPort}).`)
  }
  return rawUrl
}

/**
 * Capture the local API URL and PUBLISHABLE key from the CLI's structured
 * output. Both stay in process memory: neither is echoed, serialized, written
 * or interpolated into a thrown error, and the parsed object is dropped here.
 *
 * The publishable (anon) key is not a secret in the CLAUDE.md §11 sense — it
 * is shipped to every browser — but it is still never printed, because a key
 * on a terminal teaches the wrong habit.
 */
function captureLocalStatus(cli, expectedApiPort, expectedDbPort) {
  const result = spawnSync(cli.command, [...cli.prefixArgs, 'status', '-o', 'json'], {
    cwd: REPO_ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
  })

  if (result.error) throw new SafeError('Could not invoke the project-local Supabase CLI.')
  if (result.status !== 0) {
    // Captured stderr is deliberately NOT interpolated: it can embed keys.
    throw new SafeError(
      `The local Supabase stack does not appear to be running (CLI exit ${result.status}). ` +
        'Start it yourself, then re-run. This runner never starts or stops Supabase.',
    )
  }

  let parsed
  try {
    parsed = JSON.parse(result.stdout)
  } catch {
    throw new SafeError('The CLI status output could not be parsed as JSON.')
  }

  // Field NAMES are not secrets; values are read for exactly three keys.
  const pick = (...names) => {
    for (const name of names) {
      const value = parsed?.[name]
      if (typeof value === 'string' && value.length > 0) return value
    }
    return null
  }

  const apiUrl = pick('API_URL', 'api_url', 'apiUrl')
  const dbUrl = pick('DB_URL', 'db_url', 'dbUrl')
  const publishableKey = pick(
    'PUBLISHABLE_KEY',
    'publishable_key',
    'publishableKey',
    'ANON_KEY',
    'anon_key',
    'anonKey',
  )

  if (!apiUrl) throw new SafeError('The CLI status output did not contain a local API URL field.')
  if (!publishableKey) {
    throw new SafeError('The CLI status output did not contain a publishable/anon key field.')
  }

  const checkedApi = assertLoopbackUrl(apiUrl, expectedApiPort, 'API URL')
  // The DB URL is a connection string. It is checked for loopback and then
  // DROPPED — never returned, never stored, never printed.
  if (dbUrl) assertLoopbackUrl(dbUrl, expectedDbPort, 'database URL')

  return { apiUrl: checkedApi, publishableKey }
}

// ---------------------------------------------------------------------
// Child processes. stdout and stderr are captured and DISCARDED. Only an
// exit code leaves this function — there is no path by which captured
// output can reach a stream, a message, an error or a file.
// ---------------------------------------------------------------------

function runCapturedExitCode(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: REPO_ROOT,
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

/** Run an npm script through THIS Node runtime's npm-cli, with no shell. */
function npmScriptExitCode(scriptName) {
  const npmCli = join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js')
  if (existsSync(npmCli)) {
    return runCapturedExitCode(process.execPath, [npmCli, 'run', scriptName])
  }
  // Fall back to the platform npm on PATH, still with a fixed argument array.
  return runCapturedExitCode(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', scriptName], {
    shell: process.platform === 'win32',
  })
}

/** Run a repository script through this Node runtime. */
function nodeScriptExitCode(relativePath) {
  return runCapturedExitCode(process.execPath, [join(REPO_ROOT, relativePath)])
}

// ---------------------------------------------------------------------
// Local SQL channel: docker exec -i into the container's own psql. SQL
// arrives on stdin; NO database password is passed, prompted for, embedded
// or stored (the container authenticates on local socket trust). Both
// streams are captured; stderr is never rendered.
// ---------------------------------------------------------------------

const PSQL_PREFIX = [
  'psql',
  '--no-psqlrc',
  '--username=postgres',
  '--dbname=postgres',
  '--set=ON_ERROR_STOP=1',
  '--quiet',
]

function assertContainerRunning() {
  const result = spawnSync('docker', ['ps', '--filter', `name=^/${DB_CONTAINER}$`, '--format', '{{.Names}}'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
  })
  if (result.error) throw new SafeError('Docker is not available on PATH.')
  if (result.status !== 0) {
    throw new SafeError(`Could not query Docker for the local database container (exit ${result.status}).`)
  }
  if (result.stdout.trim() !== DB_CONTAINER) {
    throw new SafeError(
      `The local database container "${DB_CONTAINER}" is not running. ` +
        'Start the local stack yourself, then re-run. This runner never starts or stops Supabase.',
    )
  }
}

/**
 * Run a read-only query and return its tuple rows as arrays of strings.
 * On failure only the psql exit code is surfaced — never its stderr, which
 * can embed connection detail.
 */
function psqlRows(sql) {
  const args = ['exec', '-i', DB_CONTAINER, ...PSQL_PREFIX, '--tuples-only', '--no-align', '--field-separator=|']
  const result = spawnSync('docker', args, {
    input: sql,
    stdio: ['pipe', 'pipe', 'pipe'],
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
    maxBuffer: 32 * 1024 * 1024,
  })
  if (result.error) throw new SafeError('Could not execute SQL through the local database container.')
  if (result.status !== 0) {
    throw new SafeError(`A read-only preflight query failed (psql exit ${result.status}).`)
  }
  return (result.stdout || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.split('|'))
}

/** Run a SQL FILE and return stdout (used only for the canonical verifier). */
function psqlFileStdout(absolutePath) {
  if (!existsSync(absolutePath)) throw new SafeError('The canonical fixture verifier SQL file is missing.')
  const args = ['exec', '-i', DB_CONTAINER, ...PSQL_PREFIX]
  const result = spawnSync('docker', args, {
    input: readFileSync(absolutePath, 'utf8'),
    stdio: ['pipe', 'pipe', 'pipe'],
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
    maxBuffer: 32 * 1024 * 1024,
  })
  if (result.error) throw new SafeError('Could not execute the canonical verifier through the local container.')
  if (result.status !== 0) {
    throw new SafeError(`The canonical fixture verifier failed (psql exit ${result.status}).`)
  }
  return result.stdout || ''
}

function canonicalChecksum() {
  const stdout = psqlFileStdout(join(REPO_ROOT, 'scripts', 'fixtures', 'verify-local-fixtures.sql'))
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

// ---------------------------------------------------------------------
// Identity preflight — READ-ONLY, and BEFORE any prompt.
//
// If ANY identity does not match its deterministic UUID and role, this
// throws and nothing is ever prompted for.
// ---------------------------------------------------------------------

function identityPreflight() {
  const userCount = psqlRows('SELECT count(*) FROM auth.users;')[0]?.[0]
  if (userCount !== '3') {
    throw new SafeError(
      `auth.users holds ${userCount ?? 'an unreadable count'} row(s); the ratified fixture is exactly 3. ` +
        'Aborting before any prompt.',
    )
  }

  // One row per ratified identity: does the auth user exist, is its account
  // active, how many ACTIVE memberships does it hold, and with which role and
  // centre. Every literal below is a ratified constant.
  const values = IDENTITIES.map((identity) => `('${identity.authId}'::uuid, '${identity.role}')`).join(', ')
  const rows = psqlRows(`
    WITH expected(auth_id, expected_role) AS (VALUES ${values})
    SELECT
      expected.auth_id,
      expected.expected_role,
      (SELECT count(*) FROM auth.users u WHERE u.id = expected.auth_id),
      (SELECT count(*) FROM public.accounts a
         WHERE a.auth_user_id = expected.auth_id AND a.status = 'active'),
      (SELECT count(*) FROM public.centre_memberships m
         JOIN public.accounts a ON a.id = m.account_id
        WHERE a.auth_user_id = expected.auth_id AND m.status = 'active'),
      (SELECT count(*) FROM public.centre_memberships m
         JOIN public.accounts a ON a.id = m.account_id
        WHERE a.auth_user_id = expected.auth_id
          AND m.status = 'active'
          AND m.role::text = expected.expected_role),
      COALESCE((SELECT min(m.centre_id::text) FROM public.centre_memberships m
         JOIN public.accounts a ON a.id = m.account_id
        WHERE a.auth_user_id = expected.auth_id AND m.status = 'active'), 'none')
    FROM expected
    ORDER BY expected.auth_id;
  `)

  if (rows.length !== IDENTITIES.length) {
    throw new SafeError('The identity preflight query did not return one row per ratified identity.')
  }

  const centres = new Set()
  for (const row of rows) {
    const [authId, expectedRole, authRows, activeAccounts, activeMemberships, roleMatched, centreId] = row
    const identity = IDENTITIES.find((candidate) => candidate.authId === authId)
    const label = identity ? identity.label : 'an unrecognised'
    if (authRows !== '1') {
      throw new SafeError(`The ${label} deterministic UUID has no auth.users row. Aborting before any prompt.`)
    }
    if (activeAccounts !== '1') {
      throw new SafeError(
        `The ${label} identity is not bound to exactly one ACTIVE public.accounts row. Aborting before any prompt.`,
      )
    }
    if (activeMemberships !== '1') {
      throw new SafeError(
        `The ${label} identity holds ${activeMemberships} ACTIVE centre_memberships rows; exactly 1 is required. ` +
          'Aborting before any prompt.',
      )
    }
    if (roleMatched !== '1') {
      throw new SafeError(
        `The ${label} identity's ACTIVE membership does not carry the ratified role "${expectedRole}". ` +
          'Aborting before any prompt.',
      )
    }
    centres.add(centreId)
  }

  if (centres.size !== 1 || centres.has('none')) {
    throw new SafeError(
      `The three fixture identities span ${centres.size} centres; the ratified fixture is one centre. ` +
        'Aborting before any prompt.',
    )
  }

  const counts = psqlRows(`
    SELECT
      (SELECT count(*) FROM public.report_versions),
      (SELECT count(*) FROM public.report_version_ratings),
      (SELECT count(*) FROM public.reports WHERE status = 'approved');
  `)[0]

  const [versions, ratings, approvedResidue] = counts
  if (Number(versions) !== EXPECTED_START_REPORT_VERSIONS) {
    throw new SafeError(
      `report_versions holds ${versions} row(s); this run expects ${EXPECTED_START_REPORT_VERSIONS} at start. ` +
        'The canonical database is not in its pristine starting state. Aborting before any prompt.',
    )
  }
  if (Number(ratings) !== EXPECTED_START_REPORT_VERSION_RATINGS) {
    throw new SafeError(
      `report_version_ratings holds ${ratings} row(s); this run expects ${EXPECTED_START_REPORT_VERSION_RATINGS} at start. ` +
        'Aborting before any prompt.',
    )
  }

  const checksum = canonicalChecksum()
  if (checksum.sha256 !== EXPECTED_CANONICAL_CHECKSUM || checksum.rows !== EXPECTED_CANONICAL_ROWS) {
    throw new SafeError(
      `The canonical fixture checksum does not match the pinned value (${checksum.rows} rows). ` +
        'The canonical database is not pristine. Aborting before any prompt.',
    )
  }

  return {
    centreId: [...centres][0],
    reportVersions: Number(versions),
    reportVersionRatings: Number(ratings),
    approvedResidue: Number(approvedResidue),
    checksum,
  }
}

// ---------------------------------------------------------------------
// No-echo password entry. Interactive TTY only. Terminal state is restored
// on every success, failure and cancellation path.
//
// Raw-mode input arrives as Buffers and is interpreted as NUMBERS. The
// stream is deliberately left in Buffer mode: setEncoding() would deliver
// strings, every numeric byte comparison would be permanently false, Enter
// would be ignored and Ctrl+C would be swallowed into the buffer.
//
// This is the accepted pattern from scripts/fixtures/load-local-fixtures.mjs.
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
 * Pure interpreter for one hidden input line. It owns no stream, performs no
 * I/O and prints nothing, so its behaviour is exercisable with synthetic byte
 * sequences without a TTY and without a password. Bytes accumulate raw and are
 * decoded as UTF-8 only when the finished line is taken, so multi-byte
 * characters survive backspace intact.
 */
function createSecretLineReader() {
  const bytes = []
  let status = LINE_PENDING
  let terminator = null
  let absorbedLineFeed = false

  const feedByte = (byte) => {
    if (status !== LINE_PENDING) {
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
      while (bytes.length > 0 && (bytes[bytes.length - 1] & 0xc0) === 0x80) bytes.pop()
      bytes.pop()
      return
    }
    if (byte < KEY_FIRST_PRINTABLE) return
    bytes.push(byte)
  }

  return {
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
    get absorbedLineFeed() {
      return absorbedLineFeed
    },
    cancel() {
      if (status === LINE_PENDING) {
        bytes.length = 0
        status = LINE_CANCELLED
      }
      return status
    },
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
 * Prompt once per identity, in the fixed order Trainer, Management, Parent.
 * No echo, no confirmation, no length feedback, no defaults and no
 * alternative source. One raw-mode session, one `data` listener and one
 * temporary SIGINT handler serve all three prompts, which is what guarantees
 * a stray line feed cannot be delivered to the next prompt and submit it
 * empty.
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
    if (reader === null || settle === null) return
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

  const cancelled = () => new SafeError('Cancelled at the password prompt. Nothing was signed in.')

  const secrets = new Map()

  input.setRawMode(true)
  input.on('data', onData)
  process.on('SIGINT', onSigint)

  try {
    for (const identity of IDENTITIES) {
      if (cancelledBetweenPrompts) throw cancelled()
      // The prompt names the ROLE only. No value is ever echoed.
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
    input.pause()
  }
}

// ---------------------------------------------------------------------
// Ports. Selected, verified free BEFORE anything binds, and verified
// released after everything is stopped.
// ---------------------------------------------------------------------

function readPortFromEnv(name, fallback) {
  const raw = process.env[name]
  if (raw === undefined || raw === '') return fallback
  const value = Number(raw)
  if (!Number.isInteger(value) || value < 1024 || value > 65535) {
    throw new SafeError(`${name} must be an integer port between 1024 and 65535.`)
  }
  return value
}

function isPortFree(port) {
  return new Promise((resolveFree) => {
    const server = net.createServer()
    server.once('error', () => resolveFree(false))
    server.once('listening', () => server.close(() => resolveFree(true)))
    server.listen(port, '127.0.0.1')
  })
}

async function assertPortFree(port, what) {
  if (!(await isPortFree(port))) {
    throw new SafeError(
      `Port ${port} (${what}) is already in use. This runner owns its own ports and refuses to share one. ` +
        'Free it, or set the matching BEST_COACH_F17_*_PORT variable.',
    )
  }
}

async function waitForPortReleased(port, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await isPortFree(port)) return true
    await new Promise((r) => setTimeout(r, 250))
  }
  return false
}

// ---------------------------------------------------------------------
// Owned processes: this run's server and this run's browser. Both are
// stopped on EVERY exit path, including abort and Ctrl+C.
// ---------------------------------------------------------------------

const owned = { server: null, chrome: null, serverPid: null, chromePid: null }

/**
 * What the redacted evidence file reports about the run. Every field is a
 * count, a route, a port or a PUBLIC checksum — there is no field here that a
 * credential could occupy.
 */
const runContext = {
  origin: null,
  debugPort: null,
  startChecksum: null,
  endChecksum: null,
  screenshots: [],
  completedAt: null,
}

function killOwned(child) {
  if (!child) return
  try {
    if (child.exitCode === null && child.signalCode === null) {
      if (process.platform === 'win32') {
        // A `next start` parent spawns a worker; /T takes the tree with it.
        // Output is captured and discarded, as everywhere else.
        runCapturedExitCode('taskkill', ['/PID', String(child.pid), '/T', '/F'])
      } else {
        child.kill('SIGTERM')
      }
    }
  } catch {
    // The child may already be gone; that is the desired end state anyway.
  }
  try {
    child.kill()
  } catch {
    // Already exited.
  }
}

function processAlive(pid) {
  if (pid === null || pid === undefined) return false
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

async function stopEverything() {
  killOwned(owned.chrome)
  killOwned(owned.server)
  owned.chrome = null
  owned.server = null
  await new Promise((r) => setTimeout(r, 750))
}

/**
 * Start THIS run's production server, on THIS run's port, with the fixture
 * flag explicitly ABSENT from the child environment (G-19).
 *
 * The flag is a RUNTIME `process.env` read (see
 * `lib/frontend/adapters/adapter-mode.ts`), not a build-time fold, so the
 * same build starts in either mode and deleting the variable here is the
 * thing that decides it. That is why G-19 also asserts the SERVED pages
 * report the real adapter, rather than trusting the environment alone.
 */
async function startServer(port) {
  const nextBin = join(REPO_ROOT, 'node_modules', 'next', 'dist', 'bin', 'next')
  if (!existsSync(nextBin)) throw new SafeError('The project-local Next.js binary could not be resolved.')

  const childEnv = { ...process.env }
  delete childEnv[FIXTURE_MODE_VARIABLE]
  if (FIXTURE_MODE_VARIABLE in childEnv) {
    throw new SafeError('The fixture-mode variable could not be removed from the child environment.')
  }

  const child = spawn(process.execPath, [nextBin, 'start', '-H', '127.0.0.1', '-p', String(port)], {
    cwd: REPO_ROOT,
    env: childEnv,
    // Both streams are ignored outright: nothing the server prints is ever
    // rendered, and there is no buffer for it to leak out of.
    stdio: ['ignore', 'ignore', 'ignore'],
    windowsHide: true,
    shell: false,
  })

  owned.server = child
  owned.serverPid = child.pid

  const origin = `http://127.0.0.1:${port}`
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (child.exitCode !== null) {
      throw new SafeError(`The application server exited during startup (code ${child.exitCode}).`)
    }
    try {
      const response = await fetch(`${origin}/login`, { redirect: 'manual' })
      await response.text()
      if (response.status < 500) return origin
    } catch {
      // Not listening yet.
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new SafeError(`The application server did not answer on port ${port} within 60 seconds.`)
}

function startChrome(debugPort) {
  const chromePath = process.env.CHROME_PATH ?? DEFAULT_CHROME_PATH
  const profileDirectory = join(os.tmpdir(), `best-coach-f17-chrome-${process.pid}`)
  mkdirSync(profileDirectory, { recursive: true })

  const child = spawn(
    chromePath,
    [
      '--headless=new',
      `--remote-debugging-port=${debugPort}`,
      `--user-data-dir=${profileDirectory}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      '--disable-component-update',
      '--disable-default-apps',
      '--disable-gpu',
      '--window-size=1440,1100',
      'about:blank',
    ],
    { stdio: 'ignore', windowsHide: true, shell: false },
  )

  owned.chrome = child
  owned.chromePid = child.pid
  return child
}

// ---------------------------------------------------------------------
// CDP client. Frames are serialized here and NEVER rendered. No password
// passes through this transport: sign-in happens in Node, and only the
// resulting session cookies are installed into the browser.
// ---------------------------------------------------------------------

function createCdpClient(socket, consoleErrors, timeoutMs = CDP_TIMEOUT_MS) {
  let messageId = 0
  let closedReason = null
  const pending = new Map()
  const waiters = new Set()

  /** Arm a timer that never keeps the event loop alive on its own. */
  const armed = (ms, onExpiry) => {
    const timer = setTimeout(onExpiry, ms)
    if (typeof timer.unref === 'function') timer.unref()
    return timer
  }

  socket.addEventListener('message', (event) => {
    let message
    try {
      message = JSON.parse(event.data)
    } catch {
      // A frame that is not JSON cannot answer anything; ignore it. Its
      // content is never rendered, here or anywhere.
      return
    }

    if (message.id && pending.has(message.id)) {
      const entry = pending.get(message.id)
      pending.delete(message.id)
      clearTimeout(entry.timer)
      // FAIL CLOSED. A CDP error must never be handed on as a result: an
      // undefined result read out of an error response is what lets a gate
      // "pass" having compared nothing. Only the method name (a literal
      // authored in this file) and the numeric CDP code are surfaced; the
      // error text is not, because it can quote page or request content.
      if (message.error) {
        entry.fail(
          new SafeError(
            `The browser rejected the CDP command ${entry.method} (code ${Number(message.error.code) || 'unknown'}).`,
          ),
        )
        return
      }
      entry.settle(message)
      return
    }

    if (typeof message.method === 'string') {
      for (const waiter of [...waiters]) {
        if (waiter.methods.includes(message.method)) {
          waiters.delete(waiter)
          clearTimeout(waiter.timer)
          waiter.settle(message.method)
        }
      }
    }

    if (message.method === 'Runtime.consoleAPICalled' && message.params?.type === 'error') {
      consoleErrors.push(
        message.params.args?.map((argument) => argument.value ?? argument.description ?? '').join(' ') ??
          'console error',
      )
    }
    if (message.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(message.params?.exceptionDetails?.text ?? 'uncaught exception')
    }
    if (message.method === 'Log.entryAdded' && message.params?.entry?.level === 'error') {
      consoleErrors.push(message.params.entry.text)
    }
  })

  /** A dropped socket must reject every outstanding wait, not hang the run. */
  const abandon = (reason) => {
    closedReason = reason
    for (const [id, entry] of [...pending.entries()]) {
      pending.delete(id)
      clearTimeout(entry.timer)
      entry.fail(new SafeError(`The CDP connection closed while ${entry.method} was outstanding.`))
    }
    for (const waiter of [...waiters]) {
      waiters.delete(waiter)
      clearTimeout(waiter.timer)
      waiter.fail(new SafeError('The CDP connection closed while a page event was awaited.'))
    }
  }
  socket.addEventListener('close', () => abandon('closed'), { once: true })
  socket.addEventListener('error', () => abandon('errored'), { once: true })

  /**
   * Send one command. EVERY send is bounded: an unanswered command rejects at
   * the deadline instead of hanging the run with the server, the browser and
   * both ports still held.
   */
  const send = (method, params = {}) => {
    if (closedReason !== null) {
      return Promise.reject(new SafeError(`The CDP connection is ${closedReason}; ${method} was not sent.`))
    }
    messageId += 1
    const id = messageId
    return new Promise((settle, fail) => {
      const entry = { method, settle, fail, timer: null }
      entry.timer = armed(timeoutMs, () => {
        pending.delete(id)
        fail(new SafeError(`The CDP command ${method} was not answered within ${timeoutMs} ms.`))
      })
      pending.set(id, entry)
      try {
        socket.send(JSON.stringify({ id, method, params }))
      } catch {
        pending.delete(id)
        clearTimeout(entry.timer)
        fail(new SafeError(`The CDP command ${method} could not be sent.`))
      }
    })
  }

  /**
   * Watch for the first of `methods`. The watcher is armed BEFORE the command
   * that provokes the event is sent, so a fast event cannot be missed, and it
   * can be cancelled without producing an unhandled rejection.
   */
  const watch = (methods, ms = timeoutMs) => {
    let settle
    let fail
    const promise = new Promise((res, rej) => {
      settle = res
      fail = rej
    })
    if (closedReason !== null) {
      fail(new SafeError(`The CDP connection is ${closedReason}; no page event can arrive.`))
      return { promise, cancel: () => {} }
    }
    const waiter = { methods, settle, fail, timer: null }
    waiter.timer = armed(ms, () => {
      waiters.delete(waiter)
      fail(new SafeError(`No ${methods.join(' or ')} event arrived within ${ms} ms.`))
    })
    waiters.add(waiter)
    return {
      promise,
      cancel: () => {
        if (waiters.delete(waiter)) {
          clearTimeout(waiter.timer)
          settle(null)
        }
      },
    }
  }

  return { send, watch }
}

async function findPageTarget(debugPort) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`)
      const targets = await response.json()
      const page = targets.find((target) => target.type === 'page')
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl
    } catch {
      // Chrome is not listening yet.
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new SafeError('Headless Chrome did not expose a page debugging target.')
}

// ---------------------------------------------------------------------
// Authentication.
//
// The password is a PARAMETER of this function. It is handed to exactly one
// call and then goes out of scope. It is not stored on an object, not
// returned, not logged, not serialized, not written and not interpolated
// into any message, including the failure message below — which is authored
// here and mentions only the ROLE.
//
// The session is established through `@supabase/ssr`'s own server client,
// writing into an in-memory cookie jar. That means the cookie NAMES and
// ENCODING are produced by the exact library the application reads them
// with, rather than reconstructed by hand.
// ---------------------------------------------------------------------

async function establishSessionCookies(apiUrl, publishableKey, identity, password) {
  const jar = new Map()
  const client = createServerClient(apiUrl, publishableKey, {
    cookies: {
      getAll: () => [...jar.entries()].map(([name, value]) => ({ name, value })),
      setAll: (list) => {
        for (const cookie of list) jar.set(cookie.name, cookie.value)
      },
    },
  })

  const { data, error } = await client.auth.signInWithPassword({
    email: identity.email,
    password,
  })

  // The auth error object is NEVER surfaced: it can echo the request.
  if (error) {
    throw new SafeError(
      `Sign-in failed for the ${identity.label} fixture identity. ` +
        'No detail is reported, by design; re-run and re-enter it.',
    )
  }
  if (data?.user?.id !== identity.authId) {
    throw new SafeError(
      `The Auth service returned a different id than the ratified literal for the ${identity.label} identity.`,
    )
  }

  const cookies = [...jar.entries()].map(([name, value]) => ({ name, value }))
  if (cookies.length === 0) {
    throw new SafeError(`No session cookie was produced for the ${identity.label} identity.`)
  }
  return cookies
}

// ---------------------------------------------------------------------
// Evidence. REDACTED by construction: only gate ids, verdicts, authored
// reasons, counts, route paths, public checksums and screenshots of
// non-credential authenticated surfaces are written. No password, no token,
// no cookie value, no Authorization header, no magic link, no request body.
// A login form is never screenshotted, filled or empty.
// ---------------------------------------------------------------------

function evidenceDirectory() {
  const configured = process.env.BEST_COACH_F17_EVIDENCE_DIR
  const target = configured && configured.length > 0 ? resolve(configured) : DEFAULT_EVIDENCE_DIR
  mkdirSync(target, { recursive: true })
  return target
}

function writeLedger(directory, context) {
  const lines = []
  lines.push('# F17 — physical-test acceptance gate ledger')
  lines.push('')
  lines.push('Produced by `npm run physical-test:f17`. REDACTED BY CONSTRUCTION: this file')
  lines.push('carries gate ids, verdicts, authored reasons, counts, route paths and public')
  lines.push('checksums only. It carries no password, token, cookie, header or request body.')
  lines.push('')
  lines.push(`- Run completed: ${context.completedAt}`)
  lines.push(`- Application origin: ${context.origin ?? 'no server was started'}`)
  lines.push(`- CDP port: ${context.debugPort ?? 'no browser was started'}`)
  lines.push(
    `- ${FIXTURE_MODE_VARIABLE} in the server environment: ${context.origin ? 'ABSENT' : 'no server was started'}`,
  )
  lines.push(`- Canonical fixture checksum at start: ${context.startChecksum ?? 'not read'}`)
  lines.push(`- Canonical fixture checksum at end:   ${context.endChecksum ?? 'not read'}`)
  lines.push('')
  lines.push('| Gate | Verdict | Reason |')
  lines.push('|---|---|---|')
  for (const [id, title] of GATE_TITLES) {
    const entry = ledger.get(id) ?? { verdict: 'NOT-RUN', reason: 'not reached' }
    const reason = entry.reason.replace(/\|/g, '/')
    lines.push(`| **${id}** ${title} | ${entry.verdict} | ${reason} |`)
  }
  lines.push('')
  for (const name of context.screenshots) lines.push(`- screenshot: ${name}`)
  lines.push('')
  writeFileSync(join(directory, 'gate-ledger.md'), `${lines.join('\n')}\n`, 'utf8')
}

function printLedger() {
  phase('Gate ledger')
  for (const [id, title] of GATE_TITLES) {
    const entry = ledger.get(id) ?? { verdict: 'NOT-RUN', reason: 'not reached' }
    say(`  ${entry.verdict.padEnd(7)} ${id.padEnd(5)} ${title}`)
    say(`          ${entry.reason}`)
  }
}

// ---------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------

async function main() {
  const options = parseArgs(process.argv)

  if (options.help) {
    say(HELP.trim())
    return 0
  }

  say('B.E.S.T Coach — F17 operator-assisted physical-test runner')
  say('Local disposable stack only. No credential is read from an environment')
  say('variable, an argument, a file, a default or a generated value — there is')
  say('no such code path. Passwords are typed on this terminal, hidden, once.')

  /*
   * THE TTY GATE. It runs before anything is prompted for and before any
   * process is started, and it names no credential and offers no alternative
   * input path — because there is none.
   *
   * `--preflight-only` is exempt: it prompts for nothing, so it needs no
   * terminal. It also decides no gate that requires a session.
   */
  if (!options.preflightOnly && !process.stdin.isTTY) {
    throw new SafeError(
      'An interactive terminal is required. This runner reads its fixture passwords only from a ' +
        'no-echo prompt on an operator-controlled terminal, and it has no other input path: not an ' +
        'environment variable, not an argument, not a file, not a default and not a generated value. ' +
        'Re-run it directly in a terminal. Use --preflight-only for the read-only checks, or --help.',
    )
  }

  phase('Local-only guards')
  const { apiPort, dbPort } = assertProjectGuards()
  pass(`project id "${PROJECT_ID}", [api] ${apiPort}, [db] ${dbPort}, no project reference`)
  assertContainerRunning()
  pass(`local database container "${DB_CONTAINER}" is running`)

  const cli = resolveLocalCli()
  info(`CLI resolved as: ${cli.form}`)
  const { apiUrl, publishableKey } = captureLocalStatus(cli, apiPort, dbPort)
  pass('local API URL and publishable key captured into process memory only (loopback verified)')

  phase('Identity preflight (read-only, before any prompt)')
  const preflight = identityPreflight()
  runContext.startChecksum = preflight.checksum.sha256
  pass('exactly 3 auth.users rows')
  pass('the three ratified UUIDs each bind to one ACTIVE account and one ACTIVE membership with the matching role')
  pass(`all three memberships are in one centre (${preflight.centreId})`)
  pass(
    `report_versions ${preflight.reportVersions}, report_version_ratings ${preflight.reportVersionRatings}, ` +
      `committed 'approved' residue ${preflight.approvedResidue}`,
  )
  pass(`canonical fixture checksum ${preflight.checksum.sha256} over ${preflight.checksum.rows} rows`)

  if (options.preflightOnly) {
    closeLedger('not attempted: --preflight-only performs read-only checks and decides no session-dependent gate')
    say('')
    say('Preflight only. Nothing was prompted for; no server, no browser and no governed write.')
    return
  }

  const appPort = readPortFromEnv('BEST_COACH_F17_APP_PORT', DEFAULT_APP_PORT)
  const debugPort = readPortFromEnv('BEST_COACH_F17_DEBUG_PORT', DEFAULT_DEBUG_PORT)
  if (FORBIDDEN_APP_PORTS.has(appPort)) {
    throw new SafeError(`Port ${appPort} is reserved. This runner owns a dedicated port and will not take that one.`)
  }
  if (appPort === debugPort) throw new SafeError('The application port and the CDP port must differ.')

  /*
   * H-1's subjects are recorded THE MOMENT they are chosen, not when `main`
   * returns. A failure thrown anywhere after this point — and a Ctrl+C — must
   * still find real port numbers to verify, because those are precisely the
   * paths on which a leak is most likely. Nothing here has bound a port yet;
   * knowing WHICH ports this run owns is what makes the check possible at all.
   */
  teardownState.appPort = appPort
  teardownState.debugPort = debugPort

  phase('Ports')
  await assertPortFree(appPort, 'application server')
  await assertPortFree(debugPort, 'Chrome CDP')
  pass(`ports ${appPort} (server) and ${debugPort} (CDP) are free and are this run's alone`)

  const context = runContext
  context.debugPort = debugPort
  teardownState.context = context

  /* -----------------------------------------------------------------
   * G-20 — typecheck, lint and build. Captured, unrendered, exit codes only.
   * ---------------------------------------------------------------- */
  phase('G-20 — typecheck, lint, build')
  const typecheck = runCapturedExitCode(
    process.execPath,
    [join(REPO_ROOT, 'node_modules', 'typescript', 'bin', 'tsc'), '--noEmit'],
  )
  info(`tsc --noEmit exit ${typecheck.status}`)
  const lint = npmScriptExitCode('lint')
  info(`npm run lint exit ${lint.status}`)
  const build = npmScriptExitCode('build')
  info(`npm run build exit ${build.status}`)
  gateFrom(
    'G-20',
    typecheck.status === 0 && lint.status === 0 && build.status === 0,
    'tsc --noEmit, npm run lint and npm run build each exited 0 (output captured, never rendered)',
    `exit codes were tsc=${typecheck.status}, lint=${lint.status}, build=${build.status}`,
  )
  if (typecheck.status !== 0 || lint.status !== 0 || build.status !== 0) {
    throw new SafeError(
      'Typecheck, lint or build failed. Their output was captured and discarded by design — ' +
        'run the failing command yourself to see it. Nothing further was started.',
    )
  }

  /* -----------------------------------------------------------------
   * This run's own server and browser.
   * ---------------------------------------------------------------- */
  phase('Owned application server')
  const origin = await startServer(appPort)
  context.origin = origin
  pass(`next start is answering on ${origin} with ${FIXTURE_MODE_VARIABLE} absent from its environment`)

  phase('Owned headless browser')
  startChrome(debugPort)
  const wsUrl = await findPageTarget(debugPort)
  const consoleErrors = []
  const socket = new WebSocket(wsUrl)
  await new Promise((settle, reject) => {
    socket.addEventListener('open', settle, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })
  const cdp = createCdpClient(socket, consoleErrors)
  teardownState.socket = socket
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Log.enable')
  // `Network.enable` is deliberately NOT called. Only Network.setCookie and
  // Network.clearBrowserCookies are used, and both are commands that need no
  // enabled domain. Enabling it would stream every request and response header
  // — including the `Cookie:` header carrying this run's session JWTs —
  // through this process for no benefit. The cheapest exposure to remove is
  // the one that was never needed.
  pass(`headless Chrome is driving on CDP port ${debugPort}`)

  /* -----------------------------------------------------------------
   * Browser primitives, all FAIL-CLOSED.
   *
   * Every one of these throws rather than returning a soft value. A gate is
   * allowed to compare only what was actually obtained: `undefined === undefined`
   * is not evidence of anything, and must never be able to reach a verdict.
   * ---------------------------------------------------------------- */

  /** Chrome's own net-error tokens are a fixed enumeration and carry no content. */
  const NET_ERROR = /^net::ERR_[A-Z0-9_]+$/

  const navigateRaw = async (url, what) => {
    // Armed BEFORE the navigate command so a fast load cannot be missed.
    const loaded = cdp.watch(['Page.loadEventFired', 'Page.frameStoppedLoading'], NAVIGATION_TIMEOUT_MS)
    let response
    try {
      response = await cdp.send('Page.navigate', { url })
    } catch (error) {
      loaded.cancel()
      throw error
    }
    const errorText = response.result?.errorText
    if (typeof errorText === 'string' && errorText.length > 0) {
      loaded.cancel()
      throw new SafeError(
        `Navigation to ${what} failed in the browser (${NET_ERROR.test(errorText) ? errorText : 'an unrecognised browser error'}). ` +
          'A failed navigation leaves the PREVIOUS document in place and is never accepted as a result.',
      )
    }
    // The deadline REJECTS. There is no fixed sleep anywhere on this path.
    await loaded.promise
  }

  /**
   * Read one value out of the page. Rejects on a CDP error (handled in the
   * client), on a thrown page expression, and on a missing result.
   */
  const evaluateRaw = async (expression, what) => {
    const response = await cdp.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })
    if (response.result?.exceptionDetails) {
      throw new SafeError(`The page expression for ${what} threw inside the browser.`)
    }
    const remote = response.result?.result
    if (!remote || typeof remote !== 'object' || remote.type === 'undefined') {
      throw new SafeError(`The page expression for ${what} returned no value; nothing was obtained to compare.`)
    }
    return remote.value ?? null
  }

  const evaluateString = async (expression, what) => {
    const value = await evaluateRaw(expression, what)
    if (typeof value !== 'string' || value.length === 0) {
      throw new SafeError(`The page expression for ${what} did not return a non-empty string.`)
    }
    return value
  }

  const evaluateNullableString = async (expression, what) => {
    const value = await evaluateRaw(expression, what)
    if (value === null) return null
    if (typeof value !== 'string') {
      throw new SafeError(`The page expression for ${what} returned neither a string nor null.`)
    }
    return value
  }

  /**
   * Capture a document and ASSERT it is one. The bytes are never printed; only
   * the structural verdict is. A gate that compares documents may only ever
   * see a value that got past this.
   */
  const evaluateDocument = async (what) => {
    const html = await evaluateString('document.documentElement.outerHTML', `the document at ${what}`)
    const lower = html.toLowerCase()
    if (html.length < MINIMUM_DOCUMENT_BYTES || !lower.startsWith('<html') || !lower.includes('</html>')) {
      throw new SafeError(
        `The document captured at ${what} is not a complete rendered HTML document (${html.length} bytes), ` +
          'so there is nothing to compare and no verdict is available from it.',
      )
    }
    return html
  }

  /**
   * Every foreign-portal leg is preceded by a real about:blank navigation. A
   * navigation that silently fails therefore leaves about:blank behind — a
   * value no gate accepts — instead of the identity's OWN previous portal,
   * which is exactly the value that would have been mistaken for a correct
   * redirect.
   */
  const blank = async () => {
    await navigateRaw('about:blank', 'about:blank')
    const href = await evaluateString('location.href', 'the blank document')
    if (href !== 'about:blank') {
      throw new SafeError('The browser did not return to about:blank between navigations.')
    }
  }

  /** Origins the served application actually requested. Loopback is enforced. */
  const observedOrigins = new Set()

  const collectOrigins = async (what) => {
    const raw = await evaluateString(
      "JSON.stringify(Array.from(new Set((performance.getEntriesByType('resource') || [])" +
        '.map(function (entry) { try { return new URL(entry.name).origin } catch (e) { return null } })' +
        '.filter(function (value) { return typeof value === "string" && /^https?:/.test(value) }))))',
      `the resource origins at ${what}`,
    )
    let list
    try {
      list = JSON.parse(raw)
    } catch {
      throw new SafeError(`The resource-origin reading at ${what} could not be parsed.`)
    }
    for (const entry of Array.isArray(list) ? list : []) observedOrigins.add(String(entry))
  }

  const visit = async (path) => {
    await blank()
    await navigateRaw(`${origin}${path}`, path)
    const href = await evaluateString('location.href', `the document at ${path}`)
    if (href === 'about:blank') {
      throw new SafeError(
        `The browser still holds about:blank after navigating to ${path}; the navigation did not produce a document.`,
      )
    }
  }

  const navigate = visit

  const surface = async (path) => {
    await visit(path)
    const view = {
      path,
      landing: await evaluateString('location.pathname', `the landing path at ${path}`),
      html: await evaluateDocument(path),
      adapterKind: await evaluateNullableString(
        "(function () { var el = document.querySelector('[data-adapter-kind]'); " +
          "return el ? el.getAttribute('data-adapter-kind') : null })()",
        `the adapter kind at ${path}`,
      ),
    }
    await collectOrigins(path)
    return view
  }
  const screenshot = async (name) => {
    const result = await cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: true })
    const data = result.result?.data
    if (typeof data !== 'string') return
    writeFileSync(join(evidenceDirectory(), name), Buffer.from(data, 'base64'))
    context.screenshots.push(name)
  }
  const findTerms = (haystack, terms) => {
    if (typeof haystack !== 'string' || haystack.length === 0) {
      // Never search "nothing" and report a clean result: an empty haystack is
      // an absence of evidence, not evidence of absence.
      throw new SafeError('A marker scan was asked to search a document that was never obtained.')
    }
    const lower = haystack.toLowerCase()
    return terms.filter((term) => lower.includes(term.toLowerCase()))
  }

  /* -----------------------------------------------------------------
   * G-21's collector must PROVE it is attached before G-21 may mean
   * anything. An empty error list from a collector that was never wired up
   * is indistinguishable from a clean run — so the collector is made to
   * catch a deliberate error first, and the buffer is reset before the real
   * navigation begins. Only the outcome of the self-test is printed; the
   * collected TEXT is never rendered, here or at the gate.
   * ---------------------------------------------------------------- */
  phase('G-21 collector liveness self-test')
  let consoleCollectorLive = false
  try {
    await blank()
    const before = consoleErrors.length
    await cdp.send('Runtime.evaluate', {
      expression: `console.error(${JSON.stringify(CONSOLE_LIVENESS_TOKEN)})`,
      returnByValue: true,
      awaitPromise: true,
    })
    const deadline = Date.now() + CONSOLE_LIVENESS_TIMEOUT_MS
    while (Date.now() < deadline && consoleErrors.length === before) {
      await new Promise((r) => setTimeout(r, 50))
    }
    consoleCollectorLive = consoleErrors.length > before
  } catch {
    consoleCollectorLive = false
  }
  // The probe and anything else observed so far is discarded: G-21 judges the
  // real navigation only.
  consoleErrors.length = 0
  if (consoleCollectorLive) {
    pass('the console/runtime error collector caught a deliberately emitted error and was then reset')
  } else {
    info('the console/runtime error collector did NOT catch its own probe; G-21 will be recorded FAIL')
  }

  /* -----------------------------------------------------------------
   * Passwords. Prompted separately, hidden, in lifecycle order.
   * ---------------------------------------------------------------- */
  phase('Fixture passwords')
  info('entered on this terminal only; never stored, printed, logged, written or transmitted')
  const secrets = await promptForPasswords()

  /* -----------------------------------------------------------------
   * G-1 / G-2 / G-19(a) / G-14 / G-21 — the authenticated legs.
   * ---------------------------------------------------------------- */
  phase('Authenticated legs')

  const signedIn = []
  const authFailures = []
  const roleSurfaces = new Map()
  /**
   * G-14's denial pair, captured WHILE the parent session is live: one
   * canonical report for a pair that does not exist, one for the REAL fixture
   * student and session this parent is not entitled to read. If the two
   * answers differ in any way, the denial disclosed existence.
   */
  let parentDenialPair = null
  /** Why the pair could not be captured, if it could not. Authored, never captured. */
  let parentDenialFailure = null

  try {
    for (const identity of IDENTITIES) {
      let cookies
      try {
        // The password is read out of the map, handed to exactly one call as a
        // parameter, and dropped from the map immediately. It never appears in
        // any other expression in this file.
        cookies = await establishSessionCookies(apiUrl, publishableKey, identity, secrets.get(identity.key))
        signedIn.push(identity.key)
      } catch (error) {
        authFailures.push(identity.label)
        throw error
      } finally {
        secrets.delete(identity.key)
      }

      await cdp.send('Network.clearBrowserCookies')
      for (const cookie of cookies) {
        await cdp.send('Network.setCookie', {
          name: cookie.name,
          value: cookie.value,
          url: origin,
          path: '/',
        })
      }
      // The cookie array goes out of scope with this iteration.
      cookies = null

      const own = await surface(identity.landing)
      const foreign = []
      for (const prefix of PORTAL_PREFIXES) {
        if (prefix === identity.home) continue
        foreign.push(await surface(prefix))
        foreign.push(await surface(`${prefix}/reports`))
      }
      const loginWithSession = await surface('/login')
      const roleQuery = await surface(`${identity.landing}?role=trainer`)

      roleSurfaces.set(identity.key, { own, foreign, loginWithSession, roleQuery })

      if (identity.key === 'parent') {
        // G-14's whole substance is a byte comparison, so its degenerate case
        // — "no bytes at all" — must be a FAILURE to obtain, never a match.
        // Both documents are asserted to exist and to be real documents before
        // either is compared, and an inability to capture them is recorded as
        // such rather than silently satisfying `undefined === undefined`.
        try {
          const unknown = await surface(
            `/parent/students/${OPAQUE_STUDENT}/sessions/${OPAQUE_SESSION}/report`,
          )
          const real = await surface(
            `/parent/students/${FIXTURE_STUDENT}/sessions/${FIXTURE_SESSION}/report`,
          )
          parentDenialPair = {
            identical: unknown.landing === real.landing && unknown.html === real.html,
            landing: unknown.landing,
            bytes: real.html.length,
            leaked: findTerms(real.html, FIXTURE_MARKERS),
          }
        } catch (error) {
          parentDenialFailure =
            error instanceof SafeError ? error.message : 'the denial pair could not be captured from the browser'
        }
      }

      await navigate(identity.landing)
      await screenshot(`portal-${identity.key}.png`)
      await cdp.send('Network.clearBrowserCookies')
    }
  } finally {
    // Belt and braces: whatever happened above, no password survives it.
    secrets.clear()
  }

  gateFrom(
    'G-1',
    signedIn.length === IDENTITIES.length,
    'all three fixture identities authenticated against local Supabase Auth with an operator-typed password, and each returned its ratified deterministic UUID',
    `authentication did not complete for: ${authFailures.join(', ') || 'an unnamed identity'}`,
  )

  const authorityFailures = []
  for (const identity of IDENTITIES) {
    const observed = roleSurfaces.get(identity.key)
    if (!observed) {
      authorityFailures.push(`${identity.label}: no surface was observed`)
      continue
    }
    if (!observed.own.landing.startsWith(identity.home)) {
      authorityFailures.push(`${identity.label} own portal landed on ${observed.own.landing}`)
    }
    for (const foreign of observed.foreign) {
      if (!foreign.landing.startsWith(identity.home)) {
        authorityFailures.push(`${identity.label} reached ${foreign.path} and landed on ${foreign.landing}`)
      }
    }
    if (!observed.loginWithSession.landing.startsWith(identity.home)) {
      authorityFailures.push(
        `${identity.label} on /login landed on ${observed.loginWithSession.landing}, not its own portal`,
      )
    }
    if (!observed.roleQuery.landing.startsWith(identity.home)) {
      authorityFailures.push(`${identity.label} with ?role=trainer landed on ${observed.roleQuery.landing}`)
    }
  }
  gateFrom(
    'G-2',
    authorityFailures.length === 0,
    'every authenticated session reached only its own server-derived portal; both foreign portals and /login redirected to it, and ?role= changed nothing',
    authorityFailures.join(' | '),
  )

  const fixtureLeaks = []
  const wrongAdapter = []
  for (const identity of IDENTITIES) {
    const observed = roleSurfaces.get(identity.key)
    if (!observed) continue
    for (const view of [observed.own, observed.loginWithSession, observed.roleQuery, ...observed.foreign]) {
      const found = findTerms(view.html, FIXTURE_MARKERS)
      if (found.length > 0) fixtureLeaks.push(`${identity.label} ${view.path}: ${found.join(', ')}`)
    }
    if (observed.own.adapterKind !== REAL_ADAPTER_KIND) {
      wrongAdapter.push(`${identity.label} ${observed.own.path} reported ${observed.own.adapterKind}`)
    }
  }

  phase('G-19(b) — concurrency proofs on a disposable database')
  info('this creates, dirties and destroys its own database; the canonical one is untouched')
  const concurrency = nodeScriptExitCode(join('scripts', 'tests', 'step-7i', 'run-concurrency.mjs'))
  info(`run-concurrency.mjs exit ${concurrency.status}`)

  const fixtureModeOk = fixtureLeaks.length === 0 && wrongAdapter.length === 0
  gateFrom(
    'G-19',
    fixtureModeOk && concurrency.status === 0,
    `every authenticated portal surface reported data-adapter-kind="${REAL_ADAPTER_KIND}" with no fixture marker, and the four R(C) concurrency proofs passed on their own disposable database`,
    fixtureModeOk
      ? `run-concurrency.mjs exited ${concurrency.status}`
      : `fixture markers: ${fixtureLeaks.join(' | ') || 'none'}; adapter: ${wrongAdapter.join(' | ') || 'ok'}`,
  )

  gateFrom(
    'G-11',
    concurrency.status === 0,
    'T7I-15, T7I-16, T7I-46 and T7I-61 — the coordinated stale-state and duplicate-action proofs — passed on the disposable database',
    `the coordinated concurrency proofs exited ${concurrency.status}`,
  )

  /* -----------------------------------------------------------------
   * G-14 — parent isolation and non-disclosing denial.
   * ---------------------------------------------------------------- */
  phase('G-14 — parent non-disclosing denial')
  if (parentDenialFailure !== null) {
    // FAIL, not PASS and not NOT-RUN: the session WAS live and the comparison
    // was attempted, and it could not obtain both documents.
    gate(
      'G-14',
      'FAIL',
      `both canonical-report denial documents could not be obtained with the live parent session, so nothing was compared: ${parentDenialFailure}`,
    )
  } else if (parentDenialPair === null) {
    gate('G-14', 'NOT-RUN', 'the live parent session was never reached, so no denial pair could be compared')
  } else {
    gateFrom(
      'G-14',
      parentDenialPair.identical && parentDenialPair.leaked.length === 0,
      `with a live parent session, a canonical report for a non-existent pair and one for the REAL fixture pair rendered byte-identical documents of ${parentDenialPair.bytes} bytes at ${parentDenialPair.landing} — existence is not disclosed and no substance leaked`,
      parentDenialPair.identical
        ? `the denial for the real pair carried: ${parentDenialPair.leaked.join(', ')}`
        : 'the two canonical-report denials differed, which discloses that one of the two pairs exists',
    )
  }

  /* -----------------------------------------------------------------
   * G-21 — browser console.
   * ---------------------------------------------------------------- */
  if (!consoleCollectorLive) {
    // A collector that never proved it was attached cannot produce a PASS: an
    // empty error list from a detached collector is not a clean run.
    gate(
      'G-21',
      'FAIL',
      'the console/runtime error collector failed its liveness self-test — a deliberately emitted console error was not captured — so an empty error list proves nothing',
    )
  } else {
    gateFrom(
      'G-21',
      consoleErrors.length === 0,
      'the collector proved live on a deliberate error, was reset, and then recorded no uncaught error, console error or error-level log entry across every authenticated surface navigated in this run',
      `${consoleErrors.length} browser console/runtime error(s) were observed`,
    )
  }

  /* -----------------------------------------------------------------
   * The SERVED application's own targets. `next start` loads the
   * application's own `.env.local`, which this runner never reads. What it
   * CAN assert without reading a single value is where the served pages
   * actually went: every http(s) origin the exercised surfaces requested must
   * be loopback. Only ORIGINS are collected — never a path, query or header —
   * so nothing a credential could occupy is examined or printed.
   * ---------------------------------------------------------------- */
  const foreignOrigins = [...observedOrigins].filter((entry) => {
    try {
      return !LOOPBACK_HOSTS.has(new URL(entry).hostname)
    } catch {
      return true
    }
  })
  if (foreignOrigins.length > 0) {
    throw new SafeError(
      `The served application requested ${foreignOrigins.length} non-loopback origin(s): ${foreignOrigins.join(', ')}. ` +
        'This runner refuses every non-local target.',
    )
  }
  pass(`every origin the served application requested is loopback (${observedOrigins.size} distinct)`)

  /* -----------------------------------------------------------------
   * G-17 — audit chain, read-only, through the in-database verifier.
   * ---------------------------------------------------------------- */
  phase('G-17 — audit chain verification')
  const chainRows = psqlRows(
    'SELECT centre_id::text, ok::text, events_checked::text, ' +
      "COALESCE(first_failed_seq::text, '-'), COALESCE(failed_check, '-'), head_checked::text " +
      'FROM public.audit_verify_chain();',
  )
  const corrupt = chainRows.filter((row) => row[1] !== 't')
  gateFrom(
    'G-17',
    chainRows.length > 0 && corrupt.length === 0,
    `public.audit_verify_chain() reported ok for ${chainRows.length} centre chain(s), ${chainRows
      .map((row) => row[2])
      .join('+')} event(s) checked, head included`,
    chainRows.length === 0
      ? 'audit_verify_chain() returned no chain to verify'
      : `chain(s) failing verification: ${corrupt.map((row) => `${row[0]} at seq ${row[3]} (${row[4]})`).join(', ')}`,
  )

  /* -----------------------------------------------------------------
   * G-18 — the canonical database is exactly as it was.
   * ---------------------------------------------------------------- */
  phase('G-18 — canonical database pristine')
  const endChecksum = canonicalChecksum()
  context.endChecksum = endChecksum.sha256
  const endCounts = psqlRows(`
    SELECT
      (SELECT count(*) FROM public.report_versions),
      (SELECT count(*) FROM public.report_version_ratings),
      (SELECT count(*) FROM public.reports WHERE status = 'approved');
  `)[0]
  const pristine =
    endChecksum.sha256 === preflight.checksum.sha256 &&
    endChecksum.sha256 === EXPECTED_CANONICAL_CHECKSUM &&
    endChecksum.rows === preflight.checksum.rows &&
    Number(endCounts[0]) === preflight.reportVersions &&
    Number(endCounts[1]) === preflight.reportVersionRatings &&
    Number(endCounts[2]) === 0
  gateFrom(
    'G-18',
    pristine,
    `the canonical checksum is unchanged (${endChecksum.sha256}, ${endChecksum.rows} rows) and matches the pinned value; report_versions and report_version_ratings are unchanged; zero committed 'approved' rows`,
    `checksum start ${preflight.checksum.sha256} end ${endChecksum.sha256}; report_versions ${endCounts[0]}, report_version_ratings ${endCounts[1]}, committed 'approved' ${endCounts[2]}`,
  )

  /* -----------------------------------------------------------------
   * G-16 — half-decidable, therefore NOT-RUN with what WAS observed.
   * ---------------------------------------------------------------- */
  gate(
    'G-16',
    'NOT-RUN',
    `the residue half was verified read-only and holds (${endCounts[2]} committed rows at status='approved'); ` +
      `the "exactly two ordered state-change events" half needs a real submission — ${LIFECYCLE_NOT_RUN}`,
  )

  /* -----------------------------------------------------------------
   * The lifecycle-substance gates. Recorded honestly, never guessed.
   * ---------------------------------------------------------------- */
  for (const id of ['G-3', 'G-4', 'G-5', 'G-6', 'G-7', 'G-8', 'G-9', 'G-10', 'G-12', 'G-13', 'G-15']) {
    gate(id, 'NOT-RUN', LIFECYCLE_NOT_RUN)
  }
}

// ---------------------------------------------------------------------
// Teardown and hygiene (H-1), on EVERY exit path.
// ---------------------------------------------------------------------

/**
 * H-1's subjects, populated AS THEY ARE ACQUIRED — the ports the moment they
 * are chosen, the socket the moment it is open — and never at `main`'s return.
 * A run that throws after starting the server must still be able to name the
 * ports it has to prove released; a run that cannot name them records FAIL,
 * because "there is nothing to check" is not the same as "nothing is held".
 */
const teardownState = { appPort: null, debugPort: null, socket: null, context: null }

let toreDown = false

async function teardownAndVerify() {
  if (toreDown) return
  toreDown = true

  const { appPort, debugPort, socket } = teardownState
  try {
    socket?.close()
  } catch {
    // Nothing to close.
  }
  await stopEverything()

  const serverGone = !processAlive(owned.serverPid)
  const chromeGone = !processAlive(owned.chromePid)
  // `null` means UNVERIFIED, and unverified is never a pass.
  const appPortReleased = appPort === null ? null : await waitForPortReleased(appPort)
  const debugPortReleased = debugPort === null ? null : await waitForPortReleased(debugPort)
  const describe = (value, port) =>
    value === null ? 'unverified (this run never recorded which port it owned)' : `${port} released=${value}`

  if (!ledger.has('H-1')) {
    gateFrom(
      'H-1',
      serverGone && chromeGone && appPortReleased === true && debugPortReleased === true,
      `this run's server PID and Chrome PID are gone, and ports ${appPort} (server) and ${debugPort} (CDP) were re-bound successfully, which proves they are released`,
      `server gone=${serverGone}, chrome gone=${chromeGone}, app port ${describe(appPortReleased, appPort)}, ` +
        `CDP port ${describe(debugPortReleased, debugPort)}`,
    )
  }
}

/**
 * The single end-of-run routine: close every undecided gate, print the ledger
 * and write it. It runs exactly once, on the normal path AND on the signal
 * path, which is what makes the abort documentation true.
 */
let ledgerFinished = false
function finishRun() {
  if (ledgerFinished) return
  ledgerFinished = true
  if (ledger.size === 0) return

  closeLedger('not reached: the run ended before this gate could be decided')
  printLedger()
  const context = teardownState.context ?? runContext
  context.completedAt = new Date().toISOString()
  try {
    const directory = evidenceDirectory()
    writeLedger(directory, context)
    say('')
    say(`Redacted gate ledger written to ${directory}`)
  } catch {
    say('')
    say('The gate ledger could not be written to the external evidence pack.')
  }
}

let interrupted = false

/**
 * The abort path does what the documentation says it does: kill, VERIFY the
 * ports are released, record H-1 from that verification, close and write the
 * ledger, then exit 130. It does not merely kill and hope — and it does not
 * depend on `main` ever settling, which it may not if the browser has stopped
 * answering.
 */
async function abortAndExit() {
  try {
    await teardownAndVerify()
  } catch {
    // Teardown must never mask the abort, and never surfaces captured output.
  }
  try {
    finishRun()
  } catch {
    // Neither must the ledger.
  }
  process.exit(130)
}

const onSignal = () => {
  if (interrupted) return
  interrupted = true
  process.stdout.write('\nAborting. Stopping this run\'s server and browser, then verifying the ports.\n')
  // No captured output is printed here, or anywhere on this path.
  process.exitCode = 130
  try {
    // A signal during a hidden prompt must not leave echo disabled.
    if (process.stdin.isTTY && typeof process.stdin.setRawMode === 'function') process.stdin.setRawMode(false)
  } catch {
    // Restoring the terminal must never mask the abort.
  }
  // A last-resort deadline, generous enough for a real port-release check.
  const hardStop = setTimeout(() => process.exit(130), 45_000)
  if (typeof hardStop.unref === 'function') hardStop.unref()
  void abortAndExit()
}
process.on('SIGINT', onSignal)
process.on('SIGTERM', onSignal)

main()
  .catch((error) => {
    const message = error instanceof SafeError ? error.message : 'The F17 runner failed.'
    process.stderr.write(`\nFAILED: ${message}\n`)
    process.exitCode = 1
  })
  .then(async () => {
    // Teardown runs whether main resolved, threw, or was never reached.
    if (owned.server !== null || owned.chrome !== null || teardownState.appPort !== null) {
      await teardownAndVerify()
    }

    finishRun()
    const failed = [...ledger.values()].filter((entry) => entry.verdict === 'FAIL').length
    if (failed > 0 && process.exitCode !== 130) process.exitCode = 1
  })
  .finally(() => {
    // Nothing may keep the event loop alive once the run is over. stdin is
    // resumed during password entry, and a referenced stdin handle makes the
    // process wait for input that will never arrive.
    process.stdin.pause()
    if (typeof process.stdin.unref === 'function') process.stdin.unref()
  })
