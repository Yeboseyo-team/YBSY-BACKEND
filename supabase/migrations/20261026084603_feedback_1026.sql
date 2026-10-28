-- 10/26 피드백 반영 — 기존 화면이 그대로 동작하도록 추가만 합니다.
-- 1) 공부 스타일 (꾸준·보통·벼락치기): 예보를 주별로 나누는 모양이 달라짐
-- 2) 실제로 한 시간 기록: 계획보다 더/덜 하면 같은 계획의 남은 일정이 다시 계산됨

-- ── 1) 공부 스타일 ──────────────────────────────────────
alter table public.profiles
  add column study_style text not null default 'steady'
  constraint profiles_study_style_check check (study_style in ('steady', 'normal', 'cram'));

-- ── 2) 실제 기록 (계획 또는 자격증 준비 하나의 하루치) ────
create table public.study_logs (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references public.profiles (user_id) on delete cascade,
  plan_id        uuid references public.plans (id) on delete cascade,
  certificate_id uuid references public.certificates (id) on delete cascade,
  date           date not null,
  hours          numeric(4, 2) not null check (hours >= 0 and hours <= 24),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint study_logs_one_target check ((plan_id is null) <> (certificate_id is null)),
  -- 같은 날 같은 일은 한 줄 (다시 기록하면 덮어쓰기)
  constraint study_logs_unique unique nulls not distinct (user_id, plan_id, certificate_id, date)
);

create trigger study_logs_updated_at before update on public.study_logs
  for each row execute function public.set_updated_at();

alter table public.study_logs enable row level security;
create policy "study_logs: own" on public.study_logs
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
revoke all on public.study_logs from anon;
revoke truncate, references, trigger on public.study_logs from authenticated;

create index study_logs_user_date on public.study_logs (user_id, date);
