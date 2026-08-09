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

## 1. ⛔ DECISIONS I NEED FROM YOU FIRST — one of them is irreversible

**1.1 Supabase region — IRREVERSIBLE, SET AT CREATION.**
ADR-6 pins **Singapore**. The region **cannot be changed after the project is created**;
getting it wrong means **re-provisioning, not reconfiguring**. Confirm: *Singapore
(`ap-southeast-1`)*.

**1.2 Do you accept spend?** Supabase and Vercel both have free tiers that plausibly suffice,
but **cost is not the trigger — leaving this machine is**. The **OpenAI API key is
definitely billable.** I need an explicit yes.

**1.3 Which OpenAI model?** `.env.example` currently carries `LLM_MODEL=gpt-5.6-terra`, which
I cannot verify as a real model id your key can reach. **Give me the exact model string** your
account has access to. A wrong model id fails at the first draft request, in front of the
audience.

**1.4 GitHub remote.** Vercel's normal path deploys from a Git remote. There is **no remote
today (remotes: 0)**. Confirm: create a repository, and **public or private?**
⚠️ **Pushing this repository publishes the entire governance corpus and all build notes.**
If that is not intended, say so — the alternative is Vercel's direct upload path.

**1.5 Who performs the steps?** Every step below needs a browser, an account, or a credential.
**I cannot do any of them.** I can prepare files, write config, and verify results *after* you
act.

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
