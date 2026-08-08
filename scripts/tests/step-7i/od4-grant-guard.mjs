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
// HONEST LIMITS -- this is a static text scan, not a SQL parser. The list is
// kept COMPLETE deliberately: an unlisted limit reads as coverage, and that is
// how the missing-REVOKE hole survived two reviews.
//   * role chaining (`GRANT g TO authenticated` where `g` holds the EXECUTE)
//     is reported heuristically, not proven;
//   * it reads `supabase/migrations/*.sql` only; other `.sql` that reaches the
//     database is out of scope;
//   * MATCHING IS BY NAME, NOT BY SIGNATURE. A REVOKE naming a different
//     OVERLOAD of a guarded function discharges the missing-REVOKE
//     requirement, even though at apply time it would raise 42883 against a
//     signature that does not exist. Overload-precise checking needs an
//     argument-list parser; the runtime catalogue assertions cover the live
//     ACL, which is why this is recorded rather than approximated;
//   * `GRANT ... TO CURRENT_USER` / `SESSION_USER` / `CURRENT_ROLE` are NOT
//     detected. That is safe ONLY where the P-1 ownership guard holds, which
//     makes CURRENT_USER = postgres, i.e. the owner. It is NOT yet corpus-wide:
//     `20260803034500` and `20260806160000` carry no P-1 guard (execution plan
//     6.5 item 2), and their remediation is deferred to P2-T13. Until then,
//     treat those two files as outside this assurance;
//   * `ALTER FUNCTION ... OWNER TO <client role>` is not detected, and
//     `verify-fresh-apply` does not fingerprint `proowner` either;
//   * a SECURITY DEFINER wrapper that calls a guarded function and is itself
//     granted to a client role is not detected -- the wrapper's own GRANT
//     names no guarded function;
//   * it is a NECESSARY, not sufficient, control. The runtime catalogue
//     assertions in M13/M14 and in carriers 5-7 remain the authority on the
//     live ACL. This exists to reject dangerous TEXT before it is ever applied.
// =====================================================================

/** Roles that must never receive EXECUTE on a guarded function. */
export const CLIENT_ROLES = ['public', 'anon', 'authenticated', 'service_role', 'authenticator']

/** Owner-only functions that are not hash serializers, pinned by name. */
export const OWNER_ONLY_FUNCTIONS = ['report_store_draft', 'app_parent_reaches_student']

/**
 * Serializers expected in the corpus. DISCOVERY is automatic so V2 is guarded
 * the moment M13 creates it -- but an unpinned discovery scan would also pass
 * vacuously if the naming convention drifted and the regex stopped matching.
 *
 * ⚠️ SCOPE OF THIS PIN, CORRECTED 2026-08-09 by adversarial review. It
 * converts DISAPPEARANCE into a loud failure -- proven at
 * prove-od4-grant-guard.mjs sections 7 and 7b. It does NOT catch a RENAME:
 * renaming report_content_hash_v2 to report_content_hash_v7 still yields four
 * matches of SERIALIZER_DEF, so the count check passes and assertAnchors
 * requires only the two V1 names explicitly. The previous wording ("converts
 * that silence into a loud failure", unqualified) overstated this.
 *
 * The residual risk is bounded and is detection quality, not privilege: a
 * renamed serializer is still DISCOVERED, so it is still guarded -- grants to
 * it are still caught and the missing-REVOKE rule still applies to it. What is
 * lost is only the announcement that the convention drifted. Closing it means
 * naming all four in assertAnchors; that is P1-T05 (anchor-existence controls)
 * and must not be deferred past it.
 *
 * RE-PIN IN THE SAME COMMIT that legitimately adds a serializer: 2 before M13,
 * 4 from M13 onward.
 */
export const EXPECTED_SERIALIZERS = 4

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
 * A function that is created without an explicit REVOKE can ship
 * client-executable with NO GRANT statement anywhere in the corpus to find,
 * so the grant scan above is structurally blind to it. This is the check
 * that sees it. It covers EVERY guarded function, not only the serializers:
 * `report_store_draft` and `app_parent_reaches_student` are owner-only under
 * R-27 and A-030, and M13 DROPs and re-creates `report_store_draft`.
 *
 * ⚠️ CORRECTED 2026-08-09 by adversarial review, and stated precisely
 * because the previous justification was WRONG and is quoted elsewhere.
 * The old text claimed "a new postgres-owned function has proacl IS NULL,
 * which is the DEFAULT PUBLIC EXECUTE -- measured live: authenticated = t,
 * anon = t". Measured against `pg_default_acl`, that is false for the path
 * these migrations actually take:
 *
 *   postgres       | public | f | {postgres=X/postgres}
 *   supabase_admin | public | f | {postgres=X/...,anon=X/...,authenticated=X/...,service_role=X/...}
 *
 * `20260803034500_...:51-52` ran ALTER DEFAULT PRIVILEGES ... REVOKE ALL ON
 * FUNCTIONS, which installed the first row. So a function created BY
 * `postgres` in `public` -- which the P-1 ownership guard makes the only
 * permitted path -- is stamped owner-only at creation, not NULL and not
 * PUBLIC. The probe that produced "authenticated = t, anon = t" was
 * measuring creation as `supabase_admin`.
 *
 * The REVOKE requirement stands, for the reasons that are actually true:
 * the `supabase_admin` default ACL in `public` DOES carry anon,
 * authenticated and service_role, so any apply path that is not `postgres`
 * ships the function client-executable; a default ACL is remote state that
 * a later migration or platform change can alter; and an explicit,
 * signature-qualified REVOKE is the only form of the control that is
 * auditable from the migration text alone.
 *
 * @returns {string[]} violation messages
 */
export function findMissingRevokes(files, guarded) {
  const problems = []
  for (const fn of guarded) {
    // ORDER MATTERS, and so does WHICH definition form is used.
    //
    // A bare CREATE FUNCTION makes a new object, and a DROP FUNCTION
    // destroys the stored ACL -- both leave the function at whatever the
    // creation default is, so both REQUIRE a fresh REVOKE after them.
    // CREATE OR REPLACE does NOT reset the ACL, so it requires nothing.
    //
    // Tracking a single corpus-wide "was it ever revoked" boolean was a
    // real defect: a serializer DROPped and re-CREATEd in a LATER migration
    // with no REVOKE passed, because an EARLIER file's REVOKE had already
    // set the flag. DROP + CREATE is exactly the pattern the migration
    // protocol (6.5 item 3) expects for a signature change, so that is the
    // case most likely to occur -- and it was the one case not covered.
    // An ACL reset happens at TWO kinds of point:
    //   - the FIRST definition anywhere in the corpus, in any CREATE form,
    //     because that is when the object comes into existence and takes
    //     the creation-time default; and
    //   - every later DROP, because DROP destroys the stored ACL.
    // A later CREATE OR REPLACE is neither -- it preserves the ACL, which
    // is precisely why M14 can use it without re-emitting any grant.
    let firstDef = null    // { i, at, file } of the first definition, any form
    let lastDrop = null    // { i, at, file } of the last DROP FUNCTION
    let lastRevoke = null  // { i, at } of the last REVOKE ... FROM PUBLIC naming fn

    const defRe = new RegExp(
      String.raw`CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:"?public"?\s*\.\s*)?"?${fn}\b`, 'gi')
    const nameRe = new RegExp(String.raw`\b${fn}\b`, 'i')

    files.forEach((f, i) => {
      const { sql } = redact(f.sql)

      let m
      defRe.lastIndex = 0
      while ((m = defRe.exec(sql)) !== null) {
        if (firstDef === null) firstDef = { i, at: m.index, file: f.name }
      }

      let offset = 0
      for (const raw of sql.split(';')) {
        const at = offset
        offset += raw.length + 1
        const stmt = raw.trim()

        // DROP is matched on the STATEMENT, not on token adjacency.
        // `DROP FUNCTION a(...), b(...)` is valid and drops BOTH, and
        // `DROP ROUTINE` has been a synonym since PostgreSQL 11. Requiring
        // the guarded name to sit immediately after `DROP FUNCTION` missed
        // every target after the first and missed DROP ROUTINE entirely --
        // either one silently reopened the exempt-function hole this
        // function exists to close, through ordinary valid syntax.
        if (/^DROP\s+(?:FUNCTION|ROUTINE|PROCEDURE)\b/i.test(stmt)) {
          if (nameRe.test(stmt)) lastDrop = { i, at, file: f.name }
          continue
        }

        if (!/^REVOKE\b/i.test(stmt)) continue
        // `REVOKE GRANT OPTION FOR EXECUTE ...` withdraws only the ability to
        // re-grant; the EXECUTE privilege itself survives. It must not be
        // allowed to discharge the requirement for a real REVOKE.
        if (/^REVOKE\s+GRANT\s+OPTION\s+FOR\b/i.test(stmt)) continue
        if (!nameRe.test(stmt)) continue
        if (!/\bfrom\b[\s\S]*\bpublic\b/i.test(stmt)) continue
        lastRevoke = { i, at }
      }
    })

    if (!firstDef) continue

    // The governing reset is whichever comes LATER in the corpus.
    const after = (a, b) => a.i > b.i || (a.i === b.i && a.at > b.at)
    const lastReset = (lastDrop && after(lastDrop, firstDef)) ? lastDrop : firstDef

    const covered = lastRevoke !== null && after(lastRevoke, lastReset)

    if (!covered) {
      problems.push(
        `${fn} is created (or dropped and re-created) in ${lastReset.file}, but no REVOKE ... FROM `
        + 'PUBLIC names it AFTER that point. A DROP destroys the stored ACL and a new postgres-owned '
        + 'function takes the creation default, so it would ship without the governed owner-only ACL. '
        + 'Emit an explicit REVOKE ALL ... FROM PUBLIC, anon, authenticated, service_role, authenticator '
        + 'after every CREATE or DROP+CREATE of a guarded function.',
      )
    }
  }
  return problems
}
