# Implementation Workflow — Final MVP UI Reference Pack

The per-screen workflow. **Fifteen steps, in order, for one screen at a time.**

> **This file is the general workflow. The operational plan is separate.**
>
> | File | Role |
> |---|---|
> | **`FRONTEND_RECONSTRUCTION_PLAN.md`** | The ordered checkpoints **F0 … F17** — dependency gates, per-checkpoint route treatments, the validation matrix and blocked-state handling. **Its §8 per-step contract is the operational form of the fifteen steps below.** |
> | **`FRONTEND_RECONSTRUCTION_TRACKER.md`** | Live status, reference checksums and starting commits for each checkpoint |
> | **`FRONTEND_STEP_REPORT_TEMPLATE.md`** | The mandatory 20-part report each checkpoint ends with |
>
> Where this file describes *how* to do one screen, the plan describes *which* screen, *when*, and *what must be cleared first*. **Follow both.** No checkpoint is authorized by appearing in either.
>
> **Naming:** `Round F1` / `Round F2` in `docs/workstreams/48H_FRONTEND_PROGRESS.md` are the **historical** delivery rounds — not the reconstruction checkpoints. Always write those in full: `FRONTEND RECONSTRUCTION F4`.

---

## Sequencing rule

**The 12 core screens are implemented screen by screen, and completed, before any work begins on the 24 deferred screens.**

Core order is the physical-test flow order in `48H_CORE_SLICE.md`: `AUTH-01` · `05` · `06` · `07` · `08` · `10` · `AUTH-02` · `29` · `19` · `AUTH-03` · `32` · `33`.

Do not batch screens. Do not start a deferred screen because a core screen is blocked — record the blocker and continue with the next core screen.

---

## The fifteen steps

> ⚠️ **STEPS 1–3 ARE SUPERSEDED FOR EVERY SCREEN THAT ALREADY HAS A RATIFIED `/reference/` FRAME — which is all 36 (2026-08-08).**
>
> **Do not start at step 1.** The current visual source is **`UI_REFERENCE_FINAL_MVP/reference/<mapped pack>/`** (mapping: `SCREEN_INDEX.md`), promoted to VISUAL rank 1 by operator ruling PA-OD-5/5b. **No export is required, and a live re-export must never replace a ratified asset** — it can only import post-freeze canvas drift.
>
> **Step 3's *"if the file is missing, stop and report"* must NOT be applied to a missing pack-local `reference.png`.** That file is an **optional frozen duplicate**, present in 12 of 36 packs. Its absence is **not** a missing reference and **not** a blocker — begin at **step 4** using `/reference/`. Steps 1–3 apply only if a future export is explicitly authorized for a screen that genuinely has no ratified frame.

### 1. The operator exports the exact Figma frame

The **exact node-specific frame** for the screen, from file key `sSY1TYw3jyVlZDy8V2Mu7g` (`SDS-dashboard`), at the node recorded in `screen.md`. **An overview-canvas screenshot is not acceptable.** Export at native frame dimensions, 1×, PNG. Synthetic data only.

### 2. The operator saves it as `reference.png` in the matching folder

One file, named exactly `reference.png`, in that screen's folder. No placeholder, empty or fake PNG is ever created — by the operator or by an agent.

### 3. The agent verifies file type and native dimensions

Confirm the file is a real PNG and read its native pixel dimensions. Record the dimensions in `screen.md` section 3. If the file is missing, is not a PNG, or is an overview-canvas capture, **stop and report** — do not proceed on a substitute.

### 4. The agent reads `screen.md`

The whole file: identity, scope membership, precedence, responsibility, implementation status, dependencies, vocabulary status and all three acceptance checklists.

### 5. The agent retrieves the exact node-specific Figma design context

Using the node ID and node-specific `/design/` URL in `screen.md` — never an overview canvas, never a neighbouring frame. Where a required frame, asset, interaction state, responsive state or visible field definition is missing, **stop and request orchestrator input**.

### 6. The agent audits the existing route, components and port/state behaviour

What route exists today, what components serve it, what DTOs and ports it consumes, what state it holds and where. Record the audit in `implementation-notes.md`.

### 7. The agent preserves governed functionality

Everything in `screen.md` section 6 "Existing functionality to preserve" still works when the step is done. **Visual reconstruction never removes a governed behaviour**, a server-side check, an immutability rule or an authorization proof.

### 8. The agent creates missing frontend architecture where authorized

Routes, layouts, components and states that serve **already-governed** behaviour. Nothing that requires new backend behaviour, a new permission or an unratified rule.

### 9. The agent records missing backend or governance requirements rather than inventing them

A missing read path, write path, projection, RPC, table, field inventory or ratified rule is recorded as a **dependency** in `implementation-notes.md` and in `screen.md` section 7. **It is never invented, stubbed as if real, faked client-side or inferred from a frame.** A blocked screen reported honestly is fine.

### 10. The agent renders at the Figma reference viewport

The same viewport the frame was designed at, so before and after are comparable.

### 11. The agent saves `implementation-before.png`

Captured in that folder, at that viewport, **before** any visual correction. Synthetic data only.

### 12. The agent corrects visual differences

Against the precedence order (reconciled 2026-08-08): **`reference/<mapped pack>/` → the pack's optional frozen local `reference.png` duplicate → node-specific Figma context (only where no ratified asset exists) → existing frontend implementation.** ~~frozen `reference.png` → node-specific Figma context → existing frontend implementation~~ Where the frame and a ratified rule disagree, **the rule wins and the discrepancy is recorded**.

### 13. The agent saves `implementation-after.png`

Same folder, same viewport, **after** correction. Synthetic data only.

### 14. The agent records implementation notes and validation

Append one entry to `implementation-notes.md` using its template — timestamp (Asia/Singapore), branch, starting commit, route audited, components preserved / replaced / created, DTO and port changes, fixture changes, backend dependencies discovered, vocabulary dependencies, governance blockers, viewport, before and after screenshots, validation performed, ending commit, acceptance status. Then work the three checklists in `screen.md` sections 9, 10 and 11 and record the acceptance state in section 12.

### 15. The agent commits one bounded checkpoint

**One screen, or one tightly coupled shared-shell checkpoint** — for example the three login frames over one shared shell. Never a batch of unrelated screens. The commit message names the screen ID, the node and the acceptance state.

---

## What this workflow never does

- It never creates a fake, empty or placeholder `reference.png`.
- It never accepts an overview-canvas screenshot as a node-specific frame.
- It never invents a backend path, a field, a permission or a governance rule.
- It never resolves a frame-versus-governance conflict locally.
- It never lets an implementation drift toward an unreviewed live-Figma change — that is a `CHANGE_LOG.md` entry and a deliberate re-freeze.
- It never performs the competency-vocabulary rename inside a visual checkpoint. That is Backend V2 / Frontend V3, each separately authorized.
- It never uses real personal data in any screenshot.

---

*Governed by `GLOBAL_UI_RULES.md`, Specification v3, Amendments 001–006, `CLAUDE.md`, the ratified lifecycle and authorization baselines and the physical-test implementation contract.*
