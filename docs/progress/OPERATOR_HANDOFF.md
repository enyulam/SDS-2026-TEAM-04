# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> ⛔ **NOT A TRACKER · NOT AUTHORITY · DERIVED.** Every line is reproduced or mechanically
> reduced from `STATUS.md`, `BUILD_NOTES.md`, `PORTAL_COMPLETION_PLAN.md`, `git`, or a live
> measurement. **Where this and `STATUS.md` disagree, `STATUS.md` WINS and this file is STALE.**
> Written at every stop and **OVERWRITTEN, never appended** (`FINAL_MVP_G06_GROUNDING_RULING.md` §H-8).

**Regenerated:** 2026-08-13, at the `P2-6` size-limit stop.
⏸ **Two decisions needed: the bucket size limit, and whether `supabase start` may be run.**

---

## ✅ CONTAINERS CONFIRMED BEFORE ANYTHING RAN, AS YOU ASKED

Nine `*_best-coach-dev` and nine `*_best-coach-mvp`. `config.toml` `project_id = "best-coach-dev"`,
and the guard refuses any other target.

⛔ **The demonstration stack was not queried, not stopped and not altered — nine containers before
my work, nine after.**

---

## ⚠️ TWO THINGS I NEED

### 1 · The bucket size limit — PROPOSED, NOT SET

**`25 MiB` = `26214400` bytes.** Four grounds, in the order they carry weight:

1. **The only empirical anchor says `1.8 – 4.2 MB`.** The frame's four files, measured in the
   `.html`: `4.2 MB` PPTX · `1.8 MB` PDF · `2.6 MB` KEY · `3.9 MB` PPTX. `25 MiB` is **~6× the
   largest** — headroom for an image-heavy deck, not a number fitted to the samples. ⚠️ This is
   evidence about **magnitude**, not a schema'd field; `A-022` bars the latter and this is not it.
2. **It keeps Lock §8.2's media-class separation enforceable BY THE BUCKET ROW.** A ~100 MiB
   "document" is almost certainly carrying **embedded video** — the `D-5` evidence class, with a
   different bucket and different policies. ▶ A limit that admits video makes the separation
   depend on who uploads what, when §8.2 exists precisely so it does not.
3. **The recoverable direction is UP.** Raising is a one-row `UPDATE`, no data migration, no
   orphans. Lowering after files exist blocks re-upload of material already accepted.
4. **It reads as a different media class at a glance** — a quarter of `evidence`'s `104857600`,
   rather than two identical numbers that invite folding the buckets together.

⚠️ **A SECOND ROW FIELD I WILL NOT SET SILENTLY: `allowed_mime_types`.** It sits on the same row
and was not in your instruction. The frame draws exactly three chips:

| Chip | MIME |
|---|---|
| `PPTX` | `application/vnd.openxmlformats-officedocument.presentationml.presentation` |
| `PDF` | `application/pdf` |
| `KEY` | `application/vnd.apple.keynote` |

⛔ **A narrow list is a REFUSAL, not a default** — `.docx`, `.ppt`, `.pages`, images and archives
would be rejected at the bucket. **Recommend the three the frame draws.** Your call if wider.

### 2 · `S3-M6` is still `NOT-RUN` — the dev stack's host ports are not published

**Diagnosed, not guessed.** `supabase_kong_best-coach-dev` is **running and healthy**, and its
`HostConfig.PortBindings` carries `8000/tcp → 54421` — but `NetworkSettings.Ports` is **empty**.
Docker Desktop's port proxy did not re-publish after the restart. `127.0.0.1:54421` returns
**HTTP 000** on `/rest/v1/` and `/auth/v1/health` alike, and `supabase status` reports **five
stopped services** (imgproxy, edge_runtime, analytics, vector, pooler).

▶ **I restarted only the dev Kong container** — stateless, reversible, scoped by name, with the
`best-coach-mvp` count checked at 9 before and 9 after. **It did not fix it.**

⛔ **The next step, `supabase start` on the dev project, is a larger action on your stack and I
have NOT taken it.** Your call.

**Run result:** `4 PASS · 3 FAIL · 26 NOT-RUN`. The three failures are the trainer, management and
parent magiclink mints; `S3-M6-t` and `S3-M6-r` are `NOT-RUN`.

⚠️ **A FINDING IN THE SUITE ITSELF.** It printed `PASS  S3-00  the local loopback Supabase stack
was resolved` **while `54421` was returning HTTP 000**. ▶ **The leg's name reads as a reachability
check; it is a config-resolution check.** Nothing was reported green — the mint failures caught it
one leg later — but a leg whose name overstates what it measured is the same shape as `SC-1` and
`P25-4`. Recorded, not repaired: fixing another phase's harness mid-gate is not what was
authorized.

---

## ✅ YOUR THREE RULINGS — RECORDED

| # | Ruling | Effect |
|---|---|---|
| **1** | **REMOVAL — BUILD.** Registry `21 → 23`, **Management only**, cited in the component as an **Operator addition on the same grounds as the back affordance** | `material.attached` + `material.removed` |
| **2** | **DOWNLOAD EVENT — NO STRING.** *"Your `P2-4` precedent decides it"* — `A-029`, a read is not a governed action | registry stays at **23** |
| **3** | **`KEY FOCUS POINTS` — RAISED AND DECLINED**, recorded **with the reason so a later phase does not read `D-4`'s mention as licence**. No `class_sessions.key_focus`, not a fifth object. If an author is later named it returns as its own question with its own schema authorization | no column, no chips |

## ✅ YOUR CONDITIONAL HELD — re-measured at HEAD, nothing differs from §13

| §13 claim | Measured | |
|---|---|---|
| census `30 · 29 · 56 · 12 · 30 · 21` | `30\|29\|56\|12\|30\|21` | ✅ |
| `class_sessions_id_centre_key` exists | present | ✅ **no extra object** |
| `class_session_materials` absent | `ABSENT` | ✅ |
| only `evidence`, private, `104857600` | one row, matches | ✅ |
| **`P1-2`'s bucket invariant** | `public_buckets=0`, `null_limit=0` | ✅ **holds; the new bucket must preserve it** |
| one `storage.objects` policy · `terms` exists | both | ✅ |
| registry exactly 21, no `material.*` | 21, `none` | ✅ |
| no `key_focus` column | absent | ✅ and it stays absent |

⚠️ **One ADDITION, not a contradiction:** `class_sessions_id_module_key UNIQUE (id,
class_module_id)` also exists and §13 did not mention it. Changes nothing — the composite FK uses
the centre key — recorded so the next reader does not think a key appeared.

## ✅ `CLAUDE.md` §7.4.1 amended, as instructed

*"A prose note lists what a screen CONTAINS; it does not enumerate what a screen ENCODES"* is now
a highlighted block in §7.4.1. ⛔ **It supersedes nothing** — it is the general rule the existing
paragraph states as a special case — and it carries the measured `Showcase` instance, so the rule
arrives with its evidence attached.

§12.8 and §12.9 stand as accepted.

---

## VISUAL ACCEPTANCE STATUS — reported at this boundary

| Screen | Status |
|---|---|
| `12` · `13` · `26` · `27` | ✅ **ACCEPTED** at `3431981`, with its three limits; the additive icon change ruled **not superseding** |
| `25` | ⛔ **`NOT-RUN`** — and `S3-M6` could not run either |
| `14` | ⛔ **`NOT-RUN` — not built** |

## Next permitted action

⏸ **Rule the size limit (and the MIME list), and decide on `supabase start`.**
⛔ **No migration is written until the size figure is ruled** — it is the one item your own
instruction stopped.

⛔ **Carried by nothing above:** any hosted or billable action · a fixture reload · editing
ratified authority beyond the §7.4.1 addition you instructed · a push to `main` · public
deployment · human testing · final submission · **the mojibake repair run** · **any query against
the demonstration stack on 543xx** · **`supabase start` or `supabase stop` on any project**.
