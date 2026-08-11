import {
  DIMENSION_CODES,
  RATING_LEVELS,
  type CanonicalReportDto,
  type ManagementQueueRowDto,
  type ManagementReviewDto,
  type TrainerApproveSuccess,
} from "../../lib/frontend/contracts/physical-test";
import type { UiActionResult } from "../../lib/frontend/contracts/result";
import type { PhysicalTestPort } from "../../lib/frontend/physical-test-port";

const requiredWriteActions = [
  "saveObservation",
  "requestDraft",
  "saveTrainerEdit",
  "updateTrainerChecklist",
  "trainerApprove",
  "managementEditWording",
  "managementReturnToTrainer",
  "managementApproveAndSubmit",
] as const satisfies readonly (keyof PhysicalTestPort)[];

const requiredF2Reads = [
  "listManagementPendingReviews",
  "listManagementCorrectionTracking",
  "getManagementReview",
  "getParentAvailability",
  "listParentSubmittedReports",
  "getCanonicalReport",
] as const satisfies readonly (keyof PhysicalTestPort)[];

const governedDimensionCount: 9 = DIMENSION_CODES.length;
const governedRatingCount: 4 = RATING_LEVELS.length;

function trainerApprovalCannotPublish(result: TrainerApproveSuccess) {
  const published: false = result.published;
  const reviewRequired: true = result.managementReviewRequired;
  const status: "trainer_approved" = result.status;
  return { published, reviewRequired, status } as const;
}

function exhaustUiOutcomes<T>(result: UiActionResult<T>): string {
  switch (result.outcome) {
    case "success":
    case "validation":
    case "unauthenticated":
    case "unauthorized":
    case "unavailable":
    case "stale_state":
    case "generation_failure":
    case "retryable_failure":
    case "unexpected_failure":
      return result.outcome;
  }
}

/*
 * §5.5's management exclusion list, SPLIT IN TWO ON 2026-08-11 by operator
 * rulings D-1 and C-9 -- and split rather than loosened, deliberately.
 *
 * D-1 permits Management to VIEW the nine per-dimension ratings, READ ONLY.
 * C-9 confines that permission to REPORT DETAIL SURFACES: "ratings on a list
 * or a statistics surface is a different disclosure shape -- it invites
 * comparison between children".
 *
 * ▶ So `ratings` moves off the forbidden list for `ManagementReviewDto` ONLY,
 *   and STAYS FORBIDDEN on `ManagementQueueRowDto`. Deleting `ratings` from a
 *   single combined list would have silently permitted it on the QUEUE too --
 *   the exact surface C-9 excludes -- and nothing would have caught that.
 *
 * ⛔ EVERY OTHER KEY REMAINS FORBIDDEN ON BOTH.
 */
type ForbiddenManagementQueueKeys = Extract<
  keyof ManagementQueueRowDto,
  | "ratings"
  | "observations"
  | "attendance"
  | "evidence"
  | "trainerNotes"
  | "checklist"
  | "contentHash"
  | "revisionNumber"
  | "aiHistory"
>;

type ForbiddenManagementReviewKeys = Extract<
  keyof ManagementReviewDto,
  | "observations"
  | "attendance"
  | "evidence"
  | "trainerNotes"
  | "checklist"
  | "contentHash"
  | "revisionNumber"
  | "aiHistory"
>;

/*
 * ⚠️ AND A POSITIVE ASSERTION, because an absence check cannot tell you the
 * permitted field is actually there. If `ratings` is ever dropped from the
 * review DTO, D-1 stops being implemented and every check above still passes.
 */
type ReviewCarriesRatings = "ratings" extends keyof ManagementReviewDto ? true : false;

type ForbiddenCanonicalKeys = Extract<
  keyof CanonicalReportDto,
  | "status"
  | "ratings"
  | "observations"
  | "trainerNotes"
  | "correction"
  | "contentHash"
  | "revisionNumber"
  | "audit"
>;

const managementQueueHasNoForbiddenKeys: ForbiddenManagementQueueKeys extends never
  ? true
  : false = true;
const managementReviewHasNoForbiddenKeys: ForbiddenManagementReviewKeys extends never
  ? true
  : false = true;
const managementReviewCarriesRatings: ReviewCarriesRatings = true;
const canonicalProjectionHasNoForbiddenKeys: ForbiddenCanonicalKeys extends never
  ? true
  : false = true;

void requiredWriteActions;
void requiredF2Reads;
void governedDimensionCount;
void governedRatingCount;
void trainerApprovalCannotPublish;
void exhaustUiOutcomes;
void managementQueueHasNoForbiddenKeys;
void managementReviewHasNoForbiddenKeys;
void managementReviewCarriesRatings;
void canonicalProjectionHasNoForbiddenKeys;
