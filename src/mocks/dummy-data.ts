// ⚠ 자동 생성 파일: scripts/generate-dummy.mjs 를 수정한 뒤 재생성하세요.
// 학기예보 프론트 목데이터 — 기준: 요구사항 명세서 5장(테이블), 4장(산출 규칙)
// Supabase 없이 화면을 먼저 만들 때 사용하세요. 실제 연결 후에는 supabase gen types 결과로 타입을 교체합니다.
// expectedForecast 는 src/features/forecast/calc.ts 단위 테스트의 기대값으로 쓸 수 있습니다 (NFR-MAINT-1).

export type PlanType = 'class' | 'activity' | 'project' | 'custom';
export type PlanPriority = 'high' | 'normal' | 'low';
export type LoadLevel = 'low' | 'normal' | 'high' | 'custom';
export type Weather = 'clear' | 'cloudy' | 'storm';

/** 5.1 profiles — available_hours / semester_start / privacy_agreed_at 중 하나라도 null 이면 온보딩 미완료 */
export interface Profile { user_id: string; display_name: string | null; available_hours: number | null; daily_hours: number[] | null; semester_start: string | null; midterm_week: number; final_week: number; privacy_agreed_at: string | null }
/** 5.2 plans — credits 는 수업일 때만 */
export interface Plan { id: string; user_id: string; title: string; type: PlanType; credits: number | null; load_level: LoadLevel; start_week: number; end_week: number; hours_per_week: number; start_date: string | null; end_date: string | null; priority: PlanPriority; category_id: string | null; created_at: string; updated_at: string }
/** 사용자 지정 계획 유형 (10/24) */
export interface PlanCategory { id: string; user_id: string; name: string; created_at: string }
export type PlanInput = Pick<Plan, 'title' | 'type' | 'credits' | 'load_level' | 'start_week' | 'end_week' | 'hours_per_week'>;
/** 5.3 certificates */
export interface Certificate { id: string; name: string; round: string; apply_start: string; apply_end: string; exam_date: string; prep_weeks: number; default_study_hours: number; source_url: string; owner_id: string | null }
/** 5.4 user_certificates */
export interface UserCertificate { user_id: string; certificate_id: string; study_hours: number; prep_weeks: number; notified_at: string | null }

export interface WeekItem { source: 'plan' | 'certificate'; title: string; base_hours: number; weighted: boolean; hours: number; priority?: PlanPriority; plan_type?: PlanType; category_id?: string | null }
export interface WeekForecast { week: number; is_exam_week: boolean; total_hours: number; ratio: number; level: Weather; items: WeekItem[] }
export interface Forecast { weeks: WeekForecast[]; summary: Record<Weather, number> }

export const TOTAL_WEEKS = 16;
export const EXAM_WEIGHT = 1.5;
export const LEVEL_THRESHOLD = {
  "CLOUDY_FROM": 0.8,
  "STORM_ABOVE": 1
} as const;
/** F-03 기본값 (명세서 3장 표, 팀 확정 필요). 수업은 학점당 시간 */
export const PLAN_DEFAULTS = {
  "class": {
    "unit": "학점당 시간/주 (수업 밖 공부)",
    "low": 1,
    "normal": 1.5,
    "high": 2
  },
  "activity": {
    "unit": "시간/주",
    "low": 2,
    "normal": 4,
    "high": 8
  },
  "project": {
    "unit": "시간/주",
    "low": 3,
    "normal": 6,
    "high": 10
  }
} as const;
/** 4.4 단계 표시 — 색 + 글자 + 아이콘 (NFR-ACC-1) */
export const WEATHER_LABEL: Record<Weather, { text: string; level: string; icon: string; color: string }> = {
  clear: { text: '맑음', level: '여유', icon: '☀️', color: '#3d8a5a' },
  cloudy: { text: '흐림', level: '주의', icon: '☁️', color: '#c98a1f' },
  storm: { text: '폭풍', level: '과부하', icon: '⛈️', color: '#c0463a' },
};

/** 데이터가 맞춰진 기준일 (7주차). D-day·접수 마감·현재 주차 테스트에 사용 */
export const DEMO_TODAY = '2026-10-13';
export const DEMO_PASSWORD = 'hakgi1234';
export const demoUsers = [
  {
    "id": "a0000000-0000-4000-8000-000000000001",
    "email": "yebo@hakgi.test",
    "display_name": "김예보",
    "persona": "취업 준비생 3학년 · 발표 시연(10/27 = 9주차 폭풍) / 4.5 검증 예시"
  },
  {
    "id": "a0000000-0000-4000-8000-000000000002",
    "email": "jiwon@hakgi.test",
    "display_name": "이지원",
    "persona": "대외활동 지원 예정자 2학년 · 직접 입력/학기 밖 준비기간"
  },
  {
    "id": "a0000000-0000-4000-8000-000000000003",
    "email": "woonyoung@hakgi.test",
    "display_name": "박운영",
    "persona": "학생회 운영진 4학년 · 기말 16주차 / 경계값 100%"
  },
  {
    "id": "a0000000-0000-4000-8000-000000000004",
    "email": "empty@hakgi.test",
    "display_name": "최수강",
    "persona": "학기 설정 완료 · 계획 없음 (FR-05-6 빈 상태)"
  },
  {
    "id": "a0000000-0000-4000-8000-000000000005",
    "email": "newbie@hakgi.test",
    "display_name": "정새내",
    "persona": "가입 직후 · 학기 설정 미완료 (FR-01-11 온보딩)"
  }
];

export const profiles: Profile[] = [
  {
    "user_id": "a0000000-0000-4000-8000-000000000001",
    "display_name": "김예보",
    "available_hours": 50,
    "daily_hours": [
      8,
      8,
      8,
      8,
      8,
      6,
      4
    ],
    "semester_start": "2026-08-31",
    "midterm_week": 8,
    "final_week": 15,
    "privacy_agreed_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "user_id": "a0000000-0000-4000-8000-000000000002",
    "display_name": "이지원",
    "available_hours": 45,
    "daily_hours": [
      7,
      7,
      7,
      7,
      7,
      6,
      4
    ],
    "semester_start": "2026-08-31",
    "midterm_week": 8,
    "final_week": 15,
    "privacy_agreed_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "user_id": "a0000000-0000-4000-8000-000000000003",
    "display_name": "박운영",
    "available_hours": 55,
    "daily_hours": [
      9,
      9,
      9,
      9,
      9,
      6,
      4
    ],
    "semester_start": "2026-08-31",
    "midterm_week": 8,
    "final_week": 16,
    "privacy_agreed_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "user_id": "a0000000-0000-4000-8000-000000000004",
    "display_name": "최수강",
    "available_hours": 40,
    "daily_hours": [
      6,
      6,
      6,
      6,
      6,
      6,
      4
    ],
    "semester_start": "2026-08-31",
    "midterm_week": 8,
    "final_week": 15,
    "privacy_agreed_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "user_id": "a0000000-0000-4000-8000-000000000005",
    "display_name": "정새내",
    "available_hours": null,
    "daily_hours": null,
    "semester_start": null,
    "midterm_week": 8,
    "final_week": 15,
    "privacy_agreed_at": null
  }
];
export const certificates: Certificate[] = [
  {
    "id": "c0000000-0000-4000-8000-000000000001",
    "name": "정보처리기사",
    "round": "2026년 정기 3회 필기",
    "apply_start": "2026-07-20",
    "apply_end": "2026-07-23",
    "exam_date": "2026-08-07",
    "prep_weeks": 6,
    "default_study_hours": 8,
    "source_url": "https://www.q-net.or.kr",
    "owner_id": null
  },
  {
    "id": "c0000000-0000-4000-8000-000000000002",
    "name": "정보처리기사",
    "round": "2026년 정기 3회 실기",
    "apply_start": "2026-09-21",
    "apply_end": "2026-09-28",
    "exam_date": "2026-10-24",
    "prep_weeks": 6,
    "default_study_hours": 8,
    "source_url": "https://www.q-net.or.kr",
    "owner_id": null
  },
  {
    "id": "c0000000-0000-4000-8000-000000000003",
    "name": "정보처리기사",
    "round": "2027년 정기 1회 필기 (예정)",
    "apply_start": "2027-01-11",
    "apply_end": "2027-01-14",
    "exam_date": "2027-01-29",
    "prep_weeks": 6,
    "default_study_hours": 8,
    "source_url": "https://www.q-net.or.kr",
    "owner_id": null
  },
  {
    "id": "c0000000-0000-4000-8000-000000000004",
    "name": "정보처리산업기사",
    "round": "2026년 정기 3회 필기",
    "apply_start": "2026-07-20",
    "apply_end": "2026-07-23",
    "exam_date": "2026-08-07",
    "prep_weeks": 5,
    "default_study_hours": 6,
    "source_url": "https://www.q-net.or.kr",
    "owner_id": null
  },
  {
    "id": "c0000000-0000-4000-8000-000000000005",
    "name": "정보처리산업기사",
    "round": "2026년 정기 3회 실기",
    "apply_start": "2026-09-21",
    "apply_end": "2026-09-28",
    "exam_date": "2026-10-24",
    "prep_weeks": 5,
    "default_study_hours": 6,
    "source_url": "https://www.q-net.or.kr",
    "owner_id": null
  },
  {
    "id": "c0000000-0000-4000-8000-000000000006",
    "name": "SQLD",
    "round": "제62회",
    "apply_start": "2026-07-20",
    "apply_end": "2026-07-24",
    "exam_date": "2026-08-22",
    "prep_weeks": 4,
    "default_study_hours": 6,
    "source_url": "https://www.dataq.or.kr",
    "owner_id": null
  },
  {
    "id": "c0000000-0000-4000-8000-000000000007",
    "name": "SQLD",
    "round": "제63회",
    "apply_start": "2026-10-12",
    "apply_end": "2026-10-16",
    "exam_date": "2026-11-14",
    "prep_weeks": 4,
    "default_study_hours": 6,
    "source_url": "https://www.dataq.or.kr",
    "owner_id": null
  },
  {
    "id": "c0000000-0000-4000-8000-000000000008",
    "name": "ADsP",
    "round": "제50회",
    "apply_start": "2026-07-06",
    "apply_end": "2026-07-10",
    "exam_date": "2026-08-08",
    "prep_weeks": 4,
    "default_study_hours": 6,
    "source_url": "https://www.dataq.or.kr",
    "owner_id": null
  },
  {
    "id": "c0000000-0000-4000-8000-000000000009",
    "name": "ADsP",
    "round": "제51회",
    "apply_start": "2026-09-28",
    "apply_end": "2026-10-02",
    "exam_date": "2026-10-31",
    "prep_weeks": 4,
    "default_study_hours": 6,
    "source_url": "https://www.dataq.or.kr",
    "owner_id": null
  },
  {
    "id": "c0000000-0000-4000-8000-000000000010",
    "name": "빅데이터분석기사",
    "round": "제13회 필기",
    "apply_start": "2026-08-03",
    "apply_end": "2026-08-07",
    "exam_date": "2026-09-05",
    "prep_weeks": 6,
    "default_study_hours": 8,
    "source_url": "https://www.dataq.or.kr",
    "owner_id": null
  },
  {
    "id": "c0000000-0000-4000-8000-000000000011",
    "name": "빅데이터분석기사",
    "round": "제13회 실기",
    "apply_start": "2026-10-26",
    "apply_end": "2026-10-30",
    "exam_date": "2026-11-28",
    "prep_weeks": 6,
    "default_study_hours": 8,
    "source_url": "https://www.dataq.or.kr",
    "owner_id": null
  },
  {
    "id": "c0000000-0000-4000-8000-000000000012",
    "name": "한국사능력검정시험 심화",
    "round": "제80회",
    "apply_start": "2026-09-15",
    "apply_end": "2026-09-22",
    "exam_date": "2026-10-17",
    "prep_weeks": 4,
    "default_study_hours": 5,
    "source_url": "https://www.historyexam.go.kr",
    "owner_id": null
  },
  {
    "id": "c0000000-0000-4000-8000-000000000013",
    "name": "전산회계 1급",
    "round": "제128회",
    "apply_start": "2026-08-27",
    "apply_end": "2026-09-02",
    "exam_date": "2026-10-03",
    "prep_weeks": 5,
    "default_study_hours": 6,
    "source_url": "https://license.kacpta.or.kr",
    "owner_id": null
  },
  {
    "id": "c0000000-0000-4000-8000-000000000014",
    "name": "전산회계 1급",
    "round": "제129회",
    "apply_start": "2026-11-05",
    "apply_end": "2026-11-11",
    "exam_date": "2026-12-05",
    "prep_weeks": 5,
    "default_study_hours": 6,
    "source_url": "https://license.kacpta.or.kr",
    "owner_id": null
  },
  {
    "id": "c0000000-0000-4000-8000-000000000015",
    "name": "유통관리사 2급",
    "round": "2026년 2회",
    "apply_start": "2026-07-30",
    "apply_end": "2026-08-05",
    "exam_date": "2026-08-22",
    "prep_weeks": 4,
    "default_study_hours": 5,
    "source_url": "https://license.korcham.net",
    "owner_id": null
  }
];
export const planCategories: PlanCategory[] = [
  {
    "id": "d0000000-0000-4000-0001-000000000001",
    "user_id": "a0000000-0000-4000-8000-000000000001",
    "name": "경조사",
    "created_at": "2026-09-01T09:00:00+09:00"
  }
];
export const plans: Plan[] = [
  {
    "id": "b0000000-0000-4000-0001-000000000001",
    "user_id": "a0000000-0000-4000-8000-000000000001",
    "title": "운영체제",
    "type": "class",
    "credits": 3,
    "load_level": "custom",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 6,
    "start_date": null,
    "end_date": null,
    "priority": "normal",
    "category_id": null,
    "created_at": "2026-09-01T09:00:00+09:00",
    "updated_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0001-000000000002",
    "user_id": "a0000000-0000-4000-8000-000000000001",
    "title": "데이터베이스",
    "type": "class",
    "credits": 3,
    "load_level": "custom",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 6,
    "start_date": null,
    "end_date": null,
    "priority": "normal",
    "category_id": null,
    "created_at": "2026-09-01T09:00:00+09:00",
    "updated_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0001-000000000003",
    "user_id": "a0000000-0000-4000-8000-000000000001",
    "title": "컴퓨터네트워크",
    "type": "class",
    "credits": 3,
    "load_level": "custom",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 6,
    "start_date": null,
    "end_date": null,
    "priority": "normal",
    "category_id": null,
    "created_at": "2026-09-01T09:00:00+09:00",
    "updated_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0001-000000000004",
    "user_id": "a0000000-0000-4000-8000-000000000001",
    "title": "소프트웨어공학",
    "type": "class",
    "credits": 3,
    "load_level": "custom",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 6,
    "start_date": null,
    "end_date": null,
    "priority": "low",
    "category_id": null,
    "created_at": "2026-09-01T09:00:00+09:00",
    "updated_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0001-000000000005",
    "user_id": "a0000000-0000-4000-8000-000000000001",
    "title": "알고리즘",
    "type": "class",
    "credits": 3,
    "load_level": "custom",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 6,
    "start_date": null,
    "end_date": null,
    "priority": "high",
    "category_id": null,
    "created_at": "2026-09-01T09:00:00+09:00",
    "updated_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0001-000000000006",
    "user_id": "a0000000-0000-4000-8000-000000000001",
    "title": "프로그래밍 학회",
    "type": "activity",
    "credits": null,
    "load_level": "normal",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 4,
    "start_date": null,
    "end_date": null,
    "priority": "low",
    "category_id": null,
    "created_at": "2026-09-01T09:00:00+09:00",
    "updated_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0001-000000000007",
    "user_id": "a0000000-0000-4000-8000-000000000001",
    "title": "캡스톤 디자인 중간 발표",
    "type": "project",
    "credits": null,
    "load_level": "custom",
    "start_week": 9,
    "end_week": 10,
    "hours_per_week": 6,
    "start_date": "2026-10-26",
    "end_date": "2026-11-08",
    "priority": "high",
    "category_id": null,
    "created_at": "2026-09-01T09:00:00+09:00",
    "updated_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0001-000000000008",
    "user_id": "a0000000-0000-4000-8000-000000000001",
    "title": "사촌형 결혼식",
    "type": "custom",
    "credits": null,
    "load_level": "custom",
    "start_week": 9,
    "end_week": 9,
    "hours_per_week": 6,
    "start_date": "2026-10-31",
    "end_date": "2026-10-31",
    "priority": "high",
    "category_id": "d0000000-0000-4000-0001-000000000001",
    "created_at": "2026-09-01T09:00:00+09:00",
    "updated_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0002-000000000001",
    "user_id": "a0000000-0000-4000-8000-000000000002",
    "title": "경영학원론",
    "type": "class",
    "credits": 3,
    "load_level": "custom",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 6,
    "start_date": null,
    "end_date": null,
    "priority": "normal",
    "category_id": null,
    "created_at": "2026-09-01T09:00:00+09:00",
    "updated_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0002-000000000002",
    "user_id": "a0000000-0000-4000-8000-000000000002",
    "title": "마케팅원론",
    "type": "class",
    "credits": 3,
    "load_level": "custom",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 4.5,
    "start_date": null,
    "end_date": null,
    "priority": "low",
    "category_id": null,
    "created_at": "2026-09-01T09:00:00+09:00",
    "updated_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0002-000000000003",
    "user_id": "a0000000-0000-4000-8000-000000000002",
    "title": "회계원리",
    "type": "class",
    "credits": 3,
    "load_level": "custom",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 6,
    "start_date": null,
    "end_date": null,
    "priority": "high",
    "category_id": null,
    "created_at": "2026-09-01T09:00:00+09:00",
    "updated_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0002-000000000004",
    "user_id": "a0000000-0000-4000-8000-000000000002",
    "title": "경영통계",
    "type": "class",
    "credits": 3,
    "load_level": "custom",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 6,
    "start_date": null,
    "end_date": null,
    "priority": "normal",
    "category_id": null,
    "created_at": "2026-09-01T09:00:00+09:00",
    "updated_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0002-000000000005",
    "user_id": "a0000000-0000-4000-8000-000000000002",
    "title": "비즈니스 영어회화",
    "type": "class",
    "credits": 2,
    "load_level": "custom",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 3,
    "start_date": null,
    "end_date": null,
    "priority": "normal",
    "category_id": null,
    "created_at": "2026-09-01T09:00:00+09:00",
    "updated_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0002-000000000006",
    "user_id": "a0000000-0000-4000-8000-000000000002",
    "title": "사진 동아리",
    "type": "activity",
    "credits": null,
    "load_level": "low",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 2,
    "start_date": null,
    "end_date": null,
    "priority": "normal",
    "category_id": null,
    "created_at": "2026-09-01T09:00:00+09:00",
    "updated_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0002-000000000007",
    "user_id": "a0000000-0000-4000-8000-000000000002",
    "title": "교내 마케팅 공모전",
    "type": "project",
    "credits": null,
    "load_level": "normal",
    "start_week": 3,
    "end_week": 9,
    "hours_per_week": 6,
    "start_date": null,
    "end_date": null,
    "priority": "normal",
    "category_id": null,
    "created_at": "2026-09-01T09:00:00+09:00",
    "updated_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0003-000000000001",
    "user_id": "a0000000-0000-4000-8000-000000000003",
    "title": "졸업 프로젝트",
    "type": "project",
    "credits": null,
    "load_level": "high",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 10,
    "start_date": null,
    "end_date": null,
    "priority": "high",
    "category_id": null,
    "created_at": "2026-09-01T09:00:00+09:00",
    "updated_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0003-000000000002",
    "user_id": "a0000000-0000-4000-8000-000000000003",
    "title": "데이터마이닝",
    "type": "class",
    "credits": 3,
    "load_level": "custom",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 6,
    "start_date": null,
    "end_date": null,
    "priority": "normal",
    "category_id": null,
    "created_at": "2026-09-01T09:00:00+09:00",
    "updated_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0003-000000000003",
    "user_id": "a0000000-0000-4000-8000-000000000003",
    "title": "정보보호개론",
    "type": "class",
    "credits": 3,
    "load_level": "custom",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 6,
    "start_date": null,
    "end_date": null,
    "priority": "normal",
    "category_id": null,
    "created_at": "2026-09-01T09:00:00+09:00",
    "updated_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0003-000000000004",
    "user_id": "a0000000-0000-4000-8000-000000000003",
    "title": "진로설계",
    "type": "class",
    "credits": 1,
    "load_level": "custom",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 2,
    "start_date": null,
    "end_date": null,
    "priority": "low",
    "category_id": null,
    "created_at": "2026-09-01T09:00:00+09:00",
    "updated_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0003-000000000005",
    "user_id": "a0000000-0000-4000-8000-000000000003",
    "title": "단과대 학생회",
    "type": "activity",
    "credits": null,
    "load_level": "custom",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 10,
    "start_date": null,
    "end_date": null,
    "priority": "normal",
    "category_id": null,
    "created_at": "2026-09-01T09:00:00+09:00",
    "updated_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0003-000000000006",
    "user_id": "a0000000-0000-4000-8000-000000000003",
    "title": "축제 준비위원회",
    "type": "activity",
    "credits": null,
    "load_level": "high",
    "start_week": 6,
    "end_week": 8,
    "hours_per_week": 8,
    "start_date": null,
    "end_date": null,
    "priority": "normal",
    "category_id": null,
    "created_at": "2026-09-01T09:00:00+09:00",
    "updated_at": "2026-09-01T09:00:00+09:00"
  }
];
export const userCertificates: UserCertificate[] = [
  {
    "user_id": "a0000000-0000-4000-8000-000000000001",
    "certificate_id": "c0000000-0000-4000-8000-000000000002",
    "study_hours": 8,
    "prep_weeks": 6,
    "notified_at": null
  },
  {
    "user_id": "a0000000-0000-4000-8000-000000000001",
    "certificate_id": "c0000000-0000-4000-8000-000000000007",
    "study_hours": 8,
    "prep_weeks": 3,
    "notified_at": null
  },
  {
    "user_id": "a0000000-0000-4000-8000-000000000001",
    "certificate_id": "c0000000-0000-4000-8000-000000000011",
    "study_hours": 6,
    "prep_weeks": 2,
    "notified_at": null
  },
  {
    "user_id": "a0000000-0000-4000-8000-000000000002",
    "certificate_id": "c0000000-0000-4000-8000-000000000014",
    "study_hours": 5,
    "prep_weeks": 5,
    "notified_at": null
  },
  {
    "user_id": "a0000000-0000-4000-8000-000000000002",
    "certificate_id": "c0000000-0000-4000-8000-000000000003",
    "study_hours": 8,
    "prep_weeks": 8,
    "notified_at": null
  },
  {
    "user_id": "a0000000-0000-4000-8000-000000000003",
    "certificate_id": "c0000000-0000-4000-8000-000000000007",
    "study_hours": 6,
    "prep_weeks": 4,
    "notified_at": null
  },
  {
    "user_id": "a0000000-0000-4000-8000-000000000003",
    "certificate_id": "c0000000-0000-4000-8000-000000000011",
    "study_hours": 6,
    "prep_weeks": 3,
    "notified_at": null
  }
];

/** F-06 사전 검토 시연용 (김예보가 저장 전에 입력해 보는 계획) */
export const previewPlan: PlanInput = {
  "title": "대학생 서포터즈 1차 미션",
  "type": "activity",
  "credits": null,
  "load_level": "custom",
  "start_week": 9,
  "end_week": 10,
  "hours_per_week": 10
};

/** 학기 설정을 마친 사용자별 예상 예보 (명세서 4장 규칙) */
export const expectedForecast: Record<string, Forecast> = {
  "a0000000-0000-4000-8000-000000000001": {
    "weeks": [
      {
        "week": 1,
        "is_exam_week": false,
        "total_hours": 34,
        "ratio": 0.68,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "알고리즘",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "base_hours": 4,
            "weighted": false,
            "hours": 4,
            "priority": "low",
            "plan_type": "activity",
            "category_id": null
          }
        ]
      },
      {
        "week": 2,
        "is_exam_week": false,
        "total_hours": 34,
        "ratio": 0.68,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "알고리즘",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "base_hours": 4,
            "weighted": false,
            "hours": 4,
            "priority": "low",
            "plan_type": "activity",
            "category_id": null
          }
        ]
      },
      {
        "week": 3,
        "is_exam_week": false,
        "total_hours": 42,
        "ratio": 0.84,
        "level": "cloudy",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "알고리즘",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "base_hours": 4,
            "weighted": false,
            "hours": 4,
            "priority": "low",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "certificate",
            "title": "정보처리기사 준비",
            "base_hours": 8,
            "weighted": false,
            "hours": 8
          }
        ]
      },
      {
        "week": 4,
        "is_exam_week": false,
        "total_hours": 42,
        "ratio": 0.84,
        "level": "cloudy",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "알고리즘",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "base_hours": 4,
            "weighted": false,
            "hours": 4,
            "priority": "low",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "certificate",
            "title": "정보처리기사 준비",
            "base_hours": 8,
            "weighted": false,
            "hours": 8
          }
        ]
      },
      {
        "week": 5,
        "is_exam_week": false,
        "total_hours": 42,
        "ratio": 0.84,
        "level": "cloudy",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "알고리즘",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "base_hours": 4,
            "weighted": false,
            "hours": 4,
            "priority": "low",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "certificate",
            "title": "정보처리기사 준비",
            "base_hours": 8,
            "weighted": false,
            "hours": 8
          }
        ]
      },
      {
        "week": 6,
        "is_exam_week": false,
        "total_hours": 42,
        "ratio": 0.84,
        "level": "cloudy",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "알고리즘",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "base_hours": 4,
            "weighted": false,
            "hours": 4,
            "priority": "low",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "certificate",
            "title": "정보처리기사 준비",
            "base_hours": 8,
            "weighted": false,
            "hours": 8
          }
        ]
      },
      {
        "week": 7,
        "is_exam_week": false,
        "total_hours": 42,
        "ratio": 0.84,
        "level": "cloudy",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "알고리즘",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "base_hours": 4,
            "weighted": false,
            "hours": 4,
            "priority": "low",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "certificate",
            "title": "정보처리기사 준비",
            "base_hours": 8,
            "weighted": false,
            "hours": 8
          }
        ]
      },
      {
        "week": 8,
        "is_exam_week": true,
        "total_hours": 57,
        "ratio": 1.14,
        "level": "storm",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "base_hours": 6,
            "weighted": true,
            "hours": 9,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "base_hours": 6,
            "weighted": true,
            "hours": 9,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "base_hours": 6,
            "weighted": true,
            "hours": 9,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "base_hours": 6,
            "weighted": true,
            "hours": 9,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "알고리즘",
            "base_hours": 6,
            "weighted": true,
            "hours": 9,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "base_hours": 4,
            "weighted": false,
            "hours": 4,
            "priority": "low",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "certificate",
            "title": "정보처리기사 준비",
            "base_hours": 8,
            "weighted": false,
            "hours": 8
          }
        ]
      },
      {
        "week": 9,
        "is_exam_week": false,
        "total_hours": 54,
        "ratio": 1.08,
        "level": "storm",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "알고리즘",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "base_hours": 4,
            "weighted": false,
            "hours": 4,
            "priority": "low",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "캡스톤 디자인 중간 발표",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "project",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "사촌형 결혼식",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "custom",
            "category_id": "d0000000-0000-4000-0001-000000000001"
          },
          {
            "source": "certificate",
            "title": "SQLD 준비",
            "base_hours": 8,
            "weighted": false,
            "hours": 8
          }
        ]
      },
      {
        "week": 10,
        "is_exam_week": false,
        "total_hours": 48,
        "ratio": 0.96,
        "level": "cloudy",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "알고리즘",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "base_hours": 4,
            "weighted": false,
            "hours": 4,
            "priority": "low",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "캡스톤 디자인 중간 발표",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "project",
            "category_id": null
          },
          {
            "source": "certificate",
            "title": "SQLD 준비",
            "base_hours": 8,
            "weighted": false,
            "hours": 8
          }
        ]
      },
      {
        "week": 11,
        "is_exam_week": false,
        "total_hours": 42,
        "ratio": 0.84,
        "level": "cloudy",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "알고리즘",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "base_hours": 4,
            "weighted": false,
            "hours": 4,
            "priority": "low",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "certificate",
            "title": "SQLD 준비",
            "base_hours": 8,
            "weighted": false,
            "hours": 8
          }
        ]
      },
      {
        "week": 12,
        "is_exam_week": false,
        "total_hours": 40,
        "ratio": 0.8,
        "level": "cloudy",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "알고리즘",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "base_hours": 4,
            "weighted": false,
            "hours": 4,
            "priority": "low",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "certificate",
            "title": "빅데이터분석기사 준비",
            "base_hours": 6,
            "weighted": false,
            "hours": 6
          }
        ]
      },
      {
        "week": 13,
        "is_exam_week": false,
        "total_hours": 40,
        "ratio": 0.8,
        "level": "cloudy",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "알고리즘",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "base_hours": 4,
            "weighted": false,
            "hours": 4,
            "priority": "low",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "certificate",
            "title": "빅데이터분석기사 준비",
            "base_hours": 6,
            "weighted": false,
            "hours": 6
          }
        ]
      },
      {
        "week": 14,
        "is_exam_week": false,
        "total_hours": 34,
        "ratio": 0.68,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "알고리즘",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "base_hours": 4,
            "weighted": false,
            "hours": 4,
            "priority": "low",
            "plan_type": "activity",
            "category_id": null
          }
        ]
      },
      {
        "week": 15,
        "is_exam_week": true,
        "total_hours": 49,
        "ratio": 0.98,
        "level": "cloudy",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "base_hours": 6,
            "weighted": true,
            "hours": 9,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "base_hours": 6,
            "weighted": true,
            "hours": 9,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "base_hours": 6,
            "weighted": true,
            "hours": 9,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "base_hours": 6,
            "weighted": true,
            "hours": 9,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "알고리즘",
            "base_hours": 6,
            "weighted": true,
            "hours": 9,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "base_hours": 4,
            "weighted": false,
            "hours": 4,
            "priority": "low",
            "plan_type": "activity",
            "category_id": null
          }
        ]
      },
      {
        "week": 16,
        "is_exam_week": false,
        "total_hours": 34,
        "ratio": 0.68,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "알고리즘",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "base_hours": 4,
            "weighted": false,
            "hours": 4,
            "priority": "low",
            "plan_type": "activity",
            "category_id": null
          }
        ]
      }
    ],
    "summary": {
      "storm": 2,
      "cloudy": 10,
      "clear": 4
    }
  },
  "a0000000-0000-4000-8000-000000000002": {
    "weeks": [
      {
        "week": 1,
        "is_exam_week": false,
        "total_hours": 27.5,
        "ratio": 0.611,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "base_hours": 4.5,
            "weighted": false,
            "hours": 4.5,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "회계원리",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "경영통계",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "비즈니스 영어회화",
            "base_hours": 3,
            "weighted": false,
            "hours": 3,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          }
        ]
      },
      {
        "week": 2,
        "is_exam_week": false,
        "total_hours": 27.5,
        "ratio": 0.611,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "base_hours": 4.5,
            "weighted": false,
            "hours": 4.5,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "회계원리",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "경영통계",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "비즈니스 영어회화",
            "base_hours": 3,
            "weighted": false,
            "hours": 3,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          }
        ]
      },
      {
        "week": 3,
        "is_exam_week": false,
        "total_hours": 33.5,
        "ratio": 0.744,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "base_hours": 4.5,
            "weighted": false,
            "hours": 4.5,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "회계원리",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "경영통계",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "비즈니스 영어회화",
            "base_hours": 3,
            "weighted": false,
            "hours": 3,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "교내 마케팅 공모전",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "project",
            "category_id": null
          }
        ]
      },
      {
        "week": 4,
        "is_exam_week": false,
        "total_hours": 33.5,
        "ratio": 0.744,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "base_hours": 4.5,
            "weighted": false,
            "hours": 4.5,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "회계원리",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "경영통계",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "비즈니스 영어회화",
            "base_hours": 3,
            "weighted": false,
            "hours": 3,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "교내 마케팅 공모전",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "project",
            "category_id": null
          }
        ]
      },
      {
        "week": 5,
        "is_exam_week": false,
        "total_hours": 33.5,
        "ratio": 0.744,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "base_hours": 4.5,
            "weighted": false,
            "hours": 4.5,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "회계원리",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "경영통계",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "비즈니스 영어회화",
            "base_hours": 3,
            "weighted": false,
            "hours": 3,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "교내 마케팅 공모전",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "project",
            "category_id": null
          }
        ]
      },
      {
        "week": 6,
        "is_exam_week": false,
        "total_hours": 33.5,
        "ratio": 0.744,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "base_hours": 4.5,
            "weighted": false,
            "hours": 4.5,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "회계원리",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "경영통계",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "비즈니스 영어회화",
            "base_hours": 3,
            "weighted": false,
            "hours": 3,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "교내 마케팅 공모전",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "project",
            "category_id": null
          }
        ]
      },
      {
        "week": 7,
        "is_exam_week": false,
        "total_hours": 33.5,
        "ratio": 0.744,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "base_hours": 4.5,
            "weighted": false,
            "hours": 4.5,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "회계원리",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "경영통계",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "비즈니스 영어회화",
            "base_hours": 3,
            "weighted": false,
            "hours": 3,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "교내 마케팅 공모전",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "project",
            "category_id": null
          }
        ]
      },
      {
        "week": 8,
        "is_exam_week": true,
        "total_hours": 46.3,
        "ratio": 1.028,
        "level": "storm",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "base_hours": 6,
            "weighted": true,
            "hours": 9,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "base_hours": 4.5,
            "weighted": true,
            "hours": 6.8,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "회계원리",
            "base_hours": 6,
            "weighted": true,
            "hours": 9,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "경영통계",
            "base_hours": 6,
            "weighted": true,
            "hours": 9,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "비즈니스 영어회화",
            "base_hours": 3,
            "weighted": true,
            "hours": 4.5,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "교내 마케팅 공모전",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "project",
            "category_id": null
          }
        ]
      },
      {
        "week": 9,
        "is_exam_week": false,
        "total_hours": 33.5,
        "ratio": 0.744,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "base_hours": 4.5,
            "weighted": false,
            "hours": 4.5,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "회계원리",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "경영통계",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "비즈니스 영어회화",
            "base_hours": 3,
            "weighted": false,
            "hours": 3,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "교내 마케팅 공모전",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "project",
            "category_id": null
          }
        ]
      },
      {
        "week": 10,
        "is_exam_week": false,
        "total_hours": 32.5,
        "ratio": 0.722,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "base_hours": 4.5,
            "weighted": false,
            "hours": 4.5,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "회계원리",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "경영통계",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "비즈니스 영어회화",
            "base_hours": 3,
            "weighted": false,
            "hours": 3,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "certificate",
            "title": "전산회계 1급 준비",
            "base_hours": 5,
            "weighted": false,
            "hours": 5
          }
        ]
      },
      {
        "week": 11,
        "is_exam_week": false,
        "total_hours": 32.5,
        "ratio": 0.722,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "base_hours": 4.5,
            "weighted": false,
            "hours": 4.5,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "회계원리",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "경영통계",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "비즈니스 영어회화",
            "base_hours": 3,
            "weighted": false,
            "hours": 3,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "certificate",
            "title": "전산회계 1급 준비",
            "base_hours": 5,
            "weighted": false,
            "hours": 5
          }
        ]
      },
      {
        "week": 12,
        "is_exam_week": false,
        "total_hours": 32.5,
        "ratio": 0.722,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "base_hours": 4.5,
            "weighted": false,
            "hours": 4.5,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "회계원리",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "경영통계",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "비즈니스 영어회화",
            "base_hours": 3,
            "weighted": false,
            "hours": 3,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "certificate",
            "title": "전산회계 1급 준비",
            "base_hours": 5,
            "weighted": false,
            "hours": 5
          }
        ]
      },
      {
        "week": 13,
        "is_exam_week": false,
        "total_hours": 32.5,
        "ratio": 0.722,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "base_hours": 4.5,
            "weighted": false,
            "hours": 4.5,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "회계원리",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "경영통계",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "비즈니스 영어회화",
            "base_hours": 3,
            "weighted": false,
            "hours": 3,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "certificate",
            "title": "전산회계 1급 준비",
            "base_hours": 5,
            "weighted": false,
            "hours": 5
          }
        ]
      },
      {
        "week": 14,
        "is_exam_week": false,
        "total_hours": 32.5,
        "ratio": 0.722,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "base_hours": 4.5,
            "weighted": false,
            "hours": 4.5,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "회계원리",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "경영통계",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "비즈니스 영어회화",
            "base_hours": 3,
            "weighted": false,
            "hours": 3,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "certificate",
            "title": "전산회계 1급 준비",
            "base_hours": 5,
            "weighted": false,
            "hours": 5
          }
        ]
      },
      {
        "week": 15,
        "is_exam_week": true,
        "total_hours": 48.3,
        "ratio": 1.072,
        "level": "storm",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "base_hours": 6,
            "weighted": true,
            "hours": 9,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "base_hours": 4.5,
            "weighted": true,
            "hours": 6.8,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "회계원리",
            "base_hours": 6,
            "weighted": true,
            "hours": 9,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "경영통계",
            "base_hours": 6,
            "weighted": true,
            "hours": 9,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "비즈니스 영어회화",
            "base_hours": 3,
            "weighted": true,
            "hours": 4.5,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "certificate",
            "title": "정보처리기사 준비",
            "base_hours": 8,
            "weighted": false,
            "hours": 8
          }
        ]
      },
      {
        "week": 16,
        "is_exam_week": false,
        "total_hours": 35.5,
        "ratio": 0.789,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "base_hours": 4.5,
            "weighted": false,
            "hours": 4.5,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "회계원리",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "high",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "경영통계",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "비즈니스 영어회화",
            "base_hours": 3,
            "weighted": false,
            "hours": 3,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "certificate",
            "title": "정보처리기사 준비",
            "base_hours": 8,
            "weighted": false,
            "hours": 8
          }
        ]
      }
    ],
    "summary": {
      "storm": 2,
      "cloudy": 0,
      "clear": 14
    }
  },
  "a0000000-0000-4000-8000-000000000003": {
    "weeks": [
      {
        "week": 1,
        "is_exam_week": false,
        "total_hours": 34,
        "ratio": 0.618,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "high",
            "plan_type": "project",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "진로설계",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          }
        ]
      },
      {
        "week": 2,
        "is_exam_week": false,
        "total_hours": 34,
        "ratio": 0.618,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "high",
            "plan_type": "project",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "진로설계",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          }
        ]
      },
      {
        "week": 3,
        "is_exam_week": false,
        "total_hours": 34,
        "ratio": 0.618,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "high",
            "plan_type": "project",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "진로설계",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          }
        ]
      },
      {
        "week": 4,
        "is_exam_week": false,
        "total_hours": 34,
        "ratio": 0.618,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "high",
            "plan_type": "project",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "진로설계",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          }
        ]
      },
      {
        "week": 5,
        "is_exam_week": false,
        "total_hours": 34,
        "ratio": 0.618,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "high",
            "plan_type": "project",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "진로설계",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          }
        ]
      },
      {
        "week": 6,
        "is_exam_week": false,
        "total_hours": 42,
        "ratio": 0.764,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "high",
            "plan_type": "project",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "진로설계",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "축제 준비위원회",
            "base_hours": 8,
            "weighted": false,
            "hours": 8,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          }
        ]
      },
      {
        "week": 7,
        "is_exam_week": false,
        "total_hours": 42,
        "ratio": 0.764,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "high",
            "plan_type": "project",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "진로설계",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "축제 준비위원회",
            "base_hours": 8,
            "weighted": false,
            "hours": 8,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          }
        ]
      },
      {
        "week": 8,
        "is_exam_week": true,
        "total_hours": 55,
        "ratio": 1,
        "level": "cloudy",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "high",
            "plan_type": "project",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "base_hours": 6,
            "weighted": true,
            "hours": 9,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "base_hours": 6,
            "weighted": true,
            "hours": 9,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "진로설계",
            "base_hours": 2,
            "weighted": true,
            "hours": 3,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "축제 준비위원회",
            "base_hours": 8,
            "weighted": false,
            "hours": 8,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "certificate",
            "title": "SQLD 준비",
            "base_hours": 6,
            "weighted": false,
            "hours": 6
          }
        ]
      },
      {
        "week": 9,
        "is_exam_week": false,
        "total_hours": 40,
        "ratio": 0.727,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "high",
            "plan_type": "project",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "진로설계",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "certificate",
            "title": "SQLD 준비",
            "base_hours": 6,
            "weighted": false,
            "hours": 6
          }
        ]
      },
      {
        "week": 10,
        "is_exam_week": false,
        "total_hours": 40,
        "ratio": 0.727,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "high",
            "plan_type": "project",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "진로설계",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "certificate",
            "title": "SQLD 준비",
            "base_hours": 6,
            "weighted": false,
            "hours": 6
          }
        ]
      },
      {
        "week": 11,
        "is_exam_week": false,
        "total_hours": 46,
        "ratio": 0.836,
        "level": "cloudy",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "high",
            "plan_type": "project",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "진로설계",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "certificate",
            "title": "SQLD 준비",
            "base_hours": 6,
            "weighted": false,
            "hours": 6
          },
          {
            "source": "certificate",
            "title": "빅데이터분석기사 준비",
            "base_hours": 6,
            "weighted": false,
            "hours": 6
          }
        ]
      },
      {
        "week": 12,
        "is_exam_week": false,
        "total_hours": 40,
        "ratio": 0.727,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "high",
            "plan_type": "project",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "진로설계",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "certificate",
            "title": "빅데이터분석기사 준비",
            "base_hours": 6,
            "weighted": false,
            "hours": 6
          }
        ]
      },
      {
        "week": 13,
        "is_exam_week": false,
        "total_hours": 40,
        "ratio": 0.727,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "high",
            "plan_type": "project",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "진로설계",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          },
          {
            "source": "certificate",
            "title": "빅데이터분석기사 준비",
            "base_hours": 6,
            "weighted": false,
            "hours": 6
          }
        ]
      },
      {
        "week": 14,
        "is_exam_week": false,
        "total_hours": 34,
        "ratio": 0.618,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "high",
            "plan_type": "project",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "진로설계",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          }
        ]
      },
      {
        "week": 15,
        "is_exam_week": false,
        "total_hours": 34,
        "ratio": 0.618,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "high",
            "plan_type": "project",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "base_hours": 6,
            "weighted": false,
            "hours": 6,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "진로설계",
            "base_hours": 2,
            "weighted": false,
            "hours": 2,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          }
        ]
      },
      {
        "week": 16,
        "is_exam_week": true,
        "total_hours": 41,
        "ratio": 0.745,
        "level": "clear",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "high",
            "plan_type": "project",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "base_hours": 6,
            "weighted": true,
            "hours": 9,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "base_hours": 6,
            "weighted": true,
            "hours": 9,
            "priority": "normal",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "진로설계",
            "base_hours": 2,
            "weighted": true,
            "hours": 3,
            "priority": "low",
            "plan_type": "class",
            "category_id": null
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "base_hours": 10,
            "weighted": false,
            "hours": 10,
            "priority": "normal",
            "plan_type": "activity",
            "category_id": null
          }
        ]
      }
    ],
    "summary": {
      "storm": 0,
      "cloudy": 2,
      "clear": 14
    }
  },
  "a0000000-0000-4000-8000-000000000004": {
    "weeks": [
      {
        "week": 1,
        "is_exam_week": false,
        "total_hours": 0,
        "ratio": 0,
        "level": "clear",
        "items": []
      },
      {
        "week": 2,
        "is_exam_week": false,
        "total_hours": 0,
        "ratio": 0,
        "level": "clear",
        "items": []
      },
      {
        "week": 3,
        "is_exam_week": false,
        "total_hours": 0,
        "ratio": 0,
        "level": "clear",
        "items": []
      },
      {
        "week": 4,
        "is_exam_week": false,
        "total_hours": 0,
        "ratio": 0,
        "level": "clear",
        "items": []
      },
      {
        "week": 5,
        "is_exam_week": false,
        "total_hours": 0,
        "ratio": 0,
        "level": "clear",
        "items": []
      },
      {
        "week": 6,
        "is_exam_week": false,
        "total_hours": 0,
        "ratio": 0,
        "level": "clear",
        "items": []
      },
      {
        "week": 7,
        "is_exam_week": false,
        "total_hours": 0,
        "ratio": 0,
        "level": "clear",
        "items": []
      },
      {
        "week": 8,
        "is_exam_week": true,
        "total_hours": 0,
        "ratio": 0,
        "level": "clear",
        "items": []
      },
      {
        "week": 9,
        "is_exam_week": false,
        "total_hours": 0,
        "ratio": 0,
        "level": "clear",
        "items": []
      },
      {
        "week": 10,
        "is_exam_week": false,
        "total_hours": 0,
        "ratio": 0,
        "level": "clear",
        "items": []
      },
      {
        "week": 11,
        "is_exam_week": false,
        "total_hours": 0,
        "ratio": 0,
        "level": "clear",
        "items": []
      },
      {
        "week": 12,
        "is_exam_week": false,
        "total_hours": 0,
        "ratio": 0,
        "level": "clear",
        "items": []
      },
      {
        "week": 13,
        "is_exam_week": false,
        "total_hours": 0,
        "ratio": 0,
        "level": "clear",
        "items": []
      },
      {
        "week": 14,
        "is_exam_week": false,
        "total_hours": 0,
        "ratio": 0,
        "level": "clear",
        "items": []
      },
      {
        "week": 15,
        "is_exam_week": true,
        "total_hours": 0,
        "ratio": 0,
        "level": "clear",
        "items": []
      },
      {
        "week": 16,
        "is_exam_week": false,
        "total_hours": 0,
        "ratio": 0,
        "level": "clear",
        "items": []
      }
    ],
    "summary": {
      "storm": 0,
      "cloudy": 0,
      "clear": 16
    }
  }
};
/** 김예보 + previewPlan 적용 시 예보 */
export const expectedForecastWithPreview: Forecast = {
  "weeks": [
    {
      "week": 1,
      "is_exam_week": false,
      "total_hours": 34,
      "ratio": 0.68,
      "level": "clear",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "low",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "알고리즘",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "high",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "base_hours": 4,
          "weighted": false,
          "hours": 4,
          "priority": "low",
          "plan_type": "activity",
          "category_id": null
        }
      ]
    },
    {
      "week": 2,
      "is_exam_week": false,
      "total_hours": 34,
      "ratio": 0.68,
      "level": "clear",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "low",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "알고리즘",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "high",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "base_hours": 4,
          "weighted": false,
          "hours": 4,
          "priority": "low",
          "plan_type": "activity",
          "category_id": null
        }
      ]
    },
    {
      "week": 3,
      "is_exam_week": false,
      "total_hours": 42,
      "ratio": 0.84,
      "level": "cloudy",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "low",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "알고리즘",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "high",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "base_hours": 4,
          "weighted": false,
          "hours": 4,
          "priority": "low",
          "plan_type": "activity",
          "category_id": null
        },
        {
          "source": "certificate",
          "title": "정보처리기사 준비",
          "base_hours": 8,
          "weighted": false,
          "hours": 8
        }
      ]
    },
    {
      "week": 4,
      "is_exam_week": false,
      "total_hours": 42,
      "ratio": 0.84,
      "level": "cloudy",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "low",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "알고리즘",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "high",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "base_hours": 4,
          "weighted": false,
          "hours": 4,
          "priority": "low",
          "plan_type": "activity",
          "category_id": null
        },
        {
          "source": "certificate",
          "title": "정보처리기사 준비",
          "base_hours": 8,
          "weighted": false,
          "hours": 8
        }
      ]
    },
    {
      "week": 5,
      "is_exam_week": false,
      "total_hours": 42,
      "ratio": 0.84,
      "level": "cloudy",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "low",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "알고리즘",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "high",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "base_hours": 4,
          "weighted": false,
          "hours": 4,
          "priority": "low",
          "plan_type": "activity",
          "category_id": null
        },
        {
          "source": "certificate",
          "title": "정보처리기사 준비",
          "base_hours": 8,
          "weighted": false,
          "hours": 8
        }
      ]
    },
    {
      "week": 6,
      "is_exam_week": false,
      "total_hours": 42,
      "ratio": 0.84,
      "level": "cloudy",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "low",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "알고리즘",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "high",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "base_hours": 4,
          "weighted": false,
          "hours": 4,
          "priority": "low",
          "plan_type": "activity",
          "category_id": null
        },
        {
          "source": "certificate",
          "title": "정보처리기사 준비",
          "base_hours": 8,
          "weighted": false,
          "hours": 8
        }
      ]
    },
    {
      "week": 7,
      "is_exam_week": false,
      "total_hours": 42,
      "ratio": 0.84,
      "level": "cloudy",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "low",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "알고리즘",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "high",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "base_hours": 4,
          "weighted": false,
          "hours": 4,
          "priority": "low",
          "plan_type": "activity",
          "category_id": null
        },
        {
          "source": "certificate",
          "title": "정보처리기사 준비",
          "base_hours": 8,
          "weighted": false,
          "hours": 8
        }
      ]
    },
    {
      "week": 8,
      "is_exam_week": true,
      "total_hours": 57,
      "ratio": 1.14,
      "level": "storm",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "base_hours": 6,
          "weighted": true,
          "hours": 9,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "base_hours": 6,
          "weighted": true,
          "hours": 9,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "base_hours": 6,
          "weighted": true,
          "hours": 9,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "base_hours": 6,
          "weighted": true,
          "hours": 9,
          "priority": "low",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "알고리즘",
          "base_hours": 6,
          "weighted": true,
          "hours": 9,
          "priority": "high",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "base_hours": 4,
          "weighted": false,
          "hours": 4,
          "priority": "low",
          "plan_type": "activity",
          "category_id": null
        },
        {
          "source": "certificate",
          "title": "정보처리기사 준비",
          "base_hours": 8,
          "weighted": false,
          "hours": 8
        }
      ]
    },
    {
      "week": 9,
      "is_exam_week": false,
      "total_hours": 64,
      "ratio": 1.28,
      "level": "storm",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "low",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "알고리즘",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "high",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "base_hours": 4,
          "weighted": false,
          "hours": 4,
          "priority": "low",
          "plan_type": "activity",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "캡스톤 디자인 중간 발표",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "high",
          "plan_type": "project",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "사촌형 결혼식",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "high",
          "plan_type": "custom",
          "category_id": "d0000000-0000-4000-0001-000000000001"
        },
        {
          "source": "plan",
          "title": "대학생 서포터즈 1차 미션",
          "base_hours": 10,
          "weighted": false,
          "hours": 10,
          "priority": "normal",
          "plan_type": "activity",
          "category_id": null
        },
        {
          "source": "certificate",
          "title": "SQLD 준비",
          "base_hours": 8,
          "weighted": false,
          "hours": 8
        }
      ]
    },
    {
      "week": 10,
      "is_exam_week": false,
      "total_hours": 58,
      "ratio": 1.16,
      "level": "storm",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "low",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "알고리즘",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "high",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "base_hours": 4,
          "weighted": false,
          "hours": 4,
          "priority": "low",
          "plan_type": "activity",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "캡스톤 디자인 중간 발표",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "high",
          "plan_type": "project",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "대학생 서포터즈 1차 미션",
          "base_hours": 10,
          "weighted": false,
          "hours": 10,
          "priority": "normal",
          "plan_type": "activity",
          "category_id": null
        },
        {
          "source": "certificate",
          "title": "SQLD 준비",
          "base_hours": 8,
          "weighted": false,
          "hours": 8
        }
      ]
    },
    {
      "week": 11,
      "is_exam_week": false,
      "total_hours": 42,
      "ratio": 0.84,
      "level": "cloudy",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "low",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "알고리즘",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "high",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "base_hours": 4,
          "weighted": false,
          "hours": 4,
          "priority": "low",
          "plan_type": "activity",
          "category_id": null
        },
        {
          "source": "certificate",
          "title": "SQLD 준비",
          "base_hours": 8,
          "weighted": false,
          "hours": 8
        }
      ]
    },
    {
      "week": 12,
      "is_exam_week": false,
      "total_hours": 40,
      "ratio": 0.8,
      "level": "cloudy",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "low",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "알고리즘",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "high",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "base_hours": 4,
          "weighted": false,
          "hours": 4,
          "priority": "low",
          "plan_type": "activity",
          "category_id": null
        },
        {
          "source": "certificate",
          "title": "빅데이터분석기사 준비",
          "base_hours": 6,
          "weighted": false,
          "hours": 6
        }
      ]
    },
    {
      "week": 13,
      "is_exam_week": false,
      "total_hours": 40,
      "ratio": 0.8,
      "level": "cloudy",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "low",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "알고리즘",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "high",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "base_hours": 4,
          "weighted": false,
          "hours": 4,
          "priority": "low",
          "plan_type": "activity",
          "category_id": null
        },
        {
          "source": "certificate",
          "title": "빅데이터분석기사 준비",
          "base_hours": 6,
          "weighted": false,
          "hours": 6
        }
      ]
    },
    {
      "week": 14,
      "is_exam_week": false,
      "total_hours": 34,
      "ratio": 0.68,
      "level": "clear",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "low",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "알고리즘",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "high",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "base_hours": 4,
          "weighted": false,
          "hours": 4,
          "priority": "low",
          "plan_type": "activity",
          "category_id": null
        }
      ]
    },
    {
      "week": 15,
      "is_exam_week": true,
      "total_hours": 49,
      "ratio": 0.98,
      "level": "cloudy",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "base_hours": 6,
          "weighted": true,
          "hours": 9,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "base_hours": 6,
          "weighted": true,
          "hours": 9,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "base_hours": 6,
          "weighted": true,
          "hours": 9,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "base_hours": 6,
          "weighted": true,
          "hours": 9,
          "priority": "low",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "알고리즘",
          "base_hours": 6,
          "weighted": true,
          "hours": 9,
          "priority": "high",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "base_hours": 4,
          "weighted": false,
          "hours": 4,
          "priority": "low",
          "plan_type": "activity",
          "category_id": null
        }
      ]
    },
    {
      "week": 16,
      "is_exam_week": false,
      "total_hours": 34,
      "ratio": 0.68,
      "level": "clear",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "normal",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "low",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "알고리즘",
          "base_hours": 6,
          "weighted": false,
          "hours": 6,
          "priority": "high",
          "plan_type": "class",
          "category_id": null
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "base_hours": 4,
          "weighted": false,
          "hours": 4,
          "priority": "low",
          "plan_type": "activity",
          "category_id": null
        }
      ]
    }
  ],
  "summary": {
    "storm": 3,
    "cloudy": 9,
    "clear": 4
  }
};
/** FR-06-3 변화 요약 기대값 */
export const expectedPreviewDiff = {
  "storm_before": 2,
  "storm_after": 3,
  "new_storm_weeks": [
    10
  ],
  "message": "폭풍 2주 → 3주 (10주차 추가)"
};
