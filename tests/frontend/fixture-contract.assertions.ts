import {
  DIMENSION_CODES,
  RATING_LEVELS,
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

void requiredWriteActions;
void governedDimensionCount;
void governedRatingCount;
void trainerApprovalCannotPublish;
void exhaustUiOutcomes;
