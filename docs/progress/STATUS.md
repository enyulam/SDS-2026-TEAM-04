# STATUS — B.E.S.T Coach MVP

> Read this first at the start of every session (with the recent `BUILD_NOTES.md` entries). Update it last, at every accepted stopping point. Permanent continuity document (Amendment 001 A-008).

_Last updated: 2026-07-23 (Step 6B2D — Supabase tooling record synchronization)._

---

## Current project state

- **Project:** B.E.S.T Coach MVP
- **Lifecycle stage:** Phase 0 ready — first implementation slice planning pending
- **Migration/tooling status:** Step 6 local tooling **completed and accepted**
- **Current checkpoint:** Step 7A — Phase 0 foundation-slice planning
- **Current implementation phase:** Phase 0 not started
- **Latest accepted MVP HEAD:** `0cdb7825b0d4bcd9ad9b40323a3e90228065f006`
- **Latest accepted governance baseline:** `c7c27e5e2f772725d88fbed1b5e1459d509960ce`
- **Repository:** local-only, no tag, no remote, no push

## Completed tooling state (Step 6, accepted 2026-07-23)

- **Docker Desktop / WSL 2 accepted** — client and engine `29.6.2`, Compose `v5.3.1`, Linux engine (`x86_64`); insecure TCP 2375 disabled; Kubernetes not enabled.
- **Supabase CLI `2.109.1` installed project-locally** — exact pin in `devDependencies`, resolved identically in `package-lock.json`, no global install, invoked through `npx --no-install`.
- **Local scaffold initialized** — `supabase/config.toml` (`project_id = "best-coach-mvp"`) and `supabase/.gitignore`, committed as `0cdb782`.
- **`.env.example` committed safely** — six approved variable names, placeholder-only; only the non-secret ratified selectors (`LLM_PROVIDER=openai`, `LLM_MODEL=gpt-5.6-terra`) carry values.
- **`.env.local` protected** — ignored via `.env*`, untracked, never printed, hashed, copied, or committed; `!.env.example` is the only exception to the broad rule.
- **Local stack NOT started** — `supabase start` has never been run; 0 containers, 0 images.
- **Remote project NOT linked** — no `supabase login`, no `supabase link`, no access token on this machine.
- **Step 7A is planning only** — no implementation, no stack start, no remote linking.

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
- **Latest accepted commit:** `0cdb7825b0d4bcd9ad9b40323a3e90228065f006` (`chore(tooling): initialize local Supabase scaffold`)
- **History:** four accepted commits — `4de3f93` (scaffold) → `c7c27e5` (governance baseline) → `a39ed21` (closure synchronization) → `0cdb782` (local Supabase tooling scaffold)
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

- **Dependency advisories remain unresolved — 1 moderate and 2 high** (`next` high/direct, `sharp` high/transitive, `postcss` moderate/transitive). None is attributable to `supabase@2.109.1`. No `npm audit fix` has been run; remediation is deferred to a reviewed security/dependency checkpoint.
- **The Supabase local runtime has not yet been started** — `supabase start` belongs to Phase 0 execution.
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

---

## Next permitted action

**Perform a read-only Step 7A planning review. Do not start the local stack or implement Phase 0 yet.**

Step 7A re-reads the governing Phase 0 sections, inspects the committed local Supabase scaffold, defines the first bounded implementation slice with its tests and stopping conditions, and stops before implementation. `supabase start`, hosted-project linking, and remote migrations each require their own explicit checkpoint. No secret value may be printed, reported, or committed. Synthetic data only.
