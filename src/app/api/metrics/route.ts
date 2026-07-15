import { NextRequest, NextResponse } from "next/server";
import { getMetricSeries, metricsConfigured } from "@/lib/metrics";
import { getResourceSpec } from "@/lib/k8s";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RANGES: Record<string, { sec: number; step: number }> = {
  "1h": { sec: 3600, step: 60 },
  "6h": { sec: 21600, step: 300 },
  "24h": { sec: 86400, step: 900 },
};

export async function GET(req: NextRequest) {
  if (!metricsConfigured) {
    return NextResponse.json({ enabled: false });
  }
  const key = req.nextUrl.searchParams.get("range") || "1h";
  const range = RANGES[key] || RANGES["1h"];
  try {
    const [series, spec] = await Promise.all([
      getMetricSeries(range.sec, range.step),
      getResourceSpec().catch(() => null),
    ]);
    if (series.cpu.length === 0 && series.mem.length === 0) {
      return NextResponse.json({ enabled: false });
    }
    return NextResponse.json({
      enabled: true,
      range: key,
      cpu: series.cpu,
      mem: series.mem,
      limits: spec?.limits ?? null,
      requests: spec?.requests ?? null,
    });
  } catch (e) {
    // 도달 불가/쿼리 실패 → 그래프 섹션 숨김
    return NextResponse.json({ enabled: false, error: (e as Error).message });
  }
}
