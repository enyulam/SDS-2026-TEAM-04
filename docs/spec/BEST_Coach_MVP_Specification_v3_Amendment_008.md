# B.E.S.T Coach — MVP Specification v3 Amendment 008

**Status:** **Ratified by operator**
**Ratification date:** 2026-08-08 (Asia/Singapore)
**Clauses:** **A-057**

**Ratification provenance — recorded explicitly, because this instrument sits above `FINAL_MVP_AUTHORITY_LOCK.md` and `CLAUDE.md` on the §1 ladder.** This amendment exists because the operator issued an explicit bounded instruction while resolving the Plan Phase-0 decision packet (**G-05 / P0-T10 item 6**), which directed, in terms: *"The Operator AUTHORIZES a minimal evidence-specific audit-registry extension. Use the project's amendment mechanism and determine the next non-colliding amendment/clause identifier from disk. Add EXACTLY these new governed evidence actions: `evidence.uploaded`, `evidence.accessed` … Do NOT extend the registry beyond these two strings,"* and further: *"This message is the explicit bounded Operator authority required to author the minimal amendment for these two actions only."* **The authoring session did not ratify this amendment and has no authority to do so** (`CLAUDE.md` §14.0, §14.7: *"a Claude session may not ratify"*). It drafted the instrument that instruction called for, within the scope that instruction set. **If the operator's instruction is ever found not to have covered this, A-057 is void and the Step 7H sixteen-action registry stands unchanged.**

**Amends:** the **Step 7H audit action registry** as fixed by Amendment 003 **A-029** and implemented in `supabase/migrations/20260804213000_step_7h_audit_chain.sql`. **Additively, by exactly two action strings.** No other instrument is amended.

> **Clause-continuity check.** The highest clause in any committed instrument is **A-056** (Amendment 007). No clause **A-057** is used anywhere in the committed tree. **A-057 is therefore the correct next clause, and this is Amendment 008.** No ratified instrument was renumbered, edited or overwritten to produce it. Amendments 001–007 remain **byte-for-byte unchanged**.

> **Why this amendment exists.** `CLAUDE.md` §12 makes *"extend the Step 7H audit registry"* a standing stop-and-ask, and the registry is deliberately a **function-enforced `text[]` constant, never an enum** (A-026, A-029), so extending it is a reviewed code change that needs ratified authority behind it. The Final MVP evidence requirement (Authority Lock §8, Phase A **G-23**) is **active** — Trainer assessment-evidence upload is required — and a governed upload and a governed access-URL mint are exactly the kind of governed actions §23's append-only chain exists to record. Without this amendment, evidence would either ship **unaudited** or an implementing session would extend the registry **without authority**. Both are unacceptable; this closes the gap through the amendment mechanism.

---

## Relationship to Specification v3 and Amendments 001–007

Specification v3 remains the **authoritative baseline**. Amendment 001 (**A-001 … A-013**), Amendment 002 (**A-014 … A-024**), Amendment 003 (**A-025 … A-032**), Amendment 004 (**A-033 … A-040**), Amendment 005 (**A-041 … A-048**), Amendment 006 (**A-049 … A-055**) and Amendment 007 (**A-056**) remain in force **except as named in the supersession table below**.

### Rules of precedence for this amendment

1. Every clause not named here remains in force, unchanged.
2. **Amendment 008 names no clause of Amendments 001, 002, 004, 005, 006 or 007.** All of them are untouched.
3. **Within Amendment 003, Amendment 008 names A-029's registry enumeration and nothing else.** A-025, A-026, A-027, A-028, A-030, A-031 and A-032 remain **fully active**. Within A-029 itself, only the **enumerated action list** is extended: A-029's stable account/membership attribution, its durable actor FKs, its polymorphic targets with immutable minimal snapshots, its one-event-per-governed-action rule, its generic `state_domain`/`state_from`/`state_to` shape, its **append-only correction-by-new-event** rule, its **no-redaction** rule and its **data-minimization** rule are all **preserved unchanged and remain binding**.
4. **A-031's schema-object ceiling is NOT widened by this amendment.** A-057 adds **no table, no enum, no column and no seed row**. The registry is a `text[]` constant inside already-shipped **plpgsql** function bodies. ⚠️ **It is declared TWICE in `supabase/migrations/20260804213000_step_7h_audit_chain.sql` — at lines 439 and 744 — and an implementing migration must extend BOTH.** *(Corrected 2026-08-08 after adversarial review; an earlier draft said "an already-shipped function", singular, which could have led an implementer to extend one and miss the other.)*
5. Specification v3 and Amendments 001–007 are **never edited in place.**

### Scope statement — this amendment authorizes nothing

**A-057 ratifies two action strings. It is not an implementation authorization.** It does not authorize the evidence schema, the storage bucket, the upload path, the signed-URL mint, any RLS policy, any grant, any UI, or the migration that would add these strings to the live registry. Each of those remains separately gated. Ratifying a vocabulary authorizes nothing that uses it.

---

## A-057 — Minimal evidence audit-registry extension: exactly two governed actions

### A-057.1 The extension

The Step 7H governed action registry is extended **additively by exactly two strings**:

| Action | Meaning |
|---|---|
| **`evidence.uploaded`** | A governed **Trainer** upload has successfully become an **accepted private evidence record/object**. The event is emitted on success only — an upload that is rejected by media-type policy, by the size ceiling, by path/integrity validation or by authorization **emits no `evidence.uploaded`**. |
| **`evidence.accessed`** | The server has **successfully authorized a governed evidence review and minted the short-TTL signed access URL**. It may be emitted for an authorized **Trainer** or an authorized **Management** review. |

**Registry size: 16 → 18.** The sixteen existing strings — `report.created`, `report_version.created`, `report.state_changed`, `attendance.changed`, `admin.module_created`, `admin.session_created`, `admin.trainer_assigned`, `admin.student_created`, `admin.enrolment_changed`, `admin.parent_link_changed`, `admin.profile_created`, `invitation.created`, `invitation.revoked`, `invitation.reissued`, `membership.role_changed`, `membership.bootstrap` — are **unchanged, unreordered and unrenamed**.

### A-057.2 What is expressly NOT added

**`evidence.deleted` is NOT added, and must not be.** No application evidence-delete workflow is authorized, so an action string for one would encode a capability that does not exist. **The registry must not be extended beyond these two strings** — a third evidence action is a fresh stop-and-ask under `CLAUDE.md` §12, not an extension of this clause.

### A-057.3 Denied attempts are never recorded as successes

**A denied access attempt must never emit `evidence.accessed`.** The action means *"authorization succeeded and a URL was minted"*, and emitting it on refusal would make the audit trail assert the opposite of what happened. Where a denial needs recording, use an **existing governed failure/security mechanism**; **do not invent further action strings** to describe refusals.

### A-057.4 Payload minimization is unchanged and absolute

A-029's data-minimization rule applies in full. **An evidence audit payload carries no PII and no raw evidence content** — no child name, initial, account name, email or phone number, no filename that carries a person's name, no media bytes, no thumbnail, no transcript. `CLAUDE.md` §12's standing prohibition on putting *"any child name, initial, account name, email or phone number into an audit label or payload"* is **not relaxed** by this amendment.

### A-057.5 The append-only guarantee is not weakened

**Nothing in A-057 relaxes the append-only chain.** `audit_events` and `audit_event_targets` remain `INSERT`-only with `UPDATE`/`DELETE` refused, the `entry_hash` chain rule is unchanged, and an evidence event commits **in the same transaction** as the governed operation it records — exactly as every other registry action does. Correction remains **a new event**; repair never mutates evidence.

*(Verified against the live database on 2026-08-08 during Plan Phase 0: the append-only guarantee is enforced by trigger, not merely by grant — a `DELETE` on `audit_event_targets` is refused even for the object-owning `postgres` role — which on Supabase is `rolsuper = false`, `BYPASSRLS` (Lock §18.4), so this is a **trigger** guarantee, not a privilege one with `audit append-only violation: … is never permitted (design section 5.5: correction is a new event; repair never mutates evidence)`, and the `authenticated` role has no `DELETE` privilege at all. This amendment leaves that posture untouched.)*

---

## Supersession and clarification table

| Instrument | Clause | Treatment | Effect |
|---|---|---|---|
| Amendment 003 | **A-029** | **Extended, additively** | The governed action registry gains **exactly two** strings, `evidence.uploaded` and `evidence.accessed`. Every other element of A-029 — attribution, durable actor FKs, polymorphic targets, one-event-per-action, generic state columns, correction-by-new-event, no redaction, data minimization — is **preserved unchanged**. |
| Amendment 003 | A-031 | **Not amended** | No table, enum, column or seed row is added. The ceiling is untouched. |
| Amendment 003 | A-026 | **Not amended** | The registry stays a **function-enforced `text[]`**, never an enum. |
| `CLAUDE.md` §12 | *"extend the Step 7H audit registry"* stop-and-ask | **Discharged for these two strings only** | The stop-and-ask remains fully in force for **any** further registry change, including `evidence.deleted`. |
| Specification v3 §23 | Append-only, hash-chained audit | **Not amended** | Reaffirmed by A-057.5. |

**Amendment 008 names no other clause of any instrument.**

---

## What this amendment does not do

- It does **not** authorize the evidence schema, bucket, policies, grants, RPCs, UI or migration.
- It does **not** create `consent_records`, a consent scope, or any parent evidence path — the parent evidence projection is ruled **OUT** of the Final MVP (Authority Lock §8.1) and the consent instrument is ruled **not required** for the current synthetic-only build.
- It does **not** authorize a malware/content-scanning provider, or permit a `clean` scan state to be asserted without a real scanner having inspected the object.
- It does **not** grant Management any rating visibility. **A-038 is unchanged and absolute**: evidence review never becomes raw per-dimension assessment access.
- It does **not** change the parent boundary in any way. **Parents receive no evidence access.**
