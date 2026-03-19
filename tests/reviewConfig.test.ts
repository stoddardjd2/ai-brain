import { afterEach, describe, expect, it } from "vitest";
import { getReviewConfig } from "../src/config/reviewConfig";

describe("getReviewConfig", () => {
  const originalEnvValue = process.env.REVIEW_MAX_ITERATIONS;

  afterEach(() => {
    process.env.REVIEW_MAX_ITERATIONS = originalEnvValue;
  });

  it("clamps REVIEW_MAX_ITERATIONS to safe limits", () => {
    process.env.REVIEW_MAX_ITERATIONS = "42";
    const config = getReviewConfig();

    expect(config.maxIterations).toBe(config.maxAllowedIterations);
  });

  it("falls back when REVIEW_MAX_ITERATIONS is not a number", () => {
    process.env.REVIEW_MAX_ITERATIONS = "oops";
    const config = getReviewConfig();

    expect(config.maxIterations).toBe(3);
  });
});
