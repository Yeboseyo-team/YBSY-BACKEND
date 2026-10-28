-- 데이터 초기화를 모든 사용자에게 (10/27) — 설정 → [데이터 초기화] → 초기 설정(온보딩)으로
-- 내 계획·자격증·기록·내 유형·직접 추가한 자격증을 지우고 학기 설정을 비워요.
-- 일반 사용자는 개인정보 동의와 AI 하루 횟수는 그대로 둬요 (횟수 제한을 초기화로 피하지 못하게).
-- 체험 계정(정새내)만 시연용으로 동의·AI 횟수까지 지워요.
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

revoke all on function public.reset_my_data() from public, anon;
grant execute on function public.reset_my_data() to authenticated;
