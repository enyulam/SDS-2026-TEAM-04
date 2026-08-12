# 26 - Management Add Class - implementation notes

**Append-only.** Add a new entry at the bottom for every implementation checkpoint touching this screen. Never edit or delete an existing entry - a superseded entry is corrected by a later entry that says so.

---

## Entry template - copy below the last entry

```
Timestamp (Asia/Singapore):
Source branch:
Starting commit:
Screen ID:                     26
Existing route audited:
Components preserved:
Components replaced:
Components created:
DTO and port changes:
Fixture changes:
Backend dependencies discovered:
Vocabulary dependencies:
Governance blockers:
Browser viewport:
Before screenshot:             implementation-before.png
After screenshot:              implementation-after.png
Validation:
Ending commit:
Acceptance status:
```

**Rules.**

- Record a missing backend path or a missing governance decision as a **dependency**. Never invent it.
- Record a frame-versus-governance discrepancy. Never resolve it locally.
- Synthetic data only in any captured screenshot.
- One bounded screen checkpoint, or one tightly coupled shared-shell checkpoint, per commit.

---

## Entries

```
Timestamp (Asia/Singapore):    2026-08-13
Source branch:                 develop
Starting commit:               77047ee
Screen ID:                     26
Existing route audited:        NONE - screen 26 had no route at any path. Verified
                               against app/**/page.tsx before the route was created.
Components preserved:          -
Components replaced:           -
Components created:            features/management/management-add-class.tsx
                               app/(portals)/management/classes/add-class/page.tsx
DTO and port changes:          server/modules/class-session/class-creation.ts (new module:
                                 readAddClassOptionsCore, createClassCore)
                               management-view/projections.ts: readManagementAddClassOptionsCore,
                                 createManagementClassCore
                               adapter-dtos.ts: AdapterClassGradeChoiceDto, AdapterTermOptionDto,
                                 AdapterAddClassOptionsDto, AdapterCreateClassInput,
                                 AdapterClassCreationOutcomeDto
                               participant-actions.ts: adapterReadAddClassOptions,
                                 adapterCreateManagementClass
                               contracts/physical-test.ts: ClassGradeChoiceDto, TermOptionDto,
                                 AddClassOptionsDto, CreateClassInput, ClassCreationOutcomeDto
                               physical-test-port.ts: readAddClassOptions, createManagementClass
Fixture changes:               FIXTURE_TERMS (4 rows, mirroring the seeded DEVELOPMENT
                               calendar); readAddClassOptions; createManagementClass, which
                               PERSISTS NOTHING and returns no id that could be mistaken for
                               a governed one.
Backend dependencies discovered:
                               MET. Migration 20260813090000_portal_p2_2_class_creation.sql -
                               two SECURITY DEFINER RPCs (admin_create_class_module,
                               admin_create_class_session) firing the two already-ratified
                               audit strings. ZERO tables, columns, enums, policies or
                               grants added; the audit registry is UNMOVED at 19.
Vocabulary dependencies:       Not rating-bearing. Level options are the three ratified Class
                               Grades read from `class_grades`; the frame's `Junior` is not
                               one and is not a synonym for one (A-016, A-054).
Governance blockers:           ONE, STOPPED AND STATED. `Assigned Trainer` needs
                               `admin.trainer_assigned`, a THIRD audit string the Operator did
                               not name when authorizing this phase on `admin.module_created`
                               and `admin.session_created`. Migration assertion C-8 FAILS THE
                               BUILD if either RPC ever reaches class_session_assignments, so
                               the stop is structural rather than prose. It awaits an Operator
                               decision and is NOT a defect of this checkpoint.
Browser viewport:              NOT CAPTURED - see Validation.
Before screenshot:             NOT CAPTURED
After screenshot:              NOT CAPTURED
Validation:                    prove:portal-p2-2-create exit 0 (11 SQL legs + 5 runner checks;
                               denials before the permit control; the stop measured at
                               RUNTIME). prove:portal-p2-2 exit 0. prove:hero-all 17/17.
                               Every portal suite exit 0. test:integration 0. tsc 0.
                               eslint 0 errors. next build 0. Nav suite 0 with 17 routes.
                               NOT-RUN: prove:stage3-authenticated - an Operator-owned
                               `next dev` (PID 46348) holds this directory and Next 16 refuses
                               a second; the cause was reproduced directly and is NOT this
                               checkpoint's code. It was NOT killed.
                               NOT-RUN: VISUAL acceptance. No screenshot was captured and none
                               is claimed.
Ending commit:                 (recorded in BUILD_NOTES at the phase boundary)
Acceptance status:             IMPLEMENTED_AWAITING_VERIFICATION. Operator acceptance is not
                               claimed and cannot be self-set.
```

### Frame-versus-governance discrepancies, recorded rather than resolved

| Frame element | Disposition |
|---|---|
| `Assigned Trainer` + search | ⛔ **STOPPED** - needs a third audit string not named in this phase's authorization. Structural via migration assertion `C-8`. |
| `Trainer Assistant (TA)` (pack `.md`) | ⛔ **PROHIBITED** - `A-014`, `G-7`. `REGISTERED-OMISSION`, **never ends**. |
| `Class code` | ⛔ **OMITTED** - `C-14`. |
| `Capacity` | ⛔ **OMITTED** - `C-14`. |
| `Program` | ⛔ **NOT BUILT** - "programme" has no entity (`C-14`); creating one would be the hidden `classes` entity `A-016` forbids. The class's name IS the Class Module title, which is why the frame renders `Public Speaking` in both fields. |
| `Class code: Junior` / `Level: Intermediate` | ⛔ `Junior` is **not** a Class Grade and **not** a synonym for one (`A-016`, `A-054`). Level is read from `class_grades`. |
| `Room` drawn as a dropdown | ⚠️ **BUILT AS A TEXT INPUT.** No room inventory exists in any table, seed or ruling; the frame is a static render showing one value and enumerating no options. A `<select>` would require inventing an entity (`A-022`). |
| `Start time` / `End time` drawn as dropdowns | ⚠️ **BUILT AS TIME INPUTS**, same reason - no slot vocabulary exists to enumerate. |
| `Term` dropdown | ✅ **BUILT AS A SELECT** - backed by the four seeded `terms` rows. ⚠️ Those are a **DEVELOPMENT CALENDAR** and the migration says so; the real calendar is an **OPERATOR INPUT**. |
| Sun-Sat day strip | ✅ Built, and it is a **GENERATOR, not a stored schedule** (`C-14`). No recurrence rule is persisted and no duplicated calendar record is created (`A-047`). |

```
Timestamp (Asia/Singapore):    2026-08-13
Source branch:                 develop
Starting commit:               29f1668
Screen ID:                     26
Existing route audited:        /management/classes/add-class (created at the previous entry)
Components preserved:          Everything. This entry ADDS the Assigned Trainer section.
Components created:            -
DTO and port changes:          TrainerChoiceDto added to AddClassOptionsDto;
                               trainerMembershipId added to CreateClassInput;
                               sessionsAssigned added to ClassCreationOutcomeDto.
Fixture changes:               readAddClassOptions now derives trainers from SESSIONS;
                               createManagementClass reports sessionsAssigned.
Backend dependencies discovered:
                               MET. Migration 20260813120000_portal_p2_2b_trainer_assignment.sql
                               - ONE SECURITY DEFINER RPC, admin_assign_session_trainer,
                               emitting the ALREADY-RATIFIED admin.trainer_assigned.
                               REGISTRY UNMOVED AT 19 - the string was ratified at Step 7H
                               and had simply never had a writer.
Vocabulary dependencies:       Unchanged. Not rating-bearing.
Governance blockers:           NONE REMAIN FOR THIS SCREEN. The previous entry recorded
                               `Assigned Trainer` as STOPPED on a third audit string; the
                               Operator required the registry be CHECKED rather than asked
                               about, and the string was ALREADY THERE. The stop rested on a
                               misread scope, not a missing fact.
                               STILL NOT BUILT, and correctly: UNASSIGNMENT. Leaving an
                               assigned session with no trainer is a different action with no
                               ratified string, and 26 needs none - at creation time there is
                               nothing to unassign, and the frame's `-` removes the trainer
                               from the FORM before it is saved.
Browser viewport:              NOT CAPTURED.
Before screenshot:             NOT CAPTURED
After screenshot:              NOT CAPTURED
Validation:                    prove:portal-p2-2b exit 0 - 9 SQL legs + 8 runner checks,
                               EVERY leg CALLS the RPC (the standing rule set this day), with
                               P24a-CALL mechanizing that rule across the whole P2-2 family
                               and P24a-CALLc controlling it. prove:hero-all 17/17. Every
                               portal suite exit 0. test:integration 0. tsc 0. eslint 0.
                               build 0. nav 0. prove:no-secrets 0.
                               NOT-RUN: prove:stage3-authenticated (Operator-owned next dev)
                               and VISUAL acceptance.
Ending commit:                 (recorded in BUILD_NOTES at the phase boundary)
Acceptance status:             IMPLEMENTED_AWAITING_VERIFICATION.
```

### The discrepancy table, updated

| Frame element | Disposition |
|---|---|
| `Assigned Trainer` + search | ~~⛔ **STOPPED**~~ ✅ **BUILT 2026-08-13 (`P2-2b`).** One trainer, assigned to every session created — `A-016` puts assignment at CLASS-SESSION level, so N dates is N governed assignments. ⚠️ Choosing nobody is a **valid** outcome, not an incomplete form. |
| The `-` beside the selected trainer | ✅ **Form state, not a governed act.** At creation time there is nothing to unassign. ⛔ **UNASSIGNMENT of a saved session is NOT built** — a different action, no ratified string. |
| `Trainer Assistant (TA)` (pack `.md`) | ⛔ **PROHIBITED, and now also STRUCTURALLY IMPOSSIBLE** — `class_session_assignments` pins `trainer_role` by CHECK and by composite FK, so a non-`trainer` membership cannot be assigned at all (`A-014`, `G-7`). |
