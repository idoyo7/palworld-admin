/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // k8s 대시보드는 항상 최신 상태를 보여줘야 하므로 라우트 캐시 비활성 기본값 유지.
};

export default nextConfig;
