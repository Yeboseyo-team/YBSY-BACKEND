// 학기예보 더미데이터 생성기
// 이 파일 하나가 원본입니다. 수정 후 `node scripts/generate-dummy.mjs` 를 실행하면
//   - supabase/seed.sql          (로컬 Supabase 시드)
//   - src/mocks/dummy-data.ts    (프론트 목데이터 + 예상 예보 결과)
// 두 파일이 같은 데이터로 다시 만들어집니다. 생성된 파일은 직접 고치지 마세요.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// ─────────────────────────────────────────────
// 1. 학기 · 산출 기준 (제안서 6장)
// ─────────────────────────────────────────────
export const SEMESTER = {
  label: '2026년 2학기',
  start: '2026-08-31', // 1주차 월요일
  totalWeeks: 16,
  midtermWeek: 8, // 10/19 ~ 10/25
  finalWeek: 15, // 12/7 ~ 12/13
};
export const EXAM_WEIGHT = 1.5; // 시험 주차 수업 가중치
export const LEVEL = { OK_BELOW: 0.8, OVER_ABOVE: 1.0 }; // <80% 여유, 80~100% 주의, >100% 과부하

// F-03 유형별 기본값 (적음·보통·많음)
export const PLAN_DEFAULTS = {
  class: { label: '수업', low: 4, mid: 6, high: 9, hint: '3학점 전공 기준' },
  activity: { label: '활동', low: 2, mid: 4, high: 8, hint: '동아리·학회·대외활동' },
  project: { label: '프로젝트', low: 3, mid: 5, high: 10, hint: '팀 과제·공모전' },
};

// ─────────────────────────────────────────────
// 2. 자격증 일정 (팀 공용, F-04)
//    ⚠ 날짜는 더미입니다. 배포 전 source_url의 공식 공고로 반드시 교체.
// ─────────────────────────────────────────────
const cid = (n) => `c0000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
export const certificates = [
  // 정보처리기사는 회차 3개 → F-09 시험 회차 추천 테스트용
  { id: cid(1), name: '정보처리기사', round: '2026년 정기 3회 실기', apply_start: '2026-09-22', apply_end: '2026-09-25', exam_date: '2026-11-01', prep_weeks: 6, default_study_hours: 8, source_url: 'https://www.q-net.or.kr' },
  { id: cid(2), name: '정보처리기사', round: '2026년 정기 4회 필기', apply_start: '2026-10-19', apply_end: '2026-10-22', exam_date: '2026-11-28', prep_weeks: 6, default_study_hours: 8, source_url: 'https://www.q-net.or.kr' },
  { id: cid(3), name: '정보처리기사', round: '2027년 정기 1회 필기', apply_start: '2027-01-12', apply_end: '2027-01-15', exam_date: '2027-02-20', prep_weeks: 6, default_study_hours: 8, source_url: 'https://www.q-net.or.kr' },
  { id: cid(4), name: '정보처리산업기사', round: '2026년 정기 4회 필기', apply_start: '2026-10-19', apply_end: '2026-10-22', exam_date: '2026-11-28', prep_weeks: 5, default_study_hours: 6, source_url: 'https://www.q-net.or.kr' },
  { id: cid(5), name: 'SQLD', round: '제62회', apply_start: '2026-10-05', apply_end: '2026-10-16', exam_date: '2026-11-14', prep_weeks: 4, default_study_hours: 6, source_url: 'https://www.dataq.or.kr' },
  { id: cid(6), name: 'ADsP', round: '제51회', apply_start: '2026-10-12', apply_end: '2026-10-23', exam_date: '2026-11-21', prep_weeks: 4, default_study_hours: 6, source_url: 'https://www.dataq.or.kr' },
  { id: cid(7), name: '빅데이터분석기사', round: '제13회 필기', apply_start: '2026-09-07', apply_end: '2026-09-11', exam_date: '2026-10-10', prep_weeks: 6, default_study_hours: 8, source_url: 'https://www.dataq.or.kr' },
  { id: cid(8), name: '컴퓨터활용능력 1급', round: '2026년 상시 11월', apply_start: '2026-10-26', apply_end: '2026-11-06', exam_date: '2026-11-21', prep_weeks: 4, default_study_hours: 7, source_url: 'https://license.korcham.net' },
  { id: cid(9), name: '컴퓨터활용능력 2급', round: '2026년 상시 10월', apply_start: '2026-09-28', apply_end: '2026-10-09', exam_date: '2026-10-24', prep_weeks: 3, default_study_hours: 5, source_url: 'https://license.korcham.net' },
  { id: cid(10), name: '정보보안기사', round: '제28회 필기', apply_start: '2026-08-17', apply_end: '2026-08-21', exam_date: '2026-09-19', prep_weeks: 8, default_study_hours: 10, source_url: 'https://www.kisq.or.kr' },
  { id: cid(11), name: '리눅스마스터 2급', round: '2026년 2차 1급·2급', apply_start: '2026-10-26', apply_end: '2026-11-02', exam_date: '2026-12-12', prep_weeks: 4, default_study_hours: 5, source_url: 'https://www.ihd.or.kr' },
  { id: cid(12), name: '네트워크관리사 2급', round: '제84회 필기', apply_start: '2026-10-05', apply_end: '2026-10-09', exam_date: '2026-11-08', prep_weeks: 3, default_study_hours: 5, source_url: 'https://www.icqa.or.kr' },
  { id: cid(13), name: '한국사능력검정시험 심화', round: '제79회', apply_start: '2026-09-29', apply_end: '2026-10-06', exam_date: '2026-10-31', prep_weeks: 4, default_study_hours: 5, source_url: 'https://www.historyexam.go.kr' },
  { id: cid(14), name: 'TOEIC', round: '2026년 11월 정기', apply_start: '2026-09-28', apply_end: '2026-10-30', exam_date: '2026-11-15', prep_weeks: 4, default_study_hours: 6, source_url: 'https://exam.toeic.co.kr' },
  { id: cid(15), name: 'TOEIC Speaking', round: '2026년 11월', apply_start: '2026-10-12', apply_end: '2026-11-05', exam_date: '2026-11-08', prep_weeks: 2, default_study_hours: 4, source_url: 'https://exam.toeic.co.kr' },
  { id: cid(16), name: 'OPIc', round: '2026년 12월', apply_start: '2026-11-02', apply_end: '2026-12-01', exam_date: '2026-12-05', prep_weeks: 3, default_study_hours: 4, source_url: 'https://www.opic.or.kr' },
  { id: cid(17), name: '전산회계 1급', round: '제124회', apply_start: '2026-10-29', apply_end: '2026-11-04', exam_date: '2026-12-05', prep_weeks: 5, default_study_hours: 6, source_url: 'https://license.kacpta.or.kr' },
  { id: cid(18), name: '사회조사분석사 2급', round: '2026년 정기 4회 필기', apply_start: '2026-10-19', apply_end: '2026-10-22', exam_date: '2026-11-28', prep_weeks: 6, default_study_hours: 7, source_url: 'https://www.q-net.or.kr' },
  { id: cid(19), name: 'GTQ 1급', round: '제155회', apply_start: '2026-10-19', apply_end: '2026-10-26', exam_date: '2026-11-14', prep_weeks: 3, default_study_hours: 5, source_url: 'https://license.kpc.or.kr' },
  { id: cid(20), name: '유통관리사 2급', round: '2026년 3회', apply_start: '2026-10-12', apply_end: '2026-10-19', exam_date: '2026-11-07', prep_weeks: 4, default_study_hours: 5, source_url: 'https://license.korcham.net' },
];

// ─────────────────────────────────────────────
// 3. 데모 사용자 (제안서 3장 사용자 유형) — 로컬 로그인 비밀번호 공통: hakgi1234!
// ─────────────────────────────────────────────
const uid = (n) => `a0000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const pid = (u, n) => `b0000000-0000-4000-${String(u).padStart(4, '0')}-${String(n).padStart(12, '0')}`;
export const DEMO_PASSWORD = 'hakgi1234!';

export const users = [
  {
    id: uid(1), email: 'yebo@hakgi.test', display_name: '김예보', persona: '취업 준비생 (3학년) · 시연 시나리오 주인공',
    available_hours: 50,
    plans: [
      ['운영체제', 'class', 1, 16, 6], ['데이터베이스', 'class', 1, 16, 6], ['컴퓨터네트워크', 'class', 1, 16, 6],
      ['소프트웨어공학', 'class', 1, 16, 4], ['교양 글쓰기', 'class', 1, 16, 3],
      ['프로그래밍 학회', 'activity', 1, 16, 4], ['DB 팀 프로젝트', 'project', 6, 10, 4],
    ],
    certs: [[cid(2), 8]], // 정보처리기사 4회 필기 → 준비 7~12주차
  },
  {
    id: uid(2), email: 'jiwon@hakgi.test', display_name: '이지원', persona: '대외활동 지원 예정자 (2학년)',
    available_hours: 45,
    plans: [
      ['경영학원론', 'class', 1, 16, 5], ['마케팅원론', 'class', 1, 16, 5], ['회계원리', 'class', 1, 16, 6],
      ['통계학', 'class', 1, 16, 6], ['영어회화', 'class', 1, 16, 2],
      ['사진 동아리', 'activity', 1, 16, 3], ['교내 마케팅 공모전', 'project', 3, 9, 5],
    ],
    certs: [[cid(14), 5]], // TOEIC 11월
  },
  {
    id: uid(3), email: 'woonyoung@hakgi.test', display_name: '박운영', persona: '학생회 운영진 (4학년)',
    available_hours: 55,
    plans: [
      ['졸업 프로젝트', 'project', 1, 16, 10], ['데이터마이닝', 'class', 1, 16, 6],
      ['정보보호개론', 'class', 1, 16, 6], ['진로설계', 'class', 1, 16, 2],
      ['단과대 학생회', 'activity', 1, 16, 10], ['축제 준비위원회', 'activity', 6, 8, 8],
    ],
    certs: [[cid(5), 6], [cid(6), 6]], // SQLD + ADsP 준비기간이 겹침
  },
  {
    id: uid(4), email: 'empty@hakgi.test', display_name: '최수강', persona: '수강신청 예정자 · 계획 없음 (빈 화면 테스트)',
    available_hours: 40, plans: [], certs: [],
  },
];

// 사전 검토(F-06) 시연용: 김예보가 "저장 전"에 넣어보는 계획
export const previewPlan = { user_id: uid(1), title: '대학생 서포터즈 콘텐츠 제작', type: 'activity', start_week: 9, end_week: 14, hours_per_week: 10 };

// ─────────────────────────────────────────────
// 4. 부담 산출 (제안서 산출 기준을 그대로 구현한 참조 로직)
// ─────────────────────────────────────────────
const DAY = 86400000;
export function weekOf(dateStr, semesterStart = SEMESTER.start) {
  return Math.floor((Date.parse(dateStr) - Date.parse(semesterStart)) / (7 * DAY)) + 1;
}
const round1 = (n) => Math.round(n * 10) / 10;

export function forecast(available, plans, userCerts) {
  const weeks = [];
  for (let w = 1; w <= SEMESTER.totalWeeks; w++) {
    const examWeek = w === SEMESTER.midtermWeek || w === SEMESTER.finalWeek;
    const items = [];
    for (const p of plans) {
      if (w < p.start_week || w > p.end_week) continue;
      const h = p.type === 'class' && examWeek ? p.hours_per_week * EXAM_WEIGHT : p.hours_per_week;
      items.push({ source: 'plan', title: p.title, hours: round1(h) });
    }
    for (const uc of userCerts) {
      const c = certificates.find((x) => x.id === uc.certificate_id);
      const ew = weekOf(c.exam_date);
      if (w >= ew - c.prep_weeks && w <= ew - 1) items.push({ source: 'certificate', title: `${c.name} 준비`, hours: uc.study_hours });
    }
    const total = round1(items.reduce((s, i) => s + i.hours, 0));
    const ratio = total / available;
    const level = ratio > LEVEL.OVER_ABOVE ? 'over' : ratio >= LEVEL.OK_BELOW ? 'warn' : 'ok';
    weeks.push({ week: w, isExamWeek: examWeek, total, ratio: round1(ratio * 100), level, items });
  }
  const count = (l) => weeks.filter((x) => x.level === l).length;
  return { weeks, summary: { over: count('over'), warn: count('warn'), ok: count('ok') } };
}

// ─────────────────────────────────────────────
// 5. 정규화 + 결과 계산
// ─────────────────────────────────────────────
const created = '2026-09-01T09:00:00+09:00';
export const profiles = users.map((u) => ({ user_id: u.id, display_name: u.display_name, available_hours: u.available_hours, semester_start: SEMESTER.start }));
export const plans = users.flatMap((u, ui) =>
  u.plans.map(([title, type, start_week, end_week, hours_per_week], i) => ({ id: pid(ui + 1, i + 1), user_id: u.id, title, type, start_week, end_week, hours_per_week, created_at: created })));
export const userCertificates = users.flatMap((u) => u.certs.map(([certificate_id, study_hours]) => ({ user_id: u.id, certificate_id, study_hours })));

const expected = Object.fromEntries(users.map((u) => [u.id, forecast(u.available_hours, plans.filter((p) => p.user_id === u.id), userCertificates.filter((x) => x.user_id === u.id))]));
const yebo = users[0];
const withPreview = forecast(yebo.available_hours, [...plans.filter((p) => p.user_id === yebo.id), previewPlan], userCertificates.filter((x) => x.user_id === yebo.id));

// ─────────────────────────────────────────────
// 6. 출력
// ─────────────────────────────────────────────
const q = (v) => (v === null || v === undefined ? 'null' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const header = '-- ⚠ 자동 생성 파일: scripts/generate-dummy.mjs 를 수정한 뒤 재생성하세요.\n';

const sql = `${header}-- 학기예보 로컬 시드 (supabase db reset 시 자동 실행)
-- 데모 계정 비밀번호: ${DEMO_PASSWORD}
-- 자격증 일정은 더미입니다. 실제 서비스 전 공식 공고로 교체하세요.

begin;

-- 1) 데모 사용자 (auth) — handle_new_user 트리거가 profiles 행을 자동 생성
${users.map((u) => `insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
values ('00000000-0000-0000-0000-000000000000', ${q(u.id)}, 'authenticated', 'authenticated', ${q(u.email)}, extensions.crypt(${q(DEMO_PASSWORD)}, extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', ${q(JSON.stringify({ display_name: u.display_name }))}, now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (${q(u.id)}, ${q(u.id)}, ${q(u.id)}, ${q(JSON.stringify({ sub: u.id, email: u.email, email_verified: true }))}, 'email', now(), now(), now())
on conflict do nothing;`).join('\n')}

-- 2) 프로필 (가용 시간)
${profiles.map((p) => `insert into public.profiles (user_id, display_name, available_hours, semester_start) values (${q(p.user_id)}, ${q(p.display_name)}, ${p.available_hours}, ${q(p.semester_start)})
on conflict (user_id) do update set display_name = excluded.display_name, available_hours = excluded.available_hours, semester_start = excluded.semester_start;`).join('\n')}

-- 3) 자격증 일정 (공용)
insert into public.certificates (id, name, round, apply_start, apply_end, exam_date, prep_weeks, default_study_hours, source_url) values
${certificates.map((c) => `  (${[c.id, c.name, c.round, c.apply_start, c.apply_end, c.exam_date, c.prep_weeks, c.default_study_hours, c.source_url].map(q).join(', ')})`).join(',\n')}
on conflict (id) do nothing;

-- 4) 계획
insert into public.plans (id, user_id, title, type, start_week, end_week, hours_per_week, created_at) values
${plans.map((p) => `  (${[p.id, p.user_id, p.title, p.type, p.start_week, p.end_week, p.hours_per_week, p.created_at].map(q).join(', ')})`).join(',\n')}
on conflict (id) do nothing;

-- 5) 사용자 선택 자격증
insert into public.user_certificates (user_id, certificate_id, study_hours) values
${userCertificates.map((x) => `  (${[x.user_id, x.certificate_id, x.study_hours].map(q).join(', ')})`).join(',\n')}
on conflict do nothing;

commit;
`;
writeFileSync(join(root, 'supabase/seed.sql'), sql);

const j = (v) => JSON.stringify(v, null, 2);
const ts = `${header.replace('--', '//')}// 학기예보 프론트 목데이터. Supabase 없이 화면을 먼저 만들 때 사용하세요.
// \`expectedForecast\`는 산출 로직 단위 테스트의 정답값으로 쓸 수 있습니다.

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

export const SEMESTER = ${j(SEMESTER)} as const;
export const EXAM_WEIGHT = ${EXAM_WEIGHT};
export const LEVEL_THRESHOLD = ${j(LEVEL)} as const;
export const PLAN_DEFAULTS = ${j(PLAN_DEFAULTS)} as const;
/** 화면 표시용 날씨 비유 (제안서 8장) */
export const LEVEL_LABEL: Record<LoadLevel, { text: string; weather: string; color: string }> = {
  ok: { text: '여유', weather: '맑음', color: '#3d8a5a' },
  warn: { text: '주의', weather: '흐림', color: '#c98a1f' },
  over: { text: '과부하', weather: '폭풍', color: '#c0463a' },
};

export const DEMO_PASSWORD = ${q(DEMO_PASSWORD)};
export const demoUsers = ${j(users.map(({ id, email, display_name, persona }) => ({ id, email, display_name, persona })))};

export const profiles: Profile[] = ${j(profiles)};
export const certificates: Certificate[] = ${j(certificates)};
export const plans: Plan[] = ${j(plans)};
export const userCertificates: UserCertificate[] = ${j(userCertificates)};

/** F-06 사전 검토 시연용 (김예보가 저장 전에 입력해 보는 계획) */
export const previewPlan: NewPlan = ${j(previewPlan)};

/** 사용자별 예상 예보 (참조 산출 로직 결과) */
export const expectedForecast: Record<string, Forecast> = ${j(expected)};
/** 김예보 + previewPlan 적용 시 예상 예보 */
export const expectedForecastWithPreview: Forecast = ${j(withPreview)};
`;
writeFileSync(join(root, 'src/mocks/dummy-data.ts'), ts);

// 콘솔 요약
for (const u of users) {
  const f = expected[u.id];
  console.log(`${u.display_name.padEnd(4)} 과부하 ${f.summary.over} / 주의 ${f.summary.warn} / 여유 ${f.summary.ok}  |  ${f.weeks.map((w) => `${w.week}:${w.ratio}`).join(' ')}`);
}
console.log(`김예보+사전검토 과부하 ${withPreview.summary.over} (${withPreview.weeks.filter((w) => w.level === 'over').map((w) => w.week + '주').join(', ')})`);
