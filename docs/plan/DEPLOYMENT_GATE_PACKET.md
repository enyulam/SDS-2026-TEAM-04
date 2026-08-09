# DEPLOYMENT GATE PACKET — public URL with a functional AI feature

> **Generated 2026-08-09 at the Stage 3 stop.** HEAD `1cb7f30`, tag `stage3-authenticated-green`.
>
> ⚠️ **THIS AUTHORIZES NOTHING.** It is an enumeration of what the Operator must decide, supply
> and perform. **Every numbered step below is a `CLAUDE.md` §12 hard gate** — hosted
> provisioning, spend, adding a remote, push, public deployment, and paid provider invocation.
> **None is carried by the `STANDING_LOCAL_EXECUTION_AUTHORIZATION`** (§15.11 excludes all of
> them explicitly), and **none is inheritable across a session boundary.**
>
> Nothing in this packet has been attempted. Hosted state is **NONE**.

---

## 0. What is already true (measured, not assumed)

| | |
|---|---|
| Local chain | **Renders for all three roles** — `prove-stage3-authenticated`: 23 PASS · 0 FAIL · 2 NOT-RUN |
| `build` | **GREEN — 17 routes** |
| Migrations | **17 on disk, 17 applied locally** |
| Real provider call path | **EXISTS** — `server/modules/ai-drafting/provider.ts:179` calls `https://api.openai.com/v1/chat/completions` |
| Real provider calls made to date | **ZERO** |
| Hosted anything | **NONE** |

---

## 1. ✅ DECISIONS — ALL RULED BY THE OPERATOR, 2026-08-09

**1.1 Supabase region — ✅ SINGAPORE (`ap-southeast-1`) CONFIRMED**, verified in the dashboard.
Irreversible and set at creation, so it was ruled first.

**1.2 Spend — ✅ ACCEPTED**, capped in the OpenAI dashboard.

**1.3 Model id — ✅ RESOLVED, AND MY CAUTION WAS WRONG.**
I flagged `gpt-5.6-terra` as unverifiable. **It is real.** One read-only `GET /v1/models` call
(1 outward request, `api.openai.com` only) returned **124 model ids**, including
`gpt-5.6-terra`, `gpt-5.6-sol`, `gpt-5.6-luna`, the `gpt-5.5`/`5.4`/`5.2`/`5.1`/`5` families,
`gpt-4.1`, `gpt-4o`, `o1`/`o3`/`o4-mini`. **`.env.example` was correct and needs no change.**
The credential in `.env.local` is valid.

**✅ 1.3a ENDPOINT COMPATIBILITY — SETTLED. This was the highest-risk unknown, and it PASSED.**

I had flagged that `provider.ts` calls `/v1/chat/completions` while 5.x reasoning models are
often driven through the Responses API. Measured, one bounded call:

| | |
|---|---|
| Model | `gpt-5.6-terra` |
| Endpoint | `POST /v1/chat/completions` — **exactly as `provider.ts:179` calls it** |
| HTTP status | **200** |
| Endpoint supported | **YES** |
| **Structured outputs** (`response_format` json_schema, `strict: true`) | **YES — parsed and validated** |
| `finish_reason` | `stop` |
| Tokens | prompt 53 · completion 11 · **total 64** |
| Outward requests | **1** (`api.openai.com` only) |
| Fallback `gpt-5.4-mini` | **NOT RUN** — unnecessary, so no second call was made |

⚠️ **The structured-outputs leg is the part that mattered.** A plain chat/completions probe
would have proven transport and **not** structured outputs, and the drafting path needs both —
that gap is precisely how a green here could have been false. The probe therefore sent the
same strict `json_schema` the real call sends.

⚠️ **NO GROUNDING VERDICT was derived from this.** It establishes **transport only**. The
drafting path did not run. **`B-G06-DET-1` remains completely untested against real prose.**

**1.4 Remote visibility — ✅ PRIVATE.** The governance corpus is **not** published. Vercel
deploys from private repositories. Revisit only for Week-14 submission.

**1.5 Who performs what — ✅ SETTLED.** The Operator performs every account-bound action
(GitHub, Vercel, Supabase dashboard, and the three fixture passwords by no-echo stdin). I
prepare, configure and verify around them. **Nothing open.**

---

## 1.6 ▶ EXECUTION PROGRESS — updated 2026-08-09

| Step | State |
|---|---|
| **(a) Pre-publication secret scan** | ✅ **CLEAN — 0 blockers.** 583 tracked files · all 3 live `.env.local` secrets searched by **exact containment** in the working tree **and across all 180 commits** · 6/6 credential-shape scans completed. One REVIEW item adjudicated a **true negative**: `run-runtime-profile.mjs:54` holds `sb_secret_synthetic_shape_fixture`, a synthetic shape literal commented *"Nothing here is a credential"*. ⚠️ **The first version of this scan reported CLEAN falsely** — `--all` was positioned after the pattern, every history search died with `fatal:`, and the `catch` treated that identically to "no match". The scan now distinguishes exit 1 (no match) from any other exit (**DID NOT RUN → BLOCKER**) |
| **(b) Private repo · remote · push** | ✅ **DONE.** `https://github.com/enyulam/best-coach-mvp` · **PRIVATE, verified two ways**: the API reports `isPrivate: true`, and an **unauthenticated** request returns **404** — the second is the check that actually proves it is not publicly readable. `main` + tag `stage3-authenticated-green` pushed |
| **(c) Vercel import + env** | 🟡 **HALF DONE.** The **fixture-mode production assertion is built and PROVEN TO FIRE** — see below. **The Vercel import itself needs your account**; the Vercel CLI is **not installed** here and installing it is a dependency decision I will not take unilaterally |
| **(d) Apply 17 migrations to hosted Supabase** | ⛔ **BLOCKED — the hosted project does not exist.** `.env.local` still points at `http://127.0.0.1:54321`. I cannot confirm the hosted database is "empty and clean" because there is nothing to connect to |
| **(e) Hosted fixture loader** | ⛔ **BLOCKED** on (d), and the loader still targets the local container — that adaptation is unwritten |
| **(f) One real AI draft + grounding verdict** | ⛔ **BLOCKED** on (d)(e) |
| **(g) Full chain through the deployed system** | ⛔ **BLOCKED** on (f) |

**✅ The production fixture-mode guard — built, and PROVEN to discriminate.**
`next.config.ts` now **fails the build** when `VERCEL_ENV=production` and
`NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE=1`. `prove-production-fixture-guard` runs a **real
`next build` in both directions**: fixture mode `"1"` → **REFUSED** (and the harness verifies
the failure carries the *authored* marker, because non-zero for an unrelated reason is not a
passing guard); fixture mode empty → **SUCCEEDED**. **2 PASS · 0 FAIL.** The positive leg is
not optional — a guard that refuses everything would also pass the negative leg and would
block the real deployment.

---

## 1.7 ✅ TRUSTED DRAFT STORE — Operator ruling, and the implementation

**The blocker.** `report_store_draft` is owner-only with **ZERO client EXECUTE** (R-27), so the
application cannot reach it through PostgREST. `LocalTrustedDraftStore` bridges that with
`docker exec` into a named local container — **which does not exist on Vercel**, so the AI
feature would have failed at its last step: provider call succeeds, grounding runs, then
persistence dies.

### ✅ RULED: option 1 — a Postgres driver. Two alternatives REJECTED, and why

| Rejected | Reason recorded by the Operator |
|---|---|
| **`service_role` EXECUTE on `report_store_draft`** | R-27 names this explicitly and **zero client EXECUTE is a hero-path non-negotiable**. `service_role` is reachable from **any** server context, so granting it **widens the exact boundary this architecture exists to demonstrate** — not 38 hours before demonstrating it |
| **Edge Function** | A new deployment surface, a new runtime and a new auth path, **none of them built**. Wrong week |

### The driver: `postgres` (postgres.js) `3.4.9`

Chosen as the smallest well-maintained option that runs on Vercel's Node runtime:

- **Zero transitive dependencies** — `npm ls` shows it as a leaf. `pg` pulls in five or six.
- **Serverless-shaped**, and critically it supports **`prepare: false`**, which Supabase's
  **transaction-mode pooler (port 6543) requires** — PgBouncer in transaction mode does not
  support session-level prepared statements, and leaving them on yields intermittent
  *"prepared statement already exists"* failures that read like application bugs.

### What was built

`HostedTrustedDraftStore` implements the **same `TrustedDraftStore` interface**.
**`LocalTrustedDraftStore` is untouched** and remains the local implementation.

**Semantic equivalence is preserved deliberately.** The local channel's `DO` block is one psql
statement in one session, so the draft store and its spec §20 source trace commit or roll back
**together**. The hosted channel reproduces that with an **explicit transaction** — both calls
inside `sql.begin()` — so a source-map failure still aborts the draft store. Failure surfaces
as the same `{ ok: false, sqlState }`. Every value is a **bound parameter**, never interpolated.
`set_config('request.jwt.claims', …)` runs in the same transaction, so the RPC still re-derives
every relationship rather than trusting a caller-supplied one.

### ✅ PROVEN — the ACL is unchanged

`npm run prove:trusted-store-acl` — **9 PASS · 0 NOT-PASS**. All four owner-only functions
exist, are owned by `postgres`, and hold **zero non-owner EXECUTE**; `anon`, `authenticated`
**and `service_role` all cannot execute `report_store_draft`**; no role gained `BYPASSRLS`.

Two things make this a real measurement rather than a restatement:

- **Existence is checked before absence.** "No grant" is trivially true of a function that
  does not exist, so a zero-row probe is reported **UNMEASURED**, never PASS.
- **A control leg proves the probe discriminates**: `authenticated` **can** execute
  `report_get_canonical`. Without it, `has_function_privilege` returning `f` everywhere would
  look identical to a correct result.

⚠️ **One assertion of mine was wrong and is recorded as such.** The first version failed,
naming `service_role` and `supabase_etl_admin` as holding `BYPASSRLS`. That is a **Supabase
platform default this architecture explicitly designs around** — the migrations say *"NOTHING
IS GRANTED TO `service_role`, EVER. It carries BYPASSRLS, so the ONLY control is zero
privilege"* (D-254). No migration here contains `BYPASSRLS`, `ALTER ROLE` or `CREATE ROLE` —
verified. The leg now pins the measured baseline and fails on any **addition**, which is the
question that actually matters.

### ✅ PROVEN — selection fails closed

`npm run prove:trusted-transport-selection` — **8 PASS · 0 FAIL**. **ABSENT · BLANK · WRONG
CASE · UPPER · UNKNOWN · PADDED all throw**; only the exact literals `local` and `hosted`
resolve. **There is no default.** The accepting cases are part of the proof: a resolver that
threw on everything would pass all six rejection legs while breaking the product.

Selection is **not** inferred from `NODE_ENV`, for a concrete reason — a local
`next build && next start` is *also* `production`, so that inference would pick the hosted
transport on a machine with no connection string.

The transport is resolved **before any provider call**, so a misconfiguration costs nothing;
deferring it would burn a billable generation and only then discover the draft cannot persist.

### 🔑 The two variables you set

| Variable | Scope | Value |
|---|---|---|
| **`BEST_COACH_TRUSTED_DRAFT_TRANSPORT`** | server-only, **never `NEXT_PUBLIC_`** | **`hosted`** in Vercel (`local` here — already set in `.env.local`) |
| **`SUPABASE_DB_POOLED_URL`** | server-only **SECRET**, **never `NEXT_PUBLIC_`** | The **POOLED** (transaction-mode, **port 6543**) string. **Not** the direct one — serverless exhausts direct connections |

⚠️ `SUPABASE_DB_POOLED_URL` embeds the database password and connects as the `postgres`
**owner**. Under a `NEXT_PUBLIC_` prefix it would hand any visitor owner-level database access.
**That takes your Vercel Production env count from six to eight.**

---

## 2. THE ORDERED SEQUENCE

Each step lists **what you do**, **what I need back**, and **the gate class**.

### Step 1 — Create the hosted Supabase project · `HOSTED` `SPEND?`

**You:** create the project, **region Singapore**, at supabase.com.

**I need back** (paste to me, except where noted):

| Value | Where it goes | Secret? |
|---|---|---|
| Project URL (`https://<ref>.supabase.co`) | `NEXT_PUBLIC_SUPABASE_URL` | no |
| Publishable / anon key | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | no |
| **Secret / service-role key** | `SUPABASE_SECRET_KEY` | ⚠️ **YES** |
| Database password | for migration push | ⚠️ **YES** |

⚠️ **DO NOT PASTE THE SECRET KEY OR DB PASSWORD INTO CHAT.** §11 is absolute in both
directions. Put them **straight into Vercel's environment settings** (Step 4) and into your
local `.env.local`, and tell me only *"done"*. I never need to see them.

**Verify:** the project's region reads **Singapore** in the dashboard *before* anything else.

### Step 2 — Apply the 17 migrations to the hosted database · `HOSTED` `DESTRUCTIVE-ADJACENT`

**You run** (from the repo root; it will prompt for the DB password — that prompt is yours,
never mine):

```
npx supabase link --project-ref <ref>
npx supabase db push
```

⚠️ `supabase link` is itself a §12 gate — it is the moment this repository points at a hosted
project.
⚠️ **Never `supabase db reset`.** Not locally, not hosted.

**I need back:** the command's summary output (it is not secret) so I can confirm **17 applied,
in order, no failure**.

**Verify:** `npx supabase migration list` shows the same 17 versions local and remote.

### Step 3 — Seed the hosted database · `HOSTED` `CREDENTIAL`

The app is useless without the centre, class grades, the nine dimensions, and the three
synthetic identities. **This is the step most likely to surprise you.**

- The 13 deterministic seed rows and the domain fixtures come from
  `scripts/fixtures/local_fixtures.sql` (+ `local_fixtures_expansion.sql`).
- **The three synthetic Auth identities need passwords entered through the no-echo interactive
  prompt** (`scripts/fixtures/load-local-fixtures.mjs`). **No agent may request, receive or
  handle them.** They are typed by you, in your terminal.
- ⚠️ The loader currently targets the **local** container. **Pointing it at a hosted project is
  work that does not exist yet** — I must adapt it, and that adaptation is itself a change I
  should make *before* you run this step.

**Tell me when you reach this step and I will prepare the hosted loader path.** Do not
improvise it.

⚠️ **These are the same three passwords blocking `B-STAGE3-2` locally.** You will need them
twice unless we sequence the local fixture reload alongside this.

### Step 4 — Vercel project and environment · `HOSTED` `PUBLIC` `SPEND?`

**You:** create the Vercel project (import the Git repo from Step 1.4, or direct upload).

**Environment variables to set** — all five, Production scope:

```
NEXT_PUBLIC_SUPABASE_URL              = https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  = <publishable key>
SUPABASE_SECRET_KEY                   = <secret key>          ⚠️ secret
LLM_PROVIDER                          = openai
LLM_MODEL                             = <the model from 1.3>
LLM_API_KEY                           = <your OpenAI key>     ⚠️ secret
```

🔴 **AND — the single most dangerous setting in this deployment:**

```
NEXT_PUBLIC_BEST_COACH_FIXTURE_MODE   = (EMPTY, or delete the variable entirely)
```

**If this is set to `1`, the deployed app composes the deterministic browser fixture: it
persists nothing, signs nobody in, and calls no AI.** That is precisely the "deterministic
fixture does not satisfy the requirement" failure. It is off by default — **leave it off, and
confirm it is absent in the Production environment.**

**Verify:** the deployed build log shows the same 17 routes the local `build` produced.

### Step 5 — Prove the AI actually responds in the deployed system · `PAID` `PUBLIC`

**This is the deliverable the brief names, so it needs positive evidence, not an assumption
that a configured key means a working feature.**

Drive, in the deployed app, as the trainer:

1. sign in → schedule → roster → assess
2. rate **all nine** dimensions → save
3. **request the draft** → a version reaches `draft_ready` with the four OD-4 panels populated
4. approve → management Approve & Submit → parent sees the submitted report

**PASS requires all of:** the four panels contain **provider-generated prose** (not fixture
text) · **grounding validation ran and did not reject it** · a `report_version` row exists with
a `content_hash` · the audit chain extended.

⚠️ **This is the first real provider call this project has ever made.** Everything before it
ran with the three selectors overwritten by the S-1 neutralising literal.

---

## 3. 🔴 LIVE RISKS — state these to yourself before demo day

**3.1 `B-G06-DET-1` — the one I would worry about most.**
Grounding rule 3's detector matched **3 of 18** tested formulations. **Real-provider prose has
never been tested against the detector at all** — every grounding proof to date ran on
deterministic fixture text. Two failure directions, both live:

- the detector **fails to catch** a genuine contradiction in real prose (a governance failure), or
- the detector **rejects legitimate real prose**, and the draft request fails **in front of the
  audience** (a demo failure).

⛔ **Do not widen the detector's lexicon to make real output pass.** That converts a genuine
result into a fabricated green, and it is expressly prohibited. If real prose is rejected, the
honest response is to report it.

**Mitigation I recommend:** run Step 5 **early**, not on demo day, so the failure mode is known.

**3.2 `B-STAGE3-2` — the local fixture database is not pristine.**
`audit_events` is append-only and irreversible; the local fixture verifier fails A19. **This
does not block deployment** (hosted is a fresh database) but it **does block the disposable
hero E2E and negative controls A–M locally**, and it needs your three passwords to resolve.

**3.3 Negative control K — `NOT SATISFIED`.** `B-C2-1` is open and undiagnosed. Untouched, per
instruction.

**3.4 Never-exercised in any environment:** the **password sign-in form** (every session to
date was admin-minted) · the **Next server-action transport** end-to-end through a browser
click · the **AI drafting + grounding pipeline**. Step 5 exercises the last two for the first
time; **Step 5 is also the first test of the sign-in form**, because a hosted deployment has no
admin-minting shortcut.

**3.5 Submission artefacts still missing:** **README is boilerplate** and **deployment
instructions do not exist**. Both are submission requirements. Recorded, not written, per
instruction.

---

## 4. What I will do the moment you authorize a step

I can, without any gate: adapt the fixture loader for a hosted target (Step 3) · write the
README and deployment instructions · prepare a deployed-system verification harness for Step 5
· fix `F-STAGE3-1`.

I will **not**, under any circumstance, do autonomously: create or link a hosted project ·
add a remote or push · deploy · place or read a secret · make a billable call.
