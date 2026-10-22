-- 가입은 Google 계정만 (팀 결정 2026-10-13). 데모 계정(*@hakgi.test)은 예외.
-- Supabase Auth 의 "Before User Created" 훅으로 씁니다: 계정이 만들어지기 직전에 이 함수가 검사하고,
-- 오류를 돌려주면 가입이 막힙니다. 대시보드 Authentication → Auth Hooks 에서 이 함수를 연결해야 동작해요.
-- 시드(seed.sql)는 auth.users 에 직접 넣으므로 이 훅을 거치지 않습니다.

create or replace function public.hook_google_only_signup(event jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  provider text := event->'user'->'app_metadata'->>'provider';
  email text := lower(coalesce(event->'user'->>'email', ''));
begin
  if provider = 'google' or email like '%@hakgi.test' then
    return '{}'::jsonb;
  end if;

  return jsonb_build_object(
    'error', jsonb_build_object(
      'http_code', 403,
      'message', '학기예보는 Google 계정으로만 가입할 수 있어요. 로그인 화면의 "Google 계정으로 계속하기"를 눌러 주세요.'
    )
  );
end;
$$;

comment on function public.hook_google_only_signup(jsonb) is
  'Auth Hook(Before User Created): Google 가입과 데모 계정(@hakgi.test)만 허용';

-- Supabase Auth 만 부를 수 있게 (API 로 직접 호출 금지)
grant execute on function public.hook_google_only_signup(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_google_only_signup(jsonb) from public, anon, authenticated;
