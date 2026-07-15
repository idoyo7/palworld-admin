import { NextResponse } from "next/server";
import { getConfigMap } from "@/lib/k8s";
import {
  SETTINGS_REFERENCE,
  SETTING_CATEGORIES,
} from "@/lib/settings-reference";
import { isNonDefault } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 레퍼런스에 없고, 화면에 굳이 안 보여도 되는 인프라/시크릿성 키
const HIDE_KEYS = new Set([
  "PUID",
  "PGID",
  "BAN_LIST_URL",
  "DISABLE_GENERATE_SETTINGS",
  "ACTIVE_UNKO",
]);

export async function GET() {
  try {
    const cm = await getConfigMap();
    const known = new Set(SETTINGS_REFERENCE.map((s) => s.envKey));

    const groups = SETTING_CATEGORIES.map((cat) => ({
      category: cat,
      items: SETTINGS_REFERENCE.filter((s) => s.category === cat).map((s) => {
        const currentValue = cm[s.envKey] ?? "";
        return {
          ...s,
          currentValue,
          nonDefault: isNonDefault(currentValue, s.defaultValue, s.type),
        };
      }),
    }));

    // 레퍼런스에 없는 나머지 키 → 운영/네트워크 등 (현재값만)
    const others = Object.entries(cm)
      .filter(([k]) => !known.has(k) && !HIDE_KEYS.has(k))
      .map(([envKey, currentValue]) => ({ envKey, currentValue }))
      .sort((a, b) => a.envKey.localeCompare(b.envKey));

    return NextResponse.json({ groups, others });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
