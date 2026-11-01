-- 이번 학기 초기화 (11/01) — 현재 학기의 계획·공부 기록·선택한 자격증을 지우고 온보딩 화면으로 이동
-- 내 유형(plan_categories)과 직접 추가한 자격증(certificates), 개인정보 동의 및 AI 사용 횟수는 유지됩니다.
create or replace function public.reset_current_semester()
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  uid uuid := auth.uid();
  cur_sem_id uuid;
begin
  if uid is null then
    raise exception '로그인이 필요해요.' using errcode = '42501';
  end if;

  -- 현재 보고 있는 학기 id 가져오기 (semesters 구조 지원)
  select current_semester_id into cur_sem_id from public.profiles where user_id = uid;

  if cur_sem_id is not null then
    -- 현재 학기의 데이터 삭제
    delete from public.study_logs where user_id = uid and semester_id = cur_sem_id;
    delete from public.plans where user_id = uid and semester_id = cur_sem_id;
    delete from public.user_certificates where user_id = uid and semester_id = cur_sem_id;

    -- 현재 학기 설정 초기화
    update public.semesters
       set semester_start = null,
           available_hours = null,
           daily_hours = null,
           midterm_week = 8,
           final_week = 15,
           study_style = 'steady'
     where id = cur_sem_id;
  else
    -- 단일 학기 레거시 fallback
    delete from public.study_logs where user_id = uid;
    delete from public.plans where user_id = uid;
    delete from public.user_certificates where user_id = uid;
  end if;

  -- profiles의 학기 설정도 비워 온보딩 가드가 바로 온보딩으로 보내도록 함
  update public.profiles
     set semester_start = null,
         available_hours = null,
         daily_hours = null,
         midterm_week = 8,
         final_week = 15,
         study_style = 'steady'
   where user_id = uid;
end;
$function$;

revoke all on function public.reset_current_semester() from public, anon;
grant execute on function public.reset_current_semester() to authenticated;
