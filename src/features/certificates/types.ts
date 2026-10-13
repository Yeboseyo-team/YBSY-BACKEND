import type { Certificate } from "@/types/database";

/**
 * 내가 고른 회차 + 회차 정보. calc.ts에는 toForecastCertificates()로 바꿔 넘깁니다.
 */
export type CertificatePrepInput = {
  certificate_id: string;
  study_hours: number;
  prep_weeks: number;
  certificate: Certificate;
};
