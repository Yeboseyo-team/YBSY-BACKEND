// ⚠ 자동 생성 파일: scripts/generate-dummy.mjs 를 수정한 뒤 재생성하세요.
// 학기예보 프론트 목데이터. Supabase 없이 화면을 먼저 만들 때 사용하세요.
// `expectedForecast`는 산출 로직 단위 테스트의 정답값으로 쓸 수 있습니다.

export type PlanType = 'class' | 'activity' | 'project';
export type LoadLevel = 'ok' | 'warn' | 'over';

export interface Profile { user_id: string; display_name: string; available_hours: number; semester_start: string }
export interface Plan { id: string; user_id: string; title: string; type: PlanType; start_week: number; end_week: number; hours_per_week: number; created_at: string }
export type NewPlan = Omit<Plan, 'id' | 'created_at'>;
export interface Certificate { id: string; name: string; round: string; apply_start: string; apply_end: string; exam_date: string; prep_weeks: number; default_study_hours: number; source_url: string }
export interface UserCertificate { user_id: string; certificate_id: string; study_hours: number }
export interface WeekLoadItem { source: 'plan' | 'certificate'; title: string; hours: number }
export interface WeekLoad { week: number; isExamWeek: boolean; total: number; ratio: number; level: LoadLevel; items: WeekLoadItem[] }
export interface Forecast { weeks: WeekLoad[]; summary: Record<LoadLevel, number> }

export const SEMESTER = {
  "label": "2026년 2학기",
  "start": "2026-08-31",
  "totalWeeks": 16,
  "midtermWeek": 8,
  "finalWeek": 15
} as const;
export const EXAM_WEIGHT = 1.5;
export const LEVEL_THRESHOLD = {
  "OK_BELOW": 0.8,
  "OVER_ABOVE": 1
} as const;
export const PLAN_DEFAULTS = {
  "class": {
    "label": "수업",
    "low": 4,
    "mid": 6,
    "high": 9,
    "hint": "3학점 전공 기준"
  },
  "activity": {
    "label": "활동",
    "low": 2,
    "mid": 4,
    "high": 8,
    "hint": "동아리·학회·대외활동"
  },
  "project": {
    "label": "프로젝트",
    "low": 3,
    "mid": 5,
    "high": 10,
    "hint": "팀 과제·공모전"
  }
} as const;
/** 화면 표시용 날씨 비유 (제안서 8장) */
export const LEVEL_LABEL: Record<LoadLevel, { text: string; weather: string; color: string }> = {
  ok: { text: '여유', weather: '맑음', color: '#3d8a5a' },
  warn: { text: '주의', weather: '흐림', color: '#c98a1f' },
  over: { text: '과부하', weather: '폭풍', color: '#c0463a' },
};

export const DEMO_PASSWORD = 'hakgi1234!';
export const demoUsers = [
  {
    "id": "a0000000-0000-4000-8000-000000000001",
    "email": "yebo@hakgi.test",
    "display_name": "김예보",
    "persona": "취업 준비생 (3학년) · 시연 시나리오 주인공"
  },
  {
    "id": "a0000000-0000-4000-8000-000000000002",
    "email": "jiwon@hakgi.test",
    "display_name": "이지원",
    "persona": "대외활동 지원 예정자 (2학년)"
  },
  {
    "id": "a0000000-0000-4000-8000-000000000003",
    "email": "woonyoung@hakgi.test",
    "display_name": "박운영",
    "persona": "학생회 운영진 (4학년)"
  },
  {
    "id": "a0000000-0000-4000-8000-000000000004",
    "email": "empty@hakgi.test",
    "display_name": "최수강",
    "persona": "수강신청 예정자 · 계획 없음 (빈 화면 테스트)"
  }
];

export const profiles: Profile[] = [
  {
    "user_id": "a0000000-0000-4000-8000-000000000001",
    "display_name": "김예보",
    "available_hours": 50,
    "semester_start": "2026-08-31"
  },
  {
    "user_id": "a0000000-0000-4000-8000-000000000002",
    "display_name": "이지원",
    "available_hours": 45,
    "semester_start": "2026-08-31"
  },
  {
    "user_id": "a0000000-0000-4000-8000-000000000003",
    "display_name": "박운영",
    "available_hours": 55,
    "semester_start": "2026-08-31"
  },
  {
    "user_id": "a0000000-0000-4000-8000-000000000004",
    "display_name": "최수강",
    "available_hours": 40,
    "semester_start": "2026-08-31"
  }
];
export const certificates: Certificate[] = [
  {
    "id": "c0000000-0000-4000-8000-000000000001",
    "name": "정보처리기사",
    "round": "2026년 정기 3회 실기",
    "apply_start": "2026-09-22",
    "apply_end": "2026-09-25",
    "exam_date": "2026-11-01",
    "prep_weeks": 6,
    "default_study_hours": 8,
    "source_url": "https://www.q-net.or.kr"
  },
  {
    "id": "c0000000-0000-4000-8000-000000000002",
    "name": "정보처리기사",
    "round": "2026년 정기 4회 필기",
    "apply_start": "2026-10-19",
    "apply_end": "2026-10-22",
    "exam_date": "2026-11-28",
    "prep_weeks": 6,
    "default_study_hours": 8,
    "source_url": "https://www.q-net.or.kr"
  },
  {
    "id": "c0000000-0000-4000-8000-000000000003",
    "name": "정보처리기사",
    "round": "2027년 정기 1회 필기",
    "apply_start": "2027-01-12",
    "apply_end": "2027-01-15",
    "exam_date": "2027-02-20",
    "prep_weeks": 6,
    "default_study_hours": 8,
    "source_url": "https://www.q-net.or.kr"
  },
  {
    "id": "c0000000-0000-4000-8000-000000000004",
    "name": "정보처리산업기사",
    "round": "2026년 정기 4회 필기",
    "apply_start": "2026-10-19",
    "apply_end": "2026-10-22",
    "exam_date": "2026-11-28",
    "prep_weeks": 5,
    "default_study_hours": 6,
    "source_url": "https://www.q-net.or.kr"
  },
  {
    "id": "c0000000-0000-4000-8000-000000000005",
    "name": "SQLD",
    "round": "제62회",
    "apply_start": "2026-10-05",
    "apply_end": "2026-10-16",
    "exam_date": "2026-11-14",
    "prep_weeks": 4,
    "default_study_hours": 6,
    "source_url": "https://www.dataq.or.kr"
  },
  {
    "id": "c0000000-0000-4000-8000-000000000006",
    "name": "ADsP",
    "round": "제51회",
    "apply_start": "2026-10-12",
    "apply_end": "2026-10-23",
    "exam_date": "2026-11-21",
    "prep_weeks": 4,
    "default_study_hours": 6,
    "source_url": "https://www.dataq.or.kr"
  },
  {
    "id": "c0000000-0000-4000-8000-000000000007",
    "name": "빅데이터분석기사",
    "round": "제13회 필기",
    "apply_start": "2026-09-07",
    "apply_end": "2026-09-11",
    "exam_date": "2026-10-10",
    "prep_weeks": 6,
    "default_study_hours": 8,
    "source_url": "https://www.dataq.or.kr"
  },
  {
    "id": "c0000000-0000-4000-8000-000000000008",
    "name": "컴퓨터활용능력 1급",
    "round": "2026년 상시 11월",
    "apply_start": "2026-10-26",
    "apply_end": "2026-11-06",
    "exam_date": "2026-11-21",
    "prep_weeks": 4,
    "default_study_hours": 7,
    "source_url": "https://license.korcham.net"
  },
  {
    "id": "c0000000-0000-4000-8000-000000000009",
    "name": "컴퓨터활용능력 2급",
    "round": "2026년 상시 10월",
    "apply_start": "2026-09-28",
    "apply_end": "2026-10-09",
    "exam_date": "2026-10-24",
    "prep_weeks": 3,
    "default_study_hours": 5,
    "source_url": "https://license.korcham.net"
  },
  {
    "id": "c0000000-0000-4000-8000-000000000010",
    "name": "정보보안기사",
    "round": "제28회 필기",
    "apply_start": "2026-08-17",
    "apply_end": "2026-08-21",
    "exam_date": "2026-09-19",
    "prep_weeks": 8,
    "default_study_hours": 10,
    "source_url": "https://www.kisq.or.kr"
  },
  {
    "id": "c0000000-0000-4000-8000-000000000011",
    "name": "리눅스마스터 2급",
    "round": "2026년 2차 1급·2급",
    "apply_start": "2026-10-26",
    "apply_end": "2026-11-02",
    "exam_date": "2026-12-12",
    "prep_weeks": 4,
    "default_study_hours": 5,
    "source_url": "https://www.ihd.or.kr"
  },
  {
    "id": "c0000000-0000-4000-8000-000000000012",
    "name": "네트워크관리사 2급",
    "round": "제84회 필기",
    "apply_start": "2026-10-05",
    "apply_end": "2026-10-09",
    "exam_date": "2026-11-08",
    "prep_weeks": 3,
    "default_study_hours": 5,
    "source_url": "https://www.icqa.or.kr"
  },
  {
    "id": "c0000000-0000-4000-8000-000000000013",
    "name": "한국사능력검정시험 심화",
    "round": "제79회",
    "apply_start": "2026-09-29",
    "apply_end": "2026-10-06",
    "exam_date": "2026-10-31",
    "prep_weeks": 4,
    "default_study_hours": 5,
    "source_url": "https://www.historyexam.go.kr"
  },
  {
    "id": "c0000000-0000-4000-8000-000000000014",
    "name": "TOEIC",
    "round": "2026년 11월 정기",
    "apply_start": "2026-09-28",
    "apply_end": "2026-10-30",
    "exam_date": "2026-11-15",
    "prep_weeks": 4,
    "default_study_hours": 6,
    "source_url": "https://exam.toeic.co.kr"
  },
  {
    "id": "c0000000-0000-4000-8000-000000000015",
    "name": "TOEIC Speaking",
    "round": "2026년 11월",
    "apply_start": "2026-10-12",
    "apply_end": "2026-11-05",
    "exam_date": "2026-11-08",
    "prep_weeks": 2,
    "default_study_hours": 4,
    "source_url": "https://exam.toeic.co.kr"
  },
  {
    "id": "c0000000-0000-4000-8000-000000000016",
    "name": "OPIc",
    "round": "2026년 12월",
    "apply_start": "2026-11-02",
    "apply_end": "2026-12-01",
    "exam_date": "2026-12-05",
    "prep_weeks": 3,
    "default_study_hours": 4,
    "source_url": "https://www.opic.or.kr"
  },
  {
    "id": "c0000000-0000-4000-8000-000000000017",
    "name": "전산회계 1급",
    "round": "제124회",
    "apply_start": "2026-10-29",
    "apply_end": "2026-11-04",
    "exam_date": "2026-12-05",
    "prep_weeks": 5,
    "default_study_hours": 6,
    "source_url": "https://license.kacpta.or.kr"
  },
  {
    "id": "c0000000-0000-4000-8000-000000000018",
    "name": "사회조사분석사 2급",
    "round": "2026년 정기 4회 필기",
    "apply_start": "2026-10-19",
    "apply_end": "2026-10-22",
    "exam_date": "2026-11-28",
    "prep_weeks": 6,
    "default_study_hours": 7,
    "source_url": "https://www.q-net.or.kr"
  },
  {
    "id": "c0000000-0000-4000-8000-000000000019",
    "name": "GTQ 1급",
    "round": "제155회",
    "apply_start": "2026-10-19",
    "apply_end": "2026-10-26",
    "exam_date": "2026-11-14",
    "prep_weeks": 3,
    "default_study_hours": 5,
    "source_url": "https://license.kpc.or.kr"
  },
  {
    "id": "c0000000-0000-4000-8000-000000000020",
    "name": "유통관리사 2급",
    "round": "2026년 3회",
    "apply_start": "2026-10-12",
    "apply_end": "2026-10-19",
    "exam_date": "2026-11-07",
    "prep_weeks": 4,
    "default_study_hours": 5,
    "source_url": "https://license.korcham.net"
  }
];
export const plans: Plan[] = [
  {
    "id": "b0000000-0000-4000-0001-000000000001",
    "user_id": "a0000000-0000-4000-8000-000000000001",
    "title": "운영체제",
    "type": "class",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 6,
    "created_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0001-000000000002",
    "user_id": "a0000000-0000-4000-8000-000000000001",
    "title": "데이터베이스",
    "type": "class",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 6,
    "created_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0001-000000000003",
    "user_id": "a0000000-0000-4000-8000-000000000001",
    "title": "컴퓨터네트워크",
    "type": "class",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 6,
    "created_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0001-000000000004",
    "user_id": "a0000000-0000-4000-8000-000000000001",
    "title": "소프트웨어공학",
    "type": "class",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 4,
    "created_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0001-000000000005",
    "user_id": "a0000000-0000-4000-8000-000000000001",
    "title": "교양 글쓰기",
    "type": "class",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 3,
    "created_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0001-000000000006",
    "user_id": "a0000000-0000-4000-8000-000000000001",
    "title": "프로그래밍 학회",
    "type": "activity",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 4,
    "created_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0001-000000000007",
    "user_id": "a0000000-0000-4000-8000-000000000001",
    "title": "DB 팀 프로젝트",
    "type": "project",
    "start_week": 6,
    "end_week": 10,
    "hours_per_week": 4,
    "created_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0002-000000000001",
    "user_id": "a0000000-0000-4000-8000-000000000002",
    "title": "경영학원론",
    "type": "class",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 5,
    "created_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0002-000000000002",
    "user_id": "a0000000-0000-4000-8000-000000000002",
    "title": "마케팅원론",
    "type": "class",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 5,
    "created_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0002-000000000003",
    "user_id": "a0000000-0000-4000-8000-000000000002",
    "title": "회계원리",
    "type": "class",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 6,
    "created_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0002-000000000004",
    "user_id": "a0000000-0000-4000-8000-000000000002",
    "title": "통계학",
    "type": "class",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 6,
    "created_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0002-000000000005",
    "user_id": "a0000000-0000-4000-8000-000000000002",
    "title": "영어회화",
    "type": "class",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 2,
    "created_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0002-000000000006",
    "user_id": "a0000000-0000-4000-8000-000000000002",
    "title": "사진 동아리",
    "type": "activity",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 3,
    "created_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0002-000000000007",
    "user_id": "a0000000-0000-4000-8000-000000000002",
    "title": "교내 마케팅 공모전",
    "type": "project",
    "start_week": 3,
    "end_week": 9,
    "hours_per_week": 5,
    "created_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0003-000000000001",
    "user_id": "a0000000-0000-4000-8000-000000000003",
    "title": "졸업 프로젝트",
    "type": "project",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 10,
    "created_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0003-000000000002",
    "user_id": "a0000000-0000-4000-8000-000000000003",
    "title": "데이터마이닝",
    "type": "class",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 6,
    "created_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0003-000000000003",
    "user_id": "a0000000-0000-4000-8000-000000000003",
    "title": "정보보호개론",
    "type": "class",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 6,
    "created_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0003-000000000004",
    "user_id": "a0000000-0000-4000-8000-000000000003",
    "title": "진로설계",
    "type": "class",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 2,
    "created_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0003-000000000005",
    "user_id": "a0000000-0000-4000-8000-000000000003",
    "title": "단과대 학생회",
    "type": "activity",
    "start_week": 1,
    "end_week": 16,
    "hours_per_week": 10,
    "created_at": "2026-09-01T09:00:00+09:00"
  },
  {
    "id": "b0000000-0000-4000-0003-000000000006",
    "user_id": "a0000000-0000-4000-8000-000000000003",
    "title": "축제 준비위원회",
    "type": "activity",
    "start_week": 6,
    "end_week": 8,
    "hours_per_week": 8,
    "created_at": "2026-09-01T09:00:00+09:00"
  }
];
export const userCertificates: UserCertificate[] = [
  {
    "user_id": "a0000000-0000-4000-8000-000000000001",
    "certificate_id": "c0000000-0000-4000-8000-000000000002",
    "study_hours": 8
  },
  {
    "user_id": "a0000000-0000-4000-8000-000000000002",
    "certificate_id": "c0000000-0000-4000-8000-000000000014",
    "study_hours": 5
  },
  {
    "user_id": "a0000000-0000-4000-8000-000000000003",
    "certificate_id": "c0000000-0000-4000-8000-000000000005",
    "study_hours": 6
  },
  {
    "user_id": "a0000000-0000-4000-8000-000000000003",
    "certificate_id": "c0000000-0000-4000-8000-000000000006",
    "study_hours": 6
  }
];

/** F-06 사전 검토 시연용 (김예보가 저장 전에 입력해 보는 계획) */
export const previewPlan: NewPlan = {
  "user_id": "a0000000-0000-4000-8000-000000000001",
  "title": "대학생 서포터즈 콘텐츠 제작",
  "type": "activity",
  "start_week": 9,
  "end_week": 14,
  "hours_per_week": 10
};

/** 사용자별 예상 예보 (참조 산출 로직 결과) */
export const expectedForecast: Record<string, Forecast> = {
  "a0000000-0000-4000-8000-000000000001": {
    "weeks": [
      {
        "week": 1,
        "isExamWeek": false,
        "total": 29,
        "ratio": 58,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "hours": 4
          },
          {
            "source": "plan",
            "title": "교양 글쓰기",
            "hours": 3
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "hours": 4
          }
        ]
      },
      {
        "week": 2,
        "isExamWeek": false,
        "total": 29,
        "ratio": 58,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "hours": 4
          },
          {
            "source": "plan",
            "title": "교양 글쓰기",
            "hours": 3
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "hours": 4
          }
        ]
      },
      {
        "week": 3,
        "isExamWeek": false,
        "total": 29,
        "ratio": 58,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "hours": 4
          },
          {
            "source": "plan",
            "title": "교양 글쓰기",
            "hours": 3
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "hours": 4
          }
        ]
      },
      {
        "week": 4,
        "isExamWeek": false,
        "total": 29,
        "ratio": 58,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "hours": 4
          },
          {
            "source": "plan",
            "title": "교양 글쓰기",
            "hours": 3
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "hours": 4
          }
        ]
      },
      {
        "week": 5,
        "isExamWeek": false,
        "total": 29,
        "ratio": 58,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "hours": 4
          },
          {
            "source": "plan",
            "title": "교양 글쓰기",
            "hours": 3
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "hours": 4
          }
        ]
      },
      {
        "week": 6,
        "isExamWeek": false,
        "total": 33,
        "ratio": 66,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "hours": 4
          },
          {
            "source": "plan",
            "title": "교양 글쓰기",
            "hours": 3
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "hours": 4
          },
          {
            "source": "plan",
            "title": "DB 팀 프로젝트",
            "hours": 4
          }
        ]
      },
      {
        "week": 7,
        "isExamWeek": false,
        "total": 41,
        "ratio": 82,
        "level": "warn",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "hours": 4
          },
          {
            "source": "plan",
            "title": "교양 글쓰기",
            "hours": 3
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "hours": 4
          },
          {
            "source": "plan",
            "title": "DB 팀 프로젝트",
            "hours": 4
          },
          {
            "source": "certificate",
            "title": "정보처리기사 준비",
            "hours": 8
          }
        ]
      },
      {
        "week": 8,
        "isExamWeek": true,
        "total": 53.5,
        "ratio": 107,
        "level": "over",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "hours": 9
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "hours": 9
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "hours": 9
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "교양 글쓰기",
            "hours": 4.5
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "hours": 4
          },
          {
            "source": "plan",
            "title": "DB 팀 프로젝트",
            "hours": 4
          },
          {
            "source": "certificate",
            "title": "정보처리기사 준비",
            "hours": 8
          }
        ]
      },
      {
        "week": 9,
        "isExamWeek": false,
        "total": 41,
        "ratio": 82,
        "level": "warn",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "hours": 4
          },
          {
            "source": "plan",
            "title": "교양 글쓰기",
            "hours": 3
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "hours": 4
          },
          {
            "source": "plan",
            "title": "DB 팀 프로젝트",
            "hours": 4
          },
          {
            "source": "certificate",
            "title": "정보처리기사 준비",
            "hours": 8
          }
        ]
      },
      {
        "week": 10,
        "isExamWeek": false,
        "total": 41,
        "ratio": 82,
        "level": "warn",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "hours": 4
          },
          {
            "source": "plan",
            "title": "교양 글쓰기",
            "hours": 3
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "hours": 4
          },
          {
            "source": "plan",
            "title": "DB 팀 프로젝트",
            "hours": 4
          },
          {
            "source": "certificate",
            "title": "정보처리기사 준비",
            "hours": 8
          }
        ]
      },
      {
        "week": 11,
        "isExamWeek": false,
        "total": 37,
        "ratio": 74,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "hours": 4
          },
          {
            "source": "plan",
            "title": "교양 글쓰기",
            "hours": 3
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "hours": 4
          },
          {
            "source": "certificate",
            "title": "정보처리기사 준비",
            "hours": 8
          }
        ]
      },
      {
        "week": 12,
        "isExamWeek": false,
        "total": 37,
        "ratio": 74,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "hours": 4
          },
          {
            "source": "plan",
            "title": "교양 글쓰기",
            "hours": 3
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "hours": 4
          },
          {
            "source": "certificate",
            "title": "정보처리기사 준비",
            "hours": 8
          }
        ]
      },
      {
        "week": 13,
        "isExamWeek": false,
        "total": 29,
        "ratio": 58,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "hours": 4
          },
          {
            "source": "plan",
            "title": "교양 글쓰기",
            "hours": 3
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "hours": 4
          }
        ]
      },
      {
        "week": 14,
        "isExamWeek": false,
        "total": 29,
        "ratio": 58,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "hours": 4
          },
          {
            "source": "plan",
            "title": "교양 글쓰기",
            "hours": 3
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "hours": 4
          }
        ]
      },
      {
        "week": 15,
        "isExamWeek": true,
        "total": 41.5,
        "ratio": 83,
        "level": "warn",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "hours": 9
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "hours": 9
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "hours": 9
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "교양 글쓰기",
            "hours": 4.5
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "hours": 4
          }
        ]
      },
      {
        "week": 16,
        "isExamWeek": false,
        "total": 29,
        "ratio": 58,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "운영체제",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "데이터베이스",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "컴퓨터네트워크",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "소프트웨어공학",
            "hours": 4
          },
          {
            "source": "plan",
            "title": "교양 글쓰기",
            "hours": 3
          },
          {
            "source": "plan",
            "title": "프로그래밍 학회",
            "hours": 4
          }
        ]
      }
    ],
    "summary": {
      "over": 1,
      "warn": 4,
      "ok": 11
    }
  },
  "a0000000-0000-4000-8000-000000000002": {
    "weeks": [
      {
        "week": 1,
        "isExamWeek": false,
        "total": 27,
        "ratio": 60,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "회계원리",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "통계학",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "영어회화",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "hours": 3
          }
        ]
      },
      {
        "week": 2,
        "isExamWeek": false,
        "total": 27,
        "ratio": 60,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "회계원리",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "통계학",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "영어회화",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "hours": 3
          }
        ]
      },
      {
        "week": 3,
        "isExamWeek": false,
        "total": 32,
        "ratio": 71.1,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "회계원리",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "통계학",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "영어회화",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "hours": 3
          },
          {
            "source": "plan",
            "title": "교내 마케팅 공모전",
            "hours": 5
          }
        ]
      },
      {
        "week": 4,
        "isExamWeek": false,
        "total": 32,
        "ratio": 71.1,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "회계원리",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "통계학",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "영어회화",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "hours": 3
          },
          {
            "source": "plan",
            "title": "교내 마케팅 공모전",
            "hours": 5
          }
        ]
      },
      {
        "week": 5,
        "isExamWeek": false,
        "total": 32,
        "ratio": 71.1,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "회계원리",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "통계학",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "영어회화",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "hours": 3
          },
          {
            "source": "plan",
            "title": "교내 마케팅 공모전",
            "hours": 5
          }
        ]
      },
      {
        "week": 6,
        "isExamWeek": false,
        "total": 32,
        "ratio": 71.1,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "회계원리",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "통계학",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "영어회화",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "hours": 3
          },
          {
            "source": "plan",
            "title": "교내 마케팅 공모전",
            "hours": 5
          }
        ]
      },
      {
        "week": 7,
        "isExamWeek": false,
        "total": 37,
        "ratio": 82.2,
        "level": "warn",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "회계원리",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "통계학",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "영어회화",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "hours": 3
          },
          {
            "source": "plan",
            "title": "교내 마케팅 공모전",
            "hours": 5
          },
          {
            "source": "certificate",
            "title": "TOEIC 준비",
            "hours": 5
          }
        ]
      },
      {
        "week": 8,
        "isExamWeek": true,
        "total": 49,
        "ratio": 108.9,
        "level": "over",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "hours": 7.5
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "hours": 7.5
          },
          {
            "source": "plan",
            "title": "회계원리",
            "hours": 9
          },
          {
            "source": "plan",
            "title": "통계학",
            "hours": 9
          },
          {
            "source": "plan",
            "title": "영어회화",
            "hours": 3
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "hours": 3
          },
          {
            "source": "plan",
            "title": "교내 마케팅 공모전",
            "hours": 5
          },
          {
            "source": "certificate",
            "title": "TOEIC 준비",
            "hours": 5
          }
        ]
      },
      {
        "week": 9,
        "isExamWeek": false,
        "total": 37,
        "ratio": 82.2,
        "level": "warn",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "회계원리",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "통계학",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "영어회화",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "hours": 3
          },
          {
            "source": "plan",
            "title": "교내 마케팅 공모전",
            "hours": 5
          },
          {
            "source": "certificate",
            "title": "TOEIC 준비",
            "hours": 5
          }
        ]
      },
      {
        "week": 10,
        "isExamWeek": false,
        "total": 32,
        "ratio": 71.1,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "회계원리",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "통계학",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "영어회화",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "hours": 3
          },
          {
            "source": "certificate",
            "title": "TOEIC 준비",
            "hours": 5
          }
        ]
      },
      {
        "week": 11,
        "isExamWeek": false,
        "total": 27,
        "ratio": 60,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "회계원리",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "통계학",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "영어회화",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "hours": 3
          }
        ]
      },
      {
        "week": 12,
        "isExamWeek": false,
        "total": 27,
        "ratio": 60,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "회계원리",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "통계학",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "영어회화",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "hours": 3
          }
        ]
      },
      {
        "week": 13,
        "isExamWeek": false,
        "total": 27,
        "ratio": 60,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "회계원리",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "통계학",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "영어회화",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "hours": 3
          }
        ]
      },
      {
        "week": 14,
        "isExamWeek": false,
        "total": 27,
        "ratio": 60,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "회계원리",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "통계학",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "영어회화",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "hours": 3
          }
        ]
      },
      {
        "week": 15,
        "isExamWeek": true,
        "total": 39,
        "ratio": 86.7,
        "level": "warn",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "hours": 7.5
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "hours": 7.5
          },
          {
            "source": "plan",
            "title": "회계원리",
            "hours": 9
          },
          {
            "source": "plan",
            "title": "통계학",
            "hours": 9
          },
          {
            "source": "plan",
            "title": "영어회화",
            "hours": 3
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "hours": 3
          }
        ]
      },
      {
        "week": 16,
        "isExamWeek": false,
        "total": 27,
        "ratio": 60,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "경영학원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "마케팅원론",
            "hours": 5
          },
          {
            "source": "plan",
            "title": "회계원리",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "통계학",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "영어회화",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "사진 동아리",
            "hours": 3
          }
        ]
      }
    ],
    "summary": {
      "over": 1,
      "warn": 3,
      "ok": 12
    }
  },
  "a0000000-0000-4000-8000-000000000003": {
    "weeks": [
      {
        "week": 1,
        "isExamWeek": false,
        "total": 34,
        "ratio": 61.8,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "hours": 10
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "진로설계",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "hours": 10
          }
        ]
      },
      {
        "week": 2,
        "isExamWeek": false,
        "total": 34,
        "ratio": 61.8,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "hours": 10
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "진로설계",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "hours": 10
          }
        ]
      },
      {
        "week": 3,
        "isExamWeek": false,
        "total": 34,
        "ratio": 61.8,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "hours": 10
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "진로설계",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "hours": 10
          }
        ]
      },
      {
        "week": 4,
        "isExamWeek": false,
        "total": 34,
        "ratio": 61.8,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "hours": 10
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "진로설계",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "hours": 10
          }
        ]
      },
      {
        "week": 5,
        "isExamWeek": false,
        "total": 34,
        "ratio": 61.8,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "hours": 10
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "진로설계",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "hours": 10
          }
        ]
      },
      {
        "week": 6,
        "isExamWeek": false,
        "total": 42,
        "ratio": 76.4,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "hours": 10
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "진로설계",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "hours": 10
          },
          {
            "source": "plan",
            "title": "축제 준비위원회",
            "hours": 8
          }
        ]
      },
      {
        "week": 7,
        "isExamWeek": false,
        "total": 48,
        "ratio": 87.3,
        "level": "warn",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "hours": 10
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "진로설계",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "hours": 10
          },
          {
            "source": "plan",
            "title": "축제 준비위원회",
            "hours": 8
          },
          {
            "source": "certificate",
            "title": "SQLD 준비",
            "hours": 6
          }
        ]
      },
      {
        "week": 8,
        "isExamWeek": true,
        "total": 61,
        "ratio": 110.9,
        "level": "over",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "hours": 10
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "hours": 9
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "hours": 9
          },
          {
            "source": "plan",
            "title": "진로설계",
            "hours": 3
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "hours": 10
          },
          {
            "source": "plan",
            "title": "축제 준비위원회",
            "hours": 8
          },
          {
            "source": "certificate",
            "title": "SQLD 준비",
            "hours": 6
          },
          {
            "source": "certificate",
            "title": "ADsP 준비",
            "hours": 6
          }
        ]
      },
      {
        "week": 9,
        "isExamWeek": false,
        "total": 46,
        "ratio": 83.6,
        "level": "warn",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "hours": 10
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "진로설계",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "hours": 10
          },
          {
            "source": "certificate",
            "title": "SQLD 준비",
            "hours": 6
          },
          {
            "source": "certificate",
            "title": "ADsP 준비",
            "hours": 6
          }
        ]
      },
      {
        "week": 10,
        "isExamWeek": false,
        "total": 46,
        "ratio": 83.6,
        "level": "warn",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "hours": 10
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "진로설계",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "hours": 10
          },
          {
            "source": "certificate",
            "title": "SQLD 준비",
            "hours": 6
          },
          {
            "source": "certificate",
            "title": "ADsP 준비",
            "hours": 6
          }
        ]
      },
      {
        "week": 11,
        "isExamWeek": false,
        "total": 40,
        "ratio": 72.7,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "hours": 10
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "진로설계",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "hours": 10
          },
          {
            "source": "certificate",
            "title": "ADsP 준비",
            "hours": 6
          }
        ]
      },
      {
        "week": 12,
        "isExamWeek": false,
        "total": 34,
        "ratio": 61.8,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "hours": 10
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "진로설계",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "hours": 10
          }
        ]
      },
      {
        "week": 13,
        "isExamWeek": false,
        "total": 34,
        "ratio": 61.8,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "hours": 10
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "진로설계",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "hours": 10
          }
        ]
      },
      {
        "week": 14,
        "isExamWeek": false,
        "total": 34,
        "ratio": 61.8,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "hours": 10
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "진로설계",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "hours": 10
          }
        ]
      },
      {
        "week": 15,
        "isExamWeek": true,
        "total": 41,
        "ratio": 74.5,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "hours": 10
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "hours": 9
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "hours": 9
          },
          {
            "source": "plan",
            "title": "진로설계",
            "hours": 3
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "hours": 10
          }
        ]
      },
      {
        "week": 16,
        "isExamWeek": false,
        "total": 34,
        "ratio": 61.8,
        "level": "ok",
        "items": [
          {
            "source": "plan",
            "title": "졸업 프로젝트",
            "hours": 10
          },
          {
            "source": "plan",
            "title": "데이터마이닝",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "정보보호개론",
            "hours": 6
          },
          {
            "source": "plan",
            "title": "진로설계",
            "hours": 2
          },
          {
            "source": "plan",
            "title": "단과대 학생회",
            "hours": 10
          }
        ]
      }
    ],
    "summary": {
      "over": 1,
      "warn": 3,
      "ok": 12
    }
  },
  "a0000000-0000-4000-8000-000000000004": {
    "weeks": [
      {
        "week": 1,
        "isExamWeek": false,
        "total": 0,
        "ratio": 0,
        "level": "ok",
        "items": []
      },
      {
        "week": 2,
        "isExamWeek": false,
        "total": 0,
        "ratio": 0,
        "level": "ok",
        "items": []
      },
      {
        "week": 3,
        "isExamWeek": false,
        "total": 0,
        "ratio": 0,
        "level": "ok",
        "items": []
      },
      {
        "week": 4,
        "isExamWeek": false,
        "total": 0,
        "ratio": 0,
        "level": "ok",
        "items": []
      },
      {
        "week": 5,
        "isExamWeek": false,
        "total": 0,
        "ratio": 0,
        "level": "ok",
        "items": []
      },
      {
        "week": 6,
        "isExamWeek": false,
        "total": 0,
        "ratio": 0,
        "level": "ok",
        "items": []
      },
      {
        "week": 7,
        "isExamWeek": false,
        "total": 0,
        "ratio": 0,
        "level": "ok",
        "items": []
      },
      {
        "week": 8,
        "isExamWeek": true,
        "total": 0,
        "ratio": 0,
        "level": "ok",
        "items": []
      },
      {
        "week": 9,
        "isExamWeek": false,
        "total": 0,
        "ratio": 0,
        "level": "ok",
        "items": []
      },
      {
        "week": 10,
        "isExamWeek": false,
        "total": 0,
        "ratio": 0,
        "level": "ok",
        "items": []
      },
      {
        "week": 11,
        "isExamWeek": false,
        "total": 0,
        "ratio": 0,
        "level": "ok",
        "items": []
      },
      {
        "week": 12,
        "isExamWeek": false,
        "total": 0,
        "ratio": 0,
        "level": "ok",
        "items": []
      },
      {
        "week": 13,
        "isExamWeek": false,
        "total": 0,
        "ratio": 0,
        "level": "ok",
        "items": []
      },
      {
        "week": 14,
        "isExamWeek": false,
        "total": 0,
        "ratio": 0,
        "level": "ok",
        "items": []
      },
      {
        "week": 15,
        "isExamWeek": true,
        "total": 0,
        "ratio": 0,
        "level": "ok",
        "items": []
      },
      {
        "week": 16,
        "isExamWeek": false,
        "total": 0,
        "ratio": 0,
        "level": "ok",
        "items": []
      }
    ],
    "summary": {
      "over": 0,
      "warn": 0,
      "ok": 16
    }
  }
};
/** 김예보 + previewPlan 적용 시 예상 예보 */
export const expectedForecastWithPreview: Forecast = {
  "weeks": [
    {
      "week": 1,
      "isExamWeek": false,
      "total": 29,
      "ratio": 58,
      "level": "ok",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "hours": 4
        },
        {
          "source": "plan",
          "title": "교양 글쓰기",
          "hours": 3
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "hours": 4
        }
      ]
    },
    {
      "week": 2,
      "isExamWeek": false,
      "total": 29,
      "ratio": 58,
      "level": "ok",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "hours": 4
        },
        {
          "source": "plan",
          "title": "교양 글쓰기",
          "hours": 3
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "hours": 4
        }
      ]
    },
    {
      "week": 3,
      "isExamWeek": false,
      "total": 29,
      "ratio": 58,
      "level": "ok",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "hours": 4
        },
        {
          "source": "plan",
          "title": "교양 글쓰기",
          "hours": 3
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "hours": 4
        }
      ]
    },
    {
      "week": 4,
      "isExamWeek": false,
      "total": 29,
      "ratio": 58,
      "level": "ok",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "hours": 4
        },
        {
          "source": "plan",
          "title": "교양 글쓰기",
          "hours": 3
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "hours": 4
        }
      ]
    },
    {
      "week": 5,
      "isExamWeek": false,
      "total": 29,
      "ratio": 58,
      "level": "ok",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "hours": 4
        },
        {
          "source": "plan",
          "title": "교양 글쓰기",
          "hours": 3
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "hours": 4
        }
      ]
    },
    {
      "week": 6,
      "isExamWeek": false,
      "total": 33,
      "ratio": 66,
      "level": "ok",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "hours": 4
        },
        {
          "source": "plan",
          "title": "교양 글쓰기",
          "hours": 3
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "hours": 4
        },
        {
          "source": "plan",
          "title": "DB 팀 프로젝트",
          "hours": 4
        }
      ]
    },
    {
      "week": 7,
      "isExamWeek": false,
      "total": 41,
      "ratio": 82,
      "level": "warn",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "hours": 4
        },
        {
          "source": "plan",
          "title": "교양 글쓰기",
          "hours": 3
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "hours": 4
        },
        {
          "source": "plan",
          "title": "DB 팀 프로젝트",
          "hours": 4
        },
        {
          "source": "certificate",
          "title": "정보처리기사 준비",
          "hours": 8
        }
      ]
    },
    {
      "week": 8,
      "isExamWeek": true,
      "total": 53.5,
      "ratio": 107,
      "level": "over",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "hours": 9
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "hours": 9
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "hours": 9
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "교양 글쓰기",
          "hours": 4.5
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "hours": 4
        },
        {
          "source": "plan",
          "title": "DB 팀 프로젝트",
          "hours": 4
        },
        {
          "source": "certificate",
          "title": "정보처리기사 준비",
          "hours": 8
        }
      ]
    },
    {
      "week": 9,
      "isExamWeek": false,
      "total": 51,
      "ratio": 102,
      "level": "over",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "hours": 4
        },
        {
          "source": "plan",
          "title": "교양 글쓰기",
          "hours": 3
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "hours": 4
        },
        {
          "source": "plan",
          "title": "DB 팀 프로젝트",
          "hours": 4
        },
        {
          "source": "plan",
          "title": "대학생 서포터즈 콘텐츠 제작",
          "hours": 10
        },
        {
          "source": "certificate",
          "title": "정보처리기사 준비",
          "hours": 8
        }
      ]
    },
    {
      "week": 10,
      "isExamWeek": false,
      "total": 51,
      "ratio": 102,
      "level": "over",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "hours": 4
        },
        {
          "source": "plan",
          "title": "교양 글쓰기",
          "hours": 3
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "hours": 4
        },
        {
          "source": "plan",
          "title": "DB 팀 프로젝트",
          "hours": 4
        },
        {
          "source": "plan",
          "title": "대학생 서포터즈 콘텐츠 제작",
          "hours": 10
        },
        {
          "source": "certificate",
          "title": "정보처리기사 준비",
          "hours": 8
        }
      ]
    },
    {
      "week": 11,
      "isExamWeek": false,
      "total": 47,
      "ratio": 94,
      "level": "warn",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "hours": 4
        },
        {
          "source": "plan",
          "title": "교양 글쓰기",
          "hours": 3
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "hours": 4
        },
        {
          "source": "plan",
          "title": "대학생 서포터즈 콘텐츠 제작",
          "hours": 10
        },
        {
          "source": "certificate",
          "title": "정보처리기사 준비",
          "hours": 8
        }
      ]
    },
    {
      "week": 12,
      "isExamWeek": false,
      "total": 47,
      "ratio": 94,
      "level": "warn",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "hours": 4
        },
        {
          "source": "plan",
          "title": "교양 글쓰기",
          "hours": 3
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "hours": 4
        },
        {
          "source": "plan",
          "title": "대학생 서포터즈 콘텐츠 제작",
          "hours": 10
        },
        {
          "source": "certificate",
          "title": "정보처리기사 준비",
          "hours": 8
        }
      ]
    },
    {
      "week": 13,
      "isExamWeek": false,
      "total": 39,
      "ratio": 78,
      "level": "ok",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "hours": 4
        },
        {
          "source": "plan",
          "title": "교양 글쓰기",
          "hours": 3
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "hours": 4
        },
        {
          "source": "plan",
          "title": "대학생 서포터즈 콘텐츠 제작",
          "hours": 10
        }
      ]
    },
    {
      "week": 14,
      "isExamWeek": false,
      "total": 39,
      "ratio": 78,
      "level": "ok",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "hours": 4
        },
        {
          "source": "plan",
          "title": "교양 글쓰기",
          "hours": 3
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "hours": 4
        },
        {
          "source": "plan",
          "title": "대학생 서포터즈 콘텐츠 제작",
          "hours": 10
        }
      ]
    },
    {
      "week": 15,
      "isExamWeek": true,
      "total": 41.5,
      "ratio": 83,
      "level": "warn",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "hours": 9
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "hours": 9
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "hours": 9
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "교양 글쓰기",
          "hours": 4.5
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "hours": 4
        }
      ]
    },
    {
      "week": 16,
      "isExamWeek": false,
      "total": 29,
      "ratio": 58,
      "level": "ok",
      "items": [
        {
          "source": "plan",
          "title": "운영체제",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "데이터베이스",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "컴퓨터네트워크",
          "hours": 6
        },
        {
          "source": "plan",
          "title": "소프트웨어공학",
          "hours": 4
        },
        {
          "source": "plan",
          "title": "교양 글쓰기",
          "hours": 3
        },
        {
          "source": "plan",
          "title": "프로그래밍 학회",
          "hours": 4
        }
      ]
    }
  ],
  "summary": {
    "over": 3,
    "warn": 4,
    "ok": 9
  }
};
