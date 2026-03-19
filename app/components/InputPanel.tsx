"use client";

type InputPanelProps = {
  input: string;
  threshold: number;
  maxIterations: number;
  running: boolean;
  onInputChange: (value: string) => void;
  onThresholdChange: (value: number) => void;
  onMaxIterationsChange: (value: number) => void;
  onStart: () => void;
  onStop: () => void;
  optimizedPrompt: string;
};

export function InputPanel(props: InputPanelProps) {
  return (
    <section className="panel">
      <h2>Input + Optimized Prompt</h2>
      <textarea
        rows={8}
        value={props.input}
        onChange={(event) => props.onInputChange(event.target.value)}
        placeholder="Paste raw input here..."
      />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 }}>
        <label>
          Threshold
          <input
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={props.threshold}
            onChange={(event) => props.onThresholdChange(Number(event.target.value))}
          />
        </label>
        <label>
          Max Iterations
          <input
            type="number"
            min={1}
            max={10}
            step={1}
            value={props.maxIterations}
            onChange={(event) => props.onMaxIterationsChange(Number(event.target.value))}
          />
        </label>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={props.onStart} disabled={props.running}>
          Start Review
        </button>
        <button onClick={props.onStop} disabled={!props.running} style={{ background: "#b55454" }}>
          Stop
        </button>
      </div>
      <h3 style={{ marginTop: 16 }}>Optimized Prompt</h3>
      <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{props.optimizedPrompt || "Waiting for run..."}</pre>
    </section>
  );
}
