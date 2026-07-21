# STATUS — B.E.S.T Coach MVP

> Read this first at the start of every session (with the recent `BUILD_NOTES.md` entries). Update it last, at every accepted stopping point. Permanent continuity document (Amendment 001 A-008).

_Last updated: 2026-07-22 (Step 5B4 — governance closure synchronization)._

---

## Current project state

- **Project:** B.E.S.T Coach MVP
- **Lifecycle stage:** Pre-Phase 0 — orchestrator prerequisites pending
- **Migration status:** Step 5 governance installation **completed and accepted**
- **Current checkpoint:** Step 6A — Orchestrator prerequisite and architecture-decision inventory
- **Current implementation phase:** Phase 0 not started
- **Latest accepted governance baseline:** `c7c27e5e2f772725d88fbed1b5e1459d509960ce`
- **Repository:** local-only, no tag, no remote, no push

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
- **Latest accepted commit:** `c7c27e5e2f772725d88fbed1b5e1459d509960ce` (`docs(governance): install reconciled MVP baseline`)
- **History:** two accepted commits — `4de3f93` (scaffold) → `c7c27e5` (governance baseline)
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

## Current blockers

- **Supabase project creation not yet verified** (orchestrator-only action).
- **Singapore region not yet verified.**
- **Supabase credentials (URL, anon key, service-role key) not yet verified locally** — presence only will be checked; values are never printed or committed.
- **LLM provider and API key not yet verified locally** — presence only.
- **ORM / data-access decision unresolved** (to be resolved in Step 6A before Phase 0).
- **`.env.local` and `.env.example` contract not yet verified** (variable names defined in Step 6A; `.env.example` placeholders only).
- `BEST_Coach_AI_Features_Breakdown_v2.docx` **missing** — non-blocking for MVP Phases 0–4 (A-011); required before either deferred aggregate AI feature is scoped.
- **Stitch asset disposition not started** (A-013) — Stitch/UI exports installed selectively after accepted Phase 0.
- **Two moderate npm advisories** from the scaffold remain for a later reviewed security/dependency checkpoint (no auto-fix without review).
- **No real data permitted** — synthetic/seed data only (ADR-6).

---

## Next permitted action

**Perform a read-only Step 6A prerequisite inventory and architecture-decision review. Do not start Phase 0 implementation.**

Claude Code cannot create the Supabase project or perform browser/OAuth setup — those remain orchestrator-only. No secret value may be printed, reported, or committed. Stitch assets and the missing AI Features Breakdown do **not** block Phase 0.
