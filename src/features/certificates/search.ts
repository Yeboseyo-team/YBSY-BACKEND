// 자격증 검색·묶기 — 기준: 요구사항 명세서 F-04 (DB 호출 없음)
import type { Certificate } from "@/types/database";
import { applyStatus, daysUntil, type ApplyStatus } from "@/features/forecast/calc";

export interface CertificateRound {
  certificate: Certificate;
  status: ApplyStatus;
  /** 접수 마감까지 남은 날 (지났으면 음수) */
  apply_dday: number;
  /** 시험까지 남은 날 */
  exam_dday: number;
  /** 접수 마감된 회차는 고를 수 없음 (FR-04-2) */
  selectable: boolean;
}

export interface CertificateGroup {
  name: string;
  rounds: CertificateRound[];
}

/** 검색어 정리: 앞뒤 공백·중간 공백을 무시하고 영문은 대소문자 구분 없이 */
const normalize = (s: string) => s.replace(/\s+/g, "").toLowerCase();

/**
 * 이름 부분 일치 검색 후 자격증 이름별로 묶어 돌려줍니다 (FR-04-1, FR-04-2).
 * "정보처리" → 정보처리기사·정보처리산업기사. 빈 검색어면 전체.
 * 회차는 시험일 순, 묶음은 이름 순입니다.
 */
export function searchCertificates(certificates: Certificate[], query: string, today: string): CertificateGroup[] {
  const q = normalize(query);
  const groups = new Map<string, CertificateRound[]>();
  for (const certificate of certificates) {
    if (q && !normalize(certificate.name).includes(q)) continue;
    const status = applyStatus(certificate, today);
    const round: CertificateRound = {
      certificate,
      status,
      apply_dday: daysUntil(certificate.apply_end, today),
      exam_dday: daysUntil(certificate.exam_date, today),
      selectable: status !== "closed",
    };
    groups.set(certificate.name, [...(groups.get(certificate.name) ?? []), round]);
  }
  return [...groups.entries()]
    .map(([name, rounds]) => ({
      name,
      rounds: rounds.sort((a, b) => a.certificate.exam_date.localeCompare(b.certificate.exam_date)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
}
