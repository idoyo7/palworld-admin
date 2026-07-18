import type { Metadata } from "next";
import SwaggerPageClient from "./SwaggerPageClient";

export const metadata: Metadata = {
  title: "REST API 문서 — Palworld Admin",
  description: "팰월드 서버 REST API v1 Swagger UI",
};

export default function SwaggerPage() {
  return <SwaggerPageClient />;
}
