"use client";

import { useMemo, useRef, useState } from "react";
import { FinalOutputPanel } from "@/app/components/FinalOutputPanel";
import { InputPanel } from "@/app/components/InputPanel";
import { IterationTracker } from "@/app/components/IterationTracker";
import { LoopDecisionPanel } from "@/app/components/LoopDecisionPanel";
import { LoopTimeline } from "@/app/components/LoopTimeline";
import { ReviewerCards } from "@/app/components/ReviewerCards";
import { RevisionDiffViewer } from "@/app/components/RevisionDiffViewer";
import { Scoreboard } from "@/app/components/Scoreboard";
import type { AppViewState, ReviewerPanelState } from "@/app/components/types";
import { REVIEWER_ROLES, type ReviewEvent } from "@/src/contracts/reviewEvent";

function emptyReviewerLogs(): ReviewerPanelState {
  return {
    Optimist: [],
    Skeptic: [],
    Engineer: [],
    User: [],
    DevilsAdvocate: []
  };
}

export default function HomePage() {
  const [input, setInput] = useState("");
  const [threshold, setThreshold] = useState(8.5);
  const [maxIterations, setMaxIterations] = useState(3);
  const [running, setRunning] = useState(false);
  const [state, setState] = useState<AppViewState>({
    runId: null,
    optimizedPrompt: "",
    contentType: "",
    confidence: 0,
    currentIteration: 0,
    reviewerLogs: emptyReviewerLogs(),
    scores: [],
    loopDecisions: [],
    latestDiff: "",
    finalResult: null,
    events: []
  });
  const eventSourceRef = useRef<EventSource | null>(null);
  const summary = useMemo(() => ({ maxIterations }), [maxIterations]);

  const onEvent = (event: ReviewEvent) => {
    setState((current) => {
      const next = { ...current, events: [...current.events, event] };
      if (event.type === "prompt_optimized") {
        next.optimizedPrompt = event.optimizedPrompt;
      } else if (event.type === "content_classified") {
        next.contentType = event.contentType;
        next.confidence = event.confidence;
      } else if (event.type === "iteration_started") {
        next.currentIteration = event.iteration;
      } else if (event.type === "reviewer_stream") {
        next.reviewerLogs = {
          ...next.reviewerLogs,
          [event.reviewer]: [...next.reviewerLogs[event.reviewer], event.message]
        };
      } else if (event.type === "scores_updated") {
        next.scores = [
          ...next.scores,
          {
            iteration: event.iteration,
            score: event.score,
            scoreDelta: event.scoreDelta,
            dimensions: event.dimensions
          }
        ];
      } else if (event.type === "loop_decision") {
        next.loopDecisions = [
          ...next.loopDecisions,
          {
            iteration: event.iteration,
            shouldLoop: event.shouldLoop,
            reason: event.reason,
            failedDimensions: event.failedDimensions,
            highSeverityIssueCount: event.highSeverityIssueCount
          }
        ];
      } else if (event.type === "diff_available") {
        next.latestDiff = event.diff;
      } else if (event.type === "run_completed" || event.type === "run_failed") {
        setRunning(false);
      }
      return next;
    });
  };

  const startRun = async () => {
    setRunning(true);
    setState({
      runId: null,
      optimizedPrompt: "",
      contentType: "",
      confidence: 0,
      currentIteration: 0,
      reviewerLogs: emptyReviewerLogs(),
      scores: [],
      loopDecisions: [],
      latestDiff: "",
      finalResult: null,
      events: []
    });

    const response = await fetch("/api/review/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, threshold, maxIterations })
    });
    const runStart = (await response.json()) as { runId?: string };
    if (!response.ok || !runStart.runId) {
      setRunning(false);
      return;
    }

    const runId = runStart.runId;
    setState((current) => ({ ...current, runId }));
    const source = new EventSource(`/api/review/stream?runId=${encodeURIComponent(runId)}`);
    eventSourceRef.current = source;
    source.onmessage = (messageEvent) => {
      const event = JSON.parse(messageEvent.data) as ReviewEvent;
      onEvent(event);
    };
    source.onerror = async () => {
      source.close();
      eventSourceRef.current = null;
      const resultResponse = await fetch(`/api/review/run?runId=${encodeURIComponent(runId)}`);
      if (!resultResponse.ok) {
        setRunning(false);
        return;
      }
      const result = await resultResponse.json();
      setState((current) => ({ ...current, finalResult: result.result ?? result }));
      setRunning(result.status === "running");
    };
  };

  const stopRun = async () => {
    if (!state.runId) {
      return;
    }
    await fetch("/api/review/stop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ runId: state.runId })
    });
  };

  return (
    <main>
      <h1>AI Review Agent Dashboard</h1>
      <p>
        Content type: {state.contentType || "n/a"} {state.confidence > 0 ? `(${state.confidence.toFixed(2)})` : ""}
      </p>
      <div className="grid">
        <InputPanel
          input={input}
          threshold={threshold}
          maxIterations={maxIterations}
          running={running}
          onInputChange={setInput}
          onThresholdChange={setThreshold}
          onMaxIterationsChange={setMaxIterations}
          onStart={startRun}
          onStop={stopRun}
          optimizedPrompt={state.optimizedPrompt}
        />
        <IterationTracker currentIteration={state.currentIteration} maxIterations={summary.maxIterations} />
        <Scoreboard scores={state.scores} />
        <LoopDecisionPanel decisions={state.loopDecisions} />
        <RevisionDiffViewer diff={state.latestDiff} />
        <LoopTimeline decisions={state.loopDecisions} />
      </div>
      <div style={{ marginTop: 16 }}>
        <ReviewerCards logs={state.reviewerLogs} />
      </div>
      <div style={{ marginTop: 16 }}>
        <FinalOutputPanel result={state.finalResult} />
      </div>
      <details style={{ marginTop: 16 }}>
        <summary>Debug Event Log</summary>
        <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(state.events, null, 2)}</pre>
      </details>
      <footer style={{ marginTop: 20, opacity: 0.8 }}>Reviewers: {REVIEWER_ROLES.join(", ")}</footer>
    </main>
  );
}
