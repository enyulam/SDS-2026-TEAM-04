#!/usr/bin/env node
// =====================================================================
// PROVE THE TRUSTED-STORE ACL IS UNCHANGED BY THE HOSTED TRANSPORT
// =====================================================================
//
// Run: node scripts/physical-test/prove-trusted-store-acl.mjs
//      npm run prove:trusted-store-acl
//
// The hosted trusted-draft channel changes the TRANSPORT to the privileged
// role. The Operator's ruling is explicit that it must change NOTHING else:
// `report_store_draft` stays owner-only, ZERO client EXECUTE, no new grant,
// no BYPASSRLS, no broad table privileges.
//
// A comment asserting that is worth nothing. This measures it.
//
// ⚠️ THE NEGATIVE CONTROL IS THE LOAD-BEARING PART. An assertion that a
// grant is ABSENT passes just as happily when the function itself is missing,
// when the query is misspelled, or when the database is empty. So every leg
// first proves the OBJECT EXISTS and the probe RETURNED A ROW, and only then
// asserts the ACL. A zero-row reading is UNMEASURED, never a pass.
//
// EXIT: 0 all legs PASS · 1 any leg FAIL or UNMEASURED.
// =====================================================================

import { spawnSync } from 'node:child_process'

import { resolveLocalTarget } from '../fixtures/local-target-guard.mjs'

// ⚠️ NOT A LITERAL. This proof reaches a database as `postgres` to read
// catalogue ACLs, so it is exactly the class of tool that must never be able
// to name the frozen demonstration container. It was
// `'supabase_db_best-coach-mvp'` until 2026-08-10 — which, once this clone
// took its own project id, pointed this proof at the DEMONSTRATION database
// and would have reported ITS ACLs as though they were this repository's.
const { dbContainer: CONTAINER } = resolveLocalTarget()

/** The four owner-only functions R-27 governs. */
const OWNER_ONLY = [
  'report_store_draft',
  'report_store_source_map',
  'report_content_hash_v2',
  'report_wording_hash_v2',
]

const legs = []
const record = (state, id, detail) => {
  legs.push({ state, id, detail })
  console.log(`  ${state.padEnd(9)} ${id}  ${detail}`)
}

function psql(sql) {
  const r = spawnSync(
    'docker',
    ['exec', '-i', CONTAINER, 'psql', '--no-psqlrc', '--username=postgres', '--dbname=postgres',
      '--quiet', '--set=ON_ERROR_STOP=1', '-t', '-A', '-F|'],
    { input: sql, encoding: 'utf8' },
  )
  return { status: r.status, out: (r.stdout ?? '').trim(), err: (r.stderr ?? '').trim() }
}

// ---------------------------------------------------------------------
// LEG 1 — each owner-only function EXISTS, is owned by postgres, and grants
// EXECUTE to NOBODY outside the owner.
// ---------------------------------------------------------------------
for (const fn of OWNER_ONLY) {
  const q = `
SELECT p.proname,
       pg_catalog.pg_get_userbyid(p.proowner) AS owner,
       COALESCE(p.proacl::text, 'NULL') AS acl,
       (SELECT count(*) FROM pg_catalog.aclexplode(p.proacl) ae
          WHERE ae.grantee <> p.proowner) AS non_owner_grants,
       (SELECT count(*) FROM pg_catalog.aclexplode(p.proacl) ae
          WHERE ae.grantee = 0) AS public_grants
  FROM pg_catalog.pg_proc p
  JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
 WHERE n.nspname = 'public' AND p.proname = '${fn}';`
  const r = psql(q)
  if (r.status !== 0) {
    record('FAIL', `ACL-${fn}`, `the probe did not run (psql exit ${r.status})`)
    continue
  }
  // NEGATIVE CONTROL: no row means the function is absent, which would make
  // "no grants" trivially true. That is UNMEASURED, not a pass.
  if (r.out === '') {
    record('UNMEASURED', `ACL-${fn}`, 'the function does not exist; an absent grant on an absent function proves nothing')
    continue
  }
  const [, owner, acl, nonOwner, publicGrants] = r.out.split('|')
  if (owner !== 'postgres') {
    record('FAIL', `ACL-${fn}`, `owner is "${owner}", expected postgres`)
  } else if (Number(publicGrants) > 0) {
    record('FAIL', `ACL-${fn}`, `PUBLIC holds a grant (acl ${acl})`)
  } else if (Number(nonOwner) > 0) {
    record('FAIL', `ACL-${fn}`, `${nonOwner} NON-OWNER grant(s) exist (acl ${acl}) — client EXECUTE is no longer zero`)
  } else {
    record('PASS', `ACL-${fn}`, `exists, owned by postgres, ZERO non-owner EXECUTE (acl ${acl})`)
  }
}

// ---------------------------------------------------------------------
// LEG 2 — the client roles cannot execute report_store_draft. Asserted
// POSITIVELY with has_function_privilege rather than by reading the ACL a
// second time, so a misread ACL cannot produce a false clean.
// ---------------------------------------------------------------------
for (const role of ['anon', 'authenticated', 'service_role']) {
  const r = psql(`
SELECT has_function_privilege('${role}', p.oid, 'EXECUTE')
  FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
 WHERE n.nspname = 'public' AND p.proname = 'report_store_draft';`)
  if (r.status !== 0) {
    record('FAIL', `EXEC-${role}`, `the probe did not run (psql exit ${r.status})`)
  } else if (r.out === '') {
    record('UNMEASURED', `EXEC-${role}`, 'no row returned; the function or role is absent')
  } else if (r.out === 'f') {
    record('PASS', `EXEC-${role}`, 'cannot EXECUTE report_store_draft')
  } else {
    record('FAIL', `EXEC-${role}`, `CAN EXECUTE report_store_draft — R-27 is violated`)
  }
}

// ---------------------------------------------------------------------
// LEG 3 — the negative control on the control itself. A role that SHOULD
// hold EXECUTE somewhere must read `t`, otherwise has_function_privilege is
// returning `f` for a reason unrelated to the grant and every PASS above is
// vacuous.
// ---------------------------------------------------------------------
const control = psql(`
SELECT has_function_privilege('authenticated', p.oid, 'EXECUTE')
  FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
 WHERE n.nspname = 'public' AND p.proname = 'report_get_canonical';`)
if (control.status !== 0 || control.out === '') {
  record('UNMEASURED', 'CTRL', 'the control probe returned nothing; the EXEC legs above cannot be trusted')
} else if (control.out === 't') {
  record('PASS', 'CTRL', 'authenticated CAN execute report_get_canonical — has_function_privilege discriminates')
} else {
  record('FAIL', 'CTRL', 'authenticated cannot execute report_get_canonical either; the EXEC probes are not discriminating')
}

// ---------------------------------------------------------------------
// LEG 4 — NO ROLE *GAINED* BYPASSRLS.
//
// ⚠️ The first version of this leg asserted "no role outside a hand-written
// allowlist holds BYPASSRLS" and FAILED, naming `service_role` and
// `supabase_etl_admin`. The assertion was wrong, not the system.
//
// `service_role` carrying BYPASSRLS is a SUPABASE PLATFORM DEFAULT that this
// architecture explicitly designs around rather than fights. The migrations
// say so in terms: "NOTHING IS GRANTED TO service_role, EVER. It carries
// BYPASSRLS, so the ONLY control is zero privilege" (D-254, repeated across
// Step 7G/7H/7I and the assessment and correction migrations). No migration
// in this repository contains BYPASSRLS, ALTER ROLE or CREATE ROLE at all —
// verified — so neither role's attribute originates here.
//
// The control that actually constrains `service_role` is therefore ZERO
// PRIVILEGE, and LEG 2 above proves exactly that by measurement.
//
// So the right question is not "does any role hold BYPASSRLS" — platform
// roles always will — but "has the BYPASSRLS SET CHANGED". This pins the
// measured baseline and fails on any ADDITION.
// ---------------------------------------------------------------------
const BYPASSRLS_BASELINE = ['service_role', 'supabase_etl_admin']

const bypass = psql(
  `SELECT COALESCE(string_agg(rolname, ',' ORDER BY rolname), 'none')
     FROM pg_roles
    WHERE rolbypassrls
      AND NOT rolsuper
      AND rolname NOT IN ('postgres','supabase_admin','supabase_auth_admin',
                          'supabase_storage_admin','supabase_replication_admin',
                          'supabase_read_only_user','pgbouncer','supabase_realtime_admin');`,
)
if (bypass.status !== 0) {
  record('FAIL', 'BYPASSRLS', `the probe did not run (psql exit ${bypass.status})`)
} else if (bypass.out === '') {
  record('UNMEASURED', 'BYPASSRLS', 'the probe returned no row')
} else {
  const found = bypass.out === 'none' ? [] : bypass.out.split(',')
  const added = found.filter((r) => !BYPASSRLS_BASELINE.includes(r))
  if (added.length > 0) {
    record('FAIL', 'BYPASSRLS', `role(s) GAINED BYPASSRLS since the baseline: ${added.join(', ')}`)
  } else {
    record(
      'PASS',
      'BYPASSRLS',
      `the BYPASSRLS set is the platform baseline [${found.join(', ') || 'none'}], unchanged; ` +
        'service_role is constrained by ZERO PRIVILEGE (LEG 2), not by RLS — D-254',
    )
  }
}

const bad = legs.filter((l) => l.state !== 'PASS')
console.log(`\n=== TRUSTED-STORE ACL: ${legs.length - bad.length} PASS · ${bad.length} NOT-PASS ===`)
if (bad.length === 0) {
  console.log('The ACL model is UNCHANGED: report_store_draft remains owner-only with zero client EXECUTE.')
  console.log('The hosted channel changed the TRANSPORT to the privileged role and nothing else.')
}
process.exit(bad.length === 0 ? 0 : 1)
