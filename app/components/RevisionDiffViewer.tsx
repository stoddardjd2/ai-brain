"use client";

type RevisionDiffViewerProps = {
  diff: string;
};

function getDiffLineClass(line: string): string {
  if (line.startsWith("@@")) {
    return "diff-line diff-line-hunk";
  }
  if (line.startsWith("+") && !line.startsWith("+++")) {
    return "diff-line diff-line-added";
  }
  if (line.startsWith("-") && !line.startsWith("---")) {
    return "diff-line diff-line-removed";
  }
  if (
    line.startsWith("diff ") ||
    line.startsWith("index ") ||
    line.startsWith("---") ||
    line.startsWith("+++")
  ) {
    return "diff-line diff-line-meta";
  }
  if (!line.trim()) {
    return "diff-line diff-line-spacer";
  }
  return "diff-line diff-line-context";
}

export function RevisionDiffViewer({ diff }: RevisionDiffViewerProps) {
  const lines = diff ? diff.split(/\r?\n/) : [];

  return (
    <section className="panel diff-viewer-panel">
      <h2>Revision Diff Viewer</h2>
      {lines.length === 0 ? (
        <p className="diff-empty">No revision diff yet.</p>
      ) : (
        <div className="diff-viewer-body" role="region" aria-label="Revision diff output">
          {lines.map((line, lineIndex) => (
            <div key={`${lineIndex}-${line}`} className={getDiffLineClass(line)}>
              <span className="diff-line-number">{lineIndex + 1}</span>
              <code className="diff-line-content">{line || " "}</code>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
