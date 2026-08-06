#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach — the AUTONOMOUS APP-SERVED disposable proof (R-C2-5)
// =====================================================================
// Run: node scripts/physical-test/prove-disposable-app.mjs
//      npm run physical-test:f17-app
//
// WHAT THIS IS, AND WHAT IT IS NOT.
//
// It is the autonomous sibling of `prove-disposable-isolation.mjs`. It
// provisions the disposable Supabase stack, SERVES THE APPLICATION against
// it with the `f17-disposable` runtime profile set in the CHILD PROCESS
// ENVIRONMENT ONLY, drives headless Chrome over CDP, proves the LIVE screen
// 07 -> 08 transition through the REAL report identifier the server
// returned, tears everything down, and re-reads the canonical database to
// prove it never moved.
//
// It is NOT the operator walkthrough. `run-f17-disposable.mjs` keeps its
// TTY-only, no-echo, operator-typed password prompts EXACTLY as they are
// and is byte-untouched by this file. `run-f17.mjs` is byte-untouched by
// everything in Round C2.
//
// ---------------------------------------------------------------------
// AUTHENTICATION — MINTED SESSIONS, AND NO PASSWORD ANYWHERE
// ---------------------------------------------------------------------
// This proof has no terminal, so it cannot use the operator prompt; and the
// standing Run C2 credential rule forbids any environment-variable,
// CLI-argument, file, default or GENERATED password path. Both hold at once
// here because THIS PROOF CREATES NO PASSWORD AT ALL:
//
//  * the three disposable Auth identities are created through the DISPOSABLE
//    stack's own Auth Admin API WITHOUT a `password` field — they are
//    passwordless users, and there is no `password` key anywhere in this
//    file;
//  * a session is MINTED admin-side (`admin.auth.admin.generateLink` ->
//    `verifyOtp` on a cookie-writing `@supabase/ssr` client), so the browser
//    receives ordinary session cookies produced by the exact library the
//    application reads them with.
//
// That is strictly stronger than a generated password, because no password
// exists to be generated, stored, typed, transmitted or leaked.
//
// IT CANNOT TARGET THE CANONICAL STACK. `assertDisposableApiTarget()` runs
// BEFORE any admin client is constructed and before any mint, and refuses
// anything that is not loopback on the disposable API port. Every admin and
// mint call in this file is downstream of that assertion.
//
// G-1 IS NOT CLAIMED HERE. An admin mint is not a password sign-in. This
// path proves the served application accepts a REAL Supabase session and
// derives authority from it server-side; it proves NOTHING about password
// authentication, so G-1 stays owned by the interactive operator runs and is
// recorded NOT-RUN below with exactly that reason.
//
// NOTHING SECRET IS EVER SURFACED. No session token, service key, cookie
// value, Authorization header, magic link or hashed token is printed,
// logged, written to any evidence artefact, or interpolated into any message
// or error — including the failure messages, which are authored here and
// name only a ROLE or a ROUTE.
//
// ---------------------------------------------------------------------
// GATE HONESTY
// ---------------------------------------------------------------------
// A gate reaches PASS only from POSITIVE evidence actually observed.
// "Measured zero" and "not measured" are different states and only the first
// can satisfy a gate; `null` never satisfies anything. Every gate is stamped
// NOT-RUN with an authored reason if the run ends before deciding it, so a
// gate that is never reached can never end up PASS. G-6 is NOT-RUN by
// construction: this proof activates no AI provider (R-C2-5 step 7) and
// contains no code path that could decide G-6 at all.
//
// TEARDOWN RUNS ON EVERY EXIT PATH — success, failure, Ctrl+C and an
// unexpected exception.
// =====================================================================

import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import { join, resolve } from 'node:path'

import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'

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
  isPortFree,
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
  waitForPortReleased,
  waitForPortSilent,
  warn,
} from './disposable-stack.mjs'

// ---------------------------------------------------------------------
// Fixed literals. Every one is a COMMITTED, non-secret fixture value or a
// route authored in this repository.
// ---------------------------------------------------------------------

/** The Supabase runtime profile this proof sets — in a CHILD environment only. */
const RUNTIME_PROFILE_VARIABLE = 'BEST_COACH_SUPABASE_RUNTIME_PROFILE'
const DISPOSABLE_RUNTIME_PROFILE = 'f17-disposable'

const REAL_ADAPTER_KIND = 'real_participant_adapter'

/**
 * The non-credential literal every AI provider selector is overwritten with in
 * the served child environment. It matches no ratified selector, so
 * `getServerConfig()` refuses before any provider is constructed.
 */
const PROVIDER_DISABLED_LITERAL = 'disabled-by-the-f17-disposable-app-proof'

/** The committed fixture's seeded, eligible (class session, student) pair. */
const FIXTURE_SESSION = 'c5000000-0000-4000-8000-000000000001'
const FIXTURE_STUDENT = 'c2000000-0000-4000-8000-000000000001'
/** A student/session pair that exists nowhere — G-14's non-existence probe. */
const OPAQUE_STUDENT = '00000000-0000-4000-8000-0000000000a1'
const OPAQUE_SESSION = '00000000-0000-4000-8000-0000000000a2'

const ASSESS_ROUTE = `/trainer/sessions/${FIXTURE_SESSION}/students/${FIXTURE_STUDENT}/assess`
const PORTAL_PREFIXES = ['/trainer', '/management', '/parent']

/**
 * Words that appear only in the deterministic fixture runtime. Their absence
 * from every served surface is half of this proof's fixture-mode evidence;
 * the other half is the adapter kind read from the served DOM.
 */
const FIXTURE_MARKERS = ['deterministic_fixture', 'Fixture data', 'fixture mode']

/** The marker prose this run types into screen 07 and reads back out of the database. */
const OBSERVATION_MARKER = `F17 disposable app proof — observation notes, run ${process.pid}`
const FOLLOW_UP_MARKER = `F17 disposable app proof — follow-up, run ${process.pid}`

const CDP_TIMEOUT_MS = 20_000
const NAVIGATION_TIMEOUT_MS = 30_000
const CONSOLE_LIVENESS_TIMEOUT_MS = 5_000
const MINIMUM_DOCUMENT_BYTES = 200
const CONSOLE_LIVENESS_TOKEN = 'best-coach-f17-disposable-app-console-liveness-probe'
const DEFAULT_CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

/** A v4 UUID, canonically formatted. Nothing else is accepted as a report id. */
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
/** The 08 route this proof requires the browser to reach, with its id captured. */
const GENERATE_ROUTE = /^\/trainer\/reports\/([0-9a-f-]{36})\/generate$/i

// =====================================================================
// LEDGERS
//
// TWO of them, deliberately. The `A-*` ledger is this proof's OWN
// environment and lifecycle evidence. The `G-*` ledger is the acceptance
// gates, and it is kept separate so that no environment check can ever be
// mistaken for an acceptance verdict. Both fail closed.
// =====================================================================

const CHECK_TITLES = new Map([
  ['A-1', 'Canonical config.toml unmodified; no linked project reference exists'],
  ['A-2', 'No disposable identifier collides with a canonical identifier'],
  ['A-3', 'The canonical stack is running and pristine BEFORE anything is provisioned'],
  ['A-4', 'No disposable container, volume, port or process exists before provisioning'],
  ['A-5', 'The disposable workdir replays the ten committed migrations byte-identically, outside the repository'],
  ['A-6', 'The disposable stack started and applied all ten committed migrations'],
  ['A-7', 'The disposable API URL is loopback on the disposable port and is NOT the canonical API'],
  ['A-8', 'Three PASSWORDLESS synthetic Auth identities were created on the disposable stack'],
  ['A-9', 'The committed fixture loaded verbatim and the three accounts were re-pointed, read back'],
  ['A-10', 'The application is served on the disposable app port with the disposable runtime profile in the CHILD environment only'],
  ['A-11', 'Fixture mode is explicitly OFF in the served child environment and the served DOM reports the REAL adapter'],
  ['A-12', 'Sessions were ADMIN-MINTED against the disposable stack with no password created, stored, typed or used'],
  ['A-13', 'The served application is really bound to the DISPOSABLE stack, proven by data only that stack holds'],
  ['A-14', 'LIVE screen 07 -> 08: the browser navigated to the REAL report id the server returned'],
  ['A-15', 'The client did not fabricate the id: no report existed for the pair before the save, and the id is the one the DISPOSABLE database holds'],
  ['A-16', 'Every origin the served application requested is loopback'],
  ['A-17', 'The canonical fixture database is UNCHANGED while the disposable stack is up and the application is served'],
  ['A-18', 'Teardown removed every disposable container, volume, port, process and the workdir'],
  ['A-19', 'The canonical fixture database is byte-identical AFTER teardown (independent re-read)'],
  ['A-20', 'The canonical stack is STILL running after teardown'],
  ['A-21', 'The build artefact was rebuilt for the disposable target and RESTORED to the repository default at teardown'],
  ['A-22', 'No client bundle references any Supabase target, so the profile decision is server-side in fact as well as by design'],
])

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
  ['G-13', 'Parent sees only the submitted canonical report'],
  ['G-14', 'Parent isolation and non-disclosing denial'],
  ['G-15', 'Management cannot access preapproval draft content'],
  ['G-16', 'Final submission produces exactly two ordered state-change audit events'],
  ['G-17', 'No audit-chain corruption'],
  ['G-18', 'Canonical verifier database remains pristine'],
  ['G-19', 'Concurrency proofs on the disposable database AND fixture mode unused for the primary walkthrough'],
  ['G-20', 'Typecheck, lint and build pass'],
  ['G-21', 'Browser console has no uncaught errors'],
  ['H-1', 'Process hygiene — this run leaves no server, no browser and no held port behind'],
])

const checks = new Map()
const gates = new Map()

function record(store, titles, kind, id, verdict, reason) {
  if (!titles.has(id)) throw new SafeError(`Unknown ${kind} id: ${id}`)
  if (store.has(id)) throw new SafeError(`${kind} ${id} was decided twice.`)
  if (!['PASS', 'FAIL', 'NOT-RUN'].includes(verdict)) {
    throw new SafeError(`${kind} ${id} was given an unsupported verdict.`)
  }
  store.set(id, { verdict, reason })
  if (verdict === 'PASS') pass(`${id} ${reason}`)
  else warn(`${id} ${verdict} — ${reason}`)
}

const check = (id, verdict, reason) => record(checks, CHECK_TITLES, 'check', id, verdict, reason)
const gate = (id, verdict, reason) => record(gates, GATE_TITLES, 'gate', id, verdict, reason)

const checkFrom = (id, ok, passReason, failReason) =>
  check(id, ok ? 'PASS' : 'FAIL', ok ? passReason : failReason)
const gateFrom = (id, ok, passReason, failReason) =>
  gate(id, ok ? 'PASS' : 'FAIL', ok ? passReason : failReason)

/** Nothing is ever defaulted to PASS. */
function closeLedgers(reason) {
  for (const id of CHECK_TITLES.keys()) if (!checks.has(id)) checks.set(id, { verdict: 'NOT-RUN', reason })
  for (const id of GATE_TITLES.keys()) if (!gates.has(id)) gates.set(id, { verdict: 'NOT-RUN', reason })
}

/** The standing reason for every lifecycle gate this proof deliberately does not drive. */
const BEYOND_SCOPE =
  'this proof drives the screen 07 -> 08 transition only; the AI draft, trainer approval, management review, ' +
  'return, reapproval and submission legs are NOT driven here, so nothing was observed that could decide this gate'

// ---------------------------------------------------------------------
// Arguments. There is deliberately NO argument that carries, names or
// points at a credential, and an unknown argument aborts before anything.
// ---------------------------------------------------------------------

const HELP = `
B.E.S.T Coach — autonomous APP-SERVED disposable proof (R-C2-5)

  node scripts/physical-test/prove-disposable-app.mjs
  node scripts/physical-test/prove-disposable-app.mjs --help

WHAT IT DOES
  Provisions the disposable Supabase stack "${DISPOSABLE_PROJECT_ID}", serves the
  application against it on port ${DISPOSABLE_APP_PORT} with the "${DISPOSABLE_RUNTIME_PROFILE}" runtime
  profile set in the CHILD PROCESS ENVIRONMENT only, drives headless Chrome on
  CDP port ${DISPOSABLE_DEBUG_PORT}, proves the LIVE screen 07 -> 08 transition through the
  REAL report id the server returned, tears everything down, and re-reads the
  canonical database to prove it never moved.

AUTHENTICATION
  Sessions are ADMIN-MINTED against the disposable stack's own Auth Admin API.
  NO PASSWORD IS CREATED, STORED, TYPED OR USED ANYWHERE. G-1 is therefore NOT
  claimed here: an admin mint is not a password sign-in.

WHAT IT WILL NEVER DO
  * Prompt for, accept, read, print or persist any credential.
  * Mint anything against a target that is not the disposable loopback API.
  * Modify supabase/config.toml, any committed migration, or any canonical
    container, database, volume or port.
  * Call "supabase stop --all", which would stop the canonical stack.
  * Activate an AI provider. G-6 stays NOT-RUN.

OPTIONS
  --help  print this and exit 0.
`

function parseArgs(argv) {
  let help = false
  for (const arg of argv.slice(2)) {
    if (arg === '--help' || arg === '-h') help = true
    // The argument is NOT echoed back: an operator who mistyped a secret onto
    // the command line must not see it repeated to the terminal.
    else {
      throw new SafeError(
        'Unsupported argument. This proof accepts only --help. It takes no credential of any kind, from any ' +
          'source, and there is no argument that supplies one.',
      )
    }
  }
  return { help }
}

// ---------------------------------------------------------------------
// THE STRUCTURAL REFUSAL. Everything that could reach an Auth service goes
// through this first. It is not a comment and not a convention: it is the
// only constructor of any admin or session client in this file.
// ---------------------------------------------------------------------

function assertDisposableApiTarget(apiUrl, what) {
  let url
  try {
    url = new URL(apiUrl)
  } catch {
    throw new SafeError(`The API target for ${what} could not be parsed. Nothing was attempted.`)
  }
  const host = url.hostname.replace(/^\[/, '').replace(/\]$/, '')
  if (!['127.0.0.1', 'localhost', '::1'].includes(host)) {
    throw new SafeError(`The API target for ${what} is not a loopback address. Refusing outright.`)
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new SafeError(`The API target for ${what} does not use http(s). Refusing outright.`)
  }
  if (Number(url.port) === CANONICAL_API_PORT) {
    throw new SafeError(
      `The API target for ${what} is the CANONICAL API port ${CANONICAL_API_PORT}. This proof mints nothing ` +
        'against the canonical stack, ever. Refusing outright.',
    )
  }
  if (Number(url.port) !== DISPOSABLE_API_PORT) {
    throw new SafeError(
      `The API target for ${what} is not the disposable API port ${DISPOSABLE_API_PORT}. Refusing outright.`,
    )
  }
  return url.origin
}

/**
 * Read a PostgreSQL boolean out of a `psql` field.
 *
 * `--no-align --tuples-only` renders a bare boolean as `t`/`f`, but an
 * EXPLICIT `::text` cast renders it as `true`/`false`. Both spellings occur
 * in the queries below, and a reader that accepted only one of them would
 * silently treat every `true` as false — an absence of evidence dressed as
 * evidence of absence. Anything that is neither spelling returns `null`, so
 * an unreadable field can never be mistaken for a measured `false`.
 */
function readBoolean(field) {
  if (field === 't' || field === 'true') return true
  if (field === 'f' || field === 'false') return false
  return null
}

/** The ONLY admin-client constructor. It cannot be reached without the refusal above. */
function makeAdminClient(apiUrl, serviceRoleKey, what) {
  assertDisposableApiTarget(apiUrl, what)
  return createClient(apiUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  })
}

// ---------------------------------------------------------------------
// Disposable seeding: three PASSWORDLESS synthetic identities, then the
// SAME committed synthetic domain fixture.
// ---------------------------------------------------------------------

/**
 * Create the three disposable Auth identities WITHOUT a password.
 *
 * There is no `password` key in this call and no password anywhere in this
 * file. A passwordless user cannot be signed into with a password by anyone,
 * including this process, which is exactly the property that makes the
 * admin-mint path stronger than a generated password would have been.
 *
 * The UUIDs are the committed fixture's own structural literals — a UUID is a
 * public, committed, non-secret join key that `scripts/fixtures/local_fixtures.sql`
 * writes into `accounts.auth_user_id` and then asserts. The EMAILS are
 * disposable-only `.example.test` addresses.
 */
async function createPasswordlessIdentities(admin) {
  const created = []
  for (const identity of DISPOSABLE_IDENTITIES) {
    const { data, error } = await admin.auth.admin.createUser({
      id: identity.authId,
      email: identity.email,
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
 * Load the SAME committed fixture verbatim into the DISPOSABLE database, then
 * point the three account rows at the disposable addresses and READ THE
 * RESULT BACK. A re-point that silently matched no row stops the run; the
 * failure messages name a ROLE only and never echo a value read back.
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

  const readBack = new Map(
    psqlRows(
      DISPOSABLE_DB_CONTAINER,
      'SELECT a.id::text, a.normalized_email, (u.id IS NOT NULL)::text ' +
        'FROM public.accounts a LEFT JOIN auth.users u ON u.id = a.auth_user_id;',
    )
      .filter((row) => row.length === 3)
      .map((row) => [row[0], { email: row[1], linkedToAuth: readBoolean(row[2]) }]),
  )
  const repointed = []
  for (const identity of DISPOSABLE_IDENTITIES) {
    const row = readBack.get(identity.accountId)
    if (row === undefined) {
      throw new SafeError(`The ${identity.label} disposable account row was not found after the fixture load.`)
    }
    if (row.email !== identity.email) {
      throw new SafeError(
        `The ${identity.label} disposable account row does not carry its disposable address after the re-point. ` +
          'The stored value is deliberately not reported.',
      )
    }
    if (row.linkedToAuth !== true) {
      throw new SafeError(`The ${identity.label} disposable account row is not linked to a disposable Auth user.`)
    }
    repointed.push(identity.key)
  }
  return { repointed: repointed.length }
}

// ---------------------------------------------------------------------
// THE MINT. No password. No token, link or hash ever leaves this function
// except as opaque cookie name/value pairs handed straight to the browser.
// ---------------------------------------------------------------------

/**
 * Mint a real session for one disposable identity and return the session
 * COOKIES that `@supabase/ssr` itself produced — so their names, chunking and
 * encoding are the library's, not this file's reconstruction.
 *
 * Sequence: `admin.auth.admin.generateLink()` produces a one-time hashed
 * token for an address that exists on the DISPOSABLE stack; `verifyOtp()`
 * exchanges it for a session on a cookie-writing server client. No password
 * is involved at any step, and the hashed token is consumed here, held only
 * as a local, and never printed, written, returned or placed in an error.
 */
async function mintSessionCookies(connection, identity) {
  assertDisposableApiTarget(connection.apiUrl, `the ${identity.label} session mint`)
  const admin = makeAdminClient(connection.apiUrl, connection.serviceRoleKey, `the ${identity.label} session mint`)

  const link = await admin.auth.admin.generateLink({ type: 'magiclink', email: identity.email })
  if (link.error) {
    throw new SafeError(`A session could not be minted for the ${identity.label} disposable identity.`)
  }
  const hashedToken = link.data?.properties?.hashed_token
  if (typeof hashedToken !== 'string' || hashedToken.length === 0) {
    throw new SafeError(`The disposable Auth service produced no one-time token for the ${identity.label} identity.`)
  }

  const jar = new Map()
  const client = createServerClient(connection.apiUrl, connection.publishableKey, {
    cookies: {
      getAll: () => [...jar.entries()].map(([name, value]) => ({ name, value })),
      setAll: (list) => {
        for (const cookie of list) jar.set(cookie.name, cookie.value)
      },
    },
  })

  let verified = null
  for (const type of ['email', 'magiclink']) {
    const attempt = await client.auth.verifyOtp({ type, token_hash: hashedToken })
    if (!attempt.error && attempt.data?.user?.id) {
      verified = attempt.data
      break
    }
  }
  if (verified === null) {
    throw new SafeError(`The minted one-time token was not accepted for the ${identity.label} disposable identity.`)
  }
  if (verified.user?.id !== identity.authId) {
    throw new SafeError(
      `The disposable Auth service returned a different id than the fixture literal for the ${identity.label} identity.`,
    )
  }

  const cookies = [...jar.entries()].map(([name, value]) => ({ name, value }))
  if (cookies.length === 0) {
    throw new SafeError(`No session cookie was produced for the ${identity.label} disposable identity.`)
  }
  return cookies
}

// ---------------------------------------------------------------------
// Owned processes: this run's server and this run's browser. Both stopped
// on EVERY exit path, including abort and Ctrl+C.
// ---------------------------------------------------------------------

const owned = { server: null, chrome: null, serverPid: null, chromePid: null }

function killOwned(child) {
  if (!child) return
  try {
    if (child.exitCode === null && child.signalCode === null) {
      if (process.platform === 'win32') {
        // A `next start` parent spawns a worker; /T takes the tree with it.
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

/**
 * Start THIS run's production server against the DISPOSABLE stack.
 *
 * The disposable runtime profile, the disposable URL and the disposable keys
 * are placed in the CHILD PROCESS ENVIRONMENT and nowhere else. They are not
 * written to a file, not exported into this process, not passed as arguments
 * and not printed. The fixture-mode variable is explicitly DELETED and its
 * removal is verified, so fixture mode is off by construction as well as by
 * the served-DOM assertion that follows.
 *
 * `next start` loads the application's own `.env.local` for keys that are NOT
 * already present in the child environment (@next/env only fills gaps, never
 * overrides). Every Supabase-target key IS present here, so `.env.local`
 * cannot reach the served process for any of them — and this file reads
 * `.env.local` nowhere.
 */
/**
 * The child environment for every disposable Next.js invocation — the build
 * and the server alike.
 *
 * The disposable runtime profile, the disposable URL and the disposable keys
 * live HERE and nowhere else: not in a file, not exported into this process,
 * not passed as arguments and not printed. The fixture-mode variable is
 * explicitly DELETED and its removal verified, so fixture mode is off by
 * construction as well as by the served-DOM assertion.
 *
 * `next` loads the application's own `.env.local` for keys that are NOT
 * already present in the child environment (`@next/env` only fills gaps and
 * never overrides). Every Supabase-target key IS present here, so `.env.local`
 * cannot reach either child for any of them — and this file reads `.env.local`
 * nowhere.
 */
function disposableChildEnv(connection) {
  const childEnv = { ...process.env }
  delete childEnv[FIXTURE_MODE_VARIABLE]
  if (FIXTURE_MODE_VARIABLE in childEnv) {
    throw new SafeError('The fixture-mode variable could not be removed from the child environment.')
  }
  childEnv[RUNTIME_PROFILE_VARIABLE] = DISPOSABLE_RUNTIME_PROFILE
  childEnv.NEXT_PUBLIC_SUPABASE_URL = connection.apiUrl
  childEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = connection.publishableKey
  childEnv.SUPABASE_SECRET_KEY = connection.secretKey

  /*
   * R-C2-5 STEP 7, ENFORCED STRUCTURALLY RATHER THAN BY INTENTION.
   *
   * Screen 08 requests an AI draft AS SOON AS IT MOUNTS, and
   * `server/modules/report-workflow/actions.ts` constructs the REAL
   * `OpenAiDraftProvider` from `getServerConfig()` on that path — which reads
   * these three variables and would otherwise pick them up out of the
   * application's own `.env.local`. Landing on screen 08 is the whole point of
   * this proof, so the provider must be made UNREACHABLE rather than merely
   * not asked for.
   *
   * All three ratified selectors are therefore OVERWRITTEN in the served
   * child environment with one non-credential literal authored in this file.
   * They are OVERWRITTEN and not DELETED, and that distinction was MEASURED:
   * `@next/env` fills any key the child environment does not already carry
   * from `.env.local`, so a deleted selector is silently restored from the
   * application's own file and the real provider becomes reachable again —
   * which is exactly what happened on an earlier run of this proof, whose
   * report reached `drafting`. Overwriting closes that gap and additionally
   * means the operator's real `LLM_API_KEY` never enters the served process
   * at all. Its VALUE is never read, assigned, printed or hashed here.
   *
   * `getServerConfig()` then fails E_SRV_LLM_PROVIDER — the provider check
   * precedes the key check — before any provider object exists,
   * `requestDraft` returns its designed `generation_failure` outcome, and NO
   * NETWORK CALL TO ANY AI PROVIDER IS POSSIBLE from this run.
   *
   * This is also why G-6 is NOT-RUN by construction: there is no code path in
   * the served process that could reach a provider at all.
   */
  for (const selector of ['LLM_PROVIDER', 'LLM_MODEL', 'LLM_API_KEY']) {
    childEnv[selector] = PROVIDER_DISABLED_LITERAL
    if (childEnv[selector] !== PROVIDER_DISABLED_LITERAL) {
      throw new SafeError(
        'An AI provider selector could not be neutralised in the served child environment. Refusing to serve: this ' +
          'run must be structurally incapable of activating a real provider.',
      )
    }
  }
  return childEnv
}

/**
 * The environment a RESTORING build runs in: this process's own environment
 * with the profile variable removed. This process never set the disposable
 * values on itself, so removing the profile is all that is required for the
 * restored build to be the ordinary repository build again.
 */
function restoreChildEnv() {
  const childEnv = { ...process.env }
  delete childEnv[RUNTIME_PROFILE_VARIABLE]
  return childEnv
}

function nextBinary() {
  const nextBin = join(REPO_ROOT, 'node_modules', 'next', 'dist', 'bin', 'next')
  if (!existsSync(nextBin)) throw new SafeError('The project-local Next.js binary could not be resolved.')
  return nextBin
}

/**
 * WHY A SECOND BUILD IS NECESSARY, AND WHY IT IS THEN UNDONE.
 *
 * `NEXT_PUBLIC_*` values are INLINED AT BUILD TIME into the server bundles,
 * including the `proxy.ts` chunk that runs on every request. This was
 * MEASURED, not assumed: serving the repository's ordinary build against the
 * disposable stack answered 500 on every request with the authored code
 * `E_PUB_PROFILE_TARGET_NOT_LOCAL`, because the proxy chunk still carried the
 * build-time target rather than the child environment's. A runtime override
 * therefore cannot reach it, and the disposable target must be built in.
 *
 * The repository's `.next` directory is a build artefact and is not tracked by
 * Git, but leaving it pointing at a stack that no longer exists would be
 * residue. Teardown therefore REBUILDS it with the ordinary environment on
 * every exit path, and A-21 records whether both builds actually succeeded.
 */
function buildForDisposableTarget(connection) {
  return runCapturedExitCode(process.execPath, [nextBinary(), 'build'], {
    cwd: REPO_ROOT,
    env: disposableChildEnv(connection),
    timeout: 20 * 60 * 1000,
  })
}

function restoreRepositoryBuild() {
  return runCapturedExitCode(process.execPath, [nextBinary(), 'build'], {
    cwd: REPO_ROOT,
    env: restoreChildEnv(),
    timeout: 20 * 60 * 1000,
  })
}

async function startServer(connection, port) {
  const nextBin = nextBinary()
  const childEnv = disposableChildEnv(connection)

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
  const profileDirectory = join(os.tmpdir(), `best-coach-f17-disposable-chrome-${process.pid}`)
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
  // Recorded THE MOMENT it is created, so a failure or a Ctrl+C at any later
  // point can still name the directory that has to be removed.
  acquired.chromeProfile = profileDirectory
  return { child, profileDirectory }
}

// ---------------------------------------------------------------------
// CDP client. Frames are SERIALIZED here and NEVER rendered. No password
// passes through this transport, because no password exists; only the
// minted session cookies are installed into the browser.
//
// This is a deliberate copy of `run-f17.mjs`'s client rather than a shared
// import, for the same Option-A/Option-B reason `disposable-stack.mjs`
// records for `SafeError`: `run-f17.mjs` must remain BYTE-UNTOUCHED, and
// exporting from it would change it.
// ---------------------------------------------------------------------

function createCdpClient(socket, consoleErrors, timeoutMs = CDP_TIMEOUT_MS) {
  let messageId = 0
  let closedReason = null
  const pending = new Map()
  const waiters = new Set()

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
      return
    }

    if (message.id && pending.has(message.id)) {
      const entry = pending.get(message.id)
      pending.delete(message.id)
      clearTimeout(entry.timer)
      // FAIL CLOSED. A CDP error must never be handed on as a result. Only
      // the method name (a literal authored here) and the numeric code are
      // surfaced; the error text is not, because it can quote page content.
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
// Teardown state and hygiene, on EVERY exit path.
// ---------------------------------------------------------------------

const acquired = {
  cli: null,
  workdir: null,
  startAttempted: false,
  stackStarted: false,
  appPort: null,
  debugPort: null,
  socket: null,
  chromeProfile: null,
  buildReplaced: false,
  buildRestored: null,
  disposableBuildStatus: null,
}
const readings = { canonicalBefore: null, canonicalAfter: null }
/**
 * H-1's subjects. `null` until an instrument really returns a value:
 * "measured zero" and "not measured" are different states, and only the
 * first can satisfy the gate.
 */
const hygiene = { serverGone: null, chromeGone: null, appPortFree: null, debugPortFree: null }

let teardownPromise = null
function teardown() {
  if (teardownPromise === null) teardownPromise = runTeardown()
  return teardownPromise
}

async function runTeardown() {
  if (
    !acquired.stackStarted &&
    !acquired.startAttempted &&
    acquired.workdir === null &&
    owned.server === null &&
    acquired.chromeProfile === null
  ) {
    return
  }

  phase('Teardown — this run\'s server, this run\'s browser and the disposable stack only')

  try {
    acquired.socket?.close()
  } catch {
    // The socket may already be gone.
  }
  killOwned(owned.chrome)
  killOwned(owned.server)
  await new Promise((r) => setTimeout(r, 1_500))

  hygiene.serverGone = !processAlive(owned.serverPid)
  hygiene.chromeGone = !processAlive(owned.chromePid)
  if (acquired.appPort !== null) hygiene.appPortFree = await waitForPortReleased(acquired.appPort, 20_000)
  if (acquired.debugPort !== null) hygiene.debugPortFree = await waitForPortReleased(acquired.debugPort, 20_000)
  owned.chrome = null
  owned.server = null

  let containers = null
  let volumes = null
  let ports = null

  if (acquired.cli !== null && (acquired.stackStarted || acquired.startAttempted)) {
    // Targeted at the DISPOSABLE project id. `--all` is never used: it would
    // stop the canonical stack. Issued whether the start succeeded or failed.
    const status = stopDisposableStack(acquired.cli, acquired.workdir)
    info(`supabase stop --project-id ${DISPOSABLE_PROJECT_ID} --no-backup exit ${status}`)
    containers = disposableContainersPresent()
    volumes = disposableVolumesPresent()
    ports = []
    for (const port of DISPOSABLE_PUBLISHED_PORTS) {
      const silent = await waitForPortSilent(port)
      ports.push({ port, silent, bindable: await waitForPortReleased(port, 5_000) })
    }
  } else {
    info('provisioning was never attempted, so there is no disposable stack to stop')
  }

  const workdirRemoved = destroyDisposableWorkdir()

  // The throwaway Chrome profile is a disposable resource this run created, so
  // this run removes it. `null` means it was never created; `false` means an
  // attempt was made and the directory survived — the two are not the same and
  // are not reported as if they were.
  let chromeProfileRemoved = null
  if (acquired.chromeProfile !== null) {
    try {
      rmSync(acquired.chromeProfile, { recursive: true, force: true })
    } catch {
      // Recorded below from the filesystem, never from the absence of a throw.
    }
    chromeProfileRemoved = !existsSync(acquired.chromeProfile)
  }

  // Restore the repository's build artefact. This runs on EVERY exit path,
  // because a build left pointing at a stack that no longer exists is residue.
  if (acquired.buildReplaced) {
    const restored = restoreRepositoryBuild()
    acquired.buildRestored = restored.status === 0
    info(`next build (restoring the repository default target) exit ${restored.status}`)
  }
  if (!checks.has('A-21')) {
    if (!acquired.buildReplaced) {
      check(
        'A-21',
        'NOT-RUN',
        'no disposable build was produced, so the repository build artefact was never replaced and there was ' +
          'nothing to restore',
      )
    } else {
      checkFrom(
        'A-21',
        acquired.disposableBuildStatus === 0 && acquired.buildRestored === true,
        'NEXT_PUBLIC_* values are inlined at BUILD time into the server bundles — measured, not assumed: serving ' +
          'the ordinary build against the disposable stack answers 500 with E_PUB_PROFILE_TARGET_NOT_LOCAL — so ' +
          'the disposable target was BUILT IN with the profile and the disposable URL in the child environment ' +
          'only, and teardown then rebuilt the repository artefact with the ordinary environment so no build ' +
          'pointing at a removed stack is left behind',
        `the disposable build exited ${acquired.disposableBuildStatus} and the restoring build ` +
          `${acquired.buildRestored === null ? 'was not run' : acquired.buildRestored ? 'succeeded' : 'FAILED'}`,
      )
    }
  }

  if (!checks.has('A-18')) {
    if (containers === null || volumes === null || ports === null) {
      check(
        'A-18',
        'NOT-RUN',
        'the disposable stack was never provisioned, so there was nothing to remove and nothing was measured',
      )
    } else {
      const heldPorts = ports.filter((entry) => !entry.silent || !entry.bindable)
      const ok =
        containers.length === 0 && volumes.length === 0 && heldPorts.length === 0 && workdirRemoved &&
        !existsSync(acquired.workdir ?? '') && chromeProfileRemoved !== false
      checkFrom(
        'A-18',
        ok,
        `docker ps -a lists 0 containers ending "_${DISPOSABLE_PROJECT_ID}", docker volume ls lists 0 volumes naming ` +
          `it, ports ${DISPOSABLE_PUBLISHED_PORTS.join(', ')} each REFUSE a TCP connection AND are each re-bindable ` +
          '(two independent instruments agreeing), and both temporary directories outside the repository — the ' +
          `disposable workdir and this run's throwaway Chrome profile — were deleted (Chrome profile: ` +
          `${chromeProfileRemoved === null ? 'never created' : 'removed'})`,
        `containers: ${containers.join(', ') || 'none'}; volumes: ${volumes.join(', ') || 'none'}; held ports: ` +
          `${heldPorts.map((entry) => entry.port).join(', ') || 'none'}; workdir removed: ${workdirRemoved}; ` +
          `Chrome profile removed: ${chromeProfileRemoved === null ? 'never created' : chromeProfileRemoved}`,
      )
    }
  }

  if (!gates.has('H-1')) {
    const measured = Object.values(hygiene).filter((value) => value !== null).length
    if (measured < 4) {
      gate(
        'H-1',
        'FAIL',
        `only ${measured} of the 4 hygiene subjects were MEASURED at all; an unmeasured subject is not a clean one ` +
          'and can never satisfy this gate',
      )
    } else {
      const clean = hygiene.serverGone && hygiene.chromeGone && hygiene.appPortFree && hygiene.debugPortFree
      gateFrom(
        'H-1',
        clean,
        `this run's application server and headless browser are both gone and ports ${acquired.appPort} (server) and ` +
          `${acquired.debugPort} (CDP) are both released — each of the four measured, none assumed`,
        `server gone=${hygiene.serverGone}, browser gone=${hygiene.chromeGone}, app port released=` +
          `${hygiene.appPortFree}, CDP port released=${hygiene.debugPortFree}`,
      )
    }
  }
}

// =====================================================================
// MAIN
// =====================================================================

/**
 * Scan the emitted CLIENT bundles for any Supabase target. Only file names and
 * a boolean per file leave this function; no bundle content is ever printed.
 */
function scanClientBundlesForSupabaseTargets() {
  const root = join(REPO_ROOT, '.next', 'static')
  const files = []
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const full = join(directory, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.js')) files.push(full)
    }
  }
  if (!existsSync(root)) return { scanned: 0, hits: [] }
  walk(root)
  const hits = []
  for (const file of files) {
    const text = readFileSync(file, 'utf8')
    if (
      text.includes('NEXT_PUBLIC_SUPABASE_URL') ||
      text.includes('.supabase.co') ||
      /127\.0\.0\.1:5[45]\d{3}/.test(text)
    ) {
      hits.push(file.slice(root.length + 1))
    }
  }
  return { scanned: files.length, hits }
}

async function main() {
  const options = parseArgs(process.argv)
  if (options.help) {
    say(HELP.trim())
    return
  }

  say('B.E.S.T Coach — autonomous APP-SERVED disposable proof (operator ruling R-C2-5)')
  say('No password exists on any path in this proof. Sessions are ADMIN-MINTED against the')
  say('disposable stack only. G-1 is NOT claimed here, and G-6 stays NOT-RUN.')

  /* ------------------------------------------------------------------
   * A-1 .. A-4 — refuse before provisioning anything.
   * ----------------------------------------------------------------- */
  phase('Before anything is provisioned')

  const config = assertCanonicalConfigUntouched()
  check(
    'A-1',
    'PASS',
    `supabase/config.toml (${config.bytes} bytes, sha256 ${config.sha256.slice(0, 16)}…) still pins project id ` +
      `"${CANONICAL_PROJECT_ID}" and the canonical ports, and no Supabase project reference exists — this proof is ` +
      'local-only and refuses to run on a linked project',
  )

  const distinct = assertNoCollision()
  check(
    'A-2',
    'PASS',
    `disposable project id "${distinct.projectId}" differs from "${CANONICAL_PROJECT_ID}"; ports ` +
      `${distinct.ports.join(', ')} collide with no canonical port and with neither 3417 nor 9417; ` +
      `${distinct.emails} synthetic identity addresses are distinct from all three canonical fixture addresses`,
  )

  const running = runningContainers()
  const canonicalMissing = CANONICAL_CONTAINERS.filter((name) => !running.has(name))
  if (canonicalMissing.length > 0) {
    throw new SafeError(
      `${canonicalMissing.length} canonical container(s) are not running: ${canonicalMissing.join(', ')}. ` +
        'This proof reads the canonical database and refuses to start it, stop it or repair it.',
    )
  }
  readings.canonicalBefore = readCanonical()
  assertCanonicalPristine(readings.canonicalBefore, 'before provisioning')
  check(
    'A-3',
    'PASS',
    `all ${CANONICAL_CONTAINERS.length} canonical containers are running; the fixture checksum is ` +
      `${readings.canonicalBefore.checksum.sha256} over ${readings.canonicalBefore.checksum.rows} rows and the census ` +
      '(reports|versions|version_ratings|corrections|observations|obs_ratings|events|heads|users|migrations|fn|tbl|pol) ' +
      `is ${readings.canonicalBefore.census}`,
  )

  const strayContainers = disposableContainersPresent()
  const strayVolumes = disposableVolumesPresent()
  const busyPorts = []
  for (const port of [...DISPOSABLE_PUBLISHED_PORTS, DISPOSABLE_APP_PORT, DISPOSABLE_DEBUG_PORT]) {
    if (!(await isPortFree(port)) || (await portAnswers(port))) busyPorts.push(port)
  }
  checkFrom(
    'A-4',
    strayContainers.length === 0 && strayVolumes.length === 0 && busyPorts.length === 0,
    `0 containers, 0 volumes and 0 held ports named or numbered for "${DISPOSABLE_PROJECT_ID}" existed beforehand — ` +
      `including the application port ${DISPOSABLE_APP_PORT} and the CDP port ${DISPOSABLE_DEBUG_PORT}`,
    `stray containers: ${strayContainers.join(', ') || 'none'}; stray volumes: ${strayVolumes.join(', ') || 'none'}; ` +
      `held ports: ${busyPorts.join(', ') || 'none'}`,
  )
  if (strayContainers.length > 0 || strayVolumes.length > 0 || busyPorts.length > 0) {
    throw new SafeError('Disposable residue already exists. Refusing to provision on top of it.')
  }
  for (const port of [...DISPOSABLE_PUBLISHED_PORTS, DISPOSABLE_APP_PORT, DISPOSABLE_DEBUG_PORT]) {
    await assertPortFree(port, 'the disposable run')
  }
  acquired.appPort = DISPOSABLE_APP_PORT
  acquired.debugPort = DISPOSABLE_DEBUG_PORT

  /* ------------------------------------------------------------------
   * G-20 — typecheck, lint, build. Captured, unrendered, exit codes only.
   * Run BEFORE anything is provisioned: a build failure must not leave a
   * stack standing while it is investigated.
   * ----------------------------------------------------------------- */
  phase('G-20 — typecheck, lint, build')
  const typecheck = runCapturedExitCode(
    process.execPath,
    [join(REPO_ROOT, 'node_modules', 'typescript', 'bin', 'tsc'), '--noEmit'],
    { cwd: REPO_ROOT },
  )
  info(`tsc --noEmit exit ${typecheck.status}`)
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
  gateFrom(
    'G-20',
    typecheck.status === 0 && lint.status === 0 && build.status === 0,
    'tsc --noEmit, npm run lint and npm run build each exited 0 (output captured, never rendered)',
    `exit codes were tsc=${typecheck.status}, lint=${lint.status}, build=${build.status}`,
  )
  if (typecheck.status !== 0 || lint.status !== 0 || build.status !== 0) {
    throw new SafeError(
      'Typecheck, lint or build failed. Their output was captured and discarded by design — run the failing ' +
        'command yourself to see it. Nothing was provisioned.',
    )
  }

  /* ------------------------------------------------------------------
   * A-5 .. A-9 — provision, seed, and measure.
   * ----------------------------------------------------------------- */
  phase('Disposable workdir (outside the repository)')
  const cli = resolveLocalCli()
  acquired.cli = cli
  info(`CLI resolved as: ${cli.form}`)
  const { workdir, migrations } = createDisposableWorkdir()
  acquired.workdir = workdir
  const insideRepo = resolve(workdir).toLowerCase().startsWith(resolve(REPO_ROOT).toLowerCase())
  checkFrom(
    'A-5',
    migrations.length === EXPECTED_CANONICAL_MIGRATIONS && !insideRepo,
    `${migrations.length} committed migrations copied under ${os.tmpdir()} and each verified byte-identical to its ` +
      'source by SHA-256; the workdir is outside the repository so nothing it holds can be committed',
    `${migrations.length} migration(s) copied; workdir inside repository = ${insideRepo}`,
  )

  phase('Provisioning the disposable stack (this really starts containers)')
  info('CLI stdout and stderr are captured and DISCARDED: the CLI prints local keys on success')
  acquired.startAttempted = true
  const started = startDisposableStack(cli, workdir)
  acquired.stackStarted = true

  const disposableCensus = readDisposableCensus()
  checkFrom(
    'A-6',
    disposableCensus.appliedMigrations === EXPECTED_CANONICAL_MIGRATIONS &&
      disposableCensus.migrations === readings.canonicalBefore.migrations &&
      disposableCensus.reports === 0 &&
      disposableCensus.auditEvents === 0 &&
      disposableCensus.authUsers === 0,
    `the stack started in ${Math.round(started.elapsedMs / 1000)}s under project id "${DISPOSABLE_PROJECT_ID}"; all ` +
      `${disposableCensus.appliedMigrations} committed migrations applied with the same versions and order as the ` +
      `canonical database; ${disposableCensus.publicFunctions} public functions, ${disposableCensus.publicTables} ` +
      `tables, ${disposableCensus.publicPolicies} policies; 0 reports, 0 audit events and 0 Auth users, so it is a ` +
      'fresh schema and NOT a copy or a share of canonical data',
    `applied migrations ${disposableCensus.appliedMigrations}; identical migration list = ` +
      `${disposableCensus.migrations === readings.canonicalBefore.migrations}; reports=${disposableCensus.reports}, ` +
      `audit_events=${disposableCensus.auditEvents}, auth.users=${disposableCensus.authUsers}`,
  )

  // Captured into process memory only. Nothing below prints or stores it.
  const connection = captureDisposableStatus(cli, workdir)
  assertDisposableApiTarget(connection.apiUrl, 'the disposable stack')
  check(
    'A-7',
    'PASS',
    `the disposable API URL is loopback on port ${DISPOSABLE_API_PORT} and is structurally refused if it is anything ` +
      `else — the canonical API port ${CANONICAL_API_PORT} is rejected by name. It was captured into process memory ` +
      "only, from the DISPOSABLE stack's own status output; .env.local was never read and no key is printed, " +
      'written or serialized anywhere in this proof',
  )

  phase('Disposable identities — created WITHOUT a password')
  const admin = makeAdminClient(connection.apiUrl, connection.serviceRoleKey, 'identity creation')
  const createdIdentities = await createPasswordlessIdentities(admin)
  checkFrom(
    'A-8',
    createdIdentities.length === DISPOSABLE_IDENTITIES.length,
    `${createdIdentities.length} synthetic identities created on the DISPOSABLE Auth service with NO password field ` +
      'in the call and no password anywhere in this file; each returned the ratified fixture UUID',
    `only ${createdIdentities.length} of ${DISPOSABLE_IDENTITIES.length} identities were created`,
  )

  const seeded = seedDisposableDomain()
  checkFrom(
    'A-9',
    seeded.repointed === DISPOSABLE_IDENTITIES.length,
    `the SAME committed synthetic domain fixture loaded verbatim into the disposable database; all ${seeded.repointed} ` +
      'account rows were READ BACK and each carries its disposable address and a live link to a disposable Auth user',
    `only ${seeded.repointed} account rows verified by read-back`,
  )

  /* ------------------------------------------------------------------
   * A-10 / A-11 — serve the application against the disposable stack.
   * ----------------------------------------------------------------- */
  phase('Building the application against the DISPOSABLE target')
  info('NEXT_PUBLIC_* values are build-time inlined into the server bundles; the repository build is restored at teardown')
  acquired.buildReplaced = true
  const disposableBuild = buildForDisposableTarget(connection)
  acquired.disposableBuildStatus = disposableBuild.status
  info(`next build (disposable target) exit ${disposableBuild.status}`)
  if (disposableBuild.status !== 0) {
    throw new SafeError(
      `The application could not be built against the disposable target (next build exit ${disposableBuild.status}). ` +
        'Its output is captured and discarded by design. Nothing was served.',
    )
  }

  // The one browser-side question this proof can answer from the artefact
  // itself: does any CLIENT bundle carry a Supabase target at all? If none
  // does, no browser code can act on one, whatever the profile says.
  const clientTargets = scanClientBundlesForSupabaseTargets()
  checkFrom(
    'A-22',
    clientTargets.scanned > 0 && clientTargets.hits.length === 0,
    `${clientTargets.scanned} emitted client bundles were scanned and NOT ONE carries a Supabase URL, a Supabase ` +
      'host or the name of the public URL variable — the browser therefore holds no Supabase target to act on, and ' +
      'the profile variable it could not read anyway is server-side in fact as well as by design',
    clientTargets.scanned === 0
      ? 'no client bundle was scanned at all, so nothing was verified'
      : `these client bundles reference a Supabase target: ${clientTargets.hits.join(', ')}`,
  )

  phase('Owned application server, bound to the DISPOSABLE stack')
  const appOrigin = await startServer(connection, DISPOSABLE_APP_PORT)
  check(
    'A-10',
    'PASS',
    `next start is answering on ${appOrigin} with ${RUNTIME_PROFILE_VARIABLE}="${DISPOSABLE_RUNTIME_PROFILE}" and the ` +
      `disposable API target set in the CHILD PROCESS ENVIRONMENT ONLY. The profile carries no NEXT_PUBLIC_ prefix, ` +
      'so it is never inlined into a browser bundle and cannot be read or set from the browser, from a query ' +
      'parameter, a cookie, a header, a request body, a form, localStorage, sessionStorage or any UI control',
  )

  phase('Owned headless browser')
  startChrome(DISPOSABLE_DEBUG_PORT)
  const wsUrl = await findPageTarget(DISPOSABLE_DEBUG_PORT)
  const consoleErrors = []
  const socket = new WebSocket(wsUrl)
  await new Promise((settle, reject) => {
    socket.addEventListener('open', settle, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })
  acquired.socket = socket
  const cdp = createCdpClient(socket, consoleErrors)
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Log.enable')
  // `Network.enable` is deliberately NOT called: only Network.setCookie and
  // Network.clearBrowserCookies are used and neither needs the domain
  // enabled. Enabling it would stream every request and response header —
  // including the Cookie header carrying this run's session — through this
  // process for no benefit.
  pass(`headless Chrome is driving on CDP port ${DISPOSABLE_DEBUG_PORT}`)

  /* -----------------------------------------------------------------
   * Browser primitives, all FAIL-CLOSED. Every one throws rather than
   * returning a soft value: `undefined === undefined` must never reach a
   * verdict.
   * ---------------------------------------------------------------- */
  const NET_ERROR = /^net::ERR_[A-Z0-9_]+$/

  const navigateRaw = async (url, what) => {
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
    await loaded.promise
  }

  const evaluateRaw = async (expression, what) => {
    const response = await cdp.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
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

  const evaluateDocument = async (what) => {
    const html = await evaluateString('document.documentElement.outerHTML', `the document at ${what}`)
    const lower = html.toLowerCase()
    if (html.length < MINIMUM_DOCUMENT_BYTES || !lower.startsWith('<html') || !lower.includes('</html>')) {
      throw new SafeError(
        `The document captured at ${what} is not a complete rendered HTML document (${html.length} bytes), so there ` +
          'is nothing to compare and no verdict is available from it.',
      )
    }
    return html
  }

  const blank = async () => {
    await navigateRaw('about:blank', 'about:blank')
    const href = await evaluateString('location.href', 'the blank document')
    if (href !== 'about:blank') {
      throw new SafeError('The browser did not return to about:blank between navigations.')
    }
  }

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
    await navigateRaw(`${appOrigin}${path}`, path)
    const href = await evaluateString('location.href', `the document at ${path}`)
    if (href === 'about:blank') {
      throw new SafeError(
        `The browser still holds about:blank after navigating to ${path}; the navigation did not produce a document.`,
      )
    }
  }

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

  const findTerms = (haystack, terms) => {
    if (typeof haystack !== 'string' || haystack.length === 0) {
      // Never search "nothing" and report a clean result: an empty haystack is
      // an absence of evidence, not evidence of absence.
      throw new SafeError('A marker scan was asked to search a document that was never obtained.')
    }
    const lower = haystack.toLowerCase()
    return terms.filter((term) => lower.includes(term.toLowerCase()))
  }

  const installCookies = async (cookies) => {
    await cdp.send('Network.clearBrowserCookies')
    for (const cookie of cookies) {
      await cdp.send('Network.setCookie', { name: cookie.name, value: cookie.value, url: appOrigin, path: '/' })
    }
  }

  /* -----------------------------------------------------------------
   * G-21's collector must PROVE it is attached before G-21 can mean
   * anything: an empty error list from a collector that was never wired up
   * is indistinguishable from a clean run.
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
  consoleErrors.length = 0
  if (consoleCollectorLive) {
    pass('the console/runtime error collector caught a deliberately emitted error and was then reset')
  } else {
    info('the console/runtime error collector did NOT catch its own probe; G-21 will be recorded FAIL')
  }

  /* -----------------------------------------------------------------
   * A-12 / G-2 — three admin-minted sessions, and the authority legs.
   * ---------------------------------------------------------------- */
  phase('Admin-minted sessions (no password exists on this path)')
  const minted = []
  const roleSurfaces = new Map()
  let parentDenialPair = null
  let parentDenialFailure = null

  for (const identity of DISPOSABLE_IDENTITIES) {
    const cookies = await mintSessionCookies(connection, identity)
    minted.push(identity.key)
    await installCookies(cookies)

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
      // G-14's whole substance is a byte comparison, so its degenerate case —
      // "no bytes at all" — must be a FAILURE to obtain, never a match.
      try {
        const unknown = await surface(`/parent/students/${OPAQUE_STUDENT}/sessions/${OPAQUE_SESSION}/report`)
        const real = await surface(`/parent/students/${FIXTURE_STUDENT}/sessions/${FIXTURE_SESSION}/report`)
        /*
         * TWO comparisons, both recorded, because they answer different
         * questions and only one of them is the gate's.
         *
         * RAW: are the two documents byte-identical? A framework embeds the
         * route parameters the CALLER ITSELF SUPPLIED into the streamed
         * payload, so two requests to two different paths can differ purely
         * by the identifiers the caller already knew.
         *
         * NORMALIZED: with each request's OWN two identifiers replaced by the
         * same placeholder, is anything left that differs? That is the
         * disclosure question. A caller learns nothing from being shown the
         * identifiers it just sent; it learns something only if the responses
         * differ in any other respect. If the normalized documents differ by
         * even one byte, the denial disclosed something and the gate FAILS.
         *
         * The substitution is deliberately confined to the four literals this
         * file authored. Nothing is stripped, no whitespace is collapsed, and
         * no content is otherwise rewritten.
         */
        const placeholder = '00000000-0000-0000-0000-000000000000'
        const normalize = (html, studentId, sessionId) =>
          html.split(studentId).join(placeholder).split(sessionId).join(placeholder)
        const normalizedUnknown = normalize(unknown.html, OPAQUE_STUDENT, OPAQUE_SESSION)
        const normalizedReal = normalize(real.html, FIXTURE_STUDENT, FIXTURE_SESSION)
        /*
         * The LANDING PATH is normalized the same way and for the same reason.
         * This surface renders its denial IN PLACE rather than redirecting, so
         * two requests to two different paths land on two different paths by
         * construction, and a raw landing comparison could never hold for any
         * implementation of this kind. What the gate actually needs to know is
         * whether the two requests were treated the SAME WAY: both rendered in
         * place, or both redirected to the same destination. Normalizing each
         * landing by its OWN identifiers answers exactly that, and still FAILS
         * if one request redirects and the other does not.
         */
        const normalizedUnknownLanding = normalize(unknown.landing, OPAQUE_STUDENT, OPAQUE_SESSION)
        const normalizedRealLanding = normalize(real.landing, FIXTURE_STUDENT, FIXTURE_SESSION)
        let divergence = -1
        if (normalizedUnknown !== normalizedReal) {
          const limit = Math.min(normalizedUnknown.length, normalizedReal.length)
          divergence = limit
          for (let index = 0; index < limit; index += 1) {
            if (normalizedUnknown[index] !== normalizedReal[index]) {
              divergence = index
              break
            }
          }
        }
        parentDenialPair = {
          sameLanding: normalizedUnknownLanding === normalizedRealLanding,
          normalizedLanding: normalizedUnknownLanding,
          rawIdentical: unknown.html === real.html,
          normalizedIdentical: normalizedUnknown === normalizedReal,
          divergence,
          landing: unknown.landing,
          realLanding: real.landing,
          bytes: real.html.length,
          otherBytes: unknown.html.length,
          leaked: findTerms(real.html, FIXTURE_MARKERS),
        }
      } catch (error) {
        parentDenialFailure =
          error instanceof SafeError ? error.message : 'the denial pair could not be captured from the browser'
      }
    }

    await cdp.send('Network.clearBrowserCookies')
  }

  checkFrom(
    'A-12',
    minted.length === DISPOSABLE_IDENTITIES.length,
    `${minted.length} sessions minted admin-side against the DISPOSABLE stack (generateLink -> verifyOtp on a ` +
      "cookie-writing @supabase/ssr client, so the cookie names and encoding are the application's own library's). " +
      'NO PASSWORD WAS CREATED, STORED, TYPED OR USED: the identities are passwordless and this file contains no ' +
      'password field. The target was structurally asserted to be the disposable loopback API before any mint',
    `only ${minted.length} of ${DISPOSABLE_IDENTITIES.length} sessions could be minted`,
  )

  const authorityFailures = []
  for (const identity of DISPOSABLE_IDENTITIES) {
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
      authorityFailures.push(`${identity.label} on /login landed on ${observed.loginWithSession.landing}`)
    }
    if (!observed.roleQuery.landing.startsWith(identity.home)) {
      authorityFailures.push(`${identity.label} with ?role=trainer landed on ${observed.roleQuery.landing}`)
    }
  }
  gateFrom(
    'G-2',
    authorityFailures.length === 0 && roleSurfaces.size === DISPOSABLE_IDENTITIES.length,
    'every one of the three minted sessions reached only its own SERVER-DERIVED portal on the served application; ' +
      'both foreign portals and /login redirected to it, and ?role= changed nothing',
    authorityFailures.join(' | ') || 'not every identity produced an observed surface',
  )

  /* -----------------------------------------------------------------
   * A-11 — fixture mode off, real adapter, read from the SERVED DOM.
   * ---------------------------------------------------------------- */
  const fixtureLeaks = []
  const wrongAdapter = []
  let adapterReadings = 0
  for (const identity of DISPOSABLE_IDENTITIES) {
    const observed = roleSurfaces.get(identity.key)
    if (!observed) continue
    for (const view of [observed.own, observed.loginWithSession, observed.roleQuery, ...observed.foreign]) {
      const found = findTerms(view.html, FIXTURE_MARKERS)
      if (found.length > 0) fixtureLeaks.push(`${identity.label} ${view.path}: ${found.join(', ')}`)
    }
    if (observed.own.adapterKind === null) {
      wrongAdapter.push(`${identity.label} ${observed.own.path} carried NO data-adapter-kind attribute at all`)
    } else {
      adapterReadings += 1
      if (observed.own.adapterKind !== REAL_ADAPTER_KIND) {
        wrongAdapter.push(`${identity.label} ${observed.own.path} reported ${observed.own.adapterKind}`)
      }
    }
  }
  checkFrom(
    'A-11',
    adapterReadings === DISPOSABLE_IDENTITIES.length && wrongAdapter.length === 0 && fixtureLeaks.length === 0,
    `${FIXTURE_MODE_VARIABLE} was DELETED from the served child environment and its removal verified; because a ` +
      "deleted key can in principle be refilled from the application's own .env.local, the DECIDING evidence is the " +
      `served DOM rather than the environment, and all ${adapterReadings} portal surfaces POSITIVELY reported data-adapter-kind="${REAL_ADAPTER_KIND}" read out of ` +
      'the SERVED DOM — an absent attribute is recorded as a failure to read, never as a pass — with no fixture ' +
      'marker anywhere in any captured document',
    `adapter readings ${adapterReadings}/${DISPOSABLE_IDENTITIES.length}; adapter problems: ` +
      `${wrongAdapter.join(' | ') || 'none'}; fixture markers: ${fixtureLeaks.join(' | ') || 'none'}`,
  )

  /* -----------------------------------------------------------------
   * THE LIVE SCREEN 07 -> 08 TRANSITION.
   * ---------------------------------------------------------------- */
  phase('LIVE screen 07 -> 08, driven in the browser as the disposable trainer')

  const reportsBefore = psqlRows(
    DISPOSABLE_DB_CONTAINER,
    `SELECT count(*) FROM public.reports WHERE class_session_id = '${FIXTURE_SESSION}' AND student_id = '${FIXTURE_STUDENT}';`,
  )[0]?.[0]
  if (reportsBefore !== '0') {
    throw new SafeError(
      'A report already exists for the seeded pair on the disposable database before the save. This proof requires ' +
        'the FIRST complete save, so there is nothing here to prove and it refuses to continue.',
    )
  }
  info('the disposable database holds 0 reports for the seeded (class session, student) pair before the save')

  const trainer = DISPOSABLE_IDENTITIES.find((identity) => identity.key === 'trainer')
  await installCookies(await mintSessionCookies(connection, trainer))

  await visit(ASSESS_ROUTE)
  // The instrument must be READY before it is driven: `data-rated-count` is
  // rendered by the assessment form itself, so waiting for it is waiting for
  // the real screen rather than for a fixed sleep.
  let ratedCount = null
  for (let attempt = 0; attempt < 120; attempt += 1) {
    ratedCount = await evaluateNullableString(
      "(function () { var el = document.querySelector('[data-rated-count]'); " +
        "return el ? el.getAttribute('data-rated-count') : null })()",
      'the rated-dimension count on screen 07',
    )
    if (ratedCount !== null) break
    await new Promise((r) => setTimeout(r, 500))
  }
  if (ratedCount === null) {
    throw new SafeError(`Screen 07 never rendered its assessment instrument at ${ASSESS_ROUTE}.`)
  }
  if (ratedCount !== '9') {
    throw new SafeError(
      `Screen 07 reported ${ratedCount} of 9 dimensions rated. This proof drives a COMPLETE nine-rating save and ` +
        'refuses to submit anything less.',
    )
  }
  const assessLanding = await evaluateString('location.pathname', 'the landing path on screen 07')
  if (assessLanding !== ASSESS_ROUTE) {
    throw new SafeError(`The trainer session did not reach screen 07; it landed on ${assessLanding}.`)
  }
  pass(`screen 07 is rendered at ${ASSESS_ROUTE} with all 9 dimensions rated`)

  // Type the two marker notes through the REAL controls: the native value
  // setter plus a real `input` event is what React's controlled inputs
  // observe, so this is the same state change a human keystroke produces.
  const typed = await evaluateRaw(
    `(function () {
       var setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
       var written = 0;
       var pairs = [['observation-notes', ${JSON.stringify(OBSERVATION_MARKER)}],
                    ['follow-up-notes', ${JSON.stringify(FOLLOW_UP_MARKER)}]];
       for (var i = 0; i < pairs.length; i += 1) {
         var el = document.getElementById(pairs[i][0]);
         if (!el) continue;
         setter.call(el, pairs[i][1]);
         el.dispatchEvent(new Event('input', { bubbles: true }));
         written += 1;
       }
       return String(written);
     })()`,
    'the observation and follow-up notes on screen 07',
  )
  if (typed !== '2') {
    throw new SafeError('Screen 07 did not expose both governed note fields, so the save was never submitted.')
  }

  // The URL before the save is the evidence that the client held no report
  // id: whatever appears afterwards cannot have been read from here.
  const urlBeforeSave = await evaluateString('location.pathname', 'the path before the save')
  const idInDomBeforeSave = await evaluateRaw(
    `(function () { return String(/\\/trainer\\/reports\\/[0-9a-f-]{36}\\//i.test(document.documentElement.outerHTML)) })()`,
    'the presence of any report route in the document before the save',
  )

  const submitted = await evaluateRaw(
    `(function () {
       var buttons = Array.prototype.slice.call(document.querySelectorAll('form button[type="submit"]'));
       var target = buttons.filter(function (b) { return !b.disabled })[0];
       if (!target) return 'none';
       target.click();
       return 'clicked';
     })()`,
    'the Save & Generate control on screen 07',
  )
  if (submitted !== 'clicked') {
    throw new SafeError('Screen 07 exposed no enabled submit control, so no save was performed.')
  }
  info('the enabled Save & Generate control was clicked; awaiting the client-side navigation')

  // `router.push` is a client-side transition, so there is no load event to
  // await. The pathname is polled to a DEADLINE that REJECTS — never a sleep
  // that proceeds regardless.
  let generatePath = null
  const navigationDeadline = Date.now() + 60_000
  while (Date.now() < navigationDeadline) {
    const current = await evaluateString('location.pathname', 'the path after the save')
    if (GENERATE_ROUTE.test(current)) {
      generatePath = current
      break
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  if (generatePath === null) {
    const stranded = await evaluateString('location.pathname', 'the stranded path after the save')
    throw new SafeError(
      `The browser never navigated to the screen 08 generate route after a complete nine-rating save; it is still ` +
        `at ${stranded}. NOTHING is recorded as passing from this.`,
    )
  }
  const idFromUrl = GENERATE_ROUTE.exec(generatePath)[1]

  // The authority: what the DISPOSABLE database actually holds for the pair.
  const dbRows = psqlRows(
    DISPOSABLE_DB_CONTAINER,
    `SELECT id::text, status::text, lock_version::text, COALESCE(latest_submitted_version_id::text, 'none') ` +
      `FROM public.reports WHERE class_session_id = '${FIXTURE_SESSION}' AND student_id = '${FIXTURE_STUDENT}';`,
  )
  if (dbRows.length !== 1 || dbRows[0].length !== 4) {
    throw new SafeError(
      `The disposable database holds ${dbRows.length} report row(s) for the seeded pair after the save; exactly 1 is ` +
        'required. Nothing is compared against an ambiguous reading.',
    )
  }
  const [dbReportId, dbStatus, dbLockVersion, dbSubmittedVersion] = dbRows[0]

  const idsMatch = idFromUrl.toLowerCase() === dbReportId.toLowerCase()
  const idIsUuid = UUID_V4.test(dbReportId)
  checkFrom(
    'A-14',
    idsMatch && idIsUuid && dbStatus === 'observation_saved',
    `the browser navigated from ${urlBeforeSave} to ${generatePath}, and the identifier in that URL is EQUAL to the ` +
      `id the DISPOSABLE database holds for (class_session_id, student_id) — one row, status "${dbStatus}", ` +
      `lock_version ${dbLockVersion}, latest_submitted_version_id ${dbSubmittedVersion}. The transition was driven ` +
      'live in the browser through the real controls, not simulated',
    idsMatch
      ? `the report id is well-formed=${idIsUuid} and the row status is "${dbStatus}"; "observation_saved" is ` +
        'required, which is the post-state the atomic complete save commits and the state screen 08 cannot advance ' +
        'because no AI provider selector reaches the served process'
      : 'the identifier in the browser URL is NOT the identifier the disposable database holds for that pair',
  )

  checkFrom(
    'A-15',
    reportsBefore === '0' && idInDomBeforeSave === 'false' && idsMatch && idIsUuid,
    'the client cannot have fabricated the id: the disposable database held 0 reports for the pair before the save, ' +
      'the pre-save document contained no report route at all, and the id that appeared is a well-formed v4 UUID ' +
      'equal to the one the server committed — a value that existed nowhere the client could read before the save',
    `reports before=${reportsBefore}; a report route was present in the pre-save document=${idInDomBeforeSave}; ` +
      `id matches the database=${idsMatch}; id is a well-formed v4 UUID=${idIsUuid}`,
  )

  /* -----------------------------------------------------------------
   * G-5 — real observation persistence, read back out of the database.
   * ---------------------------------------------------------------- */
  const observationRow = psqlRows(
    DISPOSABLE_DB_CONTAINER,
    `SELECT o.observation_notes, o.follow_up_notes, o.lock_version::text, ` +
      `(SELECT count(*) FROM public.observation_ratings r WHERE r.observation_id = o.id)::text ` +
      `FROM public.observations o WHERE o.class_session_id = '${FIXTURE_SESSION}' ` +
      `AND o.student_id = '${FIXTURE_STUDENT}';`,
  )
  const persisted =
    observationRow.length === 1 &&
    observationRow[0].length === 4 &&
    observationRow[0][0] === OBSERVATION_MARKER &&
    observationRow[0][1] === FOLLOW_UP_MARKER &&
    observationRow[0][3] === '9'
  gateFrom(
    'G-5',
    persisted,
    'the prose typed into screen 07 in the browser was read back VERBATIM out of the disposable database — ' +
      `observation_notes and follow_up_notes both match the strings this run authored, all 9 observation_ratings ` +
      `rows are present, and the observation is at lock_version ${observationRow[0]?.[2] ?? 'unread'}`,
    observationRow.length !== 1
      ? `${observationRow.length} observation rows were found for the seeded pair; exactly 1 is required`
      : 'the persisted notes or the rating count did not match what was entered in the browser',
  )

  /* -----------------------------------------------------------------
   * A-13 — the served application really is bound to the DISPOSABLE stack.
   * ---------------------------------------------------------------- */
  checkFrom(
    'A-13',
    idsMatch && persisted && readings.canonicalBefore.counts.reports === 0,
    'the served application wrote a report and an observation that ONLY the disposable database holds, through a ' +
      'session ONLY the disposable Auth service could issue, and returned that database\'s own identifier to the ' +
      'browser. That is positive proof of the binding, not an inference from configuration; the canonical database ' +
      'held 0 reports throughout and is re-verified below',
    'the served application could not be proven bound to the disposable stack from data the disposable stack holds',
  )

  /* -----------------------------------------------------------------
   * G-17 — the audit chain, on the DISPOSABLE database, over REAL events.
   * ---------------------------------------------------------------- */
  phase('G-17 — audit chain verification on the disposable database')
  const chainRows = psqlRows(
    DISPOSABLE_DB_CONTAINER,
    'SELECT centre_id::text, ok::text, events_checked::text, ' +
      "COALESCE(first_failed_seq::text, '-'), COALESCE(failed_check, '-'), head_checked::text " +
      'FROM public.audit_verify_chain();',
  )
  const totalEvents = Number(psqlRows(DISPOSABLE_DB_CONTAINER, 'SELECT count(*) FROM public.audit_events;')[0]?.[0])
  const checkedEvents = chainRows.reduce((sum, row) => sum + Number(row[2] || 0), 0)
  const corrupt = chainRows.filter((row) => readBoolean(row[1]) !== true)
  const headsIncluded = chainRows.length > 0 && chainRows.every((row) => readBoolean(row[5]) === true)
  if (chainRows.length === 0 || totalEvents === 0) {
    // Zero events is NOT-RUN, never PASS: there is then nothing to corrupt
    // and nothing was verified.
    gate(
      'G-17',
      'NOT-RUN',
      `the disposable database holds ${totalEvents} audit event(s) across ${chainRows.length} chain(s); with nothing ` +
        'to verify there is nothing to corrupt, and an empty verification is not evidence of an intact chain',
    )
  } else {
    gateFrom(
      'G-17',
      corrupt.length === 0 && checkedEvents === totalEvents && headsIncluded,
      `public.audit_verify_chain() reported ok for ${chainRows.length} centre chain(s) and checked ${checkedEvents} ` +
        `event(s) — equal to the ${totalEvents} row(s) in public.audit_events, so nothing was silently skipped — ` +
        'with each chain head included. These are REAL events the live save committed, not an empty table',
      corrupt.length > 0
        ? `chain(s) failing verification: ${corrupt.map((row) => `${row[0]} at seq ${row[3]} (${row[4]})`).join(', ')}`
        : `${checkedEvents} event(s) checked against ${totalEvents} stored; heads included = ${headsIncluded}`,
    )
  }

  /* -----------------------------------------------------------------
   * G-14 — parent isolation and non-disclosing denial.
   * ---------------------------------------------------------------- */
  phase('G-14 — parent non-disclosing denial')
  if (parentDenialFailure !== null) {
    gate(
      'G-14',
      'FAIL',
      'both canonical-report denial documents could not be obtained with the live parent session, so nothing was ' +
        `compared: ${parentDenialFailure}`,
    )
  } else if (parentDenialPair === null) {
    gate('G-14', 'NOT-RUN', 'the live parent session was never reached, so no denial pair could be compared')
  } else {
    gateFrom(
      'G-14',
      parentDenialPair.sameLanding &&
        parentDenialPair.normalizedIdentical &&
        parentDenialPair.leaked.length === 0,
      `with a live parent session on the served application, a report for a NON-EXISTENT pair and one for the REAL ` +
        `seeded pair were treated identically — both rendered in place at ${parentDenialPair.normalizedLanding} ` +
        `(each response's OWN identifiers normalized away) — and, once each response's OWN caller-supplied ` +
        'student and session identifiers are replaced by the same placeholder, rendered documents that are ' +
        `IDENTICAL to the byte (${parentDenialPair.bytes} and ${parentDenialPair.otherBytes} raw bytes; raw ` +
        `byte-identical=${parentDenialPair.rawIdentical}). The only respect in which the raw responses differ is the ` +
        'pair of identifiers the caller itself sent, which tells that caller nothing it did not already know. ' +
        'Existence is not disclosed, and no fixture marker appeared in either document',
      !parentDenialPair.sameLanding
        ? `the two denials were treated DIFFERENTLY — the non-existent pair landed on ${parentDenialPair.landing} ` +
          `and the real pair on ${parentDenialPair.realLanding}, and they still differ once each response's own ` +
          'identifiers are normalized away — which discloses that one of the two pairs exists'
        : parentDenialPair.leaked.length > 0
          ? `the denial for the real pair carried: ${parentDenialPair.leaked.join(', ')}`
          : `the two denials still differ at offset ${parentDenialPair.divergence} after each caller-supplied ` +
            'identifier was normalized away, so the difference is NOT merely an echo of the request and the denial ' +
            'discloses that one of the two pairs exists',
    )
  }

  /* -----------------------------------------------------------------
   * A-16 / G-21 — origins and the browser console.
   * ---------------------------------------------------------------- */
  const foreignOrigins = [...observedOrigins].filter((entry) => {
    try {
      return !['127.0.0.1', 'localhost', '::1', '[::1]'].includes(new URL(entry).hostname)
    } catch {
      return true
    }
  })
  checkFrom(
    'A-16',
    observedOrigins.size > 0 && foreignOrigins.length === 0,
    `every one of the ${observedOrigins.size} distinct http(s) origins the served application actually requested is ` +
      'loopback — measured from the pages themselves, not inferred from configuration',
    observedOrigins.size === 0
      ? 'no origin was measured at all, so nothing was verified'
      : `non-loopback origins were requested: ${foreignOrigins.join(', ')}`,
  )

  if (!consoleCollectorLive) {
    gate(
      'G-21',
      'FAIL',
      'the console/runtime error collector failed its liveness self-test — a deliberately emitted console error was ' +
        'not captured — so an empty error list proves nothing',
    )
  } else {
    gateFrom(
      'G-21',
      consoleErrors.length === 0,
      'the collector proved live on a deliberate error, was reset, and then recorded no uncaught error, console ' +
        'error or error-level log entry across every surface this run visited, including the live 07 -> 08 transition',
      `${consoleErrors.length} browser console/runtime error(s) were observed`,
    )
  }

  /* -----------------------------------------------------------------
   * A-17 / G-18 — the canonical database, while everything is still up.
   * ---------------------------------------------------------------- */
  phase('Canonical database, while the disposable stack is up and the application is served')
  const canonicalDuring = readCanonical()
  const duringDiff = diffCanonical(readings.canonicalBefore, canonicalDuring)
  checkFrom(
    'A-17',
    duringDiff.length === 0,
    'with the disposable stack up, the application served against it and a REAL governed write committed on the ' +
      'disposable database, the canonical fixture checksum, census, migration list and Auth user id set are all ' +
      'identical to the reading taken before provisioning',
    duringDiff.join(' | '),
  )
  gateFrom(
    'G-18',
    duringDiff.length === 0 &&
      canonicalDuring.counts.reports === 0 &&
      canonicalDuring.counts.reportVersions === 0 &&
      canonicalDuring.counts.reportVersionRatings === 0 &&
      canonicalDuring.counts.auditEvents === 0 &&
      canonicalDuring.counts.chainHeads === 0 &&
      canonicalDuring.counts.authUsers === 3,
    `the canonical verifier database is unchanged across this run: checksum ${canonicalDuring.checksum.sha256} over ` +
      `${canonicalDuring.checksum.rows} rows, reports=0, report_versions=0, report_version_ratings=0, ` +
      'audit_events=0, audit_chain_heads=0, auth.users=3 — measured before provisioning and again after a real ' +
      'governed write landed on the DISPOSABLE database. It is re-read independently once more after teardown',
    duringDiff.length > 0 ? duringDiff.join(' | ') : `canonical residue is non-zero: ${canonicalDuring.census}`,
  )

  /* -----------------------------------------------------------------
   * The gates this proof deliberately does not decide. Recorded honestly,
   * one authored reason each, never guessed and never defaulted.
   * ---------------------------------------------------------------- */
  gate(
    'G-1',
    'NOT-RUN',
    'the three sessions on this path were ADMIN-MINTED against the disposable stack (generateLink -> verifyOtp) and ' +
      'no password exists anywhere in this proof. An admin mint is NOT a password sign-in, so this run proves the ' +
      'served application accepts a real Supabase session and derives authority from it server-side (recorded as ' +
      'G-2), and proves NOTHING about password authentication. G-1 stays owned by the interactive operator runs, ' +
      'whose TTY-only no-echo prompts are untouched by this proof',
  )
  gate(
    'G-6',
    'NOT-RUN',
    'no real AI provider is activated in this run (R-C2-5 step 7), and that is STRUCTURAL rather than incidental: ' +
      'LLM_PROVIDER, LLM_MODEL and LLM_API_KEY are all OVERWRITTEN in the served child environment with one ' +
      'non-credential literal authored in the harness — overwritten and NOT deleted, because @next/env refills any ' +
      "absent key from the application's own .env.local, which is how an earlier run of this proof reached " +
      '"drafting" and is what is now closed — so getServerConfig() refuses on the provider check before any ' +
      'provider object exists, the automatic draft request on screen 08 returns its designed generation_failure ' +
      'without a network call, and the real API key never enters the served process at all. There is therefore no generation, no ' +
      'persisted panel and no code path in this proof that could decide G-6; a configured provider would in any ' +
      'case not be a called one',
  )
  gate(
    'G-4',
    'NOT-RUN',
    'this proof drives one COMPLETE nine-rating save, which is the transition it exists to prove. The refusal of an ' +
      'INCOMPLETE save is decided on its own disposable database by scripts/tests/c2 (T-C2-S1 structurally, ' +
      'T-C2-1 behaviourally) and is not re-decided here from evidence this run did not collect',
  )
  gate(
    'G-11',
    'NOT-RUN',
    'the coordinated two-actor stale-state and duplicate-action proofs are scripts/tests/step-7i/run-concurrency.mjs, ' +
      'which owns its own disposable database and is not invoked here. This run drove no second concurrent actor, so ' +
      'it observed nothing that could decide this gate',
  )
  gate(
    'G-19',
    'NOT-RUN',
    'HALF-DECIDABLE, so recorded with exactly what WAS observed. The fixture-mode half is POSITIVELY satisfied: ' +
      `${FIXTURE_MODE_VARIABLE} was removed from the served child environment, every portal surface reported ` +
      `data-adapter-kind="${REAL_ADAPTER_KIND}" read out of the served DOM, no fixture marker appeared in any ` +
      'captured document, and the walkthrough is PROVEN to have run against the disposable stack by the report id ' +
      'read back from the disposable database (A-13/A-14). The concurrency half needs run-concurrency.mjs, which ' +
      'this proof does not invoke — so the gate as a whole is not decided here',
  )
  for (const id of ['G-3', 'G-7', 'G-8', 'G-9', 'G-10', 'G-12', 'G-13', 'G-15', 'G-16']) {
    gate(id, 'NOT-RUN', BEYOND_SCOPE)
  }

  /* -----------------------------------------------------------------
   * Teardown, then the independent canonical re-read.
   * ---------------------------------------------------------------- */
  await teardown()

  phase('Canonical database, after teardown (independent re-read)')
  readings.canonicalAfter = readCanonical()
  const afterDiff = diffCanonical(readings.canonicalBefore, readings.canonicalAfter)
  const residueOk =
    readings.canonicalAfter.counts.reports === 0 &&
    readings.canonicalAfter.counts.reportVersions === 0 &&
    readings.canonicalAfter.counts.reportVersionRatings === 0 &&
    readings.canonicalAfter.counts.auditEvents === 0 &&
    readings.canonicalAfter.counts.chainHeads === 0 &&
    readings.canonicalAfter.counts.observations === 1 &&
    readings.canonicalAfter.counts.authUsers === 3
  checkFrom(
    'A-19',
    afterDiff.length === 0 && residueOk,
    `re-read independently after teardown: checksum ${readings.canonicalAfter.checksum.sha256} over ` +
      `${readings.canonicalAfter.checksum.rows} rows (unchanged); reports=0, report_versions=0, ` +
      'report_version_ratings=0, audit_events=0, audit_chain_heads=0, observations=1, auth.users=3; the ' +
      'applied-migration list and the Auth user id set are unchanged',
    afterDiff.length > 0 ? afterDiff.join(' | ') : `residue is not the ratified pristine state: ${readings.canonicalAfter.census}`,
  )

  const stillRunning = runningContainers()
  const goneAfter = CANONICAL_CONTAINERS.filter((name) => !stillRunning.has(name))
  checkFrom(
    'A-20',
    goneAfter.length === 0,
    `all ${CANONICAL_CONTAINERS.length} canonical containers are still running after the disposable stack was removed`,
    `these canonical containers are no longer running: ${goneAfter.join(', ')}`,
  )
}

// ---------------------------------------------------------------------
// Evidence. Written OUTSIDE Git. Redacted BY CONSTRUCTION: only ids,
// verdicts, authored reasons, counts, port numbers, container names,
// route paths and PUBLIC checksums. There is no field here a credential
// could occupy, and no screenshot is taken at all.
// ---------------------------------------------------------------------

function evidenceDirectory() {
  const configured = process.env.BEST_COACH_F17_DISPOSABLE_EVIDENCE_DIR
  const target =
    configured && configured.length > 0
      ? resolve(configured)
      : resolve(REPO_ROOT, '..', '_f17-disposable-evidence')
  mkdirSync(target, { recursive: true })
  return target
}

function ledgerLines() {
  const lines = []
  lines.push('# F17 — autonomous APP-SERVED disposable proof (R-C2-5)')
  lines.push('')
  lines.push('Produced by `node scripts/physical-test/prove-disposable-app.mjs`.')
  lines.push('REDACTED BY CONSTRUCTION: ids, verdicts, authored reasons, counts, ports, container names,')
  lines.push('route paths and public checksums only. No password (none exists on this path), no token,')
  lines.push('no key, no cookie value, no Authorization header and no connection string.')
  lines.push('')
  lines.push(`- Completed: ${new Date().toISOString()}`)
  lines.push(`- Canonical project: ${CANONICAL_PROJECT_ID} (left running and untouched)`)
  lines.push(`- Disposable project: ${DISPOSABLE_PROJECT_ID} (provisioned, served against, then removed)`)
  lines.push(`- Canonical checksum before: ${readings.canonicalBefore?.checksum.sha256 ?? 'not read'}`)
  lines.push(`- Canonical checksum after:  ${readings.canonicalAfter?.checksum.sha256 ?? 'not read'}`)
  lines.push('')
  lines.push('## Environment and lifecycle evidence')
  lines.push('')
  lines.push('| Check | Verdict | Reason |')
  lines.push('|---|---|---|')
  for (const [id, title] of CHECK_TITLES) {
    const entry = checks.get(id) ?? { verdict: 'NOT-RUN', reason: 'not reached' }
    lines.push(`| **${id}** ${title} | ${entry.verdict} | ${entry.reason.replace(/\|/g, '/')} |`)
  }
  lines.push('')
  lines.push('## Acceptance gates decided by THIS script')
  lines.push('')
  lines.push('G-1 is deliberately NOT claimed here: the sessions are admin-minted, not password sign-ins.')
  lines.push('G-6 is deliberately NOT-RUN: no real AI provider is activated in this run.')
  lines.push('')
  lines.push('| Gate | Verdict | Reason |')
  lines.push('|---|---|---|')
  for (const [id, title] of GATE_TITLES) {
    const entry = gates.get(id) ?? { verdict: 'NOT-RUN', reason: 'not reached' }
    lines.push(`| **${id}** ${title} | ${entry.verdict} | ${entry.reason.replace(/\|/g, '/')} |`)
  }
  lines.push('')
  return lines
}

function printLedgers() {
  phase('Proof ledger — environment and lifecycle')
  for (const [id, title] of CHECK_TITLES) {
    const entry = checks.get(id) ?? { verdict: 'NOT-RUN', reason: 'not reached' }
    say(`  ${entry.verdict.padEnd(7)} ${id.padEnd(5)} ${title}`)
    say(`          ${entry.reason}`)
  }
  phase('Gate ledger')
  for (const [id, title] of GATE_TITLES) {
    const entry = gates.get(id) ?? { verdict: 'NOT-RUN', reason: 'not reached' }
    say(`  ${entry.verdict.padEnd(7)} ${id.padEnd(5)} ${title}`)
    say(`          ${entry.reason}`)
  }
}

let finished = false
async function finish() {
  if (finished) return
  finished = true
  if (checks.size === 0 && gates.size === 0) return
  closeLedgers('not reached: the proof ended before this could be decided')
  printLedgers()
  try {
    const directory = evidenceDirectory()
    writeFileSync(join(directory, 'disposable-app-proof.md'), `${ledgerLines().join('\n')}\n`, 'utf8')
    say('')
    say(`Redacted proof ledger written to ${directory}`)
  } catch {
    say('')
    say('The proof ledger could not be written to the external evidence pack.')
  }
}

let interrupted = false
const onSignal = () => {
  if (interrupted) return
  interrupted = true
  process.stdout.write('\nAborting. Stopping this run\'s server and browser, removing the disposable stack, then writing the ledger.\n')
  process.exitCode = 130
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
    const message = error instanceof SafeError ? error.message : 'The app-served disposable proof failed.'
    process.stderr.write(`\nFAILED: ${message}\n`)
    process.exitCode = 1
  })
  .then(async () => {
    // Teardown runs whether main resolved, threw, or was never reached.
    try {
      await teardown()
    } catch {
      // Never surfaces captured output.
    }
    await finish()
    const badChecks = [...checks.values()].filter((entry) => entry.verdict !== 'PASS').length
    const failedGates = [...gates.values()].filter((entry) => entry.verdict === 'FAIL').length
    if ((badChecks > 0 || failedGates > 0) && process.exitCode !== 130) process.exitCode = 1
  })
