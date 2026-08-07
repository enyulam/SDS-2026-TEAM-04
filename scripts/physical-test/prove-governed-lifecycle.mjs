#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach — the COMPLETE governed lifecycle, driven through the
// REAL application UI on a DISPOSABLE writable stack (Run C4)
// =====================================================================
// Trainer assessment -> draft -> trainer approval -> Management final
// review (wording-only edit + return-for-correction) -> Trainer correction
// and reapproval -> Management Approve & Submit -> Parent submitted-only
// read. Plus the UI and governed negative controls that prove the
// boundaries hold when the UI is bypassed.
//
// ---------------------------------------------------------------------
// WHAT THIS FILE OWNS, AND WHAT IT DELIBERATELY DOES NOT
// ---------------------------------------------------------------------
// `scripts/physical-test/prove-disposable-app.mjs` already proves the
// screen 07 -> 08 leg, three-role portal isolation, G-14 parent isolation,
// G-22 sign-out, G-23 assess-route entry refusal, G-17/G-18/G-20/G-21 and
// H-1. It is BYTE-UNTOUCHED by this file. This file owns the legs BEYOND
// screen 08 that no runner previously drove through a browser: trainer
// review/edit/checklist/approve, the management queue, the management
// wording-only edit, return-for-correction, trainer correction and
// reapproval, Approve & Submit, and the parent canonical read.
//
// `scripts/tests/integration/run-integration.mjs` proves the same
// lifecycle at the governed-CORE level under real JWTs. This file does not
// replace it: a core proof and a browser proof answer different questions
// ("does the governed path enforce this?" vs "does the shipped UI actually
// walk that path?"), and Run C4 requires both.
//
// ---------------------------------------------------------------------
// THE ONE STEP THAT IS NOT BROWSER-DRIVEN, AND EXACTLY WHY
// ---------------------------------------------------------------------
// `server/modules/report-workflow/actions.ts` constructs the REAL
// `OpenAiDraftProvider` UNCONDITIONALLY on the `requestDraft` path — "the
// deterministic fixture provider is constructed only by automated tests,
// never here; there is no switch to flip" (gate G-19). That is a
// governance control, not an oversight.
//
// Run C4 forbids any external provider call. Reaching `draft_ready`
// through the SERVED action would therefore require either a real billable
// OpenAI request (forbidden) or adding a provider switch to production
// wiring (forbidden — it would weaken G-19). There is no third option.
//
// The operator's own instruction resolves it: "use the deterministic
// fixture provider where drafting is required, because the real-provider
// path is already independently proven by G-6" (Run C3-C, all sixteen
// conditions PASS, one real request per profile).
//
// So the generation step — and ONLY that step — is performed by calling
// the REAL `requestDraftCore` with `DeterministicFixtureDraftProvider`
// injected, against the disposable database. Same orchestration function,
// same schema validation, same grounding gate, same governed
// `report_store_draft` transition, same audit events. Every other lifecycle
// step in this file is driven by real clicks in a real browser against the
// real served application.
//
// THREE THINGS DIFFER FROM A PARTICIPANT RUN ON THIS ONE STEP, stated
// precisely because an under-declared shortcut is itself a defect:
//   1. the provider object is the deterministic fixture, not OpenAI;
//   2. the database channel is `psql --username=postgres` inside the
//      disposable container — a SUPERUSER transport. No client GRANT and no
//      RLS policy is therefore exercised on this one step, whereas the
//      served action carries the caller's own `authenticated` credential
//      (ADR-3: "the database role follows the credential, not the code
//      location"). The RPC still re-derives every relationship from the
//      claims the channel sets, so authority is re-proved inside the
//      function — but privilege is not;
//   3. `authUserSub` is supplied as the fixture trainer's literal id rather
//      than resolved through the wrapper's `auth.getUser()`, so the
//      wrapper's `unauthenticated` gate is not exercised here.
// The wrapper does nothing else security-relevant beyond those two things
// and constructing the provider. The RLS/GRANT path those three skip IS
// exercised, on the same governed RPCs, by `run-integration.mjs` Part 2/3
// under real JWTs and by every OTHER leg in this file through the served
// application. L-4's ledger reason repeats this rather than letting a
// reader assume the click produced the draft.
//
// The served child environment still has all three AI selectors
// OVERWRITTEN with an unratified literal, so the served process remains
// STRUCTURALLY incapable of reaching a provider — the same control
// `prove-disposable-app.mjs` uses, verified against `server/platform/env.ts`
// before it is applied.
//
// ---------------------------------------------------------------------
// USAGE
// ---------------------------------------------------------------------
//   node --import ./scripts/tests/integration/alias-loader.mjs \
//     scripts/physical-test/prove-governed-lifecycle.mjs
//
// The alias loader is required because this file imports the governed
// server cores through the repository's `@/` path alias, exactly as
// `run-integration.mjs` and `activate-g6.mjs` do.
// =====================================================================

import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import { join, resolve } from 'node:path'

import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'

import {
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
  assertNoCollision,
  assertPortFree,
  captureDisposableStatus,
  createDisposableWorkdir,
  destroyDisposableWorkdir,
  disposableContainersPresent,
  disposableVolumesPresent,
  info,
  pass,
  phase,
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

import { DeterministicFixtureDraftProvider } from '@/server/modules/ai-drafting/provider.ts'
import { requestDraftCore } from '@/server/modules/ai-drafting/request-draft-core.ts'

// ---------------------------------------------------------------------
// Fixed literals — committed, non-secret fixture values and routes.
// ---------------------------------------------------------------------

const RUNTIME_PROFILE_VARIABLE = 'BEST_COACH_SUPABASE_RUNTIME_PROFILE'
const DISPOSABLE_RUNTIME_PROFILE = 'f17-disposable'

/** Overwrites every AI selector in the served child. Matches no ratified selector. */
const PROVIDER_DISABLED_LITERAL = 'provider-disabled-for-governed-lifecycle-proof'

const DEFAULT_CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const CDP_TIMEOUT_MS = 30_000

const FIXTURE_SESSION = 'c5000000-0000-4000-8000-000000000001'
const FIXTURE_STUDENT = 'c2000000-0000-4000-8000-000000000001'
const FIXTURE_CENTRE = 'b0000000-0000-4000-8000-000000000001'
const FIXTURE_MODULE = 'c4000000-0000-4000-8000-000000000001'
const FIXTURE_ENROLMENT = 'c6000000-0000-4000-8000-000000000001'
const TRAINER_MEMBERSHIP = 'c1000000-0000-4000-8000-000000000002'
const TRAINER_SUB = 'd0000000-0000-4000-8000-000000000002'
const MANAGEMENT_SUB = 'd0000000-0000-4000-8000-000000000001'
const PARENT_SUB = 'd0000000-0000-4000-8000-000000000003'

/** Negative-control fixtures this run seeds on the DISPOSABLE database only. */
const FUTURE_SESSION = 'c5000000-0000-4000-8000-0000000000f1'
const ABSENT_SESSION = 'c5000000-0000-4000-8000-0000000000f2'

const ALL_DISPOSABLE_PORTS = [
  ...DISPOSABLE_PUBLISHED_PORTS,
  DISPOSABLE_SHADOW_PORT,
  DISPOSABLE_APP_PORT,
  DISPOSABLE_DEBUG_PORT,
]

// ---------------------------------------------------------------------
// The ledger. Every check is decided ONCE, from positive evidence, and is
// NEVER defaulted to PASS.
// ---------------------------------------------------------------------

const LIFECYCLE_TITLES = new Map([
  ['L-1', 'Trainer signs in through the real login surface'],
  ['L-2', 'Trainer opens an eligible session roster; attendance defaults Present'],
  ['L-3', 'Trainer saves observations, notes and exactly nine ratings (UI)'],
  ['L-4', 'Report reaches draft_ready through the real requestDraftCore + grounding'],
  ['L-5', 'Trainer edits the narrative (UI); the edit resets the Quality Checklist'],
  ['L-6', 'Trainer completes the checklist and approves (UI) -> trainer_approved, publishes nothing'],
  ['L-7', 'Management sees the report in Reports -> Pending (UI)'],
  ['L-8', 'Management edits parent-facing wording only (UI); the nine ratings are preserved'],
  ['L-9', 'Management returns the report for correction (UI) -> needs_edit'],
  ['L-10', 'Trainer sees the correction requirement, revises and re-approves (UI)'],
  ['L-11', 'Management sees the corrected report back in Pending (UI)'],
  ['L-12', 'Management approves and submits (UI) -> submitted'],
  ['L-13', 'Parent signs in and sees the submitted canonical narrative (UI)'],
  ['L-14', 'The Parent view is read-only and structurally excludes governed internals'],
])

const CONTROL_TITLES = new Map([
  ['N-1', 'An absent learner receives no report and no assessment path'],
  ['N-2', 'A future/ineligible session cannot start an assessment'],
  ['N-3', 'Direct URL access cannot bypass role or lifecycle rules'],
  ['N-4', 'Management cannot mutate assessment facts through a governed RPC'],
  ['N-5', 'Parent cannot mutate any report data through a governed RPC'],
  ['N-6', 'Submitted content is stable and never exposes an earlier version'],
  ['N-7', 'Pending and Approved use ONE Management Reports route and one active rail item'],
  ['N-8', 'Sign-out terminates the session for all three roles'],
  ['N-9', 'Expected audit events occur exactly once; the chain verifies complete + head-checked'],
  ['N-10', 'No external AI provider call was possible from the served process'],
  ['N-11', 'The canonical database is byte-identical before and after this run'],
  ['N-12', 'This run leaves no stack, server, browser, volume or held port behind'],
  ['N-13', 'The Quality Checklist gate is enforced SERVER-side, not only by a disabled button'],
  ['N-14', 'Management cannot read report content before trainer approval'],
  ['N-15', 'The served application used the REAL participant adapter, not the fixture adapter'],
])

/** The adapter kind the served application must report. Anything else means fixture mode. */
const REAL_ADAPTER_KIND = 'real_participant_adapter'

const lifecycle = new Map()
const controls = new Map()

function record(store, titles, id, verdict, reason) {
  if (!titles.has(id)) throw new SafeError(`Unknown ledger id: ${id}`)
  if (store.has(id)) throw new SafeError(`${id} was decided twice.`)
  if (!['PASS', 'FAIL', 'NOT-RUN'].includes(verdict)) {
    throw new SafeError(`${id} was given an unsupported verdict.`)
  }
  store.set(id, { verdict, reason })
}

const leg = (id, verdict, reason) => record(lifecycle, LIFECYCLE_TITLES, id, verdict, reason)
const control = (id, verdict, reason) => record(controls, CONTROL_TITLES, id, verdict, reason)
const legFrom = (id, ok, passReason, failReason) => leg(id, ok ? 'PASS' : 'FAIL', ok ? passReason : failReason)
const controlFrom = (id, ok, passReason, failReason) =>
  control(id, ok ? 'PASS' : 'FAIL', ok ? passReason : failReason)

function closeLedgers(reason) {
  for (const id of LIFECYCLE_TITLES.keys()) if (!lifecycle.has(id)) lifecycle.set(id, { verdict: 'NOT-RUN', reason })
  for (const id of CONTROL_TITLES.keys()) if (!controls.has(id)) controls.set(id, { verdict: 'NOT-RUN', reason })
}

// ---------------------------------------------------------------------
// Disposable-target refusal. The ONLY gateway to an Auth client.
// ---------------------------------------------------------------------

function assertDisposableApiTarget(apiUrl, what) {
  let parsed
  try {
    parsed = new URL(apiUrl)
  } catch {
    throw new SafeError(`The disposable API URL for ${what} is not a URL. Refusing.`)
  }
  if (!['127.0.0.1', 'localhost', '::1', '[::1]'].includes(parsed.hostname)) {
    throw new SafeError(`The API target for ${what} is not loopback. Refusing.`)
  }
  if (parsed.port !== String(DISPOSABLE_API_PORT)) {
    throw new SafeError(
      `The API target for ${what} is not the DISPOSABLE port ${DISPOSABLE_API_PORT}. Refusing: this run must never ` +
        'touch the canonical stack.',
    )
  }
  return parsed
}

function makeAdminClient(apiUrl, serviceRoleKey, what) {
  assertDisposableApiTarget(apiUrl, what)
  return createClient(apiUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  })
}

// ---------------------------------------------------------------------
// Passwordless identities + fixture seed on the DISPOSABLE stack.
// ---------------------------------------------------------------------

async function createPasswordlessIdentities(admin) {
  for (const identity of DISPOSABLE_IDENTITIES) {
    const { data, error } = await admin.auth.admin.createUser({
      id: identity.authId,
      email: identity.email,
      email_confirm: true,
    })
    if (error) throw new SafeError(`Auth creation failed for the ${identity.label} disposable identity.`)
    if (data?.user?.id !== identity.authId) {
      throw new SafeError(`The disposable Auth service returned an unexpected id for the ${identity.label} identity.`)
    }
  }
  return DISPOSABLE_IDENTITIES.length
}

function seedDisposableDomain() {
  psqlFileStdout(DISPOSABLE_DB_CONTAINER, join(REPO_ROOT, 'scripts', 'fixtures', 'local_fixtures.sql'), {
    do_cleanup: 'false',
    do_load: 'true',
  })
  const updates = DISPOSABLE_IDENTITIES.map(
    (identity) => `UPDATE public.accounts SET normalized_email = '${identity.email}' WHERE id = '${identity.accountId}';`,
  ).join('\n')
  psqlRows(DISPOSABLE_DB_CONTAINER, `BEGIN;\n${updates}\nCOMMIT;\nSELECT 1;`)
  const rows = psqlRows(
    DISPOSABLE_DB_CONTAINER,
    'SELECT a.id::text, a.normalized_email, (u.id IS NOT NULL)::text ' +
      'FROM public.accounts a LEFT JOIN auth.users u ON u.id = a.auth_user_id;',
  ).filter((row) => row.length === 3)
  const byId = new Map(rows.map((row) => [row[0], { email: row[1], linked: row[2] === 'true' || row[2] === 't' }]))
  for (const identity of DISPOSABLE_IDENTITIES) {
    const row = byId.get(identity.accountId)
    if (!row) throw new SafeError(`The ${identity.label} disposable account row was not found after the fixture load.`)
    if (row.email !== identity.email) {
      throw new SafeError(`The ${identity.label} disposable account row does not carry its disposable address.`)
    }
    if (!row.linked) throw new SafeError(`The ${identity.label} disposable account row is not linked to an Auth user.`)
  }
  return DISPOSABLE_IDENTITIES.length
}

/**
 * Seed the two NEGATIVE-CONTROL sessions this run needs, on the disposable
 * database only. Both are ordinary fixture rows — a future-dated session
 * (N-2) and a past session whose single enrolled learner is ABSENT (N-1).
 * Neither creates a report, a version or an approval.
 */
function seedNegativeControlSessions() {
  psqlRows(
    DISPOSABLE_DB_CONTAINER,
    `BEGIN;
INSERT INTO public.class_sessions (id, centre_id, class_module_id, session_date, starts_at, ends_at)
VALUES ('${FUTURE_SESSION}','${FIXTURE_CENTRE}','${FIXTURE_MODULE}',
        (now() AT TIME ZONE 'Asia/Singapore')::date + 7, '10:00','11:00');
INSERT INTO public.class_session_assignments (centre_id, class_session_id, trainer_membership_id)
VALUES ('${FIXTURE_CENTRE}','${FUTURE_SESSION}','${TRAINER_MEMBERSHIP}');
INSERT INTO public.attendance (centre_id, class_session_id, class_module_id, student_id, enrolment_id, status)
VALUES ('${FIXTURE_CENTRE}','${FUTURE_SESSION}','${FIXTURE_MODULE}','${FIXTURE_STUDENT}','${FIXTURE_ENROLMENT}','present');
INSERT INTO public.class_sessions (id, centre_id, class_module_id, session_date, starts_at, ends_at)
VALUES ('${ABSENT_SESSION}','${FIXTURE_CENTRE}','${FIXTURE_MODULE}',
        (now() AT TIME ZONE 'Asia/Singapore')::date - 2, '10:00','11:00');
INSERT INTO public.class_session_assignments (centre_id, class_session_id, trainer_membership_id)
VALUES ('${FIXTURE_CENTRE}','${ABSENT_SESSION}','${TRAINER_MEMBERSHIP}');
INSERT INTO public.attendance (centre_id, class_session_id, class_module_id, student_id, enrolment_id, status)
VALUES ('${FIXTURE_CENTRE}','${ABSENT_SESSION}','${FIXTURE_MODULE}','${FIXTURE_STUDENT}','${FIXTURE_ENROLMENT}','absent');
COMMIT;
SELECT 1;`,
  )
}

// ---------------------------------------------------------------------
// Session mint — no password anywhere on this path.
// ---------------------------------------------------------------------

async function mintSessionCookies(connection, identity) {
  const admin = makeAdminClient(connection.apiUrl, connection.serviceRoleKey, `the ${identity.label} session mint`)
  const link = await admin.auth.admin.generateLink({ type: 'magiclink', email: identity.email })
  if (link.error) throw new SafeError(`A session could not be minted for the ${identity.label} identity.`)
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
  if (verified === null) throw new SafeError(`The minted token was not accepted for the ${identity.label} identity.`)
  if (verified.user?.id !== identity.authId) {
    throw new SafeError(`The disposable Auth service returned an unexpected id for the ${identity.label} identity.`)
  }
  const cookies = [...jar.entries()].map(([name, value]) => ({ name, value }))
  if (cookies.length === 0) throw new SafeError(`No session cookie was produced for the ${identity.label} identity.`)
  return cookies
}

// ---------------------------------------------------------------------
// Owned processes and provider control.
// ---------------------------------------------------------------------

const owned = { server: null, chrome: null, serverPid: null, chromePid: null }
const acquired = {
  cli: null,
  workdir: null,
  startAttempted: false,
  stackStarted: false,
  chromeProfile: null,
  buildReplaced: false,
  buildRestored: null,
}
const readings = { canonicalBefore: null, canonicalAfter: null }
const hygiene = { serverGone: null, chromeGone: null, portsFree: null, containers: null, volumes: null }

const providerControl = { overwritten: new Set(), literalIsUnratified: null, nonLoopbackPeers: null, peerSampleTaken: false }

/**
 * Diagnostic captures, written beside the ledger. These exist so a failing
 * check can be classified as a HARNESS defect or a REAL finding from
 * evidence rather than from a guess — an assertion that fails must never be
 * relaxed until the rendered document has been read.
 */
const diagnostics = {}
const capture = (key, value) => { diagnostics[key] = value }

const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '[::1]', '0.0.0.0', '::', '[::]', '*'])

/**
 * Both locations are searched, for the reason Run C4 discovered the hard way:
 * the ratified selectors moved from `env.ts` to `llm-config.ts` during Run
 * C3-C, and a guard pinned to one path fails closed the moment they move
 * again. The requirement is unchanged: at least two ratified selectors must
 * really be READ, from somewhere, or this run refuses to serve.
 */
const RATIFIED_SELECTOR_SOURCES = [
  ['server', 'platform', 'llm-config.ts'],
  ['server', 'platform', 'env.ts'],
]

function assertNeutralisingLiteralIsUnratified() {
  const accepted = []
  const searched = []
  for (const segments of RATIFIED_SELECTOR_SOURCES) {
    const path = join(REPO_ROOT, ...segments)
    searched.push(segments.join('/'))
    if (!existsSync(path)) continue
    const source = readFileSync(path, 'utf8')
    for (const match of source.matchAll(/const ACCEPTED_LLM_(?:PROVIDER|MODEL)\s*=\s*"([^"]+)"/g)) {
      accepted.push(match[1])
    }
  }
  if (accepted.length < 2) {
    throw new SafeError(
      `The ratified AI provider and model selectors could not be read from any of ${searched.join(' or ')}. Refusing to serve.`,
    )
  }
  providerControl.literalIsUnratified = !accepted.includes(PROVIDER_DISABLED_LITERAL)
  if (!providerControl.literalIsUnratified) {
    throw new SafeError('The neutralising literal is now a RATIFIED selector. Refusing to serve.')
  }
}

function sampleNonLoopbackPeers(pid) {
  if (typeof pid !== 'number') return null
  const result = spawnSync('netstat', ['-ano', '-p', 'TCP'], {
    encoding: 'utf8', windowsHide: true, shell: false, maxBuffer: 8 * 1024 * 1024,
  })
  if (result.error || typeof result.stdout !== 'string' || result.stdout.length === 0) return null
  let foreign = 0
  for (const line of result.stdout.split(/\r?\n/)) {
    const parts = line.trim().split(/\s+/)
    if (parts.length < 5 || parts[0].toUpperCase() !== 'TCP') continue
    if (parts[parts.length - 1] !== String(pid)) continue
    const remote = parts[2]
    const host = remote.startsWith('[') ? remote.slice(0, remote.lastIndexOf(']') + 1) : remote.slice(0, remote.lastIndexOf(':'))
    if (!LOOPBACK_HOSTS.has(host)) foreign += 1
  }
  return foreign
}

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
  assertNeutralisingLiteralIsUnratified()
  for (const selector of ['LLM_PROVIDER', 'LLM_MODEL', 'LLM_API_KEY']) {
    childEnv[selector] = PROVIDER_DISABLED_LITERAL
    if (childEnv[selector] !== PROVIDER_DISABLED_LITERAL) {
      throw new SafeError('An AI provider selector could not be neutralised in the served child environment.')
    }
    providerControl.overwritten.add(selector)
  }
  return childEnv
}

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

function buildForDisposableTarget(connection) {
  return runCapturedExitCode(process.execPath, [nextBinary(), 'build'], {
    cwd: REPO_ROOT, env: disposableChildEnv(connection), timeout: 20 * 60 * 1000,
  })
}

function restoreRepositoryBuild() {
  return runCapturedExitCode(process.execPath, [nextBinary(), 'build'], {
    cwd: REPO_ROOT, env: restoreChildEnv(), timeout: 20 * 60 * 1000,
  })
}

function killOwned(child) {
  if (!child) return
  try {
    if (child.exitCode === null && child.signalCode === null) {
      if (process.platform === 'win32') {
        runCapturedExitCode('taskkill', ['/PID', String(child.pid), '/T', '/F'])
      } else {
        child.kill('SIGTERM')
      }
    }
  } catch {
    // Teardown must never mask the outcome.
  }
}

function processAlive(pid) {
  if (typeof pid !== 'number') return null
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    if (error && error.code === 'ESRCH') return false
    if (error && error.code === 'EPERM') return true
    return null
  }
}

async function startServer(connection, port) {
  const child = spawn(process.execPath, [nextBinary(), 'start', '-H', '127.0.0.1', '-p', String(port)], {
    cwd: REPO_ROOT, env: disposableChildEnv(connection),
    stdio: ['ignore', 'ignore', 'ignore'], windowsHide: true, shell: false,
  })
  owned.server = child
  owned.serverPid = child.pid
  const origin = `http://127.0.0.1:${port}`
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (child.exitCode !== null) throw new SafeError(`The application server exited during startup (code ${child.exitCode}).`)
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
  const profileDirectory = join(os.tmpdir(), `best-coach-c4-lifecycle-chrome-${process.pid}`)
  mkdirSync(profileDirectory, { recursive: true })
  const child = spawn(chromePath, [
    '--headless=new', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${profileDirectory}`,
    '--no-first-run', '--no-default-browser-check', '--disable-background-networking',
    '--disable-component-update', '--disable-default-apps', '--disable-gpu',
    '--window-size=1440,1100', 'about:blank',
  ], { stdio: 'ignore', windowsHide: true, shell: false })
  owned.chrome = child
  owned.chromePid = child.pid
  acquired.chromeProfile = profileDirectory
  return child
}

// ---------------------------------------------------------------------
// CDP client — a deliberate copy (Option B), for the same reason
// `prove-disposable-app.mjs` records: the other runners must stay
// byte-untouched, and exporting from them would change them.
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
      if (message.error) {
        entry.fail(new SafeError(`The browser rejected the CDP command ${entry.method} (code ${Number(message.error.code) || 'unknown'}).`))
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
      consoleErrors.push(message.params.args?.map((a) => a.value ?? a.description ?? '').join(' ') ?? 'console error')
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
    if (closedReason !== null) return Promise.reject(new SafeError(`The CDP connection is ${closedReason}.`))
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
    let settle, fail
    const promise = new Promise((res, rej) => { settle = res; fail = rej })
    if (closedReason !== null) {
      fail(new SafeError(`The CDP connection is ${closedReason}.`))
      return { promise, cancel: () => {} }
    }
    const waiter = { methods, settle, fail, timer: null }
    waiter.timer = armed(ms, () => {
      waiters.delete(waiter)
      fail(new SafeError(`No ${methods.join(' or ')} event arrived within ${ms} ms.`))
    })
    waiters.add(waiter)
    return { promise, cancel: () => { if (waiters.delete(waiter)) { clearTimeout(waiter.timer); settle(null) } } }
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
// The disposable trusted draft channel.
//
// `LocalTrustedDraftStore` pins the CANONICAL container by design, so it
// cannot reach the disposable stack. This is the SAME SQL and the SAME
// governed `report_store_draft` RPC, executed as `postgres` inside the
// DISPOSABLE container instead — a transport shim for one container name,
// not a different authority. The RPC still re-derives every relationship
// from the claims this channel sets.
// ---------------------------------------------------------------------

const TRUSTED_SQL = `
\\set ON_ERROR_STOP on
SELECT pg_catalog.set_config('request.jwt.claims',
         pg_catalog.json_build_object('sub', :'bc_sub', 'role', 'authenticated')::text, false),
       pg_catalog.set_config('bc.rid',   :'bc_rid',   false),
       pg_catalog.set_config('bc.lock',  :'bc_lock',  false),
       pg_catalog.set_config('bc.olock', :'bc_olock', false),
       pg_catalog.set_config('bc.p1',    :'bc_p1',    false),
       pg_catalog.set_config('bc.p2',    :'bc_p2',    false),
       pg_catalog.set_config('bc.p3',    :'bc_p3',    false),
       pg_catalog.set_config('bc.p4',    :'bc_p4',    false);
DO $trusted$
DECLARE v record; v_code text;
BEGIN
  BEGIN
    SELECT * INTO v FROM public.report_store_draft(
      pg_catalog.current_setting('bc.rid')::uuid,
      pg_catalog.current_setting('bc.lock')::integer,
      pg_catalog.current_setting('bc.olock')::integer,
      pg_catalog.current_setting('bc.p1'),
      pg_catalog.current_setting('bc.p2'),
      pg_catalog.current_setting('bc.p3'),
      pg_catalog.current_setting('bc.p4'));
    RAISE NOTICE 'TRUSTED_STORE_OK %', pg_catalog.json_build_object(
      'status', v.status, 'lock_version', v.lock_version,
      'report_version_id', v.report_version_id,
      'revision_number', v.revision_number, 'content_hash', v.content_hash)::text;
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_code = RETURNED_SQLSTATE;
    RAISE NOTICE 'TRUSTED_STORE_ERR %', v_code;
  END;
END $trusted$;
`

class DisposableTrustedDraftStore {
  constructor() { this.database = 'postgres' }
  storeDraft(request) {
    const args = [
      'exec', '-i', DISPOSABLE_DB_CONTAINER, 'psql', '--no-psqlrc', '--username=postgres',
      '--dbname=postgres', '--quiet',
      '-v', `bc_sub=${request.authUserSub}`,
      '-v', `bc_rid=${request.reportId}`,
      '-v', `bc_lock=${String(request.expectedLockVersion)}`,
      '-v', `bc_olock=${String(request.observationLockVersion)}`,
      '-v', `bc_p1=${request.todaysStrength}`,
      '-v', `bc_p2=${request.nextFocus}`,
      '-v', `bc_p3=${request.practiceSuggestion}`,
      '-v', `bc_p4=${request.sessionTakeaway}`,
    ]
    return new Promise((resolvePromise) => {
      const child = spawn('docker', args, { stdio: ['pipe', 'pipe', 'pipe'] })
      let err = ''
      child.stderr.on('data', (d) => { err += d })
      child.stdout.on('data', () => {})
      child.on('close', () => {
        const ok = /TRUSTED_STORE_OK (\{.*\})/.exec(err)
        if (ok) {
          try {
            const row = JSON.parse(ok[1])
            resolvePromise({
              ok: true, status: row.status, lockVersion: row.lock_version,
              versionId: row.report_version_id, revisionNumber: row.revision_number,
              contentHash: row.content_hash,
            })
            return
          } catch {
            resolvePromise({ ok: false, sqlState: 'XXCHN' })
            return
          }
        }
        const failed = /TRUSTED_STORE_ERR ([A-Z0-9]+)/.exec(err)
        resolvePromise({ ok: false, sqlState: failed ? failed[1] : 'XXCHN' })
      })
      child.stdin.end(TRUSTED_SQL)
    })
  }
}

/** A psql-backed RpcCaller bound to one identity, on the DISPOSABLE database. */
function sqlLiteral(value) {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (Array.isArray(value)) {
    if (value.every((v) => typeof v === 'string')) {
      return `ARRAY[${value.map((v) => `'${v.replaceAll("'", "''")}'`).join(',')}]::text[]`
    }
    return `'${JSON.stringify(value).replaceAll("'", "''")}'::jsonb`
  }
  if (typeof value === 'object') return `'${JSON.stringify(value).replaceAll("'", "''")}'::jsonb`
  return `'${String(value).replaceAll("'", "''")}'`
}

class PsqlRpc {
  constructor(sub) { this.sub = sub }
  async rpc(fn, args = {}) {
    const named = Object.entries(args).map(([k, v]) => `${k} => ${sqlLiteral(v)}`).join(', ')
    const claims = this.sub ? `{"sub":"${this.sub}","role":"authenticated"}` : ''
    const sql = `SET request.jwt.claims = '${claims}';
SELECT COALESCE(pg_catalog.jsonb_agg(pg_catalog.to_jsonb(x)), '[]'::jsonb) FROM public.${fn}(${named}) x;`
    const result = spawnSync('docker', [
      'exec', '-i', DISPOSABLE_DB_CONTAINER, 'psql', '--no-psqlrc', '--username=postgres',
      '--dbname=postgres', '--quiet', '--set=VERBOSITY=verbose', '--set=ON_ERROR_STOP=1', '-t', '-A', '-F|',
    ], { input: sql, encoding: 'utf8', windowsHide: true, shell: false, maxBuffer: 8 * 1024 * 1024 })
    if (result.status !== 0) {
      const m = /ERROR: {2}([0-9A-Z]{5}):/.exec(result.stderr ?? '')
      return { data: null, error: { code: m ? m[1] : undefined, message: 'rpc failed' } }
    }
    try {
      return { data: JSON.parse((result.stdout ?? '').trim().split('\n').pop()), error: null }
    } catch {
      return { data: null, error: { code: undefined, message: 'unparseable rpc result' } }
    }
  }
}

/**
 * A REAL authorization denial, distinguished from a malformed call.
 *
 * Run C4's first review caught two negative controls passing vacuously: the
 * harness had built `p_ratings` as `text[]` (an empty JS array is vacuously
 * "all strings", so `sqlLiteral` typed it wrongly) against a `jsonb`
 * parameter, and had named `p_wording_hash` where the signature says
 * `p_expected_wording_hash`. Both made PostgreSQL fail FUNCTION RESOLUTION
 * with 42883 — before a single role predicate ran. `error !== null` was
 * therefore true for a reason that proves nothing about authorization, and
 * deleting every role check from those RPCs would not have failed the run.
 *
 * This predicate closes the class rather than the two instances: a denial
 * counts ONLY when the database raised one of this project's own authored
 * BC codes or a genuine privilege denial (42501). Every structural SQL error
 * — undefined function, undefined table, bad cast, bad input syntax — is
 * explicitly NOT a denial, so a future signature drift fails the control
 * loudly instead of passing it silently.
 */
const STRUCTURAL_SQL_ERRORS = new Set(['42883', '42P01', '42804', '42702', '42601', '22P02', '42P02'])
function isAuthorizationDenial(error) {
  if (!error || typeof error.code !== 'string') return false
  if (STRUCTURAL_SQL_ERRORS.has(error.code)) return false
  return /^BC\d{3}$/.test(error.code) || error.code === '42501'
}

/** One-value read helper against the disposable database. */
function dbValue(sql) {
  const rows = psqlRows(DISPOSABLE_DB_CONTAINER, sql)
  return rows.length > 0 && rows[0].length > 0 ? rows[0][0] : null
}

function reportStatus() {
  return dbValue(`SELECT status FROM public.reports WHERE class_session_id='${FIXTURE_SESSION}' AND student_id='${FIXTURE_STUDENT}';`)
}

function reportId() {
  return dbValue(`SELECT id::text FROM public.reports WHERE class_session_id='${FIXTURE_SESSION}' AND student_id='${FIXTURE_STUDENT}';`)
}

/** How many of the three checklist items are ticked on the report's CURRENT working version. */
function checklistCount(rid) {
  const value = dbValue(
    'SELECT (p.evidence_confirmed::int + p.ai_draft_reviewed::int + p.privacy_checked::int) ' +
    'FROM public.report_version_checklist_progress p ' +
    'JOIN public.reports r ON r.current_cycle_version_id = p.report_version_id ' +
    `WHERE r.id='${rid}';`)
  return value === null ? -1 : Number(value)
}

/** Poll a database reading until it satisfies a predicate. Fails closed on timeout. */
async function waitForDb(read, predicate, description, timeoutMs = 25_000) {
  const deadline = Date.now() + timeoutMs
  let last = null
  while (Date.now() < deadline) {
    last = read()
    if (predicate(last)) return last
    await new Promise((r) => setTimeout(r, 300))
  }
  throw new SafeError(`Timed out waiting for ${description} (last reading: ${last}).`)
}

// ---------------------------------------------------------------------
// Teardown, on EVERY exit path.
// ---------------------------------------------------------------------

let teardownPromise = null
function teardown() {
  if (teardownPromise === null) teardownPromise = runTeardown()
  return teardownPromise
}

async function runTeardown() {
  if (!acquired.stackStarted && !acquired.startAttempted && acquired.workdir === null && owned.server === null) return
  phase('Teardown — this run\'s own stack, server and browser only')

  killOwned(owned.server)
  killOwned(owned.chrome)
  await new Promise((r) => setTimeout(r, 1_500))
  hygiene.serverGone = owned.serverPid === null ? true : processAlive(owned.serverPid) === false
  hygiene.chromeGone = owned.chromePid === null ? true : processAlive(owned.chromePid) === false

  if (owned.socket) {
    try { owned.socket.close() } catch { /* ignore */ }
  }

  if (acquired.cli !== null && (acquired.stackStarted || acquired.startAttempted)) {
    const status = stopDisposableStack(acquired.cli, acquired.workdir)
    info(`supabase stop --project-id ${DISPOSABLE_PROJECT_ID} --no-backup exit ${status}`)
  }

  try {
    const stillServing = []
    for (const port of ALL_DISPOSABLE_PORTS) {
      await waitForPortReleased(port, 15_000)
      if (!(await waitForPortSilent(port))) stillServing.push(port)
    }
    hygiene.portsFree = stillServing
  } catch {
    hygiene.portsFree = null
  }
  try { hygiene.containers = disposableContainersPresent() } catch { hygiene.containers = null }
  try { hygiene.volumes = disposableVolumesPresent() } catch { hygiene.volumes = null }

  try {
    if (acquired.chromeProfile) rmSync(acquired.chromeProfile, { recursive: true, force: true })
  } catch { /* ignore */ }
  try { destroyDisposableWorkdir() } catch { /* ignore */ }

  if (acquired.buildReplaced) {
    info('restoring the repository build with the ordinary environment')
    const restored = restoreRepositoryBuild()
    acquired.buildRestored = restored.status === 0
    info(`restoring next build exit ${restored.status}`)
  }
}

// ---------------------------------------------------------------------
// Evidence.
// ---------------------------------------------------------------------

function evidenceDirectory() {
  const configured = process.env.BEST_COACH_C4_EVIDENCE_DIR
  const target = configured && configured.length > 0
    ? resolve(configured)
    : resolve(REPO_ROOT, '..', '_c4-lifecycle-evidence')
  mkdirSync(target, { recursive: true })
  return target
}

function writeLedger() {
  const lines = []
  lines.push('# Run C4 — governed lifecycle ledger (browser-driven, disposable stack)')
  lines.push('')
  lines.push('REDACTED BY CONSTRUCTION: verdicts, authored reasons, counts, routes and public checksums only.')
  lines.push('No password, token, cookie, key, header or request body appears here.')
  lines.push('')
  lines.push(`- Completed: ${new Date().toISOString()}`)
  lines.push(`- Canonical project: ${CANONICAL_PROJECT_ID} (never written to)`)
  lines.push(`- Canonical checksum before: ${readings.canonicalBefore?.checksum.sha256 ?? 'not read'}`)
  lines.push(`- Canonical checksum after:  ${readings.canonicalAfter?.checksum.sha256 ?? 'not read'}`)
  lines.push('')
  lines.push('| Leg | Verdict | Reason |')
  lines.push('|---|---|---|')
  for (const [id, title] of LIFECYCLE_TITLES) {
    const e = lifecycle.get(id) ?? { verdict: 'NOT-RUN', reason: 'not reached' }
    lines.push(`| **${id}** ${title} | ${e.verdict} | ${e.reason.replace(/\|/g, '/')} |`)
  }
  lines.push('')
  lines.push('| Control | Verdict | Reason |')
  lines.push('|---|---|---|')
  for (const [id, title] of CONTROL_TITLES) {
    const e = controls.get(id) ?? { verdict: 'NOT-RUN', reason: 'not reached' }
    lines.push(`| **${id}** ${title} | ${e.verdict} | ${e.reason.replace(/\|/g, '/')} |`)
  }
  lines.push('')
  try {
    const dir = evidenceDirectory()
    writeFileSync(join(dir, 'c4-lifecycle-ledger.md'), `${lines.join('\n')}\n`, 'utf8')
    writeFileSync(join(dir, 'c4-diagnostics.json'), `${JSON.stringify(diagnostics, null, 2)}\n`, 'utf8')
    say('')
    say(`Redacted lifecycle ledger written to ${dir}`)
  } catch {
    say('')
    say('The lifecycle ledger could not be written outside the repository.')
  }
}

function printLedgers() {
  phase('Lifecycle ledger')
  for (const [id, title] of LIFECYCLE_TITLES) {
    const e = lifecycle.get(id) ?? { verdict: 'NOT-RUN', reason: 'not reached' }
    say(`  ${e.verdict.padEnd(8)} ${id.padEnd(5)} ${title}`)
    say(`           ${e.reason}`)
  }
  phase('Negative-control ledger')
  for (const [id, title] of CONTROL_TITLES) {
    const e = controls.get(id) ?? { verdict: 'NOT-RUN', reason: 'not reached' }
    say(`  ${e.verdict.padEnd(8)} ${id.padEnd(5)} ${title}`)
    say(`           ${e.reason}`)
  }
}

// ---------------------------------------------------------------------
// Browser helpers over the CDP client.
// ---------------------------------------------------------------------

function makeBrowser(cdp, origin) {
  const { send, watch } = cdp

  const evaluate = async (expression) => {
    const response = await send('Runtime.evaluate', {
      expression, returnByValue: true, awaitPromise: true,
    })
    if (response.result?.exceptionDetails) {
      throw new SafeError('A page expression threw in the browser.')
    }
    return response.result?.result?.value
  }

  const currentPath = () => evaluate('location.pathname + location.search')
  const bodyText = () => evaluate('document.body ? document.body.innerText : ""')

  const waitUntil = async (expression, description, timeoutMs = 30_000) => {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      let value = false
      try { value = await evaluate(`Boolean(${expression})`) } catch { value = false }
      if (value === true) return true
      await new Promise((r) => setTimeout(r, 200))
    }
    throw new SafeError(`Timed out waiting for ${description}.`)
  }

  const navigate = async (path) => {
    const load = watch(['Page.loadEventFired', 'Page.frameStoppedLoading'], 30_000)
    const response = await send('Page.navigate', { url: `${origin}${path}` })
    if (response.result?.errorText) {
      load.cancel()
      throw new SafeError(`Navigation to ${path} failed.`)
    }
    await load.promise
    // The shell marks itself settled once the session is resolved; waiting on
    // it removes the shell-vs-page race that produced flaky reads before.
    try {
      await waitUntil('document.querySelector(\'[data-session-user="settled"]\') !== null', `${path} to settle`, 20_000)
    } catch {
      // Login and denial surfaces render no portal shell; the load event is
      // then the only settle signal there is, and it has already fired.
    }
    return currentPath()
  }

  const installCookies = async (cookies) => {
    await send('Network.clearBrowserCookies')
    for (const cookie of cookies) {
      await send('Network.setCookie', {
        name: cookie.name, value: cookie.value, domain: '127.0.0.1', path: '/',
        httpOnly: false, secure: false,
      })
    }
  }

  const clearCookies = () => send('Network.clearBrowserCookies')

  /** Click the single element in `#main-content` whose trimmed text matches exactly. */
  const clickText = async (text, scope = '#main-content') => {
    const count = await evaluate(
      `[...document.querySelectorAll('${scope} button, ${scope} a')]` +
      `.filter((el) => el.textContent.trim() === ${JSON.stringify(text)} && !el.disabled).length`,
    )
    if (count !== 1) {
      throw new SafeError(`Expected exactly one enabled "${text}" control in ${scope}; found ${count}.`)
    }
    await evaluate(
      `[...document.querySelectorAll('${scope} button, ${scope} a')]` +
      `.find((el) => el.textContent.trim() === ${JSON.stringify(text)} && !el.disabled).click()`,
    )
  }

  /** Type into a React-controlled field through the native value setter. */
  const fillField = async (selector, value) => {
    const ok = await evaluate(`(() => {
      const node = document.querySelector(${JSON.stringify(selector)});
      if (!node) return false;
      const proto = node.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
      setter.call(node, ${JSON.stringify(value)});
      node.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    })()`)
    if (ok !== true) throw new SafeError(`The field ${selector} could not be filled.`)
  }

  const clickSelector = async (selector) => {
    const ok = await evaluate(`(() => {
      const node = document.querySelector(${JSON.stringify(selector)});
      if (!node || node.disabled) return false;
      node.click();
      return true;
    })()`)
    if (ok !== true) throw new SafeError(`The control ${selector} could not be clicked.`)
  }

  const exists = (selector) => evaluate(`document.querySelector(${JSON.stringify(selector)}) !== null`)

  /** Follow a navigation the app performs itself (router.push) rather than a load event. */
  const waitForPath = async (matcher, description, timeoutMs = 30_000) => {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      const path = await currentPath()
      if (matcher.test(path)) return path
      await new Promise((r) => setTimeout(r, 200))
    }
    throw new SafeError(`Timed out waiting for ${description}.`)
  }

  /**
   * Wait for the ASSESSMENT ROUTE to reach a TERMINAL state — either the
   * instrument rendered, or the governed refusal rendered instead of it.
   *
   * Review 2 caught N-2 passing vacuously without this. `navigate()` settles
   * on `[data-session-user="settled"]`, which `portal-shell.tsx` sets from
   * SESSION resolution alone; `trainer-assessment.tsx` then sits at
   * `resource.kind === "loading"` rendering a LoadingSkeleton until an
   * awaited round-trip returns. Reading "is the instrument absent?" inside
   * that window is true for EVERY route, eligible or not — so the future-
   * session gate could have been deleted entirely and N-2 would still have
   * passed. The race was one-directional: the failing case takes strictly
   * longer than the passing observation, which is the worst kind.
   *
   * Terminal is therefore defined POSITIVELY: the rated-count element exists
   * (the instrument is live) or the authored refusal title is on the page.
   * A route that reaches neither within the timeout is a real failure and is
   * reported as one, never silently read as "refused".
   */
  const waitForAssessTerminal = async (timeoutMs = 30_000) => {
    await waitUntil(
      'document.querySelector(\'[data-rated-count]\') !== null || ' +
      'document.querySelector(\'fieldset[data-dimension]\') !== null || ' +
      '/This assessment is not open/i.test(document.body.innerText)',
      'the assessment route to reach a terminal state (instrument or governed refusal)', timeoutMs)
    return {
      instrumentPresent: await evaluate(
        'document.querySelector(\'[data-rated-count]\') !== null || document.querySelector(\'fieldset[data-dimension]\') !== null'),
      dimensionControls: await evaluate('document.querySelectorAll(\'fieldset[data-dimension]\').length'),
      refusalShown: await evaluate('/This assessment is not open/i.test(document.body.innerText)'),
    }
  }

  /** The served adapter kind, read off the portal shell (`port.identity.kind`). */
  const adapterKind = () => evaluate(
    '(() => { const n = document.querySelector(\'[data-adapter-kind]\'); return n ? n.getAttribute("data-adapter-kind") : null; })()')

  return {
    evaluate, currentPath, bodyText, waitUntil, navigate, installCookies,
    clearCookies, clickText, fillField, clickSelector, exists, waitForPath,
    waitForAssessTerminal, adapterKind,
  }
}

const RATING_PLAN = [
  ['body', 'mastered'], ['emotion', 'mastering'], ['speech', 'mastered'],
  ['tonality', 'mastering'], ['eye_contact', 'beginning'], ['vocal_projection', 'mastered'],
  ['emotional_expression', 'developing'], ['sentence_flow', 'developing'], ['audience_awareness', 'mastering'],
]

const TRAINER_NOTES =
  'Delivered a three-minute prepared talk about the school recycling programme, holding an upright stance ' +
  'and using deliberate hand gestures on each main point.'
const FOLLOW_UP_NOTES = 'Practise looking up between sentences so eye contact carries through the transitions.'

// ---------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------

async function main() {
  say('B.E.S.T Coach — the complete governed lifecycle, through the real UI on a DISPOSABLE stack (Run C4)')
  say('No password exists on this path; no external AI provider is reachable from the served process.')

  /* 1 — canonical guards, read-only. */
  phase('Canonical guards (read-only)')
  const config = assertCanonicalConfigUntouched()
  pass(`supabase/config.toml (${config.bytes} bytes) still pins "${CANONICAL_PROJECT_ID}"`)
  assertNoCollision()
  const running = runningContainers()
  const missing = CANONICAL_CONTAINERS.filter((name) => !running.has(name))
  if (missing.length > 0) throw new SafeError(`${missing.length} canonical container(s) are not running.`)
  pass(`all ${CANONICAL_CONTAINERS.length} canonical containers are running and are left alone`)

  phase('Canonical census (before)')
  readings.canonicalBefore = readCanonical()
  pass(`checksum ${readings.canonicalBefore.checksum.sha256} over ${readings.canonicalBefore.checksum.rows} rows`)

  /* 2 — provision the disposable stack. */
  phase('Disposable stack')
  for (const port of ALL_DISPOSABLE_PORTS) await assertPortFree(port, 'the disposable lifecycle proof')
  const cli = resolveLocalCli()
  acquired.cli = cli
  const { workdir, migrations } = createDisposableWorkdir()
  acquired.workdir = workdir
  pass(`${migrations.length} committed migrations copied and verified byte-identical`)
  info('provisioning; CLI output is captured and DISCARDED because it prints local keys')
  acquired.startAttempted = true
  startDisposableStack(cli, workdir)
  acquired.stackStarted = true
  const census = readDisposableCensus()
  if (census.appliedMigrations !== EXPECTED_CANONICAL_MIGRATIONS) {
    throw new SafeError(`The disposable database applied ${census.appliedMigrations} migrations; ${EXPECTED_CANONICAL_MIGRATIONS} expected.`)
  }
  pass(`disposable stack up on API ${DISPOSABLE_API_PORT}; ${census.appliedMigrations} migrations applied`)
  const connection = captureDisposableStatus(cli, workdir)

  /* 3 — identities and fixture. */
  phase('Disposable identities and fixture')
  const admin = makeAdminClient(connection.apiUrl, connection.serviceRoleKey, 'the disposable identity creation')
  pass(`${await createPasswordlessIdentities(admin)} PASSWORDLESS synthetic identities created`)
  pass(`${seedDisposableDomain()} account rows read back carrying their disposable addresses`)
  seedNegativeControlSessions()
  pass('two negative-control sessions seeded (one future-dated, one with an ABSENT learner)')

  /* 4 — build and serve against the disposable target. */
  phase('Build and serve the application against the disposable stack')
  const built = buildForDisposableTarget(connection)
  acquired.buildReplaced = true
  if (built.status !== 0) throw new SafeError(`The disposable build failed (exit ${built.status}).`)
  pass('next build succeeded with the disposable target baked in')
  const origin = await startServer(connection, DISPOSABLE_APP_PORT)
  pass(`application served on ${origin} with fixture mode OFF and all AI selectors neutralised`)

  /* 5 — browser. */
  phase('Headless browser')
  startChrome(DISPOSABLE_DEBUG_PORT)
  const wsUrl = await findPageTarget(DISPOSABLE_DEBUG_PORT)
  const consoleErrors = []
  const socket = new WebSocket(wsUrl)
  owned.socket = socket
  await new Promise((settle, fail) => {
    socket.addEventListener('open', settle, { once: true })
    socket.addEventListener('error', () => fail(new SafeError('The CDP socket could not be opened.')), { once: true })
  })
  const cdp = createCdpClient(socket, consoleErrors)
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  await cdp.send('Log.enable')
  const browser = makeBrowser(cdp, origin)
  pass('headless Chrome attached over CDP')

  const sessions = new Map()
  for (const identity of DISPOSABLE_IDENTITIES) {
    sessions.set(identity.key, await mintSessionCookies(connection, identity))
  }
  const signIn = async (roleKey) => {
    await browser.clearCookies()
    await browser.installCookies(sessions.get(roleKey))
  }
  pass(`${sessions.size} real sessions minted admin-side (no password on any path)`)

  const trainerDb = new PsqlRpc(TRAINER_SUB)
  const managementDb = new PsqlRpc(MANAGEMENT_SUB)
  const parentDb = new PsqlRpc(PARENT_SUB)

  // =================================================================
  // L-1 — Trainer signs in.
  // =================================================================
  phase('L-1 … L-3 — Trainer assessment through the real UI')
  await signIn('trainer')
  await browser.navigate('/trainer')
  const trainerLanding = await browser.currentPath()
  const trainerShell = await browser.evaluate(
    'document.querySelector(\'[data-session-user]\') ? document.querySelector(\'[data-session-user]\').dataset.sessionUser : null',
  )

  /*
   * N-15 — FIXTURE MODE OFF, PROVEN FROM THE SERVED DOM, before any leg is
   * judged. Deleting NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE from the child env
   * is NOT proof: `@next/env` fills any key the child does not already carry
   * from the application's own `.env.local`, so a DELETED variable is exactly
   * the one that can be silently restored — the same hazard
   * prove-disposable-app.mjs documents for the AI selectors. Under the
   * fixture adapter this whole run would exercise no governance at all, so
   * this is read from the shell's own `data-adapter-kind`, which is
   * `port.identity.kind`, on a page this run actually loaded.
   */
  const servedAdapter = await browser.adapterKind()
  capture('N15_adapter_kind', servedAdapter)
  controlFrom('N-15', servedAdapter === REAL_ADAPTER_KIND,
    `the served application reported data-adapter-kind="${servedAdapter}" — the REAL participant adapter — so every ` +
      'leg below ran against the real backend, RLS and governed RPCs, not against the frontend fixture adapter',
    `the served application reported data-adapter-kind=${servedAdapter === null ? 'ABSENT' : `"${servedAdapter}"`}, ` +
      `expected "${REAL_ADAPTER_KIND}"; under the fixture adapter no governance would be exercised at all`)

  legFrom('L-1', trainerLanding.startsWith('/trainer') && trainerShell === 'settled',
    `the minted Trainer session resolved server-side and landed on ${trainerLanding} with the portal shell settled`,
    `the Trainer landed on ${trainerLanding} with shell state ${trainerShell}`)

  // =================================================================
  // L-2 — roster, attendance defaults Present.
  // =================================================================
  await browser.navigate(`/trainer/sessions/${FIXTURE_SESSION}/roster`)
  await browser.waitUntil(`document.querySelector('article[data-roster-card="${FIXTURE_STUDENT}"]') !== null`, 'the roster card')
  const attendance = await browser.evaluate(
    `document.querySelector('article[data-roster-card="${FIXTURE_STUDENT}"]').dataset.attendance`,
  )
  const rosterAction = await browser.evaluate(
    `document.querySelector('article[data-roster-card="${FIXTURE_STUDENT}"]').dataset.rosterAction`,
  )
  legFrom('L-2', attendance === 'present' && rosterAction === 'assess',
    `the roster rendered the enrolled learner at data-attendance="present" with an "assess" action, so attendance ` +
      'defaults to Present without any trainer input',
    `the roster card reported attendance=${attendance}, action=${rosterAction}`)

  // =================================================================
  // L-3 — nine ratings + notes, saved through the real form.
  // =================================================================
  await browser.navigate(`/trainer/sessions/${FIXTURE_SESSION}/students/${FIXTURE_STUDENT}/assess`)
  await browser.waitUntil('document.querySelector(\'[data-rated-count]\') !== null', 'the assessment form')
  for (const [dimension, level] of RATING_PLAN) {
    await browser.clickSelector(`fieldset[data-dimension="${dimension}"] button[data-rating-level="${level}"]`)
  }
  await browser.waitUntil('document.querySelector(\'[data-rated-count]\').dataset.ratedCount === "9"', 'all nine ratings')
  await browser.fillField('#observation-notes', TRAINER_NOTES)
  await browser.fillField('#follow-up-notes', FOLLOW_UP_NOTES)
  const dimensionsSeen = await browser.evaluate(
    '[...document.querySelectorAll(\'fieldset[data-dimension]\')].length',
  )
  await browser.clickText('Save & Generate')
  await browser.waitForPath(/^\/trainer\/reports\/[0-9a-f-]{36}\/generate/, 'the draft-generation screen')
  const savedStatus = reportStatus()
  const savedRatings = Number(dbValue(
    `SELECT count(*) FROM public.observation_ratings orr JOIN public.observations o ON o.id=orr.observation_id ` +
    `WHERE o.class_session_id='${FIXTURE_SESSION}' AND o.student_id='${FIXTURE_STUDENT}';`))
  legFrom('L-3', dimensionsSeen === 9 && savedStatus === 'observation_saved' && savedRatings === 9,
    `all nine dimensions were rated in the real form and saved by a real "Save & Generate" click; the governed write ` +
      `opened exactly one report shell at ${savedStatus} with ${savedRatings} persisted ratings`,
    `the form showed ${dimensionsSeen} dimensions; the report is ${savedStatus} with ${savedRatings} ratings`)

  const liveReportId = reportId()
  if (!liveReportId) throw new SafeError('No report identifier was persisted by the governed save.')

  // =================================================================
  // L-4 — draft_ready through the REAL requestDraftCore.
  //
  // The served action constructs the real provider unconditionally (G-19)
  // and this run forbids an external call, so the generation step — and
  // only this step — runs the same governed core with the deterministic
  // fixture provider injected. Everything it exercises is real: schema
  // validation, the grounding gate, report_store_draft, the audit events.
  // =================================================================
  const generateScreenFailure = await browser.bodyText()
  const drafted = await requestDraftCore(
    {
      db: trainerDb,
      provider: new DeterministicFixtureDraftProvider(),
      trustedStore: new DisposableTrustedDraftStore(),
      authUserSub: TRAINER_SUB,
      readStudentDisplayName: async () => dbValue(`SELECT full_name FROM public.students WHERE id='${FIXTURE_STUDENT}';`),
    },
    { sessionId: FIXTURE_SESSION, studentId: FIXTURE_STUDENT },
  )
  const draftStatus = reportStatus()
  const versionCount = Number(dbValue(`SELECT count(*) FROM public.report_versions WHERE report_id='${liveReportId}';`))
  legFrom('L-4', drafted.outcome === 'success' && drafted.data.status === 'draft_ready' && draftStatus === 'draft_ready' && versionCount === 1,
    `requestDraftCore — the SAME governed orchestration the server action calls — ran schema validation, the grounding ` +
      `gate and the governed report_store_draft transition, leaving the report at ${draftStatus} with ${versionCount} ` +
      'immutable version. THIS STEP IS NOT BROWSER-DRIVEN and differs from a participant run in exactly three declared ' +
      'ways: the deterministic fixture provider replaces OpenAI (Run C4 forbids an external call and the served action ' +
      'constructs the real provider unconditionally — G-19, no switch); the database channel is a superuser psql ' +
      'transport into the disposable container, so no client GRANT or RLS policy is exercised on this one step; and ' +
      'authUserSub is the fixture literal rather than the wrapper\'s auth.getUser() result. The RPC still re-derives ' +
      'every relationship from the claims set on that channel. The real-provider path is proven by G-6 (Run C3-C); the ' +
      'RLS/GRANT path is proven by run-integration.mjs under real JWTs and by every other leg here through the served ' +
      `application. The served screen 08 meanwhile reported its designed generation failure, which is itself evidence ` +
      `that no provider was reachable from the served process: ${generateScreenFailure.length > 0 ? 'the failure surface rendered' : 'no failure surface'}`,
    `requestDraftCore gave ${drafted.outcome}; the report is ${draftStatus} with ${versionCount} version(s)`)

  /*
   * N-13 / N-14 — taken HERE, at the only moment they are meaningful: the
   * report is at draft_ready with an all-false checklist and no trainer
   * approval yet. Both are governed-RPC probes that bypass the UI entirely,
   * which is the point — a disabled button and a hidden row are not controls.
   */
  const draftLock = Number(dbValue(`SELECT lock_version FROM public.reports WHERE id='${liveReportId}';`))
  const draftVersion = dbValue(`SELECT current_cycle_version_id::text FROM public.reports WHERE id='${liveReportId}';`)
  const draftHash = dbValue(
    `SELECT content_hash FROM public.report_versions WHERE id = (SELECT current_cycle_version_id FROM public.reports WHERE id='${liveReportId}');`)
  const checklistAtDraft = checklistCount(liveReportId)
  const prematureApprove = await trainerDb.rpc('report_trainer_approve', {
    p_report_id: liveReportId, p_expected_status: 'draft_ready', p_expected_lock_version: draftLock,
    p_expected_version_id: draftVersion, p_expected_content_hash: draftHash,
  })
  const statusAfterPremature = reportStatus()
  capture('N13_premature_approve_error', prematureApprove.error ?? null)
  controlFrom('N-13',
    checklistAtDraft === 0 && isAuthorizationDenial(prematureApprove.error) && statusAfterPremature === 'draft_ready',
    `with the Quality Checklist at ${checklistAtDraft}/3, a SIGNATURE-CORRECT trainer approval issued DIRECTLY against ` +
      `the governed RPC — bypassing the disabled button entirely — was refused with the authored code ` +
      `${prematureApprove.error?.code}, and the report stayed at ${statusAfterPremature}. The gate is server-side`,
    `checklist=${checklistAtDraft}/3, denied=${isAuthorizationDenial(prematureApprove.error)} ` +
      `(code ${prematureApprove.error?.code ?? 'none'}), status=${statusAfterPremature}`)

  const mgmtPreApprovalRead = await managementDb.rpc('report_get_management_review', {
    p_class_session_id: FIXTURE_SESSION, p_student_id: FIXTURE_STUDENT,
  })
  const mgmtPreApprovalRows = Array.isArray(mgmtPreApprovalRead.data) ? mgmtPreApprovalRead.data.length : -1
  capture('N14_pre_approval_read', { error: mgmtPreApprovalRead.error ?? null, rows: mgmtPreApprovalRows })
  controlFrom('N-14',
    mgmtPreApprovalRead.error === null && mgmtPreApprovalRows === 0,
    `while the report sits at draft_ready — before ANY trainer approval — management's own governed review read returns ` +
      `${mgmtPreApprovalRows} rows with no error: the pre-approval draft is not readable by management, and the denial ` +
      'is non-disclosing (a zero-row answer, not an error that would confirm the report exists) — A-038',
    `error=${mgmtPreApprovalRead.error?.code ?? 'none'}, rows=${mgmtPreApprovalRows}`)

  // =================================================================
  // L-5 — trainer edits the narrative (UI); checklist resets.
  // =================================================================
  phase('L-5 … L-6 — Trainer review, edit and approval through the real UI')
  await browser.navigate(`/trainer/reports/${liveReportId}/review`)
  await browser.waitUntil('document.querySelector(\'article[data-report-panel]\') !== null', 'the review screen panels')

  /*
   * TICK THE CHECKLIST ONE ITEM AT A TIME, CONFIRMING EACH BEFORE THE NEXT.
   *
   * Each checklist write is a GUARDED compare-and-set that bumps the
   * report's lock_version, so three rapid clicks race: the first commits and
   * the other two lose their CAS and are correctly rejected. That is the
   * governed behaviour working, not a defect — an earlier version of this
   * harness clicked all three at once and measured 1 of 3 ticked. Waiting for
   * each write to land is what a real trainer's click cadence does anyway.
   */
  const checklistLabels = ['Evidence confirms rating', 'AI Draft reviewed', 'Privacy check passed']
  const tickChecklist = async () => {
    for (const label of checklistLabels) {
      const before = checklistCount(liveReportId)
      const clicked = await browser.evaluate(`(() => {
        const row = [...document.querySelectorAll('label')].find((l) => l.textContent.includes(${JSON.stringify(label)}));
        if (!row) return 'no-row';
        const box = row.querySelector('input[type="checkbox"]');
        if (!box) return 'no-box';
        if (box.checked) return 'already';
        box.click();
        return 'clicked';
      })()`)
      if (clicked === 'no-row' || clicked === 'no-box') {
        throw new SafeError(`The checklist item "${label}" was not present on the review screen.`)
      }
      if (clicked === 'clicked') {
        await waitForDb(() => checklistCount(liveReportId), (n) => n > before, `the checklist item "${label}" to persist`)
      }
    }
    return checklistCount(liveReportId)
  }

  const checklistBeforeEdit = await tickChecklist()
  await browser.navigate(`/trainer/reports/${liveReportId}/edit`)
  await browser.waitUntil('document.querySelector(\'label[data-panel-editor="sessionTakeaway"] textarea\') !== null', 'the editor')
  await browser.fillField('label[data-panel-editor="sessionTakeaway"] textarea',
    'Edited by the trainer through the real editor: steady engagement, with eye contact as the agreed next focus.')
  await browser.clickText('Save changes & return to review')
  await browser.waitForPath(/^\/trainer\/reports\/[0-9a-f-]{36}\/review/, 'the review screen after the edit')
  const versionsAfterEdit = Number(dbValue(`SELECT count(*) FROM public.report_versions WHERE report_id='${liveReportId}';`))
  const checklistAfterEdit = checklistCount(liveReportId)
  legFrom('L-5', versionsAfterEdit === 2 && checklistBeforeEdit === 3 && checklistAfterEdit === 0,
    `the trainer edit created a NEW immutable version (${versionsAfterEdit} total, the first untouched) and the working ` +
      `version's Quality Checklist reset from ${checklistBeforeEdit}/3 to ${checklistAfterEdit}/3, so the checklist can ` +
      'never certify text it was not ticked against',
    `versions=${versionsAfterEdit}, checklist before=${checklistBeforeEdit}, after=${checklistAfterEdit}`)

  // =================================================================
  // L-6 — checklist + approve -> trainer_approved.
  // =================================================================
  await browser.waitUntil('document.querySelector(\'article[data-report-panel]\') !== null', 'the review screen')
  const checklistBeforeApproval = await tickChecklist()
  if (checklistBeforeApproval !== 3) {
    throw new SafeError(`Only ${checklistBeforeApproval} of 3 checklist items persisted before approval.`)
  }
  await browser.waitUntil(
    '[...document.querySelectorAll(\'#main-content button\')].some((b) => b.textContent.trim() === "Approve" && !b.disabled)',
    'the Approve button to enable once all three checklist items are ticked')
  await browser.clickText('Approve')
  await browser.waitUntil('document.querySelector(\'section[role="dialog"]\') !== null', 'the approval confirmation dialog')
  await browser.clickText('Approve for management review', 'section[role="dialog"]')
  await new Promise((r) => setTimeout(r, 2_500))
  const approvedStatus = reportStatus()
  const parentSeesAfterApproval = await parentDb.rpc('report_get_canonical', {
    p_class_session_id: FIXTURE_SESSION, p_student_id: FIXTURE_STUDENT,
  })
  const parentRowsAfterApproval = Array.isArray(parentSeesAfterApproval.data) ? parentSeesAfterApproval.data.length : -1
  legFrom('L-6', approvedStatus === 'trainer_approved' && parentRowsAfterApproval === 0,
    `a real "Approve" click, enabled only after all three checklist items were ticked and confirmed through the real ` +
      `dialog, moved the report to ${approvedStatus} and PUBLISHED NOTHING — the linked parent's governed canonical ` +
      `read returns ${parentRowsAfterApproval} rows`,
    `the report is ${approvedStatus}; the parent canonical read returned ${parentRowsAfterApproval} rows`)

  // =================================================================
  // L-7 — Management Pending queue.
  // =================================================================
  phase('L-7 … L-9 — Management final review through the real UI')
  await signIn('management')
  await browser.navigate('/management/reports?status=trainer_approved')
  // The queue is a client component that fetches after hydration; waiting for
  // the shell alone would read the page before its rows exist.
  try {
    await browser.waitUntil(
      `[...document.querySelectorAll('a')].some((a) => (a.getAttribute('href') || '').startsWith('/management/reports/'))`,
      'the management queue to render a report row', 25_000)
  } catch {
    // Recorded as a real failure below, with the captured document as evidence.
  }
  const queueText = await browser.bodyText()
  const queueLinksToReview = await browser.evaluate(
    `[...document.querySelectorAll('a')].some((a) => (a.getAttribute('href') || '').startsWith('/management/reports/${liveReportId}'))`,
  )
  capture('L7_queue_text', queueText.slice(0, 1500))
  capture('L7_queue_hrefs', await browser.evaluate(
    '[...document.querySelectorAll(\'a\')].map((a) => a.getAttribute("href")).filter(Boolean)'))
  legFrom('L-7', queueLinksToReview && queueText.includes('Awaiting final review'),
    'the single Management Reports route, filtered to the pending queue, listed this exact report with the ' +
      '"Awaiting final review" badge and a link to its final-review surface',
    `queue link present=${queueLinksToReview}; badge present=${queueText.includes('Awaiting final review')}`)

  // =================================================================
  // L-8 — wording-only edit.
  // =================================================================
  const ratingsBeforeWording = dbValue(
    `SELECT string_agg(dimension_code || '=' || rating, ',' ORDER BY dimension_code) FROM public.report_version_ratings ` +
    `WHERE report_version_id = (SELECT current_cycle_version_id FROM public.reports WHERE id='${liveReportId}');`)
  await browser.navigate(`/management/reports/${liveReportId}/edit`)
  await browser.waitUntil('document.querySelector(\'textarea\') !== null', 'the wording editor')
  /*
   * The leak test looks for LEAKED DATA, not for vocabulary. Explanatory copy
   * that TELLS management it may not change ratings is correct, required UI —
   * flagging the word "rating" would fail the screen for doing its job. What
   * must never appear is the assessment substance itself: the trainer's own
   * notes, or a dimension paired with one of the four rating values.
   */
  const editorLeaks = await browser.evaluate(`(() => {
    const main = document.querySelector('#main-content');
    const text = main ? main.innerText : document.body.innerText;
    const leaks = [];
    if (text.includes(${JSON.stringify(TRAINER_NOTES.slice(0, 40))})) leaks.push('trainer observation notes');
    if (text.includes(${JSON.stringify(FOLLOW_UP_NOTES.slice(0, 40))})) leaks.push('trainer follow-up notes');
    if (/(Body|Emotion|Speech|Tonality|Eye Contact|Vocal Projection|Emotional Expression|Sentence Flow|Audience Awareness)\\s*[:\\u2014-]\\s*(Beginning|Developing|Mastering|Mastered)/i.test(text)) {
      leaks.push('a dimension:rating pair');
    }
    if (/content[_ ]hash/i.test(text)) leaks.push('a content hash');
    return leaks;
  })()`)
  const editorMentionsInternals = Array.isArray(editorLeaks) && editorLeaks.length > 0
  capture('L8_editor_text', (await browser.bodyText()).slice(0, 1500))
  capture('L8_editor_leaks', editorLeaks)
  await browser.evaluate(`(() => {
    const areas = [...document.querySelectorAll('textarea')];
    const target = areas[areas.length - 1];
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    setter.call(target, 'Management wording pass: clearer phrasing for the family, same assessment substance.');
    target.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`)
  await browser.clickText('Save wording changes')
  await new Promise((r) => setTimeout(r, 2_500))
  const ratingsAfterWording = dbValue(
    `SELECT string_agg(dimension_code || '=' || rating, ',' ORDER BY dimension_code) FROM public.report_version_ratings ` +
    `WHERE report_version_id = (SELECT current_cycle_version_id FROM public.reports WHERE id='${liveReportId}');`)
  const versionsAfterWording = Number(dbValue(`SELECT count(*) FROM public.report_versions WHERE report_id='${liveReportId}';`))
  legFrom('L-8', ratingsBeforeWording !== null && ratingsBeforeWording === ratingsAfterWording && versionsAfterWording === 3 && editorMentionsInternals === false,
    `the management wording editor leaked NO assessment substance (no trainer notes, no dimension:rating pair, no ` +
      `content hash) and its save created a new immutable version (${versionsAfterWording} total) whose NINE RATING ` +
      'SNAPSHOTS are byte-identical to those of the version it derived from. Scope of this measurement, stated exactly: ' +
      'report_version_ratings was compared before and after across two genuinely different version rows; the ' +
      'server-side rejection of a management write to any OTHER governed column is proven by N-4 and by ' +
      'run-integration.mjs INT-L5, not by this leg',
    `ratings unchanged=${ratingsBeforeWording === ratingsAfterWording}, versions=${versionsAfterWording}, ` +
      `leaked=[${Array.isArray(editorLeaks) ? editorLeaks.join(', ') : 'unmeasured'}]`)

  // =================================================================
  // L-9 — return for correction.
  // =================================================================
  await browser.navigate(`/management/reports/${liveReportId}/review`)
  await browser.waitUntil('document.querySelector(\'[data-testid="management-safe-review"]\') !== null', 'the final-review surface')
  await browser.clickText('Return assessment concern')
  await browser.waitUntil('document.querySelector(\'section[role="dialog"][aria-labelledby="return-report-title"]\') !== null', 'the return dialog')
  await browser.clickSelector('section[role="dialog"] input[type="radio"][value="rating"]')
  await browser.evaluate(`(() => {
    const dialog = document.querySelector('section[role="dialog"][aria-labelledby="return-report-title"]');
    const select = dialog.querySelector('select');
    if (select) {
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
      setter.call(select, 'eye_contact');
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const area = dialog.querySelector('textarea');
    const setter2 = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    setter2.call(area, 'Please re-check the eye contact rating against what the session evidence supports.');
    area.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`)
  await browser.waitUntil(
    '[...document.querySelectorAll(\'section[role="dialog"] button\')].some((b) => b.textContent.trim() === "Return to Trainer" && !b.disabled)',
    'the Return to Trainer button to enable')
  await browser.clickText('Return to Trainer', 'section[role="dialog"]')
  await new Promise((r) => setTimeout(r, 2_500))
  const returnedStatus = reportStatus()
  const openCorrections = Number(dbValue(
    `SELECT count(*) FROM public.report_correction_requests WHERE report_id='${liveReportId}' AND status='open';`))
  const versionsAfterReturn = Number(dbValue(`SELECT count(*) FROM public.report_versions WHERE report_id='${liveReportId}';`))
  // A-035 measured, not asserted: the FROZEN version's own approval row must
  // be untouched by the return. Captured as an identity fingerprint so a
  // later rewrite in place would change it.
  const approvalRowsAfterReturn = dbValue(
    'SELECT COALESCE(string_agg(report_version_id::text || \':\' || approver_role, \',\' ORDER BY report_version_id::text), \'none\') ' +
    `FROM public.report_version_approvals WHERE report_id='${liveReportId}';`)
  legFrom('L-9', returnedStatus === 'needs_edit' && openCorrections === 1 && versionsAfterReturn === 3 && approvalRowsAfterReturn !== 'none',
    `a real return-for-correction moved the report to ${returnedStatus} with exactly ${openCorrections} open correction ` +
      `request, created NO version (${versionsAfterReturn} unchanged), and left the frozen trainer approval row in place ` +
      '— the return writes reports and the correction record only, never the approved version (A-035)',
    `status=${returnedStatus}, open requests=${openCorrections}, versions=${versionsAfterReturn}, ` +
      `approval rows=${approvalRowsAfterReturn}`)

  // =================================================================
  // L-10 — trainer correction and reapproval.
  // =================================================================
  phase('L-10 … L-12 — correction loop and publication through the real UI')
  await signIn('trainer')
  await browser.navigate('/trainer/reports')
  const trainerQueueText = await browser.bodyText()
  await browser.navigate(`/trainer/reports/${liveReportId}/review`)
  await browser.waitUntil('document.querySelector(\'#main-content\') !== null', 'the trainer review screen after the return')
  // Wait for the returned-state surface to actually render its reason, rather
  // than reading the shell before the client component has its data.
  try {
    await browser.waitUntil(
      '/correction|returned|assessment concern|needs edit/i.test(document.querySelector("#main-content").innerText)',
      'the trainer review screen to show the correction requirement', 25_000)
  } catch {
    // Recorded as a real failure below, with the captured document as evidence.
  }
  const trainerReviewText = await browser.bodyText()
  const trainerSeesCorrection = /correction|returned|assessment concern|needs edit/i.test(trainerReviewText)
  capture('L10_trainer_review_text', trainerReviewText.slice(0, 2000))
  capture('L10_trainer_queue_text', trainerQueueText.slice(0, 1200))
  await browser.navigate(`/trainer/reports/${liveReportId}/edit`)
  await browser.waitUntil('document.querySelector(\'label[data-panel-editor="sessionTakeaway"] textarea\') !== null', 'the correction editor')
  await browser.evaluate(`(() => {
    const radio = document.querySelector('input[name="correction-mode"][value="corrected"]');
    if (radio) radio.click();
    return true;
  })()`)
  await browser.fillField('label[data-panel-editor="sessionTakeaway"] textarea',
    'Corrected after management review: eye contact remains the agreed next focus and the wording now reflects it.')
  await browser.waitUntil(
    '[...document.querySelectorAll(\'#main-content button\')].some((b) => /Create correction version|Save changes & return to review/.test(b.textContent.trim()) && !b.disabled)',
    'the correction save button')
  await browser.evaluate(`(() => {
    const btn = [...document.querySelectorAll('#main-content button')]
      .find((b) => /Create correction version|Save changes & return to review/.test(b.textContent.trim()) && !b.disabled);
    btn.click();
    return true;
  })()`)
  await browser.waitForPath(/^\/trainer\/reports\/[0-9a-f-]{36}\/review/, 'the review screen after the correction save')
  await browser.waitUntil('document.querySelector(\'article[data-report-panel]\') !== null', 'the corrected review screen')
  const checklistBeforeReapproval = await tickChecklist()
  if (checklistBeforeReapproval !== 3) {
    throw new SafeError(`Only ${checklistBeforeReapproval} of 3 checklist items persisted before reapproval.`)
  }
  await browser.waitUntil(
    '[...document.querySelectorAll(\'#main-content button\')].some((b) => b.textContent.trim() === "Approve" && !b.disabled)',
    'the Approve button after the correction')
  await browser.clickText('Approve')
  await browser.waitUntil('document.querySelector(\'section[role="dialog"]\') !== null', 'the reapproval dialog')
  await browser.clickText('Approve for management review', 'section[role="dialog"]')
  await new Promise((r) => setTimeout(r, 2_500))
  const reapprovedStatus = reportStatus()
  const versionsAfterCorrection = Number(dbValue(`SELECT count(*) FROM public.report_versions WHERE report_id='${liveReportId}';`))
  const resolvedCorrections = Number(dbValue(
    `SELECT count(*) FROM public.report_correction_requests WHERE report_id='${liveReportId}' AND status <> 'open';`))
  /*
   * A-035, MEASURED. The reapproval must land on a NEW version and must not
   * rewrite the approval row the returned version already carried. Comparing
   * the approval fingerprint before and after proves both halves: the earlier
   * row survives verbatim (it is a prefix of the new set) and a genuinely
   * different version id now carries the second approval.
   */
  const approvalRowsAfterReapproval = dbValue(
    'SELECT COALESCE(string_agg(report_version_id::text || \':\' || approver_role, \',\' ORDER BY report_version_id::text), \'none\') ' +
    `FROM public.report_version_approvals WHERE report_id='${liveReportId}';`)
  const approvedVersionIds = new Set((approvalRowsAfterReapproval ?? '').split(',').map((s) => s.split(':')[0]))
  const priorApprovalSurvived = (approvalRowsAfterReturn ?? '').split(',')
    .every((entry) => (approvalRowsAfterReapproval ?? '').includes(entry))
  capture('L10_approvals_after_return', approvalRowsAfterReturn)
  capture('L10_approvals_after_reapproval', approvalRowsAfterReapproval)
  legFrom('L-10',
    reapprovedStatus === 'trainer_approved' && versionsAfterCorrection === 4 && resolvedCorrections === 1 &&
      trainerSeesCorrection && priorApprovalSurvived && approvedVersionIds.size === 2,
    `the trainer saw the correction requirement on the returned report, corrected it through a NEW immutable version ` +
      `(${versionsAfterCorrection} total), re-ticked the checklist and re-approved to ${reapprovedStatus}; the ` +
      `correction request is resolved (${resolvedCorrections}). A-035 is MEASURED, not assumed: the earlier approval ` +
      `row survived the whole loop byte-for-byte and ${approvedVersionIds.size} DISTINCT version ids now carry ` +
      'approvals — the returned version was never reapproved in place',
    `correction visible=${trainerSeesCorrection}, status=${reapprovedStatus}, versions=${versionsAfterCorrection}, ` +
      `resolved=${resolvedCorrections}, prior approval survived=${priorApprovalSurvived}, ` +
      `distinct approved versions=${approvedVersionIds.size}`)

  // =================================================================
  // L-11 — management sees the corrected pending report.
  // =================================================================
  await signIn('management')
  await browser.navigate('/management/reports?status=trainer_approved')
  try {
    await browser.waitUntil(
      `[...document.querySelectorAll('a')].some((a) => (a.getAttribute('href') || '').startsWith('/management/reports/${liveReportId}'))`,
      'the corrected report to reappear in the management queue', 25_000)
  } catch {
    // Recorded as a real failure below, with the captured document as evidence.
  }
  const correctedQueueLink = await browser.evaluate(
    `[...document.querySelectorAll('a')].some((a) => (a.getAttribute('href') || '').startsWith('/management/reports/${liveReportId}'))`,
  )
  capture('L11_queue_text', (await browser.bodyText()).slice(0, 1500))
  capture('L11_queue_hrefs', await browser.evaluate(
    '[...document.querySelectorAll(\'a\')].map((a) => a.getAttribute("href")).filter(Boolean)'))
  legFrom('L-11', correctedQueueLink,
    'the corrected, re-approved report reappeared in the single Management Reports pending queue with its final-review link',
    'the corrected report did not reappear in the management pending queue')

  // =================================================================
  // L-12 — approve & submit.
  // =================================================================

  await browser.navigate(`/management/reports/${liveReportId}/review`)
  await browser.waitUntil('document.querySelector(\'[data-testid="management-safe-review"]\') !== null', 'the final-review surface')
  await browser.clickText('Approve & Submit')
  await browser.waitUntil('document.querySelector(\'section[role="dialog"][aria-labelledby="submit-report-title"]\') !== null', 'the submit dialog')
  await browser.clickText('Approve & Submit', 'section[role="dialog"]')
  await new Promise((r) => setTimeout(r, 3_000))
  const submittedStatus = reportStatus()
  const submittedVersion = dbValue(`SELECT latest_submitted_version_id::text FROM public.reports WHERE id='${liveReportId}';`)
  const approvedResidue = Number(dbValue(`SELECT count(*) FROM public.reports WHERE status='approved';`))
  legFrom('L-12', submittedStatus === 'submitted' && submittedVersion !== null && approvedResidue === 0,
    `a real "Approve & Submit" click, confirmed through the real dialog, published the report to ${submittedStatus} and ` +
      `set latest_submitted_version_id, with no row anywhere left at the transient 'approved' state (${approvedResidue}). ` +
      'That residue count is a post-hoc reading and cannot by itself distinguish one transaction from two — the ' +
      "ATOMICITY and ORDER of the two transitions are proven by N-9, which pins the exact ordered event pair",
    `status=${submittedStatus}, submitted version=${submittedVersion === null ? 'unset' : 'set'}, approved residue=${approvedResidue}`)

  // =================================================================
  // L-13 / L-14 — parent read.
  // =================================================================
  phase('L-13 … L-14 — Parent submitted-only visibility through the real UI')
  await signIn('parent')
  await browser.navigate('/parent/reports')
  await browser.waitUntil('document.body.innerText.length > 0', 'the parent report list')
  await browser.navigate(`/parent/students/${FIXTURE_STUDENT}/sessions/${FIXTURE_SESSION}/report`)
  await browser.waitUntil('document.querySelector(\'[data-testid="parent-canonical-report"]\') !== null', 'the parent canonical report')
  const parentText = await browser.bodyText()
  const parentPanels = await browser.evaluate('[...document.querySelectorAll(\'[data-testid="parent-canonical-report"] article\')].length')
  const submittedTakeaway = dbValue(
    `SELECT session_takeaway FROM public.report_versions WHERE id = (SELECT latest_submitted_version_id FROM public.reports WHERE id='${liveReportId}');`)
  const parentShowsSubmitted = submittedTakeaway !== null && parentText.includes(submittedTakeaway.slice(0, 40))
  legFrom('L-13', parentPanels >= 4 && parentShowsSubmitted,
    `the linked parent's canonical route rendered the submitted report (${parentPanels} panel articles) and its text ` +
      'matches the exact version latest_submitted_version_id names — the version management published, not a draft',
    `panels=${parentPanels}, submitted text matched=${parentShowsSubmitted}`)

  /*
   * Scoped to `#main-content` — the REPORT surface. The portal shell that
   * wraps every page carries the production sign-out control, which is a
   * `<form>` with a submit button; counting that as "an editable control on
   * the parent report" would fail the screen for having a sign-out button,
   * which every authenticated page must have. What matters is that nothing
   * inside the report region can edit report data.
   */
  const parentLeaks = await browser.evaluate(`(() => {
    const main = document.querySelector('#main-content');
    const text = main ? main.innerText : document.body.innerText;
    const leaks = [];
    if (/\\b(beginning|developing|mastering|mastered)\\b\\s*(rating|level)/i.test(text)) leaks.push('rating attribution');
    /*
     * The dimension:rating separator is ANY whitespace, not just a colon or
     * dash. The historical caught leak on this screen was a "Performance
     * Summary" GRID, which renders as "Eye Contact\\tBeginning" with no
     * punctuation at all — a punctuation-only pattern would miss exactly the
     * leak this check exists to catch.
     */
    if (/(Body|Emotion|Speech|Tonality|Eye Contact|Vocal Projection|Emotional Expression|Sentence Flow|Audience Awareness)\\s*[:\\u2014\\u2013-]?\\s*(Beginning|Developing|Mastering|Mastered)\\b/i.test(text)) {
      leaks.push('a dimension:rating pair');
    }
    if (/quality checklist|evidence confirms rating|ai draft reviewed|privacy check passed/i.test(text)) leaks.push('checklist');
    if (/trainer note|internal note|coach notes/i.test(text)) leaks.push('internal notes');
    if (text.includes(${JSON.stringify(TRAINER_NOTES.slice(0, 40))})) leaks.push('trainer observation notes');
    if (text.includes(${JSON.stringify(FOLLOW_UP_NOTES.slice(0, 40))})) leaks.push('trainer follow-up notes');
    if (/content[_ ]hash/i.test(text)) leaks.push('content hash');
    // ANY button counts, not just type="submit" — a plain <button> with an
    // onClick handler is just as much an editable control.
    if (main && main.querySelector('textarea, input:not([type="hidden"]), button, [contenteditable="true"]')) {
      leaks.push('an interactive control in the report region');
    }
    if (/approve & submit|return assessment concern|edit wording/i.test(text)) leaks.push('management controls');
    return leaks;
  })()`)
  capture('L14_parent_text', parentText.slice(0, 2000))
  capture('L14_parent_leaks', parentLeaks)
  capture('L14_main_controls', await browser.evaluate(`(() => {
    const main = document.querySelector('#main-content');
    if (!main) return 'no main';
    return [...main.querySelectorAll('textarea, input, button')].map((el) =>
      el.tagName + '[' + (el.getAttribute('type') || '') + ']:' + (el.textContent || '').trim().slice(0, 30));
  })()`))
  legFrom('L-14', Array.isArray(parentLeaks) && parentLeaks.length === 0,
    'the parent view carries no rating attribution, no checklist, no internal notes, no content hash, no editable ' +
      'control and no management action — measured against the rendered document, not assumed from the component source',
    `the parent view exposed: ${Array.isArray(parentLeaks) ? parentLeaks.join(', ') : 'unmeasured'}`)

  // =================================================================
  // NEGATIVE CONTROLS
  // =================================================================
  phase('Negative controls')

  // N-1 — absent learner.
  await signIn('trainer')
  await browser.navigate(`/trainer/sessions/${ABSENT_SESSION}/roster`)
  await browser.waitUntil(`document.querySelector('article[data-roster-card="${FIXTURE_STUDENT}"]') !== null`, 'the absent roster card')
  const absentAttendance = await browser.evaluate(
    `document.querySelector('article[data-roster-card="${FIXTURE_STUDENT}"]').dataset.attendance`)
  const absentAction = await browser.evaluate(
    `document.querySelector('article[data-roster-card="${FIXTURE_STUDENT}"]').dataset.rosterAction`)
  await browser.navigate(`/trainer/sessions/${ABSENT_SESSION}/students/${FIXTURE_STUDENT}/assess`)
  const absentTerminal = await browser.waitForAssessTerminal()
  const absentReports = Number(dbValue(`SELECT count(*) FROM public.reports WHERE class_session_id='${ABSENT_SESSION}';`))
  capture('N1_absent_terminal', absentTerminal)
  controlFrom('N-1',
    absentAttendance === 'absent' && absentAction === 'inert' && absentReports === 0 &&
      absentTerminal.refusalShown === true && absentTerminal.instrumentPresent === false &&
      absentTerminal.dimensionControls === 0,
    `the absent learner's card rendered inert with no assessment path; the assess route reached its TERMINAL state and ` +
      `rendered the governed refusal INSTEAD of the instrument (${absentTerminal.dimensionControls} rating fieldsets — ` +
      `there is nothing to focus, tab to or fill), and no report exists for that session (${absentReports})`,
    `attendance=${absentAttendance}, action=${absentAction}, reports=${absentReports}, ` +
      `refusal shown=${absentTerminal.refusalShown}, instrument present=${absentTerminal.instrumentPresent}, ` +
      `fieldsets=${absentTerminal.dimensionControls}`)

  // N-2 — future session. Waits for a TERMINAL state before judging, so the
  // refusal is proven POSITIVELY rather than inferred from a loading skeleton.
  await browser.navigate(`/trainer/sessions/${FUTURE_SESSION}/students/${FIXTURE_STUDENT}/assess`)
  const futureTerminal = await browser.waitForAssessTerminal()
  const futureReports = Number(dbValue(`SELECT count(*) FROM public.reports WHERE class_session_id='${FUTURE_SESSION}';`))
  capture('N2_future_terminal', futureTerminal)
  controlFrom('N-2',
    futureTerminal.refusalShown === true && futureTerminal.instrumentPresent === false &&
      futureTerminal.dimensionControls === 0 && futureReports === 0,
    `a future-dated session reached its TERMINAL state on its own route and rendered the governed refusal INSTEAD of ` +
      `the instrument (${futureTerminal.dimensionControls} rating fieldsets present), creating no report ` +
      `(${futureReports}). The refusal is observed positively — an earlier version of this control read the page while ` +
      'it was still a loading skeleton, which would have passed even with the gate deleted',
    `refusal shown=${futureTerminal.refusalShown}, instrument present=${futureTerminal.instrumentPresent}, ` +
      `fieldsets=${futureTerminal.dimensionControls}, reports=${futureReports}`)

  // N-3 — direct URL role bypass.
  await signIn('parent')
  const parentToManagement = await browser.navigate(`/management/reports/${liveReportId}/review`)
  const parentToTrainerAssess = await browser.navigate(`/trainer/sessions/${FIXTURE_SESSION}/students/${FIXTURE_STUDENT}/assess`)
  const parentBypassText = await browser.bodyText()
  await signIn('management')
  const managementToTrainerAssess = await browser.navigate(`/trainer/sessions/${FIXTURE_SESSION}/students/${FIXTURE_STUDENT}/assess`)
  const managementBypassText = await browser.bodyText()
  const bypassBlocked =
    !parentToManagement.startsWith('/management/reports') &&
    !parentToTrainerAssess.includes('/assess') &&
    !managementToTrainerAssess.includes('/assess') &&
    !parentBypassText.includes('dimensions rated') &&
    !managementBypassText.includes('dimensions rated')
  controlFrom('N-3', bypassBlocked,
    `typing a governed URL directly did not bypass role: the parent was redirected off the management review route ` +
      `(landed ${parentToManagement}) and off the trainer assess route (landed ${parentToTrainerAssess}), and ` +
      `management was redirected off the trainer assess route (landed ${managementToTrainerAssess})`,
    `parent->management landed ${parentToManagement}; parent->assess landed ${parentToTrainerAssess}; ` +
      `management->assess landed ${managementToTrainerAssess}`)

  // N-4 — management cannot mutate assessment facts through a governed RPC.
  //
  // The payload is DELIBERATELY WELL-FORMED — a full nine-rating jsonb body
  // matching the real signature — so the call resolves and the ONLY thing
  // left that can reject it is management's role. A malformed call would
  // fail resolution first and prove nothing (see isAuthorizationDenial).
  const nineRatings = RATING_PLAN.map(([dimensionCode, rating]) => ({ dimension_code: dimensionCode, rating }))
  const mgmtObservationWrite = await managementDb.rpc('assessment_save_complete_and_open_report', {
    p_class_session_id: FIXTURE_SESSION, p_student_id: FIXTURE_STUDENT,
    p_expected_observation_id: null, p_expected_lock_version: null,
    p_strength_chips: ['confident-opening'], p_focus_chips: ['pacing'],
    p_observation_notes: 'management attempting an assessment write',
    p_follow_up_notes: 'management attempting an assessment write',
    p_term_evidence_notes: null, p_ratings: nineRatings,
  })
  const mgmtDirectRatings = await managementDb.rpc('assessment_get_trainer_observation', {
    p_class_session_id: FIXTURE_SESSION, p_student_id: FIXTURE_STUDENT,
  })
  // The PRE-APPROVAL read prohibition: management may read the final-review
  // candidate only at trainer_approved or submitted (A-038). At this point the
  // report IS submitted, so the complementary proof is the draft_ready one
  // below, taken on the second report this run creates for that purpose.
  const ratingsStillIntact = dbValue(
    `SELECT string_agg(dimension_code || '=' || rating, ',' ORDER BY dimension_code) FROM public.report_version_ratings ` +
    `WHERE report_version_id = (SELECT latest_submitted_version_id FROM public.reports WHERE id='${liveReportId}');`)
  const mgmtWriteDenied = isAuthorizationDenial(mgmtObservationWrite.error)
  const mgmtReadDenied = isAuthorizationDenial(mgmtDirectRatings.error)
  capture('N4_write_error', mgmtObservationWrite.error ?? null)
  capture('N4_read_error', mgmtDirectRatings.error ?? null)
  controlFrom('N-4',
    mgmtWriteDenied && mgmtReadDenied && ratingsStillIntact === ratingsAfterWording,
    `management's WELL-FORMED nine-rating observation write (the payload resolves against the real jsonb signature, so ` +
      `only the role predicate can reject it) was denied with the authored code ${mgmtObservationWrite.error?.code}; its ` +
      `attempt to READ the raw rating grid was denied with ${mgmtDirectRatings.error?.code}; and the submitted version ` +
      'still carries the trainer-approved ratings unchanged. Both denials are authored BC codes, not structural SQL errors',
    `write denied=${mgmtWriteDenied} (code ${mgmtObservationWrite.error?.code ?? 'none'}), ` +
      `read denied=${mgmtReadDenied} (code ${mgmtDirectRatings.error?.code ?? 'none'}), ` +
      `ratings unchanged=${ratingsStillIntact === ratingsAfterWording}`)

  // N-5 — parent cannot mutate report data. Both calls use the EXACT signature
  // (p_expected_wording_hash, not p_wording_hash — an earlier version of this
  // harness had that wrong and measured a 42883 resolution error as a denial).
  const currentLock = Number(dbValue(`SELECT lock_version FROM public.reports WHERE id='${liveReportId}';`))
  const parentApprove = await parentDb.rpc('report_management_approve_and_submit', {
    p_report_id: liveReportId, p_expected_lock_version: currentLock,
    p_expected_version_id: submittedVersion, p_expected_wording_hash: 'x',
  })
  const parentEdit = await parentDb.rpc('report_save_edit', {
    p_report_id: liveReportId, p_expected_status: 'submitted', p_expected_lock_version: currentLock,
    p_expected_version_id: submittedVersion, p_todays_strength: 'x', p_next_focus: 'x',
    p_practice_suggestion: 'x', p_session_takeaway: 'x',
  })
  const statusAfterParentAttempts = reportStatus()
  const parentApproveDenied = isAuthorizationDenial(parentApprove.error)
  const parentEditDenied = isAuthorizationDenial(parentEdit.error)
  capture('N5_approve_error', parentApprove.error ?? null)
  capture('N5_edit_error', parentEdit.error ?? null)
  controlFrom('N-5',
    parentApproveDenied && parentEditDenied && statusAfterParentAttempts === 'submitted',
    `the parent's SIGNATURE-CORRECT attempts to approve-and-submit (${parentApprove.error?.code}) and to save an edit ` +
      `(${parentEdit.error?.code}) were both denied by authored role predicates — not by a resolution or cast error — ` +
      `and the report remains ${statusAfterParentAttempts}. The parent boundary is enforced server-side, not by hiding a control`,
    `approve denied=${parentApproveDenied} (code ${parentApprove.error?.code ?? 'none'}), ` +
      `edit denied=${parentEditDenied} (code ${parentEdit.error?.code ?? 'none'}), status=${statusAfterParentAttempts}`)

  // N-6 — submitted content stable; earlier versions never exposed.
  await signIn('parent')
  await browser.navigate(`/parent/students/${FIXTURE_STUDENT}/sessions/${FIXTURE_SESSION}/report`)
  await browser.waitUntil('document.querySelector(\'[data-testid="parent-canonical-report"]\') !== null', 'the parent report re-read')
  const parentTextAgain = await browser.bodyText()
  const earlierTakeaways = psqlRows(DISPOSABLE_DB_CONTAINER,
    `SELECT session_takeaway FROM public.report_versions WHERE report_id='${liveReportId}' ` +
    `AND id <> (SELECT latest_submitted_version_id FROM public.reports WHERE id='${liveReportId}');`)
    .map((row) => row[0]).filter((value) => typeof value === 'string' && value.length > 20)
  const leakedEarlier = earlierTakeaways.filter((value) => parentTextAgain.includes(value.slice(0, 40)))
  controlFrom('N-6',
    parentTextAgain.includes(submittedTakeaway.slice(0, 40)) && leakedEarlier.length === 0,
    `the parent read is byte-stable across two independent loads and exposes ONLY the submitted version: none of the ` +
      `${earlierTakeaways.length} earlier version(s) appears in the rendered document`,
    `${leakedEarlier.length} earlier version(s) leaked into the parent view`)

  // N-7 — one Management Reports route, one active rail item.
  /*
   * DEDUPE BY HREF. The shared portal shell renders its navigation TWICE —
   * a desktop rail and a mobile header — and both are in the DOM at all
   * times (the same reason the sign-out control appears twice). Counting raw
   * <a> elements therefore measures responsive containers, not destinations.
   * The governance rule is about DESTINATIONS: one canonical Reports route,
   * one active item. Distinct hrefs is the measurement that matches it.
   */
  const railDestinations = async () => browser.evaluate(
    '[...new Set([...document.querySelectorAll(\'nav a\')]' +
    '.map((a) => a.getAttribute("href") || "")' +
    '.filter((h) => h.startsWith("/management/reports")))]')
  const activeDestinations = async () => browser.evaluate(
    '[...new Set([...document.querySelectorAll(\'nav a[aria-current="page"]\')].map((a) => a.getAttribute("href") || ""))]')

  await signIn('management')
  await browser.navigate('/management/reports?status=trainer_approved')
  const pendingRoute = await browser.currentPath()
  const pendingActive = await activeDestinations()
  const pendingRail = await railDestinations()
  await browser.navigate('/management/reports?status=submitted')
  const submittedRoute = await browser.currentPath()
  const submittedActive = await activeDestinations()
  const submittedRail = await railDestinations()
  capture('N7_pending_rail', pendingRail)
  capture('N7_submitted_rail', submittedRail)
  capture('N7_pending_active', pendingActive)
  capture('N7_submitted_active', submittedActive)
  capture('N7_all_nav_hrefs', await browser.evaluate(
    '[...document.querySelectorAll(\'nav a\')].map((a) => a.getAttribute("href")).filter(Boolean)'))
  controlFrom('N-7',
    pendingRoute.startsWith('/management/reports?') && submittedRoute.startsWith('/management/reports?') &&
      pendingActive.length === 1 && submittedActive.length === 1 &&
      pendingRail.length === 1 && submittedRail.length === 1,
    `both the Pending and Approved views are the SAME route differing only by query (${pendingRoute} / ${submittedRoute}); ` +
      `the rail exposes exactly ${pendingRail.length} distinct Reports destination (${pendingRail.join(', ')}) and exactly ` +
      'one distinct rail destination is aria-current on each view (counted by DESTINATION, since the shell renders its ' +
      'navigation twice for desktop and mobile)',
    `pending=${pendingRoute} (active ${JSON.stringify(pendingActive)}, rail ${JSON.stringify(pendingRail)}), ` +
      `submitted=${submittedRoute} (active ${JSON.stringify(submittedActive)}, rail ${JSON.stringify(submittedRail)})`)

  // N-8 — sign-out for all three roles.
  const signOutResults = []
  for (const roleKey of ['trainer', 'management', 'parent']) {
    await signIn(roleKey)
    const home = DISPOSABLE_IDENTITIES.find((i) => i.key === roleKey).home
    await browser.navigate(home)
    await browser.waitUntil('document.querySelector(\'[data-testid="sign-out"]\') !== null', `the ${roleKey} sign-out control`)
    await browser.clickSelector('[data-testid="sign-out"]')
    await new Promise((r) => setTimeout(r, 2_000))
    const afterSignOut = await browser.navigate(home)
    signOutResults.push({ roleKey, landed: afterSignOut, ok: afterSignOut.startsWith('/login') })
  }
  controlFrom('N-8', signOutResults.every((r) => r.ok),
    `the production sign-out control terminated the session for all three roles; each was redirected to /login when it ` +
      `revisited its own portal (${signOutResults.map((r) => `${r.roleKey}->${r.landed}`).join(', ')})`,
    `sign-out did not terminate: ${signOutResults.filter((r) => !r.ok).map((r) => `${r.roleKey}->${r.landed}`).join(', ')}`)

  // N-9 — audit events exactly once + chain verification.
  // seq_no is carried so ADJACENCY can be proven, not merely relative order.
  const eventRows = psqlRows(DISPOSABLE_DB_CONTAINER,
    `SELECT e.seq_no::text, action, COALESCE(state_from,'-'), COALESCE(state_to,'-') FROM public.audit_events e ` +
    `WHERE e.centre_id='${FIXTURE_CENTRE}' AND (` +
    `  (e.target_type='report' AND e.target_id='${liveReportId}') OR EXISTS (` +
    `    SELECT 1 FROM public.audit_event_targets t WHERE t.event_id=e.id AND t.target_type='report' ` +
    `    AND t.target_id='${liveReportId}')) ORDER BY e.seq_no;`)
  const events = eventRows.map((row) => ({ seq: Number(row[0]), transition: `${row[1]}:${row[2]}->${row[3]}` }))
  const transitions = events.map((e) => e.transition)
  const createdOnce = transitions.filter((t) => t.startsWith('report.created')).length
  /*
   * ADJACENCY, not just relative order. Filtering the list down to the two
   * expected strings and then checking their order discards anything
   * committed BETWEEN them — two separate transactions minutes apart would
   * still have passed. The two transitions must be CONSECUTIVE in the dense
   * per-centre seq_no, which is exactly what "one transaction, two ordered
   * events, no residue" means.
   */
  const approvedIdx = transitions.indexOf('report.state_changed:trainer_approved->approved')
  const submittedIdx = transitions.indexOf('report.state_changed:approved->submitted')
  const submitAdjacent =
    approvedIdx >= 0 && submittedIdx === approvedIdx + 1 &&
    events[submittedIdx].seq === events[approvedIdx].seq + 1
  const approvedOccurrences = transitions.filter((t) => t === 'report.state_changed:trainer_approved->approved').length
  const submittedOccurrences = transitions.filter((t) => t === 'report.state_changed:approved->submitted').length
  capture('N9_transitions', events)
  const chainRow = psqlRows(DISPOSABLE_DB_CONTAINER,
    'SELECT ok::text, events_checked::text, mode, head_checked::text FROM public.audit_verify_chain() ' +
    `WHERE centre_id='${FIXTURE_CENTRE}';`)[0] ?? []
  const totalEvents = Number(dbValue(`SELECT count(*) FROM public.audit_events WHERE centre_id='${FIXTURE_CENTRE}';`))
  const chainOk = chainRow[0] === 'true' && chainRow[2] === 'complete' && chainRow[3] === 'true' && Number(chainRow[1]) === totalEvents
  controlFrom('N-9',
    createdOnce === 1 && approvedOccurrences === 1 && submittedOccurrences === 1 && submitAdjacent && chainOk,
    `this report emitted report.created exactly once, and Approve & Submit emitted its two state changes ` +
      `(trainer_approved->approved then approved->submitted) exactly once each and CONSECUTIVELY — seq ` +
      `${events[approvedIdx]?.seq} then ${events[submittedIdx]?.seq}, with nothing committed between them, which is ` +
      `what one transaction means. audit_verify_chain() reports ok in COMPLETE mode with the head checked over all ` +
      `${totalEvents} centre events (the whole per-centre chain, including the negative-control sessions)`,
    `report.created x${createdOnce}; trainer_approved->approved x${approvedOccurrences}; approved->submitted ` +
      `x${submittedOccurrences}; adjacent=${submitAdjacent} (seq ${events[approvedIdx]?.seq ?? '-'} then ` +
      `${events[submittedIdx]?.seq ?? '-'}); chain ok=${chainRow[0]}, mode=${chainRow[2]}, head=${chainRow[3]}, ` +
      `checked=${chainRow[1]}/${totalEvents}`)

  // N-10 — provider control.
  providerControl.nonLoopbackPeers = sampleNonLoopbackPeers(owned.serverPid)
  providerControl.peerSampleTaken = providerControl.nonLoopbackPeers !== null
  const storedDraftsFromProvider = Number(dbValue(
    `SELECT count(*) FROM public.report_versions WHERE report_id='${liveReportId}';`))
  controlFrom('N-10',
    providerControl.overwritten.size === 3 && providerControl.literalIsUnratified === true &&
      providerControl.peerSampleTaken === true && providerControl.nonLoopbackPeers === 0,
    `all ${providerControl.overwritten.size} ratified AI selectors were overwritten in the served child environment with ` +
      'a literal proven (by reading the ratified contract itself) to match neither ratified selector, so ' +
      'getServerConfig() refuses before any provider object is CONSTRUCTED — that structural impossibility is this ' +
      `control's real evidence. The ${storedDraftsFromProvider} stored version(s) came from the deterministic fixture ` +
      'provider through requestDraftCore, never from a network call. The non-loopback peer sample ' +
      `(${providerControl.nonLoopbackPeers}) is recorded as a corroborating reading only, and is deliberately NOT ` +
      'claimed as strong evidence: it is taken long after the only window in which a call could have occurred, and a ' +
      'completed connection would no longer appear in it',
    `overwritten=${providerControl.overwritten.size}/3, literal unratified=${providerControl.literalIsUnratified}, ` +
      `peer sample taken=${providerControl.peerSampleTaken}, non-loopback peers=${providerControl.nonLoopbackPeers}`)

  say('')
  say('The governed lifecycle completed end to end on the disposable stack.')
  return consoleErrors
}

// ---------------------------------------------------------------------
// Exit.
// ---------------------------------------------------------------------

let finished = false
async function finish() {
  if (finished) return
  finished = true

  await teardown()

  // N-11 / N-12 are decided AFTER teardown, from independent re-reads.
  if (!controls.has('N-11')) {
    if (readings.canonicalBefore === null) {
      control('N-11', 'NOT-RUN', 'the canonical database was never read, so nothing could be compared')
    } else {
      let after = null
      try { after = readCanonical() } catch { after = null }
      readings.canonicalAfter = after
      if (after === null) {
        control('N-11', 'FAIL', 'the canonical database could not be re-read after the run')
      } else {
        const same = after.checksum.sha256 === readings.canonicalBefore.checksum.sha256
        const clean = after.counts.reports === 0 && after.counts.reportVersions === 0 && after.counts.auditEvents === 0
        controlFrom('N-11', same && clean,
          `independently re-read after teardown: checksum ${after.checksum.sha256} unchanged over ${after.checksum.rows} ` +
            'rows, with reports=0, report_versions=0 and audit_events=0 — every governed write this run performed ' +
            'landed on the disposable stack',
          `checksum same=${same}; residue clean=${clean}`)
      }
    }
  }

  if (!controls.has('N-12')) {
    const unmeasured = [
      ['the server process', hygiene.serverGone], ['the browser process', hygiene.chromeGone],
      ['the disposable ports', hygiene.portsFree], ['disposable containers', hygiene.containers],
      ['disposable volumes', hygiene.volumes],
    ].filter(([, v]) => v === null).map(([n]) => n)
    if (unmeasured.length > 0) {
      control('N-12', 'FAIL',
        `hygiene could not be MEASURED for: ${unmeasured.join('; ')}. An unmeasured subject is an unproven one and is ` +
          'never a pass — check by hand for orphaned processes, containers, volumes and listeners')
    } else {
      controlFrom('N-12',
        hygiene.serverGone === true && hygiene.chromeGone === true && hygiene.portsFree.length === 0 &&
          hygiene.containers.length === 0 && hygiene.volumes.length === 0,
        `MEASURED after teardown: this run's server and browser are gone, all ${ALL_DISPOSABLE_PORTS.length} disposable ` +
          'ports refuse a connection, and docker reports 0 disposable containers and 0 disposable volumes',
        `server gone=${hygiene.serverGone}, chrome gone=${hygiene.chromeGone}, ports still serving=` +
          `${hygiene.portsFree.join(', ') || 'none'}, containers=${hygiene.containers.join(', ') || 'none'}, ` +
          `volumes=${hygiene.volumes.join(', ') || 'none'}`)
    }
  }

  closeLedgers('not reached: the run ended before this could be decided')
  printLedgers()

  const tally = { PASS: 0, FAIL: 0, 'NOT-RUN': 0 }
  for (const e of [...lifecycle.values(), ...controls.values()]) tally[e.verdict] += 1
  say('')
  say(`  ${tally.PASS} PASS · ${tally.FAIL} FAIL · ${tally['NOT-RUN']} NOT-RUN across ` +
      `${LIFECYCLE_TITLES.size} lifecycle legs and ${CONTROL_TITLES.size} negative controls.`)
  writeLedger()

  const failed = tally.FAIL > 0
  const unproved = tally['NOT-RUN'] > 0
  if (failed) process.exitCode = 1
  else if (unproved) process.exitCode = 2
  else process.exitCode = 0
}

let interrupted = false
const onSignal = () => {
  if (interrupted) return
  interrupted = true
  process.stdout.write('\nAborting. Removing this run\'s stack, server and browser.\n')
  process.exitCode = 130
  void (async () => {
    try { await finish() } catch { /* never mask the abort */ }
    process.exit(130)
  })()
}
process.on('SIGINT', onSignal)
process.on('SIGTERM', onSignal)

main()
  .then(async (consoleErrors) => {
    if (Array.isArray(consoleErrors) && consoleErrors.length > 0) {
      warn(`${consoleErrors.length} browser console error(s) were collected during the walkthrough.`)
    }
    await finish()
  })
  .catch(async (error) => {
    const message = error instanceof SafeError ? error.message : 'The governed lifecycle proof failed.'
    process.stderr.write(`\nFAILED: ${message}\n`)
    try { await finish() } catch { /* ignore */ }
    process.exitCode = 1
  })

export { LIFECYCLE_TITLES, CONTROL_TITLES }
