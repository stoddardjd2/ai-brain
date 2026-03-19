"use client";

type IterationTrackerProps = {
  currentIteration: number;
  maxIterations: number;
};

export function IterationTracker({ currentIteration, maxIterations }: IterationTrackerProps) {
  return (
    <section className="panel">
      <h2>Iteration Tracker</h2>
      <p>
        Iteration <strong>{currentIteration}</strong> / {maxIterations}
      </p>
    </section>
  );
}
