import type { ReviewDimension } from "@/src/contracts/reviewEvent";

export type LoopMetadata = {
  iteration: number;
  maxIterations: number;
  previousScore: number;
  currentScore: number;
  improvementDelta: number;
  loopedAgain: boolean;
  loopReason: string;
  stopReason: string | null;
  failedDimensions: ReviewDimension[];
  highSeverityIssueCount: number;
};

type LoopInput = {
  iteration: number;
  maxIterations: number;
  previousScore: number;
  currentScore: number;
  threshold: number;
  failedDimensions: ReviewDimension[];
  highSeverityIssueCount: number;
  judgeShouldLoop: boolean;
  manualStopRequested: boolean;
};

export function evaluateLoop(input: LoopInput): LoopMetadata {
  const improvementDelta = Number((input.currentScore - input.previousScore).toFixed(1));

  if (input.manualStopRequested) {
    return {
      iteration: input.iteration,
      maxIterations: input.maxIterations,
      previousScore: input.previousScore,
      currentScore: input.currentScore,
      improvementDelta,
      loopedAgain: false,
      loopReason: "Manual stop requested.",
      stopReason: "manual_stop",
      failedDimensions: input.failedDimensions,
      highSeverityIssueCount: input.highSeverityIssueCount
    };
  }

  if (input.iteration >= input.maxIterations) {
    return {
      iteration: input.iteration,
      maxIterations: input.maxIterations,
      previousScore: input.previousScore,
      currentScore: input.currentScore,
      improvementDelta,
      loopedAgain: false,
      loopReason: "Maximum iteration limit reached.",
      stopReason: "max_iterations_reached",
      failedDimensions: input.failedDimensions,
      highSeverityIssueCount: input.highSeverityIssueCount
    };
  }

  if (input.currentScore >= input.threshold && input.highSeverityIssueCount === 0) {
    return {
      iteration: input.iteration,
      maxIterations: input.maxIterations,
      previousScore: input.previousScore,
      currentScore: input.currentScore,
      improvementDelta,
      loopedAgain: false,
      loopReason: "Threshold reached and no high-severity issues remain.",
      stopReason: "threshold_reached",
      failedDimensions: input.failedDimensions,
      highSeverityIssueCount: input.highSeverityIssueCount
    };
  }

  if (Math.abs(improvementDelta) < 0.3 && input.iteration > 1) {
    return {
      iteration: input.iteration,
      maxIterations: input.maxIterations,
      previousScore: input.previousScore,
      currentScore: input.currentScore,
      improvementDelta,
      loopedAgain: false,
      loopReason: "Improvement delta below 0.3 after prior iterations.",
      stopReason: "improvement_delta_too_small",
      failedDimensions: input.failedDimensions,
      highSeverityIssueCount: input.highSeverityIssueCount
    };
  }

  return {
    iteration: input.iteration,
    maxIterations: input.maxIterations,
    previousScore: input.previousScore,
    currentScore: input.currentScore,
    improvementDelta,
    loopedAgain: input.judgeShouldLoop,
    loopReason: input.judgeShouldLoop
      ? "High-impact issues remain and quality gate still failing."
      : "Judge marked as complete.",
    stopReason: input.judgeShouldLoop ? null : "judge_completed",
    failedDimensions: input.failedDimensions,
    highSeverityIssueCount: input.highSeverityIssueCount
  };
}
