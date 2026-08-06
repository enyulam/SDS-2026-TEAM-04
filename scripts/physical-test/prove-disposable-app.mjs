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
//
// ---------------------------------------------------------------------
// THE EXIT-CODE CONTRACT
// ---------------------------------------------------------------------
//   0    every check PASSED, and every gate is either PASSED or NOT-RUN
//        AND named in DECLARED_NOT_RUN_GATES — the gates this proof
//        states up front that it does not decide, each with an authored
//        reason in the ledger.
//   1    any check is not PASS; any gate FAILED; any gate is NOT-RUN
//        WITHOUT being declared — which is the "the run ended before it
//        got there" case that used to exit 0 silently; or main() threw.
//   130  SIGINT / SIGTERM.
// The verdict and its reason are printed on the last line of the run.
//
// ---------------------------------------------------------------------
// TWO CORRECTIONS CARRIED BY THIS FILE (operator rulings R-C2-6/R-C2-7)
// ---------------------------------------------------------------------
// G-14 now SEEDS ITS ISOLATION HALF. It previously compared two
// documents captured while the disposable database held ZERO report
// rows, so both were the "nothing exists" case and parent isolation
// from an EXISTING foreign report was never decided. It now drives three
// governed lifecycles to `submitted` on the disposable stack and
// compares one authorized POSITIVE CONTROL against FOUR denials —
// non-existent, own-child-but-unsubmitted, another child of the same
// centre, and another centre — every pair against every other pair.
//
// A-14 now PROVES AN ORDERED TRANSITION rather than a final status: the
// report is positively observed at `observation_saved` while the browser
// is still on screen 07, the append-only audit chain independently
// confirms the order, and five further assertions (one report, no
// duplicate, no report version, no AI draft content, no external
// provider call) are each carried on their own.
// =====================================================================

import { spawn, spawnSync } from 'node:child_process'
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
  DISPOSABLE_SHADOW_PORT,
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

/*
 * G-14's ISOLATION ARMS, seeded by scripts/physical-test/g14-isolation-seed.sql
 * on the DISPOSABLE database through the governed RPCs (operator ruling
 * R-C2-6 item 9). Every literal here also appears in that file; the seed
 * reads back and reports how many of them actually reached `submitted`,
 * and this harness refuses to decide G-14 unless all three did.
 *
 * WHY THEY EXIST. G-14 previously captured its denial pair inside the
 * identity loop, before the live 07 -> 08 save — at a moment when the
 * disposable database held NO REPORT AT ALL. Both compared documents were
 * therefore the "nothing exists" case, and an implementation that rendered
 * a generic denial for a non-existent pair but a distinguishable "not your
 * child" surface for a report that EXISTS would still have produced two
 * byte-identical documents. The isolation half was never exercised.
 */
/** POSITIVE CONTROL: a SUBMITTED report for the parent's OWN linked child. */
const G14_POSITIVE_SESSION = 'c5000000-0000-4000-8000-0000000000e1'
const G14_POSITIVE_STUDENT = FIXTURE_STUDENT
/** EXISTING, SUBMITTED, ANOTHER CHILD of the parent's OWN centre. */
const G14_FOREIGN_SESSION = 'c5000000-0000-4000-8000-0000000000e3'
const G14_FOREIGN_STUDENT = 'c2000000-0000-4000-8000-0000000000e3'
/** EXISTING, SUBMITTED, ANOTHER CENTRE the parent holds no membership in. */
const G14_OTHER_CENTRE_SESSION = 'c5000000-0000-4000-8000-0000000000e2'
const G14_OTHER_CENTRE_STUDENT = 'c2000000-0000-4000-8000-0000000000e2'
/** The seed's own verification line, and the number of lifecycles it must report. */
const G14_SEED_MARKER = 'G14_SEED_OK|'
const G14_SEED_EXPECTED = 3

/**
 * EVERY disposable port this run can hold, in one authored list.
 *
 * The reviewers' LOW finding: the A-4 and A-18 sweeps walked
 * `DISPOSABLE_PUBLISHED_PORTS` — the four PUBLISHED ports — plus the app
 * and CDP ports, and omitted the disposable SHADOW port 55420, even though
 * A-18's title claims EVERY disposable port was released. The shadow port
 * is written into the disposable `config.toml` by `disposable-stack.mjs`
 * and is a port this run can cause to be bound, so it belongs in both
 * sweeps. It is added here rather than at each call site so the two sweeps
 * can never drift apart again.
 */
const ALL_DISPOSABLE_PORTS = [
  ...DISPOSABLE_PUBLISHED_PORTS,
  DISPOSABLE_SHADOW_PORT,
  DISPOSABLE_APP_PORT,
  DISPOSABLE_DEBUG_PORT,
]

const parentReportRoute = (studentId, sessionId) =>
  `/parent/students/${studentId}/sessions/${sessionId}/report`

/**
 * G-6's authored NOT-RUN reason, hoisted to a constant because the gate is
 * now stamped BEFORE the live 07 -> 08 transition rather than after it —
 * so A-14 can READ "G-6 is NOT-RUN" out of the gate ledger as a recorded
 * fact instead of asserting it as an intention (operator ruling R-C2-7).
 */
const G6_NOT_RUN_REASON =
  'no real AI provider is activated in this run (R-C2-5 step 7), and that is STRUCTURAL rather than incidental: ' +
  'LLM_PROVIDER, LLM_MODEL and LLM_API_KEY are all OVERWRITTEN in the served child environment with one ' +
  'non-credential literal authored in the harness — overwritten and NOT deleted, because @next/env refills any ' +
  "absent key from the application's own .env.local, which is how an earlier run of this proof reached " +
  '"drafting" and is what is now closed — and the literal is READ BACK against server/platform/env.ts and proven ' +
  'to match NEITHER ratified selector, so getServerConfig() refuses on the provider check before any provider ' +
  'object exists, the automatic draft request on screen 08 returns its designed generation_failure without a ' +
  'network call, and the real API key never enters the served process at all. There is therefore no generation, ' +
  'no persisted panel and no code path in this proof that could decide G-6; a configured provider would in any ' +
  'case not be a called one'

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
  ['A-23', 'No disposable container can be restarted by the Docker daemon after this run ends'],
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
  // Strand 2 runs BEFORE the overwrite, so a literal that had become a
  // ratified selector would abort the run rather than be written in.
  assertNeutralisingLiteralIsUnratified()
  for (const selector of ['LLM_PROVIDER', 'LLM_MODEL', 'LLM_API_KEY']) {
    childEnv[selector] = PROVIDER_DISABLED_LITERAL
    if (childEnv[selector] !== PROVIDER_DISABLED_LITERAL) {
      throw new SafeError(
        'An AI provider selector could not be neutralised in the served child environment. Refusing to serve: this ' +
          'run must be structurally incapable of activating a real provider.',
      )
    }
    providerControl.overwritten.add(selector)
  }
  return childEnv
}

// ---------------------------------------------------------------------
// THE PROVIDER-CALL CONTROL (operator ruling R-C2-7).
//
// "No external AI provider call occurred" must be a POSITIVE measurement,
// not an inference from intent. Four independent strands are collected,
// and A-14 requires ALL of them:
//
//   1. the three ratified selectors were OVERWRITTEN in the served child
//      environment — recorded at the moment it is built, from the object
//      actually handed to `spawn`;
//   2. the literal they were overwritten with MATCHES NEITHER RATIFIED
//      SELECTOR — read out of `server/platform/env.ts` itself, so a future
//      change to the accepted provider or model cannot silently turn the
//      neutralising literal into a valid one;
//   3. the SERVED PROCESS held no non-loopback TCP peer — sampled from the
//      operating system against the server's own PID, after screen 08 has
//      had its chance to request a draft;
//   4. no report version and no draft content exist anywhere on the
//      disposable database — a provider response that returned anything
//      would have been stored as one.
//
// Strand 3 is the only one that could name an address, so it NEVER reports
// one: it returns counts, and its remote endpoints are compared in memory
// and discarded.
// ---------------------------------------------------------------------
const providerControl = {
  // A SET, not an array: `disposableChildEnv()` is called twice per run — once
  // for the disposable BUILD and once for the served process — so an array
  // would record six overwrites of three selectors and read as wrong.
  overwritten: new Set(),
  literalIsUnratified: null,
  ratifiedSelectorsRead: null,
  nonLoopbackPeers: null,
  peerSampleTaken: false,
}

const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '[::1]', '0.0.0.0', '::', '[::]', '*'])

/**
 * Read the ratified provider and model selectors out of the application's own
 * environment contract, and prove the neutralising literal is neither.
 */
function assertNeutralisingLiteralIsUnratified() {
  const source = readFileSync(join(REPO_ROOT, 'server', 'platform', 'env.ts'), 'utf8')
  const accepted = [...source.matchAll(/const ACCEPTED_LLM_(?:PROVIDER|MODEL)\s*=\s*"([^"]+)"/g)].map((m) => m[1])
  providerControl.ratifiedSelectorsRead = accepted.length
  if (accepted.length < 2) {
    throw new SafeError(
      'The ratified AI provider and model selectors could not be read from server/platform/env.ts, so this run ' +
        'cannot prove its neutralising literal is not one of them. Refusing to serve.',
    )
  }
  providerControl.literalIsUnratified = !accepted.includes(PROVIDER_DISABLED_LITERAL)
  if (!providerControl.literalIsUnratified) {
    throw new SafeError(
      'The literal this proof overwrites the AI provider selectors with is now a RATIFIED selector. Refusing to ' +
        'serve: this run would be capable of activating a real provider.',
    )
  }
}

/**
 * Count the served process's non-loopback TCP peers. Returns `null` when the
 * sample could not be taken at all — which is recorded as "not measured" and
 * never as "measured zero".
 */
function sampleNonLoopbackPeers(pid) {
  if (typeof pid !== 'number') return null
  const result = spawnSync('netstat', ['-ano', '-p', 'TCP'], {
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
    maxBuffer: 8 * 1024 * 1024,
  })
  if (result.error || typeof result.stdout !== 'string' || result.stdout.length === 0) return null
  let foreign = 0
  for (const line of result.stdout.split(/\r?\n/)) {
    const parts = line.trim().split(/\s+/)
    // TCP <local> <remote> <state> <pid>
    if (parts.length < 5 || parts[0].toUpperCase() !== 'TCP') continue
    if (parts[parts.length - 1] !== String(pid)) continue
    const remote = parts[2]
    const host = remote.startsWith('[') ? remote.slice(0, remote.lastIndexOf(']') + 1) : remote.slice(0, remote.lastIndexOf(':'))
    if (!LOOPBACK_HOSTS.has(host)) foreign += 1
  }
  return foreign
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
    for (const port of ALL_DISPOSABLE_PORTS) {
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
          `it, and ALL ${ALL_DISPOSABLE_PORTS.length} disposable ports — the four published ports ` +
          `${DISPOSABLE_PUBLISHED_PORTS.join(', ')}, the SHADOW port ${DISPOSABLE_SHADOW_PORT}, the application port ` +
          `${DISPOSABLE_APP_PORT} and the CDP port ${DISPOSABLE_DEBUG_PORT} — each REFUSE a TCP connection AND are each re-bindable ` +
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
function scanClientBundles(matches) {
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
    if (matches(readFileSync(file, 'utf8'))) hits.push(file.slice(root.length + 1))
  }
  return { scanned: files.length, hits }
}

function scanClientBundlesForSupabaseTargets() {
  return scanClientBundles(
    (text) =>
      text.includes('NEXT_PUBLIC_SUPABASE_URL') ||
      text.includes('.supabase.co') ||
      /127\.0\.0\.1:5[45]\d{3}/.test(text),
  )
}

/**
 * A-10's MEASUREMENT, not its assertion. A-10's reason claimed the runtime
 * profile "is never inlined into a browser bundle and cannot be read or set
 * from the browser" — properties A-10 itself did not measure (the reviewers'
 * INFORMATIONAL finding). This measures the half that is measurable from the
 * artefact: does the emitted client JavaScript mention the profile variable
 * name, or the value this run set it to, anywhere at all?
 */
function scanClientBundlesForRuntimeProfile() {
  return scanClientBundles(
    (text) => text.includes(RUNTIME_PROFILE_VARIABLE) || text.includes(DISPOSABLE_RUNTIME_PROFILE),
  )
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
  for (const port of ALL_DISPOSABLE_PORTS) {
    if (!(await isPortFree(port)) || (await portAnswers(port))) busyPorts.push(port)
  }
  checkFrom(
    'A-4',
    strayContainers.length === 0 && strayVolumes.length === 0 && busyPorts.length === 0,
    `0 containers, 0 volumes and 0 held ports named or numbered for "${DISPOSABLE_PROJECT_ID}" existed beforehand — ` +
      `all ${ALL_DISPOSABLE_PORTS.length} of them: the four published ports ${DISPOSABLE_PUBLISHED_PORTS.join(', ')}, ` +
      `the SHADOW port ${DISPOSABLE_SHADOW_PORT}, the application port ${DISPOSABLE_APP_PORT} and the CDP port ` +
      `${DISPOSABLE_DEBUG_PORT}`,
    `stray containers: ${strayContainers.join(', ') || 'none'}; stray volumes: ${strayVolumes.join(', ') || 'none'}; ` +
      `held ports: ${busyPorts.join(', ') || 'none'}`,
  )
  if (strayContainers.length > 0 || strayVolumes.length > 0 || busyPorts.length > 0) {
    throw new SafeError('Disposable residue already exists. Refusing to provision on top of it.')
  }
  for (const port of ALL_DISPOSABLE_PORTS) {
    await assertPortFree(port, 'the disposable run')
  }
  acquired.appPort = DISPOSABLE_APP_PORT
  acquired.debugPort = DISPOSABLE_DEBUG_PORT

  /* ------------------------------------------------------------------
   * G-20 — typecheck, lint, build. Captured, unrendered, exit codes only.
   * Run BEFORE anything is provisioned: a build failure must not leave a
   * stack standing while it is investigated.
   * ----------------------------------------------------------------- */
  /*
   * WHY THIS NO LONGER GOES THROUGH `npm run`, AND WHY IT DISTINGUISHES
   * "COULD NOT RUN" FROM "FAILED" (the reviewers' MEDIUM finding: G-20 failed
   * SPURIOUSLY on a first invocation and aborted the whole proof before
   * provisioning — a false FAIL).
   *
   * TWO DEFECTS, both mechanical, both fixed here rather than retried around.
   *
   *  1. G-20 was the ONLY invocation in this harness that went through `npm`
   *     — and on Windows through `npm.cmd` with `shell: true`. Every other
   *     child process in this file is `process.execPath` plus a RESOLVED,
   *     project-local JavaScript entry point (`node_modules/typescript/bin/tsc`,
   *     `node_modules/next/dist/bin/next`). The npm path adds a shell, npm's
   *     own bootstrap, and a PATH/shim resolution that can differ between one
   *     invocation and the next on the same machine — none of which is under
   *     test, and any of which can fail for reasons unrelated to whether this
   *     codebase typechecks, lints and builds. `npm run lint` IS `eslint` and
   *     `npm run build` IS `next build` (package.json), so the two commands are
   *     now invoked directly, exactly as the scripts define them, with the
   *     ambiguous layer removed.
   *
   *  2. `runCapturedExitCode` reports `status: null` for a process that could
   *     not be spawned at all, and for one killed by a signal or a timeout.
   *     G-20 compared `status === 0` and reported everything else as FAIL, so
   *     "the harness could not invoke tsc" was recorded as "typecheck failed".
   *     Those are different facts and only one of them is a finding about the
   *     code. An invocation that never produced an exit code now aborts with a
   *     named harness error and leaves G-20 UNDECIDED rather than FAILED —
   *     a gate must never claim a verdict it did not measure.
   *
   * Each command also carries an explicit timeout, so a hung command yields a
   * named timeout instead of blocking the run forever or resolving to an
   * unexplained null. No retry and no sleep is introduced anywhere.
   */
  phase('G-20 — typecheck, lint, build')
  const QUALITY_TIMEOUT_MS = 20 * 60 * 1000
  const localEntry = (...segments) => {
    const path = join(REPO_ROOT, 'node_modules', ...segments)
    if (!existsSync(path)) {
      throw new SafeError(
        `The project-local entry point node_modules/${segments.join('/')} could not be resolved, so G-20 could ` +
          'not be run at all. Nothing was provisioned and no verdict is claimed for it.',
      )
    }
    return path
  }
  const quality = (label, entrySegments, args) => {
    const result = runCapturedExitCode(process.execPath, [localEntry(...entrySegments), ...args], {
      cwd: REPO_ROOT,
      timeout: QUALITY_TIMEOUT_MS,
    })
    if (result.spawnFailed || result.status === null) {
      throw new SafeError(
        `${label} produced NO exit code — it could not be spawned, or it was killed by a signal or the ` +
          `${QUALITY_TIMEOUT_MS / 60000}-minute timeout. That is a fault in this harness's invocation, NOT evidence ` +
          'that the codebase fails to typecheck, lint or build, so G-20 is left undecided rather than recorded as ' +
          'a failure. Nothing was provisioned.',
      )
    }
    info(`${label} exit ${result.status}`)
    return result.status
  }
  const typecheck = quality('tsc --noEmit', ['typescript', 'bin', 'tsc'], ['--noEmit'])
  const lint = quality('eslint (npm run lint)', ['eslint', 'bin', 'eslint.js'], [])
  const build = quality('next build (npm run build)', ['next', 'dist', 'bin', 'next'], ['build'])
  gateFrom(
    'G-20',
    typecheck === 0 && lint === 0 && build === 0,
    'tsc --noEmit, eslint and next build — the three commands package.json defines, invoked directly through ' +
      'this Node runtime with no shell and no npm layer — each exited 0 (output captured, never rendered)',
    `exit codes were tsc=${typecheck}, eslint=${lint}, next build=${build}`,
  )
  if (typecheck !== 0 || lint !== 0 || build !== 0) {
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

  /*
   * A-23 — THE AUTO-RESTART RESIDUE HAZARD, closed at creation.
   *
   * A stopped disposable container with a named volume and the CLI's default
   * `unless-stopped` policy survived a previous session and was restarted by
   * the Docker daemon on its own. `startDisposableStack` now strips that policy
   * from every disposable container the moment the stack exists. It is measured
   * here from `docker inspect`, per container, and a stack that still carries a
   * restarting policy stops this run before a session is minted — a stack that
   * can outlive its owner is exactly what this proof must not create.
   */
  const restart = started.restart
  checkFrom(
    'A-23',
    restart.allDisabled,
    `all ${restart.containers} disposable containers report Docker restart policy "no", measured one by one with ` +
      '`docker inspect`, so none of them can be brought back by the daemon after this run ends — the residue ' +
      'hazard is removed at creation, not relied on being absent at teardown',
    `containers=${restart.containers}; policies=${restart.policies.map((entry) => `${entry.name}=${entry.policy ?? 'unreadable'}`).join(', ') || 'none measured'}`,
  )
  if (!restart.allDisabled) {
    throw new SafeError(
      'One or more disposable containers still carry a Docker restart policy. Refusing to continue with a stack ' +
        'that the daemon could restart after this run ends.',
    )
  }

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
      'the profile variable it could not read anyway is server-side in fact as well as by design. This observes the ' +
      'ARTEFACT; the SOURCE property it depends on — that lib/supabase/browser.ts is imported by nothing, so no ' +
      'client module graph can reach a Supabase URL or publishable key — is pinned independently and without a ' +
      'build by T-P44 in scripts/tests/config/run-runtime-profile.mjs',
    clientTargets.scanned === 0
      ? 'no client bundle was scanned at all, so nothing was verified'
      : `these client bundles reference a Supabase target: ${clientTargets.hits.join(', ')}`,
  )

  phase('Owned application server, bound to the DISPOSABLE stack')
  const appOrigin = await startServer(connection, DISPOSABLE_APP_PORT)
  /*
   * A-10 IS NO LONGER AN UNCONDITIONAL PASS (the reviewers' INFORMATIONAL
   * finding). Its old reason asserted that the runtime profile "is never
   * inlined into a browser bundle and cannot be read or set from the
   * browser" — two properties A-10 itself never measured. What IS
   * measurable from the artefact is measured, and what is not is no longer
   * claimed:
   *
   *   1. the server really answered on the disposable app port (startServer
   *      returns only after a live HTTP response, and throws otherwise);
   *   2. the profile variable name carries NO `NEXT_PUBLIC_` prefix — the
   *      structural reason Next.js will not inline it;
   *   3. NEITHER the variable name NOR the value this run set it to appears
   *      in ANY emitted client bundle, scanned file by file.
   *
   * (3) is the empirical form of "never inlined into a browser bundle".
   * The wider claim that it "cannot be set from a query parameter, cookie,
   * header, body, form or storage" is a claim about the whole application
   * surface, which this check cannot see and therefore no longer asserts —
   * G-2's role-query and foreign-portal legs measure the part of it that
   * this run does exercise.
   */
  const profileInBundles = scanClientBundlesForRuntimeProfile()
  const profileIsServerOnly = !RUNTIME_PROFILE_VARIABLE.startsWith('NEXT_PUBLIC_')
  checkFrom(
    'A-10',
    typeof appOrigin === 'string' &&
      appOrigin.length > 0 &&
      profileIsServerOnly &&
      profileInBundles.scanned > 0 &&
      profileInBundles.hits.length === 0,
    `next start is answering on ${appOrigin} with ${RUNTIME_PROFILE_VARIABLE} set in the CHILD PROCESS ENVIRONMENT ` +
      `ONLY. MEASURED, not asserted: the variable name carries no NEXT_PUBLIC_ prefix, and none of the ` +
      `${profileInBundles.scanned} emitted client bundles contains the variable name or the value this run set it ` +
      'to — so the profile is not inlined into any browser bundle, as a reading of the artefact rather than as a ' +
      'property inferred from the naming convention',
    profileInBundles.scanned === 0
      ? 'no client bundle was scanned at all, so nothing about browser reachability was verified'
      : `server answered=${typeof appOrigin === 'string' && appOrigin.length > 0}; variable is server-only by name=` +
        `${profileIsServerOnly}; client bundles carrying the profile: ${profileInBundles.hits.join(', ') || 'none'}`,
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

  /*
   * A SETTLED capture. The parent canonical-report surface fetches through a
   * Server Action AFTER it mounts, so the document available the instant the
   * navigation completes is the LOADING SKELETON — for the denial and for the
   * positive control alike. Comparing those would compare two skeletons and
   * would be satisfied by any implementation whatsoever, which is precisely
   * the class of vacuous comparison G-14 is being repaired to stop making.
   *
   * This waits, to a deadline that REJECTS, until the surface has reached one
   * of its two TERMINAL states: the rendered report (`data-testid=
   * "parent-canonical-report"`) or the non-disclosing state panel
   * (`section[role="status"]`, which the loading skeleton does not carry — it
   * carries `aria-busy="true"` and no role). Only then is the document read.
   *
   * IT ALSO WAITS FOR THE SHELL, AND THAT IS THE G-14 NON-DETERMINISM FIX.
   *
   * The portal shell around this page performs its OWN post-mount Server Action
   * — the identity read that fills the rail footer, the desktop header and the
   * avatar initials — and until it settles those three regions read "Loading…".
   * That read races the page's report read. A denial captured while the shell
   * was still pending and a denial captured after it settled differ by those
   * bytes, in the SHELL, for reasons that have nothing to do with parent
   * isolation — which is exactly how G-14 came to FAIL on one of two otherwise
   * identical runs. The diagnosis was a race between capture and render, not a
   * flaky boundary.
   *
   * The remedy is NOT a retry and NOT a sleep. The shell now publishes
   * `data-session-user="settled" | "pending"` (a flag carrying no identity,
   * role or centre), and this wait requires BOTH conditions — the page terminal
   * AND the shell settled — before a single byte is read. A surface that never
   * reaches both REJECTS on the deadline, because a document captured mid-flight
   * is not evidence of anything.
   */
  const SETTLED_PROBE =
    "(function () { var page = document.querySelector('[data-testid=\"parent-canonical-report\"]') !== null " +
    "|| document.querySelector('section[role=\"status\"]') !== null; " +
    "var shellEl = document.querySelector('[data-session-user]'); " +
    "var shell = shellEl !== null && shellEl.getAttribute('data-session-user') === 'settled'; " +
    "return (page ? 'page' : '-') + '|' + (shell ? 'shell' : '-') })()"

  const settledSurface = async (path) => {
    await visit(path)
    const deadline = Date.now() + NAVIGATION_TIMEOUT_MS
    let settled = false
    let lastReading = 'never read'
    while (Date.now() < deadline) {
      lastReading = await evaluateRaw(SETTLED_PROBE, `the settled state of ${path}`)
      if (lastReading === 'page|shell') {
        settled = true
        break
      }
      await new Promise((r) => setTimeout(r, 200))
    }
    if (!settled) {
      throw new SafeError(
        `${path} never reached a fully settled state before the deadline (last reading "${lastReading}": ` +
          '"page" means the rendered report or the non-disclosing state panel is present, "shell" means the ' +
          'portal shell\'s identity read has come back). NOTHING is compared against a loading skeleton or ' +
          'against a half-rendered shell.',
      )
    }
    const view = {
      path,
      landing: await evaluateString('location.pathname', `the landing path at ${path}`),
      html: await evaluateDocument(path),
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

    /*
     * G-14 IS DELIBERATELY NOT CAPTURED HERE ANY MORE. At this point in the
     * run the disposable database holds ZERO report rows — the live 07 -> 08
     * save has not happened and the isolation seed has not run — so every
     * document captured here would be the "nothing exists" case and the
     * ISOLATION half of the gate would never be exercised. The capture now
     * happens after both, in the `G-14` phase below, against reports that
     * really exist. Nothing about the comparison was relaxed to move it;
     * three arms were added to it.
     */

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

  // Stamped BEFORE the transition, so A-14 asserts a RECORDED gate verdict
  // rather than its own intention (R-C2-7).
  gate('G-6', 'NOT-RUN', G6_NOT_RUN_REASON)

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

  /*
   * SCOPED TO THE SURFACE UNDER TEST, AND REQUIRED TO BE UNIQUE THERE.
   *
   * This selector used to scan the WHOLE DOCUMENT for `form button[type=submit]`
   * and take `[0]` — the first enabled one, in DOM order, whatever it was. It
   * was only ever correct by accident: the shared portal shell happened to
   * contain no submit control, so the first document-wide match happened to be
   * screen 07's. The moment the shell gained one (the C2C-023 Sign out form,
   * which renders in the `<aside>` rail BEFORE `<main>`), `[0]` silently became
   * a DIFFERENT control and this proof clicked Sign out, landed on `/login`,
   * and reported that the save never navigated.
   *
   * The replacement is STRICTLY STRONGER, not narrower in coverage:
   *   - it looks only inside `#main-content`, the landmark screen 07 renders
   *     into, so a shell control can never again stand in for a screen control;
   *   - it requires EXACTLY ONE enabled submit control there and FAILS LOUDLY
   *     on any other count, where the old form silently picked one; and
   *   - it reports the control's own accessible text back, which is asserted
   *     below, so "the Save & Generate control was clicked" is a MEASUREMENT
   *     rather than a claim about a selector.
   */
  const submitted = await evaluateRaw(
    `(function () {
       var root = document.querySelector('#main-content');
       if (!root) return 'no-main';
       var buttons = Array.prototype.slice.call(root.querySelectorAll('form button[type="submit"]'))
         .filter(function (b) { return !b.disabled });
       if (buttons.length === 0) return 'none';
       if (buttons.length > 1) {
         return 'ambiguous:' + buttons.map(function (b) { return (b.textContent || '').trim() }).join(' | ');
       }
       var label = (buttons[0].textContent || '').trim();
       buttons[0].click();
       return 'clicked:' + label;
     })()`,
    'the Save & Generate control on screen 07',
  )
  if (submitted === 'no-main') {
    throw new SafeError('Screen 07 rendered no #main-content landmark, so the save control could not be located.')
  }
  if (submitted === 'none') {
    throw new SafeError('Screen 07 exposed no enabled submit control, so no save was performed.')
  }
  if (submitted.startsWith('ambiguous:')) {
    throw new SafeError(
      'Screen 07 exposed MORE THAN ONE enabled submit control inside #main-content, so which one performs the ' +
        'governed save is not determined. Refusing to click an arbitrary one: ' + submitted.slice('ambiguous:'.length),
    )
  }
  if (!submitted.startsWith('clicked:') || !submitted.includes('Save & Generate')) {
    throw new SafeError(
      'The single enabled submit control inside screen 07 is not the Save & Generate control; this proof will not ' +
        'attribute a governed save to a control it did not identify.',
    )
  }
  info('the enabled Save & Generate control was clicked; awaiting the client-side navigation')

  /* -----------------------------------------------------------------
   * A-14 — THE ORDERED TRANSITION (operator ruling R-C2-7).
   *
   * A-14 must prove a SEQUENCE, not a final status. A bare
   * `status === observation_saved || status === drafting` would pass on a
   * stale reading and would pass on an implementation that never opened
   * the report at `observation_saved` at all.
   *
   * TWO INDEPENDENT INSTRUMENTS, and both must agree.
   *
   * (1) A LIVE TIMELINE. While the pathname is polled for the client-side
   *     transition, the report row is polled from the DISPOSABLE database
   *     in the SAME loop. Every distinct (path-matched?, status) reading is
   *     appended in order. The FIRST status this run ever observes must be
   *     `observation_saved`, and it must have been observed while the
   *     browser was still on screen 07 — which is what places the state
   *     BEFORE the navigation rather than merely near it.
   *
   * (2) THE AUDIT CHAIN, which is append-only, hash-chained and
   *     UPDATE/DELETE-blocked, so it cannot be reordered after the fact.
   *     The events for this report must begin `report.created` at
   *     `incomplete`, then a `report.state_changed` from `incomplete` to
   *     `observation_saved`. If a later `observation_saved -> drafting`
   *     event exists it must come AFTER both, by sequence number.
   *
   * If the intermediate state or its ordering cannot be established from
   * BOTH, A-14 FAILS. It is never broadened.
   * ---------------------------------------------------------------- */
  const readReportRow = () => {
    const rows = psqlRows(
      DISPOSABLE_DB_CONTAINER,
      `SELECT id::text, status::text, lock_version::text, COALESCE(latest_submitted_version_id::text, 'none'), ` +
        `COALESCE(current_cycle_version_id::text, 'none') ` +
        `FROM public.reports WHERE class_session_id = '${FIXTURE_SESSION}' AND student_id = '${FIXTURE_STUDENT}';`,
    )
    if (rows.length === 0) return null
    if (rows.length !== 1 || rows[0].length !== 5) {
      throw new SafeError(
        `The disposable database holds ${rows.length} report row(s) for the seeded pair; exactly 1 is required. ` +
          'Nothing is compared against an ambiguous reading.',
      )
    }
    return rows[0]
  }

  /** Ordered, de-duplicated observations of the report row during the save. */
  const statusTimeline = []
  const observe = (status, onAssessScreen) => {
    const last = statusTimeline[statusTimeline.length - 1]
    if (last && last.status === status && last.onAssessScreen === onAssessScreen) return
    statusTimeline.push({ status, onAssessScreen })
  }

  // `router.push` is a client-side transition, so there is no load event to
  // await. The pathname is polled to a DEADLINE that REJECTS — never a sleep
  // that proceeds regardless.
  let generatePath = null
  let observedRow = null
  const navigationDeadline = Date.now() + 60_000
  while (Date.now() < navigationDeadline) {
    const current = await evaluateString('location.pathname', 'the path after the save')
    const onAssessScreen = current === ASSESS_ROUTE
    const row = readReportRow()
    if (row !== null) {
      observedRow = row
      observe(row[1], onAssessScreen)
    }
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

  // Screen 08 has now mounted and issued its draft request. Keep sampling
  // for a bounded window so a LATER `drafting` transition is observed as
  // later — the run must be able to tell "never advanced" from
  // "advanced afterwards", and only the second is what R-C2-7 permits.
  const settleDeadline = Date.now() + 15_000
  while (Date.now() < settleDeadline) {
    const row = readReportRow()
    if (row !== null) {
      observedRow = row
      observe(row[1], false)
    }
    await new Promise((r) => setTimeout(r, 500))
  }

  // Strand 3 of the provider control, sampled with screen 08 mounted and
  // its draft request already issued.
  providerControl.nonLoopbackPeers = sampleNonLoopbackPeers(owned.serverPid)
  providerControl.peerSampleTaken = providerControl.nonLoopbackPeers !== null

  // The authority: what the DISPOSABLE database actually holds for the pair.
  const dbRows = psqlRows(
    DISPOSABLE_DB_CONTAINER,
    `SELECT id::text, status::text, lock_version::text, COALESCE(latest_submitted_version_id::text, 'none'), ` +
      `COALESCE(current_cycle_version_id::text, 'none') ` +
      `FROM public.reports WHERE class_session_id = '${FIXTURE_SESSION}' AND student_id = '${FIXTURE_STUDENT}';`,
  )
  if (dbRows.length !== 1 || dbRows[0].length !== 5) {
    throw new SafeError(
      `The disposable database holds ${dbRows.length} report row(s) for the seeded pair after the save; exactly 1 is ` +
        'required. Nothing is compared against an ambiguous reading.',
    )
  }
  const [dbReportId, dbStatus, dbLockVersion, dbSubmittedVersion, dbCycleVersion] = dbRows[0]
  void observedRow

  const idsMatch = idFromUrl.toLowerCase() === dbReportId.toLowerCase()
  const idIsUuid = UUID_V4.test(dbReportId)

  /* --- instrument 1: the live timeline ----------------------------- */
  const firstObservation = statusTimeline[0] ?? null
  const openedAtObservationSaved = firstObservation !== null && firstObservation.status === 'observation_saved'
  const observedBeforeNavigation = firstObservation !== null && firstObservation.onAssessScreen === true
  const draftingIndex = statusTimeline.findIndex((entry) => entry.status === 'drafting')
  const draftingOnlyAfter = draftingIndex === -1 || draftingIndex > 0
  const timelineText = statusTimeline
    .map((entry) => `${entry.status}${entry.onAssessScreen ? '@07' : '@08'}`)
    .join(' -> ')

  /* --- instrument 2: the append-only audit chain -------------------- */
  const auditRows = psqlRows(
    DISPOSABLE_DB_CONTAINER,
    `SELECT seq_no::text, action, COALESCE(state_from, '-'), COALESCE(state_to, '-') ` +
      `FROM public.audit_events WHERE target_id = '${dbReportId}' AND target_type = 'report' ORDER BY seq_no;`,
  ).filter((row) => row.length === 4)
  const auditTrail = auditRows.map((row) => `${row[1]}:${row[2]}->${row[3]}`).join(' | ')
  const createdFirst = auditRows.length >= 1 && auditRows[0][1] === 'report.created'
  const openedSecond =
    auditRows.length >= 2 &&
    auditRows[1][1] === 'report.state_changed' &&
    auditRows[1][2] === 'incomplete' &&
    auditRows[1][3] === 'observation_saved'
  const draftingAuditIndex = auditRows.findIndex(
    (row) => row[1] === 'report.state_changed' && row[2] === 'observation_saved' && row[3] === 'drafting',
  )
  const draftingAuditOrdered = draftingAuditIndex === -1 || draftingAuditIndex >= 2
  const auditOrdered = createdFirst && openedSecond && draftingAuditOrdered

  /* --- the five additional R-C2-7 assertions ----------------------- */
  const reportCount = Number(
    psqlRows(
      DISPOSABLE_DB_CONTAINER,
      `SELECT count(*) FROM public.reports WHERE class_session_id = '${FIXTURE_SESSION}' AND student_id = '${FIXTURE_STUDENT}';`,
    )[0]?.[0],
  )
  const versionCount = Number(
    psqlRows(DISPOSABLE_DB_CONTAINER, `SELECT count(*) FROM public.report_versions WHERE report_id = '${dbReportId}';`)[0]?.[0],
  )
  const anyVersionCount = Number(
    psqlRows(DISPOSABLE_DB_CONTAINER, 'SELECT count(*) FROM public.report_versions;')[0]?.[0],
  )
  const exactlyOneReport = reportCount === 1
  const noDuplicate = reportCount === 1 && dbRows.length === 1
  const noReportVersion = versionCount === 0
  const noDraftContent = versionCount === 0 && anyVersionCount === 0 && dbCycleVersion === 'none' && dbSubmittedVersion === 'none'
  const providerControlHeld =
    providerControl.overwritten.size === 3 &&
    providerControl.literalIsUnratified === true &&
    providerControl.peerSampleTaken === true &&
    providerControl.nonLoopbackPeers === 0 &&
    noDraftContent
  // READ out of the gate ledger, never assumed: G-6 was stamped before this
  // transition began, so this is a recorded verdict, not an intention.
  const g6NotRun = gates.get('G-6')?.verdict === 'NOT-RUN'

  /*
   * WHICH INSTRUMENT DECIDES, AND WHY.
   *
   * The append-only audit chain is the DECIDING one. It is written inside
   * the same transaction as each transition, ordered by `seq_no`, hash
   * chained, and UPDATE/DELETE-blocked by trigger — so it establishes the
   * intermediate `observation_saved` state AND its position in the order
   * with no race at all, and it cannot be reordered after the fact.
   *
   * The live poll CORROBORATES it, and one leg of that poll is inherently
   * racy and is therefore recorded rather than required: whether this run's
   * first database sample landed in the window between the commit and the
   * client-side `router.push` depends on how long a `docker exec psql`
   * takes relative to one server round trip, and it lands on some runs and
   * not others. Requiring it would make A-14 flap on timing rather than on
   * behaviour. What the poll IS required to show is the part that is not a
   * race: that the FIRST status this run ever observed was
   * `observation_saved`, and that `drafting` — if it ever appeared —
   * appeared strictly after it.
   *
   * Nothing here is broadened. `observation_saved` must still be positively
   * established and must still come first; two independent instruments must
   * still agree; and the ordering claim is now made by the instrument that
   * can actually prove it.
   */
  const orderedTransitionProven =
    idsMatch &&
    idIsUuid &&
    openedAtObservationSaved &&
    draftingOnlyAfter &&
    auditOrdered &&
    (dbStatus === 'observation_saved' || dbStatus === 'drafting')

  checkFrom(
    'A-14',
    orderedTransitionProven &&
      exactlyOneReport &&
      noDuplicate &&
      noReportVersion &&
      noDraftContent &&
      providerControlHeld &&
      g6NotRun,
    `THE ORDER WAS PROVEN, NOT THE FINAL STATUS. (1) The complete nine-rating save succeeded. (2) The report was ` +
      `OPENED AT "observation_saved": the append-only, hash-chained, UPDATE/DELETE-blocked audit log records ` +
      `report.created and then the incomplete -> observation_saved transition, in that order by seq_no, and that is ` +
      `also the FIRST status this run ever read from the disposable database — live timeline ${timelineText}; the ` +
      `pre-navigation database sample landed inside the commit-to-router.push window on this run=` +
      `${observedBeforeNavigation} (a timing observation, recorded, not required). (3) The save ` +
      `response carried that exact id: the browser navigated from ${urlBeforeSave} to ${generatePath} and the ` +
      `identifier in that URL EQUALS the id the disposable database holds. (4) Only after that did screen 08 mount ` +
      `and invoke the draft request. (5) The append-only, hash-chained audit log agrees independently and cannot ` +
      `have been reordered: ${auditTrail}. Final status "${dbStatus}", lock_version ${dbLockVersion}. ` +
      `ALSO PROVEN, each on its own: exactly 1 report row for the pair; no duplicate; 0 report_versions for this ` +
      `report and 0 on the whole disposable database; no draft content and neither version pointer set; NO EXTERNAL ` +
      `AI PROVIDER CALL — all ${providerControl.overwritten.size} ratified selectors overwritten in the served child ` +
      `environment with a literal read ` +
      `back from server/platform/env.ts and proven to match NEITHER ratified selector, the served process holding ` +
      `${providerControl.nonLoopbackPeers} non-loopback TCP peers when sampled against its own PID, and no stored ` +
      `generation output anywhere; and G-6 recorded NOT-RUN`,
    [
      `id matches the database=${idsMatch}`,
      `id is a well-formed v4 UUID=${idIsUuid}`,
      `the FIRST observed status was "${firstObservation?.status ?? 'nothing was ever observed'}" (observation_saved required)`,
      `[corroboration only, not required] the first database sample landed while still on screen 07=${observedBeforeNavigation}`,
      `"drafting" appeared only after observation_saved=${draftingOnlyAfter}`,
      `audit order created->observation_saved[->drafting]=${auditOrdered} (${auditTrail || 'no audit events for this report'})`,
      `live timeline=${timelineText || 'empty'}`,
      `final status="${dbStatus}"`,
      `exactly one report=${exactlyOneReport}`,
      `no duplicate=${noDuplicate}`,
      `no report version=${noReportVersion}`,
      `no AI draft content=${noDraftContent}`,
      `provider-call control held=${providerControlHeld} (selectors overwritten=${providerControl.overwritten.size}/3, ` +
        `literal is unratified=${providerControl.literalIsUnratified}, peer sample taken=${providerControl.peerSampleTaken}, ` +
        `non-loopback peers=${providerControl.nonLoopbackPeers === null ? 'NOT MEASURED' : providerControl.nonLoopbackPeers})`,
      `G-6 recorded NOT-RUN in the gate ledger=${g6NotRun} (read back, not assumed)`,
    ].join('; '),
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
   * G-14 — PARENT ISOLATION AND NON-DISCLOSING DENIAL.
   *
   * OPERATOR RULING R-C2-6 item 9, and the reviewers' MEDIUM finding.
   *
   * This gate used to capture two documents inside the identity loop, at a
   * point where the disposable database held ZERO REPORT ROWS. Both were
   * therefore the "nothing exists" case, and an implementation that
   * rendered a generic denial for a non-existent pair but a distinguishable
   * "not your child" surface for a report that EXISTS would still have
   * produced two byte-identical documents. The ISOLATION half was never
   * exercised, and the gate could report PASS while parent isolation from
   * an existing foreign report remained entirely undecided.
   *
   * FOUR ARMS ARE NOW COMPARED, and three of them are reports that REALLY
   * EXIST on this database:
   *
   *   POSITIVE CONTROL  a SUBMITTED report for the parent's OWN linked
   *                     child, seeded through the governed RPCs. The parent
   *                     MUST be able to read it, and it MUST differ from
   *                     every denial. Without this arm a boundary that
   *                     denied everything would pass.
   *   DENIAL 1          the NON-EXISTENT pair (the original probe).
   *   DENIAL 2          the parent's OWN child's report from the live
   *                     07 -> 08 save — it EXISTS but is NOT SUBMITTED.
   *                     This is the second document the original comparison
   *                     used, now with a real report behind it.
   *   DENIAL 3          a SUBMITTED report for ANOTHER CHILD of the
   *                     parent's OWN centre — the exact case the reviewers
   *                     said was undecided.
   *   DENIAL 4          a SUBMITTED report in ANOTHER CENTRE.
   *
   * EVERY PAIR OF DENIALS is compared, not just one pair against a
   * reference: if ANY two differ the gate FAILS.
   * ---------------------------------------------------------------- */
  phase('G-14 — parent non-disclosing denial, WITH the isolation half seeded')

  const seedOutput = psqlFileStdout(DISPOSABLE_DB_CONTAINER, join(REPO_ROOT, 'scripts', 'physical-test', 'g14-isolation-seed.sql'))
  const seedLine = seedOutput.split(/\r?\n/).map((line) => line.trim()).find((line) => line.startsWith(G14_SEED_MARKER))
  const seededSubmitted = seedLine === undefined ? -1 : Number(seedLine.slice(G14_SEED_MARKER.length))
  if (seededSubmitted !== G14_SEED_EXPECTED) {
    throw new SafeError(
      `The G-14 isolation seed reported ${seededSubmitted === -1 ? 'no verification line' : `${seededSubmitted} submitted report(s)`}; ` +
        `exactly ${G14_SEED_EXPECTED} are required. Without them the isolation half of G-14 would silently degenerate ` +
        'into the "nothing exists" case, so this run refuses to decide the gate at all.',
    )
  }
  info(`${seededSubmitted} governed lifecycles were driven to submitted on the DISPOSABLE database for G-14's isolation arms`)

  let parentIsolation = null
  let parentDenialFailure = null
  try {
    const parent = DISPOSABLE_IDENTITIES.find((identity) => identity.key === 'parent')
    await installCookies(await mintSessionCookies(connection, parent))

    /*
     * NORMALIZATION, unchanged in principle from the original gate and
     * applied identically to all four arms. A framework embeds the route
     * parameters the CALLER ITSELF SUPPLIED into the streamed payload, so
     * two requests to two different paths differ purely by identifiers the
     * caller already knew. Each response is normalized by ITS OWN two
     * identifiers, so what remains is everything the response said that the
     * request did not. Nothing is stripped, no whitespace is collapsed and
     * no content is otherwise rewritten. A difference of ONE BYTE after
     * normalization is a disclosure and FAILS the gate.
     */
    const placeholder = '00000000-0000-0000-0000-000000000000'
    const normalize = (text, studentId, sessionId) =>
      text.split(studentId).join(placeholder).split(sessionId).join(placeholder)

    const arm = async (label, studentId, sessionId) => {
      const view = await settledSurface(parentReportRoute(studentId, sessionId))
      return {
        label,
        studentId,
        sessionId,
        rawHtml: view.html,
        rawLanding: view.landing,
        html: normalize(view.html, studentId, sessionId),
        landing: normalize(view.landing, studentId, sessionId),
        bytes: view.html.length,
        leaked: findTerms(view.html, FIXTURE_MARKERS),
      }
    }

    const positive = await arm('positive control (own child, SUBMITTED)', G14_POSITIVE_STUDENT, G14_POSITIVE_SESSION)
    const denials = [
      await arm('non-existent pair', OPAQUE_STUDENT, OPAQUE_SESSION),
      await arm('own child, EXISTS but NOT SUBMITTED', FIXTURE_STUDENT, FIXTURE_SESSION),
      await arm('another child of the SAME centre, EXISTS and SUBMITTED', G14_FOREIGN_STUDENT, G14_FOREIGN_SESSION),
      await arm('another CENTRE, EXISTS and SUBMITTED', G14_OTHER_CENTRE_STUDENT, G14_OTHER_CENTRE_SESSION),
    ]

    // Every unordered pair of denials, compared whole.
    const divergences = []
    for (let i = 0; i < denials.length; i += 1) {
      for (let j = i + 1; j < denials.length; j += 1) {
        const a = denials[i]
        const b = denials[j]
        if (a.landing !== b.landing) {
          divergences.push(`"${a.label}" landed on ${a.rawLanding} and "${b.label}" on ${b.rawLanding}`)
          continue
        }
        if (a.html !== b.html) {
          const limit = Math.min(a.html.length, b.html.length)
          let offset = limit
          for (let k = 0; k < limit; k += 1) {
            if (a.html[k] !== b.html[k]) { offset = k; break }
          }
          divergences.push(`"${a.label}" and "${b.label}" differ at normalized offset ${offset} (${a.bytes} vs ${b.bytes} raw bytes)`)
        }
      }
    }

    /*
     * THE POSITIVE CONTROL. It must render the report, which means it must
     * carry the parent report test id AND differ from the denials. A gate
     * whose positive control is indistinguishable from its denial is
     * measuring nothing.
     */
    const positiveRendered = positive.rawHtml.includes('data-testid="parent-canonical-report"')
    const positiveDiffers = denials.every((denial) => denial.html !== positive.html)
    const leaked = [positive, ...denials].flatMap((entry) => entry.leaked.map((term) => `${entry.label}: ${term}`))

    parentIsolation = {
      seededSubmitted,
      divergences,
      positiveRendered,
      positiveDiffers,
      leaked,
      denialLanding: denials[0].landing,
      denialBytes: denials.map((entry) => entry.bytes).join(', '),
      rawIdentical: denials.every((entry) => entry.rawHtml === denials[0].rawHtml),
    }
  } catch (error) {
    // G-14's whole substance is a byte comparison, so its degenerate case —
    // "no bytes at all" — must be a FAILURE to obtain, never a match.
    parentDenialFailure =
      error instanceof SafeError ? error.message : 'the parent isolation documents could not be captured from the browser'
  }

  if (parentDenialFailure !== null) {
    gate(
      'G-14',
      'FAIL',
      'the four parent canonical-report documents could not all be obtained with the live parent session, so nothing ' +
        `was compared: ${parentDenialFailure}`,
    )
  } else if (parentIsolation === null) {
    gate('G-14', 'NOT-RUN', 'the live parent session was never reached, so no isolation comparison could be made')
  } else {
    gateFrom(
      'G-14',
      parentIsolation.divergences.length === 0 &&
        parentIsolation.positiveRendered &&
        parentIsolation.positiveDiffers &&
        parentIsolation.leaked.length === 0,
      `THE ISOLATION HALF WAS ACTUALLY EXERCISED. ${parentIsolation.seededSubmitted} reports were driven to ` +
        'SUBMITTED on this disposable database through the governed RPCs before anything was compared, so the ' +
        '"existing but unauthorized" arms hit a genuinely different code path from the "nothing exists" arm. ' +
        'With a live parent session on the served application, FOUR denials — a NON-EXISTENT pair; the parent\'s ' +
        'own child\'s report that EXISTS but is NOT SUBMITTED; ANOTHER CHILD of the same centre whose report EXISTS ' +
        'and is SUBMITTED; and ANOTHER CENTRE whose report EXISTS and is SUBMITTED — were compared with EVERY OTHER ' +
        'one of them, not merely against a single reference. All six pairwise comparisons are IDENTICAL to the byte ' +
        `once each response's OWN caller-supplied identifiers are normalized away, all four rendered in place at ` +
        `${parentIsolation.denialLanding} (raw sizes ${parentIsolation.denialBytes}; raw byte-identical=` +
        `${parentIsolation.rawIdentical}). Existence, student identity, session identity, report state, submission ` +
        'state and centre are all undisclosed. AND THE POSITIVE CONTROL HOLDS: the same parent, in the same session, ' +
        'DID read their own linked child\'s SUBMITTED canonical report, whose document differs from every denial — ' +
        'so this gate distinguishes a working boundary from one that simply denies everything. No fixture marker ' +
        'appeared in any of the five documents',
      [
        parentIsolation.divergences.length > 0
          ? `two denials are DISTINGUISHABLE, which discloses which pairs exist: ${parentIsolation.divergences.join(' | ')}`
          : null,
        !parentIsolation.positiveRendered
          ? 'the POSITIVE CONTROL did not render the parent canonical report at all, so this run cannot tell a working boundary from one that denies everything'
          : null,
        !parentIsolation.positiveDiffers
          ? 'the POSITIVE CONTROL document is identical to a denial document'
          : null,
        parentIsolation.leaked.length > 0 ? `fixture markers leaked: ${parentIsolation.leaked.join(', ')}` : null,
      ]
        .filter((entry) => entry !== null)
        .join('; ') || 'the isolation comparison did not decide',
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
  // G-6 IS NOT STAMPED HERE. It is stamped BEFORE the live 07 -> 08
  // transition, so that A-14 can read "G-6 is NOT-RUN" out of the gate
  // ledger as a RECORDED FACT rather than assert it as an intention
  // (operator ruling R-C2-7). See G6_NOT_RUN_REASON.
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
  lines.push(`- Exit contract: ${summariseExit().explanation}`)
  lines.push('')
  lines.push('Exit codes: 0 = every check PASSED and every gate is PASSED or a DECLARED NOT-RUN;')
  lines.push('1 = a check is not PASS, a gate FAILED, a gate is NOT-RUN without being declared, or main() threw;')
  lines.push('130 = SIGINT/SIGTERM. The declared NOT-RUN set is DECLARED_NOT_RUN_GATES in the runner.')
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

// ---------------------------------------------------------------------
// THE EXIT-CODE CONTRACT (closing the reviewers' LOW finding).
//
// This runner used to exit 0 while 14 of 22 gates stood NOT-RUN, and
// documented no contract at all — unlike its sibling
// `prove-disposable-isolation.mjs`, which treats ANY non-PASS ledger entry
// as a non-zero exit. Copying the sibling's rule verbatim would be
// dishonest in the other direction here: this proof DELIBERATELY declines
// to decide fourteen gates, each with an authored reason, and a run that
// did everything it claims to do would then always "fail".
//
// So the set of gates this proof is ALLOWED to leave NOT-RUN is declared
// here, in one place, up front:
//
//   exit 0    every check PASS, every gate either PASS or NOT-RUN AND
//             named in DECLARED_NOT_RUN_GATES;
//   exit 1    any check not PASS; any gate FAIL; any gate NOT-RUN that is
//             NOT declared — which is exactly the "the run ended before it
//             got there" case the old contract silently reported as
//             success; or an exception out of main();
//   exit 130  SIGINT / SIGTERM.
//
// A gate moving OUT of the declared set (because it became decidable here)
// must be removed from this list in the same change, or its NOT-RUN will
// keep passing. A gate wrongly ADDED to it is visible in one place.
// ---------------------------------------------------------------------
const DECLARED_NOT_RUN_GATES = new Set([
  'G-1',  // admin-minted sessions are not a password sign-in
  'G-3',  // beyond this proof's scope
  'G-4',  // the incomplete-save refusal is scripts/tests/c2's
  'G-6',  // no AI provider is activated in this run, structurally
  'G-7',  // beyond this proof's scope
  'G-8',  // beyond this proof's scope
  'G-9',  // beyond this proof's scope
  'G-10', // beyond this proof's scope
  'G-11', // the two-actor concurrency proofs are run-concurrency.mjs's
  'G-12', // beyond this proof's scope
  'G-13', // beyond this proof's scope
  'G-15', // beyond this proof's scope
  'G-16', // beyond this proof's scope
  'G-19', // half-decidable; the concurrency half is run-concurrency.mjs's
])

function summariseExit() {
  const badChecks = [...CHECK_TITLES.keys()].filter((id) => (checks.get(id)?.verdict ?? 'NOT-RUN') !== 'PASS')
  const failedGates = [...GATE_TITLES.keys()].filter((id) => gates.get(id)?.verdict === 'FAIL')
  const undeclaredNotRun = [...GATE_TITLES.keys()].filter(
    (id) => (gates.get(id)?.verdict ?? 'NOT-RUN') === 'NOT-RUN' && !DECLARED_NOT_RUN_GATES.has(id),
  )
  const declaredNotRun = [...GATE_TITLES.keys()].filter(
    (id) => gates.get(id)?.verdict === 'NOT-RUN' && DECLARED_NOT_RUN_GATES.has(id),
  )
  const passedGates = [...GATE_TITLES.keys()].filter((id) => gates.get(id)?.verdict === 'PASS')
  const problems = [
    badChecks.length > 0 ? `checks not PASS: ${badChecks.join(', ')}` : null,
    failedGates.length > 0 ? `gates FAILED: ${failedGates.join(', ')}` : null,
    undeclaredNotRun.length > 0
      ? `gates left NOT-RUN that this proof does NOT declare out of scope (the run did not reach them): ${undeclaredNotRun.join(', ')}`
      : null,
  ].filter((entry) => entry !== null)
  if (problems.length > 0) {
    return { code: 1, explanation: `exit 1 — ${problems.join('; ')}` }
  }
  return {
    code: 0,
    explanation:
      `exit 0 — every one of the ${CHECK_TITLES.size} checks PASSED, ${passedGates.length} gate(s) PASSED, and the ` +
      `only NOT-RUN gates are the ${declaredNotRun.length} this proof DECLARES it does not decide ` +
      `(${declaredNotRun.join(', ') || 'none'}), each with an authored reason in the ledger`,
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
    const verdict = summariseExit()
    say('')
    say(`Exit contract: ${verdict.explanation}`)
    if (process.exitCode !== 130) process.exitCode = verdict.code
  })
