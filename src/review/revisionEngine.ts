export { applyRevision } from "@/src/modules/review/domain/revisionEngine";
import type { AggregateResult, RevisionResult } from "@/src/contracts/reviewSchemas";

export function applyHighImpactRevision(currentOutput: string, aggregate: AggregateResult): RevisionResult {
  const changes = aggregate.top_issues
    .filter((finding) => finding.severity !== "low")
    .slice(0, 3)
    .map((finding) => ({
      issue: finding.issue,
      action: finding.suggested_fix
    }));

  return {
    changes_applied: changes,
    revision_summary: changes.length
      ? "Applied high-impact revision placeholders from top issues."
      : "No high-impact issues detected in scaffold mode.",
    revised_output: currentOutput,
    diff: "Scaffold mode: diff generation pending engine integration."
  };
}
