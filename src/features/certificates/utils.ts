import type { ForecastCertificate, ForecastUserCertificate } from "@/features/forecast/calc";
import type { Certificate } from "@/types/database";
import type { CertificatePrepInput } from "./types";

const DAY_MS = 86_400_000;

/** 오늘 날짜 "YYYY-MM-DD" (사용자 기기 기준) */
export function todayIso(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 날짜까지 남은 날. 오늘이면 0, 지났으면 음수 */
export function daysUntil(date: string, today: string): number {
  return Math.round((Date.parse(date) - Date.parse(today)) / DAY_MS);
}

/** "D-3", "D-day", 지난 날은 "D+2" */
export function dDay(date: string, today: string): string {
  const n = daysUntil(date, today);
  return n === 0 ? "D-day" : n > 0 ? `D-${n}` : `D+${-n}`;
}

/** 접수 마감이 지났는지 (마감일 당일까지는 접수 가능, FR-04-2) */
export function isApplyClosed(cert: Pick<Certificate, "apply_end">, today: string): boolean {
  return daysUntil(cert.apply_end, today) < 0;
}

/** 검색 결과를 자격증 이름별로 묶고, 회차는 시험일 순으로 정렬합니다. */
export function groupByName(certs: Certificate[]): { name: string; rounds: Certificate[] }[] {
  const map = new Map<string, Certificate[]>();
  for (const cert of certs) map.set(cert.name, [...(map.get(cert.name) ?? []), cert]);
  return [...map.entries()].map(([name, rounds]) => ({
    name,
    rounds: [...rounds].sort((a, b) => a.exam_date.localeCompare(b.exam_date)),
  }));
}

/** 접수가 열려 있는 가장 가까운 회차 (없으면 undefined) */
export function nextOpenRound(rounds: Certificate[], today: string): Certificate | undefined {
  return rounds.find((r) => !isApplyClosed(r, today));
}

/** calc.ts 입력 형태로 나눕니다. */
export function toForecastCertificates(mine: CertificatePrepInput[]): {
  userCertificates: ForecastUserCertificate[];
  certificates: ForecastCertificate[];
} {
  return {
    userCertificates: mine.map(({ certificate_id, study_hours, prep_weeks }) => ({ certificate_id, study_hours, prep_weeks })),
    certificates: mine.map(({ certificate }) => ({ id: certificate.id, name: certificate.name, exam_date: certificate.exam_date })),
  };
}
