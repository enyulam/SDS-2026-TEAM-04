# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> ⛔ **NOT A TRACKER · NOT AUTHORITY · DERIVED.** Every line is reproduced or mechanically
> reduced from `STATUS.md`, `BUILD_NOTES.md`, `PORTAL_COMPLETION_PLAN.md`, `git`, or the live
> database. **Where this and `STATUS.md` disagree, `STATUS.md` WINS and this file is STALE.**
> Written at every stop and **OVERWRITTEN, never appended** (`FINAL_MVP_G06_GROUNDING_RULING.md` §H-8).

**Regenerated:** 2026-08-13, at the **`P2-3` phase boundary** — screen `27` Edit Class built, proven, **rendered**, committed and **pushed**.

---

## ⛔ FRESHNESS REPORT (`CLAUDE.md` §15.8.1) — re-verified, not carried

**Three items had lapsed, and one of them was stopping work.**

| Carried claim | Method | Result |
|---|---|---|
| `prove:stage3-authenticated` `NOT-RUN` — *"your `next dev` (PID `46348`) holds the directory"* | `netstat`, `tasklist` | ⛔ **LAPSED — YOU HAD ALREADY CLEARED IT.** No listener on 3000; PID `46348` gone. ▶ **Carrying this forward would have deferred the rendered proof for no reason** — the exact *"a stale blocker stops work that was never blocked"* shape |
| *"`origin/develop` = `62ee67b`, pushed"* | `git rev-list --left-right --count develop...origin/develop` | ⛔ **LAPSED AND WRONG** — measured **`1 0`**. Origin sat at `29f1668`; **`P2-2b` was local only.** Pushed at this boundary |
| `R-7`'s tail: *"a separate item is owed for `P2-2` — the `admin.trainer_assigned` string"* | read at HEAD in the plan | ⛔ **LAPSED** — discharged at `P2-2b`. ⚠️ **The ROW HEAD had been corrected while its TAIL had not** — the same-row shape, and the hardest to catch |
| `P2-6`'s `C-7` gate still open | plan §2.3 `R-7` | ✅ **STILL TRUE** — and still the **only** open `C-7` item |
| `B-G06-DET-1` open | no verdict produced | ✅ **STILL TRUE** |
| §10 Phase 1 exit condition **(c)** unproven | ⚠️ **not re-measured** — no fixture load, no hosted contact | ✅ **CARRIED, and stated as carried** |
| `09` refuses its canonical route (`C2C-007`) | read at HEAD | ✅ **STILL TRUE** — first fixed at `P2-21` |
| **136 mojibake sequences / 41 files** | not re-measured this run | ⚠️ **CARRIED AS UNREPRODUCED**, exactly as last recorded. The `P2-2` boundary measured **37 files · 125 sequences** with `CLAUDE.md` at **zero**; neither number is asserted, and **the bounded run must take its own measurement** |
| `main` untouched | `git ls-remote` | ✅ **STILL TRUE** — `5eb84bc` |

⚠️ **All three lapsed items were corrected in their SOURCE records BEFORE this file was derived.** Correcting only the handoff reproduces the defect, because the next derivation reads the source again.

---

## Position

| | |
|---|---|
| **HEAD** | **`b277233`** — *feat(P2-3): screen 27 Edit Class; registry 19->21; three refusals recorded*. ⚠️ A derived artifact cannot name its own SHA; verify with `git log -1` |
| **Branch** | `develop` · **tree carries only this regeneration** |
| **Remote** | ✅ **`origin/develop` = `b277233`, PUSHED AND VERIFIED FROM `origin`** — `29f1668..b277233`, carrying the unpushed `62ee67b` with it |
| **`main`** | **`5eb84bc`, UNTOUCHED** |
| **Census (local, measured)** | **29 migrations · 29 tables · 54 functions · 12 enums · 30 policies · 1 storage bucket · audit registry 21** |
| **Hosted dev / frozen projects** | ⛔ **NOT CONTACTED.** The hosted DB is now **four migrations behind local**; no hosted action is authorized |

---

## ✅ `P2-3` COMPLETE — screen `27` Edit Class

**One migration**, `20260813150000` — two reviewed `SECURITY DEFINER` RPCs, `admin_update_class_module` and `admin_update_class_session`. **Audit registry 19 → 21** on exactly the two strings you authorized **with the count stated in advance**; `A-057` amended in the `C-4` shape, at the **single** declaration site.

⛔ **Zero new table, column, enum or policy. Zero write policy. Zero write grant.**

**Screen `27` answers at its canonical route** `/management/classes/[classModuleId]/edit`.

---

## ⛔ THE THREE REFUSALS — kept in the plan, with their lift conditions

| # | Refused | Why, and what would lift it |
|---|---|---|
| **1** | **The Sun–Sat DAY STRIP.** ⛔ **ABSENT, not present-and-disabled** | Changing which weekdays a class meets **REMOVES sessions**, and **no cancel or delete audit string was ratified**. A session may already carry attendance, an observation or a **submitted report**. ▶ **A greyed chip reads *"not wired yet"*; this reads *"not permitted"*, and the two must not look alike.** The dates are listed **read-only** with the reason on the surface. **Lift:** a ratified session-cancellation string and its RPC |
| **2** | **UNASSIGN** — the frame's `-` beside the trainer | Leaving a session with **nobody** is a different action with **no string**. Choosing a **different** trainer is reassignment and works. **Lift:** a ratified unassignment string |
| **3** | **`Class code` · `Capacity` · `Program`** | `C-14` omits all three; *"programme"* additionally has **no entity** (`A-016`). **Lift:** a ruling adding fields to `C-14`'s six |

⚠️ **All three are now measured on the PAINTED PAGE** by `S3-M4-refusals`, not merely written down — with a detector control requiring it to match the frame's own strings, and a second control (`Save Class` + the read-only `Sessions (n)` list) proving the absences are refusals rather than a page that failed to load.

---

## ⛔ ONE THING NEEDS YOU — `B-P2-3-1`, and it is not this phase's

**`test:runtime-profile` `T-P44` has been FAILING SINCE PART 1 and had never been run.**

It pins that `lib/supabase/browser.ts` is imported by **nothing** and `lib/supabase/public-config.ts` by exactly four modules — its stated reason being *"if a future client component imported it, a disposable build would inline the disposable URL and publishable key straight into a browser bundle."*

⚠️ **`P1-2b`'s `lib/frontend/evidence-upload.ts` imports BOTH** (commit `1624ef8`, 2026-08-12).

**Measured, not argued:** that file, the runner, `public-config.ts` and `browser.ts` are **byte-identical at HEAD** (`git diff HEAD --stat` empty), so the failure **reproduces at `62ee67b`** and is **not** a `P2-3` regression. ⚠️ **`runtime-profile` appears nowhere in `STATUS.md` and only incidentally in `BUILD_NOTES.md` — it has never been recorded as run**, which is how a guard written to catch exactly this went unnoticed.

⛔ **NOT FIXED, deliberately.** Extending a security guard's allow-list **changes an authorization contract** (§12) and is outside this phase's authorization. ▶ The likely disposition is that `T-P44`'s **premise was superseded by `D-5`/`P1-2b`** — a browser-side resumable upload genuinely needs the URL and publishable key — but *"the guard's premise lapsed"* is exactly the claim that must be **ruled, not inferred by the session that tripped over it**.

---

## ⚠️ Also worth your eye

1. **No ratified frame draws an inbound control to `27`.** `Management - Classes` sends a card to **Class Overview**; `Management - Class Overview` names **no Edit control at all**. ⛔ **No Edit affordance was invented on `12`.** `27` is reached at its canonical route. ▶ **Which surface hosts the control is your question** — likely answered when `13` ships at `P2-4`.
2. **Your *"extend BOTH declaration sites"* premise was stale, and you confirmed it.** `P1-2` consolidated them; the single site was extended with an assertion that no second exists. **Third operator-supplied premise refuted by measurement.**
3. ⛔ **The phase-scoped-claim defect appeared three more times.** The registry legitimately moving 19 → 21 fired three suites that each pinned the registry **TOTAL** — a phase-scoped claim written as a global absolute. All three now assert only what their own phase did, each with a control. ⚠️ **`P2-2`'s first fix asserted its migration never *mentions* the registry and failed correctly** — it **reads** it in an apply-time assertion that was true when it applied. ⛔ **An applied migration is not edited to make a later test pass.**

---

## Suites at this boundary, by exit code

| Suite | Result |
|---|---|
| `prove:portal-p2-3` | ✅ **exit 0** — 12 SQL legs + runner checks, including **chain verification accepting both new strings** and its **non-vacuity control** |
| `prove:portal-p2-2-create` · `-p2-2` · `-p2-2b` · `-p2-1` · `-p2-1-composed` · `-1` · `-2` · `-2b` · `-5` · `-5-composed` · `-34` · `f-attendance-init-1` | ✅ **all exit 0** |
| `prove:hero-all` | ✅ **exit 0** — after `P2-6` fired at `52 → 54` and was updated **with its reason** |
| ✅ **`prove:stage3-authenticated`** | ✅ **exit 0 — 31 PASS · 0 FAIL · 2 `NOT-RUN`.** **`S3-M3-r` and `S3-M4-r` are the FIRST rendered proofs of screens `26` and `27`**, which is what clearing port 3000 bought |
| `tsc` · `eslint` · `next build` · nav suite · `test:integration` · `test:g06-grounding` · `prove:encoding` · `prove:no-secrets` · `prove:serving-discipline` · `prove:stage2-routes` · the four guard suites | ✅ **all 0** |
| `test:runtime-profile` | ⛔ **FAIL — pre-existing, `B-P2-3-1`, not fixed here** |
| `test:continuity` | ⛔ **`NOT-RUN`** — blocked at `CONT-A0` by `B-STAGE3-2` |
| `test:exit-condition-b` | ⛔ **`NOT-RUN`** — refused at `XB-PRE`, canonical DB not pristine. **A downstream consequence of `B-STAGE3-2`**; nothing was provisioned |
| **VISUAL acceptance, screens `12` · `26` · `27`** | ⛔ **`NOT-RUN` on all three**, and not claimed. **A rendered DOM-text proof is not a visual acceptance** |

---

## Next permitted action

▶ **`P2-4` (`13` Class Overview), in plan order.** A **read** surface — `C-17`/`GC-9`, plus the Class Health Summary, whose four conditions `CLAUDE.md` §6 already fixes exhaustively, so no new vocabulary is invented. ⚠️ It is also the likely host for `27`'s missing inbound control, which is your call, not mine.

⛔ **Carried by nothing above:** any hosted or billable action · a fixture reload or expansion · editing ratified authority · a push to `main` · public deployment · human testing · final submission · **the mojibake repair run** · **and a ruling on `B-P2-3-1`**.
