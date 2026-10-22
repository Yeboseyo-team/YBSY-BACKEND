// 맑음·흐림·폭풍 화면 표시 (FR-05-2: 색 + 이름으로 구분). 사전 검토 시트(S-11)에서도 같이 씁니다.
import type { Weather } from "./calc";

export const WEATHER_ORDER: Weather[] = ["storm", "cloudy", "clear"];

export const WEATHER_STYLE: Record<Weather, { label: string; fill: string; dot: string; text: string; badge: string }> = {
  clear: { label: "맑음", fill: "fill-clear", dot: "bg-clear", text: "text-clear", badge: "bg-clear/10 text-[#1f6e4a]" },
  cloudy: { label: "흐림", fill: "fill-caution", dot: "bg-caution", text: "text-[#9a5b00]", badge: "bg-caution/15 text-[#8a5200]" },
  storm: { label: "폭풍", fill: "fill-storm", dot: "bg-storm", text: "text-storm", badge: "bg-storm/10 text-[#a82e27]" },
};

/** 57 → "57", 34.5 → "34.5" (명세서 4.4: 소수점 첫째 자리까지) */
export function formatHours(hours: number): string {
  return Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
}

/** FR-05-3 요약 문구: "폭풍 2주 · 흐림 3주" (없으면 맑음 주 수) */
export function summaryText(summary: Record<Weather, number>): string {
  const parts = [];
  if (summary.storm > 0) parts.push(`폭풍 ${summary.storm}주`);
  if (summary.cloudy > 0) parts.push(`흐림 ${summary.cloudy}주`);
  return parts.length > 0 ? parts.join(" · ") : `맑음 ${summary.clear}주`;
}
