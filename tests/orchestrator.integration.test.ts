import { describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { executeReviewRun } from "@/src/modules/review/application/orchestrator";
import { readRunAudit } from "@/src/store/auditStore";

describe("executeReviewRun", () => {
  it("produces final result and persists audit log", async () => {
    const runId = randomUUID();
    const result = await executeReviewRun(runId, {
      input: "Create a robust product plan with risk and testing strategy included.",
      threshold: 7.5,
      maxIterations: 2
    });

    expect(result.overall_score).toBeGreaterThan(0);
    expect(result.loop_history.length).toBeGreaterThan(0);

    const audit = await readRunAudit(runId);
    expect(audit?.status).toBe("completed");
    expect(audit?.result?.overall_score).toBe(result.overall_score);
  });
});
