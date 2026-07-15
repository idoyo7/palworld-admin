import { NextResponse } from "next/server";
import { listUpdateJobs, triggerUpdate } from "@/lib/k8s";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ jobs: await listUpdateJobs() });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const { jobName } = await triggerUpdate();
    return NextResponse.json({ ok: true, jobName });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 409 });
  }
}
