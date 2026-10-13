-- ⚠ 자동 생성 파일: scripts/generate-dummy.mjs 를 수정한 뒤 재생성하세요.
-- 학기예보 로컬 시드 (supabase db reset 시 자동 실행)
-- 데모 계정 비밀번호: hakgi1234!
-- 자격증 일정은 더미입니다. 실제 서비스 전 공식 공고로 교체하세요.

begin;

-- 1) 데모 사용자 (auth) — handle_new_user 트리거가 profiles 행을 자동 생성
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
values ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'yebo@hakgi.test', extensions.crypt('hakgi1234!', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"김예보"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', '{"sub":"a0000000-0000-4000-8000-000000000001","email":"yebo@hakgi.test","email_verified":true}', 'email', now(), now(), now())
on conflict do nothing;
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
values ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'jiwon@hakgi.test', extensions.crypt('hakgi1234!', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"이지원"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', '{"sub":"a0000000-0000-4000-8000-000000000002","email":"jiwon@hakgi.test","email_verified":true}', 'email', now(), now(), now())
on conflict do nothing;
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
values ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'woonyoung@hakgi.test', extensions.crypt('hakgi1234!', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"박운영"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', '{"sub":"a0000000-0000-4000-8000-000000000003","email":"woonyoung@hakgi.test","email_verified":true}', 'email', now(), now(), now())
on conflict do nothing;
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
values ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'empty@hakgi.test', extensions.crypt('hakgi1234!', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"최수강"}', now(), now(), '', '', '', '')
on conflict (id) do nothing;
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('a0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000004', '{"sub":"a0000000-0000-4000-8000-000000000004","email":"empty@hakgi.test","email_verified":true}', 'email', now(), now(), now())
on conflict do nothing;

-- 2) 프로필 (가용 시간)
insert into public.profiles (user_id, display_name, available_hours, semester_start) values ('a0000000-0000-4000-8000-000000000001', '김예보', 50, '2026-08-31')
on conflict (user_id) do update set display_name = excluded.display_name, available_hours = excluded.available_hours, semester_start = excluded.semester_start;
insert into public.profiles (user_id, display_name, available_hours, semester_start) values ('a0000000-0000-4000-8000-000000000002', '이지원', 45, '2026-08-31')
on conflict (user_id) do update set display_name = excluded.display_name, available_hours = excluded.available_hours, semester_start = excluded.semester_start;
insert into public.profiles (user_id, display_name, available_hours, semester_start) values ('a0000000-0000-4000-8000-000000000003', '박운영', 55, '2026-08-31')
on conflict (user_id) do update set display_name = excluded.display_name, available_hours = excluded.available_hours, semester_start = excluded.semester_start;
insert into public.profiles (user_id, display_name, available_hours, semester_start) values ('a0000000-0000-4000-8000-000000000004', '최수강', 40, '2026-08-31')
on conflict (user_id) do update set display_name = excluded.display_name, available_hours = excluded.available_hours, semester_start = excluded.semester_start;

-- 3) 자격증 일정 (공용)
insert into public.certificates (id, name, round, apply_start, apply_end, exam_date, prep_weeks, default_study_hours, source_url) values
  ('c0000000-0000-4000-8000-000000000001', '정보처리기사', '2026년 정기 3회 실기', '2026-09-22', '2026-09-25', '2026-11-01', 6, 8, 'https://www.q-net.or.kr'),
  ('c0000000-0000-4000-8000-000000000002', '정보처리기사', '2026년 정기 4회 필기', '2026-10-19', '2026-10-22', '2026-11-28', 6, 8, 'https://www.q-net.or.kr'),
  ('c0000000-0000-4000-8000-000000000003', '정보처리기사', '2027년 정기 1회 필기', '2027-01-12', '2027-01-15', '2027-02-20', 6, 8, 'https://www.q-net.or.kr'),
  ('c0000000-0000-4000-8000-000000000004', '정보처리산업기사', '2026년 정기 4회 필기', '2026-10-19', '2026-10-22', '2026-11-28', 5, 6, 'https://www.q-net.or.kr'),
  ('c0000000-0000-4000-8000-000000000005', 'SQLD', '제62회', '2026-10-05', '2026-10-16', '2026-11-14', 4, 6, 'https://www.dataq.or.kr'),
  ('c0000000-0000-4000-8000-000000000006', 'ADsP', '제51회', '2026-10-12', '2026-10-23', '2026-11-21', 4, 6, 'https://www.dataq.or.kr'),
  ('c0000000-0000-4000-8000-000000000007', '빅데이터분석기사', '제13회 필기', '2026-09-07', '2026-09-11', '2026-10-10', 6, 8, 'https://www.dataq.or.kr'),
  ('c0000000-0000-4000-8000-000000000008', '컴퓨터활용능력 1급', '2026년 상시 11월', '2026-10-26', '2026-11-06', '2026-11-21', 4, 7, 'https://license.korcham.net'),
  ('c0000000-0000-4000-8000-000000000009', '컴퓨터활용능력 2급', '2026년 상시 10월', '2026-09-28', '2026-10-09', '2026-10-24', 3, 5, 'https://license.korcham.net'),
  ('c0000000-0000-4000-8000-000000000010', '정보보안기사', '제28회 필기', '2026-08-17', '2026-08-21', '2026-09-19', 8, 10, 'https://www.kisq.or.kr'),
  ('c0000000-0000-4000-8000-000000000011', '리눅스마스터 2급', '2026년 2차 1급·2급', '2026-10-26', '2026-11-02', '2026-12-12', 4, 5, 'https://www.ihd.or.kr'),
  ('c0000000-0000-4000-8000-000000000012', '네트워크관리사 2급', '제84회 필기', '2026-10-05', '2026-10-09', '2026-11-08', 3, 5, 'https://www.icqa.or.kr'),
  ('c0000000-0000-4000-8000-000000000013', '한국사능력검정시험 심화', '제79회', '2026-09-29', '2026-10-06', '2026-10-31', 4, 5, 'https://www.historyexam.go.kr'),
  ('c0000000-0000-4000-8000-000000000014', 'TOEIC', '2026년 11월 정기', '2026-09-28', '2026-10-30', '2026-11-15', 4, 6, 'https://exam.toeic.co.kr'),
  ('c0000000-0000-4000-8000-000000000015', 'TOEIC Speaking', '2026년 11월', '2026-10-12', '2026-11-05', '2026-11-08', 2, 4, 'https://exam.toeic.co.kr'),
  ('c0000000-0000-4000-8000-000000000016', 'OPIc', '2026년 12월', '2026-11-02', '2026-12-01', '2026-12-05', 3, 4, 'https://www.opic.or.kr'),
  ('c0000000-0000-4000-8000-000000000017', '전산회계 1급', '제124회', '2026-10-29', '2026-11-04', '2026-12-05', 5, 6, 'https://license.kacpta.or.kr'),
  ('c0000000-0000-4000-8000-000000000018', '사회조사분석사 2급', '2026년 정기 4회 필기', '2026-10-19', '2026-10-22', '2026-11-28', 6, 7, 'https://www.q-net.or.kr'),
  ('c0000000-0000-4000-8000-000000000019', 'GTQ 1급', '제155회', '2026-10-19', '2026-10-26', '2026-11-14', 3, 5, 'https://license.kpc.or.kr'),
  ('c0000000-0000-4000-8000-000000000020', '유통관리사 2급', '2026년 3회', '2026-10-12', '2026-10-19', '2026-11-07', 4, 5, 'https://license.korcham.net')
on conflict (id) do nothing;

-- 4) 계획
insert into public.plans (id, user_id, title, type, start_week, end_week, hours_per_week, created_at) values
  ('b0000000-0000-4000-0001-000000000001', 'a0000000-0000-4000-8000-000000000001', '운영체제', 'class', 1, 16, 6, '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0001-000000000002', 'a0000000-0000-4000-8000-000000000001', '데이터베이스', 'class', 1, 16, 6, '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0001-000000000003', 'a0000000-0000-4000-8000-000000000001', '컴퓨터네트워크', 'class', 1, 16, 6, '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0001-000000000004', 'a0000000-0000-4000-8000-000000000001', '소프트웨어공학', 'class', 1, 16, 4, '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0001-000000000005', 'a0000000-0000-4000-8000-000000000001', '교양 글쓰기', 'class', 1, 16, 3, '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0001-000000000006', 'a0000000-0000-4000-8000-000000000001', '프로그래밍 학회', 'activity', 1, 16, 4, '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0001-000000000007', 'a0000000-0000-4000-8000-000000000001', 'DB 팀 프로젝트', 'project', 6, 10, 4, '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0002-000000000001', 'a0000000-0000-4000-8000-000000000002', '경영학원론', 'class', 1, 16, 5, '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0002-000000000002', 'a0000000-0000-4000-8000-000000000002', '마케팅원론', 'class', 1, 16, 5, '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0002-000000000003', 'a0000000-0000-4000-8000-000000000002', '회계원리', 'class', 1, 16, 6, '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0002-000000000004', 'a0000000-0000-4000-8000-000000000002', '통계학', 'class', 1, 16, 6, '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0002-000000000005', 'a0000000-0000-4000-8000-000000000002', '영어회화', 'class', 1, 16, 2, '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0002-000000000006', 'a0000000-0000-4000-8000-000000000002', '사진 동아리', 'activity', 1, 16, 3, '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0002-000000000007', 'a0000000-0000-4000-8000-000000000002', '교내 마케팅 공모전', 'project', 3, 9, 5, '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0003-000000000001', 'a0000000-0000-4000-8000-000000000003', '졸업 프로젝트', 'project', 1, 16, 10, '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0003-000000000002', 'a0000000-0000-4000-8000-000000000003', '데이터마이닝', 'class', 1, 16, 6, '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0003-000000000003', 'a0000000-0000-4000-8000-000000000003', '정보보호개론', 'class', 1, 16, 6, '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0003-000000000004', 'a0000000-0000-4000-8000-000000000003', '진로설계', 'class', 1, 16, 2, '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0003-000000000005', 'a0000000-0000-4000-8000-000000000003', '단과대 학생회', 'activity', 1, 16, 10, '2026-09-01T09:00:00+09:00'),
  ('b0000000-0000-4000-0003-000000000006', 'a0000000-0000-4000-8000-000000000003', '축제 준비위원회', 'activity', 6, 8, 8, '2026-09-01T09:00:00+09:00')
on conflict (id) do nothing;

-- 5) 사용자 선택 자격증
insert into public.user_certificates (user_id, certificate_id, study_hours) values
  ('a0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002', 8),
  ('a0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000014', 5),
  ('a0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000005', 6),
  ('a0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000006', 6)
on conflict do nothing;

commit;
