import { z } from "zod";
import { REVIEW_DIMENSIONS, REVIEWER_ROLES } from "@/src/contracts/reviewEvent";

export const ReviewDimensionSchema = z.enum(REVIEW_DIMENSIONS);
export const ReviewerRoleSchema = z.enum(REVIEWER_ROLES);
export const SeveritySchema = z.enum(["low", "medium", "high"]);

export const FindingSchema = z.object({
  issue: z.string().min(1),
  impact: z.string().min(1),
  severity: SeveritySchema,
  evidence: z.string().min(1),
  suggested_fix: z.string().min(1)
});

export const ReviewerOutputSchema = z.object({
  reviewer: ReviewerRoleSchema,
  findings: z.array(FindingSchema)
});

export const PromptOptimizationSchema = z.object({
  optimized_prompt: z.string().min(1),
  content_type: z.string().min(1),
  assumptions: z.array(z.string()),
  missing_info: z.array(z.string()),
  success_criteria: z.array(z.string())
});

export const LoopDecisionSchema = z.object({
  should_loop: z.boolean(),
  reason: z.string().min(1),
  failed_dimensions: z.array(ReviewDimensionSchema),
  high_severity_issue_count: z.number().int().min(0)
});

export const AggregateResultSchema = z.object({
  overall_score: z.number().min(0).max(10),
  status: z.enum(["needs_revision", "ready"]),
  dimension_scores: z.record(ReviewDimensionSchema, z.number().min(0).max(10)),
  top_issues: z.array(FindingSchema),
  conflicts: z.array(z.string()),
  priority_actions: z.array(z.string()),
  score_delta: z.number(),
  loop_decision: LoopDecisionSchema
});

export const RevisionChangeSchema = z.object({
  issue: z.string().min(1),
  action: z.string().min(1)
});

export const RevisionResultSchema = z.object({
  changes_applied: z.array(RevisionChangeSchema),
  revision_summary: z.string().min(1),
  revised_output: z.string().min(1),
  diff: z.string().min(1)
});

export const LoopHistoryItemSchema = z.object({
  iteration: z.number().int().min(1),
  score: z.number().min(0).max(10),
  looped_again: z.boolean(),
  reason: z.string().min(1)
});

export const ReviewRunRequestSchema = z.object({
  input: z.string().min(1),
  threshold: z.number().min(0).max(10).optional(),
  maxIterations: z.number().int().min(1).max(10).optional()
});

export const ReviewRunResultSchema = z.object({
  status: z.enum(["ready", "needs_revision"]),
  content_type: z.string().min(1),
  overall_score: z.number().min(0).max(10),
  dimension_scores: z.record(ReviewDimensionSchema, z.number().min(0).max(10)),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  risks: z.array(z.string()),
  devils_advocate: z.array(z.string()),
  recommended_actions: z.array(z.string()),
  iterations: z.number().int().min(1),
  max_iterations: z.number().int().min(1),
  improvement_delta: z.number(),
  loop_history: z.array(LoopHistoryItemSchema),
  stop_reason: z.string().min(1),
  final_output: z.string().min(1),
  final_markdown: z.string().min(1)
});

export type Finding = z.infer<typeof FindingSchema>;
export type ReviewerOutput = z.infer<typeof ReviewerOutputSchema>;
export type PromptOptimization = z.infer<typeof PromptOptimizationSchema>;
export type AggregateResult = z.infer<typeof AggregateResultSchema>;
export type RevisionResult = z.infer<typeof RevisionResultSchema>;
export type LoopHistoryItem = z.infer<typeof LoopHistoryItemSchema>;
export type ReviewRunResult = z.infer<typeof ReviewRunResultSchema>;
export type ReviewRunRequest = z.infer<typeof ReviewRunRequestSchema>;
