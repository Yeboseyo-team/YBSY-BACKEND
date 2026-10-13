-- 학기예보 초기 스키마 (제안서 6장 데이터베이스 설계)
--
-- 합친 것
--   · 더미데이터 스키마(plans, certificates, user_certificates) → seed.sql, src/mocks/dummy-data.ts 와 그대로 호환
--   · 로그인 뼈대의 profiles(0001_profiles.sql) → 온보딩 판단용 nullable 컬럼, 중간·기말 주차, 구글 이름 처리
--
-- 테이블 관계
--   auth.users 1─1 profiles
--   auth.users 1─N plans
--   auth.users 1─N user_certificates N─1 certificates (팀 사전 입력, 전체 공용)

-- ── 공용: updated_at 자동 갱신 ─────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── profiles: 사용자 기본 설정 ─────────────────────────
-- available_hours, semester_start 가 null 이면 아직 온보딩을 안 한 사용자
create table public.profiles (
  user_id         uuid primary key references auth.users (id) on delete cascade,
  display_name    text check (char_length(display_name) <= 40),
  available_hours smallint check (available_hours between 1 and 168),    -- 주당 가용 시간
  semester_start  date,                                                   -- 1주차 월요일
  midterm_week    smallint not null default 8  check (midterm_week between 1 and 16),
  final_week      smallint not null default 15 check (final_week between 1 and 16),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ── plans: 사용자 등록 계획 ───────────────────────────
create table public.plans (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title          text not null check (char_length(title) between 1 and 60),
  type           text not null check (type in ('class', 'activity', 'project')),
  start_week     smallint not null check (start_week between 1 and 16),
  end_week       smallint not null check (end_week between 1 and 16),
  hours_per_week numeric(4,1) not null check (hours_per_week > 0 and hours_per_week <= 80),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint plans_week_range check (end_week >= start_week)
);
create index plans_user_id_idx on public.plans (user_id);

create trigger plans_touch_updated_at
  before update on public.plans
  for each row execute function public.touch_updated_at();

-- ── certificates: 팀 사전 입력, 전체 공용 ─────────────
-- 한 행 = 한 회차. 같은 name 의 행들이 F-09(회차 추천) 후보가 됨.
create table public.certificates (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null check (char_length(name) <= 60),
  round               text not null check (char_length(round) <= 40),
  apply_start         date not null,
  apply_end           date not null,
  exam_date           date not null,
  prep_weeks          smallint not null default 6 check (prep_weeks between 1 and 16),
  default_study_hours numeric(4,1) not null default 6 check (default_study_hours > 0 and default_study_hours <= 60),
  source_url          text check (source_url ~ '^https?://'),
  constraint certificates_apply_range check (apply_end >= apply_start),
  constraint certificates_exam_after_apply check (exam_date > apply_end),
  constraint certificates_name_round_key unique (name, round)
);
create index certificates_exam_date_idx on public.certificates (exam_date);

-- ── user_certificates: 사용자 선택 자격증 ─────────────
create table public.user_certificates (
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  certificate_id uuid not null references public.certificates (id) on delete cascade,
  study_hours    numeric(4,1) not null check (study_hours > 0 and study_hours <= 60),
  created_at     timestamptz not null default now(),
  primary key (user_id, certificate_id)
);
-- PK가 user_id 조회를 처리하므로 FK 인덱스는 certificate_id 쪽만
create index user_certificates_certificate_id_idx on public.user_certificates (certificate_id);

-- ── RLS: 본인 데이터만 조회·수정 ──────────────────────
-- auth.uid() 를 (select ...) 로 감싸면 행마다 다시 계산하지 않아 빠름
alter table public.profiles          enable row level security;
alter table public.plans             enable row level security;
alter table public.certificates      enable row level security;
alter table public.user_certificates enable row level security;

-- profiles: 생성은 가입 트리거가, 삭제는 탈퇴 시 cascade 가 담당 → 읽기·수정만 허용
create policy "profiles: select own" on public.profiles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "plans: own" on public.plans
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "user_certificates: own" on public.user_certificates
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- 자격증 목록은 누구나 읽기만 (쓰기는 마이그레이션·시드로)
create policy "certificates: read" on public.certificates
  for select to anon, authenticated using (true);

-- 로그인하지 않은 사용자는 개인 테이블에 아예 접근 불가 (RLS와 이중 잠금)
revoke all on public.profiles, public.plans, public.user_certificates from anon;
revoke insert, update, delete, truncate on public.certificates from anon, authenticated;

-- ── 가입 시 profiles 자동 생성 ────────────────────────
-- 이메일 가입은 display_name, 구글 로그인은 full_name / name 을 사용
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    left(coalesce(
      new.raw_user_meta_data ->> 'display_name',
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ), 40)
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- 트리거 전용 함수라 API(RPC)로 직접 호출하지 못하게 막음
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
