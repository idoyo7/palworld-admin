import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Palworld Admin — EVE&JUNI",
  description: "팰월드 서버 상태·설정 대시보드 및 업데이트 트리거",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen text-neutral-100 antialiased">{children}</body>
    </html>
  );
}
