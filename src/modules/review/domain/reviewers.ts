import type { ReviewerRole } from "@/src/contracts/reviewEvent";
import { ReviewerOutputSchema, type Finding, type ReviewerOutput } from "@/src/contracts/reviewSchemas";

type StreamCallback = (reviewer: ReviewerRole, message: string) => void;
type OpenAIChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

function firstSentence(source: string): string {
  return source.split(/[.!?]/).map((segment) => segment.trim()).find(Boolean) ?? source;
}

function buildFinding(
  issue: string,
  impact: string,
  severity: "low" | "medium" | "high",
  evidence: string,
  suggestedFix: string
): Finding {
  return {
    issue,
    impact,
    severity,
    evidence,
    suggested_fix: suggestedFix
  };
}

function findingsForRole(role: ReviewerRole, input: string): Finding[] {
  const evidence = firstSentence(input);
  const findings: Finding[] = [];

  if (!input.toLowerCase().includes("risk")) {
    findings.push(
      buildFinding(
        "Risk handling is incomplete.",
        "Critical edge cases may fail without mitigation strategy.",
        role === "Skeptic" || role === "DevilsAdvocate" ? "high" : "medium",
        evidence,
        "Add explicit risk section with mitigation, fallback, and rollback steps."
      )
    );
  }

  if (!input.toLowerCase().includes("test")) {
    findings.push(
      buildFinding(
        "Testability requirements are missing.",
        "Quality cannot be verified consistently across iterations.",
        "medium",
        evidence,
        "Define unit, integration, and acceptance checks tied to success criteria."
      )
    );
  }

  if (input.length < 140) {
    findings.push(
      buildFinding(
        "Input detail is limited.",
        "Completeness and practicality scores will remain low.",
        "high",
        evidence,
        "Add constraints, audience, and measurable outcomes."
      )
    );
  }

  if (role === "Optimist") {
    findings.push(
      buildFinding(
        "Strength preservation should be explicit.",
        "Revisions can accidentally remove useful structure.",
        "low",
        evidence,
        "List strengths and preserve them during revisions."
      )
    );
  }

  return findings;
}

function roleInstruction(role: ReviewerRole): string {
  if (role === "Optimist") {
    return "Highlight strengths, low-cost improvements, and what should be preserved.";
  }
  if (role === "Skeptic") {
    return "Challenge assumptions and identify weak claims, risks, and missing evidence.";
  }
  if (role === "Engineer") {
    return "Focus on implementation feasibility, correctness, edge cases, and maintainability.";
  }
  if (role === "User") {
    return "Focus on user clarity, trust, practical usability, and outcome quality.";
  }
  return "Act as a devil's advocate and stress-test with worst-case and contrarian scenarios.";
}

async function runSingleReviewerWithLlm(
  reviewer: ReviewerRole,
  input: string,
  stream: StreamCallback
): Promise<ReviewerOutput | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const model = process.env.REVIEWER_MODEL ?? "gpt-4.1-mini";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  const schemaHint = `{
  "findings": [
    {
      "issue": "string",
      "impact": "string",
      "severity": "low | medium | high",
      "evidence": "direct quote from input",
      "suggested_fix": "actionable fix"
    }
  ]
}`;

  const systemPrompt =
    "You are a rigorous reviewer. Return ONLY JSON that matches the schema exactly. " +
    "Findings must be specific, include direct evidence from the input, and include actionable fixes.";

  const userPrompt = [
    `Reviewer role: ${reviewer}`,
    `Role guidance: ${roleInstruction(reviewer)}`,
    "",
    "Task:",
    "- Critique the provided input.",
    "- Return 2-5 high-signal findings.",
    "- Do not return markdown.",
    "",
    "Required JSON schema:",
    schemaHint,
    "",
    "Input to review:",
    input
  ].join("\n");

  stream(reviewer, `Calling LLM (${model})...`);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorBody = await response.text();
      stream(reviewer, `LLM request failed (${response.status}). Using fallback.`);
      stream(reviewer, errorBody.slice(0, 200));
      return null;
    }

    const payload = (await response.json()) as OpenAIChatResponse;
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      stream(reviewer, "LLM returned empty response. Using fallback.");
      return null;
    }

    const parsed = JSON.parse(content) as { findings?: Finding[] };
    const findings = Array.isArray(parsed.findings) ? parsed.findings : [];
    const output = ReviewerOutputSchema.parse({ reviewer, findings });
    stream(reviewer, `LLM review complete (${output.findings.length} findings).`);
    return output;
  } catch (error) {
    stream(reviewer, "LLM unavailable. Using deterministic fallback.");
    const message = error instanceof Error ? error.message : "Unknown LLM error";
    stream(reviewer, message.slice(0, 200));
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function runSingleReviewer(
  reviewer: ReviewerRole,
  input: string,
  stream: StreamCallback
): Promise<ReviewerOutput> {
  stream(reviewer, "Starting analysis...");
  const llmOutput = await runSingleReviewerWithLlm(reviewer, input, stream);
  if (llmOutput) {
    for (const finding of llmOutput.findings) {
      stream(reviewer, `${finding.severity.toUpperCase()}: ${finding.issue}`);
    }
    stream(reviewer, "Review complete.");
    return llmOutput;
  }

  const fallbackFindings = findingsForRole(reviewer, input);
  for (const finding of fallbackFindings) {
    stream(reviewer, `${finding.severity.toUpperCase()}: ${finding.issue}`);
  }
  stream(reviewer, "Review complete.");
  return ReviewerOutputSchema.parse({ reviewer, findings: fallbackFindings });
}

export async function runReviewers(
  reviewers: ReviewerRole[],
  input: string,
  stream: StreamCallback
): Promise<ReviewerOutput[]> {
  return Promise.all(reviewers.map((reviewer) => runSingleReviewer(reviewer, input, stream)));
}
