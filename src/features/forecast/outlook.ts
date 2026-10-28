// 날씨 앱처럼 보여 주는 예보 화면(10/28)의 문구 — 숫자 없이 말로만. 계산은 calc.ts 결과만 씁니다.
import { Cloud, CloudLightning, Sun, type LucideIcon } from "lucide-react";
import type { Certificate, UserCertificate } from "@/types/database";
import { daysUntil, type Weather, type WeekForecast } from "./calc";
import { WEATHER_STYLE } from "./weather";

/** 날씨 아이콘 (큰 카드·16주 예보에서 같이 씀) */
export const WEATHER_ICON: Record<Weather, LucideIcon> = { clear: Sun, cloudy: Cloud, storm: CloudLightning };

/** 큰 날씨 카드의 한 줄 설명 */
export const WEATHER_SENTENCE: Record<Weather, string> = {
  storm: "할 일이 쓸 수 있는 시간보다 많은 주예요. 몇 개는 다른 주로 옮겨 보세요.",
  cloudy: "쓸 수 있는 시간을 거의 다 쓰는 주예요. 새 일정은 신중하게 넣어 보세요.",
  clear: "여유 있는 주예요. 미뤄 둔 일을 하기 좋아요.",
};

/** 16주 목록의 짧은 말 (화면 낭독기용 이름에도 씀) */
export const WEATHER_SHORT: Record<Weather, string> = {
  storm: "많이 바빠요",
  cloudy: "조금 바빠요",
  clear: "여유 있어요",
};

/** 이 주가 시험 주간이면 "중간고사"·"기말고사" */
export function examOf(week: number, midtermWeek: number | null, finalWeek: number | null): "중간고사" | "기말고사" | null {
  if (week === midtermWeek) return "중간고사";
  if (week === finalWeek) return "기말고사";
  return null;
}

/**
 * 날씨 앱의 "내일·모레" 줄: "다음 주도 폭풍 · 10주차부터 흐림"
 * 다음 주와 같은 날씨가 끝나는 주를 찾아 덧붙여요. 마지막 주면 "이번 주가 마지막 주예요".
 */
export function outlookText(weeks: Pick<WeekForecast, "week" | "level">[], week: number): string {
  const now = weeks.find((w) => w.week === week);
  const next = weeks.find((w) => w.week === week + 1);
  if (!now || !next) return "이번 주가 마지막 주예요";
  const head = `다음 주${next.level === now.level ? "도" : "는"} ${WEATHER_STYLE[next.level].label}`;
  const change = weeks.find((w) => w.week > next.week && w.level !== next.level);
  return change ? `${head} · ${change.week}주차부터 ${WEATHER_STYLE[change.level].label}` : `${head} · 학기 끝까지`;
}

/** week 다음 주부터 처음 나오는 그 날씨의 주 (없으면 null) */
export function nextWeekWith(weeks: Pick<WeekForecast, "week" | "level">[], week: number, level: Weather): number | null {
  return weeks.find((w) => w.week > week && w.level === level)?.week ?? null;
}

/** 내가 고른 자격증 중 시험일이 가장 가까운 것 (오늘 포함, 지난 시험은 빼요) */
export function nextCertificateExam(
  userCertificates: Pick<UserCertificate, "certificate_id">[],
  certificates: Pick<Certificate, "id" | "name" | "exam_date">[],
  today: string,
): { name: string; days: number } | null {
  const mine = new Set(userCertificates.map((u) => u.certificate_id));
  return (
    certificates
      .filter((c) => mine.has(c.id))
      .map((c) => ({ name: c.name, days: daysUntil(c.exam_date, today) }))
      .filter((c) => c.days >= 0)
      .sort((a, b) => a.days - b.days)[0] ?? null
  );
}
