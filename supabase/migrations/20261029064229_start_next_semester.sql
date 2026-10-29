-- 다음 학기 시작 (10/28) — "데이터 초기화" 대신. 이번 학기 것만 정리하고 이어서 쓸 설정은 남겨요.
-- 정리: 계획·공부 기록·시험이 지난 자격증 선택·개강일 / 남김: 쓸 수 있는 시간·공부 스타일·시험 주차·내 유형·
-- 앞으로 볼 자격증·직접 추가한 자격증·개인정보 동의·AI 횟수.
-- 체험 계정(정새내)은 시연용으로 지금처럼 전부 지워요 (reset_my_data 와 같음).
create or replace function public.start_next_semester()
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception '로그인이 필요해요.' using errcode = '42501';
  end if;
  if uid = 'a0000000-0000-4000-8000-000000000005'::uuid then
    perform public.reset_my_data();
    return;
  end if;

  delete from public.study_logs where user_id = uid;
  delete from public.plans where user_id = uid;
  delete from public.user_certificates uc
   using public.certificates c
   where uc.user_id = uid and c.id = uc.certificate_id and c.exam_date < (now() at time zone 'Asia/Seoul')::date;
  update public.profiles set semester_start = null where user_id = uid;
end;
$function$;

revoke all on function public.start_next_semester() from public, anon;
grant execute on function public.start_next_semester() to authenticated;
