export { evaluateLoop } from "@/src/modules/review/domain/loopController";
import type { ReviewDimension } from "@/src/contracts/reviewEvent";

const manualStopRuns = new Set<string>();

export type LoopDecisionInput = {
  runId: string;
  iteration: number;
  maxIterations: number;
  overallScore: number;
  threshold: number;
  scoreDelta: number;
  failedDimensions: ReviewDimension[];
  highSeverityIssueCount: number;
};

export type LoopDecisionResult = {
  shouldLoop: boolean;
  reason: string;
};

export function requestManualStop(runId: string): void {
  manualStopRuns.add(runId);
}

export function clearManualStop(runId: string): void {
  manualStopRuns.delete(runId);
}

export function decideLoop(input: LoopDecisionInput): LoopDecisionResult {
  if (manualStopRuns.has(input.runId)) {
    return { shouldLoop: false, reason: "manual_stop_requested" };
  }

  if (input.iteration >= input.maxIterations) {
    return { shouldLoop: false, reason: "max_iterations_reached" };
  }

  if (input.highSeverityIssueCount === 0 && input.failedDimensions.length === 0) {
    return { shouldLoop: false, reason: "no_high_severity_or_failed_dimensions" };
  }

  if (input.overallScore >= input.threshold) {
    return { shouldLoop: false, reason: "threshold_met" };
  }

  if (Math.abs(input.scoreDelta) < 0.01) {
    return { shouldLoop: false, reason: "low_delta" };
  }

  return { shouldLoop: true, reason: "continue_revision_loop" };
}
