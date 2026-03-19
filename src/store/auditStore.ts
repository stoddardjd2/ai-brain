import { promises as fs } from "node:fs";
import path from "node:path";
import type { ReviewEvent } from "@/src/contracts/reviewEvent";
import { ReviewRunResultSchema } from "@/src/contracts/reviewSchemas";
import type { IterationAudit, ReviewRunAudit } from "@/src/store/models";

const RUN_DIR = path.join(process.cwd(), ".data", "runs");

async function ensureRunDirectory(): Promise<void> {
  await fs.mkdir(RUN_DIR, { recursive: true });
}

function runFilePath(runId: string): string {
  return path.join(RUN_DIR, `${runId}.json`);
}

export async function createRunAudit(runAudit: ReviewRunAudit): Promise<void> {
  await ensureRunDirectory();
  await fs.writeFile(runFilePath(runAudit.runId), JSON.stringify(runAudit, null, 2), "utf8");
}

export async function readRunAudit(runId: string): Promise<ReviewRunAudit | null> {
  try {
    const raw = await fs.readFile(runFilePath(runId), "utf8");
    return JSON.parse(raw) as ReviewRunAudit;
  } catch {
    return null;
  }
}

export async function appendRunEvent(runId: string, event: ReviewEvent): Promise<void> {
  const run = await readRunAudit(runId);
  if (!run) {
    return;
  }
  run.events.push(event);
  await fs.writeFile(runFilePath(runId), JSON.stringify(run, null, 2), "utf8");
}

export async function setRunPromptData(
  runId: string,
  contentType: string,
  optimizedPrompt: ReviewRunAudit["optimizedPrompt"]
): Promise<void> {
  const run = await readRunAudit(runId);
  if (!run || !optimizedPrompt) {
    return;
  }
  run.contentType = contentType;
  run.optimizedPrompt = optimizedPrompt;
  await fs.writeFile(runFilePath(runId), JSON.stringify(run, null, 2), "utf8");
}

export async function upsertIterationAudit(runId: string, iterationAudit: IterationAudit): Promise<void> {
  const run = await readRunAudit(runId);
  if (!run) {
    return;
  }
  const index = run.iterations.findIndex((item) => item.iteration === iterationAudit.iteration);
  if (index === -1) {
    run.iterations.push(iterationAudit);
  } else {
    run.iterations[index] = iterationAudit;
  }
  await fs.writeFile(runFilePath(runId), JSON.stringify(run, null, 2), "utf8");
}

export async function completeRunAudit(
  runId: string,
  result: unknown,
  stopReason: string
): Promise<void> {
  const run = await readRunAudit(runId);
  if (!run) {
    return;
  }
  run.status = "completed";
  run.finishedAt = new Date().toISOString();
  run.stopReason = stopReason;
  run.result = ReviewRunResultSchema.parse(result);
  await fs.writeFile(runFilePath(runId), JSON.stringify(run, null, 2), "utf8");
}

export async function failRunAudit(runId: string, errorMessage: string): Promise<void> {
  const run = await readRunAudit(runId);
  if (!run) {
    return;
  }
  run.status = "failed";
  run.finishedAt = new Date().toISOString();
  run.error = errorMessage;
  await fs.writeFile(runFilePath(runId), JSON.stringify(run, null, 2), "utf8");
}
