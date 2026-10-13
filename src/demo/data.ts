// 데모 화면(/demo)용 데이터 — 목업(src/mocks/dummy-data.ts) + 실제 산출 모듈(calc.ts)
// 로그인·DB 없이 서비스 흐름을 눌러 보기 위한 확인용 코드입니다. main 에 합치지 않습니다.
import {
  calculateForecast,
  certificatePrepRange,
  comparePreview,
  isSemesterReady,
  weekOf,
  type CertificatePrepRange,
  type Forecast,
  type PreviewDiff,
  type Weather,
} from "@/features/forecast/calc";
import {
  DEMO_TODAY,
  certificates,
  demoUsers,
  plans,
  previewPlan,
  profiles,
  userCertificates,
  type Certificate,
  type Plan,
  type PlanInput,
  type Profile,
} from "@/mocks/dummy-data";

export { DEMO_TODAY, previewPlan };

export const LEVEL_STYLE: Record<Weather, { text: string; level: string; icon: string; color: string }> = {
  clear: { text: "맑음", level: "여유", icon: "☀️", color: "var(--clear)" },
  cloudy: { text: "흐림", level: "주의", icon: "☁️", color: "var(--caution)" },
  storm: { text: "폭풍", level: "과부하", icon: "⛈️", color: "var(--storm)" },
};

export const PLAN_TYPE_LABEL: Record<string, string> = { class: "수업", activity: "활동", project: "프로젝트" };
export const LOAD_LEVEL_LABEL: Record<string, string> = { low: "적음", normal: "보통", high: "많음", custom: "직접 입력" };

export interface MyCertificate {
  certificate: Certificate;
  studyHours: number;
  prepWeeks: number;
  range: CertificatePrepRange;
  applyDday: number;
  examDday: number;
}

export interface Persona {
  id: string;
  name: string;
  email: string;
  persona: string;
  profile: Profile;
  ready: boolean;
  currentWeek: number | null;
  plans: Plan[];
  myCertificates: MyCertificate[];
  forecast: Forecast | null;
  withPreview: Forecast | null;
  previewDiff: PreviewDiff | null;
}

const dday = (date: string) => Math.round((Date.parse(date) - Date.parse(DEMO_TODAY)) / 86_400_000);

function buildPersona(user: (typeof demoUsers)[number]): Persona {
  const profile = profiles.find((p) => p.user_id === user.id)!;
  const myPlans = plans.filter((p) => p.user_id === user.id).sort((a, b) => a.start_week - b.start_week);
  const myUserCerts = userCertificates.filter((uc) => uc.user_id === user.id);
  const ready = isSemesterReady(profile) && profile.privacy_agreed_at !== null;

  const myCertificates = myUserCerts.map((uc) => {
    const certificate = certificates.find((c) => c.id === uc.certificate_id)!;
    return {
      certificate,
      studyHours: uc.study_hours,
      prepWeeks: uc.prep_weeks,
      range: certificatePrepRange(certificate.exam_date, uc.prep_weeks, profile.semester_start ?? DEMO_TODAY),
      applyDday: dday(certificate.apply_end),
      examDday: dday(certificate.exam_date),
    };
  });

  if (!ready) {
    return { ...user, name: user.display_name, profile, ready, currentWeek: null, plans: myPlans, myCertificates, forecast: null, withPreview: null, previewDiff: null };
  }

  const input = { profile, plans: myPlans, userCertificates: myUserCerts, certificates };
  const forecast = calculateForecast(input);
  const withPreview = calculateForecast({ ...input, plans: [...myPlans, previewPlan as PlanInput] });
  return {
    ...user,
    name: user.display_name,
    profile,
    ready,
    currentWeek: weekOf(DEMO_TODAY, profile.semester_start!),
    plans: myPlans,
    myCertificates,
    forecast,
    withPreview,
    previewDiff: comparePreview(forecast, withPreview),
  };
}

export const personas: Persona[] = demoUsers.map(buildPersona);
