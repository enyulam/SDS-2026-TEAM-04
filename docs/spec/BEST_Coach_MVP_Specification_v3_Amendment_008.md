# B.E.S.T Coach — MVP Specification v3 Amendment 008

**Status:** **Ratified by operator**
**Ratification date:** 2026-08-08 (Asia/Singapore)
**Clauses:** **A-057**

**Ratification provenance — recorded explicitly, because this instrument sits above `FINAL_MVP_AUTHORITY_LOCK.md` and `CLAUDE.md` on the §1 ladder.** This amendment exists because the operator issued an explicit bounded instruction while resolving the Plan Phase-0 decision packet (**G-05 / P0-T10 item 6**), which directed, in terms: *"The Operator AUTHORIZES a minimal evidence-specific audit-registry extension. Use the project's amendment mechanism and determine the next non-colliding amendment/clause identifier from disk. Add EXACTLY these new governed evidence actions: `evidence.uploaded`, `evidence.accessed` … Do NOT extend the registry beyond these two strings,"* and further: *"This message is the explicit bounded Operator authority required to author the minimal amendment for these two actions only."* **The authoring session did not ratify this amendment and has no authority to do so** (`CLAUDE.md` §14.0, §14.7: *"a Claude session may not ratify"*). It drafted the instrument that instruction called for, within the scope that instruction set. **If the operator's instruction is ever found not to have covered this, A-057 is void and the Step 7H sixteen-action registry stands unchanged.**

**Amends:** the **Step 7H audit action registry** as fixed by Amendment 003 **A-029** and implemented in `supabase/migrations/20260804213000_step_7h_audit_chain.sql`. ~~**Additively, by exactly two action strings.**~~ ✅ **Additively, by exactly THREE action strings — extended 2026-08-11 by operator ruling `C-4`, then collapsed the same day by its collapse ruling** (`FINAL_MVP_PORTAL_DECISIONS.md` §C). No other instrument is amended.

⚠️ **The provenance quotation immediately above is HISTORICAL and is NOT edited.** It records, accurately, what the `G-05` instruction said in 2026-08-08 — including *"Do NOT extend the registry beyond these two strings."* **That instruction was correct for its own scope and was never breached**: the extension beyond two was made by a **separate, later, explicit bounded Operator authorization** (`C-4`), which is exactly the route the original instruction's stop-and-ask required. ▶ **Do not read the quotation as a live prohibition, and do not rewrite it.**

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

**A-057 ratifies ~~two~~ ✅ THREE action strings (`C-4` + its collapse ruling, 2026-08-11). It is not an implementation authorization.** It does not authorize the evidence schema, the storage bucket, the upload path, the signed-URL mint, any RLS policy, any grant, any UI, or the migration that would add these strings to the live registry. Each of those remains separately gated. Ratifying a vocabulary authorizes nothing that uses it.

---

## A-057 — Minimal evidence audit-registry extension: ~~exactly two~~ ~~exactly four~~ ✅ **exactly THREE** governed actions *(extended 2026-08-11, `C-4`)*

### A-057.1 The extension

~~The Step 7H governed action registry is extended **additively by exactly two strings**:~~ ✅ **EXTENDED 2026-08-11 BY OPERATOR RULING `C-4`** (`FINAL_MVP_PORTAL_DECISIONS.md` §C), under an explicit bounded `CLAUDE.md` §12 authorization issued for that run — **to four strings, then collapsed the same day to THREE** when `evidence.uploaded` and `evidence.attached` were found to be one governed action (`A-057.1a`). The registry is extended **additively by exactly three strings**:

| Action | Meaning |
|---|---|
| ~~**`evidence.uploaded`**~~ ⛔ **COLLAPSED INTO `evidence.attached` — `C-4` COLLAPSE RULING, 2026-08-11** | ~~A governed **Trainer** upload has successfully become an **accepted private evidence record/object**.~~ **This was the same governed action as `evidence.attached`** — see `A-057.1a`. Its meaning is carried forward there **in full**, including the success-only rule. |
| **`evidence.attached`** ✅ **THE ONE UPLOAD-AND-TAG ACTION** | A governed **Trainer** upload has become an **accepted private evidence record tagged to exactly one session report**. ⚠️ **The name states what the event means FOR THE CHILD'S REPORT, not what the file transfer did** — the Operator's stated reason for choosing it over `evidence.uploaded`. **Emitted on success only**: an upload rejected by media-type policy, by the size ceiling, by path/integrity validation or by authorization **emits nothing**. |
| **`evidence.accessed`** | The server has **successfully authorized a governed evidence review and minted the short-TTL signed access URL**. It may be emitted for an authorized **Trainer** or an authorized **Management** review. |
| **`evidence.removed`** ✅ **ADDED BY `C-4`** | A governed removal of an evidence object has succeeded. `D-5` rules that evidence **can be removed**; this is the action string for it. ⛔ **It is NOT `evidence.deleted`** — see `A-057.2`. |

**Registry size: ~~16 → 18~~ ~~`16 → 20`~~ ✅ `16 → 19` (`C-4` collapse ruling, 2026-08-11).** The sixteen existing strings — `report.created`, `report_version.created`, `report.state_changed`, `attendance.changed`, `admin.module_created`, `admin.session_created`, `admin.trainer_assigned`, `admin.student_created`, `admin.enrolment_changed`, `admin.parent_link_changed`, `admin.profile_created`, `invitation.created`, `invitation.revoked`, `invitation.reissued`, `membership.role_changed`, `membership.bootstrap` — are **unchanged, unreordered and unrenamed**.

### A-057.1a ✅ RULED — `evidence.uploaded` and `evidence.attached` ARE ONE ACTION, AND ARE COLLAPSED

**Kept here in full so nobody re-splits them.** The Operator ruled the four strings and expressly reserved the collapse: *"If any two of the four are genuinely the same event under different names, say which and I will collapse them. **Do not collapse them yourself.**"* The question was answered, and the Operator then ruled the collapse on 2026-08-11.

⛔ **THEY ARE ONE GOVERNED ACTION.** Under `D-5`'s ruled shape the Trainer uploads **at assessment time**, and the object is **tagged to exactly one session report** and **can never be moved or reused**. **There is no authorized workflow in which an evidence object exists unattached and is attached later** — so **the upload IS the attach**.

⛔ **`A-029` REQUIRES ONE EVENT PER GOVERNED ACTION**, a rule this amendment's own supersession table lists as *preserved unchanged*. Two strings for one action would have put the registry in tension with it **from the day it was implemented**.

✅ **THE SURVIVING NAME IS `evidence.attached`**, and the Operator's reason is recorded because it is the part a later reader would otherwise reverse: **it names what the event means for the child's report, not what the file transfer did.**

**Registry: `16 → 19` — `evidence.attached` · `evidence.accessed` · `evidence.removed`.**

⛔ **DO NOT RE-INTRODUCE `evidence.uploaded`.** A second name for a single action is the defect this clause exists to prevent, and reintroducing it is a fresh `CLAUDE.md` §12 stop-and-ask, not a clarification.

▶ **Nothing had to be unpicked.** The **live Step 7H registry is still 16** and `A-057` has never been implemented in any migration, so the collapse cost nothing — which is exactly why it was worth holding `C-4` rather than applying its first arithmetic.

### A-057.2 What is expressly NOT added

~~**`evidence.deleted` is NOT added, and must not be.**~~ ✅ **SUPERSEDED IN PART, 2026-08-11 BY OPERATOR RULING `C-4`.** ⚠️ **THE NAME IS STILL NOT ADDED — the CAPABILITY now is.** `D-5` authorizes evidence removal, so the reasoning below (*"an action string for one would encode a capability that does not exist"*) **has lapsed on its facts**: the capability exists, ruled by the Operator on 2026-08-11. The action string is **`evidence.removed`**, not `evidence.deleted`, and ⛔ **`evidence.deleted` itself remains unadded and must not be introduced** — a second name for one action is the defect `A-057.1a` already flags.

No application evidence-delete workflow was authorized **when this clause was written**; one is authorized now, and it is a **removal**, not a hard delete. ⛔ **`A-029`'s append-only, correction-by-new-event and no-redaction rules are untouched** — removing an evidence object **never** removes or rewrites the audit events that recorded it.

~~**The registry must not be extended beyond these two strings** — a third evidence action is a fresh stop-and-ask under `CLAUDE.md` §12, not an extension of this clause.~~ ✅ **THE FRESH STOP-AND-ASK WAS RAISED AND ANSWERED.** It was raised by the PORTAL COMPLETION PLAN's collision review as **`C-4`**, held rather than resolved by the reporting session, and ruled by the Operator on 2026-08-11 with **an explicit bounded §12 authorization to extend beyond the two**. ▶ **The clause worked exactly as written: it stopped a session from extending the registry by inference, and routed the decision to the Operator.**

⛔ **THE PROHIBITION RE-ARMS AT THREE.** **The registry must not be extended beyond these three strings** — a fourth evidence action is a fresh `CLAUDE.md` §12 stop-and-ask, not an extension of this clause. **`C-4` is not a standing licence.**

⚠️ **The Operator's own record of why the arithmetic changed, preserved because it is the reasoning that decides the clause:** the ruling first read *"16 → 18"*, which was **arithmetic from a wrong premise — that `A-057` had not already named two strings**. Corrected to **`16 → 20`**, then **collapsed to `16 → 19`** the same day. ▶ **`evidence.accessed` was the string most at risk from the wrong premise, and it is the one that mattered most: it is the ONLY trace that a short-TTL signed URL to a child's video was minted, for whom, and when.** That is an **audit control**, not bookkeeping — and it carries more weight since **`C-3` removed the scan gate**, leaving access logging as one of the few remaining controls on the media path.

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
| Amendment 003 | **A-029** | **Extended, additively** | The governed action registry gains ~~**exactly two** strings, `evidence.uploaded` and `evidence.accessed`~~ ✅ **exactly THREE strings — `evidence.attached`, `evidence.accessed`, `evidence.removed` (`C-4` + its collapse ruling, 2026-08-11)**. Every other element of A-029 — attribution, durable actor FKs, polymorphic targets, **one-event-per-action**, generic state columns, correction-by-new-event, no redaction, data minimization — is **preserved unchanged**. ✅ **One-event-per-action is why the collapse happened**: `evidence.uploaded` and `evidence.attached` WERE one action, so four strings would have sat in tension with this very row.  records the ruling. |
| Amendment 003 | A-031 | **Not amended** | No table, enum, column or seed row is added. The ceiling is untouched. |
| Amendment 003 | A-026 | **Not amended** | The registry stays a **function-enforced `text[]`**, never an enum. |
| `CLAUDE.md` §12 | *"extend the Step 7H audit registry"* stop-and-ask | **Discharged for these ~~two~~ ~~FOUR~~ ✅ THREE strings only** | The stop-and-ask **remains fully in force for any further registry change**, including `evidence.deleted`. ⛔ **It RE-ARMS AT THREE: a fourth evidence action is a fresh stop-and-ask, and `C-4` is not a standing licence.** |
| Specification v3 §23 | Append-only, hash-chained audit | **Not amended** | Reaffirmed by A-057.5. |

**Amendment 008 names no other clause of any instrument.**

---

## What this amendment does not do

- It does **not** authorize the evidence schema, bucket, policies, grants, RPCs, UI or migration.
- It does **not** create `consent_records`, a consent scope, or any parent evidence path — the parent evidence projection is ruled **OUT** of the Final MVP (Authority Lock §8.1) and the consent instrument is ruled **not required** for the current synthetic-only build.
- It does **not** authorize a malware/content-scanning provider, or permit a `clean` scan state to be asserted without a real scanner having inspected the object.
- ~~It does **not** grant Management any rating visibility. **A-038 is unchanged and absolute**: evidence review never becomes raw per-dimension assessment access.~~
  > ✅ **AMENDED 2026-08-11 BY OPERATOR RULING `D-1`** (`FINAL_MVP_PORTAL_DECISIONS.md`; Authority Lock §2.3). **A-038 is no longer absolute in the Management direction: management may VIEW the nine per-dimension ratings, READ ONLY.** Struck and preserved per annotate-never-delete.
  > ⚠️ **What this clause was really asserting is still true:** *this amendment* grants no rating visibility — **the grant comes from `D-1`, which ruled it directly**, and **evidence review still never becomes rating access**. One authorization does not widen into another.
  > ⛔ **Management may still not EDIT a rating**, and ⛔ **`Q-27` does not move — the Parent boundary is untouched.**
- ~~It does **not** change the parent boundary in any way. **Parents receive no evidence access.**~~
  > ✅ **SUPERSEDED 2026-08-11 BY OPERATOR RULING `D-5`** (`FINAL_MVP_PORTAL_DECISIONS.md`). **Per-child video evidence is authorized and the linked Parent is one of its three audiences**, which **activates `A-001`** — previously *ratified but armed and unactivated*.
  > ⛔ **`Q-27` IS A DIFFERENT BOUNDARY AND IT DOES NOT MOVE.** `D-5` concerns **evidence media**; the nine per-dimension ratings still never reach a Parent session in any form.
  > ⚠️ **Every `A-001`/`A-003`/`A-004` safeguard applies in full** the moment evidence is implemented — the gates were always ratified, only unactivated. ⛔ **No download affordance for any role, including Parent**, and the streamed-retrievability limitation is **stated, never denied**.
  > ⛔ **This amendment still authorizes no evidence schema, bucket, policy, grant, RPC, UI or migration** — `D-5` does not either. Both await an explicit implementation authorization.
