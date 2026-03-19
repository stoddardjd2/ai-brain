export { formatFinalMarkdown } from "@/src/modules/review/application/outputFormatter";
import type { AggregateResult, LoopHistoryItem, ReviewRunResult } from "@/src/contracts/reviewSchemas";

export type FormatOutputInput = {
  contentType: string;
  aggregate: AggregateResult;
  loopHistory: LoopHistoryItem[];
  maxIterations: number;
  finalOutput: string;
  stopReason: string;
};

export function formatFinalOutput(input: FormatOutputInput): ReviewRunResult {
  const strengths = input.aggregate.priority_actions.slice(0, 2).map((action) => `Addressed: ${action}`);
  const weaknesses = input.aggregate.top_issues.map((issue) => issue.issue);
  const recommendedActions = input.aggregate.priority_actions;

  return {
    status: input.aggregate.status,
    content_type: input.contentType,
    overall_score: input.aggregate.overall_score,
    dimension_scores: input.aggregate.dimension_scores,
    strengths,
    weaknesses,
    risks: input.aggregate.conflicts,
    devils_advocate: input.aggregate.conflicts,
    recommended_actions: recommendedActions,
    iterations: input.loopHistory.length,
    max_iterations: input.maxIterations,
    improvement_delta: input.aggregate.score_delta,
    loop_history: input.loopHistory,
    stop_reason: input.stopReason,
    final_output: input.finalOutput,
    final_markdown: `# Final Output\n\n${input.finalOutput}`
  };
}
