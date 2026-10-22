// 사전 검토 (S-11, F-06) — 저장하지 않은 계획·자격증 회차를 더했을 때의 예보를 계산하고 문구를 만듭니다.
// 계산은 calc.ts 의 함수만 쓰고, 서버는 부르지 않습니다 (FR-06-1, NFR-PERF-2).
import {
  previewDraft,
  type Forecast,
  type ForecastCertificate,
  type ForecastDraft,
  type ForecastInput,
  type ForecastPlan,
  type PreviewDiff,
  type Weather,
} from "@/features/forecast/calc";

/** 시트에 넘기는 '추가할 것' */
export type PreviewDraft =
  | {
      kind: "plan";
      plan: ForecastPlan;
      /** 계획 수정이면 바꿀 계획의 id (없으면 새로 추가) */
      replacePlanId?: string;
    }
  | {
      kind: "certificate";
      certificate: ForecastCertificate;
      prep_weeks: number;
      study_hours: number;
      /** 같은 자격증의 다른 회차로 바꾸는 경우 빠질 회차 id */
      replaceCertificateId?: string;
    };

export interface PreviewResult {
  before: Forecast;
  after: Forecast;
  diff: PreviewDiff;
}

/** 시트의 draft 를 calc.ts 의 previewDraft 입력으로 바꿔 계산합니다 */
export function buildPreview(input: ForecastInput, draft: PreviewDraft): PreviewResult {
  const change: ForecastDraft =
    draft.kind === "plan"
      ? { addPlans: [draft.plan], removePlanIds: draft.replacePlanId ? [draft.replacePlanId] : [] }
      : {
          addCertificates: [{ certificate_id: draft.certificate.id, prep_weeks: draft.prep_weeks, study_hours: draft.study_hours }],
          removeCertificateIds: draft.replaceCertificateId ? [draft.replaceCertificateId] : [],
        };
  // 회차 정보가 input 에 없으면(예: 목록에 아직 없는 회차) 같이 넣어 줌
  const certificates =
    draft.kind === "certificate" && !input.certificates.some((c) => c.id === draft.certificate.id)
      ? [...input.certificates, draft.certificate]
      : input.certificates;
  return previewDraft({ ...input, certificates }, change);
}

/** 받침에 따라 조사 고르기. 한글로 안 끝나면 "을(를)" 처럼 둘 다 */
function josa(word: string, withBatchim: string, withoutBatchim: string): string {
  const code = word.trim().charCodeAt(word.trim().length - 1) - 0xac00;
  if (code < 0 || code > 11171) return `${word}${withBatchim}(${withoutBatchim})`;
  return `${word}${code % 28 ? withBatchim : withoutBatchim}`;
}

export const peakHours = (f: Forecast) => Math.max(0, ...f.weeks.map((w) => w.total_hours));

/** add: 계획·회차 추가 / edit: 계획 수정 / switch: 같은 자격증의 다른 회차로 바꾸기 */
export type PreviewMode = "add" | "edit" | "switch";

export function previewModeOf(draft: PreviewDraft | null): PreviewMode {
  if (draft?.kind === "plan") return draft.replacePlanId ? "edit" : "add";
  return draft?.replaceCertificateId ? "switch" : "add";
}

/** 시트 제목 한 줄 (디자인 PcPlan: "운영체제를 더하면 맑은 주가 사라져요") */
export function previewHeadline(label: string, { before, after }: PreviewResult, mode: PreviewMode): string {
  const subject =
    mode === "switch" ? "이 회차로 바꾸면" : `${josa(label, "을", "를")} ${mode === "add" ? "더하면" : "바꾸면"}`;
  const b = before.summary;
  const a = after.summary;
  if (a.storm > b.storm) return `${subject} 폭풍 주가 늘어요`;
  if (a.storm < b.storm) return `${subject} 폭풍 주가 줄어요`;
  if (b.clear > 0 && a.clear === 0) return `${subject} 맑은 주가 사라져요`;
  if (a.cloudy > b.cloudy) return `${subject} 흐린 주가 늘어요`;
  if (a.cloudy < b.cloudy) return `${subject} 흐린 주가 줄어요`;
  return `${mode === "add" ? "더해도" : "바꿔도"} 날씨 단계는 그대로예요`;
}

/** 단계별 주 수 변화 (폭풍 → 흐림 → 맑음 순서) */
export function levelChanges({ before, after }: PreviewResult): { level: Weather; before: number; after: number }[] {
  return (["storm", "cloudy", "clear"] as const).map((level) => ({
    level,
    before: before.summary[level],
    after: after.summary[level],
  }));
}
