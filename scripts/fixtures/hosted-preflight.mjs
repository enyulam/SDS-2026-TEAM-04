#!/usr/bin/env node
// =====================================================================
// HOSTED PREFLIGHT — READ-ONLY catalogue census of the hosted project
// =====================================================================
//
// Run: node scripts/fixtures/hosted-preflight.mjs
//      npm run fixtures:hosted-preflight
//
// Answers one question with evidence: IS THE HOSTED PROJECT EMPTY AND CLEAN?
//
// It WRITES NOTHING. No DDL, no DML, no migration, no fixture. It exists so
// that "the project is empty" is a MEASUREMENT taken from the catalogue
// rather than a dashboard impression, and so that a NON-empty project is a
// hard stop before anything is applied on top of unknown state.
//
// It reuses the same PINNED-REF guards as the hosted loader, so it can no
// more be pointed at the wrong project than the loader can.
//
// No credential is printed. Only counts, names and the decision.
//
// EXIT: 0 empty and clean · 1 NOT empty, or refused, or unreachable.
// =====================================================================

import postgres from 'postgres'
import {
  TargetRefused,
  assertHostedDbUrl,
  requireVar,
  resolveHostedProjectRef,
} from './hosted-target-guard.mjs'

const VAR_DB = 'BEST_COACH_HOSTED_DB_URL'

const SafeError = TargetRefused

const say = (m) => process.stdout.write(`${m}\n`)
const phase = (m) => say(`\n[ ${m} ]`)

async function main() {
  phase('Target guard')
  const ref = resolveHostedProjectRef()
  const value = requireVar(VAR_DB)
  const checked = assertHostedDbUrl(value, ref, VAR_DB)
  const db = { value, port: checked.port, where: checked.where }
  say(`  PASS  the frozen demonstration project is denied unconditionally`)
  say(`  PASS  the connection carries the expected ref "${ref}" in its ${db.where}`)
  say(`  ....  port ${db.port}${db.port === '6543' ? '  ⚠️ TRANSACTION pooler — migrations need SESSION (5432)' : ''}`)

  const sql = postgres(db.value, {
    prepare: false,
    max: 1,
    idle_timeout: 10,
    connect_timeout: 20,
    onnotice: () => {},
    debug: false,
  })

  try {
    phase('Identity of the server actually reached')
    const [who] = await sql`
      SELECT current_database() AS db, current_user AS usr,
             inet_server_port() AS port, version() AS ver`
    say(`  ....  database=${who.db} user=${who.usr} port=${who.port}`)
    say(`  ....  ${String(who.ver).split(' on ')[0]}`)

    phase('Catalogue census — READ ONLY')
    const [c] = await sql`
      SELECT
        (SELECT count(*)::int FROM pg_tables WHERE schemaname = 'public')            AS tables,
        (SELECT count(*)::int FROM pg_views  WHERE schemaname = 'public')            AS views,
        (SELECT count(*)::int FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
          WHERE n.nspname = 'public')                                                AS functions,
        (SELECT count(*)::int FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
          WHERE n.nspname = 'public' AND t.typtype = 'e')                            AS enums,
        (SELECT count(*)::int FROM pg_policies WHERE schemaname = 'public')          AS policies,
        (SELECT count(*)::int FROM auth.users)                                       AS auth_users`
    say(`  ....  public tables=${c.tables} views=${c.views} functions=${c.functions} enums=${c.enums} policies=${c.policies}`)
    say(`  ....  auth.users=${c.auth_users}`)

    // The migration ledger may not exist at all on an untouched project.
    let migrations = null
    let migrationList = []
    const [{ present }] = await sql`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
         WHERE table_schema = 'supabase_migrations' AND table_name = 'schema_migrations'
      ) AS present`
    if (present) {
      const rows = await sql`SELECT version FROM supabase_migrations.schema_migrations ORDER BY version`
      migrationList = rows.map((r) => r.version)
      migrations = migrationList.length
      say(`  ....  supabase_migrations.schema_migrations EXISTS, ${migrations} row(s)`)
    } else {
      say('  ....  supabase_migrations.schema_migrations does NOT exist (an untouched project)')
    }

    phase('Verdict')
    const reasons = []
    if (c.tables > 0) reasons.push(`${c.tables} public table(s)`)
    if (c.functions > 0) reasons.push(`${c.functions} public function(s)`)
    if (c.enums > 0) reasons.push(`${c.enums} public enum(s)`)
    if (c.policies > 0) reasons.push(`${c.policies} policy/policies`)
    if (c.auth_users > 0) reasons.push(`${c.auth_users} auth user(s)`)
    if (migrations !== null && migrations > 0) reasons.push(`${migrations} applied migration(s)`)

    if (reasons.length > 0) {
      say(`  ⛔ NOT EMPTY: ${reasons.join(', ')}`)
      if (migrationList.length > 0) say(`  applied: ${migrationList.join(', ')}`)
      say('\n  STOP. Nothing was applied. Do not stack a migration on unknown state.')
      throw new SafeError('the hosted project is not empty')
    }

    say('  ✅ EMPTY AND CLEAN — zero public tables, functions, enums, policies and auth users.')
    say('  Safe to apply the 17 migrations.')
  } finally {
    await sql.end({ timeout: 5 })
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    process.stderr.write(`\nPREFLIGHT: ${e instanceof SafeError ? e.message : 'could not reach the hosted database.'}\n`)
    process.exit(1)
  })
