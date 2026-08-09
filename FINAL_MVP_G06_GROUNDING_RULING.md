# FINAL MVP — G-06 GROUNDING RULE SET: OPERATOR RULING

**Instrument class:** Operator ruling carrier (`FINAL_MVP_AUTHORITY_LOCK.md` §2.3 class).
**Ratified:** 2026-08-09, Asia/Singapore, by explicit Operator instruction
*"MAXIMUM SAFE AUTONOMY — HERO-FIRST DEMONSTRATION READINESS RUN (v2)"*.
**Location:** repository root — the canonical execution boundary (`CLAUDE.md` §9.1).

---

## 0. What this instrument does, and what it does not

**It resolves `G-06` / `P1-T09`.** `FINAL_MVP_EXECUTION_PLAN.md` P1-T09 carries
**Operator gate: YES**, and `FINAL_MVP_OD4_REPORT_SEMANTICS_RULING.md` §5.2 holds
that *"the correct new rule set is a design decision, not a rename … must be
designed and proven with a deliberate contradiction case before it ships."*
That gate is now **crossed**. The rule set below is ratified.

**It discharges the `R-A` / `R-B` / `R-C` question** posed by
`docs/plan/G06_GROUNDING_RULE_DESIGN_PACKET.md` §3.4 — see **§G06-5** and the
mapping recorded in **§2** of this instrument.

**It closes the LAST of the two OD-4 Phase-B sub-rulings.** The other — the
content-hash envelope version — was ruled on 2026-08-08 as **G-05a**
(`FINAL_MVP_PHASE0_OPERATOR_RULINGS.md`). Authority Lock §15.1 and §31's
open-decision register may now record **zero** open OD-4 sub-rulings.

**It authorizes implementation of the semantics below, and nothing else.**
It creates no schema object, no enum value, no audit action string, no RPC, no
grant and no migration. It weakens no privacy, approval, audit or evidence
control. It does not touch the parent boundary, Q-27, A-038, A-052 or the
eight-status set. **The AI still drafts and never rates** — every rule here is
grounding *validation*, which can only ever REJECT a draft; none of it lets the
model author, alter or infer an assessment fact.

---

## 1. THE RULING — recorded verbatim

> The eight sections below (`G06-1` … `G06-8`) and the `G-06 REQUIRED PROOFS`
> list in §3 are reproduced **verbatim** from the ratifying Operator
> instruction. Formatting is preserved; no word has been added, removed or
> reordered. Commentary by this project appears **only** in §2 and §4, which
> are clearly marked as such.

### G06-1 — NINE-CODE COVERAGE / FAIL CLOSED

Ratify the packet's Rule 1b direction:

the grounding system must recognise/cover ALL NINE canonical B.E.S.T dimension
codes used by the authoritative observation/rating model.

Rule 1b must assert COVERAGE of all nine codes, not a count. A merely DUPLICATED
dimension code must not satisfy it.

No dimension/rating may silently drop out because a mapping is absent.

Unknown, impossible, missing-map or otherwise unmapped rating/dimension state:

FAIL CLOSED.

Do not silently:

continue
skip
return undefined
ignore the dimension.

Use the CURRENT canonical vocabulary from current authority
(Beginning / Developing / Mastering / Mastered; storage beginning / developing /
mastering / mastered).

Do not revive superseded historical rating vocabulary.

### G06-2 — STRENGTHS

The polarity-contradiction rule applies to:

strengths

Strengths means:

positive demonstrated capability / behaviour / progress grounded in Trainer
facts.

A claim about a dimension whose authoritative rating/polarity does not support
that positive claim must be REJECTED.

Do not allow a non-positive dimension to be presented as mastered/strong/
demonstrated capability merely because the sentence contains a development
keyword.

This remains grounding validation.

AI still does not rate.

### G06-3 — OVERVIEW

Do NOT inherit the Strengths-positive-only rule into:

overview

Overview may contain:

- overall synthesis;
- positive context;
- developmental context;
- mixed performance context;

where grounded.

A legitimate developmental statement in Overview must not be rejected merely
because the underlying dimension is non-positive.

HOWEVER:

this is not permission for contradiction.

General factual/rating grounding still applies across Overview.

If Overview claims mastery/positive performance that contradicts authoritative
Trainer facts, another appropriate general grounding rule must reject it. This
specifically includes the measured C7 defect: ACHIEVEMENT_TERMS carries
"very strong" but not bare "strong", so Overview can currently praise a
needs_support dimension. Close it by WIDENING THE LEXICON, not by applying the
Strengths rule to Overview — which would false-reject the legitimate
developmental-context case.

"No Strengths-specific polarity rule" does NOT mean "no grounding".

### G06-4 — AREAS FOR DEVELOPMENT

Do NOT apply the Strengths-positive rule to:

areasForDevelopment / areas_for_development

This panel is expected to describe grounded needs for development/support.

A non-positive dimension may legitimately appear here.

Again:

unsupported/factually contradictory claims remain prohibited by the general
grounding system.

### G06-5 — REMARKS

Operator ruling:

REMARKS IS GROUNDED BUT POLARITY-NEUTRAL.

Do not impose:

positive-only
or
development-only

semantics.

Remarks may contain additional relevant grounded commentary that does not fit
naturally into Overview / Strengths / Areas for Development.

Remarks is NOT an unrestricted claims channel.

All ordinary grounding protections remain:

- supported by authoritative Trainer facts;
- no fabricated event;
- no invented rating;
- no contradictory capability claim;
- no authority escalation;
- no unsupported personal claim.

Map this ruling to whichever R-A / R-B / R-C packet option exactly represents
these semantics.

If none of the packet labels exactly represents it, implement the stated
semantics rather than forcing the wrong label, and record in the ruling
instrument which label was rejected and why.

### G06-6 — SUPPORT-FRAMING ESCAPE

Do NOT retain a panel-wide keyword escape.

Words such as:

develop
developing
building
practice
practising
improving
working on

must NOT make an entire Strengths panel exempt from contradiction detection.

Minimum acceptable scope:

CLAIM/SENTENCE + REFERENCED DIMENSION LOCAL.

A support/development phrase about one dimension cannot immunize a contradictory
positive claim about another dimension in the same panel.

This must also close the measured C8 defect: the escape word sitting INSIDE the
contradicting sentence. Sentence-scoping alone does not close C8 — the lexicon
must narrow too, because the current escape lexicon contains ordinary Strengths
vocabulary.

Prefer deterministic transparent logic over broad heuristic exemptions.

If reliable clause-level analysis already exists, use it.

Otherwise sentence-local + dimension-local is the minimum accepted boundary.

Prove this with bypass regression cases.

### G06-7 — RULE 3 FAIL-OPEN

Close the known Rule-3 shape:

unmapped / impossible rating
→ polarity undefined
→ validation skipped.

New result:

unmapped / impossible rating
→ deterministic grounding failure.

No fail-open skip.

This covers both measured legs: C5 (unmapped rating) and C6 (duplicated
dimension code leaving another code absent from the band map).

### G06-8 — FIVE MEASURED DEFECTS

Read the exact measured defects recorded in:

docs/plan/G06_GROUNDING_RULE_DESIGN_PACKET.md

(as of the last checkpoint: C4, C5, C6, C7, C8 — verify the current set at
source rather than trusting this list).

Remediate all that are:

- fail-open defects;
- detector-vacuity defects;
- coverage defects;
- anchor-existence defects;
- bypass defects;
- correctness defects

and whose intended semantics are fully resolved by this G-06 ruling/current
authority.

Do NOT stop merely because the defect was previously "recorded-not-fixed".

The Operator is explicitly authorizing their correction under these semantics.

If one of them genuinely requires a NEW semantic/product decision that is not
resolved above:

isolate that specific decision.

Continue all independent safe work if the dependency graph permits.

Stop only if it actually blocks the hero-critical path.

---

## 2. PROJECT RECORD — the `R-A` / `R-B` / `R-C` mapping, as `G06-5` requires

`G06-5` requires this instrument to name which packet label was selected, and,
where a label is rejected, why.

**SELECTED: `R-A`.** The packet's `R-A` reads: *"Rule 4 does **not** apply
[in Remarks] … Remarks is treated like Overview: it may mention a needs_support
dimension in context, and rule 3 still blocks achievement claims."* That is
**exactly** *"grounded but polarity-neutral"* with *"all ordinary grounding
protections remain"* — the Strengths-specific polarity rule is absent, and
rules 1, 1b, 2, 3 and 5 apply in full. **No forcing was required; `R-A` is an
exact representation of the ruled semantics, so §G06-5's fallback clause is not
invoked.**

**REJECTED: `R-B`** — it applies the Strengths positive-only rule to Remarks,
which is precisely the *"positive-only … semantics"* `G06-5` forbids imposing.

**REJECTED: `R-C`** — it applies rule 4 conditionally on a *celebratory* claim,
which is still a polarity posture rather than polarity-neutrality, and the
packet records that it *"needs a new lexicon, and a new lexicon is a new failure
surface."*

⚠️ **`R-A` is not "Remarks is ungoverned".** Required proof **5** (§3) demands
that an unsupported or contradictory Remarks claim be **REJECTED through general
grounding** — rules 2, 3 and 5 reach Remarks, and rule 3's lexicon is widened by
`G06-3`. The packet's measured case **C3b** (*"a real highlight worth
celebrating"* about a `needs_support` dimension) is retained as a permanent
regression case and its verdict is re-measured against the implemented rule set
rather than assumed from its pre-ruling reading.

---

## 3. G-06 REQUIRED PROOFS — recorded verbatim

At minimum permanently prove:

1. deliberate contradiction in Strengths:
   REJECT;

2. legitimate developmental Overview:
   ACCEPT;

3. legitimate Areas for Development:
   ACCEPT;

4. grounded neutral Remarks:
   ACCEPT;

5. unsupported/contradictory Remarks:
   REJECT through general grounding;

6. unknown/unmapped rating:
   REJECT;

7. all nine canonical dimension codes:
   recognised — proven by COVERAGE, not by count, and not satisfiable by a
   duplicate;

8. panel-wide support-word bypass:
   cannot bypass;

9. support phrase for dimension A cannot immunize contradictory positive claim
   for dimension B;

10. required grounding anchors disappearing:
    FAIL CLOSED.

Every new control must be proven capable of FIRING against a deliberately
planted regression, in the manner already established by this project's
prove-* harnesses. A control that has never been demonstrated failing is not
evidence.

Run the existing G-06 evidence harness plus permanent tests.

---

## 4. PROJECT RECORD — what this ruling deliberately does NOT ratify

Recorded so that no later session mistakes silence for authorization. Each item
below was raised by the design packet and is **not** resolved by §1; each
remains a `CLAUDE.md` §12 stop-and-ask.

| Packet item | Status under this ruling |
|---|---|
| **`developing` in Strengths** (packet §3.1) — should rule 4 extend from `needs_support` to `developing`? | **NOT extended.** Rule 4 stays `needs_support`-only, per the packet's own recorded recommendation. `G06-2`'s *"non-positive"* concern is already discharged **in full** by rule 3, whose polarity guard fires for `needs_support` **and** `developing` in **all four** panels. This is a recorded disposition, not a novel one. |
| **Rule 4b** (packet §3.3) — a `positive` dimension presented in Areas for Development as a deficiency | **NOT implemented.** It is a **new control**, not a migration of an existing one, and `G06-4` ratifies only that the Strengths rule must not extend to that panel. Adding it would change rejection behaviour on an unruled basis. **Remains open.** |
| **`DIMENSION_TERMS.audience_awareness` carrying bare `audience`** (packet §8) | **NOT narrowed.** It is a *precision* defect, not a fail-open, and it is absent from the `C4…C8` set `G06-8` names. Narrowing it would **loosen** detection, which is the one direction this ruling never authorizes. **Remains open.** |
| **The fixture provider's fabricated `"participation"` strength** (packet §8.1) | **In scope, as a correctness defect.** The packet records that *"the fallback should be re-derived when the rule set is ratified"* — the rule set is now ratified, and the provider is on the hero path. It is repaired under `G06-8`'s *correctness defects* class, **fail-closed**: where no dimension supports a positive claim, the provider must not invent one. |

---

## 5. SECOND G-06 DECISION — celebratory wording, ratified 2026-08-09

**Status: RATIFIED.** Issued by the Operator later the same day, on the residual that `P1-T09` reported rather than absorbed. It is recorded here because `CLAUDE.md` §15.7 requires an Operator ruling that changes product behaviour to be propagated into an ACTIVE authority document, and because a decision that lives only in a progress log is unratified by §15.1.

**The residual it closes.** `G06-5` makes Remarks *grounded but polarity-neutral*, and required proof 5 demands that an unsupported or contradictory Remarks claim still be **REJECTED through general grounding**. That general mechanism is rule 3 — which is **lexical**. The design packet's own canonical contradictory-Remarks case, **`C3b`** (*"Eye contact was a real highlight worth celebrating at home"* against a `needs_support` rating), was therefore **still ACCEPTED** after `G06-1`…`G06-8`, because `highlight` was not in `ACHIEVEMENT_TERMS`. A genuine contradiction was passing.

**The ruling.** `highlight` and `worth celebrating` are ratified into **`ACHIEVEMENT_TERMS`**.

**What this is, and what it deliberately is NOT:**

- It is the **same mechanism `G06-3` already uses** — *close the gap by WIDENING THE LEXICON* — applied to a second measured case. `G06-3` names bare `strong` for `C7`; this names celebratory wording for `C3b`.
- **`R-A` is UNAFFECTED and is not being quietly walked back.** Rule 4 still does not reach Remarks, and Remarks remains **polarity-neutral**. What changed is what counts as an **achievement claim in all four panels** — rule 3's job, and rule 3 always reached Remarks. **No panel gained a polarity posture.**
- It changes rejection behaviour, which is exactly why it required a ruling rather than a judgement call (`CLAUDE.md` §12).

**False-rejection risk, measured rather than asserted.** Rule 3 fires only when a sentence carries achievement language **and** names a dimension whose own rating is non-positive. Celebratory wording about a **positive** dimension stays legal in every panel — permanently asserted at `G06-R1`/`R2`/`R3` in `prove-g06-grounding.mjs`. The rejection tracks the **contradiction**, never the vocabulary.

**Proof obligations discharged.** `C3b` is promoted from a printed residual to an **asserted proof** (`G06-P5d`), with the identical wording also asserted in Overview (`G06-P5e`) to demonstrate this is a lexicon fix and not a per-panel rule. A **mutation proof** (`G06-M4`) removes the two terms and requires `C3b` to go green again, so the addition is demonstrably load-bearing.

⚠️ **One recorded consequence, because it is instructive.** Adding `highlight` made rule 3 reject the packet's literal `C8` sentence outright, which caused the **existing mutation proof `G06-M1` to FAIL LOUDLY** — that case could no longer isolate rule 4's support-framing escape. The case was **re-derived**, not deleted and not relaxed; the literal `C8` sentence remains asserted at `G06-P8-same[…]` and is now caught by **two independent rules instead of one**. This is the mutation section doing precisely the job it exists for, and it is recorded rather than smoothed over.

**Still NOT ratified**, and still `CLAUDE.md` §12 stop-and-ask: every item in §4's table above — extending rule 4 to `developing`, the inverse **rule 4b**, and narrowing `DIMENSION_TERMS.audience_awareness`. **This decision widens one lexicon and nothing else.**

**No rating validation is weakened anywhere by this ruling.** Every change it
authorizes moves in the fail-closed direction: more coverage asserted, narrower
escapes, a wider achievement lexicon, and an unmapped state that rejects instead
of skipping.

---
---

# HERO-FIRST RESEQUENCING RULING

**Instrument class:** Operator execution ruling. **Ratified:** 2026-08-09, by
the same instruction that ratified G-06 above, *"issued with knowledge of
`CLAUDE.md` §10 … §15.6 … and §15.11"*.

**This section is process, not product. It changes no product rule, no
governance control and no acceptance standard.** It is carried here, rather
than in a third root file, because the ratifying instruction directed exactly
that.

## H-1 — Scope

Applies **only** within Plan Phases 0–4, i.e. only within the range already
covered by the recorded `STANDING_LOCAL_EXECUTION_AUTHORIZATION`
(`Plan Phases 0 THROUGH 4`, granted 2026-08-08, LOCAL only). It extends that
authorization's *range* not at all; it settles two questions *inside* it.

## H-2 — Deferring a non-hero Phase-2 task is a RECORDED disposition

`CLAUDE.md` §15.11 makes a **novel** disposition a stop. Deferring a Phase-2
task that is not on, and not a dependency of, the hero lifecycle is **hereby a
recorded disposition** and therefore **not** a stop. Each such task is recorded
`NON-HERO — PENDING`. **It is never marked `PASS`, and it is never removed from
`FINAL_MVP_EXECUTION_PLAN.md`.**

## H-3 — Entering Phase-3 shared-baseline and role-track work before Phase 2 completes is AUTHORIZED

Subject to the dependency and stability conditions in the ratifying
instruction: the hero-critical server/database contracts must be **proven
stable and committed** first, and all `CLAUDE.md` §14.3 worktree conditions —
one writer per worktree, a committed disjoint ownership manifest, a pinned
integration sequence, and **validation as a global mutex** — bind in full.

## H-4 — Ratified reporting vocabulary for partial phases

Alongside `CLAUDE.md` §15.6's seven states, which are **otherwise unchanged**:

```
PHASE n — IN PROGRESS
HERO-CRITICAL SUBSET — PASS
NON-HERO TASKS — PENDING
```

**`PHASE n COMPLETE` is written only when the actual full phase exit criteria
pass. `Operator Accepted` is never written by any session** — `PASS` is an
evidence verdict; `Accepted` is Operator-set only (§14.1, §15.6, §15.11).

## H-5 — Assessment evidence is OUT of the hero slice

Evidence media remains a **Final MVP completion requirement** with the
**Trainer** as the ruled uploader (Authority Lock §8, §8.1). It is **not** part
of the hero demonstration slice and **does not gate the hero lifecycle**.

Consequently, in this execution window: **no** storage bucket, storage policy,
evidence table, evidence RPC, signed-URL minting or evidence UI is created; the
**Step 7H audit registry stays at 16 strings** (Amendment 008 / A-057 ratifies
`evidence.uploaded` and `evidence.accessed` but **authorizes no
implementation**); every evidence task is recorded `NON-HERO — PENDING`; and
the hero lifecycle runs **without** an evidence upload step.

**Every A-001 / A-003 / A-004 safeguard remains fully in force** for whenever
evidence is implemented. The feature is descoped from this window; the
protection is not.

## H-6 — Authentication in automated runs

Fixture passwords may be entered **only** through no-echo interactive stdin at
an Operator-controlled terminal (`CLAUDE.md` §11, absolute). An unattended
session therefore **cannot** perform a real password sign-in.

Browser hero legs authenticate by **admin-minted session**
(`auth.admin.generateLink({ type: 'magiclink' })`), the mechanism already
established and accepted in `run-integration.mjs`, `run-c3-bypass.mjs`,
`prove-disposable-app.mjs` and `prove-governed-lifecycle.mjs`. **This is
authorized.**

Every login / logout / re-login step is recorded as:

```
ADMIN-MINTED SESSION — password sign-in NOT-RUN (Operator credential required)
```

⚠️ **An admin-minted session is never described as a sign-in proof, a login
proof, or evidence that authentication works. It proves post-authentication
behaviour only.** `prove-disposable-identity-linkage.mjs`'s real
`signInWithPassword` leg **stays NOT-RUN** and must not be weakened or worked
around; the real sign-in leg belongs to the Operator's manual demonstration
rehearsal.

## H-7 — What this resequencing can never carry

Unchanged and binding in full: every `CLAUDE.md` §12 stop-and-ask, and every
non-inheritable gate in §15.11 — new governance/product/security semantics ·
editing ratified authority outside an explicit bounded per-run instruction ·
credentials · hosted Supabase · **any real or paid provider call** · any action
with a cost · public deployment or public tunnel · human recruitment or testing
· adding a remote · push · final submission · `supabase db reset` · any
history-touching git operation · a Critical/High finding that invalidates the
plan being executed.
