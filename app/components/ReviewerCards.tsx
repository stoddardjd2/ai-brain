"use client";

import type { ReviewerPanelState } from "@/app/components/types";

type ReviewerCardsProps = {
  logs: ReviewerPanelState;
};

export function ReviewerCards({ logs }: ReviewerCardsProps) {
  return (
    <section className="panel">
      <h2>Reviewer Cards</h2>
      <div className="grid">
        {Object.entries(logs).map(([reviewer, messages]) => (
          <article key={reviewer} className="panel">
            <h3>{reviewer}</h3>
            <div style={{ maxHeight: 220, overflow: "auto", fontSize: 13 }}>
              {messages.length === 0 ? <p>No updates yet.</p> : messages.map((msg, idx) => <p key={idx}>- {msg}</p>)}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
