// 학기예보 더미데이터 생성기 — 기준: 「학기예보 요구사항 명세서」 (2026-10-13)
// 이 파일 하나가 원본입니다. 수정 후 `node scripts/generate-dummy.mjs` 를 실행하면
//   - supabase/seed.sql          (로컬 Supabase 시드, 명세서 5.6)
//   - src/mocks/dummy-data.ts    (프론트 목데이터 + 예상 예보 결과)
// 두 파일이 같은 데이터로 다시 만들어집니다. 생성된 파일은 직접 고치지 마세요.
// 명세서 4.5 검증 예시와 값이 다르면 생성이 실패합니다.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// ─────────────────────────────────────────────
// 1. 산출 상수 (명세서 4장, 2.3)
// ─────────────────────────────────────────────
const TOTAL_WEEKS = 16;
const EXAM_WEIGHT = 1.5;
const LEVEL = { CLOUDY_FROM: 0.8, STORM_ABOVE: 1.0 }; // <0.8 맑음, 0.8~1.0 흐림, >1.0 폭풍
const SEMESTER_START = '2026-08-31'; // 2026년 2학기 개강일 = 1주차 첫날 (10/24부터 월요일이 아니어도 됨)
const DEMO_TODAY = '2026-10-13'; // 7주차. 시연일 10/20은 8주차(중간고사)

// F-03 유형별 기본값 (명세서 3장 표 — 보완). 10/24 QA: 가용 시간에서 수업 시간을 빼므로 수업은 과제·복습 시간만
const PLAN_DEFAULTS = {
  class: { unit: '학점당 시간/주 (수업 밖 공부)', low: 1, normal: 1.5, high: 2 },
  activity: { unit: '시간/주', low: 2, normal: 4, high: 8 },
  project: { unit: '시간/주', low: 3, normal: 6, high: 10 },
};
function defaultHours(type, level, credits) {
  const rate = PLAN_DEFAULTS[type][level];
  return type === 'class' ? rate * credits : rate;
}

// ─────────────────────────────────────────────
// 2. 자격증 회차 (공용, 15~20종) — 2026-10-14 실제 공고 기준 (명세서 9.1)
//    날짜 출처: 시행 기관 공고 및 공고를 옮긴 수험 정보 사이트. 최종 일정은 화면에서 "시행 기관에서 확인" 안내.
//    - CBT·기간형 시험(기사·산업기사)은 시험 기간의 첫날을 exam_date 로 둡니다 (준비 기간이 가장 길게 잡히도록).
//    - 2027년 회차는 2026-10-14 기준 공고 전이라 2026년 같은 회차를 참고한 예상값이며 회차 이름에 "(예정)"을 붙입니다.
//    - 공식 날짜를 확인하지 못한 자격증(TOEIC·리눅스마스터·정보보안기사 등)은 넣지 않았습니다.
//    10/13 기준 상태: 접수 중(SQLD 63회) / 접수 전(빅데이터 실기, 전산회계 129회 등) / 접수 마감(FR-04-2) / 학기 밖(FR-04-6)
// ─────────────────────────────────────────────
const cid = (n) => `c0000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const C = (n, name, round, apply_start, apply_end, exam_date, prep_weeks, default_study_hours, source_url) =>
  ({ id: cid(n), name, round, apply_start, apply_end, exam_date, prep_weeks, default_study_hours, source_url, owner_id: null }); // owner_id null = 공용 회차
const QNET = 'https://www.q-net.or.kr';
const DATAQ = 'https://www.dataq.or.kr';
const certificates = [
  // 국가기술자격 기사·산업기사 2026 정기 3회 (기사·산업기사 공통 일정, 한국산업인력공단 시행공고)
  C(1, '정보처리기사', '2026년 정기 3회 필기', '2026-07-20', '2026-07-23', '2026-08-07', 6, 8, QNET), // CBT 8/7~9/1
  C(2, '정보처리기사', '2026년 정기 3회 실기', '2026-09-21', '2026-09-28', '2026-10-24', 6, 8, QNET), // 실기 10/24~11/13 → 8주차
  C(3, '정보처리기사', '2027년 정기 1회 필기 (예정)', '2027-01-11', '2027-01-14', '2027-01-29', 6, 8, QNET), // 2026년 1회(1/12~1/15, CBT 1/30~) 참고 예상
  C(4, '정보처리산업기사', '2026년 정기 3회 필기', '2026-07-20', '2026-07-23', '2026-08-07', 5, 6, QNET),
  C(5, '정보처리산업기사', '2026년 정기 3회 실기', '2026-09-21', '2026-09-28', '2026-10-24', 5, 6, QNET),
  // 데이터자격검정 (한국데이터산업진흥원)
  C(6, 'SQLD', '제62회', '2026-07-20', '2026-07-24', '2026-08-22', 4, 6, DATAQ),
  C(7, 'SQLD', '제63회', '2026-10-12', '2026-10-16', '2026-11-14', 4, 6, DATAQ),
  C(8, 'ADsP', '제50회', '2026-07-06', '2026-07-10', '2026-08-08', 4, 6, DATAQ),
  C(9, 'ADsP', '제51회', '2026-09-28', '2026-10-02', '2026-10-31', 4, 6, DATAQ),
  C(10, '빅데이터분석기사', '제13회 필기', '2026-08-03', '2026-08-07', '2026-09-05', 6, 8, DATAQ),
  C(11, '빅데이터분석기사', '제13회 실기', '2026-10-26', '2026-10-30', '2026-11-28', 6, 8, DATAQ), // 발표일(10/27) 마감 알림 배너용
  // 그 밖의 기관
  C(12, '한국사능력검정시험 심화', '제80회', '2026-09-15', '2026-09-22', '2026-10-17', 4, 5, 'https://www.historyexam.go.kr'), // 공식 사이트 확인
  C(13, '전산회계 1급', '제128회', '2026-08-27', '2026-09-02', '2026-10-03', 5, 6, 'https://license.kacpta.or.kr'),
  C(14, '전산회계 1급', '제129회', '2026-11-05', '2026-11-11', '2026-12-05', 5, 6, 'https://license.kacpta.or.kr'),
  C(15, '유통관리사 2급', '2026년 2회', '2026-07-30', '2026-08-05', '2026-08-22', 4, 5, 'https://license.korcham.net'),
];
const certById = Object.fromEntries(certificates.map((c) => [c.id, c]));

// ─────────────────────────────────────────────
// 3. 데모 사용자 — 로컬 로그인 비밀번호 공통 (FR-01-1 규칙: 8자 이상, 영문·숫자 포함)
//    plan: [제목, 유형, 학점|null, 단계, 시작, 종료, (custom일 때 시간), { priority, start_date, end_date, category }]
//    10/24: 수업 기본값이 바뀌어(3학점 보통 6→4.5h) 4.5 검증 예시·경계값을 지키려고 기존 수업은 직접 입력(custom) 시간으로 둡니다.
//    daily_hours: 요일별 가용 시간 [월~일], 합계 = available_hours
//    cert: [회차 id, 주당 학습시간, 준비 주수(생략 시 회차 기본값), 알림 발송 시각]
// ─────────────────────────────────────────────
const DEMO_PASSWORD = 'hakgi1234';
const uid = (n) => `a0000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const pid = (u, n) => `b0000000-0000-4000-${String(u).padStart(4, '0')}-${String(n).padStart(12, '0')}`;
const catId = (u, n) => `d0000000-0000-4000-${String(u).padStart(4, '0')}-${String(n).padStart(12, '0')}`;
/** 주중 (A-10)/5 시간, 토 6, 일 4 */
const daily = (a) => { const wd = (a - 10) / 5; return [wd, wd, wd, wd, wd, 6, 4]; };

const users = [
  {
    n: 1, email: 'yebo@hakgi.test', display_name: '김예보', persona: '취업 준비생 3학년 · 발표 시연(10/27 = 9주차 폭풍) / 4.5 검증 예시',
    available_hours: 50, daily_hours: daily(50), semester_start: SEMESTER_START, midterm_week: 8, final_week: 15,
    categories: ['경조사'],
    plans: [
      ['운영체제', 'class', 3, 'custom', 1, 16, 6], ['데이터베이스', 'class', 3, 'custom', 1, 16, 6],
      ['컴퓨터네트워크', 'class', 3, 'custom', 1, 16, 6], ['소프트웨어공학', 'class', 3, 'custom', 1, 16, 6, { priority: 'low' }],
      ['알고리즘', 'class', 3, 'custom', 1, 16, 6, { priority: 'high' }], ['프로그래밍 학회', 'activity', null, 'normal', 1, 16, null, { priority: 'low' }],
      // 발표일(10/27 화)이 든 9주차를 "이번 주 폭풍"으로: 캡스톤 중간 발표 준비(9~10주) + 토요일 결혼식 + SQLD 준비
      ['캡스톤 디자인 중간 발표', 'project', null, 'custom', 9, 10, 6, { start_date: '2026-10-26', end_date: '2026-11-08', priority: 'high' }],
      // 사용자 지정 유형 예시: 9주차 토요일(10/31) 사촌 결혼식 → 요일별 예보에서 토요일만 무거워짐
      ['사촌형 결혼식', 'custom', null, 'custom', 9, 9, 6, { start_date: '2026-10-31', end_date: '2026-10-31', category: 1, priority: 'high' }],
    ],
    certs: [
      [cid(2), 8], // 정보처리기사 3회 실기: 시험 10/24 = 8주차, 준비 3~8주 → 8주차 57h (4.5 검증 예시)
      [cid(7), 8, 3], // SQLD 63회: 시험 11/14 = 11주차, 준비 9~11주 → 9주차 54h 폭풍 (발표일 이번 주)
      [cid(11), 6, 2], // 빅데이터분석기사 13회 실기: 접수 10/26~30 → 발표일(10/27) 홈 배너 "마감 D-3", 준비 12~13주
    ],
  },
  {
    n: 2, email: 'jiwon@hakgi.test', display_name: '이지원', persona: '대외활동 지원 예정자 2학년 · 직접 입력/학기 밖 준비기간',
    available_hours: 45, daily_hours: daily(45), semester_start: SEMESTER_START, midterm_week: 8, final_week: 15,
    plans: [
      ['경영학원론', 'class', 3, 'custom', 1, 16, 6], ['마케팅원론', 'class', 3, 'custom', 1, 16, 4.5, { priority: 'low' }],
      ['회계원리', 'class', 3, 'custom', 1, 16, 6, { priority: 'high' }], ['경영통계', 'class', 3, 'custom', 1, 16, 6],
      ['비즈니스 영어회화', 'class', 2, 'custom', 1, 16, 3], ['사진 동아리', 'activity', null, 'low', 1, 16],
      ['교내 마케팅 공모전', 'project', null, 'normal', 3, 9],
    ],
    certs: [
      [cid(14), 5], // 전산회계 1급 129회: 시험 12/5 = 14주차, 준비 10~14주 (학습시간 6→5 직접 수정)
      [cid(3), 8, 8], // 정보처리기사 2027년 1회(예정): 시험 22주차, 준비를 8주로 늘려 15~22주 중 15·16주만 반영 (FR-04-6 일부만)
    ],
  },
  {
    n: 3, email: 'woonyoung@hakgi.test', display_name: '박운영', persona: '학생회 운영진 4학년 · 기말 16주차 / 경계값 100%',
    available_hours: 55, daily_hours: daily(55), semester_start: SEMESTER_START, midterm_week: 8, final_week: 16, // FR-01-12 시험 주차 변경 예
    plans: [
      ['졸업 프로젝트', 'project', null, 'high', 1, 16, null, { priority: 'high' }], ['데이터마이닝', 'class', 3, 'custom', 1, 16, 6],
      ['정보보호개론', 'class', 3, 'custom', 1, 16, 6], ['진로설계', 'class', 1, 'custom', 1, 16, 2, { priority: 'low' }],
      ['단과대 학생회', 'activity', null, 'custom', 1, 16, 10], ['축제 준비위원회', 'activity', null, 'high', 6, 8],
    ],
    certs: [
      [cid(7), 6], // SQLD 63회: 시험 11/14 = 11주차, 준비 8~11주 → 8주차 정확히 55h = 100% (경계값). 접수 마감 10/16 → 홈 배너
      [cid(11), 6, 3], // 빅데이터분석기사 13회 실기: 준비 6주→3주로 직접 수정 (FR-04-3), 11~13주. 접수 10/26~30 → 발표일 배너
    ],
  },
  {
    n: 4, email: 'empty@hakgi.test', display_name: '최수강', persona: '학기 설정 완료 · 계획 없음 (FR-05-6 빈 상태)',
    available_hours: 40, daily_hours: daily(40), semester_start: SEMESTER_START, midterm_week: 8, final_week: 15, plans: [], certs: [],
  },
  {
    n: 5, email: 'newbie@hakgi.test', display_name: '정새내', persona: '가입 직후 · 학기 설정 미완료 (FR-01-11 온보딩)',
    available_hours: null, daily_hours: null, semester_start: null, midterm_week: 8, final_week: 15, plans: [], certs: [],
  },
].map((u) => ({ categories: [], ...u, id: uid(u.n) }));

// F-06 사전 검토 시연용: 김예보가 저장 전에 넣어보는 계획 → 10주차가 새로 폭풍
const previewPlan = { title: '대학생 서포터즈 1차 미션', type: 'activity', credits: null, load_level: 'custom', start_week: 9, end_week: 10, hours_per_week: 10 };

// ─────────────────────────────────────────────
// 4. 부담 산출 (명세서 4장을 그대로 구현한 참조 로직)
// ─────────────────────────────────────────────
const DAY = 86400000;
const weekOf = (date, start) => Math.floor((Date.parse(date) - Date.parse(start)) / (7 * DAY)) + 1; // 4.1
const r1 = (n) => Math.round(n * 10) / 10;
const levelOf = (ratio) => (ratio > LEVEL.STORM_ABOVE ? 'storm' : ratio >= LEVEL.CLOUDY_FROM ? 'cloudy' : 'clear'); // 4.4, 반올림 전 값

function forecast(profile, plans, userCerts) {
  const { available_hours: A, semester_start: S, midterm_week, final_week } = profile;
  const weeks = [];
  for (let i = 1; i <= TOTAL_WEEKS; i++) {
    const isExamWeek = i === midterm_week || i === final_week;
    const items = [];
    for (const p of plans) {
      if (i < p.start_week || i > p.end_week) continue;
      const weighted = p.type === 'class' && isExamWeek; // m_{p,i}
      items.push({ source: 'plan', title: p.title, base_hours: p.hours_per_week, weighted, hours: p.hours_per_week * (weighted ? EXAM_WEIGHT : 1), priority: p.priority ?? 'normal', plan_type: p.type, category_id: p.category_id ?? null });
    }
    for (const uc of userCerts) {
      const c = certById[uc.certificate_id];
      const E = weekOf(c.exam_date, S);
      if (i >= E - uc.prep_weeks + 1 && i <= E) // 4.2: 시험 주 포함 N주
        items.push({ source: 'certificate', title: `${c.name} 준비`, base_hours: uc.study_hours, weighted: false, hours: uc.study_hours });
    }
    const W = items.reduce((s, x) => s + x.hours, 0);
    weeks.push({ week: i, is_exam_week: isExamWeek, total_hours: r1(W), ratio: Math.round((W / A) * 1000) / 1000, level: levelOf(W / A), items: items.map((x) => ({ ...x, hours: r1(x.hours) })) });
  }
  const count = (l) => weeks.filter((w) => w.level === l).length;
  return { weeks, summary: { storm: count('storm'), cloudy: count('cloudy'), clear: count('clear') } };
}

// ─────────────────────────────────────────────
// 5. 정규화
// ─────────────────────────────────────────────
const created = '2026-09-01T09:00:00+09:00';
// 개인정보 동의(NFR-LEGAL-1)는 온보딩에서 받으므로, 학기 설정을 마친 사용자만 동의한 상태로 둡니다.
// DB에서는 트리거가 동의 시각을 서버 시각(now())으로 바꿔 기록합니다.
const profiles = users.map(({ id, display_name, available_hours, daily_hours, semester_start, midterm_week, final_week }) =>
  ({ user_id: id, display_name, available_hours, daily_hours, semester_start, midterm_week, final_week,
    privacy_agreed_at: available_hours && semester_start ? created : null }));
const planCategories = users.flatMap((u) => u.categories.map((name, i) => ({ id: catId(u.n, i + 1), user_id: u.id, name, created_at: created })));
const plans = users.flatMap((u) => u.plans.map(([title, type, credits, load_level, start_week, end_week, custom, extra = {}], i) => {
  const hours_per_week = load_level === 'custom' ? custom : defaultHours(type, load_level, credits);
  return { id: pid(u.n, i + 1), user_id: u.id, title, type, credits, load_level, start_week, end_week, hours_per_week,
    start_date: extra.start_date ?? null, end_date: extra.end_date ?? null, priority: extra.priority ?? 'normal',
    category_id: extra.category ? catId(u.n, extra.category) : null, created_at: created, updated_at: created };
}));
const userCertificates = users.flatMap((u) => u.certs.map(([certificate_id, study_hours, prep, notified_at]) =>
  ({ user_id: u.id, certificate_id, study_hours, prep_weeks: prep ?? certById[certificate_id].prep_weeks, notified_at: notified_at ?? null })));

const onboarded = profiles.filter((p) => p.available_hours && p.semester_start);
const expected = Object.fromEntries(onboarded.map((p) =>
  [p.user_id, forecast(p, plans.filter((x) => x.user_id === p.user_id), userCertificates.filter((x) => x.user_id === p.user_id))]));
const yebo = profiles[0];
const base = expected[yebo.user_id];
const withPreview = forecast(yebo, [...plans.filter((x) => x.user_id === yebo.user_id), previewPlan], userCertificates.filter((x) => x.user_id === yebo.user_id));
const newStorm = withPreview.weeks.filter((w, i) => w.level === 'storm' && base.weeks[i].level !== 'storm').map((w) => w.week);
const previewDiff = { storm_before: base.summary.storm, storm_after: withPreview.summary.storm, new_storm_weeks: newStorm,
  message: `폭풍 ${base.summary.storm}주 → ${withPreview.summary.storm}주 (${newStorm.join(', ')}주차 추가)` };

// ─────────────────────────────────────────────
// 6. 명세서 대비 자체 검증 — 하나라도 어긋나면 생성 중단
// ─────────────────────────────────────────────
const fail = (m) => { console.error('✗ 명세서 불일치:', m); process.exit(1); };
const w8 = base.weeks[7];
if (w8.total_hours !== 57 || w8.ratio !== 1.14 || w8.level !== 'storm') fail(`4.5 검증 예시 8주차 = ${w8.total_hours}h, ${w8.ratio}, ${w8.level} (기대 57h, 1.14, storm)`);
if (previewDiff.message !== '폭풍 2주 → 3주 (10주차 추가)') fail(`F-06 시연 문구: ${previewDiff.message}`);
const w9 = base.weeks[8];
if (w9.total_hours !== 54 || w9.level !== 'storm') fail(`발표일(10/27) 9주차 = ${w9.total_hours}h ${w9.level} (기대 54h 폭풍)`);
if (weekOf('2026-10-27', SEMESTER_START) !== 9) fail('발표일 10/27 은 9주차');
const woon8 = expected[uid(3)].weeks[7];
if (woon8.ratio !== 1 || woon8.level !== 'cloudy') fail(`박운영 8주차 경계값: ${woon8.total_hours}h, ${woon8.ratio}, ${woon8.level} (기대 100% 흐림)`);
if (defaultHours('class', 'normal', 3) !== 4.5) fail('FR-03-2 (10/24): 3학점 보통은 4.5시간 (수업 밖 공부)');
for (const p of plans) {
  if (p.title.length < 1 || p.title.length > 30) fail(`FR-02-1 제목 길이: ${p.title}`);
  if (p.hours_per_week < 0.5 || p.hours_per_week > 60 || (p.hours_per_week * 2) % 1) fail(`FR-02-1 시간 0.5~60, 0.5 단위: ${p.title}`);
  if ((p.type === 'class') !== (p.credits !== null) || (p.credits !== null && (p.credits < 1 || p.credits > 6))) fail(`credits: ${p.title}`);
  if ((p.type === 'custom') !== (p.category_id !== null)) fail(`사용자 유형: ${p.title}`);
  if (p.start_date && (weekOf(p.start_date, SEMESTER_START) !== p.start_week || weekOf(p.end_date, SEMESTER_START) !== p.end_week)) fail(`날짜-주차: ${p.title}`);
  if (p.start_week > p.end_week || p.start_week < 1 || p.end_week > 16) fail(`주차: ${p.title}`);
}
for (const u of users) if (u.plans.length > 30) fail('FR-02-5 계획 30개 초과');
for (const c of certificates) {
  if (!(c.apply_start <= c.apply_end && c.apply_end < c.exam_date)) fail(`5.3 날짜 순서: ${c.name} ${c.round}`);
  if (c.default_study_hours < 1 || c.default_study_hours > 40 || c.prep_weeks < 1 || c.prep_weeks > 16) fail(`5.3 범위: ${c.name}`);
}
if (certificates.length < 15 || certificates.length > 20) fail('자격증 15~20종');
if (certificates.filter((c) => c.name.includes('정보처리')).map((c) => c.name).filter((v, i, a) => a.indexOf(v) === i).length !== 2) fail('FR-04-1 "정보처리" 검색 결과');
for (const uc of userCertificates) if (uc.study_hours < 1 || uc.study_hours > 40 || uc.prep_weeks < 1 || uc.prep_weeks > 16) fail('5.4 범위');
for (const p of profiles) if (p.daily_hours && p.daily_hours.reduce((a, b) => a + b, 0) !== p.available_hours) fail(`요일별 합계: ${p.display_name}`);
if (weekOf(DEMO_TODAY, SEMESTER_START) !== 7) fail('오늘(10/13)은 7주차');

// ─────────────────────────────────────────────
// 7. 출력
// ─────────────────────────────────────────────
const q = (v) => (v === null || v === undefined ? 'null' : typeof v === 'number' ? String(v) : Array.isArray(v) ? `'{${v.join(',')}}'` : `'${String(v).replace(/'/g, "''")}'`);
const row = (vals) => `  (${vals.map(q).join(', ')})`;
const header = '-- ⚠ 자동 생성 파일: scripts/generate-dummy.mjs 를 수정한 뒤 재생성하세요.\n';

const sql = `${header}-- 학기예보 시드 (명세서 5.6). supabase db reset 시 자동 실행, 여러 번 실행해도 같은 결과.
-- 데모 계정 비밀번호: ${DEMO_PASSWORD}   ※ 운영 사이트도 같은 프로젝트를 씁니다(팀 결정 10/14).
-- 자격증 일정은 2026-10-14 시행 기관 공고 기준입니다. 2027년 회차는 "(예정)" 예상값입니다.
-- 데모 계정 데이터만 처음 상태로 되돌리려면 supabase/reset-demo.sql 을 실행하세요.

begin;

-- 1) 데모 사용자 (auth) — handle_new_user 트리거가 profiles 행을 자동 생성 (FR-01-10)
${users.map((u) => `insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
values ('00000000-0000-0000-0000-000000000000', ${q(u.id)}, 'authenticated', 'authenticated', ${q(u.email)}, extensions.crypt(${q(DEMO_PASSWORD)}, extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', ${q(JSON.stringify({ display_name: u.display_name }))}, now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (${q(u.id)}, ${q(u.id)}, ${q(u.id)}, ${q(JSON.stringify({ sub: u.id, email: u.email, email_verified: true }))}, 'email', now(), now(), now())
on conflict do nothing;`).join('\n')}

-- 2) 학기 설정·개인정보 동의 (정새내는 비워 둠 → 온보딩)
${profiles.map((p) => `update public.profiles set display_name = ${q(p.display_name)}, available_hours = ${q(p.available_hours)}, daily_hours = ${q(p.daily_hours)}, semester_start = ${q(p.semester_start)}, midterm_week = ${p.midterm_week}, final_week = ${p.final_week}, study_style = 'steady', privacy_agreed_at = ${q(p.privacy_agreed_at)} where user_id = ${q(p.user_id)};`).join('\n')}

-- 3) 자격증 회차 (공용)
insert into public.certificates (id, name, round, apply_start, apply_end, exam_date, prep_weeks, default_study_hours, source_url) values
${certificates.map((c) => row([c.id, c.name, c.round, c.apply_start, c.apply_end, c.exam_date, c.prep_weeks, c.default_study_hours, c.source_url])).join(',\n')}
on conflict (id) do update set name = excluded.name, round = excluded.round, apply_start = excluded.apply_start, apply_end = excluded.apply_end,
  exam_date = excluded.exam_date, prep_weeks = excluded.prep_weeks, default_study_hours = excluded.default_study_hours, source_url = excluded.source_url;

-- 4) 사용자 지정 유형·계획
insert into public.plan_categories (id, user_id, name, created_at) values
${planCategories.map((c) => row([c.id, c.user_id, c.name, c.created_at])).join(',\n')}
on conflict (id) do nothing;

insert into public.plans (id, user_id, title, type, credits, load_level, start_week, end_week, hours_per_week, start_date, end_date, priority, category_id, created_at, updated_at) values
${plans.map((p) => row([p.id, p.user_id, p.title, p.type, p.credits, p.load_level, p.start_week, p.end_week, p.hours_per_week, p.start_date, p.end_date, p.priority, p.category_id, p.created_at, p.updated_at])).join(',\n')}
on conflict (id) do nothing;

-- 5) 사용자 선택 회차
insert into public.user_certificates (user_id, certificate_id, study_hours, prep_weeks, notified_at) values
${userCertificates.map((x) => row([x.user_id, x.certificate_id, x.study_hours, x.prep_weeks, x.notified_at])).join(',\n')}
on conflict do nothing;

commit;
`;
writeFileSync(join(root, 'supabase/seed.sql'), sql);

// 데모 계정(*@hakgi.test) 데이터만 처음 상태로 되돌리는 SQL. 시연 전(10/19) 팀원 테스트 흔적을 지울 때 실행합니다.
// - 실제 사용자(Google 로그인) 데이터와 계정은 건드리지 않습니다.
// - 개인정보 동의 시각은 트리거가 한 번 기록되면 바꾸지 못하게 막으므로, 이 작업 동안만 트리거를 끕니다.
const demoIds = users.map((u) => q(u.id)).join(', ');
const resetSql = `${header}-- 데모 계정 데이터 되돌리기. Supabase SQL Editor 에서 통째로 실행하세요. 여러 번 실행해도 같은 결과.
-- 지우는 것: 데모 계정 5명의 계획·내 유형·자격증 선택·직접 추가한 자격증 / 다시 넣는 것: 학기 설정·동의, 계획, 자격증 선택, 공용 자격증 회차
-- 건드리지 않는 것: 실제 사용자(Google 로그인) 계정과 데이터

begin;

delete from public.study_logs where user_id in (${demoIds}); -- 실제로 한 시간 기록 (10/26 이후)
delete from public.user_certificates where user_id in (${demoIds});
delete from public.plans where user_id in (${demoIds});
delete from public.plan_categories where user_id in (${demoIds});
delete from public.certificates where owner_id in (${demoIds}); -- 테스트하며 직접 추가한 자격증 (10/24 이후)

alter table public.profiles disable trigger profiles_privacy_agreed_at;
${profiles.map((p) => `update public.profiles set display_name = ${q(p.display_name)}, available_hours = ${q(p.available_hours)}, daily_hours = ${q(p.daily_hours)}, semester_start = ${q(p.semester_start)}, midterm_week = ${p.midterm_week}, final_week = ${p.final_week}, study_style = 'steady', privacy_agreed_at = ${q(p.privacy_agreed_at)} where user_id = ${q(p.user_id)};`).join('\n')}
alter table public.profiles enable trigger profiles_privacy_agreed_at;

insert into public.certificates (id, name, round, apply_start, apply_end, exam_date, prep_weeks, default_study_hours, source_url) values
${certificates.map((c) => row([c.id, c.name, c.round, c.apply_start, c.apply_end, c.exam_date, c.prep_weeks, c.default_study_hours, c.source_url])).join(',\n')}
on conflict (id) do update set name = excluded.name, round = excluded.round, apply_start = excluded.apply_start, apply_end = excluded.apply_end,
  exam_date = excluded.exam_date, prep_weeks = excluded.prep_weeks, default_study_hours = excluded.default_study_hours, source_url = excluded.source_url;

insert into public.plan_categories (id, user_id, name, created_at) values
${planCategories.map((c) => row([c.id, c.user_id, c.name, c.created_at])).join(',\n')};

insert into public.plans (id, user_id, title, type, credits, load_level, start_week, end_week, hours_per_week, start_date, end_date, priority, category_id, created_at, updated_at) values
${plans.map((p) => row([p.id, p.user_id, p.title, p.type, p.credits, p.load_level, p.start_week, p.end_week, p.hours_per_week, p.start_date, p.end_date, p.priority, p.category_id, p.created_at, p.updated_at])).join(',\n')};

insert into public.user_certificates (user_id, certificate_id, study_hours, prep_weeks, notified_at) values
${userCertificates.map((x) => row([x.user_id, x.certificate_id, x.study_hours, x.prep_weeks, x.notified_at])).join(',\n')};

commit;
`;
writeFileSync(join(root, 'supabase/reset-demo.sql'), resetSql);

const j = (v) => JSON.stringify(v, null, 2);
const ts = `${header.replace('--', '//')}// 학기예보 프론트 목데이터 — 기준: 요구사항 명세서 5장(테이블), 4장(산출 규칙)
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

export const TOTAL_WEEKS = ${TOTAL_WEEKS};
export const EXAM_WEIGHT = ${EXAM_WEIGHT};
export const LEVEL_THRESHOLD = ${j(LEVEL)} as const;
/** F-03 기본값 (명세서 3장 표, 팀 확정 필요). 수업은 학점당 시간 */
export const PLAN_DEFAULTS = ${j(PLAN_DEFAULTS)} as const;
/** 4.4 단계 표시 — 색 + 글자 + 아이콘 (NFR-ACC-1) */
export const WEATHER_LABEL: Record<Weather, { text: string; level: string; icon: string; color: string }> = {
  clear: { text: '맑음', level: '여유', icon: '☀️', color: '#3d8a5a' },
  cloudy: { text: '흐림', level: '주의', icon: '☁️', color: '#c98a1f' },
  storm: { text: '폭풍', level: '과부하', icon: '⛈️', color: '#c0463a' },
};

/** 데이터가 맞춰진 기준일 (7주차). D-day·접수 마감·현재 주차 테스트에 사용 */
export const DEMO_TODAY = ${q(DEMO_TODAY)};
export const DEMO_PASSWORD = ${q(DEMO_PASSWORD)};
export const demoUsers = ${j(users.map(({ id, email, display_name, persona }) => ({ id, email, display_name, persona })))};

export const profiles: Profile[] = ${j(profiles)};
export const certificates: Certificate[] = ${j(certificates)};
export const planCategories: PlanCategory[] = ${j(planCategories)};
export const plans: Plan[] = ${j(plans)};
export const userCertificates: UserCertificate[] = ${j(userCertificates)};

/** F-06 사전 검토 시연용 (김예보가 저장 전에 입력해 보는 계획) */
export const previewPlan: PlanInput = ${j(previewPlan)};

/** 학기 설정을 마친 사용자별 예상 예보 (명세서 4장 규칙) */
export const expectedForecast: Record<string, Forecast> = ${j(expected)};
/** 김예보 + previewPlan 적용 시 예보 */
export const expectedForecastWithPreview: Forecast = ${j(withPreview)};
/** FR-06-3 변화 요약 기대값 */
export const expectedPreviewDiff = ${j(previewDiff)};
`;
writeFileSync(join(root, 'src/mocks/dummy-data.ts'), ts);

// 콘솔 요약
console.log('✓ 명세서 자체 검증 통과 (4.5 예시: 8주차 57h · 1.14 · 폭풍)');
for (const p of onboarded) {
  const f = expected[p.user_id];
  console.log(`${p.display_name} 폭풍 ${f.summary.storm} / 흐림 ${f.summary.cloudy} / 맑음 ${f.summary.clear} | ${f.weeks.map((w) => `${w.week}:${w.total_hours}`).join(' ')}`);
}
console.log('사전 검토:', previewDiff.message);
