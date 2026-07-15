import type { SettingType } from "./settings-reference";

// "4.000000" → "4", "0.333333" → "0.33", "0.033333" → "0.033"
export function fmtNum(v: string): string {
  if (v === "" || v == null) return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return v;
  if (Number.isInteger(n)) return String(n);
  // 소수는 유효 자릿수 위주로 정리
  return String(Math.round(n * 1000) / 1000);
}

export function fmtValue(v: string, type: SettingType): string {
  if (v === "" || v == null) return "—";
  if (type === "float" || type === "int") return fmtNum(v);
  return v;
}

export function isNonDefault(current: string, def: string, type: SettingType): boolean {
  if (current === "" || def === "") return false;
  if (type === "float" || type === "int") {
    const a = Number(current);
    const b = Number(def);
    if (!Number.isNaN(a) && !Number.isNaN(b)) return Math.abs(a - b) > 1e-9;
  }
  return current.toLowerCase() !== def.toLowerCase();
}

// 현재값이 배수형(float)일 때 기본값 대비 몇 배인지 (표시용, 예: "×4")
export function multiplierLabel(current: string, def: string, type: SettingType): string | null {
  if (type !== "float") return null;
  const a = Number(current);
  const b = Number(def);
  if (Number.isNaN(a) || Number.isNaN(b) || b === 0) return null;
  const r = a / b;
  if (Math.abs(r - 1) < 1e-9) return null;
  const rounded = Math.round(r * 100) / 100;
  return `×${rounded}`;
}
