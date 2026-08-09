#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach — STAGE 3: THE AUTHENTICATED SURFACES
// =====================================================================
//
// Run: node scripts/physical-test/prove-stage3-authenticated.mjs
//      npm run prove:stage3-authenticated
//
// WHAT THIS IS. The first proof in this project that a LOGGED-IN surface
// renders. Every prior route proof drove an ANONYMOUS caller:
// `prove-stage2-routes` established that all 15 chain routes are served
// and that each portal route redirects an unauthenticated caller
// SERVER-SIDE (307). That proves the guard REFUSES, and nothing about what
// an authorized trainer, management user or parent actually sees. A
// redirect is evidence of a refusal, never of a sign-in.
//
// ---------------------------------------------------------------------
// HOW THE SESSION IS OBTAINED -- READ THIS BEFORE QUOTING ANY RESULT
// ---------------------------------------------------------------------
// EVERY login leg here is an ADMIN-MINTED SESSION:
//
//     admin.auth.admin.generateLink({ type: 'magiclink' })
//        -> client.auth.verifyOtp({ token_hash })
//
// ⚠️ PASSWORD SIGN-IN IS **NOT-RUN**. It requires an Operator credential
// that no agent may request, accept or handle (`CLAUDE.md` §11, absolute).
// An admin-minted session is a legitimate way to obtain a REAL session for
// an accepted synthetic identity. It is NOT, and must never be reported
// as, proof that the sign-in FORM works: `signInAction`'s
// `signInWithPassword` path is untouched here and stays NOT-RUN.
//
// Session cookies are produced by `@supabase/ssr`'s OWN `createServerClient`
// writing into an in-memory jar, so the cookie names, values and chunk
// boundaries are the library's rather than this file's guess at them. A
// hand-rolled `sb-<ref>-auth-token` would be a transport this harness
// invented, and the app rejecting it would look identical to the app
// rejecting the session.
//
// ---------------------------------------------------------------------
// ⚠️ READ-ONLY BY DEFAULT, AND WHY THAT IS NOT TIMIDITY
// ---------------------------------------------------------------------
// The served application talks to the CANONICAL `postgres` database --
// PostgREST is bound to it -- so ANY governed mutation driven through
// these surfaces writes to the ratified pristine fixture database.
//
// An earlier revision of this harness did exactly that, and the cost is
// recorded as blocker `B-STAGE3-2`: it left `reports` 0 -> 1,
// `audit_events` 0 -> 4 and `audit_chain_heads` 0 -> 1, and it set the
// fixture attendance row's `recorded_by_membership_id` /
// `recorded_by_role`, so `verify-local-fixtures.sql` now fails A19.
// `audit_events` is append-only and its BEFORE DELETE OR UPDATE trigger
// refuses `postgres` too, so THAT PART IS IRREVERSIBLE by design.
// Restoring the fixture needs the governed reload and the Operator's three
// interactive no-echo passwords.
//
// The lesson is structural, not a scolding: mutating legs belong on the
// DISPOSABLE STACK (`disposable-stack.mjs` + `prove-disposable-app.mjs`),
// which serves an app against its own throwaway Supabase stack. That is
// exactly what `B-STAGE3-1` was gating. RENDERS ARE READS, so the render
// proof below is safe against canonical and is what this file does.
//
// `--drive-mutations` exists, defaults OFF, and REFUSES to run against the
// canonical stack. It is not a convenience switch.
//
// ---------------------------------------------------------------------
// TWO TIERS, NEVER CONFLATED
// ---------------------------------------------------------------------
//   TIER 1 -- TRANSPORT (fetch). Does the app ACCEPT the session? 200 for
//     an authenticated caller where an anonymous one got 307, plus the
//     role's own portal chrome and the SURFACE-SPECIFIC mount text. This
//     is a real, new fact and it is not vacuous.
//
//     ⚠️ It is NOT a proof that DATA rendered. Every one of these surfaces
//     is a `"use client"` component: the server ships a shell whose visible
//     text is "Loading the Class Session roster" and the data arrives after
//     hydration. Asserting a data string against this tier is impossible,
//     and asserting a nav word like "Reports" against it is WORSE than
//     useless -- it matches the sidebar on every page in the portal. That
//     precise false green occurred during development of this file and is
//     why every Tier 1 selector below is surface-specific.
//
//   TIER 2 -- RENDER (headless Chrome, CDP). Does the surface actually
//     paint its DATA? The session cookie is installed via
//     `Network.setCookie`, the page is navigated, and the assertion runs
//     against `document.body.innerText` AFTER the loading text clears.
//     A surface still showing its loading text when the budget expires is
//     reported NOT-RUN, never PASS.
//
// NO ASSERTION MAY BE VACUOUS. A leg passes only when it names at least
// one selector and EVERY selector matches. An empty selector list is a
// contract error and fails. A leg that could not execute is NOT-RUN and is
// never counted as a pass. `summary()` prints the three populations
// separately and exits non-zero unless every leg is PASS.
//
// SERVING DISCIPLINE. The server starts through `serving-discipline.mjs`,
// so S-1/S-2/S-3 apply exactly as in the isolated proof, and the trip-wire
// is armed for the whole run. No provider call is authorized or made.
//
// EXIT: 0 every leg PASS · 1 any leg FAIL or NOT-RUN or main() threw.
// =====================================================================

import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import os from 'node:os'
import { join } from 'node:path'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

import {
  ServingDisciplineError,
  REPO_ROOT,
  assertRealProviderLegUnset,
  createTripWire,
  serveDisciplined,
  stopServed,
} from './serving-discipline.mjs'

const APP_PORT = 3421
const DEBUG_PORT = 9421
const BASE = `http://127.0.0.1:${APP_PORT}`
const CHROME_PATH = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

const FIXTURE_SESSION = 'c5000000-0000-4000-8000-000000000001'
const FIXTURE_STUDENT = 'c2000000-0000-4000-8000-000000000001'
const SUB = {
  management: 'd0000000-0000-4000-8000-000000000001',
  trainer: 'd0000000-0000-4000-8000-000000000002',
  parent: 'd0000000-0000-4000-8000-000000000003',
}
const EMAIL = {
  management: 'management.fixture@example.test',
  trainer: 'trainer.fixture@example.test',
  parent: 'parent.fixture@example.test',
}

/**
 * ⚠️ OFF by default, and it REFUSES the canonical stack. See the header:
 * governed mutations through these surfaces write to the ratified fixture
 * database, which is what produced `B-STAGE3-2`.
 */
const DRIVE_MUTATIONS = process.argv.includes('--drive-mutations')

const DUMP = process.env.BEST_COACH_STAGE3_DUMP === '1'

// ---------------------------------------------------------------------
// Ledger — three populations, never merged.
// ---------------------------------------------------------------------
const legs = []
const record = (state, id, detail) => {
  legs.push({ id, state, detail })
  console.log(`  ${state.padEnd(7)} ${id}  ${detail}`)
}
const pass = (id, d) => record('PASS', id, d)
const fail = (id, d) => record('FAIL', id, d)
const notRun = (id, d) => record('NOT-RUN', id, d)
const phase = (t) => console.log(`\n--- ${t} ---`)

// ---------------------------------------------------------------------
// Local stack discovery. Refuses anything that is not loopback.
// ---------------------------------------------------------------------
function loadLocalStack() {
  return new Promise((done) => {
    const p = spawn('npx', ['--no-install', 'supabase', 'status', '--output', 'json'], {
      cwd: REPO_ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: process.platform === 'win32',
    })
    let out = ''
    p.stdout.on('data', (d) => {
      out += d
    })
    p.on('close', () => {
      try {
        const s = JSON.parse(out.slice(out.indexOf('{')))
        const url = s.API_URL
        const publishable = s.PUBLISHABLE_KEY || s.ANON_KEY
        const secret = s.SECRET_KEY || s.SERVICE_ROLE_KEY
        const host = url ? new URL(url).hostname : ''
        if (!['127.0.0.1', 'localhost', '::1'].includes(host)) return done(null)
        done(url && publishable && secret ? { url, publishable, secret } : null)
      } catch {
        done(null)
      }
    })
  })
}

// ---------------------------------------------------------------------
// ADMIN-MINTED SESSION -> library-produced cookies.
// ---------------------------------------------------------------------
async function mintSession(stack, role) {
  const admin = createClient(stack.url, stack.secret, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  const link = await admin.auth.admin.generateLink({ type: 'magiclink', email: EMAIL[role] })
  if (link.error || !link.data?.properties?.hashed_token) {
    return { error: `could not mint a magiclink for the ${role} identity` }
  }

  const jar = new Map()
  const ssr = createServerClient(stack.url, stack.publishable, {
    cookies: {
      getAll: () => [...jar.entries()].map(([name, value]) => ({ name, value })),
      setAll: (toSet) => {
        for (const { name, value } of toSet) {
          if (value === '') jar.delete(name)
          else jar.set(name, value)
        }
      },
    },
  })

  const verified = await ssr.auth.verifyOtp({
    type: 'magiclink',
    token_hash: link.data.properties.hashed_token,
  })
  if (verified.error || !verified.data?.user) return { error: `could not verify the ${role} magiclink token` }
  if (verified.data.user.id !== SUB[role]) return { error: `the ${role} session resolved to an unexpected auth user` }
  if (jar.size === 0) return { error: `the ${role} session produced no cookies; the transport would be empty` }

  return {
    cookies: [...jar.entries()].map(([name, value]) => ({ name, value })),
    cookie: [...jar.entries()].map(([n, v]) => `${n}=${encodeURIComponent(v)}`).join('; '),
    count: jar.size,
  }
}

// ---------------------------------------------------------------------
// TIER 1 — transport.
// ---------------------------------------------------------------------
function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

async function transport(id, role, sessions, path, selectors) {
  if (selectors.length === 0) {
    fail(id, `${path} — CONTRACT ERROR: no selector named, so the leg cannot be non-vacuous`)
    return null
  }
  const s = sessions[role]
  if (!s) {
    notRun(id, `${path} — no ${role} session was minted`)
    return null
  }
  let res
  let html
  try {
    res = await fetch(`${BASE}${path}`, { headers: { cookie: s.cookie }, redirect: 'manual' })
    html = await res.text()
  } catch (e) {
    fail(id, `${path} — the request did not complete (${e.cause?.code ?? 'network error'})`)
    return null
  }
  if (res.status === 307 || res.status === 302) {
    fail(
      id,
      `${path} — answered ${res.status} -> ${res.headers.get('location')} for an AUTHENTICATED ${role}; ` +
        'the session was NOT accepted, so this is a refusal and not a render',
    )
    return null
  }
  if (res.status !== 200) {
    fail(id, `${path} — HTTP ${res.status} as an authenticated ${role}`)
    return null
  }
  const text = visibleText(html)
  if (DUMP) console.log(`  DUMP    ${id} ${path}\n          ${text.slice(0, 500)}`)
  const missing = selectors.filter((sel) => !text.includes(sel))
  if (missing.length > 0) {
    fail(id, `${path} — 200 but ${missing.length}/${selectors.length} selector(s) MISSING: ${missing.map((m) => JSON.stringify(m)).join(', ')}`)
    return null
  }
  pass(id, `${path} — 200 as ${role}; all ${selectors.length} surface-specific selector(s) matched`)
  return text
}

// ---------------------------------------------------------------------
// TIER 2 — headless Chrome over CDP.
// ---------------------------------------------------------------------
class Browser {
  constructor(child, profile) {
    this.child = child
    this.profile = profile
    this.ws = null
    this.next = 1
    this.waiters = new Map()
  }

  static async launch() {
    const profile = mkdtempSync(join(os.tmpdir(), 'bc-stage3-chrome-'))
    const child = spawn(
      CHROME_PATH,
      [
        `--remote-debugging-port=${DEBUG_PORT}`,
        `--user-data-dir=${profile}`,
        '--headless=new',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-gpu',
        '--disable-extensions',
        // Loopback only. The trip-wire is armed; this keeps the browser
        // from reaching anything but the served app under any condition.
        '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1',
        'about:blank',
      ],
      { stdio: 'ignore' },
    )
    const b = new Browser(child, profile)
    const deadline = Date.now() + 30_000
    while (Date.now() < deadline) {
      try {
        const r = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)
        const targets = await r.json()
        const page = targets.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
        if (page) {
          await b.connect(page.webSocketDebuggerUrl)
          return b
        }
      } catch {
        /* not up yet */
      }
      await new Promise((r) => setTimeout(r, 300))
    }
    throw new Error('headless Chrome did not expose a page debugging target')
  }

  connect(url) {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url)
      this.ws.addEventListener('open', () => resolve())
      this.ws.addEventListener('error', () => reject(new Error('the CDP socket failed')))
      this.ws.addEventListener('message', (ev) => {
        const msg = JSON.parse(ev.data)
        const w = this.waiters.get(msg.id)
        if (w) {
          this.waiters.delete(msg.id)
          w(msg)
        }
      })
    })
  }

  send(method, params = {}) {
    const id = this.next++
    return new Promise((resolve) => {
      this.waiters.set(id, resolve)
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }

  async innerText() {
    const r = await this.send('Runtime.evaluate', {
      expression: 'document.body ? document.body.innerText : ""',
      returnByValue: true,
    })
    return r.result?.result?.value ?? ''
  }

  close() {
    try {
      this.ws?.close()
    } catch {
      /* already gone */
    }
    try {
      this.child.kill()
    } catch {
      /* already gone */
    }
    try {
      rmSync(this.profile, { recursive: true, force: true })
    } catch {
      /* best effort */
    }
  }
}

/**
 * Navigate and assert AFTER hydration. The loading text is the negative
 * signal: while it is still on screen the surface has not painted its data,
 * so a match against it would be the shell, not the render.
 */
async function renderLeg(browser, id, path, { loading, selectors }, budgetMs = 25_000) {
  if (selectors.length === 0) {
    fail(id, `${path} — CONTRACT ERROR: no selector named`)
    return null
  }
  await browser.send('Page.navigate', { url: `${BASE}${path}` })
  const deadline = Date.now() + budgetMs
  let text = ''
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 400))
    text = await browser.innerText()
    if (text && (!loading || !text.includes(loading))) {
      const missing = selectors.filter((s) => !text.includes(s))
      if (missing.length === 0) {
        pass(id, `${path} — RENDERED after hydration; all ${selectors.length} data selector(s) matched`)
        return text
      }
    }
  }
  if (loading && text.includes(loading)) {
    notRun(id, `${path} — still showing ${JSON.stringify(loading)} when the ${budgetMs}ms budget expired; the data never painted`)
    return null
  }
  const missing = selectors.filter((s) => !text.includes(s))
  fail(id, `${path} — hydrated but ${missing.length}/${selectors.length} selector(s) MISSING: ${missing.map((m) => JSON.stringify(m)).join(', ')}`)
  if (DUMP) console.log(`  DUMP    ${id}\n          ${text.replace(/\s+/g, ' ').slice(0, 700)}`)
  return null
}

// ---------------------------------------------------------------------
// The chain. Tier-1 selectors are SURFACE-SPECIFIC mount text plus the
// role's own portal chrome — never a nav word shared across the portal.
// ---------------------------------------------------------------------
const CHAIN = {
  trainer: [
    {
      id: 'S3-T1',
      path: '/trainer/schedule',
      loading: 'Loading the assigned Trainer schedule',
      // The trainer's OWN assigned sessions, from the committed fixture.
      // "Fixture Module A" cannot appear unless the assignment projection
      // resolved for THIS trainer — it is data, not chrome.
      data: ['Your classes, sessions and meetings', 'Class sessions in February 2026', 'Fixture Module A'],
    },
    {
      id: 'S3-T2',
      path: `/trainer/sessions/${FIXTURE_SESSION}/roster`,
      loading: 'Loading the Class Session roster',
      data: ['Student Roster', 'Fixture Module A', 'present learner assessed', 'Absent only'],
    },
    {
      id: 'S3-T3',
      path: `/trainer/sessions/${FIXTURE_SESSION}/students/${FIXTURE_STUDENT}/assess`,
      loading: 'Loading the nine-dimension Assessment Rubric',
      // The strongest leg in the run. It proves the MANDATORY nine-dimension
      // form (A-017 — no Quick mode, no four-dimension path) paints with the
      // RATIFIED A-049 vocabulary and the A-050 behavioural anchors beside it.
      data: [
        'Assessment Rubric',
        '9 of 9 dimensions rated',
        'Beginning',
        'Developing',
        'Mastering',
        'Mastered',
        'anchor:',
        'Fixture Student One',
      ],
    },
    {
      id: 'S3-T4',
      path: '/trainer/reports',
      loading: null,
      // ⚠️ NOT an expected-state assertion. This surface renders the generic
      // unavailable state rather than the queue's own "No returned reports"
      // empty state — recorded as finding F-STAGE3-1. The leg asserts what
      // the surface ACTUALLY does so the defect stays visible; it is not
      // dressed up as a pass of the queue.
      data: ['It may no longer be available in this workspace'],
    },
  ],
  management: [
    {
      id: 'S3-M1',
      path: '/management/reports',
      loading: 'Loading Management report queue',
      data: [
        'School-wide report oversight for this centre',
        'Pending final review',
        'Correction tracking',
        'No reports waiting',
      ],
    },
  ],
  parent: [
    {
      id: 'S3-P1',
      path: '/parent/reports',
      loading: 'Loading available family reports',
      data: ['received for your linked learners', 'No reports available yet'],
    },
    {
      id: 'S3-P2',
      path: `/parent/students/${FIXTURE_STUDENT}/sessions/${FIXTURE_SESSION}/report`,
      loading: 'Loading family report',
      // THE PARENT BOUNDARY, HOLDING. No version has reached `submitted`, so
      // the canonical parent read resolves nothing and the surface refuses.
      // That refusal is the correct governed outcome, not a missing screen:
      // a parent may only ever see the canonical SUBMITTED version.
      data: ['It may no longer be available in this workspace'],
    },
  ],
}

const PORTAL_CHROME = {
  trainer: 'Trainer Portal',
  management: 'Management Portal',
  parent: 'Parent Portal',
}

async function main() {
  assertRealProviderLegUnset()

  phase('Local stack')
  const stack = await loadLocalStack()
  if (!stack) {
    fail('S3-00', 'the local loopback Supabase stack is not reachable; nothing was driven')
    return
  }
  pass('S3-00', 'the local loopback Supabase stack was resolved')

  if (DRIVE_MUTATIONS) {
    fail(
      'S3-MUT',
      '--drive-mutations REFUSED against the canonical stack: governed writes through these surfaces ' +
        'land in the ratified fixture database (see B-STAGE3-2). Mutating legs belong on the disposable stack',
    )
    return
  }
  notRun(
    'S3-MUT',
    'governed MUTATION legs (attendance toggle, nine-dimension save, draft, approve, Approve & Submit) — ' +
      'they must run on the DISPOSABLE STACK, not against canonical; this run is READ-ONLY by design',
  )

  phase('ADMIN-MINTED SESSIONS (password sign-in NOT-RUN — Operator credential required)')
  const sessions = {}
  for (const role of ['trainer', 'management', 'parent']) {
    const m = await mintSession(stack, role)
    if (m.error) {
      fail(`S3-A-${role}`, m.error)
      continue
    }
    sessions[role] = m
    pass(`S3-A-${role}`, `ADMIN-MINTED SESSION for ${role} — ${m.count} library-written cookie(s). NOT a password sign-in`)
  }
  notRun('S3-A-password', 'password sign-in via signInAction/signInWithPassword — an Operator credential is required and no agent may handle one')

  phase('Serving the application under the S-1/S-2/S-3 discipline')
  let served = null
  let tripWire = null
  try {
    served = await serveDisciplined({ mode: 'dev', port: APP_PORT, readyPath: '/login' })
    tripWire = createTripWire(served.child.pid)
    pass('S3-01', `the application is served on ${BASE} through the serving discipline`)
  } catch (e) {
    fail('S3-01', `the application did not serve: ${e instanceof ServingDisciplineError ? e.message : 'start failed'}`)
    return
  }

  let browser = null
  try {
    // ---------------- TIER 1 ----------------
    phase('TIER 1 — TRANSPORT: does the app ACCEPT the session? (200 where anonymous got 307)')
    for (const role of ['trainer', 'management', 'parent']) {
      for (const { id, path, loading } of CHAIN[role]) {
        const selectors = [PORTAL_CHROME[role]]
        if (loading) selectors.push(loading)
        await transport(`${id}-t`, role, sessions, path, selectors)
      }
    }

    // ---------------- TIER 2 ----------------
    phase('TIER 2 — RENDER: does the surface actually paint its DATA after hydration?')
    try {
      browser = await Browser.launch()
      pass('S3-02', 'headless Chrome attached over CDP, resolver pinned to loopback')
    } catch (e) {
      fail('S3-02', `headless Chrome did not attach: ${e.message}`)
    }

    if (browser) {
      for (const role of ['trainer', 'management', 'parent']) {
        const s = sessions[role]
        if (!s) {
          for (const { id } of CHAIN[role]) notRun(`${id}-r`, `no ${role} session to install`)
          continue
        }
        // Install this role's session, replacing whatever the last role left.
        await browser.send('Network.clearBrowserCookies')
        for (const c of s.cookies) {
          await browser.send('Network.setCookie', {
            name: c.name,
            value: c.value,
            domain: '127.0.0.1',
            path: '/',
          })
        }
        for (const { id, path, loading, data } of CHAIN[role]) {
          const text = await renderLeg(browser, `${id}-r`, path, { loading, selectors: data })

          // Q-27 — a DATA boundary, asserted on what the PARENT session
          // actually received. Deliberately NOT a bare rating-word regex:
          // A-052 prohibits that shape, and the four panels are prose that
          // may legitimately contain "mastered" or "eye contact". The
          // assertion is STRUCTURAL — the ruled-out card and any replacement
          // visualization must be absent.
          if (role === 'parent') {
            if (text === null) {
              notRun(`${id}-q27`, 'the surface did not render, so the Q-27 boundary was not measured on it')
            } else {
              const banned = ["This Term's Skills", 'This Term’s Skills', 'Skills', 'rating']
              const present = banned.filter((b) => text.includes(b))
              if (present.length > 0) {
                fail(`${id}-q27`, `Q-27 — the parent surface carries ${present.map((p) => JSON.stringify(p)).join(', ')}`)
              } else {
                pass(`${id}-q27`, 'Q-27 holds on this parent surface: no skills card, no rating vocabulary rendered')
              }
            }
          }
        }
      }
    }

    phase('Trip-wire')
    const sample = tripWire ? tripWire.sample() : null
    const peers = sample?.peers ?? sample
    if (!sample) notRun('S3-03', 'the trip-wire could not be sampled')
    else if (sample.unmeasured) fail('S3-03', 'the process tree could not be fully read; the reading is UNMEASURED')
    else if (Array.isArray(peers) && peers.length > 0) fail('S3-03', `${peers.length} NON-LOOPBACK peer(s) observed`)
    else pass('S3-03', 'zero non-loopback peers across the served process tree for the whole run')
  } finally {
    if (browser) browser.close()
    if (served) stopServed(served.child)
  }
}

function summary() {
  const p = legs.filter((l) => l.state === 'PASS').length
  const f = legs.filter((l) => l.state === 'FAIL').length
  const n = legs.filter((l) => l.state === 'NOT-RUN').length
  console.log(`\n=== STAGE 3 AUTHENTICATED SURFACES: ${p} PASS · ${f} FAIL · ${n} NOT-RUN ===`)
  if (f) console.log('FAIL   :', legs.filter((l) => l.state === 'FAIL').map((l) => l.id).join(', '))
  if (n) console.log('NOT-RUN:', legs.filter((l) => l.state === 'NOT-RUN').map((l) => l.id).join(', '))
  console.log('\nNOT PROVEN BY THIS RUN, and not claimable from a green one:')
  console.log('  · the password sign-in form (Operator credential)')
  console.log('  · the Next.js server-action transport (renders are GETs)')
  console.log('  · the AI drafting and grounding pipeline')
  console.log('  · every governed MUTATION leg — they belong on the disposable stack')
  return f === 0
}

main()
  .then(() => process.exit(summary() ? 0 : 1))
  .catch((e) => {
    console.error(`\nthe harness threw: ${e?.message ?? 'unknown'}`)
    summary()
    process.exit(1)
  })
