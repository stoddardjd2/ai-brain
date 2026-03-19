import type { ReviewRunResult } from "@/src/contracts/reviewSchemas";

type RunStatus = "running" | "completed" | "failed";

type RunRecord = {
  status: RunStatus;
  result?: ReviewRunResult;
  error?: string;
};

const runRecords = new Map<string, RunRecord>();

export function setRunRunning(runId: string): void {
  runRecords.set(runId, { status: "running" });
}

export function setRunCompleted(runId: string, result: ReviewRunResult): void {
  runRecords.set(runId, { status: "completed", result });
}

export function setRunFailed(runId: string, error: string): void {
  runRecords.set(runId, { status: "failed", error });
}

export function getRunRecord(runId: string): RunRecord | null {
  return runRecords.get(runId) ?? null;
}
