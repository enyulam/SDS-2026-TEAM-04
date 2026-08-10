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
