import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "추천 서버 모드 — Palworld Admin",
  description: "이 서버(Linux 데디케이드) 환경에서 실제로 설치 가능한 팰월드 모드 정리",
};

interface ModRow {
  name: string;
  desc: string;
  badge: "서버만" | "클라+서버";
  href?: string;
  unconfirmed?: string;
}

const SERVER_ONLY_MODS: ModRow[] = [
  {
    name: "Stuck Pal Rescuer",
    desc: "일정 시간 정지한(끼인) 팰을 팰박스로 자동 귀환시켜 경로탐색(pathfinding) 버그에 대응한다.",
    badge: "서버만",
  },
  {
    name: "Admin Commands",
    desc: "접속/퇴장 채팅 알림, 커스텀 웰컴 메시지, admin 명령 추가 등 운영 편의 기능을 더한다.",
    badge: "서버만",
  },
  {
    name: "Server Performance Optimizer",
    desc: "장시간(72~96시간) 구동 시 발생하는 tick 느려짐을 완화한다.",
    badge: "서버만",
  },
];

const CLIENT_AND_SERVER_MODS: ModRow[] = [
  {
    name: "MapUnlocker",
    desc: "시작부터 전체 맵을 공개한다. Nexus 최다 다운로드(약 50만) 모드.",
    badge: "클라+서버",
  },
  {
    name: "Carry Weight Increase",
    desc: "플레이어 소지 무게 한도를 늘려준다.",
    badge: "클라+서버",
  },
  {
    name: "Less Restrictive Building",
    desc: "건축 높이 제한 해제, 오브젝트 겹침·급경사 건축 허용 등 건축 자유도를 높인다.",
    badge: "클라+서버",
  },
  {
    name: "Pal Analyzer",
    desc: "야생 팰의 IV(개체값)·패시브 스킬을 마우스오버로 표시한다.",
    badge: "클라+서버",
  },
  {
    name: "Better Pal AI",
    desc: "팰의 경로탐색·작업 배정 로직을 개선한다.",
    badge: "클라+서버",
    unconfirmed: "설치 방식 미확인",
  },
];

function Badge({ kind }: { kind: ModRow["badge"] }) {
  const cls =
    kind === "서버만" ? "bg-emerald-500/15 text-emerald-300" : "bg-sky-500/15 text-sky-300";
  return <span className={`chip ${cls}`}>{kind}</span>;
}

function ModTable({ rows }: { rows: ModRow[] }) {
  return (
    <div className="card overflow-hidden">
      <div className="divide-y divide-white/5">
        {rows.map((m) => (
          <div key={m.name} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-100">{m.name}</span>
                {m.unconfirmed && (
                  <span className="chip bg-amber-500/15 text-amber-300">※ {m.unconfirmed}</span>
                )}
              </div>
              <p className="mt-1 text-sm text-neutral-400">{m.desc}</p>
            </div>
            <Badge kind={m.badge} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ModsPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧩</span>
            <h1 className="bg-gradient-to-r from-emerald-300 to-sky-300 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
              추천 서버 모드
            </h1>
          </div>
          <p className="mt-1 text-sm text-neutral-400">이 서버(thijsvanloef Linux docker) 환경에서 실제로 설치 가능한 모드 정리 · 2026-07-19 조사</p>
        </div>
        <Link
          href="/"
          className="shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-sm text-neutral-300 hover:bg-white/5"
        >
          ← 대시보드로
        </Link>
      </header>

      {/* 섹션 1 — 제약사항 안내 */}
      <section className="mb-8 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
        <h2 className="mb-2 flex items-center gap-2 font-semibold text-amber-200">⚠️ 이 서버 환경의 제약</h2>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            팰월드 모딩 핵심 프레임워크 <strong>UE4SS</strong>는 Windows 전용(DLL 인젝션)이라 이 서버(Linux)에서는
            UE4SS 기반 모드를 사용할 수 없다.
          </li>
          <li>
            불가 목록:{" "}
            <a
              href="https://github.com/Ultimeit/PalDefender"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-amber-50"
            >
              PalDefender
            </a>
            (구 PalGuard, admin/anti-cheat),{" "}
            <a
              href="https://github.com/Okaetsu/PalSchema"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-amber-50"
            >
              PalSchema
            </a>
            (데이터 수정 프레임워크) — 둘 다 &quot;Windows 데디서버 전용&quot;이 명시되어 있다.
          </li>
          <li>
            <strong>PAK 방식 모드</strong>(<code className="rounded bg-black/30 px-1 py-0.5 text-xs">Pal/Content/Paks/~mods</code>에
            파일 배치)는 플랫폼 무관이라 사용 가능하다. 설치는 PVC 마운트 + 서버 재시작 1회로 끝난다.
          </li>
          <li>
            팰월드 1.0(2026-07-10) 대규모 변경 — Pocketpair 공식 경고: 구버전 모드는 완전히 삭제 후 1.0 호환이
            확인된 것만 재설치해야 한다. 각 모드의 Nexus 페이지에서 1.0 호환 공지를 반드시 확인할 것.
          </li>
        </ul>
      </section>

      {/* 섹션 2 — 서버만 설치 (즉시 적용 가능) */}
      <section className="mb-8">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">
          ✅ 서버만 설치하면 되는 PAK 모드 <span className="chip bg-emerald-500/15 text-emerald-300">즉시 적용 가능</span>
        </h2>
        <p className="mb-3 text-xs text-neutral-400">
          클라이언트(플레이어) 쪽 설치가 필요 없어 서버 관리자가 바로 적용할 수 있다.
        </p>
        <ModTable rows={SERVER_ONLY_MODS} />
      </section>

      {/* 섹션 3 — 클라+서버 모두 설치 필요 */}
      <section className="mb-8">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">
          👥 인기 모드 <span className="chip bg-sky-500/15 text-sky-300">전원 설치 필요</span>
        </h2>
        <p className="mb-3 text-xs text-neutral-400">
          접속하는 모든 플레이어가 동일한 모드를 클라이언트에도 설치해야 한다 — 적용 전 가족(플레이어) 합의 필요.
        </p>
        <ModTable rows={CLIENT_AND_SERVER_MODS} />
      </section>

      {/* 출처 */}
      <section className="card p-4 text-xs text-neutral-500">
        <div className="mb-2 font-semibold text-neutral-400">출처</div>
        <ul className="space-y-1">
          <li>
            <a
              href="https://winternode.com/blog/palworld/best-server-mods"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-neutral-300"
            >
              WinterNode — Best Palworld Server Mods
            </a>
          </li>
          <li>
            <a
              href="https://www.nexusmods.com/palworld/mods/top"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-neutral-300"
            >
              Nexus Mods — Palworld 인기 모드 목록
            </a>
          </li>
          <li>
            <a
              href="https://docs.palworldgame.com/settings-and-operation/mod/"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-neutral-300"
            >
              공식 서버 모드 설치 가이드 (docs.palworldgame.com)
            </a>
          </li>
          <li>
            <a
              href="https://github.com/Ultimeit/PalDefender"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-neutral-300"
            >
              PalDefender (GitHub)
            </a>
          </li>
          <li>
            <a
              href="https://github.com/Okaetsu/PalSchema"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-neutral-300"
            >
              PalSchema (GitHub)
            </a>
          </li>
        </ul>
      </section>

      <footer className="mt-10 border-t border-white/10 pt-5 text-center text-xs text-neutral-500">
        palworld-admin · 모드 설치는 수동 작업(PVC 마운트 + 재시작)이 필요합니다. 이 페이지는 설치를 대신 실행하지 않습니다.
      </footer>
    </div>
  );
}
