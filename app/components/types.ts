import type { ReviewDimension, ReviewEvent, ReviewerRole } from "@/src/contracts/reviewEvent";

export type ReviewerPanelState = Record<ReviewerRole, string[]>;

export type IterationScore = {
  iteration: number;
  score: number;
  scoreDelta: number;
  dimensions: Record<ReviewDimension, number>;
};

export type LoopDecisionState = {
  iteration: number;
  shouldLoop: boolean;
  reason: string;
  failedDimensions: ReviewDimension[];
  highSeverityIssueCount: number;
};

export type AppViewState = {
  runId: string | null;
  optimizedPrompt: string;
  contentType: string;
  confidence: number;
  currentIteration: number;
  reviewerLogs: ReviewerPanelState;
  scores: IterationScore[];
  loopDecisions: LoopDecisionState[];
  latestDiff: string;
  finalResult: unknown;
  events: ReviewEvent[];
};
