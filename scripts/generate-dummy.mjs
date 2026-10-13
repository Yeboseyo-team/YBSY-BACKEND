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
// 1. 학기 · 산출 기준 (요구사항 명세서 4장)
// ─────────────────────────────────────────────
export const SEMESTER = {
  label: '2026년 2학기',
  start: '2026-08-31', // 1주차 월요일
  totalWeeks: 16,
  midtermWeek: 8, // 10/19 ~ 10/25
  finalWeek: 15, // 12/7 ~ 12/13
};
export const EXAM_WEIGHT = 1.5; // 시험 주차 수업 가중치
export const LEVEL = { OK_BELOW: 0.8, OVER_ABOVE: 1.0 }; // <0.8 맑음, 0.8~1.0 흐림, >1.0 폭풍 (반올림 전 값으로 판정)
export const MAX_PLANS = 30; // FR-02-5

// F-03 유형별 기본값 (명세서 3장 표, 팀 확정 필요)
//   수업은 "학점당" 시간 → 학점 × 값 (3학점 보통 = 6시간)
export const PLAN_DEFAULTS = {
  class: { label: '수업', perCredit: true, low: 1.5, normal: 2, high: 3, hint: '학점당 시간, 3학점 보통 = 주 6시간' },
  activity: { label: '활동', perCredit: false, low: 2, normal: 4, high: 8, hint: '동아리·학회·대외활동' },
  project: { label: '프로젝트', perCredit: false, low: 3, normal: 6, high: 10, hint: '팀 과제·공모전' },
};

/** 유형·학점·단계로 기본 주당 시간 계산 (FR-03-1, FR-03-2) */
export function defaultHours(type, level, credits) {
  const d = PLAN_DEFAULTS[type];
  return d.perCredit ? d[level] * (credits ?? 3) : d[level];
}
/** 주당 시간이 기본값과 같으면 그 단계, 아니면 'custom'(직접 입력) (FR-03-3) */
function levelOf(type, hours, credits) {
  for (const lv of ['low', 'normal', 'high']) if (defaultHours(type, lv, credits) === hours) return lv;
  return 'custom';
}

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

// plans: [계획명, 유형, 시작 주차, 종료 주차, 주당 시간, 학점(수업만)]
// certs: [회차 id, 주당 학습 시간, 준비 기간(생략 시 회차 기본값)]
export const users = [
  {
    // 명세서 4.5 검증 예시와 같은 구성 → 8주차 = 6×5×1.5 + 4 + 8 = 57시간, 57÷50 = 1.14 폭풍
    id: uid(1), email: 'yebo@hakgi.test', display_name: '김예보', persona: '취업 준비생 (3학년) · 시연 시나리오 주인공',
    available_hours: 50,
    plans: [
      ['운영체제', 'class', 1, 16, 6, 3], ['데이터베이스', 'class', 1, 16, 6, 3], ['컴퓨터네트워크', 'class', 1, 16, 6, 3],
      ['소프트웨어공학', 'class', 1, 16, 6, 3], ['알고리즘', 'class', 1, 16, 6, 3],
      ['프로그래밍 학회', 'activity', 1, 16, 4],
    ],
    certs: [[cid(2), 8]], // 정보처리기사 4회 필기(11/28, 13주차) → 준비 8~13주차
  },
  {
    id: uid(2), email: 'jiwon@hakgi.test', display_name: '이지원', persona: '대외활동 지원 예정자 (2학년)',
    available_hours: 45,
    plans: [
      ['경영학원론', 'class', 1, 16, 6, 3], ['마케팅원론', 'class', 1, 16, 4.5, 3], ['회계원리', 'class', 1, 16, 6, 3],
      ['통계학', 'class', 1, 16, 9, 3], ['영어회화', 'class', 1, 16, 2, 1],
      ['사진 동아리', 'activity', 1, 16, 3], ['교내 마케팅 공모전', 'project', 3, 9, 6],
    ],
    certs: [[cid(14), 5]], // TOEIC 11월
  },
  {
    id: uid(3), email: 'woonyoung@hakgi.test', display_name: '박운영', persona: '학생회 운영진 (4학년)',
    available_hours: 55,
    plans: [
      ['졸업 프로젝트', 'project', 1, 16, 10], ['데이터마이닝', 'class', 1, 16, 6, 3],
      ['정보보호개론', 'class', 1, 16, 6, 3], ['진로설계', 'class', 1, 16, 2, 1],
      ['단과대 학생회', 'activity', 1, 16, 10], ['축제 준비위원회', 'activity', 6, 8, 8],
    ],
    certs: [[cid(5), 6], [cid(6), 6]], // SQLD + ADsP 준비기간이 겹침
  },
  {
    id: uid(4), email: 'empty@hakgi.test', display_name: '최수강', persona: '수강신청 예정자 · 계획 없음 (빈 화면 테스트)',
    available_hours: 40, plans: [], certs: [],
  },
];

// 사전 검토(F-06) 시연용: 김예보가 "저장 전"에 넣어보는 대외활동 → 폭풍 1주 → 3주 (9, 10주차 추가)
export const previewPlan = { user_id: uid(1), title: '대외 공모전 출전', type: 'activity', credits: null, load_level: 'custom', start_week: 9, end_week: 10, hours_per_week: 10 };

// ─────────────────────────────────────────────
// 4. 부담 산출 (명세서 4장을 그대로 구현한 참조 로직)
//    src/features/forecast/calc.ts 를 만들 때 이 함수와 같은 결과가 나와야 합니다.
// ─────────────────────────────────────────────
const DAY = 86400000;
/** 4.1 week(d) = floor((d − S) / 7) + 1. 1~16 밖이면 학기 범위 밖 */
export function weekOf(dateStr, semesterStart = SEMESTER.start) {
  return Math.floor((Date.parse(dateStr) - Date.parse(semesterStart)) / (7 * DAY)) + 1;
}
/** 4.2 준비 주차 = E−N+1 ~ E (시험 주 포함 N주) 중 1~16주차에 걸친 주 */
export function prepWeeks(examDate, prepN, semesterStart = SEMESTER.start) {
  const e = weekOf(examDate, semesterStart);
  const out = [];
  for (let w = e - prepN + 1; w <= e; w++) if (w >= 1 && w <= SEMESTER.totalWeeks) out.push(w);
  return out; // 빈 배열이면 "이번 학기 범위 밖" (FR-04-6)
}
const round1 = (n) => Math.round(n * 10) / 10;

export function forecast(available, plans, userCerts, exam = { midterm: SEMESTER.midtermWeek, final: SEMESTER.finalWeek }) {
  const weeks = [];
  for (let w = 1; w <= SEMESTER.totalWeeks; w++) {
    const examWeek = w === exam.midterm || w === exam.final;
    const items = [];
    let raw = 0;
    for (const p of plans) {
      if (w < p.start_week || w > p.end_week) continue;
      const weighted = p.type === 'class' && examWeek; // 4.3 m(p,i)
      const h = weighted ? p.hours_per_week * EXAM_WEIGHT : p.hours_per_week;
      raw += h;
      items.push({ source: 'plan', title: p.title, hours: round1(h), examWeighted: weighted });
    }
    for (const uc of userCerts) {
      const c = certificates.find((x) => x.id === uc.certificate_id);
      if (!prepWeeks(c.exam_date, uc.prep_weeks).includes(w)) continue;
      raw += uc.study_hours;
      items.push({ source: 'certificate', title: `${c.name} 준비`, hours: uc.study_hours, examWeighted: false });
    }
    const ratio = raw / available; // 4.4 판정은 반올림 전 값으로
    const level = ratio > LEVEL.OVER_ABOVE ? 'over' : ratio >= LEVEL.OK_BELOW ? 'warn' : 'ok';
    weeks.push({ week: w, isExamWeek: examWeek, total: round1(raw), ratio: round1(ratio * 100), level, items });
  }
  const count = (l) => weeks.filter((x) => x.level === l).length;
  return { weeks, summary: { over: count('over'), warn: count('warn'), ok: count('ok') } };
}

// ─────────────────────────────────────────────
// 5. 정규화 + 결과 계산
// ─────────────────────────────────────────────
const created = '2026-09-01T09:00:00+09:00';
export const profiles = users.map((u) => ({ user_id: u.id, display_name: u.display_name, available_hours: u.available_hours, semester_start: SEMESTER.start, midterm_week: SEMESTER.midtermWeek, final_week: SEMESTER.finalWeek }));
export const plans = users.flatMap((u, ui) =>
  u.plans.map(([title, type, start_week, end_week, hours_per_week, credits = null], i) => ({
    id: pid(ui + 1, i + 1), user_id: u.id, title, type,
    credits: type === 'class' ? credits : null,
    load_level: levelOf(type, hours_per_week, credits),
    start_week, end_week, hours_per_week, created_at: created,
  })));
export const userCertificates = users.flatMap((u) => u.certs.map(([certificate_id, study_hours, prep_weeks]) => ({
  user_id: u.id, certificate_id, study_hours,
  prep_weeks: prep_weeks ?? certificates.find((c) => c.id === certificate_id).prep_weeks,
  notified_at: null,
})));

// 생성 전 검증: DB 제약(명세서 5장)과 어긋나는 더미가 있으면 바로 실패
for (const p of plans) {
  const bad = [];
  if (p.title.length < 1 || p.title.length > 30) bad.push('계획명 1~30자');
  if (p.start_week > p.end_week || p.start_week < 1 || p.end_week > 16) bad.push('주차 1~16, 시작 ≤ 종료');
  if (p.hours_per_week < 0.5 || p.hours_per_week > 60 || (p.hours_per_week * 2) % 1 !== 0) bad.push('주당 시간 0.5~60, 0.5 단위');
  if (p.type === 'class' && (p.credits == null || p.credits < 1 || p.credits > 4)) bad.push('수업은 학점 1~4');
  if (bad.length) throw new Error(`plans "${p.title}": ${bad.join(', ')}`);
}
for (const u of users) if (u.plans.length > MAX_PLANS) throw new Error(`${u.display_name}: 계획 ${MAX_PLANS}개 초과`);
for (const c of certificates) if (!Number.isInteger(c.default_study_hours) || c.default_study_hours < 1 || c.default_study_hours > 40) throw new Error(`${c.name}: 기본 학습 시간 1~40 정수`);

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
insert into public.plans (id, user_id, title, type, credits, load_level, start_week, end_week, hours_per_week, created_at) values
${plans.map((p) => `  (${[p.id, p.user_id, p.title, p.type, p.credits, p.load_level, p.start_week, p.end_week, p.hours_per_week, p.created_at].map(q).join(', ')})`).join(',\n')}
on conflict (id) do nothing;

-- 5) 사용자 선택 자격증
insert into public.user_certificates (user_id, certificate_id, study_hours, prep_weeks) values
${userCertificates.map((x) => `  (${[x.user_id, x.certificate_id, x.study_hours, x.prep_weeks].map(q).join(', ')})`).join(',\n')}
on conflict do nothing;

commit;
`;
writeFileSync(join(root, 'supabase/seed.sql'), sql);

const j = (v) => JSON.stringify(v, null, 2);
const ts = `${header.replace('--', '//')}// 학기예보 프론트 목데이터. Supabase 없이 화면을 먼저 만들 때 사용하세요.
// \`expectedForecast\`는 산출 로직 단위 테스트의 정답값으로 쓸 수 있습니다.

export type PlanType = 'class' | 'activity' | 'project';
/** 계획 입력 단계 (F-03): 적음·보통·많음·직접 입력 */
export type PlanLoadLevel = 'low' | 'normal' | 'high' | 'custom';
/** 주차 판정 단계 (F-05): 맑음·흐림·폭풍 */
export type LoadLevel = 'ok' | 'warn' | 'over';

export interface Profile { user_id: string; display_name: string; available_hours: number; semester_start: string; midterm_week: number; final_week: number }
export interface Plan { id: string; user_id: string; title: string; type: PlanType; credits: number | null; load_level: PlanLoadLevel; start_week: number; end_week: number; hours_per_week: number; created_at: string }
export type NewPlan = Omit<Plan, 'id' | 'created_at'>;
export interface Certificate { id: string; name: string; round: string; apply_start: string; apply_end: string; exam_date: string; prep_weeks: number; default_study_hours: number; source_url: string }
export interface UserCertificate { user_id: string; certificate_id: string; study_hours: number; prep_weeks: number; notified_at: string | null }
export interface WeekLoadItem { source: 'plan' | 'certificate'; title: string; hours: number; examWeighted: boolean }
export interface WeekLoad { week: number; isExamWeek: boolean; total: number; ratio: number; level: LoadLevel; items: WeekLoadItem[] }
export interface Forecast { weeks: WeekLoad[]; summary: Record<LoadLevel, number> }

export const SEMESTER = ${j(SEMESTER)} as const;
export const EXAM_WEIGHT = ${EXAM_WEIGHT};
export const LEVEL_THRESHOLD = ${j(LEVEL)} as const;
export const MAX_PLANS = ${MAX_PLANS};
/** F-03 기본값. 수업은 학점당 시간이라 학점 × 값 (3학점 보통 = 6) */
export const PLAN_DEFAULTS = ${j(PLAN_DEFAULTS)} as const;
export function defaultHours(type: PlanType, level: Exclude<PlanLoadLevel, 'custom'>, credits?: number | null): number {
  const d = PLAN_DEFAULTS[type];
  return d.perCredit ? d[level] * (credits ?? 3) : d[level];
}
/** 화면 표시용 날씨 비유 (명세서 4.4) */
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
