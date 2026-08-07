# Frontend Step Report Template

**Every future frontend reconstruction checkpoint ends with this report.** Twenty parts, in order, followed by exactly one closing phrase.

Governed by `FRONTEND_RECONSTRUCTION_PLAN.md` §8 and §11.

---

## Rules for using this template

1. **All twenty parts appear, always.** A part that does not apply reads `Not applicable — <reason>`, never omitted and never blank.
2. **Nothing is claimed that was not observed.** A command that was not run reads `Not run`, never `Pass`. "Looks right" is not a validation result.
3. **Use the real checkpoint ID** — `F3`, `F11`. Never the literal `<CHECKPOINT_ID>`.
4. **Write reconstruction checkpoints in full** — `FRONTEND RECONSTRUCTION F4` — in the report, the commit message and the workstream log. A bare `F1`/`F2` collides with the historical delivery rounds in `docs/workstreams/48H_FRONTEND_PROGRESS.md`.
5. **No credential-bearing output** is ever pasted into a report — not a key, token, password, connection string or `.env` value. Capture and leave unrendered; do not rely on redaction.
6. **Synthetic data only** in every screenshot and every quoted string.
7. **`COMPLETE — READY FOR REVIEW` does not mean accepted.** It means the agent has stopped and the work awaits operator review. Only the operator marks a screen accepted.
8. **A blocked checkpoint reported honestly is a good outcome.** Do not soften a blocker, and do not proceed on a guess to avoid reporting one.

---

## The report

### 1. Checkpoint and baseline

- **Checkpoint:** `FRONTEND RECONSTRUCTION F<n>` — <screen ID and name, or "shared foundation" / "dependency" / "integration">
- **Timestamp (Asia/Singapore):**
- **Branch expected / observed:** `feat/48h-frontend` / <observed>
- **Starting HEAD expected / observed:** <from tracker Table B> / <observed>
- **Working tree at start:** <clean / describe>
- **Baseline verdict:** <match — proceeded | drift — stopped and reported>

### 2. Screenshot identity and checksum

- **Reference file:**
- **Figma node:**
- **Native dimensions:**
- **Expected SHA-256** (tracker Table A):
- **Observed SHA-256:**
- **Verdict:** <match — proceeded | mismatch — stopped and reported>
- **Screenshot modified by this checkpoint:** **No** — post-run SHA-256 recomputed and identical.

### 3. Current-route audit

- **Route(s) inspected:**
- **Files serving them:**
- **Components rendered:**
- **DTOs and port methods consumed:**
- **Client-side state held, and where:**
- **Existing governed behaviour observed:**

### 4. Design differences found

Frozen reference versus the implementation as it stood at the start.

| Area | Frozen reference | Implementation at start | Action taken |
|---|---|---|---|
| Top-level shell | | | |
| Layout regions | | | |
| Typography | | | |
| Colour | | | |
| Spacing | | | |
| Cards and controls | | | |
| Action prominence | | | |
| Responsive behaviour | | | |

**Frame-versus-governance conflicts found:** <none, or: the frame implies X; ratified rule Y governs; **the rule won**; recorded in `screen.md` §7 and `CHANGE_LOG.md`>

### 5. Components preserved

<Path — what governed behaviour it carries — why it was kept.>

### 6. Components replaced

<Path — what replaced it — why the previous structure could not express the frozen frame — what governed behaviour was carried across intact.>

### 7. Components created

<Path — purpose — which frozen frame region it serves.>

### 8. DTO, port or fixture changes

- **Typed frontend DTO changes:**
- **Port method changes:**
- **Fixture projection changes:**
- **Status-union changes:** <exact before → after, e.g. `"trainer_approved" | "needs_edit"` → `"trainer_approved" | "needs_edit" | "draft_ready"`>
- **Confirmation:** no backend action, permission, lifecycle transition, database field or database mutation was invented; no status was added beyond the ratified eight.

### 9. Route treatment

- **Canonical route:**
- **Route as implemented by this checkpoint:**
- **Redirects or aliases created:** <path → target, and the ratified treatment authorizing it>
- **Working route deleted:** **No** — or the explicit authorization that permitted it.
- **Authorization relied on:** <inventory §7.x treatment / operator decision, with date and where recorded>
- **Open route decisions left unresolved:** <recorded, not resolved>

### 10. Backend or governance dependencies

Recorded, never invented.

| Dependency | What is missing | Where recorded | Blocks |
|---|---|---|---|

### 11. Visual-comparison result

- **Render viewport:** <native reference dimensions>
- **Comparison images:** <paths — **outside Git** unless otherwise authorized; synthetic data only>
- **Structure / colour / typography / spacing / controls:** <finding per axis>
- **Action prominence:**
- **Responsive behaviour:** <reference viewport + one narrower desktop breakpoint>
- **Old dark-theme residue:** <none, or present in the frozen reference and therefore retained>
- **Verdict:** <aligned to the frozen reference | differences remaining, listed>

### 12. Functional result

- Route works:
- Expected navigation works:
- Existing lifecycle behaviour preserved:
- Fixture or adapter state correct:
- No unsupported action invented:
- No dead primary control:

### 13. Privacy and authorization result

- Role-derived authorization — not a query parameter, not a JWT claim, not UI hiding:
- Non-disclosing denial:
- No prohibited fields exposed:
- **Parent submitted-only, linked children only:**
- **No per-dimension rating grid on any Parent surface, in any form or wording:**
- **No content hash returned to Parent or Management:**
- **Management substance immutability — server rejects writes outside the four parent-facing wording fields, including calls that bypass the UI:**
- **AI cannot publish, approve or submit:**
- **Trainer approves and never publishes; Management's Approve & Submit is the sole publication:**

### 14. TypeScript, lint, build and browser results

| Check | Command | Exit | Result |
|---|---|---|---|
| TypeScript | `node_modules/.bin/tsc.cmd --noEmit` | | |
| ESLint | `node_modules/.bin/eslint.cmd .` | | |
| Production build | `npm.cmd run build` | | |
| Contract assertions | `tests/frontend/fixture-contract.assertions.ts` | | |
| Lifecycle assertions | `tests/frontend/fixture-lifecycle.assertions.ts` | | |
| Trainer browser smoke | `node tests/frontend/trainer-browser-smoke.mjs` | | |
| Three-role browser smoke | `node tests/frontend/three-role-browser-smoke.mjs` | | |

- **Uncaught browser errors:** <must be zero>
- **`package.json` / `package-lock.json` changed:** **No**
- **Dependency added:** **No** — or the operator approval that permitted it.

### 15. Changed paths

<Every path this checkpoint created, modified or deleted. Repository paths and pack paths listed separately.>

- **Repository (frontend worktree):**
- **UI reference pack:**
- **Outside both (comparison images):**

### 16. Implementation commit

- **Message:**
- **SHA:**
- **Bounded to this checkpoint:** <yes — or what else it necessarily contained and why>
- **Merged to `main`:** **No** — no step merges without separate authorization.

### 17. Tracker update

- `FRONTEND_RECONSTRUCTION_TRACKER.md` Tables A, B, C and D updated for this checkpoint:
- **Status set to:** <`Ready for review` / `Blocked by …`> — **never `Accepted`; only the operator sets that.**

### 18. Workstream-log update

- `docs/workstreams/48H_FRONTEND_PROGRESS.md` appended:
- **Entry heading used:** <full name, e.g. `FRONTEND RECONSTRUCTION F4` — not a bare `F4`>
- **Starting and ending commits recorded:**

### 19. Unresolved blockers

<None, or each blocker with: what is blocked, exactly what decision or delivery would clear it, and where it is recorded. Do not propose a workaround that invents governance.>

### 20. Final branch state

- **Branch:** `feat/48h-frontend`
- **HEAD:**
- **Working tree:** <clean / describe>
- **`git status` across all four repositories:** <unchanged except the one bounded frontend commit>
- **Screenshots:** unchanged — SHA-256 recomputed and identical for all 12.
- **Stopped:** yes — the next checkpoint was **not** started.

---

## Closing phrase — exactly one

```
FRONTEND RECONSTRUCTION <CHECKPOINT_ID> COMPLETE — READY FOR REVIEW
```

```
FRONTEND RECONSTRUCTION <CHECKPOINT_ID> BLOCKED — OPERATOR DECISION REQUIRED
```

Substitute the real ID — for example `FRONTEND RECONSTRUCTION F3 COMPLETE — READY FOR REVIEW` or `FRONTEND RECONSTRUCTION F11 BLOCKED — OPERATOR DECISION REQUIRED`.

---

*Created at Frontend Reconstruction Planning Checkpoint F0, 2026-08-06 (Asia/Singapore), in the external UI reference pack, outside every Git repository.*
