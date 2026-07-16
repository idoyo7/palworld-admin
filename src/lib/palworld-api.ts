// Palworld 서버 REST API(v1/api/metrics) 클라이언트.
// REST 는 Service 로 노출되지 않아 파드 IP 로 직접 접근(port 8212, Basic Auth "admin:<password>").
// 주의: 5s 간격 REST 폴링이 서버 접속 로그를 스팸해 운영팀이 player-logging 을 껐던 사례가 있어,
// 모듈 레벨 캐시로 실제 REST 호출 빈도를 낮게 유지한다(성공 15s / 실패 10s TTL, /api/status 는 5s 마다,
// /metrics 는 30s 마다 조회되지만 실제 REST 히트는 ~4회/분 수준으로 억제됨).

import { getServerPodIP } from "@/lib/k8s";

const ADMIN_PASSWORD = process.env.PALWORLD_ADMIN_PASSWORD || "";
const REST_PORT = process.env.PALWORLD_REST_PORT || "8212";

const SUCCESS_TTL_MS = 15_000;
// 실패 TTL 은 /api/status 폴링 주기(5s)보다 길게 — REST 소켓이 행에 걸렸을 때 매 폴링마다
// 4s 타임아웃을 물지 않도록 한다.
const FAILURE_TTL_MS = 10_000;

export interface PalworldStats {
  currentplayernum: number;
  serverfps: number;
  serverfpsaverage?: number; // 문서화되지 않았지만 응답에 포함됨
  serverframetime: number; // ms
  days: number;
  maxplayernum: number;
  basecampnum: number;
  uptime: number; // seconds
}

let cache: { value: PalworldStats | null; expiresAt: number } | null = null;
let inFlight: Promise<PalworldStats | null> | null = null;

const REQUIRED_NUMERIC_KEYS = [
  "currentplayernum",
  "serverfps",
  "serverframetime",
  "days",
  "maxplayernum",
  "basecampnum",
  "uptime",
] as const;

function isValidStats(v: unknown): v is PalworldStats {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  for (const key of REQUIRED_NUMERIC_KEYS) {
    if (typeof o[key] !== "number" || !Number.isFinite(o[key])) return false;
  }
  if (o.serverfpsaverage !== undefined && typeof o.serverfpsaverage !== "number") return false;
  return true;
}

async function fetchStats(): Promise<PalworldStats | null> {
  if (!ADMIN_PASSWORD) return null; // 비밀번호 미설정 시 기능 비활성

  const podIP = await getServerPodIP().catch(() => null);
  if (!podIP) return null;

  try {
    const auth = Buffer.from(`admin:${ADMIN_PASSWORD}`).toString("base64");
    const res = await fetch(`http://${podIP}:${REST_PORT}/v1/api/metrics`, {
      headers: { Authorization: `Basic ${auth}` },
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!isValidStats(json)) return null;
    return json;
  } catch {
    return null; // 네트워크 오류/타임아웃 등 — 절대 throw 하지 않음
  }
}

export async function getPalworldStats(): Promise<PalworldStats | null> {
  if (cache && cache.expiresAt > Date.now()) return cache.value;
  // 동시 호출(/metrics 스크레이프 + /api/status 폴링)은 진행 중인 요청에 합류 — REST 히트 1회 유지
  if (inFlight) return inFlight;

  inFlight = fetchStats()
    .catch(() => null)
    .then((value) => {
      const ttl = value !== null ? SUCCESS_TTL_MS : FAILURE_TTL_MS;
      cache = { value, expiresAt: Date.now() + ttl };
      inFlight = null;
      return value;
    });
  return inFlight;
}
