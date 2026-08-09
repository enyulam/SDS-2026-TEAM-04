#!/usr/bin/env node
// =====================================================================
// (f) SETUP — save the nine-dimension assessment on HOSTED, as the trainer
// =====================================================================
//
// Run: npm run hosted:setup-assessment
//
// Creates the assessment the AI draft will be grounded against. This is
// SETUP, not the AI feature: it goes through the governed RPC
// `assessment_save_complete_and_open_report` using an RLS-SCOPED TRAINER
// CLIENT — the same authority the UI holds.
//
// ⚠️ IT DELIBERATELY DOES NOT USE THE SECRET KEY. Passing the secret key as
// the `apikey` while overriding Authorization with the trainer's token would
// connect, but the call would execute as `service_role`, NOT as the trainer
// under RLS. That bypasses the exact boundary this system exists to
// demonstrate and would make this a fabrication of the governed write rather
// than an instance of it.
//
// The session is ADMIN-MINTED (generateLink -> verifyOtp). Password sign-in
// is NOT-RUN.
//
// The ratings are the profile reported to the Operator BEFORE any provider
// call: 2 `beginning` · 3 `developing` · 3 `mastering` · 1 `mastered`.
// =====================================================================

import { createClient } from '@supabase/supabase-js'

const REF = 'zjukuffiuzkbiblmnuwl'
const SESSION_ID = 'c5000000-0000-4000-8000-000000000001'
const STUDENT_ID = 'c2000000-0000-4000-8000-000000000001'
const TRAINER_SUB = 'd0000000-0000-4000-8000-000000000002'
const TRAINER_EMAIL = 'trainer.fixture@example.test'

/** Reported to the Operator in advance. Two clearly non-positive dimensions. */
export const RATINGS = [
  { dimension_code: 'body', rating: 'mastering' },
  { dimension_code: 'emotion', rating: 'developing' },
  { dimension_code: 'speech', rating: 'mastered' },
  { dimension_code: 'tonality', rating: 'developing' },
  { dimension_code: 'eye_contact', rating: 'beginning' },
  { dimension_code: 'vocal_projection', rating: 'mastering' },
  { dimension_code: 'emotional_expression', rating: 'developing' },
  { dimension_code: 'sentence_flow', rating: 'mastering' },
  { dimension_code: 'audience_awareness', rating: 'beginning' },
]

const NOTES =
  'Delivered the practice speech with clear articulation and well-structured sentences; ' +
  'projection carried to the back row. Kept eyes on notes for most of the delivery and did ' +
  'not adjust when the group lost attention.'
const FOLLOW_UP =
  'Practise looking up at the audience between sentences, and check whether listeners are ' +
  'following before moving on.'

const url = process.env.BEST_COACH_HOSTED_SUPABASE_URL
const secret = process.env.BEST_COACH_HOSTED_SECRET_KEY
const publishable = process.env.BEST_COACH_HOSTED_PUBLISHABLE_KEY

for (const [name, v] of [
  ['BEST_COACH_HOSTED_SUPABASE_URL', url],
  ['BEST_COACH_HOSTED_SECRET_KEY', secret],
  ['BEST_COACH_HOSTED_PUBLISHABLE_KEY', publishable],
]) {
  if (!v) {
    console.error(`${name} is missing from .env.local.`)
    process.exit(1)
  }
}
if (!url.includes(REF)) {
  console.error(`REFUSED: the API URL does not carry the pinned ref ${REF}.`)
  process.exit(1)
}
if (!publishable.startsWith('sb_publishable_') && !publishable.startsWith('eyJ')) {
  console.error('REFUSED: BEST_COACH_HOSTED_PUBLISHABLE_KEY is not a publishable key.')
  process.exit(1)
}
if (publishable === secret) {
  console.error('REFUSED: the publishable and secret keys are identical.')
  process.exit(1)
}

const admin = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
})
const link = await admin.auth.admin.generateLink({ type: 'magiclink', email: TRAINER_EMAIL })
if (link.error || !link.data?.properties?.hashed_token) {
  console.error('could not mint a magiclink for the trainer identity')
  process.exit(1)
}

// RLS-SCOPED: the PUBLISHABLE key is the apikey, so this client is the
// `authenticated` role acting as the trainer — never `service_role`.
const trainer = createClient(url, publishable, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
})
const verified = await trainer.auth.verifyOtp({
  type: 'magiclink',
  token_hash: link.data.properties.hashed_token,
})
if (verified.error || verified.data?.user?.id !== TRAINER_SUB) {
  console.error('the trainer session did not resolve to the expected auth user')
  process.exit(1)
}
console.log('ADMIN-MINTED trainer session established (password sign-in NOT-RUN)')

const existing = await trainer.rpc('assessment_get_trainer_observation', {
  p_class_session_id: SESSION_ID,
  p_student_id: STUDENT_ID,
})
const obs = Array.isArray(existing.data) ? existing.data[0] : existing.data
if (existing.error) {
  console.error('the trainer could not read the observation:', existing.error.code ?? existing.error.message)
  process.exit(1)
}

const saved = await trainer.rpc('assessment_save_complete_and_open_report', {
  p_class_session_id: SESSION_ID,
  p_student_id: STUDENT_ID,
  p_expected_observation_id: obs?.observation_id ?? null,
  p_expected_lock_version: obs?.lock_version ?? null,
  p_strength_chips: [],
  p_focus_chips: [],
  p_observation_notes: NOTES,
  p_follow_up_notes: FOLLOW_UP,
  p_term_evidence_notes: null,
  p_ratings: RATINGS,
})
if (saved.error) {
  console.error('the governed save was REFUSED:', saved.error.code ?? saved.error.message)
  process.exit(1)
}
const row = Array.isArray(saved.data) ? saved.data[0] : saved.data
console.log('governed nine-dimension save EXECUTED as the trainer, under RLS')
console.log(JSON.stringify(
  {
    reportId: row.report_id,
    status: row.report_status,
    reportLockVersion: row.report_lock_version,
    created: row.report_created,
    observationId: row.observation_id,
    observationLockVersion: row.observation_lock_version,
  },
  null,
  2,
))
