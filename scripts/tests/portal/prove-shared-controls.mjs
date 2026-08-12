#!/usr/bin/env node
// =====================================================================
// SHARED FORM CONTROLS — MEASURED IN A BROWSER, NOT INFERRED FROM CSS
// =====================================================================
//
// Run: npm run prove:shared-controls
//
// ⛔ WHY THIS SUITE EXISTS. Two defects reached an Operator walkthrough with
// every DOM-text proof green:
//
//   1. Every `<select>` on screens `26` and `27` painted ROUGHLY A DOZEN
//      CHEVRONS in a horizontal row, overlapping the selected text.
//   2. The `Search Trainer` magnifier did not clear: typed text ran
//      underneath it.
//
// ▶ NEITHER IS VISIBLE TO A DOM-TEXT PROOF. `innerText` reports the strings a
// page paints; it says nothing about where they sit or what is painted on top
// of them. That is the standing limit of the render tier, and it is why
// VISUAL acceptance stays `NOT-RUN` until the Operator walks.
//
// ---------------------------------------------------------------------
// ⚠️ THE CAUSE, MEASURED BEFORE ANYTHING WAS CHANGED
// ---------------------------------------------------------------------
// Three hypotheses were named: a repeated background image, an `appearance`
// reset that did not take, or the frame's chevron drawn on top of the native
// one. The measurement discriminates them, and the answer was the FIRST:
//
//     `.form-field` is UNLAYERED and declares the `background` SHORTHAND.
//     `@import "tailwindcss"` emits its utilities into `@layer utilities`,
//     and an unlayered rule outranks every rule in every layer. So
//     `bg-no-repeat`, `bg-[length:1.15rem]` and `bg-[right_0.75rem_center]`
//     were generated, matched, and SILENTLY LOST — while the chevron itself
//     survived because it was an INLINE style. The shorthand reset repeat to
//     `repeat` and size to `auto`, so one chevron tiled across the control.
//
// The identical mechanism produced defect 2: `pl-10` on the search input lost
// to `.form-field`'s own `padding` shorthand, so the text started at `14px`
// and ran under a magnifier sitting at `14px`.
//
// ⚠️ THIS CASCADE TRAP WAS ALREADY DOCUMENTED IN `app/globals.css` at `F-01b`,
// with `.auth-field` and `.notes-field` as its established remedy. The two
// defects are the same trap in two controls nobody had re-measured — which is
// exactly why the fix is a SHARED MODIFIER in the same file rather than
// per-instance utilities that would lose the cascade again.
//
// ---------------------------------------------------------------------
// HOW IT IS MEASURED
// ---------------------------------------------------------------------
// The app is served through `serving-discipline.mjs`, headless Chrome loads a
// PUBLIC route (no session, no credential, no provider call), and the exact
// shipped markup is constructed in the page so `getComputedStyle` reports the
// real cascade. ▶ The cascade is a property of the STYLESHEET, so measuring
// it does not require an authenticated surface — but it does require a real
// browser, because that is the only thing that resolves a cascade.
//
// EXIT: 0 every leg PASS · 1 any leg FAIL or NOT-RUN.
// =====================================================================

import { spawn } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs'
import os from 'node:os'
import { join } from 'node:path'

import { REPO_ROOT, serveDisciplined, stopServed } from '../../physical-test/serving-discipline.mjs'
import { stripComments } from './artefact-read-rule.mjs'

const APP_PORT = 3423
const DEBUG_PORT = 9423
const BASE = `http://127.0.0.1:${APP_PORT}`
const CHROME_PATH =
  process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

let pass = 0
let fail = 0
const ok = (id, detail) => {
  pass += 1
  console.log(`PASS  ${id}  ${detail}`)
}
const no = (id, detail) => {
  fail += 1
  console.log(`FAIL  ${id}  ${detail}`)
}

// ---------------------------------------------------------------- CDP
class Browser {
  constructor(child, profile) {
    this.child = child
    this.profile = profile
    this.next = 1
    this.waiters = new Map()
  }

  static async launch() {
    const profile = mkdtempSync(join(os.tmpdir(), 'best-shared-controls-'))
    const child = spawn(
      CHROME_PATH,
      [
        '--headless=new',
        `--remote-debugging-port=${DEBUG_PORT}`,
        `--user-data-dir=${profile}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-gpu',
        'about:blank',
      ],
      { stdio: 'ignore', windowsHide: true },
    )
    const browser = new Browser(child, profile)
    const deadline = Date.now() + 30_000
    while (Date.now() < deadline) {
      try {
        const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)
        const targets = await res.json()
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

  async evaluate(expression) {
    const r = await this.send('Runtime.evaluate', { expression, returnByValue: true })
    return r.result?.result?.value
  }

  close() {
    try {
      this.ws?.close()
    } catch {
      /* gone */
    }
    try {
      this.child.kill()
    } catch {
      /* gone */
    }
    try {
      rmSync(this.profile, { recursive: true, force: true })
    } catch {
      /* best effort */
    }
  }
}

/*
 * ⚠️ THE PROBE BUILDS THE SHIPPED MARKUP FROM `components/ui/field.tsx`
 * ITSELF, read off disk at run time, rather than from a copy written here. A
 * hand-copied class list would keep passing after the component's own list
 * changed — the probe would then measure a control the product no longer has.
 */
const NEXT_EXPORT = String.fromCharCode(10) + 'export function'
const QUOTES = ['"', "'", '`']

/*
 * ⛔ COMMENTS ARE STRIPPED BEFORE EXTRACTION, and this is the THIRD time in
 * one session that prose contaminated a measurement. The fix comment added to
 * `Select` names `.form-field` inside a backticked phrase; the extractor found
 * THAT occurrence first and measured a class list assembled out of a sentence.
 * The reading went from `appearance: none` to `appearance: auto` — it looked
 * like a regression in the product and was a regression in the INSTRUMENT.
 *
 * ▶ The rule that keeps being re-learned: A SCAN OVER PROSE IS NOT A SCAN
 * OVER CODE. `AR-5` guards it, `SC-3` guards it, and the extractor needed it too.
 */
const FIELD_SOURCE = stripComments(
  readFileSync(join(REPO_ROOT, 'components', 'ui', 'field.tsx'), 'utf8'),
)

/*
 * ⚠️ CORRECTED AFTER THE INSTRUMENT MEASURED THE WRONG ELEMENT. The first
 * version took the FIRST template literal after the marker. In `SearchInput`
 * that is the WRAPPER DIV's `relative ${className}`, not the input's own
 * class list — so the probe reported `padding-inline-start: 0px` for a `div`
 * and I nearly recorded it as the product's value. ▶ A wrong instrument
 * invalidates the reading even when the reading looks like the defect.
 *
 * It now takes the first string OF ANY QUOTE STYLE, inside that function's
 * body, that actually names `form-field` — the class that identifies the
 * control being measured.
 */
function classListFrom(source, marker) {
  const at = source.indexOf(marker)
  if (at < 0) return null
  const nextExport = source.indexOf(NEXT_EXPORT, at + marker.length)
  const body = source.slice(at, nextExport < 0 ? source.length : nextExport)
  const hit = body.indexOf('form-field')
  if (hit < 0) return null
  // Walk outward to the enclosing quote of whatever style it happens to be.
  let start = -1
  let quote = ''
  for (let i = hit; i >= 0; i -= 1) {
    if (QUOTES.includes(body[i])) {
      start = i
      quote = body[i]
      break
    }
  }
  if (start < 0) return null
  const end = body.indexOf(quote, hit)
  if (end < 0) return null
  return body
    .slice(start + 1, end)
    .replace(/\$\{[^}]*\}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
const SELECT_CLASSES = classListFrom(FIELD_SOURCE, 'export function Select(')
const SEARCH_CLASSES = classListFrom(FIELD_SOURCE, 'export function SearchInput(')

/*
 * ⛔ A STALE BUNDLE IS A VACUOUS MEASUREMENT. `next start` serves whatever
 * `.next` already holds, so editing the stylesheet and running this suite
 * measures the PREVIOUS build — which is exactly what happened on the first
 * post-fix run, reporting the defect as still present after it was fixed.
 * ▶ A suite that cannot see the current source must not report on it.
 */
function buildIsStale() {
  const watched = [
    join(REPO_ROOT, 'app', 'globals.css'),
    join(REPO_ROOT, 'components', 'ui', 'field.tsx'),
  ]
  let built
  try {
    built = statSync(join(REPO_ROOT, '.next', 'BUILD_ID')).mtimeMs
  } catch {
    return 'there is no .next build to serve'
  }
  const newer = watched.filter((f) => statSync(f).mtimeMs > built)
  return newer.length === 0
    ? null
    : `${newer.map((f) => f.slice(REPO_ROOT.length + 1)).join(', ')} changed after the last build`
}

async function main() {
  const stale = buildIsStale()
  if (stale !== null) {
    no('SC-BUILD', `\u26d4 the served bundle PREDATES the source (${stale}) \u2014 refusing to measure it. Run \`next build\` first`)
    return
  }
  ok('SC-BUILD', 'the served bundle is newer than app/globals.css and components/ui/field.tsx')
  if (SELECT_CLASSES === null || SEARCH_CLASSES === null) {
    no('SC-0', 'the shared control class lists could not be READ from components/ui/field.tsx — every measurement below would be of markup this file invented')
    return
  }

  const served = await serveDisciplined({ mode: 'start', port: APP_PORT, readyPath: '/login' })
  let browser = null
  try {
    browser = await Browser.launch()
    await browser.send('Page.navigate', { url: `${BASE}/login` })
    // The stylesheet, not the data, is what is being measured — wait for it.
    const deadline = Date.now() + 20_000
    let token = ''
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 300))
      token = await browser.evaluate(
        "getComputedStyle(document.documentElement).getPropertyValue('--color-line').trim()",
      )
      if (token) break
    }

    // --- SC-0 non-vacuity -------------------------------------------
    if (!token) {
      no('SC-0', 'the app stylesheet never resolved (--color-line empty) — every measurement below would be of an unstyled page')
      return
    }
    ok('SC-0', `the app stylesheet is loaded and resolving design tokens (--color-line = ${token})`)

    const measured = await browser.evaluate(`(() => {
      const host = document.createElement('div');
      host.style.cssText = 'position:fixed;left:0;top:0;width:320px';
      document.body.appendChild(host);

      const sel = document.createElement('select');
      sel.className = ${JSON.stringify(SELECT_CLASSES)};
      sel.style.backgroundImage = "url(\\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E\\")";
      const opt = document.createElement('option');
      opt.textContent = 'Intermediate';
      sel.appendChild(opt);
      host.appendChild(sel);

      const inp = document.createElement('input');
      inp.className = ${JSON.stringify(SEARCH_CLASSES)};
      host.appendChild(inp);

      const cs = getComputedStyle(sel);
      const ci = getComputedStyle(inp);
      const out = {
        selectRepeat: cs.backgroundRepeat,
        selectSize: cs.backgroundSize,
        selectPosition: cs.backgroundPosition,
        selectAppearance: cs.appearance || cs.webkitAppearance,
        selectPaddingRight: ci ? cs.paddingRight : '',
        searchPaddingLeft: ci.paddingInlineStart || ci.paddingLeft,
      };
      host.remove();
      return out;
    })()`)

    if (!measured) {
      no('SC-1', 'the probe returned nothing — NOT a measurement')
      return
    }

    console.log(
      `\n  MEASURED  select: repeat=${measured.selectRepeat} · size=${measured.selectSize} · ` +
        `position=${measured.selectPosition} · appearance=${measured.selectAppearance} · ` +
        `padding-right=${measured.selectPaddingRight}`,
    )
    console.log(`  MEASURED  search input: padding-inline-start=${measured.searchPaddingLeft}\n`)

    // --- SC-1 the chevron ------------------------------------------
    if (measured.selectRepeat !== 'no-repeat') {
      no(
        'SC-1',
        `⛔ the select's chevron REPEATS: background-repeat computes ${measured.selectRepeat}. ` +
          'The image tiles across the control — this is the dozen-chevron defect',
      )
    } else if (measured.selectAppearance !== 'none') {
      no(
        'SC-1',
        `⛔ the appearance reset did NOT take: appearance computes ${measured.selectAppearance}, ` +
          'so the native chevron paints alongside the frame chevron',
      )
    } else if (!/^1\.15rem|^18\.4px/.test(measured.selectSize)) {
      no('SC-1', `⛔ the chevron is not at the frame's size: background-size computes ${measured.selectSize}`)
    } else if (!/(100%|right)/.test(measured.selectPosition) || !/12px|0\.75rem/.test(measured.selectPosition)) {
      /*
       * ⚠️ THE ASSERTION, NOT THE PRODUCT, WAS WRONG ON THE FIRST POST-FIX
       * RUN. It required the string to start with `right`; Chrome RESOLVES
       * `right 0.75rem center` to `calc(100% - 12px) 50%`, which is the same
       * position. ▶ An assertion written against the AUTHORED value rather than
       * the COMPUTED one fails a correct fix and would have sent the next
       * session hunting a defect that was already closed.
       */
      no('SC-1', `⛔ the chevron is not at the frame's position: background-position computes ${measured.selectPosition}`)
    } else {
      ok(
        'SC-1',
        `ONE chevron, at the frame's geometry: repeat=${measured.selectRepeat} · size=${measured.selectSize} · ` +
          `position=${measured.selectPosition} · appearance=${measured.selectAppearance}`,
      )
    }

    // --- SC-2 the search icon --------------------------------------
    const pad = Number.parseFloat(measured.searchPaddingLeft)
    if (!Number.isFinite(pad)) {
      no('SC-2', `the search input's leading padding did not resolve (${measured.searchPaddingLeft})`)
    } else if (pad < 36) {
      no(
        'SC-2',
        `⛔ typed text COLLIDES with the magnifier: padding-inline-start computes ${pad}px, and the ` +
          'icon occupies roughly 14px–30px. The leading affordance the frame draws is unreadable under text',
      )
    } else {
      ok('SC-2', `typed text clears the magnifier: padding-inline-start computes ${pad}px against an icon ending near 30px`)
    }
  } finally {
    browser?.close()
    stopServed(served.child ?? served)
  }
}

// ---------------------------------------------------------------- structure
/*
 * ⛔ THE MEASUREMENT ABOVE PROVES THE SHARED CONTROL IS CORRECT. It says
 * NOTHING about a second control elsewhere carrying its own copy of the same
 * treatment — which is precisely what the Operator asked to be proved.
 */
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name === '.git') continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (/\.(tsx|ts)$/.test(name)) out.push(full)
  }
  return out
}

function structuralLegs() {
  const roots = ['app', 'features', 'components', 'lib'].map((d) => join(REPO_ROOT, d))
  const files = roots.flatMap((d) => walk(d))
  const SHARED = join(REPO_ROOT, 'components', 'ui', 'field.tsx')

  /*
   * ⛔ COMMENTS ARE STRIPPED FIRST, and the first run of this suite is why.
   * It reported EIGHT files rendering a raw `<select>`; every one of them was
   * a COMMENT — including this rebuild's own *"a `<select>` would require
   * INVENTING one"*. ▶ The same degeneration `AR-5` already guards against:
   * a scan over prose is not a scan over code.
   */
  /*
   * ⛔ THE CLAIM THE OPERATOR ASKED FOR: *"prove no other select in the
   * product carries the same treatment."* That is NOT *"every select goes
   * through the shared control"* — five raw `<select>` elements legitimately
   * exist on other surfaces, and routing them through the shared component is
   * a change to five screens outside this authorization.
   *
   * ⚠️ THE TREATMENT is the combination that produced the defect: a
   * `.form-field` select that also suppresses the native chevron. Only such a
   * control needs a background chevron, and only such a control can tile one.
   *
   * ⛔ COMMENTS ARE STRIPPED FIRST, and the first run of this suite is why.
   * It reported EIGHT files rendering a raw `<select>`; three of them were
   * COMMENTS — including this rebuild's own *"a `<select>` would require
   * INVENTING one"*. ▶ The same degeneration `AR-5` already guards against: a
   * scan over prose is not a scan over code.
   */
  const treated = []
  const rawSelects = []
  for (const f of files) {
    if (f === SHARED) continue
    const code = stripComments(readFileSync(f, 'utf8'))
    if (!/<select[\s>]/.test(code)) continue
    rawSelects.push(f.slice(REPO_ROOT.length + 1))
    if (/form-field/.test(code) && /appearance-none/.test(code)) {
      treated.push(f.slice(REPO_ROOT.length + 1))
    }
  }
  if (treated.length > 0) {
    no(
      'SC-3',
      `\u26d4 ${treated.length} file(s) outside the shared control combine \`form-field\` with \`appearance-none\` on a select \u2014 the same treatment: ` +
        treated.join(', '),
    )
  } else {
    ok(
      'SC-3',
      `no select outside the shared control carries the treatment (\`form-field\` + \`appearance-none\`). ` +
        `${rawSelects.length} raw select(s) exist elsewhere and each was READ: ${rawSelects.join(', ')}`,
    )
  }
  // ⚠️ THE CONTROL. Without it, "none found" is equally true of a detector
  // that matches nothing and of a scan that read no files.
  const sharedCode = stripComments(readFileSync(SHARED, 'utf8'))
  const detectorFires =
    /<select[\s>]/.test(sharedCode) && /form-field/.test(sharedCode) && /appearance-none/.test(sharedCode)
  if (detectorFires && files.length > 20 && rawSelects.length > 0) {
    ok(
      'SC-3c',
      `CONTROL: the treatment detector MATCHES the shared control itself, the raw-select detector MATCHED ${rawSelects.length} real files, and the scan read ${files.length} sources`,
    )
  } else {
    no('SC-3c', 'the detectors could not be shown to fire, so SC-3 measured nothing')
  }

  const chevronOwners = files.filter((f) => {
    if (f === SHARED) return false
    const src = readFileSync(f, 'utf8')
    const code = stripComments(src)
    return /backgroundImage/.test(code) && /svg\+xml/.test(code)
  })
  if (chevronOwners.length > 0) {
    no(
      'SC-4',
      `⛔ ${chevronOwners.length} file(s) carry their own inline SVG background treatment: ` +
        chevronOwners.map((f) => f.slice(REPO_ROOT.length + 1)).join(', '),
    )
  } else {
    ok('SC-4', 'no component outside the shared control paints its own inline SVG chevron')
  }

  /*
   * ⛔ THE ROOT-CAUSE PIN. `.form-field` must not reset background or padding
   * for its modifiers, and the two modifiers must exist in the ONE stylesheet
   * that owns them. Written as a pin on `app/globals.css` because per-instance
   * Tailwind utilities on a `.form-field` element LOSE THE CASCADE — that is
   * the whole defect, and a fix written as utilities would silently not apply.
   */
  const css = readFileSync(join(REPO_ROOT, 'app', 'globals.css'), 'utf8')
  const hasSelectModifier = /\.form-field\.select-field\s*\{/.test(css)
  const hasSearchModifier = /\.form-field\.search-field\s*\{/.test(css)
  if (hasSelectModifier && hasSearchModifier) {
    ok('SC-5', 'both shared modifiers (`.select-field`, `.search-field`) live in app/globals.css, where they outrank the utility layer')
  } else {
    no(
      'SC-5',
      `⛔ a shared modifier is missing from app/globals.css (select-field: ${hasSelectModifier}, search-field: ${hasSearchModifier}) — ` +
        'utilities written on a .form-field element lose the cascade',
    )
  }
}

await main()
structuralLegs()

console.log(`\n${pass} PASS · ${fail} FAIL`)
console.log(
  '⛔ STANDING LIMIT: this suite measures the CASCADE and the SHARED-CONTROL structure. ' +
    'It is not a visual acceptance, and neither is any DOM-text proof — both were green while a dozen chevrons stacked inside a field.',
)
process.exit(fail === 0 ? 0 : 1)
