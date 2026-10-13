-- 학기예보 초기 스키마 — 기준: 요구사항 명세서 5장 (2026-10-13)
-- "보완" 표시 컬럼 포함: profiles.midterm_week/final_week, plans.credits/load_level,
-- certificates.default_study_hours, user_certificates.prep_weeks/notified_at

-- ── 공통: updated_at 자동 갱신 ─────────────────────────
create function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ── 5.1 profiles — 사용자 학기 설정 ─────────────────────
-- available_hours / semester_start 가 null 이면 온보딩 미완료 (FR-01-11)
create table public.profiles (
  user_id         uuid primary key references auth.users (id) on delete cascade,
  display_name    text check (char_length(display_name) <= 40),
  available_hours smallint check (available_hours between 1 and 168),
  semester_start  date check (extract(isodow from semester_start) = 1), -- 1주차 월요일
  midterm_week    smallint not null default 8  check (midterm_week between 1 and 20),
  final_week      smallint not null default 15 check (final_week between 1 and 20),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── 5.2 plans — 사용자 계획 ─────────────────────────────
create table public.plans (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references public.profiles (user_id) on delete cascade,
  title          text not null check (char_length(title) between 1 and 30),
  type           text not null check (type in ('class', 'activity', 'project')),
  credits        smallint check (credits between 1 and 4),
  load_level     text not null default 'normal' check (load_level in ('low', 'normal', 'high', 'custom')),
  start_week     smallint not null check (start_week between 1 and 16),
  end_week       smallint not null check (end_week between 1 and 16),
  hours_per_week numeric(4,1) not null check (hours_per_week between 0.5 and 60 and hours_per_week * 2 = trunc(hours_per_week * 2)),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint plans_week_order check (start_week <= end_week),
  constraint plans_credits_only_class check ((type = 'class') = (credits is not null))
);
create index plans_user_id_idx on public.plans (user_id);
create trigger plans_updated_at before update on public.plans
  for each row execute function public.set_updated_at();

-- ── 5.3 certificates — 자격증 회차 (공용) ───────────────
create table public.certificates (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  round               text not null,
  apply_start         date not null,
  apply_end           date not null,
  exam_date           date not null,
  prep_weeks          smallint not null check (prep_weeks between 1 and 16),
  default_study_hours smallint not null default 8 check (default_study_hours between 1 and 40),
  source_url          text,
  constraint certificates_name_round_key unique (name, round),
  constraint certificates_apply_order check (apply_start <= apply_end),
  constraint certificates_exam_after_apply check (apply_end < exam_date)
);

-- ── 5.4 user_certificates — 사용자가 고른 회차 ──────────
create table public.user_certificates (
  user_id        uuid not null default auth.uid() references public.profiles (user_id) on delete cascade,
  certificate_id uuid not null references public.certificates (id) on delete cascade,
  study_hours    smallint not null default 8 check (study_hours between 1 and 40),
  prep_weeks     smallint not null check (prep_weeks between 1 and 16),
  notified_at    timestamptz, -- F-07 마감 알림 발송 시각
  primary key (user_id, certificate_id)
);

-- ── 5.5 접근 정책 (RLS) ─────────────────────────────────
alter table public.profiles          enable row level security;
alter table public.plans             enable row level security;
alter table public.certificates      enable row level security;
alter table public.user_certificates enable row level security;

-- profiles: 조회·수정은 본인, 추가는 가입 트리거만, 삭제는 계정 삭제 시 cascade
create policy "profiles: select own" on public.profiles
  for select to authenticated using (user_id = (select auth.uid()));
create policy "profiles: update own" on public.profiles
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- plans, user_certificates: 조회·추가·수정·삭제 모두 본인
create policy "plans: own" on public.plans
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "user_certificates: own" on public.user_certificates
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- certificates: 로그인 사용자 조회만, 쓰기는 대시보드/시드(운영자)
create policy "certificates: read for signed-in" on public.certificates
  for select to authenticated using (true);

-- ── FR-01-10 가입 시 profiles 자동 생성 ─────────────────
-- 이름: 이메일 가입은 display_name, Google 가입은 full_name/name (FR-01-5)
create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'display_name',
                  new.raw_user_meta_data ->> 'full_name',
                  new.raw_user_meta_data ->> 'name'), 40)
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
