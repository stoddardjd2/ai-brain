export const REVIEW_DIMENSIONS = [
  "correctness",
  "completeness",
  "clarity",
  "practicality",
  "scalability",
  "maintainability",
  "risk"
] as const;

export type ReviewDimension = (typeof REVIEW_DIMENSIONS)[number];

export const REVIEWER_ROLES = [
  "Optimist",
  "Skeptic",
  "Engineer",
  "User",
  "DevilsAdvocate"
] as const;

export type ReviewerRole = (typeof REVIEWER_ROLES)[number];

export type ReviewEvent =
  | { type: "run_started"; runId: string; timestamp: string }
  | { type: "prompt_received"; runId: string; rawInput: string; timestamp: string }
  | { type: "optimizing_prompt"; runId: string; timestamp: string }
  | {
      type: "prompt_optimized";
      runId: string;
      optimizedPrompt: string;
      assumptions: string[];
      missingInfo: string[];
      successCriteria: string[];
      timestamp: string;
    }
  | {
      type: "content_classified";
      runId: string;
      contentType: string;
      confidence: number;
      timestamp: string;
    }
  | { type: "rubric_selected"; runId: string; dimensions: ReviewDimension[]; timestamp: string }
  | {
      type: "scoring_dimensions_loaded";
      runId: string;
      dimensions: ReviewDimension[];
      timestamp: string;
    }
  | { type: "iteration_started"; runId: string; iteration: number; timestamp: string }
  | {
      type: "reviewer_started";
      runId: string;
      iteration: number;
      reviewer: ReviewerRole;
      timestamp: string;
    }
  | {
      type: "reviewer_stream";
      runId: string;
      iteration: number;
      reviewer: ReviewerRole;
      message: string;
      timestamp: string;
    }
  | {
      type: "reviewer_completed";
      runId: string;
      iteration: number;
      reviewer: ReviewerRole;
      findingsCount: number;
      timestamp: string;
    }
  | {
      type: "scores_updated";
      runId: string;
      iteration: number;
      score: number;
      scoreDelta: number;
      dimensions: Record<ReviewDimension, number>;
      timestamp: string;
    }
  | {
      type: "aggregation_complete";
      runId: string;
      iteration: number;
      topIssueCount: number;
      conflictCount: number;
      timestamp: string;
    }
  | {
      type: "loop_decision";
      runId: string;
      iteration: number;
      shouldLoop: boolean;
      reason: string;
      failedDimensions: ReviewDimension[];
      highSeverityIssueCount: number;
      timestamp: string;
    }
  | { type: "revision_started"; runId: string; iteration: number; timestamp: string }
  | {
      type: "revision_applied";
      runId: string;
      iteration: number;
      changes: Array<{ issue: string; action: string }>;
      revisionSummary: string;
      timestamp: string;
    }
  | { type: "diff_available"; runId: string; iteration: number; diff: string; timestamp: string }
  | { type: "iteration_completed"; runId: string; iteration: number; score: number; timestamp: string }
  | { type: "loop_continued"; runId: string; iteration: number; reason: string; timestamp: string }
  | { type: "loop_stopped"; runId: string; iteration: number; stopReason: string; timestamp: string }
  | { type: "run_completed"; runId: string; finalScore: number; stopReason: string; timestamp: string }
  | { type: "run_failed"; runId: string; error: string; timestamp: string };
