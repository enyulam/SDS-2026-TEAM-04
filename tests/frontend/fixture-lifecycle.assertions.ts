import { createDeterministicFixturePhysicalTestPort } from "../../lib/frontend/fixtures/physical-test-fixture";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function run() {
const port = createDeterministicFixturePhysicalTestPort("trainer");
port.reset();

const initialParentList = await port.listParentSubmittedReports();
assert(initialParentList.outcome === "success", "Initial parent list must load");
assert(
  !initialParentList.data.some((item) => item.studentId === "student-birch"),
  "A Trainer working report must not be parent-visible",
);

const birchWorking = await port.getTrainerWorkingReport("report-birch");
assert(birchWorking.outcome === "success", "Trainer working report must load");
const birchChecklist = await port.updateTrainerChecklist({
  reportId: "report-birch",
  expectedVersionId: birchWorking.data.versionId,
  checklist: {
    evidenceConfirmed: true,
    aiDraftReviewed: true,
    privacyChecked: true,
  },
});
assert(birchChecklist.outcome === "success", "Trainer checklist must save");
const birchApproval = await port.trainerApprove({
  reportId: "report-birch",
  expectedLockVersion: birchChecklist.data.lockVersion,
  expectedVersionId: birchChecklist.data.versionId,
  expectedContentHash: birchChecklist.data.contentHash,
});
assert(birchApproval.outcome === "success", "Trainer approval must succeed");
assert(birchApproval.data.published === false, "Trainer approval must not publish");

const afterTrainerApproval = await port.listParentSubmittedReports();
assert(afterTrainerApproval.outcome === "success", "Parent list must still load");
assert(
  !afterTrainerApproval.data.some((item) => item.studentId === "student-birch"),
  "Trainer approval must not make parent content visible",
);

const managementReview = await port.getManagementReview("report-birch");
assert(managementReview.outcome === "success", "Management safe review must load");
const editedPanels = {
  ...managementReview.data.panels,
  todaysStrength: `${managementReview.data.panels.todaysStrength} The confident opening was especially clear.`,
};
const wordingEdit = await port.managementEditWording({
  reportId: "report-birch",
  expectedLockVersion: managementReview.data.lockVersion,
  expectedVersionId: managementReview.data.versionId,
  expectedWordingHash: managementReview.data.wordingHash,
  panels: editedPanels,
});
assert(wordingEdit.outcome === "success", "Management wording edit must succeed");

const afterWordingEdit = await port.getManagementReview("report-birch");
assert(afterWordingEdit.outcome === "success", "Edited Management review must reload");
const returnInput = {
  reportId: "report-birch",
  expectedLockVersion: afterWordingEdit.data.lockVersion,
  expectedVersionId: afterWordingEdit.data.versionId,
  issueScope: "derived_assessment_fact" as const,
  reason: "Please re-check that the stated strength is supported before reapproval.",
};
const returned = await port.managementReturnToTrainer(returnInput);
assert(returned.outcome === "success", "Management return must succeed");
const duplicateReturn = await port.managementReturnToTrainer(returnInput);
assert(
  duplicateReturn.outcome === "stale_state",
  "A duplicate return must produce governed stale-state feedback",
);

const pendingAfterReturn = await port.listManagementPendingReviews();
assert(pendingAfterReturn.outcome === "success", "Pending queue must load after return");
assert(
  !pendingAfterReturn.data.some((item) => item.reportId === "report-birch"),
  "A returned report must leave pending final submission",
);
const parentAfterReturn = await port.listParentSubmittedReports();
assert(parentAfterReturn.outcome === "success", "Parent list must load after return");
assert(
  !parentAfterReturn.data.some((item) => item.studentId === "student-birch"),
  "A returned report must remain parent-invisible",
);

const returnedWorking = await port.getTrainerWorkingReport("report-birch");
assert(returnedWorking.outcome === "success", "Returned Trainer detail must load");
assert(returnedWorking.data.openCorrection?.status === "open", "Open concern must reach Trainer");
const silentUnchangedSave = await port.saveTrainerEdit({
  reportId: "report-birch",
  expectedLockVersion: returnedWorking.data.lockVersion,
  expectedVersionId: returnedWorking.data.versionId,
  panels: returnedWorking.data.panels,
});
assert(
  silentUnchangedSave.outcome === "validation",
  "A silent byte-identical correction save must be rejected",
);
const reaffirmed = await port.saveTrainerEdit({
  reportId: "report-birch",
  expectedLockVersion: returnedWorking.data.lockVersion,
  expectedVersionId: returnedWorking.data.versionId,
  panels: returnedWorking.data.panels,
  reaffirmCorrectionRequestId: returnedWorking.data.openCorrection.id,
});
assert(reaffirmed.outcome === "success", "Explicit reaffirmation must create a version");
assert(reaffirmed.data.correctionResolved, "The new version must resolve the concern");

const correctedWorking = await port.getTrainerWorkingReport("report-birch");
assert(correctedWorking.outcome === "success", "Corrected version must load");
assert(
  Object.values(correctedWorking.data.checklist).every((value) => value === false),
  "A correction version must start with a fresh checklist",
);
const prematureReapproval = await port.trainerApprove({
  reportId: "report-birch",
  expectedLockVersion: correctedWorking.data.lockVersion,
  expectedVersionId: correctedWorking.data.versionId,
  expectedContentHash: correctedWorking.data.contentHash,
});
assert(
  prematureReapproval.outcome === "validation",
  "Reapproval must remain checklist-gated",
);
const freshChecklist = await port.updateTrainerChecklist({
  reportId: "report-birch",
  expectedVersionId: correctedWorking.data.versionId,
  checklist: {
    evidenceConfirmed: true,
    aiDraftReviewed: true,
    privacyChecked: true,
  },
});
assert(freshChecklist.outcome === "success", "Fresh checklist must save");
const reapproval = await port.trainerApprove({
  reportId: "report-birch",
  expectedLockVersion: freshChecklist.data.lockVersion,
  expectedVersionId: freshChecklist.data.versionId,
  expectedContentHash: freshChecklist.data.contentHash,
});
assert(reapproval.outcome === "success", "Trainer reapproval must succeed");

const pendingAfterReapproval = await port.listManagementPendingReviews();
assert(pendingAfterReapproval.outcome === "success", "Pending queue must reload");
assert(
  pendingAfterReapproval.data.some((item) => item.reportId === "report-birch"),
  "Trainer reapproval must return the item to Management",
);

const finalReview = await port.getManagementReview("report-birch");
assert(finalReview.outcome === "success", "Final Management review must load");
const submitInput = {
  reportId: "report-birch",
  expectedLockVersion: finalReview.data.lockVersion,
  expectedVersionId: finalReview.data.versionId,
  expectedWordingHash: finalReview.data.wordingHash,
};
const submitted = await port.managementApproveAndSubmit(submitInput);
assert(submitted.outcome === "success", "Management final submission must succeed");
const duplicateSubmission = await port.managementApproveAndSubmit(submitInput);
assert(
  duplicateSubmission.outcome === "stale_state",
  "A duplicate final submission must produce governed stale-state feedback",
);

const finalParentList = await port.listParentSubmittedReports();
assert(finalParentList.outcome === "success", "Final parent list must load");
assert(
  finalParentList.data.filter((item) => item.studentId === "student-birch").length === 1,
  "Final submission must make exactly one Birch report available",
);
const canonical = await port.getCanonicalReport(
  "session-storytelling-lab",
  "student-birch",
);
assert(canonical.outcome === "success", "Canonical Parent detail must load");
assert(
  canonical.data.panels.todaysStrength === editedPanels.todaysStrength,
  "Parent must receive exactly the submitted canonical wording",
);

const managementForbidden = [
  "ratings",
  "observations",
  "attendance",
  "evidence",
  "trainerNotes",
  "checklist",
  "contentHash",
  "revisionNumber",
  "aiHistory",
];
assert(
  managementForbidden.every((key) => !Object.hasOwn(finalReview.data, key)),
  "Management projection must not contain forbidden keys",
);
const canonicalForbidden = [
  "status",
  "ratings",
  "observations",
  "trainerNotes",
  "correction",
  "contentHash",
  "revisionNumber",
  "audit",
];
assert(
  canonicalForbidden.every((key) => !Object.hasOwn(canonical.data, key)),
  "Canonical Parent projection must not contain internal keys",
);

console.log(
  JSON.stringify({
    result: "passed",
    checks: [
      "Trainer approval remains parent-invisible",
      "Management wording-only edit and return",
      "duplicate return and submission reject as stale",
      "explicit reaffirmation creates a fresh checklist-gated version",
      "Trainer reapproval returns the item to Management",
      "final submission exposes exactly the canonical Parent report",
      "Management and Parent DTO exclusions",
    ],
  }),
);
}

void run();
