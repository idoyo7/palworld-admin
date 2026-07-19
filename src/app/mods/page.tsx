import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "추천 서버 모드 — Palworld Admin",
  description: "이 서버(Linux 데디케이드) 환경에서 실제로 설치 가능한 팰월드 PAK 모드 정리",
};

type ClientNeed = "서버만 추정" | "클라+서버" | "미확인";

interface PakMod {
  name: string;
  nexusPath: string; // 예: "mods/46"
  desc: string;
  clientNeed: ClientNeed;
  oneDotZero: "확인됨" | "미확인";
  recommended?: boolean;
  note?: string;
  warning?: string;
}

interface UnavailableMod {
  name: string;
  href?: string;
  reason: string;
}

// 2026-07-19 2차 리서치(Nexus 모드 페이지 실제 확인)로 검증된 PAK 방식 모드.
// "서버만 추정" 은 모드 페이지에 서버 설치만 명시되고 클라 필요 언급이 없는 경우 — 확정은 아님(추정).
const PAK_CONFIRMED_MODS: PakMod[] = [
  {
    name: "All the Bases",
    nexusPath: "mods/46",
    desc: "길드당 소유 가능한 베이스캠프 최대 개수를 128개까지 확장한다.",
    clientNeed: "서버만 추정",
    oneDotZero: "미확인",
    note: "모드 페이지에 서버 설치 필요만 명시되어 있고 클라이언트 설치 필요 여부는 언급이 없다.",
  },
  {
    name: "Better Egg Breeding",
    nexusPath: "mods/3635",
    desc: "교배 시 무작위 변이를 제거하고 부모의 스탯을 그대로 상속시킨다.",
    clientNeed: "미확인",
    oneDotZero: "확인됨",
    recommended: true,
    note: "1.0 대응을 위해 Linux 서버 호환을 명시하고 PAK 로 재제작된 버전이 확인됨.",
  },
  {
    name: "Increased base amount and worker pals",
    nexusPath: "mods/55",
    desc: "베이스캠프 개수와 거점당 배치 가능한 일꾼 팰 수를 늘려준다.",
    clientNeed: "클라+서버",
    oneDotZero: "미확인",
    note: "모드 페이지에 \"server and client 둘 다 설치\" 가 명시되어 있다.",
  },
  {
    name: "Instant Hatching Eggs",
    nexusPath: "mods/1131",
    desc: "알을 즉시 부화시킨다.",
    clientNeed: "클라+서버",
    oneDotZero: "미확인",
    note: "참고: 서버 설정 PAL_EGG_DEFAULT_HATCHING_TIME 을 0으로 두면 이 모드와 동일한 효과를 낼 수 있다. " +
      "이 서버는 현재 2.0(약 2시간)으로 설정되어 있어 이미 매우 빠른 편이지만, 완전한 즉시 부화(0)는 아니다.",
  },
  {
    name: "Always Capture",
    nexusPath: "mods/3675",
    desc: "모든 팰의 포획 성공률을 9999(사실상 100%)로 만든다.",
    clientNeed: "미확인",
    oneDotZero: "미확인",
    note: "서버/클라이언트 각각의 설치 필요성이 모드 페이지에 명확히 기재되어 있지 않다.",
  },
  {
    name: "Less Restrictive Building (for 1.0)",
    nexusPath: "mods/98",
    desc: "수중·공중 건축, 경사면 건축, 오브젝트 겹침 등 건축 제약을 대폭 완화한다.",
    clientNeed: "클라+서버",
    oneDotZero: "확인됨",
    recommended: true,
    note: "v1.5.3(2026-07-15) 기준 1.0 호환 확인됨.",
    warning: "같은 모드 페이지에 UE4SS 버전이 함께 올라와 있다 — 다운로드 시 반드시 \"PAK\" 버전을 선택할 것.",
  },
  {
    name: "Faster Work Speeds",
    nexusPath: "mods/3654",
    desc: "제작·건설 등 작업 속도 배율을 높인다.",
    clientNeed: "미확인",
    oneDotZero: "미확인",
    note: "참고: 서버 설정 WORK_SPEED_RATE 로도 유사한 효과를 낼 수 있다. 이 서버는 현재 10배로 설정되어 있다. " +
      "서버/클라이언트 각각의 설치 필요성은 모드 페이지에 명확히 기재되어 있지 않다.",
  },
];

// UE4SS(Windows 전용 DLL 인젝션) 기반이라 이 서버(Linux, UE4SS 미탑재 이미지)에서는 쓸 수 없는 모드.
const UNAVAILABLE_MODS: UnavailableMod[] = [
  {
    name: "PalDefender (구 PalGuard)",
    href: "https://github.com/Ultimeit/PalDefender",
    reason: "admin/anti-cheat 프레임워크 — Windows 데디서버 전용이 명시되어 있다(UE4SS 기반).",
  },
  {
    name: "PalSchema",
    href: "https://github.com/Okaetsu/PalSchema",
    reason: "데이터 수정 프레임워크 — Windows 데디서버 전용이 명시되어 있다(UE4SS 기반).",
  },
  {
    name: "Stuck Pal Rescuer",
    reason: "PAK 이 아니라 UE4SS/Lua 기반(config.lua) 모드로 재확인됨 — 이전 버전 페이지의 \"서버만\" 표기는 오류였다. " +
      "UE4SS 도입 시 재검토 후보.",
  },
  {
    name: "Admin Commands (Server Side)",
    reason: "PAK 이 아니라 UE4SS/Lua 기반(설치 경로 Pal/Binaries/Win64/ue4ss/Mods) 모드로 재확인됨. " +
      "v3.0.2(2026-07-13)에 \"supports UE4SS on Linux\" 문구가 등장했지만, 이 서버 이미지 자체에 UE4SS 가 탑재되어 있지 않아 " +
      "여전히 사용할 수 없다 — UE4SS 도입 시 재검토 후보.",
  },
  {
    name: "MapUnlocker",
    reason: "2차 확인 결과 UE4SS 기반 모드로 재분류됨 — 이전 버전 페이지의 \"PAK, 클라+서버\" 표기는 오류였다.",
  },
  {
    name: "Carry Weight Increase",
    reason: "2차 확인 결과 UE4SS 기반 모드로 재분류됨 — 이전 버전 페이지의 \"PAK, 클라+서버\" 표기는 오류였다.",
  },
  {
    name: "Server Performance Optimizer",
    reason: "Nexus 에 실존하는 모드 페이지를 확인할 수 없었다(여러 호스팅 블로그가 동일 문구를 재탕한 것으로 추정) — " +
      "출처 미확인으로 목록에서 제외.",
  },
];

function nexusUrl(path: string): string {
  return `https://www.nexusmods.com/palworld/${path}`;
}

function ClientNeedBadge({ kind }: { kind: ClientNeed }) {
  const cls =
    kind === "서버만 추정"
      ? "bg-emerald-500/15 text-emerald-300"
      : kind === "클라+서버"
        ? "bg-sky-500/15 text-sky-300"
        : "bg-neutral-500/15 text-neutral-300";
  return <span className={`chip ${cls}`}>{kind}</span>;
}

function OneDotZeroBadge({ status }: { status: PakMod["oneDotZero"] }) {
  const cls = status === "확인됨" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300";
  return <span className={`chip ${cls}`}>1.0 {status}</span>;
}

function PakModCard({ m }: { m: PakMod }) {
  return (
    <div className="px-4 py-3.5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={nexusUrl(m.nexusPath)}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-neutral-100 underline hover:text-emerald-300"
            >
              {m.name}
            </a>
            {m.recommended && <span className="chip bg-amber-500/20 text-amber-300">★ 추천</span>}
          </div>
          <p className="mt-1 text-sm text-neutral-400">{m.desc}</p>
          {m.note && <p className="mt-1 text-[11px] text-neutral-500">※ {m.note}</p>}
          {m.warning && (
            <p className="mt-1 text-[11px] font-medium text-amber-300">⚠️ {m.warning}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <ClientNeedBadge kind={m.clientNeed} />
          <OneDotZeroBadge status={m.oneDotZero} />
        </div>
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
          <p className="mt-1 text-sm text-neutral-400">
            이 서버(thijsvanloef Linux docker) 환경에서 실제로 설치 가능한 PAK 모드 정리 · 2026-07-19 조사(Nexus 페이지 직접 확인)
          </p>
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
            팰월드 모딩 핵심 프레임워크 <strong>UE4SS</strong>는 원래 Windows 전용(DLL 인젝션)이고, 이 서버가 쓰는
            docker 이미지에도 UE4SS 가 탑재되어 있지 않아 UE4SS/Lua 기반 모드를 사용할 수 없다.
          </li>
          <li>
            <strong>PAK 방식 모드</strong>(<code className="rounded bg-black/30 px-1 py-0.5 text-xs">Pal/Content/Paks/~mods</code>에
            파일 배치)는 플랫폼 무관이라 사용 가능하다. 설치는 PVC 마운트 + 서버 재시작 1회로 끝난다.
          </li>
          <li>
            팰월드 1.0(2026-07-10) 대규모 변경 — Pocketpair 공식 경고: 구버전 모드는 완전히 삭제 후 1.0 호환이
            확인된 것만 재설치해야 한다. 아래 표의 &quot;1.0 확인됨/미확인&quot; 은 이번 조사 시점 기준이며, 설치 전
            각 모드의 Nexus 페이지에서 최신 1.0 호환 공지를 반드시 다시 확인할 것.
          </li>
        </ul>
      </section>

      {/* 섹션 2 — 설치 가능 (PAK 확인됨) */}
      <section className="mb-8">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">
          ✅ 설치 가능 <span className="chip bg-emerald-500/15 text-emerald-300">PAK 확인됨</span>
        </h2>
        <p className="mb-3 text-xs text-neutral-400">
          모드명을 누르면 Nexus 페이지로 이동한다. &quot;서버만 추정&quot; 은 모드 페이지에 클라이언트 설치 필요 여부
          언급이 없어 확정은 아니다. 뱃지가 &quot;클라+서버&quot;인 모드는 접속자 전원이 클라이언트에도 동일하게
          설치해야 한다.
        </p>
        <div className="card divide-y divide-white/5 overflow-hidden">
          {PAK_CONFIRMED_MODS.map((m) => (
            <PakModCard key={m.name} m={m} />
          ))}
        </div>
      </section>

      {/* 섹션 3 — 이 서버에선 불가 */}
      <section className="mb-8">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold">
          🚫 이 서버에선 불가 <span className="chip bg-red-500/15 text-red-300">UE4SS 기반</span>
        </h2>
        <p className="mb-3 text-xs text-neutral-400">
          아래는 초기 조사에서 오분류되었거나(1차 리서치 오류) UE4SS/Lua 기반으로 확인되어 이 서버에 설치할 수 없는
          모드다.
        </p>
        <div className="card divide-y divide-white/5 overflow-hidden">
          {UNAVAILABLE_MODS.map((m) => (
            <div key={m.name} className="px-4 py-3.5">
              <div className="font-medium text-neutral-100">
                {m.href ? (
                  <a href={m.href} target="_blank" rel="noreferrer" className="underline hover:text-red-300">
                    {m.name}
                  </a>
                ) : (
                  m.name
                )}
              </div>
              <p className="mt-1 text-sm text-neutral-400">{m.reason}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 섹션 4 — 설치 방법 + 출처 */}
      <section className="mb-8 card p-4 text-sm text-neutral-300">
        <h2 className="mb-2 font-semibold text-neutral-100">📦 설치 방법 (PAK 모드 공통)</h2>
        <ol className="list-decimal space-y-1 pl-5 text-neutral-400">
          <li>Nexus 에서 내려받은 <code className="rounded bg-black/30 px-1 py-0.5 text-xs">.pak</code> 파일을 서버 PVC 의
            <code className="ml-1 rounded bg-black/30 px-1 py-0.5 text-xs">Pal/Content/Paks/~mods</code> 경로에 배치한다.</li>
          <li>서버를 재시작한다 — 이후 별도 조치 없이 즉시 적용된다.</li>
        </ol>
        <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          ⚠️ 설치 전 각 모드의 Nexus 페이지에서 1.0 호환 공지를 반드시 다시 확인할 것. 클라이언트 설치가 필요한
          모드는 접속자 전원과 사전에 합의해야 한다.
        </p>
      </section>

      <section className="card p-4 text-xs text-neutral-500">
        <div className="mb-2 font-semibold text-neutral-400">출처 (2026-07-19 조사)</div>
        <ul className="space-y-1">
          {PAK_CONFIRMED_MODS.map((m) => (
            <li key={m.name}>
              <a href={nexusUrl(m.nexusPath)} target="_blank" rel="noreferrer" className="underline hover:text-neutral-300">
                Nexus Mods — {m.name} ({m.nexusPath})
              </a>
            </li>
          ))}
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
            <a href="https://github.com/Ultimeit/PalDefender" target="_blank" rel="noreferrer" className="underline hover:text-neutral-300">
              PalDefender (GitHub)
            </a>
          </li>
          <li>
            <a href="https://github.com/Okaetsu/PalSchema" target="_blank" rel="noreferrer" className="underline hover:text-neutral-300">
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
