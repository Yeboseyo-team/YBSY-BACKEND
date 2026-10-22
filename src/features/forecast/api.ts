// 예보 화면 데이터 훅 (S-08, F-05) — 프로필·계획·내 자격증·회차를 한 번에 불러와 calc.ts 로 계산합니다.
// 계산은 calc.ts 만 씁니다. 계획·자격증을 저장하면 각 캐시가 바뀌어 여기 값도 바로 다시 계산돼요 (FR-02-3).
import { useMemo } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { useProfile } from "@/features/auth/api";
import { isOnboardingDone } from "@/features/auth/onboarding";
import { useCertificates, useMyCertificates } from "@/features/certificates/api";
import { usePlans } from "@/features/plans/api";
import {
  calculateForecast,
  semesterWeekOf,
  todayInKorea,
  upcomingDeadlines,
  type DeadlineAlert,
  type Forecast,
  type ForecastInput,
} from "./calc";
import type { Certificate, Plan, Profile, UserCertificate } from "@/types/database";

export type ForecastDataStatus =
  /** 불러오는 중 → 화면 틀(스켈레톤)을 먼저 보여 주세요 (6.1) */
  | "loading"
  /** 불러오기 실패 → 다시 시도 버튼 (refetch) */
  | "error"
  /** 학기 설정·동의 전 → 온보딩으로 (가드가 먼저 막지만 안전장치) */
  | "needs-onboarding"
  /** 계획·자격증이 하나도 없음 → 빈 상태 "계획을 추가하면 예보가 나타납니다" (FR-05-6) */
  | "empty"
  | "ready";

export interface ForecastData {
  status: ForecastDataStatus;
  profile: Profile | null;
  plans: Plan[];
  userCertificates: UserCertificate[];
  certificates: Certificate[];
  /** 학기 16주 예보 (status 가 "ready"·"empty" 일 때) */
  forecast: Forecast | null;
  /** 사전 검토(previewForecast)·회차 추천(recommendRounds)에 그대로 넘길 입력 */
  input: ForecastInput | null;
  /** 7일 안에 접수 마감되는 내 회차 → 홈 배너 (F-07 화면 알림) */
  deadlines: DeadlineAlert[];
  /** 오늘이 학기 몇 주차인지 (범위 밖이면 null) → 그래프 강조 (FR-05-5) */
  currentWeek: number | null;
  /** 오늘 (한국 날짜) */
  today: string;
  /** 실패했을 때 다시 불러오기 */
  refetch: () => void;
}

export function useForecastData(): ForecastData {
  const { user } = useAuth();
  const profileQuery = useProfile(user?.id);
  const plansQuery = usePlans();
  const mineQuery = useMyCertificates();
  const certificatesQuery = useCertificates();
  const today = todayInKorea();

  const queries = [profileQuery, plansQuery, mineQuery, certificatesQuery];
  const isLoading = queries.some((q) => q.isPending);
  const isError = queries.some((q) => q.isError);

  const profile = profileQuery.data ?? null;
  const plans = useMemo(() => plansQuery.data ?? [], [plansQuery.data]);
  const userCertificates = useMemo(() => mineQuery.data ?? [], [mineQuery.data]);
  const certificates = useMemo(() => certificatesQuery.data ?? [], [certificatesQuery.data]);
  const ready = !isLoading && !isError && isOnboardingDone(profile);

  const computed = useMemo(() => {
    if (!ready || !profile) return { forecast: null, input: null };
    const input: ForecastInput = { profile, plans, userCertificates, certificates };
    return { forecast: calculateForecast(input), input };
  }, [ready, profile, plans, userCertificates, certificates]);

  const deadlines = useMemo(
    () => (ready ? upcomingDeadlines(userCertificates, certificates, today) : []),
    [ready, userCertificates, certificates, today],
  );

  const status: ForecastDataStatus = isLoading
    ? "loading"
    : isError
      ? "error"
      : !isOnboardingDone(profile)
        ? "needs-onboarding"
        : plans.length === 0 && userCertificates.length === 0
          ? "empty"
          : "ready";

  return {
    status,
    profile,
    plans,
    userCertificates,
    certificates,
    forecast: computed.forecast,
    input: computed.input,
    deadlines,
    currentWeek: profile?.semester_start ? semesterWeekOf(today, profile.semester_start) : null,
    today,
    refetch: () => queries.forEach((q) => void q.refetch()),
  };
}
