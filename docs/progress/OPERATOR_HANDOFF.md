# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> ⛔ **NOT A TRACKER · NOT AUTHORITY · DERIVED.** Every line is reproduced or mechanically
> reduced from `STATUS.md`, `BUILD_NOTES.md`, `PORTAL_COMPLETION_PLAN.md`, `git`, or a live
> measurement. **Where this and `STATUS.md` disagree, `STATUS.md` WINS and this file is STALE.**
> Written at every stop and **OVERWRITTEN, never appended** (`FINAL_MVP_G06_GROUNDING_RULING.md` §H-8).

**Regenerated:** 2026-08-13, at the `P2-6` `C-7` gate.
⏸ **Two things need you: a Docker decision, and three `P2-6` rulings.**

---

## ⚠️ TWO THINGS I NEED

### 1. Docker Desktop is down — and I did not restart it

`:3000` was clear, so **`prove:stage2-routes` ran: PASS, 17 checks, exit 0.**

`prove:stage3-authenticated` then reported **`S3-00` FAIL — the loopback Supabase stack is
unreachable.** The docker daemon `npipe` is unreachable and no Docker process is running.
**`S3-M6`, screen `25`'s first rendered proof, is `NOT-RUN`.**

⛔ **I did not start it.** Starting Docker Desktop would also restart the **frozen demonstration
stack's containers on 543xx**, and your standing constraint is that nothing may touch it. That is
your call, not mine.

▶ **The guard did its job**: it reported `FAIL`, not a green nothing. Fifth time that rule has paid
for itself.

### 2. Three `P2-6` decisions — see §13.4 below

---

## ⛔ FRESHNESS REPORT (`CLAUDE.md` §15.8.1) — re-verified, not carried

| Carried claim | Method | Result |
|---|---|---|
| *"`:3000` is held"* | re-run | ⛔ **LAPSED — you cleared it.** `stage2` ran and PASSED |
| *"`S3-M6` blocked on the `:3000` lock"* | re-run | ⛔ **LAPSED, AND THE CAUSE CHANGED** — now blocked on **Docker being down**, a different blocker with a different owner |
| *"the icon change may supersede your acceptance"* | your ruling | ⛔ **LAPSED — RULED NOT SUPERSEDING.** Acceptance of `12`/`13`/`26`/`27` stands at `3431981` |
| *"two `P2-5` judgement calls open"* | your ruling | ⛔ **LAPSED — BOTH ACCEPTED** |
| `R-7` — `P2-6`'s `C-7` gate | read at HEAD | ⚠️ **HALF-DISCHARGED.** The **statement** is made (plan §13); the **authorization** is yours |
| `B-G06-DET-1` open | no verdict produced | ✅ **STILL TRUE** |
| §10 Phase 1 exit condition **(c)** unproven | ⚠️ not re-measured | ✅ **CARRIED, and stated as carried** |
| `09` refuses its canonical route (`C2C-007`) | read at HEAD | ✅ **STILL TRUE** |
| `test:continuity` · `test:exit-condition-b` | not re-run | ✅ **CARRIED** — and now also blocked by Docker |
| **136 mojibake sequences / 41 files** | not re-measured | ⚠️ **CARRIED AS UNREPRODUCED** |
| `trainer-draft-generation`'s `BackLink` variant | unchanged | ✅ **STILL OPEN** |
| `main` untouched | `git ls-remote` | ✅ **STILL TRUE** — `5eb84bc` |

---

## ✅ RECORDED, AS YOU RULED

**§12.8 — the fixture-content-pin class, named.** A suite may pin a **governed rule**; it may not
pin what the fixture **happens to contain**. A content pin is invisible while the product sits
unused — the fixture is the only writer — and when it fires it **looks exactly like a regression**.

⛔ **`prove:encoding` recorded as your framing has it: a test asserting a defect.** Requiring every
title to contain an em dash is, as a product rule, *the system must reject a title typed with a
hyphen*. It was not over-tight; it asserted the **wrong behaviour**.

`P23-9` recorded as the **fourth** phase-scoped-claim instance, with the other three.
`P7-6` recorded as the same family from the other direction, **with the note that it said `FAIL`
rather than `PASS`, which is the only reason it surfaced.**

**§12.9 — §7.4.1 earned itself on its first outing.** The `.md` names `Showcase` nowhere; the
`.png` draws the badge; the `.html` carries the third chip colour. ▶ **A prose note lists what a
screen CONTAINS; it does not enumerate what a screen ENCODES.**

---

## ⏸ `P2-6` · SCREEN `14` LESSON PLAN MANAGEMENT — STATED, STOPPED

All three artefacts opened. **Full statement: `PORTAL_COMPLETION_PLAN.md` §13.**

### Counts, stated in advance

**`1` table · `1` bucket · `1` storage policy · `0` table policies · `0` client table grants ·
`4` RPCs · `4` EXECUTE grants · `0` enums · audit registry `21 → 22` (`material.attached`).**

**Table `public.class_session_materials`** — `id` · `class_session_id` · `centre_id` ·
`storage_object_path` · `display_name` (the frame draws `Lesson 1 – Intro to Persuasion`, not the
file name) · `media_type` (the `PPTX`/`PDF`/`KEY` chip) · `byte_size` (`4.2 MB`) ·
`uploaded_by_account_id` · `uploaded_by_membership_id` · `created_at`.

Composite FK `(class_session_id, centre_id)` → `class_sessions (id, centre_id)` `RESTRICT` —
✅ `class_sessions_id_centre_key` **already exists**, so no extra object. `UNIQUE
(storage_object_path)`. ⛔ **NO `UNIQUE (class_session_id)`** — the frame draws **two files on
Lesson 3**, so materials are **many-per-session**. That is the one deliberate divergence from
`report_evidence`, and it is the frame's own.

**Bucket `lesson-materials`** — private, own size limit, own MIME list. ⛔ **SEPARATE from
`evidence`**, Lock §8.2: *"separate buckets and separate policies — do not fold them into the
evidence bucket."*

**Policies/grants** follow the ratified evidence shape exactly: **zero** on the table, everything
through `SECURITY DEFINER` RPCs, **one** `storage.objects` insert policy for the browser upload.

### ⛔ §13.4 — THREE DECISIONS I CANNOT MAKE

**1 · Is REMOVAL built?** The frame draws **no delete control**, and the `27`-day-strip discipline
says an undrawn unratified control is not built. ⚠️ But a wrongly-uploaded file could then never
be removed by anyone, ever — and `D-5` ruled evidence removable for exactly that reason.
▶ **Recommend BUILD**, registry `21 → 23`.

**2 · Does a download emit an audit event?** `evidence.accessed` fires because the object is a
child's video. A slide deck is teaching material, and `A-029` plus the `P2-4` precedent hold that
**a read is not a governed action**. ▶ **Recommend NO string.**

**3 · ⛔ NEW-QUESTION, HARD STOP — WHO AUTHORS `KEY FOCUS POINTS`?** `D-4` gives their purpose and
their position constraint but **not their author**, and the frame draws them **read-only with no
edit affordance anywhere**.

- If Management authors them, `14` needs an edit control the frame does not draw.
- If nobody does, the block is always empty, hero 0B omits it, and the feature is **VACUOUS —
  worse than absent, because the frame implies it works.**
- Either way it decides whether **`class_sessions.key_focus`** is a fifth object, which is **NOT**
  in the counts above and would change them.

⛔ **`observations.focus_chips` is NOT this field and must not be reused for it.** That is the
trainer's **post-session** observation; `KEY FOCUS` is **lesson-plan intent** (`G-3`). Conflating
them is the invisible substitution `D-4`'s position constraint exists to prevent.

### Not built regardless

`6-week persuasive speaking unit` (a module description — no entity, the `C-14` family, `A-022`) ·
KEY FOCUS in or adjoining any governed carried-forward focus line (`D-4`, `G-3`, §10 exit
condition **(c)**) · the frame's `WEEK 5` inconsistency · any rating or `Overall Grade` · any TA
field.

### ⚠️ One measurement limit, stated in the statement itself

Docker stopped before this phase, so §13 is read from **migration files at HEAD** plus this
session's earlier live measurements. ⛔ **The at-HEAD re-measurement is OWED before any migration**,
and the authorization should be read as conditional on it.

---

## Suites at this boundary

| Suite | Result |
|---|---|
| `prove:stage2-routes` | ✅ **exit 0 — 17 checks** |
| `prove:stage3-authenticated` | ⛔ **`NOT-RUN` — `S3-00`, docker daemon down.** `S3-M6` unrun |
| everything else | ✅ **exit 0 at `e8d9482`** — no code changed since |
| `test:continuity` · `test:exit-condition-b` | ⛔ **`NOT-RUN`** |

## VISUAL ACCEPTANCE STATUS — reported at this boundary

| Screen | Status |
|---|---|
| `12` · `13` · `26` · `27` | ✅ **ACCEPTED** at `3431981`, point-in-time, not covering focus order or responsive collapse, superseded by a shared-control change — ✅ **and the additive icon change is RULED NOT SUPERSEDING** |
| `25` | ⛔ **`NOT-RUN`** |
| `14` | ⛔ **`NOT-RUN` — not built** |

---

## Next permitted action

⏸ **Your Docker decision, and your three `P2-6` rulings.** ⛔ No migration is written and no count
is acted on until you authorize.

⛔ **Carried by nothing above:** any hosted or billable action · a fixture reload · editing
ratified authority · a push to `main` · public deployment · human testing · final submission ·
**the mojibake repair run** · **any query against the demonstration stack on 543xx** ·
**starting Docker Desktop** · **killing a running dev server**.
