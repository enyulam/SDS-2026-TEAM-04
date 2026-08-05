# B.E.S.T Coach — Governed Assessment Persistence Baseline (CP-2 / CP-4)

**Status:** Ratified design record — created 2026-08-05 (Asia/Singapore).
**Resolves:** `docs/plan/PHYSICAL_TEST_SLICE_48H.md` §10 checkpoints **CP-2** (assessment-write authorization) and **CP-4** (trainer observation read path), and the carried-forward open items **U-7I-11 / U-30** (no governed trainer read path to `observations`) and **U-7I-4** (governed path for observation edits).
**Owner of implementation:** the Phase 1 assessment checkpoint (A-024 step 8), executed as **Backend Round B2**, **after Step 7I acceptance**.

> **Amendment 006 supersession note — appended 2026-08-05 23:20 (Asia/Singapore). Nothing below this note was rewritten.**
>
> **The competency-rating vocabulary is now `Beginning` → `Developing` → `Mastering` → `Mastered`** (storage `beginning`, `developing`, `mastering`, `mastered`), ratified by `docs/spec/BEST_Coach_MVP_Specification_v3_Amendment_006.md` **A-049**.
>
> **Every occurrence of `emerging` / `secure` / `advanced` as a competency-rating label below is superseded and historical**, including the §2 enum declaration and the **T-ASM-8** invalid-rating row. Those rows remain **accurate records of the baseline as ratified** and are preserved verbatim; read the ratified labels in their place. `developing` is unchanged. **Behavioural anchors and polarity bands carry forward positionally and verbatim** (A-050, A-051), so **no threshold, adjudication or test intent below changes** — only the label spelling does.
>
> **Class Grade (`beginner` / `intermediate` / `advanced`) is a different vocabulary and is unchanged** (A-054).
>
> The vocabulary is **ratified but not yet implemented.** The bounded sequence is `docs/plan/COMPETENCY_VOCABULARY_RECONCILIATION_PLAN.md`; the enum rename and the T-ASM updates land together in checkpoint **V2**, which requires its own authorization.

---

## 0. Precedence — this document is subordinate and authorizes nothing

**This baseline sits below every governing document and can amend, relax, reinterpret or supersede none of them.**

**Precedence (highest first), unchanged from `CLAUDE.md` §1:**

> Specification v3 → ratified amendments (Amendment 001 → 002 → 003 → **004**, for the clauses each names) → `CLAUDE.md` → `docs/plan/BEST_Coach_Implementation_Plan.md` → Figma Design 2 → `docs/progress/STATUS.md` → `docs/progress/BUILD_NOTES.md` → temporary migration tracker → `docs/plan/PHYSICAL_TEST_SLICE_48H.md` → **this baseline**.

It is additionally bound by, and consistent with:

| Document | Binds |
|---|---|
| `docs/plan/STEP_7H_AUDIT_CHAIN_BASELINE.md` | The closed 16-action event registry, the append contract, §1.4 event **E9**, and the append-only/no-repair posture |
| `docs/plan/STEP_7I_REPORT_LIFECYCLE_BASELINE.md` (R-1 … R-33) | The lifecycle RPC inventory, the §5.0 function/EXECUTE census, the transition set, CAS discipline, the future-session predicate (R-9), authorization predicates (R-28), the §8.6 return-shape and error discipline, and the 75 acceptance tests |
| `supabase/migrations/20260803034500_step_7e_governed_core.sql` | The shipped physical schema — the sole authority for every column, constraint and index named here |
| `supabase/migrations/20260803154500_step_7g_relationship_authorization.sql` | The authorization-helper predicates and the REVOKE/GRANT idiom |
| `supabase/migrations/20260804213000_step_7h_audit_chain.sql` | The applied audit objects, which this design **does not touch** |

**Four consequences, stated plainly:**

1. **This baseline authorizes no implementation.** Ratifying it authorizes nothing. No migration file, RPC, server action, generated type, fixture row or application code may be created on its strength. The assessment migration requires its **own explicit orchestrator authorization**, and it may not be authored before **Step 7I is accepted**.
2. **It creates no governance.** Every rule it restates is a restatement, not a source.
3. **It adds no schema object beyond two functions.** No table, no enum, no column, no constraint, no index, no policy, no table grant, no trigger, no view, no extension, no schema.
4. **Where this baseline and a governing document disagree, the governing document wins**, and the disagreement is reported as a §9 blocker under the 48-hour contract rather than resolved locally.

---

## 1. Scope, and the operator decision that closed it

### 1.1 What this baseline designs

Exactly **two** new `public` database entry points:

| # | Function | Kind |
|---|---|---|
| **ASM-1** | `public.assessment_save_observation` | Governed write — create or CAS-update one `observations` row plus its complete nine-row `observation_ratings` set, atomically |
| **ASM-2** | `public.assessment_get_trainer_observation` | Governed read — the assigned trainer's own working observation for one (session, student) |

### 1.2 The audit-boundary decision (operator ruling, 2026-08-05) — **option (c)**

A first pass at this design established a hard conflict. The design requires the save to be a governed, authorized, transactional write; the committed Step 7H registry is a **closed 16-element `CONSTANT text[]`** duplicated byte-identically inside **two applied `SECURITY DEFINER` functions** (`audit_append_event` lines 439–456 and `audit_verify_chain` lines 744–761), and **none of its sixteen actions denotes standalone observation persistence**. Every action that could truthfully describe an observation save is a *report* action requiring exactly the report mutation this design forbids.

**The operator ratified option (c): `assessment_save_observation` emits no Step 7H audit event, and neither does `assessment_get_trainer_observation`.**

**This is deliberate, and it is the reading most consistent with what Step 7H already ratified.** Step 7H §1.4 evaluated event **E9 — "Observation-to-report derivation"** — and resolved it as:

> **Folded into E2/E3 payloads** — the version row and transition events carry the derivation identifiers; **no separate event** (data minimization)

Observation facts were therefore *already* ratified as auditable **through report events**, not through an observation event of their own. Option (c) does not create a gap; it declines to invent an event that Step 7H deliberately did not create.

**Binding consequences of the ruling:**

- **Do not extend the closed 16-action audit registry.** (`CLAUDE.md` §12 lists this as stop-and-ask; Step 7I **R-29** rejected registry extension on the ground that it means replacing both applied functions, with a partial edit silently breaking verification of already-committed rows.)
- **Do not replace, re-create or `CREATE OR REPLACE` either Step 7H audit function.** Step 7H assertion **B20** fails closed if the two registry copies diverge; Step 7I test **T7I-30** requires the 7H migration and the registry **byte-unchanged in both functions**. The assessment migration must leave both untouched.
- **Do not reuse a misleading report or administration action.** Emitting `report.created`, `report.state_changed` or `report_version.created` from an assessment save would write a false, hash-covered claim into a chain that is append-only by trigger and by zero privilege, that `audit_verify_chain` treats any alteration of as a break, and that Step 7H §6.4 forbids repairing "ever". A permanently unremovable false statement is strictly worse than no statement.
- **Do not create or advance a report from `assessment_save_observation`**, and **do not perform T0 or T1** during assessment saving.
- **`CLAUDE.md` §4 non-negotiable 2 is not engaged.** Its rule is *"A state transition and its audit write commit in the same transaction."* An observation save is **not a state transition** — Step 7I §3.2 says so directly: *"A partial save of observation data in `incomplete` is not a report transition at all — it mutates `observations`/`observation_ratings` (assessment-checkpoint scope) and leaves the aggregate untouched."* No transition occurs, so no audit write is owed.

### 1.3 Where truthful audit begins

Audit begins at the **report lifecycle**, performed by the future `requestDraft` server action, which owns report orchestration in this order:

1. **ensure/create** the governed report — `report_create` (RPC-1, T0) → `report.created`;
2. **mark observation saved** — `report_mark_observation_saved` (RPC-2, T1) → `report.state_changed`;
3. **request drafting** — `report_request_draft` (RPC-3, T2) → `report.state_changed`.

Each of those events is **truthful**: it describes a report mutation that actually occurred, emitted by the RPC that actually performed it.

**Their payloads carry only permitted non-PII derivation identifiers.** Per Step 7I §10 and **R-30**, the T0 payload carries report id, student id, session id, module id, **observation id** and `status:"incomplete"`; targets are identified by **UUID** with **generic constant labels** (`Report`, `Student`, `Class session`, `Observation`). They must **never** carry observation prose, chip values, follow-up or term-evidence text, individual or aggregate rating values, the assessment payload, correction content, or any child name, initial, account name, email or phone number.

**Net effect on the audit trail.** The chain records that a report was created *from a named observation*, that it advanced because that observation was complete, and every subsequent governed transition — with the assessment substance itself living in ordinary application rows that PDPA erasure can reach, rather than in immutable evidence it can never touch. That is the same data-minimization trade Step 7H made when it dissolved E9, applied consistently.

### 1.4 Explicitly out of scope

Quick mode (removed entirely by A-017 — there is one capture mode, the full nine); any `mode` column, prop, validator or test; report creation or any report transition; AI drafting, grounding or provider work; evidence; attendance mutation; queue and list projections (**CP-3**, unresolved, backend Round 2 design); notification outbox rows; management or parent access of any kind to assessment data; any audit object.

---

## 2. Shipped-schema facts this design is built on

Every fact below is read from the committed Step 7E migration. Nothing here is inferred from a visual frame, and nothing is re-derived from memory.

### 2.1 `public.observations` (7E:619–653)

| Column | Type | Null | Default | Role in this design |
|---|---|---|---|---|
| `id` | `uuid` | NOT NULL (PK) | `gen_random_uuid()` | CAS identity |
| `centre_id` | `uuid` | NOT NULL | — | **derived**, never a parameter |
| `class_session_id` | `uuid` | NOT NULL | — | caller-supplied key |
| `class_module_id` | `uuid` | NOT NULL | — | **derived** from the session |
| `student_id` | `uuid` | NOT NULL | — | caller-supplied key |
| `enrolment_id` | `uuid` | NOT NULL | — | **derived** from the active enrolment |
| `trainer_membership_id` | `uuid` | NOT NULL | — | **derived** from the active assignment |
| `trainer_role` | `centre_membership_role` | NOT NULL | `'trainer'` | left at DEFAULT; CHECK-pinned |
| `strength_chips` | `text[]` | NOT NULL | `'{}'` | trainer content |
| `focus_chips` | `text[]` | NOT NULL | `'{}'` | trainer content |
| `observation_notes` | `text` | NULL | — | trainer content |
| `follow_up_notes` | `text` | NULL | — | trainer content — **the single shared column of `CLAUDE.md` §6** |
| `term_evidence_notes` | `text` | NULL | — | trainer content |
| `lock_version` | `integer` | NOT NULL | `1` | CAS token |
| `created_at` | `timestamptz` | NOT NULL | `now()` | immutable |
| `updated_at` | `timestamptz` | NOT NULL | `now()` | **set explicitly — no trigger maintains it** |

**There is deliberately no `mode` column** (7E:613–615): all nine dimensions are mandatory, and no four-dimension completion path or fallback exists (A-017).

Constraints used by this design:

- `observations_trainer_role_pinned_chk` — `trainer_role = 'trainer'` (7E:636).
- `observations_session_centre_fk` — `(class_session_id, centre_id)` → `class_sessions (id, centre_id)` RESTRICT (7E:637–639).
- `observations_session_module_fk` — `(class_session_id, class_module_id)` → `class_sessions (id, class_module_id)` RESTRICT (7E:640–642).
- `observations_enrolment_fk` — `(enrolment_id, class_module_id, student_id)` → `enrolments (id, class_module_id, student_id)` RESTRICT (7E:643–645). **This is what makes "assessment requires a valid enrolment" structural rather than advisory.**
- `observations_trainer_fk` — `(trainer_membership_id, centre_id, trainer_role)` → `centre_memberships (id, centre_id, role)` RESTRICT (7E:646–648).
- `observations_session_student_key` — `UNIQUE (class_session_id, student_id)` (7E:649) — **the create duplicate gate**.
- `observations_id_session_student_key` — `UNIQUE (id, class_session_id, student_id)` (7E:650) — **the update anti-borrowing gate**.
- `observations_id_centre_key` — `UNIQUE (id, centre_id)` (7E:651).
- `observations_lock_version_chk` — `CHECK (lock_version >= 1)` (7E:652).

### 2.2 `public.observation_ratings` (7E:660–674)

`id uuid PK` · `observation_id uuid NOT NULL` · `dimension_code public.dimension_code NOT NULL` · `rating public.competency_rating NOT NULL` · `created_at`/`updated_at timestamptz NOT NULL DEFAULT now()`.

- `observation_ratings_observation_fk` — `observation_id` → `observations (id)` **`ON DELETE CASCADE`** (7E:667–668). The only CASCADE in Step 7E.
- `observation_ratings_dimension_fk` — `dimension_code` → `assessment_dimensions (code)` RESTRICT (7E:669–671).
- `observation_ratings_observation_dimension_key` — `UNIQUE (observation_id, dimension_code)` (7E:672–673) — **the upsert conflict target**.

**"Exactly nine" is not, and cannot be, a table constraint.** 7E:656–659 and 7E:1196 both state this explicitly: it is a guard the RPC must carry. This design carries it.

### 2.3 Reference data and vocabularies

`public.assessment_dimensions` (7E:168–179) is **global, migration-controlled reference data**, deliberately not centre-scoped, with `UNIQUE (code)` — the FK target above. Nine seeded rows with fixed literal UUIDs `b2000000-0000-4000-8000-00000000000{1..9}`, asserted by a DO block that fails on divergence (7E:1094–1104):

| code | display_name | group_code | sort_order |
|---|---|---|---|
| `body` | Body | `competency` | 1 |
| `emotion` | Emotion | `competency` | 2 |
| `speech` | Speech | `competency` | 3 |
| `tonality` | Tonality | `competency` | 4 |
| `eye_contact` | Eye Contact | `speech_linguistics` | 5 |
| `vocal_projection` | Vocal Projection | `speech_linguistics` | 6 |
| `emotional_expression` | Emotional Expression | `speech_linguistics` | 7 |
| `sentence_flow` | Sentence Flow | `speech_linguistics` | 8 |
| `audience_awareness` | Audience Awareness | `speech_linguistics` | 9 |

Enums: `dimension_code` (nine labels, declaration order as above) · `dimension_group` (`competency`, `speech_linguistics`) · **`competency_rating` (`emerging`, `developing`, `secure`, `advanced`) — the governed four-value vocabulary, and the only one.**

**Rubric anchors and polarity bands exist in Specification v3 §3.3 and `CLAUDE.md` §5, not in the shipped schema.** No column holds them. This design does **not** invent one and does **not** return them; the UI sources them from the ratified framework constants. Recorded so a later reader does not mistake their absence for an omission.

### 2.4 Gate tables

- **`class_sessions`** (7E:422–440) — `session_date date NOT NULL`, **`starts_at time NULL`**, `ends_at time NULL`. Candidate keys `(id, centre_id)` and `(id, class_module_id)` are exactly the parents of the two observation session FKs. No session-lifecycle status column exists.
- **`enrolments`** (7E:445–470) — `is_active boolean NOT NULL DEFAULT true`; partial unique index `enrolments_one_active_per_module_student_idx ON (class_module_id, student_id) WHERE is_active` (7E:951–953). **Only the active row is unique, so every resolution must filter `is_active`.**
- **`attendance`** (7E:510–543) — `status public.attendance_status NOT NULL DEFAULT 'present'`; `UNIQUE (class_session_id, student_id)` (7E:542).
- **`class_session_assignments`** (7E:475–496) — `is_active`; `trainer_role` CHECK-pinned to `'trainer'`; partial unique index `class_session_assignments_one_active_per_session_idx ON (class_session_id) WHERE is_active` (7E:956–958) — **at most one active trainer per session.**
- **`centre_memberships`** (7E:239–270) — `status` in `pending`/`active`/`deactivated`; candidate key `(id, centre_id, role)` is the parent of `observations_trainer_fk`. **No candidate key contains `account_id`** (Step 7H ruling L2), which is why account↔membership agreement is function-enforced, not FK-enforced.

### 2.5 Derivation chain — nothing structural is trusted from the client

From `(p_class_session_id, p_student_id, auth.uid())` alone, using only committed tables:

1. `centre_id`, `class_module_id` ← `class_sessions` by primary key.
2. `enrolment_id` ← the **active** `enrolments` row for `(class_module_id, student_id)`; unique by partial index.
3. caller account ← `auth.uid()` → `accounts.auth_user_id`, `status = 'active'`, **exactly one match** (`HAVING count(*) = 1`) — the `app_current_account_id()` discipline.
4. `trainer_membership_id` ← the **active** `class_session_assignments` row for this session, joined to the caller's **active** `trainer` membership and active account — the exact predicate body of `app_trainer_reaches_session(uuid)` (7G:218–238), unique by partial index.
5. Centre agreement is then re-proved structurally: `class_session_assignments_trainer_fk` already pins `(trainer_membership_id, centre_id, 'trainer')`, and `observations_trainer_fk` re-checks the same triple against the `centre_id` from step 1.

**`centre_id`, `class_module_id`, `enrolment_id` and `trainer_membership_id` are therefore never parameters.** A caller cannot supply, substitute or influence any of them. This mirrors Step 7I's treatment of the same values in `report_create` (7I:104).

### 2.6 Schema sufficiency — no new object is indispensable

CAS is expressible against `observations_id_session_student_key` and `lock_version`. The nine-row replace is expressible against `observation_ratings_observation_dimension_key` via `ON CONFLICT … DO UPDATE`. The read needs `SECURITY DEFINER` precisely because `authenticated` holds zero SELECT on both tables — the same reasoning Step 7I gives for its three read RPCs (7I:366).

**Therefore: no new table, enum, column, constraint or index is created.** The shipped schema proves none is indispensable, and A-031's inventory and A-040's exhaustive additive list are both left untouched.

---

## 3. ASM-1 — `public.assessment_save_observation`

### 3.1 Contract

| Property | Value |
|---|---|
| Owner | `postgres` (created under the P-1 fail-closed `current_user = 'postgres'` guard) |
| Language | `plpgsql` |
| Volatility | `VOLATILE` |
| Security | `SECURITY DEFINER` |
| Search path | `SET search_path = ''` — every reference fully schema-qualified |
| Strictness | **not `STRICT`** — NULL is a legal, meaningful value for the three nullable note columns and for the two create-mode CAS parameters |
| Dynamic SQL | none |
| Client EXECUTE | `authenticated` |
| Audit | **none — emits no event** (§1.2) |
| Tables written | `public.observations`, `public.observation_ratings` — **and no others** |
| Tables read | `class_sessions`, `enrolments`, `attendance`, `class_session_assignments`, `centre_memberships`, `accounts`, `assessment_dimensions`, `observations`, `observation_ratings` |
| Tables never touched | `reports`, `report_versions`, `report_version_ratings`, `report_version_checklist_progress`, `report_version_approvals`, every audit table, `attendance` (read-only), every evidence object |

### 3.2 Signature

```
public.assessment_save_observation(
  p_class_session_id        uuid,
  p_student_id              uuid,
  p_expected_observation_id uuid,      -- NULL in create mode; required in update mode
  p_expected_lock_version   integer,   -- NULL in create mode; required in update mode
  p_strength_chips          text[],
  p_focus_chips             text[],
  p_observation_notes       text,
  p_follow_up_notes         text,
  p_term_evidence_notes     text,
  p_ratings                 jsonb      -- exactly nine {dimension_code, rating} objects
)
RETURNS TABLE (
  observation_id  uuid,
  lock_version    integer,
  dimension_count smallint,
  is_complete     boolean,
  was_created     boolean
)
```

Naming follows the committed convention: domain-first `<module>_<verb>_<entity>`, parameters `p_*`, expected-CAS values as `p_expected_<field>`, `RETURNS TABLE` for a multi-column result (the `audit_verify_chain` / Step 7I read-RPC form). The `assessment_` prefix is new and matches the module boundary `/server/modules/observation` under `CLAUDE.md` §9; the committed prefixes `app_`, `audit_` and `report_` name their own modules the same way.

**The allow-list is the signature, not a runtime filter** (the Step 7I §6.2 discipline). There is **no parameter** for `centre_id`, `class_module_id`, `enrolment_id`, `trainer_membership_id`, `trainer_role`, `lock_version` (as a value to write), `created_at`, `updated_at`, a dimension **group**, a dimension **label**, a dimension **sort order**, a report id, a report status, a version, a checklist field, an approval field, an attendance value, an evidence object, or a correction request. None of those can be supplied because no parameter exists to supply them.

### 3.3 Why `p_ratings` is one `jsonb` array

Two parallel typed arrays (`dimension_code[]` + `competency_rating[]`) were considered and **rejected**: a length mismatch between two arrays is a real failure mode with no structural defence, and an out-of-vocabulary label would fail at bind time with an unauthored `invalid_text_representation`/`invalid_input_value_for_enum` error rather than an authored one — which the Step 7I error discipline forbids for a reachable, deterministic failure.

A single `jsonb` array makes arity structural and lets **every** validation raise a **named authored error** inside the function. It reuses, deliberately, the exact idiom already committed in `audit_append_event`'s `p_related_targets` handling (7H:519–565): array-type check, per-element object check, exact-key-set check, per-key type check, authored raise on each.

### 3.4 Execution protocol

Ordered; every step fails closed; the first failure aborts the whole transaction with nothing written.

1. **Session identity.** `auth.uid() IS NULL` ⇒ the authored not-permitted outcome. No parameter, claim or header substitutes for it.
2. **Caller account.** Resolve `auth.uid()` → `public.accounts` with `status = 'active'`, requiring **exactly one** match (`HAVING count(*) = 1`); zero *and* two-or-more both yield the same authored not-permitted outcome. Ambiguous identity is treated as no identity.
3. **Live trainer/session authorization.** Resolve the **single active** `class_session_assignments` row for `p_class_session_id`, joined to the caller's **active** `trainer` `centre_memberships` row and active account. Zero or ambiguous ⇒ the authored not-permitted outcome. **This single step denies management, parents, unassigned trainers, unrelated trainers, deactivated memberships and deactivated accounts identically.** Its output is `trainer_membership_id`.
4. **Session resolution.** Read `centre_id`, `class_module_id`, `session_date`, `starts_at` from `class_sessions` by primary key.
5. **Session-start gate — `Asia/Singapore`.** Reject while

   ```
   now() < ((class_sessions.session_date + COALESCE(class_sessions.starts_at, TIME '00:00'))
            AT TIME ZONE 'Asia/Singapore')
   ```

   This is the ratified Step 7I **R-9 / B-7I-1** predicate reused verbatim, including the **U-7I-13** NULL-`starts_at` fallback (the beginning of the session date). The zone is a **pinned literal** — never the caller's `TimeZone` GUC — and **no per-centre timezone column, timezone UI or multi-centre timezone administration is added** (A-015's one-centre boundary stands).
6. **Enrolment.** Require an **active** `enrolments` row for `(class_module_id, p_student_id)`. A withdrawn or absent enrolment ⇒ authored error. Yields `enrolment_id`.
7. **Attendance is Present.** Require an `attendance` row for `(p_class_session_id, p_student_id)` with `status = 'present'`. **A missing row fails closed** — absence of evidence is not evidence of presence. This is the structural form of "absence must never create or expose a fabricated assessment" (A-018, A-026).
8. **Ratings validation — full mode, exactly nine.** `p_ratings` must be a JSON **array**; `jsonb_array_length` must be **exactly 9**; each element must be an **object** carrying **exactly** the two keys `dimension_code` and `rating`, both **strings**; the nine `dimension_code` values must be **distinct**; each must resolve to a row of `public.assessment_dimensions`; each `rating` must be a label of `public.competency_rating`. Because `assessment_dimensions` holds exactly nine rows, "nine distinct, all resolvable" forces the set to be **exactly the nine governed dimensions**. Each condition raises its own **distinct named authored error**, so a missing, duplicate, unknown and invalid case are never confused for one another.
9. **Dimension metadata is derived, never trusted.** `group_code`, `display_name` and ordering come from `public.assessment_dimensions` by join. The client supplies a **code and a rating and nothing else**; there is no parameter through which a group or label could be asserted, so a client-supplied one is not rejected at runtime — it is **unrepresentable**.
10. **Mode discrimination.** `p_expected_observation_id` and `p_expected_lock_version` must be **jointly NULL** (create) or **jointly NOT NULL** (update). A mixed pair ⇒ authored error — the fail-closed shape Step 7H uses for its actor triple, applied here so an update can never silently degrade into a create.
11. **Create path** (jointly NULL). `INSERT INTO public.observations` with the five trainer content fields and the four derived structural values; `trainer_role`, `lock_version`, `created_at`, `updated_at` left at their DEFAULTs, so a created row is at **`lock_version = 1`**. A concurrent second create violates `observations_session_student_key`; the violation is caught by constraint name and mapped to a **named authored error**, never surfaced raw.
12. **Update path** (jointly NOT NULL). One statement:

    ```
    UPDATE public.observations
       SET <five trainer content fields>,
           lock_version = lock_version + 1,
           updated_at   = now()
     WHERE id               = p_expected_observation_id
       AND class_session_id = p_class_session_id
       AND student_id       = p_student_id
       AND lock_version     = p_expected_lock_version
    ```

    **0 rows matched ⇒ authored stale-state error, nothing written** — the Step 7I §3.2 contract. Pinning `id` *and* session *and* student against `observations_id_session_student_key` means an observation id belonging to another (session, student) pair cannot be borrowed, even by a caller authorized on some other session.
13. **Rating persistence — same transaction.**

    ```
    INSERT INTO public.observation_ratings (observation_id, dimension_code, rating)
    SELECT … the nine validated pairs …
    ON CONFLICT ON CONSTRAINT observation_ratings_observation_dimension_key
    DO UPDATE SET rating = EXCLUDED.rating, updated_at = now()
    ```

    Because the table admits only the nine enum codes and is unique per `(observation_id, dimension_code)`, upserting nine always yields exactly nine — no stale tenth row is representable and no DELETE is required.
14. **Post-condition assertion.** Assert `count(*) = 9` for the observation's ratings. A failure raises and rolls the whole transaction back. This is a cheap structural proof that no partial rating set can ever commit.
15. **No audit append** (§1.2), and **no report read or write of any kind**. The function contains no statement referencing `public.reports` or any report child table.
16. **Return** the bounded shape of §3.5.

### 3.5 Return shape — bounded, non-sensitive

| Field | Meaning |
|---|---|
| `observation_id` | identifier |
| `lock_version` | the **new** lock version (1 on create; `previous + 1` on update) |
| `dimension_count` | `9` on success — completion state |
| `is_complete` | `true` on success — completion state |
| `was_created` | `true` if created, `false` if updated |

**And nothing else.** No prose, no chip values, no rating values, no notes, no student or trainer name, no centre, module, enrolment or membership id, no report or version id, no status, no hash, no audit event id or entry hash (§8.6: *"No RPC echoes `audit_append_event`'s outputs to a client"* — trivially satisfied here, since none is called).

`dimension_count` and `is_complete` are constant on success by construction. They are retained deliberately: the caller must be able to assert completion from the result rather than infer it from the absence of an error, and a future partial-save mode (if ever ratified) would change their value, not the shape.

### 3.6 Concurrency

Exactly one lock-version increment per successful update, performed in the single `UPDATE` statement — never a read-then-write, never two increments, never an increment on a failed guard. Two concurrent callers holding the same `p_expected_lock_version` produce **exactly one success and exactly one authored stale-state failure**: the loser's `WHERE lock_version = …` matches zero rows under the winner's committed value. Two concurrent creates for the same (session, student) produce exactly one success and one authored duplicate failure via `observations_session_student_key`. Neither loser writes an observation row, a rating row, or anything else.

### 3.7 Deliberate non-gates, recorded

**The save does not gate on report existence or report status.** Gating would require reading `reports`, which would couple assessment to the lifecycle this design explicitly decouples. It is also unnecessary: Step 7I **R-5** re-copies the nine **current** `observation_ratings` into every new trainer-authored version, so a trainer's rating correction propagates through the governed workflow, and **U-7I-4** already records that mutable ratings diverging from frozen snapshots is **by design** — a frozen version's snapshots are immutable and cannot be reached from here. A submitted report's parent-visible content is therefore unaffected by any later observation edit.

Recorded as **U-ASM-1** (§7): whether a post-submission observation edit should additionally be locked is a hardening-week question, not one this baseline invents an answer to.

---

## 4. ASM-2 — `public.assessment_get_trainer_observation`

### 4.1 Contract

| Property | Value |
|---|---|
| Owner | `postgres` | 
| Language | `plpgsql` |
| Volatility | **`STABLE`** — reads only; PostgreSQL itself rejects any mutation attempt in a non-volatile function |
| Security | `SECURITY DEFINER` · `SET search_path = ''` |
| Client EXECUTE | `authenticated` |
| Audit | **none — emits no event**, and being `STABLE` it structurally cannot append one |
| Tables written | **none** |

### 4.2 Signature

```
public.assessment_get_trainer_observation(
  p_class_session_id uuid,
  p_student_id       uuid
)
RETURNS TABLE (
  observation_exists  boolean,
  observation_id      uuid,
  lock_version        integer,
  strength_chips      text[],
  focus_chips         text[],
  observation_notes   text,
  follow_up_notes     text,
  term_evidence_notes text,
  ratings             jsonb,
  dimension_count     smallint,
  is_complete         boolean
)
```

Keyed on `(class_session_id, student_id)` — the same key shape as Step 7I's three read RPCs, and the shape the 48-hour contract's route note already anticipates.

### 4.3 Authorization

**The same live trainer/session relationship as ASM-1**, resolved identically (§3.4 steps 1–3): active account → active `trainer` membership → **active** assignment to **this exact session**. Then scoped to **this session and this student only**, with the student proved reachable through an `enrolments` row for the session's module.

- **Management is denied**, unconditionally — there is no management branch. Assessment substance is not a management read model under A-021/A-034/A-038, and Step 7I §8.2 lists internal notes and raw per-dimension assessment data among what management *never* receives.
- **Parents are denied**, unconditionally. Step 7I §8 names *parent → RPC-14* the most dangerous pair in the system precisely because a linked parent passes every relationship check; **only the role predicate stands between them and the caught rating-grid leak**. The same applies here, more directly: this RPC returns the rating grid itself.
- **Unrelated and unassigned trainers are denied.**
- **Unauthenticated callers are denied.**

**The denial outcome is one authored, non-disclosing error, byte-identical whether the session exists, the student exists, the pair exists, or the caller simply lacks authority** (§8.6). It never distinguishes "no such session" from "not your session".

### 4.4 Return shape

On the authorized path, exactly one row is always returned.

**Observation exists:** `observation_exists = true`, the observation id, the current `lock_version`, the five trainer-editable content fields, and `ratings` as an ordered JSON array of `{dimension_code, display_name, group_code, rating}` objects. `dimension_count` is the number of persisted ratings; `is_complete` is `dimension_count = 9`.

**Rating order is pinned to the hard-coded nine-element `dimension_code` enum declaration order** — `body`, `emotion`, `speech`, `tonality`, `eye_contact`, `vocal_projection`, `emotional_expression`, `sentence_flow`, `audience_awareness` — deliberately **not** keyed to `assessment_dimensions.sort_order`, an ordinary mutable column protected by no trigger. This is the identical discipline Step 7I applies to its content serializer, applied for the identical reason.

`display_name` and `group_code` are **embedded from `assessment_dimensions`** rather than being read client-side. This is the Step 7I RPC-14 precedent and it is what keeps **U-7I-7** closed: `assessment_dimensions` needs **no client grant**, so the deny-by-default posture is untouched.

**Safe empty / not-created shape:** `observation_exists = false`, `observation_id` NULL, `lock_version` NULL, both chip arrays `'{}'`, all three note fields NULL, `ratings` `'[]'::jsonb`, `dimension_count` `0`, `is_complete` `false`. **One row, never zero rows, never an error** — "you may assess this student and have not started" is a legitimate state, not a failure.

### 4.5 Never returned

Report drafts or panels · report status, ids, versions or `revision_number` · `content_hash` or any wording hash · approval data · checklist values · **correction reasons, scope or status** · AI generation history · audit rows, event ids or entry hashes · any other student's data · any student, trainer, parent or account name, email or phone number · centre, module, enrolment or membership identifiers.

### 4.6 Returned-correction support, without management-only metadata

A returned report (`needs_edit`) frequently requires editing exactly `follow_up_notes` or a rating — the case **U-7I-11 / U-30** and **CP-4** record as blocked. This RPC unblocks it: the trainer loads their **existing** `follow_up_notes` into the Review & Approve "Coach Notes (Internal Only)" field rather than seeing it blank and overwriting it unknowingly (`CLAUDE.md` §6 — one column, two screens), and loads the current nine ratings to correct one.

**It deliberately exposes no correction metadata.** The correction request's `issue_scope`, affected `dimension_code`, `status` and `reason` are management-authored and reach the trainer through **`report_get_working` (RPC-14)**, which already owns them. Splitting it this way means the assessment read path carries **no management-only correction metadata at all**, and the two surfaces cannot drift into duplicating the same fact two different ways.

---

## 5. Authorization, privilege and RLS posture

### 5.1 What the two functions add, and what they do not

| Control | Posture |
|---|---|
| RLS on `observations`, `observation_ratings` | **Enabled, zero policies — unchanged.** No policy is added by this design |
| `FORCE ROW LEVEL SECURITY` | **Never.** Definer RPCs work because `postgres` **owns** the tables and RLS is not forced — the mechanism is **ownership, not the `SECURITY DEFINER` keyword** (Step 7I). Forcing RLS would break every governed RPC in the project |
| `authenticated` table privileges on `observations` / `observation_ratings` | **Zero. No SELECT, INSERT, UPDATE or DELETE is granted** |
| `authenticated` table privileges on `assessment_dimensions` | **Zero** — labels are embedded by ASM-2, so no grant is needed (**U-7I-7** stays closed) |
| `anon`, `service_role`, `authenticator`, `PUBLIC` | **Zero on everything.** `service_role` carries BYPASSRLS, so the *only* control that constrains it is the absence of a privilege — nothing here may ever grant to it |
| `authenticated` EXECUTE | **Exactly the two new RPCs** |

### 5.2 The grant idiom

The committed Step 7G block form, signature-qualified, one line per function — never an aggregate or unqualified statement, which would be ambiguous under any future overload:

```
REVOKE ALL ON FUNCTION public.assessment_save_observation(...)        FROM PUBLIC, anon, service_role, authenticator;
REVOKE ALL ON FUNCTION public.assessment_get_trainer_observation(...) FROM PUBLIC, anon, service_role, authenticator;

GRANT EXECUTE ON FUNCTION public.assessment_save_observation(...)        TO authenticated;
GRANT EXECUTE ON FUNCTION public.assessment_get_trainer_observation(...) TO authenticated;
```

### 5.3 Why `authenticated` EXECUTE is required, and why it is safe

**Required** by the accepted server-action pattern: the request-scoped client (`server/platform/supabase/request.ts`) carries the caller's own session and therefore the `authenticated` database role, which is what makes `auth.uid()` resolve inside the function. **The database role follows the credential, not the code location** (A-030) — running on a server confers no privilege. A caller holding no DML cannot perform a governed write through a `SECURITY INVOKER` function, which is exactly why A-030 mandates definer RPCs when they are introduced. Step 7I settles the apparent tension with Step 7E directly: A-030's "no client RPC EXECUTE" bullet sits under the heading *"Step 7E posture:"* and is checkpoint-scoped, not standing.

**Safe** because both functions are written to be invoked directly by any authenticated caller of any role, with **no reliance on the UI, the route, a query parameter, a role tab or a token claim**. Every authorization fact is re-derived live inside the function from `auth.uid()` on every call. **Role is a predicate inside each function, never a property of the grant** — both are reachable by any authenticated session, and both deny every caller who is not the actively assigned trainer.

This is not a grant shipped ahead of its consumer: `saveObservation` and the trainer assessment/review surfaces are its consumers, and the grant ships with them. The Step 7G pairing rule is honoured in its mirror form — **no table grant and no policy is added at all**, so nothing is granted ahead of a policy either.

### 5.4 Server-action boundary

The backend server action remains named **`saveObservation`**. It is `server-only`, uses the request-scoped authenticated client, calls `assessment_save_observation`, validates request **shape** only (UUID syntax, field presence, length bounds), maps authored SQL errors to `UiActionResult<T>`, and **adds no authority of its own**. A browser route, a query parameter or a role tab **never** establishes authority.

**`requestDraft` owns report orchestration** — ensure/create the report (RPC-1), mark observation saved (RPC-2), request drafting (RPC-3). **Assessment saving never silently advances the report lifecycle.**

The trainer read is consumed through a `getTrainerObservation` read wrapper under the same discipline.

---

## 6. Migration and census boundary

### 6.1 Sequencing

Assessment persistence ships **after Step 7I acceptance**, in **its own migration file**, under the P-1 fail-closed `current_user = 'postgres'` guard, created and owned by `postgres`. It **must not** be folded into either Step 7I file, and it requires its **own explicit orchestrator authorization**.

It contains: two `CREATE FUNCTION` statements, their `COMMENT ON FUNCTION` statements, two `REVOKE` lines, two `GRANT` lines, and its authored post-apply assertions. **Nothing else.** No `ALTER TYPE`, no `CREATE TABLE`, no `CREATE POLICY`, no table `GRANT`, no `ALTER DEFAULT PRIVILEGES`, no ownership change, no trigger, no view, no extension, no schema, no `CREATE OR REPLACE` of any existing function.

### 6.2 The ratified Step 7I claims are unchanged

| Step 7I claim | Value | Status |
|---|---|---|
| migrations after Step 7I | **5** | **unchanged** |
| `public` functions after Step 7I | **28** | **unchanged** |
| Step 7I acceptance tests | **75** | **unchanged** |

Nothing in this baseline alters any of them. Step 7I's §5.0 census remains the sole authority for its own numbers.

### 6.3 The assessment-layer delta, recorded separately

| Delta | Value |
|---|---|
| migrations | **+1** |
| `public` functions | **+2** |
| `authenticated` EXECUTE grants | **+2** |
| tables | **0 — no new table** |
| enums | **0 — no new enum** |
| RLS policies | **0** |
| table grants | **0** |
| audit actions | **0 — the registry is untouched** |

### 6.4 Post-assessment census

| Object | Count |
|---|---|
| migrations | **6** |
| `public` functions | **30** |
| tables | **26** |
| enums | **12** |

Function census composition at 30: 6 Step 7G helpers + 4 Step 7H audit functions + 18 Step 7I functions + **2** assessment functions.

`authenticated`-EXECUTE composition: 6 Step 7G helpers + 14 Step 7I RPCs + **2** assessment RPCs. Functions with zero client EXECUTE remain the Step 7H four plus the Step 7I four — **this design adds none to either exclusion list and removes none.**

### 6.5 Fixture-verifier reconciliation the assessment migration must carry

`scripts/fixtures/verify-local-fixtures.sql` hard-pins these values and goes red the instant the migration applies, so the reconciliation ships **in the same commit** as the migration — the discipline Step 7I adopted for exactly this reason.

| Label | From (after 7I) | To (after assessment) |
|---|---|---|
| A34 — applied migration count and version list | 5 | **6** |
| A35 — `public` function census | 28 | **30** |
| D5 — function count | 28 | **30** |
| A32 — RLS-enabled table count | 26 | **26 — unchanged** |

**§6.2–6.4 and this table are the sole authorities for these numbers; none may be restated from memory elsewhere.**

---

## 7. Open items carried forward

| # | Item | Blocking? | Owner |
|---|---|---|---|
| **U-ASM-1** | Whether an observation edit should be additionally locked once its report reaches `submitted`. Not invented here: **U-7I-4** already ratifies that mutable ratings may diverge from frozen snapshots by design, frozen snapshots are unreachable from this path, and post-submission correction initiation is deferred by the 48-hour contract §3 | **No** | Hardening week |
| **U-ASM-2** | Rubric anchors and polarity bands have **no schema column**; the UI sources them from the ratified framework constants (v3 §3.3, `CLAUDE.md` §5). Whether they should ever become reference data is unasked and unanswered here | **No** | A later UI/AI checkpoint |
| **CP-3** | Queue and list projections (R-1, R-2, R-4, R-6, R-7, R-9, R-10) — untouched by this baseline | **No** (for CP-2/CP-4) | Backend Round 2 design |
| **U-25** | The eight blocked Figma design families. **Do not invent a frame, node ID or field for any of them** | No | Orchestrator |

---

## 8. Acceptance tests

Prefixed **`T-ASM-`** so they never collide with Step 7I's `T7I-1 … T7I-75`, which this baseline leaves at exactly 75. `S` = static/catalogue proof · `R` = runtime · `R(D)` = runtime on the **disposable** database · `R(C)` = coordinated two-session concurrency, disposable only.

### 8.1 Authorized happy paths

| # | Test | Kind |
|---|---|---|
| T-ASM-1 | **Authorized creation.** The assigned trainer, present student, active enrolment, past-start session, nine valid ratings ⇒ one `observations` row at `lock_version = 1`, exactly nine `observation_ratings` rows, return `was_created = true`, `dimension_count = 9`, `is_complete = true` | R(D) |
| T-ASM-2 | **Authorized CAS update.** A second save with the correct `p_expected_observation_id` and `p_expected_lock_version` ⇒ content updated, `lock_version` exactly `previous + 1`, still exactly nine ratings, `was_created = false`. `created_at` byte-unchanged; `updated_at` advanced | R(D) |
| T-ASM-3 | **Exactly nine ratings persist**, one per governed dimension, each value equal to the input, asserted dimension-by-dimension | R(D) |
| T-ASM-4 | **One increment per success.** Ten sequential successful updates ⇒ `lock_version` exactly `11`. Every rejected call in this suite is asserted to leave `lock_version` **unchanged** | R(D) |

### 8.2 Validation — each a distinct authored error

| # | Test | Kind |
|---|---|---|
| T-ASM-5 | **Missing dimension** — eight ratings ⇒ rejected; zero rows written | R(D) |
| T-ASM-6 | **Duplicate dimension** — nine elements, one code twice ⇒ rejected by the distinctness gate, **not** by a unique-violation, asserted as a different error from T-ASM-5 | R(D) |
| T-ASM-7 | **Unknown dimension code** ⇒ rejected, distinct from T-ASM-5 and T-ASM-6 | R(D) |
| T-ASM-8 | **Invalid rating** — a value outside `emerging`/`developing`/`secure`/`advanced` ⇒ rejected with an **authored** error, never a raw enum-cast failure | R(D) |
| T-ASM-9 | **Malformed `p_ratings`** — not an array; an element that is not an object; an element with a missing, extra or misspelled key; a non-string value ⇒ each its own authored error | R(D) |
| T-ASM-10 | **Mixed CAS nullability** — exactly one of `p_expected_observation_id` / `p_expected_lock_version` supplied ⇒ rejected; an update never degrades into a create | R(D) |
| T-ASM-11 | **Client cannot assert dimension metadata.** `pg_get_function_arguments` proves the signature has **no** group, label, sort-order, centre, module, enrolment, membership, report, version, checklist, approval, attendance or evidence parameter. A static scan proves `group_code`/`display_name` are read only from `public.assessment_dimensions` | S |

### 8.3 Authorization and gating

| # | Test | Kind |
|---|---|---|
| T-ASM-12 | **Future session.** With `starts_at` set: denied one minute before the scheduled start in `Asia/Singapore`, succeeds one minute after. With `starts_at` NULL: denied at `session_date - 1`, permitted from the start of `session_date`. **All cases re-run under `SET TIME ZONE 'UTC'` and `SET TIME ZONE 'Asia/Singapore'`**, proving the predicate depends only on the pinned literal and never on the caller's GUC | R(D) |
| T-ASM-13 | **Absent student** — attendance `absent` ⇒ denied | R(D) |
| T-ASM-14 | **Missing attendance row** ⇒ denied (fail closed) | R(D) |
| T-ASM-15 | **Inactive enrolment** — `is_active = false` ⇒ denied. The FK cannot express this, so the guard is the enforcement point | R(D) |
| T-ASM-16 | **Inactive trainer assignment** — assignment `is_active = false` ⇒ denied | R(D) |
| T-ASM-17 | **Unrelated trainer** — an active trainer with no assignment to this session ⇒ denied | R(D) |
| T-ASM-18 | **Deactivated trainer membership / deactivated account** ⇒ denied | R(D) |
| T-ASM-19 | **Ambiguous identity** — two active accounts on one `auth.uid()`, and two active memberships ⇒ denied, never an arbitrary pick | R(D) |
| T-ASM-20 | **Management denial** — under a management JWT, both RPCs denied | R(D) |
| T-ASM-21 | **Parent denial** — under a parent JWT linked to **this exact student**, both RPCs denied. The most dangerous pair in the system, tested at its most dangerous | R(D) |
| T-ASM-22 | **Unauthenticated denial** — `auth.uid()` NULL ⇒ both denied | R(D) |
| T-ASM-23 | **Borrowed observation id.** An observation id belonging to a different (session, student) pair, with a correct lock version, supplied by a trainer authorized on the *caller's* session ⇒ rejected; the foreign row is byte-unchanged | R(D) |
| T-ASM-24 | **Non-disclosing denial.** Every denial in §8.3 is asserted **byte-identical** for an existing and a non-existent session/student, and never states which gate failed | R(D) |

### 8.4 Concurrency, rollback and residue

| # | Test | Kind |
|---|---|---|
| T-ASM-25 | **Stale lock-version race.** Two sessions save with the same `p_expected_lock_version` ⇒ **exactly one success and exactly one authored stale-state failure**; final `lock_version` is `previous + 1`, **not** `+2`; the loser wrote nothing | R(C) |
| T-ASM-26 | **Concurrent create race.** Two sessions create for the same (session, student) ⇒ exactly one success, one authored duplicate error asserted **by constraint name** `observations_session_student_key`; exactly one row exists | R(C) |
| T-ASM-27 | **Rollback when a rating write fails.** A forced failure during rating persistence ⇒ the entire transaction rolls back: no observation row created, no observation field updated, `lock_version` unchanged, rating rows unchanged | R(D) |
| T-ASM-28 | **No partial observation/rating state.** After every rejected call in this suite: the observation is either absent or byte-identical to its pre-call state, and its rating set is either absent or exactly its pre-call nine. Asserted field-by-field, not merely as a row count | R(D) |
| T-ASM-29 | **Post-condition holds.** No committed observation ever carries other than exactly nine ratings after a successful save | R(D) |

### 8.5 The audit boundary — replacing the impossible append tests

| # | Test | Kind |
|---|---|---|
| T-ASM-30 | **Assessment save leaves the audit chain unchanged.** Before/after a successful create *and* a successful update: `audit_events` count, `audit_event_targets` count and the `audit_chain_heads` row (`last_seq`, `last_hash`) are **identical**. A rejected save likewise appends nothing | R(D) |
| T-ASM-31 | **Assessment read leaves the audit chain unchanged.** Same three-way assertion around both the populated and the empty read | R(D) |
| T-ASM-32 | **Assessment save creates no report and performs no report transition.** After a create and an update: zero rows in `reports`, `report_versions`, `report_version_ratings`, `report_version_checklist_progress`, `report_version_approvals`. Where a report already exists, its `status`, `lock_version`, `current_cycle_version_id` and `latest_submitted_version_id` are **byte-unchanged**. Static: neither function body contains any statement referencing `public.reports` or any report child table | S+R(D) |
| T-ASM-33 | **Step 7H is untouched.** The 7H migration file is byte-unchanged; the 16-action registry is byte-identical in **both** `audit_append_event` and `audit_verify_chain`; assertion B20's equality still holds; the three guard triggers remain enabled; the four audit functions retain zero client EXECUTE | S+R |
| T-ASM-34 | **Later `requestDraft` / report integration.** Driving the real path — `saveObservation` then `requestDraft` — produces truthful T0/T1 audit events whose payloads carry **only** the permitted derivation identifiers (report id, student id, session id, module id, observation id, status) with **generic constant target labels** (`Report`, `Student`, `Class session`, `Observation`), and which contain **no** observation prose, chip value, follow-up or term-evidence text, individual or aggregate rating value, complete assessment payload, correction content, child name, initial, account name, email or phone number. Asserted over the stored `payload`, the stored `payload_canonical` **and** every `audit_event_targets` label | R(D) |

### 8.6 Read-path behaviour

| # | Test | Kind |
|---|---|---|
| T-ASM-35 | **Safe empty read.** Authorized trainer, no observation ⇒ **exactly one row**, `observation_exists = false`, NULL id and lock version, `'{}'` chips, NULL notes, `'[]'` ratings, `dimension_count = 0`, `is_complete = false`. **Not an error, not zero rows** | R(D) |
| T-ASM-36 | **Populated read** returns the five trainer content fields and the nine ratings, each with its authoritative `display_name` and `group_code`, **ordered by `dimension_code` enum declaration order**, verified against a deliberately shuffled insert order and against a mutated `assessment_dimensions.sort_order` — the order must not move | R(D) |
| T-ASM-37 | **Returned-correction trainer read.** After a management return (`trainer_approved → needs_edit`), the assigned trainer reads the observation and receives the existing `follow_up_notes` and the current nine ratings — the exact capability U-7I-11 / U-30 / CP-4 recorded as blocked | R(D) |
| T-ASM-38 | **No management-only correction metadata.** The same read returns **no** `issue_scope`, affected `dimension_code`, correction `status` or correction **reason** — field-by-field, asserted absent from the return shape | S+R(D) |
| T-ASM-39 | **Read shape is bounded.** `pg_get_function_result` proves the exact eleven output columns and no others — no report, version, status, hash, checklist, approval, audit, centre, module, enrolment, membership, or name/email/phone field | S |

### 8.7 Privilege and posture census

| # | Test | Kind |
|---|---|---|
| T-ASM-40 | **Exact object inventory.** The assessment migration adds **exactly two** functions and nothing else: `public` function census **30**, table count **26**, enum count **12**, applied-migration count **6**; zero new tables, enums, columns, constraints, indexes, policies, triggers, views or extensions; both new functions owned by `postgres`; default ACLs byte-unchanged | R |
| T-ASM-41 | **Function contracts from the catalogue.** Both are `SECURITY DEFINER` with a **pinned empty `search_path`**, owner `postgres`, fully qualified, non-`STRICT`; ASM-1 `VOLATILE`, ASM-2 **`STABLE`**; neither contains dynamic SQL | S |
| T-ASM-42 | **EXECUTE census.** `authenticated` EXECUTE grants rise by **exactly two**; `anon`, `service_role`, `authenticator` and `PUBLIC` hold **zero** EXECUTE on both; the Step 7I zero-EXECUTE four and the Step 7H four are **unchanged** | R |
| T-ASM-43 | **Zero table privileges and zero policies.** `observations`, `observation_ratings` and `assessment_dimensions` retain RLS enabled, **zero policies**, and **zero privileges** for `PUBLIC`/`anon`/`authenticated`/`service_role`/`authenticator`. FORCE RLS off everywhere | R |
| T-ASM-44 | **No client DML by any path.** Under a trainer JWT with `SET ROLE authenticated`, every direct `SELECT`/`INSERT`/`UPDATE`/`DELETE` against `observations`, `observation_ratings` and `assessment_dimensions` is denied **by privilege** — **permission-denied, never an empty result** | R(D) |
| T-ASM-45 | **Step 7G and Step 7I posture unchanged.** 29 policies over the 13 identity/roster tables; 6 Step 7G helpers; `authenticated` SELECT on exactly those 13 tables; the Step 7I inventory and its counts untouched | R |

**45 assessment acceptance tests, `T-ASM-1 … T-ASM-45`, contiguous.** They are **additional to**, and change nothing about, Step 7I's 75.

---

## 9. What this baseline does not do

- It does not authorize any migration, checkpoint, implementation or runtime.
- It does not amend Specification v3, any amendment, `CLAUDE.md`, the Implementation Plan, the Step 7H baseline, the Step 7I baseline, the Figma matrix or the 48-hour contract.
- It does not extend, replace or touch the Step 7H audit registry or either audit function.
- It does not change any ratified Step 7I count.
- It does not resolve CP-3 or CP-5.
- It does not add a table, enum, column, constraint, policy or table grant.
- It does not reintroduce Quick mode or any four-dimension completion path.
- It does not weaken any privacy, approval, audit or evidence control.
- It does not permit real data — synthetic/seed data only, always (ADR-6).
- It does not permit any credential in chat, in any file, in a log, in an error or in a report.
