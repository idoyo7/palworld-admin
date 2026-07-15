import { NextRequest, NextResponse } from "next/server";
import { getJobLogs } from "@/lib/k8s";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const job = req.nextUrl.searchParams.get("job");
  if (!job) {
    return NextResponse.json({ error: "job 파라미터가 필요합니다." }, { status: 400 });
  }
  try {
    const logs = await getJobLogs(job);
    return NextResponse.json({ logs });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
