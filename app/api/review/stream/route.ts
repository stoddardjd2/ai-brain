import { runEventBus } from "@/src/stream/runEventBus";

function toSseMessage(data: unknown): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get("runId");
  if (!runId) {
    return new Response("Missing runId", { status: 400 });
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder();
      for (const event of runEventBus.getBufferedEvents(runId)) {
        controller.enqueue(encoder.encode(toSseMessage(event)));
      }

      const unsubscribe = runEventBus.subscribe(runId, (event) => {
        controller.enqueue(encoder.encode(toSseMessage(event)));
      });

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`event: ping\ndata: {"ts":"${new Date().toISOString()}"}\n\n`));
      }, 15000);

      const onAbort = () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      };

      request.signal.addEventListener("abort", onAbort);
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
