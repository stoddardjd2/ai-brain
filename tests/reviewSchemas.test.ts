import { describe, expect, it } from "vitest";
import { ReviewRunRequestSchema } from "@/src/contracts/reviewSchemas";

describe("ReviewRunRequestSchema", () => {
  it("accepts valid request", () => {
    const parsed = ReviewRunRequestSchema.parse({
      input: "Build me a production-ready architecture review.",
      threshold: 8.5,
      maxIterations: 3
    });
    expect(parsed.maxIterations).toBe(3);
  });

  it("rejects empty input", () => {
    expect(() => ReviewRunRequestSchema.parse({ input: "" })).toThrow();
  });
});
