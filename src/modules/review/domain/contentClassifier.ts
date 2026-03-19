export type ContentClassifierResult = {
  contentType: string;
  confidence: number;
};

const CLASSIFIERS: Array<{ contentType: string; keywords: string[] }> = [
  { contentType: "code", keywords: ["class ", "function ", "typescript", "python", "```"] },
  { contentType: "product spec", keywords: ["requirements", "acceptance criteria", "scope"] },
  { contentType: "architecture", keywords: ["architecture", "service", "api", "database"] },
  { contentType: "startup idea", keywords: ["startup", "market", "mvp", "gtm"] },
  { contentType: "marketing copy", keywords: ["campaign", "copy", "brand"] },
  { contentType: "resume", keywords: ["resume", "experience", "skills"] }
];

export function classifyContent(input: string): ContentClassifierResult {
  const text = input.toLowerCase();
  let winner = { contentType: "general text", score: 0 };

  for (const classifier of CLASSIFIERS) {
    const score = classifier.keywords.filter((keyword) => text.includes(keyword)).length;
    if (score > winner.score) {
      winner = { contentType: classifier.contentType, score };
    }
  }

  return {
    contentType: winner.contentType,
    confidence: Math.min(0.55 + winner.score * 0.1, 0.99)
  };
}
