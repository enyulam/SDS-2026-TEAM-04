// =====================================================================
// No-echo interactive password prompt — SHARED
// =====================================================================
//
// ⚠️ THIS IS A VERBATIM COPY of the reader and prompt loop inside the
// RATIFIED `load-local-fixtures.mjs` (Step 7F). It is a copy and not an
// import for one reason: that file declares NO exports and self-invokes on
// load, so importing it would RUN the local fixture loader.
//
// It was copied rather than reimplemented because this is security-critical
// input handling with non-obvious correctness: the CRLF-absorption logic
// exists so the line feed of a CR/LF pair cannot reach the NEXT prompt and
// submit it as empty, and the unconditional `pause()` in the finally block
// exists because `isPaused()` reports false for an untouched stdin, which
// previously left the event loop alive and forced an operator Ctrl+C. A
// fresh implementation would have to rediscover both.
//
// ⚠️ The duplication is a DELIBERATE, RECORDED trade: refactoring a ratified
// credential-handling script hours before a demonstration is the larger risk.
// If the two ever diverge, THIS file is the copy and `load-local-fixtures.mjs`
// is the original.
//
// THE ABSOLUTE RULE IT ENFORCES (`CLAUDE.md` §11): a password is read ONLY
// from an interactive, no-echo TTY. There is no environment-variable path, no
// file path, no argument path and no default. Nothing is echoed, no length is
// reported, and no value is ever written, logged or returned to any caller
// other than the one that immediately consumes it.
// =====================================================================

const KEY_CTRL_C = 0x03
const KEY_BACKSPACE = 0x08
const KEY_LINE_FEED = 0x0a
const KEY_CARRIAGE_RETURN = 0x0d
const KEY_DELETE = 0x7f
const KEY_FIRST_PRINTABLE = 0x20

export const LINE_PENDING = 'pending'
export const LINE_SUBMITTED = 'submitted'
export const LINE_EMPTY = 'empty'
export const LINE_CANCELLED = 'cancelled'

export class SecretPromptError extends Error {}

/**
 * Pure interpreter for one hidden input line. Owns no stream, performs no
 * I/O and prints nothing. Bytes accumulate raw and are decoded as UTF-8 only
 * when the finished line is taken, so multi-byte characters survive intact.
 */
export function createSecretLineReader() {
  const bytes = []
  let status = LINE_PENDING
  let terminator = null
  let absorbedLineFeed = false

  const feedByte = (byte) => {
    if (status !== LINE_PENDING) {
      if (byte === KEY_LINE_FEED && terminator === KEY_CARRIAGE_RETURN) absorbedLineFeed = true
      return
    }
    if (byte === KEY_CTRL_C) {
      bytes.length = 0
      terminator = byte
      status = LINE_CANCELLED
      return
    }
    if (byte === KEY_CARRIAGE_RETURN || byte === KEY_LINE_FEED) {
      terminator = byte
      status = bytes.length === 0 ? LINE_EMPTY : LINE_SUBMITTED
      return
    }
    if (byte === KEY_BACKSPACE || byte === KEY_DELETE) {
      while (bytes.length > 0 && (bytes[bytes.length - 1] & 0xc0) === 0x80) bytes.pop()
      bytes.pop()
      return
    }
    if (byte < KEY_FIRST_PRINTABLE) return
    bytes.push(byte)
  }

  return {
    feed(chunk) {
      if (typeof chunk === 'string') {
        for (let i = 0; i < chunk.length; i += 1) feedByte(chunk.charCodeAt(i) & 0xff)
      } else {
        for (let i = 0; i < chunk.length; i += 1) feedByte(chunk[i])
      }
      return status
    },
    get status() {
      return status
    },
    get terminator() {
      return terminator
    },
    get absorbedLineFeed() {
      return absorbedLineFeed
    },
    cancel() {
      if (status === LINE_PENDING) {
        bytes.length = 0
        status = LINE_CANCELLED
      }
      return status
    },
    take() {
      const secret = Buffer.from(bytes).toString('utf8')
      bytes.length = 0
      return secret
    },
    clear() {
      bytes.length = 0
    },
  }
}

/**
 * Prompt once per entry in `prompts` ([key, label]), in the given order.
 * No echo, no confirmation, no length feedback, no defaults, no alternative
 * source. One raw-mode session and one `data` listener serve every prompt,
 * which is what guarantees a stray line feed cannot submit the next one.
 */
export async function promptForSecrets(prompts) {
  const input = process.stdin

  if (!input.isTTY || typeof input.setRawMode !== 'function') {
    throw new SecretPromptError(
      'An interactive terminal is required to enter fixture passwords. ' +
        'There is no environment, file or argument path by design.',
    )
  }

  const wasRaw = input.isRaw === true
  let reader = null
  let settle = null
  let skipLineFeed = false
  let cancelledBetweenPrompts = false

  const complete = (status) => {
    if (settle === null) return
    const deliver = settle
    settle = null
    deliver(status)
  }

  const onData = (chunk) => {
    let bytes = typeof chunk === 'string' ? Buffer.from(chunk, 'latin1') : chunk
    if (skipLineFeed) {
      skipLineFeed = false
      if (bytes.length > 0 && bytes[0] === KEY_LINE_FEED) bytes = bytes.slice(1)
    }
    if (bytes.length === 0) return
    if (reader === null || settle === null) return
    if (reader.feed(bytes) !== LINE_PENDING) {
      skipLineFeed = reader.terminator === KEY_CARRIAGE_RETURN && !reader.absorbedLineFeed
      complete(reader.status)
    }
  }

  const onSigint = () => {
    if (reader !== null && settle !== null) {
      complete(reader.cancel())
      return
    }
    cancelledBetweenPrompts = true
  }

  const readLine = (promptText) =>
    new Promise((resolveLine) => {
      reader = createSecretLineReader()
      settle = resolveLine
      process.stdout.write(promptText)
      input.resume()
    })

  const cancelled = () => new SecretPromptError('Cancelled at the password prompt. Nothing was created.')

  const secrets = new Map()

  input.setRawMode(true)
  input.on('data', onData)
  process.on('SIGINT', onSigint)

  try {
    for (const [key, label] of prompts) {
      if (cancelledBetweenPrompts) throw cancelled()
      // The prompt names the ROLE only. No value is ever echoed.
      const status = await readLine(`  ${label} fixture password (input hidden): `)
      process.stdout.write('\n')
      if (status === LINE_CANCELLED) throw cancelled()
      if (status === LINE_EMPTY) {
        throw new SecretPromptError('An empty password was entered. Aborting rather than selecting another path.')
      }
      secrets.set(key, reader.take())
    }
    if (cancelledBetweenPrompts) throw cancelled()
    return secrets
  } catch (error) {
    secrets.clear()
    throw error
  } finally {
    if (reader !== null) reader.clear()
    reader = null
    settle = null
    input.removeListener('data', onData)
    process.removeListener('SIGINT', onSigint)
    try {
      input.setRawMode(wasRaw)
    } catch {
      // Restoring the terminal must never mask the original outcome.
    }
    // ALWAYS pause — `isPaused()` reports false for an untouched stdin, so a
    // "restore what we found" conditional never fires and the resume() above
    // would keep the event loop alive after the run finished.
    input.pause()
  }
}
