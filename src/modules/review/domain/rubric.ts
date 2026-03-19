import { REVIEW_DIMENSIONS, type ReviewDimension } from "@/src/contracts/reviewEvent";

export function selectRubric(): ReviewDimension[] {
  return [...REVIEW_DIMENSIONS];
}
