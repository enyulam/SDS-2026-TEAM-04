# F17 — operator instructions for the physical-test runner

This folder is **inside the Git repository** (moved in 2026-08-08 — repository-boundary
normalization, `CLAUDE.md` §9.1) and holds the redacted evidence the runner produces.

⚠️ **It is therefore now committable.** ~~Nothing in this folder is committed.~~ **Do not commit
run output from here** until the two hard preconditions in `FINAL_MVP_SUBMISSION_READINESS_PLAN.md`
§8.3 item 3 are satisfied — a fresh, dated **secret / redaction / third-party-content scan**, and
R1 resolution. The runner writes here by default; committing is a separate, gated decision.

---

## The exact command

Run it **directly in a terminal you control** — not through a task runner, not
through an IDE "run" button, not over SSH into a shared box, and not in CI.

```
cd "C:\Users\enyul\Vibe Studio\B.E.S.T-Coach-Workspace\SDS Project Final (BEST Coach)"
npm run physical-test:f17
```

Two other forms, both safe to run at any time:

```
npm run physical-test:f17 -- --help              what it does, in full
npm run physical-test:f17 -- --preflight-only    read-only checks, prompts for nothing
```

**Prerequisites you must satisfy yourself.** The runner never starts or stops
Supabase. Before running it:

1. the local Supabase stack is up (`supabase_db_best-coach-mvp` is running);
2. the synthetic fixture is loaded (`npm run fixtures:local`);
3. ports **3417** and **9417** are free — the runner owns them and refuses to
   share either;
4. headless Chrome is installed at the standard location, or `CHROME_PATH`
   points at it.

---

## What it will prompt for, and in what order

Exactly three prompts, in this order, each on its own line, each with **echo
disabled** — nothing appears as you type, not even asterisks:

```
  Trainer fixture password (input hidden):
  Management fixture password (input hidden):
  Parent fixture password (input hidden):
```

- **Backspace works.** So does Delete. Multi-byte characters are removed whole.
- **Enter** submits the line. **Ctrl+C** aborts (see below).
- There is no confirmation prompt, no length feedback and no re-entry.
- An **empty** line aborts the run. It is never treated as a default.

These are the three fixture passwords you chose when you loaded the fixture with
`npm run fixtures:local`. If you do not have them, **reload the fixture**
(`npm run fixtures:local -- --reload`) and choose new ones. There is no recovery
path, no reminder, and no stored copy anywhere in this project — by design.

The prompts appear **only after** every read-only check has passed. If any
identity does not match its ratified UUID and role, the run stops *before* the
first prompt.

---

## What it will do

In order:

1. **Refuse anything but the local stack.** It verifies the project id
   `best-coach-mvp`, the API port 54321, the DB port 54322, a loopback API host
   and the running `supabase_db_best-coach-mvp` container, and it refuses if a
   Supabase project reference exists.
2. **Read-only identity preflight**, through the container's own `psql` over
   Docker's local socket (no database password is involved anywhere): exactly
   three `auth.users` rows; the three ratified UUIDs each bound to one active
   account and one *active* membership carrying the matching role; all three in
   one centre; `report_versions` and `report_version_ratings` at their expected
   starting values; and the canonical fixture checksum recorded.
3. **Typecheck, lint and build** (gate G-20). Their output is captured and
   discarded — only exit codes are used.
4. **Start its own production server** on port 3417, bound to 127.0.0.1, with
   the fixture-mode variable explicitly removed from the child environment.
5. **Start its own headless Chrome** on CDP port 9417.
6. **Prompt for the three passwords** and sign each identity in against local
   Supabase Auth.
7. **Drive the authenticated gates** in a real browser: own-portal access,
   cross-portal denial, `/login` bounce, the `?role=` non-escalation, the real
   adapter identity, the parent's non-disclosing denial pair, and the browser
   console.
8. **Run the Step 7I concurrency proofs** on a database it creates, dirties and
   destroys. The canonical database is never written to.
9. **Stop the server and the browser**, verify both ports are released and
   neither process survives, re-read the canonical checksum, and write
   `gate-ledger.md` into this folder.

**Expect NOT-RUN verdicts, and read them.** The lifecycle-substance gates
(G-3 … G-10, G-12, G-13, G-15, and half of G-16) require a *governed write*.
Every governed write commits an append-only audit event that is permanently
uncleanable, and it changes the rows the canonical checksum covers — so
performing one here would break G-18 on the very database G-18 is about. Those
gates are therefore reported **NOT-RUN with that reason**, never guessed and
never defaulted to PASS. They belong on a disposable database.

The run exits non-zero if any gate is **FAIL**. NOT-RUN does not fail the run;
it is a statement that the gate is still owed.

---

## What it will never do

- Read a password from an **environment variable**, a **command-line argument**,
  a **file**, a **default**, or a **generated value**. There is no such code
  path in the file — not disabled, absent.
- Print, log, serialize, write, transmit or interpolate a password anywhere, on
  any path, including every failure path. A failed sign-in reports only the role.
- Render the stdout or stderr of any child process. Those streams are captured
  and discarded; only exit codes survive.
- Filter or redact a credential-bearing stream. The rule here is stronger: such
  a stream is never surfaced at all.
- Screenshot a login form — filled or empty.
- Write a password, token, cookie, header, magic link or request body into this
  folder, or into any file.
- Read `.env.local`, use dotenv, link a project, or contact any non-local
  target.
- Perform a governed write against the canonical fixture database.
- Take port 3000, or any port it did not first verify was free.

---

## How to abort

**Press Ctrl+C.** At any point, including in the middle of a password prompt.

- At a prompt, the partially typed line is discarded, the terminal's echo mode
  is restored, and the run stops.
- After the server and browser have started, both are killed, both ports are
  checked released, and the gate ledger is written with whatever was decided.
- Nothing captured from a child process is printed on the abort path.
- The exit code is 130.

If the terminal is ever left in a strange state after a hard kill, `stty sane`
(POSIX) or simply closing and reopening the terminal restores it.

**If the run dies without cleaning up** (a hard `kill -9`, a crash of the shell),
check for a stray server or browser yourself:

```
netstat -ano | findstr :3417
netstat -ano | findstr :9417
```

and end those PIDs. The runner's own hygiene gate (`H-1`) reports exactly this
check on every normal exit path.

---

## What lands in this folder

- `gate-ledger.md` — one line per gate: id, verdict (PASS / FAIL / NOT-RUN) and
  a one-line reason. Plus the origin, the ports, and the canonical fixture
  checksum at the start and at the end of the run.
- `portal-trainer.png`, `portal-management.png`, `portal-parent.png` —
  screenshots of the three authenticated portal home surfaces. No login form is
  ever captured.

Everything here is safe to attach to a checkpoint record.
