// 사전 검토 계산 (F-06) — 저장하지 않은 계획·자격증을 더했을 때의 예보. 서버 호출 없이 calc.ts 만 씁니다 (NFR-PERF-2).
import {
  calculateForecast,
  comparePreview,
  previewForecast,
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

/** input.plans 에는 실제 Plan 행이 들어 있어서 id 로 바꿀 계획을 찾을 수 있어요. 순서는 그대로 둬요. */
function replacePlan(plans: ForecastPlan[], id: string, next: ForecastPlan): ForecastPlan[] {
  return plans.map((p) => ((p as ForecastPlan & { id?: string }).id === id ? next : p));
}

export function runPreview(input: ForecastInput, draft: PreviewDraft): PreviewResult {
  if (draft.kind === "plan") {
    if (!draft.replacePlanId) return previewForecast(input, [draft.plan]);
    const before = calculateForecast(input);
    const after = calculateForecast({ ...input, plans: replacePlan(input.plans, draft.replacePlanId, draft.plan) });
    return { before, after, diff: comparePreview(before, after) };
  }

  const before = calculateForecast(input);
  const userCertificates = input.userCertificates
    .filter((uc) => uc.certificate_id !== draft.certificate.id && uc.certificate_id !== draft.replaceCertificateId)
    .concat({ certificate_id: draft.certificate.id, study_hours: draft.study_hours, prep_weeks: draft.prep_weeks });
  const certificates = input.certificates.some((c) => c.id === draft.certificate.id)
    ? input.certificates
    : [...input.certificates, draft.certificate];
  const after = calculateForecast({ ...input, userCertificates, certificates });
  return { before, after, diff: comparePreview(before, after) };
}

/** 가장 바쁜 주의 시간 */
export function peakHours(forecast: Forecast): number {
  return Math.max(0, ...forecast.weeks.map((w) => w.total_hours));
}
