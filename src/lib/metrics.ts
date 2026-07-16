// Prometheus 호환(query_range) 백엔드에서 palworld 서버 CPU/메모리 시계열 조회.
// 주소는 env METRICS_PROMETHEUS_URL 로 주입(비어있으면 기능 비활성 → 그래프 섹션 숨김).
// 예: http://vmselect.victoria-metrics.svc.cluster.local:8481/select/0/prometheus  (VictoriaMetrics cluster)
//     http://prometheus.monitoring.svc.cluster.local:9090                          (Prometheus)

export const METRICS_URL = (process.env.METRICS_PROMETHEUS_URL || "").replace(/\/$/, "");
export const metricsConfigured = METRICS_URL.length > 0;

const NS = process.env.PALWORLD_NAMESPACE || "palworld";
const DEPLOY = process.env.PALWORLD_DEPLOY || "palworld-server";
const SEL = `namespace="${NS}",pod=~"${DEPLOY}.*",container="server"`;

export interface Point {
  t: number; // epoch ms
  v: number;
}
export interface MetricSeries {
  cpu: Point[]; // cores
  mem: Point[]; // bytes
  players: Point[]; // 접속자 수
  playersMax: number | null; // 최대 접속 인원(마지막 값)
}

async function rangeQuery(query: string, start: number, end: number, step: number): Promise<Point[]> {
  const u = new URL(`${METRICS_URL}/api/v1/query_range`);
  u.searchParams.set("query", query);
  u.searchParams.set("start", String(start));
  u.searchParams.set("end", String(end));
  u.searchParams.set("step", String(step));
  const r = await fetch(u, { cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`metrics query failed (${r.status})`);
  const j = await r.json();
  const values: [number, string][] = j?.data?.result?.[0]?.values || [];
  return values.map(([t, v]) => ({ t: t * 1000, v: Number(v) })).filter((p) => Number.isFinite(p.v));
}

export async function getMetricSeries(rangeSec: number, stepSec: number): Promise<MetricSeries> {
  if (!metricsConfigured) throw new Error("metrics not configured");
  const end = Math.floor(Date.now() / 1000);
  const start = end - rangeSec;
  const cpuQ = `sum(rate(container_cpu_usage_seconds_total{${SEL}}[5m]))`;
  const memQ = `sum(container_memory_working_set_bytes{${SEL}})`;
  const playersQ = `max(palworld_player_count{server="${NS}"})`;
  const playersMaxQ = `max(palworld_player_max{server="${NS}"})`;
  const [cpu, mem, players, playersMaxSeries] = await Promise.all([
    rangeQuery(cpuQ, start, end, stepSec),
    rangeQuery(memQ, start, end, stepSec),
    // palworld_* 메트릭은 아직 스크레이프 전이거나 REST 비활성일 수 있어 조회 실패해도 cpu/mem 은 살림
    rangeQuery(playersQ, start, end, stepSec).catch(() => []),
    rangeQuery(playersMaxQ, start, end, stepSec).catch(() => []),
  ]);
  const playersMax = playersMaxSeries.length > 0 ? playersMaxSeries[playersMaxSeries.length - 1].v : null;
  return { cpu, mem, players, playersMax };
}

// 백엔드 도달 가능 + 데이터 존재 여부 (그래프 섹션 노출 판단)
export async function metricsHealthy(): Promise<boolean> {
  if (!metricsConfigured) return false;
  try {
    const u = new URL(`${METRICS_URL}/api/v1/query`);
    u.searchParams.set("query", `sum(container_memory_working_set_bytes{${SEL}})`);
    const r = await fetch(u, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!r.ok) return false;
    const j = await r.json();
    return (j?.data?.result?.length ?? 0) > 0;
  } catch {
    return false;
  }
}
