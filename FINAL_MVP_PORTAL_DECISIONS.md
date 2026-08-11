# FINAL MVP — PORTAL OPERATOR DECISIONS (`D-1` … `D-5`)

> **OPERATOR RULING INSTRUMENT — `CLAUDE.md` §2.3 class.** Ratified **2026-08-11**, after the Operator ran the decisions past **iSpeak Academy** and the client confirmed. Same standing as `FINAL_MVP_HERO_CHAIN_RULINGS.md` and `FINAL_MVP_PHASE0_OPERATOR_RULINGS.md`; indexed at `FINAL_MVP_AUTHORITY_LOCK.md` §2.3.
>
> ⛔ **IT AUTHORIZES NO IMPLEMENTATION.** No table, enum, column, audit action string, RPC, grant, policy, bucket, route, migration or screen is authorized here. Each of `D-1` … `D-5` still needs its own explicit Operator authorization, and the **PORTAL COMPLETION PLAN** — which does not yet exist — is where they are scheduled.
>
> ⚠️ **This file is the CITATION TARGET for the annotations placed across ratified authority on 2026-08-11.** It exists because a decision recorded only in a session transcript would leave every one of those annotations pointing at nothing, and `CLAUDE.md` §15.7 forbids a log being the sole authority for a ruling.

---

## Why this instrument exists at all

The decisions below **qualify or reverse rulings propagated into ratified authority on 2026-08-10** — some of them hours old. The Operator's own sequencing note is the reason this file came before any build:

> **None of this is a problem, but none of it may be built until the authority documents say so**, or a later session will read a prohibition and correctly refuse.

⚠️ That is not hypothetical. `A-038`'s prohibition was restated in **six active authority locations** beyond the amendment that defines it — including three bullets of `CLAUDE.md` §6, which every session reads at start. **A half-amendment would have been worse than none.**

---

## `D-1` · Management may see the nine per-dimension ratings — READ ONLY

**Ruling.** Management is permitted to view the nine per-dimension ratings on report surfaces. Management may **not** edit them, and may not edit attendance, observations, or the trainer's internal notes.

**Reasoning.** Management is the highest authority in the academy and approves reports about children; seeing the underlying assessment is reasonable oversight, not a leak. The boundary that matters is that *assessment is the trainer's job* — and read-only visibility preserves that boundary exactly. An assessment-level disagreement remains a **return to the trainer**, never a management edit.

**Amends.** `A-038`, in the **Management direction only**.

⛔ **`Q-27` IS UNTOUCHED. THE PARENT BOUNDARY DOES NOT MOVE.** The nine ratings must still never reach a Parent session — not a page, not a DTO, not a projection, not an RPC result, not a client payload. `D-1` grants Parent nothing.

---

## `D-2` · Session score — computed, never surfaced as a number

**Ruling.** A numeric session score is computed from the nine dimensions:

| Band | Value |
|---|---|
| Beginning | 25% |
| Developing | 50% |
| Mastering | 75% |
| Mastered | 100% |

Session score = the mean of the nine dimension values.
Cross-session score = the mean of session scores.

**Purpose.** To drive a **progression graph** showing a learner's trend across sessions. It exists for that.

**Constraints — all binding.**
- The number is **never rendered as a number** on any surface, to any role. It feeds a trend line and nothing else.
- Not a stored truth. Computed from the ratings, with the mapping in **one place**, so a change to the academy's model is a one-line change.
- ⛔ This is **not** the `G-2` "Overall Grade". No letter grade, no band label, no headline rating on any report surface. **`G-2` stands.**

**Client status.** The band-to-percentage mapping is client-ratified. This converts the previously *pending-client-ratification* mapping into a decided one **for this purpose**.

⚠️ **AND FOR THIS PURPOSE ONLY — recorded because the two are easy to conflate.** The mapping `CLAUDE.md` §3.6 and Authority Lock §11 hold as *pending client ratification* is the **4-level → 3-level term mapping** (`Mastered`→Excellent, `Mastering`→Good, `Developing`/`Beginning`→Needs Improvement) together with the **9 → 7 dimension roll-up**. Those are **different mappings for a different instrument**, and **both remain pending.** Ratifying `D-2`'s band→percentage mapping ratifies **neither**.

---

## `D-3` · Terms — as scheduling structure, not as reports

**Ruling.** Build terms as a real entity: sessions belong to lessons, lessons group into terms, terms scope the calendar and schedule surfaces across all three portals.

**Scope for the final MVP prototype submission** (after the demonstration).

**Explicitly still deferred.** End-of-term **report generation** remains out of scope. Building the term entity does **not** authorize term reports.

**Reverses.** `G-4`, which refused terms. The refusal was against building the substrate to render a *label*; this is structure the calendar features genuinely need.

---

## `D-4` · Lesson materials — management uploads, trainers download

**Ruling.** Build the lesson-materials feature.

**Information architecture.**

```
Classes / My Classes tab
  └─ a class the user is attached to  (e.g. Beginner — Public Speaking)
       └─ lesson plans for that class
            └─ a specific session      (e.g. Lesson 1)
                 ├─ Management: UPLOAD materials / slides / lesson content
                 └─ Trainer:    DOWNLOAD those materials
```

Role determines the action. Materials are associated with a **specific class session**, not with the class generally.

**Key focus chips — PERMITTED, with a hard constraint.** Their purpose is to give a trainer a quick refresher on what the session covers, before class. They are permitted **only** in a distinct visual position with a distinct label.

⚠️ **They must never occupy, replace, or visually adjoin the governed carried-over previous-session focus line.** That prohibition is unchanged and is the whole reason the chips were blocked: two different things in one position is an invisible substitution of a governed field.

---

## `D-5` · Video evidence — per-child, per-session, view-only

**Ruling.** Build evidence video.

| Property | Decision |
|---|---|
| Subject | The **individual child** whose report it is — not class footage |
| Uploader | **Trainer**, at assessment time |
| Association | Tagged to exactly **one session report**. Cannot be moved or reused |
| Verification | **Management views it before Approve & Submit.** Visual verification is part of the approval |
| Removal | Can be removed |
| Download | **No download control for any role, including Parent** |
| Visibility | Management · the authoring Trainer · the linked Parent — the same boundary the report text already uses |

**Honest limitation, to be stated rather than hidden.** Streamed video is technically retrievable by a determined user with browser tooling. The product provides **no download affordance**; it does not claim technical impossibility, and no surface should say otherwise.

**Consent.** Confirmed with the academy. Existing practice already shares performance recordings with parents, and the client has confirmed the processing is covered.

**Unblocks.** `A-001` (parent evidence projection), previously *ratified but armed and unactivated*.

**Unchanged.** The **TA / Assist. persona stays deferred** (`A-014`). `centre_membership_role` is **not** extended. `D-5` is independent of it.

---

## What was amended to carry these — 2026-08-11, one bounded run

Under an explicit bounded Operator instruction issued for that run, using the ratified **annotate-never-delete** method. Every superseded sentence remains visible with the reason it lapsed.

| Document | Clause | Carries |
|---|---|---|
| `docs/spec/…Amendment_004.md` | `A-038` | `D-1` |
| `CLAUDE.md` §6 | three bullets — per-row action gating · visibility rules · content hash | `D-1` |
| `FINAL_MVP_AUTHORITY_LOCK.md` | §11 · §13 · §14 | `D-1`, `D-2`, `D-4` |
| `FINAL_MVP_PHASE0_OPERATOR_RULINGS.md` | §4 | `D-1` |
| `docs/spec/…Amendment_008.md` | the `A-038`-unchanged line | `D-1` |
| `docs/spec/…Amendment_001.md` | `A-001` | `D-5` |
| `FINAL_MVP_HERO_CHAIN_RULINGS.md` | §3 (`G-3`) · §4 (`G-4`) · §8 (`G-8`) | `D-4`, `D-3`, `D-5` |
| `CLAUDE.md` §12 | the `G-3` KEY FOCUS stop-and-ask | `D-4` |

### ⚠️ `G-2` lost one of its three grounds, and the exclusion still stands

Authority Lock §14 excluded a Management roll-up **because** *"permitting it would deliver their aggregate to a reader `A-038` bars from their substance."* `D-1` removes that bar, so **that specific reason has lapsed.**

⛔ **`G-2`'s OUTCOME IS UNCHANGED.** It stands on its two other independent grounds — the roll-up is **unratified** (§11), and on a Parent surface it is the **caught leak in softened wording** (`Q-27`, §15). Either would exclude it alone. **The reason was corrected; the exclusion was not weakened.**

### ⛔ KNOWN FOLLOW-UP — deliberately NOT amended in that run

**The `~10` UI packs and `FINAL_MVP_EXECUTION_PLAN.md` still state `A-038`'s Management rating prohibition as live**, notably the `GC-6` entries on screens `11`, `15`, `16`, `17`, `18`, `28` and the notes on `19`. They were left alone by Operator ruling: they are **downstream and not read as authority at session start**, and a UI pack sits at **functional rank 5** (Authority Lock §28.2).

⚠️ **A reader must not take a pack's `GC-6` as a live prohibition after `D-1`.** Reconciling them belongs to the **PORTAL COMPLETION PLAN**, which is where those screens are built.

✅ **SCHEDULED 2026-08-11 BY RULING `C-18` BELOW — at plan phase `P1-1`, and with a WIDER SCOPE than this paragraph records.** The measured register is **6** pack files carrying a literal `GC-6` bullet (not `~10`), plus the reconciliation register row, the execution plan, **three** *"GC-5/GC-6 remain live"* restatements — **one of them in the Authority Lock itself** — and ⛔ **four LIVE SOURCE FILES**. See `C-18`.

---

# §C · PORTAL COMPLETION RULINGS — `C-1` … `C-18`

> **OPERATOR RULING SET, 2026-08-11**, issued on the eighteen governance collisions reported by the PORTAL COMPLETION PLAN's collision review. **Same `CLAUDE.md` §2.3 standing as `D-1` … `D-5` above.**
>
> ⚠️ **THIS SECTION IS THE CITATION TARGET** for the annotations placed on 2026-08-11 across `FINAL_MVP_AUTHORITY_LOCK.md` §8.1 and §15, `FINAL_MVP_HERO_CHAIN_RULINGS.md` §8, Amendment 001 `A-001`/`A-003`/`A-004`, and `UI_REFERENCE_FINAL_MVP/SCREEN_INDEX.md`. **It exists for the same reason this file does** — `CLAUDE.md` §15.7 forbids a log or a plan being the sole authority for a ruling.
>
> ⛔ **IT AUTHORIZES NO IMPLEMENTATION.** No table, enum, column, bucket, policy, RPC, grant, audit action string, migration, route or screen. `C-7` makes that explicit: **every new table family needs its own explicit Operator ruling at its phase.**

## The eighteen

| # | Ruling | Effect |
|---|---|---|
| **`C-1`** | ✅ **CORRECT THE PROPAGATION.** The `D-1` … `D-5` amendment run missed **Authority Lock §8.1 and §15**. Amend both to reflect `D-5`, annotate-never-delete, **stating the NEW GROUND explicitly**. Correct `G-8`'s *"regardless of any later evidence authorization"* clause the same way | ✅ **DONE** — three locations amended |
| **`C-2`** | ✅ **AMEND THE GATE, DO NOT INVENT A TABLE.** `A-001` gate (b) assumed **per-record** consent. The actual arrangement is **academy-level consent, already in place for existing practice**. Consent is recorded **once at the centre**, not per media item. ⛔ **No `consent_records` table** | ✅ **DONE** — `A-001` gate 2, propagated to `A-003`/`A-004` |
| **`C-3`** | ⛔ **DROP THE SCAN GATE AND RECORD THE LIMITATION HONESTLY.** No scanning infrastructure exists and **none will be built**. ⛔ **Do NOT invent a vocabulary or a fake state.** Record prominently — **in the instrument AND in the UI's own text** — that uploaded media is **not scanned** and that a production deployment would require it. ▶ **An honest absence beats a satisfied-looking gate** | ✅ **DONE** — `A-001` gate 5 removed; UI-text obligation binds every upload surface |
| **`C-4`** | ~~✅ add `evidence.attached` and `evidence.removed`. 16 → 18~~ ✅ **RE-RULED SAME DAY: ALL FOUR STRINGS, REGISTRY `16 → 20`** | ✅ **APPLIED** — `A-057` amended; ⚠️ **one collapse question reserved** |
| **`C-5`** | ⚠️ **GUIDANCE, NOT A GATE, AND SAY SO.** Evidence must be **VISIBLE** on the management review surface before Approve & Submit. **Whether a human watched it is not enforceable by software, and no attestation claiming otherwise will be built.** `A-036`'s checklist stays **trainer-only**. Record as **visibility required · attestation absent · enforced by nothing** | Binds plan phase `P1-3` |
| **`C-6`** | ⛔ **NO LESSONS ENTITY.** Terms group **SESSIONS**, not lessons. Lesson identity stays the **two columns on `class_sessions`**. **`G-3.1` and `A-016` both stand** | Binds `P2-2` |
| **`C-7`** | ⛔ **PER-PHASE AUTHORIZATION, not a blanket amendment.** Every new table family needs its own explicit Operator ruling at its phase | Binds `P1-2`, `P2-2`, `P2-6` |
| **`C-8`** | ✅ **ACCEPTED — `D-2` moves to Part 2, hosted on screen `18`.** Building a trend on `19`/`10`/`32`/`33` would **invent a visible element the frame lacks** — the same rule that gave `33` no trainer row | `P1-6` dissolved into `P2-9` |
| **`C-9`** | ⛔ **NO.** `D-1` covers **REPORT DETAIL surfaces only**. Ratings on a list or statistics surface is a **different disclosure shape — it invites comparison between children**, which was not authorized | Binds `P1-1`, `P2-7`, `P2-8`, `P2-9`, `P2-15`, `P2-16` |
| **`C-10`** | ✅ **ALL NINE.** Rendering the frame's four is **a selection of assessment substance with no ratified basis** | Binds `P1-1` |
| **`C-11`** | ⛔ **DEFER `28`.** `D-3` authorizes structure only; term reports stay deferred. ⚠️ **`A-044`'s requirement is noted and UNMET, DELIBERATELY** | `P2-24` = `NOT_STARTED`, ruled disposition |
| **`C-12`** | ⚠️ **REPORT FIRST, DO NOT BUILD.** Show what remains of `31` once the rating apparatus is removed, then it is ruled | `P2-23` blocked pending the report |
| **`C-13`** | ✅ **PERMITTED.** A parent seeing **their own child's date of birth and their own contact details** is not a disclosure defect | Binds `P2-22`; the narrower residue is identified below |
| **`C-14`** | ⚠️ **The field inventories need ratification — list them and they will be ruled** | `P2-11` … `P2-14`, `P2-2` blocked pending ratification |
| **`C-15`** | ⛔ **DEFER THE STUDENT PHOTO ENTIRELY.** PDPA-live and not worth it | Binds `P2-12`, `P2-14` |
| **`C-16`** | ⚠️ **RAISE THE LIMIT, but NOT to 500 MB.** `G-05`'s 50 MiB was chosen **without video in mind — a lapsed premise, not a licence for the frame's number.** A figure and its cost are to be proposed | Binds `P1-2`; proposal recorded in the plan |
| **`C-17`** | ✅ **GOVERNANCE WINS.** Build the two panels `CLAUDE.md` mandates. Record them as **governance-mandated additions the frame omits**, cited | Binds `P2-4` (`GC-9`), `P2-16` (`GC-10`) |
| **`C-18`** | ✅ **SCHEDULED AT `P1-1`, with the MEASURED scope, not the recorded one.** ⛔ **`management-dashboard.tsx`'s banner is the priority: it reaches the right conclusion for the wrong reason, and it is the file someone has open while implementing `D-1`.** Fourth stale-rationale instance | Binds `P1-1` |

**Measurement corrections accepted the same day:** `SCREEN_INDEX.md` is wrong about screen `10`'s route, and `09`'s `C2C-007` is **a refusal, not a lag**. ✅ **The index is corrected** (its Notes A and B).

## ✅ `C-4` — RE-RULED AND APPLIED. Registry `16 → 20`, all four strings

**The first `C-4` was held rather than applied.** The ruling and `A-057` named **different pairs**, and both said `16 → 18` — four distinct strings, one slot count. The reporting session recorded the discrepancy instead of picking a reading.

**The Operator re-ruled the same day, and recorded why:**

> *"ALL FOUR STRINGS. Registry 16 → 20, not 18. My '16 → 18' was arithmetic from a wrong premise — I did not know `A-057` already named two. This instruction is the bounded §12 authorization to extend beyond `A-057`'s 'must not be extended beyond these two strings', and amend `A-057` to record why: `D-5` authorizes a removal action that did not exist when `A-057` was written."*

**`evidence.uploaded` · `evidence.accessed` · `evidence.attached` · `evidence.removed`**

▶ **The deciding reason, in the Operator's words:** *"`evidence.accessed` is the only trace that a signed URL to a child's video was minted, for whom and when. That is an audit control, and dropping it to fit a slot count I invented would be the worst of the three options — more so now that `C-3` removed scanning."*

⚠️ **This is the clearest vindication in the corpus of holding a ruling instead of applying it.** The `replace` reading would have satisfied the instruction *as written* and **silently deleted an audit control** — and it would have looked like compliance. ▶ **A ruling with an internal arithmetic inconsistency is a stop-and-ask, not a puzzle to solve.**

✅ **`A-057` is amended** — `A-057.1` (four strings, `16 → 20`), `A-057.1a` (the reserved question), `A-057.2` (the *"must not be extended beyond these two"* clause struck, with **the prohibition re-armed at four**), the provenance quotation left **historical and unedited**, and both supersession-table rows updated.

### ⚠️ The one question the Operator RESERVED — `evidence.uploaded` vs `evidence.attached`

> *"If any two of the four are genuinely the same event under different names, say which and I will collapse them. **Do not collapse them yourself.**"*

**Answer: yes — `evidence.uploaded` and `evidence.attached` appear to be ONE governed action.** Under `D-5` the Trainer uploads **at assessment time**, and the object is **tagged to exactly one session report** and **can never be moved or reused**. **No authorized workflow leaves an object unattached to be attached later**, so the upload *is* the attach.

⛔ **It matters because `A-029` requires ONE EVENT PER GOVERNED ACTION** — a rule `A-057`'s own supersession table lists as *preserved unchanged*. Two strings for one action puts the registry in tension with it.

▶ **Nothing is baked in and the collapse stays cheap.** The **live registry is still 16**; `A-057` has never been implemented in any migration. **If collapsed, the registry is `16 → 19`.** ⛔ **No implementation phase may proceed on the four strings until this is ruled** — recorded at `A-057.1a` so it cannot be lost between documents.

## The remaining rulings, as applied

| # | Ruled | Applied |
|---|---|---|
| **`C-12`** | ✅ **Calendar marking: use BOTH ratified states, distinguishably.** *"A session occurred"* and *"a report is available"* are **different facts and a parent needs both**. ⛔ **Invent no third state.** ⚠️ **SC 1.4.1 applies** — if two states cannot be shown distinguishably without colour carrying meaning alone, say so | Plan §6.1; the accessibility answer is recorded there |
| **`C-13`** | ✅ **Accepted — and the framing correction IS the finding:** §15 governs the **report projection** and Profile Details is a **Dashboard element**. A report-scoped rule applied to a non-report surface. ⛔ **The TA field stays prohibited under `A-014`** | Plan §6.2 |
| **`C-14`** | ✅ **Omit all six recommended.** **Ratified fields: learner name · class · trainer · enrolment date · guardian name · guardian contact.** Everything else needs its own ruling at its phase. ⚠️ **`trainer_profiles` and `parent_profiles` carry no name, email or phone — so guardian name and contact NEED COLUMNS, and that schema authorization comes at the phase, not now** | Plan §6.3 |
| **`C-16`** | ✅ **`100 MiB` — the cheaper option on every axis.** ⛔ **Enforce PER BUCKET and re-validate server-side**; `config.toml`'s global `file_size_limit` **must not silently widen the deferred photo and materials buckets**. ⚠️ **Resumable upload is REQUIRED, not optional** — a single-shot POST on classroom wifi is *"a failure mode we would be designing in"* | Plan §6.4 |
| **`A-002`** | ⛔ **NOT RULED, deliberately. `P1-5` stays blocked.** It comes back as **its own question** when Part 1 reaches it — *"a §10 phase-ordering rule deserves its own ruling, not a footnote"* | Plan `R-5` |

## ⚠️ `C-13` — the narrower residue, as asked

**The ruling is applied: DOB and contact are permitted.** The Operator asked what the registered defect is if it is something narrower. **It is two things, and neither is the child's own data:**

1. ⛔ **The `Trainer Assistant (TA)` field** in the same Profile Details row. `A-014` defers the TA persona and `G-7` binds `centre_membership_role` against extension. **This is live and prohibited**, and `C-13` does not reach it.
2. ⚠️ **The cited rule never reached this surface.** Authority Lock §15 filed the DOB/contact finding against *"§15's four-prose-panels-only rule"* — but **§15 governs the PARENT REPORT PROJECTION**, and Profile Details is a **Dashboard** element, not a report panel. ▶ **A report-scoped rule was applied to a non-report surface.** The ruling is therefore not an exception to §15; **§15 was never the right instrument**, which is why the finding did not survive contact with a decision.

## ⛔ One gate `C-1` did NOT reach

**`A-002` — *"actual parent evidence access is first implemented and tested in Phase 2, never Phase 1"*** — is untouched by `C-1`, and `CLAUDE.md` §10 Phase 2 has not been entered. It is **not** amended here. **It blocks plan phase `P1-5` and is recorded as outstanding.**
