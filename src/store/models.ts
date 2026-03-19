import type { ReviewDimension, ReviewEvent } from "@/src/contracts/reviewEvent";
import type {
  AggregateResult,
  PromptOptimization,
  ReviewerOutput,
  ReviewRunResult
} from "@/src/contracts/reviewSchemas";

export type IterationAudit = {
  iteration: number;
  reviewerOutputs: ReviewerOutput[];
  aggregate: AggregateResult;
  revisionSummary?: string;
  revisionChanges?: Array<{ issue: string; action: string }>;
  revisedOutput?: string;
  diff?: string;
};

export type ReviewRunAudit = {
  runId: string;
  status: "running" | "completed" | "failed";
  startedAt: string;
  finishedAt?: string;
  stopReason?: string;
  input: string;
  contentType?: string;
  optimizedPrompt?: PromptOptimization;
  dimensions: ReviewDimension[];
  events: ReviewEvent[];
  iterations: IterationAudit[];
  result?: ReviewRunResult;
  error?: string;
};
