import { describe, expect, it } from "vitest";
import { evaluateLoop } from "@/src/modules/review/domain/loopController";

describe("evaluateLoop", () => {
  it("stops when threshold reached and no high severity issues remain", () => {
    const result = evaluateLoop({
      iteration: 2,
      maxIterations: 4,
      previousScore: 7.8,
      currentScore: 8.8,
      threshold: 8.5,
      failedDimensions: [],
      highSeverityIssueCount: 0,
      judgeShouldLoop: false,
      manualStopRequested: false
    });

    expect(result.loopedAgain).toBe(false);
    expect(result.stopReason).toBe("threshold_reached");
  });

  it("continues when high severity issues remain", () => {
    const result = evaluateLoop({
      iteration: 1,
      maxIterations: 3,
      previousScore: 0,
      currentScore: 7.9,
      threshold: 8.5,
      failedDimensions: ["risk"],
      highSeverityIssueCount: 2,
      judgeShouldLoop: true,
      manualStopRequested: false
    });

    expect(result.loopedAgain).toBe(true);
    expect(result.stopReason).toBeNull();
  });
});
