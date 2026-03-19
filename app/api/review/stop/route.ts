import { NextResponse } from "next/server";
import { requestManualStop } from "@/src/modules/review/infrastructure/runControl";

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as { runId?: string };
    if (!body.runId) {
      return NextResponse.json({ error: "runId is required." }, { status: 400 });
    }
    requestManualStop(body.runId);
    return NextResponse.json({ status: "stop_requested", runId: body.runId });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
