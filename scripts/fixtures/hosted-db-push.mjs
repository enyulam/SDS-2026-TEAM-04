#!/usr/bin/env node
// =====================================================================
// HOSTED MIGRATION PUSH — a wrapper that keeps the connection string off
// the command line
// =====================================================================
//
// Run: npm run fixtures:hosted-push -- --dry-run
//      npm run fixtures:hosted-push
//
// Wraps `supabase db push --db-url <…>`. It exists for two reasons:
//
//   1. THE CONNECTION STRING NEVER APPEARS IN A SHELL COMMAND. It is read
//      from the environment and handed to the child as an argv element by
//      `spawn`, with no shell involved, so it cannot be echoed by a shell
//      trace, captured in shell history, or exposed in a process listing
//      built by a shell.
//   2. THE PINNED-REF GUARD applies here too. A migration push is the most
//      consequential thing that can be aimed at the wrong project, so it
//      gets the same refusal the loader and preflight get.
//
// Supabase requires `--db-url` to be PERCENT-ENCODED. The URL is normalised
// here rather than trusted, because an unencoded `@` or `#` in a password
// silently changes which host is contacted.
//
// EXIT: the child's exit code · 1 if refused before spawning.
// =====================================================================

import { spawn } from 'node:child_process'
import {
  TargetRefused,
  assertHostedDbUrl,
  requireVar,
  resolveHostedProjectRef,
} from './hosted-target-guard.mjs'

const VAR_DB = 'BEST_COACH_HOSTED_DB_URL'

let HOSTED_PROJECT_REF
let url
try {
  HOSTED_PROJECT_REF = resolveHostedProjectRef()
  url = assertHostedDbUrl(requireVar(VAR_DB), HOSTED_PROJECT_REF, VAR_DB).url
} catch (error) {
  if (!(error instanceof TargetRefused)) throw error
  process.stderr.write(`REFUSED: ${error.message}\n`)
  process.exit(1)
}

// Percent-encode the credential components, as the CLI requires. Re-encoding
// an already-encoded value would double-encode it, so decode first.
url.username = encodeURIComponent(decodeURIComponent(url.username))
url.password = encodeURIComponent(decodeURIComponent(url.password))

const passthrough = process.argv.slice(2)

// ⚠️ The CLI is invoked as `node <dist/supabase.js>`, NOT through `npx`.
// `npx` on Windows is a `.cmd`, which `spawn` can only start with
// `shell: true` — and a shell is exactly what must not see this argv, since
// one element is a connection string carrying the database password. Spawning
// the package's own Node entry point keeps `shell: false` viable on every
// platform, so the string is passed as an argv element and never parsed by a
// shell.
const require_ = (await import('node:module')).createRequire(import.meta.url)
let cliEntry
try {
  cliEntry = require_.resolve('supabase/dist/supabase.js')
} catch {
  process.stderr.write('REFUSED: the supabase CLI package could not be resolved.\n')
  process.exit(1)
}

const args = [cliEntry, 'db', 'push', '--db-url', url.toString(), ...passthrough]

process.stdout.write(
  `[ pushing to the expected project ${HOSTED_PROJECT_REF} on port ${url.port || '5432'} ` +
    `${passthrough.includes('--dry-run') ? '(DRY RUN — nothing will be applied)' : '(LIVE)'} ]\n`,
)

const child = spawn(process.execPath, args, {
  stdio: 'inherit',
  shell: false,
  windowsHide: true,
})
child.on('error', () => {
  process.stderr.write('the supabase CLI could not be started.\n')
  process.exit(1)
})
child.on('close', (code) => process.exit(code ?? 1))
