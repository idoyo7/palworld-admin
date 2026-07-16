import * as k8s from "@kubernetes/client-node";

// ── 상수 ─────────────────────────────────────────────
export const NS = process.env.PALWORLD_NAMESPACE || "palworld";
export const DEPLOY = process.env.PALWORLD_DEPLOY || "palworld-server";
export const CONFIGMAP = process.env.PALWORLD_CONFIGMAP || "palworld-env-config";
export const CRONJOB = process.env.PALWORLD_CRONJOB || "palworld-update";

// ── 클라이언트 (in-cluster 우선, 로컬은 kubeconfig fallback) ──
function kc(): k8s.KubeConfig {
  const c = new k8s.KubeConfig();
  try {
    c.loadFromCluster();
  } catch {
    c.loadFromDefault();
  }
  return c;
}
const core = () => kc().makeApiClient(k8s.CoreV1Api);
const apps = () => kc().makeApiClient(k8s.AppsV1Api);
const batch = () => kc().makeApiClient(k8s.BatchV1Api);

// ── 타입 ─────────────────────────────────────────────
export interface ServerStatus {
  image: string;
  imageTag: string;
  gameVersion: string | null;
  replicas: { desired: number; ready: number };
  resources: {
    limits: { cpu?: string; memory?: string };
    requests: { cpu?: string; memory?: string };
  };
  pods: {
    name: string;
    phase: string;
    ready: boolean;
    restarts: number;
    startedAt: string | null;
    node: string | null;
  }[];
  updateOnBoot: string | null;
  serverName: string | null;
}

export interface UpdateJob {
  name: string;
  active: number;
  succeeded: number;
  failed: number;
  startTime: string | null;
  completionTime: string | null;
  status: "running" | "succeeded" | "failed" | "unknown";
}

// ── 서버 상태 ─────────────────────────────────────────
export async function getServerStatus(): Promise<ServerStatus> {
  const [dep, cm, podList] = await Promise.all([
    apps().readNamespacedDeployment({ name: DEPLOY, namespace: NS }),
    core().readNamespacedConfigMap({ name: CONFIGMAP, namespace: NS }).catch(() => null),
    core().listNamespacedPod({ namespace: NS, labelSelector: "app.kubernetes.io/name=palworld" }).catch(() => null),
  ]);

  const container = dep.spec?.template?.spec?.containers?.[0];
  const image = container?.image || "";
  const imageTag = image.includes(":") ? image.split(":").pop()! : "latest";
  const res = container?.resources || {};

  // 라벨 셀렉터가 안 맞을 수 있어 이름 prefix 로도 보강
  let pods = podList?.items || [];
  if (pods.length === 0) {
    const all = await core().listNamespacedPod({ namespace: NS }).catch(() => null);
    pods = (all?.items || []).filter((p) => p.metadata?.name?.startsWith(`${DEPLOY}-`));
  }

  const podInfo = pods.map((p) => {
    const cs = p.status?.containerStatuses?.[0];
    return {
      name: p.metadata?.name || "",
      phase: p.status?.phase || "Unknown",
      ready: cs?.ready ?? false,
      restarts: cs?.restartCount ?? 0,
      startedAt: p.status?.startTime ? new Date(p.status.startTime).toISOString() : null,
      node: p.spec?.nodeName || null,
    };
  });

  // 게임 버전: 실행 중인 파드 로그에서 best-effort 파싱
  let gameVersion: string | null = null;
  const running = pods.find((p) => p.status?.phase === "Running");
  if (running?.metadata?.name) {
    try {
      const log = await core().readNamespacedPodLog({
        name: running.metadata.name,
        namespace: NS,
        container: "server",
        tailLines: 400,
      });
      const m = log.match(/Game version is\s+(v[\d.]+)/i);
      if (m) gameVersion = m[1];
    } catch {
      /* 로그 접근 실패 시 무시 */
    }
  }

  const data = cm?.data || {};
  return {
    image,
    imageTag,
    gameVersion,
    replicas: {
      desired: dep.spec?.replicas ?? 0,
      ready: dep.status?.readyReplicas ?? 0,
    },
    resources: {
      limits: { cpu: res.limits?.cpu, memory: res.limits?.memory },
      requests: { cpu: res.requests?.cpu, memory: res.requests?.memory },
    },
    pods: podInfo,
    updateOnBoot: data.UPDATE_ON_BOOT ?? null,
    serverName: data.SERVER_NAME ?? null,
  };
}

// ── 실행 중인 서버 파드 IP (REST API 8212 직접 호출용, Service 미노출) ──
export async function getServerPodIP(): Promise<string | null> {
  const podList = await core()
    .listNamespacedPod({ namespace: NS, labelSelector: "app.kubernetes.io/name=palworld" })
    .catch(() => null);

  // 라벨 셀렉터가 안 맞을 수 있어 이름 prefix 로도 보강 (getServerStatus 와 동일 로직)
  let pods = podList?.items || [];
  if (pods.length === 0) {
    const all = await core().listNamespacedPod({ namespace: NS }).catch(() => null);
    pods = (all?.items || []).filter((p) => p.metadata?.name?.startsWith(`${DEPLOY}-`));
  }

  const running = pods.find((p) => p.status?.phase === "Running");
  return running?.status?.podIP || null;
}

// ── 설정 configmap ────────────────────────────────────
export async function getConfigMap(): Promise<Record<string, string>> {
  const cm = await core().readNamespacedConfigMap({ name: CONFIGMAP, namespace: NS });
  return cm.data || {};
}

// ── 업데이트 Job 목록/상태 ────────────────────────────
function jobStatus(j: k8s.V1Job): UpdateJob["status"] {
  const s = j.status || {};
  if ((s.succeeded ?? 0) > 0) return "succeeded";
  if ((s.failed ?? 0) > 0) return "failed";
  if ((s.active ?? 0) > 0) return "running";
  return "unknown";
}

export async function listUpdateJobs(): Promise<UpdateJob[]> {
  const list = await batch().listNamespacedJob({
    namespace: NS,
    labelSelector: "app=palworld-update",
  });
  return (list.items || [])
    .map((j) => ({
      name: j.metadata?.name || "",
      active: j.status?.active ?? 0,
      succeeded: j.status?.succeeded ?? 0,
      failed: j.status?.failed ?? 0,
      startTime: j.status?.startTime ? new Date(j.status.startTime).toISOString() : null,
      completionTime: j.status?.completionTime ? new Date(j.status.completionTime).toISOString() : null,
      status: jobStatus(j),
    }))
    .sort((a, b) => (b.startTime || "").localeCompare(a.startTime || ""));
}

// ── 업데이트 트리거 (cronjob → job) ───────────────────
export async function triggerUpdate(): Promise<{ jobName: string }> {
  const b = batch();
  const cj = await b.readNamespacedCronJob({ name: CRONJOB, namespace: NS });
  const tmpl = cj.spec?.jobTemplate?.spec;
  if (!tmpl) throw new Error(`CronJob ${CRONJOB} has no jobTemplate.spec`);

  // 이미 실행 중이면 거부 (concurrencyPolicy: Forbid 와 동일 취지)
  const existing = await listUpdateJobs();
  if (existing.some((j) => j.status === "running")) {
    throw new Error("이미 실행 중인 업데이트 Job 이 있습니다.");
  }

  const suffix = Date.now().toString(36);
  const jobName = `palworld-update-web-${suffix}`;
  const body: k8s.V1Job = {
    apiVersion: "batch/v1",
    kind: "Job",
    metadata: {
      name: jobName,
      namespace: NS,
      labels: { app: "palworld-update", "triggered-by": "palworld-admin" },
      annotations: { "cronjob.kubernetes.io/instantiate": "manual" },
      ownerReferences: [
        {
          apiVersion: "batch/v1",
          kind: "CronJob",
          name: cj.metadata!.name!,
          uid: cj.metadata!.uid!,
          controller: false,
          blockOwnerDeletion: false,
        },
      ],
    },
    spec: tmpl,
  };
  await b.createNamespacedJob({ namespace: NS, body });
  return { jobName };
}

// ── Job 로그 (해당 Job 의 파드 로그) ──────────────────
export async function getJobLogs(jobName: string, tailLines = 200): Promise<string> {
  const pods = await core().listNamespacedPod({
    namespace: NS,
    labelSelector: `job-name=${jobName}`,
  });
  const pod = pods.items?.[0];
  if (!pod?.metadata?.name) return "(파드를 찾을 수 없습니다 — 아직 생성 중이거나 정리됨)";
  try {
    return await core().readNamespacedPodLog({
      name: pod.metadata.name,
      namespace: NS,
      tailLines,
    });
  } catch (e) {
    return `(로그를 읽을 수 없습니다: ${(e as Error).message})`;
  }
}

// ── 리소스 스펙 (그래프 기준선용: cores / bytes) ──────
function parseCpu(s?: string): number | null {
  if (!s) return null;
  if (s.endsWith("m")) return parseInt(s, 10) / 1000;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
function parseMem(s?: string): number | null {
  if (!s) return null;
  const units: Record<string, number> = {
    Ki: 1024, Mi: 1024 ** 2, Gi: 1024 ** 3, Ti: 1024 ** 4,
    K: 1e3, M: 1e6, G: 1e9, T: 1e12,
  };
  const m = s.match(/^(\d+(?:\.\d+)?)([A-Za-z]+)?$/);
  if (!m) return null;
  const val = Number(m[1]);
  const unit = m[2];
  return unit && units[unit] ? val * units[unit] : val;
}

export interface ResourceSpec {
  limits: { cpuCores: number | null; memBytes: number | null };
  requests: { cpuCores: number | null; memBytes: number | null };
}

export async function getResourceSpec(): Promise<ResourceSpec> {
  const dep = await apps().readNamespacedDeployment({ name: DEPLOY, namespace: NS });
  const r = dep.spec?.template?.spec?.containers?.[0]?.resources || {};
  return {
    limits: { cpuCores: parseCpu(r.limits?.cpu), memBytes: parseMem(r.limits?.memory) },
    requests: { cpuCores: parseCpu(r.requests?.cpu), memBytes: parseMem(r.requests?.memory) },
  };
}
