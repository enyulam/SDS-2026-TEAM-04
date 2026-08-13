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

  /*
   * ⛔ A REAL STATE MEASUREMENT, NOT A SIMULATED ONE. `CSS.forcePseudoState`
   * is the same mechanism DevTools' "Force element state" uses, so the browser
   * resolves the cascade for `:hover` / `:focus` exactly as it would under a
   * pointer. ▶ Reading a state by re-implementing specificity in JavaScript
   * would measure MY model of the cascade, not the browser's — which is the
   * error that let `F-01b` recur.
   */
  async forceState(selector, pseudoClasses) {
    await this.send('DOM.enable')
    await this.send('CSS.enable')
    /*
     * ⚠️ ONE LEVEL, NOT TWO. `send` returns the whole CDP message, so the
     * command's own result object is `msg.result`. `Runtime.evaluate` needs
     * `msg.result.result.value` only because ITS result object has its own
     * `result` field — copying that shape here addressed nothing and reported
     * every state as NOT-RUN, which is the correct failure but the wrong reason.
     */
    const doc = await this.send('DOM.getDocument', { depth: -1 })
    const rootId = doc.result?.root?.nodeId
    const found = await this.send('DOM.querySelector', { nodeId: rootId, selector })
    const nodeId = found.result?.nodeId
    if (!nodeId) return false
    await this.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: pseudoClasses })
    /*
     * ⛔ WAIT OUT THE TRANSITION — a SIXTH instrument defect, and `SC-8c` is the
     * only reason it was seen rather than shipped as a green run.
     *
     * `.form-field` declares `transition: … background-color 160ms ease`.
     * `getComputedStyle` returns the CURRENTLY ANIMATED value, so a read taken
     * immediately after forcing `:hover` returns the value BEFORE the hover —
     * indistinguishable from a forced state that never applied.
     *
     * ▶ IT ALSO EXPLAINS WHY THE EARLIER RUN LOOKED SOUND. Before the root fix
     * the hover rule used the `background` SHORTHAND, and `background-repeat`,
     * `-size` and `-position` are NOT in the transition list — they snapped
     * instantly, so the tiling was measurable at once. The moment the fix left
     * only `background-color` changing, every state read went silently stale.
     */
    await new Promise((r) => setTimeout(r, 320))
    return true
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

    /*
     * ⚠️ THE PROBE NODES ARE LEFT IN THE DOCUMENT, not removed, because the
     * state measurements below need to address them by selector. They are
     * removed at the end of the run.
     */
    await browser.evaluate(`(() => {
      const host = document.createElement('div');
      host.id = 'sc-probe';
      host.style.cssText = 'position:fixed;left:0;top:0;width:320px';
      document.body.appendChild(host);

      const sel = document.createElement('select');
      sel.id = 'sc-probe-select';
      sel.className = ${JSON.stringify(SELECT_CLASSES)};
      sel.style.backgroundImage = "url(\\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E\\")";
      const opt = document.createElement('option');
      opt.textContent = 'Intermediate';
      sel.appendChild(opt);
      host.appendChild(sel);

      const inp = document.createElement('input');
      inp.id = 'sc-probe-search';
      inp.className = ${JSON.stringify(SEARCH_CLASSES)};
      host.appendChild(inp);

      // ⚠️ A BARE \`.form-field\`, carrying no modifier, existing ONLY so the
      // forced-hover mechanism itself can be proved to fire. See SC-8c.
      const plain = document.createElement('input');
      plain.id = 'sc-probe-plain';
      plain.className = 'form-field';
      host.appendChild(plain);
      return true;
    })()`)

    const readProbe = () =>
      browser.evaluate(`(() => {
        const cs = getComputedStyle(document.getElementById('sc-probe-select'));
        const ci = getComputedStyle(document.getElementById('sc-probe-search'));
        return {
          selectRepeat: cs.backgroundRepeat,
          selectSize: cs.backgroundSize,
          selectPosition: cs.backgroundPosition,
          selectAppearance: cs.appearance || cs.webkitAppearance,
          selectPaddingRight: cs.paddingRight,
          searchPaddingLeft: ci.paddingInlineStart || ci.paddingLeft,
          searchBackground: ci.backgroundColor,
          searchBorder: ci.borderTopColor,
        };
      })()`)

    const measured = await readProbe()

    if (!measured) {
      no('SC-1', 'the probe returned nothing — NOT a measurement')
      return
    }

    console.log(
      `\n  MEASURED  select: repeat=${measured.selectRepeat} · size=${measured.selectSize} · ` +
        `position=${measured.selectPosition} · appearance=${measured.selectAppearance} · ` +
        `padding-right=${measured.selectPaddingRight}`,
    )
    console.log(
      `  MEASURED  search input: padding-inline-start=${measured.searchPaddingLeft} · `+
        `background=${measured.searchBackground} · border=${measured.searchBorder}\n`,
    )

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

    /*
     * ⛔ SC-2b — THE SAME TRAP ON THE SAME CONTROL, FOUND BY `SC-6` ON ITS
     * FIRST RUN. `Management - Add Class.html` draws the search box on
     * `var(--surface-card, white)` with `outline: 1px var(--border-subtle,
     * #EDEFF4)`. The component asked for that with `bg-surface border-line` —
     * utilities that lose to `.form-field`'s `background` and `border`
     * SHORTHANDS, so the box rendered on the muted fill with a TRANSPARENT
     * border. ▶ Neither is visible to a DOM-text proof, and neither was
     * reported by the walkthrough: the Operator's ruling to mechanise the trap
     * is what surfaced them.
     *
     * ⚠️ BORDER IS INCLUDED THOUGH THE RULING SAID *"background or padding"*.
     * It is the same shorthand, the same cascade and the same silence; naming
     * two of the three would leave the third to recur.
     */
    const WHITE = /^rgb\(255,\s*255,\s*255\)$/
    if (!WHITE.test(measured.searchBackground ?? '')) {
      no(
        'SC-2b',
        `⛔ the search box is not on the frame's white fill: background-color computes ${measured.searchBackground}. ` +
          '`bg-surface` lost the cascade to `.form-field`',
      )
    } else if (/rgba\(0,\s*0,\s*0,\s*0\)|transparent/.test(measured.searchBorder ?? '')) {
      no(
        'SC-2b',
        `⛔ the search box has no visible hairline: border-color computes ${measured.searchBorder}, ` +
          'where the frame draws `outline: 1px #EDEFF4`. `border-line` lost the cascade',
      )
    } else {
      ok(
        'SC-2b',
        `the search box carries the frame's fill and hairline: background=${measured.searchBackground} · border=${measured.searchBorder}`,
      )
    }

    /*
     * ⛔ SC-8c — THE CONTROL FOR EVERY FORCED-STATE MEASUREMENT BELOW, and it
     * runs FIRST because everything after it is worthless without it.
     *
     * ▶ A `CSS.forcePseudoState` call that silently did not apply would make
     * every state leg read EXACTLY like the base state — that is, it would
     * make `SC-7-hover` and `SC-8` PASS by measuring nothing. So the mechanism
     * is proved on a bare `.form-field` whose hover tint is known and
     * deliberate: rest is `--color-surface-muted`, hover is `#eef0f6`. If
     * those two readings are identical, the forcing did not happen.
     */
    const plainAtRest = await browser.evaluate(
      "getComputedStyle(document.getElementById('sc-probe-plain')).backgroundColor",
    )
    const plainForced = await browser.forceState('#sc-probe-plain', ['hover'])
    const plainAtHover = plainForced
      ? await browser.evaluate("getComputedStyle(document.getElementById('sc-probe-plain')).backgroundColor")
      : null
    await browser.forceState('#sc-probe-plain', [])
    if (plainForced && plainAtHover && plainAtHover !== plainAtRest) {
      ok(
        'SC-8c',
        `CONTROL: forced hover DEMONSTRABLY APPLIES — a bare \`.form-field\` moves ${plainAtRest} → ${plainAtHover}. Every state leg below measures a real cascade`,
      )
    } else {
      no(
        'SC-8c',
        `⛔ forced hover did not change a bare \`.form-field\` (rest=${plainAtRest}, hover=${plainAtHover}). ` +
          'Every state measurement below is VACUOUS and none of their verdicts may be read',
      )
    }

    /*
     * ═══════════════════════════════════════════════════════════════════
     * ⛔ SC-7 — `F-01b` ONE STATE DEEPER. Operator, 2026-08-13:
     * ═══════════════════════════════════════════════════════════════════
     *     "the chevron tiling returns ON HOVER … Base state is correct; only
     *      hover regresses … MEASURE IT, do not assume: read the computed
     *      background-repeat, -size and -position in the hover state, not
     *      just at rest."
     *
     * ▶ FOUR state rules on `.form-field` used the `background` SHORTHAND
     * (`:hover:not(:disabled)`, `:focus`, `[aria-invalid="true"]`,
     * `:disabled`). A shorthand omitting repeat/size/position RESETS all
     * three — so a state rule can undo a base-state fix, and the base-state
     * measurement that proved the fix says nothing about it.
     *
     * ⚠️ EVERY STATE IS MEASURED, not just the reported one. Hover is what the
     * Operator saw; asserting only hover would leave the other three to be
     * discovered the same way.
     */
    const STATES = [
      { id: 'hover', pseudo: ['hover'], setup: null },
      { id: 'focus', pseudo: ['focus'], setup: null },
      { id: 'disabled', pseudo: [], setup: "document.getElementById('sc-probe-select').disabled = true" },
      {
        id: 'invalid',
        pseudo: [],
        setup: "document.getElementById('sc-probe-select').setAttribute('aria-invalid','true')",
      },
    ]
    for (const state of STATES) {
      if (state.setup) await browser.evaluate(`(() => { ${state.setup}; return true; })()`)
      if (state.pseudo.length > 0) {
        const forced = await browser.forceState('#sc-probe-select', state.pseudo)
        if (!forced) {
          no(`SC-7-${state.id}`, `the probe node could not be addressed, so the ${state.id} state was NOT measured`)
          continue
        }
      }
      const m = await readProbe()
      console.log(
        `  MEASURED  select @${state.id}: repeat=${m.selectRepeat} · size=${m.selectSize} · position=${m.selectPosition}`,
      )
      if (m.selectRepeat !== 'no-repeat' || !/^1\.15rem|^18\.4px/.test(m.selectSize)) {
        no(
          `SC-7-${state.id}`,
          `⛔ the chevron REGRESSES in the ${state.id} state: repeat=${m.selectRepeat} · size=${m.selectSize} · position=${m.selectPosition}. ` +
            'A `.form-field` state rule using the `background` SHORTHAND reset them',
        )
      } else {
        ok(`SC-7-${state.id}`, `the chevron survives the ${state.id} state: repeat=${m.selectRepeat} · size=${m.selectSize} · position=${m.selectPosition}`)
      }
      // Reset for the next state.
      if (state.pseudo.length > 0) await browser.forceState('#sc-probe-select', [])
      if (state.id === 'disabled') {
        await browser.evaluate("(() => { document.getElementById('sc-probe-select').disabled = false; return true; })()")
      }
      if (state.id === 'invalid') {
        await browser.evaluate("(() => { document.getElementById('sc-probe-select').removeAttribute('aria-invalid'); return true; })()")
      }
    }

    /*
     * ⛔ SC-8 — THE OPERATOR'S SECOND QUESTION, asked of the two losses `SC-6`
     * had just found: *"were bg-surface and border-line also lost in any state
     * variant, or only at rest? Measure rather than infer."*
     */
    {
      const forced = await browser.forceState('#sc-probe-search', ['hover'])
      if (!forced) {
        no('SC-8', 'the search probe could not be addressed, so its hover state was NOT measured')
      } else {
        const m = await readProbe()
        console.log(`  MEASURED  search @hover: background=${m.searchBackground} · border=${m.searchBorder}`)
        /*
         * ⚠️ THE HOVER TINT IS EXPECTED AND IS NOT THE DEFECT. `.form-field:hover`
         * deliberately darkens every field in the product, and this control is a
         * `.form-field`. What must NOT happen is the HAIRLINE vanishing — that
         * was a silent loss, not a designed state.
         */
        if (/rgba\(0,\s*0,\s*0,\s*0\)|transparent/.test(m.searchBorder ?? '')) {
          no('SC-8', `⛔ the search hairline VANISHES on hover: border-color computes ${m.searchBorder}`)
        } else {
          ok(
            'SC-8',
            `the search hairline survives hover (${m.searchBorder}); the fill darkens to ${m.searchBackground}, which is the product-wide \`.form-field:hover\` tint and is DESIGNED, not a loss`,
          )
        }
        await browser.forceState('#sc-probe-search', [])
      }
    }

    await browser.evaluate("(() => { document.getElementById('sc-probe').remove(); return true; })()")
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
   * ⛔ `SC-6` — THE `F-01b` TRAP, MECHANICALLY ENFORCED. Operator ruling,
   * 2026-08-13:
   *
   *     "globals.css already documented this trap and named its remedy, and
   *      the utilities were still written. A documented trap that is not
   *      mechanically enforced is a trap that recurs — if that check is
   *      cheap, build it: any element combining .form-field with a
   *      background or padding utility fails."
   *
   * ▶ It is cheap, and it is built. `.form-field` is UNLAYERED and declares
   * both the `background` and the `padding` SHORTHANDS, so a `bg-*` or `p*-`
   * utility on the same element is EMITTED, MATCHED AND DISCARDED. It looks
   * correct in review and does nothing on screen — which is the whole defect.
   *
   * ⚠️ The remedy is a `.form-field.<modifier>` rule in `app/globals.css`, the
   * pattern that file already established for `.auth-field` and
   * `.notes-field`. This leg names the modifier, so the fix is never a guess.
   */
  /*
   * ⚠️ VARIANT PREFIXES ARE INCLUDED — `hover:bg-*`, `focus:p*-`,
   * `disabled:border-*`, `focus-visible:*`, `active:*`, and any stacked form.
   * Operator ruling, 2026-08-13:
   *
   *     "If it only inspects base-state declarations, it will keep missing
   *      state variants — hover, focus, active, disabled, and their
   *      focus-visible pairs."
   *
   * ▶ A variant utility loses the cascade exactly as a base utility does, and
   * it is WORSE: the base state looks correct and only the state regresses, so
   * a green base-state measurement says nothing about it. That is precisely
   * how the returning hover chevron survived this suite's first green run.
   */
  const OFFENDER =
    /\b(?:[a-z-]+:)*(bg-[a-z0-9[\]./-]+|p[trblxyse]?-[a-z0-9[\]./-]+|border-(?!\[)[a-z][a-z0-9-]*)\b/g
  const violations = []
  for (const f of files) {
    const code = stripComments(readFileSync(f, 'utf8'))
    // Every class string that names `form-field`, of any quote style.
    for (const chunk of code.split(/["'`]/)) {
      if (!/\bform-field\b/.test(chunk)) continue
      const hits = [...chunk.matchAll(OFFENDER)].map((m) => m[0])
      if (hits.length > 0) {
        violations.push(`${f.slice(REPO_ROOT.length + 1)} :: ${[...new Set(hits)].join(' ')}`)
      }
    }
  }
  if (violations.length > 0) {
    no(
      'SC-6',
      `⛔ ${violations.length} element(s) combine \`form-field\` with a background, padding or border utility, which LOSES THE CASCADE and silently does nothing: ` +
        violations.join(' | ') +
        '. Move the value into a `.form-field.<modifier>` rule in app/globals.css',
    )
  } else {
    ok('SC-6', `no element combines \`form-field\` with a background, padding or border utility (${files.length} sources scanned) — the F-01b trap cannot recur silently`)
  }
  // ⚠️ THE CONTROL. The detector must be shown to fire, or "none found" is
  // equally true of a regex that matches nothing.
  //
  // ⛔ THE PLANT THE OPERATOR REQUIRED: *"prove the extension fires by planting
  // a hover:bg-* on a form-field element."* Two of the five offenders below are
  // STATE VARIANTS, so a detector that silently ignored variants would fail
  // this control rather than pass SC-6 vacuously.
  const probe = 'className="form-field bg-surface pl-10 border-line hover:bg-surface-muted focus-visible:p-2"'
  const probeHits = [...probe.split(/["'`]/).filter((c) => /\bform-field\b/.test(c)).join(' ').matchAll(OFFENDER)]
  const variantHits = probeHits.filter((m) => m[0].includes(':'))
  if (probeHits.length === 5 && variantHits.length === 2) {
    ok(
      'SC-6c',
      `CONTROL: the detector MATCHES all 5 planted offenders, 2 of them STATE VARIANTS (${probeHits.map((m) => m[0]).join(' ')})`,
    )
  } else {
    no(
      'SC-6c',
      `the F-01b detector matched ${probeHits.length} of 5 planted offenders (${variantHits.length} of 2 variants), so SC-6 measured nothing`,
    )
  }

  /*
   * ═════════════════════════════════════════════════════════════════════════
   * ⛔ `SC-9` — THE HALF `SC-6` STRUCTURALLY COULD NOT SEE.
   * ═════════════════════════════════════════════════════════════════════════
   * `SC-6` scans COMPONENT class strings. The returning hover chevron lived in
   * a CSS STATE RULE — `.form-field:hover:not(:disabled) { background: … }` —
   * where NO component class string could ever have revealed it. Widening
   * `SC-6` to variants was necessary and is not sufficient; this leg scans the
   * STYLESHEET itself.
   *
   * ⚠️ THE BAR IS ON STATE RULES, AND THE NARROWING IS ARITHMETIC, NOT
   * CONVENIENCE. A first cut barred the shorthand in EVERY `.form-field` rule
   * and failed on two that are provably harmless:
   *
   *   · `.form-field { padding: …; border: … }` is `(0,1,0)` and LOSES to every
   *     `.form-field.<modifier>` at `(0,2,0)`. It is the base value the
   *     modifiers exist to override; it cannot reset one.
   *   · `.form-field.notes-field { padding: … }` is a modifier declaring its
   *     OWN padding. It can only harm an element carrying TWO modifiers.
   *
   * ▶ A STATE rule is different in kind: it co-applies with whatever modifier
   * is on the element AND outranks it — `.form-field:hover:not(:disabled)` is
   * `(0,3,0)`. That asymmetry is the entire defect, and it is why the base
   * `padding` shorthand never disturbed `select-field`'s `padding-inline-end`
   * while the hover `background` shorthand destroyed it.
   *
   * ⛔ THE NARROWING IS NOT TAKEN ON TRUST. `SC-9b` proves the two-modifier
   * case cannot arise, so the second exemption is measured rather than assumed.
   */
  const cssRules = readFileSync(join(REPO_ROOT, 'app', 'globals.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  // ⚠️ Innermost-rule matching, so a rule nested inside `@media` is seen too.
  // A parser blind to at-rules would exempt them by ACCIDENT rather than by
  // classification, which is the failure this whole leg exists to prevent.
  const RULE = /([^{}]+)\{([^{}]*)\}/g
  const SHORTHAND = /(^|;)\s*(background|padding|border)\s*:/g
  const isStateSelector = (selector) =>
    selector
      .split(',')
      .filter((part) => part.includes('.form-field'))
      .some((part) => /[:[]/.test(part.replace(/\.[A-Za-z][\w-]*/g, '')))
  const collectStateShorthands = (css) => {
    const out = []
    for (const [, selector, body] of css.matchAll(new RegExp(RULE.source, 'g'))) {
      if (!selector.includes('.form-field') || !isStateSelector(selector)) continue
      const bad = [...new Set([...body.matchAll(new RegExp(SHORTHAND.source, 'g'))].map((m) => m[2]))]
      if (bad.length > 0) out.push(`${selector.trim().replace(/\s+/g, ' ')} :: ${bad.join(' ')}`)
    }
    return out
  }
  const shorthandRules = collectStateShorthands(cssRules)
  if (shorthandRules.length > 0) {
    no(
      'SC-9',
      `⛔ ${shorthandRules.length} \`.form-field\` STATE rule(s) in app/globals.css use a SHORTHAND, which resets every longhand it omits — ` +
        `this is exactly what returned the tiled chevron on hover: ${shorthandRules.join(' | ')}. Use the longhand`,
    )
  } else {
    ok(
      'SC-9',
      'no `.form-field` STATE rule in app/globals.css uses the `background`, `padding` or `border` SHORTHAND — no state can silently reset a modifier',
    )
  }
  // ⚠️ THE CONTROL, planted in the shape the defect actually had. Line 2 is the
  // LEGAL longhand and line 3 is the EXEMPTED base rule; neither may match, or
  // the leg would be firing for the wrong reason.
  {
    const planted =
      '.form-field:hover:not(:disabled) { background: #eef0f6; }\n' +
      '.form-field:focus { background-color: red; }\n' +
      '.form-field { padding: 1px; }'
    const hits = collectStateShorthands(planted)
    if (hits.length === 1 && hits[0].includes(':hover')) {
      ok('SC-9c', `CONTROL: the matcher FIRES on a planted \`${hits[0]}\` and on NEITHER the longhand state rule nor the base rule beside it`)
    } else {
      no('SC-9c', `the shorthand matcher fired on ${hits.length} rule(s) of 1 planted state rule (${hits.join(' | ')}), so SC-9 measured nothing`)
    }
  }

  /*
   * ⛔ `SC-9b` — WHAT MAKES `SC-9`'s MODIFIER EXEMPTION SOUND. A modifier may
   * declare its own shorthand ONLY because no element ever carries two of them;
   * if one did, the later modifier's shorthand would reset the earlier's
   * longhands at equal specificity. That premise is measured here, not assumed.
   */
  const modifierNames = [...cssRules.matchAll(/\.form-field\.([A-Za-z][\w-]*)\s*\{/g)].map((m) => m[1])
  const uniqueModifiers = [...new Set(modifierNames)]
  const findDoubles = (sources) => {
    const doubled = []
    for (const [label, code] of sources) {
      for (const chunk of code.split(/["'`]/)) {
        if (!/\bform-field\b/.test(chunk)) continue
        const present = uniqueModifiers.filter((m) => new RegExp(`\\b${m}\\b`).test(chunk))
        if (present.length > 1) doubled.push(`${label} :: ${present.join(' + ')}`)
      }
    }
    return doubled
  }
  const doubles = findDoubles(files.map((f) => [f.slice(REPO_ROOT.length + 1), stripComments(readFileSync(f, 'utf8'))]))
  if (doubles.length > 0) {
    no(
      'SC-9b',
      `⛔ ${doubles.length} element(s) carry TWO \`.form-field\` modifiers, so a modifier's own shorthand can reset the other's longhands: ${doubles.join(' | ')}`,
    )
  } else {
    ok(
      'SC-9b',
      `no element carries two of the ${uniqueModifiers.length} \`.form-field\` modifiers (${uniqueModifiers.join(', ')}) — SC-9's modifier exemption holds`,
    )
  }
  {
    const planted = [['planted.tsx', `className="form-field ${uniqueModifiers.slice(0, 2).join(' ')}"`]]
    const hits = uniqueModifiers.length > 1 ? findDoubles(planted) : []
    if (hits.length === 1) {
      ok('SC-9bc', `CONTROL: the two-modifier detector FIRES on a planted \`${hits[0]}\``)
    } else {
      no('SC-9bc', `the two-modifier detector matched ${hits.length} of 1 planted element, so SC-9b measured nothing`)
    }
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
