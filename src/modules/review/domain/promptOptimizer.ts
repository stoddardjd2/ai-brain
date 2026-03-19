import { PromptOptimizationSchema, type PromptOptimization } from "@/src/contracts/reviewSchemas";

function detectContentType(input: string): string {
  const text = input.toLowerCase();
  if (text.includes("class ") || text.includes("function ") || text.includes("```")) {
    return "code";
  }
  if (text.includes("architecture") || text.includes("service")) {
    return "architecture";
  }
  if (text.includes("requirements") || text.includes("acceptance criteria")) {
    return "product spec";
  }
  if (text.includes("startup") || text.includes("market")) {
    return "startup idea";
  }
  if (text.includes("copy") || text.includes("campaign")) {
    return "marketing copy";
  }
  if (text.includes("resume") || text.includes("experience")) {
    return "resume";
  }
  return "general text";
}

export function optimizePrompt(rawInput: string): PromptOptimization {
  const contentType = detectContentType(rawInput);
  const assumptions = [
    "The user expects actionable, production-ready results.",
    "The response should prioritize transparency over hidden reasoning."
  ];
  const missingInfo: string[] = [];
  if (!rawInput.toLowerCase().includes("audience")) {
    missingInfo.push("Audience is not explicitly defined.");
  }
  if (!/\d/.test(rawInput)) {
    missingInfo.push("No measurable numeric target provided.");
  }

  const successCriteria = [
    "Output is specific and actionable.",
    "Risks and constraints are explicitly handled.",
    "The final result is measurable and testable."
  ];

  const optimizedPrompt = [
    "Objective:",
    "Deliver a high-quality, production-ready output from the provided input.",
    "",
    "Requirements:",
    "- Preserve the user intent.",
    "- Improve clarity, completeness, and practical value.",
    "- Keep changes evidence-based and high-impact.",
    "",
    "Constraints:",
    "- Do not invent requirements not present in source input.",
    "- Keep revision focused; avoid unnecessary rewrites.",
    "",
    "Success Criteria:",
    ...successCriteria.map((criterion) => `- ${criterion}`),
    "",
    "Input:",
    rawInput
  ].join("\n");

  return PromptOptimizationSchema.parse({
    optimized_prompt: optimizedPrompt,
    content_type: contentType,
    assumptions,
    missing_info: missingInfo,
    success_criteria: successCriteria
  });
}
