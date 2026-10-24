-- F-08 AI 소요 시간 추정 (FR-08-1) — 사용 횟수 제한
-- 공개 사이트라 누가 버튼을 계속 누르면 Claude API 비용이 나가므로, 사용자당 하루(한국 날짜) 횟수를 셉니다.
-- 화면·API 에서 이 표를 직접 읽거나 쓰지 못하게 하고(RLS 켜고 정책 없음), 아래 함수로만 1회씩 씁니다.
create table public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  count integer not null default 0,
  primary key (user_id, day)
);

alter table public.ai_usage enable row level security;
revoke all on public.ai_usage from public, anon, authenticated;

-- 로그인한 사용자의 오늘 횟수를 1 올리고 남은 횟수를 돌려줍니다. 다 쓰면 P0031 오류.
-- Edge Function(estimate-hours)이 사용자 토큰으로 부릅니다.
create function public.consume_ai_quota()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  today date := (now() at time zone 'Asia/Seoul')::date;
  used integer;
  daily_limit constant integer := 20;  -- 인자로 받지 않음 (사용자가 직접 불러 늘리지 못하게)
begin
  if uid is null then
    raise exception '로그인이 필요해요.' using errcode = '42501';
  end if;

  insert into public.ai_usage as u (user_id, day, count)
  values (uid, today, 1)
  on conflict (user_id, day) do update set count = u.count + 1
  returning u.count into used;

  if used > daily_limit then
    raise exception 'AI 추천은 하루 %번까지 쓸 수 있어요. 내일 다시 시도하세요.', daily_limit
      using errcode = 'P0031';
  end if;

  return daily_limit - used;
end;
$$;

revoke execute on function public.consume_ai_quota() from public, anon;
grant execute on function public.consume_ai_quota() to authenticated;
