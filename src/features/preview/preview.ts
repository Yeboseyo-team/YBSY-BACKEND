// 사전 검토 (F-06) — 시트가 넘겨받는 draft 를 calc.ts 의 previewDraft 입력으로 바꿔 줍니다.
// 계산 자체는 calc.ts 한 곳에서만 해요. 서버 호출 없음 (NFR-PERF-2).
import {
  previewDraft,
  type Forecast,
  type ForecastCertificate,
  type ForecastInput,
  type ForecastPlan,
  type PreviewDiff,
} from "@/features/forecast/calc";

export type PreviewDraft =
  | {
      kind: "plan";
      plan: ForecastPlan;
      /** 수정 화면: 이 id 의 계획을 draft 로 바꿔서 비교 */
      replacePlanId?: string;
    }
  | {
      kind: "certificate";
      certificate: ForecastCertificate;
      study_hours: number;
      prep_weeks: number;
      /** 같은 자격증의 다른 회차로 바꾸는 경우 예전 회차 id */
      replaceCertificateId?: string;
    };

export interface PreviewResult {
  before: Forecast;
  after: Forecast;
  diff: PreviewDiff;
}

export function runPreview(input: ForecastInput, draft: PreviewDraft): PreviewResult {
  if (draft.kind === "plan") {
    return previewDraft(input, {
      addPlans: [draft.plan],
      removePlanIds: draft.replacePlanId ? [draft.replacePlanId] : [],
    });
  }

  // previewDraft 는 input.certificates 에 그 회차가 있어야 해서, 없으면 넣어 줘요.
  const certificates = input.certificates.some((c) => c.id === draft.certificate.id)
    ? input.certificates
    : [...input.certificates, draft.certificate];
  return previewDraft(
    { ...input, certificates },
    {
      addCertificates: [{ certificate_id: draft.certificate.id, study_hours: draft.study_hours, prep_weeks: draft.prep_weeks }],
      removeCertificateIds: draft.replaceCertificateId ? [draft.replaceCertificateId] : [],
    },
  );
}

/** 가장 바쁜 주의 시간 */
export function peakHours(forecast: Forecast): number {
  return Math.max(0, ...forecast.weeks.map((w) => w.total_hours));
}
