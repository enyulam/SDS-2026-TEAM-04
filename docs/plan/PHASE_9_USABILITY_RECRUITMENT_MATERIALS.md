# Phase 9 — Usability recruitment materials (DRAFT, PREPARATION ONLY)

> **Document class:** procedural planning artefact. **It governs nothing** and cannot override the specification, an amendment, the Authority Lock or `CLAUDE.md`.
>
> **Authority:** Operator ruling **G-02 / P0-T07**, 2026-08-08, recorded in `FINAL_MVP_PHASE0_OPERATOR_RULINGS.md`. That ruling authorizes **recruitment/outreach preparation and scheduling by the Operator**. It does **not** authorize Claude to conduct or claim Phase-9 testing.

---

## ⚠️ STATUS — READ THIS BEFORE USING ANY TEXT BELOW

| Fact | Value |
|---|---|
| Participants contacted | **ZERO** |
| Participants consented | **ZERO** |
| Usability sessions conducted | **ZERO** |
| Findings collected | **ZERO** |

**Nothing in this file asserts that any of the above has happened.** These are unsent drafts. **No participant, session, consent record or finding may ever be fabricated** (Authority Lock §26.4, `CLAUDE.md` §12). **Automated evidence — C1/C2/C3/C4, G-6, browser tests, integration tests, synthetic fixtures — must never be relabelled as human usability evidence.** That prohibition is absolute and is not softened by this file existing.

**Outreach is the Operator's to perform.** Claude does not send, schedule or contact.

---

## 1. Who to recruit

**Adults only. Do not recruit children for this project. Do not use real child records.** (Operator ruling G-02.)

Recruit **representative** adults who can reason about each of the three governed perspectives:

| Perspective | A representative participant looks like |
|---|---|
| **Trainer** | Anyone who teaches, coaches, tutors or assesses learners and would plausibly fill in a structured observation |
| **Management** | Anyone who reviews other people's written work for quality before it goes to a third party |
| **Parent** | Any parent or carer who receives progress reports about a child |

**The brief mandates no participant count, no consent process and no research protocol** — that is a verified fact about the brief, not an omission here. Aiming for coverage across all three perspectives is a **practical preference**, and **must never be presented as a course requirement**.

---

## 2. Recruitment message (draft — Operator sends, or does not)

> **Subject:** 20–30 minutes to try a student-progress reporting tool?
>
> Hi —
>
> I'm building a small education reporting tool for a university project and I'm looking for a few people to try it and tell me where it's confusing.
>
> It takes about **20–30 minutes**, it can be done over a call or in person, and there's no preparation needed. You don't need any technical background — I'm testing the tool, not you, and there are no wrong answers.
>
> All the data in the system is **made up**. No real children, no real schools, and nothing about you or anyone else is stored by the tool.
>
> If you're up for it, let me know a couple of times that suit you.
>
> Thanks,
> [Operator name]

**Notes for the Operator.** Keep the "I'm testing the tool, not you" line — it measurably improves the honesty of usability feedback. Do not promise a payment or incentive unless you intend to provide one.

---

## 3. Information and consent sheet (draft)

> **What this is.** A short usability session for a university project — an education reporting tool where a trainer records observations about a learner, an AI drafts a progress report, the trainer approves it, a manager reviews and publishes it, and a parent reads it.
>
> **What you'll do.** Work through a few short tasks while talking aloud about what you expect to happen. I'll watch where you hesitate or go the wrong way. **About 20–30 minutes.**
>
> **What is recorded.** Notes on what was hard, confusing or slow. **No audio or video recording unless you agree separately.** Your name is not attached to the notes; you appear as e.g. "Participant 2".
>
> **What data is in the system.** Everything is synthetic. There are **no real children, no real families and no real schools** in it. Nothing you enter is kept after the session.
>
> **Your choices.** Taking part is voluntary. You can skip any task, stop at any point, and ask me to discard your session afterwards — no reason needed, no consequence.
>
> **What happens to the findings.** Anonymous observations ("participants missed the Absent toggle") go into a university project report and may be shown in a class presentation. **Nothing identifying you is included.**
>
> **Questions:** [Operator contact]
>
> ---
>
> I have read the above and agree to take part.
> Name ............................ Signature ............................ Date ..............
> ☐ I additionally agree to audio recording *(optional — leave blank to decline)*

**Scope note.** This sheet is deliberately proportionate: synthetic data, adult participants, no special-category data, no child data. **Consent records live outside the product entirely** (`CLAUDE.md` §3.1) — **do not build a consent surface in the application**, and note that Operator ruling **G-05 item 5** separately rules `consent_records` **out** of the Final MVP.

---

## 4. Scheduling instructions (for the Operator)

1. Offer two or three concrete slots rather than asking "when are you free?" — it roughly halves the back-and-forth.
2. Book **45 minutes** for a 20–30 minute session; overrun is normal and rushing the debrief loses the most useful material.
3. Confirm the day before.
4. Keep a simple private list — participant label (`P1`, `P2`, …), perspective, date, whether consent was signed. **Keep it outside this repository.**
5. **Leave time for the improvement leg.** The brief requires usability testing **and documented improvements made as a result**, so sessions must land early enough that fixes can actually be made and recorded afterwards. This is the single scheduling constraint that matters most.

---

## 5. Task protocol (draft — for use at Phase 9, not before)

Think-aloud, task-based. **Do not lead the participant**; when asked "what should I do?", answer "what would you try?"

**Trainer perspective**
1. Find today's session and open its roster.
2. One learner is absent — record that.
3. Complete the nine-dimension assessment for one learner.
4. Generate the draft report, review it, and approve it.

**Management perspective**
5. Find the report waiting for review.
6. Improve the wording of one panel without changing any assessment fact.
7. Publish it to the parent.
8. *(Alternate path)* Send one back to the trainer instead, and say why.

**Parent perspective**
9. Find your child's latest report and read it.
10. Say what you think the trainer wants you to do before the next session.

**Observation targets — where this design is most likely to fail a real person**
- Is the **Present-by-default** attendance model understood, and is the **Absent** toggle findable? *(This control is a governed functional insertion, not drawn in the frozen frame — G-04 item 3 — so it deserves particular attention.)*
- Does the trainer grasp that **approving does not publish**?
- Does management understand it may fix **wording only**, and that a factual problem means **returning to the trainer**?
- Does the parent understand the report **without** seeing any per-dimension ratings? *(Q-27 removes them from every parent surface — check the parent still feels informed, not short-changed.)*
- Is the **three-item quality checklist** understood as an attestation about *this exact text*?

**Record for each task:** completed unaided / completed with a hint / not completed · where the participant hesitated · what they said they expected · their words, not a paraphrase.

---

## 6. What must happen after the sessions

The brief requires **documented improvements made as a result**. So each session produces:

1. a findings entry (what failed, for whom, on which task);
2. a disposition — fixed, deferred, or won't-fix **with a reason**;
3. for anything fixed, a **traceable change** and the evidence it landed.

⚠️ **A finding that touches governed behaviour is not a free fix.** Usability feedback never overrides a ratified rule — if a participant wants something the governance forbids (for example, showing a parent the nine ratings), the finding is **recorded and refused**, and the refusal is itself a result worth reporting. **Governance-touching remediation is gated (G-22).**
