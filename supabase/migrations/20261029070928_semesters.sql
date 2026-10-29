-- 학기별 저장 (10/29) — 이번 학기 ↔ 다음 학기를 오갈 수 있게.
-- 학기마다 설정(개강일·쓸 수 있는 시간·시험 주차·공부 스타일)을 semesters 에 두고, 계획·고른 자격증·기록에 semester_id 를 붙여요.
-- profiles 의 학기 설정 칸은 "지금 보고 있는 학기"(current_semester_id)의 값이고, 바뀌면 그 학기 행에 그대로 저장돼요.
-- RLS 가 지금 학기 것만 보여 줘서, 화면 코드는 지금처럼 계획·자격증·기록을 읽고 쓰면 돼요.
-- 내 유형(plan_categories)·직접 추가한 자격증(certificates)은 학기와 상관없이 같이 써요.

-- 1) 학기 표
create table public.semesters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(user_id) on delete cascade,
  semester_start date,
  available_hours smallint,
  daily_hours smallint[],
  midterm_week smallint not null default 8,
  final_week smallint not null default 15,
  study_style text not null default 'steady',
  created_at timestamptz not null default now(),
  unique (id, user_id)
);
comment on table public.semesters is '학기별 설정 (10/29). 지금 학기는 profiles.current_semester_id';
alter table public.semesters enable row level security;
create policy "semesters: select own" on public.semesters for select using (user_id = (select auth.uid()));
revoke all on public.semesters from anon, authenticated;
grant select on public.semesters to authenticated;

-- 2) 지금 학기
alter table public.profiles add column current_semester_id uuid;
insert into public.semesters (user_id, semester_start, available_hours, daily_hours, midterm_week, final_week, study_style, created_at)
select user_id, semester_start, available_hours, daily_hours, midterm_week, final_week, study_style, created_at from public.profiles;
update public.profiles p set current_semester_id = s.id from public.semesters s where s.user_id = p.user_id;
alter table public.profiles
  add constraint profiles_current_semester_fkey foreign key (current_semester_id, user_id) references public.semesters (id, user_id);

-- 3) 계획·고른 자격증·기록에 학기 붙이기 (지금 있는 건 모두 지금 학기)
alter table public.plans add column semester_id uuid;
alter table public.user_certificates add column semester_id uuid;
alter table public.study_logs add column semester_id uuid;
update public.plans t set semester_id = p.current_semester_id from public.profiles p where p.user_id = t.user_id;
update public.user_certificates t set semester_id = p.current_semester_id from public.profiles p where p.user_id = t.user_id;
update public.study_logs t set semester_id = p.current_semester_id from public.profiles p where p.user_id = t.user_id;
alter table public.plans alter column semester_id set not null,
  add constraint plans_semester_fkey foreign key (semester_id, user_id) references public.semesters (id, user_id) on delete cascade;
alter table public.user_certificates alter column semester_id set not null,
  add constraint user_certificates_semester_fkey foreign key (semester_id, user_id) references public.semesters (id, user_id) on delete cascade;
alter table public.study_logs alter column semester_id set not null,
  add constraint study_logs_semester_fkey foreign key (semester_id, user_id) references public.semesters (id, user_id) on delete cascade;
-- 같은 자격증 회차를 학기마다 고를 수 있게
alter table public.user_certificates drop constraint user_certificates_pkey,
  add constraint user_certificates_pkey primary key (user_id, certificate_id, semester_id);
alter table public.study_logs drop constraint study_logs_unique,
  add constraint study_logs_unique unique nulls not distinct (user_id, semester_id, plan_id, certificate_id, date);
create index plans_semester_idx on public.plans (semester_id);
create index user_certificates_semester_idx on public.user_certificates (semester_id);
create index study_logs_semester_idx on public.study_logs (semester_id);

-- 4) 지금 학기 id (RLS·기본값용)
create or replace function public.current_semester_id()
returns uuid
language sql
stable
security definer
set search_path to ''
as $function$
  select current_semester_id from public.profiles where user_id = (select auth.uid());
$function$;
revoke all on function public.current_semester_id() from public, anon;
grant execute on function public.current_semester_id() to authenticated;

-- 새로 넣는 계획·자격증·기록은 그 사람의 지금 학기로 (화면은 semester_id 를 안 보내도 돼요)
create or replace function public.fill_semester_id()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if new.semester_id is null then
    select current_semester_id into new.semester_id from public.profiles where user_id = new.user_id;
  end if;
  return new;
end;
$function$;
-- 이름 앞 a_ : plans_limit 보다 먼저 돌게
create trigger a_plans_semester before insert on public.plans for each row execute function public.fill_semester_id();
create trigger a_user_certificates_semester before insert on public.user_certificates for each row execute function public.fill_semester_id();
create trigger a_study_logs_semester before insert on public.study_logs for each row execute function public.fill_semester_id();

-- 계획 30개 상한은 학기마다
create or replace function public.enforce_plan_limit()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if (select count(*) from public.plans where user_id = new.user_id and semester_id = new.semester_id) >= 30 then
    raise exception '계획은 30개까지 넣을 수 있어요. 끝난 계획을 지운 뒤 다시 추가하세요.'
      using errcode = 'P0030';
  end if;
  return new;
end;
$function$;

-- 5) RLS: 내 것 중 지금 학기 것만
drop policy "plans: own" on public.plans;
create policy "plans: own current semester" on public.plans for all
  using (user_id = (select auth.uid()) and semester_id = (select public.current_semester_id()))
  with check (user_id = (select auth.uid()) and semester_id = (select public.current_semester_id()));
drop policy "user_certificates: own" on public.user_certificates;
create policy "user_certificates: own current semester" on public.user_certificates for all
  using (user_id = (select auth.uid()) and semester_id = (select public.current_semester_id()))
  with check (user_id = (select auth.uid()) and semester_id = (select public.current_semester_id()));
drop policy "study_logs: own" on public.study_logs;
create policy "study_logs: own current semester" on public.study_logs for all
  using (user_id = (select auth.uid()) and semester_id = (select public.current_semester_id()))
  with check (user_id = (select auth.uid()) and semester_id = (select public.current_semester_id()));

-- 6) 새 사용자: 첫 학기를 만들어 둬요
create or replace function public.create_first_semester()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  sid uuid;
begin
  if new.current_semester_id is null then
    insert into public.semesters (user_id, semester_start, available_hours, daily_hours, midterm_week, final_week, study_style)
    values (new.user_id, new.semester_start, new.available_hours, new.daily_hours, new.midterm_week, new.final_week, new.study_style)
    returning id into sid;
    update public.profiles set current_semester_id = sid where user_id = new.user_id;
  end if;
  return null;
end;
$function$;
create trigger profiles_first_semester after insert on public.profiles for each row execute function public.create_first_semester();

-- 학기 설정을 바꾸면 지금 학기 행에도 저장
create or replace function public.sync_current_semester()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  if new.current_semester_id is not null then
    update public.semesters
       set semester_start = new.semester_start, available_hours = new.available_hours, daily_hours = new.daily_hours,
           midterm_week = new.midterm_week, final_week = new.final_week, study_style = new.study_style
     where id = new.current_semester_id;
  end if;
  return null;
end;
$function$;
create trigger profiles_sync_semester after update of semester_start, available_hours, daily_hours, midterm_week, final_week, study_style, current_semester_id
  on public.profiles for each row execute function public.sync_current_semester();

-- 7) 학기 바꾸기: 고른 학기의 설정을 지금 설정으로 가져와요.
--    떠나는 학기가 설정도 안 끝낸 빈 학기(개강일 없음·계획·자격증·기록 없음)면 지워요 (다음 학기 시작을 눌렀다가 돌아온 경우)
create or replace function public.switch_semester(target uuid)
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  uid uuid := auth.uid();
  leaving uuid;
  s public.semesters;
begin
  if uid is null then
    raise exception '로그인이 필요해요.' using errcode = '42501';
  end if;
  select * into s from public.semesters where id = target and user_id = uid;
  if not found then
    raise exception '학기를 찾을 수 없어요.' using errcode = 'P0041';
  end if;
  select current_semester_id into leaving from public.profiles where user_id = uid;
  update public.profiles
     set current_semester_id = s.id, semester_start = s.semester_start, available_hours = s.available_hours, daily_hours = s.daily_hours,
         midterm_week = s.midterm_week, final_week = s.final_week, study_style = s.study_style
   where user_id = uid;
  if leaving is not null and leaving <> target then
    delete from public.semesters l
     where l.id = leaving and l.semester_start is null
       and not exists (select 1 from public.plans where semester_id = l.id)
       and not exists (select 1 from public.user_certificates where semester_id = l.id)
       and not exists (select 1 from public.study_logs where semester_id = l.id);
  end if;
end;
$function$;
revoke all on function public.switch_semester(uuid) from public, anon;
grant execute on function public.switch_semester(uuid) to authenticated;

-- 8) 다음 학기 시작: 이제 아무것도 지우지 않고 새 학기를 만들어요 (지금 학기는 그대로 보관, 위 메뉴에서 돌아갈 수 있어요).
--    쓸 수 있는 시간·시험 주차·공부 스타일은 이어서 쓰고, 개강일만 비워서 온보딩으로. 체험 계정(정새내)은 지금처럼 전부 초기화
create or replace function public.start_next_semester()
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  uid uuid := auth.uid();
  p public.profiles;
  sid uuid;
begin
  if uid is null then
    raise exception '로그인이 필요해요.' using errcode = '42501';
  end if;
  if uid = 'a0000000-0000-4000-8000-000000000005'::uuid then
    perform public.reset_my_data();
    return;
  end if;
  select * into p from public.profiles where user_id = uid;
  insert into public.semesters (user_id, semester_start, available_hours, daily_hours, midterm_week, final_week, study_style)
  values (uid, null, p.available_hours, p.daily_hours, p.midterm_week, p.final_week, p.study_style)
  returning id into sid;
  update public.profiles set current_semester_id = sid, semester_start = null where user_id = uid;
end;
$function$;

-- 9) 데이터 초기화(체험 계정용)는 다른 학기까지 정리
create or replace function public.reset_my_data()
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  uid uuid := auth.uid();
  demo boolean := uid = 'a0000000-0000-4000-8000-000000000005'::uuid;
begin
  if uid is null then
    raise exception '로그인이 필요해요.' using errcode = '42501';
  end if;

  delete from public.study_logs where user_id = uid;
  delete from public.plans where user_id = uid;
  delete from public.user_certificates where user_id = uid;
  delete from public.plan_categories where user_id = uid;
  delete from public.certificates where owner_id = uid;
  delete from public.semesters s where s.user_id = uid and s.id <> (select current_semester_id from public.profiles where user_id = uid);

  if demo then
    delete from public.ai_usage where user_id = uid;
    perform set_config('hakgi.demo_reset', 'on', true);
  end if;
  update public.profiles
     set semester_start = null,
         available_hours = null,
         daily_hours = null,
         privacy_agreed_at = case when demo then null else privacy_agreed_at end,
         midterm_week = 8,
         final_week = 15,
         study_style = 'steady'
   where user_id = uid;
  perform set_config('hakgi.demo_reset', 'off', true);
end;
$function$;
