# STATUS — B.E.S.T Coach MVP

> Read this first at the start of every session (with the recent `BUILD_NOTES.md` entries). Update it last, at every accepted stopping point. Permanent continuity document (Amendment 001 A-008).

_Last updated: 2026-07-30 (Step 7D — Supabase environment and client boundaries implemented and committed as `455a070`; record synchronization staged, closure commit approval pending; Step 7E blocked, Step 7E0 next)._

---

## Current project state

- **Project:** B.E.S.T Coach MVP
- **Lifecycle stage:** Phase 0 in progress — client boundaries implemented, database foundation blocked pending ratification
- **Migration/tooling status:** Step 6 local tooling **completed and accepted**
- **Current checkpoint:** Step 7E0 — Data-layer governance and first-migration ratification
- **Checkpoint status:** Pending — authorization required
- **Current implementation state:** local Supabase runtime **verified**; Supabase **environment and client boundaries implemented** (browser-safe, request-scoped server, and elevated server-only factories; `server-only` isolation proven by a negative build); all six approved environment variables validated; **no query, Auth flow, migration, schema, RLS, or audit implementation yet**
- **Environment/client boundaries:** implemented (Step 7D)
- **Schema, Auth, RLS, and audit:** not started
- **Step 7E:** blocked pending formal data-layer, identity, status, audit-design, and GRANT decisions
- **Latest accepted substantive MVP HEAD:** `455a0706b5555c0b4f083327dfd5613d3aa23245`
- **Runtime dependencies (exact-pinned):** `@supabase/ssr` `0.12.3`, `@supabase/supabase-js` `2.110.8`, `server-only` `0.0.1`; **Supabase CLI** `2.109.1` (project-local, exact-pinned)
- **Latest accepted governance baseline:** `c7c27e5e2f772725d88fbed1b5e1459d509960ce`
- **Repository:** local-only, clean, no tag, no remote, no push

## Phase 0 progress (Steps 7A–7D, accepted 2026-07-23 to 2026-07-30)

- **Step 7A completed and accepted** — read-only planning produced the requirement matrix, the accepted 7B–7L checkpoint sequence, and four recorded unresolved findings. No repository or runtime mutation occurred.
- **Step 7B completed after Windows-specific remediation** — the first attempt correctly failed its service-health gate because Vector crash-looped; the accepted fix disabled optional local Analytics/Vector and ignored `supabase/snippets/`, committed as `25551c5`.
- **Required local services are healthy** — Kong (API gateway), PostgreSQL, Studio, Auth, Storage, Realtime, Mail, Postgres Meta, REST and Edge Runtime: 10 containers, **0 unhealthy, 0 restarting**.
- **Analytics and Vector disabled locally** — optional, and incompatible with the accepted Windows security posture.
- **Docker TCP 2375 remains disabled** — enabling it was evaluated and rejected as a security regression.
- **PostgreSQL 17 verified** — `public` schema contains **0 application tables**.
- **Local stack currently stopped** — 0 containers; 13 images and 3 volumes retained for fast restart.
- **Hosted project not linked** — no `supabase login`, no `supabase link`, no access token on this machine.
- **Application client boundaries now exist (Step 7D) but perform no query** — no migrations, Auth users, RLS, or audit chain exist yet.
- **Step 7C is completed and accepted (2026-07-24)** — Supabase runtime dependencies (`@supabase/ssr` `0.12.3`, `@supabase/supabase-js` `2.110.8`, `server-only` `0.0.1`) exact-pinned, installed and verified; typecheck/lint/build passed; only `package.json` and `package-lock.json` committed as `ffd9eef`; **no clients, migrations, or source code** were created.
- **Step 7D is completed and accepted (2026-07-30)** — explicit local-versus-hosted environment selection and the three Supabase client boundaries (browser-safe `createBrowserClient`, request-scoped server `createServerClient`, and a separate elevated server-only client) implemented; `server-only` isolation proven by a **negative production build** (a Client Component importing the elevated factory failed the build with exit code 1); all six approved environment variables validated (opaque inputs only — no value rendered, logged, or reported); typecheck/lint/build passed with zero warnings; client-bundle private-name isolation passed (0 occurrences of `SUPABASE_SECRET_KEY`/`LLM_PROVIDER`/`LLM_MODEL`/`LLM_API_KEY` in `.next/static`); only the five implementation files committed as `455a070` (5 files, 363 insertions, 0 deletions); **no query, Auth flow, migration, schema, RLS, audit chain, or hosted operation** occurred.
- **Step 7E (first governed SQL migration and database foundation) is blocked** — it cannot begin until the recorded data-layer (Supabase-native vs Prisma/Drizzle), identity (`public` profile ↔ `auth.users`), report-status, audit-design (target, scope, SHA-256, genesis), and table-GRANT decisions are formally ratified.
- **Step 7E0 (data-layer governance and first-migration ratification) is the next checkpoint** — planning/governance only; it defines the first migration's exact tables, enums, foreign keys, grants, and audit primitives and produces a bounded Step 7E plan. **No schema is authorized.**

## Completed tooling state (Step 6, accepted 2026-07-23)

- **Docker Desktop / WSL 2 accepted** — client and engine `29.6.2`, Compose `v5.3.1`, Linux engine (`x86_64`); insecure TCP 2375 disabled; Kubernetes not enabled.
- **Supabase CLI `2.109.1` installed project-locally** — exact pin in `devDependencies`, resolved identically in `package-lock.json`, no global install, invoked through `npx --no-install`.
- **Local scaffold initialized** — `supabase/config.toml` (`project_id = "best-coach-mvp"`) and `supabase/.gitignore`, committed as `0cdb782`.
- **`.env.example` committed safely** — six approved variable names, placeholder-only; only the non-secret ratified selectors (`LLM_PROVIDER=openai`, `LLM_MODEL=gpt-5.6-terra`) carry values.
- **`.env.local` protected** — ignored via `.env*`, untracked, never printed, hashed, copied, or committed; `!.env.example` is the only exception to the broad rule.

## Completed governance state

- **Step 5A accepted** — governance inventory and reconciliation plan complete.
- **Step 5B1 accepted** — reconciled governance baseline installed.
- **Step 5B2 accepted** — active migration copy installed; governance baseline staged and reviewed.
- **Step 5B3 accepted** — governance baseline committed as `c7c27e5`.
- **Specification v3 installed unchanged** (byte-for-byte, `64d54aa2…`); never edited in place.
- **Amendment 001 ratified** (A-001 … A-013).
- **Root `CLAUDE.md` and the Implementation Plan reconciled** to Amendment 001.
- **Active migration record synchronized** at `docs/progress/DEMO_TO_MVP_MIGRATION.md`.
- **Permanent `STATUS.md` and `BUILD_NOTES.md` active** and updated at every accepted stopping point.

---

## Accepted repository baselines

### Frozen demo (reference-only)

- **Path:** `C:\Users\enyul\Vibe Studio\B.E.S.T-Coach-Workspace\SDS Project Sprint 2`
- **Branch:** `main`
- **Commit:** `8d4acf4abc5039c24da01be773ab1a5e4916080f`
- **Tag:** `demo-freeze-step14-2026-07-21`
- **Note:** frozen at completed Step 14; **Step 15 intentionally skipped**; **reference-only** — never a source of MVP architecture (see `CLAUDE.md` §13).

### Fresh MVP (this repository)

- **Path:** `C:\Users\enyul\Vibe Studio\B.E.S.T-Coach-Workspace\SDS Project Final (BEST Coach)`
- **Branch:** `main`
- **Latest accepted substantive commit:** `455a0706b5555c0b4f083327dfd5613d3aa23245` (`feat(platform): add Supabase client boundaries`)
- **History:** ten accepted commits — `4de3f93` (scaffold) → `c7c27e5` (governance baseline) → `a39ed21` (closure synchronization) → `0cdb782` (local Supabase tooling scaffold) → `a83ec7a` (tooling closure records) → `25551c5` (Windows local-stack remediation) → `329f03c` (Phase 0 runtime foundation records) → `ffd9eef` (Supabase runtime dependencies) → `5d10bd0` (runtime dependency records) → `455a070` (Supabase client boundaries)
- **Remote:** none (no tag, nothing pushed)

---

## Ratified governance

- **Source-of-truth hierarchy (highest first):** Specification v3 → ratified amendments (Amendment 001) → root `CLAUDE.md` → Implementation Plan (procedural) → Stitch/UI reference (visual only) → `STATUS.md` → `BUILD_NOTES.md` → temporary migration tracker.
- **Amendment 001:** Ratified 2026-07-21 (`docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_001.md`); supersedes only the clauses named in its supersession table (A-001 … A-013).
- **Toolchain (A-006):** Node 24 LTS (`.nvmrc` `24`, engines `>=24 <25`), npm `11.13.0`; Next.js App Router, TypeScript, Tailwind, ESLint, Turbopack; root `/app`; React Compiler off.
- **Git (A-005):** local-only; no remote/push unless the orchestrator explicitly requests it.
- **Evidence phasing (A-001/A-002/A-003):** Phase 1 parent report is text-only; gated parent evidence access (linked child + `Submitted` + consent + short-TTL signed URL) is implemented and tested in Phase 2.
- **Audit (A-007/A-010):** Phase 0 = append-only DB audit table + hash chain, mutation denial verified via restricted role / `SET ROLE`; Phase 4 = independent retention-locked external mirror.
- **Continuity (A-008):** `STATUS.md` **and** `BUILD_NOTES.md` are both permanent and updated at every accepted stopping point.
- **Testing/a11y (A-009):** Vitest + React Testing Library + Playwright pre-approved; Lighthouse first for accessibility.

---

## Current follow-ups

- **Current npm advisories remain unresolved — 3 high and 0 moderate** (`next` high/direct; `postcss` and `sharp` high/transitive, both through `next`). None is attributable to `supabase@2.109.1`, `@supabase/ssr`, `@supabase/supabase-js`, `server-only`, or their transitive packages; the shift from 1-moderate/2-high reflects npm advisory-database movement raising `postcss` to high, not a dependency change. No `npm audit fix` has been run; remediation is deferred to a reviewed security/dependency checkpoint.
- **Formal data-layer governance reconciliation required before Step 7E — now blocking** — Specification v3 §18 and `CLAUDE.md` §9 describe a typed client (Prisma or Drizzle), while the accepted Supabase-native / no-ORM decision is recorded only in the lowest-precedence document. An Amendment 002 or an explicit `CLAUDE.md` edit is required; Step 7D (client boundaries) did not depend on it, but it **now blocks the first migration** and is a Step 7E0 ratification item.
- **Schema, identity, audit, and grant decisions must be ratified before Step 7E (Step 7E0 scope)** — the first migration's exact table and enum scope; the `public` profile table's relationship to `auth.users`; audit target representation; report-status storage values; audit-chain scope; audit SHA-256 algorithm; audit genesis representation; and a deliberate GRANT strategy for newly created tables.
- **Hosted project linking remains deferred** — `supabase login` / `supabase link` require a separate explicit checkpoint.
- `BEST_Coach_AI_Features_Breakdown_v2.docx` **remains missing** — **non-blocking** for MVP Phases 0–4 (A-011); required before either deferred aggregate AI feature is scoped.
- **Stitch disposition remains pending and non-blocking** (A-013) — Stitch/UI exports installed selectively after accepted Phase 0.
- **No real data permitted** — synthetic/seed data only (ADR-6).

### Resolved since the previous update

- ~~Supabase project creation not yet verified~~ — orchestrator-confirmed (Step 6A2).
- ~~Singapore region not yet verified~~ — orchestrator-verified as `ap-southeast-1` (Step 6A2).
- ~~Supabase credentials not yet verified locally~~ — presence-only verification passed; values never printed or committed.
- ~~LLM provider and API key not yet verified locally~~ — OpenAI / `gpt-5.6-terra`; key present locally.
- ~~ORM / data-access decision unresolved~~ — resolved: **Supabase-native, no general-purpose ORM**.
- ~~`.env.local` and `.env.example` contract not yet verified~~ — six-variable contract verified; `.env.example` committed placeholder-only; `.env.local` ignored and untracked.
- ~~Supabase client/environment boundaries not yet implemented~~ — resolved (Step 7D): browser-safe, request-scoped server, and elevated server-only factories implemented with explicit local/hosted selection and proven `server-only` isolation; committed as `455a070`.

---

## Next permitted action

**Perform the Step 7D3 record-synchronization commit and final tracker acceptance first; then perform a planning-only Step 7E0 review (Data-layer governance and first-migration ratification).**

Step 7E0 reconciles the accepted Supabase-native / no-general-purpose-ORM decision with the governance documents; defines the first migration's exact tables, enums, foreign keys, grants, and audit primitives; ratifies the unresolved identity (`public` profile ↔ `auth.users`), report-status, audit (target, scope, SHA-256, genesis), and GRANT decisions; determines whether Amendment 002 and/or a `CLAUDE.md` correction is required; and produces a bounded implementation plan for Step 7E.

**No schema work is currently authorized.** Step 7E (first governed SQL migration and database foundation) remains **blocked** until the Step 7E0 ratification is approved. Step 7E0 makes no repository, governance, schema, dependency, runtime, or hosted change; `supabase login` / `supabase link` remain deferred. No secret value may be printed, reported, or committed. Synthetic data only.
