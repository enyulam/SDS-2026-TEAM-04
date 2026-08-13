# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> ⛔ **NOT A TRACKER · NOT AUTHORITY · DERIVED.** Every line is reproduced or mechanically
> reduced from `STATUS.md`, `BUILD_NOTES.md`, `PORTAL_COMPLETION_PLAN.md`, `git`, or a live
> measurement. **Where this and `STATUS.md` disagree, `STATUS.md` WINS and this file is STALE.**
> Written at every stop and **OVERWRITTEN, never appended** (`FINAL_MVP_G06_GROUNDING_RULING.md` §H-8).

**Regenerated:** 2026-08-14 · branch `develop` · ⏸ **stopped at `P2-7`'s two authorization gates.**

## ⚠️ §15.8.1 FRESHNESS SWEEP

**Every open item, blocker and limit re-verified against current state before deriving.**

| Carried previously | Re-measured now |
|---|---|
| `AR-4-14` open, awaiting your ruling | ⛔ **LAPSED AS AN OPEN ITEM — you ruled it.** Now `KNOWN-RED` with a stated cause |
| Screen `13`'s INERT→LIVE change awaiting your view | ⛔ **LAPSED — you ruled it.** Acceptance of `13` **STANDS** |
| §12.8 repair awaiting your view | ⛔ **LAPSED — you ruled it**, and asked for the pin-versus-ratchet census, below |
| `S3-T1-r` · `D-10` · `S3-00` | ✅ **STILL TRUE. CARRIED**, with `S3-T1-r`'s remedy now recorded as known |
| `P2-6` complete, `P2-7` next | ✅ **STILL TRUE**, and `P2-7` is now **stated and stopped** |

▶ **Nothing was carried forward without being re-measured. Three items had lapsed** — all three
because you ruled them — and each was corrected in the source record first, then re-derived here.

---

## ⏸ WHERE THIS STOPPED: `P2-7` (screen `11` Management Dashboard) — TWO GATES

**Nothing built, nothing migrated, nothing committed for `P2-7`.** All three artefacts opened.

### ⛔ STOP 1 — SCHEMA. One function, for one KPI tile

**The `Assessed` tile is the ONLY element on this screen with no source.** Measured at HEAD:
`reports`, `observations` and `report_versions` all carry **ZERO client grants**, and the three
delivered management boundaries expose only `trainer_approved` / `needs_edit` / `draft_ready` /
`submitted` — a report at `incomplete` / `observation_saved` / `drafting` is invisible to
management **by `A-038`'s design**.

**Stated in advance, nothing written:**

| | Proposed |
|---|---|
| tables · columns · enums · policies · client grants | **0 · 0 · 0 · 0 · 0** |
| audit registry | **UNMOVED at 23** — a read is not a governed action (`A-029`) |
| functions | **1** — a reviewed `SECURITY DEFINER` **READ**, management-only, centre from the caller's own membership |

**Returns exactly four integers:** `total_students` · `assessed_students` · `pending_approval` ·
`submitted_reports`. ⛔ No rating, roll-up, panel text, trainer note, content hash or per-child
anything, with a build-failing assertion if the body so much as **names** rating vocabulary
(bare substring, as `V-4` does at `P2-4`).

⚠️ **THE PRECEDENT AND ITS LIMIT.** `report_class_health_summary` **already** returns aggregate
counts spanning pre-trainer-approval reports to management **at CLASS scope** — so *counts are not
content* is already ruled. **What is NOT ruled is widening that to CENTRE scope.** That is the
decision.

▶ **A no-authorization alternative exists and is worse:** call the per-module summary once per
module and sum client-side. N round-trips, a governed aggregate re-derived outside the database,
and it **still cannot produce *assessed learners*** — only report totals.

**If you say no:** the tile becomes a `REGISTERED-OMISSION` with no substrate and the dashboard
ships with **three** tiles. A complete screen under a stated omission, not a broken one.

### ⛔ STOP 2 — ROUTE. The canonical route is not where the surface lives

| | |
|---|---|
| Canonical (ratified inventory) | **`/management/dashboard`** |
| Where it lives today | **`/management`** — `page.tsx` renders `ManagementDashboard` |
| What the pack proposes | *"preserve `/management` as a redirect"* |

⛔ **That is a route-compatibility treatment, which `CLAUDE.md` §12 names a stop-and-ask.** It also
moves the **portal home** and the **Dashboard rail `href`** — a **shared control** on screens you
have already accepted.

1. **Build at `/management`** — no treatment, no shared-control change, a **recorded divergence**
   from the ratified canonical route.
2. **Move + redirect**, per the pack. ⭐ **My recommendation** — the canonical route is ratified and
   a redirect preserves every existing entry point.
3. **Move, and re-point the rail** — option 2 plus the nav census and its expectations.

⚠️ **The pack proposing a treatment is not the same thing as the treatment being authorized**,
which is exactly the distinction §12 draws.

---

## ⛔ THE FRAME'S GOVERNANCE COLLISIONS — the largest in the estate so far

**A rating chip on EVERY row** of *Reports waiting for approval*. The `.html` carries all four
ratified labels as literal text — **8 chips, 8 rows** (`Beginning`×2, `Developing`×3,
`Mastering`×2, `Mastered`×1).

▶ **BOTH AVAILABLE READINGS PROHIBIT IT, which is the strongest form.** As a per-dimension rating,
`C-9` confines the nine to report **DETAIL** surfaces and its own row names `P2-7`. As a single
roll-up, `G-2` bars every roll-up everywhere, permanently.

⚠️ **A SECOND, QUIETER LEAK ON THE SAME PANEL.** The eight row descriptions carry the vocabulary
**in running text** — *"**Mastered** eye contact, clear projection"*, *"**Beginning** on sentence
flow & pace"*. ▶ **Removing the chips and keeping the descriptions would leave the leak in place.**
They also have no substrate: `A-038` gives management the four parent-facing panels and nothing
else.

⚠️ **The `Approved` KPI has an empty referent.** `A-036` makes `approved` transient-in-transaction
and it never commits — the count is **always zero, forever, by design**. **Third sighting of the
Step 7I1D-R2 defect.** Proposed: the tile reads **`Submitted`**. A label correction against the
frame, recorded rather than silently applied.

---

## ✅ YOUR FOUR `P2-6` RULINGS, AS RECORDED

1. **`AR-4-14` = `KNOWN-RED`** — not a defect, not a waiver, threshold unmoved. Recorded in
   `artefact-read-rule.mjs` itself; **the leg still fails and its verdict is unchanged.**
   ⚠️ **A second frame hitting the same wall is a stop-and-ask.**
2. **Screen `13`'s acceptance STANDS.** ▶ Generalised: **a screen's visual acceptance is not a
   freeze on the sentences the code tells about itself.**
3. **The §12.8 census, by CHECK rather than by suite:**

   | Class | Count |
   |---|---|
   | **CONTENT PINS** — measured what the schema/fixture *happened to hold* | **13** |
   | **GENUINE RATCHETS** — exact by their own recorded design, legitimately moved | **2** |
   | **REGISTRATION GUARDS** — never pins; they *worked*, demanding a new thing be declared | **3** |

   The 2 ratchets are the route census (**20 → 21**) and the single global function ratchet
   (**56 → 61**), both rewritten with the new entry **NAMED**. ⚠️ **Neither was a defect.**
   The 3 guards are the nav `N-0` census, `RPC_MIGRATIONS`/`PLMa-PAIR`, and `AR-1`/`AR-8a`.
   ⛔ **`P22-4` is the canonical §12.8 example**, and `P2-5`'s header-versus-code contradiction is
   **`D-28`**.
4. **`S3-T1-r` and `D-10` CARRIED.** ⚠️ **`S3-T1-r`'s remedy is already proven here** — `S3-M6`
   pins `?month=` for exactly this reason — **so only the authorization is missing.** `D-10` needs
   a diagnosis, not a decision.

## VISUAL ACCEPTANCE

| Screen | Status |
|---|---|
| `12` · `13` · `26` · `27` | ✅ **ACCEPTED** at `3431981` — `13`'s acceptance **confirmed to stand** |
| `25` · `14` | ⛔ **`NOT-RUN`** — you will walk them together with whatever `P2-7` produces |
| `11` | ⛔ **`NOT-RUN` — not built** |

## Suite state

Unchanged from `3cf361e` — no product code changed since. `prove:artefact-read` re-run: **`AR-4-14`
still fails, deliberately.** `prove:serving-discipline` **`D-10`** and `prove:stage3-authenticated`
**`S3-T1-r`** remain the two carried reds.

## Container counts

**dev `9` · mvp `0`** throughout. ⛔ The demonstration stack was never started, queried or altered.

## Next permitted action

**Rule `P2-7`'s two stops.** Everything else on that screen is measured and ready to build.

⛔ **Carried by nothing above:** any hosted or billable action · a fixture reload · editing ratified
authority · a push to `main` · public deployment · human testing · final submission · **the
mojibake repair run** · **any query against the demonstration stack on 543xx** · **`supabase stop`
on any project** · starting the demonstration stack.
