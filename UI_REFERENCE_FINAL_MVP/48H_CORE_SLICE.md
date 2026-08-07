# 48-Hour Core Slice - The Twelve Physical-Test Screens

**Exactly twelve visual-reference screens block the physical test.** The flow order is contiguous 1-12 (Amendment 005 A-043).

The other 24 portal screens are `Post-48-hour final-MVP scope` (A-044) - required for the final MVP, **not** required before the physical test. **Do not treat all 36 as a pre-test gate, and do not drop a core screen from the twelve.**

---

## The governed workflow

```
Trainer authentication
  -> session selection
    -> roster
      -> assessment
        -> grounded AI generation
          -> Trainer review / edit / checklist / approval
            -> Management authentication
              -> Management queue
                -> Management wording edit, return or final Approve & Submit
                  -> Parent authentication
                    -> Parent submitted-report list
                      -> Parent canonical report detail
```

**The governed lifecycle includes Trainer approval before Management final submission**, even where a high-level description abbreviates it. Trainer approval commits `draft_ready | needs_edit` to `trainer_approved`, freezes that version and **publishes nothing**. **Management's Approve & Submit is the only action that makes a report parent-visible.** Where Management returns a report, the Trainer owns the correction and must reapprove through a new immutable version; a silent byte-identical save is rejected server-side.

---

## The twelve screens, in flow order

### 1. AUTH-01 - Trainer Login

| Field | Value |
|---|---|
| Flow order | **1** |
| Screen ID | `AUTH-01` |
| Folder | `AUTH-01-trainer-login` |
| Canonical route | `/login?role=trainer` |
| Figma node | `546:370` |
| Exact Figma URL | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=546-370&m=dev |
| Role | Trainer |
| Required user action | Sign in as the assigned Trainer using a real Supabase Auth identity. The role query selects presentation only. |
| Previous screen | - (entry point) |
| Next screen | 05 Trainer Schedule |
| Screenshot status | Validated — ready for implementation |
| Native dimensions | **1440 × 1024 px** (aspect 45:32) |
| Validation classification | `PASS WITH NOTE — READY` (validated 2026-08-06) |
| File size | 95,496 bytes |
| SHA-256 | `b1ad24e4f414ece90d7a1b091e516a44163f28856e7898a60db288f487a56da1` |
| Validation note | Figma connector unavailable at validation; native node dimensions not independently verified and node-level comparison not performed. Node association is from recorded pack metadata and corroborating visual identity. Local technical and visual evidence sufficient. |
| Implementation status | `Implemented but visually unaligned` |
| Backend-integration status | Delivered on `feat/48h-backend` |
| Vocabulary-implementation status | Not rating-bearing - no competency-rating vocabulary surface |

### 2. 05 - Trainer Schedule

| Field | Value |
|---|---|
| Flow order | **2** |
| Screen ID | `05` |
| Folder | `05-trainer-schedule` |
| Canonical route | `/trainer/schedule` |
| Figma node | `591:9` |
| Exact Figma URL | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=591-9&m=dev |
| Role | Trainer |
| Required user action | Select an assigned governed Class Session. |
| Previous screen | AUTH-01 Trainer Login |
| Next screen | 06 Trainer Student Roster |
| Screenshot status | Validated — ready for implementation |
| Native dimensions | **1675 × 1155 px** (aspect 335:231) |
| Validation classification | `PASS WITH NOTE — READY` (validated 2026-08-06) |
| File size | 90,168 bytes |
| SHA-256 | `d2d58b16b1ee2d68123ae87f58bc3aa2e586d2a1df925a84d231990564ff2ceb` |
| Validation note | Figma connector unavailable at validation; native node dimensions not independently verified and node-level comparison not performed. Node association is from recorded pack metadata and corroborating visual identity. Local technical and visual evidence sufficient. |
| Implementation status | `Partially implemented` |
| Backend-integration status | Partially delivered |
| Vocabulary-implementation status | Not rating-bearing - no competency-rating vocabulary surface |

### 3. 06 - Trainer Student Roster

| Field | Value |
|---|---|
| Flow order | **3** |
| Screen ID | `06` |
| Folder | `06-trainer-student-roster` |
| Canonical route | `/trainer/schedule/[sessionId]/student-roster` |
| Figma node | `487:9` |
| Exact Figma URL | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=487-9&m=dev |
| Role | Trainer |
| Required user action | Select an actively enrolled student from the session roster. Attendance and eligibility remain server-governed. |
| Previous screen | 05 Trainer Schedule |
| Next screen | 07 Trainer Grade Student |
| Screenshot status | Validated — ready for implementation |
| Native dimensions | **1440 × 1120 px** (aspect 9:7) |
| Validation classification | `PASS WITH NOTE — READY` (validated 2026-08-06) |
| File size | 119,195 bytes |
| SHA-256 | `78e4b618ed154ced8be68f8997903a8fd30e2f99f962ae08a01345e67e13659a` |
| Validation note | Figma connector unavailable at validation; native node dimensions not independently verified and node-level comparison not performed. Node association is from recorded pack metadata and corroborating visual identity. Local technical and visual evidence sufficient. |
| Implementation status | `Implemented but visually unaligned` |
| Backend-integration status | Delivered on `feat/48h-backend` |
| Vocabulary-implementation status | Not rating-bearing - no competency-rating vocabulary surface |

### 4. 07 - Trainer Grade Student

| Field | Value |
|---|---|
| Flow order | **4** |
| Screen ID | `07` |
| Folder | `07-trainer-grade-student` |
| Canonical route | `/trainer/schedule/[sessionId]/student-roster/[studentId]/grade-student` |
| Figma node | `784:679` |
| Exact Figma URL | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=784-679&m=dev |
| Role | Trainer |
| Required user action | Record all nine governed assessment dimensions using Beginning / Developing / Mastering / Mastered. |
| Previous screen | 06 Trainer Student Roster |
| Next screen | 08 Trainer AI Report Generation |
| Screenshot status | Validated — ready for implementation |
| Native dimensions | **1650 × 1200 px** (aspect 11:8) |
| Validation classification | `PASS WITH NOTE — READY` (validated 2026-08-06) |
| File size | 131,418 bytes |
| SHA-256 | `1df95a5bacae3c07bf3f0dfd0940f2dcf6637b2e539634baab5498588d13199d` |
| Validation note | Figma connector unavailable at validation; native node dimensions not independently verified and node-level comparison not performed. Node association is from recorded pack metadata and corroborating visual identity. Local technical and visual evidence sufficient. |
| Implementation status | `Implemented but visually unaligned` |
| Backend-integration status | Delivered on `feat/48h-backend` |
| Vocabulary-implementation status | Rating-bearing - Amendment 006 ratified; code implementation pending Backend V2 / Frontend V3 |

### 5. 08 - Trainer AI Report Generation

| Field | Value |
|---|---|
| Flow order | **5** |
| Screen ID | `08` |
| Folder | `08-trainer-ai-report-generation` |
| Canonical route | `/trainer/schedule/[sessionId]/student-roster/[studentId]/grade-student/ai-report-generation` |
| Figma node | `784:340` |
| Exact Figma URL | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=784-340&m=dev |
| Role | Trainer |
| Required user action | Request a grounded AI draft, then store or cancel it. The AI cannot approve, submit or publish. |
| Previous screen | 07 Trainer Grade Student |
| Next screen | 10 Trainer Student Report |
| Screenshot status | Validated — ready for implementation |
| Native dimensions | **1650 × 1180 px** (aspect 165:118) |
| Validation classification | `PASS WITH NOTE — READY` (validated 2026-08-06) |
| File size | 172,209 bytes |
| SHA-256 | `3160524f41fc84cd20e7f5bf8f2b9e6a1215354c17faf5b3b31644d54eae20c4` |
| Validation note | Figma connector unavailable at validation; native node dimensions not independently verified and node-level comparison not performed. Node association is from recorded pack metadata and corroborating visual identity. Local technical and visual evidence sufficient. |
| Implementation status | `Implemented but visually unaligned` |
| Backend-integration status | Delivered on `feat/48h-backend` |
| Vocabulary-implementation status | Rating-bearing - Amendment 006 ratified; code implementation pending Backend V2 / Frontend V3 |

### 6. 10 - Trainer Student Report

| Field | Value |
|---|---|
| Flow order | **6** |
| Screen ID | `10` |
| Folder | `10-trainer-student-report` |
| Canonical route | `/trainer/reports/[reportId]` |
| Figma node | `664:9` |
| Exact Figma URL | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=664-9&m=dev |
| Role | Trainer |
| Required user action | Review and edit parent-facing wording, complete the checklist and approve for Management review. Trainer approval does not publish. |
| Previous screen | 08 Trainer AI Report Generation |
| Next screen | AUTH-02 Management Login |
| Screenshot status | Validated — ready for implementation |
| Native dimensions | **1440 × 1351 px** (aspect 1440:1351) |
| Validation classification | `PASS WITH NOTE — READY` (validated 2026-08-06) |
| File size | 285,426 bytes |
| SHA-256 | `e64291dc80a2af7378635a3daffe63952899768c41493e8a185da12119b4f730` |
| Validation note | Figma connector unavailable at validation; native node dimensions not independently verified and node-level comparison not performed. Node association is from recorded pack metadata and corroborating visual identity. Local technical and visual evidence sufficient. |
| Implementation status | `Implemented but visually unaligned` |
| Backend-integration status | Delivered on `feat/48h-backend` |
| Vocabulary-implementation status | Rating-bearing - Amendment 006 ratified; code implementation pending Backend V2 / Frontend V3 |

### 7. AUTH-02 - Management Login

| Field | Value |
|---|---|
| Flow order | **7** |
| Screen ID | `AUTH-02` |
| Folder | `AUTH-02-management-login` |
| Canonical route | `/login?role=management` |
| Figma node | `459:13` |
| Exact Figma URL | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=459-13&m=dev |
| Role | Management |
| Required user action | Sign in as the named Management account. No shared credential exists. |
| Previous screen | 10 Trainer Student Report |
| Next screen | 29 Management Reports |
| Screenshot status | Validated — ready for implementation |
| Native dimensions | **1440 × 1024 px** (aspect 45:32) |
| Validation classification | `PASS WITH NOTE — READY` (validated 2026-08-06) |
| File size | 95,584 bytes |
| SHA-256 | `fcc3db9377a1b1175984bc90732c588e58bd05269d767af2ee69ed8d42668483` |
| Validation note | Figma connector unavailable at validation; native node dimensions not independently verified and node-level comparison not performed. Node association is from recorded pack metadata and corroborating visual identity. Local technical and visual evidence sufficient. |
| Implementation status | `Implemented but visually unaligned` |
| Backend-integration status | Delivered on `feat/48h-backend` |
| Vocabulary-implementation status | Not rating-bearing - no competency-rating vocabulary surface |

### 8. 29 - Management Reports

| Field | Value |
|---|---|
| Flow order | **8** |
| Screen ID | `29` |
| Folder | `29-management-reports` |
| Canonical route | `/management/reports` |
| Figma node | `527:170` |
| Exact Figma URL | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=527-170&m=dev |
| Role | Management |
| Required user action | Open the pending Management review queue and select the trainer-approved report. Governed correction tracking is visible here. |
| Previous screen | AUTH-02 Management Login |
| Next screen | 19 Management Student Report |
| Screenshot status | Validated — ready for implementation |
| Native dimensions | **1440 × 1160 px** (aspect 36:29) |
| Validation classification | `PASS WITH NOTE — READY` (validated 2026-08-06) |
| File size | 98,030 bytes |
| SHA-256 | `eddda3b14c7e34747b237545116a6fb91e356ec3c9155fc7f8f28e00bae54c19` |
| Validation note | Figma connector unavailable at validation; native node dimensions not independently verified and node-level comparison not performed. Node association is from recorded pack metadata and corroborating visual identity. Local technical and visual evidence sufficient. Native frame is taller than its current content, leaving empty page background below; this is the frame's own height, not a crop. |
| Implementation status | `Implemented but visually unaligned` |
| Backend-integration status | Delivered on `feat/48h-backend` |
| Vocabulary-implementation status | Not rating-bearing - no competency-rating vocabulary surface |

### 9. 19 - Management Student Report

| Field | Value |
|---|---|
| Flow order | **9** |
| Screen ID | `19` |
| Folder | `19-management-student-report` |
| Canonical route | `/management/students/[studentId]/reports/[reportId]` |
| Figma node | `648:330` |
| Exact Figma URL | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=648-330&m=dev |
| Role | Management |
| Required user action | Edit parent-facing wording only, return assessment-level concerns to the Trainer, or perform final Approve and Submit. |
| Previous screen | 29 Management Reports |
| Next screen | AUTH-03 Parent Login |
| Screenshot status | Validated — ready for implementation |
| Native dimensions | **1440 × 1330 px** (aspect 144:133) |
| Validation classification | `PASS WITH NOTE — READY` (validated 2026-08-06) |
| File size | 281,963 bytes |
| SHA-256 | `394d8475498602aee27675d8437ee9395316c45da986b5a8f4db46a9ef94e6f0` |
| Validation note | Figma connector unavailable at validation; native node dimensions not independently verified and node-level comparison not performed. Node association is from recorded pack metadata and corroborating visual identity. Local technical and visual evidence sufficient. |
| Implementation status | `Implemented but visually unaligned` |
| Backend-integration status | Delivered on `feat/48h-backend` |
| Vocabulary-implementation status | Rating-bearing - Amendment 006 ratified; code implementation pending Backend V2 / Frontend V3 |

### 10. AUTH-03 - Parent Login

| Field | Value |
|---|---|
| Flow order | **10** |
| Screen ID | `AUTH-03` |
| Folder | `AUTH-03-parent-login` |
| Canonical route | `/login?role=parent` |
| Figma node | `546:413` |
| Exact Figma URL | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=546-413&m=dev |
| Role | Parent |
| Required user action | Sign in as the Parent linked to the student. Authority requires a live parent_student_links row. |
| Previous screen | 19 Management Student Report |
| Next screen | 32 Parent Reports |
| Screenshot status | Validated — ready for implementation |
| Native dimensions | **1440 × 1024 px** (aspect 45:32) |
| Validation classification | `PASS WITH NOTE — READY` (validated 2026-08-06) |
| File size | 95,425 bytes |
| SHA-256 | `fcd4d4edcebadd20d6ebca43b181538631fe791fab06007a389120f56853b85c` |
| Validation note | Figma connector unavailable at validation; native node dimensions not independently verified and node-level comparison not performed. Node association is from recorded pack metadata and corroborating visual identity. Local technical and visual evidence sufficient. |
| Implementation status | `Implemented but visually unaligned` |
| Backend-integration status | Delivered on `feat/48h-backend` |
| Vocabulary-implementation status | Not rating-bearing - no competency-rating vocabulary surface |

### 11. 32 - Parent Reports

| Field | Value |
|---|---|
| Flow order | **11** |
| Screen ID | `32` |
| Folder | `32-parent-reports` |
| Canonical route | `/parent/reports` |
| Figma node | `533:180` |
| Exact Figma URL | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=533-180&m=dev |
| Role | Parent |
| Required user action | Select a submitted canonical report belonging to a linked child. |
| Previous screen | AUTH-03 Parent Login |
| Next screen | 33 Parent Class Report |
| Screenshot status | Validated — ready for implementation |
| Native dimensions | **1440 × 1120 px** (aspect 9:7) |
| Validation classification | `PASS WITH NOTE — READY` (validated 2026-08-06) |
| File size | 73,658 bytes |
| SHA-256 | `90e368c17826bb114173ec5f40f9421eaa33d81aa2032bd0e8a97db01e370aea` |
| Validation note | Figma connector unavailable at validation; native node dimensions not independently verified and node-level comparison not performed. Node association is from recorded pack metadata and corroborating visual identity. Local technical and visual evidence sufficient. Native frame is taller than its current content, leaving empty page background below; this is the frame's own height, not a crop. |
| Implementation status | `Implemented but visually unaligned` |
| Backend-integration status | Delivered on `feat/48h-backend` |
| Vocabulary-implementation status | Not rating-bearing - no per-dimension rating grid may appear on any Parent surface, in any form or wording |

### 12. 33 - Parent Class Report

| Field | Value |
|---|---|
| Flow order | **12** |
| Screen ID | `33` |
| Folder | `33-parent-class-report` |
| Canonical route | `/parent/reports/[reportId]` |
| Figma node | `627:9` |
| Exact Figma URL | https://www.figma.com/design/sSY1TYw3jyVlZDy8V2Mu7g/SDS-dashboard?node-id=627-9&m=dev |
| Role | Parent |
| Required user action | Read the canonical submitted report. View-only. |
| Previous screen | 32 Parent Reports |
| Next screen | - (end of the walkthrough) |
| Screenshot status | Validated — ready for implementation |
| Native dimensions | **1440 × 1340 px** (aspect 72:67) |
| Validation classification | `PASS WITH NOTE — READY` (validated 2026-08-06) |
| File size | 293,726 bytes |
| SHA-256 | `2aaeb446065f8360ed6b3804490c7843d96e1e5e534e754ed738c61dd6adea67` |
| Validation note | Figma connector unavailable at validation; native node dimensions not independently verified and node-level comparison not performed. Node association is from recorded pack metadata and corroborating visual identity. Local technical and visual evidence sufficient. |
| Implementation status | `Implemented but visually unaligned` |
| Backend-integration status | Delivered on `feat/48h-backend` |
| Vocabulary-implementation status | Not rating-bearing - no per-dimension rating grid may appear on any Parent surface, in any form or wording |

---

## Summary table

| # | ID | Folder | Route | Node | Role | Screenshot | Implementation | Backend | Vocabulary |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | `AUTH-01` | `AUTH-01-trainer-login` | `/login?role=trainer` | `546:370` | Trainer | Validated — ready | `Implemented but visually unaligned` | Delivered on `feat/48h-backend` | Not rating-bearing - no competency-rating vocabulary surface |
| 2 | `05` | `05-trainer-schedule` | `/trainer/schedule` | `591:9` | Trainer | Validated — ready | `Partially implemented` | Partially delivered | Not rating-bearing - no competency-rating vocabulary surface |
| 3 | `06` | `06-trainer-student-roster` | `/trainer/schedule/[sessionId]/student-roster` | `487:9` | Trainer | Validated — ready | `Implemented but visually unaligned` | Delivered on `feat/48h-backend` | Not rating-bearing - no competency-rating vocabulary surface |
| 4 | `07` | `07-trainer-grade-student` | `/trainer/schedule/[sessionId]/student-roster/[studentId]/grade-student` | `784:679` | Trainer | Validated — ready | `Implemented but visually unaligned` | Delivered on `feat/48h-backend` | Rating-bearing - Amendment 006 ratified; code implementation pending Backend V2 / Frontend V3 |
| 5 | `08` | `08-trainer-ai-report-generation` | `/trainer/schedule/[sessionId]/student-roster/[studentId]/grade-student/ai-report-generation` | `784:340` | Trainer | Validated — ready | `Implemented but visually unaligned` | Delivered on `feat/48h-backend` | Rating-bearing - Amendment 006 ratified; code implementation pending Backend V2 / Frontend V3 |
| 6 | `10` | `10-trainer-student-report` | `/trainer/reports/[reportId]` | `664:9` | Trainer | Validated — ready | `Implemented but visually unaligned` | Delivered on `feat/48h-backend` | Rating-bearing - Amendment 006 ratified; code implementation pending Backend V2 / Frontend V3 |
| 7 | `AUTH-02` | `AUTH-02-management-login` | `/login?role=management` | `459:13` | Management | Validated — ready | `Implemented but visually unaligned` | Delivered on `feat/48h-backend` | Not rating-bearing - no competency-rating vocabulary surface |
| 8 | `29` | `29-management-reports` | `/management/reports` | `527:170` | Management | Validated — ready | `Implemented but visually unaligned` | Delivered on `feat/48h-backend` | Not rating-bearing - no competency-rating vocabulary surface |
| 9 | `19` | `19-management-student-report` | `/management/students/[studentId]/reports/[reportId]` | `648:330` | Management | Validated — ready | `Implemented but visually unaligned` | Delivered on `feat/48h-backend` | Rating-bearing - Amendment 006 ratified; code implementation pending Backend V2 / Frontend V3 |
| 10 | `AUTH-03` | `AUTH-03-parent-login` | `/login?role=parent` | `546:413` | Parent | Validated — ready | `Implemented but visually unaligned` | Delivered on `feat/48h-backend` | Not rating-bearing - no competency-rating vocabulary surface |
| 11 | `32` | `32-parent-reports` | `/parent/reports` | `533:180` | Parent | Validated — ready | `Implemented but visually unaligned` | Delivered on `feat/48h-backend` | Not rating-bearing - no per-dimension rating grid may appear on any Parent surface, in any form or wording |
| 12 | `33` | `33-parent-class-report` | `/parent/reports/[reportId]` | `627:9` | Parent | Validated — ready | `Implemented but visually unaligned` | Delivered on `feat/48h-backend` | Not rating-bearing - no per-dimension rating grid may appear on any Parent surface, in any form or wording |

---

## What the twelve screens do not cover

Six blocked design families are exercised by the physical-test walkthrough but have **no Figma frame in the ratified inventory**, because no suitable frame exists: the management review queue, management final review, the wording-only editor, the return-to-trainer dialog, correction tracking, and final Approve & Submit. Two notification surfaces are the remaining blocked families.

**These are not omissions from the 36-screen inventory - they are screens the Figma file does not contain.** They are built to the governed contract's field lists and to the ratified rules. **No frame, node ID or field may be invented for any of them.** Screens 19 and 29 are the *canonical submitted-report* surfaces; the management review-stage surfaces are separate and still blocked.

---

## One core screen has no implemented route

**ID 05 Trainer Schedule (`/trainer/schedule`, flow order 2) has no implemented route.** Session selection is currently performed on the trainer landing surface. The ratified inventory section 7.3 classifies this as a **coverage gap, not a route mismatch**, and its treatment is **`Operator decision required`**.

**This pack records the decision; it does not make it, and it creates no route.**

*Governed by Amendment 005 A-043, the ratified inventory section 5, and the physical-test implementation contract.*
