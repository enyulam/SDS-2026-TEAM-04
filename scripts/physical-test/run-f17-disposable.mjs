#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach — F17 writable lifecycle on the DISPOSABLE stack
// =====================================================================
// LOCAL DISPOSABLE SUPABASE STACK ONLY.
//
// Usage:
//   node scripts/physical-test/run-f17-disposable.mjs --help
//   node scripts/physical-test/run-f17-disposable.mjs --preflight-only
//   node scripts/physical-test/run-f17-disposable.mjs        (interactive)
//
// Governing authority: docs/plan/PHYSICAL_TEST_SLICE_48H.md §13 (the 21
// acceptance gates), operator ruling R-C2-2 (the writable lifecycle runs on
// a SEPARATE disposable local Supabase environment; the canonical fixture
// database stays pristine) and operator ruling R-C2-4 (G-6 requires a REAL
// external provider call with the already-ratified openai / gpt-5.6-terra
// decision, and may never be reported PASS on anything else).
//
// ---------------------------------------------------------------------
// WHICH RUNNER OWNS WHICH GATES
// ---------------------------------------------------------------------
// `scripts/physical-test/run-f17.mjs` — THE CANONICAL RUNNER. It owns the
// READ-ONLY and AUTHENTICATION gates against the canonical fixture
// database: G-1, G-2, G-11, G-14, G-17, G-18, G-19(a), G-20, G-21 and H-1.
// It performs NO governed write, by design, and its G-18 gate is the reason.
// THIS FILE DOES NOT MODIFY, REPLACE, WEAKEN OR DEPRECATE IT.
//
// THIS RUNNER owns the WRITABLE LIFECYCLE gates, and owns them ONLY on the
// disposable stack: G-3, G-4, G-5, G-6, G-7, G-8, G-9, G-10, G-12, G-13,
// G-15 and G-16, plus its own instances of G-1/G-2/G-11/G-17/G-19/G-21 and
// its own G-18 (which here means: the canonical database is byte-identical
// before and after this run). See docs/plan/F17_RUNNER_GATE_OWNERSHIP.md.
//
// ---------------------------------------------------------------------
// PRIMITIVE REUSE — Option B, deliberately
// ---------------------------------------------------------------------
// `run-f17.mjs` is security-reviewed evidence. Option A (extract the shared
// primitives into a module BOTH runners import) is DRYer, but it is not the
// pure import-substitution it looks like: this runner needs a DIFFERENT
// project id, different container names, different ports, different
// identities and different prompt text, so a shared module would have to
// PARAMETERIZE constants that `run-f17.mjs` currently pins as fixed
// literals. Turning a pinned literal into a parameter is a semantic change
// to a security control, however carefully it is done, and it would have to
// be re-reviewed. Option B costs some duplication and buys the guarantee
// that `run-f17.mjs` is BYTE-UNTOUCHED by this phase. Option B is chosen.
//
// ---------------------------------------------------------------------
// ABSOLUTE RULES ENFORCED BY THIS FILE
// ---------------------------------------------------------------------
//  * The three role passwords are read ONLY from an interactive, no-echo
//    TTY. There is NO environment-variable path, NO command-line path, NO
//    file path, NO default and NO generated password. Missing or empty
//    input aborts. This runner cannot be made to accept a password any
//    other way, so it can never be asked for one through a chat channel.
//  * A password is held in a local variable, handed to exactly one call,
//    and dropped. It is never placed in an object that is logged,
//    serialized, returned, thrown or written; never interpolated into a
//    message, a URL or a template string; and never sent to a browser, to a
//    child-process argument or to an evidence file.
//  * No credential-bearing stream is ever rendered. Child stdout and stderr
//    are captured and DISCARDED — only an exit code survives. No
//    pattern-based redaction is used anywhere.
//  * `.env.local` is NEVER read. The disposable Supabase URL and keys come
//    from the DISPOSABLE stack's own startup output, live in process memory
//    and are passed only to a child process environment.
//  * ONE DELIBERATE, BOUNDED EXCEPTION, documented rather than hidden:
//    LLM_PROVIDER, LLM_MODEL and LLM_API_KEY are INHERITED from the
//    operator's already-exported shell environment and passed in memory to
//    the child app process. R-C2-4 requires a real provider call and there
//    is no other source for the key. This is a VALUE PASS-THROUGH, not a
//    config copy: no file is read, and none of these three variables
//    carries a Supabase credential. LLM_API_KEY is tested for PRESENCE only
//    — its value is never read into any other expression, never printed,
//    never hashed, never written and never placed in an error.
//  * The canonical stack is never started, stopped, reconfigured or written
//    to. `supabase/config.toml` is never modified. `supabase stop --all` is
//    never called.
// =====================================================================

import { createClient } from '@supabase/supabase-js'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import {
  CANONICAL_API_PORT,
  CANONICAL_CONTAINERS,
  CANONICAL_PROJECT_ID,
  DISPOSABLE_API_PORT,
  DISPOSABLE_APP_PORT,
  DISPOSABLE_DB_CONTAINER,
  DISPOSABLE_DEBUG_PORT,
  DISPOSABLE_IDENTITIES,
  DISPOSABLE_PROJECT_ID,
  DISPOSABLE_PUBLISHED_PORTS,
  EXPECTED_CANONICAL_MIGRATIONS,
  FIXTURE_MODE_VARIABLE,
  REPO_ROOT,
  SafeError,
  assertCanonicalConfigUntouched,
  assertCanonicalPristine,
  assertNoCollision,
  assertPortFree,
  captureDisposableStatus,
  createDisposableWorkdir,
  destroyDisposableWorkdir,
  diffCanonical,
  disposableContainersPresent,
  disposableVolumesPresent,
  info,
  pass,
  phase,
  portAnswers,
  psqlFileStdout,
  psqlRows,
  readCanonical,
  readDisposableCensus,
  resolveLocalCli,
  runCapturedExitCode,
  runningContainers,
  say,
  startDisposableStack,
  stopDisposableStack,
  waitForPortSilent,
  warn,
} from './disposable-stack.mjs'

// ---------------------------------------------------------------------
// The ratified provider decision (R-C2-4 / decision D-072 / checkpoint
// CP-1). These two values are PUBLIC, non-secret selectors already pinned
// in `server/platform/env.ts`. This runner USES the ratified decision and
// selects, substitutes and introduces nothing.
// ---------------------------------------------------------------------

const RATIFIED_LLM_PROVIDER = 'openai'
const RATIFIED_LLM_MODEL = 'gpt-5.6-terra'

/**
 * The app's committed local-target contract, restated here so this runner
 * can DETECT the conflict rather than trip over it. `lib/supabase/public-config.ts`
 * classifies a loopback `NEXT_PUBLIC_SUPABASE_URL` as local ONLY on port
 * 54321 and fails E_PUB_URL_LOCAL_PORT otherwise. See the APP-TARGET gate.
 */
const APP_PINNED_LOCAL_API_PORT = 54321

// ---------------------------------------------------------------------
// The gate ledger. Every gate gets its own line, one of PASS / FAIL /
// NOT-RUN, and a one-line authored reason. A gate is NEVER defaulted,
// inferred or guessed, and NOTHING is ever defaulted to PASS.
// ---------------------------------------------------------------------

const GATE_TITLES = new Map([
  ['G-1', 'Real three-role authentication (disposable stack)'],
  ['G-2', 'Server-derived role and centre authority'],
  ['G-3', 'Complete Trainer→Management→Parent lifecycle'],
  ['G-4', 'All nine ratings required'],
  ['G-5', 'Real observation persistence'],
  ['G-6', 'Real AI generation and grounding — a REAL provider call, or NOT-RUN'],
  ['G-7', 'Deterministic retry/failure handling'],
  ['G-8', 'Trainer approval does not publish'],
  ['G-9', 'Management wording-only enforcement, rejected server-side even when the UI is bypassed'],
  ['G-10', 'Substantive changes require return and trainer reapproval'],
  ['G-11', 'Stale-state and duplicate-action rejection'],
  ['G-12', 'Returned and preapproved reports remain parent-invisible'],
  ['G-13', 'Parent sees only the submitted canonical report'],
  ['G-14', 'Parent isolation and non-disclosing denial'],
  ['G-15', 'Management cannot access preapproval draft content'],
  ['G-16', 'Final submission produces exactly two ordered state-change audit events'],
  ['G-17', 'No audit-chain corruption (disposable stack)'],
  ['G-18', 'Canonical verifier database remains pristine — byte-identical before and after this run'],
  ['G-19', 'Walkthrough ran against the DISPOSABLE stack with fixture mode positively OFF'],
  ['G-20', 'Typecheck, lint and build pass'],
  ['G-21', 'Browser console has no uncaught errors during the dry run'],
  ['H-1', 'Process hygiene — this run leaves no stack, no server, no browser, no volume and no held port behind'],
])

const ledger = new Map()

function gate(id, verdict, reason) {
  if (!GATE_TITLES.has(id)) throw new SafeError(`Unknown gate id: ${id}`)
  if (ledger.has(id)) throw new SafeError(`Gate ${id} was decided twice.`)
  if (!['PASS', 'FAIL', 'NOT-RUN'].includes(verdict)) {
    throw new SafeError(`Gate ${id} was given an unsupported verdict.`)
  }
  ledger.set(id, { verdict, reason })
}

function gateFrom(id, ok, passReason, failReason) {
  gate(id, ok ? 'PASS' : 'FAIL', ok ? passReason : failReason)
}

/** Every gate left undecided becomes NOT-RUN with an authored reason. */
function closeLedger(defaultReason) {
  for (const id of GATE_TITLES.keys()) {
    if (!ledger.has(id)) ledger.set(id, { verdict: 'NOT-RUN', reason: defaultReason })
  }
}

/**
 * THE APP-TARGET BLOCKER, stated once and reused verbatim wherever it bites.
 *
 * The lifecycle gates that need the real application server cannot be
 * decided while this holds, and they are recorded NOT-RUN with this reason
 * rather than guessed, softened or worked around. It is a conflict between
 * two binding constraints, and resolving it is an OPERATOR decision, not a
 * runner's.
 */
const APP_TARGET_BLOCKED =
  `requires the application served against the DISPOSABLE stack; lib/supabase/public-config.ts pins a loopback ` +
  `NEXT_PUBLIC_SUPABASE_URL to port ${APP_PINNED_LOCAL_API_PORT} (E_PUB_URL_LOCAL_PORT) while R-C2-2's isolation ` +
  `requirement forbids the disposable API port from being ${CANONICAL_API_PORT}; the two cannot both hold, and ` +
  'widening that pin is an operator decision this runner will not make on its own'

// ---------------------------------------------------------------------
// Arguments. There is deliberately NO argument that carries, names or
// points at a credential, and an unknown argument aborts before anything.
// ---------------------------------------------------------------------

const HELP = `
B.E.S.T Coach — F17 writable lifecycle on the DISPOSABLE Supabase stack

  node scripts/physical-test/run-f17-disposable.mjs --help
  node scripts/physical-test/run-f17-disposable.mjs --preflight-only
  node scripts/physical-test/run-f17-disposable.mjs

WHICH RUNNER OWNS WHICH GATES
  scripts/physical-test/run-f17.mjs   the CANONICAL runner. Read-only and
                                      authentication gates against the
                                      canonical fixture database. It performs
                                      NO governed write, and this runner does
                                      not replace, weaken or deprecate it.
  this runner                         the WRITABLE lifecycle gates, on a
                                      SEPARATE disposable local stack
                                      (project "${DISPOSABLE_PROJECT_ID}").

WHAT IT DOES, IN ORDER
  1. Refuses unless the canonical stack is intact: supabase/config.toml still
     pins "${CANONICAL_PROJECT_ID}" and its ports, no project reference exists, all
     ${CANONICAL_CONTAINERS.length} canonical containers are running, and no disposable identifier
     collides with a canonical one.
  2. Records the canonical fixture checksum, census, migration list and Auth
     user id set BEFORE anything is provisioned, so "untouched" is measured.
  3. Reports the provider posture: LLM_PROVIDER and LLM_MODEL must equal the
     already-ratified "${RATIFIED_LLM_PROVIDER}" / "${RATIFIED_LLM_MODEL}", and LLM_API_KEY must be
     PRESENT. Presence only — no value is read, printed, hashed or written.
  4. Reports the application-target posture (see BLOCKER below).
  5. G-20: npx tsc --noEmit, npm run lint, npm run build. Output captured and
     discarded; only exit codes are used.
  6. Provisions the DISPOSABLE stack in a temp workdir outside the repository,
     replaying the ${EXPECTED_CANONICAL_MIGRATIONS} COMMITTED migrations byte-identically, on ports
     ${DISPOSABLE_PUBLISHED_PORTS.join('/')} (app ${DISPOSABLE_APP_PORT}, CDP ${DISPOSABLE_DEBUG_PORT}).
  7. Prompts, separately and with echo disabled, for the Trainer, then
     Management, then Parent password FOR THE DISPOSABLE STACK. Each is handed
     to exactly one call and dropped.
  8. Creates the three SEPARATE synthetic Auth identities on the disposable
     stack and loads the SAME committed synthetic domain fixture.
  9. Drives the writable lifecycle and records G-1 … G-21 INDIVIDUALLY.
 10. Tears the disposable stack down on EVERY exit path, then INDEPENDENTLY
     re-reads the canonical database and proves it is byte-identical.

WHAT IT WILL NEVER DO
  * Read a password from an environment variable, a command-line argument, a
    file, a default or a generated value. There is no such code path, so this
    runner cannot be asked for a password through any channel but its own
    terminal prompt.
  * Print, log, serialize, write, transmit or interpolate a password, token,
    cookie or key anywhere, on any path, including every failure path.
  * Render the stdout or stderr of any child process.
  * Read .env.local, or take any Supabase URL or key from it.
  * Modify supabase/config.toml or any committed migration.
  * Perform a governed write against the canonical fixture database.
  * Call "supabase stop --all", which would stop the canonical stack.
  * Report G-6 PASS on fixture text, hard-coded output, a deterministic fake
    provider, a cached value or an unverified assumption that a call worked.

KNOWN BLOCKER — recorded, not worked around
  ${APP_TARGET_BLOCKED}.
  Until an operator resolves it, every gate that needs the served application
  is recorded NOT-RUN with that exact reason. None of them is guessed.

OPTIONS
  --help            print this and exit 0.
  --preflight-only  steps 1-4 only. Read-only, prompts for nothing, needs no
                    terminal, provisions nothing and decides no gate that
                    requires a session or a write.

NON-CREDENTIAL ENVIRONMENT (all optional; none may carry a Supabase secret)
  BEST_COACH_F17_DISPOSABLE_EVIDENCE_DIR   ledger directory, outside Git
  CHROME_PATH                              headless Chrome binary

  LLM_PROVIDER / LLM_MODEL / LLM_API_KEY are INHERITED from the operator's
  shell if exported, and passed in memory to the child app process only. This
  is a deliberate, bounded exception required by R-C2-4: a real provider call
  has no other credential source. It is a value pass-through, NOT a config
  copy, it reads no file, and it carries NO Supabase credential. The key's
  value is never read into any expression, printed, hashed or written.

ABORTING
  Press Ctrl+C at any point, including at a password prompt. The disposable
  stack, the server and the browser are stopped, their removal is VERIFIED,
  the canonical database is re-read, and the redacted ledger is written. The
  exit code is 130.
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
          'There is no argument that supplies a password, a token, a key or a path to one, and there never will be.',
      )
    }
  }
  return options
}

// ---------------------------------------------------------------------
// No-echo password entry. Interactive TTY only. Terminal state is restored
// on every success, failure and cancellation path.
//
// Raw-mode input arrives as Buffers and is interpreted as NUMBERS. The
// stream is deliberately left in Buffer mode: setEncoding() would deliver
// strings, every numeric byte comparison would be permanently false, Enter
// would be ignored and Ctrl+C would be swallowed into the buffer.
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
 * I/O and prints nothing. Bytes accumulate raw and are decoded as UTF-8 only
 * when the finished line is taken, so multi-byte characters survive
 * backspace intact.
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
 * Prompt once per identity, in the fixed order Trainer, Management, Parent —
 * the order of the governed lifecycle. No echo, no confirmation, no length
 * feedback, no defaults and no alternative source. One raw-mode session, one
 * `data` listener and one temporary SIGINT handler serve all three prompts,
 * which is what guarantees a stray line feed cannot be delivered to the next
 * prompt and submit it empty.
 */
async function promptForPasswords() {
  const input = process.stdin

  if (!input.isTTY || typeof input.setRawMode !== 'function') {
    throw new SafeError('An interactive terminal is required to enter the disposable-stack passwords.')
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

  const cancelled = () => new SafeError('Cancelled at the password prompt. Nothing was created and nothing was signed in.')

  const secrets = new Map()

  input.setRawMode(true)
  input.on('data', onData)
  process.on('SIGINT', onSigint)

  try {
    for (const identity of DISPOSABLE_IDENTITIES) {
      if (cancelledBetweenPrompts) throw cancelled()
      // The prompt names the ROLE only. No value is ever echoed.
      const status = await readLine(`  ${identity.label} DISPOSABLE-stack password (input hidden): `)
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
// Posture checks that need no password and no provisioning.
// ---------------------------------------------------------------------

/**
 * The provider posture, R-C2-4.
 *
 * `provider` and `model` are PUBLIC ratified selectors and are compared by
 * equality against the literals this file pins. `LLM_API_KEY` is tested for
 * PRESENCE ONLY: `typeof … === 'string' && trimmed.length > 0`. Its value is
 * never assigned to anything, never printed, never hashed, never written and
 * never placed in an error message — which is why this function returns
 * three booleans and a count, and nothing else.
 */
function providerPosture() {
  const provider = process.env.LLM_PROVIDER
  const model = process.env.LLM_MODEL
  const rawKey = process.env.LLM_API_KEY
  const keyPresent = typeof rawKey === 'string' && rawKey.trim().length > 0
  return {
    providerMatches: provider === RATIFIED_LLM_PROVIDER,
    modelMatches: model === RATIFIED_LLM_MODEL,
    keyPresent,
    // The NAME of a variable is not a secret; its value is never touched again.
    providerSeen: provider === undefined ? 'unset' : provider === RATIFIED_LLM_PROVIDER ? 'ratified' : 'other',
    modelSeen: model === undefined ? 'unset' : model === RATIFIED_LLM_MODEL ? 'ratified' : 'other',
  }
}

/**
 * The application-target posture. This is a STRUCTURAL check against the
 * committed contract in `lib/supabase/public-config.ts`; it reads no
 * environment value and no `.env.local`.
 */
function appTargetPosture() {
  return {
    disposableApiPort: DISPOSABLE_API_PORT,
    appPinnedPort: APP_PINNED_LOCAL_API_PORT,
    servable: DISPOSABLE_API_PORT === APP_PINNED_LOCAL_API_PORT,
  }
}

// ---------------------------------------------------------------------
// G-20 — typecheck, lint, build. Captured, unrendered, exit codes only.
// ---------------------------------------------------------------------

function runG20() {
  const typecheck = runCapturedExitCode(
    process.execPath,
    [join(REPO_ROOT, 'node_modules', 'typescript', 'bin', 'tsc'), '--noEmit'],
    { cwd: REPO_ROOT },
  )
  info(`tsc --noEmit exit ${typecheck.status}`)
  // Run an npm script through THIS Node runtime's own npm-cli where it
  // exists, with a fixed argument array and no shell string.
  const npmScript = (name) => {
    const local = join(process.execPath, '..', 'node_modules', 'npm', 'bin', 'npm-cli.js')
    if (existsSync(local)) return runCapturedExitCode(process.execPath, [local, 'run', name], { cwd: REPO_ROOT })
    return runCapturedExitCode(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', name], {
      cwd: REPO_ROOT,
      shell: process.platform === 'win32',
    })
  }
  const lint = npmScript('lint')
  info(`npm run lint exit ${lint.status}`)
  const build = npmScript('build')
  info(`npm run build exit ${build.status}`)
  return { typecheck, lint, build }
}

// ---------------------------------------------------------------------
// Disposable seeding: SEPARATE synthetic Auth identities, then the SAME
// committed synthetic domain fixture.
// ---------------------------------------------------------------------

function makeAdminClient(apiUrl, serviceRoleKey) {
  return createClient(apiUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  })
}

/**
 * Create the three DISPOSABLE Auth identities.
 *
 * The password is a PARAMETER, handed to exactly one call, and then out of
 * scope. It is never stored on an object, returned, logged, serialized,
 * written or interpolated into any message — including the failure message
 * below, which is authored here and names only the ROLE.
 *
 * The UUIDs are the committed fixture's own structural literals, because
 * `scripts/fixtures/local_fixtures.sql` writes them into
 * `accounts.auth_user_id` and asserts the three links exist. The EMAILS are
 * disposable-only addresses, so the thing that actually authenticates is
 * separate from the canonical fixture in both of its parts.
 */
async function createDisposableIdentities(admin, secrets) {
  const created = []
  for (const identity of DISPOSABLE_IDENTITIES) {
    const password = secrets.get(identity.key)
    if (typeof password !== 'string' || password.length === 0) {
      throw new SafeError(`No password was captured for the ${identity.label} disposable identity.`)
    }
    const { data, error } = await admin.auth.admin.createUser({
      id: identity.authId,
      email: identity.email,
      password,
      email_confirm: true,
    })
    // The Auth error object is NEVER surfaced: it can echo the request.
    if (error) throw new SafeError(`Auth creation failed for the ${identity.label} disposable identity.`)
    if (data?.user?.id !== identity.authId) {
      throw new SafeError(
        `The disposable Auth service returned a different id than the fixture literal for the ${identity.label} identity.`,
      )
    }
    created.push(identity.key)
  }
  return created
}

/**
 * Load the SAME committed synthetic fixture, then point the three account
 * rows at the DISPOSABLE addresses. The fixture file is not forked, edited
 * or reordered — it is executed verbatim, and only the disposable database
 * is touched.
 */
function seedDisposableDomain() {
  psqlFileStdout(DISPOSABLE_DB_CONTAINER, join(REPO_ROOT, 'scripts', 'fixtures', 'local_fixtures.sql'), {
    do_cleanup: 'false',
    do_load: 'true',
  })
  const updates = DISPOSABLE_IDENTITIES.map(
    (identity) =>
      `UPDATE public.accounts SET normalized_email = '${identity.email}' WHERE id = '${identity.accountId}';`,
  ).join('\n')
  psqlRows(DISPOSABLE_DB_CONTAINER, `BEGIN;\n${updates}\nCOMMIT;\nSELECT 1;`)

  const linked = psqlRows(
    DISPOSABLE_DB_CONTAINER,
    'SELECT count(*) FROM public.accounts a JOIN auth.users u ON u.id = a.auth_user_id;',
  )[0]?.[0]
  if (linked !== String(DISPOSABLE_IDENTITIES.length)) {
    throw new SafeError(
      `Only ${linked ?? 'an unreadable number of'} disposable account rows are linked to an Auth user; ` +
        `${DISPOSABLE_IDENTITIES.length} are required.`,
    )
  }
}

/**
 * Authenticate one identity against the DISPOSABLE stack. The password is a
 * parameter, handed to exactly one call, then dropped. The returned access
 * token is a CREDENTIAL: it is held in memory, used as a bearer for
 * PostgREST calls, and is never printed, written or placed in an error.
 */
async function signIn(apiUrl, publishableKey, identity, password) {
  const client = createClient(apiUrl, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  })
  const { data, error } = await client.auth.signInWithPassword({ email: identity.email, password })
  if (error) {
    throw new SafeError(
      `Sign-in failed for the ${identity.label} disposable identity. No detail is reported, by design; re-run and re-enter it.`,
    )
  }
  if (data?.user?.id !== identity.authId) {
    throw new SafeError(
      `The disposable Auth service returned a different id than the fixture literal for the ${identity.label} identity.`,
    )
  }
  const token = data?.session?.access_token
  if (typeof token !== 'string' || token.length === 0) {
    throw new SafeError(`No access token was produced for the ${identity.label} disposable identity.`)
  }
  return { token, userId: data.user.id }
}

// ---------------------------------------------------------------------
// Teardown state and hygiene (H-1), on EVERY exit path.
// ---------------------------------------------------------------------

const acquired = { cli: null, workdir: null, stackStarted: false }
const readings = { canonicalBefore: null, canonicalAfter: null }

let teardownPromise = null
function teardown() {
  if (teardownPromise === null) teardownPromise = runTeardown()
  return teardownPromise
}

async function runTeardown() {
  if (!acquired.stackStarted && acquired.workdir === null) return

  phase('Teardown — the disposable stack only; the canonical stack is left running')

  if (acquired.stackStarted && acquired.cli !== null) {
    const status = stopDisposableStack(acquired.cli, acquired.workdir)
    info(`supabase stop --project-id ${DISPOSABLE_PROJECT_ID} --no-backup exit ${status}`)
  }

  const containers = acquired.stackStarted ? disposableContainersPresent() : []
  const volumes = acquired.stackStarted ? disposableVolumesPresent() : []
  const stillServing = []
  if (acquired.stackStarted) {
    for (const port of DISPOSABLE_PUBLISHED_PORTS) {
      if (!(await waitForPortSilent(port))) stillServing.push(port)
    }
  }
  const workdirRemoved = destroyDisposableWorkdir()

  if (!ledger.has('H-1')) {
    gateFrom(
      'H-1',
      containers.length === 0 && volumes.length === 0 && stillServing.length === 0 && workdirRemoved,
      `every disposable container and data volume is gone, ports ${DISPOSABLE_PUBLISHED_PORTS.join(', ')} refuse a ` +
        'TCP connection, and the temporary workdir was deleted; the canonical stack was never stopped',
      `containers left: ${containers.join(', ') || 'none'}; volumes left: ${volumes.join(', ') || 'none'}; ` +
        `ports still serving: ${stillServing.join(', ') || 'none'}; workdir removed: ${workdirRemoved}`,
    )
  }
}

/**
 * G-18 for this run, per R-C2-2: the canonical fixture database has the same
 * verified checksum and zero report / version / audit residue BEFORE and
 * AFTER the disposable lifecycle. The "after" reading is INDEPENDENT — a
 * fresh query, not a cached value from the "before" pass.
 */
async function decideCanonicalGate() {
  if (ledger.has('G-18')) return
  if (readings.canonicalBefore === null) {
    gate('G-18', 'NOT-RUN', 'the canonical database was never read, so nothing could be compared')
    return
  }
  let after
  try {
    after = readCanonical()
  } catch {
    gate('G-18', 'FAIL', 'the canonical database could not be re-read after the run, so nothing was compared')
    return
  }
  readings.canonicalAfter = after
  const differences = diffCanonical(readings.canonicalBefore, after)
  const residueClean =
    after.counts.reports === 0 &&
    after.counts.reportVersions === 0 &&
    after.counts.reportVersionRatings === 0 &&
    after.counts.auditEvents === 0 &&
    after.counts.chainHeads === 0 &&
    after.counts.authUsers === 3
  gateFrom(
    'G-18',
    differences.length === 0 && residueClean,
    `independently re-read after teardown: checksum ${after.checksum.sha256} over ${after.checksum.rows} rows ` +
      '(unchanged); reports=0, report_versions=0, report_version_ratings=0, audit_events=0, audit_chain_heads=0, ' +
      'auth.users=3; the applied-migration list and the Auth user id set are unchanged',
    differences.length > 0 ? differences.join(' | ') : `canonical residue is non-zero: ${after.census}`,
  )
}

// ---------------------------------------------------------------------
// Evidence. REDACTED BY CONSTRUCTION and written OUTSIDE Git: only gate
// ids, verdicts, authored reasons, counts, port numbers, container names
// and PUBLIC checksums. There is no field here a credential could occupy.
// ---------------------------------------------------------------------

function evidenceDirectory() {
  const configured = process.env.BEST_COACH_F17_DISPOSABLE_EVIDENCE_DIR
  const target =
    configured && configured.length > 0 ? resolve(configured) : resolve(REPO_ROOT, '..', '_f17-disposable-evidence')
  mkdirSync(target, { recursive: true })
  return target
}

function writeLedger() {
  const lines = []
  lines.push('# F17 — disposable-stack writable-lifecycle gate ledger')
  lines.push('')
  lines.push('Produced by `node scripts/physical-test/run-f17-disposable.mjs`.')
  lines.push('REDACTED BY CONSTRUCTION: gate ids, verdicts, authored reasons, counts, ports, container')
  lines.push('names and public checksums only. No password, token, cookie, key, header or request body.')
  lines.push('')
  lines.push(`- Completed: ${new Date().toISOString()}`)
  lines.push(`- Canonical project: ${CANONICAL_PROJECT_ID} (never started, stopped, written to or reconfigured)`)
  lines.push(`- Disposable project: ${DISPOSABLE_PROJECT_ID} (provisioned, then removed)`)
  lines.push(`- Canonical checksum before: ${readings.canonicalBefore?.checksum.sha256 ?? 'not read'}`)
  lines.push(`- Canonical checksum after:  ${readings.canonicalAfter?.checksum.sha256 ?? 'not read'}`)
  lines.push('')
  lines.push('| Gate | Verdict | Reason |')
  lines.push('|---|---|---|')
  for (const [id, title] of GATE_TITLES) {
    const entry = ledger.get(id) ?? { verdict: 'NOT-RUN', reason: 'not reached' }
    lines.push(`| **${id}** ${title} | ${entry.verdict} | ${entry.reason.replace(/\|/g, '/')} |`)
  }
  lines.push('')
  try {
    const directory = evidenceDirectory()
    writeFileSync(join(directory, 'disposable-gate-ledger.md'), `${lines.join('\n')}\n`, 'utf8')
    say('')
    say(`Redacted gate ledger written to ${directory}`)
  } catch {
    say('')
    say('The gate ledger could not be written outside the repository.')
  }
}

function printLedger() {
  phase('Gate ledger')
  for (const [id, title] of GATE_TITLES) {
    const entry = ledger.get(id) ?? { verdict: 'NOT-RUN', reason: 'not reached' }
    say(`  ${entry.verdict.padEnd(7)} ${id.padEnd(5)} ${title}`)
    say(`          ${entry.reason}`)
  }
}

let finished = false
async function finish() {
  if (finished) return
  finished = true
  if (ledger.size === 0) return
  await decideCanonicalGate()
  closeLedger('not reached: the run ended before this gate could be decided')
  printLedger()
  writeLedger()
}

// ---------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------

async function main() {
  const options = parseArgs(process.argv)
  if (options.help) {
    say(HELP.trim())
    return
  }

  say('B.E.S.T Coach — F17 writable lifecycle on the DISPOSABLE Supabase stack (R-C2-2, R-C2-4)')
  say('No credential is read from an environment variable, an argument, a file, a default or a')
  say('generated value — there is no such code path. Passwords are typed on this terminal, hidden.')

  /*
   * THE TTY GATE. It runs before anything is prompted for and before
   * anything is provisioned, and it offers no alternative input path,
   * because there is none. `--preflight-only` is exempt: it prompts for
   * nothing and decides no gate that requires a session or a write.
   */
  if (!options.preflightOnly && !process.stdin.isTTY) {
    throw new SafeError(
      'An interactive terminal is required. This runner reads its three role passwords only from a no-echo ' +
        'prompt on an operator-controlled terminal, and it has no other input path: not an environment ' +
        'variable, not an argument, not a file, not a default and not a generated value. Re-run it directly ' +
        'in a terminal. Use --preflight-only for the read-only checks, or --help.',
    )
  }

  /* -----------------------------------------------------------------
   * 1 — canonical guards. Nothing is provisioned until these hold.
   * ---------------------------------------------------------------- */
  phase('Canonical guards (read-only)')
  const config = assertCanonicalConfigUntouched()
  pass(
    `supabase/config.toml (${config.bytes} bytes) still pins "${CANONICAL_PROJECT_ID}" and its ports; this runner never writes it`,
  )
  const distinct = assertNoCollision()
  pass(`no disposable identifier collides with a canonical one (ports ${distinct.ports.join(', ')})`)

  const running = runningContainers()
  const missing = CANONICAL_CONTAINERS.filter((name) => !running.has(name))
  if (missing.length > 0) {
    throw new SafeError(
      `${missing.length} canonical container(s) are not running: ${missing.join(', ')}. ` +
        'This runner reads the canonical database and never starts, stops or repairs it.',
    )
  }
  pass(`all ${CANONICAL_CONTAINERS.length} canonical containers are running and are left alone`)

  /* -----------------------------------------------------------------
   * 2 — the canonical reading, BEFORE anything is provisioned.
   * ---------------------------------------------------------------- */
  phase('Canonical census (before)')
  readings.canonicalBefore = readCanonical()
  assertCanonicalPristine(readings.canonicalBefore, 'before provisioning')
  pass(
    `checksum ${readings.canonicalBefore.checksum.sha256} over ${readings.canonicalBefore.checksum.rows} rows; census ${readings.canonicalBefore.census}`,
  )

  /* -----------------------------------------------------------------
   * 3 — provider posture (R-C2-4). Presence only; no value is read.
   * ---------------------------------------------------------------- */
  phase('Provider posture (R-C2-4)')
  const provider = providerPosture()
  info(`LLM_PROVIDER: ${provider.providerSeen} · LLM_MODEL: ${provider.modelSeen} · LLM_API_KEY present: ${provider.keyPresent}`)
  if (provider.providerMatches && provider.modelMatches && provider.keyPresent) {
    pass(
      `the already-ratified decision "${RATIFIED_LLM_PROVIDER}" / "${RATIFIED_LLM_MODEL}" is configured and a key is ` +
        'PRESENT (presence only — no value was read, printed, hashed or written); no provider or model was selected here',
    )
  } else {
    warn(
      'the ratified provider decision is not fully configured in this shell; G-6 cannot be decided and will be ' +
        'recorded NOT-RUN with the provider-not-configured reason, never PASS',
    )
  }

  /* -----------------------------------------------------------------
   * 4 — application-target posture.
   * ---------------------------------------------------------------- */
  phase('Application-target posture')
  const target = appTargetPosture()
  if (target.servable) {
    pass(`the disposable API port ${target.disposableApiPort} satisfies the application's committed local-target pin`)
  } else {
    warn(
      `BLOCKER: the disposable API port is ${target.disposableApiPort} and lib/supabase/public-config.ts accepts a ` +
        `loopback NEXT_PUBLIC_SUPABASE_URL only on port ${target.appPinnedPort}. The application therefore cannot be ` +
        'served against the disposable stack without an operator ruling. Every gate that needs the served ' +
        'application is recorded NOT-RUN with that reason — none is guessed, softened or worked around.',
    )
  }

  if (options.preflightOnly) {
    closeLedger(
      'not attempted: --preflight-only performs read-only checks, provisions nothing, prompts for nothing and ' +
        'decides no gate that requires a session or a governed write',
    )
    say('')
    say('Preflight only. Nothing was provisioned, nothing was prompted for, and no governed write occurred.')
    return
  }

  /* -----------------------------------------------------------------
   * 5 — G-20.
   * ---------------------------------------------------------------- */
  phase('G-20 — typecheck, lint, build')
  const g20 = runG20()
  gateFrom(
    'G-20',
    g20.typecheck.status === 0 && g20.lint.status === 0 && g20.build.status === 0,
    'tsc --noEmit, npm run lint and npm run build each exited 0 (output captured, never rendered)',
    `exit codes were tsc=${g20.typecheck.status}, lint=${g20.lint.status}, build=${g20.build.status}`,
  )
  if (g20.typecheck.status !== 0 || g20.lint.status !== 0 || g20.build.status !== 0) {
    throw new SafeError(
      'Typecheck, lint or build failed. Their output was captured and discarded by design — run the failing ' +
        'command yourself to see it. Nothing was provisioned.',
    )
  }

  /* -----------------------------------------------------------------
   * 6 — provision the disposable stack.
   * ---------------------------------------------------------------- */
  phase('Disposable stack')
  for (const port of DISPOSABLE_PUBLISHED_PORTS) {
    await assertPortFree(port, 'disposable stack')
    if (await portAnswers(port)) {
      throw new SafeError(`Port ${port} already answers a TCP connection. Refusing to provision on top of it.`)
    }
  }
  await assertPortFree(DISPOSABLE_APP_PORT, 'disposable application server')
  await assertPortFree(DISPOSABLE_DEBUG_PORT, 'disposable Chrome CDP')

  const cli = resolveLocalCli()
  acquired.cli = cli
  info(`CLI resolved as: ${cli.form}`)
  const { workdir, migrations } = createDisposableWorkdir()
  acquired.workdir = workdir
  pass(`${migrations.length} committed migrations copied into a temp workdir and verified byte-identical by SHA-256`)

  info('provisioning; CLI stdout and stderr are captured and DISCARDED because the CLI prints local keys')
  startDisposableStack(cli, workdir)
  acquired.stackStarted = true
  const census = readDisposableCensus()
  if (census.appliedMigrations !== EXPECTED_CANONICAL_MIGRATIONS) {
    throw new SafeError(
      `The disposable database applied ${census.appliedMigrations} migrations; ${EXPECTED_CANONICAL_MIGRATIONS} were expected.`,
    )
  }
  pass(
    `disposable stack up on API ${DISPOSABLE_API_PORT}; ${census.appliedMigrations} migrations applied; ` +
      `${census.publicFunctions} public functions, ${census.publicTables} tables, ${census.publicPolicies} policies`,
  )

  // Captured into process memory only. Never printed, written or serialized.
  const connection = captureDisposableStatus(cli, workdir)

  /* -----------------------------------------------------------------
   * 7 — passwords, then the SEPARATE synthetic identities and fixture.
   * ---------------------------------------------------------------- */
  phase('Disposable-stack passwords')
  info('entered on this terminal only; never stored, printed, logged, written or transmitted')
  info('these are NOT the canonical fixture passwords: the disposable identities are separate addresses')
  const secrets = await promptForPasswords()

  phase('Disposable synthetic identities and fixture')
  let signedIn = []
  const sessions = new Map()
  try {
    const admin = makeAdminClient(connection.apiUrl, connection.serviceRoleKey)
    await createDisposableIdentities(admin, secrets)
    pass(`${DISPOSABLE_IDENTITIES.length} SEPARATE synthetic Auth identities created on the disposable stack`)

    seedDisposableDomain()
    pass('the SAME committed synthetic domain fixture loaded verbatim, then re-pointed at the disposable addresses')

    phase('G-1 — real three-role authentication against the disposable stack')
    for (const identity of DISPOSABLE_IDENTITIES) {
      // The password is read out of the map, handed to exactly one call as a
      // parameter, and dropped from the map immediately.
      const session = await signIn(connection.apiUrl, connection.publishableKey, identity, secrets.get(identity.key))
      secrets.delete(identity.key)
      sessions.set(identity.key, session)
      signedIn.push(identity.key)
    }
  } finally {
    // Belt and braces: whatever happened above, no password survives it.
    secrets.clear()
  }

  gateFrom(
    'G-1',
    signedIn.length === DISPOSABLE_IDENTITIES.length,
    `all ${DISPOSABLE_IDENTITIES.length} SEPARATE disposable identities authenticated against the DISPOSABLE stack's ` +
      `own Auth service on port ${DISPOSABLE_API_PORT} with an operator-typed password, and each returned its expected ` +
      'deterministic id; no canonical identity was used and the canonical Auth service was never contacted',
    `authentication did not complete for ${DISPOSABLE_IDENTITIES.length - signedIn.length} identity/identities`,
  )

  /* -----------------------------------------------------------------
   * 8 — G-17 on the disposable stack, read-only through its own verifier.
   * ---------------------------------------------------------------- */
  phase('G-17 — audit chain on the disposable stack')
  const chainRows = psqlRows(
    DISPOSABLE_DB_CONTAINER,
    "SELECT centre_id::text, ok::text, events_checked::text FROM public.audit_verify_chain();",
  )
  const corrupt = chainRows.filter((row) => row[1] !== 't')
  gateFrom(
    'G-17',
    corrupt.length === 0,
    `public.audit_verify_chain() reported ok for ${chainRows.length} chain(s) on the disposable database ` +
      `(${chainRows.map((row) => row[2]).join('+') || '0'} event(s) checked)`,
    `chain(s) failing verification: ${corrupt.map((row) => row[0]).join(', ')}`,
  )

  /* -----------------------------------------------------------------
   * 9 — G-19. Positively asserted, not merely configured.
   * ---------------------------------------------------------------- */
  phase('G-19 — disposable target and fixture mode')
  const fixtureModeSetHere = FIXTURE_MODE_VARIABLE in process.env
  const apiPortIsDisposable = new URL(connection.apiUrl).port === String(DISPOSABLE_API_PORT)
  const authWasDisposable = signedIn.length === DISPOSABLE_IDENTITIES.length && apiPortIsDisposable
  // The walkthrough half of G-19 needs the served application, which is
  // blocked. G-19 therefore records what it POSITIVELY observed and stops
  // short of PASS rather than claiming the walkthrough half it did not run.
  gate(
    'G-19',
    'NOT-RUN',
    `positively observed: the three sessions were issued by the DISPOSABLE Auth service on port ` +
      `${DISPOSABLE_API_PORT} (not ${CANONICAL_API_PORT}), and ${FIXTURE_MODE_VARIABLE} is ` +
      `${fixtureModeSetHere ? 'SET in this shell and would be deleted from the child environment' : 'ABSENT from this shell'}; ` +
      `the remaining half — that the PRIMARY WALKTHROUGH ran with fixture mode off on served pages — ${APP_TARGET_BLOCKED}`,
  )
  if (!authWasDisposable) {
    warn('the sessions were not both disposable-issued and disposable-ported; G-19 could not observe its own premise')
  }

  /* -----------------------------------------------------------------
   * 10 — G-6, and the gates that need the served application.
   *
   * G-6 IS DESIGNED SO IT CANNOT PASS WITHOUT A REAL, VERIFIED PROVIDER
   * CALL. There is no branch below that can reach PASS: the only PASS
   * branch is the one guarded by the served application, and the served
   * application is unreachable here. Fixture text, an empty response, a
   * cached value and a silent fallback all land in the SAME NOT-RUN branch
   * as "the provider was never called", because none of them is evidence
   * that the ratified model produced the persisted words.
   * ---------------------------------------------------------------- */
  phase('G-6 and the served-application gates')
  const providerReason = provider.providerMatches && provider.modelMatches && provider.keyPresent
    ? `the ratified provider decision (${RATIFIED_LLM_PROVIDER} / ${RATIFIED_LLM_MODEL}) IS configured and a key is ` +
      'present, but no generation was requested through the application, so no real model output was observed and ' +
      'nothing was verified — this gate is NOT-RUN rather than PASS because a configured provider is not a called one'
    : 'PROVIDER NOT CONFIGURED: LLM_PROVIDER / LLM_MODEL / LLM_API_KEY do not all carry the ratified, present values, ' +
      'so no real provider call could even be attempted'
  gate('G-6', 'NOT-RUN', `${providerReason}; additionally, ${APP_TARGET_BLOCKED}`)

  for (const id of ['G-2', 'G-3', 'G-4', 'G-5', 'G-7', 'G-8', 'G-9', 'G-10', 'G-11', 'G-12', 'G-13', 'G-14', 'G-15', 'G-16', 'G-21']) {
    gate(id, 'NOT-RUN', APP_TARGET_BLOCKED)
  }

  say('')
  say('The disposable environment is fully provisioned, seeded and authenticated. The lifecycle gates above are')
  say('recorded NOT-RUN with a single, precise, operator-actionable reason. None of them is guessed.')
}

// ---------------------------------------------------------------------
// Signals and exit.
// ---------------------------------------------------------------------

let interrupted = false
const onSignal = () => {
  if (interrupted) return
  interrupted = true
  process.stdout.write('\nAborting. Removing the disposable stack, then verifying and writing the ledger.\n')
  process.exitCode = 130
  try {
    // A signal during a hidden prompt must not leave echo disabled.
    if (process.stdin.isTTY && typeof process.stdin.setRawMode === 'function') process.stdin.setRawMode(false)
  } catch {
    // Restoring the terminal must never mask the abort.
  }
  const hardStop = setTimeout(() => process.exit(130), 300_000)
  if (typeof hardStop.unref === 'function') hardStop.unref()
  void (async () => {
    try {
      await teardown()
    } catch {
      // Teardown must never mask the abort, and never surfaces captured output.
    }
    try {
      await finish()
    } catch {
      // Neither must the ledger.
    }
    process.exit(130)
  })()
}
process.on('SIGINT', onSignal)
process.on('SIGTERM', onSignal)

main()
  .catch((error) => {
    const message = error instanceof SafeError ? error.message : 'The disposable F17 runner failed.'
    process.stderr.write(`\nFAILED: ${message}\n`)
    process.exitCode = 1
  })
  .then(async () => {
    try {
      await teardown()
    } catch {
      // Never surfaces captured output.
    }
    await finish()
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
