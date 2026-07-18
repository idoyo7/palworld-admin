"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

// swagger-ui-react 는 window 를 참조하므로 SSR 비활성 + 클라이언트 전용 동적 로딩.
const SwaggerUIClient = dynamic(() => import("@/components/SwaggerUIClient"), {
  ssr: false,
  loading: () => <div className="px-5 py-10 text-center text-sm text-neutral-400">Swagger UI 로딩 중…</div>,
});

export default function SwaggerPageClient() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">팰월드 REST API 문서</h1>
            <p className="mt-1 text-sm text-neutral-600">
              이 문서는 palworld-admin 서버 프록시(<code className="rounded bg-neutral-100 px-1 py-0.5 text-xs">/api/palworld/*</code>)를
              경유하며, Basic Auth 인증은 서버사이드에서 자동 주입됩니다 — 별도 인증 입력 없이 &quot;Try it out&quot;
              으로 실제 서버를 호출할 수 있습니다. ⚠️ shutdown/stop 등 일부 엔드포인트는 서버를 즉시 종료시키는
              파괴적 동작이니 실행에 주의하세요.
            </p>
          </div>
          <Link
            href="/"
            className="shrink-0 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100"
          >
            ← 대시보드로
          </Link>
        </div>
      </div>
      <SwaggerUIClient />
    </div>
  );
}
