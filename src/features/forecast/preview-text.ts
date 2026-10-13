import type { Forecast } from "./calc";

/** 받침이 있으면 "을", 없으면 "를" (한글이 아니면 "을(를)") */
export function objectParticle(word: string): string {
  const code = word.trim().charCodeAt(word.trim().length - 1);
  if (code < 0xac00 || code > 0xd7a3) return "을(를)";
  return (code - 0xac00) % 28 === 0 ? "를" : "을";
}

export const peakHours = (f: Forecast) => Math.max(...f.weeks.map((w) => w.total_hours));

/**
 * 사전 검토 제목과 한 줄 설명 (FR-06-3).
 * mode: add 계획 추가 / edit 계획 수정
 */
export function describePreview(
  before: Forecast,
  after: Forecast,
  label: string,
  mode: "add" | "edit",
): { title: string; detail: string } {
  const verb = mode === "add" ? "더하면" : "바꾸면";
  const subject = `${label}${objectParticle(label)} ${verb}`;
  const b = before.summary;
  const a = after.summary;

  const newStorm = after.weeks.filter((w, i) => w.level === "storm" && before.weeks[i].level !== "storm").map((w) => w.week);
  const peakBefore = peakHours(before);
  const peakAfter = peakHours(after);
  const peakText =
    peakBefore === peakAfter ? `가장 바쁜 주는 ${peakAfter}시간 그대로예요.` : `가장 바쁜 주는 ${peakBefore}시간에서 ${peakAfter}시간이 돼요.`;
  const detail = newStorm.length > 0 ? `${newStorm.join(", ")}주차가 새로 폭풍이 돼요. ${peakText}` : peakText;

  let title: string;
  if (b.clear > 0 && a.clear === 0) title = `${subject} 맑은 주가 사라져요`;
  else if (a.storm > b.storm) title = `${subject} 폭풍이 ${b.storm}주에서 ${a.storm}주로 늘어요`;
  else if (a.storm < b.storm) title = `${subject} 폭풍이 ${b.storm}주에서 ${a.storm}주로 줄어요`;
  else if (a.cloudy !== b.cloudy)
    title = `${subject} 흐린 주가 ${b.cloudy}주에서 ${a.cloudy}주로 ${a.cloudy > b.cloudy ? "늘어요" : "줄어요"}`;
  else title = `${mode === "add" ? "더해도" : "바꿔도"} 단계는 그대로예요`;

  return { title, detail };
}
