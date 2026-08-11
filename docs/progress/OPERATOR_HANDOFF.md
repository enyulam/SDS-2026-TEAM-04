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

## ✅ PART 1 IS COMPLETE

`P1-1a` · `P1-1b` · screen `19` · `F-ATTENDANCE-INIT-1` · `P1-2` · `P1-5` · **`P1-2b`**. **`D-1` and `D-5` are both complete end to end.** For `D-5` that is: substrate → **resumable upload** → **governed attach** → list → **removal** → parent arm → signed-URL path → screen `33`'s player.

| | |
|---|---|
| **HEAD** | on `develop`, tree **clean** |
| **Gates** | ✅ **`prove:portal-2b` exit 0** (17 SQL + 26 runner) · ✅ **`prove:portal-5` exit 0** (11 SQL + 23 runner, incl. the composed leg) · ✅ `prove:portal-5-composed` **0** · ✅ `prove:portal-1` **0** · ✅ `prove:portal-2` **0** · ✅ `prove:f-attendance-init-1` **0** · ✅ **`prove:hero-all` 17/17 by exit code** · `tsc` **0** · `eslint` **0 errors** · `build` **0** |
| **Database** | **25 migrations · 28 tables · 49 functions · 12 enums · 29 public policies · 1 storage policy · registry 19**. ⛔ **Neither `P1-5` nor `P1-2b` moved any of these** — each **replaced** functions and added nothing |

---

## ⛔ THE ONE THING A GREEN RESULT MUST NOT OBSCURE

**`A-004`'s both-direction Parent UAT is `NOT-RUN`. It is HUMAN and it is yours to perform.** Both runners print that beside their own `PASS`, so the two cannot be read as one. ⛔ **No session may report it as run.**

Alongside it: **`A-003`'s `unscanned` leg is `NOT APPLICABLE (C-3)`, never `PASS`** · **rendered capture is `NOT-RUN`** on screen `08`'s rebuilt region and screen `33`'s clip region — a green DOM-text proof is not a visual acceptance.

---

## ⛔ WHAT I FOUND IN MY OWN P1-5 WORK, AND YOU SHOULD KNOW ABOUT

**`P1-5` shipped a broken parent path and its own proofs could not see it.** `listEvidenceCore` still refused `parent` in TypeScript, left over from when `A-002` was unruled. The parent arm existed in the database and was **reachable by nobody** — and since a failed clip read makes the whole report `unavailable`, **a linked parent would have been shown NO REPORT AT ALL**, not merely no clip.

▶ **P1-5 proved the RPC (11 legs) and scanned the surface's text (11 more). Nothing ran the TypeScript between them.**

Fixed, and there is now a leg that calls the **composed core** with real admin-minted sessions, spawned from inside `prove:portal-5` so it cannot be skipped. ⚠️ **I ran its control**: restoring the old guard turns it red, so it demonstrably catches the defect.

**THE STANDING RULE:** a green RPC proof plus a green text scan is **not** a proof of the path between them.

---

## ▶ THE THINGS WORTH YOUR ATTENTION

**The ADR-3 exception's boundary, stated where an implementer reads it.** The browser writes directly to storage — an **opaque object** · into a **private bucket** (no SELECT/UPDATE/DELETE policy for any role) · at a path it must **prove trainer authority over**, re-derived live from the path · **governed by nothing** until the server attaches it. ▶ **Until the attach it is bytes with a name.** A forged ticket buys nothing, and that is measured at the real endpoint (HTTP 403).

**Two defects the transport exposed in P1-2's own function.** A second clip **raised `23505`** instead of answering — an aborted transaction reads to a trainer exactly like a network fault. And the object lookup was **ambiguous**: the path shape admits `.mp4` and `.mov` under one evidence id, so ▶ **the attached clip would have been chosen by the query planner.** Ambiguity now fails closed, and a leg proves the `UNIQUE` constraint still refuses a direct owner-side INSERT — **the pre-check is a message; the schema is still the gate.**

**The ceiling is measured at the real TUS endpoint for the price of one small request** — the server checks the *declared* length, so proving 100 MiB does not cost 100 MB.

---

## ⚠️ THE SWEEPER IS BUILT AND UNSCHEDULED — A DECISION, NOT AN OVERSIGHT

`npm run sweep:evidence-orphans` reports by default and deletes only with `--delete`. ⛔ **No cron, queue, Edge Function or credentialed CI runner exists, and adding one is hosted work (§12).** A leg asserts **no surface and no module claims orphans are cleaned automatically**, and that the limitation is stated in the transport's own header.

---

## ▶ DECISIONS OWED

| # | Question | Blocks |
|---|---|---|
| **1** | **`A-004`'s both-direction Parent UAT** — yours to run, whenever you choose | ⛔ `A-004` stays `NOT-RUN` until you say otherwise |
| **2** | **Part 2** — `D-2`, `D-3` and `D-4` are implemented nowhere and each needs its own authorization | everything after your manual walk |

✅ **Closed:** `A-002` ruled forward · `C-7` ruled · `R-4a` closed · `P1-2`'s transport built.

---

## ⛔ Explicitly unchanged

- **`Q-27` does not move** — `D-5` is **media**, and no rating reaches a parent · **`G-2` permanent** · **`A-014`** TA persona deferred · **the content-hash rule unamended**.
- **`C-9` holds** — management queue `29` and dashboard `11` render no rating.
- ⛔ **Management may never attach and may never remove evidence** — `CLAUDE.md` §6, not a `D-5` choice. Both are measured.
- ⛔ **Removal is trainer-only and NOT limited to pre-submitted** — a wrong clip that reached a parent must stay pullable.
- ⛔ **No download control for any role, Parent included**, and ⛔ **no surface claims technical impossibility.**
- ⛔ **The frame's `Class Video Evidence` heading and `500MB` are NOT built** (`G-8`, `C-16`) — **`REGISTERED-OMISSION`, never ends.**
- ⛔ **`A-057`'s prohibition re-arms at THREE.** A fourth evidence action is a fresh stop-and-ask.
- ⛔ **No dependency was added.** TUS is an HTTP protocol; `fetch` was enough.

## ⚠️ Carried

- **The silent-save reproduction is still owed a walk** — steps in `BUILD_NOTES.md`.
- ⚠️ **Authority Lock §19.1's census reads `15 migrations · 36 functions`** against a live **25 · 49**. ✅ **You ruled *record, do not fix*.**
- **`RENDERED CAPTURE` `NOT-RUN`** on every authenticated surface · **`NOT APPLICABLE (G-1)`** on the three unframed ones.
- **Phase 8/11 gap stands** · **`test:integration` 47/3/3, exit 1** (suite staleness) · ⛔ **`09` refuses its canonical route** (`C2C-007`) · **`A-044` knowingly unmet for `28`**.

## ▶ Next

⛔ **NONE. STOPPED.** Part 1 is complete; you walk the chain manually before Part 2.
