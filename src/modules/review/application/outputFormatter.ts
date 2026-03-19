import type { ReviewRunResult } from "@/src/contracts/reviewSchemas";

function listOrFallback(items: string[]): string {
  return items.length > 0 ? items.map((item) => `- ${item}`).join("\n") : "- None";
}

export function formatFinalMarkdown(result: ReviewRunResult): string {
  const scoreLines = Object.entries(result.dimension_scores)
    .map(([dimension, score]) => `- ${dimension}: ${score.toFixed(1)}`)
    .join("\n");

  return [
    "## Final Verdict",
    `- Status: ${result.status}`,
    `- Overall Score: ${result.overall_score.toFixed(1)}`,
    "",
    "## Dimension Scores",
    scoreLines,
    "",
    "## Top Issues",
    listOrFallback(result.weaknesses),
    "",
    "## Strengths",
    listOrFallback(result.strengths),
    "",
    "## Weaknesses",
    listOrFallback(result.weaknesses),
    "",
    "## Risks",
    listOrFallback(result.risks),
    "",
    "## Devil's Advocate",
    listOrFallback(result.devils_advocate),
    "",
    "## Recommended Actions",
    listOrFallback(result.recommended_actions),
    "",
    "## Final Improved Version",
    result.final_output,
    "",
    "## Loop History Summary",
    ...result.loop_history.map(
      (item) =>
        `- Iteration ${item.iteration}: score ${item.score.toFixed(1)}, looped=${item.looped_again}, reason=${item.reason}`
    )
  ].join("\n");
}
