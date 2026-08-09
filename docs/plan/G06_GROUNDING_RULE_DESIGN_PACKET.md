# G-06 / P1-T09 — OD-4 GROUNDING RULE SET: DESIGN AND PROOF PACKET

> ## ✅ RATIFIED 2026-08-09 — this packet's question has been ANSWERED
>
> ~~**Status: PROPOSAL. NOTHING HERE IS RATIFIED. NOTHING HERE IS IMPLEMENTED.**~~
> **The Operator ratified the rule set on 2026-08-09. The canonical instrument is
> `FINAL_MVP_G06_GROUNDING_RULING.md` (repository root) — read it, not this
> header, for the binding semantics.**
>
> **WHAT IS NOW RATIFIED:** **rule 1b** as COVERAGE of all nine dimension codes,
> not a count and **not satisfiable by a duplicate**, with unknown / impossible /
> unmapped state **FAILING CLOSED** (§6, §6.1 — `G06-1`, `G06-7`) · **rule 4
> scoped to `strengths` only** (§3.1 — `G06-2`) · **NOT inherited into
> `overview`** (§3.2 — `G06-3`) · **NOT applied to `areasForDevelopment`**
> (§3.3 — `G06-4`) · **`R-A` SELECTED for Remarks** — *grounded but
> polarity-neutral*; **`R-B` and `R-C` are REJECTED** (§3.4 — `G06-5`) ·
> **option 3b, bare `strong` added to `ACHIEVEMENT_TERMS`** (§6.2 — `G06-3`
> directs closing C7 by widening the lexicon) · the **support-framing escape
> re-derived sentence-local AND dimension-local with a narrowed lexicon**
> (§5, §5.1 — `G06-6`) · and **C4, C5, C6, C7, C8 all authorized for
> correction** (§7 — `G06-8`).
>
> **WHAT IS STILL NOT RATIFIED, and remains a `CLAUDE.md` §12 stop-and-ask:**
> extending rule 4 to `developing` (§3.1 — recommendation NO stands, and is now
> the recorded disposition) · the **inverse rule 4b** (§3.3) · narrowing
> `DIMENSION_TERMS.audience_awareness` (§8).
>
> **The measured evidence below is NOT rewritten.** §1–§9 record what was true
> **before** implementation, which is exactly what makes the post-implementation
> re-measurement meaningful. §7's *Current* column is a **pre-ruling** reading
> and must be read as history; re-run the probe for current behaviour. §10's
> recommendations were **accepted** except as noted above.

This packet exists so the Operator can ratify (or reject, or amend) a rule set
on evidence. It changes no production behaviour. The only production change
made in this run is recorded in §2 and is deliberately the *minimum* that keeps
the existing control alive.

**Authority.** `FINAL_MVP_OD4_REPORT_SEMANTICS_RULING.md` §5.2 — *"The correct
new rule set is a design decision, not a rename … must be designed and proven
with a deliberate contradiction case before it ships."* `CLAUDE.md` §12 makes
retargeting rule 4 at `overview` by rename an explicit stop-and-ask.
`FINAL_MVP_EXECUTION_PLAN.md` P1-T09 — **Operator gate: YES**.

**Every behavioural claim below was MEASURED**, not asserted, by
`scripts/tests/g6-harness/g06-grounding-evidence.mjs`. Re-run it to check this
document rather than trusting it:

```
node --import ./scripts/tests/integration/alias-loader.mjs \
     scripts/tests/g6-harness/g06-grounding-evidence.mjs
```

It constructs no provider, makes no network call, needs no database row, and
exits 0 regardless of outcome — a non-zero exit would read as a verdict the
Operator has not given.

---

## 1. What the pipeline does today

`server/modules/ai-drafting/grounding.ts` — `validateGrounding(panels, input)`
is pure and returns every violated rule at once.

| # | Rule | Scope | Migrated mechanically to OD-4? |
|---|---|---|---|
| 1 | The saved assessment must carry exactly nine ratings | assessment, not panels | n/a — untouched |
| 2 | Rating **attribution** and taxonomy disclosure (A-052) never reach a panel | all four panels, concatenated | ✅ yes — iterates `PANEL_KEYS` |
| 3 | **Polarity contradiction**, per sentence: a sentence carrying achievement language may not name a non-positive dimension | all four panels | ✅ yes — iterates `PANEL_KEYS` |
| 4 | A `needs_support` dimension may not be presented as **the** strength | **one named panel** | ❌ **no — this is the G-06 decision** |
| 5 | No unresolved placeholder token | all four panels, concatenated | ✅ yes — iterates `PANEL_KEYS` |

Rules 2, 3 and 5 were **verified** to iterate `PANEL_KEYS`, not assumed.

---

## 2. The ONLY production change made in this run, and why it is not the ruling

Rule 4 read the superseded model's single positive panel. That identifier no
longer exists, so the module could not compile, and the choice was between
deleting the control and continuing it.

**It now reads `panels.strengths`.** That is the minimum that keeps the control
alive, and it is not a design decision, because exactly one of the four OD-4
panels inherits the role rule 4 was always about: the ruling defines Strengths
as *"positive demonstrated capabilities, behaviours, progress or performance,
supported by the Trainer's governed assessment facts."*

**What was deliberately NOT done, because each is a G-06 decision:**

- **NOT retargeted at `overview`.** Overview may legitimately carry
  developmental context, so a positive-only prohibition there would
  false-reject correctly-grounded drafts. (`CLAUDE.md` §12 names this exact
  move as a stop-and-ask.)
- **NOT extended to `areasForDevelopment`.** That panel is *expected* to name
  `needs_support` dimensions.
- **NOT extended to `remarks`.** Remarks has no ruled polarity posture.
- **The support-framing escape was carried forward UNCHANGED** and marked
  KNOWN-WEAK in-module. It is broken (§5), but changing it alters rejection
  behaviour, which is the Operator's call.
- **Rule 3's fail-open was left in place** and recorded (§6).

---

## 3. Per-panel analysis — the four panels are NOT symmetric

The central error to avoid is applying one polarity posture to all four. The
ruling gives them different jobs, so they need different rules.

### 3.1 STRENGTHS — the contradiction rule belongs here

**Governed meaning:** positive demonstrated capabilities supported by the
trainer's facts.

**Proposal:** rule 4 applies here, and **only** here. A `needs_support`
dimension named in Strengths as a demonstrated positive capability is a
contradiction of the trainer's assessment and must be **rejected**.

**Measured today:** works. C1 and C1b both **REJECT**.

**Open sub-question for the Operator:** should a `developing` dimension also be
prohibited in Strengths? A-051 puts `developing` in its own band, between
`needs_support` and `positive`. Genuine progress on a developing dimension is
arguably a legitimate strength ("has begun using eye contact independently"),
so the recommendation is **NO — restrict rule 4 to `needs_support`**, and let
rule 3 catch achievement *language* about a developing dimension, which it
already does. Recorded as a choice, not assumed.

### 3.2 OVERVIEW — must NOT inherit the Strengths rule

**Governed meaning:** general narrative synthesis; **explicitly not restricted
to positive observations**; may synthesize strengths, overall performance
*and* developmental context.

**Proposal:** rule 4 does **not** apply. Overview remains governed by rules 2,
3 and 5 — which is not "ungoverned": rule 3 still rejects a sentence that makes
an *achievement claim* about a non-positive dimension, anywhere. The
distinction is between **mentioning** a needs_support dimension (legitimate in
Overview) and **claiming it as an achievement** (never legitimate anywhere).

**Measured today:** C2a — a needs_support dimension described in Overview as
developmental — **ACCEPTS**. Applying the Strengths rule here would have
rejected it, which is the false-rejection the ruling warns about.

### 3.3 AREAS FOR DEVELOPMENT — the prohibition must not extend here

**Governed meaning:** specific capabilities that would benefit from continued
development or support.

**Proposal:** rule 4 does **not** apply. This panel exists to discuss
`needs_support` and `developing` dimensions; a rule that penalised it for doing
so would reject every correct report.

**Measured today:** C2b **ACCEPTS**.

**Open sub-question:** should there be an *inverse* rule — a `positive`
dimension presented in Areas for Development as a deficiency? That is also a
contradiction of the trainer's assessment, and it is currently undetected in
every panel. It is a **new** control rather than a migration of an old one, so
it is presented as an option, not folded in silently. **Recommendation: yes,
but as a separate ratified rule**, because it changes rejection behaviour.

### 3.4 REMARKS — genuinely undecided, and presented as such

**Governed meaning:** additional relevant commentary not belonging in the other
three; **not** an unrestricted channel for unsupported claims; grounding and
governance apply in full.

**What is NOT in doubt:** rules 2, 3 and 5 apply to Remarks in full. Grounding
is not optional here.

**What IS undecided — the Operator's choice:**

| Option | Rule 4 in Remarks | Consequence |
|---|---|---|
| **R-A** *(recommended)* | Does **not** apply | Remarks is treated like Overview: it may mention a needs_support dimension in context, and rule 3 still blocks achievement claims. Lowest false-rejection risk. Accepts C3b. |
| **R-B** | Applies, as in Strengths | Remarks may not present a needs_support dimension positively. Stricter, but Remarks is not defined as a positive panel, so the rule has no ruled basis — it would be *invented*. Rejects C3b. |
| **R-C** | Applies only when the sentence makes a *celebratory* claim | Narrower than R-B, but needs a new lexicon, and a new lexicon is a new failure surface. |

**Measured today:** C3b — a needs_support dimension described in Remarks as *"a
real highlight worth celebrating"* — currently **ACCEPTS**. That is the
behaviour under R-A. If the Operator prefers R-B or R-C, production code must
change; **no unratified Remarks polarity decision has been encoded.**

---

## 4. Proposed rule set (subject to ratification)

| # | Rule | Overview | Strengths | Areas for Dev | Remarks |
|---|---|---|---|---|---|
| 1 | exactly nine ratings | — assessment-level — |||
| **1b** | **NEW: the ratings must COVER all nine governed dimension codes, each resolving to a ratified polarity band — else REJECT** | — assessment-level — |||
| **3b** | *(option)* **NEW: extend `ACHIEVEMENT_TERMS` with bare `strong`** — see §6.2 | ✅ | ✅ | ✅ | ✅ |
| 2 | no rating attribution / taxonomy disclosure | ✅ | ✅ | ✅ | ✅ |
| 3 | no achievement claim about a non-positive dimension | ✅ | ✅ | ✅ | ✅ |
| **4** | **needs_support may not be presented as a demonstrated strength** | ❌ | ✅ | ❌ | **R-A ❌ / R-B ✅ — OPERATOR'S CHOICE** |
| 4b | *(option)* positive dimension presented as a deficiency | ❌ | ❌ | ✅ | ❌ |
| 5 | no unresolved placeholder | ✅ | ✅ | ✅ | ✅ |

---

## 5. THE SUPPORT-FRAMING PROBLEM — measured, and it makes rule 4 vacuous

Rule 4's escape today:

```js
const lower = panels.strengths.toLowerCase();
… terms.some(t => lower.includes(t))
  && !/support|prompt|guidance|develop|practice|working on|building/.test(lower)
```

**Two compounding defects:**

1. **It is evaluated over the WHOLE PANEL, not the sentence that names the
   dimension.** One occurrence of an escape word *anywhere* in the panel
   disarms the rule for *every* dimension in it.
2. **The lexicon contains ordinary Strengths vocabulary.** `develop`,
   `practice` and `building` appear naturally in legitimate positive prose —
   "continued to develop a confident stance", "building on last week's work".

**MEASURED (case C4).** Take the exact contradiction that C1 rejects, and
append one innocuous sentence containing the word *develop*:

> "Eye contact was the highlight of the session. The student also continued to
> develop a confident stance."

**Current behaviour: ACCEPT.** The contradiction rule is disarmed by a word
that belongs in the panel. A model writing natural Strengths prose will trip
this escape most of the time, so **rule 4 is close to vacuous in practice** —
the same class of silent-green failure as the A-053 polarity skip.

**Proposed fix (ratification required):**

1. **Evaluate at SENTENCE level.** Attach the escape to the sentence that names
   the dimension, so unrelated prose elsewhere cannot disarm it.
2. **Narrow the lexicon to explicit support markers**, not generic verbs:
   `with support`, `with prompting`, `with guidance`, `needs`, `is working
   towards`, `is developing`, `still developing`. Drop bare `develop`,
   `practice` and `building`.
3. **Require proximity, not mere presence:** the support marker must occur in
   the same sentence as the dimension term.

**Honest limit:** this remains a lexical heuristic and will never be complete.
It is a *necessary, not sufficient* control, exactly like the static privilege
guard. Rule 3 is the stronger of the two and is unaffected by this escape.

---

### 5.1 A second demonstration — the escape word INSIDE the contradicting sentence

Case **C4** appends the escape word in a *separate* sentence. Adversarial
review supplied the shape a model writing natural Strengths prose will
actually emit, where it sits in the *same* sentence:

> "Eye contact was a highlight of the session, and the student will keep
> developing it."

**Current behaviour: ACCEPT** (case **C8**). Sentence-scoping alone (§5 fix 1)
does **not** repair this one — fix 2, narrowing the lexicon so `develop` is
not itself an escape, is what closes it. Both fixes are required together.

---

## 6. RULE-3 FAIL-OPEN — measured, and it is the A-053 shape again

```js
const band = bandOf.get(code);
if (band === undefined || band === "positive") continue;   // <-- fail-open
```

`bandOf` is built as `POLARITY_BANDS[r.rating]`. An unmapped or unknown rating
label yields `undefined`, and the rule **silently skips that dimension**. This
is precisely the incident that already bit this project at the A-053 rename,
where `POLARITY_BANDS[rating]` became `undefined` and the polarity rule was
skipped while the suite reported green.

**MEASURED (case C5).** With one rating label changed to an unmapped value, a
draft containing *"Excellent eye contact throughout — truly outstanding and
clearly mastered"* about that dimension is **ACCEPTED**. An impossible rating
currently buys a free pass through polarity grounding.

**Proposed disposition: FAIL CLOSED.** Add rule **1b** — if any rating does not
resolve to a ratified polarity band, the draft is REJECTED with an explicit
reason. An unmapped rating means the assessment is not interpretable, and an
uninterpretable assessment cannot ground anything.

**Why rule 1 does not already cover this:** rule 1 checks the *count* is nine.
It says nothing about the labels being members of the ratified vocabulary.
`INT-G0` in `run-integration.mjs` does check this — but only for the FIXTURE,
at test time. It is not a runtime guarantee.

**Rating validation is not weakened anywhere by this proposal** — it is
strengthened, and only in the fail-closed direction.

### 6.1 A SECOND ROUTE to the same skip, found by adversarial review

`bandOf` is a `Map` keyed by `dimensionCode`. Nine ratings in which one code
is **duplicated** leave another code **absent**, so `bandOf.get(code)` returns
`undefined` and rules 3 and 4 skip that dimension — with **no invalid enum
value anywhere**. Rule 1's count of nine is satisfied.

**MEASURED (case C6).** With `eye_contact` duplicated away, the exact
contradiction that C1 rejects becomes **ACCEPTED**.

This is reachable from any upstream read that does not enforce distinct-code
coverage, so it does not depend on a corrupted enum. **Rule 1b must therefore
assert COVERAGE of all nine governed dimension codes, not a count** — the
version in §4 is worded that way.

### 6.2 A THIRD gap — Overview can praise a `needs_support` dimension

Rule 4 reads only `strengths`. Rule 3 fires only on `ACHIEVEMENT_TERMS`, which
contains `very strong`, `particularly strong` and `strong command` but **not
bare `strong`**.

**MEASURED (case C7).**

> Overview: *"The student showed strong, confident eye contact throughout the
> session and held the audience well."* — with `eye_contact` = `beginning`.

**Current behaviour: ACCEPT.**

This matters *more* after OD-4, not less: `SYSTEM_PROMPT` now explicitly tells
the model that Overview "MAY draw together demonstrated strengths", so the
model is being steered toward exactly this sentence. Note this is **not** an
argument for applying rule 4 to Overview — §3.2's reasoning stands, and doing
so would false-reject C2a. It is an argument that **rule 3's lexicon is too
narrow**, which is a different and safer fix (option **3b** in §4).

**Recommendation:** add bare `strong` to `ACHIEVEMENT_TERMS`. It is an
achievement claim in every panel, and rule 3 is already sentence-scoped and
dimension-attributed, so the false-positive risk is bounded — but it does
change rejection behaviour and therefore needs ratification.

---

## 7. Proof cases — required by the gate

| Case | Description | Proposed | Current | Status |
|---|---|---|---|---|
| **C1** | `eye_contact` (needs_support) described in **Strengths** as the session highlight | REJECT | **REJECT** | ✅ proposal already satisfied |
| **C1b** | Same, with explicit achievement wording | REJECT | **REJECT** | ✅ |
| **C2a** | Same dimension described in **Overview** as developmental context | ACCEPT | **ACCEPT** | ✅ no false rejection |
| **C2b** | Same dimension described in **Areas for Development** as a need | ACCEPT | **ACCEPT** | ✅ |
| **C3a** | Grounded neutral **Remarks** | ACCEPT | **ACCEPT** | ✅ |
| **C3b** | needs_support named positively in **Remarks** | *R-A accept / R-B reject* | **ACCEPT** | ⚠️ **undecided — Operator's call** |
| **C4** | C1 plus one incidental escape word elsewhere in the panel | REJECT | **ACCEPT** | 🔴 **defect — §5** |
| **C5** | Unmapped rating label, blatant contradiction | REJECT | **ACCEPT** | 🔴 **defect — §6** |
| **C6** | **Duplicated** dimension code (no invalid enum needed), same contradiction | REJECT | **ACCEPT** | 🔴 **defect — §6.1** |
| **C7** | `needs_support` praised in **Overview** using bare *"strong"* | REJECT | **ACCEPT** | 🔴 **defect — §6.2** |
| **C8** | Escape word **inside** the contradicting sentence | REJECT | **ACCEPT** | 🔴 **defect — §5.1** |

**The mandated contradiction proof and the mandated legitimate-context proof
both hold against the current implementation** (C1/C1b reject, C2a/C2b accept).
The five open defects are C4, C5, C6, C7 and C8, and none is repaired here
because every one of them changes rejection behaviour.

**C6, C7 and C8 were found by the two independent adversarial reviewers, not
by the original design pass** — recorded because it bears on how much
confidence this packet's coverage deserves. The rule-4 retarget itself
survived both reviews; the surrounding pipeline did not.

---

## 8. Also found while measuring — recorded, not fixed

`DIMENSION_TERMS.audience_awareness` includes the bare term **`audience`**. In
case C1b the phrase *"holding the audience's gaze"* — which is about **eye
contact** — attributed the sentence to `audience_awareness` as well, producing
a second rejection reason for a dimension the sentence is not about. The
verdict was still correct, so this is a **precision** defect, not a
fail-open: it can produce a spurious *reason*, and in principle a spurious
*rejection*. Whether to narrow that term is a G-06 sub-item.

---

## 8.1 Also found by review, recorded and NOT fixed here

- **The fixture provider can fabricate a strength.** With every dimension at
  `beginning`, `DeterministicFixtureDraftProvider` falls back to the literal
  `"participation"` for `strongest` and emits *"showed steady, confident work
  in participation"* into **both** `strengths` and `overview`. Grounding
  returns `ok: true` — solely because `"participation"` is not in
  `DIMENSION_TERMS`, i.e. it passes by being ungrounded rather than by being
  correct. Under OD-4's definition of Strengths this is an unsupported claim.
  It is a **fixture** provider, never reachable in the participant walkthrough
  (gate G-19), so it is recorded rather than patched — but the fallback should
  be re-derived when the rule set is ratified.
- **One of the four re-authored fixture sentences is a verbatim carry.** The
  `strengths` sentence is byte-identical to the old `todaysStrength`.
  Defensible — it is the one panel whose role genuinely did carry over — but
  the claim that all four were re-authored is imprecise, and it is corrected
  here rather than left standing.

---

## 9. What is NOT claimed

- **P1-T09a (additive fixture expansion) has NOT been run.** These cases are
  synthetic in-memory inputs to a pure function, which is legitimate for a
  design proof and is how the contradiction case is specified — but the
  end-to-end proof against expanded fixture rows, and the previous-focus
  continuity proof, are still **owed and NOT-RUN**. Nothing here substitutes
  for them.
- **No real provider was called** to obtain any result in this packet.
- **No rule has been ratified**, and no proposed change in §4, §5 or §6 has
  been implemented.

---

## 10. Recommendation

1. Ratify **rule 4 scoped to `strengths` only** (already in force as the
   minimum continuation).
2. Ratify **rule 1b** — fail closed unless the ratings **cover all nine
   governed dimension codes**, each resolving to a ratified polarity band
   (§6, §6.1). This is the highest-value change in the packet: two independent
   measured routes into the exact fail-open class that has already bitten this
   project once, one of which needs no invalid enum value at all.
3. Ratify the **sentence-scoped AND lexicon-narrowed support-framing escape**
   (§5, §5.1). Both halves are required — sentence-scoping alone still accepts
   C8.
4. Ratify **option 3b** — add bare `strong` to `ACHIEVEMENT_TERMS` (§6.2) —
   which closes Overview's gap **without** applying the Strengths rule to
   Overview and therefore without false-rejecting C2a.
5. Choose **R-A / R-B / R-C for Remarks** (§3.4). Recommended: **R-A**.
6. Decide the two sub-questions: `developing` in Strengths (§3.1 — recommended
   NO) and the inverse rule 4b for Areas for Development (§3.3 — recommended
   yes, as a separate rule).
7. Decide the `audience` term precision item (§8).

Once ratified, P1-T09 implements the ruling and re-runs this probe as an
acceptance test rather than as evidence.
