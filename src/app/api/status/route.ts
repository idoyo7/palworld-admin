import { NextResponse } from "next/server";
import { getServerStatus } from "@/lib/k8s";
import { getPalworldStats } from "@/lib/palworld-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [status, stats] = await Promise.all([
      getServerStatus(),
      // REST 도달 불가 시에도 기존 상태 응답은 그대로 나가야 함
      getPalworldStats().catch(() => null),
    ]);
    return NextResponse.json({
      ...status,
      players: stats ? { current: stats.currentplayernum, max: stats.maxplayernum } : null,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
