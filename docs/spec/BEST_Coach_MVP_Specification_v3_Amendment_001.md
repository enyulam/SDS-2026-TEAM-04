# B.E.S.T Coach — MVP Specification v3 Amendment 001

**Status:** Ratified by orchestrator
**Ratification date:** 2026-07-21
**Amends:** `BEST_Coach_Complete_MVP_Specification_v3.md` (this repository, `docs/spec/`)

---

## Relationship to Specification v3

Specification v3 remains the **authoritative baseline** for this build. This amendment records orchestrator-ratified decisions that **supersede only the specific clauses named in the supersession table below**. Every v3 clause not identified here remains in force, unchanged.

Where this amendment and v3 disagree on a superseded clause, **this amendment wins for that clause only**. `CLAUDE.md` (the standing agent contract) and the Implementation Plan must agree with v3 as amended by this document; if any of them still contains superseded wording, the wording in this amendment governs and the stale text is to be treated as historical.

Precedence (highest first): **v3 → ratified amendments (this document) → `CLAUDE.md` → Implementation Plan → Stitch/UI reference → `STATUS.md` → `BUILD_NOTES.md` → temporary migration tracker.**

---

## Supersession table

| Amendment | v3 section(s) / clause superseded | Other documents affected | Effect |
|---|---|---|---|
| A-001 | §21 "Evidence access" — "parents never receive evidence URLs" (absolute) | `CLAUDE.md` §6 (gated parent-evidence feature), §10 Phase 2 exit | Absolute prohibition → gated same-child access |
| A-002 | §26 Phase 1 / Phase 2 boundary; §8 parent screens | `CLAUDE.md` §10 Phase 1/2; Plan Phase 1/2 | Phase 1 parent report text-only; evidence access is Phase 2 |
| A-003 | §26 Phase 2 exit — "a parent can never reach an evidence URL" | `CLAUDE.md` §10 Phase 2 exit; Plan Phase 2 exit | Absolute exit → gated exit (permitted vs prohibited paths) |
| A-004 | §26 Phase 1 exit implications; Parent UAT | Plan §5.2 Parent UAT | UAT tests permitted linked-child access **and** prohibited paths |
| A-005 | — (v3 §25 is tool-agnostic) | `CLAUDE.md` §10 pre-Phase-0; Plan Phase −1 | GitHub-first setup → local-only Git; remote optional/later |
| A-006 | — (v3 does not pin a Node major) | `CLAUDE.md` §2 stack; Plan Phase −1 ("Node 20 LTS") | Ratified Node 24 toolchain supersedes Node 20 recommendation |
| A-007 | §23 "Independent mirror"; §17 diagram ("retention-locked" mirror) | `CLAUDE.md` §4/§10 Phase 4 | Phase 0 = DB audit + hash chain; external mirror = Phase 4 |
| A-008 | §26 (continuity docs unspecified) | `CLAUDE.md` §11 (STATUS.md only); Plan Phase 0 | `STATUS.md` **and** `BUILD_NOTES.md` are permanent, both mandatory |
| A-009 | §19/§25 (test/a11y tooling) | `CLAUDE.md` §11; Plan §5.3 (axe-core **or** Lighthouse) | Vitest/RTL/Playwright pre-approved; Lighthouse first for a11y |
| A-010 | §23 (audit enforcement); §14 | `CLAUDE.md` §3.6; Plan Phase 0 checklist | Audit-mutation denial verified via restricted role / `SET ROLE` |
| A-011 | §28 / §28.1–28.2 (companion doc reliance) | `CLAUDE.md` §1/§8 | AI Features Breakdown v2 currently unavailable; non-blocking for MVP |
| A-012 | — (clarification, no v3 change) | Plan (authority note) | Implementation Plan is procedural; cannot override spec/amendment |
| A-013 | §7 / §8 Stitch handling (install timing) | `CLAUDE.md` §1/§7/§10; Plan Phase −1 | Stitch installed selectively **after** accepted Phase 0, not at setup |

---

## A-001 — Parent evidence access

> ✅ **ACTIVATED 2026-08-11 BY OPERATOR RULING `D-5`** (`FINAL_MVP_PORTAL_DECISIONS.md`, repository root; Authority Lock §2.3). **A-001 was RATIFIED BUT ARMED AND UNACTIVATED** — Authority Lock §8.1 had ruled the parent evidence projection **OUT** of the Final MVP, so this clause's gates stood ready with nothing to gate. **`D-5` authorizes per-child video evidence with the linked Parent as one of its three audiences, so the projection is IN and these gates are LIVE.**
>
> ⛔ **NOTHING IN THIS CLAUSE IS WEAKENED — ACTIVATION IS NOT RELAXATION.** All the gates below apply **in full**, and `A-003`'s prohibited-path proofs and `A-004`'s both-direction Parent UAT come with them.
>
> **`D-5` adds four constraints on top of these gates, not instead of them:** the subject is the **individual child** whose report it is, never class footage · the ruled uploader is the **Trainer**, at assessment time · the object is tagged to **exactly one session report** and can never be moved or reused · ⛔ **there is NO download affordance for any role, including Parent.**
>
> ⚠️ **The retrievability limitation is stated, never denied.** Streamed video is technically retrievable by a determined user with browser tooling. The product provides no download affordance; **it does not claim technical impossibility, and no surface may say otherwise.**
>
> ⛔ **`Q-27` IS A DIFFERENT BOUNDARY AND DOES NOT MOVE.** `D-5` concerns evidence media; the nine per-dimension ratings still never reach a Parent session in any form.
>
> ⛔ **`D-5` authorizes no evidence schema, bucket, policy, grant, RPC, audit action string, migration or UI**, and **`A-014` is unchanged — the TA persona stays deferred and `centre_membership_role` is NOT extended.**

Supersedes any **absolute** statement that parents can never receive evidence access (v3 §21 "parents never receive evidence URLs").

**Ratified rule.** A parent may access **only their linked child's** evidence, and only when **all** of the following pass:

1. the associated report status is `Submitted`;
2. ~~valid `evidence_media` consent exists for that child (§22);~~ ✅ **AMENDED 2026-08-11 BY OPERATOR RULING `C-2`** (`FINAL_MVP_PORTAL_DECISIONS.md` §C — PORTAL COMPLETION RULINGS): **consent is recorded ONCE AT THE CENTRE, not per media item and not per child.** The struck text assumed **per-record** consent; the actual arrangement is **academy-level consent, already in place for existing practice** and confirmed with iSpeak Academy at `D-5`. ⛔ **NO `consent_records` TABLE IS CREATED** — Phase-0 ruling `G-05` ruled it out, `CLAUDE.md` §3.1 records that no PDPA table exists and none may be created without an amendment, and this ruling **does not create one**. The gate is satisfied by the centre-level arrangement being in force, evidenced in governance, **not by a per-object lookup**. ⚠️ **This narrows what the gate CHECKS; it does not remove the requirement that the arrangement exist.**
3. the requesting account has a live `parent_child_link`;
4. the evidence belongs to that child and that report context;
5. ~~the object has passed the required scan/status checks (`scan_status`);~~ ⛔ **GATE REMOVED 2026-08-11 BY OPERATOR RULING `C-3`** (same instrument). **No scanning infrastructure exists and none will be built.** ⚠️ **`scan_status` had no ratified vocabulary anywhere** (Authority Lock §8.2) and Phase-0 ruling `G-05` prohibits a **fake scan state** — so the gate could only ever have been satisfied by inventing one. ▶ **AN HONEST ABSENCE BEATS A SATISFIED-LOOKING GATE.** **THE LIMITATION IS RECORDED, NOT HIDDEN: uploaded media is NOT SCANNED for malware or harmful content, and a production deployment would require scanning before real media is handled.** This must be stated **in the product's own UI text on every upload surface**, not only here. **Every other gate in this list is unchanged and applies in full.**
6. access is via a **short-TTL, server-minted signed URL**;
7. direct bucket access, raw storage-path access, public-object access, and any unrelated-child access remain **prohibited**.

The application does **not** verify whether a recording contains only one child; single-child framing remains an operational filming-process requirement, not a code-level guarantee.

⚠️ **THE TWO LIMITATIONS THIS CLAUSE NOW CARRIES, STATED TOGETHER SO NEITHER IS READ AS AN OVERSIGHT.** Uploaded media is **not scanned** (`C-3`), and the application **does not verify single-child framing** (the paragraph above). Both are **known, ruled and recorded**; neither is a defect to be "fixed" by a later phase inventing a mechanism. **A production deployment would require the first.**

This reconciles v3 §21 with the gated parent-evidence feature already described in `CLAUDE.md` §6(2): the feature stands, precisely because it is fully gated.

## A-002 — Evidence phase ordering

- **Phase 1** parent report is **text-only** (the prose panels in §8; no media).
- Phase 1 may establish schema or typed service interfaces required later, but **must not expose evidence media to parents**.
- **Phase 2** owns TA upload/re-upload, private storage, consent enforcement, scan status, evidence-gated approval, and signed-URL access.
- **Actual parent evidence access is first implemented and tested in Phase 2**, never Phase 1.

## A-003 — Corrected Phase 2 exit condition

Replaces the absolute v3 §26 Phase 2 exit ("a parent can never reach an evidence URL") and the equivalent `CLAUDE.md` §10 / Plan Phase 2 wording.

**Corrected exit:**
- **Must fail:** unauthorized, unrelated-child, pre-`Submitted`, ~~unconsented, unscanned,~~ expired-URL, direct-storage-path, and public access.
- **May succeed:** a correctly linked parent retrieving **only their child's** `Submitted`, consented evidence through a valid **short-TTL, server-minted signed URL**.

> ⚠️ **CONSEQUENTIAL AMENDMENT, 2026-08-11 — operator rulings `C-2` and `C-3`, propagated here because this clause RESTATES A-001's gates and would otherwise stand demanding proofs that now have no referent.**
>
> - **`unscanned` is STRUCK.** `C-3` removed the scan gate outright, so there is **no unscanned state to refuse**. ⛔ **Leaving this leg standing would have been worse than removing it:** a must-fail leg with nothing to test either fails forever or is quietly marked `PASS` against a condition that cannot arise — **the `S-8` defect exactly, on a refusal proof.** Report it **`NOT APPLICABLE (C-3)`**, never `PASS`.
> - **`unconsented` is STRUCK AS A PER-RECORD PROOF and survives in a different form.** Under `C-2` consent is **centre-level**, so there is no per-object consent flag to withhold in a test. What remains provable is that **the centre-level arrangement is in force**; that is a governance precondition, not a per-request refusal path.
> - ⛔ **EVERY OTHER MUST-FAIL LEG IS UNCHANGED AND STILL MANDATORY** — unauthorized, unrelated-child, pre-`Submitted`, expired-URL, direct-storage-path and public access. **A-003's both-direction shape is undiminished**, and its permitted leg is now live under `D-5`.

## A-004 — Corrected Parent UAT

Parent UAT (Plan §5.2) must test **both** directions:

- **Permitted:** access for the linked child when every A-001 gate passes.
- **Refused:** another child's evidence; before `Submitted`; ~~without `evidence_media` consent;~~ via direct storage paths; with an expired or tampered signed URL.
- **Absent from the parent view:** drafts, internal notes, raw per-dimension ratings, and AI draft history.

> ⚠️ **CONSEQUENTIAL AMENDMENT, 2026-08-11 — operator ruling `C-2`, for the same reason recorded at A-003.** Consent is now **centre-level**, so *"without `evidence_media` consent"* has no per-participant state a UAT session could construct. ⛔ **Every other refusal leg is unchanged and still mandatory**, and the **both-direction requirement is undiminished** — `A-004` still demands the permitted leg **and** the refusals, and `D-5` is what finally gives the permitted leg something to exercise.
>
> ⛔ **`C-3`'s scan-gate removal changes NOTHING here** — `A-004` never listed an unscanned refusal, so no leg is struck on that ground.

## A-005 — Local Git workflow

- The demo and MVP are **local Git repositories**.
- GitHub creation, remote configuration, and push are **not** prerequisites for Phase 0.
- A remote or push occurs **only on explicit orchestrator instruction**.
- Any older GitHub-first wording (`CLAUDE.md` §10 "create the git repository (e.g. on GitHub)…"; Plan Phase −1) is superseded.

## A-006 — Ratified toolchain

- Node.js major line: **`24 LTS`**;
- `.nvmrc`: **`24`**; engine range: **`>=24 <25`**;
- npm: **`11.13.0`**; package-manager declaration: **`npm@11.13.0`**;
- Next.js **App Router**, **TypeScript**, **Tailwind CSS**, **ESLint**, **Turbopack**;
- root-level **`/app`**, no `/src`;
- **React Compiler disabled** initially.

This supersedes the Plan Phase −1 "Node 20 LTS" recommendation. (v3 does not pin a Node major; no v3 clause is superseded by this item.)

## A-007 — Audit mirror phase allocation

- **Phase 0** implements and verifies the append-only database `audit_events` table, database-level `UPDATE`/`DELETE` denial, and the hash chain (`entry_hash = hash(prev_hash + canonical_payload)`).
- Phase 0 must **not** claim the complete external audit architecture is finished.
- **Phase 4** implements and operationally verifies the **independent, retention-locked audit mirror** (v3 §23 "Independent mirror"; §17 diagram), alerting, and the associated runbook.

## A-008 — Permanent continuity documents

At **every accepted stopping point**:

- `docs/progress/STATUS.md` records current phase, accepted checkpoint, blockers, latest commit, and next permitted action.
- `docs/progress/BUILD_NOTES.md` records chronological implementation changes, migrations, commands, automated/manual evidence, failures, resolutions, and commits.
- **Both are permanent** documents and must be updated together.
- The workspace migration tracker is **temporary** and is archived after migration closure.

## A-009 — Testing and accessibility

- **Pre-approved test stack** (no separate approval needed): **Vitest**, **React Testing Library**, **Playwright**.
- **Initial accessibility approach: Lighthouse is used first.** Do not add an additional accessibility package (e.g. `axe-core`) unless later justified and approved by the orchestrator.
- **Serious and critical** accessibility findings must be resolved before a phase is accepted.

## A-010 — Audit mutation verification

Testing `audit_events` mutation denial must use:

- an **application/restricted database role**; or
- a controlled **`SET ROLE`** (or equivalent restricted session) where supported.

A test executed only as a **privileged Supabase SQL-editor identity does not prove application-role denial** and is not sufficient evidence.

## A-011 — AI Features Breakdown status

- `BEST_Coach_AI_Features_Breakdown_v2.docx` is **currently unavailable** and is not installed in this repository.
- **Do not fabricate it** and do not create a placeholder DOCX.
- Specification v3 (§28, §28.1–28.2) states it incorporated the companion document's aggregate-AI detail; the current MVP scope (§26 Phases 0–4) does **not** depend on the companion.
- Its absence **does not block** governance installation, Phase 0, or MVP Phases 1–4.
- It **must be obtained and reviewed** before either deferred aggregate AI feature is pulled into scope:
  - **Weekly Class Health Brief** (§28.1);
  - **Child Progress Digest** (§28.2).

## A-012 — Implementation Plan authority

- The Implementation Plan is **procedural** — the orchestrator's execution and review script.
- It may add **Phase 5** (final integration, UAT, quality/security passes) and additional review detail.
- It **cannot silently override** the specification or a ratified amendment; where they conflict, v3-as-amended governs.

## A-013 — Stitch installation timing

- Stitch/demo reference exports are **not** installed during governance setup.
- They are inventoried and selectively **dispositioned after accepted Phase 0**.
- Visual assets may be copied into `docs/ui-screens/` **only after** a `PORT`, `REFERENCE ONLY`, `REBUILD`, `REJECT`, or `NOT APPLICABLE` decision.
- Their absence **does not block** Phase 0.

---

*Ratified 2026-07-21. This amendment supersedes only the clauses named in the supersession table; all other Specification v3 content remains authoritative and unchanged.*
