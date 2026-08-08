# FINAL MVP — PHASE 0 OPERATOR RULINGS

> **Document class:** OPERATOR RULING INSTRUMENT (`CLAUDE.md` §1 rank 2 class; indexed by `FINAL_MVP_AUTHORITY_LOCK.md` §2.3).
> **Ruled:** 2026-08-08 (Asia/Singapore), by the Operator, in the message *"RESOLVE THE PHASE-0 OPERATOR DECISION PACKET AND RESUME FINAL MVP EXECUTION."*
> **Recorded by:** the execution session, at Plan Phase 0, under that message's explicit bounded authority to *"record the rulings in this message"* using **annotate / supersede forward**, never historical rewriting.
>
> **This instrument records decisions the Operator made. It creates no requirement of its own and authorizes no implementation.** Where it resolves a question, the question is closed; reopening one is a `CLAUDE.md` §12 stop-and-ask.
>
> ⚠️ **A Claude session may not ratify** (`CLAUDE.md` §14.0, §14.7). Every ruling below is the Operator's; this file is the carrier, not the author.

**Rulings recorded here:** `D-0` · `G-05a` · `G-04` (four) · `G-05` (seven) · `G-03` · `G-02`.
**Companion instrument:** `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_008.md` (**A-057**), authored under G-05 item 6.

---

## D-0 — Residual synthetic report lifecycle

**Classification (Operator).** The 2026-08-07 residual report lifecycle is **SYNTHETIC DEVELOPMENT / VERIFICATION RESIDUE**. It is **not production data** and **must not force permanent legacy complexity into the OD-4 production migration design**.

**Chosen remedy (Operator).** **Preserve evidence first, then Operator-supervised governed fixture reload.** Expressly rejected: preserving the row indefinitely and redesigning OD-4 around it; targeted deletion of individual rows; `supabase db reset`.

### D-0A — Preservation: **DONE**

Executed 2026-08-08 before any fixture-state change. Written to **both** already-approved off-repo archives as `2026-08-08_PRE_OD4_SYNTHETIC_RESIDUE`:

- `D:\B.E.S.T-Coach-Archive\` (disk 1)
- SUTD OneDrive `\B.E.S.T-Coach-Archive\` (disk 0)

| Artefact | SHA-256 |
|---|---|
| `residual-lifecycle.data.sql` (exact `--column-inserts` data export) | `60441cb22892ae2e660ceb3a838ffed948023c748990405582c97fb2d198c87c` |
| `residual-lifecycle.dump` (pg_dump custom format, restorable) | `3ca905aad1be483a07ca25abd808009c155cb97d3ff4ef33075591db8553d68f` |
| `residual-lifecycle.metadata.txt` (structured metadata; **no raw panel text**) | `e021ef1755a19b7d7057f7c03f75c8495b561b867e70b8cae22d6564b4b21c03` |
| `audit-chain-verification.txt` | `603bb7245a5f651c5a6ad01043b311f299f48e4d46a12ffd27e4180eab9320ca` |

Both copies verified **SHA-identical** by `sha256sum -c`. A credential-pattern scan over the whole set returned **no match**. **The raw generated draft text is NOT committed to Git** — it exists only in the two archives, per the ruling.

**Repository-safe record of what was preserved.** Row counts: `reports` 1 · `report_versions` 1 · `report_version_ratings` 9 · `report_version_checklist_progress` 1 · `report_version_approvals` 0 · `audit_events` 5 · `audit_chain_heads` 1 · `audit_event_targets` 4 · `observations` 1 · `observation_ratings` 9. Report `57a26079-a1a9-45b6-9a71-5c6522a99387` at `draft_ready`, `lock_version` 4. Version `03e930d2-0102-4a9f-9682-1c127b6212cb`, `revision_number` 1, **`content_hash_version` = 1**, all four superseded panels populated. Created 2026-08-07 06:52:32 → 06:52:40 (+00). **Audit chain verification at capture: `ok = true`, `mode = complete`, `events_checked = 5`, `head_checked = true`, no failed check** — the residue is a coherent, verifiable chain, not corruption.

### D-0B — Governed fixture reload: ~~**BLOCKED — NOT EXECUTED. NEW OPERATOR DECISION REQUIRED.**~~ **✅ DECISION RECEIVED 2026-08-09 — SUPERSEDED BY D-0C BELOW. The record of the block is preserved verbatim because it is the evidence that justified the remedy.**

⚠️ **The authorized remedy cannot be executed by anyone, on any terminal.** This was proved on a disposable clone of the canonical database (`CREATE DATABASE … TEMPLATE postgres`), never against canonical, and the canonical database was verified byte-for-byte unchanged afterwards.

**Two independent structural blockers, both proven:**

**B1 — The fixture cleanup cannot delete `observations`, because `reports` pins it.**
`scripts/fixtures/local_fixtures.sql` deliberately scopes itself to the 25 fixture domain rows and **explicitly excludes report rows and audit rows** (its own header: *"invitations [7I] · audit rows [7H] · evidence rows · AI rows"*). Running its cleanup half against the current data state aborts:

```
ERROR:  update or delete on table "observations" violates foreign key constraint
        "reports_observation_fk" on table "reports"
```

The transaction is atomic and rolls back cleanly. **`npm run fixtures:local -- --reload` therefore fails at its FIRST step** — before it deletes any Auth user and before it ever reaches the password prompt. **This is not a TTY problem and an Operator at a keyboard does not change it.**

**B2 — Even with the report rows gone, the cleanup still cannot complete, because the audit chain pins the memberships — and the audit rows are undeletable by design.**
With the report family removed on the clone, the cleanup proceeds ten rows further and then aborts:

```
ERROR:  update or delete on table "centre_memberships" violates foreign key constraint
        "audit_events_actor_membership_fk" on table "audit_events"
```

That FK is **A-029's ratified durable actor FK** (`RESTRICT`; *"centres, accounts and memberships are never physically deleted"*). And the audit rows cannot be removed to relieve it:

```
ERROR:  audit append-only violation: DELETE on public.audit_event_targets is never permitted
        (design section 5.5: correction is a new event; repair never mutates evidence)
```

**That refusal fires even for the object-owning `postgres` role — which on Supabase is `rolsuper = false`, `BYPASSRLS` (Lock §18.4), so this is a **trigger** guarantee, not a privilege one** — not merely for an application role. The `authenticated` role has no `DELETE` privilege at all. *(Wording corrected 2026-08-08 after adversarial review: an earlier draft said "superuser", which Lock §18.4 rules factually wrong — verified live, `postgres | rolsuper=false | rolbypassrls=true`. The finding is unchanged and if anything stronger: the refusal is enforced by **trigger**, so no privilege level relieves it.)*

**Conclusion.** For as long as **any** audit event exists, the fixture reload is **structurally impossible**. The reload was the instrument meant to clear the residue, and the residue's audit half is precisely what blocks the reload. **This is circular and cannot be resolved inside the ruling as written.** The append-only guarantee is working exactly as designed — this is not a defect to be worked around, and `CLAUDE.md` §12's *"never work around a fail-closed refusal by weakening the thing that refused"* forbids relaxing it.

**Consequences held open, deliberately:** `report_versions` remains **1**; the four suites (`run-canonical`, `run-correction-tracking`, `prove-clock-hour-determinism`, `run-assessment`) remain **FAIL**; the Phase-0 baseline is **not green**; and per the Operator's own instruction *"Do not start Phase 1 if the baseline remains unexpectedly red"*, **Plan Phase 1 has not begun.**

> ⚠️ **STALE AS OF 2026-08-09 — read the paragraph above as a snapshot of 2026-08-08, not as current state.** Superseded by **D-0C**: **`report_versions` = 0** (measured live), and the four suites are **`NOT-RUN`**, not `FAIL`. **`Plan Phase 1 has not begun` is the one clause still true.** *(Marked inline because the supersession notice on this section's heading is ~35 lines above, and this paragraph reads as a current-state claim on its own. The text itself is preserved verbatim — it is the evidence that justified the remedy.)*

**Nothing was deleted, truncated, reset or worked around.** The probe database was dropped after use.

### D-0C — Fresh local reconstruction: **RULED 2026-08-09, and EXECUTED**

**The Operator resolved B-P0-2** in the message *"RESOLVE B-P0-2 BY RECREATING THE LOCAL SUPABASE BASELINE, THEN RESUME FINAL MVP EXECUTION."* The chosen remedy is **recreate the local Supabase database/stack from a fresh local baseline** — explicitly authorized as functionally destructive to the **LOCAL synthetic** database only, on eight stated grounds (synthetic data only · already preserved in both archives · preservation is exact and restorable · no hosted project · no production data · real child data prohibited · targeted cleanup blocked by FK + append-only guarantees · permanent preservation would wrongly force OD-4 to accommodate a one-off development artefact).

**D-0's final disposition is therefore `PRESERVED_THEN_FRESH_LOCAL_RECONSTRUCTION`.**

⚠️ **Boundary, as ruled.** The authorization reaches **only** the local Supabase development environment for this repository. It does **not** authorize hosted destruction, production reset, any hosted action, deletion of repository or migration files, rewriting applied migration history, deletion of the D-0A archive, destructive cleanup of the frozen demo or PeakPalate, or any generic future reset. **It is ONE bounded recovery authorization and must not be converted into a reusable cleanup command or a product feature.** `supabase db reset` remained prohibited and **was not used**.

**Executed 2026-08-09** via the plan's ratified **R-1** semantics, after the seven-item pre-destruction gate passed in full:

1. `supabase stop --project-id best-coach-mvp --no-backup` — removed the three project-scoped data volumes (`db`, `storage`, `edge_runtime`). **`--all` was never used**, and this was verified to be the only Supabase project on the machine.
2. `supabase start` — fresh stack; **all 12 committed migrations applied from scratch in canonical order**, every in-migration posture assertion passing. Notably `20260806160000_competency_vocabulary_rename.sql`'s fail-closed guard proved `report_versions=0, report_version_ratings=0, observation_ratings=0` **in-transaction**.
3. **No migration file was modified to make the fresh apply work.** None needed it.

**Re-derived live catalogue (measured, not restated):** 12 migrations · 26 tables · 12 enums · 34 functions · 29 policies · 3 non-internal triggers · `report_status` exactly the eight ordered labels · `report_store_draft` proacl literally `{postgres=X/postgres}` · `authenticated` EXECUTE **25** · `service_role` EXECUTE **0** · `anon` EXECUTE **0** · deterministic seed intact (1 centre · 3 class grades · 9 assessment dimensions). **`report_versions` = 0**, and **all eleven report-family and audit tables are at 0** — no residual report lifecycle of any kind.

**What the destruction actually cost, recorded honestly:** the three synthetic Auth identities (`management`/`trainer`/`parent`.`fixture@example.test`), the five audit events, and the preserved residue. Local Storage held **0 buckets and 0 objects**, so nothing was lost there. Every repository file — migrations, config, source, tests, fixtures — is untouched, as are both D-0A archives, the frozen demo and PeakPalate.

**B1 and B2 are structurally gone**, proved rather than assumed: the fixture loader now runs its guards, captures the local connection and **passes the clean-load preflight** (*"no fixture Auth user and no fixture domain row exists"*) before halting at the interactive password prompt. Under D-0B it could never get past its **first** step.

⚠️ **This does not by itself close Phase 0.** The governed fixture reload still requires the Operator to enter the three no-echo passwords at a real terminal, and the four formerly-red suites all clone the canonical **fixture** database, so they cannot be re-run until that happens. **`B-P0-1` and `B-P0-2` are therefore recorded `RESOLVED_PENDING_FIXTURE_RELOAD`, not `CLOSED`** — the Operator's own closeout conditions the closure on *"the fresh local baseline **and all four suites** … green"*, and a `PASS` is an evidence-backed result, never an assumption.

---

## G-05a / OD-4 §5.1 — Content-hash disposition (Q-6): **RULED**

Ratified by the Operator. **This closes G-05a / P1-T02 for the current Final MVP implementation.**

1. **V1 serializers remain HISTORICAL and BYTE/SEMANTICALLY UNCHANGED.**
2. **Do not redefine** `report_content_hash_v1` body · `report_wording_hash_v1` body · their field-name arrays · domain-separation strings · signatures · ACLs · comments.
3. **Introduce PARALLEL V2 serializers** for the canonical OD-4 model: `overview` · `strengths` · `areas_for_development` · `remarks`.
4. **New OD-4 report versions use `content_hash_version = 2`.**
5. The existing constraint **may be widened** from `= 1` to the governed equivalent allowing **`1` or `2`**.
6. **No historical-row backmigration is required**, on the stated premise that the governed reload restores the local development database to the intended no-report-version state and no production report data exists.
7. **A future real production V1 row, if one ever exists, must not be silently relabelled or mutated.** That would require a separate migration decision.
8. **`report_store_draft` keeps ZERO client `EXECUTE`** (R-27, unchanged).

> ✅ **PREMISE SATISFIED 2026-08-09 — this dependency is DISCHARGED.** The fresh local reconstruction (**D-0C**) restored the local development database to exactly the intended no-report-version state: **`report_versions` = 0**, measured live, with every report-family and audit table at 0. **No local V1 row survives**, so item 6's premise is now true as written and **no historical-row backmigration is required**. Item 7 is **unaffected and remains binding** for any future real production V1 row. Implementation at **P1-T02/P1-T03 must no longer treat a local V1 row as present** — the instruction to do so, struck below, was correct only while D-0B was blocked.
>
> ~~⚠️ **Recorded dependency, not a reopening.** Item 6's premise — *"the governed reload restores the local development database to the intended no-report-version state"* — **is currently false**, because D-0B is blocked above. The ruling itself is **unaffected in substance**: V1 stays frozen, V2 is parallel, and the constraint widens to `1 or 2`, which **already tolerates** a surviving V1 row. What is *not yet true* is the factual claim that no V1 row exists locally. Implementation at P1-T02/P1-T03 must therefore treat the local V1 row as **present unless and until D-0B is resolved**, and must **not** silently relabel or mutate it — item 7's protection is the governing rule for it. **No part of this ruling is weakened; only its stated precondition is pending.**~~ *(Struck 2026-08-09: the precondition is no longer pending. Preserved per annotate-never-delete because it accurately recorded the state between 2026-08-08 and the reconstruction.)*

---

## G-04 / P0-T09 — Four dispositions: **RULED**

### 1. `report_source_map` — `REQUIRED_FOR_FINAL_MVP`

**Execution owner: P2-T06.** Build it at P2-T06 according to current OD-4 semantics and current functional authority. **Do not reopen whether it is required.** *(Consistent with Phase A Part II G-28 and Authority Lock §20.2; the contrary "do not build" reading came from Part I, which that document's own banner marks HISTORICAL.)*

### 2. `session_logs` — `DEFERRED_FROM_FINAL_MVP`

Reason: current authority records it as non-blocking, and its principal future use is the deferred longitudinal / class-health functionality. **Do not create** a `session_logs` table, a session-log RPC, or session-log UI during the current Final MVP. The deferral is explicit and recorded here.

### 3. Attendance control — `GOVERNED FUNCTIONAL INSERTION`

The required Trainer **Present / Absent** control is a **governed functional insertion onto the existing Trainer roster surface**. It does **not** create a new governed screen, a new Figma frame, a new UI pack, or a new navigation destination. Use the existing governed Trainer roster pack resolved from `SCREEN_INDEX.md`.

**Visual treatment (ruled):** compact two-state Present / Absent control associated directly with the learner/session roster row · visually derived from existing governed controls and design tokens · **default state visibly Present** · Absent state explicit and distinguishable · **keyboard accessible** · **not hidden behind the attendance filter** · **no third attendance state** · no new page-level panel merely to house it.

**Functional authority outranks the absence of this control from the frozen visual frame.** Record its presence at visual acceptance as **`GOVERNED FUNCTIONAL INSERTION`**, never as a visual regression. **Do not invent a Figma node.**

**Unblocks: P2-T02 and P3-T03.**

### 4. Notifications — `DEFERRED_BY_OPERATOR_FOR_FINAL_MVP`

**Notifications are OUT of Final MVP scope**, including the two U-25 notification surface families. **Do not build:** a notifications table · a notification enum · a notification RPC · a staff notification screen · a parent notification screen · a notification delivery service · **or an email notification workflow merely to replace them.**

**Auth / confirmation / invitation email required for identity operation is NOT a product notification feature** and remains governed separately. *(Consistent with the existing `DEFERRED_BY_RATIFIED_DECISION` posture at Authority Lock §20.2.)*

---

## G-05 / P0-T10 — Evidence dispositions: **RULED**

**The Final MVP evidence requirement remains ACTIVE.** Trainer assessment-evidence upload is **required**. Evidence is learner/session/assessment associated · **Trainer-owned** · **private** · **Management review-only where necessary** · **Parent-inaccessible** · **never automatically AI input**.

### 1. `scan_status` / malware scanning — **no fake scan state**

**Do not implement a fake malware-scan success state.** No external malware/content-scanning provider is authorized at this checkpoint. Therefore: **do not claim an uploaded object is `clean` unless a real scanner actually inspected it** · do not derive a green scan status from MIME validation alone · **do not select or call an external scanning provider autonomously.**

For Final MVP use **deterministic server-side upload validation**: allowed media-type policy derived from actual governed evidence needs · the size ceiling below · object/path integrity · private-storage enforcement.

Where the model requires a scan-state field, use a **truthful non-assertive state equivalent to `NOT_SCANNED`** rather than pretending verification occurred. **If adding a `scan_status` enum/field would introduce schema solely to represent an unperformed service, present that fact and omit the field where current higher authority allows.**

**This Operator ruling supersedes lower-ranked wording that would otherwise require a fake scan for the current synthetic-only Final MVP.** Historical specification text is **not** rewritten. A real scanning service is a future external-service decision.

### 2. Retention — **no automated subsystem**

**No automated retention/erasure subsystem is added to Final MVP.** All Final MVP local, hosted-UAT and demonstration evidence remains **SYNTHETIC ONLY**; **real child evidence remains PROHIBITED**. Synthetic evidence may be retained for UAT/submission evidence and removed manually after the assessment/demo lifecycle.

**Do not create** `retention_policies` · `erasure_requests` · scheduled purge infrastructure. **Do not claim automated PDPA retention exists.** *(Consistent with `CLAUDE.md` §3.1's correction that no PDPA table exists and none may be created without an amendment.)*

### 3. File size — **50 MiB per file**

**Maximum evidence object size: 50 MiB per file.** Keep the current safer posture; **do not raise it to 500 MB.** Enforce consistently at the earliest practical server/storage boundaries and **prove oversize rejection**. *(This resolves the recorded 500MB-vs-50MiB conflict in favour of the `config.toml` value already in place.)*

### 4. Management evidence review / A-038 — **read-only**

Management **may review** assessment evidence where necessary for the governed report-review workflow. Access is **READ-ONLY**.

Management **may receive**: evidence metadata required to identify the correct object · a **short-TTL server-minted signed URL** after role/membership authorization.

Management **may NOT**: upload evidence for the Trainer · alter, replace or delete evidence · change its learner/session/assessment association · use evidence access to expose raw nine-dimension rating data.

**A-038's restriction on raw per-dimension assessment data remains fully active. Evidence review does not grant rating visibility. Parent receives NO evidence access.**

### 5. `consent_records` — **do not create**

**Do not create `consent_records` for the current Final MVP.** Current higher authority has the **parent evidence projection ruled OUT** (Authority Lock §8.1), **PDPA hardening tables deferred**, and the **synthetic-data-only posture active**. The old consent-gated parent-evidence architecture is therefore **not** the current Final MVP architecture, and no consent table is required merely to gate synthetic demonstration evidence.

**Do not create** `consent_records` · a `consent_scope` enum · a parent evidence signed-URL path.

⚠️ **If real child evidence is ever proposed: STOP.** That requires a separate privacy/governance decision **before** data is loaded.

### 6. Evidence audit registry — **authorized, exactly two actions**

The Operator authorized a **minimal** evidence-specific audit-registry extension, to be recorded through the amendment mechanism at the next non-colliding identifier. **Executed as `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_008.md`, clause `A-057`**, adding exactly **`evidence.uploaded`** and **`evidence.accessed`** (registry 16 → 18).

**`evidence.deleted` is NOT added.** The registry must not be extended beyond these two strings. Denied attempts must never be recorded as successful access. Audit payloads carry **no PII and no raw evidence content**.

### 7. Other media classes — **deferred**

**Deferred from Final MVP:** student profile/photo upload · trainer profile/photo upload · lesson-material upload (Authority Lock §8.2). **Do not fold any of them into the assessment-evidence bucket or table.** Do not build their UI or storage policies during Final MVP.

**The only required media surface for the current build is TRAINER ASSESSMENT EVIDENCE.**

---

## G-03 / P0-T08 — External inputs: **RULED**

The following are recorded as **`UNKNOWN_EXTERNAL_INPUT`** and **`NON_BLOCKING_FOR_PLAN_PHASES_0_TO_4`**:

GitHub Classroom team number · exact GitHub Classroom invite/repository URL · final exact submission date/time/timezone · repository visibility requirement · exact presentation duration · CHIPS 1–4 artefacts · Sprint 1 source material not present in the workspace.

**Do not fabricate them. Do not repeatedly stop local implementation for them.** They become blocking only at the task that genuinely consumes them — **primarily Phase 10**. **If repository evidence later resolves one, update the register from evidence.**

*(All seven were verified absent from the workspace at P0-T08 on 2026-08-08, not merely assumed: `SDS-2026-Team-XX` appears only as the literal placeholder in five governance sites and is never filled; no CHIPS artefact exists anywhere in the workspace; no GitHub Classroom URL exists.)*

---

## G-02 / P0-T07 — Human usability recruitment: **AUTHORIZED (preparation and scheduling only)**

The Operator **authorizes recruitment/outreach preparation and scheduling now**, so that representative usability participants are available by Plan Phase 9.

**Preferred pool:** **adult representative users** for the Trainer, Management and Parent perspectives. **Do not recruit children for this project. Do not use real child records.** No participant count is mandated by the brief; representation across all three role perspectives is desirable **but must never be presented as a course requirement**.

**Claude may prepare:** a concise recruitment message · scheduling instructions · a consent/information sheet draft · the eventual usability task protocol. **Materials are drafted at `docs/plan/PHASE_9_USABILITY_RECRUITMENT_MATERIALS.md`.**

⚠️ **Claude may NOT claim that anyone has been contacted, consented or participated, unless the Operator actually reports that fact.** This authorization permits **the Operator** to perform manual outreach and scheduling. It does **not** authorize Claude to conduct or claim Phase-9 testing. **Actual usability sessions remain a separate human gate (G-21) at Phase 9.**

**Status as recorded: ZERO participants contacted, ZERO consented, ZERO sessions conducted.**

---

## Calendar / scope: **RULED — DO NOT DESCOPE**

**The Operator does not authorize narrowing the 24 governed UI packs or any other scope reduction merely because the calendar is tight.** Proceed on the governed critical path; recruitment may progress in parallel, outside implementation.

**If later evidence shows the mandatory scope cannot be completed before the submission deadline**, return with: concrete tasks remaining · measured completion state · exact critical path · proposed minimum-risk triage options — **before making any scope reduction.**

---

## Plan Phase 1 / OD-4: **AUTHORIZED, conditionally**

The Operator explicitly authorized **PLAN PHASE 1 — OD-4 CONTRACT FOUNDATION** as the separate **OD-4 Phase-B authorization** the execution plan requires. **LOCAL ONLY.** It includes the G-05a V2 ruling above. **No real provider invocation is authorized.**

⚠️ **The authorization is expressly conditioned on a clean Phase-0 exit** — *"Once Phase 0 exits cleanly"*, and *"Do not start Phase 1 if the baseline remains unexpectedly red."* ~~**The baseline is red** (four suites, D-0B blocked).~~ **Phase 1 has therefore NOT been started.** The authorization stands and takes effect once the D-0B decision is made and the baseline is green. *(Updated 2026-08-09: **the D-0B decision HAS been made and executed** — see **D-0C**. The structural block is gone and the schema baseline is green. What remains before Phase 1 may begin is **not a decision but an action only the Operator can perform**: entering the three interactive no-echo fixture passwords, after which the four suites can be re-run. **Phase 1 remains NOT started**, exactly as the Operator's condition requires.)*

**G-06 / P1-T09 (grounding rule-4 re-derivation) remains a genuine, non-inheritable design-ratification gate** and must not be pre-decided.

---

## Provider safety — unchanged and absolute

During Plan Phases 0–4: **REAL PROVIDER AUTHORIZATION: NONE.** Before serving or running any application path capable of constructing the real provider: apply the safe selector **overwrite** · **read back** · prove safe values · arm the outward-call trip-wire. **Never infer authorization from `.env.local`.** Any unexpected outward request: **STOP, do not retry.**
