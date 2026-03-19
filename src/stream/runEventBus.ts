import type { ReviewEvent } from "@/src/contracts/reviewEvent";

type Subscriber = (event: ReviewEvent) => void;

class RunEventBus {
  private subscribers = new Map<string, Set<Subscriber>>();
  private events = new Map<string, ReviewEvent[]>();
  private readonly maxBuffer = 1000;

  publish(runId: string, event: ReviewEvent): void {
    const buffer = this.events.get(runId) ?? [];
    buffer.push(event);
    if (buffer.length > this.maxBuffer) {
      buffer.shift();
    }
    this.events.set(runId, buffer);

    const subscriberSet = this.subscribers.get(runId);
    if (!subscriberSet) {
      return;
    }
    for (const subscriber of subscriberSet) {
      subscriber(event);
    }
  }

  subscribe(runId: string, subscriber: Subscriber): () => void {
    const subscriberSet = this.subscribers.get(runId) ?? new Set<Subscriber>();
    subscriberSet.add(subscriber);
    this.subscribers.set(runId, subscriberSet);

    return () => {
      const current = this.subscribers.get(runId);
      if (!current) {
        return;
      }
      current.delete(subscriber);
      if (current.size === 0) {
        this.subscribers.delete(runId);
      }
    };
  }

  getBufferedEvents(runId: string): ReviewEvent[] {
    return this.events.get(runId) ?? [];
  }
}

export const runEventBus = new RunEventBus();
