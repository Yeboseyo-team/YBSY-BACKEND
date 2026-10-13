import { Bar, BarChart, Cell, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Forecast, Weather } from "@/features/forecast/calc";
import { LEVEL_STYLE } from "./data";

interface Props {
  forecast: Forecast;
  /** 사전 검토 중이면 추가 후 예보. 늘어난 부분을 빗금으로 겹쳐 보여 줍니다 (FR-06-2) */
  preview: Forecast | null;
  availableHours: number;
  currentWeek: number | null;
  selectedWeek: number;
  onSelectWeek: (week: number) => void;
}

const LEVELS: Weather[] = ["clear", "cloudy", "storm"];

export function ForecastChart({ forecast, preview, availableHours, currentWeek, selectedWeek, onSelectWeek }: Props) {
  const shown = preview ?? forecast;
  const data = shown.weeks.map((w, i) => {
    const before = forecast.weeks[i].total_hours;
    const added = Math.round((w.total_hours - before) * 10) / 10;
    return {
      week: w.week,
      base: preview ? before : w.total_hours,
      // 늘어나지 않는 주는 null 로 둬서 툴팁에 "추가 0시간"이 뜨지 않게
      added: preview && added > 0 ? added : null,
      total: w.total_hours,
      ratio: w.ratio,
      level: w.level,
      exam: w.is_exam_week,
    };
  });
  const maxY = Math.ceil((Math.max(availableHours, ...data.map((d) => d.total)) * 1.1) / 10) * 10;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 8, left: -16, bottom: 4 }} barCategoryGap="18%">
          <defs>
            {LEVELS.map((level) => (
              <pattern key={level} id={`stripe-${level}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="6" height="6" fill={LEVEL_STYLE[level].color} opacity={0.25} />
                <line x1="0" y1="0" x2="0" y2="6" stroke={LEVEL_STYLE[level].color} strokeWidth="3" />
              </pattern>
            ))}
          </defs>
          <XAxis
            dataKey="week"
            tickLine={false}
            axisLine={false}
            interval={0}
            tick={(props: { x: number | string; y: number | string; payload: { value: number } }) => {
              const week = props.payload.value;
              const isCurrent = week === currentWeek;
              return (
                <g transform={`translate(${props.x},${props.y})`}>
                  <text dy={12} textAnchor="middle" fontSize={11} fontWeight={isCurrent ? 700 : 400} fill={isCurrent ? "var(--primary)" : "var(--muted-foreground)"}>
                    {week}
                  </text>
                  {isCurrent && <circle cy={20} r={2.5} fill="var(--primary)" />}
                </g>
              );
            }}
          />
          <YAxis tickLine={false} axisLine={false} fontSize={11} domain={[0, maxY]} />
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            formatter={(value, name) => [`${value}시간`, name === "added" ? "추가되는 시간" : "기존 시간"]}
            labelFormatter={(week) => `${week}주차`}
          />
          <ReferenceLine
            y={availableHours}
            stroke="var(--foreground)"
            strokeDasharray="5 4"
            label={{ value: `가용 ${availableHours}시간`, position: "insideTopLeft", fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <Bar dataKey="base" stackId="w" radius={preview ? 0 : [4, 4, 0, 0]} onClick={(_, index) => onSelectWeek(index + 1)} className="cursor-pointer">
            {data.map((d) => (
              <Cell
                key={d.week}
                fill={LEVEL_STYLE[d.level].color}
                fillOpacity={selectedWeek === d.week ? 1 : 0.82}
                stroke={selectedWeek === d.week ? "var(--foreground)" : "none"}
                strokeWidth={2}
              />
            ))}
          </Bar>
          {preview && (
            <Bar dataKey="added" stackId="w" radius={[4, 4, 0, 0]} onClick={(_, index) => onSelectWeek(index + 1)} className="cursor-pointer">
              {data.map((d) => (
                <Cell key={d.week} fill={`url(#stripe-${d.level})`} stroke={LEVEL_STYLE[d.level].color} strokeWidth={1} />
              ))}
            </Bar>
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
