// 예보 달력의 자격증 일정 (10/27 피드백: 일반 캘린더처럼 접수·시험 날짜를 칸에 표시). DB 호출 없음
import type { Certificate } from "@/types/database";

export type CertEventKind = "apply_start" | "apply_end" | "exam";

export interface CertEvent {
  date: string;
  kind: CertEventKind;
  /** 자격증 이름 (예: "SQLD") */
  name: string;
  /** 회차 (예: "제60회") */
  round: string;
}

export const CERT_EVENT_LABEL: Record<CertEventKind, string> = {
  apply_start: "접수 시작",
  apply_end: "접수 마감",
  exam: "시험",
};

/** 달력 칸처럼 좁은 곳에 쓰는 짧은 말 (이름 앞에 붙여 잘려도 종류가 보이게) */
export const CERT_EVENT_SHORT: Record<CertEventKind, string> = {
  apply_start: "접수",
  apply_end: "마감",
  exam: "시험",
};

/** 고른 자격증 회차의 접수 시작·접수 마감·시험일 (날짜 순, 같은 날은 시험 → 마감 → 시작) */
export function certificateEvents(certificates: Pick<Certificate, "name" | "round" | "apply_start" | "apply_end" | "exam_date">[]): CertEvent[] {
  const order: Record<CertEventKind, number> = { exam: 0, apply_end: 1, apply_start: 2 };
  return certificates
    .flatMap((c) => [
      { date: c.apply_start, kind: "apply_start" as const, name: c.name, round: c.round },
      { date: c.apply_end, kind: "apply_end" as const, name: c.name, round: c.round },
      { date: c.exam_date, kind: "exam" as const, name: c.name, round: c.round },
    ])
    .filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date))
    .sort((a, b) => a.date.localeCompare(b.date) || order[a.kind] - order[b.kind]);
}

/** "2026-10" 처럼 from 부터 to 까지 빠짐없이 (from ≤ to) */
export function monthsBetween(from: string, to: string): string[] {
  const out: string[] = [];
  let [y, m] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  while (y < ty || (y === ty && m <= tm)) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}
