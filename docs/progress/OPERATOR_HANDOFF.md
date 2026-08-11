# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> **NOT A TRACKER · NOT AUTHORITY · DERIVED** (`CLAUDE.md` §15.8 / `FINAL_MVP_G06_GROUNDING_RULING.md` §H-8). Written at every stop and **OVERWRITTEN, never appended**. It **originates nothing** — **where this and `docs/progress/STATUS.md` disagree, `STATUS.md` wins and this file is stale.**
> Regenerated **2026-08-12**, after the facts below were written to `STATUS.md` and `BUILD_NOTES.md` and committed. Contains **no credential**.

---

## ⛔ WHICH WORKSPACE IS THIS

| | |
|---|---|
| **Workspace** | **DEVELOPMENT CLONE**, branch **`develop`**. **NOT the demonstration workspace** |
| **Local stack** | ✅ **`best-coach-dev` on 544xx** — api **54421** · db **54422** |
| ⛔ **FROZEN, OFF LIMITS** | The demonstration workspace, its stack on **543xx**, hosted **`zjukuffiuzkbiblmnuwl`**, **`best-coach-mvp.vercel.app`** |
| ⛔ **Git** | **No push. No merge. No `main`. `develop` only.** Nothing pushed |

---

## ✅ WHERE THIS STOPPED

**`P1-5` IS BUILT AND PROVEN — `D-5`'s READ half is now complete end to end.** Substrate (`P1-2`) → parent arm → signed-URL path → screen `33`'s player.

| | |
|---|---|
| **HEAD** | **`a3df6e0`** on `develop`, tree **clean** |
| **Gates** | ✅ **`prove:portal-5` exit 0** — 11 SQL legs + 22 runner checks · ✅ `prove:portal-2` **0** · ✅ `prove:portal-1` **0** · ✅ `prove:f-attendance-init-1` **0** · ✅ **`prove:hero-all` 17/17 by exit code** · `tsc` **0** · `eslint` **0 errors** · `build` **0** |
| **Database** | **24 migrations · 28 tables · 49 functions · 12 enums · 29 public policies · 1 storage policy**. ⛔ **`P1-5` moved NONE of these** — it **replaced** two functions and added nothing. Governed rows **byte-unmoved** |

⚠️ **`D-5` IS STILL HALF-BUILT, AND IT IS THE OTHER HALF THIS TIME.** The clip can now be **watched** through the product; it still **cannot be attached** through it, because `P1-2`'s **resumable upload transport is not built**. Every clip in play today was placed by a fixture or by hand. **The transport needs no new governance — only build time.**

---

## ⛔ THE ONE THING I MUST NOT LET A GREEN RESULT OBSCURE

**`A-004`'s both-direction Parent UAT is `NOT-RUN`. It is HUMAN and it is yours to perform.** ⚠️ **`prove:portal-5` exiting 0 says nothing about it.** The runner prints that in its own output, beside its own `PASS`, so a reader of the green result cannot mistake one for the other. ⛔ **No session may report it as run, under any circumstances.**

Alongside it: **`A-003`'s `unscanned` leg is `NOT APPLICABLE (C-3)`, never `PASS`** — the scan gate was removed, and a must-fail leg with nothing to test either fails forever or gets quietly marked green. And **rendered capture on screen `33`'s new region is `NOT-RUN`**: a green DOM-text proof is not a visual acceptance.

---

## ▶ THE THINGS WORTH YOUR ATTENTION

**The expired-URL leg is the one the database cannot prove.** A TTL lives in the **minted token**, and SQL never sees one. The runner mints a **1-second** URL, reads **`exp − iat = 1` out of the token itself**, waits past the window and gets **HTTP 400** — ⚠️ **with a control that fetches a LIVE URL for the SAME object and gets HTTP 200.** Without that control the leg is equally true of a path that never worked. The **public-object** fetch runs **before** the cleanup on purpose; run after, it would have been equally true of a key that was never there.

**`E9` was retired deliberately, in the migration that made it false.** It failed the build if a parent arm appeared, and **it did exactly its job for a day.** ▶ It is retired because **its premise was ruled away, not because it was inconvenient** — and by **redefining the two functions it guarded**, so the guard is *replaced*, never dropped around. A runner leg reads the **unstripped** migration to prove the retirement is **stated**: an assertion removed silently is a guard that disappears without anyone deciding it should.

**A `P1-2` leg's pin moved, and the leg was rewritten rather than deleted.** *"the evidence module carries no parent arm"* was load-bearing while `A-002` deferred it, and would now fail **for the right reason** — precisely when deleting a leg quietly loses a measurement. It now measures what still holds: the **RPC authorizes and audits before anything is signed**, and **no `download` option is passed to `createSignedUrl`**.

**My first probe upload was refused `415` by the bucket's own `allowed_mime_types`.** Measured as a leg rather than worked around — `C-16`'s 100 MiB is not the only per-bucket control.

---

## ⛔ YOUR LIST HAS NOW BEEN INCOMPLETE THREE TIMES

Four named sites, then two more, then **nine further live sites no list contained** — the execution plan ×2, the Phase A reconciliation, the portal decisions ×2, the `33` pack ×3, the `GC-4` register — **and a tenth inside `parent-canonical-report.tsx` itself**, which went on listing Watch Together as omitted **forty lines below the region that builds it**.

▶ **This is the measurement that settles the method, not a criticism of the lists.** A handed list is a **starting point and never a completeness claim**. ⚠️ **My own triage was incomplete too, for a dumber reason: I read the first 60 lines of my own sweep's output.** An instrument that reports more than you read has not been read.

---

## ▶ DECISIONS OWED

| # | Question | Blocks |
|---|---|---|
| **1** | **`P1-2`'s upload transport** — not a governance question, a build one. Say the word and it is the next unit | ⛔ **the ATTACH half of `D-5`** — today the clip can be watched but not uploaded through the product |
| **2** | **`A-004`'s both-direction Parent UAT** — yours to run, whenever you choose | ⛔ **`A-004` stays `NOT-RUN`** until you say otherwise |

✅ **`A-002` is CLOSED** as a blocker on `P1-5`, by your 2026-08-12 ruling. ✅ **`C-7` ruled**, ✅ **`R-4a` closed**.

---

## ⛔ Explicitly unchanged

- **`Q-27` does not move** — `P1-5` added **media**, and no rating reaches a parent · **`G-2` permanent** · **`A-014`** TA persona deferred · **the content-hash rule unamended**.
- **`C-9` holds** — management queue `29` and dashboard `11` render no rating.
- **Management may never remove evidence** — not a `D-5` choice: §6 already forbids a management write reaching evidence.
- ⛔ **No download control for any role, Parent included** — and ⛔ **no surface may claim technical impossibility**. Streamed video stays retrievable and `D-5` says so plainly.
- ⛔ **The frame's `Class Video Evidence` heading and `500MB` are NOT built** (`G-8`, `C-16`) — **`REGISTERED-OMISSION`, never ends.** `G-8` still refuses **class** footage; only §8.1 moved, and `C-1` moved it.
- ⛔ **`A-057`'s prohibition re-arms at THREE.** A fourth evidence action is a fresh stop-and-ask.
- ⛔ **The orphan sweeper is NOT scheduled** — automating it is hosted work (§12).

## ⚠️ Carried

- **The silent-save reproduction is still owed a walk** — steps in `BUILD_NOTES.md`.
- ⚠️ **Authority Lock §19.1's census reads `15 migrations · 36 functions`** against a live **24 · 49**. ✅ **You ruled *record, do not fix*.**
- **`RENDERED CAPTURE` `NOT-RUN`** on every authenticated surface · **`NOT APPLICABLE (G-1)`** on the three unframed ones.
- **Phase 8/11 gap stands** · **`test:integration` 47/3/3, exit 1** (suite staleness) · ⛔ **`09` refuses its canonical route** (`C2C-007`) · **`A-044` knowingly unmet for `28`**.

## ▶ Next

⛔ **NONE. STOPPED.**
