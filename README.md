# palworld-admin

EVE&JUNI 팰월드 서버용 관리 대시보드 (Next.js). 클러스터 안에서 동작하며:

- **서버 상태**: 파드/레플리카/리소스 상한/게임 버전/재시작 횟수
- **설정 현황(읽기 전용)**: 배수·인원·거점 등 52개 게임플레이 설정을 현재값 + 기본값 + 범위/최댓값 + 한글 설명과 함께 표시. 기본값과 다른 값·슬라이더 초과 값 하이라이트.
- **업데이트 실행**: 버튼 한 번으로 `cronjob/palworld-update` 트리거 (서버 내림→steamcmd→chmod→복구) + 실시간 로그.

설정 **변경**은 제공하지 않는다 (변경은 GitOps: mont-helm `cvalues.yaml` → git). 이 앱은 조회 + 업데이트 트리거 전용.

## 아키텍처
- Next.js(App Router, standalone) + Tailwind. 서버사이드 Route Handler(`src/app/api/*`)에서 `@kubernetes/client-node`로 in-cluster ServiceAccount 토큰을 사용해 k8s API 호출.
- `src/lib/k8s.ts` — k8s 연동 (상태/설정/Job/로그/트리거)
- `src/lib/settings-reference.ts` — 설정 옵션 레퍼런스(설명/기본값/범위). palworld-settings-reference 리서치 워크플로우 검증 데이터.
- `src/components/Dashboard.tsx` — UI 전체 (클라이언트).

## RBAC (필요 최소 권한, palworld 네임스페이스)
`configmaps[get]`, `deployments[get]`, `pods[get,list]`, `pods/log[get]`, `cronjobs[get]`, `jobs[get,list,create]`.
서버 scale 권한은 트리거되는 Job(`palworld-updater` SA)이 별도로 보유하며, 이 웹앱에는 부여하지 않는다.

## 배포 (GitOps)
- 이미지: `ghcr.io/idoyo7/palworld-admin` — GitHub Actions(`.github/workflows/docker-build-push.yml`)가 빌드→ghcr push→`montstrap-manifest/stage/palworld-admin/kustomization.yaml`의 `newTag` 갱신.
- 매니페스트: `montstrap-manifest/stage/palworld-admin/` (deployment/service/virtualservice/rbac/kustomization), ArgoCD app `palworld-admin`.
- 인증: 앞단 oauth2-proxy(Keycloak `monthouse` 렐름) — `palworld.makgol.com`.

## 로컬 개발
```bash
npm install
npm run dev     # http://localhost:3000 (kubeconfig 컨텍스트로 클러스터 접근)
```
로컬에서는 in-cluster 토큰이 없으므로 `~/.kube/config`의 현재 컨텍스트로 접근한다.

## 환경변수 (선택, 기본값 존재)
`PALWORLD_NAMESPACE=palworld`, `PALWORLD_DEPLOY=palworld-server`, `PALWORLD_CONFIGMAP=palworld-env-config`, `PALWORLD_CRONJOB=palworld-update`.

- `PALWORLD_ADMIN_PASSWORD` — 팰월드 서버 REST API(`admin:<password>`) 인증 비밀번호. 파드 IP로 직접 붙어 접속자 수 등을 조회할 때 사용(REST API 는 Service 로 노출되지 않음). 비어있으면 관련 메트릭이 조회되지 않을 뿐, 앱은 정상 동작.

## Prometheus 메트릭 (`/metrics`)
`PALWORLD_ADMIN_PASSWORD` 가 설정되면 팰월드 서버 REST API(`/v1/api/metrics`)를 조회해 아래 게이지를 노출한다. 모두 `{server="<PALWORLD_NAMESPACE>"}` 라벨이 붙는다.

| 메트릭 | 설명 |
|---|---|
| `palworld_up` | REST API 도달·인증 성공 시 1, 실패 시 0 (항상 노출) |
| `palworld_player_count` | 현재 접속자 수 |
| `palworld_player_max` | 최대 접속자 수 |
| `palworld_server_fps` | 서버 FPS |
| `palworld_server_fps_average` | 서버 평균 FPS (필드가 있을 때만 노출) |
| `palworld_server_frame_time_ms` | 프레임 시간(ms) |
| `palworld_uptime_seconds` | 서버 가동 시간(초) |
| `palworld_base_camp_count` | 거점 수 |
| `palworld_in_game_days` | 게임 내 경과일 |

## Helm values (`chart/values.yaml`)
- `palworldAdminPassword.secretName` / `secretKey` — 위 REST API 비밀번호를 담은 Secret 이름/키. `secretName` 이 비면 `PALWORLD_ADMIN_PASSWORD` env 미주입(기본값).
- `metrics.prometheusUrl` — 리소스 사용량 그래프용 Prometheus 호환 query 엔드포인트. 비면 그래프 섹션 비표시.
- `metrics.serviceScrape.enabled` / `interval` — `true` 시 `VMServiceScrape` 를 생성해 `/metrics` 를 VictoriaMetrics 가 스크레이프(기본 비활성, 기본 interval `30s`).
