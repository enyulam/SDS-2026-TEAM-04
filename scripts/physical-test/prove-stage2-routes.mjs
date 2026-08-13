#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach — STAGE 2 route reachability and the unauthenticated
// portal boundary, on a DISCIPLINED served child process
// =====================================================================
//
// Run: node scripts/physical-test/prove-stage2-routes.mjs
//      npm run prove:stage2-routes
//
// WHAT THIS IS. Stage 2 delivered the UI for all three roles in chain
// order. `tsc` and `eslint` prove it compiles; they prove NOTHING about
// whether the application actually serves those surfaces. A chain that
// typechecks and then answers 500 on the first route is not a
// demonstration, and finding that out during the rehearsal is exactly the
// cost this project cannot afford.
//
// It asserts two things per route, and refuses to conflate them:
//
//   1. REACHABILITY — the route is served and does not fault. A 5xx is a
//      FAIL. So is a 404, which would mean the surface does not exist at
//      the path the chain links to.
//   2. THE UNAUTHENTICATED PORTAL BOUNDARY — every `/trainer`,
//      `/management` and `/parent` route answers an unauthenticated caller
//      with a REDIRECT to the login surface, decided SERVER-SIDE. A 200
//      carrying portal content would be a real finding: it would mean the
//      boundary is a client-side concern, which is the exact failure
//      `CLAUDE.md` §3.1 and ADR-4 forbid ("never by hiding UI").
//
// WHAT THIS IS NOT — stated because the gap matters more than the result.
// It drives NO authenticated surface. Every assertion here is made as an
// ANONYMOUS caller, so it proves the guard REFUSES and proves nothing
// about what an authorized trainer, management user or parent sees. The
// authenticated legs need an ADMIN-MINTED SESSION and a browser under
// §7.4a and belong to Stage 3; they are recorded NOT-RUN, never PASS.
// A redirect is evidence of a refusal, never evidence of a sign-in.
//
// SERVING DISCIPLINE. The server is started through
// `serving-discipline.mjs`, so S-1 (the three AI provider selectors
// OVERWRITTEN, never deleted), S-2 and S-3 all apply to this run exactly
// as they applied to the isolated proof. The trip-wire is armed for the
// whole run.
//
// EXIT: 0 all checks PASS · 1 any check not PASS or main() threw · 130 signal.
// =====================================================================

import { createServer } from 'node:net'

import {
  ServingDisciplineError,
  assertRealProviderLegUnset,
  createTripWire,
  serveDisciplined,
  stopServed,
} from './serving-discipline.mjs'

const PROOF_APP_PORT = 3420

/**
 * The Stage 2 chain, in the order the overlay lists it. Every path is one
 * a delivered surface actually links to.
 *
 * The parameterised routes carry the COMMITTED synthetic fixture's own
 * identifiers — public, non-secret join keys already present in
 * `scripts/fixtures/local_fixtures.sql`. They are here so the route
 * SEGMENT SHAPE is exercised; an anonymous caller is redirected before any
 * row is read, so no row is read by this proof.
 */
const FIXTURE_SESSION = 'c5000000-0000-4000-8000-000000000001'
const FIXTURE_STUDENT = 'c2000000-0000-4000-8000-000000000001'
/**
 * A syntactically valid report id that intentionally matches no row. A
 * report-keyed route must still be SERVED for it — the governed refusal is
 * the server's job, and a 404 from the router would mean the surface is
 * missing rather than the report.
 */
const OPAQUE_REPORT = '00000000-0000-4000-8000-0000000000b1'

const CHAIN = [
  ['trainer', '/trainer', 'Trainer entry (compatibility redirect)'],
  ['trainer', '/trainer/schedule', 'Trainer session entry — screen 05'],
  ['trainer', `/trainer/sessions/${FIXTURE_SESSION}/roster`, 'Roster + governed attendance toggle — screen 06'],
  ['trainer', `/trainer/sessions/${FIXTURE_SESSION}/students/${FIXTURE_STUDENT}/assess`, 'Nine ratings + observations — screen 07'],
  ['trainer', `/trainer/reports/${OPAQUE_REPORT}/generate`, 'Request draft — screen 08'],
  ['trainer', `/trainer/reports/${OPAQUE_REPORT}/review`, 'Trainer review + checklist + approve'],
  ['trainer', `/trainer/reports/${OPAQUE_REPORT}/edit`, 'Trainer edit'],
  ['trainer', '/trainer/reports', 'Returned-reports queue'],
  ['management', '/management/dashboard', 'Management dashboard'],
  ['management', '/management/reports', 'Management pending list'],
  ['management', `/management/reports/${OPAQUE_REPORT}/review`, 'Management detail + Approve & Submit'],
  ['management', `/management/reports/${OPAQUE_REPORT}/edit`, 'Management WORDING-ONLY editor'],
  ['parent', '/parent', 'Parent dashboard (Q-27: no ratings card)'],
  ['parent', '/parent/reports', 'Parent reports list'],
  ['parent', `/parent/students/${FIXTURE_STUDENT}/sessions/${FIXTURE_SESSION}/report`, 'Parent submitted detail — OD-4 panels only'],
]

const say = (message) => process.stdout.write(`${message}\n`)
const phase = (message) => say(`\n[ ${message} ]`)

const results = []
let failures = 0

function record(id, verdict, reason) {
  results.push({ id, verdict, reason })
  if (verdict !== 'PASS') failures += 1
  say(`  ${verdict.padEnd(7)} ${id} — ${reason}`)
}

const owned = { server: null }

function isPortFree(port) {
  const probe = createServer()
  return new Promise((settle) => {
    probe.once('error', () => settle(false))
    probe.once('listening', () => probe.close(() => settle(true)))
    probe.listen(port, '127.0.0.1')
  })
}

/** Is this a server-side redirect onto the login surface? */
function redirectsToLogin(status, location) {
  if (status < 300 || status >= 400) return false
  if (typeof location !== 'string' || location.length === 0) return false
  // Relative or absolute, with or without a `redirectTo`-style query.
  const path = location.startsWith('http') ? new URL(location).pathname : location.split('?')[0]
  return path === '/login'
}

async function main() {
  say('B.E.S.T Coach — STAGE 2 route reachability + unauthenticated portal boundary')
  say('Every request below is ANONYMOUS. A redirect proves a REFUSAL, never a sign-in.')
  assertRealProviderLegUnset()

  if (!(await isPortFree(PROOF_APP_PORT))) {
    throw new ServingDisciplineError(
      `Port ${PROOF_APP_PORT} is already held. This proof refuses to attach to a server it did not start.`,
    )
  }

  phase('serving, under the §7.4a discipline')
  const served = await serveDisciplined({ mode: 'dev', port: PROOF_APP_PORT })
  owned.server = served.child
  say(
    `  ....  served on 127.0.0.1:${PROOF_APP_PORT}; ${served.record.overwritten.length} provider selectors ` +
      'OVERWRITTEN (never deleted) in the child environment',
  )
  const tripWire = createTripWire(served.child.pid)
  tripWire.sample()

  phase('the Stage 2 chain, in order')
  for (const [role, path, description] of CHAIN) {
    let response
    try {
      response = await fetch(`${served.origin}${path}`, { redirect: 'manual' })
      await response.text()
    } catch {
      record(path, 'FAIL', `${description} — the served application did not answer`)
      continue
    }
    const status = response.status
    const location = response.headers.get('location')

    if (status >= 500) {
      record(path, 'FAIL', `${description} — the surface FAULTED (${status})`)
      continue
    }
    if (status === 404) {
      record(path, 'FAIL', `${description} — NOT SERVED (404); the chain links to a path that does not exist`)
      continue
    }
    if (redirectsToLogin(status, location)) {
      record(
        path,
        'PASS',
        `${description} — served, and the ${role} portal boundary REFUSED the anonymous caller server-side (${status} -> /login)`,
      )
      continue
    }
    // Served, but did not refuse. That is the finding this proof exists for.
    record(
      path,
      'FAIL',
      `${description} — answered ${status} to an ANONYMOUS caller without redirecting to /login. A portal ` +
        'boundary that does not refuse server-side is not a boundary (ADR-4: never by hiding UI)',
    )
    tripWire.sample()
  }

  phase('the login surface itself must NOT redirect')
  const login = await fetch(`${served.origin}/login`, { redirect: 'manual' })
  await login.text()
  record(
    '/login',
    login.status === 200 ? 'PASS' : 'FAIL',
    login.status === 200
      ? 'the authentication surface is served to an anonymous caller, as it must be — otherwise every redirect above would be a loop'
      : `the login surface answered ${login.status}; the redirects above would have nowhere to land`,
  )

  phase('S-3 — the trip-wire, across the whole run')
  for (let sample = 0; sample < 3; sample += 1) tripWire.sample()
  const wire = tripWire.result()
  record(
    'S-3',
    wire.measured === true && wire.foreign === 0 ? 'PASS' : 'FAIL',
    wire.measured === true
      ? wire.foreign === 0
        ? `${wire.samples} samples across the served process tree (up to ${wire.maxTreeSize} processes): ZERO non-loopback TCP peers`
        : `${wire.foreign} non-loopback TCP peers were observed; addresses are deliberately not reported`
      : `the trip-wire could not be measured (${wire.unreadable} unreadable samples) — "not measured" is not "measured zero"`,
  )
}

let exitCode = 1
try {
  await main()
  phase('NOT-RUN, recorded rather than merged into the ledger above')
  say('  NOT-RUN  every AUTHENTICATED surface. This proof drives no session at all, so it proves')
  say('           the guard REFUSES and nothing about what an authorized caller sees. Those legs')
  say('           need an ADMIN-MINTED SESSION and a browser under §7.4a and belong to Stage 3.')
  say('  NOT-RUN  `next build`. This served `next dev`; the production build is a Stage 3 gate.')
  phase('VERDICT')
  if (failures === 0) {
    exitCode = 0
    say(`PASS — ${results.length} checks. Every Stage 2 chain route is served and every portal route`)
    say('refuses an anonymous caller server-side. Session evidence verdict, NOT Operator Accepted.')
  } else {
    say(`FAIL — ${failures} of ${results.length} checks did not pass.`)
  }
} catch (error) {
  phase('VERDICT')
  say(
    `FAIL — ${
      error instanceof ServingDisciplineError
        ? error.message
        : 'An unexpected error ended the run. Its message is deliberately not surfaced.'
    }`,
  )
} finally {
  stopServed(owned.server)
}

process.exit(exitCode)
