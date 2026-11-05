-- 온보딩 2단계 저장을 한 번에 (11/02) — 계획·자격증을 트랜잭션 하나로 넣어서, 중간에 실패하면 아무것도 저장되지 않아요.
-- 직접 쓴 자격증은 이름·시험일이 같은 내 자격증이 있으면 그걸 다시 써요 (학기를 바꾸거나 초기화해도 직접 추가한 자격증은 남아 있어요).
-- security invoker: RLS·계획 30개·직접 추가 20개 상한이 화면에서 넣을 때와 똑같이 적용돼요.
create or replace function public.save_onboarding_plans(plans jsonb, certificates jsonb)
returns void
language plpgsql
security invoker
set search_path to ''
as $function$
declare
  uid uuid := auth.uid();
  today date := (now() at time zone 'Asia/Seoul')::date;
  item jsonb;
  cert_id uuid;
  cert_name text;
  exam date;
  round_name text;
begin
  if uid is null then
    raise exception '로그인이 필요해요.' using errcode = '42501';
  end if;

  insert into public.plans (title, type, credits, load_level, start_week, end_week, hours_per_week, start_date, end_date, priority, category_id, no_exam, exam_only, study_days)
  select p.title, p.type, p.credits, p.load_level, p.start_week, p.end_week, p.hours_per_week, p.start_date, p.end_date, p.priority, p.category_id, coalesce(p.no_exam, false), p.exam_only, p.study_days
    from jsonb_populate_recordset(null::public.plans, save_onboarding_plans.plans) p;

  for item in select * from jsonb_array_elements(save_onboarding_plans.certificates) loop
    cert_id := (item ->> 'certificate_id')::uuid;
    if cert_id is not null then
      -- 목록에서 고른 회차: 안 보이는 회차·접수가 끝난 공용 회차는 넣지 않아요 (직접 추가한 건 이미 접수했을 수 있어서 통과)
      select c.id into cert_id from public.certificates c
       where c.id = cert_id and (c.owner_id is not null or c.apply_end >= today);
      if cert_id is null then
        raise exception '접수가 끝났거나 찾을 수 없는 회차예요.' using errcode = 'P0043';
      end if;
    else
      cert_name := left(btrim(item ->> 'name'), 30);
      exam := (item ->> 'exam_date')::date;
      select c.id into cert_id from public.certificates c
       where c.owner_id = uid and c.name = cert_name and c.exam_date = exam
       limit 1;
      if cert_id is null then
        round_name := extract(month from exam)::int || '월 ' || extract(day from exam)::int || '일 시험';
        -- 같은 날짜의 다른 해 회차가 이미 있으면 해를 붙여 구분
        if exists (select 1 from public.certificates c where c.owner_id = uid and c.name = cert_name and c.round = round_name) then
          round_name := extract(year from exam)::int || '년 ' || round_name;
        end if;
        insert into public.certificates (name, round, apply_start, apply_end, exam_date, prep_weeks, default_study_hours, source_url)
        values (cert_name, round_name, today, greatest(exam - 1, today), exam, (item ->> 'prep_weeks')::smallint, (item ->> 'study_hours')::smallint, null)
        returning id into cert_id;
      end if;
    end if;

    insert into public.user_certificates (certificate_id, prep_weeks, study_hours)
    values (cert_id, (item ->> 'prep_weeks')::smallint, (item ->> 'study_hours')::smallint)
    on conflict (user_id, certificate_id, semester_id)
    do update set prep_weeks = excluded.prep_weeks, study_hours = excluded.study_hours;
  end loop;
end;
$function$;

revoke all on function public.save_onboarding_plans(jsonb, jsonb) from public, anon;
grant execute on function public.save_onboarding_plans(jsonb, jsonb) to authenticated;
