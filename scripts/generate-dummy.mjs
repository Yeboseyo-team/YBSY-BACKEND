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
const SEMESTER_START = '2026-08-31'; // 2026년 2학기 1주차 월요일
const DEMO_TODAY = '2026-10-13'; // 7주차. 시연일 10/20은 8주차(중간고사)

// F-03 유형별 기본값 (명세서 3장 표 — 보완, 팀 확정 필요)
const PLAN_DEFAULTS = {
  class: { unit: '학점당 시간/주', low: 1.5, normal: 2, high: 3 },
  activity: { unit: '시간/주', low: 2, normal: 4, high: 8 },
  project: { unit: '시간/주', low: 3, normal: 6, high: 10 },
};
function defaultHours(type, level, credits) {
  const rate = PLAN_DEFAULTS[type][level];
  return type === 'class' ? rate * credits : rate;
}

// ─────────────────────────────────────────────
// 2. 자격증 회차 (공용, 15~20종) — ⚠ 날짜는 더미. 공식 공고로 교체 필요 (명세서 9.1)
//    10/13 기준 상태가 골고루 나오도록 배치:
//    접수 중 / 접수 마감(FR-04-2) / 학기 범위 밖(FR-04-6) / 일부만 범위 안
// ─────────────────────────────────────────────
const cid = (n) => `c0000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const C = (n, name, round, apply_start, apply_end, exam_date, prep_weeks, default_study_hours, source_url) =>
  ({ id: cid(n), name, round, apply_start, apply_end, exam_date, prep_weeks, default_study_hours, source_url });
const QNET = 'https://www.q-net.or.kr';
const certificates = [
  // 정보처리기사 3개 회차 → F-09 회차 추천 테스트 (마감 / 접수 중 / 학기 밖)
  C(1, '정보처리기사', '2026년 정기 3회 필기', '2026-07-21', '2026-07-24', '2026-08-09', 6, 8, QNET),
  C(2, '정보처리기사', '2026년 정기 4회 필기', '2026-10-19', '2026-10-22', '2026-11-28', 6, 8, QNET),
  C(3, '정보처리기사', '2027년 정기 1회 필기', '2027-01-12', '2027-01-15', '2027-02-20', 6, 8, QNET),
  C(4, '정보처리산업기사', '2026년 정기 4회 필기', '2026-10-19', '2026-10-22', '2026-11-28', 5, 6, QNET),
  C(5, 'SQLD', '제62회', '2026-10-05', '2026-10-16', '2026-11-14', 4, 6, 'https://www.dataq.or.kr'),
  C(6, 'ADsP', '제51회', '2026-10-12', '2026-10-23', '2026-11-21', 4, 6, 'https://www.dataq.or.kr'),
  C(7, '빅데이터분석기사', '제13회 필기', '2026-09-07', '2026-09-11', '2026-10-10', 6, 8, 'https://www.dataq.or.kr'),
  C(8, '컴퓨터활용능력 1급', '2026년 상시 11월', '2026-10-26', '2026-11-06', '2026-11-21', 4, 8, 'https://license.korcham.net'),
  C(9, '컴퓨터활용능력 2급', '2026년 상시 10월', '2026-09-28', '2026-10-09', '2026-10-24', 3, 5, 'https://license.korcham.net'),
  C(10, '정보보안기사', '제28회 필기', '2026-08-17', '2026-08-21', '2026-09-19', 8, 10, 'https://www.kisq.or.kr'),
  C(11, '리눅스마스터 2급', '2026년 2차', '2026-10-26', '2026-11-02', '2026-12-12', 4, 5, 'https://www.ihd.or.kr'),
  C(12, '네트워크관리사 2급', '제84회 필기', '2026-10-05', '2026-10-09', '2026-11-08', 3, 5, 'https://www.icqa.or.kr'),
  C(13, '한국사능력검정시험 심화', '제79회', '2026-09-29', '2026-10-06', '2026-10-31', 4, 5, 'https://www.historyexam.go.kr'),
  C(14, 'TOEIC', '2026년 11월 정기', '2026-09-28', '2026-10-30', '2026-11-15', 4, 8, 'https://exam.toeic.co.kr'),
  C(15, 'TOEIC Speaking', '2026년 11월', '2026-10-12', '2026-11-05', '2026-11-08', 2, 4, 'https://exam.toeic.co.kr'),
  C(16, 'OPIc', '2026년 12월', '2026-11-02', '2026-12-01', '2026-12-05', 3, 4, 'https://www.opic.or.kr'),
  C(17, '전산회계 1급', '제124회', '2026-11-19', '2026-11-25', '2026-12-26', 5, 6, 'https://license.kacpta.or.kr'), // 준비 13~17주 → 일부 학기 밖
  C(18, '사회조사분석사 2급', '2026년 정기 4회 필기', '2026-10-19', '2026-10-22', '2026-11-28', 6, 8, QNET),
  C(19, 'GTQ 1급', '제155회', '2026-10-19', '2026-10-26', '2026-11-14', 3, 5, 'https://license.kpc.or.kr'),
  C(20, '유통관리사 2급', '2026년 3회', '2026-10-12', '2026-10-19', '2026-11-07', 4, 5, 'https://license.korcham.net'),
];
const certById = Object.fromEntries(certificates.map((c) => [c.id, c]));

// ─────────────────────────────────────────────
// 3. 데모 사용자 — 로컬 로그인 비밀번호 공통 (FR-01-1 규칙: 8자 이상, 영문·숫자 포함)
//    plan: [제목, 유형, 학점|null, 단계, 시작, 종료, (custom일 때 시간)]
//    cert: [회차 id, 주당 학습시간, 준비 주수(생략 시 회차 기본값), 알림 발송 시각]
// ─────────────────────────────────────────────
const DEMO_PASSWORD = 'hakgi1234';
const uid = (n) => `a0000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const pid = (u, n) => `b0000000-0000-4000-${String(u).padStart(4, '0')}-${String(n).padStart(12, '0')}`;

const users = [
  {
    n: 1, email: 'yebo@hakgi.test', display_name: '김예보', persona: '취업 준비생 3학년 · 시연 시나리오 / 4.5 검증 예시',
    available_hours: 50, semester_start: SEMESTER_START, midterm_week: 8, final_week: 15,
    plans: [
      ['운영체제', 'class', 3, 'normal', 1, 16], ['데이터베이스', 'class', 3, 'normal', 1, 16],
      ['컴퓨터네트워크', 'class', 3, 'normal', 1, 16], ['소프트웨어공학', 'class', 3, 'normal', 1, 16],
      ['알고리즘', 'class', 3, 'normal', 1, 16], ['프로그래밍 학회', 'activity', null, 'normal', 1, 16],
    ],
    certs: [[cid(2), 8]], // 정보처리기사 4회 필기: 시험 13주차, 준비 8~13주
  },
  {
    n: 2, email: 'jiwon@hakgi.test', display_name: '이지원', persona: '대외활동 지원 예정자 2학년 · 직접 입력/학기 밖 준비기간',
    available_hours: 45, semester_start: SEMESTER_START, midterm_week: 8, final_week: 15,
    plans: [
      ['경영학원론', 'class', 3, 'normal', 1, 16], ['마케팅원론', 'class', 3, 'low', 1, 16],
      ['회계원리', 'class', 3, 'normal', 1, 16], ['경영통계', 'class', 3, 'normal', 1, 16],
      ['비즈니스 영어회화', 'class', 2, 'custom', 1, 16, 3], ['사진 동아리', 'activity', null, 'low', 1, 16],
      ['교내 마케팅 공모전', 'project', null, 'normal', 3, 9],
    ],
    certs: [[cid(14), 6], [cid(17), 6]], // TOEIC(학습시간 직접 수정), 전산회계 1급(준비 13~17주 중 13~16만 반영)
  },
  {
    n: 3, email: 'woonyoung@hakgi.test', display_name: '박운영', persona: '학생회 운영진 4학년 · 기말 16주차 / 경계값 100%',
    available_hours: 55, semester_start: SEMESTER_START, midterm_week: 8, final_week: 16, // FR-01-12 시험 주차 변경 예
    plans: [
      ['졸업 프로젝트', 'project', null, 'high', 1, 16], ['데이터마이닝', 'class', 3, 'normal', 1, 16],
      ['정보보호개론', 'class', 3, 'normal', 1, 16], ['진로설계', 'class', 1, 'normal', 1, 16],
      ['단과대 학생회', 'activity', null, 'custom', 1, 16, 10], ['축제 준비위원회', 'activity', null, 'high', 6, 8],
    ],
    certs: [
      [cid(5), 6, null, '2026-10-13T09:00:00+09:00'], // SQLD: 마감 10/16 → 3일 전 알림 이미 발송 (FR-07-1 중복 방지 테스트)
      [cid(6), 6, 3], // ADsP: 준비 기간을 4주→3주로 직접 수정 (FR-04-3)
    ],
  },
  {
    n: 4, email: 'empty@hakgi.test', display_name: '최수강', persona: '학기 설정 완료 · 계획 없음 (FR-05-6 빈 상태)',
    available_hours: 40, semester_start: SEMESTER_START, midterm_week: 8, final_week: 15, plans: [], certs: [],
  },
  {
    n: 5, email: 'newbie@hakgi.test', display_name: '정새내', persona: '가입 직후 · 학기 설정 미완료 (FR-01-11 온보딩)',
    available_hours: null, semester_start: null, midterm_week: 8, final_week: 15, plans: [], certs: [],
  },
].map((u) => ({ ...u, id: uid(u.n) }));

// F-06 사전 검토 시연용: 김예보가 저장 전에 넣어보는 계획 → 폭풍 1주 → 3주
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
      items.push({ source: 'plan', title: p.title, base_hours: p.hours_per_week, weighted, hours: p.hours_per_week * (weighted ? EXAM_WEIGHT : 1) });
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
const profiles = users.map(({ id, display_name, available_hours, semester_start, midterm_week, final_week }) =>
  ({ user_id: id, display_name, available_hours, semester_start, midterm_week, final_week,
    privacy_agreed_at: available_hours && semester_start ? created : null }));
const plans = users.flatMap((u) => u.plans.map(([title, type, credits, load_level, start_week, end_week, custom], i) => {
  const hours_per_week = load_level === 'custom' ? custom : defaultHours(type, load_level, credits);
  return { id: pid(u.n, i + 1), user_id: u.id, title, type, credits, load_level, start_week, end_week, hours_per_week, created_at: created, updated_at: created };
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
if (defaultHours('class', 'normal', 3) !== 6) fail('FR-03-2: 3학점 보통은 6시간');
for (const p of plans) {
  if (p.title.length < 1 || p.title.length > 30) fail(`FR-02-1 제목 길이: ${p.title}`);
  if (p.hours_per_week < 0.5 || p.hours_per_week > 60 || (p.hours_per_week * 2) % 1) fail(`FR-02-1 시간 0.5~60, 0.5 단위: ${p.title}`);
  if ((p.type === 'class') !== (p.credits !== null) || (p.credits !== null && (p.credits < 1 || p.credits > 4))) fail(`credits: ${p.title}`);
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
for (const p of profiles) if (p.semester_start && new Date(p.semester_start).getUTCDay() !== 1) fail('학기 시작일은 월요일');
if (weekOf(DEMO_TODAY, SEMESTER_START) !== 7) fail('오늘(10/13)은 7주차');

// ─────────────────────────────────────────────
// 7. 출력
// ─────────────────────────────────────────────
const q = (v) => (v === null || v === undefined ? 'null' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const row = (vals) => `  (${vals.map(q).join(', ')})`;
const header = '-- ⚠ 자동 생성 파일: scripts/generate-dummy.mjs 를 수정한 뒤 재생성하세요.\n';

const sql = `${header}-- 학기예보 시드 (명세서 5.6). supabase db reset 시 자동 실행, 여러 번 실행해도 같은 결과.
-- 데모 계정 비밀번호: ${DEMO_PASSWORD}   ※ 로컬·개발 프로젝트 전용. 운영 프로젝트에는 3)번 자격증만 적용하세요.
-- 자격증 일정은 더미입니다. 실제 배포 전 공식 공고로 교체하세요.

begin;

-- 1) 데모 사용자 (auth) — handle_new_user 트리거가 profiles 행을 자동 생성 (FR-01-10)
${users.map((u) => `insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
values ('00000000-0000-0000-0000-000000000000', ${q(u.id)}, 'authenticated', 'authenticated', ${q(u.email)}, extensions.crypt(${q(DEMO_PASSWORD)}, extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', ${q(JSON.stringify({ display_name: u.display_name }))}, now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (${q(u.id)}, ${q(u.id)}, ${q(u.id)}, ${q(JSON.stringify({ sub: u.id, email: u.email, email_verified: true }))}, 'email', now(), now(), now())
on conflict do nothing;`).join('\n')}

-- 2) 학기 설정·개인정보 동의 (정새내는 비워 둠 → 온보딩)
${profiles.map((p) => `update public.profiles set display_name = ${q(p.display_name)}, available_hours = ${q(p.available_hours)}, semester_start = ${q(p.semester_start)}, midterm_week = ${p.midterm_week}, final_week = ${p.final_week}, privacy_agreed_at = ${q(p.privacy_agreed_at)} where user_id = ${q(p.user_id)};`).join('\n')}

-- 3) 자격증 회차 (공용)
insert into public.certificates (id, name, round, apply_start, apply_end, exam_date, prep_weeks, default_study_hours, source_url) values
${certificates.map((c) => row([c.id, c.name, c.round, c.apply_start, c.apply_end, c.exam_date, c.prep_weeks, c.default_study_hours, c.source_url])).join(',\n')}
on conflict (id) do update set name = excluded.name, round = excluded.round, apply_start = excluded.apply_start, apply_end = excluded.apply_end,
  exam_date = excluded.exam_date, prep_weeks = excluded.prep_weeks, default_study_hours = excluded.default_study_hours, source_url = excluded.source_url;

-- 4) 계획
insert into public.plans (id, user_id, title, type, credits, load_level, start_week, end_week, hours_per_week, created_at, updated_at) values
${plans.map((p) => row([p.id, p.user_id, p.title, p.type, p.credits, p.load_level, p.start_week, p.end_week, p.hours_per_week, p.created_at, p.updated_at])).join(',\n')}
on conflict (id) do nothing;

-- 5) 사용자 선택 회차
insert into public.user_certificates (user_id, certificate_id, study_hours, prep_weeks, notified_at) values
${userCertificates.map((x) => row([x.user_id, x.certificate_id, x.study_hours, x.prep_weeks, x.notified_at])).join(',\n')}
on conflict do nothing;

commit;
`;
writeFileSync(join(root, 'supabase/seed.sql'), sql);

const j = (v) => JSON.stringify(v, null, 2);
const ts = `${header.replace('--', '//')}// 학기예보 프론트 목데이터 — 기준: 요구사항 명세서 5장(테이블), 4장(산출 규칙)
// Supabase 없이 화면을 먼저 만들 때 사용하세요. 실제 연결 후에는 supabase gen types 결과로 타입을 교체합니다.
// expectedForecast 는 src/features/forecast/calc.ts 단위 테스트의 기대값으로 쓸 수 있습니다 (NFR-MAINT-1).

export type PlanType = 'class' | 'activity' | 'project';
export type LoadLevel = 'low' | 'normal' | 'high' | 'custom';
export type Weather = 'clear' | 'cloudy' | 'storm';

/** 5.1 profiles — available_hours / semester_start / privacy_agreed_at 중 하나라도 null 이면 온보딩 미완료 */
export interface Profile { user_id: string; display_name: string | null; available_hours: number | null; semester_start: string | null; midterm_week: number; final_week: number; privacy_agreed_at: string | null }
/** 5.2 plans — credits 는 수업일 때만 */
export interface Plan { id: string; user_id: string; title: string; type: PlanType; credits: number | null; load_level: LoadLevel; start_week: number; end_week: number; hours_per_week: number; created_at: string; updated_at: string }
export type PlanInput = Pick<Plan, 'title' | 'type' | 'credits' | 'load_level' | 'start_week' | 'end_week' | 'hours_per_week'>;
/** 5.3 certificates */
export interface Certificate { id: string; name: string; round: string; apply_start: string; apply_end: string; exam_date: string; prep_weeks: number; default_study_hours: number; source_url: string }
/** 5.4 user_certificates */
export interface UserCertificate { user_id: string; certificate_id: string; study_hours: number; prep_weeks: number; notified_at: string | null }

export interface WeekItem { source: 'plan' | 'certificate'; title: string; base_hours: number; weighted: boolean; hours: number }
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
