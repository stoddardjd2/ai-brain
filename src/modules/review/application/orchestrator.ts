import { getReviewConfig } from "@/src/config/reviewConfig";
import { REVIEWER_ROLES, type ReviewEvent } from "@/src/contracts/reviewEvent";
import {
  ReviewRunRequestSchema,
  ReviewRunResultSchema,
  type LoopHistoryItem,
  type ReviewRunRequest,
  type ReviewRunResult
} from "@/src/contracts/reviewSchemas";
import { aggregateAndJudge } from "@/src/modules/review/domain/aggregatorJudge";
import { classifyContent } from "@/src/modules/review/domain/contentClassifier";
import { evaluateLoop } from "@/src/modules/review/domain/loopController";
import { optimizePrompt } from "@/src/modules/review/domain/promptOptimizer";
import { runReviewers } from "@/src/modules/review/domain/reviewers";
import { applyRevision } from "@/src/modules/review/domain/revisionEngine";
import { selectRubric } from "@/src/modules/review/domain/rubric";
import { formatFinalMarkdown } from "@/src/modules/review/application/outputFormatter";
import { consumeManualStop } from "@/src/modules/review/infrastructure/runControl";
import { runEventBus } from "@/src/stream/runEventBus";
import {
  appendRunEvent,
  completeRunAudit,
  createRunAudit,
  failRunAudit,
  setRunPromptData,
  upsertIterationAudit
} from "@/src/store/auditStore";

function nowIso(): string {
  return new Date().toISOString();
}

function createEvent<T extends ReviewEvent>(event: T): T {
  return event;
}

async function publish(runId: string, event: ReviewEvent): Promise<void> {
  runEventBus.publish(runId, event);
  await appendRunEvent(runId, event);
}

export async function executeReviewRun(runId: string, payload: unknown): Promise<ReviewRunResult> {
  const request: ReviewRunRequest = ReviewRunRequestSchema.parse(payload);
  const config = getReviewConfig();
  const threshold = request.threshold ?? config.defaultThreshold;
  const maxIterations = Math.min(request.maxIterations ?? config.maxIterations, config.maxAllowedIterations);
  const dimensions = selectRubric();

  await createRunAudit({
    runId,
    status: "running",
    startedAt: nowIso(),
    input: request.input,
    dimensions,
    events: [],
    iterations: []
  });

  await publish(runId, createEvent({ type: "run_started", runId, timestamp: nowIso() }));
  await publish(
    runId,
    createEvent({ type: "prompt_received", runId, rawInput: request.input, timestamp: nowIso() })
  );
  await publish(runId, createEvent({ type: "optimizing_prompt", runId, timestamp: nowIso() }));

  try {
    const optimized = optimizePrompt(request.input);
    await setRunPromptData(runId, optimized.content_type, optimized);
    await publish(
      runId,
      createEvent({
        type: "prompt_optimized",
        runId,
        optimizedPrompt: optimized.optimized_prompt,
        assumptions: optimized.assumptions,
        missingInfo: optimized.missing_info,
        successCriteria: optimized.success_criteria,
        timestamp: nowIso()
      })
    );

    const classified = classifyContent(optimized.optimized_prompt);
    await publish(
      runId,
      createEvent({
        type: "content_classified",
        runId,
        contentType: classified.contentType,
        confidence: classified.confidence,
        timestamp: nowIso()
      })
    );

    await publish(
      runId,
      createEvent({ type: "rubric_selected", runId, dimensions, timestamp: nowIso() })
    );
    await publish(
      runId,
      createEvent({ type: "scoring_dimensions_loaded", runId, dimensions, timestamp: nowIso() })
    );

    let currentOutput = optimized.optimized_prompt;
    let previousScore = 0;
    const loopHistory: LoopHistoryItem[] = [];
    let finalResult: ReviewRunResult | null = null;

    for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
      await publish(runId, createEvent({ type: "iteration_started", runId, iteration, timestamp: nowIso() }));

      for (const reviewer of REVIEWER_ROLES) {
        await publish(
          runId,
          createEvent({ type: "reviewer_started", runId, iteration, reviewer, timestamp: nowIso() })
        );
      }

      const reviewerOutputs = await runReviewers([...REVIEWER_ROLES], currentOutput, (reviewer, message) => {
        runEventBus.publish(
          runId,
          createEvent({ type: "reviewer_stream", runId, iteration, reviewer, message, timestamp: nowIso() })
        );
      });

      for (const output of reviewerOutputs) {
        await publish(
          runId,
          createEvent({
            type: "reviewer_completed",
            runId,
            iteration,
            reviewer: output.reviewer,
            findingsCount: output.findings.length,
            timestamp: nowIso()
          })
        );
      }

      const aggregate = aggregateAndJudge(reviewerOutputs, previousScore, threshold);
      await publish(
        runId,
        createEvent({
          type: "scores_updated",
          runId,
          iteration,
          score: aggregate.overall_score,
          scoreDelta: aggregate.score_delta,
          dimensions: aggregate.dimension_scores,
          timestamp: nowIso()
        })
      );
      await publish(
        runId,
        createEvent({
          type: "aggregation_complete",
          runId,
          iteration,
          topIssueCount: aggregate.top_issues.length,
          conflictCount: aggregate.conflicts.length,
          timestamp: nowIso()
        })
      );

      const loop = evaluateLoop({
        iteration,
        maxIterations,
        previousScore,
        currentScore: aggregate.overall_score,
        threshold,
        failedDimensions: aggregate.loop_decision.failed_dimensions,
        highSeverityIssueCount: aggregate.loop_decision.high_severity_issue_count,
        judgeShouldLoop: aggregate.loop_decision.should_loop,
        manualStopRequested: consumeManualStop(runId)
      });

      await publish(
        runId,
        createEvent({
          type: "loop_decision",
          runId,
          iteration,
          shouldLoop: loop.loopedAgain,
          reason: loop.loopReason,
          failedDimensions: loop.failedDimensions,
          highSeverityIssueCount: loop.highSeverityIssueCount,
          timestamp: nowIso()
        })
      );

      loopHistory.push({
        iteration,
        score: aggregate.overall_score,
        looped_again: loop.loopedAgain,
        reason: loop.loopReason
      });

      if (!loop.loopedAgain) {
        finalResult = ReviewRunResultSchema.parse({
          status: aggregate.status,
          content_type: classified.contentType,
          overall_score: aggregate.overall_score,
          dimension_scores: aggregate.dimension_scores,
          strengths: aggregate.top_issues
            .filter((issue) => issue.severity === "low")
            .map((issue) => issue.issue),
          weaknesses: aggregate.top_issues
            .filter((issue) => issue.severity !== "low")
            .map((issue) => issue.issue),
          risks: aggregate.top_issues
            .filter((issue) => issue.issue.toLowerCase().includes("risk"))
            .map((issue) => issue.impact),
          devils_advocate: reviewerOutputs
            .find((output) => output.reviewer === "DevilsAdvocate")
            ?.findings.map((finding) => finding.issue) ?? [],
          recommended_actions: aggregate.priority_actions,
          iterations: iteration,
          max_iterations: maxIterations,
          improvement_delta: aggregate.score_delta,
          loop_history: loopHistory,
          stop_reason: loop.stopReason ?? "judge_completed",
          final_output: currentOutput,
          final_markdown: "pending_markdown"
        });
        finalResult.final_markdown = formatFinalMarkdown(finalResult);
        await upsertIterationAudit(runId, { iteration, reviewerOutputs, aggregate });
        await publish(
          runId,
          createEvent({
            type: "loop_stopped",
            runId,
            iteration,
            stopReason: finalResult.stop_reason,
            timestamp: nowIso()
          })
        );
        await publish(
          runId,
          createEvent({
            type: "iteration_completed",
            runId,
            iteration,
            score: aggregate.overall_score,
            timestamp: nowIso()
          })
        );
        break;
      }

      await publish(runId, createEvent({ type: "revision_started", runId, iteration, timestamp: nowIso() }));
      const revision = applyRevision(currentOutput, aggregate);
      currentOutput = revision.revised_output;
      await publish(
        runId,
        createEvent({
          type: "revision_applied",
          runId,
          iteration,
          changes: revision.changes_applied,
          revisionSummary: revision.revision_summary,
          timestamp: nowIso()
        })
      );
      await publish(
        runId,
        createEvent({ type: "diff_available", runId, iteration, diff: revision.diff, timestamp: nowIso() })
      );
      await publish(
        runId,
        createEvent({ type: "loop_continued", runId, iteration, reason: loop.loopReason, timestamp: nowIso() })
      );
      await publish(
        runId,
        createEvent({
          type: "iteration_completed",
          runId,
          iteration,
          score: aggregate.overall_score,
          timestamp: nowIso()
        })
      );
      await upsertIterationAudit(runId, {
        iteration,
        reviewerOutputs,
        aggregate,
        revisionSummary: revision.revision_summary,
        revisionChanges: revision.changes_applied,
        revisedOutput: revision.revised_output,
        diff: revision.diff
      });
      previousScore = aggregate.overall_score;
    }

    if (!finalResult) {
      throw new Error("Run ended without producing a final result.");
    }

    await completeRunAudit(runId, finalResult, finalResult.stop_reason);
    await publish(
      runId,
      createEvent({
        type: "run_completed",
        runId,
        finalScore: finalResult.overall_score,
        stopReason: finalResult.stop_reason,
        timestamp: nowIso()
      })
    );
    return finalResult;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown review run failure";
    await failRunAudit(runId, message);
    await publish(runId, createEvent({ type: "run_failed", runId, error: message, timestamp: nowIso() }));
    throw error;
  }
}
