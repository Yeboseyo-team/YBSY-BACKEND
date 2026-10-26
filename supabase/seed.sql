-- ⚠ 자동 생성 파일: scripts/generate-dummy.mjs 를 수정한 뒤 재생성하세요.
-- 학기예보 시드 (명세서 5.6). supabase db reset 시 자동 실행, 여러 번 실행해도 같은 결과.
-- 데모 계정 비밀번호: hakgi1234   ※ 운영 사이트도 같은 프로젝트를 씁니다(팀 결정 10/14).
-- 자격증 일정은 2026-10-14 시행 기관 공고 기준입니다. 2027년 회차는 "(예정)" 예상값입니다.
-- 데모 계정 데이터만 처음 상태로 되돌리려면 supabase/reset-demo.sql 을 실행하세요.

begin;

-- 1) 데모 사용자 (auth) — handle_new_user 트리거가 profiles 행을 자동 생성 (FR-01-10)
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
values ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'yebo@hakgi.test', extensions.crypt('hakgi1234', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"김예보"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', '{"sub":"a0000000-0000-4000-8000-000000000001","email":"yebo@hakgi.test","email_verified":true}', 'email', now(), now(), now())
on conflict do nothing;
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
values ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'jiwon@hakgi.test', extensions.crypt('hakgi1234', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"이지원"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', '{"sub":"a0000000-0000-4000-8000-000000000002","email":"jiwon@hakgi.test","email_verified":true}', 'email', now(), now(), now())
on conflict do nothing;
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
values ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'woonyoung@hakgi.test', extensions.crypt('hakgi1234', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"박운영"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', '{"sub":"a0000000-0000-4000-8000-000000000003","email":"woonyoung@hakgi.test","email_verified":true}', 'email', now(), now(), now())
on conflict do nothing;
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
values ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'empty@hakgi.test', extensions.crypt('hakgi1234', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"최수강"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('a0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000004', '{"sub":"a0000000-0000-4000-8000-000000000004","email":"empty@hakgi.test","email_verified":true}', 'email', now(), now(), now())
on conflict do nothing;
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
values ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000005', 'authenticated', 'authenticated', 'newbie@hakgi.test', extensions.crypt('hakgi1234', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"정새내"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('a0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000005', '{"sub":"a0000000-0000-4000-8000-000000000005","email":"newbie@hakgi.test","email_verified":true}', 'email', now(), now(), now())
on conflict do nothing;

-- 2) 학기 설정·개인정보 동의 (정새내는 비워 둠 → 온보딩)
update public.profiles set display_name = '김예보', available_hours = 50, daily_hours = '{8,8,8,8,8,6,4}', semester_start = '2026-08-31', midterm_week = 8, final_week = 15, study_style = 'steady', privacy_agreed_at = '2026-09-01T09:00:00+09:00' where user_id = 'a0000000-0000-4000-8000-000000000001';
update public.profiles set display_name = '이지원', available_hours = 45, daily_hours = '{7,7,7,7,7,6,4}', semester_start = '2026-08-31', midterm_week = 8, final_week = 15, study_style = 'steady', privacy_agreed_at = '2026-09-01T09:00:00+09:00' where user_id = 'a0000000-0000-4000-8000-000000000002';
update public.profiles set display_name = '박운영', available_hours = 55, daily_hours = '{9,9,9,9,9,6,4}', semester_start = '2026-08-31', midterm_week = 8, final_week = 16, study_style = 'steady', privacy_agreed_at = '2026-09-01T09:00:00+09:00' where user_id = 'a0000000-0000-4000-8000-000000000003';
update public.profiles set display_name = '최수강', available_hours = 40, daily_hours = '{6,6,6,6,6,6,4}', semester_start = '2026-08-31', midterm_week = 8, final_week = 15, study_style = 'steady', privacy_agreed_at = '2026-09-01T09:00:00+09:00' where user_id = 'a0000000-0000-4000-8000-000000000004';
update public.profiles set display_name = '정새내', available_hours = null, daily_hours = null, semester_start = null, midterm_week = 8, final_week = 15, study_style = 'steady', privacy_agreed_at = null where user_id = 'a0000000-0000-4000-8000-000000000005';

-- 3) 자격증 회차 (공용)
insert into public.certificates (id, name, round, apply_start, apply_end, exam_date, prep_weeks, default_study_hours, source_url) values
  ('c0000000-0000-4000-8000-000000000001', '정보처리기사', '2026년 정기 3회 필기', '2026-07-20', '2026-07-23', '2026-08-07', 6, 8, 'https://www.q-net.or.kr'),
  ('c0000000-0000-4000-8000-000000000002', '정보처리기사', '2026년 정기 3회 실기', '2026-09-21', '2026-09-28', '2026-10-24', 6, 8, 'https://www.q-net.or.kr'),
  ('c0000000-0000-4000-8000-000000000003', '정보처리기사', '2027년 정기 1회 필기 (예정)', '2027-01-11', '2027-01-14', '2027-01-29', 6, 8, 'https://www.q-net.or.kr'),
  ('c0000000-0000-4000-8000-000000000004', '정보처리산업기사', '2026년 정기 3회 필기', '2026-07-20', '2026-07-23', '2026-08-07', 5, 6, 'https://www.q-net.or.kr'),
  ('c0000000-0000-4000-8000-000000000005', '정보처리산업기사', '2026년 정기 3회 실기', '2026-09-21', '2026-09-28', '2026-10-24', 5, 6, 'https://www.q-net.or.kr'),
  ('c0000000-0000-4000-8000-000000000006', 'SQLD', '제62회', '2026-07-20', '2026-07-24', '2026-08-22', 4, 6, 'https://www.dataq.or.kr'),
  ('c0000000-0000-4000-8000-000000000007', 'SQLD', '제63회', '2026-10-12', '2026-10-16', '2026-11-14', 4, 6, 'https://www.dataq.or.kr'),
  ('c0000000-0000-4000-8000-000000000008', 'ADsP', '제50회', '2026-07-06', '2026-07-10', '2026-08-08', 4, 6, 'https://www.dataq.or.kr'),
  ('c0000000-0000-4000-8000-000000000009', 'ADsP', '제51회', '2026-09-28', '2026-10-02', '2026-10-31', 4, 6, 'https://www.dataq.or.kr'),
  ('c0000000-0000-4000-8000-000000000010', '빅데이터분석기사', '제13회 필기', '2026-08-03', '2026-08-07', '2026-09-05', 6, 8, 'https://www.dataq.or.kr'),
  ('c0000000-0000-4000-8000-000000000011', '빅데이터분석기사', '제13회 실기', '2026-10-26', '2026-10-30', '2026-11-28', 6, 8, 'https://www.dataq.or.kr'),
  ('c0000000-0000-4000-8000-000000000012', '한국사능력검정시험 심화', '제80회', '2026-09-15', '2026-09-22', '2026-10-17', 4, 5, 'https://www.historyexam.go.kr'),
  ('c0000000-0000-4000-8000-000000000013', '전산회계 1급', '제128회', '2026-08-27', '2026-09-02', '2026-10-03', 5, 6, 'https://license.kacpta.or.kr'),
  ('c0000000-0000-4000-8000-000000000014', '전산회계 1급', '제129회', '2026-11-05', '2026-11-11', '2026-12-05', 5, 6, 'https://license.kacpta.or.kr'),
  ('c0000000-0000-4000-8000-000000000015', '유통관리사 2급', '2026년 2회', '2026-07-30', '2026-08-05', '2026-08-22', 4, 5, 'https://license.korcham.net')
on conflict (id) do update set name = excluded.name, round = excluded.round, apply_start = excluded.apply_start, apply_end = excluded.apply_end,
  exam_date = excluded.exam_date, prep_weeks = excluded.prep_weeks, default_study_hours = excluded.default_study_hours, source_url = excluded.source_url;

-- 4) 사용자 지정 유형·계획
insert into public.plan_categories (id, user_id, name, created_at) values
  ('d0000000-0000-4000-0001-000000000001', 'a0000000-0000-4000-8000-000000000001', '경조사', '2026-09-01T09:00:00+09:00')
on conflict (id) do nothing;

insert into public.plans (id, user_id, title, type, credits, load_level, start_week, end_week, hours_per_week, start_date, end_date, priority, category_id, created_at, updated_at) values
  ('b0000000-0000-4000-0001-000000000001', 'a0000000-0000-4000-8000-000000000001', '운영체제', 'class', 3, 'custom', 1, 16, 6, null, null, 'normal', null, '2026-09-01T09:00:00+09:00', '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0001-000000000002', 'a0000000-0000-4000-8000-000000000001', '데이터베이스', 'class', 3, 'custom', 1, 16, 6, null, null, 'normal', null, '2026-09-01T09:00:00+09:00', '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0001-000000000003', 'a0000000-0000-4000-8000-000000000001', '컴퓨터네트워크', 'class', 3, 'custom', 1, 16, 6, null, null, 'normal', null, '2026-09-01T09:00:00+09:00', '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0001-000000000004', 'a0000000-0000-4000-8000-000000000001', '소프트웨어공학', 'class', 3, 'custom', 1, 16, 6, null, null, 'low', null, '2026-09-01T09:00:00+09:00', '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0001-000000000005', 'a0000000-0000-4000-8000-000000000001', '알고리즘', 'class', 3, 'custom', 1, 16, 6, null, null, 'high', null, '2026-09-01T09:00:00+09:00', '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0001-000000000006', 'a0000000-0000-4000-8000-000000000001', '프로그래밍 학회', 'activity', null, 'normal', 1, 16, 4, null, null, 'low', null, '2026-09-01T09:00:00+09:00', '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0001-000000000007', 'a0000000-0000-4000-8000-000000000001', '캡스톤 디자인 중간 발표', 'project', null, 'custom', 9, 10, 6, '2026-10-26', '2026-11-08', 'high', null, '2026-09-01T09:00:00+09:00', '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0001-000000000008', 'a0000000-0000-4000-8000-000000000001', '사촌형 결혼식', 'custom', null, 'custom', 9, 9, 6, '2026-10-31', '2026-10-31', 'high', 'd0000000-0000-4000-0001-000000000001', '2026-09-01T09:00:00+09:00', '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0002-000000000001', 'a0000000-0000-4000-8000-000000000002', '경영학원론', 'class', 3, 'custom', 1, 16, 6, null, null, 'normal', null, '2026-09-01T09:00:00+09:00', '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0002-000000000002', 'a0000000-0000-4000-8000-000000000002', '마케팅원론', 'class', 3, 'custom', 1, 16, 4.5, null, null, 'low', null, '2026-09-01T09:00:00+09:00', '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0002-000000000003', 'a0000000-0000-4000-8000-000000000002', '회계원리', 'class', 3, 'custom', 1, 16, 6, null, null, 'high', null, '2026-09-01T09:00:00+09:00', '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0002-000000000004', 'a0000000-0000-4000-8000-000000000002', '경영통계', 'class', 3, 'custom', 1, 16, 6, null, null, 'normal', null, '2026-09-01T09:00:00+09:00', '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0002-000000000005', 'a0000000-0000-4000-8000-000000000002', '비즈니스 영어회화', 'class', 2, 'custom', 1, 16, 3, null, null, 'normal', null, '2026-09-01T09:00:00+09:00', '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0002-000000000006', 'a0000000-0000-4000-8000-000000000002', '사진 동아리', 'activity', null, 'low', 1, 16, 2, null, null, 'normal', null, '2026-09-01T09:00:00+09:00', '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0002-000000000007', 'a0000000-0000-4000-8000-000000000002', '교내 마케팅 공모전', 'project', null, 'normal', 3, 9, 6, null, null, 'normal', null, '2026-09-01T09:00:00+09:00', '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0003-000000000001', 'a0000000-0000-4000-8000-000000000003', '졸업 프로젝트', 'project', null, 'high', 1, 16, 10, null, null, 'high', null, '2026-09-01T09:00:00+09:00', '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0003-000000000002', 'a0000000-0000-4000-8000-000000000003', '데이터마이닝', 'class', 3, 'custom', 1, 16, 6, null, null, 'normal', null, '2026-09-01T09:00:00+09:00', '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0003-000000000003', 'a0000000-0000-4000-8000-000000000003', '정보보호개론', 'class', 3, 'custom', 1, 16, 6, null, null, 'normal', null, '2026-09-01T09:00:00+09:00', '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0003-000000000004', 'a0000000-0000-4000-8000-000000000003', '진로설계', 'class', 1, 'custom', 1, 16, 2, null, null, 'low', null, '2026-09-01T09:00:00+09:00', '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0003-000000000005', 'a0000000-0000-4000-8000-000000000003', '단과대 학생회', 'activity', null, 'custom', 1, 16, 10, null, null, 'normal', null, '2026-09-01T09:00:00+09:00', '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0003-000000000006', 'a0000000-0000-4000-8000-000000000003', '축제 준비위원회', 'activity', null, 'high', 6, 8, 8, null, null, 'normal', null, '2026-09-01T09:00:00+09:00', '2026-09-01T09:00:00+09:00')
on conflict (id) do nothing;

-- 5) 사용자 선택 회차
insert into public.user_certificates (user_id, certificate_id, study_hours, prep_weeks, notified_at) values
  ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002', 8, 6, null),
  ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000007', 8, 3, null),
  ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000011', 6, 2, null),
  ('a0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000014', 5, 5, null),
  ('a0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000003', 8, 8, null),
  ('a0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000007', 6, 4, null),
  ('a0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000011', 6, 3, null)
on conflict do nothing;

commit;
