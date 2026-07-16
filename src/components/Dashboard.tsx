"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ServerStatus, UpdateJob } from "@/lib/k8s";
import type { SettingType } from "@/lib/settings-reference";
import { fmtValue, multiplierLabel } from "@/lib/format";
import MetricsSection from "@/components/MetricsSection";

interface SettingItem {
  envKey: string;
  iniKey: string;
  koName: string;
  explanation: string;
  type: SettingType;
  defaultValue: string;
  minValue: string;
  maxValue: string;
  currentValue: string;
  nonDefault: boolean;
  note?: string;
}
interface SettingsResponse {
  groups: { category: string; items: SettingItem[] }[];
  others: { envKey: string; currentValue: string }[];
}

const POLL_MS = 5000;

// /api/status 응답에 접속자 현황이 추가될 예정 (백엔드 배포 전엔 undefined)
type StatusWithPlayers = ServerStatus & { players?: { current: number; max: number } | null };

async function jget<T>(url: string): Promise<T> {
  const r = await fetch(url, { cache: "no-store" });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || `요청 실패 (${r.status})`);
  return j as T;
}

export default function Dashboard() {
  const [status, setStatus] = useState<StatusWithPlayers | null>(null);
  const [statusErr, setStatusErr] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [jobs, setJobs] = useState<UpdateJob[]>([]);

  const refresh = useCallback(async () => {
    try {
      const s = await jget<StatusWithPlayers>("/api/status");
      setStatus(s);
      setStatusErr(null);
    } catch (e) {
      setStatusErr((e as Error).message);
    }
    try {
      const j = await jget<{ jobs: UpdateJob[] }>("/api/jobs");
      setJobs(j.jobs);
    } catch {
      /* jobs 실패는 조용히 */
    }
  }, []);

  useEffect(() => {
    refresh();
    jget<SettingsResponse>("/api/settings").then(setSettings).catch(() => {});
    const t = setInterval(refresh, POLL_MS);
    return () => clearInterval(t);
  }, [refresh]);

  const running = (status?.replicas.ready ?? 0) > 0;
  const jobRunning = jobs.some((j) => j.status === "running");

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <Header status={status} running={running} />

      {statusErr && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          서버 상태를 불러오지 못했습니다: {statusErr}
        </div>
      )}

      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="상태" value={running ? "가동 중" : "중지"} accent={running ? "green" : "red"} />
        <StatCard label="게임 버전" value={status?.gameVersion || status?.imageTag || "—"} />
        {status?.players ? (
          <StatCard
            label="접속자"
            value={String(status.players.current)}
            suffix={` / ${status.players.max} 명`}
            accent={status.players.current > 0 ? "green" : "neutral"}
          />
        ) : (
          <StatCard label="최대 인원" value={settingCurrent(settings, "PLAYERS") || "—"} suffix="명" />
        )}
        <StatCard label="부팅시 업데이트" value={status?.updateOnBoot === "true" ? "ON" : "OFF"} accent={status?.updateOnBoot === "true" ? "amber" : "neutral"} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ServerPanel status={status} />
        <UpdatePanel jobs={jobs} jobRunning={jobRunning} onChanged={refresh} />
      </div>

      <MetricsSection />

      <SettingsPanel settings={settings} />

      <footer className="mt-10 border-t border-white/10 pt-5 text-center text-xs text-neutral-500">
        palworld-admin · {status?.serverName || "EVE&JUNI"} · 설정 값은 읽기 전용(변경은 GitOps)입니다.
      </footer>
    </div>
  );
}

function settingCurrent(s: SettingsResponse | null, envKey: string): string | null {
  if (!s) return null;
  for (const g of s.groups) {
    const it = g.items.find((i) => i.envKey === envKey);
    if (it) return fmtValue(it.currentValue, it.type);
  }
  return null;
}

// ── 헤더 ──────────────────────────────────────────────
function Header({ status, running }: { status: ServerStatus | null; running: boolean }) {
  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎮</span>
          <h1 className="bg-gradient-to-r from-emerald-300 to-sky-300 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
            {status?.serverName || "Palworld"} 관리
          </h1>
        </div>
        <p className="mt-1 text-sm text-neutral-400">팰월드 서버 상태·설정 · 업데이트 실행</p>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm">
        <span className={`relative flex h-2.5 w-2.5 ${running ? "" : "opacity-60"}`}>
          {running && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
          <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${running ? "bg-emerald-400" : "bg-red-400"}`} />
        </span>
        <span className="font-medium">{running ? "온라인" : "오프라인"}</span>
      </div>
    </header>
  );
}

// ── 상단 통계 카드 ────────────────────────────────────
function StatCard({ label, value, suffix, accent = "neutral" }: { label: string; value: string; suffix?: string; accent?: "green" | "red" | "amber" | "neutral" }) {
  const color = {
    green: "text-emerald-300",
    red: "text-red-300",
    amber: "text-amber-300",
    neutral: "text-neutral-100",
  }[accent];
  return (
    <div className="card px-4 py-3">
      <div className="text-xs text-neutral-400">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${color}`}>
        {value}
        {suffix && <span className="ml-0.5 text-sm text-neutral-400">{suffix}</span>}
      </div>
    </div>
  );
}

// ── 서버 상세 패널 ────────────────────────────────────
function ServerPanel({ status }: { status: ServerStatus | null }) {
  return (
    <div className="card p-5">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">🖥️ 서버 상태</h2>
      {!status ? (
        <Skeleton rows={4} />
      ) : (
        <dl className="space-y-2.5 text-sm">
          <Row k="이미지">
            <code className="rounded bg-white/5 px-1.5 py-0.5 text-xs text-neutral-300">{status.image}</code>
          </Row>
          <Row k="레플리카">
            {status.replicas.ready}/{status.replicas.desired} ready
          </Row>
          <Row k="리소스 상한">
            CPU {status.resources.limits.cpu || "—"} · Mem {status.resources.limits.memory || "—"}
          </Row>
          <Row k="리소스 요청">
            CPU {status.resources.requests.cpu || "—"} · Mem {status.resources.requests.memory || "—"}
          </Row>
          <div className="pt-2">
            <div className="mb-1.5 text-xs text-neutral-400">파드</div>
            <div className="space-y-1.5">
              {status.pods.length === 0 && <div className="text-sm text-neutral-500">파드 없음</div>}
              {status.pods.map((p) => (
                <div key={p.name} className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 px-3 py-2">
                  <div className="min-w-0">
                    <div className="truncate text-xs text-neutral-300">{p.name}</div>
                    <div className="text-[11px] text-neutral-500">
                      {p.node} · 재시작 {p.restarts}회
                    </div>
                  </div>
                  <span className={`chip ${p.ready ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>{p.phase}</span>
                </div>
              ))}
            </div>
          </div>
        </dl>
      )}
    </div>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-neutral-400">{k}</dt>
      <dd className="text-right text-neutral-100">{children}</dd>
    </div>
  );
}

// ── 업데이트 패널 ─────────────────────────────────────
function UpdatePanel({ jobs, jobRunning, onChanged }: { jobs: UpdateJob[]; jobRunning: boolean; onChanged: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [openJob, setOpenJob] = useState<string | null>(null);
  const [logs, setLogs] = useState<string>("");
  const logRef = useRef<HTMLPreElement>(null);

  const trigger = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/jobs", { method: "POST" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "실패");
      setMsg({ kind: "ok", text: `업데이트 Job 시작됨: ${j.jobName}` });
      setOpenJob(j.jobName);
      onChanged();
    } catch (e) {
      setMsg({ kind: "err", text: (e as Error).message });
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  // 선택한 Job 로그 폴링
  useEffect(() => {
    if (!openJob) return;
    let alive = true;
    const load = async () => {
      try {
        const j = await jget<{ logs: string }>(`/api/jobs/logs?job=${encodeURIComponent(openJob)}`);
        if (alive) setLogs(j.logs);
      } catch {
        /* ignore */
      }
    };
    load();
    const t = setInterval(load, 3000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [openJob]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  return (
    <div className="card p-5">
      <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">⬆️ 서버 업데이트</h2>
      <p className="mb-4 text-xs text-neutral-400">
        SteamCMD로 최신 버전 설치 + 실행권한 복구. 실행하면 <span className="text-amber-300">서버가 잠시 내려갔다</span> 자동 복구됩니다(3~10분).
      </p>

      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          disabled={busy || jobRunning}
          className="w-full rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
        >
          {jobRunning ? "업데이트 진행 중…" : "지금 업데이트"}
        </button>
      ) : (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
          <p className="mb-3 text-sm text-amber-100">정말 실행할까요? 접속자가 없을 때 진행하세요.</p>
          <div className="flex gap-2">
            <button onClick={trigger} disabled={busy} className="flex-1 rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-60">
              {busy ? "시작 중…" : "실행"}
            </button>
            <button onClick={() => setConfirming(false)} disabled={busy} className="flex-1 rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-white/5">
              취소
            </button>
          </div>
        </div>
      )}

      {msg && (
        <div className={`mt-3 rounded-lg px-3 py-2 text-sm ${msg.kind === "ok" ? "bg-emerald-500/10 text-emerald-200" : "bg-red-500/10 text-red-200"}`}>{msg.text}</div>
      )}

      {/* Job 이력 */}
      <div className="mt-5">
        <div className="mb-2 text-xs text-neutral-400">최근 업데이트 실행</div>
        {jobs.length === 0 ? (
          <div className="text-sm text-neutral-500">실행 이력 없음</div>
        ) : (
          <div className="space-y-1.5">
            {jobs.slice(0, 5).map((j) => (
              <button
                key={j.name}
                onClick={() => setOpenJob(j.name === openJob ? null : j.name)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition ${
                  openJob === j.name ? "border-emerald-500/40 bg-emerald-500/5" : "border-white/5 bg-black/20 hover:bg-white/5"
                }`}
              >
                <span className="truncate text-neutral-300">{j.name}</span>
                <JobBadge status={j.status} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 로그 뷰어 */}
      {openJob && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs text-neutral-400">
            <span>로그 · {openJob}</span>
            <button onClick={() => setOpenJob(null)} className="text-neutral-500 hover:text-neutral-300">닫기 ✕</button>
          </div>
          <pre ref={logRef} className="h-64 overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/50 p-3 text-[11px] leading-relaxed text-neutral-300">
            {logs || "로그 로딩 중…"}
          </pre>
        </div>
      )}
    </div>
  );
}

function JobBadge({ status }: { status: UpdateJob["status"] }) {
  const map = {
    running: ["bg-sky-500/15 text-sky-300", "실행 중"],
    succeeded: ["bg-emerald-500/15 text-emerald-300", "완료"],
    failed: ["bg-red-500/15 text-red-300", "실패"],
    unknown: ["bg-neutral-500/15 text-neutral-300", "대기"],
  } as const;
  const [cls, label] = map[status];
  return <span className={`chip ${cls}`}>{label}</span>;
}

// ── 설정 탐색기 ───────────────────────────────────────
function SettingsPanel({ settings }: { settings: SettingsResponse | null }) {
  const [q, setQ] = useState("");
  const [onlyChanged, setOnlyChanged] = useState(true);

  const groups = useMemo(() => {
    if (!settings) return [];
    const query = q.trim().toLowerCase();
    return settings.groups
      .map((g) => ({
        category: g.category,
        items: g.items.filter((it) => {
          if (onlyChanged && !it.nonDefault) return false;
          if (!query) return true;
          return (
            it.koName.toLowerCase().includes(query) ||
            it.envKey.toLowerCase().includes(query) ||
            it.explanation.toLowerCase().includes(query)
          );
        }),
      }))
      .filter((g) => g.items.length > 0);
  }, [settings, q, onlyChanged]);

  return (
    <div className="mt-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">⚙️ 서버 설정 현황</h2>
        <div className="flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-neutral-400">
            <input type="checkbox" checked={onlyChanged} onChange={(e) => setOnlyChanged(e.target.checked)} className="accent-emerald-500" />
            기본값과 다른 것만
          </label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="설정 검색…"
            className="w-40 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm outline-none placeholder:text-neutral-500 focus:border-emerald-500/50 sm:w-56"
          />
        </div>
      </div>

      {!settings ? (
        <div className="card p-5"><Skeleton rows={6} /></div>
      ) : (
        <div className="space-y-5">
          {groups.map((g) => (
            <div key={g.category} className="card overflow-hidden">
              <div className="border-b border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-neutral-200">{g.category}</div>
              <div className="divide-y divide-white/5">
                {g.items.map((it) => (
                  <SettingRow key={it.envKey} it={it} />
                ))}
              </div>
            </div>
          ))}
          {settings.others.length > 0 && (
            <div className="card overflow-hidden">
              <div className="border-b border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-neutral-200">운영/네트워크 (현재값)</div>
              <div className="flex flex-wrap gap-2 p-4">
                {settings.others.map((o) => (
                  <span key={o.envKey} className="chip bg-white/5 text-neutral-300">
                    <span className="text-neutral-500">{o.envKey}</span>
                    <span className="font-mono">{o.currentValue}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SettingRow({ it }: { it: SettingItem }) {
  const mult = multiplierLabel(it.currentValue, it.defaultValue, it.type);
  const curNum = Number(it.currentValue);
  const maxNum = Number(it.maxValue);
  const exceeds =
    (it.type === "float" || it.type === "int") &&
    !Number.isNaN(curNum) &&
    !Number.isNaN(maxNum) &&
    it.maxValue !== "" &&
    curNum > maxNum;

  const range =
    it.type === "bool" || it.type === "enum"
      ? it.maxValue
      : `${it.minValue !== "" ? it.minValue + "~" : "~"}${it.maxValue || "?"}`;

  return (
    <div className={`px-4 py-3 ${it.nonDefault ? "border-l-2 border-emerald-500/60" : "border-l-2 border-transparent"}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div className="flex items-baseline gap-2">
          <span className="font-medium text-neutral-100">{it.koName}</span>
          <span className="font-mono text-[11px] text-neutral-500">{it.envKey}</span>
        </div>
        <div className="flex items-baseline gap-2 text-sm">
          <span className={`font-semibold ${it.nonDefault ? "text-emerald-300" : "text-neutral-300"}`}>{fmtValue(it.currentValue, it.type)}</span>
          {mult && <span className="chip bg-emerald-500/15 text-emerald-300">{mult}</span>}
          {exceeds && <span className="chip bg-amber-500/15 text-amber-300">슬라이더 초과</span>}
        </div>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-neutral-400">
        <span>{it.explanation}</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-4 text-[11px] text-neutral-500">
        <span>기본값 <span className="text-neutral-400">{fmtValue(it.defaultValue, it.type)}</span></span>
        <span>범위 <span className="text-neutral-400">{range}</span></span>
        <span className="font-mono">{it.iniKey}</span>
      </div>
      {it.note && <div className="mt-1 text-[11px] text-amber-200/70">※ {it.note}</div>}
    </div>
  );
}

// ── 스켈레톤 ──────────────────────────────────────────
function Skeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 animate-pulse rounded bg-white/5" style={{ width: `${60 + ((i * 13) % 35)}%` }} />
      ))}
    </div>
  );
}
