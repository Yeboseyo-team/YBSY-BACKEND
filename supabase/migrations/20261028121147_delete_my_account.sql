-- 회원 탈퇴 (10/28) — 개인정보처리방침 "탈퇴하면 모든 정보를 바로 삭제" 를 실제 기능으로.
-- 로그인 계정(auth.users)을 지우면 profiles → 계획·자격증 선택·기록·내 유형·직접 추가한 자격증·AI 사용 횟수가 모두 함께 지워져요 (ON DELETE CASCADE).
-- 데모 계정(@hakgi.test)은 시연·테스트용이라 탈퇴를 막아요 (데이터 초기화는 가능).
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path to ''
as $function$
declare
  uid uuid := auth.uid();
  mail text;
begin
  if uid is null then
    raise exception '로그인이 필요해요.' using errcode = '42501';
  end if;
  select email into mail from auth.users where id = uid;
  if mail like '%@hakgi.test' then
    raise exception '데모 계정은 탈퇴할 수 없어요. 설정의 데이터 초기화를 써 주세요.' using errcode = 'P0040';
  end if;
  delete from auth.users where id = uid;
end;
$function$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
