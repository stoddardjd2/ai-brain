"use client";

import type { LoopDecisionState } from "@/app/components/types";

type LoopDecisionPanelProps = {
  decisions: LoopDecisionState[];
};

export function LoopDecisionPanel({ decisions }: LoopDecisionPanelProps) {
  const latest = decisions.at(-1);
  return (
    <section className="panel">
      <h2>Loop Decision Panel</h2>
      {!latest ? (
        <p>No loop decisions yet.</p>
      ) : (
        <>
          <p>
            Should loop: <strong>{String(latest.shouldLoop)}</strong>
          </p>
          <p>Reason: {latest.reason}</p>
          <p>High severity issues: {latest.highSeverityIssueCount}</p>
          <p>
            Failed dimensions:{" "}
            {latest.failedDimensions.length > 0 ? latest.failedDimensions.join(", ") : "none"}
          </p>
        </>
      )}
    </section>
  );
}
