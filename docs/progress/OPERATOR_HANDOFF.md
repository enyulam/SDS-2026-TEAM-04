# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> ⛔ **NOT A TRACKER · NOT AUTHORITY · DERIVED.** Every line is reproduced or mechanically
> reduced from `STATUS.md`, `BUILD_NOTES.md`, `PORTAL_COMPLETION_PLAN.md`, `git`, or a live
> measurement. **Where this and `STATUS.md` disagree, `STATUS.md` WINS and this file is STALE.**
> Written at every stop and **OVERWRITTEN, never appended** (`FINAL_MVP_G06_GROUNDING_RULING.md` §H-8).

**Regenerated:** 2026-08-14 · **HEAD `3cf361e`** · branch `develop` · tree clean at write time.

## ⚠️ §15.8.1 FRESHNESS SWEEP — what I re-verified, and what had LAPSED

**Four items the previous handoff led with were re-measured against current state. THREE HAD
LAPSED**, and all three were corrected in the source record first, then re-derived here:

| Carried previously | Re-measured now |
|---|---|
| *"THE ONE THING BLOCKING EVERYTHING: Docker Desktop's port proxy"* | ⛔ **LAPSED.** You fixed it — the cause was **Windows**, not Docker |
| *"WHY THE MIGRATION IS NOT WRITTEN — a deliberate stop"* | ⛔ **LAPSED.** Written, applied, proved |
| *"`S3-M6` is `NOT-RUN`"* | ⛔ **LAPSED.** `S3-M6-r` and `S3-M6-omissions` both **PASS** |
| *"`S3-00`'s name overstates its measurement — not repaired"* | ✅ **STILL TRUE**, carried below |

▶ **Nothing was carried forward from the previous handoff without being re-measured.**

---

## ✅ `P2-6` IS COMPLETE — screen `14` and the lesson-materials substrate

Migration `20260814090000`, applied with **`supabase migration up` in ONE transaction**, all nine
assertions `M-1`…`M-9` executed inside it. **Exactly what you authorized, every count stated in
advance:**

| | Authorized | Delivered |
|---|---|---|
| table | 1 | `class_session_materials` (29 → **30**) |
| bucket | 1 | `lesson-materials`, **private**, **25 MiB**, **8** MIME types |
| storage policy | 1 | INSERT only |
| table policies · client grants · enums | **0 · 0 · 0** | **0 · 0 · 0** |
| registry | 21 → 23 | `material.attached`, `material.removed` |

✅ **`P1-2`'s bucket invariant re-proved across BOTH buckets** — `0` public, `0` without a size
limit — which is what you asked for and stronger than checking the new bucket alone.

⛔ **`material.accessed` is RULED ABSENT** and `M-2` fails the build if it appears. `PLM-7` proves
it live: two `material_signed_path` calls moved the audit count **by zero**.

## ⚠️ THREE THINGS THAT NEED YOUR EYES

### 1. ⛔ `AR-4-14` is LEFT FAILING, and it is a question for you

The artefact-read rule requires **≥2 fractional** `.html` values, because a fraction cannot be
forged from a prose note. **This frame carries exactly three, and two belong to the SHARED PORTAL
SHELL:**

| Value | Carrier |
|---|---|
| `10.50px` | `Management Portal` — shared shell |
| `13.50px` | sidebar nav — shared shell |
| **`11.50px`** | **the breadcrumb — this screen's own component** |

▶ **Two routes to green existed and both were refused.** Citing icon-internal geometry
(`7.50px`, `5.83px`) satisfies the letter while citing values the component does not build to.
Rewriting the shell's `text-[0.84375rem]` → `text-[13.5px]` is **arithmetically identical** but
**touches a shared control on four ACCEPTED screens**, which your standing limit says supersedes
their acceptance.

**A rule-versus-frame question, not a threshold to quietly lower.**

### 2. ⚠️ ONE CHANGE TO AN ALREADY-ACCEPTED SCREEN

**Screen `13`'s `Manage lesson plans` footer control moved from INERT to LIVE.** `P2-4` built it
inert with the stated reason *"Lesson plans arrive with screen 14."* ▶ **That reason has lapsed,
and leaving it would have made the stated reason FALSE.** It is the frame's own control
(`.html:274`, `#EC4B96`, `13px`, weight `600`), screen `14` has **no other inbound route**, and the
treatment matches `InertControl` apart from colour — which moves **toward** the frame.

### 3. ⛔ `KEY FOCUS POINTS` — declined, and mechanised so it cannot drift back

Migration `M-6` fails the build on `class_sessions.key_focus` · `PLM-8` re-asserts it ·
`PLMa-KEYFOCUS` bars the strings in source with a three-way control · `S3-M7-omissions` proves it
never reaches the painted page. ⛔ `observations.focus_chips` is barred by the same list — a
**different field** (post-session observation, not lesson-plan intent, `G-3`).

## ⛔ §12.8 AT SCALE — six suites red from one authorized migration

`p2-2`, `p2-2-create`, `p2-2b`, `p2-3`, `p2-4`, `p2-5` each pinned a **global absolute** as their
own phase-scoped claim; `hero-2` pinned `functions = 56`.

⛔ **Bumping every number was REFUSED** — it re-arms the identical trap for `P2-7`. Pins became
**FLOORS**; `enums` stays an **equality**; the **two ratchets that are EXACT by their own recorded
design** (route census 20 → 21, global function ratchet 56 → 61) were **rewritten with the new
entry NAMED, never deleted**.

⚠️ **`P2-5`'s own header ALREADY STATED the rule while the code three lines below contradicted
it** — the same shape §7.4.1 records: the rule existed and was not followed.
⚠️ **`P22-4` went red BECAUSE THE PRODUCT WORKS** — your governed Add Class walk legitimately set
terms on 13 sessions. It now measures the **migration** (nullable, no DEFAULT, pre-terms rows still
NULL) rather than what the fixture happens to hold.

## Suite state

| Suite | Result |
|---|---|
| `prove:portal-p2-6` (8 SQL legs + 18 runner checks) | ✅ **PASS** |
| Every other portal + hero suite | ✅ **PASS** |
| `prove:stage2-routes` | ✅ **PASS** — 17 checks |
| `prove:stage3-authenticated` | **39 PASS · 1 FAIL · 2 NOT-RUN** |
| `prove:artefact-read` | ⛔ **1 FAIL — `AR-4-14`**, deliberate |
| `prove:serving-discipline` | ⛔ **1 FAIL — `D-10`**, not repaired |
| `tsc --noEmit` · `eslint` | ✅ clean |

✅ **`S3-M7-r` and `S3-M7-omissions` are screen `14`'s FIRST rendered proof.** `S3-M6` is green for
the first time.

## ⛔ Two findings recorded and NOT repaired (the `S3-00` precedent)

- **`S3-T1-r`** — the trainer calendar opens on **today's** month; all 17 sessions are in
  `2026-01`…`2026-03`; the leg hardcodes `February 2026`. ▶ **The product is correct and the leg has
  been overtaken by time.** ⚠️ `S3-M6` **already anticipated this** and solved it with `?month=`;
  the trainer leg has no such parameter. **§12.8 from the TIME direction.**
- **`D-10`** — port `3419` verifiably free (`HTTP 000`, no `netstat` entry), teardown leg still
  red, one surviving `node.exe` holding neither `3419` nor `3000`. A Windows teardown-timing
  finding, untouched by this phase.
- **`S3-00`** — still passes on *config resolution* while its name claims *reachability*. Unrepaired
  on your instruction; it belongs to another phase's harness.

## VISUAL ACCEPTANCE — reported at this boundary

| Screen | Status |
|---|---|
| `12` · `26` · `27` | ✅ **ACCEPTED** at `3431981`, with its three limits |
| `13` | ✅ **ACCEPTED** at `3431981` — ⚠️ **now carries the INERT→LIVE change above** |
| `25` · `14` | ⛔ **`NOT-RUN` — Operator-set only.** A DOM-text proof says the surface paints its data and **nothing** about layout or fidelity |

## Container counts

**dev `9` · mvp `0`** before and after every step. ⛔ The demonstration stack was **never started,
queried or altered** — it stayed at `0` throughout.

## Next permitted action

Walk screens `25` and `14`; rule `AR-4-14`; then `P2-7` in plan order.

⛔ **Carried by nothing above:** any hosted or billable action · a fixture reload · editing ratified
authority · a push to `main` · public deployment · human testing · final submission · **the
mojibake repair run** · **any query against the demonstration stack on 543xx** · **`supabase stop`
on any project** · starting the demonstration stack.
