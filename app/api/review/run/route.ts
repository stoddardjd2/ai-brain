import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { executeReviewRun } from "@/src/review/orchestrator";
import { getReviewConfig } from "@/src/config/reviewConfig";
import { ReviewRunRequestSchema } from "@/src/contracts/reviewSchemas";
import {
  getRunRecord,
  setRunCompleted,
  setRunFailed,
  setRunRunning
} from "@/src/modules/review/infrastructure/runRegistry";

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const parsed = ReviewRunRequestSchema.parse(body);
    const config = getReviewConfig();
    const runId = randomUUID();
    setRunRunning(runId);

    void executeReviewRun(runId, {
      ...parsed,
      maxIterations: parsed.maxIterations ?? config.maxIterations
    })
      .then((result) => setRunCompleted(runId, result))
      .catch((error) =>
        setRunFailed(runId, error instanceof Error ? error.message : "Unknown execution error")
      );

    return NextResponse.json({
      runId,
      status: "started",
      maxIterations: parsed.maxIterations ?? config.maxIterations
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid request." },
      { status: 400 }
    );
  }
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get("runId");
  if (!runId) {
    return NextResponse.json({ error: "runId is required." }, { status: 400 });
  }
  const record = getRunRecord(runId);
  if (!record) {
    return NextResponse.json({ error: "Run not found." }, { status: 404 });
  }
  return NextResponse.json(record);
}
