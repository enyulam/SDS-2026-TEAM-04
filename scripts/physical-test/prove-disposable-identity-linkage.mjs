// =====================================================================
// B.E.S.T Coach — autonomous DISPOSABLE IDENTITY-LINKAGE proof
// =====================================================================
// WHY THIS EXISTS
// ---------------------------------------------------------------------
// A real operator run of `run-f17-disposable.mjs` stopped with
//
//     FAILED: The Trainer disposable account row is not linked to a
//             disposable Auth user.
//
// even though all three disposable Auth identities had been created, the
// fixture had loaded, and every one of the three account rows really was
// linked. The linkage was never broken. The READER was.
//
// The read-back asked psql for `(u.id IS NOT NULL)::text` and then tested
// the returned field against the string `'t'`. Under `--tuples-only
// --no-align`, psql renders a BARE boolean as `t`/`f`, but an EXPLICIT
// `::text` cast renders it as `true`/`false`. So the test was false for
// EVERY row on EVERY run, and the FIRST entry of `DISPOSABLE_IDENTITIES` —
// the Trainer — was always the one named. That is why the Trainer, and only
// the Trainer, appeared in the message: Management and Parent carried the
// identical defect and were simply never reached.
//
// This proof exists so that defect can never return silently. It is
// AUTONOMOUS and PASSWORDLESS: the Auth Admin API creates a user without a
// password, and linkage does not depend on one, so the whole linkage
// contract can be established and verified with no credential anywhere on
// any path in this file.
//
// ---------------------------------------------------------------------
// WHAT IT PROVES
// ---------------------------------------------------------------------
//   L-1  the raw psql field really is `true`, not `t` — the defect is
//        REPRODUCED here as a measurement, and the old predicate is shown
//        to be false on data that is correct
//   L-2  exactly three disposable Auth users exist, with the three expected
//        ids and the three disposable addresses
//   L-3  every account row points at its OWN expected disposable auth id
//   L-4  the three ids are distinct and each role/centre is correct
//   L-5  no account row points outside the intended disposable set, and no
//        dangling or unlinked account row remains
//   L-6  NEGATIVE CONTROL: four deliberately-wrong linkages each make the
//        shipped assertion FAIL, and the assertion passes again after each
//        is restored. A check that cannot fail proves nothing.
//   L-7  the canonical database is unchanged while the disposable stack is up
//   L-8..L-11  teardown really removed containers, volumes, ports, workdir
//   L-12 the canonical database is byte-identical after teardown
//
// ---------------------------------------------------------------------
// WHAT IT WILL NEVER DO
// ---------------------------------------------------------------------
//   * Prompt for, accept, read, generate, print or persist any password,
//     token, key, cookie or connection string. There is no `password` key
//     in any call in this file.
//   * Claim G-1. G-1 requires the operator's real hidden password entry
//     against a real `signInWithPassword`, and nothing here can satisfy it.
//   * Serve the application, call `requestDraft`, or reach any external
//     provider.
//   * Touch the canonical stack, its config, its database or its Auth. It
//     is READ, never written, and `supabase stop --all` is never issued.
//
// EXIT CODES
//   0  every check PASSED
//   1  a check FAILED, or the proof could not complete
//   2  refused before provisioning anything
//   130 SIGINT / SIGTERM
// =====================================================================

import { createClient } from '@supabase/supabase-js'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import {
  CANONICAL_CONTAINERS,
  CANONICAL_PROJECT_ID,
  DISPOSABLE_API_PORT,
  DISPOSABLE_DB_CONTAINER,
  DISPOSABLE_IDENTITIES,
  DISPOSABLE_PROJECT_ID,
  DISPOSABLE_PUBLISHED_PORTS,
  EXPECTED_CANONICAL_MIGRATIONS,
  FIXTURE_CENTRE_ID,
  REPO_ROOT,
  SafeError,
  assertCanonicalConfigUntouched,
  assertCanonicalPristine,
  assertNoCollision,
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
  readBoolean,
  readCanonical,
  readDisposableCensus,
  resolveLocalCli,
  runningContainers,
  say,
  startDisposableStack,
  stopDisposableStack,
  verifyDisposableIdentityLinkage,
  waitForPortReleased,
  waitForPortSilent,
  warn,
} from './disposable-stack.mjs'

// ---------------------------------------------------------------------
// The ledger. Nothing is ever defaulted to PASS.
// ---------------------------------------------------------------------

const CHECK_TITLES = new Map([
  ['L-1', 'The psql boolean rendering is MEASURED, and the old `=== "t"` predicate is shown to be wrong'],
  ['L-2', 'Exactly three disposable Auth users exist, with the expected ids and disposable addresses'],
  ['L-3', 'Every account row references its OWN expected disposable auth.users.id'],
  ['L-4', 'The three linked ids are distinct, and each role and centre is correct'],
  ['L-5', 'No account row points outside the intended disposable set; no dangling or unlinked row remains'],
  ['L-6', 'NEGATIVE CONTROL: each deliberately-wrong linkage FAILS the shipped assertion, and restores clean'],
  ['L-7', 'The canonical fixture database is UNCHANGED while the disposable stack is up'],
  ['L-8', 'Teardown removed every disposable container'],
  ['L-9', 'Teardown removed every disposable data volume'],
  ['L-10', 'Teardown released every disposable port (refuses connections AND re-bindable)'],
  ['L-11', 'Teardown removed the disposable workdir'],
  ['L-12', 'The canonical fixture database is byte-identical AFTER teardown (independent re-read)'],
])

const ledger = new Map()

function check(id, verdict, reason) {
  if (!CHECK_TITLES.has(id)) throw new SafeError(`Unknown check id: ${id}`)
  if (ledger.has(id)) throw new SafeError(`Check ${id} was decided twice.`)
  if (!['PASS', 'FAIL', 'NOT-RUN'].includes(verdict)) {
    throw new SafeError(`Check ${id} was given an unsupported verdict.`)
  }
  ledger.set(id, { verdict, reason })
  if (verdict === 'PASS') pass(`${id} ${reason}`)
  else warn(`${id} ${verdict} — ${reason}`)
}

function checkFrom(id, ok, passReason, failReason) {
  check(id, ok ? 'PASS' : 'FAIL', ok ? passReason : failReason)
}

function closeLedger(defaultReason) {
  for (const id of CHECK_TITLES.keys()) {
    if (!ledger.has(id)) ledger.set(id, { verdict: 'NOT-RUN', reason: defaultReason })
  }
}

// ---------------------------------------------------------------------
// Arguments. There is deliberately NO argument that carries, names or
// points at a credential, and an unknown argument aborts before anything.
// ---------------------------------------------------------------------

const HELP = `
B.E.S.T Coach — autonomous disposable IDENTITY-LINKAGE proof

  node scripts/physical-test/prove-disposable-identity-linkage.mjs
  node scripts/physical-test/prove-disposable-identity-linkage.mjs --help

WHAT IT DOES
  Really provisions the disposable Supabase stack "${DISPOSABLE_PROJECT_ID}", really
  creates three PASSWORDLESS synthetic Auth identities on it, really loads
  the committed synthetic domain fixture, and then verifies — with the SAME
  shipped code the interactive runner uses — that each application account
  row references its own expected disposable auth.users id, with the right
  role and centre, no shared id and no dangling row.

  It then proves the check can FAIL: four deliberately-wrong linkages are
  injected one at a time, each is required to be rejected, and each is
  restored and re-verified. Finally it tears the stack down and re-reads
  the canonical database independently.

WHAT IT WILL NEVER DO
  * Use, generate, accept, prompt for, print or persist a password, token,
    key, cookie or connection string. No call in this file has a password.
  * Claim G-1. G-1 needs the operator's real hidden password entry against
    a real signInWithPassword and is NOT-RUN in every autonomous run.
  * Serve the application, call requestDraft, or reach any external provider.
  * Modify supabase/config.toml, any committed migration, the committed
    fixture file, or any canonical container, database, volume or port.
  * Call "supabase stop --all", which would stop the canonical stack.

OPTIONS
  --help  print this and exit 0.
`

function parseArgs(argv) {
  let help = false
  for (const arg of argv.slice(2)) {
    if (arg === '--help' || arg === '-h') help = true
    else {
      // The argument is NOT echoed back. An operator who mistyped a secret
      // onto the command line must not see it repeated to the terminal.
      throw new SafeError(
        'Unsupported argument. This proof accepts only --help. It takes no credential of any kind, ' +
          'from any source, and there is no argument that supplies one.',
      )
    }
  }
  return { help }
}

// ---------------------------------------------------------------------
// Teardown state, populated AS THINGS ARE ACQUIRED.
// ---------------------------------------------------------------------

const acquired = { cli: null, workdir: null, stackStarted: false, startAttempted: false }
const readings = { canonicalBefore: null, canonicalAfter: null }

let teardownPromise = null
function teardown() {
  if (teardownPromise === null) teardownPromise = runTeardown()
  return teardownPromise
}

async function runTeardown() {
  if (!acquired.startAttempted && acquired.workdir === null) return

  phase('Teardown — the disposable stack only')

  if (acquired.startAttempted && acquired.cli !== null) {
    // Targeted at the DISPOSABLE project id. `--all` is never used: it would
    // stop the canonical stack. Issued whether the start succeeded or failed.
    const status = stopDisposableStack(acquired.cli, acquired.workdir)
    info(`supabase stop --project-id ${DISPOSABLE_PROJECT_ID} --no-backup exit ${status}`)

    const containers = disposableContainersPresent()
    if (!ledger.has('L-8')) {
      checkFrom(
        'L-8',
        containers.length === 0,
        `docker ps -a lists 0 containers whose name ends in "_${DISPOSABLE_PROJECT_ID}"`,
        `${containers.length} disposable container(s) survived teardown: ${containers.join(', ')}`,
      )
    }

    const volumes = disposableVolumesPresent()
    if (!ledger.has('L-9')) {
      checkFrom(
        'L-9',
        volumes.length === 0,
        `docker volume ls lists 0 volumes naming "${DISPOSABLE_PROJECT_ID}"`,
        `${volumes.length} disposable volume(s) survived teardown: ${volumes.join(', ')}`,
      )
    }

    const released = []
    for (const port of DISPOSABLE_PUBLISHED_PORTS) {
      const silent = await waitForPortSilent(port)
      released.push({ port, silent, bindable: await waitForPortReleased(port, 5_000) })
    }
    if (!ledger.has('L-10')) {
      const held = released.filter((entry) => !entry.silent || !entry.bindable)
      checkFrom(
        'L-10',
        held.length === 0,
        `ports ${DISPOSABLE_PUBLISHED_PORTS.join(', ')} each REFUSE a TCP connection and are each re-bindable`,
        `still serving or unbindable: ${held
          .map((entry) => `${entry.port} (silent=${entry.silent}, bindable=${entry.bindable})`)
          .join(', ')}`,
      )
    }
  } else {
    info('provisioning was never attempted, so there is no disposable stack to stop')
  }

  const workdirRemoved = destroyDisposableWorkdir()
  if (!ledger.has('L-11')) {
    checkFrom(
      'L-11',
      workdirRemoved && !existsSync(acquired.workdir ?? ''),
      'the temporary disposable workdir was deleted; nothing it contained was ever inside the repository',
      'the temporary disposable workdir could not be deleted',
    )
  }
}

// ---------------------------------------------------------------------
// Disposable seeding. THREE PASSWORDLESS identities, then the SAME
// committed synthetic domain fixture, loaded verbatim.
// ---------------------------------------------------------------------

/**
 * The API URL is checked to be the DISPOSABLE loopback API before an admin
 * client can exist. There is no code path to an admin client without it.
 */
function makeAdminClient(apiUrl, serviceRoleKey) {
  let parsed
  try {
    parsed = new URL(apiUrl)
  } catch {
    throw new SafeError('The disposable API URL is unreadable. No admin client is constructed.')
  }
  const loopback = parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost' || parsed.hostname === '[::1]'
  if (!loopback || parsed.port !== String(DISPOSABLE_API_PORT)) {
    throw new SafeError(
      `Refusing to build an admin client: the target is not the disposable loopback API on port ${DISPOSABLE_API_PORT}.`,
    )
  }
  return createClient(apiUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  })
}

/**
 * Create the three disposable Auth identities WITHOUT a password.
 *
 * There is no `password` key in this call and no password anywhere in this
 * file. A passwordless user cannot be signed into with a password by anyone,
 * including this process — which is exactly why this proof cannot be
 * mistaken for, and cannot stand in for, G-1.
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
 * Load the committed fixture verbatim and re-point the three account rows at
 * the disposable addresses — the SAME two steps `seedDisposableDomain()`
 * performs in the interactive runner, so what this proof verifies is the
 * state that runner actually produces.
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
}

const identityByKey = (key) => {
  const found = DISPOSABLE_IDENTITIES.find((identity) => identity.key === key)
  if (found === undefined) throw new SafeError('An unknown disposable identity key was requested.')
  return found
}

/**
 * THE NEGATIVE CONTROLS.
 *
 * Each entry breaks the linkage in a DIFFERENT way, and each `break` is
 * paired with a `restore` that puts the row back exactly as the fixture and
 * the re-point left it. `accounts.auth_user_id` is UNIQUE and carries a
 * foreign key to `auth.users`, so a swap must pass through NULL and a
 * "dangling" id cannot be written at all — the schema itself forbids it,
 * which is why the unlinked and swapped cases are the ones injected.
 */
function negativeControls() {
  const trainer = identityByKey('trainer')
  const management = identityByKey('management')
  const parent = identityByKey('parent')
  return [
    {
      name: 'the Trainer account row is UNLINKED (auth_user_id set to NULL)',
      break: `UPDATE public.accounts SET auth_user_id = NULL WHERE id = '${trainer.accountId}';`,
      restore: `UPDATE public.accounts SET auth_user_id = '${trainer.authId}' WHERE id = '${trainer.accountId}';`,
    },
    {
      name: 'the Trainer and Management rows are SWAPPED onto each other’s Auth id',
      break:
        `UPDATE public.accounts SET auth_user_id = NULL WHERE id IN ('${trainer.accountId}', '${management.accountId}');\n` +
        `UPDATE public.accounts SET auth_user_id = '${management.authId}' WHERE id = '${trainer.accountId}';\n` +
        `UPDATE public.accounts SET auth_user_id = '${trainer.authId}' WHERE id = '${management.accountId}';`,
      restore:
        `UPDATE public.accounts SET auth_user_id = NULL WHERE id IN ('${trainer.accountId}', '${management.accountId}');\n` +
        `UPDATE public.accounts SET auth_user_id = '${trainer.authId}' WHERE id = '${trainer.accountId}';\n` +
        `UPDATE public.accounts SET auth_user_id = '${management.authId}' WHERE id = '${management.accountId}';`,
    },
    {
      name: 'the Parent row carries an address that is not its disposable one',
      break: `UPDATE public.accounts SET normalized_email = 'not.the.parent@f17-disposable.example.test' WHERE id = '${parent.accountId}';`,
      restore: `UPDATE public.accounts SET normalized_email = '${parent.email}' WHERE id = '${parent.accountId}';`,
    },
    {
      name: 'the Trainer has no ACTIVE membership, so no role can be read for it',
      // 'deactivated' is the schema's own terminal status, and
      // centre_memberships_deactivated_chk requires deactivated_at to be set
      // with it, so this break is a LEGAL row the check must still reject.
      break: `UPDATE public.centre_memberships SET status = 'deactivated', deactivated_at = now() WHERE account_id = '${trainer.accountId}';`,
      restore: `UPDATE public.centre_memberships SET status = 'active', deactivated_at = NULL WHERE account_id = '${trainer.accountId}';`,
    },
  ]
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

  say('B.E.S.T Coach — autonomous DISPOSABLE IDENTITY-LINKAGE proof')
  say('No password exists on any path in this proof. The three disposable identities are created')
  say('PASSWORDLESS through the Auth Admin API. G-1 is NOT claimed here and stays NOT-RUN.')

  /* ------------------------------------------------------------------
   * Refuse before provisioning anything.
   * ----------------------------------------------------------------- */
  phase('Before anything is provisioned')

  const config = assertCanonicalConfigUntouched()
  info(
    `supabase/config.toml (${config.bytes} bytes, sha256 ${config.sha256.slice(0, 16)}…) still pins ` +
      `"${CANONICAL_PROJECT_ID}"; no project reference exists`,
  )
  const distinct = assertNoCollision()
  info(`disposable identifiers collide with no canonical one: ports ${distinct.ports.join(', ')}`)

  const running = runningContainers()
  const canonicalMissing = CANONICAL_CONTAINERS.filter((name) => !running.has(name))
  if (canonicalMissing.length > 0) {
    throw new SafeError(
      `${canonicalMissing.length} canonical container(s) are not running. This proof reads the canonical ` +
        'database and refuses to start it, stop it or repair it.',
    )
  }
  readings.canonicalBefore = readCanonical()
  assertCanonicalPristine(readings.canonicalBefore, 'before provisioning')
  info(
    `canonical fixture checksum ${readings.canonicalBefore.checksum.sha256} over ` +
      `${readings.canonicalBefore.checksum.rows} rows; census ${readings.canonicalBefore.census}`,
  )

  const strayContainers = disposableContainersPresent()
  const strayVolumes = disposableVolumesPresent()
  const busyPorts = []
  for (const port of DISPOSABLE_PUBLISHED_PORTS) {
    if (!(await isPortFree(port)) || (await portAnswers(port))) busyPorts.push(port)
  }
  if (strayContainers.length > 0 || strayVolumes.length > 0 || busyPorts.length > 0) {
    throw new SafeError(
      `Refusing to start: ${strayContainers.length} disposable container(s), ${strayVolumes.length} volume(s) and ` +
        `${busyPorts.length} busy disposable port(s) are already present. Remove them first.`,
    )
  }

  /* ------------------------------------------------------------------
   * Provision.
   * ----------------------------------------------------------------- */
  phase('Disposable workdir (outside the repository) and stack')
  const cli = resolveLocalCli()
  acquired.cli = cli
  info(`CLI resolved as: ${cli.form}`)
  const { workdir, migrations } = createDisposableWorkdir()
  acquired.workdir = workdir
  if (migrations.length !== EXPECTED_CANONICAL_MIGRATIONS) {
    throw new SafeError(`${migrations.length} committed migrations were copied; ${EXPECTED_CANONICAL_MIGRATIONS} are required.`)
  }

  info('CLI stdout and stderr are captured and DISCARDED: the CLI prints local keys on success')
  acquired.startAttempted = true
  const started = startDisposableStack(cli, workdir)
  acquired.stackStarted = true

  const census = readDisposableCensus()
  if (census.appliedMigrations !== EXPECTED_CANONICAL_MIGRATIONS || census.authUsers !== 0) {
    throw new SafeError(
      `The disposable stack came up with ${census.appliedMigrations} applied migration(s) and ` +
        `${census.authUsers} Auth user(s); ${EXPECTED_CANONICAL_MIGRATIONS} and 0 are required.`,
    )
  }
  info(
    `stack up in ${Math.round(started.elapsedMs / 1000)}s; ${census.appliedMigrations} migrations applied; ` +
      `0 Auth users, 0 reports, 0 audit events`,
  )

  // Captured into process memory only. Nothing below prints or stores it.
  const connection = captureDisposableStatus(cli, workdir)

  /* ------------------------------------------------------------------
   * Seed: three PASSWORDLESS identities, then the committed fixture.
   * ----------------------------------------------------------------- */
  phase('Three PASSWORDLESS disposable identities, then the committed fixture')
  const admin = makeAdminClient(connection.apiUrl, connection.serviceRoleKey)
  const created = await createPasswordlessIdentities(admin)
  info(`${created.length} passwordless synthetic Auth identities created on the disposable stack`)
  seedDisposableDomain()
  info('the SAME committed synthetic domain fixture loaded verbatim, then the three addresses re-pointed')

  /* ------------------------------------------------------------------
   * L-1 — REPRODUCE the defect as a measurement.
   * ----------------------------------------------------------------- */
  phase('L-1 — how psql actually renders these booleans')
  const rendering = psqlRows(
    DISPOSABLE_DB_CONTAINER,
    'SELECT (u.id IS NOT NULL)::text, (u.id IS NOT NULL) ' +
      'FROM public.accounts a LEFT JOIN auth.users u ON u.id = a.auth_user_id ' +
      "WHERE a.id = '" +
      identityByKey('trainer').accountId +
      "';",
  )[0]
  const castField = rendering?.[0]
  const bareField = rendering?.[1]
  // The row IS linked at this point, so the honest rendering of both fields
  // is "true" and "t". The OLD predicate `field === 't'` applied to the CAST
  // field is therefore false on correct data — that is the whole defect,
  // measured rather than argued.
  const legacyPredicate = castField === 't'
  const fixedPredicate = readBoolean(castField)
  checkFrom(
    'L-1',
    castField === 'true' && bareField === 't' && legacyPredicate === false && fixedPredicate === true,
    `psql renders the EXPLICIT (u.id IS NOT NULL)::text cast as "${castField}" and the BARE boolean as ` +
      `"${bareField}" for a row that really is linked; the old predicate (field === "t") therefore evaluated ` +
      `${legacyPredicate} on correct data, while readBoolean() evaluates ${fixedPredicate} — the reported ` +
      '"Trainer … is not linked" failure was a reader defect, not a linkage defect',
    `unexpected rendering: cast field "${castField}", bare field "${bareField}", legacy predicate ` +
      `${legacyPredicate}, readBoolean ${String(fixedPredicate)}`,
  )

  /* ------------------------------------------------------------------
   * L-2 — exactly three disposable Auth users, with the expected identity.
   * ----------------------------------------------------------------- */
  phase('L-2 — the disposable Auth users themselves')
  const authRows = psqlRows(DISPOSABLE_DB_CONTAINER, 'SELECT id::text, email FROM auth.users ORDER BY id::text;')
    .filter((row) => row.length === 2)
    .map((row) => ({ id: row[0], email: row[1] }))
  const expectedAuth = new Map(DISPOSABLE_IDENTITIES.map((identity) => [identity.authId, identity.email]))
  const unexpectedAuth = authRows.filter((row) => expectedAuth.get(row.id) !== row.email)
  checkFrom(
    'L-2',
    authRows.length === DISPOSABLE_IDENTITIES.length &&
      new Set(authRows.map((row) => row.id)).size === DISPOSABLE_IDENTITIES.length &&
      unexpectedAuth.length === 0,
    `auth.users on the disposable stack holds exactly ${authRows.length} row(s), one per role, each with the id ` +
      'this run asked the Admin API to create AND the disposable .example.test address created with it — so each ' +
      'is an identity THIS RUN made on THIS stack, not an inherited or shared one',
    `${authRows.length} Auth row(s) present; ${unexpectedAuth.length} did not match an expected id/address pair`,
  )

  /* ------------------------------------------------------------------
   * L-3 .. L-5 — the SHIPPED assertion, run against real data.
   * ----------------------------------------------------------------- */
  phase('L-3 .. L-5 — the shipped linkage verification')
  const linkage = verifyDisposableIdentityLinkage()
  const measured = linkage.measured
  const perRowOk =
    linkage.ok &&
    measured.rows === DISPOSABLE_IDENTITIES.length &&
    measured.accounts === DISPOSABLE_IDENTITIES.length
  checkFrom(
    'L-3',
    perRowOk,
    `all ${measured.rows} account rows were read back individually and each carries the EXACT auth_user_id this ` +
      'run created for its own role, resolving to the auth.users row bearing that role’s disposable address ' +
      '(this is the shipped verifyDisposableIdentityLinkage(), not a copy)',
    `the shipped verification reported: ${linkage.failures.join('; ')}`,
  )
  checkFrom(
    'L-4',
    linkage.ok && measured.distinctAuthIds === DISPOSABLE_IDENTITIES.length,
    `the ${DISPOSABLE_IDENTITIES.length} account rows reference ${measured.distinctAuthIds} DISTINCT Auth ids, and ` +
      `each row has an ACTIVE centre_memberships row with its expected role in centre ${FIXTURE_CENTRE_ID} — ` +
      'no two roles share an identity and no role is silently mis-typed',
    `distinct Auth ids measured: ${measured.distinctAuthIds}; failures: ${linkage.failures.join('; ')}`,
  )
  checkFrom(
    'L-5',
    linkage.ok && measured.danglingAccounts === 0 && measured.accountsWithoutAuthId === 0,
    `0 account rows are unlinked, 0 point at an auth.users id absent from this stack, and 0 point outside the ` +
      'intended disposable set. RECONCILIATION: the three UUIDs are the committed fixture’s own structural ' +
      'literals, reused so the fixture can be replayed VERBATIM; a UUID is a public, committed, non-secret join ' +
      'key and is not what authenticates. They name CANONICAL Auth rows only inside the canonical container — on ' +
      'THIS stack the rows bearing them were created by THIS run, in a separate database with a separate Auth ' +
      'issuer, and L-2 measured that each carries a disposable-only address. What is never reused is the address ' +
      'or the password.',
    `unlinked ${measured.accountsWithoutAuthId}, dangling ${measured.danglingAccounts}; ` +
      `failures: ${linkage.failures.join('; ')}`,
  )

  /* ------------------------------------------------------------------
   * L-6 — NEGATIVE CONTROL. A check that cannot fail proves nothing.
   * ----------------------------------------------------------------- */
  phase('L-6 — negative control: break the linkage on purpose, four ways')
  const controls = negativeControls()
  const outcomes = []
  for (const control of controls) {
    psqlRows(DISPOSABLE_DB_CONTAINER, `BEGIN;\n${control.break}\nCOMMIT;\nSELECT 1;`)
    const broken = verifyDisposableIdentityLinkage()
    psqlRows(DISPOSABLE_DB_CONTAINER, `BEGIN;\n${control.restore}\nCOMMIT;\nSELECT 1;`)
    const restored = verifyDisposableIdentityLinkage()
    outcomes.push({ name: control.name, detected: broken.ok === false, restored: restored.ok === true })
    info(
      `${control.name} -> detected=${broken.ok === false} (${broken.failures.length} authored failure reason(s)), ` +
        `restored=${restored.ok === true}`,
    )
  }
  const undetected = outcomes.filter((entry) => !entry.detected)
  const unrestored = outcomes.filter((entry) => !entry.restored)
  checkFrom(
    'L-6',
    outcomes.length === controls.length && undetected.length === 0 && unrestored.length === 0,
    `all ${outcomes.length} deliberately-wrong linkages were REJECTED by the shipped assertion, and the assertion ` +
      'passed again after each was restored — so this check is capable of failing, and its PASS above is evidence ' +
      'rather than a tautology',
    `${undetected.length} wrong linkage(s) went UNDETECTED and ${unrestored.length} did not restore cleanly: ` +
      `${[...undetected, ...unrestored].map((entry) => entry.name).join('; ')}`,
  )

  /* ------------------------------------------------------------------
   * L-7 — the canonical database, while the disposable stack is up.
   * ----------------------------------------------------------------- */
  phase('L-7 — the canonical database while the disposable stack is up')
  const canonicalDuring = readCanonical()
  const duringDiff = diffCanonical(readings.canonicalBefore, canonicalDuring)
  checkFrom(
    'L-7',
    duringDiff.length === 0,
    `the canonical fixture checksum is still ${canonicalDuring.checksum.sha256} over ` +
      `${canonicalDuring.checksum.rows} rows, its census is unchanged, and auth.users still holds ` +
      `${canonicalDuring.authUsers} row(s) — measured, not assumed`,
    `the canonical database changed while the disposable stack was up: ${duringDiff.join('; ')}`,
  )

  /* ------------------------------------------------------------------
   * Teardown, then an INDEPENDENT canonical re-read.
   * ----------------------------------------------------------------- */
  await teardown()

  phase('L-12 — the canonical database after teardown, re-read independently')
  readings.canonicalAfter = readCanonical()
  const afterDiff = diffCanonical(readings.canonicalBefore, readings.canonicalAfter)
  checkFrom(
    'L-12',
    afterDiff.length === 0,
    `re-read after teardown: checksum ${readings.canonicalAfter.checksum.sha256} over ` +
      `${readings.canonicalAfter.checksum.rows} rows, census and migration list identical, auth.users still ` +
      `${readings.canonicalAfter.authUsers} — byte-identical to the reading taken before provisioning`,
    `the canonical database differs after teardown: ${afterDiff.join('; ')}`,
  )
}

// ---------------------------------------------------------------------
// Evidence. Written OUTSIDE Git. Redacted by construction: only check ids,
// verdicts, authored reasons, counts, container names and PUBLIC checksums.
// There is no field here a credential could occupy.
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

function writeProofLedger() {
  const lines = []
  lines.push('# F17 — disposable identity-linkage proof')
  lines.push('')
  lines.push('Produced by `node scripts/physical-test/prove-disposable-identity-linkage.mjs`.')
  lines.push('PASSWORDLESS: the three disposable identities are created through the Auth Admin API with no')
  lines.push('password, so no credential exists on any path in that runner. G-1 is NOT claimed and stays NOT-RUN.')
  lines.push('REDACTED BY CONSTRUCTION: check ids, verdicts, authored reasons, counts, container names and')
  lines.push('public checksums only. No password, token, key, cookie or connection string.')
  lines.push('')
  lines.push(`- Completed: ${new Date().toISOString()}`)
  lines.push(`- Canonical project: ${CANONICAL_PROJECT_ID} (left running and untouched)`)
  lines.push(`- Disposable project: ${DISPOSABLE_PROJECT_ID} (provisioned, then removed)`)
  lines.push(`- Canonical checksum before: ${readings.canonicalBefore?.checksum.sha256 ?? 'not read'}`)
  lines.push(`- Canonical checksum after:  ${readings.canonicalAfter?.checksum.sha256 ?? 'not read'}`)
  lines.push('')
  lines.push('| Check | Verdict | Reason |')
  lines.push('|---|---|---|')
  for (const [id, title] of CHECK_TITLES) {
    const entry = ledger.get(id) ?? { verdict: 'NOT-RUN', reason: 'not reached' }
    lines.push(`| **${id}** ${title} | ${entry.verdict} | ${entry.reason.replace(/\|/g, '/')} |`)
  }
  lines.push('')
  try {
    const directory = evidenceDirectory()
    writeFileSync(join(directory, 'disposable-identity-linkage-proof.md'), `${lines.join('\n')}\n`, 'utf8')
    say('')
    say(`Redacted proof ledger written to ${directory}`)
  } catch {
    say('')
    say('The proof ledger could not be written to the external evidence pack.')
  }
}

function printLedger() {
  phase('Proof ledger')
  for (const [id, title] of CHECK_TITLES) {
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
  closeLedger('not reached: the proof ended before this check could be decided')
  printLedger()
  writeProofLedger()
}

let interrupted = false
const onSignal = () => {
  if (interrupted) return
  interrupted = true
  process.stdout.write('\nAborting. Removing the disposable stack, then writing the ledger.\n')
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
    const message = error instanceof SafeError ? error.message : 'The disposable identity-linkage proof failed.'
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
    const bad = [...ledger.values()].filter((entry) => entry.verdict !== 'PASS').length
    if (bad > 0 && process.exitCode !== 130) process.exitCode = 1
  })
