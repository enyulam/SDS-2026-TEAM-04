# B.E.S.T Coach — MVP Specification v3 Amendment 007

**Status:** **Ratified by operator**
**Ratification date:** 2026-08-08 (Asia/Singapore)
**Clauses:** **A-056**

**Ratification provenance — recorded explicitly, because this instrument sits above `FINAL_MVP_AUTHORITY_LOCK.md` and `CLAUDE.md` on the §1 ladder.** This amendment exists because the operator issued a **bounded run instruction** — the *Final Pre-Execution Authority Supersession Cleanup* — which directed, in terms: *"use the project's existing amendment/ruling mechanism and create the NEXT non-colliding amendment/ruling needed to explicitly supersede ONLY the obsolete visual-authority ordering in A-045"*, and specified the superseding content, the preservation boundary and the prohibition on rewriting A-045 in place. **The authoring session did not ratify this amendment and has no authority to do so** (`CLAUDE.md` §14.0, §14.7: *"a Claude session may not ratify"*). It drafted the instrument the operator's instruction called for, within the scope that instruction set. **If the operator's instruction is ever found not to have covered this, A-056 is void and A-045's ordering stands** — the reconciliation would then rest on the carriers alone, as it did before 2026-08-08.

**Amends:** `BEST_Coach_MVP_Specification_v3_Amendment_005.md`, **and only its A-045 visual-authority ordering**. No other instrument is amended.

> **Clause-continuity check.** The highest clause in any committed instrument is **A-055** (Amendment 006). No clause **A-056** is used anywhere in the committed tree. **A-056 is therefore the correct next clause, and this is Amendment 007.** No ratified instrument was renumbered, edited or overwritten to produce it. Amendments 001–006 remain **byte-for-byte unchanged**.

> **Why this amendment exists.** Operator rulings **PA-OD-5/5b** promoted `UI_REFERENCE_FINAL_MVP/reference/` to Final MVP **visual** authority, and the 2026-08-08 UI Reference Authority Synchronization reconciled that model into every active carrier. **A-045's own three-rank visual ladder was never reconciled** — it is ratified specification text and could not be rewritten in place. It therefore still reads as current authority and still ranks a *pack-local optional duplicate* above the ratified visual source. **This amendment closes that gap through the amendment mechanism rather than by editing history.**

---

## Relationship to Specification v3 and Amendments 001–006

Specification v3 remains the **authoritative baseline**. Amendment 001 (**A-001 … A-013**), Amendment 002 (**A-014 … A-024**), Amendment 003 (**A-025 … A-032**), Amendment 004 (**A-033 … A-040**), Amendment 005 (**A-041 … A-048**) and Amendment 006 (**A-049 … A-055**) remain in force **except for the single ordering named in the supersession table below**.

### Rules of precedence for this amendment

1. Every clause not named here remains in force, unchanged.
2. **Amendment 007 names no clause of Amendments 001, 002, 003, 004 or 006.** All of them are untouched.
3. **Within Amendment 005, Amendment 007 names A-045 and no other clause.** A-041, A-042, A-043, A-044, A-046, A-047 and A-048 remain **fully active**.
4. **Within A-045 itself, only the three-rank VISUAL ladder is superseded.** A-045's functional/security/privacy ladder, its *Figma never bypasses governance* rule, its frame-versus-ratified-rule rule, its preservation of **A-022.2**'s prohibited-porting list and its preservation of **A-013**'s disposition discipline are all **preserved unchanged and remain binding**.
5. **A-045 is not obsolete.** Citing "A-045" as active authority remains correct for everything except the visual ordering.
6. Specification v3 and Amendments 001–006 are **never edited in place**. The superseded ordering is superseded **explicitly, here**; the historical text stays where it is, unaltered.
7. `CLAUDE.md`, `FINAL_MVP_AUTHORITY_LOCK.md`, `GLOBAL_UI_RULES.md`, the 36 `screen.md` packs and the implementation plans must agree with v3 as amended by 001–007; where any still carries the superseded ordering, **A-056 governs and the stale text is historical**.

### Scope statement — this amendment authorizes nothing

**Amendment 007 is a precedence correction. It is not an implementation authorization.** It builds no screen, applies no migration, changes no route, alters no component and runs nothing. **Amendment 003 A-032's non-authorization rule applies in full.** It also **repairs no known `/reference/` content gap** — it settles ordering only.

---

## Supersession and precedence table

| Clause | Superseded | Effect on Amendments 001–006 | Other active documents affected | Effect |
|---|---|---|---|---|
| **A-056** | **Amendment 005 A-045's three-rank VISUAL ladder only** — the enumerated list *"1. Frozen `reference.png` → 2. Node-specific Figma context → 3. Existing frontend implementation"* (`BEST_Coach_MVP_Specification_v3_Amendment_005.md:136-140`). **Nothing else in A-045, and no other clause anywhere, is superseded.** | **Amendment 005 A-045 superseded for that ordering and for nothing else.** A-045's functional ladder, *Figma-never-bypasses-governance*, and frame-versus-rule rules are **expressly preserved**. **No Amendment 001, 002, 003, 004 or 006 clause is named.** | `CLAUDE.md` §1 / §7 / §7.4; `FINAL_MVP_AUTHORITY_LOCK.md` §2.4 / §28; `UI_REFERENCE_FINAL_MVP/GLOBAL_UI_RULES.md` §1.1; all 36 `screen.md`; the reconstruction plans and the Figma matrix | The current Final MVP visual model is the **three-role model in A-056 below**: `reference/<mapped pack>/` is the **primary current visual source**; the governed implementation pack carries **implementation, governance and provenance authority**; a pack-local `reference.png` is an **optional frozen duplicate / integrity evidence** where present, never the ranking authority |

---

## A-056 — The current Final MVP visual-authority model

### A-056.1 The superseded ordering

**A-045's visual ladder is `SUPERSEDED_FOR_CURRENT_FINAL_MVP_VISUAL_AUTHORITY`.** It ranked a **pack-local `reference.png`** first. That file is **present in only 12 of the 36 governed packs**, so for the other 24 the ladder's first rank pointed at nothing and fell through to live Figma — past the ratified frozen frame that actually exists on disk. The ordering is superseded; **A-045's historical text is preserved verbatim in Amendment 005 and is not edited.**

### A-056.2 The three roles — not one flat ladder

| Role | Artefact | Authority |
|---|---|---|
| **PRIMARY CURRENT VISUAL SOURCE** | **`UI_REFERENCE_FINAL_MVP/reference/<mapped pack>/`** — its `.png` and `.html` | The ratified current visual authority for what a screen should look like. **Visual rank 1.** |
| **IMPLEMENTATION / GOVERNANCE / PROVENANCE** | The **governed implementation pack** — `screen.md`, `implementation-notes.md`, `SCREENSHOT_REQUIRED.txt`, screen identity, Figma node record, recorded deviations, GC conflicts, acceptance instructions | Authoritative for **what to build, what is prohibited, and what deviations are ratified**. **A pack is never obsolete merely because its visual snapshot lives elsewhere.** |
| **OPTIONAL FROZEN DUPLICATE** | A pack-local **`reference.png`**, present in **12** packs | **Integrity evidence and a byte-identical convenience copy — it is never the TOP rank.** Carriers may order it at **visual rank 2** below `reference/`; what A-056 forbids is ranking it *above* the ratified source. Where present it is SHA-256-identical to its `reference/` counterpart; where absent, **nothing is missing** and `reference/` governs. |

**The two lower visual ranks are retained from A-045, re-ordered beneath the above and not abolished:** **node-specific Figma context**, applicable **only where no ratified `/reference/` asset exists**, and then the **existing frontend implementation**. A-056 supersedes A-045's *ordering*, not the existence of those ranks — a carrier that lists them below the three roles above is conformant.

**The mapping from a governed pack to its `reference/` counterpart is authoritative and published**; it is not to be re-derived by name similarity, which is unsafe for the packs whose on-disk names differ from their screen names.

### A-056.3 The two ladders remain separate — unchanged

**A-045's separation of the VISUAL ladder from the FUNCTIONAL / SECURITY / PRIVACY ladder is preserved in full, and collapsing them remains a governance error.** A-056 re-ranks the **visual** ladder only. It grants `reference/` **no** functional rank: `reference/*.md` remains **functional rank 5, the lowest**, and never outranks the specification, the amendments or `CLAUDE.md` on any functional, privacy or security question.

### A-056.4 Governed deviations override specific visible elements

**A higher-ranked functional / product / privacy ruling may explicitly override a SPECIFIC visible element of a `/reference/` frame without invalidating the remainder of that visual pack.** This is the ordinary operation of the two ladders, not an exception to them.

**The canonical example is operator ruling Q-27 (Parent Dashboard).** `reference/Parent - Dashboard/` remains the **current visual source** for screen 30, **and** the complete *"This Term's Skills"* nine-dimension ratings card it draws is **`DO_NOT_IMPLEMENT`**. Both statements are simultaneously true. **Visual acceptance must treat that card's absence as `EXPECTED / REQUIRED`, never as a missing implementation or a visual regression.** *(Full ruling: `FINAL_MVP_AUTHORITY_LOCK.md` §15.2.)*

**A-045's rule that a frame-versus-ratified-rule discrepancy is recorded and never quietly reconciled is preserved and is the mechanism by which such overrides are registered.**

### A-056.5 What A-056 does not do

- It does **not** weaken `reference/` authority — it **raises** it to its ratified rank.
- It does **not** promote `reference/*.md` above functional governance.
- It does **not** delete, demote or obsolete any governed implementation pack.
- It does **not** change the **36 governed packs / 37 `reference/` packs** structure, the 36→36 mapping, or the one intentional reference-only extra pack.
- It does **not** alter Q-27, Q-28, OD-4 or any other ratified ruling.
- It does **not** repair the content of any pack; it settles **ordering** only.

---

## Verification obligations attaching to this amendment

An instrument citing the visual ladder is **conformant with A-056** only if it ranks `reference/<mapped pack>/` first, describes a pack-local `reference.png` as an optional frozen duplicate rather than the top rank, and preserves the visual/functional ladder separation. **Where a carrier still shows the A-045 ordering, A-056 governs and the carrier is stale, not authoritative.**

---

*Ratified 2026-08-08 by explicit operator ruling at the Final Pre-Execution Authority Supersession Cleanup. **No specification or amendment file was edited in place to produce this document.** Amendments 001–006 remain byte-for-byte unchanged.*
