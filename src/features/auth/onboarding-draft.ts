// 온보딩 1단계에서 AI 가 만든 초안을 2단계로 넘기는 곳 (10/27 온보딩 개편).
// 2단계에서 [이대로 예보 시작]을 누르기 전까지는 저장하지 않아요. 새로고침해도 남도록 세션 저장소에 둬요.
import type { DraftCertificate, DraftPlan } from "@/features/plans/ai";

export interface OnboardingHandoff {
  plans: DraftPlan[];
  certificates: DraftCertificate[];
  /** AI 가 무엇을 보고 정했는지 */
  reason: string | null;
  /** AI 초안을 못 만들었을 때 안내 */
  error: string | null;
}

const KEY = "hakgi-yebo:onboarding-draft";

export function saveOnboardingDraft(handoff: OnboardingHandoff) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(handoff));
  } catch {
    // 저장소를 못 쓰면 2단계에서 빈 목록으로 시작해요
  }
}

export function loadOnboardingDraft(): OnboardingHandoff | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OnboardingHandoff>;
    return {
      plans: Array.isArray(parsed.plans) ? parsed.plans : [],
      certificates: Array.isArray(parsed.certificates) ? parsed.certificates : [],
      reason: typeof parsed.reason === "string" ? parsed.reason : null,
      error: typeof parsed.error === "string" ? parsed.error : null,
    };
  } catch {
    return null;
  }
}

export function clearOnboardingDraft() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // 무시
  }
}

/** 온보딩 2단계 경로 (시간표 화면 등에서 돌아올 곳) */
export const ONBOARDING_PLANS_PATH = "/start/plans";
