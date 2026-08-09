#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach — UI RECONCILIATION build-side capture, LOGIN SURFACES
// =====================================================================
//
// Run: node scripts/ui-reconciliation/capture-login.mjs <before|after>
//
// WHAT THIS IS. `docs/plan/UI_RECONCILIATION_BUILD_PLAN.md` §3.1 requires
// the build side of every comparison to be a RENDERED CAPTURE taken after
// the loading state clears — never a reading of the source. This produces
// that capture for the three authentication surfaces, which are the only
// surfaces in Phases 0-3 that a browser can reach.
//
// WHY IT REACHES NO DATABASE. `/login` is public and renders no governed
// projection: the guard is not on it, no Supabase call is made by a GET,
// and this harness never submits the form. That is the whole reason the
// authentication phases are capturable in this clone while the portal
// chrome is not — the portal layouts run `requirePortalAccess`, which
// needs a real session and therefore a reachable governed database.
//
// SERVING DISCIPLINE. The server is started through
// `serving-discipline.mjs`, so S-1 (the three AI provider selectors
// OVERWRITTEN, never deleted), S-2 and S-3 apply exactly as they do to the
// Stage 2 proof. The trip-wire is armed for the whole run and its result
// is reported: a capture taken while the process tree held a non-loopback
// peer is reported as such, never quietly accepted.
//
// TWO-TIER DISCIPLINE, PRESERVED. A surface still showing the Suspense
// fallback at budget expiry is recorded NOT-RUN, never captured as though
// it had painted.
//
// It writes, per role: a full-page PNG at the reference viewport
// (1440 x 1024, the native size of all three frozen frames) and a JSON
// record of COMPUTED styles read out of the rendered DOM. The JSON is what
// makes a difference actionable — "the card gutter is 24px against the
// frame's 32px" rather than "the spacing looks tight" (§3.1).
//
// EXIT: 0 every role captured · 1 anything NOT-RUN or failed.
// =====================================================================

import { spawn, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  ServingDisciplineError,
  assertRealProviderLegUnset,
  createTripWire,
  processTree,
  serveDisciplined,
  stopServed,
} from '../physical-test/serving-discipline.mjs'

/**
 * The trip-wire reports a COUNT and deliberately reports no address. A bare
 * count is enough to fail a gate but not enough to diagnose one, and this
 * harness hit exactly that wall: it read non-zero and could not say whether
 * the peer was a package registry or a governed database.
 *
 * This reports the REMOTE PORT and connection state, and nothing else. A
 * port is not an address: it discriminates "a package registry over 443"
 * from "a Postgres endpoint over 5432/6543" — which is the whole question —
 * without naming a host, an IP, a project ref or a tenant. The
 * address-suppression rule is preserved exactly as written.
 */
function remotePortProfile(rootPid) {
  const tree = processTree(rootPid)
  if (tree === null) return null
  const result = spawnSync('netstat', ['-ano', '-p', 'TCP'], {
    encoding: 'utf8',
    windowsHide: true,
    shell: false,
    maxBuffer: 16 * 1024 * 1024,
    timeout: 60_000,
  })
  if (result.error || typeof result.stdout !== 'string') return null
  const loopback = new Set(['127.0.0.1', 'localhost', '::1', '[::1]', '0.0.0.0', '::', '[::]', '*'])
  const ports = new Map()
  for (const line of result.stdout.split(/\r?\n/)) {
    const parts = line.trim().split(/\s+/)
    if (parts.length < 5 || parts[0].toUpperCase() !== 'TCP') continue
    if (!tree.has(Number(parts[parts.length - 1]))) continue
    const remote = parts[2]
    const host = remote.startsWith('[')
      ? remote.slice(0, remote.lastIndexOf(']') + 1)
      : remote.slice(0, remote.lastIndexOf(':'))
    if (loopback.has(host)) continue
    const key = `${remote.slice(remote.lastIndexOf(':') + 1)}/${parts[3]}`
    ports.set(key, (ports.get(key) ?? 0) + 1)
  }
  return [...ports.entries()].map(([key, count]) => `${key}x${count}`)
}

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..', '..')

const STAGE = process.argv[2]
if (STAGE !== 'before' && STAGE !== 'after') {
  process.stderr.write('Usage: node scripts/ui-reconciliation/capture-login.mjs <before|after>\n')
  process.exit(2)
}

const APP_PORT = 3422
const DEBUG_PORT = 9422
const CHROME_PATH =
  process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

/** The native size of all three frozen authentication frames. */
const VIEWPORT = { width: 1440, height: 1024 }

const OUT_DIR = join(REPO_ROOT, 'docs', 'progress', 'ui-reconciliation', STAGE)

/** The Suspense fallback `app/(auth)/login/page.tsx` serves before hydration. */
const LOADING_TEXT = 'Loading login presentation'

const ROLES = ['trainer', 'management', 'parent']

const say = (message) => process.stdout.write(`${message}\n`)
const phase = (message) => say(`\n[ ${message} ]`)

let failures = 0
function record(id, verdict, reason) {
  if (verdict !== 'PASS') failures += 1
  say(`  ${verdict.padEnd(7)} ${id} — ${reason}`)
}

// ---------------------------------------------------------------------
// A minimal CDP client, the same shape `prove-stage3-authenticated.mjs`
// uses. No browser automation package is a dependency of this project and
// none is added here.
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
    const profile = mkdtempSync(join(os.tmpdir(), 'bc-uirecon-chrome-'))
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
        '--force-device-scale-factor=1',
        '--hide-scrollbars',
        // Loopback only: the browser cannot reach anything but the served app.
        '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1',
        'about:blank',
      ],
      { stdio: 'ignore' },
    )
    const browser = new Browser(child, profile)
    const deadline = Date.now() + 30_000
    while (Date.now() < deadline) {
      try {
        const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)
        const targets = await response.json()
        const page = targets.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
        if (page) {
          await browser.connect(page.webSocketDebuggerUrl)
          return browser
        }
      } catch {
        /* not up yet */
      }
      await new Promise((r) => setTimeout(r, 300))
    }
    throw new Error('headless Chrome did not expose a page debugging target')
  }

  connect(url) {
    return new Promise((settle, reject) => {
      this.ws = new WebSocket(url)
      this.ws.addEventListener('open', () => settle())
      this.ws.addEventListener('error', () => reject(new Error('the CDP socket failed')))
      this.ws.addEventListener('message', (event) => {
        const message = JSON.parse(event.data)
        const waiter = this.waiters.get(message.id)
        if (waiter) {
          this.waiters.delete(message.id)
          waiter(message)
        }
      })
    })
  }

  send(method, params = {}) {
    const id = this.next++
    return new Promise((settle) => {
      this.waiters.set(id, settle)
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }

  async evaluate(expression) {
    const response = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: false,
    })
    return response.result?.result?.value
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
 * The computed-style probe, evaluated INSIDE the rendered page.
 *
 * It reads values off elements located by production hooks and semantic
 * roles — never by a class name, which would make the probe a restatement
 * of the source rather than a measurement of the render.
 */
const PROBE = String.raw`
(function () {
  function styleOf(el, props) {
    if (!el) return null;
    var cs = getComputedStyle(el);
    var out = {};
    props.forEach(function (p) { out[p] = cs.getPropertyValue(p); });
    var r = el.getBoundingClientRect();
    out['#rect'] = { w: Math.round(r.width * 100) / 100, h: Math.round(r.height * 100) / 100,
                     x: Math.round(r.x * 100) / 100, y: Math.round(r.y * 100) / 100 };
    return out;
  }
  var BOX = ['font-size','font-weight','color','background-color','border-radius',
             'padding-top','padding-bottom','padding-left','padding-right','line-height'];

  var form = document.querySelector('[data-auth-form="sign-in"]');
  var section = document.querySelector('[data-role-presentation]');
  var segs = Array.prototype.slice.call(document.querySelectorAll('[data-role-segment]'));
  var selectedSeg = segs.filter(function (s) { return s.getAttribute('data-selected') === 'true'; })[0];
  var unselectedSeg = segs.filter(function (s) { return s.getAttribute('data-selected') !== 'true'; })[0];
  var segList = segs.length ? segs[0].closest('ul') : null;
  var h1 = document.querySelector('h1');
  var email = document.querySelector('input[name="email"]');
  var password = document.querySelector('input[name="password"]');
  var submit = document.querySelector('[data-auth-submit="sign-in"]');
  var note = document.getElementById('auth-governance-note');
  var checkbox = document.querySelector('input[type="checkbox"]');
  var brand = document.querySelector('[role="img"][aria-label="B.E.S.T. Coach"]');
  var brandTile = brand ? brand.querySelector('span[aria-hidden="true"]') : null;

  return {
    role: section ? section.getAttribute('data-role-presentation') : null,
    documentTitle: document.title,
    bodyText: document.body ? document.body.innerText : '',
    pageBackground: getComputedStyle(document.body).backgroundColor,
    column: styleOf(form ? form.parentElement : null, BOX),
    brand: styleOf(brand, BOX),
    brandTile: styleOf(brandTile, BOX),
    signInAsLabel: styleOf(document.getElementById('signin-as-label'), BOX),
    segmentList: styleOf(segList, BOX),
    segmentSelected: styleOf(selectedSeg, BOX),
    segmentUnselected: styleOf(unselectedSeg, BOX),
    heading: styleOf(h1, BOX),
    headingDescription: styleOf(h1 ? h1.nextElementSibling : null, BOX),
    emailLabel: styleOf(email ? document.querySelector('label[for="' + CSS.escape(email.id) + '"]') : null, BOX),
    emailInput: styleOf(email, BOX),
    emailPlaceholder: email ? email.getAttribute('placeholder') : null,
    passwordInput: styleOf(password, BOX),
    rememberMe: styleOf(checkbox, BOX),
    rememberMeDisabled: checkbox ? checkbox.disabled : null,
    rememberMeHasName: checkbox ? checkbox.hasAttribute('name') : null,
    rememberMeClass: checkbox ? checkbox.className : null,
    forgotPassword: (function () {
      var nodes = Array.prototype.slice.call(document.querySelectorAll('span,a'));
      var el = nodes.filter(function (n) { return /Forgot password\?/.test(n.textContent || ''); }).pop();
      return el ? { tag: el.tagName, isLink: el.tagName === 'A', style: styleOf(el, BOX) } : null;
    })(),
    governanceNote: styleOf(note, BOX),
    submit: styleOf(submit, BOX),
    footerNote: (function () {
      var nodes = Array.prototype.slice.call(document.querySelectorAll('p'));
      var el = nodes.filter(function (n) { return /Need access\?/.test(n.textContent || ''); })[0];
      return styleOf(el, BOX);
    })(),
    decorativeDiscs: document.querySelectorAll('[aria-hidden="true"] span.rounded-full').length,
  };
})()
`

async function captureRole(browser, origin, role) {
  const url = `${origin}/login?role=${role}`
  await browser.send('Page.navigate', { url })

  // Wait for hydration: the Suspense fallback must clear AND the role
  // presentation marker must be present. A surface still loading at budget
  // expiry is NOT-RUN, never a capture.
  const deadline = Date.now() + 30_000
  let ready = false
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 300))
    const state = await browser.evaluate(
      `(function(){var b=document.body;var t=b?b.innerText:'';` +
        `return JSON.stringify({t:t,m:!!document.querySelector('[data-role-presentation="${role}"]')});})()`,
    )
    if (!state) continue
    const { t, m } = JSON.parse(state)
    if (m && t && !t.includes(LOADING_TEXT)) {
      ready = true
      break
    }
  }
  if (!ready) {
    record(role, 'NOT-RUN', `${url} — the surface had not painted within budget; nothing was captured`)
    return null
  }

  const probe = await browser.evaluate(PROBE)
  const shot = await browser.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
  })
  const data = shot.result?.data
  if (!data) {
    record(role, 'FAIL', `${url} — the page painted but the screenshot call returned nothing`)
    return null
  }

  writeFileSync(join(OUT_DIR, `login-${role}.png`), Buffer.from(data, 'base64'))
  writeFileSync(join(OUT_DIR, `login-${role}.json`), `${JSON.stringify(probe, null, 2)}\n`, 'utf8')
  record(role, 'PASS', `${url} — painted and captured at ${VIEWPORT.width}x${VIEWPORT.height}`)
  return probe
}

async function main() {
  say(`B.E.S.T Coach — UI reconciliation login capture (${STAGE.toUpperCase()})`)
  say('No database is reached. `/login` is public and this harness never submits the form.')
  assertRealProviderLegUnset()
  mkdirSync(OUT_DIR, { recursive: true })

  /*
   * PRODUCTION MODE, AND THE MEASUREMENT THAT FORCED IT.
   *
   * This harness first served in `dev`. The trip-wire then read a non-zero
   * count on every browser-driven run, and the port profile localised it to
   * exactly ONE transient `443/ESTABLISHED` peer held only while a browser
   * was driving the page — the Next dev overlay's own update check. Serving
   * the identical routes to a non-browser `fetch` client produced a measured
   * ZERO, which is what discriminated the overlay from the application.
   *
   * It was NOT a governed database: no Postgres or pooler port appeared in
   * any sample. But "explained" is not "absent", and a capture harness that
   * has to narrate its own trip-wire failure is one nobody will trust later.
   * `start` mode has no dev overlay and therefore no update check, so the
   * finding is removed at its source rather than annotated — and the capture
   * additionally becomes a capture of the PRODUCTION stylesheet, which is
   * what the reconciliation is actually about.
   *
   * Requires a current `next build`. That is deliberate: the route census
   * this phase must hold at 17 comes from the same build.
   */
  phase('serving, under the §7.4a discipline (production build)')
  const served = await serveDisciplined({ mode: 'start', port: APP_PORT })
  const tripWire = createTripWire(served.child.pid)
  tripWire.sample()
  say(
    `  ....  served on ${served.origin}; ${served.record.overwritten.length} provider selectors ` +
      'OVERWRITTEN (never deleted) in the child environment',
  )

  let browser = null
  let wire = null
  try {
    phase('headless Chrome, loopback-only')
    browser = await Browser.launch()
    await browser.send('Page.enable')
    await browser.send('Runtime.enable')
    await browser.send('Emulation.setDeviceMetricsOverride', {
      width: VIEWPORT.width,
      height: VIEWPORT.height,
      deviceScaleFactor: 1,
      mobile: false,
    })

    phase(`capturing the three authentication surfaces -> ${OUT_DIR}`)
    for (const role of ROLES) {
      await captureRole(browser, served.origin, role)
      tripWire.sample()
      const perRole = remotePortProfile(served.child.pid)
      say(`  ....  remote port profile after ${role}: ${perRole === null ? 'UNREADABLE' : perRole.length === 0 ? 'none' : perRole.join(', ')}`)
    }

    /*
     * SAMPLED WHILE THE SERVER IS STILL ALIVE, DELIBERATELY.
     *
     * An earlier revision of this harness stopped the served child in a
     * `finally` and then took the closing samples. That is not a stricter
     * reading, it is a WRONG one: once the child is gone `processTree`
     * resolves a dead PID, Windows recycles PIDs freely, and `netstat`
     * rows belonging to WHATEVER process inherited the number are then
     * attributed to the served tree. The first run of this harness read
     * three "non-loopback peers" that way and they were not the
     * application's. The trip-wire must be read against a LIVE tree or it
     * is measuring nothing it claims to measure.
     */
    phase('S-3 — the trip-wire, across the whole run (server still alive)')
    for (let sample = 0; sample < 3; sample += 1) tripWire.sample()
    const profile = remotePortProfile(served.child.pid)
    say(`  ....  remote port profile of the served tree: ${profile === null ? 'UNREADABLE' : profile.length === 0 ? 'none' : profile.join(', ')}`)
    wire = tripWire.result()
  } finally {
    browser?.close()
    stopServed(served.child)
  }

  record(
    'S-3',
    wire.measured === true && wire.foreign === 0 ? 'PASS' : 'FAIL',
    wire.measured === true
      ? wire.foreign === 0
        ? `${wire.samples} samples across the served process tree: ZERO non-loopback TCP peers`
        : `${wire.foreign} non-loopback TCP peers were observed; addresses are deliberately not reported`
      : `the trip-wire could not be measured (${wire.unreadable} unreadable samples) — "not measured" is not "measured zero"`,
  )
}

let exitCode = 1
try {
  await main()
  exitCode = failures === 0 ? 0 : 1
  say(failures === 0 ? '\nAll captures taken.' : `\nCapture run incomplete (${failures}).`)
} catch (error) {
  say(`\nFAILED: ${error instanceof ServingDisciplineError ? error.message : String(error?.message ?? error)}`)
} finally {
  process.exit(exitCode)
}
