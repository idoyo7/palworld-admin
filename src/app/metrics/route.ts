// Prometheus 텍스트 exposition (v0.0.4) 로 Palworld 서버 상태를 노출.
// VM operator 의 VMServiceScrape/VMScrapeConfig (selectAllByDefault) 가 이 경로를 스크레이프.
// 주의: /api 하위가 아님 — 스크레이퍼가 흔히 기대하는 관례상 /metrics 로 둠.

import { getPalworldStats } from "@/lib/palworld-api";
import { NS } from "@/lib/k8s";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function gauge(name: string, help: string, value: number): string {
  return [
    `# HELP ${name} ${help}`,
    `# TYPE ${name} gauge`,
    `${name}{server="${NS}"} ${value}`,
    "",
  ].join("\n");
}

export async function GET() {
  const stats = await getPalworldStats().catch(() => null);

  const parts: string[] = [
    gauge("palworld_up", "Palworld REST API 도달 및 인증 성공 여부 (1=정상, 0=실패)", stats !== null ? 1 : 0),
  ];

  if (stats !== null) {
    parts.push(gauge("palworld_player_count", "현재 접속 중인 플레이어 수", stats.currentplayernum));
    parts.push(gauge("palworld_player_max", "서버 최대 접속 인원", stats.maxplayernum));
    parts.push(gauge("palworld_server_fps", "서버 현재 FPS", stats.serverfps));
    if (stats.serverfpsaverage !== undefined) {
      parts.push(gauge("palworld_server_fps_average", "서버 평균 FPS", stats.serverfpsaverage));
    }
    parts.push(gauge("palworld_server_frame_time_ms", "서버 프레임 타임 (ms)", stats.serverframetime));
    parts.push(gauge("palworld_uptime_seconds", "서버 가동 시간 (초)", stats.uptime));
    parts.push(gauge("palworld_base_camp_count", "전체 베이스캠프 수", stats.basecampnum));
    parts.push(gauge("palworld_in_game_days", "게임 내 경과일", stats.days));
  }

  return new Response(parts.join("\n"), {
    headers: { "Content-Type": "text/plain; version=0.0.4; charset=utf-8" },
  });
}
