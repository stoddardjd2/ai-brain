"use client";

type RevisionDiffViewerProps = {
  diff: string;
};

export function RevisionDiffViewer({ diff }: RevisionDiffViewerProps) {
  return (
    <section className="panel">
      <h2>Revision Diff Viewer</h2>
      <pre style={{ maxHeight: 260, overflow: "auto", whiteSpace: "pre-wrap", margin: 0 }}>
        {diff || "No revision diff yet."}
      </pre>
    </section>
  );
}
