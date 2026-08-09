#!/usr/bin/env node
// =====================================================================
// HOSTED STATE PROBE — READ-ONLY. What is actually there right now?
// =====================================================================
//
// Run: npm run fixtures:hosted-state
//
// Written after a partial fixture load, to answer three questions with
// measurement rather than inference:
//
//   1. Do the three synthetic Auth identities still exist?
//   2. Did ANY domain fixture row land before the failure — partial or zero?
//   3. Is anything else present that should not be?
//
// It WRITES NOTHING: no DDL, no DML, no cleanup. "Do not assume rollback" is
// the whole point — a multi-statement request can commit some statements and
// abort on a later one, so the only trustworthy answer is a row count.
//
// Carries the same pinned-ref guard as every other hosted tool.
// =====================================================================

import postgres from 'postgres'

const HOSTED_PROJECT_REF = 'zjukuffiuzkbiblmnuwl'
const VAR_DB = 'BEST_COACH_HOSTED_DB_URL'

/** The ratified fixture probes: one representative fixed UUID per table. */
const FIXTURE_PROBES = [
  ['accounts', 'id', 'c0000000-0000-4000-8000-000000000001'],
  ['centre_memberships', 'id', 'c1000000-0000-4000-8000-000000000001'],
  ['trainer_profiles', 'membership_id', 'c1000000-0000-4000-8000-000000000002'],
  ['parent_profiles', 'membership_id', 'c1000000-0000-4000-8000-000000000003'],
  ['students', 'id', 'c2000000-0000-4000-8000-000000000001'],
  ['parent_student_links', 'id', 'c3000000-0000-4000-8000-000000000001'],
  ['class_modules', 'id', 'c4000000-0000-4000-8000-000000000001'],
  ['class_sessions', 'id', 'c5000000-0000-4000-8000-000000000001'],
  ['enrolments', 'id', 'c6000000-0000-4000-8000-000000000001'],
  ['class_session_assignments', 'id', 'c7000000-0000-4000-8000-000000000001'],
  ['attendance', 'id', 'c8000000-0000-4000-8000-000000000001'],
  ['observations', 'id', 'c9000000-0000-4000-8000-000000000001'],
  ['observation_ratings', 'id', 'ca000000-0000-4000-8000-000000000001'],
]

/** Seed rows the MIGRATIONS create — present is CORRECT, not fixture residue. */
const SEED_TABLES = ['centres', 'class_grades', 'assessment_dimensions']

const say = (m) => process.stdout.write(`${m}\n`)
const phase = (m) => say(`\n[ ${m} ]`)

const raw = process.env[VAR_DB]
if (typeof raw !== 'string' || raw.trim() === '') {
  process.stderr.write(`${VAR_DB} must be present in .env.local.\n`)
  process.exit(1)
}
const url = new URL(raw.trim())
if (
  !decodeURIComponent(url.username).includes(HOSTED_PROJECT_REF) &&
  !url.hostname.includes(HOSTED_PROJECT_REF)
) {
  process.stderr.write(`REFUSED: ${VAR_DB} does not carry the pinned ref "${HOSTED_PROJECT_REF}".\n`)
  process.exit(1)
}

const sql = postgres(raw.trim(), { prepare: false, max: 1, onnotice: () => {}, connect_timeout: 20 })

try {
  phase('Auth identities (were CREATED before the failure — are they still there?)')
  const users = await sql`
    SELECT id::text AS id, email, (deleted_at IS NULL) AS live
      FROM auth.users ORDER BY email`
  if (users.length === 0) say('  NONE — auth.users is empty')
  for (const u of users) say(`  ${u.live ? 'LIVE   ' : 'DELETED'} ${u.email}  ${u.id}`)
  say(`  total: ${users.length}`)

  phase('Domain fixture rows — did ANY land? (partial commits are possible)')
  let landed = 0
  for (const [table, column, id] of FIXTURE_PROBES) {
    const rows = await sql.unsafe(
      `SELECT count(*)::int AS n FROM public.${table} WHERE ${column} = '${id}'::uuid`,
    )
    const n = rows[0].n
    if (n > 0) landed += 1
    say(`  ${n > 0 ? 'PRESENT' : 'absent '}  ${table}`)
  }
  say(`  ${landed} of ${FIXTURE_PROBES.length} fixture probes present`)

  phase('Whole-table counts (fixture tables)')
  for (const [table] of FIXTURE_PROBES) {
    const rows = await sql.unsafe(`SELECT count(*)::int AS n FROM public.${table}`)
    if (rows[0].n > 0) say(`  ${String(rows[0].n).padStart(4)}  ${table}`)
  }

  phase('Migration seed rows (created by the MIGRATIONS — presence is correct)')
  for (const table of SEED_TABLES) {
    const rows = await sql.unsafe(`SELECT count(*)::int AS n FROM public.${table}`)
    say(`  ${String(rows[0].n).padStart(4)}  ${table}`)
  }

  phase('Governed state (must all be zero on a fresh project)')
  const [g] = await sql`
    SELECT (SELECT count(*)::int FROM public.reports) AS reports,
           (SELECT count(*)::int FROM public.report_versions) AS report_versions,
           (SELECT count(*)::int FROM public.audit_events) AS audit_events,
           (SELECT count(*)::int FROM public.audit_chain_heads) AS chain_heads`
  say(`  reports=${g.reports} report_versions=${g.report_versions} audit_events=${g.audit_events} chain_heads=${g.chain_heads}`)

  phase('Verdict')
  if (landed === 0) say('  DOMAIN FIXTURES: ZERO landed. The failure left no partial domain state.')
  else if (landed === FIXTURE_PROBES.length) say('  DOMAIN FIXTURES: ALL landed.')
  else say(`  ⚠️ DOMAIN FIXTURES: PARTIAL — ${landed}/${FIXTURE_PROBES.length}. Do not load on top of this.`)
  say(`  AUTH IDENTITIES: ${users.filter((u) => u.live).length} live.`)
} finally {
  await sql.end({ timeout: 5 })
}
