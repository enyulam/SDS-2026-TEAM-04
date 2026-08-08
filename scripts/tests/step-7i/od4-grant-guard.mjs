// =====================================================================
// B.E.S.T Coach -- OD-4 owner-only function GRANT guard (authoring-time)
// =====================================================================
// PURE MODULE. No side effects, no I/O, no process exit. It exists so that
// BOTH the static scan and its firing proof exercise THE SAME code: a firing
// proof that re-implemented the predicate would prove something about the
// proof, not about the guard.
//
// ---------------------------------------------------------------------
// WHY THIS EXISTS (operator ruling PD-2, 2026-08-09)
// ---------------------------------------------------------------------
// `FINAL_MVP_EXECUTION_PLAN.md` §6.5 item 4 claimed
// `scripts/tests/correction-tracking/ct-static.mjs:214` was "the ONLY
// authoring-time static scan that would catch a stray GRANT ... TO
// authenticated in a new migration file". FALSE: that file pins
// MIG_NAME = '20260806103000_...' and reads only that one already-applied
// migration, so it could never have covered M13.
//
// ARCHITECTURAL HOME. Step 7I's static scan, because the serializers it
// protects are Step 7I objects and `static-scan.mjs` already reads the whole
// migration directory. Deliberately NOT bolted onto ct-static.mjs: making a
// correction-tracking test responsible for global migration security couples
// unrelated concerns and would re-pin the guard to one historical file.
//
// ---------------------------------------------------------------------
// HARDENED 2026-08-09 after adversarial review found NINE bypasses
// ---------------------------------------------------------------------
// The first version was a keyword matcher: it required a statement to start
// with GRANT *and* literally contain a guarded function name. Confirmed to
// pass green on all of these, every one of which grants client EXECUTE:
//
//   B1  GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
//   B2  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS
//         TO authenticated;              <- the MIRROR IMAGE of the corpus's
//         own hardening statement at 20260803034500_...:52-53, i.e. the one
//         statement that establishes A-030 deny-by-default, reversed.
//   B3  DO $do$ BEGIN EXECUTE 'GRANT ... TO authenticated'; END $do$;
//   B5  COMMENT ON FUNCTION f IS 'V2 -- envelope'; GRANT ... TO authenticated;
//         <- `--` inside a STRING LITERAL is data, not a comment; the naive
//            comment stripper deleted the rest of the physical line, taking
//            the GRANT with it. 68 lines in the current corpus already carry
//            `--` inside quoted COMMENT ON prose, so this is house style.
//   B8  a helper function that EXECUTEs the grant, then SELECT helper();
//
// The rewrite below therefore does three things the first version did not:
//   1. REDACTS properly -- block comments, string-aware line comments, string
//      literals and dollar-quoted bodies are removed BEFORE splitting on `;`,
//      so a `;` inside a body or literal can no longer manufacture or destroy
//      a statement boundary.
//   2. Detects BLANKET forms that never name a function at all (B1, B2).
//   3. Scans the REDACTED-OUT text separately for GRANT statements. A GRANT
//      inside a string literal in a migration is dynamic SQL by definition,
//      which is exactly how B3/B3a/B8 hide.
//
// It also adds a MISSING-REVOKE check, which is the hazard the grant scan
// cannot see at all: a new postgres-owned function's default ACL is already
// PUBLIC EXECUTE (`proacl IS NULL`), so a serializer created WITHOUT an
// explicit REVOKE is client-executable while no GRANT statement exists to
// find. That is the exact defect adversarial review caught in the P1-T02
// design, and a grant-only guard would have shipped it green.
//
// HONEST LIMITS -- this is a static text scan, not a SQL parser:
//   * role chaining (`GRANT g TO authenticated` where `g` holds the EXECUTE)
//     is reported heuristically, not proven;
//   * it reads `supabase/migrations/*.sql` only; other `.sql` that reaches the
//     database is out of scope;
//   * it is a NECESSARY, not sufficient, control. The runtime catalogue
//     assertions in M13 and in carriers 5-7 remain the authority on the live
//     ACL. This exists to reject dangerous TEXT before it is ever applied.
// =====================================================================

/** Roles that must never receive EXECUTE on a guarded function. */
export const CLIENT_ROLES = ['public', 'anon', 'authenticated', 'service_role', 'authenticator']

/** Owner-only functions that are not hash serializers, pinned by name. */
export const OWNER_ONLY_FUNCTIONS = ['report_store_draft', 'app_parent_reaches_student']

/**
 * Serializers expected in the corpus. DISCOVERY is automatic so V2 is guarded
 * the moment M13 creates it -- but an unpinned discovery scan would also pass
 * vacuously if the naming convention drifted and the regex stopped matching.
 * This pin converts that silence into a loud failure.
 *
 * RE-PIN IN THE SAME COMMIT that legitimately adds a serializer: 2 today,
 * 4 once M13 lands.
 */
export const EXPECTED_SERIALIZERS = 2

/** Matches a serializer definition, tolerating quotes and loose whitespace. */
const SERIALIZER_DEF = new RegExp(
  String.raw`CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+` +
  String.raw`(?:"?public"?\s*\.\s*)?"?(report_(?:content|wording)_hash_v\d+)"?\s*\(`,
  'gi',
)

const BLANKET_OBJECT = /\bON\s+ALL\s+(?:FUNCTIONS|ROUTINES|PROCEDURES)\s+IN\s+SCHEMA\b/i
const DEFAULT_PRIV = /\bALTER\s+DEFAULT\s+PRIVILEGES\b[\s\S]*?\bGRANT\b[\s\S]*?\bON\s+(?:FUNCTIONS|ROUTINES)\b/i

/**
 * Remove everything a `;`-splitter must not see inside.
 *
 * Order matters: block comments first, then dollar-quoted bodies (which may
 * legally contain quotes and `--`), then string literals, and only then line
 * comments -- so a `--` inside a string is never treated as a comment.
 *
 * @returns {{sql: string, redacted: string[]}} sql with each removed region
 *   replaced by a single space, plus the removed text for the dynamic-SQL pass
 */
export function redact(input) {
  const redacted = []
  let out = ''
  let i = 0
  const n = input.length

  // A SINGLE-PASS SCANNER, not a sequence of regex replaces.
  //
  // Sequenced regexes cannot do this correctly, and the attempt was itself a
  // bug: stripping string literals with /'(?:[^']|'')*'/ after the dollar
  // pass consumed 91% of 20260805090500_...sql, because `--` comment prose in
  // this corpus is full of apostrophes ("Today's Strength", "doesn't"), so an
  // unpaired quote inside a comment matched forward to some distant quote and
  // swallowed real statements -- including the CREATE it was meant to find.
  // Ordering the passes the other way reintroduces B5 (`--` inside a string
  // literal). Only a scanner that tracks which context it is in can be right.
  while (i < n) {
    const c = input[i]
    const two = input.slice(i, i + 2)

    if (two === '--') {                                   // line comment
      const end = input.indexOf('\n', i)
      const stop = end === -1 ? n : end
      redacted.push(input.slice(i, stop))
      out += ' '
      i = stop
      continue
    }

    if (two === '/*') {                                   // block comment (PG nests)
      let depth = 1
      let j = i + 2
      while (j < n && depth > 0) {
        if (input.slice(j, j + 2) === '/*') { depth += 1; j += 2; continue }
        if (input.slice(j, j + 2) === '*/') { depth -= 1; j += 2; continue }
        j += 1
      }
      redacted.push(input.slice(i, j))
      out += ' '
      i = j
      continue
    }

    if (c === '$') {                                      // dollar-quoted body
      const m = /^\$([A-Za-z_][A-Za-z_0-9]*)?\$/.exec(input.slice(i))
      if (m) {
        const tag = m[0]
        const close = input.indexOf(tag, i + tag.length)
        const j = close === -1 ? n : close + tag.length
        redacted.push(input.slice(i, j))
        out += ' '
        i = j
        continue
      }
    }

    if (c === "'") {                                      // string literal, '' escape
      let j = i + 1
      while (j < n) {
        if (input[j] === "'") {
          if (input[j + 1] === "'") { j += 2; continue }
          j += 1
          break
        }
        j += 1
      }
      redacted.push(input.slice(i, j))
      out += ' '
      i = j
      continue
    }

    if (c === '"') {                                      // quoted identifier -- KEPT,
      let j = i + 1                                       // because the name inside it
      while (j < n) {                                     // is exactly what we match on
        if (input[j] === '"') {
          if (input[j + 1] === '"') { j += 2; continue }
          j += 1
          break
        }
        j += 1
      }
      out += input.slice(i, j)
      i = j
      continue
    }

    out += c
    i += 1
  }

  return { sql: out, redacted }
}

/** Backwards-compatible helper; prefer redact(). */
export const stripComments = (sql) => redact(sql).sql

/** Discover every hash serializer CREATEd anywhere in the corpus. */
export function discoverSerializers(files) {
  const found = new Set()
  for (const f of files) {
    const { sql } = redact(f.sql)
    for (const m of sql.matchAll(SERIALIZER_DEF)) found.add(m[1].toLowerCase())
  }
  return [...found].sort()
}

/** Every function this guard protects, for a given corpus. */
export function guardedFunctions(files) {
  return [...new Set([...discoverSerializers(files), ...OWNER_ONLY_FUNCTIONS])].sort()
}

/**
 * ANTI-VACUITY. A text scan that finds nothing is indistinguishable from one
 * that looks for nothing, so the guard must fail if its anchors vanish.
 */
export function assertAnchors(serializers, expectedCount) {
  const problems = []
  if (serializers.length === 0) {
    problems.push(
      'no report_*_hash_v* serializer definition was found in ANY migration -- the guard has no '
      + 'anchor and would pass vacuously; the regex or the naming convention has drifted',
    )
    return problems
  }
  for (const required of ['report_content_hash_v1', 'report_wording_hash_v1']) {
    if (!serializers.includes(required)) {
      problems.push(`${required} was not found in any migration; it is ratified historical and must exist`)
    }
  }
  if (serializers.length !== expectedCount) {
    problems.push(
      `${serializers.length} hash serializer(s) found (${serializers.join(', ')}), expected ${expectedCount} `
      + '-- if a serializer was legitimately added, re-pin EXPECTED_SERIALIZERS in the same commit',
    )
  }
  return problems
}

const mentionsClientRole = (lower) =>
  CLIENT_ROLES.filter((r) => new RegExp(String.raw`\bto\b[\s\S]*?"?\b${r}\b"?`, 'i').test(lower))

/**
 * Every way a migration's TEXT can hand a guarded function to a client role.
 *
 * @returns {Array<{file,fn,role,kind,statement}>}
 */
export function findForbiddenGrants(files, guarded) {
  const violations = []
  const add = (file, fn, role, kind, stmt) =>
    violations.push({ file, fn, role, kind, statement: stmt.replace(/\s+/g, ' ').slice(0, 180) })

  for (const f of files) {
    const { sql, redacted } = redact(f.sql)

    for (const raw of sql.split(';')) {
      const stmt = raw.trim()
      if (!stmt) continue
      const lower = stmt.toLowerCase()

      // (a) ALTER DEFAULT PRIVILEGES ... GRANT ... ON FUNCTIONS -- B2.
      if (DEFAULT_PRIV.test(stmt)) {
        for (const role of mentionsClientRole(lower)) {
          add(f.name, '<ALL FUTURE FUNCTIONS>', role, 'default-privileges', stmt)
        }
        continue
      }

      if (!/^GRANT\b/i.test(stmt)) continue

      // (b) Blanket object grant that never names a function -- B1.
      if (BLANKET_OBJECT.test(stmt)) {
        for (const role of mentionsClientRole(lower)) {
          add(f.name, '<ALL FUNCTIONS IN SCHEMA>', role, 'blanket', stmt)
        }
        continue
      }

      // (c) Named guarded function.
      for (const fn of guarded) {
        if (!new RegExp(String.raw`\b${fn}\b`).test(lower)) continue
        for (const role of mentionsClientRole(lower)) add(f.name, fn, role, 'named', stmt)
      }

      // (d) Role-membership grant: GRANT <role> TO <client role>, no ON clause.
      //     Heuristic -- reported so a human decides, because proving the
      //     granted role does not hold EXECUTE needs the catalogue.
      if (!/\bON\b/i.test(stmt)) {
        for (const role of mentionsClientRole(lower)) {
          add(f.name, '<ROLE MEMBERSHIP>', role, 'role-chain', stmt)
        }
      }
    }

    // (e) Dynamic SQL. A GRANT inside a string literal or dollar-quoted body
    //     in a migration is dynamic execution -- B3, B3a, B8.
    for (const chunk of redacted) {
      if (!/\bGRANT\b/i.test(chunk)) continue
      const lower = chunk.toLowerCase()
      if (/^\s*(?:--|\/\*)/.test(chunk)) continue // a commented-out GRANT is inert
      const named = guarded.filter((fn) => new RegExp(String.raw`\b${fn}\b`).test(lower))
      const blanket = BLANKET_OBJECT.test(chunk) || DEFAULT_PRIV.test(chunk)
      if (named.length === 0 && !blanket) continue
      const roles = mentionsClientRole(lower)
      const targets = named.length ? named : ['<BLANKET>']
      for (const fn of targets) {
        for (const role of roles.length ? roles : ['<dynamic>']) {
          add(f.name, fn, role, 'dynamic-sql', chunk)
        }
      }
    }
  }
  return violations
}

/**
 * MISSING-REVOKE CHECK.
 *
 * A new postgres-owned function has `proacl IS NULL`, which is the DEFAULT
 * PUBLIC EXECUTE -- measured live: authenticated = t, anon = t. So a
 * serializer created without an explicit REVOKE is client-executable with no
 * GRANT statement anywhere to find. The grant scan is structurally blind to
 * it; this is the check that sees it.
 *
 * @returns {string[]} violation messages
 */
export function findMissingRevokes(files, serializers) {
  const problems = []
  for (const fn of serializers) {
    let created = null
    let revoked = false
    for (const f of files) {
      const { sql } = redact(f.sql)
      if (new RegExp(String.raw`CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:"?public"?\s*\.\s*)?"?${fn}\b`, 'i').test(sql)) {
        created = created ?? f.name
      }
      for (const raw of sql.split(';')) {
        const stmt = raw.trim()
        if (!/^REVOKE\b/i.test(stmt)) continue
        if (!new RegExp(String.raw`\b${fn}\b`, 'i').test(stmt)) continue
        if (/\bfrom\b[\s\S]*\bpublic\b/i.test(stmt)) revoked = true
      }
    }
    if (created && !revoked) {
      problems.push(
        `${fn} is created in ${created} but no REVOKE ... FROM PUBLIC names it. A new postgres-owned `
        + 'function defaults to PUBLIC EXECUTE (proacl IS NULL), so it would ship client-executable. '
        + 'Emit an explicit REVOKE ALL ... FROM PUBLIC, anon, authenticated, service_role, authenticator.',
      )
    }
  }
  return problems
}
