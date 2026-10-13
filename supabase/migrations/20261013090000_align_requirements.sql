-- 요구사항 명세서(2026-10-13) 5장 데이터 요구사항에 맞춤
--
-- plans             : 계획명 30자, credits·load_level 추가(F-03), 주당 시간 0.5~60(0.5 단위),
--                     user_id → profiles 참조, 사용자당 30개 상한(FR-02-5)
-- certificates      : default_study_hours smallint 1~40 기본 8, 로그인 사용자만 조회(5.5)
-- user_certificates : study_hours smallint 1~40, prep_weeks(FR-04-3)·notified_at(F-07) 추가,
--                     user_id → profiles 참조, 접수 마감된 회차 선택 차단(FR-04-2)

-- ── plans ─────────────────────────────────────────────
alter table public.plans drop constraint plans_title_check;
alter table public.plans add constraint plans_title_check
  check (char_length(title) between 1 and 30);

alter table public.plans drop constraint plans_hours_per_week_check;
alter table public.plans add constraint plans_hours_per_week_check
  check (hours_per_week between 0.5 and 60 and mod(hours_per_week * 2, 1) = 0);

alter table public.plans
  add column credits smallint check (credits between 1 and 4),
  add column load_level text not null default 'normal'
    check (load_level in ('low', 'normal', 'high', 'custom'));

-- 학점은 수업에만, 수업이면 필수 (기존 수업 행은 3학점으로 채움)
update public.plans set credits = 3 where type = 'class' and credits is null;
alter table public.plans add constraint plans_credits_class_only
  check ((type = 'class') = (credits is not null));

-- profiles 를 참조해야 supabase-js 에서 profiles 와 바로 조인됨 (profiles 는 auth.users 삭제 시 cascade)
alter table public.plans drop constraint plans_user_id_fkey;
alter table public.plans add constraint plans_user_id_fkey
  foreign key (user_id) references public.profiles (user_id) on delete cascade;

-- FR-02-5 사용자당 계획 최대 30개
create or replace function public.enforce_plan_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.plans where user_id = new.user_id) >= 30 then
    raise exception '계획은 최대 30개까지 등록할 수 있어요. 기존 계획을 정리한 뒤 다시 추가해 주세요.'
      using errcode = 'P0001', hint = 'plan_limit';
  end if;
  return new;
end;
$$;

create trigger plans_enforce_limit
  before insert on public.plans
  for each row execute function public.enforce_plan_limit();

-- ── certificates ──────────────────────────────────────
alter table public.certificates drop constraint certificates_default_study_hours_check;
alter table public.certificates
  alter column default_study_hours drop default,
  alter column default_study_hours type smallint using round(default_study_hours)::smallint,
  alter column default_study_hours set default 8;
alter table public.certificates add constraint certificates_default_study_hours_check
  check (default_study_hours between 1 and 40);

-- 5.5 조회는 로그인 사용자만
drop policy "certificates: read" on public.certificates;
create policy "certificates: read" on public.certificates
  for select to authenticated using (true);
revoke all on public.certificates from anon;

-- ── user_certificates ─────────────────────────────────
alter table public.user_certificates drop constraint user_certificates_study_hours_check;
alter table public.user_certificates
  alter column study_hours type smallint using round(study_hours)::smallint;
alter table public.user_certificates add constraint user_certificates_study_hours_check
  check (study_hours between 1 and 40);

-- 사용자별 준비 기간: 기존 행은 회차 기본값으로 채움
alter table public.user_certificates add column prep_weeks smallint check (prep_weeks between 1 and 16);
update public.user_certificates uc
  set prep_weeks = c.prep_weeks
  from public.certificates c
  where c.id = uc.certificate_id and uc.prep_weeks is null;
alter table public.user_certificates alter column prep_weeks set not null;

alter table public.user_certificates add column notified_at timestamptz;  -- F-07 마감 알림 발송 시각

alter table public.user_certificates drop constraint user_certificates_user_id_fkey;
alter table public.user_certificates add constraint user_certificates_user_id_fkey
  foreign key (user_id) references public.profiles (user_id) on delete cascade;

-- FR-04-2 접수 마감이 지난 회차는 선택 불가.
-- 앱 사용자(auth.uid() 있음)에게만 적용 → 시드·대시보드 입력은 날짜와 무관하게 동작
create or replace function public.enforce_open_round()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select auth.uid()) is not null
     and (tg_op = 'INSERT' or new.certificate_id is distinct from old.certificate_id)
     and exists (
       select 1 from public.certificates c
       where c.id = new.certificate_id
         and c.apply_end < (now() at time zone 'Asia/Seoul')::date
     ) then
    raise exception '접수가 마감된 회차예요. 다른 회차를 선택해 주세요.'
      using errcode = 'P0001', hint = 'round_closed';
  end if;
  return new;
end;
$$;

create trigger user_certificates_enforce_open_round
  before insert or update on public.user_certificates
  for each row execute function public.enforce_open_round();

-- 트리거 전용 함수는 API(RPC)로 직접 호출하지 못하게
revoke execute on function public.enforce_plan_limit() from public, anon, authenticated;
revoke execute on function public.enforce_open_round() from public, anon, authenticated;
