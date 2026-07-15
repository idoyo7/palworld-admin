"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Point { t: number; v: number }
interface MetricsResp {
  enabled: boolean;
  range?: string;
  cpu?: Point[];
  mem?: Point[];
  limits?: { cpuCores: number | null; memBytes: number | null } | null;
  requests?: { cpuCores: number | null; memBytes: number | null } | null;
}

const RANGES = [
  { key: "1h", label: "1시간" },
  { key: "6h", label: "6시간" },
  { key: "24h", label: "24시간" },
];
const GiB = 1024 ** 3;

export default function MetricsSection() {
  const [range, setRange] = useState("6h");
  const [data, setData] = useState<MetricsResp | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (r: string) => {
    try {
      const res = await fetch(`/api/metrics?range=${r}`, { cache: "no-store" });
      setData(await res.json());
    } catch {
      setData({ enabled: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(range);
    const t = setInterval(() => load(range), 30000);
    return () => clearInterval(t);
  }, [range, load]);

  // 첫 로드 전엔 자리만, 비활성이면 섹션 자체를 숨김
  if (loading && !data) return null;
  if (!data?.enabled) return null;

  const cpuData = data.cpu || [];
  const memData = (data.mem || []).map((p) => ({ t: p.t, v: p.v / GiB }));

  return (
    <div className="mt-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">📈 리소스 사용량</h2>
        <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`rounded-md px-2.5 py-1 text-xs transition ${
                range === r.key ? "bg-emerald-500 text-black" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <MetricChart
          title="CPU"
          unit="cores"
          color="#10b981"
          data={cpuData}
          limit={data.limits?.cpuCores ?? null}
          request={data.requests?.cpuCores ?? null}
          fmt={(v) => v.toFixed(2)}
        />
        <MetricChart
          title="메모리"
          unit="GiB"
          color="#38bdf8"
          data={memData}
          limit={data.limits?.memBytes != null ? data.limits.memBytes / GiB : null}
          request={data.requests?.memBytes != null ? data.requests.memBytes / GiB : null}
          fmt={(v) => v.toFixed(2)}
        />
      </div>
      <p className="mt-2 text-[11px] text-neutral-500">
        빨강 = limit, 주황 점선 = request. 실사용이 request보다 크게 높으면 request 를 올려 스케줄링 정확도를 개선할 수 있어요.
      </p>
    </div>
  );
}

function MetricChart({
  title, unit, color, data, limit, request, fmt,
}: {
  title: string; unit: string; color: string;
  data: { t: number; v: number }[];
  limit: number | null; request: number | null;
  fmt: (v: number) => string;
}) {
  const stats = useMemo(() => {
    if (data.length === 0) return null;
    const vals = data.map((d) => d.v);
    return { cur: vals[vals.length - 1], peak: Math.max(...vals), avg: vals.reduce((a, b) => a + b, 0) / vals.length };
  }, [data]);

  const fmtTime = (t: number) => {
    const d = new Date(t);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  const gradId = `grad-${title}`;
  const yMax = Math.max(limit ?? 0, ...(data.map((d) => d.v).concat(0))) * 1.1 || 1;

  return (
    <div className="card p-4">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-neutral-200">{title}</h3>
        {stats && (
          <div className="text-xs text-neutral-400">
            현재 <span className="font-semibold text-neutral-100">{fmt(stats.cur)}</span>
            <span className="mx-1 text-neutral-600">·</span>최고 {fmt(stats.peak)}
            <span className="mx-1 text-neutral-600">·</span>평균 {fmt(stats.avg)} {unit}
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={190}>
        <AreaChart data={data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="t" tickFormatter={fmtTime} stroke="#71717a" fontSize={10} minTickGap={40} />
          <YAxis stroke="#71717a" fontSize={10} width={44} domain={[0, yMax]} tickFormatter={(v) => fmt(v)} />
          <Tooltip
            contentStyle={{ background: "#0a0a0b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 12 }}
            labelFormatter={(t) => fmtTime(t as number)}
            formatter={(v: number) => [`${fmt(v)} ${unit}`, title]}
          />
          {request != null && (
            <ReferenceLine y={request} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.7}
              label={{ value: `req ${fmt(request)}`, position: "insideTopRight", fill: "#f59e0b", fontSize: 10 }} />
          )}
          {limit != null && (
            <ReferenceLine y={limit} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.8}
              label={{ value: `limit ${fmt(limit)}`, position: "insideBottomRight", fill: "#ef4444", fontSize: 10 }} />
          )}
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#${gradId})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
