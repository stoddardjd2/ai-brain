import { NextResponse } from "next/server";
import { readRunAudit } from "@/src/store/auditStore";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get("runId");
  if (!runId) {
    return NextResponse.json({ error: "runId is required." }, { status: 400 });
  }
  const audit = await readRunAudit(runId);
  if (!audit) {
    return NextResponse.json({ error: "Audit not found." }, { status: 404 });
  }
  return NextResponse.json(audit);
}
