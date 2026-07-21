# STATUS — B.E.S.T Coach MVP

> Read this first at the start of every session (with the recent `BUILD_NOTES.md` entries). Update it last, at every accepted stopping point. Permanent continuity document (Amendment 001 A-008).

_Last updated: 2026-07-21 (Step 5B2 — governance baseline staged for commit review)._

---

## Project state

- **Project:** B.E.S.T Coach MVP
- **Current lifecycle stage:** Pre-Phase 0 — governance baseline commit pending
- **Current migration checkpoint:** Step 5B2 — governance baseline staged for commit review
- **Current implementation phase:** Phase 0 not started
- **Current permitted next action:** create and verify one local governance-baseline commit from the accepted staged set
- **Latest committed MVP HEAD:** `4de3f93c64ffea4883655f411d2f35a9a35f15d6`
- **Working-tree state:** governance baseline pending commit (seven files staged, uncommitted)
- **Remote state:** local-only, no remote, no push

### Accepted this checkpoint

- **Step 5A accepted** — governance inventory and reconciliation plan complete.
- **Step 5B1 accepted** — reconciled governance baseline installed (six files).
- **Amendment 001 is ratified** (A-001 … A-013); Specification v3 installed byte-for-byte and never edited in place.
- **Active migration copy installed** at `docs/progress/DEMO_TO_MVP_MIGRATION.md` (byte-for-byte copy of the workspace tracker).

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
- **Latest accepted commit:** `4de3f93c64ffea4883655f411d2f35a9a35f15d6` (`chore(mvp): initialize fresh Next.js scaffold`)
- **History:** one accepted scaffold commit; the governance baseline is **staged but not yet committed** (Step 5B3)
- **Remote:** none

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

## Current blockers and follow-ups

- Supabase project **not verified** (Phase −1 orchestrator setup).
- **Singapore region not verified.**
- LLM provider / API key **not verified**.
- ORM / data-layer choice **unresolved** (Prisma vs Drizzle).
- `BEST_Coach_AI_Features_Breakdown_v2.docx` **missing** — non-blocking for MVP Phases 0–4 (A-011); required before either deferred aggregate AI feature is scoped.
- **Stitch asset disposition not started** (A-013) — Stitch/UI exports installed selectively after accepted Phase 0.
- **Two moderate npm advisories** from the scaffold remain for a later reviewed security/dependency checkpoint (no auto-fix without review).
- **No real data permitted** — synthetic/seed data only (ADR-6).

---

## Next checkpoint

**Step 5B3 — create and verify the governance-baseline commit** (one local commit from the seven-file staged set; no tag, no remote, no push).
