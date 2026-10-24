-- QA 반영 (2026-10-24) — 기존 화면이 그대로 동작하도록 모두 "추가·완화"만 합니다.
-- 1) 1주차 = 개강일부터 7일씩 (개강일이 월요일이 아니어도 됨)
-- 2) 요일별 가용 시간 (월~일, 합계 = available_hours)
-- 3) 계획: 날짜로 기간 지정, 우선순위, 사용자 지정 유형(plan_categories), 학점 1~6
-- 4) 자격증: 사용자가 직접 추가하는 회차 (owner_id)

-- ── 1) 학기 시작일 월요일 제약 제거 ─────────────────────
alter table public.profiles drop constraint profiles_semester_start_check;

-- ── 2) 요일별 가용 시간 [월, 화, 수, 목, 금, 토, 일] ─────
alter table public.profiles add column daily_hours smallint[]
  constraint profiles_daily_hours_check check (
    daily_hours is null
    or (array_length(daily_hours, 1) = 7 and 0 <= all (daily_hours) and 24 >= all (daily_hours))
  );

-- ── 3) 계획 ─────────────────────────────────────────────
-- 사용자 지정 유형 (예: 결혼식). 이름만 두고 시간은 계획마다 직접 입력
create table public.plan_categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references public.profiles (user_id) on delete cascade,
  name       text not null check (char_length(btrim(name)) between 1 and 10),
  created_at timestamptz not null default now(),
  constraint plan_categories_user_name_key unique (user_id, name),
  constraint plan_categories_id_user_key unique (id, user_id)
);
alter table public.plan_categories enable row level security;
create policy "plan_categories: own" on public.plan_categories
  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
revoke all on public.plan_categories from anon;
revoke truncate, references, trigger on public.plan_categories from authenticated;

-- 사용자당 유형 10개 (화면에서 먼저 막음)
create function public.enforce_category_limit()
returns trigger language plpgsql set search_path = '' as $$
begin
  if (select count(*) from public.plan_categories where user_id = new.user_id) >= 10 then
    raise exception '내 유형은 10개까지 만들 수 있어요.' using errcode = 'P0032';
  end if;
  return new;
end;
$$;
create trigger plan_categories_limit before insert on public.plan_categories
  for each row execute function public.enforce_category_limit();
revoke execute on function public.enforce_category_limit() from public, anon, authenticated;

alter table public.plans
  add column start_date  date,
  add column end_date    date,
  add column priority    text not null default 'normal',
  add column category_id uuid;

alter table public.plans
  add constraint plans_date_order check (start_date is null or end_date is null or start_date <= end_date),
  add constraint plans_priority_check check (priority in ('high', 'normal', 'low')),
  -- 유형은 내 것만 (id + user_id 를 함께 참조). 유형을 지우면 그 계획은 "기타"(category_id null)로 남음
  add constraint plans_category_fkey foreign key (category_id, user_id)
    references public.plan_categories (id, user_id) on delete set null (category_id);

alter table public.plans drop constraint plans_type_check;
alter table public.plans add constraint plans_type_check check (type in ('class', 'activity', 'project', 'custom'));
alter table public.plans drop constraint plans_credits_check;
alter table public.plans add constraint plans_credits_check check (credits between 1 and 6);

-- ── 4) 사용자가 직접 추가하는 자격증 회차 ────────────────
-- owner_id 가 null 이면 팀이 넣은 공용 회차, 있으면 그 사용자만 보고 고칠 수 있는 회차
alter table public.certificates
  add column owner_id uuid default auth.uid() references public.profiles (user_id) on delete cascade;

-- 이름·회차 중복 금지는 공용 회차끼리, 그리고 한 사용자 안에서만
alter table public.certificates drop constraint certificates_name_round_key;
create unique index certificates_public_name_round_key on public.certificates (name, round) where owner_id is null;
create unique index certificates_owner_name_round_key on public.certificates (owner_id, name, round) where owner_id is not null;

drop policy "certificates: read for signed-in" on public.certificates;
create policy "certificates: read public or own" on public.certificates
  for select to authenticated using (owner_id is null or owner_id = (select auth.uid()));
create policy "certificates: insert own" on public.certificates
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "certificates: update own" on public.certificates
  for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "certificates: delete own" on public.certificates
  for delete to authenticated using (owner_id = (select auth.uid()));
grant insert, update, delete on public.certificates to authenticated;

-- 사용자당 직접 추가 회차 20개
create function public.enforce_own_certificate_limit()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.owner_id is not null
     and (select count(*) from public.certificates where owner_id = new.owner_id) >= 20 then
    raise exception '자격증은 20개까지 직접 추가할 수 있어요.' using errcode = 'P0033';
  end if;
  return new;
end;
$$;
create trigger certificates_own_limit before insert on public.certificates
  for each row execute function public.enforce_own_certificate_limit();
revoke execute on function public.enforce_own_certificate_limit() from public, anon, authenticated;
