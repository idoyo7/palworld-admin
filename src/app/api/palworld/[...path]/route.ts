// 팰월드 REST API(v1) 프록시 — Swagger UI(/swagger)의 "Try it out" 이 실제 서버로 요청하는 경로.
// GET/POST 를 http://<podIP>:8212/v1/api/<path> 로 그대로 전달하고, Basic Auth 는 서버사이드에서 주입한다.
// 임의 경로 포워딩을 막기 위해 허용리스트(ALLOWED) 에 있는 method+path 조합만 통과시킨다.
// 주의: palworld-api.ts 의 캐시(TTL)는 대시보드 폴링용이며 여기서는 재사용하지 않는다 — 프록시는 매 요청마다 직행.

import { NextRequest, NextResponse } from "next/server";
import { getServerPodIP } from "@/lib/k8s";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_PASSWORD = process.env.PALWORLD_ADMIN_PASSWORD || "";
const REST_PORT = process.env.PALWORLD_REST_PORT || "8212";

// 허용된 엔드포인트만 프록시. shutdown/stop 은 서버를 즉시 종료시키는 파괴적 동작이지만
// 공식 REST API 문서 확인(Swagger UI Try it out) 목적상 포함한다 — 호출 시 실제 서버가 내려가니 주의.
const ALLOWED: Record<"GET" | "POST", Set<string>> = {
  GET: new Set(["info", "players", "settings", "metrics", "game-data"]),
  POST: new Set(["announce", "kick", "ban", "unban", "save", "shutdown", "stop"]),
};

async function handle(req: NextRequest, path: string[]): Promise<NextResponse> {
  const method = req.method as "GET" | "POST";
  const endpoint = path.join("/");

  if (!ALLOWED[method]?.has(endpoint)) {
    return NextResponse.json({ error: `허용되지 않은 엔드포인트입니다: ${method} /${endpoint}` }, { status: 404 });
  }
  if (!ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "PALWORLD_ADMIN_PASSWORD 환경변수가 설정되지 않아 REST API 프록시를 사용할 수 없습니다." },
      { status: 503 },
    );
  }

  const podIP = await getServerPodIP().catch(() => null);
  if (!podIP) {
    return NextResponse.json({ error: "실행 중인 서버 파드를 찾을 수 없습니다." }, { status: 503 });
  }

  try {
    const auth = Buffer.from(`admin:${ADMIN_PASSWORD}`).toString("base64");
    const body = method === "POST" ? await req.text() : undefined;
    const res = await fetch(`http://${podIP}:${REST_PORT}/v1/api/${endpoint}`, {
      method,
      headers: {
        Authorization: `Basic ${auth}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") || "application/json" },
    });
  } catch (e) {
    // 네트워크 오류/타임아웃 등 — 502 로 응답 (throw 하지 않음)
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handle(req, path);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handle(req, path);
}
