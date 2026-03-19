export type ReviewConfig = {
  defaultThreshold: number;
  maxIterations: number;
  maxAllowedIterations: number;
};

const DEFAULT_THRESHOLD = 8.5;
const DEFAULT_MAX_ITERATIONS = 3;
const MAX_ALLOWED_ITERATIONS = 10;

function parseInteger(input: string | undefined, fallback: number): number {
  if (!input) {
    return fallback;
  }
  const parsed = Number.parseInt(input, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

export function getReviewConfig(): ReviewConfig {
  const configuredMaxIterations = parseInteger(
    process.env.REVIEW_MAX_ITERATIONS,
    DEFAULT_MAX_ITERATIONS
  );

  return {
    defaultThreshold: DEFAULT_THRESHOLD,
    maxIterations: clamp(configuredMaxIterations, 1, MAX_ALLOWED_ITERATIONS),
    maxAllowedIterations: MAX_ALLOWED_ITERATIONS
  };
}
