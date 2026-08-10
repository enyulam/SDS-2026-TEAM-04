#!/usr/bin/env node
// =====================================================================
// (f) RUN A — ONE real AI draft in the DEPLOYED system
// =====================================================================
//
//   npm run hosted:draft -- --dump-only   enumerate controls, click NOTHING
//   npm run hosted:draft -- --go          drive the draft (BILLABLE)
//
// Drives the DEPLOYED application at best-coach-mvp.vercel.app with a real
// trainer session, because the deployed system is the graded requirement.
//
// ⚠️ `--go` IS REQUIRED. Navigation alone is free; the click is not. Default
// is dump-only so this file can never spend by being run.
//
// The session is ADMIN-MINTED (generateLink -> verifyOtp), cookies produced by
// `@supabase/ssr`'s own writer. PASSWORD SIGN-IN IS NOT-RUN.
//
// The verdict is NOT read from the screen. The screen shows a generic
// message; the authoritative record is the server-side `BC_DRAFT_DIAG` line
// (reasons, panels, ratings, usage) pulled from the platform's runtime logs,
// plus the database state.
// =====================================================================

import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import os from 'node:os'
import { join } from 'node:path'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

import { resolveHostedAppHost } from '../fixtures/hosted-target-guard.mjs'

// ⚠️ NOT A LITERAL. These were `best-coach-mvp.vercel.app` — the FROZEN
// demonstration DEPLOYMENT — until the Operator ruling of 2026-08-10 denied it.
// The hosted guard keyed only on the Supabase project ref and so never covered
// this file; the deployment and the database are different systems reached by
// different names.
//
// ⚠️ THERE IS NO DEV DEPLOYMENT AND NONE MAY BE INVENTED. Absent configuration
// means NO TARGET, and this throws rather than falling back — the only host
// this harness ever knew is the frozen one.
const HOST = resolveHostedAppHost()
const APP = `https://${HOST}`
const DEBUG_PORT = 9422
const CHROME = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const TRAINER_EMAIL = 'trainer.fixture@example.test'
const TRAINER_SUB = 'd0000000-0000-4000-8000-000000000002'

const reportId = process.argv.find((a) => /^[0-9a-f-]{36}$/.test(a))
const GO = process.argv.includes('--go')
if (!reportId) {
  console.error('usage: run-f-hosted-draft.mjs <reportId> [--go]')
  process.exit(1)
}

const url = process.env.BEST_COACH_HOSTED_SUPABASE_URL
const secret = process.env.BEST_COACH_HOSTED_SECRET_KEY
const publishable = process.env.BEST_COACH_HOSTED_PUBLISHABLE_KEY
if (!url || !secret || !publishable) {
  console.error('hosted env vars missing')
  process.exit(1)
}

// ---- admin-minted session -> library-written cookies -------------------
const admin = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
})
const link = await admin.auth.admin.generateLink({ type: 'magiclink', email: TRAINER_EMAIL })
if (link.error || !link.data?.properties?.hashed_token) {
  console.error('could not mint the trainer magiclink')
  process.exit(1)
}
const jar = new Map()
const ssr = createServerClient(url, publishable, {
  cookies: {
    getAll: () => [...jar.entries()].map(([name, value]) => ({ name, value })),
    setAll: (list) => {
      for (const { name, value } of list) {
        if (value === '') jar.delete(name)
        else jar.set(name, value)
      }
    },
  },
})
const verified = await ssr.auth.verifyOtp({ type: 'magiclink', token_hash: link.data.properties.hashed_token })
if (verified.error || verified.data?.user?.id !== TRAINER_SUB) {
  console.error('the trainer session did not resolve to the expected auth user')
  process.exit(1)
}
console.log(`ADMIN-MINTED trainer session (${jar.size} cookie(s)). Password sign-in NOT-RUN.`)

// ---- CDP ---------------------------------------------------------------
const profile = mkdtempSync(join(os.tmpdir(), 'bc-runf-'))
const chrome = spawn(
  CHROME,
  [
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${profile}`,
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    'about:blank',
  ],
  { stdio: 'ignore' },
)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let ws = null
let nextId = 1
const waiters = new Map()

async function attach() {
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json()
      const page = targets.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
      if (page) {
        await new Promise((resolve, reject) => {
          ws = new WebSocket(page.webSocketDebuggerUrl)
          ws.addEventListener('open', () => resolve())
          ws.addEventListener('error', () => reject(new Error('CDP socket failed')))
          ws.addEventListener('message', (ev) => {
            const m = JSON.parse(ev.data)
            const w = waiters.get(m.id)
            if (w) {
              waiters.delete(m.id)
              w(m)
            }
          })
        })
        return
      }
    } catch {
      /* not up */
    }
    await sleep(300)
  }
  throw new Error('Chrome did not expose a page target')
}
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = nextId++
    waiters.set(id, resolve)
    ws.send(JSON.stringify({ id, method, params }))
  })
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  return r.result?.result?.value
}

try {
  await attach()
  for (const [name, value] of jar) {
    await send('Network.setCookie', { name, value, domain: HOST, path: '/', secure: true })
  }

  const target = `${APP}/trainer/reports/${reportId}/generate`
  console.log(`\nnavigating: ${target}`)
  await send('Page.navigate', { url: target })

  // Wait for hydration: the loading text must clear.
  let text = ''
  const deadline = Date.now() + 45_000
  while (Date.now() < deadline) {
    await sleep(700)
    text = (await evaluate('document.body ? document.body.innerText : ""')) ?? ''
    if (text && !text.includes('Preparing the saved assessment')) break
  }
  console.log('\n--- rendered text ---')
  console.log(text.replace(/\s+/g, ' ').slice(0, 900))

  const controls = await evaluate(`JSON.stringify(
    [...document.querySelectorAll('button,[role=button],a')]
      .map(e => ({ tag: e.tagName, text: (e.innerText||'').trim().slice(0,80),
                   disabled: e.disabled === true, href: e.getAttribute('href') || null }))
      .filter(c => c.text))`)
  console.log('\n--- controls ---')
  console.log(controls)

  if (!GO) {
    console.log('\n⚠️ DUMP-ONLY IS NOT COST-FREE HERE: this page AUTO-DISPATCHES on mount.')
    console.log('There is no generate button, so navigation alone triggers the server action.')
  } else {
    // No button exists — the action was dispatched by the page on mount, at
    // navigation. So this waits for a TERMINAL state rather than clicking.
    console.log('\nauto-dispatched on mount; waiting up to 180s for a terminal state...')
    const end = Date.now() + 180_000
    let after = text
    while (Date.now() < end) {
      await sleep(2500)
      after = (await evaluate('document.body ? document.body.innerText : ""')) ?? ''
      if (/rejected|unavailable|not configured|could not|failed|Review four-panel/i.test(after)) break
      if (/Overview[\s\S]*Strengths[\s\S]*Areas for Development/i.test(after)) break
    }
    console.log('\n--- terminal text ---')
    console.log(after.replace(/\s+/g, ' ').slice(0, 2000))
  }

} finally {
  try {
    ws?.close()
  } catch {
    /* gone */
  }
  try {
    chrome.kill()
  } catch {
    /* gone */
  }
  try {
    rmSync(profile, { recursive: true, force: true })
  } catch {
    /* best effort */
  }
}
