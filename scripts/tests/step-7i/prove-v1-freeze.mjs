#!/usr/bin/env node
// =====================================================================
// B.E.S.T Coach -- V1 HASH SERIALIZER FREEZE PROOF
// =====================================================================
// G-05a items 1-2 (Operator, 2026-08-08) freeze the V1 serializers as
// HISTORICAL SEMANTICS: their body, v_names array, domain-separation string,
// signature, ACL and COMMENT must not change. The OD-4 migration (M13)
// introduces PARALLEL V2 serializers and must leave V1 untouched.
//
// ---------------------------------------------------------------------
// WHY A DEDICATED PROOF (adversarial review, P1-T02)
// ---------------------------------------------------------------------
// The P1-T02 design proposed pinning only a `prosrc` digest. That covers the
// body, the v_names array and the domain string -- all three live inside the
// body -- but it is BLIND to three of the six frozen properties:
//   * SIGNATURE  -- ALTER FUNCTION ... RENAME, or a changed proargnames,
//                   leaves prosrc byte-identical;
//   * ACL        -- a GRANT EXECUTE ... TO authenticated does not touch prosrc;
//   * COMMENT    -- COMMENT ON FUNCTION does not touch prosrc, and there is no
//                   COMMENT assertion anywhere else in the tree, so a rewritten
//                   V1 comment would otherwise pass every suite.
//
// And `verify-fresh-apply.mjs` is STRUCTURALLY INCAPABLE of catching any of
// this: it compares a fresh apply against the canonical database, and M13 runs
// on BOTH sides, so any V1 change M13 made would appear identically on both
// and produce zero difference.
//
// This proof therefore pins ELEVEN properties, per the Operator's list.
//
// prosrc is compared under the RATIFIED EOL canonicalization (F-P0-3,
// 2026-08-09): CRLF -> LF, then bare CR -> LF, and nothing else. The migration
// files sit CRLF in a Windows checkout, so a raw byte comparison would measure
// the transport rather than the semantics.
//
// Run: node scripts/tests/step-7i/prove-v1-freeze.mjs
// =====================================================================

import { spawn } from 'node:child_process'

import { resolveLocalTarget } from "../../fixtures/local-target-guard.mjs"

// ⚠️ NOT A LITERAL. This was `supabase_db_best-coach-mvp` — the FROZEN
// demonstration container — and with both local stacks running that name
// RESOLVED, so this harness reached the demonstration database instead of
// this repository's. Guarded resolution: unconditional non-overridable HARD
// DENY of the frozen project, then a fail-closed pin from
// BEST_COACH_LOCAL_PROJECT_ID. Container name DERIVED, never literal.
const { dbContainer: CONTAINER } = resolveLocalTarget()
const DB = 'postgres'

// PINNED 2026-08-09 from the live canonical database, BEFORE M13 was written.
// If M13 changes any of these, this proof fails and the change must be
// reverted -- never rationalized as part of OD-4 (Operator, V1 FREEZE PROOF).
const EXPECTED = {
  report_content_hash_v1: {
    prosrc_eolcanon: '5d28939d60421c3cbcbf3636f004fc7c',
    ident_args: 'p_todays_strength text, p_next_focus text, p_practice_suggestion text, '
      + 'p_session_takeaway text, p_ratings competency_rating[]',
    result: 'text',
    provolatile: 'i',      // IMMUTABLE
    proparallel: 's',      // PARALLEL SAFE
    prosecdef: 'false',    // SECURITY INVOKER (::text renders false, not psql's 'f')
    proisstrict: 'false',
    config: '{"search_path=\\"\\""}',
    owner: 'postgres',
    acl: '{postgres=X/postgres}',
    comment_md5: null,     // filled below
  },
  report_wording_hash_v1: {
    prosrc_eolcanon: '77da49fdc155084118ffeed9c662a438',
    ident_args: 'p_todays_strength text, p_next_focus text, p_practice_suggestion text, '
      + 'p_session_takeaway text',
    result: 'text',
    provolatile: 'i',
    proparallel: 's',
    prosecdef: 'false',
    proisstrict: 'false',
    config: '{"search_path=\\"\\""}',
    owner: 'postgres',
    acl: '{postgres=X/postgres}',
    comment_md5: null,
  },
}

// COMMENT digests, pinned separately because the prose is long.
// Measured from the live canonical database on 2026-08-09, not derived.
EXPECTED.report_content_hash_v1.comment_md5 = '79152aea83523f18f969af5596b84ba9'
EXPECTED.report_wording_hash_v1.comment_md5 = '11711f1be56b09396c52f8b0ab8001e1'

const QUERY = `
SELECT p.proname
  || '|' || md5(replace(replace(p.prosrc, chr(13)||chr(10), chr(10)), chr(13), chr(10)))
  || '|' || pg_get_function_identity_arguments(p.oid)
  || '|' || pg_get_function_result(p.oid)
  || '|' || p.provolatile::text || '|' || p.proparallel::text
  || '|' || p.prosecdef::text || '|' || p.proisstrict::text
  || '|' || coalesce(p.proconfig::text,'~')
  || '|' || pg_get_userbyid(p.proowner)
  || '|' || coalesce(p.proacl::text,'NULL')
  || '|' || md5(coalesce(obj_description(p.oid,'pg_proc'),''))
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname IN ('report_content_hash_v1','report_wording_hash_v1')
ORDER BY p.proname;`

const psql = (sql) => new Promise((resolve) => {
  const p = spawn('docker',
    ['exec', '-i', CONTAINER, 'psql', '--no-psqlrc', `--username=postgres`, `--dbname=${DB}`,
      '--quiet', '-t', '-A', '--set=ON_ERROR_STOP=1'],
    { stdio: ['pipe', 'pipe', 'pipe'] })
  let out = '', err = ''
  p.stdout.on('data', (d) => { out += d })
  p.stderr.on('data', (d) => { err += d })
  p.on('close', (code) => resolve({ code, out: out.trim(), err: err.trim() }))
  p.stdin.end(sql)
})

const FIELDS = ['prosrc_eolcanon', 'ident_args', 'result', 'provolatile', 'proparallel',
  'prosecdef', 'proisstrict', 'config', 'owner', 'acl', 'comment_md5']

let failures = 0
const fail = (m) => { failures += 1; console.error(`FAIL ${m}`) }

const main = async () => {
  console.log('=== V1 hash serializer freeze proof (G-05a items 1-2) ===\n')
  const r = await psql(QUERY)
  if (r.code !== 0) { console.error(`psql failed:\n${r.err}`); process.exitCode = 1; return }

  const rows = r.out.split('\n').filter(Boolean)
  const seen = new Set()

  for (const line of rows) {
    const parts = line.split('|')
    const name = parts[0]
    seen.add(name)
    const exp = EXPECTED[name]
    if (!exp) { fail(`unexpected function ${name}`); continue }
    const actual = Object.fromEntries(FIELDS.map((f, i) => [f, parts[i + 1]]))
    let bad = 0
    for (const f of FIELDS) {
      if (String(actual[f]) !== String(exp[f])) {
        fail(`${name}.${f}\n     expected: ${exp[f]}\n     actual:   ${actual[f]}`)
        bad += 1
      }
    }
    if (bad === 0) console.log(`PASS ${name} -- all ${FIELDS.length} frozen properties unchanged`)
  }

  for (const name of Object.keys(EXPECTED)) {
    if (!seen.has(name)) fail(`${name} DOES NOT EXIST -- V1 is ratified historical and must be present`)
  }

  console.log('')
  if (failures > 0) {
    console.error(`V1 freeze proof: ${failures} failure(s). A V1 property changed -- REVERT IT.`)
    console.error('G-05a items 1-2 freeze V1 as historical semantics. Do not rationalize a change as part of OD-4.')
    process.exitCode = 1
  } else {
    console.log('V1 freeze proof: PASSED -- body (EOL-canonicalized), signature, argument types/order,')
    console.log('return type, volatility, parallel safety, security posture, search_path, owner,')
    console.log('literal ACL and COMMENT are all unchanged for both V1 serializers.')
  }
}

main()
