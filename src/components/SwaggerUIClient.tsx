"use client";

// swagger-ui-react 는 브라우저 전용(window 참조)이라 SSR 시 렌더링하면 안 된다.
// 이 컴포넌트는 /swagger 페이지에서 dynamic(..., { ssr: false }) 으로만 불러온다.

import "swagger-ui-react/swagger-ui.css";
import SwaggerUI from "swagger-ui-react";
import { palworldOpenApiSpec } from "@/lib/palworld-openapi";

export default function SwaggerUIClient() {
  return <SwaggerUI spec={palworldOpenApiSpec} docExpansion="list" defaultModelsExpandDepth={1} />;
}
