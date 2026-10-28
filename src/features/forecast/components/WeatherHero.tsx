import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Weather, WeekForecast } from "../calc";
import { outlookText, WEATHER_ICON, WEATHER_SENTENCE } from "../outlook";
import { WEATHER_STYLE } from "../weather";

/** 날씨마다 카드 바탕·아이콘 색 (날씨 앱처럼 하늘색이 바뀌어요) */
const HERO_STYLE: Record<Weather, { card: string; icon: string }> = {
  storm: { card: "bg-ink", icon: "text-[#ffb4ae]" },
  cloudy: { card: "bg-[#4a5872]", icon: "text-[#ffd9a0]" },
  clear: { card: "bg-primary", icon: "text-[#ffe08a]" },
};

type Props = {
  weeks: WeekForecast[];
  /** 보여 줄 주 (이번 주, 학기 밖이면 1주차) */
  week: number;
  /** 오늘이 학기 안이면 "이번 주", 아니면 "개강 첫 주" 처럼 */
  label: string;
  /** "중간고사"·"기말고사" 또는 null */
  exam: string | null;
};

/**
 * 예보 화면 맨 위 큰 날씨 카드 (10/28) — 날씨 앱의 "지금 날씨" 자리.
 * 숫자(시간·%) 없이 날씨 이름과 한 줄 말로만 알려 줘요. 숫자는 아래 주차 상세에서 볼 수 있어요.
 * 휴대폰은 가운데 정렬 세로, PC 는 아이콘 왼쪽·글 오른쪽 가로.
 */
export function WeatherHero({ weeks, week, label, exam }: Props) {
  const current = weeks.find((w) => w.week === week) ?? weeks[0];
  const style = HERO_STYLE[current.level];
  const Icon = WEATHER_ICON[current.level];

  return (
    <section
      aria-labelledby="hero-title"
      className={cn(
        "grid justify-items-center gap-1 rounded-3xl px-5 py-6 text-center text-white",
        "lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center lg:justify-items-start lg:gap-x-6 lg:px-7 lg:text-left",
        style.card,
      )}
    >
      <Icon className={cn("size-14 lg:row-span-4 lg:size-16", style.icon)} strokeWidth={1.6} aria-hidden="true" />
      <p className="flex flex-wrap items-center justify-center gap-1.5 text-sm text-white/85 lg:justify-start">
        {label} · {week}주차
        {exam ? (
          <span className="inline-flex h-5 items-center gap-1 rounded-full bg-white/15 px-2 text-xs font-medium text-white">
            <Pencil className="size-3" aria-hidden="true" />
            {exam}
          </span>
        ) : null}
      </p>
      <h1 id="hero-title" className="text-4xl font-bold tracking-tight">
        {WEATHER_STYLE[current.level].label}
      </h1>
      <p className="max-w-md text-[15px] leading-relaxed">{WEATHER_SENTENCE[current.level]}</p>
      <p className="mt-1 text-[13px] text-white/80">{outlookText(weeks, current.week)}</p>
    </section>
  );
}
