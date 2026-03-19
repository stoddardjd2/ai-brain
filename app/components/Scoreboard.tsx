"use client";

import type { IterationScore } from "@/app/components/types";

type ScoreboardProps = {
  scores: IterationScore[];
};

export function Scoreboard({ scores }: ScoreboardProps) {
  const latest = scores.at(-1);
  return (
    <section className="panel">
      <h2>Scoreboard</h2>
      {!latest ? (
        <p>No score yet.</p>
      ) : (
        <>
          <p>
            Overall: <strong>{latest.score.toFixed(1)}</strong> (delta {latest.scoreDelta.toFixed(1)})
          </p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {Object.entries(latest.dimensions).map(([name, value]) => (
              <li key={name}>
                {name}: {value.toFixed(1)}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
