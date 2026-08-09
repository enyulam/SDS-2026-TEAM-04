#!/usr/bin/env node
// TEMPORARY — paired with app/api/_diag/draft/route.ts. Removed with it (T-DIAG-REMOVE).
// Admin-minted trainer session -> POST the gated diagnostic route -> print the body verbatim.
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const APP = 'https://best-coach-mvp.vercel.app'
const TRAINER_EMAIL = 'trainer.fixture@example.test'
const TRAINER_SUB = 'd0000000-0000-4000-8000-000000000002'
const url = process.env.BEST_COACH_HOSTED_SUPABASE_URL
const secret = process.env.BEST_COACH_HOSTED_SECRET_KEY
const publishable = process.env.BEST_COACH_HOSTED_PUBLISHABLE_KEY
if (!url || !secret || !publishable) { console.error('hosted env vars missing'); process.exit(1) }

const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } })
const link = await admin.auth.admin.generateLink({ type: 'magiclink', email: TRAINER_EMAIL })
if (link.error || !link.data?.properties?.hashed_token) { console.error('mint failed'); process.exit(1) }
const jar = new Map()
const ssr = createServerClient(url, publishable, {
  cookies: { getAll: () => [...jar.entries()].map(([name, value]) => ({ name, value })),
             setAll: (l) => { for (const { name, value } of l) { if (value === '') jar.delete(name); else jar.set(name, value) } } },
})
const v = await ssr.auth.verifyOtp({ type: 'magiclink', token_hash: link.data.properties.hashed_token })
if (v.error || v.data?.user?.id !== TRAINER_SUB) { console.error('session did not resolve to the trainer'); process.exit(1) }
console.log(`ADMIN-MINTED trainer session (${jar.size} cookie(s)). Password sign-in NOT-RUN.`)

const cookie = [...jar.entries()].map(([n, val]) => `${n}=${val}`).join('; ')
const res = await fetch(`${APP}/api/_diag/draft`, {
  method: 'POST',
  headers: { 'content-type': 'application/json', cookie },
  body: JSON.stringify({ sessionId: 'c5000000-0000-4000-8000-000000000001', studentId: 'c2000000-0000-4000-8000-000000000001' }),
})
console.log(`\nHTTP ${res.status} ${res.statusText}`)
const text = await res.text()
try { console.log(JSON.stringify(JSON.parse(text), null, 2)) } catch { console.log(text.slice(0, 4000)) }
