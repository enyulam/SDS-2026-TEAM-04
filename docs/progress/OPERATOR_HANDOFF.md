# OPERATOR HANDOFF — B.E.S.T Coach Final MVP

> ⛔ **NOT A TRACKER · NOT AUTHORITY · DERIVED.** Every line is reproduced or mechanically
> reduced from `STATUS.md`, `BUILD_NOTES.md`, `PORTAL_COMPLETION_PLAN.md`, `git`, or a live
> measurement. **Where this and `STATUS.md` disagree, `STATUS.md` WINS and this file is STALE.**
> Written at every stop and **OVERWRITTEN, never appended** (`FINAL_MVP_G06_GROUNDING_RULING.md` §H-8).

**Regenerated:** 2026-08-14. ⏸ **Stopped where you told me to stop.**

---

## ⛔ THE ONE THING BLOCKING EVERYTHING: DOCKER DESKTOP'S PORT PROXY

`supabase start` ran on the **dev project only**, pinned by `config.toml`. **Exit 0**, every URL
reported normally.

| Step | dev | mvp |
|---|---|---|
| before | **9** | **9** |
| after `supabase start` | **9** | **9** |
| end of run | **9** | **9** |

⛔ **It did not resolve the port publication, so I stopped and did not escalate — your instruction.**

`supabase_kong_best-coach-dev`'s `NetworkSettings.Ports` is still `{"8000/tcp":[]}`, and
`127.0.0.1:54421` still returns **HTTP 000** on `/rest/v1/` and `/auth/v1/health`.

▶ **AND THE MEASUREMENT WIDENED THE DIAGNOSIS.** Across the **whole daemon**, both stacks,
**ZERO of 18 containers carries a host binding** — every `docker ps` Ports column shows only the
container-internal port, and the count of `->` mappings is **0**.

⚠️ **This is a Docker Desktop-wide port-proxy failure, not a dev-stack problem.** That is why
neither the earlier Kong restart nor `supabase start` changed anything — **neither could have.**
A full Docker Desktop restart is what this diagnosis points at, and that is yours.

---

## ⛔ WHY THE MIGRATION IS NOT WRITTEN — a deliberate stop, not an omission

**Nothing about `P2-6` remains undecided.** The authorization is complete and both figures are
ruled. The blocker is that the migration cannot be **applied or proven**:

1. The established path is **`supabase migration up`**, over **TCP `54422`** — down for the same
   reason as `54421`.
2. ⛔ **The `docker exec … psql -f` workaround is the path that ALREADY BROKE ATOMICITY here.**
   `BUILD_NOTES.md`: *"`psql -f` autocommits per statement. The first apply left the function
   committed while its assertion block aborted … a migration's atomicity is a property of how it
   is APPLIED, not only of how it is written."* Reaching for it now would be escalating around
   the blocker you asked to be told about.
3. Writing the file unapplied would **immediately break `prove:portal-p2-5`'s `P25a-NOMIG` pin**
   (`migrations.length === 30`) in a suite that cannot run to observe it — leaving an unproven
   migration a later session would reasonably read as shipped.

▶ Screen `14`'s frontend is likewise not built: it consumes a projection that does not exist, and
building a UI against an unapplied schema is how a phase ends up "complete" with nothing behind it.

**`S3-M6` is `NOT-RUN`.** The run was `4 PASS · 3 FAIL · 26 NOT-RUN`; the failures are the
trainer, management and parent magiclink mints.

---

## ✅ BOTH BUCKET-ROW FIELDS RULED — recorded with their reasons

**`file_size_limit = 26214400` (`25 MiB`).** Your deciding ground is recorded *with* the number,
so a later phase asked to raise it must argue against **that** rather than against a bare figure:
the ceiling is not a capacity estimate, it is **the mechanism keeping `evidence` and
`lesson-materials` distinct media classes**.

**`allowed_mime_types` — eight types, wider than the frame draws:**
`PDF` · `PPTX` · `PPT` · `KEY` · `DOCX` · `DOC` · `PNG` · `JPEG`.

⛔ **Recorded as an OPERATOR RULING with your reason — *"a trainer preparing a class will have a
Word handout or a photo of a worksheet"* — so it does not read as drift, and so A LATER PHASE
DOES NOT NARROW IT BACK TO THE FRAME'S THREE.** The frame is a static render of three files
someone happened to upload; it is **not an inventory of permitted types**.

⚠️ Still narrow where it matters: **no video, no audio, no archive** — the half Lock §8.2 needs.
⚠️ **`PNG`/`JPEG` here are teaching material keyed to a CLASS SESSION, never to a person**, and
are **not** the §8.2 student-photo class, which is PDPA-live and stays unbuilt.

## ⚠️ `S3-00` — recorded as its own class, third in a family

It printed `PASS  S3-00  the local loopback Supabase stack was resolved` **while `54421` returned
HTTP 000**. The leg resolved *configuration*; its **name asserts reachability**.

▶ **Nothing went green only because the three mints failed one leg later. Remove that downstream
leg and `S3-00` becomes a false PASS on a dead stack.**

| Instance | Gap between name and measurement |
|---|---|
| `SC-1` | **authored** value vs the **computed** one |
| `P25-4` | policy **NAME** vs actual **readability** |
| **`S3-00`** | **reachability** vs **config resolution** |

⚠️ **A leg's name is read far more often than its body, so the name is part of the assertion.**
⛔ **Not repaired — another phase's harness**, as you instructed.

## ✅ `class_sessions_id_module_key` recorded

Two unique keys on `class_sessions`, both since Step 7E: `..._id_centre_key UNIQUE (id, centre_id)`
(the one the materials FK will use) and `..._id_module_key UNIQUE (id, class_module_id)`, which
§13 did not mention. **Neither is new.** Recorded because *"an unmentioned key found later reads
as an appearance."*

---

## VISUAL ACCEPTANCE STATUS — reported at this boundary

| Screen | Status |
|---|---|
| `12` · `13` · `26` · `27` | ✅ **ACCEPTED** at `3431981`, with its three limits |
| `25` | ⛔ **`NOT-RUN`** — `S3-M6` could not run |
| `14` | ⛔ **`NOT-RUN` — not built** |

## Next permitted action

⏸ **Restore Docker Desktop's port publication.** Then, needing no further ruling: apply `P2-6`'s
migration at `25 MiB` with the eight MIME types, build screen `14` complete, and re-run
`prove:stage3-authenticated` for `S3-M6`.

⛔ **Carried by nothing above:** any hosted or billable action · a fixture reload · editing
ratified authority · a push to `main` · public deployment · human testing · final submission ·
**the mojibake repair run** · **any query against the demonstration stack on 543xx** ·
**`supabase stop` on any project** · restarting Docker Desktop itself.
