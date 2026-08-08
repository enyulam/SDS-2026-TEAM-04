# B.E.S.T Coach — Final MVP UI Reference Pack

**Frozen visual implementation pack for the complete final MVP.**

This pack is the visual reference against which the final-MVP screens are reconstructed. It is a reference, not a deliverable of the application.

---

## What this pack contains

**36 visual-reference folders** — the complete ratified final-MVP inventory:

| Group | Count |
|---|---|
| Authentication screens (`AUTH-01` … `AUTH-03`) | **3** |
| Trainer portal screens (IDs 01–10) | 10 |
| Management portal screens (IDs 11–29) | 19 |
| Parent portal screens (IDs 30–33) | 4 |
| **Portal total** | **33** |
| **Complete pack** | **36** |

Every screen belongs to Figma file key `sSY1TYw3jyVlZDy8V2Mu7g`, file name `SDS-dashboard`, and carries an exact node ID and node-specific `/design/` URL.

Authentication IDs sit **outside** the numbered portal sequence, so portal numbering 01–33 does not shift.

---

## ✅ It lives INSIDE the main MVP repository (moved 2026-08-08)

This pack is at **`UI_REFERENCE_FINAL_MVP/` in the repository root** and is **git-tracked** — 343 files, committed and versioned. It moved there in the repository-boundary normalization so that active governance and UI authority sit on **one** versioned filesystem boundary (`CLAUDE.md` §9.1, Authority Lock §1.1).

⚠️ **The statement below is HISTORICAL and must not be followed as a current path.** Both 48H worktrees were also physically removed on 2026-08-08.

~~This pack lives at the **workspace level**, outside: the main MVP repository `SDS Project Final (BEST Coach)`; the backend worktree `worktrees/backend-48h`; the frontend worktree `worktrees/frontend-48h`; the frozen demo repository. It is **not** committed, not tracked, and not part of any branch.~~

**Still true:** nothing in this pack is application source — it creates no route, component, schema or permission, and authorizes no checkpoint.

---

## What each screen folder combines

Each of the 36 folders pairs a **frozen screenshot** with **node-specific Figma context**:

| File | Purpose |
|---|---|
| `reference.png` | **Optional** frozen local *duplicate* of the current reference in `reference/<mapped pack>/` — present in 12 of 36 packs, SHA-identical, an integrity anchor. **Not the current visual authority, and not required.** ~~The frozen visual reference — exported by the operator~~ |
| `screen.md` | Node-specific context: identity, route, scope, dependencies, precedence, acceptance checklists |
| `implementation-notes.md` | Append-only implementation record |
| `SCREENSHOT_REQUIRED.txt` | Export instruction with the exact Figma URL and node |

**The twelve core screens carry a frozen, validated pack-local `reference.png`; the twenty-four deferred screens carry no such local duplicate.** ⚠️ **That is not the same as having no reference — all 36 have a ratified current visual source in `reference/` (2026-08-08).** ~~the twenty-four deferred screens have none~~ All twelve were validated on 2026-08-06 and classified `PASS WITH NOTE — READY` — 0 failed, 0 missing (`CORE_SCREENSHOT_VALIDATION_REPORT.md`). No placeholder, empty or fake PNG has been created — a missing file is an honest missing file, and a fake one would silently pass a visual gate.

**A frozen reference is the visual *target*, not evidence a screen was built against it.** Visual acceptance remains `Not started` for all 36 screens.

---

## Frozen screenshots override later unreviewed live-Figma changes

✅ **RECONCILED 2026-08-08.** For the corresponding implementation checkpoint, **`UI_REFERENCE_FINAL_MVP/reference/<mapped pack>/` is the visual authority** (VISUAL rank 1, operator ruling PA-OD-5/5b; mapping in `SCREEN_INDEX.md`), ahead of a pack's optional frozen local `reference.png` duplicate and ahead of the live Figma canvas. ~~the frozen `reference.png` is the visual authority~~ — that ranked a file 24 of the 36 packs do not carry above the ratified frame all 36 do.

If the live canvas has moved on, that is a change to **record in `CHANGE_LOG.md` and re-freeze deliberately** — never a reason to let an implementation drift toward an unreviewed frame.

---

## Governance overrides Figma

**Figma is authoritative for the visual layer only.** It is authoritative for layout, visual hierarchy, component composition, visible fields, labels, microcopy, screen relationships, visual states and responsive behaviour where explicitly shown.

**Figma is not authoritative for functionality, authorization, security or privacy.** Specification v3, the ratified amendments, `CLAUDE.md`, the lifecycle and authorization baselines and the physical-test implementation contract govern those, and they win.

**Screen presence is not authorization.** A frame — or a control drawn on one — authorizes no lifecycle transition, role, permission, database mutation, AI operation, protected-content access, direct table access, Management power or Parent access to unpublished content. Where a screen implies governance this project has not ratified, that is recorded as a **dependency**, never invented as behaviour.

Where a frame and a ratified rule disagree, **the ratified rule wins and the discrepancy is recorded**, never silently resolved.

Full precedence rules: `GLOBAL_UI_RULES.md`.

---

## Screenshots must use synthetic data only

Every frozen screenshot, and every implementation screenshot captured against one, must contain **synthetic data only**. No real student, parent, trainer or staff datum may appear in any image in this pack. No secret, token, key or credential may appear in any image in this pack.

---

## This pack is not application source code

Nothing here is compiled, imported, deployed or executed. It creates no route, no component, no schema and no permission. It authorizes no checkpoint.

---

## Only twelve screenshots are required before the physical test

**Twelve screens block the integrated three-role walkthrough**, in this flow order:

`AUTH-01` · `05` · `06` · `07` · `08` · `10` · `AUTH-02` · `29` · `19` · `AUTH-03` · `32` · `33`

Their screenshots are **required now**. See `48H_CORE_SLICE.md` and `SCREENSHOT_CHECKLIST.md` Section A.

**The other 24 portal screenshots may be populated after the physical test.** They remain required for final-MVP completion, and deferral deletes no safeguard. See `SCREENSHOT_CHECKLIST.md` Section B.

**Do not treat all 36 as a pre-test gate, and do not drop a core screen from the twelve.**

---

## Files in this pack root

| File | Purpose |
|---|---|
| `README.md` | This file |
| `GLOBAL_UI_RULES.md` | Source precedence, shared shell rules, accessibility, ratified vocabulary |
| `SCREEN_INDEX.md` | All 36 screens with routes, nodes, URLs and statuses |
| `48H_CORE_SLICE.md` | The twelve-screen physical-test flow, in order |
| `IMPLEMENTATION_WORKFLOW.md` | The fifteen-step per-screen implementation workflow |
| `UI_PACK_MANIFEST.json` | Machine-readable manifest of the whole pack |
| `SCREENSHOT_CHECKLIST.md` | Section A — 12 required now; Section B — 24 deferred |
| `CORE_SCREENSHOT_VALIDATION_REPORT.md` | Validation evidence for the twelve frozen core references |
| **`FRONTEND_RECONSTRUCTION_PLAN.md`** | **The operational plan — ordered checkpoints F0 … F17, dependency gates, route treatments, validation matrix, blocked-state handling** |
| **`FRONTEND_RECONSTRUCTION_TRACKER.md`** | **Live per-checkpoint status for F0 … F17** |
| **`FRONTEND_STEP_REPORT_TEMPLATE.md`** | **The mandatory 20-part report every implementation checkpoint must produce** |
| `CHANGE_LOG.md` | Append-only change record |

---

## Where reconstruction is actually planned and tracked

`IMPLEMENTATION_WORKFLOW.md` gives the **general** fifteen-step per-screen workflow. The **operational** sequence — which checkpoint runs when, what gates it, which route treatment applies, and what must be reported — lives in:

- **`FRONTEND_RECONSTRUCTION_PLAN.md`** — the ordered checkpoints **F0 … F17**;
- **`FRONTEND_RECONSTRUCTION_TRACKER.md`** — their live status;
- **`FRONTEND_STEP_REPORT_TEMPLATE.md`** — the report each one ends with.

**No checkpoint is authorized by appearing in the plan.** Each requires its own operator prompt.

**Naming:** `Round F1` / `Round F2` in the frontend workstream log are the **historical** fixture-backed delivery rounds — not these checkpoints. Always write reconstruction checkpoints in full: `FRONTEND RECONSTRUCTION F4`.

---

*Scaffolded at the Final MVP UI reference-pack checkpoint from the ratified inventory `docs/plan/FINAL_MVP_UI_SCREEN_ROUTE_INVENTORY.md`, Amendment 005 (A-041 … A-048) and Amendment 006 (A-049 … A-055). No repository file, branch or Git history was changed; no Supabase, Docker, migration, fixture, build, application server or browser automation was run; no secret value was inspected; and no Figma asset was scraped, exported or downloaded to produce it.*
