"use client";

import type { LoopDecisionState } from "@/app/components/types";

type LoopTimelineProps = {
  decisions: LoopDecisionState[];
};

export function LoopTimeline({ decisions }: LoopTimelineProps) {
  return (
    <section className="panel">
      <h2>Loop History Timeline</h2>
      {decisions.length === 0 ? (
        <p>No timeline yet.</p>
      ) : (
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          {decisions.map((decision) => (
            <li key={`${decision.iteration}-${decision.reason}`}>
              Iteration {decision.iteration}: {decision.reason}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
