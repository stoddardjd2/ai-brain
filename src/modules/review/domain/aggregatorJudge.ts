import { REVIEW_DIMENSIONS, type ReviewDimension } from "@/src/contracts/reviewEvent";
import { AggregateResultSchema, type AggregateResult, type Finding, type ReviewerOutput } from "@/src/contracts/reviewSchemas";

function weightedSeverity(severity: "low" | "medium" | "high"): number {
  if (severity === "high") {
    return 1.2;
  }
  if (severity === "medium") {
    return 0.7;
  }
  return 0.3;
}

function deduplicateFindings(findings: Finding[]): Finding[] {
  const seen = new Set<string>();
  const unique: Finding[] = [];
  for (const finding of findings) {
    const key = finding.issue.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(finding);
  }
  return unique;
}

function scoreDimension(dimension: ReviewDimension, findings: Finding[]): number {
  const relevant = findings.filter((finding) =>
    `${finding.issue} ${finding.impact}`.toLowerCase().includes(dimension)
  );
  const penalty = relevant.reduce((sum, finding) => sum + weightedSeverity(finding.severity), 0);
  return Number(Math.max(0, Math.min(10, 9.2 - penalty)).toFixed(1));
}

export function aggregateAndJudge(
  reviewerOutputs: ReviewerOutput[],
  previousScore: number,
  threshold: number
): AggregateResult {
  const allFindings = reviewerOutputs.flatMap((output) => output.findings);
  const topIssues = deduplicateFindings(allFindings)
    .sort((left, right) => weightedSeverity(right.severity) - weightedSeverity(left.severity))
    .slice(0, 10);

  const dimensionScores = Object.fromEntries(
    REVIEW_DIMENSIONS.map((dimension) => [dimension, scoreDimension(dimension, topIssues)])
  ) as Record<ReviewDimension, number>;

  const overallScore = Number(
    (Object.values(dimensionScores).reduce((sum, score) => sum + score, 0) / REVIEW_DIMENSIONS.length).toFixed(1)
  );

  const highSeverityIssueCount = topIssues.filter((issue) => issue.severity === "high").length;
  const failedDimensions = REVIEW_DIMENSIONS.filter((dimension) => dimensionScores[dimension] < threshold);
  const shouldLoop = overallScore < threshold || highSeverityIssueCount > 0 || failedDimensions.length > 0;
  const scoreDelta = Number((overallScore - previousScore).toFixed(1));

  const reasons: string[] = [];
  if (overallScore < threshold) {
    reasons.push(`overall score ${overallScore} below threshold ${threshold}`);
  }
  if (highSeverityIssueCount > 0) {
    reasons.push(`${highSeverityIssueCount} high-severity issues remain`);
  }
  if (failedDimensions.length > 0) {
    reasons.push(`failed dimensions: ${failedDimensions.join(", ")}`);
  }

  const conflicts = topIssues
    .filter((issue) => issue.issue.toLowerCase().includes("preserve"))
    .map((issue) => `Potential trade-off between preservation and change: ${issue.issue}`);

  return AggregateResultSchema.parse({
    overall_score: overallScore,
    status: shouldLoop ? "needs_revision" : "ready",
    dimension_scores: dimensionScores,
    top_issues: topIssues,
    conflicts,
    priority_actions: topIssues.slice(0, 3).map((issue) => issue.suggested_fix),
    score_delta: scoreDelta,
    loop_decision: {
      should_loop: shouldLoop,
      reason: reasons.join("; ") || "quality threshold reached",
      failed_dimensions: failedDimensions,
      high_severity_issue_count: highSeverityIssueCount
    }
  });
}
