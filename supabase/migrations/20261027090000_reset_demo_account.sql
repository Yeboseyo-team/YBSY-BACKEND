-- 체험 계정(정새내, newbie@hakgi.test) 데이터 초기화 (10/27)
-- 시연·테스트 때마다 온보딩 전 상태로 되돌리려고 만들었어요. 그 계정으로 로그인했을 때만 동작합니다.

-- 개인정보 동의 시각은 원래 한 번 넣으면 못 지우는데, 초기화 함수 안에서만 지울 수 있게 해요.
-- (hakgi.demo_reset 은 아래 security definer 함수 안에서만 켜지고, 일반 요청(authenticated)에서는 무시)
create or replace function public.stamp_privacy_agreed_at()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  if current_setting('hakgi.demo_reset', true) = 'on' and current_user not in ('authenticated', 'anon') then
    return new;
  end if;
  if old.privacy_agreed_at is not null then
    new.privacy_agreed_at := old.privacy_agreed_at;
  elsif new.privacy_agreed_at is not null then
    new.privacy_agreed_at := now();
  end if;
  return new;
end;
$function$;

create or replace function public.reset_demo_account()
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  uid uuid := auth.uid();
begin
  if uid is distinct from 'a0000000-0000-4000-8000-000000000005'::uuid then
    raise exception '체험 계정에서만 초기화할 수 있어요.' using errcode = '42501';
  end if;

  delete from public.study_logs where user_id = uid;
  delete from public.plans where user_id = uid;
  delete from public.user_certificates where user_id = uid;
  delete from public.plan_categories where user_id = uid;
  delete from public.certificates where owner_id = uid;
  delete from public.ai_usage where user_id = uid;

  perform set_config('hakgi.demo_reset', 'on', true);
  update public.profiles
     set semester_start = null,
         available_hours = null,
         daily_hours = null,
         privacy_agreed_at = null,
         midterm_week = 8,
         final_week = 15,
         study_style = 'steady'
   where user_id = uid;
  perform set_config('hakgi.demo_reset', 'off', true);
end;
$function$;

revoke all on function public.reset_demo_account() from public, anon;
grant execute on function public.reset_demo_account() to authenticated;
