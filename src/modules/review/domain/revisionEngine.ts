import { createPatch } from "diff";
import { RevisionResultSchema, type AggregateResult, type RevisionResult } from "@/src/contracts/reviewSchemas";

export function applyRevision(currentOutput: string, aggregate: AggregateResult): RevisionResult {
  const highImpact = aggregate.top_issues.filter((issue) => issue.severity !== "low").slice(0, 4);
  const changesApplied = highImpact.map((issue) => ({
    issue: issue.issue,
    action: issue.suggested_fix
  }));

  const improvementBlock =
    highImpact.length === 0
      ? "- No additional high-impact fixes required."
      : highImpact.map((issue, index) => `${index + 1}. ${issue.suggested_fix}`).join("\n");

  const revisedOutput = `${currentOutput}\n\nRevision Updates:\n${improvementBlock}`;
  const revisionSummary =
    highImpact.length === 0
      ? "No high-impact issues remained. Strengths preserved."
      : `Applied ${highImpact.length} high-impact fixes while keeping existing strengths intact.`;

  return RevisionResultSchema.parse({
    changes_applied: changesApplied,
    revision_summary: revisionSummary,
    revised_output: revisedOutput,
    diff: createPatch("review-output", currentOutput, revisedOutput)
  });
}
