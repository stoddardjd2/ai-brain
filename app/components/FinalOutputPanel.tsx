"use client";

type FinalOutputPanelProps = {
  result: unknown;
};

export function FinalOutputPanel({ result }: FinalOutputPanelProps) {
  return (
    <section className="panel">
      <h2>Final Output</h2>
      <pre style={{ maxHeight: 360, overflow: "auto", whiteSpace: "pre-wrap", margin: 0 }}>
        {result ? JSON.stringify(result, null, 2) : "Run has not completed."}
      </pre>
    </section>
  );
}
